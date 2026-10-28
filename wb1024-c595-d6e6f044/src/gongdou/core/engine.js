/**
 * core/engine.js —— 宫斗模拟器 · 运行层
 *
 * 只负责状态推进、数值结算、结局判定。文案全部来自 data.js / generator.js。
 *
 * 状态轴：
 *   stage 1-7    时期（入宫 → 夕照）
 *   year         入宫第几年（0-30）
 *   rank 0-8     位份（官女子 → 皇后），与时期分开
 *   favor/fame/power/peace/health/scheme  六项局面数值
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data'), require('./generator'))
  else root.PalaceEngine = factory(root.PalaceData, root.PalaceGen)
})(typeof globalThis !== 'undefined' ? globalThis : this, function (data, gen) {

const { RANKS, TALENTS, ORIGINS, STAGES, EVENTS, ENDINGS, SCENES, ADVICE } = data
const { composeEvent, composeEnding, composeAdvice } = gen

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const rand = (a, b) => a + Math.random() * (b - a)
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

/* ------------------------- 初始化 ------------------------- */

function rollOrigin() {
  const total = ORIGINS.reduce((sum, o) => sum + o.weight, 0)
  let r = Math.random() * total
  for (const o of ORIGINS) {
    r -= o.weight
    if (r <= 0) return o
  }
  return ORIGINS[1]
}

function rollTalents(origin) {
  const oid = origin && origin.id
  const pool = TALENTS.filter(t => t.id !== 'ordinary' && (!t.avoid || t.avoid.indexOf(oid) < 0))
  const n = Math.random() < 0.16 ? 2 : 1
  const picked = []
  const copy = pool.slice()
  for (let i = 0; i < n && copy.length; i++) {
    picked.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
  }
  if (Math.random() < 0.1) picked.length = 0
  if (!picked.length) picked.push(TALENTS.find(t => t.id === 'ordinary'))
  return picked
}

/* 每阶段的随机事件条数（另有 pinned / slot / always 不占这个配额） */
const STAGE_PLAN = { 1: 1, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 1 }

/* 轮换组每阶段最多出几组。事件池里同阶段的 slot 有好几组，
 * 全放出来一局会拖到五十多个事件；这里只留"剧情必须"的几组，
 * 其余组仍留在池子里，跨局随机轮换。 */
const SLOT_FIXED = {
  1: ['firstnight', 'maid'],
  2: ['e_promote0', 'early_meet'],
  3: ['promote1', 'child'],
  4: ['e_promote2', 'frame'],
  5: ['e_promote3', 'crown'],
  6: ['e_promote4', 'succession'],
  7: ['lastnight', 'finalchoice']
}
const SLOT_MAX = { 1: 2, 2: 2, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2 }

/* 随机配额里事件族最多占几成。族条目占全池四成左右，这里再压一道，
 * 保证"一辈子只可能遇到一次的事"不会被"份例又被克扣了"挤掉。 */
const FAMILY_SHARE = 0.38

function sample(arr, n) {
  const copy = arr.slice()
  const out = []
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
  }
  return out
}

