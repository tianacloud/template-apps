import { createTianaFetch } from '@tianacloud/serverless';
const sheet = document.createElement('link'); sheet.rel='stylesheet'; sheet.href=new URL('./app.css',import.meta.url).href; document.head.appendChild(sheet);
import './style.css';
document.querySelector('#app').innerHTML = "\n<div class=\"app\">\n\n  <header>\n    <!-- 手机上的主线抽屉开关：桌面隐藏（侧栏本来就常驻） -->\n    <button class=\"tool\" id=\"btnDrawer\" title=\"主线列表\" aria-label=\"打开主线列表\" aria-expanded=\"false\">☰</button>\n    <div class=\"logo\"><span class=\"dot\"></span>任务线</div>\n    <div class=\"view-switch\">\n      <button id=\"btnMapView\" class=\"on\">🗺 思维导图</button>\n      <button id=\"btnListView\">☰ 列表</button>\n      <button id=\"btnCalView\">📅 日历</button>\n    </div>\n    <button class=\"tool primary\" id=\"btnAddLineTop\">＋ 新建主线</button>\n    <button class=\"tool\" id=\"btnAuth\">☁️ 登录同步</button>\n    <button class=\"tool\" id=\"btnTheme\" title=\"切换深色 / 浅色模式\">🌙</button>\n    <button class=\"tool\" id=\"btnScheme\" title=\"选择配色方案\" aria-haspopup=\"true\" aria-expanded=\"false\">🎨</button>\n    <div class=\"sync-badge\">\n      <span class=\"led\" id=\"syncLed\"></span><span id=\"syncText\">本机存储 · 未登录云端</span>\n    </div>\n    <!-- 配色选择面板 -->\n    <div class=\"scheme-pop\" id=\"schemePop\" hidden>\n      <div class=\"scheme-pop-head\">配色方案</div>\n      <div class=\"scheme-list\" id=\"schemeList\"></div>\n      <div class=\"scheme-pop-foot\">配色与深浅模式可自由组合，共 10 种效果</div>\n    </div>\n    <button class=\"tool\" id=\"btnExport\">📤 导出</button>\n    <button class=\"tool\" id=\"btnImport\">📥 导入</button>\n    <!-- 手机上的「⋯ 更多」：把导出/导入收进来，顶栏少一行 -->\n    <button class=\"tool\" id=\"btnMore\" title=\"更多\" aria-haspopup=\"true\" aria-expanded=\"false\">⋯</button>\n    <div class=\"tool-more-pop\" id=\"morePop\" hidden>\n      <button id=\"btnMoreTheme\"><i>🌙</i>深色 / 浅色</button>\n      <button id=\"btnMoreScheme\"><i>🎨</i>配色方案</button>\n      <button id=\"btnMoreExport\"><i>📤</i>导出数据</button>\n      <button id=\"btnMoreImport\"><i>📥</i>导入数据</button>\n    </div>\n  </header>\n  <!-- 手机侧栏抽屉的遮罩：点空白处收起 -->\n  <div id=\"drawerMask\"></div>\n\n  <!-- ============ 思维导图视图（默认） ============ -->\n  <div id=\"mapView\">\n    <svg id=\"mapSvg\">\n      <g id=\"world\"></g>\n    </svg>\n    <!-- 今日处理：固定右侧面板（拖动任务进来，状态与任务线同步） -->\n    <div id=\"todayPanel\">\n      <div class=\"tp-head\"><span>☀</span><span class=\"tp-label\">今日处理</span> <span class=\"tp-count\" id=\"tpCount\">0</span></div>\n      <div class=\"tp-hint\" id=\"tpHint\">把思维导图上的任务<b>拖到</b>这里<br>专注处理今天的事<br>状态与任务线实时同步</div>\n      <div class=\"tp-list\" id=\"tpList\"></div>\n      <button class=\"tp-clear\" id=\"tpClear\" style=\"display:none\">🧹 清除已完成</button>\n    </div>\n    <div class=\"map-tools\">\n      <button id=\"zoomIn\" title=\"放大\">＋</button>\n      <button id=\"zoomOut\" title=\"缩小\">－</button>\n      <button id=\"zoomFit\" title=\"适应屏幕\">⤢</button>\n    </div>\n    <button id=\"btnMapLayout\" class=\"map-layout-btn\" title=\"切换思维导图的显示方式\">✳ 四周发散</button>\n    <div class=\"map-legend\" id=\"mapLegend\">\n      <button class=\"map-legend-head\" id=\"mapLegendHead\" aria-expanded=\"false\" title=\"展开 / 收起操作说明\">\n        <span>💡</span><span class=\"lg-title\">操作说明</span><span class=\"lg-arrow\">▼</span>\n      </button>\n      <div class=\"map-legend-body\">\n        单击任务 = 标记完成 / 取消<br>\n        双击任务 = 编辑（日期 · 单人/多人）<br>\n        ＋ 卡片右下角 = 新建子任务（任意层级，上限 50 层）<br>\n        ⊕ 卡片边缘圆点 = 折叠 / 展开子任务<br>\n        ♾ 紫色卡片 = 长期任务（每天首次打开自动进入今日处理）<br>\n        ✕ 悬停节点 = 删除 · ＋ 悬停主线 = 加任务<br>\n        🖱 滚轮缩放 · 拖拽空白处平移 · 拖卡片到另一张卡片上 = 成为其子任务<br>\n        ☀ 把任务<b>拖到右侧</b> = 加入今日处理<br>\n        🔀 左下角「显示方式」= 四周发散 ⇄ 所有主线统一向右\n      </div>\n    </div>\n    <div class=\"map-empty\" id=\"mapEmpty\">\n      <div style=\"font-size:40px\">🗺</div>\n      <div>点击右上角「＋ 新建主线」开始你的任务地图</div>\n    </div>\n  </div>\n\n  <!-- ============ 列表视图（保留） ============ -->\n  <div id=\"listView\">\n    <div class=\"layout\">\n      <aside id=\"sidebar\">\n        <h2>主线任务 <span class=\"count\" id=\"lineCount\"></span></h2>\n        <div id=\"lineList\"></div>\n        <div class=\"add-line\">\n          <input id=\"newLineName\" placeholder=\"新主线名称，回车添加\" maxlength=\"30\">\n          <button class=\"btn\" id=\"btnAddLine\">＋ 添加</button>\n        </div>\n      </aside>\n      <main>\n        <div class=\"main-head\">\n          <h1 id=\"currentLineName\">—</h1>\n          <span class=\"stat\" id=\"stat\"></span>\n          <div class=\"filters\">\n            <button data-f=\"all\" class=\"on\">全部</button>\n            <button data-f=\"todo\">未完成</button>\n            <button data-f=\"done\">已完成</button>\n          </div>\n        </div>\n        <div class=\"tree-bar\">\n          <button class=\"tool small\" id=\"btnExpandAll\" title=\"展开当前主线全部层级\">⊞ 全部展开</button>\n          <button class=\"tool small\" id=\"btnCollapseAll\" title=\"折叠当前主线全部层级\">⊟ 全部折叠</button>\n          <span class=\"tree-tip\">最多可嵌套 <b id=\"maxDepthTip\">50</b> 层 · 拖动任务可调整层级与顺序</span>\n        </div>\n        <div class=\"task-input\">\n          <button class=\"btn big-add\" id=\"btnAddTask\">＋ 发布新任务（可设截止日期、单人 / 多人）</button>\n        </div>\n        <!-- 面包屑：深层嵌套时清晰展示当前路径 -->\n        <div class=\"crumb\" id=\"crumb\"></div>\n        <!-- 任务树（长列表按可视区域渲染，深层嵌套也不卡） -->\n        <div class=\"task-scroll\" id=\"taskScroll\"><div class=\"task-list\" id=\"taskList\"></div></div>\n        <div class=\"empty\" id=\"emptyTip\" style=\"display:none\">\n          这条主线下还没有任务<br>在上方输入框写下第一件事吧 ✍️\n        </div>\n      </main>\n    </div>\n  </div>\n\n  <!-- ============ 日历视图：按截止日期查看任务 ============ -->\n  <div id=\"calView\">\n    <div class=\"cal-wrap\">\n      <div class=\"cal-head\">\n        <button class=\"cal-nav\" id=\"calPrev\" title=\"上一月\">‹</button>\n        <div class=\"cal-title\" id=\"calTitle\">—</div>\n        <button class=\"cal-nav\" id=\"calNext\" title=\"下一月\">›</button>\n        <button class=\"cal-today\" id=\"calToday\">回到今天</button>\n        <label class=\"cal-opt\">\n          <input type=\"checkbox\" id=\"calShowDone\"> 显示已完成\n        </label>\n        <span class=\"cal-hint\">单击任务 = 标记完成 · 双击 = 编辑</span>\n      </div>\n      <div class=\"cal-week\">\n        <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span>\n        <span class=\"we\">六</span><span class=\"we\">日</span>\n      </div>\n      <div class=\"cal-grid\" id=\"calGrid\"></div>\n      <div class=\"cal-side\">\n        <div class=\"cal-side-head\">\n          <span id=\"calSideTitle\">未安排日期</span>\n          <span class=\"count\" id=\"calNoDueCount\"></span>\n        </div>\n        <div class=\"cal-side-list\" id=\"calNoDueList\"></div>\n        <div class=\"cal-side-foot\">\n          ♾ 长期任务不设截止日期，不会出现在日历上，但每天首次打开会自动进入「今日处理」\n        </div>\n      </div>\n    </div>\n    <div class=\"empty\" id=\"calEmpty\" style=\"display:none\">\n      这个月还没有带截止日期的任务<br>给任务设置「📅 截止日期」后就会出现在这里\n    </div>\n  </div>\n</div>\n\n<div class=\"toast\" id=\"toast\"></div>\n\n<!-- 通用输入弹窗（新增/编辑） -->\n<div class=\"mask\" id=\"inputMask\">\n  <div class=\"dialog\">\n    <h3 id=\"inputTitle\">输入</h3>\n    <p id=\"inputDesc\"></p>\n    <input type=\"text\" id=\"inputField\" maxlength=\"100\">\n    <div class=\"row\">\n      <button class=\"btn ghost\" id=\"btnInputCancel\">取消</button>\n      <button class=\"btn\" id=\"btnInputOk\">确定</button>\n    </div>\n  </div>\n</div>\n\n<!-- 通用确认弹窗（删除等危险操作；替代原生 confirm，避免在部分网页容器中被拦截失效） -->\n<div class=\"mask\" id=\"confirmMask\">\n  <div class=\"dialog\">\n    <h3 id=\"confirmTitle\">确认操作</h3>\n    <p id=\"confirmDesc\"></p>\n    <div class=\"row\">\n      <button class=\"btn ghost\" id=\"btnConfirmCancel\">取消</button>\n      <button class=\"btn danger\" id=\"btnConfirmOk\">确定</button>\n    </div>\n  </div>\n</div>\n\n<!-- 任务表单弹窗（新建 / 编辑：内容 + 截止日期 + 单人/多人） -->\n<div class=\"mask\" id=\"taskMask\">\n  <div class=\"dialog\">\n    <h3 id=\"taskDlgTitle\">发布新任务</h3>\n    <p id=\"taskDlgDesc\"></p>\n    <input type=\"text\" id=\"taskDlgName\" maxlength=\"100\" placeholder=\"要做什么？\">\n    <label class=\"dlg-label\">📅 截止日期（可选）</label>\n    <div class=\"due-row\">\n      <input type=\"date\" id=\"taskDlgDue\">\n      <button class=\"btn ghost\" id=\"taskDlgDueClear\" type=\"button\">清除</button>\n    </div>\n    <div class=\"scope-switch\" id=\"longSwitch\" style=\"margin-top:8px\">\n      <button type=\"button\" data-l=\"0\" class=\"on\">⏱ 有截止日期</button>\n      <button type=\"button\" data-l=\"1\">♾ 长期任务</button>\n    </div>\n    <div class=\"dlg-tip\" id=\"longTip\" style=\"display:none\">\n      ♾ <b>长期任务</b>：不设截止日期，每天首次打开应用时自动进入「今日处理」；\n      当天手动移出后不会再自动加回，第二天重新出现。\n    </div>\n    <label class=\"dlg-label\">👤 参与方式</label>\n    <div class=\"scope-switch\" id=\"scopeSwitch\">\n      <button type=\"button\" data-s=\"solo\" class=\"on\">👤 单人任务</button>\n      <button type=\"button\" data-s=\"multi\">👥 多人协作</button>\n    </div>\n    <input type=\"text\" id=\"taskDlgAssignees\" maxlength=\"60\"\n      placeholder=\"参与人，如：小明、小红（可选）\" style=\"display:none\">\n    <div class=\"row\" style=\"margin-top:16px\">\n      <button class=\"btn ghost\" id=\"taskDlgCancel\">取消</button>\n      <button class=\"btn\" id=\"taskDlgOk\">保存任务</button>\n    </div>\n  </div>\n</div>\n\n<!-- 导出 / 导入 弹窗 -->\n<div class=\"mask\" id=\"dlgMask\">\n  <div class=\"dialog\">\n    <h3 id=\"dlgTitle\">导出数据</h3>\n    <p id=\"dlgDesc\">把下面方框中的内容复制保存，即可迁移到其他设备。</p>\n    <textarea id=\"dlgArea\" spellcheck=\"false\"></textarea>\n    <div class=\"row\">\n      <button class=\"btn ghost\" id=\"btnDlgClose\">关闭</button>\n      <button class=\"btn\" id=\"btnDlgCopy\">复制到剪贴板</button>\n      <button class=\"btn green\" id=\"btnDlgApply\" style=\"display:none\">导入</button>\n    </div>\n  </div>\n</div>\n\n";
/* =====================================================================
 * 任务线 —— 待办事项管理应用（思维导图版）
 *
 * 一、数据模型（Data Model）
 * ---------------------------------------------------------------------
 * 整个应用只有两张"表"，全部为纯 JSON，可整体序列化、可同步：
 *
 *   主线 Line（任务分类，如"工作主线""学习主线"）：
 *   { id, title, createdAt, updatedAt, deleted }
 *
 *   任务 Task（挂在某条主线下）：
 *   { id, lineId, title, done, createdAt, updatedAt, doneAt, deleted,
 *     due, scope, assignees, focus, focusAt }
 *     due       截止日期时间戳（当天零点），未设置为 null
 *     scope     参与方式：'solo' 单人 | 'multi' 多人协作
 *     assignees 多人时的参与人名单（字符串数组，可为空）
 *     focus     是否已拖入「今日处理」面板
 *     focusAt   加入今日处理的时间（移出为 null）
 *
 *   设置 Settings（全局唯一一条，含主题偏好）：
 *   { id: 'settings', theme: 'light' | 'dark', updatedAt }
 *   主题偏好也是一条"记录"，走同一套同步管道：
 *   多标签页实时同步 + 导出/导入跨设备迁移 + LWW 合并。
 *
 *   id        全局唯一 ID（时间戳+随机数）
 *   updatedAt 最后修改时间戳 —— 同步冲突裁决依据
 *   deleted   软删除标记（墓碑），同步时不物理删除
 *
 * 二、同步机制（Sync Mechanism）
 * ---------------------------------------------------------------------
 * 1) 单一事实源：所有增删改统一写入 state，由 Repository 持久化到
 *    localStorage，刷新页面数据不丢。
 * 2) 记录级同步 + LWW（Last-Write-Wins 最后写入优先）合并。
 * 3) 软删除墓碑：删除也参与同步，不会"删了又复活"。
 * 4) 实时通道：BroadcastChannel 广播本机变更，多标签页实时一致。
 * 5) 可插拔 SyncAdapter 接口（push/pull）：当前为本机适配器，
 *    将来接入云服务换成云端适配器即可实现跨设备实时同步，
 *    增删改查与合并代码完全不用动。
 * ===================================================================== */

/* ---------- 工具函数 ---------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const now = () => Date.now();
const fmtTime = ts => {
  const d = new Date(ts);
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const esc = s => String(s).replace(/[&<>"']/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* =====================================================================
 * 第一部分：数据仓库（Repository）—— 本地持久化
 * ===================================================================== */
