
"use strict";

/* ============ 人格定义 ============ */
const TYPES = {
  wrapper: {
    id:'wrapper', name:'野生调包侠', en:'THE WILD WRAPPER', emoji:'📦',
    color:'#a78bfa', c2:'#7c5cff',
    tag:'能装就装，绝不手写',
    desc:'你的座右铭是「不要重复造轮子」，哪怕这个轮子是方形的。github 星数是你唯一的技术选型标准，package.json 长到能当简历用。安装依赖的快感，远大于真正解决问题的快感。',
    quote:'没有什么是 npm install 解决不了的，如果有，那就再装一个。',
    traits:['造轮子厌恶症','依赖收集癖','文档搬运工'],
    partner:'类型原教旨主义者', enemy:'祖传代码守墓人'
  },
  mystic: {
    id:'mystic', name:'玄学调参师', en:'THE VIBE TUNER', emoji:'🔮',
    color:'#f472b6', c2:'#db2777',
    tag:'重启一下，说不定就好了',
    desc:'你相信代码是有灵性的。改一行、跑一次、看结果，科学实验般地玄学调试。你解决过的 bug 里有 60% 不知道为什么就好了，但你从不追问——怕它醒过来。',
    quote:'能跑起来的代码就是好代码，别问，问就是玄学。',
    traits:['二分注释法','重启依赖症','唯结果论'],
    partner:'稳健后端人', enemy:'类型原教旨主义者'
  },
  backend: {
    id:'backend', name:'稳健后端人', en:'THE ROCK-SOLID BACKEND', emoji:'🛡️',
    color:'#34d399', c2:'#059669',
    tag:'先加监控，再谈上线',
    desc:'你是团队的最后一道防线。日志、监控、灰度、回滚预案，一样都不能少。别人看见的是你过度谨慎，你看见的是凌晨三点的告警电话。你说得最多的话是「这里的边界情况没处理」。',
    quote:'没有监控的功能，等于没有上线。',
    traits:['边界狂魔','日志齐全','敬畏生产'],
    partner:'前端炼金术士', enemy:'摆烂摸鱼王'
  },
  typepurist: {
    id:'typepurist', name:'类型原教旨主义者', en:'THE TYPE PURIST', emoji:'🧬',
    color:'#22d3ee', c2:'#0891b2',
    tag:'any 是原罪',
    desc:'你相信编译时能抓住的错误，不该留到运行时。泛型是你表达爱意的方式，类型体操是你的娱乐活动。看到 any 你会生理不适，看到别人写 as 你会沉默三秒。',
    quote:'如果类型系统检查过了，那它就是对的——大概吧。',
    traits:['泛型爱好者','编译期洁癖','IDE 重度依赖'],
    partner:'重构狂战士', enemy:'玄学调参师'
  },
  refactor: {
    id:'refactor', name:'重构狂战士', en:'THE REFACTOR BERSERKER', emoji:'⚔️',
    color:'#fb923c', c2:'#ea580c',
    tag:'这段代码，我能写得更好',
    desc:'你无法忍受任何一段「不够优雅」的代码。说好只改一行，最后 PR 里有 37 个文件。你坚信整洁的代码是一种道德义务，虽然产品经理并不这么认为。',
    quote:'我不是在拖延需求，我是在偿还技术债。',
    traits:['PR 巨大化','命名纠结症','债务清算人'],
    partner:'类型原教旨主义者', enemy:'祖传代码守墓人'
  },
  legacy: {
    id:'legacy', name:'祖传代码守墓人', en:'THE LEGACY CUSTODIAN', emoji:'🪦',
    color:'#94a3b8', c2:'#64748b',
    tag:'能跑就别动，此处有龙',
    desc:'你维护着公司里最老、最赚钱、也最没人敢碰的那套系统。你知道每一个 if 背后的血泪史，也知道为什么那个魔数不能改。你是活着的文档，也是人才的黑洞。',
    quote:'这段代码跑了八年了，它比你入职还早，尊重一下。',
    traits:['历史百科','修改零容忍','口头传承'],
    partner:'稳健后端人', enemy:'重构狂战士'
  },
  frontend: {
    id:'frontend', name:'前端炼金术士', en:'THE FRONTEND ALCHEMIST', emoji:'✨',
    color:'#facc15', c2:'#f59e0b',
    tag:'居中对齐是一种修行',
    desc:'你在 CSS 的混沌中炼金，能用三行代码让元素垂直居中，也能为一个像素和设计师对线两小时。你对动画和交互有近乎偏执的追求，尽管后端接口还没好。',
    quote:'视觉还原度差 1px，我晚上睡不着。',
    traits:['像素级还原','动画偏执','Mock 数据大师'],
    partner:'稳健后端人', enemy:'摆烂摸鱼王'
  },
  slacker: {
    id:'slacker', name:'摆烂摸鱼王', en:'MASTER OF GIT BLAME', emoji:'🐟',
    color:'#60a5fa', c2:'#3b82f6',
    tag:'LGTM，先合再说',
    desc:'你深刻理解「过早优化是万恶之源」，也深刻理解「能推给别人就别自己扛」。你的 PR 描述永远只有三个字，你的 Code Review 永远只有一个 LGTM。但你从不加班。',
    quote:'代码能跑就行，人生还要继续。',
    traits:['LGTM 文学','甩锅艺术家','准时下班'],
    partner:'野生调包侠', enemy:'重构狂战士'
  }
};

