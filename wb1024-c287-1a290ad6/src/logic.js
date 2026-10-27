
'use strict';
/* ============================================================
   集中数据配置（品牌 / 联系 / 社交 / 简介）
   ============================================================ */
const DATA = {
  brand: 'IRON PLANNER',
  name: 'IRON PLANNER',
  email: 'hello@example.com',
  year: '2026',
  bio: '基于 JTS 线性/交替双 SRA 模型的力量举周期化训练系统。',
  socials: [
    { n: 'IG', u: '#' }, { n: 'YT', u: '#' }, { n: 'X', u: '#' }, { n: 'WB', u: '#' },
  ],
};

/* ============================================================
   工具
   ============================================================ */
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r25 = v => Math.round(v / 2.5) * 2.5;
const pad2 = n => String(n).padStart(2, '0');
const fmtTime = s => pad2(Math.floor(s / 60)) + ':' + pad2(Math.floor(s % 60));
function fmtAgo(ms) {
  const h = ms / 36e5;
  if (h < 1) return Math.max(1, Math.round(h * 60)) + ' 分钟前';
  if (h < 48) return h.toFixed(1) + ' 小时前';
  return (h / 24).toFixed(1) + ' 天前';
}
function todayStr(d) { d = d || new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
const IS_TOUCH = window.matchMedia && matchMedia('(pointer: coarse)').matches;
const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   肌群定义（17 个部位）与状态模型
   ============================================================ */
const MUSCLES = {
  chest: { name: '胸大肌', R: 60 }, frontDelts: { name: '三角肌前束', R: 48 },
  midDelts: { name: '三角肌中束', R: 42 }, rearDelts: { name: '三角肌后束', R: 42 },
  triceps: { name: '肱三头肌', R: 48 }, biceps: { name: '肱二头肌', R: 44 },
  forearms: { name: '前臂肌群', R: 40 }, back: { name: '背阔肌 / 下背', R: 72 },
  traps: { name: '斜方肌', R: 52 }, glutes: { name: '臀大肌', R: 64 },
  quads: { name: '股四头肌', R: 64 }, hamstrings: { name: '腘绳肌', R: 64 },
  adductors: { name: '髋内收肌', R: 52 }, abductors: { name: '髋外展肌', R: 48 },
  gastroc: { name: '腓肠肌', R: 40 }, tibialis: { name: '胫骨前肌', R: 36 },
  core: { name: '腹肌 / 侧腹', R: 48 },
};
const SRA_STATES = {
  fatigue: { label: '疲劳', color: '#E23B32', idx: 0 },
  recover: { label: '恢复中', color: '#F2C230', idx: 1 },
  nearSuper: { label: '接近超量恢复', color: '#22B3A5', idx: 2 },
  super: { label: '超量恢复', color: '#3E9B4F', idx: 3 },
  adapted: { label: '已适应', color: '#1E40AF', idx: 4 },
  fresh: { label: '可训练', color: '#3B82F6', idx: 5 },
};
const SRA_TRACK = ['fatigue', 'recover', 'nearSuper', 'super', 'adapted'];

/* ============================================================
   动作库
   ============================================================ */
const EXPRO = {
  '低杠深蹲': { tier: 'M', base: 'squat', ratio: 1, rest: 300, m: { quads: 1, glutes: .9, hamstrings: .55, adductors: .8, back: .55, core: .5 } },
  '高杠深蹲': { tier: 'T1', base: 'squat', ratio: .9, rest: 240, m: { quads: 1, glutes: .7, hamstrings: .45, core: .5 } },
  '前蹲': { tier: 'T1', base: 'squat', ratio: .82, rest: 240, m: { quads: 1, glutes: .55, core: .85, back: .4 } },
  '暂停深蹲': { tier: 'T1', base: 'squat', ratio: .85, rest: 240, m: { quads: 1, glutes: .8, hamstrings: .5, core: .6, back: .5 } },
  '箱式深蹲': { tier: 'T1', base: 'squat', ratio: .92, rest: 240, m: { glutes: 1, hamstrings: .75, quads: .65, back: .5 } },
  '满握距卧推': { tier: 'M', base: 'bench', ratio: 1, rest: 300, m: { chest: 1, frontDelts: .7, triceps: .8 } },
  '窄距卧推': { tier: 'T1', base: 'bench', ratio: .9, rest: 240, m: { triceps: 1, chest: .7, frontDelts: .5 } },
  'Spoto卧推': { tier: 'T1', base: 'bench', ratio: .92, rest: 240, m: { chest: .9, triceps: .9, frontDelts: .55 } },
  '暂停卧推': { tier: 'T1', base: 'bench', ratio: .85, rest: 240, m: { chest: 1, triceps: .8, frontDelts: .55 } },
  '上斜卧推': { tier: 'T1', base: 'bench', ratio: .82, rest: 240, m: { chest: .9, frontDelts: 1, triceps: .6 } },
  '传统硬拉': { tier: 'M', base: 'convDL', ratio: 1, rest: 300, m: { hamstrings: 1, glutes: .9, back: 1, traps: .7, forearms: .6, core: .7, adductors: .4 } },
  '相扑硬拉': { tier: 'M', base: 'sumoDL', ratio: 1, rest: 300, m: { glutes: 1, adductors: 1, hamstrings: .7, back: .8, core: .65, forearms: .55 } },
  '暂停硬拉': { tier: 'T1', base: 'convDL', ratio: .85, rest: 240, m: { hamstrings: 1, glutes: .8, back: 1, core: .7 } },
  '架上拉': { tier: 'T1', base: 'convDL', ratio: 1.15, rest: 240, m: { back: 1, traps: .9, glutes: .7, hamstrings: .5, forearms: .6 } },
  '赤字硬拉': { tier: 'T1', base: 'convDL', ratio: .85, rest: 240, m: { hamstrings: 1, glutes: .85, back: .9, adductors: .5 } },
  '速度硬拉': { tier: 'T1', base: 'convDL', ratio: .6, rest: 180, m: { hamstrings: .8, glutes: .8, back: .7, traps: .5 } },
  '罗马尼亚硬拉': { tier: 'T2', rest: 120, m: { hamstrings: 1, glutes: .8, back: .6 } },
  '哑铃卧推': { tier: 'T2', rest: 120, m: { chest: .9, frontDelts: .7, triceps: .6 } },
  '哑铃划船': { tier: 'T2', rest: 120, m: { back: .9, biceps: .6, rearDelts: .5, forearms: .4 } },
  '杠铃划船': { tier: 'T2', rest: 120, m: { back: .9, biceps: .5, rearDelts: .5 } },
  '引体向上': { tier: 'T2', rest: 120, m: { back: 1, biceps: .8, rearDelts: .6, core: .4, forearms: .5 } },
  '高位下拉': { tier: 'T2', rest: 120, m: { back: 1, biceps: .6, rearDelts: .4 } },
  '臀推': { tier: 'T2', rest: 120, m: { glutes: 1, hamstrings: .5 } },
  '腿举': { tier: 'T2', rest: 120, m: { quads: .9, glutes: .7, hamstrings: .4 } },
  '腿弯举': { tier: 'T2', rest: 120, m: { hamstrings: 1 } },
  '腿屈伸': { tier: 'T2', rest: 120, m: { quads: 1 } },
  '坐姿推举': { tier: 'T2', rest: 120, m: { frontDelts: .9, midDelts: .7, triceps: .6 } },
  '侧平举': { tier: 'T2', rest: 90, m: { midDelts: 1 } },
  '反向飞鸟': { tier: 'T2', rest: 90, m: { rearDelts: 1, back: .3 } },
  '三头下压': { tier: 'T2', rest: 90, m: { triceps: 1 } },
  '二头弯举': { tier: 'T2', rest: 90, m: { biceps: 1, forearms: .4 } },
  '提踵': { tier: 'T2', rest: 90, m: { gastroc: 1 } },
  '弹力带髋外展': { tier: 'T2', rest: 90, m: { abductors: 1, glutes: .5 } },
  '侧弓步': { tier: 'T2', rest: 90, m: { adductors: 1, glutes: .4, quads: .4 } },
  '健腹轮': { tier: 'T2', rest: 120, m: { core: 1, back: .4, frontDelts: .3 } },
  '平板支撑': { tier: 'T2', rest: 90, m: { core: 1, glutes: .3 } },
  '山羊挺身': { tier: 'T2', rest: 120, m: { back: 1, glutes: .6, hamstrings: .5 } },
};
const ACCESSORIES = [
  { name: '暂停深蹲', tier: 'T1', def: true }, { name: '高杠深蹲', tier: 'T1', def: true },
  { name: '前蹲', tier: 'T1', def: false }, { name: '箱式深蹲', tier: 'T1', def: false },
  { name: '窄距卧推', tier: 'T1', def: true }, { name: 'Spoto卧推', tier: 'T1', def: false },
  { name: '暂停卧推', tier: 'T1', def: true }, { name: '上斜卧推', tier: 'T1', def: false },
  { name: '暂停硬拉', tier: 'T1', def: true }, { name: '架上拉', tier: 'T1', def: true },
  { name: '赤字硬拉', tier: 'T1', def: false }, { name: '速度硬拉', tier: 'T1', def: false },
  { name: '罗马尼亚硬拉', tier: 'T2', def: true }, { name: '哑铃卧推', tier: 'T2', def: true },
  { name: '杠铃划船', tier: 'T2', def: true }, { name: '哑铃划船', tier: 'T2', def: false },
  { name: '引体向上', tier: 'T2', def: true }, { name: '高位下拉', tier: 'T2', def: false },
  { name: '面拉', tier: 'T2', def: true }, { name: '肩袖外旋', tier: 'T3', def: false },
  { name: '臀推', tier: 'T2', def: true }, { name: '腿举', tier: 'T2', def: true },
  { name: '腿弯举', tier: 'T2', def: true }, { name: '腿屈伸', tier: 'T2', def: false },
  { name: '坐姿推举', tier: 'T2', def: false }, { name: '侧平举', tier: 'T2', def: false },
  { name: '反向飞鸟', tier: 'T2', def: false }, { name: '三头下压', tier: 'T2', def: true },
  { name: '二头弯举', tier: 'T2', def: false }, { name: '提踵', tier: 'T2', def: true },
  { name: '弹力带髋外展', tier: 'T2', def: false }, { name: '侧弓步', tier: 'T2', def: false },
  { name: '健腹轮', tier: 'T2', def: true }, { name: '平板支撑', tier: 'T2', def: false },
  { name: '山羊挺身', tier: 'T2', def: false },
];

/* ============================================================
   卧推 18 日大循环（严格模板 · 两种模型共用）
   ============================================================ */
const BENCH_FLAT = (() => {
  const loops = [
    { add: [0, 5, 10, 15], reps: [7, 5, 3, 1] },
    { add: [0, 5, 10, 15], reps: [8, 6, 4, 2] },
    { add: [0, 5, 10, 15, 20], reps: [9, 7, 5, 3, 1] },
    { add: [0, 5, 10, 15, 20], reps: [10, 8, 6, 4, 2] },
  ];
  const flat = [];
  loops.forEach((L, li) => L.add.forEach((a, i) => flat.push({ add: a, reps: L.reps[i], loop: li + 1, idx: i + 1, total: L.add.length })));
  return flat;
})();

/* ============================================================
   JTS 双周期模型
   线性：强度沿周线性爬升（块状）
   交替：轻→中→重三周波浪，逐浪上漂（参考 UHF 波浪递增与 JTS 交替模型）
   ============================================================ */
/* 三档独立周期模板（A=增肌 I=增力 R=冲刺 D=减载 T=极限测试，最后一周恒为 T）
   按手册进减比：增肌 4:1、增力 3:1、冲刺 3:2 —— 每个阶段末插入 1 周减载 D */
const CYCLES = {
  9:  'AAADIIIRT',      // 3增肌+减载 + 3增力 + 1冲刺 + 1极限测试
  12: 'AAAADIIIIRRT',   // 4增肌+减载 + 4增力 + 2冲刺 + 1极限测试
  15: 'AAAAADIIIIIRRRT',// 5增肌+减载 + 5增力 + 3冲刺 + 1极限测试
};
function phaseSplit(w) {
  const seq = CYCLES[w];
  if (seq) return seq.split('');
  // 兼容旧 8/12/16 选择（向下兼容）
  if (w <= 8) return 'AAAIIIRD'.split('').slice(0, w);
  if (w <= 12) return ['A', 'A', 'A', 'A', 'I', 'I', 'I', 'I', 'R', 'R', 'R', 'D'].slice(0, w);
  return ['A', 'A', 'A', 'A', 'A', 'I', 'I', 'I', 'I', 'I', 'R', 'R', 'R', 'R', 'D', 'D'].slice(0, w);
}
const PHASE = {
  A: { name: '增肌期', cls: 'A', desc: '目标：增加肌肉量、提升训练容量、避免适应性抵抗。容量贴近 MEV→MRV，强度 65-75% 1RM。' },
  I: { name: '增力期', cls: 'I', desc: '目标：提升力量、发展比赛动作技术、维持肌肉量。强度 80-87% 1RM，控制疲劳积累。' },
  R: { name: '冲刺期', cls: 'R', desc: '目标：强化比赛动作技术、提升神经系统力量输出。强度 88-93%+，低容量峰值化。' },
  D: { name: '减载周', cls: 'D', desc: '容量 -40~60%、强度 -10~15%（RPE ≤6）。消除累积疲劳、推高 SRA 峰值；卧推降为轻量技术组，不计进阶。' },
  T: { name: '极限测试', cls: 'T', desc: '本周为每周期最后一周年。每项主项做真实 1RM 单次测试（建议 3-4 次逐步加重至 PR），辅助项目维持轻量热身。测后下一周期从 MEV 起步。' },
};
/* 线性模型：组次 × 强度 */
const SQ_SCHEME = { A: [5, 5, .72], I: [4, 3, .82], R: [3, 2, .90], D: [3, 3, .60], T: [1, 1, 1.00] };
const SQ_VAR_SCHEME = { A: [4, 6, .65], I: [3, 4, .72], R: [3, 3, .78], D: [3, 3, .55], T: [1, 1, .92] };
const DL_SCHEME = { A: [4, 4, .72], I: [3, 3, .82], R: [2, 1, .90], D: [3, 3, .60], T: [1, 1, 1.00] };
/* 交替模型：轻 / 中 / 重 三周波浪（[组,次,强度]），每完成一轮波浪强度上漂 */
const SQ_WAVE = {
  A: [[4, 6, .66], [4, 5, .73], [5, 4, .79]],
  I: [[4, 4, .76], [4, 3, .83], [3, 3, .87]],
  R: [[3, 3, .85], [3, 2, .89], [2, 2, .925]],
  D: [[3, 3, .60], [3, 3, .60], [3, 3, .60]],
};
const SQ_VAR_WAVE = {
  A: [[4, 6, .60], [3, 6, .65], [3, 5, .70]],
  I: [[3, 5, .68], [3, 4, .72], [3, 4, .76]],
  R: [[3, 3, .76], [3, 3, .80], [3, 2, .83]],
  D: [[3, 3, .55], [3, 3, .55], [3, 3, .55]],
};
const DL_WAVE = {
  A: [[3, 4, .64], [3, 3, .72], [4, 2, .78]],
  I: [[3, 3, .74], [3, 2, .81], [3, 2, .85]],
  R: [[2, 2, .84], [2, 1, .89], [2, 1, .92]],
  D: [[3, 3, .58], [3, 3, .58], [3, 3, .58]],
};
const WAVE_DRIFT = { A: .015, I: .015, R: .008, D: 0 };
const WAVE_LABEL = ['轻负荷周', '中负荷周', '重负荷周'];
function waveScheme(table, phase, w) {
  const pos = w % 3, cycle = Math.floor(w / 3);
  const s = table[phase][pos];
  return [s[0], s[1], Math.min(s[2] + WAVE_DRIFT[phase] * cycle, .96)];
}

/* ============================================================
   手册 9A.2 弱点 → 变式池（按选手弱点评级影响 T1 选择）
   ============================================================ */
const WEAK = {
  squat: {
    '': ['暂停深蹲', '高杠深蹲', '前蹲', '箱式深蹲'],
    stand: ['暂停深蹲', '前蹲', '箱式深蹲', '高杠深蹲'],
    bottom: ['暂停深蹲', '箱式深蹲', '高杠深蹲', '前蹲'],
    quads: ['前蹲', '高杠深蹲', '暂停深蹲', '箱式深蹲'],
  },
  bench: {
    '': ['暂停卧推', '窄距卧推', 'Spoto卧推', '上斜卧推'],
    offchest: ['暂停卧推', 'Spoto卧推', '窄距卧推', '上斜卧推'],
    lockout: ['窄距卧推', 'Spoto卧推', '暂停卧推', '上斜卧推'],
    chestless: ['上斜卧推', '暂停卧推', '窄距卧推', 'Spoto卧推'],
  },
  dead: {
    '': ['架上拉', '赤字硬拉', '暂停硬拉'],
    offfloor: ['赤字硬拉', '暂停硬拉', '架上拉'],
    lockout: ['架上拉', '暂停硬拉', '赤字硬拉'],
    lowback: ['架上拉', '暂停硬拉', '赤字硬拉'],
  },
};
function weakPool(cfg, group) {
  const kw = (cfg && cfg.weakness && cfg.weakness[group]) || '';
  return (WEAK[group] && WEAK[group][kw]) || WEAK[group][''];
}
/* 弱点对应的 T2 辅助池（用于低背/股四弱时把正确动作提到最前） */
function weakT2(cfg, kind) {
  const kw = (cfg && cfg.weakness && cfg.weakness[kind]) || '';
  if (kind === 'squat' && kw === 'quads') return ['腿举', '腿屈伸', '腿弯举', '健腹轮', '平板支撑', '山羊挺身', '提踵'];
  if (kind === 'dead' && kw === 'lowback') return ['山羊挺身', '罗马尼亚硬拉', '臀推', '腿弯举', '杠铃划船'];
  return null;
}

/* ============================================================
   手册 11.3 个体修正系数（睡眠 / 年龄 / 压力 / 经验）
   ============================================================ */
function recFactorFrom(c) {
  if (!c) return 1;
  let f = 1;
  if (c.sleep === '5') f *= 1.3; else if (c.sleep === '6') f *= 1.1;
  const age = parseFloat(c.age) || 0;
  if (age >= 50) f *= 1.4; else if (age >= 40) f *= 1.2;
  if (c.stress === 'high') f *= 1.15; else if (c.stress === 'med') f *= 1.05;
  if (c.exp === 'advanced') f *= 0.9;
  return Math.round(f * 100) / 100;
}

/* ============================================================
   Turn 3：除「极限测试周 T」外，所有训练日不再生成/显示热身组 —— 热身由用户自行决定。
   T 周由 buildMaxTestDay 单独生成递增组，不受此限制。
   ============================================================ */
function warmupFor(day, exName, ww, pct) { /* no-op：非极限测试周不生成热身组 */ }
/* 手册 22 章 RPE 目标：增肌 7-8 / 增力 8 / 冲刺 8-9 / 减载 ≤6 / 测试 10 */
const RPE_BY = { A: 'RPE 7-8', I: 'RPE 8', R: 'RPE 8-9', D: 'RPE ≤6', T: 'RPE 10' };

/* ============================================================
   状态管理
   ============================================================ */
const KEY4 = 'ironPlannerV4';
let state = {
  config: null, plan: null, currentWeek: 0,
  execution: {}, trainingLogs: [], feedback: [], adjustments: [],
  settings: { cursor: !IS_TOUCH, music: false },
  ui: { ballX: null, ballY: null, winX: null, winY: null },
};
function saveState() { try { localStorage.setItem(KEY4, JSON.stringify(state)); } catch (e) {} }
function loadState() {
  try {
    const s = localStorage.getItem(KEY4);
    if (s) { state = Object.assign(state, JSON.parse(s)); return; }
    /* 从 V3 迁移 */
    const v3 = localStorage.getItem('ironPlannerV3');
    if (v3) {
      const p = JSON.parse(v3);
      if (p.config) {
        const cfg = Object.assign({}, p.config, { cycleMode: 'linear' });
        state.config = cfg;
        try { state.plan = generatePlan(cfg); } catch (e) {}
      }
      if (Array.isArray(p.trainingLogs)) state.trainingLogs = p.trainingLogs;
      if (Array.isArray(p.adjustments)) state.adjustments = p.adjustments;
    }
  } catch (e) {}
}

/* ============================================================
   计划生成（双模型）
   ============================================================ */
function generatePlan(cfg) {
  const weeks = cfg.cycle, phases = phaseSplit(weeks);
  const sel = new Set(cfg.selectedAccessories || []);
  const mode = cfg.cycleMode || 'linear';
  const plan = [];
  let benchIdx = 0;
  for (let w = 0; w < weeks; w++) {
    const phase = phases[w];
    const seq = cfg.frequency === 3 ? ['squat', 'bench', 'dead']
      : cfg.frequency === 4 ? ['squat', 'bench', 'dead', 'bench']
      : ['squat', 'bench', 'dead', 'bench', 'squat2'];
    const days = seq.map((type, di) => {
      const day = { id: 'w' + (w + 1) + '_d' + (di + 1), type, phase, name: '', exercises: [], meta: { wavePos: w % 3 } };
      if (phase === 'T') {
        // 极限测试周：主项做真实 1RM 单次测试（热身→递增→PR）
        // 卧推每周 2 次：T 周内仅首次卧推做 1RM 极限测试，第二次改为 10RM 复测（大循环锚点），
        // 既避免「一周两次极限测试」，又让卧推大循环以复测收尾、完整闭环
        const benchBefore = seq.slice(0, di).filter(t => t === 'bench').length;
        if (type === 'bench' && benchBefore >= 1) buildBenchRetestDay(day, cfg, sel);
        else buildMaxTestDay(day, type, cfg, sel, w);
      } else if (type === 'squat') buildSquatDay(day, phase, cfg, sel, w, mode);
      else if (type === 'squat2') buildSquatVarDay(day, phase, cfg, sel, w, mode);
      else if (type === 'bench') {
        if (phase === 'D') { buildDeloadBenchDay(day, cfg, sel); }  /* 手册4.3：减载周降为轻量技术组 */
        else { buildBenchDay(day, cfg, sel, benchIdx); benchIdx++; }
      }
      else buildDeadliftDay(day, phase, cfg, sel, w, weeks, mode);
      /* 手册 6.1 RPE 目标标注（主项） */
      const mM = day.exercises.find(e => e.tier === 'M');
      if (mM && !mM.rpe) {
        if (phase === 'T') mM.rpe = 'RPE 10';
        else if (day.meta.wave) mM.rpe = day.meta.wave === '重负荷周' ? 'RPE 8-9' : day.meta.wave === '中负荷周' ? 'RPE 8' : 'RPE 7';
        else mM.rpe = RPE_BY[phase] || 'RPE 8';
      }
      return day;
    });
    plan.push({ week: w + 1, phase, days });
  }
  return plan;
}

/* 极限测试周：3-4 次渐进加重至真实 1RM PR（主项），辅助项目维持轻量热身 */
function buildMaxTestDay(day, type, cfg, sel, w) {
  const main1RM = (type === 'squat' || type === 'squat2') ? cfg.squat1RM
    : type === 'dead' ? (cfg.dlType === 'sumo' ? cfg.sumoDL1RM : cfg.convDL1RM)
    : null; // bench 走 10RM 体系
  if (type === 'squat') {
    day.name = '深蹲极限测试日 · 追 PR';
    day.exercises.push({ name: '深蹲热身①', sets: 1, reps: 5, weight: r25(main1RM * 0.50), tier: 'W' });
    day.exercises.push({ name: '深蹲热身②', sets: 1, reps: 3, weight: r25(main1RM * 0.70), tier: 'W' });
    day.exercises.push({ name: '深蹲热身③', sets: 1, reps: 1, weight: r25(main1RM * 0.85), tier: 'W' });
    day.exercises.push({ name: '深蹲递增①', sets: 1, reps: 1, weight: r25(main1RM * 0.90), tier: 'M' });
    day.exercises.push({ name: '深蹲递增②', sets: 1, reps: 1, weight: r25(main1RM * 0.95), tier: 'M' });
    day.exercises.push({ name: '深蹲 1RM 尝试', sets: 1, reps: 1, weight: r25(main1RM * 1.00), tier: 'PR' });
  } else if (type === 'squat2') {
    day.name = '深蹲变式测试日';
    const v = pickFirst(sel, ['高杠深蹲', '暂停深蹲', '前蹲', '箱式深蹲']) || '高杠深蹲';
    day.exercises.push({ name: v + ' 热身', sets: 2, reps: 5, weight: r25(main1RM * (EXPRO[v] ? EXPRO[v].ratio : 0.9) * 0.7), tier: 'W' });
    day.exercises.push({ name: v + ' PR 尝试', sets: 1, reps: 1, weight: r25(main1RM * (EXPRO[v] ? EXPRO[v].ratio : 0.9)), tier: 'PR' });
  } else if (type === 'dead') {
    day.name = '硬拉极限测试日 · 追 PR';
    day.exercises.push({ name: '硬拉热身①', sets: 1, reps: 5, weight: r25(main1RM * 0.50), tier: 'W' });
    day.exercises.push({ name: '硬拉热身②', sets: 1, reps: 3, weight: r25(main1RM * 0.70), tier: 'W' });
    day.exercises.push({ name: '硬拉热身③', sets: 1, reps: 1, weight: r25(main1RM * 0.85), tier: 'W' });
    day.exercises.push({ name: '硬拉递增①', sets: 1, reps: 1, weight: r25(main1RM * 0.90), tier: 'M' });
    day.exercises.push({ name: '硬拉递增②', sets: 1, reps: 1, weight: r25(main1RM * 0.95), tier: 'M' });
    day.exercises.push({ name: '硬拉 1RM 尝试', sets: 1, reps: 1, weight: r25(main1RM * 1.00), tier: 'PR' });
  } else if (type === 'bench') {
    // 卧推走 10RM 体系：测试周做 1RM 顶推（92%→96%→100% 试举递增，手册 7.3）
    const W = cfg.bench10RM;
    const est1RM = W / 0.75;
    day.name = '卧推极限测试日 · 追 PR';
    day.exercises.push({ name: '卧推热身①', sets: 1, reps: 5, weight: r25(W * 0.70), tier: 'W' });
    day.exercises.push({ name: '卧推热身②', sets: 1, reps: 1, weight: r25(est1RM * 0.85), tier: 'W' });
    day.exercises.push({ name: '卧推递增①', sets: 1, reps: 1, weight: r25(est1RM * 0.92), tier: 'M' });
    day.exercises.push({ name: '卧推递增②', sets: 1, reps: 1, weight: r25(est1RM * 0.96), tier: 'M' });
    day.exercises.push({ name: '卧推 1RM 尝试', sets: 1, reps: 1, weight: r25(est1RM), tier: 'PR' });
  }
  day.exercises.forEach(ex => {
    if (ex.base) return;
    if (ex.name.indexOf('卧推') >= 0) ex.base = '满握距卧推';
    else if (ex.name.indexOf('硬拉') >= 0) ex.base = cfg.dlType === 'sumo' ? '相扑硬拉' : '传统硬拉';
    else ex.base = '低杠深蹲';
  });
  day.meta.test = true;
}
function pickFirst(sel, arr) { for (const n of arr) if (sel.has(n)) return n; return null; }

function buildSquatDay(day, phase, cfg, sel, w, mode) {
  let sets, reps, pct;
  if (mode === 'wave') { [sets, reps, pct] = waveScheme(SQ_WAVE, phase, w); day.meta.wave = WAVE_LABEL[w % 3]; }
  else { [sets, reps, pct] = SQ_SCHEME[phase]; }
  day.name = '深蹲主项日';
  const mainW = r25(cfg.squat1RM * pct);
  day.exercises.push({ name: '低杠深蹲', sets, reps, weight: mainW, tier: 'M' });
  warmupFor(day, '低杠深蹲', mainW, pct);
  const t1 = pickFirst(sel, weakPool(cfg, 'squat'));
  if (t1) day.exercises.push({ name: t1, sets: 3, reps: mode === 'wave' && w % 3 === 0 ? 8 : 5, weight: r25(cfg.squat1RM * (EXPRO[t1].ratio || .9) * pct * .95), tier: 'T1' });
  const weakT2pool = weakT2(cfg, 'squat');
  const t2a = pickFirst(sel, weakT2pool || ['腿举', '腿弯举', '腿屈伸', '健腹轮', '平板支撑', '山羊挺身', '提踵']);
  if (t2a) day.exercises.push({ name: t2a, sets: 3, reps: 10, weight: null, tier: 'T2' });
  const t2b = pickFirst(sel, ['健腹轮', '平板支撑', '山羊挺身', '提踵'].filter(n => n !== t2a));
  if (t2b) day.exercises.push({ name: t2b, sets: 3, reps: 12, weight: null, tier: 'T2' });
}
function buildSquatVarDay(day, phase, cfg, sel, w, mode) {
  let sets, reps, pct;
  if (mode === 'wave') { [sets, reps, pct] = waveScheme(SQ_VAR_WAVE, phase, w); day.meta.wave = WAVE_LABEL[w % 3]; }
  else { [sets, reps, pct] = SQ_VAR_SCHEME[phase]; }
  const variant = pickFirst(sel, weakPool(cfg, 'squat')) || '高杠深蹲';
  day.name = '深蹲辅助日（变式）';
  const vw = r25(cfg.squat1RM * (EXPRO[variant].ratio || .9) * pct);
  day.exercises.push({ name: variant, sets, reps, weight: vw, tier: 'M' });
  warmupFor(day, variant, vw, pct);
  const core = pickFirst(sel, ['健腹轮', '平板支撑']);
  if (core) day.exercises.push({ name: core, sets: 3, reps: 10, weight: null, tier: 'T2' });
  const leg = pickFirst(sel, ['腿举', '腿弯举', '腿屈伸']);
  if (leg) day.exercises.push({ name: leg, sets: 3, reps: 12, weight: null, tier: 'T2' });
}
function buildBenchDay(day, cfg, sel, benchIdx) {  const spec = BENCH_FLAT[benchIdx % 18];
  const W = cfg.bench10RM;
  day.name = '卧推主项日';
  day.type = 'bench';
  day.meta = Object.assign(day.meta, { benchDay: benchIdx + 1, cycle: Math.floor(benchIdx / 18) + 1, loop: spec.loop, idx: spec.idx, total: spec.total, retest: benchIdx > 0 && benchIdx % 18 === 0 });
  day.exercises.push({ name: '满握距卧推', sets: 5, reps: spec.reps, weight: r25(W + spec.add), tier: 'M' });
  warmupFor(day, '满握距卧推', r25(W + spec.add), Math.min(1, (W + spec.add) / (W / 0.75)));
  const t1Pool = weakPool(cfg, 'bench').filter(n => sel.has(n));
  if (t1Pool.length) {
    const nm = t1Pool[benchIdx % t1Pool.length];
    day.exercises.push({ name: nm, sets: 3, reps: 6, weight: r25((W / 0.75) * (EXPRO[nm].ratio || .88) * .8), tier: 'T1' });
  }
  const push = pickFirst(sel, ['哑铃卧推', '坐姿推举', '三头下压', '侧平举']);
  if (push) day.exercises.push({ name: push, sets: 3, reps: 10, weight: null, tier: 'T2' });
  const pull = pickFirst(sel, ['杠铃划船', '哑铃划船', '引体向上', '高位下拉']);
  if (pull) day.exercises.push({ name: pull, sets: 3, reps: 10, weight: null, tier: 'T2' });
  /* 肩健康（手册 9A.2：卧推人群必配面拉/肩袖外旋，轻高次 RPE7） */
  const sh = pickFirst(sel, ['面拉', '肩袖外旋']);
  if (sh) day.exercises.push({ name: sh, sets: 3, reps: 15, weight: null, tier: 'T3' });
}
/* 手册 4.3：减载周卧推日 → 轻量技术组（W 或更低 3×5，RPE ≤6），不计入大循环正式进阶 */
function buildDeloadBenchDay(day, cfg, sel) {
  const W = cfg.bench10RM;
  day.name = '卧推减载日（轻量技术组 · RPE≤6）';
  day.meta = Object.assign(day.meta, { deloadBench: true });
  const tW = r25(W);
  day.exercises.push({ name: '满握距卧推（技术组）', sets: 3, reps: 5, weight: tW, tier: 'M', rpe: 'RPE ≤6' });
  warmupFor(day, '满握距卧推', tW, 0.8);
  const t1 = pickFirst(sel, ['窄距卧推', '暂停卧推', 'Spoto卧推', '上斜卧推']);
  if (t1) day.exercises.push({ name: t1, sets: 2, reps: 8, weight: r25((W / 0.75) * (EXPRO[t1].ratio || 0.88) * 0.60), tier: 'T1', rpe: 'RPE ≤6' });
  const push = pickFirst(sel, ['三头下压', '哑铃卧推', '侧平举']);
  if (push) day.exercises.push({ name: push, sets: 2, reps: 12, weight: null, tier: 'T2' });
}
function buildBenchRetestDay(day, cfg, sel) {
  const W = cfg.bench10RM;
  day.name = '卧推 10RM 复测日 · 大循环锚点复测';
  day.type = 'bench';
  day.meta = Object.assign(day.meta, { retest: true });
  day.exercises.push({ name: '满握距卧推 热身', sets: 1, reps: 5, weight: r25(W * 0.60), tier: 'W', base: '满握距卧推' });
  day.exercises.push({ name: '满握距卧推 热身', sets: 1, reps: 3, weight: r25(W * 0.75), tier: 'W', base: '满握距卧推' });
  day.exercises.push({ name: '满握距卧推 10RM 复测', sets: 1, reps: 10, weight: r25(W), tier: 'M', base: '满握距卧推', note: '做 1 组到力竭。若≥12 次 → 休 10-15min +5kg 重测；若≤7 次 → -5kg 重测；目标是恰好 10 次力竭（新 W\u0027）' });
  const t1 = pickFirst(sel, ['暂停卧推', '窄距卧推', 'Spoto卧推', '上斜卧推']);
  if (t1) day.exercises.push({ name: t1, sets: 3, reps: 8, weight: r25((W / 0.75) * (EXPRO[t1].ratio || 0.88) * 0.70), tier: 'T1' });
}
function buildDeadliftDay(day, phase, cfg, sel, w, weeks, mode) {
  const p = w / weeks;
  const heavy = w % 2 === 0;
  let mainName, mainMax;
  if (cfg.dlType === 'sumo') {
    const stance = p < 1 / 3 ? 'conv' : p < 2 / 3 ? (w % 2 === 0 ? 'conv' : 'sumo') : 'sumo';
    mainName = stance === 'sumo' ? '相扑硬拉' : '传统硬拉';
    mainMax = stance === 'sumo' ? cfg.sumoDL1RM : cfg.convDL1RM;
  } else {
    if (!heavy && w % 3 === 2) { mainName = '相扑硬拉'; mainMax = cfg.sumoDL1RM; }
    else { mainName = '传统硬拉'; mainMax = cfg.convDL1RM; }
  }
  if (mode === 'wave') {
    /* 交替模型：硬拉随三周波浪起伏 */
    const [sets, reps, pct] = waveScheme(DL_WAVE, phase, w);
    day.meta.wave = WAVE_LABEL[w % 3];
    day.name = '硬拉主项日（' + WAVE_LABEL[w % 3] + '）';
    const mw = r25(mainMax * pct);
    day.exercises.push({ name: mainName, sets, reps, weight: mw, tier: 'M' });
    warmupFor(day, mainName, mw, pct);
    if (w % 3 === 0) { /* 轻负荷周加变式容量 */
      const t1 = pickFirst(sel, weakPool(cfg, 'dead'));
      if (t1) day.exercises.push({ name: t1, sets: 3, reps: 5, weight: r25(mainMax * (EXPRO[t1].ratio || .85) * pct * .9), tier: 'T1' });
    }
  } else if (heavy) {
    const [sets, reps, pct] = DL_SCHEME[phase];
    day.name = '硬拉主项日（大重量）';
    const mw = r25(mainMax * pct);
    day.exercises.push({ name: mainName, sets, reps, weight: mw, tier: 'M' });
    warmupFor(day, mainName, mw, pct);
    const t1Pool = weakPool(cfg, 'dead').filter(n => sel.has(n));
    if (t1Pool.length) {
      const nm = t1Pool[w % t1Pool.length];
      day.exercises.push({ name: nm, sets: 3, reps: 5, weight: r25(mainMax * (EXPRO[nm].ratio || .85) * pct * .9), tier: 'T1' });
    }
  } else {
    day.name = '硬拉技术日（轻量/速度）';
    if (cfg.dlType === 'sumo' && mainName === '相扑硬拉') {
      day.exercises.push({ name: '相扑硬拉', sets: 5, reps: 3, weight: r25(cfg.sumoDL1RM * .6), tier: 'M' });
    } else if (cfg.dlType === 'conventional' && w % 3 === 2) {
      day.exercises.push({ name: '相扑硬拉', sets: 5, reps: 3, weight: r25(cfg.sumoDL1RM * .6), tier: 'M' });
    } else if (w % 2 === 1) {
      day.exercises.push({ name: '暂停硬拉', sets: 5, reps: 3, weight: r25(cfg.convDL1RM * .65), tier: 'M' });
    } else {
      day.exercises.push({ name: '速度硬拉', sets: 6, reps: 2, weight: r25(cfg.convDL1RM * (phase === 'D' ? .5 : .55)), tier: 'M' });
    }
    const t1 = pickFirst(sel, weakPool(cfg, 'dead'));
    if (t1) day.exercises.push({ name: t1, sets: 3, reps: 5, weight: r25(cfg.convDL1RM * .6), tier: 'T1' });
  }
  const weakT2pool = weakT2(cfg, 'dead');
  const t2a = pickFirst(sel, weakT2pool || ['罗马尼亚硬拉', '臀推', '腿弯举', '杠铃划船', '山羊挺身']);
  if (t2a) day.exercises.push({ name: t2a, sets: 3, reps: 10, weight: null, tier: 'T2' });
  const t2b = pickFirst(sel, ['山羊挺身', '健腹轮', '平板支撑', '腿弯举'].filter(n => n !== t2a));
  if (t2b) day.exercises.push({ name: t2b, sets: 3, reps: 12, weight: null, tier: 'T2' });
}
function weekAdjust(weekNum) {
  const adjs = state.adjustments.filter(a => a.week === weekNum);
  if (!adjs.length) return null;
  return {
    wPct: adjs.reduce((s, a) => s + (a.wPct || 0), 0),
    vol: adjs.reduce((s, a) => s + (a.vol || 0), 0),
    notes: adjs.flatMap(a => a.notes || []),
  };
}

/* ============================================================
   渲染：配置区
   ============================================================ */
let cfgMode = 'linear';
function renderAccessoryList() {
  $('accessoryList').innerHTML = ACCESSORIES.map(a =>
    '<label class="acc-item"><input type="checkbox" value="' + a.name + '"' + (a.def ? ' checked' : '') + '><span class="tier ' + a.tier + '">' + a.tier + '</span><span>' + a.name + '</span></label>'
  ).join('');
}

/* ============================================================
   渲染：计划区（拍立得 · 四色胶带 · 周次滚轴）
   ============================================================ */
function renderPlan() {
  const empty = $('planEmpty'), content = $('planContent');
  if (!state.plan) { empty.classList.remove('hide'); content.classList.add('hide'); return; }
  empty.classList.add('hide'); content.classList.remove('hide');
  state.currentWeek = clamp(state.currentWeek, 0, state.plan.length - 1);
  const slider = $('weekSlider');
  slider.max = state.plan.length - 1;
  slider.value = state.currentWeek;
  $('weekSliderVal').textContent = 'W' + (state.currentWeek + 1) + ' · ' + PHASE[state.plan[state.currentWeek].phase].name;
  $('weekStrip').innerHTML = state.plan.map(wk =>
    '<button class="wk-dot ' + wk.phase + (wk.week - 1 === state.currentWeek ? ' cur' : '') + '" data-w="' + (wk.week - 1) + '" title="第' + wk.week + '周 · ' + PHASE[wk.phase].name + '">' + wk.week + '</button>'
  ).join('');
  $('weekStrip').querySelectorAll('.wk-dot').forEach(b => b.addEventListener('click', () => setWeek(+b.dataset.w)));

  const wk = state.plan[state.currentWeek];
  $('weekTitle').textContent = '第 ' + wk.week + ' 周';
  $('phaseTag').textContent = PHASE[wk.phase].name;
  $('phaseTag').className = 'tag ' + PHASE[wk.phase].cls;
  const modeName = state.config && state.config.cycleMode === 'wave' ? '交替模型 · 波浪推进' : '线性模型 · 逐周爬升';
  $('weekCount').textContent = wk.week + ' / ' + state.plan.length + ' 周 · ' + wk.days.length + ' 练';
  /* 手册 20.4 容量熔断提示：单日总组数 >25 建议砍辅助 */
  const daySets = wk.days.map(d => d.exercises.reduce((a, e) => a + (e.sets || 0), 0));
  const maxSet = Math.max.apply(null, daySets);
  const overIdx = daySets.findIndex(s => s > 25);
  $('weekCount').innerHTML = wk.week + ' / ' + state.plan.length + ' 周 · ' + wk.days.length + ' 练 · 单日最多 ' + maxSet + ' 组' +
    (overIdx >= 0 ? ' <span style="color:var(--red)">⚠ D' + (overIdx + 1) + ' 组数超 25，建议先砍辅助</span>' : '');
  /* 手册 20.1 周历排布提示 */
  const SCHED = { 3: '排布：周一深蹲+卧推① / 周三硬拉 / 周五卧推②', 4: '排布：周一深蹲 / 周二卧推① / 周四硬拉 / 周五卧推②', 5: '排布：周一深蹲 / 周二卧推① / 周三硬拉 / 周四卧推② / 周五轻训' };
  $('phaseDesc').textContent = PHASE[wk.phase].desc + '【' + modeName + ' · ' + (SCHED[state.config.frequency] || '') + '】';

  const adj = weekAdjust(wk.week);
  $('adjChips').innerHTML = adj ? '<div class="adj-chip">⚙ 已按反馈调整：' +
    (adj.wPct ? '深蹲/硬拉主项重量 ' + (adj.wPct > 0 ? '+' : '') + (adj.wPct * 100).toFixed(1) + '%' : '') +
    (adj.vol ? (adj.wPct ? ' · ' : '') + '总组数 ' + (adj.vol > 0 ? '+' : '') + adj.vol : '') + '</div>' : '';

  const tapes = ['t0', 't1', 't2', 't3']; /* 红黄蓝绿 */
  $('dayCards').innerHTML = wk.days.map((day, i) => {
    const dlog = state.trainingLogs.find(l => l.dayId === day.id);
    const doneBadge = dlog ? '<span class="pl-done">' + (new Date(dlog.date).getTime() > Date.now() ? '✓ 已提前录入' : '✓ 已完成') + '</span>' : '';
    const main = day.exercises.find(e => e.tier === 'M' && e.weight != null) || day.exercises[0];
    const mainWeight = adj && main.tier === 'M' && main.name !== '满握距卧推' ? r25(main.weight * (1 + adj.wPct)) : main.weight;
    const mainSets = adj && main.tier === 'M' && main.name !== '满握距卧推' ? Math.max(1, main.sets + adj.vol) : main.sets;
    let benchBadge = '';
    if (day.meta && day.meta.benchDay) {
      benchBadge = '<span class="bench-cyc">大循环#' + day.meta.cycle + ' · 循环' + day.meta.loop + ' · 第' + day.meta.idx + '/' + day.meta.total + '日</span>' +
        (day.meta.retest ? ' <span class="bench-cyc retest">新大循环 · 建议重测 10RM</span>' : '');
    } else if (day.meta && day.meta.deloadBench) {
      benchBadge = '<span class="bench-cyc">减载周 · 轻量技术组</span>';
    } else if (day.meta && day.meta.retest) {
      benchBadge = '<span class="bench-cyc retest">新大循环 · 建议重测 10RM</span>';
    } else if (day.meta && day.meta.wave) {
      benchBadge = '<span class="bench-cyc">' + day.meta.wave + ' · W' + wk.week + '</span>';
    }
    return '<div class="polaroid" data-i="' + i + '">' +
      '<div class="tape ' + tapes[i % 4] + '"></div>' + doneBadge +
      '<div class="pl-day">W' + wk.week + ' · D' + (i + 1) + '</div>' +
      '<div class="pl-name">' + day.name + '</div>' +
      '<div class="pl-main"><div class="mn">' + main.name + '</div><div class="ms">' + (mainWeight != null ? mainWeight + ' kg' : '自重') + ' · ' + mainSets + '×' + main.reps + '</div>' + benchBadge + '</div>' +
      '<div class="pl-sub">' + day.exercises.filter(e => e !== main).map(e => '· ' + e.name + ' ' + (e.weight ? e.weight + 'kg' : '') + ' ' + e.sets + '×' + e.reps).join('<br>') + '</div>' +
      '</div>';
  }).join('');
  $('dayCards').querySelectorAll('.polaroid').forEach(c => c.addEventListener('click', () => openDayModal(wk, +c.dataset.i)));
}
let _weekRaf = 0;
function setWeek(w, immediate) {
  state.currentWeek = clamp(w, 0, state.plan.length - 1);
  saveState();
  if (immediate) { renderPlan(); renderTrain(); return; }
  if (_weekRaf) return;
  _weekRaf = requestAnimationFrame(() => { _weekRaf = 0; renderPlan(); renderTrain(); });
}

/* 仿桌面窗口 · 训练日详情（标题栏可拖拽） */
const winDrag = { x: 0, y: 0 };
function resetWinDrag(el) { winDrag.x = 0; winDrag.y = 0; if (el) el.style.transform = ''; }
/* —— 手册 6.1 RPE 目标 / 2.1 热身递增 —— */
function rpeHint(ex){
  if (ex.rpe) return ex.rpe;
  const r = ex.reps || 8;
  if (ex.tier === 'M') return r <= 1 ? 'RPE 9' : r <= 3 ? 'RPE 8-9' : r <= 6 ? 'RPE 8' : 'RPE 7-8';
  if (ex.tier === 'T1') return 'RPE 7-8';
  if (ex.tier === 'T3') return 'RPE 7 · 轻高次';
  return 'RPE 7-8';
}
function warmupSeq(ww){
  if (!ww) return '';
  const p = x => Math.round(x / 2.5) * 2.5;
  return '热身递增：空杆×10 → ' + p(ww*.5) + 'kg×5 → ' + p(ww*.6) + 'kg×3 → ' + p(ww*.7) + 'kg×2 → ' + p(ww*.8) + 'kg×1';
}
function openDayModal(week, idx) {
  const day = week.days[idx];
  $('dayModalTitle').textContent = 'W' + week.week + ' · D' + (idx + 1) + ' ' + day.name;
  $('dayModalBody').innerHTML =
    '<div style="font-size:11px;color:var(--ink-mute);margin-bottom:10px;font-family:var(--mono)">' + PHASE[week.phase].name + ' · ' + day.exercises.length + ' 个动作' + (day.meta.benchDay ? ' · 卧推第 ' + day.meta.benchDay + ' 日' : '') + (day.meta.wave ? ' · ' + day.meta.wave : '') + '</div>' +
    (week.phase === 'T' ? (function(){ var m0 = day.exercises.filter(function(e){ return e.tier === 'M'; })[0]; return (m0 && m0.weight) ? '<div style="font-size:10.5px;color:var(--ink-mute);margin:6px 0 10px;font-family:var(--mono)">' + warmupSeq(m0.weight) + '</div>' : ''; })() : '') + day.exercises.map((ex, i) => '<div class="win-ex"><div><div class="n">' + (i + 1) + '. ' + ex.name + ' <span class="ex-tier ' + ex.tier + '" style="font-size:9px">' + ex.tier + '</span></div><div class="s">' + (ex.weight != null ? ex.weight + ' kg · ' : '') + rpeHint(ex) + '</div></div><div class="w">' + ex.sets + ' 组 × ' + ex.reps + ' 次</div></div>').join('') +
    '<div style="margin-top:18px;text-align:center"><button class="btn btn-primary" id="startTrainFromModal">开始训练 →</button></div>';
  resetWinDrag($('dayWin'));
  $('dayModal').classList.add('show');
  $('startTrainFromModal').addEventListener('click', () => {
    $('dayModal').classList.remove('show');
    state.currentWeek = clamp(week.week - 1, 0, state.plan.length - 1);
    renderPlan(); renderTrain(day.id);
    location.hash = 'train';
  });
}

/* ============================================================
   渲染：训练执行区
   ============================================================ */
let currentTrainDayId = null;
let sessionStart = null;

function renderTrain(preferDayId) {
  const empty = $('trainEmpty'), content = $('trainContent');
  if (!state.plan) { empty.classList.remove('hide'); content.classList.add('hide'); return; }
  empty.classList.add('hide'); content.classList.remove('hide');
  const wk = state.plan[state.currentWeek];
  $('daySel').innerHTML = wk.days.map((d, i) => {
    const done = state.trainingLogs.some(l => l.dayId === d.id);
    return '<button class="ds-btn" data-id="' + d.id + '">D' + (i + 1) + ' ' + d.name + (done ? ' <span class="ok">✓</span>' : '') + '</button>';
  }).join('');
  $('daySel').querySelectorAll('.ds-btn').forEach(b => b.addEventListener('click', () => selectTrainDay(b.dataset.id)));
  const target = preferDayId && wk.days.some(d => d.id === preferDayId) ? preferDayId
    : (wk.days.some(d => d.id === currentTrainDayId) ? currentTrainDayId : wk.days[0].id);
  selectTrainDay(target);
}
function selectTrainDay(dayId) {
  const wk = state.plan[state.currentWeek];
  const day = wk.days.find(d => d.id === dayId);
  if (!day) return;
  currentTrainDayId = dayId;
  $('daySel').querySelectorAll('.ds-btn').forEach(b => b.classList.toggle('active', b.dataset.id === dayId));
  if (!sessionStart) sessionStart = Date.now();
  const log = state.trainingLogs.find(l => l.dayId === dayId);
  $('sessInfo').innerHTML = log
    ? (new Date(log.date).getTime() > Date.now()
      ? '<span>⏳ 已提前录入（' + new Date(log.date).toLocaleDateString('zh-CN') + ' · ' + log.duration + ' 分钟）· 日期到来前不影响恢复状态</span>'
      : '<span>✓ 已完成 · ' + new Date(log.date).toLocaleString('zh-CN') + ' · ' + log.duration + ' 分钟（可再次保存覆盖）</span>')
    : '<span>训练开始 ' + new Date(sessionStart).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) + '</span><span>已进行 <span id="sessElapsed">0</span> 分钟</span>';
  renderExecution(day);
}
function getExec(day) {
  if (!state.execution[day.id] || state.execution[day.id].length !== day.exercises.length) {
    state.execution[day.id] = day.exercises.map(ex => ({
      weight: ex.weight,
      sets: Array.from({ length: ex.sets }, () => ({ checked: false, reps: ex.reps })),
    }));
  }
  return state.execution[day.id];
}
function renderExecution(day) {
  const exec = getExec(day);
  $('executionList').innerHTML = day.exercises.map((ex, ei) =>
    '<div class="ex-item">' +
    '<div class="ex-hd"><span class="ex-name"><span class="ex-tier ' + ex.tier + '">' + ex.tier + '</span>' + (ei + 1) + '. ' + ex.name + '</span>' +
    '<span class="ex-load">' +
    (ex.weight != null ? '<input type="number" data-ex="' + ei + '" data-f="weight" value="' + (exec[ei].weight != null ? exec[ei].weight : ex.weight) + '" inputmode="decimal" step="2.5" min="0"> kg ·' : '自重 ·') +
    ' ' + ex.sets + '×' + ex.reps + '</span></div>' +
    exec[ei].sets.map((s, si) =>
      '<div class="set-row' + (s.checked ? ' checked' : '') + '">' +
      '<span class="set-idx">' + (si + 1) + '</span>' +
      '<input type="checkbox" data-ex="' + ei + '" data-set="' + si + '"' + (s.checked ? ' checked' : '') + ' aria-label="第' + (si + 1) + '组完成">' +
      '<span class="set-tgt">目标 ' + ex.reps + ' 次' + (ex.weight != null && exec[ei].weight != null ? ' @ ' + exec[ei].weight + 'kg' : '') + '</span>' +
      '<span class="set-reps"><button type="button" data-ex="' + ei + '" data-set="' + si + '" data-a="dec">−</button><input type="number" data-ex="' + ei + '" data-set="' + si + '" data-f="reps" value="' + s.reps + '" min="1" max="50" inputmode="numeric"><button type="button" data-ex="' + ei + '" data-set="' + si + '" data-a="inc">＋</button></span>' +
      '</div>'
    ).join('') + '</div>'
  ).join('');
  /* 勾选：不产生 SRA，仅弹出并启动组间休息倒计时 */
  $('executionList').querySelectorAll('input[type=checkbox]').forEach(cb => cb.addEventListener('change', () => {
    const ei = +cb.dataset.ex, si = +cb.dataset.set, day2 = curDay();
    const ex = day2.exercises[ei];
    getExec(day2)[ei].sets[si].checked = cb.checked;
    cb.closest('.set-row').classList.toggle('checked', cb.checked);
    saveState();
    if (cb.checked) { showTimerBall(); Timer.start((EXPRO[ex.name] || {}).rest || (ex.tier === 'W' ? 75 : 120)); }
  }));
  $('executionList').querySelectorAll('input[data-f=weight]').forEach(inp => inp.addEventListener('change', () => {
    const day2 = curDay(); const ei = +inp.dataset.ex;
    getExec(day2)[ei].weight = parseFloat(inp.value) || 0; saveState();
  }));
  $('executionList').querySelectorAll('input[data-f=reps]').forEach(inp => inp.addEventListener('change', () => setReps(inp, +inp.value)));
  $('executionList').querySelectorAll('.set-reps button').forEach(btn => btn.addEventListener('click', () => {
    const inp = $('executionList').querySelector('input[data-f=reps][data-ex="' + btn.dataset.ex + '"][data-set="' + btn.dataset.set + '"]');
    setReps(inp, (+inp.value || 1) + (btn.dataset.a === 'inc' ? 1 : -1));
  }));
}
function setReps(inp, v) {
  const day = curDay(); if (!day) return;
  v = clamp(Math.round(v) || 1, 1, 50);
  inp.value = v;
  getExec(day)[+inp.dataset.ex].sets[+inp.dataset.set].reps = v;
  saveState();
}
function curDay() {
  if (!state.plan) return null;
  const wk = state.plan[state.currentWeek];
  return wk.days.find(d => d.id === currentTrainDayId) || null;
}
function ensureCurDay() {
  let d = curDay();
  if (!d && state.plan) { renderTrain(); d = curDay(); }
  return d;
}
setInterval(() => {
  const el = $('sessElapsed');
  if (el && sessionStart) el.textContent = Math.floor((Date.now() - sessionStart) / 60000);
}, 30000);

