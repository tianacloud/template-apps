
/* ============ 数据 ============ */
var TOTAL_SETS = 0;
var PAGES = [
/* 0 封面 */ { type:'cover' },

/* 1 热身 */ { type:'list', title:'热身激活', sub:'先放松紧张肌 · 再激活后链小肌肉', ico:'热',
  dur:'约 10 分钟', accent:'#ff9f43', accentBg:'rgba(255,159,67,.13)',
  tip:'<b>为什么先做放松、再做激活：</b>驼背人群的胸肌、上斜方肌长期缩短变硬，像两根绷紧的橡皮筋把肩膀往前拽。不先松开，你就很难把肩胛骨往后缩——硬练只会让斜方肌上束和脖子代偿。先用 3 分钟把紧的地方松开，再唤醒长期"关机"的后链小肌肉，后面的强化才能真正练到后背。',
  items:[
    {n:'胸大肌 / 胸小肌松解', d:'泡沫轴或网球压在胸肌、胸小肌处，缓慢滚动', s:'约 2 分钟'},
    {n:'上斜方肌 / 肩胛提肌松解', d:'网球压在颈侧斜方肌上缘，轻轻画圈', s:'约 1 分钟'},
    {n:'猫牛式胸椎活动', d:'四点跪位，逐节活动胸椎', s:'1 组 × 10 次'},
    {n:'靠墙天使 Wall Angel', d:'腰背臀贴墙，手臂沿墙上滑下滑', s:'2 组 × 10 次'},
    {n:'弹力带肩外旋', d:'大臂夹紧体侧、屈肘 90 度，手往外转', s:'2 组 × 15 次'},
    {n:'收下巴训练', d:'平视，后脑往后方平移（双下巴动作），激活深层颈屈肌', s:'3 组 × 10 次'}
  ]},

/* 2 横握下拉 */ { type:'ex', idx:3, id:'latw',
  name:'大剪刀后仰 · 横握下拉', en:'Wide Grip Lat Pulldown',
  target:'背阔肌 · 大圆肌 · 斜方肌中下束',
  sets:3, reps:'12-15', rest:45,
  setup:'横杆握外侧折角（约 1.5 倍肩宽）；重量以最后 2 次仍能沉肩胛、后仰不塌为准。',
  steps:[
    '大腿卡紧固定垫，坐稳，脚掌踩实地面',
    '先沉肩胛：想象把肩膀往裤兜里塞下去，再开始拉',
    '躯干后仰 10-15 度，挺胸，核心收紧',
    '肘往下往后插，拉到横杆至上胸/锁骨位置，顶峰停 1 秒',
    '用 2-3 秒慢放回，让背阔肌完全伸展到位'
  ],
  notes:[
    '<b>先沉肩胛再拉</b>，顺序反了就会耸肩，斜方肌上束代偿把脖子练粗',
    '后仰角度<b>别超过 20 度</b>，过度后仰会变成借力，腰椎承受剪切力',
    '感觉是<b>"肘往下插"</b>，不是"手往下拽"，否则全练到肱二头肌',
    '回放要控制，猛放会让肩关节前侧被硬扯',
    '全程<b>不耸肩、不仰头</b>，下巴微收'
  ]},

/* 3 纵握下拉 */ { type:'ex', idx:4, id:'latv',
  name:'大剪刀后仰 · 纵握下拉', en:'Neutral Grip Lat Pulldown',
  target:'背阔肌下部 · 菱形肌 · 肱二头肌',
  sets:3, reps:'12-15', rest:45,
  setup:'换 V 柄/竖柄，掌心相对（肩处外旋位，圆肩最友好），重量可略大。',
  steps:[
    '掌心相对握住 V 柄，手腕保持中立不弯折',
    '沉肩胛、后仰 10 度、挺胸，与横握一致',
    '肘贴近身体两侧往下走，能比横握拉得更低',
    '拉到胸骨下缘/上腹部，顶峰夹一下肩胛，停 1 秒',
    '2-3 秒控制回放，感受背阔肌被拉长'
  ],
  notes:[
    '肘要<b>贴着身体走</b>，往外张开会变成横握的动作，失去纵握的意义',
    '手腕别弯折，力量从肘传出去，手腕只做"钩子"',
    '这是<b>肩关节压力最小</b>的下拉方式，肩痛时可以只做这一种',
    '同样<b>不能耸肩</b>，回放时要有"背在变长"的感觉'
  ]},

/* 4 反向蝴蝶机 */ { type:'ex', idx:2, id:'pec',
  name:'反向蝴蝶机', en:'Reverse Pec Deck / Reverse Fly',
  target:'后束三角肌 · 斜方肌中束 · 菱形肌',
  sets:4, reps:'12-15', rest:45,
  danger:true,
  setup:'反坐（面朝靠垫、背朝外），握把与肩同高；宁轻勿重，5-10kg 起步。',
  steps:[
    '胸口贴紧靠垫，核心收紧，躯干不离开靠垫',
    '肘部微屈并全程保持这个角度，像抱一棵大树',
    '用肩胛骨发力，带动手臂向两侧、向后展开',
    '展开到最远处，想象两片肩胛骨中间夹住一支笔，停 1 秒',
    '2 秒慢放回，回放时保持张力，别完全松掉'
  ],
  notes:[
    '<b>肘角度全程固定</b>，用手臂甩就变成甩手，后束一点都练不到',
    '<b>绝不耸肩</b>，肩膀始终往下压，脖子两侧的斜方肌上束要放松',
    '回放时也要控制，让肌肉在拉长状态下继续工作',
    '这个动作<b>不需要大重量</b>，重量一大必然靠甩，宁可加到 20 次',
    '做对了会感觉<b>肩后侧和肩胛骨中间发酸</b>，不是手臂酸'
  ]},

/* 5 宽距划船 */ { type:'ex', idx:1, id:'row',
  name:'宽距划船', en:'Wide Grip Seated Row',
  target:'斜方肌中束 · 菱形肌 · 后束三角肌',
  sets:4, reps:'12-15', rest:50,
  setup:'装宽横杆握两端；重量以全程躯干不晃为准。',
  steps:[
    '脚踏稳踏板，膝盖微屈保持弹性，别锁死',
    '躯干直立，核心收紧，挺胸，肩胛先下沉',
    '肘尖指向斜后方 45 度，把杆拉向胸骨下缘',
    '顶峰时肩胛骨用力夹紧，停 1 秒',
    '回放时主动让肩胛骨"打开"前伸，把胸椎伸展开'
  ],
  notes:[
    '<b>躯干绝不能前后晃</b>，身体一摆，力就从背部跑到腰和下背',
    '宽握时<b>肘略高于手腕</b>，肘尖朝斜后方，不要朝正后方夹紧',
    '回放要充分，让肩胛骨完全打开——<b>这段行程才是纠正驼背的关键</b>',
    '全程挺胸，一旦含胸，菱形肌就卸力了',
    '手只是钩子，想象<b>"用肘去戳后面的人"</b>'
  ]},

/* 6 绳索面拉 */ { type:'ex', idx:5, id:'fp',
  name:'绳索面拉', en:'Face Pull',
  target:'后束三角肌 · 斜方肌下束 · 冈下肌/小圆肌',
  sets:4, reps:'12-15', rest:40,
  setup:'滑轮调至眼/额高度，装绳索；重量以全程站定不动为准，宁轻勿重。',
  steps:[
    '双手对握绳头，拇指朝向自己，手臂前伸',
    '肘与肩同高，把绳索拉向面部',
    '到末端做外旋：前臂向外打开，拳心转向斜上方，像"投降"姿势',
    '绳头停在太阳穴两侧，顶峰停 1 秒',
    '用 3 秒慢放回，全程保持肩胛下沉'
  ],
  notes:[
    '<b>腿只负责站稳</b>：不屈膝、不上下起伏、躯干不前后晃（如有晃动，先把重量降下来）',
    '<b>必须做外旋</b>，只往后拉不打开，后束刺激直接减半',
    '<b>不耸肩</b>，肩膀始终往下沉，脖子两侧放松',
    '呼吸配合：拉起时呼气，肋骨往下沉不外翻',
    '做对了会感觉<b>肩后侧和肩胛骨下方</b>酸，脖子或手臂酸就是代偿了'
  ]},

/* 7 拉伸 */ { type:'list', title:'拉伸放松', sub:'打开胸前链 · 巩固训练效果', ico:'拉',
  dur:'约 10 分钟', accent:'#4aa8ff', accentBg:'rgba(74,168,255,.13)',
  tip:'<b>为什么这 10 分钟不能省：</b>驼背的根源之一是胸大肌、胸小肌长期缩短，它们像一根绷紧的橡皮筋，把肩膀死死往前拽。你在前面练了 35 分钟把后背练强，如果不把前面这根"橡皮筋"松开，后背再强也会被拽回去。这一半是训练，一半是治疗。',
  items:[
    {n:'门框胸大肌拉伸', d:'小臂贴门框，身体往前跨并轻微外旋', s:'2 × 30 秒/侧'},
    {n:'胸小肌靠墙拉伸', d:'手放头后，前臂贴墙，身体前移', s:'2 × 30 秒/侧'},
    {n:'上斜方肌+肩胛提肌拉伸', d:'头侧倾并轻微前屈，手轻搭头顶', s:'2 × 30 秒/侧'},
    {n:'收下巴训练', d:'平躺或靠墙，后脑往后方平移（双下巴动作）', s:'2 × 10 次'},
    {n:'泡沫轴胸椎伸展', d:'轴在胸椎下方，双手抱头缓慢后仰', s:'约 2 分钟'}
  ]},

/* 8 完成 */ { type:'done' }
];

