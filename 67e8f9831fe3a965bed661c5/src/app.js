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
    eligibility: $('#eligibility'),
    seats: $('#seats'),
    isNewEnergy: $('#isNewEnergy'),
    isDangerous: $('#isDangerous'),
    firstRegDate: $('#firstRegDate'),
    officialExpiryDate: $('#officialExpiryDate'),
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
    $('#eligibilityRow').classList.toggle('hidden', !(type === 'motorcycle' || (type === 'passenger' && els.usage.value === 'nonOperating')));
  }

  /* ------------------------------ 读取表单值 ------------------------------ */

  function readForm() {
    return {
      plate: els.plate.value.trim().toUpperCase(),
      vehicleType: els.vehicleType.value,
      usage: els.usage.value,
      eligibility: els.eligibility.value,
      seats: els.seats.value === '' ? '' : Number(els.seats.value),
      isNewEnergy: els.isNewEnergy.checked,
      isDangerous: els.isDangerous.checked,
      firstRegDate: els.firstRegDate.value,
      officialExpiryDate: els.officialExpiryDate.value,
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
    metrics.push(metric('提醒日期', r.due.date, r.due.sourceLabel, r.days.isOverdue ? 'danger' : ''));
    metrics.push(metric(r.days.isOverdue ? '日期已过' : '距提醒日期', r.days.isOverdue ? r.days.overdue : r.days.remaining, '天', r.days.isOverdue ? 'danger' : ''));
    metrics.push(metric('周期', r.cycle.months, r.cycle.months === '待核实' ? '' : '个月', '', r.cycle.text));
    metrics.push(metric('车辆类型', r.input.vehicleTypeLabel, '', '', r.spec.regime === r.input.vehicleTypeLabel ? '' : r.spec.regime));
    metrics.push(metric('车龄', r.age.text, '', ''));
    metrics.push(
      metric(
        '是否需上线检测',
        '需核实',
        '',
        'warn',
        r.inspectNote
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
      basisItem('免检政策', r.exemption.reason),
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
      case 'valid':
        return '提醒日期还有 ' + r.days.remaining + ' 天；请核对官方检验有效期。';
      case 'expiring':
        return r.days.remaining === 0
          ? '提醒日期为今天，请核对官方有效期。 '
          : '距离提醒日期还有 ' + r.days.remaining + ' 天，请核对官方有效期。';
      case 'overdue':
        return '提醒日期已过 ' + r.days.overdue + ' 天；请核对官方检验有效期。';
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
  els.usage.addEventListener('change', syncConditionalFields);

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
    els.eligibility.value = 'confirmed';
    els.seats.value = v.seats == null ? '' : v.seats;
    els.isNewEnergy.checked = !!v.isNewEnergy;
    els.isDangerous.checked = !!v.isDangerous;
    els.firstRegDate.value = v.firstRegDate;
    els.officialExpiryDate.value = v.officialExpiryDate || ''; 
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
