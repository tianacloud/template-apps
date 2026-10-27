/* ============================================================
   Pulse · 3D 运维根因沙盘 —— 交互层
   ============================================================ */
import * as E from './engine.js';
import { PulseScene } from './scene.js';

const $ = s => document.querySelector(s);

/* ── 状态 ──────────────────────────────────────────── */
let ctx2 = null;
const S = {
  scenario: 'dbpool',
  metrics: null,
  traces: [],
  roots: [],
  selected: null,
  confirmed: null,
  autoRot: false,
  traceFilter: 'all',
  lastTrace: null
};

const scene = new PulseScene({ services: E.SERVICES, metrics: null, traces: [], roots: [] });
const canvas = $('#view');
const ctx = canvas.getContext('2d');

/* ── 场景切换 ──────────────────────────────────────── */
function loadScenario(id) {
  S.scenario = id;
  S.metrics = E.generateMetrics(id, 60, 1);
  S.traces = E.generateTraces(S.metrics, 110, 1);
  S.roots = E.analyzeRootCause(S.metrics, S.traces);
  S.selected = null;
  S.confirmed = null;
  scene.setData(S.metrics, S.traces, S.roots);
  renderAll();
  const sc = E.SCENARIOS.find(x => x.id === id);
  $('#tip').innerHTML = '<h4><span>⚠</span>' + sc.name + '</h4>'
    + sc.desc + '<br><br><code>排查提示</code> ' + sc.hint;
}

/* ── 渲染面板 ──────────────────────────────────────── */
function renderAll() {
  renderScenarioBar();
  renderOverview();
  renderRoots();
  renderP95Chart();
  renderWaterfall();
  renderTraceList();
  renderVerdict();
  $('#hTrace').textContent = S.traces.length;
  $('#hAnom').textContent = S.roots.filter(r => r.z >= 2).length;
}

function renderScenarioBar() {
  $('#scenBar').innerHTML = E.SCENARIOS.map(s =>
    `<button data-s="${s.id}" class="${s.id === S.scenario ? 'on' : ''}">${s.short}</button>`).join('');
  $('#scenBar').querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => loadScenario(b.dataset.s)));
}

function renderOverview() {
  const m = S.metrics.points;
  const all = Object.keys(m);
  const errs = all.reduce((a, id) => a + m[id].points[59].errRate, 0) / all.length;
  const p95 = all.reduce((a, id) => a + m[id].points[59].p95, 0) / all.length;
  const baseP95 = all.reduce((a, id) => a + m[id].base.p95, 0) / all.length;
  const errTraces = S.traces.filter(t => t.status === 'error').length;
  const slowTraces = S.traces.filter(t => t.status === 'slow').length;
  const worst = S.roots[0];

  $('#ovTag').textContent = 'T+' + S.metrics.injectedAt + 'min 注入';
  const cards = [
    { lb: '平均 p95', vl: Math.round(p95) + 'ms', sub: '基线 ' + Math.round(baseP95) + 'ms · '
        + (p95 > baseP95 * 1.4 ? '↑ ' + Math.round((p95 / baseP95 - 1) * 100) + '%' : '正常'),
      cls: p95 > baseP95 * 1.4 ? 'bad' : 'ok' },
    { lb: '平均错误率', vl: errs.toFixed(2) + '%', sub: '错误链路 ' + errTraces + ' / ' + S.traces.length,
      cls: errs > 2 ? 'bad' : (errs > 0.8 ? 'warn' : 'ok') },
    { lb: '慢响应链路', vl: String(slowTraces), sub: '总耗时 > 600ms', cls: slowTraces > 6 ? 'warn' : 'ok' },
    { lb: '首要嫌疑', vl: worst ? worst.name.split('-')[0] : '—',
      sub: worst ? '贡献度 ' + worst.share + '%' : '—', cls: 'bad' }
  ];
  $('#ovCards').innerHTML = cards.map(c =>
    `<div class="card ${c.cls}"><div class="lb">${c.lb}</div><div class="vl">${c.vl}</div><div class="sub">${c.sub}</div></div>`
  ).join('');
}

