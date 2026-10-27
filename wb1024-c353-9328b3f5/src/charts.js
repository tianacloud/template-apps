/* 手写 SVG 图表组件（零依赖，离线可用） */
(function (global) {
  'use strict';

  function ring(percent, opt) {
    opt = opt || {};
    var size = opt.size || 128;
    var sw = opt.stroke || 14;
    var r = (size - sw) / 2 - 2;
    var c = 2 * Math.PI * r;
    var pct = Math.max(0, Math.min(100, percent));
    var offset = c * (1 - pct / 100);
    var id = 'g' + Math.random().toString(36).slice(2, 8);
    return '' +
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#ffc93c"/><stop offset="55%" stop-color="#ff8a3d"/><stop offset="100%" stop-color="#a78bfa"/>' +
      '</linearGradient></defs>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#fff" stroke-width="' + sw + '" opacity=".85"/>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="url(#' + id + ')" ' +
      'stroke-width="' + sw + '" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" ' +
      'stroke-dashoffset="' + offset.toFixed(1) + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')">' +
      '<animate attributeName="stroke-dashoffset" from="' + c.toFixed(1) + '" to="' + offset.toFixed(1) + '" dur="0.9s" fill="freeze" calcMode="spline" keySplines="0.2 0.9 0.3 1" keyTimes="0;1"/>' +
      '</circle>' +
      '<text x="50%" y="47%" text-anchor="middle" font-size="' + Math.round(size * 0.26) + '" font-weight="900" fill="#4a3f38">' + pct + '%</text>' +
      '<text x="50%" y="66%" text-anchor="middle" font-size="' + Math.round(size * 0.12) + '" font-weight="700" fill="#a89e94">今日完成</text>' +
      '</svg>';
  }

  function bars(items) {
    var W = 340, H = 140, padB = 26, padT = 16;
    var n = items.length;
    var gap = 10;
    var bw = (W - gap * (n - 1) - 8) / n;
    var maxH = H - padB - padT;
    var out = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + H + '" preserveAspectRatio="none" style="overflow:visible">';
    // 基线
    out += '<line x1="0" y1="' + (H - padB) + '" x2="' + W + '" y2="' + (H - padB) + '" stroke="#f7e7d5" stroke-width="2"/>';
    items.forEach(function (it, i) {
      var x = 4 + i * (bw + gap);
      var h = Math.max(4, maxH * (it.rate / 100));
      var y = H - padB - h;
      var id = 'bg' + i + Math.random().toString(36).slice(2, 6);
      out += '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="' + (it.rate >= 100 ? '#7fe0b0' : '#ffc9a8') + '"/>' +
        '<stop offset="100%" stop-color="' + (it.rate >= 100 ? '#3ec98b' : '#ff8a3d') + '"/>' +
        '</linearGradient></defs>';
      out += '<rect x="' + x.toFixed(1) + '" y="' + (H - padB) + '" width="' + bw.toFixed(1) + '" height="0" rx="' + Math.min(10, bw / 2) + '" fill="url(#' + id + ')">' +
        '<animate attributeName="height" from="0" to="' + h.toFixed(1) + '" dur="0.7s" fill="freeze" begin="' + (i * 0.06) + 's"/>' +
        '<animate attributeName="y" from="' + (H - padB) + '" to="' + y.toFixed(1) + '" dur="0.7s" fill="freeze" begin="' + (i * 0.06) + 's"/>' +
        '</rect>';
      out += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (y - 5).toFixed(1) + '" text-anchor="middle" font-size="10" font-weight="800" fill="' + (it.rate >= 100 ? '#2aa971' : '#f2701f') + '">' + it.rate + '%</text>';
      out += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - padB + 16) + '" text-anchor="middle" font-size="11" font-weight="800" fill="' + (it.isToday ? '#f2701f' : '#a89e94') + '">' + it.label + '</text>';
    });
    out += '</svg>';
    return out;
  }

  global.Charts = { ring: ring, bars: bars };
})(window);