/* 统计总组数 */
PAGES.forEach(function(p){ if(p.type==='ex') TOTAL_SETS += p.sets; });

/* 按科学顺序重排 ex 页：水平拉(主轴)→后束→背阔肌→肩外旋(收尾) */
(function(){
  var exs = PAGES.filter(function(p){return p.type==='ex';}).sort(function(a,b){return a.idx-b.idx;});
  var k=0, out=[];
  PAGES.forEach(function(p){ out.push(p.type==='ex' ? exs[k++] : p); });
  PAGES = out;
})();
var DONE_KEY = 'hbplan_v1';

/* ============ 动作示意图（SVG 线稿） ============ */
var FIG = {
 latw:
  '<svg viewBox="0 0 300 210" class="fig-svg" role="img" aria-label="横握下拉示意">'
  +'<defs><marker id="m1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ff9f43"/></marker></defs>'
  +'<circle cx="130" cy="15" r="6" fill="none" stroke="#44566a" stroke-width="3"/>'
  +'<line x1="130" y1="21" x2="130" y2="46" stroke="#44566a" stroke-width="3"/>'
  +'<line x1="58" y1="46" x2="202" y2="46" stroke="#e9eff6" stroke-width="5" stroke-linecap="round"/>'
  +'<circle cx="130" cy="86" r="12" fill="none" stroke="#00e0a4" stroke-width="3"/>'
  +'<line x1="130" y1="98" x2="130" y2="105" stroke="#00e0a4" stroke-width="3" stroke-linecap="round"/>'
  +'<line x1="116" y1="105" x2="144" y2="105" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="130" y1="105" x2="130" y2="158" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="130" y1="158" x2="112" y2="182" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="130" y1="158" x2="148" y2="182" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<rect x="104" y="160" width="52" height="10" rx="3" fill="#1b242f" stroke="#44566a" stroke-width="2"/>'
  +'<line x1="118" y1="105" x2="64" y2="48" stroke="#00e0a4" stroke-width="3.5" stroke-linecap="round"/>'
  +'<line x1="142" y1="105" x2="196" y2="48" stroke="#00e0a4" stroke-width="3.5" stroke-linecap="round"/>'
  +'<path d="M224 54 C 238 76, 238 96, 224 116" stroke="#ff9f43" stroke-width="2.5" fill="none" marker-end="url(#m1)"/>'
  +'<text x="150" y="202" text-anchor="middle" fill="#ff9f43" font-size="11" font-weight="700">拉至上胸 · 肘下沉</text>'
  +'</svg>',

 latv:
  '<svg viewBox="0 0 300 210" class="fig-svg" role="img" aria-label="纵握下拉示意">'
  +'<defs><marker id="m2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ff9f43"/></marker></defs>'
  +'<circle cx="130" cy="15" r="6" fill="none" stroke="#44566a" stroke-width="3"/>'
  +'<line x1="130" y1="21" x2="130" y2="44" stroke="#44566a" stroke-width="3"/>'
  +'<line x1="116" y1="44" x2="144" y2="44" stroke="#e9eff6" stroke-width="3" stroke-linecap="round"/>'
  +'<line x1="116" y1="44" x2="116" y2="62" stroke="#e9eff6" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="144" y1="44" x2="144" y2="62" stroke="#e9eff6" stroke-width="4" stroke-linecap="round"/>'
  +'<circle cx="130" cy="86" r="12" fill="none" stroke="#00e0a4" stroke-width="3"/>'
  +'<line x1="130" y1="98" x2="130" y2="105" stroke="#00e0a4" stroke-width="3" stroke-linecap="round"/>'
  +'<line x1="116" y1="105" x2="144" y2="105" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="130" y1="105" x2="130" y2="158" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="130" y1="158" x2="112" y2="182" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="130" y1="158" x2="148" y2="182" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<rect x="104" y="160" width="52" height="10" rx="3" fill="#1b242f" stroke="#44566a" stroke-width="2"/>'
  +'<line x1="118" y1="105" x2="116" y2="50" stroke="#00e0a4" stroke-width="3.5" stroke-linecap="round"/>'
  +'<line x1="142" y1="105" x2="144" y2="50" stroke="#00e0a4" stroke-width="3.5" stroke-linecap="round"/>'
  +'<path d="M224 54 C 238 76, 238 96, 224 116" stroke="#ff9f43" stroke-width="2.5" fill="none" marker-end="url(#m2)"/>'
  +'<text x="150" y="202" text-anchor="middle" fill="#ff9f43" font-size="11" font-weight="700">掌心相对 · 肘贴身</text>'
  +'</svg>',

 pec:
  '<svg viewBox="0 0 300 210" class="fig-svg" role="img" aria-label="反向蝴蝶机示意">'
  +'<defs><marker id="m3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ff9f43"/></marker></defs>'
  +'<rect x="118" y="150" width="64" height="10" rx="3" fill="#1b242f" stroke="#44566a" stroke-width="2"/>'
  +'<circle cx="150" cy="52" r="13" fill="none" stroke="#00e0a4" stroke-width="3"/>'
  +'<path d="M134 68 Q150 62 166 68 L169 146 Q150 153 131 146 Z" fill="none" stroke="#00e0a4" stroke-width="3"/>'
  +'<line x1="140" y1="76" x2="72" y2="64" stroke="#00e0a4" stroke-width="3.5" stroke-linecap="round"/>'
  +'<line x1="160" y1="76" x2="228" y2="64" stroke="#00e0a4" stroke-width="3.5" stroke-linecap="round"/>'
  +'<line x1="64" y1="62" x2="42" y2="62" stroke="#ff9f43" stroke-width="2.5" marker-end="url(#m3)"/>'
  +'<line x1="236" y1="62" x2="258" y2="62" stroke="#ff9f43" stroke-width="2.5" marker-end="url(#m3)"/>'
  +'<circle cx="150" cy="98" r="3" fill="#ff9f43"/>'
  +'<text x="150" y="202" text-anchor="middle" fill="#ff9f43" font-size="11" font-weight="700">背朝器械 · 向后展开夹肩胛</text>'
  +'</svg>',

 row:
  '<svg viewBox="0 0 300 210" class="fig-svg" role="img" aria-label="宽距划船示意">'
  +'<defs><marker id="m4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ff9f43"/></marker></defs>'
  +'<circle cx="58" cy="96" r="7" fill="none" stroke="#44566a" stroke-width="3"/>'
  +'<line x1="65" y1="96" x2="108" y2="96" stroke="#44566a" stroke-width="3"/>'
  +'<line x1="112" y1="86" x2="112" y2="106" stroke="#e9eff6" stroke-width="4" stroke-linecap="round"/>'
  +'<rect x="150" y="150" width="72" height="11" rx="3" fill="#1b242f" stroke="#44566a" stroke-width="2"/>'
  +'<line x1="175" y1="150" x2="168" y2="82" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<circle cx="170" cy="68" r="12" fill="none" stroke="#00e0a4" stroke-width="3"/>'
  +'<line x1="175" y1="150" x2="120" y2="150" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="120" y1="150" x2="120" y2="182" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<rect x="108" y="180" width="16" height="10" rx="2" fill="none" stroke="#44566a" stroke-width="2"/>'
  +'<line x1="168" y1="84" x2="140" y2="90" stroke="#00e0a4" stroke-width="3.5" stroke-linecap="round"/>'
  +'<line x1="140" y1="90" x2="116" y2="96" stroke="#00e0a4" stroke-width="3.5" stroke-linecap="round"/>'
  +'<line x1="78" y1="80" x2="118" y2="80" stroke="#ff9f43" stroke-width="2.5" marker-end="url(#m4)"/>'
  +'<text x="150" y="202" text-anchor="middle" fill="#ff9f43" font-size="11" font-weight="700">肘朝斜后 · 拉向胸骨下缘</text>'
  +'</svg>',

 fp:
  '<svg viewBox="0 0 300 210" class="fig-svg" role="img" aria-label="绳索面拉示意">'
  +'<defs><marker id="m5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ff9f43"/></marker></defs>'
  +'<circle cx="274" cy="58" r="7" fill="none" stroke="#44566a" stroke-width="3"/>'
  +'<line x1="267" y1="54" x2="140" y2="56" stroke="#44566a" stroke-width="2.5"/>'
  +'<line x1="267" y1="64" x2="140" y2="64" stroke="#44566a" stroke-width="2.5"/>'
  +'<circle cx="120" cy="58" r="12" fill="none" stroke="#00e0a4" stroke-width="3"/>'
  +'<line x1="120" y1="70" x2="120" y2="76" stroke="#00e0a4" stroke-width="3" stroke-linecap="round"/>'
  +'<line x1="120" y1="76" x2="120" y2="140" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="120" y1="140" x2="103" y2="166" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="120" y1="140" x2="137" y2="166" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="120" y1="78" x2="162" y2="76" stroke="#00e0a4" stroke-width="3.5" stroke-linecap="round"/>'
  +'<line x1="162" y1="76" x2="140" y2="60" stroke="#00e0a4" stroke-width="3.5" stroke-linecap="round"/>'
  +'<line x1="236" y1="84" x2="186" y2="84" stroke="#ff9f43" stroke-width="2.5" marker-end="url(#m5)"/>'
  +'<text x="150" y="202" text-anchor="middle" fill="#ff9f43" font-size="11" font-weight="700">绳头到太阳穴 · 末端外旋</text>'
  +'</svg>'
};

