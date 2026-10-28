const BANK = window.BANK || [];
const QMAP = {}; BANK.forEach(q=>QMAP[q.id]=q);

/* 清理历史残留记录（如旧版哈希 id 的条目，已不在当前题库中） */
function pruneStale(){
  let changed=false;
  Object.keys(recAll).forEach(k=>{
    Object.keys(recAll[k]).forEach(id=>{ if(!QMAP[id]){ delete recAll[k][id]; changed=true; } });
  });
  Object.keys(ansAll).forEach(k=>{
    Object.keys(ansAll[k]).forEach(id=>{ if(!QMAP[id]){ delete ansAll[k][id]; changed=true; } });
  });
  Object.keys(wrong).forEach(id=>{ if(!QMAP[id]){ delete wrong[id]; changed=true; } });
  if(changed){
    try{
      localStorage.setItem(LS_REC,JSON.stringify(recAll));
      localStorage.setItem(LS_WRONG,JSON.stringify(wrong));
      localStorage.setItem(LS_ANS,JSON.stringify(ansAll));
    }catch(e){}
  }
}
const TYPE = {1:'单选',2:'多选',3:'判断'};
const CHAPTERS = {1:'法规',2:'交通信号',3:'安全行车',4:'机动车操作',5:'案例分析',14:'违法行为',15:'交警手势'};

