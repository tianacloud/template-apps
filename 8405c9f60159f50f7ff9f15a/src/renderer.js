// 图纸渲染: 在 Canvas 上绘制拼豆网格图纸(每格填色 + 色号 + 板边界)
(function () {
  'use strict';

  // result: quantize 输出; palette; canvas; cellSize 像素/格; opts.showIds 是否标色号; opts.boardSize 板边长(用于画板边界)
  function renderPattern(canvas, result, palette, cellSize, opts) {
    opts = opts || {};
    var cols = result.cols, rows = result.rows;
    var w = cols * cellSize, h = rows * cellSize;
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // 背景白
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // 填色
    var indices = result.indices;
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var pi = indices[y * cols + x];
        var c = palette[pi].rgb;
        ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // 网格线
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var gx = 0; gx <= cols; gx++) {
      ctx.moveTo(gx * cellSize + 0.5, 0);
      ctx.lineTo(gx * cellSize + 0.5, h);
    }
    for (var gy = 0; gy <= rows; gy++) {
      ctx.moveTo(0, gy * cellSize + 0.5);
      ctx.lineTo(w, gy * cellSize + 0.5);
    }
    ctx.stroke();

    // 板边界(每 boardSize 格加粗, 默认 29)
    var boardSize = opts.boardSize || 29;
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var bx = 0; bx <= cols; bx += boardSize) {
      ctx.moveTo(bx * cellSize + 0.5, 0);
      ctx.lineTo(bx * cellSize + 0.5, h);
    }
    for (var by = 0; by <= rows; by += boardSize) {
      ctx.moveTo(0, by * cellSize + 0.5);
      ctx.lineTo(w, by * cellSize + 0.5);
    }
    ctx.stroke();

    // 色号标注(格子够大时才标)
    if (opts.showIds && cellSize >= 14) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.font = Math.floor(cellSize * 0.32) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (var yy = 0; yy < rows; yy++) {
        for (var xx = 0; xx < cols; xx++) {
          var p = indices[yy * cols + xx];
          ctx.fillText(palette[p].id, xx * cellSize + cellSize / 2, yy * cellSize + cellSize / 2);
        }
      }
    }
  }

  // 原图预览(等比缩放到给定框)
  function renderOriginal(canvas, img, maxW, maxH) {
    var ratio = img.width / img.height;
    var w, h;
    if (maxW / maxH > ratio) { h = maxH; w = h * ratio; } else { w = maxW; h = w / ratio; }
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
  }

  window.PerlerRenderer = {
    renderPattern: renderPattern,
    renderOriginal: renderOriginal
  };
})();
