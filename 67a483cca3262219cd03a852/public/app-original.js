// 正式应用以安装数据库为持久存储；预览保留自己的内存实现。
const localStorage = window.classStorage;
// Host CSP blocks inline event attributes; dispatch the supported UI actions safely.
if (window.tiana) for (const type of ['click','change','input','keydown']) {
  document.addEventListener(type, event => {
    const el=event.target.closest?.('[on'+type+']'); if (!el) return;
    const action=el.getAttribute('on'+type);
    if (action === 'if(event.target===this)closeModal()') { if(event.target===el) window.closeModal(); return; }
    if (action === "document.getElementById('import-file').click()") { document.getElementById('import-file').click(); return; }
    if (action === 'this.parentNode.remove()') { el.parentNode.remove(); return; }
    if (action === 'this.select()') { el.select(); return; }
    if (action === "copyText($('#cloud-key-show').value)") { window.copyText(document.querySelector('#cloud-key-show').value); return; }
    if (action === "bounceGelin('#page-checkin .greenie-avatar'); submitCheckin()") { window.bounceGelin('#page-checkin .greenie-avatar'); window.submitCheckin(); return; }
    const m=action.match(/^([A-Za-z_$][\w$]*)\((.*)\)$/); if(!m || typeof window[m[1]]!=='function') return;
    const raw=m[2].trim(); let args=[];
    if(raw==='event') args=[event]; else if(raw==='true') args=[true]; else if(raw==='false') args=[false]; else if(/^-?\d+$/.test(raw)) args=[Number(raw)]; else if(/^'[^']*'$/.test(raw)) args=[raw.slice(1,-1)]; else if(raw) return;
    window[m[1]](...args);
  });
}

/* ===========================================================
   小课表 · 小朋友的上课打卡
   数据模型: { id, date, time, subject, location, duration }
   字段兼容旧版本 (type/status/note) — 自动忽略
=========================================================== */

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const pad = n => String(n).padStart(2, '0');
const fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const fmtTime = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const todayStr = () => fmtDate(new Date());
const nowTimeStr = () => fmtTime(new Date());
const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => 'ck_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const DEFAULT_DURATION = 90;   // 学习时长默认值（分钟），可随时改

let toastTimer = null;
function toast(msg, type) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.className = 'toast', 2200);
}

let modalConfirmFn = null;
function openModal(title, desc, confirmText, confirmFn, danger) {
  $('#modal-title').textContent = title;
  $('#modal-desc').textContent = desc || '';
  $('#modal-body').innerHTML = '';
  $('#modal-confirm').textContent = confirmText || '确认';
  $('#modal-confirm').className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');
  $('#modal-cancel').style.display = '';
  modalConfirmFn = confirmFn;
  $('#modal-overlay').classList.add('open');
}
function closeModal() { $('#modal-overlay').classList.remove('open'); modalConfirmFn = null; }
function confirmModal() { if (modalConfirmFn) modalConfirmFn(); closeModal(); }

/* 支持自定义 HTML 表单的 modal（表单内容写入 #modal-body） */
function openFormModal(title, htmlBody, confirmText, confirmFn, danger) {
  $('#modal-title').textContent = title;
  $('#modal-desc').textContent = '';
  $('#modal-body').innerHTML = htmlBody || '';
  $('#modal-confirm').textContent = confirmText || '确认';
  $('#modal-confirm').className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');
  $('#modal-cancel').style.display = '';
  modalConfirmFn = confirmFn;
  $('#modal-overlay').classList.add('open');
}

/* ========== 数据层 ========== */
const STORAGE_KEY = 'class_class_records_v2';
const META_KEY = 'class_class_meta_v2';
const QUOTA_KEY = 'class_class_quota_v3';

/* 课时包结构: { version:3, subjects: { '英语': { total:34, note:'' }, ... } } */
function loadQuota() {
  try {
    const raw = JSON.parse(localStorage.getItem(QUOTA_KEY));
    if (!raw || typeof raw !== 'object') return {};
    // v3 旧格式迁移: { total, note, updatedAt } → 单科目
    if (typeof raw.total === 'number' && !raw.subjects) {
      if (raw.total > 0) {
        const name = (raw.note || '').trim() || '通用';
        return { [name]: { total: raw.total, note: '' } };
      }
      return {};
    }
    if (!raw.subjects || typeof raw.subjects !== 'object') return {};
    const out = {};
    Object.keys(raw.subjects).forEach(k => {
      const v = raw.subjects[k];
      if (!v || typeof v.total !== 'number' || v.total < 0) return;
      out[k] = { total: v.total, note: v.note || '', t: parseInt(v.t, 10) || 0 };
    });
    return out;
  } catch { return {}; }
}
function saveQuota(subjects) {
  try {
    localStorage.setItem(QUOTA_KEY, JSON.stringify({ version: 3, subjects: subjects || {} }));
    flashSync();
    cloudSchedulePush();   // 数据变了 → 通知云同步
  } catch (e) { toast('保存课时包失败', 'danger'); }
}

function loadRecords() {
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    // 数据迁移: 旧版本字段兼容
    return arr.map(r => ({
      id: r.id || uid(),
      date: r.date || todayStr(),
      time: r.time || '',
      subject: r.subject || '',
      location: r.location || '',
      duration: parseInt(r.duration, 10) || 0,
    })).filter(r => r.subject && r.location && r.duration > 0);
  } catch { return []; }
}

function saveRecords(arr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    flashSync();
    cloudSchedulePush();   // 数据变了 → 通知云同步
  } catch (e) {
    toast('保存失败:可能存储已满', 'danger');
  }
}

function loadMeta() {
  try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; }
  catch { return {}; }
}
function saveMeta(meta) { localStorage.setItem(META_KEY, JSON.stringify(meta)); }

/* 预置示例数据 */
function offsetDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return fmtDate(d);
}

const SEED_DATA = [
  { id: uid(), date: offsetDate(-5), time: '10:00', subject: '阅读', location: '线上', duration: 30 },
  { id: uid(), date: offsetDate(-4), time: '15:30', subject: '英语', location: '教室 A', duration: 45 },
  { id: uid(), date: offsetDate(-3), time: '16:00', subject: '绘画', location: '教室 B', duration: 60 },
  { id: uid(), date: offsetDate(-2), time: '15:30', subject: '英语', location: '教室 A', duration: 45 },
  { id: uid(), date: offsetDate(-1), time: '14:00', subject: '音乐', location: '家里', duration: 60 },
  { id: uid(), date: offsetDate(-1), time: '10:00', subject: '阅读', location: '线上', duration: 30 },
  { id: uid(), date: todayStr(), time: '15:30', subject: '英语', location: '教室 A', duration: 45 },
  { id: uid(), date: todayStr(), time: '16:00', subject: '绘画', location: '教室 B', duration: 60 },
];

/* 预置课时包（按科目）——「音乐」总数待补充，可在页面上一键填写 */
const SEED_QUOTA = {
  '英语': { total: 34, note: '' },
  '绘画':     { total: 7,  note: '' },
  '音乐':     { total: 0,  note: '待补充总课时' },
  '阅读': { total: 5,  note: '' },
};

/* 旧默认课时包 → 新默认值的一次性校正（仅在用户未手动改过该科目时生效） */
const QUOTA_PATCH_KEY = 'class_quota_patch_v1';
const QUOTA_LEGACY = { '阅读': 15 };

function applyQuotaPatch() {
  let done = false;
  try { done = localStorage.getItem(QUOTA_PATCH_KEY) === 'done'; } catch { return; }
  if (done) return;
  try {
    const q = loadQuota();
    if (Object.keys(q).length) {
      let changed = false;
      Object.keys(QUOTA_LEGACY).forEach(sub => {
        // 仍停留在旧默认值才校正，避免覆盖用户手改过的数值
        if (q[sub] && parseInt(q[sub].total, 10) === QUOTA_LEGACY[sub] && SEED_QUOTA[sub]) {
          q[sub] = Object.assign({}, q[sub], { total: SEED_QUOTA[sub].total });
          changed = true;
        }
      });
      if (changed) saveQuota(q);
    }
    localStorage.setItem(QUOTA_PATCH_KEY, 'done');
  } catch (e) { /* 静默失败，不影响主流程 */ }
}

function ensureSeed() {
  if (localStorage.getItem(STORAGE_KEY) === null) {
    saveRecords(SEED_DATA);
    saveMeta({ seeded: true, seededAt: Date.now(), version: 3 });
  }
  // 课时包同步预置（仅当从未设置过时）
  if (localStorage.getItem(QUOTA_KEY) === null) {
    saveQuota(SEED_QUOTA);
  }
  applyQuotaPatch();
}

/* ========== 状态 ========== */
const state = {
  page: 'home',
  records: [],
  meta: {},
  quota: {},
  calCursor: { y: new Date().getFullYear(), m: new Date().getMonth() },
  editingId: null,
};

/* ========== 数据操作 ========== */
function addRecord(rec) {
  const row = { ...rec, id: uid() };
  state.records.unshift(row);
  tombForget(recSign(row));      // 重新打卡同一条 = 复活，撤销之前的删除标记
  saveRecords(state.records);
}
function updateRecord(id, patch) {
  const i = state.records.findIndex(r => r.id === id);
  if (i >= 0) {
    const before = state.records[i];
    const after = { ...before, ...patch };
    state.records[i] = after;
    if (recSign(before) !== recSign(after)) {   // 编辑改了内容：旧内容标记删除，新内容复活
      tombAdd(recSign(before));
      tombForget(recSign(after));
    }
    saveRecords(state.records);
  }
}
function deleteRecord(id) {
  const gone = state.records.find(r => r.id === id);
  if (gone) tombAdd(recSign(gone));   // 删除标记跟着云走，其他设备才会同步删掉
  state.records = state.records.filter(r => r.id !== id);
  saveRecords(state.records);
}
function getByDate(dateStr) { return state.records.filter(r => r.date === dateStr); }
function getTodayRecords() { return getByDate(todayStr()); }

function getClassDates() {
  // 返回有课的所有日期 (YYYY-MM-DD)
  return new Set(state.records.map(r => r.date));
}