/* 同族一局最多出一条：一个族 = 同一个困境的十几种写法，
 * 不互斥会出现"一局被冤枉两次""一个月里份例被克三回"。 */
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
  let famCarry = 0

  ;[1, 2, 3, 4, 5, 6, 7].forEach(stage => {
    const all = byStage[stage] || []

    const fixed = all.filter(e => e.pinned && !e.slot)

    const slotNames = []
    all.forEach(e => {
      if (e.slot && slotNames.indexOf(e.slot) < 0) slotNames.push(e.slot)
    })
    const fixedSlots = (SLOT_FIXED[stage] || []).filter(n => slotNames.indexOf(n) >= 0)
    const restSlots = slotNames.filter(n => fixedSlots.indexOf(n) < 0)
    for (let i = restSlots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const t = restSlots[i]; restSlots[i] = restSlots[j]; restSlots[j] = t
    }
    const chosenSlots = fixedSlots.concat(restSlots).slice(0, SLOT_MAX[stage] || 2)
    const slotPicked = chosenSlots.map(name =>
      sample(all.filter(e => e.slot === name), 1)[0]
    )

    /* always：进时间线，不占配额，靠 cond 在运行时决定出不出。
     * 冷宫、赐死、翻案这类"只有一条路能走到"的事件都挂在这里。 */
    const always = all.filter(e => e.always)

    const optional = all.filter(e => !e.pinned && !e.slot && !e.always)
    const need = Math.max(1, (STAGE_PLAN[stage] || 4) - fixed.length - slotPicked.length)

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

  /* 生成式事件：按这局的局面现场拼 2 条 */
  const genCtx = { usedTpls: new Set(), usedStages: {} }
  for (let i = 0; i < 2; i++) {
    const ev = composeEvent(s, genCtx)
    if (ev) merged.push(ev)
  }

  return merged
    .map((e, i) => ({ e, i }))
    .sort((a, b) =>
      (a.e.year || 0) - (b.e.year || 0) ||
      (a.e.order || 0) - (b.e.order || 0) ||
      a.i - b.i
    )
    .map(x => x.e)
}

function createLife() {
  const origin = rollOrigin()
  const talents = rollTalents(origin)
  const bias = origin.bias || {}

  const s = {
    version: 1,
    stage: 1,
    year: 0,
    cursor: 0,
    origin,
    originId: origin.id,
    talents,

    /* 底子 */
    int: Math.round(clamp(rand(36, 62) + (bias.int || 0), 12, 92)),
    cha: Math.round(clamp(rand(36, 64) + (bias.cha || 0), 12, 94)),
    con: Math.round(clamp(rand(38, 66) + (bias.con || 0), 12, 92)),
    luk: Math.round(clamp(rand(30, 70) + (bias.luk || 0), 5, 96)),

    /* 局面 */
    rank: origin.rankStart || 0,
    money: Math.round(rand(origin.money[0], origin.money[1])),
    health: 82,
    peace: 62,
    favor: 0,
    fame: 0,
    power: 0,
    scheme: 0,

    flags: [],
    log: [],
    mem: [],
    done: false,
    dead: false,
    timeline: null
  }

  s.scheme = Math.round(clamp(rand(26, 46) + (s.int - 50) * 0.22 + (bias.scheme || 0), 8, 90))
  s.favor = Math.round(clamp(rand(9, 19) + (s.cha - 50) * 0.16 + (bias.favor || 0), 0, 40))
  s.fame = Math.round(clamp(rand(18, 30) + (bias.fame || 0), 0, 62))
  s.power = Math.round(clamp(rand(6, 18) + (bias.power || 0), 0, 62))
  s.peace = Math.round(clamp(62 + (bias.peace || 0), 20, 88))
  s.health = Math.round(clamp(80 + s.con * 0.18 + (bias.health || 0), 40, 98))

  if (origin.id === 'maid') s.flags.push('maid_start')
  if (origin.id === 'sinner') s.flags.push('sinner_start')
  if (origin.id === 'salt') s.flags.push('merchant_start')
  if (origin.id === 'noble') s.flags.push('noble_start')

  talents.forEach(t => {
    applyEffects(s, t.effects)
    if (t.flag) s.flags.push(t.flag)
  })

  s.timeline = buildTimeline(s)
  return s
}

/* ------------------------- 数值 ------------------------- */

const BARS = ['favor', 'fame', 'power', 'health', 'peace', 'scheme', 'cha', 'int', 'con', 'luk']

function applyEffects(s, effects) {
  if (!effects) return
  Object.keys(effects).forEach(k => {
    if (k === 'money') { s.money = Math.round(s.money + effects[k]); return }
    if (k === 'rank') { s.rank = clamp(s.rank + effects[k], 0, 8); return }
    if (BARS.indexOf(k) >= 0) {
      s[k] = Math.round(clamp(s[k] + effects[k], 0, 100))
    }
  })
}

/* ------------------------- 阶段结算 ------------------------- */

const STAGE_YEARS = { 2: 2, 3: 3, 4: 5, 5: 6, 6: 8, 7: 6 }
const STAGE_HEALTH = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6 }

