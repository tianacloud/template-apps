/* =========================================================
 * PyLab：Pyodide 运行器（供练习场与课程代码块共用）
 * ========================================================= */
window.PyLab = (function () {
  let pyodide = null, loadingPromise = null;

  function scriptReady() {
    return typeof loadPyodide === 'function';
  }

  /* 按需加载 pyodide.js（约 100KB），只加载一次 */
  function loadScript() {
    if (scriptReady()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
      s.onload = resolve;
      s.onerror = () => reject(new Error('无法从 CDN 加载 Pyodide 脚本，请检查网络'));
      document.head.appendChild(s);
    });
  }

  function ensure(onProgress) {
    if (pyodide) return Promise.resolve(pyodide);
    if (loadingPromise) return loadingPromise;
    loadingPromise = new Promise((resolve, reject) => {
      loadScript().then(() => {
        loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
        }).then(py => { pyodide = py; resolve(py); })
          .catch(reject);
      }).catch(reject);
    });
    return loadingPromise;
  }

  /* 就地运行一段代码，把输出写入 outEl（HTMLElement） */
  async function runInline(code, outEl, statusEl) {
    const cls = outEl.classList;
    cls.remove('hidden');
    const write = (html) => { outEl.innerHTML = html; };
    write('<span class="grey">运行中…</span>');
    try {
      const py = await ensure();
      if (statusEl) statusEl.textContent = 'Python ' + py.runPython('import sys; sys.version.split()[0]') + ' · 已就绪';
      py.globals.set('__user_code__', code);
      const res = await py.runPythonAsync(`
import io, contextlib, traceback
_out = io.StringIO()
_err = ""
try:
    with contextlib.redirect_stdout(_out):
        exec(globals().get("__user_code__", ""), globals())
except Exception:
    _err = traceback.format_exc(limit=3)
(_out.getvalue(), _err)
`);
      const pair = (res && res.toJs) ? res.toJs() : res;
      const so = pair[0] || '', se = pair[1] || '';
      let html = '';
      if (so && so.trim()) html += escHtml(so);
      if (se) html += (html ? '\n' : '') + '<span class="bad">' + escHtml(se) + '</span>';
      if (!so && !se) html = '<span class="grey">（程序没有输出。试试加 print()）</span>';
      write(html);
    } catch (err) {
      write('<span class="bad">加载运行时失败：' + escHtml(err.message || err) +
        '\n首次使用需要联网下载约 10MB 的 Python 运行时，请检查网络后重试。</span>');
    }
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return { ensure, runInline };
})();
