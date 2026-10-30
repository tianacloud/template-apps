import { createTianaFetch } from '@tianacloud/serverless';
export async function mount(root, { files }) {
  root.style.color = '#fff';
  root.style.fontFamily = "'Noto Sans SC', sans-serif";
  let fontError = false;
  try {
    for (const [name,path] of [['Orbitron','template-assets/fonts/orbitron.woff2'], ['Noto Sans SC','template-assets/fonts/noto-sans-sc.woff2']]) {
      const response = await files.get(path);
      if (!response.ok) throw new Error('字体读取失败');
      const face = new FontFace(name, await response.arrayBuffer(), {weight:'100 900'});
      document.fonts.add(await face.load());
    }
  } catch (e) { fontError = true; console.error('字体加载失败', e); }
const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('./style.css', import.meta.url); document.head.appendChild(css);
root.innerHTML = "\n\n<!-- 粒子背景 -->\n<canvas id=\"particles\"></canvas>\n\n<!-- 渐变光晕 -->\n<div class=\"bg-glow top\"></div>\n<div class=\"bg-glow bottom\"></div>\n\n<!-- 设置按钮 -->\n<button class=\"settings-btn\" id=\"settingsBtn\" title=\"设置\">⚙</button>\n\n<!-- 主卡片 -->\n<div class=\"container\">\n  <div class=\"card\">\n\n    <!-- 状态标签 -->\n    <div class=\"status-badge\" id=\"statusBadge\">💼 工作中</div>\n\n    <!-- 环形进度 -->\n    <div class=\"progress-ring-wrap\">\n      <svg class=\"progress-ring\" viewBox=\"0 0 240 240\">\n        <defs>\n          <linearGradient id=\"progressGradient\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">\n            <stop offset=\"0%\" stop-color=\"#6c5ce7\" />\n            <stop offset=\"50%\" stop-color=\"#a29bfe\" />\n            <stop offset=\"100%\" stop-color=\"#00cec9\" />\n          </linearGradient>\n        </defs>\n        <circle class=\"bg-circle\" cx=\"120\" cy=\"120\" r=\"108\" />\n        <circle class=\"fg-circle\" id=\"progressCircle\" cx=\"120\" cy=\"120\" r=\"108\"\n                stroke-dasharray=\"678.584\" stroke-dashoffset=\"678.584\" />\n        <circle class=\"pulse-circle\" id=\"pulseCircle\" cx=\"120\" cy=\"120\" r=\"108\"\n                stroke-dasharray=\"678.584\" />\n      </svg>\n      <div class=\"progress-inner\">\n        <div class=\"progress-percent\" id=\"progressPercent\">0%</div>\n        <div class=\"progress-label\">今日进度</div>\n      </div>\n    </div>\n\n    <!-- 倒计时 -->\n    <div class=\"countdown\" id=\"countdown\">--:--:--</div>\n    <div class=\"countdown-label\">距 离 下 班</div>\n\n    <!-- 时间信息 -->\n    <div class=\"time-info\">\n      <div class=\"time-info-item\">\n        <div class=\"time-info-value\" id=\"currentTime\">--:--</div>\n        <div class=\"time-info-label\">当前时间</div>\n      </div>\n      <div class=\"time-info-item\">\n        <div class=\"time-info-value\" id=\"workStartTime\">09:00</div>\n        <div class=\"time-info-label\">上班时间</div>\n      </div>\n      <div class=\"time-info-item\">\n        <div class=\"time-info-value\" id=\"workEndTime\">18:00</div>\n        <div class=\"time-info-label\">下班时间</div>\n      </div>\n    </div>\n\n    <!-- 语录 -->\n    <div class=\"quote\" id=\"quote\"></div>\n  </div>\n</div>\n\n<!-- 设置面板 -->\n<div class=\"settings-overlay\" id=\"settingsOverlay\">\n  <div class=\"settings-panel\">\n    <div class=\"settings-title\">\n      ⚙️ 时间设置\n      <button class=\"settings-close\" id=\"settingsClose\">✕</button>\n    </div>\n\n    <div class=\"setting-group\">\n      <label class=\"setting-label\">⏰ 上班时间</label>\n      <input type=\"time\" class=\"setting-input\" id=\"inputStartTime\" value=\"09:00\">\n    </div>\n\n    <div class=\"setting-group\">\n      <label class=\"setting-label\">🏃 下班时间</label>\n      <input type=\"time\" class=\"setting-input\" id=\"inputEndTime\" value=\"18:00\">\n    </div>\n\n    <div class=\"setting-group\">\n      <label class=\"setting-label\">📅 工作日</label>\n      <div class=\"weekday-grid\" id=\"weekdayGrid\">\n        <button class=\"weekday-btn active\" data-day=\"1\">一</button>\n        <button class=\"weekday-btn active\" data-day=\"2\">二</button>\n        <button class=\"weekday-btn active\" data-day=\"3\">三</button>\n        <button class=\"weekday-btn active\" data-day=\"4\">四</button>\n        <button class=\"weekday-btn active\" data-day=\"5\">五</button>\n        <button class=\"weekday-btn\" data-day=\"6\">六</button>\n        <button class=\"weekday-btn\" data-day=\"0\">日</button>\n      </div>\n    </div>\n\n    <!-- 日签管理 -->\n    <div class=\"quote-manager\">\n      <div class=\"quote-manager-title\">📝 日签管理</div>\n      <div class=\"quote-tabs\" id=\"quoteTabs\">\n        <button class=\"quote-tab active\" data-status=\"working\">💼 工作中</button>\n        <button class=\"quote-tab\" data-status=\"soon\">🔥 即将下班</button>\n        <button class=\"quote-tab\" data-status=\"off\">🎉 已下班</button>\n        <button class=\"quote-tab\" data-status=\"before\">🌅 上班前</button>\n        <button class=\"quote-tab\" data-status=\"weekend\">🌴 休息日</button>\n      </div>\n      <div class=\"quote-list\" id=\"quoteList\"></div>\n      <div class=\"quote-add-row\">\n        <input class=\"quote-add-input\" id=\"quoteAddInput\" placeholder=\"输入新的日签语录...\" maxlength=\"50\">\n        <button class=\"quote-add-btn\" id=\"quoteAddBtn\">＋ 添加</button>\n      </div>\n      <div class=\"quote-hint\" id=\"quoteHint\">留空时将使用默认语录</div>\n    </div>\n\n    <div class=\"setting-actions\">\n      <button class=\"btn btn-ghost\" id=\"resetBtn\">恢复默认</button>\n      <button class=\"btn btn-primary\" id=\"saveBtn\">保存设置</button>\n    </div>\n  </div>\n</div>\n\n";

if (fontError) { const notice = document.createElement('div'); notice.textContent = '字体加载失败，正在使用系统字体'; Object.assign(notice.style, {position:'fixed',bottom:'8px',left:'8px',zIndex:'9999',color:'white'}); root.appendChild(notice); }

(function() {
  // ==================== 配置 ====================
  const CIRCUMFERENCE = 2 * Math.PI * 108; // ~678.584

  const QUOTES = {
    working: [
      '认真搞钱，准时下班 💰',
      '每一行代码都在为下班倒计时 ⏳',
      '坚持就是胜利，下班就在前方 🚀',
      '今天的努力，是为了明天更好地摸鱼 🐟',
      '打工人的一天，从倒计时开始 ☕',
      'Focus on work, dream of freedom ✨',
      '效率拉满，准点下班不是梦 🎯',
    ],
    soon: [
      '自由的气息越来越近了 🌈',
      '最后冲刺！胜利在望 🏁',
      '准备收拾东西，姿势要帅 😎',
      '还有一小会儿，坚持住！💪',
      '已经开始脑补今晚的安排了吧 🎮',
    ],
    off: [
      '下班快乐！享受自由时光 🎉',
      '今日电量耗尽，明日再战 🔋',
      '去生活，去热爱，去撒野 🌟',
      '工作是为了生活，现在去生活吧 🌿',
      '自由模式已开启 🎊',
      '恭喜你，又活过了一天 🏆',
    ],
    before: [
      '距离上班还有一会儿，再躺躺 🛌',
      '早起的打工人有...班要上 😴',
      '先来杯咖啡提提神吧 ☕',
      '新的一天，新的搬砖 🧱',
    ],
    weekend: [
      '周末快乐！今天不搬砖 🎊',
      '休息日，尽情享受吧 🌴',
      '关机，出门，晒太阳去 ☀️',
      '周末不设闹钟，这是基本人权 🛏️',
    ]
  };

  // ==================== 状态 ====================
  let settings = {
    startTime: '09:00',
    endTime: '18:00',
    workDays: [1, 2, 3, 4, 5],
    customQuotes: { working:[], soon:[], off:[], before:[], weekend:[] },
  };

  let sqlFetch, dbOrigin;
  async function execute(sql, args = []) {
    const response = await sqlFetch(`${dbOrigin}/v3/pipeline`, {
      method: 'POST', headers: {'content-type': 'application/json'},
      body: JSON.stringify({requests: [{type:'execute', stmt:{sql, args, want_rows:true}}, {type:'close'}]})
    });
    if (!response.ok) throw new Error('数据库请求结果未知，请重新打开应用核对');
    const body = await response.json();
    const result = body.results?.[0];
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库操作失败，请重新打开应用核对');
    return result.response.result;
  }
  async function loadSettings() {
    const auth = window.tiana?.auth;
    if (typeof auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw new Error('数据库连接未就绪');
    const connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw new Error('暂不支持当前数据库协议');
    dbOrigin = connection.origin;
    sqlFetch = createTianaFetch({origin:dbOrigin, auth, requestBodyMode:'buffered'});
    const result = await execute('SELECT value FROM countdown_settings WHERE id = 1');
    if (result.rows?.length) settings = {...settings, ...JSON.parse(result.rows[0][0].value)};
  }

  // 合并默认语录和自定义语录：自定义的排前面
  function getMergedQuotes() {
    const merged = {};
    for (const key of Object.keys(QUOTES)) {
      const custom = settings.customQuotes?.[key] || [];
      merged[key] = custom.length > 0 ? custom : QUOTES[key];
    }
    return merged;
  }

  // ==================== DOM 引用 ====================
  const $ = (id) => document.getElementById(id);
  const countdownEl = $('countdown');
  const progressCircle = $('progressCircle');
  const pulseCircle = $('pulseCircle');
  const progressPercentEl = $('progressPercent');
  const statusBadge = $('statusBadge');
  const quoteEl = $('quote');
  const currentTimeEl = $('currentTime');
  const workStartEl = $('workStartTime');
  const workEndEl = $('workEndTime');
  const settingsOverlay = $('settingsOverlay');
  const inputStart = $('inputStartTime');
  const inputEnd = $('inputEndTime');
  const weekdayGrid = $('weekdayGrid');

  // ==================== 粒子系统 ====================
  const canvas = $('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let particleCount = 60;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height;
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -10;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedY = Math.random() * 0.4 + 0.15;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.6 + 0.1;
      this.hue = Math.random() < 0.5 ? 260 : 180;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      if (this.y > canvas.height + 10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 70%, 65%, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    const p = new Particle();
    p.y = Math.random() * canvas.height; // distribute across canvas
    particles.push(p);
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });

    // 连线（近距离粒子之间）
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108, 92, 231, ${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // ==================== 核心逻辑 ====================
  function parseTime(str) {
    const [h, m] = str.split(':').map(Number);
    return { hours: h, minutes: m };
  }

  function getTimeInMinutes(hours, minutes) {
    return hours * 60 + minutes;
  }

  function getStatus() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1=Mon...
    const currentMinutes = getTimeInMinutes(now.getHours(), now.getMinutes());

    if (!settings.workDays.includes(day)) return 'weekend';

    const start = parseTime(settings.startTime);
    const end = parseTime(settings.endTime);
    const startMin = getTimeInMinutes(start.hours, start.minutes);
    const endMin = getTimeInMinutes(end.hours, end.minutes);

    if (currentMinutes < startMin) return 'before';
    if (currentMinutes >= endMin) return 'off';

    const totalWork = endMin - startMin;
    const worked = currentMinutes - startMin;
    const remaining = endMin - currentMinutes;

    if (remaining <= 30) return 'soon';
    return 'working';
  }

  function getRemainingSeconds() {
    const now = new Date();
    const end = parseTime(settings.endTime);
    const endDate = new Date(now);
    endDate.setHours(end.hours, end.minutes, 0, 0);
    return Math.max(0, Math.floor((endDate - now) / 1000));
  }

  function getProgress() {
    const now = new Date();
    const day = now.getDay();
    const currentMinutes = getTimeInMinutes(now.getHours(), now.getMinutes());

    const start = parseTime(settings.startTime);
    const end = parseTime(settings.endTime);
    const startMin = getTimeInMinutes(start.hours, start.minutes);
    const endMin = getTimeInMinutes(end.hours, end.minutes);

    if (!settings.workDays.includes(day)) return 0;
    if (currentMinutes < startMin) return 0;
    if (currentMinutes >= endMin) return 1;

    return (currentMinutes - startMin) / (endMin - startMin);
  }

  function formatCountdown(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function getRandomQuote(status) {
    const quotes = getMergedQuotes();
    const arr = quotes[status] || quotes.working;
    if (!arr.length) return '💪';
    return arr[Math.floor(Math.random() * arr.length)];
  }

  let lastQuote = '';
  function updateQuote(status) {
    const quotes = getMergedQuotes();
    const pool = quotes[status] || quotes.working;
    if (!pool.length) { lastQuote = ''; return '💪'; }
    let q;
    do { q = getRandomQuote(status); } while (q === lastQuote && pool.length > 1);
    lastQuote = q;
    return q;
  }

  let prevStatus = '';

  function updateUI() {
    const now = new Date();
    const status = getStatus();
    const remaining = getRemainingSeconds();
    const progress = getProgress();
    const day = now.getDay();

    // 更新时间显示
    currentTimeEl.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    workStartEl.textContent = settings.startTime;
    workEndEl.textContent = settings.endTime;

    // 状态标签
    statusBadge.className = 'status-badge';
    if (status === 'working') { statusBadge.classList.add('status-working'); statusBadge.textContent = '💼 工作中'; }
    else if (status === 'soon') { statusBadge.classList.add('status-soon'); statusBadge.textContent = '🔥 即将下班'; }
    else if (status === 'off') { statusBadge.classList.add('status-off'); statusBadge.textContent = '🎉 已下班'; }
    else if (status === 'before') { statusBadge.classList.add('status-before'); statusBadge.textContent = '🌅 上班前'; }
    else { statusBadge.classList.add('status-off'); statusBadge.textContent = '🌴 休息日'; }

    // 倒计时
    if (status === 'weekend' || status === 'off' || status === 'before') {
      countdownEl.textContent = status === 'weekend' ? '🎉🎉🎉' : '--:--:--';
      countdownEl.className = 'countdown';
    } else {
      countdownEl.textContent = formatCountdown(remaining);
      if (status === 'soon') countdownEl.className = 'countdown urgent';
      else countdownEl.className = 'countdown soon';
    }

    // 环形进度
    const offset = CIRCUMFERENCE * (1 - progress);
    progressCircle.setAttribute('stroke-dashoffset', offset);
    progressPercentEl.textContent = Math.round(progress * 100) + '%';

    // 脉冲动画
    if (status === 'soon') pulseCircle.classList.add('active');
    else pulseCircle.classList.remove('active');

    // 语录
    if (status !== prevStatus) {
      quoteEl.textContent = updateQuote(status);
      quoteEl.style.opacity = '0';
      setTimeout(() => { quoteEl.style.opacity = '0.8'; }, 100);
    }
    prevStatus = status;

    // 背景动态
    updateBackground(status, now);
  }

  function updateBackground(status, now) {
    const bgGlowTop = document.querySelector('.bg-glow.top');
    const bgGlowBottom = document.querySelector('.bg-glow.bottom');
    const hour = now.getHours();

    if (status === 'weekend') {
      document.body.style.background = '#0a1628';
      bgGlowTop.style.background = 'radial-gradient(circle, #00cec9 0%, transparent 70%)';
      bgGlowBottom.style.background = 'radial-gradient(circle, #fd79a8 0%, transparent 70%)';
    } else if (status === 'off') {
      document.body.style.background = '#0a0a1a';
      bgGlowTop.style.background = 'radial-gradient(circle, #00cec9 0%, transparent 70%)';
      bgGlowBottom.style.background = 'radial-gradient(circle, #a29bfe 0%, transparent 70%)';
    } else if (status === 'soon') {
      document.body.style.background = '#1a0a2e';
      bgGlowTop.style.background = 'radial-gradient(circle, #fd79a8 0%, transparent 70%)';
      bgGlowBottom.style.background = 'radial-gradient(circle, #fdcb6e 0%, transparent 70%)';
    } else {
      // morning: cool blue tone, afternoon: warm purple
      if (hour < 12) {
        document.body.style.background = '#0a0a1a';
        bgGlowTop.style.background = 'radial-gradient(circle, #6c5ce7 0%, transparent 70%)';
        bgGlowBottom.style.background = 'radial-gradient(circle, #74b9ff 0%, transparent 70%)';
      } else {
        document.body.style.background = '#0d0a1a';
        bgGlowTop.style.background = 'radial-gradient(circle, #a29bfe 0%, transparent 70%)';
        bgGlowBottom.style.background = 'radial-gradient(circle, #00cec9 0%, transparent 70%)';
      }
    }
  }

  // ==================== 设置面板 ====================
  let currentQuoteTab = 'working';

  function renderQuoteList() {
    const listEl = $('quoteList');
    const hintEl = $('quoteHint');
    const quotes = settings.customQuotes?.[currentQuoteTab] || [];
    const defaults = QUOTES[currentQuoteTab] || [];

    if (quotes.length === 0) {
      listEl.innerHTML = '<div class="quote-empty">使用默认语录（共 ' + defaults.length + ' 条）</div>';
      hintEl.textContent = '添加自定义语录后将替代默认语录';
    } else {
      listEl.innerHTML = quotes.map((q, i) => `
        <div class="quote-item">
          <span class="quote-text">${escapeHtml(q)}</span>
          <button class="quote-del" data-index="${i}" title="删除">✕</button>
        </div>
      `).join('');
      hintEl.textContent = '自定义 ' + quotes.length + ' 条（随机轮播）';
    }

    // 绑定删除事件
    listEl.querySelectorAll('.quote-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        settings.customQuotes[currentQuoteTab].splice(idx, 1);
        renderQuoteList();
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function openSettings() {
    inputStart.value = settings.startTime;
    inputEnd.value = settings.endTime;
    // 更新工作日按钮状态
    weekdayGrid.querySelectorAll('.weekday-btn').forEach(btn => {
      const day = parseInt(btn.dataset.day);
      btn.classList.toggle('active', settings.workDays.includes(day));
    });
    // 渲染语录列表
    currentQuoteTab = 'working';
    $('quoteTabs').querySelectorAll('.quote-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.status === currentQuoteTab);
    });
    renderQuoteList();
    $('quoteAddInput').value = '';
    settingsOverlay.classList.add('open');
  }

  function closeSettings() {
    settingsOverlay.classList.remove('open');
  }

  async function saveSettings() {
    settings.startTime = inputStart.value;
    settings.endTime = inputEnd.value;
    settings.workDays = Array.from(weekdayGrid.querySelectorAll('.weekday-btn.active'))
      .map(btn => parseInt(btn.dataset.day));
    // customQuotes 已经实时在 settings 中更新
    $('saveBtn').disabled = true;
    try {
      await execute('INSERT INTO countdown_settings (id, value) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value', [{type:'text', value:JSON.stringify(settings)}]);
    } catch (e) { alert(e.message); return; }
    finally { $('saveBtn').disabled = false; }
    prevStatus = ''; // 强制刷新语录
    updateUI();
    closeSettings();
  }

  function resetSettings() {
    settings = {
      startTime: '09:00',
      endTime: '18:00',
      workDays: [1,2,3,4,5],
      customQuotes: { working:[], soon:[], off:[], before:[], weekend:[] },
    };
    inputStart.value = '09:00';
    inputEnd.value = '18:00';
    weekdayGrid.querySelectorAll('.weekday-btn').forEach(btn => {
      const day = parseInt(btn.dataset.day);
      btn.classList.toggle('active', [1,2,3,4,5].includes(day));
    });
    currentQuoteTab = 'working';
    $('quoteTabs').querySelectorAll('.quote-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.status === currentQuoteTab);
    });
    renderQuoteList();
    $('quoteAddInput').value = '';
    saveSettings();
  }

  // 事件绑定
  $('settingsBtn').addEventListener('click', openSettings);
  $('settingsClose').addEventListener('click', closeSettings);
  settingsOverlay.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) closeSettings();
  });
  $('saveBtn').addEventListener('click', saveSettings);
  $('resetBtn').addEventListener('click', resetSettings);

  weekdayGrid.querySelectorAll('.weekday-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.classList.toggle('active'));
  });

  // 日签管理：Tab 切换
  $('quoteTabs').querySelectorAll('.quote-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $('quoteTabs').querySelectorAll('.quote-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentQuoteTab = tab.dataset.status;
      renderQuoteList();
      $('quoteAddInput').value = '';
    });
  });

  // 日签管理：添加语录
  function addQuote() {
    const input = $('quoteAddInput');
    const text = input.value.trim();
    if (!text) return;
    if (!settings.customQuotes[currentQuoteTab]) settings.customQuotes[currentQuoteTab] = [];
    settings.customQuotes[currentQuoteTab].push(text);
    input.value = '';
    renderQuoteList();
    input.focus();
  }
  $('quoteAddBtn').addEventListener('click', addQuote);
  $('quoteAddInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addQuote();
  });

  // 键盘快捷键: ESC 关闭设置
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSettings();
  });

  // 防抖：窗口大小变化时更新粒子
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 150);
  });

  // ==================== 启动 ====================
  $('settingsBtn').disabled = true;
  loadSettings().then(() => { updateUI(); $('settingsBtn').disabled = false; }).catch(e => { alert(e.message); });
  updateUI();
  setInterval(updateUI, 1000);

  console.log('%c🏃 下班倒计时已就绪 %c| %cMade with ❤️',
    'font-size:16px;', '', 'color:#a29bfe;');
})();

}
