/**
 * core/generator.js —— 宫斗模拟器 · 拼装层
 *
 * 三件事：
 *  1. composeEnding：把「结局走向」与「终局光景」接成一篇完整的结局
 *  2. composeAdvice：挑三句这局最该听的话
 *  3. composeEvent：按这局的局面现场拼 2 条小事件（人物、场合随局面变）
 *
 * 与 data.js 分开，是为了让引擎只认识"状态"，文案全在这里与 data.js。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.PalaceGen = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

const RANKS = ['官女子', '答应', '常在', '贵人', '嫔', '妃', '贵妃', '皇贵妃', '皇后']

const pick = arr => arr[Math.floor(Math.random() * arr.length)]
const has = (s, f) => s.flags.includes(f)

/* ------------------------- 稳定哈希 ------------------------- */

function hashStr(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0)
}

function shareLongPhrase(a, b) {
  if (!a || !b) return false
  for (let i = 0; i + 6 <= a.length; i += 2) {
    if (b.indexOf(a.slice(i, i + 6)) >= 0) return true
  }
  return false
}

/* ------------------------- 结局拼装 ------------------------- */

/* 副题：位份与年头，避开正文里的句子 */
function buildSubtitle(s, sc) {
  const r = RANKS[Math.min(8, Math.max(0, sc.rank))]
  const parts = []
  parts.push(`自${s.origin ? s.origin.tag : '选秀'}入宫`)
  parts.push(`位至${r}`)
  parts.push(`在宫里待了 ${sc.year} 年`)
  return parts.join(' · ')
}

/* 回扣句：从这一局真实的选择里挑一件，用不同的说法提起 */
const BACKFILL = [
  m => `很多年后你还记得「${m.title}」那天。那时你以为只是一件小事。`,
  m => `「${m.title}」——这件事后来一直在你身上，只是没有人再提。`,
  m => `你会想起入宫第 ${m.year} 年「${m.title}」。那天的天色、那件衣裳，都还记得。`,
  m => `这一生的转折不在什么大事上，而在「${m.title}」的那一念之间。`,
  m => `「${m.title}」，你当时没有多想。可你后来走的每一步，都从那天开始。`,
  m => `宫里的人早忘了「${m.title}」，只有你每年到了那个日子，会安静一会儿。`,
  m => `你偶尔会想：如果「${m.title}」那天你换一条路走，如今会在哪里。`,
  m => `「${m.title}」那天你做的决定，后来替你挡过一次祸，也让你失去过一个人。`,
  m => `你现在明白了，「${m.title}」不是一道题，是一道分界。`,
  m => `「${m.title}」那一天，你在心里给自己定了一条规矩。这条规矩你守了一辈子。`,
  m => `那时你还不懂「${m.title}」意味着什么。等你懂的时候，已经过去很多年了。`,
  m => `「${m.title}」——你后来的很多选择，其实都是在回答那一天。`
]

function pickMoment(s, base) {
  const list = (s.log || []).filter(l => l.kind === 'choice' && l.title)
  if (!list.length) return null
  const seed = hashStr(base.id + '|' + (s.year || 0) + '|' + list.length)
  /* 优先挑"看起来像分叉"的：结果文字长的、带得失的 */
  const weighted = list.filter(l => (l.text || '').length > 40)
  const pool = weighted.length ? weighted : list
  return pool[seed % pool.length]
}

/* 收束句：一句具体事实 + 一句抽象的收束 */
const CLOSER_FACT = [
  (s, sc) => `你在宫里待了 ${sc.year} 年，最后是${RANKS[Math.min(8, Math.max(0, sc.rank))]}。`,
  (s, sc) => `${sc.year} 年，${RANKS[Math.min(8, Math.max(0, sc.rank))]}——这就是内务府册子上关于你的全部。`,
  (s, sc) => `你走的时候，位份是${RANKS[Math.min(8, Math.max(0, sc.rank))]}，身边剩下的人不到五个。`,
  (s, sc) => `从入宫到落幕，一共 ${sc.year} 年。这 ${sc.year} 年里，你换了 ${Math.max(1, Math.round(sc.rank))} 次住处。`,
  (s, sc) => `你留下的东西不多：几只箱子，几件旧衣，还有一匣子没送出去的信。`
]

const CLOSER_TAIL = [
  '这宫里记不住人，只记得位置。',
  '宫墙还在，人换了一批又一批。',
  '后来的人说起你，只用一句话带过。',
  '你把一辈子留在了这里，这里什么也没给你留下。',
  '你说不清这一生是赢了还是输了。也许这两件事在宫里本来就不分开。',
  '外头的树每年都发芽。你在墙里，也看见了。',
  '这一局走完了。宫门还在原处，只是不再为你开。'
]

function buildCloser(s, sc, base) {
  return pick(CLOSER_FACT)(s, sc) + pick(CLOSER_TAIL)
}