/* ============ 题目 ============ */
const QUESTIONS = [
  { tag:'Q1 · 生产事故', text:'线上服务凌晨三点挂了，你的第一反应是？', opts:[
    {t:'打开监控面板和日志，按时间线定位根因', k:'backend'},
    {t:'先重启一下，说不定自己就好了', k:'mystic'},
    {t:'拉个群，@ 一下最近提交过代码的人', k:'slacker'},
    {t:'边修边骂：这破代码到底是谁写的', k:'refactor'}
  ]},
  { tag:'Q2 · 新需求', text:'接到一个从没做过的需求，你的第一步是？', opts:[
    {t:'搜现成的库，能装就绝不自己写', k:'wrapper'},
    {t:'先把类型定义和接口 schema 定清楚', k:'typepurist'},
    {t:'先糊个原型跑起来看看效果', k:'frontend'},
    {t:'先问清楚边界和异常流程，再列方案', k:'backend'}
  ]},
  { tag:'Q3 · 祖传代码', text:'面对一个 800 行的「祖传函数」，你会？', opts:[
    {t:'能跑就别碰，在外面加个 try-catch 就行', k:'legacy'},
    {t:'立刻拆成 20 个纯函数，全部重写一遍', k:'refactor'},
    {t:'先补测试，再一小步一小步地重构', k:'backend'},
    {t:'加一行注释：「此处有龙，慎入」', k:'mystic'}
  ]},
  { tag:'Q4 · 调试', text:'你的调试三板斧是？', opts:[
    {t:'console.log 打印，一直打印到天荒地老', k:'frontend'},
    {t:'断点单步，逐帧盯变量和调用栈', k:'typepurist'},
    {t:'二分注释法，砍掉一半再说', k:'mystic'},
    {t:'重启、清缓存、换台机器再试试', k:'slacker'}
  ]},
  { tag:'Q5 · 依赖管理', text:'依赖爆出一堆更新警告，你怎么办？', opts:[
    {t:'全升到最新版，追新是我的浪漫', k:'frontend'},
    {t:'永不升级，跑得好好的动它干嘛', k:'legacy'},
    {t:'看完 changelog，灰度验证再全量', k:'backend'},
    {t:'等两天，让别人先去踩坑', k:'wrapper'}
  ]},
  { tag:'Q6 · Code Review', text:'代码评审时，你说得最多的一句话是？', opts:[
    {t:'「这个命名能不能再改改」', k:'typepurist'},
    {t:'「LGTM 👍」', k:'slacker'},
    {t:'「这里的边界情况没处理」', k:'backend'},
    {t:'「这段我好像写过，抽个公共方法吧」', k:'refactor'}
  ]},
  { tag:'Q7 · 关于测试', text:'关于写测试，你的真实想法是？', opts:[
    {t:'先写测试再写实现，TDD 是信仰', k:'typepurist'},
    {t:'上线前补几个 happy path 就够了', k:'wrapper'},
    {t:'我在浏览器里点过了，那就算测过', k:'frontend'},
    {t:'有 QA，专业的事交给专业的人', k:'slacker'}
  ]},
  { tag:'Q8 · 开发环境', text:'你的主力开发环境是？', opts:[
    {t:'VS Code + 一堆插件，能用鼠标绝不背快捷键', k:'wrapper'},
    {t:'Neovim 全键盘流，鼠标是邪恶的', k:'typepurist'},
    {t:'JetBrains 全家桶，重构全靠 IDE', k:'refactor'},
    {t:'能跑就行，记事本我也写过', k:'legacy'}
  ]},
  { tag:'Q9 · 临门一脚', text:'周五 17:00，产品说「就改一点点，很简单」，你？', opts:[
    {t:'直接改，五分钟的事，改完就跑', k:'slacker'},
    {t:'先评估影响面，列一份回归清单', k:'backend'},
    {t:'改，顺便把周围的代码也重构了', k:'refactor'},
    {t:'先确认「真的只有一点点吗」，再动手', k:'legacy'}
  ]},
  { tag:'Q10 · 注释', text:'你的代码注释风格更接近？', opts:[
    {t:'好代码自解释，注释是失败的表征', k:'typepurist'},
    {t:'只写「为什么」，绝不写「做了什么」', k:'backend'},
    {t:'写得极细，像给三个月后的自己写遗书', k:'legacy'},
    {t:'注释里塞满 TODO 和表情包', k:'frontend'}
  ]}
];

