document.head.insertAdjacentHTML("beforeend", "<style>\n  :root {\n    --bg: #0d1117;\n    --bg-soft: #161b22;\n    --bg-card: #1c2230;\n    --border: #2d3648;\n    --text: #e6edf3;\n    --text-dim: #8b949e;\n    --accent: #58a6ff;\n    --accent-2: #3fb950;\n    --accent-3: #bc8cff;\n    --danger: #f85149;\n    --warn: #d29922;\n    --radius: 14px;\n    --mono: \"SFMono-Regular\", Consolas, \"Liberation Mono\", Menlo, monospace;\n  }\n  * { box-sizing: border-box; }\n  html, body { margin: 0; padding: 0; }\n  body {\n    background: radial-gradient(1200px 600px at 80% -10%, #1b2a44 0%, var(--bg) 55%);\n    color: var(--text);\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif;\n    min-height: 100vh;\n    line-height: 1.6;\n  }\n  .wrap { max-width: 920px; margin: 0 auto; padding: 28px 20px 64px; }\n\n  header.hero {\n    text-align: center;\n    padding: 28px 20px 22px;\n    border: 1px solid var(--border);\n    border-radius: var(--radius);\n    background: linear-gradient(135deg, rgba(88,166,255,.12), rgba(188,140,255,.10));\n    margin-bottom: 22px;\n  }\n  header.hero .badge {\n    display: inline-block;\n    font-family: var(--mono);\n    font-size: 12px;\n    color: var(--accent-3);\n    border: 1px solid var(--border);\n    padding: 3px 10px;\n    border-radius: 999px;\n    margin-bottom: 12px;\n    letter-spacing: 1px;\n  }\n  header.hero h1 {\n    margin: 0 0 6px;\n    font-size: 30px;\n    letter-spacing: .5px;\n  }\n  header.hero h1 .num {\n    font-family: var(--mono);\n    background: linear-gradient(90deg, var(--accent), var(--accent-3));\n    -webkit-background-clip: text;\n    background-clip: text;\n    color: transparent;\n  }\n  header.hero p { margin: 0; color: var(--text-dim); font-size: 14px; }\n\n  .tabs {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 8px;\n    margin-bottom: 18px;\n  }\n  .tab {\n    flex: 1 1 auto;\n    min-width: 120px;\n    text-align: center;\n    padding: 10px 12px;\n    cursor: pointer;\n    border: 1px solid var(--border);\n    border-radius: 10px;\n    background: var(--bg-soft);\n    color: var(--text-dim);\n    font-size: 14px;\n    transition: all .15s ease;\n    user-select: none;\n  }\n  .tab:hover { border-color: var(--accent); color: var(--text); }\n  .tab.active {\n    color: #fff;\n    border-color: transparent;\n    background: linear-gradient(135deg, var(--accent), var(--accent-3));\n  }\n\n  .panel {\n    display: none;\n    border: 1px solid var(--border);\n    border-radius: var(--radius);\n    background: var(--bg-card);\n    padding: 20px;\n  }\n  .panel.active { display: block; }\n\n  .panel h2 { margin: 0 0 4px; font-size: 18px; }\n  .panel .desc { color: var(--text-dim); font-size: 13px; margin: 0 0 16px; }\n\n  textarea, input[type=\"text\"], input[type=\"number\"], select {\n    width: 100%;\n    background: var(--bg);\n    color: var(--text);\n    border: 1px solid var(--border);\n    border-radius: 10px;\n    padding: 12px;\n    font-family: var(--mono);\n    font-size: 14px;\n    resize: vertical;\n    outline: none;\n  }\n  textarea:focus, input:focus, select:focus { border-color: var(--accent); }\n  textarea { min-height: 150px; }\n  input[type=\"text\"] { min-height: 44px; }\n\n  .row { display: flex; gap: 10px; flex-wrap: wrap; margin: 10px 0; }\n  .row > * { flex: 1 1 160px; }\n\n  button {\n    cursor: pointer;\n    border: 1px solid var(--border);\n    background: var(--bg-soft);\n    color: var(--text);\n    border-radius: 10px;\n    padding: 10px 16px;\n    font-size: 14px;\n    transition: all .15s ease;\n  }\n  button:hover { border-color: var(--accent); color: var(--accent); }\n  button.primary {\n    background: linear-gradient(135deg, var(--accent), var(--accent-3));\n    color: #fff;\n    border-color: transparent;\n    font-weight: 600;\n  }\n  button.primary:hover { filter: brightness(1.08); color: #fff; }\n\n  .actions { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }\n  label.lbl { display: block; font-size: 12px; color: var(--text-dim); margin: 12px 0 4px; }\n\n  .out {\n    margin-top: 12px;\n    background: var(--bg);\n    border: 1px dashed var(--border);\n    border-radius: 10px;\n    padding: 12px;\n    font-family: var(--mono);\n    font-size: 13px;\n    white-space: pre-wrap;\n    word-break: break-all;\n    min-height: 44px;\n    color: var(--text);\n  }\n  .msg { font-size: 13px; margin-top: 8px; min-height: 18px; }\n  .msg.ok { color: var(--accent-2); }\n  .msg.err { color: var(--danger); }\n\n  .hint { font-size: 12px; color: var(--text-dim); margin-top: 6px; }\n  .live { font-family: var(--mono); font-size: 13px; color: var(--accent); }\n\n  footer {\n    margin-top: 30px;\n    text-align: center;\n    color: var(--text-dim);\n    font-size: 12px;\n    line-height: 1.8;\n  }\n  footer code { color: var(--accent); font-family: var(--mono); }\n  .copy-btn { font-size: 12px; padding: 6px 10px; }\n</style>");
document.body.innerHTML = "\n<div class=\"wrap\">\n  <header class=\"hero\">\n    <span class=\"badge\">// 1024 PROGRAMMER'S DAY</span>\n    <h1>程序员工具箱 · <span class=\"num\">1024</span> 特辑</h1>\n    <p>一个页面，四个高频小工具 · 纯前端 · 零外部依赖 · 数据不出本机</p>\n  </header>\n\n  <div class=\"tabs\" id=\"tabs\">\n    <div class=\"tab active\" data-tab=\"json\">JSON 格式化</div>\n    <div class=\"tab\" data-tab=\"ts\">时间戳转换</div>\n    <div class=\"tab\" data-tab=\"b64\">Base64 编解码</div>\n    <div class=\"tab\" data-tab=\"base\">进制转换</div>\n  </div>\n\n  <!-- JSON -->\n  <section class=\"panel active\" id=\"json\">\n    <h2>JSON 格式化 / 压缩 / 校验</h2>\n    <p class=\"desc\">粘贴 JSON，一键美化、压缩或校验语法。所有处理在浏览器本地完成。</p>\n    <textarea id=\"jsonIn\" placeholder='{\"hello\":\"world\",\"list\":[1,2,3]}'></textarea>\n    <div class=\"actions\">\n      <button class=\"primary\" onclick=\"jsonFormat()\">格式化 (2 空格)</button>\n      <button onclick=\"jsonMinify()\">压缩成一行</button>\n      <button onclick=\"jsonValidate()\">仅校验语法</button>\n      <button class=\"copy-btn\" onclick=\"copyOut('jsonOut')\">复制结果</button>\n    </div>\n    <div class=\"out\" id=\"jsonOut\">结果将显示在这里…</div>\n    <div class=\"msg\" id=\"jsonMsg\"></div>\n  </section>\n\n  <!-- Timestamp -->\n  <section class=\"panel\" id=\"ts\">\n    <h2>时间戳 ↔ 日期</h2>\n    <p class=\"desc\">支持 10 位（秒）与 13 位（毫秒）时间戳，默认北京时间 (UTC+8)。</p>\n    <div class=\"row\">\n      <div>\n        <label class=\"lbl\">当前时间戳（秒）</label>\n        <div class=\"live\" id=\"nowSec\">-</div>\n      </div>\n      <div>\n        <label class=\"lbl\">当前时间戳（毫秒）</label>\n        <div class=\"live\" id=\"nowMs\">-</div>\n      </div>\n    </div>\n    <label class=\"lbl\">时间戳 → 日期</label>\n    <div class=\"row\">\n      <input type=\"text\" id=\"tsIn\" placeholder=\"例如 1716864000 或 1716864000000\" />\n      <select id=\"tsUnit\" style=\"flex:0 0 120px\">\n        <option value=\"auto\">自动识别</option>\n        <option value=\"s\">秒 (10位)</option>\n        <option value=\"ms\">毫秒 (13位)</option>\n      </select>\n    </div>\n    <div class=\"actions\">\n      <button class=\"primary\" onclick=\"tsToDate()\">转换</button>\n    </div>\n    <div class=\"out\" id=\"tsOut\">结果将显示在这里…</div>\n\n    <label class=\"lbl\">日期 → 时间戳</label>\n    <div class=\"row\">\n      <input type=\"text\" id=\"dateIn\" placeholder=\"2024-05-28 12:00:00\" />\n    </div>\n    <div class=\"actions\">\n      <button class=\"primary\" onclick=\"dateToTs()\">转为时间戳</button>\n    </div>\n    <div class=\"out\" id=\"dateOut\">结果将显示在这里…</div>\n    <div class=\"hint\">提示：日期输入支持 <code>YYYY-MM-DD HH:mm:ss</code> 或 <code>now</code>（当前时间）。</div>\n  </section>\n\n  <!-- Base64 -->\n  <section class=\"panel\" id=\"b64\">\n    <h2>Base64 编解码（支持中文 UTF-8）</h2>\n    <p class=\"desc\">编码文本为 Base64，或将 Base64 还原为文本。中文安全。</p>\n    <textarea id=\"b64In\" placeholder=\"输入要编码或解码的内容…\"></textarea>\n    <div class=\"actions\">\n      <button class=\"primary\" onclick=\"b64Encode()\">编码 → Base64</button>\n      <button onclick=\"b64Decode()\">解码 ← Base64</button>\n      <button class=\"copy-btn\" onclick=\"copyOut('b64Out')\">复制结果</button>\n    </div>\n    <div class=\"out\" id=\"b64Out\">结果将显示在这里…</div>\n    <div class=\"msg\" id=\"b64Msg\"></div>\n  </section>\n\n  <!-- Base conversion -->\n  <section class=\"panel\" id=\"base\">\n    <h2>进制转换（2 / 8 / 10 / 16）</h2>\n    <p class=\"desc\">在二进制、八进制、十进制、十六进制之间互转。</p>\n    <label class=\"lbl\">输入数值</label>\n    <input type=\"text\" id=\"baseIn\" placeholder=\"例如 255 或 FF 或 11111111\" />\n    <div class=\"row\">\n      <div>\n        <label class=\"lbl\">当前进制</label>\n        <select id=\"baseFrom\">\n          <option value=\"2\">2 (二进制)</option>\n          <option value=\"8\">8 (八进制)</option>\n          <option value=\"10\" selected>10 (十进制)</option>\n          <option value=\"16\">16 (十六进制)</option>\n        </select>\n      </div>\n      <div>\n        <label class=\"lbl\">目标进制</label>\n        <select id=\"baseTo\">\n          <option value=\"2\">2 (二进制)</option>\n          <option value=\"8\">8 (八进制)</option>\n          <option value=\"10\">10 (十进制)</option>\n          <option value=\"16\" selected>16 (十六进制)</option>\n        </select>\n      </div>\n    </div>\n    <div class=\"actions\">\n      <button class=\"primary\" onclick=\"baseConvert()\">转换</button>\n    </div>\n    <div class=\"out\" id=\"baseOut\">结果将显示在这里…</div>\n    <div class=\"msg\" id=\"baseMsg\"></div>\n  </section>\n\n  <footer>\n    <div>用 <code>WorkBuddy</code> 一键生成 · 参加「1024 程序员节」应用创作大赛</div>\n    <div>所有计算均在你的浏览器本地完成，不上传任何数据 🛡️</div>\n  </footer>\n</div>\n\n";

  // ---- Tabs ----
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(t.dataset.tab).classList.add('active');
  }));

  function setMsg(id, text, ok) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'msg ' + (ok ? 'ok' : 'err');
  }
  window.copyOut = function(id, event) {
    const btn = event.target;
    const txt = document.getElementById(id).textContent;
    if (!txt || txt.startsWith('结果将显示')) return;
    navigator.clipboard.writeText(txt).then(() => {
      const old = btn.textContent;
      btn.textContent = '已复制 ✓';
      setTimeout(() => btn.textContent = old, 1200);
    });
  }

  // ---- JSON ----
  window.jsonFormat = function() {
    const v = document.getElementById('jsonIn').value.trim();
    if (!v) return setMsg('jsonMsg', '请输入 JSON', false);
    try {
      const obj = JSON.parse(v);
      document.getElementById('jsonOut').textContent = JSON.stringify(obj, null, 2);
      setMsg('jsonMsg', '✓ 格式化成功，语法有效', true);
    } catch (e) { setMsg('jsonMsg', '✗ 语法错误：' + e.message, false); }
  }
  window.jsonMinify = function() {
    const v = document.getElementById('jsonIn').value.trim();
    if (!v) return setMsg('jsonMsg', '请输入 JSON', false);
    try {
      const obj = JSON.parse(v);
      document.getElementById('jsonOut').textContent = JSON.stringify(obj);
      setMsg('jsonMsg', '✓ 已压缩', true);
    } catch (e) { setMsg('jsonMsg', '✗ 语法错误：' + e.message, false); }
  }
  window.jsonValidate = function() {
    const v = document.getElementById('jsonIn').value.trim();
    if (!v) return setMsg('jsonMsg', '请输入 JSON', false);
    try { JSON.parse(v); setMsg('jsonMsg', '✓ JSON 语法有效', true); }
    catch (e) { setMsg('jsonMsg', '✗ 语法错误：' + e.message, false); }
  }

  // ---- Timestamp ----
  function pad(n){ return String(n).padStart(2,'0'); }
  function fmtDate(d) {
    return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+
           pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
  }
  function tickNow() {
    const now = Date.now();
    document.getElementById('nowSec').textContent = Math.floor(now/1000);
    document.getElementById('nowMs').textContent = now;
  }
  setInterval(tickNow, 1000); tickNow();

  window.tsToDate = function() {
    let v = document.getElementById('tsIn').value.trim();
    if (!v) return document.getElementById('tsOut').textContent = '请输入时间戳';
    const unit = document.getElementById('tsUnit').value;
    let ms;
    if (unit === 's') ms = parseInt(v,10)*1000;
    else if (unit === 'ms') ms = parseInt(v,10);
    else ms = v.length >= 13 ? parseInt(v,10) : parseInt(v,10)*1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) { document.getElementById('tsOut').textContent = '无效时间戳'; return; }
    const utc = d.toISOString().replace('T',' ').slice(0,19) + ' UTC';
    const bj = new Date(d.getTime() + 8*3600*1000).toISOString().replace('T',' ').slice(0,19) + ' (UTC+8)';
    document.getElementById('tsOut').textContent = bj + '\n' + utc;
  }
  window.dateToTs = function() {
    let v = document.getElementById('dateIn').value.trim();
    if (!v) return document.getElementById('dateOut').textContent = '请输入日期';
    let d;
    if (v.toLowerCase() === 'now') d = new Date();
    else {
      const m = v.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
      if (m) d = new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4]-8,+m[5],+m[6]));
      else { document.getElementById('dateOut').textContent = '格式应为 YYYY-MM-DD HH:mm:ss'; return; }
    }
    if (isNaN(d.getTime())) { document.getElementById('dateOut').textContent = '无效日期'; return; }
    document.getElementById('dateOut').textContent =
      '秒：' + Math.floor(d.getTime()/1000) + '\n毫秒：' + d.getTime();
  }

  // ---- Base64 ----
  function utf8ToB64(str){
    return btoa(unescape(encodeURIComponent(str)));
  }
  function b64ToUtf8(b64){
    return decodeURIComponent(escape(atob(b64)));
  }
  window.b64Encode = function() {
    const v = document.getElementById('b64In').value;
    if (!v) return setMsg('b64Msg','请输入内容',false);
    try {
      document.getElementById('b64Out').textContent = utf8ToB64(v);
      setMsg('b64Msg','✓ 编码成功',true);
    } catch(e){ setMsg('b64Msg','✗ 编码失败：'+e.message,false); }
  }
  window.b64Decode = function() {
    const v = document.getElementById('b64In').value.trim();
    if (!v) return setMsg('b64Msg','请输入 Base64',false);
    try {
      document.getElementById('b64Out').textContent = b64ToUtf8(v);
      setMsg('b64Msg','✓ 解码成功',true);
    } catch(e){ setMsg('b64Msg','✗ 不是合法的 Base64：'+e.message,false); }
  }

  // ---- Base conversion ----
  window.baseConvert = function() {
    const v = document.getElementById('baseIn').value.trim();
    const from = parseInt(document.getElementById('baseFrom').value,10);
    const to = parseInt(document.getElementById('baseTo').value,10);
    if (!v) return setMsg('baseMsg','请输入数值',false);
    const dec = parseInt(v, from);
    if (isNaN(dec)) { setMsg('baseMsg','✗ 输入与所选进制不匹配',false); return; }
    let res = dec.toString(to);
    if (to === 16) res = res.toUpperCase();
    document.getElementById('baseOut').textContent = res;
    setMsg('baseMsg','✓ 转换成功（十进制中间值：'+dec+'）',true);
  }

document.querySelectorAll('[onclick]').forEach(el => {
 const call = el.getAttribute('onclick').match(/^(\w+)\((?:'([^']*)')?\)$/);
 el.removeAttribute('onclick');
 if (call) el.addEventListener('click', event => window[call[1]](call[2], event));
});
