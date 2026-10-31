
var B = window.__wordData;
/* ================= 爱音单词 Web =================
   五题型、记忆曲线、每日任务与服饰奖励
   ================================================= */
var AINO = 37, DAY = 86400000, KEY = 'aiyin_web_v1';

/* ---- 工具 ---- */
function $(s){ return document.querySelector(s); }
function $$(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
function shuffle(a){ for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
function rnd(n){ return Math.floor(Math.random()*n); }
function pick(a){ return a[rnd(a.length)]; }
function todayKey(d){ d=d||new Date(); var m=d.getMonth()+1,y=d.getDate();
  return d.getFullYear()+'-'+(m<10?'0':'')+m+'-'+(y<10?'0':'')+y; }
var tt=null;
function toast(m){ var t=$('#toast'); t.textContent=m; t.classList.add('on'); clearTimeout(tt); tt=setTimeout(function(){t.classList.remove('on');},1900); }
function openM(h){ $('#modal').innerHTML=h; $('#mask').classList.add('on'); }
function closeM(){ $('#mask').classList.remove('on'); }
$('#mask').addEventListener('click',function(e){ if(e.target===this) closeM(); });
function art(k){ return B.art[k]||''; }
function castOf(id){ for(var i=0;i<B.cast.length;i++) if(B.cast[i].id===id) return B.cast[i]; return {id:id,n:'角色'+id,c:'#8899aa'}; }


/* ---- 词库展开 ---- */
var WORDS=[], WMAP={}, BOOKS=B.books;
(function(){
  for(var i=0;i<B.words.length;i++){
    var b=B.words[i], ws=b.w;
    for(var j=0;j<ws.length;j++){
      var w=ws[j], it={id:b.id+'|'+w[0], bk:b.id, lang:b.lang, h:w[0], ph:w[1], pos:w[2], m:w[3], ex:w[4], ez:w[5], em:w[6]};
      WMAP[it.id]=it; WORDS.push(it);
    }
  }
})();
function bookWords(id){
  var r=[]; for(var i=0;i<WORDS.length;i++) if(WORDS[i].bk===id) r.push(WORDS[i]); return r;
}

/* ---- 状态 ---- */
var S={ v:3, book:'CET4', goal:20, newMax:20, mix:'auto', mode:'auto', prog:{}, daily:{}, gems:120, freeze:3,
  lv:1, xp:0, streak:0, lastDay:'', lastStamp:0, dayIdx:0, studiedDay:'',
  combo:0, comboBest:0, stars:{}, starClaim:{}, done:0, bonus:0, cos:{},
  game:{best:0, plays:0, lastWin:''}, theme:'light', broken:'' };
function save(){ window.__wordStore.save(S).catch(function(){}); }
function load(){
  try{ var o=window.__wordStore.initial; if(!o) return false;
    for(var k in o) S[k]=o[k];
    if(!S.game) S.game={best:0,plays:0,lastWin:''};
    if(!S.cos) S.cos={}; if(!S.stars) S.stars={}; if(!S.starClaim) S.starClaim={};
    if(S.combo==null) S.combo=0; if(S.comboBest==null) S.comboBest=0;
    if(S.done==null) S.done=0; if(S.bonus==null) S.bonus=0;
    if(!S.favs) S.favs=[];
    if(S.dust!=null) delete S.dust;                     // 旧存档：星尘体系已下线
    if(S.col!=null) delete S.col;                       // 旧存档：卡面体系已下线
    if(S.goal!=null){ S.goals=S.goals||{}; if(S.goals[S.book]==null) S.goals[S.book]=S.goal; delete S.goal; }   // 旧存档：全局每日目标迁给当前书
    if(!S.mode) S.mode='auto'; if(!S.studiedDay) S.studiedDay='';
    return true; }catch(e){ return false; }
}
function todayStat(){
  var k=todayKey(); if(!S.daily[k]) S.daily[k]={n:0,r:0,c:0,w:0,xp:0,g:0,t:{a:0,b:0,c2:0},claim:0,b:{}};
  return S.daily[k];
}
/* 按词典分桶的当日统计/任务/目标/冲刺——先选书再分配任务 */
function bookStat(bk){
  var t=todayStat(); bk=bk||S.book;
  if(!t.b) t.b={};
  if(!t.b[bk]) t.b[bk]={n:0,r:0,c:0,w:0,claim:{}};
  return t.b[bk];
}
function goalOf(bk){ bk=bk||S.book; return (S.goals&&S.goals[bk])||20; }
function setGoalOf(bk,v){ S.goals=S.goals||{}; S.goals[bk]=Math.max(5,Math.min(200,parseInt(v,10)||20)); }
function sprintOf(bk){ bk=bk||S.book; S.sprint=S.sprint||{}; if(!S.sprint[bk]) S.sprint[bk]={n:0,day:''}; return S.sprint[bk]; }

/* ---- 单调日序号（防改系统时间刷收益） ---- */
function dayIndex(){
  var now=Date.now(), idx=Math.floor(now/DAY);
  if(S.lastStamp && now+3600000 < S.lastStamp) return S.dayIdx;   // 回拨 >1h：冻结
  if(idx>S.dayIdx){ var jump=idx-S.dayIdx; S.dayIdx=idx; S.lastStamp=now; return {idx:idx,jump:jump}; }
  if(idx>S.dayIdx) S.dayIdx=idx; else if(!S.dayIdx) S.dayIdx=idx;
  S.lastStamp=now;
  return {idx:idx,jump:0};
}
function rollDay(){
  var r=dayIndex(), jump=(r&&r.jump)||0, k=todayKey();
  if(S.lastDay!==k){
    var prev=S.lastDay;
    S.lastDay=k;
    // 断更判定：跨了 >1 天，且昨天（上次打开那天）没留下学习记录
    if(jump>1 && prev && (S.streak||0)>0 && S.studiedDay!==prev) breakStreak(jump);
    if(S.sprint){ var yk2=todayKey(new Date(Date.now()-86400000)); for(var bk2 in S.sprint){ var sp2=S.sprint[bk2]; if(sp2.n && sp2.day && sp2.day!==k && sp2.day!==yk2) sp2.n=0; } }   // 三日冲刺断档清零（每本书各自算）
  }
}
/* 连胜口径：今天第一次「真的学了」才 +1（打开应用不算） */
function ensureDay(){
  rollDay();
  var k=todayKey();
  if(S.studiedDay===k) return;
  S.studiedDay=k;
  S.streak=(S.streak||0)+1;
  if(S.streak%7===0){ addGems(30,'周常'); toast('🔥 连续 '+S.streak+' 天 · 周常 +30⭐'); anonSay('streak',true); }
  save(); checkAch();
}
function breakStreak(jump){
  if(S.broken===todayKey()) return;
  var lost=S.streak; S.streak=0; S.broken=todayKey(); save();
  openM('<h3>😢 连续记录断了</h3><div class="muted">离开了 '+jump+' 天，之前连续 '+lost+' 天。选一个：</div>'+
   '<div class="item" style="margin-top:10px"><div class="tx"><div class="n">❄ 用冻结卡（剩 '+S.freeze+'）</div><div class="d">保住 '+lost+' 天记录</div></div>'+
   '<div class="r"><button class="btn sm pri" onclick="useFreeze('+lost+')">用卡</button></div></div>'+
   '<div class="item"><div class="tx"><div class="n">⭐ 星石急救 · 200⭐/天</div><div class="d">当前 '+S.gems+'⭐</div></div>'+
   '<div class="r"><button class="btn sm" onclick="payFreeze('+lost+')">急救</button></div></div>'+
   '<div class="item"><div class="tx"><div class="n">🙂 认栽</div><div class="d">免费，送 1 张冻结卡，从头开始</div></div>'+
   '<div class="r"><button class="btn sm" onclick="acceptBreak()">认栽</button></div></div>');
}
function useFreeze(n){ if(S.freeze<=0){ toast('没有冻结卡了'); return; } S.freeze--; S.streak=n; save(); closeM(); refreshTop(); toast('❄ 记录保住了：'+n+' 天'); }
function payFreeze(n){ if(S.gems<200){ toast('星石不够'); return; } S.gems-=200; S.streak=n; save(); closeM(); refreshTop(); toast('⭐ 急救成功：'+n+' 天'); }
function acceptBreak(){ S.freeze=Math.min(8,S.freeze+1); save(); closeM(); refreshTop(); anonSay('w'); toast('爱音：没关系，明天一起加油吧'); }

/* ---- 星石账本 ---- */
var LOG=[];
function addGems(n,src){ S.gems+=n; LOG.push({t:Date.now(),n:n,s:src||''}); if(LOG.length>200) LOG.shift(); refreshTop(); }
function spendGems(n,src){ if(S.gems<n) return false; S.gems-=n; LOG.push({t:Date.now(),n:-n,s:src||''}); refreshTop(); return true; }
function addXp(n){
  S.xp+=n; var need=120+(S.lv-1)*80;
  while(S.xp>=need){ S.xp-=need; S.lv++; addGems(10,'升级'); if(S.lv%5===0) addGems(60,'里程碑');
    toast('🎉 升到 Lv.'+S.lv+' · +10⭐'); anonSay('l'); need=120+(S.lv-1)*80; }
  todayStat().xp+=n;
}

/* ---- 音频门：爱音语音 与 单词朗读 互斥，且必须等首次交互后才发声 ---- */
var AG = { unlocked: false, el: null, cur: 0, ok: true };
function agUnlock() { AG.unlocked = true; }
['pointerdown', 'touchstart', 'keydown', 'click'].forEach(function (ev) {
  document.addEventListener(ev, function once() { AG.unlocked = true; }, { once: true, capture: true });
});
function agStop() {
  try { if (AG.el) { AG.el.pause(); AG.el.currentTime = 0; } } catch (e) {}
  try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
}
function agVoice(id) {
  if (!AG.unlocked || !AG.ok) return false;          // 未交互 / 上次失败 → 静默跳过
  var src = B.voices && B.voices[id];
  if (!src) return false;
  try {
    if (window.speechSynthesis) speechSynthesis.cancel();   // 语音优先，掐掉朗读
    if (!AG.el) AG.el = new Audio();
    AG.el.src = src; AG.el.volume = 0.9; AG.el.currentTime = 0;
    var p = AG.el.play();
    if (p && p['catch']) p['catch'](function () { AG.ok = false; });  // 解码失败就永久降级
    return true;
  } catch (e) { AG.ok = false; return false; }
}

/* ---- 爱音说话 ----
   选句规则：先按场景筛 → 成败严格筛 → 语气筛 → 收尾优先，
   最后只在「有语音」的句子里挑 —— 气泡显示的中文和嘴巴播出来的那一段 100% 是同一句。
   （旧版按前缀随机抽，抽到没打包语音的句子就 fallback 到「Perfect！」，声画全乱。） */
var lastSay=0;
var SAYRULE={
  new:    {scene:'new',    outcome:'ANY',  tone:'INVITE'},
  rev:    {scene:'rev',    outcome:'ANY',  tone:'INVITE'},
  miss:   {scene:'miss',   outcome:'MISS', tone:'COMFORT'},
  w:      {scene:'miss',   outcome:'MISS', tone:'COMFORT'},
  goal:   {scene:'goal',   outcome:'HIT',  tone:'PRAISE'},
  streak: {scene:'streak', outcome:'ANY'},
  pat:    {scene:'pat',    outcome:'ANY'},
  level:  {scene:'level',  outcome:'ANY'},
  g5:     {scene:'g5',     outcome:'HIT'},
  g4:     {scene:'g5',     outcome:'HIT'},
  g3:     {scene:'game',   outcome:'ANY'},
  start:  {scene:'start',  outcome:'ANY'},
  close:  {scene:'close',  outcome:'ANY',  closing:1},
  prog:   {scene:'prog',   outcome:'ANY'},
  game:   {scene:'game',   outcome:'ANY'},
  perfect:{scene:'g5',     outcome:'HIT'},
  combo:  {scene:'combo',  outcome:'ANY'},
  dict:   {scene:'dict',   outcome:'HIT'}
};
function anonPick(kind){
  var want=SAYRULE[kind]||SAYRULE.prog, pool=[], i, L;
  for(i=0;i<B.lines.length;i++){
    L=B.lines[i];
    if(L[2]!==want.scene) continue;
    if(want.outcome!=='ANY' && L[4]!=='ANY' && L[4]!==want.outcome) continue;
    if(want.tone && L[3]!==want.tone) continue;
    if(want.closing && !L[5]) continue;
    if(!B.voices || !B.voices[L[0]]) continue;      // 只选有语音的：声画必须同句
    pool.push(L);
  }
  if(!pool.length){                                  // 该场景没有带语音的 → 只显示文案不播音
    for(i=0;i<B.lines.length;i++){
      L=B.lines[i];
      if(L[2]!==want.scene) continue;
      if(want.outcome!=='ANY' && L[4]!=='ANY' && L[4]!==want.outcome) continue;
      pool.push(L);
    }
  }
  return pool.length? pick(pool) : null;
}
function setQImg(src){ $$('[data-q]').forEach(function(e){ if(src) e.src=src; }); }
/* Q 版伴侣图源：穿上服饰 → 该服饰半身实拍；没穿 → default Q 版表情 */
function qSrc(pose){
  var k=(S.equip&&S.equip[37])||'';
  if(k&&k!=='default'){ var b=art('b37_'+k); if(b) return b; }
  return art('sd_'+pose)||art('sd_normal');
}
function anonSay(kind, force){
  var L=anonPick(kind);
  if(!L) return null;
  $('#bubbleText').textContent=L[1];
  var pose = (kind==='miss')?'surprise':(kind==='goal'||kind==='g5'||kind==='perfect')?'smile':(kind==='pat')?'wink':'normal';
  if(L2.state!==2){ var src=qSrc(pose); if(src) setQImg(src); }
  l2dPlay(kind); l2dExp(L2EXP[kind]);
  var now=Date.now();
  var hot=(force||kind==='pat'||kind==='g5'||kind==='perfect'||kind==='goal'||kind==='miss'||kind==='streak'||kind==='level');
  if(hot && now-lastSay>900){
    lastSay=now;
    if(B.voices && B.voices[L[0]]) agVoice(L[0]);     // 播的就是气泡这一句
  }
  return L;
}

/* ---- TTS ---- */
var voices=[];
function initV(){ if(window.speechSynthesis) voices=speechSynthesis.getVoices()||[]; }
if(window.speechSynthesis){ initV(); speechSynthesis.onvoiceschanged=initV; }
function speak(txt, lang){
  if(!window.speechSynthesis) return;
  try{ if(AG.el){ AG.el.pause(); } }catch(e){}   // 朗读优先，掐掉爱音语音
  try{ speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(txt), want=lang||'en-US', v=null;
    for(var i=0;i<voices.length;i++){ if(voices[i].lang&&voices[i].lang.replace('_','-').toLowerCase().indexOf(want.toLowerCase())===0){v=voices[i];break;} }
    if(v) u.voice=v; u.lang=want; u.rate=.92; speechSynthesis.speak(u);
  }catch(e){}
}

/* ---- SRS（interval / ease / due / reps / lapses） ---- */
function progOf(id){
  if(!S.prog[id]) S.prog[id]={i:0,e:2.5,d:0,r:0,l:0,s:0};
  return S.prog[id];
}
/* 连击倍率：1 + min(combo,10)×0.1，×2.0 封顶 */
function comboMul(){ return Math.min(2, 1 + (S.combo||0)*0.1); }
function gradeWord(id,q,mode){
  ensureDay();                       // 今天第一题 → 连胜 +1
  var p=progOf(id), now=Date.now(), first=(p.r===0&&p.s===0), bs=bookStat();
  if(first){ todayStat().n++; bs.n++; } else { todayStat().r++; bs.r++; }
  if(q>=4){ todayStat().c++; bs.c++; S.done=(S.done||0)+1; S.combo=(S.combo||0)+1; if(S.combo>(S.comboBest||0)) S.comboBest=S.combo; }
  else { todayStat().w++; bs.w++; p.l++; S.combo=0; }
  if(q===1){ p.r=0; p.i=0; p.d=now+10*60000; p.e=Math.max(1.3,p.e-0.2); }
  else if(q===3){ p.r=Math.max(1,p.r); p.i=Math.max(0.25,(p.i||1)*0.5); p.e=Math.max(1.3,p.e-0.15); }
  else if(q===4){ p.r++; p.e=Math.min(2.8,p.e+0.1);
    p.i=(p.r===1)?1:(p.r===2)?3:Math.max(1,Math.round((p.i||1)*p.e)); }
  else{ p.r++; p.e=Math.min(2.8,p.e+0.15);
    p.i=(p.r===1)?3:(p.r===2)?7:Math.max(2,Math.round((p.i||1)*p.e*1.3)); }
  p.d=(q===1)?now+10*60000:now+Math.max(0.02,p.i)*DAY;
  p.s=1; p.last=now;
  addXp(Math.round((q>=4?8:4)*comboMul()));
  if(q>=4){
    addGems(1,'答题');
    S.stars[S.book]=(S.stars[S.book]||0)+1;                 // 词书星星 → 里程碑解锁
    checkStarUnlock(S.book);
    maybeBonus();                                            // 爱音红包（惊喜，小概率）
    if(S.combo>0 && S.combo%5===0) anonSay('combo');         // 连击里程碑
  }else{
    if(!S.errs) S.errs={};
    S.errs[id]={m:mode||'card', t:now};                      // 错词本（按题型记）
    anonSay('miss');
  }
  checkAch(); save();
}
/* ---- 学习奖励：爱音红包（惊喜） + 词书星星里程碑（确定性） ---- */
var BONUS_P=0.10, BONUS_GEM=[3,5,8,12];
function maybeBonus(){
  if(Math.random()>BONUS_P) return null;
  var g=pick(BONUS_GEM);
  addGems(g,'爱音红包');
  S.bonus=(S.bonus||0)+1; save();
  toast('💝 爱音红包 +'+g+'⭐');
  anonSay('goal',true);
  return g;
}
/* 词书星星里程碑：30 / 80 / 150 星各发一份星石大红包 */
var STAR_STEP=[30,80,150], STAR_GEM=[120,300,600];
function starClaimed(bk){ return (S.starClaim&&S.starClaim[bk])||0; }
function checkStarUnlock(bk){
  var st=S.stars[bk]||0, got=0, i;
  for(i=0;i<STAR_STEP.length;i++) if(st>=STAR_STEP[i]) got=i+1;
  while(starClaimed(bk)<got){
    if(!S.starClaim) S.starClaim={};
    S.starClaim[bk]=starClaimed(bk)+1;
    var g=STAR_GEM[starClaimed(bk)-1];
    addGems(g,'星星里程碑'); save();
    openM('<h3>📗 '+esc(bookTitle(bk))+' '+STAR_STEP[starClaimed(bk)-1]+' 星达成！</h3>'+
      '<div class="muted">爱音塞给你一个大红包：<b>+'+g+'⭐</b></div>'+
      '<div class="tiny" style="margin-top:6px">下一档：'+((STAR_STEP[starClaimed(bk)]||'已全达成')+(STAR_STEP[starClaimed(bk)]?' 星':''))+'</div>'+
      '<div style="margin-top:14px"><button class="btn pri block" onclick="closeM()">收下</button></div>');
    anonSay('goal',true);
  }
}

/* ---- 目标与任务（五任务、全清奖励及每日目标达成演出） ---- */
function goalPct(){ var bs=bookStat(), g=goalOf(); return Math.min(100,Math.round((bs.n+bs.r)/g*100)); }
function goalHit(bk){ var bs=bookStat(bk), g=goalOf(bk); return (bs.n+bs.r)>=g; }
function taskDefs(t,bk){
  var k=todayKey(), bs=bookStat(bk);
  return [
    {k:'a', n:'新学 10 个词', now:bs.n, need:10, gem:15},
    {k:'b', n:'复习 20 个词', now:bs.r, need:20, gem:14},
    {k:'c', n:'单次连对 15 词', now:S.comboBest||0, need:15, gem:12},
    {k:'d', n:'玩一次小游戏', now:(S.game.lastWin===k?1:0), need:1, gem:10},
    {k:'e', n:'今日目标达成', now:(goalHit(bk)?1:0), need:1, gem:10}
  ];
}
function checkTasks(){
  var t=todayStat(), k=todayKey(), bk=S.book, bs=bookStat(bk);
  if(!bs.claim) bs.claim={};
  var defs=taskDefs(t,bk), all=true, i;
  for(i=0;i<defs.length;i++){
    var d=defs[i];
    if(d.now>=d.need && !bs.claim[d.k]){ bs.claim[d.k]=1; addGems(d.gem,'每日任务'); toast('✅ '+d.n+' · +'+d.gem+'⭐'); }
    if(d.now<d.need) all=false;
  }
  if(all && !bs.claim.all){
    bs.claim.all=1; addGems(15,'日目标');
    addXp(100);                                            // 每日目标奖励
    /* 三日冲刺：该书跨天连续全清，每满 3 天 +30⭐ 大红包 */
    var yk=todayKey(new Date(Date.now()-86400000)), sp=sprintOf(bk);
    sp.n=(sp.day===yk)?sp.n+1:1; sp.day=k;
    var sprint=(sp.n%3===0);
    if(sprint){ addGems(30,'三日冲刺'); anonSay('streak',true); }
    anonSay('goal',true);
    toast('🎯 「'+bookTitle(bk)+'」今日目标达成 · +100XP +15⭐'+(sprint?' · 🔥 连续 '+sp.n+' 天全清 +30⭐':''));
  }
  checkAch(); save();
}
/* ---- 顶栏 ---- */
function refreshTop(){
  $('#cStreak').textContent='🔥 '+(S.streak||0);
  $('#cLv').textContent='Lv.'+S.lv;
  $('#cGem').textContent='⭐ '+S.gems;
  $('#cFreeze').textContent='❄ '+S.freeze;
}
function go(p){
  if(typeof G!=='undefined' && G && G.on) { try{ gameEnd(); }catch(e){} }        // 切页先结算小游戏
  agStop();                                                                        // 切页安静
  $$('.page').forEach(function(s){ s.classList.remove('on'); });
  var el=$('#p-'+p); if(el) el.classList.add('on');
  $$('.tab').forEach(function(b){ b.classList.toggle('on', b.dataset.p===p); });
  window.scrollTo(0,0);
  if(p==='home'){ refreshHome(); showSub('stage'); }
  if(p==='learn'){ renderBooks(); renderModes(); if(inSession){ $('#learnPlan').style.display='none'; $('#learnBody').style.display=''; renderLearn(); } else { showPlan(); } }
  if(p==='set') renderSet();
}
$$('.tab').forEach(function(b){ b.addEventListener('click', function(){ go(b.dataset.p); }); });
$('#btnGoLearn').addEventListener('click', function(){ go('learn'); });
$('#btnGoWard').addEventListener('click', function(){ go('home'); showSub('ward'); });
function showSub(sub){
  ['stage','game','ward'].forEach(function(s){ var el=$('#sub-'+s); if(el) el.style.display=(s===sub)?'':'none'; });
  $$('#subTabs .stab').forEach(function(b){ b.classList.toggle('on', b.dataset.sub===sub); });
  if(sub==='game') renderGameHome();
  if(sub==='ward') refreshWard();
  if(sub==='stage' && L2.state!==2) l2dStart();
}
$$('#subTabs .stab').forEach(function(b){ b.addEventListener('click', function(){ showSub(b.dataset.sub); }); });

/* ---- 查词 ---- */
function dictOpen(){
  var html='<h3>🔍 查词 <span class="more">词库 '+WORDS.length+' 词</span></h3>'+
    '<input type="text" id="dictInput" placeholder="输入英文或中文意思，如 apple / 苹果" autocomplete="off" style="margin-top:6px">'+
    '<div class="row" style="gap:8px;margin-top:10px"><button class="btn sm" id="dictFavBtn">⭐ 我的收藏 ('+(S.favs||[]).length+')</button>'+
    '<button class="btn sm" id="dictClear">清空</button></div>'+
    '<div class="dict-res" id="dictResults"><div class="tiny" style="padding:10px;color:var(--faint)">输入点什么，爱音帮你查～</div></div>';
  openM(html);
  var inp=$('#dictInput');
  if(inp){ inp.addEventListener('input', function(){ dictSearch(inp.value, false); }); setTimeout(function(){ inp.focus(); },60); }
  $('#dictFavBtn').addEventListener('click', function(){ dictSearch('', true); });
  $('#dictClear').addEventListener('click', function(){ $('#dictInput').value=''; dictSearch('', false); });
}
function dictSearch(q, favOnly){
  var box=$('#dictResults'); if(!box) return;
  if(favOnly){
    var fw=[]; (S.favs||[]).forEach(function(id){ if(WMAP[id]) fw.push(WMAP[id]); });
    if(!fw.length){ box.innerHTML='<div class="tiny" style="padding:10px;color:var(--faint)">还没收藏任何词，点结果上的 ☆ 就能收进来。</div>'; return; }
    box.innerHTML=fw.map(dictRow).join(''); dictBind(); return;
  }
  q=(q||'').trim().toLowerCase();
  if(!q){ box.innerHTML='<div class="tiny" style="padding:10px;color:var(--faint)">输入点什么，爱音帮你查～</div>'; return; }
  var qn=q.replace(/[\s\-]/g,''), exact=[], start=[], sub=[], mean=[], seen={};
  for(var i=0;i<WORDS.length;i++){
    var w=WORDS[i], h=w.h.toLowerCase().replace(/[\s\-]/g,'');
    if(seen[w.id]) continue;
    if(h===qn){ exact.push(w); seen[w.id]=1; }
    else if(h.indexOf(qn)===0){ start.push(w); seen[w.id]=1; }
    else if(h.indexOf(qn)>=0){ sub.push(w); seen[w.id]=1; }
    if(seen[w.id]!==1 && w.m && w.m.toLowerCase().indexOf(q)>=0){ mean.push(w); seen[w.id]=1; }
  }
  var out=exact.concat(start,sub,mean).slice(0,40);
  if(!out.length){ box.innerHTML='<div class="tiny" style="padding:10px;color:var(--faint)">没找到「'+esc(q)+'」相关的词，换个写法试试？</div>'; return; }
  box.innerHTML=out.map(dictRow).join(''); dictBind();
}
function dictRow(w){
  var fav=(S.favs||[]).indexOf(w.id)>=0;
  return '<div class="dict-row" data-id="'+w.id+'">'+
    '<span class="fav" data-fav="'+w.id+'">'+(fav?'⭐':'☆')+'</span>'+
    '<div><span class="h">'+esc(w.h)+'</span>'+(w.ph?'<span class="ph">/'+esc(w.ph)+'/'+(w.lang==='ja'?' 🇯🇵':'')+'</span>':'')+
    (w.pos?'<span class="pos">'+esc(w.pos)+'</span>':'')+'</div>'+
    '<div class="m">'+esc(w.m||'')+'</div></div>';
}
function dictBind(){
  $$('#dictResults .dict-row').forEach(function(el){
    el.addEventListener('click', function(e){
      if(e.target.classList.contains('fav')){ toggleFav(e.target.getAttribute('data-fav')); return; }
      var id=el.getAttribute('data-id'), w=WMAP[id]; if(!w) return;
      var open=el.querySelector('.dict-detail');
      if(open){ open.remove(); return; }
      $$('#dictResults .dict-detail').forEach(function(d){ d.remove(); });
      var d=document.createElement('div'); d.className='dict-detail';
      d.innerHTML='<div class="ex">'+(w.ex?esc(w.ex):'<i>暂无例句</i>')+(w.ez?'<i>'+esc(w.ez)+'</i>':'')+'</div>'+
        '<div class="acts"><button class="btn sm" onclick="speak(\''+esc(w.h)+'\',\''+(w.lang==='ja'?'ja-JP':'en-US')+'\')">🔊 朗读</button>'+
        '<button class="btn sm pri" onclick="dictStudy(\''+w.id+'\')">📚 加入学习</button>'+
        '<button class="btn sm" onclick="dictWordGo(\''+w.id+'\')">去背它</button></div>';
      el.appendChild(d);
    });
  });
  $$('#dictResults .fav').forEach(function(el){
    el.addEventListener('click', function(e){ e.stopPropagation(); toggleFav(el.getAttribute('data-fav')); });
  });
}
function toggleFav(id){
  if(!S.favs) S.favs=[]; var i=S.favs.indexOf(id);
  if(i>=0) S.favs.splice(i,1); else S.favs.push(id); save();
  var f=$('#dictFavBtn'); if(f) f.textContent='⭐ 我的收藏 ('+S.favs.length+')';
  $$('#dictResults .fav[data-fav="'+id+'"]').forEach(function(el){ el.textContent=(S.favs.indexOf(id)>=0)?'⭐':'☆'; });
}
function dictStudy(id){ var w=WMAP[id]; if(!w) return; if(!S.prog) S.prog={};
  S.prog[id]={i:0,e:2.5,d:0,r:0,l:0,s:0}; save(); toast('📚 已加入学习：'+w.h); }
function dictWordGo(id){ closeM(); go('learn'); toast('已加入，去「开始学习」就能背到它'); }
$('#btnDict').addEventListener('click', dictOpen);

/* ---- 舞台 ---- */
function refreshHome(){
  var now=Date.now(), due=0, fresh=0, i, w, p, list=bookWords(S.book);
  for(i=0;i<list.length;i++){ w=list[i]; p=S.prog[w.id]; if(!p) fresh++; else if(p.d<=now) due++; }
  $('#hDue').textContent=due;
  $('#hNew').textContent=bookStat().n;
  var mastered=0; for(var mid in S.prog) if(S.prog[mid].r>0) mastered++;
  $('#hGot').textContent=mastered;
  $('#hXp').textContent=todayStat().xp;
  var t=todayStat(), bs=bookStat(), got=bs.n+bs.r, g=goalOf(), pct=Math.min(100,Math.round(got/g*100));
  $('#goalBar').style.width=pct+'%';
  $('#goalPct').textContent=pct+'%';
  $('#goalTxt').textContent=bookTitle(S.book)+' · '+g+' 词';
  $('#goalDetail').textContent='新学 '+bs.n+' · 复习 '+bs.r+' · 共 '+got+' / '+g;
  renderTasks(t,due);
}
function renderTasks(t,due){
  var k=todayKey(), defs=taskDefs(t,S.book), h='', bs=bookStat(), sp=sprintOf();
  if(sp.n>0) h+='<div class="tiny" style="margin-bottom:7px">🔥 「'+esc(bookTitle(S.book))+'」连续全清 '+(sp.n%3===0?3:sp.n%3)+' / 3 天 · 满 3 天额外 +30⭐</div>';
  defs.forEach(function(d){
    var ok=d.now>=d.need, claimed=bs.claim&&bs.claim[d.k];
    h+='<div class="task"><div class="tx"><div class="n">'+esc(d.n)+'</div>'+
       '<div class="d">'+Math.min(d.now,d.need)+' / '+d.need+'</div></div>'+
       '<div class="row"><span class="tag '+(ok?'ok':'')+'">+'+d.gem+'⭐</span>'+
       '<span class="tag '+(claimed?'pk':'')+'">'+(claimed?'已领':'待完成')+'</span></div></div>';
  });
  $('#taskList').innerHTML=h;
}
/* ---- 成就（连胜 / 连击 / 题量 / 星星） ---- */
var ACHS=[
 {id:'a_streak3',  n:'三日疗法',   d:'连续学习 3 天',      ic:'🔥'},
 {id:'a_streak7',  n:'一周不落',   d:'连续学习 7 天',      ic:'🔥'},
 {id:'a_streak30', n:'月度坚持',   d:'连续学习 30 天',     ic:'🏆'},
 {id:'a_streak100',n:'百日 Messiah',d:'连续学习 100 天',   ic:'👑'},
 {id:'a_combo20',  n:'手感火热',   d:'单次连对 20 词',     ic:'⚡'},
 {id:'a_done500',  n:'五百题俱乐部', d:'累计答对 500 题',      ic:'✍️'},
 {id:'a_book1',    n:'第一册书',   d:'任意词书拿到 30 星', ic:'📗'},
 {id:'a_goal7',    n:'目标常客',   d:'累计 7 天达成每日目标', ic:'🎯'}
];
function tryUnlock(id, cond){
  if(!cond) return false;
  if(!S.ach) S.ach={};
  if(S.ach[id]) return false;
  var a=null; for(var i=0;i<ACHS.length;i++) if(ACHS[i].id===id) a=ACHS[i];
  if(!a) return false;
  S.ach[id]=1;
  addXp(150); addGems(50,'成就');
  if(id==='a_streak30'){ S.freeze++; toast('🏆「月度坚持」送 1 张冻结卡'); }
  if(id==='a_streak100'){ S.freeze+=2; toast('👑「百日 Messiah」送 2 张冻结卡'); }
  toast('🏆 解锁成就「'+a.n+'」· +150XP +50⭐');
  anonSay('level',true); save();
  return true;
}
function checkAch(){
  var stars=0; for(var k in S.stars) stars+=S.stars[k];
  var goals=0, kk; for(kk in S.daily) if(S.daily[kk].claim&&S.daily[kk].claim.all) goals++;
  tryUnlock('a_streak3', (S.streak||0)>=3);
  tryUnlock('a_streak7', (S.streak||0)>=7);
  tryUnlock('a_streak30', (S.streak||0)>=30);
  tryUnlock('a_streak100', (S.streak||0)>=100);
  tryUnlock('a_combo20', (S.comboBest||0)>=20);
  tryUnlock('a_done500', (S.done||0)>=500);
  tryUnlock('a_book1', stars>=30);
  tryUnlock('a_goal7', goals>=7);
}

/* ---- 学习：五题型（auto/card/choice/spell/listen） ---- */
var Q=[], QI=0, QDONE=0, QTOTAL=0, LMODE='auto', LTICK=0;
var WRONGMODE=false, WRONGTYPE='', ANSWERED=false, REVEALED=false;
var LBATCH={start:0, total:0, pass:0, n:0};
var inSession=false;
var MODE_LABEL={auto:'自动',card:'回忆卡',choice:'四选一',spell:'拼写',listen:'听音选义'};
function curWord(){ return Q[QI]?WMAP[Q[QI]]:null; }
function isNewWord(w){ var p=S.prog[w.id]; return !p||p.r===0; }
/* auto 编排（同 App，并补足五题型）：新词 → 回忆卡；复习 → 四选一/拼写/听音选义 循环；词组（含空格）不拼写/不听写 */
function pickMode(w){
  if(WRONGMODE) return WRONGTYPE||'card';
  if(LMODE!=='auto') return LMODE;
  if(isNewWord(w)) return 'card';
  if(w.h.indexOf(' ')>=0) return 'choice';
  var r = LTICK % 3;
  return (r===0)?'choice':(r===1)?'spell':'listen';
}
function renderModes(){
  var h='';
  ['auto','card','choice','spell','listen'].forEach(function(m){
    h+='<button class="mode '+(LMODE===m?'on':'')+'" data-m="'+m+'">'+
       ({auto:'🔄 自动',card:'🃏 回忆卡',choice:'🔤 四选一',spell:'⌨️ 拼写',listen:'🎧 听音选义'})[m]+'</button>';
  });
  $('#modeBar').innerHTML=h;
  $$('#modeBar .mode').forEach(function(el){
    el.addEventListener('click', function(){
      LMODE=el.dataset.m; S.mode=LMODE; save(); renderModes(); renderLearn();
      toast('题型：'+MODE_LABEL[LMODE]);
    });
  });
}
function renderBooks(){
  var h='';
  for(var i=0;i<BOOKS.length;i++){
    var b=BOOKS[i];
    h+='<button class="book '+(S.book===b.id?'on':'')+'" data-b="'+b.id+'">'+esc(b.title)+' '+b.n+'</button>';
  }
  $('#bookBar').innerHTML=h;
  $$('#bookBar .book').forEach(function(el){
    el.addEventListener('click', function(){
      S.book=el.dataset.b; save(); renderBooks(); Q=[]; buildQueue(true); renderLearn(); refreshHome(); toast('词书：'+el.textContent);
    });
  });
}
/* 计划面板：选词书 / 本轮新词数 / 题型倾向 / 配比 */
function renderPlan(){
  var i;
  var hb=''; for(i=0;i<BOOKS.length;i++){ var b=BOOKS[i]; hb+='<button class="book '+(S.book===b.id?'on':'')+'" data-b="'+b.id+'">'+esc(b.title)+' '+b.n+'</button>'; }
  $('#planBook').innerHTML=hb;
  $$('#planBook .book').forEach(function(el){ el.addEventListener('click', function(){ S.book=el.dataset.b; save(); renderPlan(); refreshHome(); }); });
  var ns=[20,50,100,200,'全'], hn=''; for(i=0;i<ns.length;i++){ var nall=ns[i]==='全', nval=nall?999999:ns[i]; hn+='<button class="chip '+(S.newMax===nval?'on':'')+'" data-n="'+ns[i]+'">'+ns[i]+(nall?'（本书）':'')+'</button>'; }
  $('#planNew').innerHTML=hn;
  $$('#planNew .chip').forEach(function(el){ el.addEventListener('click', function(){ var v=el.dataset.n; S.newMax=(v==='全')?999999:(parseInt(v,10)||20); save(); renderPlan(); }); });
  var hm=''; ['auto','card','choice','spell','listen'].forEach(function(m){ hm+='<button class="mode '+(LMODE===m?'on':'')+'" data-m="'+m+'">'+MODE_LABEL[m]+'</button>'; });
  $('#planMode').innerHTML=hm;
  $$('#planMode .mode').forEach(function(el){ el.addEventListener('click', function(){ LMODE=el.dataset.m; S.mode=LMODE; save(); renderPlan(); }); });
  var mx=[['auto','自动'],['new','纯新词'],['rev','纯复习']], hx=''; for(i=0;i<mx.length;i++){ hx+='<button class="chip '+(S.mix===mx[i][0]?'on':'')+'" data-x="'+mx[i][0]+'">'+mx[i][1]+'</button>'; }
  $('#planMix').innerHTML=hx;
  $$('#planMix .chip').forEach(function(el){ el.addEventListener('click', function(){ S.mix=el.dataset.x; save(); renderPlan(); }); });
}
function startSession(){
  inSession=true;
  $('#learnPlan').style.display='none';
  $('#learnBody').style.display='';
  buildQueue(true); renderLearn();
  if(!Q.length) toast('这本词书暂时没有待学的词');
}
function showPlan(){
  inSession=false;
  $('#learnBody').style.display='none';
  $('#learnPlan').style.display='';
  renderPlan();
}
function buildQueue(addNew, ratio){
  LTICK=0; LBATCH={start:Date.now(), total:0, pass:0, n:0};
  if(WRONGMODE){                                     // 错词本队列（可按题型筛）
    var ids=[], id;
    for(id in S.errs) ids.push(id);
    if(WRONGTYPE) ids=ids.filter(function(x){ return S.errs[x].m===WRONGTYPE; });
    ids.sort(function(a,b){ return (S.errs[b].t||0)-(S.errs[a].t||0); });
    Q=shuffle(ids).slice(0,30);
    QI=0; QDONE=0; QTOTAL=Q.length;
    return;
  }
  var now=Date.now(), list=bookWords(S.book), due=[], fresh=[], stale=[], i, w, p;
  for(i=0;i<list.length;i++){ w=list[i]; p=S.prog[w.id];
    if(!p) fresh.push(w.id);
    else if(p.d&&p.d<=now) due.push(w.id);
    else stale.push(w.id); }
  due.sort(function(a,b){ return S.prog[a].d-S.prog[b].d; });
  stale.sort(function(a,b){ return (S.prog[a].d||0)-(S.prog[b].d||0); });
  var quota=Math.max(0,(S.newMax||20)-bookStat().n);
  if(addNew){ shuffle(fresh); fresh=fresh.slice(0,quota); }
  else fresh=[];
  var mix = ratio||S.mix||'auto';
  if(mix==='auto'){
    shuffle(due); shuffle(fresh);
    Q=[];
    var a=0,b=0, bias = due.length>fresh.length*3 ? 3 : 2;
    while(a<due.length||b<fresh.length){
      for(var k=0;k<bias&&a<due.length;k++) Q.push(due[a++]);
      if(b<fresh.length) Q.push(fresh[b++]);
    }
  }else if(mix==='rev'){ Q=due.slice(); }
  else if(mix==='new'){ Q=fresh.slice(); }
  if(!Q.length && stale.length) Q=stale.slice(0,10);
  if(!Q.length && !addNew) Q=list.slice(0,10).map(function(x){ return x.id; });
  QI=0; QDONE=0; QTOTAL=Q.length;
}
function startLearn(){
  inSession=true;
  $('#learnPlan').style.display='none';
  $('#learnBody').style.display='';
  buildQueue(true); renderLearn();
  if(!Q.length) toast('这本词书暂时没有待学的词');
}
function refreshCombo(){
  var c=S.combo||0;
  if(c>=2){ $('#cCombo').style.display=''; $('#comboN').textContent=c; $('#comboM').textContent=comboMul().toFixed(1);
    var b=$('#cCombo'); b.classList.remove('hot'); void b.offsetWidth; b.classList.add('hot'); }
  else $('#cCombo').style.display='none';
}
function renderLearn(){
  var id=Q[QI], w=id?WMAP[id]:null;
  $('#learnLeft').textContent='剩余 '+Math.max(0,Q.length-QI)+' · 已完成 '+QDONE+' / '+QTOTAL;
  $('#learnBar').style.width=(QTOTAL?Math.min(100,QDONE/QTOTAL*100):0)+'%';
  // 阶段行：新词/复习/错词本 + 批次进度
  var phaseTxt;
  if(WRONGMODE) phaseTxt='📕 错词本'+(WRONGTYPE?' · '+({spell:'拼写错',choice:'释义错',listen:'听音错',card:'回忆不起'})[WRONGTYPE]:'');
  else {
    var nl=0, lw=bookWords(S.book), i2;
    for(i2=0;i2<lw.length;i2++) if(!S.prog[lw[i2].id]) nl++;
    phaseTxt=(S.mix==='new'?'🌱 纯新词':S.mix==='rev'?'♻ 纯复习':'⚖ 自动')+' · 剩 '+nl+' 新词';
  }
  $('#learnPhase').textContent=phaseTxt;
  refreshCombo();
  // 批次小结（每 10 词一条，不打断队列）
  if(LBATCH.n>0 && LBATCH.n%10===0 && QTOTAL>QDONE){
    var rate=LBATCH.total?Math.round(LBATCH.pass*100/LBATCH.total):0;
    $('#batchTip').style.display='';
    $('#batchTip').innerHTML='📦 本批 '+LBATCH.n+' 词 · 通过率 '+rate+'% · 剩余 '+(QTOTAL-QDONE)+' 个'+
      (WRONGMODE?'':' · 还剩新词见上行');
  } else if(QTOTAL===QDONE && QTOTAL>0){
    $('#batchTip').style.display='';
    $('#batchTip').textContent='📦 本轮 '+QDONE+' 词全部完成';
  } else $('#batchTip').style.display='none';
  if(!w){
    $('#learnMode').textContent=(bookTitle(S.book)||'')+' · 队列 '+Q.length;
    $('#flip').classList.remove('on'); $('#flip').style.display='none';
    $('#optBox').innerHTML=''; $('#spellBox').style.display='none'; $('#recallBtns').style.display='none';
    $('#scoreBtns').style.display='none'; $('#btnFlip').style.display='none';
    $('#fWord').textContent=Q.length?'':'准备好了吗';
    $('#fPhon').textContent=Q.length?'':'点下面的按钮开始';
    $('#bDef').textContent='学习拿 XP 与星石，回忆相册的卡面全靠答题掉落。';
    $('#bEx').innerHTML=''; $('#bTags').innerHTML='';
    return;
  }
  var m=pickMode(w);
  $('#learnMode').textContent=(bookTitle(S.book)||'')+' · '+MODE_LABEL[LMODE]+' → '+MODE_LABEL[m];
  // reset 各区
  ANSWERED=false; REVEALED=false;
  $('#flip').classList.remove('on'); $('#flip').style.display=(m==='card')?'':'none';
  $('#optBox').innerHTML=''; $('#spellBox').style.display='none'; $('#spellTip').textContent=''; $('#spellTip').className='spelltip';
  $('#recallBtns').style.display='none'; $('#scoreBtns').style.display='none';
  $('#btnFlip').style.display=(m==='card')?'':'none';
  if(m==='card') renderCard(w);
  else if(m==='choice') renderChoice(w);
  else if(m==='spell') renderSpell(w);
  else renderListen(w);
  maybeAutoSpeak(w,m);
}
/* 回忆卡：先看词自评「想没想起来」，再翻面对答案，最后打分（同 App：强制先回忆） */
function renderCard(w){
  var p=S.prog[w.id]||{};
  $('#fBook').textContent=(w.em?w.em+' ':'')+bookTitle(w.bk)+' · '+(p.r>0?'复习':'新词');
  $('#fWord').textContent=w.h;
  $('#fPhon').textContent=w.ph||'';
  $('#fHint').innerHTML='先在心里回忆意思，再选「想没想起来」';
  $('#bDef').innerHTML=(w.pos?'<span>'+esc(w.pos)+'</span> ':'')+esc(w.m);
  $('#bEx').innerHTML=w.ex?esc(w.ex)+'<i>'+esc(w.ez||'')+'</i>':'<i>暂无例句</i>';
  $('#bTags').innerHTML='<span class="tag pk">'+esc(bookTitle(w.bk))+'</span>'+
    (p.r?'<span class="tag">复习 '+p.r+' 次</span><span class="tag">间隔 '+(p.i||0).toFixed(1)+' 天</span>':'<span class="tag">第一次见</span>');
  $('#recallBtns').style.display='flex';
}
function flipCard(){
  var w=curWord(); if(!w) return;
  if(pickMode(w)!=='card') return;
  var on=$('#flip').classList.toggle('on');
  if(on){
    REVEALED=true;
    $('#btnFlip').style.display='none'; $('#recallBtns').style.display='none'; $('#scoreBtns').style.display='grid';
    speak(w.h, w.lang==='ja'?'ja-JP':'en-US');
  } else {
    $('#btnFlip').style.display=''; $('#recallBtns').style.display='flex'; $('#scoreBtns').style.display='none';
  }
}
/* 四选一：正确释义 + 3 个同词书干扰项 */
function distractors(w,n){
  var list=bookWords(w.bk).filter(function(x){ return x.id!==w.id; });
  var seen={}, out=[];
  shuffle(list);
  for(var i=0;i<list.length&&out.length<n;i++){
    var mm=list[i].m;
    if(mm && mm!==w.m && !seen[mm]){ seen[mm]=1; out.push(mm); }
  }
  return out;
}
function renderChoice(w){
  $('#fBook').textContent=(w.em?w.em+' ':'')+bookTitle(w.bk)+' · '+(isNewWord(w)?'新词':'复习');
  $('#fWord').textContent=w.h;
  $('#fPhon').textContent=w.ph||'';
  $('#fHint').textContent='选出正确释义';
  var opts=shuffle(distractors(w,3).concat([w.m]));
  var h='';
  opts.forEach(function(t,i){
    h+='<button class="opt" data-t="'+esc(t)+'"><span class="kbd">'+'ABCD'[i]+'</span><span>'+esc(t)+'</span></button>';
  });
  $('#optBox').innerHTML=h;
  $$('#optBox .opt').forEach(function(el){
    el.addEventListener('click', function(){ answerChoice(el, w, opts); });
  });
}
function answerChoice(el, w, opts){
  if(ANSWERED) return;
  ANSWERED=true;
  var ok=el.dataset.t===w.m;
  $$('#optBox .opt').forEach(function(o){
    if(o.dataset.t===w.m) o.classList.add('ok');
    else if(o===el) o.classList.add('bad');
    o.style.pointerEvents='none';
  });
  setTimeout(function(){ answer(ok?4:1,'choice'); }, ok?520:1250);
}
/* 拼写：给释义，输入拼写（词组不进这个模式，同 App） */
function renderSpell(w){
  $('#fBook').textContent=(w.em?w.em+' ':'')+bookTitle(w.bk)+' · '+(isNewWord(w)?'新词':'复习');
  $('#fWord').textContent='? ? ?';
  $('#fPhon').textContent='';
  $('#bDef').innerHTML=(w.pos?'<span>'+esc(w.pos)+'</span> ':'')+esc(w.m);
  $('#bEx').innerHTML=w.ex?esc(w.ex)+'<i>'+esc(w.ez||'')+'</i>':'<i>暂无例句</i>';
  $('#bTags').innerHTML='<span class="tag pk">'+esc(bookTitle(w.bk))+'</span><span class="tag">按释义拼出单词</span>';
  $('#flip').style.display=''; $('#flip').classList.add('on');
  $('#spellBox').style.display='';
  var inp=$('#spellInput'); inp.value=''; inp.disabled=false;
  $('#spellTip').textContent=''; $('#spellTip').className='spelltip';
  setTimeout(function(){ try{ inp.focus(); }catch(e){} },60);
  speak(w.h, w.lang==='ja'?'ja-JP':'en-US');
}
function checkSpell(w){
  if(ANSWERED) return;
  var got=($('#spellInput').value||'').trim().toLowerCase().replace(/[\s-]/g,'');
  if(!got) return;
  ANSWERED=true; $('#spellInput').disabled=true;
  var want=w.h.toLowerCase().replace(/[\s-]/g,'');
  if(got===want){
    $('#spellTip').textContent='✓ 对了 · '+w.h; $('#spellTip').className='spelltip ok';
    setTimeout(function(){ answer(4,'spell'); },520);
  }else{
    $('#spellTip').textContent='✗ 正确拼写：'+w.h; $('#spellTip').className='spelltip bad';
    speak(w.h, w.lang==='ja'?'ja-JP':'en-US');
    setTimeout(function(){ answer(1,'spell'); },1400);
  }
}
/* 听音选义：词藏起来，自动播一次发音，选释义 */
function renderListen(w){
  $('#fBook').textContent=(w.em?w.em+' ':'')+bookTitle(w.bk)+' · '+(isNewWord(w)?'新词':'复习');
  $('#fWord').textContent='♪ 听发音';
  $('#fPhon').textContent='';
  $('#fHint').textContent='听发音，选出对应词义（听不清点 🔊）';
  var opts=shuffle(distractors(w,3).concat([w.m]));
  var h='';
  opts.forEach(function(t,i){
    h+='<button class="opt" data-t="'+esc(t)+'"><span class="kbd">'+'ABCD'[i]+'</span><span>'+esc(t)+'</span></button>';
  });
  $('#optBox').innerHTML=h;
  $$('#optBox .opt').forEach(function(el){
    el.addEventListener('click', function(){ answerChoice(el, w, opts); });
  });
  setTimeout(function(){ speak(w.h, w.lang==='ja'?'ja-JP':'en-US'); },220);
}
/* 自动朗读：按卡片身份去重，同一张卡只自动读一次 */
var autoSpokenKey=null;
function maybeAutoSpeak(w,m){
  if(S.set&&S.set.autoListen===false) return;
  if(m==='spell'||m==='listen') return;
  var key=LMODE+'|'+w.id;
  if(autoSpokenKey===key) return;
  autoSpokenKey=key;
  setTimeout(function(){ if(Q[QI]===w.id) speak(w.h, w.lang==='ja'?'ja-JP':'en-US'); },160);
}
function bookTitle(id){ for(var i=0;i<BOOKS.length;i++) if(BOOKS[i].id===id) return BOOKS[i].title; return id; }
function answer(q,mode){
  var id=Q[QI]; if(!id) return;
  gradeWord(id,q,mode);
  if(q===1 && Q.length-QI<25) Q.push(id);
  QI++; QDONE++; LTICK++;
  LBATCH.total++; if(q>=4) LBATCH.pass++; LBATCH.n++;
  checkTasks(); refreshHome();
  if(QI>=Q.length){
    inSession=false;
    save(); anonSay('close',true);
    var rate=LBATCH.total?Math.round(LBATCH.pass*100/LBATCH.total):0;
    openM('<h3>这一轮结束啦 🎉</h3><div class="muted">完成 '+QDONE+' 个词 · 通过率 '+rate+'% · 拿到 '+todayStat().xp+' XP。</div>'+
      '<div style="margin-top:14px;display:flex;gap:8px"><button class="btn pri block" onclick="closeM();startLearn()">再来一轮</button>'+
      '<button class="btn block" onclick="closeM();go(\'ward\')">去应援</button></div>');
    $('#fWord').textContent='本轮完成'; $('#fPhon').textContent='点按钮继续';
    return;
  }
  renderLearn();
}
$('#btnFlip').addEventListener('click', flipCard);
$('#flip').addEventListener('click', function(){ if(!$('#flip').classList.contains('on')) flipCard(); });
$('#btnRecallY').addEventListener('click', function(){ flipCard(); });
$('#btnRecallN').addEventListener('click', function(){ flipCard(); });
$('#spellInput').addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); var w=curWord(); if(w) checkSpell(w); } });
$('#btnSay').addEventListener('click', function(e){ e.stopPropagation(); var w=curWord(); if(w) speak(w.h,w.lang==='ja'?'ja-JP':'en-US'); });
$('#btnSay2').addEventListener('click', function(){ var w=curWord(); if(w) speak(w.h,w.lang==='ja'?'ja-JP':'en-US'); });
$('#btnSlow').addEventListener('click', function(){ var w=curWord(); if(w){ try{ speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(w.h); u.lang=w.lang==='ja'?'ja-JP':'en-US'; u.rate=.6; speechSynthesis.speak(u);}catch(e){} } });
$$('#scoreBtns .sbtn').forEach(function(b){ b.addEventListener('click', function(){ answer(parseInt(b.dataset.q,10),'card'); }); });
$('#btnMix').addEventListener('click', function(){
  WRONGMODE=false;
  var order=['auto','rev','new'], label={auto:'自动',rev:'纯复习',new:'纯新词'};
  var i=order.indexOf(S.mix||'auto');
  S.mix=order[(i+1)%3]; save();
  this.textContent='⚖ 配比：'+label[S.mix];
  buildQueue(true); renderLearn();
  toast('配比：'+label[S.mix]+' · 队列 '+Q.length);
});
$('#btnAddNew').addEventListener('click', function(){
  var list=bookWords(S.book), add=[], i;
  for(i=0;i<list.length&&add.length<10;i++) if(!S.prog[list[i].id]) add.push(list[i].id);
  if(!add.length){                    // 没有新词了就复习最旧的
    var old=list.filter(function(w){ return S.prog[w.id]; })
      .sort(function(a,b){ return (S.prog[a.id].d||0)-(S.prog[b.id].d||0); }).slice(0,10);
    if(!old.length){ toast('这本词书已经全部学过啦'); return; }
    add=old.map(function(w){ return w.id; });
  }
  Q=Q.concat(shuffle(add)); QTOTAL+=add.length; renderLearn(); toast('＋'+add.length+' 个词');
});
$('#btnShuffle').addEventListener('click', function(){ var r=Q.slice(QI); shuffle(r); Q=Q.slice(0,QI).concat(r); renderLearn(); });
$('#btnWrongBook').addEventListener('click', function(){
  var stats={}, id;
  for(id in S.errs){ var m=S.errs[id].m; stats[m]=(stats[m]||0)+1; }
  var types=[['','全部'],['spell','拼写错'],['choice','释义错'],['listen','听音错'],['card','回忆不起']];
  var items=types.map(function(t){ return t[1]+(t[0]?' ('+(stats[t[0]]||0)+')':''); });
  openM('<h3>📕 错词本 · 按题型练</h3><div class="muted">答错的词按题型记在这里，短板在哪就专练哪。</div>'+
    items.map(function(t,i){ return '<div class="item"><div class="tx"><div class="n">'+esc(t)+'</div></div>'+
      '<div class="r"><button class="btn sm'+(i===0?' pri':'')+'" onclick="enterWrong(\''+types[i][0]+'\')">练</button></div></div>'; }).join('')+
    '<div style="margin-top:12px"><button class="btn block" onclick="closeM()">取消</button></div>');
});
function enterWrong(t){
  WRONGMODE=true; WRONGTYPE=t; closeM();
  buildQueue(false); renderLearn();
  if(!Q.length){ toast('这个分类下没有错词'); WRONGMODE=false; buildQueue(true); renderLearn(); return; }
  toast('错词本 · '+(t?({spell:'拼写错',choice:'释义错',listen:'听音错',card:'回忆不起'})[t]:'全部')+' '+Q.length+' 个');
}
$('#btnEndLearn').addEventListener('click', function(){ Q=[];QI=0;QDONE=0;QTOTAL=0; WRONGMODE=false; showPlan(); });
$('#btnStartPlan').addEventListener('click', startSession);

