document.title='1024 程序员工具箱';
const style=document.createElement('style');style.textContent="\n  :root{\n    --bg:#0a0e14; --bg2:#0d1117; --panel:#11161f; --panel2:#161c27;\n    --line:#222b38; --text:#c9d1d9; --muted:#7d8896; --dim:#586273;\n    --green:#3fb950; --cyan:#39d0d8; --purple:#bc8cff; --amber:#e3b341;\n    --red:#f85149; --radius:14px;\n  }\n  *{box-sizing:border-box;margin:0;padding:0}\n  html,body{height:100%}\n  body{\n    font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n    background:\n      radial-gradient(1200px 600px at 80% -10%, rgba(63,185,80,.10), transparent 60%),\n      radial-gradient(900px 500px at 0% 110%, rgba(188,140,255,.10), transparent 55%),\n      var(--bg);\n    color:var(--text); line-height:1.55; min-height:100vh;\n    -webkit-font-smoothing:antialiased;\n  }\n  code,pre,textarea,input,.mono{font-family:\"SF Mono\",ui-monospace,\"JetBrains Mono\",Consolas,monospace}\n  .wrap{max-width:1080px;margin:0 auto;padding:28px 20px 60px}\n\n  /* Hero */\n  .hero{\n    position:relative;border:1px solid var(--line);border-radius:18px;overflow:hidden;\n    background:linear-gradient(135deg,#0f1620 0%,#101826 100%);\n    padding:26px 24px;margin-bottom:22px;\n  }\n  .hero::before{\n    content:\"1024\";position:absolute;right:-10px;top:-26px;font-size:150px;font-weight:800;\n    color:rgba(63,185,80,.06);letter-spacing:-6px;pointer-events:none;user-select:none;\n  }\n  .hero h1{font-size:26px;font-weight:800;letter-spacing:.5px;display:flex;align-items:center;gap:10px}\n  .hero h1 .tag{\n    font-size:11px;font-weight:700;color:#0a0e14;background:linear-gradient(90deg,var(--green),var(--cyan));\n    padding:3px 9px;border-radius:999px;letter-spacing:1px;\n  }\n  .hero p{color:var(--muted);margin-top:8px;font-size:14px;max-width:640px}\n  .hero .meta{margin-top:14px;display:flex;gap:18px;flex-wrap:wrap;font-size:12.5px;color:var(--dim)}\n  .hero .meta b{color:var(--cyan);font-weight:600}\n\n  /* Layout */\n  .layout{display:grid;grid-template-columns:180px 1fr;gap:18px;align-items:start}\n  .tabs{display:flex;flex-direction:column;gap:6px;position:sticky;top:18px}\n  .tab{\n    appearance:none;border:1px solid var(--line);background:var(--panel);color:var(--muted);\n    padding:11px 13px;border-radius:11px;cursor:pointer;font-size:13.5px;text-align:left;\n    display:flex;align-items:center;gap:9px;transition:.15s;font-family:inherit;\n  }\n  .tab .ico{font-size:16px;width:20px;text-align:center}\n  .tab:hover{border-color:#2f3b4c;color:var(--text)}\n  .tab.active{background:var(--panel2);border-color:var(--green);color:var(--text);\n    box-shadow:0 0 0 1px rgba(63,185,80,.25), 0 6px 18px rgba(0,0,0,.25)}\n  .tab.active .ico{filter:drop-shadow(0 0 6px rgba(63,185,80,.6))}\n\n  .panel{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:20px}\n  .tool{display:none;animation:fade .25s ease}\n  .tool.active{display:block}\n  @keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}\n  .tool h2{font-size:17px;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:8px}\n  .tool .desc{color:var(--muted);font-size:13px;margin-bottom:16px}\n\n  label{display:block;font-size:12.5px;color:var(--muted);margin:14px 0 6px}\n  textarea,input[type=text],input[type=number],select{\n    width:100%;background:var(--bg2);border:1px solid var(--line);color:var(--text);\n    border-radius:10px;padding:11px 12px;font-size:13.5px;outline:none;transition:.15s;\n  }\n  textarea{min-height:120px;resize:vertical;line-height:1.5}\n  textarea:focus,input:focus,select:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(63,185,80,.12)}\n  .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}\n  .row > *{flex:1 1 200px}\n  .row.tight > *{flex:0 1 auto}\n  button.btn{\n    appearance:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;\n    border:1px solid var(--line);background:var(--panel2);color:var(--text);\n    padding:9px 15px;border-radius:10px;transition:.15s;\n  }\n  button.btn:hover{border-color:#2f3b4c;background:#1b2230}\n  button.btn.primary{background:linear-gradient(90deg,var(--green),#2ea043);border-color:transparent;color:#06110a}\n  button.btn.primary:hover{filter:brightness(1.07)}\n  button.btn.ghost{background:transparent}\n\n  .actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}\n  .out{\n    margin-top:14px;background:var(--bg2);border:1px solid var(--line);border-radius:10px;\n    padding:13px 14px;font-size:13px;white-space:pre-wrap;word-break:break-all;min-height:42px;\n  }\n  .out.err{border-color:rgba(248,81,73,.5);color:var(--red);background:rgba(248,81,73,.07)}\n  .out.ok{border-color:rgba(63,185,80,.35)}\n  .hint{font-size:12px;color:var(--dim);margin-top:8px}\n  .copy{position:relative}\n  .pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);\n    background:var(--bg2);border:1px solid var(--line);padding:5px 10px;border-radius:999px}\n\n  /* password */\n  .strength{height:8px;border-radius:6px;background:var(--bg2);border:1px solid var(--line);overflow:hidden;margin-top:10px}\n  .strength > i{display:block;height:100%;width:0;transition:.3s;border-radius:6px}\n  .chk{display:flex;gap:14px;flex-wrap:wrap;margin-top:12px}\n  .chk label{display:flex;align-items:center;gap:7px;margin:0;color:var(--text);font-size:13px;cursor:pointer}\n  .chk input{width:auto;flex:none;accent-color:var(--green)}\n  input[type=range]{accent-color:var(--green);padding:0}\n\n  /* regex highlight */\n  mark{background:rgba(227,179,65,.32);color:#ffe39a;border-radius:3px;padding:0 2px}\n  .rcount{font-size:12px;color:var(--amber);margin-top:6px}\n\n  /* toast */\n  #toast{position:fixed;left:50%;bottom:30px;transform:translateX(-50%) translateY(20px);\n    background:#1b2230;border:1px solid var(--green);color:var(--text);padding:10px 18px;\n    border-radius:10px;font-size:13px;opacity:0;pointer-events:none;transition:.25s;z-index:50}\n  #toast.show{opacity:1;transform:translateX(-50%) translateY(0)}\n\n  .footer{margin-top:26px;text-align:center;color:var(--dim);font-size:12px}\n  .footer a{color:var(--cyan);text-decoration:none}\n\n  @media(max-width:720px){\n    .layout{grid-template-columns:1fr}\n    .tabs{position:static;flex-direction:row;overflow-x:auto;padding-bottom:4px}\n    .tab{white-space:nowrap;flex:0 0 auto}\n    .hero::before{font-size:96px}\n  }\n";document.head.appendChild(style);
document.getElementById('app').innerHTML="\n<div class=\"wrap\">\n  <header class=\"hero\">\n    <h1>🛠️ 1024 程序员工具箱 <span class=\"tag\"></span></h1>\n    <p>一款轻量程序员工具集：时间戳、JSON、Base64、正则、密码、进制转换，六大常用功能单页搞定，离线可用、零依赖。</p>\n    <div class=\"meta\">\n      <span>🌐 <b>纯前端</b> 单文件 · 数据不出本机</span>\n      <span>⚡ <b>即时运行</b> · 复制即走</span>\n      <span>🧩 <b>6</b> 个实用工具</span>\n    </div>\n  </header>\n\n  <div class=\"layout\">\n    <nav class=\"tabs\" id=\"tabs\">\n      <button class=\"tab active\" data-tab=\"ts\"><span class=\"ico\">🕒</span>时间戳</button>\n      <button class=\"tab\" data-tab=\"json\"><span class=\"ico\">🧾</span>JSON</button>\n      <button class=\"tab\" data-tab=\"b64\"><span class=\"ico\">🔤</span>Base64</button>\n      <button class=\"tab\" data-tab=\"re\"><span class=\"ico\">🔍</span>正则</button>\n      <button class=\"tab\" data-tab=\"pwd\"><span class=\"ico\">🔐</span>密码</button>\n      <button class=\"tab\" data-tab=\"base\"><span class=\"ico\">🔢</span>进制</button>\n    </nav>\n\n    <main>\n      <!-- 时间戳 -->\n      <section class=\"panel tool active\" id=\"ts\">\n        <h2>🕒 时间戳转换</h2>\n        <div class=\"desc\">Unix 时间戳与日期互转，支持秒 / 毫秒，实时显示当前时间。</div>\n\n        <div class=\"row tight\">\n          <span class=\"pill\">⏱ 当前秒级：<b class=\"mono\" id=\"now-s\">—</b></span>\n          <span class=\"pill\">⏱ 当前毫秒：<b class=\"mono\" id=\"now-ms\">—</b></span>\n        </div>\n\n        <label>时间戳 → 日期</label>\n        <div class=\"row\">\n          <input class=\"mono\" id=\"ts-input\" placeholder=\"例如 1761052800 或 1761052800000\" type=\"text\">\n          <select id=\"ts-unit\" style=\"flex:0 1 120px\">\n            <option value=\"s\">秒 (10位)</option>\n            <option value=\"ms\">毫秒 (13位)</option>\n          </select>\n        </div>\n        <div class=\"actions\"><button class=\"btn primary\" onclick=\"tsToDate()\">转换 →</button></div>\n        <div class=\"out\" id=\"ts-out\">等待输入…</div>\n\n        <label>日期 → 时间戳</label>\n        <input class=\"mono\" id=\"date-input\" placeholder=\"2026-10-22 10:00:00 或 2026-10-22T10:00\" type=\"text\">\n        <div class=\"actions\">\n          <button class=\"btn primary\" onclick=\"dateToTs()\">转为秒/毫秒 →</button>\n        </div>\n        <div class=\"out\" id=\"date-out\">等待输入…</div>\n      </section>\n\n      <!-- JSON -->\n      <section class=\"panel tool\" id=\"json\">\n        <h2>🧾 JSON 格式化 / 压缩</h2>\n        <div class=\"desc\">粘贴 JSON，一键格式化（美化缩进）或压缩，并提供错误定位。</div>\n        <label>输入</label>\n        <textarea class=\"mono\" id=\"json-in\" placeholder=\"{&quot;name&quot;:&quot;toolbox&quot;,&quot;ver&quot;:1024,&quot;ok&quot;:true}\"></textarea>\n        <div class=\"actions\">\n          <button class=\"btn primary\" onclick=\"jsonFmt()\">格式化</button>\n          <button class=\"btn\" onclick=\"jsonMin()\">压缩</button>\n          <button class=\"btn ghost\" onclick=\"clearEl('json-in');clearEl('json-out')\">清空</button>\n          <button class=\"btn ghost copy\" onclick=\"copyOut('json-out')\">复制结果</button>\n        </div>\n        <div class=\"out\" id=\"json-out\">等待输入…</div>\n      </section>\n\n      <!-- Base64 -->\n      <section class=\"panel tool\" id=\"b64\">\n        <h2>🔤 Base64 编解码</h2>\n        <div class=\"desc\">UTF-8 安全的文本 ↔ Base64 互转，中文不会乱码。</div>\n        <label>输入</label>\n        <textarea class=\"mono\" id=\"b64-in\" placeholder=\"在这里输入文本或 Base64 字符串\"></textarea>\n        <div class=\"actions\">\n          <button class=\"btn primary\" onclick=\"b64Enc()\">编码 →</button>\n          <button class=\"btn\" onclick=\"b64Dec()\">← 解码</button>\n          <button class=\"btn ghost copy\" onclick=\"copyOut('b64-out')\">复制结果</button>\n        </div>\n        <div class=\"out\" id=\"b64-out\">等待输入…</div>\n      </section>\n\n      <!-- 正则 -->\n      <section class=\"panel tool\" id=\"re\">\n        <h2>🔍 正则表达式测试</h2>\n        <div class=\"desc\">输入正则与测试文本，实时高亮所有匹配项并统计数量。</div>\n        <label>正则 Pattern</label>\n        <div class=\"row\">\n          <input class=\"mono\" id=\"re-pat\" placeholder=\"例如 \\d{4}-\\d{2}-\\d{2}\" type=\"text\">\n          <input class=\"mono\" id=\"re-flags\" placeholder=\"gi\" type=\"text\" value=\"g\" style=\"flex:0 1 90px\">\n        </div>\n        <div class=\"hint\">flags：g 全局 · i 忽略大小写 · m 多行 · s 单行点匹配。高亮需含 g。</div>\n        <label>测试文本</label>\n        <textarea class=\"mono\" id=\"re-text\" placeholder=\"把要测试的文本粘贴到这里…\"></textarea>\n        <div class=\"actions\"><button class=\"btn primary\" onclick=\"reTest()\">测试匹配</button></div>\n        <div class=\"out\" id=\"re-out\">等待输入…</div>\n        <div class=\"rcount\" id=\"re-count\"></div>\n      </section>\n\n      <!-- 密码 -->\n      <section class=\"panel tool\" id=\"pwd\">\n        <h2>🔐 随机密码生成</h2>\n        <div class=\"desc\">使用浏览器密码学级随机源生成高强度密码，可自定义长度与字符集。</div>\n        <label>长度：<b id=\"pwd-len-v\">16</b></label>\n        <input id=\"pwd-len\" max=\"64\" min=\"4\" oninput=\"document.getElementById('pwd-len-v').textContent=this.value\" type=\"range\" value=\"16\">\n        <div class=\"chk\">\n          <label><input checked id=\"c-up\" type=\"checkbox\"> 大写 A-Z</label>\n          <label><input checked id=\"c-low\" type=\"checkbox\"> 小写 a-z</label>\n          <label><input checked id=\"c-num\" type=\"checkbox\"> 数字 0-9</label>\n          <label><input checked id=\"c-sym\" type=\"checkbox\"> 符号 !@#$</label>\n          <label><input id=\"c-amb\" type=\"checkbox\"> 排除易混 (0O1lI)</label>\n        </div>\n        <div class=\"actions\">\n          <button class=\"btn primary\" onclick=\"genPwd()\">生成密码</button>\n          <button class=\"btn ghost copy\" onclick=\"copyText(document.getElementById('pwd-out').textContent)\">复制</button>\n        </div>\n        <div class=\"out mono\" id=\"pwd-out\">点击「生成密码」…</div>\n        <div class=\"strength\"><i id=\"pwd-bar\"></i></div>\n        <div class=\"hint\" id=\"pwd-strength\">强度：—</div>\n      </section>\n\n      <!-- 进制 -->\n      <section class=\"panel tool\" id=\"base\">\n        <h2>🔢 进制转换</h2>\n        <div class=\"desc\">二进制 / 八进制 / 十进制 / 十六进制互转，支持超大整数（BigInt）。</div>\n        <label>数值（选择其原始进制）</label>\n        <div class=\"row\">\n          <input class=\"mono\" id=\"base-in\" placeholder=\"例如 FF 或 1024 或 1111111111\" type=\"text\">\n          <select id=\"base-from\" style=\"flex:0 1 130px\">\n            <option value=\"2\">二进制 (2)</option>\n            <option value=\"8\">八进制 (8)</option>\n            <option selected value=\"10\">十进制 (10)</option>\n            <option value=\"16\">十六进制 (16)</option>\n          </select>\n        </div>\n        <div class=\"actions\"><button class=\"btn primary\" onclick=\"baseConv()\">转换 →</button></div>\n        <div class=\"out\" id=\"base-out\">等待输入…</div>\n      </section>\n    </main>\n  </div>\n\n  <div class=\"footer\">\n    纯前端单文件 · 你的数据只在本机处理，不会上传 💚\n  </div>\n</div>\n<div id=\"toast\"></div>\n\n";

