// 导出模块: PNG 下载 + jsPDF 生成 PDF(图纸页 + 采购清单页)
(function () {
  'use strict';

  function downloadCanvasPNG(canvas, filename) {
    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = filename || 'perler-pattern.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }, 'image/png');
  }

  // 生成 PDF: 第一页图纸(等比缩放到 A4), 后续页采购清单
  // 依赖 jsPDF (cdn)
  function exportPDF(patternCanvas, bom, meta) {
    meta = meta || {};
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert('PDF 库未加载, 请检查网络后重试');
      return;
    }
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    // Rasterize labels with the browser's Chinese font; PDF built-in fonts lack CJK glyphs.
    function label(text, x, y) {
      var size = doc.getFontSize(), scale = 3, px = size * 96 / 72;
      var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
      ctx.font = px + 'px sans-serif';
      var width = Math.ceil(ctx.measureText(String(text)).width + 4);
      canvas.width = width * scale; canvas.height = Math.ceil(px * 1.5) * scale;
      ctx = canvas.getContext('2d'); ctx.scale(scale, scale); ctx.font = px + 'px sans-serif';
      ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#000'; ctx.fillText(String(text), 0, px);
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', x, y - size * 0.3528, width * 0.264583, canvas.height / scale * 0.264583);
    }
    var pageW = 210, pageH = 297, margin = 10;
    var usableW = pageW - margin * 2;

    // 标题
    doc.setFontSize(16);
    label(meta.title || '拼豆图纸', margin, 18);
    doc.setFontSize(10);
    doc.setTextColor(110);
    label((meta.info || ''), margin, 25);
    doc.setTextColor(0);

    // 图纸图: 等比放入
    var pw = patternCanvas.width, ph = patternCanvas.height;
    var ratio = pw / ph;
    var drawW = usableW, drawH = drawW / ratio;
    var maxDrawH = pageH - margin - 32;
    if (drawH > maxDrawH) { drawH = maxDrawH; drawW = drawH * ratio; }
    var imgData = patternCanvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', margin, 30, drawW, drawH);

    // 采购清单页
    doc.addPage();
    doc.setFontSize(16);
    label('采购清单', margin, 18);
    doc.setFontSize(11);
    label('总用量: ' + bom.total + ' 颗  |  色号数: ' + bom.items.length, margin, 27);
    doc.setFontSize(10);
    var y = 38;
    var colX = [margin, margin + 60, margin + 110, margin + 150];
    label('色号', colX[0], y);
    label('颜色名', colX[1], y);
    label('数量(颗)', colX[2], y);
    label('占比', colX[3], y);
    doc.setDrawColor(200);
    doc.line(margin, y + 3, pageW - margin, y + 3);
    y += 9;
    var total = bom.total;
    for (var i = 0; i < bom.items.length; i++) {
      if (y > pageH - 15) { doc.addPage(); y = 20; }
      var it = bom.items[i];
      label(it.id, colX[0], y);
      label(it.name, colX[1], y);
      label(String(it.count), colX[2], y);
      label((it.count / total * 100).toFixed(1) + '%', colX[3], y);
      y += 7;
    }

    doc.save(meta.filename || 'perler-pattern.pdf');
  }

  window.PerlerExport = {
    downloadCanvasPNG: downloadCanvasPNG,
    exportPDF: exportPDF
  };
})();