function calcStreak() {
  if (state.records.length === 0) return 0;
  const dates = getClassDates();
  let streak = 0;
  const d = new Date();
  while (true) {
    const s = fmtDate(d);
    if (dates.has(s)) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

function calcRange(startDaysAgo, endDaysAgo = 0) {
  const days = [];
  const end = new Date(); end.setDate(end.getDate() - endDaysAgo);
  const start = new Date(); start.setDate(start.getDate() - startDaysAgo);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(fmtDate(d));
  }
  return days;
}

function aggregateBy(field) {
  const map = {};
  state.records.forEach(r => {
    const k = (r[field] || '未分类').trim();
    if (!k) return;
    map[k] = map[k] || { count: 0, minutes: 0, last: null };
    map[k].count++;
    map[k].minutes += (parseInt(r.duration, 10) || 0);
    if (!map[k].last || r.date > map[k].last) map[k].last = r.date;
  });
  return map;
}

/* ========== 同步状态 ========== */
function flashSync() {
  const text = $('#sync-text');
  text.textContent = '正在保存…';
}

/* ========== 时钟 ========== */
function tickClock() {
  const d = new Date();
  $('#live-clock').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/* ========== 路由 ========== */
function switchPage(p) {
  state.page = p;
  $$('.page').forEach(el => el.classList.toggle('active', el.id === 'page-' + p));
  $$('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === p));
  $$('.tab-item').forEach(el => el.classList.toggle('active', el.dataset.page === p));
  const page = $('#page-' + p);
  page.style.animation = 'none';
  void page.offsetWidth;
  page.style.animation = '';
  refreshAll();
}

/* ========== 渲染层 (renderXxx 互不调用,统一由 refreshAll 调度) ========== */

function renderHeader() {
  const hour = new Date().getHours();
  const greet = hour < 6 ? '夜行者' : hour < 12 ? '早起的' : hour < 18 ? '下午好,' : '晚上好,';
  $('#user-greet').textContent = greet + '小朋友';
  $('#streak-days').textContent = calcStreak();
  $('#total-classes-stat').textContent = state.records.length;
}

function renderKpis() {
  const today = getTodayRecords();
  const todayMin = today.reduce((s, r) => s + (parseInt(r.duration, 10) || 0), 0);
  $('#today-classes').textContent = today.length;
  $('#today-minutes').textContent = todayMin;
  $('#today-subjects').textContent = new Set(today.map(r => r.subject)).size;

  const weekDays = calcRange(6, 0);
  const weekRecs = state.records.filter(r => weekDays.includes(r.date));
  const weekMin = weekRecs.reduce((s, r) => s + (parseInt(r.duration, 10) || 0), 0);
  $('#week-classes').textContent = weekRecs.length;
  $('#week-minutes').textContent = weekMin;
  $('#week-avg').textContent = weekDays.length ? Math.round(weekMin / weekDays.length) : 0;

  const totalMin = state.records.reduce((s, r) => s + (parseInt(r.duration, 10) || 0), 0);
  $('#total-classes').textContent = state.records.length;
  $('#total-hours').textContent = (totalMin / 60).toFixed(1);
  const bySubject = aggregateBy('subject');
  const byLocation = aggregateBy('location');
  $('#total-subjects').textContent = Object.keys(bySubject).length;
  $('#total-locations').textContent = Object.keys(byLocation).length;
}

/* 主页 / 看板 复用的"科目卡片"渲染 */
function renderSubjectCard(r, compact) {
  const map = aggregateBy('subject');
  const arr = Object.entries(map);
  const totalMin = arr.reduce((s, [, v]) => s + v.minutes, 0);
  // 按累计时长倒序
  arr.sort((a, b) => b[1].minutes - a[1].minutes);
  return arr.map(([subj, v], i) => {
    const colors = ['#FF8FB1', '#B79CFF', '#FFD166', '#5FD3B4', '#FFB05C', '#FF7A9C', '#9d4edd'];
    const c = colors[i % colors.length];
    const pct = totalMin > 0 ? Math.round(v.minutes / totalMin * 100) : 0;
    return `<div class="subject-card" style="--accent-color:${c}">
      <div class="name">${escapeHtml(subj)}</div>
      <div class="stats">
        <div class="stat"><span class="num" style="color:${c}">${v.count}</span><span class="lbl">节课</span></div>
        <div class="stat"><span class="num" style="color:${c}">${v.minutes}</span><span class="lbl">分钟</span></div>
        ${compact ? '' : `<div class="stat"><span class="num" style="color:${c}">${pct}%</span><span class="lbl">时长占比</span></div>`}
      </div>
      <div class="last">最近: ${v.last || '—'}</div>
    </div>`;
  }).join('');
}

/* ===== 打卡页: 记忆已有内容 =====
   科目 / 地点本身是派生数据（来自记录），这里按"最近用过的排前面"生成快捷键；
   点一下即填入输入框，手机端比 datalist 的下拉更好点。                       */
function recentValues(field, limit) {
  const seen = new Set();
  const out = [];
  state.records.slice()
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .forEach(r => {
      const v = (r[field] || '').trim();
      if (!v || seen.has(v)) return;
      seen.add(v);
      out.push(v);
    });
  return out.slice(0, limit);
}

function lastUsedValue(field) {
  const list = state.records.slice()
    .sort((a, b) => (String(b.date || '') + (b.time || '')).localeCompare(String(a.date || '') + (a.time || '')));
  return list.length ? (list[0][field] || '') : '';
}

function renderChips() {
  const spec = [
    ['#chips-subject', recentValues('subject', 8), '#f-subject'],
    ['#chips-location', recentValues('location', 6), '#f-location'],
    ['#chips-duration', [60, 90, 120, 150], '#f-duration'],
  ];
  spec.forEach(([sel, arr, target]) => {
    const row = $(sel);
    if (!row) return;
    row.dataset.target = target;
    if (!arr.length) { row.innerHTML = `<span class="chip-empty">还没有记录 · 记一次就会记住</span>`; return; }
    const cur = ($(target) && $(target).value || '').trim();
    row.innerHTML = arr.map(v => {
      const label = sel === '#chips-duration' ? `${v} 分钟` : v;
      return `<button type="button" class="chip${String(v) === cur ? ' on' : ''}" data-v="${escapeHtml(String(v))}">${escapeHtml(label)}</button>`;
    }).join('');
  });
}

/* 点标签填入（事件委托：科目名里的引号不会破坏 onclick） */
function bindChipRows() {
  $$('.chip-row').forEach(row => {
    row.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const input = $(row.dataset.target);
      if (!input) return;
      input.value = chip.dataset.v;
      if (input === $('#f-time')) { /* 时间不用标签 */ }
      row.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === chip));
      if (input.type !== 'number') input.focus();
    });
  });
  // 手动改内容时同步高亮
  ['#f-subject', '#f-location', '#f-duration'].forEach(sel => {
    const input = $(sel);
    if (!input) return;
    input.addEventListener('input', () => {
      const row = input.closest('.field') && input.closest('.field').querySelector('.chip-row');
      if (!row) return;
      row.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.v === input.value.trim()));
    });
  });
}

function renderCheckinForm() {
  const subjects = Array.from(new Set(state.records.map(r => r.subject.trim()).filter(Boolean)));
  const locations = Array.from(new Set(state.records.map(r => r.location.trim()).filter(Boolean)));
  $('#subject-list').innerHTML = subjects.map(s => `<option value="${escapeHtml(s)}">`).join('');
  $('#location-list').innerHTML = locations.map(s => `<option value="${escapeHtml(s)}">`).join('');
  if (!$('#f-date').value) $('#f-date').value = todayStr();

  // 记忆：新增时科目/地点沿用最近一次；时长默认 90
  if (!state.editingId) {
    if (!$('#f-subject').value) $('#f-subject').value = lastUsedValue('subject');
    if (!$('#f-location').value) $('#f-location').value = lastUsedValue('location');
    if (!$('#f-duration').value) $('#f-duration').value = DEFAULT_DURATION;
  }
  renderChips();

  // 表单标题动态切换
  if (state.editingId) {
    $('#form-mode-label').textContent = '编辑模式';
    $('#form-mode-label').style.color = 'var(--neon-magenta)';
    $('#submit-btn-label').textContent = '保存修改';
  } else {
    $('#form-mode-label').textContent = '新增模式';
    $('#form-mode-label').style.color = 'var(--text-2)';
    $('#submit-btn-label').textContent = '立即打卡';
  }
}

function renderStats() {
  $('#subject-grid-stats').innerHTML = renderSubjectCard(false) || `<div class="empty-state" style="grid-column:1/-1">暂无数据</div>`;
  $('#subj-count-badge').textContent = Object.keys(aggregateBy('subject')).length + ' 科目';
  drawTrendChart();
  drawPieChart('chart-pie-count', 'pie-count-legend', 'subject', 'count');
  drawBarChart();
  drawLocationChart();
  drawProgressChart();
}