const STORE_KEY = `renwuxian.data.v1:${window.tiana?.appId || location.pathname}`;

/** 任务层级上限：主线算第 0 层，其下任务从第 1 层起，最多 MAX_DEPTH 层 */
const MAX_DEPTH = 50;

/** 长期任务 ♾：无截止日期，每天首次启动自动进入「今日处理」 */
const LONG_TAG = '♾ 长期';
/** SVG 属性里不能用 var()，所以取当前主题下长期任务色的计算值（深色模式自动换色） */
function longColor() {
  try {
    return getComputedStyle(document.body).getPropertyValue('--long').trim() || '#7c5cff';
  } catch (e) { return '#7c5cff'; }
}

/** 任务记录规范化：为旧数据补上后加的字段（本地加载 / 导入 / 同步到达共用）
 *
 *  【树形结构】逻辑上是一棵任意深度的树，但存储仍然是"扁平记录 + parentId"：
 *    parentId  父任务 id；null 表示直接挂在主线下（第一层）
 *    order     同级排序序号（越小越靠前）
 *    collapsed 子树是否折叠
 *  这样做的好处：多端同步仍可"逐条记录"做 LWW 合并，不会因为改一个子节点
 *  而整棵树互相覆盖；渲染时再按 parentId/order 组装成树。
 *  旧的两层数据（只有 lineId、没有 parentId）迁移后 parentId=null，
 *  即"挂在主线下的第一层任务"，展示与交互和改造前完全一致。 */
function normalizeTasks(arr) {
  const list = arr.map(t => ({
    parentId: null, order: 0, collapsed: false,
    due: null, scope: 'solo', assignees: [], focus: false, focusAt: null,
    longTerm: false,          // ♾ 长期任务：无截止日期，每天首次启动自动进入今日处理
    ...t
  }));
  return repairTree(list);
}

/** 修复树结构（本地加载 / 导入 / 云端合并后共用，保证渲染不会错乱或死循环）：
 *  ① 父任务不存在或已被删除 → 提升为该主线的第一层任务
 *  ② parentId 成环（多端合并可能产生）→ 断开环，保证是一棵树 */
function repairTree(list) {
  const byId = new Map(list.map(t => [t.id, t]));
  for (const t of list) {
    if (t.parentId) {
      const p = byId.get(t.parentId);
      if (!p || p.deleted) t.parentId = null;
    }
    if (typeof t.order !== 'number' || !isFinite(t.order)) t.order = 0;
    t.collapsed = !!t.collapsed;
  }
  for (const t of list) {                 // 断环：沿 parentId 上溯，重复出现即断开
    const seen = new Set();
    let cur = t, guard = 0;
    while (cur && cur.parentId && guard++ < MAX_DEPTH + 10) {
      if (seen.has(cur.id)) { cur.parentId = null; break; }
      seen.add(cur.id);
      cur = byId.get(cur.parentId);
    }
  }
  return list;
}

const Repository = {
  /** 首次使用的默认主题：跟随操作系统偏好 */
  defaultTheme() {
    try {
      return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark' : 'light';
    } catch (e) { return 'light'; }
  },
  empty() {
    return {
      lines: [{ id: uid(), title: '默认主线', createdAt: now(), updatedAt: now(), deleted: false }],
      tasks: [],
      settings: { id: 'settings', theme: this.defaultTheme(), updatedAt: now() }
    };
  },
  load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return this.empty();
      const data = JSON.parse(raw);
      if (!Array.isArray(data.lines) || !Array.isArray(data.tasks)) return this.empty();
      // 旧版本数据迁移：补上 settings 记录（updatedAt=0 保证不覆盖别端较新的主题）
      if (!data.settings || typeof data.settings !== 'object') {
        data.settings = { id: 'settings', theme: this.defaultTheme(), updatedAt: 0 };
      }
      // 旧任务迁移：补上截止日期 / 参与方式 / 今日处理字段
      data.tasks = normalizeTasks(data.tasks);
      return data;
    } catch (e) {
      console.warn('本地数据损坏，使用初始数据', e);
      return this.empty();
    }
  },
  save(state) {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }
};

/* =====================================================================
 * 第二部分：同步引擎（SyncEngine）
 * ===================================================================== */
const CHANNEL_NAME = `renwuxian-sync:${window.tiana?.appId || location.pathname}`;

/** 记录级合并：LWW（最后写入优先），支持 Line 与 Task 两种记录 */
function mergeRecords(localArr, remoteArr) {
  const map = new Map(localArr.map(r => [r.id, r]));
  for (const remote of remoteArr) {
    const local = map.get(remote.id);
    if (!local || (remote.updatedAt || 0) >= (local.updatedAt || 0)) {
      map.set(remote.id, remote);
    }
  }
  return Array.from(map.values());
}

const SyncEngine = {
  channel: null,
  start(onRemoteChange) {
    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (ev) => {
        if (ev.data && ev.data.type === 'state') onRemoteChange(ev.data.state);
      };
    }
    window.addEventListener('storage', (ev) => {
      if (ev.key === STORE_KEY && ev.newValue) {
        try { onRemoteChange(JSON.parse(ev.newValue)); } catch (e) {}
      }
    });
  },
  broadcast(state) {
    if (this.channel) this.channel.postMessage({ type: 'state', state });
  },
  adapter: {
    name: 'local',
    push(state) { Repository.save(state); return true; },
    pull()      { return Repository.load(); }
  }
};


