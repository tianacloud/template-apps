import { Input, ALL_FORMATS, BlobSource, CanvasSink } from 'mediabunny';

// Decode directly from the selected file with WebCodecs. No media URL or upload is needed.
export async function probeVideo(file) {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track || !(await track.canDecode())) throw new Error('浏览器不支持这个视频格式或编码');
    const start = await input.getFirstTimestamp([track]);
    const end = await input.computeDuration([track]);
    const duration = end - start;
    if (!Number.isFinite(duration) || duration <= 0) throw new Error('读不出视频时长');
    return {input, track, start, durationMs: Math.round(duration * 1000)};
  } catch (error) { input.dispose(); throw error; }
}

export async function extractFrames(video, timesMs, dw, dh, onStep) {
  const sink = new CanvasSink(video.track, {width: dw, height: dh, fit: 'cover'});
  const frames = [];
  const times = timesMs.map(ms => video.start + Math.max(0, Math.min(ms / 1000, video.durationMs / 1000 - 0.001)));
  for await (const frame of sink.canvasesAtTimestamps(times)) {
    if (!frame) throw new Error('无法读取视频帧');
    const ctx = frame.canvas.getContext('2d', {willReadFrequently: true});
    const rgba = ctx.getImageData(0, 0, dw, dh);
    frames.push(new Uint8Array(rgba.data.buffer));
    if (onStep) onStep(frames.length, times.length);
  }
  return frames;
}

export async function firstFrame(video, dw, dh) {
  const [frame] = await extractFrames(video, [0], dw, dh);
  return frame;
}
export function releaseVideo(video) { video?.input?.dispose(); }
