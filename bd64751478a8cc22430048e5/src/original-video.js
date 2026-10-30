// Original MP4 bytes are decoded locally, without transcoding or changing the
// assets. Canvas works with the host's restrictive media-src policy. The public
// synthetic showcase has no media directory and omits the demuxer entirely.
const loadMP4 = process.env.TIANA_DEMO === 'true' ? null : () => import('mp4box');

export async function demuxOriginalClip(bytes) {
  const {createFile, DataStream} = await loadMP4();
  const file = createFile();
  let clip, failure;
  file.onError = () => { failure = new Error('动作视频暂时无法读取'); };
  file.onReady = info => {
    const track = info.videoTracks[0];
    if (!track || !/^avc[13]\./.test(track.codec) || track.video.width > 180 || track.video.height > 180 || track.nb_samples > 1000) {
      failure = new Error('动作视频格式无效'); return;
    }
    const entries = file.getTrackById(track.id).mdia.minf.stbl.stsd.entries;
    const avcC = entries.find(entry => entry.avcC)?.avcC;
    if (!avcC) { failure = new Error('动作视频格式无效'); return; }
    const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
    avcC.write(stream);
    clip = {config: {codec: track.codec, codedWidth: track.video.width, codedHeight: track.video.height,
      description: new Uint8Array(stream.buffer.slice(8))}, samples: [], expected: track.nb_samples,
      duration: Math.round(1e6 * track.movie_duration / track.movie_timescale), timePrecision: 1e6 / track.movie_timescale};
    file.setExtractionOptions(track.id, null, {nbSamples: 1000});
    file.start();
  };
  file.onSamples = (_id, _ref, samples) => {
    for (const sample of samples) clip.samples.push({type: sample.is_sync ? 'key' : 'delta',
      timestamp: Math.round(1e6 * sample.cts / sample.timescale),
      duration: Math.round(1e6 * sample.duration / sample.timescale), data: sample.data});
  };
  const input = bytes.slice(0); input.fileStart = 0;
  file.appendBuffer(input); file.flush(); file.stop();
  if (failure) throw failure;
  if (!clip || !clip.samples.length || clip.samples.length !== clip.expected || clip.samples[0].type !== 'key' ||
    clip.samples.some(s => !Number.isSafeInteger(s.timestamp) || s.duration < 0 || !s.data?.byteLength)) throw new Error('动作视频不完整');
  clip.origin = Math.min(...clip.samples.map(s => s.timestamp));
  // MP4 sample duration describes decode order. These variable-rate H.264 clips
  // also contain B-frames and a zero-duration final decode sample. Presentation
  // duration comes from the next CTS (or the track end), not the next DTS.
  const presentation = [...clip.samples].sort((a, b) => a.timestamp - b.timestamp);
  for (let i = 0; i < presentation.length; i++) {
    presentation[i].duration = (presentation[i + 1]?.timestamp ?? clip.origin + clip.duration) - presentation[i].timestamp;
    if (presentation[i].duration <= 0) throw new Error('动作视频时间信息无效');
  }
  if (!(clip.duration > 0) || clip.duration > 120e6) throw new Error('动作视频时长无效');
  return clip;
}

// Keep a small queue of decoded frames instead of retaining the entire clip.
// Each drawn, skipped or abandoned VideoFrame is closed immediately.
export function playDecodedClip(canvas, clip, {Decoder = globalThis.VideoDecoder, Chunk = globalThis.EncodedVideoChunk,
  raf = requestAnimationFrame, cancel = cancelAnimationFrame, onError = () => {}} = {}) {
  const context = canvas.getContext('2d', {alpha: false});
  if (!context) throw new Error('动作演示暂时无法显示');
  canvas.width = clip.config.codedWidth; canvas.height = clip.config.codedHeight;
  const frames = [];
  let stopped = false, next = 0, done = false, flushing = false, feeding = false, originTime = null, animation;
  let decoder;
  const close = () => {
    if (stopped) return;
    stopped = true; cancel(animation);
    frames.splice(0).forEach(frame => frame.close());
    if (decoder?.state !== 'closed') decoder?.close();
  };
  const fail = error => { if (!stopped) { close(); onError(error); } };
  const feed = () => {
    if (stopped || feeding || flushing) return;
    feeding = true;
    try {
      while (next < clip.samples.length && frames.length + decoder.decodeQueueSize < 8) decoder.decode(new Chunk(clip.samples[next++]));
      if (next === clip.samples.length && !flushing) {
        flushing = true;
        decoder.flush().then(() => { if (!stopped) done = true; }, fail);
      }
    } catch (error) { fail(error); }
    finally { feeding = false; }
  };
  decoder = new Decoder({output(frame) {
    if (stopped) { frame.close(); return; }
    frames.push(frame); frames.sort((a, b) => a.timestamp - b.timestamp);
    feed();
  }, error: fail});
  decoder.configure(clip.config);
  const paint = now => {
    if (stopped) return;
    try {
      if (originTime === null && frames.length) originTime = now;
      const elapsed = originTime === null ? -1 : (now - originTime) * 1000;
      let current;
      while (frames.length && frames[0].timestamp - clip.origin <= elapsed) {
        current?.close(); current = frames.shift();
      }
      if (current) {
        try { context.drawImage(current, 0, 0, canvas.width, canvas.height); }
        finally { current.close(); }
        canvas.dataset.ready = 'true'; canvas.dataset.currentTime = String(elapsed / 1e6);
      }
      if (done && !frames.length && elapsed >= clip.duration) {
        next = 0; done = false; flushing = false; originTime = null;
        canvas.dataset.loops = String(Number(canvas.dataset.loops || 0) + 1);
      }
      feed(); animation = raf(paint);
    } catch (error) { fail(error); }
  };
  feed(); animation = raf(paint);
  return close;
}

export function startOriginalVideo(canvas, bytes, onError) {
  let stopped = false, dispose;
  (async () => {
    if (!globalThis.VideoDecoder || !globalThis.EncodedVideoChunk) throw Object.assign(new Error('当前浏览器仅显示图示'), {code: 'UNSUPPORTED'});
    const clip = await demuxOriginalClip(bytes);
    const supported = await VideoDecoder.isConfigSupported(clip.config);
    if (!supported.supported) throw Object.assign(new Error('当前浏览器仅显示图示'), {code: 'UNSUPPORTED'});
    if (!stopped) dispose = playDecodedClip(canvas, clip, {onError});
  })().catch(error => { if (!stopped) onError(error); });
  return () => { stopped = true; dispose?.(); };
}
