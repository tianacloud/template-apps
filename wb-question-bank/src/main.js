import css from "./style.css?inline";
import body from "./body.html?raw";
const style=document.createElement("style"); style.textContent=css; document.head.appendChild(style);
document.getElementById("app").innerHTML=body;
const storage = (()=>{ try { const s=window.localStorage; s.getItem("__probe__"); return s; } catch { const data=new Map(); return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}; } })();



/* ============ 题库数据契约与加载器 ============ */
const SAMPLE_BANK = {"title": "钳工三级题库（精选示例·12题）", "questions": [{"q": "压力继电器应安装在(    )位置。", "options": [{"k": "A", "v": "压力有明显变化"}, {"k": "B", "v": "压力无明显变化"}, {"k": "C", "v": "回油路"}, {"k": "D", "v": "定量泵出口"}], "a": "A", "src": "题库一"}, {"q": "(    )是靠出口油压控制。", "options": [{"k": "A", "v": "调速阀"}, {"k": "B", "v": "溢流阀"}, {"k": "C", "v": "顺序阀"}, {"k": "D", "v": "减压阀"}], "a": "D", "src": "题库一"}, {"q": "(    )是使工作机构在任意位置上停留以及停工作时，防止在受力的情况下发生移动。", "options": [{"k": "A", "v": "顺序动作回路"}, {"k": "B", "v": "锁紧回路"}, {"k": "C", "v": "卸荷回路"}, {"k": "D", "v": "换向回路"}], "a": "B", "src": "题库一"}, {"q": "减压回路主要由(    )组成。", "options": [{"k": "A", "v": "溢流阀"}, {"k": "B", "v": "顺序阀"}, {"k": "C", "v": "减压阀"}, {"k": "D", "v": "换向阀"}], "a": "C", "src": "题库一"}, {"q": "液压传动是以具有一定压力能力的油液为工作介质，依靠(   )的变化来传递运动。", "options": [{"k": "A", "v": "可控制容积"}, {"k": "B", "v": "密封容积"}, {"k": "C", "v": "液体流量"}, {"k": "D", "v": "活塞面积"}], "a": "B", "src": "题库一"}, {"q": "不属于控制阀的是(    )。", "options": [{"k": "A", "v": "方向控制阀"}, {"k": "B", "v": "压力控制阀"}, {"k": "C", "v": "流量控制阀"}, {"k": "D", "v": "泄油控制阀"}], "a": "D", "src": "题库一"}, {"q": "电流对人体的伤害程度与(    )无关。", "options": [{"k": "A", "v": "通过人体电流的大小"}, {"k": "B", "v": "通过人体电流的时间"}, {"k": "C", "v": "触电电源的电位"}, {"k": "D", "v": "触电者身体健康状况"}], "a": "C", "src": "题库一"}, {"q": "下列选项中，不符合安全用电措施的是(    )。", "options": [{"k": "A", "v": "合理选择导线和熔丝"}, {"k": "B", "v": "使用手电钻不准戴绝缘手套"}, {"k": "C", "v": "电气设备安装要正确"}, {"k": "D", "v": "合理选择照明电压"}], "a": "B", "src": "题库一"}, {"q": "固态继电器的驱动电路可以包括隔离耦合电路、(    )和触发电路三部分。", "options": [{"k": "A", "v": "交流电路"}, {"k": "B", "v": "直流电路"}, {"k": "C", "v": "输入电路"}, {"k": "D", "v": "功能电路"}], "a": "D", "src": "题库一"}, {"q": "设备电气系统中热继电器的常见故障有(    )。", "options": [{"k": "A", "v": "动作延时变长"}, {"k": "B", "v": "机械部分生锈或歪斜"}, {"k": "C", "v": "热继电器动作太快"}, {"k": "D", "v": "动作延时缩短"}], "a": "C", "src": "题库一"}, {"q": "(   )是以工序为单位详细说明整个工艺过程的工艺文件。", "options": [{"k": "A", "v": "工步"}, {"k": "B", "v": "工位"}, {"k": "C", "v": "工艺卡"}, {"k": "D", "v": "走刀"}], "a": "C", "src": "题库一"}, {"q": "工序卡片是用来具体指导工人进行操作的一种(    )。", "options": [{"k": "A", "v": "工艺文件"}, {"k": "B", "v": "要求"}, {"k": "C", "v": "规定"}, {"k": "D", "v": "方法"}], "a": "A", "src": "题库一"}]};
const KEY='wtk_wrong_v1', QUEUE_KEY='wtk_exam_queue_v1', HIST_KEY='wtk_scores_v1';