function renderRoots() {
  const list = S.roots.slice(0, 5);
  $('#rootList').innerHTML = list.map((r, i) => {
    const tier = { gw: '接入', biz: '业务', data: '数据', ext: '外部' }[r.tier] || '业务';
    return `<div class="root ${i === 0 ? 'win' : ''}" data-id="${r.id}">
      ${r.isRoot ? '<span class="badge">ROOT</span>' : ''}
      <div class="r1">
        <span class="rk">${i + 1}</span>
        <span class="nm">${r.name}</span>
        <span class="pc">${r.share}%</span>
      </div>
      <div class="bar2"><i style="width:${r.share}%"></i></div>
      <div class="r2">
        <span>${tier}层</span>
        <span>Z=${r.z}</span>
        <span>错误首跳 ${r.failRate}%</span>
        <span>扇出 ${r.fanout}</span>
      </div>
    </div>`;
  }).join('');
  $('#rootList').querySelectorAll('.root').forEach(el =>
    el.addEventListener('click', () => selectService(el.dataset.id)));
}

function renderP95Chart() {
  const cv = $('#chartP95');
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth, h = cv.clientHeight;
  cv.width = w * dpr; cv.height = h * dpr;
  ctx2 = cv.getContext('2d');
  ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx2.clearRect(0, 0, w, h);
  const m = S.metrics;
  const ids = S.roots.slice(0, 4).map(r => r.id);
  if (!ids.length) return;
  const colors = { gw: '#38bdf8', biz: '#a78bfa', data: '#34d399', ext: '#fbbf24' };
  const all = [];
  ids.forEach(id => m.points[id].points.forEach(p => all.push(p.p95)));
  const max = Math.max.apply(null, all) * 1.1;
  const pad = { l: 30, r: 8, t: 8, b: 16 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;

  // 网格
  ctx2.strokeStyle = 'rgba(255,255,255,.06)'; ctx2.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const y = pad.t + ih * i / 3;
    ctx2.beginPath(); ctx2.moveTo(pad.l, y); ctx2.lineTo(w - pad.r, y); ctx2.stroke();
    ctx2.fillStyle = 'rgba(140,150,190,.5)'; ctx2.font = '9px Consolas,monospace';
    ctx2.textAlign = 'right';
    ctx2.fillText(Math.round(max * (1 - i / 3)), pad.l - 5, y + 3);
  }
  // 注入时刻竖线
  const ix = pad.l + iw * (m.injectedAt / m.minutes);
  ctx2.strokeStyle = 'rgba(244,63,94,.55)'; ctx2.setLineDash([4, 3]);
  ctx2.beginPath(); ctx2.moveTo(ix, pad.t); ctx2.lineTo(ix, pad.t + ih); ctx2.stroke();
  ctx2.setLineDash([]);
  ctx2.fillStyle = 'rgba(244,63,94,.85)'; ctx2.font = '9px Consolas,monospace'; ctx2.textAlign = 'left';
  ctx2.fillText('注入', ix + 3, pad.t + 9);

  // 曲线
  ids.forEach(id => {
    const pts = m.points[id].points;
    ctx2.strokeStyle = colors[m.points[id] ? svcTier(id) : 'biz'];
    ctx2.lineWidth = 1.7;
    ctx2.beginPath();
    pts.forEach((p, i) => {
      const x = pad.l + iw * (i / (m.minutes - 1));
      const y = pad.t + ih * (1 - p.p95 / max);
      i ? ctx2.lineTo(x, y) : ctx2.moveTo(x, y);
    });
    ctx2.stroke();
  });

  $('#lgP95').innerHTML = ids.map(id => {
    const s = E.SERVICES.find(x => x.id === id);
    return `<span><i style="background:${colors[svcTier(id)]}"></i>${s ? s.name : id}</span>`;
  }).join('') + '<span style="margin-left:auto;color:rgba(244,63,94,.8)">| 虚线 = 故障注入时刻</span>';
}
function svcTier(id) {
  const s = E.SERVICES.find(x => x.id === id);
  return s ? s.tier : 'biz';
}