function onStageEnter(s, stage) {
  if (stage <= s.stage) return

  const drop = STAGE_HEALTH[stage] || 0
  if (drop) s.health = Math.round(clamp(s.health - drop, 0, 100))

  /* 君恩如流水：不经营，恩宠自己会退 */
  s.favor = Math.round(clamp(s.favor - (s.favor - 24) * 0.055, 0, 100))

  /* 位份越高，越容易被盯着：声望自然回落得更快 */
  if (s.rank >= 5) s.fame = Math.round(clamp(s.fame - 2, 0, 100))

  /* 这些年攒下的月例与赏赐 */
  const yrs = STAGE_YEARS[stage] || 0
  if (yrs) {
    const base = (s.rank + 1) * yrs * 42
    const gained = Math.round(base * rand(0.85, 1.25))
    s.money += gained
    s.stageIncome = { years: yrs, gained, stage }
    s.log.push({
      year: s.year,
      title: '这些年的进项',
      choice: '',
      text: `${yrs} 年过去，你的箱子里多了 ${gained} 两。月例、节赏、还有几次说不清来路的银子。`,
      tone: 'neutral',
      kind: 'income'
    })
  }

  s.stage = stage
}

/* ------------------------- 概率与变体 ------------------------- */

function eventChance(s, ev) {
  const key = ev.id + '|' + (s.int || 0) + '|' + (s.cha || 0) + '|' +
    (s.luk || 0) + '|' + (s.originId || '') + '|' + (s.rank || 0)
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

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

/* 展示前的统一处理：正文变体、选项面板变体 */
function withVariant(s, ev) {
  let out = ev
  if (ev.sceneAlt && ev.sceneAlt.length) {
    const text = variantText(s, ev.sceneAlt, ev.id + '#scene')
    if (text) out = Object.assign({}, out, { scene: text, sceneAlt: undefined })
  }
  if (out.optPanels && out.optPanels.length && out.options) {
    const panel = out.optPanels[variantIndex(s, out.id + '#opt', out.optPanels.length)]
    if (panel) {
      out = Object.assign({}, out, {
        options: out.options.map((o, i) => (o && panel[i]) ? Object.assign({}, o, { text: panel[i] }) : o)
      })
    }
  }
  return out
}

function condOk(s, ev) {
  if (!ev) return true
  if (ev.chance && eventChance(s, ev) >= ev.chance) return false
  if (!ev.cond) return true
  try { return !!ev.cond(s) } catch (e) { return true }
}

/* 轮换组临时换人：建时间线时状态还没定，走到跟前可能不成立了 */
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
  if (s.dead) return null
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
    onStageEnter(s, ev.stage)
    s.year = ev.year
    return withVariant(s, ev)
  }
  return null
}

/* ------------------------- 选择 ------------------------- */

const FATAL = ['condemned', 'poisoned_by_emperor', 'suicide', 'died_in_childbirth']

function checkDeath(s) {
  if (s.health <= 0) { s.dead = true; return }
  if (FATAL.some(f => s.flags.includes(f))) { s.dead = true }
}