/* 归一化：兼容「钳工标准格式」与「极简格式」，统一为内部题库对象 */
function normalizeBank(raw){
  let qs=[], title='自定义题库';
  if(Array.isArray(raw)){ qs=raw; }
  else if(raw && Array.isArray(raw.questions)){ qs=raw.questions; title = raw.title||raw.name||title; }
  else { throw new Error('JSON 顶层需为题目数组，或含 "questions" 字段的对象'); }
  if(!qs.length) throw new Error('题库为空，未找到任何题目');
  const out=[];
  qs.forEach(function(q,i){
    if(!q || typeof q!=='object') throw new Error('第'+(i+1)+'题格式不是对象');
    const qtext = (q.q!=null)?String(q.q):(q.question!=null?String(q.question):'');
    if(!qtext.trim()) throw new Error('第'+(i+1)+'题缺少题干(q)');
    let opts=[];
    if(Array.isArray(q.options)){
      q.options.forEach(function(o,j){
        if(typeof o==='string'){
          let k=String.fromCharCode(65+j), v=o;
          const mm=o.match(/^([A-Za-z0-9])[.、)]\s*(.*)$/);
          if(mm){ k=mm[1].toUpperCase(); v=mm[2]; }
          opts.push({k:k, v:v});
        } else if(o && typeof o==='object' && 'v' in o){
          let k=(o.k!=null)?String(o.k):String.fromCharCode(65+j);
          opts.push({k:String(k).toUpperCase(), v:String(o.v)});
        } else { throw new Error('第'+(i+1)+'题第'+(j+1)+'个选项无法识别'); }
      });
    }
    if(opts.length<2) throw new Error('第'+(i+1)+'题选项不足 2 个');
    let a = q.a!=null ? String(q.a) : (q.answer!=null ? String(q.answer) : '');
    let ak=null;
    if(/^[A-Za-z]$/.test(a)) ak=a.toUpperCase();
    else if(/^\d+$/.test(a)){ const idx=parseInt(a,10); if(idx>=0&&idx<opts.length) ak=opts[idx].k; }
    else {
      const am=a.replace(/^[A-Za-z][.、)]\s*/,'');   // 去掉可能的 "A." 前缀，支持中文判断题
      const hit=opts.find(function(o){return o.v===a || o.v===am;});
      if(hit) ak=hit.k;
    }
    if(!ak || !opts.some(function(o){return o.k===ak;})) throw new Error('第'+(i+1)+'题答案('+a+')不在选项范围内');
    const src = q.src!=null ? String(q.src) : (q.source!=null ? String(q.source) : '');
    out.push({q:qtext, options:opts, a:ak, src:src});
  });
  const count=out.length;
  const choice=out.filter(function(q){return q.options.length>=3;}).length;
  const judge=out.filter(function(q){return q.options.length===2;}).length;
  return {title:title, count:count, choice:choice, judge:judge, questions:out};
}

function applyBank(bank, reset=true){
  BANK=bank; TOTAL=bank.count;
  if(examSize>TOTAL) examSize=TOTAL;
  document.getElementById('s-total').textContent=bank.count;
  document.getElementById('s-choice').textContent=bank.choice;
  document.getElementById('hcount').textContent=bank.count;
  document.getElementById('srcName').textContent=bank.title||'自定义题库';
  document.title=bank.title||'万能题库练习器';
  if(reset){ try{ storage.removeItem(KEY); storage.removeItem(QUEUE_KEY); }catch(e){} }
  syncExamSel();
  document.getElementById('s-exam').textContent=examSize;
}
function syncExamSel(){
  const sel=document.getElementById('examSizeSel');
  let opts=[20,50,100].filter(function(v){return v<=TOTAL;});
  if(TOTAL>0 && opts.indexOf(TOTAL)<0) opts.push(TOTAL);
  if(!opts.length) opts.push(Math.max(TOTAL,1));
  sel.innerHTML=opts.map(function(v){return '<option value="'+v+'"'+(v===examSize?' selected':'')+'>'+v+' 题</option>';}).join('');
}
function openBankPanel(){ document.getElementById('bankCur').textContent=(BANK&&BANK.title)||'自定义题库'; document.getElementById('bankPanel').classList.remove('hidden'); }
function closeBankPanel(){ document.getElementById('bankPanel').classList.add('hidden'); }
function loadFromText(str){
  if(!str||!str.trim()){ alert('请先粘贴题库 JSON'); return; }
  try{ const raw=JSON.parse(str); const bank=normalizeBank(raw); applyBank(bank); closeBankPanel(); alert('题库已加载：'+(bank.title||'自定义题库')+'（共 '+bank.count+' 题）'); }
  catch(e){ alert('加载失败：'+e.message); }
}
function loadFromFile(file){
  if(!file) return;
  const r=new FileReader();
  r.onload=function(){ loadFromText(r.result); };
  r.readAsText(file);
}
function loadFromUrl(url){
  if(!url) return;
  fetch(url).then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
    .then(function(raw){ const bank=normalizeBank(raw); applyBank(bank); closeBankPanel(); alert('题库已加载：'+(bank.title||'自定义题库')+'（共 '+bank.count+' 题）'); })
    .catch(function(e){ alert('从 URL 加载失败（可能跨域/网络拦截）：'+e.message+'\n建议改用「粘贴 JSON」或「上传文件」。'); });
}
function restoreSample(){ applyBank(normalizeBank(SAMPLE_BANK)); closeBankPanel(); alert('已恢复内置示例题库'); }

