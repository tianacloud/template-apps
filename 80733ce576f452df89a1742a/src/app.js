import { createTianaFetch } from '@tianacloud/serverless';
document.getElementById("app").innerHTML = "\n<div class=\"wrap\">\n\n  <div class=\"topbar\">\n    <div class=\"topbar-in\">\n      <div class=\"brand\">\n        <div class=\"logo\">🏟️</div>\n        <div class=\"brand-txt\">\n          <b>算法竞技场</b>\n          <span>Sort Derby</span>\n        </div>\n      </div>\n      <nav class=\"tabs\" role=\"tablist\">\n        <button class=\"tab on\" data-page=\"arena\" role=\"tab\" aria-selected=\"true\">竞技场</button>\n        <button class=\"tab\" data-page=\"codex\" role=\"tab\" aria-selected=\"false\">算法图鉴</button>\n        <button class=\"tab\" data-page=\"stats\" role=\"tab\" aria-selected=\"false\">我的战绩</button>\n      </nav>\n      <div class=\"rankchip\" id=\"rankChip\">\n        <span class=\"e\">👀</span><b>见习观众</b>\n      </div>\n    </div>\n  </div>\n\n  <main>\n\n    <!-- ═══════ 竞技场 ═══════ -->\n    <section class=\"page on\" id=\"page-arena\">\n      <div class=\"hero\">\n        <h1>同一份数据，<span class=\"hl\">六种活法</span>。<br>冠军从不写死。</h1>\n        <p>六个排序算法在同一条起跑线上，用完全相同的数组开跑。计分不是秒表，而是<b>操作数</b>——比较次数加上写入次数。所以成绩和你的电脑快慢无关，换台机器跑一百遍，排名一模一样。</p>\n        <div class=\"how\">\n          <span><i>01</i>挑一组数据剧本</span>\n          <span><i>02</i>赛前押注你心中的冠军</span>\n          <span><i>03</i>开跑，看复杂度当场兑现</span>\n        </div>\n      </div>\n\n      <div class=\"stage\">\n        <div class=\"ctl\">\n          <span class=\"ctl-lb\">剧本</span>\n          <div class=\"seg\" id=\"scenarioSeg\"></div>\n          <span class=\"scene-hint\" id=\"sceneHint\"></span>\n        </div>\n        <div class=\"ctl\">\n          <span class=\"ctl-lb\">规模</span>\n          <div class=\"seg n-seg\" id=\"sizeSeg\"></div>\n          <span class=\"ctl-lb\" style=\"width:auto;margin-left:14px\">速度</span>\n          <div class=\"seg n-seg\" id=\"speedSeg\"></div>\n          <span class=\"scene-hint\" id=\"seedHint\"></span>\n        </div>\n      </div>\n\n      <div class=\"arena\">\n        <div class=\"arena-head\" id=\"arenaHead\">\n          <span class=\"live\"><span class=\"dot-live\"></span><span id=\"arenaStatus\">待发车</span></span>\n          <span id=\"arenaMeta\">—</span>\n        </div>\n        <div class=\"lanes\" id=\"lanes\"></div>\n      </div>\n\n      <div class=\"bet\">\n        <div class=\"bet-top\">\n          <h3>🎯 赛前押注</h3>\n          <span class=\"tip\" id=\"betTip\">押中冠军 +10 分，连击还有额外加成</span>\n        </div>\n        <div class=\"chips\" id=\"chips\"></div>\n        <div class=\"bet-act\">\n          <button class=\"btn btn-primary\" id=\"startBtn\">开赛</button>\n          <button class=\"btn btn-ghost\" id=\"luckyBtn\">🎰 随便押一个</button>\n          <button class=\"btn btn-ghost\" id=\"skipBtn\">跳过竞猜，直接看</button>\n        </div>\n      </div>\n\n      <div class=\"cast\">\n        <div class=\"cast-h\"><span class=\"mic\">📣</span><span>现场解说</span></div>\n        <div class=\"cast-list\" id=\"castList\">\n          <div class=\"cast-empty\">选好剧本、押上你的冠军，然后按「开赛」。解说员已经在热身了。</div>\n        </div>\n      </div>\n\n      <div class=\"result\" id=\"result\"></div>\n    </section>\n\n    <!-- ═══════ 图鉴 ═══════ -->\n    <section class=\"page\" id=\"page-codex\">\n      <div class=\"hero\">\n        <h1>六位选手的<span class=\"hl\">档案</span></h1>\n        <p>每一个算法都有自己的舒适区。看完这份档案，你就知道下一局该押谁——但请记住，数据剧本永远比人设更诚实。</p>\n      </div>\n      <div class=\"codex-grid\" id=\"codexGrid\"></div>\n    </section>\n\n    <!-- ═══════ 战绩 ═══════ -->\n    <section class=\"page\" id=\"page-stats\">\n      <div class=\"hero\">\n        <h1>我的<span class=\"hl\">战绩</span></h1>\n        <p>战绩保存在本应用的云端数据库中。</p>\n      </div>\n      <div class=\"rankcard\" id=\"rankCard\"></div>\n      <div class=\"statgrid\" id=\"statGrid\"></div>\n      <div class=\"sec-h\">📋 最近 12 局 <span class=\"cnt\" id=\"histCnt\"></span><span class=\"r\"><button class=\"btn btn-ghost btn-sm\" id=\"resetBtn\">清空战绩</button></span></div>\n      <div class=\"hist\" id=\"histList\"></div>\n    </section>\n\n  </main>\n\n  <footer>\n    <b>算法竞技场 · Sort Derby</b> — 通过操作数比较排序算法。<br>\n    所有成绩由「比较次数 + 写入次数」唯一确定，与设备性能无关，可复现。\n  </footer>\n</div>\n\n<div class=\"count\" id=\"count\"><div class=\"n\" id=\"countN\">3</div></div>\n<div class=\"toast\" id=\"toast\"></div>\n\n";

/* ============================================================
 * 算法竞技场 · SORT DERBY — 引擎层（纯逻辑，无 DOM）
 * 核心约定：操作数 = 比较次数 + 主数组写入次数
 * 每个算法在完全相同的数据上运行，记录完整操作轨迹 (trace)，
 * 比赛结果由操作数唯一确定，与机器性能无关，可复现。
 * ============================================================ */