function choose(s, ev, optionIndex) {
  const opt = ev.options[optionIndex]
  if (!opt) return null

  const before = { favor: s.favor, fame: s.fame, power: s.power, peace: s.peace, health: s.health, money: s.money, rank: s.rank }
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

  /* 事件级 resolve：晋位、生产这类"整件事的结果"写在事件上，
   * 选项只决定用哪种姿态去面对。它跑在选项之后，可以覆盖文案。 */
  if (typeof ev.resolve === 'function') {
    try {
      const r = ev.resolve(s, Math.random) || {}
      if (r.effects) applyEffects(s, r.effects)
      if (r.text) text = r.text
      if (r.tone) tone = r.tone
    } catch (e) {
      console.warn('event resolve error', ev.id, e)
    }
  }

  s.log.push({
    year: s.year,
    title: ev.title,
    choice: opt.text,
    text,
    tone,
    kind: 'choice',
    extra
  })

  if (s.mem) {
    s.mem.push({
      year: s.year,
      title: ev.title,
      choice: opt.text,
      df: s.favor - before.favor,
      dp: s.peace - before.peace,
      dh: s.health - before.health,
      dm: s.money - before.money,
      dr: s.rank - before.rank
    })
  }

  s.cursor++
  checkDeath(s)
  return { text, tone, extra, rankUp: s.rank - before.rank, dead: s.dead }
}

function autoResolve(s, ev) {
  const before = { favor: s.favor, peace: s.peace, health: s.health, money: s.money, rank: s.rank, fame: s.fame, power: s.power }
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
    year: s.year,
    title: ev.title,
    choice: '',
    text: out.text,
    tone: out.tone,
    kind: 'event'
  })
  s.mem.push({
    year: s.year, title: ev.title, choice: '',
    df: s.favor - before.favor, dp: s.peace - before.peace,
    dh: s.health - before.health, dm: s.money - before.money, dr: s.rank - before.rank
  })
  s.cursor++
  checkDeath(s)
  return { text: out.text, tone: out.tone, dead: s.dead }
}

/* ------------------------- 结局 ------------------------- */

