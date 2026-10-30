// 记录和设置通过当前应用的数据库保存。
let records = [];
let profile = { name:'小满', birth: isoDate(new Date()) };
let editMode = false;
let quickEdit = false;
let quickButtons = null;
let revision = 0;
let execute;
const shield = document.createElement('div');
shield.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#fff9;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;color:#543;';
function block(message){ shield.textContent=message; document.body.appendChild(shield); }
function unblock(){ shield.remove(); }

/* 默认四个按钮（首次使用） */
const DEFAULT_BUTTONS = [
  { id:'b-left',   label:'左侧喂奶', sub:'记下当前时间', icon:'left',  color:'pink',  action:'feed-left'  },
  { id:'b-right',  label:'右侧喂奶', sub:'记下当前时间', icon:'right', color:'blue',  action:'feed-right' },
  { id:'b-bottle', label:'瓶喂',     sub:'记奶量',       icon:'bottle',color:'amber', action:'bottle'     },
  { id:'b-diaper', label:'换尿布',   sub:'尿 / 便 / 混合', icon:'diaper',color:'green', action:'diaper'     }
];
if (!Array.isArray(quickButtons) || !quickButtons.length) quickButtons = DEFAULT_BUTTONS.map(b=>Object.assign({},b));

/* 可选图标库 */
const ICONS = {
  left:  '<path d="M12 21c4.4 0 7-2.6 7-6 0-3.2-2.3-5-3.5-6.4-.9-1-1.5-1.9-1.5-3.1"/><path d="M12 21c-4.4 0-7-2.6-7-6 0-3.2 2.3-5 3.5-6.4C9.4 7.6 10 6.7 10 5.5"/><path d="m9.5 2.5 1 2 1-2"/>',
  right: '<path d="M12 21c4.4 0 7-2.6 7-6 0-3.2-2.3-5-3.5-6.4-.9-1-1.5-1.9-1.5-3.1"/><path d="M12 21c-4.4 0-7-2.6-7-6 0-3.2 2.3-5 3.5-6.4C9.4 7.6 10 6.7 10 5.5"/><path d="m14.5 2.5-1 2 1-2"/>',
  bottle:'<path d="M10 2h4"/><path d="M10.5 5h3l.6 2.2A5 5 0 0 1 18 12v6a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-6a5 5 0 0 1 3.9-4.8L10.5 5Z"/><path d="M6.5 12.5h11"/>',
  diaper:'<path d="M3 6.5c0-.8.7-1.5 1.5-1.5h15c.8 0 1.5.7 1.5 1.5v5.5a6.5 6.5 0 0 1-6.5 6.5h-5A6.5 6.5 0 0 1 3 12V6.5Z"/><path d="M9 5v3.2a2.3 2.3 0 0 1-4.6 0V5"/><path d="M19.6 5v3.2a2.3 2.3 0 0 1-4.6 0V5"/>',
  sleep: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
  poop:  '<path d="M12 21c4 0 6-2 6-4.5 0-2-1.5-3-1.5-4.5S18 9 18 7.5C18 5 15.5 3 12 3S6 5 6 7.5C6 9 7.5 10.5 7.5 12S6 14.5 6 16.5C6 19 8 21 12 21Z"/>',
  temp:  '<path d="M14 14.8V4a2 2 0 1 0-4 0v10.8a4.5 4.5 0 1 0 4 0Z"/><path d="M12 9v6"/>',
  pill:  '<rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-45 12 12)"/><path d="m9 15 6-6"/>',
  water: '<path d="M12 3s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9Z"/>',
  sun:   '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  heart: '<path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19 10.7C19 15.6 12 20 12 20Z"/>',
  star:  '<path d="m12 3 2.8 5.9 6.2.8-4.5 4.3 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.7l6.2-.8L12 3Z"/>'
};
const COLORS = {
  pink:'#E86A87', blue:'#4A8FE0', amber:'#D99A3E',
  green:'#4CA977', purple:'#8A76D6', gray:'#7A736B'
};
let sheetType = null;
let draft = {};