/* ============ 状态 ============ */
const state = { i:0, scores:{}, order:[], result:null, isFriend:false };
Object.keys(TYPES).forEach(k => state.scores[k] = 0);

const $ = id => document.getElementById(id);
const screens = { home:$('s-home'), quiz:$('s-quiz'), load:$('s-load'), res:$('s-res') };
function show(name){
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
}
function toast(msg){
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tm);
  t._tm = setTimeout(()=>t.classList.remove('show'), 2000);
}

/* ============ 答题流程 ============ */
function startQuiz(){
  state.i = 0;
  state.order = [];
  Object.keys(state.scores).forEach(k => state.scores[k] = 0);
  renderQ();
  show('quiz');
}
function renderQ(){
  const q = QUESTIONS[state.i];
  $('qTag').textContent = q.tag;
  $('qText').textContent = q.text;
  $('qNow').textContent = state.i + 1;
  $('pgBar').style.width = (state.i / QUESTIONS.length * 100) + '%';
  const box = $('qOpts');
  box.innerHTML = '';
  q.opts.forEach((o, idx) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.innerHTML = '<span class="key">' + (idx+1) + '</span><span>' + o.t + '</span>';
    b.onclick = () => pick(idx, b);
    box.appendChild(b);
  });
}
function pick(idx, btn){
  if (state.picking) return;
  state.picking = true;
  btn.dataset.done = '1';
  btn.classList.add('picked');
  [...$('qOpts').children].forEach(el => { if (el !== btn) el.classList.add('dim'); });
  state.order.push(QUESTIONS[state.i].opts[idx].k);
  state.scores[QUESTIONS[state.i].opts[idx].k]++;
  setTimeout(() => {
    state.i++;
    state.picking = false;
    if (state.i < QUESTIONS.length) renderQ();
    else finish();
  }, 260);
}
document.addEventListener('keydown', e => {
  if (!screens.quiz.classList.contains('active')) return;
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 4) {
    const els = $('qOpts').children;
    if (els[n-1]) els[n-1].click();
  }
});

/* ============ 计算 & 出结果 ============ */
const LOAD_LINES = [
  '正在扫描你的 git 提交记录…',
  '正在统计 console.log 密度…',
  '正在评估你的 PR 平均体积…',
  '正在检测 package.json 依赖数量…',
  '正在比对 8 种人格原型…'
];
function finish(){
  show('load');
  let i = 0;
  const tick = setInterval(() => {
    $('loadTxt').textContent = LOAD_LINES[i % LOAD_LINES.length];
    i++;
  }, 430);
  setTimeout(() => {
    clearInterval(tick);
    compute();
  }, 2200);
}
function compute(){
  const arr = Object.keys(state.scores).map(k => ({ id:k, v:state.scores[k] })).sort((a,b) => b.v - a.v);
  state.result = { top:arr[0], second:arr[1], all:arr };
  drawAndShow(state.result.top.id, false);
}