/* ---- 小游戏：打字修行 ---- */
var G={on:false,t:60,score:0,combo:0,right:0,wrong:0,timer:null,cur:null};
function renderGameHome(){ $('#gBest').textContent=S.game.best||0; $('#gPlay').textContent=S.game.plays||0;
  $('#gToday').textContent=(S.game.lastWin===todayKey()?'已拿 +8⭐':'未打'); }
function gameStart(){
  var list=bookWords(S.book); if(list.length<5){ toast('词太少'); return; }
  G={on:true,t:60,score:0,combo:0,right:0,wrong:0,timer:null,cur:null,pool:list};
  $('#gamePlay').style.display=''; $('#gScore').textContent='0'; $('#gCombo').textContent='连击 0';
  $('#gTime').textContent='60'; $('#gInput').value=''; $('#gInput').focus();
  gameNext();
  clearInterval(G.timer); G.timer=setInterval(function(){
    G.t--; $('#gTime').textContent=Math.max(0,G.t); if(G.t<=0) gameEnd();
  },1000);
}
function gameNext(){
  var w=pick(G.pool); G.cur=w;
  $('#gWord').textContent=w.h; $('#gMeaning').textContent=w.m||''; $('#gInput').value='';
}
function gameSubmit(){
  if(!G.on||!G.cur) return;
  var v=$('#gInput').value.trim().toLowerCase();
  if(!v) return;
  if(v===G.cur.h.toLowerCase()){
    G.combo++; G.right++; G.score+=10+Math.min(20,G.combo*2);
    if(G.combo%5===0) anonSay('game');
    speak(G.cur.h, G.cur.lang==='ja'?'ja-JP':'en-US');
  }else{ G.combo=0; G.wrong++; }
  $('#gScore').textContent=G.score; $('#gCombo').textContent='连击 '+G.combo;
  gameNext();
}
function gameEnd(){
  G.on=false; clearInterval(G.timer);
  $('#gamePlay').style.display='none';
  S.game.plays=(S.game.plays||0)+1;
  if(G.score>(S.game.best||0)) S.game.best=G.score;
  var first=(S.game.lastWin!==todayKey());
  if(first){ S.game.lastWin=todayKey(); addGems(8,'小游戏首胜'); }
  var gb=Math.floor(G.right/10); if(gb>0){ addGems(gb,'小游戏'); }
  S.done=(S.done||0)+G.right;
  save(); renderGameHome(); checkTasks(); refreshHome();
  anonSay(G.wrong===0?'perfect':'g5', true);
  openM('<h3>'+(G.wrong===0?'🏆 Perfect！':'⏰ 时间到')+'</h3>'+
    '<div style="font-size:32px;font-weight:800;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent">'+G.score+' 分</div>'+
    '<div class="muted" style="margin-top:5px">答对 '+G.right+' · 答错 '+G.wrong+(first?' · 首胜 +8⭐':'')+'</div>'+
    '<div style="margin-top:14px;display:flex;gap:8px"><button class="btn pri block" onclick="closeM();gameStart()">再来</button>'+
    '<button class="btn block" onclick="closeM()">收工</button></div>');
}
$('#btnGameStart').addEventListener('click', gameStart);
$('#gInput').addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); gameSubmit(); } });