const CloudSync = {
 enabled:false, timer:null, running:false, queued:false,
 async enable() {
  try {
   this.connection = await window.tiana.connection();
   if (this.connection.sql_api !== 'hrana-v3' || !window.tiana.auth?.getAccessToken) throw new Error('数据库连接不可用');
   this.fetch = createTianaFetch({origin:this.connection.origin, auth:window.tiana.auth, requestBodyMode:'buffered'});
   await this.pull(); this.enabled=true; this.schedulePush(0);
   setInterval(()=>{if(document.visibilityState==='visible') this.pull().catch(e=>this.error(e))},20000);
   document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible') this.pull().catch(e=>this.error(e))});
  } catch(e) {this.error(e)}
 },
 error(e){console.error('同步失败',e); $('syncText').textContent='同步失败 · 请刷新重试'; $('syncLed').style.background='#e5484d'},
 async sql(sql,args=[]) {
  const r=await this.fetch(`${this.connection.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if(!r.ok) throw Error('数据库请求失败'); const b=await r.json(); const x=b.results?.[0];
  if(x?.type!=='ok'||x.response?.type!=='execute') throw Error('数据库操作未确认'); return x.response.result;
 },
 async pull(){
  const result=await this.sql('SELECT kind, payload FROM records');
  let rows=result.rows.map(r=>({kind:r[0].value, payload:JSON.parse(r[1].value)}));
  const lines=rows.filter(r=>r.kind==='line').map(r=>r.payload), tasks=rows.filter(r=>r.kind==='task').map(r=>r.payload), settings=rows.find(r=>r.kind==='settings')?.payload;
  if (lines.length && !initialLocalData && !this.initialPullDone) state.lines=[];
  this.initialPullDone = true;
  state.lines=mergeRecords(state.lines,lines); state.tasks=normalizeTasks(mergeRecords(state.tasks,tasks)); if(settings) mergeSettings(settings);
  invalidateTaskIndex(); if(!queryLines().some(l=>l.id===currentLineId)) currentLineId=queryLines()[0]?.id;
  Repository.save(state); SyncEngine.broadcast(state); applyTheme(); syncMapLayoutBtn(); render();
  $('syncText').textContent='☁️ 云端同步 · 多设备实时一致'; $('syncLed').style.background='#2ea86f';
 },
 schedulePush(delay=1500){if(!this.enabled)return; clearTimeout(this.timer);this.timer=setTimeout(()=>this.push(),delay)},
 async push(){
  if(this.running){this.queued=true;return} this.running=true;
  try {
   const records=[...state.lines.map(x=>['line',x]),...state.tasks.map(x=>['task',x]),['settings',state.settings]];
   for(const [kind,x] of records){
    const args=[kind,x.id,JSON.stringify(x),String(x.updatedAt||0)].map((v,i)=>({type:i===3?'integer':'text',value:v}));
    await this.sql('INSERT INTO records(kind,id,payload,updated_at) VALUES(?,?,?,?) ON CONFLICT(kind,id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at WHERE excluded.updated_at >= records.updated_at',args);
   }
   $('syncText').textContent='☁️ 云端同步 · 多设备实时一致'; $('syncLed').style.background='#2ea86f';
  }catch(e){this.error(e)}finally{this.running=false;if(this.queued){this.queued=false;this.schedulePush(1500)}}
 }
};

/* =====================================================================
 * 第三部分：应用状态与增删改查（CRUD）+ 状态更新逻辑
 * ===================================================================== */
const initialLocalData = !!localStorage.getItem(STORE_KEY);
let state = Repository.load();
if (!initialLocalData) state.settings.updatedAt = 0;
let currentLineId = state.lines[0] ? state.lines[0].id : null;
let filter = 'all';                     // all | todo | done（列表视图用）
let view = 'map';                       // map | list 当前视图

/** 提交变更：持久化 + 广播同步 + 云端上行 + 应用主题 + 刷新界面 */
function commit() {
  invalidateTaskIndex();                  // 树索引缓存失效（深层嵌套下避免读到旧关系）
  SyncEngine.adapter.push(state);
  SyncEngine.broadcast(state);
  CloudSync.schedulePush();       // 云端上行（未登录时自动跳过）
  applyTheme();
  render();
}

/* ---------- 主题（深色模式）+ 配色方案：设置记录的读写与合并 ---------- */

/* 五套配色：key → { 名称、一句话说明、用于色卡预览的主色 } */
const SCHEMES = [
  { key: 'indigo',   name: '靛蓝', desc: '冷静专业',   colors: ['#4763de', '#2a9d5c', '#e5484d'] },
  { key: 'forest',   name: '松绿', desc: '沉稳有力',   colors: ['#107b5f', '#2a9d5c', '#d94b45'] },
  { key: 'amber',    name: '暖阳', desc: '温暖亲和',   colors: ['#9e5c20', '#3f9455', '#d24b40'] },
  { key: 'plum',     name: '暮紫', desc: '优雅梦幻',   colors: ['#844bcb', '#2f9e73', '#d5475e'] },
  { key: 'graphite', name: '石墨', desc: '极简高级',   colors: ['#465163', '#2f855a', '#c53030'] }
];
const SCHEME_KEYS = SCHEMES.map(s => s.key);

/** 当前配色方案的 key（缺省或非法值一律回落到靛蓝，不影响启动） */
function getScheme() {
  const s = state.settings && state.settings.scheme;
  return SCHEME_KEYS.includes(s) ? s : 'indigo';
}

/** 把当前主题应用到界面（深浅 + 配色方案） */
function applyTheme() {
  const dark = state.settings && state.settings.theme === 'dark';
  const scheme = getScheme();
  document.body.classList.toggle('dark', dark);
  document.body.setAttribute('data-scheme', scheme);
  const btn = $('btnTheme');
  if (btn) btn.textContent = dark ? '☀️' : '🌙';
  const sb = $('btnScheme');
  if (sb) {
    const cur = SCHEMES.find(s => s.key === scheme);
    sb.title = `配色：${cur.name} · ${cur.desc}（点击更换）`;
    sb.setAttribute('aria-label', sb.title);
  }
  renderSchemeList();
}

/** 渲染配色面板（每次打开/切换都重建，保证选中态与色卡始终准确） */
function renderSchemeList() {
  const box = $('schemeList');
  if (!box) return;
  box.innerHTML = '';
  const cur = getScheme();
  for (const s of SCHEMES) {
    const btn = document.createElement('button');
    btn.className = 'scheme-item' + (s.key === cur ? ' on' : '');
    btn.type = 'button';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', s.key === cur ? 'true' : 'false');

    const sw = document.createElement('span');
    sw.className = 'scheme-swatches';
    /* 色卡用内联色值，保证即使主题变量未生效也能正确预览 */
    for (const c of s.colors) {
      const i = document.createElement('i');
      i.style.background = c;
      sw.appendChild(i);
    }
    btn.appendChild(sw);

    const txt = document.createElement('span');
    const nm = document.createElement('div');
    nm.className = 'scheme-name';
    nm.textContent = s.name;
    const ds = document.createElement('div');
    ds.className = 'scheme-desc';
    ds.textContent = s.desc;
    txt.appendChild(nm); txt.appendChild(ds);
    btn.appendChild(txt);

    if (s.key === cur) {
      const ck = document.createElement('span');
      ck.className = 'scheme-check';
      ck.textContent = '✓';
      btn.appendChild(ck);
    }

    btn.onclick = () => { setScheme(s.key); closeSchemePop(); };
    box.appendChild(btn);
  }
}

/** 切换配色方案（写入 settings 记录，随同步管道传播到其他设备） */
function setScheme(key) {
  if (!SCHEME_KEYS.includes(key)) return;
  if (!state.settings) state.settings = { id: 'settings', theme: 'light', updatedAt: 0 };
  if (getScheme() === key) return;
  state.settings.scheme = key;
  state.settings.updatedAt = now();
  commit();
  toast(`配色已切换为「${SCHEMES.find(s => s.key === key).name}」`);
}

/** 开关配色面板 */
function toggleSchemePop() { $('schemePop').hidden ? openSchemePop() : closeSchemePop(); }
function openSchemePop() {
  $('schemePop').hidden = false;
  $('btnScheme').classList.add('on');
  $('btnScheme').setAttribute('aria-expanded', 'true');
  renderSchemeList();
}
function closeSchemePop() {
  $('schemePop').hidden = true;
  $('btnScheme').classList.remove('on');
  $('btnScheme').setAttribute('aria-expanded', 'false');
}

/** 切换深色 / 浅色模式（写入 settings 记录，随同步管道传播） */
function toggleTheme() {
  if (!state.settings) state.settings = { id: 'settings', theme: 'light', updatedAt: 0 };
  state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
  state.settings.updatedAt = now();
  commit();
}

/** 主题记录合并：同样按 LWW（最后修改的赢） */
function mergeSettings(remote) {
  if (remote && typeof remote === 'object' &&
      (remote.updatedAt || 0) >= (state.settings.updatedAt || 0)) {
    state.settings = remote;
  }
}

/* ---------- 导图显示方式（四周发散 / 统一向右） ---------- */

/** 读取当前显示方式：'radial' 四周发散（默认）| 'right' 统一向右 */
function getMapLayoutMode() {
  return (state.settings && state.settings.mapLayout) === 'right' ? 'right' : 'radial';
}

/** 把「显示方式」按钮的文案同步成当前模式（换行省略，避免顶栏被撑开） */
function syncMapLayoutBtn() {
  const b = $('btnMapLayout');
  if (!b) return;
  const right = getMapLayoutMode() === 'right';
  b.textContent = right ? '↦ 统一向右' : '✳ 四周发散';
  b.title = right
    ? '当前：所有主线排成一列，任务统一向右展开（点击切换为四周发散）'
    : '当前：主线沿圆周四周发散（点击切换为统一向右）';
  b.setAttribute('aria-label', b.title);
  b.classList.toggle('on', right);
}

/** 切换显示方式（写入 settings 记录，随同步管道传播到其他设备） */
function toggleMapLayout() {
  if (!state.settings) state.settings = { id: 'settings', theme: 'light', updatedAt: 0 };
  const next = getMapLayoutMode() === 'right' ? 'radial' : 'right';
  state.settings.mapLayout = next;
  state.settings.updatedAt = now();
  syncMapLayoutBtn();
  commit();
  toast(next === 'right' ? '已切换为「统一向右」显示' : '已切换为「四周发散」显示');
  if (view === 'map') fitMap();   // 布局整体变了，重新适应屏幕
}

/* ---------- 主线 CRUD ---------- */

function addLine(title) {
  title = (title || '').trim();
  if (!title) { toast('请输入主线名称'); return; }
  const id = uid();
  state.lines.push({ id, title, createdAt: now(), updatedAt: now(), deleted: false });
  commit();
  revealLine(id);        // 新主线若跑出视野，相机自动跟随移入
}

function removeLine(lineId) {
  const line = state.lines.find(l => l.id === lineId);
  if (!line) return;
  if (queryLines().length <= 1) { toast('至少保留一条主线'); return; }
  askConfirm('删除主线', `确定删除主线「${line.title}」吗？其下所有任务也会一并删除。`, '删除', () => {
    const t = now();
    line.deleted = true; line.updatedAt = t;
    state.tasks.forEach(task => {
      if (task.lineId === lineId && !task.deleted) { task.deleted = true; task.updatedAt = t; }
    });
    if (currentLineId === lineId) {
      const rest = queryLines();
      currentLineId = rest.length ? rest[0].id : null;
    }
    commit();
    toast(`已删除主线：${line.title}`);
  });
}

function renameLine(lineId, title) {
  title = (title || '').trim();
  if (!title) return;
  const line = state.lines.find(l => l.id === lineId);
  if (line && line.title !== title) { line.title = title; line.updatedAt = now(); commit(); }
}

/* ---------- 任务 CRUD ---------- */

/* ---------- 树形结构辅助（父子关系 / 层级深度 / 排序） ---------- */

let _taskIndexCache = null;                       // 每次提交后失效，避免深层嵌套重复建索引
function taskIndex() {
  if (!_taskIndexCache) {
    _taskIndexCache = new Map(state.tasks.map(t => [t.id, t]));
  }
  return _taskIndexCache;
}
function invalidateTaskIndex() { _taskIndexCache = null; }

/** 某父节点下的直接子任务（按 order 排序）；
 *  parentId 为 null 时表示"直接挂在主线下"的第一层任务 */
function childrenOf(lineId, parentId) {
  const key = parentId || '';
  return state.tasks
    .filter(t => !t.deleted && t.lineId === lineId && (t.parentId || '') === key)
    .sort((a, b) => (a.order - b.order) || (a.createdAt - b.createdAt));
}

/** 层级深度：主线下的第一层任务 = 1，逐层 +1 */
function depthOf(task) {
  let d = 1, cur = task, guard = 0;
  const idx = taskIndex();
  while (cur && cur.parentId && guard++ <= MAX_DEPTH + 2) {
    d++; cur = idx.get(cur.parentId);
  }
  return d;
}

/** 子树的所有后代（不含自身） */
function descendantsOf(id) {
  const out = [];
  const all = state.tasks.filter(t => !t.deleted);
  const kidsOf = pid => all.filter(t => (t.parentId || '') === (pid || ''));
  const stack = kidsOf(id);
  while (stack.length) {
    const cur = stack.pop();
    out.push(cur);
    kidsOf(cur.id).forEach(k => stack.push(k));
  }
  return out;
}

/** 某任务的直接子任务（子任务继承父任务的 lineId，故无需再按主线过滤） */
function childTasks(id) {
  return state.tasks
    .filter(t => !t.deleted && (t.parentId || '') === (id || ''))
    .sort((a, b) => (a.order - b.order) || (a.createdAt - b.createdAt));
}

/** 子树高度：自身算 0 层，叶子 = 0，有一个子节点 = 1 */
function subtreeHeight(id) {
  const kids = childTasks(id);
  if (!kids.length) return 0;
  return 1 + Math.max(...kids.map(k => subtreeHeight(k.id)));
}

/** id 是否是 ancestorId 的后代（用于阻止把父节点拖进自己的子树） */
function isDescendantOf(id, ancestorId) {
  return descendantsOf(ancestorId).some(t => t.id === id);
}

/** 面包屑路径：[主线, 祖先..., 自身] */
function taskPath(id) {
  const idx = taskIndex();
  const path = [];
  let cur = idx.get(id);
  let guard = 0;
  while (cur && guard++ <= MAX_DEPTH + 2) {
    path.unshift(cur);
    cur = cur.parentId ? idx.get(cur.parentId) : null;
  }
  const line = path.length ? state.lines.find(l => l.id === path[0].lineId) : null;
  return line ? [line].concat(path) : path;
}

/** 深度校验：把 subtreeId 这棵子树挂到 newParentId 下是否超过层数上限
 *  newParentId 为 null 表示挂到主线第一层 */
function depthFits(subtreeId, newParentId, newLineId) {
  const idx = taskIndex();
  let baseDepth = 0;                                  // 父节点深度（主线 = 0）
  if (newParentId) {
    const p = idx.get(newParentId);
    if (p) baseDepth = depthOf(p);
  } else if (newLineId) {
    const l = state.lines.find(x => x.id === newLineId && !x.deleted);
    baseDepth = l ? 0 : 0;
  }
  const h = subtreeId ? subtreeHeight(subtreeId) : 0;
  return baseDepth + 1 + h <= MAX_DEPTH;
}

/** 同级排序：取当前最大值 + 1 */
function nextOrder(lineId, parentId) {
  const sib = childrenOf(lineId, parentId);
  return sib.length ? (sib[sib.length - 1].order || 0) + 1 : 0;
}

/** 发布新任务（可指定主线与父任务，支持任意深度嵌套）
 *  opts: { parentId 父任务 id, due 截止时间戳, scope 'solo'|'multi', assignees 参与人数组,
 *          longTerm 是否长期任务（♾，与截止日期互斥） } */
function addTask(title, lineId, opts = {}) {
  title = (title || '').trim();
  if (!title) { toast('请输入任务内容'); return; }
  const parentId = opts.parentId || null;
  const idx = taskIndex();
  const parent = parentId ? idx.get(parentId) : null;
  if (parentId && (!parent || parent.deleted)) { toast('父任务不存在，已取消'); return; }
  const target = (parent && parent.lineId) || lineId || currentLineId;
  if (!target) { toast('请先添加一条主线'); return; }

  const newDepth = parent ? depthOf(parent) + 1 : 1;
  if (newDepth > MAX_DEPTH) {
    toast(`最多支持 ${MAX_DEPTH} 层：第 ${MAX_DEPTH} 层任务下不能再新建子任务`);
    return;
  }

  const id = uid();
  const t = now();
  state.tasks.push({
    id, lineId: target, parentId: parentId || null,
    order: nextOrder(target, parentId), collapsed: false,
    title,
    done: false, createdAt: t, updatedAt: t, doneAt: null, deleted: false,
    due: opts.longTerm ? null : (opts.due || null),   // 长期任务不设截止日期
    scope: opts.scope === 'multi' ? 'multi' : 'solo',
    assignees: Array.isArray(opts.assignees) ? opts.assignees.filter(Boolean) : [],
    focus: !!opts.focus,
    focusAt: opts.focus ? t : null,
    longTerm: !!opts.longTerm
  });
  if (parent && parent.collapsed) { parent.collapsed = false; parent.updatedAt = t; }  // 保证新节点可见
  commit();
  revealTask(id);        // 新任务若跑出视野，相机自动跟随移入（否则要刷新/适应屏幕才看得见）
  return id;
}

/** 在指定父任务下新建子任务（父为 null 时新建主线下的第一层任务） */
function addSubTask(parentId, title, lineId, opts = {}) {
  return addTask(title, lineId || currentLineId, Object.assign({}, opts, { parentId: parentId || null }));
}

/* ---------- 层级调整：缩进 / 升级 / 移动 ---------- */

/** 缩进：成为上一个同级任务的最后一个子任务 */
function indentTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  const sib = childrenOf(task.lineId, task.parentId);
  const at = sib.findIndex(t => t.id === id);
  if (at <= 0) { toast('已经是同层的第一个，无法再缩进'); return; }
  const newParent = sib[at - 1];
  if (!depthFits(id, newParent.id, task.lineId)) {
    toast(`最多支持 ${MAX_DEPTH} 层：再缩进会超过层数上限`);
    return;
  }
  moveTask(id, newParent.id, childTasks(newParent.id).length, task.lineId);
}

/** 升级：成为父任务的同级（排在父任务之后） */
function outdentTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task || !task.parentId) { toast('已经是第一层任务'); return; }
  const idx = taskIndex();
  const parent = idx.get(task.parentId);
  if (!parent) { task.parentId = null; task.updatedAt = now(); commit(); return; }
  const grandSib = childrenOf(parent.lineId, parent.parentId);
  const at = grandSib.findIndex(t => t.id === parent.id);
  moveTask(id, parent.parentId || null, at + 1, parent.lineId);
}

/** 移动子树：改父节点 / 改排序位置 / 可跨主线
 *  含循环与层数校验，非法移动会被拒绝并提示 */
function moveTask(id, newParentId, index, newLineId) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return false;
  if (newParentId === id) { toast('不能作为自己的子任务'); return false; }
  if (newParentId && isDescendantOf(newParentId, id)) {
    toast('不能移动到自己的子任务下面');
    return false;
  }
  const line = newLineId || task.lineId;
  if (!depthFits(id, newParentId, line)) {
    toast(`最多支持 ${MAX_DEPTH} 层：该位置会超过层数上限`);
    return false;
  }
  const t = now();

  // 原同级：移除后重排序（仅在顺序真的变化时更新时间戳，减少不必要的同步流量）
  const oldSib = childrenOf(task.lineId, task.parentId).filter(x => x.id !== id);
  oldSib.forEach((s, i) => { if (s.order !== i) { s.order = i; s.updatedAt = t; } });

  task.parentId = newParentId || null;
  task.updatedAt = t;

  // 子树整体跟随（lineId 继承，保证跨主线移动后仍能按主线过滤）
  task.lineId = line;
  descendantsOf(id).forEach(k => { k.lineId = line; k.updatedAt = t; });

  const dest = childrenOf(line, newParentId).filter(x => x.id !== id);
  const at = Math.max(0, Math.min(index === undefined ? dest.length : index, dest.length));
  dest.splice(at, 0, task);
  dest.forEach((s, i) => { if (s.order !== i) { s.order = i; s.updatedAt = t; } });

  if (newParentId) {                                  // 目标父节点若折叠则展开，避免"移动后消失"
    const p = taskIndex().get(newParentId);
    if (p && p.collapsed) { p.collapsed = false; p.updatedAt = t; }
  }
  commit();
  return true;
}

/** 折叠 / 展开子树 */
function toggleCollapse(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  task.collapsed = !task.collapsed;
  task.updatedAt = now();
  commit();
}

/** 全部展开 / 全部折叠（当前主线） */
function setAllCollapsed(on) {
  let n = 0;
  state.tasks.forEach(t => {
    if (!t.deleted && t.lineId === currentLineId && !!t.collapsed !== !!on) {
      t.collapsed = !!on; t.updatedAt = now(); n++;
    }
  });
  if (n) commit();
}

function removeTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;
  const kids = descendantsOf(taskId);
  const extra = kids.length ? `\n其下 ${kids.length} 个子任务也会一并删除。` : '';
  askConfirm('删除任务', `确定删除任务「${task.title}」吗？${extra}`, '删除', () => {
    const t = now();
    task.deleted = true; task.updatedAt = t;
    kids.forEach(k => { k.deleted = true; k.updatedAt = t; });   // 子任务树一并软删除
    commit();
    toast(`已删除任务：${task.title}`);
  });
}

/** 编辑任务（内容 / 截止日期 / 参与方式，可随时修改） */
function updateTaskMeta(taskId, patch) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;
  let changed = false;
  for (const key of ['title', 'due', 'scope', 'assignees', 'longTerm']) {
    if (patch[key] === undefined) continue;
    if (JSON.stringify(task[key]) !== JSON.stringify(patch[key])) {
      task[key] = patch[key]; changed = true;
    }
  }
  if (changed) { task.updatedAt = now(); commit(); }
}

/* ---------- 「今日处理」：focus 字段的读写 ---------- */

/** 加入 / 移出今日处理（与任务线上的是同一条记录，状态天然同步） */
function setFocus(taskId, on) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task || task.focus === !!on) return;
  task.focus = !!on;
  task.focusAt = on ? now() : null;
  task.updatedAt = now();
  commit();
}

/* ---------- 长期任务 ♾：每天首次启动自动进入「今日处理」 ---------- */

/** 本地日期键 YYYY-MM-DD（跨零点判断用） */
function todayKey(ts = Date.now()) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}

/** 每天第一次打开（或跨过零点后回到页面）时，把未完成的长期任务放进「今日处理」。
 *  已完成的不再打扰；当天手动移出的不会再自动加回（只补 focus=false 的），第二天重新出现。
 *  用 settings.longTermDate 记录“今天已经跑过”，重启也不会重复执行。 */
function applyDailyLongTerm() {
  if (!state.settings) state.settings = { id: 'settings', theme: 'light', updatedAt: 0 };
  const key = todayKey();
  if (state.settings.longTermDate === key) return 0;
  const ts = now();
  let n = 0;
  state.tasks.forEach(task => {
    if (task.deleted || !task.longTerm || task.done || task.focus) return;
    task.focus = true; task.focusAt = ts; task.updatedAt = ts; n++;
  });
  state.settings.longTermDate = key;
  state.settings.updatedAt = ts;
  if (n) { commit(); toast(`${LONG_TAG}任务已自动加入「今日处理」${n} 个`); }
  else { Repository.save(state); CloudSync.schedulePush(); } // 日期也需跨设备持久化
  return n;
}

/** 一键清除今日处理中的已完成任务 */
function clearDoneFocus() {
  let changed = false;
  state.tasks.forEach(t => {
    if (!t.deleted && t.focus && t.done) {
      t.focus = false; t.focusAt = null; t.updatedAt = now(); changed = true;
    }
  });
  if (changed) commit();
}

/** 查询今日处理面板内容：未完成在前，再按加入时间排序 */
function queryFocused() {
  return state.tasks
    .filter(t => !t.deleted && t.focus)
    .sort((a, b) => (a.done - b.done) || ((a.focusAt || 0) - (b.focusAt || 0)));
}

/** 兼容旧调用：仅修改任务标题 */
function updateTaskTitle(taskId, title) {
  title = (title || '').trim();
  if (!title) return;
  updateTaskMeta(taskId, { title });
}

/** 状态更新：标记完成 / 取消完成 */
function toggleTaskDone(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.done = !task.done;
  task.doneAt = task.done ? now() : null;
  task.updatedAt = now();
  commit();
}

/* ---------- 查询（R） ---------- */

function queryLines() { return state.lines.filter(l => !l.deleted); }

function queryTasks(lineId, f = 'all') {
  let list = state.tasks.filter(t => !t.deleted && t.lineId === lineId);
  if (f === 'todo') list = list.filter(t => !t.done);
  if (f === 'done') list = list.filter(t => t.done);
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

/* ---------- 截止日期 / 参与方式：展示与换算辅助 ---------- */
const p2 = n => String(n).padStart(2, '0');

/** 截止日期显示文本：当年省略年份 */
function fmtDue(ts) {
  const d = new Date(ts);
  const y = d.getFullYear() === new Date().getFullYear() ? '' : d.getFullYear() + '-';
  return `${y}${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}

/** 是否逾期：未完成且截止日已整天过去 */
function isOverdue(task) {
  return !!task.due && !task.done && (task.due + 86399999) < Date.now();
}

/** 倒计时文本：根据截止日期自动计算"剩余/逾期 X天X小时"
 *  nowTs 参数供测试注入当前时间，默认取真实时间 */
function countdownText(task, nowTs = Date.now()) {
  if (!task.due || task.done) return null;
  const DAY = 86400000, HOUR = 3600000;
  const endOfDue = task.due + 86399999;      // 截止日当天 23:59:59
  const diff = endOfDue - nowTs;
  const fmt = (d, h) => (d > 0 && h > 0) ? `${d}天${h}小时`
                 : (d > 0) ? `${d}天` : `${h}小时`;
  if (diff >= 0) {
    const d = Math.floor(diff / DAY);
    const h = Math.ceil((diff % DAY) / HOUR);   // 剩余向上取整，30分钟也算"1小时"
    return { text: `剩余 ${fmt(d, h)}`, over: false, urgent: diff < DAY };
  }
  const od = -diff;
  const d = Math.floor(od / DAY);
  const h = Math.floor((od % DAY) / HOUR);
  return { text: `已逾期 ${fmt(d, h)}`, over: true, urgent: true };
}

/** 时间戳 → <input type=date> 的值 */
function dueToInput(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}

/** <input type=date> 的值 → 时间戳（当天零点）；空值返回 null */
function inputToDue(val) {
  if (!val) return null;
  const ts = new Date(val + 'T00:00:00').getTime();
  return isNaN(ts) ? null : ts;
}

/** 参与人文本 → 数组（顿号/逗号/空格分隔） */
function parseAssignees(text) {
  return String(text || '').split(/[、,，\s]+/).map(s => s.trim()).filter(Boolean);
}

/** 参与人摘要文本 */
function assigneesText(task) {
  if (task.scope !== 'multi') return '';
  return task.assignees && task.assignees.length
    ? `👥 ${task.assignees.join('、')}` : '👥 多人协作';
}

/* ---------- 任务表单弹窗（新建 / 编辑） ---------- */
let taskDlgCtx = null;   // { mode:'create'|'edit', lineId, task, parentId }
let taskDlgScope = 'solo';
let taskDlgLong = false;   // 弹窗里是否选了「♾ 长期任务」
let longPrevDue = '';      // 切到长期任务之前填的日期（切回来时还原）

/** mode='create' 时 parentTask 为父任务（null 表示新建主线下的第一层任务） */
function openTaskDialog(mode, lineId, task, parentTaskId) {
  const parentId = parentTaskId || (task ? task.parentId : null) || null;
  taskDlgCtx = { mode, lineId: lineId || (task ? task.lineId : null) || currentLineId, task: task || null, parentId };
  const line = taskDlgCtx.lineId ? state.lines.find(l => l.id === taskDlgCtx.lineId && !l.deleted) : null;

  if (mode === 'create') {
    const pIdx = taskIndex();
    const parent = parentId ? pIdx.get(parentId) : null;
    const depthNow = parent ? depthOf(parent) + 1 : 1;
    $('taskDlgTitle').textContent = parent ? '新建子任务' : '发布新任务';
    $('taskDlgDesc').textContent = parent
      ? `将添加到「${parent.title}」下，作为第 ${depthNow} 层任务（上限 ${MAX_DEPTH} 层）。`
      : (line ? `将添加到主线「${line.title}」，可设置截止日期和参与方式。` : '可设置截止日期和参与方式。');
    $('taskDlgName').value = '';
    $('taskDlgDue').value = '';
    taskDlgScope = 'solo';
    taskDlgLong = false;
  } else {
    $('taskDlgTitle').textContent = '编辑任务';
    $('taskDlgDesc').textContent = '可修改内容、截止日期和参与方式。';
    $('taskDlgName').value = task.title;
    $('taskDlgDue').value = dueToInput(task.due);
    taskDlgScope = task.scope === 'multi' ? 'multi' : 'solo';
    taskDlgLong = !!task.longTerm;
  }
  $('taskDlgAssignees').value = (mode === 'edit' && task.assignees) ? task.assignees.join('、') : '';
  longPrevDue = $('taskDlgDue').value;
  syncScopeUI();
  syncLongUI();
  $('taskMask').classList.add('show');
  setTimeout(() => { $('taskDlgName').focus(); $('taskDlgName').select(); }, 50);
}

function syncScopeUI() {
  document.querySelectorAll('#scopeSwitch button').forEach(b =>
    b.classList.toggle('on', b.dataset.s === taskDlgScope));
  $('taskDlgAssignees').style.display = taskDlgScope === 'multi' ? '' : 'none';
}

/** 长期任务开关：选中后禁用并清空日期输入（长期任务与截止日期互斥） */
function syncLongUI() {
  const want = taskDlgLong ? '1' : '0';
  document.querySelectorAll('#longSwitch button').forEach(b =>
    b.classList.toggle('on', b.dataset.l === want));
  const due = $('taskDlgDue');
  due.disabled = !!taskDlgLong;
  if (taskDlgLong) due.value = '';
  $('taskDlgDueClear').disabled = !!taskDlgLong;
  $('longTip').style.display = taskDlgLong ? '' : 'none';
}

function saveTaskDialog() {
  if (!taskDlgCtx) return;
  const title = $('taskDlgName').value.trim();
  if (!title) { toast('请输入任务内容'); return; }
  const { mode, lineId, task, parentId } = taskDlgCtx;
  const patch = {
    title,
    due: taskDlgLong ? null : inputToDue($('taskDlgDue').value),   // 长期任务：清掉截止日期
    scope: taskDlgScope,
    assignees: taskDlgScope === 'multi' ? parseAssignees($('taskDlgAssignees').value) : [],
    longTerm: taskDlgLong
  };
  closeTaskDialog();
  let targetId = null;
  if (mode === 'create') targetId = addTask(title, lineId, Object.assign({}, patch, { parentId: parentId || null }));
  else { updateTaskMeta(task.id, patch); targetId = task.id; }
  /* 刚被标成长期任务时立刻进今日处理，不用等到第二天 */
  if (taskDlgLong && targetId) {
    const t = state.tasks.find(x => x.id === targetId);
    if (t && t.longTerm && !t.focus) setFocus(t.id, true);
  }
}

function closeTaskDialog() {
  $('taskMask').classList.remove('show');
}

/* =====================================================================
 * 第四部分 A：思维导图视图（所有主线 + 任务一屏总览）
 * ===================================================================== */
const $ = id => document.getElementById(id);
const SVGNS = 'http://www.w3.org/2000/svg';
/* 主线配色：随配色方案变化，让导图/日历里的主线色与整体风格一致。
   每个方案一套 8 色，顺序固定 → 同一条主线在任何设备上颜色都一致。 */
const PALETTES = {
  indigo:   ['#4f6ef7','#e8618c','#2ea86f','#e5a13a','#8a5cf6','#0aa2c0','#d05ce6','#c2571a'],
  forest:   ['#12896a','#3f8f4f','#c98a24','#2f7d94','#0e8a8a','#b5563c','#6a9c3a','#5f6f52'],
  amber:    ['#d97a2b','#c0559b','#3f9455','#b0562a','#c99120','#a34d5e','#6f8f3a','#8a6b4a'],
  plum:     ['#8b4fd6','#d5475e','#2f9e73','#c2410c','#5b6fd6','#a93fb0','#c99120','#4a8fb5'],
  graphite: ['#4a5568','#b45309','#2f855a','#9f1239','#6b46c1','#0f766e','#a16207','#475569']
};
const PALETTE = PALETTES.indigo;   // 兜底：旧引用不至于报错

/* 深色模式专用的导图主线色：同一批色相朝白色提亮 40%。
   浅色版主线色画在深卡片（#1e222b）上只有 2.1~3.5:1，导图里"工作主线"这类
   15px 粗体标题几乎看不见；提亮后最低 4.76:1，五套配色全部达标。 */
const PALETTES_DARK = {
  indigo:   ['#95a8fa','#f1a0ba','#82cba9','#efc789','#b99dfa','#6cc7d9','#e39df0','#da9a76'],
  forest:   ['#71b8a6','#8cbc95','#dfb97c','#82b1bf','#6eb9b9','#d39a8a','#a6c489','#9fa997'],
  amber:    ['#e8af80','#d999c3','#8cbf99','#d09a7f','#dfbd79','#c8949e','#a9bc89','#b9a692'],
  plum:     ['#b995e6','#e6919e','#82c5ab','#da8d6d','#9da9e6','#cb8cd0','#dfbd79','#92bcd3'],
  graphite: ['#9299a4','#d2986b','#82b69c','#c57188','#a690da','#6fada8','#c7a16a','#9199a5']
};

/** 实心底色上该用深墨还是白字。
 *  导图的圆钮底色是随配色方案变的主线色（40 种）外加绿/琥珀/红等语义色，
 *  没有任何一个固定墨色能同时压住它们（深墨在浅色 graphite #4a5568 上只有
 *  2.47:1，白字在深色 amber #e8af80 上只有 2.2:1）。所以按 WCAG 相对亮度
 *  阈值 0.179 现场选：亮底配深墨、暗底配白字，实测最低 4.09:1。 */
function inkOn(bg) {
  const h = String(bg).trim();
  let r, g, b;
  if (h[0] === '#') {
    const c = h.length === 4
      ? h.slice(1).split('').map(x => x + x).join('')
      : h.slice(1);
    r = parseInt(c.slice(0, 2), 16); g = parseInt(c.slice(2, 4), 16); b = parseInt(c.slice(4, 6), 16);
  } else { const m = h.match(/[\d.]+/g); if (!m) return '#10131a'; r = +m[0]; g = +m[1]; b = +m[2]; }
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const L = 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  return L > 0.179 ? '#10131a' : '#ffffff';
}

/** 第 i 条主线的颜色。深色模式走提亮版（对比度考虑，见 PALETTES_DARK 注释）。 */
function lineColor(i) {
  const key = getScheme();
  const pal = (state.settings && state.settings.theme === 'dark')
    ? (PALETTES_DARK[key] || PALETTES_DARK.indigo)
    : (PALETTES[key] || PALETTE);
  return pal[i % 8];
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVGNS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

/** 文本换行：每行 maxChars 个字，最多 maxLines 行，超出加省略号 */
function wrapText(text, maxChars = 9, maxLines = 2) {
  const chars = Array.from(String(text));
  const lines = [];
  for (let i = 0; i < chars.length && lines.length < maxLines; i += maxChars) {
    lines.push(chars.slice(i, i + maxChars).join(''));
  }
  if (chars.length > maxChars * maxLines && lines.length) {
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + '…';
  }
  return lines.length ? lines : [''];
}

/** 估算文本宽度（无法真实测量时的兜底：中文等全角字符按全宽，其余约半宽） */
function estTextWidth(str, fontSize = 13) {
  let w = 0;
  for (const ch of String(str)) w += /[\u2E80-\uFFFD]/.test(ch) ? fontSize : fontSize * 0.55;
  return w;
}

/** 测量 SVG 文本渲染宽度（元素需已挂载；不支持时按估算兜底） */
function measureText(textEl, str, fontSize = 13) {
  try {
    if (textEl && typeof textEl.getComputedTextLength === 'function') {
      const w = textEl.getComputedTextLength();
      if (w > 0) return w;
    }
  } catch (e) {}
  return estTextWidth(str, fontSize);
}

/** 贝塞尔连线（思维导图经典弧线） */
function edgePath(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2;
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
}

/* ---- 相机（平移 / 缩放） ---- */
const cam = { x: 0, y: 0, s: 1 };

function applyCam() {
  $('world').setAttribute('transform', `translate(${cam.x},${cam.y}) scale(${cam.s})`);
}

function svgSize() {
  const svg = $('mapSvg');
  return { w: svg.clientWidth || innerWidth, h: svg.clientHeight || innerHeight };
}

function centerCam() {
  const { w, h } = svgSize();
  cam.x = w / 2; cam.y = h / 2; cam.s = 1;
  applyCam();
}

let nodeRects = [];   // 渲染时记录所有节点包围盒，供"适应屏幕"使用

/** 适应屏幕：把所有节点缩放到刚好完整显示。
 *  上限 1.4 是给圆周发散设的（内容铺得开）；「统一向右」内容又宽又扁，
 *  受宽度方向限制本就很小，若仍卡在 1.4 会缩成一小块，所以这里放宽上限。 */
function fitMap() {
  if (!nodeRects.length) { centerCam(); return; }
  const { w, h } = svgSize();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const r of nodeRects) {
    minX = Math.min(minX, r.x); minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.w); maxY = Math.max(maxY, r.y + r.h);
  }
  /* 留白按画布尺寸自适应：手机上画布可能只有 250px 宽，
     固定 60px 留白会吃掉一半，卡片被缩到看不清（实测 4 个节点挤成一小团）。
     桌面用 60，小屏按画布的 8% 且不低于 12px。 */
  const pad = Math.max(12, Math.min(60, Math.round(Math.min(w, h) * 0.08)));
  const bw = maxX - minX, bh = maxY - minY;
  cam.s = Math.min((w - pad * 2) / Math.max(bw, 1), (h - pad * 2) / Math.max(bh, 1), 2.2);
  cam.x = w / 2 - (minX + maxX) / 2 * cam.s;
  cam.y = h / 2 - (minY + maxY) / 2 * cam.s;
  applyCam();
}

/** 最小幅度平移相机，让指定节点进入可视区（"跟随新内容"）。
 *  原则：节点已在视口内 → 完全不动，不打扰用户当前的缩放和平移；
 *  跑出视口 → 只平移（不缩放）；节点本身比视口还大时才缩小到刚好装下。 */
function revealRect(r, margin = 30) {
  if (!r) return;
  const { w, h } = svgSize();
  let s = cam.s;
  const maxS = Math.min((w - margin * 2) / Math.max(r.w, 1), (h - margin * 2) / Math.max(r.h, 1));
  if (maxS < s) s = maxS;                              // 只缩不放，尊重用户缩放
  let nx = cam.x, ny = cam.y;
  const rx = r.x * s + nx, ry = r.y * s + ny;
  if (rx < margin) nx = margin - r.x * s;
  else if (rx + r.w * s > w - margin) nx = w - margin - r.w * s - r.x * s;
  if (ry < margin) ny = margin - r.y * s;
  else if (ry + r.h * s > h - margin) ny = h - margin - r.h * s - r.y * s;
  if (s !== cam.s || nx !== cam.x || ny !== cam.y) { cam.s = s; cam.x = nx; cam.y = ny; applyCam(); }
}

/** 新建后跟随：把刚创建的任务卡片 / 主线节点移入视野 */
function revealTask(taskId) {
  if (view !== 'map') return;
  const r = nodeRects.find(n => n.taskId === taskId);
  if (r) revealRect(r);
}

function revealLine(lineId) {
  if (view !== 'map') return;
  const r = nodeRects.find(n => n.lineId === lineId);
  if (r) revealRect(r);
}

/* ---- 思维导图渲染（径向布局：中心 → 主线 → 任务） ---- */
function renderMap() {
  const world = $('world');
  world.innerHTML = '';
  nodeRects = [];

  const lines = queryLines();
  $('mapEmpty').classList.toggle('show', lines.length === 0);
  if (!lines.length) return;

  const edgesG = svgEl('g');
  const nodesG = svgEl('g');
  world.appendChild(edgesG); world.appendChild(nodesG);

  /* 专用测量层：把文本临时挂进文档测量真实宽度（不参与展示，每帧清空） */
  const measureLayer = svgEl('g');
  world.appendChild(measureLayer);
  function measureIn(str, fontSize, fontWeight) {
    const t = svgEl('text', { 'font-size': fontSize, 'font-weight': fontWeight || 400 });
    t.textContent = str;
    measureLayer.appendChild(t);
    return measureText(t, str, fontSize);
  }

  const CW = 120, CH = 52;   // 中心节点尺寸
  const R1 = 240;            // 中心到主线的基础距离
  const LH = 46;             // 主线节点高度

  /* 两种显示方式：
       radial（默认）—— 主线沿圆周四周发散，朝左的分支向左展开；
       right —— 所有主线排成同一列（纵向下排），任务树一律向右展开。 */
  const rightward = getMapLayoutMode() === 'right';
  const GAP_X = 42;                                 // 父子层之间的水平间距
  const VGAP = 14;                                  // 同层卡片垂直间距

  /* ===== 第一遍：纯计算布局（尺寸 + 防重叠净空） ===== */

  /* 阶段 1：逐条主线构建"可见节点树"并量出树高（纵坐标此时还是相对值） */
  const blocks = lines.map((line, i) => {
    const color = lineColor(i);
    const tasks = queryTasks(line.id);
    const doneCount = tasks.filter(t => t.done).length;
    const tasksSorted = tasks.slice().sort((x, y) => x.createdAt - y.createdAt);

    /* 主线名称：真实测量 → 自适应宽度（超长才截断） */
    let dispName = line.title;
    let nameW = measureIn(dispName, 15, 700);
    const NAME_MAX = 320;
    if (nameW > NAME_MAX) {
      const chars = Array.from(dispName);
      while (chars.length > 2 &&
             estTextWidth(chars.slice(0, chars.length - 1).join('') + '…', 15) > NAME_MAX) {
        chars.pop();
      }
      dispName = chars.join('') + '…';
      nameW = estTextWidth(dispName, 15);
    }
    const LW = Math.max(110, Math.round(nameW) + 44);

    /* 任务树：递归构建"可见节点树"（折叠的子树不再计算和绘制，深层嵌套也不卡） */
    const build = (task, depth) => {
      const wrapped = wrapText(task.title, 14, 3);
      const hasInfo = !!(task.due || task.scope === 'multi');
      const TH = 36 + (wrapped.length - 1) * 17 + (hasInfo ? 19 : 0);
      const infoParts = buildInfoParts(task);
      let infoW = 0;
      infoParts.forEach((p, idx) => { infoW += estTextWidth(p.text, 11) + (idx ? 14 : 0); });
      let maxTitleW = 0;
      wrapped.forEach(ln => { maxTitleW = Math.max(maxTitleW, measureIn(ln, 13)); });
      const TW = Math.max(122, Math.round(Math.max(maxTitleW, infoW)) + 52);
      const node = { task, wrapped, TH, TW, infoParts, depth, kids: [], x: 0, y: 0 };
      // 折叠：子节点不建不画；展开：递归（深度受数据本身限制，上限 MAX_DEPTH）
      if (!task.collapsed && depth < MAX_DEPTH) {
        node.kids = childTasks(task.id).map(k => build(k, depth + 1));
      }
      node.hiddenKids = childTasks(task.id).length;
      return node;
    };
    const tree = tasksSorted.filter(t => !t.parentId).map(t => build(t, 1));

    /* 后序分配纵坐标：叶子依次下排，父节点居中于子节点 */
    let cursorY = 0;
    const assignY = nodes => {
      nodes.forEach(n => {
        if (n.kids.length) {
          assignY(n.kids);
          n.y = (n.kids[0].y + n.kids[n.kids.length - 1].y) / 2;
        } else {
          n.y = cursorY + n.TH / 2;
          cursorY += n.TH + VGAP;
        }
      });
    };
    assignY(tree);
    const treeH = Math.max(cursorY - VGAP, 0);

    return { line, color, tasks, doneCount, dispName, LW, tree, treeH,
             dir: { x: 1, y: 0 }, sign: 1, lx: 0, ly: 0 };
  });

  /* 阶段 2：按显示方式给每条主线定坐标（决定朝哪边展开） */
  if (rightward) {
    const maxLW = blocks.reduce((mx, b) => Math.max(mx, b.LW), 0);
    const colX = Math.max(R1, CW / 2 + maxLW / 2 + 28);   // 整列主线左对齐，不压中心节点
    const BLOCK_GAP = 56;                                 // 相邻主线块之间的纵向间距
    const totalH = blocks.reduce((s, b) => s + Math.max(b.treeH, LH) + BLOCK_GAP, -BLOCK_GAP);
    let y = -totalH / 2;
    blocks.forEach(b => {
      const blockH = Math.max(b.treeH, LH);               // 没有任务时也留出主线自身的高度
      b.lx = colX;
      b.ly = y + blockH / 2;
      y += blockH + BLOCK_GAP;
      b.dir = { x: 1, y: 0 };
      b.sign = 1;                                         // 统一向右展开
    });
  } else {
    blocks.forEach((b, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / blocks.length;
      const dir = { x: Math.cos(a), y: Math.sin(a) };
      const R1eff = Math.max(R1, CW / 2 + b.LW / 2 + 28);   // 主线不压中心节点
      b.dir = dir;
      b.lx = dir.x * R1eff;
      b.ly = dir.y * R1eff;
      b.sign = dir.x >= 0 ? 1 : -1;                       // 向哪个方向展开（左/右）
    });
  }

  /* 阶段 3：整棵子树围绕主线节点垂直居中，并逐层向展开方向推进 */
  blocks.forEach(b => {
    const yShift = b.ly - b.treeH / 2;
    const shiftY = nodes => nodes.forEach(n => { n.y += yShift; shiftY(n.kids); });
    shiftY(b.tree);

    const placeX = (n, startX) => {
      n.x = startX + b.sign * n.TW / 2;
      n.kids.forEach(k => placeX(k, n.x + b.sign * (n.TW / 2 + GAP_X)));
    };
    b.tree.forEach(n => placeX(n, b.lx + b.sign * (b.LW / 2 + GAP_X)));
  });

  const layout = blocks;

  measureLayer.innerHTML = '';   // 测量完成，清空测量层

  /* ===== 第二遍：分层渲染（任务 → 主线 → 中心）
     绘制层级即点击优先级：主线的 ＋/✕ 按钮、中心节点永远在任务卡片之上，
     即使极端布局下有视觉交叠，按钮也不会被卡片挡住点击 ===== */

  /* ---- 任务卡片（最底层）：递归绘制整棵树 ---- */
  layout.forEach(L => {
    const drawNode = (n, parentNode) => {
      const { task, wrapped, TH, TW, infoParts } = n;
      const tx = n.x, ty = n.y;

      const tG = svgEl('g', {
        class: 'node task-node' + (task.done ? ' done' : '') + (task.focus ? ' focus' : '')
                               + (task.longTerm ? ' long' : '')
      });

      /* 卡片背景 */
      tG.appendChild(svgEl('rect', {
        class: 'task-rect',
        x: tx - TW / 2, y: ty - TH / 2, width: TW, height: TH, rx: 9,
        fill: task.done ? '#eef4f0' : '#fff',
        stroke: task.done ? '#b8d8c6' : '#d7dfeb', 'stroke-width': 1.5
      }));

      /* 父 → 子 连线（父子关系与层级一目了然） */
      const fromX = parentNode ? parentNode.x + L.sign * parentNode.TW / 2 : L.lx + L.sign * L.LW / 2;
      const fromY = parentNode ? parentNode.y : L.ly;
      edgesG.appendChild(svgEl('path', {
        class: 'edge',
        d: edgePath(fromX, fromY, tx - L.sign * TW / 2, ty),
        stroke: L.color, opacity: task.done ? 0.35 : 0.8
      }));

      /* 勾选框（对齐首行标题） */
      tG.appendChild(svgEl('rect', {
        class: 'chk',
        x: tx - TW / 2 + 10, y: ty - TH / 2 + 7, width: 18, height: 18, rx: 5,
        fill: task.done ? '#2ea86f' : '#fff',
        stroke: task.done ? '#2ea86f' : '#b8c2d0', 'stroke-width': 1.8
      }));
      if (task.done) {
        const tick = svgEl('text', {
          x: tx - TW / 2 + 19, y: ty - TH / 2 + 21, 'text-anchor': 'middle',
          fill: inkOn('#2ea86f'), 'font-size': 13, 'font-weight': 700
        });
        tick.textContent = '✓'; tG.appendChild(tick);
      }

      /* 「今日处理」徽标：卡片右上角 ☀（样式联动见 CSS .task-node.focus） */
      if (task.focus) {
        const FBX = tx + TW / 2 - 12, FBY = ty - TH / 2;
        const fb = svgEl('g');
        fb.appendChild(svgEl('circle', { cx: FBX, cy: FBY, r: 9, fill: '#e5a13a' }));
        const fbTxt = svgEl('text', {
          x: FBX, y: FBY + 3.5, 'text-anchor': 'middle',
          fill: inkOn('#e5a13a'), 'font-size': 10, 'font-weight': 700
        });
        fbTxt.textContent = '☀'; fb.appendChild(fbTxt);
        const fbTip = svgEl('title');
        fbTip.textContent = '已在「今日处理」中';
        fb.appendChild(fbTip);
        tG.appendChild(fb);
      }

      /* 标题文字（尺寸已在第一遍算好） */
      wrapped.forEach((ln, li) => {
        const t = svgEl('text', {
          class: 'task-text',
          x: tx - TW / 2 + 36, y: ty - TH / 2 + 21 + li * 17,
          fill: '#24292f', 'font-size': 13,
          'text-decoration': task.done ? 'line-through' : 'none'
        });
        t.textContent = ln;
        tG.appendChild(t);
      });

      /* 信息行：倒计时 + 截止日期 + 参与方式（逾期红色、紧急琥珀色） */
      if (infoParts.length) {
        const iy = ty + TH / 2 - 7;
        let ix = tx - TW / 2 + 36;
        for (const p of infoParts) {
          /* 默认色交给 CSS 类 .info-text{fill:var(--muted)}（原本硬编码 #98a1b0，
             那是深色模式的灰，压在浅色卡片上只有 2.61:1 —— 导图信息行几乎读不出来）。
             逾期红 / 紧急琥珀仍按语义色硬编码，两种模式下都在 4.5:1 以上。 */
          const t = svgEl('text', {
            class: (p.color || p.over || p.urgent) ? '' : 'info-text',
            x: ix, y: iy, 'font-size': 11,
            fill: p.color || (p.over ? '#e5484d' : (p.urgent ? '#e5a13a' : '#98a1b0')),
            'font-weight': (p.color || p.over || p.urgent) ? 700 : 400
          });
          t.textContent = p.text;
          tG.appendChild(t);
          ix += estTextWidth(p.text, 11) + 14;
        }
      }

      const tTip = svgEl('title');
      const cdTip = countdownText(task);
      tTip.textContent = task.title
        + (task.longTerm ? '\n♾ 长期任务：不设截止日期，每天首次打开自动进入今日处理' : '')
        + (task.due ? `\n📅 截止：${fmtDue(task.due)}${cdTip ? `（${cdTip.text}）` : (isOverdue(task) ? '（已逾期）' : '')}` : '')
        + (task.scope === 'multi'
            ? `\n👥 参与人：${task.assignees && task.assignees.length ? task.assignees.join('、') : '未填写'}`
            : '\n👤 单人任务')
        + `\n创建于 ${fmtTime(task.createdAt)}${task.done ? '\n完成于 ' + fmtTime(task.doneAt) : ''}`
        + (task.focus ? '\n☀ 已在「今日处理」中' : '')
        + '\n（单击勾选完成，双击编辑，拖到右侧加入今日处理）';
      tG.appendChild(tTip);

      /* 悬停删除按钮：固定挂在卡片右缘（+6），与卡片边缘重叠，不留空隙
         注意：右缘中段是删除按钮的专属位置，其它按钮都要避开它 */
      const TDEL_CX = tx + TW / 2 + 6;
      const tdel = svgEl('g', { class: 'hoverbtn', cursor: 'pointer' });
      tdel.appendChild(svgEl('circle', {
        cx: TDEL_CX, cy: ty, r: 12, fill: '#e5484d', opacity: 0.92
      }));
      const tdelTxt = svgEl('text', {
        x: TDEL_CX, y: ty + 4.5, 'text-anchor': 'middle',
        fill: inkOn('#e5484d'), 'font-size': 13, 'font-weight': 700
      });
      tdelTxt.textContent = '✕'; tdel.appendChild(tdelTxt);
      const tdTip = svgEl('title'); tdTip.textContent = '删除任务'; tdel.appendChild(tdTip);
      tdel.addEventListener('click', e => { e.stopPropagation(); removeTask(task.id); });
      tG.appendChild(tdel);

      /* 折叠 / 展开按钮：有子任务才显示，折叠时带子任务数量。
         它挂在"子任务方向"那一侧的连线上：
           · 子任务朝左（sign<0）：卡片右缘是空的，放 −9 即可，和删除按钮分列两侧；
           · 子任务朝右（sign>0）：和删除按钮同在右侧，原先两者圆心只差 3px（r=9 / r=12）
             几乎完全重叠。现在把它挪到父子连线中段（+30），圆心相距 24px > 9+12=21px，
             水平净距 3px；父子通道宽 42px，圆右缘 right+39 距子卡片左缘 right+42 仍有 3px。
         这样无论展开/折叠、标题多长、屏幕多窄，两个按钮都不会互相遮挡。 */
      if (n.hiddenKids > 0) {
        const CBX = tx + L.sign * (TW / 2 + (L.sign > 0 ? 30 : 9));
        const cb = svgEl('g', { class: 'collapse-btn', cursor: 'pointer' });
        cb.appendChild(svgEl('circle', { class: 'collapse-btn-bg', cx: CBX, cy: ty, r: 9, stroke: L.color, 'stroke-width': 2 }));
        /* 圆底已是 var(--card)，符号用 --text 才在两种模式下都 >=4.5:1；
           原先用主线色 L.color，浅色 graphite #4a5568 压白底只有 2.0:1（按钮等于消失）。*/
        const cbTxt = svgEl('text', {
          class: 'collapse-btn-txt',
          x: CBX, y: ty + (task.collapsed ? 3.5 : 4), 'text-anchor': 'middle',
          'font-size': task.collapsed ? 9 : 13, 'font-weight': 700
        });
        cbTxt.textContent = task.collapsed ? String(n.hiddenKids) : '−';
        cb.appendChild(cbTxt);
        const cbTip = svgEl('title');
        cbTip.textContent = task.collapsed ? `展开 ${n.hiddenKids} 个子任务` : '折叠子任务';
        cb.appendChild(cbTip);
        cb.addEventListener('click', e => { e.stopPropagation(); toggleCollapse(task.id); });
        tG.appendChild(cb);
      }

      /* ＋ 子任务：在卡片右下角（已达上限则不再显示） */
      if (n.depth < MAX_DEPTH) {
        /* 右下角：比原先再往左 9px，让出删除按钮（右缘 +6，r=12）的位置，
           矮卡片（36px 高）时两者不再咬掉彼此的角 */
        const ABX = tx + TW / 2 - 20, ABY = ty + TH / 2;
        const ab = svgEl('g', { class: 'hoverbtn', cursor: 'pointer' });
        ab.appendChild(svgEl('circle', { cx: ABX, cy: ABY, r: 11, fill: L.color }));
        const abTxt = svgEl('text', {
          x: ABX, y: ABY + 4.5, 'text-anchor': 'middle', fill: inkOn(L.color), 'font-size': 14, 'font-weight': 700
        });
        abTxt.textContent = '＋'; ab.appendChild(abTxt);
        const abTip = svgEl('title'); abTip.textContent = '在此任务下新建子任务'; ab.appendChild(abTip);
        ab.addEventListener('click', e => { e.stopPropagation(); openTaskDialog('create', task.lineId, null, task.id); });
        tG.appendChild(ab);
      }

      tG.addEventListener('click', () => {
        if (suppressNextClick) return;   // 刚拖完，忽略这次 click，防止误勾选
        toggleTaskDone(task.id);
      });
      tG.addEventListener('dblclick', e => { e.stopPropagation(); openTaskDialog('edit', null, task); });
      enableTaskDrag(tG, task);
      nodesG.appendChild(tG);
      nodeRects.push({ taskId: task.id, x: tx - TW / 2, y: ty - TH / 2, w: TW + 36, h: TH });

      n.kids.forEach(k => drawNode(k, n));   // 递归绘制子层级
    };
    L.tree.forEach(n => drawNode(n, null));
  });

  /* ---- 主线节点（含 ＋/✕ 悬停按钮，渲染在任务卡片之上） ---- */
  layout.forEach(L => {
    const { line, color, dir, lx, ly, LW, dispName, tasks, doneCount } = L;

    const lineG = svgEl('g', { class: 'node' });
    lineG.appendChild(svgEl('rect', {
      class: 'line-rect',
      x: lx - LW / 2, y: ly - LH / 2, width: LW, height: LH, rx: 12,
      fill: '#fff', stroke: color, 'stroke-width': 2.5
    }));
    const lineName = svgEl('text', {
      x: lx, y: ly - 2, 'text-anchor': 'middle', fill: color,
      'font-size': 15, 'font-weight': 700
    });
    lineName.textContent = dispName;
    lineG.appendChild(lineName);
    const lineCnt = svgEl('text', {
      class: 'muted-text',
      x: lx, y: ly + 15, 'text-anchor': 'middle', fill: '#9aa3af', 'font-size': 11
    });
    lineCnt.textContent = `${doneCount}/${tasks.length} 已完成`;
    lineG.appendChild(lineCnt);
    const lTip = svgEl('title');
    lTip.textContent = `${line.title}（双击重命名）`;
    lineG.appendChild(lTip);

    /* 悬停按钮：＋加任务、✕删主线
       按钮与节点边缘重叠（不留空隙），鼠标移过去不会丢失悬停状态 */
    const ADD_CX = lx + LW / 2 + 6, ADD_CY = ly - LH / 2 + 11;
    const addBtn = svgEl('g', { class: 'hoverbtn', cursor: 'pointer' });
    addBtn.appendChild(svgEl('circle', {
      cx: ADD_CX, cy: ADD_CY, r: 13, fill: color
    }));
    const addTxt = svgEl('text', {
      x: ADD_CX, y: ADD_CY + 5, 'text-anchor': 'middle',
      fill: inkOn(color), 'font-size': 15, 'font-weight': 700
    });
    addTxt.textContent = '＋'; addBtn.appendChild(addTxt);
    const aTip = svgEl('title'); aTip.textContent = '添加任务'; addBtn.appendChild(aTip);
    addBtn.addEventListener('click', e => { e.stopPropagation(); openTaskDialog('create', line.id); });
    lineG.appendChild(addBtn);

    const DEL_CX = lx + LW / 2 + 6, DEL_CY = ly + LH / 2 - 11;
    const delBtn = svgEl('g', { class: 'hoverbtn', cursor: 'pointer' });
    delBtn.appendChild(svgEl('circle', {
      cx: DEL_CX, cy: DEL_CY, r: 13, fill: '#e5484d'
    }));
    const delTxt = svgEl('text', {
      x: DEL_CX, y: DEL_CY + 4, 'text-anchor': 'middle',
      fill: inkOn('#e5484d'), 'font-size': 13, 'font-weight': 700
    });
    delTxt.textContent = '✕'; delBtn.appendChild(delTxt);
    const dTip = svgEl('title'); dTip.textContent = '删除主线'; delBtn.appendChild(dTip);
    delBtn.addEventListener('click', e => { e.stopPropagation(); removeLine(line.id); });
    lineG.appendChild(delBtn);

    lineG.addEventListener('dblclick', () => askInput('重命名主线', '修改主线名称', line.title, v => renameLine(line.id, v)));

    /* 中心 → 主线 连线 */
    const sx = dir.x * (CW / 2 + 4), sy = dir.y * (CH / 2 + 4);
    edgesG.appendChild(svgEl('path', {
      class: 'edge', d: edgePath(sx, sy, lx - dir.x * LW / 2, ly), stroke: color
    }));

    nodesG.appendChild(lineG);
    nodeRects.push({ lineId: line.id, x: lx - LW / 2, y: ly - LH / 2, w: LW + 38, h: LH });
  });

  /* ---- 中心节点（最顶层） ---- */
  const centerG = svgEl('g', { class: 'node' });
  centerG.appendChild(svgEl('rect', {
    class: 'center-rect',
    x: -CW / 2, y: -CH / 2, width: CW, height: CH, rx: 26,
    fill: '#24292f'
  }));
  const centerText = svgEl('text', {
    class: 'center-text', x: 0, y: 6, 'text-anchor': 'middle', fill: '#fff',
    'font-size': 17, 'font-weight': 700
  });
  centerText.textContent = '任务线';
  centerG.appendChild(centerText);
  const cTip = svgEl('title'); cTip.textContent = '双击可新建主线'; centerG.appendChild(cTip);
  centerG.addEventListener('dblclick', () => askInput('新建主线', '为主线起个名字（如：工作、学习、生活）', '', v => addLine(v)));
  nodesG.appendChild(centerG);
  nodeRects.push({ x: -CW / 2, y: -CH / 2, w: CW, h: CH });
}

/** 信息行内容（倒计时 + 截止日期 + 参与方式），供任务卡片布局与渲染复用 */
function buildInfoParts(task) {
  const parts = [];
  if (task.longTerm) parts.push({ text: LONG_TAG, color: longColor() });
  const cd = countdownText(task);
  if (cd) parts.push({ text: cd.text, over: cd.over, urgent: cd.urgent });
  if (task.due) {
    parts.push({ text: (isOverdue(task) ? '⚠ ' : '📅 ') + fmtDue(task.due), over: isOverdue(task) });
  }
  if (task.scope === 'multi') {
    let names = task.assignees && task.assignees.length ? task.assignees.join('、') : '多人协作';
    if (Array.from(names).length > 12) names = Array.from(names).slice(0, 12).join('') + '…';
    parts.push({ text: '👥 ' + names, over: false });
  } else if (task.due) {
    parts.push({ text: '👤 单人', over: false });
  }
  return parts;
}

/* ---- 思维导图交互：滚轮缩放 / 拖拽平移 ---- */
(function initMapInteract() {
  const svg = $('mapSvg');
  let panning = false, lastX = 0, lastY = 0;

  svg.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = svg.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    const f = e.deltaY < 0 ? 1.12 : 0.89;
    const wx = (px - cam.x) / cam.s, wy = (py - cam.y) / cam.s;
    cam.s = Math.max(0.15, Math.min(3, cam.s * f));
    cam.x = px - wx * cam.s;
    cam.y = py - wy * cam.s;
    applyCam();
  }, { passive: false });

  svg.addEventListener('pointerdown', e => {
    if (e.target.closest('.node')) return;   // 节点上的操作不触发平移
    /* 只在单指时拦截默认行为：多指（捏合缩放）必须放行给浏览器，
       否则 preventDefault 会连页面缩放一起吃掉，手机上就放不大画布了。 */
    if (e.isPrimary && e.pointerType !== 'touch') e.preventDefault();
    panning = true; lastX = e.clientX; lastY = e.clientY;
    svg.classList.add('panning');
    document.body.classList.add('dragging');
    if (window.getSelection) window.getSelection().removeAllRanges();
    try { svg.setPointerCapture(e.pointerId); } catch (_) {}
  });
  svg.addEventListener('pointermove', e => {
    if (!panning) return;
    cam.x += e.clientX - lastX;
    cam.y += e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    applyCam();
  });
  const endPan = () => { panning = false; svg.classList.remove('panning'); document.body.classList.remove('dragging'); };
  svg.addEventListener('pointerup', endPan);
  svg.addEventListener('pointercancel', endPan);

  $('zoomIn').onclick = () => { const { w, h } = svgSize(); zoomAt(w / 2, h / 2, 1.2); };
  $('zoomOut').onclick = () => { const { w, h } = svgSize(); zoomAt(w / 2, h / 2, 0.83); };
  $('zoomFit').onclick = fitMap;

  function zoomAt(px, py, f) {
    const wx = (px - cam.x) / cam.s, wy = (py - cam.y) / cam.s;
    cam.s = Math.max(0.15, Math.min(3, cam.s * f));
    cam.x = px - wx * cam.s; cam.y = py - wy * cam.s;
    applyCam();
  }
})();

