
(function () {
  "use strict";

  /* ---------- 常量 ---------- */
  var PAPER = {
    a4: [210, 297], a5: [148, 210], b5: [176, 250], letter: [215.9, 279.4]
  };
  var GRID = { 1: [1, 1], 2: [2, 1], 3: [3, 1], 4: [2, 2], 6: [3, 2], 8: [4, 2], 9: [3, 3] };
  var PT_PER_MM = 72 / 25.4;

  var LIB = window.PDFLib;
  if (!LIB) {
    document.getElementById("msg").textContent =
      "缺少 pdf-lib 依赖：请确认 vendor/pdf-lib.min.js 与 index.html 在同一目录。";
    document.getElementById("msg").className = "msg err";
    return;
  }

  /* ---------- 发票金额识别（pdf.js，全本地；任何失败都不影响合并） ---------- */
  var PDFJS = window.pdfjsLib;
  if (PDFJS) {
    try { PDFJS.GlobalWorkerOptions.workerSrc = new URL("vendor/pdf.worker.min.js", import.meta.url).href; } catch (e) {}
  }

  var MONEY_G = /[¥￥]\s*(-?[0-9][0-9,]*(?:\.[0-9]{1,2})?)/g;

  /* 全角转半角 + 去空白，方便统一正则 */
  function toHalf(s) {
    return String(s == null ? "" : s)
      .replace(/[\uFF10-\uFF19]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
      .replace(/\uFF0E/g, ".").replace(/\uFF0C/g, ",")
      .replace(/[\uFFE5\u00A5\uFF04]/g, "¥")
      .replace(/\uFF08/g, "(").replace(/\uFF09/g, ")")
      .replace(/[\s\u00A0\u3000]/g, "");
  }

  /* 把 pdf.js 的文本片段按基线聚成行，行内按 x 排序拼成整行文字 */
  function groupRows(pieces) {
    var rows = [];
    for (var i = 0; i < pieces.length; i++) {
      var t = pieces[i];
      if (!t || !t.str || !t.str.trim()) continue;
      var y = t.transform[5], row = null;
      for (var j = 0; j < rows.length; j++) {
        if (Math.abs(rows[j].y - y) <= 2.5) { row = rows[j]; break; }
      }
      if (!row) { row = { y: y, parts: [] }; rows.push(row); }
      row.parts.push(t);
    }
    rows.forEach(function (r) {
      r.parts.sort(function (a, b) { return a.transform[4] - b.transform[4]; });
      r.text = toHalf(r.parts.map(function (p) { return p.str; }).join(""));
    });
    rows.sort(function (a, b) { return b.y - a.y; });   // 上 → 下
    return rows;
  }

  /* 取一行里最后一个 ¥ 金额（价税合计一般在行尾 / 最右） */
  function moneyIn(text) {
    var m = String(text || "").match(MONEY_G);
    if (!m || !m.length) return null;
    return m[m.length - 1].replace(/[¥￥\s,]/g, "");
  }

  var AMT_KEYS = [
    { re: /小写/, why: "小写" },
    { re: /价税合计/, why: "价税合计" },
    { re: /(合计金额|金额合计|价税总计|总计|总额|合计)/, why: "合计" }
  ];

  /* 从一页的行文本里挑出价税合计；挑不到返回 null */
  function pickAmount(rows) {
    for (var k = 0; k < AMT_KEYS.length; k++) {
      for (var i = 0; i < rows.length; i++) {
        if (!AMT_KEYS[k].re.test(rows[i].text)) continue;
        var v = moneyIn(rows[i].text) ||
                moneyIn(rows[i + 1] && rows[i + 1].text) ||
                moneyIn(rows[i - 1] && rows[i - 1].text);
        if (v) return { value: v, why: AMT_KEYS[k].why };
      }
    }
    var best = null;                      // 兜底：整页 ¥ 金额取最大（价税合计一般最大）
    rows.forEach(function (r) {
      var g = r.text.match(MONEY_G);
      if (!g) return;
      g.forEach(function (s) {
        var n = parseFloat(s.replace(/[¥￥\s]/g, "").replace(/,/g, ""));
        if (isFinite(n) && (best === null || n > best)) best = n;
      });
    });
    return best === null ? null : { value: best.toFixed(2), why: "推测" };
  }

  /* 用 pdf.js 读出一份 PDF 每一页的金额，返回数组（识别不到为 null） */
  async function readAmounts(it) {
    if (!PDFJS || !it.bytes) return null;
    var doc = null;
    try {
      doc = await PDFJS.getDocument({
        data: it.bytes.slice(0), isEvalSupported: false,
        disableFontFace: true, useSystemFonts: false,
        cMapUrl: "vendor/cmaps/", cMapPacked: true
      }).promise;
      var per = [], n = Math.min(doc.numPages, 30);
      for (var i = 1; i <= n; i++) {
        var v = null;
        try {
          var pg = await doc.getPage(i);
          var tc = await pg.getTextContent();
          var hit = pickAmount(groupRows(tc.items));
          v = hit ? hit.value : null;
        } catch (e) { v = null; }
        per.push(v);
      }
      return per;
    } catch (e) {
      return null;
    } finally {
      try { if (doc) doc.destroy(); } catch (e) {}
    }
  }

  function fmtMoney(n) {
    if (n === null || n === undefined || !isFinite(n)) return "";
    var s = (Math.round(n * 100) / 100).toFixed(2).split(".");
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return s.join(".");
  }

  function isWaiting(it) { return it.moneyState === "pending" || it.moneyState === "doing"; }

  /* 重算并刷新底部合计 */
  function updateTotal() {
    var arr = items.filter(function (x) { return !x.error; });
    if (!arr.length) { el.totalbox.classList.add("hidden"); return; }
    var sum = 0, miss = 0, wait = 0;
    arr.forEach(function (x) {
      if (isWaiting(x)) { wait++; return; }
      if (x.amount === null || x.amount === undefined) { miss++; return; }
      sum += x.amount;
    });
    el.totalbox.classList.remove("hidden");
    el.totalval.textContent = "¥" + fmtMoney(sum);
    var note = [];
    if (wait) note.push(wait + " 张识别中");
    if (miss) note.push(miss + " 张未识别，可手填");
    if (!note.length && !PDFJS) note.push("识别模块未加载，可手填");
    el.totalnote.textContent = note.length ? "（" + note.join(" · ") + "）" : "";
  }

  /* 底部统计：本会话累计的合并次数与发票张数 */
  function renderStats() {
    var arr = items.filter(function (x) { return !x.error; });
    el.statbox.classList.toggle("hidden", arr.length === 0);
    el.statmerges.textContent = stats.merges;
    el.statinvoices.textContent = stats.invoices;
  }

  /* ---------- 状态 ---------- */
  var items = [];      // {id,name,size,lastModified,pages,doc,bytes,blank}
  var seq = 0;
  var lastBlob = null, lastUrl = null;
  /* 工作量统计：本会话内累计（刷新页面归零，不落盘） */
  var stats = { merges: 0, invoices: 0 };

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    drop: $("drop"), picker: $("picker"), list: $("list"), listempty: $("listempty"),
    count: $("count"), alerts: $("alerts"), sort: $("sort"), clear: $("clear"),
    perPage: $("perPage"), paper: $("paper"), orient: $("orient"), scale: $("scale"),
    margin: $("margin"), gap: $("gap"), cutMode: $("cutMode"), cutDash: $("cutDash"),
    cutOuter: $("cutOuter"), skipEmpty: $("skipEmpty"),
    cropT: $("cropT"), cropB: $("cropB"), cropL: $("cropL"), cropR: $("cropR"),
    outname: $("outname"), outnameBar: $("outnameBar"), namebox: $("namebox"),
    sheet: $("sheet"), pnote: $("pnote"), gridhint: $("gridhint"),
    run: $("run"), open: $("open"), msg: $("msg"), prog: $("prog"), progbar: $("progbar"),
    reset: $("reset"),
    totalbox: $("totalbox"), totalval: $("totalval"), totalnote: $("totalnote"),
    statbox: $("statbox"), statmerges: $("statmerges"), statinvoices: $("statinvoices"),
    repModal: $("repModal"), repBody: $("repBody"),
    repErr: $("repErr"), repCards: $("repCards"),
    repTabs: $("repTabs"), repTick: $("repTick"),
    repPaneDay: $("repPaneDay"), repPaneIp: $("repPaneIp"), repPaneRaw: $("repPaneRaw"),
    repOpen: $("repOpen"), repClose: $("repClose"),
    repReload: $("repReload"), repCsv: $("repCsv")
  };

  function setMsg(text, kind) {
    el.msg.textContent = text;
    el.msg.className = "msg" + (kind ? " " + kind : "");
  }
  function toast(text, kind) {
    var li = document.createElement("li");
    li.textContent = text;
    el.alerts.appendChild(li);
    el.alerts.classList.remove("hidden");
  }
  function clearAlerts() { el.alerts.innerHTML = ""; el.alerts.classList.add("hidden"); }
  function fmtSize(b) {
    if (b < 1024) return b + " B";
    if (b < 1048576) return (b / 1024).toFixed(0) + " KB";
    return (b / 1048576).toFixed(2) + " MB";
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function defaultOutName() {
    var d = new Date();
    return "发票合并_" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "_" +
      pad(d.getHours()) + pad(d.getMinutes()) + ".pdf";
  }

  /* 输出文件名：底部文件名框与右侧输入框共用一份值，两边实时同步 */
  var outnameEdited = false;
  function applyOutName(v) {
    el.outname.value = v;
    el.outnameBar.value = v;
  }
  /* 按「加入文件的当下」重算默认文件名；用户已手改过则保留他的输入 */
  function refreshOutName() {
    if (!outnameEdited) applyOutName(defaultOutName());
  }

  /* ---------- 参数读取 ---------- */
  function readParams() {
    var per = parseInt(el.perPage.value, 10) || 4;
    var g = GRID[per] || [2, 2];
    var rows = g[0], cols = g[1];
    var portrait = el.orient.querySelector("button.on").dataset.v === "portrait";
    var paper = PAPER[el.paper.value] || PAPER.a4;
    var paperW = paper[0], paperH = paper[1];
    if (!portrait) { var t = paperW; paperW = paperH; paperH = t; var r = rows; rows = cols; cols = r; }
    return {
      perPage: per,
      rows: rows, cols: cols, portrait: portrait,
      paperW: paperW, paperH: paperH,
      margin: Math.max(0, parseFloat(el.margin.value) || 0),
      gap: Math.max(0, parseFloat(el.gap.value) || 0),
      cropT: Math.max(0, parseFloat(el.cropT.value) || 0),
      cropB: Math.max(0, parseFloat(el.cropB.value) || 0),
      cropL: Math.max(0, parseFloat(el.cropL.value) || 0),
      cropR: Math.max(0, parseFloat(el.cropR.value) || 0),
      scaleMode: el.scale.value,
      cutMode: el.cutMode.value,
      cutDash: el.cutDash.querySelector("button.on").dataset.v === "dash",
      cutOuter: el.cutOuter.checked,
      skipEmpty: el.skipEmpty.checked,
      outname: (el.outname.value || "").trim() || defaultOutName()
    };
  }

  /* ---------- 版式预览 ---------- */
  function renderPreview() {
    var p = readParams();
    var availW = p.paperW - 2 * p.margin;
    var availH = p.paperH - 2 * p.margin;
    var cellW = availW / p.cols - p.gap * (p.cols - 1) / p.cols;
    var cellH = availH / p.rows - p.gap * (p.rows - 1) / p.rows;

    /* 预览尺寸随容器自适应：优先填满右栏剩余空间，容器过矮时退回安全下限 */
    var pv = el.sheet.parentNode;
    var maxW = Math.min(204, Math.max(84, (pv.clientWidth || 320) - 30));
    var maxH = Math.max(112, (pv.clientHeight || 260) - 52);
    var boxW = maxW;
    var boxH = boxW * p.paperH / p.paperW;
    if (boxH > maxH) { boxH = maxH; boxW = boxH * p.paperW / p.paperH; }

    el.sheet.style.width = boxW.toFixed(1) + "px";
    el.sheet.style.height = boxH.toFixed(1) + "px";
    el.sheet.style.padding = (p.margin / p.paperW * boxW).toFixed(2) + "px";
    el.sheet.style.gridTemplateColumns = "repeat(" + p.cols + ",1fr)";
    el.sheet.style.gridTemplateRows = "repeat(" + p.rows + ",1fr)";
    el.sheet.style.gap = (p.gap / p.paperW * boxW).toFixed(2) + "px";
    el.sheet.innerHTML = "";
    for (var i = 0; i < p.perPage; i++) {
      var c = document.createElement("div");
      c.className = "cell";
      c.innerHTML = "<i></i>";
      el.sheet.appendChild(c);
    }
    el.gridhint.textContent = p.rows + " 行 × " + p.cols + " 列";

    /* 分割裁剪线预览 */
    el.sheet.classList.toggle("m-cell", p.cutMode === "cell");
    if (p.cutMode === "cross") {
      var kx = boxW / p.paperW, ky = boxH / p.paperH;
      var cls = " solid";
      if (p.cutDash) cls = "";
      var n, d;
      for (n = 1; n < p.cols; n++) {
        d = document.createElement("div");
        d.className = "cut v" + cls;
        d.style.left = ((p.margin + n * cellW + (n - 0.5) * p.gap) * kx).toFixed(2) + "px";
        el.sheet.appendChild(d);
      }
      for (n = 1; n < p.rows; n++) {
        d = document.createElement("div");
        d.className = "cut h" + cls;
        d.style.top = ((p.paperH - p.margin - n * cellH - (n - 0.5) * p.gap) * ky).toFixed(2) + "px";
        el.sheet.appendChild(d);
      }
      if (p.cutOuter) {
        d = document.createElement("div");
        d.className = "cutbox" + cls;
        d.style.left = (p.margin * kx).toFixed(2) + "px";
        d.style.top = (p.margin * ky).toFixed(2) + "px";
        d.style.width = ((p.paperW - 2 * p.margin) * kx).toFixed(2) + "px";
        d.style.height = ((p.paperH - 2 * p.margin) * ky).toFixed(2) + "px";
        el.sheet.appendChild(d);
      }
    }
    el.pnote.textContent = "单格约 " + cellW.toFixed(1) + " × " + cellH.toFixed(1) + " mm · 每页 " + p.perPage + " 张";
  }

  function setMode(mode) {
    var btns = el.orient.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) btns[i].classList.toggle("on", btns[i].dataset.v === mode);
    renderPreview();
  }

  /* ---------- 文件列表渲染 ---------- */
  function sortedItems() {
    var mode = el.sort.value;
    var arr = items.slice();
    if (mode === "name") {
      arr.sort(function (a, b) { return a.name.localeCompare(b.name, "zh-Hans-CN", { numeric: true, sensitivity: "base" }); });
    } else if (mode === "time") {
      arr.sort(function (a, b) { return a.lastModified - b.lastModified; });
    }
    return arr;
  }

  function renderList() {
    var arr = sortedItems();
    el.list.innerHTML = "";
    var totalPages = 0;
    arr.forEach(function (it, i) {
      totalPages += it.pages;
      var li = document.createElement("li");
      li.draggable = true;
      li.dataset.id = it.id;
      li.innerHTML =
        '<span class="grip" title="拖动排序">⋮⋮</span>' +
        '<span class="fidx">' + (i + 1) + '</span>' +
        '<span class="fmeta">' +
        '<span class="fname"></span>' +
        '<span class="fsub">' + it.pages + ' 页 · ' + fmtSize(it.size) +
        (it.blankIdx.length ? ' · <span class="warn">含 ' + it.blankIdx.length + ' 个空白页</span>' : '') + '</span>' +
        '</span>' +
        '<span class="famt">' +
        '<span class="cur">¥</span>' +
        '<input class="amti" type="text" inputmode="decimal" draggable="false" spellcheck="false"' +
        ' value="' + (isWaiting(it) || it.amount == null ? "" : it.amount.toFixed(2)) + '"' +
        ' placeholder="' + (isWaiting(it) ? "识别中" : "未识别") + '"' +
        (isWaiting(it) ? " disabled" : "") + '>' +
        '</span>' +
        '<button class="btn ghost" title="移除">✕</button>';
      li.querySelector(".fname").textContent = it.name;

      var amtIn = li.querySelector(".amti");
      if (amtIn && !isWaiting(it)) {
        if (it.amount == null) amtIn.classList.add("unknown");
        amtIn.addEventListener("change", function () {
          var raw = this.value.replace(/[^0-9.\-]/g, "");
          var v = raw === "" ? NaN : parseFloat(raw);
          if (isFinite(v)) {
            it.amount = Math.round(v * 100) / 100;
            it.moneyState = "manual";
            this.classList.remove("unknown");
            this.value = it.amount.toFixed(2);
          } else {
            it.amount = null;
            it.moneyState = "miss";
            this.classList.add("unknown");
            this.value = "";
          }
          updateTotal();
        });
      }

      li.querySelector("button").addEventListener("click", function () { removeItem(it.id); });
      el.list.appendChild(li);
    });

    el.listempty.classList.toggle("hidden", arr.length > 0);
    el.count.textContent = arr.length + " 份 · " + totalPages + " 张发票页";
    var ok = arr.length > 0 && arr.some(function (x) { return !x.error; });
    el.run.disabled = !ok;
    el.open.disabled = !ok;
    el.namebox.classList.toggle("hidden", arr.length === 0);

    var p = readParams();
    var usable = arr.reduce(function (s, x) { return s + (x.error ? 0 : (p.skipEmpty ? usablePages(x) : x.pages)); }, 0);
    var sheets = Math.ceil(usable / p.perPage) || 0;
    if (arr.length) {
      setMsg("将输出 " + sheets + " 张 " + (p.portrait ? "纵向" : "横向") +
        el.paper.options[el.paper.selectedIndex].text.split("（")[0] + "，共 " + usable + " 张发票页。");
    }
    updateTotal();
    renderStats();
  }

  function usablePages(it) {
    var skip = readParams().skipEmpty ? it.blankIdx.length : 0;
    return Math.max(0, it.pages - skip);
  }

  function removeItem(id) {
    items = items.filter(function (x) { return x.id !== id; });
    renderList();
  }

  /* ---------- 载入文件 ---------- */
  async function addFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    if (!files.length) return;
    clearAlerts();
    var loaded = 0;
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (!/\.pdf$/i.test(f.name) && f.type !== "application/pdf") {
        toast("已跳过非 PDF 文件：" + f.name);
        continue;
      }
      setMsg("正在读取 " + f.name + " …");
      try {
        var buf = await f.arrayBuffer();
        var doc = await LIB.PDFDocument.load(buf, { ignoreEncryption: true, updateMetadata: false });
        var pages = doc.getPageCount();
        items.push({
          id: "f" + (++seq), name: f.name, size: f.size,
          lastModified: f.lastModified || 0, pages: pages, doc: doc,
          bytes: buf, blankIdx: blankPagesOf(doc),
          amounts: null, amount: null,
          moneyState: PDFJS ? "pending" : "miss"
        });
        loaded++;
      } catch (e) {
        toast("读取失败：" + f.name + "（" + (e && e.message ? e.message : "未知错误") + "）");
      }
    }
    setMsg(loaded ? "已加入 " + loaded + " 个文件。" : "没有可用文件。", loaded ? "ok" : "err");
    if (loaded) refreshOutName();
    renderList();
    scanAmounts();
  }

  /* 后台逐份识别金额；识别失败只是留空可手填，绝不影响合并 */
  var scanning = false;
  async function scanAmounts() {
    if (scanning) return;
    scanning = true;
    try {
      for (;;) {
        var todo = items.filter(function (x) { return x.moneyState === "pending"; });
        if (!todo.length) break;
        todo.forEach(function (x) { x.moneyState = "doing"; });
        renderList();
        for (var i = 0; i < todo.length; i++) {
          var it = todo[i], per = await readAmounts(it);
          if (per && per.some(function (v) { return v !== null && v !== ""; })) {
            it.amounts = per;
            it.moneyState = "done";
            it.amount = Math.round(per.reduce(function (s, v) {
              var n = (v === null || v === "") ? 0 : parseFloat(v);
              return s + (isFinite(n) ? n : 0);
            }, 0) * 100) / 100;
          } else {
            it.amounts = per;
            it.amount = null;
            it.moneyState = "miss";
          }
          renderList();
        }
      }
    } finally {
      scanning = false;
    }
    var arr = items.filter(function (x) { return !x.error; });
    if (!arr.length) return;
    var miss = arr.filter(function (x) { return x.amount == null; }).length;
    refreshOutName();
    setMsg("金额识别完成" + (miss ? "，另有 " + miss + " 张未识别，可在列表中直接填写。"
      : "，可修改下方文件名后合并。"), miss ? "" : "ok");
  }

  /* 找出内容流为空的页（多数扫描/导出流程留下的空白页） */
  function blankPagesOf(doc) {
    var idx = [];
    try {
      for (var i = 0; i < doc.getPageCount(); i++) {
        var c = doc.getPage(i).node.normalizedEntries().Contents;
        if (!c || c.size() === 0) idx.push(i);
      }
    } catch (e) { return []; }
    return idx;
  }

  /* ---------- 合并核心 ---------- */
  function normDeg(a) { return ((a % 360) + 360) % 360; }

  async function paginate(itemsArr, p) {
    var units = [];
    for (var i = 0; i < itemsArr.length; i++) {
      var it = itemsArr[i];
      var skip = p.skipEmpty ? it.blankIdx : [];
      for (var j = 0; j < it.pages; j++) {
        if (skip.indexOf(j) >= 0) continue;
        units.push({ doc: it.doc, idx: j });
      }
    }
    return units;
  }

  /* 把「显示方向」的裁剪量换算回页面原始坐标，生成裁剪后的嵌入页 */
  async function embedCropped(out, doc, idx, srcPage, rot, p) {
    var mm = function (v) { return v * PT_PER_MM; };
    var dt = mm(p.cropT), db = mm(p.cropB), dl = mm(p.cropL), dr = mm(p.cropR);
    var fallback = async function () { var r = await out.embedPdf(doc, [idx]); return r[0]; };
    if (!dt && !db && !dl && !dr) return fallback();

    var W = srcPage.getWidth(), H = srcPage.getHeight();
    var l, b, r, t;
    if (rot === 90) { l = dt; b = dl; r = W - db; t = H - dr; }
    else if (rot === 180) { l = dr; b = dt; r = W - dl; t = H - db; }
    else if (rot === 270) { l = db; b = dr; r = W - dt; t = H - dl; }
    else { l = dl; b = db; r = W - dr; t = H - dt; }
    if (r - l < 1 || t - b < 1) return fallback();   // 裁过头了，退回不裁
    return out.embedPage(srcPage, { left: l, bottom: b, right: r, top: t });
  }

  /* 分割裁剪线：画在格子间隙中线并延伸到纸张边缘，可直接照线裁切 */
  function drawCutLines(page, p, pw, ph, m, gap, cellW, cellH) {
    if (p.cutMode === "none") return;
    var col = LIB.rgb(0.58, 0.61, 0.67);
    var dash = p.cutDash ? [3, 3] : undefined;
    var r, c, i, x, y;
    if (p.cutMode === "cell") {
      for (r = 0; r < p.rows; r++) {
        for (c = 0; c < p.cols; c++) {
          page.drawRectangle({
            x: m + c * (cellW + gap), y: ph - m - r * (cellH + gap) - cellH,
            width: cellW, height: cellH,
            borderColor: col, borderWidth: 0.5,
            borderDashArray: dash, borderDashPhase: 0
          });
        }
      }
      return;
    }
    for (i = 1; i < p.cols; i++) {
      x = m + i * cellW + (i - 0.5) * gap;
      page.drawLine({
        start: { x: x, y: 0 }, end: { x: x, y: ph },
        thickness: 0.5, color: col, dashArray: dash, dashPhase: 0
      });
    }
    for (i = 1; i < p.rows; i++) {
      y = m + i * cellH + (i - 0.5) * gap;
      page.drawLine({
        start: { x: 0, y: y }, end: { x: pw, y: y },
        thickness: 0.5, color: col, dashArray: dash, dashPhase: 0
      });
    }
    if (p.cutOuter) {
      page.drawRectangle({
        x: m, y: m, width: pw - 2 * m, height: ph - 2 * m,
        borderColor: col, borderWidth: 0.5,
        borderDashArray: dash, borderDashPhase: 0
      });
    }
  }

  async function build() {
    var p = readParams();
    var arr = sortedItems().filter(function (x) { return !x.error; });
    if (!arr.length) throw new Error("没有可合并的文件。");

    var units = await paginate(arr, p);
    var out = await LIB.PDFDocument.create();
    var mm = function (v) { return v * PT_PER_MM; };
    var pw = mm(p.paperW), ph = mm(p.paperH);
    var m = mm(p.margin), gap = mm(p.gap);
    var availW = pw - 2 * m, availH = ph - 2 * m;
    var cellW = (availW - (p.cols - 1) * gap) / p.cols;
    var cellH = (availH - (p.rows - 1) * gap) / p.rows;
    var per = p.rows * p.cols;
    var sheets = Math.ceil(units.length / per);

    el.prog.classList.remove("hidden");
    el.progbar.style.width = "0%";

    for (var s = 0; s < sheets; s++) {
      var page = out.addPage([pw, ph]);
      for (var k = 0; k < per; k++) {
        var u = units[s * per + k];
        if (!u) break;
        var srcPage = u.doc.getPage(u.idx);
        var rot = normDeg(srcPage.getRotation().angle);
        var theta = (360 - rot) % 360;               // PDF 的 /Rotate 是顺时针，pdf-lib 的 rotate 是逆时针
        var emb = await embedCropped(out, u.doc, u.idx, srcPage, rot, p);
        var bW = emb.width, bH = emb.height;          // 裁剪后、未旋转的内容尺寸
        var swapped = (rot === 90 || rot === 270);
        var vw0 = swapped ? bH : bW;                  // 视觉宽高（缩放系数为 1 时）
        var vh0 = swapped ? bW : bH;

        var a, b;                                     // a = 沿视觉宽的缩放，b = 沿视觉高的缩放
        if (p.scaleMode === "fill") { a = cellW / vw0; b = cellH / vh0; }
        else if (p.scaleMode === "actual") { a = 1; b = 1; }
        else { var kk = Math.min(cellW / vw0, cellH / vh0); a = kk; b = kk; }

        var VW = vw0 * a, VH = vh0 * b;
        var row = Math.floor(k / p.cols), col = k % p.cols;
        var cellX = m + col * (cellW + gap);
        var cellY = ph - m - row * (cellH + gap) - cellH;
        var X = cellX + (cellW - VW) / 2;             // 视觉左下角
        var Y = cellY + (cellH - VH) / 2;

        var sx, sy, dx, dy;
        if (theta === 0) { sx = a; sy = b; dx = X; dy = Y; }
        else if (theta === 90) { sx = b; sy = a; dx = X + VW; dy = Y; }
        else if (theta === 180) { sx = a; sy = b; dx = X + VW; dy = Y + VH; }
        else { sx = b; sy = a; dx = X; dy = Y + VH; }

        page.drawPage(emb, {
          x: dx, y: dy, xScale: sx, yScale: sy,
          rotate: LIB.degrees(theta)
        });
      }
      drawCutLines(page, p, pw, ph, m, gap, cellW, cellH);
      el.progbar.style.width = (((s + 1) / sheets) * 100).toFixed(0) + "%";
      setMsg("正在排版：第 " + (s + 1) + " / " + sheets + " 张纸…");
      if (s % 8 === 7) await new Promise(function (r) { setTimeout(r, 0); });
    }

    var bytes = await out.save();
    return { bytes: bytes, sheets: sheets, units: units.length };
  }

  /* ---------- 输出 ---------- */
  function makeBlob(bytes) {
    if (lastUrl) { URL.revokeObjectURL(lastUrl); lastUrl = null; }
    lastBlob = new Blob([bytes], { type: "application/pdf" });
    lastUrl = URL.createObjectURL(lastBlob);
    return lastUrl;
  }

  async function run(download) {
    el.run.disabled = true; el.open.disabled = true;
    try {
      var p = readParams();
      var r = await build();
      makeBlob(r.bytes);
      setMsg("完成：共 " + r.sheets + " 张纸，" + r.units + " 张发票页，" +
        fmtSize(r.bytes.byteLength) + "。", "ok");
      /* 计入累计工作量：预览与下载都算一次合并（同批预览后再下载会各计一次） */
      stats.merges += 1;
      stats.invoices += r.units;
      renderStats();

      if (download) {
        var a = document.createElement("a");
        a.href = lastUrl;
        a.download = p.outname.replace(/\.pdf$/i, "") + ".pdf";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      } else {
        window.open(lastUrl, "_blank");
      }
    } catch (e) {
      setMsg("合并失败：" + (e && e.message ? e.message : "未知错误"), "err");
      console.error(e);
    } finally {
      el.prog.classList.add("hidden");
      renderList();
    }
  }

  /* ---------- 事件 ---------- */
  el.drop.addEventListener("click", function () { el.picker.click(); });
  el.drop.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.picker.click(); }
  });
  el.picker.addEventListener("change", function () { addFiles(el.picker.files); el.picker.value = ""; });

  ["dragenter", "dragover"].forEach(function (ev) {
    el.drop.addEventListener(ev, function (e) { e.preventDefault(); el.drop.classList.add("over"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    el.drop.addEventListener(ev, function (e) { e.preventDefault(); el.drop.classList.remove("over"); });
  });
  el.drop.addEventListener("drop", function (e) {
    if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
  });
  document.addEventListener("dragover", function (e) { e.preventDefault(); });
  document.addEventListener("drop", function (e) {
    if (e.target.closest && e.target.closest("#drop")) return;
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  });

  el.clear.addEventListener("click", function () {
    items = []; clearAlerts(); renderList(); setMsg("已清空。");
  });
  el.reset.addEventListener("click", function () {
    el.perPage.value = "4"; el.paper.value = "a4"; el.scale.value = "contain";
    el.margin.value = 8; el.gap.value = 4;
    el.cropT.value = 0; el.cropB.value = 0; el.cropL.value = 0; el.cropR.value = 0;
    el.cutMode.value = "cross"; el.cutOuter.checked = false;
    setCutDash("dash");
    el.skipEmpty.checked = true;
    setMode("portrait");
    outnameEdited = false;
    refreshOutName();
    setMsg("已恢复默认参数。");
  });

  function setCutDash(v) {
    el.cutDash.querySelectorAll("button").forEach(function (b) {
      b.classList.toggle("on", b.dataset.v === v);
    });
    renderPreview();
  }

  [el.perPage, el.paper, el.scale, el.margin, el.gap, el.cutMode, el.cutOuter, el.skipEmpty,
   el.cropT, el.cropB, el.cropL, el.cropR].forEach(function (n) {
    n.addEventListener("change", function () { renderPreview(); renderList(); });
    n.addEventListener("input", function () { renderPreview(); });
  });
  el.cutDash.querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () { setCutDash(b.dataset.v); });
  });
  el.sort.addEventListener("change", renderList);
  el.run.addEventListener("click", function () { run(true); });
  el.open.addEventListener("click", function () { run(false); });

  el.orient.querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () { setMode(b.dataset.v); renderList(); });
  });

  /* 列表内拖拽排序 */
  var dragId = null;
  el.list.addEventListener("dragstart", function (e) {
    var li = e.target.closest("li"); if (!li) return;
    dragId = li.dataset.id; li.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", dragId); } catch (x) {}
  });
  el.list.addEventListener("dragend", function () {
    dragId = null;
    el.list.querySelectorAll("li").forEach(function (li) {
      li.classList.remove("dragging", "dropbefore", "dropafter");
    });
  });
  el.list.addEventListener("dragover", function (e) {
    var li = e.target.closest("li"); if (!li || !dragId || li.dataset.id === dragId) return;
    e.preventDefault();
    var r = li.getBoundingClientRect();
    var after = (e.clientY - r.top) > r.height / 2;
    el.list.querySelectorAll("li").forEach(function (x) { x.classList.remove("dropbefore", "dropafter"); });
    li.classList.add(after ? "dropafter" : "dropbefore");
  });
  el.list.addEventListener("drop", function (e) {
    var li = e.target.closest("li"); if (!li || !dragId || li.dataset.id === dragId) return;
    e.preventDefault(); e.stopPropagation();
    var r = li.getBoundingClientRect();
    var after = (e.clientY - r.top) > r.height / 2;
    var from = items.findIndex(function (x) { return x.id === dragId; });
    var targetId = li.dataset.id;
    // 以当前显示顺序为基准重排，之后再切回“上传顺序”
    var order = sortedItems().map(function (x) { return x.id; });
    var fi = order.indexOf(dragId);
    order.splice(fi, 1);
    var ti = order.indexOf(targetId) + (after ? 1 : 0);
    order.splice(ti, 0, dragId);
    el.sort.value = "file";
    var map = {};
    items.forEach(function (x) { map[x.id] = x; });
    items = order.map(function (id) { return map[id]; });
    renderList();
  });

  /* 输出文件名：两处输入框任一处改动都同步到另一处 */
  [el.outname, el.outnameBar].forEach(function (n) {
    n.addEventListener("input", function () {
      outnameEdited = true;
      var other = (n === el.outname) ? el.outnameBar : el.outname;
      if (other.value !== n.value) other.value = n.value;
    });
  });

  /* 初始化 */
  applyOutName(defaultOutName());
  setMode("portrait");
  renderPreview();
  renderList();
  setMsg("拖入发票 PDF 后即可合并。");

  /* 窗口尺寸变化时重算预览尺寸（预览随右栏可用空间缩放） */
  var _rz;
  window.addEventListener("resize", function () {
    clearTimeout(_rz);
    _rz = setTimeout(renderPreview, 80);
  });
})();
