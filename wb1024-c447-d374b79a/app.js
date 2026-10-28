
(function(){
  "use strict";

  var CITIES = [
    {n:"北京", tz:"Asia/Shanghai"},
    {n:"香港", tz:"Asia/Hong_Kong"},
    {n:"台北", tz:"Asia/Taipei"},
    {n:"东京", tz:"Asia/Tokyo"},
    {n:"首尔", tz:"Asia/Seoul"},
    {n:"新加坡", tz:"Asia/Singapore"},
    {n:"曼谷", tz:"Asia/Bangkok"},
    {n:"雅加达", tz:"Asia/Jakarta"},
    {n:"新德里", tz:"Asia/Kolkata"},
    {n:"迪拜", tz:"Asia/Dubai"},
    {n:"莫斯科", tz:"Europe/Moscow"},
    {n:"伊斯坦布尔", tz:"Europe/Istanbul"},
    {n:"柏林", tz:"Europe/Berlin"},
    {n:"巴黎", tz:"Europe/Paris"},
    {n:"伦敦", tz:"Europe/London"},
    {n:"里斯本", tz:"Europe/Lisbon"},
    {n:"雷克雅未克", tz:"Atlantic/Reykjavik"},
    {n:"开罗", tz:"Africa/Cairo"},
    {n:"内罗毕", tz:"Africa/Nairobi"},
    {n:"约翰内斯堡", tz:"Africa/Johannesburg"},
    {n:"圣保罗", tz:"America/Sao_Paulo"},
    {n:"布宜诺斯艾利斯", tz:"America/Argentina/Buenos_Aires"},
    {n:"纽约", tz:"America/New_York"},
    {n:"多伦多", tz:"America/Toronto"},
    {n:"芝加哥", tz:"America/Chicago"},
    {n:"丹佛", tz:"America/Denver"},
    {n:"洛杉矶", tz:"America/Los_Angeles"},
    {n:"温哥华", tz:"America/Vancouver"},
    {n:"墨西哥城", tz:"America/Mexico_City"},
    {n:"悉尼", tz:"Australia/Sydney"},
    {n:"墨尔本", tz:"Australia/Melbourne"},
    {n:"奥克兰", tz:"Pacific/Auckland"},
    {n:"檀香山", tz:"Pacific/Honolulu"}
  ];

  var WD = ["周日","周一","周二","周三","周四","周五","周六"];
  var dz = "Asia/Shanghai";
  try { dz = Intl.DateTimeFormat().resolvedOptions().timeZone || dz; } catch(e){}

  var state = {
    date: "",
    start: 9,
    end: 18,
    cities: [],
    sel: null
  };

  function pad(n){ return n < 10 ? "0" + n : "" + n; }

  function todayStr(){
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate());
  }

  function partsIn(instant, tz){
    var fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hour12: false,
      year:"numeric", month:"2-digit", day:"2-digit",
      hour:"2-digit", minute:"2-digit", weekday:"short"
    });
    var p = {}, arr = fmt.formatToParts(instant);
    for (var i = 0; i < arr.length; i++) p[arr[i].type] = arr[i].value;
    var H = parseInt(p.hour, 10);
    if (H === 24) H = 0;
    var wdMap = {Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6};
    return {
      y: parseInt(p.year,10), m: parseInt(p.month,10), d: parseInt(p.day,10),
      H: H, M: parseInt(p.minute,10), wd: wdMap[p.weekday]
    };
  }

  function offsetMinutes(instant, tz){
    var p = partsIn(instant, tz);
    var asUTC = Date.UTC(p.y, p.m - 1, p.d, p.H, p.M);
    var base = Math.floor(instant.getTime() / 60000) * 60000;
    return Math.round((asUTC - base) / 60000);
  }

  function offsetLabel(min){
    var sign = min < 0 ? "-" : "+";
    var a = Math.abs(min);
    var h = Math.floor(a / 60), m = a % 60;
    return "UTC" + sign + h + (m ? ":" + pad(m) : "");
  }

  function parseDate(str){
    var a = (str || todayStr()).split("-");
    return { y: parseInt(a[0],10), m: parseInt(a[1],10), d: parseInt(a[2],10) };
  }

  function statusOf(hour, start, end){
    if (hour >= start && hour < end) return 2;
    if ((hour >= start - 2 && hour < start) || (hour >= end && hour < end + 2)) return 1;
    return 0;
  }

  function dayDiff(base, p){
    var a = Date.UTC(base.y, base.m - 1, base.d) / 86400000;
    var b = Date.UTC(p.y, p.m - 1, p.d) / 86400000;
    return Math.round(b - a);
  }

  function computeSlot(h){
    var base = parseDate(state.date);
    var inst = new Date(base.y, base.m - 1, base.d, h, 0, 0, 0);
    var rows = [];
    for (var i = 0; i < state.cities.length; i++){
      var c = state.cities[i];
      var p = partsIn(inst, c.tz);
      var diff = dayDiff(base, p);
      rows.push({
        city: c,
        h: p.H, m: p.M, wd: p.wd, diff: diff,
        st: statusOf(p.H, state.start, state.end),
        off: offsetMinutes(inst, c.tz)
      });
    }
    var score = 0, dev = 0, full = 0, half = 0, bad = 0, baseSt = 9;
    for (var j = 0; j < rows.length; j++){
      var w = (j === 0 ? 2 : 1);              // 第一个城市＝你自己，权重加倍
      score += rows[j].st * w;
      if (rows[j].st === 2) full++;
      else if (rows[j].st === 1) half++;
      else bad++;
      if (j === 0) baseSt = rows[j].st;
      dev += w * Math.abs(((rows[j].h + rows[j].m / 60) - (state.start + state.end) / 2));
    }
    return { hour: h, inst: inst, rows: rows, score: score, dev: dev,
             full: full, half: half, bad: bad, baseSt: baseSt,
             minSt: rows.reduce(function(a,r){ return Math.min(a, r.st); }, 9) };
  }

  function allSlots(){
    var out = [];
    for (var h = 0; h < 24; h++) out.push(computeSlot(h));
    return out;
  }

  function bestSlots(slots, n){
    var arr = slots.slice().sort(function(a,b){
      if (b.minSt !== a.minSt) return b.minSt - a.minSt;
      if (b.baseSt !== a.baseSt) return b.baseSt - a.baseSt;
      if (b.score !== a.score) return b.score - a.score;
      if (a.dev !== b.dev) return a.dev - b.dev;
      return a.hour - b.hour;
    });
    return arr.slice(0, n);
  }

  function label(localHour){
    return pad(localHour) + ":00";
  }

  function renderBoard(slots){
    var tb = document.getElementById("tbody");
    tb.innerHTML = "";
    for (var i = 0; i < state.cities.length; i++){
      var c = state.cities[i];
      var tr = document.createElement("tr");

      var td0 = document.createElement("td");
      td0.className = "citycol";
      var nowP = partsIn(new Date(), c.tz);
      td0.innerHTML =
        '<div class="cityname"><span class="dot"></span><strong>' + c.n + '</strong></div>' +
        '<div class="cmeta"><span>' + offsetLabel(offsetMinutes(new Date(), c.tz)) + '</span>' +
        '<span>·</span><span>现在 ' + pad(nowP.H) + ':' + pad(nowP.M) + '</span>' +
        '<button class="del" title="移除" data-del="' + c.tz + '">×</button></div>';
      tr.appendChild(td0);

      for (var h = 0; h < 24; h++){
        var cell = slots[h].rows[i];
        var td = document.createElement("td");
        td.className = "cellwrap";
        var div = document.createElement("div");
        div.className = "cell s" + cell.st + (state.sel === h ? " sel" : "");
        div.dataset.hour = h;
        var dayTag = "";
        if (cell.diff === 1) dayTag = '<span class="day">+1</span>';
        else if (cell.diff === -1) dayTag = '<span class="day">−1</span>';
        div.innerHTML = '<span>' + pad(cell.h) + ":" + pad(cell.m) + '</span>' + dayTag;
        td.appendChild(div);
        tr.appendChild(td);
      }
      tb.appendChild(tr);
    }

    var ths = document.querySelectorAll("thead th.hour");
    var base = parseDate(state.date);
    var nowBase = partsIn(new Date(), dz);
    var isToday = (nowBase.y === base.y && nowBase.m === base.m && nowBase.d === base.d);
    for (var k = 0; k < ths.length; k++){
      var hh = parseInt(ths[k].getAttribute("data-h"), 10);
      ths[k].className = "hour" + (state.sel === hh ? " sel" : "") + (isToday && nowBase.H === hh ? " now" : "");
      ths[k].textContent = pad(hh);
    }
  }

  function renderReco(slots){
    var top = bestSlots(slots, 3);
    var best = top[0];
    var main = document.getElementById("recoMain");
    var base = parseDate(state.date);
    var dObj = new Date(base.y, base.m - 1, base.d);
    var dateTxt = (base.m) + "月" + base.d + "日 " + WD[dObj.getDay()];

    if (!best){ main.textContent = "—"; return; }

    var desc;
    if (best.bad === 0 && best.half === 0) desc = "全员都在工作时段 🎉";
    else if (best.bad === 0) desc = best.half + " 人需稍微提前或延后一点";
    else desc = best.bad + " 人要在非工作时段上线";

    main.innerHTML = dateTxt + ' · <em>' + pad(best.hour) + ':00</em>' +
      '<span style="font-size:12px;color:#8d9bb3;margin-left:6px">（' + dz.replace(/_/g," ") + '）</span>' +
      '　<span style="font-size:13px;color:#9fe8dc">' + desc + '</span>';

    var chips = document.getElementById("chips");
    chips.innerHTML = "";
    for (var i = 0; i < top.length; i++){
      var s = top[i];
      var b = document.createElement("button");
      b.className = "chip" + (state.sel === s.hour ? " on" : "");
      b.innerHTML = pad(s.hour) + ':00 <span class="s">' + s.full + "/" + state.cities.length + '</span>';
      b.dataset.hour = s.hour;
      chips.appendChild(b);
    }
  }

  function renderDetail(slots){
    var grid = document.getElementById("dgrid");
    var title = document.getElementById("detailTitle");
    grid.innerHTML = "";
    if (state.sel === null){ title.textContent = "选中一个时段，查看各地详情"; return; }
    var slot = slots[state.sel];
    var base = parseDate(state.date);
    var dObj = new Date(base.y, base.m - 1, base.d);
    var dayTxt = base.m + "月" + base.d + "日";
    title.textContent = "北京时间 " + pad(slot.hour) + ":00（" + dayTxt + " " + WD[dObj.getDay()] + "）各地情况";

    for (var i = 0; i < slot.rows.length; i++){
      var r = slot.rows[i];
      var card = document.createElement("div");
      card.className = "dcard";
      var tag, hint;
      if (r.st === 2){ tag = '<span class="tag good">工作时段</span>'; hint = "正常开会即可"; }
      else if (r.st === 1){ tag = '<span class="tag ok">勉强可接受</span>'; hint = (r.h < state.start ? "需要早起" : "需要晚一点下班"); }
      else { tag = '<span class="tag bad">非工作时段</span>'; hint = (r.h >= 22 || r.h < 6 ? "深夜，尽量避开" : "休息时间，需要商量"); }
      var dayNote = r.diff === 1 ? "（次日）" : (r.diff === -1 ? "（前一日）" : "");
      card.innerHTML =
        '<div class="n"><span>' + r.city.n + '</span>' + tag + '</div>' +
        '<div class="t">' + pad(r.h) + ":" + pad(r.m) + '</div>' +
        '<div class="cmeta">' + WD[r.wd] + dayNote + " · " + offsetLabel(r.off) + '</div>' +
        '<div class="hint">' + hint + '</div>';
      grid.appendChild(card);
    }
  }

  function copyText(slots){
    var slot = slots[state.sel === null ? bestSlots(slots,1)[0].hour : state.sel];
    var base = parseDate(state.date);
    var dObj = new Date(base.y, base.m - 1, base.d);
    var lines = [];
    lines.push("【会议时间】" + base.m + "月" + base.d + "日（" + WD[dObj.getDay()] + "）");
    for (var i = 0; i < slot.rows.length; i++){
      var r = slot.rows[i];
      var flag = "";
      if (r.st === 0) flag = "  ⚠️ 非工作时段";
      else if (r.st === 1) flag = "  （需调整作息）";
      var dayNote = r.diff === 1 ? " 次日" : (r.diff === -1 ? " 前一日" : "");
      lines.push("· " + r.city.n + "　" + pad(r.h) + ":" + pad(r.m) + dayNote + flag);
    }
    return lines.join("\n");
  }

  function syncURL(){
    var hash = "#d=" + state.date + "&s=" + state.start + "&e=" + state.end +
      "&h=" + (state.sel === null ? "" : state.sel) +
      "&c=" + state.cities.map(function(c){ return c.tz; }).join(",");
    try { history.replaceState(null, "", hash); } catch(e){}
  }

  function readURL(){
    var h = location.hash.replace(/^#/, "");
    if (!h) return false;
    var o = {};
    h.split("&").forEach(function(kv){
      var a = kv.split("=");
      o[a[0]] = decodeURIComponent(a[1] || "");
    });
    if (o.d) state.date = o.d;
    if (o.s) state.start = Math.max(0, Math.min(23, parseInt(o.s,10)));
    if (o.e) state.end = Math.max(1, Math.min(24, parseInt(o.e,10)));
    if (o.c){
      var list = o.c.split(",").filter(Boolean);
      var arr = [];
      list.forEach(function(tz){
        var found = null;
        for (var i = 0; i < CITIES.length; i++) if (CITIES[i].tz === tz) found = CITIES[i];
        if (!found){ try { new Intl.DateTimeFormat("en-US",{timeZone:tz}); found = {n: tz.split("/").pop().replace(/_/g," "), tz: tz}; } catch(e){} }
        if (found) arr.push({n: found.n, tz: found.tz});
      });
      if (arr.length) state.cities = arr;
    }
    if (o.h !== undefined && o.h !== "") state.sel = parseInt(o.h,10);
    return true;
  }

  function toast(msg){
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._t);
    t._t = setTimeout(function(){ t.classList.remove("show"); }, 1900);
  }

  var slotsCache = [];

  function render(){
    slotsCache = allSlots();
    renderBoard(slotsCache);
    renderReco(slotsCache);
    renderDetail(slotsCache);
    syncURL();
  }

  function initPicker(){
    var sel = document.getElementById("picker");
    sel.innerHTML = "";
    for (var i = 0; i < CITIES.length; i++){
      var o = document.createElement("option");
      o.value = CITIES[i].tz;
      o.textContent = CITIES[i].n + "（" + CITIES[i].tz.replace(/_/g," ") + "）";
      sel.appendChild(o);
    }
  }

  function addCity(tz){
    if (!tz) return;
    for (var i = 0; i < state.cities.length; i++) if (state.cities[i].tz === tz){ toast("已经在列表里了"); return; }
    if (state.cities.length >= 8){ toast("最多同时对比 8 个城市"); return; }
    var c = null;
    for (var j = 0; j < CITIES.length; j++) if (CITIES[j].tz === tz) c = CITIES[j];
    if (!c) c = {n: tz.split("/").pop(), tz: tz};
    state.cities.push({n: c.n, tz: c.tz});
    render();
  }

  function removeCity(tz){
    state.cities = state.cities.filter(function(c){ return c.tz !== tz; });
    render();
  }

  document.getElementById("addBtn").addEventListener("click", function(){
    addCity(document.getElementById("picker").value);
  });

  document.getElementById("copyBtn").addEventListener("click", function(){
    var txt = copyText(slotsCache);
    var done = function(){ toast("已复制，直接粘贴给对方就行"); };
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(done, function(){ fallbackCopy(txt, done); });
    } else fallbackCopy(txt, done);
  });

  function fallbackCopy(txt, cb){
    var ta = document.createElement("textarea");
    ta.value = txt;
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); cb(); } catch(e){ toast("复制失败，请手动选择文本"); }
    document.body.removeChild(ta);
  }

  document.getElementById("resetBtn").addEventListener("click", function(){
    state.date = todayStr();
    state.start = 9; state.end = 18;
    state.cities = [
      {n:"北京", tz: dz},
      {n:"伦敦", tz:"Europe/London"},
      {n:"纽约", tz:"America/New_York"},
      {n:"洛杉矶", tz:"America/Los_Angeles"}
    ];
    state.sel = null;
    document.getElementById("date").value = state.date;
    document.getElementById("start").value = state.start;
    document.getElementById("end").value = state.end;
    document.getElementById("tzbadge").textContent = "基准时区 · " + dz.replace(/_/g," ");
    render();
    pickBest();
  });

  document.getElementById("date").addEventListener("change", function(e){
    state.date = e.target.value || todayStr();
    render();
  });
  document.getElementById("start").addEventListener("change", function(e){
    var v = parseInt(e.target.value, 10);
    if (isNaN(v)) v = 9;
    v = Math.max(0, Math.min(23, v));
    e.target.value = v;
    state.start = v;
    if (state.end <= v){ state.end = Math.min(24, v + 1); document.getElementById("end").value = state.end; }
    render();
  });
  document.getElementById("end").addEventListener("change", function(e){
    var v = parseInt(e.target.value, 10);
    if (isNaN(v)) v = 18;
    v = Math.max(1, Math.min(24, v));
    e.target.value = v;
    state.end = v;
    if (state.start >= v){ state.start = Math.max(0, v - 1); document.getElementById("start").value = state.start; }
    render();
  });

  document.addEventListener("click", function(e){
    var cell = e.target.closest ? e.target.closest(".cell") : null;
    if (cell){
      state.sel = parseInt(cell.dataset.hour, 10);
      render();
      return;
    }
    var chip = e.target.closest ? e.target.closest(".chip") : null;
    if (chip && chip.dataset.hour !== undefined){
      state.sel = parseInt(chip.dataset.hour, 10);
      render();
      return;
    }
    var del = e.target.closest ? e.target.closest("[data-del]") : null;
    if (del){
      removeCity(del.getAttribute("data-del"));
    }
  });

  document.addEventListener("keydown", function(e){
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (state.sel === null) state.sel = 0;
    state.sel = (state.sel + (e.key === "ArrowRight" ? 1 : 23)) % 24;
    render();
  });

  function pickBest(){
    var top = bestSlots(allSlots(), 1);
    if (top.length) state.sel = top[0].hour;
  }

  // 启动
  initPicker();
  state.date = todayStr();
  var loaded = readURL();
  if (!state.cities.length){
    state.cities = [
      {n:"北京", tz: dz},
      {n:"伦敦", tz:"Europe/London"},
      {n:"纽约", tz:"America/New_York"},
      {n:"洛杉矶", tz:"America/Los_Angeles"}
    ];
  }
  document.getElementById("date").value = state.date;
  document.getElementById("start").value = state.start;
  document.getElementById("end").value = state.end;
  document.getElementById("tzbadge").textContent = "基准时区 · " + dz.replace(/_/g," ");
  if (!loaded || state.sel === null) pickBest();
  render();
})();
