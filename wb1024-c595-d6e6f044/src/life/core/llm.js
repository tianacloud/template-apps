/**
 * core/llm.js —— 人生模拟器 · 外部大模型接口层
 *
 * 这里不调用任何模型，也不持有任何密钥。
 * 它只做三件事：
 *   buildDigest  —— 把这一局的人生压缩成一份 AI 读得懂的档案
 *   buildPrompt  —— 拼成一条完整指令，用户复制走，自己发给任意 AI
 *   parseReply   —— 把 AI 的回复解析回 {epitaph, summary, advice}，用来覆盖结局页
 *
 * UMD：小程序走 module.exports，网页走 window.LifeAI
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.LifeAI = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

const EDU_LABEL = {
  0: '没上高中',
  1: '落榜 / 很差',
  2: '专科',
  3: '二本',
  4: '一本',
  5: '名校'
}

function n(v) {
  return Math.round(Number(v) || 0)
}

function sign(v, unit) {
  const num = n(v)
  if (!num) return ''
  return (num > 0 ? '+' : '') + num + unit
}

function joinDeltas(parts) {
  return parts.filter(Boolean).join('，')
}

/* ------------------------- 一、档案 ------------------------- */

// 从这一局里挑出真正改了命的几个时刻
function pickKeyChoices(s, limit) {
  const mem = (s.mem || []).slice()
  if (!mem.length) {
    // 兜底：从 log 里挑带选择、且选项有实际数值的
    return (s.log || [])
      .filter(l => l.kind === 'choice' && l.choice)
      .slice(-limit)
      .map(l => ({ age: l.age, title: l.title, choice: l.choice }))
  }

  const scored = mem.map(m => ({
    m,
    score: Math.abs(m.dh || 0) + Math.abs(m.dhl || 0) * 1.25 + Math.abs(m.dm || 0) * 0.45
  }))
  scored.sort((a, b) => b.score - a.score)

  const picked = scored.slice(0, limit).map(x => x.m)
  // 按年龄重新排，读起来才是一条时间线
  picked.sort((a, b) => a.age - b.age)
  return picked
}

function buildDigest(s, result) {
  const sc = result && result.sc ? result.sc : s.sc || {}
  const lines = []

  const gender = s.gender === 'f' ? '女' : '男'
  const birth = s.birth ? s.birth.tag : '不详'
  const talents = (s.talents || []).map(t => t.name).join('、') || '无'
  const age = s.finalAge || 79

  lines.push(`这个人：${gender}，${birth}出生，${age} 岁去世。`)
  lines.push(`天赋（出生时抽到的，不算选择）：${talents}。`)
  lines.push(
    `学历档位 ${n(s.edu)}/5（${EDU_LABEL[n(s.edu)] || '不详'}）；职业层级 ${n(s.career)}/12。`
  )
  lines.push(
    `终局：存款 ${n(s.money)} 万；心境 ${n(sc.happy)}；身体 ${n(sc.health)}；成就 ${n(sc.achieve)}；综合 ${n(sc.total)}（各项满分 100）。`
  )

  // 关键选择
  const keys = pickKeyChoices(s, 8)
  if (keys.length) {
    lines.push('')
    lines.push('【关键选择】（括号里是当时真实的数值变化）')
    keys.forEach(k => {
      const d = joinDeltas([
        k.dh !== undefined ? (k.dh ? '心境' + sign(k.dh, '') : '') : '',
        k.dhl !== undefined ? (k.dhl ? '身体' + sign(k.dhl, '') : '') : '',
        k.dm !== undefined ? (k.dm ? '存款' + sign(k.dm, '万') : '') : ''
      ])
      const tail = d ? `（${d}）` : ''
      lines.push(`${k.age} 岁 ${k.title}：${k.choice}${tail}`)
    })
  }

  // 完整经历，只留标题
  const tl = (s.log || [])
    .filter(l => l.kind !== 'income')
    .map(l => `${l.age} 岁 ${l.title}`)
  if (tl.length) {
    lines.push('')
    lines.push('【完整经历】（按年龄，标题即当时发生的事）')
    lines.push(tl.join(' → '))
  }

  // 系统已有的一套结论，给 AI 当底色，但明确要求别照抄
  if (result && result.ending) {
    lines.push('')
    lines.push('【游戏系统给出的结局】（只作参考，不要改写它，你要写另一份）')
    lines.push(`标题：${result.ending.title}`)
    lines.push(`副题：${result.ending.subtitle}`)
    lines.push(`正文：${result.ending.desc}`)
  }

  if (result && result.advice && result.advice.length) {
    lines.push('')
    lines.push('【系统已经提过的角度】（只避开这些角度，不要沿用它的语气）')
    lines.push(result.advice.map(a => a.title).join('、'))
  }

  return lines.join('\n')
}

/* ------------------------- 二、指令 ------------------------- */

const RULES = [
  '全程用第二人称“你”。不要用“该玩家”“这位人物”“主人公”。',
  '只陈述事实和因果，不下判断、不夸奖、不惋惜。不要出现“成功”“失败”“值得”“可惜”“幸运”这类评价词。',
  '严禁励志和鸡汤：不许出现“愿你”“相信自己”“人生没有白走的路”“一切都是最好的安排”这类句子，不许在结尾升华，不许加一句安慰。',
  '具体。凡是能落到年龄、金额、事件名的都要落下来。“你 30 岁那年为了首付借遍了亲戚”优于“你为了房子付出了很多”。',
  '语气克制、干燥、略冷，像一份写得好的病历或档案，不像散文。',
  '不要复述我给你的数据清单，要写出它们之间的关系：你用什么换了什么，代价在什么时候来收，差价是什么。'
]

