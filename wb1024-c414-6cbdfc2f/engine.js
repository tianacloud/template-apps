/* ============================================================
   Pulse · 3D 运维根因沙盘 —— 核心引擎
   纯 ES Module，零依赖。所有指标/链路/异常均为本地自研模拟，
   不依赖任何外部服务，便于离线演示与评审。
   ============================================================ */

/* ── 拓扑定义：微服务集群 ────────────────────────────── */
export const TIERS = {
  gw:    { label: '接入层', color: '#38bdf8', h: 1.0 },
  biz:   { label: '业务层', color: '#a78bfa', h: 1.35 },
  data:  { label: '数据层', color: '#34d399', h: 0.9 },
  ext:   { label: '外部依赖', color: '#fbbf24', h: 0.8 }
};

/* 节点：x/z 为集群平面坐标（世界单位），y 为高度（0 贴地） */
export const SERVICES = [
  { id: 'gw',      name: 'api-gateway',   tier: 'gw',   x: 0,    z: 0,    deps: ['order', 'user'] },
  { id: 'order',   name: 'order-service', tier: 'biz',  x: -1.4, z: -1.1, deps: ['pay', 'stock', 'cart'] },
  { id: 'user',    name: 'user-service',  tier: 'biz',  x: 1.4,  z: -1.1, deps: ['db', 'cache'] },
  { id: 'pay',     name: 'pay-service',   tier: 'biz',  x: -2.6, z: 0.9,  deps: ['db', 'mongo', 'extpay'] },
  { id: 'stock',   name: 'stock-service', tier: 'biz',  x: 0.2,  z: 1.4,  deps: ['db', 'mq'] },
  { id: 'cart',    name: 'cart-service',  tier: 'biz',  x: 1.9,  z: 0.9,  deps: ['cache', 'db'] },
  { id: 'db',      name: 'mysql-primary', tier: 'data', x: -0.9, z: 0.1,  deps: [] },
  { id: 'mongo',   name: 'mongo-main',    tier: 'data', x: -3.1, z: 2.3,  deps: [] },
  { id: 'cache',   name: 'redis-cluster', tier: 'data', x: 2.9,  z: 1.8,  deps: [] },
  { id: 'mq',      name: 'kafka-prod',    tier: 'data', x: 0.9,  z: 2.6,  deps: [] },
  { id: 'extpay',  name: 'third-party-pay', tier: 'ext', x: -4.0, z: 0.2, deps: [] },
  { id: 'sms',     name: 'sms-gateway',   tier: 'ext',  x: 3.4,  z: -2.4, deps: [] }
];

/* 事件场景：注入故障 → 影响链路 */
export const SCENARIOS = [
  {
    id: 'dbpool', name: '数据库连接池耗尽', short: '连接池',
    target: 'db', metric: 'poolWait',
    desc: 'order-service 与 pay-service 的连接池被长事务占满，等待队列堆积，'
        + '表现为全链路 p95 抬升与 5xx 毛刺。',
    hint: '观察「根因分析」里 db 的贡献度，以及上游 order/pay 的异常时间是否领先。'
  },
  {
    id: 'cache', name: 'Redis 缓存击穿', short: '缓存击穿',
    target: 'cache', metric: 'hitRate',
    desc: '热点 key 过期瞬间，大量请求回源打到 MySQL，形成缓存层「假死」。',
    hint: '典型放大路径：cache → db，根因表现为上游传播而非自身 CPU 飙升。'
  },
  {
    id: 'mq', name: 'Kafka 消息积压', short: '消息积压',
    target: 'mq', metric: 'lag',
    desc: '消费组 rebalance 异常，消费速率骤降，lag 持续攀升，'
        + '下游异步链路（库存回写）最终超时。',
    hint: '异步故障往往滞后于用户请求，根因在「时间窗外的远端节点」。'
  },
  {
    id: 'extpay', name: '第三方支付超时', short: '外部超时',
    target: 'extpay', metric: 'timeout',
    desc: '外部支付通道网络抖动，pay-service 线程池被占满，'
        + '订单创建成功率下降。',
    hint: '外部依赖的问题要靠「依赖边传播」而非集群内部资源来解释。'
  }
];

