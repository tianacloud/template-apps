/**
 * nlq.js — 顾问自然语言问答
 *
 * 不是通用聊天：先把问句拆成「时间窗 + 维度 + 否定条件 + 意图」，再到档案/记录/品项库里查，
 * 最后用查到的数据组织回答。查不到就直说查不到，不编造检测值或产品成分。
 * 每条回答都附带 sources（记录时间 + 类型），顾问可以逐条核对。
 */

import {
  DIMENSIONS, DIM_MAP, findDimValue, NEED_META, SIGNAL_MAP,
} from './taxonomy.js';
import {
  customers, assessmentsOf, customerById, displayName, daysSince, fmtDate,
  activeItems, getState, scope, todosOf, scriptsOf, openTodos,
} from './db.js';
import { compareRecords, rankNeeds, buildProfile, trendOf } from './engine.js';

/* ---------------------------------------------------------------- 词表 */

/** 维度关键词 → dimKey。同一维度给多种口语说法，顾问不会按文档提问。 */
const DIM_WORDS = [
  { dim: 'barrier', words: ['屏障', '泛红', '刺痛', '敏感', '红血丝', '薄'] },
  { dim: 'pigment', words: ['斑', '色素', '痘印', '暗沉', '提亮', '色沉', '肤色不均'] },
  { dim: 'hydration', words: ['干', '缺水', '含水量', '卡粉', '起皮'] },
  { dim: 'oil', words: ['油', '出油', '泛油'] },
  { dim: 'acne', words: ['痘', '闭口', '粉刺', '痤疮'] },
  { dim: 'wrinkle', words: ['纹', '紧致', '松弛', '下垂', '法令纹', '抗衰'] },
  { dim: 'pores', words: ['毛孔', '粗糙', '纹理'] },
  { dim: 'eye', words: ['眼周', '黑眼圈', '眼袋', '浮肿'] },
  { dim: 'skinType', words: ['肤质', '混合肌', '干性', '油性'] },
];

/** 需求关键词 → need key，用于品项组合类提问 */
const NEED_WORDS = [
  { need: 'barrier', words: ['屏障', '修护', '敏感'] },
  { need: 'pigment', words: ['提亮', '美白', '斑', '色素'] },
  { need: 'wrinkle', words: ['抗衰', '紧致', '纹', '提升'] },
  { need: 'acne', words: ['痘', '控痘', '闭口'] },
  { need: 'hydration', words: ['补水', '保湿', '干'] },
  { need: 'eye', words: ['眼周', '眼袋', '黑眼圈'] },
  { need: 'oil', words: ['控油', '出油'] },
  { need: 'pore', words: ['毛孔'] },
  { need: 'clean', words: ['清洁', '黑头'] },
  { need: 'soothe', words: ['舒缓', '镇静'] },
];

/* ---------------------------------------------------------------- 解析 */

function detectDims(q) {
  const hits = [];
  for (const d of DIM_WORDS) {
    if (d.words.some((w) => q.includes(w))) hits.push(d.dim);
  }
  return [...new Set(hits)];
}

function detectNeeds(q) {
  const hits = [];
  for (const n of NEED_WORDS) {
    if (n.words.some((w) => q.includes(w))) hits.push(n.need);
  }
  return [...new Set(hits)];
}

function detectWindow(q) {
  let m = q.match(/(\d+)\s*天/);
  if (m) return { days: Number(m[1]), label: `最近 ${m[1]} 天` };
  if (/近一周|最近一周|这周/.test(q)) return { days: 7, label: '最近 7 天' };
  if (/近两周|最近两周/.test(q)) return { days: 14, label: '最近 14 天' };
  if (/最近一个月|近一个月|本月/.test(q)) return { days: 30, label: '最近 30 天' };
  if (/近三个月|这季度|本季度/.test(q)) return { days: 90, label: '最近 90 天' };
  return { days: 30, label: '最近 30 天' };
}

function detectNegation(q) {
  // 「没做过」「还没上」「没有安排」这类否定，用于"哪些客户有问题但还没处理"
  const m = q.match(/(?:还没有?|没)\s*(?:做过|安排|上|推|开始|体验过)([^，。？?]+)/);
  if (m) return m[1].trim();
  if (/还没|没有处理|未跟进|没安排/.test(q)) return '相关项目';
  return null;
}

