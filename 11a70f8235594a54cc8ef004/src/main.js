import { createTianaFetch } from '@tianacloud/serverless';
import css from './style.css?inline';
const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
document.body.innerHTML = "\n<div class=\"wrap\">\n\n  <!-- ========== 头部 ========== -->\n  <header>\n    <h1><span class=\"stamp-emoji\">📦</span> 纠结终结器</h1>\n    <p class=\"subtitle\">选不出来？让数学替你决定，还告诉你为什么。</p>\n  </header>\n\n  <!-- ========== 第 0 步：你在纠结什么 ========== -->\n  <section class=\"card\">\n    <h2><span class=\"step-no\">0</span>我在纠结……</h2>\n    <input class=\"question-input\" id=\"question\" maxlength=\"40\" placeholder=\"例如：今晚吃什么 / 买哪款 / 要不要换工作\">\n  </section>\n\n  <!-- ========== 第 1、2 步：选项 + 维度 ========== -->\n  <div class=\"edit-grid\">\n    <section class=\"card\">\n      <h2><span class=\"step-no\">1</span>列出选项 <span class=\"hint\" id=\"opt-count\"></span></h2>\n      <div id=\"options-list\"></div>\n      <button class=\"add-btn\" id=\"add-option\">＋ 加一个选项</button>\n    </section>\n    <section class=\"card\">\n      <h2><span class=\"step-no\">2</span>你在意的维度 <span class=\"hint\">拖动滑块设权重（0 = 无所谓）</span></h2>\n      <div id=\"dims-list\"></div>\n      <button class=\"add-btn\" id=\"add-dim\">＋ 加一个维度</button>\n    </section>\n  </div>\n\n  <!-- ========== 第 3 步：打分矩阵 ========== -->\n  <section class=\"card\" id=\"score-card\">\n    <h2><span class=\"step-no\">3</span>逐项打分（0 ~ 10） <span class=\"hint\">分越高越想要</span></h2>\n    <div class=\"matrix\" id=\"matrix\"></div>\n  </section>\n\n  <!-- ========== 第 4 步：实时结果 ========== -->\n  <div class=\"result-grid\">\n    <section class=\"card\">\n      <h2>📊 实时加权总分</h2>\n      <div id=\"bars\"></div>\n    </section>\n    <section class=\"card\">\n      <h2>⚖️ 第一名 VS 第二名</h2>\n      <div class=\"balance-wrap\">\n        <svg id=\"balance-svg\" viewBox=\"0 0 300 190\" aria-label=\"天平动画\">\n          <!-- 支柱与底座 -->\n          <line x1=\"150\" y1=\"88\" x2=\"150\" y2=\"160\" stroke=\"#c9c4b8\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n          <path d=\"M120 165 L180 165 L150 158 Z\" fill=\"#d8d3c7\"/>\n          <circle cx=\"150\" cy=\"86\" r=\"6\" fill=\"#8a8578\"/>\n          <!-- 横梁（会随差距倾斜） -->\n          <g class=\"balance-beam\" id=\"beam\">\n            <line x1=\"30\" y1=\"88\" x2=\"270\" y2=\"88\" stroke=\"#8a8578\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n            <!-- 左盘 -->\n            <g id=\"pan-left\">\n              <line x1=\"46\" y1=\"88\" x2=\"34\" y2=\"112\" stroke=\"#b5b0a3\" stroke-width=\"2.5\"/>\n              <line x1=\"46\" y1=\"88\" x2=\"58\" y2=\"112\" stroke=\"#b5b0a3\" stroke-width=\"2.5\"/>\n              <path d=\"M28 112 L64 112 L58 122 L34 122 Z\" fill=\"#efece5\" stroke=\"#d8d3c7\" stroke-width=\"1.5\"/>\n              <text id=\"pan-left-text\" x=\"46\" y=\"136\" text-anchor=\"middle\" font-size=\"12\" fill=\"#2b2f36\" font-weight=\"700\">—</text>\n              <text id=\"pan-left-score\" x=\"46\" y=\"152\" text-anchor=\"middle\" font-size=\"11\" fill=\"#8a8f99\">—</text>\n            </g>\n            <!-- 右盘 -->\n            <g id=\"pan-right\">\n              <line x1=\"254\" y1=\"88\" x2=\"242\" y2=\"112\" stroke=\"#b5b0a3\" stroke-width=\"2.5\"/>\n              <line x1=\"254\" y1=\"88\" x2=\"266\" y2=\"112\" stroke=\"#b5b0a3\" stroke-width=\"2.5\"/>\n              <path d=\"M236 112 L272 112 L266 122 L242 122 Z\" fill=\"#efece5\" stroke=\"#d8d3c7\" stroke-width=\"1.5\"/>\n              <text id=\"pan-right-text\" x=\"254\" y=\"136\" text-anchor=\"middle\" font-size=\"12\" fill=\"#2b2f36\" font-weight=\"700\">—</text>\n              <text id=\"pan-right-score\" x=\"254\" y=\"152\" text-anchor=\"middle\" font-size=\"11\" fill=\"#8a8f99\">—</text>\n            </g>\n          </g>\n        </svg>\n        <div class=\"gap-text\" id=\"gap-text\">至少需要 2 个选项和 1 个维度，天平才能开始工作。</div>\n      </div>\n    </section>\n  </div>\n\n  <!-- ========== 操作按钮 ========== -->\n  <div class=\"actions\">\n    <button class=\"btn btn-main\" id=\"btn-decide\">🎲 帮我决定</button>\n    <button class=\"btn btn-ghost\" id=\"btn-save\">💾 保存这次决策</button>\n  </div>\n\n  <!-- ========== 后悔模拟 ========== -->\n  <section class=\"card\" id=\"regret-card\" hidden>\n    <h2>🪞 后悔模拟 <span class=\"hint\">如果选了第二名，会差在哪里</span></h2>\n    <div id=\"regret-body\"></div>\n  </section>\n\n  <!-- ========== 历史记录 ========== -->\n  <section class=\"card\">\n    <h2>🗂 历史决策 <span class=\"hint\" id=\"history-count\"></span></h2>\n    <div id=\"history-list\"></div>\n  </section>\n\n  <footer>决策与历史保存在应用数据库中。<br>纠结完，就继续好好生活。</footer>\n</div>\n\n<!-- ========== 盖章结果遮罩 ========== -->\n<div class=\"overlay\" id=\"stamp-overlay\" hidden>\n  <div class=\"stamp-card\">\n    <div class=\"qc\" id=\"stamp-q\">你的纠结是</div>\n    <div class=\"chosen\" id=\"stamp-chosen\">—</div>\n    <div class=\"chosen-score\" id=\"stamp-score\">—</div>\n    <div class=\"real-stamp\">决定啦！</div>\n    <div class=\"comment\" id=\"stamp-comment\"></div>\n    <div class=\"ops\">\n      <button class=\"btn btn-ghost\" id=\"stamp-close\">再纠结一下</button>\n      <button class=\"btn btn-main\" id=\"stamp-save\">保存这次决策</button>\n    </div>\n  </div>\n</div>\n\n";