/* ============ 状态 ============ */
var ST = { page:0, sets:{}, list:{}, seen:{} };
try{
  var raw = (window.opener || window.parent).fitStore.getItem(DONE_KEY);
  if(raw){ var o=JSON.parse(raw); ST.sets=o.sets||{}; ST.list=o.list||{}; ST.seen=o.seen||{}; }
}catch(e){}

function save(){
  try{ (window.opener || window.parent).fitStore.setItem(DONE_KEY, JSON.stringify({sets:ST.sets,list:ST.list,seen:ST.seen})).catch(function(){}); }catch(e){ document.body.innerHTML='无法保存训练记录，请返回应用重新打开。'; }
}

/* ============ 计时器 ============ */
var TM = { id:null, endAt:0, remain:45, total:45, running:false };

function beep(){
  try{
    var C = window.AudioContext||window.webkitAudioContext; if(!C) return;
    var ctx=new C(), o=ctx.createOscillator(), g=ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value=880; o.type='sine';
    g.gain.setValueAtTime(.001,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.25,ctx.currentTime+.02);
    g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.45);
    o.start(ctx.currentTime); o.stop(ctx.currentTime+.5);
    setTimeout(function(){ try{ctx.close();}catch(e){} },700);
  }catch(e){}
}
function tmReset(sec){
  if(TM.id){ clearInterval(TM.id); TM.id=null; }
  TM.running=false; TM.total=sec; TM.remain=sec;
}
function tmStart(){
  if(TM.running) return;
  if(TM.remain<=0) TM.remain=TM.total;
  TM.running=true; TM.endAt=Date.now()+TM.remain*1000;
  TM.id=setInterval(tmTick,200); paintTimer();
}
function tmPause(){
  if(!TM.running) return;
  if(TM.id){ clearInterval(TM.id); TM.id=null; }
  TM.running=false; TM.remain=Math.max(0,Math.round((TM.endAt-Date.now())/1000));
  paintTimer();
}
function tmTick(){
  var left=Math.max(0,Math.round((TM.endAt-Date.now())/1000));
  if(left!==TM.remain){ TM.remain=left; }
  if(left<=0){
    if(TM.id){ clearInterval(TM.id); TM.id=null; }
    TM.running=false; beep();
    if(navigator.vibrate) try{ navigator.vibrate([180,90,180]); }catch(e){}
  }
  paintTimer();
}
function tmAdj(d){
  var t=Math.min(60,Math.max(30,TM.total+d));
  if(TM.running){ TM.total=t; }
  else { TM.total=t; TM.remain=t; tmReset(t); }
  paintTimer();
}
function paintTimer(){
  var s=document.getElementById('tmSec'); if(!s) return;
  var btn=document.getElementById('tmPlay');
  var tot=document.getElementById('tmTotal');
  s.textContent=TM.remain;
  s.className='tm-sec'+(TM.running?' run':(TM.remain===0?' fin':''));
  if(btn) btn.textContent=TM.running?'暂停':'开始';
  if(btn) btn.className='tm-btn tm-play'+(TM.running?' on':'');
  if(tot) tot.textContent=TM.total;
  var ring=document.getElementById('tmRing');
  if(ring){
    var pct = TM.total>0 ? (1-TM.remain/TM.total) : 0;
    ring.style.width=(pct*100)+'%';
  }
}