/* ============================================================
   保存训练 → 生成 SRA（自动填充日期与时长 · 补录/提前录入）
   ============================================================ */
function openSaveModal() {
  const day = ensureCurDay(); if (!day) { showToast('请先生成计划并选择训练日'); return; }
  const exec = getExec(day);
  const existing = state.trainingLogs.find(l => l.dayId === day.id);
  const anyChecked = exec.some(e => e.sets.some(s => s.checked));
  if (!anyChecked && !existing && !confirm('本次尚未勾选任何组。直接保存将不产生 SRA 刺激，仍要保存吗？')) return;
  $('saveDate').value = todayStr(existing ? new Date(existing.date) : new Date());
  const lines = day.exercises.map((ex, ei) => {
    const done = exec[ei].sets.filter(s => s.checked);
    if (!done.length) return '<span style="color:var(--ink-mute)">' + ex.name + ' — 未完成</span>';
    const avg = Math.round(done.reduce((a, s) => a + s.reps, 0) / done.length);
    return ex.name + ' · ' + done.length + '/' + ex.sets + ' 组 · 平均 ' + avg + ' 次' + (exec[ei].weight != null ? ' @ ' + exec[ei].weight + 'kg' : '');
  });
  $('saveSummary').innerHTML = lines.join('<br>');
  const elapsed = sessionStart ? Math.max(10, Math.round((Date.now() - sessionStart) / 60000)) : 75;
  $('saveDuration').value = existing ? existing.duration : clamp(elapsed, 5, 300);
  $('saveModal').classList.add('show');
}
function confirmSave() {
  const day = ensureCurDay(); if (!day) return;
  const exec = getExec(day);
  const duration = clamp(parseInt($('saveDuration').value, 10) || 75, 5, 300);
  const dateStr = $('saveDate').value || todayStr();
  let iso;
  if (dateStr === todayStr()) iso = new Date().toISOString();
  else { const p = dateStr.split('-'); iso = new Date(+p[0], +p[1] - 1, +p[2], 12, 0, 0).toISOString(); }
  const log = {
    dayId: day.id, date: iso, duration,
    exercises: day.exercises.map((ex, ei) => {
      const done = exec[ei].sets.filter(s => s.checked);
      const sets = done.length;
      const reps = sets ? Math.round(done.reduce((a, s) => a + s.reps, 0) / sets) : ex.reps;
      return { name: ex.name, sets, reps, weight: exec[ei].weight != null ? exec[ei].weight : ex.weight, tier: ex.tier };
    }),
  };
  state.trainingLogs = state.trainingLogs.filter(l => l.dayId !== day.id);
  state.trainingLogs.push(log);
  saveState();
  $('saveModal').classList.remove('show');
  renderPlan(); renderTrain(day.id); renderSra(); renderFeedback();
  const dShow = (+dateStr.split('-')[1]) + '月' + (+dateStr.split('-')[2]) + '日';
  if (dateStr > todayStr()) showToast('已提前录入 ' + dShow + ' 的训练 · 该日期到来前不计入恢复状态');
  else if (dateStr < todayStr()) showToast('已补录 ' + dShow + ' 的训练 · SRA 已按该日期追溯恢复进度');
  else showToast('训练已保存（' + duration + ' 分钟）· SRA 状态已更新');
}