/* ---------- 通用 ---------- */
function $(id){return document.getElementById(id);}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),1600);}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function setOut(id,text,cls){const e=$(id);e.textContent=text;e.className='out'+(cls?(' '+cls):'');}
function copyText(t){if(!t||t==='点击「生成密码」…'){toast('没有可复制的内容');return;}navigator.clipboard.writeText(t).then(()=>toast('已复制到剪贴板 ✓')).catch(()=>toast('复制失败，请手动选择'));}
function copyOut(id){copyText($(id).textContent);}
function clearEl(id){const e=$(id);if(e.tagName==='TEXTAREA'||e.tagName==='INPUT')e.value='';else e.textContent='';}

/* ---------- 标签页 ---------- */
$('tabs').addEventListener('click',e=>{
  const b=e.target.closest('.tab');if(!b)return;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tool').forEach(t=>t.classList.remove('active'));
  b.classList.add('active');
  $(b.dataset.tab).classList.add('active');
});

/* ---------- 时间戳 ---------- */
function tick(){const n=Date.now();$('now-ms').textContent=n;$('now-s').textContent=Math.floor(n/1000);}
tick();setInterval(tick,1000);
function tsToDate(){
  const v=$('ts-input').value.trim();if(!v){setOut('ts-out','请输入时间戳','err');return;}
  let ms;
  try{const num=BigInt(v);ms=Number(num * ($('ts-unit').value==='s'?1000n:1n));}
  catch(e){setOut('ts-out','时间戳不是合法数字','err');return;}
  const d=new Date(ms);
  if(isNaN(d.getTime())){setOut('ts-out','该时间戳超出可表示范围','err');return;}
  const wd=['日','一','二','三','四','五','六'][d.getDay()];
  setOut('ts-out',
`本地时间：${d.toLocaleString('zh-CN')}  星期${wd}
UTC时间： ${d.toISOString().replace('T',' ').replace(/\.\d+Z$/,' UTC')}
ISO时间： ${d.toISOString()}`,'ok');
}
function dateToTs(){
  let v=$('date-input').value.trim();if(!v){setOut('date-out','请输入日期','err');return;}
  if(/^\d{4}-\d{2}-\d{2}$/.test(v))v+='T00:00:00';
  const d=new Date(v);
  if(isNaN(d.getTime())){setOut('date-out','日期格式无法解析，试试 2026-10-22 10:00:00','err');return;}
  const ms=d.getTime();
  setOut('date-out',`秒级：${Math.floor(ms/1000)}\n毫秒：${ms}`,'ok');
}

