// 核心处理引擎 v5: 锐化 → 增强 → 主色提取(暗部保护) → CIEDE2000 量化(可选抖动)
(function () {
  'use strict';

  // ---------- sRGB → CIELab ----------
  function linSRGB(c) {
    c /= 255;
    return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
  }
  function rgbToLab(rgb) {
    var R = linSRGB(rgb[0]), G = linSRGB(rgb[1]), B = linSRGB(rgb[2]);
    var X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
    var Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750;
    var Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041;
    var fx = labF(X / 0.95047), fy = labF(Y / 1.0), fz = labF(Z / 1.08883);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  }
  function labF(t) {
    return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  }

  // ---------- CIEDE2000 色差 ----------
  function ciede2000(l1, l2) {
    var L1 = l1[0], a1 = l1[1], b1 = l1[2];
    var L2 = l2[0], a2 = l2[1], b2 = l2[2];
    var C1 = Math.sqrt(a1 * a1 + b1 * b1), C2 = Math.sqrt(a2 * a2 + b2 * b2);
    var Cbar = (C1 + C2) / 2;
    var Cbar7 = Math.pow(Cbar, 7);
    var G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + 6103515625))); // 25^7
    var a1p = (1 + G) * a1, a2p = (1 + G) * a2;
    var C1p = Math.sqrt(a1p * a1p + b1 * b1), C2p = Math.sqrt(a2p * a2p + b2 * b2);
    var h1p = (b1 === 0 && a1p === 0) ? 0 : Math.atan2(b1, a1p); if (h1p < 0) h1p += 2 * Math.PI;
    var h2p = (b2 === 0 && a2p === 0) ? 0 : Math.atan2(b2, a2p); if (h2p < 0) h2p += 2 * Math.PI;
    var dLp = L2 - L1;
    var dCp = C2p - C1p;
    var dhp;
    if (C1p * C2p === 0) { dhp = 0; }
    else {
      dhp = h2p - h1p;
      if (dhp > Math.PI) dhp -= 2 * Math.PI;
      else if (dhp < -Math.PI) dhp += 2 * Math.PI;
    }
    var dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp / 2);
    var Lbarp = (L1 + L2) / 2;
    var Cbarp = (C1p + C2p) / 2;
    var hbarp;
    if (C1p * C2p === 0) { hbarp = h1p + h2p; }
    else {
      var diff = Math.abs(h1p - h2p);
      if (diff > Math.PI) hbarp = (h1p + h2p + 2 * Math.PI) / 2;
      else hbarp = (h1p + h2p) / 2;
    }
    if (hbarp >= 2 * Math.PI) hbarp -= 2 * Math.PI;
    var T = 1 - 0.17 * Math.cos(hbarp - 0.5236) + 0.24 * Math.cos(2 * hbarp) + 0.32 * Math.cos(3 * hbarp + 0.1047) - 0.20 * Math.cos(4 * hbarp - 0.6283);
    var dtheta = (30 / 180) * Math.PI * Math.exp(-Math.pow((hbarp * 180 / Math.PI - 275) / 25, 2));
    var Cbarp7 = Math.pow(Cbarp, 7);
    var RC = 2 * Math.sqrt(Cbarp7 / (Cbarp7 + 6103515625));
    var SL = 1 + 0.015 * Math.pow(Lbarp - 50, 2) / Math.sqrt(20 + Math.pow(Lbarp - 50, 2));
    var SC = 1 + 0.045 * Cbarp;
    var SH = 1 + 0.045 * Cbarp * T;
    var RT = -Math.sin(2 * dtheta) * RC;
    return Math.sqrt(
      Math.pow(dLp / SL, 2) + Math.pow(dCp / SC, 2) + Math.pow(dHp / SH, 2) +
      RT * (dCp / SC) * (dHp / SH)
    );
  }

  // 色板 Lab 预计算缓存
  function ensureLab(palette) {
    if (!palette._lab) {
      palette._lab = palette.map(function (c) { return rgbToLab(c.rgb); });
    }
    return palette._lab;
  }

  // 最近邻: CIEDE2000 最小色差
  function nearestIndex(rgb, palette) {
    var labs = ensureLab(palette);
    var lab = rgbToLab(rgb);
    var best = 0, bestD = Infinity;
    for (var i = 0; i < labs.length; i++) {
      var d = ciede2000(lab, labs[i]);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  // 加载图片
  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = function () { reject(new Error('图片加载失败')); };
        img.src = e.target.result;
      };
      reader.onerror = function () { reject(new Error('文件读取失败')); };
      reader.readAsDataURL(file);
    });
  }

  // 缩放到目标网格(覆盖裁剪); zoom>1 时源窗口以中心收缩, 主体占格更多
  function imageToGridData(img, cols, rows, zoom) {
    zoom = zoom || 1;
    var canvas = document.createElement('canvas');
    canvas.width = cols; canvas.height = rows;
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    var srcRatio = img.width / img.height, dstRatio = cols / rows;
    var sw, sh;
    if (srcRatio > dstRatio) { sw = img.height * dstRatio; sh = img.height; }
    else { sw = img.width; sh = img.width / dstRatio; }
    sw = sw / zoom; sh = sh / zoom;
    var sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
    return ctx.getImageData(0, 0, cols, rows);
  }

  // Unsharp mask 锐化: 拉开小面积高对比细节(眼珠/眼线/鼻头)
  // amount 0~1.5, 0 为不锐化
  function sharpen(imageData, amount) {
    if (amount <= 0) return imageData;
    var w = imageData.width, h = imageData.height, d = imageData.data;
    var n = w * h;
    var src = new Float32Array(n * 3);
    var i, p, c;
    for (i = 0, p = 0; p < n; p++, i += 4) {
      src[p * 3] = d[i]; src[p * 3 + 1] = d[i + 1]; src[p * 3 + 2] = d[i + 2];
    }
    // 3x3 box blur 作为模糊副本
    var blur = new Float32Array(n * 3);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var r = 0, g = 0, b = 0, cnt = 0;
        for (var dy = -1; dy <= 1; dy++) {
          var yy = y + dy; if (yy < 0 || yy >= h) continue;
          for (var dx = -1; dx <= 1; dx++) {
            var xx = x + dx; if (xx < 0 || xx >= w) continue;
            var q = (yy * w + xx) * 3;
            r += src[q]; g += src[q + 1]; b += src[q + 2]; cnt++;
          }
        }
        var o = (y * w + x) * 3;
        blur[o] = r / cnt; blur[o + 1] = g / cnt; blur[o + 2] = b / cnt;
      }
    }
    // out = orig + amount * (orig - blur)
    for (i = 0, p = 0; p < n; p++, i += 4) {
      for (c = 0; c < 3; c++) {
        var v = src[p * 3 + c] + amount * (src[p * 3 + c] - blur[p * 3 + c]);
        d[i + c] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
    }
    return imageData;
  }

  // 饱和度 + 对比度增强
  function enhance(imageData, amount) {
    if (amount <= 0) return imageData;
    var d = imageData.data;
    var sat = 1 + amount, contrast = 1 + amount * 0.5;
    for (var i = 0; i < d.length; i += 4) {
      var r = d[i], g = d[i + 1], b = d[i + 2];
      var gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * sat; g = gray + (g - gray) * sat; b = gray + (b - gray) * sat;
      r = (r - 128) * contrast + 128; g = (g - 128) * contrast + 128; b = (b - 128) * contrast + 128;
      d[i] = r < 0 ? 0 : r > 255 ? 255 : r;
      d[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
      d[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    }
    return imageData;
  }

  // 主色提取: 中位切分
  function dominantColors(imageData, k) {
    var d = imageData.data, total = d.length / 4;
    var step = Math.max(1, Math.floor(total / 20000));
    var pixels = [];
    for (var i = 0; i < total; i += step) { var j = i * 4; pixels.push([d[j], d[j + 1], d[j + 2]]); }
    var buckets = [pixels];
    while (buckets.length < k) {
      var bi = -1, bs = 1;
      for (var t = 0; t < buckets.length; t++) { if (buckets[t].length > bs) { bs = buckets[t].length; bi = t; } }
      if (bi < 0) break;
      var bucket = buckets[bi];
      var rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
      for (var m = 0; m < bucket.length; m++) {
        var p = bucket[m];
        if (p[0] < rMin) rMin = p[0]; if (p[0] > rMax) rMax = p[0];
        if (p[1] < gMin) gMin = p[1]; if (p[1] > gMax) gMax = p[1];
        if (p[2] < bMin) bMin = p[2]; if (p[2] > bMax) bMax = p[2];
      }
      var rr = rMax - rMin, gr = gMax - gMin, br = bMax - bMin;
      var ch = (rr >= gr && rr >= br) ? 0 : (gr >= br ? 1 : 2);
      bucket.sort(function (a, b) { return a[ch] - b[ch]; });
      var mid = bucket.length >> 1;
      buckets.splice(bi, 1, bucket.slice(0, mid), bucket.slice(mid));
    }
    return buckets.map(function (b) {
      var r = 0, g = 0, bl = 0;
      for (var i = 0; i < b.length; i++) { r += b[i][0]; g += b[i][1]; bl += b[i][2]; }
      var n = b.length; return [Math.round(r / n), Math.round(g / n), Math.round(bl / n)];
    });
  }

  // 最暗簇代表色: 亮度最低的 3% 像素的平均, 用于暗部保护
  function darkestClusterColor(imageData) {
    var d = imageData.data, total = d.length / 4;
    var step = Math.max(1, Math.floor(total / 20000));
    var arr = [];
    for (var i = 0; i < total; i += step) {
      var j = i * 4;
      arr.push([0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2], d[j], d[j + 1], d[j + 2]]);
    }
    arr.sort(function (a, b) { return a[0] - b[0]; });
    var n = Math.max(1, Math.floor(arr.length * 0.01));
    var r = 0, g = 0, b = 0;
    for (var t = 0; t < n; t++) { r += arr[t][1]; g += arr[t][2]; b += arr[t][3]; }
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
  }

  // 活跃色板: 主色 → 最近豆色 → 去重 → 暗部保护
  function activePalette(imageData, palette, k) {
    var doms = dominantColors(imageData, Math.min(k, palette.length));
    var used = {}, active = [];
    for (var i = 0; i < doms.length; i++) {
      var pi = nearestIndex(doms[i], palette);
      if (!used[pi]) { used[pi] = true; active.push(palette[pi]); }
    }
    // 暗部保护: 活跃色板里没有足够暗的豆时强制补一颗, 瞳孔/眼线不再被吞
    var dark = darkestClusterColor(imageData);
    if (dark) {
      var hasDark = false;
      for (var a = 0; a < active.length; a++) {
        if (rgbToLab(active[a].rgb)[0] < 40) { hasDark = true; break; }
      }
      if (!hasDark) {
        var dpi = nearestIndex(dark, palette);
        if (!used[dpi]) { used[dpi] = true; active.push(palette[dpi]); }
      }
    }
    if (active.length < 2) active = palette.slice(0, 2);
    active._lab = null; // 新数组, 重置 lab 缓存
    return active;
  }

  // 量化
  function quantize(imageData, palette, useDither) {
    var cols = imageData.width, rows = imageData.height, data = imageData.data;
    var indices = new Int16Array(cols * rows);
    if (!useDither) {
      for (var p = 0; p < cols * rows; p++) {
        var i = p * 4;
        indices[p] = nearestIndex([data[i], data[i + 1], data[i + 2]], palette);
      }
    } else {
      var buf = new Float32Array(cols * rows * 3);
      for (var k2 = 0; k2 < cols * rows; k2++) { var j2 = k2 * 4; buf[k2 * 3] = data[j2]; buf[k2 * 3 + 1] = data[j2 + 1]; buf[k2 * 3 + 2] = data[j2 + 2]; }
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var idx = (y * cols + x) * 3;
          var pi = nearestIndex([buf[idx], buf[idx + 1], buf[idx + 2]], palette);
          indices[y * cols + x] = pi;
          var nc = palette[pi].rgb;
          var errR = buf[idx] - nc[0], errG = buf[idx + 1] - nc[1], errB = buf[idx + 2] - nc[2];
          distribute(buf, x + 1, y, cols, rows, errR, errG, errB, 7 / 16);
          distribute(buf, x - 1, y + 1, cols, rows, errR, errG, errB, 3 / 16);
          distribute(buf, x, y + 1, cols, rows, errR, errG, errB, 5 / 16);
          distribute(buf, x + 1, y + 1, cols, rows, errR, errG, errB, 1 / 16);
        }
      }
    }
    return { cols: cols, rows: rows, indices: indices, paletteUsed: palette };
  }

  function distribute(buf, x, y, cols, rows, er, eg, eb, w) {
    if (x < 0 || x >= cols || y < 0 || y >= rows) return;
    var idx = (y * cols + x) * 3;
    buf[idx] += er * w; buf[idx + 1] += eg * w; buf[idx + 2] += eb * w;
  }

  function buildBom(result) {
    var src = result.paletteUsed;
    var n = src.length;
    var counts = new Array(n).fill(0);
    var arr = result.indices;
    for (var i = 0; i < arr.length; i++) counts[arr[i]]++;
    var bom = [];
    for (var k = 0; k < n; k++) {
      if (counts[k] > 0) bom.push({ id: src[k].id, name: src[k].name, count: counts[k] });
    }
    bom.sort(function (a, b) { return b.count - a.count; });
    return { items: bom, total: arr.length };
  }

  window.PerlerProcessor = {
    loadImage: loadImage, imageToGridData: imageToGridData, sharpen: sharpen,
    enhance: enhance, activePalette: activePalette, dominantColors: dominantColors,
    quantize: quantize, buildBom: buildBom, nearestIndex: nearestIndex,
    rgbToLab: rgbToLab, ciede2000: ciede2000
  };
})();
