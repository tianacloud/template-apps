document.title = "煮饭预约";
const style = document.createElement("style"); style.textContent = "\n  :root {\n    --bg: #fff9f2;\n    --card: #ffffff;\n    --ink: #2d2118;\n    --ink-2: #7a6656;\n    --ink-3: #a89684;\n    --line: #f5ebe0;\n    --brand: #e8772e;\n    --brand-deep: #c75b14;\n    --brand-soft: #fff3e4;\n  }\n\n  * {\n    box-sizing: border-box;\n    -webkit-tap-highlight-color: transparent;\n  }\n\n  html,\n  body {\n    margin: 0;\n    padding: 0;\n  }\n\n  body {\n    display: flex;\n    justify-content: center;\n    min-height: 100vh;\n    min-height: 100dvh;\n    background: #efe9e1;\n    color: var(--ink);\n    font-family: -apple-system, BlinkMacSystemFont, \"PingFang SC\", \"HarmonyOS Sans SC\",\n      \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif;\n    font-size: 15px;\n    line-height: 1.5;\n    -webkit-font-smoothing: antialiased;\n  }\n\n  .app {\n    display: flex;\n    flex-direction: column;\n    width: 100%;\n    max-width: 440px;\n    min-height: 100vh;\n    min-height: 100dvh;\n    padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);\n    background: var(--bg);\n  }\n\n  /* 桌面端：收成一张卡片 */\n  @media (min-width: 560px) {\n    body {\n      align-items: flex-start;\n      padding: 28px 16px 48px;\n    }\n    .app {\n      min-height: 0;\n      border-radius: 26px;\n      box-shadow: 0 30px 80px rgba(92, 60, 28, 0.16), 0 0 0 1px rgba(120, 90, 60, 0.06);\n    }\n  }\n\n  /* ---------- 顶部时钟 ---------- */\n  .hero {\n    padding: 30px 22px 22px;\n    background: linear-gradient(180deg, #ffeedc 0%, #fff9f2 100%);\n  }\n\n  .hero-label {\n    font-size: 12px;\n    letter-spacing: 2px;\n    color: #b08c68;\n  }\n\n  .hero-clock {\n    margin: 6px 0 4px;\n    font-size: 46px;\n    font-weight: 800;\n    line-height: 1.06;\n    letter-spacing: 0.5px;\n    font-variant-numeric: tabular-nums;\n    font-feature-settings: \"tnum\";\n  }\n\n  .hero-date {\n    font-size: 13px;\n    color: var(--ink-3);\n  }\n\n  /* ---------- 卡片 ---------- */\n  .card {\n    margin: 0 16px 12px;\n    padding: 18px;\n    background: var(--card);\n    border-radius: 16px;\n    box-shadow: 0 4px 20px rgba(196, 138, 78, 0.07);\n  }\n\n  .card-label {\n    font-size: 13px;\n    color: var(--ink-3);\n  }\n\n  /* ---------- 目标时间 ---------- */\n  /* 整行都是热区：透明原生控件铺满整行，点哪儿都能唤起系统时间选择器 */\n  .target-row {\n    position: relative;\n    display: flex;\n    align-items: center;\n    margin: 4px -8px 0;\n    padding: 10px 8px;\n    border-radius: 14px;\n    cursor: pointer;\n    transition: background 0.15s ease;\n  }\n\n  .target-row:hover,\n  .target-row:focus-within {\n    background: #fffaf3;\n  }\n\n  .target-row:active {\n    background: #ffeedc;\n  }\n\n  .time-text {\n    font-size: 40px;\n    font-weight: 700;\n    line-height: 1.12;\n    color: var(--brand-deep);\n    font-variant-numeric: tabular-nums;\n    font-feature-settings: \"tnum\";\n  }\n\n  .day-chip {\n    margin-left: 10px;\n    padding: 3px 10px;\n    font-size: 12px;\n    color: #a8703f;\n    background: var(--brand-soft);\n    border-radius: 20px;\n  }\n\n  /* 视觉上的按钮，实际点击由铺满整行的 input 接收 */\n  .pick-btn {\n    margin-left: auto;\n    flex-shrink: 0;\n    padding: 7px 15px;\n    font-size: 12.5px;\n    font-weight: 600;\n    color: var(--brand-deep);\n    background: var(--brand-soft);\n    border-radius: 20px;\n    pointer-events: none;\n  }\n\n  .target-row input[type=\"time\"] {\n    position: absolute;\n    left: 0;\n    top: 0;\n    width: 100%;\n    height: 100%;\n    margin: 0;\n    padding: 0;\n    border: 0;\n    opacity: 0;\n    z-index: 2;\n    cursor: pointer;\n    font-size: 16px;\n  }\n\n  /* ---------- 主结果 ---------- */\n  .result {\n    margin: 0 16px 12px;\n    padding: 20px 18px 17px;\n    background: linear-gradient(148deg, #fff4e5 0%, #ffe4c8 100%);\n    border-radius: 16px;\n    box-shadow: 0 8px 24px rgba(232, 119, 46, 0.13);\n  }\n\n  .result-label {\n    font-size: 12px;\n    letter-spacing: 0.5px;\n    color: #a87b52;\n  }\n\n  .result-value {\n    display: flex;\n    align-items: baseline;\n    margin: 8px 0 6px;\n    color: var(--brand-deep);\n  }\n\n  .num {\n    font-size: 56px;\n    font-weight: 800;\n    line-height: 1;\n    letter-spacing: -1px;\n    font-variant-numeric: tabular-nums;\n    font-feature-settings: \"tnum\";\n  }\n\n  .unit {\n    margin: 0 9px 0 4px;\n    font-size: 15px;\n    font-weight: 600;\n  }\n\n  .unit:last-child {\n    margin-right: 0;\n  }\n\n  .result-sub {\n    font-size: 12px;\n    color: #a87b52;\n  }\n\n  .result-warn {\n    margin-top: 11px;\n    padding: 9px 11px;\n    font-size: 12px;\n    line-height: 1.55;\n    color: #a85c22;\n    background: rgba(255, 255, 255, 0.72);\n    border-radius: 8px;\n  }\n\n  .is-hidden {\n    display: none !important;\n  }\n\n  /* ---------- 步进建议 ---------- */\n  .card-tip {\n    background: #fbfdf6;\n    box-shadow: 0 4px 20px rgba(140, 160, 110, 0.09);\n  }\n\n  .tip-tag {\n    display: inline-block;\n    padding: 3px 8px;\n    font-size: 11px;\n    color: #6c7d4c;\n    background: #eef3e2;\n    border-radius: 5px;\n  }\n\n  .tip-body {\n    display: flex;\n    align-items: baseline;\n    margin-top: 10px;\n  }\n\n  .tip-value {\n    font-size: 24px;\n    font-weight: 700;\n    color: #3f4a29;\n    font-variant-numeric: tabular-nums;\n    font-feature-settings: \"tnum\";\n  }\n\n  .tip-desc {\n    margin-left: 8px;\n    font-size: 11.5px;\n    color: #99a382;\n  }\n\n  /* ---------- 起煮模式 ---------- */\n  .switch-row {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n  }\n\n  .switch-text {\n    flex: 1;\n    padding-right: 12px;\n  }\n\n  .switch-title {\n    font-size: 13.5px;\n    font-weight: 500;\n  }\n\n  .switch-desc {\n    margin-top: 4px;\n    font-size: 11px;\n    line-height: 1.5;\n    color: #b0a091;\n  }\n\n  .sw {\n    position: relative;\n    flex-shrink: 0;\n    width: 46px;\n    height: 27px;\n    padding: 0;\n    background: #e5e0d8;\n    border: 0;\n    border-radius: 20px;\n    cursor: pointer;\n    transition: background 0.2s;\n  }\n\n  .sw::after {\n    content: \"\";\n    position: absolute;\n    top: 2.5px;\n    left: 2.5px;\n    width: 22px;\n    height: 22px;\n    background: #fff;\n    border-radius: 50%;\n    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);\n    transition: transform 0.2s;\n  }\n\n  .sw.on {\n    background: var(--brand);\n  }\n\n  .sw.on::after {\n    transform: translateX(19px);\n  }\n\n  .cook-block {\n    margin-top: 15px;\n    padding-top: 14px;\n    border-top: 1px solid var(--line);\n  }\n\n  .cook-label {\n    font-size: 11.5px;\n    color: var(--ink-3);\n  }\n\n  .cook-options {\n    display: flex;\n    gap: 7px;\n    margin-top: 8px;\n  }\n\n  .cook-opt {\n    padding: 7px 13px;\n    font-family: inherit;\n    font-size: 12.5px;\n    color: var(--ink-2);\n    background: #fbf3ea;\n    border: 0;\n    border-radius: 8px;\n    cursor: pointer;\n  }\n\n  .cook-opt.on {\n    color: var(--brand-deep);\n    font-weight: 600;\n    background: #ffe8d2;\n  }\n\n  .cook-result {\n    margin-top: 12px;\n    font-size: 13.5px;\n    line-height: 1.6;\n    color: #4a3b2e;\n  }\n\n  .hl {\n    font-weight: 700;\n    color: var(--brand-deep);\n  }\n\n  .cook-result.is-warn {\n    font-size: 12.5px;\n    color: #c0492b;\n  }\n\n  /* ---------- 底部 ---------- */\n  .spacer {\n    flex: 1;\n    min-height: 8px;\n  }\n\n  .actions {\n    padding: 4px 16px 20px;\n  }\n\n  .btn-main {\n    width: 100%;\n    padding: 14px 0;\n    font-family: inherit;\n    font-size: 15.5px;\n    font-weight: 600;\n    color: #fff;\n    background: linear-gradient(135deg, #f2994a 0%, #e8772e 100%);\n    border: 0;\n    border-radius: 50px;\n    box-shadow: 0 6px 16px rgba(232, 119, 46, 0.26);\n    cursor: pointer;\n    transition: transform 0.12s ease, opacity 0.12s ease;\n  }\n\n  .btn-main:active {\n    transform: scale(0.985);\n    opacity: 0.9;\n  }\n\n  .footnote {\n    margin-top: 12px;\n    font-size: 11px;\n    line-height: 1.7;\n    text-align: center;\n    color: #b8a695;\n    white-space: pre-line;\n  }\n"; document.head.appendChild(style);
const hostStyle = document.createElement("style"); hostStyle.textContent = "body { display:block !important; padding:0 !important; } #app { display:flex; justify-content:center; width:100%; } @media(min-width:560px){ #app { padding:28px 16px 48px; } }"; document.head.appendChild(hostStyle);
document.getElementById("app").innerHTML = "\n<main class=\"app\">\n\n  <header class=\"hero\">\n    <div class=\"hero-label\">现在</div>\n    <div class=\"hero-clock\" id=\"clock\">--:--:--</div>\n    <div class=\"hero-date\" id=\"dateText\"></div>\n  </header>\n\n  <section class=\"card\">\n    <div class=\"card-label\">想吃上饭的时间</div>\n    <div class=\"target-row\">\n      <span class=\"time-text\" id=\"targetLabel\">18:30</span>\n      <span class=\"day-chip\" id=\"dayLabel\">今天</span>\n      <span class=\"pick-btn\">修改</span>\n      <input type=\"time\" id=\"targetTime\" value=\"18:30\" step=\"60\" aria-label=\"想吃上饭的时间\" />\n    </div>\n  </section>\n\n  <section class=\"result\">\n    <div class=\"result-label\">现在按下预约键，设这个时长</div>\n    <div class=\"result-value\">\n      <span class=\"num\" id=\"planH\">0</span><span class=\"unit\" id=\"unitH\">小时</span>\n      <span class=\"num\" id=\"planM\">0</span><span class=\"unit\" id=\"unitM\">分钟</span>\n    </div>\n    <div class=\"result-sub\" id=\"planSub\"></div>\n    <div class=\"result-warn is-hidden\" id=\"planWarn\"></div>\n  </section>\n\n  <section class=\"card card-tip\">\n    <div><span class=\"tip-tag\">只能按 10 分钟设？</span></div>\n    <div class=\"tip-body\">\n      <span class=\"tip-value\" id=\"roundText\"></span>\n      <span class=\"tip-desc\" id=\"roundHint\"></span>\n    </div>\n  </section>\n\n  <section class=\"card\">\n    <div class=\"switch-row\">\n      <div class=\"switch-text\">\n        <div class=\"switch-title\">我的电饭煲是「几小时后开始煮」</div>\n        <div class=\"switch-desc\">多数电饭煲预约的是「几小时后煮好」，不用打开</div>\n      </div>\n      <button class=\"sw\" id=\"cookSwitch\" role=\"switch\" aria-checked=\"false\" aria-label=\"几小时后开始煮\"></button>\n    </div>\n    <div class=\"cook-block is-hidden\" id=\"cookBlock\">\n      <div class=\"cook-label\">煮饭本身需要</div>\n      <div class=\"cook-options\" id=\"cookOptions\"></div>\n      <div class=\"cook-result\" id=\"cookResult\"></div>\n    </div>\n  </section>\n\n  <div class=\"spacer\"></div>\n\n  <div class=\"actions\">\n    <button class=\"btn-main\" id=\"copyBtn\">复制预约时长</button>\n    <div class=\"footnote\" id=\"footnote\"></div>\n  </div>\n\n</main>\n\n";

