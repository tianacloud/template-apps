/* ===== 宝贝升级乐园 · 内容数据 data.js =====
   ⚠️ 说明：本文件中的课文、单词、题目均为「示例内容」，由本应用自行编写，
   用于功能演示，参考人教版（六三制）1-6 年级的课标结构，但不是教材原文。
   正式学习请以学校发放的正版教材为准。家长可在「设置 → 内容管理」中扩充。
   —— 数据按模块 / 年级懒加载（首次访问时才构建并缓存）。
*/
window.DATA = (function () {
  'use strict';
  var cache = {};
  function memo(key, fn) { if (!(key in cache)) cache[key] = fn(); return cache[key]; }
  function clearCache() { cache = {}; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function rnd(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function custom(kind, grade) {
    try {
      var c = window.APP && APP.state && APP.state.custom ? APP.state.custom[kind] : null;
      var arr = c ? (c[String(grade)] || c[grade]) : null;
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  /* 生成选择题：correct 为正确答案，wrongs 为干扰项数组 */
  function mk(q, correct, wrongs, tip) {
    var set = [String(correct)];
    wrongs.forEach(function (w) { if (set.indexOf(String(w)) < 0) set.push(String(w)); });
    while (set.length < 4) { set.push(String(Number(correct) + set.length * 7 + 1)); }
    var opts = shuffle(set.slice(0, 4));
    return { q: q, opts: opts, ans: opts.indexOf(String(correct)), tip: tip || '' };
  }

  /* ========== 1. 字母乐园 ========== */
  var LETTER_WORDS = window.APP_DATA.LETTER_WORDS;
  function letters() {
    return memo('letters', function () {
      return Object.keys(LETTER_WORDS).map(function (u) {
        var w = LETTER_WORDS[u];
        return { u: u, l: u.toLowerCase(), word: w[0], zh: w[1], emoji: w[2] };
      });
    });
  }

  /* ========== 2. 大文豪（示例课文） ========== */
  var READING = window.APP_DATA.READING;
  function readingGrade(g) {
    return memo('reading' + g, function () { return (READING[g] || []).concat(custom('reading', g)); });
  }

  /* ========== 3. 诗仙花园（古诗，公有领域） ========== */
  var POEMS = window.APP_DATA.POEMS;
  function poemsGrade(g) {
    return memo('poems' + g, function () { return (POEMS[g] || []).concat(custom('poems', g)); });
  }
  function allPoems() {
    return memo('poemsAll', function () {
      var a = []; for (var g = 1; g <= 6; g++) { poemsGrade(g).forEach(function (p) { a.push(Object.assign({ grade: g }, p)); }); } return a;
    });
  }

  /* ========== 4. 数字小分队（知识点 + 出题生成器） ========== */
  var MATH = {
    1: [
      {
        id: 'm1a', name: '10 以内加减法', summary: '① 凑十法：看到 9 想到 1。② 加法交换位置得数不变。③ 减法就是「去掉一些」。',
        gen: function () {
          if (Math.random() < .5) { var a = rnd(1, 9), b = rnd(1, 10 - a); return mk(a + ' + ' + b + ' = ?', a + b, [a + b + 1, Math.max(0, a + b - 1), a + b + 2], '用手指数一数：' + a + ' 再加 ' + b + ' 个。'); }
          var x = rnd(2, 10), y = rnd(1, x); return mk(x + ' − ' + y + ' = ?', x - y, [x - y + 1, x - y + 2, Math.abs(x - y - 1) + 3], '从 ' + x + ' 里拿走 ' + y + ' 个。');
        }
      },
      {
        id: 'm1b', name: '20 以内进位加法', summary: '凑十法：9+5 = 9+1+4 = 14。先把小的数拆开，凑满 10。',
        gen: function () { var a = rnd(6, 9), b = rnd(11 - a, 9); return mk(a + ' + ' + b + ' = ?', a + b, [a + b - 1, a + b + 1, a + b - 2], a + ' 先凑到 10，还要借 ' + (10 - a) + '。'); }
      },
      {
        id: 'm1c', name: '认识图形', summary: '长方形 4 条边、对边一样长；正方形 4 条边一样长；三角形 3 条边；圆没有角。',
        bank: [
          mk('正方形有几条边？', 4, [3, 5, 6], '四四方方，四条边一样长。'),
          mk('三角形有几个角？', 3, [4, 2, 5], '三角形当然是 3 个角。'),
          mk('下面哪个图形没有角？🔺 🟥 🔵 🔷', '🔵', ['🔺', '🟥', '🔷'], '圆圆的没有角。'),
          mk('长方形有几个直角？', 4, [2, 3, 1], '四个角都是直角。')
        ]
      },
      {
        id: 'm1d', name: '数的顺序与比大小', summary: '数轴上右边的数更大；比大小先看位数，位数多的更大。',
        gen: function () { var a = rnd(1, 20), b = rnd(1, 20); while (b === a) b = rnd(1, 20); return mk(a + ' 和 ' + b + ' 哪个大？', Math.max(a, b), [Math.min(a, b), a + b, Math.abs(a - b)], '数越靠后越大。'); }
      }
    ],
    2: [
      { id: 'm2a', name: '表内乘法（九九表）', summary: '乘法就是相同加数的简便运算：3×4 = 3+3+3+3。背熟九九乘法表最省力。', gen: function () { var a = rnd(2, 9), b = rnd(2, 9); return mk(a + ' × ' + b + ' = ?', a * b, [a * b + a, a * b - b, a * b + 1], a + ' 个 ' + b + ' 相加。'); } },
      { id: 'm2b', name: '100 以内加减法', summary: '列竖式：个位对个位，满十进一；不够减就向前一位借一当十。', gen: function () { if (Math.random() < .5) { var a = rnd(11, 60), b = rnd(11, 39); return mk(a + ' + ' + b + ' = ?', a + b, [a + b - 10, a + b + 10, a + b - 1], '先算整十，再算个位。'); } var x = rnd(40, 99), y = rnd(11, 39); return mk(x + ' − ' + y + ' = ?', x - y, [x - y + 10, x - y - 10, x - y + 1], '不够减就借位。'); } },
      { id: 'm2c', name: '认识时间', summary: '1 时 = 60 分；钟面上分针走 1 大格是 5 分钟。', bank: [mk('1 小时等于多少分钟？', 60, [30, 100, 24], '钟面转一圈是 60 分。'), mk('分针指向 6，是几分？', 30, [6, 12, 60], '每个大格 5 分钟，6 格 = 30 分。'), mk('一天有几小时？', 24, [12, 60, 30], '白天加黑夜共 24 小时。'), mk('9:00 过 15 分钟是几点？', '9:15', ['9:50', '10:15', '9:05'], '分针走 3 个大格。')] },
      { id: 'm2d', name: '长度单位', summary: '1 米 = 100 厘米。铅笔用「厘米」量，教室用「米」量。', bank: [mk('1 米 = 多少厘米？', 100, [10, 1000, 50], '米和厘米之间是 100 倍。'), mk('课桌高度大约是？', '70 厘米', ['70 米', '7 厘米', '7 米'], '比你的腰高一点点。'), mk('3 米 = 多少厘米？', 300, [30, 3000, 103], '3 × 100 = 300。'), mk('量一支铅笔用什么单位？', '厘米', ['米', '千米', '吨'], '短的东西用厘米。')] }
    ],
    3: [
      { id: 'm3a', name: '多位数乘一位数', summary: '从个位乘起，哪一位满几十就向前一位进几。', gen: function () { var a = rnd(12, 99), b = rnd(2, 9); return mk(a + ' × ' + b + ' = ?', a * b, [a * b + b, a * b - a, a * b + 10], '先算 ' + Math.floor(a / 10) * 10 + '×' + b + '，再算 ' + (a % 10) + '×' + b + '。'); } },
      { id: 'm3b', name: '有余数的除法', summary: '余数一定要比除数小。被除数 = 商 × 除数 + 余数。', gen: function () { var d = rnd(3, 9), q = rnd(2, 9), r = rnd(1, d - 1); var n = d * q + r; return mk(n + ' ÷ ' + d + ' = ? （填商）', q, [q + 1, q - 1, q + 2], n + ' 里面有 ' + q + ' 个 ' + d + ' 还多 ' + r + '。'); } },
      { id: 'm3c', name: '分数的初步认识', summary: '把一个物体平均分成几份，其中的一份就是几分之一。', bank: [mk('把蛋糕平均分成 4 份，一份是几分之几？', '1/4', ['1/2', '4/1', '1/3'], '分成 4 份取 1 份。'), mk('1/2 和 1/3 哪个大？', '1/2', ['1/3', '一样大', '不能比'], '分的份数越少，每份越大。'), mk('3/5 里有几个 1/5 ？', 3, [5, 2, 8], '分子是几就有几个分数单位。'), mk('把一根绳子平均分成 8 段，每段是全长的？', '1/8', ['8', '1/4', '2/8'], '平均 8 份中的 1 份。')] },
      { id: 'm3d', name: '长方形和正方形的周长', summary: '长方形周长 =（长 + 宽）× 2；正方形周长 = 边长 × 4。', gen: function () { var a = rnd(3, 15), b = rnd(2, 12); return mk('长 ' + a + ' 厘米、宽 ' + b + ' 厘米的长方形，周长是多少厘米？', (a + b) * 2, [a * b, a + b, (a + b) * 2 + 2], '(' + a + '+' + b + ')×2'); } }
    ],
    4: [
      { id: 'm4a', name: '三位数乘两位数', summary: '先用两位数的个位去乘，再用十位去乘（末位对齐十位），最后相加。', gen: function () { var a = rnd(101, 320), b = rnd(11, 29); return mk(a + ' × ' + b + ' = ?', a * b, [a * b + a, a * b - b, a * b + 100], '拆成 ' + a + '×' + (b - b % 10) + ' + ' + a + '×' + (b % 10) + '。'); } },
      { id: 'm4b', name: '除数是两位数的除法', summary: '先看被除数前两位，不够就看前三位；试商可以「四舍五入」估一估。', gen: function () { var d = rnd(11, 25), q = rnd(3, 20); return mk((d * q) + ' ÷ ' + d + ' = ?', q, [q + 1, q - 1, q + 10], '想：' + d + ' 乘几等于 ' + d * q + '。'); } },
      { id: 'm4c', name: '运算定律', summary: '加法交换律 a+b=b+a；乘法分配律 (a+b)×c = a×c+b×c。用好定律算得又快又对。', bank: [mk('25 × 4 = ?', 100, [90, 104, 20], '凑整好朋友：25×4=100。'), mk('125 × 8 = ?', 1000, [900, 1250, 800], '另一对好朋友：125×8=1000。'), mk('(20+3) × 5 用分配律等于？', '20×5+3×5', ['20×5+3', '23+5', '20+3×5'], '括号里每个都要乘。'), mk('99 × 6 最简便的算法是？', '100×6−6', ['99+6', '90×6+9', '100×6+6'], '把 99 看成 100−1。')] },
      { id: 'm4d', name: '角的度量', summary: '直角 90°，平角 180°，周角 360°；小于 90° 是锐角，大于 90° 小于 180° 是钝角。', bank: [mk('直角是多少度？', '90°', ['180°', '60°', '360°'], '像书本的角。'), mk('平角是多少度？', '180°', ['90°', '270°', '360°'], '一条直线。'), mk('120° 的角是什么角？', '钝角', ['锐角', '直角', '平角'], '比 90° 大、比 180° 小。'), mk('周角是多少度？', '360°', ['180°', '90°', '720°'], '转一整圈。')] }
    ],
    5: [
      { id: 'm5a', name: '小数乘除法', summary: '小数乘法先按整数算，再数出因数中一共几位小数，就点几位。', gen: function () { var a = rnd(11, 99) / 10, b = rnd(2, 9); var r = Math.round(a * b * 10) / 10; return mk(a + ' × ' + b + ' = ?', r, [Math.round(r * 10 + 1) / 10, Math.round(r * 100) / 10, Math.round(r * 10 - 10) / 10], '先算 ' + (a * 10) + '×' + b + '，再点一位小数。'); } },
      { id: 'm5b', name: '简易方程', summary: '等式两边同时加减乘除同一个数，等式仍成立。解方程就是让 x 单独站在一边。', gen: function () { var a = rnd(2, 9), x = rnd(2, 12), b = rnd(1, 20); return mk(a + 'x + ' + b + ' = ' + (a * x + b) + '，x = ?', x, [x + 1, x - 1, x + a], '先两边减 ' + b + '，再除以 ' + a + '。'); } },
      { id: 'm5c', name: '多边形的面积', summary: '平行四边形 = 底×高；三角形 = 底×高÷2；梯形 =（上底+下底）×高÷2。', gen: function () { var b = rnd(4, 20), h = rnd(3, 14); if (Math.random() < .5) return mk('底 ' + b + '、高 ' + h + ' 的三角形面积是？', b * h / 2, [b * h, b * h / 2 + 2, b + h], '底×高÷2'); return mk('底 ' + b + '、高 ' + h + ' 的平行四边形面积是？', b * h, [b * h / 2, b + h, b * h + h], '底×高'); } },
      { id: 'm5d', name: '因数与倍数', summary: '个位是 0、2、4、6、8 的数是 2 的倍数；各位数字之和是 3 的倍数，这个数就是 3 的倍数。', bank: [mk('下面哪个数是 3 的倍数？', 27, [26, 28, 25], '2+7=9，是 3 的倍数。'), mk('12 的因数有几个？', 6, [4, 5, 12], '1、2、3、4、6、12。'), mk('最小的质数是？', 2, [1, 3, 0], '1 既不是质数也不是合数。'), mk('既是 2 的倍数又是 5 的倍数的数，个位是？', 0, [5, 2, 4], '同时满足要以 0 结尾。')] }
    ],
    6: [
      { id: 'm6a', name: '分数乘除法', summary: '分数乘分数：分子乘分子，分母乘分母。除以一个数等于乘它的倒数。', bank: [mk('1/2 × 2/3 = ?', '1/3', ['2/5', '3/4', '1/6'], '2/6 约分成 1/3。'), mk('3/4 ÷ 1/2 = ?', '3/2', ['3/8', '1/2', '2/3'], '除以 1/2 就是乘 2。'), mk('2/5 的倒数是？', '5/2', ['2/5', '5/5', '1/5'], '分子分母交换。'), mk('1/3 + 1/6 = ?', '1/2', ['2/9', '1/9', '2/3'], '通分成 2/6+1/6。')] },
      { id: 'm6b', name: '百分数', summary: '百分数表示一个数是另一个数的百分之几。0.25 = 25%；求百分率 = 部分 ÷ 总数 × 100%。', gen: function () { var t = rnd(2, 20) * 10, p = [10, 20, 25, 50][rnd(0, 3)]; return mk(t + ' 的 ' + p + '% 是多少？', t * p / 100, [t * p / 10, t * p / 1000, t * p / 100 + 5], '先把 ' + p + '% 写成 ' + (p / 100) + '。'); } },
      { id: 'm6c', name: '圆的周长与面积', summary: '周长 C = πd = 2πr；面积 S = πr²。π 取 3.14。', gen: function () { var r = rnd(1, 10); if (Math.random() < .5) return mk('半径 ' + r + ' 厘米的圆，周长是多少厘米？（π取3.14）', Math.round(2 * 3.14 * r * 100) / 100, [Math.round(3.14 * r * 100) / 100, Math.round(3.14 * r * r * 100) / 100, 2 * r], 'C = 2πr'); return mk('半径 ' + r + ' 厘米的圆，面积是多少平方厘米？（π取3.14）', Math.round(3.14 * r * r * 100) / 100, [Math.round(2 * 3.14 * r * 100) / 100, Math.round(3.14 * r * 100) / 100, r * r], 'S = πr²'); } },
      { id: 'm6d', name: '比和比例', summary: '比表示两个数相除的关系；比例是两个比相等的式子，内项积 = 外项积。', bank: [mk('12 : 18 化成最简整数比是？', '2:3', ['3:2', '6:9', '1:2'], '同时除以 6。'), mk('如果 2:3 = x:9，x = ?', 6, [4, 5, 12], '交叉相乘：3x=18。'), mk('把 30 按 2:3 分成两份，较大的一份是？', 18, [12, 15, 20], '共 5 份，每份 6。'), mk('一个比的前项是 8，比值是 2，后项是？', 4, [16, 6, 10], '前项 ÷ 后项 = 比值。')] }
    ]
  };
  function mathGrade(g) {
    return memo('math' + g, function () {
      var base = (MATH[g] || []).slice();
      custom('math', g).forEach(function (kp) { if (kp && kp.name) base.push(kp); });
      return base;
    });
  }
  function mathQuestion(kp) {
    if (kp.gen) return kp.gen();
    var b = kp.bank || [];
    if (!b.length) return mk('1 + 1 = ?', 2, [1, 3, 11], '');
    var q = b[rnd(0, b.length - 1)];
    var opts = shuffle(q.opts);
    return { q: q.q, opts: opts, ans: opts.indexOf(q.opts[q.ans]), tip: q.tip };
  }

  /* ========== 5. 小小外交官（英语单元） ========== */
  var ENGLISH = window.APP_DATA.ENGLISH;
  function englishGrade(g) {
    return memo('english' + g, function () { return (ENGLISH[g] || []).concat(custom('english', g)); });
  }

  /* ========== 6. 逻辑挑战 ========== */
  var LOGIC_STATIC = window.APP_DATA.LOGIC_STATIC;
  function logicSet(level) {
    var arr = (LOGIC_STATIC[level] || LOGIC_STATIC[1]).slice();
    // 数列找规律（程序化生成，题目无限）
    var step = level * rnd(2, 3), start = rnd(1, 6) * level;
    var seq = [start, start + step, start + step * 2, start + step * 3];
    arr.push({ q: '找规律填数：' + seq.join('，') + '，?', opts: shuffle([String(start + step * 4), String(start + step * 5), String(start + step * 3), String(start + step * 4 + 1)]), ans: -1, correctText: String(start + step * 4), tip: '每次增加 ' + step + '。' });
    var a = rnd(2, 5 + level), r = rnd(2, 3);
    var seq2 = [a, a * r, a * r * r];
    arr.push({ q: '找规律填数：' + seq2.join('，') + '，?', opts: shuffle([String(a * r * r * r), String(a * r * r + r), String(a * r * r * r + 1), String(a + r * 3)]), ans: -1, correctText: String(a * r * r * r), tip: '每次乘以 ' + r + '。' });
    var n1 = rnd(3, 9 + level * 3), n2 = rnd(3, 9 + level * 3), n3 = rnd(3, 9 + level * 3);
    var mx = Math.max(n1, n2, n3);
    arr.push({ q: '排序题：' + n1 + '、' + n2 + '、' + n3 + ' 中最大的是？', opts: shuffle([String(mx), String(Math.min(n1, n2, n3)), String(n1 + n2), String(Math.abs(n1 - n2))]), ans: -1, correctText: String(mx), tip: '比一比十位再比个位。' });
    // 归一化：把 correctText 转成 ans 下标
    arr = arr.map(function (q) {
      if (q.ans >= 0) { var opts = shuffle(q.opts); return { q: q.q, opts: opts, ans: opts.indexOf(q.opts[q.ans]), tip: q.tip }; }
      return { q: q.q, opts: q.opts, ans: q.opts.indexOf(q.correctText), tip: q.tip };
    });
    return shuffle(arr);
  }

  /* ========== 8. 宠物养成：品种 & 商店 ========== */
  var BREEDS = window.APP_DATA.BREEDS;
  var SHOP = window.APP_DATA.SHOP;
  var PET_ACTIONS = window.APP_DATA.PET_ACTIONS;
  var STAGES = window.APP_DATA.STAGES;

  /* ========== 8.1 宠物场景 ========== */
  var PET_SCENES = window.APP_DATA.PET_SCENES;

  /* ========== 8.2 把戏（宠物学校产出） ========== */
  var PET_TRICKS = window.APP_DATA.PET_TRICKS;

  /* ========== 8.3 随机事件（30 种） ==========
     cat: sick 病 / hurt 伤 / need 需 / good 好 / choice 选
     cond: 触发场景（any 任意；yard/park/beach/school 限定）
     choices[].eff: { hunger,clean,mood,health,exp, cured, injury, sick, beach, trick, item, album }
       injury: 'leg'|'paw'|'head'|null  → 显示绷带
       sick: true/false                  → 病容覆盖层
       quiz: true                        → 选择后做 1 道迷你学习题，赢才生效 winEff
  */
  var PET_EVENTS = window.APP_DATA.PET_EVENTS;

  /* ========== 内容管理模板 ========== */
  function templateJSON() {
    return JSON.stringify({
      reading: {
        "1": [{
          id: "my_r1", title: "我自己加的课文",
          lines: [{ t: "这里是正文第一句。", p: "zhè lǐ shì zhèng wén dì yī jù" }],
          chars: [{ c: "正", p: "zhèng", w: "正文" }],
          words: ["正文"], pattern: "……是……。",
          sentences: [["这", "是", "一句", "话"]]
        }]
      },
      poems: { "2": [{ id: "my_p1", title: "诗名", author: "作者", lines: [{ t: "第一句诗。", p: "dì yī jù shī" }], note: "简介" }] },
      english: { "3": [{ id: "my_e1", name: "Unit X 主题", words: [{ en: "word", zh: "词义", e: "🐣" }], sentences: [{ en: "Hello.", zh: "你好。" }] }] },
      math: { "4": [{ id: "my_m1", name: "我的知识点", summary: "重点总结写这里。", bank: [{ q: "1+1=?", opts: ["2", "1", "3", "11"], ans: 0, tip: "提示语" }] }] }
    }, null, 2);
  }

  return {
    clearCache: clearCache,
    letters: letters,
    readingGrade: readingGrade,
    poemsGrade: poemsGrade, allPoems: allPoems,
    mathGrade: mathGrade, mathQuestion: mathQuestion,
    englishGrade: englishGrade,
    logicSet: logicSet,
    breeds: function () { return BREEDS; },
    shop: function () { return SHOP; },
    petActions: function () { return PET_ACTIONS; },
    stages: function () { return STAGES; },
    petScenes: function () { return PET_SCENES; },
    petTricks: function () { return PET_TRICKS; },
    petEvents: function () { return PET_EVENTS; },
    templateJSON: templateJSON,
    mk: mk, shuffle: shuffle, rnd: rnd
  };
})();
