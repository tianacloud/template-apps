
/* ============================================================
   图纸气泡图编制工具 — 核心逻辑
   ============================================================ */
(function() {
  'use strict';

  // pdf.js worker
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.mjs', import.meta.url).href;
  }

  // ===== 全局状态 =====
  const state = {
    pages: [],            // {canvas, width, height, bubbles:[]}
    currentPage: 0,
    zoom: 1,
    mode: 'select',       // select | add
    addStep: 0,           // 0:选引线端点  1:选气泡中心
    tempAnchor: null,
    selectedId: null,
    drag: null,           // {type:'bubble'|'anchor', id, offsetX, offsetY}
    color: '#dc2626',
    size: 18,
    shape: 'circle',      // circle | ellipse | square | triangle | arrow
    history: [],
    historyIndex: -1,
    nextId: 1,
    pdfDoc: null,
    // 画布平移
    spacePressed: false,
    panning: false,
    panStart: null,   // {x, y, scrollLeft, scrollTop}
  };

  // ===== DOM 引用 =====
  const $ = id => document.getElementById(id);
  const fileInput = $('fileInput');
  const bgCanvas = $('bgCanvas');
  const bubbleCanvas = $('bubbleCanvas');
  const bgCtx = bgCanvas.getContext('2d');
  const bCtx = bubbleCanvas.getContext('2d');
  const canvasWrap = $('canvasWrap');
  const canvasScroll = $('canvasScroll');
  const hintBar = $('hintBar');
  const loadingMask = $('loadingMask');
  const loadingText = $('loadingText');

  // ===== 页面原始数据 =====
  // 导出时优先复用「原文件页面本身」（矢量/原始压缩流），只叠加气泡层，
  // 避免整页重新栅格化导致导出的 PDF 比原文件大十几倍。
  // 结构：{ kind:'image', mime, data }  或  { kind:'url', url }
  function setPageRaw(page, raw) {
    page.src = raw;
    page.srcUrl = raw && raw.kind === 'url' ? raw.url : null;
  }
  function revokePageRaw(page) {
    if (!page) return;
    if (page.srcUrl) {
      try { URL.revokeObjectURL(page.srcUrl); } catch (e) {}
      page.srcUrl = null;
    }
    if (page.layerUrl) {
      try { URL.revokeObjectURL(page.layerUrl); } catch (e) {}
      page.layerUrl = null;
    }
  }
  // 取原始页面数据（惰性生成；已生成的会缓存复用）
  async function getPageRaw(page) {
    if (page.src) return page.src;
    // 已经有渲染好的页面位图，按原始分辨率导出为高质量 JPEG，不做任何降采样
    const blob = await new Promise(r => page.canvas.toBlob(r, 'image/jpeg', 0.98));
    page.src = { kind: 'image', mime: 'image/jpeg', data: new Uint8Array(await blob.arrayBuffer()) };
    return page.src;
  }

  // ===== 工具函数 =====
  function showHint(text, warn, duration) {
    hintBar.textContent = text;
    hintBar.className = 'hint-bar' + (warn ? ' warn' : '');
    hintBar.style.display = 'block';
    if (duration) setTimeout(() => { hintBar.style.display = 'none'; }, duration);
  }
  function hideHint() { hintBar.style.display = 'none'; }
  function showLoading(text) { loadingText.textContent = text || '加载中...'; loadingMask.classList.add('show'); }
  function hideLoading() { loadingMask.classList.remove('show'); }

  function snapShot() {
    // 保存所有页气泡的深拷贝
    return state.pages.map(p => p.bubbles.map(b => ({...b})));
  }
  function pushHistory() {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(snapShot());
    state.historyIndex++;
    if (state.history.length > 50) { state.history.shift(); state.historyIndex--; }
    updateHistoryBtns();
  }
  function restoreHistory(idx) {
    const snap = state.history[idx];
    if (!snap) return;
    state.pages.forEach((p, i) => { p.bubbles = (snap[i] || []).map(b => ({...b})); });
    state.historyIndex = idx;
    state.selectedId = null;
    renderBubbles();
    renderBubbleList();
    updateHistoryBtns();
  }
  function updateHistoryBtns() {
    $('btnUndo').disabled = state.historyIndex <= 0;
    $('btnRedo').disabled = state.historyIndex >= state.history.length - 1;
  }

  // ===== 文件加载 =====
  function handleFile(file) {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf')) {
      loadPDF(file);
    } else if (/\.(png|jpe?g|bmp|webp)$/.test(name)) {
      loadImage(file);
    } else if (/\.(tif|tiff)$/.test(name)) {
      loadTIFF(file);
    } else if (name.endsWith('.dxf')) {
      loadDXF(file);
    } else if (name.endsWith('.dwg')) {
      showHint('DWG 格式需在 AutoCAD 中另存为 DXF 后再打开', true, 4000);
    } else {
      showHint('不支持的文件格式，请使用 PDF / 图片 / TIF / DXF', true, 3000);
    }
  }

  function loadImage(file) {
    showLoading('读取图片...');
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        const pg = { canvas, width: img.naturalWidth, height: img.naturalHeight, bubbles: [] };
        // 原图字节直接嵌入导出 PDF，不重新栅格化、不重压缩
        setPageRaw(pg, { kind: 'url', url: URL.createObjectURL(file) });
        pg.srcMime = file.type || 'image/jpeg';
        state.pages = [pg];
        state.currentPage = 0;
        state.pdfDoc = null;
        finishLoad();
        hideLoading();
      };
      img.onerror = () => { hideLoading(); showHint('图片加载失败', true, 3000); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ===== 加载 TIFF =====
  function loadTIFF(file) {
    showLoading('解析TIFF...');
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const buffer = e.target.result;
        const ifds = UTIF.decode(buffer);
        if (!ifds || ifds.length === 0) throw new Error('TIFF解析失败');
        UTIF.decodeImage(buffer, ifds[0], ifds);
        // 取第一页（多页TIFF只取第一页，后续可扩展）
        const ifd = ifds[0];
        const rgba = UTIF.toRGBA8(ifd);
        const w = ifd.width, h = ifd.height;
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(w, h);
        imgData.data.set(rgba);
        ctx.putImageData(imgData, 0, 0);
        const pg = { canvas, width: w, height: h, bubbles: [] };
        pg.srcMime = 'image/png';
        state.pages = [pg];
        state.currentPage = 0;
        state.pdfDoc = null;
        finishLoad();
        hideLoading();
        if (ifds.length > 1) showHint(`TIFF共${ifds.length}页，已显示第1页`, false, 3000);
      } catch (err) {
        console.error(err);
        hideLoading();
        showHint('TIFF加载失败：' + (err.message || err), true, 4000);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // ===== 加载 DXF (CAD) =====
  function loadDXF(file) {
    showLoading('解析CAD图纸...');
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target.result;
        const parser = new DxfParser();
        const dxf = parser.parseSync(text);
        if (!dxf || !dxf.entities) throw new Error('DXF文件无有效实体');
        const canvas = renderDXF(dxf);
        const pg = { canvas, width: canvas.width, height: canvas.height, bubbles: [] };
        pg.srcMime = 'image/png';
        state.pages = [pg];
        state.currentPage = 0;
        state.pdfDoc = null;
        finishLoad();
        hideLoading();
      } catch (err) {
        console.error(err);
        hideLoading();
        showHint('DXF加载失败：' + (err.message || err), true, 4000);
      }
    };
    reader.readAsText(file);
  }

  // DXF渲染到canvas
  function renderDXF(dxf) {
    const entities = dxf.entities;
    // 计算边界
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    function expand(x, y) {
      if (x == null || y == null || isNaN(x) || isNaN(y)) return;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    function expandEntity(ent) {
      if (!ent) return;
      switch (ent.type) {
        case 'LINE':
          (ent.vertices || [ent.startPoint, ent.endPoint]).filter(Boolean).forEach(v => expand(v.x, v.y));
          break;
        case 'CIRCLE':
          expand(ent.center.x - ent.radius, ent.center.y - ent.radius);
          expand(ent.center.x + ent.radius, ent.center.y + ent.radius);
          break;
        case 'ARC':
        case 'ELLIPSE':
          if (ent.center) {
            const r = ent.radius || (ent.majorAxisRadius ? ent.majorAxisRadius * 2 : 10);
            expand(ent.center.x - r, ent.center.y - r);
            expand(ent.center.x + r, ent.center.y + r);
          }
          break;
        case 'LWPOLYLINE':
        case 'POLYLINE':
          if (ent.vertices) ent.vertices.forEach(v => expand(v.x, v.y));
          break;
        case 'TEXT':
        case 'MTEXT':
          if (ent.startPoint) expand(ent.startPoint.x, ent.startPoint.y);
          if (ent.position) expand(ent.position.x, ent.position.y);
          break;
        case 'DIMENSION':
          if (ent.startPoint) expand(ent.startPoint.x, ent.startPoint.y);
          if (ent.endPoint) expand(ent.endPoint.x, ent.endPoint.y);
          if (ent.middleOfText) expand(ent.middleOfText.x, ent.middleOfText.y);
          break;
        case 'POINT':
          if (ent.position) expand(ent.position.x, ent.position.y);
          break;
        case 'SOLID':
        case 'HATCH':
          if (ent.points) ent.points.forEach(p => expand(p.x, p.y));
          break;
        case 'INSERT':
          if (ent.position) expand(ent.position.x, ent.position.y);
          break;
      }
    }
    entities.forEach(expandEntity);
    if (!isFinite(minX) || !isFinite(maxX)) {
      minX = 0; minY = 0; maxX = 100; maxY = 100;
    }
    // 边距
    const pad = Math.max((maxX - minX), (maxY - minY)) * 0.05 + 5;
    minX -= pad; minY -= pad; maxX += pad; maxY += pad;
    const dw = maxX - minX, dh = maxY - minY;
    // canvas尺寸（最大边2000px）
    const maxDim = 2000;
    let cw, ch;
    if (dw >= dh) { cw = maxDim; ch = Math.round(maxDim * dh / dw); }
    else { ch = maxDim; cw = Math.round(maxDim * dw / dh); }
    cw = Math.max(cw, 100); ch = Math.max(ch, 100);
    const canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d');
    // 白底
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cw, ch);
    // 坐标变换：DXF(y向上) -> canvas(y向下)
    const sx = cw / dw, sy = ch / dh;
    function tx(x) { return (x - minX) * sx; }
    function ty(y) { return ch - (y - minY) * sy; }
    // 颜色映射（ACI颜色索引）
    function aciColor(idx) {
      const map = {1:'#ff0000',2:'#ffff00',3:'#00ff00',4:'#00ffff',5:'#0000ff',6:'#ff00ff',7:'#000000',8:'#808080',9:'#c0c0c0'};
      return map[idx] || '#000000';
    }
    ctx.strokeStyle = '#1a1a1a';
    ctx.fillStyle = '#1a1a1a';
    ctx.lineWidth = Math.max(0.5, cw / 1500);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function drawEntity(ent) {
      if (!ent) return;
      const col = aciColor(ent.colorIndex);
      ctx.strokeStyle = col;
      ctx.fillStyle = col;
      switch (ent.type) {
        case 'LINE': {
          ctx.beginPath();
          const points = ent.vertices || [ent.startPoint, ent.endPoint];
          if (!points[0] || !points[1]) break;
          ctx.moveTo(tx(points[0].x), ty(points[0].y));
          ctx.lineTo(tx(points[1].x), ty(points[1].y));
          ctx.stroke();
          break;
        }
        case 'CIRCLE': {
          ctx.beginPath();
          ctx.arc(tx(ent.center.x), ty(ent.center.y), ent.radius * sx, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'ARC': {
          const sa = ent.startAngle || 0, ea = ent.endAngle || Math.PI * 2;
          ctx.beginPath();
          // canvas角度顺时针，DXF逆时针；翻转后方向要注意
          ctx.arc(tx(ent.center.x), ty(ent.center.y), ent.radius * sx, -ea, -sa);
          ctx.stroke();
          break;
        }
        case 'ELLIPSE': {
          if (ent.center && ent.majorAxisEndPoint && ent.axisRatio != null) {
            const mx = ent.majorAxisEndPoint.x, my = ent.majorAxisEndPoint.y;
            const majLen = Math.hypot(mx, my) * 2;
            const minLen = majLen * ent.axisRatio;
            const ang = Math.atan2(my, mx);
            ctx.beginPath();
            ctx.ellipse(tx(ent.center.x), ty(ent.center.y), majLen/2*sx, minLen/2*sy, -ang, 0, Math.PI*2);
            ctx.stroke();
          }
          break;
        }
        case 'LWPOLYLINE':
        case 'POLYLINE': {
          if (!ent.vertices || ent.vertices.length < 2) break;
          ctx.beginPath();
          ent.vertices.forEach((v, i) => {
            const px = tx(v.x), py = ty(v.y);
            if (i === 0) ctx.moveTo(px, py);
            else {
              // 处理bulge弧
              const prev = ent.vertices[i-1];
              if (prev.bulge && prev.bulge !== 0) {
                const bulge = prev.bulge;
                const x1 = prev.x, y1 = prev.y, x2 = v.x, y2 = v.y;
                const dx = x2 - x1, dy = y2 - y1;
                const chordLen = Math.hypot(dx, dy);
                if (chordLen > 0) {
                  const sag = bulge * chordLen / 2;
                  const midX = (x1+x2)/2, midY = (y1+y2)/2;
                  const perpX = -dy / chordLen, perpY = dx / chordLen;
                  const cx = midX - perpX * sag * (1 - bulge*bulge/4) / bulge;
                  const cy = midY - perpY * sag * (1 - bulge*bulge/4) / bulge;
                  const r = chordLen * (1 + bulge*bulge) / (4 * Math.abs(bulge));
                  const a1 = Math.atan2(y1-cy, x1-cx);
                  const a2 = Math.atan2(y2-cy, x2-cx);
                  ctx.arc(tx(cx), ty(cy), r*sx, -a1, -a2, bulge > 0);
                } else { ctx.lineTo(px, py); }
              } else {
                ctx.lineTo(px, py);
              }
            }
          });
          if (ent.shape === true || ent.closed) ctx.closePath();
          ctx.stroke();
          break;
        }
        case 'TEXT':
        case 'MTEXT': {
          const pos = ent.startPoint || ent.position;
          if (!pos) break;
          let txt = ent.text || '';
          if (ent.type === 'MTEXT' && ent.text) {
            txt = ent.text.replace(/\\P/g, '\n').replace(/[{}]/g, '').replace(/\\[a-zA-Z][^;]*;/g, '');
          }
          const h = (ent.height || ent.textHeight || 2.5) * sy * 1.2;
          ctx.font = `${h}px "Segoe UI", "Microsoft YaHei", sans-serif`;
          ctx.textBaseline = 'alphabetic';
          const rot = ent.rotation || 0;
          ctx.save();
          ctx.translate(tx(pos.x), ty(pos.y));
          ctx.rotate(-rot * Math.PI / 180);
          const lines = String(txt).split('\n');
          lines.forEach((line, i) => {
            ctx.fillText(line, 0, i * h);
          });
          ctx.restore();
          break;
        }
        case 'DIMENSION': {
          // 简化：只画尺寸线和文字
          if (ent.middleOfText && ent.text) {
            const h = (ent.textHeight || 2.5) * sy * 1.2;
            ctx.font = `${h}px "Segoe UI", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ent.text, tx(ent.middleOfText.x), ty(ent.middleOfText.y));
          }
          break;
        }
        case 'POINT': {
          if (ent.position) {
            ctx.beginPath();
            ctx.arc(tx(ent.position.x), ty(ent.position.y), Math.max(1, cw/500), 0, Math.PI*2);
            ctx.fill();
          }
          break;
        }
        case 'SOLID':
        case 'HATCH': {
          if (ent.points && ent.points.length >= 3) {
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            ent.points.forEach((p, i) => {
              if (i === 0) ctx.moveTo(tx(p.x), ty(p.y));
              else ctx.lineTo(tx(p.x), ty(p.y));
            });
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          break;
        }
      }
    }
    entities.forEach(drawEntity);
    return canvas;
  }

  async function loadPDF(file) {
    showLoading('解析PDF...');
    try {
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      state.pdfDoc = pdf;
      state.pages = [];
      const total = pdf.numPages;
      for (let i = 1; i <= total; i++) {
        loadingText.textContent = `渲染页面 ${i}/${total}...`;
        const page = await pdf.getPage(i);
        // 3倍高清渲染，放大后不模糊
        const viewport = page.getViewport({ scale: 3 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        state.pages.push({ canvas, width: viewport.width, height: viewport.height, bubbles: [] });
      }
      state.currentPage = 0;
      finishLoad();
      hideLoading();
    } catch (err) {
      console.error(err);
      hideLoading();
      showHint('PDF 加载失败：' + (err.message || err), true, 4000);
    }
  }

  function finishLoad() {
    $('welcome').style.display = 'none';
    canvasWrap.style.display = 'block';
    state.history = [];
    state.historyIndex = -1;
    state.nextId = 1;
    state.selectedId = null;
    pushHistory();
    fitToWindow();
    renderPageList();
    renderCurrentPage();
    renderBubbleList();
    updateToolBtns();
    updateCloseFileBtn();
    showHint('文件已加载，点击"添加气泡"开始标注（放大后按住空格拖拽可平移画布）', false, 4000);
  }

  function updateToolBtns() {
    const hasFile = state.pages.length > 0;
    const hasBubbles = state.pages.some(p => p.bubbles.length > 0);
    $('btnAddBubble').disabled = !hasFile;
    $('btnExportPNG').disabled = !hasFile;
    $('btnExportPDF').disabled = !hasFile;
    $('btnRenumber').disabled = !hasBubbles;
    $('btnDelete').disabled = !state.selectedId;
  }

  // ===== 页面渲染 =====
  function renderCurrentPage() {
    const page = state.pages[state.currentPage];
    if (!page) return;
    bgCanvas.width = page.width;
    bgCanvas.height = page.height;
    bgCtx.drawImage(page.canvas, 0, 0);
    applyZoom();
    renderBubbles();
  }

  function applyZoom() {
    const page = state.pages[state.currentPage];
    if (!page) return;
    const w = Math.round(page.width * state.zoom);
    const h = Math.round(page.height * state.zoom);
    canvasWrap.style.width = w + 'px';
    canvasWrap.style.height = h + 'px';
    bgCanvas.style.width = w + 'px';
    bgCanvas.style.height = h + 'px';
    bubbleCanvas.style.width = w + 'px';
    bubbleCanvas.style.height = h + 'px';
    bubbleCanvas.width = page.width;
    bubbleCanvas.height = page.height;
    $('zoomVal').textContent = Math.round(state.zoom * 100) + '%';
  }

  function fitToWindow() {
    const page = state.pages[state.currentPage];
    if (!page) return;
    const availW = canvasScroll.clientWidth - 60;
    const availH = canvasScroll.clientHeight - 60;
    state.zoom = Math.min(availW / page.width, availH / page.height, 2);
    state.zoom = Math.max(state.zoom, 0.1);
  }

  // ===== 气泡绘制 =====
  function renderBubbles() {
    const page = state.pages[state.currentPage];
    if (!page) return;
    bCtx.clearRect(0, 0, bubbleCanvas.width, bubbleCanvas.height);
    for (const b of page.bubbles) {
      drawBubble(b, b.id === state.selectedId);
    }
    // 添加模式临时引线
    if (state.mode === 'add' && state.addStep === 1 && state.tempAnchor) {
      bCtx.strokeStyle = state.color;
      bCtx.lineWidth = 1.5;
      bCtx.setLineDash([4, 3]);
      bCtx.beginPath();
      bCtx.moveTo(state.tempAnchor.x, state.tempAnchor.y);
      bCtx.lineTo(state.mouseX || state.tempAnchor.x, state.mouseY || state.tempAnchor.y);
      bCtx.stroke();
      bCtx.setLineDash([]);
      // 临时锚点
      bCtx.fillStyle = state.color;
      bCtx.beginPath();
      bCtx.arc(state.tempAnchor.x, state.tempAnchor.y, 3, 0, Math.PI * 2);
      bCtx.fill();
    }
  }

  function drawBubble(b, selected) {
    const r = b.size;
    const shape = b.shape || 'circle';
    bCtx.lineJoin = 'round';
    bCtx.lineCap = 'round';

    // ===== 箭头类型：箭头本身指向锚点，编号在箭尾圆圈 =====
    if (shape === 'arrow') {
      const dx = b.ax - b.x, dy = b.ay - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 2) {
        const ux = dx / dist, uy = dy / dist;
        const arrowLen = Math.min(dist, r * 2.8);
        const tipX = b.x + ux * arrowLen, tipY = b.y + uy * arrowLen;
        // 箭杆
        bCtx.strokeStyle = b.color;
        bCtx.lineWidth = 2;
        bCtx.beginPath();
        bCtx.moveTo(b.x, b.y);
        bCtx.lineTo(tipX, tipY);
        bCtx.stroke();
        // 箭头三角
        const headLen = r * 0.9;
        const perpX = -uy, perpY = ux;
        bCtx.fillStyle = b.color;
        bCtx.beginPath();
        bCtx.moveTo(tipX, tipY);
        bCtx.lineTo(tipX - ux*headLen + perpX*headLen*0.5, tipY - uy*headLen + perpY*headLen*0.5);
        bCtx.lineTo(tipX - ux*headLen - perpX*headLen*0.5, tipY - uy*headLen - perpY*headLen*0.5);
        bCtx.closePath();
        bCtx.fill();
        // 锚点小圆点
        bCtx.beginPath();
        bCtx.arc(b.ax, b.ay, 2.5, 0, Math.PI * 2);
        bCtx.fill();
      }
      // 箭尾编号圆圈
      const cr = r * 0.85;
      bCtx.beginPath();
      bCtx.arc(b.x, b.y, cr, 0, Math.PI * 2);
      bCtx.fillStyle = '#ffffff';
      bCtx.fill();
      bCtx.strokeStyle = b.color;
      bCtx.lineWidth = selected ? 3 : 2;
      bCtx.stroke();
      if (selected) {
        bCtx.setLineDash([3, 2]);
        bCtx.strokeStyle = '#f59e0b';
        bCtx.lineWidth = 1.5;
        bCtx.beginPath();
        bCtx.arc(b.x, b.y, cr + 4, 0, Math.PI * 2);
        bCtx.stroke();
        bCtx.setLineDash([]);
      }
      bCtx.fillStyle = b.color;
      bCtx.font = `bold ${Math.round(cr * 0.9)}px "Segoe UI", "Microsoft YaHei", sans-serif`;
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      bCtx.fillText(String(b.num), b.x, b.y + 1);
      return;
    }

    // ===== 非箭头类型：引线 + 形状气泡 =====
    // 计算形状边缘点（引线起点）
    const dx = b.ax - b.x, dy = b.ay - b.y;
    const dist = Math.hypot(dx, dy);
    let edgeX = b.x, edgeY = b.y;
    if (dist > 0.1) {
      const ux = dx / dist, uy = dy / dist;
      if (shape === 'ellipse') {
        // 椭圆参数方程求边缘
        const rx = r, ry = r * 0.65;
        const t = Math.atan2(uy * rx, ux * ry);
        edgeX = b.x + rx * Math.cos(t);
        edgeY = b.y + ry * Math.sin(t);
      } else if (shape === 'square') {
        const half = r * 0.9;
        const tx = Math.abs(ux) > 0.001 ? half / Math.abs(ux) : Infinity;
        const ty = Math.abs(uy) > 0.001 ? half / Math.abs(uy) : Infinity;
        const t = Math.min(tx, ty);
        edgeX = b.x + ux * t;
        edgeY = b.y + uy * t;
      } else if (shape === 'triangle') {
        // 三角形近似外接圆边缘
        edgeX = b.x + ux * r;
        edgeY = b.y + uy * r;
      } else {
        edgeX = b.x + ux * r;
        edgeY = b.y + uy * r;
      }
    }
    // 引线
    if (dist > r * 0.3) {
      bCtx.strokeStyle = b.color;
      bCtx.lineWidth = 1.5;
      bCtx.beginPath();
      bCtx.moveTo(edgeX, edgeY);
      bCtx.lineTo(b.ax, b.ay);
      bCtx.stroke();
      bCtx.fillStyle = b.color;
      bCtx.beginPath();
      bCtx.arc(b.ax, b.ay, 2.5, 0, Math.PI * 2);
      bCtx.fill();
    }

    // ===== 绘制形状 =====
    bCtx.fillStyle = '#ffffff';
    bCtx.strokeStyle = b.color;
    bCtx.lineWidth = selected ? 3 : 2;
    bCtx.beginPath();
    if (shape === 'ellipse') {
      bCtx.ellipse(b.x, b.y, r, r * 0.65, 0, 0, Math.PI * 2);
    } else if (shape === 'square') {
      const half = r * 0.9;
      const rad = r * 0.18;
      roundRectPath(bCtx, b.x - half, b.y - half, half * 2, half * 2, rad);
    } else if (shape === 'triangle') {
      const h = r * 1.15;
      bCtx.moveTo(b.x, b.y - h);
      bCtx.lineTo(b.x - r * 0.95, b.y + h * 0.6);
      bCtx.lineTo(b.x + r * 0.95, b.y + h * 0.6);
      bCtx.closePath();
    } else {
      bCtx.arc(b.x, b.y, r, 0, Math.PI * 2);
    }
    bCtx.fill();
    bCtx.stroke();

    // 选中虚线框
    if (selected) {
      bCtx.setLineDash([3, 2]);
      bCtx.strokeStyle = '#f59e0b';
      bCtx.lineWidth = 1.5;
      bCtx.beginPath();
      if (shape === 'ellipse') {
        bCtx.ellipse(b.x, b.y, r + 4, r * 0.65 + 4, 0, 0, Math.PI * 2);
      } else if (shape === 'square') {
        const half = r * 0.9 + 4;
        roundRectPath(bCtx, b.x - half, b.y - half, half * 2, half * 2, rad + 2);
      } else if (shape === 'triangle') {
        const h = r * 1.15 + 5;
        bCtx.moveTo(b.x, b.y - h);
        bCtx.lineTo(b.x - (r+4) * 0.95, b.y + h * 0.6);
        bCtx.lineTo(b.x + (r+4) * 0.95, b.y + h * 0.6);
        bCtx.closePath();
      } else {
        bCtx.arc(b.x, b.y, r + 4, 0, Math.PI * 2);
      }
      bCtx.stroke();
      bCtx.setLineDash([]);
    }

    // 编号文字
    bCtx.fillStyle = b.color;
    const fontSize = shape === 'triangle' ? Math.round(r * 0.75) : Math.round(r * 0.95);
    bCtx.font = `bold ${fontSize}px "Segoe UI", "Microsoft YaHei", sans-serif`;
    bCtx.textAlign = 'center';
    bCtx.textBaseline = 'middle';
    const textY = shape === 'triangle' ? b.y + r * 0.15 : b.y + 1;
    bCtx.fillText(String(b.num), b.x, textY);
  }

  // 圆角矩形路径
  function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r, w/2, h/2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }

  // ===== 坐标转换 =====
  function getDocPos(e) {
    const rect = bubbleCanvas.getBoundingClientRect();
    const page = state.pages[state.currentPage];
    const x = (e.clientX - rect.left) / state.zoom;
    const y = (e.clientY - rect.top) / state.zoom;
    return { x: Math.max(0, Math.min(page.width, x)), y: Math.max(0, Math.min(page.height, y)) };
  }

  function hitTest(pos) {
    const page = state.pages[state.currentPage];
    if (!page) return null;
    // 从后往前（上层优先）
    for (let i = page.bubbles.length - 1; i >= 0; i--) {
      const b = page.bubbles[i];
      const shape = b.shape || 'circle';
      // 引线端点
      const ad = Math.hypot(pos.x - b.ax, pos.y - b.ay);
      if (ad < b.size * 0.6) return { type: 'anchor', id: b.id };
      // 气泡主体（按形状取有效点击半径）
      const bd = Math.hypot(pos.x - b.x, pos.y - b.y);
      let hitR = b.size;
      if (shape === 'ellipse') hitR = b.size;
      else if (shape === 'square') hitR = b.size * 1.1;
      else if (shape === 'triangle') hitR = b.size * 1.0;
      else if (shape === 'arrow') hitR = b.size * 0.9;
      if (bd < hitR) return { type: 'bubble', id: b.id };
    }
    return null;
  }

  // ===== 鼠标交互 =====
  bubbleCanvas.addEventListener('mousedown', e => {
    // 平移：空格+左键 或 鼠标中键
    if ((e.button === 0 && state.spacePressed) || e.button === 1) {
      e.preventDefault();
      startPanning(e.clientX, e.clientY);
      return;
    }
    if (e.button !== 0) return;
    const pos = getDocPos(e);

    if (state.mode === 'add') {
      if (state.addStep === 0) {
        state.tempAnchor = pos;
        state.addStep = 1;
        showHint('第二步：点击空白处放置气泡编号（按 ESC 取消）');
        renderBubbles();
      } else {
        // 完成添加
        const page = state.pages[state.currentPage];
        const num = getNextNum();
        const bubble = {
          id: state.nextId++,
          num,
          x: pos.x, y: pos.y,
          ax: state.tempAnchor.x, ay: state.tempAnchor.y,
          color: state.color,
          size: state.size,
          shape: state.shape,
          note: ''
        };
        page.bubbles.push(bubble);
        state.tempAnchor = null;
        state.addStep = 0;
        pushHistory();
        renderBubbles();
        renderBubbleList();
        updateToolBtns();
        showHint(`已添加气泡 #${num}，继续点击下一个尺寸位置（ESC 退出）`);
      }
      return;
    }

    // 选择模式
    const hit = hitTest(pos);
    if (hit) {
      state.selectedId = hit.id;
      const b = pageBubble(hit.id);
      state.drag = {
        type: hit.type,
        id: hit.id,
        offsetX: hit.type === 'bubble' ? pos.x - b.x : pos.x - b.ax,
        offsetY: hit.type === 'bubble' ? pos.y - b.y : pos.y - b.ay
      };
      bubbleCanvas.style.cursor = hit.type === 'bubble' ? 'move' : 'crosshair';
    } else {
      state.selectedId = null;
    }
    renderBubbles();
    renderBubbleList();
    updateToolBtns();
  });

  bubbleCanvas.addEventListener('mousemove', e => {
    // 平移中
    if (state.panning && state.panStart) {
      const dx = e.clientX - state.panStart.x;
      const dy = e.clientY - state.panStart.y;
      canvasScroll.scrollLeft = state.panStart.scrollLeft - dx;
      canvasScroll.scrollTop = state.panStart.scrollTop - dy;
      return;
    }
    const pos = getDocPos(e);
    state.mouseX = pos.x;
    state.mouseY = pos.y;

    if (state.drag) {
      const b = pageBubble(state.drag.id);
      if (b) {
        if (state.drag.type === 'bubble') {
          b.x = pos.x - state.drag.offsetX;
          b.y = pos.y - state.drag.offsetY;
        } else {
          b.ax = pos.x - state.drag.offsetX;
          b.ay = pos.y - state.drag.offsetY;
        }
        renderBubbles();
      }
      return;
    }

    if (state.mode === 'add') {
      renderBubbles();
      return;
    }

    // hover 光标
    const hit = hitTest(pos);
    bubbleCanvas.style.cursor = hit ? (hit.type === 'bubble' ? 'move' : 'crosshair') : 'default';
  });

  bubbleCanvas.addEventListener('mouseup', () => {
    if (state.panning) {
      stopPanning();
      return;
    }
    if (state.drag) {
      state.drag = null;
      pushHistory();
      bubbleCanvas.style.cursor = 'default';
    }
  });

  // Touch supplies the same coordinates to the existing drawing and drag handlers.
  let lastTap = 0;
  bubbleCanvas.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    e.preventDefault(); const t=e.touches[0];
    bubbleCanvas.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,button:0,clientX:t.clientX,clientY:t.clientY}));
  }, {passive:false});
  bubbleCanvas.addEventListener('touchmove', e => {
    if(e.touches.length!==1)return; e.preventDefault(); const t=e.touches[0];
    bubbleCanvas.dispatchEvent(new MouseEvent('mousemove',{bubbles:true,button:0,clientX:t.clientX,clientY:t.clientY}));
  }, {passive:false});
  bubbleCanvas.addEventListener('touchend', e => {
    e.preventDefault(); const t=e.changedTouches[0];
    bubbleCanvas.dispatchEvent(new MouseEvent('mouseup',{bubbles:true,button:0,clientX:t.clientX,clientY:t.clientY}));
    const now=Date.now(); if(now-lastTap<350 && state.mode==='select') bubbleCanvas.dispatchEvent(new MouseEvent('dblclick',{bubbles:true,button:0,clientX:t.clientX,clientY:t.clientY})); lastTap=now;
  }, {passive:false});

  bubbleCanvas.addEventListener('dblclick', e => {
    const pos = getDocPos(e);
    const hit = hitTest(pos);
    if (hit && hit.type === 'bubble') {
      openNumModal(hit.id);
    }
  });

  // 键盘
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    // 空格键：进入平移准备状态
    if (e.code === 'Space' && !state.spacePressed) {
      e.preventDefault();
      state.spacePressed = true;
      $('canvasArea').classList.add('space-ready');
    }
    if (e.key === 'Escape') {
      if (state.mode === 'add') {
        exitAddMode();
      } else {
        state.selectedId = null;
        renderBubbles();
        renderBubbleList();
        updateToolBtns();
      }
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedId) {
      e.preventDefault();
      deleteSelected();
    }
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (state.historyIndex > 0) restoreHistory(state.historyIndex - 1);
    }
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
      e.preventDefault();
      if (state.historyIndex < state.history.length - 1) restoreHistory(state.historyIndex + 1);
    }
  });

  // 空格键松开：退出平移准备
  document.addEventListener('keyup', e => {
    if (e.code === 'Space') {
      e.preventDefault();
      state.spacePressed = false;
      $('canvasArea').classList.remove('space-ready');
      if (state.panning) stopPanning();
    }
  });

  // 窗口失焦时重置空格键状态（防止卡住）
  window.addEventListener('blur', () => {
    state.spacePressed = false;
    state.panning = false;
    $('canvasArea').classList.remove('space-ready', 'panning');
  });

  // ===== 画布平移 =====
  function startPanning(clientX, clientY) {
    state.panning = true;
    state.panStart = {
      x: clientX,
      y: clientY,
      scrollLeft: canvasScroll.scrollLeft,
      scrollTop: canvasScroll.scrollTop
    };
    $('canvasArea').classList.add('panning');
    $('canvasArea').classList.remove('space-ready');
  }

  function stopPanning() {
    state.panning = false;
    state.panStart = null;
    $('canvasArea').classList.remove('panning');
    if (state.spacePressed) $('canvasArea').classList.add('space-ready');
  }

  // 全局 mouseup 兜底：拖拽移出画布后松开也能结束平移
  document.addEventListener('mouseup', () => {
    if (state.panning) stopPanning();
  });

  function pageBubble(id) {
    const page = state.pages[state.currentPage];
    return page ? page.bubbles.find(b => b.id === id) : null;
  }

  function getNextNum() {
    let max = 0;
    for (const p of state.pages) for (const b of p.bubbles) {
      const n = parseInt(b.num);
      if (!isNaN(n) && n > max) max = n;
    }
    return max + 1;
  }

  function deleteSelected() {
    if (!state.selectedId) return;
    const page = state.pages[state.currentPage];
    page.bubbles = page.bubbles.filter(b => b.id !== state.selectedId);
    state.selectedId = null;
    pushHistory();
    renderBubbles();
    renderBubbleList();
    updateToolBtns();
  }

  function exitAddMode() {
    state.mode = 'select';
    state.addStep = 0;
    state.tempAnchor = null;
    $('btnAddBubble').classList.remove('active');
    $('btnAddBubble').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>添加气泡';
    hideHint();
    renderBubbles();
  }

  // ===== 编号编辑弹窗 =====
  let editingId = null;
  function openNumModal(id) {
    const b = pageBubble(id);
    if (!b) return;
    editingId = id;
    $('numInput').value = b.num;
    $('numModal').classList.add('show');
    setTimeout(() => $('numInput').focus(), 50);
  }
  $('numCancel').onclick = () => { $('numModal').classList.remove('show'); editingId = null; };
  $('numOk').onclick = () => {
    const b = pageBubble(editingId);
    if (b) {
      b.num = $('numInput').value.trim() || b.num;
      pushHistory();
      renderBubbles();
      renderBubbleList();
    }
    $('numModal').classList.remove('show');
    editingId = null;
  };
  $('numInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') $('numOk').click();
    if (e.key === 'Escape') $('numCancel').click();
  });

  // ===== 页面列表 =====
  function renderPageList() {
    const list = $('pageList');
    if (state.pages.length === 0) {
      list.innerHTML = '<div class="empty-hint">未打开文件</div>';
      return;
    }
    list.innerHTML = '';
    state.pages.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'page-thumb' + (i === state.currentPage ? ' active' : '');
      const c = document.createElement('canvas');
      c.width = 120;
      c.height = Math.round(120 * p.height / p.width);
      c.getContext('2d').drawImage(p.canvas, 0, 0, c.width, c.height);
      div.appendChild(c);
      const pn = document.createElement('span');
      pn.className = 'pn';
      pn.textContent = (i + 1) + '/' + state.pages.length;
      div.appendChild(pn);
      // 关闭单页按钮
      if (state.pages.length > 1) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'thumb-close';
        closeBtn.textContent = '×';
        closeBtn.title = '关闭第 ' + (i + 1) + ' 页';
        closeBtn.onclick = e => {
          e.stopPropagation();
          closePage(i);
        };
        div.appendChild(closeBtn);
      }
      div.onclick = () => {
        if (i !== state.currentPage) {
          state.currentPage = i;
          state.selectedId = null;
          renderPageList();
          renderCurrentPage();
          renderBubbleList();
          updateToolBtns();
        }
      };
      list.appendChild(div);
    });
  }

  // ===== 关闭页面 / 文件 =====
  function closePage(index) {
    if (state.pages.length <= 1) {
      closeFile();
      return;
    }
    const page = state.pages[index];
    const bubbleCount = page.bubbles.length;
    if (bubbleCount > 0) {
      if (!confirm(`第 ${index + 1} 页有 ${bubbleCount} 个气泡，确定关闭该页吗？`)) return;
    }
    revokePageRaw(state.pages[index]);
    state.pages.splice(index, 1);
    if (state.currentPage >= state.pages.length) {
      state.currentPage = state.pages.length - 1;
    }
    state.selectedId = null;
    pushHistory();
    renderPageList();
    renderCurrentPage();
    renderBubbleList();
    updateToolBtns();
    updateCloseFileBtn();
    showHint(`已关闭第 ${index + 1} 页`, false, 2000);
  }

  function closeFile() {
    const totalBubbles = state.pages.reduce((sum, p) => sum + p.bubbles.length, 0);
    if (totalBubbles > 0) {
      if (!confirm(`当前文件共有 ${totalBubbles} 个气泡，确定关闭文件吗？未导出的内容将丢失。`)) return;
    }
    state.pages.forEach(revokePageRaw);
    state.pages = [];
    state.currentPage = 0;
    state.selectedId = null;
    state.pdfDoc = null;
    state.history = [];
    state.historyIndex = -1;
    state.nextId = 1;
    canvasWrap.style.display = 'none';
    $('welcome').style.display = 'flex';
    renderPageList();
    renderBubbleList();
    renderCurrentPage();
    updateToolBtns();
    updateHistoryBtns();
    updateCloseFileBtn();
    showHint('文件已关闭', false, 2000);
  }

  function updateCloseFileBtn() {
    $('btnCloseFile').style.display = state.pages.length > 0 ? 'inline-block' : 'none';
  }

  // ===== 气泡列表 =====
  function renderBubbleList() {
    const list = $('bubbleList');
    const all = [];
    state.pages.forEach((p, pi) => p.bubbles.forEach(b => all.push({...b, page: pi})));
    $('bubbleCount').textContent = all.length ? `(${all.length})` : '';
    if (all.length === 0) {
      list.innerHTML = '<div class="empty-hint">暂无气泡<br>点击"添加气泡"开始标注</div>';
      return;
    }
    list.innerHTML = '';
    all.sort((a, b) => {
      const na = parseInt(a.num), nb = parseInt(b.num);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return String(a.num).localeCompare(String(b.num));
    });
    const shapeNames = { circle:'圆形', ellipse:'椭圆', square:'方形', triangle:'三角', arrow:'箭头' };
    for (const b of all) {
      const div = document.createElement('div');
      div.className = 'bubble-item' + (b.id === state.selectedId ? ' active' : '');
      const sh = b.shape || 'circle';
      const numStyle = sh === 'square' ? 'border-radius:4px;' : sh === 'ellipse' ? 'border-radius:50%;transform:scaleX(1.3);' : sh === 'triangle' ? 'border-radius:0;clip-path:polygon(50% 0%,100% 100%,0% 100%);' : '';
      div.innerHTML = `
        <div class="bubble-num" style="border-color:${b.color};color:${b.color};${numStyle}">${b.num}</div>
        <div class="bubble-info">
          <div class="bi-page">第 ${b.page + 1} 页 · ${shapeNames[sh] || '圆形'}</div>
          <div class="bi-note">${b.note || '（双击画布气泡可改编号）'}</div>
        </div>
        <button class="bubble-del" title="删除">×</button>
      `;
      div.onclick = e => {
        if (e.target.classList.contains('bubble-del')) return;
        if (b.page !== state.currentPage) {
          state.currentPage = b.page;
          renderPageList();
          renderCurrentPage();
        }
        state.selectedId = b.id;
        renderBubbles();
        renderBubbleList();
        updateToolBtns();
      };
      div.querySelector('.bubble-del').onclick = e => {
        e.stopPropagation();
        const page = state.pages[b.page];
        page.bubbles = page.bubbles.filter(x => x.id !== b.id);
        if (state.selectedId === b.id) state.selectedId = null;
        if (b.page === state.currentPage) renderBubbles();
        pushHistory();
        renderBubbleList();
        updateToolBtns();
      };
      list.appendChild(div);
    }
  }

  // ===== 重排编号 =====
  function renumber() {
    // 按页、从上到下、从左到右排序
    let n = 1;
    state.pages.forEach(p => {
      p.bubbles.sort((a, b) => {
        const rowA = Math.floor(a.y / 50), rowB = Math.floor(b.y / 50);
        if (rowA !== rowB) return rowA - rowB;
        return a.x - b.x;
      });
      p.bubbles.forEach(b => { b.num = n++; });
    });
    pushHistory();
    renderBubbles();
    renderBubbleList();
    showHint('已按位置从上到下、从左到右重新编号', false, 2500);
  }

  // ===== 生成「气泡标注层」dataURL（透明背景 PNG，仅气泡图形/引线/编号） =====
  // 关键：只把这一层做成 PNG，体积极小（几十 KB），不再把整张图纸塞进 PNG。
  // 气泡层只有「气泡色 / 白色 / 透明」少数几种颜色，量化成调色板 PNG 后
  // 体积再降约 2/3，且视觉上完全无损。
  function buildBubbleLayerUrl(page) {
    if (page.layerUrl && page.layerBubbles === page.bubbles.length) return page.layerUrl;
    const out = document.createElement('canvas');
    out.width = page.width;
    out.height = page.height;
    const ctx = out.getContext('2d');
    // 透明背景：不填充任何底色，导出时与图纸原页面叠加
    drawBubblesToLayer(ctx, page.bubbles);
    let url = out.toDataURL('image/png');
    // 尝试调色板量化降体积；任何异常都回退到普通 PNG，不影响导出
    try {
      url = quantizeToPalettePNG(out) || url;
    } catch (e) { /* 忽略，用原 PNG */ }
    if (page.layerUrl) { try { URL.revokeObjectURL(page.layerUrl); } catch (e) {} }
    page.layerUrl = url;
    page.layerBubbles = page.bubbles.length;
    return page.layerUrl;
  }

  // ===== 把「少色彩的透明图层」量化成调色板 PNG，体积可降至约 1/3 =====
  // 做法：把非透明像素按 RGB 分组取平均颜色，再做中位切分量化。
  // 气泡层颜色极少（通常只有几种），因此量化后视觉无损。
  function quantizeToPalettePNG(canvas) {
    const w = canvas.width, h = canvas.height;
    const src = canvas.getContext('2d').getImageData(0, 0, w, h);
    const data = src.data;

    // 1) 先取所有不透明像素，估计颜色数量
    const colorSet = new Set();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 8) continue;
      colorSet.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
      if (colorSet.size > 256) break;   // 颜色太多就不量化了
    }
    if (colorSet.size === 0 || colorSet.size > 256) return null;

    // 2) 生成调色板：索引 0 保留给透明
    const colors = Array.from(colorSet).sort((a, b) => (a & 0xffff) - (b & 0xffff));
    const palette = [[0, 0, 0]];
    const lut = new Map();
    colors.forEach((c, idx) => {
      palette.push([(c >> 16) & 255, (c >> 8) & 255, c & 255]);
      lut.set(c, idx + 1);
    });

    // 3) 建立索引图，透明像素索引为 0
    const indexed = new Uint8Array(w * h);
    for (let p = 0, i = 0; p < indexed.length; p++, i += 4) {
      if (data[i + 3] < 8) { indexed[p] = 0; continue; }
      indexed[p] = lut.get((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]) || 0;
    }

    // 4) 手工拼 PNG（索引色 + tRNS 保留透明），再转回 dataURL
    const png = encodeIndexedPNG(w, h, indexed, palette);
    return 'data:image/png;base64,' + bytesToBase64(png);
  }

  function bytesToBase64(bytes) {
    let s = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(s);
  }

  // 简易 PNG 编码器：8 位索引色 + tRNS 透明
  function encodeIndexedPNG(w, h, indexed, palette) {
    const crcTable = (() => {
      const t = new Uint32Array(256);
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        t[n] = c >>> 0;
      }
      return t;
    })();
    const crc32 = buf => {
      let c = 0xFFFFFFFF;
      for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
      return (c ^ 0xFFFFFFFF) >>> 0;
    };
    const chunk = (type, payload) => {
      const out = new Uint8Array(12 + payload.length);
      const dv = new DataView(out.buffer);
      dv.setUint32(0, payload.length);
      for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
      out.set(payload, 8);
      dv.setUint32(8 + payload.length, crc32(out.subarray(4, 8 + payload.length)));
      return out;
    };
    // IHDR
    const ihdr = new Uint8Array(13);
    const dv = new DataView(ihdr.buffer);
    dv.setUint32(0, w); dv.setUint32(4, h);
    ihdr[8] = 8;     // bit depth
    ihdr[9] = 3;     // color type 3 = indexed
    ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
    // PLTE
    const plte = new Uint8Array(palette.length * 3);
    palette.forEach((c, i) => { plte[i*3] = c[0]; plte[i*3+1] = c[1]; plte[i*3+2] = c[2]; });
    // tRNS：索引 0 全透明
    const trns = new Uint8Array(palette.length);
    trns[0] = 0;
    for (let i = 1; i < trns.length; i++) trns[i] = 255;

    // IDAT：每行前置 filter 字节 0
    const raw = new Uint8Array(h * (w + 1));
    for (let y = 0; y < h; y++) {
      raw[y * (w + 1)] = 0;
      raw.set(indexed.subarray(y * w, (y + 1) * w), y * (w + 1) + 1);
    }
    const idat = zlibStore(raw);

    const parts = [
      new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
      chunk('IHDR', ihdr), chunk('PLTE', plte), chunk('tRNS', trns),
      chunk('IDAT', idat), chunk('IEND', new Uint8Array(0))
    ];
    const total = parts.reduce((a, p) => a + p.length, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const p of parts) { out.set(p, off); off += p.length; }
    return out;
  }

  // 无压缩 deflate（stored 块），保证兼容性；配合索引色本身已足够小
  function zlibStore(data) {
    const MAX = 65535;
    const blocks = Math.ceil(data.length / MAX) || 1;
    const out = new Uint8Array(2 + blocks * 5 + data.length + 4);
    let o = 0;
    out[o++] = 0x78; out[o++] = 0x01;   // zlib header
    for (let b = 0; b < blocks; b++) {
      const start = b * MAX, len = Math.min(MAX, data.length - start);
      out[o++] = (b === blocks - 1) ? 1 : 0;
      out[o++] = len & 255; out[o++] = (len >> 8) & 255;
      out[o++] = (~len) & 255; out[o++] = ((~len) >> 8) & 255;
      out.set(data.subarray(start, start + len), o); o += len;
    }
    let a = 1, b2 = 0;
    for (let i = 0; i < data.length; i++) { a = (a + data[i]) % 65521; b2 = (b2 + a) % 65521; }
    out[o++] = (b2 >> 8) & 255; out[o++] = b2 & 255;
    out[o++] = (a >> 8) & 255; out[o++] = a & 255;
    return out.subarray(0, o);
  }

  // ===== 导出图片 =====
  // PNG 无 alpha 质量参数，用 JPEG 质量 0.95 控制体积；图纸多为线条图，
  // 高画质 JPEG 视觉无损，体积比 PNG 小一个数量级
  const OUT_JPEG_Q = 0.95;

  async function exportPNG() {
    const page = state.pages[state.currentPage];
    if (!page) return;
    const fileName = `气泡图_第${state.currentPage + 1}页.jpg`;
    // 先弹出保存路径选择（必须在用户手势上下文中）
    const pick = await pickSaveFile(fileName, [{
      description: 'JPEG 图片',
      accept: { 'image/jpeg': ['.jpg', '.jpeg'] }
    }]);
    if (pick.cancelled) return;
    showLoading('生成图片...');
    await new Promise(r => setTimeout(r, 50));
    try {
      const out = document.createElement('canvas');
      out.width = page.width;
      out.height = page.height;
      const ctx = out.getContext('2d');
      ctx.drawImage(page.canvas, 0, 0);
      drawBubblesTo(ctx, page.bubbles);
      const blob = await new Promise(resolve => out.toBlob(resolve, 'image/jpeg', OUT_JPEG_Q));
      if (pick.handle) {
        await writeBlobToHandle(pick.handle, blob);
      } else {
        downloadBlob(blob, fileName);
      }
      hideLoading();
      showHint(pick.handle ? '图片已保存到所选位置' : '图片已导出', false, 2500);
    } catch (err) {
      console.error(err);
      hideLoading();
      showHint('图片导出失败：' + (err.message || err), true, 4000);
    }
  }

  function drawBubblesTo(ctx, bubbles) {
    drawBubblesToCtx(ctx, bubbles);
  }

  function drawBubblesToCtx(ctx, bubbles) {
    for (const b of bubbles) {
      const r = b.size;
      const shape = b.shape || 'circle';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // 箭头类型
      if (shape === 'arrow') {
        const dx = b.ax - b.x, dy = b.ay - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 2) {
          const ux = dx/dist, uy = dy/dist;
          const arrowLen = Math.min(dist, r * 2.8);
          const tipX = b.x + ux*arrowLen, tipY = b.y + uy*arrowLen;
          ctx.strokeStyle = b.color; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tipX, tipY); ctx.stroke();
          const headLen = r * 0.9, perpX = -uy, perpY = ux;
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX - ux*headLen + perpX*headLen*0.5, tipY - uy*headLen + perpY*headLen*0.5);
          ctx.lineTo(tipX - ux*headLen - perpX*headLen*0.5, tipY - uy*headLen - perpY*headLen*0.5);
          ctx.closePath(); ctx.fill();
          ctx.beginPath(); ctx.arc(b.ax, b.ay, 2.5, 0, Math.PI*2); ctx.fill();
        }
        const cr = r * 0.85;
        ctx.beginPath(); ctx.arc(b.x, b.y, cr, 0, Math.PI*2);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.strokeStyle = b.color; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = b.color;
        ctx.font = `bold ${Math.round(cr*0.9)}px "Segoe UI","Microsoft YaHei",sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(b.num), b.x, b.y + 1);
        continue;
      }

      // 引线
      const dx = b.ax - b.x, dy = b.ay - b.y;
      const dist = Math.hypot(dx, dy);
      let edgeX = b.x, edgeY = b.y;
      if (dist > 0.1) {
        const ux = dx/dist, uy = dy/dist;
        if (shape === 'ellipse') {
          const rx = r, ry = r*0.65;
          const t = Math.atan2(uy*rx, ux*ry);
          edgeX = b.x + rx*Math.cos(t); edgeY = b.y + ry*Math.sin(t);
        } else if (shape === 'square') {
          const half = r*0.9;
          const tx = Math.abs(ux)>0.001 ? half/Math.abs(ux) : Infinity;
          const ty = Math.abs(uy)>0.001 ? half/Math.abs(uy) : Infinity;
          const t = Math.min(tx, ty);
          edgeX = b.x + ux*t; edgeY = b.y + uy*t;
        } else {
          edgeX = b.x + ux*r; edgeY = b.y + uy*r;
        }
      }
      if (dist > r*0.3) {
        ctx.strokeStyle = b.color; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(edgeX, edgeY); ctx.lineTo(b.ax, b.ay); ctx.stroke();
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(b.ax, b.ay, 2.5, 0, Math.PI*2); ctx.fill();
      }

      // 形状
      ctx.fillStyle = '#fff'; ctx.strokeStyle = b.color; ctx.lineWidth = 2;
      ctx.beginPath();
      if (shape === 'ellipse') {
        ctx.ellipse(b.x, b.y, r, r*0.65, 0, 0, Math.PI*2);
      } else if (shape === 'square') {
        const half = r*0.9, rad = r*0.18;
        const x=b.x-half, y=b.y-half, w=half*2, h=half*2, rr=Math.min(rad,w/2,h/2);
        ctx.moveTo(x+rr,y); ctx.lineTo(x+w-rr,y); ctx.quadraticCurveTo(x+w,y,x+w,y+rr);
        ctx.lineTo(x+w,y+h-rr); ctx.quadraticCurveTo(x+w,y+h,x+w-rr,y+h);
        ctx.lineTo(x+rr,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-rr);
        ctx.lineTo(x,y+rr); ctx.quadraticCurveTo(x,y,x+rr,y);
      } else if (shape === 'triangle') {
        const h = r*1.15;
        ctx.moveTo(b.x, b.y-h);
        ctx.lineTo(b.x - r*0.95, b.y + h*0.6);
        ctx.lineTo(b.x + r*0.95, b.y + h*0.6);
        ctx.closePath();
      } else {
        ctx.arc(b.x, b.y, r, 0, Math.PI*2);
      }
      ctx.fill(); ctx.stroke();

      // 文字
      ctx.fillStyle = b.color;
      const fontSize = shape === 'triangle' ? Math.round(r*0.75) : Math.round(r*0.95);
      ctx.font = `bold ${fontSize}px "Segoe UI","Microsoft YaHei",sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const textY = shape === 'triangle' ? b.y + r*0.15 : b.y + 1;
      ctx.fillText(String(b.num), b.x, textY);
    }
  }

  // ===== 在气泡层上绘制单个完整形状（白底 + 彩色描边 + 编号 + 引线） =====
  // 注意：必须是「完整图形」，不能只画一半——半圆会缺少下半部分，无法辨识。
  function drawBubbleLayerShape(ctx, b, edgeX, edgeY) {
    const r = b.size;
    const shape = b.shape || 'circle';

    // 先画引线（在形状下层），避免引线穿进图形内部
    if (edgeX != null) {
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(edgeX, edgeY);
      ctx.lineTo(b.ax, b.ay);
      ctx.stroke();
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.ax, b.ay, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 再画完整形状覆盖在引线之上
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (shape === 'triangle') {
      const h = r * 0.9;
      ctx.moveTo(b.x, b.y - h);
      ctx.lineTo(b.x + h * 0.9, b.y + h * 0.62);
      ctx.lineTo(b.x - h * 0.9, b.y + h * 0.62);
      ctx.closePath();
    } else if (shape === 'square') {
      const h = r * 0.82, rad = Math.min(r * 0.18, h);
      ctx.moveTo(b.x - h + rad, b.y - h);
      ctx.lineTo(b.x + h - rad, b.y - h);
      ctx.quadraticCurveTo(b.x + h, b.y - h, b.x + h, b.y - h + rad);
      ctx.lineTo(b.x + h, b.y + h - rad);
      ctx.quadraticCurveTo(b.x + h, b.y + h, b.x + h - rad, b.y + h);
      ctx.lineTo(b.x - h + rad, b.y + h);
      ctx.quadraticCurveTo(b.x - h, b.y + h, b.x - h, b.y + h - rad);
      ctx.lineTo(b.x - h, b.y - h + rad);
      ctx.quadraticCurveTo(b.x - h, b.y - h, b.x - h + rad, b.y - h);
      ctx.closePath();
    } else if (shape === 'ellipse') {
      ctx.ellipse(b.x, b.y, r, r * 0.65, 0, 0, Math.PI * 2);
      ctx.closePath();
    } else {
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();

    // 最后写编号文字：完整图形内居中
    ctx.fillStyle = b.color;
    const fontSize = shape === 'triangle' ? Math.round(r * 0.75) : Math.round(r * 0.95);
    ctx.font = `bold ${fontSize}px "Segoe UI","Microsoft YaHei",sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textY = shape === 'triangle' ? b.y + r * 0.15 : b.y + 1;
    ctx.fillText(String(b.num), b.x, textY);
  }

  // ===== 绘制「气泡层」（透明背景，仅含气泡图形与引线） =====
  // 导出 PDF 时用它叠加在原始页面上，可保证 PDF 大小 ≈ 原文件大小
  function drawBubblesToLayer(ctx, bubbles) {
    for (const b of bubbles) {
      const r = b.size;
      const shape = b.shape || 'circle';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // 箭头类型：仍用完整绘制（箭头文字在箭尾圆圈内，需白底才清晰）
      if (shape === 'arrow') {
        const dx = b.ax - b.x, dy = b.ay - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 2) {
          const ux = dx / dist, uy = dy / dist;
          const arrowLen = Math.min(dist, r * 2.8);
          const tipX = b.x + ux * arrowLen, tipY = b.y + uy * arrowLen;
          ctx.strokeStyle = b.color; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tipX, tipY); ctx.stroke();
          const headLen = r * 0.9, perpX = -uy, perpY = ux;
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX - ux * headLen + perpX * headLen * 0.5, tipY - uy * headLen + perpY * headLen * 0.5);
          ctx.lineTo(tipX - ux * headLen - perpX * headLen * 0.5, tipY - uy * headLen - perpY * headLen * 0.5);
          ctx.closePath(); ctx.fill();
          ctx.beginPath(); ctx.arc(b.ax, b.ay, 2.5, 0, Math.PI * 2); ctx.fill();
        }
        const cr = r * 0.85;
        ctx.beginPath(); ctx.arc(b.x, b.y, cr, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.strokeStyle = b.color; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = b.color;
        ctx.font = `bold ${Math.round(cr * 0.9)}px "Segoe UI","Microsoft YaHei",sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(b.num), b.x, b.y + 1);
        continue;
      }

      // 引线起点（形状边缘）
      const dx = b.ax - b.x, dy = b.ay - b.y;
      const dist = Math.hypot(dx, dy);
      let edgeX = b.x, edgeY = b.y;
      if (dist > 0.1) {
        const ux = dx / dist, uy = dy / dist;
        if (shape === 'ellipse') {
          const rx = r, ry = r * 0.65;
          const t = Math.atan2(uy * rx, ux * ry);
          edgeX = b.x + rx * Math.cos(t);
          edgeY = b.y + ry * Math.sin(t);
        } else if (shape === 'square') {
          const half = r * 0.9;
          const tx = Math.abs(ux) > 0.001 ? half / Math.abs(ux) : Infinity;
          const ty = Math.abs(uy) > 0.001 ? half / Math.abs(uy) : Infinity;
          const t = Math.min(tx, ty);
          edgeX = b.x + ux * t;
          edgeY = b.y + uy * t;
        } else {
          edgeX = b.x + ux * r;
          edgeY = b.y + uy * r;
        }
      }

      if (dist > r * 0.3) {
        drawBubbleLayerShape(ctx, b, edgeX, edgeY);
      } else {
        drawBubbleLayerShape(ctx, b, null, null);
      }
    }
  }

  // ===== 导出 PDF（关键优化） =====
  // 旧做法：把「图纸 + 气泡」整页合成一张 PNG 无损塞进 PDF，
  //        图纸被重新栅格化，输出体积常常是原文件的十几倍。
  // 新做法：图纸层直接用原文件字节/原分辨率图嵌入（不重压缩、不降采样），
  //        气泡单独做成「透明背景 PNG 叠加层」（只有线条和数字，几十 KB），
  //        两者在 PDF 里独立存在，互不干扰 ⇒ 文件小、图纸清晰度不受影响。
  async function exportPDF() {
    if (state.pages.length === 0) return;
    const fileName = `气泡图_${new Date().toISOString().slice(0,10)}.pdf`;
    // 先弹出保存路径选择（必须在用户手势上下文中）
    const pick = await pickSaveFile(fileName, [{
      description: 'PDF 文档',
      accept: { 'application/pdf': ['.pdf'] }
    }]);
    if (pick.cancelled) return;
    showLoading('生成PDF...');
    await new Promise(r => setTimeout(r, 50));
    try {
      const { jsPDF } = window.jspdf;
      const first = state.pages[0];
      // 渲染scale=3，除以3还原为PDF原始pt尺寸
      const baseW = first.width / 3;
      const baseH = first.height / 3;
      const pdf = new jsPDF({ orientation: baseW > baseH ? 'landscape' : 'portrait', unit: 'pt', format: [baseW, baseH], compress: true });

      for (let i = 0; i < state.pages.length; i++) {
        const page = state.pages[i];
        loadingText.textContent = `生成PDF ${i+1}/${state.pages.length}...`;
        const pw = page.width / 3, ph = page.height / 3;
        if (i > 0) {
          pdf.addPage([pw, ph], pw > ph ? 'landscape' : 'portrait');
        }

        // 1) 图纸层：直接用原文件字节 / 原分辨率位图，不做降采样
        const raw = await getPageRaw(page);
        const fmt = (raw.mime === 'image/png') ? 'PNG' : 'JPEG';
        if (raw.kind === 'image') {
          pdf.addImage(raw.data, fmt, 0, 0, pw, ph, undefined, 'FAST');
        } else {
          // 非 PDF 且无原始字节（例如 DXF/TIFF 渲染结果）：按原分辨率生成 dataURL 再嵌入
          const src = raw.url || page.canvas.toDataURL('image/png');
          pdf.addImage(src, fmt, 0, 0, pw, ph, undefined, 'FAST');
        }

        // 2) 气泡层：透明背景 PNG，叠加在最上层，体积极小
        if (page.bubbles.length > 0) {
          const layerUrl = buildBubbleLayerUrl(page);
          pdf.addImage(layerUrl, 'PNG', 0, 0, pw, ph, undefined, 'FAST');
        }
      }
      const pdfBlob = pdf.output('blob');
      if (pick.handle) {
        await writeBlobToHandle(pick.handle, pdfBlob);
      } else {
        downloadBlob(pdfBlob, fileName);
      }
      hideLoading();
      showHint(pick.handle ? 'PDF 已保存到所选位置' : 'PDF 已导出', false, 2500);
    } catch (err) {
      console.error(err);
      hideLoading();
      showHint('PDF 导出失败：' + (err.message || err), true, 4000);
    }
  }

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ===== 保存文件（支持选择保存路径） =====
  // 优先使用 File System Access API 弹出系统"另存为"对话框，
  // 用户可自由选择桌面、D盘等任意文件夹；不支持的浏览器回退到传统下载。
  async function pickSaveFile(suggestedName, mimeTypes) {
    if (!window.showSaveFilePicker) return { fallback: true };
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: suggestedName,
        types: mimeTypes
      });
      return { handle };
    } catch (err) {
      if (err && err.name === 'AbortError') return { cancelled: true };
      return { fallback: true };
    }
  }

  async function writeBlobToHandle(handle, blob) {
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  }

  // ===== 工具栏事件 =====
  $('btnUpload').onclick = () => fileInput.click();
  $('dropZone').onclick = () => fileInput.click();
  fileInput.onchange = e => { handleFile(e.target.files[0]); fileInput.value = ''; };
  $('btnCloseFile').onclick = closeFile;

  // 拖拽
  const dropZone = $('dropZone');
  ['dragenter','dragover'].forEach(ev => {
    document.addEventListener(ev, e => { e.preventDefault(); if (dropZone) dropZone.classList.add('drag'); });
  });
  ['dragleave','drop'].forEach(ev => {
    document.addEventListener(ev, e => { e.preventDefault(); if (dropZone) dropZone.classList.remove('drag'); });
  });
  document.addEventListener('drop', e => {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });

  $('btnAddBubble').onclick = () => {
    if (state.mode === 'add') {
      exitAddMode();
    } else {
      state.mode = 'add';
      state.addStep = 0;
      state.tempAnchor = null;
      state.selectedId = null;
      $('btnAddBubble').classList.add('active');
      $('btnAddBubble').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>退出添加';
      showHint('第一步：点击尺寸标注位置（引线端点），再点击空白处放气泡');
      renderBubbles();
    }
  };

  $('btnDelete').onclick = deleteSelected;
  $('btnUndo').onclick = () => { if (state.historyIndex > 0) restoreHistory(state.historyIndex - 1); };
  $('btnRedo').onclick = () => { if (state.historyIndex < state.history.length - 1) restoreHistory(state.historyIndex + 1); };
  $('btnRenumber').onclick = renumber;
  $('btnExportPNG').onclick = exportPNG;
  $('btnExportPDF').onclick = exportPDF;

  // 气泡形状
  $('shapeSelect').onchange = e => { state.shape = e.target.value; };

  $('colorSelect').onchange = e => { state.color = e.target.value; };
  $('sizeInput').oninput = e => {
    let v = parseInt(e.target.value);
    if (isNaN(v)) v = 18;
    v = Math.max(12, Math.min(100, v));
    state.size = v;
    $('fontSizeLabel').textContent = '字≈' + Math.round(v * 0.95) + 'px';
  };

  $('btnZoomIn').onclick = () => { state.zoom = Math.min(state.zoom * 1.2, 5); applyZoom(); renderBubbles(); };
  $('btnZoomOut').onclick = () => { state.zoom = Math.max(state.zoom / 1.2, 0.1); applyZoom(); renderBubbles(); };
  $('btnFit').onclick = () => { fitToWindow(); applyZoom(); renderBubbles(); };

  // 滚轮缩放
  canvasScroll.addEventListener('wheel', e => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      state.zoom = Math.max(0.1, Math.min(5, state.zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
      applyZoom();
      renderBubbles();
    }
  }, { passive: false });

  // 初始化
  updateToolBtns();
  updateHistoryBtns();

})();


(function(){
  var bar = document.getElementById('demoBar');
  var btn = document.getElementById('demoBtn');
  btn.addEventListener('click', async function(){
    btn.disabled = true; btn.textContent = '正在载入示例图纸…';
    try {
      var r = await fetch(new URL('demo.png', import.meta.url), {cache:'no-store'});
      var b = await r.blob();
      var f = new File([b], 'DEMO-1024-001.png', {type:'image/png'});
      var dt = new DataTransfer(); dt.items.add(f);
      var inp = document.getElementById('fileInput');
      inp.files = dt.files; inp.dispatchEvent(new Event('change'));
      setTimeout(function(){ if (bar && bar.parentNode) bar.parentNode.removeChild(bar); }, 600);
    } catch (e) {
      btn.disabled = false; btn.textContent = '载入失败，请直接打开本地图纸';
    }
  });
})();
