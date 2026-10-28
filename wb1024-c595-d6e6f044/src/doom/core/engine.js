/**
 * core/engine.js —— 末日生存模拟器 · 运行层
 *
 * 和人生模拟器同构，但推进单位是「天」而不是「岁」：
 *   1. 时间从第 0 天走到第 1500 天（四年多）
 *   2. 每过一个阶段（冬天/夏天），结算一次消耗：存货 - 人数 × 天数，冬天翻倍
 *   3. 四项里 health / morale 归零 → 直接结束（不同的死法）
 *      supply 归零 → 开始掉体力，掉到底也算饿死
 *   4. 撑到第 1500 天活着 = 活下来了，按四项 + 人数 + 天数算结局
 *
 * 文案全部在 data.js / events*.js，这里只认识效果。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./data'), require('./generator'))
  } else {
    root.DoomEngine = factory(root.DoomData, root.DoomGen)
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (data, gen) {

const { TALENTS, ORIGINS, STAGES, EVENTS, ENDINGS, PLIGHTS, ADVICE } = data
const { composeEvent, composeEnding, composeAdvice } = gen

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const rnd = (a, b) => a + Math.random() * (b - a)
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

const TOTAL_DAYS = 1500

/* 每个阶段的时间跨度（天）与消耗系数（冬天 > 夏天） */
const STAGE_SPAN = {
  2: { from: 0, to: 45, name: '第一个月' },
  3: { from: 45, to: 150, name: '第一个冬天' },
  4: { from: 150, to: 330, name: '第二个春天' },
  5: { from: 330, to: 520, name: '第二年冬天' },
  6: { from: 520, to: 1000, name: '第三年' },
  7: { from: 1000, to: 1500, name: '第四年' }
}

/*
 * 消耗模型：supply 的语义是「够撑多少天」。
 * 每过一段，扣掉这一段的日历天数 × 消耗系数（冬天 ×1.6，人越多越快）。
 * 事件里给/扣的 supply 也是天数（+12 = 又攒出十二天的量）。
 *
 * 这样有两个好处：
 *   1. 「还有 9 天」是玩家能直接读懂的紧张感；
 *   2. 拾荒 +12 天在 40 天的冬天里是实打实的三分之一，
 *      不会出现「比例消耗下 +12 追不上」的数学陷阱。
 *
 * 短缺不是立刻死：short 记下来，扣体力扣心气。
 * 只有「连着几段都在短 + 体力见底」才会真的饿死，这才叫过程。
 */
const EAT = { 2: 1.0, 3: 1.6, 4: 1.05, 5: 1.7, 6: 1.15, 7: 1.1 }

/* 每个阶段「过日子」本身的体力损耗（按 60 天一段累计，冬天更重） */
const WEAR = { 2: 2.2, 3: 4.2, 4: 2.6, 5: 5, 6: 5, 7: 4.2 }

/*
 * 恢复：每一段没饿着 + 据点像样时，体力和心气回升一点。
 *
 * 数值关系（每 60 天为一段）：
 *   事件损耗 约 -2/条 × 5 条 = -10
 *   日常磨损 WEAR
 *   恢复    RECOVER × camp 加成（0.75~1.4）
 * 要求：恢复略小于「损耗之和」，让长期曲线是缓慢下滑而不是缓慢回升——
 * 末日不是养成游戏，玩家应该越活越薄，而不是越活越壮。
 * 但差额必须小（3~5），否则变成稳步下滑的必死局。
 */
const RECOVER = {
  2: { health: 5, morale: 4 },
  3: { health: 6, morale: 5 },
  4: { health: 8, morale: 6 },
  5: { health: 6, morale: 5 },
  6: { health: 7, morale: 5 },
  7: { health: 6, morale: 5 }
}

/* ------------------------- 初始状态 ------------------------- */

function rollOrigin() {
  const total = ORIGINS.reduce((a, o) => a + o.weight, 0)
  let r = Math.random() * total
  for (const o of ORIGINS) { r -= o.weight; if (r <= 0) return o }
  return ORIGINS[0]
}

function rollTalents() {
  const pool = TALENTS.filter(t => t.id !== 'ordinary')
  const n = Math.random() < 0.22 ? 2 : 1
  const out = []
  const copy = pool.slice()
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
  }
  if (Math.random() < 0.1) out.length = 0
  if (!out.length) out.push(TALENTS.find(t => t.id === 'ordinary'))
  return out
}