function rankScoreOf(s) {
  const raw = s.rank * 10.4 + s.power * 0.25 + s.fame * 0.16
  let v = Math.round(clamp(raw, 0, 100))
  if (s.flags.includes('cold_palace') || s.flags.includes('sent_to_xinzheku')) v = Math.min(v, 12)
  if (s.flags.includes('deposed')) v = Math.min(v, 20)
  return v
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

const SCENE_GROUPS = ['place', 'people', 'hand', 'mind', 'after']
const SCENE_PER_GROUP = 10
const sceneGroupOf = scn => {
  const i = SCENES.indexOf(scn)
  return i < 0 ? '' : SCENE_GROUPS[Math.floor(i / SCENE_PER_GROUP)]
}

let seenPairs = new Set()
function setSeenPairs(list) {
  seenPairs = new Set(Array.isArray(list) ? list.filter(x => typeof x === 'string') : [])
}
function getSeenPairs() { return Array.from(seenPairs) }

function pickEndingPair(s, sc, seed) {
  let bases = ENDINGS.filter(e => {
    try { return e.match(s, sc) } catch (err) { return false }
  })
  /* 出了宫就是出了宫：这一局若已经离开宫墙，结局必须是"离开"那一类，
   * 否则会出现"你位至嫔位"配"你出来了"的荒唐组合。 */
  const leftPalace = s.flags.includes('left_palace') || s.flags.includes('escaped') ||
    s.flags.includes('married_out') || s.flags.includes('sent_home')
  if (leftPalace && !s.flags.includes('son_emperor')) {
    const leaveOnes = bases.filter(e => e.family === 'leave' || e.family === 'child')
    if (leaveOnes.length) bases = leaveOnes
  }
  const last = ENDINGS[ENDINGS.length - 1]
  const okScenes = SCENES.filter(x => {
    try { return x.cond(s, sc) } catch (e) { return false }
  })
  if (!bases.length) return { base: last, scene: okScenes[0] || SCENES[SCENES.length - 1] }
  /* 同理：人若在宫外，光景也不该落在宫里 */
  const outScenes = okScenes.filter(x => ['at_outside_house', 'at_temple', 'at_prince_house'].indexOf(x.id) >= 0)
  const useScenes = leftPalace && outScenes.length ? outScenes : okScenes

  const cands = []
  bases.forEach(base => {
    const bw = Math.pow(base.pri || 3, 3)
    useScenes.forEach(scn => {
      cands.push({ base, scene: scn, w: bw * Math.pow(scn.pri || 3, 3) })
    })
  })
  if (!cands.length) return { base: bases[0], scene: SCENES[SCENES.length - 1] }

  const fresh = seenPairs.size ? cands.filter(c => !seenPairs.has(c.base.id + '|' + c.scene.id)) : cands
  const hit = weightedPickW(fresh.length ? fresh : cands, seed)
  return hit || { base: bases[0], scene: SCENES[SCENES.length - 1] }
}

/* ------------------------- 回顾 ------------------------- */

const REVIEW_HEAD = {
  top: [
    '这一局你走得极稳：位份、恩宠、心境、身体，四样里三样都在高处。宫里能做到这一点的，不多。',
    '你把这座宫城走通了。不是没摔过，是每次都爬起来了。',
    '位置有了，人也没散。这是宫里最难同时做到的两件事。',
    '四张卷子，你交出了三张好的。剩下那一张，你自己大概也一直惦记着。',
    '你赢了大半。输的那一小半，恰好是你最初进宫时想要的东西。',
    '这一局你几乎没有走错。可你自己知道，所谓没走错，是很多次想错却没做。'
  ],
  split: [
    (a, b) => `你拿到了${a}，${b}一直没跟上。`,
    (a, b) => `${a}是你这一局的强项，${b}是你反复交学费的地方。`,
    (a, b) => `你赢在${a}，输在${b}。这个结构，几乎能解释你所有的选择。`,
    (a, b) => `别人记住你，多半是因为${a}；你自己夜里想的，多半是${b}。`,
    (a, b) => `${a}撑住了你，${b}漏掉的那些，你后来用别的东西补过。`,
    (a, b) => `如果把${a}拿走，这一局会很难看；可如果没有${b}这个缺口，它反而假。`
  ],
  single: [
    a => `这一局你没有多耀眼，但${a}是扎实的。`,
    a => `四样里只有${a}站得住，其余都在及格线上下。`,
    a => `你最拿得出手的是${a}，别的，够用而已。`,
    a => `唯一没让你失望的是${a}。`,
    a => `你这一局最硬的一块是${a}。它替你挡了不少事。`
  ],
  weak: [
    a => `${a}是你这一局反复吃亏的地方。`,
    a => `你在${a}上，交了太多学费。`,
    a => `这一局卡在${a}，别的地方其实都还行。`,
    a => `${a}——这一处你始终没补上，也就一直没绕过去。`,
    a => `如果重来，你还是会在${a}上摔同样的跤。这不是命，是性子。`
  ],
  plain: [
    '你这一局没有特别出挑的地方，也没有塌掉的地方。',
    '四样都在中段。这种日子最难写，因为它没有故事，只有年月。',
    '没有大赢，也没有大输。宫里多数人最后都落在这个格子里。',
    '你哪一样都不算差，也没有哪一样能拿出去讲。这不丢人。',
    '不宠不弃，不显不隐。这三个"不"加起来，就是半辈子。',
    '从外面看，你这一局乏善可陈。从里面看，你过得比外面热闹。'
  ]
}

const REVIEW_MOVE = {
  up: [
    t => `你从${t}起步，最后站到了比起点高得多的地方。这不是运气能解释的——宫里往上走的每一步，都要有人替你让开。`,
    t => `入宫时你是${t}，落幕时不是了。这中间的距离，只有你自己知道是怎么补上的。`,
    t => `${t}给你的起点很低，你把它走成了另一个样子。这件事，比任何封号都硬。`,
    t => `你用这一局做了一次位移：从${t}到今天的位置。中间那些年，你一直在替自己争。`
  ],
  down: [
    t => `你的起点是${t}，最后却没能守住。这里没有指责的意思——宫里有些下滑不是你做错了什么，是风向变了。`,
    t => `从${t}出发，落到比起点更低的地方。你尽力了，只是有些牌发下来的时候就不在手里。`,
    t => `${t}给了你一个不错的开始，没给你一个同样不错的结尾。中间那些年，你一直在处理别人的问题。`,
    t => `你没守住${t}给你的那个起点。这件事你后来大概也想明白了，就没再跟自己较劲。`
  ],
  flat: [
    t => `你基本守住了${t}出身的层次。不升不降，在宫里已经要花掉很大的力气。`,
    t => `从${t}进来，落点还在原处附近。守住比爬上去更耗人，因为它没有终点，只有每一天。`,
    t => `你的位置几乎是${t}出身的复制。这不是没出息，这是没有掉下去。`,
    t => `${t}那层位置，你一直待在里面。上面下面都看过，最后还是觉得这里合适。`
  ]
}

const REVIEW_LEDGER = {
  powerSick: [
    (r, sc) => `你位至${r}，身体只有 ${sc.health} 分。这两样都是你亲手换来的，只是标价不同。`,
    (r, sc) => `${r}，加上一具用了三十年的身子。你把前半生的睡眠换成了前一个，后半生想用前一个换回后一个。`,
    (r, sc) => `册子上写着${r}。这辈子的账你算得很清楚，唯独没算过自己这副身体。`
  ],
  lowPeace: [
    (r, sc, s) => `你是${r}，可你的心境 ${sc.peace} 分。宫里很多人羡慕你，你自己不羡慕。`,
    (r, sc, s) => `${r}这个位置，你用 ${sc.year} 年走到了。走到之后你才发现，最想留住的东西在半路上丢了。`,
    (r, sc, s) => `你留下了${r}的名分，和一屋子不肯说话的夜。这两样摆在一起，很难说是赚了。`
  ],
  quiet: [
    (r, sc, s) => `你最后是${r}，心境 ${sc.peace} 分，身体 ${sc.health} 分。这就是你在宫里一辈子的账面。`,
    (r, sc, s) => `账结清了：${r}，${sc.year} 年，${sc.peace} 分的心境。不算漂亮，但是真的。`,
    (r, sc, s) => `${r}，${sc.year} 年，走了 ${sc.year} 年才明白"够了"这两个字怎么写。`
  ]
}

const RECAP_INTRO = [
  c => `${c.when}，你在「${c.title}」里选了${c.shown}。`,
  c => `${c.when}，站在「${c.title}」那个岔口上，你选了${c.shown}。`,
  c => `「${c.title}」——${c.when}，你给的答案是${c.shown}。`,
  c => `${c.when}的「${c.title}」，你选了${c.shown}。`,
  c => `回头看，你这一生的转折不在什么大事上，而在「${c.title}」里那句${c.shown}。`,
  c => `「${c.title}」这一题，${c.when}的你勾了${c.shown}。`,
  c => `${c.when}，摆在你面前的几条路，你走了写着${c.shown}的那条。`,
  c => `你这一生自己拿主意的时候不多，${c.when}的「${c.title}」算一次：${c.shown}。`,
  c => `${c.when}，你替后来的自己做了一个决定——「${c.title}」里，你选了${c.shown}。`,
  c => `很多年后你还记得${c.when}：在「${c.title}」里，你选了${c.shown}。`,
  c => `${c.when}，「${c.title}」。你说${c.shown}，然后这件小事就翻篇了。`,
  c => `${c.when}。这道题叫「${c.title}」，你选了${c.shown}。`
]

const RECAP_TAIL = {
  up: [
    '那一步走对了。你花了很久才敢承认那不是运气。',
    '这个选择后来一直在替你加分，只是分数不在册子上。',
    '你后来遇上的好事，有一半要从这一句开始算。',
    '它给你的东西不是当场兑现的，是分期付了很多年。'
  ],
  down: [
    '那一步走岔了。你后来花了很久，才把方向拧回来一点。',
    '这个选择后来一直在追着你要东西，只是当时它没开口。',
    '你后来很多次想回到那一天，把那个字改掉。',
    '它当时看着不痛。真正的账，是很多年后才寄到的。'
  ],
  flat: [
    '它没有立刻改变什么，只是把路悄悄挪了一个角度。',
    '那天之后的日子看着和从前一样，其实不一样了。',
    '你说不清它是好是坏。它只是发生了，然后你就成了现在这个人。',
    '这个选择没有对错，只是把你和另一些人分开了。',
    '你当时以为在选一件事，其实是在选一种活法。',
    '这个选择小到你不觉得它是选择。它偏是。'
  ]
}

function recapDelta(s, l) {
  if (!s.mem) return 0
  for (let i = s.mem.length - 1; i >= 0; i--) {
    const m = s.mem[i]
    if (m.year === l.year && m.title === l.title) {
      const dm = Math.max(-30, Math.min(30, m.dm || 0)) * 0.4
      return (m.df || 0) + (m.dp || 0) + (m.dh || 0) * 0.6 + dm + (m.dr || 0) * 8
    }
  }
  return 0
}

function distinctIdx(n, len) {
  const out = []
  let guard = 0
  while (out.length < n && guard++ < 80) {
    const i = Math.floor(Math.random() * len)
    if (!out.includes(i)) out.push(i)
  }
  return out
}

function buildReview(s, sc) {
  const lines = []
  const strong = []
  const weak = []
  if (sc.rankScore >= 62) strong.push('权位')
  else if (sc.rankScore < 35) weak.push('权位')
  if (sc.favor >= 62) strong.push('恩宠')
  else if (sc.favor < 32) weak.push('恩宠')
  if (sc.peace >= 62) strong.push('心境')
  else if (sc.peace < 40) weak.push('心境')
  if (sc.health >= 60) strong.push('身体')
  else if (sc.health < 42) weak.push('身体')

  const a = strong.join('和')
  const b = weak.join('和')
  let headline
  if (strong.length >= 3 && weak.length === 0) headline = pick(REVIEW_HEAD.top)
  else if (strong.length >= 2 && weak.length >= 2) headline = pick(REVIEW_HEAD.split)(a, b)
  else if (strong.length >= 1 && weak.length === 0) headline = pick(REVIEW_HEAD.single)(strong[0])
  else if (weak.length >= 2) headline = pick(REVIEW_HEAD.weak)(b)
  else headline = pick(REVIEW_HEAD.plain)
  lines.push(headline)

  /* 出身与位移：按位份差判断，而不是按总分 */
  const moved = sc.rank - (s.origin.rankStart || 0)
  const tag = s.origin.tag
  if (moved >= 2) lines.push(pick(REVIEW_MOVE.up)(tag))
  else if (moved < 0) lines.push(pick(REVIEW_MOVE.down)(tag))
  else lines.push(pick(REVIEW_MOVE.flat)(tag))

  /* 两个关键选择 */
  const turning = s.log.filter(l => l.kind === 'choice' && l.choice)
  const picks = []
  turning.forEach(l => {
    if (picks.length < 2 && (l.text || '').length > 40 && Math.random() > 0.5) picks.push(l)
  })
  while (picks.length < 2 && turning.length > picks.length) {
    const cand = pick(turning)
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
    const c = String(l.choice || '')
    const quoted = /["“”「」]/.test(c)
    const shown = quoted ? c.replace(/"([^"]*)"/g, '「$1」') : `"${c}"`
    let cands = RECAP_INTRO.map((f, i) => i)
    cands = cands.filter(i => !usedIntro.has(i))
    if (!cands.length) cands = RECAP_INTRO.map((f, i) => i)
    const idx = cands[Math.floor(Math.random() * cands.length)]
    usedIntro.add(idx)

    const d = recapDelta(s, l)
    const key = d >= 5 ? 'up' : d <= -5 ? 'down' : 'flat'
    const tail = RECAP_TAIL[key][tailPick[key][tailAt[key]++ % 2]]
    lines.push(RECAP_INTRO[idx]({ when: l.year > 0 ? '入宫第 ' + l.year + ' 年' : '入宫那年', title: l.title, shown }) + tail)
  })

  const r = RANKS[Math.min(8, Math.max(0, sc.rank))]
  if (sc.rankScore >= 55 && sc.health < 45) lines.push(pick(REVIEW_LEDGER.powerSick)(r, sc))
  else if (sc.rankScore >= 55 && sc.peace < 42) lines.push(pick(REVIEW_LEDGER.lowPeace)(r, sc, s))
  else lines.push(pick(REVIEW_LEDGER.quiet)(r, sc, s))

  return lines
}

