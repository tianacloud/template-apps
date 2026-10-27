/* 应用外壳：路由、底部/侧边导航、记账表单、主题与快捷键 */
(function (global) {
  'use strict';
  var QH = (global.QH = global.QH || {});
  var S = QH.store;

  QH.state = {
    route: 'home',
    month: 0,
    detail: { q: '', type: 'all', cat: 'all', from: '', to: '', limit: 80 },
    stats: { range: 'month', series: 'expense', from: '', to: '' },
    authMode: 'intro',
    lastEmail: ''
  };

  var NAV = [
    { key: 'home', label: '首页', icon: 'home' },
    { key: 'detail', label: '明细', icon: 'list' },
    { key: 'stats', label: '统计', icon: 'chart' },
    { key: 'budget', label: '预算', icon: 'pie' },
    { key: 'settings', label: '设置', icon: 'settings' }
  ];

  QH.applyTheme = function () {
    document.documentElement.setAttribute('data-theme', S.theme());
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', S.theme() === 'ink' ? '#0E1614' : '#F8F6F0');
  };

  QH.go = function (route) {
    if (['home', 'detail', 'stats', 'budget', 'settings', 'help'].indexOf(route) < 0) route = 'home';
    QH.state.route = route;
    QH.render();
    var main = document.querySelector('.main');
    if (main) main.scrollTo({ top: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  QH.saveBookPrefs = function () { S.touch(); };

  function shell(activeKey) {
    var user = S.user();
    var items = NAV.map(function (item) {
      return '<button class="nav-item' + (item.key === activeKey ? ' on' : '') + '" data-route="' + item.key + '" type="button">' +
        QH.icon(item.icon, 19) + '<span>' + item.label + '</span></button>';
    }).join('');

    return '' +
      '<div class="shell">' +
        '<aside class="side">' +
          '<div class="brand">' +
            '<span class="seal">禾</span>' +
            '<div class="brand-text"><b>青禾记账</b><small>本地账本</small></div>' +
          '</div>' +
          '<nav class="side-nav">' + items + '</nav>' +
          '<button class="btn primary side-add" data-add type="button">＋ 记一笔</button>' +
          '<div class="side-foot">' +
            '<button class="side-link" data-route="help" type="button">' +
              QH.icon('help', 15) + '使用说明</button>' +
            '<span class="live"><i></i>数据只在本机</span>' +
            '<span class="who">' + QH.ui.esc(user.name) + '</span>' +
          '</div>' +
        '</aside>' +
        '<main class="main">' +
          '<header class="mobile-bar">' +
            '<div class="brand-mini"><span class="seal sm">禾</span><b>青禾记账</b></div>' +
            '<div class="bar-actions">' +
              '<button class="icon-btn" data-route="help" aria-label="使用说明">' + QH.icon('help', 19) + '</button>' +
              '<button class="icon-btn" data-route="settings" aria-label="设置">' + QH.icon('settings', 19) + '</button>' +
            '</div>' +
          '</header>' +
          '<div class="page" id="page"></div>' +
        '</main>' +
      '</div>' +      '<nav class="tabbar">' + items + '</nav>' +
      '<button class="fab" data-add type="button" aria-label="记一笔">' + QH.icon('plus', 24) + '</button>';
  }

  QH.render = function () {
    var app = document.getElementById('app');
    var user = S.user();
    QH.applyTheme();

    if (!user) {
      app.className = 'app auth-shell';
      app.innerHTML = '<main class="auth-main"></main>';
      QH.pages.auth(app.querySelector('.auth-main'));
      return;
    }

    var route = QH.state.route;
    /* 首页已有页头按钮与一句话输入，移动端不再叠一个悬浮按钮 */
    app.className = 'app' + (route === 'home' ? ' no-fab' : '');
    app.innerHTML = shell(route);
    var page = app.querySelector('#page');
    var fn = QH.pages[route] || QH.pages.home;
    fn(page);

    if (!S.canStore()) {
      page.insertAdjacentHTML('afterbegin',
        '<div class="banner-warn">' + QH.icon('shield', 16) +
        '<span><b>这个浏览器不允许本地存储</b>（可能开了无痕模式或严格的隐私设置）。' +
        '这次的记录关掉页面就会消失，建议换普通窗口打开，或随时到设置页导出备份。</span></div>');
    }
    /* 侧栏/底栏高亮由 shell 决定，无需再绑定路由（见全局委托） */
  };

  /* --------------------------------------------------------- 记账表单 */

  QH.openEntry = function (entryId, presetType) {
    var editing = entryId ? S.entryById(entryId) : null;
    if (entryId && !editing) { QH.ui.toast('这笔记录已不存在', 'warn'); return; }

    var type = editing ? editing.type : (presetType === QH.INCOME ? QH.INCOME : QH.EXPENSE);
    var firstCat = S.categories(type)[0];
    var selected = editing ? editing.categoryId : (firstCat ? firstCat.id : null);
    var dateValue = editing ? S.isoDate(editing.time) : S.isoDate(Date.now());
    var amountValue = editing ? S.inputAmount(editing.cents) : '';
    var noteValue = editing ? (editing.note || '') : '';

    var modal = QH.ui.modal({
      title: editing ? '编辑记录' : '记一笔',
      subtitle: editing ? '修改后立即生效' : '金额、分类、日期，三步记完',
      body:
        '<div class="segmented type-seg" data-type-seg>' +
          '<button type="button" data-type="0" class="' + (type === QH.EXPENSE ? 'on' : '') + '">支出</button>' +
          '<button type="button" data-type="1" class="' + (type === QH.INCOME ? 'on' : '') + '">收入</button>' +
        '</div>' +
        '<div class="amount-box">' +
          '<span class="currency">¥</span>' +
          '<input class="amount-input" data-amount inputmode="decimal" autocomplete="off" ' +
            'placeholder="0.00" value="' + QH.ui.esc(amountValue) + '" autofocus>' +
        '</div>' +
        '<div class="field-block"><span class="field-label">分类</span>' +
          '<div class="cat-chips" data-cats></div>' +
        '</div>' +
        '<div class="form-grid">' +
          '<label class="field-block"><span class="field-label">日期</span>' +
            '<input class="field" type="date" data-date value="' + dateValue + '"></label>' +
          '<label class="field-block"><span class="field-label">备注</span>' +
            '<input class="field" type="text" data-note maxlength="120" placeholder="可留空" ' +
            'value="' + QH.ui.esc(noteValue) + '"></label>' +
        '</div>' +
        '<p class="budget-hint" data-hint></p>' +
        '<p class="field-error" data-error hidden></p>',
      footer:
        (editing ? '<button class="btn ghost danger-ghost" data-delete>删除</button>' : '<span></span>') +
        '<div class="foot-right">' +
          '<button class="btn ghost" data-cancel>取消</button>' +
          '<button class="btn primary" data-save>' + (editing ? '保存修改' : '保存') + '</button>' +
        '</div>',
      onMount: function (m) {
        var amount = m.el.querySelector('[data-amount]');
        var note = m.el.querySelector('[data-note]');
        var dateInput = m.el.querySelector('[data-date]');
        var error = m.el.querySelector('[data-error]');
        var hint = m.el.querySelector('[data-hint]');
        var chipsBox = m.el.querySelector('[data-cats]');

        function renderChips() {
          var cats = S.categories(type);
          if (!cats.some(function (c) { return c.id === selected; })) {
            selected = cats[0] ? cats[0].id : null;
          }
          chipsBox.innerHTML = cats.map(function (c) {
            return '<button type="button" class="cat-chip' + (c.id === selected ? ' on' : '') +
              '" data-cat="' + c.id + '">' +
              '<span class="ico" style="color:' + c.color + ';background:' + QH.tint(c.color) + '">' +
                QH.categoryIcon(c.name, c.type, 15) + '</span>' +
              QH.ui.esc(c.name) + '</button>';
          }).join('') +
            '<button type="button" class="cat-chip new" data-newcat>＋ 新分类</button>';

          chipsBox.querySelectorAll('[data-cat]').forEach(function (chip) {
            chip.addEventListener('click', function () {
              selected = chip.getAttribute('data-cat');
              renderChips();
              updateHint();
            });
          });
          chipsBox.querySelector('[data-newcat]').addEventListener('click', function () {
            QH.ui.input({
              title: '新增分类',
              label: '分类名称（最多 20 个字）',
              maxlength: 20,
              placeholder: '例如 宠物、订阅',
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
                var created = S.categories(type).filter(function (c) { return c.name === value; })[0];
                if (created) selected = created.id;
                renderChips();
                updateHint();
              } catch (e) { QH.ui.toast(e.message, 'warn'); }
            });
          });
        }

        function updateHint() {
          if (type !== QH.EXPENSE) { hint.textContent = ''; hint.className = 'budget-hint'; return; }
          var budget = S.monthlyBudget();
          if (budget <= 0) { hint.textContent = ''; hint.className = 'budget-hint'; return; }
          var m0 = S.monthRange(0);
          var spent = S.sumOf(S.entriesIn(m0.from, m0.until).filter(function (e) {
            return e.type === QH.EXPENSE;
          }));
          var cents = 0;
          try { cents = S.parseCents(amount.value); } catch (e) { cents = 0; }
          var after = spent + cents;
          var over = after > budget;
          hint.className = 'budget-hint' + (over ? ' over' : '');
          hint.textContent = over
            ? '这笔之后本月支出 ' + S.money(after) + '，超出预算 ' + S.money(after - budget)
            : '本月预算剩余 ' + S.money(budget - spent) + '，记完这笔还剩 ' + S.money(Math.max(0, budget - after));
        }

        m.el.querySelectorAll('[data-type-seg] [data-type]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var next = parseInt(btn.getAttribute('data-type'), 10);
            if (next === type) return;
            type = next;
            selected = null;
            m.el.querySelectorAll('[data-type-seg] [data-type]').forEach(function (b) {
              b.classList.toggle('on', b === btn);
            });
            renderChips();
            updateHint();
          });
        });

        amount.addEventListener('input', updateHint);
        renderChips();
        updateHint();

        var busy = false;
        function save() {
          if (busy) return;
          error.hidden = true;
          var cents;
          try { cents = S.parseCents(amount.value); }
          catch (e) {
            error.textContent = e.message;
            error.hidden = false;
            amount.focus();
            return;
          }
          if (!selected) {
            error.textContent = '请选择分类';
            error.hidden = false;
            return;
          }
          var time;
          try { time = S.parseISO(dateInput.value); }
          catch (e) {
            error.textContent = '请选择有效日期';
            error.hidden = false;
            return;
          }
          var result;
          try {
            result = S.saveEntry({
              id: editing ? editing.id : null,
              type: type,
              categoryId: selected,
              cents: cents,
              time: time,
              note: note.value.trim()
            });
          } catch (e) {
            error.textContent = e.message;
            error.hidden = false;
            return;
          }
          busy = true;
          m.close();
          QH.render();
          if (result.crossed) {
            QH.ui.toast('已保存 · 本月预算已超支 ' + S.money(Math.max(0,
              S.sumOf(S.entriesIn(S.monthRange(0).from, S.monthRange(0).until)
                .filter(function (e) { return e.type === QH.EXPENSE; })) - S.monthlyBudget())), 'warn');
          } else if (result.catCrossed) {
            QH.ui.toast('已保存 · 该分类超出预算', 'warn');
          } else {
            QH.ui.toast(editing ? '已更新' : '已记一笔');
          }
        }

        m.el.querySelector('[data-save]').addEventListener('click', save);
        m.el.querySelector('[data-cancel]').addEventListener('click', function () { m.close(); });
        amount.addEventListener('keydown', function (event) {
          if (event.key === 'Enter') { event.preventDefault(); save(); }
        });
        note.addEventListener('keydown', function (event) {
          if (event.key === 'Enter') { event.preventDefault(); save(); }
        });
        var del = m.el.querySelector('[data-delete]');
        if (del) {
          del.addEventListener('click', function () {
            m.close();
            QH.ui.confirm({
              title: '删除这笔记录？',
              message: '「' + S.money(editing.cents) + '」将被移除，此操作不可撤销。',
              confirmText: '删除',
              danger: true
            }).then(function (ok) {
              if (!ok) return;
              S.deleteEntry(editing.id);
              QH.ui.toast('已删除');
              QH.render();
            });
          });
        }

        setTimeout(function () { amount.focus(); amount.select(); }, 60);
      }
    });
    return modal;
  };

  /* --------------------------------------------------- 一句话记账 */

  QH.openNL = function (text) {
    var parsed = QH.nl.parse(text, { today: Date.now(), categories: S.categories() });
    if (!parsed.items.length) {
      QH.ui.toast('没听出金额，试试「昨天火锅 128，打车 32」', 'warn');
      return;
    }

    var allCats = S.categories();
    var rows = parsed.items.map(function (item) {
      var hit = allCats.filter(function (c) {
        return c.type === item.type && c.name === item.categoryName;
      })[0];
      var people = item.people || 0;
      var split = people >= 2;
      return {
        type: item.type,
        totalCents: item.cents,
        people: people,
        split: split,
        amountText: ((split ? item.perPersonCents : item.cents) / 100).toFixed(2),
        dateValue: S.isoDate(item.time),
        note: item.note || '',
        catValue: hit ? hit.id : 'new:' + item.categoryName,
        catName: item.categoryName,
        checked: true,
        warnings: item.warnings || []
      };
    });

    function catOptions(row) {
      var groups = [[QH.EXPENSE, '支出'], [QH.INCOME, '收入']].map(function (pair) {
        var list = allCats.filter(function (c) { return c.type === pair[0]; });
        var opts = list.map(function (c) {
          return '<option value="' + c.id + '"' + (row.catValue === c.id ? ' selected' : '') + '>' +
            QH.ui.esc(c.name) + '</option>';
        }).join('');
        if (row.catValue.indexOf('new:') === 0 && pair[0] === row.type) {
          opts = '<option value="' + row.catValue + '" selected>' +
            QH.ui.esc(row.catValue.slice(4)) + '（新建）</option>' + opts;
        }
        return '<optgroup label="' + pair[1] + '">' + opts + '</optgroup>';
      });
      return groups.join('');
    }

    var modal = QH.ui.modal({
      title: '一句话记账',
      subtitle: '完全离线解析 · 确认后才会入账',
      wide: true,
      body:
        '<div class="nl-echo"><span>你说</span><p>' + QH.ui.esc(text) + '</p></div>' +
        '<div class="nl-summary" data-summary></div>' +
        (parsed.skipped.length
          ? '<p class="nl-skipped">' + parsed.skipped.length + ' 句没识别出金额，已跳过</p>'
          : '') +
        '<div class="nl-list" data-list></div>' +
        '<p class="field-error" data-error hidden></p>',
      footer:
        '<button class="btn ghost" data-cancel>取消</button>' +
        '<div class="foot-right">' +
          '<button class="btn primary" data-confirm>记这几笔</button>' +
        '</div>',
      onMount: function (m) {
        var list = m.el.querySelector('[data-list]');
        var summary = m.el.querySelector('[data-summary]');
        var error = m.el.querySelector('[data-error]');

        function paint() {
          list.innerHTML = rows.map(function (row, i) {
            var cat = S.categoryById(row.catValue);
            var color = cat ? cat.color : S.toneOf(row.catName, row.type);
            return '<div class="nl-item' + (row.checked ? '' : ' off') + '" data-row="' + i + '">' +
              '<label class="nl-check"><input type="checkbox" data-check' +
                (row.checked ? ' checked' : '') + '></label>' +
              '<span class="ico" style="color:' + color + ';background:' + QH.tint(color) + '">' +
                QH.categoryIcon(row.catName, row.type, 17) + '</span>' +
              '<div class="nl-main">' +
                '<div class="nl-line">' +
                  '<select class="field sm nl-cat" data-cat>' + catOptions(row) + '</select>' +
                  '<span class="nl-amount"><i>¥</i>' +
                    '<input data-amt inputmode="decimal" value="' + QH.ui.esc(row.amountText) + '"></span>' +
                '</div>' +
                '<div class="nl-line">' +
                  '<input class="field sm nl-note" data-note placeholder="备注（可空）" value="' +
                    QH.ui.esc(row.note) + '">' +
                  '<input class="field sm nl-date" type="date" data-date value="' + row.dateValue + '">' +
                '</div>' +
                (row.people >= 2
                  ? '<div class="nl-line nl-split-row">' +
                      '<span class="nl-split-info">共 ' + S.money(row.totalCents) + ' · ' + row.people + ' 人</span>' +
                      '<div class="segmented mini">' +
                        '<button type="button" data-split="per" class="' + (row.split ? 'on' : '') + '">人均 ' +
                          S.money(Math.round(row.totalCents / row.people)) + '</button>' +
                        '<button type="button" data-split="all" class="' + (row.split ? '' : 'on') + '">全额 ' +
                          S.money(row.totalCents) + '</button>' +
                      '</div>' +
                    '</div>'
                  : '') +
                (row.warnings.length
                  ? '<p class="nl-warn">' + QH.ui.esc(row.warnings.join('；')) + '</p>'
                  : '') +
              '</div>' +
              '</div>';
          }).join('');
          bindRows();
          updateSummary();
        }

        function bindRows() {
          list.querySelectorAll('[data-row]').forEach(function (el) {
            var i = +el.getAttribute('data-row');
            el.querySelector('[data-check]').addEventListener('change', function (e) {
              rows[i].checked = e.target.checked;
              el.classList.toggle('off', !e.target.checked);
              updateSummary();
            });
            el.querySelector('[data-cat]').addEventListener('change', function (e) {
              readRow(el, i);
              var v = e.target.value;
              rows[i].catValue = v;
              if (v.indexOf('new:') === 0) rows[i].catName = v.slice(4);
              else {
                var c = S.categoryById(v);
                if (c) { rows[i].type = c.type; rows[i].catName = c.name; }
              }
              paint();
            });
            el.querySelector('[data-amt]').addEventListener('input', function (e) {
              rows[i].amountText = e.target.value;
              updateSummary();
            });
            el.querySelector('[data-date]').addEventListener('change', function (e) {
              rows[i].dateValue = e.target.value;
            });
            el.querySelector('[data-note]').addEventListener('input', function (e) {
              rows[i].note = e.target.value;
            });
            el.querySelectorAll('[data-split]').forEach(function (btn) {
              btn.addEventListener('click', function () {
                readRow(el, i);
                var per = btn.getAttribute('data-split') === 'per';
                rows[i].split = per;
                var cents = per ? Math.round(rows[i].totalCents / rows[i].people) : rows[i].totalCents;
                rows[i].amountText = (cents / 100).toFixed(2);
                paint();
              });
            });
          });
        }

        function readRow(el, i) {
          rows[i].amountText = el.querySelector('[data-amt]').value;
          rows[i].dateValue = el.querySelector('[data-date]').value;
          rows[i].note = el.querySelector('[data-note]').value;
          rows[i].checked = el.querySelector('[data-check]').checked;
        }

        function updateSummary() {
          var income = 0, expense = 0, count = 0;
          rows.forEach(function (row) {
            if (!row.checked) return;
            var cents = 0;
            try { cents = S.parseCents(row.amountText); } catch (e) { cents = 0; }
            if (row.type === QH.INCOME) income += cents; else expense += cents;
            count++;
          });
          summary.innerHTML =
            '<span class="nl-count">识别到 <b>' + rows.length + '</b> 笔，已选 <b>' + count + '</b> 笔</span>' +
            '<span class="out">支出 ' + S.money(expense) + '</span>' +
            '<span class="in">收入 ' + S.money(income) + '</span>';
          var btn = m.el.querySelector('[data-confirm]');
          btn.textContent = count ? '记这 ' + count + ' 笔' : '请先勾选';
          btn.disabled = count === 0;
        }

        paint();

        m.el.querySelector('[data-cancel]').addEventListener('click', function () { m.close(); });

        var busy = false;
        m.el.querySelector('[data-confirm]').addEventListener('click', function () {
          if (busy) return;
          /* 先把当前 DOM 值写回，避免漏掉未失焦的编辑 */
          list.querySelectorAll('[data-row]').forEach(function (el) {
            readRow(el, +el.getAttribute('data-row'));
          });
          var saved = 0, crossed = 0, failed = [];
          rows.forEach(function (row) {
            if (!row.checked) return;
            try {
              var cents = S.parseCents(row.amountText);
              if (!(cents > 0)) throw new Error('金额需大于 0');
              var catId;
              if (row.catValue.indexOf('new:') === 0) {
                catId = S.categoryByName(row.catValue.slice(4), row.type).id;
              } else {
                catId = row.catValue;
              }
              var res = S.saveEntry({
                type: row.type,
                categoryId: catId,
                cents: cents,
                time: S.parseISO(row.dateValue),
                note: (row.split && row.people >= 2
                  ? (row.note ? row.note + ' ' : '') + '（' + row.people + '人AA）'
                  : row.note).slice(0, 120)
              });
              saved++;
              if (res.crossed || res.catCrossed) crossed++;
            } catch (e) {
              failed.push(e.message);
            }
          });
          if (!saved) {
            error.textContent = failed[0] || '保存失败';
            error.hidden = false;
            return;
          }
          busy = true;
          m.close();
          QH.render();
          QH.ui.toast('已记 ' + saved + ' 笔' + (crossed ? ' · 预算已超支' : ''),
            crossed ? 'warn' : '');
        });
      }
    });
    return modal;
  };

  /* ------------------------------------------------------------- 委托 */

  document.addEventListener('click', function (event) {
    var addBtn = event.target.closest('[data-add]');
    if (addBtn) {
      event.preventDefault();
      QH.openEntry(null);
      return;
    }
    var routeBtn = event.target.closest('[data-route]');
    if (routeBtn) {
      event.preventDefault();
      QH.go(routeBtn.getAttribute('data-route'));
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    var tag = (event.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || event.target.isContentEditable) return;
    if (document.body.classList.contains('modal-open')) return;
    if (event.key === 'n' || event.key === 'N') {
      event.preventDefault();
      QH.openEntry(null);
    }
  });

  /* ------------------------------------------------------------- 启动 */

  /* 移动端：向下滚动时收起悬浮按钮，避免压住内容 */
  var lastScrollY = 0;
  window.addEventListener('scroll', function () {
    var fab = document.querySelector('.fab');
    if (!fab) return;
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    if (y > lastScrollY + 8 && y > 140) fab.classList.add('hidden');
    else if (y < lastScrollY - 8 || y <= 140) fab.classList.remove('hidden');
    lastScrollY = y;
  }, { passive: true });

  function boot() {
    QH.applyTheme();
    QH.render();

    /* 离线能力：注册 service worker（file:// 下跳过，直接开也能用） */
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0 &&
        !window.__QH_STANDALONE__) {
      navigator.serviceWorker.register('sw.js', {scope:'./'}).catch(function () { /* 离线不可用时仍可在线使用 */ });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(typeof window !== 'undefined' ? window : globalThis);