(function () {
  'use strict';

  var WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  var COOK_OPTIONS = [30, 45, 60];
  var STORE_KEY = 'rice-reserve.v1';

  var state = { targetTime: '18:30', cookMode: false, cookMinutes: 45 };

  /* 记住上次的设置：多数人的饭点是固定的 */
  try {
    var saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved) {
      if (/^\d{2}:\d{2}$/.test(saved.targetTime || '')) state.targetTime = saved.targetTime;
      if (typeof saved.cookMode === 'boolean') state.cookMode = saved.cookMode;
      if (COOK_OPTIONS.indexOf(saved.cookMinutes) > -1) state.cookMinutes = saved.cookMinutes;
    }
  } catch (e) { /* 隐私模式下读不到，用默认值 */ }

  function persist() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function $(id) { return document.getElementById(id); }
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function split(total) {
    var t = Math.max(0, total);
    return { h: Math.floor(t / 60), m: t % 60 };
  }

  function fmt(total) {
    var p = split(total);
    if (p.h > 0 && p.m > 0) return p.h + ' 小时 ' + p.m + ' 分钟';
    if (p.h > 0) return p.h + ' 小时';
    return p.m + ' 分钟';
  }

  function dateLabelOf(d) {
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + WEEK[d.getDay()];
  }

  function buzz() {
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
  }

  /* 只在值真的变了才写 DOM，避免每秒无谓重排 */
  function setText(el, text) {
    if (el.textContent !== text) el.textContent = text;
  }

  function toggle(el, className, on) {
    var has = el.classList.contains(className);
    if (on && !has) el.classList.add(className);
    if (!on && has) el.classList.remove(className);
  }

  /* ---------- 构建煮饭时长选项 ---------- */
  var cookOptions = $('cookOptions');
  COOK_OPTIONS.forEach(function (min) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cook-opt';
    btn.textContent = min + ' 分钟';
    btn.dataset.min = min;
    btn.addEventListener('click', function () {
      state.cookMinutes = min;
      persist();
      buzz();
      render();
    });
    cookOptions.appendChild(btn);
  });

  /* ---------- 交互 ---------- */
  var timeInput = $('targetTime');
  timeInput.value = state.targetTime;

  timeInput.addEventListener('input', function (e) {
    if (!e.target.value) return;
    state.targetTime = e.target.value;
    persist();
    render();
  });

  timeInput.addEventListener('click', function () {
    if (typeof this.showPicker === 'function') {
      try { this.showPicker(); } catch (e) { /* 需用户手势，忽略 */ }
    }
  });

  $('cookSwitch').addEventListener('click', function () {
    state.cookMode = !state.cookMode;
    persist();
    buzz();
    render();
  });

  $('copyBtn').addEventListener('click', function () {
    var btn = $('copyBtn');
    var text = state.cookMode && last.start > 0
      ? '预约 ' + last.startText + '，' + last.startAt + ' 开始煮'
      : '预约 ' + last.planText + '（目标 ' + last.dayLabel + ' ' + state.targetTime + '）';

    function done(ok) {
      var original = '复制预约时长';
      btn.textContent = ok ? '已复制' : '复制失败，长按手动复制';
      setTimeout(function () { btn.textContent = original; }, 1600);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
    } else {
      fallback();
    }

    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      done(ok);
    }
  });

  /* ---------- 渲染 ---------- */
  var last = { planText: '', startText: '', startAt: '', start: 0, dayLabel: '今天' };

  function render() {
    var now = new Date();

    setText($('clock'), pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds()));
    setText($('dateText'), dateLabelOf(now));

    var parts = String(state.targetTime).split(':');
    var th = Number(parts[0]) || 0;
    var tm = Number(parts[1]) || 0;

    var target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), th, tm, 0, 0);
    var dayLabel = '今天';
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
      dayLabel = '明天';
    }

    /* 向上取整到分钟：饭晚几十秒没事，早就是夹生 */
    var total = Math.ceil((target.getTime() - now.getTime()) / 60000);
    var p = split(total);

    setText($('targetLabel'), state.targetTime);
    if (timeInput.value !== state.targetTime) timeInput.value = state.targetTime;
    setText($('dayLabel'), dayLabel);

    /* 主结果：0 小时就不显示小时位 */
    var showH = p.h > 0;
    var showM = p.m > 0 || !showH;
    setText($('planH'), String(p.h));
    setText($('planM'), String(p.m));
    $('planH').style.display = showH ? '' : 'none';
    $('unitH').style.display = showH ? '' : 'none';
    $('planM').style.display = showM ? '' : 'none';
    $('unitM').style.display = showM ? '' : 'none';

    setText($('planSub'), '共 ' + total + ' 分钟 · 目标 ' + dayLabel + ' ' + state.targetTime);

    var warn = '';
    if (total <= 15) {
      warn = '距目标只剩 ' + total + ' 分钟，基本等于现在就按开始煮。';
    } else if (total > 720) {
      warn = '超过 12 小时。多数电饭煲最大预约 24 小时，米泡太久也会影响口感。';
    }
    var warnEl = $('planWarn');
    setText(warnEl, warn);
    toggle(warnEl, 'is-hidden', !warn);

    /* 步进建议：跟主值同方向取整 */
    var roundTotal = Math.ceil(total / 10) * 10;
    var delta = roundTotal - total;
    setText($('roundText'), fmt(roundTotal));
    setText($('roundHint'), delta === 0 ? '正好是整 10 分钟，直接设就行' : '比目标时间晚 ' + delta + ' 分钟好');

    /* 起煮模式 */
    var on = state.cookMode;
    toggle($('cookBlock'), 'is-hidden', !on);
    toggle($('cookSwitch'), 'on', on);
    $('cookSwitch').setAttribute('aria-checked', on ? 'true' : 'false');

    Array.prototype.forEach.call(cookOptions.children, function (el) {
      toggle(el, 'on', Number(el.dataset.min) === state.cookMinutes);
    });

    var startTotal = total - state.cookMinutes;
    var cookResult = $('cookResult');
    if (startTotal > 0) {
      var startAt = new Date(target.getTime() - state.cookMinutes * 60000);
      var startAtText = pad2(startAt.getHours()) + ':' + pad2(startAt.getMinutes());
      cookResult.className = 'cook-result';
      cookResult.innerHTML = '预约 <span class="hl">' + fmt(startTotal) + '</span>，' + startAtText + ' 开始煮';
      last.start = startTotal;
      last.startText = fmt(startTotal);
      last.startAt = startAtText;
    } else {
      cookResult.className = 'cook-result is-warn';
      cookResult.textContent = '剩余时间不够煮饭，把目标时间往后挪一点';
      last.start = 0;
    }

    setText($('footnote'),
      '目标 ' + dateLabelOf(target) + ' ' + state.targetTime + '\n已过的时间会自动算到明天');

    last.planText = fmt(total);
    last.dayLabel = dayLabel;
  }

  render();
  setInterval(render, 1000);

  /* 从后台切回来立刻刷新，别显示过期时间 */
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) render();
  });
})();
