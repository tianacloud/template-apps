import { sql } from './db.js';
/* Agent 编排沙盘 · 交互层 */
import * as E from './engine.js';
import css from './style.css?inline';
const style = document.createElement('style'); style.textContent = css; document.head.append(style);
document.querySelector('#app').innerHTML = "\n<div class=\"wrap\">\n  <header>\n    <div class=\"logo\">🧭</div>\n    <div>\n      <h1>Agent 编排沙盘<span class=\"badge\">模拟运行</span></h1>\n      <p class=\"tagline\">把多智能体工作流画出来、跑一遍、回放一遍。拖拽编排 Agent 节点，一键模拟执行看每个节点的输入输出与耗时，再用提示词版本管理对比改了什么。模拟不调用外部模型或服务，工作流自动保存。</p>\n    </div>\n  </header>\n\n  <div class=\"layout\">\n    <div>\n      <div class=\"canvas-wrap\">\n        <svg id=\"graph\" xmlns=\"http://www.w3.org/2000/svg\">\n          <defs>\n            <marker id=\"arrow\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\">\n              <path d=\"M0,0 L10,5 L0,10 z\" fill=\"#6b688a\"/>\n            </marker>\n            <marker id=\"arrowHi\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\">\n              <path d=\"M0,0 L10,5 L0,10 z\" fill=\"#7c5cff\"/>\n            </marker>\n          </defs>\n          <g id=\"edges\"></g>\n          <g id=\"nodes\"></g>\n        </svg>\n      </div>\n      <div class=\"toolbar\" style=\"margin-top:12px\">\n        <button class=\"btn primary\" id=\"btnRun\">▶ 运行沙盘</button>\n        <button class=\"btn\" id=\"btnReset\">↺ 重置</button>\n        <button class=\"btn\" id=\"btnExport\">⬇ 导出工作流</button>\n        <span class=\"pill\" id=\"pillStats\"></span>\n      </div>\n      <div class=\"card\" style=\"margin-top:14px\">\n        <h3><span class=\"dot\"></span>执行时间轴</h3>\n        <div class=\"sub\">模拟执行的逐步事件流，可点击节点定位</div>\n        <div class=\"timeline\" id=\"timeline\"><div class=\"tl\"><span class=\"m\">点击「运行沙盘」开始，事件会逐条出现在这里。</span></div></div>\n      </div>\n    </div>\n\n    <div>\n      <div class=\"card\">\n        <h3><span class=\"dot\"></span>节点检查器</h3>\n        <div class=\"sub\">点击画布中的节点进行配置</div>\n        <div class=\"stat-row\" id=\"stats\"></div>\n        <div id=\"inspector\"><div class=\"sub\">尚未选中节点</div></div>\n      </div>\n\n      <div class=\"card\" style=\"margin-top:16px\">\n        <h3><span class=\"dot\"></span>运行输入</h3>\n        <div class=\"sub\">作为工作流的初始输入，注入开始节点</div>\n        <textarea id=\"input\">帮我调研 2026 年主流的 AI 编程助手能力对比，并给出一份选型建议报告</textarea>\n        <div class=\"row\" style=\"margin-top:12px\">\n          <button class=\"btn sm\" id=\"btnSample\">换个示例</button>\n          <button class=\"btn sm ghost\" id=\"btnClear\">清空</button>\n        </div>\n      </div>\n\n      <div class=\"card\" style=\"margin-top:16px\">\n        <h3><span class=\"dot\"></span>提示词版本</h3>\n        <div class=\"sub\">当前节点提示词的版本号与预览</div>\n        <div id=\"pvBox\"><div class=\"sub\">选中节点后显示</div></div>\n        <div class=\"row\" style=\"margin-top:12px\">\n          <button class=\"btn sm\" id=\"btnCopyPrompt\">📋 复制提示词</button>\n          <button class=\"btn sm ghost\" id=\"btnHist\">📜 查看历史</button>\n        </div>\n        <pre class=\"out\" id=\"promptOut\" style=\"margin-top:10px\">// 选中节点后显示生成的完整提示词</pre>\n      </div>\n    </div>\n  </div>\n\n  <footer>\n    <span>Agent 编排沙盘</span>\n    <span>模拟执行器在本地运行 · 工作流自动保存</span>\n  </footer>\n</div>\n";

