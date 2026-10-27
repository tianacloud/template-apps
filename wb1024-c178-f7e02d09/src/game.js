
(function () {
  'use strict';

  /* ============================================================
     三境定义
     ============================================================ */
  var THEMES = [
    {
      id: 'fish', icon: '🐟', name: '摸鱼', sub: '肉身偷懒',
      resName: '鱼', resIcon: '🐟',
      clickName: '摸 鱼', clickIcon: '🐟', clickLabel: '摸鱼',
      maskName: '装忙', maskIcon: '💼', maskDesc: '切到工作界面',
      maskWord: '装忙',
      riskName: '老板巡逻', riskIcon: '🧑‍💼', riskTag: '巡逻中', riskWarn: '脚步声逼近',
      riskIdle: '老板还没来，放心摸。',
      riskWarnText: '脚步声逼近 —— 空格装忙，或直接点鱼！',
      riskHere: '老板在你身后站住了……',
      prestigeName: '辞职', prestigeIcon: '🚪', prestigeCur: '摸鱼之魂',
      buyTitle: '摸鱼手段',
      buyNote: '老板过来时按空格装忙（或直接点鱼）—— 装忙期间产出降到 40%，但绝不会被抓。',
      preNote: '辞职会清空本境的鱼和摸鱼手段，但每点魂永久 +12% 本境产出。本境攒够 100 万鱼才能提出第一次辞职。',
      c1: '#ffd7a8', c2: '#f7a86b', c3: '#ef7b3d', sh: '#c95a26',
      glow: 'rgba(201,90,38,.6)', ink: '#5a2a08',
      accent: '#f26b3a', accentD: '#d8552a', accentL: '#fff5ee', tint: '#ffffff',
      flip: '顺手把屏切成表格',
      buildings: [
        { icon:'🤚', name:'摸鱼手势',     desc:'指尖轻点，鱼自天降',             rate:0.1,  cost:15 },
        { icon:'⌨️', name:'切屏肌肉记忆', desc:'Alt+Tab 来回切，神不知鬼不觉',   rate:0.6,  cost:120 },
        { icon:'🚽', name:'带薪如厕',     desc:'一天八趟，每趟二十分钟',         rate:2,    cost:900 },
        { icon:'🤐', name:'会议隐身术',   desc:'镜头不开，麦克风静音，人已睡着', rate:9,    cost:6500 },
        { icon:'🤖', name:'自动摸鱼脚本', desc:'定时移动鼠标，模拟真人行为',     rate:40,   cost:48000 },
        { icon:'☕', name:'无限续杯',     desc:'端着杯子在走廊溜达一小时',       rate:180,  cost:350000 },
        { icon:'💬', name:'摸鱼水友群',   desc:'两百人一起研究怎么不干活',       rate:800,  cost:2600000 },
        { icon:'🧠', name:'AI 代摸副驾',  desc:'它替你摸鱼，你替它领工资',       rate:3600, cost:19000000 }
      ],
      dodges: ['你切到表格，老板满意地走了。','老板看了一眼你的屏幕，点头离开。','完美！Ctrl+S 的声音就是最好的掩护。','你假装在读需求文档，老板信了。'],
      caughts: ['老板：“你这个页面……是在摸鱼吧？”','被抓现行！','老板站在你身后已经三分钟了。','HR 正在走过来的路上。'],
      tips: ['老板还没来，放心摸。','同事都在忙，只有你在增长。','今天的 KPI 是摸够一万条鱼。','别抬头，抬头就是加班。','多喝水，多上厕所，多摸鱼。']
    },
    {
      id: 'wood', icon: '🥁', name: '敲木鱼', sub: '带薪禅修',
      resName: '功德', resIcon: '🌸',
      clickName: '敲 木 鱼', clickIcon: '🥁', clickLabel: '敲木鱼',
      maskName: '入定', maskIcon: '🧘', maskDesc: '闭眼假装打坐',
      maskWord: '入定',
      riskName: '方丈巡堂', riskIcon: '👴', riskTag: '巡堂中', riskWarn: '木鱼声停了',
      riskIdle: '方丈还没来，安心敲。',
      riskWarnText: '走廊传来念珠声 —— 立刻入定，或点木鱼！',
      riskHere: '方丈站在你禅房门口了……',
      prestigeName: '还俗', prestigeIcon: '🏃', prestigeCur: '禅心',
      buyTitle: '修行法门',
      buyNote: '方丈巡堂时按空格入定（或直接点木鱼）—— 入定期间功德产出降到 40%，但绝不会被点名。',
      preNote: '还俗会清空本境的功德和修行法门，但每点禅心永久 +12% 本境产出。本境攒够 100 万功德才能提出第一次还俗。',
      c1: '#f8e6bb', c2: '#dcae55', c3: '#b8802a', sh: '#8d5f16',
      glow: 'rgba(141,95,22,.55)', ink: '#4a3208',
      accent: '#c08a2e', accentD: '#9c6c1c', accentL: '#fdf7e9', tint: '#fffdf7',
      flip: '摆出打坐的姿势',
      buildings: [
        { icon:'🥁', name:'单手木鱼',   desc:'一只木鱼敲一下午，功德微微涨',   rate:0.1,  cost:20 },
        { icon:'📿', name:'念珠一串',   desc:'一边拨珠一边假装在思考架构',     rate:0.7,  cost:150 },
        { icon:'🧘', name:'禅房工位',   desc:'把工位布置成禅房，无人敢打扰',   rate:2.5,  cost:1100 },
        { icon:'🏔️', name:'带薪闭关',   desc:'请三天假，回来说在闭关修行',     rate:11,   cost:8000 },
        { icon:'📱', name:'电子木鱼 App', desc:'一天敲十万下，功德自动结算',   rate:48,   cost:60000 },
        { icon:'🔔', name:'自动诵经机', desc:'循环播放，功德稳定输出',         rate:200,  cost:420000 },
        { icon:'🏯', name:'寺庙云监院', desc:'远程管理一座庙的香火功德',       rate:900,  cost:3000000 },
        { icon:'🌸', name:'电子佛龛 AI', desc:'AI 替你修行，你替它上市',       rate:3200, cost:22000000 }
      ],
      dodges: ['你闭眼入定，方丈满意地走了。','方丈看你盘腿而坐，点点头。','你把木鱼收进抽屉，装作在冥想。','呼吸放慢，心率降到 50，方丈信了。'],
      caughts: ['方丈：“你这木鱼敲得比代码还快。”','被点名了！功德被扣了一笔。','方丈在你身后听你敲了五分钟。','你被拉去一起做晚课了。'],
      tips: ['方丈还没来，安心敲。','功德无量，摸鱼无价。','敲一下，少一行 bug。','心静了，代码自然就跑通了。','别急着开悟，先开工资。']
    },
    {
      id: 'screw', icon: '🔩', name: '拧螺丝', sub: '赛博搬砖',
      resName: '螺丝', resIcon: '🔩',
      clickName: '拧 螺 丝', clickIcon: '🔩', clickLabel: '拧螺丝',
      maskName: '假卡顿', maskIcon: '💤', maskDesc: '让机械臂假装过热',
      maskWord: '假卡顿',
      riskName: 'AI 巡检', riskIcon: '👁️', riskTag: '巡检中', riskWarn: '探头转向你',
      riskIdle: '监控探头还没转过来。',
      riskWarnText: '监控探头正在转向你 —— 立刻假卡顿，或点螺丝！',
      riskHere: '巡检 AI 正在分析你的操作日志……',
      prestigeName: '关机', prestigeIcon: '⏻', prestigeCur: '固件',
      buyTitle: '产线升级',
      buyNote: 'AI 巡检时按空格假卡顿（或直接点螺丝）—— 卡顿期间螺丝产出降到 40%，但巡检 AI 会判定你在待机。',
      preNote: '关机会清空本境的螺丝和产线升级，但每点固件永久 +12% 本境产出。本境攒够 100 万螺丝才能提出第一次关机。',
      c1: '#d3ebf7', c2: '#74aecb', c3: '#3d7ea8', sh: '#265a78',
      glow: 'rgba(38,90,120,.55)', ink: '#123244',
      accent: '#3a7ea8', accentD: '#265a78', accentL: '#eff7fb', tint: '#fafdff',
      flip: '让机械臂进入待机',
      buildings: [
        { icon:'🔧', name:'手动螺丝刀',  desc:'一颗一颗拧，手速即产能',         rate:0.12, cost:18 },
        { icon:'🔌', name:'电动起子',    desc:'转速拉满，螺丝直接进去',         rate:0.8,  cost:130 },
        { icon:'🏭', name:'流水线工位',  desc:'站上去就有人替你计时',           rate:3,    cost:950 },
        { icon:'🦾', name:'六轴机械臂',  desc:'一次抓六颗，永不喊累',           rate:12,   cost:7000 },
        { icon:'⚙️', name:'自动拧螺丝机', desc:'进料、对位、拧紧，全自动',      rate:52,   cost:52000 },
        { icon:'🌑', name:'黑灯工厂',    desc:'灯都不开，机器自己在干活',       rate:210,  cost:380000 },
        { icon:'🛰️', name:'数字孪生产线', desc:'实体没动，模型已经产完了',      rate:950,  cost:2800000 },
        { icon:'🤖', name:'全自动赛博工厂', desc:'连你都不需要了，只留工号',    rate:3800, cost:20000000 }
      ],
      dodges: ['你的机械臂冒了点烟，巡检 AI 判定为过热待机。','你把日志刷成 ERROR，AI 以为你在排障。','产线暂停 3 秒，AI 归类为正常抖动。','你伪装成一次 GC，AI 直接跳过了。'],
      caughts: ['巡检 AI：“异常空闲时长 3 分钟。”','被抓包！螺丝被扣了一笔。','AI 把你的操作日志标红了。','你被自动排进了优化名单。'],
      tips: ['监控探头还没转过来。','螺丝要拧，工资要拿。','能自动化的，就别自己动手。','黑灯工厂不需要人，但需要工号。','别让 AI 发现你比它闲。']
    }
  ];

  /* ============================================================
     成就
     ============================================================ */
  function lifeMax(s) {
    return Math.max(s.themes[0].lifetime, s.themes[1].lifetime, s.themes[2].lifetime);
  }
  function preMin(s) {
    return Math.min(s.themes[0].prestige, s.themes[1].prestige, s.themes[2].prestige);
  }
  function preSum(s) {
    return s.themes[0].prestige + s.themes[1].prestige + s.themes[2].prestige;
  }
  function hasAnyBuilding(s) {
    for (var t = 0; t < 3; t++) {
      var sum = 0;
      for (var i = 0; i < 8; i++) sum += s.themes[t].b[i];
      if (sum > 0) return true;
    }
    return false;
  }
  function allHaveBuilding(s) {
    for (var t = 0; t < 3; t++) {
      var sum = 0;
      for (var i = 0; i < 8; i++) sum += s.themes[t].b[i];
      if (sum === 0) return false;
    }
    return true;
  }

  var ACHIEVEMENTS = [
    { id:'first',  icon:'🐣', name:'初尝甜头',   desc:'摸鱼 1 次',            test:function(s){ return s.themes[0].clicks >= 1; },   prog:function(s){ return Math.min(s.themes[0].clicks,1) + '/1'; } },
    { id:'hand500',icon:'🖐️', name:'手都摸麻了', desc:'摸鱼 500 次',          test:function(s){ return s.themes[0].clicks >= 500; }, prog:function(s){ return Math.min(s.themes[0].clicks,500) + '/500'; } },
    { id:'wood500',icon:'🥁', name:'木鱼敲穿',   desc:'敲木鱼 500 次',        test:function(s){ return s.themes[1].clicks >= 500; }, prog:function(s){ return Math.min(s.themes[1].clicks,500) + '/500'; } },
    { id:'scr500', icon:'🔩', name:'螺丝拧滑丝', desc:'拧螺丝 500 次',        test:function(s){ return s.themes[2].clicks >= 500; }, prog:function(s){ return Math.min(s.themes[2].clicks,500) + '/500'; } },
    { id:'three1', icon:'🔱', name:'三境全开',   desc:'三境各至少买 1 个',    test:function(s){ return allHaveBuilding(s); },        prog:function(s){ var n=0; for(var t=0;t<3;t++){ var sum=0; for(var i=0;i<8;i++) sum+=s.themes[t].b[i]; if(sum>0) n++; } return n + '/3'; } },
    { id:'three2', icon:'🌀', name:'三境皆通',   desc:'三境都转生过一次',      test:function(s){ return preMin(s) >= 1; },            prog:function(s){ var n=0; for(var t=0;t<3;t++) if(s.themes[t].prestige>=1) n++; return n + '/3'; } },
    { id:'k1',     icon:'💰', name:'第一个一万', desc:'任一境累计 1 万',      test:function(s){ return lifeMax(s) >= 10000; },       prog:function(s){ return fmt(Math.min(lifeMax(s),10000)) + '/1万'; } },
    { id:'m1',     icon:'🏦', name:'百万修行',   desc:'任一境累计 100 万',    test:function(s){ return lifeMax(s) >= 1e6; },         prog:function(s){ return fmt(Math.min(lifeMax(s),1e6)) + '/100万'; } },
    { id:'y1',     icon:'🌌', name:'亿级社畜',   desc:'任一境累计 1 亿',      test:function(s){ return lifeMax(s) >= 1e8; },         prog:function(s){ return fmt(Math.min(lifeMax(s),1e8)) + '/1亿'; } },
    { id:'wc',     icon:'🚽', name:'带薪如厕达人', desc:'带薪如厕 25 级',     test:function(s){ return s.themes[0].b[2] >= 25; },     prog:function(s){ return Math.min(s.themes[0].b[2],25) + '/25'; } },
    { id:'meet',   icon:'🤐', name:'会议之神',   desc:'会议隐身术 25 级',     test:function(s){ return s.themes[0].b[3] >= 25; },     prog:function(s){ return Math.min(s.themes[0].b[3],25) + '/25'; } },
    { id:'app',    icon:'📱', name:'电子木鱼',   desc:'解锁电子木鱼 App',     test:function(s){ return s.themes[1].b[4] >= 1; },      prog:function(s){ return (s.themes[1].b[4] >= 1 ? 1 : 0) + '/1'; } },
    { id:'dark',   icon:'🌑', name:'黑灯工厂',   desc:'解锁黑灯工厂',         test:function(s){ return s.themes[2].b[5] >= 1; },      prog:function(s){ return (s.themes[2].b[5] >= 1 ? 1 : 0) + '/1'; } },
    { id:'dodge',  icon:'😎', name:'老油条',     desc:'累计躲过 20 次',       test:function(s){ return totalDodge(s) >= 20; },        prog:function(s){ return Math.min(totalDodge(s),20) + '/20'; } },
    { id:'streak', icon:'🔥', name:'装忙宗师',   desc:'单境连击达到 10',      test:function(s){ return bestStreak(s) >= 10; },        prog:function(s){ return Math.min(bestStreak(s),10) + '/10'; } },
    { id:'caught', icon:'😱', name:'当场抓获',   desc:'被查到 1 次',          test:function(s){ return totalCaught(s) >= 1; },        prog:function(s){ return (totalCaught(s) >= 1 ? 1 : 0) + '/1'; } },
    { id:'lvl10',  icon:'🆔', name:'十级社畜',   desc:'摸龄达到 10 级',       test:function(s){ return levelOf(s) >= 10; },           prog:function(s){ return levelOf(s) + '/10'; } },
    { id:'soul50', icon:'👻', name:'道行自由',   desc:'三境道行总和 50',      test:function(s){ return preSum(s) >= 50; },            prog:function(s){ return Math.min(preSum(s),50) + '/50'; } }
  ];

  /* ============================================================
     点击强化：三条独立升级线
     ============================================================ */
  var UPGRADES = [
    { key:'speed',  icon:'⚡', name:'手速',   max:60, base:25,   growth:1.16,
      desc:function(t){ return '每次点击 +' + (t.clickLvl - 1) + ' 固定值'; } },
    { key:'power',  icon:'💪', name:'手劲',   max:40, base:600,  growth:1.34,
      desc:function(t){ return '按每秒产出 ' + Math.round(powerRatio(t) * 100) + '% 加成'; } },
    { key:'crit',   icon:'🎯', name:'暴击',   max:25, base:1800, growth:1.75,
      desc:function(t){ return '暴击率 ' + Math.round(critChance(t) * 100) + '%，' + (critMult(t)).toFixed(1) + ' 倍'; } }
  ];

  function powerRatio(t) { return 0.03 + (t.up.power || 0) * 0.012; }
  function critChance(t) {
    if (!t.up.crit) return 0.02;
    return Math.min(0.55, 0.02 + t.up.crit * 0.022);
  }
  function critMult(t) { return 2.2 + (t.up.crit || 0) * 0.18; }

  function upgradeCost(t, idx) {
    var u = UPGRADES[idx];
    var lv = t.up[u.key] || 0;
    return Math.ceil(u.base * Math.pow(u.growth, lv));
  }
  function upgradeLevel(t, idx) { return t.up[UPGRADES[idx].key] || 0; }
  function upMaxed(t, idx) { return upgradeLevel(t, idx) >= UPGRADES[idx].max; }

  /* ============================================================
     目标链：这一局的主线，永久 +8% 全局（转生不清空）
     ============================================================ */
  var GOALS = [
    { id:'g1', icon:'🐟', text:'任一境累计 1 万',        need:1e4,   get:function(s){ return lifeMax(s); } },
    { id:'g2', icon:'🔧', text:'三境各转生 1 次',        need:1,     get:function(s){ return preMin(s); } },
    { id:'g3', icon:'🏦', text:'任一境累计 100 万',      need:1e6,   get:function(s){ return lifeMax(s); } },
    { id:'g4', icon:'🌀', text:'三境道行各 5 点',        need:5,     get:function(s){ return preMin(s); } },
    { id:'g5', icon:'🌌', text:'任一境累计 1 亿',        need:1e8,   get:function(s){ return lifeMax(s); } },
    { id:'g6', icon:'🔥', text:'单境连击达到 20',        need:20,    get:function(s){ return bestStreak(s); } },
    { id:'g7', icon:'👑', text:'三境道行各 25 点',       need:25,    get:function(s){ return preMin(s); } },
    { id:'g8', icon:'🚀', text:'任一境累计 1 万亿',      need:1e12,  get:function(s){ return lifeMax(s); } }
  ];

  function goalDone(s, i) { return s.goals && s.goals[GOALS[i].id] ? 1 : 0; }
  function goalCount(s) {
    var n = 0;
    for (var i = 0; i < GOALS.length; i++) if (goalDone(s, i)) n++;
    return n;
  }
  /* 目标奖励：每个 +8% 全局 */
  function goalMult(s) { return 1 + goalCount(s) * 0.08; }

  function totalDodge(s){ return s.themes[0].dodge + s.themes[1].dodge + s.themes[2].dodge; }
  function totalCaught(s){ return s.themes[0].caught + s.themes[1].caught + s.themes[2].caught; }
  function totalReset(s){ return s.themes[0].resets + s.themes[1].resets + s.themes[2].resets; }
  function bestStreak(s){ return Math.max(s.themes[0].bestStreak, s.themes[1].bestStreak, s.themes[2].bestStreak); }

  /* ============================================================
     状态
     ============================================================ */
  var SAVE_KEY = 'moyu_three_realms_v2';
  var DEMO = /[?&]demo=1/.test(window.location.search);
  var state = null;
  var cur = 0;         // 当前所在的一境
  var masked = false;  // 当前是否处于「应对」状态（只有当前境可应对）

  function newTheme() {
    return {
      res: 0, lifetime: 0, clicks: 0,
      b: [0,0,0,0,0,0,0,0],
      clickLvl: 1,
      up: { speed:0, power:0, crit:0 },
      prestige: 0, resets: 0,
      dodge: 0, caught: 0,
      streak: 0, bestStreak: 0,
      crits: 0
    };
  }

  function freshState(keep) {
    var s = {
      themes: [newTheme(), newTheme(), newTheme()],
      got: {},
      goals: {},
      sound: true,
      playing: 0,
      lastSave: Date.now(),
      cur: 0,
      evtCount: 0
    };
    if (keep) {
      s.themes = keep.themes || s.themes;
      s.got = keep.got || {};
      s.goals = keep.goals || {};
      s.sound = keep.sound !== false;
      s.playing = keep.playing || 0;
      s.cur = keep.cur || 0;
      s.evtCount = keep.evtCount || 0;
    }
    return s;
  }

  function num(v, d) {
    var n = Number(v);
    return isFinite(n) && n >= 0 ? n : (typeof d === 'number' ? d : 0);
  }

  function sanitizeTheme(o) {
    var t = newTheme();
    if (!o || typeof o !== 'object') return t;
    t.res = num(o.res);
    t.lifetime = num(o.lifetime);
    t.clicks = num(o.clicks);
    t.clickLvl = Math.max(1, num(o.clickLvl, 1));
    t.prestige = num(o.prestige);
    t.resets = num(o.resets);
    t.dodge = num(o.dodge);
    t.caught = num(o.caught);
    t.streak = num(o.streak);
    t.bestStreak = num(o.bestStreak);
    t.crits = num(o.crits);
    if (o.up && typeof o.up === 'object') {
      t.up.speed = Math.min(60, Math.floor(num(o.up.speed)));
      t.up.power = Math.min(40, Math.floor(num(o.up.power)));
      t.up.crit = Math.min(25, Math.floor(num(o.up.crit)));
    }
    if (Array.isArray(o.b)) {
      for (var i = 0; i < 8; i++) t.b[i] = Math.max(0, Math.floor(num(o.b[i])));
    }
    return t;
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || typeof o !== 'object') return null;
      var s = freshState();
      s.themes = [sanitizeTheme(o.themes && o.themes[0]), sanitizeTheme(o.themes && o.themes[1]), sanitizeTheme(o.themes && o.themes[2])];
      s.got = o.got && typeof o.got === 'object' ? o.got : {};
      s.goals = o.goals && typeof o.goals === 'object' ? o.goals : {};
      s.evtCount = num(o.evtCount);
      s.sound = o.sound !== false;
      s.playing = num(o.playing);
      s.lastSave = num(o.lastSave, Date.now());
      s.cur = Math.min(2, Math.max(0, Math.floor(num(o.cur))));
      return s;
    } catch (e) { return null; }
  }

  function save() {
    if (DEMO) return;
    try {
      state.lastSave = Date.now();
      state.cur = cur;
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) { /* 隐私模式：降级为内存存档 */ }
  }

  /* ============================================================
     数值
     ============================================================ */
  function fmt(n) {
    if (!isFinite(n)) return '∞';
    n = Math.floor(n);
    if (n < 100000) return String(n);
    if (n < 1e8) return trim1(n / 1e4) + '万';
    if (n < 1e12) return trim1(n / 1e8) + '亿';
    return trim1(n / 1e12) + '万亿';
  }
  function fmtRate(n) {
    if (!isFinite(n)) return '∞';
    if (n > 0 && n < 100) {
      var s = n < 10 ? n.toFixed(1) : n.toFixed(0);
      return s.replace(/\.0$/, '');
    }
    return fmt(n);
  }
  function trim1(v) {
    var s = v.toFixed(1);
    return s.replace(/\.0$/, '');
  }
  function pct(v) { return (v >= 0 ? '+' : '') + Math.round(v * 100) + '%'; }

  function levelOf(s) {
    var total = s.themes[0].lifetime + s.themes[1].lifetime + s.themes[2].lifetime;
    return Math.max(1, Math.floor(Math.log10(Math.max(1, total) + 10) * 4));
  }

  function soulMult(t) { return 1 + (t.prestige || 0) * 0.12; }
  function streakMult(t) { return 1 + Math.min(t.streak || 0, 10) * 0.05; }
  /* 三境共鸣：取最低道行，每点 +15% 全局 */
  function synergyMult(s) { return 1 + preMin(s) * 0.15; }
  /* 在场加成：只有当前境 +25% */
  function presence(i) { return i === cur ? 1.25 : 1; }

  function totalCps(i) {
    var t = state.themes[i];
    var base = 0;
    for (var k = 0; k < 8; k++) base += (t.b[k] || 0) * THEMES[i].buildings[k].rate;
    var m = soulMult(t) * synergyMult(state) * presence(i) * streakMult(t) * goalMult(state);
    if (i === cur && masked) m *= 0.4;
    return base * m;
  }
  /* 点击价值 = 手速固定值 + 每秒产出 × 手劲比例 */
  function clickValue(i) {
    var t = state.themes[i];
    var fixed = 1 + (t.clickLvl - 1) * 1.6;
    var pct = totalCps(i) * powerRatio(t);
    return Math.max(1, fixed + pct);
  }
  /* 一次点击的完整结算（含暴击），返回 {gain, crit} */
  function clickRoll(i) {
    var t = state.themes[i];
    var base = clickValue(i);
    var isCrit = Math.random() < critChance(t);
    if (isCrit) {
      t.crits = (t.crits || 0) + 1;
      return { gain: base * critMult(t), crit: true };
    }
    return { gain: base, crit: false };
  }
  function costOf(ti, i, n) {
    var t = state.themes[ti];
    var c0 = THEMES[ti].buildings[i].cost * Math.pow(1.15, t.b[i]);
    return Math.ceil(c0 * (Math.pow(1.15, n) - 1) / 0.15);
  }
  function maxAffordable(ti, i) {
    var t = state.themes[ti];
    var c0 = THEMES[ti].buildings[i].cost * Math.pow(1.15, t.b[i]);
    if (t.res < c0) return 0;
    var n = Math.floor(Math.log(1 + t.res * 0.15 / c0) / Math.log(1.15));
    if (n < 0) n = 0;
    while (n > 0 && costOf(ti, i, n) > t.res) n--;
    while (costOf(ti, i, n + 1) <= t.res) n++;
    return Math.min(n, 100000);
  }
  function clickUpCost(i) {
    return Math.ceil(25 * Math.pow(1.18, state.themes[i].clickLvl - 1));
  }
  function prestigeGain(i) {
    var life = state.themes[i].lifetime;
    if (life < 1e6) return 0;
    return Math.max(1, Math.floor(Math.pow(life / 1e6, 0.6)));
  }
  function timeStr(sec) {
    var m = Math.floor(sec / 60);
    if (m < 60) return m + ' 分';
    return Math.floor(m / 60) + ' 时 ' + (m % 60) + ' 分';
  }

  /* ============================================================
     音效
     ============================================================ */
  var actx = null;
  function beep(freq, dur, type, vol) {
    if (!state.sound) return;
    try {
      if (!actx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        actx = new AC();
      }
      if (actx.state === 'suspended') actx.resume();
      var o = actx.createOscillator();
      var g = actx.createGain();
      o.type = type || 'triangle';
      o.frequency.setValueAtTime(freq, actx.currentTime);
      g.gain.setValueAtTime(0.0001, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(vol || 0.06, actx.currentTime + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + dur + 0.02);
    } catch (e) { /* 音频不可用则忽略 */ }
  }
  function sfxClick() {
    var th = THEMES[cur].id;
    if (th === 'wood') { beep(220 + Math.random() * 30, 0.09, 'sine', 0.07); }
    else if (th === 'screw') { beep(880 + Math.random() * 120, 0.05, 'square', 0.028); }
    else { beep(520 + Math.random() * 90, 0.07, 'triangle', 0.045); }
  }
  function sfxBuy() { beep(700, 0.08, 'sine', 0.06); setTimeout(function(){ beep(980, 0.1, 'sine', 0.05); }, 70); }
  function sfxAlarm() { beep(300, 0.13, 'sawtooth', 0.05); setTimeout(function(){ beep(240, 0.16, 'sawtooth', 0.05); }, 150); }
  function sfxDodge() { beep(660, 0.09, 'sine', 0.06); setTimeout(function(){ beep(990, 0.14, 'sine', 0.055); }, 80); }
  function sfxCaught() { beep(180, 0.3, 'sawtooth', 0.08); }
  function sfxAch() { beep(784, 0.09, 'sine', 0.05); setTimeout(function(){ beep(1175, 0.16, 'sine', 0.05); }, 90); }
  function vibrate(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* 忽略 */ } }

  /* ============================================================
     DOM
     ============================================================ */
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    res: $('hRes'), kRes: $('kRes'), cps: $('hCps'), lvl: $('hLvl'),
    tabs: $('tabs'),
    stage: $('stage'), boss: $('boss'), bossFace: $('bossFace'), bossTag: $('bossTag'), alarm: $('alarmBar'),
    notice: $('notice'), fishBtn: $('fishBtn'), fishIcon: $('fishIcon'),
    fishLbl: $('fishLbl'), fishSub: $('fishSub'),
    fakeBtn: $('fakeBtn'), fakeTxt: $('fakeTxt'),
    clickUp: $('clickUpBtn'), clickUpCost: $('clickUpCost'),
    combo: $('combo'), buylist: $('buylist'), buyTitle: $('buyTitle'), buyNote: $('buyNote'),
    multiseg: $('multiseg'),
    preTitle: $('preTitle'), preGainK: $('preGainK'), preNowK: $('preNowK'), preNote: $('preNote'),
    soulGain: $('soulGain'), soulNow: $('soulNow'), soulBonus: $('soulBonus'),
    rebirth: $('rebirthBtn'),
    synRing: $('synRing'), synPct: $('synPct'), synTitle: $('synTitle'), synDesc: $('synDesc'), synPills: $('synPills'),
    stDodge: $('stDodge'), stCaught: $('stCaught'), stTotal: $('stTotal'), stAll: $('stAll'),
    stTime: $('stTime'), stReset: $('stReset'),
    achs: $('achs'), achCount: $('achCount'),
    sound: $('soundBtn'), reset: $('resetBtn'), toasts: $('toasts'),
    intro: $('intro'), introGo: $('introGo'), helpBtn: $('helpBtn'),
    entry: $('entry'),
    uplist: $('uplist'), clickSum: $('clickSum'),
    goals: $('goals'), goalCount: $('goalCount'), goalBar: $('goalBar'),
    evtWrap: $('evtWrap'), vignette: $('vignette'), bossArrive: $('bossArrive'),
    streakBarIn: $('streakBarIn'), boostRow: $('boostRow'),
    tabRate: [$('tr0'), $('tr1'), $('tr2')],
    tabDot: [$('dot0'), $('dot1'), $('dot2')]
  };

  var buyMult = 1;
  var buyNodes = [];
  var achNodes = {};

  function buildAchList() {
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
      var a = ACHIEVEMENTS[i];
      var li = document.createElement('li');
      li.className = 'ach';
      var ai = document.createElement('span');
      ai.className = 'ai';
      ai.textContent = a.icon;
      var wrap = document.createElement('span');
      var an = document.createElement('span');
      an.className = 'an';
      an.textContent = a.name;
      var ad = document.createElement('span');
      ad.className = 'ad';
      ad.textContent = a.desc;
      wrap.appendChild(an); wrap.appendChild(ad);
      li.appendChild(ai); li.appendChild(wrap);
      el.achs.appendChild(li);
      achNodes[a.id] = { li: li, ad: ad };
    }
  }

  var COST_HINT = {
    fish: ['摸鱼手段', '老板过来时按空格装忙（或直接点鱼）—— 装忙期间产出降到 40%，但绝不会被抓。'],
    wood: ['修行法门', '方丈巡堂时按空格入定（或直接点木鱼）—— 入定期间功德产出降到 40%，但绝不会被点名。'],
    screw: ['产线升级', 'AI 巡检时按空格假卡顿（或直接点螺丝）—— 卡顿期间螺丝产出降到 40%，但巡检 AI 会判定你在待机。']
  };

  function buildBuildingList() {
    el.buylist.textContent = '';
    buyNodes = [];
    var th = THEMES[cur];
    for (var i = 0; i < 8; i++) {
      var b = th.buildings[i];
      var btn = document.createElement('button');
      btn.className = 'buy';
      btn.type = 'button';
      btn.setAttribute('data-i', String(i));

      var icon = document.createElement('span');
      icon.className = 'bi';
      icon.textContent = b.icon;

      var t = document.createElement('span');
      var bn = document.createElement('span');
      bn.className = 'bn';
      bn.textContent = b.name;
      var bd = document.createElement('span');
      bd.className = 'bd';
      bd.textContent = b.desc;
      t.appendChild(bn); t.appendChild(bd);

      var m = document.createElement('span');
      m.className = 'bm';
      var bc = document.createElement('span');
      bc.className = 'bc';
      bc.textContent = '0';
      var bq = document.createElement('span');
      bq.className = 'bq';
      bq.textContent = '×0';
      m.appendChild(bc); m.appendChild(bq);

      btn.appendChild(icon); btn.appendChild(t); btn.appendChild(m);
      btn.addEventListener('click', (function (idx) {
        return function (ev) {
          var n = buyMult;
          if (ev.shiftKey && buyMult === 1) n = 10;
          buy(idx, n);
        };
      })(i));

      el.buylist.appendChild(btn);
      buyNodes.push({ btn: btn, cost: bc, qty: bq });
    }
  }

  var upNodes = [];
  function buildUpgradeList() {
    el.uplist.textContent = '';
    upNodes = [];
    for (var i = 0; i < UPGRADES.length; i++) {
      var u = UPGRADES[i];
      var btn = document.createElement('button');
      btn.className = 'up';
      btn.type = 'button';

      var icon = document.createElement('span');
      icon.className = 'ui';
      icon.textContent = u.icon;

      var t = document.createElement('span');
      var un = document.createElement('span');
      un.className = 'un';
      un.textContent = u.name;
      var ud = document.createElement('span');
      ud.className = 'ud';
      t.appendChild(un); t.appendChild(ud);

      var m = document.createElement('span');
      m.className = 'um';
      var uc = document.createElement('span');
      uc.className = 'uc';
      var ul = document.createElement('span');
      ul.className = 'ul';
      m.appendChild(uc); m.appendChild(ul);

      btn.appendChild(icon); btn.appendChild(t); btn.appendChild(m);
      btn.addEventListener('click', (function (idx) {
        return function () { buyUpgrade(idx); };
      })(i));

      el.uplist.appendChild(btn);
      upNodes.push({ btn: btn, cost: uc, lvl: ul, desc: ud });
    }
  }

  var goalNodes = [];
  function buildGoalList() {
    el.goals.textContent = '';
    goalNodes = [];
    for (var i = 0; i < GOALS.length; i++) {
      var g = GOALS[i];
      var d = document.createElement('div');
      d.className = 'goal';
      var gi = document.createElement('span');
      gi.className = 'gi';
      gi.textContent = g.icon;
      var gt = document.createElement('span');
      gt.className = 'gt';
      gt.textContent = g.text;
      var gp = document.createElement('span');
      gp.className = 'gp';
      d.appendChild(gi); d.appendChild(gt); d.appendChild(gp);
      el.goals.appendChild(d);
      goalNodes.push({ el: d, prog: gp });
    }
  }

  /* 压迫感：危险时给整页加红晕 + 舞台内斜纹 */
  function setDanger(on) {
    el.stage.classList[on ? 'add' : 'remove']('danger');
    el.vignette.classList[on ? 'add' : 'remove']('on');
    el.bossArrive.classList[on ? 'add' : 'remove']('on');
  }

  function toast(msg, kind) {
    var d = document.createElement('div');
    d.className = 'toast' + (kind ? ' ' + kind : '');
    d.textContent = msg;
    el.toasts.appendChild(d);
    setTimeout(function () {
      d.className += ' out';
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 320);
    }, 2600);
  }

  /* ============================================================
     主题切换
     ============================================================ */
  function applyTheme() {
    var th = THEMES[cur];
    var r = document.documentElement.style;
    r.setProperty('--accent', th.accent);
    r.setProperty('--accent-d', th.accentD);
    r.setProperty('--accent-l', th.accentL);
    r.setProperty('--b1', th.c1);
    r.setProperty('--b2', th.c2);
    r.setProperty('--b3', th.c3);
    r.setProperty('--bSh', th.sh);
    r.setProperty('--bGlow', th.glow);
    r.setProperty('--bInk', th.ink);
    r.setProperty('--stageTint', th.tint);

    el.kRes.textContent = th.resName;
    el.fishIcon.textContent = th.clickIcon;
    el.bossFace.textContent = th.riskIcon;
    el.bossTag.textContent = th.riskTag;
    el.buyTitle.textContent = th.buyTitle;
    el.buyNote.textContent = th.buyNote;
    el.preTitle.textContent = th.prestigeName + '转生';
    el.preGainK.textContent = '可换' + th.prestigeCur;
    el.preNowK.textContent = '已有' + th.prestigeCur;
    el.preNote.textContent = th.preNote;

    var kids = el.tabs.children;
    for (var i = 0; i < kids.length; i++) {
      if (i === cur) kids[i].className = 'tab on';
      else kids[i].className = 'tab';
    }
  }

  function switchTheme(i) {
    if (i === cur) return;
    cur = i;
    masked = false;
    cancelRisk();
    applyTheme();
    buildBuildingList();
    renderAll();
    scheduleRisk(7000 + Math.random() * 4000);
    save();
  }

  /* 进境：从入口卡片选一境后正式开局。选哪境就进哪境（进度共用同一份存档） */
  function enterRealm(i) {
    cur = i;
    masked = false;
    cancelRisk();
    applyTheme();
    buildBuildingList();
    renderAll();

    el.entry.classList.add('hide');
    lastTick = Date.now();

    var seen = false;
    try { seen = localStorage.getItem('moyu_three_seen') === '1'; } catch (e) { seen = false; }
    if (seen) {
      el.intro.classList.add('hide');
      scheduleRisk(7000);
      scheduleEvent(14000);
    } else {
      el.intro.classList.remove('hide');
    }
    save();
    beep(700, 0.1, 'sine', 0.05);
  }

  /* ============================================================
     玩法
     ============================================================ */
  function doClick(ev) {
    var th = THEMES[cur];
    var t = state.themes[cur];

    /* 风险预警/在场期间点主按钮 = 就地应对 */
    if ((riskPhase === 'warn' || riskPhase === 'active') && !masked) {
      setMask(true);
      vibrate(30);
      toast('反应够快！已' + th.maskName, 'good');
      return;
    }
    if (masked) {
      el.fishBtn.classList.remove('working');
      void el.fishBtn.offsetWidth;
      el.fishBtn.classList.add('working');
      toast('正在' + th.maskName + '，别乱动！', 'bad');
      return;
    }

    var roll = clickRoll(cur);
    var gain = roll.gain * boostClick();
    t.res += gain;
    t.lifetime += gain;
    t.clicks += 1;
    state.cur = cur;

    var fx = document.createElement('span');
    fx.className = 'floater' + (roll.crit ? ' crit' : '');
    if (!roll.crit) fx.style.color = th.accentD;
    fx.textContent = (roll.crit ? '暴击 +' : '+') + fmt(gain);
    if (roll.crit) {
      el.fishBtn.classList.remove('critHit');
      void el.fishBtn.offsetWidth;
      el.fishBtn.classList.add('critHit');
      beep(980, 0.07, 'square', 0.05);
      setTimeout(function(){ beep(1420, 0.11, 'sine', 0.045); }, 60);
      vibrate(18);
    }
    var r = el.fishBtn.getBoundingClientRect();
    var host = el.stage.getBoundingClientRect();
    var cx = (ev && ev.clientX) ? ev.clientX : (r.left + r.width / 2);
    var cy = (ev && ev.clientY) ? ev.clientY : (r.top + r.height / 2);
    fx.style.left = (cx - host.left) + 'px';
    fx.style.top = (cy - host.top) + 'px';
    el.stage.appendChild(fx);
    setTimeout(function () { if (fx.parentNode) fx.parentNode.removeChild(fx); }, 1000);

    sfxClick();
    renderHead();
  }

  function buy(i, n) {
    var th = THEMES[cur];
    var t = state.themes[cur];
    var b = th.buildings[i];
    if (n === 'max') {
      n = maxAffordable(cur, i);
      if (n <= 0) n = 1;
    }
    var cost = costOf(cur, i, n);
    if (t.res < cost) {
      var node = buyNodes[i];
      node.btn.classList.remove('deny');
      void node.btn.offsetWidth;
      node.btn.classList.add('deny');
      toast(th.resName + '不够：还差 ' + fmt(cost - t.res), 'bad');
      return;
    }
    t.res -= cost;
    t.b[i] += n;
    sfxBuy();
    toast(b.name + ' ×' + n + '（+' + fmtRate(b.rate * n) + '/秒）', 'good');
    renderAll();
    save();
  }

  /* 手速升级（旧入口，保留快捷键体验） */
  function upgradeClick() {
    buyUpgrade(0);
  }

  /* 通用升级购买 */
  function buyUpgrade(idx) {
    var t = state.themes[cur];
    var u = UPGRADES[idx];
    if (upMaxed(t, idx)) {
      toast(u.name + '已满级（' + u.max + '）', 'bad');
      return;
    }
    var c = upgradeCost(t, idx);
    if (t.res < c) {
      var node = upNodes[idx];
      if (node) { node.btn.classList.remove('deny'); void node.btn.offsetWidth; node.btn.classList.add('deny'); }
      toast(u.name + '还差 ' + fmt(c - t.res) + ' ' + THEMES[cur].resName, 'bad');
      return;
    }
    t.res -= c;
    t.up[u.key] += 1;
    /* 手速线同步 clickLvl，保证旧逻辑一致 */
    if (u.key === 'speed') t.clickLvl = 1 + t.up.speed;
    sfxBuy();
    toast(u.name + ' Lv.' + upgradeLevel(t, idx) + ' ✓', 'good');
    renderAll();
    save();
  }

  function setMask(force) {
    var want = typeof force === 'boolean' ? force : !masked;
    if (want === masked) return;
    masked = want;
    renderStage();
    if (masked) {
      beep(420, 0.06, 'sine', 0.04);
    } else {
      beep(560, 0.06, 'sine', 0.04);
    }
  }

  function rebirth() {
    var th = THEMES[cur];
    var gain = prestigeGain(cur);
    if (gain < 1) {
      toast('还不够本，攒到 100 万' + th.resName + '再来' + th.prestigeName, 'bad');
      return;
    }
    var ok = window.confirm('确定' + th.prestigeName + '？\n\n你将失去：本境全部' + th.resName + '、全部' + th.buyTitle + '\n你将获得：' + gain + ' 点' + th.prestigeCur + '（本境永久 +' + (gain * 12) + '% 产出）');
    if (!ok) return;
    var t = state.themes[cur];
    var keepP = t.prestige + gain;
    var keepR = t.resets + 1;
    var keepD = t.dodge;
    var keepC = t.caught;
    var keepB = t.bestStreak;
    state.themes[cur] = newTheme();
    state.themes[cur].prestige = keepP;
    state.themes[cur].resets = keepR;
    state.themes[cur].dodge = keepD;
    state.themes[cur].caught = keepC;
    state.themes[cur].bestStreak = keepB;
    masked = false;
    cancelRisk();
    renderAll();
    scheduleRisk(9000);
    save();
    sfxDodge();
    toast(th.prestigeName + '成功！' + th.prestigeCur + ' +' + gain, 'good');
  }

  function wipe() {
    if (!window.confirm('清空存档会失去全部进度（包括三境道行），确定吗？')) return;
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* 忽略 */ }
    state = freshState();
    cur = 0;
    masked = false;
    boosts = { cps:null, click:null, shield:null };
    cancelRisk();
    applyTheme();
    buildBuildingList();
    renderAll();
    scheduleRisk(8000);
    save();
    toast('存档已清空，重新做人', 'good');
  }

  /* ============================================================
     风险事件（只发生在当前所在的一境）
     ============================================================ */
  var riskTimer = null;
  var riskPhase = 'idle';
  var riskDeadline = 0;
  var WARN_MS = 2400;
  var ACTIVE_MS = 3600;
  var RISK_LOSS = 0.15;

  function scheduleRisk(delay) {
    cancelRisk();
    var wait = delay;
    if (typeof wait !== 'number') {
      var base = 26000 - Math.min(8000, levelOf(state) * 260);
      wait = Math.max(15000, base) + Math.random() * 9000;
    }
    riskTimer = setTimeout(function () {
      var th = THEMES[cur];
      riskPhase = 'warn';
      riskDeadline = Date.now() + WARN_MS;
      el.boss.className = 'boss warn';
      el.bossTag.textContent = th.riskWarn;
      el.alarm.className = 'alarmBar live';
      el.alarm.style.transform = 'scaleX(1)';
      el.stage.classList.add('alarm');
      setDanger(true);
      el.notice.className = 'notice hot';
      el.notice.textContent = th.riskWarnText;
      sfxAlarm();
      vibrate([18, 60, 18]);
      riskTimer = setTimeout(function () {
        riskPhase = 'active';
        riskDeadline = Date.now() + ACTIVE_MS;
        el.boss.className = 'boss onstage';
        el.bossTag.textContent = th.riskTag;
        el.notice.textContent = th.riskHere;
        riskTimer = setTimeout(resolveRisk, ACTIVE_MS);
      }, WARN_MS);
    }, wait);
  }

  function cancelRisk() {
    if (riskTimer) { clearTimeout(riskTimer); riskTimer = null; }
    riskPhase = 'idle';
    riskDeadline = 0;
    el.boss.className = 'boss';
    el.alarm.className = 'alarmBar';
    el.alarm.style.transform = 'scaleX(0)';
    el.stage.classList.remove('alarm');
    setDanger(false);
    el.notice.className = 'notice';
    el.notice.textContent = THEMES[cur].riskIdle;
  }

  function resolveRisk() {
    var th = THEMES[cur];
    var t = state.themes[cur];
    var line;
    if (!masked && hasShield()) {
      boosts.shield = null;
      t.dodge += 1;
      sfxDodge();
      toast('🛡️ 审计放过生效 —— 这次算你躲过了', 'good');
      finishRisk();
      return;
    }
    if (masked) {
      t.dodge += 1;
      t.streak += 1;
      if (t.streak > t.bestStreak) t.bestStreak = t.streak;
      sfxDodge();
      line = th.dodges[Math.floor(Math.random() * th.dodges.length)];
      toast(line + ' 连击 ' + t.streak, 'good');
    } else {
      var loss = Math.max(8, t.res * RISK_LOSS);
      loss = Math.min(t.res, loss);
      t.res -= loss;
      t.caught += 1;
      t.streak = 0;
      el.stage.classList.remove('caught');
      void el.stage.offsetWidth;
      el.stage.classList.add('caught');
      sfxCaught();
      line = th.caughts[Math.floor(Math.random() * th.caughts.length)];
      toast(line + ' 损失 ' + fmt(loss) + ' ' + th.resName, 'bad');
    }
    finishRisk();
  }

  function finishRisk() {
    var th = THEMES[cur];
    riskPhase = 'idle';
    el.boss.className = 'boss';
    el.alarm.className = 'alarmBar';
    el.alarm.style.transform = 'scaleX(0)';
    el.stage.classList.remove('alarm');
    setDanger(false);
    el.notice.className = 'notice';
    el.notice.textContent = th.riskIdle;
    masked = false;
    renderStage();
    renderAll();
    save();
    scheduleRisk();
  }

  function updateAlarmBar() {
    if (riskPhase === 'idle') return;
    var left = Math.max(0, riskDeadline - Date.now());
    var total = riskPhase === 'warn' ? WARN_MS : ACTIVE_MS;
    el.alarm.style.transform = 'scaleX(' + (left / total).toFixed(3) + ')';
  }

  /* ============================================================
     渲染
     ============================================================ */
  function renderHead() {
    var th = THEMES[cur];
    var t = state.themes[cur];
    el.res.textContent = fmt(t.res);
    el.cps.textContent = '+' + fmtRate(totalCps(cur));
    el.lvl.textContent = 'Lv.' + levelOf(state);
    el.fishSub.textContent = '+' + fmtRate(clickValue(cur)) + ' / 次';

    var c = upgradeCost(t, 0);
    var maxed = upMaxed(t, 0);
    el.clickUpCost.textContent = maxed ? 'MAX' : (fmt(c) + ' ' + th.resIcon);
    el.clickUp.disabled = maxed || t.res < c;
    el.clickUp.style.opacity = (maxed || t.res < c) ? '0.55' : '1';
    var cm = clickValue(cur);
    var cmAvg = cm * (1 + critChance(t) * (critMult(t) - 1));
    el.clickSum.textContent = '≈' + fmtRate(cmAvg) + '/点击';

    for (var i = 0; i < 3; i++) {
      el.tabRate[i].textContent = '+' + fmtRate(totalCps(i)) + '/s';
    }
  }

  function renderStage() {
    var th = THEMES[cur];
    el.fishBtn.className = 'fishBtn' + (masked ? ' working' : ' pulse');
    el.fakeBtn.className = 'mini' + (masked ? ' act' : '');
    el.fakeTxt.textContent = masked ? (th.maskIcon + ' ' + th.maskName + '中…') : (th.maskIcon + ' ' + th.maskName);
    el.fishLbl.textContent = masked ? '不 许 动' : th.clickName;

    var t = state.themes[cur];
    if (masked) {
      el.combo.className = 'combo';
      el.combo.textContent = th.maskName + '中：产出 ×0.4，但' + th.riskName + '查不到你';
    } else if (t.streak > 0) {
      el.combo.className = 'combo';
      el.combo.textContent = '连击 ×' + Math.min(t.streak, 10) + '（+' + Math.round(Math.min(t.streak, 10) * 5) + '% 产出）';
    } else {
      el.combo.className = 'combo idle';
      el.combo.textContent = '这一境你还没练出连击';
    }
    var pctVal = Math.min(t.streak, 10) / 10 * 100;
    el.streakBarIn.style.width = pctVal.toFixed(0) + '%';
  }

  function renderBuildings() {
    var th = THEMES[cur];
    var t = state.themes[cur];
    for (var i = 0; i < 8; i++) {
      var n = buyNodes[i];
      if (!n) continue;
      var cnt = t.b[i] || 0;
      var c;
      if (buyMult === 'max') {
        var canBuy = maxAffordable(cur, i);
        c = canBuy > 0 ? costOf(cur, i, canBuy) : costOf(cur, i, 1);
        n.cost.textContent = (canBuy > 0 ? '×' + canBuy + ' ' : '') + fmt(c) + ' ' + th.resIcon;
      } else {
        c = costOf(cur, i, buyMult);
        n.cost.textContent = fmt(c) + ' ' + th.resIcon;
      }
      var perSec = cnt * th.buildings[i].rate * soulMult(t) * synergyMult(state) * presence(cur) * streakMult(t);
      if (masked) perSec *= 0.4;
      n.qty.textContent = '×' + cnt + ' · +' + fmtRate(perSec) + '/s';
      n.btn.className = 'buy ' + (t.res >= c ? 'can' : 'cant');
    }
  }

  function renderPrestige() {
    var th = THEMES[cur];
    var t = state.themes[cur];
    var g = prestigeGain(cur);
    el.soulGain.textContent = g + ' 点';
    el.soulNow.textContent = t.prestige + ' 点';
    el.soulBonus.textContent = pct(t.prestige * 0.12);
    el.rebirth.disabled = g < 1;
    el.rebirth.textContent = g < 1
      ? ('攒够 100 万' + th.resName + '可' + th.prestigeName)
      : (th.prestigeName + '转生 (+' + g + ')');
  }

  function renderSynergy() {
    var mn = preMin(state);
    var mult = synergyMult(state);
    el.synPct.textContent = pct(mult - 1);
    var deg = Math.min(360, mn * 12);
    el.synRing.style.setProperty('--deg', deg + 'deg');

    if (mn <= 0) {
      el.synTitle.textContent = '尚未共鸣';
      el.synDesc.textContent = '三境各自转生一次，共鸣才会启动。';
    } else {
      el.synTitle.textContent = '共鸣中 · 全部产出 ×' + mult.toFixed(2);
      el.synDesc.textContent = '三境最低道行 ' + mn + ' 点，每点 +15% 全局产出。';
    }
    el.synPills.textContent = '';
    for (var i = 0; i < 3; i++) {
      var p = document.createElement('span');
      p.className = 'pill' + (state.themes[i].prestige > 0 ? ' got' : '');
      p.textContent = THEMES[i].icon + ' ' + THEMES[i].prestigeCur + ' ' + state.themes[i].prestige;
      el.synPills.appendChild(p);
    }
  }

  function renderStats() {
    var t = state.themes[cur];
    var all = state.themes[0].lifetime + state.themes[1].lifetime + state.themes[2].lifetime;
    el.stDodge.textContent = totalDodge(state) + ' 次';
    el.stCaught.textContent = totalCaught(state) + ' 次';
    el.stTotal.textContent = fmt(t.lifetime);
    el.stAll.textContent = fmt(all);
    el.stTime.textContent = timeStr(state.playing);
    el.stReset.textContent = totalReset(state) + ' 次';
  }

  function renderAch() {
    var count = 0;
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
      var a = ACHIEVEMENTS[i];
      var node = achNodes[a.id];
      if (!node) continue;
      var unlocked = !!state.got[a.id];
      if (unlocked) count++;
      node.li.className = unlocked ? 'ach got' : 'ach';
      if (unlocked) { node.ad.textContent = '✓ ' + a.desc; }
      else {
        var p;
        try { p = a.prog(state); } catch (e) { p = a.desc; }
        node.ad.textContent = p;
      }
    }
    el.achCount.textContent = count + ' / ' + ACHIEVEMENTS.length;
  }

  function checkAch() {
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
      var a = ACHIEVEMENTS[i];
      if (state.got[a.id]) continue;
      var ok = false;
      try { ok = !!a.test(state); } catch (e) { ok = false; }
      if (ok) {
        state.got[a.id] = 1;
        toast('🏆 成就解锁：' + a.name, 'good');
        sfxAch();
      }
    }
  }

  function renderAll() {
    renderHead();
    renderStage();
    renderBuildings();
    renderUpgrades();
    renderGoals();
    renderPrestige();
    renderSynergy();
    renderStats();
    renderAch();
    renderBoosts();
  }

  function renderUpgrades() {
    var t = state.themes[cur];
    var th = THEMES[cur];
    for (var i = 0; i < UPGRADES.length; i++) {
      var n = upNodes[i];
      if (!n) continue;
      var u = UPGRADES[i];
      var lv = upgradeLevel(t, i);
      var maxed = upMaxed(t, i);
      n.lvl.textContent = 'Lv.' + lv + '/' + u.max;
      if (maxed) {
        n.cost.textContent = '已满级';
        n.btn.className = 'up maxed';
      } else {
        var c = upgradeCost(t, i);
        n.cost.textContent = fmt(c) + ' ' + th.resIcon;
        n.btn.className = 'up ' + (t.res >= c ? 'can' : 'cant');
      }
      n.desc.textContent = u.desc(t);
    }
  }

  function renderGoals() {
    var done = 0;
    var nextIdx = -1;
    for (var i = 0; i < GOALS.length; i++) {
      var n = goalNodes[i];
      if (!n) continue;
      var g = GOALS[i];
      var isDone = !!goalDone(state, i);
      if (isDone) done++;
      else if (nextIdx < 0) nextIdx = i;
      n.el.className = 'goal' + (isDone ? ' done' : (i === nextIdx ? ' next' : ''));
      var cur;
      try { cur = g.get(state); } catch (e) { cur = 0; }
      if (isDone) n.prog.textContent = '✓';
      else n.prog.textContent = fmt(Math.min(cur, g.need)) + ' / ' + fmt(g.need);
    }
    el.goalCount.textContent = done + ' / ' + GOALS.length;
    el.goalBar.style.width = (done / GOALS.length * 100).toFixed(1) + '%';
  }

  function checkGoals() {
    for (var i = 0; i < GOALS.length; i++) {
      if (goalDone(state, i)) continue;
      var g = GOALS[i];
      var cur = 0;
      try { cur = g.get(state); } catch (e) { cur = 0; }
      if (cur >= g.need) {
        state.goals[g.id] = 1;
        toast('🎯 目标达成：' + g.text + '（全局 +8%）', 'good');
        sfxAch();
      }
    }
  }

  /* ============================================================
     主循环
     ============================================================ */
  var lastTick = Date.now();
  var uiAcc = 0;

  function tick() {
    var now = Date.now();
    var dt = (now - lastTick) / 1000;
    lastTick = now;
    if (dt < 0) dt = 0;
    if (dt > 1.5) dt = 1.5;

    var cb = boostCps();
    for (var i = 0; i < 3; i++) {
      var g = totalCps(i) * cb * dt;
      state.themes[i].res += g;
      state.themes[i].lifetime += g;
    }
    state.playing += dt;
    checkAch();
    checkGoals();

    uiAcc += dt;
    if (uiAcc >= 0.1) {
      uiAcc = 0;
      renderHead();
      renderBuildings();
      renderUpgrades();
      renderGoals();
      renderPrestige();
      renderStats();
      renderAch();
      renderSynergy();
      renderBoosts();
      updateAlarmBar();
    }
  }

  /* ============================================================
     随机事件：奖励 / 干扰，按比例结算
     ============================================================ */
  var EVENTS = [
    /* ---- 奖励类 ---- */
    { id:'bonus',   kind:'good', icon:'🎁', w:22, name:'季度奖金',
      run:function(){ var g = Math.max(60, state.themes[cur].res * 0.18); addRes(cur, g); return { g:g, t:'+18% 当前' + THEMES[cur].resName }; } },
    { id:'surge',   kind:'good', icon:'📈', w:16, name:'产线提速',
      run:function(){ addBoost('cps', 2, 30); return { t:'全部产出 ×2，持续 30 秒' }; } },
    { id:'clickup', kind:'good', icon:'👆', w:14, name:'手感爆发',
      run:function(){ addBoost('click', 3, 25); return { t:'点击收益 ×3，持续 25 秒' }; } },
    { id:'coffee',  kind:'good', icon:'☕', w:12, name:'续命咖啡',
      run:function(){ var t = state.themes[cur]; var c = Math.min(UPGRADES[0].max - t.up.speed, 2); if (c > 0) { t.up.speed += c; return { t:'手速 +' + c + ' 级（免费）' }; } var g = Math.max(100, t.res * 0.1); addRes(cur, g); return { g:g, t:'手速已满，改发 +' + fmt(g) }; } },
    { id:'audit',   kind:'good', icon:'📝', w:10, name:'审计放过',
      run:function(){ addBoost('shield', 1, 45); return { t:'下一次风险自动躲过' }; } },
    /* ---- 干扰类 ---- */
    { id:'meeting', kind:'bad',  icon:'📅', w:18, name:'临时会议',
      run:function(){ addBoost('cps', 0.35, 20); return { t:'全部产出 ×0.35，持续 20 秒' }; } },
    { id:'netdown', kind:'bad',  icon:'🚫', w:14, name:'断网',
      run:function(){ addBoost('click', 0, 15); return { t:'点击收益归零，持续 15 秒' }; } },
    { id:'raid',    kind:'bad',  icon:'🧑‍💼', w:13, name:'领导突袭',
      run:function(){ forceRisk(true); return { t:'风险事件立刻触发（预警缩短）' }; } },
    { id:'deduct',  kind:'bad',  icon:'💸', w:12, name:'绩效扣款',
      run:function(){ var t = state.themes[cur]; var loss = Math.min(t.res * 0.12, Math.max(40, t.res * 0.12)); t.res -= loss; return { g:-loss, t:'-' + fmt(loss) + ' ' + THEMES[cur].resName }; } },
    { id:'chaos',   kind:'bad',  icon:'🌀', w:9, name:'需求变更',
      run:function(){ var t = state.themes[cur]; var c = Math.min(t.clickLvl - 1, 3); if (c > 0) { t.clickLvl -= c; return { t:'手速等级 -' + c }; } var loss = Math.min(t.res * 0.06, 200); t.res -= loss; return { g:-loss, t:'-' + fmt(loss) + ' ' + THEMES[cur].resName }; } },
    /* ---- 稀有史诗 ---- */
    { id:'jackpot', kind:'epic', icon:'💎', w:4,  name:'意外之财',
      run:function(){ var g = Math.max(400, state.themes[cur].res * 0.65); addRes(cur, g); return { g:g, t:'+65% 当前' + THEMES[cur].resName }; } },
    { id:'inspire', kind:'epic', icon:'🌟', w:3,  name:'顿悟',
      run:function(){ var t = state.themes[cur]; t.up.power += 1; t.up.crit += 1; return { t:'手劲 +1、暴击 +1（免费）' }; } }
  ];

  var boosts = { cps:null, click:null, shield:null };

  function addBoost(kind, mult, sec) {
    boosts[kind] = { mult: mult, until: Date.now() + sec * 1000 };
    renderBoosts();
  }
  function boostCps() {
    var b = boosts.cps;
    if (!b) return 1;
    if (Date.now() > b.until) { boosts.cps = null; return 1; }
    return b.mult;
  }
  function boostClick() {
    var b = boosts.click;
    if (!b) return 1;
    if (Date.now() > b.until) { boosts.click = null; return 1; }
    return b.mult;
  }
  function hasShield() {
    var b = boosts.shield;
    if (!b) return false;
    if (Date.now() > b.until) { boosts.shield = null; return false; }
    return true;
  }
  function renderBoosts() {
    var host = el.boostRow;
    if (!host) return;
    host.textContent = '';
    var now = Date.now();
    var defs = [
      { k:'cps',  icon:'📈', label:'产出 ×' + (boosts.cps ? boosts.cps.mult : 1) },
      { k:'click',icon:'👆', label:'点击 ×' + (boosts.click ? boosts.click.mult : 1) },
      { k:'shield',icon:'🛡️', label:'免查一次' }
    ];
    for (var i = 0; i < defs.length; i++) {
      var b = boosts[defs[i].k];
      if (!b) continue;
      var left = Math.max(0, Math.ceil((b.until - now) / 1000));
      if (left <= 0) continue;
      var pill = document.createElement('span');
      pill.className = 'boostPill';
      pill.textContent = defs[i].icon + ' ' + defs[i].label + ' ' + left + 's';
      host.appendChild(pill);
    }
  }

  function addRes(i, g) {
    state.themes[i].res += g;
    state.themes[i].lifetime += g;
  }

  function fireEvent() {
    if (riskPhase !== 'idle') return;
    var total = 0, i;
    for (i = 0; i < EVENTS.length; i++) total += EVENTS[i].w;
    var roll = Math.random() * total;
    var pick = EVENTS[0];
    for (i = 0; i < EVENTS.length; i++) {
      roll -= EVENTS[i].w;
      if (roll <= 0) { pick = EVENTS[i]; break; }
    }
    var out;
    try { out = pick.run(); } catch (e) { return; }
    state.evtCount = (state.evtCount || 0) + 1;

    var d = document.createElement('div');
    d.className = 'evt ' + pick.kind;

    var ic = document.createElement('div');
    ic.className = 'ei';
    ic.textContent = pick.icon;

    var tx = document.createElement('div');
    var tt = document.createElement('div');
    tt.className = 'et';
    tt.appendChild(document.createTextNode(pick.name));
    if (out.g !== undefined) {
      var span = document.createElement('b');
      span.className = out.g >= 0 ? 'up' : 'dn';
      span.textContent = (out.g >= 0 ? ' +' : ' -') + fmt(Math.abs(out.g));
      tt.appendChild(span);
    }
    var dd = document.createElement('div');
    dd.className = 'ed';
    dd.textContent = out.t;
    tx.appendChild(tt); tx.appendChild(dd);

    d.appendChild(ic); d.appendChild(tx);
    el.evtWrap.appendChild(d);

    if (pick.kind === 'good' || pick.kind === 'epic') { beep(760, 0.1, 'sine', 0.05); setTimeout(function(){ beep(1140, 0.14, 'sine', 0.05); }, 90); }
    else { beep(320, 0.16, 'sawtooth', 0.05); setTimeout(function(){ beep(210, 0.2, 'sawtooth', 0.05); }, 130); }

    setTimeout(function () {
      d.className += ' out';
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 320);
    }, 4200);

    renderAll();
    save();
  }

  var evtTimer = null;
  function scheduleEvent(delay) {
    if (evtTimer) clearTimeout(evtTimer);
    var wait = delay;
    if (typeof wait !== 'number') wait = 17000 + Math.random() * 16000;
    evtTimer = setTimeout(function () {
      var inGame = el.intro.classList.contains('hide') && el.entry.classList.contains('hide');
      if (inGame) fireEvent();
      scheduleEvent();
    }, wait);
  }

  /* 强制触发风险（用于「领导突袭」事件），预警缩短 */
  function forceRisk(short) {
    if (riskPhase !== 'idle') return;
    cancelRisk();
    riskPhase = 'warn';
    riskDeadline = Date.now() + WARN_MS;
    var th = THEMES[cur];
    el.boss.className = 'boss warn';
    el.bossTag.textContent = th.riskWarn;
    el.alarm.className = 'alarmBar live';
    el.stage.classList.add('alarm');
    setDanger(true);
    el.notice.className = 'notice hot';
    el.notice.textContent = '⚠️ 突袭！立刻' + th.maskName + '！';
    sfxAlarm();
    vibrate([30, 50, 30, 50, 30]);
    var warnMs = short ? 1500 : WARN_MS;
    riskTimer = setTimeout(function () {
      riskPhase = 'active';
      riskDeadline = Date.now() + ACTIVE_MS;
      el.boss.className = 'boss onstage';
      el.bossTag.textContent = th.riskTag;
      el.notice.textContent = th.riskHere;
      riskTimer = setTimeout(resolveRisk, ACTIVE_MS);
    }, warnMs);
  }

  /* ============================================================
     离线收益（三境同时结算）
     ============================================================ */
  function offline(prevSave) {
    var away = (Date.now() - prevSave) / 1000;
    if (!isFinite(away) || away < 60) return;
    var capped = Math.min(away, 8 * 3600);
    var total = 0;
    for (var i = 0; i < 3; i++) {
      var perSec = totalCps(i);
      if (perSec <= 0.01) continue;
      var g = perSec * capped * 0.5;
      state.themes[i].res += g;
      state.themes[i].lifetime += g;
      total += g;
    }
    if (total <= 1) return;
    var mins = Math.floor(capped / 60);
    var txt = mins >= 60 ? (Math.floor(mins / 60) + ' 小时 ' + (mins % 60) + ' 分') : (mins + ' 分钟');
    setTimeout(function () {
      toast('修行 ' + txt + '，三境离线收益共 +' + fmt(total), 'good');
    }, 700);
  }

  /* ============================================================
     事件
     ============================================================ */
  el.fishBtn.addEventListener('click', doClick);
  el.fakeBtn.addEventListener('click', function () { setMask(); });
  el.clickUp.addEventListener('click', upgradeClick);
  el.rebirth.addEventListener('click', rebirth);
  el.reset.addEventListener('click', wipe);

  el.tabs.addEventListener('click', function (ev) {
    var n = ev.target;
    while (n && n !== el.tabs) {
      if (n.getAttribute && n.getAttribute('data-t') !== null && n.tagName === 'BUTTON') {
        switchTheme(parseInt(n.getAttribute('data-t'), 10));
        return;
      }
      n = n.parentNode;
    }
  });

  el.helpBtn.addEventListener('click', function () { el.intro.classList.remove('hide'); });

  el.entry.addEventListener('click', function (ev) {
    var n = ev.target;
    while (n && n !== el.entry) {
      if (n.getAttribute && n.getAttribute('data-pick') !== null) {
        enterRealm(parseInt(n.getAttribute('data-pick'), 10));
        return;
      }
      n = n.parentNode;
    }
  });
  el.introGo.addEventListener('click', function () {
    el.intro.classList.add('hide');
    lastTick = Date.now();
    try { localStorage.setItem('moyu_three_seen', '1'); } catch (e) { /* 忽略 */ }
    beep(720, 0.09, 'sine', 0.05);
    if (riskPhase === 'idle' && !riskTimer) scheduleRisk(8000);
    scheduleEvent(16000);
  });
  el.intro.addEventListener('click', function (ev) {
    if (ev.target === el.intro) el.introGo.click();
  });

  el.sound.addEventListener('click', function () {
    state.sound = !state.sound;
    el.sound.textContent = state.sound ? '🔊 音效开' : '🔇 音效关';
    if (state.sound) beep(640, 0.08, 'sine', 0.05);
    save();
  });

  el.multiseg.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!t || t.tagName !== 'BUTTON') return;
    var m = t.getAttribute('data-m');
    buyMult = m === 'max' ? 'max' : parseInt(m, 10);
    var kids = el.multiseg.children;
    for (var i = 0; i < kids.length; i++) kids[i].className = '';
    t.className = 'on';
    renderBuildings();
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.code === 'Space') {
      ev.preventDefault();
      if (!el.intro.classList.contains('hide')) { el.introGo.click(); return; }
      setMask();
    }
  });

  /* 数字键 1/2/3 快速切境 */
  document.addEventListener('keydown', function (ev) {
    if (el.intro.classList.contains('hide') && (ev.key === '1' || ev.key === '2' || ev.key === '3')) {
      switchTheme(parseInt(ev.key, 10) - 1);
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) save();
    else lastTick = Date.now();
  });
  window.addEventListener('beforeunload', save);
  setInterval(save, 5000);

  /* ============================================================
     启动
     ============================================================ */
  var loaded = load();
  if (loaded) {
    state = loaded;
    cur = state.cur;
    offline(state.lastSave);
  } else {
    state = freshState();
    cur = 0;
  }

  /* 演示模式：?demo=1 载入有进度的假存档，仅用于预览/截图，不写本地存档 */
  if (DEMO) {
    state = freshState();
    var demoB = [
      [96, 71, 40, 25, 12, 5, 2, 0],
      [88, 64, 36, 21, 10, 4, 1, 0],
      [102, 78, 45, 27, 13, 6, 2, 0]
    ];
    var demoLife = [4268000, 3820000, 5140000];
    var demoPre = [6, 5, 7];
    for (var d = 0; d < 3; d++) {
      var t = state.themes[d];
      t.b = demoB[d];
      t.lifetime = demoLife[d];
      t.res = demoLife[d] * 0.42;
      t.up.speed = 17 + d;
      t.up.power = 9 + d;
      t.up.crit = 5 + d;
      t.clickLvl = 1 + t.up.speed;
      t.crits = 60 + d * 20;
      t.prestige = demoPre[d];
      t.resets = 1;
      t.dodge = 8 + d * 3;
      t.caught = 2 + d;
      t.streak = 6 + d;
      t.bestStreak = 11 + d;
      t.clicks = 1372 + d * 240;
    }
    state.playing = 1980;
    state.goals = { g1:1, g2:1, g3:1, g4:1 };
    state.got = { first:1, hand500:1, wood500:1, scr500:1, three1:1, three2:1, k1:1, m1:1, wc:1, app:1, dark:1, dodge:1, streak:1, caught:1, lvl10:1 };
    state.sound = false;
    cur = 0;
  }

  buildAchList();
  buildUpgradeList();
  buildGoalList();
  applyTheme();
  buildBuildingList();
  el.sound.textContent = state.sound ? '🔊 音效开' : '🔇 音效关';
  lastTick = Date.now();
  renderAll();

  /* 入口：每次都先选模块（记住已选过的进度，但依然先给选择界面） */
  if (DEMO) {
    el.entry.classList.add('hide');
    el.intro.classList.add('hide');
    scheduleRisk(6000);
    scheduleEvent(3000);
  } else {
    el.entry.classList.remove('hide');
  }
  setInterval(tick, 50);
})();