function renderWaterfall() {
  const slow = S.traces.filter(t => t.status !== 'ok').sort((a, b) => b.total - a.total);
  const t = slow[0] || S.traces[0];
  S.lastTrace = t;
  if (!t) { $('#wf').innerHTML = '<div class="r">无数据</div>'; return; }
  const max = t.total || 1;
  const colors = { gw: '#38bdf8', biz: '#a78bfa', data: '#34d399', ext: '#fbbf24' };
  $('#wfTag').textContent = t.id + ' · ' + Math.round(t.total) + 'ms';
  $('#wf').innerHTML = t.hops.map(h => {
    const left = (h.start / max) * 100;
    const wid = Math.max(3, (h.dur / max) * 100);
    return `<div class="r">
      <span class="nm">${h.name}</span>
      <span class="track"><span class="bar3" style="left:${left}%;width:${wid}%;background:${h.error ? '#f43f5e' : colors[h.tier]};opacity:${h.error ? 1 : .78}"></span></span>
      <span class="du">${Math.round(h.dur)}ms</span>
    </div>`;
  }).join('');
}

function renderTraceList() {
  const list = S.traces.slice(0, 60);
  const color = { ok: '#34d399', slow: '#fbbf24', error: '#f43f5e' };
  $('#trTag').textContent = list.length + ' 条';
  $('#traceList').innerHTML = list.map(t => {
    const path = t.path.map(p => {
      const s = E.SERVICES.find(x => x.id === p);
      return s ? s.name.replace('-service', '').replace('api-', '') : p;
    }).join(' → ');
    return `<div class="tr" data-id="${t.id}">
      <span class="st" style="background:${color[t.status]}"></span>
      <span class="id2">${t.id}</span>
      <span class="path2">${path}</span>
      <span class="tm">${Math.round(t.total)}ms</span>
    </div>`;
  }).join('');
  $('#traceList').querySelectorAll('.tr').forEach(el =>
    el.addEventListener('click', () => {
      const t = S.traces.find(x => x.id === el.dataset.id);
      if (t) { S.lastTrace = t; renderWaterfall(); highlightPath(t.path); }
    }));
}

let hlPath = [];
function highlightPath(path) {
  hlPath = path;
}

function renderVerdict() {
  const txt = E.buildSummary(S.metrics, S.roots, S.traces);
  $('#verdict').textContent = txt;
}

/* ── 服务选中面板 ──────────────────────────────────── */
function selectService(id) {
  S.selected = id;
  scene.selected = id;
  const s = E.SERVICES.find(x => x.id === id);
  if (!s) return;
  const m = S.metrics.points[id];
  const p = m.points[m.points.length - 1];
  const info = S.roots.find(r => r.id === id);
  const tier = { gw: '接入层', biz: '业务层', data: '数据层', ext: '外部依赖' }[s.tier];
  const deps = s.deps.map(d => {
    const x = E.SERVICES.find(v => v.id === d);
    return x ? x.name : d;
  });
  const el = $('#selInfo');
  el.style.display = 'block';
  el.innerHTML = `<h5>${s.name}</h5>
    <div class="kv"><span>层级</span><span>${tier}</span></div>
    <div class="kv"><span>p95</span><span>${Math.round(p.p95)} ms</span></div>
    <div class="kv"><span>错误率</span><span>${p.errRate.toFixed(2)} %</span></div>
    <div class="kv"><span>CPU</span><span>${Math.round(p.cpu)} %</span></div>
    <div class="kv"><span>依赖下游</span><span>${deps.length ? deps.join(', ') : '无'}</span></div>
    ${info ? `<div class="kv"><span>贡献度</span><span>${info.share} %</span></div>` : ''}
    ${info && info.isRoot ? '<span class="root-tag">★ 已确认为根因</span>' : ''}`;
}

