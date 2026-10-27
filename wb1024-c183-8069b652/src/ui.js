
(function(){
  'use strict';
  var DATABASE_ID = 'uihHPG8jyFJ5fWitFkltFp';
  var DRAFT_PREFIX = 'wb1024_wb_draft_';
  var STAGE_COLOR = {
    '连载中': '#12C87A',
    '待完本体检': '#F0932B',
    '已完本体检': '#3D7EFF',
    '已拆书蒸馏': '#7852C7',
    '经验已吸纳': '#0FA8A0',
    '待榨干判定': '#D9A406',
    '已移库归档': '#7B8492'
  };

  var db = null;
  var SCHEMA_OPTIONS = {};   // fieldName -> [{text, id}]
  var ROWS = [];
  var editingId = null;
  var toastTimer = null;

  function $(id){ return document.getElementById(id); }
  function toast(msg){
    var t = $('toast');
    t.textContent = msg;
    t.className = 'toast on';
    if (toastTimer) { clearTimeout(toastTimer); }
    toastTimer = setTimeout(function(){ t.className = 'toast'; }, 2400);
  }
  function fmtWords(n){
    n = Number(n) || 0;
    if (n >= 100000000) { return (n / 100000000).toFixed(2) + ' 亿'; }
    if (n >= 10000) { return (n / 10000).toFixed(1) + ' 万'; }
    return String(n);
  }
  function num(v){ var n = Number(v); return isFinite(n) ? n : 0; }
  function stageColor(text){ return STAGE_COLOR[text] || '#7B8492'; }
  function optionIdByText(field, text){
    var list = SCHEMA_OPTIONS[field] || [];
    for (var i = 0; i < list.length; i++){
      if (list[i].text === text) { return list[i].id; }
    }
    return '';
  }
  function textById(field, id){
    var list = SCHEMA_OPTIONS[field] || [];
    for (var i = 0; i < list.length; i++){
      if (list[i].id === id) { return list[i].text; }
    }
    return id || '';
  }

  /* ── 无 SDK 环境：降级为静态空态 ── */
  function showFallback(){
    $('skel').hidden = true;
    $('bookList').hidden = true;
    $('emptyState').hidden = false;
    $('emptyState').innerHTML = '<div class="be">📖</div><b>当前环境暂不支持数据读写</b>'
      + '<p>请在 WorkBuddy 资料库中打开本页面，即可记录和修改作品进度。</p>';
    $('kpiActive').textContent = '—';
    $('kpiWords').textContent = '—';
    $('kpiDone').textContent = '—';
    $('kpiArchived').textContent = '—';
  }

  function boot(){
    db = window.bookDatabase;
    db.getSchema().then(function(schema){
      schema.properties.forEach(function(f){ SCHEMA_OPTIONS[f.name]=f.config.options; });
      renderSelectOptions(); renderLegend(); refillDraft(); loadData();
    }).catch(function(){showFallback();});
  }

  /* ── 下拉选项：全部从 getSchema 动态渲染，禁止硬编码 ── */
  function renderSelectOptions(){
    fillSelect($('addForm').elements['platform'], SCHEMA_OPTIONS['平台'], '');
    var stageSel = $('addForm').elements['stage'];
    fillSelect(stageSel, SCHEMA_OPTIONS['链路状态'], '');
    var def = optionIdByText('链路状态', '连载中');
    if (def) { stageSel.value = def; }
    fillSelect($('editStage'), SCHEMA_OPTIONS['链路状态'], '');
  }
  function fillSelect(sel, options, selected){
    if (!sel) { return; }
    sel.innerHTML = '<option value="">请选择</option>';
    (options || []).forEach(function(o){
      var op = document.createElement('option');
      op.value = o.id;
      op.textContent = o.text;
      if (selected && o.id === selected) { op.selected = true; }
      sel.appendChild(op);
    });
  }

  /* ── 链路图例：DOM 构建，用户数据走 textContent ── */
  function renderLegend(){
    var list = SCHEMA_OPTIONS['链路状态'] || [];
    var box = $('legendList');
    box.innerHTML = '';
    list.forEach(function(o, i){
      var c = stageColor(o.text);
      var chip = document.createElement('span');
      chip.className = 'lg-chip';
      chip.style.color = c;
      chip.style.borderColor = c + '33';
      chip.style.background = c + '14';
      chip.textContent = (i + 1) + '. ' + o.text;
      box.appendChild(chip);
    });
  }

  /* ── 统计：优先 aggregate，失败时用已拉到的全量行实数兜底 ── */
  function loadStats(){
    if (typeof db.aggregate !== 'function'){ applyStatsFromRows(); return; }
    db.aggregate({
      databaseId: DATABASE_ID,
      aggregates: [
        { name: 'active', type: 'count', filter: { property: { property: '链路状态', select: { equals: '连载中' } } } },
        { name: 'words', type: 'sum', property: '当前字数' },
        { name: 'done', type: 'count', filter: { property: { property: '链路状态', select: { does_not_equal: '连载中' } } } },
        { name: 'archived', type: 'count', filter: { property: { property: '链路状态', select: { equals: '已移库归档' } } } }
      ]
    }).then(function(rsp){
      var got = {};
      ((rsp && rsp.results) || []).forEach(function(it){ got[it.name] = it.value; });
      if (typeof got.active !== 'number'){ applyStatsFromRows(); return; }
      paintStats(got.active, got.words, got.done, got.archived);
    }).catch(function(err){
      console.error('[database] aggregate 失败，改用全量行计算:', err);
      applyStatsFromRows();
    });
  }
  function applyStatsFromRows(){
    var active = 0, words = 0, done = 0, archived = 0;
    ROWS.forEach(function(r){
      var stage = r['链路状态'];
      words += num(r['当前字数']);
      if (stage === '连载中') { active++; }
      else { done++; }
      if (stage === '已移库归档') { archived++; }
    });
    paintStats(active, words, done, archived);
  }
  function paintStats(active, words, done, archived){
    $('kpiActive').textContent = active;
    $('kpiWords').textContent = fmtWords(words);
    $('kpiDone').textContent = done;
    $('kpiArchived').textContent = archived;
  }

  /* ── 全量拉取（hasMore + nextCursor + startCursor，三道保险） ── */
  function loadData(startCursor, acc, guard){
    acc = acc || [];
    guard = guard || 0;
    $('loadingTip').hidden = false;
    if (guard > 100){ renderData(acc); return; }   // 保险①：硬上限熔断
    db.query({
      databaseId: DATABASE_ID,
      sorts: [{ property: '开书日期', direction: 'descending' }],
      pageSize: 200,
      startCursor: startCursor
    }).then(function(result){
      var list = (result && result.results) || [];   // 只取 result.results
      acc = acc.concat(list);
      var next = result && result.nextCursor;
      if (result && result.hasMore && next && next !== startCursor && list.length){
        loadData(next, acc, guard + 1);              // 保险②③：cursor 必须前进且本页非空
      } else {
        renderData(acc);
      }
    }).catch(function(err){
      console.error('[database] 数据加载失败:', err);
      $('skel').hidden = true;
      $('loadingTip').hidden = true;
      $('errState').hidden = false;
    });
  }

  /* ── 渲染作品卡片：克隆 <template> 填充，用户数据一律走 textContent ── */
  function bindDb(el){
    el.setAttribute('data-sp-bindable', 'database');
    el.setAttribute('data-sp-database-id', DATABASE_ID);
  }
  function renderData(rows){
    ROWS = rows;
    applyStatsFromRows();
    $('skel').hidden = true;
    $('loadingTip').hidden = true;
    var wrap = $('bookList');
    if (!rows.length){
      wrap.hidden = true;
      $('emptyState').hidden = false;
      return;
    }
    $('emptyState').hidden = true;
    $('errState').hidden = true;
    wrap.hidden = false;
    var tpl = $('bookTpl');
    var frag = document.createDocumentFragment();
    rows.forEach(function(r){
      var node = tpl.content.cloneNode(true);
      var rid = r._id || '';
      var name = r['作品名称'] || '未命名作品';
      var platform = textById('平台', r['平台']);
      var stage = r['链路状态'] || '';
      var target = num(r['目标字数']);
      var current = num(r['当前字数']);
      var daily = num(r['日均更新']);
      var start = r['开书日期'] ? String(r['开书日期']).slice(0, 10) : '';
      var note = r['备注'] || '';
      var pct = target > 0 ? Math.min(999, Math.round(current / target * 1000) / 10) : 0;
      var over = target > 0 && current >= target;
      var barW = target > 0 ? Math.min(100, current / target * 100) : 0;
      var remaining = Math.max(0, target - current);
      var eta = '—';
      if (stage === '连载中'){
        if (target > 0 && current >= target) { eta = '已达成目标字数 🎉'; }
        else if (daily > 0 && remaining > 0) { eta = '按日均 ' + fmtWords(daily) + ' 字，预计还需 ' + Math.ceil(remaining / daily) + ' 天完本'; }
        else if (remaining > 0) { eta = '填了日均更新，就能估算完本倒计时'; }
      } else if (stage){
        eta = '已完本，进入沉淀链路';
      }

      node.querySelector('article').setAttribute('data-rid', rid);

      var nameEl = node.querySelector('.book-name');
      nameEl.textContent = name;
      bindDb(nameEl);

      var platEl = node.querySelector('.book-platform');
      if (platform){ platEl.textContent = platform; bindDb(platEl); }
      else { platEl.hidden = true; }

      var stageEl = node.querySelector('.book-stage');
      if (stage){
        stageEl.textContent = stage;
        stageEl.style.background = stageColor(stage);
        bindDb(stageEl);
      } else { stageEl.hidden = true; }

      var dateEl = node.querySelector('.book-date');
      if (start){ dateEl.textContent = '开书 ' + start; bindDb(dateEl); }
      else { dateEl.hidden = true; }

      var progText = fmtWords(current) + ' / ' + fmtWords(target) + ' 字';
      var progEl = node.querySelector('.book-progress-text');
      progEl.textContent = progText;
      bindDb(progEl);

      node.querySelector('.bp-row b').textContent = progText;
      node.querySelector('.pct').textContent = target > 0 ? pct + '%' : '—';
      var barI = node.querySelector('.bar i');
      barI.style.width = barW + '%';
      if (over){ barI.className = 'done'; }

      var etaEl = node.querySelector('.book-eta');
      etaEl.textContent = eta;
      bindDb(etaEl);

      var noteEl = node.querySelector('.book-note');
      if (note){ noteEl.textContent = note; bindDb(noteEl); }
      else { noteEl.hidden = true; }

      node.querySelector('[data-act="edit"]').setAttribute('data-rid', rid);
      node.querySelector('[data-act="del"]').setAttribute('data-rid', rid);
      frag.appendChild(node);
    });
    wrap.innerHTML = '';
    wrap.appendChild(frag);
  }

  /* ── 卡片按钮：事件委托 ── */
  $('bookList').addEventListener('click', function(e){
    var btn = e.target;
    while (btn && btn !== this && !(btn.getAttribute && btn.getAttribute('data-act'))){ btn = btn.parentNode; }
    if (!btn || !btn.getAttribute) { return; }
    var act = btn.getAttribute('data-act');
    var rid = btn.getAttribute('data-rid');
    if (act === 'edit'){ openEdit(rid); }
    else if (act === 'del'){ removeBook(rid); }
  });

  /* ── 新增作品 ── */
  function openAdd(){
    $('addMask').hidden = false;
    var f = $('addForm');
    if (typeof f.elements['name'].focus === 'function'){ f.elements['name'].focus(); }
  }
  function closeAdd(){ $('addMask').hidden = true; }
  $('btnAdd').onclick = openAdd;
  $('emptyAdd').onclick = openAdd;
  $('addClose').onclick = closeAdd;
  $('addMask').addEventListener('click', function(e){ if (e.target === this){ closeAdd(); } });

  var draftTimer = null;
  $('addForm').addEventListener('input', onDraftInput);
  $('addForm').addEventListener('change', onDraftInput);
  function onDraftInput(){
    if (draftTimer) { clearTimeout(draftTimer); }
    draftTimer = setTimeout(saveDraft, 300);
  }
  function saveDraft(){
    try {
      var f = $('addForm');
      var draft = {
        name: f.elements['name'].value,
        platform: f.elements['platform'].value,
        start: f.elements['start'].value,
        target: f.elements['target'].value,
        current: f.elements['current'].value,
        daily: f.elements['daily'].value,
        stage: f.elements['stage'].value,
        note: f.elements['note'].value
      };
      window.localStorage.setItem(DRAFT_PREFIX + 'add', JSON.stringify(draft));
    } catch (err){ /* 存储不可用时静默降级 */ }
  }
  function refillDraft(){
    try {
      var raw = window.localStorage.getItem(DRAFT_PREFIX + 'add');
      if (!raw) { return; }
      var d = JSON.parse(raw);
      var f = $('addForm');
      if (d.name) { f.elements['name'].value = d.name; }
      if (d.platform) { f.elements['platform'].value = d.platform; }
      if (d.start) { f.elements['start'].value = d.start; }
      if (d.target) { f.elements['target'].value = d.target; }
      if (d.current) { f.elements['current'].value = d.current; }
      if (d.daily) { f.elements['daily'].value = d.daily; }
      if (d.stage) { f.elements['stage'].value = d.stage; }
      if (d.note) { f.elements['note'].value = d.note; }
    } catch (err){ /* 忽略损坏草稿 */ }
  }
  function clearDraft(){
    try { window.localStorage.removeItem(DRAFT_PREFIX + 'add'); } catch (err){}
  }

  $('addForm').addEventListener('submit', function(e){
    e.preventDefault();
    var f = $('addForm');
    var name = f.elements['name'].value.trim();
    var platform = f.elements['platform'].value;
    var stage = f.elements['stage'].value;
    var target = f.elements['target'].value;
    if (!name || !platform || !stage || !target){
      toast('请把带 * 的必填项填完整');
      return;
    }
    var btn = $('addSubmit');
    btn.disabled = true;
    btn.textContent = '保存中…';
    var properties = {
      '作品名称': { text: name },
      '平台': { select: platform },
      '目标字数': { number: num(target) },
      '当前字数': { number: num(f.elements['current'].value) },
      '日均更新': { number: num(f.elements['daily'].value) },
      '链路状态': { select: stage },
      '备注': { text: f.elements['note'].value.trim() }
    };
    if (f.elements['start'].value){
      properties['开书日期'] = { date: f.elements['start'].value };
    }
    db.addRecord({ databaseId: DATABASE_ID, properties: properties }).then(function(){
      clearDraft();
      f.reset();
      renderSelectOptions();
      closeAdd();
      toast('作品已保存');
      loadData();
      loadStats();
    }).catch(function(err){
      console.error('[database] 保存失败:', err);
      toast('保存失败，请稍后重试');
    }).finally(function(){
      btn.disabled = false;
      btn.textContent = '保存作品';
    });
  });

  /* ── 更新进度 / 删除 ── */
  function removeBook(rid){ openEdit(rid); $('editDelete').click(); }
  function findRow(rid){
    for (var i = 0; i < ROWS.length; i++){
      if (ROWS[i]._id === rid) { return ROWS[i]; }
    }
    return null;
  }
  function openEdit(rid){
    var row = findRow(rid);
    if (!row) { toast('找不到这条记录，请刷新后重试'); return; }
    editingId = rid;
    $('editTitle').textContent = '更新进度 · ' + (row['作品名称'] || '未命名作品');
    $('editMeta').textContent = '平台：' + (textById('平台', row['平台']) || '未填')
      + '　目标：' + fmtWords(num(row['目标字数'])) + ' 字'
      + '　开书：' + (row['开书日期'] ? String(row['开书日期']).slice(0, 10) : '未填');
    $('editCurrent').value = num(row['当前字数']);
    $('editStage').value = row['链路状态'] || '';
    $('editNote').value = row['备注'] || '';
    $('editMask').hidden = false;
  }
  function closeEdit(){
    $('editMask').hidden = true;
    editingId = null;
  }
  $('editClose').onclick = closeEdit;
  $('editMask').addEventListener('click', function(e){ if (e.target === this){ closeEdit(); } });

  $('editSave').onclick = function(){
    if (!editingId) { return; }
    var current = $('editCurrent').value;
    if (current === '' || num(current) < 0){
      toast('当前字数不能为空');
      return;
    }
    var btn = this;
    btn.disabled = true;
    btn.textContent = '保存中…';
    var properties = {
      '当前字数': { number: num(current) },
      '链路状态': { select: $('editStage').value },
      '备注': { text: $('editNote').value.trim() }
    };
    db.updateRecord({ databaseId: DATABASE_ID, recordId: editingId, properties: properties }).then(function(){
      closeEdit();
      toast('进度已更新');
      loadData();
      loadStats();
    }).catch(function(err){
      console.error('[database] 更新失败:', err);
      toast('更新失败，请稍后重试');
    }).finally(function(){
      btn.disabled = false;
      btn.textContent = '保存更新';
    });
  };

  $('editDelete').onclick = function(){
    if (!editingId) { return; }
    var row = findRow(editingId);
    var name = row ? (row['作品名称'] || '未命名作品') : '这部作品';
    if (!window.confirm('删除后不可恢复，确定删除「' + name + '」？')) { return; }
    var btn = this;
    btn.disabled = true;
    db.deleteRecord({ databaseId: DATABASE_ID, recordId: editingId }).then(function(){
      closeEdit();
      toast('已删除');
      loadData();
      loadStats();
    }).catch(function(err){
      console.error('[database] 删除失败:', err);
      toast('删除失败，请稍后重试');
    }).finally(function(){
      btn.disabled = false;
    });
  };

  /* ── 多端数据变更订阅 ── */
  function subscribeUpdates(){
    try {
      if (typeof db.onUpdated !== 'function') { return; }
      db.onUpdated(function(payload){
        var ids = payload && payload.databaseIds;
        if (!ids || !ids.length || ids.indexOf(DATABASE_ID) >= 0){
          loadData();
          loadStats();
        }
      });
    } catch (err){ /* 订阅失败不影响主流程 */ }
  }

  boot();
})();