/* ============================================================
   SRA 计算（实际时长 × 刺激肌群 × 强度；未来记录不计入）
   ============================================================ */
function base1RMs() {
  const c = state.config || {};
  return { squat: c.squat1RM || 140, bench: (c.bench10RM || 75) / 0.75, convDL: c.convDL1RM || 180, sumoDL: c.sumoDL1RM || 165 };
}
function calcSra() {
  const now = Date.now(), bases = base1RMs();
  const recFactor = recFactorFrom(state.config);   /* 手册 11.3 个体修正系数 */
  const res = {};
  Object.keys(MUSCLES).forEach(id => { res[id] = { dose: 0, last: 0 }; });
  state.trainingLogs.forEach(log => {
    const t = new Date(log.date).getTime();
    if (isNaN(t) || t > now) return;
    const durF = clamp((log.duration || 60) / 75, 0.6, 1.5);
    (log.exercises || []).forEach(ex => {
      if (!ex.sets || ex.sets <= 0) return;
      if (ex.tier === 'W') return;                 /* 手册 2.1：热身不计容量与剂量 */
      const p = EXPRO[ex.name] || (ex.base && EXPRO[ex.base]); if (!p) return;
      let iF;
      if (p.base && ex.weight) iF = clamp(ex.weight / (bases[p.base] * (p.ratio || 1)), 0.4, 1.15);
      else iF = p.base ? 0.8 : (p.tier === 'T1' ? 0.7 : 0.55);
      Object.keys(p.m).forEach(mid => {
        if (!res[mid]) return;
        res[mid].dose += ex.sets * ex.reps * iF * p.m[mid] * (p.base ? 1.25 : 0.85) * durF;
        if (t > res[mid].last) res[mid].last = t;
      });
    });
  });
  Object.keys(res).forEach(id => {
    const d = res[id], R = Math.round(MUSCLES[id].R * recFactor), nowH = (now - d.last) / 36e5;
    d.hours = nowH;
    if (d.dose <= 0 || d.last === 0) { d.state = 'fresh'; d.pct = 100; d.scale = 0; d.cycleH = R; return; }
    const s = clamp(0.7 + d.dose / 45, 0.8, 1.9);
    d.scale = s; d.cycleH = Math.round(R * s);
    const Tf = R * 0.5 * s, Tr = R * 0.85 * s, Tp = R * 1.1 * s, Ta = R * 1.6 * s, Tfade = R * 2.4 * s;
    d.bounds = { Tf, Tr, Tp, Ta, Tfade };
    if (nowH < Tf) { d.state = 'fatigue'; d.pct = Math.round(10 + 35 * nowH / Tf); }
    else if (nowH < Tr) { d.state = 'recover'; d.pct = Math.round(45 + 30 * (nowH - Tf) / (Tr - Tf)); }
    else if (nowH < Tp) { d.state = 'nearSuper'; d.pct = Math.round(75 + 20 * (nowH - Tr) / (Tp - Tr)); }
    else if (nowH < Ta) { d.state = 'super'; d.pct = 100; }
    else if (nowH < Tfade) { d.state = 'adapted'; d.pct = 100; }
    else { d.state = 'fresh'; d.pct = 100; }
  });
  return res;
}
function sraTip(id, d) {
  if (!d.last) return '近期未受刺激，可随时安排训练。';
  const b = d.bounds || {};
  const rem = x => Math.max(1, Math.round(x - d.hours));
  switch (d.state) {
    case 'fatigue': return '疲劳期：约 ' + rem(b.Tf) + ' 小时后进入恢复期，避免直接再练该部位（可做低强度活动/拉伸）。';
    case 'recover': return '恢复中：再等约 ' + rem(b.Tr) + ' 小时将接近超量恢复窗口，建议耐心。';
    case 'nearSuper': return '正在进入超量恢复窗口，约 ' + rem(b.Tp) + ' 小时后到达峰值 —— 现在安排训练正是好时机。';
    case 'super': return '处于超量恢复峰值窗口（还剩约 ' + rem(b.Ta) + ' 小时），是下一次大重量训练的最佳时机。';
    case 'adapted': return '适应已形成且开始消退，可以安排下一次训练以维持适应。';
    default: return '已充分恢复（或未受近期刺激），随时可练。';
  }
}

