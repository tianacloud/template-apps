import './style.css';
import body from './body.html?raw';
const css = document.createElement('link'); css.rel='stylesheet'; css.href=new URL('./app.css', import.meta.url).href; document.head.appendChild(css);
import { sql } from './db.js';
export async function mount(root, { files }) {
root.innerHTML=body;
let photoBusy = false;
let photoUnbind = [];
function bindPhoto(image, path) {
  files.bindImage(image, path).then(unbind => photoUnbind.push(unbind)).catch(error => {
    image.alt = '照片读取失败'; console.error(error);
  });
}
async function storePhoto(blob) {
  const path = 'photos/' + crypto.randomUUID() + '.jpg';
  let uploadId;
  try {
    await files.put(path, blob, { onPrepared: receipt => { uploadId = receipt.id; } });
  } catch (error) {
    if (!uploadId) throw error;
    try {
      let status = await files.uploadStatus(uploadId);
      if (!status.completed) status = await files.completeUpload(uploadId);
      if (status.completed) return path;
    } catch (_) { /* retain the upload reference for investigation */ }
    throw new Error('照片上传结果未确认，上传编号：' + uploadId + '，路径：' + path);
  }
  return path;
}
async function dataBlob(data) {
  if (!/^data:image\/(jpeg|png|webp);base64,/i.test(data)) throw new Error('照片格式不支持');
  return await (await fetch(data)).blob();
}
async function preparePhotos(done) {
  for (const record of Object.values(done)) {
    if (!record || !record.photo) continue;
    if (record.photo.startsWith('data:')) record.photo = await storePhoto(await dataBlob(record.photo));
    else if (/^photos\/[a-zA-Z0-9-]+\.jpg$/.test(record.photo)) continue;
    else throw new Error('照片路径无效');
  }
}


var DATA = {
  study: { name:'宅家', color:'#A8813F', items:[
    '窝在沙发里追完一部想看很久的剧',
    '周末睡到自然醒，不当闹钟的奴隶',
    '给自己煮一碗热腾腾的酒酿圆子',
    '把房间大扫除一遍，扔掉用不上的东西',
    '点一支香薰，窝在床上看半天书',
    '雨天裹着被子听雨声睡个午觉',
    '给自己做一顿有仪式感的摆盘早餐',
    '深夜煮一碗泡面，认认真真加个蛋',
    '把手机相册整理一遍，删掉废片',
    '在阳台晒一次被子，闻闻阳光的味道',
    '给自己放一天假，什么都不安排',
    '试一次泡个热水澡彻底放松',
    '把穿不上的旧衣服叠好送人或捐掉'
  ]},
  skill: { name:'吃喝', color:'#A8892F', items:[
    '买一杯「秋天的第一杯奶茶」',
    '去夜市吃一份烤冷面或章鱼小丸子',
    '给自己做一顿想了很久的拿手菜',
    '凌晨去便利店买一份热乎的关东煮',
    '去喝一次早茶，慢悠悠吃点心',
    '在路边摊嗦一碗热干面或米粉',
    '尝试一杯从没喝过的新饮品',
    '给自己烤一盘曲奇或小饼干',
    '去一家种草很久的店打卡',
    '在家调一杯属于自己的特调饮品',
    '去菜市场买菜，回家自己下厨',
    '和好朋友拼单点一桌外卖一起分享',
    '深夜吃一碗甜品，治愈一下自己'
  ]},
  social: { name:'朋友', color:'#A85C63', items:[
    '和闺蜜或兄弟拍一组搞怪合照',
    '深夜和好朋友语音聊到快睡着',
    '给远方的朋友寄一张手写明信片',
    '和好朋友拼单奶茶，一起干杯',
    '约朋友去公园野餐一下午',
    '给帮过你的人发一条认真的感谢',
    '和老友视频通话，聊聊近况',
    '和喜欢的人一起看一场电影',
    '组织一次不用赶时间的聚会',
    '跟朋友去 KTV 唱一首拿手的歌',
    '和好朋友说走就走去附近逛逛',
    '给家人打一个超过一小时的电话'
  ]},
  exp: { name:'出门', color:'#5A6E8C', items:[
    '推着购物车在超市里慢慢逛',
    '去公园喂一次鸽子，或看大爷下棋',
    '坐一次双层巴士，坐最上层看风景',
    '去菜市场感受一下人间烟火气',
    '在深夜无人的马路上散步',
    '去拍一张今天的天空存个档',
    '逛一次宜家，不买东西也开心',
    '在路边发现一只猫，蹲下来看一会',
    '去逛一次热热闹闹的夜市',
    '坐一次摩天轮，在最高点拍照',
    '去书店待一个安静的下午',
    '在城市里随机坐上一辆公交坐到终点',
    '去打卡一家一直想去的小店'
  ]},
  travel: { name:'自然', color:'#6C7D4C', items:[
    '看一次日出，等天一点点亮起来',
    '看一次日落，看天被染红半边',
    '去海边光脚踩水、捡几个贝壳',
    '雨天故意踩一个小水坑',
    '爬一座山，登顶看一次云海',
    '在雨后清新的空气里大口深呼吸',
    '在阳台养一盆好养活的多肉',
    '去公园长椅上晒一会儿太阳',
    '捡几片好看的落叶，夹进书里',
    '在窗边看一次下雪',
    '去一座没有攻略的小城走走',
    '在阳台挂一串风铃，听风响'
  ]},
  body: { name:'治愈', color:'#736688', items:[
    '给自己买一束花，插在床头',
    '给自己写一张鼓励的小便利贴',
    '去撸一次猫，或撸一次狗',
    '给自己做一杯手冲咖啡',
    '去泡一次温泉，或去澡堂放松',
    '在窗边看雨，发一会儿呆',
    '给自己买一件喜欢的小饰品',
    '买一件软乎乎的新睡衣',
    '给自己煮一壶热茶，慢慢喝',
    '去寺庙或安静的地方，祈个福',
    '深夜听一首老歌，单曲循环',
    '给自己种一盆草莓或小番茄',
    '大扫除之后点上香薰，彻底躺平'
  ]},
  money: { name:'玩乐', color:'#B45A34', items:[
    '去游乐园坐一次过山车',
    '和朋友玩一次密室逃脱或剧本杀',
    '去电玩城抓一次娃娃',
    '去露营一次，躺在地上看星星',
    '去 livehouse 听一场现场演出',
    '在跨年的时候和人群一起倒数',
    '在夜晚放一次仙女棒或小烟花',
    '去一次音乐节，嗨到尽兴',
    '去拍一组胶片感的照片',
    '给自己买一个解压玩具',
    '周末去近郊徒步一次',
    '去动物园看一次可爱的动物'
  ]},
  self: { name:'记录', color:'#3F6E75', items:[
    '做一个属于自己的专属歌单',
    '收集几张好看的电影票根',
    '给自己录一段生活 vlog',
    '在日记里写一次不加修饰的自己',
    '拍一组周末的生活碎片',
    '给自己拍一张满意的自拍',
    '给十年后的自己写一封信',
    '每天记一件让自己开心的小事',
    '拍下和家人的一张合照',
    '在跨年写一句对明年的期许',
    '把一次旅行的票根做成手账',
    '存一张「今天也很努力」的截图'
  ]}
};

var ORDER = ['study','skill','social','exp','travel','body','money','self'];
var MOODS = ['😀','😊','🥰','😌','😎','🤩','🥳','😢','😤','😴','🤔','🌟'];

var state = { tasks:[], done:{}, filter:'all', view:'home', todayPick:null, editId:null, recId:null };

/* ---------- 初始化数据 ---------- */
function buildDefaultTasks(){
  var arr = [], n = 1;
  ORDER.forEach(function(cat){
    DATA[cat].items.forEach(function(text){
      arr.push({ id:n, cat:cat, text:text, custom:false });
      n++;
    });
  });
  return arr;
}

function initTasks(){ state.tasks = buildDefaultTasks(); }
function initDone(){ state.done = {}; }

function normalizeDone(){
  for (var k in state.done){
    var r = state.done[k];
    if (!r || typeof r !== 'object'){ state.done[k] = { date:'', time:'', mood:'', note:'', photo:'' }; continue; }
    if (typeof r.date !== 'string') r.date = '';
    if (typeof r.time !== 'string') r.time = '';
    if (typeof r.mood !== 'string') r.mood = '';
    if (typeof r.note !== 'string') r.note = '';
    if (typeof r.photo !== 'string') r.photo = '';
  }
}

function saveTasks(){ scheduleSync(); }
function saveDone(){ scheduleSync(); }
function save(){ saveDone(); }

function taskById(id){ for (var i=0;i<state.tasks.length;i++){ if (state.tasks[i].id == id) return state.tasks[i]; } return null; }
function doneCount(){ var c=0; for (var k in state.done){ if (state.done[k]) c++; } return c; }
function totalCount(){ return state.tasks.length; }

/* ---------- 工具函数 ---------- */
function pad(n){ return (n<10?'0':'') + n; }
function todayISO(){ var d=new Date(); return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); }
function nowTime(){ var d=new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
function mdOf(iso){ if (iso && /^\d{4}-(\d{2})-(\d{2})$/.test(iso)){ var m=iso.match(/^\d{4}-(\d{2})-(\d{2})$/); return m[1] + '.' + m[2]; } return iso || '日期未知'; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

/* ---------- 文案 ---------- */
var TIPS = [
  [0, 0, '一生很长，先从第一件开始。'],
  [0.01, 0.24, '起步了。别急着做大的，先做完小的。'],
  [0.25, 0.49, '四分之一。你已经比大多数人走得远了。'],
  [0.5, 0.74, '过半了。剩下的才是有意思的那一半。'],
  [0.75, 0.99, '最后一程。别留遗憾给我看。'],
  [1, 1, '全部完成。这一生，没白过。']
];
function tipFor(c, total){
  var p = total ? c / total : 0;
  for (var i=0;i<TIPS.length;i++){ if (p >= TIPS[i][0] && p <= TIPS[i][1]) return TIPS[i][2]; }
  return TIPS[0][2];
}

/* ---------- 渲染 ---------- */
var listEl = document.getElementById('list');
var filtersEl = document.getElementById('filters');

function buildFilters(){
  var total = totalCount();
  var html = '<button class="chip' + (state.filter === 'all' ? ' on' : '') +
             '" data-f="all">全部<span class="c">' + total + '</span></button>';
  ORDER.forEach(function(cat){
    var cnt = state.tasks.filter(function(t){ return t.cat === cat; }).length;
    html += '<button class="chip' + (state.filter === cat ? ' on' : '') +
            '" data-f="' + cat + '">' + DATA[cat].name +
            '<span class="c">' + cnt + '</span></button>';
  });
  filtersEl.innerHTML = html;
}

function buildList(){
  var html = '';
  ORDER.forEach(function(cat){
    if (state.filter !== 'all' && state.filter !== cat) return;
    var items = state.tasks.filter(function(t){ return t.cat === cat; });
    var d = items.filter(function(t){ return state.done[t.id]; }).length;
    html += '<section class="section" data-cat="' + cat + '">';
    html += '<div class="sec-head"><span class="sec-name" style="color:' + DATA[cat].color + '">' +
            DATA[cat].name + '</span><span class="sec-rule"></span>' +
            '<span class="sec-count">' + d + ' / ' + items.length + '</span></div>';
    html += '<div class="grid">';
    items.forEach(function(t){
      var on = !!state.done[t.id];
      var r = on ? state.done[t.id] : null;
      var meta = '';
      if (on && r){
        var bits = [];
        if (r.mood) bits.push('<span class="tag">' + esc(r.mood) + '</span>');
        if (r.photo) bits.push('<span class="tag">📷 照片</span>');
        bits.push('<span class="tag">' + esc(mdOf(r.date)) + '</span>');
        meta = '<div class="imeta" data-tool="rec" data-i="' + esc(t.id) + '">' + bits.join('') + '</div>';
      }
      html += '<div class="item' + (on ? ' done' : '') + '" data-i="' + esc(t.id) + '">' +
              '<span class="no">' + (t.custom ? '★' : (t.id < 10 ? '0' + t.id : t.id)) + '</span>' +
              '<span class="txt">' + esc(t.text) + '</span>' +
              '<span class="box"><svg width="11" height="11" viewBox="0 0 12 12">' +
              '<path d="M2.4 6.3L4.8 8.6L9.6 3.4" fill="none" stroke="#FFFFFF" stroke-width="1.9" ' +
              'stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
              meta +
              '<div class="itools">' +
                '<button class="itool" data-tool="edit" data-i="' + esc(t.id) + '">编辑</button>' +
                '<button class="itool" data-tool="rec" data-i="' + esc(t.id) + '">' +
                  (on ? '记录' : '记一笔') + '</button>' +
                '<button class="itool del" data-tool="del" data-i="' + esc(t.id) + '">删除</button>' +
              '</div>' +
              '</div>';
    });
    html += '</div></section>';
  });
  listEl.innerHTML = html;
}

function refreshStats(){
  var c = doneCount(), total = totalCount();
  document.getElementById('num').textContent = c;
  document.getElementById('slashNum').textContent = '/ ' + total;
  document.getElementById('bar').style.width = (total ? c / total * 100 : 0) + '%';
  document.getElementById('tip').textContent = tipFor(c, total);
}

function pickToday(){
  var left = state.tasks.filter(function(t){ return !state.done[t.id]; });
  if (!left.length) return null;
  return left[Math.floor(Math.random() * left.length)];
}

function renderToday(){
  var box = document.getElementById('todayCard');
  if (state.todayPick && state.done[state.todayPick.id]) state.todayPick = null;
  if (!state.todayPick) state.todayPick = pickToday();

  if (!state.todayPick){
    box.innerHTML = '<div class="today-label">今 天 做 一 件</div>' +
      '<div class="today-done">全部完成。这一生，没白过。</div>';
    return;
  }
  box.innerHTML =
    '<div class="today-label">今 天 做 一 件</div>' +
    '<div class="today-text">' + esc(state.todayPick.text) + '</div>' +
    '<div class="today-acts">' +
      '<button class="btn primary" data-act="doit">就它了，记一笔</button>' +
      '<button class="btn" data-act="shuffle">换一件</button>' +
      '<button class="btn ghost" data-act="open">在清单里看</button>' +
    '</div>';
}

function renderCats(){
  var html = '';
  ORDER.forEach(function(cat){
    var items = state.tasks.filter(function(t){ return t.cat === cat; });
    var d = items.filter(function(t){ return state.done[t.id]; }).length;
    var pct = items.length ? (d / items.length * 100) : 0;
    html += '<button class="catcard" data-cat="' + cat + '" type="button">' +
      '<div class="cat-h"><span class="cat-name" style="color:' + DATA[cat].color + '">' +
        DATA[cat].name + '</span><span class="cat-n">' + d + ' / ' + items.length + '</span></div>' +
      '<div class="cat-bar"><i style="width:' + pct.toFixed(1) + '%;background:' +
        DATA[cat].color + '"></i></div>' +
      '</button>';
  });
  document.getElementById('catGrid').innerHTML = html;
}

function renderRecent(){
  var arr = [];
  for (var k in state.done){
    var r = state.done[k];
    if (r) arr.push({ id:k, date:r.date || '', mood:r.mood || '', photo:r.photo || '', t:taskById(k) });
  }
  arr.sort(function(a, b){
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return 0;
  });
  var top = arr.slice(0, 5);
  var box = document.getElementById('recentBox');
  if (!top.length){
    box.innerHTML = '<p class="recent-empty" style="font-size:13.5px;color:var(--ink3);padding:14px 0">还没有打卡记录。第一件，随时可以开始。</p>';
    return;
  }
  var html = '';
  top.forEach(function(r){
    if (!r.t) return;
    var thumb = r.photo ? '<img class="rec-thumb" data-photo="' + esc(r.photo) + '" data-tool="rec" data-i="' + esc(r.id) + '" alt="照片">' : '';
    var meta = '';
    if (r.mood) meta += '<span>' + esc(r.mood) + '</span>';
    if (r.photo) meta += '<span>📷</span>';
    html += '<div class="rec"><span class="rec-d">' + esc(mdOf(r.date)) + '</span>' +
            '<div class="rec-body"><div class="rec-t">' + esc(r.t.text) + '</div>' +
            (meta ? '<div class="rec-meta">' + meta + '</div>' : '') + '</div>' + thumb + '</div>';
  });
  photoUnbind.forEach(fn => fn()); photoUnbind = [];
  box.innerHTML = html;
  box.querySelectorAll('[data-photo]').forEach(img => bindPhoto(img, img.dataset.photo));
}

function renderHome(){
  var c = doneCount(), total = totalCount();
  document.getElementById('homeNum').textContent = c;
  document.getElementById('sealNum').textContent = c;
  document.getElementById('homeTip').textContent = tipFor(c, total);
  document.getElementById('coverTotal').textContent = total;
  document.getElementById('coverTotal2').textContent = total;
  document.getElementById('metaTotal').textContent = total + ' 件事';
  document.getElementById('ringTotal').textContent = '共 ' + total + ' 件';
  var C = 2 * Math.PI * 70;
  var arc = document.getElementById('ringArc');
  arc.setAttribute('stroke-dasharray', C.toFixed(1));
  arc.setAttribute('stroke-dashoffset', (C * (1 - (total ? c / total : 0))).toFixed(1));
}

function refreshAll(){
  buildFilters();
  buildList();
  refreshStats();
  renderHome();
  renderToday();
  renderCats();
  renderRecent();
  renderAchPeek();
  if (state.view === 'ach') renderAchWall();
}

function switchView(v){
  state.view = v;
  document.getElementById('viewHome').classList.toggle('active', v === 'home');
  document.getElementById('viewList').classList.toggle('active', v === 'list');
  document.getElementById('viewAch').classList.toggle('active', v === 'ach');
  window.scrollTo(0, 0);
  if (v === 'ach'){
    renderAchWall();
    if ((achStatsState === 'idle' || achStatsState === 'fail') && !achStatsLoading) loadAchStats(true);
  }
}

function toggle(i){
  if (state.done[i]) { delete state.done[i]; }
  else { state.done[i] = { date:todayISO(), time:nowTime(), mood:'', note:'', photo:'' }; onItemDone(i); }
  save();
  refreshAll();
  var numEl = document.getElementById('num');
  if (state.done[i]){
    numEl.classList.remove('bump');
    void numEl.offsetWidth;
    numEl.classList.add('bump');
  }
}

/* ---------- 列表交互：打卡 / 编辑 / 记录 / 删除 ---------- */
listEl.addEventListener('click', function(e){
  var tool = e.target.closest('[data-tool]');
  if (tool){
    e.stopPropagation();
    var id = tool.dataset.i;
    var act = tool.dataset.tool;
    if (act === 'edit') openEdit(id);
    else if (act === 'rec') openRec(id, false);
    else if (act === 'del') deleteTask(id);
    return;
  }
  var el = e.target.closest('.item');
  if (!el) return;
  toggle(el.dataset.i);
});

filtersEl.addEventListener('click', function(e){
  var b = e.target.closest('.chip');
  if (!b) return;
  filtersEl.querySelectorAll('.chip').forEach(function(x){ x.classList.remove('on'); });
  b.classList.add('on');
  state.filter = b.dataset.f;
  buildList();
});

/* 最近完成里的照片点击 */
document.getElementById('recentBox').addEventListener('click', function(e){
  var t = e.target.closest('[data-tool="rec"]');
  if (t){ e.stopPropagation(); openRec(t.dataset.i, false); }
});

document.getElementById('randomBtn').addEventListener('click', function(){
  var left = state.tasks.filter(function(t){ return !state.done[t.id]; });
  if (!left.length){ alert('全部做完了。你挺厉害的。'); return; }
  var pick = left[Math.floor(Math.random() * left.length)];
  if (state.filter !== 'all' && state.filter !== pick.cat){
    state.filter = 'all';
    buildFilters();
    buildList();
  }
  var el = listEl.querySelector('.item[data-i="' + pick.id + '"]');
  if (el){
    el.scrollIntoView({ behavior:'smooth', block:'center' });
    el.classList.remove('pulse');
    void el.offsetWidth;
    el.classList.add('pulse');
  }
});

document.getElementById('resetBtn').addEventListener('click', function(){
  if (!confirm('确定清空全部打卡记录（含心情和照片）？任务清单会保留。这个操作不能撤销。')) return;
  state.done = {};
  state.todayPick = null;
  saveDone();
  refreshAll();
});

/* ---------- 打卡卡 · 个性化评语（几人几样，按用户真实完成数据生成） ---------- */
function cardLines(){
  var c = doneCount(), lines = [];
  if (c === 0) lines.push('清单还空着，但你已经打开了这一页——第一步总是最难的。');
  else if (c === 1) lines.push('第一件已落袋。从 0 到 1，往往比从 99 到 100 更难。');
  else if (c < 10) lines.push(c + ' 件到手，习惯的种子才刚刚发芽。');
  else if (c < 25) lines.push(c + ' 件完成，这条清单开始有你的形状了。');
  else if (c < 50) lines.push('已过 ' + c + ' 件，半程在望，全是实打实过出来的日子。');
  else if (c < 75) lines.push(c + ' 件，你比大多数出发的人走得更远。');
  else if (c < 100) lines.push('就差最后 ' + (100 - c) + ' 件，满级人类在招手。');
  else lines.push('100 件全部点亮——这一面墙，全是你的。');
  if (c === 0){ lines.push('别急，从最小的一件开始——比如今晚早点睡。'); return lines; }

  function md(iso){ var p = String(iso || '').split('-'); return (parseInt(p[1], 10)) + ' 月 ' + (parseInt(p[2], 10)) + ' 日'; }

  // 最勤快的分类 + 类别广度
  var best = null, bestN = 0, catsTouched = 0;
  ORDER.forEach(function(cat){
    var d = 0;
    state.tasks.forEach(function(t){ if (t.cat === cat && state.done[t.id]) d++; });
    if (d > 0) catsTouched++;
    if (d > bestN){ bestN = d; best = cat; }
  });
  if (best){
    var tail = { study:'，把家过成了最舒服的地方。', skill:'，烟火气从没断过。', social:'，人缘都藏在这些细节里。',
      exp:'，日子过得挺开。', travel:'，你常去大自然里充电。', body:'，你很会照顾自己。',
      money:'，会玩的人才懂得生活。', self:'，你认真记录着这一切。' };
    lines.push('最勤快的是「' + DATA[best].name + '」：' + bestN + ' 件' + (tail[best] || '。'));
  }

  // 时间跨度（坚持了多久）
  var spanLine = '';
  (function(){
    var min = '', max = '';
    for (var k in state.done){ var r = state.done[k]; if (r && r.date){ if (!min || r.date < min) min = r.date; if (!max || r.date > max) max = r.date; } }
    if (min && max && min !== max){
      var days = Math.round((new Date(max) - new Date(min)) / 86400000);
      if (days >= 3) spanLine = '从 ' + md(min) + ' 到 ' + md(max) + '，这条清单你养了 ' + days + ' 天。';
    }
  })();

  // 标志性单品（命中的才出现）
  var flags = [
    { id:1,   t:'电子榨菜没少吃，快乐从来不将就。' },
    { id:2,   t:'和闹钟和解了，身体终于自己做主。' },
    { id:3,   t:'深夜给自己煮过一碗圆子，胃先得到了安慰。' },
    { id:6,   t:'有过一个裹着被子听雨的午觉。' },
    { id:10,  t:'收过一床带太阳味道的被子。' },
    { id:11,  t:'你旷过自己的工——会给自己放假的人，走得远。' },
    { id:13,  t:'给衣柜断过一次舍离，腾笼换鸟。' },
    { id:15,  t:'夜市的烟火气，你亲自去沾过。' },
    { id:19,  t:'有过嗦第一口、世界安静的时刻。' },
    { id:24,  t:'体验过砍价成功的成就感，人间烟火鉴赏家。' },
    { id:28,  t:'有过一通很安心的深夜电话。' },
    { id:29,  t:'寄出过一封手写的信，见字如面。' },
    { id:33,  t:'有两小时起不封顶的友情，很富。' },
    { id:34,  t:'在电影院里，当过爱情片预习生。' },
    { id:40,  t:'看过大爷下棋，比股票精彩。' },
    { id:42,  t:'起过大早逛菜市场，城市的底妆你见过。' },
    { id:44,  t:'你认真收藏过一片天空——浪漫是具体的。' },
    { id:49,  t:'在不赶人的书店里，待过一下午。' },
    { id:52,  t:'守过凌晨四点的人，见过大多数人没见过的夜。' },
    { id:59,  t:'晒够半小时，给自己充过电。' },
    { id:64,  t:'给自己买过花的人，浪漫自给自足。' },
    { id:69,  t:'拿过「发呆学博士学位」——顶级放松，你会的。' },
    { id:74,  t:'被一首老歌，送回青春过。' },
    { id:75,  t:'阳台农场主的甜，是自己种出来的。' },
    { id:80,  t:'追过不花钱的星星。' },
    { id:83,  t:'举过仙女棒，氛围全开。' },
    { id:95,  t:'你给未来的自己写过信——这件小事，很多人一辈子没做。' },
    { id:96,  t:'快乐是攒出来的，你一直在攒。' },
    { id:100, t:'连第 100 件都拿下了，收尾收得漂亮。' }
  ];
  var hit = flags.filter(function(f){ return !!state.done[f.id]; });

  // 心情主线
  var moodN = {}, topMood = '', topMoodN = 0;
  for (var k in state.done){ var r = state.done[k]; if (r && r.mood) moodN[r.mood] = (moodN[r.mood] || 0) + 1; }
  for (var m in moodN){ if (moodN[m] > topMoodN){ topMoodN = moodN[m]; topMood = m; } }
  var moodLine = (topMood && topMoodN >= 2)
    ? '你的打卡里「' + topMood + '」出现最多（' + topMoodN + ' 次）——会照顾自己情绪的人，走得远。' : '';

  // 类别广度
  var breadthLine = '';
  if (catsTouched >= 6) breadthLine = ORDER.length + ' 个类别你闯了 ' + catsTouched + ' 个，雨露均沾型。';
  else if (catsTouched <= 2 && c >= 3) breadthLine = '火力集中在 ' + catsTouched + ' 个类别，是个深耕型选手。';

  // 自定义目标数
  var customN = 0;
  state.tasks.forEach(function(t){ if (t.custom && state.done[t.id]) customN++; });
  var customLine = customN > 0 ? ('其中 ' + customN + ' 件是你自己加的目标，你动手改写了这份清单。') : '';

  // 照片 / 文字记录数
  var richN = 0;
  for (var k in state.done){ var r = state.done[k]; if (r && (r.photo || (r.note && String(r.note).trim()))) richN++; }
  var richLine = richN > 0 ? ('你给 ' + richN + ' 件事留了照片或文字——记忆有处安放。') : '';

  // 按优先级补足到 7 条（未命中的维度跳过，绝不产生空行）
  var pool = [];
  if (spanLine) pool.push(spanLine);
  if (hit[0]) pool.push(hit[0].t);
  if (moodLine) pool.push(moodLine);
  if (breadthLine) pool.push(breadthLine);
  if (customLine) pool.push(customLine);
  if (richLine) pool.push(richLine);
  if (hit[1]) pool.push(hit[1].t);
  if (hit[2]) pool.push(hit[2].t);
  if (hit[3]) pool.push(hit[3].t);
  for (var i = 0; i < pool.length && lines.length < 7; i++) lines.push(pool[i]);
  return lines;
}

/* Canvas 中文按宽度换行 */
function wrapText(ctx, text, maxW){
  var segs = [], cur = '';
  for (var i = 0; i < text.length; i++){
    var ch = text.charAt(i);
    if (cur && ctx.measureText(cur + ch).width > maxW){ segs.push(cur); cur = ch; }
    else cur += ch;
  }
  if (cur) segs.push(cur);
  return segs;
}

/* ---------- 打卡卡（Canvas） ---------- */
document.getElementById('shareBtn').addEventListener('click', function(){
  var cv = document.getElementById('card');
  var ctx = cv.getContext('2d');
  var W = 900, PAD = 72;
  var c = doneCount(), total = totalCount();
  var lines = cardLines();

  // 预排版：先把评语按宽度换行，算出自适应高度（避免底部大片留白）
  ctx.font = '24px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  var groups = lines.map(function(l){ return wrapText(ctx, l, W - PAD * 2 - 40); });
  var evalRows = groups.reduce(function(s, g){ return s + g.length; }, 0);
  var catEndY = 546 + ORDER.length * 62;
  var headY = catEndY + 46;
  var lineY0 = headY + 52;
  var evalH = evalRows * 38 + groups.length * 12;
  var dividerY = lineY0 + evalH + 28;
  var footerY = dividerY + 56;
  var H = footerY + 64;

  cv.width = W; cv.height = H;   // 重设尺寸（清空画布，下面重绘）

  ctx.fillStyle = '#F7F4ED';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#BE3A26';
  ctx.fillRect(72, 84, 48, 3);
  ctx.fillStyle = '#9B948A';
  ctx.font = '20px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('生 活 小 事', 72, 142);
  ctx.fillStyle = '#1C1A17';
  ctx.font = '600 46px "Songti SC", "SimSun", serif';
  ctx.fillText('我打卡的 100 件事', 72, 208);

  ctx.fillStyle = '#BE3A26';
  ctx.font = '600 152px "Songti SC", "SimSun", serif';
  ctx.fillText(String(c), 68, 372);
  ctx.fillStyle = '#9B948A';
  ctx.font = '40px "Songti SC", "SimSun", serif';
  ctx.fillText('/ ' + total, 68 + ctx.measureText(String(c)).width + 130, 372);

  ctx.fillStyle = 'rgba(28,26,23,0.1)';
  ctx.fillRect(72, 416, W - 144, 4);
  ctx.fillStyle = '#BE3A26';
  ctx.fillRect(72, 416, (W - 144) * (total ? c / total : 0), 4);

  ctx.fillStyle = '#57524A';
  ctx.font = '22px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(tipFor(c, total), 72, 470);

  var y = 546;
  ORDER.forEach(function(cat){
    var items = state.tasks.filter(function(t){ return t.cat === cat; });
    var d = items.filter(function(t){ return state.done[t.id]; }).length;
    ctx.fillStyle = '#1C1A17';
    ctx.font = '22px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(DATA[cat].name, 72, y);
    ctx.fillStyle = 'rgba(28,26,23,0.08)';
    ctx.fillRect(212, y - 12, 470, 8);
    ctx.fillStyle = DATA[cat].color;
    ctx.fillRect(212, y - 12, 470 * (items.length ? d / items.length : 0), 8);
    ctx.fillStyle = '#9B948A';
    ctx.font = '19px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(d + ' / ' + items.length, 828, y);
    ctx.textAlign = 'left';
    y += 62;
  });

  // 个性化评语区
  ctx.fillStyle = '#BE3A26';
  ctx.font = '600 22px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('你 的 生 活 切 片', 72, headY);
  var ly = lineY0;
  groups.forEach(function(segs){
    ctx.fillStyle = '#57524A';
    ctx.font = '24px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    segs.forEach(function(seg, i){
      ctx.fillText((i === 0 ? '· ' : '   ') + seg, 72, ly);
      ly += 38;
    });
    ly += 12;
  });

  ctx.strokeStyle = 'rgba(28,26,23,0.13)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(72, dividerY);
  ctx.lineTo(828, dividerY);
  ctx.stroke();

  ctx.fillStyle = '#9B948A';
  ctx.font = '19px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('人生 · 值得做的 ' + total + ' 件事', 72, footerY);
  ctx.textAlign = 'right';
  ctx.fillText(todayISO(), 828, footerY);

  var url = cv.toDataURL('image/png');
  document.getElementById('cardImg').src = url;
  document.getElementById('cardDl').onclick = function(){
    var a = document.createElement('a');
    a.download = '我的100件小事打卡卡.png';
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  document.getElementById('cardModal').classList.add('show');
});

function closeCard(){ document.getElementById('cardModal').classList.remove('show'); }
document.getElementById('cardClose').addEventListener('click', closeCard);
document.getElementById('cardModal').addEventListener('click', function(e){
  if (e.target === this) closeCard();
});

/* ---------- 打卡记录弹窗 ---------- */
var recMoodEl = document.getElementById('recMood');
var curMood = '';
(function renderMoodBtns(){
  var html = '';
  MOODS.forEach(function(m){
    html += '<button type="button" class="mood" data-m="' + m + '">' + m + '</button>';
  });
  recMoodEl.innerHTML = html;
})();
recMoodEl.addEventListener('click', function(e){
  var b = e.target.closest('.mood');
  if (!b) return;
  recMoodEl.querySelectorAll('.mood').forEach(function(x){ x.classList.remove('on'); });
  if (curMood === b.dataset.m){ curMood = ''; return; }
  curMood = b.dataset.m;
  b.classList.add('on');
});
function setMood(m){
  curMood = m || '';
  recMoodEl.querySelectorAll('.mood').forEach(function(x){
    x.classList.toggle('on', x.dataset.m === curMood);
  });
}

var recPhotoData = '';
function showPhoto(d){
  var img = document.getElementById('recPhoto');
  var del = document.getElementById('recDelPhoto');
  if (d){
    bindPhoto(img, d); img.hidden = false; del.hidden = false;
  } else {
    img.src = ''; img.hidden = true; del.hidden = true;
  }
}
function openRec(id, isNew){
  var t = taskById(id);
  if (!t) return;
  state.recId = id;
  var r = state.done[id];
  document.getElementById('recTitle').textContent = t.text;
  document.getElementById('recDate').value = r ? r.date : todayISO();
  document.getElementById('recTime').value = r ? (r.time || '') : nowTime();
  setMood(r ? (r.mood || '') : '');
  document.getElementById('recNote').value = r ? (r.note || '') : '';
  recPhotoData = r ? (r.photo || '') : '';
  showPhoto(recPhotoData);
  document.getElementById('recUndone').style.display = r ? 'inline-block' : 'none';
  document.getElementById('recMsg').textContent = '';
  document.getElementById('recModal').classList.add('show');
}
function closeRec(){ if (!photoBusy) document.getElementById('recModal').classList.remove('show'); }
function saveRec(){
  var id = state.recId;
  if (!id || photoBusy) return;
  var rec = {
    date: document.getElementById('recDate').value || todayISO(),
    time: document.getElementById('recTime').value || '',
    mood: curMood,
    note: document.getElementById('recNote').value.trim(),
    photo: recPhotoData
  };
  var wasDone = !!state.done[id];
  state.done[id] = rec;
  saveDone();
  refreshAll();
  closeRec();
  if (!wasDone) onItemDone(id);
}
function undoneRec(){
  var id = state.recId;
  if (photoBusy) return;
  if (id){ delete state.done[id]; saveDone(); refreshAll(); }
  closeRec();
}

document.getElementById('recSave').addEventListener('click', saveRec);
document.getElementById('recUndone').addEventListener('click', undoneRec);
document.getElementById('recClose').addEventListener('click', closeRec);
document.getElementById('recModal').addEventListener('click', function(e){ if (e.target === this) closeRec(); });
document.getElementById('recPick').addEventListener('click', function(){ document.getElementById('recFile').click(); });
document.getElementById('recDelPhoto').addEventListener('click', function(){ if (!photoBusy) { recPhotoData = ''; showPhoto(''); } });
document.getElementById('recFile').addEventListener('change', function(e){
  var f = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!f || photoBusy) return;
  photoBusy = true;
  document.getElementById('recSave').disabled = true;
  document.getElementById('recMsg').textContent = '正在上传照片…';
  compressPhoto(f, async function(dataUrl){
    try {
      recPhotoData = await storePhoto(await dataBlob(dataUrl));
      showPhoto(recPhotoData);
      document.getElementById('recMsg').textContent = '照片已上传。';
    } catch (error) {
      document.getElementById('recMsg').textContent = error.message || '上传失败，请检查连接。';
      console.error(error);
    } finally { photoBusy = false; document.getElementById('recSave').disabled = false; }
  }, function(){ photoBusy = false; document.getElementById('recSave').disabled = false; });
});

