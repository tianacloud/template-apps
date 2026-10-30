import { createTianaFetch } from '@tianacloud/serverless';
const link = document.createElement("link"); link.rel="stylesheet"; link.href=new URL("./app.css",import.meta.url).href; document.head.appendChild(link);
document.body.innerHTML = "\n\n<div class=\"boot\" id=\"boot\">\n  <div class=\"big\">03<i>:</i>00</div>\n  <h2>深夜机房</h2>\n  <p>白噪音混音台 · 全部声音由浏览器实时合成</p>\n  <button class=\"go\" id=\"start\">按 下 启 动</button>\n  <div class=\"hint\">建议戴上耳机 · 音量从低开始</div>\n</div>\n\n<div class=\"wrap\">\n  <header>\n    <div class=\"brand\">\n      <span class=\"rec off\" id=\"rec\"></span>\n      <div>\n        <h1>深夜机房</h1>\n        <p>Midnight Server Room · Ambient Mixer</p>\n      </div>\n    </div>\n    <div class=\"clock\">\n      <b class=\"mono\" id=\"timer\">00:00</b>\n      <span id=\"dayacc\">今晚已陪 0 分钟</span>\n    </div>\n  </header>\n\n  <section class=\"stage\">\n    <canvas aria-label=\"实时频谱可视化\" class=\"viz\" id=\"viz\"></canvas>\n    <div class=\"stage-top\">\n      <div class=\"cur\">\n        <b id=\"curName\">等待启动</b>\n        <span id=\"curDesc\">五条音轨，一层一层叠出属于你的深夜</span>\n      </div>\n      <div class=\"leds\" id=\"leds\">\n        <i class=\"led\"></i><i class=\"led\"></i><i class=\"led\"></i><i class=\"led\"></i><i class=\"led\"></i>\n      </div>\n    </div>\n    <div class=\"stage-foot\">\n      <span>REAL-TIME SYNTHESIS</span>\n      <span>NO SAMPLES · NO AUDIO FILES</span>\n    </div>\n  </section>\n\n  <div class=\"sec-t\">场景预置</div>\n  <div class=\"presets\" id=\"presets\">\n    <button class=\"chip\" data-p=\"bug\">深夜改 bug</button>\n    <button class=\"chip\" data-p=\"ops\">机房值班</button>\n    <button class=\"chip\" data-p=\"rain\">雨夜咖啡</button>\n    <button class=\"chip\" data-p=\"deploy\">上线前 5 分钟</button>\n    <button class=\"chip\" data-p=\"empty\">空无一人的 3AM</button>\n  </div>\n\n  <div class=\"sec-t\">音轨</div>\n  <div class=\"mixer\">\n    <div class=\"tr\">\n      <span class=\"ic\">☂</span>\n      <div class=\"tr-l\"><b>雨打窗</b><em>rain</em></div>\n      <input aria-label=\"雨打窗音量\" data-k=\"rain\" max=\"100\" min=\"0\" type=\"range\" value=\"0\">\n      <span class=\"pct mono\" id=\"p-rain\">0%</span>\n    </div>\n    <div class=\"tr\">\n      <span class=\"ic\">🌀</span>\n      <div class=\"tr-l\"><b>机箱风扇</b><em>fan</em></div>\n      <input aria-label=\"风扇音量\" data-k=\"fan\" max=\"100\" min=\"0\" type=\"range\" value=\"0\">\n      <span class=\"pct mono\" id=\"p-fan\">0%</span>\n    </div>\n    <div class=\"tr\">\n      <span class=\"ic\">⌨</span>\n      <div class=\"tr-l\"><b>机械键盘</b><em>keys</em></div>\n      <input aria-label=\"键盘声音量\" data-k=\"keys\" max=\"100\" min=\"0\" type=\"range\" value=\"0\">\n      <span class=\"pct mono\" id=\"p-keys\">0%</span>\n    </div>\n    <div class=\"tr\">\n      <span class=\"ic\">🗄</span>\n      <div class=\"tr-l\"><b>机柜嗡鸣</b><em>hum</em></div>\n      <input aria-label=\"机柜嗡鸣音量\" data-k=\"hum\" max=\"100\" min=\"0\" type=\"range\" value=\"0\">\n      <span class=\"pct mono\" id=\"p-hum\">0%</span>\n    </div>\n    <div class=\"tr\">\n      <span class=\"ic\">♥</span>\n      <div class=\"tr-l\"><b>心跳低音</b><em>pulse</em></div>\n      <input aria-label=\"心跳低音音量\" data-k=\"pulse\" max=\"100\" min=\"0\" type=\"range\" value=\"0\">\n      <span class=\"pct mono\" id=\"p-pulse\">0%</span>\n    </div>\n  </div>\n\n  <div class=\"bar\">\n    <button class=\"play paused\" id=\"play\">▶ 开始播放</button>\n    <div class=\"vol\">\n      <span>总音量</span>\n      <input aria-label=\"总音量\" id=\"master\" max=\"100\" min=\"0\" type=\"range\" value=\"80\">\n    </div>\n    <button class=\"ghost\" id=\"copy\">复制我的配方</button>\n  </div>\n\n  <details>\n    <summary>怎么用</summary>\n    <div class=\"doc\">\n      <ol>\n        <li><b>选一个场景</b>：五个预置都是调好的，点一下就有声音。</li>\n        <li><b>推滑块</b>：五条音轨各自独立，喜欢哪种就往上推。</li>\n        <li><b>真敲键盘</b>：页面开着、键盘轨有音量时，你敲键盘它也会响。</li>\n      </ol>\n      <p style=\"margin-top:10px\">所有声音都由浏览器实时合成——雨是滤波后的白噪声，风扇是低频噪声加正弦嗡鸣，键盘是短促噪声脉冲，机柜是 50Hz 电流谐波和硬盘寻道的咔哒声。没有任何音频文件，也不需要联网。</p>\n    </div>\n  </details>\n\n  <div class=\"tip\">戴上耳机 · 音量从低开始 · 别在需要保持警觉的场合开太大</div>\n</div>\n\n";

