// Check the real source catalogue through the same parser used by the player.
// This proves extraction/timing, not browser decoding or cloud acceptance.
import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {demuxOriginalClip} from '../../src/original-video.js';
const args = process.argv.slice(2), option = key => args[args.indexOf(key) + 1];
if (!args.includes('--root') || !args.includes('--source')) throw new Error('Pass --root and --source');
const directory = resolve(option('--root'), 'analysis/media-rebuild/original-media');
const expected = JSON.parse(await readFile(resolve(directory, 'clip-metadata.json'), 'utf8'));
const report = {target: 5632, inspected: 0, valid: 0, invalid: [], codecs: {}, maxFrames: 0, maxDuration: 0, maxDurationDifferenceSeconds: 0, method: 'runtime MP4Box demux compared with independent ffprobe metadata; duration tolerance is one movie-timescale tick (1ms for these files)', cloudAcceptance: false};
for (const item of expected.clips) {
  try {
    const data = await readFile(resolve(option('--source'), item.id + '.mp4'));
    const clip = await demuxOriginalClip(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
    const difference = Math.abs(clip.duration / 1e6 - Number(item.duration));
    report.maxDurationDifferenceSeconds = Math.max(report.maxDurationDifferenceSeconds, difference);
    if (clip.samples.length !== Number(item.nb_frames) || clip.config.codedWidth !== item.width || clip.config.codedHeight !== item.height || difference > clip.timePrecision / 1e6 + .000001) throw new Error('Independent metadata mismatch');
    report.valid++; report.codecs[clip.config.codec] = (report.codecs[clip.config.codec] || 0) + 1;
    report.maxFrames = Math.max(report.maxFrames, clip.samples.length); report.maxDuration = Math.max(report.maxDuration, clip.duration / 1e6);
  } catch (error) { report.invalid.push({id: item.id, error: error.message}); }
  report.inspected++;
}
await writeFile(resolve(directory, 'decode-audit.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
if (report.valid !== 5632 || report.invalid.length) process.exitCode = 1;