function compressPhoto(file, cb, fail){
  var reader = new FileReader();
  reader.onload = function(){
    var img = new Image();
    img.onload = function(){
      var max = 1080;
      var w = img.width, h = img.height;
      var ratio = Math.min(1, max / Math.max(w, h));
      var cw = Math.max(1, Math.round(w * ratio));
      var ch = Math.max(1, Math.round(h * ratio));
      var c = document.createElement('canvas');
      c.width = cw; c.height = ch;
      var x = c.getContext('2d');
      x.drawImage(img, 0, 0, cw, ch);
      cb(c.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = function(){ document.getElementById('recMsg').textContent = '这张图片读不出来，换一张试试。'; fail(); };
    img.src = reader.result;
  };
  reader.onerror = function(){ document.getElementById('recMsg').textContent = '文件读取失败。'; fail(); };
  reader.readAsDataURL(file);
}

/* ---------- 任务编辑弹窗 ---------- */
(function fillCatSelect(){
  var sel = document.getElementById('editCat');
  var html = '';
  ORDER.forEach(function(cat){ html += '<option value="' + cat + '">' + DATA[cat].name + '</option>'; });
  sel.innerHTML = html;
})();

function openEdit(id){
  state.editId = id ? id : null;
  var t = id ? taskById(id) : null;
  document.getElementById('editTitle').textContent = t ? '编辑这件事' : '加一件事';
  document.getElementById('editCat').value = t ? t.cat : 'exp';
  document.getElementById('editText').value = t ? t.text : '';
  document.getElementById('editDelete').hidden = !t;
  document.getElementById('editMsg').textContent = '';
  document.getElementById('editModal').classList.add('show');
  setTimeout(function(){ document.getElementById('editText').focus(); }, 50);
}
function openAdd(){ openEdit(null); }
function closeEdit(){ document.getElementById('editModal').classList.remove('show'); }

document.getElementById('editSave').addEventListener('click', function(){
  var text = document.getElementById('editText').value.trim();
  if (!text){ document.getElementById('editMsg').textContent = '先写点什么吧。'; return; }
  var cat = document.getElementById('editCat').value;
  if (state.editId){
    var t = taskById(state.editId);
    if (t){ t.text = text; t.cat = cat; }
  } else {
    state.tasks.push({ id: 'c' + Date.now(), cat:cat, text:text, custom:true });
  }
  saveTasks();
  refreshAll();
  closeEdit();
});
document.getElementById('editDelete').addEventListener('click', function(){
  if (!state.editId) return;
  var t = taskById(state.editId);
  if (t && confirm('删除「' + t.text + '」？已打卡的心情/照片也会一起删掉。')){
    deleteTask(state.editId, true);
    closeEdit();
  }
});
document.getElementById('editClose').addEventListener('click', closeEdit);
document.getElementById('editModal').addEventListener('click', function(e){ if (e.target === this) closeEdit(); });

function deleteTask(id, silent){
  var t = taskById(id);
  if (!t) return;
  if (!silent && !confirm('删除「' + t.text + '」？已打卡的心情/照片也会一起删掉。')) return;
  state.tasks = state.tasks.filter(function(x){ return x.id != id; });
  delete state.done[id];
  saveTasks();
  saveDone();
  refreshAll();
}

/* 新增按钮 */
document.getElementById('addBtn').addEventListener('click', openAdd);
document.getElementById('homeAdd').addEventListener('click', function(){ switchView('list'); openAdd(); });

/* ---------- 本地备份（导出 / 导入 json） ---------- */
async function exportAll(){
  try {
    var done = JSON.parse(JSON.stringify(state.done));
    for (const record of Object.values(done)) {
      if (!record || !record.photo) continue;
      const response = await files.get(record.photo);
      if (!response.ok) throw new Error('照片读取失败');
      record.photo = await new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(reader.result);
        reader.onerror = reject; response.blob().then(blob => reader.readAsDataURL(blob), reject);
      });
    }
    var data = { v:2, tasks:state.tasks, done:done, exportedAt:new Date().toISOString() };
    var blob = new Blob([JSON.stringify(data)], { type:'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = '人生100件事-备份-' + todayISO() + '.json'; a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1500);
    toast('已导出备份文件（含照片）');
  } catch(error) { console.error(error); toast('照片读取失败，备份未导出'); }
}
async function importFile(file){
  try {
    var obj = JSON.parse(await file.text());
    if (!obj || !Array.isArray(obj.tasks) || !obj.done || typeof obj.done !== 'object' || Array.isArray(obj.done)) throw new Error('备份格式无效');
    const ids = new Set();
    for (const task of obj.tasks) {
      if (!task || !/^(?:[1-9]\d*|c\d+)$/.test(String(task.id)) || ids.has(String(task.id)) || !ORDER.includes(task.cat) || typeof task.text !== 'string') throw new Error('备份清单无效');
      ids.add(String(task.id));
    }
    for (const [id, record] of Object.entries(obj.done)) {
      if (!ids.has(id) || !record || typeof record !== 'object' || Array.isArray(record) || ['date','time','mood','note','photo'].some(key => record[key] != null && typeof record[key] !== 'string')) throw new Error('备份记录无效');
    }
    if (!confirm('导入文件将覆盖当前清单和打卡记录，确定吗？')) return;
    // 便携备份必须含照片本体，不能引用另一安装的相对路径。
    for (const record of Object.values(obj.done)) if (record && record.photo && !record.photo.startsWith('data:')) throw new Error('备份缺少照片内容');
    toast('正在导入照片…');
    await preparePhotos(obj.done);
    state.tasks = obj.tasks; state.done = obj.done; normalizeDone(); state.todayPick = null;
    saveTasks(); refreshAll();
    toast('已导入 ' + state.tasks.length + ' 件事、' + doneCount() + ' 条打卡记录，正在保存');
  } catch(error) { console.error(error); toast('导入未完成，请检查备份及文件连接'); }
}
document.getElementById('exportBtn').addEventListener('click', exportAll);
document.getElementById('importFileBtn').addEventListener('click', function(){ document.getElementById('importFile').click(); });
document.getElementById('importFile').addEventListener('change', function(e){
  var f = e.target.files && e.target.files[0];
  if (f) importFile(f);
  e.target.value = '';
});

var syncTimer = null;
function scheduleSync(){}
/* ---- 同步状态指示 ---- */
var SYNC_TEXT = { synced:'已同步', syncing:'同步中…', error:'同步失败', offline:'离线模式' };
/* 最近一次真实同步状态：toast 活跃期间 setSync 只记录不绘制，
   2.6s 后按此还原，避免把 error / 离线态美化成「已同步」。 */
var syncState = { st: '', text: '' };
function paintSync(){
  var p = document.getElementById('syncPill');
  if (!p) return;
  p.className = 'sync-pill show ' + syncState.st;
  var t = document.getElementById('syncText');
  if (t) t.textContent = syncState.text;
}
function setSync(st, text){
  syncState = { st: st, text: text || SYNC_TEXT[st] || st };
  if (toastTimer) return;   // toast 优先，避免刚弹出的结果被同步状态覆盖
  paintSync();
}
function hideSync(){ var p = document.getElementById('syncPill'); if (p) p.className = 'sync-pill'; }

/* 轻量提示：复用左下角同步胶囊，2.6s 后恢复真实同步状态。
   toast 活跃期间 setSync 不覆盖（仅记录 syncState），保证导入/导出结果确定可见。 */
var toastTimer = null;
function toast(text){
  var p = document.getElementById('syncPill');
  if (!p) return;
  p.className = 'sync-pill show';
  var t = document.getElementById('syncText');
  if (t) t.textContent = text;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){
    toastTimer = null;
    if (syncState.st) paintSync();
    else if (syncState.st) paintSync();   // 还原 toast 前的真实状态（含 error）
    else setSync('synced');
  }, 2600);
}

