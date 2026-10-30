/**
 * engine.js — 判断层
 *
 * 全部能力都从「面诊记录 + 客户画像 + 品项库」推导，不引入模型幻觉：
 *   buildProfile   把零散观察压成五类标签，每条标签带回溯证据
 *   generateScript 观察 → 解释 → 建议 三层，按场景切换策略
 *   matchPlan      四层方案，每个推荐项都能追到具体维度
 *   lintText       二次校验：恐吓 / 绝对化承诺 / 医学诊断 / 贬低同行 / 逼单
 *   extractTodos   从沟通原文里拆诉求、动作、风险
 *   customerReview / storeReview  客户与门店两类复盘
 *
 * 一条硬约束贯穿全文件：没有面诊记录就不生成销售话术。调用方必须先用 canGenerate 判断。
 */

import {
  DIMENSIONS, DIM_MAP, findDimValue, SIGNAL_MAP, CUSTOMER_LEVELS,
  NEED_META, SCENES, BLOCK_RULES, scanText, softenText, SOFTEN_MAP, TODO_TYPES,
} from './taxonomy.js';
import {
  getState, assessmentsOf, latestAssessment, customerById, daysSince,
  scopedTodos, customers, activeItems, scriptsOf, followsOf, inferLevel, fmtDate, storeName,
} from './db.js';

/* ================================================================ 工具 */

const SEV_SCORE = { 0: 86, 1: 70, 2: 52, 3: 32 };

function pct(n, d) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

function uniq(arr) {
  return [...new Set(arr)];
}

function sourceLabel(src) {
  return { device: '仪器', eye: '目测', self: '自述' }[src] || '记录';
}

/** 观察来源标记，话术里不带，但追溯证据里必须带 */
function evidenceOf(rec, dimKey, val) {
  return {
    at: rec.at,
    date: fmtDate(rec.at, true),
    dimKey,
    dimLabel: DIM_MAP[dimKey]?.label || dimKey,
    valueLabel: val.label,
    source: rec.dims?.[dimKey]?.source || 'eye',
    sourceLabel: sourceLabel(rec.dims?.[dimKey]?.source),
    deviceValue: rec.device?.[dimKey] ?? null,
  };
}

/** 把一个维度取值折算成 0-100 的状态分，用于趋势 */
function scoreOf(rec, dimKey) {
  const d = rec.dims?.[dimKey];
  if (!d) return null;
  const dv = rec.device?.[dimKey];
  if (typeof dv === 'number' && ['hydration', 'oil', 'pigment'].includes(dimKey)) {
    return dv;
  }
  const val = findDimValue(dimKey, d.v);
  return val ? SEV_SCORE[val.sev] ?? 60 : null;
}

/* ================================================================ 1. 画像 */

/**
 * 五类标签：肤质 / 问题 / 诉求 / 消费力 / 决策风格
 * 每条标签携带 evidence 数组，指向具体记录与来源，供「为什么打这个标签」追溯。
 */
export function buildProfile(customerId) {
  const customer = customerById(customerId);
  if (!customer) return null;
  const records = assessmentsOf(customerId); // 已按时间倒序
  const latest = records[0] || null;

  const buckets = {
    skin: { key: 'skin', label: '肤质标签', items: [] },
    problem: { key: 'problem', label: '问题标签', items: [] },
    need: { key: 'need', label: '诉求标签', items: [] },
    spend: { key: 'spend', label: '消费力标签', items: [] },
    decision: { key: 'decision', label: '决策风格标签', items: [] },
  };

  const push = (bucket, text, evidence, note) => {
    const b = buckets[bucket];
    const hit = b.items.find((x) => x.text === text);
    if (hit) {
      hit.evidence.push(evidence);
      return;
    }
    b.items.push({ text, evidence: [evidence], note });
  };

  /* -- 肤质与问题：从最近两次记录取，保留最新一次的说法 -- */
  const recent = records.slice(0, 2);
  for (const rec of recent) {
    for (const [dimKey, d] of Object.entries(rec.dims || {})) {
      const val = findDimValue(dimKey, d.v);
      if (!val || val.sev === 0) continue;
      const ev = evidenceOf(rec, dimKey, val);
      // 肤质类标签进 skin，其余进 problem
      if (dimKey === 'skinType') {
        push('skin', val.tags[0] || val.label, ev);
      } else {
        for (const t of val.tags) push('problem', t, ev, val.caution || '');
      }
    }
  }

  /* -- 诉求：来自沟通信号，含明确表达与隐含顾虑 -- */
  for (const rec of recent) {
    for (const sv of rec.signals || []) {
      const sig = SIGNAL_MAP[sv];
      if (!sig) continue;
      const ev = { at: rec.at, date: fmtDate(rec.at, true), dimKey: 'signal', dimLabel: '沟通信号', valueLabel: sig.label, source: 'self', sourceLabel: '自述' };
      if (sig.tags.length) push('need', sig.tags[0], ev, sig.note);
    }
  }

  /* -- 消费力：按到店次数与历史项目推断，注明是推断 -- */
  const visits = records.length;
  const lastGap = latest ? daysSince(latest.at) : null;
  if (customer.level === 'vip') {
    push('spend', '高客单', { at: customer.joinedAt, date: customer.joinedAt, dimLabel: '客户档案', valueLabel: '分层标记', source: 'eye', sourceLabel: '档案' }, '分层标记由门店维护');
  } else if (visits >= 3) {
    push('spend', '稳定复购', { at: latest.at, date: fmtDate(latest.at), dimLabel: '到店记录', valueLabel: `累计 ${visits} 次`, source: 'device', sourceLabel: '记录' }, '按到店次数推断，非订单数据');
  } else if (visits === 1 && customer.level === 'new') {
    push('spend', '体验期', { at: latest.at, date: fmtDate(latest.at), dimLabel: '到店记录', valueLabel: `累计 ${visits} 次`, source: 'device', sourceLabel: '记录' }, '按到店次数推断，非订单数据');
  } else {
    push('spend', '待验证', { at: latest?.at || customer.joinedAt, date: fmtDate(latest?.at || customer.joinedAt), dimLabel: '到店记录', valueLabel: `累计 ${visits} 次`, source: 'device', sourceLabel: '记录' }, '按到店次数推断，非订单数据');
  }

  /* -- 决策风格：价格敏感 / 顾虑型 / 对比型 / 求快型 / 谨慎型 -- */
  const sigAll = uniq(recent.flatMap((r) => r.signals || []));
  if (sigAll.includes('price-sensitive') || sigAll.includes('budget-cut')) {
    push('decision', '价格敏感', { at: recent[0].at, date: fmtDate(recent[0].at, true), dimLabel: '沟通信号', valueLabel: '对价格有反应', source: 'self', sourceLabel: '自述' }, '沟通中主动提及价格或预算');
  }
  if (sigAll.includes('fear-redness') || sigAll.includes('irritated')) {
    push('decision', '效果顾虑型', { at: recent[0].at, date: fmtDate(recent[0].at, true), dimLabel: '沟通信号', valueLabel: '担心刺激或反应', source: 'self', sourceLabel: '自述' }, '有过负面体验或明确表达担心');
  }
  if (sigAll.includes('compare-clinic')) {
    push('decision', '对比中', { at: recent[0].at, date: fmtDate(recent[0].at, true), dimLabel: '沟通信号', valueLabel: '提到其他机构', source: 'self', sourceLabel: '自述' }, '不贬低同行，只讲判断依据');
  }
  if (sigAll.includes('quick-result')) {
    push('decision', '求快型', { at: recent[0].at, date: fmtDate(recent[0].at, true), dimLabel: '沟通信号', valueLabel: '希望短期见效', source: 'self', sourceLabel: '自述' }, '用代谢周期把预期拉回现实');
  }
  if (sigAll.includes('busy')) {
    push('decision', '怕麻烦型', { at: recent[0].at, date: fmtDate(recent[0].at, true), dimLabel: '沟通信号', valueLabel: '时间少', source: 'self', sourceLabel: '自述' }, '方案给最短路径');
  }
  if (buckets.decision.items.length === 0 && recent.length) {
    push('decision', '未表态', { at: recent[0].at, date: fmtDate(recent[0].at, true), dimLabel: '沟通信号', valueLabel: '暂无明确倾向', source: 'eye', sourceLabel: '目测' }, '素材不足，需下次沟通补足，不作推断');
  }

  const level = inferLevel(customer);
  const needsRanked = rankNeeds(latest);

  return {
    customer,
    level,
    records,
    latest,
    lastGap,
    visits,
    buckets,
    needsRanked,
    hasData: records.length > 0,
    tagCount: Object.values(buckets).reduce((a, b) => a + b.items.length, 0),
  };
}