function createSurvivor(opts) {
  opts = opts || {}
  const origin = rollOrigin()
  const talents = rollTalents()

  const s = {
    stage: 1,
    day: 0,
    cursor: 0,
    origin,
    talents,
    gender: opts.gender === 'm' || opts.gender === 'f' ? opts.gender : (Math.random() < 0.5 ? 'm' : 'f'),
    genderPicked: opts.gender === 'm' || opts.gender === 'f',

    health: Math.round(clamp(rnd(64, 82), 40, 96)),
    morale: Math.round(clamp(origin.morale + rnd(-6, 6), 20, 80)),
    supply: Math.round(rnd(origin.supply[0], origin.supply[1])),
    camp: Math.round(rnd(origin.camp[0], origin.camp[1])),
    people: 1,

    flags: [],
    log: [],
    mem: [],
    death: null,
    done: false,
    timeline: null,
    seenEvents: {}
  }

  talents.forEach(t => {
    applyEffects(s, t.effects)
    if (t.flag) s.flags.push(t.flag)
    if (t.id === 'medic') s.flags.push('medic')
    if (t.id === 'mechanic') s.flags.push('mechanic')
    if (t.id === 'hunter') s.flags.push('hunter')
    if (t.id === 'gardener') s.flags.push('gardener')
    if (t.id === 'veteran') s.flags.push('veteran')
    if (t.id === 'cold_blood') s.flags.push('cold_blood')
    if (t.id === 'silver_tongue') s.flags.push('silver_tongue')
    if (t.id === 'prepper') s.flags.push('prepper')
    if (t.id === 'watcher') s.flags.push('watcher')
    if (t.id === 'packrat') s.flags.push('packrat')
  })

  s.supply = Math.max(0, s.supply)
  s.timeline = buildTimeline(s)
  return s
}

/* ------------------------- 数值 ------------------------- */

/*
 * 数值上是「体力和心气都不会被一击打死」。
 * 重罚事件（火、病、抢劫）动辄 -14~-21，而体力满值只有 90 左右、
 * 一阶段恢复 9~12——如果一击就能扣掉 1/5 到 1/4，那玩家几乎没有容错，
 * 一个倒霉的连招就死了，选择变得无关紧要。
 *
 * 所以这里给「重罚」设一个软下限：health 不会被一次事件打到 12 以下，
 * morale 不会被一次事件打到 8 以下。剩下的差额转成「虚弱」（flag 'weak'），
 * 在后面的阶段里持续表现出来（产出打折、文案变差），而不是当场判死。
 * 这样死亡仍然可能出现（连续几段压着 12 就会），但是「磨死的」，不是「秒死的」。
 */
const HEALTH_SOFT_FLOOR = 12
const MORALE_SOFT_FLOOR = 8

function applyEffects(s, ef) {
  if (!ef) return
  Object.keys(ef).forEach(k => {
    if (k === 'people') {
      s.people = Math.max(0, Math.round((s.people || 1) + ef[k]))
      return
    }
    if (k === 'supply') {
      s.supply = Math.max(0, Math.min(SUPPLY_CAP, s.supply + ef[k]))
      return
    }
    if (k === 'flag') return
    if (typeof s[k] !== 'number') return

    let delta = ef[k]

    /*
     * 边际递减：往 100 推的收益越推越小。
     * 没有这个，camp（事件里平均 +4，几乎没人扣）会一路顶满 100，
     * 而 camp 满 = 产出满 = 永动机，「盯着一个维度堆」就能无敌。
     * 递减后的实际收益 = delta × (1 - cur/130)，即 0 时全额、100 时只剩 23%。
     */
    if (delta > 0 && (k === 'camp' || k === 'morale' || k === 'health')) {
      delta = delta * (1 - Math.min(0.78, s[k] / 130))
    }

    let v = s[k] + delta
    if (k === 'health' && delta < 0 && v < HEALTH_SOFT_FLOOR && s.health > HEALTH_SOFT_FLOOR) {
      v = HEALTH_SOFT_FLOOR
    }
    if (k === 'morale' && delta < 0 && v < MORALE_SOFT_FLOOR && s.morale > MORALE_SOFT_FLOOR) {
      v = MORALE_SOFT_FLOOR
    }
    s[k] = Math.round(clamp(v, 0, 100))
  })
}

/* 无视软下限的强制扣减：只有「阶段短缺」和「终局判定」才用它 */
function rawDamage(s, ef) {
  Object.keys(ef).forEach(k => {
    if (typeof s[k] === 'number') s[k] = Math.round(clamp(s[k] + ef[k], 0, 100))
  })
}

/* 心气的自然衰减：活着的日子久了，人会麻木。
 * 有人一起活会好一点——这是「人数」在数值上的第二个作用 */
/*
 * 心气与据点的自然衰减（都在 drift 里，按天数算）：
 *   morale 无原因地往下掉——日子久了人会麻；
 *   camp   会坏——墙要修、发电机要换油、屋顶会漏。
 * 两者都不该「修好了就一直好」，否则堆满就永久免疫。
 */