/* ============================================================
   渲染：SRA 区（人体着色 · 卡片 · 详情联动）
   ============================================================ */
let selectedMuscle = null;
function renderSra() {
  const empty = $('sraEmpty'), content = $('sraContent');
  if (!state.trainingLogs.length) { empty.classList.remove('hide'); content.classList.add('hide'); return; }
  empty.classList.add('hide'); content.classList.remove('hide');
  const sra = calcSra();
  const nowT = Date.now();
  const pastLogs = state.trainingLogs.filter(l => new Date(l.date).getTime() <= nowT);
  const pool = pastLogs.length ? pastLogs : state.trainingLogs;
  const last = pool.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).pop();
  $('sraLast').textContent = (pastLogs.length ? '上次训练：' : '最近记录（提前录入）：') + new Date(last.date).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' · ' + last.duration + ' 分钟' + ' · 个体恢复系数 ×' + recFactorFrom(state.config) + '';
  $('legend').innerHTML = Object.keys(SRA_STATES).map(k => {
    const s = SRA_STATES[k];
    return '<span class="lg-item"><span class="lg-dot" style="background:' + s.color + '"></span>' + s.label + '</span>';
  }).join('');
  document.querySelectorAll('#bodySvg [data-muscle]').forEach(el => {
    const st = sra[el.dataset.muscle];
    el.classList.remove('s-fatigue', 's-recover', 's-nearSuper', 's-super', 's-adapted', 's-fresh');
    el.classList.add(st ? 's-' + st.state : 's-fresh');
  });
  $('muscleGrid').innerHTML = Object.keys(MUSCLES).map(id => {
    const m = MUSCLES[id], d = sra[id], st = SRA_STATES[d.state];
    return '<div class="m-card" data-m="' + id + '">' +
      '<div class="m-top"><span class="m-dot" style="background:' + st.color + '"></span><span class="m-name">' + m.name + '</span><span class="m-state" style="color:' + (d.state === 'recover' ? '#a8790a' : st.color) + '">' + st.label + '</span></div>' +
      '<div class="m-bar"><i style="width:' + d.pct + '%;background:' + st.color + '"></i></div>' +
      '<div class="m-sub">' + (d.last ? (() => { const ago = fmtAgo(Date.now() - d.last); const cyc = (d.cycleH && d.cycleH > 0) ? ' · 周期约 ' + d.cycleH + 'h' : ''; return ago + cyc; })() : '近期未受刺激') + '</div>' +
      '</div>';
  }).join('');
  $('muscleGrid').querySelectorAll('.m-card').forEach(c => c.addEventListener('click', () => toggleMuscle(c.dataset.m)));
  if (selectedMuscle) markSelected(selectedMuscle);
  const entries = Object.keys(sra).map(id => ({ id, d: sra[id] }));
  const fat = entries.filter(e => e.d.state === 'fatigue');
  const sup = entries.filter(e => e.d.state === 'super' || e.d.state === 'nearSuper');
  const ready = entries.filter(e => ['super', 'nearSuper', 'adapted', 'fresh'].includes(e.d.state));
  let txt;
  if (fat.length >= 4) txt = '当前 ' + fat.length + ' 个肌群处于疲劳状态（' + fat.slice(0, 4).map(e => MUSCLES[e.id].name).join('、') + ' 等），整体疲劳偏高 —— 建议安排主动恢复、低强度有氧或休息日，等待 SRA 曲线回升。';
  else if (sup.length >= 3) txt = '多个肌群正处于超量恢复窗口（' + sup.slice(0, 4).map(e => MUSCLES[e.id].name).join('、') + '），是冲击大重量主项的理想时机，建议优先安排深蹲/卧推/硬拉主项训练。';
  else if (ready.length >= 12) txt = '大部分肌群已恢复（' + ready.length + '/17 可训练）。可按计划推进，并保证睡眠与蛋白质摄入。';
  else txt = '各肌群恢复状态不均：避开仍疲劳的部位（' + (fat.map(e => MUSCLES[e.id].name).join('、') || '无') + '），优先训练恢复充分的肌群。';
  $('sraAdvice').querySelector('p').textContent = txt;
}
function markSelected(id) {
  document.querySelectorAll('#bodySvg [data-muscle]').forEach(el => el.classList.toggle('selected', el.dataset.muscle === id));
  document.querySelectorAll('.m-card').forEach(c => c.classList.toggle('selected', c.dataset.m === id));
}
function toggleMuscle(id) {
  if (selectedMuscle === id && $('mpop').classList.contains('show')) { closeMuscle(); return; }
  selectedMuscle = id;
  markSelected(id);
  const sra = calcSra(), d = sra[id], m = MUSCLES[id], st = SRA_STATES[d.state];
  $('mpName').textContent = m.name;
  $('mpDot').style.background = st.color;
  $('mpState').textContent = st.label;
  $('mpState').style.color = d.state === 'recover' ? '#a8790a' : st.color;
  const tag = $('mpStateTag');
  tag.textContent = d.pct + '% 恢复';
  tag.style.borderColor = st.color; tag.style.color = d.state === 'recover' ? '#a8790a' : st.color;
  $('mpPct').textContent = d.pct + '%';
  $('mpSince').textContent = d.last ? fmtAgo(Date.now() - d.last) : '—';
  $('mpCycle').textContent = '约 ' + d.cycleH + ' 小时';
  $('mpDose').textContent = d.dose ? d.dose.toFixed(1) : '0';
  $('mpTrack').innerHTML = SRA_TRACK.map(k => '<i class="' + (SRA_STATES[k].idx <= SRA_STATES[d.state].idx && d.state !== 'fresh' ? 'on' : '') + '" style="background:' + SRA_STATES[k].color + '"></i>').join('');
  $('mpTip').textContent = '下次训练建议：' + sraTip(id, d);
  $('mpop').classList.add('show');
}
function closeMuscle() {
  selectedMuscle = null;
  $('mpop').classList.remove('show');
  markSelected(null);
}