/**
 * 需求排序：严重度优先，同严重度按需求域顺序。
 * 肤质类型只是描述，不应该和「屏障泛红」抢主线 —— 它贡献的需求统一降一级，
 * 否则话术会从「您是混合偏干」开场，而不是从「两颊泛红」开场。
 */
export function rankNeeds(rec) {
  if (!rec) return [];
  const out = [];
  for (const [dimKey, d] of Object.entries(rec.dims || {})) {
    // 肤质类型是描述，不是问题本身。让它参与排序会把「混合偏干」顶成主线，
    // 盖掉真正该先处理的泛红或缺水。它只出标签，不出需求。
    if (dimKey === 'skinType') continue;
    const val = findDimValue(dimKey, d.v);
    if (!val || val.sev === 0) continue;
    for (const need of val.needs) {
      const exist = out.find((x) => x.need === need);
      if (exist) {
        exist.sev = Math.max(exist.sev, val.sev);
        exist.dims.push({ dimKey, val, sev: val.sev });
      } else {
        out.push({ need, sev: val.sev, order: NEED_META[need]?.order ?? 99, dims: [{ dimKey, val, sev: val.sev }] });
      }
    }
  }
  // 每个需求内部也按严重度排，dims[0] 才是该需求最该引用的那条观察
  for (const o of out) o.dims.sort((a, b) => b.sev - a.sev);
  return out.sort((a, b) => b.sev - a.sev || a.order - b.order);
}

/* ================================================================ 2. 话术 */

/** 只有存在面诊记录才允许生成销售话术 */
export function canGenerate(customerId) {
  return assessmentsOf(customerId).length > 0;
}

const REACTION_MAP = {
  barrier: '前一到两天可能会觉得有点闷，或者局部轻微泛红，一般 24 到 48 小时会退下去。',
  soothe: '做完脸会偏凉一点，当天不要马上用热水洗脸。',
  hydration: '刚做完会觉得有点黏，是正常的，睡前会吸收掉。',
  clean: '当天会有一点紧，第二天出油会少一些，不要因为紧就叠很厚的面霜。',
  pigment: '前期可能会有一点干，或者局部微微刺，建立耐受之后会消失。别因为心急加次数。',
  acne: '痘痘区域做完可能会暂时更红一点，这是正常反应，不要挤。',
  wrinkle: '做完当下会有点热感，一两小时退，当天不要做剧烈运动。',
  eye: '眼周可能会有一点点肿，冷敷十分钟会好很多。',
  oil: '前几天会感觉出油变少，但不要因此停掉保湿，两颊还是要补。',
};

const CYCLE_TEXT = {
  barrier: '一个疗程 6 次，按 28 天排，前三次密一点，后面隔周维持。',
  hydration: '一个疗程 6 次，跟着 28 天的代谢周期走，中间不要断太久。',
  pigment: '提亮要看色素代谢，一个疗程 6 次，跨度大概 6 周，中间必须每天防晒。',
  acne: '分三段，消炎、疏通、稳定，大概 8 次，前两周密一点。',
  wrinkle: '射频 5 次一个疗程，间隔 5 周左右，效果是累积的，不会一次到位。',
  eye: '眼周 6 次，一周一次，配合居家会更快。',
  oil: '控油 6 次，跟着代谢周期，同时把两颊的补水跟上。',
  clean: '清洁按需做，两周一次就够，不要更密。',
  soothe: '急性期一周两次，稳下来之后改成两周一次。',
};