/* ============ 渲染 ============ */
function esc(s){ return s; }

function renderCover(){
  var listHtml = PAGES.map(function(p,i){
    if(p.type!=='ex') return '';
    return '<div class="ov-item" data-go="'+i+'">'+
      '<div class="ov-n">'+p.idx+'</div>'+
      '<div class="ov-name">'+p.name+'</div>'+
      '<div class="ov-s">'+p.sets+' × '+p.reps+'</div></div>';
  }).join('');

  return '<div class="page">'+
    '<div class="cover-hero">'+
      '<h1>驼背纠正训练计划</h1>'+
      '<p>强化后背链 &nbsp;+&nbsp; 打开胸前链<br>改善圆肩 · 上交叉综合征</p>'+
    '</div>'+
    '<div class="big-banner">'+
      '<div class="bb-k">驼背纠正第一铁律 · 每一下都先做到</div>'+
      '<div class="bb-row">'+
        '<div class="bb-item"><div class="bb-t">先 <b>沉肩胛</b> · 不耸肩</div>'+
          '<div class="bb-d">发力前先把肩膀往下"塞"进裤兜、远离耳朵。耸肩＝斜方肌上束（脖子）代偿，越练越圆肩。</div></div>'+
        '<div class="bb-item"><div class="bb-t">夹肩胛 · <b>躯干腿不动</b></div>'+
          '<div class="bb-d">靠肩胛后缩和后链发力，不是靠晃身体、屈膝去够重量。腿只站稳，动的是后背。</div></div>'+
      '</div>'+
    '</div>'+
    '<div class="timebar">'+
      '<div class="tb-seg" style="flex:10;background:#ff9f43">10<small>分钟</small><span>热身</span></div>'+
      '<div class="tb-seg" style="flex:35;background:#00e0a4">35<small>分钟</small><span>主体</span></div>'+
      '<div class="tb-seg" style="flex:10;background:#4aa8ff">10<small>分钟</small><span>拉伸</span></div>'+
    '</div>'+
    '<div class="tb-legend">'+
      '<span><i style="background:#ff9f43"></i>热身 10</span>'+
      '<span><i style="background:#00e0a4"></i>主体 35</span>'+
      '<span><i style="background:#4aa8ff"></i>拉伸 10</span>'+
      '<span style="color:var(--accent);font-weight:700">合计 约 55 分钟</span>'+
    '</div>'+
    '<div class="kv" style="margin-top:16px">'+
      '<div class="kv-item"><div class="kv-k">主项动作</div><div class="kv-v">5 <small>个</small></div></div>'+
      '<div class="kv-item"><div class="kv-k">总组数</div><div class="kv-v">'+TOTAL_SETS+' <small>组</small></div></div>'+
      '<div class="kv-item"><div class="kv-k">每组次数</div><div class="kv-v">12-15 <small>次</small></div></div>'+
      '<div class="kv-item"><div class="kv-k">组间歇</div><div class="kv-v">40-50 <small>秒</small></div></div>'+
    '</div>'+
    '<div class="card" style="margin-top:14px">'+
      '<div class="card-hd"><div class="card-ico" style="background:rgba(255,159,67,.13);color:#ff9f43">!</div>'+
      '<div class="card-t">先看这 3 条，比动作本身更重要</div></div>'+
      '<div style="font-size:12.5px;line-height:1.75;color:#c4d0dc">'+
        '<div style="margin-bottom:8px"><b style="color:#ffc78b">1. 蝴蝶机必须反着坐。</b>正向夹胸练胸大肌，对圆肩是火上浇油；反坐向后展开才是纠正动作。</div>'+
        '<div style="margin-bottom:8px"><b>2. 这 4 个动作只能练 35 分钟。</b>剩下的 20 分钟靠热身（含放松）+拉伸补上，而拉伸是纠正驼背的另一半，别省。</div>'+
        '<div><b>3. 重量宁轻勿重。</b>所有动作的判断标准统一：最后 2 次仍能做到不耸肩、不晃躯干、不屈膝。</div>'+
      '</div>'+
    '</div>'+
    '<div class="tip" style="margin-top:14px"><b>动作顺序：</b>热身放松 → 宽距划船 → 反向蝴蝶机 → 横/纵握下拉 → 绳索面拉 → 拉伸。先松后练、复合优先、面拉收尾。</div>'+
    '<div class="sec-t">训练流程（点任意动作可直接跳过去）</div>'+
    '<div class="ov-list">'+
      '<div class="ov-item" data-go="1"><div class="ov-n" style="background:rgba(255,159,67,.13);color:#ff9f43">热</div>'+
        '<div class="ov-name">热身激活</div><div class="ov-s">10 分钟</div></div>'+
      listHtml+
      '<div class="ov-item" data-go="7"><div class="ov-n" style="background:rgba(74,168,255,.13);color:#4aa8ff">拉</div>'+
        '<div class="ov-name">拉伸放松</div><div class="ov-s">10 分钟</div></div>'+
    '</div>'+
    '<div class="tip" style="margin-top:14px"><b>频率：</b>每周 2-3 次，间隔≥48 小时；坚持 6-8 周才见明显变化，前两周肩后侧开始有感觉就是进步。</div>'+
  '</div>';
}

