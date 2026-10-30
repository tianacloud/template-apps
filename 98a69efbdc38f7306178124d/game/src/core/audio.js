// 极简合成音效：不加载任何音频文件，全部用 WebAudio 现场生成。

let ctx = null;
let enabled = true;
let master = null;

export function initAudio() {
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);
  } catch (e) { enabled = false; }
}

export function setAudioEnabled(v) {
  enabled = v;
  if (master) master.gain.value = v ? 0.16 : 0;
}

function tone(freq, dur, type = 'sine', gain = 1, slide = 0) {
  if (!ctx || !enabled) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), ctx.currentTime + dur);
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  o.connect(g).connect(master);
  o.start();
  o.stop(ctx.currentTime + dur + 0.02);
}

function noise(dur, gain = 0.5, freq = 900) {
  if (!ctx || !enabled) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = 1.2;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(master);
  src.start();
}

export function sfx(name) {
  if (!ctx) return;
  switch (name) {
    case 'hit': noise(0.09, 0.5, 420); tone(120, 0.08, 'triangle', 0.5, -40); break;
    case 'crit': noise(0.14, 0.7, 300); tone(90, 0.16, 'sawtooth', 0.4, -30); break;
    case 'heal': tone(660, 0.18, 'sine', 0.35, 220); tone(990, 0.22, 'sine', 0.2, 120); break;
    case 'cast': tone(300, 0.12, 'sine', 0.25, 140); break;
    case 'interrupt': tone(180, 0.12, 'square', 0.3, -80); break;
    case 'levelup': [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.28, 'triangle', 0.35), i * 110)); break;
    case 'error': tone(160, 0.09, 'square', 0.18, -40); break;
    case 'loot': tone(880, 0.1, 'triangle', 0.25); setTimeout(() => tone(1180, 0.14, 'triangle', 0.22), 80); break;
    case 'death': tone(220, 0.5, 'sine', 0.35, -120); break;
    case 'portal': tone(180, 0.5, 'sine', 0.3, 260); break;
    case 'jump': tone(320, 0.12, 'sine', 0.22, 260); break;
    case 'land': noise(0.07, 0.3, 260); break;
    case 'quest': tone(720, 0.12, 'sine', 0.3); setTimeout(() => tone(960, 0.18, 'sine', 0.25), 100); break;
  }
}
