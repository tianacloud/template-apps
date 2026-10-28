import css from "./style.css?inline";
const style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);
document.querySelector("#app").innerHTML = "\n<header>\n  <div class=\"wrap\" style=\"padding-bottom:0\">\n    <div class=\"head-row\">\n      <div class=\"logo\"><span class=\"mark\">🔖</span><span class=\"txt\">我的书签</span></div>\n      <div class=\"search\">\n        <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m21 21-4.3-4.3\"/></svg>\n        <input id=\"search\" placeholder=\"搜索名称、网址、标签…\" autocomplete=\"off\">\n      </div>\n      <button class=\"btn primary\" id=\"addBtn\">\n        <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"><path d=\"M12 5v14M5 12h14\"/></svg>\n        添加\n      </button>\n      <div class=\"menu-wrap\">\n        <button class=\"btn icon\" id=\"menuBtn\" title=\"更多\">⋯</button>\n        <div class=\"menu\" id=\"menu\">\n          <button id=\"exportBtn\">导出备份 (JSON)</button>\n          <button id=\"importBtn\">导入备份</button>\n          <div class=\"sep\"></div>\n          <button id=\"clearBtn\" style=\"color:var(--danger)\">清空全部</button>\n        </div>\n      </div>\n      <input type=\"file\" id=\"importFile\" accept=\"application/json\" style=\"display:none\">\n    </div>\n  </div>\n</header>\n\n<div class=\"wrap\">\n  <div class=\"quick\" id=\"quick\"></div>\n\n  <div class=\"toolbar\">\n    <select class=\"select\" id=\"groupBy\">\n      <option value=\"none\">不分组</option>\n      <option value=\"category\">按分类</option>\n      <option value=\"tags\">按标签</option>\n    </select>\n    <select class=\"select\" id=\"catFilter\">\n      <option value=\"\">全部分类</option>\n    </select>\n    <select class=\"select\" id=\"sortBy\">\n      <option value=\"recent\">最近添加</option>\n      <option value=\"name\">名称 A→Z</option>\n      <option value=\"visits\">常用优先</option>\n    </select>\n    <div class=\"seg\" id=\"viewSeg\">\n      <button data-view=\"card\" class=\"on\" title=\"卡片视图\">\n        <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/></svg>\n      </button>\n      <button data-view=\"list\" title=\"列表视图\">\n        <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01\"/></svg>\n      </button>\n    </div>\n    <span class=\"meta\" id=\"meta\"></span>\n  </div>\n\n  <div id=\"content\"></div>\n</div>\n\n<!-- Add / Edit Modal -->\n<div class=\"overlay\" id=\"overlay\">\n  <div class=\"modal\">\n    <h3 id=\"modalTitle\">添加书签</h3>\n    <div class=\"sub\">信息保存在本浏览器，刷新或重开不丢失。</div>\n    <form id=\"form\">\n      <input type=\"hidden\" id=\"fId\">\n      <div class=\"field\">\n        <label>网站名称 *</label>\n        <input id=\"fName\" required placeholder=\"例如：WorkBuddy\">\n      </div>\n      <div class=\"field\">\n        <label>网址 *</label>\n        <input id=\"fUrl\" required placeholder=\"https://example.com\" inputmode=\"url\">\n        <div class=\"hint\">支持 http/https，留空协议会自动补全 https://</div>\n      </div>\n      <div class=\"field\">\n        <label>分类</label>\n        <input id=\"fCat\" list=\"catList\" placeholder=\"例如：工作 / 学习 / 工具\">\n        <datalist id=\"catList\"></datalist>\n      </div>\n      <div class=\"field\">\n        <label>标签</label>\n        <input id=\"fTags\" placeholder=\"用逗号分隔，例如：AI, 效率, 常用\">\n      </div>\n      <div class=\"preview\" id=\"fPreview\"></div>\n      <div class=\"modal-acts\">\n        <button type=\"button\" class=\"btn\" id=\"cancelBtn\">取消</button>\n        <button type=\"submit\" class=\"btn primary\">保存</button>\n      </div>\n    </form>\n  </div>\n</div>\n\n<div class=\"toast\" id=\"toast\"></div>\n\n";