function renderList(p,pi){
  var items = p.items.map(function(it,i){
    var k = pi+'_'+i;
    var on = !!ST.list[k];
    return '<div class="chk'+(on?' done':'')+'" data-chk="'+k+'">'+
      '<div class="chk-b"><svg viewBox="0 0 24 24"><polyline points="4,12 10,18 20,6"/></svg></div>'+
      '<div class="chk-t"><div class="chk-name">'+it.n+'</div><div class="chk-det">'+it.d+'</div></div>'+
      '<div class="chk-dose">'+it.s+'</div></div>';
  }).join('');

  return '<div class="page">'+
    '<div class="ex-head">'+
      '<div class="ex-idx" style="background:'+p.accentBg+';color:'+p.accent+'">'+p.ico+'</div>'+
      '<div class="ex-title"><h2>'+p.title+'</h2>'+
        '<div class="ex-en">'+p.sub+'</div>'+
        '<div class="ex-target" style="color:'+p.accent+'">'+p.dur+'</div></div>'+
    '</div>'+
    '<div class="card"><div style="font-size:12.5px;letter-spacing:.8px;color:var(--muted2);font-weight:700;margin-bottom:4px">逐项完成</div>'+
      items+'</div>'+
    '<div class="tip" style="border-left-color:'+p.accent+'">'+p.tip+'</div>'+
  '</div>';
}