/* =====================================================================
 * 第四部分 B：列表视图（保留原有交互）
 * ===================================================================== */
function toast(msg) {
  const el = $('toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

function render() {
  if (view === 'map') renderMap();
  else if (view === 'list') { renderLines(); renderTasks(); }
  else renderCalendar();
  renderPanel();
}

/* ---------- 日历视图：按截止日期查看全部主线的任务 ---------- */

/** 日历当前显示的月份（内部锚点，1-based） */
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth() + 1;
let calShowDone = false;          // 已完成默认隐藏，可勾选显示

/** 某天是周几（0=周一 … 6=周日），与表头「一二三四五六日」一致 */
function weekdayMon(ts) { return (new Date(ts).getDay() + 6) % 7; }

/** 收集日历数据：把带截止日的任务按日期分桶，另收没有截止日的任务。
 *  已完成默认不显示（勾选"显示已完成"才出现）。 */
function collectCalendar() {
  const byDate = new Map();
  const noDue = [];
  const liveLines = queryLines();
  const lineMap = new Map(liveLines.map((l, i) => [l.id, l]));
  const colorMap = new Map(liveLines.map((l, i) => [l.id, lineColor(i)]));

  state.tasks.forEach(t => {
    if (t.deleted) return;
    if (t.done && !calShowDone) return;
    if (!lineMap.has(t.lineId)) return;      // 主线已被删除的任务不进日历
    if (!t.due) { noDue.push(t); return; }
    const key = todayKey(t.due);             // due 是当天 0 点起的毫秒
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push({ task: t, color: colorMap.get(t.lineId) });
  });

  /* 同一天内：未完成在前，再按主线顺序、创建时间排 */
  byDate.forEach(list => list.sort((a, b) =>
    (a.task.done - b.task.done) || (a.task.createdAt - b.task.createdAt)));
  noDue.sort((a, b) => (a.done - b.done) || (a.createdAt - b.createdAt));
  return { byDate, noDue };
}

/** 生成日历网格：一个固定 6×7 的月视图（含上下月补位，周一起始） */
function renderCalendar() {
  const { byDate, noDue } = collectCalendar();
  const first = new Date(calYear, calMonth - 1, 1);
  const lead = weekdayMon(first.getTime());
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const gridStart = new Date(calYear, calMonth - 1, 1 - lead);
  const today = todayKey();

  $('calTitle').textContent = `${calYear} 年 ${calMonth} 月`;
  const grid = $('calGrid');
  grid.innerHTML = '';

  let monthCount = 0;
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart.getTime() + i * 86400000);
    const key = todayKey(d.getTime());
    const inMonth = d.getMonth() === calMonth - 1 && d.getFullYear() === calYear;
    const items = byDate.get(key) || [];

    const cell = document.createElement('div');
    cell.className = 'cal-cell'
      + (inMonth ? '' : ' out')
      + (key === today ? ' today' : '')
      + (d.getDay() === 0 || d.getDay() === 6 ? ' weekend' : '');

    const day = document.createElement('div');
    day.className = 'cal-day';
    day.textContent = String(d.getDate());
    cell.appendChild(day);

    if (inMonth && items.length) monthCount += items.length;

    /* 格子固定高度，最多显示 3 条；更多时可滚动查看，"还有 N 个"仅作数量提示 */
    const MAX_SHOW = 3;
    const wrap = document.createElement('div');
    wrap.className = 'cal-items';
    items.slice(0, Math.max(MAX_SHOW, items.length)).forEach(({ task, color }) => {
      const it = document.createElement('div');
      it.className = 'cal-item'
        + (task.done ? ' done' : '')
        + (isOverdue(task) ? ' over' : '')
        + (task.longTerm ? ' long' : '');
      if (color) it.style.borderLeftColor = color;
      it.textContent = task.title;
      it.title = `${task.title}\n📅 截止：${fmtDue(task.due)}`
        + (task.done ? `\n✅ 已完成（点击可取消）` : `\n单击标记完成 · 双击编辑`)
        + (task.scope === 'multi'
            ? `\n👥 ${(task.assignees || []).join('、') || '多人协作'}` : '');
      it.onclick = (e) => { e.stopPropagation(); toggleTaskDone(task.id); };
      it.ondblclick = (e) => { e.stopPropagation(); openTaskDialog('edit', null, task); };
      wrap.appendChild(it);
    });
    cell.appendChild(wrap);
    if (items.length > MAX_SHOW) cell.title = `共 ${items.length} 个任务，可滚动查看`;
    grid.appendChild(cell);
  }

  $('calEmpty').style.display = monthCount ? 'none' : '';

  /* 右侧：无截止日期的任务（含长期任务） */
  $('calNoDueCount').textContent = noDue.length ? String(noDue.length) : '';
  $('calSideTitle').textContent = noDue.length ? '没有截止日期' : '本视图之外';
  const side = $('calNoDueList');
  side.innerHTML = '';
  if (!noDue.length) {
    const empty = document.createElement('div');
    empty.style.cssText = 'font-size:12px;color:var(--muted);line-height:1.6';
    empty.textContent = '所有任务都已在日历上安排好 ✓';
    side.appendChild(empty);
  } else {
    noDue.slice(0, 80).forEach(t => {
      const lineIdx = queryLines().findIndex(l => l.id === t.lineId);
      const it = document.createElement('div');
      it.className = 'cal-item'
        + (t.done ? ' done' : '') + (t.longTerm ? ' long' : '');
      if (lineIdx >= 0) it.style.borderLeftColor = lineColor(lineIdx);
      it.textContent = (t.longTerm ? '♾ ' : '') + t.title;
      it.title = `${t.title}\n${t.longTerm ? '♾ 长期任务：不设截止日期' : '未设置截止日期'}`
        + `\n主线：${(queryLines()[lineIdx] || {}).title || '未知'}`
        + '\n单击标记完成 · 双击编辑';
      it.onclick = (e) => { e.stopPropagation(); toggleTaskDone(t.id); };
      it.ondblclick = (e) => { e.stopPropagation(); openTaskDialog('edit', null, t); };
      side.appendChild(it);
    });
  }
}