/* ---------- 工具 ---------- */
function isoDate(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function dayKey(t){ const d = new Date(t); return isoDate(d); }
function pad(n){ return String(n).padStart(2,'0'); }
function hhmm(t){ const d = new Date(t); return pad(d.getHours())+':'+pad(d.getMinutes()); }
function startOfDay(d){ const x = new Date(d); x.setHours(0,0,0,0); return x; }
function daysBetween(a,b){ return Math.floor((startOfDay(b)-startOfDay(a))/86400000); }

/* 按月龄算「几个月几天」：按自然月推算，跨月不溢出 */
function ageParts(birthStr){
  const b = startOfDay(new Date(birthStr+'T00:00:00'));
  const now = startOfDay(new Date());
  if (now < b) return { total:0, months:0, days:0 };
  let months = (now.getFullYear()-b.getFullYear())*12 + (now.getMonth()-b.getMonth());
  // 若当月同日尚未来到，再减一个月
  const anchor = new Date(b); anchor.setMonth(b.getMonth()+months);
  if (anchor > now){
    months--;
    anchor.setMonth(b.getMonth()+months);
  }
  const days = Math.max(0, Math.round((now - anchor)/86400000));
  return { total: daysBetween(b, now)+1, months, days };
}

/* 月龄文案：不满 1 个月只显示天数，之后显示几个月几天 */
function ageText(birthStr){
  const a = ageParts(birthStr);
  if (a.total <= 0) return '还未出生';
  if (a.months < 1) return `${a.total} 天`;
  return a.days ? `${a.months} 个月 ${a.days} 天` : `${a.months} 个月`;
}
function shortAgo(ms){
  const m = Math.floor(ms/60000);
  if (m < 60) return m + '<small>分钟</small>';
  return (m/60).toFixed(1) + '<small>小时</small>';
}
function durText(min){
  min = Math.round(min);
  if (min < 60) return min+' 分钟';
  const h = Math.floor(min/60), m = min%60;
  return m ? `${h} 小时 ${m} 分` : `${h} 小时`;
}
function agoText(ms){
  const m = Math.floor(ms/60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m} 分钟`;
  const h = Math.floor(m/60), r = m%60;
  return r ? `${h} 小时 ${r} 分` : `${h} 小时`;
}
const TYPE_NAME = { feed:'亲喂', bottle:'瓶喂', diaper:'换尿布', custom:'自定义' };
const SIDE_NAME = { left:'左侧', right:'右侧', both:'双侧', none:'' };
const DIRTY_NAME = { wet:'尿', dirty:'便', mixed:'尿+便' };

function esc(value){ return String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(()=>t.classList.remove('show'), 2000);
}

/* ---------- 记录写入 ---------- */
function addRecord(rec){
  records.push(Object.assign({ id: Date.now()+Math.random().toString(36).slice(2,6) }, rec));
  persist();
  renderAll();
  return records[records.length-1];
}
function persist(){
  records.sort((a,b)=> b.at - a.at);
  const payload = JSON.stringify({records, profile, quickButtons});
  block('正在保存…');
  execute('UPDATE baby_state SET data = ?, revision = revision + 1 WHERE id = 1 AND revision = ?', [
    {type:'text',value:payload}, {type:'integer',value:String(revision)}
  ]).then(result=>{
    if (Number(result.affected_row_count) !== 1) throw new Error('记录已在其他页面更改');
    revision++; unblock();
  }).catch(()=>block('保存未确认或数据已在其他页面更改，请刷新后核对记录。'));
}

/* ---------- 一键喂奶：点一下即记录当前时间 ---------- */
function quickFeedTap(side, label){
  addRecord({ type:'feed', side, at: Date.now() });
  const name = label || (SIDE_NAME[side] + '喂奶');
  toast(`已记录 ${name} · ${hhmm(Date.now())}`);
  const btn = document.querySelector(`.q-btn[data-act="${side}"]`);
  if (btn){ btn.classList.add('press-ring'); setTimeout(()=>btn.classList.remove('press-ring'), 600); }
}

/* ---------- 渲染快速记录按钮 ---------- */
/* 该按钮最近一次记录：按动作类型 + 侧别/标签匹配 */
function lastForButton(b){
  const match = r => {
    if (b.action === 'feed-left')  return r.type === 'feed' && r.side === 'left';
    if (b.action === 'feed-right') return r.type === 'feed' && r.side === 'right';
    if (b.action === 'bottle')     return r.type === 'bottle';
    if (b.action === 'diaper')     return r.type === 'diaper';
    return r.type === 'custom' && r.label === b.label;
  };
  let newest = null;
  for (const r of records){ if (match(r) && (!newest || r.at > newest.at)) newest = r; }
  return newest;
}

/* 「多久之前」紧凑写法：刚刚 / 23分钟 / 1小时5分 / 2天3小时 */
function agoShort(ms){
  const m = Math.floor(ms/60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m}分钟`;
  const h = Math.floor(m/60), rm = m%60;
  if (h < 24) return rm ? `${h}小时${rm}分` : `${h}小时`;
  const d = Math.floor(h/24), rh = h%24;
  return rh ? `${d}天${rh}小时` : `${d}天`;
}

function quickButtonHTML(b){
  const c = COLORS[b.color] || COLORS.pink;
  const last = lastForButton(b);
  const ago = last ? agoShort(Date.now() - last.at) : null;
  const agoHTML = ago
    ? `<div class="q-ago" data-ago="${b.id}">距上次 ${ago}</div>`
    : `<div class="q-ago none" data-ago="${b.id}">还没记录</div>`;
  return `<button class="q-btn" data-bid="${b.id}" style="border-left:3px solid ${c};">
    <span class="q-x" data-remove="${b.id}" title="删除">×</span>
    <div class="q-icon" style="background:${c}1F;color:${c};">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[b.icon]||ICONS.heart}</svg>
    </div>
    <div class="q-txt">
      <div class="q-name">${esc(b.label)}</div>
      ${agoHTML}
    </div>
  </button>`;
}

function renderQuick(){
  const grid = document.getElementById('quickGrid');
  grid.innerHTML = quickButtons.length
    ? quickButtons.map(quickButtonHTML).join('')
    : `<div class="q-empty">还没有按钮<br>点下方「添加记录按钮」新建一个</div>`;
  document.querySelector('.q-card').classList.toggle('editing', quickEdit);
  const t = document.getElementById('quickToggle');
  t.textContent = quickEdit ? '完成' : '自定义';
  t.style.color = quickEdit ? 'var(--ink-2)' : 'var(--pink)';
  document.getElementById('quickHint').style.display = quickEdit && quickButtons.length ? 'block' : 'none';
}

/* 触发按钮动作 */
function runQuick(id){
  const b = quickButtons.find(x=>x.id===id);
  if (!b) return;
  if (b.action === 'feed-left')  return quickFeedTap('left', b.label);
  if (b.action === 'feed-right') return quickFeedTap('right', b.label);
  if (b.action === 'bottle')     return openSheet('bottle');
  if (b.action === 'diaper')     return openSheet('diaper');
  if (b.action === 'custom')     return addCustomLog(b);
}

/* 自定义记录项：点一下记时间 */
function addCustomLog(b){
  addRecord({ type:'custom', label:b.label, icon:b.icon||'heart', color:b.color||'gray', at: Date.now() });
  toast(`已记录 ${b.label} · ${hhmm(Date.now())}`);
}

/* 自定义模式开关 */
document.getElementById('quickToggle').onclick = ()=>{
  quickEdit = !quickEdit;
  renderQuick();
  if (quickEdit) toast('拖动可排序 · 点 × 删除');
};

/* 点击 / 删除（委托在常驻的 .q-card 上） */
document.querySelector('.q-card').addEventListener('click', e=>{
  const rm = e.target.closest('[data-remove]');
  if (rm){
    e.stopPropagation();
    const id = rm.dataset.remove;
    const b = quickButtons.find(x=>x.id===id);
    quickButtons = quickButtons.filter(x=>x.id!==id);
    // 立即移除对应的概览计数格
    document.querySelectorAll(`.ov-item.extra[data-extra="${id}"]`).forEach(el=>el.remove());
    persist();
    renderQuick();
    renderOverview();
    toast(`已删除「${b ? b.label : ''}」`);
    return;
  }
  const btn = e.target.closest('.q-btn');
  if (!btn || quickEdit || dragJustEnded) return;
  runQuick(btn.dataset.bid);
});

/* ---------- 拖动排序（Pointer Events，鼠标/触摸通用） ---------- */
let dragEl = null, dragStart = null, dragMoved = false, dragJustEnded = false;

document.querySelector('.q-card').addEventListener('pointerdown', e=>{
  if (!quickEdit) return;
  const btn = e.target.closest('.q-btn');
  if (!btn || e.target.closest('[data-remove]')) return;
  dragEl = btn;
  dragMoved = false;
  dragStart = { x:e.clientX, y:e.clientY };
  btn.classList.add('dragging');
  btn.setPointerCapture?.(e.pointerId);
});

document.querySelector('.q-card').addEventListener('pointermove', e=>{
  if (!dragEl) return;
  if (!dragMoved){
    if (Math.abs(e.clientX-dragStart.x) < 5 && Math.abs(e.clientY-dragStart.y) < 5) return;
    dragMoved = true;
  }
  e.preventDefault();

  const el = document.elementFromPoint(e.clientX, e.clientY);
  const target = el && el.closest('.q-btn');
  document.querySelectorAll('.q-btn.over').forEach(x=>x.classList.remove('over'));
  if (target && target !== dragEl){
    target.classList.add('over');
    const r = target.getBoundingClientRect();
    const after = e.clientX > r.left + r.width/2;
    const from = quickButtons.findIndex(x=>x.id === dragEl.dataset.bid);
    if (from < 0) return;
    const item = quickButtons.splice(from,1)[0];
    const tIdx = quickButtons.findIndex(x=>x.id === target.dataset.bid);
    quickButtons.splice(tIdx + (after ? 1 : 0), 0, item);
    // 重建 DOM 并把 dragging 状态转移给新节点
    const grid = document.getElementById('quickGrid');
    grid.innerHTML = quickButtons.map(quickButtonHTML).join('');
    dragEl = grid.querySelector(`[data-bid="${item.id}"]`);
    if (dragEl) dragEl.classList.add('dragging');
  }
});

function endDrag(){
  if (!dragEl){ return; }
  dragEl.classList.remove('dragging');
  document.querySelectorAll('.q-btn.over').forEach(x=>x.classList.remove('over'));
  dragEl = null; dragStart = null;
  if (dragMoved){
    dragJustEnded = true;
    setTimeout(()=>{ dragJustEnded = false; }, 150);
    persist(); renderQuick();
  }
}
document.querySelector('.q-card').addEventListener('pointerup', endDrag);
document.querySelector('.q-card').addEventListener('pointercancel', endDrag);
document.addEventListener('pointerup', endDrag);

/* ---------- 渲染首页 ---------- */
function renderHeader(){
  const now = new Date();
  const wd = ['周日','周一','周二','周三','周四','周五','周六'][now.getDay()];
  document.getElementById('heroDate').textContent = `${now.getMonth()+1}月${now.getDate()}日 ${wd}`;
  const h = now.getHours();
  const greet = h < 5 ? '夜深了' : h < 11 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
  document.getElementById('heroGreet').textContent = `${greet}，${profile.name}`;

  const feeds = records.filter(r => r.type !== 'diaper');
  const sub = document.getElementById('heroSub');
  if (feeds.length){
    sub.textContent = '距上次喂奶 ' + agoText(Date.now() - feeds[0].at);
  } else {
    sub.textContent = '还没有喂奶记录，点下方按钮开始';
  }
}

function renderOverview(){
  const today = isoDate(new Date());
  const todays = records.filter(r => dayKey(r.at) === today);
  const feeds = todays.filter(r => r.type === 'feed' || r.type === 'bottle');
  const diapers = todays.filter(r => r.type === 'diaper');
  document.getElementById('ovFeed').innerHTML = feeds.length + '<small>次</small>';
  document.getElementById('ovDiaper').innerHTML = diapers.length + '<small>次</small>';
  const last = feeds[0];
  document.getElementById('ovTotal').innerHTML = last ? shortAgo(Date.now()-last.at) : '—';

  // 每个自定义按钮单独计数（仅统计「记下当前时间」类型，且按钮仍存在）
  const box = document.getElementById('overview');
  box.querySelectorAll('.ov-item.extra').forEach(el=>el.remove());
  const customs = quickButtons.filter(b=>b.action === 'custom');
  customs.forEach(b=>{
    const n = todays.filter(r=>r.type === 'custom' && r.label === b.label).length;
    const c = COLORS[b.color] || COLORS.pink;
    const el = document.createElement('div');
    el.className = 'ov-item extra';
    el.dataset.extra = b.id;
    el.innerHTML = `<div class="ov-val">${n}<small>次</small></div>
                    <div class="ov-lab"><i style="background:${c};" class="ov-dot"></i>${esc(b.label)}</div>`;
    box.appendChild(el);
  });

  // 按格数自适应：1~3 个均分铺满一行；4 个起固定四列，多出往下换行
  const total = 3 + customs.length;
  const cols = total <= 4 ? total : 4;
  box.style.gridTemplateColumns = `repeat(${cols}, minmax(0,1fr))`;
  [...box.children].forEach((el, i)=>{
    el.dataset.col = String(i % cols);
  });
}

function entryHTML(r){
  if (r.type === 'custom'){
    const c = COLORS[r.color] || COLORS.gray;
    return `<div class="entry" data-id="${r.id}">
      <div class="e-time">${hhmm(r.at)}</div>
      <div class="e-dot" style="background:${c};color:${c};"></div>
      <div class="e-body">
        <div class="e-name">${esc(r.label||'记录')}</div>
        <div class="e-meta">自定义记录</div>
      </div>
      <button class="del" data-del="${r.id}">删除</button>
    </div>`;
  }
  if (r.type === 'diaper'){
    return `<div class="entry" data-id="${r.id}">
      <div class="e-time">${hhmm(r.at)}</div>
      <div class="e-dot" style="background:var(--green);color:var(--green);"></div>
      <div class="e-body">
        <div class="e-name">换尿布
          <span class="e-tag" style="background:#E9F4EE;color:#3C8C61;">${DIRTY_NAME[r.dirty]||'尿'}</span>
        </div>
        <div class="e-meta">${DIRTY_NAME[r.dirty]||''}${r.note? ' · '+r.note : ''}</div>
      </div>
      <button class="del" data-del="${r.id}">删除</button>
    </div>`;
  }
  const isBottle = r.type === 'bottle';
  const color = isBottle ? 'var(--amber)' : (r.side === 'right' ? 'var(--blue)' : 'var(--pink)');
  const name = isBottle ? '瓶喂' : `${SIDE_NAME[r.side]||''}喂奶`;
  const dur = isBottle ? (r.amount ? `${r.amount} ml` : '') : '';
  const meta = isBottle ? '奶瓶喂' : (SIDE_NAME[r.side]||'')+'亲喂';
  return `<div class="entry" data-id="${r.id}">
    <div class="e-time">${hhmm(r.at)}</div>
    <div class="e-dot" style="background:${color};color:${color};"></div>
    <div class="e-body">
      <div class="e-name">${name}</div>
      <div class="e-meta">${meta}</div>
    </div>
    <div class="e-dur">${dur}</div>
    <button class="del" data-del="${r.id}">删除</button>
  </div>`;
}

function renderTimeline(){
  const tl = document.getElementById('timeline');
  if (!records.length){
    tl.innerHTML = `<div class="empty fade">
      <svg class="empty-emoji" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9A227" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto;"><path d="M10 2h4"/><path d="M10.5 5h3l.6 2.2A5 5 0 0 1 18 12v6a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-6a5 5 0 0 1 3.9-4.8L10.5 5Z"/><path d="M6.5 12.5h11"/></svg>
      <div class="empty-t">今天还没有记录</div>
      <div class="empty-s">点上面的按钮，一键记下喂奶或换尿布的时间。</div>
    </div>`;
    return;
  }
  const groups = {};
  records.forEach(r => { (groups[dayKey(r.at)] = groups[dayKey(r.at)] || []).push(r); });
  const today = isoDate(new Date());
  const yest = isoDate(new Date(Date.now()-86400000));
  let html = '';
  Object.keys(groups).sort().reverse().forEach(k=>{
    const label = k === today ? '今天' : k === yest ? '昨天'
      : `${+k.slice(5,7)}月${+k.slice(8,10)}日`;
    const list = groups[k].slice().sort((a,b)=>b.at-a.at);
    html += `<div class="day-label">${label} · ${list.length} 条</div><div class="tl-group">`;
    html += list.map(entryHTML).join('');
    html += `</div>`;
  });
  tl.innerHTML = html;
  if (editMode) document.querySelectorAll('.entry').forEach(e=>e.classList.add('edit-mode'));
}




/* ---------- 记录交互：点击编辑 / 长按删除 ---------- */
document.addEventListener('click', e=>{
  const del = e.target.closest('[data-del]');
  if (del){ e.stopPropagation(); removeRecord(del.dataset.del); return; }
  const entry = e.target.closest('.entry');
  if (entry && !editMode){ openEdit(entry.dataset.id); }
});
let lpTimer = null;
document.addEventListener('touchstart', e=>{
  const entry = e.target.closest('.entry');
  if (!entry || !editMode) return;
  lpTimer = setTimeout(()=>{ removeRecord(entry.dataset.id); }, 800);
}, {passive:true});
['touchend','touchmove','touchcancel'].forEach(ev=>{
  document.addEventListener(ev, ()=>clearTimeout(lpTimer), {passive:true});
});

function removeRecord(id){
  records = records.filter(r => r.id !== id);
  persist(); renderAll();
  toast('已删除');
}

document.getElementById('editToggle').onclick = ()=>{
  editMode = !editMode;
  document.getElementById('editToggle').textContent = editMode ? '完成' : '编辑';
  document.getElementById('editToggle').style.color = editMode ? 'var(--pink)' : '';
  document.querySelectorAll('.entry').forEach(e=>e.classList.toggle('edit-mode', editMode));
  if (editMode) toast('长按记录可删除');
};

/* ---------- 新增/编辑快速按钮表单 ---------- */
let btnDraft = {};

function openButtonForm(editId){
  const src = editId ? quickButtons.find(b=>b.id===editId) : null;
  btnDraft = src ? Object.assign({},src)
    : { id:'b-'+Date.now().toString(36), label:'', sub:'', icon:'heart', color:'pink', action:'custom' };
  sheetType = 'button';
  document.getElementById('sheetTitle').textContent = src ? '编辑按钮' : '添加按钮';
  document.getElementById('sheetSave').textContent = '保存';
  document.getElementById('sheetSave').dataset.editId = '';

  document.getElementById('sheetBody').innerHTML = `
    <div class="field-label">按钮名称</div>
    <input class="text-input" id="btnLabel" maxlength="8" placeholder="例如：吸奶、黄疸、洗澡" value="${esc(btnDraft.label||'')}">

    <div class="field-label">说一下用途（可留空）</div>
    <input class="text-input" id="btnSub" maxlength="12" placeholder="例如：记下当前时间" value="${esc(btnDraft.sub||'')}">

    <div class="field-label">点击后</div>
    <div class="chips">
      <button class="chip wide ${btnDraft.action==='custom'?'on':''}" data-act="custom">记下当前时间</button>
      <button class="chip wide ${btnDraft.action==='bottle'?'on':''}" data-act="bottle">打开瓶喂表单</button>
      <button class="chip wide ${btnDraft.action==='diaper'?'on':''}" data-act="diaper">打开换尿布表单</button>
    </div>

    <div class="field-label">图标</div>
    <div class="icon-grid" id="iconGrid">
      ${Object.keys(ICONS).map(k=>`
        <button class="icon-opt ${btnDraft.icon===k?'on':''}" data-icon="${k}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>
        </button>`).join('')}
    </div>

    <div class="field-label">颜色</div>
    <div class="color-grid" id="colorGrid">
      ${Object.keys(COLORS).map(k=>`
        <button class="color-opt ${btnDraft.color===k?'on':''}" data-color="${k}"
          style="background:${COLORS[k]};color:${COLORS[k]};"></button>`).join('')}
    </div>

    <div class="field-label">预览</div>
    <div id="btnPreview" style="pointer-events:none;"></div>`;

  document.querySelectorAll('[data-act]').forEach(el=>{
    el.onclick = ()=>{
      btnDraft.action = el.dataset.act;
      document.querySelectorAll('[data-act]').forEach(x=>x.classList.toggle('on', x===el));
    };
  });
  document.querySelectorAll('[data-icon]').forEach(el=>{
    el.onclick = ()=>{
      btnDraft.icon = el.dataset.icon;
      document.querySelectorAll('[data-icon]').forEach(x=>x.classList.toggle('on', x===el));
      refreshPreview();
    };
  });
  document.querySelectorAll('[data-color]').forEach(el=>{
    el.onclick = ()=>{
      btnDraft.color = el.dataset.color;
      document.querySelectorAll('[data-color]').forEach(x=>x.classList.toggle('on', x===el));
      refreshPreview();
    };
  });
  const labEl = document.getElementById('btnLabel');
  const subEl = document.getElementById('btnSub');
  labEl.oninput = ()=>{ btnDraft.label = labEl.value; refreshPreview(); };
  subEl.oninput = ()=>{ btnDraft.sub = subEl.value; refreshPreview(); };

  refreshPreview();
  document.getElementById('mask').classList.add('show');
  document.getElementById('sheet').classList.add('show');
  setTimeout(()=>labEl.focus(), 350);
}

function refreshPreview(){
  const box = document.getElementById('btnPreview');
  if (!box) return;
  box.innerHTML = `<div class="q-grid" style="grid-template-columns:1fr;">${
    quickButtonHTML(Object.assign({}, btnDraft, { label: btnDraft.label || '按钮名称', sub: btnDraft.sub || '' }))
  }</div>`;
}

function saveButton(){
  const label = (document.getElementById('btnLabel').value || '').trim();
  if (!label){ toast('请填写按钮名称'); return; }
  const oldLabel = (quickButtons.find(b=>b.id===btnDraft.id) || {}).label;
  btnDraft.label = label;
  btnDraft.sub = (document.getElementById('btnSub').value || '').trim();
  const idx = quickButtons.findIndex(b=>b.id===btnDraft.id);
  if (idx >= 0) quickButtons[idx] = Object.assign({}, btnDraft);
  else quickButtons.push(Object.assign({}, btnDraft));
  // 改名后同步历史记录，保证计数与统计页对应
  if (idx >= 0 && oldLabel && oldLabel !== label){
    records.forEach(r=>{ if (r.type === 'custom' && r.label === oldLabel) r.label = label; });
  }
  persist(); closeSheet(); renderAll();
  toast(idx >= 0 ? '已更新按钮' : `已添加「${label}」`);
}

/* ---------- 表单 ---------- */
function openSheet(type, rec){
  sheetType = type;
  const isEdit = !!rec;
  const now = new Date();
  const t = rec ? new Date(rec.at) : now;

  if (type === 'bottle'){
    draft = { amount: rec?.amount || 120, at: rec? rec.at : Date.now(), note: rec?.note || '' };
    document.getElementById('sheetTitle').textContent = isEdit ? '编辑瓶喂' : '记录瓶喂';
    document.getElementById('sheetBody').innerHTML = `
      <div class="field-label">奶量</div>
      <div class="stepper">
        <button onclick="stepAmt(-10)">−</button>
        <div class="val" id="amtVal">${draft.amount}<small>ml</small></div>
        <button onclick="stepAmt(10)">+</button>
      </div>
      <div class="field-label">时间</div>
      <input class="time-input" type="time" id="atInput" value="${pad(t.getHours())}:${pad(t.getMinutes())}">`;
  }

  if (type === 'diaper'){
    draft = { dirty: rec?.dirty || 'wet', at: rec? rec.at : Date.now() };
    document.getElementById('sheetTitle').textContent = isEdit ? '编辑尿布' : '记录换尿布';
    document.getElementById('sheetBody').innerHTML = `
      <div class="field-label">类型</div>
      <div class="chips">
        ${[['wet','尿了'],['dirty','便了'],['mixed','尿 + 便']].map(([k,label])=>
          `<button class="chip wide ${draft.dirty===k?'on':''}" data-dirty="${k}">${label}</button>`).join('')}
      </div>
      <div class="field-label">时间</div>
      <input class="time-input" type="time" id="atInput" value="${pad(t.getHours())}:${pad(t.getMinutes())}">`;
    document.querySelectorAll('[data-dirty]').forEach(b=>{
      b.onclick = ()=>{
        draft.dirty = b.dataset.dirty;
        document.querySelectorAll('[data-dirty]').forEach(x=>x.classList.toggle('on', x===b));
      };
    });
  }

  if (type === 'feed'){
    draft = { side: rec?.side || 'left', at: rec? rec.at : Date.now() };
    document.getElementById('sheetTitle').textContent = isEdit ? '编辑亲喂' : '记录亲喂';
    document.getElementById('sheetBody').innerHTML = `
      <div class="field-label">侧别</div>
      <div class="chips">
        ${[['left','左侧'],['right','右侧'],['both','双侧']].map(([k,label])=>
          `<button class="chip ${draft.side===k?'on':''}" data-side="${k}" style="flex:1;">${label}</button>`).join('')}
      </div>
      <div class="field-label">时间</div>
      <input class="time-input" type="time" id="atInput" value="${pad(t.getHours())}:${pad(t.getMinutes())}">`;
    document.querySelectorAll('[data-side]').forEach(b=>{
      b.onclick = ()=>{
        draft.side = b.dataset.side;
        document.querySelectorAll('[data-side]').forEach(x=>x.classList.toggle('on', x===b));
      };
    });
  }

  document.getElementById('sheetSave').textContent = isEdit ? '保存' : '记录';
  document.getElementById('sheetSave').dataset.editId = rec ? rec.id : '';
  document.getElementById('mask').classList.add('show');
  document.getElementById('sheet').classList.add('show');
}

function stepAmt(d){ draft.amount = Math.max(0, Math.min(400, draft.amount + d)); document.getElementById('amtVal').innerHTML = draft.amount + '<small>ml</small>'; }

function openEdit(id){
  const r = records.find(x=>x.id === id);
  if (!r) return;
  if (r.type === 'custom'){ openCustomEdit(r); return; }
  openSheet(r.type, r);
}

/* 编辑自定义记录：只改时间 */
function openCustomEdit(r){
  sheetType = 'custom';
  draft = { label:r.label, icon:r.icon, color:r.color, at:r.at };
  const t = new Date(r.at);
  document.getElementById('sheetTitle').textContent = '编辑「'+r.label+'」';
  document.getElementById('sheetSave').textContent = '保存';
  document.getElementById('sheetSave').dataset.editId = r.id;
  document.getElementById('sheetBody').innerHTML = `
    <div class="field-label">时间</div>
    <input class="time-input" type="time" id="atInput" value="${pad(t.getHours())}:${pad(t.getMinutes())}">`;
  document.getElementById('mask').classList.add('show');
  document.getElementById('sheet').classList.add('show');
}

function closeSheet(){
  document.getElementById('mask').classList.remove('show');
  document.getElementById('sheet').classList.remove('show');
  setTimeout(()=>{ document.getElementById('sheetBody').innerHTML = ''; }, 360);
  sheetType = null;
}

function saveSheet(){
  if (sheetType === 'button'){ saveButton(); return; }
  const inp = document.getElementById('atInput');
  const now = new Date();
  let at = draft.at;
  if (inp && inp.value){
    const [h,m] = inp.value.split(':').map(Number);
    const d = new Date(now); d.setHours(h,m,0,0);
    if (d.getTime() > now.getTime() + 60000) d.setDate(d.getDate()-1); // 未来时间视为昨天
    at = d.getTime();
  }
  const editId = document.getElementById('sheetSave').dataset.editId;

  const rec = Object.assign({ id: editId || (Date.now()+Math.random().toString(36).slice(2,6)) }, draft, { at,
    type: sheetType });

  if (editId){
    const i = records.findIndex(x=>x.id === editId);
    records[i] = rec;
    toast('已更新');
  } else {
    records.push(rec);
    const label = sheetType === 'diaper' ? `换尿布 · ${DIRTY_NAME[rec.dirty]}`
      : sheetType === 'bottle' ? `瓶喂 · ${rec.amount} ml` : `${SIDE_NAME[rec.side]}喂奶`;
    toast('✓ 已记录 ' + label);
  }
  persist(); closeSheet(); renderAll();
}

/* ---------- 统计 ---------- */
function renderStats(){
  const today = new Date();
  const days = [];
  for (let i=6;i>=0;i--){
    const d = new Date(today); d.setDate(d.getDate()-i);
    const k = isoDate(d);
    const list = records.filter(r=>dayKey(r.at)===k);
    days.push({
      k, d,
      feed: list.filter(r=>r.type!=='diaper').length,
      bottle: list.filter(r=>r.type==='bottle').length,
      diaper: list.filter(r=>r.type==='diaper').length,
      ml: list.reduce((s,r)=>s+(r.amount||0),0)
    });
  }
  const max = Math.max(1, ...days.map(d=>d.feed));
  document.getElementById('bars').innerHTML = days.map(d=>{
    const h = Math.max(3, Math.round(d.feed / max * 82));
    return `<div class="bar-wrap">
      <div class="bar-v">${d.feed||''}</div>
      <div class="bar ${d.feed?'has':''}" style="height:${h}px"></div>
      <div class="bar-l">${['日','一','二','三','四','五','六'][d.d.getDay()]}</div>
    </div>`;
  }).join('');

  const t = days[6];
  const feeds = records.filter(r=>dayKey(r.at)===t.k && r.type!=='diaper');
  const todaysCustom = label => records.filter(r=>dayKey(r.at)===t.k && r.type==='custom' && r.label===label);
  const gaps = [];
  for (let i=0;i<feeds.length-1;i++) gaps.push((feeds[i].at - feeds[i+1].at)/60000);
  const avgGapToday = gaps.length ? Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length) : 0;
  const leftN = feeds.filter(r=>r.type==='feed'&&r.side==='left').length;
  const rightN = feeds.filter(r=>r.type==='feed'&&r.side==='right').length;
  document.getElementById('todayRows').innerHTML = `
    <div class="row"><span class="k">喂奶次数</span><span class="v">${t.feed} 次</span></div>
    <div class="row"><span class="k">左侧 / 右侧</span><span class="v">${leftN} / ${rightN}</span></div>
    <div class="row"><span class="k">瓶喂次数</span><span class="v">${t.bottle} 次</span></div>
    <div class="row"><span class="k">瓶喂奶量</span><span class="v">${t.ml} ml</span></div>
    <div class="row"><span class="k">平均喂养间隔</span><span class="v">${avgGapToday ? durText(avgGapToday) : '—'}</span></div>
    <div class="row"><span class="k">换尿布</span><span class="v">${t.diaper} 次</span></div>` +
    quickButtons.filter(b=>b.action==='custom').map(b=>{
      const n = todaysCustom(b.label).length;
      return `<div class="row"><span class="k">${esc(b.label)}</span><span class="v">${n} 次</span></div>`;
    }).join('');

  const weekFeeds = days.reduce((s,d)=>s+d.feed,0);
  const avg = (weekFeeds/7).toFixed(1);
  document.getElementById('statSub').textContent = `平均每天 ${avg} 次喂奶 · 共 ${records.length} 条记录`;

  let insight = '还没有足够的数据。多记几天，这里会显示喂养规律。';
  if (weekFeeds > 0){
    const recFeeds = feeds.slice().sort((a,b)=>b.at-a.at);
    let gap = 0, gapN = 0;
    for (let i=0;i<recFeeds.length-1;i++){
      gap += (recFeeds[i].at - recFeeds[i+1].at)/60000; gapN++;
    }
    const avgGap = gapN ? Math.round(gap/gapN) : 0;
    insight = `最近 7 天平均每天喂奶 <b>${avg} 次</b>，今日最多间隔约 <b>${
      gaps.length ? durText(Math.round(Math.max(...gaps))) : '—'}</b>。` +
      ` 尿布 ${t.diaper} 次，属${t.diaper>=6?'正常范围':'偏少，留意补水'}。`;
  }
  document.getElementById('insight').innerHTML = insight;
}