/** 口语日期：客户不会记「2026-09-12」，但记得「9 月 12 日」 */
function md(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "上一次";
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

const REGION_WORDS = ["两颊", "T 区", "眼周", "鼻翼", "颧骨", "下巴", "额头", "整张脸", "眼下", "眼尾", "下颌线", "脸颊"];
const STATE_WORDS = ["偏干", "缺水", "出油", "泛红", "毛孔", "色斑", "痘痘", "闭口", "痘印", "暗沉", "细纹", "松"];

/** 同一区域 + 同一状态的两句话视为重复，只说一次 */
function redundant(a, b) {
  const ra = REGION_WORDS.filter((w) => a.includes(w));
  const rb = REGION_WORDS.filter((w) => b.includes(w));
  if (!ra.length || !rb.length) return false;
  if (!ra.some((w) => rb.includes(w))) return false;
  return STATE_WORDS.some((s) => a.includes(s) && b.includes(s));
}

/** 把维度取值拼成一句客户听得懂的话 */
function observeSentence(rec, picked) {
  const parts = [];
  for (const p of picked) {
    const text = p.val.observe;
    if (!text) continue;
    if (parts.some((x) => x === text || redundant(x, text))) continue;
    if (p.dimKey === 'skinType' && parts.some((x) => STATE_WORDS.some((w) => x.includes(w) && text.includes(w)))) continue;
    parts.push(text);
  }
  if (!parts.length) return "这次整体状态比上次稳，没有明显的新问题。";
  const head = parts.slice(0, 2).join("；");
  const tail = parts.slice(2).join("；");
  return tail ? `${head}。另外，${tail}。` : `${head}。`;
}

/**
 * 与上一次记录做对比。
 * 阈值放在 3 个点：仪器读数受光线和测量位置影响，2 个点以内属于噪音，
 * 说出去反而显得不专业，客户下次自己对比不出来。
 */
function deltaSentence(rec, prev) {
  if (!prev) return "";
  const lines = [];
  const pairs = [
    { k: "hydration", label: "含水量", better: "up" },
    { k: "pigment", label: "色素值", better: "down" },
    { k: "oil", label: "出油值", better: null },
  ];
  for (const p of pairs) {
    const a = prev.device?.[p.k];
    const b = rec.device?.[p.k];
    if (typeof a !== "number" || typeof b !== "number") continue;
    const diff = b - a;
    if (Math.abs(diff) < 3) continue;
    if (p.better === null) {
      lines.push(`出油值从 ${a} 到 ${b}，${diff < 0 ? "也在往下走" : "比上次高一点"}`);
      continue;
    }
    const good = (p.better === "up" && diff > 0) || (p.better === "down" && diff < 0);
    lines.push(`${p.label}从 ${a} ${diff > 0 ? "升" : "降"}到 ${b}，${good ? "这个方向是对的" : "这块还没稳住"}`);
  }
  if (!lines.length) {
    for (const [dimKey, d] of Object.entries(rec.dims || {})) {
      const cur = findDimValue(dimKey, d.v);
      const old = findDimValue(dimKey, prev.dims?.[dimKey]?.v);
      if (!cur || !old || cur.sev === old.sev) continue;
      lines.push(`${DIM_MAP[dimKey].label}${cur.sev < old.sev ? "比上次好了一些" : "这次比上次明显一点"}`);
    }
  }
  if (!lines.length) return "";
  return `上次（${md(prev.at)}）到现在，${lines.slice(0, 2).join("；")}。`;
}

/** 成因主题词：两个成因落到同一个主题上，就只说一次 */
const THEME_WORDS = ['皮脂腺', '锁水', '屏障', '防护', '色素', '角质', '表情肌', '支撑', '循环', '炎症'];

function sameTheme(a, b) {
  const hit = THEME_WORDS.filter((w) => a.includes(w));
  return hit.some((w) => b.includes(w));
}

/** 解释层：主因 + 环境因素，明确不做诊断 */
function explainSentence(rec, picked, signals) {
  const main = picked[0];
  const core = main?.val.cause || "皮肤现在的状态和日常的作息、护理方式都有关系";

  const env = [];
  if (signals.includes("stay-up")) env.push("最近熬夜多，修复的时间不够");
  if (signals.includes("season")) env.push("又赶上换季，皮肤的适应成本本来就高");
  if (signals.includes("irritated")) env.push("之前用过的产品让皮肤受过一次刺激，到现在还没完全缓过来");
  if (signals.includes("busy")) env.push("平时护理时间少，靠单次项目撑不住");

  const lead = /^[A-Za-z]/.test(core) ? " " : "";
  let s = `这种状态，多半是因为${lead}${core}`;
  if (env.length) s += `；再加上${env[0]}`;
  s += "。";

  // 第二句只在确实是另一件事时才加：维度不同、需求不同，且成因不在同一个主题上
  const second = picked.slice(1).find(
    (p) => p.dimKey !== main.dimKey && p.need !== main.need && !sameTheme(core, p.val.cause),
  );
  if (second) {
    s += `另外，${second.val.cause}。这两件事是连着的，先处理前面那个，后面的会跟着好一些。`;
  }
  return s;
}

/**
 * 建议层：拆成「解决什么 / 怎么做 / 几次 / 什么反应」
 * 结构固定，避免变成一段推销话。
 */
function adviseSentence(picked, plan, signals) {
  const main = picked[0];
  // 用排序后的 need，而不是维度自带的 needs[0] —— 否则会出现
  // 「先把补水稳住」却推荐了屏障修护项目这种前言不搭后语
  const needKey = main?.need || main?.val?.needs?.[0] || 'barrier';
  const needLabel = NEED_META[needKey]?.label || '基础护理';
  const entry = plan?.tiers?.entry || [];
  const course = plan?.tiers?.course || [];
  const firstItem =
    entry.find((i) => (i.needs || []).includes(needKey)) ||
    course.find((i) => (i.needs || []).includes(needKey)) ||
    entry[0] ||
    course[0];

  const aligned = !!firstItem && (firstItem.needs || []).includes(needKey);

  // 只有色素和紧致这两类真的存在「前置条件」，才谈得上先做什么再做什么。
  // 补水、控油、清洁没有前置，缺品项就直说这次不排，不要拿别的方向硬顶。
  const PRE = {
    pigment: {
      need: 'barrier',
      why: '色素要靠屏障托着，底子不稳的时候上去，反黑的概率比见效的概率高',
    },
    wrinkle: {
      need: 'barrier',
      why: '皮肤还在泛红刺痛的阶段做强刺激，反应会比平时重，效果也留不住',
    },
  };
  const pre = PRE[needKey];
  const preItem = pre
    ? [...entry, ...course].find((i) => (i.needs || []).includes(pre.need)) ||
      activeItems().find(
        (i) => i.kind === 'service' && i.tier === 'entry' && (i.needs || []).includes(pre.need),
      ) ||
      null
    : null;

  let how;
  if (aligned) {
    how = `先从${firstItem.name}开始，${firstItem.duration ? `${firstItem.duration} 分钟，` : ''}${firstItem.desc}`;
  } else if (pre) {
    const base = preItem
      ? `先从${preItem.name}开始，${preItem.desc}，等底子稳了再谈${needLabel}`
      : `先把底子稳住，再谈${needLabel}`;
    how = `不是不做，是顺序不对——${pre.why}。${base}`;
  } else {
    how = `院内暂时没有对应的单项，把已经能做的做好，下次复测再看这一项`;
  }

  const times = CYCLE_TEXT[needKey] || '先做两到三次看反应，再决定要不要往下走';
  // 反应描述必须跟着实际要做的那个动作走，不能讲一个没排的项目会有什么反应
  const reactionKey = aligned ? needKey : (pre?.need || needKey);
  const reaction = REACTION_MAP[reactionKey] || '做完当天注意保湿和防晒就好。';

  // 被前置条件拦住时，开头不能还说「先把 X 稳住」，周期也不能讲 X 的疗程
  const what = aligned ? `先把${needLabel}这块稳住` : `${needLabel}这次先往后放`;
  const cycleText = aligned ? times : '等这一步复测确认稳定，我们再排下一个方向。';

  let s = `${what}。${how}。${cycleText}可能的反应说一下：${reaction}`;
  if (signals.includes('quick-result')) {
    s += '有一点想先说清楚：皮肤是按周期走的，快不了，但方向对了每次都能看到一点。';
  }
  if (signals.includes('price-sensitive') || signals.includes('budget-cut')) {
    s += '预算上不用一次配齐，先把最该做的那一步做了，剩下的等看到变化再说。';
  }
  return s;
}

/** 场景包装：不同场景下开头与收尾不同，中间三层结构不变 */
function wrapByScene(scene, layers, ctx) {
  const sc = SCENES[scene] || SCENES['first-visit'];
  const out = { ...layers, scene, sceneLabel: sc.label };

  if (scene === 'report-read' && ctx.rec?.device) {
    const dv = ctx.rec.device;
    const bits = [];
    if (typeof dv.hydration === 'number') bits.push(`含水量 ${dv.hydration}`);
    if (typeof dv.oil === 'number') bits.push(`出油值 ${dv.oil}`);
    if (typeof dv.pigment === 'number') bits.push(`色素值 ${dv.pigment}`);
    if (bits.length) out.observe = `先看数字：${bits.join('、')}。换成您平时能感觉到的说法——${layers.observe}`;
  }
  if (scene === 'in-service') {
    out.observe = `现在手上能感觉到的：${layers.observe}力度您随时说。`;
  }
  if (scene === 'follow-up') {
    out.observe = `昨天到今天，您脸上有没有哪里不舒服？我这边记录的是：${layers.observe}`;
  }
  if (scene === 'first-visit') {
    out.opening = sc.opening;
    out.closure = sc.closure;
  }
  return out;
}

/**
 * 价格异议：不是三层话术，是价值拆解。
 * 结构：承认 → 拆周期 → 拆步骤 → 给选择，全程不给折扣。
 */
function priceObjectionScript(profile, plan, picked) {
  const course = plan?.tiers?.course?.[0];
  const entry = plan?.tiers?.entry?.[0];
  const home = plan?.tiers?.home || [];
  const totalSessions = course?.sessions || 6;

  return {
    observe: `您觉得贵是正常的。这个数我先拆开给您看：${course ? `${course.name} ${course.sessions} 次是 ${course.price} 元，` : ''}单次折算下来是${course ? Math.round(course.price / course.sessions) : '—'} 元，中间还包含${home.length ? ` ${home.length} 样居家产品的搭配指导` : '每次的复测'}。`,
    explain: `真正花时间的不是那一次护理，是${course?.cycleDays ? `${course.cycleDays} 天` : '一个代谢周期'}里皮肤一步步变化的过程。${picked[0]?.val?.cause ? `${picked[0].val.cause}，所以中间断掉的话，前面的就白做了。` : '中间断掉的话，前面的投入就接不上。'}`,
    advise: `如果现在预算不方便，有两个不降标准的做法：一是先只做${entry ? entry.name : '单次体验'}，${entry ? `${entry.price} 元` : ''}，先看反应；二是把${course ? course.sessions : 6} 次拉长到两个月，单次不变，节奏放慢。您选哪个都行，但步骤我不建议省。`,
    tactics: ['先拆单次，再谈总价', '给两个不降标准的选项，不给折扣', '把决定权交回客户，不当场逼'],
  };
}

/** 客户拒绝：不生成销售话术，只做关系维护 */
function refusalScript(profile, plan) {
  return {
    observe: '没关系，这个决定本来也不该今天做。',
    explain: `您今天已经知道自己的状态是怎么回事了，这比做什么项目更重要。${profile.needsRanked[0] ? `回去先把${NEED_META[profile.needsRanked[0].need]?.label || '基础那步'}这件事照顾到，就已经在往好的方向走了。` : ''}`,
    advise: `我把今天说的整理成一页发您，您什么时候想继续了随时找我${plan?.tiers?.entry?.[0] ? `，下次来可以先做${plan.tiers.entry[0].name}` : ''}。不用回，看到就行。`,
    tactics: ['不追问原因', '不留悬而未决的价格', '给一个低门槛的回来理由'],
  };
}

/**
 * 话术生成主入口。
 * 返回 { ok, layers, issues, evidence, plan } —— issues 非空表示二次校验命中了禁用词。
 */
export function generateScript(customerId, scene = 'first-visit', assessmentId = null) {
  const profile = buildProfile(customerId);
  if (!profile) return { ok: false, message: '客户不存在或无权限查看' };
  if (!profile.hasData) {
    return {
      ok: false,
      blocked: true,
      message: '该客户还没有面诊记录。按规则，没有面诊记录不生成销售话术——请先完成一次面诊录入。',
    };
  }

  const records = profile.records;
  const rec = assessmentId ? records.find((r) => r.id === assessmentId) : records[0];
  if (!rec) return { ok: false, message: '找不到指定面诊记录' };

  const prev = records.find((r) => new Date(r.at) < new Date(rec.at)) || null;
  const signals = rec.signals || [];

  // 选取主线问题：最多 3 个，严重度优先，同严重度按需求顺序
  const ranked = rankNeeds(rec);
  const picked = [];
  const seenNeeds = new Set();
  for (const r of ranked) {
    if (picked.length >= 3) break;
    if (seenNeeds.has(r.need)) continue;
    seenNeeds.add(r.need);
    picked.push({ need: r.need, sev: r.sev, val: r.dims[0].val, dimKey: r.dims[0].dimKey });
  }

  const plan = matchPlan(customerId, rec.id);

  let raw;
  if (scene === 'price-objection') {
    raw = priceObjectionScript(profile, plan, picked);
  } else if (scene === 'refusal') {
    raw = refusalScript(profile, plan);
  } else {
    const layers = {
      // 先描述当下的现状，再补一句与上次的对比 —— 反过来会像在念报告
      observe: [observeSentence(rec, picked), deltaSentence(rec, prev)].filter(Boolean).join(''),
      explain: explainSentence(rec, picked, signals),
      advise: adviseSentence(picked, plan, signals),
    };
    raw = wrapByScene(scene, layers, { rec, profile });
  }

  // 二次校验：先做中性化改写，再扫描是否仍有违规
  const cleaned = { opening: raw.opening || '', closure: raw.closure || '' };
  const issues = [];
  for (const key of ['observe', 'explain', 'advise']) {
    const softened = softenText(raw[key] || '');
    const hits = scanText(softened);
    if (hits.length) {
      const hard = hits.filter((h) => h.level === 'block');
      if (hard.length) {
        issues.push({ field: key, hits: hard, action: '已标记，需人工改写或重新生成' });
      } else {
        issues.push({ field: key, hits, action: '已提示，建议弱化语气' });
      }
      // 硬违规做一次替换兜底，逐词替换成安全表达
      let fixed = softened;
      for (const h of hard) {
        fixed = fixed.split(h.word).join('改善空间比较大');
      }
      cleaned[key] = fixed;
    } else {
      cleaned[key] = softened;
    }
  }

  // 被替换过的词单独记录，让顾问知道系统改了什么
  const rewritten = [];
  for (const key of ['observe', 'explain', 'advise']) {
    if ((raw[key] || '') !== cleaned[key]) rewritten.push(key);
  }

  return {
    ok: true,
    profile,
    record: rec,
    prev,
    scene,
    layers: cleaned,
    issues,
    rewritten,
    tactics: raw.tactics || [],
    evidence: picked.map((p) => ({
      need: p.need,
      needLabel: NEED_META[p.need]?.label,
      dimLabel: DIM_MAP[p.dimKey]?.label,
      value: p.val.label,
      source: rec.dims[p.dimKey]?.source,
      at: rec.at,
      quote: p.val.observe,
    })),
    plan,
    sourceNote: `依据 ${fmtDate(rec.at, true)} 的面诊记录（${Object.values(rec.dims || {}).map((d) => sourceLabel(d.source)).filter((v, i, a) => a.indexOf(v) === i).join(' / ')}）`,
  };
}

/** 合规扫描独立入口，供顾问手改后复检 */
export function lintText(text) {
  const softened = softenText(text || '');
  const hits = scanText(softened);
  return { hits, softened, pass: hits.filter((h) => h.level === 'block').length === 0 };
}

/* ================================================================ 3. 方案 */

/** 需求方向 → 品项类目。类目对得上，说明这个品项就是为这个方向设的；
 *  只靠 needs 交集会把「痘坑纹理改善」（acne+wrinkle）排到纯抗衰前面去。 */
const CATEGORY_FOR_NEED = {
  barrier: 'barrier', hydration: 'hydration', soothe: 'soothe',
  oil: 'clean', pore: 'clean', clean: 'clean',
  pigment: 'pigment', acne: 'acne', wrinkle: 'lift', eye: 'eye',
};

const BLOCK_REASONS = {
  'barrier-pigment': '屏障未稳时上提亮项目，容易反黑，这一项先不排',
  'active-acne-lift': '活动期炎症区域不做紧致类强刺激项目，先消炎',
  'melasma-strong': '成片且边界模糊的色素，不做高强度色素项目',
  'acne-pigment': '活动期痘痘未控制前，提亮项目先缓',
};

/**
 * 四层方案匹配。
 * 每个推荐项携带 evidence（触发它的维度），并且被禁忌规则拦住的项目单独列在 blocked 里，
 * 说明原因而不是直接删掉——顾问要知道为什么这次不能推。
 */
export function matchPlan(customerId, assessmentId = null) {
  const profile = buildProfile(customerId);
  if (!profile || !profile.hasData) return null;
  const rec = assessmentId ? profile.records.find((r) => r.id === assessmentId) : profile.records[0];
  if (!rec) return null;

  const ranked = rankNeeds(rec);
  const needSet = new Map();
  for (const r of ranked) needSet.set(r.need, r);

  const all = activeItems().filter((i) => i.kind === 'service' || i.kind === 'home');
  const services = all.filter((i) => i.kind === 'service');
  const homes = all.filter((i) => i.kind === 'home');

  // 禁忌判定
  const barrierSev = Math.max(
    ...Object.entries(rec.dims || {})
      .filter(([k]) => k === 'barrier')
      .map(([, d]) => findDimValue('barrier', d.v)?.sev ?? 0),
    0,
  );
  const acneVal = rec.dims?.acne ? findDimValue('acne', rec.dims.acne.v) : null;
  const pigmentVal = rec.dims?.pigment ? findDimValue('pigment', rec.dims.pigment.v) : null;
  const acneActive = acneVal?.v === 'active';
  const melasma = pigmentVal?.v === 'melasma';

  const blocked = [];
  const isBlocked = (item) => {
    if (item.needs.includes('pigment')) {
      if (melasma) { blocked.push({ item, reason: BLOCK_REASONS['melasma-strong'] }); return true; }
      if (item.tier === 'course' && barrierSev >= 2) { blocked.push({ item, reason: BLOCK_REASONS['barrier-pigment'] }); return true; }
      if (item.tier === 'course' && acneActive) { blocked.push({ item, reason: BLOCK_REASONS['acne-pigment'] }); return true; }
    }
    if ((item.needs.includes('wrinkle') || item.tier === 'course' && item.needs.includes('pore')) && acneActive) {
      blocked.push({ item, reason: BLOCK_REASONS['active-acne-lift'] });
      return true;
    }
    return false;
  };

  /**
   * 选品分两步：先保证排序靠前的方向各有一个代表项，再用剩余名额按权重补。
   * 只按权重+价格排会把名额给到便宜的杂项上，主方向就没人代表了 ——
   * 那样方案看着有东西，实际答非所问。
   */
  const pick = (pool, tier, limit, requireCat = false) => {
    const candidates = pool
      .filter((i) => i.tier === tier)
      .map((i) => {
        const matched = i.needs.filter((n) => needSet.has(n));
        const weight = matched.reduce((a, n) => a + (needSet.get(n)?.sev || 0), 0);
        const catHit = matched.filter((n) => CATEGORY_FOR_NEED[n] === i.category).length;
        return { item: i, matched, weight, catHit };
      })
      .filter((x) => x.matched.length > 0 && !isBlocked(x.item));

    const chosen = [];
    const taken = new Set();
    for (const r of ranked) {
      if (chosen.length >= limit) break;
      const cand = candidates
        .filter((x) => x.matched.includes(r.need) && !taken.has(x.item.id) && (!requireCat || x.catHit > 0))
        .sort((a, b) => b.catHit - a.catHit || b.weight - a.weight || a.item.price - b.item.price)[0];
      if (cand) {
        chosen.push(cand);
        taken.add(cand.item.id);
      }
    }
    for (const c of candidates.sort((a, b) => b.catHit - a.catHit || b.weight - a.weight || a.item.price - b.item.price)) {
      if (chosen.length >= limit) break;
      if (!taken.has(c.item.id)) {
        chosen.push(c);
        taken.add(c.item.id);
      }
    }

    const scored = chosen;
    return scored.map((x) => {
      const firstNeed = x.matched[0];
      const dimRef = needSet.get(firstNeed)?.dims?.[0];
      return {
        ...x.item,
        matchedNeeds: x.matched,
        evidence: dimRef
          ? { dimLabel: DIM_MAP[dimRef.dimKey]?.label, value: dimRef.val.label, source: rec.dims[dimRef.dimKey]?.source, at: rec.at, quote: dimRef.val.observe }
          : null,
        evidenceText: dimRef
          ? `${rec.dims[dimRef.dimKey]?.source === 'device' ? '仪器' : rec.dims[dimRef.dimKey]?.source === 'self' ? '客户自述' : '目测'}：${DIM_MAP[dimRef.dimKey]?.label} ${dimRef.val.label}`
          : '来自本次沟通信号',
      };
    });
  };

  const entry = pick(services, 'entry', 3);
  // 进阶层是花钱最多的决定，类目对不上就不进候选（避免拿痘坑项目解紧致需求）
  const course = pick(services, 'course', 2, true);

  // 居家层：跟院内方向对应，最多 3 件，避免变成柜台推销
  const homePicked = [];
  const homeNeedsOrder = ranked.map((r) => r.need);
  for (const need of homeNeedsOrder) {
    if (homePicked.length >= 3) break;
    const cand = homes.find((h) => h.needs.includes(need) && !homePicked.some((x) => x.id === h.id));
    if (cand) {
      const dimRef = needSet.get(need)?.dims?.[0];
      homePicked.push({
        ...cand,
        matchedNeeds: [need],
        evidenceText: dimRef ? `${DIM_MAP[dimRef.dimKey]?.label} ${dimRef.val.label}` : '对应院内方向',
      });
    }
  }
  // 色素方向必带防晒
  if (ranked.some((r) => r.need === 'pigment') && !homePicked.some((h) => h.name.includes('防晒'))) {
    const spf = homes.find((h) => h.name.includes('防晒'));
    if (spf && homePicked.length < 4) {
      homePicked.push({ ...spf, matchedNeeds: ['pigment'], evidenceText: '色素管理期间的必需项' });
    }
  }

  const longTier = services.filter((i) => i.tier === 'long');
  const long = longTier
    .map((i) => ({ ...i, matchedNeeds: i.needs.filter((n) => needSet.has(n)) }))
    .filter((i) => i.matchedNeeds.length > 0)
    .slice(0, 1);

  /* -- 推进顺序：先严重度最高的需求，稳住后再处理下一个 -- */
  const seqNames = [];
  if (entry[0]) seqNames.push(entry[0].name);
  else if (course[0]) seqNames.push(course[0].name);
  if (course[0] && course[0].name !== seqNames[0]) seqNames.push(course[0].name);
  const secondNeed = ranked.find((r) => r.need !== ranked[0]?.need && ['pigment', 'wrinkle'].includes(r.need));
  if (secondNeed) seqNames.push(NEED_META[secondNeed.need]?.label);

  let sequence = seqNames.length
    ? `先 ${seqNames[0]}${seqNames[1] ? `，稳定后进入 ${seqNames[1]}` : ''}${seqNames[2] ? `，${seqNames[2]} 放最后` : ''}`
    : '先做一次基础评估，再决定方向';

  const upsell = buildUpsellPath(profile, rec, plan_snapshot(entry, course), ranked);

  return {
    tiers: { entry, course, home: homePicked, long },
    blocked: dedupeBlocked(blocked),
    sequence,
    upsell,
    needsRanked: ranked,
    record: rec,
    level: profile.level,
    notes: planNotes(ranked, rec, blocked),
  };
}

function plan_snapshot(entry, course) {
  return { entry, course };
}

function dedupeBlocked(list) {
  const seen = new Set();
  return list.filter((b) => {
    if (seen.has(b.item.id)) return false;
    seen.add(b.item.id);
    return true;
  });
}

function planNotes(ranked, rec, blocked) {
  const notes = [];
  if (ranked.length > 1) {
    const [a, b] = ranked;
    notes.push(`本次同时存在 ${NEED_META[a.need]?.label} 与 ${NEED_META[b.need]?.label}，按「先解决当下问题」排成两步，不建议并行开两个疗程。`);
  }
  if (blocked.length) {
    notes.push(`有 ${blocked.length} 个项目本次不排，原因见下方「本轮不推荐」，不是漏掉了。`);
  }
  const cautions = Object.entries(rec.dims || {})
    .map(([k, d]) => ({ k, v: findDimValue(k, d.v) }))
    .filter((x) => x.v?.caution);
  if (cautions.length) {
    for (const c of cautions) notes.push(c.v.caution);
  }
  return notes;
}

/**
 * 升单路径：不是四个都想一遍，而是按客户当前状态挑最可能成立的两个节点。
 * 优先级来自需求文档：护理后对比 → 客户主动询问 → 周期复测 → 沉睡唤醒。
 */
function buildUpsellPath(profile, rec, snapshot, ranked) {
  const nodes = [];
  const gap = profile.lastGap;
  const hasEntry = !!snapshot.entry?.[0];
  const hasCourse = !!snapshot.course?.[0];

  // 1. 护理后前后对比
  if (hasEntry) {
    nodes.push({
      rank: 1,
      node: '护理后前后对比',
      when: '本次项目结束后、客户照镜子前',
      signal: '客户主动说「好像亮了」「摸着滑了」，或反复照镜子',
      script: `您先别急着下结论，我拍一张同角度的照片，下次来对比着看。${rec.device?.hydration ? `今天含水量是 ${rec.device.hydration}，` : ''}一次就能看出变化的地方，说明方向是对的。`,
      priority: '最高',
    });
  }

  // 2. 客户主动询问维持方法
  if (hasCourse) {
    nodes.push({
      rank: 2,
      node: '客户主动询问怎么维持',
      when: '护理后 2–3 天，客户问「这个能维持多久」时',
      signal: '客户开始关心频率和居家做法，说明已经接受方向',
      script: `维持要靠节奏，不是靠单次。您现在这个状态，${snapshot.course[0].cycleDays ? `大概 ${snapshot.course[0].cycleDays} 天` : '一个月'}一个循环比较合适，中间我们自己在家把保湿和防晒做到位，效果能接得上。`,
      priority: '高',
    });
  }

  // 3. 周期节点复测
  const mainNeed = ranked[0]?.need;
  nodes.push({
    rank: 3,
    node: '周期节点复测',
    when: `上一次记录后 ${mainNeed === 'barrier' ? '14' : '28'} 天左右`,
    signal: '复测数据出现方向性改善（含水量上升 / 泛红面积缩小）',
    script: `这次的数据比上次好，${rec.device?.hydration ? `含水量从 ${rec.device.hydration} 往上走了，` : ''}按我们说的节奏，下一步可以开始处理${ranked[1] ? NEED_META[ranked[1].need]?.label : '下一个方向'}了。不用现在定，您先看这次的变化。`,
    priority: '中',
  });

  // 4. 沉睡唤醒
  if (gap !== null && gap > 40) {
    nodes.unshift({
      rank: 0,
      node: '沉睡唤醒（当前优先）',
      when: `已距上次到店 ${gap} 天`,
      signal: '长期未到店，先不谈新项目',
      script: `上次给您记的${ranked[0] ? NEED_META[ranked[0].need]?.label : '状态'}，到现在差不多该复测一次了。这次不收项目费，就做个对比，看看有没有往回走。您哪天方便？`,
      priority: '当前最高',
    });
  }

  // 只保留当前最该做的两个，避免顾问一次记四条
  return nodes.sort((a, b) => a.rank - b.rank).slice(0, 2);
}

/* ================================================================ 4. 待办提取 */

// 注意：这里不能用带 g 标志的正则 —— String.match 在 g 模式下只返回整串匹配，
// 拿不到捕获组，m[1] 会是 undefined，日期就会算成 Invalid Date。
const TODO_PATTERNS = [
  { re: /(\d+)\s*天后/, days: (m) => Number(m[1]) },
  { re: /(两|二)\s*周后/, days: () => 14 },
  { re: /(一|1)\s*周后/, days: () => 7 },
  { re: /(三|3)\s*周后/, days: () => 21 },
  { re: /(半|半个)\s*月后/, days: () => 15 },
  { re: /(一|1)\s*个月后/, days: () => 30 },
  { re: /下次到店/, days: () => 14 },
];

const RISK_WORDS = ['价格', '贵', '预算', '对比', '别家', '其他机构', '怕', '担心', '犹豫', '考虑一下', '再看看'];
const NEED_WORDS = ['想', '希望', '问能不能', '能不能', '打算', '诉求'];
const ACTION_WORDS = ['复测', '跟进', '发送', '通知', '回访', '安排', '提醒', '预约'];

function parseDays(text) {
  for (const p of TODO_PATTERNS) {
    const m = text.match(p.re);
    if (m) return p.days(m);
  }
  return null;
}

/**
 * 从一段沟通原文里拆出三类待办。
 * 时间是「今天 + N 天」，解析不到就默认为 7 天后，并标注是默认值。
 */
export function extractTodos(text, customerId) {
  const raw = (text || '').trim();
  if (!raw) return [];
  const out = [];
  const base = new Date();
  const mkDate = (days) => {
    const n = Number.isFinite(days) ? days : 7;
    return new Date(base.getTime() + n * 86400000).toISOString().slice(0, 10);
  };

  // 按句切成片段，每片单独判断类型
  const sentences = raw.split(/[。；;\n！!？?]/).map((s) => s.trim()).filter(Boolean);

  for (const s of sentences) {
    const days = parseDays(s);
    const due = days !== null ? mkDate(days) : mkDate(7);
    const assumed = days === null;

    if (RISK_WORDS.some((w) => s.includes(w))) {
      out.push({ type: 'risk', content: s, dueAt: due, assumed, reason: '命中顾虑/对比类表达' });
    } else if (ACTION_WORDS.some((w) => s.includes(w))) {
      out.push({ type: 'action', content: s, dueAt: due, assumed, reason: '命中后续动作表达' });
    } else if (NEED_WORDS.some((w) => s.includes(w))) {
      out.push({ type: 'need', content: s, dueAt: due, assumed, reason: '命中客户诉求表达' });
    }
  }

  // 去重：同一句话只留一条，风险优先级最高
  const order = { risk: 0, action: 1, need: 2 };
  const seen = new Set();
  return out
    .filter((t) => {
      const k = t.content.slice(0, 24);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => order[a.type] - order[b.type])
    .slice(0, 5);
}

/* ================================================================ 5. 趋势 */

/**
 * 返回某维度的序列。数值优先取仪器读数，没有读数时用严重度折算，
 * 并在点位上标记来源，避免把目测当成检测数据。
 */
export function trendOf(customerId, dimKey) {
  const records = assessmentsOf(customerId);
  const points = [];
  for (const r of records.slice().reverse()) {
    const d = r.dims?.[dimKey];
    if (!d) continue;
    const val = findDimValue(dimKey, d.v);
    const score = scoreOf(r, dimKey);
    if (score === null) continue;
    points.push({
      at: r.at,
      date: fmtDate(r.at),
      score,
      label: val?.label || d.v,
      source: d.source,
      device: typeof r.device?.[dimKey] === 'number',
    });
  }
  return points;
}

/** 跨维度对比两次记录，生成「变化清单」 */
export function compareRecords(prev, curr) {
  if (!prev || !curr) return [];
  const out = [];
  const keys = uniq([...Object.keys(prev.dims || {}), ...Object.keys(curr.dims || {})]);
  for (const k of keys) {
    const a = prev.dims?.[k] ? findDimValue(k, prev.dims[k].v) : null;
    const b = curr.dims?.[k] ? findDimValue(k, curr.dims[k].v) : null;
    if (!a && !b) continue;
    // 前后完全一样的不进对比清单，否则一屏全是「持平」，真正的变化被埋掉
    if (a && b && a.label === b.label) continue;
    const sa = a ? a.sev : null;
    const sb = b ? b.sev : null;
    let dir = 'flat';
    if (sa !== null && sb !== null) {
      if (sb < sa) dir = 'better';
      else if (sb > sa) dir = 'worse';
    } else if (!a && b) dir = 'worse';
    else if (a && !b) dir = 'better';
    out.push({
      dimKey: k,
      dimLabel: DIM_MAP[k]?.label || k,
      prev: a ? { label: a.label, sev: a.sev, source: prev.dims[k]?.source, at: prev.at } : null,
      curr: b ? { label: b.label, sev: b.sev, source: curr.dims[k]?.source, at: curr.at } : null,
      dir,
      devicePrev: prev.device?.[k] ?? null,
      deviceCurr: curr.device?.[k] ?? null,
    });
  }
  // 变差的排前面，顾问要先看风险
  const w = { worse: 0, better: 1, flat: 2 };
  return out.sort((x, y) => w[x.dir] - w[y.dir]);
}

/* ================================================================ 6. 复盘 */

/** 单个客户复盘：状态、消费行为、跟进执行率、沉睡风险、触达建议 */
export function customerReview(customerId) {
  const profile = buildProfile(customerId);
  if (!profile) return null;
  const records = profile.records;
  const latest = records[0];
  const prev = records[1];
  const changes = compareRecords(prev, latest);
  const todos = getState().todos.filter((t) => t.customerId === customerId);
  const done = todos.filter((t) => t.status === 'done').length;
  const gap = profile.lastGap;
  const gapPrev = records[1] ? daysSince(records[1].at) - (gap || 0) : null;

  const risks = [];
  if (gap !== null && gap > 45) risks.push(`距上次到店 ${gap} 天，超过 45 天沉睡线`);
  if (gap !== null && gap > 30 && gap <= 45) risks.push(`距上次到店 ${gap} 天，接近沉睡线`);
  const worsened = changes.filter((c) => c.dir === 'worse');
  if (worsened.length) risks.push(`${worsened.map((w) => w.dimLabel).join('、')} 比上次退步`);
  const overdue = todos.filter((t) => t.status === 'open' && t.dueAt && new Date(t.dueAt) < new Date());
  if (overdue.length) risks.push(`${overdue.length} 条待办已过期`);

  // 触达建议
  let touch = null;
  const improved = changes.filter((c) => c.dir === 'better');
  if (gap !== null && gap > 45) {
    touch = { reason: `距上次到店 ${gap} 天`, action: '以复测为由唤醒，不谈新项目', script: `上次的${profile.needsRanked[0] ? NEED_META[profile.needsRanked[0].need]?.label : '状态'}记录还在，到现在该复测一次了，这次不收项目费。` };
  } else if (improved.length >= 2 && profile.needsRanked.length > 1) {
    touch = { reason: `${improved.slice(0, 2).map((i) => i.dimLabel).join('、')} 连续改善`, action: `可切入 ${NEED_META[profile.needsRanked[1].need]?.label}`, script: `数据在往好的方向走，下一步可以开始处理${NEED_META[profile.needsRanked[1].need]?.label}了。` };
  } else if (worsened.length) {
    touch = { reason: `${worsened[0].dimLabel} 退步`, action: '先排查近期护理与作息，不急着加项目', script: `这次${worsened[0].dimLabel}比上次明显，先看看最近是不是换产品了或者没睡好，别急着加项目。` };
  } else if (gap !== null && gap > 25) {
    touch = { reason: `距上次到店 ${gap} 天`, action: '按节奏提醒下次到店', script: `按我们的节奏，这两天该安排下一次了，您看周三还是周五方便。` };
  }

  return {
    profile,
    changes,
    improved,
    worsened,
    execRate: todos.length ? pct(done, todos.length) : null,
    todoTotal: todos.length,
    todoDone: done,
    risks,
    touch,
    visits: records.length,
    avgGap: records.length > 1
      ? Math.round(
          records.slice(0, -1).reduce((a, r, i) => a + (daysSince(r.at) - daysSince(records[i + 1].at)), 0) / (records.length - 1),
        )
      : null,
    level: profile.level,
  };
}

/** 门店复盘：转化漏斗、异议分布、升单执行率 */
export function storeReview(storeIds = null) {
  const list = customers();
  const filtered = storeIds ? list.filter((c) => storeIds.includes(c.storeId)) : list;
  const s = getState();

  // 漏斗按到店次数估算：1 次=体验，2-3 次=疗程中，4+ 次=复购
  const funnel = { trial: 0, course: 0, repeat: 0 };
  const levelDist = { new: 0, regular: 0, dormant: 0, vip: 0 };
  const silentRisk = [];
  for (const c of filtered) {
    const n = s.assessments.filter((a) => a.customerId === c.id).length;
    if (n <= 1) funnel.trial += 1;
    else if (n <= 3) funnel.course += 1;
    else funnel.repeat += 1;
    const lv = inferLevel(c);
    levelDist[lv.key] = (levelDist[lv.key] || 0) + 1;
    const gap = n ? daysSince(s.assessments.filter((a) => a.customerId === c.id).sort((x, y) => new Date(y.at) - new Date(x.at))[0].at) : null;
    if (gap !== null && gap > 45) silentRisk.push({ customer: c, gap });
  }

  // 异议分布：从信号统计
  const objectionMap = {};
  for (const c of filtered) {
    const recs = s.assessments.filter((a) => a.customerId === c.id).slice(-2);
    for (const r of recs) {
      for (const sig of r.signals || []) {
        if (!['price-sensitive', 'budget-cut', 'compare-clinic', 'fear-redness', 'quick-result'].includes(sig)) continue;
        const label = SIGNAL_MAP[sig]?.label || sig;
        objectionMap[label] = (objectionMap[label] || 0) + 1;
      }
    }
  }
  const objections = Object.entries(objectionMap)
    .map(([label, count]) => ({ label, count, ratio: pct(count, filtered.length) }))
    .sort((a, b) => b.count - a.count);

  // 升单执行率：带「升单 / 提亮 / 疗程」字样的待办完成情况
  const allTodos = s.todos.filter((t) => filtered.some((c) => c.id === t.customerId));
  const upsellTodos = allTodos.filter((t) => /升单|提亮|疗程|推进阶|复测/.test(t.content));
  const upsellDone = upsellTodos.filter((t) => t.status === 'done').length;

  // 跟进执行率
  const doneAll = allTodos.filter((t) => t.status === 'done').length;

  return {
    customerCount: filtered.length,
    funnel,
    funnelRates: {
      trialToCourse: pct(funnel.course + funnel.repeat, filtered.length),
      courseToRepeat: pct(funnel.repeat, funnel.course + funnel.repeat),
    },
    levelDist,
    objections,
    upsell: { total: upsellTodos.length, done: upsellDone, rate: upsellTodos.length ? pct(upsellDone, upsellTodos.length) : null },
    execRate: allTodos.length ? pct(doneAll, allTodos.length) : null,
    todoTotal: allTodos.length,
    todoDone: doneAll,
    silentRisk,
    // 结论要落在动作上，而不是只给数字
    actions: buildStoreActions(funnel, objections, upsellTodos, upsellDone, silentRisk),
    caveat: '转化漏斗按到店次数估算（1 次=体验 / 2–3 次=疗程中 / 4 次以上=复购），不是真实订单数据；接入订单系统后可替换为实际成交口径。',
  };
}

function buildStoreActions(funnel, objections, upsellTodos, upsellDone, silentRisk) {
  const acts = [];
  if (silentRisk.length) {
    acts.push({
      title: `先处理 ${silentRisk.length} 位沉睡客户`,
      detail: `超过 45 天未到店的客户：${silentRisk.slice(0, 3).map((x) => x.customer.name).join('、')}${silentRisk.length > 3 ? ' 等' : ''}。以复测为由触达，本周内完成第一轮。`,
      priority: '高',
    });
  }
  const topObj = objections[0];
  if (topObj && topObj.ratio >= 25) {
    acts.push({
      title: `统一「${topObj.label}」的应对话术`,
      detail: `近两轮记录里 ${topObj.count} 位客户出现该信号，占 ${topObj.ratio}%。把标准应对写进门店话术卡，避免每位顾问各说各的。`,
      priority: '高',
    });
  }
  if (upsellTodos.length && upsellDone / upsellTodos.length < 0.6) {
    acts.push({
      title: '升单节点执行率偏低',
      detail: `涉及升单/复测的待办 ${upsellTodos.length} 条，完成 ${upsellDone} 条。检查是不是节点设得太早——效果没被感知时推进阶，客户只会觉得在推销。`,
      priority: '中',
    });
  }
  if (funnel.trial > funnel.course + funnel.repeat) {
    acts.push({
      title: '体验客占比过高',
      detail: `体验期客户 ${funnel.trial} 位，进入疗程的只有 ${funnel.course + funnel.repeat} 位。问题多半在首次体验后的 72 小时内没有跟进，而不是项目本身。`,
      priority: '中',
    });
  }
  if (!acts.length) {
    acts.push({ title: '当前没有明显卡点', detail: '各项执行率正常，按现有节奏推进即可。', priority: '低' });
  }
  return acts;
}