function drift(s, days) {
  // 心气自然下滑：每天 0.011（60 天段约 -0.66，1500 天约 -16），人多能减缓
  const decay = 0.011 * days * (1 - Math.min(0.55, (s.people - 1) * 0.09))
  s.morale = Math.round(clamp(s.morale - decay, 0, 100))

  // 据点老化：每天 0.016（60 天段约 -1，1500 天约 -24），越好的据点维护越费
  const wear = 0.016 * days * (1 + Math.max(0, (s.camp - 60)) / 120)
  s.camp = Math.round(clamp(s.camp - wear, 0, 100))

  if (s.health > 90) s.health = 90
}

/*
 * 阶段间的「过日子」结算：
 *   1. 存货按比例消耗（冬天快），不够就记账到 short
 *   2. 短缺 → 掉体力、掉心气；体力低的人短缺更致命
 *   3. 日常磨损：每个阶段体力和心气都掉一点，冬天更多
 *   4. 心气自然衰减（麻木）
 *
 * 关键防死循环：存货耗尽时给一个「底」（FLOOR），
 * 意思是拾荒、挖、钓、换——总还能弄到一点，只是不够。
 * 没有这个底，supply 一旦归零，后续 "+6" 的绝对值补偿永远追不上比例消耗，
 * 玩家会在剩下 1000 天里持续饿死，纯粹是数学问题，不是叙事问题。
 */
const SUPPLY_FLOOR = 4
const SUPPLY_CAP = 120

/*
 * 基础产出：每一段日子里，你总会有些常规收成——拾荒、钓鱼、挖根、换。
 * 这是「日子本身」的入账，和事件无关；events 里给的是额外的（运气好/下了狠手/碰上出手大方的）。
 *
 * 数值是按「消耗 - 事件期望」反推的：
 *   每段消耗 = 天数 × EAT × 0.62；事件里 supply 的平均期望约 -1/条、单段 5~7 条事件。
 *   所以产出必须覆盖绝大部分消耗，否则玩家必死，且死法全是饿死。
 *
 * 产出的三个修正：
 *   camp   据点越好，产得越多（有墙有地窖才存得住东西）
 *   health 人垮了干不动，产出打折
 *   people 人多手多，但嘴也多（在 consume 里扣）
 * 天赋 gardener / hunter / prepper 有额外加成。
 */
const YIELD_RATE = { 2: 0.52, 3: 1.12, 4: 0.76, 5: 1.24, 6: 0.90, 7: 0.86 }

function harvest(s, stage, days) {
  const rate = YIELD_RATE[stage] || 0.8
  const base = days * rate * (0.80 + Math.min(0.40, s.camp / 220))
  // 体力影响产出，但下限设到 0.72：垮掉的人干得慢，不会完全干不动
  const healthMod = 0.72 + Math.min(0.33, s.health / 150)
  let out = base * healthMod * rnd(0.88, 1.14)
  if (s.flags.indexOf('gardener') >= 0) out += 18
  if (s.flags.indexOf('hunter') >= 0) out += 15
  if (s.flags.indexOf('prepper') >= 0) out += 9
  if (s.flags.indexOf('packrat') >= 0) out += 6
  out += Math.max(0, s.people - 1) * 4
  return Math.round(out)
}

function consume(s, stage, days) {
  const eat = EAT[stage] || 1.1
  const rate = 1 + Math.max(0, (s.people - 1)) * 0.28
  const need = Math.max(2, Math.round(days * eat * rate * 0.62))
  if (s.supply >= need) {
    s.supply -= need
    return { short: 0, need, spent: need, gain: 0 }
  }
  const short = need - s.supply
  s.supply = SUPPLY_FLOOR
  return { short, need, spent: 0, gain: 0 }
}

/* ------------------------- 时间线 ------------------------- */

const STAGE_PLAN = { 2: 5, 3: 5, 4: 5, 5: 5, 6: 6, 7: 5 }
const FAMILY_SHARE = 0.4

function sampleByFamily(arr, n, used) {
  const pool = arr.slice()
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = pool[i]; pool[i] = pool[j]; pool[j] = t
  }
  const out = []
  const keyOf = e => e.family || e.id
  for (let i = 0; i < pool.length && out.length < n; i++) {
    const k = keyOf(pool[i])
    if (used[k]) continue
    used[k] = true
    out.push(pool[i])
  }
  if (out.length < n) {
    for (let i = 0; i < pool.length && out.length < n; i++) {
      if (out.indexOf(pool[i]) < 0) out.push(pool[i])
    }
  }
  return out
}