function renderHistory() {
  const fDate = $('#flt-date').value;
  const fSubject = $('#flt-subject').value;
  const fLocation = $('#flt-location').value;
  const fKeyword = ($('#flt-keyword').value || '').trim().toLowerCase();

  const filtered = state.records.filter(r => {
    if (fDate && r.date !== fDate) return false;
    if (fSubject && r.subject !== fSubject) return false;
    if (fLocation && r.location !== fLocation) return false;
    if (fKeyword) {
      const hay = `${r.subject} ${r.location}`.toLowerCase();
      if (!hay.includes(fKeyword)) return false;
    }
    return true;
  });
  filtered.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return (b.time || '').localeCompare(a.time || '');
  });

  $('#history-tbody').innerHTML = filtered.map(r => `
    <tr>
      <td style="font-family:monospace;color:var(--neon-cyan);">${r.date}</td>
      <td style="font-family:monospace;color:var(--neon-cyan);">${r.time || '--:--'}</td>
      <td><span class="today-tag">${escapeHtml(r.subject)}</span></td>
      <td><span class="today-tag magenta">📍 ${escapeHtml(r.location)}</span></td>
      <td><span style="color:var(--neon-magenta);font-family:monospace;">${r.duration}</span> min</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="loadEdit('${r.id}')">编辑</button>
        <button class="btn btn-danger btn-sm" onclick="deleteOne('${r.id}')">删</button>
      </td>
    </tr>
  `).join('');

  $('#history-cards').innerHTML = filtered.map(r => `
    <div class="history-card">
      <div class="ttl">${escapeHtml(r.subject)} · ${r.duration} 分钟</div>
      <div class="history-card-row"><span class="lbl">日期</span><span class="val">${r.date}</span></div>
      <div class="history-card-row"><span class="lbl">时间</span><span class="val accent">${r.time || '--:--'}</span></div>
      <div class="history-card-row"><span class="lbl">地点</span><span class="val">📍 ${escapeHtml(r.location)}</span></div>
      <div style="display:flex;gap:6px;margin-top:8px;">
        <button class="btn btn-ghost btn-sm" onclick="loadEdit('${r.id}')">编辑</button>
        <button class="btn btn-danger btn-sm" onclick="deleteOne('${r.id}')">删除</button>
      </div>
    </div>
  `).join('');

  $('#history-count').textContent = filtered.length + ' 条';
  $('#history-empty').style.display = filtered.length === 0 ? 'block' : 'none';
  const tbl = document.querySelector('.history-table');
  if (tbl) tbl.style.display = filtered.length === 0 ? 'none' : '';

  // 筛选下拉
  const subjects = Array.from(new Set(state.records.map(r => r.subject.trim()).filter(Boolean)));
  const locations = Array.from(new Set(state.records.map(r => r.location.trim()).filter(Boolean)));
  const selS = $('#flt-subject');
  const selL = $('#flt-location');
  selS.innerHTML = '<option value="">全部科目</option>' + subjects.map(s => `<option value="${escapeHtml(s)}" ${s === selS.value ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('');
  selL.innerHTML = '<option value="">全部地点</option>' + locations.map(s => `<option value="${escapeHtml(s)}" ${s === selL.value ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('');
}

function renderCalendar() {
  const { y, m } = state.calCursor;
  $('#cal-title').textContent = `${y}-${pad(m + 1)}`;
  const firstDay = new Date(y, m, 1).getDay();
  const lastDate = new Date(y, m + 1, 0).getDate();
  const monthStr = `${y}-${pad(m + 1)}`;
  const byDay = {};
  state.records.forEach(r => {
    if (r.date.startsWith(monthStr)) {
      byDay[r.date] = (byDay[r.date] || 0) + (parseInt(r.duration, 10) || 0);
    }
  });
  const max = Math.max(0, ...Object.values(byDay));
  const grid = $('#cal-grid');
  grid.innerHTML = '';
  for (let i = 0; i < firstDay; i++) grid.insertAdjacentHTML('beforeend', `<div></div>`);
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${y}-${pad(m + 1)}-${pad(d)}`;
    const minutes = byDay[dateStr] || 0;
    let level = '';
    if (minutes > 0 && max > 0) {
      const pct = minutes / max;
      if (pct > 0.66) level = 'level-3';
      else if (pct > 0.33) level = 'level-2';
      else level = 'level-1';
    }
    const isToday = dateStr === todayStr();
    grid.insertAdjacentHTML('beforeend',
      `<div class="cal-day ${level} ${isToday ? 'today' : ''}" title="${dateStr}${minutes ? ' · ' + minutes + 'min' : ''}">${d}</div>`);
  }
}

/* ========== 课时包（按科目） ========== */
function subjectUsageMap() {
  const m = {};
  state.records.forEach(r => {
    const s = (r.subject || '').trim();
    if (!s) return;
    m[s] = (m[s] || 0) + 1;
  });
  return m;
}

function getQuotaStats() {
  const quota = state.quota || {};
  const used = subjectUsageMap();
  const names = Array.from(new Set([...Object.keys(quota), ...Object.keys(used)]));
  const rows = names.map(name => {
    const q = quota[name] || { total: 0, note: '' };
    const total = q.total || 0;
    const u = used[name] || 0;
    const remaining = total > 0 ? Math.max(total - u, 0) : 0;
    const pct = total > 0 ? Math.min(u / total, 1) : 0;
    const unset = total <= 0;
    const warn = !unset && (remaining <= 5 || (remaining / total) <= 0.1);
    return { name, total, used: u, remaining, pct, unset, warn, note: q.note || '' };
  });
  rows.sort((a, b) => {
    if (a.unset !== b.unset) return a.unset ? 1 : -1;    // 已设置的在前
    if (b.total !== a.total) return b.total - a.total;   // 总课时多的在前
    return a.name.localeCompare(b.name, 'zh');
  });
  const totalAll  = rows.reduce((s, r) => s + r.total, 0);
  const usedAll   = rows.reduce((s, r) => s + r.used, 0);
  const remainAll = rows.reduce((s, r) => s + (r.unset ? 0 : r.remaining), 0);
  const warnCount = rows.filter(r => r.warn).length;
  return { rows, totalAll, usedAll, remainAll, warnCount };
}

function quotaMiniBar(pct, warn, unset) {
  const w = unset ? 0 : Math.round(pct * 100);
  return `<div class="qbar"><div class="qbar-fill${warn ? ' warn' : ''}${unset ? ' unset' : ''}" style="width:${w}%"></div></div>`;
}

function renderQuota() {
  const st = getQuotaStats();
  const bySubj = aggregateBy('subject');
  const colors = ['#FF8FB1', '#B79CFF', '#FFD166', '#5FD3B4', '#FFB05C', '#FF7A9C', '#9d4edd'];
  const targets = [['#quota-card', false], ['#quota-card-stats', true]].filter(([sel]) => $(sel));
  if (!targets.length) return;

  targets.forEach(([sel, isMini]) => {
    const el = $(sel);

    let html = `
      <div class="quota-head">
        <div class="quota-title">
          📚 各科目课时
          ${st.warnCount ? `<span class="quota-warn-tag">⚠ ${st.warnCount} 科告警</span>` : ''}
        </div>
        <div class="quota-actions">
          <button class="btn btn-ghost btn-sm" onclick="showSubjectManager()">管理科目</button>
          <button class="btn btn-ghost btn-sm" onclick="setQuota()">课时设置</button>
          ${isMini ? '' : `<button class="btn btn-ghost btn-sm" onclick="switchPage('stats')">完整看板 →</button>`}
        </div>
      </div>
      <div class="sbox-grid${isMini ? ' mini' : ''}">
    `;

    if (!st.rows.length) {
      html += `<div class="empty-state" style="grid-column:1/-1">还没有任何科目 · 先到<strong>打卡页</strong>录一条上课记录</div>`;
    } else {
      html += st.rows.map((r, i) => {
        const c = colors[i % colors.length];
        const agg = bySubj[r.name] || { count: 0, minutes: 0, last: null };
        return `<div class="sbox${r.warn ? ' warn' : ''}${r.unset ? ' unset' : ''}" style="--accent-color:${c}">
          <div class="sbox-head">
            <div class="sbox-name">${escapeHtml(r.name)}</div>
            ${r.unset ? `<span class="sbox-tag">待填总课时</span>`
                      : (r.warn ? `<span class="sbox-tag warn">告警</span>`
                                : `<span class="sbox-tag">${Math.round(r.pct * 100)}%</span>`)}
          </div>
          <div class="sbox-nums">
            <div class="sbox-cell total"><span class="v">${r.total > 0 ? r.total : '—'}</span><span class="l">总课时</span></div>
            <div class="sbox-cell used"><span class="v">${r.used}</span><span class="l">已用课时</span></div>
            <div class="sbox-cell rest"><span class="v">${r.unset ? '—' : r.remaining}</span><span class="l">剩余课时</span></div>
          </div>
          ${quotaMiniBar(r.pct, r.warn, r.unset)}
          <div class="sbox-foot">
            <span>已上 ${agg.count} 节 · ${agg.minutes} 分钟</span>
            <span>最近 ${agg.last ? agg.last.slice(5) : '—'}</span>
            ${r.unset ? `<button class="btn btn-primary btn-sm" onclick="setQuotaAt(${i})">填写</button>` : ''}
          </div>
        </div>`;
      }).join('');
    }
    html += `</div>`;
    el.innerHTML = html;
  });
}

/* 行按钮只传下标，避免科目名里的引号破坏 onclick */
function setQuotaAt(i) {
  const st = getQuotaStats();
  const row = st.rows[i];
  if (row) setQuota(row.name);
}

function quotaEditRow(name, total) {
  return `<div class="qedit-row" data-row>
    <input class="input qedit-name" type="text" maxlength="24" value="${escapeHtml(name || '')}" placeholder="科目名,如 绘画" />
    <input class="input qedit-total" type="number" min="0" max="9999" value="${total > 0 ? total : ''}" placeholder="总课时" />
    <button class="btn btn-danger btn-sm qedit-del" type="button" onclick="this.parentNode.remove()">×</button>
  </div>`;
}

function addQuotaRow() {
  const list = $('#qedit-list');
  if (!list) return;
  list.insertAdjacentHTML('beforeend', quotaEditRow('', 0));
  const rows = list.querySelectorAll('[data-row]');
  const last = rows[rows.length - 1];
  if (last) last.querySelector('.qedit-name').focus();
}

/* 打开课时包编辑弹窗；focusSubject 用于「填写」按钮定位到指定科目行 */
function setQuota(focusSubject) {
  const st = getQuotaStats();
  const rowsHtml = st.rows.length
    ? st.rows.map(r => quotaEditRow(r.name, r.total)).join('')
    : quotaEditRow('', 0) + quotaEditRow('', 0);

  openFormModal('🎯 课时包设置 · 按科目', `
    <div class="qedit-help">每个科目填「总课时数」即可 —— 已用自动按该科目打卡次数统计,剩余 = 总数 − 已用。</div>
    <div id="qedit-list">${rowsHtml}</div>
    <button class="btn btn-ghost btn-sm" type="button" style="margin-top:10px" onclick="addQuotaRow()">+ 添加科目</button>
    <div style="margin-top:12px;display:flex;justify-content:flex-end;">
      <button class="btn btn-danger btn-sm" type="button" onclick="clearQuota()">清空全部课时包</button>
    </div>
  `, '保存', () => {
    const subjects = {};
    let invalid = '';
    document.querySelectorAll('#qedit-list [data-row]').forEach(row => {
      const name = (row.querySelector('.qedit-name').value || '').trim();
      const raw = (row.querySelector('.qedit-total').value || '').trim();
      if (!name) return;                       // 空行跳过
      const total = parseInt(raw, 10);
      if (raw !== '' && (!total || total < 0)) { invalid = name; return; }
      subjects[name] = total > 0
        ? { total, note: '' }
        : { total: 0, note: '待补充总课时' };
    });
    if (invalid) { toast(`「${invalid}」的总课时填写无效`, 'danger'); return; }
    if (!Object.keys(subjects).length) { toast('请至少填写一个科目', 'danger'); return; }
    const now = Date.now();
    Object.keys(subjects).forEach(name => {
      const old = (state.quota || {})[name];
      const changed = !old || old.total !== subjects[name].total || (old.note || '') !== subjects[name].note;
      subjects[name].t = changed ? now : (old.t || 0);   // 内容没变的科目保留旧时间戳
    });
    Object.keys(state.quota || {}).forEach(name => {
      if (!subjects[name]) quotaTombAdd(name);           // 编辑里删掉的科目 → 删除标记
    });
    state.quota = subjects;
    saveQuota(subjects);
    renderQuota();
    toast(`课时包已保存 · ${Object.keys(subjects).length} 个科目`, 'success');
  });

  // 定位到指定科目（轻微高亮）
  if (focusSubject) {
    setTimeout(() => {
      const rows = document.querySelectorAll('#qedit-list [data-row]');
      for (const row of rows) {
        if (row.querySelector('.qedit-name').value.trim() === focusSubject) {
          row.classList.add('focus');
          row.querySelector('.qedit-total').focus();
          break;
        }
      }
    }, 60);
  }
}

function clearQuota() {
  openModal('清空全部课时包', '确认清空所有科目的课时包设置?打卡记录不受影响,可随时重新填写。', '确认清空', () => {
    Object.keys(state.quota || {}).forEach(name => quotaTombAdd(name));
    state.quota = {};
    saveQuota({});
    renderQuota();
    toast('课时包已清空', 'success');
  }, true);
}

/* ========== 科目管理（改名 / 删除） ==========
   科目不是独立实体 —— 它由打卡记录的 subject 字段派生，
   所以"删科目"必须从记录下手；课时包里的同名条目一并清掉。
   行按钮只传下标，避免科目名里的引号破坏 onclick。             */
let subjectManageCache = [];

function subjectAllNames() {
  const used = subjectUsageMap();
  const quota = state.quota || {};
  return Array.from(new Set([...Object.keys(used), ...Object.keys(quota)]))
    .sort((a, b) => a.localeCompare(b, 'zh'));
}

function showSubjectManager() {
  subjectManageCache = subjectAllNames();
  const agg = aggregateBy('subject');
  const quota = state.quota || {};

  let html = `<div class="qedit-help">科目来自打卡记录，所以<strong>删除科目会连带删除它的打卡记录</strong>；课时包里的同名科目一并清掉。改名只改名字，记录与课时包同步更新。</div>`;
  if (!subjectManageCache.length) {
    html += `<div class="subj-manage-empty">还没有任何科目。<br>到<strong>打卡页</strong>录入上课记录，或在<strong>课时包</strong>里手动添加科目。</div>`;
  } else {
    html += `<div class="subj-manage-list">` + subjectManageCache.map((n, i) => {
      const v = agg[n];
      const bits = [];
      if (v) bits.push(`已打卡 ${v.count} 节 · ${v.minutes} 分钟` + (v.last ? ` · 最近 ${v.last}` : ''));
      if (quota[n]) bits.push(quota[n].total > 0 ? `课时包 ${quota[n].total} 课时` : '课时包 · 未填总课时');
      if (!bits.length) bits.push('暂无关联数据');
      return `<div class="subj-row">
        <div class="subj-info">
          <div class="subj-name">${escapeHtml(n)}</div>
          <div class="subj-meta">${escapeHtml(bits.join(' · '))}</div>
        </div>
        <div class="subj-ops">
          <button class="btn btn-ghost btn-sm" type="button" onclick="renameSubjectAt(${i})">改名</button>
          <button class="btn btn-danger btn-sm" type="button" onclick="deleteSubjectAt(${i})">删除</button>
        </div>
      </div>`;
    }).join('') + `</div>`;
  }
  openFormModal('🏷 科目管理', html, '完成', null);
  $('#modal-cancel').style.display = 'none';   // 纯浏览型弹窗：只留「完成」
}

function deleteSubjectAt(i) {
  const name = subjectManageCache[i];
  if (!name) return;
  const v = aggregateBy('subject')[name];
  const inQuota = !!(state.quota || {})[name];
  const parts = [];
  if (v && v.count) parts.push(`${v.count} 条打卡记录`);
  if (inQuota) parts.push('课时包里的该科目');
  const impact = parts.length ? `会同时删除：${parts.join('、')}。` : '该科目没有任何关联数据。';
  openModal(`删除科目「${name}」?`, impact + '该操作不可撤销，建议先导出一次数据备份。', '确认删除', () => {
    let n = 0;
    state.records = state.records.filter(r => {
      if ((r.subject || '').trim() === name) { n++; tombAdd(recSign(r)); return false; }
      return true;
    });
    saveRecords(state.records);
    if (state.quota && state.quota[name]) {
      delete state.quota[name];
      quotaTombAdd(name);          // 课时包条目的删除标记也要跟着云走
      saveQuota(state.quota);
    }
    refreshAll();
    toast(n ? `已删除科目「${name}」· 连带 ${n} 条记录` : `已删除科目「${name}」`, 'good');
  }, true);
}

function renameSubjectAt(i) {
  const oldName = subjectManageCache[i];
  if (!oldName) return;
  const v = aggregateBy('subject')[oldName];
  const cnt = v ? v.count : 0;
  openFormModal(`改名 · ${oldName}`, `
    <div class="qedit-help">会同步更新 ${cnt} 条打卡记录和课时包里的科目名。若填一个已存在的科目名，两者会合并。</div>
    <input class="input" id="subj-new-name" type="text" maxlength="24" style="width:100%" value="${escapeHtml(oldName)}" />
  `, '保存', () => {
    const nv = ($('#subj-new-name').value || '').trim();
    if (!nv) { toast('科目名不能为空', 'danger'); return; }
    if (nv === oldName) { toast('科目名没有变化'); return; }
    let n = 0;
    state.records.forEach(r => {
      if ((r.subject || '').trim() === oldName) { tombAdd(recSign(r)); r.subject = nv; tombForget(recSign(r)); n++; }
    });
    saveRecords(state.records);
    if (state.quota && state.quota[oldName]) {
      state.quota[nv] = Object.assign({}, state.quota[oldName]);
      delete state.quota[oldName];
      quotaTombAdd(oldName);       // 旧科目名的删除标记跟着云走
      stampQuotaEntry(nv);
      saveQuota(state.quota);
    }
    refreshAll();
    toast(`已改名「${oldName}」→「${nv}」`, 'good');
  });
  setTimeout(() => { const el = $('#subj-new-name'); if (el) { el.focus(); el.select(); } }, 60);
}

/* ========== 格林 · 学习小伙伴 ========== */
function renderGreenie() {
  const el = $('#greenie-msg');
  if (!el) return;
  const today = todayStr();
  const todayRecs = state.records.filter(r => r.date === today);
  const mins = todayRecs.reduce((sum, r) => sum + (r.duration || 0), 0);
  const tips = [
    '认真上课的小朋友，运气都不会差 🍀',
    '格林最喜欢看你打卡的样子啦 🐾',
    '每节课都是一颗小星星，攒满就是银河 ✨',
    '今天的努力，是明天的超能力 💪',
    '慢慢来，格林一直陪着你 🐶',
  ];
  const tip = tips[new Date().getDate() % tips.length];
  const tipHtml = `<span style="color:#B79CFF">${escapeHtml(tip)}</span>`;
  if (!todayRecs.length) {
    el.innerHTML = `今天还没打卡呢，格林在门口等你一起加油～<br>${tipHtml}`;
    return;
  }
  const sorted = todayRecs.slice().sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));
  const last = sorted[sorted.length - 1];
  el.innerHTML = `今天上了 <strong>${todayRecs.length}</strong> 节课 · 共 <strong>${mins}</strong> 分钟` +
    (last && last.subject ? `，最近一节是 <strong>${escapeHtml(last.subject)}</strong> 🐾` : ' 🐾') +
    `<br>${tipHtml}`;
}

/* ========== 格林 · 蹦一下 + 对话气泡 ========== */
/* 主页初始化：把打卡页 img 同步过来（避免两份 base64） */
function syncGreenieAvatars() {
  const checkinImg = document.querySelector('#page-checkin .greenie-avatar img');
  if (!checkinImg) return;
  document.querySelectorAll('.greenie-avatar').forEach(box => {
    if (box.querySelector('img')) return;
    const img = document.createElement('img');
    img.src = checkinImg.src;
    img.alt = '格林';
    box.insertBefore(img, box.firstChild);
  });
}

/* 头像蹦一下 */
function bounceGelin(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.classList.remove('bounce');
  // 强制 reflow 让 animation 重新生效
  void el.offsetWidth;
  el.classList.add('bounce');
  setTimeout(() => el.classList.remove('bounce'), 750);
}

/* 弹出对话气泡；durationMs 之后自动收回 */
function bubbleGelin(bubbleSelector, text, durationMs) {
  const el = document.querySelector(bubbleSelector);
  if (!el) return;
  el.innerHTML = `${escapeHtml(text)}<button class="bubble-close" type="button" aria-label="关闭">×</button>`;
  el.classList.add('show');
  // 关闭按钮
  const closeBtn = el.querySelector('.bubble-close');
  if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); el.classList.remove('show'); };
  if (el._bubbleTimer) clearTimeout(el._bubbleTimer);
  el._bubbleTimer = setTimeout(() => el.classList.remove('show'), durationMs || 4500);
}

/* 打卡成功鼓励语（按今日剩余课程数动态选） */
function gelinCheerOnSuccess() {
  const today = todayStr();
  const recs = state.records.filter(r => r.date === today);
  const cheers = [
    '你真棒，今天有好好学习哦～🐾',
    '格林最喜欢看你认真上课的样子啦 🌸',
    '又上了一节课！今天也是闪闪发光的一天 ✨',
    '下课啦～记得喝口水休息一下 🐶',
    '再坚持一下，离小目标越来越近啦 💪',
  ];
  // 同一节课不重复同一句
  const seed = recs.length + new Date().getDate();
  return cheers[seed % cheers.length];
}

/* ========== 统一刷新入口 (铁律 9) ========== */
function refreshAll() {
  renderHeader();
  renderKpis();
  renderQuota();
  renderGreenie();
  renderCheckinForm();
  renderStats();
  renderHistory();
  renderCalendar();
}

/* ========== 图表引擎 (内联 SVG, 同 Chart.js 体验) ========== */

function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

function makeChart(container, vbW, vbH) {
  container.innerHTML = '';
  const svg = svgEl('svg', { viewBox: `0 0 ${vbW} ${vbH}`, preserveAspectRatio: 'xMidYMid meet', width: '100%', height: '100%' });
  container.appendChild(svg);
  return svg;
}

/* 折线 + 柱: 7 天时长趋势 */
function drawTrendChart() {
  const days = calcRange(6, 0);
  const labels = days.map(d => d.slice(8));
  const values = days.map(d => state.records.filter(r => r.date === d).reduce((s, r) => s + (parseInt(r.duration, 10) || 0), 0));

  const allDays = calcRange(13, 0);
  const allVals = allDays.map(d => state.records.filter(r => r.date === d).reduce((s, r) => s + (parseInt(r.duration, 10) || 0), 0));
  const maSeries = values.map((_, i) => {
    const idx = i + 7;
    const win = allVals.slice(Math.max(0, idx - 6), idx + 1);
    return win.length ? win.reduce((a, b) => a + b, 0) / win.length : 0;
  });

  const W = 480, H = 220, padL = 36, padR = 16, padT = 16, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const svg = makeChart($('#chart-trend'), W, H);

  const max = Math.max(60, ...values, ...maSeries) * 1.15;
  const xStep = innerW / Math.max(1, values.length - 1);
  const yScale = v => padT + innerH - (v / max) * innerH;

  for (let g = 0; g <= 4; g++) {
    const y = padT + (innerH / 4) * g;
    svg.appendChild(svgEl('line', { x1: padL, y1: y, x2: W - padR, y2: y, stroke: 'rgba(255, 143, 177,0.08)', 'stroke-dasharray': '2 4' }));
    const t = svgEl('text', { x: padL - 6, y: y + 3, 'text-anchor': 'end', 'font-size': '9', fill: 'rgba(157, 138, 166,0.5)' });
    svg.appendChild(t); t.textContent = Math.round(max - (max / 4) * g);
  }
  labels.forEach((l, i) => {
    const t = svgEl('text', { x: padL + i * xStep, y: H - padB + 14, 'text-anchor': 'middle', 'font-size': '10', fill: 'rgba(157, 138, 166,0.6)' });
    svg.appendChild(t); t.textContent = l;
  });

  const defs = svgEl('defs');
  defs.innerHTML = `
    <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FF8FB1" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#FF8FB1" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#B79CFF" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#B79CFF" stop-opacity="0"/>
    </linearGradient>
  `;
  svg.appendChild(defs);

  values.forEach((v, i) => {
    const x = padL + i * xStep;
    const h = (v / max) * innerH;
    const y = padT + innerH - h;
    svg.appendChild(svgEl('rect', { x: x - 8, y, width: 16, height: h, rx: 2, fill: 'url(#bar-grad)', opacity: 0.85 }));
  });

  const pathD = values.map((v, i) => `${i ? 'L' : 'M'} ${padL + i * xStep} ${yScale(v)}`).join(' ');
  const fillD = pathD + ` L ${padL + (values.length - 1) * xStep} ${padT + innerH} L ${padL} ${padT + innerH} Z`;
  svg.appendChild(svgEl('path', { d: fillD, fill: 'url(#area-grad)' }));
  svg.appendChild(svgEl('path', { d: pathD, fill: 'none', stroke: '#B79CFF', 'stroke-width': '2', filter: 'drop-shadow(0 0 4px rgba(183, 156, 255,0.6))' }));
  values.forEach((v, i) => {
    svg.appendChild(svgEl('circle', { cx: padL + i * xStep, cy: yScale(v), r: 3, fill: '#B79CFF', filter: 'drop-shadow(0 0 4px #B79CFF)' }));
  });
  const maPath = maSeries.map((v, i) => `${i ? 'L' : 'M'} ${padL + i * xStep} ${yScale(v)}`).join(' ');
  svg.appendChild(svgEl('path', { d: maPath, fill: 'none', stroke: '#FFD166', 'stroke-width': '1.5', 'stroke-dasharray': '3 3', opacity: 0.75 }));
}

/* 饼图 (按次数字段) */
function drawPieChart(containerId, legendId, byField, sumField) {
  const map = aggregateBy(byField);
  const entries = Object.entries(map);
  const total = entries.reduce((s, [, v]) => s + v[sumField], 0);
  const W = 320, H = 240;
  const svg = makeChart($('#' + containerId), W, H);
  const cx = W / 2 - 20, cy = H / 2, r = 80, ir = 50;
  const colors = ['#FF8FB1', '#B79CFF', '#FFD166', '#5FD3B4', '#FFB05C', '#FF7A9C', '#9d4edd', '#39ff14'];

  if (total === 0) {
    svg.appendChild(svgEl('circle', { cx, cy, r, fill: 'none', stroke: 'rgba(255, 143, 177,0.2)', 'stroke-dasharray': '4 4' }));
    const t = svgEl('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', fill: 'rgba(157, 138, 166,0.5)', 'font-size': '12' });
    svg.appendChild(t); t.textContent = '暂无数据';
    $('#' + legendId).innerHTML = '';
    return;
  }

  let start = -Math.PI / 2;
  entries.forEach(([k, v], i) => {
    const angle = (v[sumField] / total) * Math.PI * 2;
    const end = start + angle;
    const large = angle > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
    const x3 = cx + ir * Math.cos(end), y3 = cy + ir * Math.sin(end);
    const x4 = cx + ir * Math.cos(start), y4 = cy + ir * Math.sin(start);
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${ir} ${ir} 0 ${large} 0 ${x4} ${y4} Z`;
    svg.appendChild(svgEl('path', { d, fill: colors[i % colors.length], opacity: 0.85, filter: `drop-shadow(0 0 6px ${colors[i % colors.length]})` }));
    start = end;
  });

  const labelText = sumField === 'count' ? '节课' : '分钟';
  const t1 = svgEl('text', { x: cx, y: cy - 4, 'text-anchor': 'middle', fill: '#FF8FB1', 'font-size': '22', 'font-weight': '700', 'font-family': 'monospace' });
  svg.appendChild(t1); t1.textContent = total;
  const t2 = svgEl('text', { x: cx, y: cy + 14, 'text-anchor': 'middle', fill: 'rgba(157, 138, 166,0.7)', 'font-size': '10', 'letter-spacing': '2' });
  svg.appendChild(t2); t2.textContent = labelText;

  $('#' + legendId).innerHTML = entries.slice(0, 8).map(([k, v], i) => {
    const pct = total > 0 ? Math.round(v[sumField] / total * 100) : 0;
    return `<div class="legend-item" style="color:${colors[i % colors.length]}">
      <span class="legend-swatch" style="background:${colors[i % colors.length]}"></span>${escapeHtml(k)} ${pct}%
    </div>`;
  }).join('');
}