function renderEx(p,pi){
  var st = ST.sets[p.id] || [];
  var dots='';
  for(var i=0;i<p.sets;i++){
    var on = st.indexOf(i)>-1;
    dots += '<div class="set-dot'+(on?' done':'')+'" data-set="'+i+'">'+
      '<div class="set-num">第 '+(i+1)+' 组</div><div class="set-reps">'+p.reps+' 次</div></div>';
  }
  var doneN = st.length;

  var steps = p.steps.map(function(s,i){
    return '<div class="step"><div class="step-n">'+(i+1)+'</div><div class="step-t">'+s+'</div></div>';
  }).join('');

  var notes = p.notes.map(function(n){
    return '<div class="note"><span class="note-d">&#9679;</span><span>'+n+'</span></div>';
  }).join('');

  var alertHtml='';
  if(p.danger){
    alertHtml = '<div class="alert">'+
      '<div class="alert-hd"><span>&#9888;</span>方向错了会加重驼背</div>'+
      '<div class="alert-row"><div class="alert-b alert-ok">&#10003;</div>'+
        '<div class="alert-t"><b>要这样做：</b>面朝靠垫反坐，向两侧<b>向后</b>展开，夹紧肩胛骨。练后束三角肌、斜方肌中束、菱形肌。</div></div>'+
      '<div class="alert-row"><div class="alert-b alert-no">&#10007;</div>'+
        '<div class="alert-t"><b>绝不要：</b>正向坐、双手向前环抱夹胸。那是练胸大肌，会让紧张的胸前侧更紧，圆肩更严重。</div></div>'+
    '</div>';
  }

  return '<div class="page">'+
    '<div class="ex-head">'+
      '<div class="ex-idx">'+p.idx+'</div>'+
      '<div class="ex-title"><h2>'+p.name+'</h2>'+
        '<div class="ex-en">'+p.en+' · 第 '+p.idx+' / 5 个动作</div>'+
        '<div class="ex-target">目标肌群：'+p.target+'</div></div>'+
    '</div>'+
    '<div class="specs">'+
      '<div class="spec"><div class="spec-v">'+p.sets+'</div><div class="spec-k">组数</div></div>'+
      '<div class="spec"><div class="spec-v">'+p.reps+'</div><div class="spec-k">每组次数</div></div>'+
      '<div class="spec"><div class="spec-v">'+p.rest+'</div><div class="spec-k">组间歇秒</div></div>'+
    '</div>'+
    '<div class="ex-fig">'+FIG[p.id]+'</div>'+
    '<div class="setup">'+p.setup+'</div>'+
    '<div class="sec-t">执行步骤</div>'+
    '<div class="steps">'+steps+'</div>'+
    alertHtml+
    '<div class="notes">'+
      '<div class="notes-hd"><span>&#9888;</span>注意点（每组都要检查）</div>'+notes+
    '</div>'+
    '<div class="sec-t">组数打卡 · 完成一组自动开始间歇计时</div>'+
    '<div class="sets-hd"><div class="sets-hd-t">点击圆圈标记完成</div>'+
      '<div class="sets-cnt">'+doneN+' / '+p.sets+' 组</div></div>'+
    '<div class="sets">'+dots+'</div>'+
    '<div class="timer">'+
      '<div class="tm-main">'+
        '<div class="tm-disp"><span class="tm-sec" id="tmSec">'+p.rest+'</span>'+
          '<span class="tm-unit">秒 / <span id="tmTotal">'+p.rest+'</span> 秒</span></div>'+
        '<div class="tm-hint" id="tmHint">点上面的组数，计时自动开始</div>'+
        '<div class="progress" style="margin-top:7px"><div class="progress-fill" id="tmRing" style="width:0"></div></div>'+
      '</div>'+
      '<div class="tm-ctrls">'+
        '<div class="tm-row">'+
          '<button class="tm-btn tm-adj" id="tmMinus">&#8722;5</button>'+
          '<button class="tm-btn tm-play" id="tmPlay">开始</button>'+
          '<button class="tm-btn tm-adj" id="tmPlus">+5</button>'+
        '</div>'+
        '<button class="tm-btn tm-reset" id="tmReset">重置</button>'+
      '</div>'+
    '</div>'+
  '</div>';
}