/* ── 确认根因 ──────────────────────────────────────── */
$('#btnConfirm').addEventListener('click', () => {
  const id = S.selected || (S.roots[0] && S.roots[0].id);
  if (!id) return;
  S.confirmed = id;
  scene.burst(id);
  selectService(id);
  const s = E.SERVICES.find(x => x.id === id);
  const info = S.roots.find(r => r.id === id);
  const extra = [];
  if (info && !info.isRoot) {
    extra.push('注意：该节点是被上游拖累的「受害节点」，真正的根因是 '
      + (S.roots[0] ? S.roots[0].name : '上游服务') + '。');
  }
  extra.push('根因已锁定，下游 ' + (E.SERVICES.find(x => x.id === id) || {deps: []}).deps.length
    + ' 个依赖服务进入降级观察名单。');
  const box = $('#verdict');
  box.textContent = '【人工确认】' + s.name + ' 被判定为本次事故的根因节点。\n'
    + (info ? '模型贡献度 ' + info.share + '%，错误首跳占比 ' + info.failRate + '%，被 ' + info.fanout + ' 个上游直接依赖。\n' : '')
    + extra.join('\n') + '\n\n'
    + E.buildSummary(S.metrics, S.roots, S.traces);
  box.style.borderColor = 'rgba(244,63,94,.55)';
  box.style.background = 'linear-gradient(135deg,rgba(244,63,94,.14),rgba(244,63,94,.04))';
});

$('#btnReset2').addEventListener('click', () => {
  S.selected = null; S.confirmed = null;
  scene.selected = null;
  $('#selInfo').style.display = 'none';
  const box = $('#verdict');
  box.style.borderColor = ''; box.style.background = '';
  renderVerdict();
  renderOverview();
});

/* ── 视图控制 ──────────────────────────────────────── */
$('#btnRot').addEventListener('click', e => {
  S.autoRot = !S.autoRot;
  e.currentTarget.style.background = S.autoRot ? 'rgba(56,189,248,.25)' : '';
});
$('#btnIn').addEventListener('click', () => scene.cam.zoom(-260));
$('#btnOut').addEventListener('click', () => scene.cam.zoom(260));
$('#btnReset').addEventListener('click', () => {
  const c = scene.cam;
  c.theta = -0.62; c.phi = 1.02; c.dist = 11.0; c.tx = c.ty = c.tz = 0;
});

/* 鼠标交互：拖拽旋转 / 滚轮缩放 / 点击拾取 */
let dragging = false, lastX = 0, lastY = 0, moved = 0;
canvas.addEventListener('pointerdown', e => {
  dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY;
  canvas.classList.add('grabbing');
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  moved += Math.abs(dx) + Math.abs(dy);
  lastX = e.clientX; lastY = e.clientY;
  if (e.shiftKey) scene.cam.pan(dx, dy);
  else scene.cam.rotate(dx, dy);
});
canvas.addEventListener('pointerup', e => {
  dragging = false;
  canvas.classList.remove('grabbing');
  if (moved < 5) {
    const r = canvas.getBoundingClientRect();
    const s = scene.pick(e.clientX - r.left, e.clientY - r.top);
    if (s) { selectService(s.id); scene.burst(s.id); }
  }
});
canvas.addEventListener('wheel', e => { e.preventDefault(); scene.cam.zoom(e.deltaY); }, { passive: false });

/* ── 尺寸自适应 ────────────────────────────────────── */
function resize() {
  const st = $('#stage');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = st.clientWidth * dpr;
  canvas.height = st.clientHeight * dpr;
  canvas.style.width = st.clientWidth + 'px';
  canvas.style.height = st.clientHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  scene.setSize(st.clientWidth, st.clientHeight);
  renderP95Chart();
}
window.addEventListener('resize', resize);

/* ── 主循环 ────────────────────────────────────────── */
let last = performance.now(), fpsAcc = 0, fpsN = 0;
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (S.autoRot) scene.cam.rotate(dt * 22, 0);
  scene.update(dt);
  const st = $('#stage');
  ctx.clearRect(0, 0, st.clientWidth, st.clientHeight);
  scene.draw(ctx, st.clientWidth, st.clientHeight);
  fpsAcc += dt; fpsN++;
  if (fpsAcc >= 0.5) { $('#hFps').textContent = Math.round(fpsN / fpsAcc); fpsAcc = 0; fpsN = 0; }
  requestAnimationFrame(loop);
}

/* ── 启动 ──────────────────────────────────────────── */
resize();
loadScenario('dbpool');
requestAnimationFrame(loop);
globalThis.__PULSE = { S, scene, E };
