"""Verify and package unchanged 180px media for a personal openGym fork.

Input must be the pinned openGym source archive and its Git tree. Media stays
outside application source and is uploaded to the app's own Tiana file store.
The ZIPs use STORE: each referenced slice is the original, unchanged file.
"""

import argparse
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import zipfile

from PIL import Image

COMMIT = "e348fc17c42c7e9a211c5972e573ad3698190ee2"
APP = Path(__file__).resolve().parents[2]
PACK_LIMIT = 4 * 1024 * 1024


def movie_size(data):
    """Read the standard tkhd display dimensions without decoding the video."""
    def boxes(start, end):
        at = start
        while at + 8 <= end:
            size, kind = struct.unpack_from(">I4s", data, at)
            head = 8
            if size == 1:
                size = struct.unpack_from(">Q", data, at + 8)[0]
                head = 16
            if size == 0:
                size = end - at
            if size < head or at + size > end:
                raise ValueError("Invalid MP4 box")
            yield kind, at + head, at + size
            at += size

    for kind, start, end in boxes(0, len(data)):
        if kind != b"moov":
            continue
        for kind, start, end in boxes(start, end):
            if kind != b"trak":
                continue
            for kind, start, end in boxes(start, end):
                if kind == b"tkhd":
                    width, height = struct.unpack_from(">II", data, end - 8)
                    if width and height:
                        return width >> 16, height >> 16
    raise ValueError("Video display dimensions not found")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--source", type=Path, required=True)
    args = parser.parse_args()
    root = args.root.resolve()
    tree = json.loads((root / "analysis/upstream-tree.json").read_text())["tree"]
    tree = {entry["path"]: entry for entry in tree if entry["type"] == "blob"}
    code = "const x=await import(process.argv[1]);console.log(JSON.stringify(x.default.map(e=>e.id)))"
    ids = json.loads(subprocess.check_output(
        ["node", "--input-type=module", "-e", code, (APP / "src/catalogue.js").as_uri()], text=True))
    if len(ids) != 5632 or len(set(ids)) != 5632:
        raise ValueError("Expected the complete 5,632-exercise catalogue")
    output = root / "artifacts/original-media/v1"
    output.mkdir(parents=True, exist_ok=True)
    manifest = {"version": 1, "sourceCommit": COMMIT, "exerciseCount": len(ids),
                "notice": "NOTICE.md", "packs": [], "items": {exercise: [None, None] for exercise in ids}}
    audit = {"sourceCommit": COMMIT, "exerciseCount": len(ids), "assets": [],
             "missing": [], "originalFilesUnchanged": True, "maxDimension": 0}
    for kind, suffix, batch in [("still", "webp", 256), ("clip", "mp4", 64)]:
        selected, size = [], 0

        def flush():
            if not selected:
                return
            temp = output / (kind + "-pending.zip")
            refs = []
            with zipfile.ZipFile(temp, "w", compression=zipfile.ZIP_STORED) as archive:
                for exercise, data, digest in selected:
                    info = zipfile.ZipInfo(exercise + "." + suffix, date_time=(2026, 10, 1, 0, 0, 0))
                    info.compress_type = zipfile.ZIP_STORED
                    archive.writestr(info, data)
                    offset = info.header_offset + 30 + len(info.filename.encode()) + len(info.extra)
                    refs.append((exercise, offset, len(data), digest))
            content = temp.read_bytes()
            digest = hashlib.sha256(content).hexdigest()
            name = kind + "-" + digest[:20] + ".zip"
            if len(content) > PACK_LIMIT:
                raise ValueError("Resource pack exceeds its download bound")
            final = output / name
            if final.exists():
                if hashlib.sha256(final.read_bytes()).hexdigest() != digest:
                    raise ValueError("Content-addressed pack mismatch")
                temp.unlink()
            else:
                temp.rename(final)
            pack_id = len(manifest["packs"])
            manifest["packs"].append({"path": name, "bytes": len(content), "sha256": digest, "kind": kind})
            for exercise, offset, length, file_digest in refs:
                # Independent verification of the exact slices the browser will read.
                if hashlib.sha256(content[offset:offset + length]).hexdigest() != file_digest:
                    raise ValueError("ZIP payload offset mismatch")
                manifest["items"][exercise][0 if kind == "still" else 1] = [pack_id, offset, length]

        for exercise in ids:
            if not exercise.isdecimal() or len(exercise) > 8:
                raise ValueError("Invalid built-in exercise ID")
            relative = f"catalogue/media/{kind}/{exercise}.{suffix}"
            path = args.source / relative
            expected = tree.get(relative)
            if not path.is_file() or not expected:
                audit["missing"].append(relative)
                continue
            data = path.read_bytes()
            git_hash = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
            if len(data) != expected["size"] or git_hash != expected["sha"]:
                raise ValueError("Original source hash mismatch: " + relative)
            if kind == "still":
                with Image.open(path) as image:
                    width, height = image.size
                    if image.format != "WEBP" or getattr(image, "is_animated", False):
                        raise ValueError("Expected original WebP still")
            else:
                width, height = movie_size(data)
            if min(width, height) < 1 or max(width, height) > 180:
                raise ValueError("The non-commercial fork only retains original media up to 180px")
            digest = hashlib.sha256(data).hexdigest()
            audit["assets"].append({"path": relative, "sha256": digest, "gitBlob": git_hash,
                                    "bytes": len(data), "width": width, "height": height})
            audit["maxDimension"] = max(audit["maxDimension"], width, height)
            if selected and (len(selected) >= batch or size + len(data) + 65536 > PACK_LIMIT):
                flush()
                selected, size = [], 0
            selected.append((exercise, data, digest))
            size += len(data)
        flush()
    if audit["missing"] or any(None in refs for refs in manifest["items"].values()):
        raise ValueError("Cannot activate a partial media catalogue")
    for source, dest in [("NOTICE.md", "NOTICE.md"), ("catalogue/media/NOTICE.md", "MEDIA-NOTICE.md")]:
        (output / dest).write_bytes((args.source / source).read_bytes())
    (output / "manifest.json").write_text(json.dumps(manifest, separators=(",", ":")) + "\n")
    report = root / "analysis/media-rebuild/original-media"
    report.mkdir(exist_ok=True)
    (report / "verification.json").write_text(json.dumps(audit, indent=2) + "\n")
    print(json.dumps({"exercises": len(ids), "assets": len(audit["assets"]),
                      "packs": len(manifest["packs"]), "bytes": sum(p["bytes"] for p in manifest["packs"]),
                      "manifestBytes": (output / "manifest.json").stat().st_size,
                      "allOriginalHashesVerified": True, "maxDimension": audit["maxDimension"]}, indent=2))


if __name__ == "__main__":
    main()
