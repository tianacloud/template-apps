const style=document.createElement("style"); style.textContent="\n  :root{\n    --bg:#0f1220; --bg2:#161a2e; --card:#1c2138; --card2:#222a47;\n    --line:#2c3457; --txt:#e8ecff; --txt2:#9aa3c7; --txt3:#6b739a;\n    --brand:#7c5cff; --brand2:#22d3ee; --pink:#ff5c93; --green:#3ddc97;\n    --warn:#ffb547; --red:#ff6b6b; --shadow:0 14px 40px rgba(0,0,0,.45);\n    --radius:18px; --chip:#262e4d;\n  }\n  html[data-theme=\"light\"]{\n    --bg:#f4f6fb; --bg2:#eef1f8; --card:#ffffff; --card2:#f3f5fc;\n    --line:#e2e7f3; --txt:#1a1f36; --txt2:#5a6486; --txt3:#9098b5;\n    --brand:#6c47ff; --brand2:#0ea5c4; --pink:#ff4d8d; --green:#16b877;\n    --warn:#e8920a; --red:#e5484d; --shadow:0 14px 40px rgba(40,50,90,.12);\n    --chip:#eef1fb;\n  }\n  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\n  html,body{margin:0;padding:0}\n  body{\n    background:\n      radial-gradient(1100px 600px at 12% -8%, rgba(124,92,255,.20), transparent 60%),\n      radial-gradient(900px 500px at 100% 0%, rgba(34,211,238,.16), transparent 55%),\n      var(--bg);\n    color:var(--txt);\n    font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;\n    line-height:1.55; min-height:100vh;\n    transition:background .35s,color .35s;\n  }\n  .wrap{max-width:560px;margin:0 auto;padding:18px 16px 120px}\n  header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:8px 2px 18px}\n  .logo{display:flex;align-items:center;gap:11px}\n  .logo .blob{\n    width:46px;height:46px;border-radius:14px;display:grid;place-items:center;font-size:24px;\n    background:linear-gradient(145deg,var(--brand),var(--brand2));box-shadow:0 8px 22px rgba(124,92,255,.4);\n  }\n  .logo h1{font-size:20px;margin:0;letter-spacing:.5px}\n  .logo p{margin:0;font-size:12px;color:var(--txt2)}\n  .theme-btn{\n    border:1px solid var(--line);background:var(--card);color:var(--txt2);\n    width:42px;height:42px;border-radius:12px;font-size:18px;cursor:pointer;transition:.2s;\n  }\n  .theme-btn:active{transform:scale(.93)}\n\n  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}\n  .stat{\n    background:linear-gradient(180deg,var(--card),var(--card2));border:1px solid var(--line);\n    border-radius:14px;padding:12px 8px;text-align:center;box-shadow:var(--shadow);\n  }\n  .stat .num{font-size:22px;font-weight:800;background:linear-gradient(135deg,var(--brand),var(--brand2));-webkit-background-clip:text;background-clip:text;color:transparent}\n  .stat .lbl{font-size:11px;color:var(--txt2);margin-top:3px}\n\n  .toolbar{display:flex;gap:9px;margin-bottom:12px}\n  .search{\n    flex:1;display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);\n    border-radius:13px;padding:10px 13px;\n  }\n  .search input{flex:1;border:0;background:transparent;color:var(--txt);font-size:14px;outline:none}\n  .search input::placeholder{color:var(--txt3)}\n  .btn{\n    border:0;border-radius:13px;font-weight:700;cursor:pointer;font-size:14px;transition:.18s;\n    padding:11px 14px;white-space:nowrap;\n  }\n  .btn:active{transform:scale(.96)}\n  .btn-primary{background:linear-gradient(135deg,var(--brand),var(--pink));color:#fff;box-shadow:0 8px 20px rgba(124,92,255,.4)}\n  .btn-ghost{background:var(--card);color:var(--txt2);border:1px solid var(--line)}\n\n  .filters{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 10px;margin-bottom:4px;scrollbar-width:none}\n  .filters::-webkit-scrollbar{display:none}\n  .chip{\n    flex:none;border:1px solid var(--line);background:var(--chip);color:var(--txt2);\n    padding:7px 12px;border-radius:999px;font-size:13px;cursor:pointer;transition:.18s;white-space:nowrap;\n  }\n  .chip.active{background:linear-gradient(135deg,var(--brand),var(--brand2));color:#fff;border-color:transparent}\n\n  .list{display:flex;flex-direction:column;gap:12px}\n  .item{\n    background:linear-gradient(180deg,var(--card),var(--card2));border:1px solid var(--line);\n    border-radius:var(--radius);padding:14px 15px;box-shadow:var(--shadow);position:relative;animation:pop .28s ease;\n  }\n  @keyframes pop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}\n  .item .top{display:flex;align-items:center;gap:9px;margin-bottom:8px}\n  .item .mood{font-size:22px;line-height:1}\n  .item .tag{font-size:11px;background:var(--chip);color:var(--brand2);padding:3px 9px;border-radius:999px;border:1px solid var(--line)}\n  .item .date{margin-left:auto;font-size:11px;color:var(--txt3)}\n  .item .text{font-size:15px;color:var(--txt);white-space:pre-wrap;word-break:break-word}\n  .item .acts{display:flex;gap:6px;margin-top:11px;justify-content:flex-end}\n  .mini{\n    border:1px solid var(--line);background:transparent;color:var(--txt2);font-size:12px;\n    padding:5px 11px;border-radius:9px;cursor:pointer;transition:.15s;\n  }\n  .mini:active{transform:scale(.94)}\n  .mini.del{color:var(--red)}\n\n  .empty{text-align:center;padding:46px 20px;color:var(--txt3)}\n  .empty .e{font-size:46px}\n  .empty p{margin:10px 0 0;font-size:14px}\n\n  .fab{\n    position:fixed;left:50%;transform:translateX(-50%);bottom:22px;z-index:30;\n    display:flex;gap:10px;\n  }\n  .fab .btn-primary{padding:14px 20px;font-size:15px;box-shadow:0 12px 30px rgba(124,92,255,.5)}\n  .fab .btn-ghost{padding:14px 16px}\n\n  /* modal */\n  .mask{position:fixed;inset:0;background:rgba(6,8,18,.6);backdrop-filter:blur(4px);z-index:50;display:none;align-items:flex-end;justify-content:center}\n  .mask.show{display:flex;animation:fade .2s}\n  @keyframes fade{from{opacity:0}to{opacity:1}}\n  .sheet{\n    width:100%;max-width:560px;background:var(--bg2);border:1px solid var(--line);\n    border-radius:22px 22px 0 0;padding:18px 18px 26px;box-shadow:var(--shadow);animation:up .26s ease;\n  }\n  @keyframes up{from{transform:translateY(40px)}to{transform:none}}\n  .sheet h3{margin:2px 0 14px;font-size:17px}\n  .field{margin-bottom:14px}\n  .field label{display:block;font-size:12px;color:var(--txt2);margin-bottom:8px}\n  textarea{\n    width:100%;min-height:108px;resize:vertical;background:var(--card);border:1px solid var(--line);\n    border-radius:13px;padding:12px 13px;color:var(--txt);font-size:15px;outline:none;font-family:inherit;line-height:1.55;\n  }\n  textarea:focus{border-color:var(--brand)}\n  .opts{display:flex;flex-wrap:wrap;gap:8px}\n  .opt{\n    border:1px solid var(--line);background:var(--card);color:var(--txt2);border-radius:11px;\n    padding:8px 12px;font-size:13px;cursor:pointer;transition:.15s;display:flex;align-items:center;gap:6px;\n  }\n  .opt.active{border-color:var(--brand);color:var(--txt);background:var(--card2);box-shadow:0 0 0 2px rgba(124,92,255,.25)}\n  .moods{display:flex;flex-wrap:wrap;gap:7px}\n  .mood-btn{font-size:22px;width:42px;height:42px;border-radius:12px;border:1px solid var(--line);background:var(--card);cursor:pointer;transition:.15s}\n  .mood-btn.active{border-color:var(--brand);background:var(--card2);transform:scale(1.08)}\n  .sheet-acts{display:flex;gap:10px;margin-top:6px}\n  .sheet-acts .btn{flex:1}\n\n  .toast{\n    position:fixed;left:50%;top:18px;transform:translateX(-50%) translateY(-80px);z-index:80;\n    background:var(--card);border:1px solid var(--line);color:var(--txt);padding:11px 18px;border-radius:12px;\n    font-size:14px;box-shadow:var(--shadow);opacity:0;transition:.3s;\n  }\n  .toast.show{transform:translateX(-50%) translateY(0);opacity:1}\n\n  footer{text-align:center;margin-top:26px;color:var(--txt3);font-size:12px;line-height:1.9}\n  footer .egg{font-size:13px}\n  .footer-acts{display:flex;gap:10px;justify-content:center;margin-top:10px;flex-wrap:wrap}\n  .footer-acts .mini{font-size:12px}\n  .hl{color:var(--brand2);font-weight:700}\n"; document.head.appendChild(style);
document.getElementById("app").innerHTML = "\n<div data-page-node-id=\"EZRIs61zfYzBr65PrMhjlj\" class=\"wrap\">\n  <header data-page-node-id=\"ATtCeUTLrg6LaqkzFGJnuM\">\n    <div data-page-node-id=\"mTM0CETlvZTOvysw3kDQ4A\" class=\"logo\">\n      <div data-page-node-id=\"AW32PaP0z9qxEqC71A1X95\" class=\"blob\"><!--pnid:dq64pbAwRHuJvrZjZe6X2R-->🐞</div>\n      <div data-page-node-id=\"p5ElYR4Pg4iKdR6gQNP8fY\">\n        <h1 data-page-node-id=\"tL2WPRzspqdvSoFiZMu4la\"><!--pnid:wfkHHyGdINXOaLJAHNQDiX-->趣事随身记</h1>\n        <p data-page-node-id=\"zPGLJCklZmrWT38PYgZOrI\"><!--pnid:G3HyxxNmQtk2CylDObt7tP-->程序员的口袋快乐剂 · v1.0</p>\n      </div>\n    </div>\n    <button data-page-node-id=\"yhTrOjou0eOkLZWfAkKA1G\" class=\"theme-btn\" id=\"themeBtn\" title=\"切换主题\"><!--pnid:MbKGLS7pSEO2qaapk4vXLq-->🌙</button>\n  </header>\n\n  <section data-page-node-id=\"hSBaz7GpYFvviBcUNihJ5c\" class=\"stats\" id=\"stats\">\n    <div data-page-node-id=\"cEPK6x27lrHjuRZtq5mM5u\" class=\"stat\"><div data-page-node-id=\"1I0MDdVp5Rqjmm3pL5qrSa\" class=\"num\" id=\"stTotal\"><!--pnid:8xYlBbhn3xxeVmMLjCiwcJ-->0</div><div data-page-node-id=\"YHeloMwDU70w4bBzNkSrjC\" class=\"lbl\"><!--pnid:dMP5HR7peDEXS8iNaPa8Oj-->趣事总数</div></div>\n    <div data-page-node-id=\"QLc8RxWeHrZVoalCgrpS8Y\" class=\"stat\"><div data-page-node-id=\"KBj2ENUaeVjCFzvEMo0SnV\" class=\"num\" id=\"stStreak\"><!--pnid:UMoeS4nVqRqc9RLT6scu0a-->0</div><div data-page-node-id=\"mvpAvwbVvGqTgvOnuRMRtn\" class=\"lbl\"><!--pnid:mtqCM4z2gvyI4SrcD9Tkr9-->连续天数</div></div>\n    <div data-page-node-id=\"1osIWtWW2OC7e63ZT55eRS\" class=\"stat\"><div data-page-node-id=\"XDqHmVKU9uQOKJAEvFpQ1E\" class=\"num\" id=\"stMonth\"><!--pnid:EMqruDxar15n0wpJgkeJyf-->0</div><div data-page-node-id=\"05jxLLMeboUvSaO5Z5OBvE\" class=\"lbl\"><!--pnid:LXWs55xfPDDlJgUckgeVvV-->本月趣事</div></div>\n    <div data-page-node-id=\"YJXMb3hNWqIavySTUoc50L\" class=\"stat\"><div data-page-node-id=\"tGOhksCOoufCxeUl45eCQ7\" class=\"num\" id=\"stTop\" style=\"font-size:14px; padding-top:3px\"><!--pnid:OyIfmoI1un5O6rebbTQOrU-->—</div><div data-page-node-id=\"L8WaOMtQQ0TT7NvcItnMNs\" class=\"lbl\"><!--pnid:boMndT6mjWYZf8PCPYY3Ib-->最常出现</div></div>\n  </section>\n\n  <div data-page-node-id=\"9F9n0Qdr6k6dhBsavSigO2\" class=\"toolbar\">\n    <div data-page-node-id=\"BJNLlkpJukBZidV5kBsuef\" class=\"search\">\n      <span data-page-node-id=\"uXLSdAbSQqA32QxvBDupgu\" style=\"font-size:15px; color:var(--txt3)\"><!--pnid:w6cUd7tlIJo1HSsjYNM5rA-->🔍</span>\n      <input data-page-node-id=\"26XK7f9fIeIOPGpfU2e6Kq\" id=\"searchInput\" placeholder=\"搜一搜你的快乐…\" type=\"text\">\n    </div>\n    <button data-page-node-id=\"hKN2guo3nAI8vmrHCvbOWm\" class=\"btn btn-ghost\" id=\"randomBtn\" title=\"随机翻一条旧趣事\"><!--pnid:0ZFiO3zv7HCYcJjeOHlE56-->🎲 翻一条</button>\n  </div>\n\n  <div data-page-node-id=\"7tmbplVLtyNyCzLUWc86r2\" class=\"filters\" id=\"filters\"></div>\n\n  <div data-page-node-id=\"saUDHebe7UCpulmyvpm5KY\" class=\"list\" id=\"list\"></div>\n\n  <footer data-page-node-id=\"Kw6uFo1x28FpMX9tzcrjlP\">\n    <div data-page-node-id=\"LzFDLMlydcPTxsyAbjHxUp\" class=\"egg\"><!--pnid:xs1TvXV2uPZuXj98rv6s7f-->🎉 Happy <span data-page-node-id=\"p3hQjx8vytV2vo32WdVRPL\" class=\"hl\"><!--pnid:f8XWDoVRZWVSFulUYWNpcv-->1024</span><!--pnid:hE1z464pyB60XGVRLNf6CY--> 程序员节 · 把 bug 之外的事也记下来</div>\n    <div data-page-node-id=\"ZEApdFlr1D5GFTDzeELOxb\"><!--pnid:f5Jy2gRQIiyjZoWeMMkKV0-->数据仅存于本机浏览器（LocalStorage），不上传任何服务器。</div>\n    <div data-page-node-id=\"nE8StLjHATDQuRGtLHqSmX\" class=\"footer-acts\">\n      <button data-page-node-id=\"7rRnZlkg4QOlL79W6vbJxz\" class=\"mini\" id=\"exportBtn\"><!--pnid:bfi6jOjF5lRPZmbuGVv1ep-->⬇️ 导出备份</button>\n      <button data-page-node-id=\"Fp26q97RhxyCdTCRroN05X\" class=\"mini\" id=\"importBtn\"><!--pnid:d25g4PpqDh3crwNqFheiab-->⬆️ 导入恢复</button>\n      <button data-page-node-id=\"KqlkSI1XJTsNDU9IOtuyr6\" class=\"mini\" id=\"clearBtn\"><!--pnid:oS3BZWdcU5rBh5DGEOEbl8-->🧹 清空全部</button>\n    </div>\n    <input data-page-node-id=\"pEzNSHhYKZiuPuFkzEg6Qu\" accept=\"application/json\" hidden id=\"importFile\" type=\"file\">\n  </footer>\n</div>\n\n<div data-page-node-id=\"i6RfXQ7rx6fMVfF20ffhx1\" class=\"fab\">\n  <button data-page-node-id=\"p5J7B8UfgW7oq7Cc68E8Ky\" class=\"btn btn-ghost\" id=\"demoBtn\"><!--pnid:eYoZUQEVPuSW0CEKXpSWqD-->✨ 来个示例</button>\n  <button data-page-node-id=\"bTKbdsY8U9hqC5TwjRDueh\" class=\"btn btn-primary\" id=\"addBtn\"><!--pnid:20wf6T5J1R2hlZFUSattf0-->➕ 记一条</button>\n</div>\n\n<!--pnid:0R9bEZv082Z4eM4QEuRoIg--><!-- add / edit sheet -->\n<div data-page-node-id=\"wo6Xa7bkKWZru8qp3Tp9Jp\" class=\"mask\" id=\"mask\">\n  <div data-page-node-id=\"ZCymguSqMLK7iLVatgZFM6\" class=\"sheet\">\n    <h3 data-page-node-id=\"zrE4ua9WGfL4tXKnk9uDvD\" id=\"sheetTitle\"><!--pnid:mM4E2FStFjBWaE6GhWRjPz-->记一条趣事</h3>\n    <div data-page-node-id=\"sYBCKHHRYafUwWrqqXoVGX\" class=\"field\">\n      <label data-page-node-id=\"F8YiPDwEztIYogCJpXj2rm\"><!--pnid:fzh8dQFHup3q5WMiYYPRKS-->发生了什么好笑的事？</label>\n      <textarea data-page-node-id=\"dbbTtRbI3cDT9LsIitvYEL\" id=\"textInput\" placeholder=\"例如：产品说这个需求很简单，明天上线就行。我看了眼，是重写底层架构。\"></textarea>\n    </div>\n    <div data-page-node-id=\"xmnazLHN50VldI0sBGVXn3\" class=\"field\">\n      <label data-page-node-id=\"C9YZ3sQRCLhkzzfnDsYJ0L\"><!--pnid:NXYgAMhJC2HkfJl93srQM1-->选个分类</label>\n      <div data-page-node-id=\"r1tXO2IwkJ6RT4saf76xE3\" class=\"opts\" id=\"tagOpts\"></div>\n    </div>\n    <div data-page-node-id=\"zouiwtLAcPwQStHQCu6cOS\" class=\"field\">\n      <label data-page-node-id=\"EPotDbmhfuOxcP2miB3EUO\"><!--pnid:N9hn7zxhwlaHemaKLpaf2L-->此刻的心情</label>\n      <div data-page-node-id=\"Qixoya4yXTmSATZGTDpVjx\" class=\"moods\" id=\"moodOpts\"></div>\n    </div>\n    <div data-page-node-id=\"SyN3vKw4Vg4YabHndBWQA3\" class=\"sheet-acts\">\n      <button data-page-node-id=\"lQZLxtWiEsEVeywInrTb4g\" class=\"btn btn-ghost\" id=\"cancelBtn\"><!--pnid:r26VlshGswOlCA6L6tOkRv-->取消</button>\n      <button data-page-node-id=\"5NRemGYX0zQxFQ1kHZ4tT9\" class=\"btn btn-primary\" id=\"saveBtn\"><!--pnid:QH3L12R870XGzNMAvgVynp-->保存</button>\n    </div>\n  </div>\n</div>\n\n<div data-page-node-id=\"scpBMIU4ssetY1RgSaWMiP\" class=\"toast\" id=\"toast\"></div>\n\n";

