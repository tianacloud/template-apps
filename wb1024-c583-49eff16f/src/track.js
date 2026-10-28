/* track.js —— 沿轨道移动鼠标的通用组件（练习 / 游戏 / 挑战关共用）
 *
 * 重要：轨道必须在容器"有真实宽度"的时候绘制。
 * 页面隐藏时 clientWidth 为 0，若此时绘制，SVG 会按兜底宽度画出来并居中，
 * 造成坐标整体偏移几百像素 —— 表现就是"怎么点都点不中起点"。
 * 因此这里提供 relayout()：容器可见 / 尺寸变化后重新测量并重绘，进度不丢。
 */
(function () {
  var MK = window.MK;
  var NS = 'http://www.w3.org/2000/svg';
  var N = 90;                 // 轨道采样点数
  var FALLBACK_W = 640;       // 量不到宽度时的兜底宽度

  /* 六种航道形状（坐标 0~1 比例，绘制时按画布尺寸换算）
     lv：0 简单 / 1 普通 / 2 困难 */
  var SHAPES = [
    { name: '笔直的大道', lv: 0, fn: function (t) { return [0.06 + 0.88 * t, 0.5]; } },
    { name: '弯弯的小河', lv: 0, fn: function (t) { return [0.06 + 0.88 * t, 0.5 + 0.24 * Math.sin(t * Math.PI * 2)]; } },
    { name: '波浪线', lv: 1, fn: function (t) { return [0.06 + 0.88 * t, 0.5 + 0.27 * Math.sin(t * Math.PI * 4)]; } },
    { name: '小山丘', lv: 1, fn: function (t) { return [0.06 + 0.88 * t, 0.72 - 0.40 * Math.abs(Math.sin(t * Math.PI * 2))]; } },
    { name: '回旋滑梯', lv: 2, fn: function (t) {
        var a = Math.PI + t * Math.PI * 1.6;
        return [0.5 + 0.34 * Math.cos(a), 0.5 + 0.32 * Math.sin(a)];
      } },
    { name: '小蜗牛壳', lv: 2, fn: function (t) {
        var a = t * Math.PI * 3, r = 0.40 * (1 - 0.55 * t);
        return [0.5 + r * Math.cos(a), 0.5 + r * Math.sin(a)];
      } }
  ];

  function byLevel(lv) {
    return SHAPES.filter(function (s) { return s.lv <= lv; });
  }
  function dist(a, b) { var dx = a[0] - b[0], dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
  function sv(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  var live = [];   // 所有在用的轨道实例，供统一重排

  /*
   * create(canvas, shape, opts)
   * opts: height / lane(轨道宽度) / threshold(容差) / startR / dotR / icon
   *       onStart / onMiss / onFail / onPause / onDone / onMove / onProgress / onReset
   * 返回 { reset, progress, relayout, destroy }
   */
  function create(canvas, shape, opts) {
    opts = opts || {};
    var H = opts.height || 150;
    var lane = opts.lane || 34;
    var thr = opts.threshold || Math.max(20, Math.round(lane * 0.95));
    var startR = opts.startR || Math.max(16, Math.round(lane * 0.5));
    var dotR = opts.dotR || Math.max(9, Math.round(lane * 0.34));
    var icon = opts.icon || '🚩';

    var W = 0, pts = null, cum = null, total = 1;
    var svg = null, fg = null, dot = null;
    var idx = 0, dragging = false, drawn = false, dead = false;

    canvas.style.height = H + 'px';
    canvas.innerHTML = '';
    canvas.setAttribute('data-shape', shape.name);
    canvas.setAttribute('data-ready', '0');

    function measure() {
      var w = canvas.clientWidth;
      if (!w && canvas.parentNode && canvas.parentNode.clientWidth) w = canvas.parentNode.clientWidth;
      if (!w || w < 120) { if (FALLBACK_W) return FALLBACK_W; return 0; }
      return Math.round(w);
    }

    function draw() {
      var w = measure();
      if (!w) return false;                 // 还量不到宽度，等外部 relayout
      W = w;
      canvas.innerHTML = '';
      pts = [];
      cum = [0];
      var i;
      for (i = 0; i <= N; i++) {
        var t = i / N, p = shape.fn(t);
        pts.push([p[0] * W, p[1] * H]);
      }
      for (i = 1; i < pts.length; i++) cum[i] = cum[i - 1] + dist(pts[i - 1], pts[i]);
      total = cum[cum.length - 1] || 1;
      var dStr = 'M' + pts.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' L');

      svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H });
      svg.appendChild(sv('path', {
        d: dStr, fill: 'none', stroke: '#e0cdee', 'stroke-width': lane,
        'stroke-linecap': 'round', 'stroke-linejoin': 'round'
      }));
      fg = sv('path', {
        d: dStr, fill: 'none', stroke: '#7ee2ae', 'stroke-width': lane,
        'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        'stroke-dasharray': total, 'stroke-dashoffset': total
      });
      svg.appendChild(fg);
      // 起点
      svg.appendChild(sv('circle', {
        cx: pts[0][0], cy: pts[0][1], r: startR,
        fill: '#2fd07a', stroke: '#fff', 'stroke-width': 4
      }));
      // 终点小旗
      var flag = sv('text', { x: pts[N][0], y: pts[N][1] + 10, 'text-anchor': 'middle', 'font-size': 28 });
      flag.textContent = icon;
      svg.appendChild(flag);
      // 跟着光标走的小圆点
      dot = sv('circle', {
        cx: pts[0][0], cy: pts[0][1], r: dotR,
        fill: '#ff9436', stroke: '#fff', 'stroke-width': 3
      });
      svg.appendChild(dot);
      canvas.appendChild(svg);
      canvas.setAttribute('data-ready', '1');
      drawn = true;
      update();
      return true;
    }

    function update() {
      if (!drawn) return;
      fg.setAttribute('stroke-dashoffset', total - cum[idx]);
      dot.setAttribute('cx', pts[idx][0]);
      dot.setAttribute('cy', pts[idx][1]);
      if (opts.onProgress) opts.onProgress(idx / N);
    }

    /* 屏幕坐标 → 轨道坐标（以 svg 实际位置为准，避免居中留白造成偏移） */
    function local(e) {
      if (!svg) return null;
      var r = svg.getBoundingClientRect();
      if (!r.width) return null;
      return [(e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height)];
    }
    function nearest(p) {
      var best = 0, bd = 1e9;
      for (var i = 0; i < pts.length; i++) {
        var d = dist(p, pts[i]);
        if (d < bd) { bd = d; best = i; }
      }
      return { i: best, d: bd };
    }
    function reset() { idx = 0; update(); if (opts.onReset) opts.onReset(); }

    function down(e) {
      if (e.button === 2 || dead) return;
      var p = local(e);
      if (!p) return;
      var at = nearest(p);
      var grab = Math.max(thr, startR + 14);
      if (at.d > grab) { if (opts.onMiss) opts.onMiss(); return; }   // 没按在航道上
      idx = at.i;
      dragging = true;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      update();
      if (opts.onStart) opts.onStart();
      if (e.preventDefault) e.preventDefault();
    }
    function move(e) {
      if (!dragging || dead) return;
      var p = local(e);
      if (!p) return;
      var at = nearest(p);
      if (at.d > thr) {                       // 光标跑出航道
        dragging = false;
        if (opts.onFail) opts.onFail();
        MK.later(reset, 380);
        return;
      }
      if (at.i > idx) {
        idx = at.i;
        update();
        if (opts.onMove) opts.onMove(idx / N);
      }
      if (idx >= N - 2) {                     // 抵达终点
        dragging = false;
        if (opts.onDone) opts.onDone();
      }
    }
    function up() {
      if (!dragging) return;
      dragging = false;
      if (idx < N - 2 && opts.onPause) opts.onPause();
    }

    // 挂在 window 上：拖出画布范围也能收到事件，避免"卡住"
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);

    var inst = {
      _canvas: canvas,
      reset: reset,
      progress: function () { return idx / N; },
      isReady: function () { return drawn; },
      relayout: function () {
        if (dead) return;
        var w = measure();
        if (!w) return;
        if (drawn && w === W) return;         // 宽度没变，不必重画
        var keep = idx;
        drawn = false;
        if (draw()) { idx = Math.min(keep, N); update(); }
      },
      destroy: function () {
        dead = true;
        dragging = false;
        canvas.removeEventListener('pointerdown', down);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        canvas.innerHTML = '';
        var i = live.indexOf(inst);
        if (i >= 0) live.splice(i, 1);
      }
    };

    draw();
    live.push(inst);
    return inst;
  }

  /* 容器可见或尺寸变化后统一重排；顺手清掉已经不在页面上的实例 */
  function attached(el) {
    return !!el && !!document.body && document.body.contains(el);
  }
  function refreshAll() {
    live.slice().forEach(function (it) {
      if (!attached(it._canvas)) { try { it.destroy(); } catch (e) {} return; }
      try { it.relayout(); } catch (e) { /* 忽略单个实例的错误 */ }
    });
  }
  /* 销毁某个容器里的所有轨道（卡片收起时调用） */
  function destroyWithin(root) {
    if (!root) return;
    live.slice().forEach(function (it) {
      if (it._canvas === root || root.contains(it._canvas)) {
        try { it.destroy(); } catch (e) {}
      }
    });
  }

  /* 容器尺寸变化时自动重排（支持 ResizeObserver 的浏览器） */
  if (typeof window.ResizeObserver === 'function') {
    try {
      var ro = new window.ResizeObserver(function () { refreshAll(); });
      window.addEventListener('load', function () {
        document.querySelectorAll('.track-canvas').forEach(function (c) { ro.observe(c); });
      });
      window.addEventListener('resize', refreshAll);
    } catch (e) {
      window.addEventListener('resize', refreshAll);
    }
  } else {
    window.addEventListener('resize', refreshAll);
  }

  MK.track = {
    SHAPES: SHAPES, byLevel: byLevel, create: create,
    refreshAll: refreshAll, destroyWithin: destroyWithin, N: N
  };
})();