/** 切换月份（delta = -1 上个月 / +1 下个月） */
function moveCalendarMonth(delta) {
  let m = calMonth + delta, y = calYear;
  if (m < 1) { m = 12; y--; }
  if (m > 12) { m = 1; y++; }
  calMonth = m; calYear = y;
  renderCalendar();
}

/** 跨过零点后，若日历停在当月，"今天"高亮要跟着移动；
 *  已翻到别的月份则保持用户的浏览位置不动。 */
function rollCalendarToday() {
  const now = new Date();
  const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth() + 1;
  if (isCurrentMonth) renderCalendar();
}

/* ---------- 「今日处理」面板渲染与拖拽 ---------- */
let suppressNextClick = false;   // 拖拽结束后抑制紧随的 click（防止误勾选）

/** 渲染右侧面板：与任务线共用同一份数据，勾选/编辑实时同步 */
function renderPanel() {
  const list = queryFocused();
  $('tpCount').textContent = list.length;
  $('tpHint').style.display = list.length ? 'none' : '';
  $('tpClear').style.display = list.some(t => t.done) ? '' : 'none';
  const box = $('tpList');
  box.innerHTML = '';
  list.forEach(task => {
    const line = state.lines.find(l => l.id === task.lineId && !l.deleted);
    const cd = countdownText(task);
    const meta = [
      task.longTerm ? LONG_TAG : '',
      line ? line.title : '',
      cd ? '⏳ ' + cd.text : '',
      task.due && !cd ? '· 📅 ' + fmtDue(task.due) : ''
    ].filter(Boolean).join(' · ');
    const div = document.createElement('div');
    div.className = 'tp-item' + (task.done ? ' done' : '');
    div.innerHTML = `
      <div class="tp-check" title="标记完成 / 取消">${task.done ? '✓' : ''}</div>
      <div class="tp-body">
        <div class="tp-title">${esc(task.title)}</div>
        <div class="tp-meta">${esc(meta)}</div>
      </div>
      <button class="tp-out" title="移出今日处理">↩</button>`;
    div.querySelector('.tp-check').onclick = () => toggleTaskDone(task.id);
    div.querySelector('.tp-title').onclick = () => openTaskDialog('edit', null, task);
    div.querySelector('.tp-out').onclick = () => setFocus(task.id, false);
    box.appendChild(div);
  });
}