/** 从问句里找人名，支持「张女士」「李静」「姓张的」 */
function findCustomerByName(q) {
  const list = customers();
  // 全名优先
  for (const c of list) {
    if (q.includes(c.name)) return c;
  }
  const m = q.match(/([\u4e00-\u9fa5])\s*(女士|先生|姐|小姐)/);
  if (m) {
    const hit = list.filter((c) => c.name.startsWith(m[1]));
    if (hit.length === 1) return hit[0];
    if (hit.length > 1) return hit;
  }
  const m2 = q.match(/姓([\u4e00-\u9fa5])/);
  if (m2) {
    const hit = list.filter((c) => c.name.startsWith(m2[1]));
    if (hit.length === 1) return hit[0];
    if (hit.length > 1) return hit;
  }
  return null;
}

function detectIntent(q) {
  if (/哪些客户|谁|有没有人|哪些人|名单|找出/.test(q)) return 'find-customers';
  if (/对比|变化|比较|差异|趋势/.test(q)) return 'compare';
  if (/哪些品项|怎么组合|可以做什么|什么项目|项目组合|方案|推荐/.test(q)) return 'recommend';
  if (/多少|几个|统计|占比|分布/.test(q)) return 'stats';
  return 'fallback';
}

/* ---------------------------------------------------------------- 回答 */

function srcLine(rec, extra = '') {
  return `${fmtDate(rec.at, true)} · 面诊记录${extra}`;
}

/** 意图一：按条件筛客户 */
function answerFindCustomers(q) {
  const dims = detectDims(q);
  const win = detectWindow(q);
  const neg = detectNegation(q);
  const needHint = detectNeeds(q)[0] || (dims[0] ? dimToNeed(dims[0]) : null);

  const pool = customers();
  const matched = [];
  const scanned = [];

  for (const c of pool) {
    const recs = assessmentsOf(c.id);
    if (!recs.length) { scanned.push({ c, reason: '无面诊记录' }); continue; }
    const inWindow = recs.filter((r) => daysSince(r.at) <= win.days);
    if (!inWindow.length) { scanned.push({ c, reason: `${win.days} 天内无记录` }); continue; }
    const latest = inWindow[0];

    // 维度条件
    let dimHit = null;
    if (dims.length) {
      for (const dk of dims) {
        const d = latest.dims?.[dk];
        const val = d ? findDimValue(dk, d.v) : null;
        if (val && val.sev > 0) { dimHit = { dimKey: dk, val, rec: latest }; break; }
      }
      if (!dimHit) { scanned.push({ c, reason: '本次无该维度问题' }); continue; }
    }

    // 否定条件：查已有话术/待办/跟进里是否已经涉及
    let handled = null;
    if (neg && needHint) {
      const label = NEED_META[needHint]?.label || '';
      const sc = scriptsOf(c.id);
      const ts = todosOf(c.id);
      const fs = getState().follows.filter((f) => f.customerId === c.id);
      const text = [...sc.map((x) => x.layers?.advise || ''), ...ts.map((x) => x.content), ...fs.map((x) => x.content)].join(' ');
      if (text.includes(label) || text.includes('修护') && needHint === 'barrier' || text.includes('提亮') && needHint === 'pigment') {
        handled = '已有相关话术或待办';
      }
    }
    if (neg && handled) { scanned.push({ c, reason: handled }); continue; }

    matched.push({ customer: c, rec: latest, hit: dimHit });
  }

  if (!matched.length) {
    return {
      text: `${win.label}内没有找到符合条件的客户。\n\n已核对 ${pool.length} 位客户，排除原因分别是：${summarizeSkip(scanned)}。\n\n如果要放宽条件，可以把时间窗拉到 90 天，或者去掉「还没做过」这个限制。`,
      sources: [`检索范围：${win.label} · ${pool.length} 位可见客户`],
      list: [],
    };
  }

  const lines = matched.map((m, i) => {
    const tag = m.hit ? `${DIM_MAP[m.hit.dimKey].label}：${m.hit.val.label}` : '按时间窗命中';
    return `${i + 1}. ${displayName(m.customer)}（${m.customer.age || '—'} 岁，${m.customer.ownerId === scope().me.id ? '本人负责' : '同事负责'}）— ${tag}，${daysSince(m.rec.at)} 天前记录`;
  });

  let text = `${win.label}内**符合条件的有 ${matched.length} 位**：\n\n${lines.join('\n')}\n\n`;
  if (neg) {
    text += `「${neg}」这一条是按本系统的面诊话术、待办与跟进记录判断的，不代表真实消费记录——门店还没有接入订单数据，所以不能确认客户是否在别处做过同类项目。建议在沟通时直接问一句。`;
  } else {
    text += `以上按最近一次面诊记录判断，不是历史累计。要排除已经处理过的客户，可以在问句里加上「还没做过 XX」。`;
  }

  return {
    text,
    sources: matched.slice(0, 5).map((m) => `${displayName(m.customer)}：${srcLine(m.rec)}`),
    list: matched.map((m) => m.customer.id),
  };
}

