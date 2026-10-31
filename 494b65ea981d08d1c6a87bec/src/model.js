/**
 * 被动收入小账本 · 视图模型
 * 把 calc 的纯计算转成界面可以直接用的数值 / 文案，页面层只负责拼 HTML。
 */
(function (global) {
  'use strict';

  var calc = global.PILCalc;

  var TYPES = [
    { key: 'fixed', text: '银行定期', short: '定期', hint: '本金、利率、起止日期，到期停止计息' },
    { key: 'current', text: '活期 / 余额宝', short: '活期', hint: '随存随取，按日计息，无到期日' },
    { key: 'fund', text: '公积金', short: '公积金', hint: '按账户余额与年利率持续计息' },
    { key: 'custom', text: '自定义', short: '自定义', hint: '大额存单、国债等，可自选有无到期日' }
  ];

  function typeOf(key) {
    for (var i = 0; i < TYPES.length; i++) if (TYPES[i].key === key) return TYPES[i];
    return TYPES[TYPES.length - 1];
  }

  function dec(settings) {
    var d = settings && typeof settings.decimals === 'number' ? settings.decimals : 2;
    return Math.min(4, Math.max(0, Math.round(d)));
  }

  function money(n, settings) {
    return calc.fmtMoney(n, dec(settings));
  }

  function trim(n) {
    var v = Number(n) || 0;
    if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
    return String(Math.round(v * 10000) / 10000);
  }

  function pct(n) {
    return trim(n) + '%';
  }

  /** 星期几 */
  var WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  function weekOf(key) {
    var t = calc.parseDate(key);
    if (t === null) return '';
    return WEEK[new Date(t).getUTCDay()];
  }

  /** 某条资产的展示行 */
  function rowOf(r, settings, today) {
    var k = today || calc.todayKey();
    var a = r.asset;
    var d = dec(settings);
    var leftText = '';
    var leftDays = null;
    if (calc.hasEndDate(a)) {
      leftDays = calc.diffDays(k, a.endDate);
      if (leftDays > 0) leftText = '还有 ' + leftDays + ' 天到期';
      else if (leftDays === 0) leftText = '今天到期';
      else leftText = '已于 ' + calc.fmtDateShort(a.endDate) + ' 到期';
    }
    var pending = calc.pendingSegment(a, k);
    return {
      id: a.id,
      name: a.name,
      type: a.type,
      typeText: typeOf(a.type).short,
      note: a.note || '',
      principal: r.principal,
      principalText: money(r.principal, settings),
      rateText: trim(r.rate),
      today: r.today,
      todayText: money(r.today, settings),
      accruedText: money(r.accrued, settings),
      days: r.days,
      active: !!r.active,
      hasEnd: calc.hasEndDate(a),
      endDate: a.endDate || '',
      endText: a.endDate ? calc.fmtDateCN(a.endDate) : '',
      startText: calc.fmtDateCN(a.startDate),
      leftText: leftText,
      daysLeft: leftDays,
      remind: a.remind !== false,
      pendingText: pending
        ? '明日起按 ¥' + money(pending.principal, settings) + ' · ' + trim(pending.rate) + '% 计息'
        : ''
    };
  }

  /** 首页总览 */
  function dashboard(assets, settings, today) {
    var k = today || calc.todayKey();
    var s = calc.summarize(assets, k);
    var d = dec(settings);
    var list = s.rows.map(function (r) { return rowOf(r, settings, k); });

    // 到期提醒（受总开关与单条开关双重控制）
    var notifyOn = !(settings && settings.notify === false);
    var groups = calc.reminderGroups(assets, k, { remindOnly: false });
    var soon = notifyOn ? groups.soon.filter(function (i) { return i.remind; }) : [];
    var soonText = '';
    if (soon.length) {
      var f = soon[0];
      soonText = '《' + f.name + '》' + (f.daysLeft === 0 ? '今天到期' : f.daysLeft + ' 天后到期')
        + (soon.length > 1 ? ' 等 ' + soon.length + ' 笔资产即将到期' : '，请留意资金安排');
    }

    var goal = settings && settings.goalDaily ? Number(settings.goalDaily) : 0;
    var goalData = null;
    if (goal > 0) {
      var pctV = Math.min(100, Math.round((s.todayTotal / goal) * 100));
      goalData = {
        goalText: money(goal, settings),
        pct: pctV,
        reached: s.todayTotal >= goal,
        gapText: s.todayTotal >= goal
          ? '已达成，超出 ¥' + money(s.todayTotal - goal, settings) + ' / 天'
          : '还差 ¥' + money(goal - s.todayTotal, settings) + ' / 天'
      };
    }

    return {
      date: k,
      dateText: calc.fmtDateCN(k),
      weekText: weekOf(k),
      todayTotal: s.todayTotal,
      todayText: money(s.todayTotal, settings),
      monthText: money(s.monthTotal, settings),
      yearText: money(s.yearTotal, settings),
      allText: money(s.allTotal, settings),
      principalText: money(s.principalTotal, settings),
      yearForecastText: money(s.todayTotal * 365, settings),
      monthForecastText: money(s.todayTotal * 30, settings),
      count: s.count,
      activeCount: s.activeCount,
      rows: list,
      goal: goalData,
      soonCount: soon.length,
      soonText: soonText,
      notifyOn: notifyOn
    };
  }

  /** 近 n 天序列（升序，含今天） */
  function series(assets, today, n) {
    var k = today || calc.todayKey();
    var raw = calc.historySeries(assets, k, n || 30);
    var max = 0;
    for (var i = 0; i < raw.length; i++) if (raw[i].total > max) max = raw[i].total;
    return raw.map(function (p, idx) {
      return {
        date: p.date,
        total: p.total,
        max: max,
        label: calc.fmtDateShort(p.date),
        isToday: idx === raw.length - 1,
        weekText: weekOf(p.date),
        pctOfMax: max > 0 ? p.total / max : 0
      };
    });
  }

  /** 到期提醒分桶 */
  function reminders(assets, settings, today) {
    var k = today || calc.todayKey();
    var g = calc.reminderGroups(assets, k, { remindOnly: false });
    var d = dec(settings);
    function map(items) {
      return items.map(function (it) {
        var a = it.asset;
        return {
          id: it.id,
          name: it.name,
          endDate: it.endDate,
          endText: calc.fmtDateCN(it.endDate),
          daysLeft: it.daysLeft,
          remind: it.remind,
          principalText: money(calc.currentPrincipal(a, k), settings),
          typeText: typeOf(a.type).short
        };
      });
    }
    return {
      today: k,
      notifyOn: !(settings && settings.notify === false),
      soon: map(g.soon),
      later: map(g.later),
      expired: map(g.expired)
    };
  }

  /** 到期日 + 预估利息（编辑页实时预览用） */
  function preview(draft, settings, today) {
    var k = today || calc.todayKey();
    var p = Number(draft.principal) || 0;
    var r = Number(draft.rate) || 0;
    var daily = p * (r / 100) / 365;
    var out = {
      daily: daily,
      dailyText: money(daily, settings),
      monthText: money(daily * 30, settings),
      yearText: money(daily * 365, settings),
      days: null,
      totalText: '',
      valid: p > 0
    };
    if (draft.endDate && calc.isDateKey(draft.endDate) && calc.isDateKey(draft.startDate)) {
      var days = calc.diffDays(draft.startDate, draft.endDate);
      if (days > 0) {
        out.days = days;
        out.totalText = money(daily * days, settings);
      }
    }
    return out;
  }

  global.PILModel = {
    TYPES: TYPES,
    typeOf: typeOf,
    dec: dec,
    money: money,
    trim: trim,
    pct: pct,
    weekOf: weekOf,
    rowOf: rowOf,
    dashboard: dashboard,
    series: series,
    reminders: reminders,
    preview: preview
  };
})(window);
