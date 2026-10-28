const link=document.createElement("link"); link.rel="stylesheet"; link.href=new URL("app.css",import.meta.url).href; document.head.appendChild(link);
import { database } from "./database.js";
document.body.innerHTML = "\n<div data-page-node-id=\"J4DVotYaKDPnwNjkxNEp4X\" class=\"wrap\">\n  <header data-page-node-id=\"3OzCsQ2sd2ZPOqlqBKXCAP\">\n    <h1 data-page-node-id=\"eWK8uiZpTxXz6F4qLHhmOV\"><!--pnid:BTMDWt3R2wyf8CIBVTlqZC-->你本周是什么<span data-page-node-id=\"DlsbWlD4oDJUrrvP5JFI7x\" class=\"hl\"><!--pnid:i7UkKGSNKoiiYuqYyI2n17-->人格</span><!--pnid:BIIQo6GX5fh8Zx1It8OcEh-->？</h1>\n    <p data-page-node-id=\"Zgh3g0cRKIyvV4lwVn7won\"><!--pnid:f2QAzzEvfVuIaOUDQ1r2eg-->每天 10 秒打卡，周日自动生成一份「本周人格报告」。</p>\n    <div data-page-node-id=\"0STlfnJ1n2N97zp8To9szk\" style=\"margin-top:10px\"><span data-page-node-id=\"FotMaytirDDeE1j1gcySCW\" class=\"streak\"><!--pnid:VFE2hsRgis5jbBRQOSYojw-->🔥 连续打卡 <span data-page-node-id=\"CjBc6diiVzazcT88zN1Fw7\" id=\"streakDays\"><!--pnid:6fjwX19kz1A5HDX1Giw8qo-->0</span><!--pnid:Nbq4VxkieO0Xil3qytS7Js--> 天</span></div>\n  </header>\n\n  <!--pnid:uPKTr2lmahRDMAj9x0m5GT--><!-- 1. 今日打卡 -->\n  <div data-page-node-id=\"bp2Z5hlGlayGW32LtmQRyl\" class=\"card\">\n    <h2 data-page-node-id=\"H7CO9WBFa6BVvnqijhM2hR\"><span data-page-node-id=\"FJ2OzXyl2Sqv2B06kb6gap\" class=\"num\"><!--pnid:MkvldMNtC2Rn2MCs1eZRqU-->1</span><!--pnid:NgNznyKVjDOhdTpa0r5vRg-->今日打卡</h2>\n    <div data-page-node-id=\"ul3k9ZkyBLdnRgM2IZZTDU\" class=\"hint\"><!--pnid:nxuCnh8o8JCH2GzKBLDWiS-->点选今天的状态，一句话记录，10 秒搞定。</div>\n    <form data-page-node-id=\"zxDyuUj2IA2p1cBf9GBtj1\" id=\"checkinForm\">\n      <div data-page-node-id=\"JnkaWIynbmW1LLj1dLetNF\" class=\"field\">\n        <label data-page-node-id=\"QFIptKshkDqUsmaos6stfd\" for=\"fDate\"><!--pnid:ohBtcsnsB56a40tjbXe9S7-->日期</label>\n        <input data-page-node-id=\"9ujsd4oZHa4YzWWi8zZTx7\" id=\"fDate\" name=\"date\" required type=\"date\">\n      </div>\n      <div data-page-node-id=\"P21aUjrMPo63y0tKRRQwp9\" class=\"field\">\n        <label data-page-node-id=\"9TphQoZ48BILDmUXAB3Hra\"><!--pnid:P4sY3OSP0zcVmIhyM52X7F-->三个开关（点了算有）</label>\n        <div data-page-node-id=\"uY1IMdjb16CezFdnQ90ggV\" class=\"switches\">\n          <div data-page-node-id=\"XeBRZk0brdF5yHyCkHi1H8\" class=\"switch\" data-key=\"专注\" data-val=\"1\"><span data-page-node-id=\"52KSYU3OksLTGRwYrz6XdO\" class=\"emoji\"><!--pnid:dXPSLSt2tyFZGi9eVLmIHz-->🎯</span><!--pnid:T4KeOa8C2hy0G4mSgJiaOC-->今天专注</div>\n          <div data-page-node-id=\"dUNBEjSyEYueGFW2p7FLMw\" class=\"switch\" data-key=\"运动\" data-val=\"1\"><span data-page-node-id=\"eo8HajAYUz0oTIzqXyF4ct\" class=\"emoji\"><!--pnid:JcdbL6bflYolBQbyb9nFTm-->🏃</span><!--pnid:pqs9RkacC4kJdNUTbIAVul-->今天运动</div>\n          <div data-page-node-id=\"yMxmlIgXQt4fI3TLgKi7rJ\" class=\"switch neg\" data-key=\"熬夜\" data-val=\"1\"><span data-page-node-id=\"ebPcLeeTr04xf0C1DMucrT\" class=\"emoji\"><!--pnid:HkI9qZpYBBwwMyRKx2Smlk-->🦉</span><!--pnid:Bm7M4DxeiGSoGr1yqf2cdT-->昨晚熬夜</div>\n        </div>\n      </div>\n      <div data-page-node-id=\"JVxuEbeiMLJHgdm8zpaxo8\" class=\"field\">\n        <label data-page-node-id=\"F3WuyPkjleXyXo8gsQx4oY\"><!--pnid:kjfd0ghdIuJZ7eD2f3eUZY-->今天的心情</label>\n        <div data-page-node-id=\"WeKCal5cQrFk8gyw6LLydB\" class=\"moods\" id=\"moodGroup\">\n          <div data-page-node-id=\"UUPGDcD7Ww7nG4oXzDToUU\" class=\"mood\" data-val=\"元气满满\"><!--pnid:Eq4Il3ojIA6Fnzz32AcIP8-->⚡ 元气满满</div>\n          <div data-page-node-id=\"BXq48AIemIlJ4VwKCTakjq\" class=\"mood\" data-val=\"平稳运转\"><!--pnid:quzT88w7AlKFOVa22eCoFD-->🔄 平稳运转</div>\n          <div data-page-node-id=\"dY7AMDaDtD9WQTuKxeQgbA\" class=\"mood\" data-val=\"电量告急\"><!--pnid:DDkTjZTiBuIzXLqeFs5tnn-->🔋 电量告急</div>\n          <div data-page-node-id=\"wu1IQpso61VAhTMcpSyRXB\" class=\"mood\" data-val=\"彻底宕机\"><!--pnid:Gax6hwKNqKcZoou4xsJqsd-->💀 彻底宕机</div>\n        </div>\n        <select data-page-node-id=\"VR1N4FI6nmXy1toq8rFj6y\" id=\"fMood\" name=\"mood\" style=\"display:none\"></select>\n      </div>\n      <div data-page-node-id=\"UX49rJECjl2rtvgwZgbBzb\" class=\"field\">\n        <label data-page-node-id=\"nmcfESubkfhw20k76q7HeC\" for=\"fNote\"><!--pnid:2hyJT3rEgafQWq584fpr3k-->一句话（可选）</label>\n        <input data-page-node-id=\"CKKfHaIu8RVkITAksfQrgW\" id=\"fNote\" maxlength=\"60\" name=\"note\" placeholder=\"今天最想说的一句…\" type=\"text\">\n      </div>\n      <button data-page-node-id=\"w6OU76NBjFhzO2xwzWMJjS\" class=\"cta\" id=\"submitBtn\" type=\"submit\"><!--pnid:cpxzgJz0zvi80Ya7QIuKWl-->打卡 ✓</button>\n    </form>\n  </div>\n\n  <!--pnid:lRjajiSnpI4xTq5CWiFHfB--><!-- 2. 本周人格报告 -->\n  <div data-page-node-id=\"T75wnVdSbFURgvW8kDR6OK\" class=\"card\">\n    <h2 data-page-node-id=\"aPTbL2u2eZzQt3389CyPVZ\"><span data-page-node-id=\"tmI2IpsVXVZ3umS7pnodeZ\" class=\"num\"><!--pnid:jYCrrvuKkajRhUUIviF87g-->2</span><!--pnid:RqLJRm1Vp4PxgKQEfCiLql-->本周人格报告</h2>\n    <div data-page-node-id=\"wNMmPDqRBQQ5g4f4uyQxbP\" id=\"reportBox\"><div data-page-node-id=\"yMTgxgi9rDbpZJqoXp1yUf\" class=\"report-empty\"><!--pnid:E9wTJprQZFplOhBByYCTJn-->本周还没有打卡记录，先去上面打个卡吧～</div></div>\n  </div>\n\n  <!--pnid:H0TshAvd9fVYJHRK1XFIKg--><!-- 3. 打卡记录 -->\n  <div data-page-node-id=\"PU6fgYW4NSfXzPqw6SkZK3\" class=\"card\">\n    <h2 data-page-node-id=\"yXtidQTq8ft1jYENkQHOJi\"><span data-page-node-id=\"PmG7nZjANha6zElk8bcY82\" class=\"num\"><!--pnid:qD5A0Aw88zzkLdeasvdWrN-->3</span><!--pnid:xyWB872dZml3NsaLWCUFdx-->全部打卡记录</h2>\n    <div data-page-node-id=\"wpNKHTwd52l22ZBvXPThjZ\" class=\"hint\"><!--pnid:GZ1Fh8mwJqWWmB385WLSnO-->展示最近 30 条记录。</div>\n    <div data-page-node-id=\"YPQEilwUe1OuQvLjp5baMd\" class=\"history\" id=\"historyBox\"><div data-page-node-id=\"JsM4dCWwHYjJWguBJqHCH5\" class=\"report-empty\"><!--pnid:yScq5oopb7SLnuZ0NemyXf-->暂无记录</div></div>\n  </div>\n\n  <footer data-page-node-id=\"KmSB0EAhdGpiwNrJWvVdj7\"><!--pnid:GpFJfW4WKLmGOAVmWXfyEL-->每天 10 秒 · 周日看看你是什么人格 🐹</footer>\n</div>\n<div data-page-node-id=\"IetIdhUlUMa0vHa1wD2hKS\" class=\"toast\" id=\"toast\"></div>\n\n";
window.personaDatabase = database;

