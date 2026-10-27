/* ============================================================
   华夏五千年 · 交互逻辑
   数据层 data.js / media.js    特效层 fx.js
   ============================================================ */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (v) {
    return String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var docEl = document.documentElement;
  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  docEl.classList.add("js");

  /* ---------------- 正文折叠：最多三行 + 展开 ---------------- */
  function clampTargets(root) {
    resetFold(root);
    var nodes = (root || document).querySelectorAll(".clamp-auto");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.classList.contains("is-open")) continue;
      el.classList.remove("is-open");
      var next = el.nextElementSibling;
      if (next && next.classList.contains("more-btn")) next.remove();
      var over = el.scrollHeight - el.clientHeight > 2;
      el.classList.toggle("is-folded", over);
      if (over) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "more-btn";
        b.textContent = "展开";
        b.setAttribute("aria-expanded", "false");
        el.parentNode.insertBefore(b, el.nextSibling);
      }
    }
    updateFold(root);
  }
  window.clampTargets = clampTargets;
  window.addEventListener("load", function () { clampTargets(document); });

  /* ---------------- 模块级「查看更多」：默认只露三行 ---------------- */
  var FOLD_IDS = ["relicGrid", "worldGrid", "idiomGrid", "mythGrid", "battleGrid", "filmGrid"];

  function resetFold(grid) {
    if (!grid || !grid.id || !FOLD_IDS || FOLD_IDS.indexOf(grid.id) < 0) return;
    grid.classList.add("foldable");
    grid.classList.remove("is-expanded");
    var b = document.querySelector('[data-fold="' + grid.id + '"]');
    if (b) {
      b.textContent = "查看更多 ↓";
      b.setAttribute("aria-expanded", "false");
    }
  }

  function updateFold(grid) {
    if (!grid || !grid.id) return;
    if (FOLD_IDS.indexOf(grid.id) < 0) return;
    grid.classList.add("foldable");
    var btn = document.querySelector('[data-fold="' + grid.id + '"]');
    if (!btn) return;
    var expanded = grid.classList.contains("is-expanded");
    var over = grid.scrollHeight - grid.clientHeight > 40;
    btn.parentNode.style.display = expanded || over ? "" : "none";
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest(".fold-btn");
    if (!b) return;
    var grid = document.getElementById(b.dataset.fold);
    if (!grid) return;
    var open = grid.classList.toggle("is-expanded");
    b.textContent = open ? "收起 ↑" : "查看更多 ↓";
    b.setAttribute("aria-expanded", open ? "true" : "false");
    if (!open) grid.scrollIntoView({ block: "start", behavior: "smooth" });
  });

  /* ---------------- 数据整合 ---------------- */
  var DATA = DYNASTIES.map(function (d) {
    var extra = MEDIA[d.id] || {};
    var lore = LORE[d.id] || {};
    var geo = GEO[d.id] || {};
    var world = WORLD[d.id] || { events: [] };
    var mythList = (lore.myths || []).map(function (m) {
      return Object.assign({}, m, { detail: DETAIL[d.id + "::" + m.name] || {} });
    });
    var battleList = (lore.battles || []).map(function (b) {
      return Object.assign({}, b, { detail: DETAIL[d.id + "::" + b.name] || {} });
    });
    var peopleList = (PEOPLE[d.id] || []).map(function (p) {
      return { name: p.name, role: p.role, note: p.note };
    });
    return Object.assign({}, d, {
      films: extra.films || [],
      beauties: extra.beauties || [],
      myths: mythList,
      battles: battleList,
      institutions: lore.institutions || [],
      culture: lore.culture || [],
      rulers: RULERS[d.id] || [],
      people: peopleList,
      geo: geo,
      relics: RELICS[d.id] || [],
      world: world,
      worldEvents: world.events || [],
      idioms: IDIOMS[d.id] || [],
      capitals: geo.capitals || [],
      admin: geo.admin || []
    });
  });

  var BY_ID = new Map(DATA.map(function (d) { return [d.id, d]; }));

  var state = {
    period: "全部",
    keyword: "",
    sortKey: "year",
    sortDir: "asc",
    topic: TOPICS[0].id,
    filmType: "全部",
    mythType: "全部",
    battlePeriod: "全部"
  };

  /* ---------------- 检索索引 ---------------- */
  var INDEX = new Map(DATA.map(function (d) {
    var parts = [d.name, d.en, d.period, d.years, d.tags.join(" "), d.card, d.summary];
    d.sections.forEach(function (s) {
      parts.push(s.h);
      if (s.text) parts.push(s.text);
      if (s.items) s.items.forEach(function (i) { parts.push(i); });
    });
    parts.push(d.figures.join(" "));
    d.events.forEach(function (e) { parts.push(e.label + " " + e.text); });
    d.films.forEach(function (f) { parts.push(f.title + " " + f.note + " " + f.t); });
    d.beauties.forEach(function (b) { parts.push(b.name + " " + b.note); });
    d.myths.forEach(function (x) { parts.push(x.name + " " + x.desc + " " + x.type + " " + x.source); });
    d.battles.forEach(function (x) { parts.push(x.name + " " + x.sides + " " + x.desc + " " + x.result); });
    d.institutions.forEach(function (x) { parts.push(x.name + " " + x.desc); });
    d.culture.forEach(function (x) { parts.push(x.name + " " + x.desc); });
    d.relics.forEach(function (x) { parts.push([x.name, x.aka, x.tag, x.year, x.material, x.place, x.desc].join(" ")); });
    d.worldEvents.forEach(function (x) { parts.push([x.title, x.place, x.region, x.label, x.desc, x.cn, x.compare].join(" ")); });
    d.idioms.forEach(function (x) { parts.push([x.word, x.kind, x.source, x.mean, x.story].join(" ")); });
    d.capitals.forEach(function (x) { parts.push([x.name, x.now, x.years, x.reason].join(" ")); });
    d.admin.forEach(function (x) { parts.push(x.name + " " + x.desc); });
    if (d.geo && d.geo.areaNote) parts.push(d.geo.areaNote + " " + d.geo.adminSystem);
    return [d.id, parts.join(" ").toLowerCase()];
  }));

  /* ---------------- HERO 统计 ---------------- */
  (function heroStats() {
    var box = $("#heroStats");
    if (!box) return;
    var stats = [
      { n: 5000, u: "年", t: "文明纵深" },
      { n: DATA.length, u: "个", t: "历史时期" },
      { n: DATA.reduce(function (a, d) { return a + d.events.length; }, 0), u: "件", t: "关键大事" },
      { n: DATA.reduce(function (a, d) { return a + d.battles.length; }, 0), u: "场", t: "著名战役" },
      { n: DATA.reduce(function (a, d) { return a + d.relics.length; }, 0), u: "件", t: "代表文物" },
      { n: DATA.reduce(function (a, d) { return a + d.worldEvents.length; }, 0), u: "件", t: "世界同期" },
      { n: DATA.reduce(function (a, d) { return a + d.idioms.length; }, 0), u: "条", t: "成语典故" }
    ];
    box.innerHTML = stats.map(function (s) {
      return '<div class="stat"><b data-n="' + s.n + '">0<em>' + s.u + "</em></b><span>" + s.t + "</span></div>";
    }).join("");

    var nums = $$("b[data-n]", box);
    if (REDUCE) {
      nums.forEach(function (b) { b.firstChild.nodeValue = b.dataset.n; });
      return;
    }
    var t0 = performance.now();
    var dur = 1400;
    (function tick(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      nums.forEach(function (b) {
        b.firstChild.nodeValue = Math.round(Number(b.dataset.n) * e).toLocaleString("en-US");
      });
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  })();

  /* ---------------- 筛选 ---------------- */
  (function renderFilters() {
    var box = $("#filters");
    if (!box) return;
    box.innerHTML = ["全部"].concat(PERIODS).map(function (p, i) {
      return '<button type="button" data-period="' + p + '"' + (i === 0 ? ' class="active"' : "") + ">" + p + "</button>";
    }).join("");
    box.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      state.period = btn.dataset.period;
      $$("button", box).forEach(function (b) { b.classList.toggle("active", b === btn); });
      renderCards();
    });
  })();

  /* ---------------- 朝代卡片 ---------------- */
  function match(d) {
    if (state.period !== "全部" && d.period !== state.period) return false;
    if (!state.keyword) return true;
    return INDEX.get(d.id).indexOf(state.keyword) > -1;
  }

  function renderCards() {
    var grid = $("#dynastyGrid");
    if (!grid) return;
    var list = DATA.filter(match);

    grid.innerHTML = list.map(function (d) {
      var tags = d.tags.slice(0, 3).map(function (t) { return "<span>" + t + "</span>"; }).join("");
      return (
        '<article class="d-card reveal" data-id="' + d.id + '" tabindex="0" role="button" aria-label="展开 ' + d.name + ' 详情">' +
          '<div class="d-top">' +
            "<h3>" + d.name + "<small>" + d.en + "</small></h3>" +
            '<span class="d-period">' + d.period + "</span>" +
          "</div>" +
          '<div class="d-years">' + d.years + "</div>" +
          '<p class="clamp">' + d.card + "</p>" +
          '<div class="d-tags">' + tags + "</div>" +
          '<div class="d-foot">' +
            '<span class="d-count" data-icon="片">' + (d.films.length) + " 部影视</span>" +
            '<span class="d-more">展开全文 <i>→</i></span>' +
          "</div>" +
        "</article>"
      );
    }).join("");

    var empty = $("#emptyTip");
    if (empty) empty.classList.toggle("show", list.length === 0);

    observe(grid);
    renderChrono();
  }

  /* ---------------- 时间轴 ---------------- */
  function renderTimeline() {
    var box = $("#timelineList");
    if (!box) return;
    box.innerHTML = DATA.map(function (d) {
      var keys = d.tags.slice(0, 4).map(function (t) { return "<span>" + t + "</span>"; }).join("");
      return (
        '<div class="tl-item reveal">' +
          '<div class="tl-card" data-id="' + d.id + '" tabindex="0" role="button">' +
            '<div class="tl-year">' + d.years + "</div>" +
            '<div class="tl-title">' + d.name + "<small>" + d.period + "</small></div>" +
            '<p class="tl-text">' + d.card + "</p>" +
            '<div class="tl-keys">' + keys + "</div>" +
          "</div>" +
        "</div>"
      );
    }).join("");
    observe(box);
  }

  /* ---------------- 专题 ---------------- */
  function renderTopicTabs() {
    var box = $("#topicTabs");
    if (!box) return;
    box.innerHTML = TOPICS.map(function (t, i) {
      return '<button type="button" data-topic="' + t.id + '"' + (i === 0 ? ' class="active"' : "") + ">" + t.name + "</button>";
    }).join("");
    box.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      state.topic = btn.dataset.topic;
      $$("button", box).forEach(function (b) { b.classList.toggle("active", b === btn); });
      renderTopicPanel();
    });
  }

  function renderTopicPanel() {
    var t = TOPICS.find(function (x) { return x.id === state.topic; }) || TOPICS[0];
    var panel = $("#topicPanel");
    if (!panel) return;
    panel.innerHTML =
      '<p class="topic-intro">' + t.intro + "</p>" +
      '<div class="topic-items">' +
        t.items.map(function (i, idx) {
          return (
            '<div class="t-item" style="--i:' + idx + '">' +
              '<div class="t-when">' + i.when + "</div>" +
              "<div><h4>" + i.title + "</h4><p>" + i.desc + "</p></div>" +
            "</div>"
          );
        }).join("") +
      "</div>";
  }

  /* ---------------- 大事年表 ---------------- */
  var EVENTS = [];
  DATA.forEach(function (d) {
    d.events.forEach(function (e) {
      EVENTS.push({ year: e.year, label: e.label, event: e.text, era: d.name, id: d.id });
    });
  });

  function renderChrono() {
    var body = $("#chronoBody");
    if (!body) return;
    var rows = EVENTS;

    if (state.keyword) {
      rows = rows.filter(function (r) {
        return (r.label + r.event + r.era).toLowerCase().indexOf(state.keyword) > -1;
      });
    }

    var dir = state.sortDir === "asc" ? 1 : -1;
    rows = rows.slice().sort(function (a, b) {
      if (state.sortKey === "year") return (a.year - b.year) * dir;
      return String(a[state.sortKey]).localeCompare(String(b[state.sortKey]), "zh") * dir;
    });

    body.innerHTML = rows.map(function (r) {
      return (
        '<tr data-id="' + r.id + '" tabindex="0">' +
          "<td>" + r.label + "</td>" +
          "<td>" + r.event + "</td>" +
          "<td>" + r.era + "</td>" +
        "</tr>"
      );
    }).join("") || '<tr><td colspan="3" class="chrono-empty">无匹配记录</td></tr>';
  }

  (function initChronoSort() {
    $$(".chrono th.sortable").forEach(function (th) {
      th.addEventListener("click", function () {
        var key = th.dataset.sort;
        if (state.sortKey === key) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortKey = key;
          state.sortDir = "asc";
        }
        $$(".chrono th").forEach(function (t) { t.classList.remove("sort-asc", "sort-desc"); });
        th.classList.add(state.sortDir === "asc" ? "sort-asc" : "sort-desc");
        renderChrono();
      });
    });
  })();

  /* ---------------- 光影画廊 ---------------- */
  var FILM_TYPES = ["全部", "电影", "电视剧", "纪录片", "动画"];

  (function initGallery() {
    var tabs = $("#filmTypes");
    var grid = $("#filmGrid");
    if (!tabs || !grid) return;

    var all = [];
    var seen = Object.create(null);
    DATA.forEach(function (d) {
      d.films.forEach(function (f) {
        var key = f.t + "::" + f.title;
        if (seen[key]) {
          if (seen[key].eras.indexOf(d.name) < 0) seen[key].eras.push(d.name);
          return;
        }
        seen[key] = {
          t: f.t, title: f.title, year: f.year, note: f.note,
          era: d.name, eras: [d.name], period: d.period, id: d.id
        };
        all.push(seen[key]);
      });
    });

    tabs.innerHTML = FILM_TYPES.map(function (t, i) {
      var n = t === "全部" ? all.length : all.filter(function (x) { return x.t === t; }).length;
      return '<button type="button" data-type="' + t + '"' + (i === 0 ? ' class="active"' : "") + ">" + t +
        "<i>" + n + "</i></button>";
    }).join("");

    function paint() {
      var list = state.filmType === "全部" ? all : all.filter(function (x) { return x.t === state.filmType; });
      var groups = FILM_TYPES.slice(1).map(function (t) {
        return { t: t, items: list.filter(function (x) { return x.t === t; }) };
      }).filter(function (g) { return g.items.length; });

      grid.innerHTML = groups.map(function (g) {
        return (
          '<section class="fm-group">' +
            '<h4 class="fm-gh"><span>' + g.t + "</span><em>" + g.items.length + " 部</em></h4>" +
            '<ul class="fm-list">' +
              g.items.map(function (f) {
                return (
                  '<li class="fm-item reveal" data-kind="film" data-key="' + esc(f.title) + '" data-dyn="' + f.id + '" tabindex="0" role="button">' +
                    '<div class="fm-head">' +
                      "<b>《" + f.title + "》</b>" +
                      '<span class="fm-year">' + f.year + "</span>" +
                      '<span class="fm-era">' +
                        (f.eras.length > 2 ? f.eras.slice(0, 2).join("、") + " 等" : f.eras.join("、")) +
                      "</span>" +
                    "</div>" +
                    '<p class="fm-note clamp-auto">' + f.note + "</p>" +
                  "</li>"
                );
              }).join("") +
            "</ul>" +
          "</section>"
        );
      }).join("");

      var count = $("#filmCount");
      if (count) count.textContent = all.length;
      var ac = $("#animeCount");
      if (ac) ac.textContent = all.filter(function (x) { return x.t === "动画"; }).length;
      observe(grid);
      clampTargets(grid);
    }

    tabs.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      state.filmType = btn.dataset.type;
      $$("button", tabs).forEach(function (b) { b.classList.toggle("active", b === btn); });
      paint();
    });

    paint();
  })();

  /* ---------------- 神话与传说 ---------------- */
  var MYTH_TYPES = ["全部", "创世", "英雄", "志怪", "传奇", "仙话", "民间", "帝王"];

  (function initMyths() {
    var tabs = $("#mythTypes");
    var grid = $("#mythGrid");
    if (!tabs || !grid) return;

    var all = [];
    DATA.forEach(function (d) {
      d.myths.forEach(function (m) {
        all.push({
          name: m.name, type: m.type, source: m.source, desc: m.desc,
          era: d.name, period: d.period, id: d.id
        });
      });
    });

    tabs.innerHTML = MYTH_TYPES.map(function (t, i) {
      var n = t === "全部" ? all.length : all.filter(function (x) { return x.type === t; }).length;
      return '<button type="button" data-mtype="' + t + '"' + (i === 0 ? ' class="active"' : "") + ">" +
        t + "<i>" + n + "</i></button>";
    }).join("");

    function paint() {
      var list = state.mythType === "全部"
        ? all
        : all.filter(function (x) { return x.type === state.mythType; });

      grid.innerHTML = list.map(function (m) {
        return (
          '<article class="myth-card reveal" data-kind="myth" data-key="' + esc(m.name) + '" data-dyn="' + m.id + '" tabindex="0" role="button">' +
            '<div class="my-head">' +
              '<span class="my-type t-' + m.type + '">' + m.type + "</span>" +
              '<span class="my-era">' + m.era + "</span>" +
            "</div>" +
            "<h3>" + m.name + "</h3>" +
            '<p class="clamp-auto">' + m.desc + "</p>" +
            '<div class="my-src">' + m.source + "</div>" +
          "</article>"
        );
      }).join("") || '<p class="empty show">暂无此类条目。</p>';

      var c = $("#mythCount");
      if (c) c.textContent = list.length;
      observe(grid);
      clampTargets(grid);
    }

    tabs.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      state.mythType = btn.dataset.mtype;
      $$("button", tabs).forEach(function (b) { b.classList.toggle("active", b === btn); });
      paint();
    });

    paint();
  })();

  /* ---------------- 战史 ---------------- */
  var BATTLE_PERIODS = ["全部"].concat(PERIODS);

  (function initBattles() {
    var tabs = $("#battlePeriods");
    var grid = $("#battleGrid");
    if (!tabs || !grid) return;

    var all = [];
    DATA.forEach(function (d) {
      d.battles.forEach(function (b) {
        all.push({
          name: b.name, year: b.year, sides: b.sides, result: b.result, desc: b.desc,
          era: d.name, period: d.period, id: d.id
        });
      });
    });

    tabs.innerHTML = BATTLE_PERIODS.map(function (p, i) {
      var n = p === "全部" ? all.length : all.filter(function (x) { return x.period === p; }).length;
      return '<button type="button" data-bp="' + p + '"' + (i === 0 ? ' class="active"' : "") + ">" +
        p + "<i>" + n + "</i></button>";
    }).join("");

    function paint() {
      var list = state.battlePeriod === "全部"
        ? all
        : all.filter(function (x) { return x.period === state.battlePeriod; });

      grid.innerHTML = list.map(function (b) {
        var sides = b.sides.split(" vs ");
        var sideHTML = sides.length === 2
          ? '<span class="bt-sides"><b>' + sides[0] + "</b><i>×</i><b>" + sides[1] + "</b></span>"
          : '<span class="bt-sides"><b>' + b.sides + "</b></span>";
        return (
          '<article class="bt-row reveal" data-kind="battle" data-key="' + esc(b.name) + '" data-dyn="' + b.id + '" tabindex="0" role="button">' +
            '<div class="bt-when">' +
              '<span class="bt-year">' + b.year + "</span>" +
              '<span class="bt-era">' + b.era + "</span>" +
            "</div>" +
            '<div class="bt-main">' +
              '<div class="bt-line"><h3>' + b.name + "</h3>" + sideHTML + "</div>" +
              '<p class="clamp-auto">' + b.desc + "</p>" +
            "</div>" +
            '<div class="bt-res"><em>结果</em><b>' + b.result + "</b></div>" +
          "</article>"
        );
      }).join("") || '<p class="empty show">暂无此类条目。</p>';

      var c = $("#battleCount");
      if (c) c.textContent = list.length;
      observe(grid);
      clampTargets(grid);
    }

    tabs.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      state.battlePeriod = btn.dataset.bp;
      $$("button", tabs).forEach(function (b) { b.classList.toggle("active", b === btn); });
      paint();
    });

    paint();
  })();

  /* ---------------- 检索 ---------------- */
  (function initSearch() {
    var input = $("#search");
    if (!input) return;
    var box = input.parentElement;
    var timer = null;

    input.addEventListener("input", function () {
      var v = input.value.trim();
      box.classList.toggle("filled", v.length > 0);
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.keyword = v.toLowerCase();
        renderCards();
      }, 150);
    });

    var clear = $("#clearSearch");
    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        box.classList.remove("filled");
        state.keyword = "";
        renderCards();
        input.focus();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== input) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });
  })();

  /* ---------------- 详情抽屉 ---------------- */
  var drawer = $("#drawer");
  var mask = $("#drawerMask");
  var lastFocus = null;

  function filmHTML(f, id) {
    return (
      '<li class="f-item" data-kind="film" data-key="' + esc(f.title) + '" data-dyn="' + id + '">' +
        '<div class="f-head">' +
          '<span class="f-type t-' + f.t + '">' + f.t + "</span>" +
          '<b>《' + f.title + "》</b>" +
          '<em>' + f.year + "</em>" +
        "</div>" +
        "<p>" + f.note + "</p>" +
      "</li>"
    );
  }

  function openDrawer(id) {
    var d = BY_ID.get(id);
    if (!d || !drawer) return;

    var sections = d.sections.map(function (s) {
      var body = s.text
        ? "<p>" + s.text + "</p>"
        : "<ul>" + s.items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul>";
      return '<div class="dr-section"><h4>' + s.h + "</h4>" + body + "</div>";
    }).join("");

    var films = d.films.length
      ? '<div class="dr-section dr-films" id="dr-films"><h4>光影中国</h4><ul class="f-list">' + d.films.map(function (f) { return filmHTML(f, d.id); }).join("") + "</ul></div>"
      : "";

    var mythHTML = d.myths.length
      ? '<div class="dr-section" id="dr-myth"><h4>神话与传说</h4><ul class="lore-list">' +
          d.myths.map(function (m) {
            return (
              '<li class="l-item" data-kind="myth" data-key="' + esc(m.name) + '" data-dyn="' + d.id + '">' +
                '<div class="l-head"><b>' + m.name + '</b><span class="l-tag t-' + m.type + '">' + m.type + "</span></div>" +
                "<p>" + m.desc + "</p>" +
                "<em>" + m.source + "</em>" +
              "</li>"
            );
          }).join("") +
        "</ul></div>"
      : "";

    var battleHTML = d.battles.length
      ? '<div class="dr-section" id="dr-battles"><h4>著名战役</h4><ul class="lore-list">' +
          d.battles.map(function (b) {
            return (
              '<li class="l-item" data-kind="battle" data-key="' + esc(b.name) + '" data-dyn="' + d.id + '">' +
                '<div class="l-head"><b>' + b.name + '</b><span class="l-tag">' + b.year + "</span></div>" +
                "<p>" + b.desc + "</p>" +
                "<em>" + b.sides + "　·　" + b.result + "</em>" +
              "</li>"
            );
          }).join("") +
        "</ul></div>"
      : "";

    function block(title, list, id, kind) {
      if (!list.length) return "";
      return '<div class="dr-section" id="' + id + '"><h4>' + title + '</h4><div class="i-list">' +
        list.map(function (x) {
          return '<div class="i-item" data-kind="' + kind + '" data-key="' + esc(x.name) +
            '" data-dyn="' + d.id + '"><b>' + x.name + "</b><p>" + x.desc + "</p></div>";
        }).join("") +
        "</div></div>";
    }

    var instHTML = block("制度速览", d.institutions, "dr-inst", "inst");
    var cultureHTML = block("文化速览", d.culture, "dr-culture", "culture");

    function geoSection() {
      var g = d.geo;
      if (!g || !g.extent) return "";
      var ex = [["北至", g.extent.n], ["南至", g.extent.s], ["西至", g.extent.w], ["东至", g.extent.e]]
        .map(function (r) { return "<div><em>" + r[0] + "</em>" + r[1] + "</div>"; }).join("");
      var caps = (g.capitals || []).map(function (c) { return c.name; }).join(" → ");
      return '<div class="dr-section" id="dr-geo"><h4>地理<em>' +
        (g.area ? "约 " + g.area + " 万 km²" : "无统一政权") + "</em></h4>" +
        '<div class="dr-extent">' + ex + "</div>" +
        "<ul>" +
          (caps ? "<li><strong>都城</strong>　" + caps + "</li>" : "") +
          "<li><strong>区划</strong>　" + g.adminSystem + "</li>" +
          "<li><strong>沿革</strong>　" + (g.admin || []).map(function (a) { return a.name; }).join("、") + "</li>" +
        "</ul>" +
        '<p class="dr-src">' + g.areaNote + "</p></div>";
    }

    function relicSection() {
      if (!d.relics.length) return "";
      return '<div class="dr-section" id="dr-relics"><h4>代表文物<em>' + d.relics.length + ' 件</em></h4><ul class="lore-list">' +
        d.relics.map(function (x) {
          return (
            '<li class="l-item" data-kind="relic" data-key="' + esc(x.name) + '" data-dyn="' + d.id + '">' +
              '<div class="l-head"><b>' + x.name + '</b><span class="l-tag">' + x.tag + "</span></div>" +
              "<p>" + x.desc + "</p>" +
              "<em>" + x.year + "　·　" + x.place + "</em>" +
            "</li>"
          );
        }).join("") + "</ul></div>";
    }

    function worldSection() {
      if (!d.worldEvents.length) return "";
      return '<div class="dr-section" id="dr-world"><h4>同期世界<em>' + d.worldEvents.length + ' 件</em></h4><ul class="lore-list">' +
        d.worldEvents.map(function (x) {
          return (
            '<li class="l-item" data-kind="world" data-key="' + esc(x.title) + '" data-dyn="' + d.id + '">' +
              '<div class="l-head"><b>' + x.title + '</b><span class="l-tag">' + x.label + "</span></div>" +
              "<p>" + x.desc + "</p>" +
              "<em>" + x.region + " · " + x.place + "</em>" +
            "</li>"
          );
        }).join("") + "</ul></div>";
    }

    function idiomSection() {
      if (!d.idioms.length) return "";
      return '<div class="dr-section" id="dr-idioms"><h4>成语典故<em>' + d.idioms.length + ' 条</em></h4><div class="i-list">' +
        d.idioms.map(function (x) {
          return (
            '<div class="i-item" data-kind="idiom" data-key="' + esc(x.word) + '" data-dyn="' + d.id + '">' +
              "<b>" + x.word + '<span class="i-kind">' + x.kind + "</span></b>" +
              "<p>" + x.mean + "</p>" +
            "</div>"
          );
        }).join("") + "</div></div>";
    }

    var beauties = d.beauties.length
      ? '<div class="dr-section dr-beauties" id="dr-beauties"><h4>绝代风华</h4><div class="b-grid">' +
          d.beauties.map(function (b) {
            return '<div class="b-item" data-kind="beauty" data-key="' + esc(b.name) +
              '" data-dyn="' + d.id + '"><b>' + b.name + "</b><p>" + b.note + "</p></div>";
          }).join("") +
        "</div></div>"
      : "";

    function rulerSection() {
      if (!d.rulers.length) return "";
      var lastGroup = "";
      var rows = d.rulers.map(function (r, i) {
        var g = r.group || "";
        var head = (g && g !== lastGroup) ? '<div class="rgroup">' + g + "</div>" : "";
        if (g) lastGroup = g;
        return head +
          '<div class="rrow" data-kind="ruler" data-key="' + esc(r.title) + '" data-dyn="' + d.id +
            '" tabindex="0" role="button">' +
            '<span class="r-idx">' + (i + 1 < 10 ? "0" : "") + (i + 1) + "</span>" +
            '<span class="r-title">' + r.title + "</span>" +
            '<span class="r-name">' + (r.name || "") + "</span>" +
            '<span class="r-reign">' + r.reign + "</span>" +
          "</div>";
      }).join("");
      return '<div class="dr-section" id="dr-rulers"><h4>历代君主<em>' + d.rulers.length +
        ' 位</em></h4><div class="ruler-list">' + rows + "</div></div>";
    }

    function peopleSection() {
      if (!d.people.length) return "";
      return '<div class="dr-section" id="dr-people"><h4>重要人物</h4><div class="fig-grid">' +
        d.people.map(function (p) {
          return '<button type="button" class="fig-item" data-kind="person" data-key="' + esc(p.name) +
            '" data-dyn="' + d.id + '"><b>' + p.name + "</b><em>" + p.role + "</em></button>";
        }).join("") + "</div></div>";
    }

    var jumps = [
      ["dr-rulers", "君主", d.rulers.length],
      ["dr-events", "大事", d.events.length],
      ["dr-people", "人物", d.people.length],
      ["dr-geo", "地理", d.geo && d.geo.extent ? 1 : 0],
      ["dr-relics", "文物", d.relics.length],
      ["dr-world", "世界", d.worldEvents.length],
      ["dr-idioms", "成语", d.idioms.length],
      ["dr-myth", "神话", d.myths.length],
      ["dr-battles", "战役", d.battles.length],
      ["dr-inst", "制度", d.institutions.length],
      ["dr-culture", "文化", d.culture.length],
      ["dr-films", "影视", d.films.length],
      ["dr-beauties", "风华", d.beauties.length]
    ].filter(function (j) { return j[2] > 0; });

    var jumpHTML = '<div class="dr-jump">' + jumps.map(function (j) {
      return '<button type="button" data-target="' + j[0] + '">' + j[1] + "<i>" + j[2] + "</i></button>";
    }).join("") + "</div>";

    $("#drawerBody").innerHTML =
      jumpHTML +
      '<div class="dr-period">' + d.period + "</div>" +
      '<h2 class="dr-title">' + d.name + "</h2>" +
      '<div class="dr-en">' + d.en + "</div>" +
      '<div class="dr-meta">' +
        "<div><em>起止</em>" + d.years + "</div>" +
        "<div><em>历时</em>" + d.span + "</div>" +
        "<div><em>都城</em>" + d.capital + "</div>" +
        "<div><em>开国</em>" + d.founder + "</div>" +
      "</div>" +
      '<p class="dr-summary">' + d.summary + "</p>" +
      sections +
      geoSection() +
      relicSection() +
      rulerSection() +
      '<div class="dr-section" id="dr-events"><h4>关键事件</h4><ul>' +
        d.events.map(function (e) {
          return '<li data-kind="event" data-key="' + esc(e.label) + '" data-dyn="' + d.id +
            '"><strong>' + e.label + "</strong>　" + e.text + "</li>";
        }).join("") +
      "</ul></div>" +
      mythHTML +
      battleHTML +
      worldSection() +
      instHTML +
      cultureHTML +
      idiomSection() +
      films +
      beauties +
      peopleSection() +
      '<p class="dr-quote">' + d.quote + "</p>";

    if (itemModal && itemModal.classList.contains("open")) closeItem();
    lastFocus = document.activeElement;
    drawer.classList.add("open");
    mask.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    drawer.scrollTop = 0;
    document.body.classList.add("lock");
    var close = $("#drawerClose");
    if (close) close.focus({ preventScroll: true });
  }

  function closeDrawer() {
    if (!drawer || !drawer.classList.contains("open")) return;
    drawer.classList.remove("open");
    mask.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lock");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  /* ---------------- 条目详情 ---------------- */
  var itemModal = $("#itemModal");
  var itemMask = $("#itemMask");
  var itemBody = $("#itemBody");
  var itemFocus = null;

  var ITEM_KINDS = {
    myth:    { arr: "myths",         field: "name",  label: "神话" },
    battle:  { arr: "battles",       field: "name",  label: "战役" },
    film:    { arr: "films",         field: "title", label: "影视" },
    beauty:  { arr: "beauties",      field: "name",  label: "风华" },
    inst:    { arr: "institutions",  field: "name",  label: "制度" },
    culture: { arr: "culture",       field: "name",  label: "文化" },
    event:   { arr: "events",        field: "label", label: "大事" },
    ruler:   { arr: "rulers",        field: "title", label: "帝王" },
    person:  { arr: "people",        field: "name",  label: "人物" },
    relic:   { arr: "relics",        field: "name",  label: "文物" },
    world:   { arr: "worldEvents",   field: "title", label: "世界坐标" },
    idiom:   { arr: "idioms",        field: "word",  label: "成语" },
    capital: { arr: "capitals",      field: "name",  label: "都城" },
    admin:   { arr: "admin",         field: "name",  label: "州郡" },
    dynasty: { arr: null,            field: "name",  label: "朝代" }
  };

  /* 通用条目渲染表：新增栏目只需在此登记一个 kind，
     详情弹层、对照视图即可同时支持（单一事实来源） */
  var GENERIC = {
    relic: {
      label: "文物",
      eyebrow: function (x, d) { return "文物 · " + x.tag; },
      title: function (x) { return x.name; },
      chips: function (x, d) { return [x.year, x.tag, d.name].filter(Boolean); },
      desc: function (x) { return x.desc; },
      rows: function (x) {
        return [["年代", x.year], ["类别", x.tag], ["材质", x.material], ["尺寸重量", x.size], ["收藏地", x.place], ["别称", x.aka]];
      },
      note: function (x) { return "来源 · " + x.source; },
      relLabel: "同期文物"
    },
    world: {
      label: "世界坐标",
      eyebrow: function (x) { return "世界坐标 · " + x.region; },
      title: function (x) { return x.title; },
      chips: function (x, d) { return [x.label, x.place, x.region].filter(Boolean); },
      desc: function (x) { return x.desc; },
      blocks: function (x) {
        return [
          ["同期的中国", x.cn],
          ["横向对照", x.compare]
        ];
      },
      rows: function (x) { return [["年代", x.label], ["地区", x.region], ["地点", x.place]]; },
      note: null,
      relLabel: "同期世界事件"
    },
    idiom: {
      label: "成语",
      eyebrow: function (x) { return x.kind + " · 出处考"; },
      title: function (x) { return x.word; },
      chips: function (x, d) { return [x.kind, d.name]; },
      desc: function (x) { return x.mean; },
      blocks: function (x) { return [["本事与流变", x.story], ["出处", x.source]]; },
      rows: function (x) { return [["类型", x.kind], ["出处", x.source], ["今义", x.mean]]; },
      note: null,
      relLabel: "同期成语"
    },
    capital: {
      label: "都城",
      eyebrow: function (x, d) { return "都城 · " + d.name; },
      title: function (x) { return x.name; },
      chips: function (x, d) { return [x.years, x.now, d.name].filter(Boolean); },
      desc: function (x) { return x.reason; },
      rows: function (x, d) { return [["年代", x.years], ["今地", x.now], ["所属", d.name]]; },
      note: null,
      relLabel: "同期都城"
    },
    admin: {
      label: "州郡",
      eyebrow: function (x, d) { return "州郡沿革 · " + d.name; },
      title: function (x) { return x.name; },
      chips: function (x, d) { return [d.geo.adminSystem, d.name].filter(Boolean); },
      desc: function (x) { return x.desc; },
      rows: function (x, d) { return [["制度总称", d.geo.adminSystem], ["所属时期", d.name], ["起止", d.years]]; },
      note: null,
      relLabel: "同期行政建置"
    },
    dynasty: {
      label: "朝代",
      eyebrow: function (x) { return "朝代 · " + x.period; },
      title: function (x) { return x.name; },
      chips: function (x) { return [x.years, x.period]; },
      desc: function (x) { return x.summary; },
      blocks: function (x) {
        return [
          ["疆域", (x.geo.area ? "约 " + x.geo.area + " 万平方公里。" : "") + x.geo.areaNote],
          ["行政区划", x.geo.adminSystem],
          ["都城", x.capitals.map(function (c) { return c.name + "（" + c.now + "）"; }).join("、")]
        ];
      },
      rows: function (x) {
        return [["起止", x.years], ["历时", x.span], ["都城", x.capital], ["开国", x.founder],
                ["疆域", x.geo.area ? "约 " + x.geo.area + " 万km²" : "—"], ["区划", x.geo.adminSystem]];
      },
      note: function (x) { return "疆域与区划来源 · " + x.geo.source; },
      relLabel: "相邻时期"
    }
  };

  /* 从「前202—前195」这类文本中解析出年份区间 */
  function reignRange(str) {
    var t = String(str || "");
    if (t.indexOf("世纪") > -1) return null;
    var m = t.match(/(前)?\d{2,4}/g);
    if (!m || !m.length) return null;
    var years = m.map(function (x) {
      var n = parseInt(x.replace("前", ""), 10);
      return x.indexOf("前") === 0 ? -n : n;
    });
    return [Math.min.apply(null, years), Math.max.apply(null, years)];
  }

  function blockHTML(title, text, cls) {
    if (!text) return "";
    return '<div class="im-block ' + (cls || "") + '"><h4>' + title + "</h4><p>" + text + "</p></div>";
  }

  function closeItem() {
    if (!itemModal || !itemModal.classList.contains("open")) return;
    itemModal.classList.remove("open");
    itemMask.classList.remove("open");
    itemModal.setAttribute("aria-hidden", "true");
    if (!drawer || !drawer.classList.contains("open")) document.body.classList.remove("lock");
    if (itemFocus && itemFocus.focus) itemFocus.focus({ preventScroll: true });
  }

  function openItem(kind, key, dynId) {
    var cfg = ITEM_KINDS[kind];
    var d = BY_ID.get(dynId);
    if (!cfg || !d || !itemModal) return;

    var arr = cfg.arr ? (d[cfg.arr] || []) : [];
    var x = null;
    if (kind === "dynasty") {
      x = d;
    } else {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i][cfg.field] === key) { x = arr[i]; break; }
      }
    }
    if (!x) return;

    var html = "";
    var eyebrow = cfg.label;
    var chips = [];
    var main = "";
    var extra = "";
    var facts = null;
    var sourceNote = "";

    /* 通用栏目（文物 / 世界坐标 / 成语 / 都城 / 州郡 / 朝代） */
    if (GENERIC[kind]) {
      var G = GENERIC[kind];
      eyebrow = G.eyebrow(x, d);
      chips = (G.chips(x, d) || []).map(function (c) { return "<span>" + c + "</span>"; });
      main = '<p class="im-desc">' + G.desc(x, d) + "</p>";

      var rows = (G.rows ? G.rows(x, d) : []).filter(function (r) { return r[1]; });
      if (rows.length) {
        facts = '<div class="im-facts">' + rows.map(function (r) {
          return '<div><em>' + r[0] + "</em><span>" + r[1] + "</span></div>";
        }).join("") + "</div>";
      }
      if (G.blocks) {
        G.blocks(x, d).forEach(function (b) {
          extra += blockHTML(b[0], b[1]);
        });
      }
      if (G.note) sourceNote = '<p class="im-source">' + G.note(x, d) + "</p>";

      if (kind === "dynasty") {
        extra = facts + extra;
        facts = null;
        chips.unshift('<span class="hl">' + d.period + "</span>");
      }
    } else if (kind === "myth") {
      eyebrow = "神话 · " + d.name;
      chips = [d.period, x.source].filter(Boolean).map(function (c) {
        return "<span>" + c + "</span>";
      });
      chips.unshift('<span class="hl">' + x.type + "</span>");
      main = '<p class="im-desc">' + x.desc + "</p>";
      extra = blockHTML("母题与流变", x.detail && x.detail.motif);
    } else if (kind === "battle") {
      eyebrow = "战役 · " + d.name;
      var where = x.detail && x.detail.where;
      chips = [x.year, d.period, where].filter(Boolean).map(function (c) {
        return "<span>" + c + "</span>";
      });
      chips.unshift('<span class="hl">' + d.name + "</span>");

      var sides = String(x.sides).split(" vs ");
      var versus = "";
      if (sides.length === 2) {
        versus = '<div class="im-versus">' +
          '<div><em>交 战 一 方</em><b>' + sides[0] + "</b></div>" +
          "<i>VS</i>" +
          '<div><em>交 战 另 一 方</em><b>' + sides[1] + "</b></div>" +
        "</div>";
      } else {
        versus = '<div class="im-versus" style="grid-template-columns:1fr">' +
          '<div><em>交 战 双 方</em><b>' + x.sides + "</b></div></div>";
      }
      main = versus +
        '<div class="im-result">战果 <b>' + x.result + "</b></div>" +
        '<p class="im-desc" style="margin-top:16px">' + x.desc + "</p>";
      extra = blockHTML("历史影响", x.detail && x.detail.impact);
    } else if (kind === "film") {
      eyebrow = "影视 · " + x.t;
      chips = [x.year, d.name, d.period].map(function (c) { return "<span>" + c + "</span>"; });
      chips.unshift('<span class="hl">' + x.t + "</span>");
      main = '<p class="im-desc">' + x.note + "</p>";
    } else if (kind === "beauty") {
      eyebrow = "绝代风华 · " + d.name;
      chips = [d.period, "史传与文学形象"].map(function (c) { return "<span>" + c + "</span>"; });
      main = '<p class="im-desc">' + x.note + "</p>";
    } else if (kind === "inst" || kind === "culture") {
      eyebrow = (kind === "inst" ? "典章制度 · " : "文化成就 · ") + d.name;
      chips = [d.period, d.years].map(function (c) { return "<span>" + c + "</span>"; });
      main = '<p class="im-desc">' + x.desc + "</p>";
    } else if (kind === "ruler") {
      eyebrow = "帝王 · " + d.name;
      chips = [x.reign, d.period].map(function (c) { return "<span>" + c + "</span>"; });
      chips.unshift('<span class="hl">' + (x.group || d.name) + "</span>");

      var isStage = x.group === "共和国历程";
      var range = reignRange(x.reign);
      if (range) {
        var len = range[1] - range[0] + 1;
        if (len > 1 && len < 70) chips.push("<span>在位约 " + len + " 年</span>");
        var during = (d.events || []).filter(function (ev) {
          return ev.year >= range[0] && ev.year <= range[1];
        }).slice(0, 4);
        if (during.length) {
          extra += '<div class="im-block"><h4>' + (isStage ? "同期大事" : "在位期间") + '</h4><ul class="im-timeline">' +
            during.map(function (ev) {
              return "<li><b>" + ev.label + "</b><span>" + ev.text + "</span></li>";
            }).join("") + "</ul></div>";
        }
      }
      var ri = arr.indexOf(x);
      var prevR = ri > 0 ? arr[ri - 1] : null;
      var nextR = ri > -1 && ri < arr.length - 1 ? arr[ri + 1] : null;
      if (prevR || nextR) {
        extra += '<div class="im-block"><h4>' + (isStage ? "前后阶段" : "继位顺序") + '</h4><div class="im-rel">' +
          (prevR ? '<button type="button" data-kind="ruler" data-key="' + esc(prevR.title) +
            '" data-dyn="' + d.id + '">← ' + prevR.title + "</button>" : "") +
          (nextR ? '<button type="button" data-kind="ruler" data-key="' + esc(nextR.title) +
            '" data-dyn="' + d.id + '">' + nextR.title + " →</button>" : "") +
          "</div></div>";
      }
      main = '<p class="im-desc">' + x.note + "</p>";
    } else if (kind === "person") {
      eyebrow = "人物 · " + d.name;
      chips = [d.name, d.period].map(function (c) { return "<span>" + c + "</span>"; });
      chips.unshift('<span class="hl">' + x.role + "</span>");
      main = '<p class="im-desc">' + x.note + "</p>";
    } else {
      eyebrow = "大事记 · " + d.name;
      chips = [x.year, d.period].map(function (c) { return "<span>" + c + "</span>"; });
      main = '<p class="im-desc">' + x.text + "</p>";
      var sameYear = (arr || []).filter(function (ev) {
        return ev.label !== x.label && String(ev.year).slice(0, 3) === String(x.year).slice(0, 3);
      }).slice(0, 4);
      if (sameYear.length) {
        extra += '<div class="im-block"><h4>年代相近</h4><div class="im-rel">' +
          sameYear.map(function (ev) {
            return '<button type="button" data-kind="event" data-key="' + esc(ev.label) +
              '" data-dyn="' + d.id + '">' + ev.label + "</button>";
          }).join("") + "</div></div>";
      }
    }

    /* 同期同类 */
    var relTitle = (GENERIC[kind] && GENERIC[kind].relLabel) || "同期同类";
    var rel = kind === "ruler" || kind === "dynasty" ? [] : arr.filter(function (a) { return a[cfg.field] !== key; }).slice(0, 6);
    if (rel.length) {
      extra += '<div class="im-block"><h4>' + relTitle + '</h4><div class="im-rel">' +
        rel.map(function (a) {
          return '<button type="button" data-kind="' + kind + '" data-key="' + esc(a[cfg.field]) +
            '" data-dyn="' + d.id + '">' + a[cfg.field] + "</button>";
        }).join("") + "</div></div>";
    }

    if (kind === "ruler" && d.people.length) {
      var rulerText = [];
      d.rulers.forEach(function (r) {
        rulerText.push(r.title);
        if (r.name) rulerText.push(r.name);
        if (r.alias) rulerText = rulerText.concat(r.alias);
      });
      var peers = d.people.filter(function (pn) {
        return !rulerText.some(function (t) {
          return t.indexOf(pn.name) > -1 || pn.name.indexOf(t) > -1;
        });
      }).slice(0, 6);
      extra += '<div class="im-block"><h4>同期人物</h4><div class="im-rel">' +
        peers.map(function (pn) {
          return '<button type="button" data-kind="person" data-key="' + esc(pn.name) +
            '" data-dyn="' + d.id + '">' + pn.name + "</button>";
        }).join("") + "</div></div>";
    }

    var title = x[cfg.field];
    var displayTitle = kind === "film" ? "《" + title + "》" : title;
    if (kind === "ruler") displayTitle = x.title + (x.name ? "　" + x.name : "");

    var footer = kind === "dynasty" ? "" :
      '<div class="im-dyn">' +
        "<div>" +
          "<span>所 属 时 期</span>" +
          "<h4>" + d.name + "</h4>" +
          "<p>" + d.years + " · " + d.span + "</p>" +
        "</div>" +
        '<button type="button" data-id="' + d.id + '">查看该朝代全部内容 →</button>' +
      "</div>";

    itemBody.innerHTML =
      '<div class="im-eyebrow">' + eyebrow + "</div>" +
      '<h2 class="im-title">' + displayTitle + "</h2>" +
      '<div class="im-chips">' + chips.join("") + "</div>" +
      main +
      (facts || "") +
      extra +
      sourceNote +
      footer;

    itemBody.scrollTop = 0;
    itemFocus = document.activeElement;
    itemMask.classList.add("open");
    itemModal.classList.add("open");
    itemModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lock");
    var btn = $("#itemClose");
    if (btn) btn.focus({ preventScroll: true });
  }

  var drawerBody = $("#drawerBody");
  if (drawerBody) {
    drawerBody.addEventListener("click", function (e) {
      var btn = e.target.closest(".dr-jump button");
      if (!btn || !drawer) return;
      var target = document.getElementById(btn.dataset.target);
      if (!target) return;
      var top = target.getBoundingClientRect().top - drawer.getBoundingClientRect().top + drawer.scrollTop - 58;
      drawer.scrollTo({ top: top, behavior: REDUCE ? "auto" : "smooth" });
      $$(".dr-jump button").forEach(function (b) { b.classList.toggle("active", b === btn); });
    });
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("#itemClose") || e.target === itemMask) {
      closeItem();
      return;
    }

    var item = e.target.closest("[data-kind]");
    if (item) {
      e.preventDefault();
      openItem(item.dataset.kind, item.dataset.key, item.dataset.dyn);
      return;
    }

    var trigger = e.target.closest("[data-id]");
    if (trigger && !e.target.closest(".drawer")) {
      openDrawer(trigger.dataset.id);
      return;
    }
    if (e.target.closest("#drawerClose") || e.target === mask) closeDrawer();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (itemModal && itemModal.classList.contains("open")) closeItem();
      else closeDrawer();
      return;
    }
    if (e.key !== "Enter" && e.key !== " ") return;

    var el = e.target.closest && e.target.closest(".d-card, .tl-card, .chrono tbody tr");
    if (el && el.dataset.id) {
      e.preventDefault();
      openDrawer(el.dataset.id);
      return;
    }
    var item = e.target.closest && e.target.closest("[data-kind]");
    if (item) {
      e.preventDefault();
      openItem(item.dataset.kind, item.dataset.key, item.dataset.dyn);
    }
  });

  /* ---------------- 滚动揭示 ---------------- */
  var io = null;

  function observe(root) {
    var targets = $$(".reveal, .sec-head", root);
    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    }
    targets.forEach(function (el, i) {
      if (el.classList.contains("reveal")) {
        el.style.transitionDelay = (i % 6) * 55 + "ms";
      }
      if (!el.classList.contains("in")) io.observe(el);
    });
  }

  /* ---------------- 滚动交互 ---------------- */
  (function initScroll() {
    var bar = $("#progress");
    var top = $("#topbar");
    var toTop = $("#toTop");
    var hero = $(".hero");
    var sections = ["overview", "dynasty", "geo", "relics", "world", "idioms", "myth", "battle", "cinema", "timeline", "compare", "topics", "chronology", "notes"];
    var links = $$(".nav a");
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.pageYOffset || docEl.scrollTop;
      var h = docEl.scrollHeight - window.innerHeight;

      if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      if (top) top.classList.toggle("scrolled", y > 20);
      if (toTop) toTop.classList.toggle("show", y > 900);

      var current = "";
      sections.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 150) current = id;
      });
      links.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current);
      });

      // Hero 随滚动轻微抬起（视差）
      if (hero && !REDUCE) {
        var p = Math.min(1, y / Math.max(1, window.innerHeight));
        hero.style.setProperty("--hero-shift", (p * 60).toFixed(2) + "px");
        hero.style.setProperty("--hero-fade", (1 - p * 0.85).toFixed(3));
      }
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: REDUCE ? "auto" : "smooth" });
      });
    }

    update();
  })();

  /* ---------------- 移动端菜单 ---------------- */
  (function initNav() {
    var btn = $("#navToggle");
    var nav = $("#nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      var open = btn.classList.toggle("open");
      nav.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        btn.classList.remove("open");
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  })();

  /* ---------------- Hero：磁性 + 故障 ---------------- */
  (function initHeroFx() {
    var hero = $(".hero");
    var title = $("#heroTitle");
    if (!hero || !title) return;

    /* 拆字 */
    $$(".ht-line", title).forEach(function (line) {
      var chars = line.textContent.trim().split("");
      line.innerHTML = chars.map(function (c) {
        return '<span class="ch" data-ch="' + c + '">' + c + "</span>";
      }).join("");
    });

    if (REDUCE) return;

    var chars = $$(".ch", title);
    var magnets = $$(".btn, .brand-seal", hero);
    var raf = 0;
    var mx = 0, my = 0;

    function apply() {
      raf = 0;
      chars.forEach(function (el, i) {
        var r = el.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dx = mx - cx;
        var dy = my - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var range = 380;
        if (dist > range) {
          el.style.transform = "";
          el.style.setProperty("--gx", "0px");
          return;
        }
        var f = (1 - dist / range) * 0.42;
        var tx = -dx * f * 0.28;
        var ty = -dy * f * 0.28;
        el.style.transform = "translate3d(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px,0) rotate(" + (dx * f * 0.02).toFixed(2) + "deg)";
        el.style.setProperty("--gx", (dx * f * 0.05).toFixed(2) + "px");
      });

      magnets.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var dx = mx - (r.left + r.width / 2);
        var dy = my - (r.top + r.height / 2);
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > 220) {
          el.style.transform = "";
          return;
        }
        var f = (1 - d / 220) * 0.35;
        el.style.transform = "translate(" + (dx * f).toFixed(1) + "px," + (dy * f).toFixed(1) + "px)";
      });
    }

    hero.addEventListener("pointermove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });

    hero.addEventListener("pointerleave", function () {
      chars.forEach(function (el) {
        el.style.transform = "";
        el.style.setProperty("--gx", "0px");
      });
      magnets.forEach(function (el) { el.style.transform = ""; });
    });

    /* 故障 */
    function glitch() {
      title.classList.add("is-glitch");
      setTimeout(function () { title.classList.remove("is-glitch"); }, 620);
    }
    title.addEventListener("pointerenter", glitch);
    (function schedule() {
      setTimeout(function () {
        if (!document.hidden) glitch();
        schedule();
      }, 7000 + Math.random() * 6000);
    })();
  })();

  /* ---------------- 卡片 3D 倾斜 ---------------- */
  (function initTilt() {
    if (REDUCE) return;
    var grid = $("#dynastyGrid");
    if (!grid) return;
    var raf = 0;
    var current = null;
    var px = 0, py = 0;

    function apply() {
      raf = 0;
      if (!current) return;
      var r = current.getBoundingClientRect();
      var nx = (px - r.left) / r.width - 0.5;
      var ny = (py - r.top) / r.height - 0.5;
      current.style.setProperty("--ry", (nx * 7).toFixed(2) + "deg");
      current.style.setProperty("--rx", (-ny * 7).toFixed(2) + "deg");
      current.style.setProperty("--gxp", (nx * 100 + 50).toFixed(1) + "%");
      current.style.setProperty("--gyp", (ny * 100 + 50).toFixed(1) + "%");
    }

    grid.addEventListener("pointermove", function (e) {
      var card = e.target.closest(".d-card");
      if (card !== current) {
        if (current) {
          current.style.setProperty("--ry", "0deg");
          current.style.setProperty("--rx", "0deg");
        }
        current = card;
      }
      if (!current) return;
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });

    grid.addEventListener("pointerleave", function () {
      if (current) {
        current.style.setProperty("--ry", "0deg");
        current.style.setProperty("--rx", "0deg");
        current = null;
      }
    });
  })();

  /* ---------------- 背景视差：远山随滚动缓慢横移 ---------------- */
  (function bgParallax() {
    var far = document.querySelector(".bg-mtn.far");
    var near = document.querySelector(".bg-mtn.near");
    if (!far || !near || REDUCE) return;
    var y = 0, raf = 0;
    function apply() {
      raf = 0;
      far.style.transform = "translate3d(" + (-y * 0.012).toFixed(1) + "px,0,0)";
      near.style.transform = "translate3d(" + (-y * 0.026).toFixed(1) + "px,0,0)";
    }
    window.addEventListener("scroll", function () {
      y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
    apply();
  })();

  /* ---------------- 对外接口（供 extra.js 复用，避免重复实现） ---------------- */
  window.EPIC = {
    DATA: DATA,
    BY_ID: BY_ID,
    ITEM_KINDS: ITEM_KINDS,
    GENERIC: GENERIC,
    openItem: openItem,
    openDrawer: openDrawer,
    observe: observe,
    esc: esc
  };

  /* ---------------- 启动 ---------------- */
  renderCards();
  renderTimeline();
  renderTopicTabs();
  renderTopicPanel();
  observe(document);

  // 首屏 Hero 元素立即入场
  requestAnimationFrame(function () {
    $$(".hero .reveal, .sec-head").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add("in");
    });
  });
})();
