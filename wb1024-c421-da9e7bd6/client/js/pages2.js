/* 页面：统计 / 预算 / 设置 / 登录注册 */
(function (global) {
  'use strict';
  var QH = (global.QH = global.QH || {});
  var pages = (QH.pages = QH.pages || {});
  var view = QH.view;
  var S = QH.store;

  function monthKeyOf(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + (d.getMonth() + 1);
  }

  /* 天数跨度大时按周/月聚合，避免柱子挤成一条线 */
  function buildSeries(from, until) {
    var spanDays = Math.round((until - from) / 86400000);
    var buckets = {};
    var order = [];
    var list = S.entriesIn(from, until);
    list.forEach(function (e) {
      var key = e.time;
      if (spanDays > 62) {
        var d = new Date(e.time);
        key = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      }
      if (!buckets[key]) { buckets[key] = { time: key, income: 0, expense: 0 }; order.push(key); }
      if (e.type === QH.INCOME) buckets[key].income += e.cents;
      else buckets[key].expense += e.cents;
    });
    return { days: order.sort(function (a, b) { return a - b; }).map(function (k) { return buckets[k]; }), list: list };
  }

  /* ------------------------------------------------------------- 统计 */

  function resolveRange(st) {
    var now = Date.now();
    var today = S.dayStart(now);
    if (st.range === 'month') {
      var m = S.monthRange(0);
      return { from: m.from, until: m.until, label: m.label };
    }
    if (st.range === 'last') {
      var l = S.monthRange(-1);
      return { from: l.from, until: l.until, label: l.label };
    }
    if (st.range === 'week7') {
      return { from: today - 6 * 86400000, until: today + 86400000, label: '最近 7 天' };
    }
    if (st.range === 'day30') {
      return { from: today - 29 * 86400000, until: today + 86400000, label: '最近 30 天' };
    }
    if (st.range === 'year') {
      var y = new Date().getFullYear();
      return {
        from: new Date(y, 0, 1).getTime(),
        until: new Date(y + 1, 0, 1).getTime(),
        label: y + ' 年'
      };
    }
    var from = today - 29 * 86400000;
    var until = today + 86400000;
    var label = '最近 30 天';
    if (st.from && st.to) {
      try {
        var f = S.parseISO(st.from);
        var t = S.parseISO(st.to) + 86400000;
        if (t <= f) throw new Error('结束日期需晚于开始日期');
        from = f; until = t;
        label = st.from + ' 至 ' + st.to;
      } catch (e) {
        QH.ui.toast(e.message, 'warn');
      }
    }
    return { from: from, until: until, label: label };
  }

  pages.stats = function (root) {
    var st = QH.state.stats;
    var range = resolveRange(st);
    var entries = S.entriesIn(range.from, range.until);
    var agg = S.aggregate(entries);
    var spanDays = Math.max(1, Math.round((range.until - range.from) / 86400000));
    var avgDaily = Math.round(agg.expense / spanDays);
    var series = buildSeries(range.from, range.until);

    /* 近 6 个月趋势 */
    var trendPoints = [];
    for (var i = 5; i >= 0; i--) {
      var mm = S.monthRange(-i);
      var a = S.aggregate(S.entriesIn(mm.from, mm.until));
      trendPoints.push({
        label: (mm.month + 1) + '月',
        income: a.income,
        expense: a.expense
      });
    }

    var catSegments = Object.keys(agg.byCategory).map(function (name, i) {
      return { label: name, value: agg.byCategory[name], color: QH.PALETTE[i % QH.PALETTE.length] };
    }).sort(function (a, b) { return b.value - a.value; });

    var chips = [
      ['month', '本月'], ['last', '上月'], ['week7', '近 7 天'],
      ['day30', '近 30 天'], ['year', '今年'], ['custom', '自定义']
    ].map(function (pair) {
      return '<button class="chip' + (st.range === pair[0] ? ' on' : '') + '" data-range="' + pair[0] + '">' +
        pair[1] + '</button>';
    }).join('');

    var tableRows = entries.slice(0, 60).map(function (e) {
      var cat = S.categoryById(e.categoryId);
      return '<tr>' +
        '<td>' + S.isoDate(e.time).slice(5) + '</td>' +
        '<td>' + QH.ui.esc(cat ? cat.name : '未分类') + '</td>' +
        '<td class="' + (e.type === QH.EXPENSE ? 'out' : 'in') + '">' +
          (e.type === QH.EXPENSE ? '−' : '+') + S.money(e.cents) + '</td>' +
        '<td class="note-cell">' + QH.ui.esc(e.note || '') + '</td>' +
        '</tr>';
    }).join('');

    root.innerHTML = '' +
      '<header class="page-head">' +
        '<div>' +
          '<h1>统计</h1>' +
          '<p class="sub">收支结构、每日走势与可导出的收支表</p>' +
        '</div>' +
        '<div class="head-actions">' +
          '<button class="btn ghost" data-poster>' + QH.icon('spark', 17) + '生成海报</button>' +
          '<button class="btn ghost" data-export>' + QH.icon('download', 17) + '导出本期</button>' +
        '</div>' +
      '</header>' +

      '<div class="card filter-card">' +
        '<div class="chips">' + chips + '</div>' +
        (st.range === 'custom'
          ? '<div class="filter-row">' +
              '<input class="field sm" type="date" data-from value="' + (st.from || S.isoDate(S.monthRange(0).from)) + '">' +
              '<span class="dash">—</span>' +
              '<input class="field sm" type="date" data-to value="' + (st.to || S.isoDate(Date.now())) + '">' +
              '<button class="btn ghost sm" data-apply>生成报表</button>' +
            '</div>'
          : '') +
      '</div>' +

      '<div class="metric-grid four">' +
        view.metric('收入', S.money(agg.income), 'in') +
        view.metric('支出', S.money(agg.expense), 'out') +
        view.metric('结余', S.money(agg.income - agg.expense), agg.income - agg.expense < 0 ? 'out' : 'in') +
        view.metric('日均支出', S.money(avgDaily), '', range.label) +
      '</div>' +

      view.secHead('支出分类', '▦') +
      (catSegments.length
        ? '<div class="card donut-card">' +
            '<div class="donut-wrap">' + QH.charts.donut(catSegments, { centerLabel: '合计支出' }) + '</div>' +
            '<div class="donut-side">' + view.categoryList(agg.byCategory, agg.expense, 8) + '</div>' +
          '</div>'
        : view.empty('这段时间没有支出', '换个时间范围看看，或者先记一笔。')) +

      view.secHead('每日收支', '▥',
        '<div class="segmented mini" data-series-seg>' +
          '<button data-series="expense" class="' + (st.series !== 'income' ? 'on' : '') + '">支出</button>' +
          '<button data-series="income" class="' + (st.series === 'income' ? 'on' : '') + '">收入</button>' +
        '</div>') +
      '<div class="card">' +
        (series.days.length
          ? QH.charts.dailyBars(series.days, st.series === 'income' ? 'income' : 'expense')
          : '<p class="muted small center">暂无数据</p>') +
      '</div>' +

      view.secHead('近 6 个月趋势', '◈') +
      '<div class="card">' + QH.charts.trend(trendPoints) + '</div>' +

      view.secHead('收支表', '▤', '<span class="sec-note">' + entries.length + ' 笔 · 显示前 60 笔</span>') +
      (entries.length
        ? '<div class="card table-card"><table class="data-table">' +
            '<thead><tr><th>日期</th><th>分类</th><th>金额</th><th>备注</th></tr></thead>' +
            '<tbody>' + tableRows + '</tbody></table></div>'
        : view.empty('没有记录', '这个时间范围内还没有收支。')) +
      '<p class="foot-note">数据保存在本机浏览器，导出后可用 Excel 或 AI 继续分析。</p>';

    root.querySelectorAll('[data-range]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        st.range = btn.getAttribute('data-range');
        if (st.range === 'custom' && !st.from) {
          st.from = S.isoDate(S.monthRange(0).from);
          st.to = S.isoDate(Date.now());
        }
        QH.render();
      });
    });
    root.querySelectorAll('[data-series]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        st.series = btn.getAttribute('data-series');
        QH.render();
      });
    });
    var apply = root.querySelector('[data-apply]');
    if (apply) apply.addEventListener('click', function () {
      st.from = root.querySelector('[data-from]').value;
      st.to = root.querySelector('[data-to]').value;
      if (!st.from || !st.to) { QH.ui.toast('请选择起止日期'); return; }
      QH.render();
    });
    root.querySelector('[data-poster]').addEventListener('click', function () {
      var offset = st.range === 'last' ? -1 : 0;
      if (st.range !== 'month' && st.range !== 'last') offset = 0;
      QH.poster.open(offset);
    });

    root.querySelector('[data-export]').addEventListener('click', function () {
      if (!entries.length) { QH.ui.toast('本期没有可导出的记录'); return; }
      QH.ui.download('青禾收支表-' + S.isoDate(range.from) + '-' + S.isoDate(range.until - 86400000) + '.csv',
        S.entriesToCsv(entries), 'text/csv');
      QH.ui.toast('已导出 ' + entries.length + ' 笔');
    });
  };

  /* ------------------------------------------------------------- 预算 */

  function recurringCard() {
    var list = S.recurring();
    var key = S.monthKey(0);
    return '<div class="card" style="margin-top:14px">' +
      '<div class="card-head"><h3>每月固定</h3>' +
        '<button class="link" data-add-recurring>＋ 新增</button></div>' +
      '<p class="muted small">房租、工资这类每月都一样的，设一次就好；到日子首页会提醒你一键记上。</p>' +
      (list.length
        ? '<div class="manage-list">' + list.map(function (r) {
            var cat = S.categoryById(r.categoryId);
            var color = cat ? cat.color : QH.store.toneOf(r.name, r.type);
            var done = r.lastMonth === key;
            return '<div class="manage-row" data-rule="' + r.id + '">' +
              '<span class="ico" style="color:' + color + ';background:' + QH.tint(color) + '">' +
                QH.categoryIcon(cat ? cat.name : r.name, r.type, 18) + '</span>' +
              '<span class="manage-main">' +
                '<span class="manage-top">' +
                  '<span class="manage-name">' + QH.ui.esc(r.name) +
                    (done ? '<em class="done-tag">本月已记</em>' : '') + '</span>' +
                  '<span class="manage-figure ' + (r.type === QH.INCOME ? 'in' : '') + '">' +
                    (r.type === QH.INCOME ? '+' : '−') + S.money(r.cents) + '</span>' +
                '</span>' +
                '<span class="manage-hint">每月 ' + r.day + ' 号 · ' +
                  (cat ? QH.ui.esc(cat.name) : '未分类') + '</span>' +
              '</span>' +
              '<button class="icon-btn" data-del-rule="' + r.id + '" aria-label="删除">' +
                QH.icon('trash', 15) + '</button>' +
            '</div>';
          }).join('') + '</div>'
        : '<p class="manage-hint" style="display:block;margin-top:8px">还没有固定项。</p>') +
    '</div>';
  }

  function openRecurringForm() {
    var cats = S.categories(QH.EXPENSE);
    function options(type) {
      return S.categories(type).map(function (c) {
        return '<option value="' + c.id + '">' + QH.ui.esc(c.name) + '</option>';
      }).join('');
    }
    QH.ui.modal({
      title: '新增每月固定',
      subtitle: '房租、工资、订阅这类每月金额不变的收支',
      body:
        '<label class="field-block"><span>名称</span>' +
          '<input class="field" data-rname maxlength="20" placeholder="例如 房租、工资、话费"></label>' +
        '<div class="form-grid">' +
          '<label class="field-block"><span>类型</span>' +
            '<select class="field" data-rtype>' +
              '<option value="0">支出</option><option value="1">收入</option>' +
            '</select></label>' +
          '<label class="field-block"><span>每月几号</span>' +
            '<input class="field" type="number" min="1" max="28" data-rday value="1"></label>' +
        '</div>' +
        '<div class="form-grid">' +
          '<label class="field-block"><span>分类</span>' +
            '<select class="field" data-rcat>' + options(QH.EXPENSE) + '</select></label>' +
          '<label class="field-block"><span>金额</span>' +
            '<input class="field" data-ramount inputmode="decimal" placeholder="0.00"></label>' +
        '</div>' +
        '<p class="field-hint">日期只支持 1–28 号，避免每月天数不同带来的错位。</p>' +
        '<p class="field-error" data-rerror hidden></p>',
      footer:
        '<button class="btn ghost" data-rcancel>取消</button>' +
        '<div class="foot-right"><button class="btn primary" data-rsave>保存</button></div>',
      onMount: function (m) {
        var typeSel = m.el.querySelector('[data-rtype]');
        var catSel = m.el.querySelector('[data-rcat]');
        var error = m.el.querySelector('[data-rerror]');
        typeSel.addEventListener('change', function () {
          catSel.innerHTML = options(parseInt(typeSel.value, 10));
        });
        /* 按名字猜分类：「房租」→ 居住、「工资」→ 收入 / 工资 */
        m.el.querySelector('[data-rname]').addEventListener('change', function () {
          var kind = QH.store.kindOf(this.value, parseInt(typeSel.value, 10));
          var picks = S.categories().filter(function (c) {
            return QH.store.kindOf(c.name, c.type) === kind;
          });
          if (!picks.length) return;
          var pick = picks[0];
          if (pick.type !== parseInt(typeSel.value, 10)) {
            typeSel.value = String(pick.type);
            catSel.innerHTML = options(pick.type);
          }
          catSel.value = pick.id;
        });
        m.el.querySelector('[data-rcancel]').addEventListener('click', function () { m.close(); });
        m.el.querySelector('[data-rsave]').addEventListener('click', function () {
          var name = m.el.querySelector('[data-rname]').value.trim();
          var cents;
          try { cents = S.parseCents(m.el.querySelector('[data-ramount]').value); }
          catch (e) { error.textContent = e.message; error.hidden = false; return; }
          if (cents <= 0) { error.textContent = '金额要大于 0'; error.hidden = false; return; }
          var day = parseInt(m.el.querySelector('[data-rday]').value, 10) || 1;
          S.addRecurring({
            name: name || (catSel.options[catSel.selectedIndex] || {}).text || '固定项',
            type: parseInt(typeSel.value, 10),
            cents: cents,
            day: day,
            categoryId: catSel.value
          });
          m.close();
          QH.ui.toast('已添加固定项');
          QH.render();
        });
      }
    });
    void cats;
  }

  pages.budget = function (root) {
    var book = S.book();
    var m = S.monthRange(0);
    var entries = S.entriesIn(m.from, m.until);
    var spent = entries.filter(function (e) { return e.type === QH.EXPENSE; })
      .reduce(function (s, e) { return s + e.cents; }, 0);
    var budget = S.monthlyBudget();
    var over = budget > 0 && spent > budget;
    var daysLeft = Math.max(m.days - new Date().getDate() + 1, 1);
    var remaining = budget - spent;

    var expenseCats = S.categories(QH.EXPENSE);
    var incomeCats = S.categories(QH.INCOME);

    function catRows(list, isExpense) {
      return list.map(function (c) {
        var used = entries.filter(function (e) {
          return e.type === QH.EXPENSE && e.categoryId === c.id;
        }).reduce(function (s, e) { return s + e.cents; }, 0);
        var pct = c.budget > 0 ? used / c.budget * 100 : 0;
        var hot = c.budget > 0 && used > c.budget;
        return '<div class="manage-row" data-cat="' + c.id + '">' +
          '<span class="ico" style="color:' + c.color + ';background:' + QH.tint(c.color) + '">' +
            QH.categoryIcon(c.name, c.type, 18) + '</span>' +
          '<span class="manage-main">' +
            '<span class="manage-top">' +
              '<span class="manage-name">' + QH.ui.esc(c.name) + '</span>' +
              '<span class="manage-figure ' + (hot ? 'out' : '') + '">' +
                (isExpense ? S.money(used) : '') +
                (isExpense && c.budget > 0 ? ' <em>/ ' + S.money(c.budget) + '</em>' : '') +
              '</span>' +
            '</span>' +
            (isExpense
              ? (c.budget > 0
                ? view.rail(pct, hot ? QH.ui.cssVar('--coral') : c.color, 6)
                : '<span class="manage-hint">未设分类预算</span>')
              : '<span class="manage-hint">收入分类</span>') +
          '</span>' +
          '<button class="icon-btn" data-edit="' + c.id + '" aria-label="管理分类">' + QH.icon('edit', 15) + '</button>' +
        '</div>';
      }).join('');
    }

    root.innerHTML = '' +
      '<header class="page-head">' +
        '<div>' +
          '<h1>预算</h1>' +
          '<p class="sub">先定月度总额，再给每个支出分类分配额度</p>' +
        '</div>' +
      '</header>' +

      '<section class="card budget-hero">' +
        '<div class="bh-head">' +
          '<div>' +
            '<p class="bh-label">' + m.label + ' 已支出</p>' +
            '<p class="bh-value ' + (over ? 'out' : '') + '">' + S.money(spent) + '</p>' +
          '</div>' +
          '<button class="btn ghost sm" data-set-total>' +
            (budget > 0 ? '修改总额' : '设置总额') + '</button>' +
        '</div>' +
        (budget > 0
          ? view.rail(spent / budget * 100, over ? QH.ui.cssVar('--coral') : QH.ui.cssVar('--green'), 12) +
            '<div class="bh-foot">' +
              '<span>预算 ' + S.money(budget) + '</span>' +
              '<span class="' + (over ? 'out' : 'in') + '">' +
                (over ? '超支 ' + S.money(spent - budget)
                      : '剩余 ' + S.money(remaining) + ' · 日均可用 ' + S.money(Math.floor(remaining / daysLeft))) +
              '</span>' +
            '</div>'
          : '<p class="muted small">还没有预算。设置后首页会显示进度，并在超支时提醒你。</p>') +
      '</section>' +

      '<div class="grid-2">' +
        '<div class="card">' +
          '<div class="card-head"><h3>支出分类</h3>' +
            '<button class="link" data-add-cat="0">＋ 新增</button></div>' +
          '<div class="manage-list">' + catRows(expenseCats, true) + '</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-head"><h3>收入分类</h3>' +
            '<button class="link" data-add-cat="1">＋ 新增</button></div>' +
          '<div class="manage-list">' + catRows(incomeCats, false) + '</div>' +
        '</div>' +
      '</div>' +
      recurringCard() +
      '<p class="foot-note">点击分类右侧的笔，可重命名、设置分类预算或删除；已被使用的分类不能删除，以保护历史记录。</p>';

    root.querySelectorAll('[data-add-recurring]').forEach(function (btn) {
      btn.addEventListener('click', openRecurringForm);
    });
    root.querySelectorAll('[data-del-rule]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var rule = S.recurring().filter(function (r) { return r.id === btn.getAttribute('data-del-rule'); })[0];
        if (!rule) return;
        QH.ui.confirm({
          title: '删除固定项？',
          message: '「' + QH.ui.esc(rule.name) + '」以后不会再提醒。已经记到账本里的记录不受影响。',
          confirmText: '删除',
          danger: true
        }).then(function (ok) {
          if (!ok) return;
          S.removeRecurring(rule.id);
          QH.ui.toast('已删除');
          QH.render();
        });
      });
    });

    root.querySelector('[data-set-total]').addEventListener('click', function () {
      QH.ui.input({
        title: '月度总预算',
        label: '每月可支出的总额度（元），填 0 表示关闭预算提醒',
        prefix: '¥',
        type: 'text',
        inputmode: 'decimal',
        value: budget > 0 ? S.inputAmount(budget) : '',
        placeholder: '例如 6000',
        confirmText: '保存',
        validate: function (v) { S.parseCents(v); }
      }).then(function (value) {
        if (value == null) return;
        S.setMonthlyBudget(S.parseCents(value));
        QH.ui.toast(budget ? '预算已更新' : '预算已设置');
        QH.render();
      });
    });

    root.querySelectorAll('[data-add-cat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var type = parseInt(btn.getAttribute('data-add-cat'), 10);
        QH.ui.input({
          title: '新增' + (type === QH.EXPENSE ? '支出' : '收入') + '分类',
          label: '分类名称（最多 20 个字）',
          maxlength: 20,
          placeholder: '例如 宠物、订阅、稿费',
          confirmText: '创建',
          validate: function (v) {
            if (!v) throw new Error('名称不能为空');
            var dup = S.categories(type).some(function (c) { return c.name === v; });
            if (dup) throw new Error('该分类已存在');
          }
        }).then(function (value) {
          if (value == null) return;
          try {
            S.addCategory(value, type);
            QH.ui.toast('分类已创建');
            QH.render();
          } catch (e) { QH.ui.toast(e.message, 'warn'); }
        });
      });
    });

    root.querySelectorAll('[data-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = S.categoryById(btn.getAttribute('data-edit'));
        if (!cat) return;
        var isExpense = cat.type === QH.EXPENSE;
        var used = S.categoryUsage(cat.id);
        var items = isExpense
          ? [['rename', '重命名'], ['budget', '设置分类预算'], ['delete', '删除分类']]
          : [['rename', '重命名'], ['delete', '删除分类']];

        QH.ui.modal({
          title: cat.name,
          subtitle: (isExpense ? '支出分类' : '收入分类') + ' · 已有 ' + used + ' 笔记录',
          body: '<div class="menu-list">' + items.map(function (item) {
            return '<button class="menu-item' + (item[0] === 'delete' ? ' danger' : '') +
              '" data-act="' + item[0] + '">' + item[1] + '</button>';
          }).join('') + '</div>',
          onMount: function (m) {
            m.el.querySelectorAll('[data-act]').forEach(function (item) {
              item.addEventListener('click', function () {
                var act = item.getAttribute('data-act');
                m.close();
                setTimeout(function () { handleCategoryAction(cat, act); }, 120);
              });
            });
          }
        });
      });
    });

    function handleCategoryAction(cat, act) {
      if (act === 'rename') {
        QH.ui.input({
          title: '重命名分类',
          label: '新的分类名称',
          value: cat.name,
          maxlength: 20,
          confirmText: '保存',
          validate: function (v) {
            if (!v) throw new Error('名称不能为空');
            var dup = S.categories(cat.type).some(function (c) { return c.id !== cat.id && c.name === v; });
            if (dup) throw new Error('同类型下已有同名分类');
          }
        }).then(function (value) {
          if (value == null) return;
          try { S.renameCategory(cat.id, value); QH.ui.toast('已重命名'); QH.render(); }
          catch (e) { QH.ui.toast(e.message, 'warn'); }
        });
      } else if (act === 'budget') {
        QH.ui.input({
          title: '分类预算 · ' + cat.name,
          label: '每月该分类的额度（元），填 0 表示不单独限制',
          prefix: '¥',
          inputmode: 'decimal',
          value: cat.budget > 0 ? S.inputAmount(cat.budget) : '',
          placeholder: '例如 1500',
          confirmText: '保存',
          validate: function (v) { S.parseCents(v); }
        }).then(function (value) {
          if (value == null) return;
          S.setCategoryBudget(cat.id, S.parseCents(value));
          QH.ui.toast('分类预算已保存');
          QH.render();
        });
      } else if (act === 'delete') {
        if (S.categoryUsage(cat.id) > 0) {
          QH.ui.confirm({
            title: '无法删除',
            message: '「' + QH.ui.esc(cat.name) + '」已被 ' + S.categoryUsage(cat.id) +
              ' 笔记录使用。为保护历史数据，请先把这些记录改到其他分类。',
            confirmText: '知道了'
          });
          return;
        }
        QH.ui.confirm({
          title: '删除分类？',
          message: '「' + QH.ui.esc(cat.name) + '」尚未被使用，可以安全删除。',
          confirmText: '删除',
          danger: true
        }).then(function (ok) {
          if (!ok) return;
          S.deleteCategory(cat.id);
          QH.ui.toast('已删除');
          QH.render();
        });
      }
    }
  };

  /* ------------------------------------------------------------- 设置 */

  var AI_PROMPT = '请把下面的流水整理成 UTF-8 编码的 CSV，只输出 CSV，不要解释。\n' +
    '表头固定为：日期,类型,分类,金额,备注\n' +
    '日期用 yyyy-MM-dd；类型只填「支出」或「收入」；金额只填数字（最多两位小数）；备注可留空。';

  pages.settings = function (root) {
    var book = S.book();
    var user = S.user();
    var entries = S.allEntries();
    var theme = S.theme();

    /* 数据体检：体积按 JSON 长度估算，足够说明量级 */
    var rawSize = 0;
    try { rawSize = JSON.stringify(book).length; } catch (e) { rawSize = 0; }
    var storageSize = rawSize > 1024 * 1024
      ? (rawSize / 1024 / 1024).toFixed(1) + ' MB'
      : Math.max(1, Math.round(rawSize / 1024)) + ' KB';
    var lastBackup = book.prefs.lastBackup;
    var lastBackupText = '从未';
    if (lastBackup) {
      var days = Math.floor((Date.now() - lastBackup) / 86400000);
      lastBackupText = days <= 0 ? '今天'
        : days === 1 ? '昨天'
          : days < 30 ? days + ' 天前'
            : new Date(lastBackup).getMonth() + 1 + ' 月前';
    }

    root.innerHTML = '' +
      '<header class="page-head">' +
        '<div><h1>设置</h1>' +
        '<p class="sub">外观、数据备份与 AI 账单导入</p></div>' +
        '<div class="head-actions">' +
          '<button class="btn ghost" data-route="help">' + QH.icon('help', 17) + '使用说明</button>' +
        '</div>' +
      '</header>' +

      '<div class="card portable">' +
        '<div class="portable-row">' +
          '<div class="portable-main">' +
            '<div class="portable-title">' +
              '<span class="portable-ico">' + QH.icon('download', 15) + '</span>' +
              '<b>带走这个账本</b>' +
              '<span class="sec-note">单文件 HTML</span>' +
            '</div>' +
            '<p>把整个应用存成一个 .html 文件，双击就能用——不用联网，也不依赖这个网址以后还能不能打开。</p>' +
          '</div>' +
          '<a class="btn primary" href="assets/standalone.html" download="青禾记账.html">' +
            QH.icon('download', 17) + '下载单文件版</a>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head"><h3>外观</h3></div>' +
        '<div class="setting-row">' +
          '<div><b>主题</b><p>宣纸为默认，墨夜适合夜间查看。</p></div>' +
          '<div class="segmented">' +
            '<button class="' + (theme === 'paper' ? 'on' : '') + '" data-theme-set="paper">宣纸</button>' +
            '<button class="' + (theme === 'ink' ? 'on' : '') + '" data-theme-set="ink">墨夜</button>' +
          '</div>' +
        '</div>' +
        '<div class="setting-row">' +
          '<div><b>文字解释</b><p>关闭后列表只显示金额与分类，界面更安静。</p></div>' +
          '<button class="switch ' + (book.prefs.tips !== false ? 'on' : '') + '" data-tips aria-label="文字解释开关"><i></i></button>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head"><h3>AI 账单导入</h3>' +
          '<button class="link" data-template>下载模板</button></div>' +
        '<p class="muted small">让 AI 按模板输出 CSV，直接拖进来即可。分类不存在时会自动创建；任意一行格式错误则整批不导入。</p>' +
        '<div class="dropzone" data-drop tabindex="0" role="button">' +
          QH.icon('upload', 22) +
          '<b>把 CSV 拖到这里，或点击选择文件</b>' +
          '<span class="muted small">支持 UTF-8 / 带 BOM，表头：日期,类型,分类,金额,备注</span>' +
          '<input type="file" accept=".csv,text/csv" hidden data-file>' +
        '</div>' +
        '<button class="link paste-toggle" data-paste-toggle>或者直接粘贴 CSV 文本</button>' +
        '<div class="paste-area" hidden data-paste-area>' +
          '<textarea class="field textarea" rows="5" data-paste-text placeholder="日期,类型,分类,金额,备注&#10;2026-09-29,支出,餐饮,32.50,午餐"></textarea>' +
          '<button class="btn ghost sm" data-paste-parse>解析预览</button>' +
        '</div>' +
        '<div id="import-preview"></div>' +
        '<div class="prompt-box">' +
          '<div class="prompt-head"><b>给 AI 的提示词</b>' +
            '<button class="link" data-copy-prompt>复制</button></div>' +
          '<pre>' + QH.ui.esc(AI_PROMPT) + '</pre>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head"><h3>数据体检</h3>' +
          '<span class="sec-note">没有任何请求发出去</span></div>' +
        '<div class="health-grid">' +
          '<div class="health-cell"><span>收支记录</span><b>' + entries.length + ' 笔</b></div>' +
          '<div class="health-cell"><span>分类</span><b>' + book.categories.length + ' 个</b></div>' +
          '<div class="health-cell"><span>占用空间</span><b>' + storageSize + '</b></div>' +
          '<div class="health-cell"><span>上次备份</span><b>' + lastBackupText + '</b></div>' +
        '</div>' +
        '<p class="foot-note">这份账本就存在你这台设备的浏览器里。换设备、清理浏览器数据前请先导出备份。</p>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head"><h3>数据</h3>' +
          '<span class="sec-note">' + entries.length + ' 笔记录 · ' + book.categories.length + ' 个分类</span></div>' +
        '<div class="btn-grid">' +
          '<button class="btn ghost" data-export-csv>' + QH.icon('download', 17) + '导出全部 CSV</button>' +
          '<button class="btn ghost" data-export-json>' + QH.icon('download', 17) + '导出备份 JSON</button>' +
          '<button class="btn ghost" data-import-json>' + QH.icon('upload', 17) + '从备份恢复</button>' +
          '<button class="btn ghost danger-ghost" data-clear>' + QH.icon('trash', 17) + '清空所有记录</button>' +
        '</div>' +
        '<input type="file" accept=".json,application/json" hidden data-json-file>' +
        '<p class="foot-note">所有数据只保存在这台设备的浏览器里（localStorage）。换设备或清理浏览器数据前，请先导出备份。</p>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head"><h3>账户</h3></div>' +
        '<div class="account-row">' +
          '<span class="avatar">' + QH.ui.esc(user.name.slice(0, 1)) + '</span>' +
          '<div><b>' + QH.ui.esc(user.name) + '</b>' +
            '<p class="muted small">' + QH.ui.esc(user.email) + ' · 本地账户</p></div>' +
        '</div>' +
        '<button class="btn ghost block" data-logout>' + QH.icon('logout', 17) + '退出登录</button>' +
      '</div>' +

      '<p class="foot-note center">青禾记账 Web · 由 Android 版 1.1.1 移植 · 无需联网</p>';

    /* 主题 */
    root.querySelectorAll('[data-theme-set]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        S.setTheme(btn.getAttribute('data-theme-set'));
        QH.applyTheme();
        QH.render();
      });
    });

    /* 文字解释 */
    root.querySelector('[data-tips]').addEventListener('click', function () {
      book.prefs.tips = book.prefs.tips === false;
      QH.saveBookPrefs();
      QH.render();
    });

    /* CSV 模板 */
    root.querySelector('[data-template]').addEventListener('click', function () {
      var tpl = '日期,类型,分类,金额,备注\n' +
        S.isoDate(Date.now()) + ',支出,餐饮,32.50,午餐\n' +
        S.isoDate(Date.now()) + ',支出,交通,6.00,地铁\n' +
        S.isoDate(Date.now()) + ',收入,工资,8000.00,月薪\n';
      QH.ui.download('青禾导入模板.csv', tpl, 'text/csv');
    });

    /* 拖拽 / 选择文件 */
    var drop = root.querySelector('[data-drop]');
    var fileInput = root.querySelector('[data-file]');
    drop.addEventListener('click', function () { fileInput.click(); });
    drop.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
    });
    ['dragenter', 'dragover'].forEach(function (name) {
      drop.addEventListener(name, function (e) { e.preventDefault(); drop.classList.add('hot'); });
    });
    ['dragleave', 'drop'].forEach(function (name) {
      drop.addEventListener(name, function (e) { e.preventDefault(); drop.classList.remove('hot'); });
    });
    drop.addEventListener('drop', function (e) {
      var file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) readCsv(file);
    });
    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) readCsv(fileInput.files[0]);
      fileInput.value = '';
    });

    function readCsv(file) {
      var reader = new FileReader();
      reader.onload = function () {
        previewImport(String(reader.result), file.name);
      };
      reader.onerror = function () { QH.ui.toast('读取文件失败', 'warn'); };
      reader.readAsText(file, 'UTF-8');
    }

    /* 粘贴文本 */
    var pasteToggle = root.querySelector('[data-paste-toggle]');
    var pasteArea = root.querySelector('[data-paste-area]');
    pasteToggle.addEventListener('click', function () {
      pasteArea.hidden = !pasteArea.hidden;
      if (!pasteArea.hidden) pasteArea.querySelector('textarea').focus();
    });
    root.querySelector('[data-paste-parse]').addEventListener('click', function () {
      var text = root.querySelector('[data-paste-text]').value;
      if (!text.trim()) { QH.ui.toast('先粘贴 CSV 内容'); return; }
      previewImport(text, '粘贴内容');
    });

    function previewImport(text, source) {
      var box = document.getElementById('import-preview');
      var parsed;
      try {
        parsed = S.parseImport(text);
      } catch (e) {
        box.innerHTML = '<div class="alert error">' + QH.icon('close', 16) +
          '<span>' + QH.ui.esc(e.message) + '</span></div>';
        return;
      }
      var income = 0, expense = 0;
      var minT = Infinity, maxT = -Infinity;
      var fresh = parsed.items.filter(function (i) { return !i.dup; });
      parsed.items.forEach(function (item) {
        if (item.type === QH.INCOME) income += item.cents; else expense += item.cents;
        minT = Math.min(minT, item.time);
        maxT = Math.max(maxT, item.time);
      });
      box.innerHTML = '' +
        '<div class="alert ok">' +
          QH.icon('check', 16) +
          '<span><b>' + fresh.length + ' 笔</b>可导入 · 来源：' + QH.ui.esc(source) + '</span>' +
        '</div>' +
        (parsed.duplicates
          ? '<div class="alert warn">' + QH.icon('shield', 16) +
            '<span>其中 <b>' + parsed.duplicates + ' 笔</b>与已有记录重复（日期、金额、分类、备注都一样），导入时会跳过。</span></div>'
          : '') +
        '<div class="preview-grid">' +
          '<div><span>支出合计</span><b class="out">' + S.money(expense) + '</b></div>' +
          '<div><span>收入合计</span><b class="in">' + S.money(income) + '</b></div>' +
          '<div><span>日期范围</span><b class="small">' + S.isoDate(minT) + ' ~ ' + S.isoDate(maxT) + '</b></div>' +
          '<div><span>将新建分类</span><b>' + parsed.newCategories.length + ' 个</b></div>' +
        '</div>' +
        (parsed.newCategories.length
          ? '<p class="muted small">新建：' + parsed.newCategories.map(function (c) {
              return QH.ui.esc(c.name) + (c.type === QH.INCOME ? '（收入）' : '（支出）');
            }).join('、') + '</p>'
          : '') +
        '<div class="preview-actions">' +
          '<button class="btn ghost sm" data-cancel-import>取消</button>' +
          '<button class="btn primary sm" data-do-import>确认导入</button>' +
        '</div>';

      box.querySelector('[data-cancel-import]').addEventListener('click', function () { box.innerHTML = ''; });
      box.querySelector('[data-do-import]').addEventListener('click', function () {
        var res = S.importRows(parsed);
        QH.ui.toast('已导入 ' + res.count + ' 笔' +
          (res.skipped ? '，跳过 ' + res.skipped + ' 笔重复' : '') +
          (res.created ? '，新建 ' + res.created + ' 个分类' : ''));
        QH.go('home');
      });
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /* 复制提示词 */
    root.querySelector('[data-copy-prompt]').addEventListener('click', function () {
      QH.ui.copy(AI_PROMPT).then(function (ok) {
        QH.ui.toast(ok ? '提示词已复制' : '复制失败，请手动选择', ok ? '' : 'warn');
      });
    });

    /* 导出 */
    root.querySelector('[data-export-csv]').addEventListener('click', function () {
      if (!entries.length) { QH.ui.toast('还没有记录'); return; }
      QH.ui.download('青禾全部记录-' + S.isoDate(Date.now()) + '.csv', S.entriesToCsv(entries), 'text/csv');
      QH.ui.toast('已导出 ' + entries.length + ' 笔');
    });

    root.querySelector('[data-export-json]').addEventListener('click', function () {
      QH.ui.download('青禾备份-' + S.isoDate(Date.now()) + '.json',
        JSON.stringify(S.exportBackup(), null, 2), 'application/json');
      book.prefs.lastBackup = Date.now();
      S.touch();
      QH.ui.toast('备份已导出');
      QH.render();
    });

    var jsonFile = root.querySelector('[data-json-file]');
    root.querySelector('[data-import-json]').addEventListener('click', function () { jsonFile.click(); });
    jsonFile.addEventListener('change', function () {
      var file = jsonFile.files && jsonFile.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var backup;
        try { backup = JSON.parse(String(reader.result)); }
        catch (e) { QH.ui.toast('备份文件不是合法 JSON', 'warn'); return; }
        QH.ui.confirm({
          title: '从备份恢复？',
          message: '当前账本的分类与记录会被备份内容<b>整体替换</b>，建议先导出当前备份。',
          confirmText: '恢复',
          danger: true
        }).then(function (ok) {
          if (!ok) return;
          try {
            var res = S.restoreBackup(backup);
            QH.ui.toast('已恢复 ' + res.entries + ' 笔记录');
            QH.render();
          } catch (e) { QH.ui.toast(e.message, 'warn'); }
        });
      };
      reader.readAsText(file, 'UTF-8');
      jsonFile.value = '';
    });

    root.querySelector('[data-clear]').addEventListener('click', function () {
      if (!entries.length) { QH.ui.toast('账本已经是空的'); return; }
      QH.ui.confirm({
        title: '清空所有记录？',
        message: '将删除 <b>' + entries.length + '</b> 笔收支记录，分类与预算设置保留。此操作不可撤销。',
        confirmText: '全部清空',
        danger: true
      }).then(function (ok) {
        if (!ok) return;
        S.clearEntries();
        QH.ui.toast('已清空');
        QH.render();
      });
    });

    root.querySelector('[data-logout]').addEventListener('click', function () {
      QH.ui.confirm({
        title: '退出登录？',
        message: '数据会留在本机，下次用邮箱登录即可继续。',
        confirmText: '退出'
      }).then(function (ok) {
        if (!ok) return;
        S.logout();
        QH.state.authMode = 'login';
        QH.render();
      });
    });
  };

  /* --------------------------------------------------------- 使用说明 */

  pages.help = function (root) {
    var faq = [
      ['会不会把我的账本上传？',
        '不会。这个页面没有后端，代码里没有任何 fetch / XHR 请求，账本存在你自己浏览器的 localStorage 里。' +
        '你可以断网、开飞行模式试：除了页面本身的静态文件，它不需要网络。'],
      ['换手机 / 换电脑怎么办？',
        '设置页「导出备份 JSON」，把文件带到新设备，打开同一个链接，用「从备份恢复」导入即可（备份里不含密码）。' +
        '建议每周导一次，这也是唯一需要你手动做的事。'],
      ['忘记密码了能找回吗？',
        '不能。本地账户没有邮箱服务器可发验证码，密码只以 PBKDF2 派生值存在你设备上。' +
        '所以：注册后第一件事就是导出一份备份。'],
      ['分类为什么删不掉？',
        '被记录用过的分类不能删除，否则历史账目会指向空分类。想清理就先把这些记录改到别的分类。'],
      ['预算超了会怎样？',
        '不会阻止你记账。记账时会提示剩余额度，超支后首页预算条变红并显示超了多少，' +
        '统计页也能看到哪一类花超了。'],
      ['柱状图上的 ▲ 是什么意思？',
        '房租这类单日大额会把纵轴撑满，其余日子就看不见了。所以柱高以 90 分位为上限，' +
        '超出的柱子标 ▲，鼠标悬停仍能看到真实金额。']
    ];

    root.innerHTML = '' +
      '<header class="page-head">' +
        '<div><h1>使用说明</h1>' +
        '<p class="sub">三分钟看完；也可以直接点右上角开始记</p></div>' +
        '<div class="head-actions">' +
          '<button class="btn primary" data-add>＋ 记一笔</button>' +
        '</div>' +
      '</header>' +

      '<section class="card help-hero">' +
        '<p class="help-claim">这是一个只存在你设备里的账本。</p>' +
        '<p class="help-lede">没有服务器、没有账号体系、没有任何请求发出去。' +
          '你可以断网用、飞行模式用，也可以在浏览器菜单里「添加到主屏幕」，把它当成一个 App。</p>' +
        '<div class="help-facts">' +
          '<span><b>' + S.allEntries().length + '</b> 笔记录</span>' +
          '<span><b>0</b> 次网络请求</span>' +
          '<span><b>PBKDF2</b> 12 万次派生</span>' +
        '</div>' +
      '</section>' +

      '<div class="sec"><h2><span class="mark">①</span>三步上手</h2></div>' +
      '<div class="card">' +
        '<ol class="steps">' +
          '<li>' +
            '<b>说一句话就记好了</b>' +
            '<p>在首页输入「昨天火锅 128，打车 32」，它会拆成两笔、自动分好类和日期；' +
              '确认前可以逐条改。也可以点右上角「记一笔」手动填。</p>' +
          '</li>' +
          '<li>' +
            '<b>设一个预算</b>' +
            '<p>预算页填月度总额，还能给餐饮、购物单独设额度；房租、工资这类每月固定的，' +
              '设一次就会到日子提醒你一键记上。</p>' +
          '</li>' +
          '<li>' +
            '<b>月底看统计</b>' +
            '<p>统计页有分类占比、每日走势、近 6 个月趋势，可按任意时间段导出 CSV；' +
              '也能一键生成月度账单海报，存下来直接发朋友圈。</p>' +
          '</li>' +
        '</ol>' +
      '</div>' +

      '<div class="sec"><h2><span class="mark">②</span>一句话记账怎么写</h2></div>' +
      '<div class="card">' +
        '<p class="help-p">不用记格式，像跟朋友说话一样写就行：</p>' +
        '<div class="code-block">昨天和室友吃火锅 128，打车 32，收到稿费 300' +
          '<span class="code-note">→ 餐饮 ¥128 / 交通 ¥32 / 兼职 +¥300，日期都是昨天</span></div>' +
        '<div class="help-grid">' +
          '<div><span>金额</span><p>128、128.5、88块5、1.2万、3k、一百二十八、两千三、十五块</p></div>' +
          '<div><span>日期</span><p>今天、昨晚、前天、周三、上周三、10月20号、20号、2026-09-15</p></div>' +
          '<div><span>类型</span><p>出现「收到 / 到账 / 报销」记为收入，其余默认支出</p></div>' +
          '<div><span>分类</span><p>认火锅、打车、房租、奶茶、稿费、红包等 130 多个词；' +
            '你自己建的分类名也会被认出来</p></div>' +
        '</div>' +
        '<p class="foot-note">解析全部在本地完成，所以断网也能用；也因为它只看规则，' +
          '遇到没见过的词会落到「其他」，这时在预览里改一下分类就行。</p>' +
      '</div>' +

      '<div class="sec"><h2><span class="mark">③</span>数据在哪</h2></div>' +
      '<div class="card">' +
        '<div class="help-grid four">' +
          '<div><span>存放位置</span><p>这台设备的浏览器（localStorage）</p></div>' +
          '<div><span>密码</span><p>PBKDF2-HMAC-SHA256，12 万次迭代，只存派生值</p></div>' +
          '<div><span>导出</span><p>CSV 给表格看，JSON 用于完整备份</p></div>' +
          '<div><span>注意</span><p>清理浏览器数据会连账本一起清掉</p></div>' +
        '</div>' +
        '<p class="help-p portable-hint">想把账本带走，可以在设置页下载<b>单文件版</b>——' +
          '整个应用就是一个 .html 文件，双击打开就能用，不依赖这个网址。' +
          '<a href="assets/standalone.html" download="青禾记账.html">现在就下载 →</a></p>' +
      '</div>' +

      '<div class="sec"><h2><span class="mark">④</span>不信？断网试试</h2></div>' +
      '<div class="card">' +
        '<p class="help-p">「不联网」这句话很容易说，验证只要 30 秒：</p>' +
        '<ol class="steps">' +
          '<li><b>记一笔</b><p>随便写一句「奶茶 15」，确认入账。</p></li>' +
          '<li><b>断网</b><p>手机打开飞行模式，电脑关掉 Wi-Fi 或拔网线。</p></li>' +
          '<li><b>刷新这个页面</b><p>它由浏览器缓存（Service Worker）提供，照样打开。</p></li>' +
          '<li><b>记录还在</b><p>账本存在本机，网络状态改变不了任何东西。</p></li>' +
        '</ol>' +
        '<div class="help-actions">' +
          '<button class="btn ghost sm" data-reload>重新加载页面</button>' +
          '<span class="muted small">也可以在浏览器菜单里「添加到主屏幕」，当成 App 用。</span>' +
        '</div>' +
      '</div>' +

      '<div class="sec"><h2><span class="mark">⑤</span>快捷键</h2></div>' +
      '<div class="card">' +
        '<div class="kbd-grid">' +
          '<div><kbd>N</kbd><span>记一笔</span></div>' +
          '<div><kbd>Enter</kbd><span>在记账表单里保存</span></div>' +
          '<div><kbd>Esc</kbd><span>关闭弹窗</span></div>' +
          '<div><kbd>Tab</kbd><span>在表单元素间切换</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="sec"><h2><span class="mark">⑥</span>AI 账单导入</h2></div>' +
      '<div class="card">' +
        '<p class="help-p">设置页可以导入 CSV，也可以把下面这段话连同一段流水丢给 AI，让它按格式输出：</p>' +
        '<div class="code-block">日期,类型,分类,金额,备注<br>' +
          '2026-09-29,支出,餐饮,32.50,午餐<br>' +
          '2026-09-29,收入,工资,8000.00,9月工资</div>' +
        '<p class="foot-note">导入是「整批校验」的：任意一行格式不对，这次就一笔都不写，不会留下半截数据。</p>' +
      '</div>' +

      '<div class="sec"><h2><span class="mark">⑦</span>常见问题</h2></div>' +
      '<div class="card faq">' +
        faq.map(function (item) {
          return '<details><summary>' + QH.ui.esc(item[0]) + '</summary>' +
            '<p>' + QH.ui.esc(item[1]) + '</p></details>';
        }).join('') +
      '</div>' +

      '<p class="foot-note center">青禾记账 Web · v2 · 基于 Android 版「青禾记账 1.1.1」的功能设计重写，' +
        '并新增一句话记账、离线中文解析与响应式布局。全部代码无第三方依赖。</p>';

    root.querySelectorAll('[data-reload]').forEach(function (btn) {
      btn.addEventListener('click', function () { location.reload(); });
    });
  };

  /* --------------------------------------------------------- 登录注册 */

  function runDemo() {
    var demoEmail = 'demo@example.invalid';
    var demoPass = 'qinghe2026';
    var go = function () {
      QH.state.month = 0;
      QH.state.route = 'home';
      QH.render();
      QH.ui.toast('已进入示例账本，随便点');
    };
    return S.login(demoEmail, demoPass)
      .then(go)
      .catch(function () {
        return S.register('青禾示例', demoEmail, demoPass).then(function () {
          S.seedDemo();
          go();
        });
      })
      .catch(function (e) { QH.ui.toast(e.message, 'warn'); });
  }

  function authIntro(root) {
    root.innerHTML = '' +
      '<div class="auth">' +
        '<div class="auth-card intro">' +
          '<div class="auth-brand">' +
            '<span class="seal">禾</span>' +
            '<div>' +
              '<h1>青禾记账</h1>' +
              '<p class="auth-sub">不联网的 AI 账本</p>' +
            '</div>' +
          '</div>' +
          '<p class="auth-claim">你的账本<br>不出这台设备</p>' +
          '<ul class="auth-facts">' +
            '<li><i>' + QH.icon('check', 13) + '</i><span>说一句话就记好账，中文解析在本地跑</span></li>' +
            '<li><i>' + QH.icon('check', 13) + '</i><span>断网可用，飞行模式照记不误</span></li>' +
            '<li><i>' + QH.icon('check', 13) + '</i><span>数据留在浏览器，随时导出 CSV / JSON</span></li>' +
          '</ul>' +
          '<button class="btn primary block lg" data-demo>直接看示例账本 →</button>' +
          '<button class="btn ghost block" data-mode="login">注册 / 登录我自己的账本</button>' +
          '<div class="auth-trust">' +
            '<span>' + QH.icon('shield', 13) + ' 无服务器 · 无接口请求</span>' +
            '<span>' + QH.icon('check', 13) + ' 密码 PBKDF2 派生</span>' +
          '</div>' +
        '</div>' +
        '<p class="auth-foot">账本内容保存在本机浏览器 localStorage，更换设备或清理浏览器数据前请先导出备份。</p>' +
      '</div>';

    root.querySelectorAll('[data-demo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.disabled = true;
        btn.textContent = '正在准备示例…';
        runDemo().then(function () {
          if (!S.user()) { btn.disabled = false; btn.textContent = '直接看示例账本 →'; }
        });
      });
    });
    root.querySelectorAll('[data-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        QH.state.authMode = btn.getAttribute('data-mode');
        QH.render();
      });
    });
  }

  pages.auth = function (root) {
    var mode = QH.state.authMode || 'intro';
    if (mode === 'intro') { authIntro(root); return; }

    var isRegister = mode === 'register';

    root.innerHTML = '' +
      '<div class="auth">' +
        '<div class="auth-card">' +
          '<div class="auth-brand">' +
            '<span class="seal">禾</span>' +
            '<div>' +
              '<h1>青禾记账</h1>' +
              '<p class="auth-sub">本地账本 · 数据只存这台设备</p>' +
            '</div>' +
          '</div>' +
          '<div class="auth-tabs">' +
            '<button class="' + (!isRegister ? 'on' : '') + '" data-mode="login">登录</button>' +
            '<button class="' + (isRegister ? 'on' : '') + '" data-mode="register">注册</button>' +
          '</div>' +
          '<form class="auth-form" data-form>' +
            (isRegister
              ? '<label class="field-block"><span>昵称</span>' +
                '<input class="field" data-name placeholder="怎么称呼你" maxlength="24" autocomplete="nickname"></label>'
              : '') +
            '<label class="field-block"><span>邮箱</span>' +
              '<input class="field" data-email type="email" placeholder="demo@example.invalid" autocomplete="email" ' +
              'value="' + QH.ui.esc(QH.state.lastEmail || '') + '"></label>' +
            '<label class="field-block"><span>密码</span>' +
              '<input class="field" data-pass type="password" placeholder="至少 8 位" ' +
              'autocomplete="' + (isRegister ? 'new-password' : 'current-password') + '"></label>' +
            '<p class="field-error" data-error hidden></p>' +
            '<button class="btn primary block" type="submit" data-submit>' +
              (isRegister ? '创建本地账户' : '登录') + '</button>' +
          '</form>' +
          '<div class="auth-alt">' +
            '<button class="link" data-mode="intro">← 返回</button>' +
            '<button class="link" data-demo>先看示例账本</button>' +
          '</div>' +
          (S.hasUsers() ? '' : '<p class="auth-note">首次使用？注册一个账户，初始会自带 12 个常用分类。</p>') +
        '</div>' +
        '<p class="auth-foot">' + QH.icon('shield', 14) + '密码经 PBKDF2 派生后存储，账本内容仅保存在浏览器 localStorage。</p>' +
      '</div>';

    root.querySelectorAll('[data-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        QH.state.authMode = btn.getAttribute('data-mode');
        QH.render();
      });
    });

    var form = root.querySelector('[data-form]');
    var error = root.querySelector('[data-error]');
    var submit = root.querySelector('[data-submit]');

    function fail(message) {
      error.textContent = message;
      error.hidden = false;
      submit.disabled = false;
      submit.textContent = isRegister ? '创建本地账户' : '登录';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var email = form.querySelector('[data-email]').value.trim();
      var pass = form.querySelector('[data-pass]').value;
      var nameInput = form.querySelector('[data-name]');
      var name = nameInput ? nameInput.value.trim() : '';
      error.hidden = true;
      if (!email) { fail('请填写邮箱'); return; }
      if (pass.length < 8) { fail('密码至少 8 位'); return; }
      submit.disabled = true;
      submit.textContent = isRegister ? '创建中…' : '登录中…';
      QH.state.lastEmail = email;
      var action = isRegister ? S.register(name, email, pass) : S.login(email, pass);
      action.then(function () {
        QH.state.month = 0;
        QH.state.route = 'home';
        QH.render();
      }).catch(function (e) { fail(e.message || '操作失败，请重试'); });
    });

    root.querySelector('[data-demo]').addEventListener('click', runDemo);
  };
})(typeof window !== 'undefined' ? window : globalThis);