/* ---------- 技巧口诀（速记法）静态内容 ---------- */
const TIPS = [
  { title:'高速能见度口诀 261 / 145 / 520',
    mn:'2-6-1：能见度<200米 → 车速≤60、车距≥100\n1-4-5：能见度<100米 → 车速≤40、车距≥50\n5-2-0：能见度<50米 → 车速≤20、尽快驶离',
    desc:'高速公路遇雾、雨、雪、沙尘、冰雹等低能见度气象条件时：\n· 261：开雾灯、近光灯、示廓灯、前后位灯；车速不超过60km/h，与同车道前车保持100米以上距离。\n· 145：在261基础上再开危险报警闪光灯；车速不超过40km/h，车距≥50米。\n· 520：车速不超过20km/h，并从最近出口尽快驶离高速公路。',
    mem:'数字读法即条件：2→200米、6→60、1→100；1→100米、4→40、5→50；5→50米、2→20、0→驶离高速。' },

  { title:'铁路道口红杠（距离）',
    mn:'几道红杠 × 50米 = 距铁路道口的距离',
    desc:'无人看守铁路道口警告标志为红色斜杠：\n· 一道红杠：距道口 50米\n· 两道红杠：距道口 100米\n· 三道红杠：距道口 150米\n另：道口信号灯红灯亮=火车接近，必须停车等待；红灯熄灭后方可通行。',
    mem:'一道50、两道100、三道150；红灯亮就停，灯灭才走。' },

  { title:'停车距离（警告标志放置）',
    mn:'普通路 50–100米，高速公路 150米以外',
    desc:'机动车在道路上发生故障/事故、难以移动时：\n· 普通道路：开危险报警闪光灯（双闪），在车后 50–100米 处设置警告标志。\n· 高速公路：开双闪，在车后 150米以外 设置警告标志，夜间还需开示廓灯和后位灯。',
    mem:'高速要更远（150外），普通50到100。' },

  { title:'超速记分（小型客车·163号令）',
    mn:'10%内不记分｜10–20%记1分｜20–50%普通3分/高速6分｜50%以上普通6分/高速12分',
    desc:'普通小型客车超速记分（2022年4月公安部163号令，2026仍适用）：\n· 超速10%以内：警告，不记分。\n· 超速10%–20%（含普通与高速）：记1分。\n· 超速20%–50%：普通道路记3分；高速公路/城市快速路记6分。\n· 超速50%以上：普通道路记6分；高速公路/城市快速路记12分。',
    mem:'十以内免，十到二十记1；二十到五普通3高快6；过半普通6高快12。' },

  { title:'记分档次口诀（12/9/6/3/1）',
    mn:'12酒驾逆遮牌｜9分不符停高快｜6分红灯占应急｜3分不让人与道｜1分小事灯与带',
    desc:'163号令记分分值共五档：\n· 12分：酒驾；高速倒车/逆行/掉头；故意遮挡/污损号牌；伪造变造牌证；肇事逃逸（不构成犯罪）；高速超速50%以上；准驾车型不符。\n· 9分：驾驶与准驾不符的客车/危险品车；高速/快速路违法停车；未悬挂号牌；特定车疲劳驾驶；超速50%以上（非高速）。\n· 6分：闯红灯；高速超速20–50%；占用应急车道；不按交通信号灯通行。\n· 3分：普通道路超速20–50%；不按规定车道行驶；人行横道不减速不让行人；故障不按规定放标志；穿插排队车辆。\n· 1分：不按规定使用灯光/标志；超速10–20%；普通轻微违法。',
    mem:'12最重（酒逆遮牌），9次重（不符停高快），6红占应急，3不让行，1小错。' },

  { title:'罚款数字口诀',
    mn:'小错20–200｜大错200–2000｜酒驾1000–2000｜造假2000–5000',
    desc:'常见罚款区间：\n· 20–200元：轻微违法（未随车带驾驶证/行驶证、不按规定使用灯光、未放置检验/保险标志等）。\n· 200–2000元：较严重（无证驾驶、将车交无证人员驾驶、超速50%以上、事故逃逸尚不构成犯罪、驾驶拼装/报废车）。\n· 1000–2000元：饮酒后驾驶机动车（再次饮酒驾驶并处拘留）；醉驾则吊销并追究刑事责任。\n· 2000–5000元：伪造/变造机动车登记证书、号牌、行驶证、驾驶证；使用其他车辆的上述牌证/标志。',
    mem:'小错几十到两百，大错两百到两千，酒驾一千到两千，造假两千到五千。' },

  { title:'灯光使用口诀',
    mn:'会车150改近光｜超车路口闪两下（远近交替）｜雾天雾灯加双闪｜停车示廓加尾灯',
    desc:'· 夜间起步：近光灯 + 左转向灯。\n· 夜间会车：距对向来车 150米以外 改用近光灯。\n· 夜间超车，或通过急弯、坡路、拱桥、人行横道、无信号灯路口：交替使用远近光灯（闪灯）示意。\n· 雾天：开雾灯 + 危险报警闪光灯（双闪）。\n· 路边临时停车：开示廓灯 + 后位灯（夜间加双闪）。\n· 转向：提前 30米 开启转向灯。',
    mem:'会车远变近（150外），超车闪一闪（远近交替），雾天双灯齐（雾灯+双闪），停车辆尾亮。' },

  { title:'让行原则',
    mn:'直行最大｜右方先走｜右转让左转｜上坡让下坡（中途例外）｜环岛外让内｜辅让主｜人最优先',
    desc:'· 转弯让直行：转弯车让直行车先行。\n· 让右原则：无标志标线控制的路口，让右方道路来车先行。\n· 右转弯让左转弯：相对方向右转车让左转车。\n· 坡路：下坡车让上坡车；如下坡车已行至中途，则上坡车让下坡车。\n· 环岛：进环岛车让环岛内（出环岛）车。\n· 主辅路：辅路车让主路车。\n· 行人/非机动车优先：人行横道礼让行人，机动车让非机动车，非机动车让行人。',
    mem:'直行>转弯，右方>左方，右转>左转，上坡>下坡，环岛外>内，辅>主，人>车。' },

  { title:'实习期规定',
    mn:'实习十二月｜贴标才能开｜上高速老司机（3年）陪｜满12分就注销',
    desc:'初次领取驾驶证后的 12个月 为实习期：\n· 须在车身后部粘贴/悬挂统一式样的实习标志。\n· 上高速公路：需由持相应或更高准驾车型驾驶证 3年以上 的驾驶人陪同。\n· 实习期记满 12分：注销其实习的准驾车型驾驶资格（增驾的并注销最高准驾车型）。\n· 实习期不得驾驶：公共汽车、营运客车、执行任务的特种车、载危险物品的机动车等。',
    mem:'实习12月贴标，上高快要3年老司机陪，满12分直接注销资格。' },
];

const LS_WRONG='jiakao_wrong_v1', LS_REC='jiakao_rec_v2', LS_PROG='jiakao_progress_v2',
      LS_ANS='jiakao_ans_v2', LS_EXAM='jiakao_exam_v1';