/* ---- 快捷键：回忆卡 1-4 评分（翻面后）；四选一/听音 1-4 选 ABCD；空格翻面 ---- */
document.addEventListener('keydown', function(e){
  if(e.key==='Escape'){ closeM(); return; }
  var tag=(e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea') return;
  if(!$('#p-learn').classList.contains('on')) return;
  var w=curWord(); if(!w) return;
  var m=pickMode(w);
  if(e.key===' '||e.code==='Space'){ e.preventDefault(); flipCard(); return; }
  if(m==='card' && REVEALED){
    if(e.key==='1') answer(1,'card'); if(e.key==='2') answer(3,'card');
    if(e.key==='3') answer(4,'card'); if(e.key==='4') answer(5,'card');
  }else if(m==='card' && !REVEALED){
    if('1234'.indexOf(e.key)>=0) flipCard();
  }else if(m==='choice'||m==='listen'){
    var idx='1234'.indexOf(e.key);
    if(idx>=0){ var opts=$$('#optBox .opt'); if(opts[idx]) opts[idx].click(); }
  }
});
/* ================= Live2D 舞台（爱音 037/default） =================
   运行时（pixi + live2d + cubism2）与模型全部内嵌；
   模型文件在页面里现拼成 blob，再拦截 XHR/fetch 把「带扩展名的假路径」
   映射到 blob，保证 SDK 的类型判断不出错。 ========================= */
var L2 = { state: 0, app: null, model: null, map: {}, hooked: false, texMap: null, key: '', want: '', fellBack: '' };
var L2PATH = '/L2D/037/default/';
function equippedKey() {   // 当前穿上的服饰 key（有内嵌模型才返回）
  var k = (S.equip && S.equip[37]) || '';
  if (k && k !== 'default' && B.l2d.costumes && B.l2d.costumes[k]) return k;
  return '';
}
function b64url(b64, mime) {
  var s = b64.indexOf(',') >= 0 ? b64.split(',')[1] : b64;
  var bin = atob(s), arr = new Uint8Array(bin.length), i;
  for (i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([arr], { type: mime }));
}
function l2dHas() { return !!(B.l2d && B.l2d.rt && B.l2d.rt['pixi.min.js'] && B.l2d.model && B.l2d.model.moc); }
function l2dInject() {
  if (window.PIXI && PIXI.live2d && PIXI.live2d.Live2DModel) { l2dPatchResolve(); return true; }
  var ord = ['pixi.min.js', 'live2d.min.js', 'cubism2.js'], i;
  for (i = 0; i < ord.length; i++) {
    var src = B.l2d.rt[ord[i]];
    if (!src) return false;
    try {
      var s = document.createElement('script');   // 标准 script 注入，UMD 行为与 viewer.html 一致
      s.textContent = src; s.async = false;
      (document.head || document.documentElement).appendChild(s);
    } catch (e) { return false; }
  }
  l2dPatchResolve();
  return !!(window.PIXI && PIXI.live2d && PIXI.live2d.Live2DModel);
}
/* SDK 打包的 url.resolve 对 blob:/data: 这类 scheme 会把「://」吃成一个「//」，
   贴图 URL 直接损坏 —— 绝对 URL 一律原样返回。 */
function l2dPatchResolve() {
  try {
    if (!window.PIXI || !PIXI.utils || !PIXI.utils.url || !PIXI.utils.url.resolve || PIXI.utils.url.__fixed) return;
    var _resolve = PIXI.utils.url.resolve;
    PIXI.utils.url.resolve = function (base, path) {
      if (typeof path === 'string' && /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) return path;  // blob:/data:/http: 绝对 URL 原样
      if (typeof base === 'string' && /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(base)) return path;
      return _resolve.call(this, base, path);
    };
    PIXI.utils.url.__fixed = true;
  } catch (e) {}
}
function l2dBuild(key) {
  var M = B.l2d.model, g, n, i, PREFIX = L2PATH, MOC = 'anon_other-25.moc', PHYS = 'anon_other-25.physics.json';
  var C = (key && key !== 'default' && B.l2d.costumes) ? B.l2d.costumes[key] : null;
  L2.map = {}; L2.data = {};
  function bytesOf(b64) {
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }
  function bytesText(arr) {   // x-user-defined 兼容：每字符 = 一字节
    var s = '', CH = 8192;
    for (i = 0; i < arr.length; i += CH) s += String.fromCharCode.apply(null, arr.subarray(i, Math.min(arr.length, i + CH)));
    return s;
  }
  var tex = [];
  if (C) {
    PREFIX = '/L2D/037/' + key + '/'; MOC = C.n + '.moc'; PHYS = C.n + '.physics.json';
    for (i = 0; i < C.tex.length; i++) {
      var t = C.tex[i];
      if (t && t.charAt(0) === '@') {         // 共享贴图（同内容 hash 去重）：全局只建一次 blob
        var h = t.slice(1);
        if (!L2.texMap) L2.texMap = {};
        if (!L2.texMap[h]) L2.texMap[h] = b64url(B.l2d.texCommon[h], 'image/webp');
        tex.push(L2.texMap[h]);
      } else if (t) tex.push(b64url(t, 'image/webp'));
    }
    L2.data[PREFIX + MOC] = { bytes: bytesOf(C.moc), text: bytesText(bytesOf(C.moc)) };
    L2.data[PREFIX + PHYS] = { text: C.phys };
  } else {
    for (i = 0; i < M.tex.length; i++) tex.push(b64url(M.tex[i], 'image/webp'));
    var mocB = bytesOf(M.moc);
    L2.data[L2PATH + MOC] = { bytes: mocB, text: bytesText(mocB) };
    L2.data[L2PATH + PHYS] = { text: atob(M.phys) };
  }
  var motions = {};
  for (g in M.motions) {
    motions[g] = [{ file: L2PATH + g + '.mtn' }];
    var mb = bytesOf(M.motions[g]);
    L2.data[L2PATH + g + '.mtn'] = { bytes: mb, text: bytesText(mb) };
  }
  var exps = [];
  for (n in M.exps) {
    exps.push({ name: n, file: L2PATH + n + '.exp.json' });
    L2.data[L2PATH + n + '.exp.json'] = { text: atob(M.exps[n]) };
  }
  var mj = { name: '037', model: PREFIX + MOC, textures: tex,
    layout: { center_x: 0, center_y: 0, height: 2.0 },
    physics: PREFIX + PHYS, motions: motions, expressions: exps };
  L2.data[L2PATH + 'model.json'] = { text: JSON.stringify(mj) };
}
/* 伪 XHR：SDK 用同步 XHR + responseType，浏览器在文档上下文里直接拒绝；
   所以凡是 L2.data 里的路径，全部由内存直供，同步/异步都能吃。 */
function L2FakeXHR(url) {
  var e = L2.data[url], x = {
    readyState: 0, status: 0, statusText: '', responseType: '', response: null, responseText: '',
    onerror: null, _listeners: {},
    open: function (m, u, a) { this._async = (a !== false); },
    setRequestHeader: function () {}, overrideMimeType: function () {},
    getAllResponseHeaders: function () { return ''; },
    getResponseHeader: function () { return null; },
    abort: function () {},
    addEventListener: function (t, f) { (this._listeners[t] = this._listeners[t] || []).push(f); },
    removeEventListener: function () {},
    _fire: function () {
      var self = this;
      self.readyState = 4; self.status = 200; self.statusText = 'OK';
      self._fill();
      if (self.onreadystatechange) try { self.onreadystatechange(); } catch (er) {}
      var ls = self._listeners['readystatechange'] || [], i;
      for (i = 0; i < ls.length; i++) try { ls[i].call(self, { target: self }); } catch (er) {}
      ls = self._listeners['load'] || [];
      for (i = 0; i < ls.length; i++) try { ls[i].call(self, { target: self }); } catch (er) {}
      ls = self._listeners['loadend'] || [];
      for (i = 0; i < ls.length; i++) try { ls[i].call(self, { target: self }); } catch (er) {}
      if (self.onload) try { self.onload.call(self, { target: self }); } catch (er) {}
      if (self.onloadend) try { self.onloadend.call(self, { target: self }); } catch (er) {}
    },
    _fill: function () {
      if (!e) { this.status = 404; return; }
      if (this.responseType === 'arraybuffer') {
        // 必须是纯 ArrayBuffer：SDK 会 new Int8Array(data,0,3)，TypedArray 会走错重载导致爆栈
        this.response = e.bytes.buffer.slice(e.bytes.byteOffset, e.bytes.byteOffset + e.bytes.byteLength);
      }
      else if (this.responseType === 'blob') { this.response = new Blob([e.bytes || e.text]); }
      else {
        this.responseText = e.text;                       // SDK 从 responseText 解析 json
        if (this.responseType === 'json') { try { this.response = JSON.parse(e.text); } catch (er) { this.response = null; } }
        else this.response = e.text;
      }
    },
    send: function () {
      var self = this;
      if (this._async === false) { this._fire(); return; }
      setTimeout(function () { self._fire(); }, 0);
    }
  };
  ['onload', 'onloadend', 'onreadystatechange', 'onprogress', 'onabort'].forEach(function (k) {
    Object.defineProperty(x, k, { set: function (f) { this['_' + k] = f; }, get: function () { return this['_' + k]; } });
  });
  return x;
}
function l2dHook() {
  if (L2.hooked) return; L2.hooked = true;
  var RealXHR = window.XMLHttpRequest;
  var PROP = ['readyState', 'status', 'statusText', 'response', 'responseText', 'responseType', 'responseURL', 'withCredentials'];
  window.XMLHttpRequest = function () {
    var real = new RealXHR(), fake = null, url = '';
    var px = {};
    PROP.forEach(function (k) {
      Object.defineProperty(px, k, {
        get: function () { return fake ? fake[k] : real[k]; },
        set: function (v) { if (fake) fake[k] = v; else real[k] = v; },
        configurable: true
      });
    });
    ['onload', 'onloadend', 'onreadystatechange', 'onerror', 'onprogress', 'onabort'].forEach(function (k) {
      Object.defineProperty(px, k, {
        set: function (f) { if (fake) fake[k] = f; else real[k] = f; },
        get: function () { return fake ? fake[k] : real[k]; },
        configurable: true
      });
    });
    ['addEventListener', 'removeEventListener'].forEach(function (k) {
      px[k] = function (t, f, o) { if (fake) return fake[k](t, f, o); return real[k](t, f, o); };
    });
    px.open = function (m, u, a) {
      url = (typeof u === 'string') ? u.replace(/^https?:\/\/[^/]+/, '') : '';
      if (L2.data[url]) { fake = L2FakeXHR(url); fake.open(m, url, a); }
      else { real.open(m, u, a === undefined ? true : a); }
    };
    px.setRequestHeader = function (k, v) { if (!fake) real.setRequestHeader(k, v); };
    px.overrideMimeType = function (m) { if (!fake) real.overrideMimeType(m); };
    px.getAllResponseHeaders = function () { return fake ? fake.getAllResponseHeaders() : real.getAllResponseHeaders(); };
    px.getResponseHeader = function (k) { return fake ? fake.getResponseHeader(k) : real.getResponseHeader(k); };
    px.abort = function () { if (fake) fake.abort(); else real.abort(); };
    px.send = function (b) { if (fake) fake.send(b); else real.send(b); };
    return px;
  };
  if (window.fetch) {
    var _f = window.fetch;
    window.fetch = function (u, o) {
      var p = (typeof u === 'string') ? u.replace(/^https?:\/\/[^/]+/, '') : '';
      if (L2.data[p]) return _f.call(window, L2.map[p] || URL.createObjectURL(new Blob([L2.data[p].bytes || L2.data[p].text])));
      return _f.call(window, u, o);
    };
  }
}
function l2dFail(msg) {
  L2.state = -1;
  $('#l2dStage').innerHTML = '<div class="fallback">Live2D 暂时加载不了（' + String(msg || '') + '）<br>舞台是 Live2D 专属，稍后再来～</div>';
  $('#l2dStage').classList.add('on');
  $('#l2dState').textContent = 'Live2D 不可用';
}
function l2dStart() {
  if (L2.state === 1 || L2.state === 2) return;
  if (!l2dHas()) { l2dFail('素材缺失'); return; }
  L2.state = 1; $('#l2dState').textContent = '正在唤醒爱音…';
  if (!l2dInject()) { l2dFail('运行时注入失败'); return; }
  l2dHook();
  var box = $('#l2dStage'); box.innerHTML = ''; box.classList.add('on');
  var SW = box.clientWidth || 320, SH = box.clientHeight || 330;   // 跟舞台盒子同尺寸，人物占满
  try {
    L2.app = new PIXI.Application({ width: SW, height: SH, backgroundAlpha: 0, antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 1.5), autoDensity: true });
  } catch (e) { l2dFail('渲染器创建失败'); return; }
  box.appendChild(L2.app.view);
  L2.app.view.style.width = '100%'; L2.app.view.style.height = '100%';
  function onLoaded(m) {
    var wk = equippedKey();
    if (wk !== L2.want && !(L2.want === '' && wk === L2.fellBack)) { loadWith(wk); return; }  // 加载期间又换了装 → 换成新的重来
    L2.model = m; m.interactive = false;
    try { if (m.internalModel && m.internalModel.motionManager && m.internalModel.motionManager.groups)
      m.internalModel.motionManager.groups.idle = 'idle'; } catch (e) {}
    L2.app.stage.addChild(m);
    l2dLayout();
    L2.state = 2;
    var cn = L2.key ? equipCosInfo(37) : null;
    $('#l2dState').textContent = (cn && cn.n) ? '当前：爱音 · ' + cn.n + '（点她）' : '当前：Live2D 爱音（点她）';
    requestAnimationFrame(function () { requestAnimationFrame(function () { try { m.motion('idle'); } catch (e) {} }); });
  }
  function loadWith(k) {
    L2.key = k; L2.want = k; if (k) L2.fellBack = '';
    try { l2dBuild(k); } catch (e) { l2dFail('资源拼装失败'); return; }
    PIXI.live2d.Live2DModel.from(L2PATH + 'model.json', { autoInteract: false, autoUpdate: true })
      .then(onLoaded)['catch'](function (e) {
        if (k) { L2.fellBack = k; loadWith(''); return; }          // 服饰模型加载失败 → 回退 default 模型
        l2dFail((e && e.message) || e);
      });
  }
  loadWith(equippedKey());
}
/* 换装后热重载舞台：穿上哪套, 舞台就换成哪套的真模型 */
function stageRefresh() {
  var k = equippedKey();
  if (k === L2.key) return;
  var st = $('#l2dStage');
  var vis = !!(st && st.offsetParent);   // 舞台可见才马上重载；不可见就停下, 回舞台时 go() 会自动重启
  if (L2.state === 2 || L2.state === -1) l2dStop();
  if (vis && L2.state === 0) l2dStart();
}
function l2dLayout() {
  var m = L2.model; if (!m || !L2.app) return;
  var iw = (m.internalModel && m.internalModel.width) || 1;
  var ih = (m.internalModel && m.internalModel.height) || 1;
  if (iw <= 1 || ih <= 1) return;
  var SW = (L2.app.screen && L2.app.screen.width) || 320;
  var SH = (L2.app.screen && L2.app.screen.height) || 330;
  var z = Math.max(SW / iw, SH / ih) * 1.03;   // 覆盖式：人物占满舞台（略微放大，去除画布留白）
  m.scale.set(z);
  m.x = (SW - iw * z) / 2;                       // 水平居中（溢出部分自然裁切）
  m.y = (SH - ih * z) / 2;                       // 垂直居中
}
if (window.addEventListener) window.addEventListener('resize', function(){ if (L2.state === 2 && L2.app && L2.model) l2dLayout(); });
var L2MOT = { new: 'smile', rev: 'idle', miss: 'sad', goal: 'kandou', streak: 'smile', pat: 'shame',
  level: 'smile', g5: 'surprise', g4: 'smile', g3: 'idle', start: 'idle', close: 'bye',
  prog: 'idle', game: 'smile', perfect: 'kandou', dict: 'think' };