/* ------------------------- 结算 ------------------------- */

function settle(s) {
  const rankScore = rankScoreOf(s)
  const favor = Math.round(clamp(s.favor, 0, 100))
  const peace = Math.round(clamp(s.peace, 0, 100))
  const health = Math.round(clamp(s.health, 0, 100))
  const total = Math.round(rankScore * 0.34 + favor * 0.18 + peace * 0.26 + health * 0.22)

  const sc = {
    rank: s.rank,
    rankScore,
    favor,
    peace,
    health,
    total,
    year: s.year,
    scheme: s.scheme,
    power: s.power,
    fame: s.fame
  }

  s.finalYear = s.year
  s.finalAge = 16 + s.year

  const seed = Math.round(rankScore) * 7 + Math.round(favor) * 13 + Math.round(peace) * 3 +
    Math.round(health) * 11 + s.flags.length * 17 + Math.round(s.money || 0)

  const hit = pickEndingPair(s, sc, seed)
  const ending = composeEnding(s, sc, hit.base, hit.scene)
  const advice = composeAdvice(s, sc, ADVICE)
  ending._base = hit.base.id
  ending._scene = hit.scene.id
  seenPairs.add(hit.base.id + '|' + hit.scene.id)

  const review = buildReview(s, sc)

  s.done = true
  s.sc = sc
  s.ending = ending
  s.review = review
  s.advice = advice

  return { sc, ending, review, advice }
}