let wrong = JSON.parse(localStorage.getItem(LS_WRONG)||'{}');   // 全局错题汇总（用于错题本）
let recAll = JSON.parse(localStorage.getItem(LS_REC)||'{}');    // 按 科目_模式 分桶：{ '1_seq':{qid:'right'|'wrong'}, ... }
let ansAll = JSON.parse(localStorage.getItem(LS_ANS)||'{}');    // 按 科目_模式 分桶：{ '1_seq':{qid:[idx,...]}, ... }
// 当前分类(科目+模式)下的答题记录，独立保存 —— 切换标签互不串扰
let rec = {};    // {qid:'right'/'wrong'}
let qans = {};   // {qid:[index,...]}
function scopeKey(){ return `${S.sub}_${S.mode}`; }
function loadScope(){ rec = recAll[scopeKey()]||{}; qans = ansAll[scopeKey()]||{}; }
function commitScope(){
  if(Object.keys(rec).length) recAll[scopeKey()]=rec; else delete recAll[scopeKey()];
  if(Object.keys(qans).length) ansAll[scopeKey()]=qans; else delete ansAll[scopeKey()];
  try{
    localStorage.setItem(LS_REC,JSON.stringify(recAll));
    localStorage.setItem(LS_ANS,JSON.stringify(ansAll));
  }catch(e){}
}

const MODES = [
  {k:'seq',  n:'顺序练习'},
  {k:'rand', n:'随机练习'},
  {k:'wrong',n:'错题本'},
  {k:'top',  n:'精选500题'},
  {k:'exam', n:'模拟考试'},
  {k:'tips', n:'技巧口诀'},
];

let S = { sub:1, mode:'seq', list:[], idx:0, sel:new Set(), submitted:false,
          answered:0, correct:0, exam:null };

/* ---------- 列表构建 ---------- */
function buildList(){
  let base = BANK.filter(q=>q.sub===S.sub);
  let list;
  if(S.mode==='wrong'){
    list = base.filter(q=>wrong[q.id]);
  } else if(S.mode==='top'){
    // 精选500：按 freq 权重取前 500。freq = 官方题型分布权重 + 2026 高频必考模块加权 + 命中元贝精简500题单的权威种子加权（确定性，刷新不变）
    list = base.slice().sort((a,b)=>b.freq-a.freq).slice(0, Math.min(500, base.length));
  } else if(S.mode==='rand'){
    list = base.slice().sort(()=>Math.random()-0.5);
  } else if(S.mode==='exam'){
    // 模拟考试按真实题型配比 + 高频加权抽题：科目一 100题=60单选+40判断；科目四 50题(含多选)
    if(S.sub===1){
      const single = base.filter(q=>q.type===1);
      const judge  = base.filter(q=>q.type===3);
      list = shuffleArr([...weightedSample(single,60), ...weightedSample(judge,40)]);
    } else {
      const mc   = base.filter(q=>q.type===2);          // 科目四多选（必含）
      const rest = base.filter(q=>q.type!==2);
      list = shuffleArr([...weightedSample(mc,20), ...weightedSample(rest,30)]);
    }
  } else if(S.mode==='tips'){
    list = []; // 技巧口诀为静态速记内容，无题目
  } else {
    list = base;
  }
  S.list = list; S.idx = 0; S.answered=0; S.correct=0;
}

/* ---------- 进度持久化 ---------- */
function saveProgress(){
  try{
    const ids = (S.mode==='rand'||S.mode==='exam') ? S.list.map(q=>q.id) : null;
    const data = {
      sub:S.sub, mode:S.mode, idx:S.idx, ids,
      exam: S.exam ? {answers:S.exam.answers, finished:S.exam.finished,
                      total:S.exam.total, left:S.exam.left, duration:S.exam.duration} : null
    };
    localStorage.setItem(LS_PROG, JSON.stringify(data));
  }catch(e){}
}
function loadProgress(){
  try{ return JSON.parse(localStorage.getItem(LS_PROG)); }catch(e){ return null; }
}