/* ============ 全局状态 ============ */
let BANK=null, TOTAL=0, examSize=50;
applyBank(normalizeBank(SAMPLE_BANK), false);

let curMode='seq', order=[], idx=0, score=0, answered=0, shuffleOn=false, results=[], curBank=BANK.questions;
let examTimer=null, examLeft=0;



function loadWrong(){ try{return JSON.parse(storage.getItem(KEY)||'[]')}catch(e){return[]} }
function saveWrong(a){ storage.setItem(KEY,JSON.stringify(a)) }

function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

/* 模拟考试「智能轮转抽题」：本地维护题队列，连续考试不重复
   每次考试从队列头取 examSize 题消费掉；队列不足一轮时，把剩余未用题排在前面、
   其余整体重洗补满，保证题库内每题在一个轮转周期内最多出现一次。 */
function loadExamQueue(){ try{ const q=JSON.parse(storage.getItem(QUEUE_KEY)||'null'); return Array.isArray(q)?q:null; }catch(e){ return null; } }
function saveExamQueue(q){ try{ storage.setItem(QUEUE_KEY, JSON.stringify(q)); }catch(e){} }
function buildExamOrder(){
  let q=loadExamQueue();
  if(!Array.isArray(q) || q.length < examSize){
    const remain = Array.isArray(q) ? q : [];                 // 上一轮没用完的题优先
    const fresh = shuffle([...Array(TOTAL).keys()].filter(i=>!remain.includes(i)));
    q = remain.concat(fresh);
    saveExamQueue(q);
  }
  const picked = q.splice(0, examSize);                       // 消费队头 examSize 题
  saveExamQueue(q);                                            // 存回剩余队列
  return picked;
}

function start(mode){
  curMode=mode; idx=0; score=0; answered=0; results=[];
  if(mode==='exam'){ order=buildExamOrder(); curBank=BANK.questions; }
  else if(mode==='rand'){ order=shuffle([...Array(TOTAL).keys()]); curBank=BANK.questions; }
  else if(mode==='wrong'){
    const w=loadWrong();
    if(!w.length){ alert('错题本还是空的，去练习里答错题会自动收录 📕'); return; }
    curBank=w; order=shuffle([...Array(w.length).keys()]);
  }
  else { order=[...Array(TOTAL).keys()]; curBank=BANK.questions; }
  show('quiz'); render();
  if(mode==='exam'){ examLeft=60*60; startTimer(); } else { stopTimer(); document.getElementById('qtimer').textContent=''; }
}
function startTimer(){
  stopTimer(); updateTimer();
  examTimer=setInterval(()=>{ examLeft--; updateTimer(); if(examLeft<=0){ stopTimer(); submitExam(); } },1000);
}
function stopTimer(){ if(examTimer){clearInterval(examTimer);examTimer=null} }
function updateTimer(){ const m=Math.floor(examLeft/60),s=examLeft%60; const t=document.getElementById('qtimer'); t.textContent='⏱ '+m+':'+(s<10?'0':'')+s; t.classList.toggle('warn',examLeft<=60); }