function buildTimeline(s) {
  const byStage = {}
  EVENTS.forEach(e => {
    if (!byStage[e.stage]) byStage[e.stage] = []
    byStage[e.stage].push(e)
  })

  let merged = []
  const usedFamily = {}
  let famCarry = 0

  ;[2, 3, 4, 5, 6, 7].forEach(stage => {
    const all = byStage[stage] || []
    const fixed = all.filter(e => e.pinned && !e.slot)

    const slotNames = []
    all.forEach(e => { if (e.slot && slotNames.indexOf(e.slot) < 0) slotNames.push(e.slot) })
    const slotPicked = slotNames.map(name => pick(all.filter(e => e.slot === name)))
      .filter(Boolean)

    const always = all.filter(e => e.always)
    const optional = all.filter(e => !e.pinned && !e.slot && !e.always)

    const need = Math.max(1, (STAGE_PLAN[stage] || 5) - fixed.length - slotPicked.length)
    const famPool = optional.filter(e => e.family)
    const soloPool = optional.filter(e => !e.family)
    famCarry += need * FAMILY_SHARE
    const famQuota = Math.min(Math.floor(famCarry), famPool.length)
    famCarry -= famQuota
    const soloQuota = Math.max(0, need - famQuota)

    const picked = sampleByFamily(soloPool, soloQuota, usedFamily)
      .concat(sampleByFamily(famPool, famQuota, usedFamily))

    merged = merged.concat(fixed, slotPicked, always, picked)
  })

  // 生成式事件：按局面现场拼 2~3 个
  const ctx = { usedTpls: new Set() }
  const n = 2 + (Math.random() < 0.4 ? 1 : 0)
  for (let i = 0; i < n; i++) {
    const ev = composeEvent(s, ctx)
    if (ev) merged.push(ev)
  }

  return merged
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (a.e.day || 0) - (b.e.day || 0) || (a.e.order || 0) - (b.e.order || 0) || a.i - b.i)
    .map(x => x.e)
}

/* ------------------------- 条件与变体 ------------------------- */

