import css from './style.css?inline';
import body from './body.html?raw';
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);document.body.innerHTML=body;

/* ================================================================
   摸鱼工作台 · 主逻辑
   数据全部存 localStorage(key: moyu_settings / moyu_slack)
================================================================ */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ---------- 设置 ---------- */
const DEFAULTS = {
  hotkey: '`', autoleave: false, edgeclick: true,
  title: '数据统计 | 内部系统', favicon: 'sys', disguise: 'word',
  offwork: '18:00', pomWork: 25, pomRest: 5, blur: false,
  dark: false, opacity: 100, bg: 'none', ghost: false,
  theme: 'light'
};
let S = Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem('moyu_settings')||'{}'));
function save(){ localStorage.setItem('moyu_settings', JSON.stringify(S)); }

/* ---------- toast ---------- */
let toastTimer;
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>t.classList.remove('show'), 1800);
}

/* ---------- 标签伪装 ---------- */
const FAVICON = {
  doc: c=>{ // Word 蓝色文档
    c.fillStyle='#2b579a'; c.fillRect(3,1,26,30); c.fillStyle='#fff';
    c.fillRect(7,8,18,3); c.fillRect(7,14,18,3); c.fillRect(7,20,12,3);
  },
  xls: c=>{ // Excel 绿色表格
    c.fillStyle='#217346'; c.fillRect(3,1,26,30);
    c.fillStyle='#fff'; c.fillRect(7,8,18,4); c.fillRect(7,16,18,4); c.fillRect(7,24,18,4);
  },
  code: c=>{ // VSCode 风格
    c.fillStyle='#1e1e1e'; c.fillRect(2,2,28,28);
    c.fillStyle='#519aba'; c.fillRect(6,8,8,3); c.fillRect(10,14,12,3); c.fillRect(6,20,14,3);
  },
  sys: c=>{ // 内部系统
    c.fillStyle='#4a5568'; c.fillRect(2,2,28,28);
    c.fillStyle='#a0aec0'; c.fillRect(6,8,8,8); c.fillRect(18,8,8,8); c.fillRect(6,20,20,3);
  }
};
function applyFavicon(){
  const cv = document.createElement('canvas'); cv.width = cv.height = 32;
  const c = cv.getContext('2d');
  c.clearRect(0,0,32,32); (FAVICON[S.favicon]||FAVICON.sys)(c);
  let link = document.querySelector("link[rel='icon']");
  if(!link){ link = document.createElement('link'); link.rel='icon'; document.head.appendChild(link); }
  link.href = cv.toDataURL('image/png');
}
function applyTitle(){
  document.title = S.title || DEFAULTS.title;
}