const $ = s => document.querySelector(s);
const SVGNS = 'http://www.w3.org/2000/svg';

const SAMPLES = [
  '帮我调研 2026 年主流的 AI 编程助手能力对比，并给出一份选型建议报告',
  '为一款面向小微企业的进销存系统设计技术方案，并给出迭代排期',
  '把这份季度经营数据整理成给管理层的汇报材料，突出现金流风险',
  '重构一个遗留的 Java 订单服务，输出可落地的分步改造计划'
];

/* ═════ 状态 ═════ */
let graph = E.createGraph();
let selectedId = null;
let running = false;
let runGeneration = 0;
let runEvents = [];
let history = {};   // nodeId -> [{version, prompt, time}]
let sampleIdx = 0;
let saveQueue = Promise.resolve();
let ready = false;
const status = document.createElement('div');
status.setAttribute('role', 'status');
status.style.cssText = 'padding:8px 20px;color:#fbbf24';
document.querySelector('.wrap').prepend(status);
function persist() {
  if (!ready) return;
  const data = JSON.stringify({graph, history, input: $('#input').value});
  status.textContent = '正在保存…';
  saveQueue = saveQueue.then(() => { if (!ready) throw new Error('保存已暂停'); return sql('INSERT INTO sandbox_state (id, state) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET state=excluded.state', ['main', data]); }).then(() => { status.textContent = '已保存'; }).catch(() => { status.textContent = '保存结果未知，请刷新并检查数据'; ready = false; document.querySelector('.layout').inert = true; });
}


/* ═════ 渲染 ═════ */
function nodeById(id) { return graph.nodes.find(n => n.id === id); }

/* 画布自适应：把节点整体缩放到可视宽度内 */
let scale = 1, offX = 0, offY = 0;
function fitView() {
  const svg = $('#graph');
  const W = svg.clientWidth, H = svg.clientHeight;
  if (!graph.nodes.length) return;
  const xs = graph.nodes.map(n => n.x), ys = graph.nodes.map(n => n.y);
  const minX = Math.min(...xs) - 20, maxX = Math.max(...xs) + 212;
  const minY = Math.min(...ys) - 20, maxY = Math.max(...ys) + 80;
  scale = Math.min(1, (W - 16) / (maxX - minX), (H - 16) / (maxY - minY));
  offX = (W - (maxX - minX) * scale) / 2 - minX * scale;
  offY = (H - (maxY - minY) * scale) / 2 - minY * scale;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  $('#edges').setAttribute('transform', `translate(${offX},${offY}) scale(${scale})`);
  $('#nodes').setAttribute('transform', `translate(${offX},${offY}) scale(${scale})`);
}

function render() {
  fitView();
  renderEdges();
  renderNodes();
  renderStats();
  renderInspector();
  renderPromptBox();
}

window.addEventListener('resize', () => render());