"use strict";
/* =====================================================================
 * 纠结终结器 —— 把模糊的感觉变成清晰的分数
 * 加权总分 = Σ(维度得分 × 维度权重)，评分在页面中计算，决策保存在应用数据库中。
 * ===================================================================== */

/* ---------- 工具 ---------- */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
let uid = 0;
const nextId = () => 'id' + (++uid) + '_' + Date.now().toString(36);

/* =====================================================================
 * 一、状态与本地存储
 * ===================================================================== */
const STATE_KEY = 'jjTerminator.state.v1';
const HISTORY_KEY = 'jjTerminator.history.v1';

// 默认给一份示例，让用户打开就知道怎么用
function defaultState(){
  const o1 = nextId(), o2 = nextId(), o3 = nextId();
  const d1 = nextId(), d2 = nextId(), d3 = nextId();
  return {
    question: '今晚吃什么',
    options: [
      {id:o1, name:'火锅'},
      {id:o2, name:'轻食沙拉'},
      {id:o3, name:'楼下面馆'},
    ],
    dims: [
      {id:d1, name:'价格', weight:7},
      {id:d2, name:'省时间', weight:6},
      {id:d3, name:'我喜欢', weight:9},
    ],
    scores: { // scores[选项id][维度id] = 0~10
      [o1]: {[d1]:4, [d2]:3, [d3]:10},
      [o2]: {[d1]:6, [d2]:8, [d3]:6},
      [o3]: {[d1]:9, [d2]:9, [d3]:5},
    },
  };
}
let state = defaultState();
let historyData = [];
let lastDecision = null;
let version = null;
let pending = false, saving = false, stopped = false;
const status = document.createElement('div');
status.setAttribute('role', 'status');
status.style.cssText = 'padding:8px;text-align:center;color:#715c3c';
document.body.prepend(status);
document.querySelector('.wrap').inert = true;
let channel;
async function sql(statement, values = []) {
  if (!channel) {
    if (!window.tiana?.auth?.getAccessToken || !window.tiana?.connection || !window.tiana?.appId) throw Error('账号或数据库连接未就绪');
    const c = await window.tiana.connection();
    if (c.sql_api !== 'hrana-v3') throw Error('当前数据库协议不支持安全参数化写入');
    channel = {origin:c.origin, fetch:createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'})};
  }
  const args = values.map(v => typeof v === 'number' ? {type:'integer',value:String(v)} : {type:'text',value:String(v)});
  const res = await channel.fetch(`${channel.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args,want_rows:true}},{type:'close'}]})});
  if (!res.ok) throw Error('数据库响应未确认');
  const body = await res.json(), stmt = body.results?.[0];
  if (stmt?.type !== 'ok' || stmt.response?.type !== 'execute') throw Error('数据库操作未确认');
  const result = stmt.response.result;
  return {rows:(result.rows || []).map(row => Object.fromEntries(result.cols.map((c,i)=>[c.name,row[i]?.value]))), affected:Number(result.affected_row_count || 0)};
}
async function readData() {
  return (await sql('SELECT value, version FROM decision_data WHERE app_id = ?', [window.tiana.appId])).rows[0] || null;
}
function persist(){ queueSave(); }
function loadHistory(){ return historyData; }
function persistHistory(h){ historyData = h; queueSave(); }
function queueSave(){
  pending = true;
  status.textContent = '正在保存…';
  if (!saving && !stopped) void flush();
}
async function flush(){
  saving = true;
  while (pending && !stopped) {
    pending = false;
    const value = JSON.stringify({state, history:historyData});
    const expected = version;
    try {
      const result = expected === null
        ? await sql('INSERT INTO decision_data (app_id,value,version) VALUES (?,?,1) ON CONFLICT(app_id) DO NOTHING',[window.tiana.appId,value])
        : await sql('UPDATE decision_data SET value=?,version=version+1 WHERE app_id=? AND version=?',[value,window.tiana.appId,Number(expected)]);
      if (result.affected !== 1) throw Error('数据已被其他窗口修改');
      version = expected === null ? 1 : Number(expected)+1;
    } catch (error) {
      try {
        const actual = await readData();
        if (actual?.value === value && Number(actual.version) === (expected === null ? 1 : Number(expected)+1)) { version = Number(actual.version); continue; }
      } catch (_) {}
      stopped = true;
      status.textContent = '保存未确认或数据已被其他窗口修改，请保留当前内容并重新打开核对。';
    }
  }
  saving = false;
  if (!stopped) status.textContent = '已保存';
}
async function initialize(){
  status.textContent = '正在读取数据…';
  try {
    const row = await readData();
    if (row) {
      const data = JSON.parse(row.value);
      if (!data.state || !Array.isArray(data.state.options) || !Array.isArray(data.history)) throw Error('数据格式不正确');
      state = data.state; historyData = data.history; version = Number(row.version);
    }
    $('#question').value = state.question || '';
    renderAll(true);
    document.querySelector('.wrap').inert = false;
    status.textContent = row ? '已读取保存的数据' : '示例数据，修改后自动保存';
  } catch (error) { status.textContent = '读取失败，请检查登录及数据库连接后重新打开。'; }
}

/* =====================================================================
 * 二、计算逻辑（严谨处理边界情况）
 * ===================================================================== */
function scoreOf(optId, dimId){
  const row = state.scores[optId];
  return row && typeof row[dimId] === 'number' ? row[dimId] : 0;
}
// 每个选项的加权总分
function totals(){
  return state.options.map(o => ({
    option: o,
    total: state.dims.reduce((sum, d) => sum + scoreOf(o.id, d.id) * d.weight, 0),
  }));
}
// 排序后的榜单（总分相同时保持选项原始顺序，稳定）
function ranked(){
  return totals().map((t, i) => ({...t, idx:i}))
    .sort((a, b) => b.total - a.total || a.idx - b.idx);
}
const weightSum = () => state.dims.reduce((s, d) => s + (d.weight || 0), 0);

/* =====================================================================
 * 三、渲染：编辑区
 * ===================================================================== */
const OPT_COLORS = ['#ff7a59','#2bb5a0','#f5b942','#7c9aff','#c98bf0','#ff8fab','#5ec269','#8a8f99'];

function renderOptions(){
  const box = $('#options-list');
  box.innerHTML = '';
  state.options.forEach((o, i) => {
    const row = document.createElement('div');
    row.className = 'opt-row';
    const color = OPT_COLORS[i % OPT_COLORS.length];
    row.innerHTML = `
      <input type="text" maxlength="12" value="${escapeHtml(o.name)}" aria-label="选项名称">
      <button class="icon-btn del-opt" title="删除选项" ${state.options.length <= 2 ? 'disabled' : ''}>✕</button>`;
    row.querySelector('input').addEventListener('input', e => {
      o.name = e.target.value.trim() || '未命名';
      persist(); renderAll(false);
    });
    row.querySelector('.del-opt').onclick = () => {
      if(state.options.length <= 2) return;
      delete state.scores[o.id];
      state.options = state.options.filter(x => x.id !== o.id);
      persist(); renderAll(true);
    };
    row.querySelector('input').style.borderLeft = `4px solid ${color}`;
    box.appendChild(row);
  });
  $('#opt-count').textContent = `（${state.options.length}/8，至少 2 个）`;
  $('#add-option').disabled = state.options.length >= 8;
}

function renderDims(){
  const box = $('#dims-list');
  box.innerHTML = '';
  state.dims.forEach((d, i) => {
    const row = document.createElement('div');
    row.className = 'dim-row';
    row.innerHTML = `
      <input type="text" class="dim-name" maxlength="10" value="${escapeHtml(d.name)}" aria-label="维度名称">
      <div class="w-ctl">
        <input type="range" min="0" max="10" step="1" value="${d.weight}" aria-label="权重" style="width:86px">
        <span class="w-val">权重 ${d.weight}</span>
      </div>
      <button class="icon-btn del-dim" title="删除维度" ${state.dims.length <= 1 ? 'disabled' : ''}>✕</button>
      ${d.weight === 0 ? '<div class="weight-tip">权重为 0：这个维度不计入总分</div>' : ''}`;
    const nameInput = row.querySelector('.dim-name');
    const range = row.querySelector('input[type=range]');
    const wVal = row.querySelector('.w-val');
    nameInput.addEventListener('input', e => {
      d.name = e.target.value.trim() || '未命名';
      persist(); renderAll(false);
    });
    range.addEventListener('input', e => {
      d.weight = +e.target.value;
      wVal.textContent = '权重 ' + d.weight;
      persist(); renderAll(false);
      // 权重 0 提示需要重绘（input 事件里 renderAll(false) 已覆盖）
    });
    row.querySelector('.del-dim').onclick = () => {
      if(state.dims.length <= 1) return;
      state.dims = state.dims.filter(x => x.id !== d.id);
      state.options.forEach(o => { if(state.scores[o.id]) delete state.scores[o.id][d.id]; });
      persist(); renderAll(true);
    };
    box.appendChild(row);
  });
}

function renderMatrix(){
  const box = $('#matrix');
  box.innerHTML = '';
  if(state.options.length < 2 || state.dims.length < 1){
    box.innerHTML = '<div class="empty-tip">至少需要 2 个选项和 1 个维度，才能开始打分。</div>';
    return;
  }
  state.options.forEach((o, i) => {
    const row = document.createElement('div');
    row.className = 'score-row';
    const color = OPT_COLORS[i % OPT_COLORS.length];
    const head = document.createElement('div');
    head.className = 'sr-head';
    head.innerHTML = `<span class="dot" style="background:${color}"></span><b>${escapeHtml(o.name)}</b><span class="sr-total"></span>`;
    row.appendChild(head);
    const cells = document.createElement('div');
    cells.className = 'score-cells';
    state.dims.forEach(d => {
      const cell = document.createElement('div');
      cell.className = 'sc-cell' + (d.weight === 0 ? ' teal' : '');
      cell.innerHTML = `<label title="${escapeHtml(d.name)}">${escapeHtml(d.name)}</label>
        <input type="range" min="0" max="10" step="1" value="${scoreOf(o.id, d.id)}">
        <span class="v">${scoreOf(o.id, d.id)}</span>`;
      const range = cell.querySelector('input');
      const v = cell.querySelector('.v');
      range.addEventListener('input', e => {
        const val = +e.target.value;
        if(!state.scores[o.id]) state.scores[o.id] = {};
        state.scores[o.id][d.id] = val;
        v.textContent = val;
        persist(); renderAll(false);
      });
      cells.appendChild(cell);
    });
    row.appendChild(cells);
    box.appendChild(row);
  });
}

/* =====================================================================
 * 四、渲染：实时结果（柱状图 + 天平）
 * ===================================================================== */
function renderBars(){
  const box = $('#bars');
  const list = ranked();
  if(!list.length || state.options.length < 2 || state.dims.length < 1){
    box.innerHTML = '<div class="empty-tip">加点选项、维度和分数，这里会实时算出谁赢了。</div>';
    return;
  }
  const max = Math.max(...list.map(t => t.total), 1);
  const topTotal = list[0].total;
  box.innerHTML = list.map((t, i) => {
    const color = OPT_COLORS[state.options.indexOf(t.option) % OPT_COLORS.length];
    const pct = Math.round((t.total / max) * 100);
    return `<div class="bar-row ${i===0 && t.total>0 ? 'top' : ''}">
      <span class="br-name" style="color:${color}">${i===0 && t.total>0 ? '<span class="crown">👑</span>' : ''}${escapeHtml(t.option.name)}</span>
      <div class="br-track"><div class="br-fill" style="width:${pct}%"></div></div>
      <span class="br-val">${t.total}</span>
    </div>`;
  }).join('');
}

function renderBalance(){
  const beam = $('#beam');
  const list = ranked();
  const gapText = $('#gap-text');
  const L = $('#pan-left-text'), LS = $('#pan-left-score');
  const R = $('#pan-right-text'), RS = $('#pan-right-score');
  if(state.options.length < 2 || state.dims.length < 1 || list.length < 2){
    beam.style.transform = 'rotate(0deg)';
    L.textContent = R.textContent = '—';
    LS.textContent = RS.textContent = '—';
    gapText.innerHTML = '至少需要 2 个选项和 1 个维度，天平才能开始工作。';
    return;
  }
  const [first, second] = list;
  const gap = first.total - second.total;
  const scale = Math.max(first.total, 1);
  // 差距越大倾角越大，最大 22 度；第一名那侧下沉
  const angle = clamp(gap / scale * 46, -22, 22);
  beam.style.transform = `rotate(${angle}deg)`;
  L.textContent = trimName(first.option.name);
  R.textContent = trimName(second.option.name);
  LS.textContent = first.total + ' 分';
  RS.textContent = second.total + ' 分';
  if(gap === 0){
    gapText.innerHTML = `⚖️ <b>${escapeHtml(first.option.name)}</b> 和 <b>${escapeHtml(second.option.name)}</b> 完全打平（各 ${first.total} 分）——听天由命，或者再加个维度。`;
  }else{
    const pct = Math.round((gap / scale) * 100);
    gapText.innerHTML = `<b>${escapeHtml(first.option.name)}</b> 领先 <b>${escapeHtml(second.option.name)}</b> ${gap} 分（约 ${pct}%）${gap/scale < 0.1 ? '——差距很小，天平快平了' : ''}`;
  }
}
function trimName(s){ return s.length > 5 ? s.slice(0, 5) + '…' : s; }
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

/* =====================================================================
 * 五、帮我决定：按总分比例加权随机
 * ===================================================================== */
function weightedPick(){
  const list = totals();
  const sum = list.reduce((s, t) => s + Math.max(0, t.total), 0);
  if(sum <= 0){
    // 边界：总分全是 0（没打分 / 权重全 0）→ 纯随机
    return list[Math.floor(Math.random() * list.length)];
  }
  let r = Math.random() * sum;
  for(const t of list){
    r -= Math.max(0, t.total);
    if(r <= 0) return t;
  }
  return list[list.length - 1];
}

$('#btn-decide').addEventListener('click', () => {
  if(state.options.length < 2 || state.dims.length < 1) return;
  // 简单仪式：先在高亮间快速轮转 3 圈，再落定
  const bars = $$('#bars .bar-row');
  let spins = 0, i = 0;
  const spinTimer = setInterval(() => {
    bars.forEach(b => b.style.opacity = .35);
    if(bars[i % bars.length]) bars[i % bars.length].style.opacity = 1;
    i++; spins++;
    if(spins > 14){
      clearInterval(spinTimer);
      bars.forEach(b => b.style.opacity = 1);
      revealDecision();
    }
  }, 90);
});

function revealDecision(){
  const pick = weightedPick();
  const list = ranked();
  const winner = list[0], runner = list[1];
  lastDecision = { pickId: pick.option.id, winnerId: winner ? winner.option.id : null, runnerId: runner ? runner.option.id : null };
  // 盖章遮罩
  $('#stamp-q').textContent = state.question ? '你的纠结：' + state.question : '你的纠结';
  $('#stamp-chosen').textContent = pick.option.name;
  const sameAsTop = winner && pick.option.id === winner.option.id;
  $('#stamp-score').textContent = sameAsTop ? `加权总分 ${pick.total} · 就是第一名` : `加权总分 ${pick.total} · 逆袭了第一名`;
  $('#stamp-comment').textContent = generateComment(pick, winner, runner);
  $('#stamp-overlay').hidden = false;
  renderRegret();
  renderBars(); // 刷新“帮我决定”后的状态
}

/* =====================================================================
 * 六、后悔模拟 + 一句人话点评
 * ===================================================================== */
function renderRegret(){
  const card = $('#regret-card');
  const body = $('#regret-body');
  if(!lastDecision || !lastDecision.runnerId){
    card.hidden = true;
    return;
  }
  const list = ranked();
  const chosen = list.find(t => t.option.id === lastDecision.pickId);
  const runner = list.find(t => t.option.id === lastDecision.runnerId);
  if(!chosen || !runner){ card.hidden = true; return; }
  card.hidden = false;
  let html = `<div class="verdict"><span class="q">${escapeHtml(state.question || '你的纠结')}</span>你选了「${escapeHtml(chosen.option.name)}」，第二名是「${escapeHtml(runner.option.name)}」</div>`;
  if(chosen.total === runner.total){
    html += `<div class="insight">两者总分完全一样（${chosen.total} 分），按维度也看不出高下——这时候直觉比算术靠谱。</div>`;
  }else{
    // 逐维度对比差距（按权重排序，最在意的前）
    const rows = state.dims
      .map(d => {
        const a = scoreOf(chosen.option.id, d.id), b = scoreOf(runner.option.id, d.id);
        return { d, a, b, diff: (a - b) * d.weight };
      })
      .sort((x, y) => Math.abs(y.diff) - Math.abs(x.diff));
    html += rows.map(r => `
      <div class="regret-line">
        <span class="rl-dim">${escapeHtml(r.d.name)}<span style="color:var(--muted);font-weight:400">（权重${r.d.weight}）</span></span>
        <span class="rl-detail">你选的 ${r.a} 分 vs 第二名 ${r.b} 分</span>
        <span class="rl-gap ${r.diff >= 0 ? 'pos' : 'neg'}">${r.diff >= 0 ? '+' : ''}${r.diff}</span>
      </div>`).join('');
    const totalDiff = chosen.total - runner.total;
    html += `<div class="regret-sum">合计差距：<b style="color:${totalDiff >= 0 ? 'var(--teal)' : 'var(--accent)'}">${totalDiff >= 0 ? '+' : ''}${totalDiff} 分</b>。${totalDiff > 0 ? '你的选择确实更符合你在意的东西。' : '有意思——你最后选的并不是分数更高的那个，这就是「帮我决定」的魅力。'}</div>`;
    // 洞察：权重最高的维度上谁更强
    const topDim = state.dims.slice().sort((x, y) => y.weight - x.weight)[0];
    if(topDim && topDim.weight > 0){
      const a = scoreOf(chosen.option.id, topDim.id), b = scoreOf(runner.option.id, topDim.id);
      html += `<div class="insight">你最在意的是「${escapeHtml(topDim.name)}」（权重 ${topDim.weight}）：你选的得 ${a} 分，第二名得 ${b} 分${a >= b ? '——没选错。' : '——在这一点上，第二名其实更对你的胃口。'}</div>`;
    }
  }
  body.innerHTML = html;
}

function generateComment(pick, winner, runner){
  const name = pick.option.name;
  const list = ranked();
  // 1. 加权随机逆袭了第一名
  if(winner && pick.option.id !== winner.option.id){
    return `数学偏心，但我尊重概率——这一次，「${name}」逆袭了第一名。也许你心里本就盼着这个意外。`;
  }
  // 2. 与第二名打平
  if(runner && winner && winner.total === runner.total){
    return `「${name}」和「${runner.option.name}」打成平手，听天由命不如听我的——就它了。`;
  }
  // 3. 找到了“真爱维度”：该选项在权重最高的维度上拿了满分
  const topDim = state.dims.slice().sort((x, y) => y.weight - x.weight)[0];
  if(topDim && topDim.weight > 0 && scoreOf(pick.option.id, topDim.id) === 10){
    return `你其实早就想选「${name}」了——在最在乎的「${topDim.name}」上你给了满分，只是需要一个人替你盖章。`;
  }
  // 4. 优势碾压
  if(runner && winner && winner.total > 0 && (winner.total - runner.total) / winner.total > 0.4){
    return `「${name}」领先第二名一大截，答案早就写好了，你只是不想承认。`;
  }
  // 5. 权重全 0 / 分数全同
  if(weightSum() === 0){
    return `所有维度权重都是 0……你其实啥都不在乎，那就随便选一个，「${name}」，成交。`;
  }
  // 6. 默认池
  const pool = [
    `纠结半天，不如让数字背锅。「${name}」，就是它了。`,
    `选择困难症的标准疗法：把感觉换成小数点——「${name}」胜出。`,
    `「${name}」不一定是完美的，但它是你打出来的分数里最想要的。`,
    `别回头翻其他选项了，「${name}」已经被数学盖章认证。`,
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

/* =====================================================================
 * 七、保存与历史记录
 * ===================================================================== */
$('#btn-save').addEventListener('click', saveDecision);
$('#stamp-save').addEventListener('click', () => { saveDecision(); $('#stamp-overlay').hidden = true; });
$('#stamp-close').addEventListener('click', () => { $('#stamp-overlay').hidden = true; });

function saveDecision(){
  if(!lastDecision){
    alert('先点一次「🎲 帮我决定」，再保存～');
    return;
  }
  const history = loadHistory();
  const pick = state.options.find(o => o.id === lastDecision.pickId);
  if(!pick) return;
  history.unshift({
    id: nextId(),
    date: new Date().toISOString(),
    question: state.question || '未命名纠结',
    chosenName: pick.name,
    chosenTotal: totals().find(t => t.option.id === pick.id).total,
    options: state.options.map(o => ({
      name: o.name,
      total: totals().find(t => t.option.id === o.id).total,
    })),
    dims: state.dims.map(d => ({name: d.name, weight: d.weight})),
  });
  persistHistory(history.slice(0, 50)); // 最多保留 50 条
  renderHistory();
  // 按钮反馈
  const btn = $('#btn-save');
  btn.textContent = '正在保存…';
  setTimeout(() => { btn.textContent = '💾 保存这次决策'; }, 1500);
}

function renderHistory(){
  const history = loadHistory();
  const box = $('#history-list');
  $('#history-count').textContent = history.length ? `共 ${history.length} 条` : '';
  if(!history.length){
    box.innerHTML = '<div class="empty-tip">还没有保存过决策。纠结完点一次「帮我决定」，再点「保存这次决策」，以后就能回来翻旧账。</div>';
    return;
  }
  const maxTotal = Math.max(...history.flatMap(h => h.options.map(o => o.total)), 1);
  box.innerHTML = history.map(h => {
    const d = new Date(h.date);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    const rows = h.options.map((o, i) => `
      <div class="hd-row">
        <span class="hd-name">${escapeHtml(o.name)}${o.name === h.chosenName ? ' ✅' : ''}</span>
        <span class="hd-bar ${o.name === h.chosenName ? 'top' : ''}"><i style="width:${Math.round(o.total / maxTotal * 100)}%"></i></span>
        <span class="hd-val">${o.total}</span>
      </div>`).join('');
    const dimsStr = h.dims.map(d => `${escapeHtml(d.name)}×${d.weight}`).join('、');
    return `<div class="history-item" data-id="${h.id}">
      <div class="hi-head">
        <span class="hi-date">${dateStr}</span>
        <span class="hi-q">${escapeHtml(h.question)}</span>
        <span class="hi-chose">选了：${escapeHtml(h.chosenName)}（${h.chosenTotal} 分）</span>
      </div>
      <div class="hi-detail">
        <div style="margin-bottom:6px;color:var(--muted)">维度权重：${dimsStr}</div>
        ${rows}
      </div>
      <div class="hi-ops">
        <button class="load-hi">📥 载入这套设置</button>
        <button class="danger del-hi">🗑 删除</button>
      </div>
    </div>`;
  }).join('');
  box.querySelectorAll('.history-item').forEach(item => {
    const id = item.dataset.id;
    item.querySelector('.load-hi').onclick = () => {
      const h = loadHistory().find(x => x.id === id);
      if(!h) return;
      state.question = h.question;
      state.options = h.options.map(o => ({id: nextId(), name: o.name}));
      state.dims = h.dims.map(d => ({id: nextId(), name: d.name, weight: d.weight}));
      state.scores = {};
      // 历史只存了总分，没有逐项分：把总分按权重比例摊回各维度，作为起点
      state.options.forEach(o => {
        const rec = h.options.find(x => x.name === o.name);
        state.scores[o.id] = {};
        state.dims.forEach(d => {
          state.scores[o.id][d.id] = rec && h.dims.reduce((s, dd) => s + dd.weight, 0) > 0
            ? Math.min(10, Math.round(rec.total * d.weight / h.dims.reduce((s, dd) => s + dd.weight, 0)))
            : 5;
        });
      });
      lastDecision = null;
      $('#regret-card').hidden = true;
      persist(); renderAll(true);
      window.scrollTo({top: 0, behavior: 'smooth'});
    };
    item.querySelector('.del-hi').onclick = () => {
      persistHistory(loadHistory().filter(x => x.id !== id));
      renderHistory();
    };
  });
}

/* =====================================================================
 * 八、事件绑定与总渲染
 * ===================================================================== */
$('#add-option').onclick = () => {
  if(state.options.length >= 8) return;
  const id = nextId();
  state.options.push({id, name: '选项 ' + (state.options.length + 1)});
  state.scores[id] = {};
  state.dims.forEach(d => { state.scores[id][d.id] = 5; });
  persist(); renderAll(true);
};
$('#add-dim').onclick = () => {
  const id = nextId();
  state.dims.push({id, name: '维度 ' + (state.dims.length + 1), weight: 5});
  state.options.forEach(o => { if(state.scores[o.id]) state.scores[o.id][id] = 5; });
  persist(); renderAll(true);
};
$('#question').addEventListener('input', e => {
  state.question = e.target.value;
  persist();
});

function renderAll(full = true){
  if(full){
    renderOptions();
    renderDims();
    renderMatrix();
    renderHistory();
  }
  renderBars();
  renderBalance();
  // 刷新打分行里的实时小计
  const list = ranked();
  $$('#matrix .score-row').forEach((row, i) => {
    const t = list.find(x => x.option === state.options[i]);
    const el = row.querySelector('.sr-total');
    if(t) el.textContent = `加权小计 ${t.total} 分`;
  });
  updateDecideBtn();
}
function updateDecideBtn(){
  $('#btn-decide').disabled = state.options.length < 2 || state.dims.length < 1;
  $('#btn-save').disabled = !lastDecision;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ---------- 初始化 ---------- */
void initialize();