var L2EXP = { new: 'smile01', rev: 'idle01', miss: 'sad01', goal: 'kandou01', streak: 'smile02',
  pat: 'shame01', level: 'smile03', g5: 'surprised01', g4: 'smile01', g3: 'default',
  start: 'default', close: 'bye01', prog: 'idle01', game: 'smile04', perfect: 'kandou02', dict: 'thinking01' };
function l2dPlay(kind) {
  if (L2.state !== 2 || !L2.model) return false;
  var g = L2MOT[kind] || 'idle';
  try { if (L2.model.motion(g)) { l2dExp(L2EXP[kind]); return true; } } catch (e) {}
  try { L2.model.motion('idle'); } catch (e) {}
  return false;
}
function l2dExp(n) {
  if (L2.state !== 2 || !L2.model || !n) return;
  try { L2.model.expression(n); } catch (e) {}
}
function l2dStop() {
  if (L2.state === 2) {
    try { if (L2.app) { L2.app.destroy(true, { children: true, texture: true, baseTexture: true }); } } catch (e) {}
    L2.app = null; L2.model = null;
    $('#l2dStage').classList.remove('on'); $('#l2dStage').innerHTML = '';
    L2.state = 0;
    $('#l2dState').textContent = '已停止';
  }
}
$('#btnL2d').addEventListener('click', function () { if (L2.state === 1) { toast('正在唤醒…'); return; } if (L2.state === 2) { l2dStop(); } l2dStart(); });
$('#sdBox').addEventListener('click', function () { if (L2.state === 2) l2dPlay('pat'); anonSay('pat', true); });