/* ============ Canvas 卡片 ============ */
function hex2rgb(h){ const n = parseInt(h.slice(1),16); return [(n>>16)&255,(n>>8)&255,n&255]; }
function rgba(h, a){ const [r,g,b] = hex2rgb(h); return 'rgba('+r+','+g+','+b+','+a+')'; }
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
function wrap(ctx, text, maxW){
  const out = []; let line = '';
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxW && line) { out.push(line); line = ch; }
    else line += ch;
  }
  if (line) out.push(line);
  return out;
}

// 检测当前环境能否渲染彩色 emoji（headless / 精简字体环境会画成空白）
function canRenderEmoji(emoji, font){
  try{
    const t = document.createElement('canvas');
    t.width = 72; t.height = 72;
    const tx = t.getContext('2d', { willReadFrequently:true });
    tx.font = '52px ' + font;
    tx.textAlign = 'center'; tx.textBaseline = 'middle';
    tx.fillStyle = '#fff';
    tx.fillText(emoji, 36, 36);
    const d = tx.getImageData(0, 0, 72, 72).data;
    let any = 0, colored = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i+3] > 12) {
        any++;
        const mx = Math.max(d[i], d[i+1], d[i+2]), mn = Math.min(d[i], d[i+1], d[i+2]);
        if (mx - mn > 28) colored++;
      }
    }
    return any > 30 && colored > 15;
  }catch(e){ return false; }
}