function renderDone(){
  var done=0; PAGES.forEach(function(p){ if(p.type==='ex') done+=(ST.sets[p.id]||[]).length; });
  var pct = TOTAL_SETS? Math.round(done/TOTAL_SETS*100):0;
  return '<div class="page">'+
    '<div class="done-hero">'+
      '<div class="done-ico"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,12 10,18 20,5"/></svg></div>'+
      '<h2>训练完成</h2><p>今天练了 '+done+' 组，完成度 '+pct+'%</p>'+
    '</div>'+
    '<div class="done-stat">'+
      '<div class="kv-item"><div class="kv-k">总组数</div><div class="kv-v">'+done+'<small>/'+TOTAL_SETS+'</small></div></div>'+
      '<div class="kv-item"><div class="kv-k">总时长</div><div class="kv-v">55 <small>分钟</small></div></div>'+
      '<div class="kv-item"><div class="kv-k">建议频率</div><div class="kv-v">2-3 <small>次/周</small></div></div>'+
    '</div>'+
    '<div class="card">'+
      '<div class="card-hd"><div class="card-ico">&#9635;</div><div class="card-t">练完必做的 3 件事</div></div>'+
      '<div style="font-size:12.5px;line-height:1.8;color:#c4d0dc">'+
        '<div style="margin-bottom:8px"><b>1. 记录发力感。</b>在备忘录记一句"今天哪个动作感觉到肩后侧酸了"。几周后你会发现感觉越来越明确，这就是神经肌肉连接建立的过程。</div>'+
        '<div style="margin-bottom:8px"><b>2. 日常姿势比训练更重要。</b>屏幕垫高到眼睛高度，每 45 分钟做一次"靠墙天使"——训练 55 分钟，剩下 15 小时才是决定因素。</div>'+
        '<div><b>3. 下次拍个侧面视频。</b>手机架胸口高度、距离 2.5-3 米，可自行检查肩胛和躯干有没有代偿。</div>'+
      '</div>'+
    '</div>'+
    '<div class="tip"><b>预期时间表：</b>1-2 周肩后侧有感觉；3-4 周能控制肩胛后缩、肩不往前扣；6-8 周他人看出姿态变化。<b>4 周无变化，多半是重量过大或日常姿势未同步调整。</b></div>'+
    '<button class="nav-btn" id="resetAll" style="width:100%;height:42px;margin-top:14px;background:var(--card);border:1px solid var(--border);color:var(--muted)">清除打卡记录，重新开始</button>'+
  '</div>';
}

/* ============ 主逻辑 ============ */
var content=document.getElementById('content');
var prevBtn=document.getElementById('prevBtn');
var nextBtn=document.getElementById('nextBtn');
var dotsBox=document.getElementById('dots');