/* ---- 应援页刷新 ---- */
function refreshWard(){
  var w=function(id,v){ var el=$('#'+id); if(el) el.textContent=v; };
  w('wGem',S.gems); w('wCos',cosCount()); w('wFreeze',S.freeze||0); w('wLv','Lv.'+S.lv);
  w('wStreak',S.streak||0); w('wComboBest',S.comboBest||0); w('wStars',(S.stars&&S.stars[S.book])||0);
  w('wDone',S.done||0);
  var box=$('#wEquip');
  if(box){
    var eq=equipCosInfo(AINO), es=eq?(art('p'+eq.cid+'_'+eq.k)||art('k'+eq.cid+'_'+eq.k)):'';
    box.innerHTML = eq
      ? '<div class="tiny" style="margin-bottom:5px;opacity:.9">👗 爱音当前穿搭</div><div style="display:flex;align-items:center;gap:9px"><div style="width:56px;height:72px;border-radius:9px;overflow:hidden;background:rgba(255,255,255,.18);flex:none">'+(es?'<img src="'+es+'" style="width:100%;height:100%;object-fit:contain">':'')+'</div><div><div style="font-weight:800;font-size:14px">'+esc(eq.n)+'</div><div class="tiny" style="opacity:.9">★'+eq.r+' · 穿搭中</div></div></div>'
      : '<div class="tiny" style="opacity:.9">👗 还没有穿搭 —— 去「应援商店 · 爱音衣橱」挑一件给爱音穿上吧</div>';
  }
}