(function(){
  'use strict';

  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master = null, comp = null, analyser = null;
  var noiseBuf = null, brownBuf = null;
  var gains = {};
  var state = { rain: 0, fan: 0, keys: 0, hum: 0, pulse: 0 };
  var BASE = { rain: 0.95, fan: 0.85, keys: 1.0, hum: 0.8, pulse: 0.95 };
  var playing = false, booted = false;
  var timers = [], keyTimer = 0, seekTimer = 0, beatTimer = 0;
  var startedAt = 0, elapsed = 0;

  var PRESETS = {
    bug:    { name: '深夜改 bug',      desc: '键盘当节拍器，雨替你挡掉外面的世界', rain: 38, fan: 12, keys: 62, hum: 28, pulse: 18 },
    ops:    { name: '机房值班',        desc: '冷风、电流，和黑暗里转个不停的硬盘', rain: 8,  fan: 52, keys: 14, hum: 78, pulse: 22 },
    rain:   { name: '雨夜咖啡',        desc: '雨打窗，风扇低鸣，什么都不想做',     rain: 72, fan: 16, keys: 8,  hum: 18, pulse: 30 },
    deploy: { name: '上线前 5 分钟',   desc: '心跳比监控告警还响',                 rain: 0,  fan: 20, keys: 30, hum: 34, pulse: 88 },
    empty:  { name: '空无一人的 3AM',  desc: '整层楼只剩你和机柜的呼吸',           rain: 22, fan: 26, keys: 0,  hum: 45, pulse: 34 }
  };

  function makeNoise(sec, brown){
    var len = Math.floor(ctx.sampleRate * sec);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++){
      var w = Math.random() * 2 - 1;
      if (brown){ last = (last + 0.02 * w) / 1.02; d[i] = last * 3.4; }
      else { d[i] = w; }
    }
    return buf;
  }

  function noiseSrc(buf){
    var s = ctx.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    return s;
  }

  function buildRain(){
    var g = ctx.createGain(); g.gain.value = 0; g.connect(master); gains.rain = g;
    var s1 = noiseSrc(noiseBuf);
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 520; hp.Q.value = 0.4;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1750; bp.Q.value = 0.55;
    var g1 = ctx.createGain(); g1.gain.value = 0.5;
    s1.connect(hp); hp.connect(bp); bp.connect(g1); g1.connect(g);
    var s2 = noiseSrc(brownBuf);
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 270;
    var g2 = ctx.createGain(); g2.gain.value = 0.8;
    s2.connect(lp); lp.connect(g2); g2.connect(g);
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    var lg = ctx.createGain(); lg.gain.value = 0.11;
    lfo.connect(lg); lg.connect(g1.gain);
    s1.start(); s2.start(); lfo.start();
  }

  function buildFan(){
    var g = ctx.createGain(); g.gain.value = 0; g.connect(master); gains.fan = g;
    var s = noiseSrc(brownBuf);
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.9;
    var g1 = ctx.createGain(); g1.gain.value = 0.85;
    s.connect(lp); lp.connect(g1); g1.connect(g);
    var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 57;
    var og = ctx.createGain(); og.gain.value = 0.045;
    o.connect(og); og.connect(g);
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.21;
    var lg = ctx.createGain(); lg.gain.value = 120;
    lfo.connect(lg); lg.connect(lp.frequency);
    s.start(); o.start(); lfo.start();
  }

  function buildKeys(){
    var g = ctx.createGain(); g.gain.value = 0; g.connect(master); gains.keys = g;
  }

  function keyClick(vol){
    if (!ctx || !gains.keys) return;
    var t = ctx.currentTime;
    var s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = false;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.value = 1600 + Math.random() * 1900; bp.Q.value = 1.15;
    var e = ctx.createGain();
    e.gain.setValueAtTime(0.0001, t);
    e.gain.linearRampToValueAtTime(vol, t + 0.002);
    e.gain.exponentialRampToValueAtTime(0.0006, t + 0.05 + Math.random() * 0.03);
    s.connect(bp); bp.connect(e); e.connect(gains.keys);
    s.start(t); s.stop(t + 0.14);
    var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 135 + Math.random() * 70;
    var oe = ctx.createGain();
    oe.gain.setValueAtTime(vol * 0.55, t);
    oe.gain.exponentialRampToValueAtTime(0.0004, t + 0.045);
    o.connect(oe); oe.connect(gains.keys); o.start(t); o.stop(t + 0.07);
  }

  function typeLoop(){
    var delay = 130 + Math.random() * 420;
    if (Math.random() < 0.22) delay = 60 + Math.random() * 90;
    keyTimer = window.setTimeout(function(){
      if (playing && state.keys > 0) keyClick(0.14 + Math.random() * 0.1);
      typeLoop();
    }, delay);
  }

  function buildHum(){
    var g = ctx.createGain(); g.gain.value = 0; g.connect(master); gains.hum = g;
    var freqs = [50, 100, 150];
    var amps = [0.5, 0.16, 0.07];
    for (var i = 0; i < freqs.length; i++){
      var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freqs[i];
      var og = ctx.createGain(); og.gain.value = amps[i];
      o.connect(og); og.connect(g); o.start();
    }
    var s = noiseSrc(brownBuf);
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180;
    var ng = ctx.createGain(); ng.gain.value = 0.28;
    s.connect(lp); lp.connect(ng); ng.connect(g); s.start();
  }

  function seekBurst(){
    if (!ctx || !gains.hum || !playing || state.hum <= 0) return;
    var n = 2 + Math.floor(Math.random() * 4);
    for (var i = 0; i < n; i++){
      (function(k){
        window.setTimeout(function(){
          if (!ctx || state.hum <= 0) return;
          var t = ctx.currentTime;
          var s = ctx.createBufferSource(); s.buffer = noiseBuf;
          var bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
          bp.frequency.value = 2400 + Math.random() * 1200; bp.Q.value = 6;
          var e = ctx.createGain();
          e.gain.setValueAtTime(0.1, t);
          e.gain.exponentialRampToValueAtTime(0.0004, t + 0.022);
          s.connect(bp); bp.connect(e); e.connect(gains.hum);
          s.start(t); s.stop(t + 0.05);
        }, k * (35 + Math.random() * 55));
      })(i);
    }
  }

  function seekLoop(){
    seekTimer = window.setTimeout(function(){
      seekBurst();
      seekLoop();
    }, 1800 + Math.random() * 5200);
  }

  function thump(t, vol){
    var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(52, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.18);
    var e = ctx.createGain();
    e.gain.setValueAtTime(0.0001, t);
    e.gain.linearRampToValueAtTime(vol, t + 0.012);
    e.gain.exponentialRampToValueAtTime(0.0004, t + 0.24);
    o.connect(e); e.connect(gains.pulse); o.start(t); o.stop(t + 0.3);
  }

  function buildPulse(){
    var g = ctx.createGain(); g.gain.value = 0; g.connect(master); gains.pulse = g;
  }

  function beatLoop(){
    beatTimer = window.setInterval(function(){
      if (!ctx || !playing || state.pulse <= 0) return;
      var t = ctx.currentTime + 0.02;
      thump(t, 0.55);
      thump(t + 0.26, 0.34);
    }, 1150);
  }

  function initAudio(){
    if (ctx) return;
    ctx = new AC();
    noiseBuf = makeNoise(3, false);
    brownBuf = makeNoise(4, true);
    master = ctx.createGain(); master.gain.value = 0.0001;
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 22; comp.ratio.value = 3.2;
    comp.attack.value = 0.004; comp.release.value = 0.28;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.82;
    master.connect(comp); comp.connect(analyser); analyser.connect(ctx.destination);
    buildRain(); buildFan(); buildKeys(); buildHum(); buildPulse();
    beatLoop(); typeLoop(); seekLoop();
  }

  function setFill(el){
    if (!el) return;
    el.style.setProperty('--v', el.value + '%');
  }

  function applyTrack(k, delay){
    var v = state[k] / 100;
    if (!gains[k]) return;
    var target = Math.pow(v, 1.45) * BASE[k];
    var t = ctx.currentTime + (delay || 0);
    gains[k].gain.cancelScheduledValues(t);
    gains[k].gain.setTargetAtTime(target, t, 0.09);
  }

  function applyAll(){
    for (var k in state){ if (Object.prototype.hasOwnProperty.call(state, k)) applyTrack(k, 0); }
  }

  function setPlaying(on){
    if (playing && !on) { bumpTimer(); saveTimer(); }
    if (!playing && on) startedAt = Date.now() - elapsed * 1000;
    playing = on;
    var p = document.getElementById('play');
    var rec = document.getElementById('rec');
    if (ctx){
      var t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setTargetAtTime(on ? masterVol() : 0.0001, t, on ? 0.35 : 0.18);
    }
    p.textContent = on ? '❚❚ 暂停' : '▶ 开始播放';
    p.className = on ? 'play' : 'play paused';
    rec.className = on ? 'rec' : 'rec off';
    if (on && !startedAt) startedAt = Date.now();
  }

  function masterVol(){
    var m = parseFloat(document.getElementById('master').value) / 100;
    return Math.max(0.0001, Math.pow(m, 1.3) * 0.95);
  }

  function paint(){
    var leds = document.getElementById('leds').children;
    var keys = ['rain', 'fan', 'keys', 'hum', 'pulse'];
    for (var i = 0; i < keys.length; i++){
      leds[i].className = (playing && state[keys[i]] > 0) ? 'led on' : 'led';
    }
  }

  function setChip(id){
    var chips = document.querySelectorAll('.chip');
    for (var i = 0; i < chips.length; i++){
      chips[i].className = chips[i].getAttribute('data-p') === id ? 'chip on' : 'chip';
    }
  }

  function applyPreset(id, fromUser){
    var p = PRESETS[id];
    if (!p) return;
    var keys = ['rain', 'fan', 'keys', 'hum', 'pulse'];
    for (var i = 0; i < keys.length; i++){
      var k = keys[i];
      state[k] = p[k];
      var sl = document.querySelector('input[data-k="' + k + '"]');
      if (sl) { sl.value = p[k]; setFill(sl); }
      var pc = document.getElementById('p-' + k);
      if (pc) pc.textContent = p[k] + '%';
      applyTrack(k, 0);
    }
    document.getElementById('curName').textContent = p.name;
    document.getElementById('curDesc').textContent = p.desc;
    setChip(id);
    paint();
    if (fromUser && !playing && ctx) setPlaying(true);
  }

  function fmt(sec){
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function todayKey(){
    var d = new Date();
    return 'sm3am_' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  var db = null, accumulated = 0, savedElapsed = 0, writeQueue = Promise.resolve();
  var statusEl = document.createElement('span');
  statusEl.style.display = 'block'; statusEl.textContent = '正在连接云端计时…';
  document.querySelector('.clock').appendChild(statusEl);
  async function execute(sql, args) {
    var response = await db.fetch(db.origin + '/v3/pipeline', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:sql,args:args || [],want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw Error('数据库请求失败');
    var result = (await response.json()).results?.[0];
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作失败');
    return result.response.result;
  }
  async function loadTimer() {
    try {
      var c = await window.tiana.connection();
      if (c.sql_api !== 'hrana-v3' || !window.tiana.auth?.getAccessToken) throw Error('数据库未就绪');
      db = {origin:c.origin,fetch:createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'})};
      var result = await execute('SELECT COALESCE(SUM(seconds),0) FROM listening_sessions WHERE day = ?', [{type:'text',value:todayKey()}]);
      accumulated = Number(result.rows[0][0].value); statusEl.textContent = '时长已连接云端';
      bumpTimer();
    } catch (_) { statusEl.textContent = '云端时长读取失败，请刷新重试'; }
  }
  loadTimer();
  function bumpTimer(){
    if (playing) elapsed = Math.floor((Date.now() - startedAt) / 1000);
    document.getElementById('timer').textContent = fmt(elapsed);
    document.getElementById('dayacc').textContent = '今晚已陪 ' + Math.floor((accumulated + elapsed - savedElapsed) / 60) + ' 分钟';
    if (playing && elapsed - savedElapsed >= 10) saveTimer();
  }
  function saveTimer(){
    if (!db || elapsed <= savedElapsed) return;
    var seconds = elapsed - savedElapsed, day = todayKey();
    savedElapsed = elapsed;
    var bytes = new Uint8Array(16); crypto.getRandomValues(bytes);
    var id = Array.from(bytes, function(b){return b.toString(16).padStart(2,'0');}).join('');
    writeQueue = writeQueue.then(async function(){
      try {
        await execute('INSERT INTO listening_sessions(id,day,seconds) VALUES(?,?,?)', [{type:'text',value:id},{type:'text',value:day},{type:'integer',value:String(seconds)}]);
        accumulated += seconds; statusEl.textContent = '时长已同步';
      } catch (_) { statusEl.textContent = '时长同步结果未知，请刷新检查'; }
    });
  }

  var cvs = document.getElementById('viz');
  var cx = cvs.getContext('2d');
  var bars = 76, data = null, t0 = 0;

  function sizeCanvas(){
    var dpr = window.devicePixelRatio || 1;
    var w = cvs.clientWidth || 800, h = cvs.clientHeight || 220;
    cvs.width = Math.floor(w * dpr);
    cvs.height = Math.floor(h * dpr);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(ts){
    var w = cvs.clientWidth, h = cvs.clientHeight;
    cx.clearRect(0, 0, w, h);
    var t = (ts || 0) / 1000;
    if (analyser) { data = new Uint8Array(analyser.frequencyBinCount); }
    if (analyser && playing) analyser.getByteFrequencyData(data);
    var bw = w / bars;
    var base = h - 32;
    for (var i = 0; i < bars; i++){
      var v;
      if (analyser && playing && data){
        var idx = Math.floor(Math.pow(i / bars, 1.75) * data.length * 0.62);
        v = data[idx] / 255;
        v = v * v * 1.55;
        if (v > 1) v = 1;
      } else {
        v = 0.17 + 0.13 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 0.28)) + 0.05 * Math.sin(t * 2.3 + i * 0.9);
      }
      var bh = Math.max(2, v * (h - 46));
      var x = i * bw + bw * 0.22;
      var bwid = Math.max(1.4, bw * 0.56);
      var mix = Math.min(1, v * 1.1);
      var r = Math.round(79 + (255 - 79) * mix);
      var g = Math.round(227 - (227 - 180) * mix);
      var b = Math.round(193 - (193 - 77) * mix);
      cx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (0.34 + v * 0.6) + ')';
      cx.fillRect(x, base - bh, bwid, bh);
      cx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (0.06 + v * 0.1) + ')';
      cx.fillRect(x, base + 2, bwid, Math.min(18, bh * 0.22));
    }
    cx.strokeStyle = 'rgba(255,255,255,.07)';
    cx.lineWidth = 1;
    cx.beginPath(); cx.moveTo(0, base + 0.5); cx.lineTo(w, base + 0.5); cx.stroke();
    window.requestAnimationFrame(draw);
  }

  /* ---------- events ---------- */

  document.getElementById('start').onclick = function(){
    if (!ctx && AC){
      try { initAudio(); } catch (err) { ctx = null; }
    }
    booted = true;
    document.body.className = 'ready';
    if (ctx && ctx.state === 'suspended'){ ctx.resume(); }
    applyPreset('bug', false);
    if (ctx) setPlaying(true);
    paint();
    sizeCanvas();
  };

  document.getElementById('play').onclick = function(){
    if (!ctx && AC){ try { initAudio(); } catch (err) { ctx = null; } }
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (!playing){ if (elapsed === 0) startedAt = Date.now(); else startedAt = Date.now() - elapsed * 1000; }
    setPlaying(!playing);
    paint();
  };

  document.getElementById('master').oninput = function(){
    setFill(this);
    if (ctx && playing){
      var t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setTargetAtTime(masterVol(), t, 0.06);
    }
  };

  var sliders = document.querySelectorAll('input[data-k]');
  for (var i = 0; i < sliders.length; i++){
    sliders[i].oninput = function(){
      var k = this.getAttribute('data-k');
      var v = parseInt(this.value, 10);
      state[k] = v;
      setFill(this);
      document.getElementById('p-' + k).textContent = v + '%';
      applyTrack(k, 0);
      if (!playing && ctx) setPlaying(true);
      var chips = document.querySelectorAll('.chip');
      for (var j = 0; j < chips.length; j++){ chips[j].className = 'chip'; }
      document.getElementById('curName').textContent = '自定义';
      document.getElementById('curDesc').textContent = '你自己叠出来的这一层';
      paint();
    };
  }

  var chips = document.querySelectorAll('.chip');
  for (var c = 0; c < chips.length; c++){
    chips[c].onclick = function(){
      if (!ctx && AC){ try { initAudio(); } catch (err) { ctx = null; } }
      if (ctx && ctx.state === 'suspended') ctx.resume();
      applyPreset(this.getAttribute('data-p'), true);
    };
  }

  document.getElementById('copy').onclick = function(){
    var txt = '我的深夜机房配方 → 雨 ' + state.rain +
      ' / 风扇 ' + state.fan + ' / 键盘 ' + state.keys +
      ' / 嗡鸣 ' + state.hum + ' / 心跳 ' + state.pulse;
    var btn = this;
    var done = function(){ btn.textContent = '已复制 ✓'; window.setTimeout(function(){ btn.textContent = '复制我的配方'; }, 1600); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(txt).then(done).catch(function(){ btn.textContent = txt; });
      } else { btn.textContent = txt; }
    } catch (err) { btn.textContent = txt; }
  };

  document.addEventListener('keydown', function(){
    if (playing && state.keys > 0) keyClick(0.12 + Math.random() * 0.08);
  });

  window.addEventListener('resize', function(){ sizeCanvas(); });

  document.addEventListener('visibilitychange', function(){ if (document.hidden && playing) { bumpTimer(); saveTimer(); } });

  window.setInterval(bumpTimer, 1000);

  /* 截图/预览模式：跳过启动屏，直接呈现主界面 */
  if (/[?&]shot=1/.test(window.location.search)){
    document.body.className = 'ready';
    document.getElementById('boot').style.display = 'none';
    document.getElementById('curName').textContent = PRESETS.bug.name;
    document.getElementById('curDesc').textContent = PRESETS.bug.desc;
    var ks = ['rain', 'fan', 'keys', 'hum', 'pulse'];
    for (var q = 0; q < ks.length; q++){
      state[ks[q]] = PRESETS.bug[ks[q]];
      var s2 = document.querySelector('input[data-k="' + ks[q] + '"]');
      if (s2) { s2.value = PRESETS.bug[ks[q]]; setFill(s2); }
      document.getElementById('p-' + ks[q]).textContent = PRESETS.bug[ks[q]] + '%';
    }
    setChip('bug');
    document.getElementById('leds').innerHTML = '<i class="led on"></i><i class="led"></i><i class="led on"></i><i class="led on"></i><i class="led"></i>';
  }

  for (var f = 0; f < sliders.length; f++){ setFill(sliders[f]); }
  setFill(document.getElementById('master'));

  window.__sm3am = {
    boot: initAudio,
    preset: applyPreset,
    play: setPlaying,
    state: state,
    analyser: function(){ return analyser; },
    context: function(){ return ctx; }
  };

  sizeCanvas();
  window.requestAnimationFrame(draw);
})();