/** 判断鼠标点是否落在「今日处理」面板上 */
function isOverPanel(x, y) {
  const panel = $('todayPanel');
  if (!panel || !panel.getBoundingClientRect) return false;
  const r = panel.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

/** 屏幕坐标 → 思维导图世界坐标（用于命中测试） */
function worldPointAt(clientX, clientY) {
  const svg = $('mapSvg');
  const r = svg.getBoundingClientRect();
  return { x: (clientX - r.left - cam.x) / cam.s, y: (clientY - r.top - cam.y) / cam.s };
}

/** 命中测试：指针下是否有任务卡片（返回 taskId） */
function nodeAt(clientX, clientY) {
  const p = worldPointAt(clientX, clientY);
  for (let i = nodeRects.length - 1; i >= 0; i--) {
    const r = nodeRects[i];
    if (!r.taskId) continue;
    if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return r.taskId;
  }
  return null;
}

/** 为思维导图任务卡片启用拖拽：
 *  ① 拖到右侧「今日处理」面板 = 加入今日处理
 *  ② 拖到另一张任务卡片上 = 成为它的子任务（可跨主线；含层数上限与循环校验）
 *  移动超过 7px 判定为拖拽；否则按原有单击（勾选完成）处理 */
function enableTaskDrag(tG, task) {
  tG.addEventListener('pointerdown', e => {
    /* 防止鼠标按下后移动被浏览器当成文本框选（选中页面文字）。
       但双指（捏合缩放）必须放行 —— 无条件 preventDefault 会让手机放不大画布。 */
    if (e.isPrimary && e.pointerType !== 'touch') e.preventDefault();
    const dc = { x: e.clientX, y: e.clientY, moved: false, ghost: null };

    const onMove = ev => {
      if (!dc.moved &&
          Math.hypot(ev.clientX - dc.x, ev.clientY - dc.y) > 7) {
        dc.moved = true;
        /* 拖拽开始：全页禁用文本选中 + 清除已产生的选区 */
        document.body.classList.add('dragging');
        if (window.getSelection) window.getSelection().removeAllRanges();
        const g = document.createElement('div');
        g.className = 'drag-ghost';
        g.textContent = task.title;
        document.body.appendChild(g);
        dc.ghost = g;
        $('todayPanel').classList.add('drop-ready');
      }
      if (dc.ghost) {
        dc.ghost.style.left = (ev.clientX + 12) + 'px';
        dc.ghost.style.top = (ev.clientY + 12) + 'px';
        $('todayPanel').classList.toggle('drop-hot', isOverPanel(ev.clientX, ev.clientY));
      }
    };

    const onUp = ev => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.classList.remove('dragging');   // 松手即恢复可选中
      $('todayPanel').classList.remove('drop-ready', 'drop-hot');
      if (dc.ghost) dc.ghost.remove();
      if (dc.moved) {
        suppressNextClick = true;
        setTimeout(() => { suppressNextClick = false; }, 0);
        if (isOverPanel(ev.clientX, ev.clientY)) {
          setFocus(task.id, true);
          toast(`已加入「今日处理」：${task.title}`);
        } else {
          const targetId = nodeAt(ev.clientX, ev.clientY);      // 落在别的卡片上 → 成为其子任务
          if (targetId && targetId !== task.id) {
            const target = taskIndex().get(targetId);
            if (target) {
              const ok = moveTask(task.id, targetId, childTasks(targetId).length, target.lineId);
              if (ok) toast(`「${task.title}」已移入「${target.title}」下`);
            }
          }
        }
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });
}

function renderLines() {
  const lines = queryLines();
  $('lineCount').textContent = `${lines.length} 条`;
  const box = $('lineList');
  box.innerHTML = '';
  lines.forEach(line => {
    const tasks = state.tasks.filter(t => !t.deleted && t.lineId === line.id);
    const done = tasks.filter(t => t.done).length;
    const div = document.createElement('div');
    div.className = 'line-item' + (line.id === currentLineId ? ' active' : '');
    div.innerHTML = `
      <span class="name">${esc(line.title)}</span>
      <span class="mini">${done}/${tasks.length}</span>
      <button class="del" title="删除主线">✕</button>`;
    div.onclick = (e) => {
      if (e.target.classList.contains('del')) { removeLine(line.id); return; }
      currentLineId = line.id;
      render();
    };
    div.ondblclick = () => askInput('重命名主线', '修改主线名称', line.title, v => renameLine(line.id, v));
    box.appendChild(div);
  });
  const cur = lines.find(l => l.id === currentLineId);
  if (!cur && lines.length) currentLineId = lines[0].id;
  $('currentLineName').textContent = cur ? cur.title : '请先创建主线';
}

/* =====================================================================
 * 任务树渲染（列表视图）：任意深度嵌套
 *   · 只渲染"展开且落在可视区域"的行（虚拟滚动），几千个深层节点也不卡
 *   · 缩进体现层级，▶/▼ 折叠展开，面包屑展示完整路径
 *   · 拖拽可改层级与排序：拖到卡片中部=成为其子任务，拖到上下边缘=插到其前/后
 * ===================================================================== */
const ROW_H = 60;        // 行高（52px 卡片 + 8px 间距）
const INDENT_W = 22;     // 每层缩进宽度
let treeRows = [];       // 当前主线可见行（数据变化时重建）
let selectedTaskId = null;

/** 过滤条件命中判断 */
function taskMatches(t) {
  if (filter === 'todo') return !t.done;
  if (filter === 'done') return t.done;
  return true;
}

/** 深度优先展开可见行；被折叠的子树不展开；
 *  过滤时：自身不命中但子树有命中项的节点保留为"上下文行"（半透明，不参与操作） */
function buildTreeRows() {
  const rows = [];
  const walk = (parentId, depth) => {
    childrenOf(currentLineId, parentId).forEach(t => {
      const kids = childTasks(t.id);
      const self = taskMatches(t);
      const keep = self || descendantsOf(t.id).some(taskMatches);
      if (!keep) return;
      rows.push({ task: t, depth, ctx: !self, hasKids: kids.length > 0, kidCount: kids.length });
      if (!t.collapsed) walk(t.id, depth + 1);
    });
  };
  walk(null, 0);
  treeRows = rows;
}

/** 任务在同层中的序号 */
function siblingIndex(t) {
  return childrenOf(t.lineId, t.parentId).findIndex(x => x.id === t.id);
}

function renderTasks() {
  const all = state.tasks.filter(t => !t.deleted && t.lineId === currentLineId);
  const done = all.filter(t => t.done).length;
  const maxD = all.length ? Math.max(...all.map(depthOf)) : 0;
  $('stat').textContent = all.length
    ? `共 ${all.length} 项 · 已完成 ${done} 项 · 最深 ${maxD} 层`
    : '';

  buildTreeRows();
  const box = $('taskList');
  box.style.height = (treeRows.length * ROW_H) + 'px';
  $('emptyTip').style.display = treeRows.length ? 'none' : 'block';
  renderTaskWindow();
  renderCrumb();
}

/** 只渲染可视区域内的行（虚拟滚动） */
function renderTaskWindow() {
  const box = $('taskList');
  const scroll = $('taskScroll');
  box.innerHTML = '';
  if (!treeRows.length) return;
  const viewH = (scroll && scroll.clientHeight) || 600;
  const top = (scroll && scroll.scrollTop) || 0;
  const start = Math.max(0, Math.floor(top / ROW_H) - 4);
  const end = Math.min(treeRows.length, Math.ceil((top + viewH) / ROW_H) + 4);

  const frag = document.createDocumentFragment();
  for (let i = start; i < end; i++) frag.appendChild(buildRow(treeRows[i], i));
  box.appendChild(frag);
}

function buildRow(row, i) {
  const { task, depth, ctx, hasKids, kidCount } = row;
  const cd = countdownText(task);
  const chips = [
    task.longTerm ? `<span class="chip long">${LONG_TAG}</span>` : '',
    cd ? `<span class="chip${cd.over ? ' over' : (cd.urgent ? ' urgent' : '')}">⏳ ${esc(cd.text)}</span>` : '',
    task.due ? `<span class="chip${isOverdue(task) ? ' over' : ''}">${isOverdue(task) ? '⚠' : '📅'} ${fmtDue(task.due)}</span>` : '',
    (hasKids ? `<span class="chip">${childTasks(task.id).length} 子任务</span>` : ''),
    task.scope === 'multi'
      ? `<span class="chip">👥 ${task.assignees && task.assignees.length ? esc(task.assignees.join('、')) : '多人协作'}</span>`
      : `<span class="chip">👤 单人</span>`
  ].join('');

  const div = document.createElement('div');
  div.className = 'task' + (task.done ? ' done' : '') + (task.focus ? ' focus' : '')
                + (task.longTerm ? ' long' : '')
                + (ctx ? ' ctx' : '') + (task.id === selectedTaskId ? ' sel' : '');
  div.style.top = (i * ROW_H) + 'px';
  div.dataset.id = task.id;
  div.dataset.depth = depth;
  if (ctx) div.style.opacity = '.45';
  const canNest = depthOf(task) < MAX_DEPTH;
  div.innerHTML = `
    ${depth ? `<span class="indent" style="width:calc(${depth} * var(--indent-w))"></span>` : ''}
    <button class="caret${hasKids ? '' : ' empty'}" title="${hasKids ? (task.collapsed ? '展开子任务' : '折叠子任务') : ''}">${
      hasKids ? (task.collapsed ? '▶<span class="cnt">' + kidCount + '</span>' : '▼') : '·'}</button>
    <div class="check" title="标记完成">${task.done ? '✓' : ''}</div>
    <span class="title">${esc(task.title)}</span>
    <span class="chips">${chips}</span>
    <span class="time">${task.done ? '完成于 ' + fmtTime(task.doneAt) : fmtTime(task.createdAt)}</span>
    <span class="ops">
      <button class="sub" title="在此任务下新建子任务（第 ${depthOf(task) + 1} 层）" ${canNest ? '' : 'disabled style="opacity:.4"'}>＋</button>
      <button class="in" title="缩进一层（成为上一个同级任务的子任务）">⇥</button>
      <button class="out" title="升级一层（成为父任务的同级）">⇤</button>
      <button class="td" title="加入 / 移出今日处理">${task.focus ? '☀' : '☆'}</button>
      <button class="ed" title="编辑任务">✏️</button>
      <button class="del" title="删除任务">🗑</button>
    </span>`;

  div.querySelector('.check').onclick = () => toggleTaskDone(task.id);
  div.querySelector('.caret').onclick = () => { if (hasKids) toggleCollapse(task.id); };
  div.querySelector('.title').onclick = () => selectTask(task.id);
  div.querySelector('.title').ondblclick = () => openTaskDialog('edit', null, task);
  div.querySelector('.ops .td').onclick = () => {
    const was = task.focus;
    setFocus(task.id, !was);
    toast(was ? '已移出「今日处理」' : '已加入「今日处理」');
  };
  div.querySelector('.ops .del').onclick = () => removeTask(task.id);
  div.querySelector('.ops .ed').onclick = () => openTaskDialog('edit', null, task);
  div.querySelector('.ops .sub').onclick = () => {
    if (!canNest) { toast(`最多支持 ${MAX_DEPTH} 层：第 ${MAX_DEPTH} 层任务下不能再新建子任务`); return; }
    openTaskDialog('create', task.lineId, null, task.id);
  };
  div.querySelector('.ops .in').onclick = () => indentTask(task.id);
  div.querySelector('.ops .out').onclick = () => outdentTask(task.id);
  enableRowDrag(div, task);
  return div;
}

/** 选中任务（展示面包屑） */
function selectTask(id) {
  selectedTaskId = id;
  renderCrumb();
  const box = $('taskList');
  if (box) Array.from(box.children).forEach(el => el.classList.toggle('sel', el.dataset.id === id));
}

/** 面包屑：主线 › 一级任务 › … › 当前任务 */
function renderCrumb() {
  const box = $('crumb');
  if (!box) return;
  const idx = taskIndex();
  const cur = selectedTaskId ? idx.get(selectedTaskId) : null;
  if (!cur || cur.deleted || cur.lineId !== currentLineId) { box.className = 'crumb'; box.innerHTML = ''; return; }
  const path = taskPath(cur.id);           // [主线, ...任务]
  box.className = 'crumb show';
  box.innerHTML = path.map((n, i) => {
    const name = n.title ? esc(n.title) : '';
    const isLine = i === 0;
    return `<span class="seg" data-id="${isLine ? '' : n.id}" data-line="${isLine ? n.id : ''}">${
      isLine ? '🗂 ' : ''}${name}</span>`;
  }).join('<span class="sep">›</span>');
  Array.from(box.querySelectorAll('.seg')).forEach(seg => {
    seg.onclick = () => {
      const id = seg.dataset.id;
      if (!id) return;                      // 主线：无需跳转
      // 展开所有祖先，确保目标可见
      taskPath(id).forEach(n => { if (n.parentId !== undefined && n.collapsed) { n.collapsed = false; } });
      selectedTaskId = id;
      commit();
      const at = treeRows.findIndex(r => r.task.id === id);
      const scroll = $('taskScroll');
      if (scroll && at >= 0) scroll.scrollTop = Math.max(0, at * ROW_H - scroll.clientHeight / 2);
      selectTask(id);
    };
  });
}

/* ---- 列表内拖拽：调整层级与排序 ---- */
let listDrag = null;

function enableRowDrag(div, task) {
  div.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || e.target.classList.contains('check')) return;
    if (e.isPrimary && e.pointerType !== 'touch') e.preventDefault();   // 双指放行给捏合缩放
    const start = { x: e.clientX, y: e.clientY, moved: false };
    const onMove = ev => {
      if (!start.moved && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) > 6) {
        start.moved = true;
        document.body.classList.add('dragging');
        div.classList.add('dragging');
      }
      if (start.moved) showDropHint(ev.clientX, ev.clientY, task.id);
    };
    const onUp = ev => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.classList.remove('dragging');
      div.classList.remove('dragging');
      clearDropHint();
      if (!start.moved) return;
      const target = dropTargetAt(ev.clientX, ev.clientY, task.id);
      if (target) moveTask(task.id, target.parentId, target.index, currentLineId);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });
}

