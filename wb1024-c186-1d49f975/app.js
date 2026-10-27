const style=document.createElement("style"); style.textContent="\n:root{\n  --bg:#0d1117; --card:#161b22; --card2:#1c2128; --line:#30363d;\n  --txt:#e6edf3; --dim:#8b949e; --accent:#2fbf87; --accent-soft:#123324;\n  --warn:#d29922; --err:#f85149;\n}\n*{box-sizing:border-box;margin:0;padding:0}\nhtml,body{height:100%}\nbody{\n  background:var(--bg); color:var(--txt);\n  font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;\n  display:flex; justify-content:center; padding:28px 16px 56px;\n  -webkit-font-smoothing:antialiased; line-height:1.6;\n}\n.app{width:100%; max-width:640px}\n\n/* ── 头部 ── */\n.hd{display:flex; align-items:baseline; gap:10px; margin-bottom:22px; flex-wrap:wrap}\n.logo{font-size:22px; font-weight:700; letter-spacing:.5px}\n.logo em{color:var(--accent); font-style:normal}\n.badge{font-size:11px; color:var(--accent); border:1px solid var(--accent-soft); background:var(--accent-soft);\n  padding:2px 8px; border-radius:999px; white-space:nowrap}\n.sub{font-size:13px; color:var(--dim); margin-left:auto}\n\n/* ── 单位切换 ── */\n.seg{display:inline-flex; background:var(--card); border:1px solid var(--line); border-radius:10px; padding:3px; gap:2px}\n.seg button{\n  background:none; border:0; color:var(--dim); font:inherit; font-size:13px; font-weight:600;\n  padding:6px 16px; border-radius:7px; cursor:pointer; transition:.15s;\n}\n.seg button.on{background:var(--accent-soft); color:var(--accent)}\n.seg button:hover:not(.on){color:var(--txt)}\n\n/* ── 通用卡片 ── */\n.card{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px; margin-bottom:14px}\n.card-h{display:flex; align-items:center; gap:8px; margin-bottom:14px}\n.card-h b{font-size:14px; font-weight:600}\n.card-h .hint{font-size:12px; color:var(--dim); margin-left:auto}\n\n/* ── 实时时间戳大屏 ── */\n.now{background:linear-gradient(160deg,#161b22,#11181d); border-color:var(--accent-soft)}\n.now-v{font-size:34px; font-weight:700; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;\n  letter-spacing:-.5px; word-break:break-all; cursor:pointer; transition:.15s; user-select:all}\n.now-v:hover{color:var(--accent)}\n.now-m{font-size:13px; color:var(--dim); font-family:ui-monospace,Menlo,Consolas,monospace; margin-top:6px}\n.now-tip{font-size:11px; color:var(--dim); margin-top:10px; opacity:.75}\n\n/* ── 输入 ── */\n.fld{position:relative; margin-bottom:12px}\ninput[type=text],input[type=datetime-local]{\n  width:100%; background:var(--card2); border:1px solid var(--line); color:var(--txt);\n  border-radius:10px; padding:12px 14px; font-size:15px; font-family:ui-monospace,Menlo,Consolas,monospace;\n  outline:none; transition:.15s;\n}\ninput:focus{border-color:var(--accent); box-shadow:0 0 0 3px rgba(47,191,135,.12)}\ninput::placeholder{color:#5c6672}\ninput[type=datetime-local]{font-size:14px}\n.warn{color:var(--warn); font-size:12px; margin-top:6px; min-height:16px}\n\n/* ── 结果行 ── */\n.res{border-top:1px dashed var(--line); margin-top:4px}\n.res:first-child{border-top:0}\n.row{display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid rgba(48,54,61,.5)}\n.row:last-child{border-bottom:0}\n.row-k{flex:0 0 92px; font-size:12px; color:var(--dim)}\n.row-v{flex:1; font-family:ui-monospace,Menlo,Consolas,monospace; font-size:14px; word-break:break-all; user-select:all}\n.row-v.muted{color:var(--dim)}\n.cp{flex:0 0 auto; background:var(--card2); border:1px solid var(--line); color:var(--dim);\n  font-size:11px; padding:4px 10px; border-radius:6px; cursor:pointer; transition:.15s; white-space:nowrap}\n.cp:hover{border-color:var(--accent); color:var(--accent)}\n.cp.ok{border-color:var(--accent); color:var(--accent); background:var(--accent-soft)}\n\n.empty{color:var(--dim); font-size:13px; padding:10px 0; text-align:center}\n\n/* ── 底部 ── */\n.ft{text-align:center; font-size:12px; color:var(--dim); margin-top:24px; opacity:.8}\n\n/* ── Toast ── */\n#toast{position:fixed; left:50%; bottom:34px; transform:translate(-50%,20px);\n  background:var(--accent); color:#06231a; font-size:13px; font-weight:600;\n  padding:9px 18px; border-radius:999px; opacity:0; pointer-events:none; transition:.22s; z-index:99}\n#toast.show{opacity:1; transform:translate(-50%,0)}\n\n@media (max-width:480px){\n  .now-v{font-size:27px}\n  .row{flex-wrap:wrap}\n  .row-k{flex:0 0 100%}\n  .sub{margin-left:0; width:100%}\n}\n"; document.head.appendChild(style);
document.getElementById("app").innerHTML="\n<div class=\"app\">\n\n  <div class=\"hd\">\n    <span class=\"logo\">时间戳<em>秒转</em></span>\n    <span class=\"badge\">1024 造物挑战</span>\n    <span class=\"sub\">零依赖 · 纯前端 · 不上传任何数据</span>\n  </div>\n\n  <div style=\"margin-bottom:14px\">\n    <div class=\"seg\" id=\"unitSeg\">\n      <button class=\"on\" data-u=\"s\">秒 (s)</button>\n      <button data-u=\"ms\">毫秒 (ms)</button>\n    </div>\n  </div>\n\n  <!-- 实时当前时间戳 -->\n  <div class=\"card now\">\n    <div class=\"card-h\"><b>⏱ 此刻</b><span class=\"hint\" id=\"nowHint\">点击数字可复制</span></div>\n    <div class=\"now-v\" id=\"nowMain\" title=\"点击复制\">—</div>\n    <div class=\"now-m\" id=\"nowAlt\">—</div>\n    <div class=\"now-tip\" id=\"nowHuman\">—</div>\n  </div>\n\n  <!-- 时间戳 → 时间 -->\n  <div class=\"card\">\n    <div class=\"card-h\"><b>① 时间戳 → 时间</b><span class=\"hint\" id=\"detectHint\"></span></div>\n    <div class=\"fld\">\n      <input autocomplete=\"off\" id=\"tsIn\" placeholder=\"粘贴 Unix 时间戳，如 1761129600 或 1761129600000\" spellcheck=\"false\" type=\"text\">\n      <div class=\"warn\" id=\"tsWarn\"></div>\n    </div>\n    <div class=\"res\" id=\"tsOut\"><div class=\"empty\">输入时间戳后自动换算</div></div>\n  </div>\n\n  <!-- 时间 → 时间戳 -->\n  <div class=\"card\">\n    <div class=\"card-h\"><b>② 时间 → 时间戳</b><span class=\"hint\" id=\"tzHint\">按本机时区解析</span></div>\n    <div class=\"fld\">\n      <input id=\"dtIn\" step=\"1\" type=\"datetime-local\">\n      <div class=\"warn\" id=\"dtWarn\"></div>\n    </div>\n    <div class=\"res\" id=\"dtOut\"></div>\n  </div>\n\n  <div class=\"ft\">时间戳秒转 · 一个输入框解决的事，不做成两个</div>\n</div>\n\n<div id=\"toast\"></div>\n\n";

