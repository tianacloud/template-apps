
/* ============ 数据 ============ */
var TOTAL_SETS = 0;
var PAGES = [
/* 0 封面 */ { type:'cover' },

/* 1 热身 */ { type:'list', title:'热身激活', sub:'先激活背阔肌 · 学会把肩膀沉下去', ico:'热',
  dur:'约 10 分钟', accent:'#ff9f43', accentBg:'rgba(255,159,67,.13)',
  tip:'<b>为什么先练"沉肩"：</b>练背最大的坑不是重量，是耸肩——背阔肌还没发力，斜方肌上束（脖子两侧那块）就抢着干了，练完脖子粗、背没感觉。热身先做死挂和肩胛引体，把"肩膀往裤兜里塞"这个动作练成肌肉记忆，后面的垂直拉才能真正练到背阔肌，而不是练脖子。',
  items:[
    {n:'死挂 Dead Hang', d:'双手抓单杠或引体机横杆，身体悬垂，主动把肩胛骨下沉', s:'2 组 × 20 秒'},
    {n:'肩胛引体 Scapular Pull-up', d:'悬垂状态，只做"沉肩+后缩"，不弯肘、不拉起身体', s:'2 组 × 10 次'},
    {n:'弹力带 Pull-apart', d:'双手前举握弹力带，向两侧水平展开到胸前', s:'2 组 × 15 次'},
    {n:'猫牛式胸椎活动', d:'四点跪位，逐节活动胸椎', s:'1 组 × 10 次'},
    {n:'弹力带肩外旋', d:'大臂夹紧体侧、屈肘 90 度，手往外转', s:'2 组 × 15 次'}
  ]},

/* 2 引体向上机 */ { type:'ex', idx:1, id:'pu',
  name:'引体向上机（助力引体）', en:'Assisted Pull-up',
  target:'背阔肌 · 大圆肌 · 肱二头肌 · 斜方肌下束',
  sets:4, reps:'12-15', rest:50,
  setup:'调好助力重量（能完成 12-15 次），跪/站上垫，双手正握略宽于肩；重量以最后 2 次不靠甩、不耸肩为准。',
  steps:[
    '双手正握横杆，握距略宽于肩，悬垂时身体稳定、不前后荡',
    '先沉肩胛：把肩膀往裤兜里塞下去，再开始拉',
    '想象用肘把身体往杆上拉，胸口主动靠向杆、不仰头',
    '拉到下巴过杆（或胸贴近杆），顶峰夹背停 1 秒',
    '用 2-3 秒慢放，到手臂接近伸直但保持张力'
  ],
  notes:[
    '<b>先沉肩胛再拉</b>，顺序反了必耸肩，斜方肌上束代偿——这是练背最容易犯的错',
    '拉的时候想<b>"肘往地面踩"</b>，不是"手往上拽"，否则全练到肱二头肌',
    '<b>身体不要前后荡</b>（借力），核心收紧，腿交叉固定，让背阔肌单独干活',
    '下巴过杆即可，别过度后仰仰头，脖子放松',
    '下放过程要有控制，猛放会扯伤肩袖'
  ]},

/* 3 高位下拉 */ { type:'ex', idx:2, id:'lp',
  name:'高位下拉', en:'Lat Pulldown',
  target:'背阔肌 · 大圆肌 · 斜方肌中下束',
  sets:4, reps:'12-15', rest:50,
  setup:'横杆握外侧（约 1.5 倍肩宽）；重量以最后 2 次仍能沉肩胛、躯干不后仰过度为准。',
  steps:[
    '大腿卡紧固定垫，坐稳，脚掌踩实地面',
    '先沉肩胛，再开始拉',
    '躯干后仰 10-15 度、挺胸、核心收紧',
    '肘往斜下方插，拉到横杆至上胸/锁骨，顶峰停 1 秒',
    '用 2-3 秒慢放回，让背阔肌完全伸展'
  ],
  notes:[
    '<b>先沉肩胛再拉</b>，耸肩会让斜方肌上束代偿、脖子练粗',
    '后仰别超 20 度，过度后仰变借力、腰椎吃剪切力',
    '感觉是<b>"肘往下插"</b>，不是"手往下拽"，否则练到肱二头肌',
    '回放要控制，猛放会硬扯肩前侧',
    '全程<b>不耸肩、不仰头</b>，下巴微收'
  ]},

/* 4 坐姿划船 */ { type:'ex', idx:3, id:'row',
  name:'坐姿划船', en:'Seated Cable Row',
  target:'斜方肌中束 · 菱形肌 · 背阔肌 · 后束三角肌',
  sets:3, reps:'12-15', rest:50,
  setup:'装宽横杆或 V 柄，握两端；重量以全程躯干不晃为准。',
  steps:[
    '脚踏稳踏板，膝盖微屈带弹性，不锁死',
    '躯干直立微后倾，挺胸，肩胛先下沉',
    '肘尖朝斜后方，把杆拉向胸骨下缘',
    '顶峰肩胛夹紧，停 1 秒',
    '回放主动让肩胛"打开"前伸，展开胸椎'
  ],
  notes:[
    '<b>躯干绝不能前后晃</b>，身体一摆力就跑腰和下背',
    '宽握时<b>肘略高于手腕</b>、肘尖朝斜后，别朝正后夹紧',
    '<b>这条偏"背的厚度"</b>：为不把背练厚，保持中低重量、高次数，不冲大重量；女生尤其别在这条上加片',
    '全程挺胸，一旦含胸菱形肌就卸力',
    '手只是钩子，想<b>"用肘去戳后面的人"</b>'
  ]},

/* 5 龙门架直臂下拉 */ { type:'ex', idx:4, id:'sap',
  name:'龙门架直臂下拉', en:'Straight-Arm Pulldown',
  target:'背阔肌（下部）· 大圆肌 · 胸大肌下部',
  sets:3, reps:'12-15', rest:40,
  setup:'滑轮调至最高，装绳索或直杆，双手抓；重量轻到中，以手臂全程不打弯、不耸肩为准。',
  steps:[
    '站距与肩同宽，微屈膝，核心收紧，手臂从头顶略前举',
    '保持手臂完全伸直，用背阔肌把双手由上往下压到大腿前',
    '下压到最低点，背阔肌收紧、肋骨下沉，停 1 秒',
    '用 2-3 秒慢放回，让背阔肌被拉长，手回到头顶附近',
    '全程肘不弯、肩不耸'
  ],
  notes:[
    '这条的核心是<b>"手臂伸直"</b>——一弯肘就变成二头弯举，背阔肌瞬间下班',
    '<b>不耸肩</b>，肩膀始终往下压，把背阔肌孤立出来',
    '手只负责"钩住"绳索，发力点在腋下到腰侧的背阔肌',
    '回放别让重量带着手臂甩上去，控制着回',
    '腰椎别塌，肋骨下沉不外翻'
  ]},

/* 6 绳索面拉 */ { type:'ex', idx:5, id:'fp',
  name:'绳索面拉', en:'Face Pull',
  target:'后束三角肌 · 斜方肌下束 · 冈下肌/小圆肌',
  sets:3, reps:'12-15', rest:40,
  setup:'滑轮调至眼/额高度，装绳索；重量以全程站定不动为准，宁轻勿重。',
  steps:[
    '双手对握绳头，拇指朝向自己，手臂前伸',
    '肘与肩同高，把绳索拉向面部',
    '到末端做外旋：前臂向外打开，拳心转向斜上方，像"投降"姿势',
    '绳头停在太阳穴两侧，顶峰停 1 秒',
    '用 3 秒慢放回，全程保持肩胛下沉'
  ],
  notes:[
    '<b>腿只负责站稳</b>：不屈膝、不上下起伏、躯干不前后晃',
    '<b>必须做外旋</b>，只往后拉不打开，后束刺激直接减半',
    '<b>不耸肩</b>，肩膀始终往下沉，脖子两侧放松',
    '<b>放最后收尾、保留 2 次余力</b>：别力竭硬做，力竭时必耸肩代偿，反而练到脖子',
    '做对了感觉<b>肩后侧和肩胛骨下方</b>酸，脖子或手臂酸就是代偿了'
  ]},

/* 6 哑铃侧平举 */ { type:'ex', idx:6, id:'lat',
  name:'哑铃侧平举', en:'Dumbbell Lateral Raise',
  target:'三角肌中束（肩头）· 斜方肌上束（需避免）',
  sets:3, reps:'15-20', rest:40,
  setup:'站姿微屈膝，双手持轻哑铃（1-3kg 起步），拇指略朝上；重量以能做 15-20 次、肩不耸为准。',
  steps:[
    '双臂微屈自然垂于体侧，掌心相对，核心收紧',
    '用肩中束把哑铃向两侧平举，想象"肩膀把胳膊抬起来"',
    '举到与肩同高（手肘略低于肩），顶峰停 1 秒',
    '用 2-3 秒慢放，回到体侧但手不碰腿',
    '全程肩下沉、不耸肩，靠肩发力不靠甩'
  ],
  notes:[
    '想<b>"用肩把胳膊抬起来"</b>，不是用手甩——手只是钩子，肩膀才是发动机',
    '<b>全程不耸肩</b>，肩膀往下沉，否则练到的就是脖子两侧的上斜方（会变壮、显壮）',
    '举到<b>肩高就停</b>，别过头顶，过顶斜方上束就进场了',
    '拇指略朝上（"倒水"姿势），减少斜方参与、孤立中束',
    '<b>轻重量高次数（15-20）</b>：这是"肩头圆润线条"的练法，不是"大块肌肉"'
  ]},

/* 7 拉伸 */ { type:'list', title:'拉伸放松', sub:'松开背阔肌与胸前链 · 巩固宽度', ico:'拉',
  dur:'约 10 分钟', accent:'#4aa8ff', accentBg:'rgba(74,168,255,.13)',
  tip:'<b>为什么练完要拉伸背阔肌：</b>背阔肌练完会缩短变紧，它一紧就会把肩膀往下、往前带，长期下来又回到圆肩。拉伸背阔肌 + 胸肌，等于把刚练出来的"宽度"和"开肩"锁住，不让它被拉回去。另外提醒：想腰细，练背日千万别加杠铃/哑铃侧屈——那练的是腰侧（腹外斜肌），会把腰练厚，和"显腰细"正好相反。',
  items:[
    {n:'背阔肌门框拉伸', d:'单臂上举贴门框，身体向对侧侧移并微前屈', s:'2 × 30 秒/侧'},
    {n:'胸大肌门框拉伸', d:'小臂贴门框，身体往前跨并轻微外旋', s:'2 × 30 秒/侧'},
    {n:'胸小肌靠墙拉伸', d:'手放头后，前臂贴墙，身体前移', s:'2 × 30 秒/侧'},
    {n:'上斜方肌+肩胛提肌拉伸', d:'头侧倾并轻微前屈，手轻搭头顶', s:'2 × 30 秒/侧'},
    {n:'泡沫轴胸椎伸展', d:'轴在胸椎下方，双手抱头缓慢后仰', s:'约 2 分钟'}
  ]},

/* 8 完成 */ { type:'done' }
];

