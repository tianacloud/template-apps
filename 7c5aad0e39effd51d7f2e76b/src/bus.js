/* 事件总线：用户动作 → 事件 → 渲染。所有交互都从这里过，便于回放与调试 */
(function () {
  const subs = {};
  const trail = [];
  const MAX = 80;

  function on(name, fn) {
    (subs[name] || (subs[name] = [])).push(fn);
    return () => off(name, fn);
  }

  function off(name, fn) {
    subs[name] = (subs[name] || []).filter(f => f !== fn);
  }

  function emit(name, detail) {
    const t = new Date().toTimeString().slice(0, 8);
    trail.push({ t, name, detail: detail == null ? null : detail });
    if (trail.length > MAX) trail.shift();
    (subs[name] || []).slice().forEach(fn => {
      try { fn(detail); } catch (e) { console.error('[bus] ' + name, e); }
    });
    (subs['*'] || []).slice().forEach(fn => fn({ name, detail, t }));
    if (window.GXDebug) paint();
  }

  /* 调试面板：加 ?debug=1 才出现，只读 */
  const debug = /(\?|&)debug=1/.test(location.search);
  window.GXDebug = debug;
  let box = null;

  function ensure() {
    if (box) return box;
    box = document.createElement('div');
    box.className = 'evtbox';
    box.innerHTML = '<div class="evt-hd">事件流 <b id="evtN">0</b></div><div class="evt-ls" id="evtLs"></div>';
    document.body.appendChild(box);
    box.querySelector('.evt-hd').onclick = () => box.classList.toggle('open');
    return box;
  }

  function paint() {
    const b = ensure();
    const ls = b.querySelector('#evtLs');
    ls.innerHTML = trail.slice(-14).reverse().map(e =>
      '<div class="evt"><span>' + e.t + '</span>' + e.name +
      (e.detail && e.detail.note ? '<i>' + String(e.detail.note).slice(0, 26) + '</i>' : '') + '</div>'
    ).join('');
    b.querySelector('#evtN').textContent = trail.length;
  }

  window.GXBus = { on, off, emit, trail: () => trail.slice() };
  if (debug) { ensure().classList.add('open'); paint(); }
})();