function drawCard(typeId, opts){
  const T = TYPES[typeId];
  const W = 840, H = 1180, S = 2;
  const cv = document.createElement('canvas');
  cv.width = W * S; cv.height = H * S;
  const c = cv.getContext('2d');
  c.scale(S, S);
  const F = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
  const M = 'ui-monospace,Menlo,Consolas,monospace';

  // 背景
  const bg = c.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0b0e17');
  bg.addColorStop(.55, '#121728');
  bg.addColorStop(1, '#0a0c14');
  c.fillStyle = bg; c.fillRect(0, 0, W, H);

  // 光晕
  let g = c.createRadialGradient(W*0.18, H*0.06, 0, W*0.18, H*0.06, 620);
  g.addColorStop(0, rgba(T.color, .30)); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  g = c.createRadialGradient(W*0.92, H*0.95, 0, W*0.92, H*0.95, 520);
  g.addColorStop(0, rgba(T.c2, .20)); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);

  // 点阵
  c.fillStyle = 'rgba(255,255,255,.05)';
  for (let y = 30; y < H; y += 28)
    for (let x = 30; x < W; x += 28) { c.beginPath(); c.arc(x, y, 1.1, 0, 7); c.fill(); }

  // 装饰代码符号
  c.save();
  c.globalAlpha = .05; c.fillStyle = T.color;
  c.font = '700 240px ' + M; c.textBaseline = 'top';
  c.fillText('</>', W - 250, H - 300);
  c.restore();

  // 顶部
  c.textBaseline = 'alphabetic';
  c.font = '600 18px ' + M;
  c.fillStyle = 'rgba(255,255,255,.42)';
  c.fillText('DEV  PERSONALITY  TEST', 60, 78);
  c.textAlign = 'right';
  c.fillStyle = 'rgba(255,255,255,.28)';
  c.fillText(new Date().toLocaleDateString('zh-CN'), W - 60, 78);
  c.textAlign = 'left';
  c.strokeStyle = 'rgba(255,255,255,.10)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(60, 100); c.lineTo(W - 60, 100); c.stroke();

  // emoji 徽章
  const bx = 60, by = 148, bs = 96;
  g = c.createLinearGradient(bx, by, bx + bs, by + bs);
  g.addColorStop(0, rgba(T.color, .30)); g.addColorStop(1, rgba(T.c2, .18));
  c.fillStyle = g; roundRect(c, bx, by, bs, bs, 26); c.fill();
  c.strokeStyle = rgba(T.color, .45); c.lineWidth = 1.5;
  roundRect(c, bx, by, bs, bs, 26); c.stroke();
  const EF = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",' + F;
  c.textAlign = 'center'; c.textBaseline = 'middle';
  if (canRenderEmoji(T.emoji, EF)) {
    c.font = '44px ' + EF;
    c.fillText(T.emoji, bx + bs/2, by + bs/2 + 3);
  } else {
    // 无彩色 emoji 字体时，退化为人格中文首字（当作印章）
    c.font = '800 46px ' + F; c.fillStyle = rgba(T.color, .98);
    c.fillText(T.name.charAt(0), bx + bs/2, by + bs/2 + 2);
  }
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';

  // 人格名
  c.font = '800 62px ' + F;
  g = c.createLinearGradient(60, 0, W - 60, 0);
  g.addColorStop(0, '#ffffff'); g.addColorStop(.6, T.color); g.addColorStop(1, T.c2);
  c.fillStyle = g;
  c.fillText(T.name, 60, 262);

  // 英文名
  c.font = '600 17px ' + M;
  c.fillStyle = rgba(T.color, .85);
  c.fillText(T.en, 62, 300);

  // tagline
  c.font = 'italic 600 27px ' + F;
  c.fillStyle = 'rgba(255,255,255,.9)';
  c.fillText('「' + T.tag + '」', 60, 352);

  // 描述
  c.font = '400 23px ' + F;
  c.fillStyle = 'rgba(220,228,244,.72)';
  let y = 400;
  wrap(c, T.desc, W - 120).slice(0, 6).forEach(ln => { c.fillText(ln, 60, y); y += 40; });

  // 特质条
  y += 26;
  const total = Math.max(1, state.result ? state.result.all[0].v : 5);
  const traits = T.traits.map((t, i) => {
    const base = state.result ? 76 + Math.min(10, state.result.all[0].v) * 2.1 : 92;
    return { label:t, v:Math.round(Math.max(38, Math.min(97, base - i * 11))) };
  });
  traits.forEach(tr => {
    c.font = '600 20px ' + F; c.fillStyle = 'rgba(235,240,250,.9)';
    c.fillText(tr.label, 60, y);
    c.textAlign = 'right'; c.font = '700 20px ' + M; c.fillStyle = rgba(T.color, .95);
    c.fillText(tr.v + '%', W - 60, y);
    c.textAlign = 'left';
    const by2 = y + 14;
    c.fillStyle = 'rgba(255,255,255,.09)';
    roundRect(c, 60, by2, W - 120, 8, 4); c.fill();
    g = c.createLinearGradient(60, 0, W - 60, 0);
    g.addColorStop(0, T.c2); g.addColorStop(1, T.color);
    c.fillStyle = g;
    roundRect(c, 60, by2, (W - 120) * tr.v / 100, 8, 4); c.fill();
    y += 62;
  });

  // 签名
  y += 8;
  c.fillStyle = 'rgba(255,255,255,.045)';
  roundRect(c, 60, y - 34, W - 120, 104, 16); c.fill();
  c.strokeStyle = rgba(T.color, .22); c.lineWidth = 1;
  roundRect(c, 60, y - 34, W - 120, 104, 16); c.stroke();
  c.font = '500 21px ' + F; c.fillStyle = 'rgba(240,244,252,.88)';
  const qLines = wrap(c, T.quote, W - 176).slice(0, 2);
  qLines.forEach((ln, i) => c.fillText(ln, 88, qLines.length === 1 ? y + 26 : y + 2 + i * 32));
  y += 104;

  // 搭档 / 冤家
  y += 44;
  const cw = (W - 120 - 18) / 2;
  [[ '最佳搭档', T.partner ], [ '天生冤家', T.enemy ]].forEach((pair, i) => {
    const x = 60 + i * (cw + 18);
    c.fillStyle = 'rgba(255,255,255,.04)';
    roundRect(c, x, y, cw, 92, 14); c.fill();
    c.font = '600 15px ' + M; c.fillStyle = 'rgba(255,255,255,.35)';
    c.fillText(pair[0], x + 20, y + 32);
    c.font = '700 24px ' + F; c.fillStyle = i === 0 ? 'rgba(230,240,255,.95)' : 'rgba(255,255,255,.7)';
    c.fillText(pair[1], x + 20, y + 66);
  });

  // 底部
  c.strokeStyle = 'rgba(255,255,255,.08)';
  c.beginPath(); c.moveTo(60, H - 96); c.lineTo(W - 60, H - 96); c.stroke();
  c.font = '600 19px ' + F; c.fillStyle = 'rgba(255,255,255,.5)';
  c.fillText('我是「' + T.name + '」，你是哪种程序员？', 60, H - 58);
  c.textAlign = 'right'; c.font = '600 15px ' + M; c.fillStyle = rgba(T.color, .6);
  c.fillText('10 QUESTIONS · NO BACKEND', W - 60, H - 58);
  c.textAlign = 'left';

  return cv;
}