/* ---------- 我的 ---------- */
function renderMe(){
  const a = ageParts(profile.birth);
  document.getElementById('meName').textContent = profile.name;
  document.getElementById('meMeta').textContent = a.total > 0
    ? `${ageText(profile.birth)}（第 ${a.total} 天）· 记录 ${records.length} 条`
    : `还未出生 · 记录 ${records.length} 条`;
  document.getElementById('liName').textContent = profile.name;
  document.getElementById('liBirth').value = profile.birth;
  document.getElementById('liAge').textContent = ageText(profile.birth);
}
document.getElementById('liBirth').addEventListener('change', e=>{
  profile.birth = e.target.value || isoDate(new Date());
  persist(); renderMe(); toast('已更新出生日期');
});
function editProfile(){
  const n = prompt('宝宝的名字', profile.name);
  if (n && n.trim()){ profile.name = n.trim(); persist(); renderAll(); }
}

function exportData(){
  if (!records.length) return toast('还没有可导出的记录');
  const rows = [['时间','类型','侧别','奶量(ml)','尿布类型']];
  records.slice().sort((a,b)=>a.at-b.at).forEach(r=>{
    const d = new Date(r.at);
    rows.push([`${isoDate(d)} ${hhmm(r.at)}`, r.type==='custom'?(r.label||'自定义'):TYPE_NAME[r.type],
      r.type==='feed'?(SIDE_NAME[r.side]||''):'', r.amount||'', r.dirty?DIRTY_NAME[r.dirty]:'']);
  });
  const csv = '\uFEFF' + rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `喂养记录_${isoDate(new Date())}.csv`;
  a.click();
  toast('已导出 CSV');
}