function hashOf(key) {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

function eventChance(s, ev) {
  return hashOf(ev.id + '|' + (s.health || 0) + '|' + (s.morale || 0) + '|' +
    (s.supply || 0) + '|' + (s.people || 1) + '|' + (s.gender || ''))
}

function variantIndex(s, tag, len) {
  if (len <= 1) return 0
  const i = Math.floor(hashOf(tag + '|' + (s.health || 0) + '|' + (s.people || 1) + '|' + (s.supply || 0)) * len)
  return i >= len ? len - 1 : i
}

function condOk(s, ev) {
  if (!ev) return true
  if (ev.chance && eventChance(s, ev) >= ev.chance) return false
  if (!ev.cond) return true
  try { return !!ev.cond(s) } catch (e) { return true }
}

function withVariant(s, ev) {
  let out = ev
  if (ev.optPanels && ev.optPanels.length && ev.options) {
    const panel = ev.optPanels[variantIndex(s, ev.id + '#opt', ev.optPanels.length)]
    if (panel) {
      out = Object.assign({}, out, {
        options: out.options.map((o, i) => (o && panel[i]) ? Object.assign({}, o, { text: panel[i] }) : o)
      })
    }
  }
  if (ev.sceneAlt && ev.sceneAlt.length) {
    const t = ev.sceneAlt[variantIndex(s, ev.id + '#scene', ev.sceneAlt.length)]
    if (t) out = Object.assign({}, out, { scene: typeof t === 'function' ? t(s) : t })
  }
  return out
}

function substituteSlot(s, ev) {
  if (!ev.slot) return null
  const used = {}
  ;(s.timeline || []).forEach(e => { used[e.id] = true })
  const pool = EVENTS.filter(e =>
    e.stage === ev.stage && e.slot === ev.slot && e.id !== ev.id && !used[e.id] && condOk(s, e))
  return pool.length ? pick(pool) : null
}

/* ------------------------- 死亡判定 ------------------------- */

/*
 * 死亡判定：四条路都能死，而且都不是稀罕事。
 *
 * 之前只靠 health 判死，导致「只盯体力」是唯一最优解，其余三维形同装饰。
 * 现在补上另外三条：
 *   morale 归零 → 自己走出安全区（心垮了）
 *   supply 归零 + 已连饿两段 → 饿死（不是一断粮就死，是断粮两段）
 *   冬天 + 体力见底 → 冻死（camp 低的人更容易）
 * camp 归零不直接死，但会在阶段结算里放大其他惩罚（见 settleOneSegment）。
 */
function checkDeath(s) {
  if (s.health <= 0) return 'health'
  if (s.morale <= 0) return 'morale'
  if (s.supply <= SUPPLY_FLOOR && (s.shortRun || 0) >= 2) return 'supply'
  return null
}

/* ------------------------- 推进 ------------------------- */

/*
 * 结算单位是「一段日子」，不是「一个阶段」。
 *
 * 之前按阶段结算犯过一个致命错误：阶段 6 跨 480 天、阶段 7 跨 500 天，
 * 却只结算一次消耗和恢复——等于「两年没吃饭，然后一次性补」，必然暴死。
 *
 * 现在每次跨阶段时，按实际经过的天数切成 SEGMENT 天一段分别结算：
 *   每一段：收成 → 消耗 → 短缺惩罚 → 日常磨损 → 缓过来
 * 阶段只负责叙事分段（换文案、换事件池），数值上不再是结算单位。
 */
const SEGMENT = 60

function settleOneSegment(s, stage, days) {
  const gain = harvest(s, stage, days)
  s.supply = Math.min(SUPPLY_CAP, s.supply + gain)

  const res = consume(s, stage, days)
  res.gain = gain

  /*
   * 短缺惩罚受「据点」影响：据点差 → 没有地窖、没有墙、没有炉子，
   * 同样短 10 天的量，在有院子的人家里是「少吃两顿」，
   * 在十四楼的空房子里是「这个冬天过不去」。
   * 这是 camp 在数值上的核心作用——它不该只是个好看的分数。
   */
  if (res.short > 0) {
    const campDebuff = 1 + Math.max(0, (45 - s.camp)) / 45 * 0.9
    const dmg = Math.min(34, Math.round((res.short * 0.5 + 4 + Math.max(0, s.people - 1) * 1.6) * campDebuff))
    rawDamage(s, { health: -dmg, morale: -Math.round(dmg * 0.5) })
    s.shortRun = (s.shortRun || 0) + 1
    s.log.push({
      day: s.day, title: '账不够了', choice: '',
      text: `这一段短了 ${res.short} 天的量。你们开始一天吃两顿、后来一天一顿。你体重掉了，走路会慢半拍。`,
      tone: 'bad', kind: 'stage'
    })
  } else {
    s.shortRun = 0
  }

  /*
   * 心气的四条损耗来源（原本只有「自然下滑」，太温和，导致心气几乎不可能见底）：
   *   1. 孤身一人：没有人说话，日子会变得没有形状
   *   2. 冬天：日照短、屋里冷、一天只见两次天光
   *   3. 据点破败：住在一个随时塌的地方，心是悬着的
   *   4. 饿过：身体记账，心也记账
   * 这四条让「心气耗尽」成为一条真实可达的死法，
   * 也让 morale 从「赠品」变成需要主动维护的东西。
   */
  let mor = 0
  if (s.people <= 1) mor += 2.0
  if (stage === 3 || stage === 5) mor += 2.2
  if (s.camp < 28) mor += 2.4
  if (res.short > 0) mor += 2.0
  if (mor > 0) rawDamage(s, { morale: -Math.round(mor * (days / SEGMENT)) })

  // 冬天：据点挡不住风，就会冻死在外面
  if ((stage === 3 || stage === 5) && s.camp < 22) {
    const frost = Math.round(rnd(4, 9))
    rawDamage(s, { health: -frost, morale: -2 })
    // 冻伤累积：结局层靠这个分辨「冻死」和「病死」
    s._coldDamage = (s._coldDamage || 0) + frost
  }

  /*
   * 磨损按天数算，不按事件算。
   * 这一点是「只盯体力就能活」的解药：如果体力损耗全部来自事件，
   * 最优解就是「每个事件都选加体力」，其他维度全部可以牺牲。
   * 让时间本身消耗体力（每 SEGMENT 天固定掉），体力就成了不可回满的东西——
   * 越往后越薄，玩家必须用它换别的东西，而不是攒着。
   */
  const wear = (WEAR[stage] || 4) * (days / SEGMENT) + Math.max(0, s.people - 2) * 0.6
  rawDamage(s, { health: -Math.round(wear * rnd(0.7, 1.3)) })
  rawDamage(s, { morale: -Math.round(rnd(1.2, 3) * (days / SEGMENT)) })

  if (res.short === 0 && s.camp >= 25) {
    const rec = RECOVER[stage] || RECOVER[4]
    const bonus = 0.62 + Math.min(0.4, s.camp / 220)
    // 恢复走 applyEffects，也就跟着「边际递减」：越健康，恢复越少。
    // 这让「体力满」不成为永久的护城河——它总会往下掉，只是掉得慢。
    applyEffects(s, {
      health: rec.health * bonus * (days / SEGMENT),
      morale: rec.morale * bonus * (days / SEGMENT)
    })
  }

  drift(s, days)
  return res
}

function onStageEnter(s, stage) {
  if (stage <= s.stage) return null
  const prev = s.stage
  const span = STAGE_SPAN[prev] || STAGE_SPAN[2]
  const target = STAGE_SPAN[stage] ? STAGE_SPAN[stage].from : span.to
  let gap = Math.max(0, target - span.from)

  s.stage = stage

  let guard = 0
  while (gap > 0 && guard++ < 40) {
    const step = Math.min(SEGMENT, gap)
    settleOneSegment(s, prev, step)
    gap -= step
    if (checkDeath(s)) break
  }

  return null
}

function getNextEvent(s) {
  const timeline = s.timeline || EVENTS
  let guard = 0
  while (s.cursor < timeline.length && guard++ < 300) {
    const ev = timeline[s.cursor]
    if (!condOk(s, ev)) {
      const alt = substituteSlot(s, ev)
      if (alt) { timeline[s.cursor] = alt; continue }
      s.cursor++
      continue
    }

    // 时间推进
    const prevStage = s.stage
    if (ev.stage > s.stage) onStageEnter(s, ev.stage)
    if (ev.day != null && ev.day > s.day) s.day = Math.min(TOTAL_DAYS, ev.day)

    const death = checkDeath(s)
    if (death) { s.death = death; return null }

    return withVariant(s, ev)
  }

  // 走完了时间线：直接进终局
  if (s.stage < 7) onStageEnter(s, 7)
  s.day = TOTAL_DAYS
  return null
}

function choose(s, ev, idx) {
  const opt = ev.options[idx]
  if (!opt) return null

  const before = { h: s.health, m: s.morale, su: s.supply, c: s.camp, p: s.people }
  applyEffects(s, opt.effects)
  if (opt.flags) opt.flags.forEach(f => { if (s.flags.indexOf(f) < 0) s.flags.push(f) })

  let text = opt.result || ''
  let tone = opt.tone || 'neutral'
  let extra = null

  if (typeof opt.resolve === 'function') {
    try {
      const r = opt.resolve(s, Math.random) || {}
      if (r.effects) applyEffects(s, r.effects)
      if (r.text) text = r.text
      if (r.tone) tone = r.tone
      if (r.flags) r.flags.forEach(f => { if (s.flags.indexOf(f) < 0) s.flags.push(f) })
      extra = r.extra || null
    } catch (e) {
      console.warn('resolve error', ev.id, e)
    }
  }

  s.log.push({
    day: s.day, title: ev.title, choice: opt.text, text, tone,
    kind: 'choice', extra
  })

  s.mem.push({
    day: s.day, title: ev.title,
    dh: s.health - before.h, dm: s.morale - before.m,
    ds: s.supply - before.su, dp: s.people - before.p
  })

  drift(s, 2)
  s.cursor++
  return { text, tone, extra }
}

function autoResolve(s, ev) {
  const out = { text: '', tone: 'neutral' }
  if (typeof ev.resolve === 'function') {
    try {
      const r = ev.resolve(s, Math.random) || {}
      if (r.effects) applyEffects(s, r.effects)
      if (r.flags) r.flags.forEach(f => { if (s.flags.indexOf(f) < 0) s.flags.push(f) })
      out.text = r.text || ''
      out.tone = r.tone || 'neutral'
    } catch (e) {
      console.warn('auto resolve error', ev.id, e)
    }
  }
  s.log.push({ day: s.day, title: ev.title, choice: '', text: out.text, tone: out.tone, kind: 'event' })
  drift(s, 3)
  s.cursor++
  return out
}

/* ------------------------- 结局 ------------------------- */

const seenPairs = new Set()
function setSeenPairs(list) {
  seenPairs.clear()
  ;(Array.isArray(list) ? list : []).forEach(x => { if (typeof x === 'string') seenPairs.add(x) })
}

function seedRand(seed) {
  let x = Math.abs(Math.round(seed)) % 2147483647
  x = (x * 1103515245 + 12345) % 2147483648
  x = (x * 1103515245 + 12345) % 2147483648
  return x / 2147483648
}

function weightedPickW(list, seed) {
  if (!list.length) return null
  if (list.length === 1) return list[0]
  let total = 0
  const ws = list.map(x => { total += x.w; return x.w })
  let r = seedRand(seed) * total
  for (let i = 0; i < list.length; i++) {
    r -= ws[i]
    if (r <= 0) return list[i]
  }
  return list[list.length - 1]
}

const PLIGHT_GROUP = ['wall', 'people', 'food', 'heart', 'death', 'light']
function plightGroup(p) {
  const i = PLIGHTS.indexOf(p)
  return i < 0 ? '' : PLIGHT_GROUP[Math.floor(i / 6)]
}

function settle(s) {
  const alive = !s.death
  const survive = alive && s.day >= TOTAL_DAYS - 40

  if (!survive && !s.death) s.death = s.supply < 30 ? 'supply' : s.health < 30 ? 'health' : 'morale'

  const health = Math.round(clamp(s.health, 0, 100))
  const morale = Math.round(clamp(s.morale, 0, 100))
  const supply = Math.round(clamp(s.supply, 0, 100))
  const camp = Math.round(clamp(s.camp, 0, 100))
  const total = survive
    ? Math.round(health * 0.3 + morale * 0.3 + supply * 0.15 + camp * 0.25)
    : Math.round(Math.min(58, (health * 0.3 + morale * 0.3 + supply * 0.15 + camp * 0.25) * (0.5 + s.day / (TOTAL_DAYS * 2.2))))

  const sc = {
    survive, health, morale, supply, camp, total,
    days: s.day, people: s.people, death: survive ? null : (s.death || 'health')
  }

  const seed = Math.round(total) * 37 + s.day + s.people * 19 + Math.round(supply) * 7 + Math.round(camp) * 11

  const bases = ENDINGS.filter(e => { try { return !!e.match(s, sc) } catch (err) { return false } })
  const okPlights = PLIGHTS.filter(p => { try { return !!p.cond(s, sc) } catch (e) { return false } })
  const fallbackBase = ENDINGS[ENDINGS.length - 1]
  const fallbackPl = PLIGHTS[PLIGHTS.length - 1]

  let base = fallbackBase, plight = fallbackPl
  if (bases.length && okPlights.length) {
    const cands = []
    bases.forEach(b => {
      let list = okPlights
      const avoid = b.avoid ? (Array.isArray(b.avoid) ? b.avoid : [b.avoid]) : []
      if (avoid.length) {
        const alt = okPlights.filter(p => avoid.indexOf(plightGroup(p)) < 0)
        if (alt.length) list = alt
      }
      const bw = Math.pow(b.pri || 3, 3)
      list.forEach(p => cands.push({ base: b, plight: p, w: bw * Math.pow(p.pri || 3, 3) }))
    })
    const fresh = cands.filter(c => !seenPairs.has(c.base.id + '|' + c.plight.id))
    const hit = weightedPickW(fresh.length ? fresh : cands, seed) || cands[0]
    base = hit.base
    plight = hit.plight
  } else if (bases.length) {
    base = bases[0]
  }

  const ending = composeEnding(s, sc, base, plight)
  ending._base = base.id
  ending._plight = plight.id
  seenPairs.add(base.id + '|' + plight.id)

  const review = buildReview(s, sc)
  const advice = composeAdvice(s, sc, ADVICE)

  s.done = true
  s.sc = sc
  s.ending = ending
  s.review = review
  s.advice = advice

  return { sc, ending, review, advice }
}

/* ------------------------- 回顾 ------------------------- */

const OPEN = {
  win: [
    '你活过了第 1500 天。这个数字没有奖章，只有一口气。',
    '四年多。你没有赢什么，只是没有死。在这世道里，这两句话是同一句话。',
    '你撑到了最后一个冬天之后。天亮的时候你还在。',
    '存活日期刷新到第 1500 天。你做的事很普通：每天早上起来，把该做的做完。',
    '你没有成为传奇。你成了这一带活得最久的几个人之一。'
  ],
  died: [
    '你停在了第 {days} 天。',
    '数字停在 {days}。',
    '{days} 天，这是你在这世上多活的全部时间。',
    '第 {days} 天之后，就没有「之后」了。',
    '你在第 {days} 天走完了这一段。'
  ]
}

const BODY = {
  strong: s => `你活下来的时候身体还有底子（体力 ${s.health}）：能扛、能走、能熬夜。这不是天生的，是这四年一点点磨出来的。`,
  worn: s => `你的身体被用了很久（体力 ${s.health}）：手上有好不了的裂口，膝盖和腰会在阴天提醒你。你还能干活，只是慢。`,
  broken: s => `你的身体已经不太配合了（体力 ${s.health}）：能站着，但站不久。你自己清楚，再有一个冬天就悬了。`,
  dead: s => `身体先停了。这不是意外，是四年里每一天都在少一点，最后少到了零。`
}

const MIND = {
  clear: s => `心里还清楚（心气 ${s.morale}）：你知道自己为什么还在活，也还愿意为某个人、某件事多走两步。`,
  tired: s => `心里累了（心气 ${s.morale}）：你不再期待什么，但也没有放弃。这可能就是「习惯」的样子。`,
  hollow: s => `心里空了（心气 ${s.morale}）：你吃饭、干活、睡觉，都做得很正常，只是没有一件事让你觉得值得。`,
  gone: s => `心先垮了。人不是被饿死的，是被「算了」这两个字带走的。`
}

function buildReview(s, sc) {
  const lines = []
  if (sc.survive) lines.push(pick(OPEN.win))
  else lines.push(pick(OPEN.died).replace('{days}', sc.days))

  // 身体
  if (!sc.survive && sc.death === 'health') lines.push(BODY.dead(sc))
  else if (sc.health >= 62) lines.push(BODY.strong(sc))
  else if (sc.health >= 35) lines.push(BODY.worn(sc))
  else lines.push(BODY.broken(sc))

  // 心气
  if (!sc.survive && sc.death === 'morale') lines.push(MIND.gone(sc))
  else if (sc.morale >= 60) lines.push(MIND.clear(sc))
  else if (sc.morale >= 40) lines.push(MIND.tired(sc))
  else lines.push(MIND.hollow(sc))

  // 人
  const p = sc.people
  if (p <= 1) {
    lines.push('你身边没有人。四年里你一个人吃饭、一个人值夜、一个人过冬。这不是失败——一个人能活到现在，比多数人强。')
  } else if (p <= 3) {
    lines.push(`你身边有 ${p} 个人。不多，但每一个都是能替你值夜的那种。`)
  } else if (p <= 7) {
    lines.push(`你带着 ${p} 个人。你不再只是自己活着，你的每一个决定都会落到别的肚子上。`)
  } else {
    lines.push(`你身后有 ${p} 个人。你已经不记得所有人的名字，但你记得每一张脸在哪个位置吃饭。`)
  }

  // 关键选择：挑两个最痛/最重的
  const turns = s.log.filter(l => l.kind === 'choice' && l.choice)
  const weight = l => Math.abs((l.tone === 'bad' ? 2 : 0) + (l.text || '').length * 0.01)
  const sorted = turns.slice().sort((a, b) => weight(b) - weight(a))
  const picked = []
  for (const l of sorted) { if (picked.length >= 2) break; picked.push(l) }
  if (picked.length < 2) turns.forEach(l => { if (picked.length < 2 && picked.indexOf(l) < 0) picked.push(l) })
  picked.forEach(l => {
    const d = (s.mem || []).slice().reverse().find(m => m.day === l.day && m.title === l.title)
    const hard = d && (d.dm <= -6 || d.dh <= -8 || d.ds <= -8)
    const tail = hard
      ? pick(['这一步代价不小，你当时就知道。', '你后来想过很多次如果那天选了另一条。', '这个选择的账，是过了很久才付清的。'])
      : pick(['这个选择后来替你省了很多事。', '当时看不出什么，后来才知道那是分界。', '你没有为这个选择后悔过。'])
    lines.push(`第 ${l.day} 天，「${l.title}」，你选了「${l.choice}」。${tail}`)
  })

  // 存货与墙
  if (sc.survive) {
    if (sc.supply >= 50) lines.push(`最后剩下的存货还算厚（${sc.supply}）：缸里有腌菜，柴堆到屋檐。你在冬天不再算着吃了。`)
    else if (sc.supply >= 25) lines.push(`存货不多不少（${sc.supply}）：够撑到下一次收获，不够撑过一场意外。`)
    else lines.push(`存货很薄（${sc.supply}）：你没有饿着，但每一顿都在打算盘。`)
  }

  return lines
}

/* ------------------------- 对外 ------------------------- */

function snapshot(s) {
  const st = STAGES[s.stage] || STAGES[1]
  return {
    day: s.day,
    stage: s.stage,
    stageName: st.name,
    stageTip: st.tip,
    health: s.health,
    morale: s.morale,
    supply: s.supply,
    camp: s.camp,
    people: s.people,
    originTag: s.origin.tag,
    talentNames: s.talents.map(t => t.name)
  }
}

function fateLabel(s) {
  const tags = []
  if (s.health >= 70) tags.push('底子硬')
  else if (s.health < 42) tags.push('身上有旧伤')
  if (s.morale >= 68) tags.push('心气还在')
  else if (s.morale < 40) tags.push('有点撑不住')
  if (s.people >= 6) tags.push('一帮人')
  else if (s.people <= 1) tags.push('一个人')
  if (s.supply >= 45) tags.push('存了不少')
  else if (s.supply < 12) tags.push('吃了上顿没下顿')
  if (s.flags.indexOf('medic') >= 0) tags.push('会几下医术')
  if (s.flags.indexOf('mechanic') >= 0) tags.push('会修东西')
  if (s.flags.indexOf('armed') >= 0) tags.push('手里有家伙')
  if (s.flags.indexOf('killed_man') >= 0) tags.push('动过手')
  return tags
}

return {
  createSurvivor,
  getNextEvent,
  choose,
  autoResolve,
  settle,
  snapshot,
  fateLabel,
  checkDeath,
  clamp,
  setSeenPairs,
  TOTAL_DAYS,
  STAGE_SPAN
}

})
