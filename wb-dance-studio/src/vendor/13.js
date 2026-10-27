
/* 开屏动画控制：自动 2.6s 后淡出移除；点任意处 / 点「跳过」立即进；
   URL 带 ?nobreath 时直接跳过（供自动化测试）。淡出后从 DOM 移除，保证不遮挡后续操作。 */
(function () {
  if (/[?&]nobreath/.test(location.search)) {
    var s = document.getElementById('bootSplash');
    if (s) s.parentNode.removeChild(s);
    return;
  }
  var splash = document.getElementById('bootSplash');
  if (!splash) return;
  var finished = false;
  function hide() {
    if (finished) return;
    finished = true;
    splash.classList.add('done');
    setTimeout(function () { if (splash.parentNode) splash.parentNode.removeChild(splash); }, 680);
  }
  var t = setTimeout(hide, 2600);
  var skip = document.getElementById('bsSkip');
  if (skip) skip.addEventListener('click', function (e) { e.stopPropagation(); clearTimeout(t); hide(); });
  splash.addEventListener('click', function () { clearTimeout(t); hide(); });
  document.addEventListener('keydown', function h() { clearTimeout(t); hide(); document.removeEventListener('keydown', h); }, { once: true });
})();