/* ------------------------- 给 UI ------------------------- */

function snapshot(s) {
  const stage = STAGES[s.stage] || STAGES[1]
  return {
    year: s.year,
    rank: s.rank,
    rankName: RANKS[Math.min(8, Math.max(0, s.rank))],
    stageName: stage.name,
    stageTip: stage.tip,
    favor: s.favor,
    fame: s.fame,
    power: s.power,
    peace: s.peace,
    health: s.health,
    scheme: s.scheme,
    money: s.money,
    originTag: s.origin.tag,
    talentNames: s.talents.map(t => t.name)
  }
}

function fateLabel(s) {
  const tags = []
  if (s.cha >= 72) tags.push('容色过人')
  else if (s.cha < 40) tags.push('相貌平平')
  if (s.int >= 70) tags.push('心思缜密')
  else if (s.int < 40) tags.push('不算机敏')
  if (s.scheme >= 68) tags.push('天生会算')
  if (s.peace >= 70) tags.push('心还没硬')
  else if (s.peace < 40) tags.push('心里有刀')
  if (s.power >= 55) tags.push('身后有人')
  if (s.luk >= 72) tags.push('命里有福')
  else if (s.luk < 35) tags.push('时运不济')
  if (s.origin.rankStart === 0) tags.push('从最低处来')
  return tags
}

function rankName(n) {
  return RANKS[Math.min(8, Math.max(0, n))]
}

return {
  createLife,
  getNextEvent,
  choose,
  autoResolve,
  settle,
  snapshot,
  fateLabel,
  rankName,
  RANKS,
  clamp,
  setSeenPairs,
  getSeenPairs
}

})