function renderEdges() {
  const g = $('#edges');
  g.innerHTML = '';
  graph.edges.forEach(e => {
    const a = nodeById(e.from), b = nodeById(e.to);
    if (!a || !b) return;
    const ax = a.x + 96, ay = a.y + 30, bx = b.x, by = b.y + 30;
    const dx = Math.max(40, Math.abs(bx - ax) * 0.5);
    const path = document.createElementNS(SVGNS, 'path');
    path.setAttribute('d', `M${ax},${ay} C${ax + dx},${ay} ${bx - dx},${by} ${bx},${by}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', e.label === '打回' ? '#f472b6' : '#4d4a6b');
    path.setAttribute('stroke-width', '1.8');
    path.setAttribute('marker-end', 'url(#arrow)');
    g.appendChild(path);
    if (e.label) {
      const t = document.createElementNS(SVGNS, 'text');
      t.setAttribute('x', (ax + bx) / 2);
      t.setAttribute('y', (ay + by) / 2 - 6);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('fill', e.label === '打回' ? '#f472b6' : '#8b88ab');
      t.setAttribute('font-size', '11');
      t.textContent = e.label;
      g.appendChild(t);
    }
  });
}

function renderNodes() {
  const g = $('#nodes');
  g.innerHTML = '';
  graph.nodes.forEach(n => {
    const k = E.NodeKind[n.kind];
    const grp = document.createElementNS(SVGNS, 'g');
    grp.setAttribute('class', 'node' + (n.id === selectedId ? ' sel' : ''));
    grp.setAttribute('transform', `translate(${n.x},${n.y})`);

    const rect = document.createElementNS(SVGNS, 'rect');
    rect.setAttribute('x', '0'); rect.setAttribute('y', '0');
    rect.setAttribute('width', '192'); rect.setAttribute('height', '60');
    rect.setAttribute('rx', '13');
    rect.setAttribute('fill', 'rgba(255,255,255,.045)');
    rect.setAttribute('stroke', n.id === selectedId ? k.color : 'rgba(255,255,255,.14)');
    rect.setAttribute('stroke-width', n.id === selectedId ? 2.4 : 1.2);
    grp.appendChild(rect);

    // 左侧色条
    const bar = document.createElementNS(SVGNS, 'rect');
    bar.setAttribute('x', '0'); bar.setAttribute('y', '0');
    bar.setAttribute('width', '4'); bar.setAttribute('height', '60');
    bar.setAttribute('rx', '2'); bar.setAttribute('fill', k.color);
    grp.appendChild(bar);

    const icon = document.createElementNS(SVGNS, 'text');
    icon.setAttribute('x', '16'); icon.setAttribute('y', '24');
    icon.setAttribute('font-size', '13'); icon.setAttribute('fill', k.color);
    icon.textContent = k.icon;
    grp.appendChild(icon);

    const title = document.createElementNS(SVGNS, 'text');
    title.setAttribute('x', '36'); title.setAttribute('y', '25');
    title.setAttribute('font-size', '13.5'); title.setAttribute('fill', '#eae8f5');
    title.setAttribute('font-weight', '600');
    title.textContent = n.title;
    grp.appendChild(title);

    const sub = document.createElementNS(SVGNS, 'text');
    sub.setAttribute('x', '36'); sub.setAttribute('y', '44');
    sub.setAttribute('font-size', '11'); sub.setAttribute('fill', '#9390ad');
    const role = E.AgentRoles.find(r => r.id === n.role);
    const toolTxt = n.config && n.config.tool ? ' · ' + (E.ToolRegistry[n.config.tool] || { label: n.config.tool }).label : '';
    sub.textContent = k.label + (role ? ' · ' + role.label : '') + toolTxt;
    grp.appendChild(sub);

    grp.addEventListener('click', ev => { if (!dragMoved) { selectedId = n.id; render(); } });
    grp.addEventListener('pointerdown', ev => startDrag(ev, n, grp));
    g.appendChild(grp);
  });
}

/* ═════ 拖拽 ═════ */
let dragMoved = false;
function startDrag(ev, node, grp) {
  ev.preventDefault();
  dragMoved = false;
  const svg = $('#graph');
  const rect = svg.getBoundingClientRect();
  const startX = ev.clientX, startY = ev.clientY;
  const ox = node.x, oy = node.y;

  const move = e => {
    const dx = (e.clientX - startX) / scale;
    const dy = (e.clientY - startY) / scale;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true;
    node.x = Math.round(ox + dx);
    node.y = Math.round(oy + dy);
    renderEdges();
    grp.setAttribute('transform', `translate(${node.x},${node.y})`);
  };
  const up = () => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    if (dragMoved) {
      // 只重绘图元，不重算 fitView，避免用户刚拖好的位置被重新缩放
      renderEdges();
      renderNodes(); persist();
      setTimeout(() => { dragMoved = false; }, 50);
    }
  };
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', up);
}

function renderStats() {
  const s = E.graphStats(graph);
  $('#pillStats').textContent = `${s.total} 节点 · ${s.edges} 连线 · ${s.hasCycle ? '⚠ 有环' : '无环'}`;
  const kinds = Object.entries(s.byKind).map(([k, v]) =>
    `<div class="stat"><b>${v}</b><span>${E.NodeKind[k].label}</span></div>`).join('');
  $('#stats').innerHTML = kinds +
    `<div class="stat"><b>${s.hasCycle ? '有环' : '无环'}</b><span>拓扑</span></div>`;
  if (s.hasCycle) {
    $('#stats').innerHTML += `<div class="warn">⚠️ 工作流存在环路，模拟执行将按拓扑序兜底运行。</div>`;
  }
  if (s.orphans.length) {
    $('#stats').innerHTML += `<div class="warn">⚠️ 有 ${s.orphans.length} 个孤立节点未连线。</div>`;
  }
}

/* ═════ 检查器 ═════ */
function renderInspector() {
  const box = $('#inspector');
  const n = nodeById(selectedId);
  if (!n) { box.innerHTML = '<div class="sub">尚未选中节点</div>'; return; }
  const k = E.NodeKind[n.kind];
  const roles = E.AgentRoles.map(r =>
    `<option value="${r.id}" ${n.role === r.id ? 'selected' : ''}>${r.label} — ${r.duty}</option>`).join('');
  const tools = Object.entries(E.ToolRegistry).map(([id, t]) =>
    `<option value="${id}" ${n.config.tool === id ? 'selected' : ''}>${t.label}</option>`).join('');

  box.innerHTML = `
    <div class="row" style="margin:8px 0 4px">
      <span class="pill" style="background:${k.color}22;color:${k.color}">${k.icon} ${k.label}</span>
      <span class="pill">${E.promptVersion(n)}</span>
    </div>
    <label class="fl">节点名称</label>
    <input type="text" id="iTitle" value="${esc(n.title)}">
    <label class="fl">角色</label>
    <select id="iRole">${roles}</select>
    ${n.kind === 'agent' || n.kind === 'branch' ? `
    <label class="fl">绑定工具</label>
    <select id="iTool"><option value="">（不绑定）</option>${tools}</select>` : ''}
    ${n.kind === 'branch' ? `
    <label class="fl">质量阈值（低于此值打回重做）</label>
    <input type="text" id="iTh" value="${n.config.threshold ?? 0.7}">` : ''}
    <label class="fl">附加提示词要求</label>
    <textarea id="iPrompt" placeholder="例如：输出必须包含 3 个具体数字">${esc(n.prompt || '')}</textarea>
    <div class="row" style="margin-top:12px">
      <button class="btn sm" id="iSave">保存</button>
      <button class="btn sm ghost" id="iDel">删除节点</button>
    </div>`;

  $('#iSave').onclick = () => {
    const before = n.prompt || '';
    n.title = $('#iTitle').value.trim() || n.title;
    n.role = $('#iRole').value;
    if ($('#iTool')) n.config.tool = $('#iTool').value || null;
    if ($('#iTh')) n.config.threshold = parseFloat($('#iTh').value) || 0.7;
    const after = $('#iPrompt').value;
    if (after !== before) {
      n.prompt = after;
      // 记录历史版本
      const h = history[n.id] = history[n.id] || [];
      h.push({ version: E.promptVersion(n), prompt: after, time: new Date().toLocaleTimeString('zh-CN') });
      if (h.length > 12) h.shift();
    }
    render(); persist();
  };
  $('#iDel').onclick = () => {
    if (n.kind === 'start' || n.kind === 'end') { alert('开始/结束节点不可删除'); return; }
    graph.nodes = graph.nodes.filter(x => x.id !== n.id);
    graph.edges = graph.edges.filter(e => e.from !== n.id && e.to !== n.id);
    selectedId = null;
    render(); persist();
  };
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderPromptBox() {
  const n = nodeById(selectedId);
  if (!n) { $('#pvBox').innerHTML = '<div class="sub">选中节点后显示</div>'; $('#promptOut').textContent = '// 选中节点后显示生成的完整提示词'; return; }
  const v = E.promptVersion(n);
  const h = history[n.id] || [];
  $('#pvBox').innerHTML = `
    <div class="kv"><span>当前版本</span><b>${v}</b></div>
    <div class="kv"><span>历史版本数</span><b>${h.length}</b></div>
    <div class="kv"><span>最近修改</span><b>${h.length ? h[h.length - 1].time : '—'}</b></div>`;
  $('#promptOut').textContent = E.buildPrompt(n, $('#input').value);
}

/* ═════ 执行 ═════ */
async function run() {
  if (running) return;
  running = true;
  const generation = ++runGeneration;
  $('#btnRun').textContent = '⏳ 执行中…';
  $('#btnRun').disabled = true;
  $('#timeline').innerHTML = '';

  const res = E.simulate(graph, $('#input').value);
  runEvents = res.events;

  for (const ev of res.events) {
    if (generation !== runGeneration) return;
    const row = document.createElement('div');
    const kind = E.NodeKind[nodeById(ev.nodeId)?.kind || 'end'];
    row.className = 'tl ' + ev.phase;
    row.innerHTML = `<span class="t">${(ev.t / 1000).toFixed(2)}s</span>
      <span class="n" style="color:${kind.color}">${esc(nodeById(ev.nodeId)?.title || ev.nodeId)}</span>
      <span class="m">${esc(ev.text)}</span>`;
    row.onclick = () => { selectedId = ev.nodeId; render(); };
    $('#timeline').appendChild(row);
    await new Promise(r => setTimeout(r, 260));
  }

  if (generation !== runGeneration) return;
  const end = document.createElement('div');
  end.className = 'tl';
  end.innerHTML = `<span class="t">—</span><span class="m">流程完成，模拟耗时 ${res.simulatedClock}ms，共 ${res.events.length} 个事件</span>`;
  $('#timeline').appendChild(end);

  running = false;
  $('#btnRun').textContent = '▶ 运行沙盘';
  $('#btnRun').disabled = false;
}

/* ═════ 事件 ═════ */
$('#btnRun').onclick = run;
$('#btnReset').onclick = () => { runGeneration++; running = false; $('#btnRun').disabled = false; $('#btnRun').textContent = '▶ 运行沙盘'; $('#timeline').innerHTML = '<div class="tl"><span class="m">点击「运行沙盘」开始，事件会逐条出现在这里。</span></div>'; graph = E.createGraph(); selectedId = null; history = {}; render(); persist(); };
$('#btnExport').onclick = () => {
  const data = { format: 'agentsandbox.flow/v1', name: '演示工作流', input: $('#input').value, graph, history };
  const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = 'agent-flow.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
};
$('#btnSample').onclick = () => { sampleIdx = (sampleIdx + 1) % SAMPLES.length; $('#input').value = SAMPLES[sampleIdx]; renderPromptBox(); persist(); };
$('#btnClear').onclick = () => { $('#input').value = ''; renderPromptBox(); persist(); };
$('#input').onchange = () => { renderPromptBox(); persist(); };
$('#input').oninput = () => renderPromptBox();
$('#btnCopyPrompt').onclick = async () => {
  const n = nodeById(selectedId);
  if (!n) return;
  try { await navigator.clipboard.writeText(E.buildPrompt(n, $('#input').value)); $('#btnCopyPrompt').textContent = '✅ 已复制'; }
  catch (e) { $('#btnCopyPrompt').textContent = '⚠️ 复制失败'; }
  setTimeout(() => { $('#btnCopyPrompt').textContent = '📋 复制提示词'; }, 1400);
};
$('#btnHist').onclick = () => {
  const n = nodeById(selectedId);
  if (!n) return;
  const h = history[n.id] || [];
  if (!h.length) { $('#promptOut').textContent = '// 该节点还没有修改记录'; return; }
  $('#promptOut').textContent = h.map(x => `── ${x.version} @ ${x.time} ──\n${x.prompt || '(空附加要求)'}`).join('\n\n');
};

/* 初始化：读取完成前禁止修改，避免覆盖已有数据 */
const controls = [...document.querySelectorAll('button, input, textarea, select')];
document.querySelector('.layout').inert = true;
controls.forEach(el => el.disabled = true);
status.textContent = '正在读取保存的工作流…';
render();
(async () => {
try {
  const result = await sql('SELECT state FROM sandbox_state WHERE id = ?', ['main']);
  if (result.rows.length) {
    const saved = JSON.parse(result.rows[0].state);
    graph = saved.graph; history = saved.history || {}; $('#input').value = saved.input || '';
  }
  ready = true; document.querySelector('.layout').inert = false; render(); status.textContent = '已连接保存的工作流';
  controls.forEach(el => el.disabled = false);
} catch (error) { status.textContent = '无法读取工作流，请检查连接后刷新'; }
})();

