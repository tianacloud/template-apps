/* learn.js —— 认识鼠标：结构图解 + 部件讲解 + 握姿指导 */
(function () {
  var MK = window.MK;

  var TOP_PARTS = [
    { id: 'left',  name: '左键', use: '最忙碌的键。选中图标、点按钮、确定选择，都要用它。', color: '#ff5d5d', ax: 165, ay: 95,  lx: 70,  ly: 78 },
    { id: 'right', name: '右键', use: '点一下会弹出"快捷菜单"，很多命令都藏在里面。', color: '#2f9bff', ax: 255, ay: 95,  lx: 352, ly: 78 },
    { id: 'wheel', name: '滚轮', use: '用食指前后拨动，网页和文章就能上下翻动。', color: '#8a3fd1', ax: 216, ay: 62,  lx: 352, ly: 168 },
    { id: 'palm',  name: '鼠标身', use: '手掌自然贴住这里，鼠标才会乖乖跟着你的手走。', color: '#ff9436', ax: 210, ay: 240, lx: 352, ly: 262 },
    { id: 'side',  name: '侧键', use: '有些鼠标侧面还有"前进 / 后退"键，上网更方便。', color: '#2fd07a', ax: 128, ay: 194, lx: 70,  ly: 200 },
    { id: 'cable', name: '连接线', use: '把鼠标和电脑连起来。无线鼠标靠一个小接收器或蓝牙。', color: '#ffc93c', ax: 152, ay: 8, lx: 70,  ly: 30 }
  ];

  var BOTTOM_PARTS = [
    { id: 'sensor',  name: '传感器', use: '鼠标的"小眼睛"。它不停给桌面拍照，才知道鼠标往哪儿动。', color: '#ff5d5d', ax: 226, ay: 196, lx: 352, ly: 196 },
    { id: 'switch',  name: '电源键', use: '无线鼠标的开关。不用的时候关掉，可以省电。', color: '#2fd07a', ax: 268, ay: 132, lx: 352, ly: 122 },
    { id: 'battery', name: '电池仓', use: '无线鼠标的"心脏"，装电池或者充电的地方。', color: '#ff9436', ax: 180, ay: 268, lx: 70,  ly: 278 },
    { id: 'foot',    name: '脚垫', use: '四片小脚垫，让鼠标在桌面上滑得又稳又顺。', color: '#8a3fd1', ax: 150, ay: 158, lx: 70,  ly: 148 }
  ];

  var TIPS = {
    left:  '👉 <b>单击</b>左键 = 选中；<b>双击</b>左键 = 打开。左键是你最常用的键。',
    right: '👉 按一下<b>右键</b>再松开，就会弹出一个"快捷菜单"，里面有很多好用的命令。',
    wheel: '👉 用食指<b>拨动滚轮</b>，页面就能向上或向下滚动，看书看网页都靠它。',
    palm:  '👉 掌心贴住鼠标后半部分，手腕放松，不要死死"抓"着鼠标。',
    side:  '👉 侧键不是每个鼠标都有，用拇指按，上网时可以"前进 / 后退"。',
    cable: '👉 有线鼠标插在 USB 口上；无线鼠标要把小接收器插好，或者用蓝牙连接。',
    sensor: '👉 底部的小红灯亮着，说明鼠标在工作。脏了要用棉签轻轻擦一擦。',
    switch: '👉 鼠标动不了的时候，先看看是不是不小心把电源关掉了。',
    battery: '👉 电池没电时，鼠标就会"罢工"，换电池或充电就好啦。',
    foot: '👉 脚垫磨平了会不好用，配一张鼠标垫可以保护它。'
  };

  var stage, listEl, tipEl, currentView = 'top', learnedSet = {}, lastId = null;

  function partById(id) {
    var all = TOP_PARTS.concat(BOTTOM_PARTS);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  function labelG(p) {
    var w = p.name.length * 17 + 26, h = 32;
    var x = p.lx - w / 2, y = p.ly - h / 2;
    return '<g class="plabel" data-for="' + p.id + '" style="display:none">' +
      '<line x1="' + p.ax + '" y1="' + p.ay + '" x2="' + p.lx + '" y2="' + p.ly +
        '" stroke="' + p.color + '" stroke-width="2.5" stroke-dasharray="6 4"/>' +
      '<circle cx="' + p.ax + '" cy="' + p.ay + '" r="6" fill="' + p.color + '"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="16" fill="#fff" stroke="' + p.color + '" stroke-width="3"/>' +
      '<text x="' + p.lx + '" y="' + (p.ly + 6) + '" text-anchor="middle" font-size="17" font-weight="700" fill="' + p.color + '">' + p.name + '</text>' +
      '</g>';
  }

  function svgTop() {
    return '<svg viewBox="0 0 420 400" xmlns="http://www.w3.org/2000/svg">' +
      /* 影子 */
      '<ellipse cx="210" cy="356" rx="96" ry="16" fill="rgba(31,90,160,.12)"/>' +
      /* 连接线 */
      '<path d="M208,30 C200,8 172,-2 138,4" fill="none" stroke="#b9c9db" stroke-width="9" stroke-linecap="round"/>' +
      '<path id="hit-cable" class="hit" data-part="cable" d="M208,30 C200,8 172,-2 138,4" fill="none" stroke="#9fb3c8" stroke-width="20" stroke-linecap="round" opacity="0.25"/>' +
      /* 鼠标外壳 */
      '<path d="M210,26 C262,26 296,74 298,152 C300,242 274,344 210,344 C146,344 122,242 124,152 C126,74 158,26 210,26 Z" fill="#f6f3f9" stroke="#d5cbe2" stroke-width="3"/>' +
      /* 左键 */
      '<path id="hit-left" class="hit" data-part="left" d="M209,29 C173,29 142,58 130,124 C127,141 126,148 126,152 L209,152 Z" fill="#e6e0ef" stroke="#cdc3dc" stroke-width="2.5"/>' +
      /* 右键 */
      '<path id="hit-right" class="hit" data-part="right" d="M211,29 C247,29 278,58 290,124 C293,141 294,148 294,152 L211,152 Z" fill="#e6e0ef" stroke="#cdc3dc" stroke-width="2.5"/>' +
      /* 掌心区 */
      '<path id="hit-palm" class="hit" data-part="palm" d="M126,154 L294,154 C296,242 273,344 210,344 C147,344 124,242 126,154 Z" fill="#efeaf5" stroke="#cdc3dc" stroke-width="2.5"/>' +
      /* 侧键 */
      '<rect id="hit-side" class="hit" data-part="side" x="116" y="176" width="16" height="40" rx="8" fill="#e6e0ef" stroke="#cdc3dc" stroke-width="2.5"/>' +
      /* 滚轮 */
      '<rect x="203" y="42" width="14" height="46" rx="7" fill="#8fa8c2"/>' +
      '<rect id="hit-wheel" class="hit" data-part="wheel" x="200" y="40" width="20" height="50" rx="9" fill="rgba(138,63,209,.26)" stroke="#8a3fd1" stroke-width="2.5"/>' +
      '<line x1="203" y1="54" x2="217" y2="54" stroke="#fff" stroke-width="2"/>' +
      '<line x1="203" y1="64" x2="217" y2="64" stroke="#fff" stroke-width="2"/>' +
      '<line x1="203" y1="74" x2="217" y2="74" stroke="#fff" stroke-width="2"/>' +
      /* 品牌装饰 */
      '<circle cx="210" cy="250" r="17" fill="rgba(47,155,255,.14)"/>' +
      '<text x="210" y="256" text-anchor="middle" font-size="16" fill="#8b7ca0">🖱️</text>' +
      /* 标注（默认隐藏） */
      TOP_PARTS.map(labelG).join('') +
      '</svg>';
  }

  function svgBottom() {
    var feet = [[172, 92], [248, 92], [166, 306], [254, 306]].map(function (p, i) {
      return '<rect id="' + (i === 0 ? 'hit-foot' : 'hit-foot-' + i) + '" class="hit" data-part="foot" ' +
        'x="' + (p[0] - 22) + '" y="' + (p[1] - 10) + '" width="44" height="20" rx="10" ' +
        'fill="#c8d8e8" stroke="#a9c1d8" stroke-width="2"/>';
    }).join('');
    return '<svg viewBox="0 0 420 400" xmlns="http://www.w3.org/2000/svg">' +
      '<ellipse cx="210" cy="356" rx="96" ry="16" fill="rgba(31,90,160,.12)"/>' +
      '<path d="M210,26 C262,26 296,74 298,152 C300,242 274,344 210,344 C146,344 122,242 124,152 C126,74 158,26 210,26 Z" fill="#f6f3f9" stroke="#d5cbe2" stroke-width="3"/>' +
      feet +
      /* 电池仓 */
      '<rect id="hit-battery" class="hit" data-part="battery" x="172" y="246" width="76" height="52" rx="10" fill="#fff3e2" stroke="#ff9436" stroke-width="2.5" stroke-dasharray="7 5"/>' +
      '<text x="210" y="280" text-anchor="middle" font-size="22">🔋</text>' +
      /* 电源开关 */
      '<rect id="hit-switch" class="hit" data-part="switch" x="244" y="120" width="46" height="22" rx="11" fill="#e6fbf0" stroke="#2fd07a" stroke-width="2.5"/>' +
      '<circle cx="278" cy="131" r="8" fill="#2fd07a"/>' +
      /* 光电传感器 */
      '<circle cx="210" cy="196" r="34" fill="#efeaf5" stroke="#cdc3dc" stroke-width="2.5"/>' +
      '<circle id="hit-sensor" class="hit" data-part="sensor" cx="210" cy="196" r="26" fill="rgba(255,93,93,.18)" stroke="#ff5d5d" stroke-width="2.5"/>' +
      '<circle cx="210" cy="196" r="9" fill="#ff5d5d"><animate attributeName="opacity" values="1;0.45;1" dur="1.4s" repeatCount="indefinite"/></circle>' +
      '<text x="210" y="248" text-anchor="middle" font-size="13" fill="#8b7ca0">光电传感器</text>' +
      BOTTOM_PARTS.map(labelG).join('') +
      '</svg>';
  }

  function renderList() {
    var parts = currentView === 'top' ? TOP_PARTS : BOTTOM_PARTS;
    listEl.innerHTML = '';
    parts.forEach(function (p) {
      var li = document.createElement('li');
      li.className = 'part-item';
      li.setAttribute('data-part', p.id);
      li.innerHTML = '<span class="pi-dot" style="background:' + p.color + '"></span>' +
        '<span class="pi-name">' + p.name + '</span>' +
        '<span class="pi-use">' + p.use + '</span>';
      li.addEventListener('click', function () { select(p.id, true); });
      /* 光标移到列表项上也联动显示（对触屏一体机保留单击） */
      li.addEventListener('pointerenter', function () { select(p.id, true); });
      listEl.appendChild(li);
    });
  }

  /* 悬停 / 单击都触发；同一部件重复触发时不再重复播音与计数 */
  function select(id, fromList, silent) {
    var p = partById(id);
    if (!p) return;
    var same = (id === lastId);
    lastId = id;
    stage.querySelectorAll('.hit').forEach(function (h) {
      h.classList.toggle('on', h.getAttribute('data-part') === id);
    });
    stage.querySelectorAll('.plabel').forEach(function (g) {
      g.style.display = g.getAttribute('data-for') === id ? '' : 'none';
    });
    listEl.querySelectorAll('.part-item').forEach(function (li) {
      li.classList.toggle('active', li.getAttribute('data-part') === id);
    });
    tipEl.innerHTML = '【' + p.name + '】' + p.use + '<br>' + (TIPS[id] || '');
    if (!same && !silent) MK.sfx.click();

    if (!learnedSet[id]) {
      learnedSet[id] = true;
      var total = TOP_PARTS.length + BOTTOM_PARTS.length;
      var n = Object.keys(learnedSet).length;
      if (n === TOP_PARTS.length) MK.toast('正面全都认识啦！再翻过来看看底部吧 👀', 'info');
      if (n === total && !MK.progress.get().learned) {
        MK.progress.get().learned = true;
        MK.progress.addStars(1);
        MK.confetti(60);
        MK.sfx.win();
        MK.toast('鼠标全身都认识啦！获得 1 颗星 ⭐', 'good', 3000);
      }
    }
    if (fromList && currentView === 'bottom' && TOP_PARTS.indexOf(p) >= 0) switchView('top');
  }

  function switchView(view) {
    if (view === currentView && stage.innerHTML) return;
    currentView = view;
    stage.style.opacity = '0';
    setTimeout(function () {
      stage.innerHTML = view === 'top' ? svgTop() : svgBottom();
      stage.style.opacity = '1';
      lastId = null;
      bindStage();
      renderList();
      tipEl.innerHTML = view === 'top'
        ? '👉 把<b>光标（小箭头）</b>移到鼠标的<b>左键</b>、<b>右键</b>、<b>滚轮</b>上看看～'
        : '👉 鼠标底部藏着<b>传感器</b>和<b>电池仓</b>，把光标移上去看看。';
    }, 180);
    document.querySelectorAll('.vs').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-view') === view);
    });
  }

  MK.resetLearn = function () { currentView = ''; switchView('top'); };

  function bindStage() {
    stage.querySelectorAll('.hit').forEach(function (h) {
      /* 光标移到部件上就显示名称与讲解（核心交互） */
      h.addEventListener('pointerenter', function () {
        select(h.getAttribute('data-part'), false);
      });
      /* 触屏 / 一体机没有真正的悬停，保留单击 */
      h.addEventListener('click', function () {
        select(h.getAttribute('data-part'), false);
      });
    });
  }

  function init() {
    stage = document.getElementById('mouseStage');
    listEl = document.getElementById('partList');
    tipEl = document.getElementById('mouseTip');
    if (!stage) return;

    document.querySelectorAll('.vs').forEach(function (b) {
      b.addEventListener('click', function () { switchView(b.getAttribute('data-view')); });
    });

    switchView('top');
    MK.pages.learn = { enter: function () { if (!stage.innerHTML) switchView('top'); } };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
