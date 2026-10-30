/* 交互逻辑：输入 → 判断 → 结果 → 云端记录与冷静期提醒 */
(function (global) {
  'use strict';

  var Store = global.BonStore;
  var Engine = global.BonEngine;

  var state = {
    name: '',
    price: 0,
    freqKey: 'monthly',
    tags: [],
    hasSimilar: false,
    thumb: '',
    analyzing: false
  };

  var el = {};

  function $(id) {
    return document.getElementById(id);
  }

  function cache() {
    el.views = {
      home: $('view-home'),
      result: $('view-result'),
      records: $('view-records')
    };
    el.name = $('in-name');
    el.price = $('in-price');
    el.similar = $('in-similar');
    el.freqChips = $('freq-chips');
    el.tagChips = $('tag-chips');
    el.photoInput = $('in-photo');
    el.photoPreview = $('photo-preview');
    el.photoDrop = $('photo-drop');
    el.photoWrap = $('photo-preview-wrap');
    el.bannerList = $('banner-list');
    el.dot = $('dot');
    el.tipHand = $('tip-hand');
    el.btnRecords = $('btn-records');
    el.btnAnalyze = $('btn-analyze');
    el.verdictCard = $('verdict-card');
    el.verdictValue = $('verdict-value');
    el.resultMeta = $('result-meta');
    el.sectionList = $('section-list');
    el.sumTotal = $('sum-total');
    el.sumBought = $('sum-bought');
    el.sumSkip = $('sum-skip');
    el.sumSaved = $('sum-saved');
    el.reminderBlock = $('reminder-block');
    el.reminderList = $('reminder-list');
    el.recordsTable = $('records-table');
    el.recordsBody = $('records-body');
    el.recordsEmpty = $('records-empty');
  }

  function showView(key) {
    var keys = ['home', 'result', 'records'];
    keys.forEach(function (name) {
      var node = el.views[name];
      if (!node) return;
      if (name === key) node.className = 'view is-active';
      else node.className = 'view';
    });
    global.scrollTo(0, 0);
  }

  /* ---------- 选项 chips ---------- */
  function buildChips() {
    el.freqChips.innerHTML = '';
    Engine.FREQ_OPTIONS.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip' + (state.freqKey === opt.key ? ' is-on' : '');
      btn.textContent = opt.label;
      btn.setAttribute('data-key', opt.key);
      btn.addEventListener('click', function () {
        state.freqKey = opt.key;
        buildChips();
      });
      el.freqChips.appendChild(btn);
    });
  }

  function buildTagChips() {
    el.tagChips.innerHTML = '';
    Engine.TAG_OPTIONS.forEach(function (tag) {
      var btn = document.createElement('button');
      btn.type = 'button';
      var on = state.tags.indexOf(tag) !== -1;
      btn.className = 'chip' + (on ? ' is-on' : '');
      btn.textContent = tag;
      btn.addEventListener('click', function () {
        var idx = state.tags.indexOf(tag);
        if (idx === -1) state.tags.push(tag);
        else state.tags.splice(idx, 1);
        buildTagChips();
      });
      el.tagChips.appendChild(btn);
    });
  }

  /* ---------- 照片：生成上传用缩略图 ---------- */
  function handlePhoto(file) {
    if (!file) return;
    if (!/^image\//.test(file.type || '')) {
      alert('只能选图片');
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 240;
        var ratio = Math.min(1, max / Math.max(img.width || max, img.height || max));
        var canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round((img.width || max) * ratio));
        canvas.height = Math.max(1, Math.round((img.height || max) * ratio));
        var ctx = canvas.getContext('2d');
        if (!ctx) {
          state.thumb = '';
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
          state.thumb = canvas.toDataURL('image/jpeg', 0.7);
        } catch (e) {
          state.thumb = '';
        }
        if (state.thumb) {
          el.photoPreview.src = state.thumb;
          el.photoWrap.hidden = false;
          el.photoDrop.hidden = true;
        }
      };
      img.onerror = function () {
        alert('这张图读不出来，换一张试试');
      };
      img.src = reader.result;
    };
    reader.onerror = function () {
      alert('这张图读不出来，换一张试试');
    };
    reader.readAsDataURL(file);
  }

  function clearPhoto() {
    state.thumb = '';
    el.photoPreview.removeAttribute('src');
    el.photoWrap.hidden = true;
    el.photoDrop.hidden = false;
    el.photoInput.value = '';
  }

  /* ---------- 判断 ---------- */
  function readInput() {
    state.name = (el.name.value || '').trim();
    var priceText = (el.price.value || '').trim();
    state.price = parseFloat(priceText);
    if (isNaN(state.price) || state.price < 0) state.price = 0;
    state.hasSimilar = !!el.similar.checked;
  }

  function analyze() {
    if (state.analyzing) return;
    readInput();

    if (!state.name) {
      alert('先写一句想买什么，例如「戴森吹风机」');
      return;
    }
    if (!state.price) {
      alert('填个大概价格，算账要用');
      return;
    }

    state.analyzing = true;
    el.btnAnalyze.disabled = true;
    el.btnAnalyze.textContent = '军师算账中…';

    var input = {
      name: state.name,
      price: state.price,
      freqKey: state.freqKey,
      tags: state.tags.slice(),
      hasSimilar: state.hasSimilar
    };

    Engine.judge(input).then(function (result) {
      state.analyzing = false;
      el.btnAnalyze.disabled = false;
      el.btnAnalyze.textContent = '帮我判断要不要买';
      renderResult(result);
      saveResult(result, input);
    }, function () {
      state.analyzing = false;
      el.btnAnalyze.disabled = false;
      el.btnAnalyze.textContent = '帮我判断要不要买';
      alert('判断失败，请再试一次');
    });
  }

  function renderResult(result) {
    el.verdictValue.textContent = result.verdict;
    el.verdictCard.className = 'verdict';
    if (result.verdictClass === 'hold') el.verdictCard.className = 'verdict is-hold';
    if (result.verdictClass === 'skip') el.verdictCard.className = 'verdict is-skip';

    var meta = result.source === 'ai' ? '结论由容器 AI 文本能力生成' : '结论由本机算账规则生成（未联网）';
    if (result.coolingDays > 0) meta += ' · 建议冷静 ' + result.coolingDays + ' 天';
    el.resultMeta.textContent = meta;

    el.sectionList.innerHTML = '';
    result.sections.forEach(function (section) {
      var card = document.createElement('div');
      card.className = 'section-card';

      var bar = document.createElement('div');
      bar.className = 'section-bar';
      if (result.verdictClass === 'hold') bar.className = 'section-bar is-hold';
      if (result.verdictClass === 'skip') bar.className = 'section-bar is-skip';

      var body = document.createElement('div');
      body.className = 'section-body';

      var title = document.createElement('div');
      title.className = 'section-title';
      title.textContent = section.title;

      var text = document.createElement('div');
      text.className = 'section-text';
      text.textContent = section.text;

      body.appendChild(title);
      body.appendChild(text);
      card.appendChild(bar);
      card.appendChild(body);
      el.sectionList.appendChild(card);
    });

    showView('result');
  }

  function saveResult(result, input) {
    var summary = '';
    for (var i = 0; i < result.sections.length; i++) {
      if (result.sections[i].title === '一句话') {
        summary = result.sections[i].text;
        break;
      }
    }

    Store.addRecord({
      ts: Date.now(),
      name: result.name || input.name,
      price: String(input.price),
      verdict: result.verdict,
      verdictClass: result.verdictClass,
      summary: summary,
      source: result.source,
      thumb: state.thumb || ''
    }).then(function (record) {
      if (result.coolingDays > 0) {
        Store.addReminder({
          recordId: record.id,
          name: record.name,
          days: result.coolingDays,
          dueTs: Date.now() + result.coolingDays * 24 * 60 * 60 * 1000,
          text: result.coolingDays + ' 天前你在考虑「' + record.name + '」，冷静期到了——现在还想买吗？'
        }).then(function () {
          alert('已记下 ' + result.coolingDays + ' 天冷静期，到期会在首页提醒你');
          refreshHome();
        }).catch(function () { alert('提醒保存失败，请检查记录'); });
      } else {
        refreshHome();
      }
    }).catch(function () { alert('保存结果未知，请重新打开记录检查'); });
  }

  /* ---------- 首页提醒与红点 ---------- */
  function refreshHome() {
    return Store.dueBanners().then(function (list) {
      el.bannerList.innerHTML = '';
      list.forEach(function (item) {
        el.bannerList.appendChild(renderBanner(item));
      });
      return Promise.all([Store.unreadCount(), Store.loadRecords(), Store.getFlag('recordsTipSeen')]);
    }).then(function (res) {
      var count = res[0];
      if (count > 0) {
        el.dot.hidden = false;
        el.dot.textContent = count > 99 ? '99+' : String(count);
      } else {
        el.dot.hidden = true;
      }

      /* 小手引导：有过查询记录、但还没点开过「我的记录」时才出现 */
      var hasRecords = res[1].length > 0;
      var tipSeen = res[2];
      var showTip = hasRecords && !tipSeen;
      el.tipHand.hidden = !showTip;
      el.btnRecords.className = showTip ? 'hero-entry has-tip' : 'hero-entry';
    });
  }

  function renderBanner(item) {
    var wrap = document.createElement('div');
    wrap.className = 'banner';

    var tag = document.createElement('div');
    tag.className = 'banner-tag';
    tag.textContent = '冷静期到了';

    var text = document.createElement('div');
    text.className = 'banner-text';
    text.textContent = item.text;

    var actions = document.createElement('div');
    actions.className = 'banner-actions';

    var snooze = document.createElement('button');
    snooze.type = 'button';
    snooze.className = 'mini-btn';
    snooze.textContent = '下次不显示';
    snooze.addEventListener('click', function () {
      Store.updateReminder(item.id, {
        status: 'snoozed',
        snoozeUntil: Store.nextDayStart()
      }).then(refreshHome);
    });

    var dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'mini-btn is-strong';
    dismiss.textContent = '不再提醒';
    dismiss.addEventListener('click', function () {
      Store.updateReminder(item.id, { status: 'dismissed', seen: true }).then(refreshHome);
    });

    actions.appendChild(snooze);
    actions.appendChild(dismiss);

    wrap.appendChild(tag);
    wrap.appendChild(text);
    wrap.appendChild(actions);
    return wrap;
  }

  /* ---------- 记录页 ---------- */
  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function formatDate(ts) {
    var d = new Date(ts);
    return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function openRecords() {
    var now = Date.now();

    Store.reviveSnoozed().then(function (list) {
      var pending = list.filter(function (r) {
        return r.dueTs <= now && !r.seen && r.status !== 'dismissed';
      });
      var chain = Promise.resolve();
      pending.forEach(function (r) {
        chain = chain.then(function () {
          return Store.updateReminder(r.id, { seen: true });
        });
      });
      return chain;
    }).then(function () {
      return Promise.all([Store.loadReminders(), Store.loadRecords()]);
    }).then(function (res) {
      renderReminders(res[0], now);
      renderRecords(res[1]);
      showView('records');
      return Store.setFlag('recordsTipSeen');
    }).then(function () {
      refreshHome();
    });
  }

  function renderReminders(list, now) {
    var visible = list.filter(function (r) { return r.status !== 'dismissed'; });
    el.reminderList.innerHTML = '';
    if (visible.length === 0) {
      el.reminderBlock.hidden = true;
      return;
    }
    el.reminderBlock.hidden = false;

    visible.forEach(function (item) {
      var wrap = document.createElement('div');
      wrap.className = 'reminder';

      var head = document.createElement('div');
      head.className = 'reminder-head';

      var name = document.createElement('div');
      name.className = 'reminder-name';
      name.textContent = item.name;

      var due = document.createElement('div');
      due.className = 'reminder-due' + (item.dueTs <= now ? ' is-on' : '');
      due.textContent = item.dueTs <= now ? '已到期' : formatDate(item.dueTs) + ' 到期';

      head.appendChild(name);
      head.appendChild(due);

      var text = document.createElement('div');
      text.className = 'reminder-text';
      text.textContent = item.text;

      var actions = document.createElement('div');
      actions.className = 'banner-actions';

      var dismiss = document.createElement('button');
      dismiss.type = 'button';
      dismiss.className = 'mini-btn is-strong';
      dismiss.textContent = '不再提醒';
      dismiss.addEventListener('click', function () {
        Store.updateReminder(item.id, { status: 'dismissed', seen: true }).then(openRecords);
      });
      actions.appendChild(dismiss);

      wrap.appendChild(head);
      wrap.appendChild(text);
      wrap.appendChild(actions);
      el.reminderList.appendChild(wrap);
    });
  }

  function renderRecords(list) {
    el.recordsBody.innerHTML = '';

    var bought = 0;
    var skip = 0;
    var saved = 0;

    list.forEach(function (record) {
      var price = parseFloat(record.price);
      if (isNaN(price)) price = 0;
      if (record.bought === true) bought += 1;
      if (record.bought === false) {
        skip += 1;
        saved += price;
      }
    });

    el.sumTotal.textContent = String(list.length);
    el.sumBought.textContent = String(bought);
    el.sumSkip.textContent = String(skip);
    el.sumSaved.textContent = '¥' + String(Math.round(saved));

    if (list.length === 0) {
      el.recordsTable.hidden = true;
      el.recordsEmpty.hidden = false;
      return;
    }

    el.recordsTable.hidden = false;
    el.recordsEmpty.hidden = true;

    list.forEach(function (record) {
      el.recordsBody.appendChild(renderRecordRow(record));
    });
  }

  function renderRecordRow(record) {
    var row = document.createElement('div');
    row.className = 'tr';

    var tdName = document.createElement('div');
    tdName.className = 'td td-name';

    var nameRow = document.createElement('div');
    nameRow.className = 'name-row';

    if (record.thumb) {
      var img = document.createElement('img');
      img.className = 'thumb';
      global.BonCloud.bindImage(img, record.thumb).catch(function () { img.alt = '照片读取失败'; });
      img.alt = '';
      nameRow.appendChild(img);
    } else {
      var ph = document.createElement('div');
      ph.className = 'thumb thumb-empty';
      ph.textContent = '?';
      nameRow.appendChild(ph);
    }

    var col = document.createElement('div');
    col.className = 'name-col';

    var nameText = document.createElement('div');
    nameText.className = 'name-text';
    nameText.textContent = record.name;

    var meta = document.createElement('div');
    meta.className = 'name-meta';
    meta.textContent = formatDate(record.ts) + (record.price ? ' · ¥' + record.price : '');

    col.appendChild(nameText);
    col.appendChild(meta);
    nameRow.appendChild(col);
    tdName.appendChild(nameRow);

    var tdVerdict = document.createElement('div');
    tdVerdict.className = 'td td-verdict';
    var pill = document.createElement('span');
    var cls = 'pill';
    if (record.verdictClass === 'buy') cls += ' is-buy';
    else if (record.verdictClass === 'skip') cls += ' is-skip';
    else cls += ' is-hold';
    pill.className = cls;
    pill.textContent = record.verdict;
    tdVerdict.appendChild(pill);

    var tdBought = document.createElement('div');
    tdBought.className = 'td td-bought';
    var btns = document.createElement('div');
    btns.className = 'buy-btns';

    var yes = document.createElement('button');
    yes.type = 'button';
    yes.className = 'buy-btn' + (record.bought === true ? ' is-yes' : '');
    yes.textContent = '买了';
    yes.addEventListener('click', function () {
      var next = record.bought === true ? null : true;
      Store.updateRecord(record.id, { bought: next }).then(openRecords);
    });

    var no = document.createElement('button');
    no.type = 'button';
    no.className = 'buy-btn' + (record.bought === false ? ' is-no' : '');
    no.textContent = '没买';
    no.addEventListener('click', function () {
      var next = record.bought === false ? null : false;
      Store.updateRecord(record.id, { bought: next }).then(openRecords);
    });

    btns.appendChild(yes);
    btns.appendChild(no);
    tdBought.appendChild(btns);

    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'tr-del';
    del.textContent = '×';
    del.addEventListener('click', function () {
      if (!confirm('删掉「' + record.name + '」这条记录？相关提醒也会一并清掉。')) return;
      Store.removeRecord(record.id).then(function () {
        return Store.loadReminders();
      }).then(function (reminders) {
        var chain = Promise.resolve();
        reminders.forEach(function (r) {
          if (r.recordId === record.id) {
            chain = chain.then(function () { return Store.removeReminder(r.id); });
          }
        });
        return chain;
      }).then(openRecords);
    });

    row.appendChild(tdName);
    row.appendChild(tdVerdict);
    row.appendChild(tdBought);
    row.appendChild(del);
    return row;
  }

  /* ---------- 事件绑定 ---------- */
  function bind() {
    el.btnAnalyze.addEventListener('click', analyze);

    $('btn-records').addEventListener('click', openRecords);
    $('btn-to-records').addEventListener('click', openRecords);
    $('btn-home').addEventListener('click', function () { showView('home'); });
    $('btn-empty-back').addEventListener('click', function () { showView('home'); });

    $('btn-again').addEventListener('click', function () {
      state.name = '';
      state.price = 0;
      state.tags = [];
      state.hasSimilar = false;
      state.thumb = '';
      el.name.value = '';
      el.price.value = '';
      el.similar.checked = false;
      clearPhoto();
      buildTagChips();
      showView('home');
      refreshHome();
    });

    el.photoInput.addEventListener('change', function (e) {
      var files = e.target.files;
      if (files && files[0]) handlePhoto(files[0]);
    });

    $('btn-remove-photo').addEventListener('click', function (e) {
      e.preventDefault();
      clearPhoto();
    });

  }

  function init() {
    cache();
    buildChips();
    buildTagChips();
    bind();
    refreshHome();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
