/**
 * core/engine.js —— 人生模拟器 · 运行层
 * 只负责状态推进、数值结算、结局判定。文案全部来自 data.js。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data'), require('./generator'))
  else root.LifeEngine = factory(root.LifeData, root.LifeGen)
})(typeof globalThis !== 'undefined' ? globalThis : this, function (data, gen) {

const { TALENTS, BIRTHS, STAGES, EVENTS, ENDINGS, ADVICE } = data
const { composeEvent, composeEnding, composeAdvice } = gen

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const rand = (a, b) => a + Math.random() * (b - a)
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

/* ------------------------- 初始化 ------------------------- */

function rollBirth() {
  const total = BIRTHS.reduce((sum, b) => sum + b.weight, 0)
  let r = Math.random() * total
  for (const b of BIRTHS) {
    r -= b.weight
    if (r <= 0) return b
  }
  return BIRTHS[1]
}

function rollTalents() {
  const pool = TALENTS.filter(t => t.id !== 'ordinary')
  const n = Math.random() < 0.18 ? 2 : 1
  const picked = []
  const copy = pool.slice()
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length)
    picked.push(copy.splice(idx, 1)[0])
  }
  // 有些人生来就没什么特别的
  if (Math.random() < 0.12) picked.length = 0
  if (picked.length === 0) picked.push(TALENTS.find(t => t.id === 'ordinary'))
  return picked
}

/**
 * 每局从事件池里抽一条属于自己的时间线
 * 关键节点必出，其余随机 —— 这是"玩一百次也不重样"的来源
 */
const STAGE_PLAN = { 2: 5, 3: 6, 4: 5, 5: 5, 6: 5, 7: 4 }

/* 每阶段随机配额里，事件族最多占多少。
 * 族条目只占全池四成（2026-10-21 由 80% 下调），这里再压一道，
 * 保证"同一个困境"不会挤掉"这辈子只可能遇到这一次的事"。 */
const FAMILY_SHARE = 0.4

function sample(arr, n) {
  const copy = arr.slice()
  const out = []
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
  }
  return out
}

/**
 * 抽本阶段的自由事件，同一个"族"一局最多出一条。
 *
 * 一个族 = 同一个困境的几十种写法（借钱、被冤枉、回不回老家……）。
 * 不互斥的话会抽到"一局被冤枉两次""一局借出去五笔钱"，一眼就假。
 * 手写事件没有 family 字段，用 id 当键，各自独立不互斥。
 */