(function(){
  "use strict";
  const KEY="wb_bookmarks_v1", SET="wb_bookmarks_settings_v1";
  const $ = s => document.querySelector(s);

  let bookmarks = load();
  let settings = Object.assign({view:"card", groupBy:"none", sortBy:"recent", catFilter:""}, loadSettings());

  function load(){ try{ return JSON.parse(localStorage.getItem(KEY))||[] }catch(e){ return [] } }
  function save(){ localStorage.setItem(KEY, JSON.stringify(bookmarks)) }
  function loadSettings(){ try{ return JSON.parse(localStorage.getItem(SET))||{} }catch(e){ return {} } }
  function saveSettings(){ localStorage.setItem(SET, JSON.stringify(settings)) }

  function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7) }
  function normUrl(u){
    u=(u||"").trim();
    if(!u) return u;
    if(!/^https?:\/\//i.test(u)) u="https://"+u;
    return u;
  }
  function hostOf(u){ try{ return new URL(u).hostname.replace(/^www\./,"") }catch(e){ return "" } }
  function favicon(u){ const h=hostOf(u); return h?`https://www.google.com/s2/favicons?domain=${encodeURIComponent(h)}&sz=64`:"" }
  function initial(name){ return (name||"?").trim().charAt(0).toUpperCase() }

  function toast(msg){
    const t=$("#toast"); t.textContent=msg; t.classList.add("show");
    clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),1800);
  }

  // ---- Icon element builder ----
  function iconEl(bm, size){
    const h=hostOf(bm.url);
    const wrap=document.createElement("div");
    wrap.className="icon"+(size?(" s"+size):"");
    const img=document.createElement("img");
    img.className="fav"; img.alt=""; img.loading="lazy";
    img.onload=()=>wrap.classList.add("loaded");
    img.onerror=()=>{ img.style.display="none"; };
    if(h) img.src=favicon(bm.url);
    const letter=document.createElement("span");
    letter.className="letter"; letter.textContent=initial(bm.name);
    wrap.appendChild(img); wrap.appendChild(letter);
    return wrap;
  }

  // ---- Filtering & sorting ----
  function getFiltered(){
    const q=$("#search").value.trim().toLowerCase();
    const cf=settings.catFilter;
    let list=bookmarks.filter(b=>{
      if(cf && (b.category||"")!==cf) return false;
      if(!q) return true;
      const hay=(b.name+" "+(b.url||"")+" "+(b.category||"")+" "+((b.tags||[]).join(" "))).toLowerCase();
      return hay.includes(q);
    });
    const s=settings.sortBy;
    list.sort((a,b)=>{
      if(s==="name") return a.name.localeCompare(b.name,"zh");
      if(s==="visits") return (b.visits||0)-(a.visits||0);
      return (b.createdAt||0)-(a.createdAt||0);
    });
    return list;
  }

  function groupMap(list){
    const g=settings.groupBy;
    if(g==="none") return [["全部", list]];
    const map=new Map();
    list.forEach(b=>{
      if(g==="category"){ const k=b.category||"未分类"; push(map,k,b); }
      else if(g==="tags"){ const ts=b.tags&&b.tags.length?b.tags:["未标签"]; ts.forEach(t=>push(map,t,b)); }
    });
    function push(m,k,v){ if(!m.has(k))m.set(k,[]); m.get(k).push(v); }
    const entries=[...map.entries()].sort((a,b)=>a[0].localeCompare(b[0],"zh"));
    return entries.length?entries:[["全部",list]];
  }

  // ---- Render ----
  function render(){
    const content=$("#content");
    const list=getFiltered();
    content.className = settings.view==="list" ? "list" : "";
    $("#meta").textContent = list.length? `${list.length} 个书签` : "";
    updateCatFilter();

    if(!bookmarks.length){
      content.innerHTML=`<div class="empty"><div class="big">🔖</div><div>还没有书签</div><div style="margin-top:6px">点击右上角「添加」收藏第一个网站</div></div>`;
      renderQuick(); return;
    }
    if(!list.length){
      content.innerHTML=`<div class="empty"><div class="big">🔍</div><div>没有匹配的书签</div></div>`;
      renderQuick(); return;
    }

    const groups=groupMap(list);
    const frag=document.createDocumentFragment();
    groups.forEach(([title,items])=>{
      if(settings.groupBy!=="none"){
        const h=document.createElement("div");
        h.className="group-title";
        h.innerHTML=`<span>${escapeHtml(title)}</span><span class="count">${items.length}</span>`;
        frag.appendChild(h);
      }
      const grid=document.createElement("div"); grid.className="grid";
      items.forEach(b=>grid.appendChild(cardEl(b)));
      frag.appendChild(grid);
    });
    content.innerHTML=""; content.appendChild(frag);
    renderQuick();
  }

  function cardEl(b){
    const card=document.createElement("div"); card.className="card";
    const open=document.createElement("a"); open.className="open"; open.href=b.url; open.target="_blank"; open.rel="noopener noreferrer";
    open.onclick=()=>incVisits(b.id);
    card.appendChild(open);

    const top=document.createElement("div"); top.className="top";
    top.appendChild(iconEl(b));
    const info=document.createElement("div"); info.style.minWidth="0"; info.style.flex="1";
    const name=document.createElement("div"); name.className="name"; name.textContent=b.name;
    const url=document.createElement("div"); url.className="url"; url.textContent=hostOf(b.url)||b.url;
    info.appendChild(name); info.appendChild(url);
    top.appendChild(info);
    card.appendChild(top);

    if(b.tags&&b.tags.length){
      const tags=document.createElement("div"); tags.className="tags";
      b.tags.forEach(t=>{
        const btn=document.createElement("button"); btn.className="tag"; btn.textContent=t;
        btn.onclick=(e)=>{ e.stopPropagation(); $("#search").value=t; render(); };
        tags.appendChild(btn);
      });
      card.appendChild(tags);
    }

    const acts=document.createElement("div"); acts.className="acts";
    const edit=document.createElement("button"); edit.className="mini"; edit.textContent="编辑";
    edit.onclick=(e)=>{ e.stopPropagation(); openModal(b); };
    const del=document.createElement("button"); del.className="mini del"; del.textContent="删除";
    del.onclick=(e)=>{ e.stopPropagation(); removeBm(b.id); };
    acts.appendChild(edit); acts.appendChild(del);
    card.appendChild(acts);
    return card;
  }

  function renderQuick(){
    const q=$("#quick");
    const top=[...bookmarks].filter(b=>b.visits>0).sort((a,b)=>b.visits-a.visits).slice(0,8);
    if(!top.length){ q.innerHTML=""; q.style.display="none"; return; }
    q.style.display="flex"; q.innerHTML="";
    top.forEach(b=>{
      const chip=document.createElement("a"); chip.className="chip"; chip.href=b.url; chip.target="_blank"; chip.rel="noopener";
      chip.title=b.name+" · 访问 "+(b.visits||0)+" 次";
      chip.onclick=()=>incVisits(b.id);
      const h=hostOf(b.url);
      const ic=document.createElement("div"); ic.className="icon"; ic.style.width="22px"; ic.style.height="22px"; ic.style.fontSize="11px"; ic.style.borderRadius="50%";
      const img=document.createElement("img"); img.className="fav"; img.style.width="100%"; img.style.height="100%"; img.style.borderRadius="50%";
      img.onload=()=>ic.classList.add("loaded"); img.onerror=()=>img.style.display="none";
      if(h) img.src=favicon(b.url);
      const letter=document.createElement("span"); letter.className="letter"; letter.textContent=initial(b.name);
      ic.appendChild(img); ic.appendChild(letter);
      const label=document.createElement("span"); label.textContent=b.name;
      chip.appendChild(ic); chip.appendChild(label);
      q.appendChild(chip);
    });
  }

  function incVisits(id){
    const b=bookmarks.find(x=>x.id===id); if(!b) return;
    b.visits=(b.visits||0)+1; save();
  }

  function updateCatFilter(){
    const sel=$("#catFilter"); const cur=settings.catFilter;
    const cats=[...new Set(bookmarks.map(b=>b.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"zh"));
    sel.innerHTML='<option value="">全部分类</option>'+cats.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    sel.value=cur;
    $("#catList").innerHTML=cats.map(c=>`<option value="${escapeHtml(c)}">`).join("");
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

  // ---- CRUD ----
  function openModal(bm){
    $("#modalTitle").textContent = bm? "编辑书签" : "添加书签";
    $("#fId").value = bm? bm.id : "";
    $("#fName").value = bm? bm.name : "";
    $("#fUrl").value = bm? bm.url : "";
    $("#fCat").value = bm? (bm.category||"") : "";
    $("#fTags").value = bm? (bm.tags||[]).join(", ") : "";
    updatePreview();
    $("#overlay").classList.add("show");
    setTimeout(()=>$("#fName").focus(),50);
  }
  function closeModal(){ $("#overlay").classList.remove("show") }

  function updatePreview(){
    const name=$("#fName").value.trim()||"预览";
    const url=normUrl($("#fUrl").value);
    $("#fPreview").innerHTML="";
    if(!url){ $("#fPreview").textContent=""; return; }
    $("#fPreview").appendChild(iconEl({name,url}));
    const span=document.createElement("span"); span.textContent=hostOf(url);
    $("#fPreview").appendChild(span);
  }

  function submitForm(e){
    e.preventDefault();
    const id=$("#fId").value;
    const name=$("#fName").value.trim();
    const url=normUrl($("#fUrl").value.trim());
    const category=$("#fCat").value.trim();
    const tags=$("#fTags").value.split(",").map(t=>t.trim()).filter(Boolean);
    if(!name||!url){ toast("请填写名称和网址"); return; }
    if(id){
      const b=bookmarks.find(x=>x.id===id);
      Object.assign(b,{name,url,category,tags});
      toast("已更新");
    } else {
      bookmarks.push({id:uid(),name,url,category,tags,createdAt:Date.now(),visits:0});
      toast("已添加");
    }
    save(); closeModal(); render();
  }

  function removeBm(id){
    const b=bookmarks.find(x=>x.id===id); if(!b) return;
    if(!confirm(`确定删除「${b.name}」？`)) return;
    bookmarks=bookmarks.filter(x=>x.id!==id); save(); render(); toast("已删除");
  }

  // ---- Export / Import ----
  function exportData(){
    const blob=new Blob([JSON.stringify(bookmarks,null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download="bookmarks-"+new Date().toISOString().slice(0,10)+".json"; a.click();
    URL.revokeObjectURL(a.href); toast("已导出备份");
  }
  function importData(file){
    const r=new FileReader();
    r.onload=()=>{
      try{
        const data=JSON.parse(r.result);
        if(!Array.isArray(data)) throw 0;
        let added=0;
        data.forEach(d=>{
          if(d&&d.name&&d.url){
            bookmarks.push({id:uid(),name:String(d.name),url:normUrl(String(d.url)),
              category:d.category?String(d.category):"",tags:Array.isArray(d.tags)?d.tags.map(String):[],
              createdAt:d.createdAt||Date.now(),visits:d.visits||0}); added++;
          }
        });
        save(); render(); toast(`已导入 ${added} 个书签`);
      }catch(e){ toast("导入失败：文件格式不正确"); }
    };
    r.readAsText(file);
  }

  // ---- Events ----
  $("#addBtn").onclick=()=>openModal(null);
  $("#cancelBtn").onclick=closeModal;
  $("#overlay").onclick=e=>{ if(e.target===$("#overlay")) closeModal(); };
  $("#form").onsubmit=submitForm;
  $("#fName").oninput=updatePreview; $("#fUrl").oninput=updatePreview;
  $("#search").oninput=render;

  $("#groupBy").onchange=e=>{ settings.groupBy=e.target.value; saveSettings(); render(); };
  $("#sortBy").onchange=e=>{ settings.sortBy=e.target.value; saveSettings(); render(); };
  $("#catFilter").onchange=e=>{ settings.catFilter=e.target.value; saveSettings(); render(); };

  $("#viewSeg").onclick=e=>{
    const b=e.target.closest("button"); if(!b) return;
    settings.view=b.dataset.view; saveSettings();
    [...$("#viewSeg").children].forEach(x=>x.classList.toggle("on",x===b));
    render();
  };

  // menu
  $("#menuBtn").onclick=e=>{ e.stopPropagation(); $("#menu").classList.toggle("show"); };
  document.onclick=e=>{ if(!e.target.closest(".menu-wrap")) $("#menu").classList.remove("show"); };
  $("#exportBtn").onclick=()=>{ $("#menu").classList.remove("show"); exportData(); };
  $("#importBtn").onclick=()=>{ $("#menu").classList.remove("show"); $("#importFile").click(); };
  $("#importFile").onchange=e=>{ if(e.target.files[0]) importData(e.target.files[0]); e.target.value=""; };
  $("#clearBtn").onclick=()=>{
    $("#menu").classList.remove("show");
    if(!bookmarks.length){ toast("书签已是空的"); return; }
    if(confirm("确定清空全部书签？此操作不可恢复（建议先导出备份）。")){
      bookmarks=[]; save(); render(); toast("已清空");
    }
  };

  // keyboard: Esc closes, "/" focuses search
  document.onkeydown=e=>{
    if(e.key==="Escape") closeModal();
    if(e.key==="/" && document.activeElement.tagName!=="INPUT" && document.activeElement.tagName!=="TEXTAREA"){ e.preventDefault(); $("#search").focus(); }
  };

  // init
  render();
})();