function buildPayload(){ return {tasks:state.tasks, done:state.done, ach:achUnlocked}; }

/* ---------- 成就系统（MC 风右上角弹窗） ---------- */
var achUnlocked = {};
function loadAch(){
  achUnlocked = {};
}
function saveAch(){ scheduleSync(); }

var ACH_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17.5V21"/><path d="M7 4h10v4.6a5 5 0 0 1-10 0V4z"/><path d="M7 5.5H4.2V8a3 3 0 0 0 2.8 3"/><path d="M17 5.5h2.8V8a3 3 0 0 1-2.8 3"/></svg>';

var ACH = {
1:{n:'电子榨菜品鉴师',d:'一口气炫完，连片头都舍不得跳过'},
2:{n:'人体闹钟终结者',d:'闹钟尽力了，是身体先动的手'},
3:{n:'深夜食堂编外主厨',d:'圆子会化，热量不会'},
4:{n:'断舍离体验卡',d:'扔完第三天就开始想它'},
5:{n:'氛围组终身会员',d:'书没看两页，氛围先到位了'},
6:{n:'雨天限定款',d:'白噪音免费，被窝收费'},
7:{n:'早餐奥斯卡影帝',d:'拍照五分钟，吃蛋两分钟'},
8:{n:'泡面满配玩家',d:'加蛋那一刻，人生圆满了'},
9:{n:'手机内存救世主',d:'删掉八百张重复的'},
10:{n:'阳光味收藏家',d:'螨虫：我们搬家了'},
11:{n:'旷工（旷自己）',d:'今天不卷了，真卷不动'},
12:{n:'水生生物返祖实验',d:'泡到起皱，灵魂归位'},
13:{n:'衣柜腾笼换鸟计划',d:'明年它们会以新方式回来'},
14:{n:'入秋仪式感大师',d:'以为是仪式，其实是奶茶的借口'},
15:{n:'夜市在编人员',d:'烟火气是最好的滤镜'},
16:{n:'中华小当家（家养版）',d:'锅气一出，隔壁都听见了'},
17:{n:'凌晨两点的哲学家',d:'关东煮的汤，熬的是夜'},
18:{n:'广式生活体验家',d:'一盅两件，人生慢放'},
19:{n:'碳水教虔诚信徒',d:'嗦第一口时，世界安静了'},
20:{n:'饮品界探险家',d:'新品上市，你先试毒'},
21:{n:'烘焙界半壁江山',d:'香气是配方里唯一的秘密'},
22:{n:'收藏夹考古学家',d:'从种草到拔草，历时一年'},
23:{n:'家庭吧台首席调酒师',d:'基料是热水，氛围是冰块'},
24:{n:'人间烟火鉴赏员',d:'砍价成功，成就感+100'},
25:{n:'拼单侠',d:'一个人吃不完，一群人刚好'},
26:{n:'多巴胺合法走私犯',d:'甜是深夜唯一合法的糖'},
27:{n:'表情包生产者',d:'拍完就发，根本不用P'},
28:{n:'熬夜共犯联盟',d:'电话那头是最安心的白噪音'},
29:{n:'见字如面践行者',d:'邮票比表情包贵，但更烫'},
30:{n:'塑料姐妹情（真的）',d:'三分糖去冰，我们的暗号'},
31:{n:'野餐氛围组组长',d:'重点不在吃，在出片'},
32:{n:'人类高质量感恩',d:'被记住是很了不起的事'},
33:{n:'异地恋（友情版）',d:'两小时起，上不封顶'},
34:{n:'爱情片预习生',d:'爆米花是幌子，偷看是真的'},
35:{n:'聚会局发起人',d:'不赶时间的局才叫局'},
36:{n:'中华小曲库',d:'麦霸之名当之无愧'},
37:{n:'临时起意惯犯',d:'没有计划的下午最好玩'},
38:{n:'催婚免疫者',d:'主动汇报，从根源化解盘问'},
39:{n:'超市漫游者',d:'逛三小时，只买了瓶水'},
40:{n:'公园首席观察员',d:'大爷的棋比股票精彩'},
41:{n:'城市观光VIP',d:'第一视角不用买票'},
42:{n:'早起奇迹（菜市场限定）',d:'六点的菜市场是城市的底妆'},
43:{n:'城市夜行生物',d:'马路是我的，红绿灯是参考'},
44:{n:'天空收藏夹管理员',d:'今天的云值得一个位置'},
45:{n:'宜家梦想屋常驻嘉宾',d:'样板间的人生先住为敬'},
46:{n:'猫咪观察志愿者',d:'它瞄我一眼算双向奔赴'},
47:{n:'人声鼎沸鉴赏家',d:'挤，但快乐'},
48:{n:'高度挑战者（温柔版）',d:'上去的时候心跳加速'},
49:{n:'精神避难所会员',d:'不买也能待，书不赶人'},
50:{n:'城市随机数发生器',d:'终点不重要，过程是开盲盒'},
51:{n:'探店清单销毁者',d:'收藏夹-1，快乐+1'},
52:{n:'凌晨四点的守夜人',d:'太阳上岗，你交班'},
53:{n:'夕阳红后援会会长',d:'晚霞是天空的谢幕演出'},
54:{n:'海滩拾荒艺术家',d:'贝壳带回家，沙子也是'},
55:{n:'返祖现象（快乐型）',d:'水坑终究是我扛下所有'},
56:{n:'山顶洞人2.0',d:'喘成狗，但值了'},
57:{n:'天然氧吧白嫖党',d:'空气不要钱，多吸两口'},
58:{n:'植物界铲屎官',d:'多肉：我很好，别浇水了'},
59:{n:'光合作用仿生人',d:'晒够半小时，充电完成'},
60:{n:'大自然的搬运工',d:'一片叶子承包整个秋天'},
61:{n:'南方土豆（正式版）',d:'第一次见雪，原地起飞'},
62:{n:'导航弃用者',d:'迷路是小城的欢迎仪式'},
63:{n:'风的经纪人',d:'风一吹，全楼都听见了'},
64:{n:'自我投喂第一人',d:'花会谢，浪漫不会'},
65:{n:'自我PUA终结者',d:'今天也开始夸自己了'},
66:{n:'毛界在编人员',d:'它们不懂事，但懂你'},
67:{n:'中产生活体验卡',d:'仪式感拉满，豆子是拼多多'},
68:{n:'人类泡发实验员',d:'泡到指尖起皱才算入味'},
69:{n:'发呆学博士学位',d:'什么都没想才是顶级放松'},
70:{n:'无用美学拥护者',d:'没用，但好看就是有用'},
71:{n:'家居服内卷冠军',d:'出门随便，回家要命'},
72:{n:'养生朋克代言人',d:'熬夜归熬夜，茶要热的'},
73:{n:'临时抱佛脚（虔诚版）',d:'心诚则灵，万一呢'},
74:{n:'网易云资深用户',d:'老歌一响，青春上场'},
75:{n:'阳台农场主',d:'自己种的甜度翻倍'},
76:{n:'躺学十级学者',d:'干净的家是躺平的底气'},
77:{n:'失重体验收集者',d:'上去之前就这，下来之后还来'},
78:{n:'戏精学院优秀毕业生',d:'剧本是假的，害怕是真的'},
79:{n:'娃娃机扶贫办主任',d:'花了八十抓了个寂寞，但快乐'},
80:{n:'追星少年（物理）',d:'星星不花钱，失眠治好了'},
81:{n:'摇滚老baby',d:'耳机听的是歌，现场听的是命'},
82:{n:'人形倒计时器',d:'三二一，又活一年'},
83:{n:'持证点火（自首版）',d:'仙女棒一拿，氛围全开'},
84:{n:'泥地开花的少年',d:'音响一响，灵魂归位'},
85:{n:'复古氛围组组长',d:'滤镜是假的，喜欢是真的'},
86:{n:'成年人奶嘴',d:'捏爆的不是玩具，是班味'},
87:{n:'城市逃亡计划',d:'地铁终点站是自由起点'},
88:{n:'两脚兽观察员',d:'猴子看我像看同事'},
89:{n:'音乐总监（零听众）',d:'这首只给某个人听'},
90:{n:'票据收藏癖患者',d:'一张票根一段人生'},
91:{n:'自媒体元年受害者',d:'拍了两年，播放量十八'},
92:{n:'深夜emo记录仪',d:'写完就删，明天又是好汉'},
93:{n:'生活碎片拼图师',d:'废片也是片，回忆不限画质'},
94:{n:'自恋型人格（褒义）',d:'原图直出，勇气可嘉'},
95:{n:'时空管理局临时工',d:'十年后拆信，泪流满面'},
96:{n:'快乐采集器',d:'快乐是攒出来的，不是等来的'},
97:{n:'全家福合法持有人',d:'这一刻值得一个相框'},
98:{n:'年度flag批发商',d:'去年那条还在草稿里'},
99:{n:'手账媛预备役',d:'胶带一贴，旅行又活一次'},
100:{n:'自我感动大师',d:'努力没白费，截图先存着'}
};

