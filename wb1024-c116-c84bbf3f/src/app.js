
(function () {
  "use strict";

  var KEY = "filament_inventory_v1";
  var memoryOnly = false;
  var items = [];
  var store = null;

  try {
    store = window.localStorage;
    store.setItem("__t", "1");
    store.removeItem("__t");
  } catch (e) {
    memoryOnly = true;
    store = null;
  }

  var PRESET_COLORS = [
    { n: "白色", h: "#f2f2ef" }, { n: "黑色", h: "#1f2328" }, { n: "灰色", h: "#9aa3ad" },
    { n: "红色", h: "#d93b3b" }, { n: "橙色", h: "#e8752a" }, { n: "黄色", h: "#e9c33a" },
    { n: "绿色", h: "#3f9b5c" }, { n: "青色", h: "#3aa8b8" }, { n: "蓝色", h: "#3d6fbf" },
    { n: "紫色", h: "#8360c3" }, { n: "粉色", h: "#e08aa6" }, { n: "透明", h: "#dfe7ee" },
    { n: "金色", h: "#c9a24a" }, { n: "棕色", h: "#8a5a34" }
  ];

  var STATUS_TEXT = { ok: "余量充足", half: "余量偏少", low: "低余量", empty: "已用完" };

  var filters = { q: "", material: "", color: "", status: "", sort: "remain-asc", onlyLow: false };

  function $(id) { return document.getElementById(id); }

  function escapeHtml(v) {
    if (v === null || v === undefined) return "";
    return String(v)
      .split("&").join("&amp;")
      .split("<").join("&lt;")
      .split(">").join("&gt;")
      .split('"').join("&quot;")
      .split("'").join("&#39;");
  }

  // 把 HTML 片段解析为节点后挂载，避免直接写入 innerHTML
  function mount(el, markup) {
    if (!el) return;
    var doc = new DOMParser().parseFromString(String(markup), "text/html");
    var nodes = doc.body ? Array.prototype.slice.call(doc.body.childNodes) : [];
    while (el.firstChild) el.removeChild(el.firstChild);
    for (var i = 0; i < nodes.length; i++) {
      el.appendChild(document.importNode(nodes[i], true));
    }
  }

  function uid() {
    return "sp_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function num(v, dflt) {
    var n = parseFloat(v);
    return isNaN(n) ? dflt : n;
  }

  function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }

  function round1(n) { return Math.round(n * 10) / 10; }

  function fmtG(g) {
    if (g >= 1000) return round1(g / 1000) + " kg";
    return Math.round(g) + " g";
  }

  function fmtDate(ts) {
    if (!ts) return "—";
    var d = new Date(ts);
    if (isNaN(d.getTime())) return "—";
    var p = function (x) { return x < 10 ? "0" + x : "" + x; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  function fmtDateTime(ts) {
    if (!ts) return "—";
    var d = new Date(ts);
    if (isNaN(d.getTime())) return "—";
    var p = function (x) { return x < 10 ? "0" + x : "" + x; };
    return (d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  function statusOf(s) {
    var net = num(s.netWeight, 1000) || 1000;
    var rem = num(s.remaining, 0);
    var th = num(s.threshold, 0);
    if (rem <= 0.5) return "empty";
    if (rem <= th) return "low";
    if (rem / net <= 0.5) return "half";
    return "ok";
  }

  function pctOf(s) {
    var net = num(s.netWeight, 1000) || 1000;
    return clamp(Math.round((num(s.remaining, 0) / net) * 100), 0, 100);
  }

  var METER_COLOR = { ok: "#0e7c6b", half: "#7c8794", low: "#d9922c", empty: "#c9d0da" };

  /* ---------------- seed ---------------- */
  function seedItems() {
    var now = Date.now();
    return [
      { brand: "Bambu Lab", material: "PLA", colorName: "哑光黑", colorHex: "#1f2328", netWeight: 1000, remaining: 640, threshold: 150, diameter: 1.75, location: "架子 A1", price: 129, purchasedAt: "2026-08-12", note: "主力黑，表面细腻", logs: [{ t: now - 86400000 * 2, g: 180, note: "机身外壳" }, { t: now - 86400000 * 9, g: 180, note: "零件批量" }] },
      { brand: "eSUN", material: "PETG", colorName: "透明", colorHex: "#dfe7ee", netWeight: 1000, remaining: 120, threshold: 150, diameter: 1.75, location: "架子 A2", price: 99, purchasedAt: "2026-07-02", note: "韧性好，易拉丝", logs: [{ t: now - 86400000 * 1, g: 220, note: "灯罩" }, { t: now - 86400000 * 6, g: 300, note: "收纳盒" }, { t: now - 86400000 * 20, g: 360, note: "长期打印" }] },
      { brand: "Polymaker", material: "PLA+", colorName: "军绿", colorHex: "#5d6b4a", netWeight: 1000, remaining: 865, threshold: 150, diameter: 1.75, location: "防潮箱", price: 149, purchasedAt: "2026-09-18", note: "新卷，未开封后启用", logs: [{ t: now - 86400000 * 3, g: 135, note: "手办底座" }] },
      { brand: "SUNLU", material: "TPU", colorName: "黑色", colorHex: "#232629", netWeight: 500, remaining: 60, threshold: 80, diameter: 1.75, location: "抽屉 B1", price: 118, purchasedAt: "2026-05-21", note: "软胶，打印速度要慢", logs: [{ t: now - 86400000 * 5, g: 140, note: "防滑垫" }, { t: now - 86400000 * 12, g: 300, note: "手机壳" }] },
      { brand: "三绿 Sunlu", material: "ABS", colorName: "白色", colorHex: "#f2f2ef", netWeight: 1000, remaining: 0, threshold: 150, diameter: 1.75, location: "抽屉 B1", price: 79, purchasedAt: "2026-03-14", note: "已用完，需补货", logs: [{ t: now - 86400000 * 30, g: 1000, note: "累计用完" }] },
      { brand: "Bambu Lab", material: "PETG", colorName: "哑光白", colorHex: "#f4f3ee", netWeight: 1000, remaining: 520, threshold: 150, diameter: 1.75, location: "架子 A1", price: 139, purchasedAt: "2026-09-30", note: "", logs: [{ t: now - 86400000 * 4, g: 480, note: "支架 + 线夹" }] },
      { brand: "彩格", material: "PLA", colorName: "荧光橙", colorHex: "#f07422", netWeight: 1000, remaining: 910, threshold: 150, diameter: 1.75, location: "架子 A2", price: 69, purchasedAt: "2026-10-06", note: "颜色鲜艳，适合玩具件", logs: [] },
      { brand: "Creality", material: "ASA", colorName: "灰色", colorHex: "#8e959d", netWeight: 1000, remaining: 285, threshold: 200, diameter: 1.75, location: "防潮箱", price: 168, purchasedAt: "2026-06-11", note: "户外件用，耐候", logs: [{ t: now - 86400000 * 8, g: 415, note: "户外支架" }] }
    ].map(function (s, i) {
      var base = {
        id: uid() + i, brand: s.brand, material: s.material, colorName: s.colorName,
        colorHex: s.colorHex, diameter: s.diameter, netWeight: s.netWeight, remaining: s.remaining,
        threshold: s.threshold, location: s.location, price: s.price,
        purchasedAt: s.purchasedAt, note: s.note, logs: s.logs || [],
        createdAt: now - 86400000 * (20 - i), updatedAt: now - 86400000 * (i + 1)
      };
      return base;
    });
  }

  function normalize(s) {
    return {
      id: s.id || uid(),
      brand: String(s.brand || "").slice(0, 40),
      material: String(s.material || "PLA").slice(0, 24),
      colorName: String(s.colorName || "未命名").slice(0, 24),
      colorHex: /^#[0-9a-fA-F]{6}$/.test(String(s.colorHex || "")) ? String(s.colorHex) : "#9aa3ad",
      diameter: num(s.diameter, 1.75),
      netWeight: clamp(num(s.netWeight, 1000), 1, 100000),
      remaining: clamp(num(s.remaining, 0), 0, 100000),
      threshold: clamp(num(s.threshold, 150), 0, 100000),
      location: String(s.location || "").slice(0, 40),
      price: clamp(num(s.price, 0), 0, 1000000),
      purchasedAt: String(s.purchasedAt || "").slice(0, 10),
      note: String(s.note || "").slice(0, 300),
      logs: Array.isArray(s.logs) ? s.logs.map(function (l) {
        return { t: num(l.t, Date.now()), g: num(l.g, 0), note: String(l.note || "").slice(0, 120), type: l.type === "refill" ? "refill" : (l.type === "set" ? "set" : "use") };
      }).slice(0, 300) : [],
      createdAt: num(s.createdAt, Date.now()),
      updatedAt: num(s.updatedAt, Date.now())
    };
  }

  /* ---------------- persistence ---------------- */
  function load() {
    var raw = null;
    try { raw = store ? store.getItem(KEY) : null; } catch (e) { raw = null; }
    if (!raw) {
      items = seedItems();
      persist();
      return;
    }
    try {
      var parsed = JSON.parse(raw);
      var arr = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.items) ? parsed.items : []);
      items = arr.map(normalize);
    } catch (e) {
      items = seedItems();
    }
  }

  function persist() {
    if (!store) return;
    try {
      store.setItem(KEY, JSON.stringify({ v: 1, savedAt: Date.now(), items: items }));
    } catch (e) {
      toast("保存失败：浏览器存储空间不足或被禁用，请先导出备份");
    }
  }

  /* ---------------- toast ---------------- */
  var toastTimer = null;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("on");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("on"); }, 2400);
  }

  /* ---------------- filtering ---------------- */
  function filtered() {
    var q = filters.q.trim().toLowerCase();
    var arr = items.filter(function (s) {
      if (filters.material && s.material !== filters.material) return false;
      if (filters.color && s.colorName !== filters.color) return false;
      if (filters.status && statusOf(s) !== filters.status) return false;
      if (filters.onlyLow && !(statusOf(s) === "low" || statusOf(s) === "empty")) return false;
      if (q) {
        var hay = [s.brand, s.material, s.colorName, s.location, s.note].join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    var sort = filters.sort;
    arr.sort(function (a, b) {
      if (sort === "remain-asc") return num(a.remaining, 0) - num(b.remaining, 0);
      if (sort === "remain-desc") return num(b.remaining, 0) - num(a.remaining, 0);
      if (sort === "updated-desc") return num(b.updatedAt, 0) - num(a.updatedAt, 0);
      if (sort === "purchased-desc") return String(b.purchasedAt || "").localeCompare(String(a.purchasedAt || ""));
      if (sort === "material-asc") return String(a.material).localeCompare(String(b.material), "zh");
      if (sort === "brand-asc") return String(a.brand).localeCompare(String(b.brand), "zh");
      return 0;
    });
    return arr;
  }

  /* ---------------- render: stats ---------------- */
  function renderStats() {
    var total = items.length;
    var used = 0, emptyCount = 0, lowCount = 0, rem = 0, net = 0, value = 0;
    items.forEach(function (s) {
      var st = statusOf(s);
      if (st === "empty") emptyCount++;
      if (st === "low") lowCount++;
      if (st !== "empty") used++;
      rem += num(s.remaining, 0);
      net += num(s.netWeight, 0);
      var r = num(s.netWeight, 0) > 0 ? num(s.remaining, 0) / num(s.netWeight, 0) : 0;
      value += num(s.price, 0) * clamp(r, 0, 1);
    });
    mount($("statSpools"), total + '<small>卷</small>');
    $("statSpoolsSub").textContent = "在用 " + used + " · 已用完 " + emptyCount;
    mount($("statWeight"), round1(rem / 1000) + '<small>kg</small>');
    $("statWeightSub").textContent = "合计净重 " + round1(net / 1000) + " kg";
    mount($("statLow"), lowCount + '<small>卷</small>');
    $("statLowSub").textContent = lowCount ? "低于安全阈值，建议补货" : "暂无低于阈值的耗材";
    $("statValue").textContent = "¥" + Math.round(value);

    var bar = $("alertBar");
    var lowNames = items.filter(function (s) { return statusOf(s) === "low"; });
    var deadNames = items.filter(function (s) { return statusOf(s) === "empty"; });
    if (lowNames.length || deadNames.length) {
      var parts = [];
      if (lowNames.length) parts.push(lowNames.length + " 卷低于安全余量");
      if (deadNames.length) parts.push(deadNames.length + " 卷已用完");
      $("alertText").textContent = parts.join("、");
      bar.hidden = false;
    } else {
      bar.hidden = true;
    }
  }

  /* ---------------- render: filter options ---------------- */
  function renderFilterOptions() {
    var mats = [], colors = [];
    items.forEach(function (s) {
      if (mats.indexOf(s.material) === -1) mats.push(s.material);
      if (colors.indexOf(s.colorName) === -1) colors.push(s.colorName);
    });
    mats.sort(function (a, b) { return a.localeCompare(b, "zh"); });
    colors.sort(function (a, b) { return a.localeCompare(b, "zh"); });

    var mSel = $("fMaterial");
    var keepM = filters.material;
    mount(mSel, '<option value="">全部材料</option>' + mats.map(function (m) {
      return '<option value="' + escapeHtml(m) + '">' + escapeHtml(m) + " · " + items.filter(function (s) { return s.material === m; }).length + " 卷</option>";
    }).join(""));
    mSel.value = mats.indexOf(keepM) > -1 ? keepM : "";

    var cSel = $("fColor");
    var keepC = filters.color;
    mount(cSel, '<option value="">全部颜色</option>' + colors.map(function (c) {
      return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + "</option>";
    }).join(""));
    cSel.value = colors.indexOf(keepC) > -1 ? keepC : "";
  }

  /* ---------------- render: grid ---------------- */
  function cardHtml(s) {
    var st = statusOf(s);
    var pct = pctOf(s);
    var net = num(s.netWeight, 0);
    var rem = num(s.remaining, 0);
    var logs = s.logs || [];
    var consumed = logs.reduce(function (acc, l) { return acc + (num(l.g, 0) > 0 ? num(l.g, 0) : 0); }, 0);
    var color = METER_COLOR[st] || "#0e7c6b";
    var chips = ['<span class="chip tag">' + escapeHtml(s.material) + "</span>"];
    chips.push('<span class="chip">' + escapeHtml(s.diameter) + " mm</span>");
    if (s.location) chips.push('<span class="chip">' + escapeHtml(s.location) + "</span>");
    chips.push('<span class="chip">' + (logs.length ? "已用 " + Math.round(consumed) + " g · " + logs.length + " 次" : "暂无使用记录") + "</span>");

    return '<article class="card ' + st + '" data-id="' + escapeHtml(s.id) + '">' +
      '<div class="card-head">' +
        '<span class="swatch" style="background:' + escapeHtml(s.colorHex) + '"></span>' +
        '<div class="card-title">' +
          "<h3>" + escapeHtml(s.material) + " · " + escapeHtml(s.colorName) + "</h3>" +
          "<p>" + escapeHtml(s.brand) + " · 净重 " + net + " g" + (s.purchasedAt ? " · " + escapeHtml(s.purchasedAt) + " 购入" : "") + "</p>" +
        "</div>" +
        '<span class="badge ' + st + '">' + STATUS_TEXT[st] + "</span>" +
      "</div>" +
      '<div class="meter"><div class="meter-fill" style="width:' + pct + "%;background:" + color + '"></div></div>' +
      '<div class="meter-meta"><span>剩余 <b>' + Math.round(rem) + " g</b> / " + net + ' g</span><span>' + pct + "%</span></div>" +
      '<div class="chips">' + chips.join("") + "</div>" +
      '<div class="card-actions">' +
        '<button class="btn sm" type="button" data-act="use">登记使用</button>' +
        '<button class="btn sm" type="button" data-act="edit">编辑</button>' +
        '<button class="btn sm" type="button" data-act="detail">记录</button>' +
        '<button class="icon-btn" type="button" data-act="del" title="删除" aria-label="删除">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>' +
        "</button>" +
      "</div>" +
    "</article>";
  }

  function renderGrid() {
    var list = filtered();
    var grid = $("grid");
    var emptyBox = $("emptyState");

    if (!items.length) {
      mount(grid, "");
      mount(emptyBox, '<div class="empty-state"><h3>还没有任何耗材</h3><p>新增第一卷耗材，或先载入一份示例数据看看效果。</p>' +
        '<button class="btn primary" type="button" id="emptyAdd">新增耗材</button> ' +
        '<button class="btn" type="button" id="emptySeed" style="margin-left:6px">载入示例数据</button></div>');
      var ea = $("emptyAdd"), es = $("emptySeed");
      if (ea) ea.addEventListener("click", function () { openSpool(null); });
      if (es) es.addEventListener("click", loadSeed);
      return;
    }
    if (!list.length) {
      mount(grid, "");
      mount(emptyBox, '<div class="empty-state"><h3>没有符合条件的耗材</h3><p>试着放宽筛选条件，或清空搜索关键词。</p>' +
        '<button class="btn" type="button" id="emptyReset">重置筛选</button></div>');
      var er = $("emptyReset");
      if (er) er.addEventListener("click", resetFilters);
      return;
    }
    mount(emptyBox, "");
    var html = [];
    for (var i = 0; i < list.length; i++) html.push(cardHtml(list[i]));
    mount(grid, html.join(""));
    $("statSpoolsSub").setAttribute("data-shown", String(list.length));
  }

  /* ---------------- render: distribution ---------------- */
  function renderDist() {
    var byMat = {};
    var live = items.filter(function (s) { return statusOf(s) !== "empty"; });
    live.forEach(function (s) {
      if (!byMat[s.material]) byMat[s.material] = { g: 0, n: 0 };
      byMat[s.material].g += num(s.remaining, 0);
      byMat[s.material].n += 1;
    });
    var rows = Object.keys(byMat).map(function (k) { return { name: k, g: byMat[k].g, n: byMat[k].n }; });
    rows.sort(function (a, b) { return b.g - a.g; });
    var max = rows.length ? rows[0].g : 1;

    if (!rows.length) {
      mount($("distMaterial"), '<p style="font-size:12px;color:#8b97a6">暂无可统计的在用耗材。</p>');
    } else {
      mount($("distMaterial"), rows.map(function (r) {
        var w = Math.max(3, Math.round((r.g / max) * 100));
        return '<div class="bar-row"><span class="bar-name">' + escapeHtml(r.name) + "</span>" +
          '<span class="bar-track"><span class="bar-fill" style="width:' + w + '%;display:block"></span></span>' +
          '<span class="bar-val">' + round1(r.g / 1000) + " kg · " + r.n + " 卷</span></div>";
      }).join(""));
    }

    var byColor = {};
    items.forEach(function (s) {
      var key = s.colorName;
      if (!byColor[key]) byColor[key] = { n: 0, hex: s.colorHex };
      byColor[key].n += 1;
    });
    var ckeys = Object.keys(byColor).sort(function (a, b) { return byColor[b].n - byColor[a].n; });
    if (!ckeys.length) {
      mount($("distColor"), '<p style="font-size:12px;color:#8b97a6">暂无颜色数据。</p>');
    } else {
      mount($("distColor"), ckeys.map(function (k) {
        return '<span class="color-pill"><i style="background:' + escapeHtml(byColor[k].hex) + '"></i>' +
          escapeHtml(k) + " <b>" + byColor[k].n + "</b></span>";
      }).join(""));
    }
  }

  function renderAll() {
    renderStats();
    renderFilterOptions();
    renderGrid();
    renderDist();
  }

  /* ---------------- spool form ---------------- */
  var editingId = null;

  function openSpool(id) {
    editingId = id || null;
    var s = null;
    if (id) {
      for (var i = 0; i < items.length; i++) if (items[i].id === id) s = items[i];
    }
    $("spoolModalTitle").textContent = s ? "编辑耗材" : "新增耗材";
    $("formError").style.display = "none";

    $("fBrand").value = s ? s.brand : "";
    $("fMaterialIn").value = s ? s.material : "PLA";
    $("fColorName").value = s ? s.colorName : "黑色";
    $("fColorHex").value = s ? s.colorHex : "#1f2328";
    $("fDiameter").value = s ? String(s.diameter) : "1.75";
    $("fNet").value = s ? s.netWeight : 1000;
    $("fRemain").value = s ? s.remaining : 1000;
    $("fThreshold").value = s ? s.threshold : 150;
    $("fLocation").value = s ? s.location : "";
    $("fPrice").value = s ? s.price : 0;
    $("fPurchased").value = s ? s.purchasedAt : "";
    $("fNote").value = s ? s.note : "";

    renderSwatches(s ? s.colorHex : "#1f2328");
    showOverlay("overlaySpool");
    setTimeout(function () { $("fBrand").focus(); }, 60);
  }

  function renderSwatches(activeHex) {
    mount($("swatches"), PRESET_COLORS.map(function (c) {
      var on = c.h.toLowerCase() === String(activeHex).toLowerCase() ? " on" : "";
      return '<button class="sw-btn' + on + '" type="button" data-hex="' + escapeHtml(c.h) + '" data-name="' + escapeHtml(c.n) + '" title="' + escapeHtml(c.n) + '" style="background:' + escapeHtml(c.h) + '"></button>';
    }).join(""));
  }

  function saveSpool() {
    var brand = $("fBrand").value.trim();
    var material = $("fMaterialIn").value.trim();
    var colorName = $("fColorName").value.trim();
    var net = num($("fNet").value, NaN);
    var remain = num($("fRemain").value, NaN);
    var th = num($("fThreshold").value, NaN);
    var err = $("formError");

    if (!brand) { err.textContent = "请填写品牌名称。"; err.style.display = "block"; return; }
    if (!material) { err.textContent = "请填写材料类型，例如 PLA、PETG。"; err.style.display = "block"; return; }
    if (!colorName) { err.textContent = "请填写颜色名称。"; err.style.display = "block"; return; }
    if (isNaN(net) || net <= 0) { err.textContent = "净重需要大于 0 克。"; err.style.display = "block"; return; }
    if (isNaN(remain) || remain < 0) { err.textContent = "余量不能为负数。"; err.style.display = "block"; return; }
    if (isNaN(th) || th < 0) { err.textContent = "低余量阈值不能为负数。"; err.style.display = "block"; return; }
    if (remain > net) remain = net;
    err.style.display = "none";

    var now = Date.now();
    if (editingId) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === editingId) {
          var s = items[i];
          var before = num(s.remaining, 0);
          s.brand = brand; s.material = material; s.colorName = colorName;
          s.colorHex = $("fColorHex").value; s.diameter = num($("fDiameter").value, 1.75);
          s.netWeight = net; s.remaining = remain; s.threshold = th;
          s.location = $("fLocation").value.trim(); s.price = num($("fPrice").value, 0);
          s.purchasedAt = $("fPurchased").value; s.note = $("fNote").value.trim();
          if (Math.abs(before - remain) > 0.01) {
            s.logs = (s.logs || []).concat([{ t: now, g: before > remain ? before - remain : 0, note: "手动修正余量 " + Math.round(before) + " → " + Math.round(remain) + " g", type: before > remain ? "use" : "set" }]);
          }
          s.updatedAt = now;
        }
      }
      toast("已保存修改");
    } else {
      items.unshift({
        id: uid(), brand: brand, material: material, colorName: colorName,
        colorHex: $("fColorHex").value, diameter: num($("fDiameter").value, 1.75),
        netWeight: net, remaining: remain, threshold: th,
        location: $("fLocation").value.trim(), price: num($("fPrice").value, 0),
        purchasedAt: $("fPurchased").value, note: $("fNote").value.trim(),
        logs: [], createdAt: now, updatedAt: now
      });
      toast("已新增 " + material + " · " + colorName);
    }
    persist();
    hideOverlay("overlaySpool");
    renderAll();
  }

  /* ---------------- usage ---------------- */
  var useId = null;

  function openUse(id) {
    useId = id;
    var s = findItem(id);
    if (!s) return;
    $("useSub").textContent = s.brand + " · " + s.material + " · " + s.colorName + "｜当前 " + Math.round(s.remaining) + " / " + s.netWeight + " g";
    $("useGrams").value = 20;
    $("useNote").value = "";
    $("useSet").value = "";
    showOverlay("overlayUse");
    setTimeout(function () { $("useGrams").focus(); $("useGrams").select(); }, 60);
  }

  function findItem(id) {
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  }

  function applyUse() {
    var s = findItem(useId);
    if (!s) return;
    var now = Date.now();
    var note = $("useNote").value.trim();
    var setVal = $("useSet").value.trim();

    if (setVal !== "") {
      var target = num(setVal, NaN);
      if (isNaN(target) || target < 0) { toast("请输入有效的余量数值"); return; }
      target = Math.min(target, num(s.netWeight, 0));
      var before = num(s.remaining, 0);
      if (target === before) { hideOverlay("overlayUse"); return; }
      s.logs = (s.logs || []).concat([{ t: now, g: before > target ? before - target : 0, note: note || ("校准余量 " + Math.round(before) + " → " + Math.round(target) + " g"), type: before > target ? "use" : "set" }]);
      s.remaining = target;
      toast("余量已校准为 " + Math.round(target) + " g");
    } else {
      var grams = num($("useGrams").value, NaN);
      if (isNaN(grams) || grams <= 0) { toast("请输入大于 0 的消耗克数"); return; }
      grams = Math.min(grams, num(s.remaining, 0));
      if (grams <= 0) { toast("该耗材已无余量，请先补满或换新卷"); return; }
      s.remaining = Math.max(0, num(s.remaining, 0) - grams);
      s.logs = (s.logs || []).concat([{ t: now, g: grams, note: note || "打印消耗", type: "use" }]);
      toast("已扣除 " + Math.round(grams) + " g，剩余 " + Math.round(s.remaining) + " g");
    }
    s.updatedAt = now;
    persist();
    hideOverlay("overlayUse");
    renderAll();
  }

  function refill() {
    var s = findItem(useId);
    if (!s) return;
    var now = Date.now();
    s.remaining = num(s.netWeight, 1000);
    s.logs = (s.logs || []).concat([{ t: now, g: 0, note: "补满 / 更换新卷，重置为 " + s.netWeight + " g", type: "refill" }]);
    s.updatedAt = now;
    persist();
    hideOverlay("overlayUse");
    renderAll();
    toast("已重置为满卷 " + s.netWeight + " g");
  }

  /* ---------------- detail ---------------- */
  var detailId = null;

  function openDetail(id) {
    detailId = id;
    var s = findItem(id);
    if (!s) return;
    var st = statusOf(s);
    var pct = pctOf(s);
    $("detailTitle").textContent = s.material + " · " + s.colorName;
    $("detailSub").textContent = s.brand + " · " + STATUS_TEXT[st];
    var kv = [
      ["净重", s.netWeight + " g"], ["当前余量", Math.round(s.remaining) + " g"],
      ["低余量阈值", s.threshold + " g"], ["线径", s.diameter + " mm"],
      ["存放位置", s.location || "—"], ["购入日期", s.purchasedAt || "—"],
      ["单价", s.price ? "¥" + s.price : "—"], ["使用记录", (s.logs || []).length + " 条"]
    ];
    mount($("detailKv"), kv.map(function (p) {
      return "<div><span>" + escapeHtml(p[0]) + "</span><b>" + escapeHtml(p[1]) + "</b></div>";
    }).join(""));
    $("detailMeter").style.width = pct + "%";
    $("detailMeter").style.background = METER_COLOR[st];
    $("detailRemain").textContent = Math.round(s.remaining) + " g";
    $("detailPct").textContent = pct + "%";

    var logs = (s.logs || []).slice().sort(function (a, b) { return num(b.t, 0) - num(a.t, 0); });
    $("detailLogCount").textContent = logs.length ? "共 " + logs.length + " 条" : "";
    if (!logs.length) {
      mount($("detailLogs"), '<div class="log"><span class="n" style="color:#8b97a6">还没有使用记录，点「登记使用」开始追踪余量。</span></div>');
    } else {
      mount($("detailLogs"), logs.map(function (l) {
        var cls = l.type === "refill" ? "plus" : (l.type === "set" ? "" : "minus");
        var label = l.type === "refill" ? "补满" : (num(l.g, 0) > 0 ? "−" + Math.round(l.g) + " g" : "校准");
        return '<div class="log"><span class="t">' + escapeHtml(fmtDateTime(l.t)) + "</span>" +
          '<span class="g ' + cls + '">' + escapeHtml(label) + "</span>" +
          '<span class="n">' + escapeHtml(l.note || "—") + "</span></div>";
      }).join(""));
    }
    $("detailNote").textContent = s.note ? "备注：" + s.note : "";
    showOverlay("overlayDetail");
  }

  /* ---------------- delete ---------------- */
  function delItem(id) {
    var s = findItem(id);
    if (!s) return;
    if (!window.confirm("删除「" + s.material + " · " + s.colorName + "」？该耗材的使用记录会一并删除，操作不可撤销。")) return;
    items = items.filter(function (x) { return x.id !== id; });
    persist();
    hideOverlay("overlayDetail");
    renderAll();
    toast("已删除");
  }

  /* ---------------- overlay helpers ---------------- */
  function showOverlay(id) { $(id).classList.add("on"); document.body.style.overflow = "hidden"; }
  function hideOverlay(id) { $(id).classList.remove("on"); document.body.style.overflow = ""; }
  function closeAll() {
    ["overlaySpool", "overlayUse", "overlayDetail", "overlayHelp"].forEach(function (id) {
      $(id).classList.remove("on");
    });
    document.body.style.overflow = "";
  }

  /* ---------------- import / export ---------------- */
  function download(name, content, mime) {
    var blob = new Blob([content], { type: mime || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function stamp() {
    var d = new Date();
    var p = function (x) { return x < 10 ? "0" + x : "" + x; };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes());
  }

  function exportJson() {
    download("filament-stock-" + stamp() + ".json", JSON.stringify({ v: 1, exportedAt: new Date().toISOString(), items: items }, null, 2), "application/json");
    toast("已导出 " + items.length + " 条耗材数据");
  }

  function csvCell(v) {
    var s = String(v === null || v === undefined ? "" : v);
    var needQuote = s.indexOf(",") > -1 || s.indexOf('"') > -1 || s.indexOf("\n") > -1 || s.indexOf("\r") > -1;
    if (needQuote) s = '"' + s.split('"').join('""') + '"';
    return s;
  }

  function exportCsv() {
    var head = ["品牌", "材料类型", "颜色", "色值", "线径mm", "净重g", "余量g", "余量占比", "阈值g", "状态", "位置", "单价元", "购入日期", "使用记录数", "备注"];
    var rows = [head.join(",")];
    items.forEach(function (s) {
      rows.push([
        s.brand, s.material, s.colorName, s.colorHex, s.diameter, s.netWeight, Math.round(s.remaining),
        pctOf(s) + "%", s.threshold, STATUS_TEXT[statusOf(s)], s.location, s.price, s.purchasedAt,
        (s.logs || []).length, s.note
      ].map(csvCell).join(","));
    });
    download("filament-stock-" + stamp() + ".csv", "\ufeff" + rows.join("\r\n"), "text/csv;charset=utf-8");
    toast("已导出 CSV，可用 Excel 直接打开");
  }

  function importJsonFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var data = null;
      try { data = JSON.parse(String(reader.result)); } catch (e) {
        toast("文件不是有效的 JSON");
        return;
      }
      var arr = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : null);
      if (!arr) { toast("JSON 结构不正确，未找到耗材列表"); return; }
      var added = 0, updated = 0;
      arr.forEach(function (raw) {
        var s = normalize(raw);
        var idx = -1;
        for (var i = 0; i < items.length; i++) if (items[i].id === s.id) idx = i;
        if (idx > -1) { items[idx] = s; updated++; }
        else { items.push(s); added++; }
      });
      persist();
      renderAll();
      toast("导入完成：新增 " + added + " 条，更新 " + updated + " 条");
    };
    reader.readAsText(file, "utf-8");
  }

  function loadSeed() {
    if (items.length && !window.confirm("载入示例数据会追加 8 条演示耗材，是否继续？")) return;
    var seeded = seedItems();
    seeded.forEach(function (s) { items.push(s); });
    persist();
    renderAll();
    toast("已载入 " + seeded.length + " 条示例数据");
  }

  function clearAll() {
    if (!items.length) { toast("当前没有数据"); return; }
    if (!window.confirm("清空全部 " + items.length + " 条耗材数据？建议先导出 JSON 备份，此操作不可撤销。")) return;
    items = [];
    persist();
    renderAll();
    toast("已清空，可用「载入示例数据」重新体验");
  }

  /* ---------------- filters / events ---------------- */
  function resetFilters() {
    filters = { q: "", material: "", color: "", status: "", sort: "remain-asc", onlyLow: false };
    $("q").value = "";
    $("fMaterial").value = "";
    $("fColor").value = "";
    $("fStatus").value = "";
    $("fSort").value = "remain-asc";
    $("fLow").checked = false;
    renderGrid();
  }

  function bindEvents() {
    $("btnAdd").addEventListener("click", function () { openSpool(null); });
    $("btnHelp").addEventListener("click", function () { showOverlay("overlayHelp"); });
    $("btnHelp2").addEventListener("click", function () { showOverlay("overlayHelp"); });
    $("btnSaveSpool").addEventListener("click", saveSpool);
    $("btnUseSave").addEventListener("click", applyUse);
    $("btnRefill").addEventListener("click", refill);
    $("btnExportJson").addEventListener("click", exportJson);
    $("btnExportCsv").addEventListener("click", exportCsv);
    $("btnImport").addEventListener("click", function () { $("fileInput").click(); });
    $("btnSeed").addEventListener("click", loadSeed);
    $("btnClear").addEventListener("click", clearAll);
    $("btnReset").addEventListener("click", resetFilters);
    $("alertFilter").addEventListener("click", function () {
      filters.onlyLow = true;
      filters.status = "";
      $("fLow").checked = true;
      $("fStatus").value = "";
      renderGrid();
      document.getElementById("grid").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    $("fileInput").addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      if (f) importJsonFile(f);
      e.target.value = "";
    });

    $("q").addEventListener("input", function (e) { filters.q = e.target.value; renderGrid(); });
    $("fMaterial").addEventListener("change", function (e) { filters.material = e.target.value; renderGrid(); });
    $("fColor").addEventListener("change", function (e) { filters.color = e.target.value; renderGrid(); });
    $("fStatus").addEventListener("change", function (e) { filters.status = e.target.value; renderGrid(); });
    $("fSort").addEventListener("change", function (e) { filters.sort = e.target.value; renderGrid(); });
    $("fLow").addEventListener("change", function (e) { filters.onlyLow = e.target.checked; renderGrid(); });

    $("grid").addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("[data-act]") : null;
      if (!btn) return;
      var card = btn.closest(".card");
      if (!card) return;
      var id = card.getAttribute("data-id");
      var act = btn.getAttribute("data-act");
      if (act === "use") openUse(id);
      else if (act === "edit") openSpool(id);
      else if (act === "detail") openDetail(id);
      else if (act === "del") delItem(id);
    });

    $("swatches").addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-hex]") : null;
      if (!b) return;
      $("fColorHex").value = b.getAttribute("data-hex");
      var nm = b.getAttribute("data-name");
      if (nm) $("fColorName").value = nm;
      renderSwatches(b.getAttribute("data-hex"));
    });

    $("useGrams").parentNode.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-q]") : null;
      if (!b) return;
      $("useGrams").value = b.getAttribute("data-q");
      $("useSet").value = "";
    });

    $("btnDetailEdit").addEventListener("click", function () {
      hideOverlay("overlayDetail");
      openSpool(detailId);
    });
    $("btnDetailUse").addEventListener("click", function () {
      hideOverlay("overlayDetail");
      openUse(detailId);
    });
    $("btnDetailDel").addEventListener("click", function () { delItem(detailId); });

    document.querySelectorAll("[data-close]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ov = b.closest(".overlay");
        if (ov) hideOverlay(ov.id);
      });
    });

    document.querySelectorAll(".overlay").forEach(function (ov) {
      ov.addEventListener("mousedown", function (e) {
        if (e.target === ov) hideOverlay(ov.id);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });

    $("dataMenu").addEventListener("click", function (e) {
      if (e.target.tagName === "BUTTON") setTimeout(function () { $("dataMenu").removeAttribute("open"); }, 120);
    });
  }

  /* ---------------- boot ---------------- */
  load();
  bindEvents();
  renderAll();

  if (memoryOnly) {
    var bar = $("alertBar");
    bar.hidden = false;
    $("alertText").textContent = "当前浏览器禁用了本地存储，数据仅保存在本次会话中";
    $("alertFilter").textContent = "导出 JSON 备份 ›";
    $("alertFilter").addEventListener("click", exportJson);
  }
})();
