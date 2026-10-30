import { createTianaFetch } from '@tianacloud/serverless';
/* ============================================================
   BUG SHELTER
   描述一个 bug → 孵化一只独一无二的生物 → 对症下药 → 收容
   ============================================================ */
(function () {
  'use strict';

  /* ------------------------------------------------------------
     0. 小工具
  ------------------------------------------------------------ */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var r1 = function (n) { return Math.round(n * 10) / 10; };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function hashStr(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function mkRng(seed) {
    var a = seed >>> 0;
    function next() {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    return {
      next: next,
      float: function (lo, hi) { return lo + next() * (hi - lo); },
      int: function (lo, hi) { return Math.floor(lo + next() * (hi - lo + 1)); },
      pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
      chance: function (p) { return next() < p; }
    };
  }

  /* ------------------------------------------------------------
     1. 物种库
  ------------------------------------------------------------ */
  var SPECIES = {
    pointer: {
      id: 'pointer', name: '指针兽', en: 'POINTER BEAST', shape: 'blob',
      palette: { main: '#b39cff', dark: '#5b21b6', light: '#ece6ff' },
      keywords: ['null', 'undefined', '空指针', 'npe', '引用', '指针', '未定义', 'cannot read', 'is not a function', '判空', '空了'],
      intro: '由一次失败的解引用凝结而成，身体里塞满了悬空的地址，靠你忘记判空为生。',
      names: ['空指针', '野指针', '幽灵引用', '悬垂指针'],
      cure: { code: 'if (obj == null) return;', label: '空值守卫', why: '先确认对象存在，再去碰它的属性。指针兽最怕的就是这句短路返回。' },
      wrong: [
        { code: 'try { ... } catch (e) {}', label: '静默吞异常', why: '它只是闭嘴了，并没有被治愈 —— 下次会以更凶的形态回来。' },
        { code: 'obj!.length', label: '非空断言', why: '你在骗编译器，可骗不过指针兽。半夜崩的就是你。' }
      ]
    },
    pixel: {
      id: 'pixel', name: '像素幽灵', en: 'PIXEL GHOST', shape: 'pixel',
      palette: { main: '#6ee7ff', dark: '#0e7490', light: '#d8f7ff' },
      keywords: ['css', '样式', '布局', '错位', '遮挡', '溢出', '对齐', '间距', 'flex', 'grid', '弹窗', '层级', 'z-index', '像素', 'ui', '界面'],
      intro: '住在样式表的夹缝里，只在换浏览器、换分辨率、换屏幕尺寸的时候现身。',
      names: ['像素幽灵', '布局幽灵', '一像素误差', '层叠幽灵'],
      cure: { code: 'box-sizing: border-box;', label: '盒模型矫正', why: '让宽高把 padding 和边框一起算进去，那一像素的错位立刻归位。' },
      wrong: [
        { code: '!important', label: '暴力覆盖', why: '你压住了它，却没搞清楚到底是谁在打架。' },
        { code: 'left: -9999px;', label: '眼不见为净', why: '它还在 DOM 里，只是被你赶到了屏幕外面。' }
      ]
    },
    timeworm: {
      id: 'timeworm', name: '时空蠕虫', en: 'TEMPORAL WORM', shape: 'worm',
      palette: { main: '#ffc94d', dark: '#b45309', light: '#ffeec2' },
      keywords: ['时区', '时间', '日期', 'utc', '缓存', '过期', 'timestamp', '跨天', '定时', 'cron', '零点', '昨天', '明天'],
      intro: '以 UTC 为食，靠服务器与用户之间的时差繁殖。跨天的时候最活跃。',
      names: ['时空蠕虫', '时区蠕虫', '夏令时之影', '零点翻车兽'],
      cure: { code: 'Intl.DateTimeFormat(zone)', label: '时区显式化', why: '把时区写进配置里，蠕虫就失去了穿梭的空间。' },
      wrong: [
        { code: 'new Date().toLocaleString()', label: '跟着服务器走', why: '换台机器它就换个形态咬你，问题永远复现不了。' },
        { code: '+ 8 * 3600 * 1000', label: '手动加八小时', why: '碰上夏令时和闰秒，这行代码自己会变异。' }
      ]
    },
    deadlock: {
      id: 'deadlock', name: '死锁双头兽', en: 'DEADLOCK TWINS', shape: 'twin',
      palette: { main: '#ff8f8f', dark: '#991b1b', light: '#ffe1e1' },
      keywords: ['并发', '线程', '死锁', '竞态', '锁', '异步', 'await', '卡死', '队列', '阻塞', '超时', '资源'],
      intro: '两个头互相等着对方先松口，于是谁都不松口。CPU 空着，服务卡着。',
      names: ['死锁双头兽', '竞态双子', '阻塞双生', 'O 型锁之兽'],
      cure: { code: '统一加锁顺序 + 超时', label: '锁序约定', why: '两个头抢同一把锁时按同一个顺序排队，就吵不起来了。' },
      wrong: [
        { code: 'sleep(100)', label: '加延时祈祷', why: '你只是把撞车的时间往后挪了挪，车还在。' },
        { code: 'synchronized(this)', label: '一把大锁全包', why: '死锁变成了排队，吞吐量跟着一起死。' }
      ]
    },
    slime: {
      id: 'slime', name: '环境史莱姆', en: 'ENV SLIME', shape: 'slime',
      palette: { main: '#7cf5c6', dark: '#047857', light: '#dcfff1' },
      keywords: ['环境', '依赖', '版本', '部署', '打包', 'ci', '构建', '本地', '线上', 'node_modules', 'docker', '配置', '安装'],
      intro: '在本地与线上之间来回穿梭，靠版本差异增殖。最常说的一句话是「本地能跑」。',
      names: ['环境史莱姆', '依赖史莱姆', '版本幽灵', '本地能跑兽'],
      cure: { code: '锁定 lockfile + 固定版本', label: '版本锚定', why: '把依赖钉死在版本上，史莱姆就没法在环境之间变形。' },
      wrong: [
        { code: 'rm -rf node_modules', label: '重装玄学', why: '有时候它真的好了，但没人知道为什么，也没人敢问。' },
        { code: '线上直接改配置', label: '手工热修', why: '你在给史莱姆喂食，它会长得更大。' }
      ]
    },
    scope: {
      id: 'scope', name: '需求变形兽', en: 'SCOPE CREEP', shape: 'morph',
      palette: { main: '#ff9ecb', dark: '#9d174d', light: '#ffe4f1' },
      keywords: ['需求', '产品', '甲方', '评审', '改需求', '加个', '顺便', '方案', '验收', '排期', '上线时间', '又要'],
      intro: '每被口头追一句「顺便加一下」，它就长大一圈。没有边界，所以没有上限。',
      names: ['需求变形兽', '原型怪兽', '顺便怪', '验收变形体'],
      cure: { code: '变更走评审 + 冻结范围', label: '范围冻结', why: '让每一次「顺便」都留下痕迹，它就没法白嫖生长了。' },
      wrong: [
        { code: '先做了再说', label: '先斩后奏', why: '它会记住这句话，然后继续长。' },
        { code: '加个开关兜底', label: '开关万能', why: '开关不是治愈，是给它留了扇后门。' }
      ]
    },
    glutton: {
      id: 'glutton', name: '内存饕餮', en: 'MEMORY GLUTTON', shape: 'maw',
      palette: { main: '#8fb4ff', dark: '#1e3a8a', light: '#e0ebff' },
      keywords: ['性能', '内存', '泄漏', '卡顿', '很慢', 'oom', '崩溃', '占用', 'cpu', '循环', '大数据', '越用越'],
      intro: '无底洞。你给它一块内存，它想要一整条内存条，然后想要整台机器。',
      names: ['内存饕餮', '泄漏兽', 'CPU 饕餮', '无底洞'],
      cure: { code: '取消订阅 / 释放引用', label: '引用回收', why: '把不再需要的东西真正放下，它就没东西可吃了。' },
      wrong: [
        { code: '把内存加到 32G', label: '扩容硬扛', why: '它会把新内存也吃干净，只是晚一点。' },
        { code: 'setInterval(fetch, 1000)', label: '轮询加餐', why: '你在按时给它投喂。' }
      ]
    },
    unknown: {
      id: 'unknown', name: '未知标本', en: 'UNKNOWN SPECIMEN', shape: 'random',
      palette: { main: '#9fe8d4', dark: '#0f5c4c', light: '#e3fff7' },
      keywords: [],
      intro: '数据库里没有它的记录。它可能来自任何一个深夜，也可能来自你自己。',
      names: ['未知标本', '无编号生物', '黑盒兽', '薛定谔的 Bug'],
      cure: { code: '最小复现 + 加日志', label: '复现观察', why: '能复现的 bug 就不再是怪物，只是一段你还没读到的逻辑。' },
      wrong: [
        { code: '重启试试', label: '重启玄学', why: '它有三成概率会回来，而且带着新特征。' },
        { code: '注释掉可疑代码', label: '大范围注释', why: '你只是把怪物关进了暗房，它还在里面。' }
      ]
    }
  };

  var TAGS = [
    { id: 'null', label: '空指针' },
    { id: 'css', label: '样式错位' },
    { id: 'time', label: '时区/时间' },
    { id: 'concurrency', label: '并发/死锁' },
    { id: 'env', label: '环境/依赖' },
    { id: 'scope', label: '需求变更' },
    { id: 'perf', label: '性能/内存' },
    { id: 'mystery', label: '说不清' }
  ];
  var TAG_SPECIES = { null: 'pointer', css: 'pixel', time: 'timeworm', concurrency: 'deadlock', env: 'slime', scope: 'scope', perf: 'glutton', mystery: 'unknown' };

  var SUFFIX = {
    N: ['实习期', '野生型', '常见种', '早八限定'],
    R: ['午夜三点型', '线上专供', '演示专用', '周一恐慌种'],
    SR: ['压测产物', '大促限定', '祖传代码变异体', '跨年零点种'],
    SSR: ['史诗个体', '十年一遇', '灭团级', '考古层出土']
  };
  var TIERS = ['N', 'R', 'SR', 'SSR'];
  var EMO_WORDS = ['崩溃', '绝望', '救命', '又', 'again', '半夜', '通宵', '哭', '疯', '离谱'];

  var SAMPLES = [
    '线上偶发空指针，本地怎么都复现不了，一到半夜三点就告警。',
    '按钮在 Chrome 里好好的，到 Safari 里往下挪了两像素。',
    '跨天的时候统计少了一天，怀疑是时区的问题。',
    '两个线程互相等对方的锁，服务就卡在那儿一动不动。',
    '本地跑得好好的，一部署就报依赖找不到。',
    '评审完第二天，需求又多了一个「顺便加一下」。',
    '页面越用越卡，内存曲线一路向上，从不回头。',
    '用户说页面白屏，我盯了半小时，没找到规律。'
  ];

  /* ------------------------------------------------------------
     2. 生物外形生成（纯 SVG，可序列化给 canvas 用）
  ------------------------------------------------------------ */
  var uidSeq = 0;

  function polar(rng, cx, cy, rx, ry, n, amp) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var k = 1 + (rng.next() * 2 - 1) * amp;
      pts.push({ x: cx + Math.cos(a) * rx * k, y: cy + Math.sin(a) * ry * k });
    }
    return pts;
  }

  function closedSmooth(pts) {
    var n = pts.length;
    var d = 'M ' + r1(pts[0].x) + ' ' + r1(pts[0].y);
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      var c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += ' C ' + r1(c1x) + ' ' + r1(c1y) + ' ' + r1(c2x) + ' ' + r1(c2y) + ' ' + r1(p2.x) + ' ' + r1(p2.y);
    }
    return d + ' Z';
  }

  function openSmooth(pts) {
    var d = 'M ' + r1(pts[0].x) + ' ' + r1(pts[0].y);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
      var c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += ' C ' + r1(c1x) + ' ' + r1(c1y) + ' ' + r1(c2x) + ' ' + r1(c2y) + ' ' + r1(p2.x) + ' ' + r1(p2.y);
    }
    return d;
  }

  function tentacles(rng, pal, baseY, spread) {
    var n = 2 + Math.floor(rng.next() * 3);
    var s = '';
    for (var i = 0; i < n; i++) {
      var t = n === 1 ? 0.5 : i / (n - 1);
      var x = 100 - spread * 0.68 + spread * 1.36 * t;
      var len = 8 + rng.next() * 10;
      var drift = (rng.next() - 0.5) * 9;
      s += '<path d="M ' + r1(x) + ' ' + r1(baseY) + ' Q ' + r1(x + drift) + ' ' + r1(baseY + len * 0.6) +
        ' ' + r1(x + drift * 1.4) + ' ' + r1(baseY + len) + '" fill="none" stroke="' + pal.dark +
        '" stroke-width="3.4" stroke-linecap="round" opacity=".8"/>';
    }
    return s;
  }

  function sBlob(rng, pal, uid) {
    var cx = 100, cy = 100;
    var rx = 48 + rng.float(-3, 8), ry = 44 + rng.float(-2, 8);
    var n = 10 + rng.int(0, 3);
    var d = closedSmooth(polar(rng, cx, cy, rx, ry, n, 0.12));
    var m = '<path d="' + d + '" fill="url(#b-' + uid + ')" stroke="rgba(5,10,8,.35)" stroke-width="2"/>';
    m += '<ellipse cx="' + r1(cx - rx * 0.16) + '" cy="' + r1(cy + ry * 0.34) + '" rx="' + r1(rx * 0.52) +
      '" ry="' + r1(ry * 0.36) + '" fill="#fff" opacity=".14"/>';
    return { markup: m, heads: [{ x: cx, y: cy - ry * 0.1, r: Math.min(rx, ry) * 0.96 }], limbs: tentacles(rng, pal, cy + ry * 0.78, rx) };
  }

  function sPixel(rng, pal, uid) {
    var cell = 15, cols = 7, rows = 7;
    var ox = 100 - (cols * cell) / 2, oy = 96 - (rows * cell) / 2;
    var m = '';
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var dx = x - 3, dy = (y - 3) * 1.02;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 3.05 && rng.chance(0.82)) continue;
        if (dist > 2.1 && rng.chance(0.2)) continue;
        m += '<rect x="' + r1(ox + x * cell) + '" y="' + r1(oy + y * cell) + '" width="' + (cell - 1.6) +
          '" height="' + (cell - 1.6) + '" rx="2.6" fill="url(#b-' + uid + ')" opacity="' + r1(0.7 + rng.next() * 0.3) + '"/>';
      }
    }
    return { markup: m, heads: [{ x: 100, y: 96, r: 44 }], limbs: '', eyeShape: 'pixel' };
  }

  function sWorm(rng, pal, uid) {
    var pts = [{ x: 58, y: 82 }, { x: 82, y: 110 }, { x: 106, y: 84 }, { x: 130, y: 110 }, { x: 150, y: 88 }];
    var d = openSmooth(pts);
    var m = '<path d="' + d + '" fill="none" stroke="url(#b-' + uid + ')" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>';
    for (var i = 1; i < pts.length - 1; i++) {
      m += '<circle cx="' + pts[i].x + '" cy="' + pts[i].y + '" r="7.5" fill="rgba(5,10,8,.16)"/>';
    }
    m += '<circle cx="58" cy="82" r="25" fill="url(#b-' + uid + ')" stroke="rgba(5,10,8,.3)" stroke-width="2"/>';
    return { markup: m, heads: [{ x: 58, y: 82, r: 25 }], limbs: '' };
  }

  function sTwin(rng, pal, uid) {
    var a = { x: 68, y: 104, r: 29 }, b = { x: 132, y: 104, r: 29 };
    var m = '<rect x="97" y="88" width="6" height="32" rx="3" fill="url(#b-' + uid + ')" opacity=".92"/>';
    m += '<path d="' + closedSmooth(polar(rng, a.x, a.y, a.r, a.r * 0.96, 10, 0.1)) + '" fill="url(#b-' + uid + ')" stroke="rgba(5,10,8,.3)" stroke-width="2"/>';
    m += '<path d="' + closedSmooth(polar(rng, b.x, b.y, b.r, b.r * 0.96, 10, 0.1)) + '" fill="url(#b-' + uid + ')" stroke="rgba(5,10,8,.3)" stroke-width="2"/>';
    return { markup: m, heads: [{ x: a.x, y: a.y, r: a.r }, { x: b.x, y: b.y, r: b.r }], limbs: tentacles(rng, pal, 132, 40) };
  }

  function sSlime(rng, pal, uid) {
    var w = 47 + rng.float(-2, 6);
    var top = 62 + rng.float(-4, 8), bottom = 136;
    var L = 100 - w, R = 100 + w;
    var d = 'M ' + r1(L) + ' ' + bottom +
      ' C ' + r1(L - 2) + ' ' + r1(top + 40) + ' ' + r1(100 - w * 0.6) + ' ' + r1(top) + ' 100 ' + r1(top) +
      ' C ' + r1(100 + w * 0.6) + ' ' + r1(top) + ' ' + r1(R + 2) + ' ' + r1(top + 40) + ' ' + r1(R) + ' ' + bottom +
      ' C ' + r1(R) + ' ' + r1(bottom + 6) + ' ' + r1(R - 9) + ' ' + r1(bottom + 6) + ' ' + r1(R - 15) + ' ' + r1(bottom + 6) +
      ' L ' + r1(L + 15) + ' ' + r1(bottom + 6) +
      ' C ' + r1(L + 9) + ' ' + r1(bottom + 6) + ' ' + r1(L) + ' ' + r1(bottom + 6) + ' ' + r1(L) + ' ' + bottom + ' Z';
    var m = '<path d="' + d + '" fill="url(#b-' + uid + ')" stroke="rgba(5,10,8,.32)" stroke-width="2"/>';
    m += '<ellipse cx="86" cy="' + r1(top + 22) + '" rx="10" ry="6" fill="#fff" opacity=".35" transform="rotate(-20 86 ' + r1(top + 22) + ')"/>';
    return { markup: m, heads: [{ x: 100, y: top + w * 0.74, r: w * 0.56 }], limbs: '' };
  }

  function sMorph(rng, pal, uid) {
    var n = 8 + rng.int(0, 3);
    var d = closedSmooth(polar(rng, 100, 102, 52, 48, n, 0.26));
    var m = '<path d="' + d + '" fill="url(#b-' + uid + ')" stroke="rgba(5,10,8,.32)" stroke-width="2"/>';
    m += '<ellipse cx="88" cy="118" rx="20" ry="12" fill="#fff" opacity=".12"/>';
    return { markup: m, heads: [{ x: 100, y: 98, r: 42 }], limbs: tentacles(rng, pal, 140, 40) };
  }

  function sMaw(rng, pal, uid) {
    var r = 52;
    var m = '<circle cx="100" cy="100" r="' + r + '" fill="url(#b-' + uid + ')" stroke="rgba(5,10,8,.32)" stroke-width="2"/>';
    m += '<path d="M 62 106 A 38 38 0 0 0 138 106 Z" fill="#07100d" opacity=".92"/>';
    var teeth = [72, 83, 94, 105, 116];
    for (var i = 0; i < teeth.length; i++) {
      m += '<path d="M ' + teeth[i] + ' 106 l 5.5 11 l 5.5 -11 Z" fill="#e6f4ee" opacity=".85"/>';
    }
    m += '<ellipse cx="82" cy="74" rx="18" ry="10" fill="#fff" opacity=".14"/>';
    return { markup: m, heads: [{ x: 100, y: 76, r: 36 }], limbs: tentacles(rng, pal, 148, 34), mouthDrawn: true };
  }

  function eyeMarkup(cx, cy, r, style, healed, square) {
    var s = '<g>';
    if (square) {
      var q = r1(r * 0.92);
      s += '<rect x="' + r1(cx - q) + '" y="' + r1(cy - q) + '" width="' + r1(q * 2) + '" height="' + r1(q * 2) +
        '" rx="1.5" fill="#f6fbff"/>';
      s += '<rect class="pupil" x="' + r1(cx - q * 0.42) + '" y="' + r1(cy - q * 0.42) + '" width="' + r1(q * 0.84) +
        '" height="' + r1(q * 0.84) + '" rx="1" fill="#0a0a12"/>';
      return s + '</g>';
    }
    if (style === 'void') {
      s += '<circle cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(r) + '" fill="#070b12" opacity=".9"/>';
      s += '<circle class="pupil" cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(r * 0.3) +
        '" fill="' + (healed ? '#7cf5c6' : '#9a7bff') + '"/>';
    } else {
      s += '<ellipse cx="' + r1(cx) + '" cy="' + r1(cy) + '" rx="' + r1(r) + '" ry="' + r1(r * 1.02) + '" fill="#f6fbff"/>';
      if (style === 'slit') {
        s += '<ellipse class="pupil" cx="' + r1(cx) + '" cy="' + r1(cy) + '" rx="' + r1(r * 0.2) + '" ry="' + r1(r * 0.66) +
          '" fill="#0a0a12"/>';
      } else {
        s += '<circle class="pupil" cx="' + r1(cx) + '" cy="' + r1(cy + r * 0.08) + '" r="' + r1(r * 0.46) + '" fill="#0a0a12"/>';
        s += '<circle cx="' + r1(cx - r * 0.34) + '" cy="' + r1(cy - r * 0.36) + '" r="' + r1(r * 0.16) + '" fill="#fff" opacity=".95"/>';
      }
    }
    return s + '</g>';
  }

  function eyesFor(h, n, style, healed, rng, square) {
    var scale = n >= 4 ? 0.19 : n === 3 ? 0.22 : 0.26;
    var er = Math.max(4.2, Math.min(13, h.r * scale));
    var s = '';
    for (var i = 0; i < n; i++) {
      var span = h.r * 1.02;
      var t = n === 1 ? 0.5 : i / (n - 1);
      var ex = h.x - span / 2 + span * t;
      var ey = h.y - h.r * 0.08 + (n > 1 ? Math.abs(t - 0.5) * h.r * 0.14 : 0);
      s += eyeMarkup(ex, ey, er * (0.9 + rng.next() * 0.18), style, healed, square);
    }
    return s;
  }

  function mouthMarkup(h, kind) {
    if (kind === 'none') return '';
    var cx = h.x, cy = h.y + h.r * 0.54, w = h.r * 0.42;
    if (kind === 'fangs') {
      return '<path d="M ' + r1(cx - w) + ' ' + r1(cy) + ' Q ' + r1(cx) + ' ' + r1(cy + w * 0.95) + ' ' + r1(cx + w) + ' ' + r1(cy) +
        '" fill="none" stroke="#0a0a12" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M ' + r1(cx - w * 0.5) + ' ' + r1(cy + w * 0.2) + ' l 3 7 l 3 -7 Z" fill="#f6fbff"/>' +
        '<path d="M ' + r1(cx + w * 0.12) + ' ' + r1(cy + w * 0.38) + ' l 3 7 l 3 -7 Z" fill="#f6fbff"/>';
    }
    if (kind === 'tube') {
      return '<ellipse cx="' + r1(cx) + '" cy="' + r1(cy + w * 0.2) + '" rx="' + r1(w * 0.28) + '" ry="' + r1(w * 0.34) +
        '" fill="#0a0a12" opacity=".82"/>';
    }
    if (kind === 'smile') {
      return '<path d="M ' + r1(cx - w * 0.8) + ' ' + r1(cy - w * 0.12) + ' Q ' + r1(cx) + ' ' + r1(cy + w) + ' ' + r1(cx + w * 0.8) +
        ' ' + r1(cy - w * 0.12) + '" fill="none" stroke="#0a0a12" stroke-width="3.2" stroke-linecap="round"/>';
    }
    return '<path d="M ' + r1(cx - w * 0.72) + ' ' + r1(cy + w * 0.34) + ' Q ' + r1(cx) + ' ' + r1(cy - w * 0.52) + ' ' + r1(cx + w * 0.72) +
      ' ' + r1(cy + w * 0.34) + '" fill="none" stroke="#0a0a12" stroke-width="3" stroke-linecap="round"/>';
  }

  function creatureSVG(rec, opts) {
    var o = opts || {};
    var spec = SPECIES[rec.species] || SPECIES.unknown;
    var rng = mkRng(rec.seed >>> 0);
    var R = rec.rarity || 'N';
    var healed = !!rec.healed;
    var pal = spec.palette;
    var uid = 'g' + (++uidSeq);
    var size = o.size || 240;

    var shapeKey = spec.shape === 'random' ? rng.pick(['blob', 'pixel', 'worm', 'twin', 'slime', 'morph', 'maw']) : spec.shape;
    var built;
    if (shapeKey === 'pixel') built = sPixel(rng, pal, uid);
    else if (shapeKey === 'worm') built = sWorm(rng, pal, uid);
    else if (shapeKey === 'twin') built = sTwin(rng, pal, uid);
    else if (shapeKey === 'slime') built = sSlime(rng, pal, uid);
    else if (shapeKey === 'morph') built = sMorph(rng, pal, uid);
    else if (shapeKey === 'maw') built = sMaw(rng, pal, uid);
    else built = sBlob(rng, pal, uid);

    var eyeCount = R === 'SSR' ? rng.int(3, 5) : R === 'SR' ? rng.int(2, 3) : rng.int(1, 2);
    var eyeStyle = R === 'SSR' ? 'void' : (rng.chance(0.4) ? 'slit' : 'round');
    var mouthKind = built.mouthDrawn ? 'none' : (healed ? 'smile' : rng.pick(['frown', 'fangs', 'tube', 'frown']));

    var eyes = '';
    for (var i = 0; i < built.heads.length; i++) {
      var n = built.heads.length > 1 ? (R === 'SSR' ? 2 : 1) : eyeCount;
      eyes += eyesFor(built.heads[i], n, eyeStyle, healed, rng, built.eyeShape === 'pixel');
    }

    var mouth = built.mouthDrawn ? '' : mouthMarkup(built.heads[0], mouthKind);

    var blush = '';
    if (healed) {
      var bh = built.heads[0];
      blush = '<ellipse cx="' + r1(bh.x - bh.r * 0.62) + '" cy="' + r1(bh.y + bh.r * 0.34) + '" rx="' + r1(bh.r * 0.2) +
        '" ry="' + r1(bh.r * 0.11) + '" fill="#ff8fa8" opacity=".38"/>' +
        '<ellipse cx="' + r1(bh.x + bh.r * 0.62) + '" cy="' + r1(bh.y + bh.r * 0.34) + '" rx="' + r1(bh.r * 0.2) +
        '" ry="' + r1(bh.r * 0.11) + '" fill="#ff8fa8" opacity=".38"/>';
    }

    var aura = '', spark = '';
    if (R === 'SR' || R === 'SSR') {
      aura += '<circle class="aura-ring" cx="100" cy="100" r="' + (R === 'SSR' ? 62 : 56) + '" fill="none" stroke="' + pal.main +
        '" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="3 9"/>';
      aura += '<circle cx="100" cy="100" r="' + (R === 'SSR' ? 66 : 60) + '" fill="none" stroke="' + pal.main +
        '" stroke-opacity=".12" stroke-width="1"/>';
    }
    if (R === 'SSR') {
      for (var k = 0; k < 6; k++) {
        var a = (k / 6) * Math.PI * 2 + 0.4;
        var px = 100 + Math.cos(a) * (50 + rng.next() * 12);
        var py = 100 + Math.sin(a) * (50 + rng.next() * 12);
        spark += '<path class="spark" style="animation-delay:' + r1(rng.next() * 2.4) + 's" d="M ' + r1(px) + ' ' + r1(py - 4) +
          ' L ' + r1(px + 1.6) + ' ' + r1(py - 1.6) + ' L ' + r1(px + 4) + ' ' + r1(py) + ' L ' + r1(px + 1.6) + ' ' + r1(py + 1.6) +
          ' L ' + r1(px) + ' ' + r1(py + 4) + ' L ' + r1(px - 1.6) + ' ' + r1(py + 1.6) + ' L ' + r1(px - 4) + ' ' + r1(py) +
          ' L ' + r1(px - 1.6) + ' ' + r1(py - 1.6) + ' Z" fill="#ffe6a3" opacity=".9"/>';
      }
    }

    var glowFilter = (R === 'SSR') ? ' filter="url(#glow-' + uid + ')"' : '';
    var K = 1.3;

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="' + size + '" height="' + size +
      '" role="img" aria-label="' + esc(spec.name) + '">' +
      '<defs>' +
      '<radialGradient id="b-' + uid + '" cx="34%" cy="26%" r="82%">' +
      '<stop offset="0" stop-color="' + pal.light + '"/>' +
      '<stop offset="52%" stop-color="' + pal.main + '"/>' +
      '<stop offset="100%" stop-color="' + pal.dark + '"/>' +
      '</radialGradient>' +
      '<filter id="glow-' + uid + '" x="-60%" y="-60%" width="220%" height="220%">' +
      '<feGaussianBlur stdDeviation="4" result="bb"/><feMerge><feMergeNode in="bb"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '<radialGradient id="h-' + uid + '" cx="50%" cy="50%" r="50%">' +
      '<stop offset="55%" stop-color="' + pal.main + '" stop-opacity=".22"/>' +
      '<stop offset="100%" stop-color="' + pal.main + '" stop-opacity="0"/>' +
      '</radialGradient>' +
      '</defs>' +
      '<ellipse cx="100" cy="168" rx="40" ry="6.5" fill="#000" opacity=".26"/>' +
      '<g transform="translate(100 100) scale(' + K + ') translate(-100 -100)">' +
      aura +
      '<g class="anim-bob"' + glowFilter + '>' +
      '<g opacity=".95">' + built.limbs + '</g>' +
      (healed ? '<circle cx="100" cy="102" r="' + (R === 'SSR' ? 74 : 68) + '" fill="url(#h-' + uid + ')"/>' : '') +
      built.markup + blush + eyes + mouth + spark +
      '</g></g></svg>';
  }

  /* ------------------------------------------------------------
     3. 音效（WebAudio 合成，无外部资源）
  ------------------------------------------------------------ */
  var Sfx = {
    ctx: null,
    muted: false,
    ensure: function () {
      if (this.muted) return null;
      if (!this.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try { this.ctx = new AC(); } catch (e) { return null; }
      }
      if (this.ctx.state === 'suspended') { try { this.ctx.resume(); } catch (e) {} }
      return this.ctx;
    },
    tone: function (freq, dur, o) {
      o = o || {};
      var ctx = this.ensure();
      if (!ctx) return;
      var t0 = ctx.currentTime + (o.delay || 0);
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      if (o.to) {
        try { osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur); } catch (e) {}
      }
      var vol = o.vol == null ? 0.05 : o.vol;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.014);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    },
    click: function () { this.tone(560, 0.05, { type: 'triangle', vol: 0.028 }); },
    scan: function () {
      this.tone(180, 0.55, { type: 'sine', vol: 0.022, to: 920 });
      this.tone(880, 0.06, { type: 'square', vol: 0.012, delay: 0.18 });
      this.tone(1180, 0.06, { type: 'square', vol: 0.012, delay: 0.44 });
    },
    hatch: function () {
      var ns = [523, 659, 784, 1046];
      for (var i = 0; i < ns.length; i++) this.tone(ns[i], 0.16, { type: 'triangle', vol: 0.04, delay: i * 0.075 });
    },
    good: function () {
      var ns = [523, 659, 784, 1046];
      for (var i = 0; i < ns.length; i++) this.tone(ns[i], 0.42, { type: 'sine', vol: 0.032, delay: i * 0.03 });
      this.tone(1568, 0.5, { type: 'triangle', vol: 0.016, delay: 0.14 });
    },
    bad: function () {
      this.tone(150, 0.3, { type: 'sawtooth', vol: 0.04, to: 68 });
      this.tone(90, 0.24, { type: 'square', vol: 0.022, delay: 0.05 });
    }
  };

  /* ------------------------------------------------------------
     4. 状态与存储
  ------------------------------------------------------------ */
  var dbExecute;
  var writeQueue = Promise.resolve();
  var state = {
    records: [],
    stats: { hatched: 0, healed: 0, bites: 0 },
    muted: false,
    phase: 'idle',
    current: null,
    solved: false,
    wrongIds: [],
    lastHatch: 0
  };
  var selectedTags = [];
  var hatchTimer = null;

  async function load() {
    if (!window.tiana || !window.tiana.auth || typeof window.tiana.auth.getAccessToken !== 'function') throw new Error('账号认证尚未就绪');
    var conn = await window.tiana.connection();
    if (conn.sql_api !== 'hrana-v3') throw new Error('数据库协议暂不支持');
    var sqlFetch = createTianaFetch({origin: conn.origin, auth: window.tiana.auth, requestBodyMode: 'buffered'});
    dbExecute = async function (sql, args) {
      var res = await sqlFetch(conn.origin + '/v3/pipeline', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql:sql,args:args || [],want_rows:true}},{type:'close'}]})});
      if (!res.ok) throw new Error('数据库请求失败，写入结果可能未知');
      var body = await res.json(); var item = body.results && body.results[0];
      if (!item || item.type !== 'ok' || item.response.type !== 'execute') throw new Error('数据库操作失败，写入结果可能未知');
      return item.response.result;
    };
    var result = await dbExecute('SELECT data FROM shelter_state WHERE id = 1');
    if (result.rows && result.rows.length) {
      var d = JSON.parse(result.rows[0][0].value);
      if (Array.isArray(d.records)) state.records = d.records;
      if (d.stats) state.stats = d.stats;
      state.muted = !!d.muted;
    }
  }
  function save() {
    var snapshot = JSON.stringify({records:state.records,stats:state.stats,muted:state.muted});
    writeQueue = writeQueue.then(function () { return dbExecute('INSERT INTO shelter_state (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data', [{type:'text',value:snapshot}]); }).catch(function () {
      toast('保存失败或结果未知，请重新打开应用检查数据', 'bad');
      document.querySelectorAll('button, textarea').forEach(function (el) { el.disabled = true; });
      throw new Error('保存失败或结果未知');
    });
    writeQueue.catch(function () {});
  }

  /* ------------------------------------------------------------
     5. 生成记录
  ------------------------------------------------------------ */
  function createRecord(text, tagIds) {
    var norm = text.replace(/\s+/g, ' ').trim();
    var seed = hashStr(norm + '|' + tagIds.slice().sort().join(','));
    var rng = mkRng(seed);

    var labelText = tagIds.map(function (t) {
      for (var i = 0; i < TAGS.length; i++) if (TAGS[i].id === t) return TAGS[i].label;
      return '';
    }).join(' ');
    var hay = (norm + ' ' + labelText).toLowerCase();

    var speciesId = 'unknown', best = 0;
    Object.keys(SPECIES).forEach(function (k) {
      var sp = SPECIES[k];
      if (sp.id === 'unknown') return;
      var sc = 0;
      for (var i = 0; i < sp.keywords.length; i++) {
        if (hay.indexOf(sp.keywords[i]) >= 0) sc += sp.keywords[i].length >= 3 ? 2 : 1.4;
      }
      for (var j = 0; j < tagIds.length; j++) {
        if (TAG_SPECIES[tagIds[j]] === sp.id) sc += 4.5;
      }
      if (sc > best) { best = sc; speciesId = sp.id; }
    });

    // 稀有度
    var rs = 0;
    rs += Math.min(3, Math.floor(norm.length / 45));
    var punc = (norm.match(/[!！?？]/g) || []).length;
    if (punc >= 2) rs += 1;
    var emo = 0;
    for (var e = 0; e < EMO_WORDS.length; e++) if (norm.indexOf(EMO_WORDS[e]) >= 0) emo++;
    if (emo >= 1) rs += 1;
    if (emo >= 2) rs += 1;
    rs += rng.int(0, 2);

    var tier = rs >= 7 ? 3 : rs >= 5 ? 2 : rs >= 3 ? 1 : 0;
    var dup = false;
    for (var d2 = 0; d2 < state.records.length; d2++) if (state.records[d2].fp === seed) dup = true;
    if (dup) tier = clamp(tier + 1, 0, 3);
    var rarity = TIERS[tier];

    var sp = SPECIES[speciesId];
    var name = rng.pick(sp.names) + '·' + rng.pick(SUFFIX[rarity]) + (dup ? ' II' : '');

    var stats = {
      tox: clamp(Math.round(30 + rng.next() * 48 + (norm.length > 40 ? 8 : 0) + emo * 3), 12, 99),
      stealth: clamp(Math.round(25 + rng.next() * 52 + ((hay.indexOf('偶发') >= 0 || hay.indexOf('复现') >= 0) ? 12 : 0)), 10, 99),
      fert: clamp(Math.round(20 + rng.next() * 56 + ((hay.indexOf('线上') >= 0 || hay.indexOf('告警') >= 0) ? 10 : 0)), 8, 99)
    };

    return {
      id: seed.toString(36) + '-' + Date.now().toString(36),
      fp: seed,
      seed: seed,
      species: speciesId,
      rarity: rarity,
      name: name,
      code: 'SPEC-' + (seed % 46656).toString(36).toUpperCase().replace(/^/, '000').slice(-3),
      stats: stats,
      text: norm,
      tags: tagIds.slice(),
      healed: false,
      at: Date.now()
    };
  }

  /* ------------------------------------------------------------
     6. 渲染
  ------------------------------------------------------------ */
  var els = {};

  function uniqueSpecies() {
    var set = {};
    var c = 0;
    for (var i = 0; i < state.records.length; i++) {
      var s = state.records[i].species;
      if (!set[s]) { set[s] = 1; c++; }
    }
    return c;
  }

  function renderStats() {
    var healed = 0;
    for (var i = 0; i < state.records.length; i++) if (state.records[i].healed) healed++;
    els.stats.innerHTML =
      '<span class="chip is-hot">收容 <b>' + state.records.length + '</b></span>' +
      '<span class="chip">治愈 <b>' + healed + '</b></span>' +
      '<span class="chip">被咬 <b>' + state.stats.bites + '</b></span>' +
      '<span class="chip">物种 <b>' + uniqueSpecies() + '/8</b></span>';
  }

  function renderTags() {
    var html = '';
    for (var i = 0; i < TAGS.length; i++) {
      var t = TAGS[i];
      var on = selectedTags.indexOf(t.id) >= 0;
      html += '<button type="button" class="tag' + (on ? ' on' : '') + '" data-tag="' + t.id + '">' + esc(t.label) + '</button>';
    }
    els.tags.innerHTML = html;
  }

  function renderChamber() {
    var el = els.chamber;
    if (state.phase === 'idle') {
      el.innerHTML =
        '<div class="idle-box">' +
        '<div class="pod">' +
        '<svg viewBox="0 0 64 74" width="86" height="100" fill="none" stroke="currentColor" stroke-width="1.6">' +
        '<path d="M 32 6 C 48 14 56 32 56 44 C 56 60 45 70 32 70 C 19 70 8 60 8 44 C 8 32 16 14 32 6 Z"/>' +
        '<path d="M 20 34 q 6 -6 11 0 q 5 6 11 0" stroke-opacity=".5" stroke-linecap="round"/>' +
        '<circle cx="24" cy="48" r="1.8" fill="currentColor" stroke="none" opacity=".7"/>' +
        '<circle cx="40" cy="48" r="1.8" fill="currentColor" stroke="none" opacity=".7"/>' +
        '<path d="M 27 56 q 5 4 10 0" stroke-opacity=".45" stroke-linecap="round"/>' +
        '</svg></div>' +
        '<p class="idle-title">收容舱空着</p>' +
        '<p class="idle-sub">左边填一张申请单，它就有东西住了。</p>' +
        '<div class="idle-meta mono"><i></i>SHELTER 01 · READY</div>' +
        '</div>';
    } else if (state.phase === 'scan') {
      el.innerHTML =
        '<div class="scan-box">' +
        '<div class="orb"></div>' +
        '<ul class="scan-log">' +
        '<li style="--d:0s">读取描述…</li>' +
        '<li style="--d:.26s">匹配物种库…</li>' +
        '<li style="--d:.52s">测量毒性指数…</li>' +
        '<li style="--d:.78s">装箱中…</li>' +
        '</ul></div>';
    } else {
      el.innerHTML = resultHTML();
    }
  }

  function statRow(label, val) {
    return '<div class="stat"><span>' + label + '</span><i><b style="width:' + val + '%"></b></i><em>' + val + '</em></div>';
  }

  function resultHTML() {
    var r = state.current;
    if (!r) return '';
    var sp = SPECIES[r.species];
    var visual =
      '<div class="result-visual">' +
      '<div class="vtop"><span class="spec-code mono">' + esc(r.code) + '</span>' +
      '<span class="rarity-badge r-' + r.rarity + '">' + r.rarity + '</span></div>' +
      '<div class="creature-wrap"><div class="reticle"></div>' + creatureSVG(r, { size: 260 }) + '</div>' +
      '<div class="vbot mono">' + esc(sp.en) + '</div>' +
      '</div>';

    var body =
      '<div class="result-body">' +
      '<div class="name-row"><h3>' + esc(r.name) + '</h3><span class="species-tag">' + esc(sp.name) + '</span></div>' +
      '<p class="lore">' + esc(sp.intro) + '</p>' +
      '<div class="stats">' + statRow('毒性', r.stats.tox) + statRow('隐蔽', r.stats.stealth) + statRow('繁殖', r.stats.fert) + '</div>' +
      '<p class="quote">“' + esc(r.text) + '”</p>' +
      (state.solved ? successHTML() : treatHTML()) +
      '</div>';

    return '<div class="result">' + visual + body + '</div>';
  }

  function treatHTML() {
    var r = state.current;
    var sp = SPECIES[r.species];
    var opts = [{ id: 'c', p: sp.cure }];
    for (var i = 0; i < sp.wrong.length; i++) opts.push({ id: 'w' + i, p: sp.wrong[i] });
    // 稳定洗牌（按 seed 决定顺序，同一只生物选项顺序一致）
    var rng = mkRng(r.seed ^ 0x9e3779b9);
    for (var k = opts.length - 1; k > 0; k--) {
      var j = Math.floor(rng.next() * (k + 1));
      var tmp = opts[k]; opts[k] = opts[j]; opts[j] = tmp;
    }
    var letters = ['A', 'B', 'C', 'D'];
    var html = '';
    for (var m = 0; m < opts.length; m++) {
      var o = opts[m];
      var wrong = state.wrongIds.indexOf(o.id) >= 0;
      var right = state.solved && o.id === 'c';
      html += '<button type="button" class="patch' + (wrong ? ' wrong' : '') + (right ? ' right' : '') +
        '" data-patch="' + o.id + '"' + (wrong ? ' disabled' : '') + '>' +
        '<span class="patch-idx">' + letters[m] + '</span>' +
        '<code>' + esc(o.p.code) + '</code>' +
        '<span class="patch-label">' + esc(o.p.label) + '</span>' +
        '</button>';
    }
    return '<div class="treat">' +
      '<div class="treat-head"><span class="vet">DUTY VET</span>值班兽医诊断</div>' +
      '<p class="treat-sub">它正在咬人。选一个正确的处置方案把它稳住：</p>' +
      '<div class="patches">' + html + '</div>' +
      '</div>';
  }

  function successHTML() {
    var r = state.current;
    return '<div class="success">' +
      '<h4>收容成功</h4>' +
      '<p>它安静下来了，眼睛也软了。<b>' + esc(r.name) + '</b> 已录入图鉴，编号 ' + esc(r.code) + '。<br/>' +
      '诊断笔记：' + esc(SPECIES[r.species].cure.why) + '</p>' +
      '<div class="success-actions">' +
      '<button type="button" class="ghost-btn" data-act="card">下载战绩卡</button>' +
      '<button type="button" class="ghost-btn" data-act="copy">复制分享文案</button>' +
      '<button type="button" class="ghost-btn" data-act="again">再养一只</button>' +
      '</div></div>';
  }

  var SPECIES_ORDER = ['pointer', 'pixel', 'timeworm', 'deadlock', 'slime', 'scope', 'glutton', 'unknown'];

  function renderSpeciesStrip() {
    var seen = {};
    for (var i = 0; i < state.records.length; i++) seen[state.records[i].species] = 1;
    var html = '';
    for (var j = 0; j < SPECIES_ORDER.length; j++) {
      var s = SPECIES[SPECIES_ORDER[j]];
      var on = !!seen[s.id];
      html += '<span class="sp-chip' + (on ? ' on' : '') + '">' +
        '<i' + (on ? ' style="color:' + s.palette.main + '"' : '') + '></i>' + (on ? esc(s.name) : '未发现') + '</span>';
    }
    els.speciesStrip.innerHTML = html;
  }

  function renderGallery() {
    var recs = state.records;
    var healed = 0;
    for (var i = 0; i < recs.length; i++) if (recs[i].healed) healed++;
    els.galleryMeta.textContent = recs.length
      ? ('共 ' + recs.length + ' 只 · 已治愈 ' + healed + ' 只 · 物种 ' + uniqueSpecies() + '/8')
      : '';
    renderSpeciesStrip();

    if (!recs.length) {
      els.gallery.innerHTML = '<div class="gempty">图鉴还是空的。<br/>上面写一句今天的 bug，第一只就会住进来。</div>';
      return;
    }
    var html = '';
    for (var j = 0; j < recs.length; j++) {
      var r = recs[j];
      html += '<button type="button" class="gcard" data-rec="' + r.id + '">' +
        '<div class="mini">' + creatureSVG(r, { size: 92 }) + '</div>' +
        '<div class="gname">' + esc(r.name) + '</div>' +
        '<div class="gmeta"><span class="rarity-badge r-' + r.rarity + '">' + r.rarity + '</span>' +
        '<span>' + (r.healed ? '已收容' : '待收容') + '</span></div>' +
        '</button>';
    }
    els.gallery.innerHTML = html;
  }

  /* ------------------------------------------------------------
     7. 交互：孵化 / 诊断
  ------------------------------------------------------------ */
  function toast(msg, kind) {
    var d = document.createElement('div');
    d.className = 'toast' + (kind === 'bad' ? ' bad' : '');
    d.textContent = msg;
    els.toastWrap.appendChild(d);
    setTimeout(function () {
      d.classList.add('out');
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 320);
    }, 2400);
  }

  function hatch() {
    var text = els.text.value.trim();
    if (text.length < 4) {
      toast('再多写两个字，它还没成形', 'bad');
      els.text.focus();
      return;
    }
    clearTimeout(hatchTimer);
    state.phase = 'scan';
    state.current = null;
    state.solved = false;
    state.wrongIds = [];
    renderChamber();
    Sfx.scan();

    hatchTimer = setTimeout(function () {
      var rec = createRecord(text, selectedTags);
      state.current = rec;
      state.phase = 'result';
      state.records.unshift(rec);
      state.stats.hatched++;
      save();
      renderStats();
      renderGallery();
      renderChamber();
      Sfx.hatch();
      scrollChamber();
    }, 1250);
  }

  function scrollChamber() {
    try {
      var y = els.chamber.getBoundingClientRect().top + window.pageYOffset - 80;
      if (Math.abs(window.pageYOffset - y) > 40) window.scrollTo({ top: y, behavior: 'smooth' });
    } catch (e) {}
  }

  function currentRecord() {
    if (!state.current) return null;
    for (var i = 0; i < state.records.length; i++) if (state.records[i].id === state.current.id) return state.records[i];
    return state.current;
  }

  function choosePatch(id) {
    var r = state.current;
    if (!r || state.solved) return;
    var sp = SPECIES[r.species];
    if (id === 'c') {
      state.solved = true;
      r.healed = true;
      var rec = currentRecord();
      if (rec) rec.healed = true;
      save();
      Sfx.good();
      renderStats();
      renderGallery();
      renderChamber();
      checkMilestones();
    } else {
      state.wrongIds.push(id);
      state.stats.bites++;
      save();
      Sfx.bad();
      var idx = parseInt(id.replace('w', ''), 10);
      var p = sp.wrong[idx];
      toast(p ? p.why : '它咬了你一口，再想想。', 'bad');
      els.chamber.classList.remove('shake');
      void els.chamber.offsetWidth;
      els.chamber.classList.add('shake');
      renderStats();
      renderChamber();
    }
  }

  function checkMilestones() {
    var healedCount = 0;
    for (var i = 0; i < state.records.length; i++) if (state.records[i].healed) healedCount++;
    if (healedCount === 1) toast('第一只收容成功，你现在是值班兽医了');
    if (healedCount === 5) toast('已治愈 5 只，收容所开始有味道了');
    if (uniqueSpecies() >= 8) toast('八个物种全部见过，图鉴已经完整');
  }

  /* ------------------------------------------------------------
     8. 战绩卡（canvas 导出 PNG）
  ------------------------------------------------------------ */
  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function svgToImage(markup) {
    return new Promise(function (resolve, reject) {
      var svg = markup.replace('<svg ', '<svg style="background:transparent" ');
      var blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('svg render failed')); };
      img.src = url;
    });
  }

  function wrapLines(g, text, maxW, maxLines) {
    var lines = [], line = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var test = line + ch;
      if (g.measureText(test).width > maxW && line) {
        lines.push(line);
        line = ch;
        if (lines.length === maxLines) break;
      } else {
        line = test;
      }
    }
    if (lines.length < maxLines && line) lines.push(line);
    if (lines.length === maxLines) {
      var last = lines[maxLines - 1];
      if (last.length < text.length && text.indexOf(last) + last.length < text.length) {
        while (g.measureText(last + '…').width > maxW && last.length > 0) last = last.slice(0, -1);
        lines[maxLines - 1] = last + '…';
      }
    }
    return lines;
  }

  function formatDate(ts) {
    var d = new Date(ts);
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '.' + p(d.getMonth() + 1) + '.' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function renderCard(rec) {
    var W = 1080, H = 1440;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var g = c.getContext('2d');
    var sp = SPECIES[rec.species];
    var R = rec.rarity;
    var sans = '"PingFang SC","Microsoft YaHei","HarmonyOS Sans SC",system-ui,sans-serif';
    var mono = '"JetBrains Mono",Consolas,monospace';

    // 背景
    var bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#08120f');
    bg.addColorStop(0.55, '#060d0b');
    bg.addColorStop(1, '#080f14');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    var glow = g.createRadialGradient(W / 2, 560, 40, W / 2, 560, 620);
    glow.addColorStop(0, 'rgba(62,232,166,0.20)');
    glow.addColorStop(1, 'rgba(62,232,166,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, W, H);

    // 网格
    g.strokeStyle = 'rgba(255,255,255,0.035)';
    g.lineWidth = 1;
    for (var x = 0; x <= W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (var y = 0; y <= H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }

    // 顶部
    g.fillStyle = '#3ee8a6';
    g.font = '700 26px ' + mono;
    g.textAlign = 'left';
    g.fillText('BUG SHELTER', 72, 96);

    g.fillStyle = 'rgba(255,255,255,0.32)';
    g.font = '400 22px ' + mono;
    g.fillText('SPECIMEN RECORD', 72, 130);

    // 右上角徽章
    g.textAlign = 'right';
    g.fillStyle = 'rgba(62,232,166,0.14)';
    roundRect(g, W - 72 - 236, 68, 236, 56, 28);
    g.fill();
    g.strokeStyle = 'rgba(62,232,166,0.4)';
    g.stroke();
    g.fillStyle = '#7cf5c6';
    g.font = '600 22px ' + sans;
    g.fillText('BUG SHELTER', W - 92, 105);

    // 培养皿
    g.save();
    g.beginPath();
    g.arc(W / 2, 560, 250, 0, Math.PI * 2);
    g.clip();
    var dish = g.createRadialGradient(W / 2, 520, 30, W / 2, 560, 260);
    dish.addColorStop(0, 'rgba(62,232,166,0.16)');
    dish.addColorStop(1, 'rgba(62,232,166,0.01)');
    g.fillStyle = dish;
    g.fillRect(W / 2 - 250, 310, 500, 500);
    g.restore();
    g.beginPath();
    g.arc(W / 2, 560, 250, 0, Math.PI * 2);
    g.strokeStyle = 'rgba(62,232,166,0.28)';
    g.lineWidth = 1.5;
    g.stroke();
    g.beginPath();
    g.arc(W / 2, 560, 214, 0, Math.PI * 2);
    g.strokeStyle = 'rgba(255,255,255,0.06)';
    g.stroke();

    // 生物
    return svgToImage(creatureSVG(rec, { size: 420 })).then(function (img) {
      g.drawImage(img, W / 2 - 210, 350, 420, 420);

      // 名字
      g.textAlign = 'center';
      g.fillStyle = '#eafaf3';
      g.font = '800 56px ' + sans;
      var nameLines = wrapLines(g, rec.name, W - 170, 2);
      var nameY = 860;
      for (var i = 0; i < nameLines.length; i++) {
        g.fillText(nameLines[i], W / 2, nameY + i * 68);
      }
      var cy = nameY + (nameLines.length - 1) * 68 + 38;

      // 编号 & 物种
      g.fillStyle = 'rgba(255,255,255,0.34)';
      g.font = '400 24px ' + mono;
      g.fillText(rec.code + '  ·  ' + sp.en, W / 2, cy);

      // 稀有度胶囊
      var rarColor = R === 'SSR' ? '#ffc94d' : R === 'SR' ? '#b39cff' : R === 'R' ? '#6ee7ff' : '#9db3ac';
      g.font = '700 26px ' + mono;
      var rw = g.measureText(R).width + 60;
      var ry = cy + 22;
      g.fillStyle = 'rgba(255,255,255,0.06)';
      roundRect(g, W / 2 - rw / 2, ry, rw, 50, 25);
      g.fill();
      g.strokeStyle = rarColor;
      g.globalAlpha = 0.55;
      g.stroke();
      g.globalAlpha = 1;
      g.fillStyle = rarColor;
      g.fillText(R, W / 2, ry + 35);

      // 属性条
      var bars = [['毒性', rec.stats.tox, '#35d9a6', '#6ee7ff'], ['隐蔽', rec.stats.stealth, '#b39cff', '#6ee7ff'], ['繁殖', rec.stats.fert, '#ffc94d', '#ff8f6b']];
      var by = ry + 100, bw = 620, bx = (W - bw) / 2;
      var rowH = 58;
      for (var b = 0; b < bars.length; b++) {
        var row = bars[b];
        g.textAlign = 'left';
        g.fillStyle = 'rgba(255,255,255,0.45)';
        g.font = '500 24px ' + sans;
        g.fillText(row[0], bx, by + b * rowH);

        g.fillStyle = 'rgba(255,255,255,0.08)';
        roundRect(g, bx + 90, by + b * rowH - 16, bw - 150, 12, 6);
        g.fill();

        var lg = g.createLinearGradient(bx + 90, 0, bx + 90 + bw - 150, 0);
        lg.addColorStop(0, row[2]);
        lg.addColorStop(1, row[3]);
        g.fillStyle = lg;
        roundRect(g, bx + 90, by + b * rowH - 16, (bw - 150) * (row[1] / 100), 12, 6);
        g.fill();

        g.textAlign = 'right';
        g.fillStyle = 'rgba(255,255,255,0.7)';
        g.font = '600 22px ' + mono;
        g.fillText(String(row[1]), bx + bw, by + b * rowH);
      }

      // 描述
      g.textAlign = 'center';
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.font = '400 26px ' + sans;
      var qLines = wrapLines(g, '“' + rec.text + '”', W - 220, 2);
      for (var q = 0; q < qLines.length; q++) {
        g.fillText(qLines[q], W / 2, by + bars.length * rowH + 26 + q * 40);
      }

      // 分隔线 + 底部
      g.strokeStyle = 'rgba(255,255,255,0.08)';
      g.beginPath();
      g.moveTo(72, H - 110);
      g.lineTo(W - 72, H - 110);
      g.stroke();

      g.textAlign = 'left';
      g.fillStyle = 'rgba(255,255,255,0.55)';
      g.font = '500 24px ' + sans;
      g.fillText('Bug 收容所', 72, H - 60);

      g.textAlign = 'right';
      g.fillStyle = 'rgba(255,255,255,0.28)';
      g.font = '400 22px ' + mono;
      g.fillText(formatDate(rec.at), W - 72, H - 60);

      return c;
    });
  }

  function downloadCard(rec) {
    if (!rec) { toast('还没有可以冲印的标本', 'bad'); return; }
    toast('正在冲印战绩卡…');
    renderCard(rec).then(function (canvas) {
      canvas.toBlob(function (blob) {
        if (!blob) { toast('冲印失败，换个浏览器试试', 'bad'); return; }
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'bug-shelter-' + rec.code + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        toast('战绩卡已保存到下载目录');
      }, 'image/png');
    }).catch(function () {
      toast('冲印失败：图形引擎没响应', 'bad');
    });
  }

  function shareText(rec) {
    var link = (/^https?:/.test(location.protocol)) ? location.href.split('#')[0] : '';
    return '我在「Bug 收容所」' +
      '把今天的 bug 养成了一只「' + rec.name + '」（' + rec.rarity + ' 级 ' + SPECIES[rec.species].name + '）。\n' +
      '你的 bug 会长成什么样？' + (link ? '\n' + link : '');
  }

  function copyText(txt) {
    var done = function () { toast('分享文案已复制'); };
    var fail = function () { toast('复制失败，请手动选择文本', 'bad'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done).catch(fail);
    } else {
      try {
        var ta = document.createElement('textarea');
        ta.value = txt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done();
      } catch (e) { fail(); }
    }
  }

  /* ------------------------------------------------------------
     9. 弹窗
  ------------------------------------------------------------ */
  function openModal(rec) {
    var sp = SPECIES[rec.species];
    var when = formatDate(rec.at);
    var html =
      '<button type="button" class="modal-close" data-close aria-label="关闭">×</button>' +
      '<div class="modal-grid">' +
      '<div class="modal-visual">' + creatureSVG(rec, { size: 220 }) + '</div>' +
      '<div class="modal-info">' +
      '<h3>' + esc(rec.name) + '</h3>' +
      '<div class="sub">' + esc(rec.code) + ' · ' + esc(sp.en) + '</div>' +
      '<div class="modal-row">' +
      '<span class="rarity-badge r-' + rec.rarity + '">' + rec.rarity + '</span>' +
      '<span class="species-tag">' + esc(sp.name) + '</span>' +
      '<span class="species-tag" style="color:#9db3ac;border-color:rgba(157,179,172,.3);background:rgba(157,179,172,.08)">' +
      (rec.healed ? '已收容' : '待收容') + '</span>' +
      '</div>' +
      '<div class="stats" style="margin-top:14px">' + statRow('毒性', rec.stats.tox) + statRow('隐蔽', rec.stats.stealth) + statRow('繁殖', rec.stats.fert) + '</div>' +
      '<div class="modal-block"><h5>ORIGIN</h5><p>“' + esc(rec.text) + '”</p></div>' +
      '<div class="modal-block"><h5>FIELD NOTE</h5><p>' + esc(sp.intro) + '</p></div>' +
      '<div class="modal-block"><h5>RECORDED</h5><p class="mono" style="font-size:11px">' + esc(when) + '</p></div>' +
      '<div class="success-actions" style="margin-top:18px">' +
      '<button type="button" class="ghost-btn" data-act="card" data-id="' + rec.id + '">下载战绩卡</button>' +
      '<button type="button" class="ghost-btn" data-act="copy" data-id="' + rec.id + '">复制文案</button>' +
      (rec.healed ? '' : '<button type="button" class="ghost-btn" data-act="resume" data-id="' + rec.id + '">继续诊断</button>') +
      '</div>' +
      '</div></div>';
    els.modalBody.innerHTML = html;
    els.modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    els.modal.hidden = true;
    els.modalBody.innerHTML = '';
    document.body.style.overflow = '';
  }

  /* ------------------------------------------------------------
     10. 事件绑定
  ------------------------------------------------------------ */
  async function init() {
    els.stats = $('#stats');
    els.tags = $('#tags');
    els.chamber = $('#chamber');
    els.gallery = $('#gallery');
    els.galleryMeta = $('#galleryMeta');
    els.speciesStrip = $('#speciesStrip');
    els.text = $('#bugText');
    els.modal = $('#modal');
    els.modalBody = $('#modalBody');
    els.toastWrap = $('#toastWrap');
    els.charCount = $('#charCount');
    els.muteBtn = $('#muteBtn');

    try { await load(); } catch (e) { document.body.innerHTML = '<p style="padding:2rem;color:#fff">数据库连接失败，请检查登录状态并重新打开应用。</p>'; return; }
    Sfx.muted = state.muted;
    if (state.muted) els.muteBtn.classList.add('is-muted');

    renderStats();
    renderTags();
    renderGallery();
    renderChamber();

    // 表单
    $('#intake').addEventListener('submit', function (e) {
      e.preventDefault();
      hatch();
    });

    els.text.addEventListener('input', function () {
      els.charCount.textContent = els.text.value.length;
    });

    els.text.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        hatch();
      }
    });

    $('#luckyBtn').addEventListener('click', function () {
      Sfx.click();
      els.text.value = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
      els.charCount.textContent = els.text.value.length;
      els.text.focus();
    });

    els.tags.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-tag]');
      if (!btn) return;
      var id = btn.getAttribute('data-tag');
      var i = selectedTags.indexOf(id);
      if (i >= 0) selectedTags.splice(i, 1);
      else {
        if (selectedTags.length >= 2) selectedTags.shift();
        selectedTags.push(id);
      }
      Sfx.click();
      renderTags();
    });

    // 收容舱交互
    els.chamber.addEventListener('click', function (e) {
      var patch = e.target.closest('[data-patch]');
      if (patch) { choosePatch(patch.getAttribute('data-patch')); return; }
      var act = e.target.closest('[data-act]');
      if (act) {
        var a = act.getAttribute('data-act');
        if (a === 'card') downloadCard(state.current);
        else if (a === 'copy') { Sfx.click(); copyText(shareText(state.current)); }
        else if (a === 'again') {
          state.phase = 'idle';
          state.current = null;
          state.solved = false;
          renderChamber();
          els.text.value = '';
          els.charCount.textContent = '0';
          selectedTags = [];
          renderTags();
          els.text.focus();
        }
      }
    });

    // 图鉴
    els.gallery.addEventListener('click', function (e) {
      var card = e.target.closest('[data-rec]');
      if (!card) return;
      var id = card.getAttribute('data-rec');
      var rec = null;
      for (var i = 0; i < state.records.length; i++) if (state.records[i].id === id) rec = state.records[i];
      if (rec) { Sfx.click(); openModal(rec); }
    });

    // 弹窗
    els.modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) { closeModal(); return; }
      var act = e.target.closest('[data-act]');
      if (!act) return;
      var a = act.getAttribute('data-act');
      var id = act.getAttribute('data-id');
      var rec = null;
      for (var i = 0; i < state.records.length; i++) if (state.records[i].id === id) rec = state.records[i];
      if (!rec) return;
      if (a === 'card') downloadCard(rec);
      else if (a === 'copy') copyText(shareText(rec));
      else if (a === 'resume') {
        closeModal();
        state.current = rec;
        state.solved = !!rec.healed;
        state.wrongIds = [];
        state.phase = 'result';
        renderChamber();
        scrollChamber();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !els.modal.hidden) closeModal();
    });

    // 音效开关
    els.muteBtn.addEventListener('click', function () {
      state.muted = !state.muted;
      Sfx.muted = state.muted;
      els.muteBtn.classList.toggle('is-muted', state.muted);
      save();
      if (!state.muted) Sfx.click();
      toast(state.muted ? '音效已关闭' : '音效已开启');
    });

    // 战绩卡
    $('#shareBtn').addEventListener('click', function () {
      Sfx.click();
      var rec = null;
      for (var i = 0; i < state.records.length; i++) {
        if (state.records[i].healed) { rec = state.records[i]; break; }
      }
      if (!rec && state.records.length) rec = state.records[0];
      if (!rec) { toast('先孵化一只，才冲印得出战绩卡', 'bad'); return; }
      downloadCard(rec);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