var MILE = {
1:{n:'开天辟地第一件',d:'从0到1，是最难的那一步'},
10:{n:'十全十美（凑数版）',d:'进度条动了，它真的动了'},
25:{n:'四分之一人生',d:'四分之一已达成，剩下的慢慢来'},
50:{n:'半程马拉松（沙发版）',d:'过半了，剩下的一半更有意思'},
75:{n:'进度条 75%',d:'就差一口气，别松'},
100:{n:'人生通关 · 满级人类',d:'100件小事全做完了，这一生没白过'}
};

var achQueue = [], achBusy = false;
function pushAch(a){ achQueue.push(a); drainAch(); }
function drainAch(){
  if (achBusy || !achQueue.length) return;
  achBusy = true;
  var a = achQueue.shift();
  var wrap = document.getElementById('achWrap');
  if (!wrap){ achBusy = false; return; }
  var el = document.createElement('div');
  el.className = 'ach';
  el.innerHTML = '<div class="ach-icon">' + ACH_SVG + '</div>' +
    '<div class="ach-body"><div class="ach-k">' + esc(a.k || '成就达成') + '</div>' +
    '<div class="ach-n">' + esc(a.n) + '</div>' +
    (a.d ? '<div class="ach-d">' + esc(a.d) + '</div>' : '') + '</div>';
  wrap.appendChild(el);
  setTimeout(function(){
    el.classList.add('out');
    setTimeout(function(){
      if (el.parentNode) el.parentNode.removeChild(el);
      achBusy = false;
      drainAch();
    }, 320);
  }, 3800);
}

