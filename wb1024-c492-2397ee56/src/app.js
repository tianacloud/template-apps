const style = document.createElement("style");
style.textContent = "\n  :root{\n    --paper:#f4f1ea;\n    --ink:#16150f;\n    --ink-soft:#5c5749;\n    --card:#fffdf7;\n    --accent:#ff4d24;\n    --accent-soft:#ffe3d8;\n    --line:#16150f;\n    --shadow:4px 4px 0 var(--ink);\n    --radius:14px;\n  }\n  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}\n  html,body{height:100%}\n  body{\n    background:var(--paper);\n    color:var(--ink);\n    font-family:\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;\n    line-height:1.6;\n    background-image:radial-gradient(rgba(22,21,15,.16) 1px,transparent 1px);\n    background-size:22px 22px;\n    padding:28px 18px 80px;\n  }\n  .wrap{max-width:780px;margin:0 auto}\n\n  /* ---------- header ---------- */\n  .kicker{\n    display:inline-flex;align-items:center;gap:8px;\n    font-size:12px;font-weight:700;letter-spacing:.14em;\n    background:var(--ink);color:var(--paper);\n    padding:5px 12px;border-radius:99px;\n    margin-bottom:18px;\n  }\n  .kicker .dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:blink 1.4s steps(2) infinite}\n  @keyframes blink{50%{opacity:.2}}\n\n  h1{\n    font-size:clamp(30px,7vw,46px);\n    line-height:1.15;letter-spacing:-.02em;font-weight:900;\n    margin-bottom:12px;\n  }\n  h1 em{\n    font-style:normal;color:var(--accent);\n    position:relative;display:inline-block;\n  }\n  h1 em::after{\n    content:\"\";position:absolute;left:0;right:0;bottom:2px;height:8px;\n    background:var(--accent-soft);z-index:-1;border-radius:3px;\n  }\n  .sub{color:var(--ink-soft);font-size:15px;max-width:60ch}\n  .sub b{color:var(--ink)}\n\n  /* ---------- stats ---------- */\n  .stats{display:flex;gap:10px;flex-wrap:wrap;margin:22px 0 18px}\n  .stat{\n    flex:1 1 100px;background:var(--card);border:1.5px solid var(--line);\n    border-radius:10px;padding:9px 12px;\n  }\n  .stat b{display:block;font-size:22px;line-height:1.2;font-variant-numeric:tabular-nums}\n  .stat span{font-size:11.5px;color:var(--ink-soft);letter-spacing:.04em}\n\n  /* ---------- composer ---------- */\n  .composer{\n    background:var(--card);border:2px solid var(--line);border-radius:var(--radius);\n    box-shadow:var(--shadow);padding:16px;margin-bottom:26px;\n  }\n  .composer label{font-size:12.5px;font-weight:700;letter-spacing:.06em;color:var(--ink-soft);display:block;margin-bottom:8px}\n  .row{display:flex;gap:10px}\n  #itemInput{\n    flex:1;min-width:0;font:inherit;font-size:15.5px;padding:11px 13px;\n    background:#fff;border:1.5px solid var(--line);border-radius:9px;color:var(--ink);\n  }\n  #itemInput::placeholder{color:#a8a292}\n  #itemInput:focus{outline:none;box-shadow:0 0 0 3px var(--accent-soft);border-color:var(--accent)}\n  #itemInput.shake{animation:shake .32s}\n  @keyframes shake{25%{transform:translateX(-5px)}50%{transform:translateX(5px)}75%{transform:translateX(-3px)}}\n  .btn{\n    font:inherit;font-weight:800;font-size:14.5px;cursor:pointer;\n    border:1.5px solid var(--line);border-radius:9px;padding:11px 18px;\n    background:var(--accent);color:#fff;box-shadow:3px 3px 0 var(--ink);\n    transition:transform .1s,box-shadow .1s;white-space:nowrap;\n  }\n  .btn:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 var(--ink)}\n  .btn:active{transform:translate(3px,3px);box-shadow:0 0 0 var(--ink)}\n\n  .tags{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}\n  .tag{\n    font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;\n    border:1.5px dashed #c9c2af;background:transparent;color:var(--ink-soft);\n    padding:4px 11px;border-radius:99px;transition:all .12s;\n  }\n  .tag:hover{border-color:var(--ink);color:var(--ink)}\n  .tag.on{background:var(--ink);color:var(--paper);border:1.5px solid var(--ink);border-style:solid}\n\n  /* ---------- toolbar ---------- */\n  .toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}\n  .tabs{display:flex;gap:0;border:1.5px solid var(--line);border-radius:9px;overflow:hidden;background:var(--card)}\n  .tabs button{\n    font:inherit;font-size:13px;font-weight:800;cursor:pointer;border:0;background:transparent;\n    padding:7px 14px;color:var(--ink-soft);\n  }\n  .tabs button.on{background:var(--ink);color:var(--paper)}\n  .hint{font-size:12px;color:var(--ink-soft)}\n\n  /* ---------- list ---------- */\n  .list{display:flex;flex-direction:column;gap:13px}\n  .card{\n    background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius);\n    padding:14px 15px;animation:in .34s backwards;\n    transition:box-shadow .14s,transform .14s;\n  }\n  .card:hover{box-shadow:3px 3px 0 rgba(22,21,15,.14)}\n  @keyframes in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}\n\n  .card-top{display:flex;gap:11px;align-items:flex-start}\n  .rank{\n    flex:0 0 26px;height:26px;border-radius:7px;background:var(--accent-soft);\n    color:#a8340f;font-weight:900;font-size:13px;display:grid;place-items:center;\n    font-variant-numeric:tabular-nums;margin-top:2px;\n  }\n  .card:nth-child(1) .rank{background:var(--accent);color:#fff}\n  .text{flex:1;min-width:0;font-size:15.5px;font-weight:600;word-break:break-word}\n  .meta{display:flex;gap:8px;align-items:center;margin-top:5px;font-size:11.5px;color:var(--ink-soft);flex-wrap:wrap}\n  .meta .pill{background:#f0ece1;padding:1px 7px;border-radius:99px;font-weight:700;color:#6b6453}\n  .del{\n    border:0;background:transparent;cursor:pointer;color:#bdb5a2;font-size:15px;\n    padding:2px 4px;border-radius:5px;line-height:1;opacity:0;transition:opacity .15s,color .15s\n  }\n  .card:hover .del,.card:focus-within .del{opacity:1}\n  .del:hover{color:var(--accent);background:var(--accent-soft)}\n\n  .actions{display:flex;gap:8px;margin-top:11px;padding-left:37px;flex-wrap:wrap}\n  .act{\n    display:inline-flex;align-items:center;gap:5px;\n    font:inherit;font-size:12.5px;font-weight:800;cursor:pointer;\n    border:1.5px solid var(--line);background:#fff;color:var(--ink);\n    padding:5px 11px;border-radius:99px;transition:all .12s;\n  }\n  .act:hover{background:#f7f4ec}\n  .act.voted{background:var(--accent);color:#fff;border-color:var(--accent)}\n  .act .num{font-variant-numeric:tabular-nums;opacity:.85}\n  .act.pop{animation:pop .3s}\n  @keyframes pop{40%{transform:scale(1.12)}}\n\n  /* comments */\n  .drawer{display:none;margin:11px 0 0 37px;border-left:2px dashed #ddd6c5;padding-left:12px}\n  .drawer.open{display:block;animation:in .22s}\n  .cm{font-size:13.5px;padding:5px 0;color:#3b372d;word-break:break-word}\n  .cm b{color:var(--accent);font-weight:800}\n  .cm .t{font-size:11px;color:#a8a292;margin-left:6px}\n  .cbox{display:flex;gap:7px;margin-top:7px}\n  .cbox input{\n    flex:1;min-width:0;font:inherit;font-size:13px;padding:7px 10px;\n    border:1.5px solid #ddd6c5;border-radius:8px;background:#fff;color:var(--ink);\n  }\n  .cbox input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft)}\n  .cbox button{\n    font:inherit;font-size:12.5px;font-weight:800;cursor:pointer;\n    border:1.5px solid var(--line);background:var(--ink);color:var(--paper);\n    padding:7px 12px;border-radius:8px;\n  }\n  .cbox button:hover{background:#000}\n\n  .empty{\n    text-align:center;padding:34px 16px;color:var(--ink-soft);font-size:14px;\n    border:1.5px dashed #cfc7b4;border-radius:var(--radius);background:rgba(255,253,247,.6)\n  }\n  .empty b{display:block;font-size:24px;margin-bottom:6px}\n\n  footer{margin-top:34px;text-align:center;font-size:12.5px;color:var(--ink-soft);line-height:1.9}\n  footer .sig{font-weight:800;color:var(--ink)}\n  footer code{background:#eae5d8;padding:1px 5px;border-radius:4px;font-size:11.5px}\n\n  /* toast */\n  #toast{\n    position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);\n    background:var(--ink);color:var(--paper);font-size:13.5px;font-weight:700;\n    padding:10px 18px;border-radius:99px;opacity:0;pointer-events:none;\n    transition:all .24s;z-index:99;max-width:88vw;text-align:center;\n  }\n  #toast.show{opacity:1;transform:translate(-50%,0)}\n\n  @media(max-width:520px){\n    .actions,.drawer{padding-left:0;margin-left:0}\n    .drawer{border-left:0;padding-left:0}\n    .row{flex-direction:column}\n    .btn{width:100%}\n  }\n";
document.head.appendChild(style);
document.getElementById("app").innerHTML = "\n<div class=\"wrap\">\n\n  <div class=\"kicker\"><span class=\"dot\"></span>1024 · 鸽王榜</div>\n  <h1>今天你<em>又鸽了</em>哪件事？</h1>\n  <p class=\"sub\">\n    把「本来今天必须做、但没做」的事摆上台面，让大家<b>附议</b>、让大家<b>吐槽</b>。\n    一个人鸽是懒，一群人鸽，就是<b>时代症候</b>。\n  </p>\n\n  <div class=\"stats\">\n    <div class=\"stat\"><b id=\"s1\">0</b><span>今日鸽单</span></div>\n    <div class=\"stat\"><b id=\"s2\">0</b><span>总附议</span></div>\n    <div class=\"stat\"><b id=\"s3\">0</b><span>条吐槽</span></div>\n    <div class=\"stat\"><b id=\"s4\">0</b><span>你附议过</span></div>\n  </div>\n\n  <div class=\"composer\">\n    <label for=\"itemInput\">今天我又没做…</label>\n    <div class=\"row\">\n      <input id=\"itemInput\" maxlength=\"60\" placeholder=\"比如：说好的 11 点睡觉，现在是 2:47\" autocomplete=\"off\">\n      <button class=\"btn\" id=\"addBtn\">挂上去 →</button>\n    </div>\n    <div class=\"tags\" id=\"tagRow\">\n      <button class=\"tag on\" data-tag=\"作息\">作息</button>\n      <button class=\"tag\" data-tag=\"运动\">运动</button>\n      <button class=\"tag\" data-tag=\"工作\">工作</button>\n      <button class=\"tag\" data-tag=\"学习\">学习</button>\n      <button class=\"tag\" data-tag=\"生活\">生活</button>\n    </div>\n  </div>\n\n  <div class=\"toolbar\">\n    <div class=\"tabs\" id=\"tabs\">\n      <button class=\"on\" data-sort=\"hot\">🔥 鸽王榜</button>\n      <button data-sort=\"new\">🕐 最新</button>\n    </div>\n    <div class=\"hint\" id=\"hint\">按附议数排序</div>\n  </div>\n\n  <div class=\"list\" id=\"list\"></div>\n\n  <footer>\n    <div class=\"sig\">鸽王榜 · 1024 每日必做投票器</div>\n    <div>数据只存在你自己的浏览器里（<code>localStorage</code>），关掉网页也还在。</div>\n    <div>鸽不是失败，鸽是<b>诚实</b>。</div>\n  </footer>\n</div>\n\n<div id=\"toast\"></div>\n\n";