/* 统计总组数 */
PAGES.forEach(function(p){ if(p.type==='ex') TOTAL_SETS += p.sets; });

/* 按 idx 重排 ex 页：垂直拉优先 → 复合 → 直臂孤立 → 面拉收尾 */
(function(){
  var exs = PAGES.filter(function(p){return p.type==='ex';}).sort(function(a,b){return a.idx-b.idx;});
  var k=0, out=[];
  PAGES.forEach(function(p){ out.push(p.type==='ex' ? exs[k++] : p); });
  PAGES = out;
})();
var EX_COUNT = PAGES.filter(function(p){return p.type==='ex';}).length;
var DONE_KEY = 'backplan_v1';

/* ============ 动作示意图（SVG 线稿） ============ */
var FIG = {
 pu:
  '<svg viewBox="0 0 300 210" class="fig-svg" role="img" aria-label="引体向上机示意">'
  +'<defs><marker id="b0" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ff9f43"/></marker></defs>'
  +'<line x1="95" y1="28" x2="205" y2="28" stroke="#44566a" stroke-width="3"/>'
  +'<circle cx="115" cy="28" r="4" fill="none" stroke="#44566a" stroke-width="3"/>'
  +'<circle cx="185" cy="28" r="4" fill="none" stroke="#44566a" stroke-width="3"/>'
  +'<rect x="248" y="104" width="18" height="74" rx="3" fill="#1b242f" stroke="#44566a" stroke-width="2"/>'
  +'<line x1="248" y1="104" x2="248" y2="18" stroke="#44566a" stroke-width="2"/>'
  +'<line x1="150" y1="22" x2="150" y2="18" stroke="#44566a" stroke-width="2"/>'
  +'<circle cx="150" cy="58" r="12" fill="none" stroke="#00e0a4" stroke-width="3"/>'
  +'<line x1="150" y1="70" x2="150" y2="118" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="150" y1="118" x2="132" y2="152" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="150" y1="118" x2="168" y2="152" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<rect x="126" y="150" width="48" height="11" rx="3" fill="#1b242f" stroke="#44566a" stroke-width="2"/>'
  +'<line x1="150" y1="72" x2="115" y2="30" stroke="#00e0a4" stroke-width="3.5" stroke-linecap="round"/>'
  +'<line x1="150" y1="72" x2="185" y2="30" stroke="#00e0a4" stroke-width="3.5" stroke-linecap="round"/>'
  +'<line x1="222" y1="56" x2="222" y2="118" stroke="#ff9f43" stroke-width="2.5" marker-end="url(#b0)"/>'
  +'<text x="150" y="202" text-anchor="middle" fill="#ff9f43" font-size="11" font-weight="700">沉肩下拉 · 胸靠杆</text>'
  +'</svg>',

 lp:
  '<svg viewBox="0 0 300 210" class="fig-svg" role="img" aria-label="高位下拉示意">'
  +'<defs><marker id="b1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ff9f43"/></marker></defs>'
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
  +'<path d="M224 54 C 238 76, 238 96, 224 116" stroke="#ff9f43" stroke-width="2.5" fill="none" marker-end="url(#b1)"/>'
  +'<text x="150" y="202" text-anchor="middle" fill="#ff9f43" font-size="11" font-weight="700">宽握拉至上胸 · 肘下沉</text>'
  +'</svg>',

 row:
  '<svg viewBox="0 0 300 210" class="fig-svg" role="img" aria-label="坐姿划船示意">'
  +'<defs><marker id="b2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ff9f43"/></marker></defs>'
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
  +'<line x1="78" y1="80" x2="118" y2="80" stroke="#ff9f43" stroke-width="2.5" marker-end="url(#b2)"/>'
  +'<text x="150" y="202" text-anchor="middle" fill="#ff9f43" font-size="11" font-weight="700">肘朝斜后 · 夹肩胛</text>'
  +'</svg>',

 sap:
  '<svg viewBox="0 0 300 210" class="fig-svg" role="img" aria-label="龙门架直臂下拉示意">'
  +'<defs><marker id="b3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ff9f43"/></marker></defs>'
  +'<line x1="150" y1="10" x2="150" y2="20" stroke="#44566a" stroke-width="3"/>'
  +'<circle cx="150" cy="20" r="6" fill="none" stroke="#44566a" stroke-width="3"/>'
  +'<line x1="150" y1="24" x2="138" y2="30" stroke="#44566a" stroke-width="2"/>'
  +'<line x1="150" y1="24" x2="162" y2="30" stroke="#44566a" stroke-width="2"/>'
  +'<circle cx="138" cy="30" r="4" fill="none" stroke="#00e0a4" stroke-width="3"/>'
  +'<circle cx="162" cy="30" r="4" fill="none" stroke="#00e0a4" stroke-width="3"/>'
  +'<circle cx="150" cy="48" r="12" fill="none" stroke="#00e0a4" stroke-width="3"/>'
  +'<line x1="150" y1="60" x2="150" y2="118" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="150" y1="118" x2="133" y2="158" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="150" y1="118" x2="167" y2="158" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="138" y1="62" x2="138" y2="32" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="162" y1="62" x2="162" y2="32" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="133" y1="158" x2="126" y2="184" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="167" y1="158" x2="174" y2="184" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="222" y1="50" x2="222" y2="140" stroke="#ff9f43" stroke-width="2.5" marker-end="url(#b3)"/>'
  +'<text x="150" y="202" text-anchor="middle" fill="#ff9f43" font-size="11" font-weight="700">直臂下压 · 背阔肌伸展</text>'
  +'</svg>',

 fp:
  '<svg viewBox="0 0 300 210" class="fig-svg" role="img" aria-label="绳索面拉示意">'
  +'<defs><marker id="b4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ff9f43"/></marker></defs>'
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
  +'<line x1="236" y1="84" x2="186" y2="84" stroke="#ff9f43" stroke-width="2.5" marker-end="url(#b4)"/>'
  +'<text x="150" y="202" text-anchor="middle" fill="#ff9f43" font-size="11" font-weight="700">绳头到太阳穴 · 末端外旋</text>'
  +'</svg>',

 lat:
  '<svg viewBox="0 0 300 210" class="fig-svg" role="img" aria-label="哑铃侧平举示意">'
  +'<defs><marker id="b5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ff9f43"/></marker></defs>'
  +'<circle cx="150" cy="40" r="12" fill="none" stroke="#00e0a4" stroke-width="3"/>'
  +'<line x1="150" y1="52" x2="150" y2="150" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="150" y1="150" x2="133" y2="188" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="150" y1="150" x2="167" y2="188" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="150" y1="62" x2="118" y2="150" stroke="#44566a" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="4 4"/>'
  +'<line x1="150" y1="62" x2="182" y2="150" stroke="#44566a" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="4 4"/>'
  +'<line x1="150" y1="62" x2="104" y2="92" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<line x1="150" y1="62" x2="196" y2="92" stroke="#00e0a4" stroke-width="4" stroke-linecap="round"/>'
  +'<rect x="96" y="86" width="16" height="6" rx="2" fill="#1b242f" stroke="#44566a" stroke-width="2"/>'
  +'<rect x="188" y="86" width="16" height="6" rx="2" fill="#1b242f" stroke="#44566a" stroke-width="2"/>'
  +'<line x1="104" y1="150" x2="104" y2="104" stroke="#ff9f43" stroke-width="2.5" marker-end="url(#b5)"/>'
  +'<line x1="196" y1="150" x2="196" y2="104" stroke="#ff9f43" stroke-width="2.5" marker-end="url(#b5)"/>'
  +'<text x="150" y="202" text-anchor="middle" fill="#ff9f43" font-size="11" font-weight="700">举到肩高 · 不耸肩</text>'
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
      '<h1>女生综合练背计划</h1>'+
      '<p>练出背阔肌"宽度" · 打造倒三角显腰细<br>不厚背 · 不练粗上斜方 · 手臂只紧致 · 肩头可练圆</p>'+
    '</div>'+
    '<div class="big-banner">'+
      '<div class="bb-k">练背第一铁律 · 每一下都先做到</div>'+
      '<div class="bb-row">'+
        '<div class="bb-item"><div class="bb-t">先 <b>沉肩胛</b></div>'+
          '<div class="bb-d">拉之前先把肩膀往下"塞"进裤兜、远离耳朵。耸肩=练脖子（上斜方），背就白练了。</div></div>'+
        '<div class="bb-item"><div class="bb-t">用 <b>肘</b> 去拉</div>'+
          '<div class="bb-d">想象"肘往下后方插"，手只当钩子。靠肘带动＝背阔肌发力；靠手拽＝手臂代偿变粗。</div></div>'+
      '</div>'+
    '</div>'+
    '<div class="timebar">'+
      '<div class="tb-seg" style="flex:10;background:#ff9f43">10<small>分钟</small><span>热身</span></div>'+
      '<div class="tb-seg" style="flex:38;background:#00e0a4">38<small>分钟</small><span>主体</span></div>'+
      '<div class="tb-seg" style="flex:10;background:#4aa8ff">10<small>分钟</small><span>拉伸</span></div>'+
    '</div>'+
    '<div class="tb-legend">'+
      '<span><i style="background:#ff9f43"></i>热身 10</span>'+
      '<span><i style="background:#00e0a4"></i>主体 38</span>'+
      '<span><i style="background:#4aa8ff"></i>拉伸 10</span>'+
      '<span style="color:var(--accent);font-weight:700">合计 约 58 分钟</span>'+
    '</div>'+
    '<div class="kv" style="margin-top:16px">'+
      '<div class="kv-item"><div class="kv-k">主项动作</div><div class="kv-v">6 <small>个</small></div></div>'+
      '<div class="kv-item"><div class="kv-k">总组数</div><div class="kv-v">'+TOTAL_SETS+' <small>组</small></div></div>'+
      '<div class="kv-item"><div class="kv-k">每组次数</div><div class="kv-v">12-15 <small>次</small></div></div>'+
      '<div class="kv-item"><div class="kv-k">组间歇</div><div class="kv-v">40-50 <small>秒</small></div></div>'+
    '</div>'+
    '<div class="card" style="margin-top:14px">'+
      '<div class="card-hd"><div class="card-ico" style="background:rgba(255,159,67,.13);color:#ff9f43">!</div>'+
      '<div class="card-t">先看这 3 条，比动作本身更重要</div></div>'+
      '<div style="font-size:12.5px;line-height:1.75;color:#c4d0dc">'+
        '<div style="margin-bottom:8px"><b style="color:#ffc78b">1. 这条计划练的是背阔肌"宽度"。</b>背练宽 → 肩膀和背撑开 → 腰在视觉上显细（"倒三角"）。所以全程不追求背的厚度，也避开一切耸肩类动作。</div>'+
        '<div style="margin-bottom:8px"><b>2. 两件事这里都规避了。</b>① <b>不练粗上斜方</b>：每条动作第一句都是"沉肩、不耸肩"，耸肩才练脖子；② <b>手臂不练粗</b>：不做二头弯举、手只当钩子，把背阔肌孤立出来。</div>'+
        '<div style="margin-bottom:8px"><b>3. 肩头的肌肉（三角肌中束）反而要练。</b>它让肩膀有圆润肩线、又不显壮，已加入哑铃侧平举。</div>'+
        '<div style="margin-top:5px;padding-top:9px;border-top:1px solid var(--border)"><b style="color:#ff8fa0">避开清单：</b>不做杠铃耸肩、不大重量划船（背会变厚）、不做二头弯举、不做负重侧屈（腰会变粗）。</div>'+
      '</div>'+
    '</div>'+
    '<div class="tip" style="margin-top:14px"><b>动作顺序：</b>热身沉肩激活 → 引体向上机 → 高位下拉 → 坐姿划船 → 龙门架直臂下拉 → 绳索面拉 → 哑铃侧平举 → 拉伸。垂直拉优先、复合在前、面拉收尾别力竭，侧平举练肩头。</div>'+
    '<div class="sec-t">训练流程（点任意动作可直接跳过去）</div>'+
    '<div class="ov-list">'+
      '<div class="ov-item" data-go="1"><div class="ov-n" style="background:rgba(255,159,67,.13);color:#ff9f43">热</div>'+
        '<div class="ov-name">热身激活</div><div class="ov-s">10 分钟</div></div>'+
      listHtml+
      '<div class="ov-item" data-go="7"><div class="ov-n" style="background:rgba(74,168,255,.13);color:#4aa8ff">拉</div>'+
        '<div class="ov-name">拉伸放松</div><div class="ov-s">10 分钟</div></div>'+
    '</div>'+
    '<div class="tip" style="margin-top:14px"><b>频率：</b>综合背日每周 1 次即可，与驼背计划分日搭配（如背日一三、姿势日二五）；坚持 6-8 周背部轮廓才有明显变化。</div>'+
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

  return '<div class="page">'+
    '<div class="ex-head">'+
      '<div class="ex-idx">'+p.idx+'</div>'+
      '<div class="ex-title"><h2>'+p.name+'</h2>'+
        '<div class="ex-en">'+p.en+' · 第 '+p.idx+' / '+EX_COUNT+' 个动作</div>'+
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
      '<div class="kv-item"><div class="kv-k">建议频率</div><div class="kv-v">1 <small>次/周</small></div></div>'+
    '</div>'+
    '<div class="card">'+
      '<div class="card-hd"><div class="card-ico">&#9635;</div><div class="card-t">练完必做的 3 件事</div></div>'+
      '<div style="font-size:12.5px;line-height:1.8;color:#c4d0dc">'+
        '<div style="margin-bottom:8px"><b>1. 记录发力感。</b>在备忘录记一句"今天哪个动作感觉到腋下到腰侧酸了"。背阔肌感觉越强，说明沉肩做得越对、没被斜方肌上束抢活。</div>'+
        '<div style="margin-bottom:8px"><b>2. 和驼背计划分日练。</b>今天练了宽度，明天或后天再练姿势肌，别连着把后链小肌肉榨干——那正是斜方肌代偿的温床。</div>'+
        '<div><b>3. 下次拍个侧面视频。</b>手机架胸口高度、距离 2.5-3 米，可自行检查引体/高位下拉有没有耸肩、躯干晃不晃。</div>'+
      '</div>'+
    '</div>'+
    '<div class="tip"><b>预期时间表：</b>1-2 周背阔肌发力感变清晰；3-4 周背的宽度和"倒三角"轮廓开始显现；6-8 周他人能看出变化。<b>若颈后/上斜方肌常酸痛，说明一直在耸肩代偿，优先降重量、先练沉肩。</b></div>'+
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
  var done=0; PAGES.forEach(function(q){ if(q.type==='ex') done+=(ST.sets[q.id]||[]).length; });
  document.getElementById('progFill').style.width=(TOTAL_SETS?done/TOTAL_SETS*100:0)+'%';
  if(p.type==='cover'){ document.getElementById('headTitle').textContent='女生综合练背计划'; }
  else if(p.type==='ex'){ document.getElementById('headTitle').textContent=p.name; }
  else if(p.type==='list'){ document.getElementById('headTitle').textContent=p.title; }
  else { document.getElementById('headTitle').textContent='训练完成'; }
  document.getElementById('headMeta').innerHTML='<b>'+done+'</b> / '+TOTAL_SETS+' 组';

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
