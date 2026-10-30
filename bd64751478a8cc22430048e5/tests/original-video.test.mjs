import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {demuxOriginalClip, playDecodedClip} from '../src/original-video.js';

test('MP4 extraction preserves presentation order, codec configuration and duration', async () => {
  // A synthetic 16px black test clip, independently encoded with H.264 B-frames.
  const data = await readFile(new URL('./fixtures/timing.mp4', import.meta.url));
  const clip = await demuxOriginalClip(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
  assert.equal(clip.samples.length, 4); assert.equal(clip.duration, 1e6);
  assert.equal(clip.config.codedWidth, 16); assert.equal(clip.config.codedHeight, 16);
  assert.match(clip.config.codec, /^avc1\./); assert.ok(clip.config.description.byteLength > 8);
  assert.equal(clip.samples[0].type, 'key');
  const presentation = [...clip.samples].sort((a, b) => a.timestamp - b.timestamp);
  assert.deepEqual(presentation.map(s => s.timestamp - clip.origin), [0, 250000, 500000, 750000]);
  assert.deepEqual(presentation.map(s => s.duration), [250000, 250000, 250000, 250000]);
  await assert.rejects(demuxOriginalClip(new ArrayBuffer(0)), /不完整/);
});

function playerFixture(count = 3) {
  let callback, decoder, open = 0, maxOpen = 0;
  const frames = [], drawn = [], errors = [];
  class Decoder {
    state = 'unconfigured'; decodeQueueSize = 0;
    constructor(init) { this.init = init; decoder = this; }
    configure() { this.state = 'configured'; }
    decode(chunk) {
      this.decodeQueueSize++;
      queueMicrotask(() => {
        this.decodeQueueSize--;
        if (this.state === 'closed') return;
        const frame = {timestamp: chunk.timestamp, closed: false,
          close() { assert.equal(this.closed, false, 'a frame must close exactly once'); this.closed = true; open--; }};
        frames.push(frame); open++; maxOpen = Math.max(maxOpen, open); this.init.output(frame);
      });
    }
    async flush() { await new Promise(resolve => queueMicrotask(resolve)); }
    close() { this.state = 'closed'; }
  }
  const canvas = {dataset: {}, getContext: () => ({drawImage: frame => drawn.push(frame.timestamp)})};
  const samples = Array.from({length: count}, (_, i) => ({type: i ? 'delta' : 'key', timestamp: i * 100000, duration: 100000, data: new Uint8Array([i])}));
  if (count === 3) [samples[1], samples[2]] = [samples[2], samples[1]];
  const close = playDecodedClip(canvas, {config: {codedWidth: 180, codedHeight: 180}, samples, origin: 0, duration: count * 100000},
    {Decoder, Chunk: class {constructor(sample) {Object.assign(this, sample);}}, raf: cb => {callback = cb; return 1;},
      cancel: () => {callback = null;}, onError: e => errors.push(e)});
  return {canvas, drawn, errors, frames, close, decoder: () => decoder, maxOpen: () => maxOpen,
    async tick(ms) { await new Promise(resolve => setImmediate(resolve)); callback?.(ms); await new Promise(resolve => setImmediate(resolve)); }};
}

test('B-frames render by presentation timestamp and loop at the original duration', async () => {
  const f = playerFixture();
  await f.tick(0); await f.tick(100); await f.tick(200); await f.tick(300); await f.tick(301);
  assert.deepEqual(f.drawn, [0, 100000, 200000, 0]); assert.equal(f.canvas.dataset.loops, '1');
  f.close(); f.close();
  assert.equal(f.decoder().state, 'closed'); assert.ok(f.frames.every(frame => frame.closed));
  assert.deepEqual(f.errors, []);
});

test('long clips bound decoded-frame memory and close skipped frames and pending output', async () => {
  const f = playerFixture(100);
  await f.tick(0); await f.tick(700); await f.tick(1400);
  assert.ok(f.maxOpen() <= 8); assert.ok(f.drawn.length >= 2);
  f.close(); await new Promise(resolve => setImmediate(resolve));
  assert.ok(f.frames.every(frame => frame.closed)); assert.deepEqual(f.errors, []);
});

test('decoder failure stops animation and frees every buffered frame', async () => {
  const f = playerFixture(20); await f.tick(0);
  f.decoder().init.error(new Error('decode failed'));
  assert.equal(f.errors.length, 1); assert.equal(f.decoder().state, 'closed');
  assert.ok(f.frames.every(frame => frame.closed)); f.close();
});
