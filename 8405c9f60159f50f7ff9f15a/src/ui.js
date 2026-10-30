// 界面交互: 上传 → 参数 → 处理 → 预览 → 导出 (v6)
(function () {
  'use strict';

  var state = {
    img: null,
    result: null,
    palette: window.PERLER_PALETTE,
    cellSize: 16,
    cols: 87,
    rows: 87,
    useDither: false,
    showIds: true,
    boardSize: 29,
    colorCount: 16,
    enhanceAmt: 0.3,
    detailAmt: 0.8,
    zoom: 1
  };

  var $ = function (s) { return document.querySelector(s); };
  var regenTimer = null;

  function init() {
    var drop = $('#dropzone');
    var fileInput = $('#fileInput');

    drop.addEventListener('click', function () { fileInput.click(); });
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('drag'); });
    drop.addEventListener('dragleave', function () { drop.classList.remove('drag'); });
    drop.addEventListener('drop', function (e) {
      e.preventDefault(); drop.classList.remove('drag');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', function () {
      if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });

    // 板尺寸预设
    $('#boardPreset').addEventListener('change', function (e) {
      var v = e.target.value;
      if (v === 'custom') { $('#dimRow').style.display = ''; return; }
      var parts = v.split('x');
      state.cols = parseInt(parts[0], 10);
      state.rows = parseInt(parts[1], 10);
      $('#colsInput').value = state.cols;
      $('#rowsInput').value = state.rows;
      $('#dimRow').style.display = 'none';
      regen();
    });
    $('#colsInput').addEventListener('input', function (e) {
      state.cols = parseInt(e.target.value, 10) || 87; regen();
    });
    $('#rowsInput').addEventListener('input', function (e) {
      state.rows = parseInt(e.target.value, 10) || 87; regen();
    });

    // 每格像素
    $('#cellSize').addEventListener('input', function (e) {
      state.cellSize = parseInt(e.target.value, 10);
      $('#cellSizeVal').textContent = state.cellSize + 'px';
      if (state.result) draw();
    });

    // 颜色数 / 色彩增强 / 细节锐化 / 主体聚焦
    $('#colorCount').addEventListener('input', function (e) {
      state.colorCount = parseInt(e.target.value, 10);
      $('#colorCountVal').textContent = state.colorCount;
      regen();
    });
    $('#enhance').addEventListener('input', function (e) {
      state.enhanceAmt = parseInt(e.target.value, 10) / 100;
      $('#enhanceVal').textContent = e.target.value + '%';
      regen();
    });
    $('#detail').addEventListener('input', function (e) {
      state.detailAmt = parseInt(e.target.value, 10) / 100;
      $('#detailVal').textContent = e.target.value + '%';
      regen();
    });
    $('#zoom').addEventListener('input', function (e) {
      state.zoom = parseInt(e.target.value, 10) / 100;
      $('#zoomVal').textContent = state.zoom.toFixed(1) + 'x';
      regen();
    });

    // 抖动 / 色号标注
    $('#dither').addEventListener('change', function (e) { state.useDither = e.target.checked; regen(); });
    $('#showIds').addEventListener('change', function (e) {
      state.showIds = e.target.checked;
      if (state.result) draw();
    });

    $('#genBtn').addEventListener('click', function () {
      if (!state.img) { alert('请先上传图片'); return; }
      generate();
    });
    $('#pngBtn').addEventListener('click', function () {
      if (!state.result) return;
      window.PerlerExport.downloadCanvasPNG($('#patternCanvas'), 'perler-pattern.png');
    });
    $('#pdfBtn').addEventListener('click', function () {
      if (!state.result) return;
      var bom = window.PerlerProcessor.buildBom(state.result, state.palette);
      window.PerlerExport.exportPDF($('#patternCanvas'), bom, {
        title: '拼豆图纸',
        info: state.cols + ' x ' + state.rows + ' 格 | ' + state.result.paletteUsed.length + ' 色 | ' + (state.useDither ? '抖动' : '最近邻'),
        filename: 'perler-pattern.pdf'
      });
    });
  }

  // 带防抖的自动重生成
  function regen() {
    if (!state.img) return;
    clearTimeout(regenTimer);
    regenTimer = setTimeout(generate, 120);
  }

  function handleFile(file) {
    if (!file.type.startsWith('image/')) { alert('请上传图片文件'); return; }
    window.PerlerProcessor.loadImage(file).then(function (img) {
      state.img = img;
      window.PerlerRenderer.renderOriginal($('#origCanvas'), img, 260, 260);
      // 默认网格: 长边 87(大板), 短边按比例
      var longer = Math.max(img.width, img.height);
      var shorter = Math.min(img.width, img.height);
      var ratio = shorter / longer;
      if (img.width >= img.height) {
        state.cols = 87; state.rows = Math.max(2, Math.round(87 * ratio));
      } else {
        state.rows = 87; state.cols = Math.max(2, Math.round(87 * ratio));
      }
      $('#colsInput').value = state.cols;
      $('#rowsInput').value = state.rows;
      $('#boardPreset').value = 'custom';
      $('#dimRow').style.display = '';
      $('#hint').textContent = '图片已加载, 已按大板规模(长边87)生成';
      generate();
    }).catch(function (err) { alert(err.message); });
  }

  function generate() {
    if (!state.img) return;
    var cols = Math.max(2, state.cols), rows = Math.max(2, state.rows);
    var data = window.PerlerProcessor.imageToGridData(state.img, cols, rows, state.zoom);
    window.PerlerProcessor.sharpen(data, state.detailAmt);
    window.PerlerProcessor.enhance(data, state.enhanceAmt);
    var active = window.PerlerProcessor.activePalette(data, state.palette, state.colorCount);
    state.result = window.PerlerProcessor.quantize(data, active, state.useDither);
    draw();
    renderBom();
    $('#hint').textContent = '生成完成 · ' + cols + ' x ' + rows + ' · ' +
      state.result.indices.length + ' 颗豆 · ' + active.length + ' 色' +
      (state.zoom > 1 ? ' · 聚焦 ' + state.zoom.toFixed(1) + 'x' : '');
    $('#pngBtn').disabled = false;
    $('#pdfBtn').disabled = false;
  }

  function draw() {
    window.PerlerRenderer.renderPattern(
      $('#patternCanvas'), state.result, state.result.paletteUsed, state.cellSize,
      { showIds: state.showIds, boardSize: state.boardSize }
    );
  }

  function renderBom() {
    var bom = window.PerlerProcessor.buildBom(state.result, state.palette);
    var html = '<div class="bom-total">总用量 ' + bom.total + ' 颗 · ' + bom.items.length + ' 种色号</div>';
    html += '<table><thead><tr><th>色块</th><th>色号</th><th>颜色名</th><th>数量</th><th>占比</th></tr></thead><tbody>';
    for (var i = 0; i < bom.items.length; i++) {
      var it = bom.items[i];
      var c = state.palette.find(function (p) { return p.id === it.id; });
      var swatch = c ? 'rgb(' + c.rgb.join(',') + ')' : '#999';
      html += '<tr><td><span class="swatch" style="background:' + swatch + '"></span></td>' +
        '<td>' + it.id + '</td><td>' + it.name + '</td><td>' + it.count + '</td>' +
        '<td>' + (it.count / bom.total * 100).toFixed(1) + '%</td></tr>';
    }
    html += '</tbody></table>';
    $('#bom').innerHTML = html;
  }

  init();
})();