/* ---------- JSON ---------- */
function jsonFmt(){
  const raw=$('json-in').value;
  try{
    if(!raw.trim()){setOut('json-out','输入为空','err');return;}
    const obj=JSON.parse(raw);
    setOut('json-out',JSON.stringify(obj,null,2),'ok');
  }catch(e){setOut('json-out','JSON 解析失败：\n'+e.message,'err');}
}
function jsonMin(){
  const raw=$('json-in').value;
  try{
    if(!raw.trim()){setOut('json-out','输入为空','err');return;}
    const obj=JSON.parse(raw);
    setOut('json-out',JSON.stringify(obj),'ok');
  }catch(e){setOut('json-out','JSON 解析失败：\n'+e.message,'err');}
}

/* ---------- Base64 (UTF-8 safe) ---------- */
function utf8ToB64(str){
  const bytes=new TextEncoder().encode(str);
  let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin);
}
function b64ToUtf8(b64){
  const bin=atob(b64);const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
function b64Enc(){
  const raw=$('b64-in').value;
  if(!raw){setOut('b64-out','请输入要编码的文本','err');return;}
  try{setOut('b64-out',utf8ToB64(raw),'ok');}catch(e){setOut('b64-out','编码失败：'+e.message,'err');}
}
function b64Dec(){
  const raw=$('b64-in').value.trim();
  if(!raw){setOut('b64-out','请输入要解码的 Base64','err');return;}
  try{setOut('b64-out',b64ToUtf8(raw),'ok');}catch(e){setOut('b64-out','不是合法的 Base64：'+e.message,'err');}
}

/* ---------- 正则 ---------- */
function reTest(){
  const pat=$('re-pat').value,flagsRaw=$('re-flags').value.trim(),text=$('re-text').value;
  if(!pat){setOut('re-out','请输入正则 Pattern','err');$('re-count').textContent='';return;}
  let flags=flagsRaw.includes('g')?flagsRaw:flagsRaw+'g'; // 高亮需全局
  let re;
  try{re=new RegExp(pat,flags);}catch(e){setOut('re-out','正则语法错误：'+e.message,'err');$('re-count').textContent='';return;}
  if(!text){setOut('re-out','请输入测试文本','err');$('re-count').textContent='';return;}
  const shownFlags=flagsRaw||'无';
  let last=0; let highlighted=''; for (const m of text.matchAll(re)) { highlighted+=escapeHtml(text.slice(last,m.index))+'<mark>'+escapeHtml(m[0])+'</mark>'; last=m.index+m[0].length; } highlighted+=escapeHtml(text.slice(last));
  let count=0;const gRe=new RegExp(pat,flags);
  while(true){const m=gRe.exec(text);if(!m)break;count++;if(m[0].length===0)gRe.lastIndex++;if(count>100000)break;} // 安全上限
  $('re-out').innerHTML=highlighted||'（无匹配，文本为空）';
  $('re-out').className='out'+(count?' ok':'');
  $('re-count').textContent=`flags: ${shownFlags} · 共匹配 ${count} 处`;
}

/* ---------- 密码 ---------- */
function genPwd(){
  const len=+ $('pwd-len').value;
  const sets=[];
  if($('c-up').checked)sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  if($('c-low').checked)sets.push('abcdefghijklmnopqrstuvwxyz');
  if($('c-num').checked)sets.push('0123456789');
  if($('c-sym').checked)sets.push('!@#$%^&*()-_=+[]{};:,.<>?');
  let pool=sets.join('');
  if($('c-amb').checked){for(let i=0;i<sets.length;i++)sets[i]=sets[i].replace(/[0O1lI]/g,'');pool=sets.join('');}
  if(!pool){setOut('pwd-out','请至少选择一种字符类型','err');return;}
  const arr=new Uint32Array(len);
  crypto.getRandomValues(arr);
  let out='';
  for(let i=0;i<len;i++)out+=pool[arr[i]%pool.length];
  // 保证每类至少出现一次
  if(sets.length>1){
    const forced=sets.map(s=>s[crypto.getRandomValues(new Uint32Array(1))[0]%s.length]).join('');
    out=(forced+out).slice(0,len);
    const chars=out.split('');for(let i=chars.length-1;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[chars[i],chars[j]]=[chars[j],chars[i]];}out=chars.join('');
  }
  setOut('pwd-out',out,'ok');
  const bits=len*Math.log2(pool.length);
  let lvl,color;
  if(bits<40){lvl='弱';color='var(--red)';}
  else if(bits<60){lvl='中';color='var(--amber)';}
  else if(bits<90){lvl='强';color='var(--green)';}
  else{lvl='极强';color='var(--cyan)';}
  $('pwd-bar').style.width=Math.min(100,bits/128*100)+'%';
  $('pwd-bar').style.background=color;
  $('pwd-strength').textContent=`强度：${lvl} · 熵约 ${bits.toFixed(1)} bit`;
}

/* ---------- 进制 ---------- */
function parseBig(str,base){
  str=str.trim().replace(/^0x/i,'').replace(/^0b/i,'').replace(/^0o/i,'');
  let n=0n;const B=BigInt(base);
  for(const ch of str){
    const d=parseInt(ch,base);
    if(isNaN(d)||d>=base)throw new Error('非法字符「'+ch+'」(超出 '+base+' 进制)');
    n=n*B+BigInt(d);
  }
  return n;
}
function toBase(n,base){
  if(n===0n)return '0';
  const chars='0123456789abcdefghijklmnopqrstuvwxyz';
  const B=BigInt(base);let s='';let neg=n<0n;n=n<0n?-n:n;
  while(n>0n){s=chars[Number(n%B)]+s;n/=B;}
  return (neg?'-':'')+s;
}
function baseConv(){
  const v=$('base-in').value.trim();const from=+$('base-from').value;
  if(!v){setOut('base-out','请输入数值','err');return;}
  let n;
  try{n=parseBig(v,from);}catch(e){setOut('base-out',e.message,'err');return;}
  setOut('base-out',
`二进制：  ${toBase(n,2)}
八进制：  ${toBase(n,8)}
十进制：  ${toBase(n,10)}
十六进制：${toBase(n,16).toUpperCase()}`,'ok');
}

/* 初始示例 */
(()=>{
  $('base-in').value='1024';
  $('re-text').value='示例日期 2026-10-22 与 2026-11-01。';
  $('re-pat').value='\\d{4}-\\d{2}-\\d{2}';
})();

const handlers={
 'tsToDate()':tsToDate,'dateToTs()':dateToTs,'jsonFmt()':jsonFmt,'jsonMin()':jsonMin,
 "clearEl('json-in');clearEl('json-out')":()=>{clearEl('json-in');clearEl('json-out')},
 "copyOut('json-out')":()=>copyOut('json-out'),'b64Enc()':b64Enc,'b64Dec()':b64Dec,
 "copyOut('b64-out')":()=>copyOut('b64-out'),'reTest()':reTest,'genPwd()':genPwd,
 "copyText(document.getElementById('pwd-out').textContent)":()=>copyText($('pwd-out').textContent),
 'baseConv()':baseConv
};
document.querySelectorAll('[onclick]').forEach(el=>{const fn=handlers[el.getAttribute('onclick')];el.removeAttribute('onclick');if(fn)el.addEventListener('click',fn)});
const slider=$('pwd-len');slider.removeAttribute('oninput');slider.addEventListener('input',()=>{$('pwd-len-v').textContent=slider.value});

Object.assign(window,{tsToDate,dateToTs,jsonFmt,jsonMin,clearEl,copyOut,b64Enc,b64Dec,reTest,genPwd,copyText,baseConv});