function composeEnding(s, sc, base, scene) {
  const scn = scene || { id: 'x', name: '', line: '' }
  const title = scn.name ? `${base.title} · ${scn.name}` : base.title

  let subtitle = buildSubtitle(s, sc)
  for (let i = 0; i < 4 && shareLongPhrase(subtitle, base.desc); i++) subtitle = buildSubtitle(s, sc)

  const parts = [base.desc]
  if (scn.line) parts.push(scn.line)

  const moment = pickMoment(s, base)
  if (moment) {
    const tpl = BACKFILL[hashStr(base.id + '_' + scn.id) % BACKFILL.length]
    parts.push(tpl(moment))
  }
  parts.push(buildCloser(s, sc, base))

  return {
    id: scn.id === 'x' ? base.id : `${base.id}_${scn.id}`,
    base: base.id,
    scene: scn.id,
    archetype: base.title,
    title,
    subtitle,
    desc: parts.filter(Boolean).join('\n\n')
  }
}

/* ------------------------- 劝言 ------------------------- */

function composeAdvice(s, sc, bank) {
  const list = []
  Object.keys(bank).forEach(k => {
    const a = bank[k]
    let ok = false
    try { ok = a.cond(s) } catch (e) { ok = false }
    if (!ok) return
    /* 越痛的地方越靠前 */
    let score = 40
    if (k === 'heart') score = 100 - sc.peace + 20
    if (k === 'end') score = 100 - sc.health + 18
    if (k === 'hide') score = 62 - sc.rankScore * 0.3
    if (k === 'fight') score = sc.rankScore * 0.5
    if (k === 'alone') score = 55
    if (k === 'emperor') score = sc.favor * 0.6
    list.push({ title: a.title, text: a.text, _s: score })
  })
  list.sort((a, b) => b._s - a._s)

  const out = []
  const seen = new Set()
  for (const a of list) {
    if (out.length >= 3) break
    if (seen.has(a.title)) continue
    seen.add(a.title)
    out.push({ title: a.title, text: a.text })
  }
  const fallback = [
    { title: '关于藏拙', text: '在这座宫里，被人看见是好事，被人看透是坏事。你可以让人看见你的好，但别让人算出你的底。留一手，不是阴，是活路。' },
    { title: '关于身边人', text: '宫里最贵的东西不是恩宠，是一个肯替你说实话的人。这种人一辈子遇不到几个，遇到了，就别只拿她当差使。' },
    { title: '关于你自己', text: '你在所有选择里都先想别人：皇上、皇后、家里、孩子。下一局，至少有一次，先想想自己受不受得住。' }
  ]
  let i = 0
  while (out.length < 3 && i < fallback.length) out.push(fallback[i++])
  return out
}

/* ------------------------- 现场拼装的小事件 ------------------------- */
/*
 * 与事件池不同：这些事件的人物、场合由这局的局面决定，
 * 所以"你的贴身宫女"永远是同一个人，"李德全"也不会凭空变成别人。
 * 每局只拼 1~2 条，插在时间线里。
 */

const YEAR_STAGE = y => y <= 0 ? 1 : y <= 2 ? 2 : y <= 5 ? 3 : y <= 10 ? 4 : y <= 16 ? 5 : y <= 24 ? 6 : 7

function maidName(s) {
  if (has(s, 'maid_loyal')) return '锦儿'
  return '贴身的宫女'
}

