(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SceneOne = Object.assign(root.SceneOne || {}, api);
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fmtTime(ms) {
    if (ms == null || !isFinite(ms)) return '—';
    const d = new Date(ms);
    const p = (n, w) => String(n).padStart(w || 2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' +
      p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  function fmtSpan(ms) {
    if (ms == null || !isFinite(ms) || ms < 0) return '—';
    const s = Math.round(ms / 1000);
    if (s < 60) return s + ' 秒';
    if (s < 3600) return Math.floor(s / 60) + ' 分 ' + (s % 60) + ' 秒';
    if (s < 86400) return Math.floor(s / 3600) + ' 小时 ' + Math.floor((s % 3600) / 60) + ' 分';
    return Math.floor(s / 86400) + ' 天 ' + Math.floor((s % 86400) / 3600) + ' 小时';
  }

  function fmtNum(n) {
    if (n == null || !isFinite(n)) return '0';
    if (n >= 1000000) return (n / 100000).toFixed(1).replace(/\.0$/, '') + ' 万';
    return String(n);
  }

  function truncateMiddle(s, max) {
    s = String(s == null ? '' : s);
    max = max || 120;
    if (s.length <= max) return s;
    const half = Math.floor((max - 3) / 2);
    return s.slice(0, half) + '…' + s.slice(s.length - half);
  }

  function maskSensitive(text) {
    return String(text == null ? '' : text)
      .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, 'x.x.x.x')
      .replace(/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, '***@***')
      .replace(/(sk-|AKIA|ghp_|xox[baprs]-|glpat-)[\w-]{4,}/gi, '$1***');
  }

  return { esc, fmtTime, fmtSpan, fmtNum, truncateMiddle, maskSensitive };
});
