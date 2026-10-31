
/* 文书档案工作台 · 渲染层 */
(function (global) {
  'use strict';
  var U = global.U, S = global.Store;
  var esc = U.esc;

  var ICON = {
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5A2 2 0 0 1 5 5.5h3.6a2 2 0 0 1 1.6.8l.9 1.2H19a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5z"/><path d="M3 8.5 12 13l9-4.5"/><path d="M12 13v7"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>'
  };

  function tint(hex, a) {
    var h = hex.replace('#', '');
    var r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  function statusTag(name) {
    var n = S.normalizeStatusName(name);
    var st = S.getStatus(n);
    if (!st) st = { name: n, fg: '#4B5563', bg: '#F3F4F6' };
    return '<span class="tag" style="color:' + st.fg + ';background:' + st.bg + '"><i class="td"></i>' + esc(n) + '</span>';
  }

  /* 密级标签：明文/内部/秘密/机密，颜色由浅到深 */
  function secretTag(name) {
    var m = S.secretMeta(name);
    return '<span class="tag stg" style="color:' + m.fg + ';background:' + m.bg + '"><i class="td"></i>' + esc(m.name) + '</span>';
  }

  function secretTagMini(name) {
    var m = S.secretMeta(name);
    if (m.name === '明文') return '';
    return '<span class="sdot" style="background:' + m.fg + '" title="' + esc(m.name) + '"></span>';
  }

  /* 文号：资料标题下方的淡红小字，只填了才显示 */
  var ICON_CLIP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 13.5 8 15a2.8 2.8 0 0 0 4 4l5-5a4 4 0 0 0-5.7-5.7l-2 2"/><path d="M14.5 10.5 16 9a2.8 2.8 0 0 0-4-4l-5 5a4 4 0 0 0 5.7 5.7l2-2"/></svg>';

  function docNoLine(d) {
    if (!d || !d.docNo) return '';
    return '<div class="docno">' + esc(d.docNo) + '</div>';
  }

  /* 附件条数：只写标题、不存文件，列出来便于核对 */
  function attachLine(d) {
    var n = (d && d.attachments) ? d.attachments.length : 0;
    if (!n) return '';
    return '<span class="dsub"><i class="ic">' + ICON_CLIP + '</i>附件 <b>' + n + '</b> · ' +
      esc(d.attachments.join('、')) + '</span>';
  }

  /* 资料行主体：标题 + 文号 + 元信息 + 附件 */
  function docMain(d, boxName) {
    var src = d.source === 'ocr' ? '拍照识别' : (d.source === 'excel' ? 'Excel导入' : '手动输入');
    var meta = U.fmtDate(d.addedAt) + ' · ' + src + (d.statusNote ? ' · ' + esc(d.statusNote) : '');
    if (boxName) meta = esc(boxName) + ' · ' + meta;
    return '<div class="dm">' +
      '<div class="dt">' + secretTagMini(d.secret) + esc(d.title) + '</div>' +
      docNoLine(d) +
      '<div class="dmeta">' + meta + '</div>' +
      attachLine(d) +
      '</div>';
  }

  /* ============ 首页：紧凑卡片，一屏 8 个 ============ */
  function renderHome() {
    var list = U.$('#homeList');
    var boxes = S.state.boxes.slice().sort(function (a, b) { return b.updatedAt - a.updatedAt; });
    U.$('#homeEmpty').hidden = boxes.length > 0;
    list.innerHTML = '';

    boxes.forEach(function (b) {
      var stats = S.boxStats(b.id);
      // 有异常状态的优先显示
      var abnormal = [];
      S.enabledStatuses().forEach(function (st) {
        if (st.name === '在匣') return;
        if (stats.byStatus[st.name]) abnormal.push({ st: st, n: stats.byStatus[st.name] });
      });

      var card = U.el('div', 'bcard');
      card.dataset.box = b.id;
      var sub = stats.total + ' 份';
      if (b.location) sub += ' · ' + esc(b.location);

      var dots = '';
      abnormal.slice(0, 3).forEach(function (a) {
        dots += '<i class="dot" style="background:' + a.st.fg + '" title="' + esc(a.st.name) + ' ' + a.n + '份"></i>';
      });
      var abnom = abnormal.length
        ? '<span style="color:' + abnormal[0].st.fg + ';font-weight:700">' + esc(abnormal[0].st.name) + ' ' + abnormal[0].n + '</span>'
        : '';

      card.innerHTML =
        '<div class="bt" style="background:' + tint(b.color, .12) + ';color:' + b.color + '">' + ICON.folder + '</div>' +
        '<div class="bm"><div class="bn">' + esc(b.name) + '</div>' +
        '<div class="bs">' + sub + (abnom ? '<em>·</em>' + abnom : '') + '</div></div>' +
        '<div class="br">' + dots + '<span class="chev">›</span></div>';

      card.onclick = function () { global.App.go('boxDetail', { boxId: b.id }); };
      // 长按快捷菜单
      var tid = null;
      card.addEventListener('touchstart', function () {
        tid = setTimeout(function () { boxQuickMenu(b.id); }, 550);
      }, { passive: true });
      card.addEventListener('touchend', function () { clearTimeout(tid); });
      card.addEventListener('touchmove', function () { clearTimeout(tid); });
      card.addEventListener('contextmenu', function (e) { e.preventDefault(); boxQuickMenu(b.id); });
      list.appendChild(card);
    });
  }

  function boxQuickMenu(boxId) {
    var b = S.getBox(boxId);
    if (!b) return;
    U.openSheet({
      title: b.name,
      sub: '匣 ID ' + b.id + ' · 二维码固定不变',
      body: '<div class="taglist" style="padding:14px 0 0">' +
        menuRow('qr', '⛶', '查看 / 打印二维码') +
        menuRow('rename', '✏️', '重命名匣') +
        menuRow('export', '⬇️', '导出此匣清单') +
        menuRow('del', '🗑️', '删除此匣', true) +
        '</div>',
      onMount: function (s) {
        U.$$('#sheet [data-m]').forEach(function (r) {
          r.onclick = function () {
            U.closeSheet();
            var m = r.dataset.m;
            if (m === 'qr') global.App.go('qrcode', { boxId: boxId });
            else if (m === 'rename') global.App.renameBox(boxId);
            else if (m === 'export') global.App.go('export', { scope: boxId });
            else if (m === 'del') global.App.deleteBox(boxId);
          };
        });
      }
    });
  }
  function menuRow(m, ico, text, danger) {
    return '<div class="trow" data-m="' + m + '" style="' + (danger ? 'color:#DC2626' : '') + '">' +
      '<span style="width:22px;text-align:center;font-size:16px">' + ico + '</span>' +
      '<span class="tn">' + esc(text) + '</span><span class="chev">›</span></div>';
  }

  /* ============ 搜索 ============ */
  function renderSearch(q) {
    var box = U.$('#searchResult');
    if (!q || !q.trim()) {
      box.innerHTML = '<div class="empty" style="padding-top:60px">' +
        '<div class="empty-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6"/><path d="m15.2 15.2 4.3 4.3"/></svg></div>' +
        '<p class="empty-t">输入关键词搜索</p><p class="empty-s">同时匹配匣名与匣内资料名</p></div>';
      return;
    }
    var r = S.search(q);
    if (!r.boxes.length && !r.docs.length) {
      box.innerHTML = '<div class="empty" style="padding-top:60px"><p class="empty-t">没有找到「' + esc(q) + '」</p>' +
        '<p class="empty-s">换个关键词试试</p></div>';
      return;
    }
    var h = '';
    if (r.boxes.length) {
      h += '<div class="glabel">命中的匣（' + r.boxes.length + '）</div><div class="docs">';
      r.boxes.forEach(function (x) {
        h += '<div class="doc" data-box="' + x.box.id + '">' +
          '<div class="di" style="background:' + tint(x.box.color, .12) + ';color:' + x.box.color + '">' + ICON.folder + '</div>' +
          '<div class="dm"><div class="dt">' + U.hl(x.box.name, q) + '</div>' +
          '<div class="dmeta">' + (x.docs ? '含 ' + x.docs + ' 份匹配资料' : esc(x.box.location || '位置匹配')) + '</div></div>' +
          '<span class="chev" style="color:#C7CDD8">›</span></div>';
      });
      h += '</div>';
    }
    if (r.docs.length) {
      h += '<div class="glabel">命中的资料（' + r.docs.length + '）</div><div class="docs">';
      r.docs.forEach(function (x) {
        h += '<div class="doc" data-doc="' + x.doc.id + '">' +
          '<div class="di">' + ICON.doc + '</div>' +
          '<div class="dm"><div class="dt">' + U.hl(x.doc.title, q) + '</div>' +
          docNoLine(x.doc) +
          '<div class="dmeta">' + esc(x.box ? x.box.name : '（匣已删除）') + '</div>' +
          attachLine(x.doc) + '</div>' +
          '<div class="dstate">' + statusTag(x.doc.status) + '</div></div>';
      });
      h += '</div>';
    }
    box.innerHTML = h;
    U.$$('#searchResult [data-box]').forEach(function (e) {
      e.onclick = function () { global.App.go('boxDetail', { boxId: e.dataset.box }); };
    });
    U.$$('#searchResult [data-doc]').forEach(function (e) {
      e.onclick = function () { global.App.editDoc(e.dataset.doc); };
    });
  }

  /* ============ 管理页：按密级 / 按状态分类 ============ */
  var mgMode = 'secret';

  function renderManage(mode) {
    if (mode) mgMode = mode;
    var host = U.$('#mgList');
    if (!host) return;

    var groups = mgMode === 'secret' ? S.groupBySecret() : S.groupByStatus();
    var total = S.state.docs.length;
    var sum = U.$('#mgSum');
    if (sum) {
      sum.textContent = S.state.boxes.length + ' 个匣 · ' + total + ' 份资料 · ' +
        (mgMode === 'secret' ? '按密级分类' : '按状态分类');
    }
    U.$$('#mgSeg .sg').forEach(function (b) {
      b.classList.toggle('on', b.dataset.g === mgMode);
    });

    if (!total) {
      host.innerHTML = '<div class="empty" style="padding-top:60px">' +
        '<div class="empty-ico">' + ICON.doc + '</div>' +
        '<p class="empty-t">还没有资料</p>' +
        '<p class="empty-s">先在首页建匣、添加资料，这里会自动分类统计</p></div>';
      return;
    }

    var h = '<div class="mg-groups">';
    groups.forEach(function (g) {
      var pct = total ? Math.max(g.total ? 3 : 0, Math.round(g.total / total * 100)) : 0;
      // 组内涉及哪些匣，取前 3 个
      var byBox = {}, keys = [];
      g.docs.forEach(function (x) {
        var n = x.box ? x.box.name : '（匣已删除）';
        if (!byBox[n]) { byBox[n] = 0; keys.push(n); }
        byBox[n]++;
      });
      var parts = keys.slice(0, 3).map(function (n) { return esc(n) + ' ' + byBox[n]; });
      if (keys.length > 3) parts.push('等 ' + keys.length + ' 个匣');

      var sub = g.total ? '分布：' + parts.join('、')
        : (g.desc ? esc(g.desc) : '暂无资料');

      h += '<div class="gcard' + (g.total ? '' : ' zero') + '" data-g="' + esc(g.name) + '">' +
        '<div class="gc-top"><div class="gc-nm"><i class="dot" style="background:' + g.fg + '"></i>' + esc(g.name) + '</div>' +
        '<div class="gc-num" style="color:' + g.fg + '">' + g.total + '</div>' +
        '<div class="gc-unit">份 · ' + (total ? Math.round(g.total / total * 100) : 0) + '%</div></div>' +
        '<div class="gc-bar"><i style="width:' + pct + '%;background:' + g.fg + '"></i></div>' +
        '<div class="gc-sub' + (g.total ? '' : ' empty') + '">' + sub + '</div>' +
        '</div>';
    });
    h += '</div>';
    host.innerHTML = h;

    U.$$('#mgList [data-g]').forEach(function (c) {
      c.onclick = function () {
        var g = groups.filter(function (x) { return x.name === c.dataset.g; })[0];
        if (g && g.total) showGroup(g);
      };
    });
  }

  /* 点某个分类：列出该类下全部资料 */
  function showGroup(g) {
    var rows = g.docs.map(function (x) {
      return '<div class="trow" data-doc="' + x.doc.id + '">' +
        '<span class="bt-mini" style="background:' + tint(x.box ? x.box.color : '#9CA3AF', .12) +
        ';color:' + (x.box ? x.box.color : '#9CA3AF') + '">' + ICON.folder + '</span>' +
        '<span class="tn">' + esc(x.doc.title) +
        (x.doc.docNo ? '<br><span style="font-size:11.5px;color:#E11D48;font-weight:700">' + esc(x.doc.docNo) + '</span>' : '') +
        '<br><span style="font-size:11.5px;color:#9CA3AF;font-weight:600">' + esc(x.box ? x.box.name : '（匣已删除）') +
        ' · ' + esc(S.normalizeStatusName(x.doc.status)) +
        (x.doc.attachments && x.doc.attachments.length ? ' · 附件 ' + x.doc.attachments.length : '') +
        '</span></span><span class="chev">›</span></div>';
    }).join('');

    U.openSheet({
      title: g.name + ' · ' + g.total + ' 份',
      sub: (mgMode === 'secret' ? '密级分类' : '状态分类') + ' · 点任一条可查看或修改',
      body: '<div class="taglist" style="padding:14px 0 0;max-height:56vh;overflow-y:auto">' + rows + '</div>',
      onMount: function () {
        U.$$('#sheet [data-doc]').forEach(function (r) {
          r.onclick = function () {
            U.closeSheet();
            global.App.editDoc(r.dataset.doc);
          };
        });
      }
    });
  }

  /* ============ 日志页 ============ */
  function renderJournal(q) {
    var host = U.$('#jrList');
    if (!host) return;
    var list = S.searchLog(q);

    if (!list.length) {
      host.innerHTML = '<div class="empty" style="padding-top:60px">' +
        '<div class="empty-ico">' + ICON.doc + '</div>' +
        '<p class="empty-t">' + (q ? '没有匹配的日志' : '还没有日志记录') + '</p>' +
        '<p class="empty-s">' + (q ? '换个关键词试试' : '新增、修改、移动资料后都会记在这里') + '</p></div>';
      return;
    }

    var h = '<div class="jr-list">', lastDay = '';
    list.forEach(function (r) {
      var day = U.fmtDay(r.at);
      if (day !== lastDay) { h += '<div class="jr-day">' + esc(day) + '</div>'; lastDay = day; }
      h += '<div class="jr-item">' +
        '<div class="jr-t">' + U.fmtTime(r.at) + '</div>' +
        '<div class="jr-m">' +
        '<span class="jr-lb k-' + esc(r.kind || 'doc') + '">' + esc(r.label) + '</span>' +
        '<div class="jr-x">' + U.hl(r.text, q || '') + '</div>' +
        (r.boxName ? '<div class="jr-b">匣：' + esc(r.boxName) + '</div>' : '') +
        '</div></div>';
    });
    h += '</div>';
    host.innerHTML = h;
  }

  /* ============ 匣详情 ============ */
  var curFilter = '全部';

  function renderBoxDetail(boxId) {
    var b = S.getBox(boxId);
    if (!b) return;
    var stats = S.boxStats(b.id);

    U.$('#bdHero').style.background = 'linear-gradient(135deg,' + b.color + ' 0%,' + tint(b.color, .82) + ' 100%)';
    var meta = [];
    if (b.location) meta.push('📍 ' + esc(b.location));
    if (b.note) meta.push(esc(b.note));
    U.$('#bdHero').innerHTML =
      '<div class="bh-top"><div class="bh-name">' + esc(b.name) + '</div>' +
      '<div class="bh-code">' + esc(b.id) + '</div></div>' +
      '<div class="bh-stats"><div class="bst"><b>' + stats.total + '</b><span>资料总数</span></div>' +
      '<div class="bst"><b>' + U.fmtDate(b.createdAt) + '</b><span>创建日期</span></div>' +
      '<div class="bst"><b>' + U.fmtDate(b.updatedAt) + '</b><span>最近更新</span></div></div>' +
      (meta.length ? '<div class="bh-meta">' + meta.join(' · ') + '</div>' : '');

    // 筛选条
    var chips = [{ n: '全部', v: stats.total, fg: '#fff', bg: '#2563EB' }];
    S.enabledStatuses().forEach(function (st) {
      var c = stats.byStatus[st.name] || 0;
      if (c > 0) chips.push({ n: st.name, v: c, fg: st.fg, bg: st.bg });
    });
    U.$('#bdFilters').innerHTML = chips.map(function (c) {
      var on = c.n === curFilter;
      var st = on ? 'background:#2563EB;border-color:#2563EB;color:#fff'
        : 'background:' + c.bg + ';border-color:transparent;color:' + c.fg;
      return '<button class="fchip" data-f="' + esc(c.n) + '" style="' + st + '">' + esc(c.n) + ' ' + c.v + '</button>';
    }).join('');
    U.$$('#bdFilters [data-f]').forEach(function (e) {
      e.onclick = function () { curFilter = e.dataset.f; renderBoxDetail(boxId); };
    });

    // 资料列表
    var ds = S.docsOf(b.id).slice().sort(function (a, x) { return x.addedAt - a.addedAt; });
    if (curFilter !== '全部') ds = ds.filter(function (d) { return d.status === curFilter; });

    var box = U.$('#bdDocs');
    if (!ds.length) {
      box.innerHTML = '<div class="empty" style="padding-top:40px"><p class="empty-t">' +
        (stats.total ? '该状态下暂无资料' : '这个匣子还是空的') + '</p>' +
        '<p class="empty-s">' + (stats.total ? '换个状态筛选看看' : '点下方「拍照」或「添加资料」') + '</p></div>';
      return;
    }
    box.innerHTML = '<div class="docs">' + ds.map(function (d) {
      return '<div class="doc" data-doc="' + d.id + '">' +
        '<div class="di">' + ICON.doc + '</div>' +
        docMain(d, '') +
        '<div class="dstate">' + secretTag(d.secret) + statusTag(d.status) + '</div></div>';
    }).join('') + '</div>';

    U.$$('#bdDocs [data-doc]').forEach(function (e) {
      e.onclick = function () { global.App.editDoc(e.dataset.doc); };
      // 长按资料：换匣 / 改状态
      var tid = null;
      var start = function () {
        tid = setTimeout(function () { docQuickMenu(e.dataset.doc, boxId); }, 550);
      };
      var cancel = function () { clearTimeout(tid); };
      e.addEventListener('touchstart', start, { passive: true });
      e.addEventListener('touchend', cancel);
      e.addEventListener('touchmove', cancel);
      e.addEventListener('contextmenu', function (ev) { ev.preventDefault(); docQuickMenu(e.dataset.doc, boxId); });
    });
  }

  /* 长按一份资料：可以直接换到别的匣，也能快速改状态 */
  function docQuickMenu(docId, fromBoxId) {
    var d = S.getDoc(docId);
    if (!d) return;
    var others = S.state.boxes.filter(function (x) { return x.id !== fromBoxId; });

    var rows = '<div class="trow" data-m="move"><span style="width:22px;text-align:center">📦</span>' +
      '<span class="tn">移动到其他匣</span><span class="chev">›</span></div>';
    S.enabledStatuses().forEach(function (st) {
      rows += '<div class="trow" data-s="' + esc(st.name) + '">' +
        '<span class="tag" style="color:' + st.fg + ';background:' + st.bg + ';flex:none"><i class="td"></i>' + esc(st.name) + '</span>' +
        '<span class="tn">' + (S.normalizeStatusName(d.status) === st.name ? '当前状态' : '改为「' + esc(st.name) + '」') + '</span>' +
        (S.normalizeStatusName(d.status) === st.name ? '<span class="cnt">✓</span>' : '') + '</div>';
    });

    U.openSheet({
      title: d.title.length > 18 ? d.title.slice(0, 18) + '…' : d.title,
      sub: '密级 ' + S.secretMeta(d.secret).name + ' · 当前在「' + (S.getBox(fromBoxId) || { name: '未知匣' }).name + '」',
      body: '<div class="taglist" style="padding:14px 0 0">' + rows + '</div>',
      onMount: function () {
        U.$$('#sheet [data-m], #sheet [data-s]').forEach(function (r) {
          r.onclick = function () {
            if (r.dataset.m === 'move') {
              U.closeSheet();
              if (!others.length) { U.toast('只有这一个匣，先再建一个'); return; }
              pickTargetBox(d, others, fromBoxId);
              return;
            }
            var name = r.dataset.s;
            U.closeSheet();
            S.updateDoc(docId, { status: name }).then(function () {
              U.toast('已改为「' + name + '」');
              global.App.renderCurrent();
            });
          };
        });
      }
    });
  }

  /* 选择目标匣 */
  function pickTargetBox(d, others, fromBoxId) {
    var rows = others.map(function (b) {
      var n = S.docsOf(b.id).length;
      return '<div class="trow" data-b="' + b.id + '">' +
        '<span class="bt-mini" style="background:' + tint(b.color, .12) + ';color:' + b.color + '">' + ICON.folder + '</span>' +
        '<span class="tn">' + esc(b.name) + '</span>' +
        '<span class="cnt">' + n + ' 份</span><span class="chev">›</span></div>';
    }).join('');
    U.openSheet({
      title: '移动到',
      sub: '目标匣的二维码与匣 ID 不受影响',
      body: '<div class="taglist" style="padding:14px 0 0">' + rows + '</div>',
      onMount: function () {
        U.$$('#sheet [data-b]').forEach(function (r) {
          r.onclick = function () {
            var to = r.dataset.b;
            U.closeSheet();
            S.moveDoc(d.id, to).then(function () {
              var box = S.getBox(to);
              U.toast('已移到「' + (box ? box.name : '') + '」');
              global.App.renderCurrent();
            });
          };
        });
      }
    });
  }

  /* ============ 二维码 ============ */
  function renderQR(boxId) {
    var b = S.getBox(boxId);
    if (!b) return;
    U.$('#qrName').textContent = b.name;
    U.$('#qrId').textContent = b.id;
    U.$('#qrCount').textContent = S.docsOf(b.id).length;
    U.$('#qrCreated').textContent = U.fmtDate(b.createdAt);

    var host = U.$('#qrImg');
    host.innerHTML = '';
    new QRCode(host, {
      text: b.id,
      width: 200, height: 200,
      colorDark: '#111827', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  /* ============ 状态管理 ============ */
  function renderStatus() {
    var bi = U.$('#stBuiltin'), cu = U.$('#stCustom');
    bi.innerHTML = ''; cu.innerHTML = '';

    S.state.statuses.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); })
      .forEach(function (st) {
        var n = S.state.docs.filter(function (d) { return d.status === st.name; }).length;
        var row = U.el('div', 'trow');
        row.innerHTML =
          '<span class="tag" style="color:' + st.fg + ';background:' + st.bg + ';flex:none"><i class="td"></i>' + esc(st.name) + '</span>' +
          '<span class="tn" style="font-weight:600;color:#6B7280;font-size:12.5px">' + esc(st.desc || '') + '</span>' +
          '<span class="cnt">' + n + ' 份</span>' +
          (st.builtin ? '<span class="sw ' + (st.enabled !== false ? 'on' : '') + '" data-en="' + esc(st.name) + '"><i></i></span>'
            : '<span class="chev">›</span>');
        if (st.builtin) {
          row.querySelector('[data-en]').onclick = function (e) {
            e.stopPropagation();
            var on = !row.querySelector('.sw').classList.contains('on');
            S.updateStatus(st.name, { enabled: on }).then(function () {
              row.querySelector('.sw').classList.toggle('on', on);
              U.toast(on ? '已启用「' + st.name + '」' : '已停用「' + st.name + '」');
            });
          };
        } else {
          row.onclick = function () { global.App.editStatus(st.name); };
        }
        (st.builtin ? bi : cu).appendChild(row);
      });

    if (!cu.children.length) {
      cu.innerHTML = '<div style="font-size:13px;color:#9CA3AF;padding:8px 4px">还没有自定义状态，点下方按钮新建</div>';
    }
  }

  /* ============ 匣设置 ============ */
  function renderBoxSettings(boxId) {
    var b = S.getBox(boxId);
    if (!b) return;
    var stats = S.boxStats(b.id);
    U.$('#bsHero').style.background = 'linear-gradient(135deg,' + b.color + ' 0%,' + tint(b.color, .82) + ' 100%)';
    U.$('#bsHero').innerHTML =
      '<div class="bh-top"><div class="bh-name">' + esc(b.name) + '</div>' +
      '<div class="bh-code">' + esc(b.id) + '</div></div>' +
      '<div class="bh-stats"><div class="bst"><b>' + stats.total + '</b><span>资料总数</span></div>' +
      '<div class="bst"><b>' + U.fmtDate(b.createdAt) + '</b><span>创建日期</span></div></div>';
    U.$('#bsColor').innerHTML = '<i style="display:inline-block;width:13px;height:13px;border-radius:4px;background:' + b.color + ';vertical-align:-2px"></i>';
    U.$('#bsLoc').textContent = b.location || '未设置';
    U.$('#bsNote').textContent = b.note || '未设置';
  }

  /* ============ 导出 ============ */
  function renderExport(scope) {
    var sel = U.$('#exScope');
    var boxes = S.state.boxes;
    sel.innerHTML = '<option value="all">整个库（' + boxes.length + ' 匣 / ' + S.state.docs.length + ' 份）</option>' +
      boxes.map(function (b) { return '<option value="' + b.id + '">' + esc(b.name) + '</option>'; }).join('');
    if (scope && scope !== 'all') sel.value = scope;
    refreshExportInfo();
  }

  function refreshExportInfo() {
    var mode = getExportMode();
    var scope = U.$('#exScope').value;
    var withPhotos = U.$('#exPhotos').classList.contains('on');
    var withTime = U.$('#exTime').classList.contains('on');
    var data = S.buildExport(scope, { includePhotos: withPhotos, includeTime: withTime });

    var totalDocs = 0;
    data.boxes.forEach(function (b) { totalDocs += b.docs.length; });
    var json = JSON.stringify(data);
    var size = mode === 'json' ? json : S.toCSV(data);

    var fname, sub, tip;
    if (mode === 'json') {
      fname = '文书档案工作台清单' + (scope === 'all' ? '' : '_' + (S.getBox(scope) || {}).name) + '.json';
      sub = data.boxes.length + ' 匣 · ' + totalDocs + ' 份资料 · ' + fmtSize(json.length);
      tip = '结构化字段：匣ID、匣名、位置、资料标题、状态、备注、录入时间、录入方式' +
        (withPhotos ? '、封面照片' : '') + ' —— 另一台手机导入即可完整还原。';
    } else {
      fname = '文书档案工作台清单' + (scope === 'all' ? '' : '_' + (S.getBox(scope) || {}).name) + '.csv';
      sub = totalDocs + ' 行 · ' + fmtSize(size.length);
      tip = 'CSV 可直接用 Excel 打开，适合打印成纸质清单存档。注意：CSV 不含二维码 ID 的导入能力，跨机迁移请用 JSON。';
    }
    U.$('#exName').textContent = fname;
    U.$('#exSub').textContent = sub;
    U.$('#exTip').textContent = tip;
    U.$('#exIco').textContent = mode === 'json' ? 'JSON' : 'CSV';
    U.$('#exIco').className = 'fico' + (mode === 'json' ? '' : ' csv');

    // 小二维码：内容短时才画（整库导出时提示改用文件）
    var host = U.$('#exQr');
    host.innerHTML = '';
    if (json.length <= 1200) {
      try {
        new QRCode(host, { text: json, width: 56, height: 56, colorDark: '#111827', colorLight: '#fff', correctLevel: QRCode.CorrectLevel.L });
      } catch (e) { host.innerHTML = '<div style="font-size:10px;color:#9CA3AF;text-align:center;line-height:1.3">内容较大<br>请用文件</div>'; }
    } else {
      host.innerHTML = '<div style="font-size:10px;color:#9CA3AF;text-align:center;line-height:1.3;padding:6px">内容较大<br>请用文件</div>';
    }
  }

  function getExportMode() {
    var on = U.$('#exModes .mode.on');
    return on ? on.dataset.mode : 'json';
  }

  function fmtSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1024 / 1024).toFixed(1) + ' MB';
  }

  global.R = {
    ICON: ICON, tint: tint, statusTag: statusTag,
    docNoLine: docNoLine, attachLine: attachLine, docMain: docMain,
    renderHome: renderHome, renderSearch: renderSearch,
    renderManage: renderManage, renderJournal: renderJournal,
    renderBoxDetail: renderBoxDetail, renderQR: renderQR,
    renderStatus: renderStatus, renderBoxSettings: renderBoxSettings,
    renderExport: renderExport, refreshExportInfo: refreshExportInfo,
    getExportMode: getExportMode, fmtSize: fmtSize,
    resetFilter: function () { curFilter = '全部'; }
  };
})(window);

