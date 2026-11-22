/* ==========================================================================
 * 资产管理系统 · 资产标签打印（含 Code 39 条码）
 * 无需任何外部依赖 / 无需联网，打印时只输出标签，页面其余部分自动隐藏。
 * 依赖：window.UX（由 app.js 暴露）、window.Barcode39（barcode.js）
 * ========================================================================== */
(function (global) {
  'use strict';

  function U() { return global.UX || {}; }

  // 从若干候选字段里取第一个非空值
  function pick(a, keys) {
    for (var i = 0; i < keys.length; i++) {
      var v = a[keys[i]];
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
    }
    return '';
  }

  // 条码内容：优先资产编码，其次更换单号，再次记录 ID（都做 Code39 合法化）
  function codeOf(a) {
    var c = pick(a, ['assetCode', 'changeNo', 'code', 'sn']);
    if (!c) c = String(a.id || '');
    return c;
  }

  function labelHtml(a, sysName) {
    var UU = U();
    var esc = UU.esc || function (s) { return String(s == null ? '' : s); };
    var name = pick(a, ['name', 'assetName', 'title']) || '(未命名)';
    var code = codeOf(a);
    var ip = pick(a, ['ip', 'mgmtIp']);
    var loc = pick(a, ['location']);
    var owner = pick(a, ['owner', 'operator']);
    var dept = pick(a, ['dept']);
    var bar = global.Barcode39 ? global.Barcode39.svg(code, { moduleWidth: 1.5, height: 40 })
                               : '';
    var metas = [];
    if (ip) metas.push('<span><i>IP</i>' + esc(ip) + '</span>');
    if (mgmt(a)) metas.push('<span><i>管理IP</i>' + esc(pick(a, ['mgmtIp'])) + '</span>');
    if (loc) metas.push('<span><i>位置</i>' + esc(loc) + '</span>');
    if (dept) metas.push('<span><i>部门</i>' + esc(dept) + '</span>');
    if (owner) metas.push('<span><i>责任人</i>' + esc(owner) + '</span>');
    return '<div class="label-card">' +
      '<div class="lb-head"><span class="lb-sys">' + esc(sysName || '') + '</span>' +
      '<span class="lb-brand">AM</span></div>' +
      '<div class="lb-name" title="' + esc(name) + '">' + esc(name) + '</div>' +
      '<div class="lb-bar">' + bar + '</div>' +
      '<div class="lb-code">' + esc(code) + '</div>' +
      '<div class="lb-meta">' + metas.join('') + '</div>' +
      '</div>';
  }

  function mgmt(a) {
    return pick(a, ['mgmtIp']) && pick(a, ['mgmtIp']) !== pick(a, ['ip']);
  }

  /* 打印：把标签放进一个独立容器，打印时隐藏页面其余部分 */
  function doPrint(html) {
    var box = document.createElement('div');
    box.className = 'print-area';
    box.innerHTML = html;
    document.body.appendChild(box);
    document.body.classList.add('printing');
    var done = false;
    function cleanup() {
      if (done) return;
      done = true;
      document.body.classList.remove('printing');
      if (box.parentNode) box.parentNode.removeChild(box);
      global.removeEventListener('afterprint', cleanup);
    }
    global.addEventListener('afterprint', cleanup);
    try {
      global.print();
    } catch (e) { /* 某些内嵌浏览器不支持直接 print */ }
    setTimeout(cleanup, 4000);   // 兜底：部分浏览器不触发 afterprint
  }

  /**
   * 打开标签打印预览
   * @param {Array} assets 要打印的记录（1 条或批量选中的多条）
   */
  function openLabelPrint(assets) {
    var UU = U();
    if (!UU.openModal) { return; }
    var list = (assets || []).filter(Boolean);
    if (!list.length) { UU.toast && UU.toast('没有可打印的记录', 'warn'); return; }
    var sysName = (UU.Store && UU.Store.curTable()) ? UU.Store.curTable().name : '';
    var html = list.map(function (a) { return labelHtml(a, sysName); }).join('');
    var noCode = list.filter(function (a) { return !global.Barcode39 || !global.Barcode39.sanitize(codeOf(a)); }).length;

    UU.openModal({
      title: '打印资产标签', icon: 'file', width: 'wide',
      sub: '共 ' + list.length + ' 张 · 条码为 Code 39 格式，可用普通扫码枪识别',
      body: '<div class="label-preview">' + html + '</div>' +
            (noCode ? '<div class="hint" style="margin-top:10px">有 ' + noCode +
              ' 条的编码不含 Code 39 可用字符（仅支持 0-9 A-Z 与 - . 空格 $ / + %），条码已自动忽略非法字符。</div>' : ''),
      foot: '<button class="btn" data-close>关闭</button>' +
            '<button class="btn primary" data-print>打印（' + list.length + ' 张）</button>',
      onMount: function (m) {
        var btn = m.querySelector('[data-print]');
        if (btn) btn.addEventListener('click', function () { doPrint(html); });
      }
    });
  }

  global.Print = { openLabelPrint: openLabelPrint, labelHtml: labelHtml, doPrint: doPrint };
})(window);
