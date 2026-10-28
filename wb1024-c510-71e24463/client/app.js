/* ============================================================
 * app.js —— 日历渲染 + 节日/节气/历史 + 备忘录（localStorage）
 * ============================================================ */
(function () {
  'use strict';

  var WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  var STORE_KEY = 'calendar_memos_v1';
  var THEME_KEY = 'calendar_theme_v1';

  var state = {
    viewY: 0,
    viewM: 0,        // 1-12
    selected: null   // Date 对象（选中日）
  };

  // ---------- 备忘录存储 ----------
  function loadMemos() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveMemos(obj) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch (e) {}
  }
  function dateKey(d) {
    return d.getFullYear() + '-' +
      (d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '-' +
      (d.getDate() < 10 ? '0' + d.getDate() : d.getDate());
  }
  function getMemoFor(d) { return loadMemos()[dateKey(d)] || []; }

  // ---------- 工具 ----------
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  // ---------- 渲染日历 ----------
  function renderCalendar() {
    var grid = document.getElementById('dayGrid');
    var y = state.viewY, m = state.viewM;
    document.getElementById('calTitle').textContent = y + ' 年 ' + m + ' 月';

    var first = new Date(y, m - 1, 1);
    var startWeekday = first.getDay(); // 0=日
    var daysInMonth = new Date(y, m, 0).getDate();

    // 上个月的补齐
    var prevDays = new Date(y, m - 1, 0).getDate();
    var cells = [];
    for (var i = startWeekday - 1; i >= 0; i--) {
      cells.push(makeCell(new Date(y, m - 2, prevDays - i), true));
    }
    for (var d = 1; d <= daysInMonth; d++) {
      cells.push(makeCell(new Date(y, m - 1, d), false));
    }
    // 补满 6 行
    while (cells.length % 7 !== 0) {
      var extra = cells.length - (startWeekday + daysInMonth);
      cells.push(makeCell(new Date(y, m, extra + 1), true));
    }

    grid.innerHTML = '';
    cells.forEach(function (cell) { grid.appendChild(cell); });
  }

  function makeCell(date, outside) {
    var y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    var cell = document.createElement('div');
    cell.className = 'day-cell' + (outside ? ' outside' : '');

    var today = new Date();
    if (y === today.getFullYear() && m === today.getMonth() + 1 && d === today.getDate()) {
      cell.classList.add('today');
    }
    if (state.selected && dateKey(date) === dateKey(state.selected)) {
      cell.classList.add('selected');
    }

    var lunar = Lunar.solarToLunar(y, m, d);
    var term = Lunar.solarTerm(y, m, d);
    var holi = Holidays.getHolidays(y, m, d);

    var solarEl = document.createElement('div');
    solarEl.className = 'dc-solar';
    solarEl.textContent = d;
    cell.appendChild(solarEl);

    var lunarEl = document.createElement('div');
    lunarEl.className = 'dc-lunar';
    lunarEl.textContent = term ? term : Lunar.lunarText(lunar);
    cell.appendChild(lunarEl);

    // 标签（最多展示 2 个）
    var tagsEl = document.createElement('div');
    tagsEl.className = 'dc-tags';
    var labelPool = [];
    holi.forEach(function (h) {
      labelPool.push({ cls: 'tag-' + h.type, text: h.name });
    });
    if (term) labelPool.push({ cls: 'tag-term', text: term });

    labelPool.slice(0, 2).forEach(function (t) {
      var tag = document.createElement('span');
      tag.className = 'dc-tag ' + t.cls;
      tag.textContent = (t.text.length > 4 ? t.text.slice(0, 4) : t.text);
      tag.title = t.text;
      tagsEl.appendChild(tag);
    });
    if (labelPool.length > 2) {
      var more = document.createElement('span');
      more.className = 'dc-tag';
      more.style.background = 'var(--text-soft)';
      more.textContent = '+' + (labelPool.length - 2);
      more.title = labelPool.slice(2).map(function (x) { return x.text; }).join('、');
      tagsEl.appendChild(more);
    }
    cell.appendChild(tagsEl);

    // 备忘小红点
    if (getMemoFor(date).length > 0) {
      var dot = document.createElement('span');
      dot.className = 'dc-memo-dot';
      cell.appendChild(dot);
    }

    cell.addEventListener('click', function () {
      state.selected = date;
      renderCalendar();
      renderDetail(date);
    });
    return cell;
  }

  // ---------- 渲染详情 ----------
  function renderDetail(date) {
    var y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    var lunar = Lunar.solarToLunar(y, m, d);
    var term = Lunar.solarTerm(y, m, d);

    document.getElementById('ddDay').textContent = d;
    document.getElementById('ddWeek').textContent = WEEK[date.getDay()];
    var sub = y + ' 年 ' + m + ' 月 · 农历 ' + Lunar.lunarText(lunar) +
      '（' + Lunar.lunarGanZhiYear(lunar) + Lunar.lunarAnimal(lunar) + '年）';
    if (term) sub += ' · ' + term;
    document.getElementById('ddSub').textContent = sub;

    // 节日
    var holi = Holidays.getHolidays(y, m, d);
    var holiBox = document.getElementById('holidayList');
    holiBox.innerHTML = '';
    if (term) {
      var tc = document.createElement('span');
      tc.className = 'holiday-chip tag-term';
      tc.textContent = term + '（节气）';
      holiBox.appendChild(tc);
    }
    if (holi.length === 0 && !term) {
      holiBox.innerHTML = '<span class="empty-hint">这一天没有收录的节日 / 节气</span>';
    } else {
      holi.forEach(function (h) {
        var c = document.createElement('span');
        c.className = 'holiday-chip tag-' + h.type;
        c.textContent = h.name;
        holiBox.appendChild(c);
      });
    }

    // 历史上的今天
    renderHistory(m, d);

    // 备忘录
    renderMemos(date);
  }

  function renderHistory(m, d) {
    var box = document.getElementById('historyList');
    var meta = document.getElementById('historyMeta');
    box.innerHTML = '';
    meta.textContent = '加载中…';

    var local = HistoryToday.getLocal(m, d);
    function paint(items, source) {
      box.innerHTML = '';
      if (!items || items.length === 0) {
        box.innerHTML = '<li class="empty-hint">暂无收录的历史事件</li>';
        meta.textContent = source;
        return;
      }
      items.forEach(function (it) {
        var li = document.createElement('li');
        if (it.y) {
          var yspan = document.createElement('span');
          yspan.className = 'hy';
          yspan.textContent = it.y + '年';
          li.appendChild(yspan);
        }
        li.appendChild(document.createTextNode(it.t));
        box.appendChild(li);
      });
      meta.textContent = source;
    }

    paint(local, '本地精选数据（离线可用）');


  }

  function renderMemos(date) {
    var ul = document.getElementById('memoList');
    var items = getMemoFor(date);
    ul.innerHTML = '';
    if (items.length === 0) {
      ul.innerHTML = '<li class="empty-hint">还没有备忘，添加一条吧</li>';
      return;
    }
    items.forEach(function (it) {
      var li = document.createElement('li');
      li.className = 'memo-item' + (it.done ? ' done' : '');

      var chk = document.createElement('span');
      chk.className = 'chk';
      chk.textContent = it.done ? '✓' : '';
      chk.addEventListener('click', function () {
        toggleMemo(date, it.id);
      });

      var txt = document.createElement('span');
      txt.className = 'mt';
      txt.textContent = it.text;

      var del = document.createElement('button');
      del.className = 'del';
      del.textContent = '×';
      del.title = '删除';
      del.addEventListener('click', function () {
        removeMemo(date, it.id);
      });

      li.appendChild(chk);
      li.appendChild(txt);
      li.appendChild(del);
      ul.appendChild(li);
    });
  }

  // ---------- 备忘增删改 ----------
  function addMemo(date, text) {
    var all = loadMemos();
    var k = dateKey(date);
    if (!all[k]) all[k] = [];
    all[k].push({ id: Date.now() + '_' + Math.random().toString(36).slice(2, 7), text: text, done: false });
    saveMemos(all);
    renderMemos(date);
    renderCalendar();
  }
  function toggleMemo(date, id) {
    var all = loadMemos();
    var k = dateKey(date);
    if (all[k]) {
      all[k] = all[k].map(function (it) {
        if (it.id === id) it.done = !it.done;
        return it;
      });
      saveMemos(all);
    }
    renderMemos(date);
  }
  function removeMemo(date, id) {
    var all = loadMemos();
    var k = dateKey(date);
    if (all[k]) {
      all[k] = all[k].filter(function (it) { return it.id !== id; });
      if (all[k].length === 0) delete all[k];
      saveMemos(all);
    }
    renderMemos(date);
    renderCalendar();
  }

  // ---------- 主题 ----------
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
  }

  // ---------- 初始化 ----------
  function init() {
    var now = new Date();
    state.viewY = now.getFullYear();
    state.viewM = now.getMonth() + 1;
    state.selected = now;

    try {
      var savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) {}

    document.getElementById('prevBtn').addEventListener('click', function () {
      state.viewM--;
      if (state.viewM < 1) { state.viewM = 12; state.viewY--; }
      renderCalendar();
    });
    document.getElementById('nextBtn').addEventListener('click', function () {
      state.viewM++;
      if (state.viewM > 12) { state.viewM = 1; state.viewY++; }
      renderCalendar();
    });
    document.getElementById('todayBtn').addEventListener('click', function () {
      var n = new Date();
      state.viewY = n.getFullYear(); state.viewM = n.getMonth() + 1; state.selected = n;
      renderCalendar();
      renderDetail(n);
    });
    document.getElementById('themeBtn').addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
    document.getElementById('memoForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = document.getElementById('memoInput');
      var v = inp.value.trim();
      if (!v) return;
      addMemo(state.selected, v);
      inp.value = '';
    });

    renderCalendar();
    renderDetail(state.selected);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