/* 横向柱: 科目累计时长 */
function drawBarChart() {
  const map = aggregateBy('subject');
  const entries = Object.entries(map).sort((a, b) => b[1].minutes - a[1].minutes).slice(0, 8);
  const W = 480, H = 240, padL = 80, padR = 30, padT = 12, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const svg = makeChart($('#chart-bar'), W, H);
  const colors = ['#FF8FB1', '#B79CFF', '#FFD166', '#5FD3B4', '#FFB05C', '#FF7A9C', '#9d4edd', '#39ff14'];

  if (entries.length === 0) {
    const t = svgEl('text', { x: W / 2, y: H / 2, 'text-anchor': 'middle', fill: 'rgba(157, 138, 166,0.5)', 'font-size': '14' });
    svg.appendChild(t); t.textContent = '暂无数据';
    return;
  }

  const max = Math.max(60, ...entries.map(([, v]) => v.minutes)) * 1.15;
  const barH = (innerH - 4 * (entries.length - 1)) / entries.length;

  entries.forEach(([subj, v], i) => {
    const y = padT + i * (barH + 4);
    const w = (v.minutes / max) * innerW;
    const t1 = svgEl('text', { x: padL - 6, y: y + barH / 2 + 4, 'text-anchor': 'end', fill: 'rgba(232,232,255,0.8)', 'font-size': '11' });
    svg.appendChild(t1); t1.textContent = subj.length > 10 ? subj.slice(0, 10) + '…' : subj;
    svg.appendChild(svgEl('rect', { x: padL, y, width: innerW, height: barH, fill: 'rgba(255, 143, 177,0.04)', rx: 3 }));
    svg.appendChild(svgEl('rect', { x: padL, y, width: w, height: barH, fill: colors[i % colors.length], opacity: 0.85, rx: 3, filter: `drop-shadow(0 0 4px ${colors[i % colors.length]})` }));
    const t2 = svgEl('text', { x: padL + w + 6, y: y + barH / 2 + 4, fill: colors[i % colors.length], 'font-size': '10', 'font-family': 'monospace' });
    svg.appendChild(t2); t2.textContent = `${v.minutes}分·${v.count}次`;

    // 进度背景再次填充,以产生"已完成进度"视觉
    const filledPct = w / innerW;
  });
}