/* ---- 爱音衣橱（星石直购，不抽卡） ---- */
function costumePool(cid){ return B.costumes.filter(function(c){ return c.r>=3 && (cid==null||c.cid===cid); }); }
function cosPrice(r){ return r===5?500:r===4?200:60; }
function cosCount(){ var n=0; for(var k in S.cos) n+=S.cos[k].length; return n; }
function hasCostume(cid,key){ return (S.cos[cid]||[]).indexOf(key)>=0; }
function addCostume(cid,key){ if(!S.cos[cid]) S.cos[cid]=[]; if(hasCostume(cid,key)) return false; S.cos[cid].push(key); return true; }
function equipCos(cid,key){ S.equip=S.equip||{}; S.equip[cid]=key; save(); refreshWard(); stageRefresh(); var q=qSrc('normal'); if(q) setQImg(q); }
function wearCos(cid,key){ equipCos(cid,key); openM(wardrobeModal()); }
function equipCosInfo(cid){
  var key=(S.equip&&S.equip[cid])||'';
  if(!key) return null;
  for(var i=0;i<B.costumes.length;i++) if(B.costumes[i].cid===cid&&B.costumes[i].k===key) return B.costumes[i];
  return null;
}
function wardrobeModal(){
  var list=costumePool(AINO).slice().sort(function(a,b){ return b.r-a.r; });
  var cur=equipCosInfo(AINO);
  var h='<h3>👗 爱音衣橱 · '+castOf(AINO).n+'</h3>'+
    '<div class="tiny" style="margin-bottom:10px">星石直购，不碰运气。★5 500⭐ / ★4 200⭐ / ★3 60⭐（答题、任务、里程碑都能攒）。买下的衣服点「穿上」，爱音的当前穿搭会展示在应援页。</div>'+
    '<div class="cosgrid">';
  list.forEach(function(c){
    var src=art('p'+c.cid+'_'+c.k)||art('k'+c.cid+'_'+c.k), own=hasCostume(c.cid,c.k), p=cosPrice(c.r), on=cur&&cur.k===c.k;
    h+='<div class="coscard item'+(on?' on':'')+'">'+
      '<div class="cosimg">'+(src?'<img src="'+src+'" alt="'+esc(c.n)+'">':'')+(on?'<span class="cosbadge">穿搭中</span>':'')+'</div>'+
      '<div class="cosname">'+esc(c.n)+'</div>'+
      '<div class="cosmeta">★'+c.r+' · '+(own?'已拥有':p+'⭐')+'</div>'+
      '<div class="cosbtn">'+(own
        ? '<button class="btn sm '+(on?'':'pri')+'" onclick="wearCos('+c.cid+',\''+c.k+'\')">'+(on?'已穿上':'穿上')+'</button>'
        : '<button class="btn sm pri" onclick="buyCos('+c.cid+',\''+c.k+'\','+p+')">购入</button>')+'</div></div>';
  });
  h+='</div>'+
     '<div class="tiny" style="margin-top:10px">已拥有 '+(S.cos[AINO]||[]).length+' / '+list.length+' 套'+(cur?' · 当前穿搭：'+esc(cur.n):'')+'</div>'+
     '<div style="margin-top:12px"><button class="btn block" onclick="closeM()">关闭</button></div>';
  return h;
}
function buyCos(cid,key,price){
  if(hasCostume(cid,key)){ toast('已经拥有了'); return; }
  if(S.gems<price){ toast('星石不够（需要 '+price+'⭐）'); return; }
  S.gems-=price; addCostume(cid,key); equipCos(cid,key); refreshTop(); refreshWard();
  toast('👗 购入并穿上 '+key); anonSay('goal',true);
  openM(wardrobeModal());
}
$('#btnWardCos').addEventListener('click', function(){ openM(wardrobeModal()); });