/** 根据指针位置计算落点：上下边缘=插入同级前/后，中部=成为子任务 */
function dropTargetAt(clientX, clientY, dragId) {
  const box = $('taskList');
  if (!box || !treeRows.length) return null;
  const rect = box.getBoundingClientRect();
  const y = clientY - rect.top;
  let i = Math.floor(y / ROW_H);
  i = Math.max(0, Math.min(treeRows.length - 1, i));
  const row = treeRows[i];
  if (!row || row.task.id === dragId) return { invalid: true, row, index: i };
  const frac = (y - i * ROW_H) / ROW_H;
  let parentId, index, depth;
  if (frac < 0.3) {
    parentId = row.task.parentId || null; index = siblingIndex(row.task); depth = row.depth;
  } else if (frac > 0.7) {
    parentId = row.task.parentId || null; index = siblingIndex(row.task) + 1; depth = row.depth;
  } else {
    parentId = row.task.id; index = childTasks(row.task.id).length; depth = row.depth + 1;
  }
  // 合法性：不能拖进自己的子树；不能超出层数上限
  if (parentId === dragId || (parentId && isDescendantOf(parentId, dragId))) {
    return { invalid: true, row, index: i, depth };
  }
  if (!depthFits(dragId, parentId, currentLineId)) {
    return { invalid: true, row, index: i, depth, tooDeep: true };
  }
  return { parentId, index, depth, row, at: i, after: frac > 0.7 };
}

function showDropHint(clientX, clientY, dragId) {
  const t = dropTargetAt(clientX, clientY, dragId);
  const box = $('taskList');
  if (!box) return;
  let line = box.querySelector('.drop-line');
  if (!t) { if (line) line.remove(); return; }
  if (!line) {
    line = document.createElement('div');
    line.className = 'drop-line';
    line.innerHTML = '<span class="dot"></span>';
    box.appendChild(line);
  }
  const y = (t.index + (t.after || t.parentId === (t.row && t.row.task.id) ? 1 : 0)) * ROW_H;
  const depth = t.depth !== undefined ? t.depth : t.row.depth;
  line.style.top = (y - 1) + 'px';
  line.style.left = `calc(${depth} * var(--indent-w) + 28px)`;   // 与行的缩进宽度保持一致（窄屏会自动收窄）
  line.style.background = t.invalid ? '#e5484d' : 'var(--primary)';
}

function clearDropHint() {
  const box = $('taskList');
  if (!box) return;
  const line = box.querySelector('.drop-line');
  if (line) line.remove();
}

/* =====================================================================
 * 第五部分：通用输入弹窗、导出/导入、视图切换与启动
 * ===================================================================== */
let inputCallback = null;

/** 通用输入弹窗：标题、说明、默认值、确定回调 */
function askInput(title, desc, value, onOk) {
  $('inputTitle').textContent = title;
  $('inputDesc').textContent = desc;
  $('inputField').value = value || '';
  inputCallback = onOk;
  $('inputMask').classList.add('show');
  setTimeout(() => { $('inputField').focus(); $('inputField').select(); }, 50);
}

function closeInput() {
  $('inputMask').classList.remove('show');
  inputCallback = null;
}

$('btnInputOk').onclick = () => {
  const cb = inputCallback;
  const v = $('inputField').value;
  closeInput();
  if (cb) cb(v);
};
$('btnInputCancel').onclick = closeInput;
$('inputField').onkeydown = (e) => {
  if (e.key === 'Enter') $('btnInputOk').click();
  if (e.key === 'Escape') closeInput();
};
$('inputMask').onclick = (e) => { if (e.target === $('inputMask')) closeInput(); };