/* ---------- 页面切换 ---------- */
function switchPage(name){
  $$('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.page===name));
  $$('.page').forEach(p=>p.classList.toggle('active', p.id==='page-'+name));
}
$$('.tab-btn').forEach(b=>b.onclick=()=>switchPage(b.dataset.page));

/* ---------- 伪装页 ---------- */
const disRoot = $('#disguise');
function renderWord(){
  return `<div class="dis-word"><div class="ribbon">文件 开始 插入 设计 布局 引用 审阅 视图</div>
  <div class="page"><h1>2026年第三季度数据治理工作总结</h1>
  <p>本季度围绕数据语义层建设，完成了核心业务指标的统一建模与口径治理，累计梳理指标定义 128 项，覆盖交易、用户、供应链三大主题域，指标复用率较上季度提升 23%。</p>
  <p>在数据质量方面，建立了基于规则引擎的质量监控体系，配置完整性、一致性、及时性校验规则 56 条，异常告警平均响应时长缩短至 15 分钟以内，有效保障了下游报表的准确性。</p>
  <p>下阶段工作重点：一是推进指标血缘分析能力落地，实现变更影响自动评估；二是完善数据资产的权限管控体系，细化到字段级授权；三是开展语义层与智能问答链路的联调验证，提升自然语言查询的准确率。</p>
  <p>本报告涉及数据均已通过内部脱敏审查，仅供管理层决策参考。</p></div></div>`;
}
function renderExcel(){
  let rows='';
  const head = '<tr><th></th>' + 'ABCDEFGHIJ'.split('').map(c=>`<th>${c}</th>`).join('') + '</tr>';
  for(let r=1;r<=26;r++){
    rows += `<tr><td class="h">${r}</td>`;
    for(let cIdx=0;cIdx<10;cIdx++){
      let v='';
      if(r===1) v = ['日期','渠道','新增用户','活跃用户','付费用户','付费率','ARPPU','GMV','退货率','备注'][cIdx];
      else if(cIdx===0) v = `2026/10/${(r-1)}`;
      else if(cIdx===1) v = ['iOS','Android','Web','小程序','H5','PC客户端'][ (r+cIdx)%6 ];
      else if(cIdx===5) v = (2.1+((r*7+cIdx*3)%30)/10).toFixed(1)+'%';
      else if(cIdx===8) v = (((r*3+cIdx)%40)/10).toFixed(1)+'%';
      else v = String(1200+((r*137+cIdx*29)%8600));
      rows += `<td>${v}</td>`;
    }
    rows += '</tr>';
  }
  return `<div class="dis-excel"><div class="ribbon">自动保存 · 季度经营数据.xlsx · 已保存</div>
  <div class="fbar">fx &nbsp; SUM(D2:D27)</div>
  <table>${head}${rows}</table></div>`;
}
function renderCode(){
  const code = `<pre><span class="cm"># pipeline: daily_user_metrics_etl.py</span>
<span class="kw">import</span> pandas <span class="kw">as</span> pd
<span class="kw">from</span> datetime <span class="kw">import</span> date

<span class="kw">def</span> <span class="fn">load_source</span>(table: <span class="kw">str</span>, dt: date) -&gt; pd.DataFrame:
    df = pd.read_parquet(<span class="st">f"s3://dw/{table}/dt={dt}"</span>)
    df = df.dropna(subset=[<span class="st">"user_id"</span>])
    <span class="kw">return</span> df

<span class="kw">def</span> <span class="fn">build_metrics</span>(df: pd.DataFrame) -&gt; pd.DataFrame:
    g = df.groupby([<span class="st">"channel"</span>]).agg(
        active_users=(<span class="st">"user_id"</span>, <span class="st">"nunique"</span>),
        order_cnt=(<span class="st">"order_id"</span>, <span class="st">"count"</span>),
    )
    g[<span class="st">"arpu"</span>] = g[<span class="st">"gmv"</span>] / g[<span class="st">"active_users"</span>]
    <span class="kw">return</span> g.reset_index()

<span class="kw">if</span> __name__ == <span class="st">"__main__"</span>:
    raw = load_source(<span class="st">"ods_user_event"</span>, date.today())
    out = build_metrics(raw)
    out.to_csv(<span class="st">"metrics_daily.csv"</span>, index=<span class="kw">False</span>)
    print(out.head(<span class="nu">10</span>))
</pre>`;
  return `<div class="dis-code"><div class="bar">daily_user_metrics_etl.py — data-platform · Python 3.11</div>${code}</div>`;
}
function renderDash(){
  const bars = Array.from({length:12},(_,i)=>{
    const h = 30 + ((i*37)%70);
    return `<rect x="${20+i*46}" y="${130-h}" width="30" height="${h}" rx="3" fill="#4c8dff"/>`;
  }).join('');
  const pts = Array.from({length:12},(_,i)=>`${34+i*46},${118-((i*23)%60)}`).join(' ');
  return `<div class="dis-dash"><div class="ribbon">经营数据看板 · 2026-10 · 只读</div>
  <div class="cards">
    <div class="kcard"><span>今日GMV</span><b>¥ 284,650</b></div>
    <div class="kcard"><span>活跃用户</span><b>12,940</b></div>
    <div class="kcard"><span>付费转化</span><b>3.8%</b></div>
    <div class="kcard"><span>数据延迟</span><b>2 分钟</b></div>
  </div>
  <svg width="96%" height="160" style="background:#fff;border-radius:8px;margin:0 16px">
    ${bars}
    <polyline points="${pts}" fill="none" stroke="#e8684a" stroke-width="2"/>
  </svg></div>`;
}
const RENDERERS = { word: renderWord, excel: renderExcel, code: renderCode, dash: renderDash };
let lastRealTitle = document.title, lastRealFav = null;
function panic(custom){
  lastRealTitle = document.title;
  const kind = custom || S.disguise;
  disRoot.innerHTML = (RENDERERS[kind]||renderWord)();
  const back = document.createElement('button'); back.className='touch-return'; back.textContent='返回工作台'; back.addEventListener('click', unpanic); disRoot.appendChild(back);
  disRoot.classList.add('on');
  // 标签同时伪装
  const tmap = { word:'项目文档.docx - Word', excel:'季度经营数据.xlsx - Excel', code:'daily_user_metrics_etl.py - Visual Studio Code', dash:'经营看板 | 数据平台' };
  document.title = tmap[kind]||tmap.word;
  const fmap = { word:'doc', excel:'xls', code:'code', dash:'sys' };
  const old = S.favicon; S.favicon = fmap[kind]||'doc'; applyFavicon(); S.favicon = old;
}
function unpanic(){
  disRoot.classList.remove('on');
  applyTitle(); applyFavicon();
}

/* ---------- 老板键 ---------- */
function matchHotkey(e){
  const want = S.hotkey.toLowerCase();
  const combo = (e.ctrlKey?'ctrl+':'')+(e.altKey?'alt+':'')+(e.shiftKey?'shift+':'')+e.key.toLowerCase();
  return combo === want;
}
document.addEventListener('keydown', e=>{
  if(disRoot.classList.contains('on')){
    if(e.key==='Escape'){ e.preventDefault(); unpanic(); }
    return;
  }
  if(matchHotkey(e)){ e.preventDefault(); panic(); }
});
document.addEventListener('mouseout', e=>{
  if(S.autoleave && !disRoot.classList.contains('on') && !e.relatedTarget) panic();
});
document.addEventListener('click', e=>{
  if(!S.edgeclick || disRoot.classList.contains('on')) return;
  const edge = 26;
  const x=e.clientX, y=e.clientY, w=innerWidth, h=innerHeight;
  const nearEdge = (x<edge&&y<h*0.9)||(y<edge)||(x>w-edge&&y<h*0.9)||(y>h-edge&&y>h*0.35);
  const onUI = e.target.closest('#topbar,button,input,select,textarea,a,label,.card,svg,.switch');
  if(nearEdge && !onUI) panic();
});

/* ---------- 摸鱼计时（仅前台计时） ---------- */
let slack = parseInt(localStorage.getItem('moyu_slack')||'0',10); // 秒
const todayKey = new Date().toISOString().slice(0,10);
if(localStorage.getItem('moyu_slack_date')!==todayKey){ slack=0; localStorage.setItem('moyu_slack_date',todayKey); }
let lastTick = Date.now();
let lastMin = -1;
function fmtHMS(sec){
  const h=Math.floor(sec/3600), m=Math.floor(sec%3600/60), s=sec%60;
  return [h,m,s].map(n=>String(n).padStart(2,'0')).join(':');
}
setInterval(()=>{
  const now = Date.now();
  const visible = document.visibilityState==='visible' && !disRoot.classList.contains('on');
  if(visible){
    slack += Math.round((now-lastTick)/1000);
    localStorage.setItem('moyu_slack', slack);
    const hist = JSON.parse(localStorage.getItem('moyu_hist')||'{}');
    hist[todayKey] = slack;
    localStorage.setItem('moyu_hist', JSON.stringify(hist));
    const curMin = Math.floor(slack/60);
    if(curMin!==lastMin){ lastMin = curMin; renderWeek(); }
  }
  lastTick = now;
  $('#stat-slack').textContent = fmtHMS(slack);
},1000);

/* ---------- 下班倒计时 ---------- */
function offworkTick(){
  const [hh,mm] = (S.offwork||'18:00').split(':').map(Number);
  const now = new Date(); const end = new Date(); end.setHours(hh,mm,0,0);
  let diff = end - now;
  if(diff<0) diff += 24*3600*1000;
  const t = new Date(diff).toISOString().substr(11,8);
  $('#stat-offwork').textContent = t;
  $('#offwork-big').textContent = t;
}
setInterval(offworkTick,1000); offworkTick();

/* ---------- 番茄钟 ---------- */
let pom = { running:false, phase:'work', left:S.pomWork*60, last:0 };
function pomRender(){
  const m = Math.floor(pom.left/60), s = pom.left%60;
  $('#pom-display').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  $('#stat-pom').textContent = $('#pom-display').textContent;
  $('#pom-phase').textContent = pom.running ? (pom.phase==='work'?'专注中 · 请勿打扰':'休息一下') : (pom.phase==='work'?'专注模式':'休息模式');
  $('#stat-pom-phase').textContent = pom.running ? (pom.phase==='work'?'专注中':'休息中') : '就绪';
}
setInterval(()=>{
  if(!pom.running) return;
  const visible = document.visibilityState==='visible';
  if(visible) pom.left--;
  if(pom.left<=0){
    pom.phase = pom.phase==='work'?'rest':'work';
    pom.left = (pom.phase==='work'?S.pomWork:S.pomRest)*60;
    toast(pom.phase==='work'?'休息结束，继续专注！':'番茄完成，休息一下 ☕');
  }
  pomRender();
},1000);
$('#pom-start').onclick = ()=>{ pom.running=!pom.running; $('#pom-start').textContent=pom.running?'暂停':'开始'; pomRender(); };
$('#pom-reset').onclick = ()=>{ pom.running=false; pom.phase='work'; pom.left=S.pomWork*60; $('#pom-start').textContent='开始'; pomRender(); };

/* ---------- 资讯内容（本地内置，无外部请求） ---------- */
const FEEDS = {
  news: [
    ['科技','研究显示：适当的微休息可提升 13% 的持续专注力，每工作 50 分钟短暂放松效果最佳。'],
    ['职场','多家公司试点「无会议周三」，员工平均可支配整块时间增加约 4 小时。'],
    ['数据','2026 年企业数据治理投入持续增长，语义层与数据质量工具成为采购热点。'],
    ['效率','键盘快捷键熟练使用者的平均操作耗时比鼠标用户低 32%。'],
    ['健康','久坐提醒研究：每 45 分钟站立活动 2 分钟，可显著降低午后疲劳感。'],
    ['AI','调查显示：善用 AI 工具的从业者，每周可节省约 6 小时重复性工作——省下来的时间用来做什么，是个哲学问题。'],
    ['生活','咖啡研究新结论：上午 10 点到中午是皮质醇自然高峰后的最佳饮用窗口，提神效率最高。']
  ],
  joke: [
    ['职场梗','产品经理说需求很简单，就说一句：「把数据变好看一点」。我把背景换成了渐变色，他沉默了。'],
    ['职场梗','面试官：你最大的缺点是什么？我：过于诚实。面试官：我不觉得这是缺点。我：我不在乎你怎么觉得。'],
    ['程序员','代码能跑的时候不要动它。它现在能跑，说明它和宇宙达成了某种脆弱的平衡。'],
    ['职场梗','老板：这个项目工期紧。我：没问题，我们有三宝：裁剪需求、加班、和甩锅给排期。'],
    ['程序员','所谓重构，就是把一段你看不懂的代码，改写成一段别人看不懂的代码，然后说这是技术债的偿还。'],
    ['职场梗','周一的心情：不是不想工作，是身体在执行上周五就提交的离职申请——精神离职。'],
    ['程序员','Bug 的两种状态：能复现的，和「你来了它就不出现」的。后者通常在我下班前一分钟变成前者。']
  ],
  fact: [
    ['冷知识','蜂蜜是极少数几乎不会变质的食物之一，考古学家曾发现三千年前的蜂蜜仍可食用。'],
    ['冷知识','章鱼有三颗心脏，其中两颗负责给鳃供血，一颗负责全身循环。'],
    ['冷知识',' Word 里的「宋体」并不是最早的印刷字体，宋代活字印刷常用的是仿宋体前身的手写体。'],
    ['冷知识','光从太阳到地球需要约 8 分 20 秒，你看到的永远是 8 分钟前的太阳。'],
    ['冷知识','Excel 的行列总数是 17,179,869,184 个单元格（16384 列 × 1048576 行）。'],
    ['冷知识','「随机」很难：让人在 1-10 里随便说一个数，最常被说出口的是 7——真随机数发生器反而做不到这一点。'],
    ['冷知识','键盘上 QWERTY 排列最初是为了「降低打字速度」防止老式打字机卡键，结果成了百年标准。']
  ],
  history: [
    ['历史','唐朝的「下班」：唐代官员上午点卯，午后即可处理私事，一日两餐制下的工作节奏比想象中松弛。'],
    ['历史','古罗马的午睡文化「sextario」：正午第六小时停工休息，全城店铺关门，是制度化的午休。'],
    ['历史','「摸鱼」一词的出处：源自成语「浑水摸鱼」，原为兵法三十六计之一，指趁乱获取利益。'],
    ['历史','宋代公务员休假：一年法定假日约 76 天，加上旬休（每十天一天），假期比例接近三分之一。'],
    ['历史','达芬奇的多任务作息：相传采用「多相睡眠」，每 4 小时小睡 15 分钟，把更多时间留给创作。'],
    ['历史','「带薪如厕」的鼻祖：古罗马公共厕所不仅是卫生设施，还是社交场所，市民们在此谈天说地，一坐就是半天。'],
    ['历史','工业革命前的「圣周一」：欧洲工匠流行在周一休工，故有 Saint Monday 之说——人类摸鱼史源远流长。']
  ],
  techdoc: [
    ['技术分享','《基于规则引擎的数据质量校验设计》：将完整性、唯一性、一致性校验抽象为规则 DSL，配合采样率控制执行成本，可在低峰期完成全表扫描。'],
    ['技术分享','《语义层在指标治理中的实践》：通过统一指标定义（MetricFlow 模型），将口径冲突从「事后对数」前置为「建模时发现」，减少 70% 的口径争议。'],
    ['技术分享','《NL2SQL 的准确率陷阱》：规则引擎负责拦截 80% 的高频简单查询，LLM 只处理长尾复杂问题，混合架构比纯大模型方案成本低一个量级。'],
    ['技术分享','《告警风暴治理三原则》：分级、聚合、静默窗口。任何未设静默窗口的告警系统，最终都会变成被人忽略的背景噪音。'],
    ['技术分享','《数据看板的克制美学》：一屏不超过 5 个核心指标，次要信息全部折叠。看板不是仪表盘的堆砌，是决策路径的预设。'],
    ['技术分享','《为什么你的数仓总是延迟》：80% 的 ETL 延迟来自上游 schema 变更未通知，数据契约（Data Contract）是最低成本的解法。']
  ]
};
let currentFeed = 'news';
function renderFeed(kind, shuffle){
  currentFeed = kind;
  let list = [...FEEDS[kind]];
  if(shuffle) list.sort(()=>Math.random()-0.5);
  $('#feed-list').innerHTML = list.map(([tag,text])=>
    `<div class="feed-item"><span class="tag">${tag}</span><p>${text}</p></div>`).join('');
}
$$('.feed-tab').forEach(b=>b.onclick=()=>{
  $$('.feed-tab').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  renderFeed(b.dataset.feed);
});

/* ---------- 工具箱 ---------- */

function calculate(input){
  let i=0; const ws=()=>{while(/\s/.test(input[i]||'')&&i<input.length)i++};
  function atom(){ws();if(input[i]==='+'||input[i]==='-'){const sign=input[i++];return sign==='-'?-atom():atom()}if(input[i]==='('){i++;const v=sum();ws();if(input[i++]!==')')throw Error('括号');return v}const m=input.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(!m)throw Error('数值');i+=m[0].length;return Number(m[0])}
  function product(){let v=atom();while(true){ws();const op=input[i];if(op!=='*'&&op!=='/')return v;i++;const n=atom();v=op==='*'?v*n:v/n}}
  function sum(){let v=product();while(true){ws();const op=input[i];if(op!=='+'&&op!=='-')return v;i++;const n=product();v=op==='+'?v+n:v-n}}
  const v=sum();ws();if(i!==input.length)throw Error('表达式');return v
}

function doCalc(){
  const expr = $('#calc-in').value.replace(/[^0-9+\-*/().%\s]/g,'');
  try{
    if(!expr.trim()) return;
    const val = calculate(expr.replace(/%/g,'/100'));
    $('#calc-out').textContent = `${expr} = ${val}`;
  }catch(e){ $('#calc-out').textContent = '表达式有误，请检查格式'; }
}
$('#calc-in').addEventListener('keydown',e=>{ if(e.key==='Enter') doCalc(); });

const UNITS = {
  len: { m:1, km:1000, cm:0.01, mm:0.001, mi:1609.344, ft:0.3048, in:0.0254, label:'长度' },
  wt:  { kg:1, g:0.001, t:1000, lb:0.45359237, oz:0.0283495, label:'重量' },
  tmp: { '°C':1, '°F':1, K:1, label:'温度' }
};
function fillUnitFrom(){
  const cat = $('#unit-cat').value;
  $('#unit-from').innerHTML = Object.keys(UNITS[cat]).filter(k=>k!=='label')
    .map(u=>`<option>${u}</option>`).join('');
}
$('#unit-cat').onchange = fillUnitFrom; fillUnitFrom();
function doUnit(){
  const cat = $('#unit-cat').value, v = parseFloat($('#unit-in').value), u = $('#unit-from').value;
  if(isNaN(v)){ $('#unit-out').textContent='请输入数值'; return; }
  let out='';
  if(cat==='tmp'){
    let c = u==='°C'?v : u==='°F'?(v-32)*5/9 : v-273.15;
    out = `摄氏 ${c.toFixed(2)} °C\n华氏 ${(c*9/5+32).toFixed(2)} °F\n开尔文 ${(c+273.15).toFixed(2)} K`;
  } else {
    const base = v * UNITS[cat][u];
    out = Object.keys(UNITS[cat]).filter(k=>k!=='label')
      .map(k=>`${k}: ${base/UNITS[cat][k]}`).join('\n');
  }
  $('#unit-out').textContent = out;
}
function doJson(indent){
  try{
    const obj = JSON.parse($('#json-in').value);
    $('#json-out').textContent = indent? JSON.stringify(obj,null,indent) : JSON.stringify(obj);
    $('#json-out').style.color = '';
  }catch(e){ $('#json-out').textContent = '✗ JSON 解析失败：'+e.message; }
}
function doB64(mode){
  try{
    const v = $('#b64-in').value;
    $('#b64-out').textContent = mode==='enc'
      ? btoa(String.fromCharCode(...new TextEncoder().encode(v)))
      : new TextDecoder().decode(Uint8Array.from(atob(v.trim()),c=>c.charCodeAt(0)));
  }catch(e){ $('#b64-out').textContent='转换失败：'+e.message; }
}
function doPwd(){
  const len = Math.min(64,Math.max(6,+$('#pwd-len').value||16));
  let chars='abcdefghijkmnopqrstuvwxyz';
  if($('#pwd-up').checked) chars+='ABCDEFGHJKLMNPQRSTUVWXYZ';
  if($('#pwd-num').checked) chars+='23456789';
  if($('#pwd-sym').checked) chars+='!@#$%^&*()-_=+[]{};:,.?';
  const arr = crypto.getRandomValues(new Uint32Array(len));
  $('#pwd-out').textContent = Array.from(arr,n=>chars[n%chars.length]).join('');
}
function tsNow(){ $('#ts-now').textContent = `秒: ${Math.floor(Date.now()/1000)}\n毫秒: ${Date.now()}`; }
tsNow(); setInterval(tsNow,1000);
function tsToDate(){
  let v = $('#ts-in').value.trim(); if(!v) return;
  if(v.length===10) v += '000';
  const d = new Date(+v);
  $('#ts-out').textContent = isNaN(d)?'无效时间戳':d.toLocaleString('zh-CN',{hour12:false});
}
function dateToTs(){
  const v = $('#dt-in').value; if(!v) return;
  const t = new Date(v).getTime();
  $('#dt-out').textContent = `秒: ${Math.floor(t/1000)}\n毫秒: ${t}`;
}
$$('.tool-tab').forEach(b=>b.onclick=()=>{
  $$('.tool-tab').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  $$('.tool-box').forEach(t=>t.classList.toggle('active', t.id==='tool-'+b.dataset.tool));
});

/* ---------- 设置绑定 ---------- */
function bindSwitch(id, key, after){
  const el = $(id); el.checked = !!S[key];
  el.onchange = ()=>{ S[key]=el.checked; save(); after&&after(); };
}
function bindInput(id, key, after){
  const el = $(id); el.value = S[key];
  el.onchange = ()=>{ S[key]=el.value; save(); after&&after(); };
}
bindInput('#set-title','title',applyTitle);
$('#set-title').oninput = e=>{ S.title=e.target.value; save(); applyTitle(); };
bindInput('#set-favicon','favicon',applyFavicon);
bindInput('#set-disguise','disguise');
bindSwitch('#set-autoleave','autoleave');
bindSwitch('#set-edgeclick','edgeclick');
bindInput('#set-offwork','offwork',offworkTick);
bindInput('#set-pom-work','pomWork',()=>{
  if(!pom.running&&pom.phase==='work'){ pom.left=S.pomWork*60; pomRender(); }
  $('#hint-work').textContent=S.pomWork;
});
bindInput('#set-pom-rest','pomRest',()=>{
  if(!pom.running&&pom.phase==='rest'){ pom.left=S.pomRest*60; }
  $('#hint-rest').textContent=S.pomRest;
});
bindSwitch('#set-blur','blur',()=>{
  ['#stat-offwork','#offwork-big'].forEach(s=>{
    $(s).classList.toggle('blur-num', S.blur);
  });
});
bindSwitch('#set-dark','dark',()=>{
  document.documentElement.dataset.theme = S.dark?'dark':'light';
  $('#btn-theme').textContent = S.dark?'☀️':'🌙';
});
bindInput('#set-opacity','opacity',()=>{
  $('#app').style.opacity = S.opacity/100;
  $('#opacity-val').textContent = S.opacity+'%';
});
bindInput('#set-bg','bg',()=>{
  document.body.style.backgroundImage = S.bg==='code'
    ? 'repeating-linear-gradient(0deg,transparent,transparent 21px,rgba(120,140,160,.06) 22px)'
    : S.bg==='grid'
    ? 'repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(120,140,160,.08) 28px),repeating-linear-gradient(90deg,transparent,transparent 27px,rgba(120,140,160,.08) 28px)'
    : 'none';
});
/* 防挂机假光标 */
let ghostTimer;
function ghostLoop(){
  clearInterval(ghostTimer);
  if(!S.ghost) return;
  const gc = $('#ghost-cursor'); gc.classList.add('on');
  ghostTimer = setInterval(()=>{
    const x = 80+Math.random()*(innerWidth-160);
    const y = 80+Math.random()*(innerHeight-160);
    gc.style.transition='left 1.2s ease,top 1.2s ease';
    gc.style.left=x+'px'; gc.style.top=y+'px';
  }, 2400);
}
bindSwitch('#set-ghost','ghost',ghostLoop);

/* 老板键录制 */
$('#set-hotkey').value = S.hotkey;
$('#set-hotkey').onclick = function(){
  this.value='按下按键…';
  const rec = e=>{
    e.preventDefault(); e.stopPropagation();
    const parts=[]; if(e.ctrlKey)parts.push('ctrl'); if(e.altKey)parts.push('alt'); if(e.shiftKey)parts.push('shift');
    if(['Control','Alt','Shift','Meta'].includes(e.key)){ this.value='再按一个普通键'; return; }
    parts.push(e.key.toLowerCase());
    S.hotkey = parts.join('+'); save();
    this.value = S.hotkey;
    $('#hotkey-hint').textContent = $('#hotkey-hint2').textContent = S.hotkey;
    document.removeEventListener('keydown',rec,true);
  };
  document.addEventListener('keydown',rec,true);
};
if(S.hotkey){ $('#hotkey-hint').textContent=$('#hotkey-hint2').textContent=S.hotkey; }

$('#btn-theme').onclick = ()=>{
  S.dark=!S.dark; save(); $('#set-dark').checked=S.dark;
  document.documentElement.dataset.theme=S.dark?'dark':'light';
  $('#btn-theme').textContent=S.dark?'☀️':'🌙';
};

function resetAll(){
  if(confirm('确定清空全部本地数据（设置与摸鱼计时）？')){
    localStorage.removeItem('moyu_settings'); localStorage.removeItem('moyu_slack'); localStorage.removeItem('moyu_slack_date');
    location.reload();
  }
}

/* ---------- 概览：时钟 / 周末倒计时 / 贴士 / 趋势图 ---------- */
const WD = ['周日','周一','周二','周三','周四','周五','周六'];
function clockTick(){
  const n = new Date();
  $('#stat-clock').textContent = n.toLocaleTimeString('zh-CN',{hour12:false});
  $('#stat-date').textContent = `${n.getMonth()+1}月${n.getDate()}日 ${WD[n.getDay()]}`;
  const days = (6 - n.getDay() + 7) % 7;
  $('#stat-weekend').textContent = days===0 ? '今天是周末 🎉' : `还差 ${days} 天到周末`;
}
const TIPS = [
  '摸鱼的最高境界是让摸鱼看起来像工作：开一个终端窗口，随便跑点什么都行。',
  '善用「分屏」：左边真的代码，右边摸鱼页面，视线摆动幅度不超过 15 度。',
  '听到脚步声先别慌，Alt+Tab 之前确认浏览器标签标题已经伪装好。',
  '午休后的第一小时是摸鱼黄金期：老板在开会，同事在吃饭消化。',
  '把摸鱼页面的快捷键设成和输入法切换不冲突的键，紧急时刻一次到位。',
  '番茄钟不只是专注工具：休息的 5 分钟光明正大摸鱼，心安理得。',
  '真在工作时也别忘了摸鱼：适当的微休息能让下午的效率更高，这是有研究背书的。',
  '周五下午的摸鱼效率最低——心早就飞了，不如早点收工。',
  '保持桌面整洁的人更容易摸鱼：窗口切换快，不容易手忙脚乱露出破绽。',
  '会摸鱼的人也在成长：看的段子写进周报是幽默感，看的冷知识是谈资。'
];
function newTip(){ $('#tip-line').textContent = TIPS[Math.floor(Math.random()*TIPS.length)]; }
function newQuote(){
  const all = [...FEEDS.joke, ...FEEDS.history, ...FEEDS.fact];
  $('#daily-quote').textContent = all[Math.floor(Math.random()*all.length)][1];
}
function renderWeek(){
  const box = $('#week-chart'); if(!box) return;
  const hist = JSON.parse(localStorage.getItem('moyu_hist')||'{}');
  const days = [];
  for(let i=6;i>=0;i--){
    const dt = new Date(); dt.setDate(dt.getDate()-i);
    const k = dt.toISOString().slice(0,10);
    days.push({ sec: hist[k]||0, label: WD[dt.getDay()] });
  }
  const max = Math.max(...days.map(d=>d.sec), 60);
  const today = new Date().toISOString().slice(0,10);
  box.innerHTML = days.map(d=>{
    const h = Math.max(4, Math.round(d.sec/max*90));
    const isToday = days.indexOf(d)===6;
    const color = isToday ? 'var(--accent)' : 'var(--line)';
    const tip = d.sec>=3600 ? (d.sec/3600).toFixed(1)+'小时' : Math.floor(d.sec/60)+'分钟';
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;height:100%">
      <div class="sub" style="font-size:10px">${d.sec>0?tip:''}</div>
      <div title="${tip}" style="width:64%;height:${h}px;background:${color};border-radius:6px 6px 0 0;transition:height .3s"></div>
      <div class="sub" style="font-size:11px;${isToday?'color:var(--accent)':''}">${d.label}</div>
    </div>`;
  }).join('');
}

/* ---------- 初始化 ---------- */
document.documentElement.dataset.theme = S.dark?'dark':'light';
$('#btn-theme').textContent = S.dark?'☀️':'🌙';
$('#app').style.opacity = S.opacity/100;
$('#opacity-val').textContent = S.opacity+'%';
$('#hint-work').textContent=S.pomWork; $('#hint-rest').textContent=S.pomRest;
['#stat-offwork','#offwork-big'].forEach(s=>$(s).classList.toggle('blur-num',S.blur));
applyTitle(); applyFavicon(); pomRender(); renderFeed('news');
newQuote(); newTip(); renderWeek();
clockTick(); setInterval(clockTick,1000);
if(S.ghost) ghostLoop();

Object.assign(window,{panic,switchPage,doCalc,doUnit,doJson,doB64,doPwd,dateToTs,tsToDate,tsNow,newQuote,newTip,resetAll,renderFeed});Object.defineProperty(window,'currentFeed',{get:()=>currentFeed});

const handlers={"dateToTs()":()=>dateToTs(),"doB64('dec')":()=>doB64('dec'),"doB64('enc')":()=>doB64('enc'),"doCalc()":()=>doCalc(),"doJson(0)":()=>doJson(0),"doJson(2)":()=>doJson(2),"doJson(4)":()=>doJson(4),"doPwd()":()=>doPwd(),"doUnit()":()=>doUnit(),"newQuote()":()=>newQuote(),"newTip()":()=>newTip(),"panic('code')":()=>panic('code'),"panic('dash')":()=>panic('dash'),"panic('excel')":()=>panic('excel'),"panic('word')":()=>panic('word'),"renderFeed(currentFeed,true)":()=>renderFeed(currentFeed,true),"resetAll()":()=>resetAll(),"switchPage('timer')":()=>switchPage('timer'),"switchPage('tools')":()=>switchPage('tools'),"tsNow()":()=>tsNow(),"tsToDate()":()=>tsToDate(),"document.getElementById('calc-in').value='';document.getElementById('calc-out').textContent=''":()=>{$('#calc-in').value='';$('#calc-out').textContent=''}};
document.querySelectorAll('[onclick]').forEach(el=>{const action=el.getAttribute('onclick');el.removeAttribute('onclick');if(handlers[action])el.addEventListener('click',handlers[action]);});