function sampleByFamily(arr, n, used) {
  const pool = arr.slice()
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = pool[i]; pool[i] = pool[j]; pool[j] = t
  }
  const out = []
  const local = {}
  const keyOf = e => e.family || e.id

  for (let i = 0; i < pool.length && out.length < n; i++) {
    const k = keyOf(pool[i])
    if (local[k] || used[k]) continue
    local[k] = true
    used[k] = true
    out.push(pool[i])
  }
  // 兜底：可选池被同族占满时，宁可重复也不能少给配额。
  // 注意要先试"没在别处用过的"，否则配额一涨就会在别处再抽一个同族，
  // 出现"一局被冤枉两次"（2026-10-21 抬高事件密度时暴露）。
  if (out.length < n) {
    for (let i = 0; i < pool.length && out.length < n; i++) {
      const k = keyOf(pool[i])
      if (out.indexOf(pool[i]) < 0 && !local[k] && !used[k]) {
        local[k] = true
        used[k] = true
        out.push(pool[i])
      }
    }
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
  /* 族的份额按"跨阶段累计"分配，不是每个阶段各自四舍五入。
   * 每阶段 need 只有 2~4，round(need*0.4) 全被抹成 1 甚至 0，
   * 六个阶段下来族只剩两成。这里把小数攒起来，余数够一条就发一条。 */
  let famCarry = 0
  ;[2, 3, 4, 5, 6, 7].forEach(stage => {
    const all = byStage[stage] || []

    // 无 slot 的 pinned：每局必出
    const fixed = all.filter(e => e.pinned && !e.slot)

    // 有 slot 的：同 slot 的是一组轮换，每局只抽一个
    const slotNames = []
    all.forEach(e => {
      if (e.slot && slotNames.indexOf(e.slot) < 0) slotNames.push(e.slot)
    })
    const slotPicked = slotNames.map(name =>
      sample(all.filter(e => e.slot === name), 1)[0]
    )

    // always：进时间线但不占配额，靠自身 cond 在运行时决定出不出（路径专属事件用）
    const always = all.filter(e => e.always)

    // 其余事件随机补足本阶段配额，同族互斥
    const optional = all.filter(e => !e.pinned && !e.slot && !e.always)
    const need = Math.max(1, (STAGE_PLAN[stage] || 4) - fixed.length - slotPicked.length)

    /* 族 vs 一次性事件的分账。
     * 一个族 = 同一个困境的二十来种写法（借钱、加班、被冤枉……），
     * 好处是每种处境都能写透，坏处是玩几局就又会撞上"又是借钱"。
     * 所以这里给族一个硬上限：本阶段随机配额里最多占四成，
     * 剩下的六成必须来自「一局只可能遇到一次」的独立事件
     * （events.js 手写节点 + events-new.js 那 493 条）。
     * 池子本身的构成也按这个比例配好了，这里是防止 cond 宽松的一方抢配额。 */
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

  // 生成式事件：按你这局的状态现场拼装 2~3 个，参数（人物/金额/场合）来自状态
  const genCtx = { usedPersons: new Set(), usedTpls: new Set(), usedStages: {} }
  const genCount = 2 + (Math.random() < 0.45 ? 1 : 0)
  for (let i = 0; i < genCount; i++) {
    const ev = composeEvent(s, genCtx)
    if (ev) merged.push(ev)
  }

  // 按年龄排序；同龄时按 order 权重，再按插入顺序
  return merged
    .map((e, i) => ({ e, i }))
    .sort((a, b) =>
      a.e.age - b.e.age ||
      (a.e.order || 0) - (b.e.order || 0) ||
      a.i - b.i
    )
    .map(x => x.e)
}

function createLife(pickedGender) {
  const birth = rollBirth()
  const talents = rollTalents()

  const family = Math.round(rand(birth.family[0], birth.family[1]))

  // 性别可以由玩家指定；不指定（null / 'auto' / 非法值）时随机
  const gender = pickedGender === 'm' || pickedGender === 'f'
    ? pickedGender
    : (Math.random() < 0.5 ? 'm' : 'f')

  const s = {
    stage: 1,
    age: 0,
    cursor: 0,
    birth,
    talents,
    gender,
    genderPicked: pickedGender === 'm' || pickedGender === 'f',

    // 底层属性
    family,
    int: Math.round(clamp(rand(38, 62) + (family - 50) * 0.16, 15, 90)),
    con: Math.round(rand(38, 66)),
    cha: Math.round(rand(34, 66) + (family - 50) * 0.1),
    amb: Math.round(rand(36, 64)),
    luk: Math.round(rand(30, 70)),

    // 运行态
    money: Math.round(rand(birth.money[0], birth.money[1])),
    happy: 62,
    health: 84,
    edu: 0,
    career: 0,
    flags: [],
    log: [],
    mem: [],
    done: false,
    timeline: null
  }

  talents.forEach(t => {
    applyEffects(s, t.effects)
    if (t.flag) s.flags.push(t.flag)
  })

  // 健康底子受体质影响
  s.health = Math.round(clamp(80 + s.con * 0.18 + (s.health - 84), 45, 98))
  s.happy = Math.round(clamp(s.happy + (family - 50) * 0.08, 30, 92))

  s.timeline = buildTimeline(s)

  return s
}

/* ------------------------- 数值应用 ------------------------- */

function applyEffects(s, effects) {
  if (!effects) return
  Object.keys(effects).forEach(k => {
    if (k === 'money') {
      s.money = Math.round(s.money + effects[k])
      return
    }
    if (k === 'career') {
      s.career = clamp(s.career + effects[k], 0, 12)
      return
    }
    if (typeof s[k] === 'number') {
      s[k] = Math.round(clamp(s[k] + effects[k], 0, 100))
    }
  })
}

/**
 * 享乐适应：好事带来的快乐会自然回落，坏事却不会
 * 这是人生里最不讲道理、也最公平的一条规律
 */
function adapt(s) {
  if (s.happy > 56) {
    s.happy = Math.round(s.happy - (s.happy - 56) * 0.11)
  }
}

/* ------------------------- 阶段结算 ------------------------- */

const STAGE_INCOME = {
  // 进入该阶段时，结算"上一段人生"攒下的钱
  5: { years: 3, rate: 0.6 }, // 青年 25-28
  6: { years: 9, rate: 0.6 }, // 成年 28-37
  7: { years: 23, rate: 0.6 }, // 中年 37-60
  8: { years: 20, rate: 0.3 } // 老年 60-80，收入下降
}

const STAGE_HEALTH_DROP = { 3: 1, 4: 2, 5: 3, 6: 4, 7: 7, 8: 5 }

// 学历决定职业起点
const EDU_CAREER = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 }

function onStageEnter(s, stage) {
  if (stage <= s.stage) return

  const drop = STAGE_HEALTH_DROP[stage] || 0
  if (drop) s.health = Math.round(clamp(s.health - drop, 0, 100))

  // 步入青年：起点由学历决定，但只是起点
  if (stage === 4 && s.career === 0) {
    s.career = EDU_CAREER[s.edu] || 0
  }

  // 无论发生过多好的事，日子久了都会回到一个平常水平
  // 这就是"享乐适应"，也是人生里最公平的一件事
  s.happy = Math.round(clamp(s.happy * 0.88 + 50 * 0.12, 0, 100))

  const inc = STAGE_INCOME[stage]
  if (inc) {
    const base = s.career * inc.rate * inc.years
    const noise = rand(0.82, 1.22)
    const gained = Math.round(base * noise)

    // 高收入也让生活成本更高，净存下来的打折
    const living = Math.round(gained * 0.08)
    const net = gained - living

    s.money += net
    s.stageIncome = { years: inc.years, gained: net, stage }

    // 这个阶段的身体消耗也会累积
    if (stage >= 6) s.health = Math.round(clamp(s.health - 2, 0, 100))

    s.log.push({
      age: s.age,
      title: `这些年的积蓄`,
      choice: '',
      text: `${inc.years} 年过去，账上多了一笔钱。你算了算，一共 ${net} 万。`,
      tone: 'neutral',
      kind: 'income'
    })
  }

  s.stage = stage
}

/* ------------------------- 事件推进 ------------------------- */

/* 概率事件：chance 0~1，用开局属性做稳定哈希，
 * 同一局重放得到同一个结果（不会因为刷新就变），跨局则是均匀的。 */
function eventChance(s, ev) {
  const key = ev.id + '|' + (s.int || 0) + '|' + (s.cha || 0) + '|' +
    (s.luk || 0) + '|' + (s.family || 0) + '|' + (s.gender || '')
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

/* 同一节点的不同讲法：sceneAlt / resultAlt 里按稳定哈希挑一条。
 * 用开局属性做种子，所以同一局里重放、回看都是同一段文字；
 * 不同局之间均匀散开——"每局都读同一段话"就是这么消掉的。 */
function variantIndex(s, tag, len) {
  if (len <= 1) return 0
  const v = eventChance(s, { id: tag })
  const i = Math.floor(v * len)
  return i >= len ? len - 1 : i
}

function variantText(s, list, tag) {
  if (!list || !list.length) return null
  const v = list[variantIndex(s, tag, list.length)]
  if (v == null) return null
  if (typeof v === 'function') {
    try { return v(s) } catch (e) { return null }
  }
  return v
}

/* 正文里写过"爸/妈""儿子/女儿"这类性别占位符：事件在生成/展开时还不知道玩家性别，
 * 所以统一在展示前按 s.gender 落定。顺序上长词在前，避免"爸爸/妈妈"被"爸/妈"截断。 */
const GENDER_PAIRS = [
  ['男孩子', '女孩子'], ['爸爸', '妈妈'], ['儿子', '女儿'], ['爷爷', '奶奶'],
  ['外公', '外婆'], ['姥爷', '姥姥'], ['伴郎', '伴娘'], ['大爷', '大妈'],
  ['哥哥', '姐姐'], ['先生', '女士'], ['老公', '老婆'], ['孙子', '孙女'],
  ['爸', '妈'], ['哥', '姐']
]

function resolveGender(s, text) {
  if (!text || typeof text !== 'string' || text.indexOf('/') < 0) return text
  const isF = s.gender === 'f'
  let out = text
  for (let i = 0; i < GENDER_PAIRS.length; i++) {
    const p = GENDER_PAIRS[i]
    out = out.split(p[0] + '/' + p[1]).join(isF ? p[1] : p[0])
  }
  // 指向第三个人（朋友、孩子、同事）时性别未知，用 ta
  out = out.split('他/她').join('ta')
  return out
}

/* getNextEvent 的统一出口：挑讲法 + 落定性别占位符 */
function withVariant(s, ev) {
  let out = ev
  if (ev.sceneAlt && ev.sceneAlt.length) {
    const text = variantText(s, ev.sceneAlt, ev.id + '#scene')
    if (text) out = Object.assign({}, out, { scene: text, sceneAlt: undefined })
  }
  /* 选项面板也要有变体。必出的那几个节点（摊子 / 体检 / 退休 / 35 岁）
   * 每局都来，正文有 6 种写法，选项却永远一模一样——读三局就会背下来。
   * 这里按同一个哈希给面板选一组说法，语义与顺序不变，只换嘴上的话。 */
  if (out.optPanels && out.optPanels.length && out.options) {
    const panel = out.optPanels[variantIndex(s, out.id + '#opt', out.optPanels.length)]
    if (panel) {
      out = Object.assign({}, out, {
        options: out.options.map((o, i) => (o && panel[i]) ? Object.assign({}, o, { text: panel[i] }) : o)
      })
    }
  }
  if (out.options && out.options.some(o => o && o.textAlt && o.textAlt.length)) {
    const n = out.options.reduce((m, o) => (o && o.textAlt ? Math.max(m, o.textAlt.length) : m), 0)
    const k = variantIndex(s, out.id + '#opt', n)
    out = Object.assign({}, out, {
      options: out.options.map(o => {
        if (!o || !o.textAlt || !o.textAlt.length) return o
        const t = o.textAlt[k % o.textAlt.length]
        return t ? Object.assign({}, o, { text: t }) : o
      })
    })
  }
  const title = resolveGender(s, out.title)
  const scene = resolveGender(s, out.scene)
  if (title !== out.title || scene !== out.scene) {
    out = Object.assign({}, out, { title, scene })
  }
  if (out.options && out.options.some(o => o && (resolveGender(s, o.text) !== o.text || resolveGender(s, o.result) !== o.result))) {
    out = Object.assign({}, out, {
      options: out.options.map(o => {
        if (!o) return o
        const t = resolveGender(s, o.text)
        const r = resolveGender(s, o.result)
        if (t === o.text && r === o.result) return o
        return Object.assign({}, o, { text: t, result: r })
      })
    })
  }
  return out
}

function condOk(s, ev) {
  if (!ev) return true
  if (ev.chance && eventChance(s, ev) >= ev.chance) return false
  if (!ev.cond) return true
  try {
    return !!ev.cond(s)
  } catch (e) {
    return true
  }
}

/**
 * 轮换组的"临时换人"：
 * 建时间线时状态还没定（比如还没决定上不上大学），所以 slot 里抽中的那条
 * 走到跟前可能已经不成立了。此时从同一 stage 同一 slot 里换一条此刻成立的，
 * 而不是把这个人生节点整个删掉。
 */
function substituteSlot(s, ev) {
  if (!ev.slot) return null
  const used = {}
  ;(s.timeline || []).forEach(e => { used[e.id] = true })
  const pool = EVENTS.filter(e =>
    e.stage === ev.stage &&
    e.slot === ev.slot &&
    e.id !== ev.id &&
    !used[e.id] &&
    condOk(s, e)
  )
  return pool.length ? pick(pool) : null
}

function getNextEvent(s) {
  const timeline = s.timeline || EVENTS
  let guard = 0
  while (s.cursor < timeline.length && guard++ < 200) {
    const ev = timeline[s.cursor]
    if (!condOk(s, ev)) {
      const alt = substituteSlot(s, ev)
      if (alt) {
        timeline[s.cursor] = alt
        continue
      }
      s.cursor++
      continue
    }
    onStageEnter(s, ev.stage)
    s.age = ev.age
    return withVariant(s, ev)
  }
  return null
}

/**
 * 选择一个选项，返回结果对象 { text, tone }
 */
function choose(s, ev, optionIndex) {
  const opt = ev.options[optionIndex]
  if (!opt) return null

  const before = { h: s.happy, hl: s.health, m: s.money, a: s.amb }
  applyEffects(s, opt.effects)
  if (opt.flags) opt.flags.forEach(f => { if (!s.flags.includes(f)) s.flags.push(f) })

  let text = opt.result || ''
  if (opt.resultAlt && opt.resultAlt.length) {
    const alt = variantText(s, opt.resultAlt, ev.id + '#' + optionIndex + '#result')
    if (alt) text = alt
  }
  let tone = opt.tone || 'neutral'
  let extra = null

  if (typeof opt.resolve === 'function') {
    try {
      const r = opt.resolve(s, Math.random) || {}
      if (r.effects) applyEffects(s, r.effects)
      if (r.text) text = r.text
      if (r.tone) tone = r.tone
      extra = r.extra || null
    } catch (e) {
      console.warn('resolve error', ev.id, e)
    }
  }

  // resolve 里也可能写"爸/妈"这类占位符，出结果前统一落定
  text = resolveGender(s, text)

  s.log.push({
    age: s.age,
    title: ev.title,
    choice: opt.text,
    text,
    tone,
    kind: 'choice',
    extra
  })

  if (s.mem) {
    s.mem.push({
      age: s.age,
      title: ev.title,
      choice: opt.text,
      dh: s.happy - before.h,
      dhl: s.health - before.hl,
      dm: s.money - before.m
    })
  }

  adapt(s)
  s.cursor++
  return { text, tone, extra }
}

/**
 * 处理自动事件（无选项），返回结果
 */
function autoResolve(s, ev) {
  let out = { text: '', tone: 'neutral' }
  if (typeof ev.resolve === 'function') {
    try {
      const r = ev.resolve(s, Math.random) || {}
      if (r.effects) applyEffects(s, r.effects)
      out = { text: r.text || '', tone: r.tone || 'neutral' }
    } catch (e) {
      console.warn('auto resolve error', ev.id, e)
    }
  }
  s.log.push({
    age: s.age,
    title: ev.title,
    choice: '',
    text: out.text,
    tone: out.tone,
    kind: 'event'
  })
  adapt(s)
  s.cursor++
  return out
}

/* ------------------------- 结局计算 ------------------------- */

function wealthScore(money) {
  if (money <= 0) return Math.round(clamp(6 + money * 0.15, 0, 8))
  const raw = 10 + 90 * (Math.log10(1 + money / 5) / Math.log10(1 + 800 / 5))
  return Math.round(clamp(raw, 0, 100))
}

const ACHIEVE_FLAGS = {
  top_scorer: 6,
  elite_school: 5,
  practical_major: 3,
  repeat_year: 2,
  postgrad: 6,
  gov: 4,
  bigtech: 4,
  founder: 8,
  freelance: 4,
  hometown: -2,
  no_college: -3
}

function achieveScore(s) {
  let base = s.edu * 7 + s.career * 4.5
  s.flags.forEach(f => {
    if (ACHIEVE_FLAGS[f]) base += ACHIEVE_FLAGS[f]
  })
  if (s.flags.includes('tiger_parent')) base += 2
  return Math.round(clamp(base, 0, 100))
}

/* 按 pri 加权挑选：pri 越高越容易命中，但低 pri 也不会被完全饿死
 * 权重取 pri^3 —— pri 10 与 pri 3 相差 37 倍，而不是"层级制"的绝对压制 */
/* 由局面数值导出的确定性伪随机（0~1），保证同一局重放结果一致，又不是简单的取模偏斜 */
function seedRand(seed) {
  let x = Math.abs(Math.round(seed)) % 2147483647
  x = (x * 1103515245 + 12345) % 2147483648
  x = (x * 1103515245 + 12345) % 2147483648
  return x / 2147483648
}

function weightedPick(list, seed) {
  if (!list.length) return null
  if (list.length === 1) return list[0]
  let total = 0
  const ws = list.map(x => {
    const w = Math.pow(x.pri || 3, 3)
    total += w
    return w
  })
  let r = seedRand(seed) * total
  for (let i = 0; i < list.length; i++) {
    r -= ws[i]
    if (r <= 0) return list[i]
  }
  return list[list.length - 1]
}

/* ------------------------- 晚年光景 ------------------------- */
/*
 * 100 种人生走向 × 100 种晚年光景 = 10000 种结局
 * 光景每 10 条一组：照顾人 / 还没停 / 还账 / 搬来搬去 / 带孙辈 / 身体 / 钱紧 / 钱宽 / 闲下来 / 身边有谁
 * 取 cond 成立且 pri 最高的一组；同组内按局面数值稳定散开（同一局永远得到同一个光景）
 */
const SCENE_GROUPS = ['caring', 'working', 'debt', 'moved', 'grandkid', 'body', 'tight', 'easy', 'idle', 'rel']
const SCENE_PER_GROUP = 10

/* 已经见过的「走向×光景」，由调用方（存档）喂进来，settle 时不再重复出。
 * 空集时行为和以前完全一样，所以老存档 / 无存档场景不受影响。 */
let seenPairs = new Set()
function setSeenPairs(list) {
  seenPairs = new Set(Array.isArray(list) ? list.filter(x => typeof x === 'string') : [])
}
function getSeenPairs() {
  return Array.from(seenPairs)
}

function sceneGroupOf(scene) {
  const i = data.SCENES.indexOf(scene)
  return i < 0 ? '' : SCENE_GROUPS[Math.floor(i / SCENE_PER_GROUP)]
}

function pickScene(s, sc, base, seen) {
  const pool = data.SCENES.filter(x => {
    try { return x.cond(s, sc) } catch (e) { return false }
  })
  if (!pool.length) return data.SCENES[data.SCENES.length - 1]

  // 走向本身就在讲这个主题时，先剔掉同组，避免"一直在照顾人 · 照顾老伴"这种重复
  let top = pool
  const avoidList = base && base.avoid ? (Array.isArray(base.avoid) ? base.avoid : [base.avoid]) : []
  if (avoidList.length) {
    const alt = pool.filter(x => !avoidList.includes(sceneGroupOf(x)))
    if (alt.length) top = alt
  }

  /* 不放回：这个走向下已经出过的光景先剔掉。
   * 剔空了就放开——说明这一个走向的格子真的用完了，宁可重也不能没结局。 */
  if (seen && seen.size && base && base.id) {
    const fresh = top.filter(x => !seen.has(base.id + '|' + x.id))
    if (fresh.length) top = fresh
  }

  const seed = (s.age || 0) * 31 + Math.round(sc.wealth) * 7 + Math.round(sc.happy) * 13 +
    Math.round(sc.health) * 3 + Math.round(s.money || 0) + s.flags.length * 17
  return weightedPick(top, seed)
}

/*
 * 一步选出「走向 + 光景」这一对，而不是先抽走向再抽光景。
 * 好处是：这对组合如果已经出过，可以退而求其次换一个没出过的（不放回），
 * 同时联合权重仍是 pri_base × pri_scene，分布和分两步抽一样。
 */
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

function pickEndingPair(s, sc, seed) {
  const bases = ENDINGS.filter(e => {
    try { return e.match(s, sc) } catch (err) { return false }
  })
  const last = ENDINGS[ENDINGS.length - 1]
  if (!bases.length) return { base: last, scene: pickScene(s, sc, last, null) }

  // 光景的 cond 只跟局面有关，跑一次就够；avoid 过滤再按走向各做一次
  const okScenes = data.SCENES.filter(x => {
    try { return x.cond(s, sc) } catch (e) { return false }
  })

  const cands = []
  bases.forEach(base => {
    let list = okScenes
    const avoid = base.avoid ? (Array.isArray(base.avoid) ? base.avoid : [base.avoid]) : []
    if (avoid.length) {
      const alt = okScenes.filter(x => !avoid.includes(sceneGroupOf(x)))
      if (alt.length) list = alt
    }
    const bw = Math.pow(base.pri || 3, 3)
    for (let i = 0; i < list.length; i++) {
      cands.push({ base, scene: list[i], w: bw * Math.pow(list[i].pri || 3, 3) })
    }
  })
  if (!cands.length) return { base: bases[0], scene: pickScene(s, sc, bases[0], null) }

  // 优先没出过的；全都出过（走到 10000 局以后）才允许重复
  const fresh = seenPairs.size ? cands.filter(c => !seenPairs.has(c.base.id + '|' + c.scene.id)) : cands
  const hit = weightedPickW(fresh.length ? fresh : cands, seed)
  return hit || { base: bases[0], scene: pickScene(s, sc, bases[0], null) }
}

function settle(s) {
  const wealth = wealthScore(s.money)
  const achieve = achieveScore(s)
  const happy = Math.round(clamp(s.happy, 0, 100))
  const health = Math.round(clamp(s.health, 0, 100))

  const total = Math.round(wealth * 0.25 + happy * 0.3 + health * 0.2 + achieve * 0.25)

  const sc = { wealth, happy, health, achieve, total }

  // 寿命：身体是要付利息的
  let finalAge = 79
  if (health < 22) finalAge = 61 + Math.round(Math.random() * 6)
  else if (health < 35) finalAge = 69 + Math.round(Math.random() * 5)
  else if (health > 78) finalAge = 84 + Math.round(Math.random() * 7)
  s.finalAge = finalAge

  /* 走向匹配：所有 match 成立的里取 pri 最高的一层，同层按局面稳定散开。
   * 这样 100 条走向都有出场机会，又不会让"普通人的一生"被前面的宽条件吃光。 */
  const seedB = Math.round(sc.wealth) * 7 + Math.round(sc.happy) * 13 + Math.round(sc.health) * 3 +
    Math.round(sc.achieve) * 11 + Math.round(s.money || 0) + s.flags.length * 17

  // 结局 = 人生走向（100 种）× 晚年光景（100 种）= 10000 种，配对时优先选没出过的
  const hit = pickEndingPair(s, sc, seedB)
  const base = hit.base
  const scene = hit.scene
  const ending = composeEnding(s, sc, base, scene)
  const advice = composeAdvice(s, sc, ADVICE)
  ending._base = base.id
  ending._scene = scene.id
  seenPairs.add(base.id + '|' + scene.id)

  const review = buildReview(s, sc)

  s.done = true
  s.sc = sc
  s.ending = ending
  s.review = review
  s.advice = advice

  return { sc, ending, review, advice }
}

/* ------------------------- 人生回顾 ------------------------- */

function fmtMoney(m) {
  if (m < 0) return `负债 ${Math.abs(m)} 万`
  if (m < 1) return '几乎为零'
  return `${m} 万`
}

/* 回顾三段的说法池。原来每段只有 1~3 句，玩十局会看到八次一样的第一句；
 * 每类给 4 个说法，配维度组合与真实数值，重复率降到四分之一以下。 */
const REVIEW_HEAD = {
  top: [
    '这一局你走得很顺，四样东西里三样都在高位。',
    '四张卷子，你交出了三张高分。这样的人生不多见，也从来都不轻松。',
    '你几乎没有短板。这不是运气，是几十年没掉过链子的结果。',
    '钱、身体、心境、成就——多数人能占住两样，你占了三样。',
    '三项在高位，一项拖着。你自己大概也一直盯着那个拖后腿的。',
    '这一局你赢了大部分，输的那一小部分，恰好是你最在意的。',
    '你把日子过成了别人眼里的样子，代价只有你自己清楚。',
    '四样里有三样撑着，这已经比大多数人稳。别拿剩下那样否定全部。'
  ],
  split: [
    (a, b) => `你拿到了${a}，但${b}一直没跟上。`,
    (a, b) => `${a}是你的强项，${b}是你反复交学费的地方。`,
    (a, b) => `你赢在${a}，输在${b}。这个结构，几乎能解释你所有的选择。`,
    (a, b) => `别人记住你，多半是因为${a}；你自己惦记的，多半是${b}。`,
    (a, b) => `${a}撑住了这一局，${b}漏掉的部分，你后来用别的东西补过。`,
    (a, b) => `如果把${a}拿走，这一局会很难看；可如果没有${b}这个缺口，它反而假。`
  ],
  single: [
    a => `你的一生不算耀眼，但${a}是扎实的。`,
    a => `没有哪一样特别出挑，除了${a}。它撑住了你这一整局。`,
    a => `四样里只有${a}站得住，其余三项都在及格线上下。`,
    a => `你这一局最拿得出手的是${a}，别的，够用而已。`,
    a => `四样里，只有${a}是你能拍着胸口说的。`,
    a => `唯一没让你失望的是${a}。`
  ],
  weak: [
    a => `${a}是你这一生反复吃亏的地方。`,
    a => `你在${a}上，交了太多学费。`,
    a => `这一局卡在${a}，别的地方其实都还行。`,
    a => `${a}——这两样你一直没补上，也就一直没绕过去。`,
    a => `${a}这两处，你始终没找到办法。也许本来就没有办法。`,
    a => `如果重来，你还是会在${a}上摔同样的跤。这不是命，是性格。`
  ],
  plain: [
    '你的一生没有特别突出的地方，也没有特别垮掉的地方。',
    '四样都在中段。这种人生最难写，因为它没有戏剧性，只有日子。',
    '没有大赢，也没有大输。多数人的一生，最后都落在这个格子里。',
    '你哪一样都不算差，也没有哪一样能拿出去讲。这不丢人。',
    '不富不穷，不病不壮，不悲不喜。这三个"不"加起来，就是一辈子。',
    '你这局没什么可拿来吹的，也没什么需要解释的。',
    '四样都在五十上下。这个分数很诚实，它不夸你，也不害你。',
    '从外面看，你的一生乏善可陈。从里面看，你过得比外面看到的热闹。',
    '没有传奇，也没有事故。这两样都没有，其实很难。',
    '你这一局，是那种"说起来没什么、过起来很多"的人生。'
  ]
}

const REVIEW_MOVE = {
  up: [
    t => `你从"${t}"出发，最后的落点明显高于起点。这不是运气能解释的，位移本身就是一种能力。`,
    t => `起点是"${t}"，终点比它高出一截。往上走的人很多，走上去还站得住的，不多。`,
    t => `"${t}"这个地方，你走出来了，而且没有回去。这件事，比任何头衔都硬。`,
    t => `你用一辈子做了一次位移：从"${t}"到你现在的位置。中间的距离，只有你自己知道是怎么补上的。`
  ],
  down: [
    t => `你的起点是"${t}"，最后却没有守住。这里没有指责的意思——有些下滑不是你做错了什么，是环境变了，而你没来得及跟着变。`,
    t => `从"${t}"出发，落到比起点更低的地方。你尽力了，只是有些牌，发下来的时候就不在手里。`,
    t => `"${t}"给了你一个不错的开始，没给你一个同样不错的结尾。中间那些年，你一直在处理别人的问题。`,
    t => `你没能守住"${t}"给你的那个起点。这件事你大概已经想明白了，也就没再跟自己较劲。`
  ],
  flat: [
    t => `你基本守住了起点所在的层次。不升不降，在很多人的人生里，这已经需要不小的力气。`,
    t => `从"${t}"出发，落点还在原地附近。守住比爬上去更耗人，因为它没有终点，只有每一天。`,
    t => `你的位置几乎是"${t}"的复制。这不是没出息，这是没有掉下去。`,
    t => `"${t}"那层楼，你一直住在里面。上下都看过，最后还是觉得这层合适。`
  ]
}

const REVIEW_LEDGER = {
  richSick: [
    (m, sc) => `你留下了 ${m}，也留下了一具用了很久的身体。这两样都是你亲手挣来的，只是标价不同。`,
    (m, sc) => `${m}，加上身体 ${sc.health} 分。你把前半生的时间换成了前一个数字，后半生想用前一个数字换回后一个。`,
    (m, sc) => `账面 ${m}。这辈子的账你算得很清楚，唯独没算过自己这副身体的折旧。`,
    (m, sc) => `你走的时候，账户里还有 ${m}，身体状态 ${sc.health} 分。这两个数字放在一起，很难说是赚了。`
  ],
  poorHappy: [
    (m, sc) => `你最终的存款是${m}，但你的心境分是 ${sc.happy}。有人会觉得这个组合不划算，只有你自己知道那几年下午的阳光值多少。`,
    (m, sc) => `${m}，心境 ${sc.happy} 分。钱和高兴这两样，你这辈子选对了后面那个。`,
    (m, sc) => `账上只有${m}，可你这局的心境分有 ${sc.happy}。这个分数买不到，也换不走。`,
    (m, sc) => `你没攒下钱（${m}），攒下了一屋子记得你笑的人。后半句，账面里写不下。`
  ],
  plain: [
    (m, sc) => `最后你的存款是${m}，身体状态 ${sc.health} 分，心境 ${sc.happy} 分。这就是你一生的账面。`,
    (m, sc) => `账面结清：${m}，身体 ${sc.health} 分，心境 ${sc.happy} 分，成就 ${sc.achieve} 分。四行数字，一辈子。`,
    (m, sc) => `到你走的时候，存款${m}，身体 ${sc.health} 分，心境 ${sc.happy} 分。不算漂亮，但是真的。`,
    (m, sc) => `${m}，${sc.health} 分的身体，${sc.happy} 分的心情。你说不清哪一样更值，也就没再分。`
  ]
}

/* ---- 关键选择的重述 ----
 * 原来两条都写成"……这个选择后来一直在起作用，只是当时你不知道。"，
 * 一局里出现两次一字不差，等于没写；跨局又是 100% 同一句。
 * 现在拆成"怎么提起这件事"（12 种）+ "这件事后来怎么了"（3 组，各 4 种），
 * 两句相乘，同一次回顾里不会撞同一句。第二句的口径按这个选择当年的
 * 得失来分（用 s.mem 里记的实际增减），不能说走对的话硬套在走岔的选择上。 */

const RECAP_INTRO = [
  c => `${c.age} 岁那年，你在「${c.title}」里选了${c.shown}。`,
  c => `${c.age} 岁，站在「${c.title}」那个岔口上，你选了${c.shown}。`,
  c => `「${c.title}」——${c.age} 岁你给的答案是${c.shown}。`,
  c => `${c.age} 岁那次「${c.title}」，你选了${c.shown}。`,
  c => `回头看，你人生的转折不在什么大事上，而在 ${c.age} 岁「${c.title}」的那句${c.shown}。`,
  c => `「${c.title}」这一题，${c.age} 岁的你勾了${c.shown}。`,
  c => `${c.age} 岁那年，摆在你面前的几条路，你走了写着${c.shown}的那条。`,
  c => `你这一生自己拿主意的时候不多，${c.age} 岁那次「${c.title}」算一次：${c.shown}。`,
  c => `${c.age} 岁，你替后来的自己做了一个决定——「${c.title}」里，你选了${c.shown}。`,
  c => `很多年后你还记得 ${c.age} 岁那天：你在「${c.title}」里选了${c.shown}。`,
  c => `${c.age} 岁，「${c.title}」。你说${c.shown}，然后这件小事就翻篇了。`,
  c => `那年你 ${c.age} 岁。这道题叫「${c.title}」，你选了${c.shown}。`
]

const RECAP_TAIL = {
  up: [
    '这个选择后来一直在替你加分，只是分数不在纸上。',
    '那一步走对了。你花了很久才敢承认那不是运气。',
    '你后来遇上的好事，有一半要从这一句开始算。',
    '它给你的东西不是当场兑现的，是分期付了三十年。'
  ],
  down: [
    '那一步走岔了。你后来花了很久，才把方向拧回来一点。',
    '这个选择后来一直在追着你要东西，只是当时它没开口。',
    '你后来很多次想回到那一天，把那个字改掉。',
    '它当时看着不痛。真正的账，是十多年后才寄到的。'
  ],
  flat: [
    // 原来这里第一条是"这个选择后来一直在起作用，只是当时你不知道。"
    // —— 它被玩家记住、也被玩家抱怨，留着就像没改。这一句已经删除。
    '它没有立刻改变什么，只是把路悄悄挪了一个角度。',
    '那天之后的日子看着和从前一样，其实不一样了。',
    '你说不清它是好是坏。它只是发生了，然后你就成了现在这个人。',
    '这个选择没有对错，只是把你和另一些人分开了。',
    '你当时以为在选一件事，其实是在选一种活法。',
    '这个选择小到你不觉得它是选择。它偏是。',
    '它当时只是一个动作，你后来才发现自己一直在照这个动作活。'
  ]
}

function recapDelta(s, l) {
  if (!s.mem) return 0
  for (let i = s.mem.length - 1; i >= 0; i--) {
    const m = s.mem[i]
    if (m.age === l.age && m.title === l.title) {
      const dm = Math.max(-10, Math.min(10, m.dm || 0))
      return (m.dh || 0) + (m.dhl || 0) + dm * 1.2
    }
  }
  return 0
}

// 在一局里取 n 个互不相同的下标
function distinctIdx(n, len) {
  const out = []
  let guard = 0
  while (out.length < n && guard++ < 60) {
    const i = Math.floor(Math.random() * len)
    if (!out.includes(i)) out.push(i)
  }
  return out
}

function buildReview(s, sc) {
  const lines = []

  // 1. 定性 —— 基于四维的相对结构，而不是绝对高低
  const strong = []
  const weak = []
  if (sc.wealth >= 62) strong.push('物质')
  else if (sc.wealth < 40) weak.push('物质')
  if (sc.happy >= 62) strong.push('心境')
  else if (sc.happy < 45) weak.push('心境')
  if (sc.health >= 60) strong.push('身体')
  else if (sc.health < 45) weak.push('身体')
  if (sc.achieve >= 60) strong.push('成就')
  else if (sc.achieve < 42) weak.push('成就')

  const a = strong.join('和')
  const b = weak.join('和')
  let headline
  if (strong.length >= 3 && weak.length === 0) headline = pick(REVIEW_HEAD.top)
  else if (strong.length >= 2 && weak.length >= 2) headline = pick(REVIEW_HEAD.split)(a, b)
  else if (strong.length >= 1 && weak.length === 0) headline = pick(REVIEW_HEAD.single)(strong[0])
  else if (weak.length >= 2) headline = pick(REVIEW_HEAD.weak)(b)
  else headline = pick(REVIEW_HEAD.plain)
  lines.push(headline)

  // 2. 出身与位移
  const familyBase = s.birth.family[0]
  const moved = sc.total - Math.round(familyBase * 0.55)
  const tag = s.birth.tag
  if (moved >= 18) lines.push(pick(REVIEW_MOVE.up)(tag))
  else if (moved <= -8) lines.push(pick(REVIEW_MOVE.down)(tag))
  else lines.push(pick(REVIEW_MOVE.flat)(tag))

  // 3. 关键选择 —— 从 log 里挑 2 个最有"分叉"意味的
  const turningPoints = s.log.filter(l => l.kind === 'choice' && l.choice)
  const picks = []
  const importantIds = ['t6', 'y3', 'a1', 'a2', 'm1', 'm5']
  // 用标题反查（log 里存的是 title）
  turningPoints.forEach(l => {
    if (picks.length < 2 && l.text && l.text.length > 40) {
      if (Math.random() > 0.55) picks.push(l)
    }
  })
  while (picks.length < 2 && turningPoints.length > picks.length) {
    const cand = pick(turningPoints)
    if (!picks.includes(cand)) picks.push(cand)
  }
  const usedIntro = new Set()
  const tailPick = {
    up: distinctIdx(2, RECAP_TAIL.up.length),
    down: distinctIdx(2, RECAP_TAIL.down.length),
    flat: distinctIdx(2, RECAP_TAIL.flat.length)
  }
  const tailAt = { up: 0, down: 0, flat: 0 }
  picks.slice(0, 2).forEach(l => {
    // 选项自己带引号时（说"那别去了"），把内层引号换成直角引号，否则会套两层
    const c = String(l.choice || '')
    const quoted = /["“”「」]/.test(c)
    const shown = quoted ? c.replace(/"([^"]*)"/g, '「$1」') : `"${c}"`
    // 带引号的选项跳过"那句…""写着…的那条"两种说法，否则会套成两层引号
    let cands = RECAP_INTRO.map((f, i) => i).filter(i => !(quoted && (i === 4 || i === 6)))
    cands = cands.filter(i => !usedIntro.has(i))
    if (!cands.length) cands = RECAP_INTRO.map((f, i) => i)
    const idx = cands[Math.floor(Math.random() * cands.length)]
    usedIntro.add(idx)

    const d = recapDelta(s, l)
    const key = d >= 6 ? 'up' : d <= -6 ? 'down' : 'flat'
    const tail = RECAP_TAIL[key][tailPick[key][tailAt[key]++ % 2]]
    lines.push(RECAP_INTRO[idx]({ age: l.age, title: l.title, shown }) + tail)
  })

  // 4. 钱与身体的对照
  const money = fmtMoney(s.money)
  if (s.money > 100 && sc.health < 45) lines.push(pick(REVIEW_LEDGER.richSick)(money, sc))
  else if (s.money < 30 && sc.happy >= 60) lines.push(pick(REVIEW_LEDGER.poorHappy)(money, sc))
  else lines.push(pick(REVIEW_LEDGER.plain)(money, sc))

  return lines
}

/* ------------------------- 建议生成 ------------------------- */

function buildAdvice(s, sc) {
  const list = []
  const pool = Object.keys(ADVICE).map(k => ADVICE[k])

  // 优先按"最痛的地方"排序
  const scoreOf = a => {
    if (a === ADVICE.happyLow) return 100 - sc.happy + 10
    if (a === ADVICE.healthLow) return 100 - sc.health + 8
    if (a === ADVICE.moneyLow) return 100 - sc.wealth + 6
    if (a === ADVICE.ambLow) return 100 - s.amb + 4
    if (a === ADVICE.chaLow) return 100 - s.cha + 4
    if (a === ADVICE.happyMid) return 62 - sc.happy + 30
    return 40
  }

  pool.forEach(a => {
    let ok = false
    try {
      ok = a.cond(s)
    } catch (e) {}
    if (ok) list.push({ ...a, _score: scoreOf(a) })
  })

  list.sort((x, y) => y._score - x._score)

  const picked = []
  const seen = new Set()
  for (const a of list) {
    if (picked.length >= 3) break
    if (seen.has(a.title)) continue
    seen.add(a.title)
    picked.push({ title: a.title, text: a.text })
  }

  // 保底：不足三条时补通用建议
  const fallback = [
    {
      title: '关于时间',
      text: '你这一生做了很多"应该做"的事。剩下的日子里，试着每周留半天，做一件完全没有产出的事——散步、发呆、跟人闲聊。这不是浪费，这是把时间还给自己。'
    },
    {
      title: '关于关系',
      text: '能说真话的人，一只手数得过来就够了。如果你现在数不出来三个，那就从这周开始，主动约一个人吃顿饭。关系不是靠回忆维持的，是靠见面。'
    },
    {
      title: '关于身体',
      text: '不管你今年多大，现在开始动都不算晚。每周三次、每次三十分钟的快走，比任何保健品都实在。这件事的唯一难点是：它需要你真的去做。'
    }
  ]
  let fi = 0
  while (picked.length < 3 && fi < fallback.length) {
    picked.push(fallback[fi])
    fi++
  }

  return picked
}

/* ------------------------- 对外 UI 数据 ------------------------- */

function snapshot(s) {
  const stage = STAGES[s.stage] || STAGES[1]
  return {
    age: s.age,
    stageName: stage.name,
    stageTip: stage.tip,
    happy: s.happy,
    health: s.health,
    amb: s.amb,
    money: s.money,
    birthTag: s.birth.tag,
    talentNames: s.talents.map(t => t.name)
  }
}

// 命运标签：根据全局数值给人生一句概括
function fateLabel(s) {
  const sc = s.sc || settlePreview(s)
  const tags = []
  if (s.family < 32) tags.push('寒门出身')
  else if (s.family > 72) tags.push('家境优渥')
  if (s.int >= 72) tags.push('脑子好使')
  else if (s.int < 40) tags.push('不算聪明')
  if (s.cha >= 72) tags.push('招人喜欢')
  else if (s.cha < 40) tags.push('不太合群')
  if (s.amb >= 72) tags.push('心气很高')
  else if (s.amb < 38) tags.push('随遇而安')
  if (s.con >= 72) tags.push('身体结实')
  if (s.luk >= 72) tags.push('运气不错')
  else if (s.luk < 35) tags.push('运气一般')
  return tags
}

function settlePreview(s) {
  return {
    wealth: wealthScore(s.money),
    achieve: achieveScore(s),
    happy: s.happy,
    health: s.health
  }
}

return {
  createLife,
  getNextEvent,
  choose,
  autoResolve,
  settle,
  snapshot,
  fateLabel,
  fmtMoney,
  wealthScore,
  achieveScore,
  clamp,
  resolveGender,
  setSeenPairs,
  getSeenPairs
}

})