function onItemDone(id){
  var c = doneCount();
  if (ACH[id] && !achUnlocked['i' + id]){
    achUnlocked['i' + id] = 1;
    saveAch();
    pushAchKey('i' + id);
    pushAch({ n: ACH[id].n, d: ACH[id].d });
  }
  if (MILE[c] && !achUnlocked['m' + c]){
    achUnlocked['m' + c] = 1;
    saveAch();
    pushAchKey('m' + c);
    pushAch({ k: '里程碑达成', n: MILE[c].n, d: MILE[c].d });
  }
}

/* ---------- 成就墙 ---------- */


var achStats = {};            // ach_key -> 全局获得人数
var achStatsState = 'idle';   // idle | ok | fail
var achStatsLoading = false;
var achStatsTimer = null;     // 解锁后防抖刷新全局人数
var achFilter = 'all';        // all | got | miss


function hasOwn(o, k){ return Object.prototype.hasOwnProperty.call(o, k); }

/* 成就 id(1..100) -> 分类：按建单时的固定顺序推导，不受用户后续增删改影响 */
var ACH_CAT = {};
(function buildAchCat(){
  var n = 1;
  ORDER.forEach(function(cat){
    DATA[cat].items.forEach(function(){ ACH_CAT[n] = cat; n++; });
  });
})();