function clearAll(){
  if (!records.length) return toast('没有记录');
  if (!confirm('确定清空全部记录？此操作不可撤销。')) return;
  records = []; persist(); renderAll(); toast('已清空');
}

function loadDemo(){
  const now = new Date();
  const d = minutes => now.getTime() - minutes * 60000;
  const demo = [
    { type:'feed', side:'left', at: d(360) },
    { type:'diaper', dirty:'wet', at: d(325) },
    { type:'feed', side:'right', at: d(240) },
    { type:'feed', side:'left', at: d(180) },
    { type:'diaper', dirty:'dirty', at: d(145) },
    { type:'bottle', amount:110, at: d(60) },
    { type:'diaper', dirty:'mixed', at: d(25) },
  ];
  records = demo.map(r=>Object.assign({ id: r.at+''+Math.random().toString(36).slice(2,5) }, r));
  persist(); renderAll(); toast('已载入示例数据');
}

/* ---------- 页面切换 ---------- */
function switchTab(page){
  ['home','stats','me'].forEach(p=>{
    document.getElementById('screen-'+p).style.display = p===page ? 'block' : 'none';
  });
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on', t.dataset.page===page));
  if (page==='stats') renderStats();
  if (page==='me') renderMe();
  document.getElementById('screen-'+page).scrollTop = 0;
}