function curEx(){ var p=PAGES[ST.page]; return (p&&p.type==='ex')?p:null; }

function paint(){
  var p=PAGES[ST.page];
  ST.seen[ST.page]=1; save();
  content.scrollTop=0;

  if(p.type==='cover'){ content.innerHTML=renderCover(); }
  else if(p.type==='list'){ content.innerHTML=renderList(p,ST.page); }
  else if(p.type==='ex'){ tmReset(p.rest); content.innerHTML=renderEx(p,ST.page); }
  else { content.innerHTML=renderDone(); }

  // 头部
  var ht=document.getElementById('headTitle');
  var hm=document.getElementById('headMeta');
  var done=0; PAGES.forEach(function(q){ if(q.type==='ex') done+=(ST.sets[q.id]||[]).length; });
  document.getElementById('progFill').style.width=(TOTAL_SETS?done/TOTAL_SETS*100:0)+'%';
  if(p.type==='cover'){ ht.textContent='驼背纠正训练计划'; }
  else if(p.type==='ex'){ ht.textContent=p.name; }
  else if(p.type==='list'){ ht.textContent=p.title; }
  else { ht.textContent='训练完成'; }
  hm.innerHTML='<b>'+done+'</b> / '+TOTAL_SETS+' 组';

  // 导航
  prevBtn.disabled = ST.page===0;
  if(ST.page===PAGES.length-1){ nextBtn.textContent='已完成'; nextBtn.disabled=true; }
  else { nextBtn.innerHTML='下一页 &#8250;'; nextBtn.disabled=false; }

  // 页码点
  var dh='';
  for(var i=0;i<PAGES.length;i++){
    dh+='<div class="dot'+(i===ST.page?' on':(ST.seen[i]?' seen':''))+'" data-dot="'+i+'"></div>';
  }
  dotsBox.innerHTML=dh;

  bind();
}

function bind(){
  // 跳转
  var gos=content.querySelectorAll('[data-go]');
  for(var i=0;i<gos.length;i++){
    gos[i].addEventListener('click',function(){
      ST.page=+this.getAttribute('data-go'); paint();
    });
  }
  // 页码点
  var ds=dotsBox.querySelectorAll('[data-dot]');
  for(var j=0;j<ds.length;j++){
    ds[j].addEventListener('click',function(){
      ST.page=+this.getAttribute('data-dot'); paint();
    });
  }
  // 清单勾选
  var chks=content.querySelectorAll('[data-chk]');
  for(var k=0;k<chks.length;k++){
    chks[k].addEventListener('click',function(){
      var key=this.getAttribute('data-chk');
      if(ST.list[key]) delete ST.list[key]; else ST.list[key]=1;
      save(); paint();
    });
  }
  // 组打卡
  var p=curEx();
  if(p){
    var sd=content.querySelectorAll('[data-set]');
    for(var m=0;m<sd.length;m++){
      sd[m].addEventListener('click',function(){
        var idx=+this.getAttribute('data-set');
        var arr=ST.sets[p.id]||[];
        var pos=arr.indexOf(idx);
        if(pos>-1) arr.splice(pos,1); else arr.push(idx);
        ST.sets[p.id]=arr; save();
        if(pos===-1 && arr.length<p.sets){ tmStart(); }
        paint();
      });
    }
    var b1=document.getElementById('tmPlay');
    var b2=document.getElementById('tmMinus');
    var b3=document.getElementById('tmPlus');
    var b4=document.getElementById('tmReset');
    if(b1) b1.addEventListener('click',function(){ TM.running?tmPause():tmStart(); });
    if(b2) b2.addEventListener('click',function(){ tmAdj(-5); });
    if(b3) b3.addEventListener('click',function(){ tmAdj(5); });
    if(b4) b4.addEventListener('click',function(){ tmReset(TM.total); paintTimer(); var h=document.getElementById('tmHint'); if(h) h.textContent='已重置为 '+TM.total+' 秒'; });
  }
  // 清除
  var ra=document.getElementById('resetAll');
  if(ra) ra.addEventListener('click',function(){
    ST.sets={}; ST.list={}; ST.seen={}; ST.page=0; save(); paint();
  });
}

function go(d){
  var t=ST.page+d;
  if(t<0||t>=PAGES.length) return;
  ST.page=t; paint();
}

prevBtn.addEventListener('click',function(){ go(-1); });
nextBtn.addEventListener('click',function(){ go(1); });

document.addEventListener('keydown',function(e){
  if(e.key==='ArrowLeft'){ go(-1); }
  else if(e.key==='ArrowRight'){ go(1); }
});

// 滑动翻页
var tx=0,ty=0,tracking=false;
content.addEventListener('touchstart',function(e){
  if(e.touches.length!==1) return;
  tx=e.touches[0].clientX; ty=e.touches[0].clientY; tracking=true;
},{passive:true});
content.addEventListener('touchend',function(e){
  if(!tracking) return; tracking=false;
  var t=e.changedTouches[0];
  var dx=t.clientX-tx, dy=t.clientY-ty;
  if(Math.abs(dx)>62 && Math.abs(dx)>Math.abs(dy)*1.6){
    if(dx<0) go(1); else go(-1);
  }
},{passive:true});

paint();