const GEN = [
  /* 1. 传话 */
  (s, y) => ({
    id: 'g_msg_' + y,
    stage: YEAR_STAGE(y),
    year: y,
    title: '一句传话',
    scene: `${maidName(s)}进来，压低声音说：${pick(['贵妃宫里的人方才在打听你', '皇后身边的嬷嬷问起你昨日的去处', '敬事房的人来问你的牌子挂在第几排'])}。她说完看着你，等你拿主意。`,
    options: [
      ['让她别声张，自己去看看', { scheme: 5, peace: -3 }, '你亲自去了一趟，什么也没问，只是站了一会儿。回来时心里有数了。'],
      ['备一份礼，先递过去', { money: -120, power: 4, fame: 2 }, '礼送过去，那边就没了下文。你花了钱，买了一段安静。'],
      ['什么也不做', { peace: 2, scheme: 2 }, '你说：「知道了。」然后继续做手里的事。有时候不动，比动更难。']
    ]
  }),
  /* 2. 月夜 */
  (s, y) => ({
    id: 'g_night_' + y,
    stage: YEAR_STAGE(y),
    year: y,
    title: '月亮很好',
    scene: `夜里睡不着，你披衣起来，站在廊下。月亮很亮，把院子照得像白天。远处有更漏的声音。`,
    options: [
      ['站一会儿，想想家', { peace: 6 }, '你想起了家里院子里的那棵树。站到身上发凉，才回去。'],
      ['叫醒' + maidName(s) + '，说说话', { peace: 4, fame: 1 }, '她披着衣服出来，陪你说到后半夜。说的都是些没用的话，可你觉得好过多了。'],
      ['回去把明天要应对的事想一遍', { scheme: 5, health: -2 }, '你在心里把明天可能遇到的每一句话都过了一遍。想完，天也快亮了。']
    ]
  }),
  /* 3. 份例外的赏 */
  (s, y) => ({
    id: 'g_gift_' + y,
    stage: YEAR_STAGE(y),
    year: y,
    title: '一盒点心',
    scene: `${pick(['御膳房', '内务府', '太后宫里'])}送了一盒点心来，说是「赏小主的」。盒子很精致，可你没要过。`,
    options: [
      ['先让人验一验', { scheme: 5, money: -40, peace: -2 }, '验过没事。你才吃了一块。这宫里的每一口东西，都值得多想一层。'],
      ['分给宫里的人吃', { fame: 4, peace: 2 }, '你把点心分了下去。大家吃得很高兴。你看着他们吃，自己一块没动。'],
      ['原样退回去，说不敢当', { fame: 3, power: -2, peace: 2 }, '你退了回去。送东西的人愣了一下。你不知道这是谁的好意，也就不欠这份情。']
    ]
  }),
  /* 4. 走路 */
  (s, y) => ({
    id: 'g_walk_' + y,
    stage: YEAR_STAGE(y),
    year: y,
    title: '宫道',
    scene: `你从${pick(['御花园', '西六宫', '长街', '宝华殿'])}回来，路上遇见一队人抬着东西过去。你退到墙边，看见箱笼上贴着${pick(['贵妃宫里的封条', '内务府的封条', '没有封条'])}。`,
    options: [
      ['记下这件事', { scheme: 4, power: 2 }, '你记住了箱子的数目和去的方向。这些事单独看没什么，攒起来就是一张图。'],
      ['找人问一句', { money: -30, scheme: 3, fame: 1 }, '你花了点钱，问出是给新晋的小主送的东西。你哦了一声。'],
      ['什么也不管，回去', { peace: 2 }, '你回去了。宫里每天都有这样的事，管不过来。']
    ]
  }),
  /* 5. 旧衣 */
  (s, y) => ({
    id: 'g_cloth_' + y,
    stage: YEAR_STAGE(y),
    year: y,
    title: '旧衣裳',
    scene: `你翻箱子，翻出一件刚进宫时穿的衣裳。料子旧了，领口磨得发白。你拿在手里，忽然有点恍如隔世。`,
    options: [
      ['收起来，留着', { peace: 5 }, '你把衣裳叠好，放回箱底。你知道自己不会再穿，可你舍不得扔。'],
      ['赏给宫女', { fame: 3, peace: 2 }, '宫女接了，欢喜得不得了。你看着她穿上的样子，觉得时间真是快。'],
      ['让人改成小孩子的衣裳', { peace: 4, scheme: 2 }, '你让人改了。改出来的衣裳很小，你看着它，心里软了一下。', { cond: s2 => has(s2, 'has_prince') || has(s2, 'has_princess') }]
    ]
  }),
  /* 6. 请安前的准备 */
  (s, y) => ({
    id: 'g_prep_' + y,
    stage: YEAR_STAGE(y),
    year: y,
    title: '请安之前',
    scene: `天还没亮，${maidName(s)}就进来掌灯。你坐在镜前，让她替你梳头。镜子里的人有点疲倦。`,
    options: [
      ['多敷一层粉，把倦色盖住', { fame: 3, health: -2 }, '你盖住了。镜子里的人看起来很好。这宫里，气色也是要交差的。'],
      ['让她梳得简单些', { peace: 4, fame: -1 }, '你让她梳了个最简单的髻。有人看见会说你不讲究，可你那天舒服了一整天。'],
      ['一边梳头，一边把今天要说的话想一遍', { scheme: 5, health: -2 }, '你想得很细：见了谁说什么，谁问起来怎么答。梳完头，你心里已经有一份稿子了。']
    ]
  })
]

function composeEvent(s, ctx) {
  const used = (ctx && ctx.usedTpls) || new Set()
  const avail = GEN.map((f, i) => i).filter(i => !used.has(i))
  if (!avail.length) return null
  const i = pick(avail)
  used.add(i)
  const years = [2, 4, 7, 11, 14, 18, 21, 24].filter(y => !(ctx && ctx.usedStages && ctx.usedStages[y]))
  const y = years.length ? pick(years) : 8
  if (ctx && ctx.usedStages) ctx.usedStages[y] = true
  const ev = GEN[i](s, y)
  /* 模板里的选项是紧凑元组 [文字, 效果, 结果, {cond/flags/tone/resolve}]，
   * 必须在这里转成引擎认识的 { text, effects, result } —— 否则正文拿到 undefined、效果全丢 */
  if (ev.options) {
    ev.options = ev.options.map(o => {
      if (!Array.isArray(o)) return o
      const x = { text: o[0] }
      if (o[1]) x.effects = o[1]
      if (o[2]) x.result = o[2]
      if (o[3]) Object.assign(x, o[3])
      return x
    })
    /* 选项级的 cond 要在这里滤掉 */
    ev.options = ev.options.filter(o => !o.cond || (() => { try { return o.cond(s) } catch (e) { return true } })())
  }
  return ev
}

return {
  composeEnding,
  composeAdvice,
  composeEvent,
  RANKS
}

})
