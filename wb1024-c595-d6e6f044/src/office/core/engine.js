/**
 * core/engine.js —— 办公室模拟器 · 运行层
 * 只负责状态推进、数值结算、结局判定。文案全部来自 data.js / generator.js。
 *
 * 时间单位是「月」：第 1 个月 = 入职首月，第 360 个月 = 入职第 30 年。
 * 事件按 month 排序，进入新阶段时结算这一段的工资。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data'), require('./generator'))
  else root.OfficeEngine = factory(root.OfficeData, root.OfficeGen)
})(typeof globalThis !== 'undefined' ? globalThis : this, function (data, gen) {

const { TALENTS, COMPANIES, STAGES, RANKS, EVENTS, ENDINGS, SCENES, ADVICE } = data
const { composeEvent, composeEnding, composeAdvice } = gen

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const rand = (a, b) => a + Math.random() * (b - a)
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

/* 每阶段随机配额。固定节点、轮换组、always 都不占这个数。 */
const STAGE_PLAN = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 6, 6: 5, 7: 4 }

/* 随机配额里「族事件」的上限，跨阶段累计余数，避免每阶段都被四舍五入抹平 */
const FAMILY_SHARE = 0.42

const START_AGE = 24
const START_MONTH = 1

/* 离职之后不该再出现的「公司内部」族 */
const OFFICE_FAMILIES = new Set([
  'p_weekreport', 'p_meeting', 'p_report_out', 'p_blame', 'p_ot', 'p_bbq',
  'p_gossip', 'p_favor', 'p_steal', 'p_leave', 'p_review_fight', 'p_seat_move',
  'p_travel', 'p_customer', 'p_newbie', 'p_own_mistake', 'p_politics',
  'p_group_chat', 'p_dress', 'p_printer', 'p_lunch', 'p_late', 'p_hr',
  'p_expense_fiddle', 'p_praise', 'p_credit_small', 'p_layoff_wave', 'p_younger_boss',
  'p_promote', 'p_project'
])

/* 离职后仍能出现的手写节点（生活线、再就业、尾声） */
const POST_LEAVE_OK = new Set([
  'age40', 'age35', 'last_day', 'rehired', 'kid_gaokao', 'parents_age',
  'body_break', 'retire_plan', 'startup_invite', 'arbitration_case',
  'mortgage_pressure', 'side_grow', 'stay_home_choice', 'gov_exam'
])

/* ------------------------- 初始化 ------------------------- */

function rollCompany() {
  const total = COMPANIES.reduce((sum, c) => sum + c.weight, 0)
  let r = Math.random() * total
  for (const c of COMPANIES) {
    r -= c.weight
    if (r <= 0) return c
  }
  return COMPANIES[2]
}

function rollTalents() {
  const pool = TALENTS.filter(t => t.id !== 'ordinary')
  const n = Math.random() < 0.2 ? 2 : 1
  const picked = []
  const copy = pool.slice()
  for (let i = 0; i < n && copy.length; i++) {
    picked.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
  }
  if (Math.random() < 0.1) picked.length = 0
  if (!picked.length) picked.push(TALENTS.find(t => t.id === 'ordinary'))
  return picked
}

function createCareer(pickedGender) {
  const company = rollCompany()
  const talents = rollTalents()
  const gender = (pickedGender === 'm' || pickedGender === 'f')
    ? pickedGender
    : (Math.random() < 0.5 ? 'm' : 'f')

  const rng = arr => Math.round(rand(arr[0], arr[1]))

  const s = {
    stage: 1,
    month: START_MONTH,
    cursor: 0,
    paidMonth: 0,
    age: START_AGE,
    company,
    talents,
    gender,
    genderPicked: pickedGender === 'm' || pickedGender === 'f',

    skill: rng(company.skill),
    rep: rng(company.rep),
    mind: rng(company.mind),
    money: Math.round(rand(company.money[0], company.money[1]) * 10) / 10,
    salary: company.salary,
    rank: 0,
    luk: Math.round(rand(32, 70)),

    flags: (company.flags || []).slice(),
    log: [],
    mem: [],
    done: false,
    timeline: null
  }

  talents.forEach(t => {
    applyEffects(s, t.effects)
    if (t.flag) s.flags.push(t.flag)
  })

  // 心态受天赋影响后，给一个入职时的基准
  s.mind = Math.round(clamp(s.mind + (s.luk - 50) * 0.05, 20, 95))

  s.timeline = buildTimeline(s)
  return s
}