/* 里程碑键，按完成数升序 */
var ACH_MILE_KEYS = [];
(function buildAchMileKeys(){
  for (var k in MILE) if (hasOwn(MILE, k)) ACH_MILE_KEYS.push('m' + k);
  ACH_MILE_KEYS.sort(function(a, b){ return Number(a.slice(1)) - Number(b.slice(1)); });
})();

function achTotal(){
  var n = 0, k;
  for (k in ACH) if (hasOwn(ACH, k)) n++;
  for (k in MILE) if (hasOwn(MILE, k)) n++;
  return n;
}

function isValidAchKey(k){
  if (typeof k !== 'string' || k.length < 2) return false;
  if (k.charAt(0) === 'i') return hasOwn(ACH, k.slice(1));
  if (k.charAt(0) === 'm') return hasOwn(MILE, k.slice(1));
  return false;
}

function achDefOf(k){ return k.charAt(0) === 'm' ? MILE[k.slice(1)] : ACH[k.slice(1)]; }

function myAchCount(){
  var c = 0;
  for (var k in achUnlocked) if (achUnlocked[k] && isValidAchKey(k)) c++;
  return c;
}

/* 成就墙图标（内联 SVG；未获得时的描边色由 CSS 覆盖） */
var ACH_ICON = {
  trophy: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17.5V21"/><path d="M7 4h10v4.6a5 5 0 0 1-10 0V4z"/><path d="M7 5.5H4.2V8a3 3 0 0 0 2.8 3"/><path d="M17 5.5h2.8V8a3 3 0 0 1-2.8 3"/></svg>',
  medal: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14.8" r="5.6"/><path d="M8.6 9.9L7.2 3.4h9.6l-1.4 6.5"/><path d="M12 12.3l.95 1.9 2.1.3-1.5 1.5.35 2.1-1.9-1-1.9 1 .35-2.1-1.5-1.5 2.1-.3z"/></svg>',
  people: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9.2" cy="8" r="3.3"/><path d="M3.4 19.6c0-2.9 2.6-4.7 5.8-4.7s5.8 1.8 5.8 4.7"/><path d="M16.2 5.4a3.3 3.3 0 0 1 0 6.1"/><path d="M17.9 15.3c1.9.7 3.1 2.1 3.1 4.2"/></svg>'
};

