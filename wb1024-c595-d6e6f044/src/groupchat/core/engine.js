/**
 * core/engine.js —— 群聊模拟器 · 运行层
 * 只负责：抽事件、结算数值、判结局。文案全部来自 data.js / events*.js
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data'))
  else root.GcEngine = factory(root.GcData)
})(typeof globalThis !== 'undefined' ? globalThis : this, function (data) {

const { EVENTS, MEMBER_MAP, STAGES, IDENTITIES, OUTCOMES, ADVICE, NICK_POOL } = data

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const rnd = n => Math.floor(Math.random() * n)
const pick = arr => arr[rnd(arr.length)]

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1)
    const t = a[i]; a[i] = a[j]; a[j] = t
  }
  return a
}

/* 每阶段实际要出几条。pin 必出，其余随机补足。 */
const PLAN = { 1: 5, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4 }

const START_CASH = [1800, 6000]

function condOk(s, ev) {
  if (!ev.cond) return true
  try { return !!ev.cond(s) } catch (e) { return false }
}

function byStage(stage) {
  return EVENTS.filter(e => e.stage === stage)
}

/* ============================ 建局 ============================ */

function createRun(nick) {
  const s = {
    nick: (nick || '').trim() || pick(NICK_POOL),
    stage: 1,
    cursor: 0,
    day: 1,
    face: 50,
    fame: 8,
    weird: 0,
    cash: Math.round(START_CASH[0] + Math.random() * (START_CASH[1] - START_CASH[0])),
    info: 0,
    group: 50,
    flags: [],
    queue: [],
    used: {},
    log: [],
    chat: [],
    done: false,
    ending: null,
    startedAt: Date.now()
  }
  s.queue = buildQueue(s, 1)
  return s
}

/** 为某阶段抽事件队列：pin 全出 + 其余随机补足 PLAN */
function buildQueue(s, stage) {
  const all = byStage(stage)
  const ok = all.filter(e => condOk(s, e))
  const pinned = ok.filter(e => e.pin)
  const rest = shuffle(ok.filter(e => !e.pin && !s.used[e.id]))

  // 同一阶段内的 slot 组只出一条（同组轮换）
  const bySlot = {}
  const solo = []
  rest.forEach(e => {
    if (e.slot) {
      if (bySlot[e.slot]) { bySlot[e.slot].push(e); return }
      bySlot[e.slot] = [e]
      return
    }
    solo.push(e)
  })
  const slotPicks = shuffle(Object.keys(bySlot).map(k => pick(bySlot[k])))

  const need = Math.max(0, (PLAN[stage] || 4) - pinned.length)
  // 配额分账：日常纹理（slot 轮换）至少占三分之一，主线事件占其余
  const slotQuota = Math.min(slotPicks.length, Math.ceil(need / 3))
  const soloQuota = Math.max(0, need - slotQuota)
  const chosen = pinned
    .concat(slotPicks.slice(0, slotQuota), shuffle(solo).slice(0, soloQuota))
  chosen.forEach(e => { s.used[e.id] = true })
  // 一天之内消息是有先后的：按（阶段内第几天 + 当天时间）排，别打乱
  const tKey = e => {
    const t = e.time || ''
    const [h, m] = t.split(':').map(x => parseInt(x, 10) || 0)
    return (e.day || 1) * 1440 + h * 60 + m
  }
  chosen.sort((a, b) => tKey(a) - tKey(b))
  return chosen
}

/* ============================ 数值 ============================ */

const CAP = { face: [0, 100], fame: [0, 100], weird: [0, 100], info: [0, 100], group: [0, 100] }

function applyFx(s, fx) {
  if (!fx) return []
  const deltas = []
  Object.keys(fx).forEach(k => {
    const v = fx[k]
    if (!v) return
    if (k === 'cash') {
      s.cash = Math.max(0, Math.round(s.cash + v))
      deltas.push({ key: 'cash', v: Math.round(v) })
      return
    }
    if (typeof s[k] !== 'number') return
    const cap = CAP[k] || [0, 100]
    s[k] = Math.round(clamp(s[k] + v, cap[0], cap[1]))
    deltas.push({ key: k, v: Math.round(v) })
  })
  return deltas
}

