/* ==========================================================================
 * 资产管理系统 · Code 39 条码生成（纯前端，无任何外部依赖）
 * 用途：资产标签打印 —— 生成的条码可被普通手持扫码枪扫出资产编码。
 *
 * 原理：Code 39 每个字符由 9 个单元组成（5 条 4 空），其中 3 个为宽单元。
 * 每个字符对应一个十进制数，其二进制即为"模块图案"（1=条，0=空，窄=1 模块，宽=3 模块）。
 * 下表取自成熟实现 JsBarcode（其编码与国际标准 Code 39 一致）。
 * 字符集：0-9 A-Z 和 - . (空格) $ / + %，以 * 作为起止符。
 * ========================================================================== */
(function (global) {
  'use strict';
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%*';
  var ENC = [
    20957, 29783, 23639, 30485, 20951, 29813, 23669, 20855,
    29789, 23645, 29975, 23831, 30533, 22295, 30149, 24005,
    21623, 29981, 23837, 22301, 30023, 23879, 30545, 22343,
    30161, 24017, 21959, 30065, 23921, 22385, 29015, 18263,
    29141, 17879, 29045, 18293, 17783, 29021, 18269, 17477,
    17489, 17681, 20753, 35770
  ];

  function binOf(ch) {
    var i = CHARS.indexOf(ch);
    if (i < 0) return '';
    return ENC[i].toString(2);
  }

  /** 过滤掉 Code 39 不支持的字符（中文等），并转大写 */
  function sanitize(s) {
    return String(s == null ? '' : s)
      .toUpperCase()
      .replace(/[^0-9A-Z\-. $/+%]/g, '');
  }

  /** 返回模块串：'1'=条，'0'=空 */
  function modules(data) {
    data = sanitize(data);
    if (!data) return '';
    var out = binOf('*');
    for (var i = 0; i < data.length; i++) {
      out += binOf(data[i]) + '0';   // 字符之间用 1 个窄空隔开
    }
    return out + binOf('*');
  }

  /** 生成条码 SVG 字符串 */
  function svg(data, opt) {
    opt = opt || {};
    var mw = opt.moduleWidth || 1.5;
    var h = opt.height || 44;
    var mods = modules(data);
    if (!mods) return '<svg width="0" height="0"></svg>';
    var w = mods.length * mw;
    var rects = '', x = 0, i = 0;
    while (i < mods.length) {
      var c = mods[i], run = 1;
      while (i + run < mods.length && mods[i + run] === c) run++;
      if (c === '1') {
        rects += '<rect x="' + x.toFixed(2) + '" y="0" width="' + (run * mw).toFixed(2) +
                 '" height="' + h + '"/>';
      }
      x += run * mw;
      i += run;
    }
    return '<svg class="c39-svg" width="' + w.toFixed(1) + '" height="' + h +
      '" viewBox="0 0 ' + w.toFixed(1) + ' ' + h +
      '" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="100%" height="100%" fill="#fff"/><g fill="#000">' + rects + '</g></svg>';
  }

  global.Barcode39 = { svg: svg, modules: modules, sanitize: sanitize, pattern: binOf, CHARS: CHARS };
})(window);
