/* ==========================================================================
 * 资产管理系统 · 机柜图表模块（机房表视图）
 * 机柜交互：机柜拖动对齐 / 预留间隔 / Alt 精确放置 / 全局防重叠 /
 * 参考条常显 / 点选+标签跨柜 / U3 起+空 1U / 左下统计联动。
 * 数据全部来自 /api（机柜表 + 设备行 content 的 rackId/uStart/uSize）。
 * 纯原生 JS、无构建、无外部依赖 —— 与系统其他模块保持一致。
 * ========================================================================== */
(function (global) {
  'use strict';
  var UX = global.UX;
  var API = global.API;
  var Store = global.Store;
  if (!UX || !API) return;

  var $ = UX.$, $$ = UX.$$, esc = UX.esc, icon = UX.icon;
  var toast = UX.toast, openModal = UX.openModal, confirmBox = UX.confirmBox;

  /* ------------------------------ 常量 ------------------------------ */
  var RACK_W = 104, RACK_H = 158;      // 房间视图机柜盒尺寸
  var SLOT = 21;                       // 抽屉立面每 U 像素高
  var U_START = 3;                     // 新设备默认从 U3 开始
  var GAP_MIN = 22, GAP_DEF = 40, GAP_MAX = 96;
  var SNAP_TOL = 60, ROW_TOL = 30, CANVAS_PAD = 64;

  var state = {
    tid: null, layout: null, table: null,
    detail: null,          // {rackId}
    selDev: null,          // 选中设备 {assetId, tableId, rackId}
    rackDrag: null, pan: null, devDrag: null,
    view: { z: 1, px: 0, py: 0 },
    busy: false
  };
  var host = null, world = null, stage = null;
  var guideH = null, guideV = null;
  var toastLastMsg = '', toastLastAt = 0;

  /* ------------------------------ 工具 ------------------------------ */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function devOf(rackId) {
    if (!state.layout) return [];
    for (var i = 0; i < state.layout.racks.length; i++) {
      if (state.layout.racks[i].id === rackId) return state.layout.racks[i].devices || [];
    }
    return [];
  }
  function rackOf(rackId) {
    if (!state.layout) return null;
    for (var i = 0; i < state.layout.racks.length; i++) {
      if (state.layout.racks[i].id === rackId) return state.layout.racks[i];
    }
    return null;
  }
  function findDev(assetId) {
    if (!state.layout) return null;
    var i, j, rs = state.layout.racks;
    for (i = 0; i < rs.length; i++) {
      var ds = rs[i].devices || [];
      for (j = 0; j < ds.length; j++) if (ds[j].assetId === assetId) return { rack: rs[i], dev: ds[j] };
    }
    return null;
  }
  function catClass(cat) {
    var c = String(cat || '');
    if (/网络|交换|路由/.test(c)) return 'c-net';
    if (/服务/.test(c)) return 'c-srv';
    if (/存储/.test(c)) return 'c-sto';
    if (/安全|防火墙/.test(c)) return 'c-sec';
    return 'c-oth';
  }
  function uRangeTxt(d) { return 'U' + d.uStart + (d.uSize > 1 ? '-' + (d.uStart + d.uSize - 1) : ''); }
  function tip(msg) {   // 防抖 toast
    var now = Date.now();
    if (msg === toastLastMsg && now - toastLastAt < 2500) return;
    toastLastMsg = msg; toastLastAt = now;
    toast(msg);
  }

  /* ------------------------------ 机柜吸附 / 防重叠 ------------------------------ */
  function rowTarget(rm, drag, self) {
    var best = null, bd = 1e9;
    rm.forEach(function (o) {
      if (o === self) return;
      var d = Math.abs(o.y - drag.y);
      if (d < bd) { bd = d; best = o; }
    });
    if (!best || bd > SNAP_TOL) return null;
    var rowY = best.y;
    var members = rm.filter(function (o) { return o === self ? false : Math.abs(o.y - rowY) < ROW_TOL; });
    members.sort(function (a, b) { return a.x - b.x; });
    return { y: rowY, members: members, near: best, dist: bd };
  }
  function rowGap(others) {
    var gaps = [];
    for (var i = 1; i < others.length; i++) {
      var g = others[i].x - (others[i - 1].x + RACK_W);
      if (g >= GAP_MIN && g <= GAP_MAX) gaps.push(g);
    }
    if (!gaps.length) return GAP_DEF;
    gaps.sort(function (a, b) { return a - b; });
    return gaps[Math.floor(gaps.length / 2)];
  }
  function alignRack(rm, drag, self, freePlace) {
    if (freePlace) return { y: drag.y, x: drag.x, info: null, gap: GAP_DEF, prev: null, next: null, free: true };
    var info = rowTarget(rm, drag, self);
    if (!info) return { y: drag.y, x: drag.x, info: null, gap: GAP_DEF, prev: null, next: null };
    var others = info.members.filter(function (o) { return o !== self; });
    others.sort(function (a, b) { return a.x - b.x; });
    var gap = rowGap(others);
    var cx = drag.x + RACK_W / 2;
    var prev = null, next = null;
    others.forEach(function (o) {
      if (o.x + RACK_W / 2 <= cx) prev = o;
      else if (!next) next = o;
    });
    var lo = prev ? prev.x + RACK_W + GAP_MIN : 0;
    var hi = next ? next.x - RACK_W - GAP_MIN : Infinity;
    var x;
    if (lo <= hi) {
      // 底线是最小间距（GAP_MIN）：靠近某柜落点时贴边停下，由 pushOut 兜底防重叠
      x = clamp(drag.x, lo, hi);
      // 空间充裕且落点接近"等距槽位"时，吸附为中位间距插入（保持整排均匀）
      var slot = prev ? prev.x + RACK_W + gap : (next ? next.x - RACK_W - gap : drag.x);
      if (slot >= lo && slot <= hi && Math.abs(drag.x - slot) <= Math.max(SNAP_TOL, gap)) x = slot;
    } else {
      // prev..next 之间放不下：选离落点较近的一侧（交给 pushOut 推到空位）
      x = (Math.abs(drag.x - lo) <= Math.abs(drag.x - hi)) ? lo : hi;
    }
    return { y: info.y, x: x, info: info, gap: gap, prev: prev, next: next };
  }
  function overlaps(x, y, o) {
    return x < o.x + RACK_W && o.x < x + RACK_W && y < o.y + RACK_H && o.y < y + RACK_H;
  }
  function findOverlap(rm, self, x, y) {
    var hit = null;
    rm.forEach(function (o) { if (o === self || hit) return; if (overlaps(x, y, o)) hit = o; });
    return hit;
  }
  function pushOut(rm, self, x, y) {
    var hit = findOverlap(rm, self, x, y);
    if (!hit) return { x: x, y: y, hit: null };
    var mx = (x + RACK_W / 2) - (hit.x + RACK_W / 2);
    var my = (y + RACK_H / 2) - (hit.y + RACK_H / 2);
    var horiz = Math.abs(mx) >= Math.abs(my);
    var cands = horiz
      ? [{ x: mx >= 0 ? hit.x + RACK_W + GAP_MIN : hit.x - RACK_W - GAP_MIN, y: y },
         { x: x, y: hit.y - RACK_H - GAP_MIN },
         { x: x, y: hit.y + RACK_H + GAP_MIN }]
      : [{ x: x, y: my >= 0 ? hit.y + RACK_H + GAP_MIN : hit.y - RACK_H - GAP_MIN },
         { x: hit.x - RACK_W - GAP_MIN, y: y },
         { x: hit.x + RACK_W + GAP_MIN, y: y }];
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i];
      if (c.x < 0 || c.y < 0) continue;
      if (!findOverlap(rm, self, c.x, c.y)) return { x: c.x, y: c.y, hit: hit };
    }
    return null;
  }
  /* 新机柜默认排位：紧跟最右机柜右侧、保持同一水平线，且强制不重叠 */
  function newRackSpot(racks) {
    racks = racks || [];
    if (!racks.length) return { x: 64, y: 64 };
    var right = racks[0];
    racks.forEach(function (r) { if (r.x > right.x || (r.x === right.x && r.y < right.y)) right = r; });
    var x = right.x + RACK_W + GAP_MIN, y = right.y;
    for (var i = 0; i < 32; i++) {
      if (x >= 0 && y >= 0 && !findOverlap(racks, null, x, y)) return { x: x, y: y };
      x += RACK_W + GAP_MIN;   /* 理论上不会到这里；兜底继续右移找空位 */
    }
    return { x: x, y: y };
  }
  /* 与后端一致：U3 起 + 与现有机柜设备至少空 1U */
  function freeRange(rack, size) {
    var used = [];
    (rack.devices || []).forEach(function (d) {
      for (var u = d.uStart; u < d.uStart + (d.uSize || 1); u++) used.push(u);
    });
    size = size || 1;
    for (var u2 = U_START; u2 <= rack.uTotal - size + 1; u2++) {
      var rng = [], ok = true;
      for (var k = 0; k < size; k++) rng.push(u2 + k);
      for (var i = 0; i < rng.length; i++) {
        if (used.indexOf(rng[i]) > -1 || used.indexOf(rng[i] - 1) > -1 || used.indexOf(rng[i] + 1) > -1) { ok = false; break; }
      }
      if (ok) return u2;
    }
    return null;
  }

  /* ------------------------------ 参考线 ------------------------------ */
  function ensureGuides() {
    if (!guideH || !guideH.parentNode) {
      guideH = document.createElement('div'); guideH.className = 'rk-guide hx'; world.appendChild(guideH);
    }
    if (!guideV || !guideV.parentNode) {
      guideV = document.createElement('div'); guideV.className = 'rk-guide vx'; world.appendChild(guideV);
    }
  }
  function showGuides(x, y, free) {
    ensureGuides();
    guideH.style.top = y + 'px'; guideH.style.display = 'block';
    guideV.style.left = x + 'px'; guideV.style.display = 'block';
    guideH.classList.toggle('free', !!free);
    guideV.classList.toggle('free', !!free);
  }
  function hideGuides() {
    if (guideH) guideH.style.display = 'none';
    if (guideV) guideV.style.display = 'none';
  }

  /* ================================ 渲染 ================================ */
  function render(tid) {
    // 切到另一个机房时必须丢弃上一个机房的布局，否则加载失败会沿用旧机柜做上架目标
    if (state.tid !== tid) {
      state.layout = null;
      state.view = { z: 1, px: 0, py: 0 };
    }
    state.tid = tid;
    state.detail = null; state.selDev = null;
    host = $('#rackView');
    host.innerHTML =
      '<div class="rk-top">' +
      '  <div class="rk-title"><span class="tdot" id="rkDot"></span><span id="rkRoomName"></span></div>' +
      '  <div class="sp"></div>' +
      '  <button class="btn" id="rkFit">自适应视图</button>' +
      '  <button class="btn" id="rkAddRack">+ 新增机柜</button>' +
      '  <button class="btn primary" id="rkMount">+ 设备上架</button>' +
      '</div>' +
      '<div class="rk-body">' +
      '  <div class="rk-side">' +
      '    <div class="rk-card"><h4>机房统计</h4><div class="rk-stats" id="rkStats"></div></div>' +
      '    <div class="rk-card"><h4>未关联设备（可上架）</h4><div class="rk-unlink" id="rkUnlink"></div></div>' +
      '    <div class="rk-card"><h4>设备类型图例</h4><div class="rk-legend">' +
      '      <span><i style="background:var(--indigo)"></i>服务器</span>' +
      '      <span><i style="background:var(--sky)"></i>网络设备</span>' +
      '      <span><i style="background:var(--green)"></i>存储设备</span>' +
      '      <span><i style="background:var(--red)"></i>安全设备</span>' +
      '      <span><i style="background:#6b7280"></i>其他</span>' +
      '    </div></div>' +
      '  </div>' +
      '  <div class="rk-stage-wrap">' +
      '    <div class="rk-stage" id="rkStage">' +
      '      <div class="rk-world" id="rkWorld"></div>' +
      '      <div class="rk-roomname" id="rkRoomTag"></div>' +
      '    </div>' +
      '    <div class="rk-zctl"><button id="rkZin" title="放大">+</button><button id="rkZout" title="缩小">−</button></div>' +
      '    <div class="rk-zpv" id="rkZpv">100%</div>' +
      '  </div>' +
      '</div>' +
      '<div class="rk-statbar" id="rkStatBar"></div>' +
      '<div class="rk-drawer" id="rkDrawer">' +
      '  <div class="rk-dh"><div class="t"><h3 id="rkDTitle"></h3><div class="sub" id="rkDSub"></div></div>' +
      '    <button class="icon-btn" id="rkDRackEdit" title="编辑机柜">' + icon('setting') + '</button>' +
      '    <button class="icon-btn" id="rkDClose">' + icon('x') + '</button></div>' +
      '  <div class="rk-db" id="rkDBody"></div>' +
      '</div>';

    stage = $('#rkStage');
    world = $('#rkWorld');

    $('#rkFit').addEventListener('click', fitView);
    $('#rkAddRack').addEventListener('click', function () { openRackModal(); });
    $('#rkMount').addEventListener('click', function () { openMountModal(); });
    $('#rkZin').addEventListener('click', function () { zoomCenter(1.2); });
    $('#rkZout').addEventListener('click', function () { zoomCenter(1 / 1.2); });
    $('#rkDClose').addEventListener('click', closeDetail);
    $('#rkDRackEdit').addEventListener('click', openRackEditModal);
    stage.addEventListener('pointerdown', onStageDown);
    global.addEventListener('pointermove', onStageMove);
    global.addEventListener('pointerup', onStageUp);
    global.addEventListener('pointercancel', onStageUp);
    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 1 / 1.12);
    }, { passive: false });
    $('#rkDBody').addEventListener('pointerdown', startDevDrag);
    global.addEventListener('pointermove', devDragMove);
    global.addEventListener('pointerup', devDragUp);
    $('#rkDBody').addEventListener('click', onDrawerClick);

    load();
  }

  function load() {
    return API.req('GET', '/tables/' + state.tid + '/rack-layout').then(function (layout) {
      state.layout = layout;
      state.table = Store.tableOf(state.tid);
      drawAll();
    }).catch(function (e) {
      state.layout = null;   // 不用旧数据冒充新机房
      drawAll();
      toast(e.message || '机房数据加载失败', 'error');
    });
  }

  function drawAll() {
    drawTop(); drawSide(); drawRoom(); drawStatBar(); renderDetail();
  }

  function drawTop() {
    var t = state.table || {};
    $('#rkDot').style.background = t.color || '#4f46e5';
    $('#rkRoomName').textContent = (t.name || '机房') + ' · 机柜排布';
    $('#rkRoomTag').textContent = (t.name || '机房') + '（拖动排布 · Alt=精确放置 · 防重叠）';
  }

  function drawSide() {
    var st = (state.layout && state.layout.stats) || { racks: 0, devices: 0, usedU: 0, freeU: 0, pct: 0 };
    $('#rkStats').innerHTML =
      statBox(st.racks, '机柜') + statBox(st.devices, '已上架设备') +
      statBox(st.usedU, '已占用 U') + statBox(st.pct + '%', 'U 使用率', st.pct >= 70 ? 'hi' : '');
    var ul = ((state.layout && state.layout.unlinked) || []);
    if (!ul.length) {
      $('#rkUnlink').innerHTML = '<div style="font-size:12px;color:var(--text-3);padding:6px 2px">暂无未关联设备</div>';
    } else {
      $('#rkUnlink').innerHTML = ul.slice(0, 60).map(function (d) {
        // orphan：记录里还写着 rackId，但那个机柜已被删除（多为整个机房表被删）
        var sub = d.orphan && d.location ? d.location : (d.ip || '');
        return '<div class="ui' + (d.orphan ? ' orphan' : '') + '">' +
          '<span class="nm">' + esc(d.name) +
            (d.orphan ? '<i class="tag-warn">原机柜已删</i>' : '') + '</span>' +
          '<span class="ip" title="' + esc(sub) + '">' + esc(sub) + '</span>' +
          '<button class="btn sm" data-mount="' + esc(d.assetId) + '" data-tbl="' + esc(d.tableId) + '">上架</button></div>';
      }).join('') + (ul.length > 60 ? '<div style="font-size:11px;color:var(--text-3)">仅显示前 60 条…</div>' : '');
    }
  }
  function statBox(v, label, cls) {
    return '<div class="rk-stat ' + (cls || '') + '"><b>' + esc(v) + '</b><span>' + esc(label) + '</span></div>';
  }

  function drawRoom() {
    var racks = (state.layout && state.layout.racks) || [];
    var h = '';
    racks.forEach(function (r) {
      var used = (r.devices || []).reduce(function (a, d) { return a + (d.uSize || 1); }, 0);
      var pct = r.uTotal ? Math.round(used / r.uTotal * 100) : 0;
      var led = pct >= 70 ? 'hi' : (pct >= 30 ? 'mid' : '');
      var urow = '';
      for (var i = 0; i < 8; i++) urow += '<i class="' + (i < Math.round(pct / 12.5) ? 'on' : '') + '"></i>';
      h += '<div class="rk-rack' + (state.detail === r.id ? ' sel' : '') + '" data-rack="' + esc(r.id) + '"' +
        ' style="left:' + r.x + 'px;top:' + r.y + 'px">' +
        '<div class="nm"><span class="led ' + led + '"></span>' + esc(r.name || r.code) + '</div>' +
        '<div class="mt">' + used + '/' + r.uTotal + 'U · ' + (r.devices || []).length + '台</div>' +
        '<div class="fill"><i class="' + (pct >= 70 ? 'warn' : '') + '" style="width:' + pct + '%"></i></div>' +
        '<div class="urow">' + urow + '</div></div>';
    });
    if (!racks.length) {
      h = '<div class="rk-empty" style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%)">' +
        '<div class="big">本机房还没有机柜</div>点击右上角「+ 新增机柜」开始</div>';
    }
    world.innerHTML = h;
    applyRoomSize();
    applyView();
  }

  function applyRoomSize() {
    var racks = (state.layout && state.layout.racks) || [];
    var w = 560, hgt = 320;
    racks.forEach(function (r) {
      w = Math.max(w, r.x + RACK_W + CANVAS_PAD);
      hgt = Math.max(hgt, r.y + RACK_H + CANVAS_PAD);
    });
    world.style.width = w + 'px';
    world.style.height = hgt + 'px';
  }

  function applyView() {
    world.style.transform = 'translate(' + state.view.px + 'px,' + state.view.py + 'px) scale(' + state.view.z + ')';
    $('#rkZpv').textContent = Math.round(state.view.z * 100) + '%';
  }
  function fitView() {
    var W = stage.clientWidth, H = stage.clientHeight, pad = 36;
    var dr = $('#rkDrawer');
    if (dr && dr.classList.contains('open')) {
      /* 抽屉浮层遮挡舞台右侧：只把机柜适应到可见区，避免右侧机柜被抽屉压住 */
      W -= (dr.offsetWidth || 432);
    }
    var racks = (state.layout && state.layout.racks) || [];
    var w = 560, hgt = 320;
    racks.forEach(function (r) {
      w = Math.max(w, r.x + RACK_W + CANVAS_PAD);
      hgt = Math.max(hgt, r.y + RACK_H + CANVAS_PAD);
    });
    var z = clamp(Math.min((W - pad) / w, (H - pad) / hgt), 0.2, 1.4);
    state.view.z = z;
    state.view.px = (W - w * z) / 2;
    state.view.py = (H - hgt * z) / 2;
    applyView();
  }
  function zoomAt(cx, cy, factor) {
    var r = stage.getBoundingClientRect();
    var mx = cx - r.left, my = cy - r.top;
    var z2 = clamp(state.view.z * factor, 0.2, 2.5);
    var k = z2 / state.view.z;
    state.view.px = mx - (mx - state.view.px) * k;
    state.view.py = my - (my - state.view.py) * k;
    state.view.z = z2;
    applyView();
  }
  function zoomCenter(f) {
    var r = stage.getBoundingClientRect();
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, f);
  }

  /* ------------------------------ 统计条（机房级 ↔ 机柜级） ------------------------------ */
  function drawStatBar() {
    var bar = $('#rkStatBar');
    if (!bar) return;
    if (state.detail) {
      var rk = rackOf(state.detail);
      if (!rk) { state.detail = null; return drawStatBar(); }
      var used = (rk.devices || []).reduce(function (a, d) { return a + (d.uSize || 1); }, 0);
      var free = rk.uTotal - used;
      bar.classList.add('live');
      bar.innerHTML = '<span class="scope">' + esc(rk.name || rk.code) + ' · 当前机柜</span>' +
        stChip(rk.uTotal, 'U 总容量') + stChip((rk.devices || []).length, '台设备') +
        stChip(used, 'U 已占') + stChip(free, 'U 空闲') +
        stChip(rk.uTotal ? Math.round(used / rk.uTotal * 100) + '%' : '0%', '使用率') +
        '<span class="tip">点选设备后可点上方机柜标签跨柜移动 · 拖动设备上下可换 U</span>';
    } else {
      var st = (state.layout && state.layout.stats) || {};
      bar.classList.remove('live');
      bar.innerHTML = '<span class="scope">' + esc((state.table || {}).name || '机房') + ' · 全部机柜</span>' +
        stChip(st.racks || 0, '柜') + stChip(st.devices || 0, '台设备') +
        stChip(st.usedU || 0, 'U 已占') + stChip(st.freeU || 0, 'U 空闲') +
        stChip((st.pct || 0) + '%', '使用率') +
        '<span class="tip">点击机柜查看 42U 立面详情</span>';
    }
  }
  function stChip(v, label) { return '<span class="st"><b>' + esc(v) + '</b>' + esc(label) + '</span>'; }

  /* ================================ 机柜拖动 ================================ */
  function onStageDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    var t = e.target;
    if (t.closest && t.closest('.rk-zctl')) return;
    var rackEl = t.closest ? t.closest('.rk-rack') : null;
    if (rackEl) {
      var rid = rackEl.getAttribute('data-rack');
      var rk = rackOf(rid);
      if (rk) {
        state.rackDrag = { rk: rk, sx: e.clientX, sy: e.clientY, ox: rk.x, oy: rk.y, moved: false, el: rackEl, alt: false, fix: null };
        document.body.classList.add('rk-dragging');
        ensureGuides();
        try { stage.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
        return;
      }
    }
    state.pan = { sx: e.clientX, sy: e.clientY, px: state.view.px, py: state.view.py };
    stage.classList.add('panning');
    try { stage.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
  }

  function onStageMove(e) {
    var d = state.rackDrag;
    if (d) {
      if (!d.moved && Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 4) {
        d.moved = true;
        ensureGuides();
        d.el.classList.add('dragging');
        if (e.altKey) tip('精确放置模式（Alt）：保留当前位置与间隔');
      }
      d.alt = e.altKey;
      var racks = (state.layout.racks || []).filter(function (r) { return r.id !== d.rk.id; });
      var dx = (e.clientX - d.sx) / state.view.z, dy = (e.clientY - d.sy) / state.view.z;
      var want = { x: d.ox + dx, y: d.oy + dy };
      var a = alignRack(racks, want, d.rk, d.alt);
      var fx = Math.max(0, a.x), fy = Math.max(0, a.y);
      var ov = pushOut(racks, d.rk, fx, fy);
      if (!ov) { fx = d.ox; fy = d.oy; d.fix = 'back'; }
      else { fx = ov.x; fy = ov.y; d.fix = ov.hit ? 'push' : null; }
      d.rk.x = fx; d.rk.y = fy;
      d.aligned = (a.info || a.free) ? a : null;
      d.el.style.left = fx + 'px';
      d.el.style.top = fy + 'px';
      showGuides(fx, fy, !!a.free);
      applyRoomSize();
      return;
    }
    if (state.pan) {
      state.view.px = state.pan.px + (e.clientX - state.pan.sx);
      state.view.py = state.pan.py + (e.clientY - state.pan.sy);
      applyView();
    }
  }

  function onStageUp() {
    var d = state.rackDrag;
    if (d) {
      hideGuides();
      d.el.classList.remove('dragging');
      document.body.classList.remove('rk-dragging');
      if (!d.moved) {
        toggleDetail(d.rk.id);
      } else {
        /* 保存坐标到服务端（防重叠后的最终位置） */
        var rid = d.rk.id, fx = d.rk.x, fy = d.rk.y, fix = d.fix, rk = d.rk;
        API.req('POST', '/racks/' + rid + '/move', { json: { x: Math.round(fx), y: Math.round(fy) } })
          .catch(function (e) {
            /* 服务端防重叠拒绝等：重新加载以回退到已保存位置，并明确提示 */
            load();
            toast((e && e.message) || '坐标保存失败，已回退原位', 'error');
          });
        var msg;
        if (fix === 'back') msg = rk.name + ' 周围暂无足够空位，已回退原位 · ' + (rk.devices || []).length + ' 台设备跟随';
        else if (fix === 'push') msg = rk.name + ' 与相邻机柜重叠，已自动避开到空位 · ' + (rk.devices || []).length + ' 台设备跟随';
        else if (d.aligned && d.aligned.free) msg = rk.name + ' 已精确放置 · ' + (rk.devices || []).length + ' 台设备跟随';
        else if (d.aligned && d.aligned.info) {
          msg = rk.name + ' 已对齐同行机柜 · ' + (d.aligned.prev ? '与左侧 ' + d.aligned.prev.name + ' 间距 ' + d.aligned.gap + 'px' : '位于该排最左侧') +
            ' · ' + (rk.devices || []).length + ' 台设备跟随';
        } else msg = rk.name + ' 已移动 · ' + (rk.devices || []).length + ' 台设备跟随';
        tip(msg);
      }
      state.rackDrag = null;
    }
    state.pan = null;
    stage.classList.remove('panning');
  }

  /* ================================ 抽屉：机柜详情 ================================ */
  function toggleDetail(rid) {
    if (state.detail === rid) closeDetail();
    else openDetail(rid);
  }
  function openDetail(rid) {
    state.detail = rid;
    state.selDev = null;
    $('#rkDrawer').classList.add('open');
    renderDetail();
    drawStatBar();
    $$('.rk-rack').forEach(function (el) {
      el.classList.toggle('sel', el.getAttribute('data-rack') === rid);
    });
    revealRack(rid);
  }
  /* 抽屉打开后若选中机柜被压在抽屉下，轻轻平移露出（只移位、不缩放） */
  function revealRack(rid) {
    var dr = $('#rkDrawer');
    if (!dr || !dr.classList.contains('open')) return;
    var el = document.querySelector('.rk-rack[data-rack="' + rid + '"]');
    if (!el) return;
    var b = el.getBoundingClientRect(), dl = dr.getBoundingClientRect().left;
    if (b.right > dl - 12 && state.view.z > 0) {
      state.view.px -= (b.right - (dl - 12)) / state.view.z;
      applyView();
    }
  }
  function closeDetail() {
    state.detail = null;
    state.selDev = null;
    var dr = $('#rkDrawer');
    if (dr) dr.classList.remove('open');
    drawStatBar();
    $$('.rk-rack').forEach(function (el) { el.classList.remove('sel'); });
  }

  function renderDetail() {
    var body = $('#rkDBody');
    if (!body || !state.detail) return;
    var rk = rackOf(state.detail);
    if (!rk) { closeDetail(); return; }
    $('#rkDTitle').textContent = (rk.name || rk.code) + ' · ' + rk.uTotal + 'U';
    $('#rkDSub').textContent = 'U1 在最底层 · ' + (rk.devices || []).length + ' 台设备 · 默认 U3 起、设备间空 1U';

    /* 选中设备提示条 */
    var sf = null;
    if (state.selDev) {
      var f = findDev(state.selDev);
      if (f && f.rack.id === rk.id) sf = f;
      else state.selDev = null;
    }

    /* 跨柜标签通道 */
    var ch = '<span class="rk-chips"><span>移动到：</span>';
    (state.layout.racks || []).forEach(function (x) {
      if (x.id === rk.id) return;
      var free = x.uTotal - (x.devices || []).reduce(function (a, d) { return a + (d.uSize || 1); }, 0);
      ch += '<span class="rk-chip' + (state.selDev ? '' : ' off') + '" data-chip="' + esc(x.id) + '"' +
        ' title="' + (state.selDev ? '点击把当前选中设备移到 ' + esc(x.name || x.code) : '请先在下方点选一台设备') + '">' +
        esc(x.name || x.code) + '<span class="u">' + free + 'U空闲</span></span>';
    });
    ch += '</span>';

    /* U 立面（U42 顶 → U1 底） */
    var slots = '';
    for (var u = rk.uTotal; u >= 1; u--) {
      slots += '<div class="rk-slot' + (u % 2 ? ' odd' : '') + '" data-u="' + u + '" style="top:' + ((rk.uTotal - u) * SLOT) + 'px;height:' + SLOT + 'px">' +
        '<span class="u">U' + u + '</span><span class="drop"></span></div>';
    }
    var devs = '';
    (rk.devices || []).forEach(function (d) {
      var top = (rk.uTotal - (d.uStart + (d.uSize || 1) - 1)) * SLOT;
      var hgt = (d.uSize || 1) * SLOT - 3;
      devs += '<div class="rk-dev ' + catClass(d.category) + (state.selDev === d.assetId ? ' sel' : '') + '" data-dev="' + esc(d.assetId) + '"' +
        ' data-tbl="' + esc(d.tableId) + '" style="top:' + top + 'px;height:' + hgt + 'px">' +
        '<span class="bar"></span><span class="txt">' + esc(d.name) +
        ((d.uSize || 1) >= 2 && d.ip ? '<span class="ip">' + esc(d.ip) + ' · ' + esc(uRangeTxt(d)) + '</span>' : '') +
        '</span></div>';
    });

    body.innerHTML =
      (sf ? '<div class="rk-selrow" id="rkSelRow">已选中：<b>' + esc(sf.dev.name) + '</b>（' + esc(sf.dev.ip || '无IP') + ' · ' + esc(uRangeTxt(sf.dev)) + '）' +
            '<button class="btn sm" id="rkSelClear">取消选择</button></div>' : '') +
      ch +
      '<div class="rk-elev" id="rkElev" style="height:' + (rk.uTotal * SLOT) + 'px">' + slots + devs + '</div>' +
      (rk.devices && rk.devices.length ? '' : '<div class="rk-empty">本机柜暂无设备<br>点击左上角「+ 设备上架」，或把左侧「未关联设备」上架到此柜</div>');
  }

  function onDrawerClick(e) {
    var t = e.target;
    var chip = t.closest ? t.closest('[data-chip]') : null;
    if (chip) {
      if (chip.classList.contains('off')) { tip('请先在下方设备中点选一台设备，再点击机柜标签移动'); return; }
      if (!state.selDev) { tip('请先在下方设备中点选一台设备，再点击机柜标签移动'); return; }
      moveDeviceTo(state.selDev, state.detail, chip.getAttribute('data-chip'));
      return;
    }
    if (t.closest('#rkSelClear')) {
      state.selDev = null;
      renderDetail();
      return;
    }
    var dev = t.closest ? t.closest('.rk-dev') : null;
    if (dev) {
      // 刚拖动完（换U/跨柜）会补发一次 click，别把详情弹窗弹出来
      if (state.suppressDevClick && (Date.now() - state.suppressDevClick) < 400) return;
      var aid = dev.getAttribute('data-dev');
      // 单击即弹详情（可改）；同时记住选中，便于关闭后继续用顶部机柜标签移动
      state.selDev = aid;
      renderDetail();
      openDeviceModal(aid, dev.getAttribute('data-tbl'));
      return;
    }
    var slot = t.closest ? t.closest('.rk-slot .drop') : null;
    if (slot) {
      var slotEl = slot.closest('.rk-slot');
      openMountModal(state.detail, null, null,
        slotEl ? parseInt(slotEl.getAttribute('data-u'), 10) : null);
      return;
    }
    var mount = t.closest ? t.closest('[data-mount]') : null;
    if (mount && $('#rkUnlink').contains(mount)) {
      openMountModal(null, mount.getAttribute('data-mount'), mount.getAttribute('data-tbl'));
    }
  }

  /* ------------------------------ 设备拖动：换 U / 跨柜 ------------------------------ */
  function startDevDrag(e) {
    var el = e.target.closest ? e.target.closest('.rk-dev') : null;
    if (!el) {
      if (e.target.closest && e.target.closest('.rk-slot .drop')) {
        tip('请按住设备块拖动；空闲 U 槽点击可直接上架新设备');
      }
      return;
    }
    if (e.button !== undefined && e.button !== 0) return;   // 只响应左键
    // 注意：这里绝不能 preventDefault —— 它会让浏览器不再派发后续 click，
    // 表现为"点设备没反应、不弹详情"（v1.5.0 的回归缺陷）。拖动的默认
    // 行为由 pointermove 阶段处理，配合 CSS user-select:none 足够。
    e.stopPropagation();
    var aid = el.getAttribute('data-dev');
    var f = findDev(aid);
    if (!f) return;
    state.devDrag = {
      f: f, sx: e.clientX, sy: e.clientY, moved: false, srcEl: el,
      ghost: null, hot: null, last: null, alt: false
    };
    try { $('#rkElev').setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
  }
  function devDragMove(e) {
    var d = state.devDrag;
    if (!d) return;
    if (!d.moved) {
      if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) < 4) return;
      d.moved = true;
      if (e.cancelable) e.preventDefault();   // 真拖动时才抑制默认行为（选择/滚动）
      document.body.classList.add('rk-dragging');
      var g = d.srcEl.cloneNode(true);
      g.classList.add('rk-ghost');
      g.classList.remove('sel');
      g.style.width = d.srcEl.offsetWidth + 'px';
      g.style.height = d.srcEl.offsetHeight + 'px';
      document.body.appendChild(g);
      d.ghost = g;
      d.srcEl.classList.add('dragging');
      state.selDev = null;
    }
    d.alt = e.altKey;
    d.ghost.style.left = (e.clientX - d.srcEl.offsetWidth / 2) + 'px';
    d.ghost.style.top = (e.clientY - d.srcEl.offsetHeight / 2) + 'px';
    /* 命中检测：优先同柜槽位（抽屉内），其次房间视图机柜（跨柜） */
    var tgt = hitTarget(e.clientX, e.clientY);
    setDevHot(d, tgt);
  }
  function setDevHot(d, t) {
    if (d.hot && d.hot !== (t && t.el)) d.hot.classList.remove('hot');
    if (t && t.el && t.type === 'slot') t.el.classList.add('hot');
    if (t && t.el && t.type === 'rack') t.el.classList.add('hot');
    d.hot = (t && (t.type === 'slot' || t.type === 'rack')) ? t.el : null;
    d.last = t;
  }
  function hitTarget(cx, cy) {
    if (typeof document.elementFromPoint !== 'function') return null;
    var el = document.elementFromPoint(cx, cy);
    if (!el || !el.closest) return null;
    var slot = el.closest('.rk-elev .rk-slot');
    if (slot) return { type: 'slot', el: slot, u: +slot.getAttribute('data-u') };
    var rack = el.closest('.rk-rack');
    if (rack) return { type: 'rack', el: rack, rackId: rack.getAttribute('data-rack') };
    return null;
  }
  function devDragUp() {
    var d = state.devDrag;
    if (!d) return;
    state.devDrag = null;
    document.body.classList.remove('rk-dragging');
    if (d.ghost) d.ghost.remove();
    d.srcEl.classList.remove('dragging');
    if (d.hot) d.hot.classList.remove('hot');
    if (!d.moved) {
      // 单击（没拖动）= 打开设备详情，并抑制随后补发的 click，避免弹两次
      state.selDev = d.f.dev.assetId;
      renderDetail();
      state.suppressDevClick = Date.now();
      openDeviceModal(d.f.dev.assetId, d.f.dev.tableId);
      return;
    }
    var t = d.last, src = d.f;
    state.suppressDevClick = Date.now();   /* 拖动结束抑制后续 click */
    if (t && t.type === 'slot' && state.detail === src.rack.id) {
      /* 同柜换 U：落点 U 为设备顶部 */
      var newU = t.u - (src.dev.uSize || 1) + 1;
      if (newU >= 1 && newU + (src.dev.uSize || 1) - 1 <= src.rack.uTotal) {
        moveDeviceU(src.dev.assetId, src.dev.tableId, src.rack.id, newU, src.dev.uSize);
      } else {
        tip('U 位超出机柜范围，已取消');
        renderDetail();
      }
      return;
    }
    if (t && t.type === 'rack' && t.rackId !== src.rack.id) {
      moveDeviceTo(src.dev.assetId, src.rack.id, t.rackId);
      return;
    }
    tip('未命中机柜：可拖到左侧机房视图的机柜上，或点选设备后点击上方机柜标签移动');
    renderDetail();
  }

  /* ------------------------------ 设备操作（API） ------------------------------ */
  function syncTableAssets(tid) {
    if (!tid) return;
    try { Store.reloadAssets(tid); } catch (e) { /* noop */ }
  }
  function moveDeviceU(aid, tid, rid, u, size) {
    return API.req('POST', '/racks/' + rid + '/devices', { json: { assetId: aid, tableId: tid, uStart: u, uSize: size } })
      .then(function () {
        syncTableAssets(tid);
        return load();
      })
      .then(function () { tip('设备已移至 ' + uRangeTxt({ uStart: u, uSize: size })); })
      .catch(function (e) { tip(e.message || '换 U 失败'); renderDetail(); });
  }
  function moveDeviceTo(aid, fromRackId, toRackId) {
    var f = findDev(aid);
    if (!f) return;
    var tgt = rackOf(toRackId);
    if (!tgt) { tip('目标机柜不存在'); return; }
    var u = freeRange(tgt, f.dev.uSize) || 1;
    API.req('POST', '/racks/' + toRackId + '/devices', { json: { assetId: aid, tableId: f.dev.tableId, uStart: u, uSize: f.dev.uSize } })
      .then(function () {
        syncTableAssets(f.dev.tableId);
        return load();
      })
      .then(function () {
        state.selDev = null;
        tip(f.dev.name + ' 已移至 ' + (tgt.name || tgt.code) + ' ' + uRangeTxt({ uStart: u, uSize: f.dev.uSize }));
      })
      .catch(function (e) { tip(e.message || '跨柜移动失败'); renderDetail(); });
  }
  function releaseDevice(aid, tid, rid) {
    confirmBox('取消上架', '确定把设备从本机柜释放吗？<br><span style="color:#94a3b8;font-size:12.5px">' +
      '设备记录仍保留在原数据表；「存放位置」会一并清空，避免设备表与机柜图描述不一致。</span>',
    function () {
      API.req('DELETE', '/racks/' + rid + '/devices/' + aid + '?tableId=' + encodeURIComponent(tid))
        .then(function () {
          syncTableAssets(tid);
          state.selDev = null;
          return load();
        })
        .then(function () { toast('已释放 U 位，位置已清空', 'success'); })
        .catch(function (e) { toast(e.message || '操作失败', 'error'); });
    }, '确定释放');
  }

  /* ------------------------------ 设备表单（上架 / 编辑） ------------------------------
   * v1.4.0：
   *   - 表单字段按目标数据表的实际字段配置动态生成（删掉的字段不再出现）；
   *   - 「未关联设备」点上架 = 拉取原记录预填，保存走 UPDATE（绝不新建重复记录）；
   *   - 新建/上架一步完成（saveAsset 直接带 rackId/uStart/uSize），失败不留孤儿记录。
   */
  function deviceTables(curTid) {
    return Store.getTables().filter(function (t) { return t.type === 'asset' || t.type === 'rack'; });
  }

  function ctlFor(f, v) {
    var id = 'fld_' + f.key;
    v = v == null ? '' : v;
    if (f.type === 'select') {
      return '<select id="' + id + '"><option value="">— 请选择 —</option>' +
        (f.options || []).map(function (o) {
          return '<option value="' + esc(o) + '"' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>';
        }).join('') + '</select>';
    }
    if (f.type === 'textarea') return '<textarea id="' + id + '" placeholder="请输入' + esc(f.title) + '">' + esc(v) + '</textarea>';
    if (f.type === 'number') return '<input id="' + id + '" type="number" value="' + esc(v) + '">';
    if (f.type === 'date') return '<input id="' + id + '" type="date" value="' + esc(v) + '">';
    return '<input id="' + id + '" type="text" value="' + esc(v) + '" placeholder="' + (f.required ? '必填' : '选填') + '">';
  }

  function openMountModal(rackId, assetId, fromTid, presetU) {
    var tables = deviceTables();
    if (!tables.length) { toast('请先创建一个设备资产表', 'warn'); return; }
    if (!state.layout || !(state.layout.racks || []).length) { toast('本机房还没有机柜，请先新增机柜', 'warn'); return; }
    var rk = rackId ? rackOf(rackId) : null;
    if (!rk) rk = (state.layout.racks || [])[0];
    if (!rk) { toast('请先新增机柜', 'warn'); return; }

    var linked = assetId ? findDev(assetId) : null;   // 已上架
    var unlinked = null;                              // 未关联（左侧列表中）
    if (assetId && !linked) {
      var ul = (state.layout.unlinked || []);
      for (var i = 0; i < ul.length; i++) if (ul[i].assetId === assetId) { unlinked = ul[i]; break; }
    }
    var tid = fromTid || (linked && linked.dev.tableId) || (unlinked && unlinked.tableId) ||
              (Store.S.tableId && Store.tableOf(Store.S.tableId).type !== 'rack' ? Store.S.tableId : tables[0].id);
    var isEdit = !!assetId;

    API.getFields(tid).then(function (fields) {
      var formFields = (fields || []).filter(function (f) { return f.key !== 'location'; });
      // 已关联/未关联都拉全量记录：保证预填完整，且保存时不会把未展示字段写空
      var loadP = assetId ? API.getAsset(tid, assetId).catch(function () { return null; }) : Promise.resolve(null);
      return loadP.then(function (full) {
        var src = full && !full.error ? full : (linked ? linked.dev : (unlinked || {}));
        var uSize0 = parseInt(src.uSize, 10) || 1;
        var uStart0 = presetU || parseInt(src.uStart, 10) || freeRange(rk, uSize0) || 3;
        if (!state.layout) return;   // 加载期间被切表
        var body =
          '<div class="rk-mount-hint" id="mkHint">' +
          (isEdit ? '设备详情 · 当前在 <b>' + esc(rk.name || rk.code) + '</b>，修改后立即同步到设备表' : '上架到 <b>' + esc(rk.name || rk.code) + '</b>') +
          ' · 规则：U3 起、设备间空 1U</div>' +
          '<div class="form-item full"><label>设备记录存放的数据表</label>' +
          (isEdit
            ? '<input value="' + esc((Store.tableOf(tid) || {}).name || tid) + '" disabled><div class="hint">已上架设备不能改存放表（避免主键冲突）</div>'
            : '<select id="mkTbl">' + tables.map(function (t) {
                return '<option value="' + esc(t.id) + '"' + (t.id === tid ? ' selected' : '') + '>' + esc(t.name) + '</option>';
              }).join('') + '</select>') +
          '</div>' +
          '<div class="form-item"><label>' + (isEdit ? '所在机柜' : '目标机柜') + '</label><select id="mkRack">' +
            (state.layout.racks || []).map(function (r) {
              return '<option value="' + esc(r.id) + '"' + (r.id === rk.id ? ' selected' : '') + '>' + esc(r.name || r.code) + '</option>';
            }).join('') + '</select>' +
            (isEdit ? '<div class="hint">换到别的柜＝直接移柜，U 位会重新推荐</div>' : '') + '</div>' +
          '<div class="form-item"><label>起始 U</label><input id="mkU" type="number" min="1" max="' + rk.uTotal + '" value="' + uStart0 + '"></div>' +
          '<div class="form-item"><label>占用 U 数</label><input id="mkSize" type="number" min="1" max="60" value="' + uSize0 + '"></div>' +
          '<div class="form-grid-full">' + formFields.map(function (f) {
            return '<div class="form-item' + (f.type === 'textarea' ? ' full' : '') + '"><label>' + esc(f.title) +
              (f.required ? '<span class="req">*</span>' : '') + '</label>' + ctlFor(f, src[f.key]) + '</div>';
          }).join('') + '</div>';

        openModal({
          title: isEdit ? '设备详情' : '设备上架', icon: 'box',
          sub: isEdit ? esc(src.name || '') + ' · 修改后同步到设备表' : '保存后自动关联到机柜（同一份记录，不会重复）',
          width: 'wide', body: '<div class="rk-form-grid">' + body + '</div>',
          foot: (isEdit ? '<button class="btn danger" id="mkRelease">取消上架</button>' : '') +
            '<button class="btn" data-close>取消</button><button class="btn primary" id="mkSave">' + (isEdit ? '保存' : '上架') + '</button>',
          onMount: function (m) {
            var rel = $('#mkRelease', m);
            if (rel) rel.addEventListener('click', function () {
              var relTid = src.tableId || tid;
              m._close();
              releaseDevice(assetId, relTid, src.rackId || rk.id);
            });
            var rackSel = $('#mkRack', m);
            if (rackSel) rackSel.addEventListener('change', function () {
              var r2 = rackOf(this.value);
              if (!r2) return;
              var sz = parseInt($('#mkSize', m).value, 10) || 1;
              $('#mkU', m).value = freeRange(r2, sz) || 3;
              var hint = $('#mkHint', m);
              if (hint) hint.innerHTML = '设备详情 · 当前在 <b>' + esc(r2.name || r2.code) +
                '</b>，修改后立即同步到设备表 · 规则：U3 起、设备间空 1U';
            });
            $('#mkSave', m).addEventListener('click', function () {
              var data = {}, miss = [];
              formFields.forEach(function (f) {
                var el = $('#fld_' + f.key, m);
                if (!el) return;
                var val = (el.value || '').trim();
                data[f.key] = val;
                if (f.required && !val) miss.push(f.title);
              });
              if (miss.length) { toast('请填写必填项：' + miss.join('、'), 'error'); return; }
              var tblId = $('#mkTbl', m) ? $('#mkTbl', m).value : tid;
              var targetRack = $('#mkRack', m) ? $('#mkRack', m).value : rk.id;
              var uStart = parseInt($('#mkU', m).value, 10) || 3;
              var uSize = Math.max(1, parseInt($('#mkSize', m).value, 10) || 1);
              data.rackId = targetRack;
              data.uStart = uStart;
              data.uSize = uSize;
              // 关键：未关联设备走 UPDATE 原记录，不新建
              API.saveAsset(tblId, assetId || null, data).then(function (res) {
                m._close();
                state.selDev = null;
                var info = res && res.rack;
                if (info && info.status === 'linked') {
                  toast('已保存 · ' + info.room + ' ' + info.code + ' ' + uRangeTxt({uStart: info.uStart, uSize: info.uSize || 1}), 'success');
                } else {
                  toast(isEdit ? '设备已保存' : '设备已上架', 'success');
                }
                return load();
              }).catch(function (e) { toast(e.message || '保存失败', 'error'); });
            });
          }
        });
      });
    }).catch(function (e) { toast(e.message || '加载设备表单失败', 'error'); });
  }

  function openDeviceModal(aid, tid) {
    openMountModal(state.detail, aid, tid);
  }

  /* ------------------------------ 机柜表单（新增 / 编辑） ------------------------------ */
  function nextRackCode() {
    var mx = 0;
    ((state.layout && state.layout.racks) || []).forEach(function (r) {
      var m = /^[Kk](\d+)$/.exec(String(r.code || ''));
      if (m) mx = Math.max(mx, parseInt(m[1], 10));
    });
    return 'K' + (mx + 1);
  }
  function openRackModal(prefill) {
    prefill = prefill || {};
    var code = prefill.code || nextRackCode();
    openModal({
      title: '新增机柜', icon: 'box', sub: '在本机房下创建机柜',
      width: 'narrow',
      body: '<div class="form-item"><label>机柜编号<span class="req">*</span></label><input id="nrCode" value="' + esc(code) + '" placeholder="如 K1 / R03"></div>' +
        '<div class="form-item"><label>显示名称</label><input id="nrName" value="' + esc(prefill.name || '') + '" placeholder="选填，默认同编号"></div>' +
        '<div class="form-item"><label>总 U 数</label><input id="nrU" type="number" min="1" max="60" value="' + (prefill.uTotal || 42) + '"></div>' +
        '<div class="form-item"><label>排位描述</label><input id="nrRow" placeholder="选填，如 A排 03列"></div>' +
        '<div class="hint">创建后，位置文本里写了这个机柜的设备会自动关联上来。</div>',
      foot: '<button class="btn" data-close>取消</button><button class="btn primary" id="nrSave">创建</button>',
      onMount: function (m) {
        $('#nrSave', m).addEventListener('click', function () {
          var c = $('#nrCode', m).value.trim();
          if (!c) { toast('机柜编号不能为空', 'error'); return; }
          var n = (state.layout && state.layout.racks) || [];
          var spot = newRackSpot(n);
          API.req('POST', '/tables/' + state.tid + '/racks', {
            json: { code: c, name: $('#nrName', m).value.trim(), uTotal: parseInt($('#nrU', m).value, 10) || 42,
                    rowLabel: $('#nrRow', m).value.trim(), x: spot.x, y: spot.y }
          }).then(function (res) {
            m._close();
            var n2 = res && res.relinked && res.relinked.linked;
            toast('机柜已创建' + (n2 ? '，已自动关联 ' + n2 + ' 台设备' : ''), 'success');
            return load();
          }).catch(function (e) { toast(e.message || '创建失败', 'error'); });
        });
      }
    });
  }
  function openRackEditModal() {
    if (!state.detail) return;
    var rk = rackOf(state.detail);
    if (!rk) return;
    openModal({
      title: '编辑机柜', icon: 'setting', sub: esc(rk.name || rk.code),
      width: 'narrow',
      body: '<div class="form-item"><label>机柜编号<span class="req">*</span></label><input id="erCode" value="' + esc(rk.code) + '"></div>' +
        '<div class="form-item"><label>显示名称</label><input id="erName" value="' + esc(rk.name || rk.code) + '"></div>' +
        '<div class="form-item"><label>总 U 数</label><input id="erU" type="number" min="1" max="60" value="' + rk.uTotal + '"></div>' +
        '<div class="form-item"><label>排位描述</label><input id="erRow" value="' + esc(rk.rowLabel || '') + '" placeholder="选填"></div>',
      foot: '<button class="btn" data-close>取消</button>' +
        '<button class="btn danger" id="erDel">删除机柜</button>' +
        '<button class="btn primary" id="erSave">保存</button>',
      onMount: function (m) {
        $('#erSave', m).addEventListener('click', function () {
          API.req('PUT', '/racks/' + rk.id, {
            json: { code: $('#erCode', m).value.trim(), name: $('#erName', m).value.trim(),
                    uTotal: parseInt($('#erU', m).value, 10) || 42, rowLabel: $('#erRow', m).value.trim() }
          }).then(function () {
            m._close(); toast('机柜已更新', 'success');
            return load();
          }).catch(function (e) { toast(e.message || '保存失败', 'error'); });
        });
        $('#erDel', m).addEventListener('click', function () {
          var cnt = (rk.devices || []).length;
          var msg = cnt
            ? '「' + esc(rk.name || rk.code) + '」下还有 <b>' + cnt + '</b> 台设备。<br>删除后这些设备会从机柜上撤下，记录仍保留在设备表，可在左侧「未关联设备」中重新上架。'
            : '确定删除「' + esc(rk.name || rk.code) + '」吗？';
          confirmBox('删除机柜', msg, function () {
            API.req('DELETE', '/racks/' + rk.id + (cnt ? '?force=1' : '')).then(function () {
              m._close(); closeDetail();
              toast('机柜已删除' + (cnt ? '，' + cnt + ' 台设备已撤回未关联列表' : ''), 'success');
              return load();
            }).catch(function (e) { toast(e.message || '删除失败', 'error'); });
          }, cnt ? '删除并释放设备' : '确定删除');
        });
      }
    });
  }

  /* ------------------------------ 侧栏未关联设备：上架入口 ------------------------------ */
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('#rkUnlink [data-mount]') : null;
    if (b) openMountModal(null, b.getAttribute('data-mount'), b.getAttribute('data-tbl'));
  });

  /* ------------------------------ 暴露 ------------------------------ */
  global.RackView = {
    render: render,
    refresh: load,
    state: state,
    /* 供设备表联动调用：切到机房后打开「新增机柜」弹窗（编号可预填） */
    openAddRack: function (opts) {
      var tries = 0;
      (function wait() {
        if (state.layout) { openRackModal(opts || {}); return; }
        if (++tries > 30) { toast('机房视图还在加载，请稍后点「+ 新增机柜」', 'warn'); return; }
        setTimeout(wait, 100);
      })();
    }
  };
})(window);
