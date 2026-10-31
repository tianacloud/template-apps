/* ============================================================================
 * 医械法规云 MedReg Hub — 应用逻辑
 * 零外部依赖 · 本地全文检索 · 下载与溯源
 * ==========================================================================*/
(function () {
  "use strict";

  /* ------------------------------ 基础工具 ------------------------------ */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const regionOf = (code) => MDR_META.regions.find((r) => r.code === code) || { name: code, flag: "", en: code };
  const levelOrder = (lv) => { const f = MDR_META.levels.find((l) => l.name === lv); return f ? f.order : 99; };

  /* ------------------------------ 数据准备 ------------------------------ */
  const RAW = [].concat(
    window.MDR_CN || [], window.MDR_CN_EXT || [],
    window.MDR_INTL || [], window.MDR_INTL_EXT || []
  );
  // 按 id 去重（扩展卷与主卷可能重复收录同一条目，以先出现者为准）
  const ALL = [];
  const seenIds = Object.create(null);
  RAW.forEach((r) => { if (!r || !r.id || seenIds[r.id]) return; seenIds[r.id] = 1; ALL.push(r); });
  const BY_ID = {};
  ALL.forEach((r) => { BY_ID[r.id] = r; });

  // 被引用次数（用于排行榜）
  const inbound = {};
  ALL.forEach((r) => (r.related || []).forEach((id) => { inbound[id] = (inbound[id] || 0) + 1; }));

  // 检索索引
  ALL.forEach((r) => {
    r._arts = (r.articles || []).map((a) => a.no + " " + a.label + " " + a.text).join(" ｜ ");
    r._idx = [r.title, r.titleEn, r.docNo, r.issuer, r.type, r.level, r.summary, (r.tags || []).join(" "), r._arts]
      .join(" \u0001 ").toLowerCase();
  });

  const ALL_ISSUERS = Array.from(new Set(ALL.map((r) => r.issuer)));
  const ALL_TAGS = Array.from(new Set(ALL.reduce((a, r) => a.concat(r.tags || []), [])));

  /* ------------------------------ 状态 ------------------------------ */
  const state = {
    q: "",
    regions: new Set(),
    levels: new Set(),
    statuses: new Set(),
    issuers: new Set(),
    tags: new Set(),
    ids: new Set(),        // 按 id 精确过滤（注册流程模块「查看本路径法规」使用）
    scene: null,
    sort: "default",
    view: "list",          // list | favorites | downloads | flow | review | selfcheck | market
    limit: 12,
    favs: new Set(loadFavs())
  };

  function loadFavs() {
    try { return JSON.parse(window.medregStorage.getItem("medreg.favs") || "[]"); } catch (e) { return []; }
  }
  function updateFavCount() {
    const el = $("#favCount");
    if (el) { el.textContent = state.favs.size; el.style.display = state.favs.size ? "" : "none"; }
  }
  function saveFavs() {
    try { window.medregStorage.setItem("medreg.favs", JSON.stringify(Array.from(state.favs))); } catch (e) {}
    updateFavCount();
  }

  /* ------------------------------ 检索 ------------------------------ */
  /* 中文二元组降级：整词未命中时，按二元组覆盖率判定相关性 */
  function bigrams(term) {
    const t = term.replace(/[\s\-_（）()【】\[\]:：,，.。/、]+/g, "");
    const out = [];
    for (let i = 0; i + 2 <= t.length; i++) out.push(t.slice(i, i + 2));
    return Array.from(new Set(out));
  }

  function termScore(r, term) {
    const t = r.title.toLowerCase(), doc = (r.docNo || "").toLowerCase();
    const iss = (r.issuer || "").toLowerCase(), sum = (r.summary || "").toLowerCase();
    const art = r._arts.toLowerCase(), tags = (r.tags || []).join(" ").toLowerCase();
    let s = 0;
    if (t.includes(term)) s += 120;
    if (t.startsWith(term)) s += 40;
    if (doc.includes(term)) s += 70;
    if (tags.includes(term)) s += 45;
    if (iss.includes(term)) s += 35;
    if (sum.includes(term)) s += 22;
    if (art.includes(term)) s += 14;
    if (s) return s;
    const g = bigrams(term);
    if (g.length < 2) return 0;
    let hit = 0;
    g.forEach((x) => { if (r._idx.includes(x)) hit++; });
    const ratio = hit / g.length;
    if (ratio < 0.6) return 0;
    const inTitle = g.filter((x) => t.includes(x)).length / g.length;
    const inArt = g.filter((x) => art.includes(x)).length / g.length;
    return Math.round(18 + ratio * 30 + inTitle * 26 + inArt * 10);
  }

  function scoreOf(r, terms) {
    if (!terms.length) return 1;
    let total = 0;
    for (const term of terms) {
      const s = termScore(r, term);
      if (!s) return 0;
      total += s;
    }
    return total;
  }

  function filtered() {
    const terms = state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let out = ALL.filter((r) => {
      if (state.view === "favorites" && !state.favs.has(r.id)) return false;
      if (state.ids.size && !state.ids.has(r.id)) return false;
      if (state.regions.size && !state.regions.has(r.region)) return false;
      if (state.levels.size && !state.levels.has(r.level)) return false;
      if (state.statuses.size && !state.statuses.has(r.status)) return false;
      if (state.issuers.size && !state.issuers.has(r.issuer)) return false;
      if (state.tags.size) { const rt = r.tags || []; let ok = false; state.tags.forEach((x) => { if (rt.includes(x)) ok = true; }); if (!ok) return false; }
      if (state.scene) {
        const sc = MDR_META.scenes.find((s) => s.key === state.scene);
        if (sc) {
          const rt = r.tags || [];
          const hit = sc.tags.some((x) => rt.includes(x) || r.type === x || r.title.includes(x) || rt.some((y) => y.includes(x)));
          if (!hit) return false;
        }
      }
      return true;
    });

    const scored = out.map((r) => ({ r: r, s: scoreOf(r, terms) })).filter((x) => x.s > 0);
    const prio = { core: 0, key: 1, normal: 2 };
    const cmp = {
      default: (a, b) => (b.s - a.s) || (prio[a.r.priority] - prio[b.r.priority]) || b.r.issueDate.localeCompare(a.r.issueDate),
      newest: (a, b) => b.r.issueDate.localeCompare(a.r.issueDate),
      effective: (a, b) => b.r.effectiveDate.localeCompare(a.r.effectiveDate),
      cited: (a, b) => ((inbound[b.r.id] || 0) - (inbound[a.r.id] || 0)) || (prio[a.r.priority] - prio[b.r.priority]),
      title: (a, b) => a.r.title.localeCompare(b.r.title, "zh-Hans-CN")
    }[state.sort];
    scored.sort(cmp);
    return scored.map((x) => x.r);
  }

  /* ------------------------------ 高亮 ------------------------------ */
  function hl(text, terms) {
    let s = esc(text);
    if (!terms || !terms.length) return s;
    const uniq = Array.from(new Set(terms.filter((t) => t.length > 0))).sort((a, b) => b.length - a.length);
    uniq.forEach((t) => {
      const re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      s = s.replace(re, "<mark>$1</mark>");
    });
    return s;
  }

  /* ------------------------------ 渲染：类目条 ------------------------------ */
  function renderCatbar() {
    const counts = {};
    ALL.forEach((r) => { counts[r.region] = (counts[r.region] || 0) + 1; });
    const items = MDR_META.regions.filter((rg) => counts[rg.code]).map((rg) =>
      '<button class="cat-item' + (state.regions.size === 1 && state.regions.has(rg.code) ? " active" : "") +
      '" data-region="' + rg.code + '"><span>' + rg.flag + "</span><span>" + esc(rg.name) +
      '</span><span class="cnt">' + counts[rg.code] + "</span></button>"
    ).join("");
    $("#catbar").innerHTML =
      '<button class="cat-item' + (state.regions.size ? "" : " active") + '" data-region="__all">' +
      "<span>📚</span><span>全部法规</span><span class=\"cnt\">" + ALL.length + "</span></button>" + items;
    $$("#catbar .cat-item").forEach((b) => {
      b.addEventListener("click", () => {
        const v = b.getAttribute("data-region");
        state.regions = new Set(v === "__all" ? [] : [v]);
        state.limit = 12; render();
      });
    });
  }

  /* ------------------------------ 渲染：筛选面板 ------------------------------ */
  function facetGroup(title, opts, set, key) {
    if (!opts.length) return "";
    const rows = opts.map((o) => {
      const on = set.has(o.v);
      return '<div class="facet-opt' + (on ? " on" : "") + '" data-key="' + key + '" data-v="' + esc(o.v) + '">' +
        '<span class="box"></span><span class="lbl" title="' + esc(o.v) + '">' + esc(o.l) + '</span>' +
        '<span class="cnt">' + o.n + "</span></div>";
    }).join("");
    return '<div class="facet"><div class="facet-title"><span>' + esc(title) +
      '</span><button class="mini-reset" data-key="' + key + '">清空</button></div>' +
      '<div class="facet-list">' + rows + "</div></div>";
  }

  function renderFacets() {
    const base = filterExcept(null);
    const cnt = (fn) => base.reduce((m, r) => { const k = fn(r); m[k] = (m[k] || 0) + 1; return m; }, {});
    const cR = cnt((r) => r.region), cL = cnt((r) => r.level), cS = cnt((r) => r.status);
    const cI = cnt((r) => r.issuer);
    const cT = {};
    base.forEach((r) => (r.tags || []).forEach((t) => { cT[t] = (cT[t] || 0) + 1; }));

    const mk = (map, list) => list.filter((v) => map[v]).map((v) => ({ v: v, l: v, n: map[v] }));
    // 主题标签较多：限流显示（已选中的始终置顶保留），避免侧栏过长
    const tagRows = () => {
      const rows = mk(cT, ALL_TAGS).sort((a, b) => b.n - a.n);
      const pinned = rows.filter((r) => state.tags.has(r.v));
      const rest = rows.filter((r) => !state.tags.has(r.v));
      return pinned.concat(rest.slice(0, Math.max(0, 24 - pinned.length)));
    };
    const html = [
      facetGroup("地区 / 市场", MDR_META.regions.filter((g) => cR[g.code]).map((g) => ({ v: g.code, l: g.flag + " " + g.name, n: cR[g.code] })), state.regions, "regions"),
      facetGroup("效力层级", MDR_META.levels.filter((l) => cL[l.name]).map((l) => ({ v: l.name, l: l.name, n: cL[l.name] })), state.levels, "levels"),
      facetGroup("效力状态", mk(cS, ["现行有效", "即将实施", "已修订", "征求意见", "已废止"]), state.statuses, "statuses"),
      facetGroup("发布机关", mk(cI, ALL_ISSUERS).sort((a, b) => b.n - a.n), state.issuers, "issuers"),
      facetGroup("主题标签", tagRows(), state.tags, "tags")
    ].join("");

    $("#facets").innerHTML = html;
    $$("#facets .facet-opt").forEach((el) => {
      el.addEventListener("click", () => {
        const k = el.getAttribute("data-key"), v = el.getAttribute("data-v");
        if (state[k].has(v)) state[k].delete(v); else state[k].add(v);
        state.limit = 12; render();
      });
    });
    $$("#facets .mini-reset").forEach((b) => {
      b.addEventListener("click", (e) => { e.stopPropagation(); state[b.getAttribute("data-key")] = new Set(); state.limit = 12; render(); });
    });
  }

  function filterExcept(ignore) {
    return ALL.filter((r) => {
      if (state.view === "favorites" && !state.favs.has(r.id)) return false;
      if (ignore !== "ids" && state.ids.size && !state.ids.has(r.id)) return false;
      if (ignore !== "regions" && state.regions.size && !state.regions.has(r.region)) return false;
      if (ignore !== "levels" && state.levels.size && !state.levels.has(r.level)) return false;
      if (ignore !== "statuses" && state.statuses.size && !state.statuses.has(r.status)) return false;
      if (ignore !== "issuers" && state.issuers.size && !state.issuers.has(r.issuer)) return false;
      if (ignore !== "tags" && state.tags.size) { const rt = r.tags || []; if (!Array.from(state.tags).some((x) => rt.includes(x))) return false; }
      return true;
    });
  }

  /* ------------------------------ 渲染：卡片 ------------------------------ */
  function cardHTML(r, terms) {
    const rg = regionOf(r.region);
    const rel = (r.related || []).map((id) => BY_ID[id]).filter(Boolean);
    return '<article class="card ' + esc(r.priority) + '" data-id="' + esc(r.id) + '">' +
      '<div class="card-top"><div style="min-width:0">' +
      '<h3 class="card-title" data-open="' + esc(r.id) + '">' + hl(r.title, terms) + "</h3>" +
      '<div class="card-en">' + hl(r.titleEn || "", terms) + "</div>" +
      "</div>" +
      '<div class="card-right">' +
      '<button class="fav-btn' + (state.favs.has(r.id) ? " on" : "") + '" data-fav="' + esc(r.id) + '">' +
      (state.favs.has(r.id) ? "★ 已收藏" : "☆ 收藏") + "</button>" +
      "</div></div>" +
      '<div class="badges">' +
      '<span class="badge region">' + esc(rg.flag + " " + rg.name) + "</span>" +
      '<span class="badge level">' + esc(r.level) + "</span>" +
      '<span class="badge status-' + esc(r.status) + '">' + esc(r.status) + "</span>" +
      (r.priority === "core" ? '<span class="badge core">核心必读</span>' : r.priority === "key" ? '<span class="badge key">重点</span>' : "") +
      "</div>" +
      '<div class="meta-grid">' +
      '<div><span class="k">文号：</span><span class="v">' + hl(r.docNo, terms) + "</span></div>" +
      '<div><span class="k">发布机关：</span><span class="v">' + hl(r.issuer, terms) + "</span></div>" +
      '<div><span class="k">发布日期：</span><span class="v">' + esc(r.issueDate) + "</span></div>" +
      '<div><span class="k">施行日期：</span><span class="v">' + esc(r.effectiveDate) + "</span></div>" +
      "</div>" +
      '<p class="card-summary">' + hl(r.summary, terms) + "</p>" +
      '<div class="card-foot">' +
      (r.tags || []).slice(0, 5).map((t) => '<span class="topic-tag" data-tag="' + esc(t) + '">' + esc(t) + "</span>").join("") +
      (rel.length ? '<span class="topic-tag" style="background:#fff;border-style:dashed" data-open="' + esc(r.id) + '">关联 ' + rel.length + " 部</span>" : "") +
      '<span class="spacer"></span>' +
      '<button class="act" data-open="' + esc(r.id) + '">📖 查看要点</button>' +
      '<button class="act" data-dl="md" data-id="' + esc(r.id) + '">⬇ 条文包</button>' +
      '<button class="act accent" data-src="' + esc(r.id) + '">🔗 官方溯源</button>' +
      "</div></article>";
  }

  /* ------------------------------ 渲染：右栏 ------------------------------ */
  function renderRail() {
    const byRegion = MDR_META.regions.map((g) => ({ g: g, n: ALL.filter((r) => r.region === g.code).length })).filter((x) => x.n);
    const max = Math.max.apply(null, byRegion.map((x) => x.n));
    const rail1 = '<div class="panel"><div class="panel-head"><span>法规分布</span><span class="en">COVERAGE</span></div>' +
      '<div class="panel-body">' + byRegion.map((x) =>
        '<div class="stat-row"><span class="n">' + x.n + '</span><span style="width:56px">' + x.g.flag + " " + esc(x.g.name) +
        '</span><span class="bar"><i style="width:' + Math.round(x.n / max * 100) + '%"></i></span></div>').join("") +
      "</div></div>";

    const rank = ALL.slice().sort((a, b) => ((inbound[b.id] || 0) - (inbound[a.id] || 0)) || a.title.localeCompare(b.title, "zh-Hans-CN")).slice(0, 8);
    const rail2 = '<div class="panel"><div class="panel-head"><span>引用热度榜</span><span class="en">TOP CITED</span></div>' +
      '<div class="panel-body" style="padding:6px">' + rank.map((r) =>
        '<div class="rank-item" data-open="' + esc(r.id) + '"><span class="rank-no">' + (rank.indexOf(r) + 1) + "</span>" +
        '<span class="rank-txt"><span class="t">' + esc(r.title) + '</span><span class="m">被 ' + (inbound[r.id] || 0) + " 部法规引用 · " + esc(regionOf(r.region).name) + "</span></span></div>").join("") +
      "</div></div>";

    const news = ALL.slice().sort((a, b) => b.issueDate.localeCompare(a.issueDate)).slice(0, 6);
    const rail3 = '<div class="panel"><div class="panel-head"><span>最新发布</span><span class="en">LATEST</span></div>' +
      '<div class="panel-body" style="padding:6px">' + news.map((r) =>
        '<div class="rank-item" data-open="' + esc(r.id) + '"><span class="rank-no">' + esc(regionOf(r.region).flag) + "</span>" +
        '<span class="rank-txt"><span class="t">' + esc(r.title) + "</span>" +
        '<span class="m">' + esc(r.issueDate) + " · " + esc(r.docNo) + "</span></span></div>").join("") +
      "</div></div>";

    const rail4 = '<div class="panel"><div class="panel-head"><span>快捷检索</span><span class="en">SHORTCUTS</span></div>' +
      '<div class="panel-body"><div class="quick-links">' +
      [["🔥 创新与优先审批", "创新"], ["🧪 临床试验与临床评价", "临床"], ["🏭 体系核查与自检", "核查"], ["💻 软件与AI器械", "软件"],
       ["🛡️ 不良事件与召回", "召回"], ["🌐 UDI 唯一标识", "UDI"], ["📦 委托生产", "委托生产"]]
        .map((x) => '<button data-q="' + esc(x[1]) + '"><span class="ico">' + x[0].slice(0, 2) + "</span>" + esc(x[0].slice(2).trim()) + "</button>").join("") +
      "</div></div></div>";

    $("#rail").innerHTML = rail1 + rail2 + rail3 + rail4;
  }

  /* ------------------------------ 渲染：主列表 ------------------------------ */
  function render() {
    const terms = state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const isFlow = state.view === "flow";
    const isReview = state.view === "review";
    const isSC = state.view === "selfcheck";
    const isMk = state.view === "market";
    document.body.classList.toggle("flow-mode", isFlow);
    document.body.classList.toggle("review-mode", isReview);
    document.body.classList.toggle("selfcheck-mode", isSC);
    document.body.classList.toggle("market-mode", isMk);
    renderCatbar();

    if (isMk) {
      $("#activeFilters").innerHTML = "";
      $("#main").innerHTML = marketHTML();
      bindMarket();
      syncNav();
      return;
    }

    if (isSC) {
      $("#activeFilters").innerHTML = "";
      $("#main").innerHTML = selfCheckHTML();
      bindSelfCheck();
      syncNav();
      return;
    }

    if (isReview) {
      $("#activeFilters").innerHTML = "";
      $("#main").innerHTML = reviewHTML();
      bindReview();
      syncNav();
      return;
    }

    if (isFlow) {
      $("#activeFilters").innerHTML = "";
      $("#main").innerHTML = flowHTML();
      bindFlow();
      syncNav();
      return;
    }

    renderFacets();
    renderRail();

    // 工具条提示
    const activeChips = [];
    const addChips = (set, key, label) => Array.from(set).forEach((v) => activeChips.push({ key: key, v: v, label: label }));
    addChips(state.regions, "regions", "地区"); addChips(state.levels, "levels", "层级");
    addChips(state.statuses, "statuses", "状态"); addChips(state.issuers, "issuers", "机关"); addChips(state.tags, "tags", "标签");
    if (state.ids.size) activeChips.push({ key: "ids", v: "本路径相关 " + state.ids.size + " 部", label: "范围" });
    if (state.scene) { const sc = MDR_META.scenes.find((s) => s.key === state.scene); activeChips.push({ key: "scene", v: state.scene, label: "场景：" + (sc ? sc.name : "") }); }
    const chipHTML = activeChips.map((c) =>
      '<span class="tagchip">' + esc(c.label) + "：<b>" + esc(c.v) + '</b><button class="x" data-k="' + c.key + '" data-v="' + esc(c.v) + '">✕</button></span>').join("");
    $("#activeFilters").innerHTML = chipHTML;

    const main = $("#main");

    if (state.view === "downloads") { main.innerHTML = downloadsHTML(); bindMain(); return; }

    const list = filtered();
    const shown = list.slice(0, state.limit);

    let head = "";
    if (state.view === "list" && !state.q && !state.regions.size && !state.levels.size && !state.statuses.size && !state.issuers.size && !state.tags.size && !state.ids.size && !state.scene) {
      head = heroHTML();
    }

    const toolbar = '<div class="toolbar"><span class="result-count">共检索到 <b>' + list.length + "</b> 部法规" +
      (state.view === "favorites" ? "（我的法规库）" : "") + "</span>" +
      '<div class="sorts">' +
      [["default", "综合排序"], ["newest", "最新发布"], ["effective", "施行日期"], ["cited", "引用热度"], ["title", "标题"]]
        .map((s) => '<button class="sort-btn' + (state.sort === s[0] ? " active" : "") + '" data-sort="' + s[0] + '">' + s[1] + "</button>").join("") +
      "</div>" +
      '<button class="act" data-export="csv">⬇ 导出清单 CSV</button>' +
      '<button class="act" data-export="json">⬇ 导出 JSON</button>' +
      '<button class="act" data-export="gap">📋 生成差距分析表</button>' +
      '<button class="act accent" data-export="prompt">🤖 生成审查提示词</button>' +
      "</div>";

    const body = shown.length
      ? '<div class="list">' + shown.map((r) => cardHTML(r, terms)).join("") + "</div>" +
        (list.length > shown.length ? '<div class="more-wrap"><button class="btn-more" data-more="1">加载更多（还有 ' + (list.length - shown.length) + " 部）</button></div>"
          : '<div class="more-wrap" style="color:#7789a0;font-size:12.5px">已显示全部 ' + list.length + " 部法规</div>")
      : '<div class="panel empty"><div class="big">🔍</div><h3>没有匹配的法规</h3><p>试试更换关键词，或清除左侧筛选条件</p><button class="act primary" data-clear="1" style="margin-top:12px">清除全部筛选</button></div>';

    main.innerHTML = head + toolbar + body;
    bindMain();
  }

  function heroHTML() {
    const scenes = MDR_META.scenes.map((s) => {
      const n = ALL.filter((r) => { const rt = r.tags || []; return s.tags.some((x) => rt.includes(x) || r.type === x || r.title.includes(x)); }).length;
      return '<div class="scene-card" data-scene="' + s.key + '"><div class="ico">' + s.icon + '</div><div><div class="nm">' + esc(s.name) +
        '</div><div class="ds">' + esc(s.desc) + '</div><div class="ct">' + n + " 部法规</div></div></div>";
    }).join("");
    const rCount = MDR_META.regions.filter((g) => ALL.some((r) => r.region === g.code)).length;
    return '<section class="hero"><h1>医疗器械法规全生命周期检索平台</h1>' +
      "<p>覆盖国内全部层级法规与海外重点市场准入要求，支持全文检索、类目导航、条款级溯源与结构化下载。所有条目均标注文号、发布机关与官方来源，可一键回溯官方原文。</p>" +
      '<div class="hero-stats">' +
      '<div class="hero-stat"><div class="n">' + ALL.length + '</div><div class="l">收录法规</div></div>' +
      '<div class="hero-stat"><div class="n">' + rCount + '</div><div class="l">国家/地区市场</div></div>' +
      '<div class="hero-stat"><div class="n">' + ALL.reduce((a, r) => a + (r.articles || []).length, 0) + '</div><div class="l">条款要点</div></div>' +
      '<div class="hero-stat"><div class="n">' + ALL_ISSUERS.length + '</div><div class="l">发布机关</div></div>' +
      "</div></section>" +
      '<div class="scene-grid">' + scenes + "</div>";
  }

  /* ------------------------------ 事件绑定 ------------------------------ */
  function bindMain() {
    // [data-open] 与流程模块导出按钮统一走 bindGlobal 中的事件委托（兼容动态生成节点）
    $$("[data-fav]").forEach((el) => el.addEventListener("click", (e) => {
      e.stopPropagation(); const id = el.getAttribute("data-fav");
      if (state.favs.has(id)) { state.favs.delete(id); toast("已取消收藏"); } else { state.favs.add(id); toast("已加入我的法规库"); }
      saveFavs(); render();
    }));
    $$("[data-tag]").forEach((el) => el.addEventListener("click", (e) => {
      e.stopPropagation(); const t = el.getAttribute("data-tag"); if (state.tags.has(t)) state.tags.delete(t); else state.tags.add(t); state.limit = 12; render();
    }));
    $$("[data-scene]").forEach((el) => el.addEventListener("click", () => { state.scene = el.getAttribute("data-scene"); state.limit = 12; render(); window.scrollTo({ top: 260, behavior: "smooth" }); }));
    $$("[data-sort]").forEach((el) => el.addEventListener("click", () => { state.sort = el.getAttribute("data-sort"); render(); }));
    $$("[data-more]").forEach((el) => el.addEventListener("click", () => { state.limit += 12; render(); }));
    $$("[data-clear]").forEach((el) => el.addEventListener("click", () => clearAll()));
    $$("[data-export]").forEach((el) => el.addEventListener("click", () => {
      const kind = el.getAttribute("data-export"), list = filtered();
      if (kind === "flow") return exportFlowPlan();
      if (kind === "go-review") { state.view = "review"; syncNav(); render(); return toast("请选择审查基准并提交待审查文档"); }
      if (kind === "sc-report") return exportSelfCheckReport();
      if (kind === "sc-gap") return exportSelfCheckGap();
      if (kind === "mk-cart-csv") return exportCartCSV();
      if (kind === "ft-book") return exportFullBook();
      if (!list.length) return toast("当前没有可导出的法规");
      if (kind === "csv") exportCSV(list);
      if (kind === "json") exportJSON(list);
      if (kind === "gap") exportGap(list);
      if (kind === "prompt") exportPrompt(list, state.q);
    }));
    $$("[data-src]").forEach((el) => el.addEventListener("click", (e) => { e.stopPropagation(); const r = BY_ID[el.getAttribute("data-src")]; if (r) { window.open(r.officialUrl, "_blank", "noopener"); toast("已打开官方来源：" + r.source); } }));
    $$("[data-dl]").forEach((el) => el.addEventListener("click", (e) => { e.stopPropagation(); const r = BY_ID[el.getAttribute("data-id")]; if (r) download(r.id + "-" + r.title + ".md", regMarkdown(r), "text/markdown"); }));
  }

  function bindGlobal() {
    $("#btnSearch").addEventListener("click", doSearch);
    $("#q").addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });
    $("#q").addEventListener("input", debounce(() => { state.q = $("#q").value; state.limit = 12; state.view = "list"; state.ids = new Set(); syncNav(); render(); }, 220));
    $$("[data-hot]").forEach((b) => b.addEventListener("click", () => { $("#q").value = b.getAttribute("data-hot"); doSearch(); }));
    $("#btnFav").addEventListener("click", () => { state.ids = new Set(); state.view = "favorites"; state.limit = 12; syncNav(); render(); });
    $("#btnDl").addEventListener("click", () => { state.ids = new Set(); state.view = "downloads"; syncNav(); render(); });
    $("#btnHome").addEventListener("click", () => { resetAll(); });
    $("#navCat").addEventListener("click", () => { resetAll(); });
    $("#btnResetSide").addEventListener("click", () => { resetAll(); });
    $("#navNew").addEventListener("click", () => { resetAll(); state.sort = "newest"; render(); });
    $("#navGlobal").addEventListener("click", () => { resetAll(); MDR_META.regions.filter((g) => g.code !== "CN").forEach((g) => state.regions.add(g.code)); render(); });

    // 注册流程模块入口（整块清空筛选后切换视图）
    const navFlow = $("#navFlow");
    if (navFlow) navFlow.addEventListener("click", () => {
      state.q = ""; $("#q").value = "";
      state.regions = new Set(); state.levels = new Set(); state.statuses = new Set();
      state.issuers = new Set(); state.tags = new Set(); state.ids = new Set(); state.scene = null;
      state.sort = "default"; state.limit = 12; state.view = "flow";
      render();
    });

    // 文档审查工作台入口
    const navReview = $("#navReview");
    if (navReview) navReview.addEventListener("click", () => {
      state.q = ""; $("#q").value = "";
      state.regions = new Set(); state.levels = new Set(); state.statuses = new Set();
      state.issuers = new Set(); state.tags = new Set(); state.ids = new Set(); state.scene = null;
      state.sort = "default"; state.limit = 12; state.view = "review";
      render();
    });

    // 申报前自检清单入口
    const navSC = $("#navSelfCheck");
    if (navSC) navSC.addEventListener("click", () => {
      state.q = ""; $("#q").value = "";
      state.regions = new Set(); state.levels = new Set(); state.statuses = new Set();
      state.issuers = new Set(); state.tags = new Set(); state.ids = new Set(); state.scene = null;
      state.sort = "default"; state.limit = 12; state.view = "selfcheck";
      scLoad();
      render();
    });

    // B2B 法规服务集市入口
    const navMarket = $("#navMarket");
    if (navMarket) navMarket.addEventListener("click", () => {
      state.q = ""; $("#q").value = "";
      state.regions = new Set(); state.levels = new Set(); state.statuses = new Set();
      state.issuers = new Set(); state.tags = new Set(); state.ids = new Set(); state.scene = null;
      state.sort = "default"; state.limit = 12; state.view = "market";
      mkLoad();
      render();
    });

    // 筛选标签移除（事件委托，兼容每次重渲染）
    $("#activeFilters").addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest(".tagchip .x") : null;
      if (!btn) return;
      const k = btn.getAttribute("data-k"), v = btn.getAttribute("data-v");
      if (k === "ids") state.ids = new Set();
      else if (k === "scene") state.scene = null;
      else if (state[k] && typeof state[k].delete === "function") state[k].delete(v);
      state.limit = 12;
      render();
    });

    // 统一点击委托：打开法规详情 + 注册流程模块导出（兼容运行时动态生成的节点）
    document.addEventListener("click", (e) => {
      const el = e.target && e.target.closest ? e.target.closest("[data-open],[data-flow-export],[data-rv-export],[data-sc-export],[data-sc-review],[data-sc-flow],[data-mk-offer],[data-mk-vendor],[data-mk-cart],[data-mk-cat],[data-mk-set],[data-mk-page],[data-mk-more],[data-mk-export],[data-mk-cart-clear],[data-mk-reg],[data-mk-unset],[data-mk-tag],[data-ft-ch],[data-ft-open],[data-ft-demo],[data-ft-save],[data-ft-cancel],[data-ft-clear],[data-ft-export],[data-ft-reimport],[data-ft-jump],[data-mk-for-doc],[data-mk-for-reg]") : null;
      if (!el) return;

      /* ---------- 法规服务集市 ---------- */
      const mkOfferId = el.getAttribute("data-mk-offer");
      if (mkOfferId) { mkOpenOffer(mkOfferId); return; }
      const mkVendorId = el.getAttribute("data-mk-vendor");
      if (mkVendorId) { mkOpenVendor(mkVendorId); return; }
      const mkCartId = el.getAttribute("data-mk-cart");
      if (mkCartId) {
        const added = mkCartToggle(mkCartId);
        render();
        toast(added ? "已加入采购清单" : "已从采购清单移出");
        return;
      }
      if (el.getAttribute("data-mk-cart-clear")) { mkCart = []; mkSaveCart(); render(); toast("采购清单已清空"); return; }
      const mkCatId = el.getAttribute("data-mk-cat");
      if (mkCatId) { mk.cat = mkCatId; mk.page = "list"; mk.limit = 9; render(); window.scrollTo({ top: 200, behavior: "smooth" }); return; }
      const mkSetRaw = el.getAttribute("data-mk-set");
      if (mkSetRaw) { const parts = mkSetRaw.split("|"); mkSet(parts[0], parts.slice(1).join("|")); return; }
      const mkUnsetKey = el.getAttribute("data-mk-unset");
      if (mkUnsetKey) {
        if (mkUnsetKey === "q") mk.q = "";
        else if (mkUnsetKey === "reg") mk.reg = null;
        else mk[mkUnsetKey] = "all";
        mk.limit = 9; render(); return;
      }
      const mkPage = el.getAttribute("data-mk-page");
      if (mkPage) { mk.page = mkPage; render(); window.scrollTo({ top: 200, behavior: "smooth" }); return; }
      if (el.getAttribute("data-mk-more")) { mk.limit += 9; render(); return; }
      const mkRegId = el.getAttribute("data-mk-reg");
      if (mkRegId) {
        mk.reg = mkRegId; mk.cat = "all"; mk.q = ""; mk.sort = "default"; mk.page = "list"; mk.limit = 9;
        state.view = "market"; mkLoad(); closeDetail(); syncNav(); render();
        toast("已按该法规筛选集市服务");
        return;
      }
      const mkTagV = el.getAttribute("data-mk-tag");
      if (mkTagV) { mk.q = mkTagV; mk.cat = "all"; mk.reg = null; mk.page = "list"; mk.limit = 9; render(); return; }
      const mkExp = el.getAttribute("data-mk-export");
      if (mkExp) {
        if (mkExp === "cart-md") exportCartMd();
        else if (mkExp === "cart-csv") exportCartCSV();
        else if (mkExp === "offer-md") {
          const oo = mkOfferOf(el.getAttribute("data-mk-id"));
          if (oo) download("服务包说明-" + oo.id + "-" + stamp() + ".md", mkOfferMd(oo), "text/markdown");
        }
        return;
      }
      const mkForReg = el.getAttribute("data-mk-for-reg");
      if (mkForReg) {
        mk.reg = mkForReg; mk.cat = "all"; mk.q = ""; mk.sort = "default"; mk.page = "list"; mk.limit = 9;
        state.view = "market"; mkLoad(); syncNav(); render();
        toast("已按该事项的法规依据筛选集市服务");
        return;
      }
      const mkForDoc = el.getAttribute("data-mk-for-doc");
      if (mkForDoc) {
        const cat = mkCatForDoc(mkForDoc, el.getAttribute("data-mk-dim"));
        mk.cat = cat; mk.type = "all"; mk.region = "all"; mk.price = "all"; mk.q = ""; mk.reg = null; mk.sort = "default";
        mk.page = "list"; mk.limit = 9;
        state.view = "market"; mkLoad(); closeDetail(); syncNav(); render();
        toast("已按问题类型筛选集市服务：" + mkCatName(cat));
        return;
      }

      /* ---------- 全文层 ---------- */
      const ftChId = el.getAttribute("data-ft-ch");
      if (ftChId) {
        const c = FT_CH[ftChId];
        if (c) { window.open(c.url, "_blank", "noopener"); toast("已打开官方通道：" + c.name); }
        return;
      }
      if (el.getAttribute("data-ft-open")) { ftOpenEditor(true); return; }
      if (el.getAttribute("data-ft-cancel")) { ftOpenEditor(false); return; }
      if (el.getAttribute("data-ft-demo")) {
        if (curDetail) ftDemoImport(curDetail.id);
        return;
      }
      if (el.getAttribute("data-ft-save")) {
        const ta = $("#ftInput"), sr = $("#ftSrc");
        if (!ta || !String(ta.value).trim()) { ft.err = "导入内容为空，请先粘贴或上传法规全文"; ftRefresh(); return toast("导入内容为空"); }
        ft.input = ta.value;
        ft.source = (sr && sr.value.trim()) ? sr.value.trim() : "手动导入（未标注来源）";
        if (curDetail) ftDoImport(curDetail.id, ta.value, ft.source);
        return;
      }
      if (el.getAttribute("data-ft-clear")) {
        if (curDetail) { ftClear(curDetail.id); ft.q = ""; ftRefresh(); toast("已清除该法规的全文副本"); }
        return;
      }
      if (el.getAttribute("data-ft-export")) {
        if (curDetail) download(curDetail.id + "-" + curDetail.title + "-全文导入件.md", ftExportMd(curDetail.id), "text/markdown");
        return;
      }
      if (el.getAttribute("data-ft-reimport")) {
        const st = curDetail ? ftOf(curDetail.id) : null;
        if (st) { ft.input = ftToText(st); ft.source = st.source; ft.open = true; ft.err = ""; ftRefresh(); toast("已载入现有导入件，修改后可重新解析"); }
        else ftOpenEditor(true);
        return;
      }
      const ftJump = el.getAttribute("data-ft-jump");
      if (ftJump) {
        const q = el.getAttribute("data-ft-q") || "";
        const had = !!ftOf(ftJump);
        openDetail(ftJump);
        ft.q = had ? q : "";
        ftRefresh();
        const box = $("#ftSection");
        if (box && box.scrollIntoView) box.scrollIntoView({ behavior: "smooth", block: "start" });
        if (!had) toast("该法规尚未导入官方全文，已定位到官方通道区；导入后可直接跳到对应条款");
        return;
      }

      const openId = el.getAttribute("data-open");
      if (openId) { openDetail(openId); return; }
      const scGo = el.getAttribute("data-sc-review");
      if (scGo) {
        if (REVIEW) rv.docType = scGo;
        rv.result = null;
        state.view = "review"; syncNav(); render();
        toast("已跳转到文档审查工作台，文档类型预设为：" + scDocName(scGo));
        return;
      }
      const scFlow = el.getAttribute("data-sc-flow");
      if (scFlow) { flowPath = sc.pathId; state.view = "flow"; syncNav(); render(); return; }
      const scKind = el.getAttribute("data-sc-export");
      if (scKind) {
        if (scKind === "report") exportSelfCheckReport();
        else if (scKind === "gap") exportSelfCheckGap();
        else if (scKind === "blank") exportSelfCheckBlank();
        else if (scKind === "json") exportSelfCheckJSON();
        return;
      }
      const rvKind = el.getAttribute("data-rv-export");
      if (rvKind) {
        if (rvKind === "report") exportReviewReport();
        else if (rvKind === "csv") exportIssueCSV();
        else if (rvKind === "plan") exportRectifyPlan();
        else if (rvKind === "prompt") exportReviewPrompt();
        return;
      }
      const kind = el.getAttribute("data-flow-export");
      if (kind === "classify") exportClassify();
      else if (kind === "factors") exportFactors();
      else if (kind === "dossier") exportDossier();
      else if (kind === "path") exportPathPlan(FPATH[el.getAttribute("data-pw")]);
      else if (kind === "timeline") exportTimeline(el.getAttribute("data-tlid"));
      else if (kind === "plan") exportFlowPlan();
      else if (kind === "prompt") exportPrompt(flowRegsAll(), "医疗器械注册路径合规");
    });

    $("#mask").addEventListener("click", closeDetail);
    $("#drawerClose").addEventListener("click", closeDetail);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDetail(); });
    $$("[data-foothot]").forEach((el) => el.addEventListener("click", () => { $("#q").value = el.getAttribute("data-foothot"); doSearch(); }));
    $$("[data-footregion]").forEach((el) => el.addEventListener("click", () => { resetAll(); state.regions = new Set([el.getAttribute("data-footregion")]); render(); }));

    // 全文层：文件选择与全文内检索（用委托，兼容抽屉内动态重建的节点）
    document.addEventListener("change", (e) => {
      if (e.target && e.target.id === "ftFile") ftLoadFile();
    });
    document.addEventListener("input", (e) => {
      if (e.target && e.target.id === "ftQ") {
        ft.q = e.target.value;
        clearTimeout(ftTimer);
        ftTimer = setTimeout(ftArtsRefresh, 260);
      }
    });
  }

  function syncNav() {
    const on = (el, v) => { if (el) el.classList.toggle("active", v); };
    on($("#btnFav"), state.view === "favorites");
    on($("#btnDl"), state.view === "downloads");
    on($("#navFlow"), state.view === "flow");
    on($("#navReview"), state.view === "review");
    on($("#navSelfCheck"), state.view === "selfcheck");
    on($("#navMarket"), state.view === "market");
  }

  function doSearch() { state.q = $("#q").value; state.view = "list"; state.ids = new Set(); state.limit = 12; syncNav(); render(); window.scrollTo({ top: 240, behavior: "smooth" }); }
  function resetAll() {
    state.q = ""; $("#q").value = "";
    state.regions = new Set(); state.levels = new Set(); state.statuses = new Set();
    state.issuers = new Set(); state.tags = new Set(); state.ids = new Set(); state.scene = null;
    state.view = "list"; state.sort = "default"; state.limit = 12;
    syncNav(); render();
  }
  function clearAll() { resetAll(); }

  /* ------------------------------ 详情抽屉 ------------------------------ */
  let curDetail = null;
  function openDetail(id) {
    const r = BY_ID[id]; if (!r) return;
    curDetail = r;
    ft.regId = id; ft.q = ""; ft.open = false; ft.input = ""; ft.source = ""; ft.err = "";
    const rg = regionOf(r.region);
    const rel = (r.related || []).map((x) => BY_ID[x]).filter(Boolean);
    const cite = citeOf(r);

    $("#drawerHead").innerHTML =
      "<div style=\"min-width:0\"><h2>" + esc(r.title) + "</h2>" +
      '<div class="en">' + esc(r.titleEn || "") + "</div>" +
      '<div class="badges" style="margin-top:8px">' +
      '<span class="badge region">' + esc(rg.flag + " " + rg.name + " · " + rg.en) + "</span>" +
      '<span class="badge level">' + esc(r.level) + "</span>" +
      '<span class="badge status-' + esc(r.status) + '">' + esc(r.status) + "</span>" +
      (r.priority === "core" ? '<span class="badge core">核心必读</span>' : r.priority === "key" ? '<span class="badge key">重点</span>' : "") +
      "</div></div>" +
      '<button class="close" id="drawerClose">✕</button>';

    const kv = [
      ["法规文号", r.docNo], ["发布机关", r.issuer], ["文件类型", r.type],
      ["发布日期", r.issueDate], ["施行日期", r.effectiveDate], ["效力状态", r.status],
      ["效力层级", r.level], ["所属地区", rg.name + "（" + rg.en + "）"],
      ["来源机构", r.source], ["最近核验", r.lastVerified],
      ["条款要点数", (r.articles || []).length + " 条"], ["被引用次数", (inbound[r.id] || 0) + " 次"]
    ].map((x) => '<div class="row"><div class="kk">' + esc(x[0]) + '</div><div class="vv">' + esc(x[1]) + "</div></div>").join("");

    const arts = (r.articles || []).map((a, i) =>
      '<div class="art' + (i < 2 ? " open" : "") + '"><div class="art-h"><span class="art-no">' + esc(a.no) +
      '</span><span class="art-label">' + esc(a.label) + '</span><span class="arrow">▶</span></div>' +
      '<div class="art-c">' + esc(a.text) + "</div></div>").join("");

    $("#drawerBody").innerHTML =
      '<div class="notice"><b>使用提示：</b>以下条款为编辑整理的「核心条款要点」，用于快速定位与理解制度框架，<b>并非官方逐字全文</b>。需要逐条原文时，可在下方「全文层」从官方通道取得全文后导入，平台会在本机解析为条款结构并与要点做条号对照。正式引用、合规判定与对外文件请以官方公布文本为准。</div>' +

      '<div class="sec"><h3 class="sec-h">法规定位</h3><p style="margin:0;font-size:13.5px;color:var(--text-2);line-height:1.8">' + esc(r.summary) + "</p></div>" +

      '<div class="sec"><h3 class="sec-h">基础信息与溯源</h3><div class="kv">' + kv + "</div></div>" +

      '<div class="sec"><h3 class="sec-h">核心条款要点 <span class="hint">点击展开 / 收起，共 ' + (r.articles || []).length + " 条</span></h3>" + arts + "</div>" +

      (FT ? '<div id="ftSection">' + ftHTML(r) + "</div>" : "") +

      mkRegServicesHTML(r) +

      (rel.length ? '<div class="sec"><h3 class="sec-h">关联法规 <span class="hint">配套阅读</span></h3><div class="rel-list">' +
        rel.map((x) => '<button class="rel-chip" data-open="' + esc(x.id) + '">' + regionOf(x.region).flag + " " + esc(x.title) +
          '<span class="rg">' + esc(x.docNo) + "</span></button>").join("") + "</div></div>" : "") +

      '<div class="sec"><h3 class="sec-h">主题标签</h3><div class="rel-list">' +
        (r.tags || []).map((t) => '<button class="rel-chip" data-tag="' + esc(t) + '">' + esc(t) + "</button>").join("") + "</div></div>" +

      '<div class="sec"><h3 class="sec-h">标准引用格式 <span class="hint">可直接复制到台账 / 报告中</span></h3>' +
      '<div class="notice" style="background:var(--surface-2);border-color:var(--border);color:var(--text-2);font-family:var(--mono);font-size:12.5px">' + esc(cite) + "</div></div>";

    $("#drawerFoot").innerHTML =
      '<button class="act primary" id="dSrc">🔗 官方溯源（打开 ' + esc(r.source) + "）</button>" +
      '<button class="act" id="dMd">⬇ 导出 Markdown</button>' +
      '<button class="act" id="dTxt">⬇ 导出 TXT</button>' +
      '<button class="act" id="dJson">⬇ 导出 JSON</button>' +
      '<button class="act" id="dFull">📖 跳到全文层</button>' +
      '<button class="act" id="dCite">📋 复制引用</button>' +
      '<button class="act" id="dPrompt">🤖 生成审查提示词</button>' +
      '<span class="spacer"></span>' +
      '<button class="act' + (state.favs.has(r.id) ? " accent" : "") + '" id="dFav">' + (state.favs.has(r.id) ? "★ 已收藏" : "☆ 收藏到我的法规库") + "</button>";

    $$("#drawerBody .art-h").forEach((h) => h.addEventListener("click", () => h.parentElement.classList.toggle("open")));
    $$("#drawerBody [data-tag]").forEach((el) => el.addEventListener("click", () => { const t = el.getAttribute("data-tag"); state.tags = new Set([t]); state.view = "list"; closeDetail(); render(); }));
    $("#drawerClose").addEventListener("click", closeDetail);
    $("#dSrc").addEventListener("click", () => window.open(r.officialUrl, "_blank", "noopener"));
    $("#dMd").addEventListener("click", () => download(r.id + "-" + r.title + ".md", regMarkdown(r), "text/markdown"));
    $("#dTxt").addEventListener("click", () => download(r.id + "-" + r.title + ".txt", regText(r), "text/plain"));
    $("#dJson").addEventListener("click", () => download(r.id + ".json", JSON.stringify(r, null, 2), "application/json"));
    $("#dCite").addEventListener("click", () => copy(cite));
    const dFull = $("#dFull");
    if (dFull) dFull.addEventListener("click", () => {
      const box = $("#ftSection");
      if (box && box.scrollIntoView) box.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    $("#dPrompt").addEventListener("click", () => {
      const seed = (r.related || []).map((x) => BY_ID[x]).filter(Boolean);
      exportPrompt([r].concat(seed), r.title);
    });
    $("#dFav").addEventListener("click", () => {
      if (state.favs.has(r.id)) { state.favs.delete(r.id); toast("已取消收藏"); } else { state.favs.add(r.id); toast("已加入我的法规库"); }
      saveFavs(); $("#dFav").className = "act" + (state.favs.has(r.id) ? " accent" : ""); $("#dFav").textContent = state.favs.has(r.id) ? "★ 已收藏" : "☆ 收藏到我的法规库"; render();
    });

    $("#mask").classList.add("show");
    $("#drawer").classList.add("show");
    $("#drawerBody").scrollTop = 0;
  }
  function closeDetail() { $("#mask").classList.remove("show"); $("#drawer").classList.remove("show"); }

  function citeOf(r) {
    const rg = regionOf(r.region);
    return r.issuer + "：" + r.title + "（" + r.docNo + "）[" + r.level + "]，" + r.issueDate + "发布，" + r.effectiveDate +
      "施行，效力状态：" + r.status + "。来源：" + r.source + "（" + rg.name + "），核验日期 " + r.lastVerified + "。";
  }

  /* ------------------------------ Markdown / TXT ------------------------------ */
  function regMarkdown(r) {
    const rg = regionOf(r.region);
    const rel = (r.related || []).map((x) => BY_ID[x]).filter(Boolean);
    let s = "# " + r.title + "\n\n";
    if (r.titleEn) s += "> " + r.titleEn + "\n\n";
    s += "| 项目 | 内容 |\n| --- | --- |\n";
    s += "| 法规文号 | " + r.docNo + " |\n";
    s += "| 发布机关 | " + r.issuer + " |\n";
    s += "| 效力层级 | " + r.level + " |\n";
    s += "| 所属地区 | " + rg.name + "（" + rg.en + "） |\n";
    s += "| 发布日期 | " + r.issueDate + " |\n";
    s += "| 施行日期 | " + r.effectiveDate + " |\n";
    s += "| 效力状态 | " + r.status + " |\n";
    s += "| 来源机构 | " + r.source + " |\n";
    s += "| 官方入口 | " + r.officialUrl + " |\n";
    s += "| 最近核验 | " + r.lastVerified + " |\n\n";
    s += "## 法规定位\n\n" + r.summary + "\n\n";
    s += "## 核心条款要点\n\n";
    (r.articles || []).forEach((a) => { s += "### " + a.no + "　" + a.label + "\n\n" + a.text + "\n\n"; });
    if ((r.tags || []).length) s += "## 主题标签\n\n" + r.tags.join("、") + "\n\n";
    if (rel.length) s += "## 关联法规\n\n" + rel.map((x) => "- " + x.title + "（" + x.docNo + "）").join("\n") + "\n\n";
    s += "---\n\n" + citeOf(r) + "\n\n";
    s += "> 说明：本文件由「医械法规云」自动导出，条款为编辑整理要点，非官方逐字全文；正式引用请以官方公布文本为准。\n";
    return s;
  }

  function regText(r) {
    let s = r.title + "\n" + "=".repeat(40) + "\n";
    s += "文号：" + r.docNo + "\n发布机关：" + r.issuer + "\n发布日期：" + r.issueDate + "\n施行日期：" + r.effectiveDate + "\n";
    s += "效力状态：" + r.status + "　效力层级：" + r.level + "\n来源：" + r.source + "\n官方入口：" + r.officialUrl + "\n\n";
    s += "【法规定位】\n" + r.summary + "\n\n【核心条款要点】\n";
    (r.articles || []).forEach((a, i) => { s += (i + 1) + ". " + a.no + "　" + a.label + "\n   " + a.text + "\n"; });
    s += "\n" + citeOf(r) + "\n";
    return s;
  }

  /* ------------------------------ 导出 ------------------------------ */
  function exportCSV(list) {
    const head = ["序号", "地区", "标题", "英文标题", "文号", "发布机关", "效力层级", "文件类型", "发布日期", "施行日期", "效力状态", "重要度", "主题标签", "条款要点数", "被引用数", "官方来源", "来源机构", "最近核验"];
    const rows = list.map((r, i) => [i + 1, regionOf(r.region).name, r.title, r.titleEn, r.docNo, r.issuer, r.level, r.type,
      r.issueDate, r.effectiveDate, r.status, r.priority === "core" ? "核心必读" : r.priority === "key" ? "重点" : "一般",
      (r.tags || []).join(" / "), (r.articles || []).length, inbound[r.id] || 0, r.officialUrl, r.source, r.lastVerified]);
    const csv = [head].concat(rows).map((r) => r.map((c) => '"' + String(c == null ? "" : c).replace(/"/g, '""') + '"').join(",")).join("\r\n");
    download("医械法规清单-" + stamp() + ".csv", "\uFEFF" + csv, "text/csv");
    toast("已导出 " + list.length + " 条法规清单（含 BOM，Excel 可直接打开）");
  }

  function exportJSON(list) {
    const payload = {
      exportAt: new Date().toISOString(),
      platform: MDR_META.platform.name + " " + MDR_META.platform.version,
      filter: { keyword: state.q, regions: Array.from(state.regions), levels: Array.from(state.levels), statuses: Array.from(state.statuses), issuers: Array.from(state.issuers), tags: Array.from(state.tags), scene: state.scene },
      count: list.length,
      data: list
    };
    download("医械法规数据包-" + stamp() + ".json", JSON.stringify(payload, null, 2), "application/json");
    toast("已导出结构化 JSON 数据包（" + list.length + " 部法规）");
  }

  function exportGap(list) {
    let s = "# 医疗器械法规合规差距分析表\n\n";
    s += "- 生成时间：" + new Date().toLocaleString("zh-CN") + "\n";
    s += "- 覆盖法规：" + list.length + " 部\n";
    s += "- 检索条件：关键词「" + (state.q || "无") + "」；地区 " + (Array.from(state.regions).join("、") || "全部") + "\n\n";
    s += "## 使用说明\n\n";
    s += "本表按法规条款要点逐条列出核对项，请填写「符合性判定」「责任部门」「证据文件编号」「整改计划完成日」四列。\n";
    s += "符合性判定建议取值：符合 / 部分符合 / 不符合 / 不适用。\n\n";
    s += "## 核对清单\n\n";
    list.forEach((r, i) => {
      s += "### " + (i + 1) + ". " + r.title + "（" + r.docNo + "）\n\n";
      s += "- 发布机关：" + r.issuer + "　施行日期：" + r.effectiveDate + "　状态：" + r.status + "\n";
      s += "- 官方来源：" + r.officialUrl + "\n\n";
      s += "| 序号 | 条款 | 要点 | 符合性判定 | 责任部门 | 证据文件编号 | 整改完成日 |\n";
      s += "| --- | --- | --- | --- | --- | --- | --- |\n";
      (r.articles || []).forEach((a, j) => {
        s += "| " + (i + 1) + "." + (j + 1) + " | " + a.no + " " + a.label + " | " + a.text.replace(/\|/g, "／") + " |  |  |  |  |\n";
      });
      s += "\n";
    });
    s += "---\n\n> 本表由「医械法规云」自动生成，条款要点为编辑整理，非官方逐字全文；最终判定请以官方公布文本为准。\n";
    download("法规合规差距分析表-" + stamp() + ".md", s, "text/markdown");
    toast("已生成差距分析表（" + list.reduce((a, r) => a + (r.articles || []).length, 0) + " 个核对项）");
  }

  /* ------------------------------ 法规审查提示词组装 ------------------------------ */
  /* 把选定法规的条款要点组装为结构化大模型审查提示词，用于文档合规审查与整改建议生成 */
  function buildPrompt(list, keyword) {
    const rgNames = Array.from(new Set(list.map((r) => regionOf(r.region).name)));
    const lvNames = Array.from(new Set(list.map((r) => r.level)));
    const terms = (keyword || "").trim();
    const focus = terms ? terms : "未指定具体主题，请按下方审查维度全面核查";

    let s = "";
    s += "# 医疗器械法规合规审查任务提示词\n\n";
    s += "> 由「医械法规云 MedReg Hub」自动组装 · 生成时间 " + new Date().toLocaleString("zh-CN") + "\n";
    s += "> 适用法规 " + list.length + " 部 · 覆盖 " + rgNames.join("、") + " · 层级 " + lvNames.join("、") + "\n\n";

    s += "## 一、角色设定\n\n";
    s += "你是一名资深医疗器械注册与质量体系合规专家（RA/QA），熟悉中国 NMPA 法规体系与主要海外市场准入要求，";
    s += "具备注册申报资料审核、质量管理体系核查、临床评价与上市后监测的实务经验。";
    s += "你的判断必须严格基于下方「法规依据」清单，并给出可追溯的条款出处。\n\n";

    s += "## 二、审查任务\n\n";
    s += "请对我在文末提供的【待审查文档】开展系统性合规审查，逐项判定其是否满足适用法规要求，";
    s += "输出问题清单、风险等级与可执行的整改建议。\n\n";
    s += "- 审查重点：" + focus + "\n";
    s += "- 适用法规范围：" + rgNames.join(" / ") + "\n";
    s += "- 若文档涉及出口或海外市场，请同时指出与海外要求的差异点。\n\n";

    s += "## 三、法规依据（本次审查适用，共 " + list.length + " 部）\n\n";
    s += "> 说明：下列内容为平台整理的条款要点，用于定位审查依据；正式判定请以官方公布文本为准。\n\n";

    list.forEach((r, i) => {
      s += "### " + (i + 1) + ". " + r.title + "\n\n";
      s += "- 文号：" + r.docNo + "　| 层级：" + r.level + "　| 效力状态：" + r.status + "\n";
      s += "- 发布机关：" + r.issuer + "　| 施行日期：" + r.effectiveDate + "\n";
      s += "- 官方溯源：" + r.officialUrl + "\n";
      s += "- 条款要点：\n";
      (r.articles || []).forEach((a) => { s += "  - " + a.no + "（" + a.label + "）：" + a.text + "\n"; });
      s += "\n";
    });

    s += "## 四、审查维度\n\n";
    s += "1. **完整性与合法性**：是否覆盖适用法规要求的事项，有无缺项、越权或与法规冲突的表述。\n";
    s += "2. **内容准确性**：引用的条款、文号、时限、判定标准是否准确，有无援引过期或已废止版本。\n";
    s += "3. **文件间一致性**：技术要求、风险管理、说明书标签、体系文件之间是否相互呼应、无矛盾。\n";
    s += "4. **可追溯性**：记录、批次、UDI、来源标识与证据链是否满足追溯与核查要求。\n";
    s += "5. **风险控制闭环**：风险识别、控制措施、验证确认与剩余风险评价是否形成闭环。\n";
    s += "6. **上市后义务**：不良事件监测、定期风险评价、召回与变更控制的安排是否到位。\n\n";

    s += "## 五、输出格式\n\n";
    s += "请严格按以下结构输出：\n\n";
    s += "1. **总体结论**：一句话结论 + 合规成熟度评级（高 / 中 / 低）+ 主要风险提示。\n";
    s += "2. **问题清单**（Markdown 表格，按风险等级降序）：\n\n";
    s += "| 序号 | 审查项 | 法规依据（文号 + 条款） | 判定 | 问题描述 | 整改建议 | 风险等级 |\n";
    s += "| --- | --- | --- | --- | --- | --- | --- |\n";
    s += "| 1 |  |  | 符合 / 部分符合 / 不符合 / 不适用 |  |  | 高 / 中 / 低 |\n\n";
    s += "3. **整改优先级建议**：按「立即整改 / 限期整改 / 持续改进」三档分组，给出建议责任部门与完成时限。\n";
    s += "4. **法规溯源清单**：列出本次判定所引用的全部法规（标题 + 文号 + 官方链接）。\n\n";

    s += "## 六、硬性要求\n\n";
    s += "- 每一条判定必须注明法规依据的**文号与条款编号**；无法对应到具体条款的，标注「需人工确认」，不得臆测。\n";
    s += "- **不得虚构**法规名称、文号、条款内容或监管口径；不确定的信息应当明确标注为不确定。\n";
    s += "- 引用法规以本提示词「法规依据」清单为基础；如需补充清单外的法规，请单独列出并说明理由。\n";
    s += "- 涉及中国境内注册与体系要求的，以中国 NMPA 现行法规为准；涉及海外市场的，注明适用司法辖区。\n";
    s += "- 输出使用简体中文，表格不得省略列。\n\n";

    s += "## 七、待审查文档\n\n";
    s += "```\n【请在此处粘贴需要审查的文档全文，例如：产品技术要求 / 风险管理报告 / 说明书 / 注册申报资料 / 体系文件 / 供应商审核报告】\n```\n\n";
    s += "---\n\n";
    s += "> 本提示词由「医械法规云」自动生成；所引条款为编辑整理要点，非官方逐字全文，正式结论请以官方公布文本及监管机构最新口径为准。\n";
    return s;
  }

  function exportPrompt(list, keyword) {
    if (!list || !list.length) return toast("请先筛选出需要纳入审查范围的法规");
    const md = buildPrompt(list, keyword);
    download("法规审查提示词-" + stamp() + ".md", md, "text/markdown");
    toast("已生成审查提示词（含 " + list.length + " 部法规依据）");
  }

  /* ------------------------------ 下载中心 ------------------------------ */
  function downloadsHTML() {
    const cards = MDR_META.templates.map((t) => {
      const map = {
        "tpl-trace": ["csv", "⬇ 立即生成并下载"],
        "tpl-gap": ["gap", "⬇ 立即生成并下载"],
        "tpl-pack": ["json", "⬇ 立即生成并下载"],
        "tpl-prompt": ["prompt", "⬇ 立即生成并下载"],
        "tpl-flow": ["flow", "⬇ 立即生成并下载"],
        "tpl-review": ["go-review", "🔍 打开文档审查工作台"],
        "tpl-issue": ["go-review", "🔍 打开文档审查工作台"],
        "tpl-selfcheck": ["sc-report", "⬇ 生成自检报告并下载"],
        "tpl-selfcheck-gap": ["sc-gap", "⬇ 生成缺项清单并下载"],
        "tpl-rfq": ["mk-cart-csv", "⬇ 导出询价单 CSV"],
        "tpl-fullbook": ["ft-book", "⬇ 导出全文导入册"]
      };
      const ico = {
        "tpl-trace": "📊", "tpl-gap": "📋", "tpl-pack": "🗂️", "tpl-prompt": "🤖", "tpl-flow": "🏁",
        "tpl-review": "🔍", "tpl-issue": "🧾", "tpl-selfcheck": "🧭", "tpl-selfcheck-gap": "✅",
        "tpl-rfq": "📨", "tpl-fullbook": "📖"
      };
      const m = map[t.id] || ["", "暂不可用"];
      return '<div class="dl-card"><div class="nm">' +
        (ico[t.id] || "📄") + " " + esc(t.name) + "</div>" +
        '<div class="ds">' + esc(t.desc) + '</div><button class="act primary" data-export="' + m[0] + '">' + m[1] + "</button></div>";
    }).join("");

    const regionCards = MDR_META.regions.filter((g) => ALL.some((r) => r.region === g.code)).map((g) => {
      const n = ALL.filter((r) => r.region === g.code).length;
      const arts = ALL.filter((r) => r.region === g.code).reduce((a, r) => a + (r.articles || []).length, 0);
      return '<div class="dl-card"><div class="nm">' + g.flag + " " + esc(g.name) + "法规包</div>" +
        '<div class="ds">' + esc(g.en) + " · 收录 " + n + " 部法规、" + arts + " 条条款要点。含文号、发布机关、生效日期与官方溯源链接，导出为 CSV 台账或 JSON 数据包。</div>" +
        '<div style="display:flex;gap:8px"><button class="act" data-dl-region="' + g.code + '" data-fmt="csv">CSV 台账</button>' +
        '<button class="act" data-dl-region="' + g.code + '" data-fmt="json">JSON 数据包</button>' +
        '<button class="act" data-dl-region="' + g.code + '" data-fmt="gap">差距分析表</button></div></div>';
    }).join("");

    return '<div class="panel" style="padding:16px 18px;margin-bottom:14px">' +
      '<div style="font-size:15px;font-weight:700;margin-bottom:6px">下载中心</div>' +
      '<div style="font-size:13px;color:var(--text-2);line-height:1.75">按场景导出可直接使用的合规文件：台账、差距分析表与结构化数据包。' +
      '全部导出内容均包含文号、发布机关、生效日期、效力状态与官方来源链接，满足<b>可溯源</b>要求。' +
      '若需按特定条件导出，请返回列表页设置筛选条件后使用工具条上的导出按钮。' +
      '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="act primary" id="dlFlowGo">🏁 打开注册流程导航（分类判定 · 申报路径 · 资料清单 · 时限推算）</button>' +
      '<button class="act accent" id="dlReviewGo">🔍 打开文档审查工作台（合规审查 · 问题清单 · 整改计划）</button>' +
      '<button class="act" id="dlSCGo">🧭 打开申报前自检清单（就绪度评分 · 缺项清单）</button>' +
      '<button class="act" id="dlMkGo">🏪 打开法规服务集市（服务包 · 比价 · 询价单）</button></div></div>' +
      '<div class="sec"><h3 class="sec-h">常用模板</h3><div class="dl-grid">' + cards + "</div></div>" +
      (FT && ftImported() ? '<div class="sec"><h3 class="sec-h">全文层 <span class="hint">已导入 ' + ftImported() + " 部法规 / " + ftArtsTotal() + " 条条款</span></h3>" +
        '<div class="panel" style="padding:16px 18px"><div style="font-size:13px;color:var(--text-2);line-height:1.75">' +
        "平台不内嵌法规原文。这里汇总你在本机导入的全文，可导出为一份便于团队内部流转与归档的全文册。权威文本请以发布机关公布版本为准；导入内容保存在应用文件中。</div>" +
        '<div style="margin-top:12px"><button class="act primary" id="dlFtBook">⬇ 导出全文导入册（' + ftImported() + " 部）</button>" +
        '<button class="act danger" id="dlFtClear" style="margin-left:8px">🗑 清空全部导入件</button></div></div></div>' : "") +
      '<div class="sec"><h3 class="sec-h">按市场打包下载</h3><div class="dl-grid">' + regionCards + "</div></div>";
  }

  function bindDownloads() {
    $$("[data-dl-region]").forEach((b) => b.addEventListener("click", () => {
      const code = b.getAttribute("data-dl-region"), fmt = b.getAttribute("data-fmt");
      const list = ALL.filter((r) => r.region === code);
      if (fmt === "csv") exportCSV(list); else if (fmt === "json") exportJSON(list); else exportGap(list);
    }));
    const fg = $("#dlFlowGo");
    if (fg) fg.addEventListener("click", () => { state.view = "flow"; syncNav(); render(); });
    const rg = $("#dlReviewGo");
    if (rg) rg.addEventListener("click", () => { state.view = "review"; syncNav(); render(); });
    const sg = $("#dlSCGo");
    if (sg) sg.addEventListener("click", () => { state.view = "selfcheck"; scLoad(); syncNav(); render(); });
    const mg = $("#dlMkGo");
    if (mg) mg.addEventListener("click", () => { state.view = "market"; mkLoad(); syncNav(); render(); });
    const fb = $("#dlFtBook");
    if (fb) fb.addEventListener("click", exportFullBook);
    const fc = $("#dlFtClear");
    if (fc) fc.addEventListener("click", () => {
      const ask = "确定清除本机全部 " + ftImported() + " 部法规的全文导入件？此操作不可撤销。";
      const okc = (typeof window.confirm === "function") ? window.confirm(ask) : true;
      if (!okc) return;
      ftStore = {}; ftSave(); render(); toast("已清空全部全文导入件");
    });
  }

  /* ------------------------------ 下载 / 复制 / Toast ------------------------------ */
  function download(filename, content, mime) {
    const blob = new Blob([content], { type: (mime || "text/plain") + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 400);
    toast("已开始下载：" + filename);
  }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast("引用格式已复制到剪贴板"), () => fallbackCopy(text));
    } else fallbackCopy(text);
  }
  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast("引用格式已复制到剪贴板"); } catch (e) { toast("复制失败，请手动选择复制"); }
    ta.remove();
  }
  let toastTimer = null;
  function toast(msg) {
    const el = $("#toast"); el.textContent = msg; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }
  function stamp() { const d = new Date(), p = (n) => String(n).padStart(2, "0"); return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes()); }
  function debounce(fn, ms) { let t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  /* ============================================================================
   * 注册流程模块：分类判定 · 申报路径 · 资料清单 · 时限推算
   * ==========================================================================*/
  const FLOW = window.MDR_FLOW || null;
  const FPATH = {};
  let flowPath = null;
  const flowDossier = new Set();
  const flowOk = () => !!(FLOW && Array.isArray(FLOW.pathways) && FLOW.pathways.length);
  if (flowOk()) FLOW.pathways.forEach((p) => { FPATH[p.id] = p; });

  function pathRegs(p) {
    const ids = [];
    const push = (x) => { if (BY_ID[x] && ids.indexOf(x) < 0) ids.push(x); };
    (p.basis || []).forEach(push);
    (p.steps || []).forEach((s) => (s.basis || []).forEach(push));
    return ids.map((id) => BY_ID[id]);
  }
  function flowRegsAll() {
    const ids = [];
    FLOW.pathways.forEach((p) => pathRegs(p).forEach((r) => { if (ids.indexOf(r.id) < 0) ids.push(r.id); }));
    return ids.map((id) => BY_ID[id]);
  }
  function basisRow(ids) {
    const list = (ids || []).filter((x) => BY_ID[x]);
    if (!list.length) return "";
    return '<div class="basis-row"><span class="bl">法规依据</span>' +
      list.map((id) => {
        const r = BY_ID[id];
        return '<button class="basis-chip" data-open="' + esc(id) + '" title="' + esc(r.docNo + " · " + r.status) + '">' +
          regionOf(r.region).flag + " " + esc(r.title) + "</button>";
      }).join("") + "</div>";
  }

  /* ---------- 决策总览图 ---------- */
  function flowDiagram() {
    const nodes = [
      { t: "属性界定", d: "是否按医疗器械管理" },
      { t: "分类判定", d: "第一类 / 第二类 / 第三类" },
      { t: "路径选择", d: "常规 · 前置许可 · 加速通道" },
      { t: "资料准备与申报", d: "六大模块 · 受理与审评" },
      { t: "取证与证后维护", d: "变更 · 延续 · 上市后" }
    ];
    return '<div class="flow-diagram">' + nodes.map((n, i) =>
      '<div class="fd-node"><span class="fd-no">' + (i + 1) + '</span><span class="fd-t">' + esc(n.t) +
      '</span><span class="fd-d">' + esc(n.d) + "</span></div>" +
      (i < nodes.length - 1 ? '<span class="fd-arrow">›</span>' : "")
    ).join("") + "</div>";
  }

  /* ---------- 分类判定 ---------- */
  function flowClassify() {
    const CL = FLOW.classify;
    const steps = CL.steps.map((s) =>
      '<div class="cls-step"><div class="cs-no">' + esc(s.no) + "</div><div class=\"cs-body\">" +
      '<div class="cs-name">' + esc(s.name) + "</div>" +
      '<div class="cs-desc">' + esc(s.desc) + "</div>" +
      (s.tip ? '<div class="cs-tip">💡 ' + esc(s.tip) + "</div>" : "") +
      basisRow(s.basis) + "</div></div>").join("");

    const factors = CL.factors.map((f) =>
      '<tr><td class="fc-k">' + esc(f.k) + '</td><td class="fc-q">' + esc(f.q) +
      '</td><td class="fc-n">' + esc(f.note) + '</td><td class="fc-r"></td></tr>').join("");

    const dec = CL.decision.map((d) =>
      '<button class="dec-card" data-flow-jump="' + esc(d.path) + '">' +
      '<span class="dc-class">' + esc(d.result) + "</span>" +
      '<span class="dc-act">' + esc(d.action) + "</span>" +
      '<span class="dc-cond">' + esc(d.cond) + "</span>" +
      '<span class="dc-go">查看该路径 →</span></button>').join("");

    return '<section class="flow-sec"><h2 class="flow-h"><span class="no">' + esc(CL.no) + "</span>" + esc(CL.title) +
      '<span class="hint">判定结论决定申报路径与审评时限</span></h2>' +
      '<p class="flow-intro">' + esc(CL.intro) + "</p>" +
      '<div class="cls-steps">' + steps + "</div>" +
      '<h3 class="flow-sub">判定要素核对表<span class="hint">逐项填写结论并归档，作为申报资料与体系核查的证据</span></h3>' +
      '<div class="tbl-wrap"><table class="flow-tbl"><thead><tr><th>判定要素</th><th>核对问题（依《医疗器械分类规则》）</th><th>关注点</th><th>本公司结论</th></tr></thead><tbody>' +
      factors + "</tbody></table></div>" +
      '<h3 class="flow-sub">类别结论与申报动作<span class="hint">点击卡片跳转到对应路径</span></h3>' +
      '<div class="dec-grid">' + dec + "</div>" +
      '<div class="flow-acts"><button class="act accent" data-flow-export="classify">⬇ 导出《分类判定记录表》</button>' +
      '<button class="act" data-flow-export="factors">⬇ 导出《判定要素核对表》</button></div>' +
      "</section>";
  }

  /* ---------- 申报路径 ---------- */
  function flowPathways() {
    const groups = [];
    FLOW.pathways.forEach((p) => { if (groups.indexOf(p.group) < 0) groups.push(p.group); });
    const body = groups.map((g) => {
      const list = FLOW.pathways.filter((p) => p.group === g);
      const cards = list.map((p) =>
        '<article class="pw-card' + (flowPath === p.id ? " on" : "") + '" data-flow-pw="' + esc(p.id) + '">' +
        '<div class="pw-ico">' + p.icon + "</div>" +
        '<h4 class="pw-name">' + esc(p.name) + "</h4>" +
        '<p class="pw-short">' + esc(p.short) + "</p>" +
        '<div class="pw-meta"><span class="pw-badge">' + p.steps.length + " 个环节</span>" +
        '<span class="pw-badge time">' + esc(p.deadline.length > 30 ? p.deadline.slice(0, 30) + "…" : p.deadline) + "</span></div>" +
        '<div class="pw-org">🏛 ' + esc(p.org) + "</div>" +
        '<span class="pw-toggle">' + (flowPath === p.id ? "收起环节 ▲" : "展开环节 ▼") + "</span>" +
        "</article>").join("");
      const hasOpen = list.some((p) => p.id === flowPath);
      return '<div class="pw-group"><div class="pw-group-h"><span>' + esc(g) + "</span><b>" + list.length + "</b></div>" +
        '<div class="pw-grid">' + cards + "</div>" +
        (hasOpen ? flowPathDetail(FPATH[flowPath]) : "") + "</div>";
    }).join("");
    return '<section class="flow-sec"><h2 class="flow-h"><span class="no">02</span>申报路径与流程环节' +
      '<span class="hint">点击卡片展开该路径的环节、办理机关、时限与法规依据</span></h2>' + body + "</section>";
  }

  function flowPathDetail(p) {
    if (!p) return "";
    const steps = p.steps.map((s) =>
      '<li class="tls"><div class="tls-no">' + esc(s.no) + '</div><div class="tls-body">' +
      '<div class="tls-head"><span class="tls-name">' + esc(s.name) + '</span><span class="tls-due">⏱ ' + esc(s.due) + "</span></div>" +
      '<div class="tls-org">责任方：' + esc(s.org) + "</div>" +
      '<div class="tls-detail">' + esc(s.detail) + "</div>" +
      basisRow(s.basis) + "</div></li>").join("");
    const regs = pathRegs(p);
    return '<div class="pw-detail">' +
      '<div class="pwd-h1">' + p.icon + " " + esc(p.name) + '<span class="pwd-grp">' + esc(p.group) + "</span></div>" +
      '<div class="pwd-kv">' +
      '<div><span class="k">适用情形</span><span class="v">' + esc(p.applicable) + "</span></div>" +
      '<div><span class="k">办理机关</span><span class="v">' + esc(p.org) + "</span></div>" +
      '<div><span class="k">时限要求</span><span class="v">' + esc(p.deadline) + "</span></div>" +
      '<div><span class="k">取得结果</span><span class="v">' + esc(p.result) + "</span></div>" +
      "</div>" +
      '<div class="flow-acts">' +
      '<button class="act accent" data-flow-export="path" data-pw="' + esc(p.id) + '">⬇ 导出本路径规划书</button>' +
      '<button class="act" data-flow-prompt="' + esc(p.id) + '">🤖 生成本路径法规审查提示词</button>' +
      '<button class="act" data-flow-open="' + esc(p.id) + '">📚 查看本路径相关法规（' + regs.length + " 部）</button>" +
      "</div>" +
      '<h3 class="flow-sub">流程环节<span class="hint">共 ' + p.steps.length + " 个环节</span></h3>" +
      '<ol class="timeline">' + steps + "</ol>" +
      ((p.notes || []).length ? '<div class="pwd-notes"><div class="pn-h">⚠ 注意事项</div><ul>' +
        p.notes.map((n) => "<li>" + esc(n) + "</li>").join("") + "</ul></div>" : "") +
      "</div>";
  }

  /* ---------- 申报资料清单 ---------- */
  function flowDossierHTML() {
    const DS = FLOW.dossier;
    const total = DS.groups.reduce((a, g) => a + g.items.length, 0);
    const groups = DS.groups.map((g) =>
      '<div class="ds-card"><div class="ds-h"><span class="ds-no">' + esc(g.no) + '</span><span class="ds-name">' + esc(g.name) +
      '</span><span class="ds-cnt">' + g.items.length + ' 项</span></div><div class="ds-items">' +
      g.items.map((it) => {
        const key = g.name + "::" + it;
        return '<label class="ds-item' + (flowDossier.has(key) ? " on" : "") + '"><input type="checkbox" data-ds="' + esc(key) + '"' +
          (flowDossier.has(key) ? " checked" : "") + "><span>" + esc(it) + "</span></label>";
      }).join("") + "</div></div>").join("");
    const basisReg = BY_ID[DS.basis];
    return '<section class="flow-sec"><h2 class="flow-h"><span class="no">' + esc(DS.no) + "</span>" + esc(DS.title) +
      '<span class="hint">依据 ' + esc(basisReg ? basisReg.docNo : "") + " · 共 " + total + " 项</span></h2>" +
      '<p class="flow-intro">' + esc(DS.intro) + "</p>" +
      '<div class="ds-progress"><span id="dsCount">已勾选 ' + flowDossier.size + " / " + total + "</span>" +
      '<span class="ds-bar"><i id="dsBar" style="width:' + Math.round(flowDossier.size / total * 100) + '%"></i></span></div>' +
      '<div class="ds-grid">' + groups + "</div>" +
      '<div class="ds-tips"><div class="pn-h">📌 编制要点</div><ul>' +
      DS.tips.map((t) => "<li>" + esc(t) + "</li>").join("") + "</ul></div>" +
      basisRow([DS.basis]) +
      '<div class="flow-acts"><button class="act accent" data-flow-export="dossier">⬇ 导出《注册申报资料清单》（含勾选状态）</button></div>' +
      "</section>";
  }

  /* ---------- 时限推算 ---------- */
  const fmtDate = (d) => { const p = (n) => String(n).padStart(2, "0"); return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); };
  const isWeekend = (d) => { const w = d.getDay(); return w === 0 || w === 6; };
  function addWorkdays(d, n) { const c = new Date(d.getTime()); let left = n; while (left > 0) { c.setDate(c.getDate() + 1); if (!isWeekend(c)) left--; } return c; }
  function nextWorkday(d) { const c = new Date(d.getTime()); while (isWeekend(c)) c.setDate(c.getDate() + 1); return c; }

  function flowTimeline() {
    const opts = FLOW.timelines.map((t) => '<option value="' + esc(t.id) + '">' + esc(t.name) + "</option>").join("");
    return '<section class="flow-sec"><h2 class="flow-h"><span class="no">04</span>时限推算' +
      '<span class="hint">按官方规定的工作日上限累加，未扣除法定节假日</span></h2>' +
      '<div class="tl-form">' +
      '<label class="tl-f"><span>申报路径</span><select id="tlPath">' + opts + "</select></label>" +
      '<label class="tl-f"><span>受理日期</span><input type="date" id="tlStart" value="' + fmtDate(new Date()) + '"></label>' +
      '<button class="act primary" id="tlGo">开始推算</button>' +
      "</div>" +
      '<div id="tlOut" class="tl-out"></div>' +
      '<div class="tl-rules"><div class="pn-h">📐 时限口径说明</div><ul>' +
      FLOW.timelineRules.map((r) => "<li>" + esc(r) + "</li>").join("") + "</ul></div>" +
      "</section>";
  }

  function timelineRows(t, start) {
    let cursor = start, total = 0;
    const rows = t.phases.map((ph) => {
      const from = nextWorkday(cursor), end = addWorkdays(cursor, ph.workdays);
      cursor = end; total += ph.workdays;
      return { name: ph.name, workdays: ph.workdays, from: from, end: end, basis: ph.basis };
    });
    return { rows: rows, total: total, finish: cursor };
  }

  function runTimeline() {
    const out = $("#tlOut");
    if (!out) return;
    const t = FLOW.timelines.find((x) => x.id === ($("#tlPath") || {}).value);
    const val = ($("#tlStart") || {}).value;
    if (!t) { out.innerHTML = ""; return; }
    if (!val) { out.innerHTML = '<div class="tl-warn">请先选择受理日期</div>'; return; }
    const start = new Date(val + "T00:00:00");
    if (isNaN(start.getTime())) { out.innerHTML = '<div class="tl-warn">日期格式无法识别</div>'; return; }
    const res = timelineRows(t, start);
    const body = res.rows.map((r) =>
      "<tr><td>" + esc(r.name) + '</td><td class="c">' + r.workdays + '</td><td class="c">' + esc(fmtDate(r.from)) +
      '</td><td class="c hl">' + esc(fmtDate(r.end)) + '</td><td class="c muted">' + esc(r.basis) + "</td></tr>").join("");
    out.innerHTML =
      '<div class="tl-sum">' +
      '<div class="tls-card"><span class="k">受理日</span><span class="v">' + esc(fmtDate(start)) + "</span></div>" +
      '<div class="tls-card"><span class="k">法定工作日合计</span><span class="v">' + res.total + " 个</span></div>" +
      '<div class="tls-card"><span class="k">预计完成日</span><span class="v hi">' + esc(fmtDate(res.finish)) + "</span></div>" +
      '<div class="tls-card"><span class="k">约合自然日</span><span class="v">约 ' + Math.round(res.total / 5 * 7) + " 天</span></div>" +
      "</div>" +
      '<div class="tbl-wrap"><table class="flow-tbl tl-tbl"><thead><tr><th>环节</th><th>工作日</th><th>起算日</th><th>最晚完成日</th><th>依据</th></tr></thead><tbody>' +
      body + "</tbody></table></div>" +
      '<div class="tl-note"><b>提示：</b>' + esc(t.note) + " 上述推算仅累加法定工作日上限，<b>未扣除法定节假日</b>，也未计入补充资料、核查后整改与质量管理体系核查所占用的时间；实际周期通常长于推算结果。</div>" +
      '<div class="flow-acts"><button class="act accent" data-flow-export="timeline" data-tlid="' + esc(t.id) + '">⬇ 导出《' + esc(t.name) + "时限推算表》</button></div>";
  }

  /* ---------- 流程主视图 ---------- */
  function flowHTML() {
    if (!flowOk()) {
      return '<div class="panel empty"><div class="big">⚠️</div><h3>注册流程数据未加载</h3><p>请确认 data/registration-flow.js 已正确引入。</p></div>';
    }
    const stepTotal = FLOW.pathways.reduce((a, p) => a + p.steps.length, 0);
    const itemTotal = FLOW.dossier.groups.reduce((a, g) => a + g.items.length, 0);
    return '<div class="flow">' +
      '<section class="flow-hero">' +
      '<div class="fh-tag">REGISTRATION FLOW · 中国 NMPA</div>' +
      "<h1>医疗器械注册流程导航</h1>" +
      "<p>从属性界定、分类判定到申报路径选择、资料准备、取证与证后维护的全流程导航。每一个环节都挂载法规依据，可直接跳转到法规库查看条款要点与官方溯源入口。</p>" +
      '<div class="flow-stats">' +
      '<div><span class="n">' + FLOW.pathways.length + '</span><span class="l">申报路径</span></div>' +
      '<div><span class="n">' + stepTotal + '</span><span class="l">流程环节</span></div>' +
      '<div><span class="n">' + itemTotal + '</span><span class="l">申报资料条目</span></div>' +
      '<div><span class="n">' + FLOW.timelines.length + '</span><span class="l">时限规则组</span></div>' +
      "</div>" +
      '<div class="fh-notice">⚠ ' + esc(FLOW.notice) + "</div>" +
      "</section>" +
      '<section class="flow-sec"><h2 class="flow-h"><span class="no">00</span>路径决策总览<span class="hint">一图看清注册全流程</span></h2>' +
      flowDiagram() + "</section>" +
      flowClassify() +
      flowPathways() +
      flowDossierHTML() +
      flowTimeline() +
      '<div class="flow-acts big"><button class="act primary" data-flow-export="plan">📘 导出《医疗器械注册路径规划书》</button>' +
      '<button class="act" data-flow-export="prompt">🤖 生成注册路径法规审查提示词</button>' +
      '<button class="act accent" id="flowToReview">🔍 带本路径法规去审查文档</button>' +
      '<button class="act" id="flowToSC">🧭 生成该路径的申报前自检清单</button></div>' +
      "</div>";
  }

  function bindFlow() {
    $$("[data-flow-pw]").forEach((el) => el.addEventListener("click", () => {
      const id = el.getAttribute("data-flow-pw");
      flowPath = flowPath === id ? null : id;
      render();
      const pane = $(".pw-detail");
      if (pane && pane.scrollIntoView) pane.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    $$("[data-flow-jump]").forEach((el) => el.addEventListener("click", () => {
      flowPath = el.getAttribute("data-flow-jump");
      render();
      const pane = $(".pw-detail");
      if (pane && pane.scrollIntoView) pane.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    $$("[data-flow-prompt]").forEach((el) => el.addEventListener("click", () => {
      const p = FPATH[el.getAttribute("data-flow-prompt")];
      if (p) exportPrompt(pathRegs(p), "医疗器械注册路径：" + p.name);
    }));
    $$("[data-flow-open]").forEach((el) => el.addEventListener("click", () => {
      const p = FPATH[el.getAttribute("data-flow-open")];
      if (!p) return;
      state.ids = new Set(pathRegs(p).map((r) => r.id));
      state.view = "list"; state.limit = 12; state.q = ""; $("#q").value = "";
      state.regions = new Set(); state.levels = new Set(); state.statuses = new Set();
      state.issuers = new Set(); state.tags = new Set(); state.scene = null;
      syncNav(); render();
      window.scrollTo({ top: 240, behavior: "smooth" });
    }));
    $$("[data-ds]").forEach((el) => el.addEventListener("change", () => {
      const key = el.getAttribute("data-ds");
      if (el.checked) flowDossier.add(key); else flowDossier.delete(key);
      const total = FLOW.dossier.groups.reduce((a, g) => a + g.items.length, 0);
      const c = $("#dsCount"), b = $("#dsBar");
      if (c) c.textContent = "已勾选 " + flowDossier.size + " / " + total;
      if (b) b.style.width = Math.round(flowDossier.size / total * 100) + "%";
      const lab = el.parentElement;
      if (lab && lab.classList) lab.classList.toggle("on", el.checked);
    }));
    const fr = $("#flowToReview");
    if (fr) fr.addEventListener("click", () => {
      const p = (flowPath && FPATH[flowPath]) ? FPATH[flowPath] : FPATH[rv.pathId];
      rv.basisMode = "path";
      if (p) rv.pathId = p.id;
      state.view = "review";
      render();
      toast("已按「" + (p ? p.name : "第三类医疗器械注册") + "」设定审查基准");
    });
    const go = $("#tlGo"); if (go) go.addEventListener("click", runTimeline);
    const sel = $("#tlPath"); if (sel) sel.addEventListener("change", runTimeline);
    const sd = $("#tlStart"); if (sd) sd.addEventListener("change", runTimeline);
    const fs = $("#flowToSC");
    if (fs) fs.addEventListener("click", () => {
      const pid = (flowPath && FPATH[flowPath]) ? flowPath : sc.pathId;
      sc.pathId = pid; scLoad();
      state.view = "selfcheck"; syncNav(); render();
      toast("已切换到自检清单：" + scPathName(pid) + "（" + scStat().total + " 项自检条目）");
    });
  }

  /* ---------- 流程导出 ---------- */
  function flowHeader() {
    return "> 由「医械法规云 MedReg Hub」生成 · " + new Date().toLocaleString("zh-CN") +
      "\n> 数据版本 v" + MDR_META.platform.version + " · 流程数据核验日期 " + (FLOW ? FLOW.updatedAt : "") + "\n\n";
  }
  function basisLine(ids) {
    const list = (ids || []).filter((x) => BY_ID[x]);
    if (!list.length) return "";
    return list.map((id) => BY_ID[id].title + "（" + BY_ID[id].docNo + "）").join("；");
  }

  function exportFactors() {
    const CL = FLOW.classify;
    let s = "# 医疗器械分类判定要素核对表\n\n" + flowHeader();
    s += "| 判定要素 | 核对问题 | 关注点 | 本公司结论 |\n| --- | --- | --- | --- |\n";
    CL.factors.forEach((f) => { s += "| " + f.k + " | " + f.q + " | " + f.note + " |  |\n"; });
    s += "\n---\n\n> 说明：" + FLOW.notice + "\n";
    download("分类判定要素核对表-" + stamp() + ".md", s, "text/markdown");
    toast("已生成判定要素核对表");
  }

  function exportClassify() {
    const CL = FLOW.classify;
    let s = "# 医疗器械分类判定记录表\n\n" + flowHeader();
    s += "## 一、判定路径\n\n";
    CL.steps.forEach((st) => {
      s += "### " + st.no + " " + st.name + "\n\n" + st.desc + "\n\n";
      if (st.tip) s += "> 提示：" + st.tip + "\n\n";
      const b = basisLine(st.basis);
      if (b) s += "法规依据：" + b + "\n\n";
    });
    s += "## 二、判定要素核对\n\n";
    s += "| 判定要素 | 核对问题 | 关注点 | 本公司结论 |\n| --- | --- | --- | --- |\n";
    CL.factors.forEach((f) => { s += "| " + f.k + " | " + f.q + " | " + f.note + " |  |\n"; });
    s += "\n## 三、管理类别结论\n\n";
    s += "| 风险程度描述 | 管理类别 | 申报动作 |\n| --- | --- | --- |\n";
    CL.decision.forEach((d) => { s += "| " + d.cond + " | " + d.result + " | " + d.action + " |\n"; });
    s += "\n- 产品名称：________\n- 判定结论：________（第一类 / 第二类 / 第三类）\n";
    s += "- 判定依据：________\n- 判定人 / 日期：________\n\n";
    s += "---\n\n> 说明：" + FLOW.notice + "\n";
    download("分类判定记录表-" + stamp() + ".md", s, "text/markdown");
    toast("已生成分类判定记录表");
  }

  function exportDossier() {
    const DS = FLOW.dossier;
    const total = DS.groups.reduce((a, g) => a + g.items.length, 0);
    let s = "# 医疗器械注册申报资料清单\n\n" + flowHeader();
    s += "- 依据：" + basisLine([DS.basis]) + "\n";
    s += "- 适用：第二类、第三类医疗器械产品注册、变更注册、延续注册\n";
    s += "- 条目总数：" + total + " 项；已勾选 " + flowDossier.size + " 项\n\n";
    s += "> " + DS.intro + "\n\n";
    DS.groups.forEach((g) => {
      s += "## " + g.no + "、" + g.name + "\n\n";
      g.items.forEach((it) => { s += "- [" + (flowDossier.has(g.name + "::" + it) ? "x" : " ") + "] " + it + "\n"; });
      s += "\n";
    });
    s += "## 编制要点\n\n" + DS.tips.map((t) => "- " + t).join("\n") + "\n\n";
    s += "---\n\n> 说明：" + FLOW.notice + "\n";
    download("注册申报资料清单-" + stamp() + ".md", s, "text/markdown");
    toast("已生成申报资料清单（" + total + " 项，已勾选 " + flowDossier.size + " 项）");
  }

  function pathMarkdown(p) {
    let s = "# " + p.name + " · 注册路径规划书\n\n" + flowHeader();
    s += "| 项目 | 内容 |\n| --- | --- |\n";
    s += "| 路径名称 | " + p.name + " |\n";
    s += "| 路径分组 | " + p.group + " |\n";
    s += "| 适用情形 | " + p.applicable + " |\n";
    s += "| 办理机关 | " + p.org + " |\n";
    s += "| 时限要求 | " + p.deadline + " |\n";
    s += "| 取得结果 | " + p.result + " |\n\n";
    s += "## 流程环节（共 " + p.steps.length + " 个）\n\n";
    p.steps.forEach((st) => {
      s += "### " + st.no + ". " + st.name + "\n\n";
      s += "- 责任方：" + st.org + "\n- 时限：" + st.due + "\n- 环节说明：" + st.detail + "\n";
      const b = basisLine(st.basis);
      if (b) s += "- 法规依据：" + b + "\n";
      s += "\n";
    });
    if ((p.notes || []).length) s += "## 注意事项\n\n" + p.notes.map((n) => "- " + n).join("\n") + "\n\n";
    const regs = pathRegs(p);
    s += "## 相关法规清单（" + regs.length + " 部）\n\n";
    regs.forEach((r) => { s += "- " + r.title + "（" + r.docNo + "）｜" + r.status + "｜官方溯源：" + r.officialUrl + "\n"; });
    s += "\n---\n\n> 说明：" + FLOW.notice + "\n";
    return s;
  }

  function exportPathPlan(p) {
    if (!p) return toast("路径不存在");
    download(p.name + "-注册路径规划书-" + stamp() + ".md", pathMarkdown(p), "text/markdown");
    toast("已导出《" + p.name + "》路径规划书");
  }

  function exportTimeline(tlid) {
    const t = FLOW.timelines.find((x) => x.id === tlid);
    if (!t) return;
    const val = ($("#tlStart") || {}).value;
    let s = "# " + t.name + " · 时限推算表\n\n" + flowHeader();
    s += "- 办理机关：" + t.org + "\n";
    if (val) {
      const start = new Date(val + "T00:00:00");
      if (!isNaN(start.getTime())) {
        const res = timelineRows(t, start);
        s += "- 受理日期：" + fmtDate(start) + "\n\n";
        s += "| 环节 | 工作日 | 起算日 | 最晚完成日 | 依据 |\n| --- | --- | --- | --- | --- |\n";
        res.rows.forEach((r) => { s += "| " + r.name + " | " + r.workdays + " | " + fmtDate(r.from) + " | " + fmtDate(r.end) + " | " + r.basis + " |\n"; });
        s += "\n- 法定工作日合计：" + res.total + " 个工作日\n";
        s += "- 预计完成日：" + fmtDate(res.finish) + "（约合自然日 " + Math.round(res.total / 5 * 7) + " 天）\n\n";
      }
    } else {
      s += "\n| 环节 | 工作日 | 依据 |\n| --- | --- | --- |\n";
      t.phases.forEach((ph) => { s += "| " + ph.name + " | " + ph.workdays + " | " + ph.basis + " |\n"; });
      s += "\n";
    }
    s += "> 提示：" + t.note + "\n\n## 时限口径说明\n\n" + FLOW.timelineRules.map((r) => "- " + r).join("\n") + "\n\n";
    s += "---\n\n> 本表按官方规定的工作日上限推算，未扣除法定节假日，不作为法定承诺时限。\n";
    download(t.name + "-时限推算表-" + stamp() + ".md", s, "text/markdown");
    toast("已导出时限推算表");
  }

  function exportFlowPlan() {
    const CL = FLOW.classify, DS = FLOW.dossier;
    const itemTotal = DS.groups.reduce((a, g) => a + g.items.length, 0);
    let s = "# 医疗器械注册路径规划书\n\n" + flowHeader();
    s += "本规划书依据现行中国 NMPA 法规整理，覆盖属性界定与分类判定、申报路径与流程环节、申报资料清单与时限要求，可按产品实际类别裁剪使用。\n\n";

    s += "## 一、路径决策总览\n\n";
    s += "属性界定 → 分类判定 → 路径选择 → 资料准备与申报 → 取证与证后维护\n\n";

    s += "## 二、属性界定与分类判定\n\n";
    CL.steps.forEach((st) => { s += "- **" + st.no + " " + st.name + "**：" + st.desc + "\n"; });
    s += "\n管理类别结论与申报动作：\n\n";
    CL.decision.forEach((d) => { s += "- " + d.cond + " → **" + d.result + "**，应办理：" + d.action + "\n"; });
    s += "\n判定要素核对表：\n\n| 判定要素 | 核对问题 | 本公司结论 |\n| --- | --- | --- |\n";
    CL.factors.forEach((f) => { s += "| " + f.k + " | " + f.q + " |  |\n"; });
    s += "\n";

    s += "## 三、申报路径与流程环节\n\n";
    const groups = [];
    FLOW.pathways.forEach((p) => { if (groups.indexOf(p.group) < 0) groups.push(p.group); });
    groups.forEach((g) => {
      s += "### " + g + "\n\n";
      FLOW.pathways.filter((p) => p.group === g).forEach((p) => {
        s += "#### " + p.name + "\n\n";
        s += "- 适用情形：" + p.applicable + "\n";
        s += "- 办理机关：" + p.org + "\n";
        s += "- 时限要求：" + p.deadline + "\n";
        s += "- 取得结果：" + p.result + "\n\n";
        s += "| 序号 | 环节 | 责任方 | 时限 |\n| --- | --- | --- | --- |\n";
        p.steps.forEach((st) => { s += "| " + st.no + " | " + st.name + " | " + st.org + " | " + st.due + " |\n"; });
        s += "\n";
      });
    });

    s += "## 四、注册申报资料清单（" + itemTotal + " 项）\n\n";
    s += "> " + DS.intro + "\n\n";
    DS.groups.forEach((g) => {
      s += "### " + g.no + "、" + g.name + "\n\n";
      g.items.forEach((it) => { s += "- [ ] " + it + "\n"; });
      s += "\n";
    });

    s += "## 五、时限口径\n\n" + FLOW.timelineRules.map((r) => "- " + r).join("\n") + "\n\n";

    s += "## 六、相关法规清单（" + flowRegsAll().length + " 部）\n\n";
    flowRegsAll().forEach((r) => { s += "- " + r.title + "（" + r.docNo + "）｜" + r.level + "｜" + r.status + "｜官方溯源：" + r.officialUrl + "\n"; });

    s += "\n---\n\n> 说明：" + FLOW.notice + "\n";
    download("医疗器械注册路径规划书-" + stamp() + ".md", s, "text/markdown");
    toast("已导出注册路径规划书（" + FLOW.pathways.length + " 条路径）");
  }

  /* ============================================================================
   * 文档审查工作台：审查基准 · 文档提交 · 本地审查引擎 · 报告与导出
   * ==========================================================================*/
  const REVIEW = window.MDR_REVIEW || null;
  const reviewOk = () => !!(REVIEW && Array.isArray(REVIEW.coverage) && REVIEW.coverage.length);
  const dimName = (k) => { const d = REVIEW && REVIEW.dimensions.find((x) => x.key === k); return d ? d.name : k; };
  const RV_DIM_KEYS = ["structure", "coverage", "normative", "consistency", "deadline", "security"];
  const LV_W = { "高": 6, "中": 3, "低": 1 };
  const LV_ORDER = { "高": 0, "中": 1, "低": 2 };

  const rv = {
    docType: "all",
    basisMode: "path",         // path | scene | ids | all
    pathId: "pw-class3",
    scene: "registration",
    ids: [],                   // 自定义范围（法规 id 数组）
    q: "",                     // 自定义范围检索词
    text: "",
    fileName: "",
    result: null,
    level: "all",
    showCovered: false
  };

  /* ---------- 文本工具 ---------- */
  function rvNormalize(s) {
    return String(s == null ? "" : s)
      .replace(/\r\n?/g, "\n")
      .replace(/[\u3000\t]/g, " ")
      .replace(/\u00a0/g, " ");
  }
  function rvLine(text, idx) { return text.slice(0, Math.max(0, idx)).split("\n").length; }
  function rvRe(p) {
    const fl = p.re.flags.indexOf("g") < 0 ? p.re.flags + "g" : p.re.flags;
    return new RegExp(p.re.source, fl);
  }

  /* 按规则类型收集命中证据 */
  function rvMatch(text, p) {
    const out = [];
    const CAP = 40;
    if (p.kind === "stdVersion") {
      const re = rvRe(p), seen = {};
      let m;
      while ((m = re.exec(text)) !== null) {
        if (out.length >= CAP) break;
        if (m[3]) { if (re.lastIndex === m.index) re.lastIndex++; continue; }
        const key = m[1] + m[2];
        if (seen[key]) { if (re.lastIndex === m.index) re.lastIndex++; continue; }
        seen[key] = 1;
        out.push({ text: m[0].trim(), pos: rvLine(text, m.index) });
        if (re.lastIndex === m.index) re.lastIndex++;
      }
      return out;
    }
    if (p.kind === "citeNoDocNo") {
      const re = rvRe(p);
      let m;
      while ((m = re.exec(text)) !== null) {
        if (out.length >= CAP) break;
        const tail = text.slice(m.index + m[0].length, m.index + m[0].length + 18);
        if (/(第\s?\d+\s?号|\d{4}\s?年\s?第\s?\d+\s?号|〔\d{4}〕|\[\d{4}\]|国令第\s?\d+\s?号)/.test(tail)) {
          if (re.lastIndex === m.index) re.lastIndex++;
          continue;
        }
        out.push({ text: m[0], pos: rvLine(text, m.index) });
        if (re.lastIndex === m.index) re.lastIndex++;
      }
      return out;
    }
    const re = rvRe(p);
    let m;
    while ((m = re.exec(text)) !== null) {
      if (out.length >= CAP) break;
      out.push({ text: m[0].trim(), pos: rvLine(text, m.index) });
      if (re.lastIndex === m.index) re.lastIndex++;
    }
    return out;
  }

  /* ---------- 审查引擎（确定性规则，本地运行） ---------- */
  function reviewRun(rawText, opts) {
    const o = opts || {};
    const text = rvNormalize(rawText);
    const low = text.toLowerCase();
    const docType = o.docType || "all";
    const issues = [];
    const covered = [];
    const dims = { structure: 0, coverage: 0, normative: 0, consistency: 0, deadline: 0, security: 0 };
    let seq = 0;
    const add = (x) => { seq++; x.no = seq; issues.push(x); dims[x.dim] = (dims[x.dim] || 0) + 1; };
    const has = (k) => low.indexOf(String(k).toLowerCase()) >= 0;

    /* 1) 结构完整性 */
    const st = REVIEW.docStructures[docType] || REVIEW.docStructures.all;
    const missingSecs = [];
    const hitSecs = [];
    (st.sections || []).forEach((s) => {
      const hit = s.kw.some(has);
      if (hit) hitSecs.push(s.name);
      else if (!s.optional) missingSecs.push(s.name);
    });
    if (missingSecs.length) {
      add({
        id: "st-" + docType, dim: "structure", level: missingSecs.length >= 3 ? "高" : "中",
        name: "文档结构不完整（缺 " + missingSecs.length + " 项应有章节）",
        detail: "未在文档中发现以下章节或对应内容：" + missingSecs.join("、") + "。",
        evidence: [],
        fix: "按「" + st.name + "」的构成补齐上述章节；确不适用的，应在文档中写明不适用理由，避免审核时被判定为缺项。",
        basis: st.basis || []
      });
    }
    if (hitSecs.length) covered.push({ dim: "structure", name: "章节结构：" + hitSecs.join("、") });

    /* 2) 要素覆盖（AND-of-OR） */
    let cvTotal = 0, cvHit = 0;
    REVIEW.coverage.forEach((c) => {
      const types = c.types || [];
      if (types.length && types.indexOf(docType) < 0) return;
      if (c.when && !c.when.some(has)) return;
      cvTotal++;
      const miss = [], hitKws = [];
      c.need.forEach((group) => {
        const h = group.filter(has);
        if (h.length) hitKws.push(h[0]); else miss.push(group[0]);
      });
      if (miss.length) {
        add({
          id: c.id, dim: "coverage", level: miss.length >= 3 && c.level !== "高" ? "高" : c.level,
          name: c.name,
          detail: c.tip + "。未覆盖要素：" + miss.join("、") + "。",
          evidence: [],
          fix: c.fix,
          basis: c.basis
        });
      } else {
        cvHit++;
        covered.push({ dim: "coverage", name: c.name, hit: hitKws.join(" / ") });
      }
    });

    /* 3) 规范性检查 */
    REVIEW.patterns.forEach((p) => {
      const ev = rvMatch(text, p);
      if (!ev.length) return;
      add({
        id: p.id, dim: p.dim, level: p.level,
        name: p.name + "（" + ev.length + " 处）",
        detail: p.msg,
        evidence: ev.slice(0, 5),
        fix: p.fix,
        basis: p.basis
      });
    });

    /* 4) 术语一致性 */
    REVIEW.terms.forEach((tm) => {
      const matched = (tm.variants || []).filter(has);
      /* 去掉被更长同义词包含的项，避免「说明书」被「使用说明书」重复计数 */
      const found = matched.filter((v) => !matched.some((w) => w !== v && w.indexOf(v) >= 0));
      if (tm.wrong) {
        const bad = tm.wrong.filter(has);
        if (bad.length) {
          add({
            id: tm.id, dim: "consistency", level: tm.level, name: tm.name + "：使用非规范写法",
            detail: tm.msg + " 命中：" + bad.join("、") + "。",
            evidence: bad.map((v) => ({ text: v, pos: rvLine(text, low.indexOf(v.toLowerCase())) })),
            fix: tm.fix, basis: tm.basis
          });
        }
        return;
      }
      if (found.length >= 2) {
        add({
          id: tm.id, dim: "consistency", level: tm.level, name: tm.name + "：存在 " + found.length + " 种表述",
          detail: tm.msg + " 命中：" + found.join(" / ") + "。",
          evidence: found.map((v) => ({ text: v, pos: rvLine(text, low.indexOf(v.toLowerCase())) })),
          fix: tm.fix, basis: tm.basis
        });
      }
    });

    /* 5) 时限口径核对 */
    REVIEW.deadlines.forEach((dl) => {
      if (dl.when && !dl.when.some(has)) return;
      const spans = [], hits = [];
      let any = false;
      (dl.checks || []).forEach((ck) => {
        const re = rvRe(ck), gi = ck.g === undefined ? 2 : ck.g;
        let m;
        while ((m = re.exec(text)) !== null) {
          if (re.lastIndex === m.index) re.lastIndex++;
          const s0 = m.index, s1 = m.index + m[0].length;
          if (spans.some((sp) => s0 < sp[1] && s1 > sp[0])) continue;   // 已被前一条规则消费，避免归属错位
          spans.push([s0, s1]);
          any = true;
          if (ck.skip && ck.skip.test(text.slice(Math.max(0, s0 - 40), s0))) continue;   // 境外/出口等另有口径的情形不按境内时限判定
          const val = String(m[gi]);
          if ((ck.allowed || []).indexOf(val) < 0) {
            hits.push({ label: ck.label, got: val, unit: ck.unit || "日", expect: ck.expect, text: m[0].trim(), pos: rvLine(text, s0) });
          }
        }
      });
      if (hits.length) {
        add({
          id: dl.id, dim: "deadline", level: dl.level,
          name: dl.name + "与法规口径不一致（" + hits.length + " 处）",
          detail: hits.map((h) => h.label + "：文档写为 " + h.got + " " + h.unit + "，" + h.expect).join("；") + "。",
          evidence: hits.map((h) => ({ text: h.text, pos: h.pos })),
          fix: "按 " + dl.cite + " 更正：" + (dl.checks || []).map((c) => c.expect).join("；") + "。并同步核对后续调查评价、总结报告的时限是否一致。",
          basis: dl.basis, cite: dl.cite
        });
      } else if (!any && dl.missing) {
        add({
          id: dl.id + "-miss", dim: "deadline", level: dl.missing.level,
          name: dl.name + "未明确",
          detail: dl.missing.msg, evidence: [],
          fix: dl.missing.fix, basis: dl.basis, cite: dl.cite
        });
      }
    });

    /* 6) 评分与统计 */
    const deduct = issues.reduce((a, i) => a + (LV_W[i.level] || 2), 0);
    const score = Math.max(0, 100 - deduct);
    const grade = score >= 85 ? "较高" : score >= 70 ? "中" : score >= 50 ? "偏低" : "低";
    issues.sort((a, b) => (LV_ORDER[a.level] - LV_ORDER[b.level]) || (a.dim < b.dim ? -1 : 1) || (a.no - b.no));
    issues.forEach((i, k) => { i.no = k + 1; });
    const stats = { "高": 0, "中": 0, "低": 0 };
    issues.forEach((i) => { stats[i.level] = (stats[i.level] || 0) + 1; });

    return {
      doc: { name: o.docName || "（未命名文档）", chars: text.length, lines: text.split("\n").length },
      docType, docTypeName: (REVIEW.docTypes.find((d) => d.id === docType) || {}).name || docType,
      basisCount: (o.basisIds || []).length,
      score, grade, issues, covered, stats, dims,
      cv: { total: cvTotal, hit: cvHit, rate: cvTotal ? Math.round(cvHit / cvTotal * 100) : 0 },
      at: new Date().toLocaleString("zh-CN")
    };
  }

  /* ---------- 审查基准 ---------- */
  function rvBasis() {
    if (rv.basisMode === "all") return ALL.slice();
    if (rv.basisMode === "scene") {
      const sc = MDR_META.scenes.find((s) => s.key === rv.scene);
      if (!sc) return [];
      return ALL.filter((r) => { const rt = r.tags || []; return sc.tags.some((x) => rt.indexOf(x) >= 0 || r.type === x || r.title.indexOf(x) >= 0); });
    }
    if (rv.basisMode === "path") { const p = FPATH[rv.pathId]; return p ? pathRegs(p) : []; }
    return rv.ids.map((id) => BY_ID[id]).filter(Boolean);
  }
  function rvBasisName() {
    if (rv.basisMode === "all") return "全库法规";
    if (rv.basisMode === "scene") { const sc = MDR_META.scenes.find((s) => s.key === rv.scene); return "业务场景：" + (sc ? sc.name : ""); }
    if (rv.basisMode === "path") { const p = FPATH[rv.pathId]; return "注册路径：" + (p ? p.name : ""); }
    return "自定义范围";
  }

  /* ---------- 渲染：工作台 ---------- */
  function rvBasisPicker() {
    const list = rvBasis();
    const chips = list.slice(0, 40).map((r) =>
      '<button class="rv-chip" data-open="' + esc(r.id) + '" title="' + esc(r.docNo + " · " + r.status) + '">' +
      regionOf(r.region).flag + " " + esc(r.title) + "</button>").join("");
    const more = list.length > 40 ? '<span class="rv-more">…另有 ' + (list.length - 40) + " 部</span>" : "";
    return '<div class="rv-basis"><div class="rv-basis-h"><b>' + esc(rvBasisName()) + '</b><span>纳入 ' + list.length + ' 部法规、' +
      list.reduce((a, r) => a + (r.articles || []).length, 0) + ' 条条款要点</span></div>' +
      '<div class="rv-chips">' + (chips || '<span class="rv-more">尚未选择任何法规</span>') + more + "</div></div>";
  }

  function rvCustomPicker() {
    const q = rv.q.trim().toLowerCase();
    const pool = q
      ? ALL.filter((r) => r._idx.indexOf(q) >= 0).slice(0, 10)
      : ALL.filter((r) => r.priority === "core").slice(0, 10);
    const opt = pool.map((r) => {
      const on = rv.ids.indexOf(r.id) >= 0;
      return '<button class="rv-opt' + (on ? " on" : "") + '" data-rv-add="' + esc(r.id) + '">' +
        '<span class="t">' + regionOf(r.region).flag + " " + esc(r.title) + '</span><span class="d">' + esc(r.docNo) + '</span></button>';
    }).join("");
    return '<div class="rv-custom">' +
      '<input id="rvSearch" type="search" placeholder="输入关键词检索法规后点击加入（如：临床评价 / 自检 / 召回）" value="' + esc(rv.q) + '" autocomplete="off">' +
      '<div class="rv-opts">' + (opt || '<span class="rv-more">没有匹配的法规</span>') + "</div>" +
      '<div class="rv-custom-acts">' +
      '<button class="act" id="rvAddFav">⭐ 加入我的法规库（' + state.favs.size + ' 部）</button>' +
      '<button class="act" id="rvAddFiltered">➕ 加入当前筛选结果（' + filtered().length + ' 部）</button>' +
      '<button class="act" id="rvClearIds">清空已选</button></div></div>';
  }

  function reviewHTML() {
    if (!reviewOk()) {
      return '<div class="panel empty"><div class="big">⚠️</div><h3>审查规则库未加载</h3><p>请确认 data/review-rules.js 已正确引入。</p></div>';
    }
    const ruleN = REVIEW.coverage.filter((c) => { const t = c.types || []; return !t.length || t.indexOf(rv.docType) >= 0; }).length;
    const typeOpts = REVIEW.docTypes.map((d) => '<option value="' + d.id + '"' + (rv.docType === d.id ? " selected" : "") + ">" + d.icon + " " + esc(d.name) + "</option>").join("");
    const pathOpts = FLOW ? FLOW.pathways.map((p) => '<option value="' + esc(p.id) + '"' + (rv.pathId === p.id ? " selected" : "") + ">" + esc(p.name) + "</option>").join("") : "";
    const sceneOpts = MDR_META.scenes.map((s) => '<option value="' + esc(s.key) + '"' + (rv.scene === s.key ? " selected" : "") + ">" + s.icon + " " + esc(s.name) + "</option>").join("");

    const side = '<aside class="rv-side">' +
      '<div class="panel"><div class="panel-head"><span>① 审查基准</span><span class="en">BASIS</span></div><div class="panel-body">' +
      '<div class="rv-modes">' +
      [["path", "🏁 按注册路径"], ["scene", "🎯 按业务场景"], ["ids", "✋ 自定义范围"], ["all", "📚 全库法规"]]
        .map((m) => '<button class="rv-mode' + (rv.basisMode === m[0] ? " on" : "") + '" data-rv-mode="' + m[0] + '">' + m[1] + "</button>").join("") +
      "</div>" +
      (rv.basisMode === "path" ? '<select id="rvPath" class="rv-sel">' + pathOpts + "</select>" : "") +
      (rv.basisMode === "scene" ? '<select id="rvScene" class="rv-sel">' + sceneOpts + "</select>" : "") +
      (rv.basisMode === "ids" ? rvCustomPicker() : "") +
      rvBasisPicker() +
      "</div></div>" +
      '<div class="panel"><div class="panel-head"><span>② 文档类型与来源</span><span class="en">DOCUMENT</span></div><div class="panel-body">' +
      '<label class="rv-lab">文档类型</label>' +
      '<select id="rvDocType" class="rv-sel">' + typeOpts + "</select>" +
      '<div class="rv-hint">适用 ' + ruleN + ' 条覆盖规则；切换类型会改变应有的章节结构与检查范围。</div>' +
      '<label class="rv-lab">上传文件（.txt / .md / .csv / .json / .docx）</label>' +
      '<input id="rvFile" type="file" accept=".txt,.md,.csv,.json,.docx,.text,text/plain" class="rv-file">' +
      '<label class="rv-lab">或直接粘贴文本</label>' +
      '<textarea id="rvText" class="rv-text" placeholder="粘贴需要审查的文档全文：产品技术要求、风险管理报告、说明书、临床评价报告、体系文件、整改回复函…">' + esc(rv.text) + "</textarea>" +
      '<div class="rv-meta"><span id="rvCount">' + rv.text.length + " 字</span>" +
      '<button class="chip-link" id="rvClear">清空</button></div>' +
      '<label class="rv-lab">载入内置示例（含刻意设置的缺陷）</label>' +
      '<div class="rv-samples">' + REVIEW.sampleDocs.map((s) => '<button class="act" data-rv-sample="' + esc(s.id) + '">📄 ' + esc(s.name.replace("示例 · ", "")) + "</button>").join("") + "</div>" +
      '<button class="act primary rv-run" id="rvRun">🔍 开始本地审查</button>' +
      '<div class="rv-hint">审查在浏览器本地完成，不联网、不上传文档内容。</div>' +
      "</div></div></aside>";

    return '<div class="rv">' +
      '<section class="rv-hero"><div class="fh-tag">DOCUMENT REVIEW · 本地审查引擎</div>' +
      "<h1>医疗器械文档审查工作台</h1>" +
      "<p>选择审查基准（纳入哪些法规作为依据），提交待审查文档，由本地规则引擎逐项初筛结构完整性、要素覆盖、表述规范性、术语一致性与时限口径，输出可分级、可溯源、可导出的问题清单与整改计划。</p>" +
      '<div class="rv-stats">' +
      '<div><span class="n">' + REVIEW.coverage.length + '</span><span class="l">覆盖规则</span></div>' +
      '<div><span class="n">' + REVIEW.patterns.length + '</span><span class="l">规范检查项</span></div>' +
      '<div><span class="n">' + REVIEW.terms.length + '</span><span class="l">术语一致性项</span></div>' +
      '<div><span class="n">' + REVIEW.deadlines.length + '</span><span class="l">时限口径组</span></div>' +
      "</div>" +
      '<div class="fh-notice">⚠ ' + esc(REVIEW.notice) + "</div></section>" +
      '<div class="rv-grid">' + side + '<div class="rv-main">' + rvResultHTML() + "</div></div></div>";
  }

  /* 审查问题 → 全文层定位 / 集市服务的辅助取值 */
  function rvIssueRegId(i) { return (i && i.basis && i.basis.length) ? i.basis[0] : null; }
  function rvIssueKeyword(i) {
    const e = (i && i.evidence && i.evidence.length) ? i.evidence[0] : null;
    return e ? String(e.text).replace(/\s+/g, "").slice(0, 24) : "";
  }

  function rvResultHTML() {
    if (!rv.result) {
      return '<div class="panel empty rv-empty"><div class="big">🔍</div><h3>等待提交待审查文档</h3>' +
        '<p>在左侧选定审查基准与文档类型，粘贴文本或上传文件后点击「开始本地审查」。<br>也可以直接载入内置示例，观察引擎对刻意缺陷的检出效果。</p>' +
        '<div class="rv-flow-hint">审查流程：选择基准 → 提交文档 → 本地初筛 → 分级问题清单 → 导出报告与整改计划</div></div>';
    }
    const R = rv.result;
    const lvs = [["all", "全部 " + R.issues.length], ["高", R.stats["高"] || 0], ["中", R.stats["中"] || 0], ["低", R.stats["低"] || 0]]
      .map((x) => '<button class="rv-lv' + (rv.level === x[0] ? " on" : "") + '" data-rv-level="' + x[0] + '">' + x[1] + "</button>").join("");
    const shown = R.issues.filter((i) => rv.level === "all" || i.level === rv.level);
    const issuesHTML = shown.length
      ? shown.map((i) => {
        const c = i.level === "高" ? "hi" : i.level === "中" ? "md" : "lo";
        return '<div class="rv-issue ' + c + '">' +
          '<div class="rv-issue-h"><span class="lv ' + c + '">' + i.level + '</span>' +
          '<span class="dm">' + esc(dimName(i.dim)) + "</span>" +
          "<b>" + esc(i.name) + "</b></div>" +
          '<div class="rv-issue-d">' + esc(i.detail) + "</div>" +
          (i.evidence && i.evidence.length ? '<div class="rv-evi">命中位置：' + i.evidence.map((e) => "第 " + e.pos + " 行「" + esc(e.text) + "」").join("　·　") + "</div>" : "") +
          '<div class="rv-issue-f"><i>整改建议</i>' + esc(i.fix) + "</div>" +
          (i.cite ? '<div class="rv-cite">依据：' + esc(i.cite) + "</div>" : "") +
          basisRow(i.basis) +
          '<div class="rv-issue-acts">' +
          ((FT && rvIssueRegId(i)) ? '<button class="act" data-ft-jump="' + esc(rvIssueRegId(i)) + '" data-ft-q="' + esc(rvIssueKeyword(i)) + '">📖 查全文依据</button>' : "") +
          '<button class="act" data-mk-for-doc="' + esc(rv.docType) + '" data-mk-dim="' + esc(i.dim) + '">🏪 找服务商解决</button>' +
          "</div></div>";
      }).join("")
      : '<div class="panel empty"><div class="big">✅</div><h3>该级别下没有问题项</h3><p>切换级别查看其他问题。</p></div>';

    const dimBars = RV_DIM_KEYS.map((k) => {
      const n = R.dims[k] || 0;
      const mx = Math.max(1, Math.max.apply(null, RV_DIM_KEYS.map((x) => R.dims[x] || 0)));
      return '<div class="rv-dim"><span class="nm">' + esc(dimName(k)) + '</span><span class="bar"><i style="width:' + Math.round(n / mx * 100) + '%"></i></span><b>' + n + "</b></div>";
    }).join("");

    const coveredHTML = R.covered.length
      ? '<div class="rv-covered' + (rv.showCovered ? " open" : "") + '" id="rvCovered"><button class="sec-h" id="rvCoverToggle">✅ 已满足的要求（' + R.covered.length + ' 项）' +
        '<span class="hint">点击展开，可作为符合性证据线索</span></button><div class="rv-covered-body">' +
        R.covered.map((c) => '<div class="rv-cv"><span class="dm">' + esc(dimName(c.dim)) + "</span>" + esc(c.name) +
          (c.hit ? '<em>命中：' + esc(c.hit) + "</em>" : "") + "</div>").join("") + "</div></div>"
      : "";

    return '<div class="rv-report">' +
      '<div class="panel rv-score">' +
      '<div class="rv-score-n"><span class="v">' + R.score + '</span><span class="u">/ 100</span><div class="g">合规成熟度：<b>' + R.grade + "</b></div></div>" +
      '<div class="rv-score-s">' +
      '<div class="ln"><span>文档</span><b>' + esc(R.doc.name) + "</b></div>" +
      '<div class="ln"><span>字数 / 行数</span><b>' + R.doc.chars + " 字 / " + R.doc.lines + " 行</b></div>" +
      '<div class="ln"><span>文档类型</span><b>' + esc(R.docTypeName) + "</b></div>" +
      '<div class="ln"><span>审查基准</span><b>' + esc(rvBasisName()) + "（" + R.basisCount + " 部法规）</b></div>" +
      '<div class="ln"><span>要素覆盖率</span><b>' + R.cv.hit + " / " + R.cv.total + "（" + R.cv.rate + '%）</b></div>' +
      '<div class="ln"><span>问题分布</span><b class="hi">高 ' + (R.stats["高"] || 0) + '</b><b class="md">中 ' + (R.stats["中"] || 0) + '</b><b class="lo">低 ' + (R.stats["低"] || 0) + "</b></div>" +
      '<div class="ln"><span>生成时间</span><b>' + esc(R.at) + "</b></div>" +
      "</div></div>" +
      '<div class="panel rv-dims"><div class="rv-sec-t">问题维度分布</div>' + dimBars + "</div>" +
      '<div class="rv-acts">' +
      '<button class="act primary" data-rv-export="report">📘 导出审查报告（Markdown）</button>' +
      '<button class="act" data-rv-export="csv">📊 导出问题清单（CSV · 可回填整改）</button>' +
      '<button class="act" data-rv-export="plan">📋 导出整改计划表（Markdown）</button>' +
      '<button class="act accent" data-rv-export="prompt">🤖 生成深度审查提示词（带入文档全文）</button>' +
      "</div>" +
      '<div class="rv-sec"><div class="rv-sec-h"><h3>问题清单</h3><div class="rv-lvs">' + lvs + "</div></div>" +
      '<div class="rv-issues">' + issuesHTML + "</div></div>" +
      coveredHTML +
      '<div class="rv-disclaim">⚠ 本报告由本地规则引擎自动生成，属机器初筛结果，可能存在误报与漏报；问题定位与法规比对仍须由具备资质的 RA/QA 人员复核。所有判定请以官方公布文本与监管机构最新口径为准。</div>' +
      "</div>";
  }

  /* ---------- 事件绑定 ---------- */
  function bindReview() {
    const sync = () => { const ta = $("#rvText"); if (ta) rv.text = ta.value; };
    $$("[data-rv-mode]").forEach((b) => b.addEventListener("click", () => { sync(); rv.basisMode = b.getAttribute("data-rv-mode"); render(); }));
    const p = $("#rvPath"); if (p) p.addEventListener("change", () => { sync(); rv.pathId = p.value; render(); });
    const sc = $("#rvScene"); if (sc) sc.addEventListener("change", () => { sync(); rv.scene = sc.value; render(); });
    const dt = $("#rvDocType"); if (dt) dt.addEventListener("change", () => { sync(); rv.docType = dt.value; rv.result = null; render(); });
    const ta = $("#rvText");
    if (ta) ta.addEventListener("input", debounce(() => { rv.text = ta.value; const c = $("#rvCount"); if (c) c.textContent = rv.text.length + " 字"; }, 160));
    const cl = $("#rvClear"); if (cl) cl.addEventListener("click", () => { rv.text = ""; rv.fileName = ""; rv.result = null; render(); });
    $$("[data-rv-sample]").forEach((b) => b.addEventListener("click", () => {
      const s = REVIEW.sampleDocs.find((x) => x.id === b.getAttribute("data-rv-sample"));
      if (!s) return;
      rv.text = s.text; rv.fileName = s.name; rv.docType = s.type || "all"; rv.result = null;
      render();
      toast("已载入示例：" + s.name);
    }));
    const q = $("#rvSearch");
    if (q) q.addEventListener("input", debounce(() => { sync(); rv.q = q.value; render(); const el = $("#rvSearch"); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 240));
    $$("[data-rv-add]").forEach((b) => b.addEventListener("click", () => {
      sync();
      const id = b.getAttribute("data-rv-add");
      const i = rv.ids.indexOf(id);
      if (i < 0) rv.ids.push(id); else rv.ids.splice(i, 1);
      render();
    }));
    const af = $("#rvAddFav"); if (af) af.addEventListener("click", () => { sync(); state.favs.forEach((id) => { if (rv.ids.indexOf(id) < 0) rv.ids.push(id); }); rv.ids = rv.ids.filter((id) => BY_ID[id]); render(); });
    const afl = $("#rvAddFiltered"); if (afl) afl.addEventListener("click", () => { sync(); filtered().forEach((r) => { if (rv.ids.indexOf(r.id) < 0) rv.ids.push(r.id); }); render(); });
    const ci = $("#rvClearIds"); if (ci) ci.addEventListener("click", () => { sync(); rv.ids = []; render(); });
    $$("[data-rv-level]").forEach((b) => b.addEventListener("click", () => { sync(); rv.level = b.getAttribute("data-rv-level"); render(); }));
    const ct = $("#rvCoverToggle"); if (ct) ct.addEventListener("click", () => { sync(); rv.showCovered = !rv.showCovered; render(); });
    const run = $("#rvRun"); if (run) run.addEventListener("click", rvRunNow);
    const fi = $("#rvFile"); if (fi) fi.addEventListener("change", rvLoadFile);
  }

  function rvRunNow() {
    const ta = $("#rvText");
    const text = ta ? ta.value : rv.text;
    rv.text = text;
    if (!String(text).trim()) return toast("请先粘贴或上传待审查文档");
    if (String(text).trim().length < 60) return toast("文档内容过短（少于 60 字），不足以开展审查");
    const basis = rvBasis();
    if (!basis.length) return toast("当前审查基准下没有纳入任何法规，请更换基准或选择法规");
    rv.result = reviewRun(text, { docType: rv.docType, docName: rv.fileName || "粘贴文本", basisIds: basis.map((r) => r.id) });
    render();
    const el = $(".rv-report");
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
    toast("审查完成：发现 " + rv.result.issues.length + " 项疑点（高 " + (rv.result.stats["高"] || 0) + " / 中 " + (rv.result.stats["中"] || 0) + " / 低 " + (rv.result.stats["低"] || 0) + "）");
  }

  /* ---------- 文档读取（.docx 用浏览器原生解压，零依赖） ---------- */
  function rvReadText(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result == null ? "" : fr.result));
      fr.onerror = () => rej(new Error("读取失败"));
      fr.readAsText(file, "utf-8");
    });
  }
  function rvFromDocxXml(xml) {
    return xml.split(/<\/w:p>/).map((p) => {
      const runs = p.match(/<w:t[^>]*>[\s\S]*?<\/w:t>/g) || [];
      return runs.map((r) => r.replace(/<[^>]+>/g, "")).join("");
    }).join("\n").replace(/\n{3,}/g, "\n\n")
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "&quot;").replace(/&apos;/g, "'").replace(/&amp;/g, "&")
      .trim();
  }
  async function rvDocxText(buf) {
    const u8 = new Uint8Array(buf), dv = new DataView(buf);
    let eocd = -1;
    for (let i = u8.length - 22; i >= 0 && i > u8.length - 66000; i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
    if (eocd < 0) throw new Error("不是有效的 .docx（未找到 ZIP 结构）");
    const cnt = dv.getUint16(eocd + 10, true);
    let off = dv.getUint32(eocd + 16, true), tgt = null;
    for (let i = 0; i < cnt; i++) {
      if (dv.getUint32(off, true) !== 0x02014b50) break;
      const method = dv.getUint16(off + 10, true);
      const csize = dv.getUint32(off + 20, true);
      const nlen = dv.getUint16(off + 28, true), elen = dv.getUint16(off + 30, true), clen = dv.getUint16(off + 32, true);
      const lho = dv.getUint32(off + 42, true);
      const nm = new TextDecoder("utf-8").decode(u8.subarray(off + 46, off + 46 + nlen));
      if (nm === "word/document.xml") { tgt = { method, csize, lho }; break; }
      off += 46 + nlen + elen + clen;
    }
    if (!tgt) throw new Error(".docx 中未找到 word/document.xml");
    const lnlen = dv.getUint16(tgt.lho + 26, true), lelen = dv.getUint16(tgt.lho + 28, true);
    const start = tgt.lho + 30 + lnlen + lelen;
    const data = u8.subarray(start, start + tgt.csize);
    let out = data;
    if (tgt.method !== 0) {
      if (typeof DecompressionStream === "undefined") throw new Error("当前浏览器不支持解压，请改用文本粘贴方式");
      const ds = new DecompressionStream("deflate-raw");
      out = new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(ds)).arrayBuffer());
    }
    return rvFromDocxXml(new TextDecoder("utf-8").decode(out));
  }
  async function rvLoadFile() {
    const f = $("#rvFile") && $("#rvFile").files && $("#rvFile").files[0];
    if (!f) return;
    try {
      let text;
      if (/\.docx$/i.test(f.name)) {
        const buf = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => rej(new Error("读取失败")); fr.readAsArrayBuffer(f); });
        text = await rvDocxText(buf);
      } else {
        text = await rvReadText(f);
      }
      rv.text = text; rv.fileName = f.name; rv.result = null;
      render();
      toast("已载入 " + f.name + "（" + text.length + " 字）");
    } catch (e) {
      toast("载入失败：" + e.message + "；可改用文本粘贴方式");
    }
  }

  /* ---------- 导出 ---------- */
  function rvHeaderMd() {
    const R = rv.result;
    return "> 由「医械法规云 MedReg Hub」文档审查工作台生成 · " + R.at +
      "\n> 数据版本 v" + MDR_META.platform.version + " · 规则库 v" + REVIEW.version + "（核验日期 " + REVIEW.updatedAt + "）\n\n";
  }
  function rvReportMarkdown() {
    const R = rv.result;
    let s = "# 医疗器械文档审查报告\n\n" + rvHeaderMd();
    s += "## 一、审查概况\n\n";
    s += "| 项目 | 内容 |\n| --- | --- |\n";
    s += "| 文档名称 | " + R.doc.name + " |\n";
    s += "| 文档类型 | " + R.docTypeName + " |\n";
    s += "| 文档规模 | " + R.doc.chars + " 字 / " + R.doc.lines + " 行 |\n";
    s += "| 审查基准 | " + rvBasisName() + "（" + R.basisCount + " 部法规） |\n";
    s += "| 合规成熟度评分 | " + R.score + " / 100（" + R.grade + "） |\n";
    s += "| 要素覆盖率 | " + R.cv.hit + " / " + R.cv.total + "（" + R.cv.rate + "%） |\n";
    s += "| 问题分布 | 高 " + (R.stats["高"] || 0) + " · 中 " + (R.stats["中"] || 0) + " · 低 " + (R.stats["低"] || 0) + " |\n\n";

    s += "## 二、审查基准（法规依据清单）\n\n";
    rvBasis().forEach((r, i) => {
      s += (i + 1) + ". " + r.title + "（" + r.docNo + "）· " + r.status + " · 溯源：" + r.officialUrl + "\n";
    });
    s += "\n";

    s += "## 三、问题清单\n\n";
    s += "| 序号 | 风险等级 | 审查维度 | 问题项 | 问题描述 | 法规依据 | 整改建议 |\n";
    s += "| --- | --- | --- | --- | --- | --- | --- |\n";
    R.issues.forEach((i) => {
      s += "| " + i.no + " | " + i.level + " | " + dimName(i.dim) + " | " + i.name + " | " +
        i.detail.replace(/\|/g, "／").replace(/\n/g, " ") + " | " + (basisLine(i.basis) || "见对应法规条款") + " | " +
        i.fix.replace(/\|/g, "／").replace(/\n/g, " ") + " |\n";
    });
    s += "\n### 命中位置明细\n\n";
    R.issues.filter((i) => i.evidence && i.evidence.length).forEach((i) => {
      s += "- **" + i.no + ". " + i.name + "**：" + i.evidence.map((e) => "第 " + e.pos + " 行「" + e.text + "」").join("；") + "\n";
    });

    s += "\n## 四、已满足的要求（符合性证据线索）\n\n";
    if (R.covered.length) R.covered.forEach((c, i) => { s += (i + 1) + ". [" + dimName(c.dim) + "] " + c.name + (c.hit ? "（命中：" + c.hit + "）" : "") + "\n"; });
    else s += "（无）\n";

    s += "\n## 五、结论与建议\n\n";
    s += "- 本次审查在本地规则引擎中命中 " + R.issues.length + " 项疑点，其中高风险 " + (R.stats["高"] || 0) + " 项，建议在提交前优先处理。\n";
    s += "- 合规成熟度评分 " + R.score + "/100（" + R.grade + "），评分按「高 -6 / 中 -3 / 低 -1」扣分，仅用于横向比较与改进跟踪，不代表监管判定。\n";
    s += "- 高风险项通常对应形式审查即会被要求补正的内容（占位符、缺章、法规版本过期、时限错误等），建议建立整改台账逐项闭环。\n\n";

    s += "---\n\n> 本报告由本地规则引擎自动生成，属机器初筛结果，可能存在误报与漏报；问题定位与法规比对须由具备资质的 RA/QA 人员复核。所引条款为平台整理的要点，非官方逐字全文，正式判定请以官方公布文本及监管机构最新口径为准。\n";
    return s;
  }

  function exportReviewReport() {
    if (!rv.result) return toast("请先完成一次审查");
    download("文档审查报告-" + stamp() + ".md", rvReportMarkdown(), "text/markdown");
  }

  function exportIssueCSV() {
    const R = rv.result;
    if (!R) return toast("请先完成一次审查");
    const head = ["序号", "风险等级", "审查维度", "问题项", "问题描述", "命中位置", "法规依据", "整改建议", "责任部门", "计划完成日", "整改状态"];
    const rows = R.issues.map((i) => [i.no, i.level, dimName(i.dim), i.name, i.detail,
      (i.evidence || []).map((e) => "第 " + e.pos + " 行：" + e.text).join("；"),
      (i.basis || []).map((b) => BY_ID[b] ? BY_ID[b].title + "（" + BY_ID[b].docNo + "）" : b).join("；"),
      i.fix, "", "", "待整改"]);
    if (!rows.length) rows.push(["", "", "", "", "本次审查未发现问题项", "", "", "", "", "", ""]);
    const csv = [head].concat(rows).map((r) => r.map((c) => '"' + String(c == null ? "" : c).replace(/"/g, '""') + '"').join(",")).join("\r\n");
    download("文档审查问题清单-" + stamp() + ".csv", "\uFEFF" + csv, "text/csv");
    toast("已导出问题清单（" + R.issues.length + " 项，含整改回填列）");
  }

  function exportRectifyPlan() {
    const R = rv.result;
    if (!R) return toast("请先完成一次审查");
    const buckets = [["立即整改", "高"], ["限期整改", "中"], ["持续改进", "低"]];
    const own = { structure: "注册/技术", coverage: "注册/技术", normative: "注册/技术", consistency: "注册/技术", deadline: "质量/法规", security: "注册/技术" };
    let s = "# 文档审查整改计划表\n\n" + rvHeaderMd();
    s += "- 文档：" + R.doc.name + "（" + R.docTypeName + "）\n";
    s += "- 依据：《文档审查报告》（合规成熟度 " + R.score + "/100 · " + R.grade + "）\n\n";
    s += "## 整改优先级分组\n\n";
    buckets.forEach(([name, lv]) => {
      const list = R.issues.filter((i) => i.level === lv);
      s += "### " + name + "（" + list.length + " 项）\n\n";
      if (!list.length) { s += "（无）\n\n"; return; }
      s += "| 序号 | 问题项 | 审查维度 | 建议责任部门 | 法规依据 | 整改措施 | 计划完成日 | 验证方式 | 状态 |\n";
      s += "| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n";
      list.forEach((i) => {
        s += "| " + i.no + " | " + i.name + " | " + dimName(i.dim) + " | " + (own[i.dim] || "注册/技术") + " | " +
          (basisLine(i.basis) || "—") + " | " + i.fix.replace(/\|/g, "／").replace(/\n/g, " ") + " |  | 文件复核 + 版本比对 | 待整改 |\n";
      });
      s += "\n";
    });
    s += "## 跟踪要求\n\n";
    s += "- 高风险项应在下次提交前完成整改并留存证据；中风险项按项目节点限期完成；低风险项纳入文本规范化持续改进。\n";
    s += "- 每项整改完成后，应当在「验证方式」列记录复核结论与证据文件编号，并回到本工作台对整改后版本重新审查比对。\n";
    s += "- 评分变化可用于跟踪整改进展：建议整改后再跑一次本审查，比较问题分布与评分。\n\n";
    s += "---\n\n> 本计划表由「医械法规云」自动生成，问题项属机器初筛结果，须经 RA/QA 人员复核确认后再行派发。\n";
    download("文档审查整改计划表-" + stamp() + ".md", s, "text/markdown");
    toast("已生成整改计划表（" + R.issues.length + " 项，按优先级分组）");
  }

  function rvPromptMarkdown() {
    const R = rv.result;
    const basis = rvBasis();
    const kw = "待审查文档类型：" + (R ? R.docTypeName : rv.docType) + "；本地预审查已识别 " + (R ? R.issues.length : 0) + " 项疑点，请在报告中逐项确认或排除";
    let s = buildPrompt(basis, kw);
    const ph = "【请在此处粘贴需要审查的文档全文，例如：产品技术要求 / 风险管理报告 / 说明书 / 注册申报资料 / 体系文件 / 供应商审核报告】";
    const doc = rv.text.length > 14000 ? rv.text.slice(0, 14000) + "\n\n…（文档共 " + rv.text.length + " 字，此处截断，剩余内容请自行补齐）" : rv.text;
    if (s.indexOf(ph) >= 0) s = s.replace(ph, doc);
    else s += "\n\n## 八、待审查文档全文\n\n```\n" + doc + "\n```\n";
    if (R && R.issues.length) {
      s += "\n## 九、本地预审查疑点清单（请逐项确认或排除）\n\n";
      s += "> 下列疑点由平台本地确定性规则初筛产生，可能存在误报，请结合上下文判断，并在输出中对每一条给出「确认 / 排除 / 需补充信息」的结论。\n\n";
      s += "| 序号 | 风险等级 | 审查项 | 问题描述 | 命中位置 | 法规依据 | 复核结论 |\n| --- | --- | --- | --- | --- | --- | --- |\n";
      R.issues.forEach((i) => {
        s += "| " + i.no + " | " + i.level + " | " + i.name + " | " + i.detail.replace(/\|/g, "／") + " | " +
          ((i.evidence || []).map((e) => "第 " + e.pos + " 行：" + e.text).join("；").replace(/\|/g, "／") || "—") + " | " +
          (basisLine(i.basis) || "—") + " |  |\n";
      });
      s += "\n";
    }
    return s;
  }

  function exportReviewPrompt() {
    if (!rv.text.trim()) return toast("请先提交待审查文档");
    download("文档深度审查提示词-" + stamp() + ".md", rvPromptMarkdown(), "text/markdown");
    toast("已生成深度审查提示词（含文档全文与 " + rvBasis().length + " 部法规依据）");
  }

  /* 供外部调用与自测使用的接口 */
  window.MedRegReview = {
    rules: REVIEW,
    run: (text, opts) => reviewRun(text, opts || {}),
    prompt: () => rvPromptMarkdown(),
    report: () => (rv.result ? rvReportMarkdown() : "")
  };

  /* ============================================================================
   * 申报前自检清单模块：路径驱动 · 三级风险 · 三态标记 · 就绪度评分
   * ==========================================================================*/
  const SC = window.MDR_SELFCHECK || null;
  const scOk = () => !!(SC && Array.isArray(SC.items) && SC.items.length);
  const SC_LV = {}; const SC_STAGE = {};
  if (scOk()) {
    SC.levels.forEach((l) => { SC_LV[l.id] = l; });
    SC.stages.forEach((s) => { SC_STAGE[s.id] = s; });
  }
  const SC_TODO = "todo", SC_DONE = "ok", SC_NA = "na";

  const sc = { pathId: "pw-class2", level: "all", stage: "all", hideDone: false, marks: {}, open: {} };

  function scLoad() {
    try { const o = JSON.parse(window.medregStorage.getItem("medreg.selfcheck.v1") || "{}"); sc.marks = (o && o[sc.pathId]) || {}; }
    catch (e) { sc.marks = {}; }
  }
  function scSave() {
    try {
      const o = JSON.parse(window.medregStorage.getItem("medreg.selfcheck.v1") || "{}");
      o[sc.pathId] = sc.marks;
      o.__last = sc.pathId;
      window.medregStorage.setItem("medreg.selfcheck.v1", JSON.stringify(o));
    } catch (e) {}
  }
  function scReset() { sc.marks = {}; scSave(); }

  const scRule = (pid) => (SC.pathRules || []).filter((x) => x.id === pid)[0] || null;
  const scMode = (pid) => { const r = scRule(pid); return r ? (r.mode || "full") : "full"; };
  const scPathName = (pid) => { const p = FPATH[pid]; return p ? p.name : (scRule(pid) ? scRule(pid).label : pid); };
  const scStateOf = (id) => sc.marks[id] || SC_TODO;
  const scIsOpen = (id) => !!sc.open[id];
  const scDocName = (id) => { const d = REVIEW ? (REVIEW.docTypes || []).filter((x) => x.id === id)[0] : null; return d ? d.name : id; };

  /* 适用范围：paths 为白名单，not 为黑名单；delta 路径只收录显式列出该路径的条目 */
  function scApplies(item, pid) {
    const wl = item.paths || null, bl = item.not || null;
    if (wl && wl.length) return wl.indexOf(pid) >= 0;
    if (scMode(pid) === "delta") return false;
    if (bl && bl.length) return bl.indexOf(pid) < 0;
    return true;
  }
  function scItems(pid) { return scOk() ? SC.items.filter((i) => scApplies(i, pid || sc.pathId)) : []; }

  function scStat(pid) {
    const list = scItems(pid);
    const lv = {}; SC.levels.forEach((l) => { lv[l.id] = { id: l.id, total: 0, ok: 0, na: 0, todo: 0, wTotal: 0, wDone: 0 }; });
    let wTotal = 0, wDone = 0, doneN = 0; const redTodo = [], keyTodo = [];
    list.forEach((i) => {
      const st = scStateOf(i.id), w = SC_LV[i.level].weight, L = lv[i.level];
      L.total++; L.wTotal += w; wTotal += w;
      if (st === SC_DONE) L.ok++; else if (st === SC_NA) L.na++; else { L.todo++; if (i.level === "red") redTodo.push(i); else if (i.level === "key") keyTodo.push(i); }
      if (st !== SC_TODO) { L.wDone += w; wDone += w; doneN++; }
    });
    const rate = wTotal ? Math.round(wDone / wTotal * 100) : 0;
    return { list, lv, total: list.length, doneN, rate, redTodo, keyTodo, wTotal, wDone };
  }

  function scGrade(rate, redTodo) {
    if (redTodo && redTodo.length) return { g: "未就绪", c: "hi", msg: "存在 " + redTodo.length + " 项红线未确认，不建议提交申报" };
    if (rate >= 95) return { g: "可提交申报", c: "ok", msg: "红线全部确认，整体准备充分，可进入申报流程" };
    if (rate >= 80) return { g: "基本就绪", c: "md", msg: "红线已清，仍有部分关键项未确认，建议补齐后再提交" };
    if (rate >= 60) return { g: "存在明显缺口", c: "md", msg: "多项关键项未确认，存在发补甚至不予受理风险" };
    return { g: "尚未具备申报条件", c: "hi", msg: "大部分条目未确认，建议先完成内部准备再启动申报" };
  }

  /* ---------- 渲染：侧栏 ---------- */
  function scPathPicker() {
    if (!FLOW) return "";
    const opts = FLOW.pathways.map((p) => '<option value="' + esc(p.id) + '"' + (sc.pathId === p.id ? " selected" : "") + ">" + esc(p.name) + "</option>").join("");
    const r = scRule(sc.pathId), st = scStat();
    return '<label class="sc-lab">申报路径</label><select id="scPath" class="rv-sel">' + opts + "</select>" +
      (r ? '<div class="sc-pathhint">' + esc(r.hint) + "</div>" : "") +
      '<div class="sc-pathstat"><span>本路径适用自检项</span><b>' + st.total + " 项</b></div>" +
      '<div class="sc-pathstat"><span>其中红线项</span><b class="hi">' + st.lv.red.total + " 项</b></div>";
  }

  function scFilters() {
    const st = scStat();
    const stageChips = [["all", "全部阶段", st.total]].concat(
      SC.stages.map((s) => {
        const n = st.list.filter((i) => i.stage === s.id).length;
        return [s.id, s.icon + " " + s.name, n];
      }).filter((x) => x[2] > 0)
    ).map((x) => '<button class="sc-fchip' + (sc.stage === x[0] ? " on" : "") + '" data-sc-stage="' + x[0] + '">' + x[1] + ' <i>' + x[2] + "</i></button>").join("");
    const lvChips = [["all", "全部等级", st.total]].concat(
      SC.levels.map((l) => [l.id, l.icon + " " + l.name, st.lv[l.id].total])
    ).map((x) => '<button class="sc-fchip' + (sc.level === x[0] ? " on" : "") + '" data-sc-level="' + x[0] + '">' + x[1] + ' <i>' + x[2] + "</i></button>").join("");
    return '<label class="sc-lab">按阶段筛选</label><div class="sc-fchips">' + stageChips + "</div>" +
      '<label class="sc-lab">按风险等级筛选</label><div class="sc-fchips">' + lvChips + "</div>" +
      '<button class="sc-toggle' + (sc.hideDone ? " on" : "") + '" id="scHideDone">' + (sc.hideDone ? "☑" : "☐") + " 只看未确认项</button>" +
      '<button class="act sc-reset" id="scReset">↺ 重置本路径全部标记</button>';
  }

  function scProgress() {
    const st = scStat();
    const g = scGrade(st.rate, st.redTodo);
    const seg = SC.levels.map((l) => {
      const L = st.lv[l.id], n = L.ok + L.na;
      return '<div class="sc-pseg"><span class="nm">' + l.icon + " " + l.name + '</span><span class="bar"><i class="w-' + l.id + '" style="width:' +
        (L.total ? Math.round(n / L.total * 100) : 0) + '%"></i></span><b>' + n + " / " + L.total + "</b></div>";
    }).join("");
    return '<div class="panel sc-prog"><div class="sc-prog-h"><span>就绪度</span><b class="' + g.c + '">' + g.g + "</b></div>" +
      '<div class="sc-prog-n"><span class="v">' + st.rate + '</span><span class="u">%</span></div>' +
      '<div class="sc-prog-msg">' + esc(g.msg) + "</div>" + seg + "</div>";
  }

  /* ---------- 渲染：条目 ---------- */
  function scItemHTML(item) {
    const st = scStateOf(item.id), L = SC_LV[item.level], open = scIsOpen(item.id);
    const marks = [[SC_DONE, "✓ 已满足"], [SC_NA, "— 不适用"], [SC_TODO, "↺ 重置"]].map((m) =>
      '<button class="sc-mk' + (st === m[0] ? " on" : "") + '" data-sc-set="' + m[0] + '" data-sc-id="' + esc(item.id) + '">' + m[1] + "</button>").join("");
    const evi = (item.evidence || []).length
      ? '<div class="sc-block"><i>应备证据</i><ul>' + item.evidence.map((e) => "<li>" + esc(e) + "</li>").join("") + "</ul></div>" : "";
    const pit = item.pitfall ? '<div class="sc-block pit"><i>常见退回 / 发补原因</i><p>' + esc(item.pitfall) + "</p></div>" : "";
    const docs = (item.docs || []).length
      ? '<div class="sc-block"><i>相关文档类型</i><div class="sc-docs">' + item.docs.map((d) =>
        '<button class="sc-doc" data-sc-review="' + esc(d) + '">🔍 ' + esc(scDocName(d)) + "</button>").join("") + "</div></div>" : "";
    const svc = (mkOk() && (item.basis || []).length)
      ? '<div class="sc-block"><i>需要外部支持？</i><div class="sc-docs">' +
        '<button class="sc-doc mk" data-mk-for-reg="' + esc(item.basis[0]) + '">🏪 找服务商承接该事项</button>' +
        "</div></div>" : "";
    return '<article class="sc-item lv-' + item.level + " st-" + st + '">' +
      '<div class="sc-item-h"><span class="sc-lv">' + L.icon + " " + L.name + "</span>" +
      '<b class="sc-title">' + esc(item.title) + "</b>" +
      '<div class="sc-mks">' + marks + "</div></div>" +
      '<div class="sc-ask">' + esc(item.ask) + "</div>" +
      '<button class="sc-more" data-sc-open="' + esc(item.id) + '">' + (open ? "收起判定要点 ▲" : "展开判定要点 · 应备证据 · 法规依据 ▼") + "</button>" +
      (open ? '<div class="sc-body"><div class="sc-block"><i>判定要点</i><p>' + esc(item.detail) + "</p></div>" +
        evi + pit + basisRow(item.basis) + docs + svc +
        '<div class="sc-cite">阶段：' + esc(SC_STAGE[item.stage] ? SC_STAGE[item.stage].name : item.stage) + "　·　条目编号：" + esc(item.id) + "</div></div>" : "") +
      "</article>";
  }

  function scGroupHTML(list) {
    const stages = SC.stages.filter((s) => list.some((i) => i.stage === s.id));
    if (!stages.length) return '<div class="panel empty"><div class="big">🔍</div><h3>当前筛选下没有条目</h3><p>试试切换阶段或风险等级筛选。</p></div>';
    return stages.map((s) => {
      const sub = list.filter((i) => i.stage === s.id);
      const done = sub.filter((i) => scStateOf(i.id) !== SC_TODO).length;
      const redLeft = sub.filter((i) => i.level === "red" && scStateOf(i.id) === SC_TODO).length;
      return '<section class="sc-stage"><div class="sc-stage-h">' +
        '<span class="no">' + s.no + "</span><span class=\"ico\">" + s.icon + "</span>" +
        "<div class=\"tt\"><b>" + esc(s.name) + "</b><span>" + esc(s.desc) + "</span></div>" +
        '<div class="pg"><b>' + done + " / " + sub.length + "</b>" + (redLeft ? '<em class="hi">红线待确认 ' + redLeft + "</em>" : '<em class="ok">红线已清</em>') + "</div></div>" +
        '<div class="sc-list">' + sub.map(scItemHTML).join("") + "</div></section>";
    }).join("");
  }

  /* ---------- 渲染：主视图 ---------- */
  function scResultHTML() {
    const st = scStat();
    const g = scGrade(st.rate, st.redTodo);
    if (!st.total) {
      return '<div class="panel empty"><div class="big">🧭</div><h3>该路径下暂无自检条目</h3><p>请更换申报路径，或确认 data/self-check.js 已正确引入。</p></div>';
    }
    const lvBars = SC.levels.map((l) => {
      const L = st.lv[l.id];
      const w = (n) => (L.total ? Math.round(n / L.total * 100) : 0);
      return '<div class="sc-lvrow"><span class="nm">' + l.icon + " " + l.name + '</span><span class="stk">' +
        '<i class="seg d" style="width:' + w(L.ok) + '%"></i><i class="seg n" style="width:' + w(L.na) + '%"></i><i class="seg t" style="width:' + w(L.todo) + '%"></i></span>' +
        '<b>' + L.ok + " 已满足 · " + L.na + " 不适用 · " + L.todo + " 待确认</b></div>";
    }).join("");

    const alertHTML = st.redTodo.length
      ? '<div class="sc-alert"><b>⛔ ' + st.redTodo.length + " 项红线尚未确认，不建议提交申报</b><ul>" +
        st.redTodo.slice(0, 6).map((i) => "<li>" + esc(i.title) + "</li>").join("") +
        (st.redTodo.length > 6 ? "<li>…另有 " + (st.redTodo.length - 6) + " 项</li>" : "") + "</ul></div>"
      : '<div class="sc-alert ok"><b>✅ 红线项已全部确认</b><p>全部 ' + st.lv.red.total + " 项红线项均已处理，可继续关注关键项落实情况。</p></div>";

    let list = st.list;
    if (sc.level !== "all") list = list.filter((i) => i.level === sc.level);
    if (sc.stage !== "all") list = list.filter((i) => i.stage === sc.stage);
    if (sc.hideDone) list = list.filter((i) => scStateOf(i.id) === SC_TODO);

    const redN = st.lv.red.total, keyN = st.lv.key.total, advN = st.lv.adv.total;

    return '<div class="sc-report">' +
      '<div class="panel sc-score">' +
      '<div class="sc-score-n"><span class="v">' + st.rate + '</span><span class="u">%</span><div class="g ' + g.c + '">申报就绪度：<b>' + g.g + "</b></div></div>" +
      '<div class="sc-score-s">' +
      '<div class="ln"><span>申报路径</span><b>' + esc(scPathName(sc.pathId)) + "</b></div>" +
      '<div class="ln"><span>适用条目</span><b>' + st.total + " 项（红线 " + redN + " / 关键 " + keyN + " / 建议 " + advN + "）</b></div>" +
      '<div class="ln"><span>已处理</span><b>' + st.doneN + " / " + st.total + " 项</b></div>" +
      '<div class="ln"><span>红线待确认</span><b class="' + (st.redTodo.length ? "hi" : "ok") + '">' + st.redTodo.length + " 项</b></div>" +
      '<div class="ln"><span>关键项待确认</span><b class="' + (st.keyTodo.length ? "md" : "ok") + '">' + st.keyTodo.length + " 项</b></div>" +
      '<div class="ln"><span>生成时间</span><b>' + esc(new Date().toLocaleString("zh-CN", { hour12: false })) + "</b></div>" +
      "</div></div>" +
      alertHTML +
      '<div class="panel sc-dims"><div class="rv-sec-t">处理进度分布</div>' + lvBars +
      '<div class="sc-legend"><span><i class="seg d"></i>已满足</span><span><i class="seg n"></i>不适用</span><span><i class="seg t"></i>待确认</span></div></div>' +
      '<div class="rv-acts">' +
      '<button class="act primary" data-sc-export="report">📘 导出自检报告（Markdown）</button>' +
      '<button class="act" data-sc-export="gap">📊 导出缺项清单（CSV · 可回填整改）</button>' +
      '<button class="act" data-sc-export="blank">🖨️ 导出空白自检表（Markdown · 可打印下发）</button>' +
      '<button class="act accent" data-sc-export="json">🗂️ 导出自检结果（JSON · 可回填系统）</button>' +
      "</div>" +
      '<div class="sc-sec"><div class="sc-sec-h"><h3>自检条目（' + list.length + " 项）</h3>" +
      '<span class="hint">逐条点击「已满足 / 不适用」完成确认，标记自动保存在应用的云端存储</span></div>' +
      scGroupHTML(list) + "</div>" +
      '<div class="rv-disclaim">⚠ 本清单由本地规则引擎按选定申报路径自动组装，条目内容为法规要点提炼，不构成官方逐字全文，亦不替代注册审查指导原则、立卷审查要求与监管机构最新口径。标记结果仅保存在应用的云端数据库。自检结论须由具备资质的 RA/QA 人员复核。</div>' +
      "</div>";
  }

  function scSideHTML() {
    return '<aside class="rv-side">' +
      '<div class="panel"><div class="panel-head"><span>① 选择申报路径</span><span class="en">PATHWAY</span></div><div class="panel-body">' +
      scPathPicker() +
      '<button class="act" id="scToFlow" style="margin-top:10px">🏁 查看本路径完整流程与时限</button></div></div>' +
      '<div class="panel"><div class="panel-head"><span>② 筛选与进度</span><span class="en">FILTER</span></div><div class="panel-body">' +
      scProgress() + scFilters() + "</div></div>" +
      "</aside>";
  }

  function selfCheckHTML() {
    if (!scOk()) {
      return '<div class="panel empty"><div class="big">⚠️</div><h3>自检清单未加载</h3><p>请确认 data/self-check.js 已正确引入。</p></div>';
    }
    const st = scStat();
    const redN = st.lv.red.total, keyN = st.lv.key.total, advN = st.lv.adv.total;
    return '<div class="sc">' +
      '<section class="sc-hero"><div class="fh-tag">PRE-SUBMISSION CHECKLIST · 申报前自检</div>' +
      "<h1>医疗器械注册申报前自检清单</h1>" +
      "<p>选定申报路径，引擎自动组装该路径适用的自检条目：从属性界定、分类判定、研究验证、资料编制，到申报受理与上市后准备，逐项确认红线项、关键项与建议项是否已落实，输出申报就绪度评分与缺项清单。</p>" +
      '<div class="rv-stats">' +
      '<div><span class="n">' + st.total + '</span><span class="l">本路径条目</span></div>' +
      '<div><span class="n hi">' + redN + '</span><span class="l">红线项</span></div>' +
      '<div><span class="n md">' + keyN + '</span><span class="l">关键项</span></div>' +
      '<div><span class="n">' + advN + '</span><span class="l">建议项</span></div>' +
      "</div>" +
      '<div class="fh-notice">⚠ ' + esc(SC.notice) + "</div></section>" +
      '<div class="rv-grid">' + scSideHTML() + '<div class="rv-main">' + scResultHTML() + "</div></div></div>";
  }

  /* ---------- 事件绑定 ---------- */
  function bindSelfCheck() {
    const p = $("#scPath");
    if (p) p.addEventListener("change", () => { sc.pathId = p.value; scLoad(); render(); toast("已切换到：" + scPathName(sc.pathId)); });
    $$("[data-sc-stage]").forEach((b) => b.addEventListener("click", () => { sc.stage = b.getAttribute("data-sc-stage"); render(); }));
    $$("[data-sc-level]").forEach((b) => b.addEventListener("click", () => { sc.level = b.getAttribute("data-sc-level"); render(); }));
    $$("[data-sc-open]").forEach((b) => b.addEventListener("click", () => {
      const id = b.getAttribute("data-sc-open");
      sc.open[id] = !sc.open[id]; render();
      const el = document.querySelector('[data-sc-open="' + id + '"]');
      if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    }));
    $$("[data-sc-set]").forEach((b) => b.addEventListener("click", () => {
      const id = b.getAttribute("data-sc-id"), v = b.getAttribute("data-sc-set");
      const cur = scStateOf(id);
      if (v === SC_TODO) delete sc.marks[id];
      else if (cur === v) delete sc.marks[id];
      else sc.marks[id] = v;
      scSave(); render();
      const s = scStat();
      if (s.redTodo.length === 0 && cur === SC_TODO && v === SC_DONE) toast("✅ 红线项已全部确认");
    }));
    const hd = $("#scHideDone"); if (hd) hd.addEventListener("click", () => { sc.hideDone = !sc.hideDone; render(); });
    const rs = $("#scReset"); if (rs) rs.addEventListener("click", () => { scReset(); render(); toast("已重置本路径的全部标记"); });
    const tf = $("#scToFlow"); if (tf) tf.addEventListener("click", () => { flowPath = sc.pathId; state.view = "flow"; syncNav(); render(); });
  }

  function scMark(id, v) { if (v === SC_TODO) delete sc.marks[id]; else sc.marks[id] = v; scSave(); render(); }

  /* ---------- 导出 ---------- */
  function scHeaderMd() {
    return "> 由「医械法规云 MedReg Hub」申报前自检清单生成 · " + new Date().toLocaleString("zh-CN", { hour12: false }) +
      "\n> 数据版本 v" + MDR_META.platform.version + " · 自检清单 v" + SC.version + "（核验日期 " + SC.updatedAt + "）\n\n";
  }
  function scReportMarkdown() {
    const st = scStat(), g = scGrade(st.rate, st.redTodo);
    let s = "# 医疗器械注册申报前自检报告\n\n" + scHeaderMd();
    s += "## 一、自检概况\n\n";
    s += "| 项目 | 内容 |\n| --- | --- |\n";
    s += "| 申报路径 | " + scPathName(sc.pathId) + " |\n";
    s += "| 申报就绪度 | " + st.rate + " %（" + g.g + "） |\n";
    s += "| 适用自检条目 | " + st.total + " 项（红线 " + st.lv.red.total + " / 关键 " + st.lv.key.total + " / 建议 " + st.lv.adv.total + "） |\n";
    s += "| 已处理条目 | " + st.doneN + " / " + st.total + " 项 |\n";
    s += "| 红线项待确认 | " + st.redTodo.length + " 项 |\n";
    s += "| 关键项待确认 | " + st.keyTodo.length + " 项 |\n";
    s += "| 结论 | " + g.msg + " |\n\n";
    s += "## 二、分阶段自检结果\n\n";
    SC.stages.forEach((stage) => {
      const sub = st.list.filter((i) => i.stage === stage.id);
      if (!sub.length) return;
      const done = sub.filter((i) => scStateOf(i.id) !== SC_TODO).length;
      s += "### " + stage.no + " · " + stage.name + "（" + done + " / " + sub.length + " 已处理）\n\n";
      s += "| 状态 | 风险等级 | 自检项 | 自检提问 | 法规依据 |\n| --- | --- | --- | --- | --- |\n";
      sub.forEach((i) => {
        const sv = scStateOf(i.id);
        const mark = sv === SC_DONE ? "已满足" : sv === SC_NA ? "不适用" : "**待确认**";
        const bs = (i.basis || []).map((b) => (BY_ID[b] ? BY_ID[b].docNo || "" : "")).filter(Boolean).join("；");
        s += "| " + mark + " | " + SC_LV[i.level].name + " | " + i.title + " | " + i.ask + " | " + (bs || "—") + " |\n";
      });
      s += "\n";
    });
    if (st.redTodo.length) {
      s += "## 三、红线项待确认清单（提交申报前必须解决）\n\n";
      st.redTodo.forEach((i, n) => {
        s += (n + 1) + ". **" + i.title + "** —— " + i.ask + "\n";
        if (i.pitfall) s += "   - 风险：" + i.pitfall + "\n";
        s += "   - 应备证据：" + (i.evidence || []).join("；") + "\n";
      });
      s += "\n";
    }
    if (st.keyTodo.length) {
      s += "## 四、关键项待确认清单\n\n";
      st.keyTodo.forEach((i, n) => { s += (n + 1) + ". " + i.title + " —— " + i.ask + "\n"; });
      s += "\n";
    }
    s += "## 五、法规依据索引\n\n";
    const bids = [];
    st.list.forEach((i) => (i.basis || []).forEach((b) => { if (BY_ID[b] && bids.indexOf(b) < 0) bids.push(b); }));
    bids.forEach((b) => {
      const r = BY_ID[b];
      s += "- **" + r.title + "**（" + (r.docNo || "") + "，" + regionOf(r.region).name + "，" + r.status + "）" +
        (r.officialUrl ? "　溯源：" + r.officialUrl : "") + "\n";
    });
    s += "\n---\n\n> ⚠ 本报告由本地规则引擎按选定申报路径自动组装，条目内容为法规要点提炼，不构成官方逐字全文，亦不替代注册审查指导原则、立卷审查要求与监管机构最新口径。自检结论须由具备资质的 RA/QA 人员复核确认。\n";
    return s;
  }

  function scBlankMarkdown() {
    const st = scStat();
    let s = "# 医疗器械注册申报前自检表（空白 · 可打印下发）\n\n" + scHeaderMd();
    s += "申报路径：**" + scPathName(sc.pathId) + "**　适用条目：**" + st.total + "** 项　填表人：____________　填表日期：____________\n\n";
    SC.stages.forEach((stage) => {
      const sub = st.list.filter((i) => i.stage === stage.id);
      if (!sub.length) return;
      s += "## " + stage.no + " · " + stage.name + "\n\n";
      s += "| 序号 | 等级 | 自检项 | 自检提问 | 自检结论 | 证据编号 | 责任人 | 完成日期 |\n";
      s += "| --- | --- | --- | --- | --- | --- | --- | --- |\n";
      sub.forEach((i, n) => {
        s += "| " + (n + 1) + " | " + SC_LV[i.level].name + " | " + i.title + " | " + i.ask + " | □已满足 □不适用 □待整改 |  |  |  |\n";
      });
      s += "\n";
    });
    s += "---\n\n> 填表说明：自检结论三选一勾选；判定为「待整改」的须在缺项清单中登记责任人与计划完成日；「不适用」须能说明理由。\n";
    return s;
  }

  function scGapCSV() {
    const st = scStat();
    const rows = [];
    const esc2 = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    rows.push(["序号", "阶段", "风险等级", "自检项", "自检提问", "判定要点", "法规依据", "整改要求", "责任部门", "计划完成日", "整改状态", "验证人"].map(esc2).join(","));
    let n = 0;
    SC.stages.forEach((stage) => {
      st.list.filter((i) => i.stage === stage.id && scStateOf(i.id) === SC_TODO).forEach((i) => {
        n++;
        const bs = (i.basis || []).map((b) => { const r = BY_ID[b]; return r ? r.title + "（" + (r.docNo || "") + "）" : ""; }).filter(Boolean).join("；");
        rows.push([n, stage.name, SC_LV[i.level].name, i.title, i.ask, (i.detail || "").slice(0, 200), bs, i.pitfall || "", "", "", "待整改", ""].map(esc2).join(","));
      });
    });
    return "\ufeff" + rows.join("\r\n") + "\r\n";
  }

  function scJson() {
    const st = scStat();
    return JSON.stringify({
      platform: "MedReg Hub",
      platformVersion: MDR_META.platform.version,
      checklistVersion: SC.version,
      checklistUpdatedAt: SC.updatedAt,
      generatedAt: new Date().toISOString(),
      pathway: { id: sc.pathId, name: scPathName(sc.pathId) },
      readiness: st.rate,
      summary: SC.levels.reduce((a, l) => { a[l.name] = { total: st.lv[l.id].total, ok: st.lv[l.id].ok, na: st.lv[l.id].na, todo: st.lv[l.id].todo }; return a; }, {}),
      items: st.list.map((i) => ({
        id: i.id, stage: i.stage, stageName: SC_STAGE[i.stage] ? SC_STAGE[i.stage].name : i.stage,
        level: i.level, levelName: SC_LV[i.level].name, title: i.title, ask: i.ask,
        status: scStateOf(i.id), basis: i.basis || [],
        basisTitles: (i.basis || []).map((b) => (BY_ID[b] ? BY_ID[b].title : b)),
        docs: i.docs || []
      }))
    }, null, 2);
  }

  function exportSelfCheckReport() { download("申报前自检报告-" + stamp() + ".md", scReportMarkdown(), "text/markdown"); }
  function exportSelfCheckGap() { download("自检缺项清单-" + stamp() + ".csv", scGapCSV(), "text/csv"); }
  function exportSelfCheckBlank() { download("申报前自检表（空白）-" + stamp() + ".md", scBlankMarkdown(), "text/markdown"); }
  function exportSelfCheckJSON() { download("自检结果-" + stamp() + ".json", scJson(), "application/json"); }

  // 供自测取用
  window.MedRegSelfCheck = {
    rules: SC,
    stat: scStat,
    items: scItems,
    grade: scGrade,
    report: scReportMarkdown,
    gap: scGapCSV,
    blank: scBlankMarkdown,
    json: scJson,
    setPath: function (pid) { sc.pathId = pid; scLoad(); return scStat(); },
    mark: function (id, v) { scMark(id, v); },
    state: sc
  };


  /* ============================================================================
   * 模块：法规全文层（window.MDR_FULLTEXT）
   * ----------------------------------------------------------------------------
   * 平台不内嵌、不复制法规原文。本模块提供两件事：
   *   ① 官方全文获取通道（按条目所属地区给出）
   *   ② 本地导入 + 逐条解析：把用户从官方渠道取得的全文解析成条款结构，
   *      与既有「核心要点」做条号对照，供文档审查定位依据。
   * ==========================================================================*/
  const FT = window.MDR_FULLTEXT || null;
  const FT_CH = {};
  const FT_KEY = "medreg.fulltext";
  let ftStore = {};
  const ft = { regId: null, q: "", open: false, input: "", source: "", err: "", hit: null };

  function ftOk() { return !!(FT && FT.channels && FT.channels.length && FT.parse); }
  function ftLoad() {
    if (!FT) return;
    (FT.channels || []).forEach(function (c) { FT_CH[c.id] = c; });
    try {
      const raw = JSON.parse(window.medregStorage.getItem(FT_KEY) || "{}");
      ftStore = (raw && typeof raw === "object" && !Array.isArray(raw)) ? raw : {};
    } catch (e) { ftStore = {}; }
  }
  function ftSave() {
    try { window.medregStorage.setItem(FT_KEY, JSON.stringify(ftStore)); }
    catch (e) { toast("保存结果未确认，请检查连接"); }
  }
  function ftOf(id) { return ftStore[id] || null; }
  function ftImported() { return Object.keys(ftStore).length; }
  function ftArtsTotal() {
    let n = 0;
    Object.keys(ftStore).forEach(function (k) { n += ((ftStore[k] || {}).articles || []).length; });
    return n;
  }
  function ftChannelsOf(r) {
    if (!FT || !r) return [];
    const ids = (FT.byRegion || {})[r.region] || [];
    return ids.map(function (i) { return FT_CH[i]; }).filter(Boolean);
  }
  function ftSize(n) {
    n = Number(n) || 0;
    return n >= 10000 ? (n / 10000).toFixed(1) + " 万字" : n + " 字";
  }

  /* ---------- 逐条解析：纯文本 → { chapters, articles } ---------- */
  function ftParse(text) {
    if (!ftOk()) return { err: "全文层数据未加载" };
    const src = String(text || "").replace(/\r\n?/g, "\n").replace(/^\uFEFF/, "");
    const min = FT.parse.minChars || 60, max = FT.parse.maxChars || 800000;
    if (src.trim().length < min) return { err: "文本过短（至少 " + min + " 字），看起来不像法规全文" };
    if (src.length > max) return { err: "文本超长（上限约 " + Math.round(max / 10000) + " 万字），请分批导入" };
    let reA, reC;
    try { reA = new RegExp(FT.parse.articlePattern); reC = new RegExp(FT.parse.chapterPattern); }
    catch (e) { return { err: "解析规则异常，请检查 fulltext.js 的 parse 配置" }; }
    const chapters = [], articles = [];
    let curCh = null, cur = null;
    src.split("\n").forEach(function (rawLine) {
      const line = String(rawLine).replace(/^[\s#>*·•\-—]+/, "").replace(/\s+$/, "");
      if (!line) return;
      const mcC = line.match(reC);
      if (mcC) {
        curCh = { no: "第" + mcC[1] + mcC[2], title: String(mcC[3] || "").trim() };
        chapters.push(curCh); cur = null; return;
      }
      const mA = line.match(reA);
      if (mA) {
        const tail = String(mA[2] || "").trim();
        cur = { no: "第" + mA[1] + "条", title: "", text: "", ch: curCh ? curCh.no : "", chTitle: curCh ? curCh.title : "" };
        // 条号后紧跟的短句视为条标题；含标点或过长则视为正文起始
        if (tail && tail.length <= 14 && !/[。；;：:，,、]/.test(tail)) cur.title = tail;
        else cur.text = tail;
        articles.push(cur); return;
      }
      if (cur) cur.text = cur.text ? cur.text + "\n" + line : line;
    });
    if (!articles.length) return { err: "未识别到「第X条」形式的条款，请确认导入的是法规全文，而不是摘要或要点" };
    return { chapters: chapters, articles: articles };
  }

  function ftImport(regId, text, source) {
    const p = ftParse(text);
    if (p.err) return p;
    ftStore[regId] = {
      source: String(source || "手动导入").slice(0, 60),
      at: new Date().toISOString().slice(0, 16).replace("T", " "),
      chars: String(text).length,
      chapters: p.chapters,
      articles: p.articles
    };
    ftSave();
    return { ok: true, n: p.articles.length, m: p.chapters.length };
  }
  function ftClear(regId) { delete ftStore[regId]; ftSave(); }

  /* 要点对照：把平台已有的「核心条款要点」按条号挂到导入的原文条款上 */
  function ftPoints(regId, no) {
    const r = BY_ID[regId];
    if (!r) return [];
    return (r.articles || []).filter(function (a) { return String(a.no) === String(no); });
  }
  /* 全文内检索：返回命中条款的序号集合 */
  function ftSearch(store, q) {
    const terms = String(q || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length || !store) return null;
    const hit = {};
    (store.articles || []).forEach(function (a, i) {
      const hay = (a.no + " " + a.title + " " + a.text).toLowerCase();
      if (terms.every(function (t) { return hay.indexOf(t) >= 0; })) hit[i] = 1;
    });
    return hit;
  }
  function ftExportMd(regId) {
    const r = BY_ID[regId], s = ftOf(regId);
    if (!r || !s) return "";
    let md = "# " + r.title + " · 全文导入件\n\n";
    md += "> 本文件由「医械法规云 MedReg Hub」全文层导出，内容为使用者自官方渠道取得的文本，经本地解析后保存在应用文件中。\n";
    md += "> 导入来源：" + s.source + " · 导入时间：" + s.at + " · 规模：" + ftSize(s.chars) + " · 解析条款 " + s.articles.length + " 条\n";
    md += "> 权威文本请以发布机关公布版本为准；官方溯源入口：" + r.officialUrl + "\n\n";
    let lastCh = "";
    s.articles.forEach(function (a) {
      if (a.ch && a.ch !== lastCh) { md += "## " + a.ch + (a.chTitle ? "　" + a.chTitle : "") + "\n\n"; lastCh = a.ch; }
      md += "**" + a.no + (a.title ? "　" + a.title : "") + "**\n\n" + (a.text || "（无正文）") + "\n\n";
    });
    return md;
  }
  function ftBookMd() {
    const ids = Object.keys(ftStore);
    if (!ids.length) return "";
    let md = "# 法规全文导入册\n\n> 由「医械法规云 MedReg Hub」全文层导出 · " + new Date().toLocaleString("zh-CN", { hour12: false }) +
      "\n> 共 " + ids.length + " 部法规 / " + ftArtsTotal() + " 条条款。内容为使用者自官方渠道取得，权威文本以发布机关公布版本为准。\n\n---\n\n";
    ids.forEach(function (id) { md += ftExportMd(id) + "\n---\n\n"; });
    return md;
  }

  /* ============================================================================
   * 模块：B2B 法规服务集市（window.MDR_MARKET）
   * ----------------------------------------------------------------------------
   * 把法规知识变成可被供需双方对接的服务商品。平台不经手交易与支付。
   * ==========================================================================*/
  const MK = window.MDR_MARKET || null;
  const MK_V = {}, MK_CAT = {}, MK_TYPE = {};
  const MK_CART_KEY = "medreg.cart";
  let mkCart = [];
  const mk = {
    cat: "all", type: "all", region: "all", price: "all", q: "", sort: "default",
    page: "list", offerId: null, vendorId: null, limit: 9, notice: true, remark: {}, reg: null
  };

  function mkOk() { return !!(MK && MK.offers && MK.offers.length); }
  function mkLoad() {
    if (!MK) return;
    (MK.vendors || []).forEach(function (v) { MK_V[v.id] = v; });
    (MK.offerCats || []).forEach(function (c) { MK_CAT[c.id] = c; });
    (MK.vendorTypes || []).forEach(function (t) { MK_TYPE[t.id] = t; });
    try {
      const raw = JSON.parse(window.medregStorage.getItem(MK_CART_KEY) || "[]");
      mkCart = Array.isArray(raw) ? raw.filter(function (x) { return x && x.offerId && MK.offers.some(function (o) { return o.id === x.offerId; }); }) : [];
    } catch (e) { mkCart = []; }
  }
  function mkSaveCart() { try { window.medregStorage.setItem(MK_CART_KEY, JSON.stringify(mkCart)); } catch (e) {} }
  function mkVendorOf(oid) { const o = mkOfferOf(oid); return o ? (MK_V[o.vendorId] || null) : null; }
  function mkOfferOf(oid) {
    if (!mkOk()) return null;
    for (let i = 0; i < MK.offers.length; i++) if (MK.offers[i].id === oid) return MK.offers[i];
    return null;
  }
  function mkCatOf(id) { return MK_CAT[id] || null; }
  function mkCatName(id) { const c = MK_CAT[id]; return c ? c.name : id; }
  function mkTypeName(id) { const t = MK_TYPE[id]; return t ? t.name : id; }
  function mkPriceLabel(o) { return o && o.price ? (o.price.label || o.price.mode) : "—"; }
  function mkPriceRank(o) {
    const p = o && o.price ? o.price : {};
    if (p.mode === "free") return 0;
    if (typeof p.amount === "number") return p.amount;
    return 9e9; // 按项目报价：无参考价，排序时置后
  }
  function mkRegsOf(o) { return (o && o.covers ? o.covers : []).map(function (c) { return BY_ID[c]; }).filter(Boolean); }
  function mkOffersByReg(regId) {
    if (!mkOk()) return [];
    return MK.offers.filter(function (o) { return (o.covers || []).indexOf(regId) >= 0; })
      .sort(function (a, b) { return (b.rating * 20 + b.deals / 10) - (a.rating * 20 + a.deals / 10); });
  }
  function mkOffersByVendor(vid) {
    if (!mkOk()) return [];
    return MK.offers.filter(function (o) { return o.vendorId === vid; });
  }
  function mkFiltered() {
    if (!mkOk()) return [];
    const terms = mk.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let list = MK.offers.slice();
    if (mk.cat !== "all") list = list.filter(function (o) { return o.cat === mk.cat; });
    if (mk.type !== "all") list = list.filter(function (o) { const v = MK_V[o.vendorId]; return v && v.type === mk.type; });
    if (mk.region !== "all") list = list.filter(function (o) { const v = MK_V[o.vendorId]; return v && v.region === mk.region; });
    if (mk.price !== "all") list = list.filter(function (o) { return o.price && o.price.mode === mk.price; });
    if (mk.reg) list = list.filter(function (o) { return (o.covers || []).indexOf(mk.reg) >= 0; });
    if (terms.length) list = list.filter(function (o) {
      const v = MK_V[o.vendorId] || {};
      const hay = [o.title, o.summary, o.detail, (o.tags || []).join(" "), (o.deliverables || []).join(" "),
        v.name, v.short, mkTypeName(v.type), mkCatName(o.cat),
        mkRegsOf(o).map(function (r) { return r.title + " " + r.docNo; }).join(" ")]
        .join(" \u0001 ").toLowerCase();
      return terms.every(function (t) { return hay.indexOf(t) >= 0; });
    });
    const s = mk.sort;
    list.sort(function (a, b) {
      if (s === "hot") return b.deals - a.deals;
      if (s === "good") return b.rating - a.rating || b.reviews - a.reviews;
      if (s === "price") return mkPriceRank(a) - mkPriceRank(b);
      if (s === "cover") return mkRegsOf(b).length - mkRegsOf(a).length;
      if (s === "new") return (MK_V[b.vendorId].since || "0").localeCompare(MK_V[a.vendorId].since || "0");
      return (b.rating * 20 + b.deals / 10) - (a.rating * 20 + a.deals / 10);
    });
    return list;
  }
  /* 榜单：热销 / 口碑 / 响应 / 新晋 */
  function mkBoard(id) {
    if (!mkOk()) return [];
    if (id === "hot") return MK.offers.slice().sort(function (a, b) { return b.deals - a.deals; }).slice(0, 5).map(function (o) { return { kind: "offer", o: o, val: o.deals + " 单" }; });
    if (id === "good") return MK.offers.filter(function (o) { return o.reviews >= 20; }).sort(function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; }).slice(0, 5).map(function (o) { return { kind: "offer", o: o, val: o.rating.toFixed(1) + " 分" }; });
    if (id === "fast") return MK.vendors.slice().sort(function (a, b) { return a.respMins - b.respMins; }).slice(0, 5).map(function (v) { return { kind: "vendor", v: v, val: v.respMins + " 分钟" }; });
    return MK.vendors.slice().sort(function (a, b) { return String(b.since).localeCompare(String(a.since)); }).slice(0, 5).map(function (v) { return { kind: "vendor", v: v, val: "入驻 " + v.since }; });
  }

  /* ---------- 采购清单（应用数据库存储） ---------- */
  function mkCartHas(oid) { return mkCart.some(function (x) { return x.offerId === oid; }); }
  function mkCartToggle(oid) {
    if (mkCartHas(oid)) {
      mkCart = mkCart.filter(function (x) { return x.offerId !== oid; });
      mkSaveCart(); return false;
    }
    mkCart.push({ offerId: oid, at: new Date().toISOString().slice(0, 10) });
    mkSaveCart(); return true;
  }
  function mkCartOffers() {
    return mkCart.map(function (x) { return { entry: x, offer: mkOfferOf(x.offerId), vendor: mkVendorOf(x.offerId) }; })
      .filter(function (x) { return !!x.offer; });
  }
  function mkCartRegs() {
    const ids = {};
    mkCartOffers().forEach(function (x) { (x.offer.covers || []).forEach(function (c) { ids[c] = (ids[c] || 0) + 1; }); });
    return Object.keys(ids);
  }
  function mkCartMd() {
    const rows = mkCartOffers();
    if (!rows.length) return "";
    let s = "# 医疗器械法规服务询价单\n\n> 由「医械法规云 MedReg Hub」法规集市生成 · " +
      new Date().toLocaleString("zh-CN", { hour12: false }) +
      "\n> 本单据仅为需求整理，不构成订单。集市不经手交易与支付，签约与结算在供需双方之间完成。\n\n";
    s += "## 一、需求清单（共 " + rows.length + " 项）\n\n";
    rows.forEach(function (x, i) {
      s += "### " + (i + 1) + ". " + x.offer.title + "\n\n";
      s += "- 服务类目：" + mkCatName(x.offer.cat) + "\n";
      s += "- 发布方：" + (x.vendor ? x.vendor.name + "（" + mkTypeName(x.vendor.type) + " · " + x.vendor.city + "）" : "—") + "\n";
      s += "- 价格口径：" + mkPriceLabel(x.offer) + "\n";
      s += "- 承诺周期：" + (x.offer.days || "—") + "\n";
      s += "- 交付物：" + (x.offer.deliverables || []).join("；") + "\n";
      s += "- 法规覆盖：" + mkRegsOf(x.offer).map(function (r) { return r.title + "（" + r.docNo + "）"; }).join("；") + "\n";
      s += "- 发布方联系方式：需线下确认（平台不提供交易通道）\n\n";
    });
    const regs = mkCartRegs();
    s += "## 二、涉及法规（共 " + regs.length + " 部）\n\n";
    s += regs.map(function (id) { const r = BY_ID[id]; return r ? "- " + r.title + "（" + r.docNo + "）· 溯源：" + r.officialUrl : ""; }).filter(Boolean).join("\n") + "\n\n";
    s += "## 三、平台声明\n\n" + (MK ? MK.notice : "") + "\n";
    return s;
  }
  function mkCartCSV() {
    const rows = mkCartOffers();
    const head = ["序号", "服务类目", "服务包", "发布方", "发布方类型", "所在城市", "价格口径", "承诺周期", "交付物", "覆盖法规", "加入日期"];
    const body = rows.map(function (x, i) {
      return [i + 1, mkCatName(x.offer.cat), x.offer.title,
        x.vendor ? x.vendor.name : "", x.vendor ? mkTypeName(x.vendor.type) : "", x.vendor ? x.vendor.city : "",
        mkPriceLabel(x.offer), x.offer.days || "", (x.offer.deliverables || []).join("；"),
        mkRegsOf(x.offer).map(function (r) { return r.title; }).join("；"), x.entry.at || ""];
    });
    const esc2 = function (v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; };
    return head.map(esc2).join(",") + "\n" + body.map(function (r) { return r.map(esc2).join(","); }).join("\n");
  }

  /* ---------- 审查问题 / 自检缺项 → 服务类目映射 ---------- */
  const RV_DOC_CAT = {
    tech: "reg-agent", rm: "clin-eval", ce: "clin-eval", sw: "sw-ai", ai: "sw-ai",
    ifu: "reg-agent", qms: "qms-gmp", pm: "post-market", ivd: "reg-test"
  };
  const RV_DIM_CAT = {
    structure: "reg-agent", coverage: "reg-agent", normative: "reg-agent",
    consistency: "data-tool", deadline: "post-market", security: "sw-ai"
  };
  function mkCatForDoc(docType, dim) {
    if (RV_DOC_CAT[docType]) return RV_DOC_CAT[docType];
    if (RV_DIM_CAT[dim]) return RV_DIM_CAT[dim];
    return "reg-agent";
  }

  /* ============================================================================
   * 集市：渲染
   * ==========================================================================*/
  function mkHero() {
    const covered = (function () {
      const s = {};
      MK.offers.forEach(function (o) { (o.covers || []).forEach(function (c) { s[c] = 1; }); });
      return Object.keys(s).length;
    })();
    return '<section class="mk-hero"><div class="fh-tag">B2B REGULATORY SERVICE MARKETPLACE · 法规服务集市</div>' +
      "<h1>医疗器械法规服务集市</h1>" +
      "<p>把法规知识变成可对接的服务商品。检测检验、注册申报、临床评价、体系生产、软件与 AI、海外准入、法规数据、上市后警戒——八大业态的发布方在此上架服务包，每个服务包都标明覆盖的法规条目、交付物清单、价格口径与承诺周期。需求方可按法规条目、业务场景或文档审查问题直接找到服务。</p>" +
      '<div class="rv-stats">' +
      '<div><span class="n">' + MK.offers.length + '</span><span class="l">在架服务包</span></div>' +
      '<div><span class="n">' + MK.vendors.length + '</span><span class="l">发布方铺位</span></div>' +
      '<div><span class="n">' + MK.offerCats.length + '</span><span class="l">服务类目</span></div>' +
      '<div><span class="n">' + covered + '</span><span class="l">覆盖法规</span></div>' +
      "</div>" +
      (mk.notice ? '<div class="fh-notice">⚠ ' + esc(MK.notice) + "</div>" : "") +
      "</section>";
  }

  function mkCats() {
    const items = [{ id: "all", name: "全部服务", icon: "🏪" }].concat(MK.offerCats);
    return '<nav class="mk-cats">' + items.map(function (c) {
      const n = c.id === "all" ? MK.offers.length : MK.offers.filter(function (o) { return o.cat === c.id; }).length;
      return '<button class="mk-cat' + (mk.cat === c.id ? " on" : "") + '" data-mk-cat="' + esc(c.id) + '">' +
        '<span class="i">' + (c.icon || "📦") + '</span><span class="t">' + esc(c.name) + '</span><span class="n">' + n + "</span></button>";
    }).join("") + "</nav>";
  }

  function mkFilters() {
    const cnt = function (fn) { return MK.offers.filter(fn).length; };
    const grp = function (title, key, opts) {
      return '<div class="mk-fg"><div class="mk-fg-h">' + title + '</div><div class="mk-fg-b">' +
        opts.map(function (o) {
          return '<button class="mk-chip' + (mk[key] === o.id ? " on" : "") + '" data-mk-set="' + key + "|" + esc(o.id) + '">' +
            esc(o.name) + (o.n != null ? "<i>" + o.n + "</i>" : "") + "</button>";
        }).join("") + "</div></div>";
    };
    const regions = Object.keys(MK.offers.reduce(function (a, o) {
      const v = MK_V[o.vendorId]; if (v && v.region) a[v.region] = 1; return a;
    }, {}));
    return grp("发布方业态", "type", [{ id: "all", name: "全部", n: MK.offers.length }].concat(
      MK.vendorTypes.map(function (t) {
        return { id: t.id, name: (t.icon || "") + " " + t.name, n: cnt(function (o) { return (MK_V[o.vendorId] || {}).type === t.id; }) };
      }))) +
      grp("发布方地区", "region", [{ id: "all", name: "全部", n: MK.offers.length }].concat(
        regions.map(function (rc) {
          const g = regionOf(rc);
          return { id: rc, name: g.flag + " " + g.name, n: cnt(function (o) { return (MK_V[o.vendorId] || {}).region === rc; }) };
        }))) +
      grp("价格口径", "price", [{ id: "all", name: "全部", n: MK.offers.length },
        { id: "free", name: "免费", n: cnt(function (o) { return o.price.mode === "free"; }) },
        { id: "from", name: "起价", n: cnt(function (o) { return o.price.mode === "from"; }) },
        { id: "package", name: "套餐价", n: cnt(function (o) { return o.price.mode === "package"; }) },
        { id: "quote", name: "按项目报价", n: cnt(function (o) { return o.price.mode === "quote"; }) }]) +
      grp("排序", "sort", [{ id: "default", name: "综合排序" }, { id: "hot", name: "成交最多" },
        { id: "good", name: "评分最高" }, { id: "cover", name: "法规覆盖最广" }, { id: "price", name: "价格从低到高" }]) +
      '<button class="btn-reset" data-mk-set="reset|1">重置筛选</button>';
  }

  function mkBoardsHTML() {
    return MK.boards.map(function (b) {
      const rows = mkBoard(b.id);
      return '<div class="panel"><div class="panel-head"><span>' + b.icon + " " + esc(b.name) +
        '</span><span class="en">TOP 5</span></div><div class="panel-body mk-rk-body">' +
        rows.map(function (x, i) {
          if (x.kind === "offer") {
            return '<button class="rk" data-mk-offer="' + esc(x.o.id) + '"><span class="no">' + (i + 1) + '</span>' +
              '<span class="nm">' + esc(x.o.title) + '</span><span class="vl">' + esc(x.val) + "</span></button>";
          }
          return '<button class="rk" data-mk-vendor="' + esc(x.v.id) + '"><span class="no">' + (i + 1) + '</span>' +
            '<span class="nm">' + esc(x.v.short || x.v.name) + '</span><span class="vl">' + esc(x.val) + "</span></button>";
        }).join("") + '<div class="rk-hint">' + esc(b.desc) + "</div></div></div>";
    }).join("");
  }

  function mkSideHTML() {
    const n = mkCart.length;
    return '<aside class="rv-side">' +
      '<div class="panel"><div class="panel-head"><span>筛选服务</span><span class="en">FILTER</span></div><div class="panel-body">' +
        mkFilters() + "</div></div>" +
      '<div class="panel"><div class="panel-head"><span>采购清单</span><span class="en">RFQ</span></div><div class="panel-body">' +
        '<div class="mk-cartline">已加入 <b>' + n + "</b> 项服务</div>" +
        '<button class="act primary" data-mk-page="cart" style="width:100%;margin-top:8px">📋 查看采购清单与询价单</button>' +
        (n ? '<button class="act" data-mk-export="cart-csv" style="width:100%;margin-top:6px">⬇ 导出询价单 CSV</button>' : "") +
        '<div class="rk-hint" style="margin-top:8px">清单只保存在应用的云端存储；平台不经手交易与支付。</div>' +
      "</div></div>" +
      mkBoardsHTML() + "</aside>";
  }

  function mkCard(o) {
    const v = MK_V[o.vendorId] || {};
    const cat = mkCatOf(o.cat) || {};
    const regs = mkRegsOf(o);
    const inCart = mkCartHas(o.id);
    return '<article class="mk-card">' +
      '<div class="mk-card-top"><span class="mk-cat-tag">' + (cat.icon || "📦") + " " + esc(cat.name || o.cat) + "</span>" +
      (o.badges || []).map(function (b) { return '<span class="mk-bd">' + esc(b) + "</span>"; }).join("") + "</div>" +
      '<h3 class="mk-card-title" data-mk-offer="' + esc(o.id) + '">' + esc(o.title) + "</h3>" +
      '<div class="mk-card-sum">' + esc(o.summary) + "</div>" +
      '<div class="mk-card-vendor" data-mk-vendor="' + esc(v.id) + '">' +
        '<span class="mk-av">' + esc(String(v.short || "?").slice(0, 1)) + "</span>" +
        '<span class="nm">' + esc(v.name || "") + "</span>" +
        (v.verified ? '<span class="mk-vf">已认证</span>' : "") +
        '<span class="st">⭐ ' + (v.rating || "-") + " · 成交 " + (v.deals || 0) + " 单</span>" +
      "</div>" +
      '<div class="mk-card-facts">' +
        '<div><span class="k">价格</span><span class="v pk">' + esc(mkPriceLabel(o)) + "</span></div>" +
        '<div><span class="k">周期</span><span class="v">' + esc(o.days || "—") + "</span></div>" +
        '<div><span class="k">法规</span><span class="v">覆盖 ' + regs.length + " 部</span></div>" +
      "</div>" +
      '<div class="mk-card-regs">' + regs.slice(0, 3).map(function (r) {
        return '<button class="mk-reg-chip" data-open="' + esc(r.id) + '">' + esc(r.title) + "</button>";
      }).join("") + (regs.length > 3 ? '<span class="mk-more-reg">等 ' + regs.length + " 部</span>" : "") + "</div>" +
      '<div class="mk-card-acts">' +
        '<button class="act primary" data-mk-offer="' + esc(o.id) + '">查看服务包</button>' +
        '<button class="act' + (inCart ? " accent" : "") + '" data-mk-cart="' + esc(o.id) + '">' + (inCart ? "✓ 已加入询价单" : "＋ 加入询价单") + "</button>" +
      "</div></article>";
  }

  function mkToolbar(list) {
    const chips = [];
    if (mk.cat !== "all") chips.push({ k: "cat", v: mkCatName(mk.cat) });
    if (mk.type !== "all") chips.push({ k: "type", v: mkTypeName(mk.type) });
    if (mk.region !== "all") chips.push({ k: "region", v: regionOf(mk.region).name });
    if (mk.price !== "all") chips.push({ k: "price", v: ({ free: "免费", from: "起价", package: "套餐价", quote: "按项目报价" })[mk.price] || mk.price });
    if (mk.reg && BY_ID[mk.reg]) chips.push({ k: "reg", v: BY_ID[mk.reg].title });
    if (mk.q.trim()) chips.push({ k: "q", v: mk.q.trim() });
    return '<div class="mk-toolbar">' +
      '<div class="mk-search"><input id="mkQ" type="search" value="' + esc(mk.q) + '" placeholder="搜索服务包、交付物、覆盖的法规或发布方…" autocomplete="off"></div>' +
      '<span class="result-count">共 <b>' + list.length + "</b> 项服务</span>" +
      (chips.length ? '<div class="mk-chips">' + chips.map(function (c) {
        return '<span class="tagchip">' + esc(c.k) + "：<b>" + esc(c.v) + '</b><button class="x" data-mk-unset="' + c.k + '">✕</button></span>';
      }).join("") + "</div>" : "") +
      "</div>";
  }

  function mkListHTML() {
    const list = mkFiltered();
    const shown = list.slice(0, mk.limit);
    return '<div class="mk">' + mkHero() + mkCats() +
      '<div class="rv-grid">' + mkSideHTML() + '<div class="rv-main">' + mkToolbar(list) +
      (shown.length
        ? '<div class="mk-list">' + shown.map(mkCard).join("") + "</div>" +
          (list.length > shown.length
            ? '<div class="more-wrap"><button class="btn-more" data-mk-more="1">加载更多（还有 ' + (list.length - shown.length) + " 项）</button></div>"
            : '<div class="more-wrap" style="color:#7789a0;font-size:12.5px">已显示全部 ' + list.length + " 项服务</div>")
        : '<div class="panel empty"><div class="big">🏪</div><h3>没有匹配的服务包</h3><p>试试更换关键词，或重置左侧筛选条件</p><button class="act primary" data-mk-set="reset|1" style="margin-top:12px">重置全部筛选</button></div>') +
      "</div></div></div>";
  }

  function mkCrumb(txt) {
    return '<div class="mk-crumb"><button data-mk-page="list">🏪 法规服务集市</button>' +
      (txt ? '<span class="sp">/</span>' + txt : "") + "</div>";
  }

  function mkOfferHTML(o) {
    const v = MK_V[o.vendorId] || {};
    const cat = mkCatOf(o.cat) || {};
    const regs = mkRegsOf(o);
    const inCart = mkCartHas(o.id);
    const others = mkOffersByVendor(o.vendorId).filter(function (x) { return x.id !== o.id; });
    return '<div class="mk">' + mkCrumb('<button data-mk-cat="' + esc(o.cat) + '">' + esc(cat.name || o.cat) + "</button><span class=\"sp\">/</span><b>" + esc(o.title) + "</b>") +
      '<div class="rv-grid">' +
      '<aside class="rv-side">' +
        '<div class="panel"><div class="panel-head"><span>发布方</span><span class="en">VENDOR</span></div><div class="panel-body">' +
          '<div class="mk-vcard" data-mk-vendor="' + esc(v.id) + '">' +
            '<div class="hd"><span class="mk-av lg">' + esc(String(v.short || "?").slice(0, 1)) + "</span>" +
            '<div class="meta"><div class="nm">' + esc(v.name || "") + (v.verified ? '<span class="mk-vf">已认证</span>' : "") + "</div>" +
            '<div class="sub">' + esc(mkTypeName(v.type)) + " · " + esc(regionOf(v.region).name) + " " + esc(v.city || "") + " · 入驻 " + esc(v.since || "—") + "</div></div></div>" +
            '<div class="kvs"><div><span class="k">综合评分</span><span class="v">⭐ ' + (v.rating || "-") + "（" + (v.reviews || 0) + " 条）</span></div>" +
            '<div><span class="k">累计成交</span><span class="v">' + (v.deals || 0) + " 单</span></div>" +
            '<div><span class="k">首次响应</span><span class="v">平均 ' + (v.respMins || "-") + " 分钟</span></div>" +
            '<div><span class="k">按期履约</span><span class="v">' + (v.fulfill || "-") + "%</span></div>" +
            '<div><span class="k">资质</span><span class="v">' + esc((v.certs || []).join("、") || "—") + "</span></div></div>" +
            '<button class="act" data-mk-vendor="' + esc(v.id) + '" style="width:100%;margin-top:10px">查看该发布方全部服务</button>' +
          "</div></div></div>" +
        '<div class="panel"><div class="panel-head"><span>法规覆盖</span><span class="en">' + regs.length + '</span></div><div class="panel-body">' +
          '<div class="mk-card-regs mk-regs-full">' + regs.map(function (r) {
            const f = ftOf(r.id);
            return '<button class="mk-reg-chip" data-open="' + esc(r.id) + '">' + esc(r.title) +
              '<span class="rg">' + esc(r.docNo) + (f ? " · 已导入全文 " + f.articles.length + " 条" : "") + "</span></button>";
          }).join("") + "</div>" +
          '<div class="rk-hint" style="margin-top:8px">点法规条目可打开详情，查看核心要点与' + (FT ? "全文层" : "官方溯源") + "。</div>" +
        "</div></div>" +
      "</aside>" +
      '<div class="rv-main">' +
        '<div class="mk-detail">' +
          '<div class="mk-detail-hd"><div class="mk-card-top"><span class="mk-cat-tag">' + (cat.icon || "📦") + " " + esc(cat.name || o.cat) + "</span>" +
            (o.badges || []).map(function (b) { return '<span class="mk-bd">' + esc(b) + "</span>"; }).join("") + "</div>" +
          "<h1>" + esc(o.title) + "</h1>" +
          '<div class="mk-detail-sub">' + esc(o.summary) + "</div></div>" +
          '<div class="mk-pricebar">' +
            '<div class="pc"><span class="k">价格口径</span><span class="v big">' + esc(mkPriceLabel(o)) + "</span></div>" +
            '<div class="pc"><span class="k">承诺周期</span><span class="v">' + esc(o.days || "—") + "</span></div>" +
            '<div class="pc"><span class="k">成交</span><span class="v">' + (o.deals || 0) + " 单</span></div>" +
            '<div class="pc"><span class="k">评价</span><span class="v">⭐ ' + (o.rating || "-") + "（" + (o.reviews || 0) + "）</span></div>" +
          "</div>" +
          '<div class="mk-acts"><button class="act primary" data-mk-cart="' + esc(o.id) + '">' + (inCart ? "✓ 已加入询价单（点击移出）" : "＋ 加入采购清单") + "</button>" +
            '<button class="act" data-mk-export="offer-md" data-mk-id="' + esc(o.id) + '">⬇ 导出服务说明 Markdown</button>' +
            '<button class="act" data-mk-vendor="' + esc(v.id) + '">🏬 进入发布方铺位</button></div>' +
          '<div class="sec"><h3 class="sec-h">交付物清单 <span class="hint">签约前应逐项确认</span></h3>' +
            '<ul class="mk-deliv">' + (o.deliverables || []).map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ul></div>" +
          '<div class="sec"><h3 class="sec-h">服务详情</h3><p class="mk-p">' + esc(o.detail) + "</p></div>" +
          '<div class="sec"><h3 class="sec-h">服务标签</h3><div class="rel-list">' + (o.tags || []).map(function (t) {
            return '<button class="rel-chip" data-mk-tag="' + esc(t) + '">' + esc(t) + "</button>";
          }).join("") + "</div></div>" +
          (others.length ? '<div class="sec"><h3 class="sec-h">同一发布方的其他服务 <span class="hint">共 ' + others.length + " 项</span></h3>" +
            '<div class="mk-mini">' + others.map(function (x) {
              return '<button class="mk-mini-card" data-mk-offer="' + esc(x.id) + '"><span class="t">' + esc(x.title) + '</span><span class="m">' + esc(mkPriceLabel(x)) + " · " + esc(x.days || "") + "</span></button>";
            }).join("") + "</div></div>" : "") +
          '<div class="notice" style="margin-top:16px"><b>交易与合规声明：</b>本集市为需求对接与比价参考平台，<b>不经手交易与支付</b>，不承担交易担保责任。发布方信息、评分与成交数据为演示数据；正式签约前请自行核验发布方的资质证书、人员能力与合同条款。服务成果建议回传至本平台「文档审查工作台」复检，形成闭环。</div>' +
        "</div>" +
      "</div></div></div>";
  }

  function mkVendorHTML(v) {
    const list = mkOffersByVendor(v.id);
    const cats = {};
    list.forEach(function (o) { cats[o.cat] = (cats[o.cat] || 0) + 1; });
    return '<div class="mk">' + mkCrumb("<b>" + esc(v.name) + "</b>") +
      '<section class="mk-vhero">' +
        '<div class="hd"><span class="mk-av xl">' + esc(String(v.short || "?").slice(0, 1)) + "</span>" +
        '<div class="meta"><h1>' + esc(v.name) + (v.verified ? '<span class="mk-vf">已认证</span>' : "") + "</h1>" +
        '<div class="sub">' + esc(mkTypeName(v.type)) + " · " + esc(regionOf(v.region).flag + " " + regionOf(v.region).name) + " " + esc(v.city || "") +
        " · 入驻 " + esc(v.since) + " 年 · " + esc(v.staff || "-") + " 人团队</div>" +
        '<div class="tags">' + (v.badges || []).map(function (b) { return '<span class="mk-bd">' + esc(b) + "</span>"; }).join("") +
        (v.certs || []).map(function (c) { return '<span class="mk-bd cert">' + esc(c) + "</span>"; }).join("") + "</div></div></div>" +
        '<div class="stats">' +
          "<div><span class=\"n\">" + (v.rating || "-") + "</span><span class=\"l\">综合评分</span></div>" +
          "<div><span class=\"n\">" + (v.deals || 0) + "</span><span class=\"l\">累计成交</span></div>" +
          "<div><span class=\"n\">" + (v.respMins || "-") + "</span><span class=\"l\">首次响应(分)</span></div>" +
          "<div><span class=\"n\">" + (v.fulfill || "-") + "%</span><span class=\"l\">按期履约</span></div>" +
          "<div><span class=\"n\">" + list.length + "</span><span class=\"l\">在架服务</span></div>" +
        "</div>" +
        '<p class="mk-p">' + esc(v.intro) + "</p>" +
        '<div class="mk-vmeta"><span>主营领域：' + esc((v.sectors || []).join("、")) + "</span>" +
        "<span>服务类目：" + esc(Object.keys(cats).map(function (c) { return mkCatName(c) + "×" + cats[c]; }).join("、")) + "</span></div>" +
      "</section>" +
      '<div class="rv-grid"><aside class="rv-side">' +
        '<div class="panel"><div class="panel-head"><span>与本铺位相关</span><span class="en">LINK</span></div><div class="panel-body">' +
          '<button class="act primary" data-mk-page="cart" style="width:100%">📋 采购清单（' + mkCart.length + " 项）</button>" +
          '<button class="act" data-mk-page="list" style="width:100%;margin-top:8px">🏪 返回集市首页</button>' +
        "</div></div>" + mkBoardsHTML() + "</aside>" +
        '<div class="rv-main"><div class="mk-toolbar"><span class="result-count">该发布方在架 <b>' + list.length + "</b> 项服务</span></div>" +
        '<div class="mk-list">' + list.map(mkCard).join("") + "</div></div>" +
      "</div></div>";
  }

  function mkCartHTML() {
    const rows = mkCartOffers();
    const regs = mkCartRegs();
    const catCount = {};
    rows.forEach(function (x) { catCount[x.offer.cat] = (catCount[x.offer.cat] || 0) + 1; });
    return '<div class="mk">' + mkCrumb("<b>采购清单与询价单</b>") +
      '<section class="mk-hero mk-hero-sm"><div class="fh-tag">REQUEST FOR QUOTATION · 采购清单</div>' +
      "<h1>采购清单与询价单</h1>" +
      "<p>把待办事项对应的服务包集中成一张询价单：交付物、周期、价格口径与法规覆盖并排列出，便于内部审批与对外询价。清单只保存在应用的云端存储。</p>" +
      '<div class="rv-stats">' +
      '<div><span class="n">' + rows.length + "</span><span class=\"l\">服务项</span></div>" +
      '<div><span class="n">' + Object.keys(catCount).length + "</span><span class=\"l\">涉及类目</span></div>" +
      '<div><span class="n">' + regs.length + "</span><span class=\"l\">涉及法规</span></div>" +
      '<div><span class="n">' + new Set(rows.map(function (x) { return x.offer.vendorId; })).size + "</span><span class=\"l\">发布方</span></div>" +
      "</div></section>" +
      (rows.length
        ? '<div class="mk-acts"><button class="act primary" data-mk-export="cart-md">⬇ 导出询价单 Markdown</button>' +
          '<button class="act" data-mk-export="cart-csv">⬇ 导出询价单 CSV</button>' +
          '<button class="act" data-mk-page="list">＋ 继续挑选服务</button>' +
          '<span class="spacer"></span><button class="act danger" data-mk-cart-clear="1">清空采购清单</button></div>' +
          '<div class="mk-cart-table">' +
          '<div class="hd"><span>服务包 / 发布方</span><span>交付物</span><span>法规覆盖</span><span>价格</span><span>周期</span><span></span></div>' +
          rows.map(function (x) {
            return '<div class="rw">' +
              "<div><button class=\"t\" data-mk-offer=\"" + esc(x.offer.id) + "\">" + esc(x.offer.title) + "</button>" +
              '<div class="s">' + esc(x.vendor ? x.vendor.name : "") + " · " + esc(mkCatName(x.offer.cat)) + "</div></div>" +
              '<div class="c">' + (x.offer.deliverables || []).map(function (d) { return "<span>" + esc(d) + "</span>"; }).join("") + "</div>" +
              '<div class="c">' + mkRegsOf(x.offer).map(function (r) { return "<span>" + esc(r.title) + "</span>"; }).join("") + "</div>" +
              '<div class="p">' + esc(mkPriceLabel(x.offer)) + "</div>" +
              '<div class="p">' + esc(x.offer.days || "—") + "</div>" +
              '<div class="a"><button class="x" data-mk-cart="' + esc(x.offer.id) + '" title="移出清单">✕</button></div>' +
            "</div>";
          }).join("") + "</div>" +
          '<div class="sec" style="margin-top:18px"><h3 class="sec-h">服务流程与平台边界 <span class="hint">共 ' + MK.steps.length + " 步</span></h3>" +
          '<div class="mk-steps">' + MK.steps.map(function (s) {
            return '<div class="st"><span class="no">' + esc(s.no) + '</span><div><div class="nm">' + esc(s.name) + '</div><div class="ds">' + esc(s.desc) + "</div></div></div>";
          }).join("") + "</div></div>" +
          '<div class="sec"><h3 class="sec-h">涉及法规与溯源</h3><div class="mk-card-regs mk-regs-full">' +
          regs.map(function (id) {
            const r = BY_ID[id];
            if (!r) return "";
            return '<button class="mk-reg-chip" data-open="' + esc(id) + '">' + esc(r.title) + '<span class="rg">' + esc(r.docNo) + "</span></button>";
          }).join("") + "</div></div>" +
          '<div class="notice" style="margin-top:16px"><b>平台声明：</b>' + esc(MK.notice) + "</div>"
        : '<div class="panel empty"><div class="big">📋</div><h3>采购清单还是空的</h3><p>在集市中浏览服务包，点击「加入询价单」把需要的事项集中起来</p><button class="act primary" data-mk-page="list" style="margin-top:12px">前往集市挑选服务</button></div>') +
      "</div>";
  }

  function marketHTML() {
    if (!mkOk()) {
      return '<div class="panel empty"><div class="big">⚠️</div><h3>集市数据未加载</h3><p>请确认 data/market.js 已正确引入。</p></div>';
    }
    if (mk.page === "offer") {
      const o = mkOfferOf(mk.offerId);
      if (o) return mkOfferHTML(o);
      mk.page = "list";
    }
    if (mk.page === "vendor") {
      const v = MK_V[mk.vendorId];
      if (v) return mkVendorHTML(v);
      mk.page = "list";
    }
    if (mk.page === "cart") return mkCartHTML();
    return mkListHTML();
  }

  function mkOfferMd(o) {
    const v = MK_V[o.vendorId] || {};
    let s = "# " + o.title + "\n\n> 服务包说明 · 由「医械法规云 MedReg Hub」法规集市导出 · " +
      new Date().toLocaleString("zh-CN", { hour12: false }) + "\n> 集市数据为演示数据；平台不经手交易与支付。\n\n";
    s += "## 一、基本信息\n\n";
    s += "- 服务类目：" + mkCatName(o.cat) + "\n";
    s += "- 发布方：" + v.name + "（" + mkTypeName(v.type) + " · " + regionOf(v.region).name + " " + (v.city || "") + "）\n";
    s += "- 发布方评分：⭐ " + v.rating + "（" + v.reviews + " 条评价）· 累计成交 " + v.deals + " 单 · 按期履约 " + v.fulfill + "%\n";
    s += "- 价格口径：" + mkPriceLabel(o) + "\n- 承诺周期：" + (o.days || "—") + "\n";
    s += "- 发布方资质：" + ((v.certs || []).join("、") || "—") + "\n\n";
    s += "## 二、交付物清单\n\n" + (o.deliverables || []).map(function (d, i) { return i + 1 + ". " + d; }).join("\n") + "\n\n";
    s += "## 三、覆盖法规（" + mkRegsOf(o).length + " 部）\n\n";
    mkRegsOf(o).forEach(function (r) {
      s += "- " + r.title + "（" + r.docNo + "）· " + r.issuer + "· 溯源：" + r.officialUrl + "\n";
    });
    s += "\n## 四、服务详情\n\n" + o.detail + "\n\n";
    s += "## 五、平台声明\n\n" + MK.notice + "\n";
    return s;
  }

  /* 事件绑定：集市视图内的输入类控件（点击类走全局委托） */
  function bindMarket() {
    const q = $("#mkQ");
    if (q) q.addEventListener("input", debounce(function () { mk.q = q.value; mk.limit = 9; render(); }, 220));
  }

  function mkSet(key, v) {
    if (key === "reset") {
      mk.cat = "all"; mk.type = "all"; mk.region = "all"; mk.price = "all"; mk.q = ""; mk.sort = "default"; mk.reg = null;
    } else {
      mk[key] = v;
    }
    mk.limit = 9;
    mk.page = "list";
    render();
  }
  function mkOpenOffer(id) { mk.page = "offer"; mk.offerId = id; render(); window.scrollTo({ top: 200, behavior: "smooth" }); }
  function mkOpenVendor(id) { mk.page = "vendor"; mk.vendorId = id; render(); window.scrollTo({ top: 200, behavior: "smooth" }); }
  function exportCartMd() {
    if (!mkCart.length) return toast("采购清单为空");
    download("法规服务询价单-" + stamp() + ".md", mkCartMd(), "text/markdown");
  }
  function exportCartCSV() {
    if (!mkCart.length) return toast("采购清单为空");
    download("法规服务询价单-" + stamp() + ".csv", "\uFEFF" + mkCartCSV(), "text/csv");
  }
  function exportFullBook() {
    if (!ftImported()) return toast("尚未导入任何法规全文");
    download("法规全文导入册-" + stamp() + ".md", ftBookMd(), "text/markdown");
  }

  /* ============================================================================
   * 全文层：渲染与交互
   * ==========================================================================*/
  function ftToText(s) {
    const lines = [];
    let lastCh = "";
    (s.articles || []).forEach(function (a) {
      if (a.ch && a.ch !== lastCh) { lines.push(a.ch + (a.chTitle ? "　" + a.chTitle : "")); lastCh = a.ch; }
      lines.push(a.no + (a.title ? "　" + a.title : "") + (a.text ? "　" + a.text : ""));
    });
    return lines.join("\n");
  }

  function ftArtsHTML(r, s) {
    const q = ft.q.trim();
    const terms = q ? q.toLowerCase().split(/\s+/).filter(Boolean) : null;
    const hit = terms ? ftSearch(s, q) : null;
    let lastCh = "";
    const out = [];
    (s.articles || []).forEach(function (a, i) {
      if (hit && !hit[i]) return;
      if (a.ch && a.ch !== lastCh) {
        out.push('<div class="ft-ch-line">' + esc(a.ch) + (a.chTitle ? "　" + esc(a.chTitle) : "") + "</div>");
        lastCh = a.ch;
      }
      const pts = ftPoints(r.id, a.no);
      out.push('<div class="ft-art' + (pts.length ? " has-pt" : "") + (hit ? " is-hit" : "") + '">' +
        '<div class="ft-art-h"><span class="no">' + esc(a.no) + "</span>" +
        (a.title ? '<span class="tt">' + esc(a.title) + "</span>" : "") +
        (pts.length ? '<span class="cp">已对照要点</span>' : "") + "</div>" +
        '<div class="ft-art-c">' + (terms ? hl(a.text || "", terms) : esc(a.text || "")) + "</div>" +
        (pts.length ? '<div class="ft-art-pt">' + pts.map(function (p) {
          return '<div class="pt"><span class="lbl">📌 平台要点 · ' + esc(p.label) + '</span><span class="txt">' + esc(p.text) + "</span></div>";
        }).join("") + "</div>" : "") +
        "</div>");
    });
    if (!out.length) return '<div class="rk-hint">没有条款命中该关键词。</div>';
    return out.join("");
  }

  function ftHTML(r) {
    if (!FT) return "";
    const s = ftOf(r.id);
    const chs = ftChannelsOf(r);
    const isDemo = !!(s && /【演示】/.test(s.source));
    let h = '<div class="sec"><h3 class="sec-h">全文层 <span class="hint">' +
      (s ? "已导入 " + s.articles.length + " 条 / " + ftSize(s.chars) : "未导入") + "</span></h3>";
    h += '<div class="notice"><b>数据政策：</b>本平台<b>不内嵌、不复制法规原文</b>。此处提供两件事：① 官方全文获取通道；② 本地导入解析——把官方全文导入后，可在本机逐条浏览，并与上面的「核心条款要点」做条号对照。导入内容只保存在应用的云端存储。权威文本以发布机关公布版本为准。</div>';
    h += '<div class="ft-ch"><div class="ft-ch-h">① 官方全文获取通道' + (chs.length ? "" : "（该地区暂无预置通道，可用底部「官方溯源」）") + "</div>";
    h += chs.length ? chs.map(function (c) {
      return '<button class="ft-ch-item" data-ft-ch="' + esc(c.id) + '"><span class="nm">' + esc(c.name) + "</span>" +
        '<span class="meta">' + esc(c.format) + " · " + esc(c.scope) + '</span><span class="tip">' + esc(c.tip) + "</span></button>";
    }).join("") : '<div class="rk-hint">可通过抽屉底部「官方溯源」按钮直达 ' + esc(r.source) + " 的公布页面。</div>";
    h += "</div>";

    h += '<div class="ft-import">';
    if (s) {
      h += '<div class="ft-meta">' +
        '<div><span class="k">导入来源</span><span class="v">' + esc(s.source) + "</span></div>" +
        '<div><span class="k">导入时间</span><span class="v">' + esc(s.at) + "</span></div>" +
        '<div><span class="k">解析结构</span><span class="v">' + s.chapters.length + " 章 / " + s.articles.length + " 条 · " + ftSize(s.chars) + "</span></div>" +
        "</div>" +
        (isDemo ? '<div class="ft-err">⚠ 当前为演示文本，不是该法规的真实条文，仅用于体验导入解析与要点对照流程。</div>' : "");
      h += '<div class="ft-tools"><input id="ftQ" type="search" value="' + esc(ft.q) + '" placeholder="在导入的全文中检索关键词，例如 时限、追溯、验证…" autocomplete="off">' +
        '<button class="act" data-ft-export="1">⬇ 导出该法规全文册</button>' +
        '<button class="act" data-ft-reimport="1">🔄 重新导入 / 更新版本</button>' +
        '<button class="act danger" data-ft-clear="1">🗑 清除全文</button></div>';
      h += '<div class="ft-hitline" id="ftHit">' + (ft.q.trim()
        ? "关键词「" + esc(ft.q.trim()) + "」命中 <b>" + (ftSearch(s, ft.q) ? Object.keys(ftSearch(s, ft.q)).length : 0) + "</b> 条（共 " + s.articles.length + " 条）"
        : "") + "</div>";
      h += '<div class="ft-arts" id="ftArts">' + ftArtsHTML(r, s) + "</div>";
    } else {
      h += '<div class="ft-empty">' + (ft.open ? "" : "② 导入官方全文：从上方通道取得全文后，粘贴或上传到本机解析") + "</div>";
    }
    if (!ft.open) {
      h += '<div class="ft-acts"><button class="act primary" data-ft-open="1">📥 ' + (s ? "导入其他版本" : "导入官方全文") + "</button>" +
        '<button class="act" data-ft-demo="1">🧪 演示导入（体验解析与要点对照）</button></div>';
    } else {
      h += '<div class="ft-editor"><div class="ft-editor-hd">导入官方全文 <span class="hint">' + esc(FT.parse.hint) + "</span></div>" +
        '<textarea id="ftInput" class="ft-input" spellcheck="false" placeholder="把从官方页面复制的法规全文粘贴到此处。解析按「第X条」切分，章节点会一并保留…">' + esc(ft.input) + "</textarea>" +
        '<div class="ft-src"><label>来源标注</label><input id="ftSrc" type="text" value="' + esc(ft.source) + '" placeholder="例如：NMPA 政策法规页 2025-03-01 公布版 PDF"></div>' +
        '<div class="ft-acts"><button class="act primary" data-ft-save="1">解析并保存到应用</button>' +
        '<label class="act" for="ftFile">📎 选择 .txt / .md / .docx</label><input id="ftFile" type="file" accept=".txt,.md,.docx,text/plain" style="display:none">' +
        '<button class="act" data-ft-demo="1">🧪 填入演示文本</button>' +
        '<button class="act" data-ft-cancel="1">取消</button></div>' +
        (ft.err ? '<div class="ft-err">' + esc(ft.err) + "</div>" : "") +
        "</div>";
    }
    h += "</div></div>";
    return h;
  }

  function ftRefresh() {
    const box = $("#ftSection");
    if (box && curDetail) box.innerHTML = ftHTML(curDetail);
  }
  /* 仅刷新条款区与命中行：避免输入检索词时重建输入框导致失焦 */
  let ftTimer = null;
  function ftArtsRefresh() {
    if (!curDetail) return;
    const s = ftOf(curDetail.id);
    const box = $("#ftArts");
    if (box && s) box.innerHTML = ftArtsHTML(curDetail, s);
    const line = $("#ftHit");
    if (line && s) {
      const q = ft.q.trim();
      line.innerHTML = q
        ? "关键词「" + esc(q) + "」命中 <b>" + (ftSearch(s, q) ? Object.keys(ftSearch(s, q)).length : 0) + "</b> 条（共 " + s.articles.length + " 条）"
        : "";
    }
  }
  function ftOpenEditor(open) {
    ft.open = !!open;
    if (!ft.open) { ft.input = ""; ft.err = ""; ft.source = ""; }
    ftRefresh();
  }
  function ftDoImport(regId, text, source) {
    const res = ftImport(regId, text, source);
    if (res.err) { ft.err = res.err; ftRefresh(); return toast("解析失败：" + res.err); }
    ft.err = ""; ft.open = false; ft.input = ""; ft.source = ""; ft.q = "";
    ftRefresh();
    toast("已解析并保存 " + res.n + " 条条款 / " + res.m + " 章（保存在应用文件中）");
  }
  function ftDemoImport(regId) {
    if (!FT || !FT.demo) return toast("演示素材未加载");
    ftDoImport(regId, FT.demo.text, "【演示】导入解析体验文本（非真实法规条文）");
  }
  async function ftLoadFile() {
    const f = $("#ftFile") && $("#ftFile").files && $("#ftFile").files[0];
    if (!f) return;
    try {
      let text;
      if (/\.docx$/i.test(f.name)) {
        const buf = await new Promise(function (res, rej) {
          const fr = new FileReader();
          fr.onload = function () { res(fr.result); };
          fr.onerror = function () { rej(new Error("读取失败")); };
          fr.readAsArrayBuffer(f);
        });
        text = await rvDocxText(buf);
      } else {
        text = await rvReadText(f);
      }
      ft.input = text;
      const srcEl = $("#ftSrc");
      if (srcEl && !srcEl.value.trim()) ft.source = "本地文件 " + f.name;
      else if (srcEl) ft.source = srcEl.value.trim();
      ft.err = "";
      ftRefresh();
      toast("已载入 " + f.name + "（" + text.length + " 字），确认来源标注后点「解析并保存到应用」");
    } catch (e) {
      ft.err = "文件读取失败：" + e.message + "；可改用文本粘贴方式";
      ftRefresh();
    }
  }

  /* 法规详情 → 集市：该法规的相关服务 */
  function mkRegServicesHTML(r) {
    if (!mkOk()) return "";
    const all = mkOffersByReg(r.id);
    if (!all.length) return "";
    const list = all.slice(0, 4);
    return '<div class="sec"><h3 class="sec-h">该法规的相关服务 <span class="hint">集市中共 ' + all.length + " 项，列出前 4 项</span></h3>" +
      '<div class="mk-regsvc">' + list.map(function (o) {
        const v = MK_V[o.vendorId] || {};
        return '<button class="mk-regsvc-item" data-mk-offer="' + esc(o.id) + '"><span class="t">' + esc(o.title) + "</span>" +
          '<span class="m">' + esc(v.short || "") + " · " + esc(mkCatName(o.cat)) + " · " + esc(mkPriceLabel(o)) + "</span></button>";
      }).join("") + "</div>" +
      '<button class="act" data-mk-reg="' + esc(r.id) + '" style="margin-top:10px">🏪 在集市中查看该法规的全部相关服务</button></div>';
  }

  /* 全文层与集市的对外接口（供自测与二次开发使用）
   * 注意：必须放在各模块的常量声明之后，否则会触发 const 的暂时性死区错误。 */
  window.MedRegFulltext = {
    rules: FT,
    parse: ftParse,
    import: ftImport,
    clear: ftClear,
    store: function () { return ftStore; },
    imported: ftImported,
    artsTotal: ftArtsTotal,
    load: ftLoad,
    channelsOf: ftChannelsOf,
    exportMd: ftExportMd,
    book: ftBookMd,
    points: ftPoints,
    search: ftSearch,
    state: ft
  };
  window.MedRegMarket = {
    rules: MK,
    filtered: mkFiltered,
    offer: mkOfferOf,
    vendor: function (id) { return MK_V[id] || null; },
    board: mkBoard,
    offersByReg: mkOffersByReg,
    cart: function () { return mkCartOffers(); },
    cartToggle: mkCartToggle,
    cartMd: mkCartMd,
    cartCSV: mkCartCSV,
    offerMd: mkOfferMd,
    catForDoc: mkCatForDoc,
    load: mkLoad,
    state: mk
  };

  /* ------------------------------ 启动 ------------------------------ */
  function boot() {
    if (!ALL.length) { $("#main").innerHTML = '<div class="panel empty"><div class="big">⚠️</div><h3>数据未加载</h3><p>请确认 data/ 目录下的数据文件存在，或通过本地服务方式打开页面。</p></div>'; return; }
    $("#q").value = "";
    updateFavCount();
    if (typeof ftLoad === "function") ftLoad();
    if (typeof mkLoad === "function") mkLoad();
    if (typeof scLoad === "function") scLoad();
    bindGlobal();
    render();
    bindDownloadsObserver();
  }

  // 下载中心需要重新绑定事件（视图切换后）
  const origRender = render;
  render = function () {
    origRender();
    if (state.view === "downloads") bindDownloads();
  };

  function bindDownloadsObserver() {}

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