function itemModal(){
  var h='<h3>🎁 道具</h3>'+
   '<div class="item"><div><div class="w">❄ 冻结卡 · '+S.freeze+'</div><div class="c">断更时保住连续记录（上限 8）</div></div>'+
   '<div class="r"><button class="btn sm" onclick="buyFreeze(180)">180⭐</button></div></div>'+
   '<div class="item"><div><div class="w">🍵 楽奈の抹茶</div><div class="c">10 分钟内 XP ×1.5 · 20⭐</div></div>'+
   '<div class="r"><button class="btn sm" onclick="buyItem(\'matcha\',20)">买</button></div></div>'+
   '<div class="item"><div><div class="w">🍡 はぐみのたい焼き</div><div class="c">一次连击保护 · 60⭐</div></div>'+
   '<div class="r"><button class="btn sm" onclick="buyItem(\'tai\',60)">买</button></div></div>'+
   '<div class="item"><div><div class="w">🫖 そよの紅茶</div><div class="c">今日复习量 −20% · 50⭐</div></div>'+
   '<div class="r"><button class="btn sm" onclick="buyItem(\'tea\',50)">买</button></div></div>'+
   '<div class="item"><div><div class="w">🎼 春日影の楽譜</div><div class="c">清空最难标记的复习词 · 200⭐（周限 1）</div></div>'+
   '<div class="r"><button class="btn sm" onclick="buyItem(\'score\',200)">买</button></div></div>'+
   '<div class="tiny" style="margin-top:8px">冻结卡还能从：每满 7 天送 1 / 成就奖励 / 断更认栽 +1 获得。</div>'+
   '<div style="margin-top:12px"><button class="btn block" onclick="closeM()">关闭</button></div>';
  return h;
}
$('#btnWardItem').addEventListener('click', function(){ openM(itemModal()); });
function buyFreeze(p){ if(S.gems<p){ toast('星石不够'); return; } if(S.freeze>=8){ toast('已经满 8 张'); return; }
  S.gems-=p; S.freeze++; save(); refreshTop(); refreshWard(); toast('❄ +1'); openM(itemModal()); }
