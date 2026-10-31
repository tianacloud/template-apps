export function initialize(files) {

(function(){
  var rate = 0.95;
  var accent = 'en-US';
  var examMode = true;

  // 内嵌音频表（生成阶段由神经网络 TTS 预合成并 base64 内嵌，分享链接也能播放）
  var AUDIO = {};
  try { AUDIO = JSON.parse(document.getElementById('audio-data').textContent || '{}'); } catch(e){}

  var rateSel = document.getElementById('rate');
  if(rateSel){
    rate = parseFloat(rateSel.value) || 0.95;
    rateSel.addEventListener('change', function(){ rate = parseFloat(rateSel.value); if(audioEl) audioEl.playbackRate = rate; });
  }
  var acSel = document.getElementById('accent');
  if(acSel){
    accent = acSel.value;
    acSel.addEventListener('change', function(){ accent = acSel.value; });
  }
  var exSel = document.getElementById('exam');
  if(exSel){
    examMode = exSel.checked;
    exSel.addEventListener('change', function(){ examMode = exSel.checked; });
  }

  // ---- Web Speech 兜底（仅当某片段没有内嵌音频时启用） ----
  var wsVoices = [];
  function wsLoad(){ if(!('speechSynthesis' in window)) return; var v = window.speechSynthesis.getVoices()||[]; if(v.length) wsVoices = v; }
  function wsPick(){
    if(!wsVoices.length) wsLoad();
    if(!wsVoices.length) return null;
    var en = wsVoices.filter(function(v){ return /^en/i.test(v.lang || ''); });
    if(!en.length) return null;
    var pref = (accent === 'en-US')
      ? [/google us english/i, /samantha/i, /zira/i, /aria/i, /jenny/i, /ava/i, /en[-_]us/i]
      : [/google uk english/i, /hazel/i, /susan/i, /libby/i, /sonia/i, /kate/i, /moira/i, /en[-_]gb/i];
    for(var i = 0; i < pref.length; i++){ for(var j = 0; j < en.length; j++){
      if(pref[i].test(en[j].name || '') || pref[i].test(en[j].lang || '')) return en[j]; } }
    return en[0];
  }
  if('speechSynthesis' in window){ wsLoad(); window.speechSynthesis.onvoiceschanged = function(){ wsLoad(); }; }

  var audioEl = null, playToken = 0;
  function fallbackSpeak(text, done){
    if(!('speechSynthesis' in window)){ if(done) done(); return; }
    try{ window.speechSynthesis.cancel(); }catch(e){}
    var u = new SpeechSynthesisUtterance(text);
    var v = wsPick(); if(v){ u.voice = v; u.lang = v.lang; } else { u.lang = accent; }
    u.rate = rate; u.pitch = 1; u.volume = 1;
    u.onend = function(){ if(done) done(); };
    u.onerror = function(){ if(done) done(); };
    window.speechSynthesis.speak(u);
  }

  // ---- 统一播放入口：优先内嵌音频，其次浏览器 TTS ----
  async function playClip(id, btn, isListen){
    var requestToken = ++playToken;
    if (audioEl) audioEl.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    document.querySelectorAll('.playing').forEach(function(b){ b.classList.remove('playing'); if (b.dataset.label) b.textContent = b.dataset.label; });
    var uri = '';
    if (files && /^c\d+$/.test(id)) {
      try { uri = await files.getUrl('template-assets/audio/' + id + '-' + accent + '.mp3'); }
      catch (error) { showToast('音频读取失败，尝试使用浏览器朗读'); }
    } else { var clips = AUDIO[id] || {}; uri = clips[accent] || clips['en-US'] || clips['en-GB'] || ''; }
    if (requestToken !== playToken) return;
    var label = btn ? (btn.getAttribute('data-label') || btn.textContent) : '';
    var times = (isListen && examMode) ? 2 : 1;

    if(!uri){
      var t = btn ? (btn.getAttribute('data-text') || '') : '';
      if(!t) return;
      if(btn) btn.classList.add('playing');
      var tok = requestToken, done = 0;
      (function step(){
        if(tok !== playToken) return;
        if(done >= times){ if(btn){ btn.classList.remove('playing'); if(isListen) btn.textContent = label; } return; }
        done++;
        if(isListen) btn.textContent = (times > 1 ? ('▶ 第 ' + done + '/' + times + ' 遍…') : '▶ 播放中…');
        fallbackSpeak(t, function(){
          if(tok !== playToken) return;
          if(done < times){ setTimeout(step, 1600); }
          else { if(btn){ btn.classList.remove('playing'); if(isListen) btn.textContent = label; } }
        });
      })();
      return;
    }

    if(!audioEl) audioEl = new Audio();
    audioEl.pause();
    var tok = requestToken, i = 0;
    if(btn) btn.classList.add('playing');
    (function step(){
      if(tok !== playToken) return;
      if(i >= times){ if(btn){ btn.classList.remove('playing'); if(isListen) btn.textContent = label; } return; }
      i++;
      if(isListen) btn.textContent = (times > 1 ? ('▶ 第 ' + i + '/' + times + ' 遍…') : '▶ 播放中…');
      audioEl.src = uri;
      audioEl.playbackRate = rate;
      audioEl.onended = function(){
        if(tok !== playToken) return;
        if(i < times){ setTimeout(step, 1400); }
        else { if(btn){ btn.classList.remove('playing'); if(isListen) btn.textContent = label; } }
      };
      var pr = audioEl.play();
      if(pr && pr.catch) pr.catch(function(){ if(btn) { btn.classList.remove('playing'); if(isListen) btn.textContent = label; } showToast('音频播放失败，请重试'); });
    })();
  }

  document.addEventListener('click', function(e){
    var b = e.target.closest('.spk, .play, .vplay');
    if(b){
      var id = b.getAttribute('data-audio-id');
      if(id){ playClip(id, b, b.classList.contains('play')); }
    }
  });

  // 轻提示
  var toastTimer=null;
  function showToast(msg){
    var el=document.getElementById('toast');
    if(!el){ el=document.createElement('div'); el.id='toast'; document.body.appendChild(el); }
    el.textContent=msg; el.classList.add('show');
    if(toastTimer) clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){ el.classList.remove('show'); },2200);
  }

  // 分类切换（固定三栏：未收录的类别置灰，点击提示）
  document.querySelectorAll('.tab').forEach(function(t){
    t.addEventListener('click', function(){
      if(t.getAttribute('data-missing')){
        showToast('本期未收录「'+t.getAttribute('data-missing')+'」类文章，敬请期待');
        return;
      }
      var i = t.getAttribute('data-idx');
      document.querySelectorAll('.tab').forEach(function(x){ x.classList.remove('on'); });
      t.classList.add('on');
      document.querySelectorAll('.article').forEach(function(a){
        a.classList.toggle('on', a.getAttribute('data-idx') === i);
      });
      try{ if(audioEl) audioEl.pause(); }catch(e){}
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });

  function norm(s){ return (s||'').trim().toLowerCase().replace(/\s+/g,' '); }

  function grade(art){
    var total = 0, got = 0;
    var cats = { reading:{t:0,g:0}, listening:{t:0,g:0}, grammar:{t:0,g:0}, multimodal:{t:0,g:0} };
    art.querySelectorAll('.q').forEach(function(q){
      var type = q.getAttribute('data-type') || 'choice';
      var ans  = q.getAttribute('data-answer') || '';
      var cat  = q.getAttribute('data-cat') || 'reading';
      var sc   = parseFloat(q.getAttribute('data-score') || '2');
      var user = '', ok = false;

      if(type === 'choice'){
        var sel = q.querySelector('input[type=radio]:checked');
        user = sel ? sel.value : '';
        ok = (user === ans);
      }else{
        var inp = q.querySelector('input[type=text]');
        user = inp ? inp.value : '';
        var acc = (q.getAttribute('data-accept') || ans).split('|');
        var nu = norm(user);
        ok = acc.some(function(a){ return norm(a) === nu; });
      }

      total += sc;
      cats[cat].t += sc;
      if(ok){ got += sc; cats[cat].g += sc; }

      q.classList.toggle('ok', ok);
      q.classList.toggle('no', !ok);

      var res = q.querySelector('.res');
      var your = user === '' ? '（未作答）' : user;
      res.innerHTML =
        '<span class="badge ' + (ok?'y':'n') + '">' + (ok?'✓ 正确':'✗ 错误') + '</span>' +
        '<span class="ansline">你的答案：<b>' + (ok?'':'<s>') + esc(your) + (ok?'':'</s>') + '</b>　|　正确答案：<b>' + esc(ans) + '</b></span>';
      res.classList.add('show');

      var ex = q.querySelector('.exp');
      if(ex){ ex.classList.add('show'); }
    });

    var box = art.querySelector('.score');
    var pct = total ? Math.round(got/total*100) : 0;
    var names = { reading:'阅读理解', listening:'听力理解', grammar:'语法词汇', multimodal:'多模态阅读' };
    var cc = '';
    ['reading','listening','grammar','multimodal'].forEach(function(k){
      cc += '<div class="cat"><b>' + cats[k].g + ' / ' + cats[k].t + '</b><span>' + names[k] + '</span></div>';
    });
    box.innerHTML =
      '<div class="big">' + got + ' / ' + total + ' 分　·　正确率 ' + pct + '%</div>' +
      '<div class="line">' + (pct>=85?'掌握得很好，继续保持。':pct>=60?'基本过关，建议重点看错题的【排错】一段。':'失分较多，建议先回读原文再重做一遍。') + '</div>' +
      '<div class="cats">' + cc + '</div>';
    box.classList.add('show');
    box.scrollIntoView({behavior:'smooth', block:'nearest'});
  }

  function esc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  document.querySelectorAll('.submit').forEach(function(b){
    b.addEventListener('click', function(){ grade(b.closest('.article')); });
  });

  document.querySelectorAll('.mini').forEach(function(m){
    m.addEventListener('click', function(){
      var art = m.closest('.article');
      var act = m.getAttribute('data-act');
      if(act === 'wrong'){
        var on = art.classList.toggle('onlywrong');
        m.textContent = on ? '显示全部题目' : '只看错题';
        art.querySelectorAll('.q').forEach(function(q){
          q.classList.toggle('hide', on && q.classList.contains('ok'));
        });
      }else if(act === 'toggleexp'){
        art.querySelectorAll('.exp').forEach(function(e){ e.classList.toggle('show'); });
        m.textContent = (m.textContent.indexOf('收起') >= 0) ? '展开全部讲解' : '收起全部讲解';
      }else if(act === 'reset'){
        art.querySelectorAll('.q').forEach(function(q){
          q.classList.remove('ok','no','hide');
          var r = q.querySelector('.res'); if(r){ r.classList.remove('show'); r.innerHTML=''; }
          var e = q.querySelector('.exp'); if(e){ e.classList.remove('show'); }
          q.querySelectorAll('input').forEach(function(i){
            if(i.type==='radio'){ i.checked = false; } else { i.value = ''; }
          });
        });
        var s = art.querySelector('.score'); if(s){ s.classList.remove('show'); }
        var w = art.querySelector('.mini[data-act=wrong]'); if(w){ w.textContent = '只看错题'; }
        art.classList.remove('onlywrong');
        window.scrollTo({top:0, behavior:'smooth'});
      }
    });
  });
})();

/* ===== 一键打印 + 扫码答案模式 ===== */
(function(){
  function esc2(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function reveal(art){
    art.querySelectorAll('.q').forEach(function(q){
      var ans = q.getAttribute('data-answer') || '';
      var res = q.querySelector('.res');
      if(res){
        res.innerHTML = '<span class="badge y">正确答案</span>'
          + '<span class="ansline">正确答案：<b>' + esc2(ans) + '</b></span>';
        res.classList.add('show');
      }
      var ex = q.querySelector('.exp');
      if(ex){ ex.classList.add('show'); }
    });
  }

  var btn = document.getElementById('btnPrint');
  var ck  = document.getElementById('withAns');
  var keep = null;
  if(btn){
    btn.addEventListener('click', function(){
      var cur = document.querySelector('.article.on');
      keep = cur ? cur.getAttribute('data-idx') : '0';
      var withAns = !!(ck && ck.checked);
      document.querySelectorAll('details').forEach(function(d){ d.open = true; });
      document.querySelectorAll('.article').forEach(function(a){ a.classList.add('on'); });
      if(withAns){
        document.body.classList.add('print-ans');
        document.querySelectorAll('.article').forEach(function(a){ reveal(a); });
      }else{
        document.body.classList.remove('print-ans');
      }
      setTimeout(function(){ window.print(); }, 160);
    });
  }
  window.addEventListener('afterprint', function(){
    document.body.classList.remove('print-ans');
    if(keep !== null){
      document.querySelectorAll('.article').forEach(function(a){
        a.classList.toggle('on', a.getAttribute('data-idx') === keep);
      });
    }
  });

  /* 扫码直达：链接带 #answers 时，展开全部篇目并直接显示朗读入口与答案解析 */
  var hm = (location.hash || '').match(/#answers(\d+)?/i);
  if(hm){
    document.body.classList.add('ansmode');
    document.querySelectorAll('.article').forEach(function(a){
      a.classList.add('on');
      reveal(a);
    });
    var pick = hm[1] ? document.querySelector('.article[data-idx="' + (parseInt(hm[1], 10) - 1) + '"]') : null;
    if(pick){ setTimeout(function(){ pick.scrollIntoView({behavior:'auto', block:'start'}); }, 120); }
    else { try{ window.scrollTo(0,0); }catch(e){} }
  }
})();

}