function dimToNeed(dimKey) {
  const map = { barrier: 'barrier', pigment: 'pigment', hydration: 'hydration', oil: 'oil', acne: 'acne', wrinkle: 'wrinkle', pores: 'pore', eye: 'eye', skinType: 'hydration' };
  return map[dimKey] || null;
}

function summarizeSkip(scanned) {
  const m = {};
  for (const s of scanned) {
    const key = s.reason.replace(/\d+ 天内无记录/, '时间窗外').replace(/：.*/, '');
    m[key] = (m[key] || 0) + 1;
  }
  return Object.entries(m).map(([k, v]) => `${k} ${v} 位`).join('，') || '无';
}

/** 意图二：两次记录对比 */
function answerCompare(q, target) {
  if (!target) {
    return {
      text: '要对比哪位客户？可以说「张女士上次和这次的色斑记录对比」，或者直接在客户档案里打开任意一位，页面上有逐维度对比。',
      sources: [],
      list: [],
    };
  }
  if (Array.isArray(target)) {
    return {
      text: `匹配到 ${target.length} 位：${target.map((c) => displayName(c)).join('、')}。请说全名，或者直接在档案里查看。`,
      sources: [],
      list: target.map((c) => c.id),
    };
  }

  const recs = assessmentsOf(target.id);
  if (recs.length < 2) {
    return {
      text: `${displayName(target)}目前只有 ${recs.length} 次记录，还没有可对比的两次数据。${recs.length === 1 ? `最近一次是 ${fmtDate(recs[0].at, true)}。` : ''}`,
      sources: recs.map((r) => srcLine(r)),
      list: [target.id],
    };
  }

  const curr = recs[0];
  const prev = recs[1];
  const dims = detectDims(q);
  let changes = compareRecords(prev, curr);
  if (dims.length) {
    const filtered = changes.filter((c) => dims.includes(c.dimKey));
    if (filtered.length) changes = filtered;
  }

  const better = changes.filter((c) => c.dir === 'better');
  const worse = changes.filter((c) => c.dir === 'worse');
  const flat = changes.filter((c) => c.dir === 'flat');

  const body = changes.map((c) => {
    const arrow = c.dir === 'better' ? '↑ 改善' : c.dir === 'worse' ? '↓ 退步' : '→ 持平';
    let line = `· ${c.dimLabel}：${c.prev?.label || '未记录'} → ${c.curr?.label || '未记录'}（${arrow}）`;
    if (c.devicePrev !== null && c.deviceCurr !== null) line += `，仪器值 ${c.devicePrev} → ${c.deviceCurr}`;
    if (c.curr?.source) line += `，本次来源：${c.curr.source === 'device' ? '仪器' : c.curr.source === 'self' ? '客户自述' : '顾问目测'}`;
    return line;
  });

  let text = `${displayName(target)} · ${fmtDate(prev.at)} 与 ${fmtDate(curr.at)} 两次记录对比（间隔 ${daysSince(prev.at) - daysSince(curr.at)} 天）：\n\n${body.join('\n')}\n\n`;
  if (better.length && !worse.length) text += `整体在往好的方向走。${better[0].dimLabel}是这次最明显的一项，可以在下次沟通里拿这一项作为继续的依据。`;
  else if (worse.length) text += `有 ${worse.length} 项退步（${worse.map((w) => w.dimLabel).join('、')}），先排查最近的作息和产品变动，不要急着加项目。`;
  else if (flat.length === changes.length) text += `两次记录基本持平，说明现在的护理方式是稳的，可以按原节奏继续。`;
  else text += `既有改善也有退步，建议按维度拆开看，别用一句「好多了」概括。`;

  if (worse.some((w) => w.dimKey === 'pigment') && dims.includes('pigment')) {
    text += '\n\n色素类指标受光线与拍摄角度影响，仪器值波动 2 个点以内不建议当成变化，判断要看连续三次。';
  }

  return {
    text,
    sources: [srcLine(prev, '（上次）'), srcLine(curr, '（本次）')],
    list: [target.id],
  };
}