(function(){
  var db = window.personaDatabase;
  var DATABASE_ID = 'jJSujyGtgCvco5JKnyOfpf';
  var MOODS = ['元气满满','平稳运转','电量告急','彻底宕机'];
  var records = [];          // 全量（分页拉取）
  var maxRender = 30;        // 历史仅展示最近 30 条

  // ---------- 工具 ----------
  function $(s){ return document.querySelector(s); }
  function todayStr(d){ d=d||new Date(); var m=d.getMonth()+1,day=d.getDate(); return d.getFullYear()+'-'+(m<10?'0':'')+m+'-'+(day<10?'0':'')+day; }
  function toast(msg){ var t=$('#toast'); t.textContent=msg; t.className='toast show'; setTimeout(function(){ t.className='toast'; },2200); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function moodIdx(v){ var i=MOODS.indexOf(v); return i<0?1:i; }

  // ---------- 表单交互 ----------
  var form = $('#checkinForm');
  var picked = { 专注:false, 运动:false, 熬夜:false, 心情:'' };
  var dateEl = $('#fDate'), noteEl = $('#fNote'), moodSelect = $('#fMood'), submitBtn = $('#submitBtn');

  // 心情用隐藏 select 承载数据库选项值（id），点击胶囊同步
  MOODS.forEach(function(v){
    var o = document.createElement('option');
    o.value = v; o.textContent = v;
    moodSelect.appendChild(o);
  });
  Array.prototype.forEach.call($('#moodGroup').children, function(el){
    el.addEventListener('click', function(){
      Array.prototype.forEach.call($('#moodGroup').children, function(x){ x.classList.remove('on'); });
      el.classList.add('on');
      picked['心情'] = el.getAttribute('data-val');
      moodSelect.value = picked['心情'];
      saveLocal();
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('.switch'), function(el){
    el.addEventListener('click', function(){
      var k = el.getAttribute('data-key');
      picked[k] = !picked[k];
      el.classList.toggle('on', picked[k]);
      saveLocal();
    });
  });

  // 本地缓存（提交字段），失败保留、成功清空
  var LS_KEY = 'weekly_persona_checkin';
  function saveLocal(){
    try{
      localStorage.setItem(LS_KEY, JSON.stringify({
        date:dateEl.value, 专注:picked['专注'], 运动:picked['运动'], 熬夜:picked['熬夜'], 心情:picked['心情'], 一句话:noteEl.value
      }));
    }catch(e){}
  }
  function clearLocal(){ try{ localStorage.removeItem(LS_KEY); }catch(e){} }
  function restoreLocal(){
    var s=null;
    try{ s=JSON.parse(localStorage.getItem(LS_KEY)||'null'); }catch(e){}
    if(!s) return;
    if(s['日期']||s.date) dateEl.value = s['日期']||s.date;
    if(s['一句话']!=null||s['一句话']!='') noteEl.value = s['一句话']||s['一句话']||'';
    ['专注','运动','熬夜'].forEach(function(k){
      if(s[k]){ picked[k]=true;
        Array.prototype.forEach.call(document.querySelectorAll('.switch'),function(el){ if(el.getAttribute('data-key')===k) el.classList.add('on'); });
      }
    });
    if(s['心情']){ picked['心情']=s['心情']; moodSelect.value=s['心情'];
      Array.prototype.forEach.call($('#moodGroup').children,function(el){ if(el.getAttribute('data-val')===s['心情']) el.classList.add('on'); });
    }
  }
  var lsTimer=null;
  function saveLocalDebounced(){ clearTimeout(lsTimer); lsTimer=setTimeout(saveLocal,300); }
  dateEl.addEventListener('input',saveLocalDebounced);
  noteEl.addEventListener('input',saveLocalDebounced);
  dateEl.value = todayStr();

  // ---------- 提交 ----------
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(!picked['心情']){ toast('先选一个今天的心情吧'); return; }
    if(!db){ toast('当前环境暂不支持保存，请稍后再试'); return; }
    var d = dateEl.value || todayStr();
    var props = {
      '日期': { date: d },
      '专注': { checkbox: !!picked['专注'] },
      '运动': { checkbox: !!picked['运动'] },
      '熬夜': { checkbox: !!picked['熬夜'] },
      '心情': { select: picked['心情'] },
      '一句话': { text: noteEl.value }
    };
    submitBtn.disabled = true; submitBtn.textContent = '打卡中…';
    try{
      db.addRecord({ databaseId: DATABASE_ID, properties: props })
        .then(function(){
          toast('打卡成功，明天见！🎉');
          clearLocal();
          picked = { 专注:false, 运动:false, 熬夜:false, 心情:'' };
          Array.prototype.forEach.call(document.querySelectorAll('.switch,.mood'),function(el){el.classList.remove('on');});
          noteEl.value='';
          loadData();
        })
        .catch(function(err){ console.error('[database] 提交失败:',err); toast('打卡失败，请稍后重试'); })
        .then(function(){ submitBtn.disabled=false; submitBtn.textContent='打卡 ✓'; });
    }catch(err){ console.error(err); toast('打卡失败，请稍后重试'); submitBtn.disabled=false; submitBtn.textContent='打卡 ✓'; }
  });

  // ---------- 数据加载（分页） ----------
  function loadData(startCursor, acc, guard){
    acc = acc || []; guard = guard || 0;
    if(guard > 100){ renderData(acc); return; }
    try{
      db.query({
        databaseId: DATABASE_ID,
        sorts: [{ property: '日期', direction: 'descending' }],
        pageSize: 200,
        startCursor: startCursor
      }).then(function(result){
        acc = acc.concat(result.results || []);
        var next = result.nextCursor;
        if(result.hasMore && next && next !== startCursor && (result.results||[]).length){
          loadData(next, acc, guard+1);
        }else{
          renderData(acc);
        }
      }).catch(function(err){ console.error('[database] 数据加载失败:',err); });
    }catch(err){ console.error(err); }
  }

  // ---------- 渲染 ----------
  function renderData(rows){
    records = rows || [];
    renderStreak();
    renderReport();
    renderHistory();
  }

  function sameDay(a,b){ return a===b; }
  function isThisWeek(dateStr){
    var d = new Date(dateStr+'T00:00:00'); if(isNaN(d)) return false;
    var now = new Date(); var monday = new Date(now); 
    var dow = (now.getDay()===0)?7:now.getDay();
    monday.setDate(now.getDate()-dow+1); monday.setHours(0,0,0,0);
    return d >= monday;
  }

  function renderStreak(){
    var set = {};
    records.forEach(function(r){ if(r['日期']) set[r['日期']]=1; });
    var n=0; var d=new Date();
    while(set[todayStr(d)]){ n++; d.setDate(d.getDate()-1); }
    $('#streakDays').textContent = n;
  }

  function computePersona(w){
    var focus=w['专注'], sport=w['运动'], late=w['熬夜'];
    var moodSum=0, moodN=0;
    records.forEach(function(r){ if(isThisWeek(String(r['日期']||''))){ moodSum+=moodIdx(r['心情']); moodN++; } });
    var moodAvg = moodN? moodSum/moodN : 2;
    // 人格规则（从自律/失控两个轴判断）
    if(late>=5 && focus<3) return {emoji:'🧟', name:'熬夜僵尸型人格', desc:'这一周你的身体在上班，灵魂在凌晨三点。先别卷了，今晚十一点前睡觉，就当给 CPU 散个热。'};
    if(focus>=6 && late<=1) return {emoji:'🚀', name:'人形永动机人格', desc:'专注拉满、作息在线，你本周的行为模式已经不像人类了。请适度开机，永动机会过热的。'};
    if(sport>=5 && late<=2) return {emoji:'🐆', name:'自律猎豹型人格', desc:'运动常态化、熬夜低频，身体这台机器保养得相当不错。保持住，猎豹也有打盹的时候。'};
    if(moodAvg<=1.5 && focus>=4) return {emoji:'⚡', name:'高能电池人格', desc:'心情在线、专注稳定，你这周的电量曲线是所有人羡慕的样子。'};
    if(sport<=1 && late>=4) return {emoji:'🦉', name:'夜行动物人格', desc:'运动几乎绝迹，熬夜准时打卡。再这样下去，你就要进化成纯夜间生物了，白天记得晒晒太阳。'};
    if(focus<=2 && sport<=2 && moodAvg>=2.5) return {emoji:'🐹', name:'周末爆发的仓鼠', desc:'平时慢悠悠攒能量，一到周末突然高速运转。仓鼠也是会有大成就的，只要腮帮子里装满计划。'};
    return {emoji:'🌱', name:'平稳生长型人格', desc:'没有大起大落，专注、运动、心情都保持在一个稳定的区间。慢生长也是生长，本周辛苦了。'};
  }

  function renderReport(){
    var week = records.filter(function(r){ return isThisWeek(String(r['日期']||'')); });
    var box = $('#reportBox');
    if(!week.length){
      box.innerHTML = '<div class="report-empty">本周还没有打卡记录，先去上面打个卡吧～</div>';
      return;
    }
    var n=week.length, f=0, s=0, l=0;
    week.forEach(function(r){ if(r['专注'])f++; if(r['运动'])s++; if(r['熬夜'])l++; });
    var p = computePersona({ '专注':f, '运动':s, '熬夜':l });

    // 7 天打卡强度条（周一~周日）
    var dow = (new Date().getDay()===0)?7:new Date().getDay();
    var byDay = {};
    week.forEach(function(r){
      var ds=String(r['日期']||''); if(!ds) return;
      var d=new Date(ds+'T00:00:00'); var wd=(d.getDay()===0)?7:d.getDay();
      var score=(r['专注']?1:0)+(r['运动']?1:0)+((r['心情']&&moodIdx(r['心情'])<=1)?1:0)-(r['熬夜']?1:0);
      byDay[wd]=Math.max(0,Math.min(3,score+1));
    });
    var names=['一','二','三','四','五','六','日'];
    var bars='';
    for(var i=1;i<=7;i++){
      var pct = byDay[i]? (byDay[i]/3*100) : 0;
      var dim = i>dow;
      bars += '<div class="bar-row"><span class="d">周'+names[i-1]+'</span><div class="bar-track"><div class="bar-fill" style="width:'+pct+'%;'+(dim?'opacity:.25':'')+'"></div></div><span class="s">'+(byDay[i]?'●':'·')+'</span></div>';
    }
    var quotes = week.filter(function(r){ return r['一句话']; }).map(function(r){ return r['一句话']; });
    var quoteHtml = quotes.length? '<div class="quote">📝 一句话精选：'+esc(quotes[0])+'</div>' : '';

    box.innerHTML =
      '<div class="persona"><div class="big">'+p.emoji+'</div><div class="name">「'+p.name+'」</div><div class="desc">'+p.desc+'</div></div>'+
      '<div class="stats">'+
        '<div class="stat"><div class="v">'+n+'</div><div class="k">打卡天数</div></div>'+
        '<div class="stat"><div class="v">'+Math.round(f/n*100)+'%</div><div class="k">专注率</div></div>'+
        '<div class="stat"><div class="v">'+Math.round(s/n*100)+'%</div><div class="k">运动率</div></div>'+
        '<div class="stat"><div class="v">'+Math.round(l/n*100)+'%</div><div class="k">熬夜率</div></div>'+
      '</div>'+
      '<div class="bars">'+bars+'</div>'+ quoteHtml;
  }

  function renderHistory(){
    var box = $('#historyBox');
    if(!records.length){ box.innerHTML='<div class="report-empty">暂无记录</div>'; return; }
    var html='';
    records.slice(0, maxRender).forEach(function(r){
      var tags='';
      if(r['专注']) tags+='<span class="tag good">🎯 专注</span>';
      if(r['运动']) tags+='<span class="tag good">🏃 运动</span>';
      if(r['熬夜']) tags+='<span class="tag warn">🦉 熬夜</span>';
      tags+='<span class="tag">'+esc(r['心情']||'—')+'</span>';
      html += '<div class="h-item"><span class="date">'+esc(r['日期']||'—')+'</span><div class="tags">'+tags+'</div>'+
        (r['一句话']?'<div class="note">'+esc(r['一句话'])+'</div>':'')+'</div>';
    });
    box.innerHTML = html;
  }

  // ---------- 启动 ----------
  if(!db){
    $('#reportBox').innerHTML = '<div class="report-empty">数据服务暂不可用，打卡功能稍后恢复。</div>';
    $('#historyBox').innerHTML = '<div class="report-empty">暂无记录</div>';
  }else{
    try{
      db.getSchema({ databaseId: DATABASE_ID }).then(function(){
        loadData();
      }).catch(function(err){ console.error('[database] schema 加载失败:',err); loadData(); });
    }catch(err){ console.error(err); }
  }
  restoreLocal();
})();