function addFlags(s, flags) {
  if (!flags) return
  flags.forEach(f => { if (s.flags.indexOf(f) < 0) s.flags.push(f) })
}

function hasFlag(s, f) { return s.flags.indexOf(f) >= 0 }

/* ============================ 文本 ============================ */

function fill(s, text) {
  if (typeof text !== 'string') return text
  return text.replace(/\{me\}/g, s.nick)
}

function normMsg(s, m) {
  let who
  if (m.from === 'me') who = { id: 'me', name: s.nick, avatar: s.nick.slice(-1), hue: 130 }
  else if (MEMBER_MAP[m.from]) who = MEMBER_MAP[m.from]
  else {
    // 群里的临时面孔（如下一任新邻居）：拿 id 当名字，头像取尾字
    const nm = m.name || m.from
    let h = 0
    for (let i = 0; i < m.from.length; i++) h = (h * 31 + m.from.charCodeAt(i)) % 360
    who = { id: m.from, name: nm, avatar: nm.slice(-1), hue: h }
  }
  return {
    from: m.from,
    name: who ? who.name : '',
    avatar: who ? who.avatar : '?',
    hue: who ? who.hue : 0,
    sys: !!m.sys,
    type: m.type || 'text',
    text: fill(s, m.text || ''),
    amt: m.amt,
    note: m.note,
    sec: m.sec,
    mine: m.from === 'me'
  }
}

/* ============================ 推进 ============================ */

/**
 * 取下一个内容块。
 * 返回 { type:'chapter' } 阶段卡片 / { type:'event', ev } / { type:'end' }
 */
function next(s) {
  if (s.done) return { type: 'end' }

  if (s.cursor >= s.queue.length) {
    // 本阶段走完
    if (s.stage >= 6) {
      s.done = true
      s.ending = settle(s)
      return { type: 'end' }
    }
    s.stage += 1
    s.cursor = 0
    s.day = STAGES[s.stage].day
    stageSettle(s)
    s.queue = buildQueue(s, s.stage)
    return { type: 'chapter', stage: s.stage, info: STAGES[s.stage] }
  }

  const ev = s.queue[s.cursor]
  // 运行时二次过滤：走到这里状态可能已变（例如 face 掉了），cond 不成立就跳过
  if (!condOk(s, ev)) {
    s.cursor += 1
    return next(s)
  }
  return { type: 'event', ev: ev, stage: s.stage }
}

/** 当前事件的渲染消息（不含玩家选择） */
function renderEvent(s, ev) {
  return (ev.msgs || []).map(m => normMsg(s, m))
}

/**
 * 选择。返回本轮所有要追加的内容：
 * { mine, act, replies, result, deltas, flags }
 */
function choose(s, ev, index) {
  const opt = ev.options[index]
  if (!opt) return null

  const deltas = []
  addFlags(s, opt.flag)
  deltas.push.apply(deltas, applyFx(s, opt.fx))

  const mine = opt.say ? normMsg(s, { from: 'me', text: opt.say }) : null
  const replies = (opt.replies || []).map(m => normMsg(s, m))
  const result = fill(s, opt.result || '')

  s.cursor += 1
  if (ev.day) s.day = (STAGES[s.stage].day || s.day) + ev.day - 1

  s.log.push({
    stage: s.stage,
    day: s.day,
    id: ev.id,
    title: ev.id,
    said: opt.say || null,
    act: opt.act || null,
    result: result,
    flags: opt.flag || [],
    deltas: deltas
  })

  return {
    mine: mine,
    act: opt.act ? fill(s, opt.act) : null,
    replies: replies,
    result: result,
    deltas: deltas,
    flags: opt.flag || []
  }
}