/* ------------------------- 数值 ------------------------- */

function applyEffects(s, effects) {
  if (!effects) return
  Object.keys(effects).forEach(k => {
    const v = effects[k]
    if (typeof v !== 'number') return
    if (k === 'money') { s.money = Math.round((s.money + v) * 10) / 10; return }
    if (k === 'salary') { s.salary = Math.round(clamp(s.salary + v, 3, 90) * 10) / 10; return }
    if (k === 'rank') { s.rank = clamp(s.rank + v, 0, 8); return }
    /* 能力与人缘是边际递减的：从 40 涨到 60 很快，从 85 再往上就很难。
     * 没有这条，六十个事件下来所有人都会顶到 100，四维就失去区分度了。 */
    if (k === 'skill' || k === 'rep') {
      const cur = s[k] || 0
      const gain = v > 0 ? v * (1 - cur / 135) : v
      s[k] = Math.round(clamp(cur + gain, 0, 100))
      return
    }
    if (typeof s[k] === 'number') s[k] = Math.round(clamp(s[k] + v, 0, 100))
  })
}

/* 生活成本：买房、结婚、生孩子都会把每个月固定支出去掉一块 */
function livingCost(s) {
  let c = s.company.cost
  if (s.flags.includes('mortgage')) c += 1.6
  if (s.flags.includes('married')) c += 0.6
  if (s.flags.includes('has_kid')) c += 1.4
  if (s.flags.includes('parent_live_in')) c += 0.5
  if (s.flags.includes('city_tier1')) c += 0.4
  return c
}

/**
 * 阶段结算：把上次结算到现在的工资结掉。
 * 月薪单位是千元，结余按 55% 存下来（剩下的变成房租、外卖、通勤、人情）。
 */
function settleIncome(s, uptoMonth) {
  const months = uptoMonth - s.paidMonth
  if (months <= 0) return
  const net = (s.salary - livingCost(s)) * months / 10
  const saved = Math.round(net * 0.6 * 10) / 10
  s.money = Math.round((s.money + saved) * 10) / 10
  s.paidMonth = uptoMonth
  if (months >= 6) {
    s.log.push({
      month: uptoMonth,
      age: s.age,
      title: '这几年攒下的',
      choice: '',
      text: `${months} 个月过去，扣掉房租和日常，账上多了 ${saved > 0 ? saved : 0} 万。${saved < 0 ? '这个阶段你在赔钱。' : ''}`,
      tone: saved >= 0 ? 'neutral' : 'bad',
      kind: 'income'
    })
  }
}

/* 晋升：能力 + 人缘，管理线额外加成；每阶段最多一次 */
function maybePromote(s, stage) {
  if (s.rank >= 8) return
  if (s.flags.includes('left_job') || s.flags.includes('laid_off')) return
  if (s.flags.includes('coast') || s.flags.includes('marginalized')) return
  /* 职级跟着工龄封顶：第五年当总监的人，在现实里极少。
   * 没有这层限制，三十年下来几乎所有人都能爬到经理以上。 */
  const cap = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 5, 6: 6, 7: 7 }[stage] || 8
  if (s.rank >= cap) return false
  const track = s.flags.includes('track_expert') ? 0.82 : s.flags.includes('track_mgmt') ? 1.0 : 0.9
  const score = (s.skill * 0.5 + s.rep * 0.6) * track +
    (s.flags.includes('loyal') ? 8 : 0) +
    (s.flags.includes('became_manager') ? 5 : 0) +
    (s.flags.includes('promoted') ? 4 : 0) +
    (s.flags.includes('mentored') ? 3 : 0)
  const threshold = 56 + s.rank * 4.6
  if (score < threshold) return false
  s.rank += 1
  const raise = Math.round((1.2 + s.rank * 0.5) * 10) / 10
  s.salary = Math.round(clamp(s.salary + raise, 3, 90) * 10) / 10
  s.flags.push('promoted')
  s.log.push({
    month: s.month,
    age: s.age,
    title: '升了一级',
    choice: '',
    text: `你升到了${RANKS[s.rank]}。工资条上多了 ${raise} 千。恭喜这句话你听了不少次，这次轮到你了。`,
    tone: 'good',
    kind: 'promote'
  })
  return true
}

