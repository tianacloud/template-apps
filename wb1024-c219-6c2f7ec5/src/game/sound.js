// game/sound.js
// 轻量音效：WebAudio 合成，无外部文件（离线可玩）。需在用户手势后才能发声，
// 故首次交互时 unlockAudio()，并在播放前若被挂起则 resume()。

let ctx = null;

// 在用户手势中调用：创建（首次）并恢复 AudioContext
export function unlockAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch (_) {
    /* 某些环境不支持 WebAudio，静默降级 */
  }
}

function tone(freq, startOffset, dur, gain = 0.2, type = 'sine') {
  if (!ctx) return;
  const t0 = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  // 轻缓的 attack / decay，避免爆音
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// 通关音效：明亮上行三音（C5 → E5 → G5），带一点泛音更「清脆」
export function playChime() {
  unlockAudio();
  if (!ctx) return;
  tone(523.25, 0.0, 0.5, 0.18, 'sine');   // C5
  tone(659.25, 0.12, 0.5, 0.16, 'sine');  // E5
  tone(783.99, 0.24, 0.7, 0.16, 'triangle'); // G5
}

// 可选：擦拭清除单块污渍时的极轻反馈（短促高频 click）
export function playTick() {
  unlockAudio();
  if (!ctx) return;
  tone(880, 0, 0.08, 0.05, 'square');
}

// ---------- 擦拭音效：不同工具音色不同 ----------
let _noise = null;
let _lastWipe = 0;

function noiseBuffer() {
  if (_noise) return _noise;
  if (!ctx) return null;
  const len = Math.floor(ctx.sampleRate * 0.4);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  _noise = buf;
  return buf;
}

// 擦拭时按当前工具发出不同音效：
//   🧽 干擦 = 柔和低频「唰」；🪥 刷子 = 较硬中频「刷」；💧 喷水 = 高频「呲」+ 颤动。
// 内部节流，避免每帧重复触发；轻微随机化音量与频率，避免单调。
export function playWipe(tool = 'wipe') {
  unlockAudio();
  if (!ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  if (now - _lastWipe < 0.08) return; // 约 12 次/秒
  _lastWipe = now;

  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  src.loop = true;
  const filt = ctx.createBiquadFilter();
  const g = ctx.createGain();

  let dur = 0.13, peak = 0.15;
  if (tool === 'spray') {
    filt.type = 'highpass'; filt.frequency.value = 2400; filt.Q.value = 0.7;
    dur = 0.22; peak = 0.13;
    // 颤动让喷水更真实
    const lfo = ctx.createOscillator(); const lg = ctx.createGain();
    lfo.frequency.value = 28; lg.gain.value = 0.06;
    lfo.connect(lg).connect(g.gain); lfo.start(now); lfo.stop(now + dur);
  } else if (tool === 'brush') {
    filt.type = 'bandpass'; filt.frequency.value = 1500; filt.Q.value = 0.7;
    dur = 0.15; peak = 0.2;
  } else { // wipe
    filt.type = 'bandpass'; filt.frequency.value = 650; filt.Q.value = 0.6;
    dur = 0.12; peak = 0.15;
  }

  src.connect(filt); filt.connect(g); g.connect(ctx.destination);
  const r = 0.85 + Math.random() * 0.3; // 轻微随机
  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(peak * r, now + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0008, now + dur);
  src.start(now); src.stop(now + dur + 0.02);
}
