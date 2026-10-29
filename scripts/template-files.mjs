import { createHash } from "node:crypto";
import path from "node:path";

export const FILE_BYTES_LIMIT = 16 * 1024 * 1024;
const types = {
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".avif": "image/avif",
  ".pdf": "application/pdf", ".txt": "text/plain", ".json": "application/json", ".csv": "text/csv", ".md": "text/markdown",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".ogg": "audio/ogg", ".mp4": "video/mp4", ".webm": "video/webm",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf", ".glb": "model/gltf-binary", ".gltf": "model/gltf+json",
};
export function validateSeedPath(name) {
  if (typeof name !== "string" || !name || Buffer.byteLength(name) > 1024 || /[\\%\x00-\x1f\x7f-\x9f]/u.test(name) ||
      name.split("/").some(part => !part || part === "." || part === "..") || !Buffer.from(name).toString().includes(name))
    throw new Error(`Invalid template file path: ${name}`);
}
export function templateFileMaterials(files, metadata) {
  const names = Object.keys(files).filter(name => name === "template-files" || name.startsWith("template-files/"));
  if (!Object.hasOwn(metadata, "file_seeds")) {
    if (names.length) throw new Error("template-files requires file_seeds declaration");
    return null;
  }
  if (metadata.file_seeds !== "template-files") throw new Error("file_seeds must be template-files");
  if (!names.length || names.length > 256) throw new Error("template-files requires 1..256 files");
  names.sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
  const entries = [], materials = {};
  let total = 0;
  const paths = new Set();
  for (const name of names) {
    const relative = name.slice("template-files/".length);
    validateSeedPath(relative);
    const bytes = files[name];
    if (bytes.length > FILE_BYTES_LIMIT || (total += bytes.length) > FILE_BYTES_LIMIT) throw new Error("template-files exceeds 16 MiB");
    entries.push({ path: relative, size: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"), content_type: types[path.posix.extname(relative).toLowerCase()] ?? "application/octet-stream" });
    materials[`files/${relative}`] = bytes;
    paths.add(relative);
  }
  for (const name of paths) {
    const parts = name.split("/");
    for (let i = 1; i < parts.length; i++) if (paths.has(parts.slice(0, i).join("/"))) throw new Error("Template file conflicts with directory");
  }
  return { manifest: { version: 1, root: "template-assets/", entries }, materials };
}

// Inspect the clean build, including byte-identical copies and raw/base64
// embedding. This is a packaging gate; application behavior is also checked in
// acceptance because arbitrary transformations cannot be inferred from a bundle.
export function checkSeedBuildOutputs(siteFiles, seeds) {
  if (!seeds) return;
  for (const [name, data] of Object.entries(siteFiles)) {
    if (/(^|\/)(template-files|template-assets)(\/|$)/.test(name)) throw new Error(`External template files in Web build: ${name}`);
    if (name === "data/icon.png") continue;
    const output = Buffer.from(data);
    for (const [seed, bytes] of Object.entries(seeds.materials)) {
      const content = Buffer.from(bytes);
      if (content.length && (output.equals(content) || (content.length >= 16 && (output.includes(content) || output.includes(content.toString("base64"))))))
        throw new Error(`External template file embedded in Web build: ${seed} in ${name}`);
    }
  }
}

export function checkInstallBudgets(materials, sourceFiles, siteFiles, archiveBytes) {
  if (archiveBytes > 32 * 1024 * 1024) throw new Error("Installation package exceeds 32 MiB");
  const groups = [materials, sourceFiles, siteFiles];
  let bytes = 0, count = 0;
  for (const files of groups) for (const data of Object.values(files)) {
    if (data.length > FILE_BYTES_LIMIT) throw new Error("Installation material exceeds 16 MiB");
    bytes += data.length; count++;
  }
  if (bytes > 128 * 1024 * 1024 || count > 5000) throw new Error("Installation package exceeds recursive archive budget");
}

export function encodeInstallManifest(manifest, seeds) {
  if (!seeds) return { bytes: Buffer.from(JSON.stringify(manifest, null, 2) + "\n") };
  const rawFiles = JSON.stringify(seeds.manifest);
  const base = JSON.stringify({ ...manifest, format_version: 2, requires: ["template_files_v1"] }, null, 2);
  return {
    bytes: Buffer.from(base.slice(0, -1) + `,"files":${rawFiles}}\n`),
    file_manifest_sha256: createHash("sha256").update(rawFiles, "utf8").digest("hex"),
  };
}
