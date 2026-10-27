/* 页面：首页 / 明细。依赖 store、icons、charts、ui */
(function (global) {
  'use strict';
  var QH = (global.QH = global.QH || {});
  var pages = (QH.pages = QH.pages || {});
  var view = (QH.view = QH.view || {});
  var S = QH.store;

  /* ------------------------------------------------------------ 复用片段 */

  view.entryRow = function (e, opts) {
    var options = opts || {};
    var cat = S.categoryById(e.categoryId);
    var name = cat ? cat.name : '未分类';
    var color = cat ? cat.color : '#8EAAA1';
    var tips = S.book().prefs.tips !== false;
    var meta = QH.ui.dayLabel(e.time);
    if (e.note && tips) meta += ' · ' + e.note;
    return '' +
      '<div class="entry" data-entry="' + e.id + '" tabindex="0" role="button">' +
        '<span class="ico" style="color:' + color + ';background:' + QH.tint(color) + '">' +
          QH.categoryIcon(name, e.type, 20) + '</span>' +
        '<span class="entry-main">' +
          '<span class="entry-cat">' + QH.ui.esc(name) + '</span>' +
          '<span class="entry-meta">' + QH.ui.esc(meta) + '</span>' +
        '</span>' +
        '<span class="amt ' + (e.type === QH.EXPENSE ? 'out' : 'in') + '">' +
          (e.type === QH.EXPENSE ? '−' : '+') + S.money(e.cents) + '</span>' +
        (options.deletable === false ? '' :
          '<button class="icon-btn entry-del" data-del="' + e.id + '" aria-label="删除">' +
          QH.icon('trash', 16) + '</button>') +
      '</div>';
  };

  view.secHead = function (title, mark, action) {
    return '<div class="sec">' +
      '<h2>' + (mark ? '<span class="mark">' + mark + '</span>' : '') + QH.ui.esc(title) + '</h2>' +
      (action || '') + '</div>';
  };

  view.rail = function (percent, color, height) {
    var p = Math.max(0, Math.min(100, percent));
    return '<div class="rail" style="height:' + (height || 8) + 'px">' +
      '<i style="width:' + p + '%;background:' + color + '"></i></div>';
  };

  view.empty = function (title, desc, action) {
    return '<div class="empty">' +
      '<span class="empty-mark">' + QH.icon('spark', 22) + '</span>' +
      '<h3>' + QH.ui.esc(title) + '</h3>' +
      (desc ? '<p>' + QH.ui.esc(desc) + '</p>' : '') +
      (action || '') + '</div>';
  };

  view.metric = function (label, value, tone, extra) {
    return '<div class="metric">' +
      '<span class="metric-label">' + QH.ui.esc(label) + '</span>' +
      '<strong class="metric-value ' + (tone || '') + '">' + value + '</strong>' +
      (extra ? '<span class="metric-extra">' + extra + '</span>' : '') +
      '</div>';
  };

  view.categoryList = function (byCategory, total, limit) {
    var rows = Object.keys(byCategory).map(function (name) {
      return { name: name, value: byCategory[name] };
    }).sort(function (a, b) { return b.value - a.value; });
    if (!rows.length) return '';
    var shown = rows.slice(0, limit || 8);
    var rest = rows.slice(limit || 8);
    var restSum = rest.reduce(function (s, r) { return s + r.value; }, 0);
    if (restSum > 0) shown.push({ name: '其他 ' + rest.length + ' 项', value: restSum, muted: true });

    return '<div class="catlist">' + shown.map(function (r, i) {
      var color = r.muted ? QH.ui.cssVar('--muted') : QH.PALETTE[i % QH.PALETTE.length];
      var pct = total > 0 ? r.value / total * 100 : 0;
      return '<div class="catrow">' +
        '<span class="cat-dot" style="background:' + color + '"></span>' +
        '<span class="cat-name">' + QH.ui.esc(r.name) + '</span>' +
        '<span class="cat-rail">' + view.rail(pct, color, 6) + '</span>' +
        '<span class="cat-pct">' + pct.toFixed(pct >= 10 ? 0 : 1) + '%</span>' +
        '<span class="cat-amt">' + S.money(r.value) + '</span>' +
        '</div>';
    }).join('') + '</div>';
  };

  /* ------------------------------------------------------------- 首页 */

  pages.home = function (root) {
    var book = S.book();
    var user = S.user();
    var m = S.monthRange(QH.state.month);
    var entries = S.entriesIn(m.from, m.until);
    var agg = S.aggregate(entries);
    var balance = agg.income - agg.expense;
    var total = agg.income + agg.expense;
    var inPct = total > 0 ? (agg.income / total * 100) : 50;
    var budget = S.monthlyBudget();
    var tips = book.prefs.tips !== false;

    var elapsed = QH.state.month === 0
      ? new Date().getDate()
      : (QH.state.month < 0 ? m.days : 1);
    var avgDaily = elapsed > 0 ? Math.round(agg.expense / elapsed) : 0;
    var saveRate = agg.income > 0 ? Math.round(balance / agg.income * 100) : null;

    var catSegments = Object.keys(agg.byCategory).map(function (name, i) {
      return { label: name, value: agg.byCategory[name], color: QH.PALETTE[i % QH.PALETTE.length] };
    }).sort(function (a, b) { return b.value - a.value; }).slice(0, 6);

    var recent = entries.slice(0, 8);

    /* 每月固定：到日子且本月还没记的 */
    var pendingRules = S.pendingRecurring();
    var recurringBlock = '';
    if (pendingRules.length) {
      recurringBlock = '<div class="card recurring-card">' +
        '<div class="card-head"><h3>每月固定</h3>' +
          '<span class="sec-note">本月待记 ' + pendingRules.length + ' 笔</span></div>' +
        '<div class="recurring-list">' +
          pendingRules.map(function (r) {
            var cat = S.categoryById(r.categoryId);
            var color = cat ? cat.color : QH.toneOf(r.name, r.type);
            return '<span class="recurring-item">' +
              '<i style="background:' + color + '"></i>' +
              QH.ui.esc(r.name) + ' · ' + r.day + ' 号 ' +
              '<b class="' + (r.type === QH.INCOME ? 'in' : 'out') + '">' +
                (r.type === QH.INCOME ? '+' : '−') + S.money(r.cents) + '</b>' +
              '</span>';
          }).join('') +
        '</div>' +
        '<div class="recurring-actions">' +
          '<button class="btn ghost sm" data-route="budget">管理</button>' +
          '<button class="btn primary sm" data-apply-recurring>一键记上</button>' +
        '</div>' +
      '</div>';
    }

    var budgetBlock;
    if (budget > 0) {
      var used = agg.expense / budget * 100;
      var over = agg.expense > budget;
      var daysLeft = QH.state.month === 0 ? Math.max(m.days - new Date().getDate() + 1, 1) : m.days;
      var perDay = Math.max(0, Math.floor((budget - agg.expense) / daysLeft));
      budgetBlock = '' +
        '<div class="card">' +
          '<div class="card-head">' +
            '<h3>本月预算</h3>' +
            '<button class="link" data-route="budget">调整</button>' +
          '</div>' +
          '<p class="budget-figure ' + (over ? 'over' : '') + '">' + S.money(agg.expense) +
            '<span class="of"> / ' + S.money(budget) + '</span></p>' +
          view.rail(used, over ? QH.ui.cssVar('--coral') : QH.ui.cssVar('--green'), 10) +
          '<p class="muted small">' +
            (over
              ? '已超支 ' + S.money(agg.expense - budget)
              : '剩余 ' + S.money(budget - agg.expense) + ' · 按 ' + daysLeft + ' 天算，日均可用 ' + S.money(perDay)) +
            ' · 已用 ' + Math.round(used) + '%' +
          '</p>' +
        '</div>';
    } else {
      budgetBlock = '' +
        '<div class="card prompt-card">' +
          '<div>' +
            '<h3>还没有设置预算</h3>' +
            '<p class="muted small">设一个月度总额，超支时首页会主动提醒你。</p>' +
          '</div>' +
          '<button class="btn ghost sm" data-route="budget">去设置</button>' +
        '</div>';
    }

    root.innerHTML = '' +
      '<header class="page-head">' +
        '<div>' +
          '<h1>你好，' + QH.ui.esc(user.name) + '</h1>' +
          '<p class="sub">' + (tips ? '愿每一笔收支，都被温柔安放' : S.isoDate(Date.now())) + '</p>' +
        '</div>' +
        '<div class="head-actions">' +
          '<button class="btn primary" data-add>＋ 记一笔</button>' +
        '</div>' +
      '</header>' +

      '<section class="hero">' +
        '<div class="hero-deco" aria-hidden="true">' + heroDecor() + '</div>' +
        '<div class="hero-top">' +
          '<span class="hero-badge">✦ 你的财务小结</span>' +
          '<div class="month-switch">' +
            '<button data-month="-1" aria-label="上个月">' + QH.icon('chevronLeft', 16) + '</button>' +
            '<button class="month-label" data-month="0" title="回到本月">' + m.label + '</button>' +
            '<button data-month="1" aria-label="下个月">' + QH.icon('chevronRight', 16) + '</button>' +
          '</div>' +
        '</div>' +
        '<p class="hero-label">本期结余</p>' +
        '<p class="hero-value">' + (balance < 0 ? '−' : '') + S.money(Math.abs(balance)) + '</p>' +
        '<div class="hero-stats">' +
          '<span><i class="up"></i>收入 ' + S.money(agg.income) + '</span>' +
          '<span><i class="down"></i>支出 ' + S.money(agg.expense) + '</span>' +
          '<span class="count">' + agg.count + ' 笔</span>' +
        '</div>' +
        '<div class="hero-rail">' +
          '<i style="width:' + inPct + '%;background:linear-gradient(90deg,#7FD3B6,#3E9E88)"></i>' +
          '<i style="width:' + (100 - inPct) + '%;background:linear-gradient(90deg,#F0A08F,#D9695C)"></i>' +
        '</div>' +
        '<p class="hero-note">' +
          (agg.count === 0
            ? '这个月还没有记录，从一笔小额支出开始吧。'
            : (saveRate == null ? '本期还没有收入记录。'
              : '结余率 ' + saveRate + '% · ' + (saveRate >= 30 ? '攒得不错，继续保持。'
                : saveRate >= 0 ? '略有结余，可以再收紧一点。' : '这个月花超了收入，留意大额支出。'))) +
        '</p>' +
      '</section>' +

      '<form class="nl-bar" data-nl-form>' +
        '<span class="nl-ico" aria-hidden="true">' + QH.icon('spark', 18) + '</span>' +
        '<input class="nl-input" data-nl-input autocomplete="off" ' +
          'placeholder="说一句：昨天火锅 128，打车 32" aria-label="一句话记账">' +
        '<button class="nl-go" type="submit">解析</button>' +
      '</form>' +
      '<p class="nl-hint"><b>一句话记账</b> · 中文解析在本地跑，不联网、不上传</p>' +

      '<div class="metric-grid">' +
        view.metric('本期收入', S.money(agg.income), 'in') +
        view.metric('本期支出', S.money(agg.expense), 'out') +
        view.metric('日均支出', S.money(avgDaily), '', '按已过 ' + elapsed + ' 天计算') +
      '</div>' +

      budgetBlock +
      recurringBlock +

      view.secHead('钱花在哪里', '▦', '<button class="link" data-route="stats">看统计</button>') +
      (catSegments.length
        ? '<div class="card donut-card">' +
            '<div class="donut-wrap">' + QH.charts.donut(catSegments, { centerLabel: '合计支出' }) + '</div>' +
            '<div class="donut-side">' + view.categoryList(agg.byCategory, agg.expense, 5) + '</div>' +
          '</div>'
        : view.empty('这个月还没花钱', '记一笔之后，这里会出现分类占比。',
            '<button class="btn primary sm" data-add>记第一笔</button>')) +

      view.secHead('最近记录', '≡', entries.length ? '<button class="link" data-route="detail">全部明细</button>' : '') +
      (recent.length
        ? '<div class="entry-list">' + recent.map(function (e) { return view.entryRow(e); }).join('') + '</div>'
        : view.empty('账本还是空的', '先记一笔，或导入一份 CSV 账单看看效果。',
            '<div class="empty-actions">' +
            '<button class="btn primary sm" data-add>记一笔</button>' +
            '<button class="btn ghost sm" data-demo>填入示例数据</button>' +
            '</div>'));

    bindHome(root);
  };

  function heroDecor() {
    return '' +
      '<svg viewBox="0 0 340 190" preserveAspectRatio="xMidYMid slice">' +
        '<g fill="none" stroke="#E7D29B" stroke-opacity=".38" stroke-linecap="round">' +
          '<path d="M250 34c14 0 18-9 30-9s16 10 4 10-22 8-34 8"/>' +
          '<path d="M258 52c10 0 12-7 21-7"/>' +
        '</g>' +
        '<g fill="none" stroke="#9FD8C1" stroke-opacity=".22" stroke-linecap="round">' +
          '<path d="M-10 150c26-14 52 14 78 0s52 14 78 0 52 14 78 0 52 14 78 0"/>' +
          '<path d="M-10 166c26-14 52 14 78 0s52 14 78 0 52 14 78 0 52 14 78 0"/>' +
          '<path d="M-10 182c26-14 52 14 78 0s52 14 78 0 52 14 78 0 52 14 78 0"/>' +
        '</g>' +
        '<g fill="none" stroke="#E7D29B" stroke-opacity=".3" stroke-width="1.2">' +
          '<path d="M300 96c-6 6-6 12 0 18M306 96c6 6 6 12 0 18"/>' +
        '</g>' +
      '</svg>';
  }

  function bindHome(root) {
    root.querySelectorAll('[data-month]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = parseInt(btn.getAttribute('data-month'), 10);
        if (step === 0) QH.state.month = 0;
        else QH.state.month = Math.min(0, QH.state.month + step);
        QH.render();
      });
    });
    root.querySelectorAll('[data-demo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        S.seedDemo();
        QH.ui.toast('已填入示例数据');
        QH.render();
      });
    });

    root.querySelectorAll('[data-apply-recurring]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var made = S.applyRecurring();
        QH.ui.toast(made ? '已记 ' + made + ' 笔固定收支' : '没有待记的固定项');
        QH.render();
      });
    });

    var nlForm = root.querySelector('[data-nl-form]');
    if (nlForm) {
      var nlInput = nlForm.querySelector('[data-nl-input]');
      nlForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var text = nlInput.value.trim();
        if (!text) {
          nlInput.focus();
          QH.ui.toast('先说一句，例如：昨天火锅 128，打车 32');
          return;
        }
        QH.openNL(text);
      });
      /* 占位词轮换，给新用户一个可抄的句式 */
      var idx = 0;
      var timer = setInterval(function () {
        if (!document.body.contains(nlInput)) { clearInterval(timer); return; }
        if (nlInput.value || document.activeElement === nlInput) return;
        idx = (idx + 1) % QH.nl.examples.length;
        nlInput.setAttribute('placeholder', '说一句：' + QH.nl.examples[idx]);
      }, 4200);
    }

    bindEntryRows(root);
  }

  function bindEntryRows(root) {
    root.querySelectorAll('[data-entry]').forEach(function (row) {
      row.addEventListener('click', function (event) {
        if (event.target.closest('[data-del]')) return;
        QH.openEntry(row.getAttribute('data-entry'));
      });
      row.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          QH.openEntry(row.getAttribute('data-entry'));
        }
      });
    });
    root.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.stopPropagation();
        var entry = S.entryById(btn.getAttribute('data-del'));
        if (!entry) return;
        var cat = S.categoryById(entry.categoryId);
        QH.ui.confirm({
          title: '删除这笔记录？',
          message: '「' + QH.ui.esc(cat ? cat.name : '未分类') + ' ' + S.money(entry.cents) +
            '」将被移除，此操作不可撤销。',
          confirmText: '删除',
          danger: true
        }).then(function (ok) {
          if (!ok) return;
          S.deleteEntry(entry.id);
          QH.ui.toast('已删除');
          QH.render();
        });
      });
    });
  }
  QH.bindEntryRows = bindEntryRows;

  /* ------------------------------------------------------------- 明细 */

  function detailFilter() {
    return QH.state.detail;
  }

  function filteredEntries() {
    var f = detailFilter();
    var list = S.allEntries();
    if (f.type !== 'all') {
      var want = f.type === 'income' ? QH.INCOME : QH.EXPENSE;
      list = list.filter(function (e) { return e.type === want; });
    }
    if (f.cat !== 'all') {
      list = list.filter(function (e) { return e.categoryId === f.cat; });
    }
    if (f.from) {
      var from = S.parseISO(f.from);
      list = list.filter(function (e) { return e.time >= from; });
    }
    if (f.to) {
      var to = S.parseISO(f.to) + 86400000;
      list = list.filter(function (e) { return e.time < to; });
    }
    if (f.q) {
      var q = f.q.toLowerCase();
      list = list.filter(function (e) {
        var cat = S.categoryById(e.categoryId);
        return (cat && cat.name.toLowerCase().indexOf(q) >= 0) ||
          (e.note || '').toLowerCase().indexOf(q) >= 0 ||
          S.isoDate(e.time).indexOf(q) >= 0 ||
          S.inputAmount(e.cents).indexOf(q) >= 0;
      });
    }
    return list;
  }

  pages.detail = function (root) {
    var f = detailFilter();
    var cats = S.categories();
    var options = '<option value="all">全部分类</option>' +
      ['支出', '收入'].map(function (label, idx) {
        var group = cats.filter(function (c) { return c.type === idx; });
        if (!group.length) return '';
        return '<optgroup label="' + label + '">' + group.map(function (c) {
          return '<option value="' + c.id + '"' + (f.cat === c.id ? ' selected' : '') + '>' +
            QH.ui.esc(c.name) + '</option>';
        }).join('') + '</optgroup>';
      }).join('');

    root.innerHTML = '' +
      '<header class="page-head">' +
        '<div>' +
          '<h1>明细</h1>' +
          '<p class="sub">搜索、筛选、编辑与导出，全部在本机完成</p>' +
        '</div>' +
        '<div class="head-actions">' +
          '<button class="btn ghost" data-export>' + QH.icon('download', 17) + '导出 CSV</button>' +
          '<button class="btn primary" data-add>＋ 记一笔</button>' +
        '</div>' +
      '</header>' +

      '<div class="card filter-card">' +
        '<div class="search-wrap">' +
          QH.icon('search', 17) +
          '<input class="search" data-q placeholder="搜索分类、备注、金额或日期" value="' + QH.ui.esc(f.q) + '">' +
        '</div>' +
        '<div class="filter-row">' +
          '<div class="chips" data-typechips>' +
            '<button class="chip' + (f.type === 'all' ? ' on' : '') + '" data-type="all">全部</button>' +
            '<button class="chip' + (f.type === 'expense' ? ' on' : '') + '" data-type="expense">支出</button>' +
            '<button class="chip' + (f.type === 'income' ? ' on' : '') + '" data-type="income">收入</button>' +
          '</div>' +
          '<select class="field sm" data-cat>' + options + '</select>' +
          '<input class="field sm" type="date" data-from value="' + f.from + '" aria-label="开始日期">' +
          '<span class="dash">—</span>' +
          '<input class="field sm" type="date" data-to value="' + f.to + '" aria-label="结束日期">' +
          '<button class="chip quick" data-quick="month">本月</button>' +
          '<button class="chip quick" data-quick="last">上月</button>' +
          '<button class="chip quick" data-quick="clear">重置</button>' +
        '</div>' +
      '</div>' +

      '<div id="detail-summary" class="summary-strip"></div>' +
      '<div id="detail-list" class="entry-groups"></div>';

    function refresh() {
      var list = filteredEntries();
      var agg = S.aggregate(list);
      var summary = document.getElementById('detail-summary');
      summary.innerHTML =
        '<span><b>' + agg.count + '</b> 笔</span>' +
        '<span class="in">收入 <b>' + S.money(agg.income) + '</b></span>' +
        '<span class="out">支出 <b>' + S.money(agg.expense) + '</b></span>' +
        '<span>净额 <b class="' + (agg.income - agg.expense < 0 ? 'out' : 'in') + '">' +
          S.money(agg.income - agg.expense) + '</b></span>';

      var container = document.getElementById('detail-list');
      if (!list.length) {
        container.innerHTML = view.empty('没有符合条件的记录', '换个筛选条件，或先记一笔。',
          '<button class="btn primary sm" data-add>记一笔</button>');
        return;
      }

      var limit = detailFilter().limit;
      var shown = list.slice(0, limit);
      var groups = {};
      var order = [];
      shown.forEach(function (e) {
        if (!groups[e.time]) { groups[e.time] = []; order.push(e.time); }
        groups[e.time].push(e);
      });

      var html = order.map(function (time) {
        var items = groups[time];
        var income = 0, expense = 0;
        items.forEach(function (e) { if (e.type === QH.INCOME) income += e.cents; else expense += e.cents; });
        return '<section class="day-group">' +
          '<div class="day-head">' +
            '<span class="day-name">' + QH.ui.dayLabel(time) + '</span>' +
            '<span class="day-sum">' +
              (income ? '<i class="in">+' + S.money(income) + '</i>' : '') +
              (expense ? '<i class="out">−' + S.money(expense) + '</i>' : '') +
            '</span>' +
          '</div>' +
          items.map(function (e) { return view.entryRow(e); }).join('') +
          '</section>';
      }).join('');

      if (list.length > limit) {
        html += '<button class="btn ghost block" data-more>还有 ' + (list.length - limit) + ' 笔，继续加载</button>';
      }
      container.innerHTML = html;
      bindEntryRows(container);
      var more = container.querySelector('[data-more]');
      if (more) more.addEventListener('click', function () {
        detailFilter().limit += 100;
        refresh();
      });
    }

    refresh();

    var searchTimer = null;
    var search = root.querySelector('[data-q]');
    search.addEventListener('input', function () {
      detailFilter().q = search.value.trim();
      detailFilter().limit = 80;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(refresh, 160);
    });

    root.querySelectorAll('[data-typechips] [data-type]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        detailFilter().type = chip.getAttribute('data-type');
        root.querySelectorAll('[data-typechips] [data-type]').forEach(function (c) {
          c.classList.toggle('on', c === chip);
        });
        detailFilter().limit = 80;
        refresh();
      });
    });

    root.querySelector('[data-cat]').addEventListener('change', function (event) {
      detailFilter().cat = event.target.value;
      detailFilter().limit = 80;
      refresh();
    });
    root.querySelector('[data-from]').addEventListener('change', function (event) {
      detailFilter().from = event.target.value;
      detailFilter().limit = 80;
      refresh();
    });
    root.querySelector('[data-to]').addEventListener('change', function (event) {
      detailFilter().to = event.target.value;
      detailFilter().limit = 80;
      refresh();
    });

    root.querySelectorAll('[data-quick]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var kind = btn.getAttribute('data-quick');
        if (kind === 'clear') {
          detailFilter().from = '';
          detailFilter().to = '';
        } else {
          var offset = kind === 'last' ? -1 : 0;
          var m = S.monthRange(offset);
          detailFilter().from = S.isoDate(m.from);
          detailFilter().to = S.isoDate(m.until - 86400000);
        }
        detailFilter().limit = 80;
        QH.render();
      });
    });

    root.querySelector('[data-export]').addEventListener('click', function () {
      var list = filteredEntries();
      if (!list.length) { QH.ui.toast('没有可导出的记录'); return; }
      var csv = S.entriesToCsv(list);
      QH.ui.download('青禾明细-' + S.isoDate(Date.now()) + '.csv', csv, 'text/csv');
      QH.ui.toast('已导出 ' + list.length + ' 笔');
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
