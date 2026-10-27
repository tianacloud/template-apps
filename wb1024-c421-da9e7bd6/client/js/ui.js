/* 通用交互：toast / 模态框 / 确认 / 输入 / 日期标签 */
(function (global) {
  'use strict';
  var QH = (global.QH = global.QH || {});
  var ui = (QH.ui = QH.ui || {});

  var modalRoot = null;
  var toastTimer = null;
  var openCount = 0;

  /* iOS / 安卓软键盘：视觉视口变小时，把 overlay 跟过去，底部抽屉才不会被键盘顶住 */
  (function trackViewport() {
    var vv = window.visualViewport;
    if (!vv) return;
    function sync() {
      document.documentElement.style.setProperty('--vvh', Math.round(vv.height) + 'px');
      document.documentElement.style.setProperty('--vvtop', Math.round(vv.offsetTop) + 'px');
    }
    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
  })();

  /* 输入框获得焦点后，把它滚到抽屉可视区域中间 */
  document.addEventListener('focusin', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    if (!target.closest('.modal-body')) return;
    setTimeout(function () {
      try { target.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* 忽略 */ }
    }, 260);
  });

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  ui.esc = esc;

  function cssVar(name) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v || '').trim();
  }
  ui.cssVar = cssVar;

  function toast(message, kind) {
    var node = document.getElementById('toast');
    if (!node) return;
    node.textContent = message;
    node.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { node.className = 'toast'; }, 2600);
  }
  ui.toast = toast;

  function lockScroll() {
    openCount++;
    document.body.classList.add('modal-open');
  }

  function unlockScroll() {
    openCount = Math.max(0, openCount - 1);
    if (!openCount) document.body.classList.remove('modal-open');
  }

  function modal(options) {
    if (!modalRoot) modalRoot = document.getElementById('modal-root');
    var opts = options || {};
    var previous = document.activeElement;
    var overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML =
      '<div class="modal' + (opts.wide ? ' wide' : '') + '" role="dialog" aria-modal="true">' +
        '<header class="modal-head">' +
          '<div>' +
            '<h3>' + esc(opts.title || '') + '</h3>' +
            (opts.subtitle ? '<p>' + esc(opts.subtitle) + '</p>' : '') +
          '</div>' +
          '<button class="icon-btn" data-close aria-label="关闭">' + QH.icon('close', 18) + '</button>' +
        '</header>' +
        '<div class="modal-body">' + (opts.body || '') + '</div>' +
        (opts.footer ? '<footer class="modal-foot">' + opts.footer + '</footer>' : '') +
      '</div>';

    var closed = false;
    function close() {
      if (!overlay.parentNode || closed) return;
      closed = true;
      overlay.classList.add('closing');
      /* 关闭动画期间按钮还在 DOM 里，必须立刻切断点击，
         否则连点「保存」会重复提交两次 */
      overlay.style.pointerEvents = 'none';
      overlay.querySelectorAll('button').forEach(function (btn) { btn.disabled = true; });
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 150);
      document.removeEventListener('keydown', onKey);
      unlockScroll();
      if (previous && previous.focus) { try { previous.focus(); } catch (e) {} }
      if (opts.onClose) opts.onClose();
    }

    function onKey(event) {
      if (event.key === 'Escape') { event.stopPropagation(); close(); }
    }

    overlay.addEventListener('mousedown', function (event) {
      if (event.target === overlay && opts.dismissible !== false) close();
    });
    overlay.addEventListener('click', function (event) {
      var hit = event.target.closest('[data-close]');
      if (hit) close();
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
    lockScroll();

    var api = { el: overlay, close: close, body: overlay.querySelector('.modal-body') };
    if (opts.onMount) opts.onMount(api);
    setTimeout(function () {
      var focusable = overlay.querySelector('[autofocus]') ||
        overlay.querySelector('input, select, textarea, button.btn');
      if (focusable && focusable.focus) focusable.focus();
      var input = overlay.querySelector('input[type="text"], input[type="number"], input[type="email"], input[type="password"]');
      if (input && input.select && input.hasAttribute('data-select')) input.select();
    }, 40);
    return api;
  }
  ui.modal = modal;

  function confirmBox(options) {
    var opts = options || {};
    return new Promise(function (resolve) {
      var api = modal({
        title: opts.title || '请确认',
        subtitle: opts.subtitle || '',
        body: opts.message ? '<p class="modal-text">' + opts.message + '</p>' : '',
        footer:
          '<button class="btn ghost" data-no>' + esc(opts.cancelText || '取消') + '</button>' +
          '<button class="btn ' + (opts.danger ? 'danger' : 'primary') + '" data-yes>' +
            esc(opts.confirmText || '确定') + '</button>',
        onMount: function (m) {
          m.el.querySelector('[data-yes]').addEventListener('click', function () { m.close(); resolve(true); });
          m.el.querySelector('[data-no]').addEventListener('click', function () { m.close(); resolve(false); });
          m.el.querySelector('[data-close]').addEventListener('click', function () { resolve(false); });
          m.el.addEventListener('mousedown', function (e) { if (e.target === m.el) resolve(false); });
          var yes = m.el.querySelector('[data-yes]');
          if (yes) yes.focus();
        }
      });
      void api;
    });
  }
  ui.confirm = confirmBox;

  /* 单个输入的对话框，返回 Promise<string|null>；validate 抛错则内联提示不关闭 */
  function inputBox(options) {
    var opts = options || {};
    return new Promise(function (resolve) {
      var html =
        '<label class="field-label">' + esc(opts.label || '') + '</label>' +
        '<div class="input-wrap' + (opts.prefix ? ' has-prefix' : '') + '">' +
          (opts.prefix ? '<span class="prefix">' + esc(opts.prefix) + '</span>' : '') +
          '<input class="field" data-input type="' + (opts.type || 'text') + '" ' +
            (opts.inputmode ? 'inputmode="' + opts.inputmode + '" ' : '') +
            'placeholder="' + esc(opts.placeholder || '') + '" value="' + esc(opts.value || '') + '" ' +
            'autocomplete="off" ' + (opts.maxlength ? 'maxlength="' + opts.maxlength + '" ' : '') + '>' +
        '</div>' +
        '<p class="field-hint" data-hint>' + esc(opts.hint || '') + '</p>' +
        '<p class="field-error" data-error hidden></p>';

      modal({
        title: opts.title || '',
        subtitle: opts.subtitle || '',
        body: html,
        footer:
          '<button class="btn ghost" data-cancel>取消</button>' +
          '<button class="btn primary" data-ok>' + esc(opts.confirmText || '保存') + '</button>',
        onMount: function (m) {
          var input = m.el.querySelector('[data-input]');
          var error = m.el.querySelector('[data-error]');
          function submit() {
            var value = input.value.trim();
            try {
              if (opts.validate) opts.validate(value);
              m.close();
              resolve(value);
            } catch (e) {
              error.textContent = e.message;
              error.hidden = false;
              input.classList.add('invalid');
            }
          }
          m.el.querySelector('[data-ok]').addEventListener('click', submit);
          m.el.querySelector('[data-cancel]').addEventListener('click', function () { m.close(); resolve(null); });
          m.el.querySelector('[data-close]').addEventListener('click', function () { resolve(null); });
          input.addEventListener('input', function () {
            error.hidden = true;
            input.classList.remove('invalid');
          });
          input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); submit(); }
          });
          if (opts.selectAll !== false) input.select();
        }
      });
    });
  }
  ui.input = inputBox;

  function dayLabel(ts) {
    var today = QH.store.dayStart(Date.now());
    var day = QH.store.dayStart(ts);
    var diff = Math.round((today - day) / 86400000);
    if (diff === 0) return '今天';
    if (diff === 1) return '昨天';
    if (diff === 2) return '前天';
    var d = new Date(day);
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 周' + QH.store.weekdayName(day);
  }
  ui.dayLabel = dayLabel;

  function monthDayLabel(ts) {
    var d = new Date(ts);
    return (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }
  ui.monthDayLabel = monthDayLabel;

  ui.download = function (filename, text, mime) {
    var blob = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  };

  ui.copy = function (text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  };

  function legacyCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  ui.sparkline = function (values, color) {
    if (!values.length) return '';
    var max = Math.max.apply(null, values.concat([1]));
    return values.map(function (v) {
      return '<i style="height:' + Math.max(4, Math.round(v / max * 100)) + '%;background:' + color + '"></i>';
    }).join('');
  };
})(typeof window !== 'undefined' ? window : globalThis);