/* 心态也会回落：人不会因为一件好事高兴很多年，但坏事会留下。
 * 高于 60 的部分每回合按比例消掉，低于 60 的不管——这就是职场里
 * 「日子久了就麻木了」和「伤了就是伤了」的区别。 */
function adapt(s) {
  if (s.mind > 60) s.mind = Math.round(s.mind - (s.mind - 60) * 0.13)
}

function onStageEnter(s, stage) {
  if (stage <= s.stage) return

  // 把上一段的收入结掉
  settleIncome(s, s.month)

  // 工作强度带来的消耗，越往后越明显
  const drop = { 2: 1, 3: 1, 4: 2, 5: 2, 6: 3, 7: 2 }[stage] || 0
  if (drop) s.mind = Math.round(clamp(s.mind - drop, 0, 100))

  // 手艺会过时：不学新东西，旧本事每年都在贬值
  if (stage >= 4) s.skill = Math.round(clamp(s.skill - 2, 0, 100))

  // 人不是机器：阶段之间总有一段稍微松快的日子
  s.mind = Math.round(clamp(s.mind + 2, 0, 100))

  // 阶段晋级：按能力和关系走，不看资历
  if (stage >= 3) maybePromote(s, stage)

  s.stage = stage
}

/* ------------------------- 时间线 ------------------------- */

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
  /* 不再无差别兜底：同一个族在一局里出现两次（比如两次「往后怎么安排」）
   * 比少一条事件更伤。缺的配额由调用方从独立事件池补。 */
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
    const slotPicked = slotNames.map(name =>
      sampleByFamily(all.filter(e => e.slot === name), 1, usedFamily)[0]
    ).filter(Boolean)

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

    // 族不够（或某阶段没有足够的族）时，用独立事件补齐，绝不用同族凑数
    let full = picked
    if (full.length < need) {
      const rest = soloPool.filter(e => full.indexOf(e) < 0)
      full = full.concat(sampleByFamily(rest, need - full.length, usedFamily))
    }

    merged = merged.concat(fixed, slotPicked, always, full)
  })

  // 生成式事件：按公司/领导现场拼 2~3 条
  const genCtx = { usedPersons: new Set(), usedTpls: new Set() }
  const genCount = 2 + (Math.random() < 0.5 ? 1 : 0)
  for (let i = 0; i < genCount; i++) {
    const ev = composeEvent(s, genCtx)
    if (ev) merged.push(ev)
  }

  return merged
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (a.e.month || 0) - (b.e.month || 0) || a.i - b.i)
    .map(x => x.e)
}

/* ------------------------- 文本变体 ------------------------- */

