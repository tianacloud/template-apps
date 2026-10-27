/* 月度账单海报：用 Canvas 画一张 1080×1440 的图，可保存分享
 * 全部在本机绘制，不上传、不调接口。
 */
(function (global) {
  'use strict';
  var QH = (global.QH = global.QH || {});
  var S = QH.store;

  var W = 1080, H = 1440, PAD = 76;

  var INK = '#173B37', MUTED = '#78908B', GREEN = '#0C7063', CORAL = '#E77768',
    GOLD = '#C49345', LINE = '#E7DFCF', PAPER = '#F8F6F0', CARD = '#FFFEFA', SEAL = '#A54E3A';

  var SERIF = '"Songti SC","STSong","Source Han Serif SC","SimSun",serif';
  var SANS = '"PingFang SC","Microsoft YaHei","Hiragino Sans GB",system-ui,sans-serif';

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function money(cents) { return S.money(cents); }

  /* 回纹：一条折线，铺成网格当底纹 */
  function meander(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size);
    ctx.lineTo(x, y);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x + size, y + size);
    ctx.lineTo(x + size * 0.25, y + size);
    ctx.lineTo(x + size * 0.25, y + size * 0.25);
    ctx.lineTo(x + size * 0.75, y + size * 0.25);
    ctx.lineTo(x + size * 0.75, y + size * 0.75);
    ctx.stroke();
  }

  /* 按「词块」换行：数字和 ¥ 金额不能被折断（「¥128.19」不能拆成「¥128.1 / 9」） */
  function wrapText(ctx, text, maxWidth) {
    var tokens = text.match(/[A-Za-z0-9¥$.,%+\-−]+|\s+|[\s\S]/g) || [];
    var lines = [];
    var buf = '';
    tokens.forEach(function (token) {
      if (token === '\n') { lines.push(buf); buf = ''; return; }
      var next = buf + token;
      if (ctx.measureText(next).width > maxWidth && buf) {
        lines.push(buf);
        buf = token === ' ' ? '' : token;
      } else {
        buf = next;
      }
    });
    if (buf) lines.push(buf);
    return lines;
  }

  function collect(offset) {
    var m = S.monthRange(offset);
    var entries = S.entriesIn(m.from, m.until);
    var agg = S.aggregate(entries);
    var prev = S.aggregate(S.entriesIn(S.monthRange(offset - 1).from, S.monthRange(offset - 1).until));
    var cats = Object.keys(agg.byCategory).map(function (name) {
      return { name: name, value: agg.byCategory[name] };
    }).sort(function (a, b) { return b.value - a.value; });
    return { month: m, entries: entries, agg: agg, prev: prev, cats: cats };
  }

  /* 一句话总结：分类占比 + 环比 + 结余率，挑最有信息量的两三句 */
  function buildInsight(data) {
    var agg = data.agg, prev = data.prev, top = data.cats[0];
    var parts = [];
    if (top && agg.expense > 0) {
      var pct = Math.round(top.value / agg.expense * 100);
      parts.push('「' + top.name + '」是本月最大头，' + money(top.value) + '，占支出 ' + pct + '%。');
    }
    if (prev.expense > 0 && agg.expense > 0) {
      var diff = agg.expense - prev.expense;
      var rate = Math.round(Math.abs(diff) / prev.expense * 100);
      if (rate >= 3) {
        parts.push('比上月' + (diff > 0 ? '多花 ' : '少花 ') + money(Math.abs(diff)) + '（' + rate + '%）。');
      } else {
        parts.push('和上月差不多。');
      }
    } else if (agg.expense > 0) {
      parts.push('共 ' + agg.count + ' 笔记录。');
    }
    var balance = agg.income - agg.expense;
    if (agg.income > 0) {
      var save = Math.round(balance / agg.income * 100);
      parts.push(save >= 0 ? '结余率 ' + save + '%。' : '这个月花超了。');
    }
    return parts.join('');
  }

  function draw(data) {
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');
    var agg = data.agg;

    /* 底：宣纸 + 回纹 */
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(56,111,98,0.08)';
    ctx.lineWidth = 1;
    for (var gy = 24; gy < H; gy += 112) {
      for (var gx = 16; gx < W; gx += 112) meander(ctx, gx, gy, 26);
    }

    /* 顶部：印章 + 名字 + 月份 */
    roundRect(ctx, PAD, 92, 76, 76, 12);
    ctx.fillStyle = SEAL;
    ctx.fill();
    ctx.fillStyle = '#FBF3E6';
    ctx.font = '700 44px ' + SERIF;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('禾', PAD + 38, 133);

    ctx.textAlign = 'left';
    ctx.fillStyle = INK;
    ctx.font = '700 38px ' + SERIF;
    ctx.fillText('青禾记账', PAD + 100, 120);
    ctx.fillStyle = MUTED;
    ctx.font = '400 22px ' + SANS;
    ctx.fillText('MONTHLY STATEMENT', PAD + 102, 155);

    ctx.textAlign = 'right';
    ctx.fillStyle = INK;
    ctx.font = '700 34px ' + SERIF;
    ctx.fillText(data.month.label, W - PAD, 122);
    ctx.fillStyle = MUTED;
    ctx.font = '400 21px ' + SANS;
    ctx.fillText(agg.count + ' 笔记录', W - PAD, 154);

    /* 分割线 + 金色短线 */
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD, 206);
    ctx.lineTo(W - PAD, 206);
    ctx.stroke();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(PAD, 206);
    ctx.lineTo(PAD + 120, 206);
    ctx.stroke();

    /* 结余 */
    var balance = agg.income - agg.expense;
    ctx.textAlign = 'left';
    ctx.fillStyle = MUTED;
    ctx.font = '400 24px ' + SANS;
    ctx.fillText('本期结余', PAD, 268);

    ctx.fillStyle = balance < 0 ? CORAL : INK;
    var balanceText = (balance < 0 ? '−' : '') + money(Math.abs(balance));
    var balanceSize = 104;
    var maxWidth = W - PAD * 2;
    ctx.font = '600 ' + balanceSize + 'px ' + SERIF;
    /* 金额特别大时自动缩字号，避免顶到右边 */
    while (ctx.measureText(balanceText).width > maxWidth && balanceSize > 54) {
      balanceSize -= 6;
      ctx.font = '600 ' + balanceSize + 'px ' + SERIF;
    }
    ctx.fillText(balanceText, PAD - 4, 360);

    /* 收入 / 支出 */
    var y2 = 424;
    ctx.font = '400 24px ' + SANS;
    ctx.fillStyle = MUTED;
    ctx.fillText('收入', PAD, y2);
    ctx.fillText('支出', PAD + 300, y2);
    ctx.font = '600 34px ' + SERIF;
    ctx.fillStyle = GREEN;
    ctx.fillText(money(agg.income), PAD, y2 + 44);
    ctx.fillStyle = CORAL;
    ctx.fillText(money(agg.expense), PAD + 300, y2 + 44);

    /* 收入支出比例条 */
    var total = agg.income + agg.expense;
    var inRatio = total > 0 ? agg.income / total : 0.5;
    var barY = 500, barW = W - PAD * 2;
    roundRect(ctx, PAD, barY, barW, 10, 5);
    ctx.fillStyle = '#EAE3D4';
    ctx.fill();
    roundRect(ctx, PAD, barY, Math.max(10, barW * inRatio), 10, 5);
    ctx.fillStyle = GREEN;
    ctx.fill();

    /* 分类 Top5 */
    ctx.fillStyle = MUTED;
    ctx.font = '400 22px ' + SANS;
    ctx.fillText('钱花在哪里', PAD, 578);
    ctx.textAlign = 'right';
    ctx.fillStyle = GOLD;
    ctx.fillText('TOP ' + Math.min(5, data.cats.length), W - PAD, 578);
    ctx.textAlign = 'left';

    var top = data.cats.slice(0, 5);
    var rowY = 618;
    if (!top.length) {
      ctx.fillStyle = MUTED;
      ctx.font = '400 26px ' + SANS;
      ctx.fillText('这个月还没有支出记录。', PAD, rowY + 30);
    }
    top.forEach(function (cat, i) {
      var y = rowY + i * 86;
      var pct = agg.expense > 0 ? cat.value / agg.expense : 0;
      var color = QH.PALETTE[i % QH.PALETTE.length];

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(PAD + 7, y + 22, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = INK;
      ctx.font = '500 27px ' + SANS;
      ctx.fillText(cat.name, PAD + 30, y + 31);

      ctx.textAlign = 'right';
      ctx.fillStyle = MUTED;
      ctx.font = '400 24px ' + SANS;
      ctx.fillText(Math.round(pct * 100) + '%', W - PAD, y + 31);
      ctx.fillStyle = INK;
      ctx.font = '600 27px ' + SERIF;
      ctx.fillText(money(cat.value), W - PAD - 82, y + 31);
      ctx.textAlign = 'left';

      roundRect(ctx, PAD, y + 50, barW, 8, 4);
      ctx.fillStyle = '#EAE3D4';
      ctx.fill();
      roundRect(ctx, PAD, y + 50, Math.max(8, barW * pct), 8, 4);
      ctx.fillStyle = color;
      ctx.fill();
    });

    /* 洞察 */
    var insightY = 1090;
    roundRect(ctx, PAD, insightY, barW, 190, 20);
    ctx.fillStyle = CARD;
    ctx.fill();
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = GOLD;
    ctx.font = '700 20px ' + SANS;
    ctx.fillText('这个月', PAD + 34, insightY + 48);

    ctx.fillStyle = INK;
    ctx.font = '400 27px ' + SANS;
    var lines = wrapText(ctx, buildInsight(data), barW - 68).slice(0, 3);
    lines.forEach(function (line, i) {
      ctx.fillText(line, PAD + 34, insightY + 92 + i * 42);
    });

    /* 底部 */
    ctx.textAlign = 'center';
    ctx.fillStyle = INK;
    ctx.font = '700 26px ' + SERIF;
    ctx.fillText('青禾记账 · 不联网的 AI 账本', W / 2, 1360);
    ctx.fillStyle = MUTED;
    ctx.font = '400 20px ' + SANS;
    ctx.fillText('说一句话就记好账 · 数据只存在我自己的设备里', W / 2, 1398);
    ctx.fillStyle = GREEN;
    ctx.font = '400 19px ' + SANS;
    ctx.fillText('qinghe-ledger.app.workbuddy.host', W / 2, 1428);

    return canvas;
  }

  function caption(data) {
    var agg = data.agg;
    var balance = agg.income - agg.expense;
    return '这个 1024，我做了一个不联网的 AI 账本。' +
      data.month.label + '记了 ' + agg.count + ' 笔，支出 ' + money(agg.expense) +
      '，结余 ' + (balance < 0 ? '−' : '') + money(Math.abs(balance)) + '。' +
      buildInsight(data) +
      ' 说一句「昨天火锅 128，打车 32」它就自己分好类记上，数据只存在我这台设备里。' +
      ' #WorkBuddy #1024程序员节';
  }

  QH.poster = {
    open: function (offset) {
      var data = collect(offset || 0);
      if (!data.agg.count) {
        QH.ui.toast('这个月还没有记录，先去记一笔吧', 'warn');
        return;
      }

      var canvas = draw(data);
      var url = canvas.toDataURL('image/png');
      var text = caption(data);
      var filename = '青禾账单-' + data.month.year + '-' + (data.month.month + 1) + '.png';

      var m = QH.ui.modal({
        title: '月度账单海报',
        subtitle: '1080 × 1440 · 在本机绘制，不上传',
        wide: true,
        body:
          '<div class="poster-wrap"><img class="poster-img" alt="月度账单海报" src="' + url + '"></div>' +
          '<p class="poster-tip">存图后可以直接发小红书 / 朋友圈；配文已经帮你写好了。</p>',
        footer:
          '<button class="btn ghost" data-copy>复制配文</button>' +
          '<div class="foot-right">' +
            '<button class="btn primary" data-save>保存图片</button>' +
          '</div>',
        onMount: function (modal) {
          modal.el.querySelector('[data-save]').addEventListener('click', function () {
            canvas.toBlob(function (blob) {
              var obj = URL.createObjectURL(blob);
              var a = document.createElement('a');
              a.href = obj;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(function () { URL.revokeObjectURL(obj); }, 1500);
              QH.ui.toast('图片已保存');
            }, 'image/png');
          });
          modal.el.querySelector('[data-copy]').addEventListener('click', function () {
            QH.ui.copy(text).then(function (ok) {
              QH.ui.toast(ok ? '配文已复制' : '复制失败，请手动选择', ok ? '' : 'warn');
            });
          });
        }
      });
      void m;
    },
    _caption: caption,
    _collect: collect
  };
})(typeof window !== 'undefined' ? window : globalThis);