/* ---------- 模拟考试独立存档（试卷 + 位置 + 答案 + 剩余时间） ---------- */
function saveExam(){
  try{
    if(!S.exam) return;  // 非考试模式：不动考试存档（避免练习时误清）
    // 关键：只有"仍处于考试模式"时才同步题号。
    // 切换到别的菜单后 buildList() 会把 S.idx 重置为 0，若此时再同步，
    // 就会把存档里的题号清回第 1 题 → 切回"模拟考试"又回到第一题（本 BUG）。
    if(S.mode==='exam') S.exam.idx = S.idx;
    localStorage.setItem(LS_EXAM, JSON.stringify({
      sub:S.exam.sub, ids:S.exam.ids, idx:S.exam.idx||0, answers:S.exam.answers,
      sel:S.exam.sel||{}, finished:!!S.exam.finished, total:S.exam.total,
      duration:S.exam.duration, left:S.exam.left
    }));
  }catch(e){}
}
function clearExam(){ try{ localStorage.removeItem(LS_EXAM); }catch(e){} }
function loadExam(){
  try{
    const e=JSON.parse(localStorage.getItem(LS_EXAM));
    if(!e || !e.sub || !Array.isArray(e.ids)) return null;
    const list=e.ids.map(id=>QMAP[id]).filter(Boolean);
    if(!list.length) return null;
    return {e,list};
  }catch(err){ return null; }
}

/* ---------- 统计条（已做/正确/正确率/错题） ---------- */
function renderStats(){
  const statsEl=document.getElementById('stats');
  const progEl=document.getElementById('prog');
  if(!statsEl) return;
  if(S.mode==='exam' && S.exam && S.exam.finished){ statsEl.innerHTML=''; progEl.style.width='100%'; return; }
  if(!S.list.length){ statsEl.innerHTML=''; progEl.style.width='0'; return; }
  const total=S.list.length;
  if(S.mode==='wrong'){
    statsEl.innerHTML = `错题本共 <b>${Object.keys(wrong).filter(id=>QMAP[id]&&QMAP[id].sub===S.sub).length}</b> 题`;
    progEl.style.width='0'; return;
  }
  if(S.mode==='exam'){ statsEl.innerHTML=''; progEl.style.width='0'; return; }
  // key 均为字符串（localStorage 序列化后），与题目数字 id 比较时统一转字符串；rec 为当前(科目+模式)独立记录
  const doneKeys=Object.keys(rec).filter(id=>S.list.some(x=>String(x.id)===id));
  const doneCount=doneKeys.length;
  const rightCount=doneKeys.filter(id=>rec[id]==='right').length;
  const wrongSub=Object.keys(wrong).filter(id=>QMAP[id]&&QMAP[id].sub===S.sub).length;
  statsEl.innerHTML=`共 <b>${total}</b> 题 · 已做 <b>${doneCount}</b> · 正确 <b>${rightCount}</b> · 正确率 <b>${doneCount?Math.round(rightCount/doneCount*100):0}%</b> · 错题 <b>${wrongSub}</b>`;
  progEl.style.width=(doneCount/total*100)+'%';
}