(function(){
  "use strict";
  var KEY="quushi_v1";
  var TAGS=[
    {id:"crash",  name:"代码翻车",   icon:"💥"},
    {id:"ghost",  name:"需求鬼故事", icon:"👻"},
    {id:"fish",   name:"摸鱼时刻",   icon:"🐟"},
    {id:"pm",     name:"产品奇葩",   icon:"🤡"},
    {id:"bug",    name:"今日BUG",    icon:"🐛"},
    {id:"scene",  name:"同事名场面", icon:"🎬"},
    {id:"idea",   name:"灵感闪现",   icon:"💡"},
    {id:"egg",    name:"生活彩蛋",   icon:"🥚"}
  ];
  var MOODS=["😂","🤣","😅","🥲","🤯","😎","🤔","💡","🐛","🎉","😭","🤡"];
  var tagMap={}; TAGS.forEach(function(t){tagMap[t.id]=t;});

  var state={items:[], filter:"all", q:"", editing:null, curTag:TAGS[0].id, curMood:MOODS[0]};

  // ---------- storage ----------
  function load(){
    try{ state.items=JSON.parse(localStorage.getItem(KEY))||[]; }
    catch(e){ state.items=[]; }
  }
  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify(state.items)); }catch(e){}
  }

  // ---------- helpers ----------
  function fmt(ts){
    var d=new Date(ts), n=new Date();
    var pad=function(x){return (x<10?"0":"")+x;};
    var sameDay=d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()&&d.getDate()===n.getDate();
    if(sameDay) return "今天 "+pad(d.getHours())+":"+pad(d.getMinutes());
    var yest=new Date(n); yest.setDate(n.getDate()-1);
    var isYest=d.getFullYear()===yest.getFullYear()&&d.getMonth()===yest.getMonth()&&d.getDate()===yest.getDate();
    if(isYest) return "昨天 "+pad(d.getHours())+":"+pad(d.getMinutes());
    return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+" "+pad(d.getHours())+":"+pad(d.getMinutes());
  }
  function dayKey(ts){ var d=new Date(ts); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); }

  // ---------- stats ----------
  function renderStats(){
    var n=state.items.length;
    document.getElementById("stTotal").textContent=n;
    // streak
    var days={}; state.items.forEach(function(it){ days[dayKey(it.createdAt)]=1; });
    var streak=0; var cur=new Date();
    // if today has no entry, start counting from yesterday
    if(!days[dayKey(cur.getTime())]) cur.setDate(cur.getDate()-1);
    while(days[dayKey(cur.getTime())]){ streak++; cur.setDate(cur.getDate()-1); }
    document.getElementById("stStreak").textContent=streak;
    // this month
    var now=new Date(); var m=0;
    state.items.forEach(function(it){ var d=new Date(it.createdAt); if(d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()) m++; });
    document.getElementById("stMonth").textContent=m;
    // top tag
    var cnt={}; state.items.forEach(function(it){ cnt[it.tag]=(cnt[it.tag]||0)+1; });
    var top=null,tv=-1; Object.keys(cnt).forEach(function(k){ if(cnt[k]>tv){tv=cnt[k];top=k;} });
    var topEl=document.getElementById("stTop");
    if(top&&tagMap[top]){ topEl.textContent=tagMap[top].icon+tagMap[top].name; }
    else topEl.textContent="—";
  }

  // ---------- filters ----------
  function renderFilters(){
    var box=document.getElementById("filters"); box.innerHTML="";
    var mk=function(id,label){
      var c=document.createElement("div"); c.className="chip"+(state.filter===id?" active":"");
      c.textContent=label; c.onclick=function(){ state.filter=id; renderFilters(); renderList(); };
      return c;
    };
    box.appendChild(mk("all","全部"));
    TAGS.forEach(function(t){ box.appendChild(mk(t.id,t.icon+" "+t.name)); });
  }

  // ---------- list ----------
  function renderList(){
    var box=document.getElementById("list"); box.innerHTML="";
    var q=state.q.trim().toLowerCase();
    var arr=state.items.filter(function(it){
      if(state.filter!=="all"&&it.tag!==state.filter) return false;
      if(q&&(it.text||"").toLowerCase().indexOf(q)<0 && (tagMap[it.tag]?tagMap[it.tag].name:"") .indexOf(q)<0) return false;
      return true;
    }).sort(function(a,b){return b.createdAt-a.createdAt;});

    if(arr.length===0){
      var e=document.createElement("div"); e.className="empty";
      e.innerHTML='<div class="e">📭</div><p>'+(state.items.length===0?"还没有趣事，点右下角「记一条」开始收集快乐吧！":"没有匹配的趣事，换个关键词或分类试试。")+'</p>';
      box.appendChild(e); return;
    }
    arr.forEach(function(it){
      var t=tagMap[it.tag]||{name:"其他",icon:"📝"};
      var el=document.createElement("div"); el.className="item";
      el.innerHTML=
        '<div class="top"><span class="mood">'+(it.mood||"😀")+'</span>'+
        '<span class="tag">'+t.icon+' '+t.name+'</span>'+
        '<span class="date">'+fmt(it.createdAt)+'</span></div>'+
        '<div class="text"></div>'+
        '<div class="acts"><button class="mini edt">编辑</button><button class="mini del">删除</button></div>';
      el.querySelector(".text").textContent=it.text;
      el.querySelector(".edt").onclick=function(){ openSheet(it); };
      el.querySelector(".del").onclick=function(){ delItem(it.id); };
      box.appendChild(el);
    });
  }

  // ---------- crud ----------
  function delItem(id){
    if(!confirm("确定删除这条趣事？")) return;
    state.items=state.items.filter(function(x){return x.id!==id;});
    save(); renderAll();
  }

  // ---------- sheet ----------
  function renderTagOpts(){
    var box=document.getElementById("tagOpts"); box.innerHTML="";
    TAGS.forEach(function(t){
      var o=document.createElement("div"); o.className="opt"+(state.curTag===t.id?" active":"");
      o.innerHTML='<span>'+(t.icon)+'</span><span>'+t.name+'</span>';
      o.onclick=function(){ state.curTag=t.id; renderTagOpts(); };
      box.appendChild(o);
    });
  }
  function renderMoodOpts(){
    var box=document.getElementById("moodOpts"); box.innerHTML="";
    MOODS.forEach(function(m){
      var b=document.createElement("button"); b.className="mood-btn"+(state.curMood===m?" active":"");
      b.textContent=m; b.onclick=function(){ state.curMood=m; renderMoodOpts(); };
      box.appendChild(b);
    });
  }
  function openSheet(item){
    state.editing=item?item.id:null;
    document.getElementById("sheetTitle").textContent=item?"编辑趣事":"记一条趣事";
    document.getElementById("textInput").value=item?item.text:"";
    state.curTag=item?item.tag:TAGS[0].id;
    state.curMood=item&&item.mood?item.mood:MOODS[0];
    renderTagOpts(); renderMoodOpts();
    document.getElementById("mask").classList.add("show");
    setTimeout(function(){document.getElementById("textInput").focus();},200);
  }
  function closeSheet(){ document.getElementById("mask").classList.remove("show"); state.editing=null; }

  function saveSheet(){
    var txt=document.getElementById("textInput").value.trim();
    if(!txt){ toast("写点什么再保存吧～"); return; }
    if(state.editing){
      state.items.forEach(function(it){ if(it.id===state.editing){ it.text=txt; it.tag=state.curTag; it.mood=state.curMood; } });
    }else{
      state.items.push({id:"q_"+Date.now()+"_"+Math.random().toString(36).slice(2,7), text:txt, tag:state.curTag, mood:state.curMood, createdAt:Date.now()});
    }
    save(); closeSheet(); renderAll(); toast(state.editing?"已更新 ✅":"已收藏 🎉");
  }

  // ---------- random ----------
  function randomPick(){
    if(state.items.length===0){ toast("还没有趣事可翻～"); return; }
    var it=state.items[Math.floor(Math.random()*state.items.length)];
    var t=tagMap[it.tag]||{name:"其他",icon:"📝"};
    toast((it.mood||"😀")+" "+t.icon+t.name+"：" + (it.text.length>40?it.text.slice(0,40)+"…":it.text));
  }

  // ---------- import / export ----------
  function exportData(){
    if(state.items.length===0){ toast("暂无数据可导出"); return; }
    var blob=new Blob([JSON.stringify({app:"quushi",version:1,items:state.items},null,2)],{type:"application/json"});
    var a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download="趣事随身记-备份-"+new Date().toISOString().slice(0,10)+".json"; a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
    toast("已导出备份文件 ⬇️");
  }
  function importData(file){
    var r=new FileReader();
    r.onload=function(){
      try{
        var d=JSON.parse(r.result);
        if(!d.items||!Array.isArray(d.items)) throw 0;
        if(!confirm("导入将合并到当前数据（重复 id 会被覆盖），继续？")) return;
        var have={}; state.items.forEach(function(it){have[it.id]=it;});
        d.items.forEach(function(it){ if(it&&it.id&&it.text){ have[it.id]={id:it.id,text:it.text,tag:it.tag||"egg",mood:it.mood||"😀",createdAt:it.createdAt||Date.now()}; } });
        state.items=Object.keys(have).map(function(k){return have[k];});
        save(); renderAll(); toast("导入成功 ✅ 共 "+state.items.length+" 条");
      }catch(e){ toast("文件格式不对，导入失败"); }
    };
    r.readAsText(file);
  }

  // ---------- toast ----------
  var toastTimer;
  function toast(msg){
    var t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer=setTimeout(function(){t.classList.remove("show");},1900);
  }

  // ---------- theme ----------
  function applyTheme(th){
    document.documentElement.setAttribute("data-theme",th);
    document.getElementById("themeBtn").textContent= th==="light"?"☀️":"🌙";
    try{localStorage.setItem("quushi_theme",th);}catch(e){}
  }

  // ---------- demo ----------
  function addDemo(){
    var demo=[
      {text:"产品拍着我的肩膀：『这个需求很简单，明天就能上线吧？』我看了一眼 PRD，是重写支付底层。",tag:"pm",mood:"🤡"},
      {text:"线上崩了，我一边重启一边想职业生涯是不是到头了。结果是实习生把测试库当生产库跑了。",tag:"crash",mood:"😅"},
      {text:"写了三天的算法，最后发现一行 sort() 就能解决。我谢谢我自己。",tag:"idea",mood:"💡"},
      {text:"需求评审会上，产品和开发同时沉默了 10 秒，然后同时说『还是你来定吧』。",tag:"ghost",mood:"👻"}
    ];
    var now=Date.now();
    demo.forEach(function(d,i){
      state.items.push({id:"q_demo_"+now+"_"+i,text:d.text,tag:d.tag,mood:d.mood,createdAt:now-i*3600*1000});
    });
    save(); renderAll(); toast("已塞了 4 条示例，先感受一下 🎉");
  }

  // ---------- render all ----------
  function renderAll(){ renderStats(); renderFilters(); renderList(); }

  // ---------- bind ----------
  function bind(){
    document.getElementById("addBtn").onclick=function(){openSheet(null);};
    document.getElementById("demoBtn").onclick=addDemo;
    document.getElementById("cancelBtn").onclick=closeSheet;
    document.getElementById("saveBtn").onclick=saveSheet;
    document.getElementById("randomBtn").onclick=randomPick;
    document.getElementById("exportBtn").onclick=exportData;
    document.getElementById("importBtn").onclick=function(){document.getElementById("importFile").click();};
    document.getElementById("importFile").onchange=function(e){ if(e.target.files[0]) importData(e.target.files[0]); e.target.value=""; };
    document.getElementById("clearBtn").onclick=function(){
      if(state.items.length===0){toast("本来就是空的～");return;}
      if(confirm("确定清空全部趣事？此操作不可恢复，建议先导出备份。")){
        state.items=[]; save(); renderAll(); toast("已清空 🧹");
      }
    };
    document.getElementById("searchInput").oninput=function(e){ state.q=e.target.value; renderList(); };
    document.getElementById("themeBtn").onclick=function(){
      var cur=document.documentElement.getAttribute("data-theme")==="light"?"dark":"light"; applyTheme(cur);
    };
    document.getElementById("mask").onclick=function(e){ if(e.target.id==="mask") closeSheet(); };
    document.addEventListener("keydown",function(e){ if(e.key==="Escape") closeSheet(); });
  }

  // ---------- boot ----------
  var savedTheme="dark";
  try{savedTheme=localStorage.getItem("quushi_theme")||"dark";}catch(e){}
  applyTheme(savedTheme);
  load(); bind(); renderAll();
  if(state.items.length===0){
    // first run hint via a demo-friendly empty state already shown; nothing else
  }
})();
