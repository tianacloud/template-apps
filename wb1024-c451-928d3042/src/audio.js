"use strict";
/* ══════════ 音频系统 ══════════
   BGM：assets/bgm.mp3，解码为 AudioBuffer 后用「双 BufferSource 前后紧接 + 交叉淡化」
        实现零间隙循环。
        为什么不用 <audio loop>：HTMLMediaElement 的 loop 在各浏览器都有解码器延迟
        （Chrome 起播约 23ms、结束也有余量），循环点能听到接缝，达不到「不能有哪怕
        0.1s 空白」的要求。
        为什么自己调度：AudioBufferSourceNode.start(t) 是采样级精确的，按
        「本段起点 = 上一段起点 + (dur - XFADE)」排下一段，两段在 XFADE 处重叠，
        任意时刻都有声音在播 —— 这是数学上无空隙的做法。
        交叉淡化同时掩盖 mp3 末尾可能存在的非零包络（直接回绕会「啪」一声爆音）。
   音效：Web Audio 实时合成，不占额外资源。 */

let _audioCtx = null;
let _bgmGain = null;
let _sfxGain = null;
let _masterMuted = false;

const BGM_VOL = 0.32;    // BGM 总线音量
const SFX_VOL = 0.45;    // 音效总线音量
const BGM_SRC = "assets/bgm.mp3";
const XFADE = 0.12;      // 交叉淡化时长（秒）

/* ── 初始化 ── */
function initAudio(){
  if(_audioCtx) return;
  try{
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    _masterMuted = false;
    const master = _audioCtx.createGain();
    master.gain.value = 0.62;
    master.connect(_audioCtx.destination);
    _bgmGain = _audioCtx.createGain();
    _bgmGain.gain.value = BGM_VOL;
    _bgmGain.connect(master);
    _sfxGain = _audioCtx.createGain();
    _sfxGain.gain.value = SFX_VOL;
    _sfxGain.connect(master);
  }catch(e){ console.log("Audio init failed:", e); }
}

function resumeAudio(){
  if(_audioCtx && _audioCtx.state === "suspended") _audioCtx.resume();
}

/* ── 音效合成原语 ── */
function playTone(freq, duration, type="sine", gain=0.3, detune=0){
  if(!_audioCtx) return;
  resumeAudio();
  const osc = _audioCtx.createOscillator();
  const g = _audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  g.gain.setValueAtTime(gain, _audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + duration);
  osc.connect(g);
  g.connect(_sfxGain);
  osc.start();
  osc.stop(_audioCtx.currentTime + duration);
}

function playFilteredNoise(duration, gain, ftype="bandpass", freq=1000, q=1){
  if(!_audioCtx) return;
  resumeAudio();
  const n = Math.max(1, Math.floor(_audioCtx.sampleRate * duration));
  const buf = _audioCtx.createBuffer(1, n, _audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for(let i=0;i<n;i++) d[i] = (Math.random()*2-1) * (1 - i/n);
  const src = _audioCtx.createBufferSource(); src.buffer = buf;
  const f = _audioCtx.createBiquadFilter();
  f.type = ftype; f.frequency.value = freq; f.Q.value = q;
  const g = _audioCtx.createGain(); g.gain.value = gain;
  src.connect(f); f.connect(g); g.connect(_sfxGain);
  src.start();
}

function playThump(f0, f1, dur, gain, type="sine"){
  if(!_audioCtx) return;
  resumeAudio();
  const t = _audioCtx.currentTime;
  const o = _audioCtx.createOscillator(), g = _audioCtx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(_sfxGain);
  o.start(t); o.stop(t + dur + 0.02);
}

/* ── 具体音效 ── */
const SFX = {
  chip_ok(){ playThump(190,70,0.13,0.35); playFilteredNoise(0.10,0.30,"bandpass",1600,0.9); },
  chip_bad(){ playThump(150,55,0.22,0.45,"triangle"); playFilteredNoise(0.22,0.38,"bandpass",900,0.7); playFilteredNoise(0.10,0.25,"highpass",2500,0.6); },
  cut_ok(){ playFilteredNoise(0.16,0.32,"bandpass",2600,2.5); playThump(120,50,0.10,0.20); },
  cut_bad(){ playFilteredNoise(0.28,0.42,"bandpass",700,0.8); playThump(90,40,0.30,0.40,"triangle"); playFilteredNoise(0.12,0.22,"highpass",3200,0.6); },
  polish_ok(){ playFilteredNoise(0.22,0.20,"bandpass",5200,1.2); },
  polish_bad(){ playFilteredNoise(0.28,0.26,"bandpass",1200,0.9); playThump(140,60,0.18,0.25); },
  box_open(){ playThump(220,80,0.14,0.35,"triangle"); setTimeout(()=>playThump(320,120,0.10,0.22),110); },
  success(){ [523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,0.2,"sine",0.25),i*100)); },
  fail(){ [400,350,300,200].forEach((f,i)=>setTimeout(()=>playTone(f,0.25,"sawtooth",0.2),i*120)); },
  gaze(){ playTone(1200,0.1,"sine",0.15); setTimeout(()=>playTone(1500,0.15,"sine",0.15),80); },
  rare(){ [523,659,784,1047,1319,1568].forEach((f,i)=>{ setTimeout(()=>playTone(f,0.3,"sine",0.2),i*80); setTimeout(()=>playTone(f*1.5,0.2,"triangle",0.1),i*80+40); }); },
  sell(){ playTone(800,0.1,"sine",0.2); setTimeout(()=>playTone(1000,0.1,"sine",0.15),60); },
  next(){ playTone(500,0.08,"square",0.15); setTimeout(()=>playTone(700,0.08,"square",0.15),80); },
  click(){ playTone(1000,0.03,"square",0.1); },
  day_end(){ [330,392,440,523].forEach((f,i)=>setTimeout(()=>playTone(f,0.4,"sine",0.2),i*200)); },
  shat(){ playThump(120,40,0.45,0.5,"triangle"); playFilteredNoise(0.45,0.45,"bandpass",600,0.6); playFilteredNoise(0.30,0.30,"highpass",3000,0.7); }
};

