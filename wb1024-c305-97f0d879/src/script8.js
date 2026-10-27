
/* 文书档案工作台 · 工具函数 */
(function (global) {
  'use strict';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  /* 高亮命中词 */
  function hl(text, q) {
    var t = esc(text);
    if (!q) return t;
    var qq = esc(q);
    var i = t.toLowerCase().indexOf(qq.toLowerCase());
    if (i < 0) return t;
    return t.slice(0, i) + '<mark>' + t.slice(i, i + qq.length) + '</mark>' + t.slice(i + qq.length);
  }

  function fmtDate(ts) {
    var d = new Date(ts), n = new Date();
    var same = d.getFullYear() === n.getFullYear();
    var s = (d.getMonth() + 1) + '月' + d.getDate() + '日';
    return same ? s : d.getFullYear() + '年' + s;
  }
  function fmtDateTime(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) +
      ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
  }
  function p2(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtTime(ts) {
    var d = new Date(ts);
    return p2(d.getHours()) + ':' + p2(d.getMinutes());
  }
  /* 今天 / 昨天 / 具体日期，日志按天分组用 */
  function fmtDay(ts) {
    var d = new Date(ts), n = new Date();
    var d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    var n0 = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
    var diff = Math.round((n0 - d0) / 86400000);
    if (diff === 0) return '今天';
    if (diff === 1) return '昨天';
    return fmtDate(ts);
  }

  var toastTimer = null;
  function toast(msg, ms) {
    var t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, ms || 1900);
  }

  function loading(on, txt) {
    var l = $('#loading');
    if (on) { $('#loadingTxt').textContent = txt || '处理中…'; l.hidden = false; }
    else l.hidden = true;
  }

  /* 通用确认弹层 */
  function confirm(opts) {
    return new Promise(function (res) {
      openSheet({
        title: opts.title,
        sub: opts.sub,
        body: opts.body || '',
        actions: [
          { text: opts.cancelText || '取消', kind: 'sec', onClick: function () { closeSheet(); res(false); } },
          { text: opts.okText || '确定', kind: opts.danger ? 'danger' : 'pri', onClick: function () { closeSheet(); res(true); } }
        ]
      });
    });
  }

  /* 输入弹层 */
  function prompt(opts) {
    return new Promise(function (res) {
      var body = '<div class="field" style="margin-top:14px"><label class="lb">' + esc(opts.label || '') + '</label>' +
        '<input class="ipt" id="__pv" value="' + esc(opts.value || '') + '" placeholder="' + esc(opts.placeholder || '') + '" maxlength="' + (opts.max || 40) + '"></div>' +
        (opts.extra || '');
      openSheet({
        title: opts.title, sub: opts.sub, body: body,
        actions: [
          { text: '取消', kind: 'sec', onClick: function () { closeSheet(); res(null); } },
          { text: opts.okText || '保存', kind: 'pri', onClick: function () {
            var v = $('#__pv').value.trim();
            closeSheet(); res(v);
          } }
        ]
      });
      setTimeout(function () { var i = $('#__pv'); if (i) { i.focus(); i.select(); } }, 80);
    });
  }

  /* 底部弹层 */
  function openSheet(opts) {
    var s = $('#sheet');
    var h = '<div class="grip"></div>';
    if (opts.title) h += '<h3>' + esc(opts.title) + '</h3>';
    if (opts.sub) h += '<div class="sub">' + esc(opts.sub) + '</div>';
    h += opts.body || '';
    if (opts.actions && opts.actions.length) {
      h += '<div class="sheet-acts">';
      opts.actions.forEach(function (a) {
        h += '<button class="btn ' + (a.kind === 'pri' ? 'btn-pri' : a.kind === 'danger' ? 'btn-pri" style="background:#DC2626' : 'btn-sec') +
          '" data-aidx="' + opts.actions.indexOf(a) + '">' + esc(a.text) + '</button>';
      });
      h += '</div>';
    }
    s.innerHTML = h;
    $$('#sheet [data-aidx]').forEach(function (b) {
      b.onclick = function () { opts.actions[+b.dataset.aidx].onClick(); };
    });
    if (opts.onMount) opts.onMount(s);
    $('#layer').hidden = false;
    $('#layer').onclick = function (e) { if (e.target === $('#layer')) { if (opts.dismissable !== false) { closeSheet(); if (opts.onDismiss) opts.onDismiss(); } } };
  }

  function closeSheet() { $('#layer').hidden = true; $('#layer').onclick = null; }

  /* 下载文件 */
  function download(filename, content, mime) {
    /* Android 原生壳（APK 版）：WebView 不支持 blob 下载，改走系统「保存到…」 */
    if (window.HejiApp && typeof window.HejiApp.saveFile === 'function') {
      var blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
      var fr = new FileReader();
      fr.onload = function () {
        var b64 = String(fr.result || '').split(',')[1] || '';
        window.HejiApp.saveFile(filename, mime || 'application/octet-stream', b64);
      };
      fr.onerror = function () { legacyDownload(filename, content, mime); };
      fr.readAsDataURL(blob);
      return;
    }
    legacyDownload(filename, content, mime);
  }

  /* 浏览器里的常规下载方式 */
  function legacyDownload(filename, content, mime) {
    var blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 400);
  }

  /* 图片压缩：最长边 max，jpeg 质量 q → dataURL */
  function compressImage(fileOrBlob, max, q) {
    max = max || 620; q = q || 0.72;
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () {
        var img = new Image();
        img.onload = function () {
          var w = img.width, h = img.height;
          var scale = Math.min(1, max / Math.max(w, h));
          var cw = Math.round(w * scale), ch = Math.round(h * scale);
          var c = document.createElement('canvas');
          c.width = cw; c.height = ch;
          var ctx = c.getContext('2d');
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch);
          ctx.drawImage(img, 0, 0, cw, ch);
          res(c.toDataURL('image/jpeg', q));
        };
        img.onerror = rej;
        img.src = fr.result;
      };
      fr.onerror = rej;
      fr.readAsDataURL(fileOrBlob);
    });
  }

  /* 从 canvas/dataURL 裁剪区域 → 新 dataURL（用于 OCR 取景避让） */
  function cropDataURL(dataURL, rect) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () {
        var c = document.createElement('canvas');
        c.width = Math.round(rect.w); c.height = Math.round(rect.h);
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        // 放大 2 倍以利识别
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = rej;
      img.src = dataURL;
    });
  }

  global.U = {
    $: $, $$: $$, el: el, esc: esc, hl: hl,
    fmtDate: fmtDate, fmtDateTime: fmtDateTime, fmtTime: fmtTime, fmtDay: fmtDay,
    toast: toast, loading: loading,
    confirm: confirm, prompt: prompt,
    openSheet: openSheet, closeSheet: closeSheet,
    download: download, compressImage: compressImage, cropDataURL: cropDataURL
  };
})(window);

