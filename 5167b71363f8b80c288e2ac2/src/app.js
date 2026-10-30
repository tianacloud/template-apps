export function startApp(cloudStore, files, ImageStore) {
'use strict';

/* =========================================================
   待办 · 逻辑层
   - 数据保存在应用数据库，刷新后重新读取
   - 支持：主任务 / 子任务、拖拽排序、跨主任务移动子任务、
          星标高亮、手动置顶、折叠、归档历史、恢复、删除
   ========================================================= */

const KEY = 'todo-popup-v1';

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.prototype.slice.call(root.querySelectorAll(sel));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const svg = (name, cls = '') =>
  `<svg class="ico ${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

/* ---------------- 状态 ----------------
   单列表 + 单列：列表是唯一的分组维度，分类靠顶栏下拉切列表完成。
   看板不再有布局档位，也没有「添加一列」入口 —— 每个列表只有创建时的那 1 列。
   老数据里若带多列（v1.0.0 的 columns / 存量列表），仍原样保留、可删可迁移，不做自动合并。 */

/* 默认列表 id 固定为 DEFAULT_LIST_ID。原有存量数据里既没有 lists 也没有 listId，
   load() 会造出这一个默认列表，normalizeTask 把它兜底填给所有存量任务，
   于是原有任务一条不少、原封不动落在这一个列表里 —— 不自动分列、不自动迁移。 */
const DEFAULT_LIST_ID = 'list-default';
const DEFAULT_LIST_NAME = '默认列表';

/* 默认列。colId 固定为 DEFAULT_COL_ID —— v1.0.0 的列没有列表归属（那时还没有列表），
   加载时整体收进默认列表，normalizeTask 兜底填成 DEFAULT_COL_ID。
   列 id 全局唯一：新建列一律 uid()，绝不跨列表复用同一个 id。 */
const DEFAULT_COL_ID = 'col-default';
const DEFAULT_COL_NAMES = ['待办', '进行中', '已完成'];

/* 列只有「标识 + 名称」两个属性。
   早期版本这里还有一个 w（列宽权重）字段，配合"自由拖拽网格任意排列"用；
   该能力已砍掉，列宽改为固定单列铺满，w 随之废弃。
   原有存量数据里可能已经存了 w —— 读取时直接忽略即可，不报错、不丢列。 */
const makeColumn = (id, name) => ({
  id: id || uid(),
  name: name || '新列'
});

/* 列表自带一个起始列，保证任何列表一建出来就有可落地的列 */
const makeList = (id, name, colId) => ({
  id: id || uid(),
  name: name || '新列表',
  columns: [makeColumn(colId || uid(), DEFAULT_COL_NAMES[0])]
});

const defaults = () => ({
  v: 1,
  tasks: [],
  history: [],
  lists: [makeList(DEFAULT_LIST_ID, DEFAULT_LIST_NAME, DEFAULT_COL_ID)],
  ui: {
    view: 'tasks',                 // tasks | history
    scroll: {},// { [listId]: { tasks, history } } 每个列表各存一份
    autoPinStarred: false,
    activeListId: DEFAULT_LIST_ID, // 当前列表
    theme: 'auto'                  // auto | light | dark
  }
});

/* 当前列表：ui.activeListId 指向的那一个；指向失效（列表被删）时兜底到第一个。
   「默认列表」统一定义为 lists[0] —— 删列表时任务往它身上迁，语义明确。 */
function currentList(st) {
  if (!st.lists || !st.lists.length) st.lists = [makeList(DEFAULT_LIST_ID, DEFAULT_LIST_NAME, DEFAULT_COL_ID)];
  const hit = st.lists.find((l) => l.id === st.ui.activeListId);
  return hit || st.lists[0];
}

/* state.columns = 「当前列表」的访问器视图（数据存在 lists[i] 上）。
   做成访问器而不是维护一份副本：既有代码读 state.columns、往里 push、整体替换全都照旧，
   从根上杜绝「改了视图却忘了写回数据」这类漏写。属性不可枚举，
   存储里只留 lists[]，不写冗余副本。 */
function bindListScope(st) {
  Object.defineProperty(st, 'columns', {
    configurable: true,
    get() { return currentList(st).columns; },
    set(v) { currentList(st).columns = Array.isArray(v) ? v : []; }
  });
  return st;
}

let state = bindListScope(defaults());

/* ---------------- 列表 / 列的读取helper ---------------- */

/* 某个列表的全部列（列表的列只存在于 state.lists 里，state.columns 只是当前列表的视图） */
function columnsOfList(listId) {
  const l = state.lists.find((x) => x.id === listId);
  return l ? l.columns : [];
}

/* 某个列表的默认列：第一列。默认列表的第一列恒为 DEFAULT_COL_ID（load() 保证） */
function defaultColIdOf(listId) {
  const cols = columnsOfList(listId);
  if (cols.some((c) => c.id === DEFAULT_COL_ID)) return DEFAULT_COL_ID;
  return cols.length ? cols[0].id : DEFAULT_COL_ID;
}

/* 当前列表 id（ui.activeListId 已由 load() 保证指向真实存在的列表） */
const activeListId = () => currentList(state).id;

/* 当前列表内的任务 / 历史。切列表后视图、统计、归档都只看这一份 */
const tasksOfActiveList = () => state.tasks.filter((t) => t.listId === activeListId());
/* 历史按「点击完成的时间」倒序（最新完成的在最前）。
   只数当前列表的；filter 得到的是新数组，.sort 只作用于它，不会改动 state.history 原序。 */
const histOfActiveList = () =>
  state.history
    .filter((h) => h.listId === activeListId())
    .sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));

/* 指定列表内的任务。缺 listId 的老数据兜底到默认列表（与 reconcileListScope 同一口径）。
   拖拽落点算全局下标时要用它，不能用 tasksOfActiveList（拖拽只发生在当前列表，但这里按参数取更稳）。*/
const tasksOfList = (listId) =>
  state.tasks.filter((t) => (t.listId || DEFAULT_LIST_ID) === listId);

/* 每个列表各存一份滚动位置，切换列表不会串 */
function scrollOf(view) {
  const id = activeListId();
  if (!state.ui.scroll || typeof state.ui.scroll !== 'object') state.ui.scroll = {};
  const box = state.ui.scroll[id] || (state.ui.scroll[id] = { tasks: 0, history: 0 });
  if (typeof box[view] !== 'number') box[view] = 0;
  return box[view];
}
function setScroll(view, top) {
  const id = activeListId();
  if (!state.ui.scroll || typeof state.ui.scroll !== 'object') state.ui.scroll = {};
  const box = state.ui.scroll[id] || (state.ui.scroll[id] = { tasks: 0, history: 0 });
  box[view] = top;
}
let drag = null;
let dropLine = null;
let dropTarget = null;   // 悬在空列 / 列头时，记录该落的列容器
let saveTimer = 0;
let toastTimer = 0;
let confirmId = null;
let confirmTimer = 0;
let pendingId = null;   // 正在等待输入的空条目，cleanup 时豁免
let moveMenuEl = null;   // 跨列表移动的右键菜单

const normalizeImages = (arr) => (Array.isArray(arr) ? arr
  .filter((x) => x && x.id)
  .map((x) => ({ id: String(x.id), type: x.type || '', size: x.size || 0 })) : []);

const normalizeSub = (s) => ({
  id: s && s.id ? s.id : uid(),
  title: String(s && s.title != null ? s.title : ''),
  done: !!(s && s.done),
  starred: !!(s && s.starred),
  images: normalizeImages(s && s.images)
});

const normalizeList = (l) => ({
  id: l && l.id ? String(l.id) : uid(),
  name: String(l && l.name != null ? l.name : '列表'),
  columns: normalizeColumns(l && l.columns)
});

/* 列只取 id / name：早期废弃的 w（列宽权重）字段直接忽略，不报错、不丢列 */
function normalizeColumns(arr) {
  return (Array.isArray(arr) ? arr : [])
    .filter((c) => c && c.id)
    .map((c) => makeColumn(String(c.id), String(c.name != null ? c.name : '列')));
}

/* 滚动位置归一化：
   v1.0.0 是扁平的 { tasks: n, history: n }；
   多列表后是 { [listId]: { tasks, history } }。
   老格式整体归入默认列表的桶 —— 上次看到的位置照旧复原，不丢。 */
function normalizeScroll(raw) {
  const out = {};
  const num = (v) => (typeof v === 'number' && isFinite(v) && v > 0) ? v : 0;
  if (!raw || typeof raw !== 'object') return out;
  const isFlat = typeof raw.tasks === 'number' || typeof raw.history === 'number';
  if (isFlat) {
    out[DEFAULT_LIST_ID] = { tasks: num(raw.tasks), history: num(raw.history) };
    return out;
  }
  Object.keys(raw).forEach((k) => {
    const v = raw[k];
    if (v && typeof v === 'object') out[k] = { tasks: num(v.tasks), history: num(v.history) };
  });
  return out;
}

const normalizeTask = (t) => ({
  id: t && t.id ? t.id : uid(),
  title: String(t && t.title != null ? t.title : ''),
  starred: !!(t && t.starred),
  pinned: !!(t && t.pinned),
  collapsed: !!(t && t.collapsed),
  /* 存量数据没有 colId —— 兜底归入默认列，不改动原有内容 */
  colId: (t && t.colId) ? String(t.colId) : DEFAULT_COL_ID,
  /* 存量数据没有 listId —— 兜底归入默认列表（全部落在同一个列表，绝不自动分列） */
  listId: (t && t.listId) ? String(t.listId) : DEFAULT_LIST_ID,
  /* 兜底：存量 done 任务原样保留 done 标记（改制后新完成的任务不会再停在列表里，会直接进历史） */
  done: !!(t && t.done),
  doneAt: (t && t.doneAt) || 0,
  createdAt: (t && t.createdAt) || Date.now(),
  images: normalizeImages(t && t.images),
  subs: ((t && t.subs) || []).map(normalizeSub)
});

const normalizeHist = (h) => ({
  id: h && h.id ? h.id : uid(),
  title: String(h && h.title != null ? h.title : ''),
  starred: !!(h && h.starred),
  /* 归档时记下列归属，恢复历史才能回到原来的列（老数据没这字段 → 默认列） */
  colId: (h && h.colId) ? String(h.colId) : DEFAULT_COL_ID,
  /* 同样记下列归属：恢复历史要回到原来的列表（老数据没这字段 → 默认列表） */
  listId: (h && h.listId) ? String(h.listId) : DEFAULT_LIST_ID,
  doneAt: (h && h.doneAt) || Date.now(),
  fromIndex: Number.isFinite(h && h.fromIndex) ? h.fromIndex : 0,
  images: normalizeImages(h && h.images),
  subs: ((h && h.subs) || []).map((s) => ({
    title: String(s && s.title != null ? s.title : ''),
    starred: !!(s && s.starred),
    images: normalizeImages(s && s.images)
  }))
});

function load() {
  const raw = store.read();
  if (!raw) return;
  /* state 换成新对象后必须重新绑定 columns 访问器。
     先记下旧引用，整个解析过程（含清理）都在 try 内完成，
     任何一步出错都整体回滚到「空白但已绑定」的状态，绝不留下半成品 state。 */
  const prev = state;
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return;

    /* v1.0.0 的 columns 是顶层字段。多列表后列从属于列表，
       读取时必须直接取 data 的原始字段 —— 不能走 state.columns 访问器
       （Object.assign 已把老字段写到 base 上，再经访问器读会拿到默认列表的列，
        原有的列会被静默吃掉）。读原始字段是老数据迁移的唯一正确入口。
       顶层的 colLayout（网格布局档位）已随布局功能一起下线，直接忽略即可 ——
       它只是排布偏好，不含任何任务数据，忽略它不会丢一个任务。 */
    const legacyColumns = normalizeColumns(data.columns);

    const base = defaults();
    state = bindListScope(Object.assign(base, data));
    state.ui = Object.assign(base.ui, data.ui || {});
    /* 滚动位置：v1.0.0 是扁平的 {tasks, history}，多列表后改为按列表 id 分桶。
       老数据只有一份滚动位置（就是默认列表的），原样搬进默认列表的桶，一个字不丢。 */
    state.ui.scroll = normalizeScroll(data.ui && data.ui.scroll);
    if (state.ui.view !== 'history') state.ui.view = 'tasks';
    state.tasks = (data.tasks || []).map(normalizeTask);
    state.history = (data.history || []).map(normalizeHist);

    /* 列表：存量数据没有 lists 字段 → 只建一个默认列表，把原有的全部列收进去，
       全部存量任务/历史的 listId 也都兜底指向它（normalizeTask 已填好）。
       一滴数据不少、一条不迁移。v1.0.0 的 columns 原样搬进默认列表，
       语义等价、用户看不到任何变化。 */
    const lists = Array.isArray(data.lists) ? data.lists : [];
    state.lists = lists.filter((l) => l && l.id).map(normalizeList);
    if (!state.lists.length) {
      state.lists = [normalizeList({
        id: DEFAULT_LIST_ID,
        name: DEFAULT_LIST_NAME,
        columns: legacyColumns
      })];
    }
    /* 默认列表必须存在，且必须含 DEFAULT_COL_ID —— 否则指向它的存量任务会"消失" */
    if (!state.lists.some((l) => l.id === DEFAULT_LIST_ID)) {
      state.lists.unshift(normalizeList({
        id: DEFAULT_LIST_ID,
        name: DEFAULT_LIST_NAME,
        columns: legacyColumns
      }));
    }
    const defList = state.lists.find((l) => l.id === DEFAULT_LIST_ID);
    if (!defList.columns.length) defList.columns = [makeColumn(DEFAULT_COL_ID, DEFAULT_COL_NAMES[0])];
    if (!defList.columns.some((c) => c.id === DEFAULT_COL_ID)) {
      defList.columns.unshift(makeColumn(DEFAULT_COL_ID, DEFAULT_COL_NAMES[0]));
    }
    /* 顶层 columns 已从 state 上抹掉：
       既避免访问器把老字段当成当前列表的列读，也保证下次存盘不再写出这个冗余字段。 */
    delete state.columns;
    /* 顶层 colLayout 同样是已废弃的冗余字段，一并抹掉，存盘不再写出 */
    delete state.colLayout;
    bindListScope(state);
    /* 任何列表都至少要有一列，否则任务无处安放。
       老数据里的多列原样保留 —— 虽然不能再加列，但已有的列不能被吞掉。 */
    state.lists.forEach((l) => {
      if (!l.columns.length) l.columns = [makeColumn(uid(), DEFAULT_COL_NAMES[0])];
    });

    /* 当前列表：指向的列表已不存在 → 回落默认列表（绝不让界面开天窗） */
    if (!state.lists.some((l) => l.id === state.ui.activeListId)) {
      state.ui.activeListId = DEFAULT_LIST_ID;
    }

    /* 任务指向的列表 / 列若已不存在（如被删过），回落到默认列表的默认列，保证任务不丢 */
    reconcileListScope();
  } catch (e) {
    /* 解析失败：整体回滚，绝不留下半成品 state（否则界面会空或崩） */
    state = prev;
    throw new Error('保存的数据无法读取，请检查数据后重新打开');
  }
}

function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 90);
}
/* ---------------- 存储层 ----------------
   失败原因必须分清，不能一律说成「空间已满」：
   1) blocked —— 环境不允许写入（沙箱预览 / 隐私模式 / 受限 iframe）
   2) quota   —— 真的写满了（Chrome 约 5MB，本应用数据量远达不到）
   被 block 时自动降级为内存存储，功能可用但关闭即丢，并给出一次明确提示。
*/
const store = cloudStore;

const STORE_TEXT = {
  blocked: {
    warn: '保存结果未确认。请保留当前页面并检查连接，重新打开后核对数据。',
    state: '保存未确认 · 请检查连接',
    bad: true
  },
  quota: {
    warn: '本地存储空间已满，新的改动无法保存。请到设置里清空历史任务后重试。',
    state: '空间已满 · 建议清理历史',
    bad: true
  }
};

let storeIssue = '';
let storeWarnDismissed = false;

function setStoreIssue(reason) {
  if (reason === storeIssue) return;
  storeIssue = reason;
  updateStoreUI();
}

function updateStoreUI() {
  const label = $('#storeState');
  const warn = $('#storageWarn');
  if (!label) return;
  const info = STORE_TEXT[storeIssue];
  if (info) {
    label.textContent = info.state;
    label.className = 'bad';
    if (!storeWarnDismissed) {
      $('#storageWarnText').textContent = info.warn;
      warn.hidden = false;
    }
  } else {
    label.textContent = '正常 · 数据保存在云端';
    label.className = 'good';
    warn.hidden = true;
  }
}

const pendingImageDeletes = new Set();
function saveNow() {
  clearTimeout(saveTimer);
  /* columns 是「当前列表」的访问器视图（不可枚举，JSON.stringify 天然跳过），
     存储里只写 lists[]，不写冗余副本。 */
  const deletions = [...pendingImageDeletes];
  pendingImageDeletes.clear();
  store.write(JSON.stringify(state)).then(async () => {
    setStoreIssue('');
    for (const id of deletions) { try { await ImageStore.del(id); } catch (_) { toast('图片文件清理失败，请检查文件存储'); } }
  }).catch(() => setStoreIssue('blocked'));
}

/* ---------------- 小工具 ---------------- */

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => { el.hidden = true; }, 220);
  }, 1900);
}

function timeLabel(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function cleanup() {
  /* 空标题条目没有意义，直接丢弃；但正在输入中的新条目要保留 */
  state.tasks.forEach((t) => {
    t.subs = t.subs.filter((s) => s.title.trim() || s.id === pendingId);
  });
  state.tasks = state.tasks.filter((t) => t.title.trim() || t.id === pendingId);
}

/* ---------------- 标题渲染：自动识别链接 / 图片 ---------------- */

const LINK_RE = /https?:\/\/[^\s，。；、！？（）()【】《》"'<>\s]+|www\.[^\s，。；、！？（）()【】《》"'<>\s]+/gi;
const IMG_EXT_RE = /\.(png|jpe?g|gif|webp|bmp|avif|svg)(?:[?#].*)?$/i;
const TRAIL_RE = /[.,;:!?)\]}>]$/;

function renderTitle(text) {
  const raw = String(text == null ? '' : text);
  LINK_RE.lastIndex = 0;
  let out = '';
  let last = 0;
  let m;
  while ((m = LINK_RE.exec(raw)) !== null) {
    out += esc(raw.slice(last, m.index));
    let url = m[0];
    let tail = '';
    /* 末尾的标点不算链接的一部分（但 .png 这类扩展名要保留） */
    while (url.length > 4 && TRAIL_RE.test(url) && !IMG_EXT_RE.test(url)) {
      tail = url.slice(-1) + tail;
      url = url.slice(0, -1);
    }
    const href = /^https?:\/\//i.test(url) ? url : 'https://' + url;
    if (IMG_EXT_RE.test(url)) {
      out += `<a class="auto-img-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer" title="${esc(href)}">`
           + `<img class="thumb thumb-remote" src="${esc(href)}" alt="${esc(url)}" loading="lazy" referrerpolicy="no-referrer">`
           + `</a>`;
    } else {
      out += `<a class="auto-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer" title="${esc(href)}">${esc(url)}</a>`;
    }
    out += esc(tail);
    last = m.index + m[0].length;
  }
  out += esc(raw.slice(last));
  return out;
}

/* ---------------- 本地图片区渲染 ---------------- */

const urlCache = new Map();

function imagesBlock(owner, scope) {
  const list = owner.images || [];
  if (!list.length) return '';                 // 无图不占位，保持卡片干净
  const wrapAttrs = `data-scope="${scope}" data-owner="${owner.id || ''}"`;
  const thumbs = list.map((im) => `
    <span class="thumb-wrap" data-img="${im.id}">
      <img class="thumb" data-img="${im.id}" alt="图片">
      <button class="thumb-del" data-act="del-img" data-img="${im.id}" ${wrapAttrs} title="移除图片" type="button">${svg('close')}</button>
    </span>`).join('');
  return `
    <div class="imgs" ${wrapAttrs}>
      <div class="imgs-row">
        ${thumbs}
        <button class="add-img" data-act="add-img" ${wrapAttrs} type="button" title="添加图片">${svg('image')}<span>添加</span></button>
      </div>
    </div>`;
}

async function hydrateImages() {
  const nodes = $$('img.thumb[data-img]:not([data-loaded])');
  for (const img of nodes) {
    const id = img.dataset.img;
    img.dataset.loaded = '1';
    if (urlCache.has(id)) { img.src = urlCache.get(id); continue; }
    let blob = null;
    try { blob = await ImageStore.get(id); } catch (e) { blob = null; }
    if (!blob) { const w = img.closest('.thumb-wrap'); if (w) w.remove(); continue; }
    const url = URL.createObjectURL(blob);
    urlCache.set(id, url);
    img.src = url;
  }
}

function imageFilesFrom(dt) {
  const out = [];
  if (!dt) return out;
  if (dt.files && dt.files.length) {
    for (const f of dt.files) if (f.type && f.type.indexOf('image/') === 0) out.push(f);
    return out;
  }
  if (dt.items && dt.items.length) {
    for (const it of dt.items) {
      if (it.kind === 'file' && it.type && it.type.indexOf('image/') === 0) {
        const f = it.getAsFile();
        if (f) out.push(f);
      }
    }
  }
  return out;
}

/* 只写入数据，不触发渲染 —— 由调用方决定何时重绘 */
async function attachImages(owner, files) {
  let n = 0;
  for (const f of files) {
    try {
      const rec = await ImageStore.add(f);
      if (!owner.images) owner.images = [];
      owner.images.push({ id: rec.id, type: rec.type, size: rec.size });
      n++;
    } catch (e) { toast('图片保存失败，请检查连接后重试'); }
  }
  return n;
}

function dropImage(imgId) {
  const url = urlCache.get(imgId);
  if (url) { URL.revokeObjectURL(url); urlCache.delete(imgId); }
  pendingImageDeletes.add(imgId);
}

function dropOwnerImages(owner) {
  const t = owner;
  if (!t) return;
  (t.images || []).forEach((im) => dropImage(im.id));
  (t.subs || []).forEach((s) => (s.images || []).forEach((im) => dropImage(im.id)));
}

function removeImage(owner, imgId) {
  owner.images = (owner.images || []).filter((x) => x.id !== imgId);
  dropImage(imgId);
  saveNow();
  render();
}

function ownerFromEvent(btn) {
  const scope = btn.getAttribute('data-scope');
  const ownerId = btn.getAttribute('data-owner');
  if (scope === 'sub') {
    const found = findSub(ownerId);
    return found ? found.sub : null;
  }
  return findTask(ownerId);
}

/* 隐藏的文件选择器 */
const filePicker = document.createElement('input');
filePicker.type = 'file';
filePicker.accept = 'image/*';
filePicker.multiple = true;
filePicker.style.display = 'none';
document.body.appendChild(filePicker);

let pickTarget = null;
filePicker.addEventListener('change', () => {
  const files = Array.prototype.slice.call(filePicker.files || []);
  const owner = pickTarget;
  pickTarget = null;
  filePicker.value = '';
  if (!owner || !files.length) return;
  attachImages(owner, files).then((n) => {
    saveNow();
    render();
    toast(n ? `已添加 ${n} 张图片` : '图片添加失败');
  });
});

/* 粘贴图片到新建框 → 新建任务并挂图（标题沿用已输入内容） */
function onPasteIntoNewInput(e) {
  const files = imageFilesFrom(e.clipboardData);
  if (!files.length) return;
  e.preventDefault();
  const typed = newTaskInput.value.trim();
  newTaskInput.value = '';
  autoGrowInput(newTaskInput);       // 贴图后清空标题，复位输入框高度
  createTaskWithImages(typed, files);
}

/* 粘贴到页面其他位置 → 同样新建任务承接图片 */
function onPasteOutsideEditor(e) {
  if (e.defaultPrevented) return;
  if (e.target.closest('.edit-input')) return;
  if (e.target === newTaskInput) return;
  const files = imageFilesFrom(e.clipboardData);
  if (!files.length) return;
  e.preventDefault();
  createTaskWithImages('', files);
}

async function createTaskWithImages(title, files) {
  const listId = activeListId();
  const col = defaultColIdOf(listId);
  const t = {
    id: uid(), title: title || '', starred: false, pinned: false, collapsed: false,
    listId: listId, colId: col,
    createdAt: Date.now(), subs: [], images: []
  };
  state.tasks.splice(insertIndexForNewTask(listId), 0, t);
  pendingId = t.id;
  setScroll('tasks', 0);
  const n = await attachImages(t, files);
  saveNow();
  render();
  toast(n ? `已添加 ${n} 张图片` : '图片添加失败');
  const card = $(`.task-card[data-id="${t.id}"]`);
  if (card) {
    const span = card.querySelector('.title');
    if (span) startEdit(span, (val) => { t.title = val; });
  }
}

/* ---------------- 渲染 ---------------- */

const viewport = $('#viewport');

/* 列表归属自愈：保证每条任务 / 历史都挂在真实存在的列表与列上。
   缺 listId → 默认列表（存量数据的兜底语义）；指向已删的列表/列 → 该列表的默认列。
   收敛到这一个函数里做，而不是指望每个建任务的入口都记得写对：
   这样「任务建出来了但界面看不见」这类数据丢失问题从根上不可能发生。 */
function reconcileListScope() {
  const listIds = new Set(state.lists.map((l) => l.id));
  if (!listIds.has(state.ui.activeListId)) state.ui.activeListId = DEFAULT_LIST_ID;
  const fix = (o) => {
    if (!o.listId || !listIds.has(o.listId)) o.listId = DEFAULT_LIST_ID;
    const cols = columnsOfList(o.listId);
    if (!cols.some((c) => c.id === o.colId)) o.colId = defaultColIdOf(o.listId);
  };
  state.tasks.forEach(fix);
  state.history.forEach(fix);
}

function render() {
  cleanup();
  reconcileListScope();
  const view = state.ui.view;
  const isHist = view === 'history';
  document.body.dataset.view = view;

  $('#topbarMain').hidden = isHist;
  $('#topbarHistory').hidden = !isHist;
  $('#composer').hidden = isHist;
  $('#board').hidden = isHist;
  $('#histList').hidden = !isHist;
  $('#emptyTasks').hidden = true;
  $('#emptyHistory').hidden = true;

  if (isHist) renderHistory(); else renderTasks();

  renderListSelect();
  syncTheme();
  updateSummary();
  viewport.scrollTop = scrollOf(view) || 0;
  hydrateImages();
}

/* 顶栏统计：只保留「总待办 N」（所有列表未完成任务数之和）。
   界面要求去掉各列表明细（· 列表名 N），主界面更简洁；
   一个未完成任务都没有时显示「暂无任务」。
   统计口径（只数未完成）在导出文案、说明里保持一致，不混已完成数。 */
function updateSummary() {
  const el = $('#summary');
  if (!el) return;
  const total = state.tasks.filter((t) => !t.done).length;
  el.textContent = total ? ('总待办 ' + total) : '暂无任务';
  $('#histSummary').textContent = `${histOfActiveList().length} 条已归档`;
  syncSummaryMarquee(el);
}

/* 顶栏统计「超宽才滚动，不超宽就静止」。
   界面不使用横向滚动条，所以这里不靠 overflow 滚动，而是量出溢出宽度后
   给元素加 .marquee 并写入 --marquee-shift，由 CSS 关键帧做无缝循环。
   scrollWidth 只在内容渲染完后才有意义，所以放到下一帧再量。 */
function syncSummaryMarquee(el) {
  el.classList.remove('marquee');
  el.style.removeProperty('--marquee-shift');
  if (!el.textContent) return;
  /* 先读一次强制重排，拿到真实宽度 */
  void el.offsetWidth;
  const over = el.scrollWidth - el.clientWidth;
  if (over <= 2) return;/* 装得下 → 完全静止，不做任何动画 */
  /* 位移量就是溢出宽度（正好把被藏起来的那段露出来），不多移。
     时长按「每秒约 24px」给，且封顶 26s：位移大到几百像素时若线性放时长，
     会出现「滑一分钟才看完」的拖沓感，反而比看不到更糟。 */
  const shift = over;
  el.style.setProperty('--marquee-shift', shift + 'px');
  const dur = Math.min(26, Math.max(7, Math.round(shift / 24) + 7));
  el.style.setProperty('--marquee-dur', dur + 's');
  el.classList.add('marquee');
}

function renderTasks() {
  const board = $('#board');
  /* 先排序再取当前列表：sortTasksInPlace 会把显示顺序写回 state.tasks，
     若先取 mine 拿到的就是排序前的旧数组引用，置顶任务提到列首就不会生效。
     （这条顺序不能反 —— regress-pin 的置顶前置用例就是守着它。） */
  const hasAny = tasksOfList(activeListId()).length > 0;
  if (!hasAny) {
    board.innerHTML = '';
    board.hidden = true;
    $('#emptyTasks').hidden = false;
    return;
  }
  board.hidden = false;
  $('#emptyTasks').hidden = true;

  /* 先把当前列表按显示顺序写回数组，让数组顺序 = 显示顺序（拖拽才能对上） */
  sortTasksInPlace(true);

  /* 排序后再取，拿到的是已按显示顺序排好的数组 */
  const mine = tasksOfActiveList();

  /* 单列铺满：不再有列壳、不再按列分区，任务直接平铺在整个界面宽度上。
     布局档位与boardStyle() 已随网格布局一并下线，不再写任何 grid 样式。 */
  board.style.gridTemplateColumns = '';
  board.style.gridAutoRows = '';
  board.style.minHeight = '';

  board.innerHTML = mine.map(taskCard).join('');

  /* 二次确认中的删除按钮 */
  if (confirmId) {
    const card = board.querySelector(`.task-card[data-id="${confirmId}"]`);
    if (card) card.classList.add('confirming');
  }
  hydrateImages();
}

/* 某列的显示顺序：置顶区 → 进行中 → 本周已完成（垫底）。

   关键设计：把排序结果**写回数组**，让数组顺序 = 显示顺序。
   否则拖拽按数组下标插入、渲染按 rank 重排，两者永远打架
   （表现为「拖了但位置没变」）。 */
/* 把任务按显示顺序写回数组，并（可选）落盘。
   排序是幂等的 —— 每次渲染都会得到同一顺序，所以即使调用方先 saveNow()，
   这里重排后再存一次即可保证存储顺序与显示顺序一致。
   多列表：按「列表顺序 → 列内 rank」分组，全局数组一次成型；
   别的列表的任务原样保留位置语义，不会被当前列表的排版打乱。
   列已降级为纯数据字段（界面不再显示），所以排序只按列表分组 + rank，
   不再按列切分 —— 老数据多列的任务会自然汇成一条序列。 */
function sortTasksInPlace(persist) {
  const before = state.tasks.map((t) => t.id).join(',');
  const rank = (t) => (t.pinned || (t.starred && state.ui.autoPinStarred)) ? 0 : (t.done ? 2 : 1);
  /* 按列表分组，列表内按 rank + 原始次序排序，再拼回全局数组 */
  const byList = new Map();
  state.tasks.forEach((t) => {
    const k = t.listId || DEFAULT_LIST_ID;
    if (!byList.has(k)) byList.set(k, []);
    byList.get(k).push(t);
  });
  const next = [];
  state.lists.forEach((l) => {
    const list = byList.get(l.id);
    if (!list) return;
    list
      .map((t, i) => ({ t, i }))
      .sort((a, b) => (rank(a.t) - rank(b.t)) || (a.i - b.i))
      .forEach((x) => next.push(x.t));
  });
  /* 指向已删列表的孤儿任务兜底追加，避免丢失 */
  const placed = new Set(next.map((t) => t.id));
  state.tasks.forEach((t) => { if (!placed.has(t.id)) next.push(t); });
  state.tasks = next;
  if (persist && next.map((t) => t.id).join(',') !== before) saveNow();
}

function taskCard(t) {
  const doneCount = t.subs.filter((s) => s.done).length;
  const meta = t.subs.length ? `${doneCount}/${t.subs.length} 子任务` : '';
  const tools = t.done ? '' : `
    <div class="card-tools">
      <button class="tool pin${t.pinned ? ' on' : ''}" data-act="pin-task" type="button" title="置顶">${svg('pin')}</button>
      <button class="tool star${t.starred ? ' on' : ''}" data-act="star-task" type="button" title="标为重点">${svg('star')}</button>
      <button class="tool" data-act="add-sub" type="button" title="添加子任务">${svg('plus')}</button>
      <button class="tool del" data-act="del-task" type="button" title="删除">${svg('trash')}</button>
      ${t.subs.length ? `<button class="tool fold" data-act="fold-task" type="button" title="展开 / 收起">${svg('chev')}</button>` : ''}
    </div>`;

  const confirmBar = `
    <div class="confirm-bar">
      <span>删除这个任务？子任务会一起删除。</span>
      <button data-act="confirm-del" type="button">删除</button>
      <button data-act="cancel-del" type="button">取消</button>
    </div>`;

  return `
  <li class="task-card${t.starred ? ' starred' : ''}${t.collapsed ? ' collapsed' : ''}${t.done ? ' done' : ''}"
      data-id="${t.id}" draggable="true">
    <div class="card-head">
      <button class="handle" type="button" title="拖动排序" tabindex="-1">${svg('grip')}</button>
      <button class="check" data-act="toggle-task" type="button" title="${t.done ? '撤销完成' : '标记完成（归入历史记录）'}">${svg('check')}</button>
      <div class="title-wrap">
        <span class="title" title="双击编辑">${renderTitle(t.title)}</span>
        <span class="meta">${meta}</span>
      </div>
      ${t.done ? `<button class="tool archive" data-act="archive-now" type="button" title="立即归档">${svg('undo')}</button>` : ''}
      ${tools}
    </div>
    ${imagesBlock(t, 'task')}
    <ul class="subs">${t.subs.map((s) => subItem(s, t.id)).join('')}</ul>
    ${confirmId === t.id ? confirmBar : ''}
  </li>`;
}

function subItem(s, taskId) {
  return `
  <li class="sub-item${s.done ? ' done' : ''}${s.starred ? ' starred' : ''}"
      data-id="${s.id}" data-task="${taskId}" draggable="true">
    <button class="handle" type="button" title="拖动排序" tabindex="-1">${svg('grip')}</button>
    <button class="check" data-act="toggle-sub" type="button" title="完成">${svg('check')}</button>
    <span class="title" title="双击编辑">${renderTitle(s.title)}</span>
    <div class="sub-tools">
      <button class="tool star${s.starred ? ' on' : ''}" data-act="star-sub" type="button" title="标为重点">${svg('star')}</button>
      <button class="tool del" data-act="del-sub" type="button" title="删除">${svg('trash')}</button>
    </div>
    ${imagesBlock(s, 'sub')}
  </li>`;
}

function renderHistory() {
  const list = $('#histList');
  /* 历史只显示当前列表的条目（每个列表的任务各归各的，不串） */
  const mine = histOfActiveList();
  if (!mine.length) {
    list.innerHTML = '';
    $('#emptyHistory').hidden = false;
    return;
  }
  list.innerHTML = mine.map((h) => {
    const subInfo = h.subs.length ? ` · ${h.subs.length} 个子任务` : '';
    return `
    <li class="hist-card" data-id="${h.id}">
      <div class="hist-main">
        <span class="hist-title">${esc(h.title)}</span>
        <span class="hist-meta">${timeLabel(h.doneAt)} 完成${subInfo}</span>
      </div>
      <div class="hist-tools">
        <button class="tool restore" data-act="restore" type="button" title="恢复">${svg('undo')}</button>
        <button class="tool del" data-act="del-hist" type="button" title="删除">${svg('trash')}</button>
      </div>
    </li>`;
  }).join('');
}

/* ---------------- 查找 ---------------- */

const findTask = (id) => state.tasks.find((t) => t.id === id);
function findSub(subId) {
  for (const t of state.tasks) {
    const i = t.subs.findIndex((s) => s.id === subId);
    if (i > -1) return { task: t, sub: t.subs[i], index: i };
  }
  return null;
}

/* ---------------- 列查找 ----------------
   界面上已没有「列」这个概念：层级是 列表 -> 任务 -> 子任务，任务直接平铺铺满整个界面。
   但存储里每个列表的 columns 字段必须原样保留（老数据可能带多列，一个字都不能抹掉），
   所以下面这个查找函数仍要留着 —— 历史恢复、导出分区等老路径会按 colId 找列。

   state.columns 是 currentList(state).columns 的实时视图，所以照旧可用。 */

/* 在列集合里找列。默认只找当前列表的列；
   all=true 时跨列表找（历史恢复用 —— 历史条目可能属于别的列表）。 */
function findColumn(id, all) {
  if (!all) return state.columns.find((c) => c.id === id) || null;
  for (const l of state.lists) {
    const hit = l.columns.find((c) => c.id === id);
    if (hit) return hit;
  }
  return null;
}

/* ---------------- 列表操作 ----------------
   列表是「看板的集合」：一个列表一套列、一套布局档位、一套滚动位置。
   列表之间数据完全隔离 —— 只有删列表时才会把它的内容整体迁到默认列表。 */

/* 顶栏列表下拉：列出全部列表 */
function renderListSelect() {
  const sel = $('#listSelect');
  if (!sel) return;
  sel.innerHTML = state.lists
    .map((l) => `<option value="${esc(l.id)}">${esc(l.name)}</option>`)
    .join('');
  sel.value = activeListId();
  /* 重命名 / 删除 入口已收进「右键下拉框」菜单（见 openListMenu），
     主界面不再常驻这两个按钮，避免删除按钮误触、保持简洁。 */
}

/* 切换列表：立即渲染该列表自己的列与任务，布局档位 / 滚动位置也各自恢复 */
function switchList(listId) {
  if (!state.lists.some((l) => l.id === listId)) return;
  if (state.ui.activeListId === listId) return;
  /* 先把还开着的改名输入框收尾，避免它悬在已被切走的列表上 */
  settleListRename();
  state.ui.activeListId = listId;
  /* 确认态跨列表无意义，清掉避免误确认 */
  confirmId = null;
  clearTimeout(confirmTimer);
  state.ui.view = 'tasks';
  saveNow();
  render();
  toast(`已切换到「${currentList(state).name}」`);
}

function addList() {
  settleListRename();
  const l = makeList(uid(), '新列表');
  state.lists.push(l);
  state.ui.activeListId = l.id;
  confirmId = null;
  clearTimeout(confirmTimer);
  saveNow();
  render();
  startListRename();
}

/* 列表改名：在顶栏下拉的位置就地放一个输入框，与列改名同一套交互。
   下拉本身不销毁（只是隐藏），change 监听器因此始终在；
   收尾时移除输入框并显示下拉，render() 里的 renderListSelect() 再刷新选项文字。

   改名期间锁住目标列表 id：若中途切换/新建/删除了列表，先把改名收尾再动列表，
   绝不会出现「改的是另一个列表」或「下拉与输入框指向不同列表」的错位。 */
let renamingListId = '';
function startListRename() {
  const l = currentList(state);
  const box = $('#listSelect');
  if (!box || $('.list-input')) return;
  renamingListId = l.id;
  const input = document.createElement('input');
  input.className = 'list-input';
  input.type = 'text';
  input.maxLength = 20;
  input.value = l.name;
  box.hidden = true;
  box.parentNode.insertBefore(input, box.nextSibling);
  input.focus();
  input.select();
  const done = (keep) => {
    /* 幂等收尾：settleListRename() 移除输入框会触发 blur → 再次调done()，
       若不加这道闸，第二次进来时 input 已不在 DOM 里，
       removeChild 会抛 NotFoundError（"no longer a child of this node"）。
       这在「开着改名框又去点删除列表」时必现，属于真实崩溃路径，必须挡住。 */
    if (input.dataset.settled === '1') return;
    input.dataset.settled = '1';
    const v = input.value.trim();
    /* 只写回当初打开输入框时的那个列表，且它必须还在 */
    const target = state.lists.find((x) => x.id === renamingListId);
    if (keep && v && target) target.name = v;
    renamingListId = '';
    if (input.parentNode) input.parentNode.removeChild(input);
    box.hidden = false;
    saveNow();
    render();
  };
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); done(true); return; }
    if (e.key === 'Escape') { e.preventDefault(); done(false); }
  });
  input.addEventListener('blur', () => done(true));
}

/* 列表结构要变动之前，先把还开着的改名输入框收尾（提交改名并恢复下拉） */
function settleListRename() {
  const input = $('.list-input');
  if (!input) { renamingListId = ''; return; }
  const v = input.value.trim();
  const target = state.lists.find((x) => x.id === renamingListId);
  if (v && target) target.name = v;
  renamingListId = '';
  /* 与 done() 同一道幂等闸：移除输入框会触发 blur → done() 再进来一次，
     两次都试图 removeChild同一个节点，第二次必抛 NotFoundError。
     先打标记让 done() 直接返回，DOM 只由这里移除一次。 */
  input.dataset.settled = '1';
  if (input.parentNode) input.parentNode.removeChild(input);
  const box = $('#listSelect');
  if (box) box.hidden = false;
}

/* 删当前列表：列表内任务不删，整体迁入默认列表，toast 明确告知迁了几条。
   两步确认由「右键下拉框菜单」负责（先点「删除此列表」再点「确认删除此列表？」），
   这里只做真正的删除动作 + 前置保护。 */
function deleteCurrentList() {
  if (state.lists.length <= 1) { toast('至少保留一个列表'); return; }
  const l = currentList(state);
  const target = state.lists[0];
  if (l.id === target.id) { toast('默认列表不能删除'); return; }
  const n = state.tasks.filter((t) => t.listId === l.id).length
          + state.history.filter((h) => h.listId === l.id).length;
  settleListRename();
  state.lists = state.lists.filter((x) => x.id !== l.id);
  /* 迁到默认列表的默认列：任务一条不丢 */
  const targetCol = defaultColIdOf(target.id);
  state.tasks.forEach((t) => {
    if (t.listId === l.id) {
      t.listId = target.id;
      if (!columnsOfList(target.id).some((c) => c.id === t.colId)) t.colId = targetCol;
    }
  });
  state.history.forEach((h) => {
    if (h.listId === l.id) {
      h.listId = target.id;
      if (!columnsOfList(target.id).some((c) => c.id === h.colId)) h.colId = targetCol;
    }
  });
  /* 被删列表的滚动位置一并清掉，别留垃圾 */
  if (state.ui.scroll && typeof state.ui.scroll === 'object') delete state.ui.scroll[l.id];
  state.ui.activeListId = target.id;
  saveNow();
  render();
  toast(n ? `已删除列表，${n} 条已移到「${target.name}」` : '已删除列表');
}

/* ---------------- 周制归档（存量兜底） ----------------
   新完成的任务已直接归入历史（见 completeTask），不会再停留在列表里。
   这里的每周归档只作为兜底：启动时扫一遍，把「改制前残留、且 doneAt 早于本周一」的
   已完成任务收进历史，避免老数据一直挂在列表底部。 */

/* 本周一 00:00 的时间戳（周起始为周一） */
function weekStart(ts = Date.now()) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  const wd = (d.getDay() + 6) % 7;      /* 周一=0 … 周日=6 */
  d.setDate(d.getDate() - wd);
  return d.getTime();
}

/* 到下一个周一 00:00 还有多少毫秒 */
function msUntilNextWeek(ts = Date.now()) {
  const next = new Date(weekStart(ts));
  next.setDate(next.getDate() + 7);
  return next.getTime() - ts;
}

/* 把「上周及更早」完成的任务移入历史。返回归档条数。
   全局机制：对所有列表一视同仁地扫一遍，不因为当前在看哪个列表而漏归档或重复归档。
   归档时记下列归属（listId + colId），历史恢复才能回到原来的列表与列。 */
function archiveExpiredDone() {
  const cut = weekStart();
  const keep = [];
  let n = 0;
  /* 从后往前取，保证 history 里按时间倒序 */
  for (let i = state.tasks.length - 1; i >= 0; i--) {
    const t = state.tasks[i];
    if (t.done && t.doneAt && t.doneAt < cut) {
      state.history.unshift({
        id: t.id,
        title: t.title,
        starred: t.starred,
        listId: t.listId,
        colId: t.colId,
        doneAt: t.doneAt,
        fromIndex: i,
        images: (t.images || []).slice(),
        subs: t.subs.map((s) => ({ title: s.title, starred: s.starred, images: (s.images || []).slice() }))
      });
      n++;
    } else {
      keep.unshift(t);
    }
  }
  if (n) state.tasks = keep;
  return n;
}

/* 启动时 + 每跨周一检查一次 */
let weekTimer = 0;
function scheduleWeeklyArchive() {
  clearTimeout(weekTimer);
  const tick = () => {
    const n = archiveExpiredDone();
    if (n) { saveNow(); render(); toast(n ? `${n} 个上周任务已归档` : ''); }
    weekTimer = setTimeout(tick, Math.min(msUntilNextWeek() + 60000, 2147483647));
  };
  tick();
}

/* ---------------- 动作 ---------------- */

/* 新建任务的插入位置：插到"最后一个置顶任务"之后（限同一列内）。
   置顶 = pinned，或开启了星标自动置顶时的 starred（与 toggleTaskStar / pinTask 的置顶口径一致）。
   扫全表找最后一个置顶项，这样即使置顶任务被拖动/恢复到了数组中部，新任务也不会插到它前面。
   全表无置顶任务时返回 0，即与原来的 unshift 行为一致。 */
function insertIndexForNewTask(listId) {
  let last = -1;
  for (let i = state.tasks.length - 1; i >= 0; i--) {
    const t = state.tasks[i];
    if (listId && (t.listId || DEFAULT_LIST_ID) !== listId) continue;
    if (t.pinned || (t.starred && state.ui.autoPinStarred)) { last = i; break; }
  }
  return last + 1;
}

/* 顶部输入框新建：一律进入顶部列表下拉框当前选中的那个列表。
   列已降级为纯数据字段（界面不显示），新任务用该列表的默认列即可。 */
function addMainTask(title) {
  const v = String(title || '').trim();
  if (!v) return;
  const listId = activeListId();
  const colId = defaultColIdOf(listId);
  state.tasks.splice(insertIndexForNewTask(listId), 0, {
    id: uid(), title: v, starred: false, pinned: false, collapsed: false,
    listId: listId,
    colId: colId,
    createdAt: Date.now(), subs: []
  });
  setScroll('tasks', 0);
  saveNow();
  render();
  toast('已添加');
}

function toggleTaskStar(id) {
  const t = findTask(id);
  if (!t) return;
  t.starred = !t.starred;
  if (t.starred && state.ui.autoPinStarred) {
    state.tasks = state.tasks.filter((x) => x.id !== id);
    state.tasks.unshift(t);
  }
  saveNow(); render();
}

function pinTask(id) {
  const t = findTask(id);
  if (!t) return;
  const alreadyPinned = t.pinned;
  t.pinned = !t.pinned;
  if (!alreadyPinned) {
    state.tasks = state.tasks.filter((x) => x.id !== id);
    state.tasks.unshift(t);
    setScroll('tasks', 0);
  }
  saveNow(); render();
}

function foldTask(id) {
  const t = findTask(id);
  if (!t) return;
  t.collapsed = !t.collapsed;
  saveNow(); render();
}

function addSub(taskId) {
  startSubEntry(taskId);
}

/* 开启一条子任务输入；可连续回车连续录入 */
function startSubEntry(taskId) {
  const t = findTask(taskId);
  if (!t) return;
  t.collapsed = false;
  const sub = { id: uid(), title: '', done: false, starred: false, images: [] };
  t.subs.push(sub);
  pendingId = sub.id;
  saveNow();
  render();
  const li = $(`.sub-item[data-id="${sub.id}"]`);
  if (!li) return;
  const title = li.querySelector('.title');
  if (!title) return;
  startEdit(
    title,
    (val) => { const f = findSub(sub.id); if (f) f.sub.title = val; },
    () => startSubEntry(taskId)
  );
}

function toggleSub(taskId, subId) {
  const found = findSub(subId);
  if (!found) return;
  found.sub.done = !found.sub.done;
  saveNow(); render();
}

function toggleSubStar(subId) {
  const found = findSub(subId);
  if (!found) return;
  found.sub.starred = !found.sub.starred;
  saveNow(); render();
}

function deleteSub(subId) {
  const found = findSub(subId);
  if (!found) return;
  (found.sub.images || []).forEach((im) => dropImage(im.id));
  found.task.subs.splice(found.index, 1);
  saveNow(); render();
}

function completeTask(id) {
  const i = state.tasks.findIndex((t) => t.id === id);
  if (i < 0) return;
  const t = state.tasks[i];

  /* 老数据的「本周已完成、还留在列表底部」任务：点击圈圈 = 撤销完成（恢复为进行中）。
     新完成的任务会立即归入历史（见下方），不会停留在列表里，所以这条分支只为兼容存量。 */
  if (t.done) {
    t.done = false;
    t.doneAt = 0;
    saveNow(); render();
    toast('已恢复为进行中');
    return;
  }

  /* 新完成 → 立即归入历史记录（含星标任务），不再留在列表底部。
     撤销请到「历史任务」里点「恢复」。doneAt 记点击完成时刻，用于历史按时间排序。 */
  t.doneAt = Date.now();
  state.history.unshift({
    id: t.id,
    title: t.title,
    starred: t.starred,
    listId: t.listId,
    colId: t.colId,
    doneAt: t.doneAt,
    fromIndex: i,
    images: (t.images || []).slice(),
    subs: t.subs.map((s) => ({ title: s.title, starred: s.starred, images: (s.images || []).slice() }))
  });
  state.tasks.splice(i, 1);
  saveNow(); render();
  toast('已完成 · 已归入历史记录');
}

/* 手动立即归档（用户想现在就收起来时用） */
function archiveNow(id) {
  const i = state.tasks.findIndex((t) => t.id === id);
  if (i < 0) return;
  const t = state.tasks[i];
  state.history.unshift({
    id: t.id,
    title: t.title,
    starred: t.starred,
    listId: t.listId,
    colId: t.colId,
    doneAt: t.doneAt || Date.now(),
    fromIndex: i,
    images: (t.images || []).slice(),
    subs: t.subs.map((s) => ({ title: s.title, starred: s.starred, images: (s.images || []).slice() }))
  });
  state.tasks.splice(i, 1);
  saveNow(); render();
  toast('已归档');
}

/* ---- 删除：内联二次确认（避免原生弹窗导致插件弹层关闭） ---- */

function armDelete(id) {
  clearTimeout(confirmTimer);
  confirmId = id;
  render();
  confirmTimer = setTimeout(() => {
    confirmId = null;
    render();
  }, 4000);
}

function cancelDelete() {
  clearTimeout(confirmTimer);
  confirmId = null;
  render();
}

function doDelete(id) {
  clearTimeout(confirmTimer);
  confirmId = null;
  const i = state.tasks.findIndex((t) => t.id === id);
  if (i < 0) return;
  const [t] = state.tasks.splice(i, 1);
  dropOwnerImages(t);
  saveNow(); render();
  toast(`已删除「${t.title.slice(0, 12)}${t.title.length > 12 ? '…' : ''}」`);
}

function restoreHist(id) {
  const i = state.history.findIndex((h) => h.id === id);
  if (i < 0) return;
  const h = state.history[i];
  /* 恢复到原来的列表与列；列表或列已不存在则回落到默认列表的默认列（任务绝不丢） */
  const listId = state.lists.some((l) => l.id === h.listId) ? h.listId : DEFAULT_LIST_ID;
  const colId = findColumn(h.colId, true) && columnsOfList(listId).some((c) => c.id === h.colId)
    ? h.colId
    : defaultColIdOf(listId);
  const at = Math.max(0, Math.min(h.fromIndex || 0, state.tasks.length));
  state.tasks.splice(at, 0, {
    id: uid(),
    title: h.title,
    starred: h.starred,
    pinned: false,
    collapsed: false,
    listId: listId,
    colId: colId,
    done: false,
    doneAt: 0,
    createdAt: Date.now(),
    images: (h.images || []).map((x) => ({ id: x.id, type: x.type, size: x.size })),
    subs: (h.subs || []).map((s) => ({
      id: uid(), title: s.title, done: false, starred: s.starred,
      images: (s.images || []).map((x) => ({ id: x.id, type: x.type, size: x.size }))
    }))
  });
  state.history.splice(i, 1);
  /* 恢复出来的任务属于哪个列表，就切到哪个列表 —— 否则用户看不到刚恢复的东西 */
  const switched = state.ui.activeListId !== listId;
  state.ui.activeListId = listId;
  state.ui.view = 'tasks';
  saveNow(); render();
  toast(switched ? `已恢复到「${currentList(state).name}」` : '已恢复');
}

function deleteHist(id) {
  const i = state.history.findIndex((h) => h.id === id);
  if (i < 0) return;
  /* 历史条目是永久删除（此前已确认过），图片随之清理 */
  dropOwnerImages(state.history[i]);
  state.history.splice(i, 1);
  saveNow(); render();
}

/* ---------------- 标题内联编辑 ---------------- */

function startEdit(span, commit, onContinue) {
  const li = span.closest('.task-card, .sub-item');
  const input = document.createElement('textarea');   // 多行：支持换行编辑，与新增输入框一致
  input.className = 'edit-input';
  input.rows = 1;
  input.maxLength = 200;
  input.value = span.textContent;
  if (li) li.setAttribute('draggable', 'false');
  span.replaceWith(input);
  input.focus();
  input.select();
  autoGrowInput(input);                               // 已有换行的标题也要撑开

  let finished = false;
  const end = (keep) => {
    if (finished) return;
    finished = true;
    pendingId = null;
    const val = input.value.trim();
    if (li) li.setAttribute('draggable', 'true');
    if (keep && val) commit(val);
    saveNow();
    render();
    /* 连续录入：本次有内容 → 立刻开下一条空输入，焦点保持 */
    if (keep && val && typeof onContinue === 'function') onContinue();
  };

  input.addEventListener('input', () => autoGrowInput(input));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (e.isComposing) return;          // 中文/日文等输入法组合输入中选词，不提交
      if (e.shiftKey) return;             // Shift+Enter 换行，不提交
      e.preventDefault();
      if (!input.value.trim()) end(false);   // 空内容回车 = 结束录入
      else end(true);                        // 有内容回车 = 提交并继续
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); end(false); }
    else e.stopPropagation();
  });
  input.addEventListener('blur', () => end(true));
  input.addEventListener('dragover', (e) => e.preventDefault());
  input.addEventListener('paste', (e) => {
    const files = imageFilesFrom(e.clipboardData);
    if (!files.length) return;              // 纯文本粘贴交给 textarea 自己处理
    e.preventDefault();
    const val = input.value.trim();
    const owner = li && li.classList.contains('sub-item')
      ? (findSub(li.getAttribute('data-id')) || {}).sub
      : (li ? findTask(li.getAttribute('data-id')) : null);
    /* 图片会触发重渲染，先把正在编辑的标题落定，避免输入丢失 */
    finished = true;
    pendingId = null;
    if (li) li.setAttribute('draggable', 'true');
    if (val && commit) commit(val);
    if (!owner) { saveNow(); render(); return; }
    attachImages(owner, files).then((n) => {
      saveNow();
      render();
      toast(n ? `已添加 ${n} 张图片` : '图片添加失败');
    });
  });
}

/* ---------------- 事件绑定 ---------------- */

const board = $('#board');

board.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const act = btn.getAttribute('data-act');

  const card = btn.closest('.task-card');
  const sub = btn.closest('.sub-item');
  const taskId = (sub ? sub.getAttribute('data-task') : null) || (card ? card.getAttribute('data-id') : null);
  const subId = sub ? sub.getAttribute('data-id') : null;

  switch (act) {
    case 'toggle-task':  completeTask(taskId); break;
    case 'archive-now':  archiveNow(taskId); break;
    case 'star-task':    toggleTaskStar(taskId); break;
    case 'pin-task':     pinTask(taskId); break;
    case 'fold-task':    foldTask(taskId); break;
    case 'add-sub':      addSub(taskId); break;
    case 'del-task':     armDelete(taskId); break;
    case 'confirm-del':  doDelete(taskId); break;
    case 'cancel-del':   cancelDelete(); break;
    case 'toggle-sub':   toggleSub(taskId, subId); break;
    case 'star-sub':     toggleSubStar(subId); break;
    case 'del-sub':      deleteSub(subId); break;
    case 'add-img': {
      const owner = ownerFromEvent(btn);
      if (owner) { pickTarget = owner; filePicker.click(); }
      break;
    }
    case 'del-img': {
      const owner = ownerFromEvent(btn);
      if (owner) removeImage(owner, btn.getAttribute('data-img'));
      break;
    }
    default: break;
  }
});

board.addEventListener('dblclick', (e) => {
  if (e.target.closest('a')) return;          // 点在链接上不进入编辑
  const title = e.target.closest('.title');
  if (!title) return;
  const sub = title.closest('.sub-item');
  if (sub) {
    const found = findSub(sub.getAttribute('data-id'));
    if (found) startEdit(title, (val) => { found.sub.title = val; });
    return;
  }
  const card = title.closest('.task-card');
  if (!card) return;
  const t = findTask(card.getAttribute('data-id'));
  if (t) startEdit(title, (val) => { t.title = val; });
});

/* 标题区域不启动拖拽，保证双击编辑稳定 */
board.addEventListener('mousedown', (e) => {
  const li = e.target.closest('.task-card, .sub-item');
  if (!li) return;
  const onTitle = e.target.closest('.title, .meta, .edit-input');
  li.setAttribute('draggable', onTitle ? 'false' : 'true');
});
document.addEventListener('mouseup', () => {
  $$('.task-card, .sub-item').forEach((li) => {
    if (!li.querySelector('.edit-input')) li.setAttribute('draggable', 'true');
  });
});

/* ---------- 任务卡右键：移动到其他列表 ---------- */
viewport.addEventListener('contextmenu', (e) => {
  if (state.ui.view === 'history') return;
  const card = e.target.closest ? e.target.closest('.task-card') : null;
  if (!card) { closeMoveMenu(); return; }
  e.preventDefault();
  openMoveMenu(card.getAttribute('data-id'), e.clientX, e.clientY);
});
/* 点别处 / Escape / 滚动 都收起菜单（任务移动菜单 + 列表管理菜单一并关） */
document.addEventListener('click', () => { closeMoveMenu(); closeListMenu(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMoveMenu(); closeListMenu(); } });
viewport.addEventListener('scroll', () => { closeMoveMenu(); closeListMenu(); }, { passive: true });

/* 历史列表 */
$('#histList').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const id = btn.closest('.hist-card').getAttribute('data-id');
  if (btn.getAttribute('data-act') === 'restore') restoreHist(id);
  else deleteHist(id);
});

/* 顶栏 */
$('#btnHistory').addEventListener('click', () => {
  state.ui.view = 'history';
  saveNow(); render();
});
$('#btnBack').addEventListener('click', () => {
  state.ui.view = 'tasks';
  saveNow(); render();
});

let clearArmed = false;
let clearTimer = 0;
const btnClear = $('#btnClearHistory');
btnClear.addEventListener('click', () => {
  /* 历史视图只显示当前列表，所以「清空」也只清当前列表的（口径一致，不误伤别的列表） */
  const mine = histOfActiveList();
  const listName = currentList(state).name;
  if (!mine.length) { toast('历史为空'); return; }
  if (!clearArmed) {
    clearArmed = true;
    btnClear.textContent = '确认清空';
    btnClear.classList.add('danger');
    clearTimeout(clearTimer);
    clearTimer = setTimeout(() => {
      clearArmed = false;
      btnClear.textContent = '清空';
      btnClear.classList.remove('danger');
    }, 3500);
    return;
  }
  clearTimeout(clearTimer);
  clearArmed = false;
  btnClear.textContent = '清空';
  btnClear.classList.remove('danger');
  const drop = new Set(mine.map((h) => h.id));
  state.history = state.history.filter((h) => !drop.has(h.id));
  saveNow(); render();
  toast(`已清空「${listName}」${drop.size} 条历史`);
});

/* 新建任务 */
const newTaskInput = $('#newTask');
newTaskInput.addEventListener('paste', onPasteIntoNewInput);
/* 多行 textarea 自动增高：输入/清空时撑开高度，到 CSS max-height(132px) 后内部滚动 */
function autoGrowInput(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 132) + 'px';
}
newTaskInput.addEventListener('input', () => autoGrowInput(newTaskInput));
autoGrowInput(newTaskInput);
document.addEventListener('paste', onPasteOutsideEditor);
newTaskInput.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  if (e.isComposing) return;        // 中文/日文等输入法组合输入中选词，不提交
  if (e.shiftKey) return;           // Shift+Enter 让 textarea 换行，不提交
  e.preventDefault();
  const v = newTaskInput.value;
  if (!v.trim()) return;
  newTaskInput.value = '';
  autoGrowInput(newTaskInput);      // 清空后复位高度
  addMainTask(v);
  newTaskInput.focus();
});
$('#btnAdd').addEventListener('click', () => {
  const v = newTaskInput.value;
  if (!v.trim()) { newTaskInput.focus(); return; }
  newTaskInput.value = '';
  autoGrowInput(newTaskInput);
  addMainTask(v);
  newTaskInput.focus();
});

/* 列表切换（顶栏下拉）+ 列表增/改/删。
   列表在看板之上：下拉决定「看哪套看板」，列下拉决定「新任务进哪一列」，两件事互不混淆。 */
const listSelect = $('#listSelect');
listSelect.addEventListener('change', (e) => {
  switchList(e.target.value);
});
$('#btnAddList').addEventListener('click', (e) => {
  e.stopPropagation();
  addList();
});
/* 列表管理（重命名 / 删除）收进「右键下拉框」菜单，避免删除按钮误触、保持主界面简洁。
   改名时下拉被输入框替换，不打断；改名中也不弹菜单。 */
const listbarEl = $('#listbar');
listbarEl.addEventListener('contextmenu', (e) => {
  if (document.querySelector('.list-input')) return;
  e.preventDefault();
  openListMenu(e.clientX, e.clientY);
});

/* ---------- 跨列表移动：任务卡右键菜单 ---------- */

function moveTaskToList(taskId, listId) {
  const t = findTask(taskId);
  if (!t) return;
  const target = state.lists.find((l) => l.id === listId);
  if (!target || t.listId === listId) return;
  /* 只改listId，done/doneAt/starred/pinned/collapsed/subs/images 全部原样保留 */
  t.listId = listId;
  /* 换列表后colId 必须指向目标列表里真实存在的列，否则任务会落进不可见状态。
     老数据的任务都在默认列，所以直接用目标列表的默认列。 */
  t.colId = defaultColIdOf(listId);
  /* 移动成功后必须自己收起菜单。不能依赖调用方先关：
     换列表会render()，若菜单还挂在 DOM 上，它会飘在别处或留在旧位置。 */
  closeMoveMenu();
  saveNow();
  render();
  toast(`已移到「${target.name}」`);
}

function closeMoveMenu() {
  if (!moveMenuEl) return;
  moveMenuEl.remove();
  moveMenuEl = null;
}

function openMoveMenu(taskId, x, y) {
  closeMoveMenu();
  if (state.lists.length < 2) { toast('只有一个列表，先新建一个'); return; }
  const cur = (findTask(taskId) || {}).listId;
  const items = state.lists.map((l) => {
    const on = l.id === cur;
    return `<li><button type="button" data-move-list="${esc(l.id)}"${on ? ' disabled' : ''}>
      <span class="move-name">${esc(l.name)}</span>
      ${on ? '<span class="move-cur">当前</span>' : ''}
    </button></li>`;
  }).join('');

  moveMenuEl = document.createElement('div');
  moveMenuEl.className = 'move-menu';
  moveMenuEl.setAttribute('role', 'menu');
  moveMenuEl.innerHTML = `<p class="move-title">移动到列表</p><ul>${items}</ul>`;
  document.body.appendChild(moveMenuEl);

  /* 贴近点击处，且不超出 popup 边界（popup 最大 800×600） */
  const pad = 8;
  const r = moveMenuEl.getBoundingClientRect();
  const maxX = window.innerWidth - r.width - pad;
  const maxY = window.innerHeight - r.height - pad;
  moveMenuEl.style.left = Math.max(pad, Math.min(x, maxX)) + 'px';
  moveMenuEl.style.top = Math.max(pad, Math.min(y, maxY)) + 'px';

  moveMenuEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-move-list]');
    if (!btn) return;
    e.stopPropagation();
    const to = btn.getAttribute('data-move-list');
    closeMoveMenu();
    moveTaskToList(taskId, to);
  });
}

/* ---------- 列表管理：右键下拉框菜单 ----------
   重命名 / 删除入口收进这里，主界面不再常驻按钮（避免删除误触、保持简洁）。
   删除走两步确认：第一次点「删除此列表」变成「确认删除此列表？」，再点一次才真删。 */
let listMenuEl = null;
function closeListMenu() {
  if (!listMenuEl) return;
  listMenuEl.remove();
  listMenuEl = null;
}
function openListMenu(x, y) {
  closeListMenu();
  const onlyOne = state.lists.length <= 1;
  const isDefault = currentList(state).id === state.lists[0].id;
  const renItem = `<li><button type="button" data-list-act="rename">重命名列表</button></li>`;
  const delDisabled = onlyOne || isDefault;
  const delLabel = delDisabled ? (onlyOne ? '至少保留一个列表' : '默认列表不能删除') : '删除此列表';
  const delItem = `<li><button type="button" data-list-act="delete"${delDisabled ? ' disabled' : ''}>${delLabel}</button></li>`;
  listMenuEl = document.createElement('div');
  listMenuEl.className = 'move-menu';
  listMenuEl.setAttribute('role', 'menu');
  listMenuEl.innerHTML = `<ul>${renItem}${delItem}</ul>`;
  document.body.appendChild(listMenuEl);

  /* 贴近点击处，且不超出 popup 边界（popup 最大 800×600） */
  const pad = 8;
  const r = listMenuEl.getBoundingClientRect();
  const maxX = window.innerWidth - r.width - pad;
  const maxY = window.innerHeight - r.height - pad;
  listMenuEl.style.left = Math.max(pad, Math.min(x, maxX)) + 'px';
  listMenuEl.style.top = Math.max(pad, Math.min(y, maxY)) + 'px';

  let armed = false, timer = 0;
  listMenuEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-list-act]');
    if (!btn || btn.disabled) return;
    e.stopPropagation();
    const act = btn.getAttribute('data-list-act');
    if (act === 'rename') { closeListMenu(); startListRename(); return; }
    if (act === 'delete') {
      if (!armed) {
        armed = true;
        clearTimeout(timer);
        btn.classList.add('danger');
        btn.textContent = '确认删除此列表？';
        timer = setTimeout(() => closeListMenu(), 3200);
        return;
      }
      clearTimeout(timer);
      closeListMenu();
      deleteCurrentList();
    }
  });
}

/* 设置面板 */
const sheet = $('#sheet');
const btnSettings = $('#btnSettings');
const swAutoPin = $('#swAutoPin');

function syncSwitch() {
  swAutoPin.setAttribute('aria-checked', state.ui.autoPinStarred ? 'true' : 'false');
}
function closeSheet() {
  sheet.hidden = true;
  btnSettings.setAttribute('aria-expanded', 'false');
}
btnSettings.addEventListener('click', (e) => {
  e.stopPropagation();
  sheet.hidden = !sheet.hidden;
  btnSettings.setAttribute('aria-expanded', sheet.hidden ? 'false' : 'true');
});
// 使用说明：默认收起，点按钮展开/收起
const btnHint = $('#btnHint');
const sheetHint = $('#sheetHint');
btnHint.addEventListener('click', (e) => {
  e.stopPropagation();
  const show = sheetHint.hidden;
  sheetHint.hidden = !show;
  btnHint.setAttribute('aria-expanded', show ? 'true' : 'false');
});
sheet.addEventListener('click', (e) => e.stopPropagation());
document.addEventListener('click', () => { if (!sheet.hidden) closeSheet(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !sheet.hidden) closeSheet();
});
swAutoPin.addEventListener('click', (e) => {
  e.stopPropagation();
  state.ui.autoPinStarred = !state.ui.autoPinStarred;
  syncSwitch();
  saveNow();
});

/* ---------- 主题三档：跟随系统 / 强制浅色 / 强制夜间 ---------- */
const themeBtns = $$('[data-theme]');
const darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

/* auto 档在这里被解析成具体的 light / dark 写到 html[data-theme] 上，
   CSS 只认 data-theme（不再用媒体查询写深色变量），否则系统为深色时
   强制浅色会被媒体查询盖回去。系统主题在auto 档下变化时也要跟着变。 */
function resolveTheme() {
  const cur = state.ui.theme || 'auto';
  return cur === 'auto' ? (darkQuery && darkQuery.matches ? 'dark' : 'light') : cur;
}
function syncTheme() {
  const cur = state.ui.theme || 'auto';
  themeBtns.forEach((b) => {
    const on = b.getAttribute('data-theme') === cur;
    b.classList.toggle('on', on);
    b.setAttribute('aria-checked', on ? 'true' : 'false');
  });
  const eff = resolveTheme();
  document.documentElement.setAttribute('data-theme', eff);
  /* 告诉浏览器表单控件、滚动条等原生部件用哪套配色 */
  document.documentElement.style.colorScheme = eff;
}
themeBtns.forEach((b) => {
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    const v = b.getAttribute('data-theme');
    if (v !== 'auto' && v !== 'light' && v !== 'dark') return;
    state.ui.theme = v;
    syncTheme();
    saveNow();
  });
});
/* 跟随系统档下，系统日夜切换要实时生效（用户没手动锁档时不该要求重开popup） */
if (darkQuery) {
  const onSystemChange = () => { if ((state.ui.theme || 'auto') === 'auto') syncTheme(); };
  if (darkQuery.addEventListener) darkQuery.addEventListener('change', onSystemChange);
  else if (darkQuery.addListener) darkQuery.addListener(onSystemChange);
}

/* 导出 */
$('#btnExportFile').addEventListener('click', (e) => {
  e.stopPropagation();
  downloadMarkdown();
});
$('#btnExportCopy').addEventListener('click', (e) => {
  e.stopPropagation();
  copyMarkdown();
});

/* 存储提示条：可手动收起 */
$('#storageWarnClose').addEventListener('click', (e) => {
  e.stopPropagation();
  storeWarnDismissed = true;
  $('#storageWarn').hidden = true;
});

/* 清空全部数据（内联二次确认） */
let wipeArmed = false;
let wipeTimer = 0;
const btnWipe = $('#btnWipe');
btnWipe.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!wipeArmed) {
    if (!state.tasks.length && !state.history.length) { toast('没有可清空的数据'); return; }
    wipeArmed = true;
    btnWipe.textContent = '再点一次确认清空';
    btnWipe.classList.add('armed');
    clearTimeout(wipeTimer);
    wipeTimer = setTimeout(() => {
      wipeArmed = false;
      btnWipe.textContent = '清空全部数据';
      btnWipe.classList.remove('armed');
    }, 3500);
    return;
  }
  clearTimeout(wipeTimer);
  wipeArmed = false;
  btnWipe.textContent = '清空全部数据';
  btnWipe.classList.remove('armed');
  state.tasks.concat(state.history).forEach(dropOwnerImages);
  state = bindListScope(defaults());
  saveNow();
  render();
  toast('已清空全部数据');
});

/* ---------------- Markdown 导出 ---------------- */

const pad2 = (n) => String(n).padStart(2, '0');
const dateStamp = (d = new Date()) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const minuteStamp = (d = new Date()) =>
  `${dateStamp(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

function buildMarkdown(options) {
  const opt = Object.assign({ active: true, done: true }, options || {});
  const lines = [];
  /* 导出只含当前列表 —— 顶栏数字怎么统计，导出就怎么统计，口径一致 */
  const mine = tasksOfActiveList();
  const myHist = histOfActiveList();
  const doing = mine.filter((t) => !t.done);
  const doneThisWeek = mine.filter((t) => t.done);
  const listName = currentList(state).name;
  lines.push(`# 待办 · ${listName}`);
  lines.push('');
  lines.push(`> 导出时间：${minuteStamp()} · 列表「${listName}」 · 进行中 ${doing.length} · 本周完成 ${doneThisWeek.length} · 已归档 ${myHist.length}`);
  lines.push('');

  const item = (title, checked, starred, indent = '') =>
    `${indent}- [${checked ? 'x' : ' '}] ${starred ? '★ ' : ''}${title}`;

  let wrote = false;

  /* 按列输出，每列一节 */
  state.columns.forEach((col) => {
    const inCol = mine.filter((t) => t.colId === col.id && !t.done);
    if (!inCol.length) return;
    lines.push(`## ${col.name}`);
    lines.push('');
    inCol.forEach((t) => {
      if (!t.title.trim()) return;
      lines.push(item(t.title, false, t.starred));
      t.subs.forEach((s) => { if (s.title.trim()) lines.push(item(s.title, s.done, s.starred, '  ')); });
    });
    lines.push('');
    wrote = true;
  });

  /* 本周已完成（下周一将自动归档） */
  if (doneThisWeek.length) {
    lines.push('## 本周已完成');
    lines.push('');
    doneThisWeek.forEach((t) => {
      if (!t.title.trim()) return;
      lines.push(item(t.title, true, t.starred));
      t.subs.forEach((s) => { if (s.title.trim()) lines.push(item(s.title, s.done, s.starred, '  ')); });
    });
    lines.push('');
    wrote = true;
  }

  if (opt.done && myHist.length) {
    lines.push('## 已归档');
    lines.push('');
    myHist.forEach((h) => {
      if (!h.title.trim()) return;
      lines.push(item(h.title, true, h.starred));
      (h.subs || []).forEach((s) => { if (s.title.trim()) lines.push(item(s.title, true, s.starred, '  ')); });
    });
    lines.push('');
    wrote = true;
  }

  if (!wrote) lines.push('_（暂无任务）_', '');

  /* 去掉尾随空行，保留单个换行结尾 */
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  return lines.join('\n') + '\n';
}

/* 含图片的完整版：本地图片以 base64 内嵌，导出的 .md 可独立查看 */
async function buildMarkdownFull() {
  const lines = [];
  /* 与 buildMarkdown 同口径：只导出当前列表 */
  const mine = tasksOfActiveList();
  const myHist = histOfActiveList();
  const doing = mine.filter((t) => !t.done);
  const doneThisWeek = mine.filter((t) => t.done);
  const listName = currentList(state).name;
  lines.push(`# 待办 · ${listName}`);
  lines.push('');
  lines.push(`> 导出时间：${minuteStamp()} · 列表「${listName}」 · 进行中 ${doing.length} · 本周完成 ${doneThisWeek.length} · 已归档 ${myHist.length}`);
  lines.push('');

  const alt = (t) => String(t || '图片').replace(/[[\]]/g, '').slice(0, 40);
  const item = (title, checked, starred, indent = '') =>
    `${indent}- [${checked ? 'x' : ' '}] ${starred ? '★ ' : ''}${title}`;
  const imageLines = async (owner, indent) => {
    for (const im of (owner.images || [])) {
      const url = await ImageStore.dataURL(im.id);
      if (url) lines.push(`${indent}![${alt(owner.title)}](${url})`);
    }
  };
  const dumpTasks = async (list, checked) => {
    for (const t of list) {
      if (!t.title.trim()) continue;
      lines.push(item(t.title, checked, t.starred));
      await imageLines(t, '  ');
      for (const s of t.subs) {
        if (!s.title.trim()) continue;
        lines.push(item(s.title, checked ? true : s.done, s.starred, '  '));
        await imageLines(s, '    ');
      }
    }
  };

  let wrote = false;

  for (const col of state.columns) {
    const inCol = mine.filter((t) => t.colId === col.id && !t.done);
    if (!inCol.length) continue;
    lines.push(`## ${col.name}`);
    lines.push('');
    await dumpTasks(inCol, false);
    lines.push('');
    wrote = true;
  }

  if (doneThisWeek.length) {
    lines.push('## 本周已完成');
    lines.push('');
    await dumpTasks(doneThisWeek, true);
    lines.push('');
    wrote = true;
  }

  if (myHist.length) {
    lines.push('## 已归档');
    lines.push('');
    for (const h of myHist) {
      if (!h.title.trim()) continue;
      lines.push(item(h.title, true, h.starred));
      await imageLines(h, '  ');
      for (const s of (h.subs || [])) {
        if (!s.title.trim()) continue;
        lines.push(item(s.title, true, s.starred, '  '));
        await imageLines(s, '    ');
      }
    }
    lines.push('');
    wrote = true;
  }

  if (!wrote) lines.push('_（暂无任务）_', '');
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  return lines.join('\n') + '\n';
}

const hasDownloads = () => typeof chrome !== 'undefined' && !!chrome.downloads && !!chrome.downloads.download;

function downloadMarkdown() {
  return buildMarkdownFull().then((text) => {
    const name = `待办清单-${dateStamp()}.md`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    /* 插件环境优先走 chrome.downloads —— popup 一关闭就会中断 a[download] */
    if (hasDownloads()) {
      chrome.downloads.download({ url, filename: name, saveAs: false }, () => {
        const err = chrome.runtime && chrome.runtime.lastError;
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        toast(err ? '导出失败：' + err.message : '已导出 ' + name);
      });
      return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('已导出 ' + name);
  }).catch(() => toast('导出失败'));
}

function copyMarkdown() {
  return buildMarkdownFull().then((text) => {
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      let done = false;
      try { done = document.execCommand('copy'); } catch (e) { done = false; }
      ta.remove();
      toast(done ? 'Markdown 已复制' : '复制失败，请改用下载');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => toast('Markdown 已复制'))
        .catch(fallback);
    } else {
      fallback();
    }
  }).catch(() => toast('导出失败'));
}

/* 滚动位置记忆：按「列表 + 视图」各存一份，切列表不会串 */
viewport.addEventListener('scroll', () => {
  setScroll(state.ui.view, viewport.scrollTop);
  save();
}, { passive: true });

/* ---------------- 拖拽 ---------------- */

function getLine() {
  if (!dropLine) {
    dropLine = document.createElement('li');
    dropLine.className = 'drop-line';
    dropLine.setAttribute('aria-hidden', 'true');
  }
  return dropLine;
}
function removeLine() {
  if (dropLine && dropLine.parentElement) dropLine.parentElement.removeChild(dropLine);
}
function placeLine(container, after) {
  const line = getLine();
  if (after) {
    if (line.parentElement !== container || line.nextElementSibling !== after) {
      container.insertBefore(line, after);
    }
  } else if (line.parentElement !== container || line !== container.lastElementChild) {
    container.appendChild(line);
  }
}
function getAfter(container, y, sel) {
  const els = $$(sel, container).filter((el) => !el.classList.contains('dragging'));
  let best = null;
  let bestOffset = -Infinity;
  for (const el of els) {
    const box = el.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > bestOffset) { bestOffset = offset; best = el; }
  }
  return best;
}
function countBefore(line, parent, sel) {
  let n = 0;
  for (const ch of Array.prototype.slice.call(parent.children)) {
    if (ch === line) break;
    if (ch.matches && ch.matches(sel) && !ch.classList.contains('dragging')) n++;
  }
  return n;
}

function endDrag() {
  removeLine();
  dropTarget = null;
  document.body.classList.remove('is-dragging', 'drag-sub');
  if (drag && drag.el) drag.el.classList.remove('dragging');
  drag = null;
}

viewport.addEventListener('dragstart', (e) => {
  if (state.ui.view === 'history') return;
  const target = e.target;
  if (!target || !target.closest) return;
  if (target.tagName === 'INPUT') { drag = null; return; }

  const sub = target.closest('.sub-item');
  const card = target.closest('.task-card');
  if (sub && sub.getAttribute('draggable') === 'true') {
    const taskId = sub.closest('.task-card').getAttribute('data-id');
    sub.setAttribute('data-task', taskId);
    drag = { kind: 'sub', id: sub.getAttribute('data-id'), el: sub };
  } else if (card) {
    drag = { kind: 'task', id: card.getAttribute('data-id'), el: card };
  } else {
    drag = null;
    return;
  }
  e.dataTransfer.effectAllowed = 'move';
  try { e.dataTransfer.setData('text/plain', drag.id); } catch (err) { /* noop */ }
  try { e.dataTransfer.setDragImage(drag.el, 24, 14); } catch (err) { /* noop */ }
  document.body.classList.add('is-dragging');
  if (drag.kind === 'sub') document.body.classList.add('drag-sub');
  setTimeout(() => { if (drag && drag.el) drag.el.classList.add('dragging'); }, 0);
});

viewport.addEventListener('dragover', (e) => {
  if (!drag) return;
  e.preventDefault();
  try { e.dataTransfer.dropEffect = 'move'; } catch (err) { /* noop */ }

  if (drag.kind === 'task') {
    /* 列已下线，任务直接拖在 #board 这一个平铺容器里排序 */
    const body = $('#board');
    if (body) placeLine(body, getAfter(body, e.clientY, '.task-card'));
    return;
  }

  let card = e.target && e.target.closest ? e.target.closest('.task-card') : null;
  if (!card) {
    let best = null;
    let bestDist = Infinity;
    $$('.task-card').forEach((c) => {
      const r = c.getBoundingClientRect();
      const d = e.clientY < r.top ? r.top - e.clientY : (e.clientY > r.bottom ? e.clientY - r.bottom : 0);
      if (d < bestDist) { bestDist = d; best = c; }
    });
    if (bestDist > 48) return;
    card = best;
  }
  if (!card) return;
  const subs = card.querySelector('.subs');
  if (!subs) return;
  placeLine(subs, getAfter(subs, e.clientY, '.sub-item'));
});

viewport.addEventListener('drop', (e) => {
  if (!drag) return;
  e.preventDefault();
  applyDrop();
});
viewport.addEventListener('dragend', () => endDrag());
viewport.addEventListener('dragleave', (e) => {
  if (!viewport.contains(e.relatedTarget)) removeLine();
});

function applyDrop() {
  if (!drag) return;

  const line = dropLine;
  const parent = line && line.parentElement;
  const fallback = dropTarget && dropTarget.parentElement ? dropTarget : null;
  if (!parent && !fallback) { endDrag(); return; }
  const host = parent || fallback;

  if (drag.kind === 'task') {
    const item = findTask(drag.id);
    if (!item) { endDrag(); return; }
    const listId = activeListId();
    const beforeId = line ? beforeCardIdIn(host, line) : null;

    /* 插入点必须在「移除自己之前」算好。
       否则 findIndex 的下标是移除后的数组下标，源卡片会原位插回（表现为拖了没动）。 */
    const raw = insertIndexWithinList(listId, beforeId);
    const selfIdx = state.tasks.findIndex((t) => t.id === drag.id);
    state.tasks = state.tasks.filter((t) => t.id !== drag.id);
    item.listId = listId;
    item.colId = defaultColIdOf(listId);
    /* 若锚点在源卡片之后，移除会让下标前移一位，这里补回来 */
    let at = raw;
    if (selfIdx > -1 && selfIdx < raw) at = raw - 1;
    at = Math.max(0, Math.min(at, state.tasks.length));
    state.tasks.splice(at, 0, item);
  } else {
    if (!parent) { endDrag(); return; }
    const idx = countBefore(line, parent, '.sub-item');
    const cardEl = line.closest('.task-card');
    const targetId = cardEl ? cardEl.getAttribute('data-id') : null;
    if (targetId) {
      let moved = null;
      for (const t of state.tasks) {
        const i = t.subs.findIndex((s) => s.id === drag.id);
        if (i > -1) { moved = t.subs.splice(i, 1)[0]; break; }
      }
      if (moved) {
        const target = findTask(targetId);
        target.subs.splice(Math.max(0, Math.min(idx, target.subs.length)), 0, moved);
        target.collapsed = false;
      }
    }
  }
  saveNow();
  endDrag();
  render();
}

/* 插入点锚点：插入线「后面」第一张任务卡的 id（语义是「插到它之前」）。
   必须向后看，不能向前看：
     插线在头部 → 下一张是首卡 → 插到最前 ✅
     插线在 A、B 之间 → 下一张是 B → 插到 A 之后 ✅
     插线在末尾 → 没有下一张 → null → insertIndexWithinColumn 落到列末尾 ✅
   向前看会把位置算高一格（拖到末尾却插进倒数第二）。 */
function beforeCardIdIn(hostEl, line) {
  let next = line.nextElementSibling;
  while (next && !next.classList.contains('task-card')) next = next.nextElementSibling;
  return next ? next.getAttribute('data-id') : null;
}

/* 全局数组中，某张卡之后的插入位置 */
function globalIndexAfter(id) {
  const i = state.tasks.findIndex((t) => t.id === id);
  return i > -1 ? i + 1 : state.tasks.length;
}

/* 在 listId 这个列表里，插到 beforeId 之前（beforeId 为 null 则插到该列表末尾）。
   直接用锚点卡在全局数组里的下标插入，不用「显示顺序第 N 位」换算 ——
   因为显示顺序会被 rank()（置顶/完成）重排，换算会把任务插到置顶区里去。 */
function insertIndexWithinList(listId, beforeId) {
  if (beforeId) {
    const gi = state.tasks.findIndex((t) => t.id === beforeId);
    if (gi > -1) return gi;
  }
  /* 无锚点或锚点已消失 → 落到该列表末尾 */
  const inList = tasksOfList(listId);
  if (inList.length) return globalIndexAfter(inList[inList.length - 1].id);
  return state.tasks.length;
}

/* ---------------- 启动 ---------------- */

function init() {
  /* 作为插件 popup 打开时标记 embedded，让 CSS 铺满弹窗（不靠视口尺寸猜） */
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      document.documentElement.classList.add('embedded');
    }
  } catch (e) { /* noop */ }
  ImageStore.init(files);
  load();
  syncSwitch();
  syncTheme();
  scheduleWeeklyArchive();
  render();
  updateStoreUI();
  try { newTaskInput.focus(); } catch (e) { /* noop */ }
}

init();

}