function hashOf(s, tag) {
  const key = tag + '|' + (s.company ? s.company.id : '') + '|' + (s.gender || '') +
    '|' + (s.skill || 0) + '|' + (s.rep || 0) + '|' + (s.mind || 0) + '|' + (s.luk || 0)
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

function variantIndex(s, tag, len) {
  if (len <= 1) return 0
  const i = Math.floor(hashOf(s, tag) * len)
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

/* 文案里可能写「他/她」这类占位：公司里的第三人性别未知，统一用 ta */
function resolveGender(s, text) {
  if (!text || typeof text !== 'string') return text
  return text.split('他/她').join('ta').split('爸/妈').join(s.gender === 'f' ? '妈' : '爸')
}

function withVariant(s, ev) {
  let out = ev
  // scene 可以是函数：按当前状态现场生成（谁、哪家公司、什么职级）
  if (typeof ev.scene === 'function') {
    try { out = Object.assign({}, out, { scene: ev.scene(s) }) } catch (e) { out = Object.assign({}, out, { scene: '' }) }
  }
  if (ev.sceneAlt && ev.sceneAlt.length) {
    const text = variantText(s, ev.sceneAlt, ev.id + '#scene')
    if (text) out = Object.assign({}, out, { scene: text })
  }
  if (out.optPanels && out.optPanels.length && out.options) {
    const panel = out.optPanels[variantIndex(s, out.id + '#opt', out.optPanels.length)]
    if (panel) {
      out = Object.assign({}, out, {
        options: out.options.map((o, i) => (o && panel[i]) ? Object.assign({}, o, { text: panel[i] }) : o)
      })
    }
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

function chanceOf(s, ev) {
  const key = ev.id + '|' + (s.skill || 0) + '|' + (s.rep || 0) + '|' + (s.luk || 0) +
    '|' + (s.company ? s.company.id : '') + '|' + (s.gender || '')
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

function condOk(s, ev) {
  if (!ev) return true
  if (ev.chance && chanceOf(s, ev) >= ev.chance) return false
  if (ev.cond) {
    try { if (!ev.cond(s)) return false } catch (e) { /* 条件写错就当作成立 */ }
  }
  // 离职之后：公司内部的事不再发生
  if (s.flags.includes('left_job')) {
    if (ev.family && OFFICE_FAMILIES.has(ev.family)) return false
    if (!ev.family && ev.stage <= 5 && !POST_LEAVE_OK.has(ev.id)) return false
  }
  return true
}

function substituteSlot(s, ev) {
  if (!ev.slot) return null
  const used = {}
  ;(s.timeline || []).forEach(e => { used[e.id] = true })
  const pool = EVENTS.filter(e =>
    e.stage === ev.stage && e.slot === ev.slot && e.id !== ev.id && !used[e.id] && condOk(s, e)
  )
  return pool.length ? pick(pool) : null
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
    onStageEnter(s, ev.stage)
    s.month = ev.month || s.month
    s.age = START_AGE + Math.floor((s.month - 1) / 12)
    return withVariant(s, ev)
  }
  return null
}

/* ------------------------- 选择 ------------------------- */

function pushFlags(s, list) {
  if (!list) return
  list.forEach(f => { if (!s.flags.includes(f)) s.flags.push(f) })
}

function choose(s, ev, optionIndex) {
  const opt = ev.options[optionIndex]
  if (!opt) return null

  const before = { m: s.money, mi: s.mind, sk: s.skill, rp: s.rep }

  applyEffects(s, opt.effects)
  pushFlags(s, opt.flags)
  // 记录被裁时的年龄：结局判断要用「当时多大」，不是「最后多大」
  if (s.flags.includes('laid_off') && !s.laidOffAge) s.laidOffAge = s.age

  let text = opt.result || ''
  let tone = opt.tone || 'neutral'
  let extra = null

  if (typeof opt.resolve === 'function') {
    try {
      const r = opt.resolve(s, Math.random) || {}
      if (r.effects) applyEffects(s, r.effects)
      pushFlags(s, r.flags)
      if (r.text) text = r.text
      if (r.tone) tone = r.tone
      if (r.extra !== undefined) extra = r.extra
    } catch (e) {
      console.warn('option resolve error', ev.id, e)
    }
  }

  // 事件级结算（试用期去留、分水岭的职级变化）
  if (typeof ev.resolve === 'function') {
    try {
      const r = ev.resolve(s, optionIndex) || {}
      if (r.effects) applyEffects(s, r.effects)
      pushFlags(s, r.flags)
      if (r.text) text = r.text
      if (r.tone) tone = r.tone
    } catch (e) {
      console.warn('event resolve error', ev.id, e)
    }
  }

  text = resolveGender(s, text)

  s.log.push({
    month: s.month,
    age: s.age,
    title: ev.title,
    choice: opt.text,
    text,
    tone,
    kind: 'choice',
    extra
  })

  s.mem.push({
    month: s.month,
    title: ev.title,
    choice: opt.text,
    dm: Math.round((s.money - before.m) * 10) / 10,
    dmi: s.mind - before.mi,
    dsk: s.skill - before.sk
  })

  adapt(s)
  s.cursor++
  return { text, tone, extra }
}

function autoResolve(s, ev) {
  let out = { text: '', tone: 'neutral' }
  if (typeof ev.resolve === 'function') {
    try {
      const r = ev.resolve(s, Math.random) || {}
      if (r.effects) applyEffects(s, r.effects)
      pushFlags(s, r.flags)
      out = { text: r.text || '', tone: r.tone || 'neutral' }
    } catch (e) { /* ignore */ }
  }
  s.log.push({ month: s.month, age: s.age, title: ev.title, choice: '', text: out.text, tone: out.tone, kind: 'event' })
  adapt(s)
  s.cursor++
  return out
}

/* ------------------------- 结局 ------------------------- */

function wealthScore(money) {
  if (money <= 0) return Math.round(clamp(8 + money * 0.12, 0, 10))
  const raw = 10 + 90 * (Math.log10(1 + money / 4) / Math.log10(1 + 320 / 4))
  return Math.round(clamp(raw, 0, 100))
}

function rankScore(s) {
  let base = s.rank * 10.5 + Math.max(0, s.salary - 6) * 0.55
  const bonus = {
    ipo: 10, founder: 7, partner: 8, civil_servant: 4, rehired: -3,
    demoted: -7, marginalized: -6, laid_off: -5, coast: -4, admin_track: -2
  }
  Object.keys(bonus).forEach(f => { if (s.flags.includes(f)) base += bonus[f] })
  if (s.flags.includes('sales_king')) base += 6
  if (s.flags.includes('became_manager')) base += 3
  return Math.round(clamp(base, 0, 100))
}

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

let seenPairs = new Set()
function setSeenPairs(list) {
  seenPairs = new Set(Array.isArray(list) ? list.filter(x => typeof x === 'string') : [])
}
function getSeenPairs() { return Array.from(seenPairs) }

function pickEndingPair(s, sc, seed) {
  const bases = ENDINGS.filter(e => {
    try { return e.match(s, sc) } catch (err) { return false }
  })
  const last = ENDINGS[ENDINGS.length - 1]
  if (!bases.length) return { base: last, scene: pickScene(s, sc) }

  const okScenes = SCENES.filter(x => {
    try { return x.cond(s, sc) } catch (e) { return false }
  })
  const scenes = okScenes.length ? okScenes : [SCENES[0]]

  const cands = []
  bases.forEach(base => {
    const bw = Math.pow(base.pri || 3, 3)
    scenes.forEach(scn => {
      cands.push({ base, scene: scn, w: bw * Math.pow(scn.pri || 3, 3) })
    })
  })

  const fresh = seenPairs.size ? cands.filter(c => !seenPairs.has(c.base.id + '|' + c.scene.id)) : cands
  const pool = fresh.length ? fresh : cands

  let total = 0
  pool.forEach(c => { total += c.w })
  let r = seedRand(seed) * total
  for (let i = 0; i < pool.length; i++) {
    r -= pool[i].w
    if (r <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

function pickScene(s, sc) {
  const pool = SCENES.filter(x => {
    try { return x.cond(s, sc) } catch (e) { return false }
  })
  return weightedPick(pool.length ? pool : SCENES, Math.round(s.mind * 13 + s.money * 7 + s.rank * 31))
}

function settle(s) {
  settleIncome(s, s.month + 1)

  // 销冠：销售线走到后面，客户关系足够硬才成立
  if (s.flags.includes('sales') && s.rep > 60 && s.skill > 48 && !s.flags.includes('sales_king')) {
    if (chanceOf(s, { id: 'sales_king' }) < 0.55) s.flags.push('sales_king')
  }

  const wealth = wealthScore(s.money)
  const rank = rankScore(s)
  const mind = Math.round(clamp(s.mind, 0, 100))
  const skill = Math.round(clamp(s.skill, 0, 100))
  const total = Math.round(wealth * 0.25 + rank * 0.3 + mind * 0.25 + skill * 0.2)
  const sc = { wealth, rank, mind, skill, total }

  // 年资：入职月数换算成年龄
  s.finalAge = START_AGE + Math.floor((s.month - 1) / 12)

  const seed = Math.round(wealth) * 7 + Math.round(rank) * 13 + Math.round(mind) * 3 +
    Math.round(skill) * 11 + Math.round(s.money) + s.flags.length * 17

  const hit = pickEndingPair(s, sc, seed)
  const ending = composeEnding(s, sc, hit.base, hit.scene)
  const advice = composeAdvice(s, sc, ADVICE)
  seenPairs.add(hit.base.id + '|' + hit.scene.id)

  const review = buildReview(s, sc, hit.base)

  s.done = true
  s.sc = sc
  s.ending = ending
  s.review = review
  s.advice = advice

  return { sc, ending, review, advice }
}

/* ------------------------- 回顾 ------------------------- */

const REVIEW_HEAD = {
  top: [
    '这一局你走得比多数人稳：钱、位子、心态、本事，四样里三样都在高位。',
    '你在这家公司活下来了，而且活得不算差。这件事本身就不容易。',
    '四张成绩单，你交出了三张好看的。剩下那张，你自己心里有数。',
    '你没有被这里磨掉，也没有被这里捧杀。这个平衡很难。',
    '你走的时候，位子和钱都有了。代价写在你没给人看过的那部分里。'
  ],
  split: [
    (a, b) => `你拿到了${a}，但${b}一直没跟上。`,
    (a, b) => `${a}是你的强项，${b}是你反复交学费的地方。`,
    (a, b) => `你赢在${a}，输在${b}。这个结构几乎能解释你所有的选择。`,
    (a, b) => `别人记住你是因为${a}；你自己惦记的是${b}。`,
    (a, b) => `${a}撑住了这一局，${b}漏掉的部分你用别的东西补过。`
  ],
  single: [
    a => `你这一局不算耀眼，但${a}是扎实的。`,
    a => `四样里只有${a}站得住，其余都在及格线上下。`,
    a => `你最拿得出手的是${a}，别的，够用而已。`,
    a => `唯一没让你失望的是${a}。`
  ],
  weak: [
    a => `${a}是你这一局反复吃亏的地方。`,
    a => `你在${a}上，交了太多学费。`,
    a => `这一局卡在${a}，别的地方其实都还行。`,
    a => `${a}——这一块你始终没补上，也就一直没绕过去。`
  ],
  plain: [
    '四样都在中段。这种职场最难写，因为它没有戏剧性，只有日程表。',
    '没有大赢，也没有大输。大多数人的三十年，最后都落在这个格子里。',
    '你哪一样都不算差，也没有哪一样能拿出去讲。这不丢人。',
    '不富不穷，不升不降，不悲不喜。这三个「不」加起来，就是一份工作。',
    '你这局没什么可吹的，也没什么需要解释的。'
  ]
}

const REVIEW_MOVE = {
  up: [
    t => `你从「${t}」这个起点出发，最后站到了比它高的地方。`,
    t => `起点是「${t}」，终点比它高出一截。往上走的人不少，走上去还站得住的，不多。`,
    t => `「${t}」给了你一个不算好的开始，你把它用完了，还多走了一段。`
  ],
  down: [
    t => `你的起点是「${t}」，最后没有守住。有些下滑不是你做错了什么，是行业变了，你没来得及跟着变。`,
    t => `从「${t}」出发，落到比起点更低的地方。你尽力了，只是有些牌发下来的时候就不在手里。`,
    t => `「${t}」给了你一个不错的开始，没给你一个同样不错的结尾。`
  ],
  flat: [
    t => `你基本守住了「${t}」给你的那个位置。不升不降，在这个地方已经需要不小的力气。`,
    t => `从「${t}」出发，落点还在原地附近。守住比爬上去更耗人，因为它没有终点。`,
    t => `你的位置几乎是「${t}」的复制。这不是没出息，这是没有掉下去。`
  ]
}

const REVIEW_LEDGER = {
  richTired: [
    (m, sc) => `你攒下了 ${m} 万，也攒下了一身毛病。这两样都是你亲手挣来的，只是标价不同。`,
    (m, sc) => `${m} 万，加上 ${sc.mind} 分的心态。你把前十几年换成了前一个数字，后十几年想用前一个数字换回后一个。`,
    (m, sc) => `账面 ${m} 万。账你算得很清楚，唯独没算过自己的折旧。`
  ],
  poorEasy: [
    (m, sc) => `你最后只有 ${m} 万，但心态有 ${sc.mind} 分。有人说这个组合不划算，只有你知道那些准点下班的傍晚值多少。`,
    (m, sc) => `${m} 万，心态 ${sc.mind} 分。钱和舒服这两样，你这辈子选对了后面那个。`,
    (m, sc) => `账上只有 ${m} 万，可你这一局的心态分有 ${sc.mind}。这个分数买不到，也换不走。`
  ],
  plain: [
    (m, sc) => `最后你的存款是 ${m} 万，心态 ${sc.mind} 分，本事 ${sc.skill} 分。这就是你三十年的账面。`,
    (m, sc) => `账面结清：${m} 万，位子 ${sc.rank} 分，心态 ${sc.mind} 分。三行数字，一份工作。`,
    (m, sc) => `到你离开的时候，存款 ${m} 万，心态 ${sc.mind} 分。不算漂亮，但是真的。`
  ]
}

function buildReview(s, sc, base) {
  const lines = []
  const strong = []
  const weak = []
  if (sc.wealth >= 62) strong.push('钱'); else if (sc.wealth < 40) weak.push('钱')
  if (sc.rank >= 60) strong.push('位子'); else if (sc.rank < 40) weak.push('位子')
  if (sc.mind >= 60) strong.push('心态'); else if (sc.mind < 42) weak.push('心态')
  if (sc.skill >= 62) strong.push('本事'); else if (sc.skill < 42) weak.push('本事')

  const a = strong.join('和')
  const b = weak.join('和')
  if (strong.length >= 3 && !weak.length) lines.push(pick(REVIEW_HEAD.top))
  else if (strong.length >= 2 && weak.length >= 2) lines.push(pick(REVIEW_HEAD.split)(a, b))
  else if (strong.length >= 1 && !weak.length) lines.push(pick(REVIEW_HEAD.single)(strong[0]))
  else if (weak.length >= 2) lines.push(pick(REVIEW_HEAD.weak)(b))
  else lines.push(pick(REVIEW_HEAD.plain))

  const moved = sc.total - (s.company.id === 'bigtech' ? 55 : s.company.id === 'foreign' ? 52 : 45)
  const tag = s.company.tag
  if (moved >= 16) lines.push(pick(REVIEW_MOVE.up)(tag))
  else if (moved <= -8) lines.push(pick(REVIEW_MOVE.down)(tag))
  else lines.push(pick(REVIEW_MOVE.flat)(tag))

  const money = s.money < 0 ? `负债 ${Math.abs(s.money)}` : `${s.money}`
  if (s.money > 120 && sc.mind < 48) lines.push(pick(REVIEW_LEDGER.richTired)(money, sc))
  else if (s.money < 25 && sc.mind >= 62) lines.push(pick(REVIEW_LEDGER.poorEasy)(money, sc))
  else lines.push(pick(REVIEW_LEDGER.plain)(money, sc))

  return lines
}

/* ------------------------- UI 数据 ------------------------- */

function snapshot(s) {
  const stage = STAGES[s.stage] || STAGES[1]
  return {
    month: s.month,
    year: Math.max(1, Math.ceil(s.month / 12)),
    age: s.age,
    stageName: stage.name,
    stageTip: stage.tip,
    skill: s.skill,
    rep: s.rep,
    mind: s.mind,
    money: s.money,
    salary: s.salary,
    rank: s.rank,
    rankName: RANKS[s.rank] || RANKS[0],
    companyTag: s.company.tag,
    talentNames: s.talents.map(t => t.name)
  }
}

function fateLabel(s) {
  const tags = []
  if (s.skill >= 70) tags.push('手上有点东西')
  else if (s.skill < 40) tags.push('还在学')
  if (s.rep >= 70) tags.push('人缘好')
  else if (s.rep < 38) tags.push('不太合群')
  if (s.mind >= 72) tags.push('心大')
  else if (s.mind < 40) tags.push('有点撑不住')
  if (s.talents.some(t => t.id === 'grind')) tags.push('能熬')
  if (s.company.id === 'bigtech') tags.push('在大厂')
  if (s.company.id === 'gov') tags.push('在体制边上')
  return tags
}

return {
  createCareer,
  getNextEvent,
  choose,
  autoResolve,
  settle,
  snapshot,
  fateLabel,
  wealthScore,
  rankScore,
  clamp,
  resolveGender,
  setSeenPairs,
  getSeenPairs
}

})
