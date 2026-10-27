/* ============================================================
   摸鱼盒子 FishBox — 公共模块
   Store    本地存档（最高分 / 偏好）
   Sound    极简音效（默认静音，可手动开启）
   Boss     Esc / 右键 / 中键 一键切到"工作界面"伪装层
   Theme    深色 / 浅色
   ============================================================ */
(function (global) {
  'use strict';

  var NS = 'fishbox.';
  var hasLS = true;
  try { global.localStorage.setItem('__fb', '1'); global.localStorage.removeItem('__fb'); }
  catch (e) { hasLS = false; }

  /* ------------------------ 存档 ------------------------ */
  var Store = {
    get: function (key, def) {
      if (!hasLS) return def;
      try {
        var raw = global.localStorage.getItem(NS + key);
        if (raw === null || raw === undefined) return def;
        return JSON.parse(raw);
      } catch (e) { return def; }
    },
    set: function (key, val) {
      if (!hasLS) return;
      try { global.localStorage.setItem(NS + key, JSON.stringify(val)); } catch (e) {}
    },
    /* 最高分：只增不减 */
    best: function (gameId, score) {
      var cur = Store.get('best.' + gameId, 0) || 0;
      if (typeof score === 'number' && score > cur) {
        Store.set('best.' + gameId, score);
        return { best: score, isNew: true };
      }
      return { best: cur, isNew: false };
    },
    getBest: function (gameId) { return Store.get('best.' + gameId, 0) || 0; }
  };

  /* ------------------------ 音效 ------------------------ */
  var Sound = {
    _ctx: null,
    _on: null,
    enabled: function () {
      if (this._on === null) this._on = Store.get('sound', false) === true;
      return this._on;
    },
    toggle: function () {
      this._on = !this.enabled();
      Store.set('sound', this._on);
      if (this._on) this.play('click');
      document.querySelectorAll('[data-sound-icon]').forEach(function (el) {
        el.innerHTML = Sound._on ? Sound.ICON_ON : Sound.ICON_OFF;
      });
      return this._on;
    },
    _ensure: function () {
      if (this._ctx) return this._ctx;
      try {
        var AC = global.AudioContext || global.webkitAudioContext;
        if (!AC) return null;
        this._ctx = new AC();
      } catch (e) { this._ctx = null; }
      return this._ctx;
    },
    _beep: function (freq, dur, type, vol, delay) {
      var ctx = this._ensure();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      var t0 = ctx.currentTime + (delay || 0);
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.06, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (dur || 0.12));
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t0); osc.stop(t0 + (dur || 0.12) + 0.02);
    },
    /* 语义化音效：开关关闭时静默返回 */
    play: function (kind) {
      if (!this.enabled()) return;
      switch (kind) {
        case 'click': this._beep(520, 0.06, 'triangle', 0.05); break;
        case 'move': this._beep(260, 0.05, 'sine', 0.035); break;
        case 'merge': this._beep(660, 0.09, 'triangle', 0.055); this._beep(880, 0.09, 'triangle', 0.04, 0.06); break;
        case 'pop': this._beep(760, 0.08, 'sine', 0.05); break;
        case 'good': this._beep(620, 0.08, 'sine', 0.05); this._beep(930, 0.12, 'sine', 0.045, 0.07); break;
        case 'bad': this._beep(200, 0.16, 'sawtooth', 0.04); this._beep(140, 0.22, 'sawtooth', 0.035, 0.1); break;
        case 'win': [523, 659, 784, 1046].forEach(function (f, i) { Sound._beep(f, 0.16, 'triangle', 0.05, i * 0.09); }); break;
        case 'lose': [392, 330, 262].forEach(function (f, i) { Sound._beep(f, 0.2, 'sine', 0.045, i * 0.11); }); break;
        case 'tick': this._beep(1000, 0.03, 'square', 0.02); break;
      }
    },
    ICON_ON: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    ICON_OFF: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/></svg>'
  };

  /* ------------------------ 主题 ------------------------ */
  var Theme = {
    get: function () { return Store.get('theme', 'light'); },
    set: function (t) {
      Store.set('theme', t);
      document.documentElement.setAttribute('data-theme', t);
      document.querySelectorAll('[data-theme-icon]').forEach(function (el) {
        el.innerHTML = t === 'dark' ? Theme.ICON_SUN : Theme.ICON_MOON;
      });
    },
    toggle: function () {
      var next = Theme.get() === 'dark' ? 'light' : 'dark';
      Theme.set(next);
      return next;
    },
    init: function () {
      document.documentElement.setAttribute('data-theme', Theme.get());
      if (document.body) document.body.setAttribute('data-theme', Theme.get());
      Theme.set(Theme.get());
    },
    ICON_MOON: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    ICON_SUN: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
  };

  /* ------------------------ 老板键 ------------------------ */
  /*
     伪装成一个内部业务系统：顶栏 + 左侧导航 + 列表 + 详情抽屉 + 状态栏。
     身份（场景）由用户在首页选择，存放在 localStorage 的 fishbox.boss.scene；
     场景数据见 assets/boss-data.js，全部为虚构占位内容，不含真实公司与项目。
  */

  var BOSS_PATH = {
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    box: '<path d="m21 8-9-5-9 5v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    money: '<circle cx="12" cy="12" r="9"/><path d="M15 9h-3.5a2 2 0 0 0 0 4H14a2 2 0 0 1 0 4H9M12 6v12"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-5 3 3 4-6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    bug: '<rect x="8" y="7" width="8" height="12" rx="4"/><path d="M8 11H4M8 15H4M20 11h-4M20 15h-4M9 7 7 4M15 7l2-3"/>',
    rocket: '<path d="M5 15c-1 3 0 5 0 5s2 1 5 0"/><path d="M14 4c4 1 6 3 6 3s-1 5-5 8l-4-4c3-4 3-7 3-7z"/><circle cx="14.5" cy="9.5" r="1.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
    export: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 17h12v4H6z"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>'
  };

  function bossIcon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + (BOSS_PATH[name] || BOSS_PATH.list) + '</svg>';
  }

  function bossPad2(n) { return n < 10 ? '0' + n : '' + n; }

  /* 把 #rrggbb 转成 rgba()，用于按场景色生成浅底/描边 */
  function hexA(hex, a) {
    var h = String(hex || '#2b6cf0').replace('#', '');
    if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    var n = parseInt(h, 16);
    if (isNaN(n)) return 'rgba(43,108,240,' + a + ')';
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  /* 状态标签配色：先判异常，再判完成，避免「待修复」被算成已完成 */
  function bossStatusKind(v) {
    var s = String(v || '');
    if (/逾期|暂停|退单|驳回|延期|争议|差异|搁置|待修复|待补充/.test(s)) return 'danger';
    if (/完成|通过|确认|上线|到岗|核对|关闭|过账|已回款|已归档|已印发|正常|在职|在用|已核对|已采纳|已完成/.test(s)) return 'ok';
    if (/进行中|处理中|履行中|询价中|报名中|面试中|筛选中|已提交|已采纳|维修中|试用期|已修复/.test(s)) return 'info';
    if (/待|审核|审批|签发|修复|排期|回访|续签|召开|开班|启动|跟进|待定/.test(s)) return 'warn';
    return 'mute';
  }

  /* 场景数据未加载时的最小兜底，保证伪装层永远打得开 */
  var BOSS_FALLBACK = {
    name: '通用办公', desc: '行政、综合事务', product: '综合事务管理平台',
    user: '张伟', dept: '综合管理部',
    flow: ['登记受理', '分办流转', '承办处理', '复核确认', '归档办结'],
    notices: ['系统 推送了 3 条待办提醒'],
    nav: [{ key: 'todo', label: '待办事项', icon: 'check' }],
    panels: {
      todo: {
        title: '我的待办', crumb: ['首页', '事务处理', '我的待办'],
        cols: [
          { l: '编号', w: 112, k: 'no' },
          { l: '事项', w: 0, k: 'strong' },
          { l: '责任人', w: 78 },
          { l: '截止日期', w: 96, k: 'date' },
          { l: '状态', w: 86, k: 'status' }
        ],
        rows: [
          ['GD-2610-041', '四季度办公用品采购计划汇总', '张伟', '10-24', '进行中'],
          ['GD-2610-038', '年度职工体检名单确认与上报', '李敏', '10-23', '待处理'],
          ['GD-2610-036', '三楼会议室投影设备报修', '王强', '10-22', '已逾期'],
          ['GD-2610-031', '2026年度档案归档目录编制', '赵倩', '10-28', '进行中'],
          ['GD-2610-029', '公务用车月度费用统计', '孙涛', '10-25', '待审核'],
          ['GD-2610-025', '消防安全检查整改情况反馈', '周斌', '10-27', '进行中'],
          ['GD-2610-021', '外部来访接待方案报批', '张伟', '10-23', '待审核'],
          ['GD-2610-018', '办公区绿植更换采购', '孙涛', '10-30', '已完成'],
          ['GD-2610-014', '固定资产盘点差异说明', '陈静', '10-26', '待处理'],
          ['GD-2610-011', '内部通讯录信息更新', '赵倩', '10-24', '已完成']
        ]
      }
    }
  };

  var BOSS_PER_PAGE = 10;

  var Boss = {
    layer: null,
    hint: null,
    active: false,
    onToggle: null,

    sceneId: '',
    panelKey: '',
    q: '',
    sortCol: -1,
    sortDir: 1,
    page: 0,
    statusFilter: '',
    selIndex: -1,

    _built: '',
    _els: null,
    _clock: null,
    _notice: null,
    _hintTimer: null,

    /* ----------------------- 场景 ----------------------- */
    sceneIds: function () {
      var S = global.BOSS_SCENES;
      if (!S) return ['office'];
      var ord = global.BOSS_SCENE_ORDER || Object.keys(S);
      return ord.filter(function (id) { return !!S[id]; });
    },

    sceneMeta: function () {
      var S = global.BOSS_SCENES;
      var ids = this.sceneIds();
      if (!S) return [{ id: 'office', name: '通用办公', desc: '行政、综合事务', accent: '#2b6cf0' }];
      return ids.map(function (id) {
        return {
          id: id,
          name: S[id].name,
          desc: S[id].desc,
          accent: S[id].accent || '#2b6cf0',
          product: S[id].product || '',
          user: S[id].user || ''
        };
      });
    },

    getSceneId: function () {
      var ids = this.sceneIds();
      var saved = Store.get('boss.scene', '');
      return ids.indexOf(saved) > -1 ? saved : ids[0];
    },

    setScene: function (id) {
      if (this.sceneIds().indexOf(id) === -1) return false;
      Store.set('boss.scene', id);
      this._built = '';
      if (this.active) {
        this.ensureBuilt();
        this.layer.classList.add('on');
        this.renderTable();     /* 层可见后才量得到真实宽度，重排一次列宽 */
        this.startTimers();
      }
      return true;
    },

    scene: function () {
      var S = global.BOSS_SCENES;
      return (S && S[this.sceneId]) || BOSS_FALLBACK;
    },

    /* ----------------------- 构建 ----------------------- */
    ensureBuilt: function () {
      var sid = this.getSceneId();
      if (this.layer && this._built === sid) return;
      this.sceneId = sid;
      this.destroy();
      this.build();
      this._built = sid;
    },

    destroy: function () {
      if (this.layer && this.layer.parentNode) this.layer.parentNode.removeChild(this.layer);
      if (this.hint && this.hint.parentNode) this.hint.parentNode.removeChild(this.hint);
      this.layer = null;
      this.hint = null;
      this._els = null;
    },

    resetView: function () {
      this.q = '';
      this.sortCol = -1;
      this.sortDir = 1;
      this.page = 0;
      this.statusFilter = '';
      this.selIndex = -1;
    },

    build: function () {
      var sc = this.scene();
      this.panelKey = sc.nav[0].key;
      this.resetView();

      var layer = document.createElement('div');
      layer.id = 'bossLayer';
      /* 每套身份一套主题色：顶部指标卡、导航选中态、头像、主按钮都跟着变，
         这样切身份不用细看文字也能分辨出是另一套系统 */
      var acc = sc.accent || '#2b6cf0';
      layer.style.setProperty('--bs-primary', acc);
      layer.style.setProperty('--bs-primary-soft', hexA(acc, 0.1));
      layer.style.setProperty('--bs-primary-line', hexA(acc, 0.32));
      layer.innerHTML =
        '<div class="bs-top">' +
          '<span class="bs-brand">' + bossIcon('box') + '<b>' + sc.product + '</b></span>' +
          '<label class="bs-search">' + bossIcon('search') +
            '<input id="bsSearch" type="text" autocomplete="off" spellcheck="false" ' +
            'placeholder="搜索编号、名称或责任人">' +
          '</label>' +
          '<span class="bs-topright">' +
            '<span class="bs-bell">' + bossIcon('bell') + '<i>3</i></span>' +
            '<span class="bs-clock" id="bsClock"></span>' +
            '<span class="bs-me"><i class="bs-avatar">' + sc.user.charAt(0) + '</i>' +
              '<span class="bs-me-t"><b>' + sc.user + '</b><small>' + sc.dept + '</small></span></span>' +
          '</span>' +
        '</div>' +
        '<div class="bs-notice"><i class="bs-dot"></i>' +
          '<span id="bsNotice"></span><em id="bsNoticeAgo"></em></div>' +
        '<div class="bs-body">' +
          '<div class="bs-scrim" id="bsScrim"></div>' +
          '<aside class="bs-nav" id="bsNav"></aside>' +
          '<main class="bs-main">' +
            '<div class="bs-crumb" id="bsCrumb"></div>' +
            '<div class="bs-head">' +
              '<h2 id="bsTitle"></h2>' +
              '<span class="bs-chips" id="bsChips"></span>' +
              '<span class="bs-tools">' +
                '<button class="bs-btn" id="bsRefresh">' + bossIcon('refresh') + '刷新</button>' +
                '<button class="bs-btn" id="bsExport">' + bossIcon('export') + '导出</button>' +
              '</span>' +
            '</div>' +
            '<div class="bs-metrics" id="bsMetrics">' + this.metricsHtml() + '</div>' +
            '<div class="bs-tablewrap"><table class="bs-table">' +
              '<thead id="bsThead"></thead><tbody id="bsTbody"></tbody></table></div>' +
            '<div class="bs-pager" id="bsPager"></div>' +
          '</main>' +
          '<aside class="bs-drawer" id="bsDrawer"></aside>' +
        '</div>' +
        '<div class="bs-status">' +
          '<span class="bs-conn"><i></i>系统正常</span>' +
          '<span class="bs-sep">|</span><span>节点 ' + (sc.node || 'sh-app-03') + '</span>' +
          '<span class="bs-sep">|</span><span>延迟 12ms</span>' +
          '<span class="bs-grow"></span>' +
          '<span id="bsSync">数据同步中…</span>' +
        '</div>';

      document.body.appendChild(layer);
      this.layer = layer;

      var hint = document.createElement('div');
      hint.className = 'boss-hint';
      hint.textContent = '再按 Esc 或点右键回到游戏';
      document.body.appendChild(hint);
      this.hint = hint;

      this._els = {
        clock: layer.querySelector('#bsClock'),
        sync: layer.querySelector('#bsSync'),
        notice: layer.querySelector('#bsNotice'),
        noticeAgo: layer.querySelector('#bsNoticeAgo'),
        search: layer.querySelector('#bsSearch')
      };

      this.bind();
      this.renderNav();
      this.renderMain();
      this.stampClock();
    },

    /* ----------------------- 事件 ----------------------- */
    bind: function () {
      var self = this;
      var layer = this.layer;

      layer.addEventListener('click', function (e) {
        e.stopPropagation();
        var t = e.target;
        if (!t || !t.closest) return;
        var el;

        if ((el = t.closest('.bs-nav-item'))) { self.switchPanel(el.dataset.key); return; }
        if ((el = t.closest('th[data-col]'))) { self.sortBy(parseInt(el.dataset.col, 10)); return; }
        if ((el = t.closest('tr.bs-row'))) { self.selectRow(parseInt(el.dataset.row, 10)); return; }
        if ((el = t.closest('.bs-chip'))) { self.filterStatus(el.dataset.st || ''); return; }
        if ((el = t.closest('[data-pg]'))) { self.goPage(el.dataset.pg); return; }
        if (t.closest('#bsRefresh')) { self.refresh(); return; }
        if (t.closest('#bsExport')) { global.FB.toast('导出任务已提交，可在「下载中心」查看'); return; }
        if (t.closest('.bs-dw-print')) { global.FB.toast('已发送至打印队列'); return; }
        if (t.closest('.bs-dw-close')) { self.selectRow(-1); return; }
      });

      this._els.search.addEventListener('input', function () {
        self.q = this.value.trim();
        self.page = 0;
        self.selIndex = -1;
        self.renderMain();
        self.renderDrawer();
      });
      this._els.search.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') e.preventDefault();
      });
    },

    /* ----------------------- 渲染 ----------------------- */
    /* 顶部指标卡：每套身份一套指标，是最直观的"这是另一套系统"的视觉锚点 */
    metricsHtml: function () {
      var ms = this.scene().metrics || [];
      if (!ms.length) return '';
      return ms.map(function (m) {
        return '<div class="bs-metric">' +
          '<span class="bs-metric-l">' + m.l + '</span>' +
          '<span class="bs-metric-v">' + m.v + (m.u ? '<em>' + m.u + '</em>' : '') + '</span>' +
          '<span class="bs-metric-d ' + (m.t || 'flat').replace(/[^a-z]/g, '') + '">' + (m.d || '') + '</span>' +
        '</div>';
      }).join('');
    },

    renderNav: function () {
      var sc = this.scene(), self = this;
      var html = '<div class="bs-nav-t">' + (sc.navGroup || '业务处理') + '</div>';
      sc.nav.forEach(function (n) {
        var pn = sc.panels[n.key];
        var cnt = pn ? pn.rows.length : 0;
        html += '<a class="bs-nav-item' + (n.key === self.panelKey ? ' on' : '') + '" data-key="' + n.key + '">' +
          bossIcon(n.icon) + '<span>' + n.label + '</span><i class="bs-cnt">' + cnt + '</i></a>';
      });
      html += '<div class="bs-nav-foot"><i class="bs-avatar">' + sc.user.charAt(0) + '</i>' +
        '<span class="bs-me-t"><b>' + sc.user + '</b><small>' + sc.dept + '</small></span></div>';
      this.layer.querySelector('#bsNav').innerHTML = html;
    },

    statusCol: function (pn) {
      for (var i = 0; i < pn.cols.length; i++) if (pn.cols[i].k === 'status') return i;
      return -1;
    },

    titleCol: function (pn) {
      for (var i = 0; i < pn.cols.length; i++) if (pn.cols[i].k === 'strong') return i;
      return 1;
    },

    renderMain: function () {
      var sc = this.scene();
      var pn = sc.panels[this.panelKey];
      if (!pn) return;
      var L = this.layer, self = this;

      L.querySelector('#bsCrumb').innerHTML = pn.crumb.map(function (s) {
        return '<span>' + s + '</span>';
      }).join('<i>/</i>');

      L.querySelector('#bsTitle').textContent = pn.title;

      /* 状态筛选胶囊：从当前数据里统计，点击可筛 */
      var si = this.statusCol(pn);
      var chips = '';
      if (si > -1) {
        var counts = {}, order = [];
        pn.rows.forEach(function (r) {
          var v = r[si];
          if (!(v in counts)) { counts[v] = 0; order.push(v); }
          counts[v]++;
        });
        chips += '<a class="bs-chip' + (this.statusFilter === '' ? ' on' : '') + '" data-st="">全部 ' +
          pn.rows.length + '</a>';
        order.forEach(function (v) {
          chips += '<a class="bs-chip' + (self.statusFilter === v ? ' on' : '') + '" data-st="' + v + '">' +
            v + ' ' + counts[v] + '</a>';
        });
      }
      L.querySelector('#bsChips').innerHTML = chips;

      this.renderTable();
      this.renderDrawer();
    },

    rowsView: function () {
      var pn = this.scene().panels[this.panelKey];
      var si = this.statusCol(pn);
      var list = [];
      for (var i = 0; i < pn.rows.length; i++) list.push({ cells: pn.rows[i], i: i });

      if (this.q) {
        var q = this.q.toLowerCase();
        list = list.filter(function (it) {
          return it.cells.join(' ').toLowerCase().indexOf(q) > -1;
        });
      }
      if (this.statusFilter && si > -1) {
        var sf = this.statusFilter;
        list = list.filter(function (it) { return it.cells[si] === sf; });
      }
      if (this.sortCol > -1) {
        var col = this.sortCol, dir = this.sortDir;
        list.sort(function (a, b) {
          var x = a.cells[col], y = b.cells[col];
          var xs = String(x), ys = String(y);
          var isNum = /^[\d,.\-]+$/.test(xs) && /^[\d,.\-]+$/.test(ys);
          if (isNum) {
            var nx = parseFloat(xs.replace(/,/g, '')), ny = parseFloat(ys.replace(/,/g, ''));
            if (!isNaN(nx) && !isNaN(ny)) return (nx - ny) * dir;
          }
          return xs.localeCompare(ys, 'zh') * dir;
        });
      }
      return list;
    },

    renderTable: function () {
      var pn = this.scene().panels[this.panelKey];
      if (!pn) return;
      var L = this.layer, self = this;
      var si = this.statusCol(pn);
      var rows = this.rowsView();

      var pages = Math.max(1, Math.ceil(rows.length / BOSS_PER_PAGE));
      if (this.page > pages - 1) this.page = pages - 1;
      if (this.page < 0) this.page = 0;
      var start = this.page * BOSS_PER_PAGE;
      var view = rows.slice(start, start + BOSS_PER_PAGE);

      /* 表头：列宽按权重换算成百分比，任何容器宽度下都恰好铺满，
         不会出现某一列被挤出视野或半截裁掉的情况 */
      var IDX_W = 44;             /* 序号列 */
      var FLEX_W = 190;           /* 主标题列（未指定宽度）的基准权重 */
      var weights = [];
      var totalW = IDX_W;
      for (var wi = 0; wi < pn.cols.length; wi++) {
        var wc = pn.cols[wi];
        /* 状态列里是可换行不了的标签，给个下限，避免被压成半截 */
        var ww = wc.k === 'status' ? Math.max(wc.w || 0, 104) : (wc.w || FLEX_W);
        weights.push(ww);
        totalW += ww;
      }
      var pct = function (v) { return (v / totalW * 100).toFixed(3) + '%'; };

      var thead = '<tr><th class="bs-idx" style="width:' + pct(IDX_W) + '">#</th>';
      for (var i = 0; i < pn.cols.length; i++) {
        var c = pn.cols[i];
        var cls = this.sortCol === i ? ' sorted' : '';
        var arrow = this.sortCol === i ? (this.sortDir > 0 ? ' ↑' : ' ↓') : '';
        thead += '<th data-col="' + i + '" class="bs-col-' + (c.k || 'text') + cls +
          '" style="width:' + pct(weights[i]) + '">' + c.l + arrow + '</th>';
      }
      thead += '</tr>';
      L.querySelector('#bsThead').innerHTML = thead;

      /* 容器够宽就按比例铺满；窄到放不下时才设下限，宁可横向滚动，
         也别把文字压成「需…」「招…」这种一列一个字的碎片 */
      var tableEl = L.querySelector('.bs-table');
      var wrapW = (L.querySelector('.bs-tablewrap') || {}).clientWidth || 0;
      tableEl.style.minWidth = wrapW >= 640 ? '0px' : Math.max(620, Math.min(totalW, 880)) + 'px';

      /* 表体 */
      var tb = '';
      if (!view.length) {
        tb = '<tr class="bs-empty"><td colspan="' + (pn.cols.length + 1) + '">没有匹配的记录，试试调整搜索词或筛选条件</td></tr>';
      } else {
        view.forEach(function (it, idx) {
          tb += '<tr class="bs-row' + (it.i === self.selIndex ? ' on' : '') + '" data-row="' + it.i + '">' +
            '<td class="bs-idx">' + (start + idx + 1) + '</td>';
          for (var ci = 0; ci < pn.cols.length; ci++) {
            var col = pn.cols[ci] || {};
            var v = it.cells[ci] === undefined ? '' : it.cells[ci];
            if (col.k === 'status') {
              tb += '<td><span class="bs-tag ' + bossStatusKind(v) + '">' + v + '</span></td>';
            } else {
              var tip = (v === undefined || v === '') ? '' : ' title="' + String(v).replace(/"/g, '&quot;') + '"';
              tb += '<td class="' + (col.k ? 'bs-' + col.k : '') + '"' + tip + '>' + v + '</td>';
            }
          }
          tb += '</tr>';
        });
      }
      L.querySelector('#bsTbody').innerHTML = tb;

      /* 分页 */
      L.querySelector('#bsPager').innerHTML =
        '<span class="bs-total">共 ' + rows.length + ' 条' +
          (this.q || this.statusFilter ? ' · 已筛选' : '') + '</span>' +
        '<span class="bs-grow"></span>' +
        '<button class="bs-pg" data-pg="prev"' + (this.page === 0 ? ' disabled' : '') + '>上一页</button>' +
        '<span class="bs-pgn">' + (this.page + 1) + ' / ' + pages + '</span>' +
        '<button class="bs-pg" data-pg="next"' + (this.page >= pages - 1 ? ' disabled' : '') + '>下一页</button>';
    },

    renderDrawer: function () {
      var d = this.layer.querySelector('#bsDrawer');
      var pn = this.scene().panels[this.panelKey];
      var row = pn && this.selIndex > -1 ? pn.rows[this.selIndex] : null;
      var scrim = this.layer.querySelector('#bsScrim');
      if (scrim) scrim.classList.toggle('on', !!row);
      if (!row) {
        d.classList.remove('on');
        d.innerHTML = '';
        return;
      }

      var sc = this.scene();
      var si = this.statusCol(pn);
      var ti = this.titleCol(pn);
      var status = si > -1 ? row[si] : '';

      /* 流程走到第几步：按状态粗略推断，只求看起来合理。
         模块可自带流程（如人力里「员工档案」不该用招聘流程），否则用场景默认 */
      var nodes = pn.flow || sc.flow || ['登记', '受理', '处理', '完成'];
      var kind = bossStatusKind(status);
      var stopAt;
      if (kind === 'danger') stopAt = Math.max(1, Math.floor(nodes.length / 2) - 1);
      else if (kind === 'warn') stopAt = Math.max(1, nodes.length - 3);
      else if (kind === 'ok') stopAt = nodes.length - 1;
      else stopAt = Math.max(2, nodes.length - 2);

      var now = new Date();
      var flowHtml = '';
      for (var i = 0; i < nodes.length; i++) {
        var done = i <= stopAt;
        var dt = new Date(now.getTime() - (stopAt - i) * 86400000 - (i * 1400000));
        var stamp = (dt.getMonth() + 1) + '-' + bossPad2(dt.getDate()) + ' ' +
          bossPad2(9 + (i % 8)) + ':' + bossPad2((i * 13 + 7) % 60);
        flowHtml += '<li class="' + (done ? 'done' : '') + '"><i></i><span>' + nodes[i] + '</span>' +
          '<em>' + (done ? stamp : '—') + '</em></li>';
      }

      var fields = '';
      for (var k = 0; k < pn.cols.length; k++) {
        if (k === ti) continue;
        var cv = row[k] === undefined ? '' : row[k];
        fields += '<div class="bs-dw-f"><label>' + pn.cols[k].l + '</label>' +
          (pn.cols[k].k === 'status'
            ? '<span class="bs-tag ' + bossStatusKind(cv) + '">' + cv + '</span>'
            : '<span>' + (cv === '' ? '—' : cv) + '</span>') + '</div>';
      }

      d.innerHTML =
        '<div class="bs-dw-head"><b>详情信息</b>' +
          '<button class="bs-dw-close" title="关闭">' + bossIcon('close') + '</button></div>' +
        '<div class="bs-dw-body">' +
          '<div class="bs-dw-title">' + row[ti] + '</div>' +
          '<div class="bs-dw-meta"><span class="bs-dw-no">' + row[0] + '</span>' +
            (si > -1 ? '<span class="bs-tag ' + bossStatusKind(status) + '">' + status + '</span>' : '') +
          '</div>' +
          '<div class="bs-dw-fields">' + fields + '</div>' +
          '<div class="bs-dw-sub">流转记录</div>' +
          '<ol class="bs-flow">' + flowHtml + '</ol>' +
          '<div class="bs-dw-sub">相关附件</div>' +
          '<ul class="bs-files">' +
            '<li>' + bossIcon('doc') + '相关资料.pdf<em>1.2 MB</em></li>' +
            '<li>' + bossIcon('doc') + '复核记录.xlsx<em>86 KB</em></li>' +
            '<li>' + bossIcon('doc') + '审批单.docx<em>124 KB</em></li>' +
          '</ul>' +
        '</div>' +
        '<div class="bs-dw-foot">' +
          '<button class="bs-btn bs-dw-print">' + bossIcon('print') + '打印</button>' +
          '<button class="bs-btn bs-btn-primary bs-dw-close">关闭</button>' +
        '</div>';
      d.classList.add('on');
    },

    /* ----------------------- 交互动作 ----------------------- */
    switchPanel: function (key) {
      var sc = this.scene();
      if (!sc.panels[key] || key === this.panelKey) return;
      this.panelKey = key;
      this.resetView();
      this._els.search.value = '';
      this.renderNav();
      this.renderMain();
    },

    sortBy: function (col) {
      if (col < 0) return;
      if (this.sortCol === col) this.sortDir = -this.sortDir;
      else { this.sortCol = col; this.sortDir = 1; }
      this.page = 0;
      this.renderMain();
    },

    filterStatus: function (st) {
      this.statusFilter = (this.statusFilter === st) ? '' : st;
      this.page = 0;
      this.selIndex = -1;
      this.renderMain();
    },

    goPage: function (dir) {
      var pages = Math.max(1, Math.ceil(this.rowsView().length / BOSS_PER_PAGE));
      if (dir === 'prev') this.page = Math.max(0, this.page - 1);
      else this.page = Math.min(pages - 1, this.page + 1);
      this.renderTable();
    },

    selectRow: function (i) {
      this.selIndex = i;
      this.renderTable();
      this.renderDrawer();
    },

    refresh: function () {
      var self = this;
      var btn = this.layer.querySelector('#bsRefresh');
      btn.classList.add('spin');
      setTimeout(function () {
        btn.classList.remove('spin');
        self.markSync();
        global.FB.toast('数据已更新');
      }, 600);
    },

    /* ----------------------- 活着的细节 ----------------------- */
    stampClock: function () {
      if (!this._els || !this._els.clock) return;
      var d = new Date();
      this._els.clock.textContent = d.getFullYear() + '-' + bossPad2(d.getMonth() + 1) + '-' +
        bossPad2(d.getDate()) + ' ' + bossPad2(d.getHours()) + ':' +
        bossPad2(d.getMinutes()) + ':' + bossPad2(d.getSeconds());
    },

    markSync: function () {
      if (!this._els || !this._els.sync) return;
      var d = new Date();
      this._els.sync.textContent = '数据同步于 ' + bossPad2(d.getHours()) + ':' +
        bossPad2(d.getMinutes()) + ':' + bossPad2(d.getSeconds());
    },

    startTimers: function () {
      var self = this;
      this.stopTimers();
      this.stampClock();
      this.markSync();

      this._clock = setInterval(function () {
        self.stampClock();
        /* 同步时间每 6 秒轻微跳一次，像真的在拉数据 */
        if (new Date().getSeconds() % 6 === 0) self.markSync();
      }, 1000);

      var ni = 0;
      var putNotice = function () {
        var sc = self.scene();
        if (!sc.notices || !sc.notices.length || !self._els) return;
        self._els.notice.textContent = sc.notices[ni % sc.notices.length];
        self._els.noticeAgo.textContent = (1 + (ni * 3) % 17) + ' 分钟前';
        ni++;
      };
      putNotice();
      this._notice = setInterval(putNotice, 8000);
    },

    stopTimers: function () {
      clearInterval(this._clock); this._clock = null;
      clearInterval(this._notice); this._notice = null;
      clearTimeout(this._hintTimer);
    },

    /* ----------------------- 显示 / 隐藏 ----------------------- */
    show: function () {
      this.ensureBuilt();
      this.layer.classList.add('on');
      this.active = true;
      this.renderTable();   /* 构建时层是 display:none，量不到宽度，显示出来后再排一次 */
      var hint = this.hint;
      hint.classList.add('on');
      clearTimeout(this._hintTimer);
      this._hintTimer = setTimeout(function () { hint.classList.remove('on'); }, 1800);
      this.startTimers();
      if (typeof this.onToggle === 'function') this.onToggle(true);
    },

    hide: function () {
      this.stopTimers();
      if (this.layer) this.layer.classList.remove('on');
      if (this.hint) this.hint.classList.remove('on');
      this.active = false;
      if (typeof this.onToggle === 'function') this.onToggle(false);
    },

    toggle: function () {
      if (this.active) this.hide(); else this.show();
    },

    init: function () {
      var self = this;

      /* 捕获阶段截获键盘：伪装层打开时游戏收不到任何按键，
         否则在搜索框里打字会把游戏操作一通（空格硬降、方向键移动）。
         不 preventDefault，输入框照常输入。 */
      document.addEventListener('keydown', function (e) {
        if (self.active) {
          if (e.key === 'Escape' || e.key === 'Esc') {
            e.preventDefault();
            self.hide();
          } else {
            e.stopPropagation();
          }
          return;
        }
        if (e.key === 'Escape' || e.key === 'Esc') {
          e.preventDefault();
          self.show();
        }
      }, true);

      /* 右键：手不用离开鼠标，比找 Esc 快。
         用冒泡阶段监听，游戏可对某块区域 stopPropagation 来豁免（如扫雷插旗）。 */
      document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        self.toggle();
      });

      /* 中键：扫雷棋盘上右键被插旗占用时的备用触发；链接上仍交给浏览器开新标签 */
      document.addEventListener('mousedown', function (e) {
        if (e.button === 1 && !(e.target.closest && e.target.closest('a'))) e.preventDefault();
      });
      document.addEventListener('auxclick', function (e) {
        if (e.button !== 1) return;
        if (e.target.closest && e.target.closest('a')) return;
        e.preventDefault();
        self.toggle();
      });

      document.querySelectorAll('[data-boss]').forEach(function (el) {
        el.addEventListener('click', function (e) { e.preventDefault(); self.toggle(); });
      });

      /* 视口变化后重新排一次表：列宽是算出来的，不重排会留旧宽度 */
      var rt = null;
      global.addEventListener('resize', function () {
        if (!self.active || !self.layer) return;
        clearTimeout(rt);
        rt = setTimeout(function () { if (self.active) self.renderTable(); }, 120);
      });
    }
  };

  /* ------------------------ 小工具 ------------------------ */
  function toast(msg, ms) {
    var el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = 'position:fixed;left:50%;bottom:34px;transform:translateX(-50%);' +
      'padding:10px 20px;border-radius:999px;background:rgba(24,28,44,.9);color:#fff;' +
      'font-size:13px;z-index:99999;pointer-events:none;transition:opacity .3s,transform .3s;' +
      'backdrop-filter:blur(8px);font-weight:600;';
    document.body.appendChild(el);
    setTimeout(function () { el.style.opacity = '0'; el.style.transform = 'translateX(-50%) translateY(8px)'; }, (ms || 1600) - 300);
    setTimeout(function () { el.remove(); }, ms || 1600);
  }

  function randInt(n) { return Math.floor(Math.random() * n); }

  function fmtTime(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function fmtNum(n) {
    return (n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /* 全站初始化：主题 / 音效按钮 / 老板键 */
  function initCommon() {
    Theme.init();
    Boss.init();

    document.querySelectorAll('[data-theme-toggle]').forEach(function (el) {
      el.addEventListener('click', function () { Theme.toggle(); });
    });
    document.querySelectorAll('[data-theme-icon]').forEach(function (el) {
      el.innerHTML = Theme.get() === 'dark' ? Theme.ICON_SUN : Theme.ICON_MOON;
    });
    document.querySelectorAll('[data-sound-toggle]').forEach(function (el) {
      el.innerHTML = Sound.enabled() ? Sound.ICON_ON : Sound.ICON_OFF;
      el.addEventListener('click', function () {
        var on = Sound.toggle();
        el.innerHTML = on ? Sound.ICON_ON : Sound.ICON_OFF;
        toast(on ? '音效已开启' : '音效已关闭');
      });
    });
  }

  global.FB = {
    Store: Store,
    Sound: Sound,
    Theme: Theme,
    Boss: Boss,
    toast: toast,
    randInt: randInt,
    fmtTime: fmtTime,
    fmtNum: fmtNum,
    initCommon: initCommon
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommon);
  } else {
    initCommon();
  }
})(window);
