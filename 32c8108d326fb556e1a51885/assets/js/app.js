import { execute } from './db.js';
/* ============================================================
   随机设计生成器 · app.js
   词库 + 随机引擎 + 交互（重掷 / 锁定 / 任务书 / 历史 / 收藏）
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 词库 ---------- */
  var LIBRARY = {
    categories: [
      { name: '移动 App', subs: ['社交', '工具', '内容社区', '电商', '健康', '教育', '音乐', '旅行', '摄影', '效率'] },
      { name: '网页应用', subs: ['仪表盘', '协作工具', '在线编辑器', '数据可视化', '项目管理', '客服系统', '云盘', '表单收集'] },
      { name: '微信小程序', subs: ['电商', '点餐', '工具', '内容', '服务预约', '会员管理', '投票', '打卡'] },
      { name: '桌面软件', subs: ['效率工具', '开发工具', '设计工具', '媒体播放', '系统优化', '笔记', '下载管理', '截图标注'] },
      { name: '落地页', subs: ['产品发布', '活动报名', '应用下载', '课程销售', '企业招商', 'SaaS 试用', '众筹'] },
      { name: '企业官网', subs: ['品牌展示', '产品介绍', '解决方案', '客户案例', '招聘', '新闻中心', '关于我们'] },
      { name: '电商网站', subs: ['综合商城', '垂直品类', '二手交易', '生鲜', '跨境', '团购', '拍卖', '订阅制'] },
      { name: '数据仪表盘', subs: ['运营监控', '销售分析', '用户行为', '财务报表', '物联网', 'BI 报表', '库存', '风控'] },
      { name: '社交平台', subs: ['兴趣社区', '匿名社交', '语音房', '论坛', '短视频', '活动组队', '校友录'] },
      { name: '在线教育', subs: ['语言学习', '编程', 'K12', '职业培训', '考证', '知识付费', '科普', '书法绘画'] },
      { name: '医疗健康', subs: ['挂号问诊', '健康档案', '运动健身', '心理健康', '慢病管理', '营养饮食', '睡眠', '经期'] },
      { name: '金融理财', subs: ['记账', '投资', '保险', '借贷', '税务', '行情', '养老金', '账单管理'] },
      { name: '旅游出行', subs: ['攻略', '行程规划', '机票酒店', '当地玩乐', '地图导航', '露营骑行', '签证', '翻译'] },
      { name: '美食菜谱', subs: ['菜谱库', '外卖点餐', '食材配送', '探店', '营养配餐', '烹饪教学', '酒水', '烘焙'] },
      { name: '摄影修图', subs: ['相机滤镜', '图片编辑', '拼图', '证件照', '云相册', 'AI 绘画', '延时摄影'] },
      { name: '视频剪辑', subs: ['短视频剪辑', '字幕', '特效', '录屏', '直播', '素材库', '分镜'] },
      { name: '音乐音频', subs: ['播放器', '电台', '播客', 'K歌', '乐器教学', '白噪音', '乐谱', '混音'] },
      { name: '阅读资讯', subs: ['电子书', '新闻聚合', '漫画', '杂志', '有声书', 'RSS', '文库', '书摘'] },
      { name: '待办效率', subs: ['任务管理', '日程', '笔记', '习惯打卡', '番茄钟', '思维导图', '目标', '复盘'] },
      { name: '智能家居', subs: ['设备控制', '场景联动', '能耗管理', '安防', '家庭影院', '语音助手', '园艺', '宠物喂食'] },
      { name: '游戏界面', subs: ['消除', '卡牌', 'RPG', '休闲', '棋盘', '射击 HUD', '模拟经营', '音游'] },
      { name: '企业后台', subs: ['用户管理', '权限', '订单', '内容审核', '工作流', '日志', '配置', '消息推送'] },
      { name: '招聘求职', subs: ['职位匹配', '简历', '内推', '校招', '自由职业', '人才库', '面试', '薪资查询'] },
      { name: '房产家居', subs: ['租房', '买房', '二手房', '装修', '民宿', '物业', '搬家', '房贷计算'] },
      { name: '宠物生活', subs: ['社区', '电商', '寄养', '医疗', '训练', '智能设备', '领养', '遛狗记录'] }
    ],
    users: ['Z 世代', '职场新人', '宝妈', '银发族', '大学生', '自由职业者', '铲屎官', '二次元', '健身党', '差旅达人', '小老板', '夜猫子'],
    features: ['语音输入优先', '离线可用', '深色模式', '手势操作', '桌面小组件', '分享卡片', 'AR 预览', 'AI 助手', '扫码直达', '日历联动', '多人协作', '数据导出'],
    styles: ['极简', '酸性设计', '新中式', '复古像素', '玻璃拟态', '暗黑霓虹', '手绘温暖', '瑞士国际主义', '孟菲斯', '日式侘寂', '赛博朋克', '极繁主义'],
    challenges: ['只能用一个主色', '去掉所有按钮改用语音', '首屏不许出现文字', '只用插画不用照片', '深色模式优先', '无障碍优先', '所有动效不超过 0.2 秒', '首屏加载小于 1 秒', '全站不用图标', '圆角不超过 4px', '必须支持全键盘操作', '文案不超过 20 字']
  };

  var DIMS = [
    { key: 'cat', num: '01', name: '大种类', hint: '点击重掷' },
    { key: 'sub', num: '02', name: '细分方向', hint: '在大类下重摇' },
    { key: 'user', num: '03', name: '目标用户', hint: '点击重掷' },
    { key: 'feature', num: '04', name: '核心功能', hint: '点击重掷' },
    { key: 'style', num: '05', name: '风格基调', hint: '点击重掷' },
    { key: 'challenge', num: '06', name: '魔鬼挑战', hint: '点击重掷' }
  ];

  var ORDER = ['cat', 'sub', 'user', 'feature', 'style', 'challenge'];
  var DOT_COLORS = ['#4CC9F0', '#AEB8FF', '#F471B5', '#34D399', '#8B9CFF', '#F2F5FF'];
  var CONFETTI_COLORS = ['#7C6CFF', '#4CC9F0', '#F471B5', '#F2F5FF', '#34D399'];

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 状态 ---------- */
  var state = {
    values: { cat: null, sub: null, user: null, feature: null, style: null, challenge: null },
    locked: {},
    history: [],
    favs: [],
    activeTab: 'recent'
  };

  var cardEls = {};

  /* ---------- 工具 ---------- */
  function $(id) { return document.getElementById(id); }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function pickDifferent(arr, current) {
    if (!arr || arr.length < 2) return pick(arr);
    var next = pick(arr), guard = 0;
    while (next === current && guard++ < 10) next = pick(arr);
    return next;
  }

  function catByName(name) {
    for (var i = 0; i < LIBRARY.categories.length; i++) {
      if (LIBRARY.categories[i].name === name) return LIBRARY.categories[i];
    }
    return LIBRARY.categories[0];
  }

  function poolOf(key) {
    if (key === 'cat') return LIBRARY.categories.map(function (c) { return c.name; });
    if (key === 'sub') return catByName(state.values.cat).subs;
    if (key === 'user') return LIBRARY.users;
    if (key === 'feature') return LIBRARY.features;
    if (key === 'style') return LIBRARY.styles;
    return LIBRARY.challenges;
  }

  function briefText() {
    var v = state.values;
    return '给「' + v.user + '」设计一款「' + v.cat + ' · ' + v.sub + '」方向的产品，整体走「' + v.style +
      '」路线，核心功能是「' + v.feature + '」，并且必须完成挑战：「' + v.challenge + '」。开干吧！';
  }

  function comboKey(v) { return [v.cat, v.sub, v.user, v.feature, v.style, v.challenge].join('|'); }

  function nowLabel() {
    var d = new Date();
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(d.getHours()) + ':' + p(d.getMinutes());
  }

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  /* ---------- 渲染：维度卡 ---------- */
  var ICON_LOCK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2.5" stroke="currentColor" stroke-width="2"/><path d="M8.5 11V7.5a3.5 3.5 0 0 1 7 0V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function buildCards() {
    var grid = $('dimGrid');
    grid.innerHTML = '';
    DIMS.forEach(function (d) {
      var card = document.createElement('article');
      card.className = 'dim-card';
      card.dataset.key = d.key;

      var top = document.createElement('div');
      top.className = 'dim-top';

      var label = document.createElement('span');
      label.className = 'dim-label';
      var num = document.createElement('span');
      num.className = 'dim-num';
      num.textContent = d.num;
      var name = document.createElement('span');
      name.textContent = d.name;
      label.appendChild(num);
      label.appendChild(name);

      var lock = document.createElement('button');
      lock.type = 'button';
      lock.className = 'lock-btn';
      lock.innerHTML = ICON_LOCK;
      lock.setAttribute('aria-label', '锁定' + d.name);
      lock.setAttribute('aria-pressed', 'false');
      lock.addEventListener('click', function (ev) {
        ev.stopPropagation();
        toggleLock(d.key);
      });

      top.appendChild(label);
      top.appendChild(lock);

      var value = document.createElement('button');
      value.type = 'button';
      value.className = 'dim-value';
      value.setAttribute('aria-label', d.name + '，点击重掷');
      value.addEventListener('click', function () { rollOne(d.key); });

      var hint = document.createElement('p');
      hint.className = 'dim-hint';
      hint.textContent = d.hint;

      card.appendChild(top);
      card.appendChild(value);
      card.appendChild(hint);
      grid.appendChild(card);

      cardEls[d.key] = { card: card, value: value, lock: lock };
    });
  }

  function updateCardUI(key) {
    var el = cardEls[key];
    if (!el) return;
    el.value.textContent = state.values[key];
    var locked = !!state.locked[key];
    el.card.classList.toggle('locked', locked);
    el.lock.classList.toggle('locked', locked);
    el.lock.setAttribute('aria-pressed', locked ? 'true' : 'false');
    el.lock.setAttribute('aria-label', (locked ? '解锁' : '锁定') + DIMS.filter(function (d) { return d.key === key; })[0].name);
  }

  function updateAllCards() { ORDER.forEach(updateCardUI); }

  function rollValue(key, animate) {
    var el = cardEls[key];
    var finalValue = state.values[key];
    if (!animate || REDUCED || !el) { if (el) el.value.textContent = finalValue; return; }
    var pool = poolOf(key);
    el.value.classList.add('rolling');
    var ticks = 0;
    var timer = setInterval(function () {
      el.value.textContent = pick(pool);
      ticks++;
      if (ticks >= 10) {
        clearInterval(timer);
        el.value.textContent = finalValue;
        el.value.classList.remove('rolling');
        el.value.classList.add('pop');
        setTimeout(function () { el.value.classList.remove('pop'); }, 320);
      }
    }, 55);
  }

  function roll(key) {
    state.values[key] = pickDifferent(poolOf(key), state.values[key]);
  }

  function rollOne(key) {
    roll(key);
    if (key === 'cat' && !state.locked.sub) roll('sub');
    afterChange(true);
  }

  function rollAll() {
    var seq = ORDER.filter(function (k) { return !state.locked[k]; });
    seq.forEach(function (k, i) {
      setTimeout(function () {
        roll(k);
        rollValue(k, true);
        updateCardUI(k);
        if (i === seq.length - 1) afterChange(true);
      }, REDUCED ? 0 : i * 90);
    });
    if (!REDUCED && seq.length) confettiBurst();
    if (!seq.length) toast('所有维度都已锁定，先解锁一个吧');

  }

  function afterChange(record) {
    updateAllCards();
    updateBrief();
    updateFavButton();
    if (record) pushHistory();
    else saveState();
  }

  function updateBrief() { $('briefBody').textContent = briefText(); }

  function toggleLock(key) {
    if (state.locked[key]) delete state.locked[key];
    else state.locked[key] = true;
    updateCardUI(key);
    saveState();
    toast(state.locked[key] ? '已锁定「' + state.values[key] + '」' : '已解锁，可以重掷了');
  }

  /* ---------- 收藏 ---------- */
  function currentFavIndex() {
    var key = comboKey(state.values);
    return state.favs.findIndex(function (f) { return comboKey(f) === key; });
  }

  function updateFavButton() {
    var btn = $('favBrief');
    var faved = currentFavIndex() > -1;
    btn.classList.toggle('active', faved);
    btn.setAttribute('aria-pressed', faved ? 'true' : 'false');
    $('favLabel').textContent = faved ? '已收藏' : '收藏';
  }

  function toggleFav() {
    var idx = currentFavIndex();
    if (idx > -1) {
      state.favs.splice(idx, 1);
      toast('已取消收藏');
    } else {
      state.favs.unshift(JSON.parse(JSON.stringify(state.values)));
      if (state.favs.length > 30) state.favs.pop();
      toast('已加入收藏');
    }
    updateFavButton();
    saveState();
    if (state.activeTab === 'fav') renderHistory();
  }

  /* ---------- 历史 ---------- */
  function pushHistory() {
    var entry = { v: JSON.parse(JSON.stringify(state.values)), t: nowLabel() };
    if (state.history.length && comboKey(state.history[0].v) === comboKey(entry.v)) return;
    state.history.unshift(entry);
    if (state.history.length > 30) state.history.pop();
    saveState();
    renderHistory();
  }

  function renderHistory() {
    var box = $('historyChips');
    var empty = $('historyEmpty');
    var list = state.activeTab === 'fav' ? state.favs.map(function (v) { return { v: v, t: '' }; }) : state.history;
    box.innerHTML = '';
    if (!list.length) {
      empty.hidden = false;
      empty.textContent = state.activeTab === 'fav' ? '还没有收藏，点「收藏」把任务书存起来' : '还没有记录，点上面的按钮摇一次';
      return;
    }
    empty.hidden = true;
    list.forEach(function (entry, i) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      var dot = document.createElement('span');
      dot.className = 'chip-dot';
      dot.style.background = DOT_COLORS[i % DOT_COLORS.length];
      var label = document.createElement('span');
      label.textContent = entry.v.cat + ' · ' + entry.v.sub;
      chip.appendChild(dot);
      chip.appendChild(label);
      if (entry.t) {
        var time = document.createElement('span');
        time.className = 'chip-time';
        time.textContent = entry.t;
        chip.appendChild(time);
      }
      chip.addEventListener('click', function () { restore(entry.v); });
      box.appendChild(chip);
    });
  }

  function restore(v) {
    state.values = JSON.parse(JSON.stringify(v));
    afterChange(false);
    ORDER.forEach(function (k) { rollValue(k, false); });
    document.getElementById('generator').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    toast('已回填到任务书');
  }

  function clearActiveList() {
    if (state.activeTab === 'fav') {
      state.favs = [];
      toast('收藏已清空');
    } else {
      state.history = [];
      toast('历史已清空');
    }
    saveState();
    renderHistory();
    updateFavButton();
  }

  /* ---------- 复制 ---------- */
  function copyBrief() {
    var text = briefText();
    function done() { toast('已复制到剪贴板'); }
    function fail() { toast('复制失败，请手动选择文本'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text) ? done() : fail(); });
    } else {
      legacyCopy(text) ? done() : fail();
    }
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  /* ---------- 彩带 ---------- */
  var confettiCtx = null;
  function sizeCanvas() {
    var canvas = $('confetti');
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    confettiCtx = canvas.getContext('2d');
    confettiCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function confettiBurst() {
    if (REDUCED) return;
    sizeCanvas();
    var btn = $('rerollAll');
    if (!btn || !confettiCtx) return;
    var rect = btn.getBoundingClientRect();
    var ox = rect.left + rect.width / 2;
    var oy = rect.top + rect.height / 2;
    var parts = [];
    for (var i = 0; i < 60; i++) {
      parts.push({
        x: ox, y: oy,
        vx: (Math.random() - 0.5) * 11,
        vy: Math.random() * -9 - 3,
        size: Math.random() * 5 + 3,
        color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        life: 0
      });
    }
    var ctx = confettiCtx;
    (function tick() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      var alive = false;
      parts.forEach(function (p) {
        p.vy += 0.38; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
        if (p.life < 90) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = Math.max(0, 1 - p.life / 90);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62);
          ctx.restore();
        }
      });
      if (alive) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    })();
  }

  /* ---------- 数据条 / 词库 ---------- */
  function renderStats() {
    var catCount = LIBRARY.categories.length;
    var subCount = LIBRARY.categories.reduce(function (n, c) { return n + c.subs.length; }, 0);
    var dimCount = LIBRARY.users.length + LIBRARY.features.length + LIBRARY.styles.length + LIBRARY.challenges.length;
    var combos = subCount * LIBRARY.users.length * LIBRARY.features.length * LIBRARY.styles.length * LIBRARY.challenges.length;
    var combosLabel = combos >= 10000 ? Math.round(combos / 10000) + '万+' : String(combos);
    var stats = [
      { v: String(catCount), l: '大种类' },
      { v: String(subCount), l: '细分方向' },
      { v: String(dimCount), l: '随机维度' },
      { v: combosLabel, l: '组合可能' }
    ];
    $('stats').innerHTML = stats.map(function (s) {
      return '<div class="stat"><b>' + s.v + '</b><span>' + s.l + '</span></div>';
    }).join('');
  }

  function renderLibrary() {
    $('libGrid').innerHTML = LIBRARY.categories.map(function (c) {
      return '<div class="lib-item">' + c.name + ' · ' + c.subs.length + '</div>';
    }).join('');
  }

  /* ---------- 持久化 ---------- */
  var saveQueue = Promise.resolve();
  var failed = false;
  function lockOnFailure() {
    failed = true;
    var screen = document.createElement('div');
    screen.setAttribute('role', 'alert');
    screen.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(10,12,28,.95);color:white;display:grid;place-items:center;padding:24px;text-align:center';
    screen.textContent = '数据库连接或保存结果未确认，请刷新页面核对已保存的数据。';
    document.body.appendChild(screen);
  }
  function saveState() {
    var snapshot = JSON.stringify({values: state.values, locked: state.locked, history: state.history, favs: state.favs});
    saveQueue = saveQueue.then(function () {
      if (failed) return;
      return execute('INSERT INTO generator_state (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data', [snapshot]);
    }).catch(function () { if (!failed) lockOnFailure(); });
  }
  async function restoreState() {
    var rows = await execute('SELECT data FROM generator_state WHERE id = 1');
    var saved = rows.length ? JSON.parse(rows[0].data) : null;
    if (saved && saved.values && saved.values.cat) {
      state.values = saved.values;
      state.locked = saved.locked || {};
      state.history = saved.history || [];
      state.favs = saved.favs || [];
    } else {
      ORDER.forEach(function (k) { roll(k); });
    }
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    $('heroGenerate').addEventListener('click', function () {
      rollAll();
      document.getElementById('generator').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    });
    $('rerollAll').addEventListener('click', rollAll);
    $('copyBrief').addEventListener('click', copyBrief);
    $('briefCopy').addEventListener('click', copyBrief);
    $('favBrief').addEventListener('click', toggleFav);
    $('clearHistory').addEventListener('click', clearActiveList);

    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.tab').forEach(function (t) {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        state.activeTab = tab.dataset.tab;
        renderHistory();
      });
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'r' || ev.key === 'R') {
        var tag = (ev.target && ev.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        rollAll();
      }
    });

    var topbar = $('topbar');
    window.addEventListener('scroll', function () {
      topbar.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });

    window.addEventListener('resize', function () { if (confettiCtx) sizeCanvas(); });
  }

  /* ---------- 滚动入场 ---------- */
  function observeReveal() {
    var els = document.querySelectorAll('.reveal');
    if (REDUCED || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 启动 ---------- */
  async function init() {
    buildCards();
    renderStats();
    renderLibrary();
    try { await restoreState(); } catch (error) { lockOnFailure(); return; }
    updateAllCards();
    updateBrief();
    updateFavButton();
    renderHistory();
    bindEvents();
    observeReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