/* ---------- 渲染 ---------- */
function render(){
  loadScope(); // 载入当前(科目+模式)独立的答题记录，避免切换标签串扰
  renderModes();
  const stage = document.getElementById('stage');
  const examBar = document.getElementById('examBar');
  const statsEl = document.getElementById('stats');

  // 技巧口诀：静态速记内容，隐藏统计/进度/考试条
  if(S.mode==='tips'){
    examBar.style.display='none';
    statsEl.innerHTML='';
    document.getElementById('prog').style.width='0';
    renderTips();
    return;
  }

  if(S.mode==='exam' && S.exam && S.exam.finished){
    stage.innerHTML=''; renderExamResult(); examBar.style.display='none'; statsEl.innerHTML='';
    document.getElementById('prog').style.width='100%'; return;
  }
  examBar.style.display = (S.mode==='exam')?'flex':'none';

  if(!S.list.length){
    stage.innerHTML='<div class="card empty">该科目暂无题目（或错题本还是空的，先去练习吧）</div>';
    statsEl.innerHTML=''; document.getElementById('prog').style.width='0';
    return;
  }
  const q = S.list[S.idx];
  const total = S.list.length;
  // 进度/统计（独立函数，提交后也会调用刷新）
  renderStats();

  if(S.mode==='exam'){
    document.getElementById('examInfo').textContent = `第 ${S.idx+1} / ${total} 题`;
  }

  // 还原提示：恢复已作答状态时，先挂载卡片再做结果重绘（保证 .actions / submitBtn 在 DOM 中可被查到）

  // 题目卡片
  const card = document.createElement('div'); card.className='card';
  const head = document.createElement('div'); head.className='qhead';
  head.innerHTML = `<span class="tag">${TYPE[q.type]}</span>`+
    (q.ch?`<span>章节：${CHAPTERS[q.ch]||q.ch}</span>`:'')+
    (q.er?`<span class="tag er">易错率 ${q.er}%</span>`:'')+
    `<span>第 ${S.idx+1} / ${total} 题</span>`;
  card.appendChild(head);

  const qt = document.createElement('div'); qt.className='qtext'; qt.textContent=q.q; card.appendChild(qt);

  if(q.img){
    const im = document.createElement('img'); im.className='qimg'; im.src=new URL("../images/"+q.img,import.meta.url).href; im.loading='lazy';
    im.onerror=()=>{ im.style.display='none';
      const m=document.createElement('div'); m.className='imgmiss'; m.textContent='（图片加载失败，需联网或图片源已失效）';
      if(im.parentNode) im.parentNode.insertBefore(m,im.nextSibling); };
    card.appendChild(im);
  }

  const opts = document.createElement('div'); opts.className='opts';
  q.opt.forEach((text,i)=>{
    const o = document.createElement('div'); o.className='opt';
    const key = String.fromCharCode(65+i);
    o.innerHTML = `<span class="key">${key}</span><span class="ot">${escapeHtml(text)}</span><span class="mark"></span>`;
    o.onclick = ()=>onSelect(i,o);
    o.dataset.i=i;
    opts.appendChild(o);
  });
  card.appendChild(opts);

  // 考点 / 知识点（接口 explain 字段）—— 常驻展示在题目下方
  // 模拟考试：加一层模糊遮罩，点击后才揭开，避免直接看到提示；其余模式保持原样直接展示
  if(q.exp){
    const kp = document.createElement('div'); kp.className='kpoint';
    if(S.mode==='exam'){
      kp.classList.add('blur-hide');
      const body=document.createElement('div'); body.className='kpoint-body';
      body.innerHTML = `<b>💡 考点 / 知识点：</b>${escapeHtml(q.exp)}`;
      const veil=document.createElement('div'); veil.className='kpoint-veil';
      veil.innerHTML = '👆 点击显示考点 / 知识点';
      veil.onclick=()=>{ kp.classList.remove('blur-hide'); if(veil.parentNode) veil.parentNode.removeChild(veil); };
      kp.appendChild(body); kp.appendChild(veil);
    } else {
      kp.innerHTML = `<b>💡 考点 / 知识点：</b>${escapeHtml(q.exp)}`;
    }
    card.appendChild(kp);
  }

  const acts = document.createElement('div'); acts.className='actions';
  const submitBtn = mkBtn('提交答案','primary', submit);
  submitBtn.id='submitBtn';
  const prevBtn = mkBtn('上一题','ghost', prev);
  const nextBtn = mkBtn('下一题','ghost', next);
  if(S.mode==='exam'){ nextBtn.textContent='下一题'; nextBtn.disabled=true; }
  acts.appendChild(prevBtn); acts.appendChild(submitBtn); acts.appendChild(nextBtn);
  card.appendChild(acts);

  const result = document.createElement('div'); result.id='result'; result.className='result';
  // 恢复已作答状态（练习模式按用户选择恢复；考试模式按答案恢复）
  if(S.mode!=='exam' && qans[q.id]){
    S.submitted=true; S.sel=new Set(qans[q.id]);
  } else if(S.mode==='exam' && S.exam && S.exam.answers[S.idx]!==undefined){
    S.submitted=true;
    const sv = S.exam.sel && S.exam.sel[S.idx];
    if(sv) S.sel = new Set(sv);   // 恢复本题原来的选择，便于高亮显示
  }
  card.appendChild(result);

  stage.innerHTML=''; stage.appendChild(card);
  S._opts = opts; // 缓存
  if(S.submitted){ paintResult(q,opts,result,true); document.getElementById('submitBtn').disabled=true; }
}

function renderTips(){
  const stage=document.getElementById('stage');
  let html='<div class="tips">';
  TIPS.forEach((t,i)=>{
    html+=`<div class="tip-card">
      <h3><span class="idx">${i+1}</span>${escapeHtml(t.title)}</h3>
      <div class="mn">${escapeHtml(t.mn).replace(/\n/g,'<br>')}</div>
      <div class="desc">${escapeHtml(t.desc).replace(/\n/g,'<br>')}</div>
      ${t.mem?`<div class="mem">🧠 记忆：${escapeHtml(t.mem).replace(/\n/g,'<br>')}</div>`:''}
    </div>`;
  });
  html+='</div>';
  stage.innerHTML=html;
}