function render(){
  const q=curBank[order[idx]];
  const card=document.querySelector('.qcard');
  card.style.animation='none'; void card.offsetWidth; card.style.animation='';
  document.getElementById('qpos').textContent='第 '+(idx+1)+' / '+order.length+' 题';
  document.getElementById('progbar').style.width=((idx)/order.length*100)+'%';
  document.getElementById('qtag').textContent = (q.options.length===2)?'判断题':'单选题';
  document.getElementById('qsrc').textContent = q.src ? ('来源：'+q.src) : '';
  document.getElementById('qtext').textContent=q.q;
  const fb=document.getElementById('fb'); fb.className='feedback'; fb.textContent='';
  const optsBox=document.getElementById('opts'); optsBox.innerHTML='';
  const opts=shuffleOn?shuffle(q.options):q.options;
  opts.forEach(o=>{
    const d=document.createElement('div'); d.className='opt'; d.dataset.k=o.k;
    d.innerHTML='<div class="k">'+escapeHtml(o.k)+'</div><div>'+escapeHtml(o.v)+'</div>';
    d.onclick=()=>pick(o.k,d);
    optsBox.appendChild(d);
  });
  document.getElementById('nextbtn').disabled=true;
  document.getElementById('nextbtn').textContent = (idx===order.length-1)?'交卷':'下一题';
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function pick(k,el){
  if(el.classList.contains('lock')) return;
  const q=curBank[order[idx]];
  const correct=q.a;
  const opts=document.querySelectorAll('#opts .opt');
  opts.forEach(o=>o.classList.add('lock'));
  answered++;
  const isRight = (k===correct);
  results[idx]={q:q, sel:k, right:isRight};
  opts.forEach(o=>{
    const ok=o.dataset.k;
    if(ok===correct) o.classList.add('correct');
    else if(ok===k) o.classList.add('wrong');
    else o.classList.add('dim');
  });
  const fb=document.getElementById('fb');
  if(isRight){ score++; fb.className='feedback ok'; fb.innerHTML='✅ 回答正确'; if(curMode==='wrong') removeWrong(q); }
  else { fb.className='feedback no'; fb.innerHTML='❌ 回答错误，正确答案：<span class="ans">'+escapeHtml(correct)+'</span>'; recordWrong(q); }
  document.getElementById('nextbtn').disabled=false;
}

function recordWrong(q){
  let w=loadWrong();
  if(!w.some(x=>x.q===q.q)){ w.push({q:q.q,options:q.options,a:q.a,src:q.src}); saveWrong(w); }
}
function removeWrong(q){ let w=loadWrong(); w=w.filter(x=>x.q!==q.q); saveWrong(w); }

function next(){
  if(idx===order.length-1){ if(curMode==='exam') submitExam(); else finishPractice(); return; }
  idx++; render();
}
function finishPractice(){
  stopTimer();
  document.getElementById('progbar').style.width='100%';
  const wrong=results.filter(r=>r && !r.right);
  document.getElementById('rscore').textContent=score+' / '+answered;
  document.getElementById('rmeta').textContent='练习完成 · 正确率 '+(answered?Math.round(score/answered*100):0)+'% · 错题 '+wrong.length+' 道';
  saveScore(curMode, answered, score);
  buildReview(wrong); show('result');
}
function submitExam(){
  stopTimer();
  const rev=order.map((qi,i)=> results[i] || {q:curBank[qi], sel:null, right:false});
  document.getElementById('rscore').textContent=score+' / '+order.length;
  document.getElementById('rmeta').textContent='模拟考试完成 · 正确率 '+(order.length?Math.round(score/order.length*100):0)+'%';
  saveScore('exam', order.length, score);
  buildReview(rev); show('result');
}
function buildReview(items){
  const box=document.getElementById('review'); box.innerHTML='';
  if(!items.length){ box.innerHTML='<div class="empty">本次作答全部正确，没有错题 🎉</div>'; return; }
  items.forEach((r,i)=>{
    const q=r.q;
    const corr=(q.options.find(o=>o.k===q.a)||{}).v||'';
    let myans='';
    if(r.sel){ myans = r.right ? '　你的答案：<span class="y">'+r.sel+'</span>' : '　你的答案：<span class="n">'+r.sel+'</span>'; }
    else { myans='　<span class="n">未作答</span>'; }
    const div=document.createElement('div'); div.className='item';
    div.innerHTML='<div class="qq">'+(i+1)+'. '+escapeHtml(q.q)+'</div><div class="ra">正确答案：<span class="y">'+escapeHtml(q.a)+'</span>　'+escapeHtml(corr)+myans+'</div>';
    box.appendChild(div);
  });
}

function openWrong(){
  const w=loadWrong();
  const box=document.getElementById('wblist'); box.innerHTML='';
  if(!w.length){ box.innerHTML='<div class="empty">错题本还是空的，去练习里答错题会自动收录 📕</div>'; }
  else{
    w.forEach((q,i)=>{
      const div=document.createElement('div'); div.className='item';
      const optstr=q.options.map(o=>o.k+'、'+escapeHtml(o.v)).join('　');
      div.innerHTML='<div class="qq">'+(i+1)+'. '+escapeHtml(q.q)+'</div><div style="font-size:13px;color:var(--sub);margin-top:6px">'+optstr+'</div><div class="ans">正确答案：'+escapeHtml(q.a)+'（'+escapeHtml((q.options.find(o=>o.k===q.a)||{}).v||'')+'）</div>';
      box.appendChild(div);
    });
  }
  show('wrong');
}
function clearWrong(){ if(confirm('确定清空错题本？')){ saveWrong([]); openWrong(); } }

/* 成绩历史：本地保存历次练习/考试成绩，用于追踪正确率趋势 */

function loadHistory(){ try{return JSON.parse(storage.getItem(HIST_KEY)||'[]')}catch(e){return[]} }
function saveScore(mode,total,right){
  const h=loadHistory();
  h.push({t:Date.now(), mode:mode, total:total, right:right, rate: total?Math.round(right/total*100):0});
  try{ storage.setItem(HIST_KEY, JSON.stringify(h.slice(-100))); }catch(e){}
}
function modeName(m){ return ({seq:'顺序',rand:'随机',exam:'模拟',wrong:'错题'})[m]||m; }
function openHistory(){
  const h=loadHistory();
  const box=document.getElementById('histlist'); box.innerHTML='';
  if(!h.length){ box.innerHTML='<div class="empty">还没有成绩记录，去考一次试试 📊</div>'; show('history'); return; }
  h.slice().reverse().forEach(r=>{
    const d=new Date(r.t);
    const ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
    const color = r.rate>=80?'var(--ok)':(r.rate>=60?'var(--warn)':'var(--bad)');
    const div=document.createElement('div'); div.className='row';
    div.innerHTML='<div class="when">'+ds+'</div><div class="mode">'+modeName(r.mode)+'</div>'+
      '<div class="bar"><i style="width:'+r.rate+'%;background:'+color+'"></i></div>'+
      '<div class="pct" style="color:'+color+'">'+r.rate+'%</div>'+
      '<div style="font-size:12.5px;color:var(--sub);width:74px;flex:none;text-align:right">'+r.right+'/'+r.total+'</div>';
    box.appendChild(div);
  });
  show('history');
}
function clearHistory(){ if(confirm('确定清空成绩历史？')){ try{ storage.removeItem(HIST_KEY); }catch(e){} openHistory(); } }
function setExamSize(v){ examSize=parseInt(v,10)||50; document.getElementById('s-exam').textContent=examSize; }

function quit(){ stopTimer(); if(confirm('退出当前练习？进度将不保存。')) backHome(); }
function backHome(){ stopTimer(); show('home'); }

function resetExamQueue(){ if(confirm('重置后将从头开始轮转抽题（已用过的题会重新进入题库）？')){ try{ storage.removeItem(QUEUE_KEY); }catch(e){} alert('抽题轮转已重置 ✅'); } }

function show(id){ ['home','quiz','result','wrong','history'].forEach(x=>document.getElementById(x).classList.toggle('hidden',x!==id)); window.scrollTo(0,0); }

document.addEventListener('keydown',function(e){
  if(document.getElementById('quiz').classList.contains('hidden')) return; // 不在答题页
  const k=e.key.toUpperCase();
  if(k==='A'||k==='B'||k==='C'||k==='D'){
    const el=document.querySelector('#opts .opt[data-k="'+k+'"]');
    if(el && !el.classList.contains('lock')) pick(k, el);
  } else if(e.key==='Enter'){
    const nb=document.getElementById('nextbtn');
    if(!nb.disabled) next();
  }
});

Object.assign(window, {normalizeBank,applyBank,syncExamSel,openBankPanel,closeBankPanel,loadFromText,loadFromFile,loadFromUrl,restoreSample,loadWrong,saveWrong,shuffle,loadExamQueue,saveExamQueue,buildExamOrder,start,startTimer,stopTimer,updateTimer,render,escapeHtml,pick,recordWrong,removeWrong,next,finishPractice,submitExam,buildReview,openWrong,clearWrong,loadHistory,saveScore,modeName,openHistory,clearHistory,setExamSize,quit,backHome,resetExamQueue,show});
Object.defineProperties(window,{curMode:{get:()=>curMode},shuffleOn:{get:()=>shuffleOn,set:v=>{shuffleOn=v}}});