/* ---- 通用确认弹窗（删除等危险操作）
 *  说明：原生 confirm() 在部分浏览器内嵌网页容器 / WebView 中会被静默拦截，
 *  点了删除毫无反应，因此统一改用应用内弹窗。 */
let confirmCallback = null;

function askConfirm(title, desc, okText, onOk) {
  $('confirmTitle').textContent = title;
  $('confirmDesc').textContent = desc;
  $('btnConfirmOk').textContent = okText || '确定';
  confirmCallback = onOk;
  $('confirmMask').classList.add('show');
}

function closeConfirm() {
  $('confirmMask').classList.remove('show');
  confirmCallback = null;
}

$('btnConfirmOk').onclick = () => {
  const cb = confirmCallback;
  closeConfirm();
  if (cb) cb();
};
$('btnConfirmCancel').onclick = closeConfirm;
$('confirmMask').onclick = (e) => { if (e.target === $('confirmMask')) closeConfirm(); };

/* ---- 导出 / 导入（跨设备迁移，LWW 合并） ---- */
let dlgMode = 'export';

function openDialog(mode) {
  dlgMode = mode;
  if (mode === 'export') {
    $('dlgTitle').textContent = '导出数据';
    $('dlgDesc').textContent = '复制下面方框中的内容并保存，到其他设备上用「导入」粘贴即可完成迁移。';
    $('dlgArea').value = JSON.stringify(state, null, 2);
    $('btnDlgApply').style.display = 'none';
    $('btnDlgCopy').style.display = '';
  } else {
    $('dlgTitle').textContent = '导入数据';
    $('dlgDesc').textContent = '把之前导出的数据粘贴到下面方框中，点击「导入」。将与当前数据按时间戳自动合并，不会丢失较新的修改。';
    $('dlgArea').value = '';
    $('btnDlgApply').style.display = '';
    $('btnDlgCopy').style.display = 'none';
  }
  $('dlgMask').classList.add('show');
}

function importData() {
  try {
    const remote = JSON.parse($('dlgArea').value);
    if (!Array.isArray(remote.lines) || !Array.isArray(remote.tasks)) throw new Error('格式不对');
    state.lines = mergeRecords(state.lines, remote.lines);
    state.tasks = normalizeTasks(mergeRecords(state.tasks, remote.tasks));
    if (remote.settings) mergeSettings(remote.settings);            // 主题偏好一并迁移
    if (!state.lines.some(l => !l.deleted)) state.lines.push(Repository.empty().lines[0]);
    if (!queryLines().some(l => l.id === currentLineId)) currentLineId = queryLines()[0].id;
    commit();
    $('dlgMask').classList.remove('show');
    toast('导入成功，已按最新修改合并 ✅');
  } catch (e) {
    toast('导入失败：' + (e.message || '数据格式不正确'));
  }
}

/* ---- 视图切换 ---- */
/** 「今日处理」面板位置：思维导图中贴右侧；列表视图中作为第三栏 */
function placePanel() {
  const p = $('todayPanel');
  if (view === 'map') {
    p.classList.remove('in-list');
    $('mapView').appendChild(p);
  } else if (view === 'list') {
    p.classList.add('in-list');
    $('listView').querySelector('.layout').appendChild(p);
  } else {
    /* 日历视图不显示今日处理面板：日历按日期组织，再挂一个按"今日处理"
       筛选的面板会造成两套时间维度并存、互相干扰 */
    p.classList.remove('in-list');
    p.style.display = 'none';
    return;
  }
  p.style.display = '';
  /* 窄屏导图：面板默认收成右缘窄条（把画布让给导图），点标题展开。
     列表视图下面板本身就是内容区的一部分，保持正常展开。 */
  if (window.innerWidth <= 760 && view === 'map') p.classList.remove('expanded');
}

function showView(v) {
  view = v;
  $('mapView').style.display = v === 'map' ? 'flex' : 'none';
  $('listView').style.display = v === 'list' ? 'flex' : 'none';
  $('calView').style.display = v === 'cal' ? 'flex' : 'none';
  $('btnMapView').classList.toggle('on', v === 'map');
  $('btnListView').classList.toggle('on', v === 'list');
  $('btnCalView').classList.toggle('on', v === 'cal');
  placePanel();
  /* 切到导图/日历时收起抽屉：这两个视图没有主线侧栏，敞着的抽屉只会挡住画布 */
  if (v !== 'list') setDrawer(false);
  if (v === 'map') { renderMap(); fitMap(); renderPanel(); }
  else render();
}

$('btnMapView').onclick = () => showView('map');
$('btnListView').onclick = () => showView('list');
$('btnCalView').onclick = () => showView('cal');

/* ---- 移动端：主线抽屉 + 更多弹层 ----
   窄屏（≤760px）侧栏是 fixed 抽屉，靠 btnDrawer 开合、点遮罩收起。
   切到导图/日历视图时自动收起 —— 抽屉里的主线操作对这两个视图没有意义，
   留着只会挡住画布。桌面宽度下这些逻辑自动失效（侧栏常驻、按钮 display:none）。 */
function isNarrow() { return window.innerWidth <= 760; }
function setDrawer(open) {
  const side = $('sidebar'), mask = $('drawerMask');
  if (!side) return;
  side.classList.toggle('open', open);
  mask.classList.toggle('show', open);
  $('btnDrawer').setAttribute('aria-expanded', open ? 'true' : 'false');
}
function toggleDrawer() { setDrawer(!$('sidebar').classList.contains('open')); }
$('btnDrawer').onclick = (e) => { e.stopPropagation(); toggleDrawer(); };
$('drawerMask').onclick = () => setDrawer(false);
/* 从抽屉里选完主线就自动收起，让用户直接看到任务列表 */
document.addEventListener('click', (e) => {
  if (isNarrow() && $('sidebar').classList.contains('open')
      && e.target.closest('#lineList .line-item, #btnAddLine, #newLineName')) {
    setDrawer(false);
  }
});
/* 视口变宽（转横屏 / 平板）时复位，别把抽屉状态带到桌面去 */
let wasNarrow = isNarrow();
window.addEventListener('resize', () => {
  const n = isNarrow();
  if (wasNarrow && !n) setDrawer(false);
  wasNarrow = n;
});

/* 「⋯ 更多」弹层：手机上承载导出/导入，宽屏这两个按钮直排顶部，
   所以弹层只在窄屏出现（CSS 里 #btnExport/#btnImport 窄屏 display:none）。 */
function toggleMorePop(force) {
  const pop = $('morePop'), btn = $('btnMore');
  if (!pop) return;
  const show = force !== undefined ? force : pop.hasAttribute('hidden');
  pop.toggleAttribute('hidden', !show);
  btn.setAttribute('aria-expanded', show ? 'true' : 'false');
}
$('btnMore').onclick = (e) => { e.stopPropagation(); toggleMorePop(); };
/* 弹层里的按钮复用原有按钮的 click，转发过去即可，不复制逻辑 */
$('btnMoreExport').onclick = () => { toggleMorePop(false); $('btnExport').click(); };
$('btnMoreImport').onclick = () => { toggleMorePop(false); $('btnImport').click(); };
$('btnMoreTheme').onclick = () => { toggleMorePop(false); toggleTheme(); };
$('btnMoreScheme').onclick = () => { toggleMorePop(false); openSchemePop(); };

/* ---- 日历交互 ---- */
$('calPrev').onclick = () => moveCalendarMonth(-1);
$('calNext').onclick = () => moveCalendarMonth(1);
$('calToday').onclick = () => {
  const now = new Date();
  calYear = now.getFullYear(); calMonth = now.getMonth() + 1;
  renderCalendar();
};
$('calShowDone').onchange = (e) => { calShowDone = e.target.checked; renderCalendar(); };

/* ---- 事件绑定 ---- */
$('btnMapLayout').onclick = toggleMapLayout;

/* 窄屏导图：「今日处理」窄条 / 展开态切换（点标题栏） */
function toggleTodayPanel() {
  if (window.innerWidth > 760) return;      /* 宽屏是常驻大面板，不需要开合 */
  const p = $('todayPanel');
  p.classList.toggle('expanded');
  if (view === 'map') setTimeout(fitMap, 240);   /* 等宽度动画结束再重算导图缩放 */
}
document.querySelector('#todayPanel .tp-head').onclick = toggleTodayPanel;

/* ---- 操作说明折叠卡片 ---- */
function getLegendOpen() {
  const v = localStorage.getItem('taskline.legend.open');
  // 展开态的图例是盖在导图上的浮层（宽 290px），实测会挡住底下节点的悬停按钮
  // （elementFromPoint 命中图例而非 collapse/delete/add），所以不能长期展开。
  // 从未设置过时：宽屏先展开一次做「新功能引导」，6 秒后自动收起；窄屏直接收起让出画布。
  if (v === null) return window.innerWidth > 760;
  return v === '1';
}
/* 首访引导：展开 6 秒后自动收起并记住"收起"，之后不再打扰。
   注意必须在 setLegendOpen() 之前判断首访 —— setLegendOpen 会立刻写入状态键。 */
let legendHintTimer = null;
function primeLegendHint() {
  if (localStorage.getItem('taskline.legend.open') !== null) return;
  if (window.innerWidth <= 760) return;
  legendHintTimer = setTimeout(() => {
    if ($('mapLegend').classList.contains('open')) setLegendOpen(false);
  }, 6000);
}
function setLegendOpen(open) {
  const box = $('mapLegend'), head = $('mapLegendHead');
  if (!box) return;
  box.classList.toggle('open', open);
  head.setAttribute('aria-expanded', open ? 'true' : 'false');
  localStorage.setItem('taskline.legend.open', open ? '1' : '0');
}
function toggleLegend() {
  // 手动点过就取消首访自动收起 —— 用户自己开着的卡片不该被定时器抢走
  if (legendHintTimer) { clearTimeout(legendHintTimer); legendHintTimer = null; }
  setLegendOpen(!($('mapLegend').classList.contains('open')));
}
primeLegendHint();
setLegendOpen(getLegendOpen());
$('mapLegendHead').onclick = toggleLegend;
$('btnTheme').onclick = toggleTheme;

/* ---- 配色选择交互 ---- */
$('btnScheme').onclick = (e) => { e.stopPropagation(); toggleSchemePop(); };
/* 点击页面其他位置关闭面板；面板内部点击不冒泡到关闭逻辑 */
document.addEventListener('click', (e) => {
  /* 「⋯ 更多」弹层：同一套外部点击 / Esc 关闭规则 */
  const mp = $('morePop');
  if (mp && !mp.hasAttribute('hidden')) {
    if (!e.target.closest('#morePop') && !e.target.closest('#btnMore')) toggleMorePop(false);
  }
  if ($('schemePop').hidden) return;
  if (e.target.closest('#schemePop') || e.target.closest('#btnScheme')) return;
  closeSchemePop();
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const mp = $('morePop');
  if (mp && !mp.hasAttribute('hidden')) { toggleMorePop(false); $('btnMore').focus(); return; }
  if (!$('schemePop').hidden) { closeSchemePop(); $('btnScheme').focus(); }
});
$('tpClear').onclick = clearDoneFocus;
$('btnAddLineTop').onclick = () =>
  askInput('新建主线', '为主线起个名字（如：工作、学习、生活）', '', v => addLine(v));
$('btnAddLine').onclick = () => { addLine($('newLineName').value); $('newLineName').value = ''; $('newLineName').focus(); };
$('newLineName').onkeydown = (e) => { if (e.key === 'Enter') $('btnAddLine').click(); };

/* ---- 任务表单弹窗事件 ---- */
$('btnAddTask').onclick = () => openTaskDialog('create', currentLineId);
$('taskDlgOk').onclick = saveTaskDialog;
$('taskDlgCancel').onclick = closeTaskDialog;
$('taskDlgDueClear').onclick = () => { $('taskDlgDue').value = ''; };
document.querySelectorAll('#scopeSwitch button').forEach(b => {
  b.onclick = () => { taskDlgScope = b.dataset.s; syncScopeUI(); };
});
document.querySelectorAll('#longSwitch button').forEach(b => {
  b.onclick = () => {
    const next = b.dataset.l === '1';
    if (next !== taskDlgLong) {
      /* 切到长期任务时先记住填好的日期，切回来再还原，免得白填一次 */
      if (next) longPrevDue = $('taskDlgDue').value;
      else $('taskDlgDue').value = longPrevDue;
      taskDlgLong = next;
    }
    syncLongUI();
  };
});
$('taskDlgName').onkeydown = (e) => { if (e.key === 'Enter') saveTaskDialog(); };
$('taskDlgAssignees').onkeydown = (e) => { if (e.key === 'Enter') saveTaskDialog(); };
$('taskMask').onclick = (e) => { if (e.target === $('taskMask')) closeTaskDialog(); };

document.querySelectorAll('.filters button').forEach(btn => {
  btn.onclick = () => {
    filter = btn.dataset.f;
    document.querySelectorAll('.filters button').forEach(b => b.classList.toggle('on', b === btn));
    renderTasks();
  };
});

/* ---- 任务树：全部展开 / 折叠 / 虚拟滚动 ---- */
$('btnExpandAll').onclick = () => setAllCollapsed(false);
$('btnCollapseAll').onclick = () => setAllCollapsed(true);
$('maxDepthTip').textContent = String(MAX_DEPTH);
(function bindTreeScroll() {
  const scroll = $('taskScroll');
  if (!scroll) return;
  let raf = 0;
  scroll.addEventListener('scroll', () => {
    if (raf) return;                       // 每帧最多渲染一次，保证长列表滚动流畅
    raf = requestAnimationFrame(() => { raf = 0; if (view === 'list') renderTaskWindow(); });
  }, { passive: true });
})();

$('btnExport').onclick = () => openDialog('export');
$('btnImport').onclick = () => openDialog('import');
$('btnDlgClose').onclick = () => $('dlgMask').classList.remove('show');
$('btnDlgCopy').onclick = async () => {
  $('dlgArea').select();
  try { await navigator.clipboard.writeText($('dlgArea').value); toast('已复制到剪贴板 📋'); }
  catch (e) { document.execCommand('copy'); toast('已复制到剪贴板 📋'); }
};
$('btnDlgApply').onclick = importData;
$('dlgMask').onclick = (e) => { if (e.target === $('dlgMask')) $('dlgMask').classList.remove('show'); };

window.addEventListener('resize', () => { if (view === 'map') applyCam(); });

/* ---------- 启动：加载数据 → 启动同步引擎 → 渲染 ---------- */
(async function boot() {
  if (!queryLines().length) state = Repository.empty();
  if (!queryLines().some(l => l.id === currentLineId)) currentLineId = queryLines()[0].id;

  applyTheme();   // 启动即应用已保存的配色方案与深浅模式
  closeSchemePop();   // 配色面板默认收起
  syncMapLayoutBtn();   // 显示方式按钮跟随已保存的设置
  await CloudSync.enable();

  SyncEngine.start((remoteState) => {
    invalidateTaskIndex();
    state.lines = mergeRecords(state.lines, remoteState.lines);
    state.tasks = normalizeTasks(mergeRecords(state.tasks, remoteState.tasks));
    if (remoteState.settings) mergeSettings(remoteState.settings);  // 主题随数据一起到达
    if (!queryLines().some(l => l.id === currentLineId)) currentLineId = queryLines()[0].id;
    applyTheme();
    syncMapLayoutBtn();
    render();
  });

  showView('map');   // 默认进入思维导图总览
  applyDailyLongTerm();   // 长期任务 ♾：今天的首次启动，自动进入「今日处理」

  /* 倒计时自动刷新：每分钟重算一次"剩余 X天X小时"（页面不可见时跳过）；
     顺带检查是否跨过了零点，跨天则再次把长期任务放进今日处理 */
  setInterval(() => {
    if ((document.visibilityState || 'visible') !== 'visible') return;
    applyDailyLongTerm();
    if (view === 'cal') rollCalendarToday();
    render();
  }, 60000);

  /* 重新回到页面时同样检查一次（手机/浏览器切回来的场景） */
  document.addEventListener('visibilitychange', () => {
    if ((document.visibilityState || 'visible') !== 'visible') return;
    applyDailyLongTerm();
    if (view === 'cal') rollCalendarToday();
    render();
  });
})();