/* ---- 读：全局获得人数 ---- */
function loadAchStats(){ achStatsState = 'fail'; afterAchStats(); }
function pushAchKey(){}

function afterAchStats(){
  renderAchPeek();
  if (state.view === 'ach') renderAchWall();
}

/* ---- 渲染：筛选条 ---- */
function buildAchFilters(){
  var el = document.getElementById('achFilters');
  if (!el) return;
  var total = achTotal(), got = myAchCount();
  var items = [['all', '全部', total], ['got', '已获得', got], ['miss', '未获得', total - got]];
  var html = '';
  items.forEach(function(it){
    html += '<button class="chip' + (achFilter === it[0] ? ' on' : '') + '" data-af="' + it[0] + '">' +
            it[1] + '<span class="c">' + it[2] + '</span></button>';
  });
  el.innerHTML = html;
}

/* ---- 渲染：分组 + 卡片 ---- */
function achCardHtml(key, isMile){
  var def = achDefOf(key);
  var on = !!achUnlocked[key];
  var n = achStats[key] || 0;
  return '<div class="acard' + (on ? ' on' : '') + '">' +
    '<div class="acard-ico">' + (isMile ? ACH_ICON.medal : ACH_ICON.trophy) + '</div>' +
    '<div class="acard-body">' +
      '<div class="acard-n">' + esc(def.n) + '</div>' +
      '<div class="acard-d">' + esc(def.d) + '</div>' +
      '<div class="acard-meta">' +
        '<span class="acard-c">' + ACH_ICON.people + ' 人数暂不可用</span>' +
        '<span class="acard-me">' + (on ? '已获得' : '未获得') + '</span>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function achGroupHtml(cat, name, color, isMile){
  var keys = isMile ? ACH_MILE_KEYS.slice() : [];
  if (!isMile){
    for (var id = 1; id <= 100; id++) if (ACH_CAT[id] === cat) keys.push('i' + id);
  }
  var gotAll = 0;
  keys.forEach(function(k){ if (achUnlocked[k]) gotAll++; });
  var shown = keys.filter(function(k){
    var on = !!achUnlocked[k];
    if (achFilter === 'got') return on;
    if (achFilter === 'miss') return !on;
    return true;
  });
  if (!shown.length) return '';
  var html = '<section class="section" data-achcat="' + cat + '">' +
    '<div class="sec-head"><span class="sec-name" style="color:' + color + '">' + name + '</span>' +
    '<span class="sec-rule"></span><span class="sec-count">' + gotAll + ' / ' + keys.length + '</span></div>' +
    '<div class="agrid">';
  shown.forEach(function(k){ html += achCardHtml(k, isMile); });
  return html + '</div></section>';
}

