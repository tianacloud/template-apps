"""Read every original clip with ffprobe; report browser-relevant metadata.

This verifies the complete local source set. It does not stand in for hosted
playback, cloud storage acceptance, or a biomechanical assessment.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
from pathlib import Path
import subprocess


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--source', type=Path, required=True)
    args = parser.parse_args()
    root = args.root.resolve()
    manifest = json.loads((root / 'artifacts/original-media/v1/manifest.json').read_text())
    ids = list(manifest['items'])
    if len(ids) != 5632:
        raise ValueError('Complete catalogue required')

    def inspect(exercise):
        path = args.source.resolve() / 'catalogue/media/clip' / (exercise + '.mp4')
        command = ['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                   '-show_entries', 'stream=codec_name,width,height,pix_fmt,nb_frames,duration',
                   '-of', 'json', str(path)]
        try:
            result = subprocess.run(command, capture_output=True, text=True, timeout=20, check=True)
            stream = json.loads(result.stdout)['streams'][0]
            valid = (stream['codec_name'] == 'h264' and stream['pix_fmt'] == 'yuv420p'
                     and 0 < stream['width'] <= 180 and 0 < stream['height'] <= 180
                     and int(stream['nb_frames']) >= 1 and float(stream['duration']) > 0)
            return {'id': exercise, 'valid': valid, 'motion': int(stream['nb_frames']) > 1, **stream}
        except Exception as error:
            return {'id': exercise, 'valid': False, 'error': type(error).__name__}

    rows = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        jobs = [pool.submit(inspect, exercise) for exercise in ids]
        for job in as_completed(jobs):
            rows.append(job.result())
            if len(rows) % 500 == 0:
                print(json.dumps({'inspected': len(rows), 'total': len(ids)}), flush=True)
    rows.sort(key=lambda row: row['id'])
    invalid = [row['id'] for row in rows if not row['valid']]
    report = {'target': 5632, 'inspected': len(rows), 'valid': len(rows) - len(invalid),
              'invalid': invalid, 'multiFrameClips': sum(row.get('motion', False) for row in rows),
              'singleFrameClips': [row['id'] for row in rows if row.get('valid') and not row.get('motion')],
              'method': 'ffprobe stream metadata',
              'cloudAcceptance': False, 'clips': rows}
    output = root / 'analysis/media-rebuild/original-media/clip-metadata.json'
    output.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({key: value for key, value in report.items() if key != 'clips'}), flush=True)
    if invalid:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