/* ============================================================
   反馈 → 下周动态调整
   ============================================================ */
// 0-3 数字按钮互斥点击（每组最多选一档；点击已选档则取消）
function initPainBtns() {
  document.querySelectorAll('#painPoints .pain-group').forEach(g => {
    g.querySelectorAll('.pain-num').forEach(b => {
      b.addEventListener('click', () => {
        const active = b.classList.contains('active');
        g.querySelectorAll('.pain-num').forEach(x => x.classList.remove('active'));
        if (!active) b.classList.add('active');
      });
    });
  });
}
// 收集疼痛点强度（每个肌群取最大档）
function collectPains() {
  const out = {};
  document.querySelectorAll('#painPoints .pain-group').forEach(g => {
    const a = g.querySelector('.pain-num.active');
    if (a) out[g.dataset.muscle] = +a.dataset.n;
  });
  return out;
}
function initFeedbackUI() {
  initPainBtns();
}
function submitFeedback() {
  if (!state.trainingLogs.length) { showToast('请先完成一次训练并保存'); return; }
  const latestLog = state.trainingLogs.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).pop();
  const painsMap = collectPains();
  const fb = {
    dayId: latestLog.dayId, date: new Date().toISOString(),
    rpe: parseFloat($('rpeSlider').value),
    fatigue: $('fatigueSelect').value, smooth: $('smoothSelect').value,
    pains: painsMap, painsLegacy: Object.keys(painsMap).filter(k => painsMap[k] > 0),
  };
  const weekNum = parseInt(fb.dayId.slice(1), 10) || state.currentWeek + 1;
  state.feedback = state.feedback.filter(f => f.dayId !== fb.dayId);
  state.feedback.push(fb);
  const adj = { week: weekNum + 1 <= (state.plan ? state.plan.length : 99) ? weekNum + 1 : weekNum, wPct: 0, vol: 0, notes: [] };
  const advice = [];
  if (fb.rpe >= 9.5) { adj.wPct -= 0.05; adj.notes.push('主项重量 -5%'); advice.push('RPE≥9.5 过高：下周深蹲/硬拉主项重量下调 5%，优先保证睡眠与恢复（卧推按 18 日模板严格执行，不做改动）。'); }
  else if (fb.rpe >= 9) { adj.wPct -= 0.025; adj.notes.push('主项重量 -2.5%'); advice.push('RPE 偏高：下周主项重量微调 -2.5%，控制组内留 1-2 次余力。'); }
  else if (fb.rpe <= 6 && fb.fatigue === 'low') { adj.wPct += 0.02; adj.notes.push('主项重量 +2%'); advice.push('状态轻松（RPE≤6 且疲劳低）：下周主项重量 +2%，尝试渐进超负荷。'); }
  if (fb.fatigue === 'high') { adj.vol -= 1; adj.notes.push('总组数 -1'); advice.push('整体疲劳度高：下周每个主项总组数 -1；若连续两周高疲劳，主动安排减载。'); }
  if (fb.smooth === 'poor') advice.push('动作顺畅度差：下次训练用暂停变式打磨技术，降速控杆。');
  // 疼痛点：按 0-3 强度给建议
  const PAIN_ADVICE = {
    '下背': { 1: '下背轻微不适：硬拉前做猫牛 + 90/90 髋热身，起杆前收紧核心抗伸展。',
              2: '下背中度疼痛：下周硬拉改罗马尼亚/架上/臀推替代 50% 主项容量，深蹲前充分热身竖脊肌。',
              3: '下背明显疼痛：本周停所有大重量硬拉与后蹲，只做自重臀桥 + 死虫子核心稳定 + 拉伸；3 天后复评。' },
    '肩':   { 1: '肩轻微不适：卧推前充分激活肩袖（弹力带外旋 + YTW），检查起桥与肩胛收紧。',
              2: '肩中度疼痛：本周卧推改地板卧推/上斜卧推，避免大重量过头位；肩袖 4 方向 2×15。',
              3: '肩明显疼痛：停大重量卧推与过头推举；48 小时冰敷 + 拉伸；复诊医生排除肩袖损伤。' },
    '膝':   { 1: '膝轻微不适：深蹲前泡沫轴放松股四远端 + 臀中肌激活；控制膝盖内扣。',
              2: '膝中度疼痛：深蹲改箱式/暂停深蹲控制深度（不低于平行）+ 慢速离心；避免跳跃与冲刺。',
              3: '膝明显疼痛：停大重量深蹲；保留保加利亚分腿蹲自重 + 臀中肌 4×15；尽快复诊排除半月板/韧带。' },
    '肘':   { 1: '肘轻微不适：卧推前做肱三头 + 前臂筋膜放松；避免三头孤立与大重量窄距卧推。',
              2: '肘中度疼痛：减少三头孤立 + 卧推握距微调（+2cm）+ 佩戴肘套；改地板卧推减少肘关节剪切。',
              3: '肘明显疼痛：停所有三头孤立与窄距卧推；改用壶铃摆 + 拉类动作保持容量；48 小时消炎处理。' },
    '腕':   { 1: '腕轻微不适：卧推前手腕绕环 + 屈腕拉伸；保持中立位。',
              2: '腕中度疼痛：卧推必须佩戴硬护腕 + 满握距握杆；避免手腕过伸。',
              3: '腕明显疼痛：暂停卧推；改地雷管架前推 + 哑铃推举（中立握）；复诊排除 TFCC 损伤。' },
    '髋':   { 1: '髋轻微不适：深蹲前 90/90 髋绕环 + 鸽子式拉伸 90s/侧；起蹲前激活臀中。',
              2: '髋中度疼痛：深蹲站距 +5cm + 暂停深蹲；硬拉改相扑/架上拉减低行程。',
              3: '髋明显疼痛：停大重量深蹲/硬拉；保留自重臀桥 + 侧卧抬腿；复诊排除盂唇损伤。' },
  };
  Object.keys(PAIN_ADVICE).forEach(muscle => {
    const lvl = painsMap[muscle];
    if (lvl >= 1 && PAIN_ADVICE[muscle][lvl]) advice.push(PAIN_ADVICE[muscle][lvl]);
  });
  if (adj.wPct === 0 && adj.vol === 0 && advice.length === 0) advice.push('本次训练状态良好：保持当前强度与容量，注意恢复节奏。');
  fb.advice = advice;
  state.adjustments = state.adjustments.filter(a => a.week !== adj.week);
  if (adj.wPct !== 0 || adj.vol !== 0) state.adjustments.push(adj);
  saveState();
  $('coachAdviceList').innerHTML = advice.map(a => '<li>' + a + '</li>').join('');
  $('coachAdvice').classList.remove('hide');
  renderPlan();
  showToast('反馈已提交 · 调整已应用到第 ' + adj.week + ' 周');
}
/* 渲染反馈面板：无训练记录显示空态，有记录显示表单 + 最近一次教练建议（submitFeedback 已存入 fb.advice，可跨刷新持久） */
function renderFeedback() {
  const hasLog = !!(state.trainingLogs && state.trainingLogs.length);
  const empty = $('feedbackEmpty'), content = $('feedbackContent');
  if (empty) empty.classList.toggle('hide', hasLog);
  if (content) content.classList.toggle('hide', !hasLog);
  const coach = $('coachAdvice'), list = $('coachAdviceList');
  if (!coach || !list) return;
  const fbs = state.feedback || [];
  if (!fbs.length) { list.innerHTML = ''; coach.classList.add('hide'); return; }
  const last = fbs[fbs.length - 1];
  if (last && Array.isArray(last.advice) && last.advice.length) {
    list.innerHTML = last.advice.map(a => '<li>' + a + '</li>').join('');
    coach.classList.remove('hide');
  } else if (last) {
    const d = last.date ? new Date(last.date) : null;
    const when = d && !isNaN(d) ? d.toLocaleDateString() : '';
    list.innerHTML = '<li>RPE ' + (last.rpe != null ? last.rpe : '-') + (last.fatigue ? ' · 疲劳 ' + last.fatigue : '') + (when ? ' · ' + when : '') + '</li>';
    coach.classList.remove('hide');
  } else { list.innerHTML = ''; coach.classList.add('hide'); }
}