const SHAPE = [
  'epitaph：一句墓志铭，20 字以内。要具体到这个人的某一件事或某一种活法，不要抽象格言。',
  'summary：250~350 字，分三段，段与段之间用 \\n 分隔，不要小标题。第一段写这个人最终落在了哪里；第二段写是哪两三个选择把他推到了这里；第三段写他为此付了什么、又换回了什么。',
  'advice：三条，每条 {title, text}。title 不超过 8 字，必须是一条可执行的行动，不是道理。text 60~90 字，必须点到具体的年龄、事件或数字，并给出一件这周就能做的小事。不要写“多运动”“保持乐观”“珍惜当下”这种。'
]

function buildPrompt(s, result) {
  const digest = buildDigest(s, result)
  const out = []

  out.push('你是一位擅长写人物侧写的非虚构作者。下面是一份人生模拟游戏的完整记录，请为这一局写三样东西：一句墓志铭、一段人生总结、三条建议。')
  out.push('')
  out.push('【必须遵守】')
  RULES.forEach((r, i) => out.push(`${i + 1}. ${r}`))
  out.push('')
  out.push('【三个字段】')
  SHAPE.forEach(x => out.push('· ' + x))
  out.push('')
  out.push('【输出格式】')
  out.push('只输出一个 JSON 对象，不要 markdown 代码块，不要任何解释文字，不要前后缀：')
  out.push('{"epitaph":"...","summary":"...","advice":[{"title":"...","text":"..."},{"title":"...","text":"..."},{"title":"...","text":"..."}]}')
  out.push('')
  out.push('以下是数据。')
  out.push('')
  out.push(digest)

  return out.join('\n')
}

/* ------------------------- 三、解析 ------------------------- */

function stripFence(text) {
  let t = String(text || '').trim()
  t = t.replace(/^```[a-zA-Z]*\s*\n?/, '').replace(/\n?```\s*$/, '')
  // 模型有时会在 JSON 前后加一句客套，切掉
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start >= 0 && end > start) t = t.slice(start, end + 1)
  return t
}

function cleanJson(t) {
  return t
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, '$1')
}

/* AI 很爱在 JSON 字符串里直接换行、留 tab，标准 JSON 不允许，
   这样整段就解析失败、退化成"把原文照抄进总结"。这里把字符串内部的
   裸控制字符转义掉再试一次。 */
function repairJson(t) {
  let out = ''
  let inStr = false
  let esc = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (inStr) {
      if (esc) { out += c; esc = false; continue }
      if (c === '\\') { out += c; esc = true; continue }
      if (c === '"') { out += c; inStr = false; continue }
      if (c === '\n') { out += '\\n'; continue }
      if (c === '\r') { continue }
      if (c === '\t') { out += '\\t'; continue }
      out += c
      continue
    }
    if (c === '"') { inStr = true; out += c; continue }
    out += c
  }
  return out
}

function normAdvice(raw) {
  if (!raw) return []
  const arr = Array.isArray(raw) ? raw : [raw]
  return arr
    .map(item => {
      if (typeof item === 'string') {
        const s = item.replace(/^\s*(?:\d+|[一二三四五])[、.．)）]\s*/, '').trim()
        const cut = s.indexOf('：') >= 0 ? s.indexOf('：') : s.indexOf(':')
        if (cut > 0 && cut <= 10) {
          return { title: s.slice(0, cut).trim(), text: s.slice(cut + 1).trim() }
        }
        return { title: '', text: s }
      }
      if (item && typeof item === 'object') {
        const title = String(item.title || item.标题 || item.name || '').trim()
        const text = String(item.text || item.content || item.内容 || item.desc || '').trim()
        return { title, text }
      }
      return null
    })
    .filter(x => x && x.text && x.text.length >= 8)
    .map((x, i) => ({ title: x.title || `建议 ${i + 1}`, text: x.text }))
    .slice(0, 3)
}

// 没有 JSON 时的兜底：按“1. 2. 3.”切建议，其余当正文
function heuristic(text) {
  const raw = String(text || '').trim()
  if (raw.length < 40) return null

  const lines = raw.split(/\n+/).map(x => x.trim()).filter(Boolean)
  const adviceLines = []
  const bodyLines = []
  lines.forEach(l => {
    if (/^(?:\d+|[一二三四五])[、.．)）]/.test(l)) adviceLines.push(l)
    else bodyLines.push(l)
  })

  const summary = bodyLines.join('\n').trim()
  if (summary.length < 40) return null

  return {
    epitaph: '',
    summary: summary.slice(0, 900),
    advice: normAdvice(adviceLines),
    loose: true
  }
}

/**
 * 解析 AI 的回复。返回 null 表示完全读不懂。
 * @returns {{epitaph:string, summary:string, advice:Array<{title,text}>, loose?:boolean}|null}
 */
function parseReply(text) {
  const raw = String(text || '').trim()
  if (raw.length < 20) return null

  const jsonText = cleanJson(stripFence(raw))
  const candidates = [jsonText, repairJson(jsonText), repairJson(cleanJson(jsonText.replace(/\n\s*/g, ' ')))]

  for (const text of candidates) {
    try {
      const obj = JSON.parse(text)
      const summaryRaw = obj.summary || obj.总结 || obj.人生总结 || ''
      const summary = Array.isArray(summaryRaw) ? summaryRaw.join('\n') : String(summaryRaw)
      const epitaph = String(obj.epitaph || obj.墓志铭 || '').trim()
      const advice = normAdvice(obj.advice || obj.建议)

      if (summary.trim().length >= 40) {
        return {
          epitaph,
          summary: summary.trim().slice(0, 1200),
          advice
        }
      }
    } catch (e) {}
  }

  return heuristic(raw)
}

return {
  buildDigest,
  buildPrompt,
  parseReply,
  EDU_LABEL
}

})
