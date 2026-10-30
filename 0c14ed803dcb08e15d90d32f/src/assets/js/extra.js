/* ============================================================
   华夏五千年 · 新增栏目交互层
   1) 地理    —— 疆域对比 + 四至 + 都城迁徙 + 州郡沿革
   2) 文物    —— 卡片墙 + 类别筛选
   3) 世界坐标 —— 同期世界事件 + 横向对照
   4) 成语典故 —— 按朝代归类的词条墙
   5) 对照台  —— 任意两个条目并置比较
   6) 编年轴  —— 可拖动、可缩放的时间轴

   依赖：data.js / geo.js / relics.js / world.js / idioms.js（数据）
         app.js 暴露的 window.EPIC（条目详情与弹层复用，避免二次实现）
   ============================================================ */
(function () {
  "use strict";

  var EPIC = window.EPIC;
  if (!EPIC) return;

  var DATA = EPIC.DATA;
  var GENERIC = EPIC.GENERIC;
  var esc = EPIC.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     一、统一条目注册表
     所有栏目共用同一份条目索引，对照台因此可以跨栏目比对
     ============================================================ */

  var KIND_LABEL = {
    dynasty: "朝代", relic: "文物", world: "世界坐标", idiom: "成语", capital: "都城",
    admin: "州郡", myth: "神话", battle: "战役", ruler: "帝王", person: "人物",
    inst: "制度", culture: "文化", film: "影视", event: "大事"
  };

  var KIND_ORDER = ["dynasty", "relic", "world", "idiom", "capital", "admin", "myth", "battle", "ruler", "person", "inst", "culture", "film", "event"];

  /* 旧栏目的对照字段与正文（新栏目统一走 GENERIC） */
  var LEGACY_FACTS = {
    myth:   function (x, d) { return [["类型", x.type], ["出处", x.source], ["所属时期", d.name]]; },
    battle: function (x, d) { return [["年代", x.year], ["交战", x.sides], ["结果", x.result], ["所属时期", d.name]]; },
    ruler:  function (x, d) { return [["庙号/称号", x.title], ["姓名", x.name], ["在位", x.reign], ["朝代", d.name]]; },
    person: function (x, d) { return [["身份", x.role], ["所属时期", d.name]]; },
    inst:   function (x, d) { return [["类别", "典章制度"], ["所属时期", d.name], ["起止", d.years]]; },
    culture:function (x, d) { return [["类别", "文化成就"], ["所属时期", d.name], ["起止", d.years]]; },
    film:   function (x, d) { return [["类型", x.t], ["年份", x.year], ["所属时期", d.name]]; },
    event:  function (x, d) { return [["年代", x.label], ["所属时期", d.name]]; }
  };

  var LEGACY_BODY = {
    myth:   function (x) { return x.desc; },
    battle: function (x) { return x.desc; },
    ruler:  function (x) { return x.note; },
    person: function (x) { return x.note; },
    inst:   function (x) { return x.desc; },
    culture:function (x) { return x.desc; },
    film:   function (x) { return x.note; },
    event:  function (x) { return x.text; }
  };

  var ITEMS = [];
  var ITEM_INDEX = Object.create(null);

  function addItem(kind, d, x, title, sub, year) {
    var id = kind + "|" + d.id + "|" + title;
    if (ITEM_INDEX[id]) return ITEM_INDEX[id];
    var it = { id: id, kind: kind, dyn: d.id, d: d, x: x, title: title, sub: sub, year: year };
    ITEM_INDEX[id] = it;
    ITEMS.push(it);
    return it;
  }

  DATA.forEach(function (d) {
    addItem("dynasty", d, d, d.name, d.period, null);
    d.relics.forEach(function (x) { addItem("relic", d, x, x.name, x.tag, null); });
    d.worldEvents.forEach(function (x) { addItem("world", d, x, x.title, x.region, x.year); });
    d.idioms.forEach(function (x) { addItem("idiom", d, x, x.word, x.kind, null); });
    d.capitals.forEach(function (x) { addItem("capital", d, x, x.name, x.now, null); });
    d.admin.forEach(function (x) { addItem("admin", d, x, x.name, d.geo.adminSystem, null); });
    d.myths.forEach(function (x) { addItem("myth", d, x, x.name, x.type, null); });
    d.battles.forEach(function (x) { addItem("battle", d, x, x.name, x.sides, null); });
    d.rulers.forEach(function (x) { addItem("ruler", d, x, x.title, x.reign, null); });
    d.people.forEach(function (x) { addItem("person", d, x, x.name, x.role, null); });
    d.institutions.forEach(function (x) { addItem("inst", d, x, x.name, d.name, null); });
    d.culture.forEach(function (x) { addItem("culture", d, x, x.name, d.name, null); });
    d.films.forEach(function (x) { addItem("film", d, x, x.title, x.t, null); });
    d.events.forEach(function (x) { addItem("event", d, x, x.label, x.text, x.year); });
  });

  function factsOf(it) {
    var G = GENERIC[it.kind];
    if (G && G.rows) return G.rows(it.x, it.d).filter(function (r) { return r[1]; });
    var f = LEGACY_FACTS[it.kind];
    return f ? f(it.x, it.d).filter(function (r) { return r[1]; }) : [];
  }
  function bodyOf(it) {
    var G = GENERIC[it.kind];
    if (G && G.desc) return G.desc(it.x, it.d);
    var b = LEGACY_BODY[it.kind];
    return b ? b(it.x, it.d) : "";
  }
  function cmpKey(kind, dyn, key) {
    return kind + "|" + dyn + "|" + key;
  }
  function cmpAttr(kind, d, key) {
    return ' data-cmp="' + esc(cmpKey(kind, d.id, key)) + '"';
  }

  /* ============================================================
     二、对照台（任意两个条目）
     ============================================================ */

  var slots = [null, null];
  var SLOT_NAME = ["甲", "乙"];

  function getItemById(id) { return ITEM_INDEX[id] || null; }

  function toast(msg) {
    var el = $("#cmpToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "cmpToast";
      el.className = "cmp-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("show"); }, 1900);
  }

  function setSlot(i, it) {
    slots[i] = it;
    renderSlots();
    renderCompare();
  }

  function addToCompare(itemId) {
    var it = getItemById(itemId);
    if (!it) return;
    if (slots[0] && slots[0].id === it.id) { toast("「" + it.title + "」已在甲位"); return; }
    if (slots[1] && slots[1].id === it.id) { toast("「" + it.title + "」已在乙位"); return; }
    var idx = slots[0] ? 1 : 0;
    setSlot(idx, it);
    toast("已放入「" + SLOT_NAME[idx] + "」位：" + it.title);
  }

  function slotCardHTML(it, i) {
    if (!it) {
      return '<div class="cmp-empty"><span>' + SLOT_NAME[i] + "</span><p>尚未选择条目</p></div>";
    }
    return (
      '<div class="cmp-filled">' +
        '<div class="cmp-filled-kind">' + KIND_LABEL[it.kind] + " · " + it.d.name + "</div>" +
        '<h4 class="cmp-filled-title">' + esc(it.title) + "</h4>" +
        '<p class="cmp-filled-sub">' + esc(it.sub || "") + "</p>" +
        '<button type="button" class="cmp-open" data-kind="' + it.kind + '" data-key="' +
          esc(it.kind === "dynasty" ? it.d.name : it.title) + '" data-dyn="' + it.d.id + '">查看条目 →</button>' +
      "</div>"
    );
  }

  function renderSlots() {
    [0, 1].forEach(function (i) {
      var box = $('[data-slot-body="' + i + '"]');
      if (box) box.innerHTML = slotCardHTML(slots[i], i);
      var btn = $('[data-clear="' + i + '"]');
      if (btn) btn.disabled = !slots[i];
    });
    var c = $("#cmpCount");
    if (c) c.textContent = (slots[0] ? 1 : 0) + (slots[1] ? 1 : 0);
  }

  function initCmpTotal() {
    var t = $("#cmpTotal");
    if (t) t.textContent = ITEMS.length;
  }

  function renderCompare() {
    var out = $("#cmpResult");
    if (!out) return;
    var a = slots[0], b = slots[1];

    if (!a || !b) {
      out.innerHTML =
        '<div class="cmp-placeholder">' +
          "<h4>选择两个条目开始对照</h4>" +
          "<p>可跨栏目比较：朝代 × 朝代、文物 × 文物、中国事件 × 世界事件、成语 × 成语，或任意两类混排。对照台会按两者的字段自动对齐，逐项标出异同。</p>" +
        "</div>";
      return;
    }

    /* 字段对齐：先共同字段（标出同/异），再各自独有字段 */
    var fa = factsOf(a), fb = factsOf(b);
    var labels = [], map = {};
    fa.forEach(function (r) { if (!map[r[0]]) { map[r[0]] = 1; labels.push(r[0]); } });
    fb.forEach(function (r) { if (!map[r[0]]) { map[r[0]] = 1; labels.push(r[0]); } });

    function valOf(list, label) {
      for (var i = 0; i < list.length; i++) if (list[i][0] === label) return list[i][1];
      return "";
    }

    var shared = [], onlyA = [], onlyB = [];
    labels.forEach(function (label) {
      var va = valOf(fa, label), vb = valOf(fb, label);
      if (va && vb) shared.push(label);
      else if (va) onlyA.push(label);
      else onlyB.push(label);
    });

    var same = 0, diff = 0;
    var rows = shared.map(function (label) {
      var va = valOf(fa, label), vb = valOf(fb, label);
      var isSame = String(va) === String(vb);
      if (isSame) same++; else diff++;
      return (
        "<tr class=\"" + (isSame ? "same" : "diff") + "\">" +
          "<td>" + esc(va) + "</td>" +
          "<th>" + esc(label) + "</th>" +
          "<td>" + esc(vb) + "</td>" +
        "</tr>"
      );
    }).join("");

    rows += onlyA.map(function (label) {
      return '<tr class="only a"><td>' + esc(valOf(fa, label)) + "</td><th>" + esc(label) + "</th><td>—</td></tr>";
    }).join("");
    rows += onlyB.map(function (label) {
      return '<tr class="only b"><td>—</td><th>' + esc(label) + "</th><td>" + esc(valOf(fb, label)) + "</td></tr>";
    }).join("");

    out.innerHTML =
      '<div class="cmp-summary">' +
        "<span>共同字段 <b>" + shared.length + "</b></span>" +
        "<span class=\"s-same\">相同 <b>" + same + "</b></span>" +
        "<span class=\"s-diff\">不同 <b>" + diff + "</b></span>" +
        "<span class=\"s-only\">各自独有 <b>" + onlyA.length + " / " + onlyB.length + "</b></span>" +
        '<button type="button" class="cmp-reset" data-cmp-reset="1">清空重选</button>' +
      "</div>" +
      '<div class="cmp-panes">' +
        '<div class="cmp-pane"><div class="cmp-pane-head">甲 · ' + KIND_LABEL[a.kind] + "</div>" +
          "<h3>" + esc(a.title) + "</h3>" +
          '<p class="cmp-pane-body">' + bodyOf(a) + "</p></div>" +
        '<div class="cmp-pane"><div class="cmp-pane-head">乙 · ' + KIND_LABEL[b.kind] + "</div>" +
          "<h3>" + esc(b.title) + "</h3>" +
          '<p class="cmp-pane-body">' + bodyOf(b) + "</p></div>" +
      "</div>" +
      '<div class="cmp-table-wrap"><table class="cmp-table"><thead><tr>' +
        "<th>甲 · " + esc(a.title) + "</th><th>对照项</th><th>乙 · " + esc(b.title) + "</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>";
  }

  /* 选择器 */
  var pickerSlot = 0;
  var pickerKind = "all";
  var pickerKw = "";

  function pickerList() {
    var list = ITEMS;
    if (pickerKind !== "all") list = list.filter(function (x) { return x.kind === pickerKind; });
    if (pickerKw) {
      var k = pickerKw.toLowerCase();
      list = list.filter(function (x) {
        var hay = (x.title + " " + (x.sub || "") + " " + x.d.name + " " + KIND_LABEL[x.kind]).toLowerCase();
        return hay.indexOf(k) > -1;
      });
    }
    return list;
  }

  function renderPicker() {
    var box = $("#pickerList");
    if (!box) return;
    var list = pickerList().slice(0, 240);
    box.innerHTML = list.map(function (x) {
      var on = (slots[0] && slots[0].id === x.id) || (slots[1] && slots[1].id === x.id);
      return (
        '<button type="button" class="picker-item' + (on ? " on" : "") + '" data-pick-item="' + esc(x.id) + '">' +
          '<em>' + KIND_LABEL[x.kind] + "</em>" +
          "<b>" + esc(x.title) + "</b>" +
          "<span>" + esc(x.d.name + (x.sub ? " · " + x.sub : "")) + "</span>" +
        "</button>"
      );
    }).join("") || '<p class="picker-empty">没有匹配的条目</p>';
    var n = $("#pickerCount");
    if (n) n.textContent = pickerList().length;
  }

  function openPicker(i) {
    pickerSlot = i;
    var m = $("#pickerMask"), p = $("#picker");
    if (!m || !p) return;
    var t = $("#pickerTitle");
    if (t) t.textContent = "选择「" + SLOT_NAME[i] + "」位条目";
    m.classList.add("open");
    p.classList.add("open");
    renderPicker();
    var input = $("#pickerSearch");
    if (input) { input.value = ""; pickerKw = ""; setTimeout(function () { input.focus(); }, 60); }
    document.body.classList.add("lock");
  }

  function closePicker() {
    var m = $("#pickerMask"), p = $("#picker");
    if (m) m.classList.remove("open");
    if (p) p.classList.remove("open");
    document.body.classList.remove("lock");
  }

  function initCompare() {
    var kindsBox = $("#pickerKinds");
    if (kindsBox) {
      kindsBox.innerHTML = '<button type="button" data-pk="all" class="active">全部<i>' + ITEMS.length + "</i></button>" +
        KIND_ORDER.map(function (k) {
          var n = ITEMS.filter(function (x) { return x.kind === k; }).length;
          return '<button type="button" data-pk="' + k + '">' + KIND_LABEL[k] + "<i>" + n + "</i></button>";
        }).join("");
      kindsBox.addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        pickerKind = b.dataset.pk;
        $$("button", kindsBox).forEach(function (x) { x.classList.toggle("active", x === b); });
        renderPicker();
      });
    }

    var input = $("#pickerSearch");
    if (input) {
      input.addEventListener("input", function () {
        pickerKw = input.value.trim();
        renderPicker();
      });
    }

    document.addEventListener("click", function (e) {
      var add = e.target.closest("[data-cmp]");
      if (add) {
        e.preventDefault();
        e.stopPropagation();
        addToCompare(add.dataset.cmp);
        return;
      }
      if (e.target.closest("[data-pick]")) {
        e.preventDefault();
        openPicker(Number(e.target.closest("[data-pick]").dataset.pick));
        return;
      }
      var clear = e.target.closest("[data-clear]");
      if (clear) {
        var idx = Number(clear.dataset.clear);
        slots[idx] = null;
        renderSlots();
        renderCompare();
        return;
      }
      if (e.target.closest("[data-cmp-reset]")) {
        slots = [null, null];
        renderSlots();
        renderCompare();
        return;
      }
      var pick = e.target.closest("[data-pick-item]");
      if (pick) {
        var it = getItemById(pick.dataset.pickItem);
        if (it) { setSlot(pickerSlot, it); closePicker(); }
        return;
      }
      if (e.target.closest("#pickerClose") || e.target === $("#pickerMask")) closePicker();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && $("#picker") && $("#picker").classList.contains("open")) closePicker();
    });

    renderSlots();
    renderCompare();
    initCmpTotal();
  }

  /* ============================================================
     三、地理
     ============================================================ */

  var geoState = { id: "shang" };
  var AREA_MAX = DATA.reduce(function (m, d) {
    return Math.max(m, (d.geo && d.geo.area) || 0);
  }, 0);

  function initGeo() {
    var chart = $("#geoChart");
    if (!chart) return;

    chart.innerHTML =
      '<div class="geo-chart-head">' +
        "<h4>疆域面积估算</h4>" +
        '<span class="geo-unit">单位：万平方公里 · 点击条目查看四至与沿革</span>' +
      "</div>" +
      DATA.map(function (d) {
        var a = d.geo ? d.geo.area : null;
        var w = a ? Math.max(2, (a / AREA_MAX) * 100) : 0;
        return (
          '<button type="button" class="gbar' + (d.id === geoState.id ? " on" : "") + '" data-geo="' + d.id + '">' +
            '<span class="gbar-name">' + d.name + "</span>" +
            '<span class="gbar-track">' +
              (a ? '<span class="gbar-fill" style="width:' + w.toFixed(1) + '%"></span>' : '<span class="gbar-na">无统一政权</span>') +
            "</span>" +
            '<span class="gbar-val">' + (a ? a : "—") + "</span>" +
          "</button>"
        );
      }).join("") +
      '<p class="geo-chart-foot">史前为多文化区并存，不作面积估算；各朝数字取学界通行口径，非精确测量，最大值为元的约 1372 万平方公里。</p>';

    chart.addEventListener("click", function (e) {
      var b = e.target.closest("[data-geo]");
      if (!b) return;
      geoState.id = b.dataset.geo;
      $$(".gbar", chart).forEach(function (x) { x.classList.toggle("on", x === b); });
      renderGeoDetail();
    });

    renderGeoDetail();
  }

  function renderGeoDetail() {
    var box = $("#geoDetail");
    if (!box) return;
    var d = EPIC.BY_ID.get(geoState.id);
    if (!d) return;
    var g = d.geo;

    var extent = ["n", "s", "w", "e"].map(function (k) {
      var label = { n: "北至", s: "南至", w: "西至", e: "东至" }[k];
      return '<div class="extent-item x-' + k + '"><em>' + label + "</em><span>" + (g.extent[k] || "—") + "</span></div>";
    }).join("");

    var nb = "";
    if (g.neighbors) {
      nb = '<div class="nb-grid">' + ["n", "s", "w", "e"].map(function (k) {
        var label = { n: "北邻", s: "南邻", w: "西邻", e: "东邻" }[k];
        var arr = g.neighbors[k] || [];
        return '<div class="nb-row"><em>' + label + "</em>" +
          (arr.length ? arr.map(function (x) { return "<span>" + x + "</span>"; }).join("") : '<span class="nb-none">海 / 无</span>') +
          "</div>";
      }).join("") + "</div>";
    } else {
      nb = '<p class="geo-plain">此期无统一政权，四邻为并存的文化区。</p>';
    }

    var caps = g.capitals.map(function (c, i) {
      return (
        (i ? '<span class="cap-arrow" aria-hidden="true">→</span>' : "") +
        '<button type="button" class="cap-item"' + cmpAttr("capital", d, c.name) +
          ' data-kind="capital" data-key="' + esc(c.name) + '" data-dyn="' + d.id + '">' +
          '<b>' + c.name + "</b>" +
          "<em>" + c.now + "</em>" +
          "<span>" + c.years + "</span>" +
        "</button>"
      );
    }).join("");

    var adm = g.admin.map(function (a) {
      return (
        '<div class="adm-item">' +
          '<div class="adm-head"><b>' + a.name + "</b>" +
            '<button type="button" class="cmp-mini"' + cmpAttr("admin", d, a.name) + ">⇄ 对照</button>" +
          "</div>" +
          "<p>" + a.desc + "</p>" +
        "</div>"
      );
    }).join("");

    box.innerHTML =
      '<div class="geo-detail-head">' +
        '<div><span class="geo-period">' + d.period + "</span><h3>" + d.name + "</h3>" +
        '<p class="geo-years">' + d.years + "</p></div>" +
        '<div class="geo-area"><b>' + (g.area ? g.area : "—") + "</b><em>" + (g.area ? "万 km²" : "无统一政权") + "</em></div>" +
      "</div>" +
      '<p class="geo-note">' + g.areaNote + "</p>" +
      '<div class="geo-block"><h4>四至</h4><div class="extent-grid">' + extent + "</div>" + nb + "</div>" +
      '<div class="geo-block"><h4>都城迁徙<em>' + g.capitals.length + " 处</em></h4>" +
        '<div class="cap-chain">' + caps + "</div></div>" +
      '<div class="geo-block"><h4>州郡沿革<em>' + g.adminSystem + "</em></h4>" +
        '<div class="adm-list">' + adm + "</div></div>" +
      '<p class="src-note">' + g.source + "</p>";
  }

  /* ============================================================
     四、文物
     ============================================================ */

  function initRelics() {
    var tabs = $("#relicTags");
    var grid = $("#relicGrid");
    if (!tabs || !grid) return;

    var all = [];
    DATA.forEach(function (d) {
      d.relics.forEach(function (r) {
        all.push({ d: d, r: r });
      });
    });

    var state = { tag: "全部" };

    tabs.innerHTML = (typeof RELIC_TAGS !== "undefined" ? RELIC_TAGS : ["全部"]).map(function (t, i) {
      var n = t === "全部" ? all.length : all.filter(function (x) { return x.r.tag === t; }).length;
      if (!n && t !== "全部") return "";
      return '<button type="button" data-rtag="' + t + '"' + (i === 0 ? ' class="active"' : "") + ">" +
        t + "<i>" + n + "</i></button>";
    }).join("");

    function paint() {
      var list = state.tag === "全部" ? all : all.filter(function (x) { return x.r.tag === state.tag; });
      grid.innerHTML = list.map(function (o, i) {
        var d = o.d, r = o.r;
        return (
          '<article class="rl-row reveal" data-kind="relic" data-key="' + esc(r.name) + '" data-dyn="' + d.id + '" tabindex="0" role="button">' +
            '<span class="rl-no">' + String(i + 1).padStart(3, "0") + "</span>" +
            '<div class="rl-main">' +
              '<div class="rl-line">' +
                "<h3>" + r.name + "</h3>" +
                '<span class="rl-tag">' + r.tag + "</span>" +
                '<span class="rl-era">' + d.name + "</span>" +
              "</div>" +
              (r.aka ? '<p class="rl-aka">又称 ' + r.aka + "</p>" : "") +
              '<p class="rl-desc clamp-auto">' + r.desc + "</p>" +
            "</div>" +
            '<div class="rl-side">' +
              '<dl class="rl-facts">' +
                "<dt>年代</dt><dd>" + r.year + "</dd>" +
                "<dt>材质</dt><dd>" + r.material + "</dd>" +
                "<dt>尺寸</dt><dd>" + r.size + "</dd>" +
                "<dt>藏地</dt><dd>" + r.place + "</dd>" +
              "</dl>" +
              '<button type="button" class="cmp-mini"' + cmpAttr("relic", d, r.name) + ">⇄ 对照</button>" +
            "</div>" +
          "</article>"
        );
      }).join("");

      var c = $("#relicCount");
      if (c) c.textContent = list.length;
      EPIC.observe(grid);
      if (window.clampTargets) window.clampTargets(grid);
      attachTilt(grid, ".rl-row");
    }

    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      state.tag = b.dataset.rtag;
      $$("button", tabs).forEach(function (x) { x.classList.toggle("active", x === b); });
      paint();
    });

    paint();
  }

  /* ============================================================
     五、世界坐标
     ============================================================ */

  function initWorld() {
    var box = $("#worldGrid");
    if (!box) return;

    var state = { period: "全部" };

    var lines = $("#worldLines");
    if (lines && typeof WORLD_LINES !== "undefined") {
      lines.innerHTML = WORLD_LINES.map(function (l) {
        return (
          '<article class="wl-card reveal">' +
            "<h4>" + l.name + "</h4>" +
            '<p class="wl-span">' + l.span + "</p>" +
            '<div class="wl-phases">' + l.phases.map(function (p) { return "<span>" + p + "</span>"; }).join("") + "</div>" +
            "<p class=\"wl-note\">" + l.note + "</p>" +
          "</article>"
        );
      }).join("");
    }

    var tabs = $("#worldPeriods");
    var periods = ["全部"].concat(Array.from(new Set(DATA.map(function (d) { return d.period; }))));
    if (tabs) {
      tabs.innerHTML = periods.map(function (p, i) {
        var n = p === "全部"
          ? DATA.reduce(function (a, d) { return a + d.worldEvents.length; }, 0)
          : DATA.filter(function (d) { return d.period === p; }).reduce(function (a, d) { return a + d.worldEvents.length; }, 0);
        return '<button type="button" data-wp="' + p + '"' + (i === 0 ? ' class="active"' : "") + ">" + p + "<i>" + n + "</i></button>";
      }).join("");
      tabs.addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        state.period = b.dataset.wp;
        $$("button", tabs).forEach(function (x) { x.classList.toggle("active", x === b); });
        paint();
      });
    }

    function paint() {
      var list = DATA.filter(function (d) {
        return state.period === "全部" || d.period === state.period;
      }).filter(function (d) { return d.worldEvents.length; });

      box.innerHTML = list.map(function (d) {
        var ev = d.worldEvents.map(function (e) {
          return (
            '<article class="wd-row reveal" data-kind="world" data-key="' + esc(e.title) + '" data-dyn="' + d.id + '" tabindex="0" role="button">' +
              '<div class="wd-world">' +
                '<div class="wd-wline">' +
                  '<span class="wd-year">' + e.label + "</span>" +
                  '<span class="wd-place">' + e.region + " · " + e.place + "</span>" +
                "</div>" +
                '<h4 class="wd-title">' + e.title + "</h4>" +
                '<p class="wd-desc clamp-auto">' + e.desc + "</p>" +
              "</div>" +
              '<div class="wd-spine"><i></i></div>' +
              '<div class="wd-china">' +
                '<em>同期中国</em>' +
                '<p class="wd-cn">' + e.cn + "</p>" +
                '<p class="wd-cmp clamp-auto"><span>对照</span>' + e.compare + "</p>" +
                '<button type="button" class="cmp-mini"' + cmpAttr("world", d, e.title) + ">⇄ 加入对照</button>" +
              "</div>" +
            "</article>"
          );
        }).join("");

        return (
          '<div class="wd-block">' +
            '<div class="wd-band">' +
              "<b>" + d.name + "</b>" +
              "<span>" + d.years + "</span>" +
              '<em data-kind="dynasty" data-key="' + esc(d.name) + '" data-dyn="' + d.id + '" tabindex="0" role="button">查看朝代 →</em>' +
            "</div>" +
            '<div class="wd-rows">' + ev + "</div>" +
          "</div>"
        );
      }).join("");

      var c = $("#worldCount");
      if (c) c.textContent = list.reduce(function (a, d) { return a + d.worldEvents.length; }, 0);
      EPIC.observe(box);
      if (window.clampTargets) window.clampTargets(box);
    }

    paint();
  }

  /* ============================================================
     六、成语典故
     ============================================================ */

  function initIdioms() {
    var tabs = $("#idiomKinds");
    var grid = $("#idiomGrid");
    if (!tabs || !grid) return;

    var all = [];
    DATA.forEach(function (d) {
      d.idioms.forEach(function (x) { all.push({ d: d, x: x }); });
    });

    var state = { kind: "全部", kw: "" };

    tabs.innerHTML = (typeof IDIOM_KINDS !== "undefined" ? IDIOM_KINDS : ["全部"]).map(function (k, i) {
      var n = k === "全部" ? all.length : all.filter(function (o) { return o.x.kind === k; }).length;
      return '<button type="button" data-ik="' + k + '"' + (i === 0 ? ' class="active"' : "") + ">" + k + "<i>" + n + "</i></button>";
    }).join("");

    function paint() {
      var list = all.filter(function (o) {
        if (state.kind !== "全部" && o.x.kind !== state.kind) return false;
        if (!state.kw) return true;
        var hay = (o.x.word + o.x.source + o.x.mean + o.x.story + o.d.name).toLowerCase();
        return hay.indexOf(state.kw) > -1;
      });

      grid.innerHTML = list.map(function (o) {
        var d = o.d, x = o.x;
        return (
          '<article class="id-entry reveal" data-kind="idiom" data-key="' + esc(x.word) + '" data-dyn="' + d.id + '" tabindex="0" role="button">' +
            '<div class="id-head">' +
              '<h3 class="id-word">' + x.word + "</h3>" +
              '<span class="id-kind k-' + x.kind + '">' + x.kind + "</span>" +
              '<span class="id-era">' + d.name + "</span>" +
            "</div>" +
            '<p class="id-mean">' + x.mean + "</p>" +
            '<p class="id-src">' + x.source + "</p>" +
            '<p class="id-story clamp-auto">' + x.story + "</p>" +
            '<div class="id-act"><button type="button" class="cmp-mini"' + cmpAttr("idiom", d, x.word) + ">⇄ 对照</button></div>" +
          "</article>"
        );
      }).join("") || '<p class="empty show">没有匹配的成语。</p>';

      var c = $("#idiomCount");
      if (c) c.textContent = list.length;
      EPIC.observe(grid);
      if (window.clampTargets) window.clampTargets(grid);
    }

    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      state.kind = b.dataset.ik;
      $$("button", tabs).forEach(function (x) { x.classList.toggle("active", x === b); });
      paint();
    });

    var input = $("#idiomSearch");
    if (input) {
      var t = null;
      input.addEventListener("input", function () {
        clearTimeout(t);
        t = setTimeout(function () {
          state.kw = input.value.trim().toLowerCase();
          paint();
        }, 140);
      });
    }

    paint();
  }

  /* ============================================================
     七、编年轴（可拖动 / 可缩放）
     统一纪年表：新增朝代时只需在此补一行区间
     ============================================================ */

  var AXIS_SPAN = {
    prehistoric: [-3000, -2070],
    xia: [-2070, -1600],
    shang: [-1600, -1046],
    "western-zhou": [-1046, -771],
    "spring-autumn": [-770, -476],
    "warring-states": [-475, -221],
    qin: [-221, -207],
    "western-han": [-202, 8],
    "eastern-han": [25, 220],
    "three-kingdoms": [220, 280],
    "western-jin": [266, 316],
    "eastern-jin": [317, 420],
    "northern-southern": [420, 589],
    sui: [581, 618],
    tang: [618, 907],
    "five-dynasties": [907, 960],
    "northern-song": [960, 1127],
    "southern-song": [1127, 1279],
    yuan: [1271, 1368],
    ming: [1368, 1644],
    qing: [1644, 1912],
    republic: [1912, 1949],
    prc: [1949, 2026]
  };

  var PERIOD_COLOR = {
    "远古先秦": "#9c2a1e",
    "秦汉": "#b08948",
    "魏晋南北朝": "#5b5183",
    "隋唐五代": "#c0392b",
    "宋辽金元": "#4a6b5a",
    "明清": "#3a5278",
    "近现代": "#7a6e5d"
  };

  function initAxis() {
    var host = $("#axisHost");
    var svg = $("#axisSvg");
    if (!host || !svg) return;

    var FULL = [-2150, 2060];
    var view = { c: (FULL[0] + FULL[1]) / 2, s: FULL[1] - FULL[0] };
    var H = 268;
    var W = 1000;
    var M = { l: 14, r: 14 };
    var ROW = { band: 30, bandH: 22, cn: 66, cnH: 46, wd: 136, wdH: 46, axis: 196 };

    function px(y) {
      return M.l + ((y - (view.c - view.s / 2)) / view.s) * (W - M.l - M.r);
    }
    function yearAt(x) {
      return (view.c - view.s / 2) + ((x - M.l) / (W - M.l - M.r)) * view.s;
    }

    function stepFor() {
      var ppy = (W - M.l - M.r) / view.s;
      var cands = [500, 250, 200, 100, 50, 25, 10, 5, 1];
      for (var i = 0; i < cands.length; i++) if (cands[i] * ppy >= 66) return cands[i];
      return 1;
    }
    function fmtYear(y) {
      y = Math.round(y);
      return y < 0 ? "前" + (-y) : String(y);
    }

    function paint() {
      W = Math.max(320, host.clientWidth);
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      svg.setAttribute("height", H);
      var ppy = (W - M.l - M.r) / view.s;
      var step = stepFor();
      var out = [];

      /* 刻度 */
      var start = Math.ceil((view.c - view.s / 2) / step) * step;
      var end = view.c + view.s / 2;
      out.push('<line class="ax-base" x1="' + M.l + '" y1="' + ROW.axis + '" x2="' + (W - M.r) + '" y2="' + ROW.axis + '"/>');
      for (var y = start; y <= end; y += step) {
        var x = px(y);
        if (x < M.l - 1 || x > W - M.r + 1) continue;
        var major = y % (step * 5) === 0;
        out.push('<line class="ax-tick' + (major ? " major" : "") + '" x1="' + x.toFixed(1) + '" y1="' + (ROW.axis - (major ? 8 : 4)) +
          '" x2="' + x.toFixed(1) + '" y2="' + ROW.axis + '"/>');
        out.push('<text class="ax-year' + (major ? " major" : "") + '" x="' + x.toFixed(1) + '" y="' + (ROW.axis + 20) + '">' + fmtYear(y) + "</text>");
        out.push('<line class="ax-grid" x1="' + x.toFixed(1) + '" y1="' + ROW.band + '" x2="' + x.toFixed(1) + '" y2="' + (ROW.axis - 2) + '"/>');
      }

      /* 朝代带 */
      DATA.forEach(function (d) {
        var sp = AXIS_SPAN[d.id];
        if (!sp) return;
        var x1 = px(sp[0]), x2 = px(sp[1]);
        var w = x2 - x1;
        if (x2 < M.l || x1 > W - M.r) return;
        var color = PERIOD_COLOR[d.period] || "#8a7f6d";
        var label = d.name;
        if (w > 62) label = d.name + " " + (sp[0] < 0 ? "前" + (-sp[0]) : sp[0]);
        out.push('<g class="ax-band-g" data-id="' + d.id + '" tabindex="0" role="button">' +
          '<rect class="ax-band" x="' + x1.toFixed(1) + '" y="' + ROW.band + '" width="' + Math.max(1.5, w).toFixed(1) +
          '" height="' + ROW.bandH + '" rx="2" fill="' + color + '" fill-opacity="0.82"/>' +
          (w > 16 ? '<text class="ax-band-t" x="' + (x1 + Math.min(w / 2, 6)).toFixed(1) + '" y="' + (ROW.band + 15) + '"' +
            (w < 46 ? ' text-anchor="middle" x="' + (x1 + w / 2).toFixed(1) + '"' : "") + ">" +
            (w > 46 ? label : d.name.slice(0, 1)) + "</text>" : "") +
          "</g>");
      });

      /* 中国事件 */
      DATA.forEach(function (d) {
        d.events.forEach(function (ev) {
          if (ev.year < FULL[0] || ev.year > FULL[1]) return;
          var x = px(ev.year);
          if (x < M.l || x > W - M.r) return;
          out.push('<circle class="ax-dot cn" cx="' + x.toFixed(1) + '" cy="' + (ROW.cn + 12) + '" r="2.6"' +
            ' data-kind="event" data-key="' + esc(ev.label) + '" data-dyn="' + d.id + '"' +
            ' data-tip="' + esc(d.name + " · " + ev.label + " · " + ev.text) + '"/>');
        });
      });
      out.push('<text class="ax-rowlabel" x="' + M.l + '" y="' + (ROW.cn - 6) + '">中国大事 ' + countCn() + "</text>");

      /* 世界事件 */
      var wd = 0;
      DATA.forEach(function (d) {
        d.worldEvents.forEach(function (ev) {
          if (ev.year < FULL[0] || ev.year > FULL[1]) return;
          var x = px(ev.year);
          if (x < M.l || x > W - M.r) return;
          wd++;
          out.push('<circle class="ax-dot wd" cx="' + x.toFixed(1) + '" cy="' + (ROW.wd + 12) + '" r="3"' +
            ' data-kind="world" data-key="' + esc(ev.title) + '" data-dyn="' + d.id + '"' +
            ' data-tip="' + esc(ev.place + " · " + ev.label + " · " + ev.title) + '"/>');
        });
      });
      out.push('<text class="ax-rowlabel" x="' + M.l + '" y="' + (ROW.wd - 6) + '">世界同期 ' + wd + "</text>");

      /* 两条对齐基线 */
      out.push('<line class="ax-guide" x1="' + M.l + '" y1="' + (ROW.cn + 12) + '" x2="' + (W - M.r) + '" y2="' + (ROW.cn + 12) + '"/>');
      out.push('<line class="ax-guide" x1="' + M.l + '" y1="' + (ROW.wd + 12) + '" x2="' + (W - M.r) + '" y2="' + (ROW.wd + 12) + '"/>');

      svg.innerHTML = out.join("");

      /* 窗口标尺 */
      var mini = $("#axisWindow");
      if (mini) {
        var p1 = ((view.c - view.s / 2) - FULL[0]) / (FULL[1] - FULL[0]);
        var p2 = ((view.c + view.s / 2) - FULL[0]) / (FULL[1] - FULL[0]);
        mini.style.left = Math.max(0, p1 * 100) + "%";
        mini.style.width = Math.min(100, (p2 - p1) * 100) + "%";
      }
      var zl = $("#axisZoomLabel");
      if (zl) zl.textContent = Math.round((FULL[1] - FULL[0]) / view.s * 10) / 10 + "×";
    }

    function countCn() {
      var n = 0;
      DATA.forEach(function (d) {
        d.events.forEach(function (ev) { if (ev.year >= FULL[0] && ev.year <= FULL[1]) n++; });
      });
      return n;
    }

    function clampView() {
      view.s = Math.max(40, Math.min(FULL[1] - FULL[0], view.s));
      var half = view.s / 2;
      view.c = Math.max(FULL[0] + half, Math.min(FULL[1] - half, view.c));
    }

    function zoomAt(factor, anchorYear) {
      var before = anchorYear;
      view.s = Math.max(40, Math.min(FULL[1] - FULL[0], view.s * factor));
      var frac = (before - (view.c - view.s / 2)) / view.s;
      view.c = before + view.s * (0.5 - frac);
      clampView();
      paint();
    }

    function zoomCenter(factor) { zoomAt(factor, view.c); }

    /* 拖动 */
    var dragging = false, lastX = 0, moved = 0;
    host.addEventListener("pointerdown", function (e) {
      if (e.target.closest("[data-kind]")) return;
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      host.classList.add("grabbing");
      host.setPointerCapture && host.setPointerCapture(e.pointerId);
    });
    host.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      var ppy = (host.clientWidth - M.l - M.r) / view.s;
      view.c -= dx / ppy;
      clampView();
      paint();
    });
    function endDrag() {
      dragging = false;
      host.classList.remove("grabbing");
    }
    host.addEventListener("pointerup", endDrag);
    host.addEventListener("pointercancel", endDrag);
    host.addEventListener("pointerleave", endDrag);

    /* 滚轮缩放 */
    host.addEventListener("wheel", function (e) {
      e.preventDefault();
      var rect = host.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = yearAt(x * (W / Math.max(1, rect.width)));
      zoomAt(e.deltaY > 0 ? 1.18 : 1 / 1.18, y);
    }, { passive: false });

    /* 悬停提示 */
    var tip = $("#axisTip");
    host.addEventListener("pointermove", function (e) {
      if (!tip) return;
      var t = e.target.closest && e.target.closest("[data-tip]");
      if (!t) { tip.classList.remove("show"); return; }
      tip.textContent = t.getAttribute("data-tip");
      tip.classList.add("show");
      var r = host.getBoundingClientRect();
      var left = e.clientX - r.left;
      tip.style.left = Math.min(Math.max(10, left - 90), r.width - 200) + "px";
      tip.style.top = (e.clientY - r.top - 44) + "px";
    }, { passive: true });
    host.addEventListener("pointerleave", function () { if (tip) tip.classList.remove("show"); });

    /* 按钮 */
    $$("[data-axis]").forEach(function (b) {
      b.addEventListener("click", function () {
        var act = b.dataset.axis;
        if (act === "in") zoomCenter(1 / 1.6);
        else if (act === "out") zoomCenter(1.6);
        else if (act === "reset") { view = { c: (FULL[0] + FULL[1]) / 2, s: FULL[1] - FULL[0] }; paint(); }
        else if (act === "pre-qin") { view = { c: -350, s: 900 }; clampView(); paint(); }
        else if (act === "tang-song") { view = { c: 900, s: 800 }; clampView(); paint(); }
        else if (act === "modern") { view = { c: 1830, s: 400 }; clampView(); paint(); }
      });
    });

    window.addEventListener("resize", function () { paint(); });
    paint();
  }

  /* 展开 / 收起：用捕获阶段拦截，避免点到卡片时同时打开详情 */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".more-btn");
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    var el = b.previousElementSibling;
    if (!el || !el.classList.contains("clamp-auto")) return;
    var open = el.classList.toggle("is-open");
    b.textContent = open ? "收起" : "展开";
    b.setAttribute("aria-expanded", open ? "true" : "false");
  }, true);

  /* 视口变化后重新判断是否需要「展开」 */
  var rzTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(rzTimer);
    rzTimer = setTimeout(function () {
      if (window.clampTargets) window.clampTargets(document);
    }, 220);
  });

  /* ============================================================
     八、卡片微交互
     ============================================================ */

  function attachTilt(root, sel) {
    if (REDUCE) return;
    root.addEventListener("pointermove", function (e) {
      var card = e.target.closest(sel);
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(0) + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(0) + "%");
    }, { passive: true });
  }

  /* ============================================================
     启动
     ============================================================ */
  initCompare();
  initGeo();
  initRelics();
  initWorld();
  initIdioms();
  initAxis();

  ["#relicGrid", "#worldGrid", "#idiomGrid", "#geoDetail"].forEach(function (s) {
    var el = $(s);
    if (el) attachTilt(el, "article, button");
  });

  window.EPIC_EXTRA = { ITEMS: ITEMS, slots: slots, addToCompare: addToCompare };
})();