/* ============================================================
   悬浮计时球（可关闭 · 勾选自动弹出） & 悬浮窗
   ============================================================ */
const RING_C = 2 * Math.PI * 35;
const Timer = {
  total: 300, left: 0, run: false, int: null, done: false,
  start(sec) {
    this.total = this.left = clamp(Math.round(sec) || 300, 5, 1800);
    this.run = true; this.done = false;
    this.ensureInt(); this.render();
    $('tBall').classList.remove('flash');
  },
  pause() { this.run = false; this.render(); },
  resume() { if (this.left > 0) { this.run = true; this.ensureInt(); this.render(); } },
  reset() { this.run = false; this.left = this.total; this.done = false; this.render(); },
  stop() { this.run = false; this.left = 0; this.done = false; this.render(); },
  ensureInt() {
    if (this.int) return;
    this.int = setInterval(() => {
      if (!Timer.run) return;
      Timer.left--;
      Timer.render();
      if (Timer.left <= 0) Timer.finish();
    }, 1000);
  },
  finish() {
    this.run = false; this.done = true; this.render();
    beep(); setTimeout(beep, 650); setTimeout(beep, 1300);
    if (navigator.vibrate) { try { navigator.vibrate([200, 100, 200]); } catch (e) {} }
    const b = $('tBall');
    b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash');
    showToast('组间休息结束，下一组！');
  },
  render() {
    const t = fmtTime(Math.max(0, this.left));
    $('tBallTime').textContent = (this.done || this.run || this.left > 0) ? t : '--:--';
    $('tBallLabel').textContent = this.run ? '休息中' : (this.done ? '完成' : (this.left > 0 ? '已暂停' : '休息'));
    $('tWinTime').textContent = t;
    $('tPauseBtn').textContent = this.run ? '暂停' : '继续';
    const frac = this.total > 0 ? clamp(this.left / this.total, 0, 1) : 0;
    $('tRing').style.strokeDasharray = RING_C;
    $('tRing').style.strokeDashoffset = RING_C * (1 - frac);
    $('tBall').classList.toggle('running', this.run);
  },
};
function beep() {
  try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    beep.ctx = beep.ctx || new C();
    const ctx = beep.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine'; o.frequency.value = 880;
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    o.start(); o.stop(ctx.currentTime + 0.6);
  } catch (e) {}
}
function showTimerBall() { $('tBall').style.display = 'flex'; }
function showTimerWin() { $('tWin').classList.remove('hide'); $('tBall').style.display = 'none'; }
function hideTimerAll() { $('tWin').classList.add('hide'); $('tBall').style.display = 'none'; Timer.stop(); }

