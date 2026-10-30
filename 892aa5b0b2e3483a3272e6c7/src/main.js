import {sql} from './db.js';
import {preview} from './ui.js';
import {layout} from './layout.js';
import {roles as SPEAKERS,examples as EXAMPLES,decode,fortuneLines as FORTUNES} from './content.js';
document.title='1024 码农急救包 · Programmer First-Aid Kit';
document.getElementById('app').innerHTML=(preview?'<div class="preview-notice">示例体验 · 数据仅保留在本页 <button id="reset-example">恢复示例</button></div>':'')+layout;

(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };

  /* ═══════════ 导航高亮 ═══════════ */
  var links = document.querySelectorAll("nav a[data-nav]");
  var secs = [];
  links.forEach(function(a){ secs.push($(a.getAttribute("href").slice(1))); });
  var obs = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        links.forEach(function(a){ a.classList.remove("on"); });
        var i = secs.indexOf(e.target);
        if(i >= 0) links[i].classList.add("on");
      }
    });
  }, {rootMargin:"-40% 0px -55% 0px"});
  secs.forEach(function(s){ if(s) obs.observe(s); });

  /* ═══════════ 01 黑话翻译器 ═══════════ */
  var speaker = SPEAKERS[0];

  // 渲染人群 chips
  var chipBox = $("speakerChips");
  SPEAKERS.forEach(function(s){
    var c = document.createElement("span");
    c.className = "chip" + (s === speaker ? " on" : "");
    c.textContent = s;c.tabIndex=0;c.setAttribute("role","button");c.setAttribute("aria-pressed",String(s===speaker));
    c.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();c.click()}};
    c.onclick = function(){
      speaker = s;
      chipBox.querySelectorAll(".chip").forEach(function(x){ x.classList.remove("on");x.setAttribute("aria-pressed","false"); });
      c.classList.add("on");c.setAttribute("aria-pressed","true");
    };
    chipBox.appendChild(c);
  });

  var typeTimer = null;
  function typeOut(el, text){
    if(typeTimer) clearInterval(typeTimer);
    el.innerHTML = '<span class="cursor"></span>';
    var i = 0;
    typeTimer = setInterval(function(){
      i += 2;
      el.innerHTML = escapeHtml(text.slice(0, i)) + '<span class="cursor"></span>';
      if(i >= text.length){ clearInterval(typeTimer); typeTimer = null; }
    }, 26);
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function translate(){
    var raw = $("jInput").value.trim();
    if(!raw){ toast("先粘贴一句对方的黑话"); return; }
    var result = decode(speaker,raw);
    var out = result.text, rx = result.prescription;
    $("rxTag").textContent = speaker + " 发言 · 诊断书";
    $("rxQuote").textContent = raw;
    $("rxBox").classList.add("show");
    $("rxRx").textContent = rx;
    typeOut($("rxOut"), out);
  }

  $("btnTrans").onclick = translate;
  $("jInput").addEventListener("keydown", function(e){
    if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); translate(); }
  });
  $("btnRand").onclick = function(){
    var pool = EXAMPLES[speaker];
    $("jInput").value = pool[Math.floor(Math.random()*pool.length)];
    translate();
  };
  $("btnCopy").onclick = function(){
    var t = "【" + speaker + "黑话翻译】原话：" + $("rxQuote").textContent + "\n人话：" + $("rxOut").textContent + "\n处方签：" + $("rxRx").textContent;
    copyText(t, "翻译结果已复制，拿去用");
  };

  /* ═══════════ 02 续命许可证 ═══════════ */
  var DURS = [
    {label:"15 分钟", mins:15}, {label:"30 分钟", mins:30},
    {label:"1 小时", mins:60}, {label:"半天", mins:240}
  ];
  var dur = DURS[1];
  var durBox = $("durChips");
  DURS.forEach(function(d){
    var c = document.createElement("span");
    c.className = "chip" + (d === dur ? " on" : "");
    c.textContent = d.label;c.tabIndex=0;c.setAttribute("role","button");c.setAttribute("aria-pressed",String(d===dur));
    c.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();c.click()}};
    c.onclick = function(){
      dur = d;
      durBox.querySelectorAll(".chip").forEach(function(x){ x.classList.remove("on");x.setAttribute("aria-pressed","false"); });
      c.classList.add("on");c.setAttribute("aria-pressed","true");
    };
    durBox.appendChild(c);
  });

  var cv = $("licCanvas"), ctx = cv.getContext("2d");
  var lastLicense = null;
  function pad(n){ return n < 10 ? "0"+n : ""+n; }
  function fmt(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+" "+pad(d.getHours())+":"+pad(d.getMinutes()); }

  function roundRect(x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  function drawLicense(name, workId, mins){
    var W = cv.width, H = cv.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = "#fdf8ee"; ctx.fillRect(0,0,W,H);
    // 纸纹
    ctx.fillStyle = "rgba(180,160,120,.05)";
    for(var y=0; y<H; y+=7) ctx.fillRect(0, y, W, 1);
    // 外框
    ctx.strokeStyle = "#b52a1c"; ctx.lineWidth = 6; ctx.strokeRect(16,16,W-32,H-32);
    ctx.strokeStyle = "#b52a1c"; ctx.lineWidth = 2; ctx.strokeRect(28,28,W-56,H-56);
    // 头部红带
    ctx.fillStyle = "#b52a1c"; ctx.fillRect(28,28,W-56,86);
    ctx.fillStyle = "#f6c945"; ctx.font = "700 40px " + "system-ui,'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.textAlign = "center"; ctx.fillText("续  命  许  可  证", W/2, 84);
    // 副标
    ctx.fillStyle = "#8a7a5e"; ctx.font = "13px ui-monospace,Consolas,monospace";
    ctx.fillText("M O Y U   L I C E N S E   ·   码 农 急 救 包 急 诊 科 签 发", W/2, 140);
    // 字段
    var rows = [
      ["持 证 人", name || "（未填写）"],
      ["工    号", workId || "—"],
      ["许可时长", durLabel(mins)],
      ["许可证编号", "FA-2026-" + String(Math.floor(Math.random()*9000)+1000)],
      ["签发时间", fmt(new Date())],
      ["生效区间", fmt(new Date()) + "  ~  " + fmt(new Date(Date.now()+mins*6e4))]
    ];
    ctx.textAlign = "left";
    var y = 196;
    rows.forEach(function(r){
      ctx.fillStyle = "#8a7a5e"; ctx.font = "600 17px system-ui,'PingFang SC',sans-serif";
      ctx.fillText(r[0], 70, y);
      ctx.fillStyle = "#2a2418"; ctx.font = "17px ui-monospace,Consolas,'PingFang SC',sans-serif";
      ctx.fillText(String(r[1]), 210, y);
      ctx.strokeStyle = "rgba(160,140,100,.35)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(70, y+14); ctx.lineTo(W-70, y+14); ctx.stroke();
      y += 52;
    });
    // 公章
    var cx = W-190, cy = H-150, R = 78;
    ctx.save();
    ctx.strokeStyle = "rgba(192,21,31,.85)"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, R-9, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = "rgba(192,21,31,.85)";
    ctx.font = "700 15px system-ui,'PingFang SC',sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("码农急救包", cx, cy-12);
    ctx.fillText("急诊科", cx, cy+14);
    ctx.font = "700 12px system-ui,'PingFang SC',sans-serif";
    ctx.fillText("认证专用章", cx, cy+40);
    // 五角星
    drawStar(cx, cy-52, 12, 5);
    ctx.restore();
    // 底部注释
    ctx.fillStyle = "#8a7a5e"; ctx.font = "13px system-ui,'PingFang SC',sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("※ 本许可证仅供娱乐，最终解释权归急诊科所有；摸鱼有度，慎防猝…… 慎防头发离家出走。", 70, H-58);
    ctx.fillText("※ 请于有效期内使用，逾期作废；被抓包时请冷静出示，并配合完成手头工作。", 70, H-36);
    lastLicense = {name:name, mins:mins};
    $("btnSave").disabled = preview;
  }
  function durLabel(mins){
    if(mins >= 240) return "半天（4 小时）";
    if(mins >= 60) return mins/60 + " 小时";
    return mins + " 分钟";
  }
  function drawStar(cx, cy, r, n){
    ctx.beginPath();
    for(var i = 0; i < n*2; i++){
      var rr = i % 2 === 0 ? r : r*0.42;
      var a = -Math.PI/2 + i*Math.PI/n;
      var x = cx + Math.cos(a)*rr, y = cy + Math.sin(a)*rr;
      i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.closePath(); ctx.fill();
  }
  $("btnSign").onclick = function(){
    var name = $("licName").value.trim();
    if(!name){ toast("持证人不能为空，否则不予签发"); $("licName").focus(); return; }
    drawLicense(name, $("licId").value.trim(), dur.mins);
    toast("许可证已签发，可保存为图片");
  };
  $("btnSave").onclick = function(){
    if(preview || !lastLicense) return;
    var a = document.createElement("a");
    a.download = "续命许可证-" + (lastLicense.name || "码农").replace(/[\\/:*?"<>|]/g, "") + ".png";
    a.href = cv.toDataURL("image/png");
    a.click();
    toast("PNG已生成，已请求浏览器保存");
  };
  // 初始画一张空模板
  drawLicense("示例：摸鱼侠", "FA-1024", 30);

  /* ═══════════ 03 Bug 退散符 ═══════════ */
  var prayN = 0;
  var counterReady = preview;
  var counterQueue = Promise.resolve();
  $("prayN").textContent = preview ? prayN : "加载中";
  if (!preview) sql('SELECT count FROM fortune_counter WHERE id = 1').then(function(rows){
    if (!rows.length) throw Error('计数数据尚未初始化');
    prayN = Number(rows[0].count); counterReady = true; $("prayN").textContent = prayN;
  }).catch(function(){ $("prayN").textContent = "不可用"; toast('计数加载失败，请刷新后重试'); });

  function shakeOnce(){
    if (!counterReady) { toast("计数尚未就绪，请刷新后重试"); return; }
    var t = $("talisman");
    t.classList.remove("shake"); void t.offsetWidth; t.classList.add("shake");
    var f = FORTUNES[Math.floor(Math.random()*FORTUNES.length)];
    $("fortune").textContent = f;
    prayN++;
    $("prayN").textContent = prayN;
    if (!preview) counterQueue = counterQueue.then(function(){
      if (!counterReady) return;
      return sql('UPDATE fortune_counter SET count = count + 1 WHERE id = 1');
    }).catch(function(){ counterReady = false; $("prayN").textContent = "待核对"; toast('计数保存结果未确认，请刷新核对'); });
    // 撒点符文粒子
    var r = t.getBoundingClientRect();
    for(var i = 0; i < 8; i++){
      var s = document.createElement("span");
      s.className = "fx"; s.textContent = ["✚","辟","镇","急","律","令"][i % 6];
      s.style.left = (r.left + r.width/2 + (Math.random()-0.5)*r.width*0.8) + "px";
      s.style.top = (r.top + r.height*0.3) + "px";
      s.style.color = i % 2 ? "#f6c945" : "#e03e2d";
      s.style.animationDelay = (Math.random()*0.25) + "s";
      document.body.appendChild(s);
      setTimeout(function(el){ return function(){ el.remove(); }; }(s), 1300);
    }
  }
  var massTimers = new Set();
  $("talisman").onclick = shakeOnce;
  $("prayPaper").onkeydown = function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();$("prayPaper").click()}};
  $("btnMass").onclick = function(){
    var i = 0;
    var iv = setInterval(function(){
      shakeOnce();
      if(++i >= 10){ clearInterval(iv);massTimers.delete(iv);toast("十连抽毕，玄学配额已用尽，回去干活吧"); }
    }, 420);
    massTimers.add(iv);
  };

  /* ═══════════ 彩蛋：1024 ═══════════ */
  var buf = "";
  document.addEventListener("keydown", function(e){
    if(e.key && e.key.length === 1) buf = (buf + e.key).slice(-4);
    if(buf === "1024"){
      buf = "";
      $("glitch").classList.remove("on"); void $("glitch").offsetWidth; $("glitch").classList.add("on");
      toast("🎉 急救包已启动！Bug 退散，需求冻结，永不熬夜！");
      confetti();
    }
  });

  /* ═══════════ 通用小工具 ═══════════ */
  var toastTimer = null;
  function toast(msg){
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("on");
    if(toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ t.classList.remove("on"); }, 2600);
  }
  function copyText(text, okMsg){
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){ toast(okMsg); }, function(){ fallbackCopy(text, okMsg); });
    } else fallbackCopy(text, okMsg);
  }
  function fallbackCopy(text, okMsg){
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta); ta.select();
    try{ if(document.execCommand("copy"))toast(okMsg);else toast("复制失败，请手动选择文本"); }catch(e){ toast("复制失败，请手动选择文本"); }
    ta.remove();
  }

  // 彩带
  var fx = $("fxCanvas"), fxc = fx.getContext("2d"), parts = [], raf = null;
  function sizeFx(){ fx.width = innerWidth; fx.height = innerHeight; }
  sizeFx(); addEventListener("resize", sizeFx);
  function confetti(){
    var colors = ["#e03e2d","#f6c945","#7bc96f","#f2e9db"];
    for(var i = 0; i < 120; i++){
      parts.push({
        x: Math.random()*fx.width, y: -20 - Math.random()*fx.height*0.4,
        vx: (Math.random()-0.5)*2.4, vy: 2.2 + Math.random()*3.4,
        w: 5+Math.random()*6, h: 8+Math.random()*8,
        c: colors[i % colors.length], rot: Math.random()*Math.PI, vr: (Math.random()-0.5)*0.3
      });
    }
    if(!raf) raf = requestAnimationFrame(fxLoop);
  }
  function fxLoop(){
    fxc.clearRect(0,0,fx.width,fx.height);
    parts = parts.filter(function(p){ return p.y < fx.height + 40; });
    parts.forEach(function(p){
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy += 0.03;
      fxc.save(); fxc.translate(p.x, p.y); fxc.rotate(p.rot);
      fxc.fillStyle = p.c; fxc.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      fxc.restore();
    });
    if(parts.length){ raf = requestAnimationFrame(fxLoop); }
    else { fxc.clearRect(0,0,fx.width,fx.height); raf = null; }
  }

  if(preview){
    $("btnSave").disabled=true;
    $("btnSave").title="完整应用可保存PNG图片";
    $("btnSave").closest(".row").nextElementSibling.textContent="示例体验中可签发和查看；安装后可保存PNG图片。";
    $("reset-example").onclick=function(){
      if(typeTimer){clearInterval(typeTimer);typeTimer=null}
      massTimers.forEach(function(iv){clearInterval(iv)});massTimers.clear();
      speaker=SPEAKERS[0];
      chipBox.querySelectorAll(".chip").forEach(function(c){c.classList.toggle("on",c.textContent===speaker);c.setAttribute("aria-pressed",String(c.textContent===speaker))});
      $("jInput").value="";$("rxBox").classList.remove("show");$("rxTag").textContent="诊断书";
      $("rxQuote").textContent="";$("rxOut").textContent="";$("rxRx").textContent="";
      dur=DURS[1];durBox.querySelectorAll(".chip").forEach(function(c){c.classList.toggle("on",c.textContent===dur.label);c.setAttribute("aria-pressed",String(c.textContent===dur.label))});
      $("licName").value="";$("licId").value="";drawLicense("示例：摸鱼侠","FA-1024",30);
      prayN=0;$("prayN").textContent="0";$("fortune").textContent="点击符纸，摇一支签……";
      $("talisman").classList.remove("shake");$("glitch").classList.remove("on");buf="";
      document.querySelectorAll(".fx").forEach(function(el){el.remove()});
      parts=[];if(raf){cancelAnimationFrame(raf);raf=null}fxc.clearRect(0,0,fx.width,fx.height);
      if(toastTimer){clearTimeout(toastTimer);toastTimer=null}$("toast").classList.remove("on");$("toast").textContent="";
    };
  }
})();