/* 地点饼图 */
function drawLocationChart() {
  const map = aggregateBy('location');
  const entries = Object.entries(map);
  const total = entries.reduce((s, [, v]) => s + v.count, 0);

  const W = 320, H = 240;
  const svg = makeChart($('#chart-loc'), W, H);
  const cx = W / 2 - 20, cy = H / 2, r = 75, ir = 45;
  const colors = ['#FF8FB1', '#B79CFF', '#FFD166', '#5FD3B4', '#FFB05C', '#FF7A9C', '#9d4edd'];

  if (total === 0) {
    const t = svgEl('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', fill: 'rgba(157, 138, 166,0.5)', 'font-size': '12' });
    svg.appendChild(t); t.textContent = '暂无数据';
    $('#loc-legend').innerHTML = '';
    return;
  }

  let start = -Math.PI / 2;
  entries.forEach(([k, v], i) => {
    const angle = (v.count / total) * Math.PI * 2;
    if (angle < 0.001) return;
    const end = start + angle;
    const large = angle > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
    const x3 = cx + ir * Math.cos(end), y3 = cy + ir * Math.sin(end);
    const x4 = cx + ir * Math.cos(start), y4 = cy + ir * Math.sin(start);
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${ir} ${ir} 0 ${large} 0 ${x4} ${y4} Z`;
    const c = colors[i % colors.length];
    svg.appendChild(svgEl('path', { d, fill: c, opacity: 0.85, filter: `drop-shadow(0 0 4px ${c})` }));
    start = end;
  });

  const t1 = svgEl('text', { x: cx, y: cy - 2, 'text-anchor': 'middle', fill: '#B79CFF', 'font-size': '20', 'font-weight': '700', 'font-family': 'monospace' });
  svg.appendChild(t1); t1.textContent = total;
  const t2 = svgEl('text', { x: cx, y: cy + 14, 'text-anchor': 'middle', fill: 'rgba(157, 138, 166,0.7)', 'font-size': '9', 'letter-spacing': '2' });
  svg.appendChild(t2); t2.textContent = '节课';

  // 简易地点汇总标签画到右上
  let ty = 14;
  entries.slice(0, 6).forEach(([k, v], i) => {
    const c = colors[i % colors.length];
    const cx0 = W - 130;
    const cx1 = cx0 + 12;
    svg.appendChild(svgEl('circle', { cx: cx1, cy: ty, r: 3.5, fill: c, filter: `drop-shadow(0 0 3px ${c})` }));
    const t = svgEl('text', { x: cx1 + 8, y: ty + 3, fill: 'rgba(232,232,255,0.8)', 'font-size': '10' });
    svg.appendChild(t);
    t.textContent = `${k.length > 8 ? k.slice(0, 8) + '…' : k} ${v.count}`;
    ty += 14;
  });
  $('#loc-legend').innerHTML = entries.map(([k, v], i) => {
    const pct = total > 0 ? Math.round(v.count / total * 100) : 0;
    return `<div class="legend-item"><span class="legend-swatch" style="background:${colors[i % colors.length]};color:${colors[i % colors.length]}"></span>${escapeHtml(k)} ${pct}%</div>`;
  }).join('');
}

/* 学习全景进度条 */
function drawProgressChart() {
  const c = $('#chart-progress');
  const W = 720, H = 60;
  const svg = makeChart(c, W, H);

  if (state.records.length === 0) {
    svg.appendChild(svgEl('rect', { x: 0, y: H / 2 - 4, width: W, height: 8, fill: 'rgba(255, 143, 177,0.06)', rx: 4 }));
    const t = svgEl('text', { x: W / 2, y: H / 2 + 4, 'text-anchor': 'middle', fill: 'rgba(157, 138, 166,0.5)', 'font-size': '12' });
    svg.appendChild(t); t.textContent = '暂无数据';
    $('#pano-today').textContent = 0;
    $('#pano-week').textContent = 0;
    $('#pano-month').textContent = 0;
    $('#pano-avg').textContent = 0;
    return;
  }

  const today = getTodayRecords().length;
  const weekCount = state.records.filter(r => calcRange(6, 0).includes(r.date)).length;
  const monthCount = state.records.filter(r => {
    const d = new Date(r.date);
    return d.getFullYear() === new Date().getFullYear() && d.getMonth() === new Date().getMonth();
  }).length;
  const dayCount = calcRange(13, 0).length;
  const recentMin = state.records.filter(r => calcRange(13, 0).includes(r.date)).reduce((s, r) => s + (parseInt(r.duration, 10) || 0), 0);
  const avg = dayCount ? Math.round(recentMin / dayCount) : 0;

  const total = today + weekCount + monthCount;
  const w1 = total > 0 ? (today / total) * W : 0;
  const w2 = total > 0 ? (weekCount / total) * W : 0;
  const w3 = total > 0 ? (monthCount / total) * W : 0;
  svg.appendChild(svgEl('rect', { x: 0, y: H / 2 - 6, width: W, height: 12, fill: 'rgba(255, 143, 177,0.05)', rx: 6 }));
  svg.appendChild(svgEl('rect', { x: 0, y: H / 2 - 6, width: w1, height: 12, fill: '#5FD3B4', opacity: 0.9, rx: 6, filter: 'drop-shadow(0 0 6px #5FD3B4)' }));
  svg.appendChild(svgEl('rect', { x: w1, y: H / 2 - 6, width: w2, height: 12, fill: '#B79CFF', opacity: 0.85, filter: 'drop-shadow(0 0 4px #B79CFF)' }));
  svg.appendChild(svgEl('rect', { x: w1 + w2, y: H / 2 - 6, width: w3, height: 12, fill: '#FFD166', opacity: 0.85, rx: 6, filter: 'drop-shadow(0 0 4px #FFD166)' }));

  const t1 = svgEl('text', { x: 0, y: H / 2 + 24, fill: '#5FD3B4', 'font-size': '10', 'font-weight': '600' });
  svg.appendChild(t1); t1.textContent = `今日 ${today}`;
  const t2 = svgEl('text', { x: w1 + w2 / 2, y: H / 2 + 24, fill: '#B79CFF', 'text-anchor': 'middle', 'font-size': '10', 'font-weight': '600' });
  svg.appendChild(t2); t2.textContent = `本周 ${weekCount}`;
  const t3 = svgEl('text', { x: W, y: H / 2 + 24, 'text-anchor': 'end', fill: '#FFD166', 'font-size': '10', 'font-weight': '600' });
  svg.appendChild(t3); t3.textContent = `本月 ${monthCount}`;

  $('#pano-today').textContent = today;
  $('#pano-week').textContent = weekCount;
  $('#pano-month').textContent = monthCount;
  $('#pano-avg').textContent = avg;
}

/* ========== 业务操作 ========== */
/* 时间输入: 24小时制手动输入。
   - 删除(退格)时不回填格式, 否则 "16:04"→退格→"16:0"→又补回"16:04", 永远删不掉
   - 不设 maxlength: 预填值占满长度时新输入会被浏览器直接吞掉
   - 聚焦全选(onfocus), 直接打字即可覆盖旧值 */
function onTimeInput(e) {
  const el = e.target || e;
  if (e && typeof e.inputType === 'string' && e.inputType.indexOf('delete') === 0) return;
  formatTimeInput(el);
}
function formatTimeInput(el) {
  const d = el.value.replace(/\D/g, '');
  if (!d) { el.value = ''; return; }               // 允许清空
  if (d.length < 3) { el.value = d; return; }      // 不满 3 位先显示原始数字
  const h2 = parseInt(d.slice(0, 2), 10);
  const oneDigitHour = h2 > 23;                    // 930 → 9:30 而不是 93 分
  const h = oneDigitHour ? parseInt(d[0], 10) : h2;
  const m = Math.min(parseInt((oneDigitHour ? d.slice(1, 3) : d.slice(2, 4)) || '0', 10) || 0, 59);
  el.value = pad(h) + ':' + pad(m);
}
/* 失焦归一化: 补零补冒号; 非法返回 null 并清掉 */
function normalizeTimeValue(raw) {
  const d = String(raw || '').trim().replace(/\D/g, '');
  if (!d) return '';
  let h, m;
  if (d.length <= 2) { h = parseInt(d, 10); m = 0; }
  else {
    const h2 = parseInt(d.slice(0, 2), 10);
    if (h2 <= 23) { h = h2; m = parseInt(d.slice(2), 10) || 0; }
    else { h = parseInt(d[0], 10); m = parseInt(d.slice(1), 10) || 0; }
  }
  if (isNaN(h) || isNaN(m) || h > 23 || m > 59) return null;
  return pad(h) + ':' + pad(m);
}
function normalizeTimeInput(el) {
  const v = normalizeTimeValue(el.value);
  if (v === null) { el.value = ''; toast('时间格式不对, 请填 0:00–23:59', 'danger'); }
  else el.value = v;
}

function submitCheckin() {
  const subject = $('#f-subject').value.trim();
  const location = $('#f-location').value.trim();
  const duration = parseInt($('#f-duration').value, 10);
  const date = $('#f-date').value;
  let time = normalizeTimeValue($('#f-time').value);

  if (!subject) return toast('请填写学习科目', 'danger');
  if (!location) return toast('请填写学习地点', 'danger');
  if (!duration || duration < 1) return toast('请填写有效时长(分钟)', 'danger');
  if (!date) return toast('请选择日期', 'danger');
  if (time === null) return toast('上课时间格式不对, 请填如 14:30', 'danger');

  const data = {
    subject, location, duration, date,
    time: time || nowTimeStr(),
  };

  if (state.editingId) {
    updateRecord(state.editingId, data);
    state.editingId = null;
    toast('修改已保存', 'good');
  } else {
    addRecord(data);
    toast('上课打卡成功 ⚡', 'good');
    // 格林冒出成一只小气泡
    bubbleGelin('#page-checkin .greenie-bubble', gelinCheerOnSuccess(), 5000);
  }
  resetForm();
  refreshAll();
}

function resetForm(clearMemory) {
  state.editingId = null;
  // 记忆已有内容：科目 / 地点沿用最近一次（点「清空」时才真的清掉）；时长回到默认 90
  $('#f-subject').value = clearMemory ? '' : lastUsedValue('subject');
  $('#f-location').value = clearMemory ? '' : lastUsedValue('location');
  $('#f-duration').value = DEFAULT_DURATION;
  $('#f-date').value = todayStr();
  $('#f-time').value = '';   // 留空 = 提交时按当前时间记
  renderChips();
}

function loadEdit(id) {
  const r = state.records.find(x => x.id === id);
  if (!r) return;
  state.editingId = id;
  $('#f-subject').value = r.subject;
  $('#f-location').value = r.location;
  $('#f-duration').value = r.duration;
  $('#f-date').value = r.date;
  $('#f-time').value = r.time || '';
  switchPage('checkin');
  toast('已加载到表单', 'good');
}

function deleteOne(id) {
  openModal('删除这条记录?', '该操作不可撤销,但你可以随时通过「导入恢复」从备份中找回。', '确认删除', () => {
    deleteRecord(id);
    refreshAll();
    toast('已删除', 'good');
  }, true);
}

function changeMonth(delta) {
  state.calCursor.m += delta;
  if (state.calCursor.m < 0) { state.calCursor.m = 11; state.calCursor.y--; }
  if (state.calCursor.m > 11) { state.calCursor.m = 0; state.calCursor.y++; }
  renderCalendar();
}

function resetFilters() {
  $('#flt-date').value = '';
  $('#flt-subject').value = '';
  $('#flt-location').value = '';
  $('#flt-keyword').value = '';
  renderHistory();
}

/* ========== 同步码：手机 ↔ 电脑 搬运数据 ==========
   两台设备的数据各自存在浏览器 localStorage 里，按域名隔离、互不相通。
   这里把「记录 + 课时包」压成一段纯文本码：
     有数据的那台 → 生成码 → 微信发给自己 → 另一台粘贴 → 合并导入。
   导入是**只增不删的合并**（按内容去重），绝不覆盖目标设备已有数据。   */
const SYNC_PREFIX = 'WBCHECK1:';
let pendingSync = null;   // 等待二次确认的同步码 { code, parsed }

/* 记录归一化（与 loadRecords 同口径），脏行直接丢掉 */
function sanitizeRecords(list) {
  return (Array.isArray(list) ? list : []).map(r => ({
    id: (r && r.id) || uid(),
    date: (r && r.date) || todayStr(),
    time: (r && r.time) || '',
    subject: String((r && r.subject) || '').trim(),
    location: String((r && r.location) || '').trim(),
    duration: parseInt(r && r.duration, 10) || 0,
  })).filter(r => r.subject && r.location && r.duration > 0);
}

/* UTF-8 安全的 base64（科目名有中文，btoa 直接喂会抛 InvalidCharacterError） */
function b64enc(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function b64dec(b64) {
  const bin = atob(String(b64 || '').replace(/\s+/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/* 去重签名：同一日期+时间+科目+地点+时长 = 同一条打卡 */
const recSign = r => [r.date || '', r.time || '', r.subject || '', r.location || '', parseInt(r.duration, 10) || 0].join('\u0001');

/* 新的在前，与录入时的数组顺序保持一致 */
function sortRecordsDesc(arr) {
  return arr.slice().sort((a, b) =>
    (b.date || '').localeCompare(a.date || '') || (b.time || '').localeCompare(a.time || ''));
}

function buildSyncCode() {
  const s = [], l = [];
  const idx = (arr, v) => { const i = arr.indexOf(v); return i >= 0 ? i : (arr.push(v) - 1); };
  const rows = sortRecordsDesc(sanitizeRecords(state.records)).map(r =>
    [r.date, r.time, idx(s, r.subject), idx(l, r.location), r.duration]);
  // 课时包只带 total>0 的：本地 total=0 语义是"未填"，带过去没意义
  const quota = {};
  Object.keys(state.quota || {}).forEach(k => {
    const v = state.quota[k];
    if (v && v.total > 0) quota[k] = { total: v.total, note: v.note || '' };
  });
  // q 用与 localStorage 相同的 {version,subjects} 信封，好让 normalizeQuota 直接吃
  const payload = { v: 1, at: todayStr(), n: rows.length, s, l, d: rows, q: { version: 3, subjects: quota } };
  return SYNC_PREFIX + b64enc(JSON.stringify(payload));
}

function parseSyncCode(code) {
  let raw = String(code || '').trim();
  // 容忍微信复制时带上的首尾说明文字 / 换行 / 空格
  const at = raw.indexOf(SYNC_PREFIX);
  if (at < 0) throw new Error('这不像同步码：缺少 ' + SYNC_PREFIX + ' 开头');
  const m = raw.slice(at + SYNC_PREFIX.length).match(/[A-Za-z0-9+/=]+/);
  if (!m) throw new Error('同步码内容不完整，请重新复制完整的一段');
  let p;
  try { p = JSON.parse(b64dec(m[0])); }
  catch { throw new Error('同步码已损坏，请重新复制完整的一段'); }
  if (!p || !Array.isArray(p.d)) throw new Error('同步码格式不正确');
  const s = Array.isArray(p.s) ? p.s : [], l = Array.isArray(p.l) ? p.l : [];
  const records = sanitizeRecords(p.d.map(row => ({
    date: row && row[0], time: row && row[1],
    subject: s[row && row[2]] || '', location: l[row && row[3]] || '',
    duration: row && row[4],
  })));
  const quota = normalizeQuota(p.q) || {};
  return { records, quota, at: p.at || '', rawCount: Array.isArray(p.d) ? p.d.length : 0 };
}

/* 预演：算出会新增多少、重复多少，不动数据 */
function previewSync(parsed) {
  const have = new Set(state.records.map(recSign));
  let add = 0, dup = 0;
  parsed.records.forEach(r => { if (have.has(recSign(r))) dup++; else { add++; have.add(recSign(r)); } });
  const quotaNew = Object.keys(parsed.quota || {}).filter(k => {
    const cur = (state.quota || {})[k];
    return parsed.quota[k].total > 0 && (!cur || !(cur.total > 0));
  });
  return { add, dup, quotaNew };
}

/* 只增不删的合并 */
function mergeSyncData(parsed) {
  const have = new Set(state.records.map(recSign));
  const add = [];
  let dup = 0;
  parsed.records.forEach(r => {
    const k = recSign(r);
    if (have.has(k)) { dup++; return; }
    have.add(k);
    tombForget(k);      // 导入回来 = 复活，撤销删除标记
    add.push(r);
  });
  if (add.length) {
    state.records = sortRecordsDesc(state.records.concat(add));
    saveRecords(state.records);
  }
  let quotaAdd = 0;
  Object.keys(parsed.quota || {}).forEach(k => {
    const inc = parsed.quota[k];
    const cur = (state.quota || {})[k];
    if (inc.total > 0 && (!cur || !(cur.total > 0))) { state.quota[k] = inc; quotaTombForget(k); quotaAdd++; }
  });
  if (quotaAdd) saveQuota(state.quota);
  return { added: add.length, dup, total: state.records.length, quotaAdd };
}

/* ---------- 弹窗 ---------- */
function openSyncModal() {
  pendingSync = null;   // 每次打开都从干净状态开始
  const html = `<div class="sync-wrap">
    <div class="sync-tip">
      手机和电脑的数据各自存在浏览器里、互不相通。这里用一段<b>同步码</b>把数据搬过去：
      <b>有数据的那台生成码 →（微信发给自己）→ 另一台粘贴导入</b>。
      <br>导入只做<b>合并</b>：重复的自动跳过，<b>不会覆盖或删除</b>接收方已有的记录，重复导入同一段码也不会翻倍。
    </div>

    <div class="sync-sep"></div>
    <div class="sync-step">① 在有数据的那台设备上：生成同步码</div>
    <div class="sync-ops">
      <button class="btn btn-primary btn-sm" type="button" onclick="genSyncCode()">生成同步码</button>
      <button class="btn btn-ghost btn-sm" type="button" onclick="copySyncCode()">复制</button>
      <span class="sync-note" id="sync-gen-note"></span>
    </div>
    <textarea class="input sync-code" id="sync-code-out" readonly spellcheck="false"
              placeholder="点「生成同步码」，这里会出现一串码"></textarea>

    <div class="sync-sep"></div>
    <div class="sync-step">② 在要接收数据的那台设备上：粘贴同步码并导入</div>
    <textarea class="input sync-code" id="sync-code-in" spellcheck="false"
              placeholder="把同步码粘贴到这里（首尾多空格、换行都没关系）"></textarea>
    <div class="sync-ops">
      <button class="btn btn-primary btn-sm" type="button" id="sync-apply-btn" onclick="applySyncCode()">导入并合并</button>
      <span class="sync-note" id="sync-in-note"></span>
    </div>
  </div>`;
  openFormModal('🔁 同步码 · 手机 ↔ 电脑', html, '完成', null);
  $('#modal-cancel').style.display = 'none';   // 纯操作型弹窗：只留「完成」
}

function genSyncCode() {
  const code = buildSyncCode();
  const ta = $('#sync-code-out');
  ta.value = code;
  const kb = (code.length / 1024).toFixed(1);
  $('#sync-gen-note').innerHTML = `当前应用 <b>${state.records.length}</b> 条记录 · 码长约 <b>${kb} KB</b>`;
  try { ta.focus(); ta.select(); } catch (e) {}
  return code;
}

function copySyncCode() {
  const ta = $('#sync-code-out');
  if (!ta || !ta.value) { toast('请先点「生成同步码」', 'danger'); return; }
  const val = ta.value;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(val)
      .then(() => toast('已复制，去微信粘贴发给自己', 'good'))
      .catch(() => copyFallback(ta));
  } else copyFallback(ta);
}

/* 微信内置浏览器等环境可能没有 clipboard API，退回选中 + execCommand */
function copyFallback(ta) {
  let ok = false;
  try {
    ta.removeAttribute('readonly');
    ta.focus();
    ta.setSelectionRange(0, ta.value.length);
    ok = document.execCommand('copy');
    ta.setAttribute('readonly', 'readonly');
  } catch (e) { ok = false; }
  toast(ok ? '已复制，去微信粘贴发给自己' : '请长按上面的码 → 全选 → 复制', ok ? 'good' : 'danger');
}

function setSyncNote(el, cls, html) {
  if (!el) return;
  el.className = 'sync-note' + (cls ? ' ' + cls : '');
  el.innerHTML = html;
}

/* 两段式导入：先解析预览（不动数据），确认后再写入 —— 避免误触发 */
function applySyncCode() {
  const box = $('#sync-code-in'), note = $('#sync-in-note'), btn = $('#sync-apply-btn');
  const code = (box && box.value) || '';
  if (!code.trim()) { toast('先把同步码粘贴进来', 'danger'); return; }

  // 第一段：解析 + 预览
  if (!pendingSync || pendingSync.code !== code) {
    let parsed;
    try { parsed = parseSyncCode(code); }
    catch (e) { setSyncNote(note, 'bad', escapeHtml(e.message)); toast(e.message, 'danger'); return; }
    if (!parsed.records.length && !Object.keys(parsed.quota).length) {
      setSyncNote(note, 'bad', '这段码里没有可用数据。');
      return;
    }
    const pv = previewSync(parsed);
    pendingSync = { code, parsed };
    if (btn) btn.textContent = '确认导入 ' + pv.add + ' 条';
    setSyncNote(note, '', `解析成功：码里共 <b>${parsed.records.length}</b> 条记录 —— 其中<b>新增 ${pv.add} 条</b>、`
      + `重复 ${pv.dup} 条${pv.quotaNew.length ? `，另补充 <b>${pv.quotaNew.length}</b> 个科目的课时包` : ''}。`
      + `<br>确认无误后，再点一次「确认导入」写入当前应用。`);
    return;
  }

  // 第二段：写库
  const r = mergeSyncData(pendingSync.parsed);
  pendingSync = null;
  if (btn) btn.textContent = '导入并合并';
  if (box) box.value = '';
  setSyncNote(note, 'ok', `已导入：新增 <b>${r.added}</b> 条 · 跳过重复 <b>${r.dup}</b> 条`
    + (r.quotaAdd ? ` · 补充课时包 <b>${r.quotaAdd}</b> 个科目` : '')
    + ` · 当前应用现有 <b>${r.total}</b> 条`);
  toast(r.added ? `合并完成：新增 ${r.added} 条记录` : '没有新增记录（当前应用已有）', 'good');
}

/* ========== 云同步：两台设备自动保持一致 ==========
   原理：云端存一行数据（key = 配对码）。配了同一配对码的设备读写同一行。
   合并规则与同步码一致（按内容签名去重），另加「删除标记(tombstone)」
   —— 一台设备删了记录，标记上云，其他设备合并时照着删。
   课时包条目带时间戳 t，按"新时间戳胜出"合并。                    */
const CLOUD_CFG = {};
const CLOUD_PREF_KEY = 'class_cloud_sync_v1';    // { key, ts }
const CLOUD_TOMB_KEY = 'class_cloud_tombs_v1';   // { rec:{sig:ts}, quota:{name:ts} }

const cloud = { db: null, key: '', busy: false, timer: null, pushTimer: null, lastMsg: '' };

/* ---------- 删除标记（墓碑） ---------- */
function loadTombs() {
  try {
    const t = JSON.parse(localStorage.getItem(CLOUD_TOMB_KEY)) || {};
    return { rec: t.rec || {}, quota: t.quota || {} };
  } catch { return { rec: {}, quota: {} }; }
}
function saveTombs(t) {
  try { localStorage.setItem(CLOUD_TOMB_KEY, JSON.stringify(t)); } catch (e) {}
}
function tombAdd(sig) {
  if (!sig) return;
  const t = loadTombs();
  t.rec[sig] = Date.now();
  const keys = Object.keys(t.rec);
  if (keys.length > 800) {   // 防膨胀：只留最近 800 条
    keys.sort((a, b) => t.rec[a] - t.rec[b]).slice(0, keys.length - 800).forEach(k => delete t.rec[k]);
  }
  saveTombs(t);
}
function tombForget(sig) {
  if (!sig) return;
  const t = loadTombs();
  if (t.rec[sig]) { delete t.rec[sig]; saveTombs(t); }
}
function quotaTombAdd(name) {
  if (!name) return;
  const t = loadTombs();
  t.quota[name] = Date.now();
  saveTombs(t);
}
function quotaTombForget(name) {
  if (!name) return;
  const t = loadTombs();
  if (t.quota[name]) { delete t.quota[name]; saveTombs(t); }
}
function stampQuotaEntry(name) {
  if (state.quota && state.quota[name]) state.quota[name].t = Date.now();
}

/* ---------- 云端可用性 & SDK ---------- */
function cloudAvailable() { return !!window.tianaCloudDb; }
function cloudLoadPref() { try { return JSON.parse(localStorage.getItem(CLOUD_PREF_KEY)) || null; } catch { return null; } }
function cloudSavePref(p) { try { localStorage.setItem(CLOUD_PREF_KEY, JSON.stringify(p)); } catch {} }
function cloudEnsureDb(done) { done(window.tianaCloudDb || null); }

/* ---------- 配对码 ---------- */
function cloudGenKey() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const pick = n => Array.from({ length: n }, () => abc[Math.floor(Math.random() * abc.length)]).join('');
  return pick(4) + '-' + pick(4) + '-' + pick(4);
}

/* ---------- 上行 payload / 下行合并 ---------- */
function cloudBuildPayload() {
  return {
    v: 1,
    at: new Date().toISOString(),
    records: sanitizeRecords(state.records),
    quota: state.quota || {},
    tombs: loadTombs(),
  };
}
/* 把云端数据合并进本机；返回 { changed, add, del, quotaSet } */
function cloudMergeRemote(remote) {
  const out = { changed: false, add: 0, del: 0, quotaSet: 0 };
  const rTombs = (remote && remote.tombs) || {};
  const rRecT = rTombs.rec || {}, rQuotaT = rTombs.quota || {};
  const myTombs = loadTombs();

  // 1) 记录：按内容签名对账
  const localSigs = new Set(state.records.map(recSign));
  const rows = sanitizeRecords((remote && remote.records) || []);
  const addRows = [];
  rows.forEach(r => {
    const k = recSign(r);
    if (rRecT[k]) return;                    // 云端已标记删除 → 不要
    if (localSigs.has(k) || myTombs.rec[k]) return;   // 本机已有 / 本机删过 → 跳过
    localSigs.add(k);
    addRows.push(r);
  });
  if (addRows.length) {
    out.add = addRows.length;
    state.records = sortRecordsDesc(state.records.concat(addRows));
    out.changed = true;
  }
  // 云端有、本机没有的删除标记 → 照着删 + 收进本机墓碑
  Object.keys(rRecT).forEach(k => {
    if (myTombs.rec[k]) return;
    const before = state.records.length;
    state.records = state.records.filter(r => recSign(r) !== k);
    if (state.records.length !== before) { out.del += before - state.records.length; out.changed = true; }
    myTombs.rec[k] = rRecT[k];
  });

  // 2) 课时包：整包按条目"时间戳新者胜"；墓碑（删除标记）比内容时间戳旧的内容才允许合并
  const rQuota = (remote && remote.quota) || {};
  Object.keys(rQuota).forEach(name => {
    const inc = rQuota[name];
    if (!inc || typeof inc.total !== 'number' || inc.total < 0) return;
    const cur = (state.quota || {})[name];
    const lt = myTombs.quota[name] || 0, rt = rQuotaT[name] || 0;
    const blocked = (lt && lt >= (inc.t || 0)) || (rt && rt >= (inc.t || 0));   // 任一侧删除标记比内容新 → 不复活
    if (!blocked && (!cur || (inc.t || 0) >= (cur.t || 0))) {
      if (!cur || cur.total !== inc.total || (cur.note || '') !== (inc.note || '')) {
        state.quota[name] = { total: inc.total, note: inc.note || '', t: inc.t || 0 };
        out.quotaSet++;
        out.changed = true;
      }
    }
  });
  // 云端有、本机没有的课时包删除标记 → 照着删
  Object.keys(rQuotaT).forEach(name => {
    if (myTombs.quota[name]) return;
    if ((state.quota || {})[name]) { delete state.quota[name]; out.changed = true; }
    myTombs.quota[name] = rQuotaT[name];
  });

  if (out.changed) {
    saveTombs(myTombs);
    saveRecords(state.records);
    saveQuota(state.quota);
    refreshAll();
  }
  return out;
}

/* ---------- 推 / 拉 ---------- */
function cloudSchedulePush() {
  if (!cloud.key) return;
  if (cloud.busy) { setTimeout(() => { if (cloud.key) cloudSchedulePush(); }, 2000); return; }
  clearTimeout(cloud.pushTimer);
  cloud.pushTimer = setTimeout(cloudPush, 1500);
}
function cloudSetMsg(m) { cloud.lastMsg = m; cloudRenderStatus(); }

function cloudPush(cb) {
  if (!cloud.key || cloud.busy) { if (cb) cb(false); return; }
  cloud.busy = true;
  cloudEnsureDb(db => {
    if (!db) { cloud.busy = false; cloudSetMsg('连接失败'); if (cb) cb(false); return; }
    const payload = cloudBuildPayload();
    db.from('sync_store')
      .upsert({ sync_key: cloud.key, payload, rev: Date.now(), updated_at: new Date().toISOString() })
      .then(({ error }) => {
        cloud.busy = false;
        if (error) { cloudSetMsg('上传失败'); if (cb) cb(false); return; }
        cloudSetMsg('已同步 ' + new Date().toLocaleTimeString('zh-CN', { hour12: false }));
        if (cb) cb(true);
      });
  });
}

function cloudPull(cb) {
  if (!cloud.key || cloud.busy) { if (cb) cb(false); return; }
  cloud.busy = true;
  cloudEnsureDb(db => {
    if (!db) { cloud.busy = false; cloudSetMsg('连接失败'); if (cb) cb(false); return; }
    db.from('sync_store').select('payload').eq('sync_key', cloud.key).maybeSingle()
      .then(({ data, error }) => {
        cloud.busy = false;
        if (error) { cloudSetMsg('同步失败'); if (cb) cb(false); return; }
        let changed = false, cloudEmpty = true;
        if (data && data.payload) {
          cloudEmpty = false;
          const r = cloudMergeRemote(data.payload);
          changed = r.changed;
          cloudSetMsg('已同步 ' + new Date().toLocaleTimeString('zh-CN', { hour12: false })
            + `（云端 ${sanitizeRecords(data.payload.records).length} 条）`);
        } else {
          cloudSetMsg('云端还没有数据，等待本机上传');
        }
        // 有变化就把合并结果推回去；云端为空则发布本机数据。都无变化时不写，避免两台设备互相空转
        if (changed || cloudEmpty) cloudPush(ok => { if (cb) cb(ok); });
        else if (cb) cb(true);
      });
  });
}

function cloudSyncNow(cb) {
  if (!cloud.key) { toast('尚未开启云同步', 'danger'); return; }
  cloudSetMsg('同步中...');
  cloudPull(ok => { if (!ok) toast('同步失败，请稍后再试', 'danger'); if (cb) cb(ok); });
}

/* ---------- 开启 / 解除 ---------- */
function cloudStart(key, mode) {
  // mode: 'publish' 以本机数据为准发布；'adopt' 先云端覆盖本机（本机只有示例数据时用）
  const start = () => {
    cloud.key = key;
    cloudSavePref({ key, ts: Date.now() });
    cloudSetMsg('连接中...');
    const go = () => {
      if (mode === 'adopt') {
        cloudEnsureDb(db => {
          if (!db) { cloudSetMsg('连接失败'); return; }
          db.from('sync_store').select('payload').eq('sync_key', key).maybeSingle()
            .then(({ data, error }) => {
              if (error || !data || !data.payload) { cloudStop(); const message=error ? '读取配对数据失败，请重试' : '未找到配对数据，请检查配对码'; cloudSetMsg(message); toast(message, 'danger'); return; }
              // 整体采用云端数据
              state.records = sortRecordsDesc(sanitizeRecords((data.payload.records || [])
                .filter(r => !((data.payload.tombs || {}).rec || {})[recSign(r)])));
              state.quota = {};
              Object.keys(data.payload.quota || {}).forEach(name => {
                const v = data.payload.quota[name];
                if (v && typeof v.total === 'number' && !((data.payload.tombs || {}).quota || {})[name]) {
                  state.quota[name] = { total: v.total, note: v.note || '', t: v.t || 0 };
                }
              });
              saveTombs({ rec: (data.payload.tombs || {}).rec || {}, quota: (data.payload.tombs || {}).quota || {} });
              saveRecords(state.records);
              saveQuota(state.quota);
              refreshAll();
              cloudSetMsg('已采用云端数据');
              cloudStartTimers();
              cloudPush();
            });
        });
      } else if (mode === 'merge') {
        cloudEnsureDb(db => {
          db.from('sync_store').select('payload').eq('sync_key', key).maybeSingle().then(({data, error}) => {
            if (error || !data || !data.payload) { cloudStop(); const message=error ? '读取配对数据失败，请重试' : '未找到配对数据，请检查配对码'; cloudSetMsg(message); toast(message, 'danger'); return; }
            cloudStartTimers(); cloudPull();
          });
        });
      } else {
        cloudStartTimers();
        cloudPull();
      }
    };
    go();
  };
  cloudEnsureDb(db => { if (!db) { toast('云同步连接失败，请确认在线上链接中打开', 'danger'); return; } start(); });
}

function cloudStartTimers() {
  clearInterval(cloud.timer);
  cloud.timer = setInterval(() => { if (!document.hidden) cloudPull(); }, 45000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && cloud.key) cloudPull();
  });
}
function cloudStop() {
  clearInterval(cloud.timer);
  clearTimeout(cloud.pushTimer);
  cloud.key = '';
  cloudSavePref(null);
  cloudSetMsg('');
}

function cloudInit() {
  const p = cloudLoadPref();
  if (!p || !p.key) return;
  if (!cloudAvailable()) { cloudSetMsg('需在线上链接打开才会同步'); return; }
  cloud.key = p.key;
  cloudEnsureDb(db => {
    if (!db) { cloudSetMsg('连接失败'); return; }
    cloudStartTimers();
    cloudPull();
  });
}

/* ---------- 弹窗 UI ---------- */
function cloudRenderStatus() {
  const el = $('#cloud-status');
  if (el) el.textContent = cloud.lastMsg || '';
}
function openCloudModal() {
  const pref = cloudLoadPref();
  const avail = cloudAvailable();
  let html;
  if (!avail) {
    html = `<div class="sync-tip">云同步需要在已登录且数据库连接正常的应用中使用。</div>`;
  } else if (pref && pref.key) {
    html = `<div class="sync-tip">访问同一应用的成员共用课程数据。配对功能可在本应用内合并配对码对应的数据。</div>
      <div class="sync-step" style="margin-top:10px">配对码（另一台设备填这个）</div>
      <div class="sync-ops">
        <input class="input" id="cloud-key-show" readonly value="${escapeHtml(pref.key)}"
               style="flex:1;min-width:0;font-weight:700;letter-spacing:1px" onclick="this.select()">
        <button class="btn btn-ghost btn-sm" type="button" onclick="copyText($('#cloud-key-show').value)">复制</button>
      </div>
      <div class="sync-step" style="margin-top:10px">状态</div>
      <div class="sync-note" id="cloud-status">${escapeHtml(cloud.lastMsg || '等待同步...')}</div>
      <div class="sync-ops" style="margin-top:10px">
        <button class="btn btn-primary btn-sm" type="button" onclick="cloudSyncNow()">立即同步</button>
        <button class="btn btn-danger btn-sm" type="button" onclick="cloudUnbind()">解除配对</button>
      </div>
      <div class="sync-tip" style="margin-top:8px;color:var(--text-2)">解除会停止本应用的配对同步，<b>不会删除</b>现有记录或配对数据。</div>`;
  } else {
    html = `<div class="sync-tip">同一应用的成员默认共用课程数据。可生成配对码，或加入本应用数据库已有的配对数据。<br>注意：配对码就是数据钥匙，<b>不要发到群里</b>，只发给要配对的设备。</div>
      <div class="sync-ops" style="margin-top:12px">
        <button class="btn btn-primary btn-sm" type="button" onclick="cloudEnableNew()">生成配对码并开启</button>
        <span class="sync-note" id="cloud-gen-note"></span>
      </div>
      <div class="sync-sep"></div>
      <div class="sync-step">填入本应用已有的配对码</div>
      <div class="sync-ops">
        <input class="input" id="cloud-key-in" placeholder="如 AB3D-5FGH-JK2M" style="flex:1;min-width:0;text-transform:uppercase">
        <button class="btn btn-primary btn-sm" type="button" onclick="cloudJoin()">加入</button>
      </div>
      <div class="sync-ops" style="margin-top:6px">
        <label style="font-size:13px;color:var(--text-1);display:flex;gap:6px;align-items:center">
          <input type="checkbox" id="cloud-adopt"> <b>用配对数据替换本应用全部课程记录和课时包</b>（影响所有成员）
        </label>
      </div>
      <div class="sync-tip" style="margin-top:8px;color:var(--text-2)">不勾选则按「合并」加入：配对数据中没有的记录仍会保留。</div>`;
  }
  openFormModal('☁ 云同步 · 自动保持一致', html, '完成', null);
  $('#modal-cancel').style.display = 'none';
}

function copyText(txt) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(() => toast('已复制', 'good')).catch(() => toast('复制失败，请手动长按选择', 'danger'));
  } else toast('请长按选择后复制', 'warn');
}

function cloudEnableNew() {
  const key = cloudGenKey();
  cloudStart(key, 'publish');
  const note = $('#cloud-gen-note');
  if (note) note.innerHTML = `配对码：<b>${escapeHtml(key)}</b>（已开启）`;
  toast('云同步已开启', 'good');
  setTimeout(openCloudModal, 600);   // 重绘弹窗展示配对码
}

function cloudJoin() {
  const box = $('#cloud-key-in');
  const key = ((box && box.value) || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key)) { toast('配对码格式不对，应为 XXXX-XXXX-XXXX', 'danger'); return; }
  const adopt = $('#cloud-adopt') && $('#cloud-adopt').checked;
  cloudStart(key, adopt ? 'adopt' : 'merge');
  toast(adopt ? '正在采用云端数据...' : '正在合并云端数据...', 'good');
  setTimeout(openCloudModal, 800);
}

function cloudUnbind() {
  openModal('解除云同步配对?', '本应用将停止配对同步，当前记录与配对数据仍会保留。', '解除', () => {
    cloudStop();
    toast('已解除配对', 'good');
    closeModal();
    openCloudModal();
  }, true);
}

/* ========== 导出/导入/清空 ========== */
function exportData() {
  const data = {
    version: 4,
    exportedAt: new Date().toISOString(),
    records: state.records,
    meta: loadMeta(),
    quota: { version: 3, subjects: state.quota },
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `class-backup-${todayStr()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('导出成功', 'good');
}

/* 兼容多种课时包 JSON 形态,统一归一为 { 科目: {total,note} } */
function normalizeQuota(raw) {
  if (!raw || typeof raw !== 'object') return null;
  // 新格式
  if (raw.subjects && typeof raw.subjects === 'object') {
    const out = {};
    Object.keys(raw.subjects).forEach(k => {
      const v = raw.subjects[k];
      if (v && typeof v.total === 'number' && v.total >= 0) out[k] = { total: v.total, note: v.note || '' };
    });
    return out;
  }
  // v3 单科目旧格式
  if (typeof raw.total === 'number' && raw.total > 0) {
    const name = (raw.note || '').trim() || '通用';
    return { [name]: { total: raw.total, note: '' } };
  }
  return null;
}

function importData(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      let records = [];
      if (Array.isArray(data.records)) records = data.records;
      else if (Array.isArray(data)) records = data; // 兼容旧纯数组格式
      else throw new Error('数据格式不正确');
      const incQuota = normalizeQuota(data.quota);
      const quotaCnt = incQuota ? Object.keys(incQuota).length : 0;
      openModal('导入会覆盖当前所有数据', `检测到 ${records.length} 条记录${quotaCnt ? `, 课时包 ${quotaCnt} 个科目` : ''}。导入后当前数据将被替换,建议先导出当前数据再导入。`, '确认导入', () => {
        state.records = records.map(r => ({
          id: r.id || uid(),
          date: r.date || todayStr(),
          time: r.time || '',
          subject: r.subject || '',
          location: r.location || '',
          duration: parseInt(r.duration, 10) || 0,
        })).filter(r => r.subject && r.location && r.duration > 0);
        saveRecords(state.records);
        if (data.meta) saveMeta(data.meta);
        if (incQuota) {
          state.quota = incQuota;
          saveQuota(incQuota);
        }
        refreshAll();
        toast('导入成功 ⚡', 'good');
      }, true);
    } catch (err) {
      toast('文件解析失败: ' + err.message, 'danger');
    }
  };
  reader.readAsText(file);
  ev.target.value = '';
}