function buyItem(k,p){ if(S.gems<p){ toast('星石不够'); return; } S.gems-=p; save(); refreshTop(); refreshWard();
  var msg={matcha:'🍵 10 分钟内 XP ×1.5',tai:'🍡 下一局连击保护已就绪',tea:'🫖 今日复习量 −20%',score:'🎼 最难标记已清空'}[k];
  toast(msg); closeM(); anonSay('goal',true); }

/* ---- 成就 ---- */
function achCount(){ var n=0, k; for(k in S.ach) if(S.ach[k]) n++; return n; }
function achModal(){
  var h='<h3>🏆 成就 · '+achCount()+' / '+ACHS.length+'</h3>'+
    '<div class="tiny" style="margin-bottom:10px">完成成就拿星石和经验，奖励自动入账。</div>';
  ACHS.forEach(function(a){
    var done=!!(S.ach&&S.ach[a.id]);
    h+='<div class="item"><div style="width:26px;height:26px;border-radius:8px;background:'+(done?'var(--grad)':'rgba(255,255,255,.12)')+
      ';display:flex;align-items:center;justify-content:center;font-size:14px">'+(done?'✓':'?')+'</div>'+
      '<div><div class="w">'+esc(a.n)+'</div><div class="c">'+esc(a.d)+'</div></div>'+
      '<div class="r"><span class="tag" style="'+(done?'background:var(--grad);color:#fff':'')+'">'+(done?'已达成':'+150XP +50⭐')+'</span></div></div>';
  });
  h+='<div style="margin-top:12px"><button class="btn block" onclick="closeM()">关闭</button></div>';
  return h;
}
$('#btnWardAch').addEventListener('click', function(){ openM(achModal()); });

/* ---- 设置 ---- */
function renderSet(){
  var h='';
  BOOKS.forEach(function(b){
    h+='<button class="book '+(S.book===b.id?'on':'')+'" data-b="'+b.id+'">'+esc(b.title)+'</button>';
  });
  $('#setBooks').innerHTML=h;
  $$('#setBooks .book').forEach(function(el){
    el.addEventListener('click', function(){ S.book=el.dataset.b; save(); renderSet(); Q=[]; buildQueue(true); renderLearn(); refreshHome(); toast('词书：'+el.textContent); });
  });
  $('#setGoal').value=goalOf(S.book);
  $('#setNewMax').value=S.newMax||20;
  $('#dataInfo').textContent='词库 '+WORDS.length+' 词 · 服饰 '+B.costumes.length+' 套 · 语音 '+Object.keys(B.voices||{}).length+
    ' 段 · 爱音红包 '+(S.bonus||0)+' 次 · 存档在云端';
}
$('#setGoal').addEventListener('change', function(){ setGoalOf(S.book, this.value); save(); refreshHome(); toast('「'+bookTitle(S.book)+'」每日目标 '+goalOf(S.book)+' 词'); });
$('#setNewMax').addEventListener('change', function(){ S.newMax=Math.max(5,Math.min(100000,parseInt(this.value,10)||20)); save(); buildQueue(true); toast('每日新词上限 '+S.newMax); });
$('#btnTheme').addEventListener('click', function(){
  S.theme=(S.theme==='dark')?'light':'dark'; save(); applyTheme();
});
function applyTheme(){
  document.documentElement.setAttribute('data-theme', S.theme||'light');
  $('#btnTheme').textContent=(S.theme==='dark')?'☀️ 主题':'🌙 主题';
}
$('#btnExport').addEventListener('click', function(){
  var blob=new Blob([JSON.stringify(S)],{type:'application/json'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='爱音单词-存档-'+todayKey()+'.json'; a.click(); toast('存档已导出');
});
$('#btnImport').addEventListener('click', function(){
  var old=document.getElementById('backupImport'); if(old) old.remove();
  var inp=document.createElement('input'); inp.type='file'; inp.accept='.json'; inp.id='backupImport'; inp.style.display='none'; document.body.appendChild(inp);
  inp.onchange=function(){
    var f=inp.files[0]; if(!f) return;
    var r=new FileReader();
    r.onload=function(){ try{ var o=JSON.parse(r.result); if(!o.prog) throw 0;
      for(var k in o) S[k]=o[k]; save(); boot(); toast('存档已导入'); }catch(e){ toast('读不出来'); } };
    r.readAsText(f); inp.remove();
  };
  inp.click();
});
$('#btnReset').addEventListener('click', function(){
  openM('<h3>清空全部进度？</h3><div class="muted">学习进度、收集、星石都会清掉。建议先导出。</div>'+
    '<div style="margin-top:14px;display:flex;gap:8px">'+
    '<button class="btn pri block" onclick="resetProgress()">确认清空</button>'+
    '<button class="btn block" onclick="closeM()">取消</button></div>');
});

/* ---- 启动 ---- */
function boot(){
  applyTheme();
  rollDay();
  refreshTop(); refreshHome(); renderBooks(); buildQueue(true); renderLearn(); renderGameHome(); refreshWard();
  $('#btnMix').textContent='⚖ 配比：'+({auto:'自动',rev:'纯复习',new:'纯新词'}[S.mix||'auto']);
  var sd=qSrc('normal'); if(sd) setQImg(sd);
  if(document.querySelector('#p-home') && document.querySelector('#p-home').classList.contains('on')) l2dStart();
  anonSay('start');
}
load(); boot();
setTimeout(function(){ if(window.speechSynthesis&&!voices.length) initV(); },1200);

// Delegate the app's generated button actions without inline JavaScript.
document.addEventListener('click', function(event) {
  var node = event.target.closest('[onclick]');
  if (!node) return;
  var action = node.getAttribute('onclick');
  if (action === 'resetProgress()') { window.__wordStore.save(null).then(function(){ location.reload(); }).catch(function(){}); return; }
  var allowed = {useFreeze, payFreeze, acceptBreak, closeM, speak, dictStudy, dictWordGo, startLearn, go, enterWrong, gameStart, wearCos, buyCos, buyFreeze, buyItem};
  for (var part of action.split(';')) {
    var match = /^\s*([A-Za-z]+)\((.*)\)\s*$/.exec(part);
    if (!match || !allowed[match[1]]) continue;
    var args = [], re = /\s*(?:'((?:\\.|[^'])*)'|(-?\d+))\s*(?:,|$)/g, item;
    while ((item = re.exec(match[2]))) args.push(item[1] !== undefined ? item[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\') : Number(item[2]));
    allowed[match[1]].apply(null, args);
  }
});