/* ============================ 结局 ============================ */

function scoreOf(list, s) {
  const rows = list.map(it => {
    let j = 0
    try { j = it.judge ? it.judge(s) : 0 } catch (e) { j = 0 }
    j = clamp(j, 0, 1.4)
    return { it: it, w: Math.pow(it.pri || 5, 3) * Math.max(0.001, j) }
  })
  return rows
}

function weighted(rows) {
  const total = rows.reduce((a, r) => a + r.w, 0)
  if (!total) return rows[0].it
  let r = Math.random() * total
  for (const row of rows) {
    r -= row.w
    if (r <= 0) return row.it
  }
  return rows[rows.length - 1].it
}

/* 已出过的组合（跨局不放回），存在外部传进来的数组里 */
let seen = []
function setSeen(list) { seen = Array.isArray(list) ? list.slice() : [] }
function getSeen() { return seen.slice() }

function settle(s) {
  const rows = scoreOf(IDENTITIES, s).filter(r => r.w > 0)
  const orows = scoreOf(OUTCOMES, s).filter(r => r.w > 0)

  // 先尝试没出过的组合
  let base = null, sc = null
  const fresh = []
  rows.forEach(r => orows.forEach(o => {
    if (seen.indexOf(r.it.id + '|' + o.it.id) < 0) fresh.push([r, o])
  }))

  if (fresh.length) {
    const total = fresh.reduce((a, p) => a + p[0].w * p[1].w, 0)
    let r = Math.random() * total
    for (const p of fresh) {
      r -= p[0].w * p[1].w
      if (r <= 0) { base = p[0].it; sc = p[1].it; break }
    }
  }
  if (!base || !sc) {
    base = weighted(rows) || IDENTITIES[IDENTITIES.length - 1]
    sc = weighted(orows) || OUTCOMES[3]
  }
  seen.push(base.id + '|' + sc.id)

  const tone = (s.face + s.group) / 2
  const bucket = tone > 62 ? 'high' : tone > 42 ? 'mid' : 'low'
  const advice = pick(ADVICE[bucket])

  return {
    base: base,
    scene: sc,
    advice: advice,
    bucket: bucket,
    stats: snapshot(s),
    review: buildReview(s),
    day: s.day
  }
}

/** 回顾：从玩家实际说过的话里挑三句，不重复 */
function buildReview(s) {
  const says = s.log.filter(l => l.said).map(l => l.said)
  const silents = s.log.filter(l => !l.said && l.act)
  const out = []
  const used = []

  const addSaid = (label, text) => {
    if (!text || used.indexOf(text) >= 0) return
    used.push(text)
    out.push({ label: label, text: text })
  }

  if (says.length) addSaid('你说过', says[0])
  if (says.length > 2) addSaid('你还说过', says[Math.floor(says.length / 2)])
  if (silents.length) addSaid('有一次，你没说话', silents[0].act)
  if (says.length > 1) addSaid('最后你说', says[says.length - 1])
  return out
}

function snapshot(s) {
  return {
    nick: s.nick,
    stage: s.stage,
    stageName: (STAGES[s.stage] || {}).name || '',
    day: s.day,
    face: s.face,
    fame: s.fame,
    weird: s.weird,
    cash: s.cash,
    info: s.info,
    group: s.group,
    flags: s.flags.slice(),
    spoke: s.log.filter(l => l.said).length,
    total: s.log.length
  }
}

/** 阶段结算：群气氛随玩家行为漂移一点，纯装饰性数值 */
function stageSettle(s) {
  if (s.face > 65) s.group = clamp(s.group + 3, 0, 100)
  if (s.weird > 55) s.group = clamp(s.group - 3, 0, 100)
  if (s.fame < 15) s.group = clamp(s.group - 2, 0, 100)
}

return {
  createRun,
  next,
  renderEvent,
  choose,
  snapshot,
  settle,
  stageSettle,
  setSeen,
  getSeen,
  condOk
}
})