(function(){
  "use strict";

  /* ── 工具函数 ── */
  var $ = function(id){ return document.getElementById(id); };
  function pad(n){ return n<10 ? "0"+n : ""+n; }

  // 按指定时区格式化为 YYYY-MM-DD HH:mm:ss（依赖内置 Intl，无网络请求）
  function fmtTZ(d, tz){
    try{
      var p = new Intl.DateTimeFormat("zh-CN", {
        timeZone: tz, year:"numeric", month:"2-digit", day:"2-digit",
        hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false
      }).formatToParts(d);
      var m = {};
      p.forEach(function(x){ m[x.type] = x.value; });
      return m.year+"-"+m.month+"-"+m.day+" "+m.hour+":"+m.minute+":"+m.second;
    }catch(e){
      // 极端环境降级：用本地时间加偏移估算
      return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+" "+pad(d.getHours())+":"+pad(d.getMinutes())+":"+pad(d.getSeconds());
    }
  }
  function fmtLocal(d){
    return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+" "+
           pad(d.getHours())+":"+pad(d.getMinutes())+":"+pad(d.getSeconds());
  }
  function weekday(d){
    return "周"+"日一二三四五六".charAt(d.getDay());
  }
  // 相对时间
  function human(tsSec){
    var diff = Math.floor(Date.now()/1000) - tsSec;
    var abs = Math.abs(diff), suffix = diff>=0 ? "前" : "后";
    var U = [["年",31536000],["个月",2592000],["天",86400],["小时",3600],["分钟",60]];
    for(var i=0;i<U.length;i++){
      if(abs >= U[i][1]){
        var v = Math.floor(abs/U[i][1]);
        return v+" "+U[i][0]+suffix;
      }
    }
    return abs===0 ? "刚刚" : abs+" 秒"+suffix;
  }
  function isValid(d){ return !isNaN(d.getTime()); }

  /* ── 复制（兼容 iframe / 非安全上下文）── */
  var toastTimer=null;
  function toast(msg){
    var t=$("toast"); t.textContent=msg; t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){ t.classList.remove("show"); },1400);
  }
  function copy(text, btn){
    var done=function(){
      toast("已复制");
      if(btn){ var old=btn.textContent; btn.textContent="✓"; btn.classList.add("ok");
        setTimeout(function(){ btn.textContent=old; btn.classList.remove("ok"); },1000); }
    };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done, function(){ fallback(text, done); });
    }else{ fallback(text, done); }
  }
  function fallback(text, done){
    try{
      var ta=document.createElement("textarea");
      ta.value=text; ta.setAttribute("readonly","");
      ta.style.position="fixed"; ta.style.top="-999px"; ta.style.opacity="0";
      document.body.appendChild(ta); ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta); done();
    }catch(e){ toast("复制失败，请手动选择"); }
  }

  /* ── 单位状态 ── */
  var unit="s";
  Array.prototype.forEach.call(document.querySelectorAll("#unitSeg button"), function(b){
    b.onclick=function(){
      unit=b.getAttribute("data-u");
      Array.prototype.forEach.call(document.querySelectorAll("#unitSeg button"), function(x){ x.classList.remove("on"); });
      b.classList.add("on");
      tickNow(); renderDt(); renderTs();
    };
  });

  /* ── 此刻：实时时间戳 ── */
  var lastSec=-1;
  function nowTs(){ return Date.now(); }
  function tickNow(){
    var ms=nowTs(), sec=Math.floor(ms/1000);
    var main = unit==="s" ? sec : ms;
    var alt  = unit==="s" ? ms : sec;
    $("nowMain").textContent = main;
    $("nowAlt").textContent  = (unit==="s" ? "毫秒 "+alt : "秒 "+alt);
    if(sec!==lastSec){
      lastSec=sec;
      var d=new Date(ms);
      $("nowHuman").textContent = fmtLocal(d)+" "+weekday(d)+" · 本机时间 UTC"+(tzOffsetLabel());
    }
  }
  function tzOffsetLabel(){
    var off=-new Date().getTimezoneOffset();
    if(off===0) return "+0";
    var sign=off>0?"+":"-", a=Math.abs(off), h=Math.floor(a/60), m=a%60;
    return sign+h+(m?":"+pad(m):"");
  }
  $("nowMain").onclick=function(){ copy($("nowMain").textContent, null); };
  $("nowAlt").onclick=function(){ copy($("nowAlt").textContent.replace(/^(毫秒|秒)\s*/,""), null); };

  /* ── 本地时区名（用于标签）── */
  var LOCAL_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "本机时区";

  /* ── ① 时间戳 → 时间 ── */
  // 自动识别：>=13 位判毫秒；<=10 位判秒；11-12 位沿用当前单位
  function smartUnit(raw){
    var neg = raw.charAt(0)==="-";
    var len = raw.replace("-","").length;
    if(len>=13) return "ms";
    if(len<=10) return "s";
    return unit;
  }
  function renderTs(){
    var raw=($("tsIn").value||"").trim();
    var out=$("tsOut"), warn=$("tsWarn"), hint=$("detectHint");
    warn.textContent=""; hint.textContent="";
    if(!raw){ out.innerHTML='<div class="empty">输入时间戳后自动换算</div>'; return; }
    if(!/^-?\d+$/.test(raw)){ warn.textContent="时间戳只能是整数数字"; out.innerHTML='<div class="empty">—</div>'; return; }

    var u=smartUnit(raw), num=parseInt(raw,10), ms=(u==="ms"?num:num*1000);
    var d=new Date(ms);
    if(!isValid(d)){ warn.textContent="无法识别的时间戳"; out.innerHTML='<div class="empty">—</div>'; return; }

    hint.textContent = "已识别为"+(u==="ms"?"毫秒":"秒");
    var rows=[
      [LOCAL_TZ, fmtLocal(d)+" "+weekday(d), true],
      ["北京时间", fmtTZ(d,"Asia/Shanghai"), true],
      ["UTC", fmtTZ(d,"UTC"), false],
      ["ISO 8601", d.toISOString(), false],
      ["距今", human(Math.floor(ms/1000)), false]
    ];
    buildRows(out, rows);
  }

  /* ── ② 时间 → 时间戳 ── */
  function renderDt(){
    var raw=$("dtIn").value, out=$("dtOut"), warn=$("dtWarn");
    if(!raw){ out.innerHTML='<div class="empty">选择日期时间后自动换算</div>'; warn.textContent=""; return; }
    var d=new Date(raw);
    if(!isValid(d)){ warn.textContent="不是有效的日期时间"; out.innerHTML='<div class="empty">—</div>'; return; }
    warn.textContent="";
    var sec=Math.floor(d.getTime()/1000), ms=d.getTime();
    var rows = unit==="s"
      ? [["秒 (s)", String(sec), true], ["毫秒 (ms)", String(ms), false]]
      : [["毫秒 (ms)", String(ms), true], ["秒 (s)", String(sec), false]];
    rows.push(["北京时间", fmtTZ(d,"Asia/Shanghai"), false]);
    buildRows(out, rows);
  }

  /* ── 渲染结果行（带复制按钮）── */
  function buildRows(container, rows){
    container.innerHTML="";
    rows.forEach(function(r){
      var row=document.createElement("div"); row.className="row";
      var k=document.createElement("div"); k.className="row-k"; k.textContent=r[0];
      var v=document.createElement("div"); v.className="row-v"+(r[2]?"":" muted"); v.textContent=r[1];
      var c=document.createElement("button"); c.className="cp"; c.type="button"; c.textContent="复制";
      c.onclick=function(){ copy(r[1], c); };
      row.appendChild(k); row.appendChild(v); row.appendChild(c);
      container.appendChild(row);
    });
  }

  /* ── 初始化 ── */
  $("tsIn").addEventListener("input", renderTs);
  $("dtIn").addEventListener("input", renderDt);
  $("dtIn").addEventListener("change", renderDt);

  // 日期输入默认填充当前时间
  (function initDt(){
    var d=new Date();
    $("dtIn").value = d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+
                      "T"+pad(d.getHours())+":"+pad(d.getMinutes())+":"+pad(d.getSeconds());
  })();

  $("tzHint").textContent = "按 "+LOCAL_TZ+" 解析";

  tickNow();
  setInterval(tickNow, 200);   // 秒级够用，毫秒跟随刷新
  renderDt();

  // 支持 URL 传入：?ts=1761129600
  var q=new URLSearchParams(location.search).get("ts");
  if(q && /^-?\d+$/.test(q)){ $("tsIn").value=q; renderTs(); }
})();