function paintResult(q,opts,result,restore){
  // restore=true：重绘已作答的题（切回模式/刷新恢复）。此时 S.sel 已被清空，
  // 绝不能用它重新判定，否则会把原本答对的记录覆盖成答错。
  restore = !!restore;
  const ok = (restore && S.mode==='exam' && S.exam && S.exam.answers[S.idx]!==undefined)
             ? !!S.exam.answers[S.idx]
             : sameSet(S.sel, q.a);
  const verdict = document.createElement('div');
  verdict.className='verdict '+(ok?'ok':'bad');
  verdict.textContent = ok?'✓ 回答正确':'✗ 回答错误';
  result.appendChild(verdict);
  const ans = document.createElement('div');
  ans.className='ans'; ans.style.fontSize='14px';
  ans.innerHTML = `正确答案：<b>${q.a.map(i=>String.fromCharCode(65+i)).join('、')}</b>`;
  result.appendChild(ans);
  // 高亮选项
  q.opt.forEach((t,i)=>{
    const o = opts.children[i]; if(!o) return;
    const isCorrect = q.a.includes(i);
    const isSel = S.sel.has(i);
    if(isCorrect) o.classList.add('right');
    else if(isSel) o.classList.add('wrong');
    const mark = o.querySelector('.mark');
    if(isCorrect) mark.textContent='正确';
    else if(isSel) mark.textContent='你的选择';
  });
  // 记录
  if(S.mode==='exam'){
    if(!restore){                                   // 仅真实提交时写入，恢复重绘不动存档
      S.exam.answers[S.idx] = ok;
      (S.exam.sel = S.exam.sel || {})[S.idx] = [...S.sel];
    }
    const nb = document.querySelector('.actions').children[2];
    if(nb) nb.disabled=false;
  }
  // 练习模式提供"重做本题"
  if(S.mode!=='exam'){
    const redo = mkBtn('重做本题','ghost', ()=>{
      delete qans[q.id]; delete rec[q.id];
      if(wrong[q.id]) delete wrong[q.id];
      commitScope();
      try{ localStorage.setItem(LS_WRONG,JSON.stringify(wrong)); }catch(e){}
      S.submitted=false; S.sel=new Set(); saveProgress(); render();
    });
    result.appendChild(redo);
  }
}

/* ---------- 交互 ---------- */
function onSelect(i,o){
  if(S.submitted) return;
  const q=S.list[S.idx];
  if(q.type===2){ // 多选
    if(S.sel.has(i)) S.sel.delete(i); else S.sel.add(i);
  } else {
    S.sel = new Set([i]);
    [...S._opts.children].forEach(c=>c.classList.remove('sel'));
  }
  if(S.sel.has(i)) o.classList.add('sel'); else o.classList.remove('sel');
}
function submit(){
  if(S.submitted) return;
  if(!S.sel.size){ alert('请先选择一个答案'); return; }
  S.submitted=true;
  const q=S.list[S.idx];
  const ok = sameSet(S.sel, q.a);
  // 练习/考试分别处理：练习写入"当前分类"独立记录；考试仅写入全局错题汇总（不污染练习记录）
  if(S.mode!=='exam'){
    rec[q.id] = ok?'right':'wrong';
    qans[q.id] = [...S.sel];
    commitScope();
  }
  if(!ok) wrong[q.id]=true; else if(wrong[q.id]) delete wrong[q.id];
  try{ localStorage.setItem(LS_WRONG,JSON.stringify(wrong)); }catch(e){}
  const opts = S._opts; const result=document.getElementById('result');
  paintResult(q,opts,result,false);
  document.getElementById('submitBtn').disabled=true;
  saveProgress(); saveExam();
  renderStats(); // 提交后立即刷新统计条
}
function next(){
  if(S.idx < S.list.length-1){ S.idx++; resetQ(); render(); saveProgress(); saveExam(); }
  else if(S.mode==='exam'){ finishExam(); }
  else { alert('已经是最后一题啦'); }
}
function prev(){ if(S.idx>0){ S.idx--; resetQ(); render(); saveProgress(); saveExam(); } }
function resetQ(){ S.sel=new Set(); S.submitted=false; }

