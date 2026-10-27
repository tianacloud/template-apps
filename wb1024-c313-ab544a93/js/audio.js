'use strict';
/**
 * WebAudio 提示音合成引擎
 * 零音频文件：所有音色实时合成，包体不增加任何体积
 * 6 个音色：水波 / 清铃 / 木鱼 / 微风 / 心跳 / 钟琴
 */

const SOUND_LIST = [
  { id: 'ripple',  name: '水波',   desc: '柔和涟漪，适合喝水提醒', kind: 'calm' },
  { id: 'bell',    name: '清铃',   desc: '明亮单音，适合番茄钟切换', kind: 'bright' },
  { id: 'wood',    name: '木鱼',   desc: '短促叩击，适合久坐提醒', kind: 'sharp' },
  { id: 'breeze',  name: '微风',   desc: '上行滑音，适合护眼提醒', kind: 'calm' },
  { id: 'heart',   name: '心跳',   desc: '双击脉冲，适合连续达标', kind: 'sharp' },
  { id: 'chime',   name: '钟琴',   desc: '长衰减泛音，适合全天总结', kind: 'bright' }
];

const SOUND_NAMES = SOUND_LIST.reduce((m, s) => (m[s.id] = s.name, m), {});

let ctx = null;
let master = null;

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function now() { return ensureCtx().currentTime; }

/** 带淡入淡出的包络 */
function envelope(node, opts) {
  const o = opts || {};
  const t0 = o.t0 !== undefined ? o.t0 : now();
  const atk = o.atk !== undefined ? o.atk : 0.008;
  const dur = o.dur !== undefined ? o.dur : 0.6;
  const peak = o.peak !== undefined ? o.peak : 0.3;
  const fadeIn = o.fade ? (o.fadeSec || 5) / 1000 : atk;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + fadeIn);
  g.gain.setValueAtTime(Math.max(peak, 0.0002), t0 + dur);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.12);
  node.connect(g);
  return g;
}

function tone(freq, opts) {
  const t0 = opts.t0;
  const osc = ctx.createOscillator();
  osc.type = opts.type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (opts.slideTo) {
    osc.frequency.exponentialRampToValueAtTime(opts.slideTo, t0 + (opts.slideDur || 0.3));
  }
  const g = envelope(osc, opts);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + (opts.dur || 0.6) + 0.2);
  return osc;
}

function noiseBurst(opts) {
  const t0 = opts.t0;
  const len = Math.max(1, Math.floor(ctx.sampleRate * (opts.dur || 0.3)));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;

  const flt = ctx.createBiquadFilter();
  flt.type = opts.filter || 'bandpass';
  flt.frequency.setValueAtTime(opts.freq || 800, t0);
  if (opts.freqTo) {
    flt.frequency.exponentialRampToValueAtTime(opts.freqTo, t0 + (opts.dur || 0.3));
  }
  flt.Q.value = opts.q || 1.2;

  src.connect(flt);
  const g = envelope(flt, opts);
  g.connect(master);
  src.start(t0);
  return src;
}

/* ============ 6 个音色定义 ============ */

const VOICES = {
  // 水波：低频正弦涟漪 + 水滴噪声
  ripple() {
    const t = now();
    [523.25, 392.00, 293.66].forEach((f, i) => {
      tone(f, { t0: t + i * 0.11, type: 'sine', dur: 0.55, peak: 0.24, fade: true, fadeSec: 5 });
    });
    noiseBurst({ t0: t, dur: 0.22, freq: 1400, freqTo: 380, q: 2.4, peak: 0.10, fade: true, fadeSec: 5 });
  },

  // 清铃：明亮的高音正弦 + 三次泛音
  bell() {
    const t = now();
    tone(1046.50, { t0: t, type: 'sine', dur: 0.75, peak: 0.26, fade: true, fadeSec: 5 });
    tone(2093.00, { t0: t, type: 'sine', dur: 0.45, peak: 0.10, fade: true, fadeSec: 5 });
    tone(3136.00, { t0: t + 0.005, type: 'sine', dur: 0.28, peak: 0.05, fade: true, fadeSec: 5 });
  },

  // 木鱼：极短的高频叩击 + 快速衰减
  wood() {
    const t = now();
    tone(1180, { t0: t, type: 'triangle', dur: 0.11, peak: 0.30, fade: false, atk: 0.002 });
    noiseBurst({ t0: t, dur: 0.09, freq: 2100, q: 3.2, peak: 0.16, fade: false, atk: 0.002 });
    tone(660, { t0: t + 0.14, type: 'triangle', dur: 0.09, peak: 0.14, fade: false, atk: 0.002 });
  },

  // 微风：上行滑音，柔和渐强
  breeze() {
    const t = now();
    tone(392.00, { t0: t, type: 'sine', slideTo: 880.00, slideDur: 0.55, dur: 0.62, peak: 0.20, fade: true, fadeSec: 5 });
    noiseBurst({ t0: t, dur: 0.6, freq: 500, freqTo: 2600, filter: 'lowpass', q: 0.8, peak: 0.06, fade: true, fadeSec: 5 });
  },

  // 心跳：两次低频脉冲
  heart() {
    const t = now();
    tone(70, { t0: t, type: 'sine', dur: 0.16, peak: 0.34, fade: true, fadeSec: 5 });
    tone(62, { t0: t + 0.20, type: 'sine', dur: 0.22, peak: 0.26, fade: true, fadeSec: 5 });
    tone(140, { t0: t, type: 'sine', dur: 0.10, peak: 0.10, fade: false, atk: 0.004 });
  },

  // 钟琴：多泛音长衰减
  chime() {
    const t = now();
    const base = 659.25;
    [1, 2.01, 3.03, 4.16, 5.43].forEach((mult, i) => {
      tone(base * mult, {
        t0: t + i * 0.008,
        type: 'sine',
        dur: 1.5 - i * 0.16,
        peak: 0.22 / (i + 1.15),
        fade: true,
        fadeSec: 5
      });
    });
  }
};

/**
 * 播放提示音
 * @param {string} id     音色 id
 * @param {object} cfg    { volume, muted, fade, fadeSec }
 */
function play(id, cfg) {
  if (!cfg || cfg.muted) return false;
  const fn = VOICES[id];
  if (!fn) return false;
  ensureCtx();
  const prev = master.gain.value;
  master.gain.value = (cfg.volume !== undefined ? cfg.volume : 0.7);
  try {
    fn();
  } catch (e) {
    console.error('[audio] 播放失败:', e.message);
  }
  setTimeout(() => { master.gain.value = prev; }, 2600);
  return true;
}

/** 预热，解锁浏览器音频自动播放限制 */
function warmup() {
  try {
    ensureCtx();
    const b = ctx.createBuffer(1, 1, ctx.sampleRate);
    const s = ctx.createBufferSource();
    s.buffer = b;
    s.connect(ctx.destination);
    s.start(0);
  } catch (e) { /* 忽略 */ }
}

window.HealthAudio = {
  play: play,
  warmup: warmup,
  list: SOUND_LIST,
  names: SOUND_NAMES,
  resume: ensureCtx
};
