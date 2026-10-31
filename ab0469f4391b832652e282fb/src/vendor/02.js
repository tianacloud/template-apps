
(function () {
  var ok = false;
  try {
    var c = document.createElement('canvas');
    ok = !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { ok = false; }

  var fallbackShown = false;
  var loadingShown = false;

  window.__CHEERSYNC_FAIL = function (msg, detail) {
    var f = document.getElementById('fallback');
    var m = document.getElementById('fbMsg');
    var d = document.getElementById('fbDetail');
    if (msg && m) m.textContent = msg;
    if (d) d.textContent = (detail || '') + ' | ' + __csDiag();
    if (f) f.style.display = 'block';
    fallbackShown = true;
    var ld = document.getElementById('loadingHint');
    if (ld) ld.style.display = 'none';
  };

  // 采集环境信息，附在错误提示后，方便一次定位问题
  function __csDiag() {
    var p = [];
    try {
      var c2 = document.createElement('canvas');
      var gl = c2.getContext('webgl2') || c2.getContext('webgl') || c2.getContext('experimental-webgl');
      if (gl) {
        p.push((c2.getContext('webgl2') ? 'WebGL2' : 'WebGL1'));
        var dbg = gl.getExtension('WEBGL_debug_renderer_info');
        if (dbg) p.push(String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)).slice(0, 42));
      } else { p.push('无WebGL'); }
    } catch (e) { p.push('GL-err'); }
    p.push('THREE=' + (window.THREE ? 'ok' : 'miss'));
    p.push('GLB=' + (window.CHEER_REAL_GLB ? 'ok' : 'miss'));
    p.push('UA=' + (/Edg\//.test(navigator.userAgent) ? 'Edge' : /Chrome\//.test(navigator.userAgent) ? 'Chrome' : /MicroMessenger/.test(navigator.userAgent) ? '微信' : 'other'));
    return p.join(', ');
  }

  // 一旦初始化成功，立刻撤掉任何遮罩（核心修复：此前遮罩永不消失）
  function hideIfOk() {
    if (!window.__CHEERSYNC_OK) return false;
    var f = document.getElementById('fallback');
    if (f) f.style.display = 'none';
    var ld = document.getElementById('loadingHint');
    if (ld) ld.style.display = 'none';
    fallbackShown = false;
    loadingShown = false;
    return true;
  }
  // 常驻轮询：即使中途误报，只要最终初始化成功就撤掉遮罩（不可 clearInterval，
  // 否则"先超时后成功"的场景遮罩会永久挡住，这正是线上反馈的现象）
  setInterval(hideIfOk, 400);

  if (!ok) {
    window.__CHEERSYNC_FAIL('这个浏览器没有可用的 WebGL 3D 加速，所以舞台画不出来。', 'WebGL unavailable');
  }
  window.addEventListener('error', function (e) {
    if (!window.__CHEERSYNC_OK) {
      window.__CHEERSYNC_FAIL('页面脚本报错了，3D 场景中断。', (e.message || 'unknown') + ' @ ' + (e.filename || '').split('/').pop() + ':' + (e.lineno || 0));
    }
  });

  // 30 秒兜底（实测冷启动可达 14s；WebGL 可用时多半只是慢，不该轻易判死）
  setTimeout(function () {
    if (window.__CHEERSYNC_OK || hideIfOk()) return;
    window.__CHEERSYNC_FAIL('3D 场景加载异常缓慢（超过 30 秒还没就绪）。若反复如此，请换 Chrome/Edge 并在本机（非远程桌面）打开。', 'init timeout');
  }, 30000);
})();