/** 意图三：品项组合 */
function answerRecommend(q) {
  const needs = detectNeeds(q);
  if (!needs.length) {
    return {
      text: '告诉我方向就行，比如「敏感肌 + 抗衰」「屏障 + 提亮」「痘肌 + 痘印」，我从院内品项库里按顺序组合，并说明哪一步不能提前。',
      sources: [],
      list: [],
    };
  }

  const items = activeItems().filter((i) => i.kind === 'service');
  const scored = items
    .map((it) => ({ it, matched: it.needs.filter((n) => needs.includes(n)) }))
    .filter((x) => x.matched.length > 0);

  const entry = scored.filter((x) => x.it.tier === 'entry').sort((a, b) => b.matched.length - a.matched.length || a.it.price - b.it.price);
  const course = scored.filter((x) => x.it.tier === 'course').sort((a, b) => b.matched.length - a.matched.length || a.it.price - b.it.price);
  const home = activeItems().filter((i) => i.kind === 'home' && i.needs.some((n) => needs.includes(n)));

  if (!entry.length && !course.length) {
    return {
      text: `品项库里没有直接对应 ${needs.map((n) => NEED_META[n]?.label).join(' + ')} 的项目。要么是先补品项，要么这个组合需要拆成两步看。`,
      sources: ['检索范围：店内品项库（服务类）'],
      list: [],
    };
  }

  // 顺序规则：修护类永远在最前，色素/紧致类永远在后
  const hasBarrier = needs.includes('barrier') || needs.includes('soothe');
  const hasActive = needs.includes('pigment') || needs.includes('wrinkle');
  let order = '';
  if (hasBarrier && hasActive) {
    order = `这个组合不能同时开。**先修护、再活性**：屏障没稳的时候上皮提亮或紧致，反黑和刺痛的概率明显上升。先把修护做完 2–3 次，复测确认泛红与刺痛都消失，再进第二步。`;
  } else if (needs.includes('acne') && needs.includes('pigment')) {
    order = `痘没控制住之前不提亮。先做消炎与疏通，等不再有新发的痘，再处理痘印，否则一边淡一边长，客户会觉得没效果。`;
  } else {
    order = `这几项方向一致，可以并行推进，但仍然建议先做一次体验确认耐受，再排疗程。`;
  }

  const fmtItem = (x, idx) => {
    const it = x.it || x;
    const matched = x.matched || it.needs.filter((n) => needs.includes(n));
    return `${idx + 1}. **${it.name}** — ${it.price} 元${it.sessions ? ` / ${it.sessions} 次` : ' / 单次'}${it.cycleDays ? `，周期 ${it.cycleDays} 天` : ''}\n   对应：${matched.map((n) => NEED_META[n]?.label).join('、')}${it.caution ? `\n   注意：${it.caution}` : ''}`;
  };

  const parts = [];
  if (entry.length) parts.push(`**第一步（入门层，先看反应）**\n${entry.slice(0, 2).map(fmtItem).join('\n')}`);
  if (course.length) parts.push(`**第二步（进阶层，按代谢周期排）**\n${course.slice(0, 2).map(fmtItem).join('\n')}`);
  if (home.length) parts.push(`**居家层（效果的延续，最多 3 件）**\n${home.slice(0, 3).map((h, i) => `${i + 1}. ${h.name} — ${h.price} 元：${h.desc}`).join('\n')}`);

  return {
    text: `按 ${needs.map((n) => NEED_META[n]?.label).join(' + ')} 从院内品项库检索：\n\n${parts.join('\n\n')}\n\n**排列原则**\n${order}\n\n以上全部来自店内品项库的既定字段（适用方向、周期、禁忌），没有外部推断。`,
    sources: [`检索范围：店内品项库 ${items.length} 项（服务类）`, `匹配方向：${needs.map((n) => NEED_META[n]?.label).join('、')}`],
    list: [],
  };
}