function renderAchWall(){
  var total = achTotal(), got = myAchCount();
  var numEl = document.getElementById('achNum');
  if (numEl) numEl.textContent = got;
  var slashEl = document.getElementById('achSlash');
  if (slashEl) slashEl.textContent = '/ ' + total;
  var barEl = document.getElementById('achBar');
  if (barEl) barEl.style.width = (total ? got / total * 100 : 0) + '%';
  var tipEl = document.getElementById('achTip');
  if (tipEl){
    var t;
    if (!got) t = '第一个成就，从划掉第一件事开始。';
    else if (got >= total) t = '全部解锁。这一面墙，全是你的。';
    else t = '已获得 ' + got + ' 个，还有 ' + (total - got) + ' 个等着你。';
    if (achStatsState === 'fail') t += '（人数统计暂不可用）';
    tipEl.textContent = t;
  }
  var noteEl = document.getElementById('achNote');
  if (noteEl) noteEl.hidden = achStatsState !== 'fail';
  buildAchFilters();
  var html = '';
  ORDER.forEach(function(cat){
    html += achGroupHtml(cat, DATA[cat].name, DATA[cat].color, false);
  });
  html += achGroupHtml('mile', '里程碑', '#BE3A26', true);
  var listAch = document.getElementById('achList');
  if (listAch) listAch.innerHTML = html;
  renderAchHot();   // 全站最热 Top3：移到成就墙顶部展示，首页不再放
}

/* ---- 渲染：首页摘要 ---- */
function renderAchPeek(){
  var got = myAchCount(), total = achTotal();
  var numEl = document.getElementById('peekNum');
  if (numEl) numEl.textContent = got;
  var totalEl = document.getElementById('peekTotal');
  if (totalEl) totalEl.textContent = '/ ' + total;
  var tipEl = document.getElementById('peekTip');
  if (tipEl){
    tipEl.textContent = !got
      ? '每划掉一件事，就点亮一个梗名成就。'
      : (got >= total ? '106 个成就全部解锁，满级人类。' : '已点亮 ' + got + ' / ' + total + ' 个成就。');
  }
}

function renderAchHot(){
  var box = document.getElementById('achHotRows');
  if (!box) return;
  if (achStatsState === 'fail'){
    box.innerHTML = '<p class="ach-hot-empty">人数统计暂不可用。</p>';
    return;
  }
  var arr = [];
  for (var k in achStats){
    if (!hasOwn(achStats, k) || !isValidAchKey(k)) continue;
    if (achStats[k] > 0) arr.push({ k: k, n: achStats[k] });
  }
  arr.sort(function(a, b){ return b.n - a.n; });
  var top = arr.slice(0, 3);
  if (!top.length){
    box.innerHTML = '<p class="ach-hot-empty">还没有人解锁成就——第一个会是你吗。</p>';
    return;
  }
  var html = '';
  top.forEach(function(r, i){
    html += '<div class="ach-hot-row">' +
      '<span class="ach-hot-rank">' + (i + 1) + '</span>' +
      '<span class="ach-hot-ico">' + (r.k.charAt(0) === 'm' ? ACH_ICON.medal : ACH_ICON.trophy) + '</span>' +
      '<span class="ach-hot-name">' + esc(achDefOf(r.k).n) + '</span>' +
      '<span class="ach-hot-n">' + r.n + ' 人</span>' +
    '</div>';
  });
  box.innerHTML = html;
}

/* ---------- 视图切换 / 首页交互 ---------- */
initTasks(); initDone(); loadAch();
document.getElementById('loginWrap').classList.add('hide');
scheduleSync = function(){ clearTimeout(syncTimer); setSync('syncing'); syncTimer=setTimeout(saveCloud, 900); };
document.getElementById('app').style.pointerEvents='none';
(async function(){
 try { const rows=(await sql('SELECT payload FROM life_state WHERE id = ?', ['main'])).rows;
 if(rows.length){ const p=JSON.parse(rows[0].payload); state.tasks=p.tasks; state.done=p.done; achUnlocked=p.ach || {}; normalizeDone(); const legacy=Object.values(state.done).some(r => r && r.photo && r.photo.startsWith('data:')); await preparePhotos(state.done); if (legacy) await sql('UPDATE life_state SET payload = ? WHERE id = ?', [JSON.stringify(buildPayload()), 'main']); }
 else { state.tasks=buildDefaultTasks(); state.done={}; achUnlocked={}; }
 refreshAll(); switchView('home'); setSync('synced'); document.getElementById('app').style.pointerEvents='';
 } catch(e) { setSync('error','读取失败，请刷新重试'); console.error(e); }
})();
let saving = false, queued = false;
async function saveCloud(){
 if(saving){ queued=true; return; }
 saving=true; const payload=JSON.stringify(buildPayload());
 try { await sql('INSERT INTO life_state(id,payload) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload', ['main',payload]); setSync('synced'); }
 catch(e){ setSync('error','保存结果未确认，请刷新核对'); console.error(e); queued=false; saving=false; return; }
 saving=false; if(queued){ queued=false; saveCloud(); }
}


/* ---- 成就墙交互 ---- */
document.getElementById('achEnterBtn').addEventListener('click', function(){ switchView('ach'); });
document.getElementById('achEnterBtn2').addEventListener('click', function(){ switchView('ach'); });
document.getElementById('achBackBtn').addEventListener('click', function(){ switchView('home'); });
document.getElementById('achBackBtn2').addEventListener('click', function(){ switchView('list'); });
document.getElementById('achRefreshBtn').addEventListener('click', function(){
  loadAchStats(true);
  toast('正在刷新人数…');
});
document.getElementById('achFilters').addEventListener('click', function(e){
  var b = e.target.closest('.chip');
  if (!b) return;
  achFilter = b.dataset.af;
  renderAchWall();
});

document.getElementById('enterBtn').addEventListener('click', function(){ switchView('list'); });
document.getElementById('backBtn').addEventListener('click', function(){ switchView('home'); });
document.getElementById('homeShare').addEventListener('click', function(){ document.getElementById('shareBtn').click(); });
document.getElementById('homeRandom').addEventListener('click', function(){ switchView('list'); document.getElementById('randomBtn').click(); });

document.getElementById('catGrid').addEventListener('click', function(e){
  var b = e.target.closest('.catcard');
  if (!b) return;
  state.filter = b.dataset.cat;
  buildFilters();
  buildList();
  switchView('list');
});

document.getElementById('todayCard').addEventListener('click', function(e){
  var b = e.target.closest('[data-act]');
  if (!b) return;
  var act = b.dataset.act;
  if (act === 'doit'){
    if (!state.todayPick) return;
    // 直接先记今天完成，并打开记录弹窗补心情/照片
    var pickedId = state.todayPick.id;
    if (!state.done[pickedId]){
      state.done[pickedId] = { date:todayISO(), time:nowTime(), mood:'', note:'', photo:'' };
      saveDone(); refreshAll();
      onItemDone(pickedId);
    }
    openRec(pickedId, false);
    state.todayPick = null;
  } else if (act === 'shuffle'){
    var prev = state.todayPick ? state.todayPick.id : -1;
    var next = pickToday();
    var guard = 0;
    while (next && next.id === prev && guard++ < 12) next = pickToday();
    state.todayPick = next;
    refreshAll();
  } else if (act === 'open'){
    if (!state.todayPick) return;
    var target = state.todayPick.id;
    var t = taskById(target);
    state.filter = t ? t.cat : 'all';
    buildFilters();
    buildList();
    switchView('list');
    var el = listEl.querySelector('.item[data-i="' + target + '"]');
    if (el) el.scrollIntoView({ behavior:'smooth', block:'center' });
  }
});


}