function initTimerUI() {
  const ball = $('tBall'), win = $('tWin');
  const ui = state.ui || (state.ui = {});
  const place = (el, x, y) => {
    const w = el.offsetWidth || 76, h = el.offsetHeight || 76;
    el.style.left = clamp(x, 4, innerWidth - w - 4) + 'px';
    el.style.top = clamp(y, 4, innerHeight - h - 4) + 'px';
  };
  place(ball, ui.ballX != null ? ui.ballX : innerWidth - 96, ui.ballY != null ? ui.ballY : innerHeight - 220);
  // Win 默认居中；若保存位置离任一边 <14px（多半是旧版左上角默认值），视为无保存，重置居中
  const _winW = win.offsetWidth || 264, _winH = win.offsetHeight || 360;
  const _badEdge = (x, y) => x < 14 || y < 14 || x > innerWidth - 40 || y > innerHeight - 40;
  const _hasWinPos = ui.winX != null && ui.winY != null && !_badEdge(ui.winX, ui.winY);
  place(win, _hasWinPos ? ui.winX : Math.max(8, (innerWidth - _winW) / 2), _hasWinPos ? ui.winY : Math.max(8, (innerHeight - _winH) / 2));
  ball.style.right = 'auto'; ball.style.bottom = 'auto';

  function makeDraggable(el, handle, saveKey, onClick) {
    let sx = 0, sy = 0, ox = 0, oy = 0, moved = false, pid = null;
    handle.addEventListener('pointerdown', e => {
      if (e.target.closest('button,input,a,select,textarea,label')) return;
      pid = e.pointerId; handle.setPointerCapture(pid);
      sx = e.clientX; sy = e.clientY; ox = el.offsetLeft; oy = el.offsetTop; moved = false;
      e.preventDefault(); e.stopPropagation();
    });
    handle.addEventListener('pointermove', e => {
      if (pid === null) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      if (!moved) return;
      e.preventDefault();
      place(el, ox + dx, oy + dy);
    });
    const endDrag = e => {
      if (pid === null) return;
      try { handle.releasePointerCapture(pid); } catch (err) {}
      pid = null;
      if (moved) { state.ui[saveKey + 'X'] = el.offsetLeft; state.ui[saveKey + 'Y'] = el.offsetTop; saveState(); return; }
      if (onClick) onClick();
    };
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
  }
  makeDraggable(ball, ball, 'ball', () => {
    showTimerWin();
    // 若没有保存的 win 位置，则居中显示；否则保留已恢复的位置
    const ui2 = state.ui || {};
    if (ui2.winX == null || ui2.winY == null) {
      const w = win.offsetWidth || 264, h = win.offsetHeight || 360;
      place(win, Math.max(8, (innerWidth - w) / 2), Math.max(8, (innerHeight - h) / 2));
    }
  });
  /* 悬浮窗：整窗可拖（除按钮/输入框外），保证移动端可顺利拖动 */
  makeDraggable(win, win, 'win', null);

  $('tBallX').addEventListener('click', e => { e.stopPropagation(); hideTimerAll(); showToast('计时球已关闭 · 勾选组数时会自动弹出'); });
  $('tWinMin').addEventListener('click', () => { $('tWin').classList.add('hide'); showTimerBall(); });
  $('tStartBtn').addEventListener('click', () => Timer.start(parseInt($('tCustom').value, 10) || 300));
  $('tPauseBtn').addEventListener('click', () => Timer.run ? Timer.pause() : Timer.resume());
  $('tResetBtn').addEventListener('click', () => Timer.reset());
  document.querySelectorAll('#tPresets .tw-preset').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#tPresets .tw-preset').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    $('tCustom').value = b.dataset.s;
    Timer.start(+b.dataset.s);
  }));
  Timer.render();
  addEventListener('resize', () => { place(ball, ball.offsetLeft, ball.offsetTop); place(win, win.offsetLeft, win.offsetTop); });
}

/* ============================================================
   手绘风格动效：预加载 / 光标 / 解码 / 贴纸惯性 / 滚轴杠铃
   ============================================================ */
function runPreloader(onDone) {
  const pre = $('preloader');
  if (REDUCED) { pre.style.display = 'none'; onDone(); return; }
  let progress = 0, finished = false;
  const fill = $('plFill'), text = $('plText'), rot = $('plRot');
  const done = () => {
    if (finished) return; finished = true;
    rot.classList.add('show');
    setTimeout(() => {
      pre.classList.add('done');
      setTimeout(() => { pre.style.display = 'none'; }, 750);
      onDone();
    }, 900);
  };
  const iv = setInterval(() => {
    progress += Math.random() * 16 + 6;
    if (progress >= 100) { progress = 100; clearInterval(iv); done(); }
    fill.style.width = progress + '%';
    text.textContent = 'LOADING ' + Math.floor(progress) + '%';
  }, 170);
  setTimeout(() => { clearInterval(iv); fill.style.width = '100%'; done(); }, 10000); /* 资源异常 10 秒兜底 */
}
function initCursor() {
  const ring = $('cursorRing'), dot = $('cursorDot'), coords = $('mouseCoords');
  if (IS_TOUCH || !state.settings.cursor) {
    document.body.classList.remove('cursor-on');
    ring.style.display = dot.style.display = coords.style.display = 'none';
    return;
  }
  document.body.classList.add('cursor-on');
  ring.style.display = dot.style.display = coords.style.display = 'block';
  document.addEventListener('mousemove', e => {
    ring.style.left = dot.style.left = e.clientX + 'px';
    ring.style.top = dot.style.top = e.clientY + 'px';
    coords.textContent = 'X ' + String(Math.round(e.clientX)).padStart(4, '0') + ' · Y ' + String(Math.round(e.clientY)).padStart(4, '0');
  }, { passive: true });
  document.addEventListener('mouseover', e => {
    const hit = e.target.closest('a,button,input,select,textarea,label,.polaroid,.m-card,.wk-dot,.pain-tag,.mode-card,.acc-item');
    ring.classList.toggle('point', !!hit && !ring.classList.contains('grab'));
  }, { passive: true });
  document.addEventListener('mousedown', () => ring.classList.add('grab'));
  document.addEventListener('mouseup', () => ring.classList.remove('grab'));
}
function refreshCursorVisibility() {
  const ring = $('cursorRing'), dot = $('cursorDot'), coords = $('mouseCoords');
  if (IS_TOUCH || !state.settings.cursor) {
    document.body.classList.remove('cursor-on');
    ring.style.display = dot.style.display = coords.style.display = 'none';
  } else {
    document.body.classList.add('cursor-on');
    ring.style.display = dot.style.display = coords.style.display = 'block';
  }
}
const SCRAMBLE = '!<>-_\\/[]{}—=+*^?#0123456789';
function decodeEl(el) {
  if (el.dataset.decoded) return;
  el.dataset.decoded = '1';
  const nodes = [];
  (function walk(n) { n.childNodes.forEach(c => { if (c.nodeType === 3 && c.textContent.trim()) nodes.push(c); else if (c.nodeType === 1 && !c.classList.contains('scrib')) walk(c); }); })(el);
  nodes.forEach(node => {
    const orig = node.textContent;
    let frame = 0;
    const total = Math.min(orig.length * 3, 40);
    const iv = setInterval(() => {
      frame++;
      const reveal = Math.floor(orig.length * frame / total);
      node.textContent = orig.slice(0, reveal) + Array.from({ length: Math.min(orig.length - reveal, 6) }, () => SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]).join('');
      if (frame >= total) { node.textContent = orig; clearInterval(iv); }
    }, 34);
  });
}
function initDecode() {
  if (REDUCED || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(ents => ents.forEach(en => {
    if (en.isIntersecting) { decodeEl(en.target); io.unobserve(en.target); }
  }), { rootMargin: '-10% 0px' });
  document.querySelectorAll('.decode').forEach(el => io.observe(el));
}
/* 贴纸拖拽 + 惯性（原生实现，无第三方库） */
function makeSticker(el, boundsSel) {
  let x = 0, y = 0, vx = 0, vy = 0, sx = 0, sy = 0, ox = 0, oy = 0, pid = null, raf = null;
  const bounds = () => boundsSel ? document.querySelector(boundsSel) : document.body;
  el.addEventListener('pointerdown', e => {
    pid = e.pointerId; el.setPointerCapture(pid);
    sx = e.clientX; sy = e.clientY; ox = x; oy = y; vx = vy = 0;
    if (raf) cancelAnimationFrame(raf);
    e.preventDefault();
  });
  el.addEventListener('pointermove', e => {
    if (pid === null) return;
    const nx = ox + e.clientX - sx, ny = oy + e.clientY - sy;
    vx = nx - x; vy = ny - y;
    x = nx; y = ny;
    el.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + (el.dataset.rot || 0) + 'deg)';
  });
  el.addEventListener('pointerup', () => {
    pid = null;
    if (REDUCED) return;
    const step = () => {
      vx *= 0.92; vy *= 0.92;
      if (Math.abs(vx) < 0.4 && Math.abs(vy) < 0.4) return;
      x += vx; y += vy;
      const b = bounds();
      if (b) {
        const br = b.getBoundingClientRect(), er = el.getBoundingClientRect();
        if (er.left < br.left) { vx = Math.abs(vx) * 0.6; }
        if (er.right > br.right) { vx = -Math.abs(vx) * 0.6; }
        if (er.top < br.top) { vy = Math.abs(vy) * 0.6; }
        if (er.bottom > br.bottom) { vy = -Math.abs(vy) * 0.6; }
      }
      el.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + (el.dataset.rot || 0) + 'deg)';
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  });
}
function initStickers() {
  const hero = $('heroSticker');
  hero.dataset.rot = -4;
  makeSticker(hero, '.hero');
  const cont = $('outroStickers');
  const colors = ['#E23B32', '#F2C230', '#3D6FD9', '#3E9B4F'];
  const words = ['POWER', 'SQUAT', 'BENCH', 'DEADLIFT', 'SRA', 'JTS'];
  /* 恒 6 个：桌面按下面坐标散布；≤820px 由媒体查询改横排（left/top 被 auto 覆盖） */
  const pos = [{ l: '8%', t: '16%' }, { l: '82%', t: '12%' }, { l: '5%', t: '60%' }, { l: '86%', t: '58%' }, { l: '16%', t: '80%' }, { l: '72%', t: '82%' }];
  pos.forEach((p, i) => {
    const s = document.createElement('div');
    s.className = 'outro-sticker';
    s.style.left = p.l; s.style.top = p.t;
    s.dataset.rot = String(Math.round((Math.random() - 0.5) * 18));
    s.style.pointerEvents = 'auto';
    s.innerHTML = '<svg viewBox="0 0 84 84" fill="none"><circle cx="42" cy="42" r="38" fill="' + colors[i % 4] + '" stroke="#191919" stroke-width="2.5"/><circle cx="42" cy="42" r="30" fill="none" stroke="#191919" stroke-width="1.2" stroke-dasharray="4 4"/><text x="42" y="46" text-anchor="middle" font-size="10.5" font-weight="700" fill="#191919" font-family="Courier New">' + words[i % words.length] + '</text></svg>';
    cont.appendChild(s);
    makeSticker(s, '.outro');
  });
}
function initBarbellScroll() {
  if (REDUCED) return;
  const bb = $('heroBarbell');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const sy = scrollY;
      bb.style.transform = 'rotate(' + (sy * 0.04) + 'deg) scale(' + (1 + Math.sin(sy * 0.002) * 0.12) + ')';
      bb.style.opacity = String(clamp(1 - sy / 700, 0, 1));
      ticking = false;
    });
  }, { passive: true });
}

/* ============================================================
   导航（精准定位 + 滚动跟随高亮）与弹窗
   ============================================================ */
function initNav() {
  const secs = ['config', 'plan', 'train', 'sra', 'feedback', 'contact'];
  const links = document.querySelectorAll('.nav-link');
  const setActive = id => links.forEach(l => l.classList.toggle('active', l.dataset.sec === id));
  const onScroll = () => {
    const probe = scrollY + 140;
    let cur = null;
    secs.forEach(id => {
      const el = $(id);
      if (el && el.offsetTop <= probe) cur = id;
    });
    if (cur) setActive(cur);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  links.forEach(l => l.addEventListener('click', () => {
    $('navLinks').classList.remove('open');
    $('hamburger').classList.remove('on');
  }));
  $('hamburger').addEventListener('click', () => {
    $('hamburger').classList.toggle('on');
    $('navLinks').classList.toggle('open');
  });
  $('theoryAcc').querySelector('.acc-hd').addEventListener('click', () => $('theoryAcc').classList.toggle('open'));
}
function initOverlays() {
  document.querySelectorAll('.overlay').forEach(ov => ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('show'); }));
  $('dayClose').addEventListener('click', () => $('dayModal').classList.remove('show'));
  $('saveClose').addEventListener('click', () => $('saveModal').classList.remove('show'));
  $('saveCancelBtn').addEventListener('click', () => $('saveModal').classList.remove('show'));
  $('mpClose').addEventListener('click', closeMuscle);
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.overlay.show').forEach(o => o.classList.remove('show'));
    closeMuscle();
  });
  document.addEventListener('click', e => {
    if (!$('mpop').classList.contains('show')) return;
    if (e.target.closest('#mpop') || e.target.closest('[data-muscle]') || e.target.closest('.m-card')) return;
    closeMuscle();
  });
  /* 详情弹窗标题栏拖拽 */
  const win = $('dayWin'), bar = $('dayWinBar');
  let pid = null, sx = 0, sy = 0, bx = 0, by = 0;
  bar.addEventListener('pointerdown', e => {
    if (innerWidth <= 820) return; /* Turn 2: 移动端禁拖，避免 inline transform 破坏弹窗居中 */
    if (e.target.closest('button')) return;
    pid = e.pointerId; bar.setPointerCapture(pid);
    sx = e.clientX; sy = e.clientY; bx = winDrag.x; by = winDrag.y;
    e.preventDefault();
  });
  bar.addEventListener('pointermove', e => {
    if (pid === null) return;
    winDrag.x = bx + e.clientX - sx; winDrag.y = by + e.clientY - sy;
    win.style.transform = 'translate(' + winDrag.x + 'px,' + winDrag.y + 'px)';
  });
  bar.addEventListener('pointerup', () => { pid = null; });
}
function renderContact() {
  const html = DATA.socials.map(s => '<a class="contact-social" href="' + s.u + '">' + s.n + '</a>').join('');
  $('contactSocials').innerHTML = html;
  const s2 = $('contactSocials2');
  if (s2) s2.innerHTML = html;
}

/* ============================================================
   设置（光标 / 音效 · 状态文字反馈 · localStorage 持久化）
   ============================================================ */