/* ══════════ BGM：零间隙单曲循环 ══════════ */
let _bgmBuf = null;        // 解码后的 AudioBuffer
let _bgmLoading = false;
let _bgmPlaying = false;
let _bgmNextAt = 0;        // 下一段起播时间（AudioContext 时间轴）
let _bgmTimer = null;

function _bgmFetchBuffer(){
  if(_bgmBuf) return Promise.resolve(_bgmBuf);
  if(_bgmLoading) return Promise.resolve(null);
  _bgmLoading = true;
  return fetch(BGM_SRC)
    .then(r=>r.arrayBuffer())
    .then(ab=>_audioCtx.decodeAudioData(ab))
    .then(buf=>{ _bgmBuf = buf; _bgmLoading = false; return buf; })
    .catch(e=>{ _bgmLoading=false; console.log("BGM load failed:", e); return null; });
}

/* 调度一段。fadeIn=true 时表示与前一段重叠 XFADE 秒：本段 0→1 淡入，
   末尾 XFADE 秒 1→0 淡出，正好交给下一段接手，全程无 0 音量点。 */
function _bgmSchedule(buf, startAt, fadeIn){
  const src=_audioCtx.createBufferSource();
  src.buffer=buf;
  const g=_audioCtx.createGain();
  const dur=buf.duration;
  if(fadeIn){
    g.gain.setValueAtTime(0.0001, startAt);
    g.gain.linearRampToValueAtTime(1, startAt + XFADE);
    g.gain.setValueAtTime(1, Math.max(startAt + XFADE, startAt + dur - XFADE));
    g.gain.linearRampToValueAtTime(0.0001, startAt + dur);
  }else{
    g.gain.setValueAtTime(1, startAt);
  }
  src.connect(g); g.connect(_bgmGain);
  src.start(startAt);
  src.stop(startAt + dur + 0.02);
  return src;
}

/* 循环泵：每 XFADE/3 检查一次，不足两个 XFADE 时补播下一段。
   标签页挂起导致 currentTime 落后时，用 now 纠正，避免一次性补大量段。 */
function _bgmPump(){
  if(!_bgmPlaying || !_bgmBuf || !_audioCtx) return;
  const now=_audioCtx.currentTime;
  const loopDur=_bgmBuf.duration - XFADE;
  let guard = 0;
  while(_bgmNextAt - now < XFADE * 2 && guard++ < 4){
    _bgmSchedule(_bgmBuf, _bgmNextAt, true);
    _bgmNextAt += loopDur;
    if(_bgmNextAt < now) _bgmNextAt = now + loopDur;   /* 纠正漂移 */
  }
}

function startBGM(){
  if(!_audioCtx) return;
  resumeAudio();
  if(_bgmPlaying) return;
  _bgmPlaying = true;
  _bgmFetchBuffer().then(buf=>{
    if(!buf || !_bgmPlaying) return;
    _bgmNextAt = _audioCtx.currentTime + 0.06;
    _bgmSchedule(buf, _bgmNextAt, false);          /* 首段不淡入 */
    _bgmNextAt += (buf.duration - XFADE);
    if(_bgmTimer) clearInterval(_bgmTimer);
    _bgmTimer = setInterval(_bgmPump, XFADE * 1000 / 3);
    _bgmPump();
  });
}

function stopBGM(){
  _bgmPlaying = false;
  if(_bgmTimer){ clearInterval(_bgmTimer); _bgmTimer = null; }
}

function toggleMute(){
  _masterMuted = !_masterMuted;
  if(_audioCtx){
    if(_masterMuted){
      _bgmGain.gain.value = 0;
      _sfxGain.gain.value = 0;
    }else{
      _bgmGain.gain.value = BGM_VOL;
      _sfxGain.gain.value = SFX_VOL;
    }
  }
  return _masterMuted;
}

window.AudioSys = { init: initAudio, resume: resumeAudio, startBGM, stopBGM, toggleMute, SFX };