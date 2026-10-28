/**
 * core/archive.js —— 人生模拟器 · 本地档案
 *
 * 把一局结束后的结果存成本地存档，以后再调出来看。
 * 只存纯数据：事件对象里带函数（cond / resolve），直接 JSON 化会丢，
 * 所以存的是"渲染结局页所需的最小子集"。
 *
 * 存储：网页走 localStorage，小程序走 wx.setStorageSync，同一套 API。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.LifeArchive = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const KEY = 'life_sim_archive_v1'
  const SEEN_KEY = 'life_sim_seen_endings_v1'   // 见过的「走向×光景」，和 30 局存档分开存
  const SEEN_MAX = 10000                        // 结局一共 10000 格，全用完才允许重复
  const MAX = 30          // 最多留 30 局，超出挤掉最旧的
  const VERSION = 1

  /* ------------------------- 存储适配 ------------------------- */

  function hasWX() {
    return typeof wx !== 'undefined' && wx &&
      typeof wx.getStorageSync === 'function' && typeof wx.setStorageSync === 'function'
  }

  function hasLS() {
    try { return typeof localStorage !== 'undefined' && !!localStorage } catch (e) { return false }
  }

  /* 旧存档里"关键选择"那两句是固定句式，一局里会出现两次一字不差。
   * 新写的句子已经改过，但存下来的旧记录不会自己变，回看时还是老样子。
   * 这里做一次读时迁移：只换掉那句固定收尾，其余原样保留。 */
  const LEGACY_TAIL = '这个选择后来一直在起作用，只是当时你不知道。'
  const LEGACY_FIX = [
    '它没有立刻改变什么，只是把路悄悄挪了一个角度。',
    '那天之后的日子看着和从前一样，其实不一样了。',
    '你说不清它是好是坏。它只是发生了，然后你就成了现在这个人。',
    '这个选择没有对错，只是把你和另一些人在那天分开了。'
  ]
  function fixReview(review) {
    if (!Array.isArray(review)) return []
    const usedTail = new Set()
    return review.map(line => {
      const t = String(line || '')
      if (t.slice(-LEGACY_TAIL.length) !== LEGACY_TAIL) return t
      let h = 0
      for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) & 0x7fffffff
      let k = h % LEGACY_FIX.length
      let guard = 0
      while (usedTail.has(k) && guard++ < LEGACY_FIX.length) k = (k + 1) % LEGACY_FIX.length
      usedTail.add(k)
      return t.slice(0, -LEGACY_TAIL.length) + LEGACY_FIX[k]
    })
  }

  function readRaw() {
    try {
      let list = null
      if (hasWX()) list = wx.getStorageSync(KEY)
      else if (hasLS()) list = JSON.parse(localStorage.getItem(KEY) || '[]')
      if (!Array.isArray(list)) return []
      return list.filter(r => r && r.id && r.title)
        .map(r => (r.review ? Object.assign({}, r, { review: fixReview(r.review) }) : r))
    } catch (e) {
      return []
    }
  }

  function writeRaw(list) {
    try {
      if (hasWX()) { wx.setStorageSync(KEY, list); return true }
      if (hasLS()) { localStorage.setItem(KEY, JSON.stringify(list)); return true }
    } catch (e) {
      return false
    }
    return false
  }

  /* ------------------------- 工具 ------------------------- */

  function uid() {
    return 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  }

  function cut(str, n) {
    str = String(str == null ? '' : str)
    return str.length > n ? str.slice(0, n) : str
  }

  function stamp(ts) {
    const d = new Date(ts)
    const p = n => (n < 10 ? '0' + n : '' + n)
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
  }

  /* ------------------------- 造档 ------------------------- */

  /**
   * 从一局结束后的状态造一条存档
   * @param {object} life   引擎的 state
   * @param {object} result  settle() 的返回值
   * @param {object} extra   { tags, ai: { applied, epitaph } }
   */
  function make(life, result, extra) {
    extra = extra || {}
    const sc = result.sc || life.sc || { wealth: 0, happy: 0, health: 0, achieve: 0, total: 0 }
    const log = (life.log || []).filter(l => l && l.kind !== 'income')

    return {
      v: VERSION,
      id: extra.id || uid(),
      ts: Date.now(),
      gender: life.gender === 'f' ? 'f' : 'm',
      birth: (life.birth && life.birth.tag) || '',
      finalAge: life.finalAge || 79,
      sc: { wealth: sc.wealth, happy: sc.happy, health: sc.health, achieve: sc.achieve, total: sc.total },
      tags: (extra.tags || []).slice(0, 6),
      title: result.ending.title,
      subtitle: result.ending.subtitle,
      desc: result.ending.desc,
      base: result.ending._base || '',
      review: (result.review || []).slice(0, 6),
      advice: (result.advice || []).map(a => ({ title: a.title, text: a.text })),
      ai: extra.ai && extra.ai.applied
        ? { applied: true, epitaph: cut(extra.ai.epitaph, 60) }
        : null,
      // 时间线是回看时最有味道的部分，但没必要存全文
      log: log.map(l => ({
        age: l.age,
        title: cut(l.title, 24),
        choice: cut(l.choice, 30),
        tone: l.tone || 'neutral'
      }))
    }
  }

  /* ------------------------- 增删查 ------------------------- */

  /** 新增或更新（同一 id 视为同一局，覆盖） */
  function upsert(rec) {
    const list = readRaw()
    const i = list.findIndex(r => r.id === rec.id)
    if (i >= 0) list[i] = rec
    else list.unshift(rec)
    const out = list.slice(0, MAX)
    const ok = writeRaw(out)
    return { ok, count: out.length, dropped: list.length > MAX }
  }

  function all() {
    return readRaw().sort((a, b) => b.ts - a.ts)
  }

  function get(id) {
    return readRaw().find(r => r.id === id) || null
  }

  function remove(id) {
    const out = readRaw().filter(r => r.id !== id)
    return { ok: writeRaw(out), count: out.length }
  }

  function clear() {
    const ok = writeRaw([])
    writeSeen([])
    return { ok }
  }

  function count() {
    return readRaw().length
  }

  /* --------------------- 见过的结局（不放回） --------------------- */

  function readSeen() {
    try {
      let list = null
      if (hasWX()) list = wx.getStorageSync(SEEN_KEY)
      else if (hasLS()) list = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')
      if (!Array.isArray(list)) return []
      return list.filter(x => typeof x === 'string')
    } catch (e) {
      return []
    }
  }

  function writeSeen(list) {
    try {
      if (hasWX()) { wx.setStorageSync(SEEN_KEY, list); return true }
      if (hasLS()) { localStorage.setItem(SEEN_KEY, JSON.stringify(list)); return true }
    } catch (e) {
      return false
    }
    return false
  }

  /** 引擎起步前喂给它：这些「走向×光景」已经出过，本局尽量别再出 */
  function seenPairs() {
    return readSeen()
  }

  /** 一局结束后登记。重复的不重复写 */
  function addSeen(pair) {
    if (typeof pair !== 'string' || !pair) return readSeen()
    const list = readSeen()
    if (list.indexOf(pair) >= 0) return list
    list.push(pair)
    const out = list.length > SEEN_MAX ? list.slice(list.length - SEEN_MAX) : list
    writeSeen(out)
    return out
  }

  function resetSeen() {
    return writeSeen([])
  }

  function seenCount() {
    return readSeen().length
  }

  /** 档案列表用的轻量摘要 */
  function brief(rec) {
    return {
      id: rec.id,
      stamp: stamp(rec.ts),
      title: rec.title,
      total: rec.sc ? rec.sc.total : 0,
      finalAge: rec.finalAge,
      gender: rec.gender,
      birth: rec.birth,
      subtitle: rec.subtitle
    }
  }

  return {
    make, upsert, all, get, remove, clear, count, brief, stamp,
    seenPairs, addSeen, resetSeen, seenCount,
    capacity: () => MAX,
    key: KEY
  }
})