let musicNodes = null;
function setMusic(on) {
  if (on) {
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      musicNodes = musicNodes || {};
      musicNodes.ctx = musicNodes.ctx || new C();
      const ctx = musicNodes.ctx;
      if (ctx.state === 'suspended') ctx.resume();
      if (!musicNodes.osc) {
        const g = ctx.createGain(); g.gain.value = 0.028; g.connect(ctx.destination);
        const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 110;
        const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 164.8;
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12;
        const lg = ctx.createGain(); lg.gain.value = 0.012;
        lfo.connect(lg); lg.connect(g.gain);
        o1.connect(g); o2.connect(g);
        o1.start(); o2.start(); lfo.start();
        musicNodes.osc = { g, o1, o2, lfo };
      } else musicNodes.osc.g.gain.value = 0.028;
    } catch (e) { return false; }
  } else if (musicNodes && musicNodes.osc) musicNodes.osc.g.gain.value = 0;
  return true;
}
function initSettings() {
  const st = state.settings || (state.settings = { cursor: !IS_TOUCH, music: false });
  const tc = $('toggleCursor'), tm = $('toggleMusic');
  if (st.cursor) tc.classList.add('on');
  if (st.music) tm.classList.add('on');
  $('statusCursor').textContent = st.cursor ? '已开启（仅桌面端）' : '已关闭';
  $('statusMusic').textContent = st.music ? '已开启（程序生成低音铺底）' : '已关闭';
  $('settingsBtn').addEventListener('click', () => $('settingsPanel').classList.toggle('show'));
  tc.addEventListener('click', () => {
    st.cursor = !tc.classList.contains('on');
    tc.classList.toggle('on', st.cursor);
    state.settings = st; saveState();
    $('statusCursor').textContent = st.cursor ? '已开启（仅桌面端）' : '已关闭';
    refreshCursorVisibility();
    showToast('光标装饰：' + (st.cursor ? '已开启' : '已关闭'));
  });
  tm.addEventListener('click', () => {
    const want = !tm.classList.contains('on');
    const ok = setMusic(want);
    st.music = ok && want;
    tm.classList.toggle('on', st.music);
    state.settings = st; saveState();
    $('statusMusic').textContent = st.music ? '已开启（程序生成低音铺底）' : '已关闭';
    showToast('背景音效：' + (st.music ? '已开启' : '已关闭'));
  });
}

/* ============================================================
   通用
   ============================================================ */
let toastTimer = null;
function showToast(msg) {
  const t = $('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
function initViewSwitch() {
  const stage = $('sraView');
  const ui = state.ui = state.ui || {};

  // 模型布局：人体图横排/竖排（影响 body-svgs flex 方向与 viewBox）
  function setModelMode(m) {
    stage.classList.toggle('model-row', m === 'row');
    stage.classList.toggle('model-col', m === 'col');
    const svg = $('bodySvg');
    if (svg) svg.setAttribute('viewBox', m === 'col' ? '0 0 750 2800' : '0 0 1500 1400');
    document.querySelectorAll('#modelViewSwitch button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
    ui.modelMode = m; saveState();
  }
  // 卡片布局：肌群卡片横排（2列网格）/ 竖排（单列列表）
  function setCardsMode(m) {
    stage.classList.toggle('cards-row', m === 'row');
    stage.classList.toggle('cards-col', m === 'col');
    document.querySelectorAll('#cardsViewSwitch button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
    ui.cardsMode = m; saveState();
  }

  // 默认：移动端两个都竖排；桌面两个都横排；已选过则保留各自偏好
  const mobile = innerWidth < 680;
  const defModel = mobile ? 'col' : 'row';
  const defCards = mobile ? 'col' : 'row';
  setModelMode(ui.modelMode === 'row' || ui.modelMode === 'col' ? ui.modelMode : defModel);
  setCardsMode(ui.cardsMode === 'row' || ui.cardsMode === 'col' ? ui.cardsMode : defCards);

  document.querySelectorAll('#modelViewSwitch button').forEach(b => b.addEventListener('click', () => setModelMode(b.dataset.mode)));
  document.querySelectorAll('#cardsViewSwitch button').forEach(b => b.addEventListener('click', () => setCardsMode(b.dataset.mode)));
  window.addEventListener('resize', () => {
    // 跟随断点自动切换默认（仅当用户从未手动选过；用户已选过则不强制覆盖）
    if (ui.modelMode == null) setModelMode(innerWidth < 680 ? 'col' : 'row');
    if (ui.cardsMode == null) setCardsMode(innerWidth < 680 ? 'col' : 'row');
  });
}
function initBgLines() {
  const bg = $('bgLines');
  const n = innerWidth < 720 ? 3 : 5;
  for (let i = 1; i <= n; i++) {
    const line = document.createElement('i');
    line.style.left = (i * 100 / (n + 1)) + '%';
    bg.appendChild(line);
  }
}

/* ============================================================
   初始化
   ============================================================ */
function init() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0); /* 刷新后始终回到顶部 */
  loadState();
  renderAccessoryList();
  renderContact();
  initBgLines();

  /* 周期模型选择（线性 / 交替） */
  cfgMode = state.config ? (state.config.cycleMode || 'wave') : 'wave';
  document.querySelectorAll('#modePick .mode-card').forEach(card => {
    card.classList.toggle('on', card.dataset.mode === cfgMode);
    const pick = () => {
      cfgMode = card.dataset.mode;
      document.querySelectorAll('#modePick .mode-card').forEach(c => c.classList.toggle('on', c === card));
      if (state.plan && state.config) {
        state.config.cycleMode = cfgMode;
        state.plan = generatePlan(state.config);
        state.currentWeek = clamp(state.currentWeek, 0, state.plan.length - 1);
        saveState(); renderPlan(); renderTrain();
        showToast('已切换为' + (cfgMode === 'wave' ? '交替（波动）' : '线性') + '模型并重新生成计划');
      }
    };
    card.addEventListener('click', pick);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });

  /* 配置区回填 */
  if (state.config) {
    $('cfgCycle').value = String(state.config.cycle || state.config.totalWeeks || 12);
    $('cfgFrequency').value = String(state.config.frequency);
    $('cfgSquat').value = state.config.squat1RM;
    $('cfgBench').value = state.config.bench10RM;
    $('cfgConvDL').value = state.config.convDL1RM;
    $('cfgSumoDL').value = state.config.sumoDL1RM;
    $('cfgDLType').value = state.config.dlType;
    if ($('cfgSleep')) { $('cfgSleep').value = state.config.sleep || '7'; $('cfgAge').value = state.config.age || '39'; $('cfgStress').value = state.config.stress || 'low'; $('cfgExp').value = state.config.exp || 'beginner'; }
    if ($('cfgWeakSquat')) {
      const w = state.config.weakness || {};
      $('cfgWeakSquat').value = w.squat || ''; $('cfgWeakBench').value = w.bench || ''; $('cfgWeakDead').value = w.dead || '';
    }
    const sel = new Set(state.config.selectedAccessories || []);
    document.querySelectorAll('#accessoryList input').forEach(cb => { cb.checked = sel.has(cb.value); });
  }
  /* 首次打开（本地无配置）：用预填的实测数据自动生成完整计划，打开即有方案 */
  if (!state.config) {
    const cfg = {
      cycle: parseInt($('cfgCycle').value, 10),
      frequency: parseInt($('cfgFrequency').value, 10),
      squat1RM: parseFloat($('cfgSquat').value) || 120,
      bench10RM: parseFloat($('cfgBench').value) || 60,
      convDL1RM: parseFloat($('cfgConvDL').value) || 140,
      sumoDL1RM: parseFloat($('cfgSumoDL').value) || 150,
      dlType: $('cfgDLType').value,
      cycleMode: cfgMode,
      sleep: $('cfgSleep').value, age: $('cfgAge').value,
      stress: $('cfgStress').value, exp: $('cfgExp').value,
      weakness: { squat: $('cfgWeakSquat').value, bench: $('cfgWeakBench').value, dead: $('cfgWeakDead').value },
      selectedAccessories: Array.from(document.querySelectorAll('#accessoryList input:checked')).map(cb => cb.value),
    };
    state.config = cfg;
    state.plan = generatePlan(cfg);
    state.currentWeek = 0; state.execution = {}; state.adjustments = [];
    currentTrainDayId = null; sessionStart = null;
    saveState(); renderPlan(); renderTrain(); renderFeedback();
  }
  $('generateBtn').addEventListener('click', () => {
    const cfg = {
      cycle: parseInt($('cfgCycle').value, 10),
      frequency: parseInt($('cfgFrequency').value, 10),
      squat1RM: parseFloat($('cfgSquat').value) || 120,
      bench10RM: parseFloat($('cfgBench').value) || 60,
      convDL1RM: parseFloat($('cfgConvDL').value) || 140,
      sumoDL1RM: parseFloat($('cfgSumoDL').value) || 150,
      dlType: $('cfgDLType').value,
      cycleMode: cfgMode,
      sleep: $('cfgSleep').value, age: $('cfgAge').value,
      stress: $('cfgStress').value, exp: $('cfgExp').value,
      weakness: { squat: $('cfgWeakSquat').value, bench: $('cfgWeakBench').value, dead: $('cfgWeakDead').value },
      selectedAccessories: Array.from(document.querySelectorAll('#accessoryList input:checked')).map(cb => cb.value),
    };
    state.config = cfg;
    state.plan = generatePlan(cfg);
    state.currentWeek = 0; state.execution = {}; state.adjustments = [];
    currentTrainDayId = null; sessionStart = null;
    saveState();
    renderPlan(); renderTrain(); renderFeedback();
    showToast('训练计划已生成：' + cfg.cycle + ' 周 · 每周 ' + cfg.frequency + ' 练 · ' + (cfg.cycleMode === 'wave' ? '交替模型' : '线性模型') + ' · 恢复系数 ×' + recFactorFrom(cfg));
    location.hash = 'plan';
  });
  $('resetConfigBtn').addEventListener('click', () => {
    if (!confirm('确定重置全部配置、计划与训练记录？')) return;
    const ui = state.ui, settings = state.settings;
    state = { config: null, plan: null, currentWeek: 0, execution: {}, trainingLogs: [], feedback: [], adjustments: [], settings, ui };
    saveState();
    renderPlan(); renderTrain(); renderSra(); renderFeedback();
    showToast('已重置');
  });

  /* 训练执行 */
  $('finishTrainBtn').addEventListener('click', () => {
    if (!state.plan) { showToast('请先生成计划'); return; }
    openSaveModal();
  });
  $('saveConfirmBtn').addEventListener('click', confirmSave);
  /* 清空本日记录：立即生效，同步清空勾选与 SRA 刺激 */
  $('clearTrainBtn').addEventListener('click', () => {
    const day = ensureCurDay();
    if (!day) { showToast('请先生成计划并选择训练日'); return; }
    const hadLog = state.trainingLogs.some(l => l.dayId === day.id);
    const hadExec = !!(state.execution[day.id] && state.execution[day.id].some(e => e.sets.some(s => s.checked)));
    if (!hadLog && !hadExec) { showToast('本日暂无打卡或保存记录'); return; }
    delete state.execution[day.id];
    state.trainingLogs = state.trainingLogs.filter(l => l.dayId !== day.id);
    state.feedback = state.feedback.filter(f => f.dayId !== day.id);
    saveState();
    renderTrain(day.id); /* 重建日选择条，同步移除标题对号 */
    renderPlan(); renderSra(); renderFeedback();
    showToast('已清空「' + day.name + '」' + (hadLog ? ' · 对应 SRA 刺激已同步移除' : ''));
  });

  /* 反馈 */
  $('rpeSlider').addEventListener('input', function () {
    $('rpeValue').textContent = this.value;
    $('rpeBig').textContent = (+this.value).toFixed(1);
  });
  $('submitFeedbackBtn').addEventListener('click', submitFeedback);

  /* 周次滚轴 */
  $('weekSlider').addEventListener('input', function () { setWeek(parseInt(this.value, 10), false); });
  $('weekSlider').addEventListener('change', function () { setWeek(parseInt(this.value, 10), true); });

  /* SRA 人体点击 */
  document.querySelectorAll('#bodySvg [data-muscle]').forEach(el => el.addEventListener('click', () => toggleMuscle(el.dataset.muscle)));

  initOverlays();
  initNav();
  initViewSwitch();
  initTimerUI();
  initSettings();
  initFeedbackUI();
  initStickers();
  initBarbellScroll();
  initDecode();

  if (state.plan) { renderPlan(); renderTrain(); }
  renderSra(); renderFeedback();
  setInterval(() => { if (state.trainingLogs.length && !$('sraContent').classList.contains('hide')) renderSra(); }, 60000);

  /* 首次打开：用 CONFIG 预填值（含估算）自动生成计划，免去手动点生成 */
  if (!state.config) {
    try {
      const cfg = {
        cycle: parseInt($('cfgCycle').value, 10) || 12,
        frequency: parseInt($('cfgFrequency').value, 10) || 4,
        squat1RM: parseFloat($('cfgSquat').value) || 120,
        bench10RM: parseFloat($('cfgBench').value) || 60,
        convDL1RM: parseFloat($('cfgConvDL').value) || 140,
        sumoDL1RM: parseFloat($('cfgSumoDL').value) || 150,
        dlType: $('cfgDLType').value || 'sumo',
        cycleMode: cfgMode,
        sleep: ($('cfgSleep') || {}).value || '7', age: ($('cfgAge') || {}).value || '39',
        stress: ($('cfgStress') || {}).value || 'low', exp: ($('cfgExp') || {}).value || 'beginner',
        weakness: { squat: ($('cfgWeakSquat') || {}).value || '', bench: ($('cfgWeakBench') || {}).value || '', dead: ($('cfgWeakDead') || {}).value || '' },
        selectedAccessories: Array.from(document.querySelectorAll('#accessoryList input:checked')).map(cb => cb.value),
      };
      state.config = cfg;
      state.plan = generatePlan(cfg);
      state.currentWeek = 0;
      saveState();
      renderPlan(); renderTrain(); renderFeedback();
    } catch (e) {}
  }

  /* 预加载完成后解锁首屏动画并初始化光标 */
  runPreloader(() => {
    document.body.classList.add('ready');
    initCursor();
  });
  if (REDUCED) initCursor();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