function confirmClearAll() {
  openModal('清空所有数据?', '将删除所有上课记录,且不可撤销(建议先导出备份)。', '确认清空', () => {
    state.records = [];
    saveRecords(state.records);
    refreshAll();
    toast('已清空', 'good');
  }, true);
}

/* ========== 漂浮小可爱背景（爱心 / 星星 / 圆点） ========== */
function initParticles() {
  const canvas = $('#particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const isMobile = W < 768;
  const COUNT = isMobile ? 26 : 48;
  const COLORS = ['#FFB3C6', '#FF8FB1', '#C9B6FF', '#FFE08A', '#A8E6CF', '#A8D8F0'];
  const SHAPES = ['dot', 'heart', 'dot', 'star', 'dot', 'heart'];
  const rand = (a, b) => a + Math.random() * (b - a);
  const items = [];

  for (let i = 0; i < COUNT; i++) {
    items.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: rand(3.5, 9),
      vy: -rand(0.12, 0.45),        // 缓缓上浮
      drift: rand(0.3, 1.1),        // 左右摇摆幅度
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: rand(0.006, 0.018),
      rot: Math.random() * Math.PI * 2,
      vrot: rand(-0.006, 0.006),
      shape: SHAPES[i % SHAPES.length],
      color: COLORS[i % COLORS.length],
      alpha: rand(0.28, 0.66),
    });
  }

  // 心形路径
  function drawHeart(c, r) {
    const s = r / 8;
    c.beginPath();
    c.moveTo(0, 2.6 * s);
    c.bezierCurveTo(-5.4 * s, -1.9 * s, -2.7 * s, -6.8 * s, 0, -3.2 * s);
    c.bezierCurveTo(2.7 * s, -6.8 * s, 5.4 * s, -1.9 * s, 0, 2.6 * s);
    c.closePath();
    c.fill();
  }
  // 五角星路径
  function drawStar(c, r) {
    const R = r * 0.9, R2 = R * 0.46;
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 === 0 ? R : R2;
      const px = Math.cos(rad) * rr, py = Math.sin(rad) * rr;
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath();
    c.fill();
  }

  let lastDraw = 0;
  const FPS = 30;
  function frame(ts) {
    if (ts - lastDraw < 1000 / FPS) { requestAnimationFrame(frame); return; }
    lastDraw = ts;
    ctx.clearRect(0, 0, W, H);
    items.forEach(p => {
      p.phase += p.phaseSpeed;
      p.y += p.vy;
      p.x += Math.sin(p.phase) * p.drift * 0.5;
      p.rot += p.vrot;
      // 出界后从另一侧回来，形成连绵不断的漂浮感
      if (p.y < -24) { p.y = H + 24; p.x = Math.random() * W; }
      if (p.y > H + 24) p.y = -24;
      if (p.x < -24) p.x = W + 24;
      if (p.x > W + 24) p.x = -24;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.shape === 'heart') drawHeart(ctx, p.r);
      else if (p.shape === 'star') drawStar(ctx, p.r);
      else { ctx.beginPath(); ctx.arc(0, 0, p.r * 0.58, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }, 200);
  });
}