/** 意图四：统计 */
function answerStats(q) {
  const dims = detectDims(q);
  const win = detectWindow(q);
  const pool = customers();
  const recs = [];
  for (const c of pool) {
    for (const r of assessmentsOf(c.id)) {
      if (daysSince(r.at) <= win.days) recs.push({ c, r });
    }
  }
  if (!recs.length) {
    return { text: `${win.label}内没有面诊记录，暂时统计不出东西。`, sources: [], list: [] };
  }

  if (dims.length) {
    const dk = dims[0];
    const counts = {};
    for (const { r } of recs) {
      const d = r.dims?.[dk];
      if (!d) continue;
      const v = findDimValue(dk, d.v);
      if (!v || v.sev === 0) continue;
      counts[v.label] = (counts[v.label] || 0) + 1;
    }
    const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (!rows.length) return { text: `${win.label}的 ${recs.length} 条记录里，没有客户在「${DIM_MAP[dk].label}」上有问题记录。`, sources: [], list: [] };
    return {
      text: `${win.label}共 ${recs.length} 条面诊记录，其中「${DIM_MAP[dk].label}」的问题分布：\n\n${rows.map(([k, v]) => `· ${k}：${v} 条（占记录数 ${Math.round((v / recs.length) * 100)}%）`).join('\n')}\n\n按人数而不是记录数统计会更准——同一位客户两次记录会算两条。`,
      sources: [`统计口径：${win.label} · ${recs.length} 条面诊记录 · ${pool.length} 位可见客户`],
      list: [],
    };
  }

  return {
    text: `${win.label}共 ${recs.length} 条面诊记录，覆盖 ${new Set(recs.map((x) => x.c.id)).size} 位客户。想知道具体维度，可以在问句里带上「屏障」「色斑」「痘痘」这类词。`,
    sources: [`统计口径：${win.label}`],
    list: [],
  };
}

/* ---------------------------------------------------------------- 入口 */

const SUGGESTIONS = [
  '最近 30 天哪些客户屏障偏弱但还没做过修护项目',
  '张女士上次和这次的色斑记录有什么变化',
  '针对敏感肌 + 抗衰需求，院内有哪些品项可以组合',
  '最近 30 天出油偏多的客户有多少',
];

export function ask(query) {
  const q = (query || '').trim();
  if (!q) return { text: '问点什么吧。', sources: [], list: [], intent: 'empty' };

  const intent = detectIntent(q);
  const target = findCustomerByName(q);

  try {
    if (intent === 'find-customers') return { ...answerFindCustomers(q), intent };
    if (intent === 'compare') return { ...answerCompare(q, target), intent };
    if (intent === 'recommend') return { ...answerRecommend(q), intent };
    if (intent === 'stats') return { ...answerStats(q), intent };

    // 兜底：如果问句里有人名，就给这位客户的档案摘要
    if (target && !Array.isArray(target)) {
      const p = buildProfile(target.id);
      const recs = p.records;
      return {
        intent: 'profile',
        text: `${displayName(target)}，${target.age || '—'} 岁，${p.level.label}，累计 ${recs.length} 次面诊记录${recs.length ? `，最近一次 ${fmtDate(recs[0].at)}` : ''}。\n\n主要标签：${Object.values(p.buckets).flatMap((b) => b.items.map((i) => i.text)).join('、') || '暂无'}\n\n可以接着问：「${displayName(target)}上次和这次对比」「${displayName(target)}的待办还有哪些」。`,
        sources: recs.slice(0, 2).map((r) => srcLine(r)),
        list: [target.id],
      };
    }

    return {
      intent: 'fallback',
      text: `这个问题我还答不了——我只能基于店内的客户档案、面诊记录和品项库回答，不猜。\n\n可以换这几种问法：\n${SUGGESTIONS.map((s) => `· ${s}`).join('\n')}\n\n或者去「客户档案」里直接筛。`,
      sources: [],
      list: [],
    };
  } catch (e) {
    console.error('[nlq] 查询失败', e);
    return {
      intent: 'error',
      text: `查询出错了（${e.message}）。这不是您的操作问题，换个问法或者刷新页面再试一次。`,
      sources: [],
      list: [],
    };
  }
}

export { SUGGESTIONS };

/** 待办到期判断 */
export function todoHealth(customerId) {
  const open = openTodos(customerId);
  const overdue = open.filter((t) => t.dueAt && new Date(t.dueAt) < new Date());
  return { open: open.length, overdue: overdue.length, items: open };
}
