/* 首页：游戏清单渲染 + 筛选 */
(function () {
  'use strict';

  var ICONS = {
    g2048:
      '<svg viewBox="0 0 40 40" fill="none">' +
      '<rect x="3" y="3" width="15" height="15" rx="4.5" fill="#f0a04b"/>' +
      '<rect x="22" y="3" width="15" height="15" rx="4.5" fill="#f8c382"/>' +
      '<rect x="3" y="22" width="15" height="15" rx="4.5" fill="#f8c382"/>' +
      '<rect x="22" y="22" width="15" height="15" rx="4.5" fill="#e07f34"/>' +
      '</svg>',
    minesweeper:
      '<svg viewBox="0 0 40 40" fill="none">' +
      '<rect x="2" y="2" width="36" height="36" rx="9" fill="#e7ebff"/>' +
      '<circle cx="20" cy="21" r="7.4" fill="#5b6ef5"/>' +
      '<path d="M20 9.5v4M20 28.5v4M8.5 21h4M27.5 21h4M11.6 12.6l2.9 2.9M25.5 26.5l2.9 2.9M28.4 12.6l-2.9 2.9M14.5 26.5l-2.9 2.9" stroke="#5b6ef5" stroke-width="2.2" stroke-linecap="round"/>' +
      '<circle cx="17.4" cy="18.4" r="1.9" fill="#fff" opacity=".85"/>' +
      '</svg>',
    watermelon:
      '<svg viewBox="0 0 40 40" fill="none">' +
      '<circle cx="20" cy="20" r="16" fill="#22b573"/>' +
      '<circle cx="20" cy="20" r="16" fill="none" stroke="#17915a" stroke-width="1.6"/>' +
      '<path d="M9 12.5c2.2 3.4 2.2 11.6 0 15M31 12.5c-2.2 3.4-2.2 11.6 0 15" stroke="#17915a" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>' +
      '<circle cx="15" cy="17.6" r="2.1" fill="#12331f"/>' +
      '<circle cx="25" cy="17.6" r="2.1" fill="#12331f"/>' +
      '<path d="M15.6 23.4c1.4 1.6 3.3 2.4 4.4 2.4 1.1 0 3-.8 4.4-2.4" stroke="#12331f" stroke-width="1.9" stroke-linecap="round"/>' +
      '<circle cx="11.4" cy="22.4" r="2.2" fill="#ff8b8b" opacity=".65"/>' +
      '<circle cx="28.6" cy="22.4" r="2.2" fill="#ff8b8b" opacity=".65"/>' +
      '</svg>',
    tetris:
      '<svg viewBox="0 0 40 40" fill="none">' +
      '<rect x="6" y="4" width="10" height="10" rx="2.6" fill="#8b5cf6"/>' +
      '<rect x="16" y="4" width="10" height="10" rx="2.6" fill="#a78bfa"/>' +
      '<rect x="26" y="4" width="10" height="10" rx="2.6" fill="#7c3aed"/>' +
      '<rect x="16" y="14" width="10" height="10" rx="2.6" fill="#c4b5fd"/>' +
      '<rect x="16" y="24" width="10" height="10" rx="2.6" fill="#ddd6fe"/>' +
      '<rect x="4" y="30" width="10" height="6" rx="2.2" fill="#7c3aed" opacity=".45"/>' +
      '<rect x="26" y="30" width="10" height="6" rx="2.2" fill="#8b5cf6" opacity=".45"/>' +
      '</svg>',
    snake:
      '<svg viewBox="0 0 40 40" fill="none">' +
      '<rect x="4" y="4" width="32" height="32" rx="9" fill="#e3f7fb"/>' +
      '<path d="M11 27h8a4 4 0 0 0 4-4v-2a4 4 0 0 1 4-4h3" stroke="#22b8cf" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="12.6" cy="27" r="1.5" fill="#fff"/>' +
      '<circle cx="31.4" cy="16.6" r="1.6" fill="#fff"/>' +
      '<circle cx="30" cy="24" r="3.4" fill="#f2545b"/>' +
      '</svg>',
    whack:
      '<svg viewBox="0 0 40 40" fill="none">' +
      '<ellipse cx="20" cy="31" rx="15" ry="6.4" fill="#5c3a1c"/>' +
      '<path d="M11 31v-9a9 9 0 0 1 18 0v9z" fill="#a97747"/>' +
      '<ellipse cx="15.2" cy="21.6" rx="1.7" ry="2" fill="#2a1a0d"/>' +
      '<ellipse cx="24.8" cy="21.6" rx="1.7" ry="2" fill="#2a1a0d"/>' +
      '<ellipse cx="20" cy="26" rx="3.4" ry="2.5" fill="#e88d8d"/>' +
      '<circle cx="13.6" cy="26.4" r="1.8" fill="#e87a7a" opacity=".55"/>' +
      '<circle cx="26.4" cy="26.4" r="1.8" fill="#e87a7a" opacity=".55"/>' +
      '</svg>',
    sudoku:
      '<svg viewBox="0 0 40 40" fill="none">' +
      '<rect x="3" y="3" width="34" height="34" rx="8" fill="#eef1fb"/>' +
      '<path d="M14.33 3v34M25.67 3v34M3 14.33h34M3 25.67h34" stroke="#5b6ef5" stroke-width="1.3" opacity=".38"/>' +
      '<rect x="5.6" y="5.6" width="7.4" height="7.4" rx="2.2" fill="#5b6ef5"/>' +
      '<rect x="16.3" y="16.3" width="7.4" height="7.4" rx="2.2" fill="#8b5cf6"/>' +
      '<rect x="27" y="5.6" width="7.4" height="7.4" rx="2.2" fill="#c4b5fd"/>' +
      '<rect x="5.6" y="27" width="7.4" height="7.4" rx="2.2" fill="#c4b5fd"/>' +
      '<rect x="27" y="27" width="7.4" height="7.4" rx="2.2" fill="#5b6ef5" opacity=".7"/>' +
      '</svg>',
    sokoban:
      '<svg viewBox="0 0 40 40" fill="none">' +
      '<rect x="3" y="3" width="34" height="34" rx="8" fill="#f7f0e6"/>' +
      '<circle cx="20" cy="14" r="3.4" fill="none" stroke="#2fbf8f" stroke-width="2"/>' +
      '<rect x="11.5" y="20.5" width="17" height="13" rx="2.6" fill="#c98a4b"/>' +
      '<path d="M11.5 24.2h17M11.5 29.8h17M20 20.5v13" stroke="#a06a30" stroke-width="1.4" opacity=".7"/>' +
      '<rect x="17.4" y="26.4" width="5.2" height="4" rx="1.2" fill="#f0b070" opacity=".75"/>' +
      '</svg>',
    linklink:
      '<svg viewBox="0 0 40 40" fill="none">' +
      '<rect x="3" y="3" width="13" height="13" rx="4" fill="#0f9d9d"/>' +
      '<rect x="24" y="24" width="13" height="13" rx="4" fill="#0f9d9d"/>' +
      '<rect x="24" y="3" width="13" height="13" rx="4" fill="#5b6ef5" opacity=".32"/>' +
      '<rect x="3" y="24" width="13" height="13" rx="4" fill="#5b6ef5" opacity=".32"/>' +
      '<path d="M9.5 16v8.6a3.2 3.2 0 0 0 3.2 3.2h11.3" stroke="#0f9d9d" stroke-width="2.6" stroke-linecap="round" opacity=".72"/>' +
      '</svg>',
    memory:
      '<svg viewBox="0 0 40 40" fill="none">' +
      '<rect x="3.5" y="11" width="13" height="19" rx="3.6" fill="#e2569b" opacity=".34" transform="rotate(-7 10 20.5)"/>' +
      '<rect x="20" y="9" width="16" height="22" rx="4" fill="#e2569b"/>' +
      '<path d="M28 14.4l1.7 3.5 3.8.55-2.75 2.68.65 3.79L28 23.12l-3.4 1.8.65-3.79-2.75-2.68 3.8-.55z" fill="#fff" opacity=".94"/>' +
      '</svg>',
    gomoku:
      '<svg viewBox="0 0 40 40" fill="none">' +
      '<rect x="3" y="3" width="34" height="34" rx="8" fill="#f2eee6"/>' +
      '<path d="M11.7 3v34M20 3v34M28.3 3v34M3 11.7h34M3 20h34M3 28.3h34" stroke="#cbb28d" stroke-width="1.2"/>' +
      '<circle cx="15.8" cy="15.8" r="4.3" fill="#2b3243"/>' +
      '<circle cx="24.2" cy="15.8" r="4.3" fill="#fbfdff" stroke="#b9c2d4" stroke-width=".9"/>' +
      '<circle cx="24.2" cy="24.2" r="4.3" fill="#2b3243"/>' +
      '</svg>',
    brick:
      '<svg viewBox="0 0 40 40" fill="none">' +
      '<rect x="3" y="5" width="10" height="6.4" rx="2" fill="#f2545b"/>' +
      '<rect x="15" y="5" width="10" height="6.4" rx="2" fill="#f0b429"/>' +
      '<rect x="27" y="5" width="10" height="6.4" rx="2" fill="#2fbf8f"/>' +
      '<rect x="3" y="13.2" width="10" height="6.4" rx="2" fill="#2fbf8f"/>' +
      '<rect x="15" y="13.2" width="10" height="6.4" rx="2" fill="#f2545b"/>' +
      '<rect x="27" y="13.2" width="10" height="6.4" rx="2" fill="#f0b429"/>' +
      '<circle cx="20" cy="26.4" r="3.1" fill="#f0a04b"/>' +
      '<rect x="11.5" y="33" width="17" height="4.2" rx="2.1" fill="#5b6ef5"/>' +
      '</svg>',
    klotski:
      '<svg viewBox="0 0 40 40" fill="none">' +
      '<rect x="3.5" y="2.5" width="33" height="35" rx="5" fill="#f5f0e6"/>' +
      '<rect x="6" y="5" width="9" height="9" rx="2.4" fill="#8a9cdd"/>' +
      '<rect x="17" y="5" width="16" height="16" rx="3.5" fill="#e2a23c"/>' +
      '<rect x="6" y="16" width="9" height="9" rx="2.4" fill="#8a9cdd"/>' +
      '<rect x="6" y="27" width="9" height="8" rx="2.4" fill="#a5b4e8"/>' +
      '<rect x="17" y="23" width="7" height="7" rx="2" fill="#a5b4e8"/>' +
      '<rect x="26" y="23" width="7" height="7" rx="2" fill="#a5b4e8"/>' +
      '<rect x="17" y="32" width="16" height="2.6" rx="1.3" fill="#c8912d"/>' +
      '</svg>',
    slide:
      '<svg viewBox="0 0 40 40" fill="none">' +
      '<rect x="3" y="3" width="34" height="34" rx="6" fill="#dbe4f7"/>' +
      '<rect x="5.5" y="5.5" width="9.2" height="9.2" rx="2.2" fill="#fff"/>' +
      '<rect x="15.4" y="5.5" width="9.2" height="9.2" rx="2.2" fill="#fff"/>' +
      '<rect x="25.3" y="5.5" width="9.2" height="9.2" rx="2.2" fill="#fff"/>' +
      '<rect x="5.5" y="15.4" width="9.2" height="9.2" rx="2.2" fill="#fff"/>' +
      '<rect x="15.4" y="15.4" width="9.2" height="9.2" rx="2.2" fill="#3f7bec"/>' +
      '<rect x="25.3" y="15.4" width="9.2" height="9.2" rx="2.2" fill="#fff"/>' +
      '<rect x="5.5" y="25.3" width="9.2" height="9.2" rx="2.2" fill="#fff"/>' +
      '<rect x="15.4" y="25.3" width="9.2" height="9.2" rx="2.2" fill="#fff"/>' +
      '<rect x="25.3" y="25.3" width="9.2" height="9.2" rx="2.2" fill="#fff"/>' +
      '</svg>',
    match3:
      '<svg viewBox="0 0 40 40" fill="none">' +
      '<rect x="4" y="4" width="10" height="10" rx="2.6" fill="#ef5350"/>' +
      '<rect x="15" y="4" width="10" height="10" rx="2.6" fill="#3f7bec"/>' +
      '<rect x="26" y="4" width="10" height="10" rx="2.6" fill="#2fb36b"/>' +
      '<circle cx="9" cy="20" r="5.2" fill="#e8b02a"/>' +
      '<circle cx="20" cy="20" r="5.2" fill="#e8b02a"/>' +
      '<circle cx="31" cy="20" r="5.2" fill="#e8b02a"/>' +
      '<rect x="4" y="26" width="10" height="10" rx="2.6" fill="#8e5ce6"/>' +
      '<rect x="15" y="26" width="10" height="10" rx="2.6" fill="#18a5b8"/>' +
      '<rect x="26" y="26" width="10" height="10" rx="2.6" fill="#ef5350"/>' +
      '</svg>'
  };

  var GAMES = [
    {
      id: '2048', name: '合成 2048', tag: '合成',
      desc: '方向键滑动，相同数字撞在一起就翻倍。目标只有一个：2048。',
      url: 'games/2048.html', icon: ICONS.g2048,
      bg: '#fdf1e3', accent: '#f0a04b', fire: true,
      meta: '约 3-10 分钟一局'
    },
    {
      id: 'watermelon', name: '合成大西瓜', tag: '合成',
      desc: '水果掉进箱子，两个一样的碰在一起就变大一号。别堆过头。',
      url: 'games/watermelon.html', icon: ICONS.watermelon,
      bg: '#e4f8ee', accent: '#22b573', fire: true,
      meta: '约 2-5 分钟一局'
    },
    {
      id: 'minesweeper', name: '扫雷', tag: '益智',
      desc: '经典排雷。第一次点击永远安全，数字告诉你有几颗雷在旁边。',
      url: 'games/minesweeper.html', icon: ICONS.minesweeper,
      bg: '#eaeeff', accent: '#5b6ef5',
      meta: '三档难度可选'
    },
    {
      id: 'sudoku', name: '数独', tag: '益智',
      desc: '九宫格填数，每行每列每宫都不许重复。每道题都有唯一解。',
      url: 'games/sudoku.html', icon: ICONS.sudoku,
      bg: '#eef1fb', accent: '#5b6ef5',
      meta: '三档难度 · 可提示',
      stat: function () {
        var r = FB.Store.get('sudoku.best', {}) || {};
        var order = ['easy', 'medium', 'hard'];
        var label = { easy: '简单', medium: '普通', hard: '困难' };
        for (var i = 0; i < order.length; i++) {
          if (r[order[i]]) return '最快 <b>' + label[order[i]] + ' ' + FB.fmtTime(r[order[i]]) + '</b>';
        }
        return '未挑战';
      }
    },
    {
      id: 'sokoban', name: '推箱子', tag: '益智',
      desc: '把所有箱子推进目标点。推错了只能撤销，越往后越要想清楚顺序。',
      url: 'games/sokoban.html', icon: ICONS.sokoban,
      bg: '#f7f0e6', accent: '#b5763c',
      meta: '12 个关卡 · 可撤销',
      stat: function () {
        var d = FB.Store.get('sokoban.done', []);
        if (!Array.isArray(d) || !d.length) return '未挑战';
        return '已过 <b>' + d.length + '/12</b> 关';
      }
    },
    {
      id: 'memory', name: '记忆翻牌', tag: '益智',
      desc: '十六张背面朝上的牌，两两翻开来配对。记住位置，步数越少越好。',
      url: 'games/memory.html', icon: ICONS.memory,
      bg: '#fdeef4', accent: '#e2569b',
      meta: '8 对牌 · 记步数',
      stat: function () {
        var b = FB.Store.get('memory.best', 0) || 0;
        return b > 0 ? '最佳 <b>' + b + ' 步</b>' : '未挑战';
      }
    },
    {
      id: 'tetris', name: '俄罗斯方块', tag: '反应',
      desc: '落块、旋转、消行。手不需要想，眼睛盯着空隙就够了。',
      url: 'games/tetris.html', icon: ICONS.tetris,
      bg: '#f2ecff', accent: '#8b5cf6',
      meta: '带幽灵落点提示'
    },
    {
      id: 'snake', name: '贪吃蛇', tag: '反应',
      desc: '吃果子变长，别撞墙也别咬到自己。越吃越快。',
      url: 'games/snake.html', icon: ICONS.snake,
      bg: '#e2f6fb', accent: '#22b8cf',
      meta: '竞速最高分'
    },
    {
      id: 'whack', name: '打地鼠', tag: '反应',
      desc: '三十秒内能敲中多少只？连击有加成，手别抖。',
      url: 'games/whack.html', icon: ICONS.whack,
      bg: '#ffeee6', accent: '#ff8a5b',
      meta: '30 秒快节奏'
    },
    {
      id: 'brick', name: '打砖块', tag: '反应',
      desc: '挡板接住小球，把上面的砖一块块敲掉。八关，每过一关多一条命。',
      url: 'games/brick.html', icon: ICONS.brick,
      bg: '#ffefef', accent: '#f2545b',
      meta: '8 关 · 鼠标或方向键'
    },
    {
      id: 'linklink', name: '连连看', tag: '消除',
      desc: '两张同样的图案，连线拐弯不超过两次就能消掉。限时四分钟。',
      url: 'games/linklink.html', icon: ICONS.linklink,
      bg: '#e6f6f4', accent: '#0f9d9d',
      meta: '40 对 · 限时 4 分钟',
      stat: function () { return '限时挑战'; }
    },
    {
      id: 'match3', name: '消消乐', tag: '消除',
      desc: '交换相邻两块，横竖连成三个就消掉。连锁越多分数越高，九十秒能打多少？',
      url: 'games/match3.html', icon: ICONS.match3,
      bg: '#ffeee9', accent: '#ef5350',
      meta: '90 秒限时 · 连锁加成',
      stat: function () {
        var b = FB.Store.get('match3.best', 0) || 0;
        return b > 0 ? '最高 <b>' + FB.fmtNum(b) + '</b> 分' : '未挑战';
      }
    },
    {
      id: 'klotski', name: '华容道', tag: '滑块',
      desc: '拖动木块给曹操让路，把它挪到底部出口就算赢。六关，最后一关要五十多步。',
      url: 'games/klotski.html', icon: ICONS.klotski,
      bg: '#f7f0e6', accent: '#c8912d',
      meta: '6 关 · 可撤销',
      stat: function () {
        var d = FB.Store.get('klotski.done', []);
        if (!Array.isArray(d) || !d.length) return '未挑战';
        return '已过 <b>' + d.length + '/6</b> 关';
      }
    },
    {
      id: 'slide', name: '数字推盘', tag: '滑块',
      desc: '一个空格，把打乱的数字按顺序推回去。三档规格，每一局都保证有解。',
      url: 'games/slide.html', icon: ICONS.slide,
      bg: '#eaf0fd', accent: '#3f7bec',
      meta: '3×3 到 5×5 · 可撤销',
      stat: function () {
        var r = FB.Store.get('slide.best', {}) || {};
        var order = ['3', '4', '5'];
        for (var i = 0; i < order.length; i++) {
          if (r[order[i]] && r[order[i]].m) {
            return order[i] + '×' + order[i] + ' 最少 <b>' + r[order[i]].m + '</b> 步';
          }
        }
        return '未挑战';
      }
    },
    {
      id: 'gomoku', name: '五子棋', tag: '棋牌',
      desc: '你执黑先手，对面是会挡棋的电脑。三档难度，可悔棋。',
      url: 'games/gomoku.html', icon: ICONS.gomoku,
      bg: '#f2eee6', accent: '#5b6479',
      meta: '三档难度 · 可悔棋',
      stat: function () {
        var r = FB.Store.get('gomoku.rec', null);
        if (!r || (!r.w && !r.l)) return '未挑战';
        return '胜 <b>' + r.w + '</b> 负 <b>' + r.l + '</b>';
      }
    }
  ];

  var grid = document.getElementById('grid');
  var countEl = document.getElementById('count');
  var currentTag = 'all';

  function render() {
    var list = GAMES.filter(function (g) { return currentTag === 'all' || g.tag === currentTag; });
    grid.innerHTML = list.map(function (g, i) {
      var best = FB.Store.getBest(g.id);
      /* 各类游戏的「战绩」含义不同（最高分 / 最佳步数 / 通关数 / 胜负），各游戏自己给文案 */
      var foot = g.stat
        ? g.stat()
        : (best > 0 ? '最高 <b>' + FB.fmtNum(best) + '</b>' : '未挑战');
      return '' +
        '<a class="card" href="' + g.url + '" style="--card-bg:' + g.bg + ';--card-accent:' + g.accent +
        ';animation-delay:' + (i * 55) + 'ms">' +
        (g.fire ? '<span class="card-fire">最受欢迎</span>' : '') +
        '<div class="card-head">' +
          '<span class="card-icon">' + g.icon + '</span>' +
          '<div>' +
            '<h3 class="card-title">' + g.name + '</h3>' +
            '<p class="card-desc">' + g.desc + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="card-foot">' +
          '<span class="tag">' + g.tag + '</span>' +
          '<span>' + g.meta + '</span>' +
          '<span class="card-best">' + foot + '</span>' +
        '</div>' +
      '</a>';
    }).join('');
    countEl.textContent = list.length + ' 款';
  }

  document.getElementById('filters').addEventListener('click', function (e) {
    var btn = e.target.closest('.chip');
    if (!btn) return;
    document.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
    btn.classList.add('on');
    currentTag = btn.dataset.tag;
    render();
    FB.Sound.play('click');
  });

  grid.addEventListener('click', function (e) {
    if (e.target.closest('.card')) FB.Sound.play('click');
  });

  /* ------------------ 工作界面伪装场景选择 ------------------ */
  (function initScenePicker() {
    var btn = document.querySelector('[data-boss-scene]');
    if (!btn || !FB.Boss || !FB.Boss.sceneMeta) return;

    var panel = null;

    function close() {
      if (!panel) return;
      panel.remove();
      panel = null;
      document.removeEventListener('click', onDoc, true);
    }

    function onDoc(e) {
      if (panel && !panel.contains(e.target) && !btn.contains(e.target)) close();
    }

    function open() {
      var meta = FB.Boss.sceneMeta();
      var cur = FB.Boss.getSceneId();

      panel = document.createElement('div');
      panel.className = 'scene-picker';
      panel.innerHTML =
        '<div class="sp-head"><b>工作界面伪装场景</b>' +
          '<small>按 Esc 或右键切过去时，显示哪一套系统</small></div>' +
        '<div class="sp-list">' + meta.map(function (m) {
          return '<button class="sp-item' + (m.id === cur ? ' on' : '') + '" data-id="' + m.id + '">' +
            '<span class="sp-dot" style="--sp-c:' + m.accent + '"></span>' +
            '<span class="sp-txt"><b>' + m.name + '</b><small>' + m.desc + '</small>' +
              '<small class="sp-sub">' + m.product + ' · ' + m.user + '</small></span>' +
            (m.id === cur ? '<i>当前</i>' : '') + '</button>';
        }).join('') + '</div>' +
        '<div class="sp-foot">选一套身份会立即切过去给你看一眼，按 <b>Esc</b> 或右键回到游戏。<br>' +
          '六套系统的项目、金额、人名均为虚构占位数据，不含任何真实信息。</div>';

      document.body.appendChild(panel);

      var r = btn.getBoundingClientRect();
      panel.style.top = (r.bottom + 8) + 'px';
      panel.style.right = Math.max(12, window.innerWidth - r.right - 8) + 'px';

      panel.addEventListener('click', function (e) {
        var it = e.target.closest('.sp-item');
        if (!it) return;
        var name = '';
        meta.forEach(function (m) { if (m.id === it.dataset.id) name = m.name; });
        FB.Boss.setScene(it.dataset.id);
        close();
        FB.Sound.play('click');
        /* 选完直接切过去看一眼，否则"换了身份但界面没动静"很容易被当成没生效 */
        FB.Boss.show();
        FB.toast('已切换为「' + name + '」，Esc 或右键回到游戏');
      });

      setTimeout(function () { document.addEventListener('click', onDoc, true); }, 0);
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (panel) close(); else open();
    });

    window.addEventListener('resize', close);
  })();

  render();
})();