/* ========== 启动 ========== */
function init() {
  ensureSeed();
  state.records = loadRecords();
  state.quota = loadQuota();
  $('#f-date').value = todayStr();
  $('#f-time').value = '';   // 留空 = 提交时按当前时间记
  $('#f-duration').value = DEFAULT_DURATION;   // 时长默认 90 分钟，可改
  bindChipRows();

  // 筛选变化: renderHistory 内部刷新历史, 不调其他渲染
  ['flt-date', 'flt-subject', 'flt-location', 'flt-keyword'].forEach(id => {
    $('#' + id).addEventListener('input', () => renderHistory());
    $('#' + id).addEventListener('change', () => renderHistory());
  });

  initParticles();
  syncGreenieAvatars();
  refreshAll();
  tickClock();
  setInterval(tickClock, 1000);

  // 主页小格林：进来打个招呼
  setTimeout(() => {
    const today = todayStr();
    const recs = state.records.filter(r => r.date === today);
    const greet = recs.length
      ? `今天已经上了 ${recs.length} 节课啦，辛苦啦～🐾`
      : '今天要一起加油哦～格林在门口等你 🐶';
    bubbleGelin('#greenie-bubble-home', greet, 5000);
  }, 800);

  console.log('[小课表] 已加载,记录数:', state.records.length);
  cloudInit();   // 已配对过 → 静默拉取云端数据保持一致
}

init();

window.NEON = window.APP = { state, refreshAll, switchPage, addRecord, deleteRecord,
  showSubjectManager, renameSubjectAt, deleteSubjectAt, subjectAllNames,
  setQuotaAt, renderChips, recentValues, lastUsedValue, DEFAULT_DURATION,
  openSyncModal, buildSyncCode, parseSyncCode, previewSync, mergeSyncData, applySyncCode, SYNC_PREFIX,
  // 云同步
  cloud: { CLOUD_CFG, state: cloud, loadTombs, saveTombs, tombAdd, tombForget,
    quotaTombAdd, quotaTombForget, cloudBuildPayload, cloudMergeRemote, cloudStart, cloudStop,
    cloudSyncNow, cloudInit, cloudAvailable, cloudEnsureDb, recSign, sortRecordsDesc, sanitizeRecords } };
