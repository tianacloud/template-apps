
/* ===== 离线适配：worker 一律用上面内联的源码，永不出网 ===== */
(function () {
  var box = document.getElementById('hejiWorkerSrc');
  var _create = URL.createObjectURL;
  URL.createObjectURL = function (blob) {
    if (blob && blob.type && blob.type.indexOf('javascript') >= 0) {
      return _create.call(URL, new Blob([box.textContent], { type: 'application/javascript' }));
    }
    return _create.apply(URL, arguments);
  };
  // 兜底：任何外部请求都拦掉（本机 file:// 资源不受影响）
  var _f = window.fetch;
  window.fetch = function (input, init) {
    var url = (typeof input === 'string') ? input : ((input && input.url) || '');
    if (/^https?:/i.test(url)) return Promise.reject(new Error('离线模式：禁止外部请求'));
    return _f.apply(this, arguments);
  };
})();