/* ---------- 模拟考试 ---------- */
function updateTimer(){
  const m=String(Math.floor(S.exam.left/60)).padStart(2,'0');
  const s=String(S.exam.left%60).padStart(2,'0');
  const t=document.getElementById('timer'); if(t) t.textContent=`${m}:${s}`;
}
function startExamTimer(){
  clearInterval(S.exam.timer);
  S.exam.timer=setInterval(()=>{
    S.exam.left--; updateTimer();
    if(S.exam.left<=0){ clearInterval(S.exam.timer); finishExam(); }
  },1000);
}
function startExam(){
  S.exam = { answers:{}, finished:false, total:S.list.length, sub:S.sub,
             ids:S.list.map(q=>q.id), idx:0,
             duration:45*60, left:45*60, timer:null };
  startExamTimer();
  saveExam();
}
function finishExam(){
  clearInterval(S.exam && S.exam.timer);
  S.exam.finished=true; saveExam(); saveProgress();
  // 若用户此刻已切到别的模式（顺序/错题等），不要强行打断跳转到成绩页
  if(S.mode==='exam') render();
}
function renderExamResult(){
  const a=S.exam.answers; const total=S.exam.total;
  const right=Object.values(a).filter(Boolean).length;
  const score=Math.round(right/total*100);
  const pass=score>=90;
  const stage=document.getElementById('stage');
  stage.innerHTML=`<div class="exam-result">
    <div>模拟考试结束</div>
    <div class="score ${pass?'pass':'fail'}">${score}<span style="font-size:18px">分</span></div>
    <div style="color:var(--sub);margin-bottom:14px">答对 ${right} / ${total} · 合格线 90 分 · ${pass?'🎉 恭喜通过':'未达合格线，再练练'}</div>
    <button class="btn primary" onclick="restartExam()">再来一次</button>
  </div>`;
}
/* 重新考试：仅重置本次考试（重新抽题 + 计时归零），不影响其它模式的进度记录 */
function confirmRestartExam(){
  const answered = S.exam ? Object.keys(S.exam.answers).length : 0;
  const head = answered ? `当前已作答 ${answered} 题。` : '本次考试尚未作答。';
  if(confirm(`${head}\n\n确定重新开始本次模拟考试吗？\n将清空当前答题记录、重新抽题，并把计时重置为 45:00。`)){
    restartExam();
  }
}
function restartExam(){
  clearInterval(S.exam && S.exam.timer); // 先停掉旧计时器，避免叠加
  S.exam=null;
  buildList(); resetQ(); startExam(); render(); saveProgress(); hideResumeBar();
}