function renderAll(){
  renderHeader(); renderOverview(); renderQuick(); renderTimeline();
  if (document.getElementById('screen-stats').style.display !== 'none') renderStats();
  if (document.getElementById('screen-me').style.display !== 'none') renderMe();
}

/* ---------- 状态栏时钟 ---------- */
function tick(){
  const n = new Date();
  refreshAgo();
}

/* 只更新「距上次」文字，不重建按钮节点 */
function refreshAgo(){
  document.querySelectorAll('.q-ago[data-ago]').forEach(el=>{
    const b = quickButtons.find(x=>x.id === el.dataset.ago);
    if (!b) return;
    const last = lastForButton(b);
    el.textContent = last ? '距上次 ' + agoShort(Date.now() - last.at) : '还没记录';
    el.classList.toggle('none', !last);
  });
}
setInterval(tick, 1000);

/* ---------- 启动 ---------- */
block('正在读取记录…');
try {
  if (typeof window.tiana?.auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw Error('连接不可用');
  const connection = await window.tiana.connection();
  if (connection.sql_api !== 'hrana-v3') throw Error('不支持的数据库协议');
  const sqlFetch = createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  execute = async (sql,args=[])=>{
    const response = await sqlFetch(`${connection.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw Error('数据库请求未确认');
    const result = (await response.json()).results?.[0];
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作未确认');
    return result.response.result;
  };
  const result = await execute('SELECT data, revision FROM baby_state WHERE id = 1');
  if (!result.rows?.length) throw Error('数据库尚未初始化');
  const saved = JSON.parse(result.rows[0][0].value);
  revision = Number(result.rows[0][1].value);
  if (Array.isArray(saved.records)) records = saved.records;
  if (saved.profile) profile = saved.profile;
  if (Array.isArray(saved.quickButtons)) quickButtons = saved.quickButtons;
  tick(); renderAll(); unblock();
} catch(e) { block('无法读取记录，请检查连接后刷新重试。'); }
