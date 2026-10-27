
/* 文书档案工作台 · 主控 */
(function (global) {
  'use strict';
  var U = global.U, S = global.Store, R = global.R;
  var $ = U.$, $$ = U.$$;

  var stack = [];   // 页面栈
  var cur = { name: 'home', params: {} };

  /* ---------- 导航 ----------
   * 三个主页面（首页 / 管理 / 日志）横向排布，左右滑动切换；
   * 其余页面仍是原来的整屏压栈导航。 */
  var MAIN_PAGES = ['home', 'manage', 'journal'];
  var MAIN_TAB = { home: '首页', manage: '管理', journal: '日志' };

  function isMain(n) { return MAIN_PAGES.indexOf(n) >= 0; }
  function mainIndex(n) { return MAIN_PAGES.indexOf(n); }

  var TITLES = {
    home: '我的匣', manage: '管理', journal: '日志',
    search: '搜索', createBox: '创建匣',
    boxDetail: '', qrcode: '匣二维码', scan: '扫描二维码',
    capture: '拍照录入', docForm: '', export: '导出清单',
    import: '导入清单', status: '状态管理', boxSettings: '匣设置'
  };

  function go(name, params, replace) {
    params = params || {};
    if (!replace) stack.push({ name: cur.name, params: cur.params });
    cur = { name: name, params: params };
    show();
  }

  /* 主页面之间互切：不进页面栈，返回键一律回首页 */
  function switchMain(name, anim) {
    if (!isMain(name)) return;
    cur = { name: name, params: {} };
    show(anim);
  }

  function back() {
    if (isMain(cur.name) && cur.name !== 'home') { switchMain('home', true); return; }
    if (stack.length) {
      var p = stack.pop();
      cur = { name: p.name, params: p.params };
      // 退回主页面时也要把横向位置归位
      show(true);
    } else {
      cur = { name: 'home', params: {} };
      show(true);
    }
  }

  function setPagerIndex(i, anim) {
    var t = $('#ptrack');
    if (!t) return;
    if (anim) t.classList.add('anim'); else t.classList.remove('anim');
    t.style.transform = 'translateX(' + (-i * (100 / MAIN_PAGES.length)) + '%)';
    $$('#tabs .tab').forEach(function (b, k) { b.classList.toggle('on', k === i); });
  }

  function show(anim) {
    // 离开扫码/拍照页时关闭摄像头
    if (cur.name !== 'scan') global.Scan.stop();
    if (cur.name !== 'capture') stopCaptureCam();

    var mi = mainIndex(cur.name);
    var pager = $('#pager');
    if (mi >= 0) {
      pager.classList.add('on');
      setPagerIndex(mi, !!anim);
      $$('#stage > .screen').forEach(function (s) { s.classList.remove('on'); });
    } else {
      pager.classList.remove('on');
      $$('#stage > .screen').forEach(function (s) {
        s.classList.toggle('on', s.dataset.screen === cur.name);
      });
    }

    var t = TITLES[cur.name];
    var titleEl = $('#tbTitle');
    if (cur.name === 'boxDetail' || cur.name === 'docForm') {
      var b = S.getBox(cur.params.boxId) || S.getBox($('#dfBox') && $('#dfBox').value);
      t = cur.name === 'boxDetail' ? (b ? b.name : '匣') : (cur.params.docId ? '编辑资料' : '添加资料');
    }
    titleEl.textContent = t;
    titleEl.classList.toggle('sm', t.length > 8);

    // 主页面用页签代替标题
    $('#tabs').hidden = (mi < 0);
    titleEl.hidden = (mi >= 0);

    $('#btnBack').hidden = (mi >= 0);
    var right = $('#tbRight');
    right.innerHTML = '';

    if (cur.name === 'home') {
      var plus = U.el('button', 'tb-act', '<span style="font-size:17px;line-height:1">+</span>创建匣');
      plus.onclick = function () { go('createBox'); };
      right.appendChild(plus);
      var more = U.el('button', 'tb-icon');
      more.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>';
      more.onclick = homeMenu;
      right.appendChild(more);
    } else if (cur.name === 'boxDetail') {
      var qr = U.el('button', 'tb-act ghost');
      qr.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V6a2 2 0 0 1 2-2h3"/><path d="M15 4h3a2 2 0 0 1 2 2v3"/><path d="M20 15v3a2 2 0 0 1-2 2h-3"/><path d="M9 20H6a2 2 0 0 1-2-2v-3"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/></svg> 二维码';
      qr.onclick = function () { go('qrcode', { boxId: cur.params.boxId }); };
      right.appendChild(qr);
      var set = U.el('button', 'tb-icon');
      set.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a1.9 1.9 0 0 1-3.8 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a1.9 1.9 0 0 1 0-3.8h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a1.9 1.9 0 0 1 3.8 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a1.9 1.9 0 0 1 0 3.8h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>';
      set.onclick = function () { go('boxSettings', { boxId: cur.params.boxId }); };
      right.appendChild(set);
    } else if (cur.name === 'status') {
      var add = U.el('button', 'tb-act ghost', '＋ 新增');
      add.onclick = editStatus;
      right.appendChild(add);
    } else if (cur.name === 'journal') {
      var clr = U.el('button', 'tb-act ghost', '清空');
      clr.onclick = clearJournal;
      right.appendChild(clr);
    }

    renderCurrent();
  }

  function renderCurrent() {
    var p = cur.params;
    switch (cur.name) {
      case 'home': R.renderHome(); break;
      case 'manage': R.renderManage(); break;
      case 'journal': R.renderJournal($('#jrInput') ? $('#jrInput').value : ''); break;
      case 'boxDetail': R.renderBoxDetail(p.boxId); break;
      case 'qrcode': R.renderQR(p.boxId); break;
      case 'status': R.renderStatus(); break;
      case 'boxSettings': R.renderBoxSettings(p.boxId); break;
      case 'export': R.renderExport(p.scope); break;
      case 'search': R.renderSearch($('#searchInput').value); break;
      case 'createBox': resetCreateForm(); break;
      case 'docForm': break;
      case 'scan': startScan(); break;
      case 'capture': startCapture(); break;
      case 'import': resetImport(); break;
    }
  }

  function homeMenu() {
    U.openSheet({
      title: '更多',
      body: '<div class="taglist" style="padding:12px 0 0">' +
        '<div class="trow" data-m="scan"><span style="width:22px;text-align:center">⛶</span><span class="tn">扫匣二维码</span><span class="chev">›</span></div>' +
        '<div class="trow" data-m="status"><span style="width:22px;text-align:center">🏷</span><span class="tn">状态管理</span><span class="chev">›</span></div>' +
        '<div class="trow" data-m="export"><span style="width:22px;text-align:center">⬇️</span><span class="tn">导出清单</span><span class="chev">›</span></div>' +
        '<div class="trow" data-m="import"><span style="width:22px;text-align:center">⬆️</span><span class="tn">导入清单</span><span class="chev">›</span></div>' +
        '<div class="trow" data-m="trash"><span style="width:22px;text-align:center">🗑️</span><span class="tn">回收站</span><span class="chev">›</span></div>' +
        '<div class="trow" data-m="about"><span style="width:22px;text-align:center">ℹ️</span><span class="tn">关于</span><span class="chev">›</span></div>' +
        '</div>',
      onMount: function () {
        $$('#sheet [data-m]').forEach(function (r) {
          r.onclick = function () {
            U.closeSheet();
            var m = r.dataset.m;
            if (m === 'scan') go('scan');
            else if (m === 'status') go('status');
            else if (m === 'export') go('export');
            else if (m === 'import') go('import');
            else if (m === 'trash') showTrash();
            else if (m === 'about') showAbout();
          };
        });
      }
    });
  }

  /* ---------- 主页面左右滑动 ---------- */
  function bindPagerSwipe() {
    var pager = $('#pager');
    if (!pager) return;
    var x0 = 0, y0 = 0, tracking = false;
    pager.addEventListener('touchstart', function (e) {
      if (mainIndex(cur.name) < 0 || e.touches.length !== 1) { tracking = false; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; tracking = true;
    }, { passive: true });
    pager.addEventListener('touchmove', function (e) {
      // 竖向滚动时不抢手势
      if (!tracking || e.touches.length !== 1) return;
      var dx = Math.abs(e.touches[0].clientX - x0), dy = Math.abs(e.touches[0].clientY - y0);
      if (dy > dx) tracking = false;
    }, { passive: true });
    pager.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var t = e.changedTouches[0];
      if (!t) return;
      var dx = t.clientX - x0, dy = t.clientY - y0;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      var i = mainIndex(cur.name);
      var next = dx < 0 ? i + 1 : i - 1;   // 手指向左划 → 翻到右边那一页
      if (next < 0 || next >= MAIN_PAGES.length) return;
      switchMain(MAIN_PAGES[next], true);
    }, { passive: true });
  }

  function clearJournal() {
    var n = S.state.log.length;
    if (!n) { U.toast('日志已经是空的'); return; }
    U.confirm({
      title: '清空日志？',
      sub: '共 ' + n + ' 条记录会被清掉。匣和资料本身不受影响，只是不再留下痕迹。',
      okText: '清空', danger: true
    }).then(function (ok) {
      if (!ok) return;
      S.clearLog().then(function () { U.toast('日志已清空'); renderCurrent(); });
    });
  }

  /* ---------- 创建匣 ---------- */
  var newBoxColor = S.COLORS[0];
  function resetCreateForm() {
    $('#nbName').value = '';
    $('#nbLocation').value = '';
    $('#nbNote').value = '';
    newBoxColor = S.COLORS[S.state.boxes.length % S.COLORS.length];
    $('#nbColors').innerHTML = S.COLORS.map(function (c) {
      return '<button class="color-dot' + (c === newBoxColor ? ' on' : '') + '" data-c="' + c + '" style="background:' + c + '"></button>';
    }).join('');
    $$('#nbColors [data-c]').forEach(function (b) {
      b.onclick = function () {
        newBoxColor = b.dataset.c;
        $$('#nbColors .color-dot').forEach(function (x) { x.classList.toggle('on', x === b); });
      };
    });
  }

  function submitNewBox() {
    var name = $('#nbName').value.trim();
    if (!name) { U.toast('请先填写匣名称'); $('#nbName').focus(); return; }
    S.addBox({ name: name, color: newBoxColor, location: $('#nbLocation').value, note: $('#nbNote').value })
      .then(function (b) {
        U.toast('已创建 · 二维码 ID ' + b.id);
        stack.push({ name: 'home', params: {} });
        cur = { name: 'boxDetail', params: { boxId: b.id } };
        show();
      });
  }

  /* ---------- 匣操作 ---------- */
  function renameBox(boxId) {
    var b = S.getBox(boxId);
    if (!b) return;
    U.prompt({
      title: '重命名匣',
      sub: '只改显示名，二维码 ' + b.id + ' 不变',
      label: '匣名称', value: b.name, max: 40
    }).then(function (v) {
      if (!v) return;
      S.updateBox(boxId, { name: v }).then(function () {
        U.toast('已重命名');
        if (cur.name === 'boxDetail') R.renderBoxDetail(boxId);
        else if (cur.name === 'boxSettings') R.renderBoxSettings(boxId);
        else R.renderHome();
      });
    });
  }

  function deleteBox(boxId) {
    var b = S.getBox(boxId);
    if (!b) return;
    var n = S.docsOf(boxId).length;
    U.confirm({
      title: '删除「' + b.name + '」？',
      sub: '匣内 ' + n + ' 份资料将一并移入回收站，可恢复',
      okText: '删除', danger: true
    }).then(function (ok) {
      if (!ok) return;
      S.deleteBox(boxId).then(function () {
        U.toast('已删除，可在回收站恢复');
        stack = [];
        cur = { name: 'home', params: {} };
        show();
      });
    });
  }

  function editField(boxId, key, label, placeholder) {
    var b = S.getBox(boxId);
    U.prompt({
      title: '修改' + label, label: label, value: b[key] || '', placeholder: placeholder, max: 40
    }).then(function (v) {
      if (v === null) return;
      var patch = {}; patch[key] = v;
      S.updateBox(boxId, patch).then(function () {
        R.renderBoxSettings(boxId);
        U.toast('已保存');
      });
    });
  }

  function pickColor(boxId) {
    var b = S.getBox(boxId);
    U.openSheet({
      title: '选择色标',
      body: '<div class="colors" style="padding:12px 0">' + S.COLORS.map(function (c) {
        return '<button class="color-dot' + (c === b.color ? ' on' : '') + '" data-c="' + c + '" style="background:' + c + ';width:42px;height:42px"></button>';
      }).join('') + '</div>',
      onMount: function () {
        $$('#sheet [data-c]').forEach(function (x) {
          x.onclick = function () {
            S.updateBox(boxId, { color: x.dataset.c }).then(function () {
              U.closeSheet(); R.renderBoxSettings(boxId); U.toast('已更新色标');
            });
          };
        });
      }
    });
  }

  function regenId(boxId) {
    var b = S.getBox(boxId);
    U.confirm({
      title: '重新生成二维码 ID？',
      sub: '当前 ID ' + b.id + ' 将失效。贴在匣上的旧贴纸必须撕掉重印，否则扫码会找不到这个匣。',
      okText: '仍然重新生成', danger: true
    }).then(function (ok) {
      if (!ok) return;
      S.regenBoxId(boxId).then(function (nid) {
        U.toast('新 ID：' + nid + '，请重印贴纸');
        cur.params.boxId = nid;
        stack.forEach(function (s) { if (s.params && s.params.boxId === boxId) s.params.boxId = nid; });
        R.renderBoxSettings(nid);
      });
    });
  }

  /* ---------- 资料 ---------- */
  var formDocId = null, formPhotos = [], formStatus = '在匣', formSecret = '明文';
  var formAttachments = [];
  var ICON_CLIP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 13.5 8 15a2.8 2.8 0 0 0 4 4l5-5a4 4 0 0 0-5.7-5.7l-2 2"/><path d="M14.5 10.5 16 9a2.8 2.8 0 0 0-4-4l-5 5a4 4 0 0 0 5.7 5.7l2-2"/></svg>';

  function openDocForm(opts) {
    formDocId = opts.docId || null;
    formPhotos = opts.photos ? opts.photos.slice() : [];
    formStatus = S.normalizeStatusName(opts.status || '在匣');
    formSecret = opts.secret || '明文';
    formAttachments = opts.attachments ? opts.attachments.slice() : [];

    // 匣下拉
    var sel = $('#dfBox');
    sel.innerHTML = S.state.boxes.map(function (b) {
      return '<option value="' + b.id + '"' + (b.id === opts.boxId ? ' selected' : '') + '>' + U.esc(b.name) + '</option>';
    }).join('');

    var d = opts.docId ? S.getDoc(opts.docId) : null;
    $('#dfTitle').value = d ? d.title : (opts.title || '');
    $('#dfNote').value = d ? (d.statusNote || '') : '';
    $('#dfDocNo').value = d ? (d.docNo || '') : (opts.docNo || '');
    $('#dfAttachInput').value = '';
    if (d) {
      sel.value = d.boxId;
      formStatus = S.normalizeStatusName(d.status);
      formSecret = S.secretMeta(d.secret).name;
      formPhotos = (d.photos || []).slice();
      formAttachments = (d.attachments || []).slice();
    }

    renderStatusChips();
    renderSecretChips();
    renderThumbs();
    renderAttach();
    go('docForm', { boxId: opts.boxId, docId: opts.docId });
  }

  /* 附件：只记标题，不存文件本体 */
  function renderAttach() {
    var box = $('#dfAttach');
    if (!box) return;
    box.innerHTML = '';
    formAttachments.forEach(function (t, i) {
      var it = U.el('div', 'att-item');
      it.innerHTML = '<i class="ai-ic">' + ICON_CLIP + '</i>' +
        '<span class="ai-t">' + U.esc(t) + '</span>' +
        '<button class="ai-x" data-i="' + i + '">✕</button>';
      it.querySelector('.ai-x').onclick = function () {
        formAttachments.splice(i, 1); renderAttach();
      };
      box.appendChild(it);
    });
  }

  function addAttach() {
    var inp = $('#dfAttachInput');
    var v = (inp.value || '').trim();
    if (!v) { U.toast('先输入附件标题'); inp.focus(); return; }
    if (formAttachments.indexOf(v) >= 0) { U.toast('这个附件已经加过了'); return; }
    formAttachments.push(v);
    inp.value = '';
    renderAttach();
    inp.focus();
  }

  function renderStatusChips() {
    var box = $('#dfStatus');
    box.innerHTML = '';
    S.enabledStatuses().forEach(function (st) {
      var c = U.el('button', 'chip' + (st.name === formStatus ? ' on' : ''), U.esc(st.name));
      if (st.name === formStatus) c.style.background = st.fg;
      c.onclick = function () {
        formStatus = st.name;
        renderStatusChips();
      };
      box.appendChild(c);
    });
    var add = U.el('button', 'chip', '自定义…');
    add.onclick = function () {
      U.prompt({ title: '新建自定义状态', label: '状态名称', placeholder: '如：待销毁', max: 10 })
        .then(function (v) {
          if (!v) return;
          if (S.getStatus(v)) { U.toast('已存在同名状态'); return; }
          S.addStatus({ name: v, fg: '#6D28D9', bg: '#EDE9FE', desc: '自定义状态' }).then(function () {
            formStatus = v; renderStatusChips(); U.toast('已添加状态「' + v + '」');
          });
        });
    };
    box.appendChild(add);
  }

  function renderSecretChips() {
    var box = $('#dfSecret');
    if (!box) return;
    box.innerHTML = '';
    S.SECRET_LEVELS().forEach(function (lv) {
      var c = U.el('button', 'chip' + (lv.name === formSecret ? ' on' : ''), U.esc(lv.name));
      if (lv.name === formSecret) c.style.background = lv.fg;
      c.onclick = function () { formSecret = lv.name; renderSecretChips(); };
      box.appendChild(c);
    });
  }

  function renderThumbs() {
    var box = $('#dfThumbs');
    box.innerHTML = '';
    formPhotos.forEach(function (src, i) {
      var w = U.el('div', 'thumb-wrap');
      w.innerHTML = '<img class="thumb" src="' + src + '">' +
        '<button class="thumb-del" data-i="' + i + '">✕</button>';
      w.querySelector('.thumb-del').onclick = function () {
        formPhotos.splice(i, 1); renderThumbs();
      };
      box.appendChild(w);
    });
    if (formPhotos.length < 3) {
      var add = U.el('button', 'thumb-add', '＋');
      add.onclick = function () { pickImage(function (d) { formPhotos.push(d); renderThumbs(); }); };
      box.appendChild(add);
    }
  }

  function pickImage(cb) {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = function () {
      if (!inp.files || !inp.files[0]) return;
      U.compressImage(inp.files[0], 620, 0.72).then(cb);
    };
    inp.click();
  }

  /* 选清单文件。
     关键：这里不设 accept。之前设了 accept=".json"，
     安卓的 WebView 会把它当成类型过滤器、直接把「选择文件」弹成相册；
     不设 accept → 壳里按「选文件」分支走系统文件管理器。
     浏览器里同样不设 accept，用户自己在文件管理器里挑 .json 即可。 */
  function openFilePicker() {
    var inp = $('#imFile');
    if (!inp) return;
    inp.removeAttribute('accept');
    if (window.HejiApp && typeof window.HejiApp.pickFile === 'function') {
      // 原生壳：拉起系统文件管理器，选中后回吐文本给 __onPickedFile
      try { window.HejiApp.pickFile(); return; } catch (e) { /* 退回 WebView 原生选择 */ }
    }
    inp.click();
  }

  /* 原生壳选完文件后回调到这里 */
  window.__onPickedFile = function (text) {
    if (!text) return;
    try {
      applyImportData(JSON.parse(text));
    } catch (e) {
      U.toast('不是有效的 JSON 清单文件，请选择导出时保存的清单');
    }
  };

  /* ---------- Excel 批量导入 ---------- */
  /* 选 Excel：不设 accept，避免安卓把文件选择器弹成图库 */
  function pickExcel() {
    if (!global.XLSX) { U.toast('Excel 组件没加载出来，请刷新重试'); return; }
    bindExcelInput();
    var inp = $('#imExcel');
    if (inp) inp.click();
  }

  /* 给隐藏的 Excel 输入控件绑一次解析逻辑（不用每次都重建） */
  function bindExcelInput() {
    var inp = $('#imExcel');
    if (!inp || inp.dataset.bound) return;
    inp.dataset.bound = '1';
    var run = function (f) {
      if (!f) return;
      if (!/\.(xlsx|xlsm|xls|csv)$/i.test(f.name)) {
        U.toast('请选 Excel 文件（.xlsx / .xls），或先下载模板');
        return;
      }
      U.loading(true, '解析表格…');
      var fr = new FileReader();
      fr.onload = function (e) {
        var rows = null, err = null;
        try {
          var wb = global.XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
          var ws = wb.Sheets[wb.SheetNames[0]];
          rows = global.XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false });
        } catch (ex) { err = ex; }
        U.loading(false);
        if (err || !rows) { U.toast('表格打不开：' + ((err && err.message) || '未知错误')); return; }
        var parsed = S.parseExcelRows(rows);
        parsed.__excel = true;
        if (!parsed.totalRows) {
          if (parsed.errors && parsed.errors.length) U.toast(parsed.errors[0], 3200);
          else U.toast('没解析到资料行');
          return;
        }
        applyImportData(parsed);
        U.toast('解析到 ' + parsed.totalRows + ' 份资料，确认后导入', 2600);
      };
      fr.onerror = function () { U.loading(false); U.toast('文件读取失败'); };
      fr.readAsArrayBuffer(f);
    };
    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      inp.value = '';
      run(f);
    };
  }

  /* 模板由本应用生成，列固定，用户只需照着填 */
  function downloadTemplate() {
    if (!global.XLSX) { U.toast('Excel 组件没加载出来，请刷新重试'); return; }
    try {
      var rows = S.templateRows();
      var ws = global.XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 20 }, { wch: 14 }, { wch: 34 }, { wch: 20 },
        { wch: 8 }, { wch: 8 }, { wch: 16 }, { wch: 26 }];
      var wb = global.XLSX.utils.book_new();
      global.XLSX.utils.book_append_sheet(wb, ws, '导入模板');
      var buf = global.XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      var blob = new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      shareBlob(S.TPL_NAME, blob);
      U.toast('模板已生成，填好后回来点「Excel 批量导入」');
    } catch (e) {
      U.toast('生成模板失败：' + (e.message || e));
    }
  }

  function shareBlob(name, blob) {
    try {
      var file = new File([blob], name, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: name }).catch(function () { saveBlob(name, blob); });
        return;
      }
    } catch (e) { /* 不支持分享就下载 */ }
    saveBlob(name, blob);
  }

  function saveBlob(name, blob) {
    /* 安卓壳里 blob: 下载会被 WebView 直接忽略，必须走原生保存桥 */
    if (window.HejiApp && typeof window.HejiApp.saveFile === 'function') {
      var fr = new FileReader();
      fr.onload = function () {
        var b64 = String(fr.result || '').split(',')[1] || '';
        try {
          window.HejiApp.saveFile(name, blob.type || 'application/octet-stream', b64);
          U.toast('已交给系统保存，选个位置放好', 2600);
        } catch (e) { fallbackBlob(name, blob); }
      };
      fr.onerror = function () { fallbackBlob(name, blob); };
      fr.readAsDataURL(blob);
      return;
    }
    fallbackBlob(name, blob);
  }

  function fallbackBlob(name, blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () {
      document.body.removeChild(a); URL.revokeObjectURL(url);
    }, 500);
    U.toast('已保存到本机下载目录');
  }

  function submitDoc() {
    var title = $('#dfTitle').value.trim();
    if (!title) { U.toast('请填写文件标题'); $('#dfTitle').focus(); return; }
    var boxId = $('#dfBox').value;
    if (!boxId) { U.toast('请先创建一个匣'); return; }
    var data = {
      boxId: boxId, title: title, status: formStatus,
      secret: formSecret,
      docNo: ($('#dfDocNo') ? $('#dfDocNo').value.trim() : ''),
      attachments: formAttachments.slice(),
      statusNote: $('#dfNote').value.trim(),
      photos: formPhotos, source: 'manual'
    };
    if (formDocId) {
      /* 修 bug：原来这里连退两级，改完状态一点保存就一路弹回首页。
         现在保存后停在资料设置页，方便接着改别的字段，要退出点左上角返回。 */
      var stayId = formDocId;
      S.updateDoc(stayId, data).then(function () {
        U.toast('已保存');
        cur.params.boxId = data.boxId;
        renderAttach();
        renderThumbs();
        flashSaved();
      });
    } else {
      S.addDoc(data).then(function () {
        U.toast('已添加「' + title + '」');
        back();
        if (cur.name === 'boxDetail') R.renderBoxDetail(cur.params.boxId);
      });
    }
  }

  /* 保存后给个明确的落点反馈，免得看着像没反应 */
  function flashSaved() {
    var btn = $('#dfSubmit');
    if (!btn) return;
    btn.textContent = '已保存 ✓';
    btn.disabled = true;
    setTimeout(function () {
      btn.textContent = '保存'; btn.disabled = false;
    }, 1100);
  }

  function editDoc(docId) {
    var d = S.getDoc(docId);
    if (!d) return;
    var b = S.getBox(d.boxId);
    var st = S.getStatus(d.status);
    U.openSheet({
      title: d.title,
      sub: (b ? b.name : '（匣已删除）') + ' · ' + U.fmtDateTime(d.addedAt) +
        ' · ' + (d.source === 'ocr' ? '拍照识别' : '手动输入'),
      body: '<div class="field" style="margin-top:14px"><label class="lb">切换状态</label>' +
        '<div class="chips" id="__stchips"></div></div>' +
        '<div class="field"><label class="lb">状态备注</label>' +
        '<input class="ipt" id="__sn" value="' + U.esc(d.statusNote || '') + '" placeholder="如：借予李科长" maxlength="40"></div>',
      actions: [
        { text: '删除', kind: 'sec', onClick: function () {
          U.closeSheet();
          U.confirm({ title: '删除这份资料？', sub: d.title, okText: '删除', danger: true })
            .then(function (ok) { if (ok) S.deleteDoc(docId).then(function () { U.toast('已删除'); renderCurrent(); }); });
        } },
        { text: '编辑', kind: 'pri', onClick: function () { U.closeSheet(); openDocForm({ docId: docId }); } }
      ],
      onMount: function () {
        var box = $('#__stchips');
        S.enabledStatuses().forEach(function (s) {
          var c = U.el('button', 'chip' + (s.name === d.status ? ' on' : ''), U.esc(s.name));
          if (s.name === d.status) c.style.background = s.fg;
          c.onclick = function () {
            S.updateDoc(docId, { status: s.name }).then(function () {
              U.closeSheet(); U.toast('已改为「' + s.name + '」'); renderCurrent();
            });
          };
          box.appendChild(c);
        });
        $('#__sn').onchange = function () {
          S.updateDoc(docId, { statusNote: $('#__sn').value.trim() });
        };
      }
    });
  }

  /* ---------- 扫码 ---------- */
  function startScan() {
    var tip = $('#scanTip');
    tip.textContent = '将档案匣上的二维码放入框内';
    $('#scanHit').hidden = true;
    $('#scanVideo').srcObject = null;

    global.Scan.start({
      video: $('#scanVideo'),
      facing: 'environment',
      onResult: onScanned
    }).catch(function (e) {
      tip.textContent = '无法打开摄像头：' + (e && e.name === 'NotAllowedError' ? '没有相机权限' : (e.message || e.name));
      tip.style.color = '#FCA5A5';
    });
  }

  function onScanned(text) {
    var r = global.Scan.handleRaw(text);
    if (r.type === 'box') {
      var b = r.box;
      var stats = S.boxStats(b.id);
      var hit = $('#scanHit');
      hit.innerHTML = '<div style="flex:1;min-width:0"><div class="sh-t">✓ 已识别匣 ID</div>' +
        '<div class="sh-n">' + U.esc(b.name) + '</div>' +
        '<div class="sh-s">共 ' + stats.total + ' 份 · ' + U.esc(b.id) + '</div></div>' +
        '<button class="btn btn-pri" style="flex:0 0 auto;height:38px;padding:0 16px;font-size:14px">查看</button>';
      hit.hidden = false;
      hit.querySelector('button').onclick = function () {
        global.Scan.stop();
        stack = [];
        cur = { name: 'boxDetail', params: { boxId: b.id } };
        R.resetFilter();
        show();
      };
    } else if (r.type === 'unknownBox') {
      U.toast('本机没有 ID 为 ' + r.id + ' 的匣，可先导入对应清单');
      setTimeout(startScan, 1600);
    } else if (r.type === 'import') {
      global.Scan.stop();
      stack = [];
      cur = { name: 'import', params: {} };
      show();
      applyImportData(r.data);
    } else {
      U.toast('无法识别这个二维码');
      setTimeout(startScan, 1400);
    }
  }

  /* ---------- 拍照 OCR ---------- */
  var capStream = null, capFacing = 'environment', lastShot = null;

  function startCapture() {
    var v = $('#capVideo');
    stopCaptureCam();
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: capFacing, width: { ideal: 1600 }, height: { ideal: 1200 } }, audio: false
    }).then(function (s) {
      capStream = s; v.srcObject = s; return v.play();
    }).catch(function (e) {
      U.toast('无法打开摄像头');
    });
  }

  function stopCaptureCam() {
    if (capStream) { capStream.getTracks().forEach(function (t) { t.stop(); }); capStream = null; }
    var v = $('#capVideo'); if (v) v.srcObject = null;
  }

  function takeShot() {
    var v = $('#capVideo');
    if (!v || !v.videoWidth) { U.toast('摄像头还没准备好'); return; }

    // 取景框在屏幕上的位置 → 换算到视频坐标系（这就是"取景避让"）
    var frame = $('.cap-frame');
    var fr = frame.getBoundingClientRect();
    var vr = v.getBoundingClientRect();
    // object-fit:cover 的换算
    var vRatio = v.videoWidth / v.videoHeight;
    var rRatio = vr.width / vr.height;
    var dispW, dispH, offX = 0, offY = 0;
    if (vRatio > rRatio) { dispH = vr.height; dispW = vr.height * vRatio; offX = (vr.width - dispW) / 2; }
    else { dispW = vr.width; dispH = vr.width / vRatio; offY = (vr.height - dispH) / 2; }

    var sx = (fr.left - vr.left - offX) / dispW * v.videoWidth;
    var sy = (fr.top - vr.top - offY) / dispH * v.videoHeight;
    var sw = fr.width / dispW * v.videoWidth;
    var sh = fr.height / dispH * v.videoHeight;
    sx = Math.max(0, sx); sy = Math.max(0, sy);
    sw = Math.min(sw, v.videoWidth - sx); sh = Math.min(sh, v.videoHeight - sy);

    var c = document.createElement('canvas');
    c.width = sw; c.height = sh;
    c.getContext('2d').drawImage(v, sx, sy, sw, sh, 0, 0, sw, sh);
    lastShot = c.toDataURL('image/jpeg', 0.9);

    stopCaptureCam();
    showOcrResult(lastShot);
  }

  function showOcrResult(fullDataURL) {
    // 取景框已经是长方形，识别的还是「框内靠上的一条标题带」：
    // 留 6% 内边距避免切到边缘笔画，高度收到 55% 覆盖一至两行标题。
    var img = new Image();
    img.onload = function () {
      var rect = {
        x: img.width * 0.04, y: img.height * 0.12,
        w: img.width * 0.92, h: img.height * 0.62
      };
      U.loading(true, '准备识别引擎…');
      global.OCR.recognizeTitle(fullDataURL, rect)
        .then(function (res) {
          openOcrSheet(res, fullDataURL);
        })
        .catch(function () {
          // 识别失败仍允许手动填
          openOcrSheet({ title: '', candidates: [], confidence: 0, cropped: fullDataURL }, fullDataURL);
        });
    };
    img.src = fullDataURL;
  }

  /* 拍照填回资料表单（从 docForm 进入拍照时走这条路） */
  function fillFormFromCapture(title, thumb) {
    var boxId = ($('#dfBox') && $('#dfBox').value) || cur.params.boxId;
    stack = [];
    cur = { name: 'docForm', params: { boxId: boxId, docId: formDocId } };
    show();
    if (title) $('#dfTitle').value = title;
    if (thumb) { formPhotos.unshift(thumb); renderThumbs(); }
    U.toast(title ? '已填入标题，确认后保存' : '已附上封面照片');
  }

  function openOcrSheet(res, fullDataURL) {
    var toForm = cur.params && cur.params.from === 'docForm';
    var cands = res.candidates && res.candidates.length ? res.candidates : [];
    var body =
      '<div class="field" style="margin-top:14px"><label class="lb">文件标题</label>' +
      '<input class="ipt" id="__t" value="' + U.esc(res.title || '') + '" placeholder="没识别到？直接手输" maxlength="60">' +
      (res.confidence ? '<div style="font-size:11.5px;color:#6B7280;margin-top:7px">识别置信度 ' + res.confidence + '%（本地识别，未上传）</div>' : '') +
      '</div>';
    if (cands.length > 1) {
      body += '<div class="field"><label class="lb">候选标题（点选替换）</label><div class="cands">' +
        cands.map(function (c, i) {
          return '<button class="cand' + (i === 0 ? ' on' : '') + '" data-c="' + U.esc(c) + '">' + U.esc(c) + '</button>';
        }).join('') + '</div></div>';
    }
    if (!toForm) {
      body += '<div class="field"><label class="lb">添加到匣</label>' +
        '<select class="ipt" id="__b">' + S.state.boxes.map(function (b) {
          return '<option value="' + b.id + '"' + (cur.params.boxId === b.id ? ' selected' : '') + '>' + U.esc(b.name) + '</option>';
        }).join('') + '</select></div>';
    }

    U.openSheet({
      title: res.title ? '已识别到标题' : '未识别到文字',
      sub: res.title ? '已自动排除框外区域；若标题有误可直接修改或点选候选'
        : '可以手动输入标题后继续，或重拍一张更清晰、光线更均匀的',
      body: body,
      actions: toForm
        ? [
          { text: '重拍', kind: 'sec', onClick: function () { U.closeSheet(); go('capture', cur.params, true); } },
          { text: '用这个标题', kind: 'pri', onClick: function () {
            U.closeSheet();
            U.compressImage(dataURLtoBlob(fullDataURL), 620, 0.72).then(function (thumb) {
              fillFormFromCapture(($('#__t').value || '').trim(), thumb);
            });
          } }
        ]
        : [
          { text: '重拍', kind: 'sec', onClick: function () { U.closeSheet(); go('capture', cur.params, true); } },
          { text: '确认添加', kind: 'pri', onClick: function () {
            var t = $('#__t').value.trim();
            if (!t) { U.toast('请填写标题'); return; }
            var boxId = $('#__b').value;
            U.closeSheet();
            U.compressImage(dataURLtoBlob(fullDataURL), 620, 0.72).then(function (thumb) {
              return S.addDoc({
                boxId: boxId, title: t, status: '在匣', secret: '明文',
                statusNote: '', source: 'ocr',
                photos: [thumb]
              });
            }).then(function () {
              U.toast('已添加「' + t + '」');
              stack = [];
              cur = { name: 'boxDetail', params: { boxId: boxId } };
              show();
            });
          } }
        ],
      onMount: function () {
        $$('#sheet .cand').forEach(function (b) {
          b.onclick = function () {
            $('#__t').value = b.dataset.c;
            $$('#sheet .cand').forEach(function (x) { x.classList.remove('on'); });
            b.classList.add('on');
          };
        });
      }
    });
  }

  function dataURLtoBlob(d) {
    var arr = d.split(','), mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]), n = bstr.length, u8 = new Uint8Array(n);
    for (var i = 0; i < n; i++) u8[i] = bstr.charCodeAt(i);
    return new Blob([u8], { type: mime });
  }

  /* ---------- 导出 ---------- */
  function doExport() {
    var mode = R.getExportMode();
    var scope = $('#exScope').value;
    var data = S.buildExport(scope, {
      includePhotos: $('#exPhotos').classList.contains('on'),
      includeTime: $('#exTime').classList.contains('on')
    });
    var name = $('#exName').textContent;
    if (mode === 'json') {
      var txt = JSON.stringify(data);
      // Web Share 优先（手机上可直接发微信/隔空投送）
      shareOrDownload(name, txt, 'application/json');
      global.__lastExport = { name: name, text: txt };
    } else {
      var csv = S.toCSV(data);
      shareOrDownload(name, csv, 'text/csv;charset=utf-8');
      global.__lastExport = { name: name, text: csv };
    }
  }

  function shareOrDownload(name, text, mime) {
    var file = new File([text], name, { type: mime });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: name }).catch(function () {
        U.download(name, text, mime);
      });
    } else {
      U.download(name, text, mime);
      U.toast('已下载到本机');
    }
  }

  /* ---------- 导入 ---------- */
  var importData = null, importStrategy = 'merge';

  function resetImport() {
    importData = null; importStrategy = 'merge';
    $('#imPreview').innerHTML = '<div class="empty" style="padding-top:40px">' +
      '<p class="empty-t">选择文件导入</p><p class="empty-s">点上方「选择文件导入」挑选导出时保存的 JSON 清单</p></div>';
    $('#imConflict').innerHTML = '';
    $('#imGo').disabled = true;
  }

  function applyImportData(data) {
    if (!data || !data.boxes) { U.toast('文件格式不对'); return; }
    importData = data;
    var items = S.previewImport(data);
    var totalAdd = 0, totalDup = 0;
    items.forEach(function (i) { totalAdd += i.added; totalDup += i.dup; });

    var isXlsx = !!data.__excel;
    var h = '<div class="file-card" style="margin-bottom:14px">' +
      '<div class="fico' + (isXlsx ? ' csv' : '') + '">' + (isXlsx ? 'XLSX' : 'JSON') + '</div>' +
      '<div class="fc-main">' +
      '<div class="fc-name">已解析' + (isXlsx ? '表格' : '清单') + '</div>' +
      '<div class="fc-sub">' + items.length + ' 个匣 · 新增 ' + totalAdd + ' 份' +
      (totalDup ? ' · ' + totalDup + ' 份重复' : '') + '</div></div></div>';

    // 表格里有跳过的行 / 认不出的值，如实列出来
    if (data.errors && data.errors.length) {
      h += '<div class="tipbox" style="margin:0 0 14px"><div class="tip-t">解析提示（' +
        data.errors.length + ' 条）</div><p class="tip-p" style="margin:0">' +
        data.errors.slice(0, 5).map(function (e) { return '· ' + U.esc(e); }).join('<br>') +
        (data.errors.length > 5 ? '<br>…另有 ' + (data.errors.length - 5) + ' 条' : '') +
        '</p></div>';
    }

    h += '<div class="glabel" style="padding-left:0">导入预览</div><div class="prev-card">';
    items.forEach(function (i) {
      h += '<div class="prev-row"><span>匣名称</span><b>' + U.esc(i.boxName) + '</b></div>';
      h += '<div class="prev-row"><span>匣 ID</span><b style="letter-spacing:.05em">' + U.esc(i.boxId) + '</b></div>';
      h += '<div class="prev-row"><span>资料条数</span><b>' + i.docs + ' 条' +
        (i.exist ? '（本机已存在，将新增 ' + i.added + '）' : '（新匣）') + '</b></div>';
      if (i.hasStatus) h += '<div class="prev-row"><span>含状态信息</span><b style="color:#047857">是</b></div>';
      h += '<div style="height:8px"></div>';
    });
    h += '</div>';

    var conflict = items.some(function (i) { return i.exist; });
    if (conflict) {
      h += '<div class="glabel" style="padding-left:0">冲突处理（本机已存在同 ID 匣）</div><div class="taglist" style="padding:0">' +
        radioRow('merge', '合并（保留本机，补齐新增）', '+' + totalAdd, true) +
        radioRow('replace', '覆盖本机该匣', '覆盖', false) +
        radioRow('newbox', '另存为新匣', '新 ID', false) +
        '</div>';
    }
    $('#imPreview').innerHTML = h;
    $('#imConflict').innerHTML = '';
    $('#imGo').disabled = false;

    $$('#imPreview [data-strategy]').forEach(function (r) {
      r.onclick = function () {
        importStrategy = r.dataset.strategy;
        $$('#imPreview [data-strategy]').forEach(function (x) {
          x.classList.toggle('on', x === r);
          x.querySelector('.radio').classList.toggle('on', x === r);
        });
      };
    });
  }

  function radioRow(v, text, badge, on) {
    return '<div class="trow" data-strategy="' + v + '">' +
      '<span class="radio' + (on ? ' on' : '') + '">✓</span>' +
      '<span class="tn">' + U.esc(text) + '</span>' +
      '<span class="cnt">' + U.esc(badge) + '</span></div>';
  }

  function doImport() {
    if (!importData) return;
    U.loading(true, '导入中…');
    S.doImport(importData, importStrategy).then(function (r) {
      U.loading(false);
      U.toast('导入完成：新增 ' + r.addedDocs + ' 份' +
        (r.skipped ? '，跳过 ' + r.skipped + ' 份重复' : '') +
        (r.addedBoxes ? '，新建 ' + r.addedBoxes + ' 个匣' : ''), 3000);
      stack = [];
      cur = { name: 'home', params: {} };
      show();
    });
  }

  /* ---------- 状态 ---------- */
  function editStatus(name) {
    var isNew = !name;
    var s = name ? S.getStatus(name) : { name: '', fg: '#6D28D9', bg: '#EDE9FE', desc: '' };
    U.openSheet({
      title: isNew ? '新建自定义状态' : '编辑状态',
      sub: isNew ? '自定义状态可命名与配色，出现在所有筛选与标记处' : '改名后，已使用该状态的资料会自动跟随',
      body:
        '<div class="field" style="margin-top:14px"><label class="lb">状态名称</label>' +
        '<input class="ipt" id="__sn2" value="' + U.esc(s.name) + '" placeholder="如：待销毁" maxlength="10"></div>' +
        '<div class="field"><label class="lb">颜色</label><div class="chips" id="__sc"></div></div>' +
        '<div class="field"><label class="lb">说明（可选）</label>' +
        '<input class="ipt" id="__sd" value="' + U.esc(s.desc || '') + '" placeholder="如：超过保管期限" maxlength="20"></div>',
      actions: (isNew ? [] : [{
        text: '删除', kind: 'sec', onClick: function () {
          U.closeSheet();
          U.confirm({ title: '删除状态「' + name + '」？', sub: '使用该状态的资料会自动改为「在匣」', okText: '删除', danger: true })
            .then(function (ok) {
              if (!ok) return;
              S.deleteStatus(name).then(function (n) {
                U.toast(n ? '已删除，' + n + ' 份资料改为「在匣」' : '已删除');
                renderCurrent();
              });
            });
        }
      }]).concat([{
        text: isNew ? '创建' : '保存', kind: 'pri', onClick: function () {
          var n = $('#__sn2').value.trim();
          if (!n) { U.toast('请填写状态名称'); return; }
          var fg = $('#__sc .chip.on') ? $('#__sc .chip.on').dataset.fg : s.fg;
          var bg = $('#__sc .chip.on') ? $('#__sc .chip.on').dataset.bg : s.bg;
          var patch = { name: n, fg: fg, bg: bg, desc: $('#__sd').value.trim() };
          U.closeSheet();
          if (isNew) {
            if (S.getStatus(n)) { U.toast('已存在同名状态'); return; }
            S.addStatus(patch).then(function () { U.toast('已添加「' + n + '」'); renderCurrent(); });
          } else {
            S.updateStatus(name, patch).then(function () { U.toast('已保存'); renderCurrent(); });
          }
        }
      }]),
      onMount: function () {
        var preset = [
          ['#6D28D9', '#EDE9FE'], ['#BE185D', '#FCE7F3'], ['#0F766E', '#CCFBF1'],
          ['#B45309', '#FEF3C7'], ['#1D4ED8', '#DBEAFE'], ['#047857', '#D1FAE5'],
          ['#B91C1C', '#FEE2E2'], ['#4B5563', '#F3F4F6']
        ];
        var box = $('#__sc');
        preset.forEach(function (p) {
          var c = U.el('button', 'chip' + (p[0] === s.fg ? ' on' : ''), '示例');
          c.dataset.fg = p[0]; c.dataset.bg = p[1];
          c.style.color = p[0]; c.style.background = p[1]; c.style.borderColor = 'transparent';
          if (p[0] === s.fg) { c.style.color = '#fff'; c.style.background = p[0]; }
          c.onclick = function () {
            $$('#__sc .chip').forEach(function (x) {
              x.classList.remove('on');
              x.style.color = x.dataset.fg; x.style.background = x.dataset.bg;
            });
            c.classList.add('on'); c.style.color = '#fff'; c.style.background = p[0];
          };
          box.appendChild(c);
        });
      }
    });
  }

  /* ---------- 回收站 / 关于 ---------- */
  function showTrash() {
    var t = S.trash();
    if (!t.length) { U.toast('回收站是空的'); return; }
    var body = '<div class="taglist" style="padding:12px 0 0">' + t.slice().reverse().map(function (it, i) {
      var idx = t.length - 1 - i;
      return '<div class="trow" data-t="' + idx + '">' +
        '<span class="tn">' + U.esc(it.box.name) + '<br><span style="font-size:11.5px;color:#9CA3AF">' +
        it.docs.length + ' 份资料 · 删除于 ' + U.fmtDateTime(it.deletedAt) + '</span></span>' +
        '<span class="cnt" style="background:#EFF4FF;color:#1D4ED8">恢复</span></div>';
    }).join('') + '</div>';
    U.openSheet({
      title: '回收站', sub: '最多保留最近 5 个删除的匣',
      body: body,
      onMount: function () {
        $$('#sheet [data-t]').forEach(function (r) {
          r.onclick = function () {
            var it = S.trash()[+r.dataset.t];
            if (!it) return;
            U.closeSheet();
            U.confirm({ title: '恢复「' + it.box.name + '」？', sub: '连同 ' + it.docs.length + ' 份资料一起恢复，匣 ID 不变' })
              .then(function (ok) {
                if (!ok) return;
                S.state.boxes.unshift(it.box);
                it.docs.forEach(function (d) { S.state.docs.unshift(d); });
                S.state.trash.splice(+r.dataset.t, 1);
                S.save().then(function () { U.toast('已恢复'); renderCurrent(); });
              });
          };
        });
      }
    });
  }

  function showAbout() {
    var docs = S.state.docs.length;
    var abnormal = S.state.docs.filter(function (d) {
      return S.normalizeStatusName(d.status) !== '在匣';
    }).length;
    U.openSheet({
      title: '关于',
      sub: '文书档案工作台',
      body: '<div class="prev-card" style="margin-top:14px">' +
        '<div class="prev-row"><span>版本号</span><b>v' + U.esc(S.VERSION) + '</b></div>' +
        '<div class="prev-row"><span>匣状态</span><b>' + S.state.boxes.length + ' 个匣 / ' +
        docs + ' 份资料' + (abnormal ? '，其中 ' + abnormal + ' 份不在匣' : '') + '</b></div>' +
        '</div>' +
        '<div class="tipbox" style="margin-top:12px">' +
        '<div class="tip-t">声 明</div>' +
        '<p class="tip-p" style="margin:0">本应用为单机离线应用，仅用于协助办公，不作其他使用。</p>' +
        '</div>'
    });
  }

  /* ---------- 二维码保存 / 打印 ---------- */
  function saveQR() {
    var b = S.getBox(cur.params.boxId);
    if (!b) return;
    var canvas = $('#qrImg canvas') || $('#qrImg img');
    if (!canvas) { U.toast('二维码还没生成'); return; }
    // 生成一张带匣名的贴纸图
    buildSticker(b, canvas).then(function (url) {
      var a = document.createElement('a');
      a.href = url; a.download = '文书档案工作台贴纸_' + b.id + '.png';
      document.body.appendChild(a); a.click();
      setTimeout(function () { document.body.removeChild(a); }, 300);
      U.toast('已保存贴纸图片');
    });
  }

  function buildSticker(b, qrCanvas) {
    return new Promise(function (res) {
      var W = 700, H = 900;
      var c = document.createElement('canvas');
      c.width = W; c.height = H;
      var x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
      // 边框
      x.strokeStyle = '#D8E0EC'; x.lineWidth = 4;
      x.strokeRect(24, 24, W - 48, H - 48);
      // 顶部色条
      x.fillStyle = b.color; x.fillRect(24, 24, W - 48, 14);
      // 匣名
      x.fillStyle = '#111827';
      x.font = 'bold 42px "PingFang SC","Microsoft YaHei",sans-serif';
      x.textAlign = 'center';
      wrapText(x, b.name, W / 2, 130, W - 100, 52);
      // 位置
      if (b.location) {
        x.font = '26px "PingFang SC","Microsoft YaHei",sans-serif';
        x.fillStyle = '#6B7280';
        x.fillText(b.location, W / 2, 190);
      }
      // 二维码
      var size = 480;
      x.drawImage(qrCanvas, (W - size) / 2, 230, size, size);
      // ID
      x.fillStyle = '#111827';
      x.font = 'bold 34px monospace';
      x.fillText(b.id, W / 2, 790);
      x.font = '22px "PingFang SC",sans-serif';
      x.fillStyle = '#9CA3AF';
      x.fillText('扫码查看匣内清单 · 此码永久不变', W / 2, 840);
      res(c.toDataURL('image/png'));
    });
  }

  function wrapText(ctx, text, cx, cy, maxW, lh) {
    var line = '', lines = [];
    for (var i = 0; i < text.length; i++) {
      var test = line + text[i];
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = text[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    var start = cy - (lines.length - 1) * lh / 2;
    lines.slice(0, 3).forEach(function (l, i) {
      ctx.fillText(l, cx, start + i * lh);
    });
  }

  function printQR() {
    var b = S.getBox(cur.params.boxId);
    var canvas = $('#qrImg canvas') || $('#qrImg img');
    if (!b || !canvas) return;
    buildSticker(b, canvas).then(function (url) {
      var html = '<html><head><title>文书档案工作台贴纸 ' + U.esc(b.id) + '</title><style>' +
        '@page{size:A4;margin:12mm}body{font-family:sans-serif;text-align:center}' +
        '.s{display:inline-block;margin:6mm;border:1px dashed #bbb;padding:4mm}' +
        'img{width:70mm;display:block}' +
        '</style></head><body>' +
        '<div class="s"><img src="' + url + '"></div>' +
        '<div class="s"><img src="' + url + '"></div>' +
        '</body></html>';

      /* Android 原生壳：交给系统打印服务 */
      if (window.HejiApp && typeof window.HejiApp.printHtml === 'function') {
        window.HejiApp.printHtml(html);
        return;
      }

      var w = window.open('', '_blank');
      if (!w) { U.toast('请允许弹出窗口'); return; }
      w.document.write(html.replace('</body>',
        '<script>setTimeout(function(){window.print()},400)<\/script></body>'));
      w.document.close();
    });
  }

  /* ---------- 事件绑定 ---------- */
  function bind() {
    $('#btnBack').onclick = back;

    // 首页
    $('#homeSearch').onclick = function () { go('search'); };
    $('#btnScanHome').onclick = function () { go('scan'); };

    // 三个主页面：点页签切换 + 左右滑动切换
    $$('#tabs .tab').forEach(function (b) {
      b.onclick = function () { switchMain(b.dataset.p, true); };
    });
    bindPagerSwipe();

    // 管理页：按密级 / 按状态
    $$('#mgSeg .sg').forEach(function (b) {
      b.onclick = function () { R.renderManage(b.dataset.g); };
    });

    // 日志页：搜索
    var ji = $('#jrInput');
    if (ji) {
      ji.oninput = function () {
        $('#jrClear').hidden = !ji.value;
        R.renderJournal(ji.value);
      };
      $('#jrClear').onclick = function () {
        ji.value = ''; $('#jrClear').hidden = true; R.renderJournal('');
      };
    }

    // 搜索
    var si = $('#searchInput');
    si.oninput = function () {
      $('#searchClear').hidden = !si.value;
      R.renderSearch(si.value);
    };
    $('#searchClear').onclick = function () { si.value = ''; si.focus(); $('#searchClear').hidden = true; R.renderSearch(''); };

    // 创建匣
    $('#nbSubmit').onclick = submitNewBox;
    $('#nbName').onkeydown = function (e) { if (e.key === 'Enter') submitNewBox(); };
    $$('[data-act="cancel"]').forEach(function (b) { b.onclick = back; });

    // 匣详情
    $('#bdCapture').onclick = function () { go('capture', { boxId: cur.params.boxId }); };
    $('#bdAdd').onclick = function () { openDocForm({ boxId: cur.params.boxId }); };

    // 资料表单里的「拍照识别标题」
    $('#dfCapture').onclick = function () {
      if (!S.state.boxes.length) { U.toast('先创建一个匣'); return; }
      go('capture', { from: 'docForm', boxId: ($('#dfBox') && $('#dfBox').value) || cur.params.boxId });
    };

    // 资料表单
    $('#dfSubmit').onclick = submitDoc;
    $('#dfAttachAdd').onclick = addAttach;
    $('#dfAttachInput').onkeydown = function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addAttach(); }
    };

    // 二维码
    $('#qrSave').onclick = saveQR;
    $('#qrPrint').onclick = printQR;

    // 扫码
    $('#scanTorch').onclick = function () {
      global.Scan.toggleTorch().then(function (on) {
        if (on === false) U.toast('此设备不支持手电筒');
        $('#scanTorch').classList.toggle('on', !!on);
      });
    };
    $('#scanAlbum').onclick = function () {
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = function () {
        if (!inp.files[0]) return;
        global.Scan.decodeFromFile(inp.files[0]).then(onScanned)
          .catch(function () { U.toast('这张图片里没有二维码'); });
      };
      inp.click();
    };

    // 拍照
    $('#capShot').onclick = takeShot;
    $('#capFlip').onclick = function () {
      capFacing = capFacing === 'environment' ? 'user' : 'environment';
      startCapture();
    };
    $('#capAlbum').onclick = function () {
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = function () {
        if (!inp.files[0]) return;
        U.compressImage(inp.files[0], 1400, 0.9).then(function (d) {
          stopCaptureCam(); showOcrResult(d);
        });
      };
      inp.click();
    };

    // 导出
    $$('#exModes .mode').forEach(function (m) {
      m.onclick = function () {
        $$('#exModes .mode').forEach(function (x) { x.classList.remove('on'); });
        m.classList.add('on');
        R.refreshExportInfo();
      };
    });
    $('#exScope').onchange = R.refreshExportInfo;
    ['#exPhotos', '#exTime'].forEach(function (id) {
      $(id).onclick = function () { $(id).classList.toggle('on'); R.refreshExportInfo(); };
    });
    $('#exGo').onclick = doExport;
    $('#exCopy').onclick = function () {
      var mode = R.getExportMode();
      var scope = $('#exScope').value;
      var data = S.buildExport(scope, {
        includePhotos: $('#exPhotos').classList.contains('on'),
        includeTime: $('#exTime').classList.contains('on')
      });
      var txt = mode === 'json' ? JSON.stringify(data) : S.toCSV(data);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(function () { U.toast('已复制到剪贴板'); })
          .catch(function () { U.toast('复制失败'); });
      } else U.toast('浏览器不支持复制');
    };

    // 导入：只保留「选择文件」。文件选择器交给系统文件管理器，
    // 之前给 input 加了 accept=".json"，部分安卓机把它当成图片过滤器、弹成了相册，
    // 现在不加 accept 限制，并由 openFilePicker 显式指定类型直接要文件列表。
    $('#imFileMode').onclick = function () {
      $$('#imModes .mode').forEach(function (x) { x.classList.remove('on'); });
      $('#imFileMode').classList.add('on');
      openFilePicker();
    };
    $('#imExcelMode').onclick = function () {
      $$('#imModes .mode').forEach(function (x) { x.classList.remove('on'); });
      $('#imExcelMode').classList.add('on');
      pickExcel();
    };
    $('#imTpl').onclick = downloadTemplate;
    bindExcelInput();
    $('#imFile').onchange = function () {
      var f = $('#imFile').files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        try {
          applyImportData(JSON.parse(fr.result));
        } catch (e) { U.toast('不是有效的 JSON 清单文件，请选择导出时保存的清单'); }
      };
      fr.readAsText(f);
      $('#imFile').value = '';
    };
    $('#imGo').onclick = doImport;

    // 状态
    $('#stAdd').onclick = function () { editStatus(null); };

    // 匣设置
    $$('[data-act]').forEach(function (r) {
      if (r.dataset.act === 'cancel') return;
      r.onclick = function () {
        var a = r.dataset.act, id = cur.params.boxId;
        if (a === 'rename') renameBox(id);
        else if (a === 'color') pickColor(id);
        else if (a === 'location') editField(id, 'location', '存放位置', '如：三楼档案柜 B 区');
        else if (a === 'note') editField(id, 'note', '备注', '责任人、保管期限等');
        else if (a === 'qr') go('qrcode', { boxId: id });
        else if (a === 'regen') regenId(id);
        else if (a === 'export') go('export', { scope: id });
        else if (a === 'delete') deleteBox(id);
      };
    });

    // 物理返回键
    window.addEventListener('popstate', function () { back(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('#layer').hidden) U.closeSheet();
      else if (e.key === 'Enter' && cur.name === 'docForm' && document.activeElement === $('#dfTitle')) submitDoc();
    });
  }

  /* ---------- 启动 ---------- */
  function boot() {
    // 先把壳渲染出来（此时首页数据还没读到，列表是空的，但界面不会卡住）
    bind();
    show();
    // 数据读完再重画一遍。以前是「读完才画」，读得慢时用户先看到的是空首页，
    // 一旦后续渲染被打断，就会留下「第一次进来匣全没了」的假象。
    U.loading(true, '加载数据…');
    S.load().then(function () {
      U.loading(false);
      show();
      // 预热 OCR 引擎（后台，不阻塞）
      setTimeout(function () {
        if (global.OCR && !global.OCR.isReady()) {
          try { global.OCR.init(function () { }); } catch (e) { /* 忽略 */ }
        }
      }, 1500);
      
    }).catch(function () {
      U.loading(false);
      show();
    });
  }

  global.App = {
    go: go, back: back, show: show, boot: boot, switchMain: switchMain,
    renderCurrent: renderCurrent,
    renameBox: renameBox, deleteBox: deleteBox,
    editDoc: editDoc, editStatus: editStatus,
    openDocForm: openDocForm
  };

  document.addEventListener('DOMContentLoaded', boot);
})(window);

