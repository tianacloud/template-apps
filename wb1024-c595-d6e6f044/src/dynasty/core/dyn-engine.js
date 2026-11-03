/**
 * core/dyn-engine.js —— 王朝模拟器 · 运行层
 * 只负责：在位年推进、国势结算、事件抽取、亡国/驾崩判定、结局配对。
 * 所有文案都来自 dyn-data.js 与两个事件文件。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./dyn-data'))
  else root.DynEngine = factory(root.DynData)
})(typeof globalThis !== 'undefined' ? globalThis : this, function (data) {

  const { ORIGINS, TRAITS, STAGES, EVENTS, ENDINGS, SCENES, ADVICE, COMMENT_HEAD, COMMENT_BODY } = data
  const { DYNASTY_NAMES, SURNAMES, GIVEN_NAMES, ERA_NAMES, POSTHUMOUS } = data

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
  const rnd = () => Math.random()
  const pick = arr => arr[Math.floor(Math.random() * arr.length)]

  const STAT_KEYS = ['treasury', 'people', 'army', 'admin', 'authority', 'prestige', 'health', 'scholar', 'eunuch', 'warlord', 'clan']
  const STAT_LABEL = {
    treasury: '国库', people: '民心', army: '军备', admin: '吏治',
    authority: '皇权', prestige: '威望', health: '身体',
    scholar: '士族', eunuch: '宦官', warlord: '武将', clan: '宗室'
  }

  /* ------------------------- 稳定哈希 ------------------------- */

  function hash01(str) {
    let h = 2166136261
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return ((h >>> 0) % 100000) / 100000
  }

  function seedRand(seed) {
    let x = Math.abs(Math.round(seed)) % 2147483647
    x = (x * 1103515245 + 12345) % 2147483648
    x = (x * 1103515245 + 12345) % 2147483648
    return x / 2147483648
  }

  function weightedPick(list, weightOf, seed) {
    if (!list.length) return null
    if (list.length === 1) return list[0]
    let total = 0
    const ws = list.map(x => { const w = weightOf(x); total += w; return w })
    let r = (seed == null ? rnd() : seedRand(seed)) * total
    for (let i = 0; i < list.length; i++) {
      r -= ws[i]
      if (r <= 0) return list[i]
    }
    return list[list.length - 1]
  }

  /* ------------------------- 初始化 ------------------------- */

  function rollOrigin(forcedId, female) {
    const pool = ORIGINS.filter(o => !(female && o.id === 'prince'))
    if (forcedId) {
      const hit = pool.find(o => o.id === forcedId)
      if (hit) return hit
    }
    const total = pool.reduce((sum, o) => sum + o.weight, 0)
    let r = rnd() * total
    for (const o of pool) {
      r -= o.weight
      if (r <= 0) return o
    }
    return pool[0]
  }

  function rollTraits(origin) {
    const n = rnd() < 0.3 ? 2 : 1
    const out = []
    const used = {}
    // 先按身世倾向挑一个，让"开国之君"大概率有个能打仗的性子
    if (origin.traitBias && origin.traitBias.length) {
      const id = origin.traitBias[Math.floor(rnd() * origin.traitBias.length)]
      const t = TRAITS.find(x => x.id === id)
      if (t) { out.push(t); used[t.id] = true }
    }
    while (out.length < n) {
      const t = TRAITS[Math.floor(rnd() * TRAITS.length)]
      if (used[t.id]) continue
      used[t.id] = true
      out.push(t)
    }
    return out
  }

  function applyEffects(s, fx) {
    if (!fx) return
    Object.keys(fx).forEach(k => {
      if (k === 'heirs') {
        s.heirs = clamp((s.heirs || 0) + fx[k], 0, 9)
        return
      }
      if (STAT_KEYS.indexOf(k) < 0) return
      if (typeof s[k] !== 'number') return
      aStat(s, k, fx[k])
    })
  }

  function aStat(s, k, d) {
    if (k === 'treasury') s.treasury = Math.round(clamp(s.treasury + d, -30, 100) * 10) / 10
    else s[k] = Math.round(clamp(s[k] + d, 0, 100) * 10) / 10
  }

  function createReign(originId, female) {
    const origin = rollOrigin(originId, female)
    const traits = rollTraits(origin)

    const s = {
      year: 1,
      years: 0,
      age: origin.age,
      female: !!female,
      origin,
      traits,
      dynasty: pick(DYNASTY_NAMES),
      surname: pick(SURNAMES),
      given: pick(GIVEN_NAMES),
      era: pick(ERA_NAMES),
      seed: Math.floor(rnd() * 1e9),
      maxReign: 24 + Math.floor(rnd() * 7),

      treasury: 50, people: 50, army: 50, admin: 50, authority: 50, prestige: 50, health: 80,
      scholar: 45, eunuch: 25, warlord: 40, clan: 40,

      heirs: 0,
      flags: [],
      log: [],
      mem: [],
      used: {},
      usedFamily: {},
      turn: 0,
      ended: false,
      done: false,
      collapse: null,
      deathReason: null
    }

    Object.assign(s, origin.stats)
    s.health = origin.id === 'founder' ? 74 : origin.id === 'child' ? 86 : 80

    traits.forEach(t => {
      applyEffects(s, t.effects)
      if (t.flag && s.flags.indexOf(t.flag) < 0) s.flags.push(t.flag)
    })

    // 女主：合法性天然低一档，但手腕可以补
    if (s.female) {
      s.authority = clamp(s.authority - 8, 0, 100)
      s.scholar = clamp(s.scholar - 8, 0, 100)
      s.clan = clamp(s.clan + 4, 0, 100)
      s.flags.push('female')
    }

    s.openingId = 'open_' + origin.id
    return s
  }

  /* ------------------------- 阶段 ------------------------- */

  function stageOfYear(y) {
    if (y <= 3) return 1
    if (y <= 10) return 2
    if (y <= 20) return 3
    if (y <= 32) return 4
    return 5
  }

  function condOk(s, ev) {
    if (ev.chance && hash01(ev.id + '|' + s.seed + '|' + s.year) >= ev.chance) return false
    if (ev.cond) {
      try { return !!ev.cond(s) } catch (e) { return false }
    }
    return true
  }

  /* 女主：把后宫称谓换一套。事件是写给男主的，但机制一样，不必另写一套。 */
  const FEMALE_MAP = [
    ['皇贵妃', '皇贵君'], ['贵妃', '贵君'], ['淑妃', '淑君'], ['才人', '侍君'],
    ['皇后', '皇夫'], ['妃嫔', '侍从'], ['纳妃', '纳侍'], ['六宫', '内廷'],
    ['后宫', '内廷'], ['宠妃', '宠侍'], ['宫女', '内侍']
  ]
  function femaleText(text) {
    if (typeof text !== 'string') return text
    let out = text
    FEMALE_MAP.forEach(p => { out = out.split(p[0]).join(p[1]) })
    return out
  }

  function withVariant(s, ev) {
    let out = ev
    if (s.female) {
      const patch = {}
      if (out.title) patch.title = femaleText(out.title)
      if (out.scene) patch.scene = femaleText(out.scene)
      if (out.options) {
        patch.options = out.options.map(o => o ? Object.assign({}, o, {
          text: femaleText(o.text),
          result: femaleText(o.result)
        }) : o)
      }
      out = Object.assign({}, out, patch)
    }
    return out
  }

  function logOf(l) {
    return {
      year: l.year,
      age: l.age,
      title: l.title,
      choice: l.choice || '',
      text: l.text || '',
      tone: l.tone || 'neutral',
      kind: l.kind || 'choice'
    }
  }

  /* ------------------------- 抽事件 ------------------------- */

  function available(s) {
    const st = stageOfYear(s.year)
    return EVENTS.filter(e => {
      if (s.used[e.id]) return false
      const es = e.stage || 0
      if (es !== 0 && es !== st) return false
      if (e.family && s.usedFamily[e.family]) return false
      return condOk(s, e)
    })
  }

  function getNextEvent(s) {
    if (!s || s.done || s.ended) return null

    // 第一年固定出即位事件
    if (s.turn === 0) {
      const opening = EVENTS.find(e => e.id === s.openingId)
      if (opening) {
        s.used[opening.id] = true
        s.turn++
        s.current = opening
        return withVariant(s, opening)
      }
    }

    const pool = available(s)
    if (!pool.length) {
      s.ended = true
      if (!s.deathReason) s.deathReason = 'natural'
      return null
    }

    const pinned = pool.filter(e => e.pinned)
    const cands = pinned.length ? pinned : pool
    const ev = weightedPick(cands, e => e.weight || 1)
    if (!ev) return null

    s.used[ev.id] = true
    if (ev.family) s.usedFamily[ev.family] = true
    s.turn++
    s.current = ev
    return withVariant(s, ev)
  }

  /* ------------------------- 年度结算 ------------------------- */

  function softCap(s, k, cap, rate) {
    if (s[k] > cap) aStat(s, k, -(s[k] - cap) * rate)
  }

  function yearTick(s) {
    // 岁入与岁出
    const income = 4.8 + s.people * 0.075 + s.admin * 0.055
    const cost = 4.4 + s.army * 0.075 + s.prestige * 0.018 + s.clan * 0.02 + s.heirs * 0.45
    let net = income - cost

    // 国库见底：欠饷、欠俸，所有事都开始坏
    if (s.treasury < 0) {
      net -= 1.2
      aStat(s, 'people', -1.1)
      aStat(s, 'army', -1.2)
      aStat(s, 'admin', -0.8)
    }
    s.treasury = Math.round(clamp(s.treasury + net, -30, 100) * 10) / 10

    // 民心
    let dp = -0.4
    if (s.treasury < 16) dp -= 0.9
    if (s.admin > 60) dp += 0.6
    if (s.admin < 35) dp -= 0.8
    if (s.army > 72) dp -= 0.5
    if (s.people < 26) dp -= 0.3
    if (s.flags.indexOf('loved_by_people') >= 0) dp += 0.4
    aStat(s, 'people', dp)

    // 吏治自然松弛，宦官与宗室会加速它
    let da = -0.9
    if (s.eunuch > 55) da -= 1.0
    if (s.clan > 62) da -= 0.4
    if (s.admin < 30) da -= 0.3
    aStat(s, 'admin', da)

    // 皇权被最强的派系侵蚀
    const maxF = Math.max(s.scholar, s.eunuch, s.warlord, s.clan)
    if (maxF > 58) aStat(s, 'authority', -(maxF - 58) * 0.055)
    if (s.authority < 35) aStat(s, 'authority', -0.3)

    // 威望缓慢回落：不做事的人，很快就不被提起
    aStat(s, 'prestige', -0.22)

    // 身体
    let drop = s.age < 30 ? 0.6 : s.age < 45 ? 1.1 : s.age < 55 ? 1.7 : s.age < 65 ? 2.4 : 3.1
    if (s.flags.indexOf('diligent') >= 0) drop += 0.25
    if (s.flags.indexOf('daoist') >= 0 && s.year > 10) drop += 0.2
    if (s.health < 30) drop += 0.5
    aStat(s, 'health', -drop)

    // 派系自然生长：只要朝廷还在运转，每一方都会往自己那边多抓一点
    aStat(s, 'scholar', s.admin > 50 ? 0.42 : -0.2)
    aStat(s, 'eunuch', s.authority < 52 ? 0.42 : -0.12)
    aStat(s, 'warlord', (s.army > 55 ? 0.3 : 0) + (s.year > 12 ? 0.12 : 0))
    aStat(s, 'clan', s.heirs > 2 ? 0.34 : 0.16)

    /* 软上限：高处的每一项都会自己往下掉。
     * 民心太高会变成理所当然，威望太高会被当成旧闻，皇权太紧会招来所有人的手。
     * 没有这层回落，"盛世"就只是个数字堆到 100 的产物。 */
    softCap(s, 'people', 70, 0.18)
    softCap(s, 'prestige', 62, 0.12)
    softCap(s, 'authority', 60, 0.09)
    softCap(s, 'admin', 66, 0.15)
    softCap(s, 'army', 70, 0.09)
    softCap(s, 'treasury', 80, 0.06)

    // 对账：四舍五入到整数便于显示
    STAT_KEYS.forEach(k => { s[k] = Math.round(s[k]) })
  }

  function heirTick(s) {
    if (s.heirs >= 5) return
    if (s.year < 3) return
    // 有皇后，子嗣来得稳；没有皇后，内廷也可能有孩子，只是名分不定
    const married = s.flags.indexOf('married') >= 0
    const base = married ? 0.16 : (s.year > 6 ? 0.06 : 0)
    if (!base) return
    const chance = base + (s.flags.indexOf('lewd') >= 0 ? 0.06 : 0)
    if (rnd() < chance) {
      s.heirs++
      s.log.push({
        year: s.year, age: s.age, title: '皇子诞生', choice: '',
        text: married
          ? '宫中添了一位皇子。你去看了一眼，孩子很小，哭声很响。'
          : '内廷添了一位皇子，生母位分不高。名字是你起的，玉牒上添了一行。',
        tone: 'good', kind: 'birth'
      })
    }
  }

  function checkEnd(s) {
    if (s.flags.indexOf('abdicated') >= 0) { s.deathReason = 'abdicate'; s.ended = true; return }
    if (s.flags.indexOf('will_clear') >= 0 || s.flags.indexOf('will_alone') >= 0 || s.flags.indexOf('will_change') >= 0) {
      s.deathReason = 'natural'; s.ended = true; return
    }

    if (s.people <= 0) s.collapse = 'people'
    else if (s.army <= 0) s.collapse = 'army'
    else if (s.authority <= 0) s.collapse = 'authority'
    else if (s.treasury <= -25) s.collapse = 'people'

    if (s.collapse) { s.ended = true; s.deathReason = 'collapse'; return }

    if (s.health <= 0) {
      s.deathReason = (s.flags.indexOf('palace_coup') >= 0 && rnd() < 0.5) ? 'assassin' : 'natural'
      s.ended = true
      return
    }
    if (s.age >= 82 || s.years >= s.maxReign) { s.deathReason = 'natural'; s.ended = true }
  }

  function advance(s) {
    yearTick(s)
    heirTick(s)
    s.year++
    s.age++
    s.years = s.year - 1
    checkEnd(s)
  }

  /* ------------------------- 选择 ------------------------- */

  function diffStats(before, s) {
    const out = []
    STAT_KEYS.forEach(k => {
      if (k !== 'treasury' && k !== 'health' && ['scholar', 'eunuch', 'warlord', 'clan'].indexOf(k) >= 0) return
      const d = Math.round(s[k] - before[k])
      if (d !== 0) out.push({ key: k, label: STAT_LABEL[k], value: d, up: d > 0 })
    })
    return out
  }

  function choose(s, ev, idx) {
    const opt = ev.options[idx]
    if (!opt) return null

    const before = {}
    STAT_KEYS.forEach(k => { before[k] = s[k] })
    const beforeHeirs = s.heirs

    applyEffects(s, opt.effects)
    if (opt.flags) opt.flags.forEach(f => { if (s.flags.indexOf(f) < 0) s.flags.push(f) })

    let text = opt.result || ''
    let tone = opt.tone || 'neutral'
    let extra = null

    if (typeof opt.resolve === 'function') {
      try {
        const r = opt.resolve(s, rnd) || {}
        if (r.effects) applyEffects(s, r.effects)
        if (r.text) text = r.text
        if (r.tone) tone = r.tone
        if (r.flags) r.flags.forEach(f => { if (s.flags.indexOf(f) < 0) s.flags.push(f) })
        extra = r.extra || null
      } catch (e) {
        console.warn('resolve error', ev.id, e)
      }
    }

    if (s.female) text = femaleText(text)

    const entry = {
      year: s.year, age: s.age, title: ev.title,
      choice: opt.text, text, tone, kind: 'choice', extra
    }
    s.log.push(entry)
    s.mem.push({ year: s.year, age: s.age, title: ev.title, choice: opt.text, before, opts: opt.effects || {}, text })

    advance(s)

    const deltas = diffStats(before, s)
    if (s.heirs !== beforeHeirs) {
      deltas.push({ key: 'heirs', label: '子嗣', value: s.heirs - beforeHeirs, up: s.heirs > beforeHeirs })
    }

    return { text, tone, deltas, ended: s.ended, entry: logOf(entry) }
  }

  function autoResolve(s, ev) {
    const before = {}
    STAT_KEYS.forEach(k => { before[k] = s[k] })
    let out = { text: '', tone: 'neutral' }
    if (typeof ev.resolve === 'function') {
      try {
        const r = ev.resolve(s, rnd) || {}
        if (r.effects) applyEffects(s, r.effects)
        out = { text: r.text || '', tone: r.tone || 'neutral' }
      } catch (e) {}
    }
    s.log.push({ year: s.year, age: s.age, title: ev.title, choice: '', text: out.text, tone: out.tone, kind: 'event' })
    advance(s)
    return { text: out.text, tone: out.tone, deltas: diffStats(before, s), ended: s.ended }
  }

  /* ------------------------- 结算 ------------------------- */

  function scoreDims(s) {
    let bonus = 0
    if (s.flags.indexOf('fengshan') >= 0) bonus += 6
    if (s.flags.indexOf('loved_by_people') >= 0) bonus += 3
    if (s.flags.indexOf('reform') >= 0) bonus += 4
    if (s.flags.indexOf('great_victory') >= 0) bonus += 4

    const merit = clamp(s.prestige * 0.34 + s.army * 0.22 + s.admin * 0.24 + Math.min(20, s.years * 0.62) + bonus, 0, 100)
    const welfare = clamp(s.people * 0.72 + s.admin * 0.2 + Math.max(0, s.treasury) * 0.08, 0, 100)
    let order = clamp(s.years * 1.7 + s.authority * 0.32 + (s.heirs > 0 ? 12 : 0), 0, 100)
    if (s.collapse) order = clamp(order - 38, 0, 100)
    const renown = clamp(s.prestige * 0.45 + s.army * 0.28 + (s.collapse ? 0 : 8) + bonus * 0.5, 0, 100)

    const total = Math.round(merit * 0.3 + welfare * 0.3 + order * 0.2 + renown * 0.2)
    return {
      merit: Math.round(merit),
      welfare: Math.round(welfare),
      order: Math.round(order),
      renown: Math.round(renown),
      total
    }
  }

  let seenPairs = new Set()
  function setSeenPairs(list) {
    seenPairs = new Set(Array.isArray(list) ? list.filter(x => typeof x === 'string') : [])
  }
  function getSeenPairs() { return Array.from(seenPairs) }

  function sceneGroupOf(scene) {
    return scene && scene.group ? scene.group : ''
  }

  function pickPair(s, sc) {
    const bases = ENDINGS.filter(e => {
      try { return e.match(s, sc) } catch (err) { return false }
    })
    const okScenes = SCENES.filter(x => {
      try { return x.cond(s, sc) } catch (e) { return false }
    })
    if (!bases.length) return { base: ENDINGS[ENDINGS.length - 1], scene: okScenes[0] || SCENES[0] }

    const cands = []
    bases.forEach(base => {
      let list = okScenes
      const avoid = base.avoid ? [].concat(base.avoid) : []
      if (avoid.length) {
        const alt = okScenes.filter(x => avoid.indexOf(sceneGroupOf(x)) < 0)
        if (alt.length) list = alt
      }
      const bw = Math.pow(base.pri || 3, 3)
      for (let i = 0; i < list.length; i++) {
        cands.push({ base, scene: list[i], w: bw * Math.pow(list[i].pri || 3, 3) })
      }
    })
    if (!cands.length) return { base: bases[0], scene: okScenes[0] || SCENES[0] }

    // 不放回：见过的「庙号×身后」先剔掉，剔空才允许重复
    const fresh = seenPairs.size ? cands.filter(c => !seenPairs.has(c.base.id + '|' + c.scene.id)) : cands
    const pool = fresh.length ? fresh : cands
    const seed = sc.merit * 17 + sc.welfare * 13 + sc.order * 11 + sc.renown * 7 + s.years * 31 + s.flags.length
    return weightedPick(pool, x => x.w, seed)
  }

  function posthumousOf(s, sc) {
    // 亡国之君另有一套恶谥/哀谥，不给"文武宣景"
    let pool = POSTHUMOUS
    if (s.collapse) {
      pool = POSTHUMOUS.filter(p => ['shang', 'yang', 'li', 'ling', 'ai', 'dao'].indexOf(p.id) >= 0)
      for (const p of pool) {
        let ok = false
        try { ok = p.cond(sc, s) } catch (e) {}
        if (ok) return p.name
      }
      return '殇'
    }
    for (const p of pool) {
      let ok = false
      try { ok = p.cond(sc, s) } catch (e) {}
      if (ok) return p.name
    }
    return '思'
  }

  function commentFor(sc) {
    const tier = sc.total >= 62 ? 'high' : sc.total >= 44 ? 'mid' : 'low'
    return pick(COMMENT_HEAD) + pick(COMMENT_BODY[tier])
  }

  const REVIEW_HEAD = {
    high: [
      '四样里三样立得住。这样的局，靠的不只是运气。',
      '你把一个王朝往上抬了一截。抬起来难，守住更难，你都做了。',
      '史书会给你一个体面的本纪。至于体面底下压着多少人，只有你自己知道。',
      '功业、民生、国祚、威名——一个人能占住三样，已经少见。'
    ],
    split: [
      (a, b) => `你在${a}上做成了事，在${b}上一直没找到办法。`,
      (a, b) => `${a}是你的功，${b}是你的债。这笔债，你的继承者替你还了。`,
      (a, b) => `后人记住你，多半因为${a}；你自己夜里想的，多半是${b}。`,
      (a, b) => `${a}撑住了这个王朝，${b}漏掉的那一块，后来成了大窟窿。`
    ],
    weak: [
      a => `${a}这一项，你一直到死都没补上。`,
      a => `这个王朝在你手里最差的地方是${a}。这不是天灾。`,
      a => `${a}——你在这上面欠的账，最后是别人来还的。`,
      a => `如果重来一次，你还是会在${a}上犯同样的错。这是性格，不是命。`
    ],
    plain: [
      '四样都在中段。这样的王朝最难写，因为它没有故事，只有年复一年的折子。',
      '没有大治，也没有大乱。多数皇帝最后都落在这一格。',
      '你既没有把国家变好，也没有让它立刻变坏。这两件事都不容易。',
      '不富不强，不昏不明。这三个"不"加起来，就是二十多年。'
    ]
  }

  const RECAP_INTRO = [
    c => `第 ${c.year} 年，你在「${c.title}」里选了「${c.choice}」。`,
    c => `第 ${c.year} 年那道「${c.title}」的题，你勾的是「${c.choice}」。`,
    c => `第 ${c.year} 年，摆在案上的折子叫「${c.title}」，你批了「${c.choice}」。`,
    c => `「${c.title}」——第 ${c.year} 年你给的答复是「${c.choice}」。`,
    c => `第 ${c.year} 年那次「${c.title}」，你选了「${c.choice}」，然后这件小事就归了档。`,
    c => `很多年后史官翻到第 ${c.year} 年，看见你在「${c.title}」下写的是「${c.choice}」。`
  ]

  const RECAP_TAIL = {
    up: [
      '这一步后来一直在替你兜底。',
      '那一年走对了。你花了很久才敢承认那不是运气。',
      '它给你的东西不是当场兑现的，是分二十年付的。',
      '这一笔，后来写进了你的本纪。'
    ],
    down: [
      '那一步走岔了。你后来花了很多年才把方向拧回来一点。',
      '这个选择当时不痛。真正的账，是十几年后才寄到的。',
      '它后来一直在追着你要东西。',
      '你后来很多次想回到那一年，把那个字改掉。'
    ],
    flat: [
      '它没有立刻改变什么，只是把路悄悄挪了一个角度。',
      '那天之后的日子看着和从前一样，其实不一样了。',
      '你说不清它是好是坏。它只是发生了。',
      '这个选择小到你不觉得它是选择。它偏是。'
    ]
  }

  function recapDelta(m) {
    let sum = 0
    const f = m.opts || {}
    const w = {
      treasury: 0.5, people: 1.2, army: 0.9, admin: 1, authority: 0.8, prestige: 0.9,
      health: 0.3, scholar: 0.2, eunuch: -0.1, warlord: 0.2, clan: 0.2
    }
    Object.keys(f).forEach(k => { if (w[k] != null && typeof f[k] === 'number') sum += f[k] * w[k] })
    return sum
  }

  function buildReview(s, sc) {
    const lines = []
    lines.push(commentFor(sc))

    const post = posthumousOf(s, sc)
    const temple = (ENDINGS.find(e => e.title.indexOf('·') > 0) || {}).title || ''
    lines.push(`上在位${s.years}年，年${s.age}。谥曰${post}，庙号${(s.templeName || '')}。`)

    // 强弱结构
    const strong = []
    const weak = []
    if (sc.merit >= 62) strong.push('功业')
    if (sc.welfare >= 62) strong.push('民生')
    if (sc.order >= 62) strong.push('国祚')
    if (sc.renown >= 62) strong.push('威名')
    if (sc.merit < 42) weak.push('功业')
    if (sc.welfare < 42) weak.push('民生')
    if (sc.order < 42) weak.push('国祚')
    if (sc.renown < 42) weak.push('威名')

    let head
    if (strong.length >= 3) head = pick(REVIEW_HEAD.high)
    else if (strong.length >= 1 && weak.length >= 1) head = pick(REVIEW_HEAD.split)(strong[0], weak[0])
    else if (weak.length >= 2) head = pick(REVIEW_HEAD.weak)(weak.join('和'))
    else if (strong.length === 1) head = `你这一局，最拿得出手的是${strong[0]}。`
    else head = pick(REVIEW_HEAD.plain)
    lines.push(head)

    // 关键选择：取两件影响最大的
    const choices = s.log.filter(l => l.kind === 'choice' && l.choice)
    const scored = choices.map(l => {
      const m = s.mem.find(x => x.year === l.year && x.title === l.title)
      return { l, d: m ? recapDelta(m) : 0 }
    })
    scored.sort((a, b) => Math.abs(b.d) - Math.abs(a.d))
    const used = {}
    scored.slice(0, 2).forEach(x => {
      let i = Math.floor(rnd() * RECAP_INTRO.length)
      let guard = 0
      while (used[i] && guard++ < 10) i = (i + 1) % RECAP_INTRO.length
      used[i] = true
      const key = x.d >= 5 ? 'up' : x.d <= -5 ? 'down' : 'flat'
      lines.push(RECAP_INTRO[i](x.l) + pick(RECAP_TAIL[key]))
    })

    // 一句结尾
    if (s.collapse === 'people') lines.push('这个王朝不是亡于外敌，是亡于它自己治下的那些人。')
    else if (s.collapse === 'army') lines.push('边关的鼓声最后传进了宫城。你听见了，只是已经没有人可以派了。')
    else if (s.collapse === 'authority') lines.push('你失去的不是天下，是说话的分量。这两件事往往是一起发生的。')
    else if (s.deathReason === 'abdicate') lines.push('你放手的那一天，天才刚亮。')
    else if (sc.total >= 62) lines.push('这一局你走得不算差。但历史从不按总分记账。')
    else lines.push('你尽力了。这句话听起来像安慰，其实是最诚实的评价。')

    return lines
  }

  function composeAdvice(s, sc) {
    const list = []
    Object.keys(ADVICE).forEach(k => {
      const a = ADVICE[k]
      let ok = false
      try { ok = a.cond(s) } catch (e) {}
      if (!ok) return
      let score = 30
      if (k === 'treasuryLow') score = 100 - s.treasury
      else if (k === 'peopleLow') score = 100 - s.people + 4
      else if (k === 'armyLow') score = 100 - s.army + 2
      else if (k === 'adminLow') score = 100 - s.admin + 3
      else if (k === 'authorityLow') score = 100 - s.authority + 6
      else if (k === 'powerHigh') score = Math.max(s.scholar, s.eunuch, s.warlord, s.clan) + 10
      else if (k === 'noHeir') score = 95
      else if (k === 'healthLow') score = 100 - s.health + 5
      else if (k === 'prestigeLow') score = 100 - s.prestige
      list.push({ title: a.title, text: a.text, _s: score })
    })
    list.sort((a, b) => b._s - a._s)
    const out = []
    const seen = {}
    list.forEach(a => {
      if (out.length >= 3 || seen[a.title]) return
      seen[a.title] = true
      out.push({ title: a.title, text: a.text })
    })
    return out
  }

  function settle(s) {
    const sc = scoreDims(s)
    const hit = pickPair(s, sc)
    const base = hit.base
    const scene = hit.scene
    const post = posthumousOf(s, sc)
    s.templeName = String(base.title || '').split('·')[0].trim()

    const ending = {
      id: base.id,
      title: base.title,
      subtitle: scene.name,
      desc: base.desc,
      sceneLine: scene.line,
      posthumous: post,
      comment: commentFor(sc),
      _base: base.id,
      _scene: scene.id
    }
    seenPairs.add(base.id + '|' + scene.id)

    const review = buildReview(s, sc)
    const advice = composeAdvice(s, sc)

    s.done = true
    s.sc = sc
    s.ending = ending
    s.review = review
    s.advice = advice

    return { sc, ending, review, advice }
  }

  /* ------------------------- UI 数据 ------------------------- */

  function snapshot(s) {
    const st = STAGES[stageOfYear(s.year)] || STAGES[1]
    const maxF = Math.max(s.scholar, s.eunuch, s.warlord, s.clan)
    return {
      year: s.year,
      age: s.age,
      era: s.era,
      stage: stageOfYear(s.year),
      stageName: st.name,
      stageRange: st.range,
      stageTip: st.tip,
      treasury: Math.round(s.treasury),
      people: Math.round(s.people),
      army: Math.round(s.army),
      admin: Math.round(s.admin),
      authority: Math.round(s.authority),
      prestige: Math.round(s.prestige),
      health: Math.round(s.health),
      heirs: s.heirs,
      factions: {
        scholar: Math.round(s.scholar),
        eunuch: Math.round(s.eunuch),
        warlord: Math.round(s.warlord),
        clan: Math.round(s.clan)
      },
      maxFaction: Math.round(maxF),
      dynasty: s.dynasty,
      fullName: s.surname + s.given
    }
  }

  function fateLabel(s) {
    const tags = []
    tags.push(s.origin.tag)
    if (s.female) tags.push('女主临朝')
    if (s.treasury < 25) tags.push('国库空虚')
    if (s.people < 35) tags.push('民心思变')
    if (s.army < 35) tags.push('边备废弛')
    if (s.admin < 35) tags.push('吏治败坏')
    if (s.authority > 62) tags.push('乾纲独断')
    else if (s.authority < 35) tags.push('大权旁落')
    if (s.scholar > 62) tags.push('士族坐大')
    if (s.eunuch > 62) tags.push('宦官用事')
    if (s.warlord > 62) tags.push('藩镇跋扈')
    if (s.clan > 62) tags.push('宗室强盛')
    if (s.heirs === 0) tags.push('国本未定')
    s.traits.forEach(t => tags.push(t.name))
    return tags.slice(0, 7)
  }

  return {
    createReign,
    getNextEvent,
    choose,
    autoResolve,
    settle,
    snapshot,
    fateLabel,
    stageOfYear,
    setSeenPairs,
    getSeenPairs,
    clamp,
    stats: () => ({ events: EVENTS.length, endings: ENDINGS.length, scenes: SCENES.length, combos: ENDINGS.length * SCENES.length }),
    STAT_LABEL
  }
})
