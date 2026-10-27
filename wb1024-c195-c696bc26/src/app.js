/**
 * ============================================================================
 * 车辆年检提醒工具 —— 界面逻辑
 * ----------------------------------------------------------------------------
 * 职责：表单采集 → 调用 VIR.evaluate() → 渲染状态、指标、时间轴、推演过程与建议
 * 说明：所有判定均由 src/rules.js 完成，本文件不重复实现任何法规规则
 * ============================================================================
 */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ------------------------------ 工具函数 ------------------------------ */

  function todayStr() {
    const d = new Date();
    const p = (n) => (n < 10 ? '0' + n : String(n));
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  /** HTML 转义，防止用户输入的车牌等内容破坏页面结构 */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ------------------------------ 表单初始化 ------------------------------ */

  const form = $('#form');
  const els = {
    plate: $('#plate'),
    vehicleType: $('#vehicleType'),
    usage: $('#usage'),
    seats: $('#seats'),
    isNewEnergy: $('#isNewEnergy'),
    isDangerous: $('#isDangerous'),
    firstRegDate: $('#firstRegDate'),
    lastInspectionDate: $('#lastInspectionDate'),
    method: $('#method'),
    baseDate: $('#baseDate'),
    warnDays: $('#warnDays')
  };

  function initOptions() {
    els.vehicleType.innerHTML = VIR.VEHICLE_TYPES.map(
      (t) => '<option value="' + t.value + '">' + esc(t.label) + '</option>'
    ).join('');
    els.usage.innerHTML = VIR.USAGE_NATURES.map(
      (u) => '<option value="' + u.value + '">' + esc(u.label) + '</option>'
    ).join('');
    els.baseDate.value = todayStr();
    els.firstRegDate.value = '2018-03-15';
    els.warnDays.value = 30;
  }

  /** 根据车辆类型动态显示/隐藏关联字段 */
  function syncConditionalFields() {
    const type = els.vehicleType.value;
    const needSeats = VIR.SEATS_REQUIRED_TYPES.includes(type);
    $('#seatsRow').classList.toggle('hidden', !needSeats);
    els.seats.required = needSeats;
    if (needSeats && !els.seats.value) els.seats.value = type === 'schoolBus' ? 40 : 5;
    $('#dangerRow').classList.toggle('hidden', type !== 'truck');
  }

  /* ------------------------------ 读取表单值 ------------------------------ */

  function readForm() {
    return {
      plate: els.plate.value.trim().toUpperCase(),
      vehicleType: els.vehicleType.value,
      usage: els.usage.value,
      seats: els.seats.value === '' ? '' : Number(els.seats.value),
      isNewEnergy: els.isNewEnergy.checked,
      isDangerous: els.isDangerous.checked,
      firstRegDate: els.firstRegDate.value,
      lastInspectionDate: els.lastInspectionDate.value,
      method: els.method.value,
      baseDate: els.baseDate.value,
      warnDays: Number(els.warnDays.value)
    };
  }

  /* ------------------------------ 错误提示渲染 ------------------------------ */

  function clearErrors() {
    $$('.err').forEach((p) => {
      p.textContent = '';
      p.classList.remove('show');
    });
    $$('input, select').forEach((i) => i.classList.remove('invalid'));
  }

  function showErrors(errors) {
    errors.forEach((e) => {
      const p = document.querySelector('.err[data-err="' + e.field + '"]');
      if (p) {
        p.textContent = e.message;
        p.classList.add('show');
      }
      const input = els[e.field];
      if (input) input.classList.add('invalid');
    });
    const first = errors[0];
    if (first) {
      const target = els[first.field] || document.querySelector('.err[data-err="' + first.field + '"]');
      if (target && target.focus) target.focus();
    }
  }

  /* ------------------------------ 结果渲染 ------------------------------ */

  function render(r) {
    $('#resultEmpty').classList.add('hidden');
    $('#result').classList.remove('hidden');

    // 状态徽章
    const badge = $('#statusBadge');
    badge.textContent = r.statusLabel;
    badge.className = 'status-badge ' + r.statusTone;
    $('#statusPlate').textContent = r.input.plate;
    $('#statusDesc').textContent = statusDesc(r);

    // 关键指标
    const metrics = [];
    if (r.status === 'exempt') {
      metrics.push(metric('免检截止日', r.exemption.endDate, '登记 6 年以内可申请免检', 'info'));
      metrics.push(metric('免检期剩余', r.exemption.remainingDays, '天', 'info'));
      metrics.push(metric('首个需上线日', r.exemption.firstOnSiteDue, '满 6 年后按年度周期', 'info'));
    } else {
      metrics.push(metric('检验到期日', r.due.date, r.due.sourceLabel, r.days.isOverdue ? 'danger' : ''));
      if (r.days.isOverdue) {
        metrics.push(metric('已逾期', r.days.overdue, '天', 'danger'));
      } else {
        metrics.push(metric('剩余天数', r.days.remaining, '天', r.days.remaining <= r.input.warnDays ? 'warn' : 'ok'));
      }
      // 周期描述去掉"12 个月（…）"的外壳，只保留括号内的频率说明
      const cycleFreq = r.cycle.text.replace(/^[\d.]+ ?个月（/, '').replace(/）$/, '');
      metrics.push(metric('检验周期', r.cycle.months, '个月', '', cycleFreq));
    }
    metrics.push(metric('车辆类型', r.input.vehicleTypeLabel, '', '', r.spec.regime === r.input.vehicleTypeLabel ? '' : r.spec.regime));
    metrics.push(metric('车龄', r.age.text, '', ''));
    metrics.push(
      metric(
        '是否需上线检测',
        r.needOnSite ? '需要' : '暂不需要',
        '',
        r.needOnSite ? 'warn' : 'ok',
        r.needOnSite ? r.inspectNote : '当前无需驶入检测站'
      )
    );
    $('#metrics').innerHTML = metrics.join('');

    // 时间轴
    $('#timeline').innerHTML = r.timeline
      .map(
        (t) =>
          '<div class="tl-item ' + t.type + '">' +
          '<div class="tl-dot"></div>' +
          '<div class="tl-date">' + esc(t.date) + '</div>' +
          '<div class="tl-label">' + esc(t.label) + '</div>' +
          '</div>'
      )
      .join('');

    // 推演过程
    $('#steps').innerHTML = r.steps
      .map(
        (s) =>
          '<li><div class="step-title">' + esc(s.title) + '</div>' +
          '<div class="step-detail">' + esc(s.detail) + '</div>' +
          (s.formula ? '<div class="step-formula">' + esc(s.formula) + '</div>' : '') +
          '</li>'
      )
      .join('');

    // 风险提示
    const warnBox = $('#warnBox');
    if (r.warnings && r.warnings.length) {
      warnBox.classList.remove('hidden');
      $('#warnList').innerHTML = r.warnings.map((w) => '<li>' + esc(w) + '</li>').join('');
    } else {
      warnBox.classList.add('hidden');
    }

    // 处置建议
    $('#adviceList').innerHTML = r.advice.map((a) => '<li>' + esc(a) + '</li>').join('');

    // 判断依据
    $('#basis').innerHTML = [
      basisItem('车辆类型', r.input.vehicleTypeLabel + ' · ' + r.input.usageLabel + (r.input.seats ? ' · ' + r.input.seats + ' 座' : '')),
      basisItem('适用规则', r.spec.regime),
      basisItem('规则依据', r.spec.basis),
      basisItem('检验周期', r.cycle.text + '（车龄 ' + r.age.text + '，阈值 ' + (r.spec.thresholdYears != null ? r.spec.thresholdYears + ' 年' : '固定周期') + '）'),
      basisItem('推算方式', r.due.sourceLabel),
      basisItem('免检政策', r.exemption.reason + (r.exemption.applicable ? '（免检截止 ' + r.exemption.endDate + '）' : '')),
      basisItem('判定基准日', r.baseDate + ' · 提醒阈值 ' + r.input.warnDays + ' 天')
    ].join('');
  }

  function metric(label, value, unit, tone, sub) {
    return (
      '<div class="metric' + (tone ? ' accent-' + tone : '') + '">' +
      '<div class="metric-label">' + esc(label) + '</div>' +
      '<div class="metric-value">' + esc(value) + (unit ? '<small>' + esc(unit) + '</small>' : '') + '</div>' +
      (sub ? '<div class="metric-sub">' + esc(sub) + '</div>' : '') +
      '</div>'
    );
  }

  function basisItem(key, val) {
    return '<div class="basis-item"><div class="basis-key">' + esc(key) + '</div><div class="basis-val">' + esc(val) + '</div></div>';
  }

  function statusDesc(r) {
    switch (r.status) {
      case 'exempt':
        return '车辆登记未满 6 年，处于免检政策覆盖范围内，本检验周期无需上线检测，但需在到期前办理免检申请。';
      case 'valid':
        return '当前检验有效，距离本次检验到期还有 ' + r.days.remaining + ' 天（提醒阈值 ' + r.input.warnDays + ' 天）。';
      case 'expiring':
        return r.days.remaining === 0
          ? '今天即为检验到期日，请立即安排上线检测。'
          : '距离检验到期仅剩 ' + r.days.remaining + ' 天，已进入提醒区间，请尽快预约检测。';
      case 'overdue':
        return '车辆已超过检验有效期 ' + r.days.overdue + ' 天，未按规定定期检验的机动车上路行驶将被扣留并处罚。';
      default:
        return '';
    }
  }

  /* ------------------------------ 提交处理 ------------------------------ */

  function run() {
    clearErrors();
    const input = readForm();
    const baseDate = input.baseDate || todayStr();
    const r = VIR.evaluate(input, { today: baseDate, warnDays: input.warnDays });

    if (!r.ok) {
      showErrors(r.errors);
      return false;
    }
    render(r);
    return true;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run();
  });

  // 输入时清除该字段的错误态
  $$('input, select').forEach((el) => {
    el.addEventListener('input', () => {
      el.classList.remove('invalid');
      const p = document.querySelector('.err[data-err="' + el.name + '"]');
      if (p) {
        p.textContent = '';
        p.classList.remove('show');
      }
    });
  });

  els.vehicleType.addEventListener('change', syncConditionalFields);

  $('#btnReset').addEventListener('click', () => {
    form.reset();
    clearErrors();
    initOptions();
    syncConditionalFields();
    $('#result').classList.add('hidden');
    $('#resultEmpty').classList.remove('hidden');
  });

  /* ------------------------------ 示例一键填充 ------------------------------ */

  /** 将示例数据回填到表单并立即执行判定 */
  function loadSample(s) {
    if (!s) return;
    const v = s.input;
    els.plate.value = v.plate;
    els.vehicleType.value = v.vehicleType;
    els.usage.value = v.usage;
    els.seats.value = v.seats == null ? '' : v.seats;
    els.isNewEnergy.checked = !!v.isNewEnergy;
    els.isDangerous.checked = !!v.isDangerous;
    els.firstRegDate.value = v.firstRegDate;
    els.lastInspectionDate.value = v.lastInspectionDate || '';
    els.method.value = v.method;
    els.baseDate.value = v.baseDate;
    els.warnDays.value = v.warnDays;
    syncConditionalFields();
    clearErrors();
    run();
  }

  function renderSamples() {
    $('#sampleList').innerHTML = VIR_SAMPLES.map(
      (s) =>
        '<button type="button" class="sample-btn" data-key="' + s.key + '">' +
        '<b>' + esc(s.title) + '</b><span>' + esc(s.badge) + '</span>' +
        '</button>'
    ).join('');

    $$('.sample-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const s = VIR_SAMPLES.find((x) => x.key === btn.dataset.key);
        loadSample(s);
        $('#result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  }

  /* ------------------------------ 规则表弹层 ------------------------------ */

  function renderRules() {
    $('#ruleTable').innerHTML =
      '<thead><tr><th>车辆类型</th><th>检验周期</th><th>依据</th></tr></thead><tbody>' +
      VIR.RULE_TABLE.map(
        (r) =>
          '<tr><td>' + esc(r.type) + '</td><td>' + esc(r.cycle) + '</td><td>' + esc(r.basis) + '</td></tr>'
      ).join('') +
      '</tbody>';
  }

  function openModal() {
    $('#rulesModal').classList.remove('hidden');
  }
  function closeModal() {
    $('#rulesModal').classList.add('hidden');
  }

  $('#btnRules').addEventListener('click', openModal);
  $$('#rulesModal [data-close]').forEach((el) => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /* ------------------------------ 启动 ------------------------------ */

  initOptions();
  syncConditionalFields();
  renderSamples();
  renderRules();

  // 支持通过 URL 指定初始示例： index.html?sample=overdue
  const requestedKey = new URLSearchParams(window.location.search).get('sample');
  const initial = VIR_SAMPLES.find((s) => s.key === requestedKey) || VIR_SAMPLES[0];
  if (initial) loadSample(initial);
})();