let currentCard = null;
function drawAndShow(typeId, isFriend){
  const T = TYPES[typeId];
  currentCard = drawCard(typeId, { friend:isFriend });
  $('cardImg').src = currentCard.toDataURL('image/png');

  if (isFriend) {
    $('resHead').textContent = 'TA 的程序员人格是';
    $('friendTip').classList.remove('hidden');
    $('extra').classList.add('hidden');
    $('btnAgain').textContent = '测测我的人格';
  } else {
    $('resHead').textContent = '你的程序员人格是';
    $('friendTip').classList.add('hidden');
    $('extra').classList.remove('hidden');
    $('btnAgain').textContent = '再测一次';
    renderTraits();
  }
  $('partner').textContent = T.partner;
  $('enemy').textContent = T.enemy;
  $('shareBox').textContent = shareLink(typeId);
  show('res');
}
function renderTraits(){
  const arr = state.result.all.slice(0, 4);
  const max = Math.max(1, arr[0].v);
  const box = $('traits');
  box.innerHTML = '';
  arr.forEach((a, i) => {
    const T = TYPES[a.id];
    const pct = Math.round(a.v / max * 100);
    const d = document.createElement('div');
    d.className = 'trait';
    d.innerHTML =
      '<div class="l"><b>' + T.emoji + ' ' + T.name + '</b><span>' + pct + '%</span></div>' +
      '<div class="b"><i style="width:0%;background:linear-gradient(90deg,' + T.c2 + ',' + T.color + ')"></i></div>';
    box.appendChild(d);
    setTimeout(() => { d.querySelector('i').style.width = pct + '%'; }, 120 + i * 110);
  });
}

/* ============ 分享 ============ */
function shareLink(id){
  const base = location.origin + location.pathname;
  return base + '#p=' + id;
}
function copyText(txt, msg){
  const done = () => toast(msg || '已复制到剪贴板');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(txt).then(done).catch(() => fallback());
  } else fallback();
  function fallback(){
    const ta = document.createElement('textarea');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch(e) { toast('复制失败，请手动复制'); }
    document.body.removeChild(ta);
  }
}

$('btnStart').onclick = startQuiz;
$('btnMine').onclick = () => { history.replaceState(null, '', location.pathname); startQuiz(); };
$('btnAgain').onclick = () => { history.replaceState(null, '', location.pathname); startQuiz(); };
$('btnCopy').onclick = () => {
  copyText(shareLink(state.result.top.id), '链接已复制，发给朋友吧');
};
$('btnCopyText').onclick = () => {
  const T = TYPES[state.result.top.id];
  const txt = '我的程序员人格是【' + T.name + '】' + T.emoji + ' —— ' + T.quote + '\n来测测你是哪种程序员：' + shareLink(state.result.top.id);
  copyText(txt, '文案 + 链接已复制');
};
$('btnSave').onclick = () => {
  if (!currentCard) return;
  const a = document.createElement('a');
  a.download = '程序员人格-' + TYPES[state.result.top.id].name + '.png';
  a.href = currentCard.toDataURL('image/png');
  a.click();
  toast('卡片图片已保存');
};

/* ============ 启动时：识别分享链接 ============ */
(function init(){
  const m = location.hash.match(/^#p=([a-z]+)$/);
  if (m && TYPES[m[1]]) {
    state.result = { top:{ id:m[1], v:0 }, second:{ id:m[1], v:0 }, all:[{ id:m[1], v:0 }] };
    drawAndShow(m[1], true);
  }
})();