(function(){
  "use strict";

  var KEY = "pigeon1024.v2";
  var EL = {
    list: document.getElementById("list"),
    input: document.getElementById("itemInput"),
    addBtn: document.getElementById("addBtn"),
    tagRow: document.getElementById("tagRow"),
    tabs: document.getElementById("tabs"),
    hint: document.getElementById("hint"),
    toast: document.getElementById("toast")
  };

  var curTag = "作息";
  var sortBy = "hot";
  var state = { items: [], myVotes: {} };

  /* ---------------- 种子数据 ---------------- */
  function seed(){
    var now = Date.now();
    var raw = [
      ["说好 11 点睡觉，现在是 2:47", "作息", 41, ["这台机器已经连续三天这样了", "11 点指的是 11 点开始刷手机吧"]],
      ["今天的日报还没写，打算拖到 23:59", "工作", 33, ["我一般 23:58，比你狠", "写日报的时间比写代码长"]],
      ["《代码整洁之道》停在第 12 页，已经停了三周", "学习", 27, ["第 12 页是天然结界", "书是好书，我是好人，就是不合适"]],
      ["喝够 8 杯水 · 实际 4 杯冰美式", "生活", 22, ["水是生命之源，咖啡是续命之源", "肾在打问号"]],
      ["说好的每天运动 30 分钟，今天的运动是伸手关闹钟", "运动", 19, ["我就是关闹钟这门艺术的大师", "起身去拿外卖也算，别慌"]],
      ["给爸妈打个电话（已推迟 4 天）", "生活", 15, ["这句最扎心", "现在打，别等了"]],
      ["看完的教程有 17 个，跑通的 demo 有 0 个", "学习", 12, ["收藏夹是我的第二大脑", "学完等于做过，这不叫鸽"]]
    ];
    var out = [];
    for (var i = 0; i < raw.length; i++){
      var r = raw[i], cs = [];
      for (var j = 0; j < r[3].length; j++){
        cs.push({ id: "sc" + i + j, text: r[3][j], ts: now - (j + 1) * 900000 - i * 3e6 });
      }
      out.push({
        id: "seed" + i,
        text: r[0],
        tag: r[1],
        votes: r[2],
        ts: now - (i + 1) * 1800000,
        comments: cs,
        mine: false
      });
    }
    return out;
  }

  /* ---------------- 存取 ---------------- */
  function load(){
    var ok = false;
    try{
      var s = localStorage.getItem(KEY);
      if (s){
        var d = JSON.parse(s);
        if (d && Array.isArray(d.items)){
          state.items = d.items;
          state.myVotes = d.myVotes || {};
          ok = true;
        }
      }
    }catch(e){ /* 隐私模式 / 坏数据 → 回落到种子 */ }
    if (!ok) state.items = seed();
  }
  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){}
  }

  /* ---------------- 工具 ---------------- */
  function esc(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c];
    });
  }
  function ago(ts){
    var d = (Date.now() - ts) / 1000;
    if (d < 60) return "刚刚";
    if (d < 3600) return Math.floor(d / 60) + " 分钟前";
    if (d < 86400) return Math.floor(d / 3600) + " 小时前";
    var dt = new Date(ts);
    return (dt.getMonth() + 1) + " 月 " + dt.getDate() + " 日";
  }
  var tmr = null;
  function toast(msg){
    EL.toast.textContent = msg;
    EL.toast.classList.add("show");
    clearTimeout(tmr);
    tmr = setTimeout(function(){ EL.toast.classList.remove("show"); }, 1900);
  }
  function norm(s){ return String(s).replace(/\s+/g, "").replace(/[，。！？、；：""''（）()【】\-—…~·]/g, ""); }

  /* ---------------- 渲染 ---------------- */
  function sorted(){
    var a = state.items.slice();
    if (sortBy === "hot"){
      a.sort(function(x, y){
        if (y.votes !== x.votes) return y.votes - x.votes;
        return y.ts - x.ts;
      });
    } else {
      a.sort(function(x, y){ return y.ts - x.ts; });
    }
    return a;
  }

  function render(){
    var items = sorted();
    var html = "";
    if (!items.length){
      html = '<div class="empty"><b>🐦</b>还没有人承认自己鸽了。<br>做第一个诚实的人。</div>';
    }
    for (var i = 0; i < items.length; i++){
      var it = items[i], voted = !!state.myVotes[it.id];
      html += '<div class="card" data-id="' + it.id + '" style="animation-delay:' + Math.min(i, 8) * 26 + 'ms">'
        + '<div class="card-top">'
        +   '<div class="rank">' + (i + 1) + '</div>'
        +   '<div class="text">' + esc(it.text)
        +     '<div class="meta">'
        +       '<span class="pill">' + esc(it.tag) + '</span>'
        +       '<span>' + ago(it.ts) + '</span>'
        +     '</div>'
        +   '</div>'
        +   (it.mine ? '<button class="del" data-act="del" title="删掉这条">&times;</button>' : '')
        + '</div>'
        + '<div class="actions">'
        +   '<button class="act ' + (voted ? 'voted' : '') + '" data-act="vote">'
        +     (voted ? '✓ 已附议' : '+ 附议') + ' <span class="num">' + it.votes + '</span>'
        +   '</button>'
        +   '<button class="act" data-act="cm">💬 吐槽 <span class="num">' + it.comments.length + '</span></button>'
        + '</div>'
        + '<div class="drawer" data-drawer>'
        +   (it.comments.length
              ? it.comments.map(function(c){
                  return '<div class="cm">' + esc(c.text) + '<span class="t">' + ago(c.ts) + '</span></div>';
                }).join("")
              : '<div class="cm" style="color:#a8a292">还没有人吐槽，来第一刀。</div>')
        +   '<div class="cbox">'
        +     '<input maxlength="50" placeholder="吐一句…（回车发送）" data-cinput>'
        +     '<button data-act="sendcm">发送</button>'
        +   '</div>'
        + '</div>'
        + '</div>';
    }
    EL.list.innerHTML = html;
    stats();
  }

  function stats(){
    var v = 0, c = 0;
    for (var i = 0; i < state.items.length; i++){
      v += state.items[i].votes;
      c += state.items[i].comments.length;
    }
    document.getElementById("s1").textContent = state.items.length;
    document.getElementById("s2").textContent = v;
    document.getElementById("s3").textContent = c;
    document.getElementById("s4").textContent = Object.keys(state.myVotes).length;
    EL.hint.textContent = sortBy === "hot" ? "按附议数排序" : "按发布时间排序";
  }

  /* ---------------- 业务 ---------------- */
  function add(){
    var t = EL.input.value.trim();
    if (!t){
      EL.input.classList.remove("shake");
      void EL.input.offsetWidth;
      EL.input.classList.add("shake");
      toast("空着就想挂上去？先把事说清楚");
      EL.input.focus();
      return;
    }
    if (t.length < 4){
      toast("太短了，说清楚点，别人才好附议");
      return;
    }
    var n = norm(t);
    for (var i = 0; i < state.items.length; i++){
      var a = norm(state.items[i].text);
      if (a === n || (a.length > 6 && n.length > 6 && (a.indexOf(n) > -1 || n.indexOf(a) > -1))){
        toast("这条已经有人鸽过了 → 去附议它");
        focusItem(state.items[i].id);
        return;
      }
    }
    var it = {
      id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: t, tag: curTag, votes: 1, ts: Date.now(),
      comments: [{ id: "c" + Date.now(), text: "我先附议我自己。", ts: Date.now() }],
      mine: true
    };
    state.items.push(it);
    state.myVotes[it.id] = true;
    save();
    EL.input.value = "";
    sortBy = "new";
    setSortUI();
    render();
    focusItem(it.id);
    toast("挂上去了，等着被附议吧");
  }

  function focusItem(id){
    var el = EL.list.querySelector('[data-id="' + id + '"]');
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.style.boxShadow = "4px 4px 0 var(--accent)";
    setTimeout(function(){ el.style.boxShadow = ""; }, 1200);
  }

  function find(id){
    for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) return state.items[i];
    return null;
  }

  function vote(card){
    var it = find(card.getAttribute("data-id"));
    if (!it) return;
    var btn = card.querySelector('[data-act="vote"]');
    if (state.myVotes[it.id]){
      delete state.myVotes[it.id];
      it.votes = Math.max(0, it.votes - 1);
    } else {
      state.myVotes[it.id] = true;
      it.votes += 1;
    }
    save();
    var pos = card.querySelector(".rank").textContent;
    render();
    var back = EL.list.querySelector('[data-id="' + it.id + '"]');
    if (back){
      var b = back.querySelector('[data-act="vote"]');
      if (b){ b.classList.add("pop"); setTimeout(function(){ b.classList.remove("pop"); }, 320); }
    }
  }

  function sendComment(card){
    var it = find(card.getAttribute("data-id"));
    var input = card.querySelector("[data-cinput]");
    if (!it || !input) return;
    var t = input.value.trim();
    if (!t){ toast("吐一句再发"); input.focus(); return; }
    it.comments.push({ id: "c" + Date.now(), text: t, ts: Date.now() });
    save();
    render();
    var back = EL.list.querySelector('[data-id="' + it.id + '"]');
    if (back){
      back.querySelector("[data-drawer]").classList.add("open");
      var ni = back.querySelector("[data-cinput]");
      if (ni) ni.focus();
    }
  }

  function del(card){
    var id = card.getAttribute("data-id");
    var it = find(id);
    if (!it) return;
    if (!confirm("删掉「" + it.text + "」？附议和吐槽会一起没。")) return;
    state.items = state.items.filter(function(x){ return x.id !== id; });
    delete state.myVotes[id];
    save(); render();
    toast("删了。当没鸽过。");
  }

  function setSortUI(){
    var bs = EL.tabs.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++){
      bs[i].classList.toggle("on", bs[i].getAttribute("data-sort") === sortBy);
    }
  }

  /* ---------------- 事件 ---------------- */
  EL.addBtn.addEventListener("click", add);
  EL.input.addEventListener("keydown", function(e){
    if (e.key === "Enter"){ e.preventDefault(); add(); }
  });

  EL.tagRow.addEventListener("click", function(e){
    var b = e.target.closest(".tag");
    if (!b) return;
    curTag = b.getAttribute("data-tag");
    var all = EL.tagRow.querySelectorAll(".tag");
    for (var i = 0; i < all.length; i++) all[i].classList.toggle("on", all[i] === b);
  });

  EL.tabs.addEventListener("click", function(e){
    var b = e.target.closest("button[data-sort]");
    if (!b) return;
    sortBy = b.getAttribute("data-sort");
    setSortUI(); render();
  });

  EL.list.addEventListener("click", function(e){
    var card = e.target.closest(".card");
    if (!card) return;
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var act = btn.getAttribute("data-act");
    if (act === "vote") vote(card);
    else if (act === "cm") card.querySelector("[data-drawer]").classList.toggle("open");
    else if (act === "sendcm") sendComment(card);
    else if (act === "del") del(card);
  });

  EL.list.addEventListener("keydown", function(e){
    if (e.key !== "Enter") return;
    if (!e.target.hasAttribute("data-cinput")) return;
    e.preventDefault();
    var card = e.target.closest(".card");
    if (card) sendComment(card);
  });

  load(); render();
})();
