
(function(){
"use strict";
var BUILD_DB = "builds";
var TASK_DB  = "tasks";
var STAGES   = ["待下载","已下载","已上传","升级中","验证通过"];
var HAS_SDK  = !!(window.__SMART_PAGE__ && window.__SMART_PAGE__.database);
var db = HAS_SDK ? window.__SMART_PAGE__.database : null;
var B_OPTS = {}, T_OPTS = {};          /* fieldName -> [{text,id}] */
var bRows = [], tRows = [];            /* 已加载缓存 */
var bCursor = null, tCursor = null, bHasMore = false, tHasMore = false;
var lastScript = "";

function $(s, root){ return (root||document).querySelector(s); }
function escapeHtml(v){ return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function txt(v){ return v==null?"":String(v); }
function fmtDate(v){ if(!v) return "–"; var m=/^(\d{4}-\d{2}-\d{2})/.exec(String(v)); return m?m[1]:String(v); }
function todayStr(){ var d=new Date(),p=function(n){return (n<10?"0":"")+n}; return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate()); }
function nowStamp(){ var d=new Date(),p=function(n){return (n<10?"0":"")+n};
  return fmtDate(todayStr())+" "+p(d.getHours())+":"+p(d.getMinutes()); }
var toastTimer=null;
function toast(msg){ var t=$("#toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(function(){t.classList.remove("show")},2600); }
function urlVal(v){ return (v && typeof v==="object") ? (v.link||v.text||"") : (v||""); }
function urlText(v){ return (v && typeof v==="object") ? (v.text||v.link||"") : (v||""); }
function stageId(map,name){ var a=map["升级阶段"]||[]; for(var i=0;i<a.length;i++){ if(a[i].text===name) return a[i].id; } return name; }

/* ───────── 标签选择 ───────── */
function renderSel(sel, opts, placeholder){
  var cur = sel.value;
  var ph=document.createElement("option"); ph.value=""; ph.textContent=placeholder||"请选择"; sel.appendChild(ph);
  (opts||[]).forEach(function(o){
    var el=document.createElement("option"); el.value=o.id; el.textContent=o.text; sel.appendChild(el);
  });
  if(cur){ for(var i=0;i<sel.options.length;i++){ if(sel.options[i].value===cur){ sel.value=cur; break; } } }
}

/* ───────── 表单本地缓存（DSDK008）───────── */
function cacheKey(formId){ return "sp_cache_"+location.pathname+"::"+formId; }
function bindFormCache(form, formId){
  var fields = Array.prototype.filter.call(form.querySelectorAll("[name]"), function(el){
    return !el.hasAttribute("data-no-cache") && !/(密码|身份证|secret|token|key)/i.test(el.name||"");
  });
  function save(){ try{
    var d={}; fields.forEach(function(el){ d[el.name]= (el.type==="date")?el.value:el.value; });
    localStorage.setItem(cacheKey(formId), JSON.stringify(d));
  }catch(e){} }
  var tm=null;
  fields.forEach(function(el){
    var h=function(){ clearTimeout(tm); tm=setTimeout(save,300); };
    el.addEventListener("input",h); el.addEventListener("change",h);
  });
  return {
    refill: function(){ try{
      var raw=localStorage.getItem(cacheKey(formId)); if(!raw) return;
      var d=JSON.parse(raw);
      fields.forEach(function(el){ if(d[el.name]!=null && d[el.name]!=="") el.value=d[el.name]; });
    }catch(e){} },
    clear: function(){ try{ localStorage.removeItem(cacheKey(formId)); }catch(e){} }
  };
}

/* ───────── KPI ───────── */
function loadKPI(){
  if(!HAS_SDK) return;
  var today=todayStr();
  db.aggregate({ databaseId:"builds", aggregates:[
    { name:"total", type:"count" },
    { name:"today", type:"count", filter:{ property:{ property:"构建日期", date:{ equals:today } } } }
  ]}).then(function(r){ var m={}; (r.results||[]).forEach(function(x){ m[x.name]=x.value; });
    setK("kToday", m.today); setK("kTotal", m.total);
  }).catch(function(e){ console.error("[kpi] builds:", e); });
  db.aggregate({ databaseId:"tasks", aggregates:[
    { name:"bystage", type:"count", groupBy:"升级阶段" }
  ]}).then(function(r){ var g=[]; (r.results||[]).forEach(function(x){ if(x.name==="bystage") g=x.value||[]; });
    var m={}; g.forEach(function(it){ m[it.key]=it.count; });
    var doing=0; STAGES.slice(0,4).forEach(function(s){ doing += (m[s]||0); });
    setK("kDoing", doing); setK("kPassed", m["验证通过"]||0);
  }).catch(function(e){ console.error("[kpi] tasks:", e); });
}
function setK(id,v){ var el=document.getElementById(id); if(el) el.textContent = (v==null? 0 : v); }

/* ───────── 每日构建：分页加载 + 渲染 ───────── */
function loadBuilds(reset){
  if(!HAS_SDK) return;
  if(reset){ bCursor=null; bRows=[]; }
  db.query({ databaseId:"builds", sorts:[{ property:"构建日期", direction:"descending" }],
    pageSize:50, startCursor:bCursor })
  .then(function(r){
    bRows = bRows.concat(r.results||[]);
    bCursor = r.nextCursor; bHasMore = !!r.hasMore;
    renderBuilds();
  }).catch(function(e){ console.error("[builds] 加载失败:", e); toast("构建列表加载失败，请稍后刷新重试"); });
}
function findBuild(ver){ ver=txt(ver); for(var i=0;i<bRows.length;i++){ if(txt(bRows[i]["版本号"])===ver) return bRows[i]; } return null; }
function chipClsDl(s){ return s==="已下载"?"chip-ok":(s==="已废弃"?"chip-off":"chip-wait"); }
/* DOM 构建辅助：所有用户数据一律走 textContent，杜绝 XSS */
function el(tag, cls, text){ var e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=String(text); return e; }
function clearKids(e){ while(e.firstChild) e.removeChild(e.firstChild); }
function mkBtn(label, cls, act, id){
  var b=el("button", cls, label); b.type="button";
  b.setAttribute("data-act", act); b.setAttribute("data-id", id);
  return b;
}
function metaItem(label, valueNode){
  var s=el("span"); s.appendChild(el("u", null, label)); s.appendChild(valueNode); return s;
}
function renderBuilds(){
  var box=$("#bList");
  $("#bMoreW").style.display = bHasMore ? "" : "none";
  clearKids(box);
  if(!bRows.length){ $("#bEmpty").style.display=""; return; }
  $("#bEmpty").style.display="none";
  bRows.forEach(function(r){
    var dl=txt(r["下载状态"])||"待下载";
    var res=txt(r["构建结果"]);
    var art=urlVal(r["制品地址"]);
    var card=el("div","bcard");
    var head=el("div","bc-head");
    head.appendChild(el("span","chip chip-info", txt(r["产品名称"])||"未命名产品"));
    head.appendChild(el("b","ver b-version","v"+(txt(r["版本号"])||"?")));
    var no=el("span","b-no", txt(r["构建号"])||"");
    no.style.cssText="font-size:12px;color:var(--ink3);font-family:var(--mono)"; head.appendChild(no);
    if(res) head.appendChild(el("span","chip b-result "+(res==="成功"?"chip-ok":"chip-bad"), res));
    head.appendChild(el("span","chip b-dl "+chipClsDl(dl), dl));
    var dt=el("span","b-date", fmtDate(r["构建日期"]));
    dt.style.cssText="margin-left:auto;font-size:12px;color:var(--ink3)"; head.appendChild(dt);
    card.appendChild(head);
    var meta=el("div","bc-meta");
    var m1=el("span"); m1.appendChild(el("u",null,"制品："));
    if(art){
      var a=document.createElement("a"); a.className="b-url";
      a.href=/^https?:\/\//i.test(art) ? art : "#"; a.target="_blank"; a.rel="noopener"; a.textContent="下载直链 ↗";
      m1.appendChild(a);
    }else{
      m1.appendChild(el("span","b-url","未填写"));
    }
    meta.appendChild(m1);
    meta.appendChild(metaItem("大小：", el("span","b-size", txt(r["文件大小"])||"–")));
    var md=el("span","b-md5", txt(r["MD5校验值"])||"–"); md.style.fontFamily="var(--mono)";
    meta.appendChild(metaItem("MD5：", md));
    card.appendChild(meta);
    if(txt(r["变更说明"])) card.appendChild(el("div","bc-note b-note", r["变更说明"]));
    var act=el("div","bc-act");
    if(dl==="待下载") act.appendChild(mkBtn("⬇ 标记已下载","btn btn-sm","bDl",r._id));
    if(dl==="已下载") act.appendChild(mkBtn("↩ 改回待下载","btn btn-sm","bWait",r._id));
    act.appendChild(mkBtn("🚀 发起现场升级","btn btn-sm btn-grn","bGo",r._id));
    card.appendChild(act);
    box.appendChild(card);
  });
}

/* ───────── 升级任务：分页加载 + 渲染 ───────── */
function loadTasks(reset){
  if(!HAS_SDK) return;
  if(reset){ tCursor=null; tRows=[]; }
  db.query({ databaseId:"tasks", sorts:[{ property:"计划日期", direction:"descending" }],
    pageSize:50, startCursor:tCursor })
  .then(function(r){
    tRows = tRows.concat(r.results||[]);
    tCursor = r.nextCursor; tHasMore = !!r.hasMore;
    renderTasks();
  }).catch(function(e){ console.error("[tasks] 加载失败:", e); toast("任务列表加载失败，请稍后刷新重试"); });
}
function renderTasks(){
  var box=$("#tList");
  $("#tMoreW").style.display = tHasMore ? "" : "none";
  clearKids(box);
  if(!tRows.length){ $("#tEmpty").style.display=""; return; }
  $("#tEmpty").style.display="none";
  tRows.forEach(function(r){
    var st=txt(r["升级阶段"])||"待下载";
    var idx=STAGES.indexOf(st); var rolled=(st==="已回滚");
    var env=txt(r["环境类型"]);
    var envCls = env==="生产"?"chip-prod":(env==="预生产"?"chip-pre":"chip-info");
    var done = (st==="验证通过"||rolled);
    var ch=txt(r["交付通道"]);
    var card=el("div","tcard");
    var head=el("div","tc-head");
    head.appendChild(el("b","nm t-name", txt(r["任务名称"])||"未命名任务"));
    if(env) head.appendChild(el("span","chip t-env "+envCls, env));
    head.appendChild(el("span","chip t-stage "+(done?"chip-ok":(rolled?"chip-bad":"chip-wait")), st));
    var plan=el("span",null,"计划 "); plan.appendChild(el("span","t-date", fmtDate(r["计划日期"])));
    plan.style.cssText="margin-left:auto;font-size:12px;color:var(--ink3)"; head.appendChild(plan);
    card.appendChild(head);
    var pipe=el("div","pipe");
    if(rolled){
      pipe.appendChild(el("span","chip chip-bad","⛔ 已回滚（回退到升级前版本，可新建任务重试）"));
    }else{
      STAGES.forEach(function(s,i){
        var ps=el("div","pstep "+(i<idx?"done":(i===idx?"now":"")));
        ps.appendChild(el("i")); ps.appendChild(el("b",null,s));
        pipe.appendChild(ps);
      });
    }
    card.appendChild(pipe);
    var meta=el("div","tc-meta");
    meta.appendChild(metaItem("现场：", el("span","t-site", txt(r["现场名称"])||"–")));
    meta.appendChild(metaItem("主机：", el("span","t-host mono", txt(r["管理地址"])||"–")));
    meta.appendChild(metaItem("通道：", el("span","t-channel", ch||"–")));
    var vspan=el("span"); vspan.appendChild(el("u",null,"版本："));
    vspan.appendChild(el("span","t-from mono", txt(r["当前版本"])||"–"));
    vspan.appendChild(document.createTextNode(" → "));
    vspan.appendChild(el("span","t-to mono", txt(r["目标版本"])||"–"));
    meta.appendChild(vspan);
    meta.appendChild(metaItem("负责人：", el("span","t-owner", txt(r["负责人"])||"–")));
    card.appendChild(meta);
    if(txt(r["执行日志"])){
      card.appendChild(el("pre","tc-log t-log", r["执行日志"]));
      var logw=el("div"); logw.style.marginTop="6px";
      logw.appendChild(mkBtn("▾ 展开/收起日志","btn btn-sm","tLogToggle",r._id));
      card.appendChild(logw);
    }
    var act=el("div","tc-act");
    if(!done){
      act.appendChild(mkBtn("▶ 推进到「"+nextStage(st)+"」","btn btn-sm btn-grn","tNext",r._id));
      act.appendChild(mkBtn("⟲ 标记回滚","btn btn-sm btn-dgr","tRoll",r._id));
    }
    act.appendChild(mkBtn("🛠 生成交付脚本","btn btn-sm","tScript",r._id));
    act.appendChild(mkBtn("📝 记录日志","btn btn-sm","tLog",r._id));
    card.appendChild(act);
    box.appendChild(card);
  });
}
function nextStage(s){ var i=STAGES.indexOf(s); return (i>=0&&i<STAGES.length-1)?STAGES[i+1]:""; }
function taskById(id){ for(var i=0;i<tRows.length;i++){ if(tRows[i]._id===id) return tRows[i]; } return null; }
function buildById(id){ for(var i=0;i<bRows.length;i++){ if(bRows[i]._id===id) return bRows[i]; } return null; }

/* ───────── 交付脚本生成 ───────── */
function genScript(t){
  var ver=txt(t["目标版本"])||"<目标版本>";
  var b=findBuild(ver);
  var art=b?urlVal(b["制品地址"]):"";
  var md5=b?txt(b["MD5校验值"]):"";
  var size=b?txt(b["文件大小"]):"";
  var ch=txt(t["交付通道"])||"直连";
  var host=txt(t["管理地址"])||"<现场管理IP>";
  var user=txt(t["SSH用户名"])||"<SSH用户>";
  var site=txt(t["现场名称"])||"<现场名称>";
  var env=txt(t["环境类型"])||"";
  var cur=txt(t["当前版本"])||"<当前版本>";
  var pkg=art?String(art).split("?")[0].split("/").pop():"dailybuild-"+ver+".tar.gz";
  var remoteDir="/tmp/dailybuild";
  var appDir="/opt/app";
  var scpOpts="";
  var uploadCmd;
  if(ch==="堡垒机跳板"){
    scpOpts='-o ProxyJump=<跳板机用户>@<跳板机IP>:<端口>';
  }
  if(ch==="离线拷贝"){
    uploadCmd=[
      '# 【离线拷贝通道】制品经人工/介质带入现场，按以下步骤操作：',
      '# 1) 在有网机器：rsync -avP "$WORK_DIR/$PKG_NAME" /mnt/usb/   # 拷贝至移动介质',
      '# 2) 介质带至现场后，在目标主机校验并归位：',
      'ssh "$SSH_USER@$HOST" "mkdir -p '+remoteDir+' && cp /media/usb0/'+pkg+' '+remoteDir+'/"',
      '# 3) 现场机器上重新执行 MD5 校验（见 STEP-3）'
    ].join("\n");
  }else{
    uploadCmd=[
      'echo ">>> [2/5] 上传制品到现场 '+ch+'"',
      'scp '+scpOpts+' "$WORK_DIR/$PKG_NAME" "$SSH_USER@$HOST:'+remoteDir+'/"',
      'echo "上传完成。"'
    ].join("\n");
  }
  var L=[];
  L.push('#!/usr/bin/env bash');
  L.push('# =============================================================');
  L.push('# DailyBuild 交付脚本 · 由「DailyBuild 交付前线」自动生成');
  L.push('# 生成时间: '+nowStamp());
  L.push('# 任务: '+(txt(t["任务名称"])||"-")+'   现场: '+site+(env?(" ("+env+")"):""));
  L.push('# 版本: '+cur+'  →  '+ver+'   通道: '+ch+(size?("   制品大小: "+size):""));
  L.push('# 安全约定: 全程 SSH 密钥认证，脚本中不出现任何密码/密钥明文。');
  L.push('# 注意: STEP-4/STEP-5 中的升级命令与健康检查地址为通用示例，');
  L.push('#       执行前请按现场实际（升级入口脚本、端口、回滚方式）替换。');
  L.push('# =============================================================');
  L.push('set -euo pipefail');
  L.push('');
  L.push('HOST="'+host+'"                 # 现场管理地址');
  L.push('SSH_USER="'+user+'"             # SSH 用户（密钥认证）');
  L.push('ARTIFACT_URL="'+(art||"<制品下载直链：请先在每日构建中登记")+'"');
  L.push('MD5_EXPECTED="'+(md5||"<未登记MD5，可留空跳过严格校验>")+'"');
  L.push('PKG_NAME="'+pkg+'"');
  L.push('WORK_DIR="/tmp/dailybuild/'+ver+'"');
  L.push('REMOTE_DIR="'+remoteDir+'"');
  L.push('APP_DIR="'+appDir+'"            # TODO: 现场应用目录');
  L.push('');
  L.push('rollback(){');
  L.push('  echo ""; echo "!!!!! 升级失败，执行回滚：恢复 '+cur+'" >&2');
  L.push('  # TODO: 按现场回滚方式替换，示例（符号链接回切）：');
  L.push('  # ssh '+scpOpts+' "$SSH_USER@$HOST" "cd $APP_DIR && rm -f current && ln -s releases/'+cur+' current"');
  L.push('  exit 1;');
  L.push('}');
  L.push('trap rollback ERR');
  L.push('');
  L.push('echo ">>> [1/5] 下载制品到本地中转区"');
  L.push('mkdir -p "$WORK_DIR"');
  L.push('curl -fL --retry 3 --connect-timeout 20 -o "$WORK_DIR/$PKG_NAME" "$ARTIFACT_URL"');
  L.push('');
  L.push('echo ">>> [2/5] 校验完整性（MD5）"');
  L.push('if [ -n "$MD5_EXPECTED" ] && [[ "$MD5_EXPECTED" != "<"* ]]; then');
  L.push('  echo "$MD5_EXPECTED  $WORK_DIR/$PKG_NAME" | md5sum -c -');
  L.push('  echo "MD5 校验通过。"');
  L.push('else');
  L.push('  echo "未登记 MD5，跳过严格校验（建议补录后重新生成脚本）。"');
  L.push('fi');
  L.push('');
  L.push('echo ">>> 准备上传（通道: '+ch+'）"');
  L.push(uploadCmd);
  L.push('');
  L.push('echo ">>> [3/5] 现场预检：磁盘空间 / 介质校验"');
  L.push('ssh '+scpOpts+' "$SSH_USER@$HOST" "set -e; df -h /opt | tail -1; AVAILABLE=\\$(df -BG --output=avail /opt | tail -1 | tr -dc 0-9); if [ \\$AVAILABLE -lt 10 ]; then echo \'/opt 剩余空间不足 10GB，终止升级\'; exit 1; fi; md5sum $REMOTE_DIR/$PKG_NAME"');
  L.push('');
  L.push('echo ">>> [4/5] 执行升级 '+cur+' → '+ver+'"');
  L.push('  # TODO: 现场如有专用升级入口脚本，请替换下面 ssh 一行为实际升级命令，示例：');
  L.push('  # ssh '+scpOpts+' "$SSH_USER@$HOST" "cd $APP_DIR/releases/'+ver+' && ./upgrade.sh --from '+cur+'"');
  L.push('ssh '+scpOpts+' "$SSH_USER@$HOST" "set -e; mkdir -p $APP_DIR/releases/'+ver+' && tar -xzf $REMOTE_DIR/$PKG_NAME -C $APP_DIR/releases/'+ver+' && cd $APP_DIR && rm -f current && ln -s releases/'+ver+' current"');
  L.push('');
  L.push('echo ">>> [5/5] 健康检查"');
  L.push('sleep 15');
  L.push("HTTP=$(curl -fsS -o /dev/null -w '%{http_code}' \"http://$HOST:<服务端口>/health\" || true)");
  L.push('if [ "$HTTP" != "200" ]; then echo "健康检查未通过（HTTP=$HTTP），触发回滚"; false; fi');
  L.push('echo ""');
  L.push('echo "============================================================="');
  L.push('echo " ✅ '+site+' 已升级至 '+ver+'，健康检查通过。"');
  L.push('echo " 请回到「DailyBuild 交付前线」把该任务推进到「验证通过」。"');
  L.push('echo "============================================================="');
  L.push('trap - ERR');
  return L.join("\n");
}

function openScriptModal(t){
  lastScript = genScript(t);
  var dlg=$("#dlg");
  dlg.innerHTML='<div class="dlg-h"><b id="dlgTitle"></b>'
    +'<button class="x" data-x type="button">✕</button></div>'
    +'<div class="dlg-b"><pre class="scr" id="scrBox"></pre></div>'
    +'<div class="dlg-f"><span class="sp"></span>'
      +'<button class="btn" data-dl type="button">⬇ 下载 .sh</button>'
      +'<button class="btn btn-grn" data-cp type="button">📋 复制脚本</button>'
    +'</div>';
  document.getElementById("dlgTitle").textContent='🛠 交付脚本 · '+(txt(t["任务名称"])||"");
  $("#scrBox").textContent=lastScript;
  $("#ov").classList.add("open");
}
function copyScript(){
  function ok(){ toast("脚本已复制到剪贴板"); }
  function fail(){
    try{
      var ta=document.createElement("textarea"); ta.value=lastScript;
      ta.style.position="fixed"; ta.style.opacity="0";
      document.body.appendChild(ta); ta.select();
      var done=document.execCommand("copy"); document.body.removeChild(ta);
      if(done){ ok(); } else { toast("复制失败，请手动选择脚本内容复制"); }
    }catch(e){ toast("复制失败，请手动选择脚本内容复制"); }
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(lastScript).then(ok, fail);
  }else{ fail(); }
}
function downloadScript(){
  try{
    var blob=new Blob([lastScript],{type:"text/x-shellscript"});
    var a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="dailybuild-delivery-"+Date.now()+".sh";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(a.href); },4000);
    toast("脚本已开始下载");
  }catch(e){ toast("下载失败，请复制脚本内容手动保存"); }
}
function openLogModal(t){
  var dlg=$("#dlg");
  dlg.innerHTML='<div class="dlg-h"><b id="dlgTitle"></b>'
    +'<button class="x" data-x type="button">✕</button></div>'
    +'<div class="dlg-b"><pre class="scr" id="logPrev" style="display:none;max-height:30vh"></pre>'
    +'<div id="logGap" style="display:none;height:12px"></div>'
    +'<textarea class="tam" id="logTa" placeholder="记录本阶段执行情况：如「制品已通过堡垒机上传，MD5 校验一致，开始升级」"></textarea></div>'
    +'<div class="dlg-f"><span class="sp"></span>'
      +'<button class="btn" data-x type="button">取消</button>'
      +'<button class="btn btn-grn" data-logsave type="button">追加并保存</button>'
    +'</div>';
  document.getElementById("dlgTitle").textContent='📝 执行日志 · '+(txt(t["任务名称"])||"");
  var prev=document.getElementById("logPrev");
  if(txt(t["执行日志"])){ prev.textContent=t["执行日志"]; prev.style.display=""; document.getElementById("logGap").style.display=""; }
  $("#ov").classList.add("open");
}

/* ───────── 弹层关闭 ───────── */
document.addEventListener("click", function(e){
  var t=e.target;
  if(t.hasAttribute && t.hasAttribute("data-x")){ $("#ov").classList.remove("open"); return; }
  if(t.id==="ov"){ $("#ov").classList.remove("open"); return; }
  if(t.hasAttribute && t.hasAttribute("data-cp")){ copyScript(); return; }
  if(t.hasAttribute && t.hasAttribute("data-dl")){ downloadScript(); return; }
  if(t.hasAttribute && t.hasAttribute("data-logsave")){
    var ta=$("#logTa"); if(!ta) return;
    var entry=ta.value.trim();
    if(!entry){ toast("请先填写日志内容"); return; }
    var task=$("#ov")._logTask;
    if(!task) return;
    var newVal=(txt(task["执行日志"])?txt(task["执行日志"])+"\n":"")+"["+nowStamp()+"] "+entry;
    if(!HAS_SDK){ toast("当前环境无数据服务，无法保存"); return; }
    db.updateRecord({ databaseId:"tasks", recordId:task._id, properties:{ "执行日志":{ text:newVal } } })
    .then(function(){ task["执行日志"]=newVal; $("#ov").classList.remove("open"); renderTasks(); toast("日志已保存"); })
    .catch(function(err){ console.error("[log] 保存失败:", err); toast("日志保存失败，请稍后重试"); });
  }
});

/* ───────── 卡片操作（事件委托）───────── */
document.addEventListener("click", function(e){
  var el=e.target.closest ? e.target.closest("[data-act]") : null;
  if(!el) return;
  var act=el.getAttribute("data-act"), id=el.getAttribute("data-id");
  if(act==="bDl"||act==="bWait"){
    if(!HAS_SDK){ toast("当前环境无数据服务"); return; }
    var v=act==="bDl"?"已下载":"待下载";
    db.updateRecord({ databaseId:"builds", recordId:id, properties:{ "下载状态":{ select:v } } })
    .then(function(){ toast("已更新下载状态："+v); loadKPI(); loadBuilds(true); })
    .catch(function(err){ console.error("[build] 状态更新失败:", err); toast("状态更新失败，请稍后重试"); });
    return;
  }
  if(act==="bGo"){
    var b=buildById(id); if(!b) return;
    switchTab("tasks");
    $("#tfCard").classList.add("open");
    var to=$("#tForm").querySelector('[name="t_to"]');
    if(to) to.value=txt(b["版本号"]);
    var nm=$("#tForm").querySelector('[name="t_name"]');
    if(nm && !nm.value) nm.placeholder='如：'+txt(b["产品名称"])+' '+txt(b["版本号"])+' 现场升级';
    toast("已带入目标版本 "+txt(b["版本号"])+"，请补全现场信息");
    window.scrollTo({top:0,behavior:"smooth"});
    return;
  }
  if(act==="tNext"||act==="tRoll"){
    if(!HAS_SDK){ toast("当前环境无数据服务"); return; }
    var tk=taskById(id); if(!tk) return;
    var ns = act==="tRoll" ? "已回滚" : nextStage(txt(tk["升级阶段"])||"待下载");
    if(!ns){ toast("当前阶段已是终态"); return; }
    db.updateRecord({ databaseId:"tasks", recordId:id, properties:{ "升级阶段":{ select:ns } } })
    .then(function(){
      var logline=(txt(tk["执行日志"])?txt(tk["执行日志"])+"\n":"")+"["+nowStamp()+"] 阶段推进 → "+ns;
      return db.updateRecord({ databaseId:"tasks", recordId:id, properties:{ "执行日志":{ text:logline } } });
    })
    .then(function(){ toast("已推进到「"+ns+"」"); loadKPI(); loadTasks(true); })
    .catch(function(err){ console.error("[task] 推进失败:", err); toast("阶段推进失败，请稍后重试"); });
    return;
  }
  if(act==="tScript"){
    var tk2=taskById(id); if(!tk2) return;
    if(!bRows.length && HAS_SDK){ toast("正在加载构建清单用于脚本生成…"); }
    // Fields interpolated into a shell template must be safe before generating it.
    var build = findBuild(txt(tk2["目标版本"]));
    var safeToken = /^[A-Za-z0-9][A-Za-z0-9_.-]*$/;
    var url = build ? urlVal(build["制品地址"]) : "";
    var filename = url ? String(url).split("?")[0].split("/").pop() : "";
    var atoms = [tk2["管理地址"], tk2["SSH用户名"], tk2["当前版本"], tk2["目标版本"], filename];
    var md5 = build ? txt(build["MD5校验值"]) : "";
    var comments = [tk2["任务名称"],tk2["现场名称"],tk2["环境类型"],build && txt(build["文件大小"])];
    if(atoms.some(function(v){return v && !safeToken.test(String(v));}) || (url && !/^https?:\/\/[A-Za-z0-9_.:%+\/=?&~-]+$/.test(url)) || (md5 && !/^[a-fA-F0-9]{32}$/.test(md5)) || comments.some(function(v){return v && /[\r\n`$"\\]/.test(String(v));})) { toast("脚本字段含不安全字符或 MD5 格式有误，请修改后生成"); return; }
    openScriptModal(tk2);
    return;
  }
  if(act==="tLog"){
    var tk3=taskById(id); if(!tk3) return;
    $("#ov")._logTask=tk3; openLogModal(tk3);
    return;
  }
  if(act==="tLogToggle"){
    var card=el.closest(".tcard"); if(!card) return;
    var lg=card.querySelector(".tc-log"); if(lg) lg.classList.toggle("show");
    return;
  }
});

/* ───────── Tabs ───────── */
function switchTab(v){
  var tabs=document.querySelectorAll(".tab");
  for(var i=0;i<tabs.length;i++){ tabs[i].classList.toggle("on", tabs[i].getAttribute("data-v")===v); }
  $("#secBuilds").classList.toggle("on", v==="builds");
  $("#secTasks").classList.toggle("on", v==="tasks");
}
document.addEventListener("click", function(e){
  var el=e.target.closest ? e.target.closest(".tab") : null;
  if(el) switchTab(el.getAttribute("data-v"));
});

/* ───────── 表单提交 ───────── */
var bCache, tCache;
function submitBuild(e){
  e.preventDefault();
  var f=$("#bForm");
  var g=function(n){ return f.querySelector('[name="'+n+'"]'); };
  if(!g("b_date").value){ toast("请选择构建日期"); return; }
  if(!g("b_product").value.trim()){ toast("请填写产品名称"); return; }
  if(!g("b_version").value.trim()){ toast("请填写版本号"); return; }
  var btn=f.querySelector('[type="submit"]'); if(btn){ btn.disabled=true; btn.textContent="保存中…"; }
  var props={
    "构建日期": { date: g("b_date").value },
    "产品名称": { text: g("b_product").value.trim() },
    "版本号":   { text: g("b_version").value.trim() },
    "构建号":   { text: g("b_no").value.trim() },
    "制品地址": { url: { text: g("b_url").value.trim(), link: g("b_url").value.trim() } },
    "文件大小": { text: g("b_size").value.trim() },
    "MD5校验值": { text: g("b_md5").value.trim() },
    "变更说明": { text: g("b_note").value.trim() }
  };
  var rv=g("b_result").value, dv=g("b_dl").value;
  if(rv) props["构建结果"]={ select:rv };
  if(dv) props["下载状态"]={ select:dv };
  db.addRecord({ databaseId:"builds", properties:props })
  .then(function(){ bCache.clear(); f.reset(); $("#bfCard").classList.remove("open");
    toast("构建记录已保存"); loadKPI(); loadBuilds(true); })
  .catch(function(err){ console.error("[build] 保存失败:", err); toast("保存失败，请稍后重试"); })
  .then(function(){ if(btn){ btn.disabled=false; btn.textContent="保存构建记录"; } });
}
function submitTask(e){
  e.preventDefault();
  var f=$("#tForm");
  var g=function(n){ return f.querySelector('[name="'+n+'"]'); };
  if(!g("t_name").value.trim()){ toast("请填写任务名称"); return; }
  if(!g("t_site").value.trim()){ toast("请填写现场名称"); return; }
  if(!g("t_host").value.trim()){ toast("请填写管理地址"); return; }
  if(!g("t_to").value.trim()){ toast("请填写目标版本"); return; }
  var btn=f.querySelector('[type="submit"]'); if(btn){ btn.disabled=true; btn.textContent="创建中…"; }
  var props={
    "任务名称": { text: g("t_name").value.trim() },
    "现场名称": { text: g("t_site").value.trim() },
    "管理地址": { text: g("t_host").value.trim() },
    "SSH用户名": { text: g("t_user").value.trim() },
    "当前版本": { text: g("t_from").value.trim() },
    "目标版本": { text: g("t_to").value.trim() },
    "负责人":   { text: g("t_owner").value.trim() },
    "升级阶段": { select: stageId(T_OPTS,"待下载") },
    "执行日志": { text: "["+nowStamp()+"] 任务创建，目标版本 "+g("t_to").value.trim() }
  };
  if(g("t_date").value) props["计划日期"]={ date:g("t_date").value };
  var ev=g("t_env").value, chv=g("t_channel").value;
  if(ev) props["环境类型"]={ select:ev };
  if(chv) props["交付通道"]={ select:chv };
  db.addRecord({ databaseId:"tasks", properties:props })
  .then(function(){ tCache.clear(); f.reset(); $("#tfCard").classList.remove("open");
    toast("升级任务已创建"); loadKPI(); loadTasks(true); })
  .catch(function(err){ console.error("[task] 创建失败:", err); toast("创建失败，请稍后重试"); })
  .then(function(){ if(btn){ btn.disabled=false; btn.textContent="创建升级任务"; } });
}

/* ───────── 初始化 ───────── */
function init(){
  $("#btnNewBuild").addEventListener("click", function(){ $("#bfCard").classList.toggle("open"); $("#tfCard").classList.remove("open"); });
  $("#btnNewTask").addEventListener("click", function(){ $("#tfCard").classList.toggle("open"); $("#bfCard").classList.remove("open"); });
  $("#bCancel").addEventListener("click", function(){ $("#bfCard").classList.remove("open"); });
  $("#tCancel").addEventListener("click", function(){ $("#tfCard").classList.remove("open"); });
  $("#bForm").addEventListener("submit", submitBuild);
  $("#tForm").addEventListener("submit", submitTask);
  $("#bMore").addEventListener("click", function(){ loadBuilds(false); });
  $("#tMore").addEventListener("click", function(){ loadTasks(false); });
  $("#btnRefresh").addEventListener("click", function(){ loadKPI(); loadBuilds(true); loadTasks(true); toast("已刷新"); });
  bCache=bindFormCache($("#bForm"),"bForm");
  tCache=bindFormCache($("#tForm"),"tForm");

  if(!HAS_SDK){
    $("#nosdk").style.display="block";
    $("#kToday").textContent="-"; $("#kTotal").textContent="-";
    $("#kDoing").textContent="-"; $("#kPassed").textContent="-";
    var eb=$("#bEmpty"); eb.style.display="";
    eb.querySelector("b").textContent="静态模式：数据服务未接入";
    var et=$("#tEmpty"); et.style.display="";
    et.querySelector("b").textContent="静态模式：数据服务未接入";
    return;
  }
  Promise.all([
    db.getSchema({ databaseId:"builds" }),
    db.getSchema({ databaseId:"tasks" })
  ]).then(function(rs){
    (rs[0].properties||[]).forEach(function(fld){
      if((fld.type==="select") && fld.config && fld.config.options) B_OPTS[fld.name]=fld.config.options;
    });
    (rs[1].properties||[]).forEach(function(fld){
      if((fld.type==="select") && fld.config && fld.config.options) T_OPTS[fld.name]=fld.config.options;
    });
    renderSel($("#bForm").querySelector('[name="b_result"]'), B_OPTS["构建结果"]);
    renderSel($("#bForm").querySelector('[name="b_dl"]'), B_OPTS["下载状态"], "默认：待下载");
    renderSel($("#tForm").querySelector('[name="t_env"]'), T_OPTS["环境类型"]);
    renderSel($("#tForm").querySelector('[name="t_channel"]'), T_OPTS["交付通道"]);
    bCache.refill(); tCache.refill();
    loadKPI(); loadBuilds(true); loadTasks(true);
    if(typeof db.onUpdated==="function"){
      var tm=null;
      db.onUpdated(function(payload){
        var ids=(payload&&payload.databaseIds)||[];
        if(ids.indexOf(BUILD_DB)===-1 && ids.indexOf(TASK_DB)===-1) return;
        clearTimeout(tm);
        tm=setTimeout(function(){ loadKPI(); if(ids.indexOf(BUILD_DB)>-1) loadBuilds(true); if(ids.indexOf(TASK_DB)>-1) loadTasks(true); },300);
      });
    }
  }).catch(function(err){ console.error("[init] schema 加载失败:", err); loadKPI(); loadBuilds(true); loadTasks(true); });
}
init();
})();
