/**
 * core/archive.js —— 宫斗模拟器 · 本地档案
 *
 * 一局结束后存成一条存档，以后能调出来回看。
 * 只存纯数据：事件里带函数（cond / resolve），JSON 化会丢，
 * 所以存的是"渲染结局页所需的最小子集"。
 *
 * 存储：网页走 window.parent.hallStore，小程序走 wx.setStorageSync。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.PalaceArchive = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const KEY = 'palace_sim_archive_v1'
  const SEEN_KEY = 'palace_sim_seen_endings_v1'
  const SEEN_MAX = 4000
  const MAX = 30
  const VERSION = 1

  function hasWX() {
    return typeof wx !== 'undefined' && wx &&
      typeof wx.getStorageSync === 'function' && typeof wx.setStorageSync === 'function'
  }
  function hasLS() {
    try { return typeof window.parent.hallStore !== 'undefined' && !!window.parent.hallStore } catch (e) { return false }
  }

  function readRaw() {
    try {
      let list = null
      if (hasWX()) list = wx.getStorageSync(KEY)
      else if (hasLS()) list = JSON.parse(window.parent.hallStore.getItem(KEY) || '[]')
      if (!Array.isArray(list)) return []
      return list.filter(r => r && r.id && r.title)
    } catch (e) { return [] }
  }

  function writeRaw(list) {
    try {
      if (hasWX()) { wx.setStorageSync(KEY, list); return true }
      if (hasLS()) { window.parent.hallStore.setItem(KEY, JSON.stringify(list)); return true }
    } catch (e) { return false }
    return false
  }

  function uid() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
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

  /**
   * 从一局结束后的状态造一条存档
   * @param {object} life   引擎 state
   * @param {object} result settle() 的返回值
   * @param {object} extra  { tags, rankName }
   */
  function make(life, result, extra) {
    extra = extra || {}
    const sc = result.sc || life.sc || { rank: 0, rankScore: 0, favor: 0, peace: 0, health: 0, total: 0, year: 0 }
    const log = (life.log || []).filter(l => l && l.kind !== 'income')

    return {
      v: VERSION,
      id: extra.id || uid(),
      ts: Date.now(),
      origin: (life.origin && life.origin.tag) || '',
      originId: life.originId || '',
      rank: sc.rank,
      rankName: extra.rankName || '',
      year: sc.year,
      finalAge: life.finalAge || (16 + (sc.year || 0)),
      sc: {
        rank: sc.rank, rankScore: sc.rankScore, favor: sc.favor,
        peace: sc.peace, health: sc.health, total: sc.total, year: sc.year
      },
      tags: (extra.tags || []).slice(0, 6),
      title: result.ending.title,
      subtitle: result.ending.subtitle,
      desc: result.ending.desc,
      base: result.ending._base || '',
      review: (result.review || []).slice(0, 7),
      advice: (result.advice || []).map(a => ({ title: a.title, text: a.text })),
      log: log.map(l => ({
        year: l.year,
        title: cut(l.title, 24),
        choice: cut(l.choice, 30),
        tone: l.tone || 'neutral'
      }))
    }
  }

  function upsert(rec) {
    const list = readRaw()
    const i = list.findIndex(r => r.id === rec.id)
    if (i >= 0) list[i] = rec
    else list.unshift(rec)
    const out = list.slice(0, MAX)
    const ok = writeRaw(out)
    return { ok, count: out.length, dropped: list.length > MAX }
  }

  function all() { return readRaw().sort((a, b) => b.ts - a.ts) }
  function get(id) { return readRaw().find(r => r.id === id) || null }
  function remove(id) { return { ok: writeRaw(readRaw().filter(r => r.id !== id)) } }
  function clear() { writeRaw([]); writeSeen([]); return { ok: true } }
  function count() { return readRaw().length }

  function readSeen() {
    try {
      let list = null
      if (hasWX()) list = wx.getStorageSync(SEEN_KEY)
      else if (hasLS()) list = JSON.parse(window.parent.hallStore.getItem(SEEN_KEY) || '[]')
      if (!Array.isArray(list)) return []
      return list.filter(x => typeof x === 'string')
    } catch (e) { return [] }
  }
  function writeSeen(list) {
    try {
      if (hasWX()) { wx.setStorageSync(SEEN_KEY, list); return true }
      if (hasLS()) { window.parent.hallStore.setItem(SEEN_KEY, JSON.stringify(list)); return true }
    } catch (e) { return false }
    return false
  }
  function seenPairs() { return readSeen() }
  function addSeen(pair) {
    if (typeof pair !== 'string' || !pair) return readSeen()
    const list = readSeen()
    if (list.indexOf(pair) >= 0) return list
    list.push(pair)
    writeSeen(list.length > SEEN_MAX ? list.slice(list.length - SEEN_MAX) : list)
    return list
  }
  function resetSeen() { return writeSeen([]) }
  function seenCount() { return readSeen().length }

  function brief(rec) {
    return {
      id: rec.id,
      stamp: stamp(rec.ts),
      title: rec.title,
      subtitle: rec.subtitle,
      total: rec.sc ? rec.sc.total : 0,
      rankName: rec.rankName,
      year: rec.year,
      origin: rec.origin
    }
  }

  return {
    make, upsert, all, get, remove, clear, count, brief, stamp,
    seenPairs, addSeen, resetSeen, seenCount,
    capacity: () => MAX,
    key: KEY
  }
})