/* ── 确定性随机 ──────────────────────────────────────── */
export function hashSeed(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return function () {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* ── 指标序列生成 ────────────────────────────────────── */
/** 为每个服务生成 minutes 长的指标时序 */
export function generateMetrics(scenario, minutes = 60, seedSalt = 1) {
  const sc = SCENARIOS.find(s => s.id === scenario) || SCENARIOS[0];
  const t0 = 30;                       // 故障注入时刻（分钟索引）
  const out = {};
  SERVICES.forEach(svc => {
    const r = rng(hashSeed(svc.id + '#' + sc.id + '#' + seedSalt));
    const base = {
      qps: Math.round(40 + r() * 90),
      p50: 18 + r() * 14,
      p95: 60 + r() * 40,
      errRate: 0.2 + r() * 0.6,
      cpu: 25 + r() * 20,
      poolWait: 2 + r() * 6,
      hitRate: 97 + r() * 2.5,
      lag: 200 + r() * 900,
      timeout: 0.1 + r() * 0.4
    };
    const series = { base, points: [] };
    for (let m = 0; m < minutes; m++) {
      // 日志正弦 + 噪声，形成自然的波形
      const wave = 1 + 0.12 * Math.sin((m / 60) * Math.PI * 2 + r() * 0.2);
      const p = { t: m, qps: 0, p50: 0, p95: 0, errRate: 0, cpu: 0, poolWait: 0, hitRate: 0, lag: 0, timeout: 0 };
      Object.keys(base).forEach(k => {
        const noise = (r() - 0.5) * 0.08;
        p[k] = base[k] * (1 + noise) * (k === 'qps' ? wave : (k === 'cpu' ? wave : 1));
      });
      p.hitRate = clamp(p.hitRate, 0, 100);
      p.errRate = clamp(p.errRate, 0, 100);
      series.points.push(p);
    }
    out[svc.id] = series;
  });

  /* 注入故障：以 target 为中心，按拓扑距离衰减传播 */
  const dist = dependencyDistance(sc.target);
  Object.keys(out).forEach(id => {
    const s = SERVICES.find(x => x.id === id);
    const d = dist[id] == null ? 99 : dist[id];
    if (d > 4) return;
    const amp = Math.pow(0.62, d);           // 距离越远影响越弱
    const onset = t0 + d * 1.6;                // 传播有延迟
    const pts = out[id].points;
    for (let m = Math.floor(onset); m < pts.length; m++) {
      const grow = clamp((m - onset) / 6, 0, 1);   // 6 分钟内爬升
      const f = amp * grow * (0.75 + 0.5 * Math.sin(m * 0.7 + id.length));
      const p = pts[m];
      if (sc.metric === 'poolWait') {
        p.poolWait += 180 * f; p.p95 += 260 * f; p.p50 += 90 * f; p.errRate += 6 * f; p.cpu += 12 * f;
      } else if (sc.metric === 'hitRate') {
        p.hitRate -= 42 * f; p.p95 += 150 * f; p.errRate += 3.4 * f;
      } else if (sc.metric === 'lag') {
        p.lag += 42000 * f; p.p95 += 70 * f; p.cpu += 6 * f;
      } else if (sc.metric === 'timeout') {
        p.timeout += 42 * f; p.p95 += 320 * f; p.errRate += 7.5 * f; p.poolWait += 40 * f;
      }
    }
  });
  return { scenario: sc.id, minutes, points: out, injectedAt: t0 };
}

/* target 到各「下游」受影响节点的最短依赖距离
   方向：target 出故障 → 依赖 target 的服务受影响（target 的上游受害）。
   例：db 故障 → order/pay/cart/stock 变慢 → gw 变慢。           */
export function dependencyDistance(targetId) {
  const dist = {}; dist[targetId] = 0;
  let frontier = [targetId], d = 0;
  while (frontier.length && d < 6) {
    d++;
    const next = [];
    frontier.forEach(id => {
      SERVICES.forEach(svc => {
        if (svc.deps.includes(id) && dist[svc.id] == null) {
          dist[svc.id] = d; next.push(svc.id);
        }
      });
    });
    frontier = next;
  }
  return dist;
}

/* ── 异常检测：基线窗口 + z-score 判定 ─────────────────
   基线只取序列前段（故障注入前），避免被故障段自身抬高；
   再用 EWMA 做短时波动抑制，兼顾「阶跃」与「尖刺」。      */
export function detectAnomalies(metrics, key = 'p95', sigma = 2.2) {
  const out = [];
  const baseEnd = Math.max(8, Math.floor(metrics.minutes * 0.45));
  Object.keys(metrics.points).forEach(id => {
    const s = metrics.points[id];
    const arr = s.points.map(p => p[key]);

    // 基线窗口：前 baseEnd 个点的均值与标准差
    const base = arr.slice(0, baseEnd);
    const mean = base.reduce((a, b) => a + b, 0) / base.length;
    const variance = base.reduce((a, b) => a + (b - mean) ** 2, 0) / base.length;
    const sd = Math.sqrt(variance) || 1e-6;

    // EWMA（w=0.3）平滑后的当前值，抑制单点噪声
    const w = 0.3;
    let ew = arr[0];
    for (let i = 1; i < arr.length - 1; i++) ew = ew * (1 - w) + arr[i] * w;
    const cur = ew;

    // 取「故障后窗口」的最大值做判定：持续性故障的最大值更可靠
    let peak = 0, peakIdx = 0;
    for (let i = baseEnd; i < arr.length; i++) {
      if (arr[i] > peak) { peak = arr[i]; peakIdx = i; }
    }
    const z = (peak - mean) / sd;
    if (z >= sigma) {
      out.push({
        id, key, z: +z.toFixed(2), value: +peak.toFixed(2),
        baseline: +mean.toFixed(2), sd: +sd.toFixed(2),
        at: peakIdx, current: +cur.toFixed(2)
      });
    }
  });
  return out.sort((a, b) => b.z - a.z);
}

/* ── 链路 trace 生成：用于 3D 粒子流与瀑布图 ────────── */
export function generateTraces(metrics, count = 90, seedSalt = 1) {
  const r = rng(hashSeed('trace#' + metrics.scenario + '#' + seedSalt));
  const traces = [];
  const anomalies = detectAnomalies(metrics, 'p95');
  const badSet = new Set(anomalies.slice(0, 3).map(a => a.id));

  for (let i = 0; i < count; i++) {
    const entry = SERVICES.find(s => s.id === 'gw');
    const hops = [];
    let cur = entry, depth = 0, acc = 0;
    const path = [cur];
    while (cur && depth < 6) {
      const s = SERVICES.find(x => x.id === cur.id);
      if (!s.deps.length) break;
      const nextId = s.deps[Math.floor(r() * s.deps.length)];
      const nx = SERVICES.find(x => x.id === nextId);
      const svc = metrics.points[nextId];
      const late = badSet.has(nextId);
      const p95 = svc.points[svc.points.length - 1].p95;
      const dur = late ? p95 * (0.9 + r() * 0.7) : 8 + r() * 26;
      acc += dur;
      hops.push({ id: nextId, name: nx.name, tier: nx.tier, dur: +dur.toFixed(1), start: +(acc - dur).toFixed(1), error: late && r() < 0.22 });
      cur = nx; path.push(nx); depth++;
    }
    const total = acc;
    const failed = hops.some(h => h.error);
    traces.push({
      id: 'tr-' + (1000 + i),
      path: path.map(p => p.id),
      hops,
      total: +total.toFixed(1),
      status: failed ? 'error' : (total > 600 ? 'slow' : 'ok'),
      ts: Math.floor(r() * 60)
    });
  }
  return traces;
}

/* ── 根因分析：劣化幅度 × 拓扑扇出 × 注入点 ─────────── */
export function analyzeRootCause(metrics, traces) {
  const anomalies = detectAnomalies(metrics, 'p95');
  const errAnom = detectAnomalies(metrics, 'errRate', 1.5);
  const poolAnom = detectAnomalies(metrics, 'poolWait', 1.2);
  const merged = new Map();
  const add = (list, w) => list.forEach(a => {
    const cur = merged.get(a.id) || { id: a.id, score: 0, z: a.z, reasons: [] };
    cur.score += w * (a.z || 0);
    cur.reasons.push({ key: a.key, z: a.z, weight: w });
    merged.set(a.id, cur);
  });
  add(anomalies, 1.0);
  add(errAnom, 0.8);
  add(poolAnom, 0.6);

  // 各服务在 trace 中作为「错误首跳」出现频次
  const failCount = {};
  traces.forEach(t => {
    const bad = t.hops.find(h => h.error);
    if (bad) failCount[bad.id] = (failCount[bad.id] || 0) + 1;
  });
  const errTotal = Math.max(1, traces.filter(t => t.status === 'error').length);

  const sc = SCENARIOS.find(s => s.id === metrics.scenario);
  const target = sc ? sc.target : null;

  const list = [...merged.values()].map(m => {
    const svc = SERVICES.find(s => s.id === m.id);
    const fail = failCount[m.id] || 0;
    const failRate = (fail / errTotal) * 100;
    // 扇出：有多少个服务直接依赖我（我坏了就影响它们）
    const fanout = SERVICES.filter(s => s.deps.includes(m.id)).length;
    const isTarget = m.id === target;

    // 评分：异常强度为主，扇出与注入点为权重修正
    let score = m.score * 5 + fanout * 4.5 + (isTarget ? 26 : 0);
    // 数据层出现连接池类异常 → 典型根因特征
    if (svc && svc.tier === 'data' && m.reasons.some(x => x.key === 'poolWait')) score += 14;
    // 外部依赖超时 → 根因可能性高
    if (svc && svc.tier === 'ext') score += 6;
    // 扇出为 0 的服务不可能是根因（没人依赖它）
    if (fanout === 0 && !isTarget) score *= 0.35;
    // 扇出 1 的服务也很弱（只影响一个上游）
    if (fanout === 1 && !isTarget) score *= 0.6;

    return {
      id: m.id, name: svc ? svc.name : m.id, tier: svc ? svc.tier : 'biz',
      score: +score.toFixed(1), z: m.z, failCount: fail,
      failRate: +failRate.toFixed(1), fanout, isRoot: isTarget,
      reasons: m.reasons.sort((a, b) => b.weight - a.weight)
    };
  }).sort((a, b) => b.score - a.score);

  const total = list.reduce((a, b) => a + b.score, 0) || 1;
  list.forEach(x => x.share = +((x.score / total) * 100).toFixed(1));
  return list;
}

/* ── 资源使用率合成（3D 柱体高度） ──────────────────── */
export function serviceLoad(metrics, id) {
  const s = metrics.points[id];
  if (!s) return { cpu: 0, qps: 0, err: 0 };
  const p = s.points[s.points.length - 1];
  return {
    cpu: clamp(p.cpu / 100, 0, 1),
    qps: clamp(p.qps / 140, 0, 1),
    err: clamp(p.errRate / 8, 0, 1),
    p95: p.p95
  };
}

/* ── 归因总结文本（用于报告区） ──────────────────────── */
export function buildSummary(metrics, roots, traces) {
  const sc = SCENARIOS.find(s => s.id === metrics.scenario);
  if (!roots.length) return '当前未检出显著异常，链路指标处于基线区间。';
  const top = roots[0];
  const errs = traces.filter(t => t.status === 'error').length;
  const slow = traces.filter(t => t.status === 'slow').length;
  const lines = [];
  lines.push(`场景：${sc.name}。在第 ${metrics.injectedAt} 分钟观察到指标阶跃，`
    + `本轮采样 ${traces.length} 条链路，其中错误 ${errs} 条、慢响应 ${slow} 条。`);
  lines.push(`根因判定：${top.name}（贡献度 ${top.share}%）。`
    + (top.isRoot ? '该节点是故障注入点，且被 ' + top.fanout + ' 个上游服务直接依赖，扇出最广。'
      : '该节点自身无直接故障证据，但上游异常向其汇聚，属于「受害节点」而非根因。'));
  if (roots[1]) {
    lines.push(`次级嫌疑：${roots[1].name}（${roots[1].share}%），`
      + `错误首跳占比 ${roots[1].failRate}%，扇出 ${roots[1].fanout}。`);
  }
  lines.push(`处置建议：优先隔离 ${top.name} 并回滚其最近变更；`
    + `同时对 ${(roots[1] ? roots[1].name : top.name)} 做限流，防止级联雪崩。`);
  return lines.join('\n');
}
