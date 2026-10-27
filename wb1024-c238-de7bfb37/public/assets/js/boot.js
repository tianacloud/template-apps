/* ============================================================
   boot.js —— 老李的世界Online 引导层（必须在 app.js / pets.js 之前加载）
   1) localStorage 兜底：沙箱 iframe 下 localStorage 可能被禁用，
      降级到内存存储，保证「写入后立刻能读回来」不会丢失。
   2) 云端 SDK 探测：兼容 SDK 注入到 iframe / 父窗口的两种情况。
   3) 云端调用串行 + 瞬时重试：平台限制 20 QPS 且并发调用会被拒绝，
      所有 SDK 调用必须排队串行执行。
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1) localStorage 兜底 ---------- */
  var realLS = null;
  try { realLS = window.localStorage; } catch (e) { realLS = null; }
  var persistent = false;
  if (realLS) {
    try {
      var probeKey = '__ls_probe__';
      realLS.setItem(probeKey, '1');
      persistent = realLS.getItem(probeKey) === '1';
      realLS.removeItem(probeKey);
    } catch (e) { persistent = false; }
  }
  if (!persistent) {
    var mem = Object.create(null);
    var shim = {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem: function (k, v) { mem[k] = String(v); },
      removeItem: function (k) { delete mem[k]; },
      clear: function () { mem = Object.create(null); },
      key: function (i) { return Object.keys(mem)[i] === undefined ? null : Object.keys(mem)[i]; }
    };
    try { shim.__proto__ = null; } catch (e) { }
    try {
      Object.defineProperty(window, 'localStorage', { value: shim, configurable: true, writable: true });
    } catch (e) {
      try { window.localStorage = shim; } catch (e2) { }
    }
  }
  window.__LS_MODE__ = persistent ? 'persistent' : 'memory';

  /* ---------- 2) SDK 探测：等真实实现注入，而非 Proxy 壳 ----------
     平台 inject.js 会先创建 window.__SMART_PAGE__ 代理对象：任何属性访问
     （包括 .database）都会返回一个「排队代理」，恒为 truthy。真正的
     database 实现由宿主页面稍后通过 postMessage 注入，落到
     __SMART_PAGE__.__realImpls__.database 上。
     如果只检查 !!__SMART_PAGE__.database，会把「未注入」误判成「已连接」，
     导致所有云端调用静默排队 15 秒后以 timeout 失败。
     因此必须探测真实实现是否存在。 */
  function findSdk() {
    // 1) 平台沙箱：真实实现注入在 __realImpls__ 上
    try {
      var sp = window.__SMART_PAGE__;
      if (sp) {
        var impls = sp.__realImpls__;
        if (impls && impls.database) return impls.database;
      }
    } catch (e) { }
    // 2) 非沙箱兜底（本地文件 / 测试 mock）：__SMART_PAGE__ 是普通对象
    try {
      if (window.__SMART_PAGE__ && window.__SMART_PAGE__.database) {
        var d = window.__SMART_PAGE__.database;
        // 排队代理访问 __pending__ 会返回数组（可能是空数组）；
        // 真实实现没有 __pending__ 属性 → 才算真的就绪
        if (d.__pending__ === undefined) return d;
      }
    } catch (e) { }
    return null;
  }

  /* ---------- 3) 串行队列 + 瞬时错误重试 ---------- */
  var chain = Promise.resolve();
  var TRANSIENT = /50000|56038|50150|INVALID_RESPONSE|NETWORK_ERROR|TEMPORARY_ERROR|UNKNOWN|HTTP_5\d\d|HTTP_429|50001|\b429\b|\b500\b|\b502\b|\b503\b|\b504\b/;
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // taskFn: () => Promise
  function run(taskFn, tries) {
    tries = tries || 2;
    function attempt(left) {
      return Promise.resolve().then(taskFn).catch(function (err) {
        var msg = '';
        try { msg = String((err && (err.message || err.code || err.msg)) || err || ''); } catch (e) { msg = ''; }
        if (left > 1 && TRANSIENT.test(msg)) {
          return sleep(600).then(function () { return attempt(left - 1); });
        }
        throw err;
      });
    }
    var p = chain.then(function () { return attempt(tries); });
    // 队列吞掉错误，避免一次失败卡死后续所有调用
    chain = p.then(function () { }, function () { });
    return p;
  }

  // 等待 SDK 注入就绪（宿主注入可能略晚于脚本执行）
  function ready(maxMs) {
    return new Promise(function (resolve) {
      var t0 = Date.now(), limit = maxMs || 8000;
      (function tick() {
        if (findSdk()) return resolve(true);
        if (Date.now() - t0 > limit) return resolve(false);
        setTimeout(tick, 200);
      })();
    });
  }

  window.__DBQ = { sdk: findSdk, run: run, ready: ready, TRANSIENT: TRANSIENT, ls: window.__LS_MODE__ };
})();