(function (global) {
  'use strict';

  /* ---------- 确定性随机数（同一 seed 永远同一副牌） ---------- */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- 操作轨迹记录器 ----------
   * ev[i*3+0] = 类型：0 比较 / 1 写入
   * ev[i*3+1], ev[i*3+2] = 参数
   * 用 Int32Array 分块存储，避免大数组 push 造成的内存碎片
   */
  function Tracer(cap) {
    this.buf = new Int32Array(Math.max(1024, cap | 0));
    this.len = 0;
    this.cmp = 0;
    this.wr = 0;
  }
  Tracer.prototype._grow = function () {
    const next = new Int32Array(this.buf.length * 2);
    next.set(this.buf);
    this.buf = next;
  };
  Tracer.prototype._put = function (t, a, b) {
    if (this.len + 3 > this.buf.length) this._grow();
    const p = this.len;
    this.buf[p] = t;
    this.buf[p + 1] = a;
    this.buf[p + 2] = b;
    this.len = p + 3;
  };
  /* 比较：高亮下标 i 与 j */
  Tracer.prototype.c = function (i, j) {
    this.cmp++;
    this._put(0, i, j);
  };
  /* 写入：主数组 a[i] = v，并高亮 i */
  Tracer.prototype.w = function (i, v) {
    this.wr++;
    this._put(1, i, v);
  };
  Object.defineProperty(Tracer.prototype, 'ops', {
    get: function () { return this.len / 3; }
  });

  /* ---------- 六个选手 ---------- */

  // ① 冒泡排序：带提前退出，所以「已排好」时是怪物
  function bubble(a, tr) {
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - 1 - i; j++) {
        tr.c(j, j + 1);
        if (a[j] > a[j + 1]) {
          const t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
          tr.w(j, a[j]); tr.w(j + 1, a[j + 1]);
          swapped = true;
        }
      }
      if (!swapped) break;
    }
  }

  // ② 选择排序：比较数恒定，和输入无关 —— 永远的陪跑
  function selection(a, tr) {
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      for (let j = i + 1; j < n; j++) {
        tr.c(m, j);
        if (a[j] < a[m]) m = j;
      }
      if (m !== i) {
        const t = a[i]; a[i] = a[m]; a[m] = t;
        tr.w(i, a[i]); tr.w(m, a[m]);
      }
    }
  }

  // ③ 插入排序：数据越有序越猛，「近乎有序」剧本的主角
  function insertion(a, tr) {
    const n = a.length;
    for (let i = 1; i < n; i++) {
      const key = a[i];
      let j = i - 1;
      while (j >= 0) {
        tr.c(j, j + 1);
        if (a[j] > key) { a[j + 1] = a[j]; tr.w(j + 1, a[j]); j--; }
        else break;
      }
      if (j + 1 !== i) { a[j + 1] = key; tr.w(j + 1, key); }
    }
  }

  // ④ 归并排序：稳定，O(n log n) 的教科书答案
  function merge(a, tr) {
    const n = a.length;
    const tmp = new Array(n);
    for (let w = 1; w < n; w *= 2) {
      for (let lo = 0; lo < n; lo += 2 * w) {
        const mid = Math.min(lo + w, n), hi = Math.min(lo + 2 * w, n);
        if (mid >= hi) continue;
        let i = lo, j = mid, k = lo;
        while (i < mid && j < hi) {
          tr.c(i, j);
          if (a[i] <= a[j]) tmp[k++] = a[i++];
          else tmp[k++] = a[j++];
        }
        while (i < mid) tmp[k++] = a[i++];
        while (j < hi) tmp[k++] = a[j++];
        for (let x = lo; x < hi; x++) { a[x] = tmp[x]; tr.w(x, tmp[x]); }
      }
    }
  }

  // ④ 三路快排：大量重复元素时的屠榜者
  function insRange(a, lo, hi, tr) {
    for (let i = lo + 1; i <= hi; i++) {
      const key = a[i];
      let j = i - 1;
      while (j >= lo) {
        tr.c(j, j + 1);
        if (a[j] > key) { a[j + 1] = a[j]; tr.w(j + 1, a[j]); j--; }
        else break;
      }
      if (j + 1 !== i) { a[j + 1] = key; tr.w(j + 1, key); }
    }
  }
  function quick3(a, tr) {
    const stack = [0, a.length - 1];
    while (stack.length) {
      const hi = stack.pop(), lo = stack.pop();
      if (lo >= hi) continue;
      if (hi - lo < 12) { insRange(a, lo, hi, tr); continue; }
      const p = a[lo + ((hi - lo + 1) >> 1)];
      let lt = lo, gt = hi, i = lo;
      while (i <= gt) {
        tr.c(i, lt);
        if (a[i] < p) {
          const t = a[lt]; a[lt] = a[i]; a[i] = t;
          tr.w(lt, a[lt]); tr.w(i, a[i]);
          lt++; i++;
        } else if (a[i] > p) {
          const t = a[gt]; a[gt] = a[i]; a[i] = t;
          tr.w(gt, a[gt]); tr.w(i, a[i]);
          gt--;
        } else i++;
      }
      if (lt - 1 > lo) stack.push(lo, lt - 1);
      if (hi > gt + 1) stack.push(gt + 1, hi);
    }
  }

  // ⑥ 堆排序：O(n log n) 但常数大，永远「理论很好，跑得一般」
  function heap(a, tr) {
    const n = a.length;
    function down(i0, nn) {
      let i = i0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < nn) { tr.c(l, m); if (a[l] > a[m]) m = l; }
        if (r < nn) { tr.c(r, m); if (a[r] > a[m]) m = r; }
        if (m === i) return;
        const t = a[i]; a[i] = a[m]; a[m] = t;
        tr.w(i, a[i]); tr.w(m, a[m]);
        i = m;
      }
    }
    for (let i = (n >> 1) - 1; i >= 0; i--) down(i, n);
    for (let e = n - 1; e > 0; e--) {
      const t = a[0]; a[0] = a[e]; a[e] = t;
      tr.w(0, a[0]); tr.w(e, a[e]);
      down(0, e);
    }
  }

  /* ---------- 选手名册 ---------- */
  const ALGOS = [
    {
      id: 'bubble', name: '冒泡排序', en: 'Bubble Sort', color: '#FF6B6B', short: '冒泡',
      emoji: '🫧', fn: bubble,
      tagline: '最慢的那位，但只要数组已经排好，它就是神。',
      best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: '稳定',
      pros: ['实现最简单', '已排好时一趟就收工', '原地排序不吃内存'],
      cons: ['平均要挪 n² 次', '数据一大直接崩盘', '实战基本没人用'],
      winsWhen: '数据本来就排好了。带提前退出的冒泡只需一趟 n-1 次比较就能交卷。'
    },
    {
      id: 'selection', name: '选择排序', en: 'Selection Sort', color: '#FFB020', short: '选择',
      emoji: '🎯', fn: selection,
      tagline: '无论数据长什么样，它都雷打不动地比较 n²/2 次。',
      best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: '不稳定',
      pros: ['交换次数最少（最多 n-1 次）', '行为完全可预测', '写操作代价高时反而划算'],
      cons: ['比较次数恒定，无法提前收工', '对有序数据毫无感知', '几乎拿不到冠军'],
      winsWhen: '只有在写入代价远高于比较、且规模极小时才有理论优势；本场基本是陪跑。'
    },
    {
      id: 'insertion', name: '插入排序', en: 'Insertion Sort', color: '#4ADE80', short: '插入',
      emoji: '🟩', fn: insertion,
      tagline: '数据越接近有序，它越像开了挂。',
      best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: '稳定',
      pros: ['近乎有序时接近线性', '稳定排序', '小数组上比快排还快'],
      cons: ['逆序数据下退化成 n²', '大规模数据力不从心', '移动次数偏多'],
      winsWhen: '「近乎有序」剧本的主场。少量元素错位时，它只需把每个错位元素往回挪几步。'
    },
    {
      id: 'merge', name: '归并排序', en: 'Merge Sort', color: '#38BDF8', short: '归并',
      emoji: '🧬', fn: merge,
      tagline: '稳定的 O(n log n)，随机数据上的常规冠军。',
      best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: '稳定',
      pros: ['最坏情况依然 n log n', '稳定排序', '可外排序、可并行'],
      cons: ['需要 O(n) 额外空间', '小数组上常数偏高', '缓存局部性一般'],
      winsWhen: '随机 / 逆序这类「没规律」的剧本。它不挑数据，稳稳压过所有 O(n²)。'
    },
    {
      id: 'quick3', name: '三路快排', en: '3-Way Quicksort', color: '#A78BFA', short: '快排',
      emoji: '⚡', fn: quick3,
      tagline: '把相等的元素一次性甩到中间，重复数据越多它越开心。',
      best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: '不稳定',
      pros: ['大量重复元素时接近线性', '原地排序，缓存友好', '平均常数最小'],
      cons: ['不稳定', '最坏会退化到 n²', '递归栈有额外开销'],
      winsWhen: '「大量重复」和「锯齿」剧本。三路划分把等于 pivot 的一整段一次跳过，重复值越多优势越大。'
    },
    {
      id: 'heap', name: '堆排序', en: 'Heap Sort', color: '#F472B6', short: '堆排',
      emoji: '🏔️', fn: heap,
      tagline: '理论 O(n log n)，实战永远差一口气。',
      best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: '不稳定',
      pros: ['原地且最坏 n log n', '内存占用 O(1)', '适合做实时系统的兜底'],
      prosNote: '',
      cons: ['缓存不友好，跳着访问', '常数因子大', '不稳定'],
      winsWhen: '很少夺冠。它的价值是「原地 + 最坏 n log n」这个保险属性，而不是速度。'
    }
  ];

  /* ---------- 数据剧本 ---------- */
  const SCENARIOS = [
    { id: 'random', name: '随机乱序', emoji: '🎰', desc: '完全随机，没有规律可循。' },
    { id: 'nearly', name: '近乎有序', emoji: '📈', desc: '已经基本排好，只有少数元素错位。' },
    { id: 'sorted', name: '已经排好', emoji: '✅', desc: '本来就是升序，一个都不需要动。' },
    { id: 'reversed', name: '完全逆序', emoji: '🔄', desc: '从头到尾完全倒过来，最坏情况。' },
    { id: 'dupes', name: '大量重复', emoji: '♻️', desc: '只有少数几种取值，大量元素彼此相等。' },
    { id: 'sawtooth', name: '锯齿波', emoji: '🌊', desc: '循环上升的锯齿，局部有序但整体乱。' }
  ];

  function makeData(kind, n, seed, custom) {
    const rnd = mulberry32(seed);
    if (kind === 'custom' && custom && custom.length) {
      return custom.slice();
    }
    const out = new Array(n);
    switch (kind) {
      case 'random':
        for (let i = 0; i < n; i++) out[i] = 1 + Math.floor(rnd() * 100);
        return out;
      case 'sorted':
        for (let i = 0; i < n; i++) out[i] = i + 1;
        return out;
      case 'nearly': {
        for (let i = 0; i < n; i++) out[i] = i + 1;
        // 抽出少量元素，插到随机位置 —— 经典的「几乎有序」
        const k = Math.max(2, Math.round(n * 0.05));
        const arr = out.slice();
        for (let t = 0; t < k; t++) {
          const from = Math.floor(rnd() * arr.length);
          const v = arr.splice(from, 1)[0];
          const to = Math.floor(rnd() * arr.length);
          arr.splice(to, 0, v);
        }
        return arr;
      }
      case 'reversed':
        for (let i = 0; i < n; i++) out[i] = n - i;
        return out;
      case 'dupes': {
        const levels = [12, 37, 62, 87];
        for (let i = 0; i < n; i++) out[i] = levels[Math.floor(rnd() * levels.length)];
        return out;
      }
      case 'sawtooth': {
        const p = Math.max(4, Math.round(n / 8));
        for (let i = 0; i < n; i++) out[i] = ((i % p) + 1) * Math.round(100 / p);
        return out;
      }
      default:
        for (let i = 0; i < n; i++) out[i] = 1 + Math.floor(rnd() * 100);
        return out;
    }
  }

  /* ---------- 一场比赛 = 六份轨迹 ---------- */
  function buildRace(kind, n, seed, custom) {
    const data = makeData(kind, n, seed, custom);
    const runners = ALGOS.map(function (algo) {
      const tr = new Tracer(n * 160);
      const arr = data.slice();
      algo.fn(arr, tr);
      // 自检：必须真的排好序
      let sorted = true;
      for (let i = 1; i < arr.length; i++) {
        if (arr[i - 1] > arr[i]) { sorted = false; break; }
      }
      return {
        id: algo.id,
        name: algo.name,
        short: algo.short,
        color: algo.color,
        emoji: algo.emoji,
        trace: tr,
        arr: arr,
        sorted: sorted,
        cmp: tr.cmp,
        wr: tr.wr,
        ops: tr.ops
      };
    });

    const totals = runners.map(function (r) { return r.ops; });
    const minOps = Math.min.apply(null, totals);
    const maxOps = Math.max.apply(null, totals);

    // 排名：操作数升序；同分则比较次数少者优先；再同则写入少者优先
    const ranked = runners.slice().sort(function (a, b) {
      if (a.ops !== b.ops) return a.ops - b.ops;
      if (a.cmp !== b.cmp) return a.cmp - b.cmp;
      return a.wr - b.wr;
    });
    ranked.forEach(function (r, i) { r.rank = i + 1; });

    // 并列冠军：操作数完全相同的第一名（例如「已经排好」剧本里冒泡与插入都是 n-1）
    const champions = ranked.filter(function (r) { return r.ops === minOps; });
    // 竞技名次：同操作数共享名次
    let prevOps = -1, prevRank = 0;
    ranked.forEach(function (r, i) {
      r.rank = (r.ops === prevOps) ? prevRank : i + 1;
      prevOps = r.ops; prevRank = r.rank;
    });

    return {
      kind: kind,
      n: data.length,
      seed: seed,
      data: data,
      runners: runners,
      ranked: ranked,
      winner: ranked[0],
      champions: champions,
      isTie: champions.length > 1,
      minOps: minOps,
      maxOps: maxOps,
      spread: maxOps / Math.max(1, minOps)
    };
  }

  /* ---------- 回放：把轨迹应用到一个工作数组 ---------- */
  function makePlayer(runner, data) {
    return {
      runner: runner,
      arr: data.slice(),
      pos: 0,          // 已消费的事件下标（元素个数，不是字节）
      hot: -1,         // 最近高亮的下标
      hotPair: null,   // 比较的两个下标
      finished: false,
      finishMs: 0,
      opDone: 0
    };
  }

  /* 推进到目标操作数；返回本次新触发的视觉事件 */
  function advance(player, targetOps) {
    const tr = player.runner.trace;
    const buf = tr.buf;
    const total = tr.ops;
    const arr = player.arr;
    let pos = player.pos;
    const events = [];
    while (pos < total && player.opDone < targetOps) {
      const p = pos * 3;
      const type = buf[p];
      if (type === 0) {
        const i = buf[p + 1], j = buf[p + 2];
        events.push(0, i, j);
        player.hotPair = [i, j];
      } else {
        const i = buf[p + 1], v = buf[p + 2];
        arr[i] = v;
        events.push(1, i, v);
        player.hot = i;
        player.hotPair = null;
      }
      pos++;
      player.opDone++;
    }
    player.pos = pos;
    if (player.opDone >= total) player.finished = true;
    return events;
  }

  /* ---------- 名次 / 段位 ---------- */
  const RANKS = [
    { min: 0, name: '见习观众', emoji: '👀', desc: '你刚坐下，手里还拿着爆米花。' },
    { min: 3, name: '排序学徒', emoji: '🌱', desc: '开始意识到「快」不是靠运气。' },
    { min: 6, name: '调参工', emoji: '🔧', desc: '你开始看数据长什么样再下注了。' },
    { min: 10, name: '高级工程师', emoji: '🧠', desc: '近乎有序上插入，重复数据上三路。' },
    { min: 16, name: '架构师', emoji: '🏛️', desc: '你能提前说出冠军和亚军。' },
    { min: 24, name: '复杂度之神', emoji: '👑', desc: 'O(n log n) 已经刻进你的肌肉记忆。' }
  ];

  function rankFor(games, wins) {
    let idx = 0;
    for (let i = 0; i < RANKS.length; i++) {
      if (games >= RANKS[i].min) idx = i;
    }
    // 胜率过低时压一级，避免纯靠场次刷段位
    if (idx > 0 && games >= 6) {
      const rate = wins / games;
      if (rate < 0.25) idx = Math.max(1, idx - 2);
      else if (rate < 0.4) idx = Math.max(1, idx - 1);
    }
    return { index: idx, rank: RANKS[idx], next: RANKS[idx + 1] || null };
  }

  const api = {
    mulberry32: mulberry32,
    Tracer: Tracer,
    ALGOS: ALGOS,
    SCENARIOS: SCENARIOS,
    makeData: makeData,
    buildRace: buildRace,
    makePlayer: makePlayer,
    advance: advance,
    RANKS: RANKS,
    rankFor: rankFor
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.SortDerby = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

/* ============================================================
 * 算法竞技场 · SORT DERBY — 应用层
 * 依赖 engine.js 暴露的 window.SortDerby
 * ============================================================ */
(function () {
  'use strict';

  var D = window.SortDerby;
  var ALGOS = D.ALGOS;
  var SCENARIOS = D.SCENARIOS;

  /* ---------------- 状态 ---------------- */
  var S = {
    scenario: 'random',
    size: 128,
    speed: 1,          // 1 / 2 / 4
    seed: 1024,
    bet: null,         // 押注的算法 id
    phase: 'idle',     // idle | countdown | racing | done
    race: null,
    players: null,
    raf: 0,
    t0: 0,
    lastFrame: 0,
    events: [],
    announced: {},
    castCount: 0,
    revealed: false
  };

  var SPEEDS = [
    { v: 1, label: '1×' },
    { v: 2, label: '2×' },
    { v: 4, label: '4×' },
    { v: 9, label: '瞬完' }
  ];

  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  var fmt = function (n) { return n.toLocaleString('en-US'); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ---------------- 持久化 ---------------- */
  var stats = { games: 0, wins: 0, streak: 0, bestStreak: 0, score: 0,
    algoWins: ALGOS.map(function () { return 0; }), history: [] };
  var dbReady = false;
  var saving = false;
  var sqlFetch, sqlOrigin;
  async function execute(sql, args) {
    var response = await sqlFetch(sqlOrigin + '/v3/pipeline', {
      method: 'POST', headers: {'content-type': 'application/json'},
      body: JSON.stringify({requests:[{type:'execute',stmt:{sql:sql,args:args || [],want_rows:true}},{type:'close'}]})
    });
    if (!response.ok) throw new Error('数据库请求结果未知');
    var body = await response.json(), result = body.results && body.results[0];
    if (!result || result.type !== 'ok' || result.response.type !== 'execute') throw new Error('数据库操作失败');
    return result.response.result;
  }
  async function initStats() {
    try {
      if (!window.tiana || typeof window.tiana.connection !== 'function' || !window.tiana.auth || typeof window.tiana.auth.getAccessToken !== 'function') throw new Error('数据库连接未就绪');
      var c = await window.tiana.connection();
      if (c.sql_api !== 'hrana-v3') throw new Error('不支持当前数据库协议');
      sqlOrigin = c.origin;
      sqlFetch = createTianaFetch({origin:c.origin, auth:window.tiana.auth, requestBodyMode:'buffered'});
      var result = await execute('SELECT payload FROM derby_stats WHERE id = 1');
      if (result.rows && result.rows.length) {
        var value = JSON.parse(result.rows[0][0].value);
        if (!value || !Array.isArray(value.history) || !Array.isArray(value.algoWins)) throw new Error('战绩数据格式无效');
        stats = value;
        while (stats.algoWins.length < ALGOS.length) stats.algoWins.push(0);
      }
      dbReady = true; refreshRankChip();
      if (document.querySelector('#page-stats.on')) renderStats();
    } catch (error) { toast('战绩读取失败，请刷新页面重试'); }
  }
  async function saveStats(st) {
    saving = true;
    try {
      await execute('INSERT INTO derby_stats (id,payload) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload', [{type:'text',value:JSON.stringify(st)}]);
    } catch (error) {
      dbReady = false;
      toast('战绩保存结果未知，请刷新核对后继续');
    } finally { saving = false; }
  }

  // 兼容旧数据长度
  while (stats.algoWins.length < ALGOS.length) stats.algoWins.push(0);

  /* ---------------- 渲染：控制条 ---------------- */
  function renderScenarioSeg() {
    var box = $('scenarioSeg');
    box.innerHTML = '';
    SCENARIOS.forEach(function (sc) {
      var b = el('button', S.scenario === sc.id ? 'on' : '',
        sc.emoji + ' ' + sc.name);
      b.type = 'button';
      b.disabled = S.phase === 'racing' || S.phase === 'countdown';
      b.onclick = function () {
        if (S.phase === 'racing' || S.phase === 'countdown') return;
        S.scenario = sc.id;
        S.seed = (S.seed * 7 + 13) % 100000;
        resetRace();
        renderScenarioSeg();
      };
      box.appendChild(b);
    });
    var sc = SCENARIOS.filter(function (x) { return x.id === S.scenario; })[0];
    $('sceneHint').innerHTML = '<b>' + sc.emoji + ' ' + esc(sc.desc) + '</b>';
  }

  function renderSizeSeg() {
    var box = $('sizeSeg');
    box.innerHTML = '';
    [32, 64, 128, 256].forEach(function (n) {
      var b = el('button', S.size === n ? 'on' : '', String(n));
      b.type = 'button';
      b.disabled = S.phase === 'racing' || S.phase === 'countdown';
      b.onclick = function () {
        if (S.phase === 'racing' || S.phase === 'countdown') return;
        S.size = n;
        resetRace();
        renderSizeSeg();
      };
      box.appendChild(b);
    });
  }

  function renderSpeedSeg() {
    var box = $('speedSeg');
    box.innerHTML = '';
    SPEEDS.forEach(function (sp) {
      var b = el('button', S.speed === sp.v ? 'on' : '', sp.label);
      b.type = 'button';
      b.onclick = function () {
        S.speed = sp.v;
        renderSpeedSeg();
      };
      box.appendChild(b);
    });
  }

  /* ---------------- 渲染：赛道 ---------------- */
  var lanesEl = $('lanes');
  var laneRefs = {};

  function renderLanes() {
    lanesEl.innerHTML = '';
    laneRefs = {};
    ALGOS.forEach(function (a) {
      var lane = el('div', 'lane');
      lane.style.setProperty('--ac', a.color);
      lane.innerHTML =
        '<div class="lane-id">' +
          '<span class="sw" style="background:' + a.color + ';color:' + a.color + '"></span>' +
          '<span class="nm">' + esc(a.name) + '</span>' +
          '<span class="pk" data-pick></span>' +
        '</div>' +
        '<div class="lane-track"><canvas></canvas>' +
          '<div class="lane-pbar"><i style="background:' + a.color + '"></i></div>' +
        '</div>' +
        '<div class="lane-stat"><div class="ops" data-ops>0</div><div class="rk" data-rk>—</div></div>';
      lanesEl.appendChild(lane);
      laneRefs[a.id] = {
        root: lane,
        canvas: lane.querySelector('canvas'),
        ops: lane.querySelector('[data-ops]'),
        rk: lane.querySelector('[data-rk]'),
        pbar: lane.querySelector('.lane-pbar i'),
        pick: lane.querySelector('[data-pick]'),
        ctx: null,
        w: 0, h: 0, dpr: 1
      };
    });
    setupCanvases();
  }

  function setupCanvases() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    ALGOS.forEach(function (a) {
      var r = laneRefs[a.id];
      if (!r) return;
      var rect = r.canvas.getBoundingClientRect();
      var w = Math.max(80, Math.round(rect.width));
      var h = Math.max(30, Math.round(rect.height));
      r.canvas.width = Math.round(w * dpr);
      r.canvas.height = Math.round(h * dpr);
      r.w = w; r.h = h; r.dpr = dpr;
      var ctx = r.canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      r.ctx = ctx;
    });
    drawAll();
  }

  function drawLane(id) {
    var r = laneRefs[id];
    if (!r || !r.ctx) return;
    var p = S.players && S.players[id];
    var arr = p ? p.arr : (S.race ? S.race.data : null);
    if (!arr) return;
    var ctx = r.ctx, w = r.w, h = r.h;
    var n = arr.length;
    var pad = 3;
    var bw = (w - pad * 2) / n;
    var maxV = 1;
    for (var i = 0; i < n; i++) if (arr[i] > maxV) maxV = arr[i];

    ctx.clearRect(0, 0, w, h);

    // 基线
    ctx.fillStyle = 'rgba(255,255,255,.035)';
    ctx.fillRect(0, h - 2, w, 1);

    var hot = p ? p.hot : -1;
    var pair = p ? p.hotPair : null;
    var base = S.race ? S.race.runners.filter(function (x) { return x.id === id; })[0].color : '#888';

    for (var k = 0; k < n; k++) {
      var v = arr[k] / maxV;
      var bh = Math.max(2, v * (h - pad * 2));
      var x = pad + k * bw;
      var y = h - pad - bh;
      var ww = Math.max(1, bw - (bw > 4 ? 1 : 0.2));
      var isHot = (k === hot) || (pair && (k === pair[0] || k === pair[1]));
      if (isHot) {
        ctx.fillStyle = pair && (k === pair[0] || k === pair[1]) ? '#FFD166' : '#FFFFFF';
        ctx.shadowColor = 'rgba(255,255,255,.9)';
        ctx.shadowBlur = 9;
      } else {
        ctx.fillStyle = base;
        ctx.globalAlpha = 0.78;
      }
      ctx.fillRect(x, y, ww, bh);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }
  }

  function drawAll() {
    ALGOS.forEach(function (a) { drawLane(a.id); });
  }

  /* ---------------- 比赛准备 ---------------- */
  function resetRace() {
    cancelAnimationFrame(S.raf);
    S.phase = 'idle';
    S.race = null;
    S.players = null;
    S.events = [];
    S.announced = {};
    S.revealed = false;
    $('result').classList.remove('on');
    $('result').innerHTML = '';
    $('arenaHead').classList.remove('live');
    $('arenaStatus').textContent = '待发车';
    $('arenaMeta').textContent = '—';
    $('castList').innerHTML = '<div class="cast-empty">选好剧本、押上你的冠军，然后按「开赛」。解说员已经在热身了。</div>';
    S.castCount = 0;

    // 用数据预览渲染赛道
    var preview = D.makeData(S.scenario, S.size, S.seed);
    S.race = { data: preview, runners: ALGOS.map(function (a) { return { id: a.id, color: a.color }; }) };
    S.players = null;
    drawAll();

    ALGOS.forEach(function (a) {
      var r = laneRefs[a.id];
      if (!r) return;
      r.ops.textContent = '0';
      r.rk.textContent = '—';
      r.pbar.style.width = '0%';
      r.root.classList.remove('win', 'done');
      r.pick.textContent = S.bet === a.id ? '押' : '';
    });

    updateStartBtn();
    $('seedHint').innerHTML = '<b>第 ' + S.seed + ' 局</b>';
  }

  function updateStartBtn() {
    var b = $('startBtn');
    if (S.phase === 'racing') {
      b.textContent = '比赛中…';
      b.disabled = true;
    } else if (S.phase === 'countdown') {
      b.textContent = '准备…';
      b.disabled = true;
    } else if (S.phase === 'done') {
      b.textContent = '再来一局';
      b.disabled = false;
    } else {
      b.textContent = S.bet ? '开赛' : '开赛（未押注）';
      b.disabled = false;
    }
  }

  /* ---------------- 押注 ---------------- */
  function renderChips() {
    var box = $('chips');
    box.innerHTML = '';
    var locked = S.phase === 'racing' || S.phase === 'countdown';
    ALGOS.forEach(function (a) {
      var c = el('button', 'chip' + (S.bet === a.id ? ' on' : ''));
      c.type = 'button';
      c.disabled = locked;
      c.style.setProperty('--ac', a.color);
      c.innerHTML =
        '<span class="ce">' + a.emoji + '</span>' +
        '<span class="cn">' + esc(a.short) + '</span>' +
        '<span class="cd">' + a.avg.replace(/ /g, '') + '</span>';
      c.onclick = function () {
        if (locked) return;
        S.bet = S.bet === a.id ? null : a.id;
        renderChips();
        updateStartBtn();
        ALGOS.forEach(function (x) {
          var r = laneRefs[x.id];
          if (r) r.pick.textContent = S.bet === x.id ? '押' : '';
        });
      };
      box.appendChild(c);
    });
    $('betTip').textContent = S.bet
      ? '已押：' + ALGOS.filter(function (a) { return a.id === S.bet; })[0].name + ' · 押中冠军 +10 分'
      : '押中冠军 +10 分，连击还有额外加成';
  }

  /* ---------------- 解说 ---------------- */
  function say(text, big) {
    var list = $('castList');
    var empty = list.querySelector('.cast-empty');
    if (empty) empty.remove();
    var it = el('div', 'cast-item' + (big ? ' big' : ''));
    var t = S.t0 ? Math.max(0, (performance.now() - S.t0) / 1000) : 0;
    it.innerHTML = '<span class="t">' + t.toFixed(1) + 's</span><span>' + text + '</span>';
    list.appendChild(it);
    S.castCount++;
    // 只保留最近 30 条
    while (list.children.length > 30) list.removeChild(list.firstChild);
    list.scrollTop = list.scrollHeight;
  }

  /* ---------------- 开赛 ---------------- */
  function startRace(skipBet) {
    if (!dbReady || saving) { toast(saving ? '战绩保存中，请稍候' : '战绩未就绪，请刷新重试'); return; }
    if (S.phase === 'racing' || S.phase === 'countdown') return;
    if (skipBet) S.bet = null;
    if (S.phase === 'done') {
      // 再来一局：换 seed 保证数据新鲜
      S.seed = (S.seed * 31 + 7) % 100000;
    }

    var race = D.buildRace(S.scenario, S.size, S.seed);
    // 完整性兜底：任何一个选手没排好就不许开赛
    var bad = race.runners.filter(function (r) { return !r.sorted; });
    if (bad.length) {
      toast('检测到算法自检失败，已重新发牌');
      S.seed = (S.seed * 17 + 3) % 100000;
      return;
    }

    S.race = race;
    S.players = {};
    race.runners.forEach(function (r) { S.players[r.id] = D.makePlayer(r, race.data); });
    S.phase = 'countdown';
    S.events = [];
    S.announced = {};
    S.revealed = false;
    $('result').classList.remove('on');
    $('result').innerHTML = '';
    $('castList').innerHTML = '';
    S.castCount = 0;
    updateStartBtn();
    renderChips();
    renderScenarioSeg();
    renderSizeSeg();

    // 重置赛道视觉
    ALGOS.forEach(function (a) {
      var r = laneRefs[a.id];
      r.ops.textContent = '0';
      r.rk.textContent = '—';
      r.pbar.style.width = '0%';
      r.root.classList.remove('win', 'done');
    });
    drawAll();

    $('arenaMeta').textContent = race.kind === 'custom' ? '自定义数据 · ' + race.n + ' 元素'
      : SCENARIOS.filter(function (x) { return x.id === race.kind; })[0].name + ' · ' + race.n + ' 元素';

    var sc = SCENARIOS.filter(function (x) { return x.id === race.kind; })[0];
    var winner = race.winner;
    var spread = race.spread.toFixed(1);

    // 倒计时
    var seq = ['3', '2', '1', 'GO'];
    var ci = 0;
    var countEl = $('count');
    var numEl = $('countN');
    countEl.classList.add('on');

    function tick() {
      if (ci >= seq.length) {
        countEl.classList.remove('on');
        runRace();
        return;
      }
      numEl.textContent = seq[ci];
      numEl.style.color = seq[ci] === 'GO' ? '#FFC94A' : '';
      numEl.style.animation = 'none';
      void numEl.offsetWidth;
      numEl.style.animation = '';
      ci++;
      setTimeout(tick, seq[ci - 1] === 'GO' ? 480 : 460);
    }
    setTimeout(tick, 120);

    S.pendingIntro = { sc: sc, winner: winner, spread: spread };
  }

  function runRace() {
    S.phase = 'racing';
    S.t0 = performance.now();
    S.lastFrame = S.t0;
    S.events = [];
    $('arenaHead').classList.add('live');
    $('arenaStatus').textContent = '比赛进行中';
    updateStartBtn();

    var sc = S.pendingIntro.sc;
    say('<b>' + sc.emoji + ' ' + esc(sc.name) + '</b> — ' + esc(sc.desc) + ' 赛道长 ' + S.size + ' 个元素，六位选手各跑各的。', true);
    say('计分规则：比较 + 写入 = 操作数，越少越好。与机器快慢无关，只和数据长相有关。');

    S.lastRank = {};

    function frame(now) {
      if (S.phase !== 'racing') return;
      var dt = now - S.lastFrame;
      S.lastFrame = now;

      // 速度：每秒推进的操作数。按最慢选手的总量归一，保证慢的选手也看得见
      // ── 播放模型：时间压缩 ──
      // 如果按统一操作速率播放，冠军（操作数只有最慢者的 1/10）会在 0.5 秒内
      // 就撞线，悬念瞬间消失，而剩下 4 秒都在看三个 O(n²) 慢慢爬。
      // 因此给每条赛道一个「自身时长」：用时随操作数单调递增，
      // 最少的约 2.2 秒、最多的约 5.2 秒。撞线先后顺序严格等于操作数多少，
      // 只是把巨大的数量级差压缩到肉眼能看的区间。
      var maxOps = S.race.maxOps || 1;
      var FAST_MIN = 1.9 / S.speed;   // 冠军大约 1.9 秒撞线（1× 速度）
      var totalSec = 5.0 / S.speed;   // 最慢的选手大约 5.0 秒
      // 用操作数在全场区间里的「百分位」映射时长，保证操作数不同 => 时长必然不同。
      // 若直接用 ops/maxOps，两条相差极小的赛道会被压成同一时刻撞线，
      // 撞线先后就不再严格等于排名。这里把差异放大到至少一个可感知的间隔。
      var minOps = S.race.minOps || 1;

      var allDone = true;

      var elapsedSec = (now - S.t0) / 1000;
      S.race.runners.forEach(function (r) {
        var p = S.players[r.id];
        if (p.finished) {
          // 补记撞线时刻（finishMs 在置 finished 的那一帧可能还没来得及写）
          if (!p.finishMs) p.finishMs = elapsedSec;
          return;
        }
        // 该选手的播放时长：最快者 FAST_MIN 秒，最慢者 totalSec 秒，
        // 中间按操作数占比线性插值 —— 撞线顺序因此严格保持操作数升序。
        var share = maxOps > minOps ? (r.ops - minOps) / (maxOps - minOps) : 0;
        var dur = FAST_MIN + (totalSec - FAST_MIN) * share;
        var frac = S.speed >= 9 ? 1 : Math.min(1, elapsedSec / Math.max(0.15, dur));
        var target = Math.round(r.ops * frac);
        if (target > p.opDone) D.advance(p, target);
        if (S.speed >= 9) p.finished = true;
        if (p.finished && !p.finishMs) p.finishMs = elapsedSec;
        if (!p.finished) allDone = false;
        // 撞线瞬间的解说由下面的 announcer 统一处理
      });

      // 更新数值 & 进度
      S.race.runners.forEach(function (r) {
        var p = S.players[r.id];
        var lr = laneRefs[r.id];
        if (!lr) return;
        lr.ops.textContent = fmt(p.opDone);
        var pct = Math.min(100, p.opDone / r.ops * 100);
        // 已完成的选手，进度条固定满格
        if (p.finished) pct = 100;
        lr.pbar.style.width = pct.toFixed(1) + '%';
        lr.root.classList.toggle('done', p.finished);
        /* 领先/落后：让三条同时推进的 O(n²) 也有可读差异 */
        lr.root.dataset.ops = p.opDone;
      });

      // 名次（按当前操作数排）：并列时共享同一名次，不硬拆平局
      var order = S.race.runners.slice().sort(function (a, b) {
        var pa = S.players[a.id], pb = S.players[b.id];
        if (pa.finished !== pb.finished) return pa.finished ? -1 : 1;
        return pa.opDone - pb.opDone;
      });
      var prevOps = -1, prevRank = 0;
      order.forEach(function (r, i) {
        var p = S.players[r.id];
        var rank = (p.opDone === prevOps) ? prevRank : i + 1;
        prevOps = p.opDone; prevRank = rank;
        var lr = laneRefs[r.id];
        if (lr) lr.rk.textContent = rank === 1 ? '第 1' : '第 ' + rank;
      });

      // 换位播报（只在有意义的时刻说）
      order.forEach(function (r, i) {
        var prev = S.lastRank[r.id];
        if (prev != null && prev !== i + 1 && i === 0 && !S.announced.firstLead) {
          S.announced.firstLead = true;
          say('⚡ <b>' + esc(r.name) + '</b> 抢到了领跑位置！');
        }
        S.lastRank[r.id] = i + 1;
      });

      // 中途解说：某位选手跑完
      S.race.runners.forEach(function (r) {
        var p = S.players[r.id];
        if (p.finished && !S.announced['fin_' + r.id]) {
          S.announced['fin_' + r.id] = true;
          say('✅ <b>' + esc(r.name) + '</b> 撞线，用了 <b>' + fmt(r.ops) + '</b> 次操作。');
        }
      });

      drawAll();

      if (allDone) {
        S.phase = 'done';
        finishRace();
        return;
      }
      S.raf = requestAnimationFrame(frame);
    }
    S.raf = requestAnimationFrame(frame);
  }

  /* ---------------- 结束 ---------------- */
  function finishRace() {
    cancelAnimationFrame(S.raf);
    $('arenaHead').classList.remove('live');
    $('arenaStatus').textContent = '比赛结束';
    updateStartBtn();

    var race = S.race;
    var winner = race.winner;
    var bet = S.bet;
    var champs = race.champions || [winner];
    var hit = !!bet && champs.some(function (c) { return c.id === bet; });
    var winnerAlgo = ALGOS.filter(function (a) { return a.id === winner.id; })[0];

    // 名次 & 冠军标记
    race.ranked.forEach(function (r) {
      var lr = laneRefs[r.id];
      if (!lr) return;
      lr.rk.textContent = '第 ' + r.rank;
      if (r.rank === 1) lr.root.classList.add('win');
    });
    race.runners.forEach(function (r) {
      var lr = laneRefs[r.id];
      if (lr) lr.ops.textContent = fmt(r.ops);
    });
    drawAll();

    // 解说收尾
    if (champs.length > 1) {
      say('🏆 并列冠军：<b>' + champs.map(function (c) { return esc(c.name); }).join(' 与 ') +
        '</b>，都是 <b>' + fmt(winner.ops) + '</b> 次操作，难分高下。', true);
    } else {
      say('🏆 冠军是 <b>' + esc(winner.name) + '</b>，操作数 <b>' + fmt(winner.ops) + '</b>。', true);
    }

    // 成绩写入
    stats.games++;
    var gain = 0;
    if (bet) {
      if (hit) {
        stats.wins++;
        stats.streak++;
        if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
        gain = 10 + Math.min(10, (stats.streak - 1) * 2);
        stats.score += gain;
      } else {
        stats.streak = 0;
      }
    }
    var wi = ALGOS.map(function (a) { return a.id; }).indexOf(winner.id);
    if (wi >= 0) stats.algoWins[wi]++;

    stats.history.unshift({
      kind: race.kind,
      n: race.n,
      bet: bet,
      winner: winner.id,
      hit: !!hit,
      gain: gain,
      t: Date.now()
    });
    if (stats.history.length > 40) stats.history.length = 40;
    saveStats(stats);
    refreshRankChip();

    // 结果面板
    renderResult(race, bet, hit, gain);

    // 赛后解说：讲清楚为什么
    setTimeout(function () {
      say(explain(race), true);
    }, 400);

    if (bet) {
      toast(hit ? '🎉 押中了！+' + gain + ' 分' : '没押中，' + winnerAlgo.short + ' 赢了这一局');
    }
  }

  /* ---------------- 结果面板 ---------------- */
  function renderResult(race, bet, hit, gain) {
    var box = $('result');
    var winner = race.winner;
    var winnerAlgo = ALGOS.filter(function (a) { return a.id === winner.id; })[0];
    var sc = SCENARIOS.filter(function (x) { return x.id === race.kind; })[0] || { name: '自定义', emoji: '✏️' };
    var maxOps = race.maxOps;

    var betAlgo = bet ? ALGOS.filter(function (a) { return a.id === bet; })[0] : null;

    // 并列冠军：多个算法操作数完全相同
    var champs = race.champions || [winner];
    var isTie = champs.length > 1;
    var champNames = champs.map(function (c) {
      var al = ALGOS.filter(function (a) { return a.id === c.id; })[0];
      return al.emoji + ' ' + al.name;
    }).join('　/　');

    var html = '';
    html += '<div class="rcard' + (bet && !hit ? ' miss' : '') + '">';
    html += '<div class="rtop">';
    html += '<div class="crown">' + (hit ? '🎉' : '🏆') + '</div>';
    html += '<div class="who">';
    html += '<div class="k">' + esc(sc.emoji + ' ' + sc.name) + ' · ' + race.n + ' 元素 · ' +
      (isTie ? '并列冠军 ' + champs.length + ' 位' : '冠军') + '</div>';
    html += '<h2>' + champNames + '</h2>';
    html += '<p>' + fmt(winner.ops) + ' 次操作（' + fmt(winner.cmp) + ' 比较 + ' + fmt(winner.wr) + ' 写入）' +
      (isTie ? ' · 操作数完全相同，判为并列' : '') + '</p>';
    html += '</div>';
    if (bet) {
      html += '<div class="verdict' + (hit ? '' : ' no') + '">' +
        (hit ? '押中 +' + gain + ' 分' : '押的是 ' + esc(betAlgo.short)) + '</div>';
    } else {
      html += '<div class="verdict no">本局未押注</div>';
    }
    html += '</div>';

    // 排名表
    html += '<div class="rtable">';
    race.ranked.forEach(function (r, i) {
      var pct = maxOps > 0 ? (r.ops / maxOps * 100) : 0;
      var isBet = bet === r.id;
      html += '<div class="rrow' + (r.rank === 1 ? ' top1' : '') + '">';
      html += '<div class="pos">' + r.rank + '</div>';
      html += '<div class="mid">';
      html += '<div class="nmline">';
      html += '<span class="sw" style="background:' + r.color + '"></span>';
      html += '<b>' + esc(r.name) + '</b>';
      if (isBet) html += '<span class="mine">你押的</span>';
      html += '</div>';
      html += '<div class="bar"><i style="width:' + pct.toFixed(1) + '%;background:' + r.color + '"></i></div>';
      html += '</div>';
      html += '<div class="ops">' + fmt(r.ops) + '</div>';
      html += '</div>';
    });
    html += '</div>';

    // 洞察
    html += '<div class="insight">';
    html += '<h4>🔎 这一局为什么这样</h4>';
    html += explainHTML(race);
    html += '</div>';

    // 操作
    html += '<div class="racts">';
    html += '<button class="btn btn-primary" id="againBtn">再来一局</button>';
    html += '<button class="btn btn-ghost" id="shareBtn">🏷️ 复制分享文案</button>';
    html += '<button class="btn btn-ghost" id="codexBtn">📖 看算法档案</button>';
    html += '</div>';
    html += '<div class="sharebox" id="shareBox"><textarea id="shareText" readonly></textarea></div>';

    html += '</div>';
    box.innerHTML = html;
    box.classList.add('on');

    $('againBtn').onclick = function () { startRace(false); };
    $('shareBtn').onclick = function () { toggleShare(race, hit, gain); };
    $('codexBtn').onclick = function () { switchPage('codex'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    // 名次条动画
    requestAnimationFrame(function () {
      box.querySelectorAll('.rrow .bar i').forEach(function (i) { i.style.width = i.style.width; });
    });
  }

  /* ---------------- 解释生成（核心教学价值） ---------------- */
  function explainHTML(race) {
    var w = race.winner;
    var ranked = race.ranked;
    var second = ranked[1];
    var last = ranked[ranked.length - 1];
    var algo = ALGOS.filter(function (a) { return a.id === w.id; })[0];
    var sc = SCENARIOS.filter(function (x) { return x.id === race.kind; })[0];
    var parts = [];

    var champs = race.champions || [w];
    if (champs.length > 1) {
      parts.push('<p><b>' + champs.map(function (c) { return esc(c.name); }).join(' 与 ') +
        '</b> 都是 <span class="num">' + fmt(w.ops) + '</span> 次操作，并列第一——' +
        '这种「换谁都一样」的局面本身就说明了问题：在已排好序的数据上，' +
        '带提前退出的冒泡与插入排序都只需 n-1 次比较就能确认「无需改动」。</p>');
    } else {
      parts.push('<p><b>' + esc(algo.name) + '</b> 用 <span class="num">' + fmt(w.ops) +
        '</span> 次操作拿下第一，比第二名的 ' + esc(second.name) + '（' + fmt(second.ops) +
        '）少了 <span class="num">' + fmt(second.ops - w.ops) + '</span> 次。</p>');
    }

    // 场景专属解释
    var why = '';
    if (race.kind === 'sorted') {
      why = '数据本来就是升序的。带提前退出的冒泡排序只需一趟扫描就发现「一次交换都没有」，直接收工——' +
        '这正是它的最好情况 <b>O(n)</b>。而选择排序不管数据长什么样都要老老实实比较 n²/2 次，所以它在这一局毫无还手之力。';
    } else if (race.kind === 'nearly') {
      why = '数据已经基本有序，只有少量元素错位。插入排序每次只需把错位元素往回挪几步，总工作量接近 <b>O(n)</b>；' +
        '而归并排序不管数据是否有序，都要完整地做 log n 层合并，反而更费。这就是「自适应」算法的价值。';
    } else if (race.kind === 'reversed') {
      why = '完全逆序是最坏情况。冒泡和插入每一对元素都要交换/移动，直接退化成 <b>O(n²)</b>，' +
        '操作数爆炸。归并排序不受数据顺序影响，稳定保持 <b>O(n log n)</b>，在这种「恶意数据」上优势最大。';
    } else if (race.kind === 'dupes') {
      why = '只有少数几种取值，大量元素彼此相等。三路快排把「小于 / 等于 / 大于」分成三段，' +
        '等于 pivot 的一整段会被<b>一次性跳过</b>，重复值越多越省，接近 <b>O(n)</b>。而普通比较类算法仍要逐个处理每个元素。';
    } else if (race.kind === 'sawtooth') {
      why = '锯齿波是「局部有序、整体无序」。归并和快排都能从局部的有序性里获益，' +
        '而插入排序被拉长到 <b>O(n²)</b>——因为每个锯齿的起点都要往回挪很远。';
    } else {
      why = '随机数据没有可利用的结构，O(n log n) 的选手凭分治优势稳稳压过所有 O(n²) 的选手。' +
        '这也是为什么工程里默认用归并 / 快排，而不是冒泡。';
    }
    // 并列冠军时，上面已经解释了「为什么并列」，不再重复场景解释
    if (champs.length <= 1) parts.push('<p>' + why + '</p>');

    // 最惨的那位
    if (last && last.ops > w.ops * 2) {
      parts.push('<p>本局最惨的是 <b>' + esc(last.name) + '</b>，' + fmt(last.ops) +
        ' 次操作，是冠军的 <span class="bad">' + (last.ops / w.ops).toFixed(1) + ' 倍</span>。' +
        '同样的数据、同样的目标，算法选错就是这个代价。</p>');
    }

    // 冠军人设呼应
    parts.push('<p style="color:var(--ink3);font-size:12.5px">💡 ' + esc(algo.winsWhen) + '</p>');
    return parts.join('');
  }

  function explain(race) {
    var w = race.winner;
    var algo = ALGOS.filter(function (a) { return a.id === w.id; })[0];
    var second = race.ranked[1];
    var ratio = (second.ops / w.ops).toFixed(2);
    var tail = '';
    if (race.kind === 'sorted') tail = '数据本来就排好了，冒泡一趟就收工。';
    else if (race.kind === 'nearly') tail = '数据几乎有序，插入排序的舒适区。';
    else if (race.kind === 'reversed') tail = '完全逆序，O(n²) 的选手全线崩盘。';
    else if (race.kind === 'dupes') tail = '重复值太多，三路划分一次跳一段。';
    else if (race.kind === 'sawtooth') tail = '局部有序骗不了分治算法。';
    else tail = '随机数据没有捷径，分治稳赢。';
    return '📊 ' + algo.name + ' 领先第二名 ' + (ratio - 1 > 0 ? (ratio - 1).toFixed(1) + ' 倍' : '一点点') +
      '的操作差距。' + tail;
  }

  /* ---------------- 分享 ---------------- */
  function toggleShare(race, hit, gain) {
    var box = $('shareBox');
    var isOn = box.classList.contains('on');
    if (isOn) { box.classList.remove('on'); return; }
    var winner = race.winner;
    var algo = ALGOS.filter(function (a) { return a.id === winner.id; })[0];
    var sc = SCENARIOS.filter(function (x) { return x.id === race.kind; })[0] || { name: '自定义', emoji: '✏️' };
    var betAlgo = S.bet ? ALGOS.filter(function (a) { return a.id === S.bet; })[0] : null;

    var lines = [];
    lines.push('我在「算法竞技场」押了 ' + (betAlgo ? betAlgo.name : '（没押）') + '，' + sc.emoji + ' ' + sc.name + ' 剧本 ' + race.n + ' 个元素——');
    lines.push('冠军是 ' + algo.emoji + ' ' + algo.name + '，' + fmt(winner.ops) + ' 次操作。');
    if (hit) lines.push('押中了，+' + gain + ' 分 🎉');
    lines.push('');
    lines.push('六个排序算法在同一条赛道上比「比较次数+写入次数」，');
    lines.push('换一组数据剧本，冠军就换人——复杂度是看得见的。');
    lines.push('');
    lines.push('#算法竞技场 #排序算法');
    var text = lines.join('\n');
    $('shareText').value = text;
    box.classList.add('on');

    var ta = $('shareText');
    var done = function () { toast('已复制到剪贴板'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        ta.select(); toast('请手动复制（已全选）');
      });
    } else {
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('请手动复制（已全选）'); }
    }
  }

  /* ---------------- 图鉴 ---------------- */
  function renderCodex() {
    var box = $('codexGrid');
    box.innerHTML = '';
    ALGOS.forEach(function (a) {
      var card = el('div', 'acard');
      card.style.setProperty('--ac', a.color);
      var h = '';
      h += '<div class="acard-h">';
      h += '<span class="ce">' + a.emoji + '</span>';
      h += '<div class="t"><b>' + esc(a.name) + '</b><span>' + esc(a.en) + '</span></div>';
      h += '</div>';
      h += '<p class="tag">「' + esc(a.tagline) + '」</p>';
      h += '<div class="cxgrid">';
      h += '<div class="cx"><div class="k">最好</div><div class="v">' + esc(a.best) + '</div></div>';
      h += '<div class="cx"><div class="k">平均</div><div class="v">' + esc(a.avg) + '</div></div>';
      h += '<div class="cx"><div class="k">最坏</div><div class="v">' + esc(a.worst) + '</div></div>';
      h += '<div class="cx"><div class="k">额外空间</div><div class="v">' + esc(a.space) + '</div></div>';
      h += '<div class="cx"><div class="k">稳定性</div><div class="v">' + esc(a.stable) + '</div></div>';
      h += '<div class="cx"><div class="k">本场夺冠</div><div class="v" id="cw-' + a.id + '">—</div></div>';
      h += '</div>';
      h += '<ul class="pl pros">';
      a.pros.forEach(function (p) { h += '<li><span class="ic">✓</span><span>' + esc(p) + '</span></li>'; });
      h += '</ul>';
      h += '<ul class="pl cons">';
      a.cons.forEach(function (p) { h += '<li><span class="ic">✕</span><span>' + esc(p) + '</span></li>'; });
      h += '</ul>';
      h += '<div class="when"><b>什么时候能赢：</b>' + esc(a.winsWhen) + '</div>';
      card.innerHTML = h;
      box.appendChild(card);
    });
    // 填入个人夺冠次数
    ALGOS.forEach(function (a, i) {
      var n = stats.algoWins[i] || 0;
      var node = $('cw-' + a.id);
      if (node) node.textContent = n ? n + ' 次' : '还没赢过';
    });
  }

  /* ---------------- 战绩 ---------------- */
  function renderStats() {
    var games = stats.games;
    var wins = stats.wins;
    var rate = games ? Math.round(wins / games * 100) : 0;
    var rk = D.rankFor(games, wins);

    // 段位卡
    var rc = $('rankCard');
    var nextLine = '';
    if (rk.next) {
      var need = rk.next.min - games;
      var pct = Math.min(100, (games - rk.rank.min) / (rk.next.min - rk.rank.min) * 100);
      nextLine = '<div class="prog"><div class="lbl"><span>距离「' + rk.next.name + '」还需 ' + need + ' 局</span><span>' + games + ' / ' + rk.next.min + '</span></div>' +
        '<div class="bar"><i style="width:' + pct.toFixed(0) + '%"></i></div></div>';
    } else {
      nextLine = '<div class="prog"><div class="lbl"><span>已达最高段位</span><span>' + games + ' 局</span></div>' +
        '<div class="bar"><i style="width:100%"></i></div></div>';
    }
    rc.innerHTML =
      '<div class="big">' + rk.rank.emoji + '</div>' +
      '<div class="info">' +
        '<div class="k">当前段位</div>' +
        '<h2>' + esc(rk.rank.name) + '</h2>' +
        '<p>' + esc(rk.rank.desc) + '</p>' +
      '</div>' +
      nextLine;

    // 数据格
    var sg = $('statGrid');
    var cells = [
      { k: '总局数', v: games, sub: '每局都有记录' },
      { k: '押中次数', v: wins, sub: '冠军竞猜命中' },
      { k: '命中率', v: rate, unit: '%', sub: games ? '共 ' + games + ' 次下注' : '还没下过注' },
      { k: '当前连击', v: stats.streak, sub: '最长 ' + stats.bestStreak + ' 连' },
      { k: '累计得分', v: stats.score, sub: '押中 +10，连击加成' }
    ];
    sg.innerHTML = cells.map(function (c) {
      return '<div class="sbox"><div class="k">' + c.k + '</div>' +
        '<div class="v">' + c.v + (c.unit ? '<small>' + c.unit + '</small>' : '') + '</div>' +
        '<div class="sub">' + esc(c.sub) + '</div></div>';
    }).join('');

    // 历史
    var hl = $('histList');
    var h = stats.history.slice(0, 12);
    $('histCnt').textContent = stats.history.length ? '共 ' + stats.history.length + ' 局' : '';
    if (!h.length) {
      hl.innerHTML = '<div class="empty"><span class="e">🏟️</span>还没有比赛记录。<br>去竞技场跑一局，战绩会记在这里。</div>';
      return;
    }
    hl.innerHTML = h.map(function (it) {
      var sc = SCENARIOS.filter(function (x) { return x.id === it.kind; })[0] || { name: '自定义', emoji: '✏️' };
      var wa = ALGOS.filter(function (a) { return a.id === it.winner; })[0] || { name: '?', emoji: '?' };
      var ba = it.bet ? ALGOS.filter(function (a) { return a.id === it.bet; })[0] : null;
      var icon = it.bet ? (it.hit ? '✅' : '❌') : '➖';
      var d = new Date(it.t);
      var time = (d.getMonth() + 1) + '/' + d.getDate() + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      var right = it.hit ? '<span class="ok">+' + it.gain + '</span>'
        : (it.bet ? '<span class="no">未中</span>' : '<span style="color:var(--ink3);font-size:11.5px">未押</span>');
      return '<div class="hrow">' +
        '<span class="ic">' + icon + '</span>' +
        '<div class="h-main"><b>' + sc.emoji + ' ' + esc(sc.name) + ' · ' + it.n + ' 元素</b>' +
        '<span>' + esc(wa.name) + ' 夺冠' + (ba ? ' · 你押 ' + esc(ba.short) : '') + ' · ' + time + '</span></div>' +
        right + '</div>';
    }).join('');
  }

  function refreshRankChip() {
    var rk = D.rankFor(stats.games, stats.wins);
    var chip = $('rankChip');
    chip.innerHTML = '<span class="e">' + rk.rank.emoji + '</span><b>' + esc(rk.rank.name) + '</b>';
  }

  /* ---------------- 页面切换 ---------------- */
  function switchPage(name) {
    document.querySelectorAll('.tab').forEach(function (t) {
      var on = t.dataset.page === name;
      t.classList.toggle('on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.page').forEach(function (p) {
      p.classList.toggle('on', p.id === 'page-' + name);
    });
    if (name === 'codex') renderCodex();
    if (name === 'stats') renderStats();
    if (name === 'arena') {
      // 回到竞技场时重算画布尺寸（可能从隐藏变可见）
      requestAnimationFrame(setupCanvases);
    }
  }

  /* ---------------- toast ---------------- */
  var toastTimer = 0;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, 2200);
  }

  /* ---------------- 事件绑定 ---------------- */
  $('startBtn').onclick = function () { startRace(false); };
  $('luckyBtn').onclick = function () {
    if (S.phase === 'racing' || S.phase === 'countdown') return;
    var pool = ALGOS.slice();
    // 加权：按历史夺冠次数反比，让冷门也有机会
    var pick = pool[Math.floor(Math.random() * pool.length)];
    S.bet = pick.id;
    renderChips();
    updateStartBtn();
    ALGOS.forEach(function (x) {
      var r = laneRefs[x.id];
      if (r) r.pick.textContent = S.bet === x.id ? '押' : '';
    });
    toast('随机押了「' + pick.name + '」');
  };
  $('skipBtn').onclick = function () {
    if (S.phase === 'racing' || S.phase === 'countdown') return;
    startRace(true);
  };
  $('resetBtn').onclick = function () {
    if (!dbReady || saving) { toast('战绩未就绪，请稍候'); return; }
    if (!confirm('确定要清空所有战绩吗？此操作不可撤销。')) return;
    stats = { games: 0, wins: 0, streak: 0, bestStreak: 0, score: 0, algoWins: ALGOS.map(function () { return 0; }), history: [] };
    saveStats(stats);
    refreshRankChip();
    renderStats();
    toast('正在保存战绩');
  };

  document.querySelectorAll('.tab').forEach(function (t) {
    t.onclick = function () { switchPage(t.dataset.page); };
  });

  // 键盘：空格开赛
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') {
      var arenaOn = document.querySelector('.page.on');
      if (arenaOn && arenaOn.id === 'page-arena') {
        e.preventDefault();
        if (S.phase === 'idle' || S.phase === 'done') startRace(false);
      }
    }
  });

  // 窗口尺寸变化：重设画布
  var rzTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rzTimer);
    rzTimer = setTimeout(function () {
      if (document.querySelector('.page.on') && document.querySelector('.page.on').id === 'page-arena') {
        setupCanvases();
      }
    }, 130);
  });

  // 切到后台时暂停动画推进，避免回来后一帧跳太远
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      S.lastFrame = performance.now();
    } else {
      S.lastFrame = performance.now();
    }
  });

  /* ---------------- 启动 ---------------- */
  renderScenarioSeg();
  renderSizeSeg();
  renderSpeedSeg();
  renderLanes();
  renderChips();
  refreshRankChip();
  resetRace();
  initStats();

  // 暴露给控制台调试用（不影响功能）
  window.__sortderby = { S: S, D: D, startRace: startRace };
})();
