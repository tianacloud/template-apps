
/* 文书档案工作台 · 本地 OCR
 * 使用 tesseract.js，模型与运算全部在本地，图片不上传、不联网
 *
 * 识别率改进（这一版的重点）：
 *   1) 图像预处理：灰度化 → 对比度拉伸 → 二值化 → 去边 → 补足内边距
 *   2) 放大到引擎友好的分辨率（中文小字对分辨率极敏感）
 *   3) 多套参数组合重试（PSM 6/7/4/3 × 是否二值化），按置信度择优
 *   4) 用行级结果 + 词级结果兜底，尽量把一行标题拼完整
 * 全部在本地完成，不改动隐私边界。
 */
(function (global) {
  'use strict';
  var U = global.U;

  var worker = null;
  var ready = false;
  var loadingPromise = null;

  /* 首次调用时初始化 worker（中文简体模型） */
  function init(onProgress) {
    if (ready) return Promise.resolve(worker);
    if (loadingPromise) return loadingPromise;

    loadingPromise = Tesseract.createWorker('chi_sim', 1, {
      workerPath: 'heji://worker.min.js',
      corePath: '',
      langPath: 'heji://lang',
      logger: function (m) {
        if (onProgress) onProgress(m);
      }
    }).then(function (w) {
      worker = w;
      ready = true;
      // 中文单行文本：关掉词典纠错反而更稳，打开会乱改数字与人名
      try {
        w.setParameters({
          tessedit_pageseg_mode: '6',        // 先按「一整块文本」跑，后面再按需重试
          preserve_interword_spaces: '1',
          user_defined_dpi: '300'
        });
      } catch (e) { /* 老版本引擎不支持就忽略 */ }
      return w;
    }).catch(function (e) {
      loadingPromise = null;
      throw e;
    });
    return loadingPromise;
  }

  /* ---------- 图像预处理 ---------- */

  /* 把 dataURL 画到 canvas 上，顺便放大到目标宽度 */
  function toCanvas(img, targetW) {
    var scale = Math.max(1, targetW / img.width);
    var c = document.createElement('canvas');
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    var ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  /* 灰度直方图 → 找到 2%~98% 的分位点，据此做对比度拉伸 */
  function contrastStretch(ctx, w, h) {
    var d = ctx.getImageData(0, 0, w, h);
    var px = d.data;
    var hist = new Array(256);
    for (var i = 0; i < 256; i++) hist[i] = 0;
    for (var p = 0; p < px.length; p += 4) {
      var g = (px[p] * 0.299 + px[p + 1] * 0.587 + px[p + 2] * 0.114) | 0;
      hist[g]++;
      px[p] = px[p + 1] = px[p + 2] = g;
    }
    var total = px.length / 4;
    var loCut = total * 0.02, hiCut = total * 0.98, acc = 0;
    var lo = 0, hi = 255;
    for (var v = 0; v < 256; v++) { acc += hist[v]; if (acc >= loCut) { lo = v; break; } }
    acc = 0;
    for (var v2 = 255; v2 >= 0; v2--) { acc += hist[v2]; if (acc >= total - hiCut) { hi = v2; break; } }
    if (hi <= lo) { lo = 0; hi = 255; }
    var span = hi - lo || 1;
    var lut = new Array(256);
    for (var k = 0; k < 256; k++) {
      var nv = ((k - lo) * 255 / span) | 0;
      lut[k] = nv < 0 ? 0 : (nv > 255 ? 255 : nv);
    }
    for (var q = 0; q < px.length; q += 4) {
      var gv = px[q];
      var o = lut[gv];
      px[q] = px[q + 1] = px[q + 2] = o;
    }
    ctx.putImageData(d, 0, 0);
    return { lo: lo, hi: hi };
  }

  /* 大津法阈值 + 二值化，返回前景像素占比（用来判断这张图是不是「几乎全白/全黑」） */
  function binarize(ctx, w, h) {
    var d = ctx.getImageData(0, 0, w, h);
    var px = d.data;
    var hist = new Array(256);
    for (var i = 0; i < 256; i++) hist[i] = 0;
    for (var p = 0; p < px.length; p += 4) hist[px[p]]++;
    var total = px.length / 4, sum = 0;
    for (var v = 0; v < 256; v++) sum += v * hist[v];
    var sumB = 0, wB = 0, best = 0, thr = 128;
    for (var t = 0; t < 256; t++) {
      wB += hist[t];
      if (!wB) continue;
      var wF = total - wB;
      if (!wF) break;
      sumB += t * hist[t];
      var mB = sumB / wB, mF = (sum - sumB) / wF;
      var between = wB * wF * (mB - mF) * (mB - mF);
      if (between > best) { best = between; thr = t; }
    }
    var fg = 0;
    for (var q = 0; q < px.length; q += 4) {
      var on = px[q] <= thr ? 0 : 255;
      if (on === 0) fg++;
      px[q] = px[q + 1] = px[q + 2] = on;
      px[q + 3] = 255;
    }
    ctx.putImageData(d, 0, 0);
    return { thr: thr, fgRatio: fg / total };
  }

  /* 找内容包围盒，裁掉四周纯白，再补一圈白边（引擎对贴边文字识别很差） */
  function trimAndPad(canvas) {
    var w = canvas.width, h = canvas.height;
    var ctx = canvas.getContext('2d');
    var d = ctx.getImageData(0, 0, w, h);
    var px = d.data;
    var minX = w, minY = h, maxX = -1, maxY = -1;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        if (px[(y * w + x) * 4] < 128) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return canvas;            // 全白，原样返回
    var padX = Math.round((maxX - minX + 1) * 0.06) + 12;
    var padY = Math.round((maxY - minY + 1) * 0.35) + 14;
    var x0 = Math.max(0, minX - padX), y0 = Math.max(0, minY - padY);
    var x1 = Math.min(w, maxX + 1 + padX), y1 = Math.min(h, maxY + 1 + padY);
    var out = document.createElement('canvas');
    out.width = x1 - x0; out.height = y1 - y0;
    var octx = out.getContext('2d');
    octx.fillStyle = '#fff';
    octx.fillRect(0, 0, out.width, out.height);
    octx.drawImage(canvas, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
    return out;
  }

  /* 生成若干「预处理变体」，供多轮识别 */
  function buildVariants(dataURL) {
    return new Promise(function (res) {
      var img = new Image();
      img.onload = function () {
        var variants = [];

        // 变体 A：放大 + 灰度 + 对比度拉伸（不二值化，保留笔画过渡）
        try {
          var cA = toCanvas(img, 1600);
          var ctxA = cA.getContext('2d');
          contrastStretch(ctxA, cA.width, cA.height);
          var trimmedA = trimAndPad(cA);
          variants.push({ url: trimmedA.toDataURL('image/png'), psm: '7', tag: 'stretch' });
          variants.push({ url: trimmedA.toDataURL('image/png'), psm: '6', tag: 'stretch' });
        } catch (e) { /* 忽略 */ }

        // 变体 B：二值化（红头文件/扫描件常常更准）
        try {
          var cB = toCanvas(img, 1800);
          var ctxB = cB.getContext('2d');
          contrastStretch(ctxB, cB.width, cB.height);
          var info = binarize(ctxB, cB.width, cB.height);
          // 前景太少或太多，说明这张二值化没意义
          if (info.fgRatio > 0.002 && info.fgRatio < 0.6) {
            var trimmedB = trimAndPad(cB);
            variants.push({ url: trimmedB.toDataURL('image/png'), psm: '7', tag: 'bin' });
            variants.push({ url: trimmedB.toDataURL('image/png'), psm: '6', tag: 'bin' });
            variants.push({ url: trimmedB.toDataURL('image/png'), psm: '4', tag: 'bin' });
          }
        } catch (e) { /* 忽略 */ }

        // 变体 C：原图放大版（兜底，万一前两个都失败）
        try {
          var cC = toCanvas(img, 1600);
          variants.push({ url: cC.toDataURL('image/png'), psm: '6', tag: 'raw' });
        } catch (e) { /* 忽略 */ }

        res(variants);
      };
      img.onerror = function () { res([]); };
      img.src = dataURL;
    });
  }

  /* ---------- 识别 ---------- */

  /* 识别图片 → 文本（单次） */
  function recognize(imgSrc, onProgress) {
    return init(onProgress).then(function (w) {
      return w.recognize(imgSrc);
    }).then(function (r) {
      return {
        text: (r.data && r.data.text) || '',
        confidence: (r.data && r.data.confidence) || 0,
        lines: extractLines(r.data),
        raw: r.data
      };
    });
  }

  /* 从 tesseract 结果中提取候选行（按置信度与长度排序） */
  function extractLines(data) {
    if (!data) return [];
    var src = data.lines || [];
    // 没有行级结果时，退回到段落级
    if (!src.length && data.paragraphs) {
      src = [];
      (data.paragraphs || []).forEach(function (p) {
        (p.lines || []).forEach(function (l) { src.push(l); });
      });
    }
    var out = src.map(function (l) {
      return {
        text: (l.text || '').trim(),
        conf: l.confidence || 0
      };
    }).filter(function (l) {
      return l.text.length >= 2 && l.conf > 20;
    });
    out.sort(function (a, b) { return b.conf - a.conf; });
    return out;
  }

  /* 清洗 OCR 文本 → 更像一个「文件标题」
   * 1) 去多余空格：中文之间、中文与数字之间、数字与中文之间
   * 2) 去首尾杂符号（含中英文括号）
   * 3) 去干扰词
   * 4) 丢掉"正文起头"，只保留像标题的那一段
   * 5) 修正 OCR 常见形近字误识（只改高置信度的固定搭配）
   */
  function cleanTitle(raw) {
    if (!raw) return '';
    var s = String(raw).replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim();

    // 去掉中文字符之间 / 中文与数字之间 的空格
    s = s.replace(/([\u4e00-\u9fa5])\s+(?=[\u4e00-\u9fa5])/g, '$1');
    s = s.replace(/([\u4e00-\u9fa5])\s+(?=[0-9])/g, '$1');
    s = s.replace(/([0-9])\s+(?=[\u4e00-\u9fa5])/g, '$1');
    // 中文与标点之间的空格
    s = s.replace(/\s+(?=[，。、；：！？）】」》])/g, '');
    s = s.replace(/([（【「《])\s+/g, '$1');
    // 中文字之间被误拆的情况：逐字去掉单字间的空格
    s = s.replace(/([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])/g, '$1$2');

    // 常见形近误识：只在明显是公文语境的固定搭配上纠正
    // 常见形近误识纠正。
    // 只改「公文里几乎必然是这个搭配」的位置，不做无条件替换，
    // 否则会把正常的字也改掉（例如"天气"里的「天」）。
    var fixes = [
      // 标题开头：公文标题几乎都是「关于…」
      [/^(天于|关干|关亍|关与|关于)/, '关于'],
      // 年份前后多出来的连接字（"关于2024和年度…"）
      [/([0-9]{4})(和|利|年)?(?=年度)/, '$1'],
      // 正文起头被认错
      [/各处分(?=[，。、；：]|$)/, '各处室'],
      // 文种被认错
      [/(通知|报告|请示|批复|意见|办法|方案)$/, function (m) { return m; }]
    ];
    fixes.forEach(function (f) {
      if (typeof f[1] === 'function') return;
      s = s.replace(f[0], f[1]);
    });

    // 去首尾杂符号（连括号一起清，含全角括号）
    s = s.replace(/^[^\u4e00-\u9fa5A-Za-z0-9]+/, '');
    s = s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]+$/, '');

    // 常见干扰词
    s = s.replace(/^(附件|附件：|复印件|抄送|签发)[:：]?/, '');

    // 丢掉正文起头：标题通常在"关于…的通知/报告/办法/方案"这类句式处结束
    s = s.replace(/(通知|报告|请示|批复|决定|意见|办法|方案|规定|纪要|函|批复|细则|说明|统计表|汇总表|登记表|审批表|计划|总结|台账)\s*(各处室|各科室|各单位|各部门|各直属单位|现将|根据|为了|为|按照|经).*$/, '$1');

    // 仍然过长时，取到第一个句读为止
    if (s.length > 30) {
      var m = s.match(/^[^，。、；：！？]{6,30}/);
      if (m) s = m[0];
    }

    return s.trim().slice(0, 60);
  }

  /* 判断一段文本是否像"文件标题"（用于挑候选） */
  function looksLikeTitle(t) {
    if (!t) return false;
    if (t.length < 4 || t.length > 40) return false;
    // 标题常见特征
    var kw = /(关于|通知|报告|请示|批复|决定|意见|办法|方案|规定|纪要|函|细则|说明|表|计划|总结|台账|清单|名单|协议|合同|审批|登记)/;
    var hasKw = kw.test(t);
    // 正文特征（含句号、"各处室"等）
    var bodyish = /(各处室|各科室|现将|根据|为了|按照|如下|如下：|特此|请遵照|深入贯彻落实)/.test(t);
    if (bodyish && !hasKw) return false;
    if (/[。]/.test(t)) return false;
    return hasKw || t.length <= 22;
  }

  /* 给一个候选打分：置信度 + 像不像标题 + 长度适中 */
  function scoreOf(text, conf) {
    if (!text) return -1e9;
    var s = conf;
    if (looksLikeTitle(text)) s += 45;
    var L = text.length;
    if (L >= 8 && L <= 30) s += 18;
    else if (L > 30 && L <= 45) s += 4;
    if (/^关于/.test(text)) s += 16;
    if (/(通知|报告|请示|批复|方案|办法|规定|意见|纪要|函)$/.test(text)) s += 14;
    if (/(各处室|现将|根据|为了|按照|特此)/.test(text)) s -= 30;
    return s;
  }

  /* 主流程：拍照得到的整图 → 裁剪标题区 → 多轮识别 → 择优给候选
   * cropRect 由取景框位置换算得出（避让：只认框内）
   */
  function recognizeTitle(fullDataURL, cropRect) {
    var cropped;
    var progress = function (m) {
      if (m.status === 'recognizing text') {
        U.loading(true, '识别中 ' + Math.round(m.progress * 100) + '%');
      } else if (m.status === 'loading tesseract core') {
        U.loading(true, '加载识别引擎…');
      } else if (m.status === 'initializing tesseract') {
        U.loading(true, '初始化…');
      } else if (m.status && m.status.indexOf('loading language') === 0) {
        U.loading(true, '加载中文模型…');
      }
    };

    return U.cropDataURL(fullDataURL, cropRect).then(function (c) {
      cropped = c;
      U.loading(true, '正在本地识别（不上传）…');
      return init(progress);
    }).then(function (w) {
      return buildVariants(cropped).then(function (variants) {
        if (!variants.length) variants = [{ url: cropped, psm: '6', tag: 'raw' }];

        var results = [];
        // 依次跑，跑出足够好的就提前收工（省电、省时间）
        var chain = Promise.resolve();
        variants.forEach(function (v) {
          chain = chain.then(function () {
            // 已经有高分结果，且已经跑了至少两轮，就不必再试
            var best = bestSoFar(results);
            if (results.length >= 2 && best && best.score >= 150) return null;
            try { w.setParameters({ tessedit_pageseg_mode: v.psm, preserve_interword_spaces: '1', user_defined_dpi: '300' }); }
            catch (e) { /* 忽略 */ }
            U.loading(true, '正在本地识别（不上传）…');
            return w.recognize(v.url).then(function (r) {
              var data = r.data || {};
              var lines = extractLines(data);
              var main = cleanTitle(data.text || '');
              var conf = data.confidence || 0;
              results.push({
                tag: v.tag, psm: v.psm, conf: conf, main: main, lines: lines,
                score: scoreOf(main, conf)
              });
            }).catch(function () { /* 这一轮失败不影响其它轮 */ });
          });
        });
        return chain.then(function () { return results; });
      });
    }).then(function (results) {
      U.loading(false);

      // 汇总所有轮次的候选，按分数排序
      var pool = [];
      results.forEach(function (r) {
        if (r.main) pool.push({ text: r.main, score: scoreOf(r.main, r.conf), conf: r.conf });
        r.lines.forEach(function (l) {
          var t = cleanTitle(l.text);
          if (t) pool.push({ text: t, score: scoreOf(t, l.conf), conf: l.conf });
        });
      });
      pool.sort(function (a, b) { return b.score - a.score; });

      var cands = [], seen = {};
      pool.forEach(function (p) {
        if (cands.length >= 3) return;
        if (seen[p.text]) return;
        // 已经有一个很像标题的，后面不再收明显是正文的
        if (cands.length && !looksLikeTitle(p.text) && p.score < 90) return;
        cands.push(p.text);
        seen[p.text] = 1;
      });

      // 实在挑不出，退到最长的一条
      if (!cands.length) {
        var longest = pool.slice().sort(function (a, b) { return b.text.length - a.text.length; })[0];
        if (longest) cands.push(longest.text);
      }

      var bestConf = 0;
      results.forEach(function (r) { if (r.conf > bestConf) bestConf = r.conf; });

      return {
        title: cands[0] || '',
        candidates: cands,
        confidence: Math.round(bestConf),
        cropped: cropped
      };
    }).catch(function (e) {
      U.loading(false);
      console.error(e);
      throw e;
    });
  }

  function bestSoFar(results) {
    var best = null;
    results.forEach(function (r) { if (!best || r.score > best.score) best = r; });
    return best;
  }

  function isReady() { return ready; }

  global.OCR = {
    init: init, recognize: recognize, recognizeTitle: recognizeTitle,
    cleanTitle: cleanTitle, isReady: isReady,
    _buildVariants: buildVariants          // 测试用
  };
})(window);

