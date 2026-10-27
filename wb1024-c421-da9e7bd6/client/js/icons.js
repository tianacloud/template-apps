/* 线性图标：统一 24×24 viewBox，stroke=currentColor，与 Android 版 Canvas 手绘图形的气质保持一致 */
(function (global) {
  'use strict';
  var QH = (global.QH = global.QH || {});

  var PATHS = {
    home: '<path d="M4 10.6 12 4l8 6.6V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1z"/>',
    list: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-6M22 20H2"/>',
    pie: '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M14.5 3.3A9 9 0 0 1 20.7 9.5H14.5z"/>',
    settings: '<path d="M4 7h8M16 7h4M4 17h4M12 17h8"/><circle cx="14" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    trash: '<path d="M4 7h16M9.5 7V4.8h5V7M6.5 7l.9 13h9.2l.9-13"/>',
    edit: '<path d="M4 20h4L20.2 7.8a1.6 1.6 0 0 0 0-2.3l-1.7-1.7a1.6 1.6 0 0 0-2.3 0L4 16z"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    download: '<path d="M12 4v11M8 11.5l4 4 4-4M5 20h14"/>',
    upload: '<path d="M12 20V9M8 12.5l4-4 4 4M5 4h14"/>',
    check: '<path d="M4.5 12.5l5 5L20 6.5"/>',
    chevronLeft: '<path d="M14.5 5l-7 7 7 7"/>',
    chevronRight: '<path d="M9.5 5l7 7-7 7"/>',
    arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    food: '<path d="M3.5 12h17a8.5 8.5 0 0 1-17 0z"/><path d="M8 8.5V5M12 8.5V4M16 8.5V5.5"/><path d="M6 20.5h12"/>',
    shop: '<path d="M5.5 8h13l1.2 12.5H4.3z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
    medical: '<rect x="4.5" y="4.5" width="15" height="15" rx="4"/><path d="M12 8.5v7M8.5 12h7"/>',
    traffic: '<path d="M6 16.5V9l2.4-4h7.2L18 9v7.5"/><path d="M5 12h14"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="18" r="1.6"/>',
    house: '<path d="M4 11l8-6.5L20 11v9h-6v-5h-4v5H4z"/>',
    fun: '<path d="M8 10h8a3.5 3.5 0 0 1 3.4 2.7l.5 2.2a2.6 2.6 0 0 1-4.6 2.2L14.4 16H9.6l-.9 1.1a2.6 2.6 0 0 1-4.6-2.2l.5-2.2A3.5 3.5 0 0 1 8 10z"/><path d="M8.5 13.5h2M9.5 12.5v2M15 13h.01M16.8 13.9h.01"/>',
    salary: '<circle cx="12" cy="12" r="7.5"/><path d="M12 7.5v9M9.5 10h4M9.5 13h4"/>',
    bonus: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-3-5.3 3 1.1-5.9-4.3-4.1 5.9-.8z"/>',
    parttime: '<rect x="3.5" y="8" width="17" height="11" rx="2.5"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3.5 13h17"/>',
    invest: '<path d="M4 17l5-5 3.5 3L20 7"/><path d="M15 7h5v5"/>',
    wallet: '<path d="M3.5 9.5A2.5 2.5 0 0 1 6 7h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2.5 2.5 0 0 1-2.5-2.5z"/><path d="M16 12.5h4.5v3.5H16a1.75 1.75 0 0 1 0-3.5z"/>',
    spark: '<path d="M12 4l1.8 4.6L18.5 10l-4.7 1.4L12 16l-1.8-4.6L5.5 10l4.7-1.4z"/>',
    calendar: '<rect x="4" y="5.5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3.5v4M15 3.5v4"/>',
    filter: '<path d="M4 6h16l-6 7v6l-4-2v-4z"/>',
    copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>',
    shield: '<path d="M12 3.5l7 2.6v6c0 4.2-2.9 7.6-7 8.4-4.1-.8-7-4.2-7-8.4v-6z"/><path d="M9 12l2 2 4-4"/>',
    logout: '<path d="M14 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7"/><path d="M17 8.5l3.5 3.5L17 15.5M10.5 12H20"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.5 2.3c-.7.35-1.1.85-1.1 1.6v.4"/><circle cx="12" cy="17.1" r="0.85" fill="currentColor" stroke="none"/>',
    book: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v13.5H6a2 2 0 0 0-2 2z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H19v-3.5"/>'
  };

  QH.icon = function (name, size, extra) {
    var body = PATHS[name] || PATHS.spark;
    return '<svg class="ico-svg' + (extra ? ' ' + extra : '') + '" viewBox="0 0 24 24" width="' +
      (size || 20) + '" height="' + (size || 20) + '" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      body + '</svg>';
  };

  /* 分类图标：文字关键字 → 图形，移植自 CategoryIconDrawable */
  var KIND_ICON = {
    food: 'food', shop: 'shop', medical: 'medical', traffic: 'traffic', home: 'house',
    fun: 'fun', salary: 'salary', bonus: 'bonus', parttime: 'parttime', invest: 'invest'
  };

  QH.categoryIcon = function (name, type, size) {
    var kind = QH.store.kindOf(name, type);
    return QH.icon(KIND_ICON[kind] || 'wallet', size || 20);
  };

  /* 浅色底：把主色与白色按 1:5 混合，等价于 Android 的 pale() */
  QH.tint = function (hex, strength) {
    var h = String(hex || '#EE9466').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    var mix = strength == null ? 0.84 : strength;
    function ch(v) { return Math.round(v * (1 - mix) + 255 * mix); }
    return 'rgb(' + ch(r) + ',' + ch(g) + ',' + ch(b) + ')';
  };
})(typeof window !== 'undefined' ? window : globalThis);
