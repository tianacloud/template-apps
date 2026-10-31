
export function start(ASSETS, RAW, cloudData, persist){
  'use strict';

  /* =========================================================
     词表：《新版PET备考主题词汇表（带音标）》
     [{n:主题, e:emoji, w:[[英文, 音标, 中文], ...]}]
     ========================================================= */


  var CATS = [], ALL = [], WORDMAP = {}, CATMAP = {};
  RAW.forEach(function(cat, ci){
    var c = { id:'c' + ci, name:cat.n, emoji:cat.e, list:[] };
    CATS.push(c); CATMAP[c.id] = c;
    cat.w.forEach(function(t){
      var item = { w:t[0], ipa:t[1] || '', c:t[2], cat:c.id, u:t[3] || '', ex:t[4] || '' };
      ALL.push(item);
      if(!WORDMAP[item.w]) WORDMAP[item.w] = item;
      c.list.push(item);
    });
    c.total = c.list.length;
  });

  /* ================= 存储：按名字分档案 ================= */
  var KEY = 'petWords.v3';
  var OLD = 'petWords.v2';

  function newProfile(name){
    return {
      name: name, avatar: '🦊',
      stars: 0, spent: 0, lastDay: '', days: [],
      ptr: {}, wrong: {}, learned: {},
      sessions: 0, correct: 0, questions: 0,
      redeemed: [], custom: [], history: [], lastCat: 'all',
      campaign: { level: 0, lap: 0, cur: 0, best: 0, wins: 0, laps: 0, flagAt: '' }
    };
  }

  var store = null, state = null;

  function fixProfile(p, k){
    var d = newProfile(k);
    for(var f in d){ if(p[f] === undefined) p[f] = d[f]; }
    if(!Array.isArray(p.days)) p.days = [];
    if(!Array.isArray(p.redeemed)) p.redeemed = [];
    if(!Array.isArray(p.custom)) p.custom = [];
    if(!Array.isArray(p.history)) p.history = [];
    if(!p.ptr || typeof p.ptr !== 'object') p.ptr = {};
    if(!p.wrong || typeof p.wrong !== 'object') p.wrong = {};
    if(!p.learned || typeof p.learned !== 'object') p.learned = {};
    if(!p.campaign || typeof p.campaign !== 'object') p.campaign = { level: 0, lap: 0, cur: 0, best: 0, wins: 0, laps: 0, flagAt: '' };
    ['level','lap','cur','best','wins','laps'].forEach(function(f){
      if(typeof p.campaign[f] !== 'number' || isNaN(p.campaign[f])) p.campaign[f] = 0;
    });
    if(p.campaign.level >= 20){                   // 旧版通关记录 → 转成第 1 周目
      p.campaign.level = 0;
      p.campaign.lap = Math.max(1, p.campaign.lap | 0);
    }
    if(p.campaign.level < 0) p.campaign.level = 0;
    p.name = k;
    return p;
  }

  function loadStore(){
    var def = { active:'MARK', profiles:{ MARK:newProfile('MARK') }, settings:{ count:20, mode:'order', sound:true, volume:0.7, speechMode:'auto' } };
    var s = null;
    try{ s = JSON.parse(cloudData || localStorage.getItem(KEY) || 'null'); }catch(e){ s = null; }
    if(s && s.profiles && typeof s.profiles === 'object' && Object.keys(s.profiles).length){
      s.settings = Object.assign({}, def.settings, s.settings || {});
      Object.keys(s.profiles).forEach(function(k){ s.profiles[k] = fixProfile(s.profiles[k], k); });
      if(!s.profiles[s.active]) s.active = Object.keys(s.profiles)[0];
      return s;
    }
    // 从旧版迁移（保留星星 / 打卡 / 错词本）
    try{
      var o = JSON.parse(localStorage.getItem(OLD) || 'null');
      if(o && typeof o === 'object'){
        var nm = ((o.name || 'MARK') + '').trim() || 'MARK';
        var p = newProfile(nm);
        ['stars','spent','lastDay','days','ptr','wrong','sessions','correct','questions','redeemed','custom','lastCat','avatar'].forEach(function(f){
          if(o[f] !== undefined) p[f] = o[f];
        });
        p.learned = {};
        p.history = [{
          d: o.lastDay || '', t: '', mode:'学习', cat:'（旧版数据）',
          total: o.questions | 0, correct: o.correct | 0, star: 0
        }];
        def.profiles = {}; def.profiles[nm] = p; def.active = nm;
        def.settings = Object.assign({}, def.settings, o.settings || {});
      }
    }catch(e){}
    return def;
  }

  store = loadStore();
  state = store.profiles[store.active];
  if (!cloudData) persist(JSON.stringify(store));

  function save(){ persist(JSON.stringify(store)); }
  function balance(){ return Math.max(0, (state.stars|0) - (state.spent|0)); }
  function profileNames(){ return Object.keys(store.profiles); }

  function useProfile(name){
    name = (name || '').trim().slice(0, 12) || 'MARK';
    if(!store.profiles[name]) store.profiles[name] = newProfile(name);
    store.active = name;
    state = store.profiles[name];
    save();
  }

  function renameProfile(oldName, newName){
    newName = (newName || '').trim().slice(0, 12);
    if(!newName || newName === oldName) return;
    if(store.profiles[newName] && newName !== oldName) return;   // 已存在则视为切换
    var p = store.profiles[oldName];
    delete store.profiles[oldName];
    p.name = newName;
    store.profiles[newName] = p;
    store.active = newName;
    state = p;
    save();
  }

  /* ================= 小工具 ================= */
  function $(id){ return document.getElementById(id); }
  function pad(n){ return n < 10 ? '0' + n : '' + n; }
  function todayStr(d){ d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); }
  function nowTime(){ var d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }

  var toastT = null;
  function toast(msg){
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function(){ el.classList.remove('show'); }, 1900);
  }

  /* ================= 弹窗 ================= */
  var modalOkCb = null;

  function openModal(opt){
    $('modalEmoji').textContent = opt.emoji || '🎁';
    $('modalTitle').textContent = opt.title || '确定吗？';
    var t = $('modalText');
    if(opt.text){ t.textContent = opt.text; t.style.display = 'block'; }
    else { t.textContent = ''; t.style.display = 'none'; }
    $('modalBody').innerHTML = opt.html || '';
    $('modalOk').textContent = opt.ok || '确定';
    $('modalCancel').textContent = opt.cancel || '取消';
    $('modalMask').style.display = 'flex';
    modalOkCb = opt.onOk || null;
    if(typeof opt.after === 'function') opt.after();
  }
  function closeModal(){ $('modalMask').style.display = 'none'; modalOkCb = null; }

  $('modalOk').addEventListener('click', function(){
    var cb = modalOkCb;
    if(cb && cb() === false) return;
    closeModal();
  });
  $('modalCancel').addEventListener('click', closeModal);
  $('modalMask').addEventListener('click', function(e){ if(e.target === $('modalMask')) closeModal(); });

  /* ================= 声音 ================= */
  var actx = null;
  function vol(){
    var v = store.settings.volume;
    return (typeof v === 'number' && v >= 0 && v <= 1) ? v : 0.7;
  }
  function ac(){
    if(!actx){
      var AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return null;
      actx = new AC();
    }
    return actx;
  }
  function tone(freq, dur, type, delay, gain){
    if(!store.settings.sound || vol() <= 0) return;
    try{
      var a = ac(); if(!a) return;
      var t0 = a.currentTime + (delay || 0);
      var o = a.createOscillator(), g = a.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, (gain || 0.12) * vol()), t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(a.destination);
      o.start(t0); o.stop(t0 + dur + 0.03);
    }catch(e){}
  }

  var PRAISES = [
    { t:'PERFECT!',   c:'太棒了！',     s:'perfect' },
    { t:'AMAZING!',   c:'太厉害了！',   s:'amazing' },
    { t:'WONDERFUL!', c:'非常好！',     s:'wonderful' },
    { t:'EXCELLENT!', c:'真优秀！',     s:'excellent' },
    { t:'GREAT JOB!', c:'干得好！',     s:'greatjob' },
    { t:'WELL DONE!', c:'完成得漂亮！', s:'welldone' },
    { t:'SUPER!',     c:'超级棒！',     s:'super' }
  ];
  var lastPraise = -1;

  // 频率滑音
  function glide(f0, f1, dur, type, gain, delay){
    if(!store.settings.sound || vol() <= 0) return;
    try{
      var a = ac(); if(!a) return;
      var t0 = a.currentTime + (delay || 0);
      var o = a.createOscillator(), g = a.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f0, t0);
      o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, (gain || 0.09) * vol()), t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(a.destination);
      o.start(t0); o.stop(t0 + dur + 0.03);
    }catch(e){}
  }

  // 噪声爆破（炮击 / 爆炸）
  function noiseBurst(dur, gain, f0, f1, delay, type){
    if(!store.settings.sound || vol() <= 0) return;
    try{
      var a = ac(); if(!a) return;
      var t0 = a.currentTime + (delay || 0);
      var len = Math.max(1, Math.floor(a.sampleRate * dur));
      var buf = a.createBuffer(1, len, a.sampleRate);
      var d = buf.getChannelData(0);
      for(var i = 0; i < len; i++){
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
      }
      var src = a.createBufferSource(); src.buffer = buf;
      var f = a.createBiquadFilter();
      f.type = type || 'lowpass';
      f.frequency.setValueAtTime(f0, t0);
      if(f1) f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
      var g = a.createGain();
      g.gain.setValueAtTime(Math.max(0.0001, (gain || 0.3) * vol()), t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f); f.connect(g); g.connect(a.destination);
      src.start(t0);
    }catch(e){}
  }

  // 七种答对音效，波形 / 音高走向 / 节奏各不相同
  var PRAISE_SFX = {
    perfect: function(){                 // 明亮四连音（铃铛）
      [1046, 1318, 1568, 2093].forEach(function(f, i){ tone(f, 0.12, 'sine', i * 0.062, 0.10); });
    },
    amazing: function(){                 // 方波上滑音 + 高音收尾
      glide(392, 1568, 0.26, 'square', 0.055, 0);
      tone(2093, 0.13, 'sine', 0.27, 0.07);
    },
    wonderful: function(){               // 叮—咚（纯五度长音）
      tone(880, 0.20, 'sine', 0, 0.12);
      tone(1320, 0.30, 'sine', 0.17, 0.09);
    },
    excellent: function(){               // 短促三连（三角波）
      [784, 784, 1175].forEach(function(f, i){ tone(f, 0.075, 'triangle', i * 0.105, 0.09); });
    },
    greatjob: function(){                // 低→高琶音（三角波）
      [523, 659, 784, 1046].forEach(function(f, i){ tone(f, 0.10, 'triangle', i * 0.068, 0.085); });
    },
    welldone: function(){                // 温暖双和弦
      tone(392, 0.24, 'sine', 0, 0.09);
      tone(494, 0.24, 'sine', 0.02, 0.06);
      tone(587, 0.32, 'sine', 0.15, 0.075);
    },
    super: function(){                   // 闪光高音群 + 回响
      [1568, 2093, 2637].forEach(function(f, i){ tone(f, 0.08, 'sine', i * 0.05, 0.065); });
      tone(3136, 0.16, 'sine', 0.19, 0.045);
      tone(2093, 0.2, 'sine', 0.26, 0.03);
    }
  };

  var lastUtter = null;
  var voiceList = [];
  var onlineAudio = null;

  var spkState = { started: false, busy: false, text: '', lastErr: '' };

  function loadVoices(){
    try{ voiceList = window.speechSynthesis.getVoices() || []; }catch(e){ voiceList = []; }
  }
  function englishVoices(){
    loadVoices();
    var out = [];
    for(var i = 0; i < voiceList.length; i++){
      if(/^en/i.test(voiceList[i].lang || '')) out.push(voiceList[i]);
    }
    return out;
  }
  if('speechSynthesis' in window){
    loadVoices();
    try{
      window.speechSynthesis.onvoiceschanged = loadVoices;
      // 有的浏览器语音列表要等一会儿才齐
      setTimeout(loadVoices, 300);
      setTimeout(loadVoices, 1200);
    }catch(e){}
  }

  function makeUtter(text, lang, rate){
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang || 'en-US';
    u.rate = Math.max(0.5, Math.min(1.5, rate || 0.92));
    u.pitch = 1.0;
    u.volume = Math.min(1, Math.max(0.1, vol() * 1.2));
    return u;
  }

  // 系统语音：不指定 voice（跨设备最稳），带事件回调判断是否真的开口
  function sysSpeak(text, lang, rate){
    if(!('speechSynthesis' in window)) return false;
    try{
      var syn = window.speechSynthesis;
      if(syn.speaking || syn.pending){ try{ syn.cancel(); }catch(e){} }
      var u = makeUtter(text, lang, rate);
      spkState.started = false;
      spkState.busy = false;
      spkState.text = text;
      spkState.lastErr = '';
      u.onstart = function(){
        if(u !== lastUtter) return;
        spkState.started = true; spkState.busy = true; setSpeakingUI(true);
      };
      u.onend = function(){
        if(u !== lastUtter) return;      // 旧语音的收尾事件不能影响新的朗读
        spkState.busy = false; setSpeakingUI(false);
      };
      u.onerror = function(e){
        if(u !== lastUtter) return;
        spkState.lastErr = (e && e.error) ? e.error : 'error';
        spkState.busy = false;
        setSpeakingUI(false);
      };
      lastUtter = u;
      try{ if(syn.paused) syn.resume(); }catch(e){}
      syn.speak(u);
      return true;
    }catch(e){ spkState.lastErr = e.message; return false; }
  }

  // 在线发音（有道词典语音接口，带缓存）
  function playOnline(word){ return false; }

  // 统一入口：自动模式 = 系统语音，700ms 内没开口就切在线
  function speakWord(text, rate){
    if(!store.settings.sound) return false;
    if(vol() <= 0) return false;
    var mode = store.settings.speechMode || 'auto';

    if(mode === 'online') return playOnline(text);

    var hasEn = englishVoices().length > 0;
    if(!hasEn && mode === 'auto'){          // 系统里没有英文语音，直接走在线
      if(playOnline(text)) return true;
    }
    var ok = sysSpeak(text, 'en-US', rate);
    if(mode === 'system') return ok;
    if(!ok && mode === 'auto') return playOnline(text);

    if(ok && mode === 'auto'){
      var t = text;
      setTimeout(function(){
        if(spkState.text === t && !spkState.started && !spkState.busy){
          playOnline(t);
        }
      }, 700);
    }
    return ok;
  }

  // 旧的 speak() 保留给鼓励语（不走在线，避免频繁请求）
  function speak(text, lang, rate){
    if(!store.settings.sound) return false;
    if(vol() <= 0) return false;
    return sysSpeak(text, lang || 'en-US', rate || 0.95);
  }

  var speakUITimer = null;
  function setSpeakingUI(on){
    var b = $('btnSpeak');
    if(!b) return;
    clearTimeout(speakUITimer);
    if(on){
      b.textContent = '🔊 正在读…';
      speakUITimer = setTimeout(function(){ b.textContent = '🔊 听一听怎么读'; }, 4000);
    }else{
      b.textContent = '🔊 听一听怎么读';
    }
  }

  function voiceReport(){
    var syn = ('speechSynthesis' in window) ? window.speechSynthesis : null;
    var vs = syn ? (syn.getVoices() || []) : [];
    var en = englishVoices();
    var mode = store.settings.speechMode || 'auto';
    var name = { auto: '自动（系统语音）', system: '仅系统语音', online: '仅在线发音' }[mode] || mode;
    var lines = [];
    lines.push('浏览器语音合成：' + (syn ? '支持' : '不支持'));
    lines.push('语音总数：' + vs.length + '　英文语音：' + en.length);
    if(en.length){
      lines.push('英文语音示例：' + en[0].name + '（' + en[0].lang + '，' + (en[0].localService === false ? '网络' : '本地') + '）');
    }else{
      lines.push('英文语音：无');
    }
    lines.push('上次错误：' + (spkState.lastErr || '无'));
    lines.push('发音方式：' + name);
    lines.push('网络：' + (navigator.onLine ? '已连接' : '离线'));
    return lines.join('\n');
  }

  // 答对：不同音效 + 鼓励语
  function praise(streak){
    var i = Math.floor(Math.random() * PRAISES.length);
    if(i === lastPraise) i = (i + 1) % PRAISES.length;
    lastPraise = i;
    var p = PRAISES[i];
    try{ PRAISE_SFX[p.s](); }catch(e){}
    if(streak >= 3) tone(1568 + Math.min(streak - 3, 3) * 60, 0.16, 'triangle', 0.3, 0.06);

    var el = $('praise');
    el.innerHTML = p.t + (streak >= 3 ? ' ×' + streak : '') + '<span class="cn">' + p.c + '</span>';
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');

    speak(p.t.replace('!', '').toLowerCase(), 'en-US', 1.0);
  }

  function sfxWrong(){
    tone(300, 0.16, 'triangle', 0, 0.09);
    tone(200, 0.22, 'triangle', 0.11, 0.08);
    tone(150, 0.26, 'triangle', 0.22, 0.07);
  }
  function sfxStar(){
    [784,988,1319].forEach(function(f,k){ tone(f, 0.16, 'sine', k*0.1, 0.1); });
  }
  function sfxTick(){ tone(1200, 0.05, 'square', 0, 0.04); }
  function sfxBoom(){                       // 炮弹命中：噪声爆裂 + 低频冲击
    noiseBurst(0.42, 0.34, 2600, 160);
    tone(82, 0.34, 'sine', 0, 0.20);
    tone(55, 0.40, 'triangle', 0.02, 0.16);
    noiseBurst(0.9, 0.08, 900, 120, 0.06);
  }
  function sfxCannon(){                     // 开炮：短促气爆
    noiseBurst(0.16, 0.20, 1800, 300);
    tone(150, 0.14, 'square', 0, 0.07);
  }

  /* ================= 页面 ================= */
  function showScreen(id){
    var list = document.querySelectorAll('.screen');
    for(var i=0;i<list.length;i++) list[i].classList.remove('active');
    var el = $('screen-' + id);
    if(el) el.classList.add('active');
    try{ window.scrollTo({ top:0, behavior:'smooth' }); }catch(e){}
  }
  function refreshTopbar(){
    $('starBalance').textContent = balance();
    $('btnSound').textContent = store.settings.sound ? '🔊' : '🔇';
  }

  /* ================= 首页 ================= */
  function calcStreak(){
    if(!state.days.length) return 0;
    var set = {}; state.days.forEach(function(d){ set[d] = true; });
    var d = new Date();
    if(!set[todayStr(d)]) d.setDate(d.getDate() - 1);
    var n = 0;
    while(set[todayStr(d)] && n < 9999){ n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function renderHome(){
    refreshTopbar();
    $('hStars').textContent = balance();
    $('hStreak').textContent = calcStreak();
    $('hDays').textContent = state.days.length;
    $('libInfo').textContent = CATS.length + ' 个分类 · ' + ALL.length + ' 个词条';
    $('avatarEmoji').textContent = state.avatar || '🦊';
    $('heroName').textContent = state.name || '小朋友';

    var doneToday = (state.lastDay === todayStr());
    var card = $('todayCard');
    if(doneToday){
      card.classList.add('done');
      $('todayEmoji').textContent = '⭐';
      $('todayTitle').textContent = '今天的红星已经拿到啦！';
      $('todaySub').textContent = '还想再练一组也很棒哦～';
    }else{
      card.classList.remove('done');
      $('todayEmoji').textContent = '🌤️';
      $('todayTitle').textContent = '今天还没完成任务';
      $('todaySub').textContent = '完成一组单词（或一局对战），红星就归你啦';
    }

    renderCampaign();

    var wc = Object.keys(state.wrong).length;
    var bw = $('btnWrong');
    if(wc > 0){
      bw.style.display = 'block';
      bw.textContent = '错词本 ' + wc;
    }else{
      bw.style.display = 'none';
    }
  }

  /* ================= 名字 / 头像 ================= */
  var AVATARS = ['🦊','🐱','🐶','🐰','🐼','🐻','🐯','🐨'];
  var pickedAvatar = '🦊';

  function openProfileEditor(){
    pickedAvatar = state.avatar || '🦊';
    var grid = AVATARS.map(function(a){
      return '<button type="button" class="avatar-opt' + (a === pickedAvatar ? ' on' : '') + '" data-a="' + a + '">' + a + '</button>';
    }).join('');
    var names = profileNames();
    var chips = names.map(function(n){
      return '<button type="button" class="name-chip' + (n === store.active ? ' cur' : '') + '" data-n="' + escapeHtml(n) + '">' + escapeHtml(n) + '</button>';
    }).join('');

    openModal({
      emoji: pickedAvatar,
      title: '主角是谁呀？',
      html:
        '<div class="field-label">选一个头像</div>' +
        '<div class="avatar-grid" id="avatarGrid">' + grid + '</div>' +
        '<div class="field-label">名字（换新名字＝新建一份档案）</div>' +
        '<input class="name-input" id="editName" maxlength="12" placeholder="MARK">' +
        (names.length > 1 ? '<div class="field-label">已存档的小主角</div><div class="name-chips" id="nameChips">' + chips + '</div>' : ''),
      ok: '保存',
      after: function(){
        $('editName').value = state.name || '';
        $('avatarGrid').addEventListener('click', function(e){
          var b = e.target.closest('.avatar-opt');
          if(!b) return;
          pickedAvatar = b.getAttribute('data-a');
          var all = $('avatarGrid').querySelectorAll('.avatar-opt');
          for(var i=0;i<all.length;i++) all[i].classList.toggle('on', all[i] === b);
          $('modalEmoji').textContent = pickedAvatar;
        });
        var nc = $('nameChips');
        if(nc) nc.addEventListener('click', function(e){
          var b = e.target.closest('.name-chip');
          if(!b) return;
          $('editName').value = b.getAttribute('data-n');
        });
      },
      onOk: function(){
        var nm = ($('editName').value || '').trim().slice(0, 12) || 'MARK';
        if(nm !== store.active && store.profiles[nm]){
          useProfile(nm);                       // 已有档案：切换
        }else if(nm !== store.active){
          renameProfile(store.active, nm);      // 新名字：改名（记录跟着走）
        }
        state.avatar = pickedAvatar;
        save();
        syncSelCat(); renderSetup();
        renderHome(); renderStats(); renderRewards();
        toast('你好，' + state.name + '！' + state.avatar);
      }
    });
  }

  /* ================= 设置页 ================= */
  var selCat = 'all';
  function syncSelCat(){
    selCat = (state.lastCat && (state.lastCat === 'all' || CATMAP[state.lastCat])) ? state.lastCat : 'all';
  }
  syncSelCat();

  function renderSetup(){
    var grid = $('catGrid');
    grid.innerHTML = '';
    grid.appendChild(makeCatCard('all', '🎲', '全部混合', '从所有分类里随机抽', ALL.length));

    var wc = Object.keys(state.wrong).length;
    var wCard = makeCatCard('wrong', '📕', '错词本', wc > 0 ? '复习做错的单词' : '还没有错词', wc);
    if(wc === 0) wCard.classList.add('disabled');
    grid.appendChild(wCard);

    CATS.forEach(function(cat){
      var ptr = state.ptr[cat.id] || 0;
      grid.appendChild(makeCatCard(cat.id, cat.emoji, cat.name, '已学 ' + ptr + ' / ' + cat.total, cat.total));
    });

    updateCountUI(); updateModeUI(); syncSelHighlight();
  }

  function makeCatCard(id, emoji, name, meta, total){
    var b = document.createElement('button');
    b.className = 'cat-card';
    b.setAttribute('data-cat', id);
    b.innerHTML = '<div class="cc-emoji">' + emoji + '</div><div class="cc-body">' +
      '<div class="cc-name">' + escapeHtml(name) + '</div><div class="cc-meta">' + escapeHtml(meta) + '</div></div>';
    b.addEventListener('click', function(){
      if(id === 'wrong' && total === 0){ toast('错词本还是空的，先去做题吧～'); return; }
      selCat = id; state.lastCat = id; save(); syncSelHighlight();
    });
    return b;
  }

  function syncSelHighlight(){
    var cards = document.querySelectorAll('.cat-card');
    for(var i=0;i<cards.length;i++) cards[i].classList.toggle('selected', cards[i].getAttribute('data-cat') === selCat);
    var nm = selCat === 'all' ? '全部混合' : (selCat === 'wrong' ? '错词本' : (CATMAP[selCat] ? CATMAP[selCat].name : ''));
    $('setupNote').textContent = nm ? '当前：' + nm : '';
  }

  function updateCountUI(){
    var c = store.settings.count;
    $('countRange').value = c;
    $('countBadge').textContent = c + ' 个';
    var chips = $('countChips'); chips.innerHTML = '';
    [10,15,20,30,40,50].forEach(function(n){
      var b = document.createElement('button');
      b.className = 'chip' + (n === c ? ' on' : '');
      b.textContent = n;
      b.addEventListener('click', function(){ store.settings.count = n; save(); updateCountUI(); });
      chips.appendChild(b);
    });
  }
  function updateModeUI(){
    var btns = $('modeSeg').querySelectorAll('button');
    for(var i=0;i<btns.length;i++) btns[i].classList.toggle('active', btns[i].getAttribute('data-mode') === store.settings.mode);
  }
  $('countRange').addEventListener('input', function(){
    store.settings.count = parseInt(this.value, 10) || 20;
    save();
    $('countBadge').textContent = store.settings.count + ' 个';
    var chips = $('countChips').querySelectorAll('.chip');
    for(var i=0;i<chips.length;i++) chips[i].classList.toggle('on', parseInt(chips[i].textContent,10) === store.settings.count);
  });
  $('modeSeg').addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b) return;
    store.settings.mode = b.getAttribute('data-mode'); save(); updateModeUI();
  });

  /* ================= 出题 ================= */
  function pickMeanings(word, pool){
    var src = (pool && pool.length >= 3 ? pool : ALL);
    var bag = [];
    for(var i=0;i<src.length;i++){ if(src[i].c !== word.c) bag.push(src[i].c); }
    bag = shuffle(bag);
    var used = {}; used[word.c] = true;
    var out = [];
    for(var j=0;j<bag.length && out.length<2;j++){ if(!used[bag[j]]){ used[bag[j]]=true; out.push(bag[j]); } }
    if(out.length < 2){
      var all2 = shuffle(ALL.map(function(x){ return x.c; }));
      for(var k=0;k<all2.length && out.length<2;k++){ if(!used[all2[k]]){ used[all2[k]]=true; out.push(all2[k]); } }
    }
    return shuffle([word.c].concat(out));
  }
  /* ================= 学习模式 ================= */
  var session = null;
  var streak = 0;

  function buildSession(catId){
    var count = Math.max(10, Math.min(50, store.settings.count | 0 || 20));
    var queue = [], catName = '';

    if(catId === 'all'){
      catName = '全部混合';
      queue = shuffle(ALL.slice()).slice(0, count);
    }else if(catId === 'wrong'){
      catName = '错词本';
      var ws = Object.keys(state.wrong).map(function(k){ return WORDMAP[k]; }).filter(Boolean);
      queue = shuffle(ws).slice(0, count);
    }else{
      var cat = CATMAP[catId];
      if(!cat) return null;
      catName = cat.name;
      var list = cat.list.slice();
      if(store.settings.mode === 'random'){
        queue = shuffle(list).slice(0, count);
      }else{
        var ptr = (state.ptr[catId] || 0) % list.length;
        var rotated = list.slice(ptr).concat(list.slice(0, ptr));
        queue = rotated.slice(0, Math.min(count, rotated.length));
        state.ptr[catId] = (ptr + queue.length) % list.length;
        save();
      }
    }
    if(queue.length < 2){ toast('这里的单词太少啦，换个主题试试～'); return null; }

    session = { catId:catId, catName:catName, queue:queue, i:0, correct:0, locked:false, opts:[], wrongWords:[] };
    streak = 0;
    return session;
  }

  function renderQuestion(){
    var q = session.queue[session.i];
    session.locked = false;
    var cat = CATMAP[q.cat];
    session.opts = pickMeanings(q, cat ? cat.list : null);

    $('qIndex').textContent = (session.i + 1) + ' / ' + session.queue.length;
    $('qScore').textContent = '✅ ' + session.correct;
    $('progressBar').style.width = Math.round((session.i / session.queue.length) * 100) + '%';

    $('posChip').textContent = cat ? cat.name : '单词';
    var wt = $('wordText');
    wt.textContent = q.w;
    wt.classList.remove('pop'); void wt.offsetWidth; wt.classList.add('pop');
    $('wordIpa').textContent = q.ipa ? '/' + String(q.ipa).trim() + '/' : '';

    var box = $('options'); box.innerHTML = '';
    session.opts.forEach(function(m, idx){
      var b = document.createElement('button');
      b.className = 'opt';
      b.innerHTML = '<span class="num">' + (idx+1) + '</span><span class="ot">' + escapeHtml(m) + '</span>';
      b.addEventListener('click', function(){ answer(m, b); });
      box.appendChild(b);
    });

    var note = $('qNote');
    note.className = 'q-note';
    note.innerHTML = '';

    if(store.settings.sound) speakWord(q.w, 0.82);
  }

  /* 答完一题后的用法 / 例句讲解 */
  function showQNote(q, ok){
    var note = $('qNote');
    if(!note) return false;
    var parts = [];
    var senses = String(q.c || '').split('；').filter(function(x){ return x.trim(); });
    if(senses.length > 1){
      var mark = ['①', '②', '③', '④'];
      parts.push('💡 <b>一词多义</b>　' + senses.map(function(x, i){ return (mark[i] || '·') + ' ' + escapeHtml(x.trim()); }).join('　'));
    }
    if(q.u) parts.push('💡 <b>用法</b>　' + escapeHtml(q.u));
    if(q.ex) parts.push('📖 <b>例句</b>　<span class="nw">' + escapeHtml(q.ex) + '</span>');
    if(!parts.length){ note.className = 'q-note'; note.innerHTML = ''; return false; }
    note.className = 'q-note show' + (ok ? ' ok' : '');
    note.innerHTML = parts.join('<br>');
    return true;
  }

  function markOptions(q, btn){
    var opts = document.querySelectorAll('#options .opt');
    for(var i=0;i<opts.length;i++){
      var txt = opts[i].querySelector('.ot').textContent;
      if(txt === q.c) opts[i].classList.add('correct');
      else if(opts[i] === btn) opts[i].classList.add('wrong');
      else opts[i].classList.add('dim');
      opts[i].style.pointerEvents = 'none';
    }
  }

  function recordAnswer(q, ok){
    state.questions = (state.questions | 0) + 1;
    if(ok){
      state.correct = (state.correct | 0) + 1;
      state.learned[q.w] = (state.learned[q.w] | 0) + 1;
      if(state.wrong[q.w]) delete state.wrong[q.w];
    }else{
      state.wrong[q.w] = { w:q.w, c:q.c, times:((state.wrong[q.w] && state.wrong[q.w].times) | 0) + 1 };
    }
    save();
  }

  function answer(choice, btn){
    if(!session || session.locked) return;
    session.locked = true;
    var q = session.queue[session.i];
    var ok = (choice === q.c);
    markOptions(q, btn);
    var noted = showQNote(q, ok);

    if(ok){
      session.correct++;
      streak++;
      recordAnswer(q, true);
      praise(streak);
      flyStar(btn);
    }else{
      streak = 0;
      recordAnswer(q, false);
      session.wrongWords.push(q.w);
      sfxWrong();
      speak(q.w, 'en-US', 0.82);
    }
    $('qScore').textContent = '✅ ' + session.correct;

    setTimeout(function(){
      if(!session) return;
      session.i++;
      if(session.i >= session.queue.length) endSession();
      else renderQuestion();
    }, ok ? (noted ? 1500 : 850) : (noted ? 2600 : 1450));
  }

  function flyStar(anchor){
    try{
      var r = anchor.getBoundingClientRect();
      var s = document.createElement('div');
      s.className = 'fly-star'; s.textContent = '⭐';
      s.style.left = (r.left + r.width*0.5 - 11) + 'px';
      s.style.top = (r.top + r.height*0.3) + 'px';
      document.body.appendChild(s);
      setTimeout(function(){ s.remove(); }, 1200);
    }catch(e){}
  }

  function pushHistory(mode, cat, total, correct, star){
    state.history.unshift({
      d: todayStr(), t: nowTime(), mode: mode, cat: cat,
      total: total, correct: correct, star: star
    });
    if(state.history.length > 60) state.history.length = 60;
  }

  function awardDaily(){
    var t = todayStr();
    if(state.lastDay === t) return false;
    state.lastDay = t;
    if(state.days.indexOf(t) === -1) state.days.push(t);
    state.stars = (state.stars | 0) + 1;
    return true;
  }

  function endSession(){
    var total = session.queue.length;
    var correct = session.correct;
    var rate = total ? Math.round(correct / total * 100) : 0;

    state.sessions = (state.sessions | 0) + 1;
    var gotStar = awardDaily();
    pushHistory('学习', session.catName, total, correct, gotStar ? 1 : 0);
    save();

    $('resCorrect').textContent = correct;
    $('resTotal').textContent = total;
    $('resRate').textContent = rate + '%';
    $('progressBar').style.width = '100%';

    var title, line;
    if(rate >= 95){ title = '完美通关！🏆'; line = '几乎全对，太厉害啦！'; }
    else if(rate >= 80){ title = '非常棒！🌟'; line = '记得很牢，继续保持！'; }
    else if(rate >= 60){ title = '完成啦！👍'; line = '再复习一下错词会更好哦。'; }
    else{ title = '坚持完成，很棒！💪'; line = '错词已经收进错词本，多练几遍就记住啦。'; }
    $('resTitle').textContent = title;
    $('resLine').textContent = session.catName + ' · 本组完成';

    if(gotStar){
      $('resStarIcon').textContent = '⭐';
      $('resStarMsg').innerHTML = '获得今日红星 +1 ⭐　当前可用 <b>' + balance() + '</b> 颗';
      sfxStar(); confetti(); burstStars();
    }else{
      $('resStarIcon').textContent = '🎉';
      $('resStarMsg').innerHTML = '今天的红星已经拿过啦，明天再来一颗！　当前可用 <b>' + balance() + '</b> 颗';
    }

    renderHome();
    showScreen('result');
  }

  function confetti(){
    var colors = ['#ff8fb1','#ffd93d','#6ec6ff','#7ed957','#b39ddb','#ffa552','#ff5d5d'];
    for(var i=0;i<46;i++){
      (function(i){
        var d = document.createElement('div');
        d.className = 'confetti';
        d.style.left = (Math.random()*100) + 'vw';
        d.style.background = colors[i % colors.length];
        d.style.animationDuration = (1.9 + Math.random()*1.6) + 's';
        d.style.animationDelay = (Math.random()*0.5) + 's';
        d.style.width = (7 + Math.random()*7) + 'px';
        d.style.height = (10 + Math.random()*10) + 'px';
        document.body.appendChild(d);
        setTimeout(function(){ d.remove(); }, 4200);
      })(i);
    }
  }
  function burstStars(){
    var rect = $('resStarIcon').getBoundingClientRect();
    for(var i=0;i<9;i++){
      (function(i){
        var s = document.createElement('div');
        s.className = 'fly-star'; s.textContent = '✨';
        s.style.left = (rect.left + rect.width/2 + (Math.random()*160 - 80)) + 'px';
        s.style.top = (rect.top + Math.random()*60) + 'px';
        s.style.animationDelay = (i*0.06) + 's';
        document.body.appendChild(s);
        setTimeout(function(){ s.remove(); }, 1500);
      })(i);
    }
  }

  /* ================= 对战 ================= */
  var BATTLE_ROUNDS = 10;          // 普通关：10 题
  var BOSS_ROUNDS = 12;            // BOSS 关：12 题（10 格装甲，最多允许错 2 题）
  var BATTLE_TIME = 5;
  var MAX_LEVEL = 20;
  var HP_ME = 3;                   // 我方 3 辆车 = 3 格血
  var HP_FOE = 3;                  // 普通关敌方 3 辆车 = 3 格血（一炮一车）
  var HP_BOSS = 10;                // BOSS 关敌方合计 10 格
  var BOSS_CORE_HP = 8;            //   └ 指挥车 8 格装甲
                                   //   └ 护卫 2 辆 × 1 格 = 2 格
  var FIELD_W = 366, FIELD_H = 200; // 战场设计尺寸（无布局时的坐标回退用）
  function isBoss(lv){ return lv % 5 === 0; }
  // 20 个关卡名与 20 张切片背景一一对应（已逐张按画面内容核对）
  var TERRAIN = ['首都广场','工业区','高架桥','港口码头','城市路口',
                 '街角','郊外公路','草原公路','丘陵草原','海岸公路',
                 '山谷草原','城市绿野','辽阔草原','湿地草原','海岸崖壁',
                 '密林','山区','石桥','河谷','海滩'];

  function tankImg(side){
    return '<img src="' + (side === 'me' ? ASSETS.tankMe : ASSETS.tankFoe) + '" alt="">';
  }

  var battle = null;

  function startBattle(){
    var lv = (((state.campaign && state.campaign.level) | 0) % MAX_LEVEL) + 1;
    var boss = isBoss(lv);
    var rounds = boss ? BOSS_ROUNDS : BATTLE_ROUNDS;
    var foeMax = boss ? HP_BOSS : HP_FOE;
    battle = {
      level: lv, boss: boss, rounds: rounds,
      queue: shuffle(ALL.slice()).slice(0, rounds),
      i: 0, myHP: HP_ME, foeHP: foeMax, maxMe: HP_ME, maxFoe: foeMax,
      correct: 0, locked: true, answered: 0,
      tid: null, t0: 0, over: false, combo: 0
    };
    streak = 0;

    $('field').style.backgroundImage = 'url("' + ASSETS.bg[lv - 1] + '")';
    $('field').className = 'field' + (boss ? ' boss' : '');
    $('levelTag').innerHTML = '第 ' + lv + ' 关 · ' + TERRAIN[lv - 1] + (boss ? ' <b class="boss-tag">BOSS</b>' : '');
    $('coMe').textContent = state.avatar || '🦊';
    $('chipMe').textContent = '橙星装甲队';
    $('chipFoe').textContent = boss ? 'BOSS 指挥车' : '绿地球装甲队';
    $('hpNumFoe').className = 'hpnum' + (boss ? ' bossnum' : '');
    $('battleTip').innerHTML = boss
      ? '5 秒内答对 → 击毁 1 辆敌方装甲　·　<b style="color:#e2402c">BOSS 关：先打掉 2 辆护卫，再击穿指挥车 ' + BOSS_CORE_HP + ' 层装甲（共 ' + BOSS_ROUNDS + ' 题）</b>'
      : '5 秒内答对 → 击毁敌方 1 辆装甲车；超时或答错 → 我方被击毁 1 辆';
    buildField();
    renderHP();
    renderBattleQuestion();
    showScreen('battle');
    bgmOn();
  }

  function makeUnit(side, role, leftPct, bottomPx, hp){
    var d = document.createElement('div');
    d.className = 'unit ' + role;
    d.style.left = leftPct + '%';
    d.style.bottom = bottomPx + 'px';
    d.setAttribute('data-role', role);
    d.setAttribute('data-side', side);
    d.setAttribute('data-hp', hp);
    d.setAttribute('data-maxhp', hp);
    var extra = '';
    if(role === 'core'){                       // 指挥车：车身上一排装甲灯
      var lights = '';
      for(var i = 0; i < hp; i++) lights += '<i class="on"></i>';
      extra = '<div class="armor">' + lights + '</div><b class="core-flag">★</b>';
    }
    d.innerHTML = tankImg(side) + extra;
    return d;
  }

  /* 普通关：我方 3 辆 vs 敌方 3 辆，一炮一车
     BOSS 关：我方 3 辆 vs 敌方 2 辆护卫（各 1 格）+ 1 辆指挥车（8 格）= 10 格 */
  function buildField(){
    var boss = !!(battle && battle.boss);
    var laneMe = $('laneMe'), laneFoe = $('laneFoe');
    laneMe.innerHTML = ''; laneFoe.innerHTML = '';
    laneMe.className = 'lane me';
    laneFoe.className = 'lane foe' + (boss ? ' wide' : '');
    if($('groundFx')) $('groundFx').innerHTML = '';
    if($('smokeFx')) $('smokeFx').innerHTML = '';

    battle.me = [
      makeUnit('me', 'tank', 3,  6,  1),
      makeUnit('me', 'tank', 28, 26, 1),
      makeUnit('me', 'tank', 53, 10, 1)
    ];
    battle.me.forEach(function(u){ laneMe.appendChild(u); });

    if(boss){
      battle.core = makeUnit('foe', 'core', 56, 60, BOSS_CORE_HP);
      battle.escorts = [
        makeUnit('foe', 'escort', 42, 10, 1),
        makeUnit('foe', 'escort', 68, 10, 1)
      ];
      laneFoe.appendChild(battle.core);                 // 指挥车在后，先画
      battle.escorts.forEach(function(u){ laneFoe.appendChild(u); });
      battle.foe = [battle.core].concat(battle.escorts);
    }else{
      battle.core = null;
      battle.escorts = [];
      battle.foe = [
        makeUnit('foe', 'tank', 3,  26, 1),
        makeUnit('foe', 'tank', 28, 6,  1),
        makeUnit('foe', 'tank', 53, 28, 1)
      ];
      battle.foe.forEach(function(u){ laneFoe.appendChild(u); });
    }
  }

  function aliveUnits(side){
    var arr = (side === 'me' ? (battle.me || []) : (battle.foe || []));
    var out = [];
    for(var i = 0; i < arr.length; i++){
      if(arr[i] && (arr[i].getAttribute('data-hp') | 0) > 0 && !arr[i].classList.contains('dead')) out.push(arr[i]);
    }
    return out;
  }

  /* BOSS 关先打护卫，护卫清空后才打指挥车；我方从最靠前线的车开始被击毁 */
  function pickTarget(side){
    var alive = aliveUnits(side);
    if(!alive.length) return null;
    if(side === 'foe' && battle.boss){
      var esc = alive.filter(function(u){ return u.getAttribute('data-role') === 'escort'; });
      if(esc.length) return esc[0];
    }
    return side === 'me' ? alive[alive.length - 1] : alive[0];
  }

  /* 单位中心在战场中的百分比坐标 */
  function unitPoint(laneEl, unitEl, side){
    var field = $('field');
    if(unitEl && field && unitEl.getBoundingClientRect && field.getBoundingClientRect){
      var fr = field.getBoundingClientRect(), ur = unitEl.getBoundingClientRect();
      if(fr.width > 0 && ur.width > 0){
        var px = (ur.left + ur.width / 2 - fr.left) / fr.width * 100;
        var py = (fr.bottom - ur.top - ur.height * 0.42) / fr.height * 100;
        return { x: Math.max(2, Math.min(98, px)), y: Math.max(3, Math.min(94, py)) };
      }
    }
    // 无布局环境（测试/隐藏）下的坐标回退
    var role = unitEl ? unitEl.getAttribute('data-role') : 'tank';
    var leftPct = parseFloat(unitEl && unitEl.style.left) || 0;
    var bottomPx = parseFloat(unitEl && unitEl.style.bottom) || 0;
    var wide = !!(laneEl && laneEl.className.indexOf('wide') >= 0);
    var laneW = wide ? 100 : 50;
    var laneX = (side === 'me') ? 0 : (wide ? 0 : 50);
    var w = role === 'core' ? 118 : (role === 'escort' ? 66 : 80);
    var x = laneX + leftPct / 100 * laneW + (w / 2) / 3.66;
    var y = bottomPx / FIELD_H * 100 + 14;
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(3, Math.min(94, y)) };
  }

  function renderHP(){
    function draw(id, n, max, cls){
      var box = $(id); box.innerHTML = '';
      box.className = 'hpbar' + (max > 5 ? ' many' : '');
      for(var i=0;i<max;i++){
        var el = document.createElement('i');
        if(i < n) el.className = 'on ' + cls;
        box.appendChild(el);
      }
    }
    draw('hpMe', battle.myHP, battle.maxMe || HP_ME, 'me');
    draw('hpFoe', battle.foeHP, battle.maxFoe || HP_FOE, 'foe');
    $('hpNumMe').textContent = battle.myHP + '/' + (battle.maxMe || HP_ME);
    $('hpNumFoe').textContent = battle.foeHP + '/' + (battle.maxFoe || HP_FOE);
  }

  function renderBattleQuestion(){
    if(battle.over) return;
    var q = battle.queue[battle.i];
    var cat = CATMAP[q.cat];
    battle.opts = pickMeanings(q, cat ? cat.list : null);
    battle.locked = false;

    $('bWord').textContent = q.w;
    $('bIpa').textContent = q.ipa ? '/' + String(q.ipa).trim() + '/' : '';
    $('bRound').textContent = '第 ' + (battle.i + 1) + ' / ' + battle.rounds + ' 题' + (battle.boss ? ' · BOSS' : '');

    var box = $('bOptions'); box.innerHTML = '';
    battle.opts.forEach(function(m, idx){
      var b = document.createElement('button');
      b.className = 'opt';
      b.innerHTML = '<span class="num">' + (idx+1) + '</span><span class="ot">' + escapeHtml(m) + '</span>';
      b.addEventListener('click', function(){ battleAnswer(m, b); });
      box.appendChild(b);
    });

    if(store.settings.sound) speakWord(q.w, 0.92);
    startTimer();
  }

  function startTimer(){
    clearInterval(battle.tid);
    battle.t0 = Date.now();
    var fill = $('timerFill'), num = $('timerNum');
    fill.style.width = '100%';
    fill.className = 'timer-fill';
    num.textContent = BATTLE_TIME.toFixed(1);
    var ticked = false;

    battle.tid = setInterval(function(){
      var elapsed = (Date.now() - battle.t0) / 1000;
      var left = Math.max(0, BATTLE_TIME - elapsed);
      fill.style.width = (left / BATTLE_TIME * 100) + '%';
      num.textContent = left.toFixed(1);
      fill.className = 'timer-fill' + (left <= 1.5 ? ' danger' : (left <= 3 ? ' warn' : ''));
      if(left <= 2.05 && !ticked){ ticked = true; sfxTick(); }
      if(left <= 0){
        clearInterval(battle.tid);
        battleAnswer(null, null);
      }
    }, 50);
  }

  function stopTimer(){ if(battle && battle.tid){ clearInterval(battle.tid); battle.tid = null; } }

  function battleAnswer(choice, btn){
    if(!battle || battle.locked || battle.over) return;
    battle.locked = true;
    stopTimer();

    var q = battle.queue[battle.i];
    var ok = (choice === q.c);
    var opts = document.querySelectorAll('#bOptions .opt');
    for(var i=0;i<opts.length;i++){
      var txt = opts[i].querySelector('.ot').textContent;
      if(txt === q.c) opts[i].classList.add('correct');
      else if(opts[i] === btn) opts[i].classList.add('wrong');
      else opts[i].classList.add('dim');
      opts[i].style.pointerEvents = 'none';
    }

    battle.answered++;
    recordAnswer(q, ok);

    if(ok){
      battle.correct++;
      streak++;
      battle.foeHP = Math.max(0, battle.foeHP - 1);
      praise(streak);
      attack('me');
    }else{
      streak = 0;
      battle.myHP = Math.max(0, battle.myHP - 1);
      sfxWrong();
      attack('foe');
    }

    setTimeout(function(){
      if(!battle || battle.over) return;
      renderHP();
      if(battle.myHP <= 0 || battle.foeHP <= 0){ finishBattle(); return; }
      battle.i++;
      if(battle.i >= battle.queue.length){ finishBattle(); return; }
      renderBattleQuestion();
    }, 1150);
  }

  function attack(by){
    if(!battle) return;
    var targetSide = by === 'me' ? 'foe' : 'me';
    var attackerLane = by === 'me' ? $('laneMe') : $('laneFoe');
    var targetLane = by === 'me' ? $('laneFoe') : $('laneMe');
    var targetHud = by === 'me' ? $('hudFoe') : $('hudMe');
    var target = pickTarget(targetSide);
    var shooters = attackerLane.querySelectorAll('.unit:not(.dead)');

    // 攻击方全部存活车一起开火
    for(var i = 0; i < shooters.length; i++){
      (function(u){
        u.classList.remove('fire'); void u.offsetWidth; u.classList.add('fire');
        setTimeout(function(){ u.classList.remove('fire'); }, 380);
      })(shooters[i]);
    }
    sfxCannon();

    // 取最靠前线的一辆车作为开炮者
    var shooter = null, sLeft = 0;
    for(var k = 0; k < shooters.length; k++){
      var lx = parseFloat(shooters[k].style.left) || 0;
      if(!shooter){ shooter = shooters[k]; sLeft = lx; continue; }
      if(by === 'me' ? lx > sLeft : lx < sLeft){ shooter = shooters[k]; sLeft = lx; }
    }

    var from = unitPoint(attackerLane, shooter, by);
    var to = target ? unitPoint(targetLane, target, targetSide)
                    : { x: by === 'me' ? 76 : 24, y: 32 };

    var shell = $('shell');
    shell.className = 'shell';
    void shell.offsetWidth;
    shell.style.setProperty('--x0', from.x.toFixed(2) + '%');
    shell.style.setProperty('--y0', from.y.toFixed(2) + '%');
    shell.style.setProperty('--x1', to.x.toFixed(2) + '%');
    shell.style.setProperty('--y1', to.y.toFixed(2) + '%');
    shell.style.setProperty('--xm', ((from.x + to.x) / 2).toFixed(2) + '%');
    shell.style.setProperty('--ym', Math.min(92, Math.max(from.y, to.y) + 24).toFixed(2) + '%');
    shell.className = 'shell fly';

    setTimeout(function(){
      var boom = $('boom');
      boom.style.left = to.x.toFixed(2) + '%';
      boom.style.bottom = to.y.toFixed(2) + '%';
      boom.classList.remove('on'); void boom.offsetWidth; boom.classList.add('on');

      targetLane.classList.remove('hit'); void targetLane.offsetWidth; targetLane.classList.add('hit');
      targetHud.classList.remove('shake'); void targetHud.offsetWidth; targetHud.classList.add('shake');
      sfxBoom();

      if(target) damageUnit(target, targetSide);
      renderHP();
      setTimeout(function(){ targetLane.classList.remove('hit'); targetHud.classList.remove('shake'); }, 500);
    }, 380);
  }

  /* 掉血：指挥车扣装甲灯并逐级发暗，其余车辆一炮即毁 */
  function damageUnit(el, side){
    if(!el || el.classList.contains('dead')) return;
    var role = el.getAttribute('data-role');
    var max = el.getAttribute('data-maxhp') | 0;
    var hp = (el.getAttribute('data-hp') | 0) - 1;
    if(hp < 0) hp = 0;
    el.setAttribute('data-hp', hp);

    if(role === 'core'){
      var armor = el.querySelector('.armor');
      if(armor){
        var lights = armor.querySelectorAll('i');
        for(var i = 0; i < lights.length; i++) lights[i].className = i < hp ? 'on' : '';
      }
      el.classList.remove('dmg1', 'dmg2', 'critical');
      if(hp <= 0) destroyUnit(el, side, true);
      else if(hp <= 2) el.classList.add('critical');
      else if(hp <= 4) el.classList.add('dmg2');
      else if(hp < max) el.classList.add('dmg1');
      el.classList.remove('hurt'); void el.offsetWidth; el.classList.add('hurt');
      setTimeout(function(){ el.classList.remove('hurt'); }, 320);
      return;
    }

    if(hp <= 0) destroyUnit(el, side, false);
    else { el.classList.remove('hurt'); void el.offsetWidth; el.classList.add('hurt'); }
  }

  function destroyUnit(el, side, big){
    if(!el || el.classList.contains('dead')) return;
    el.classList.add('dying');
    spawnScorch(el, side, big);
    spawnSmoke(el, side, big);
    setTimeout(function(){
      el.classList.remove('dying');
      el.classList.add('dead');
    }, 520);
  }

  function spawnScorch(el, side, big){
    var layer = $('groundFx');
    if(!layer) return;
    var p = unitPoint(el.parentNode, el, side);
    var d = document.createElement('div');
    d.className = 'scorch' + (big ? ' big' : '');
    d.style.left = p.x.toFixed(2) + '%';
    d.style.top = Math.min(98, 100 - p.y + 3).toFixed(2) + '%';
    layer.appendChild(d);
  }

  function spawnSmoke(el, side, big){
    var layer = $('smokeFx');
    if(!layer) return;
    var p = unitPoint(el.parentNode, el, side);
    var n = big ? 4 : 2;
    for(var i = 0; i < n; i++){
      (function(k){
        setTimeout(function(){
          if(!layer.parentNode) return;
          var d = document.createElement('div');
          d.className = 'puff' + (big ? ' big' : '');
          d.style.left = (p.x + (k - (n - 1) / 2) * 3.4).toFixed(2) + '%';
          d.style.top = Math.min(98, 100 - p.y - 1).toFixed(2) + '%';
          layer.appendChild(d);
          setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); }, 1150);
        }, k * 110);
      })(i);
    }
  }

  function finishBattle(){
    battle.over = true;
    stopTimer();
    bgmOff();
    var total = battle.answered, correct = battle.correct;
    var myHP = battle.myHP, foeHP = battle.foeHP;
    var win = foeHP <= 0 ? true : (myHP <= 0 ? false : myHP > foeHP);
    var draw = (!win && foeHP > 0 && myHP === foeHP);
    var tname = TERRAIN[battle.level - 1] || '';
    var perfect = total > 0 && correct === total;

    var camp = state.campaign;
    var gain = 0, newBest = false, lapDone = false;

    if(win){
      gain = 10 + (battle.boss ? 20 : 0) + (perfect ? 5 : 0);
      camp.cur = (camp.cur | 0) + gain;
      if(camp.cur > (camp.best | 0)){ camp.best = camp.cur; newBest = true; }
      camp.wins = (camp.wins | 0) + 1;
      if(battle.level === camp.level + 1){
        camp.level = battle.level;
        if(camp.level >= MAX_LEVEL){
          camp.level = 0;
          camp.lap = (camp.lap | 0) + 1;
          camp.laps = camp.lap;
          lapDone = true;
          if(!camp.flagAt) camp.flagAt = todayStr();
        }
      }
    }else{
      camp.cur = 0;                       // 输一局，连胜分清零（历史最高保留）
    }

    state.sessions = (state.sessions | 0) + 1;
    var gotStar = awardDaily();
    pushHistory('对战', '第' + battle.level + '关 · ' + tname + (battle.boss ? '（BOSS）' : ''), total, correct, gotStar ? 1 : 0);
    save();
    renderHome();
    renderCampaign();

    var medal = medalOf(camp.best | 0);
    var tip;
    if(win){
      tip = '🎯 连胜分 +' + gain + '　当前 ' + camp.cur + ' 分' + (newBest ? '　<b>刷新纪录！</b>' : '');
    }else if(draw){
      tip = '🤝 平局，连胜分保持不变（' + camp.cur + ' 分）';
    }else{
      tip = '💔 连胜分清零，历史最高仍是 ' + (camp.best | 0) + ' 分';
    }

    var box = document.createElement('div');
    box.className = 'battle-result';
    box.innerHTML =
      '<div class="br-card">' +
        '<div class="br-emoji">' + (win ? '🏆' : (draw ? '🤝' : '💥')) + '</div>' +
        '<h2>' + (win ? 'VICTORY! 胜利！' : (draw ? 'DRAW! 平局！' : 'DEFEAT 惜败')) + '</h2>' +
        '<p class="br-line">第 ' + battle.level + ' 关 · ' + tname + (battle.boss ? ' · BOSS 关' : '') + '</p>' +
        '<div class="br-vs"><span class="n me">' + myHP + '</span><span style="color:#b1a8c9;font-size:14px">HP</span><span class="n foe">' + foeHP + '</span></div>' +
        '<div class="res-stats">' +
          '<div class="rs"><div class="v">' + correct + '</div><div class="k">答对</div></div>' +
          '<div class="rs"><div class="v">' + total + '</div><div class="k">回合</div></div>' +
          '<div class="rs"><div class="v">' + (total ? Math.round(correct / total * 100) : 0) + '%</div><div class="k">正确率</div></div>' +
        '</div>' +
        '<div class="br-score">' +
          '<div class="bs-cur"><span>连胜分</span><b>' + (camp.cur | 0) + '</b></div>' +
          '<div class="bs-best"><span>历史最高</span><b>' + medal.e + ' ' + (camp.best | 0) + '</b></div>' +
        '</div>' +
        '<p class="rl" style="margin:10px 0 6px;color:#f2712a;font-weight:800">' + tip + '</p>' +
        '<p class="rl" style="margin:0 0 14px">' + (gotStar ? '获得今日红星 +1 ⭐　当前可用 ' + balance() + ' 颗' : '今天的红星已经拿过啦，明天再来一颗！') + '</p>' +
        '<div style="display:flex;flex-direction:column;gap:9px">' +
          (win && !lapDone
            ? '<button class="btn btn-battle" id="brAgain">进攻第 ' + (camp.level + 1) + ' 关 ⚔️</button>'
            : '<button class="btn btn-battle" id="brAgain">' + (lapDone ? '开始第 ' + (camp.lap + 1) + ' 周目 ⚔️' : '再打这一关 ⚔️') + '</button>') +
          '<button class="btn btn-ghost" id="brHome">回到首页</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(box);

    $('brAgain').addEventListener('click', function(){ box.remove(); startBattle(); });
    $('brHome').addEventListener('click', function(){ box.remove(); renderHome(); showScreen('home'); });

    if(win){ sfxStar(); confetti(); }
    if(lapDone){ setTimeout(showWin, 460); }
  }

  /* 连胜分 → 奖杯等级 */
  function medalOf(best){
    if(best >= 800) return { e:'💎', n:'钻石奖杯' };
    if(best >= 500) return { e:'🥇', n:'金奖杯' };
    if(best >= 300) return { e:'🥈', n:'银奖杯' };
    if(best >= 150) return { e:'🥉', n:'铜奖杯' };
    if(best >= 50)  return { e:'🎖️', n:'勇气勋章' };
    return { e:'🏅', n:'新兵奖章' };
  }

  /* ================= 战役 / 升旗 / BGM ================= */
  function renderCampaign(){
    var camp = state.campaign || { level:0, lap:0, cur:0, best:0 };
    var lv = (camp.level | 0) % MAX_LEVEL;
    var lap = camp.lap | 0;

    $('cmpCount').textContent = lap > 0 ? ('第 ' + (lap + 1) + ' 周目 · ' + lv + ' / ' + MAX_LEVEL)
                                        : (lv + ' / ' + MAX_LEVEL + ' 据点');
    var track = $('cmpTrack');
    track.innerHTML = '';
    for(var i = 0; i < MAX_LEVEL; i++){
      var d = document.createElement('i');
      var b = isBoss(i + 1);
      d.className = 'cmp-node' + (i < lv ? ' done' : (i === lv ? ' now' : '')) + (b ? ' boss' : '');
      track.appendChild(d);
    }
    var castle = document.createElement('i');
    castle.className = 'cmp-castle' + (lap > 0 ? ' taken' : '');
    castle.id = 'cmpCastle';
    castle.textContent = lap > 0 ? '🚩' : '🏰';
    track.appendChild(castle);

    var nextBoss = isBoss(lv + 1);
    $('cmpFoot').textContent = '下一关：第 ' + (lv + 1) + ' 关 · ' + TERRAIN[lv] +
      (nextBoss ? '（BOSS 关 · 指挥车 8 层装甲 + 2 辆护卫）' : '');
    $('btnBattle').textContent = '进攻第 ' + (lv + 1) + ' 关 ⚔️';

    $('cmpCur').textContent = (camp.cur | 0) + ' 分';
    var m = medalOf(camp.best | 0);
    $('cmpBest').textContent = m.e + ' ' + (camp.best | 0) + ' 分';
    if(lap > 0) $('cmpLap').textContent = '已通关 ' + lap + ' 次 🚩';
    else $('cmpLap').textContent = '通关 20 关后开启下一周目';
  }

  function showWin(){
    var mask = $('winMask');
    var lap = state.campaign.lap | 0;
    var m = medalOf(state.campaign.best | 0);
    $('winLine').innerHTML = '第 ' + lap + ' 周目完成！20 关全部通关，城堡升起了旗帜 🚩<br>' +
      '历史最高连胜分 ' + (state.campaign.best | 0) + ' 分 ' + m.e + ' ' + m.n;
    mask.style.display = 'flex';
    mask.classList.remove('show');
    void mask.offsetWidth;
    mask.classList.add('show');
    confetti();
    sfxStar();
  }

  var bgmEl = null;
  function bgmOn(){
    if(!store.settings.sound) return;
    try{
      if(!bgmEl){
        bgmEl = $('bgm');
        bgmEl.src = ASSETS.bgm;
        bgmEl.volume = Math.min(1, 0.5 * vol());
      }
      var p = bgmEl.play();
      if(p && p.catch) p.catch(function(){});
    }catch(e){}
  }
  function bgmOff(){
    try{ if(bgmEl) bgmEl.pause(); }catch(e){}
  }

  /* ================= 学习档案 ================= */
  function renderStats(){
    $('stAvatar').textContent = state.avatar || '🦊';
    $('stName').textContent = state.name || 'MARK';
    $('stSub').textContent = '连续打卡 ' + calcStreak() + ' 天 · 共学习 ' + state.days.length + ' 天';
    $('stLearned').textContent = Object.keys(state.learned).length;
    $('stQuestions').textContent = state.questions | 0;
    var q = state.questions | 0;
    $('stRate').textContent = q ? Math.round((state.correct | 0) / q * 100) + '%' : '0%';
    $('stStars').textContent = state.stars | 0;

    var camp = state.campaign || {};
    var best = camp.best | 0, m = medalOf(best);
    $('stTrophy').innerHTML =
      '<div class="tc-medal">' + m.e + '</div>' +
      '<div class="tc-best">' + best + ' 分</div>' +
      '<div class="tc-name">历史最高连胜分 · ' + m.n + '</div>' +
      '<div class="tc-row">' +
        '<div><div class="v">' + (camp.cur | 0) + '</div><div class="k">当前连胜</div></div>' +
        '<div><div class="v">' + (camp.wins | 0) + '</div><div class="k">胜利场次</div></div>' +
        '<div><div class="v">' + (camp.lap | 0) + '</div><div class="k">通关周目</div></div>' +
      '</div>' +
      '<div class="tc-tip">连赢不断累积：普通关 +10，BOSS 关 +20，全对再 +5；输一局清零。<br>' +
        '💎 800 · 🥇 500 · 🥈 300 · 🥉 150 · 🎖️ 50</div>';

    // 近 7 天
    var days = [], map = {};
    for(var i=6;i>=0;i--){
      var d = new Date(); d.setDate(d.getDate() - i);
      var k = todayStr(d);
      days.push(k); map[k] = 0;
    }
    state.history.forEach(function(h){ if(map[h.d] !== undefined) map[h.d] += (h.total | 0); });
    var max = 1;
    days.forEach(function(k){ if(map[k] > max) max = map[k]; });

    var chart = $('stChart'); chart.innerHTML = '';
    days.forEach(function(k){
      var v = map[k];
      var h = Math.max(4, Math.round(v / max * 82));
      var wrap = document.createElement('div');
      wrap.className = 'bar-wrap';
      wrap.innerHTML = '<div class="bv">' + (v || '') + '</div>' +
        '<div class="bar' + (k === todayStr() ? ' today' : '') + '" style="height:' + h + 'px"></div>' +
        '<div class="bl">' + k.slice(5) + '</div>';
      chart.appendChild(wrap);
    });

    var list = $('stHistory'); list.innerHTML = '';
    if(!state.history.length){
      list.innerHTML = '<div class="empty">还没有记录，开始第一组吧 ⭐</div>';
    }else{
      state.history.slice(0, 12).forEach(function(h){
        var rate = h.total ? Math.round(h.correct / h.total * 100) : 0;
        var div = document.createElement('div');
        div.className = 'hist-item';
        div.innerHTML =
          '<div class="hi-badge">' + (h.mode === '对战' ? '⚔️' : '📖') + '</div>' +
          '<div class="hi-main"><div class="hi-t">' + escapeHtml(h.cat) + '</div>' +
          '<div class="hi-s">' + (h.d || '') + ' ' + (h.t || '') + ' · ' + h.mode + ' · ' + h.total + ' 词' +
          (h.star ? ' · ⭐+1' : '') + '</div></div>' +
          '<div class="hi-r' + (rate < 60 ? ' bad' : '') + '">' + rate + '%</div>';
        list.appendChild(div);
      });
    }
  }

  /* ================= 奖励 ================= */
  var DEF_REWARDS = [
    { id:'r1', name:'一次骑行', cost:10, emoji:'🚴' },
    { id:'r2', name:'一顿美味大餐', cost:30, emoji:'🍽️' },
    { id:'r3', name:'一盒玩具', cost:50, emoji:'🧸' },
    { id:'r4', name:'3D 打印耗材', cost:70, emoji:'🖨️' },
    { id:'r5', name:'一次电影票', cost:100, emoji:'🎬' }
  ];
  function allRewards(){ return DEF_REWARDS.concat(state.custom || []); }

  function renderRewards(){
    refreshTopbar();
    $('rBalance').textContent = balance();
    $('rSub').textContent = '累计获得 ' + (state.stars | 0) + ' 颗 · 已兑换 ' + (state.spent | 0) + ' 颗（兑换会从可用红星里扣掉）';

    var grid = $('rewardGrid'); grid.innerHTML = '';
    allRewards().forEach(function(r){
      var can = balance() >= r.cost;
      var div = document.createElement('div');
      div.className = 'reward';
      div.innerHTML =
        '<div class="rw-top"><div class="rw-emoji">' + (r.emoji || '🎁') + '</div>' +
        '<div class="rw-name">' + escapeHtml(r.name) + '</div></div>' +
        '<div class="rw-cost">⭐ ' + r.cost + ' 颗</div>' +
        '<button class="rw-btn' + (can ? '' : ' off') + '">' + (can ? '兑换' : '还差 ' + (r.cost - balance()) + ' 颗') + '</button>';
      div.querySelector('.rw-btn').addEventListener('click', function(){
        if(balance() < r.cost){ toast('红星还不够，继续加油！还差 ' + (r.cost - balance()) + ' 颗'); return; }
        openModal({
          emoji: r.emoji || '🎁',
          title: '兑换「' + r.name + '」？',
          text: '将花掉 ⭐ ' + r.cost + ' 颗红星。兑换后记得让爸爸妈妈兑现哦～',
          ok: '兑换',
          onOk: function(){ doRedeem(r); }
        });
      });
      grid.appendChild(div);
    });

    var list = $('redeemList'); list.innerHTML = '';
    if(!state.redeemed.length){
      list.innerHTML = '<div class="empty">还没有兑换记录，加油攒星星吧 ⭐</div>';
    }else{
      state.redeemed.slice().reverse().forEach(function(item){
        var idx = state.redeemed.indexOf(item);
        var div = document.createElement('div');
        div.className = 'redeem-item';
        div.innerHTML = '<span>' + (item.emoji || '🎁') + '</span>' +
          '<span class="ri-name">' + escapeHtml(item.name) + '<br><span class="ri-time">' + item.time + ' · 花了 ' + item.cost + ' 颗</span></span>' +
          '<button>撤销</button>';
        div.querySelector('button').addEventListener('click', function(){
          openModal({
            emoji:'↩️', title:'撤销这次兑换？', text:'红星会退回 ' + item.cost + ' 颗。', ok:'撤销',
            onOk: function(){
              state.spent = Math.max(0, (state.spent | 0) - item.cost);
              state.redeemed.splice(idx, 1);
              save(); renderRewards(); toast('已撤销，红星退回来啦');
            }
          });
        });
        list.appendChild(div);
      });
    }
  }

  function doRedeem(r){
    if(balance() < r.cost){ toast('红星不够啦'); return; }
    state.spent = (state.spent | 0) + r.cost;
    var d = new Date();
    state.redeemed.push({ name:r.name, cost:r.cost, emoji:r.emoji || '🎁', time:(d.getMonth()+1) + '月' + d.getDate() + '日' });
    save(); renderRewards(); sfxStar(); confetti();
    toast('兑换成功！找爸爸妈妈领取吧 🎉');
  }

  /* ================= 导出 / 导入 ================= */
  function exportData(){
    try{
      var blob = new Blob([JSON.stringify(store, null, 2)], { type:'application/json;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'PET单词档案-' + (state.name || 'MARK') + '-' + todayStr() + '.json';
      document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 400);
      toast('已导出，换电脑时导入它就行');
    }catch(e){ toast('导出失败，换个浏览器试试'); }
  }

  function importData(file){
    var reader = new FileReader();
    reader.onload = function(){
      try{
        var obj = JSON.parse(String(reader.result));
        var incoming = null;
        if(obj && obj.profiles && obj.active){ incoming = obj; }
        else if(obj && typeof obj.stars !== 'undefined'){          // 兼容 v2 单档案
          var nm = ((obj.name || 'MARK') + '').trim() || 'MARK';
          var p = fixProfile(obj, nm);
          incoming = { active: nm, profiles:{}, settings: store.settings };
          incoming.profiles[nm] = p;
        }
        if(!incoming){ toast('文件内容不对，请选导出的 json 文件'); return; }

        openModal({
          emoji:'📥', title:'导入这份档案？',
          text:'会合并到当前应用，同名档案会被覆盖。',
          ok:'导入',
          onOk: function(){
            Object.keys(incoming.profiles).forEach(function(k){
              store.profiles[k] = fixProfile(incoming.profiles[k], k);
            });
            store.active = incoming.active;
            if(incoming.settings) store.settings = Object.assign({}, store.settings, incoming.settings);
            state = store.profiles[store.active];
            save(); syncSelCat();
            renderHome(); renderSetup(); renderStats(); renderRewards();
            toast('导入成功！继续加油 💪');
          }
        });
      }catch(e){ toast('读取失败，文件可能损坏了'); }
    };
    reader.readAsText(file, 'utf-8');
  }

  /* ================= 事件 ================= */
  function confirmQuit(){
    openModal({
      emoji:'🤔', title:'要退出本组吗？',
      text:'退出后这一组不算完成，也拿不到今天的红星哦。',
      ok:'退出',
      onOk: function(){ session = null; renderHome(); showScreen('home'); }
    });
  }

  $('btnHome').addEventListener('click', function(){
    if(session && session.i < session.queue.length && $('screen-quiz').classList.contains('active')){ confirmQuit(); return; }
    if(battle && !battle.over && $('screen-battle').classList.contains('active')){
      openModal({
        emoji:'⚔️', title:'退出对战？', text:'这一局不算完成哦。', ok:'退出',
        onOk: function(){ stopTimer(); bgmOff(); battle = null; renderHome(); showScreen('home'); }
      });
      return;
    }
    renderHome(); showScreen('home');
  });

  $('btnStars').addEventListener('click', function(){ renderRewards(); showScreen('rewards'); });
  function syncVolumeUI(){
    var v = Math.round(vol() * 100);
    ['volRange', 'bVolRange'].forEach(function(id){ var el = $(id); if(el) el.value = v; });
    ['volNum', 'bVolNum'].forEach(function(id){ var el = $(id); if(el) el.textContent = v + '%'; });
  }
  function setVolume(v){
    store.settings.volume = Math.max(0, Math.min(1, v));
    if(store.settings.volume > 0 && !store.settings.sound){ store.settings.sound = true; }
    save();
    syncVolumeUI();
  syncSpeechModeUI();
    refreshTopbar();
    if(bgmEl) bgmEl.volume = Math.min(1, 0.5 * vol());
  }
  ['volRange', 'bVolRange'].forEach(function(id){
    var el = $(id);
    if(el) el.addEventListener('input', function(){ setVolume(parseInt(this.value, 10) / 100); });
  });

  $('btnSound').addEventListener('click', function(){
    store.settings.sound = !store.settings.sound;
    save(); refreshTopbar();
    if(!store.settings.sound){ bgmOff(); }
    else if(battle && !battle.over && $('screen-battle').classList.contains('active')){ bgmOn(); }
    toast(store.settings.sound ? '声音已打开 🔊' : '声音已关闭 🔇');
  });

  $('winBtn').addEventListener('click', function(){
    $('winMask').style.display = 'none';
    $('winMask').classList.remove('show');
    renderHome(); showScreen('home');
  });
  $('btnAvatar').addEventListener('click', openProfileEditor);
  $('btnEditProfile').addEventListener('click', openProfileEditor);

  $('btnStart').addEventListener('click', function(){ renderSetup(); showScreen('setup'); });
  $('btnBattle').addEventListener('click', function(){ startBattle(); });
  $('campaignCard').addEventListener('click', function(){ startBattle(); });
  $('btnRewards').addEventListener('click', function(){ renderRewards(); showScreen('rewards'); });
  $('btnStats').addEventListener('click', function(){ renderStats(); showScreen('stats'); });
  $('stEdit').addEventListener('click', openProfileEditor);
  $('btnStatsHome').addEventListener('click', function(){ renderHome(); showScreen('home'); });

  $('btnWrong').addEventListener('click', function(){
    var wc = Object.keys(state.wrong).length;
    if(!wc){ toast('错词本是空的'); return; }
    selCat = 'wrong'; state.lastCat = 'wrong'; save();
    renderSetup();
    var s = buildSession('wrong');
    if(s){ showScreen('quiz'); renderQuestion(); }
  });

  $('btnGo').addEventListener('click', function(){
    var s = buildSession(selCat);
    if(!s) return;
    showScreen('quiz'); renderQuestion();
  });

  $('btnBackHome').addEventListener('click', function(){ renderHome(); showScreen('home'); });
  function speakFeedback(ok){
    if(ok) return;
    if(!store.settings.sound){ toast('声音被关掉了，点右上角 🔊 打开'); return; }
    if(vol() <= 0){ toast('音量是 0，把下面的音量条拖大一点'); return; }
    toast('这个浏览器没有语音引擎，换 Chrome / Edge 打开试试');
  }
  $('btnSpeak').addEventListener('click', function(){
    if(!session) return;
    var q = session.queue[session.i];
    var ok = speakWord(q.w, 0.82);
    speakFeedback(ok);
    var btn = this;
    btn.classList.remove('busy'); void btn.offsetWidth; btn.classList.add('busy');
    setTimeout(function(){ btn.classList.remove('busy'); }, 600);
  });
  $('btnQuit').addEventListener('click', confirmQuit);

  $('btnBSpeak').addEventListener('click', function(){
    if(!battle || battle.over) return;
    var ok = speakWord(battle.queue[battle.i].w, 0.92);
    speakFeedback(ok);
  });

  $('btnBattleQuit').addEventListener('click', function(){
    openModal({
      emoji:'⚔️', title:'退出对战？', text:'这一局不算完成哦。', ok:'退出',
      onOk: function(){ stopTimer(); bgmOff(); battle = null; renderHome(); showScreen('home'); }
    });
  });

  $('btnAgain').addEventListener('click', function(){
    var s = buildSession(selCat);
    if(!s){ renderSetup(); showScreen('setup'); return; }
    renderQuestion(); showScreen('quiz');
  });
  $('btnResHistory').addEventListener('click', function(){ renderStats(); showScreen('stats'); });
  $('btnResHome').addEventListener('click', function(){ renderHome(); showScreen('home'); });
  $('btnRewardsHome').addEventListener('click', function(){ renderHome(); showScreen('home'); });

  $('btnAddReward').addEventListener('click', function(){
    var name = ($('newRewardName').value || '').trim();
    var cost = parseInt($('newRewardCost').value, 10);
    if(!name){ toast('先写一个奖励名称'); return; }
    if(!cost || cost < 1 || cost > 999){ toast('星星数填 1 - 999 之间'); return; }
    state.custom.push({ id:'c' + Date.now(), name:name, cost:cost, emoji:'🎈' });
    save();
    $('newRewardName').value = ''; $('newRewardCost').value = '';
    renderRewards(); toast('奖励已添加');
  });

  function syncSpeechModeUI(){
    var mode = store.settings.speechMode || 'auto';
    var btns = document.querySelectorAll('.seg-btn[data-speech]');
    for(var i = 0; i < btns.length; i++){
      btns[i].classList.toggle('on', btns[i].getAttribute('data-speech') === mode);
    }
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.seg-btn[data-speech]') : null;
    if(!b) return;
    store.settings.speechMode = b.getAttribute('data-speech');
    save(); syncSpeechModeUI();
    toast('发音方式：' + b.textContent);
    speakWord('hello', 0.9);
  });

  $('btnVoiceTest').addEventListener('click', function(){
    openModal({
      emoji:'🔧', title:'语音诊断',
      html: '<div style="white-space:pre-line;text-align:left;font-size:12.5px;line-height:1.9;color:#5a5178;background:#faf8ff;border-radius:14px;padding:12px 14px">' +
            voiceReport() + '</div>',
      ok:'测试发音', cancel:'关闭',
      onOk: function(){
        var ok = speakWord('pants', 0.85);
        if(!ok){ toast('设备没有可用英文语音'); }
      }
    });
  });

  $('btnExport').addEventListener('click', exportData);
  $('btnImport').addEventListener('click', function(){ $('importFile').click(); });
  $('importFile').addEventListener('change', function(){
    var f = this.files && this.files[0];
    if(f) importData(f);
    this.value = '';
  });

  $('btnReset').addEventListener('click', function(){
    openModal({
      emoji:'⚠️', title:'清空这个档案？',
      text:'「' + state.name + '」的星星、打卡、错词本、学习记录都会被删除，无法恢复。',
      ok:'清空',
      onOk: function(){
        openModal({
          emoji:'🗑️', title:'真的确定吗？',
          text:'最后一次确认：清空后所有学习记录都会消失。',
          ok:'确认清空',
          onOk: function(){
            var nm = store.active;
            store.profiles[nm] = newProfile(nm);
            state = store.profiles[nm];
            syncSelCat(); save();
            renderHome(); renderSetup(); renderStats(); renderRewards();
            toast('已清空，重新开始吧');
            showScreen('home');
          }
        });
      }
    });
  });

  document.addEventListener('keydown', function(e){
    if($('modalMask').style.display === 'flex') return;
    if(!$('screen-quiz').classList.contains('active') && !$('screen-battle').classList.contains('active')) return;
    if(e.key >= '1' && e.key <= '3'){
      var i = parseInt(e.key, 10) - 1;
      var opts = $('screen-battle').classList.contains('active')
        ? document.querySelectorAll('#bOptions .opt')
        : document.querySelectorAll('#options .opt');
      if(opts[i]) opts[i].click();
    }
  });

  document.addEventListener('gesturestart', function(e){ e.preventDefault(); });

  /* ================= 启动 ================= */
  renderHome();
  renderSetup();
  renderStats();
  renderRewards();
  syncVolumeUI();
  showScreen('home');


}