/* ---------- 工具 ---------- */
function shuffleArr(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=a[i];a[i]=a[j];a[j]=t; } return a; }
function weightedSample(pool, n){
  // 按 freq 加权无放回抽样（freq 越高越容易被抽中，贴近真实考试出题分布）
  const arr = pool.slice(); const res = [];
  while(res.length < n && arr.length){
    let total = 0; for(const q of arr) total += (q.freq||1);
    let r = Math.random()*total, idx = 0;
    for(; idx<arr.length; idx++){ r -= (arr[idx].freq||1); if(r<=0) break; }
    if(idx>=arr.length) idx = arr.length-1;
    res.push(arr[idx]); arr.splice(idx,1);
  }
  return res;
}
function sameSet(a,b){ if(a.size!==b.length) return false; for(const x of a) if(!b.includes(x)) return false; return true; }
function escapeHtml(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function mkBtn(t,cls,fn){ const b=document.createElement('button'); b.className='btn '+cls; b.textContent=t; b.onclick=fn; return b; }
function renderModes(){
  const m=document.getElementById('modes'); m.innerHTML='';
  MODES.forEach(x=>{
    const b=document.createElement('button'); b.textContent=x.n;
    if(x.k===S.mode) b.className='on';
    b.onclick=()=>{
      // 离开考试模式前先存档当前位置，切回来可无缝继续
      if(S.mode==='exam' && S.exam && !S.exam.finished) saveExam();
      S.mode=x.k;
      if(x.k==='exam'){
        if(!S.exam || S.exam.finished || S.exam.sub!==S.sub){
          // 首次进入 / 已交卷 / 换了科目 → 才重新抽题开考
          buildList(); startExam();
        } else {
          // 关键修复：同科目内有进行中的考试 → 恢复原卷与位置，绝不重置进度与计时
          S.list = S.exam.ids.map(id=>QMAP[id]).filter(Boolean);
          S.idx = Math.max(0, Math.min(S.exam.idx||0, S.list.length-1));
          if(!S.exam.timer) startExamTimer(); // 刷新/恢复后继续倒计时
        }
      } else {
        buildList();
      }
      resetQ();
      render(); saveProgress(); saveExam(); hideResumeBar();
    };
    m.appendChild(b);
  });
}
function switchSub(s){
  if(s===S.sub) return;  // 重复点击当前科目：不重置任何进度（含进行中的考试）
  clearInterval(S.exam && S.exam.timer);
  S.exam=null; clearExam();  // 切换科目：放弃当前考试视图，避免与新科目题目串味
  S.sub=s; document.getElementById('sub1').classList.toggle('on',s===1);
  document.getElementById('sub4').classList.toggle('on',s===4);
  if(S.mode==='exam'){ S.mode='seq'; }
  buildList(); resetQ(); render(); saveProgress(); hideResumeBar();
}

/* ---------- 续刷横幅 ---------- */
function showResumeBar(p){
  const bar=document.getElementById('resumeBar');
  if(p && p.sub && p.mode && p.mode!=='tips' && !(p.mode==='exam' && p.exam && p.exam.finished)){
    const modeName=(MODES.find(m=>m.k===p.mode)||{}).n||p.mode;
    const subName=p.sub===1?'科目一':'科目四';
    bar.style.display='flex';
    let tip=`📌 已为你恢复上次进度：${subName} · ${modeName} · 第 ${(p.idx||0)+1} 题`;
    if(p.mode==='exam' && p.exam && p.exam.left!=null){
      const mm=String(Math.floor(p.exam.left/60)).padStart(2,'0');
      const ss=String(p.exam.left%60).padStart(2,'0');
      tip+=`（考试进行中，剩余 ${mm}:${ss}）`;
    }
    bar.innerHTML=`<span>${tip}</span>`;
    const btn=document.createElement('button');
    btn.textContent='从头开始本模式';
    btn.onclick=()=>{
      if(confirm('确定从头开始当前模式？已答记录保留，进度回到第 1 题。')){
        S.idx=0; S.exam=null; resetQ();
        if(S.mode==='exam'){ buildList(); startExam(); } else { buildList(); resetQ(); }
        saveProgress(); hideResumeBar(); render();
      }
    };
    bar.appendChild(btn);
  } else { bar.style.display='none'; }
}
function hideResumeBar(){ document.getElementById('resumeBar').style.display='none'; }

/* ---------- 启动（带进度恢复） ---------- */
function init(){
  pruneStale(); // 清理不在当前题库中的历史记录（旧版哈希 id 等）
  const p = loadProgress();
  // 优先恢复未完成的模拟考试（试卷/位置/答案/剩余时间都在 LS_EXAM 里）
  const ex = loadExam();
  if(ex && p && p.mode==='exam' && p.sub===ex.e.sub){
    S.sub = p.sub; S.mode='exam';
    S.list = ex.list;
    S.exam = { sub:ex.e.sub, ids:ex.e.ids, answers:ex.e.answers||{}, sel:ex.e.sel||{},
               finished:!!ex.e.finished,
               total:ex.e.total||ex.list.length, duration:ex.e.duration||45*60,
               left:(ex.e.left==null?45*60:ex.e.left), timer:null };
    S.idx = Math.max(0, Math.min(ex.e.idx||0, S.list.length-1));
    updateTimer();
    if(!S.exam.finished) startExamTimer();
    render(); showResumeBar(p);
    return;
  }
  if(p && p.sub && p.mode){
    S.sub = p.sub;
    S.mode = p.mode;
    if((p.mode==='rand'||p.mode==='exam') && Array.isArray(p.ids)){
      S.list = p.ids.map(id=>QMAP[id]).filter(Boolean);
    } else {
      buildList();
    }
    S.idx = Math.max(0, Math.min(p.idx||0, Math.max(0,S.list.length-1)));
    if(p.mode==='exam' && p.exam){
      S.exam = { answers:p.exam.answers||{}, finished:!!p.exam.finished,
                 total:p.exam.total||S.list.length,
                 duration:p.exam.duration||45*60,
                 left:(p.exam.left==null?45*60:p.exam.left), timer:null };
      updateTimer();
      if(!S.exam.finished) startExamTimer();
    }
    render();
    showResumeBar(p);
  } else {
    buildList(); render();
  }
}
init();

Object.assign(window,{switchSub,confirmRestartExam,restartExam});
