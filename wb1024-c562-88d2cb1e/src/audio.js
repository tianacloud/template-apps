'use strict';

/**
 * 番茄专注 · 网页版 —— 音频引擎
 * 1) 内置音源：Web Audio API 实时合成，零音频文件、无版权风险、离线可用
 * 2) 本机音乐：用户选择的文件（Object URL），按序循环
 * 3) 在线链接：直链音频流
 * 4) 提示音：叮咚 / 钟声 / 三音阶 / 木琴
 */

window.AudioEngine = (function () {

  let ctx = null;
  let master = null;
  let volume = 0.6;

  let nodes = [];
  let sparkleTimer = null;
  let playing = false;

  let audioEl = null;
  let playlist = [];
  let playlistIndex = 0;
  let playlistErrors = 0;

  /* ---------------- 基础设施 ---------------- */

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function push(node) { nodes.push(node); return node; }

  function makeNoiseBuffer(type) {
    const c = ensureCtx();
    const seconds = 4;
    const len = Math.floor(c.sampleRate * seconds);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }

    } else {
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
    return buf;
  }

  function noise(c, dest, type, level, filter) {
    const src = c.createBufferSource();
    src.buffer = makeNoiseBuffer(type);
    src.loop = true;

    const g = c.createGain();
    g.gain.value = level;
    src.connect(g);

    let tail = g;
    if (filter) {
      const f = c.createBiquadFilter();
      f.type = filter.type || 'lowpass';
      f.frequency.value = filter.freq || 1000;
      if (filter.q) f.Q.value = filter.q;
      tail.connect(f);
      tail = f;
      push(f);
    }
    tail.connect(dest);

    src.start();
    push(src);
    push(g);
    return g;
  }

  function modulate(c, param, rate, depth, base) {
    param.value = base;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = rate;
    const g = c.createGain();
    g.gain.value = depth;
    osc.connect(g);
    g.connect(param);
    osc.start();
    push(osc);
    push(g);
    return osc;
  }

  function tone(c, dest, freq, level, type) {
    const o = c.createOscillator();
    o.type = type || 'sine';
    o.frequency.value = freq;
    const g = c.createGain();
    g.gain.value = level;
    o.connect(g);
    g.connect(dest);
    o.start();
    push(o);
    push(g);
    return o;
  }

  function scheduleSparkle(fn, minD, maxD) {
    const run = () => {
      if (!playing) return;
      try { fn(); } catch (e) { /* ignore */ }
      sparkleTimer = setTimeout(run, minD + Math.random() * (maxD - minD));
    };
    sparkleTimer = setTimeout(run, minD + Math.random() * (maxD - minD));
  }

  function blip(c, dest, opt) {
    const t = c.currentTime + 0.01;
    const o = c.createOscillator();
    o.type = opt.type || 'sine';
    const g = c.createGain();

    o.frequency.setValueAtTime(opt.from, t);
    if (opt.to) o.frequency.exponentialRampToValueAtTime(opt.to, t + opt.rise);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(opt.level, t + (opt.rise || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + opt.dur);

    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + opt.dur + 0.05);
  }

  /* ---------------- 内置音源 ---------------- */

  const SOURCES = {

    rain(c, out) {
      noise(c, out, 'white', 0.3, { type: 'lowpass', freq: 6500 });
      noise(c, out, 'white', 0.07, { type: 'highpass', freq: 2200 });
      const g = c.createGain();
      modulate(c, g.gain, 0.09, 0.05, 0.08);
      g.connect(out);
    },

    waves(c, out) {
      const bed = c.createGain();
      bed.connect(out);
      modulate(c, bed.gain, 0.055, 0.42, 0.5);
      noise(c, bed, 'brown', 1, { type: 'lowpass', freq: 1400 });
    },

    stream(c, out) {
      noise(c, out, 'white', 0.16, { type: 'highpass', freq: 1300 });
      noise(c, out, 'white', 0.1, { type: 'bandpass', freq: 3600, q: 0.9 });
      const g = c.createGain();
      modulate(c, g.gain, 0.13, 0.03, 0.05);
      g.connect(out);
    },

    wind(c, out) {
      const bed = c.createGain();
      bed.connect(out);
      modulate(c, bed.gain, 0.04, 0.34, 0.46);
      noise(c, bed, 'brown', 1, { type: 'lowpass', freq: 460 });
      scheduleSparkle(() => {
        const c2 = ensureCtx();
        const g = c2.createGain();
        g.connect(out);
        modulate(c2, g.gain, 0.9, 0.12, 0.14);
        noise(c2, g, 'brown', 1, { type: 'lowpass', freq: 700 });
        setTimeout(() => { try { g.disconnect(); } catch (e) { /* ignore */ } }, 3600);
      }, 9000, 20000);
    },

    forest(c, out) {
      noise(c, out, 'pink', 0.13, { type: 'lowpass', freq: 3200 });
      noise(c, out, 'brown', 0.12, { type: 'lowpass', freq: 300 });
      scheduleSparkle(() => {
        const c2 = ensureCtx();
        const n = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) {
          setTimeout(() => {
            blip(c2, out, {
              type: 'sine',
              from: 1900 + Math.random() * 1400,
              to: 2900 + Math.random() * 1800,
              rise: 0.07,
              level: 0.05,
              dur: 0.13
            });
          }, i * (90 + Math.random() * 110));
        }
      }, 2600, 8000);
    },

    night(c, out) {
      noise(c, out, 'pink', 0.1, { type: 'lowpass', freq: 1500 });
      scheduleSparkle(() => {
        const c2 = ensureCtx();
        const base = 3900 + Math.random() * 700;
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            blip(c2, out, { type: 'square', from: base, level: 0.014, rise: 0.004, dur: 0.035 });
          }, i * 62);
        }
      }, 700, 2100);
    },

    cafe(c, out) {
      noise(c, out, 'brown', 0.34, { type: 'bandpass', freq: 700, q: 0.55 });
      noise(c, out, 'pink', 0.09, { type: 'bandpass', freq: 2200, q: 0.7 });
      scheduleSparkle(() => {
        const c2 = ensureCtx();
        blip(c2, out, {
          type: 'triangle',
          from: 2600 + Math.random() * 900,
          to: 3400 + Math.random() * 1200,
          rise: 0.006,
          level: 0.035,
          dur: 0.45
        });
      }, 4500, 14000);
    },

    fire(c, out) {
      noise(c, out, 'brown', 0.36, { type: 'lowpass', freq: 1000 });
      const g = c.createGain();
      g.connect(out);
      modulate(c, g.gain, 0.16, 0.03, 0.05);
      noise(c, g, 'white', 1, { type: 'bandpass', freq: 1700, q: 0.8 });
      scheduleSparkle(() => {
        const c2 = ensureCtx();
        blip(c2, out, {
          type: 'triangle',
          from: 1400 + Math.random() * 2600,
          level: 0.05,
          rise: 0.003,
          dur: 0.06
        });
      }, 500, 2600);
    },

    fan(c, out) {
      noise(c, out, 'brown', 0.38, { type: 'lowpass', freq: 720 });
      tone(c, out, 58, 0.05, 'sine');
      tone(c, out, 116, 0.02, 'sine');
      tone(c, out, 233, 0.008, 'triangle');
    },

    train(c, out) {
      noise(c, out, 'brown', 0.42, { type: 'lowpass', freq: 880 });
      noise(c, out, 'white', 0.05, { type: 'bandpass', freq: 2400, q: 0.6 });
      scheduleSparkle(() => {
        const c2 = ensureCtx();
        blip(c2, out, { type: 'sine', from: 150, to: 70, rise: 0.02, level: 0.16, dur: 0.13 });
      }, 700, 760);
    },

    white(c, out) { noise(c, out, 'white', 0.2); },
    pink(c, out) { noise(c, out, 'pink', 0.3); },
    brown(c, out) { noise(c, out, 'brown', 0.5); },

    pad(c, out) {
      const notes = [110, 164.81, 220, 277.18, 329.63];
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 0.6;
      lp.connect(out);
      modulate(c, lp.frequency, 0.028, 520, 900);

      notes.forEach((f, i) => {
        [0, 1.6].forEach((detune) => {
          const o = c.createOscillator();
          o.type = i % 2 ? 'triangle' : 'sine';
          o.frequency.value = f;
          o.detune.value = detune;
          const g = c.createGain();
          g.gain.value = 0.028;
          o.connect(g);
          g.connect(lp);
          o.start();
          push(o);
          push(g);
        });
      });

      const trem = c.createGain();
      trem.connect(out);
      modulate(c, trem.gain, 0.05, 0.03, 0.04);
      noise(c, trem, 'pink', 1, { type: 'lowpass', freq: 1200 });
    },

    om(c, out) {
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 400;
      lp.connect(out);
      [55, 82.5, 110, 165].forEach((f, i) => {
        const o = c.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        const g = c.createGain();
        g.gain.value = 0.07 / (i + 1);
        o.connect(g);
        g.connect(lp);
        o.start();
        push(o);
        push(g);
        const lfo = c.createOscillator();
        lfo.frequency.value = 0.11 + i * 0.03;
        const lg = c.createGain();
        lg.gain.value = 0.6 + i * 0.4;
        lfo.connect(lg);
        lg.connect(o.detune);
        lfo.start();
        push(lfo);
        push(lg);
      });
    }
  };

  const BUILTIN_SOURCES = [
    { id: 'rain', name: '雨声' },
    { id: 'waves', name: '海浪' },
    { id: 'stream', name: '溪流' },
    { id: 'wind', name: '风声' },
    { id: 'forest', name: '森林鸟鸣' },
    { id: 'night', name: '夏夜虫鸣' },
    { id: 'cafe', name: '咖啡厅' },
    { id: 'fire', name: '壁炉柴火' },
    { id: 'fan', name: '风扇嗡鸣' },
    { id: 'train', name: '车厢行进' },
    { id: 'white', name: '白噪音' },
    { id: 'pink', name: '粉噪音' },
    { id: 'brown', name: '棕噪音' },
    { id: 'pad', name: '氛围音垫' },
    { id: 'om', name: '冥想低鸣' }
  ];

  /* ---------------- 播放列表（本机文件 / 在线链接） ---------------- */

  function stopPlaylist() {
    if (audioEl) {
      try {
        audioEl.pause();
        audioEl.src = '';
      } catch (e) { /* ignore */ }
      audioEl = null;
    }
    playlist = [];
    playlistIndex = 0;
    playlistErrors = 0;
  }

  function playNextInPlaylist() {
    if (!playlist.length) { playing = false; return; }

    audioEl = new Audio();
    audioEl.src = playlist[playlistIndex];
    audioEl.volume = volume;
    audioEl.loop = false;
    audioEl.crossOrigin = 'anonymous';

    audioEl.onended = () => {
      if (!playing) return;
      playlistIndex = (playlistIndex + 1) % playlist.length;
      playlistErrors = 0;
      playNextInPlaylist();
    };

    audioEl.onerror = () => {
      playlistErrors++;
      if (playlistErrors >= playlist.length) {
        playing = false;
        stopPlaylist();
        return;
      }
      playlistIndex = (playlistIndex + 1) % playlist.length;
      playNextInPlaylist();
    };

    audioEl.play().catch(() => {
      playlistErrors++;
      if (playlistErrors >= playlist.length) {
        playing = false;
        stopPlaylist();
      }
    });
  }

  /* ---------------- 对外接口 ---------------- */

  function stop() {
    playing = false;

    if (sparkleTimer) {
      clearTimeout(sparkleTimer);
      sparkleTimer = null;
    }

    nodes.forEach((n) => {
      try { if (typeof n.stop === 'function') n.stop(); } catch (e) { /* ignore */ }
      try { n.disconnect(); } catch (e) { /* ignore */ }
    });
    nodes = [];

    stopPlaylist();
  }

  /**
   * @param {{type:string, builtin?:string, files?:string[], url?:string}} config
   * files 为可直接播放的 URL（本机文件用 Object URL）
   */
  function play(config) {
    stop();
    if (!config || config.type === 'none') return false;

    const c = ensureCtx();
    if (!c) return false;

    if (config.type === 'builtin') {
      const id = config.builtin || 'rain';
      if (!SOURCES[id]) return false;
      playing = true;
      SOURCES[id](ctx, master);
      return true;
    }

    if (config.type === 'local') {
      const urls = (config.files || []).filter(Boolean);
      if (!urls.length) return false;
      playing = true;
      playlist = urls;
      playlistIndex = 0;
      playlistErrors = 0;
      playNextInPlaylist();
      return true;
    }

    if (config.type === 'url') {
      const u = (config.url || '').trim();
      if (!u) return false;
      playing = true;
      playlist = [u];
      playlistIndex = 0;
      playlistErrors = 0;
      playNextInPlaylist();
      return true;
    }

    return false;
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, Number(v) || 0));
    if (master) master.gain.value = volume;
    if (audioEl) audioEl.volume = volume;
  }

  /* ---------------- 提示音 ---------------- */

  function synthNote(dest, freq, startAt, dur, level, type, partials) {
    const c = ensureCtx();
    if (!c) return;
    const freqs = [freq].concat(partials || []);
    freqs.forEach((f, i) => {
      const o = c.createOscillator();
      o.type = type || 'sine';
      o.frequency.value = f;
      const g = c.createGain();
      const lv = level * (i === 0 ? 1 : 1 / (i * 2.6));
      g.gain.setValueAtTime(0.0001, startAt);
      g.gain.linearRampToValueAtTime(lv, startAt + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, startAt + dur * (i === 0 ? 1 : 0.6));
      o.connect(g);
      g.connect(dest);
      o.start(startAt);
      o.stop(startAt + dur + 0.1);
    });
  }

  function playAlert(kind, vol) {
    const c = ensureCtx();
    if (!c) return;
    const v = Math.max(0, Math.min(1, vol === undefined ? 0.8 : vol));
    const out = c.createGain();
    out.gain.value = v;
    out.connect(c.destination);

    const t = c.currentTime + 0.03;

    if (kind === 'bell') {
      synthNote(out, 523.25, t, 2.6, 0.34, 'sine', [1318.5, 2093.0, 2637.0]);
      synthNote(out, 783.99, t + 0.02, 2.2, 0.12, 'sine', [1975.5]);

    } else if (kind === 'triad') {
      [659.25, 830.61, 987.77].forEach((f, i) => {
        synthNote(out, f, t + i * 0.14, 1.1, 0.3, 'sine', [f * 2]);
      });

    } else if (kind === 'marimba') {
      [880, 1174.66].forEach((f, i) => {
        synthNote(out, f, t + i * 0.1, 0.5, 0.3, 'triangle', [f * 3.1]);
      });

    } else {
      synthNote(out, 1046.5, t, 0.85, 0.32, 'sine', [2093]);
      synthNote(out, 1567.98, t + 0.13, 1.2, 0.26, 'sine', [3136]);
    }

    setTimeout(() => {
      try { out.disconnect(); } catch (e) { /* ignore */ }
    }, 3200);
  }

  function unlock() {
    try { ensureCtx(); } catch (e) { /* ignore */ }
  }

  return {
    BUILTIN_SOURCES,
    play,
    stop,
    setVolume,
    playAlert,
    unlock,
    isPlaying: () => playing
  };

})();
