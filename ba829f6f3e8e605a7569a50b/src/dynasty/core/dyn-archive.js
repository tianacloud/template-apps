/**
 * core/dyn-archive.js —— 王朝模拟器 · 本朝档案
 * 只存纯数据（事件对象里有函数，不能直接序列化）。
 * 网页走 window.parent.hallStore，小程序走 wx.setStorageSync。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.DynArchive = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const KEY = 'dyn_reign_archive_v1'
  const SEEN_KEY = 'dyn_seen_endings_v1'
  const MAX = 30
  const SEEN_MAX = 5000
  const VERSION = 1

  function hasWX() {
    return typeof wx !== 'undefined' && wx &&
      typeof wx.getStorageSync === 'function' && typeof wx.setStorageSync === 'function'
  }
  function hasLS() {
    try { return typeof window.parent.hallStore !== 'undefined' && !!window.parent.hallStore } catch (e) { return false }
  }

  function read(key, fallback) {
    try {
      let v = null
      if (hasWX()) v = wx.getStorageSync(key)
      else if (hasLS()) v = JSON.parse(window.parent.hallStore.getItem(key) || 'null')
      return v == null ? fallback : v
    } catch (e) {
      return fallback
    }
  }

  function write(key, val) {
    try {
      if (hasWX()) { wx.setStorageSync(key, val); return true }
      if (hasLS()) { window.parent.hallStore.setItem(key, JSON.stringify(val)); return true }
    } catch (e) {
      return false
    }
    return false
  }

  function uid() {
    return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  }

  function cut(s, n) {
    s = String(s == null ? '' : s)
    return s.length > n ? s.slice(0, n) : s
  }

  function stamp(ts) {
    const d = new Date(ts)
    const p = n => (n < 10 ? '0' + n : '' + n)
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
  }

  function all() {
    const list = read(KEY, [])
    if (!Array.isArray(list)) return []
    return list.filter(r => r && r.id && r.title).sort((a, b) => b.ts - a.ts)
  }

  function make(s, result, extra) {
    extra = extra || {}
    const e = result.ending
    return {
      v: VERSION,
      id: extra.id || uid(),
      ts: Date.now(),
      dynasty: s.dynasty,
      era: s.era,
      name: s.surname + s.given,
      origin: s.origin.tag,
      female: !!s.female,
      years: s.years,
      age: s.age,
      sc: result.sc,
      tags: (extra.tags || []).slice(0, 7),
      title: e.title,
      subtitle: e.subtitle,
      desc: e.desc,
      sceneLine: e.sceneLine,
      posthumous: e.posthumous,
      collapse: s.collapse || '',
      review: (result.review || []).slice(0, 8),
      advice: (result.advice || []).map(a => ({ title: a.title, text: a.text })),
      log: s.log.filter(l => l.kind !== 'birth').map(l => ({
        year: l.year,
        age: l.age,
        title: cut(l.title, 26),
        choice: cut(l.choice, 32),
        tone: l.tone || 'neutral'
      }))
    }
  }

  function upsert(rec) {
    const list = all()
    const i = list.findIndex(r => r.id === rec.id)
    if (i >= 0) list[i] = rec
    else list.unshift(rec)
    const out = list.slice(0, MAX)
    return { ok: write(KEY, out), count: out.length }
  }

  function get(id) {
    return all().find(r => r.id === id) || null
  }

  function remove(id) {
    const out = all().filter(r => r.id !== id)
    return { ok: write(KEY, out), count: out.length }
  }

  function clear() {
    write(KEY, [])
    write(SEEN_KEY, [])
    return { ok: true }
  }

  function count() { return all().length }

  function seenPairs() {
    const list = read(SEEN_KEY, [])
    return Array.isArray(list) ? list.filter(x => typeof x === 'string') : []
  }

  function addSeen(pair) {
    if (!pair) return seenPairs()
    const list = seenPairs()
    if (list.indexOf(pair) >= 0) return list
    list.push(pair)
    const out = list.length > SEEN_MAX ? list.slice(list.length - SEEN_MAX) : list
    write(SEEN_KEY, out)
    return out
  }

  function seenCount() { return seenPairs().length }

  function brief(rec) {
    return {
      id: rec.id,
      stamp: stamp(rec.ts),
      title: rec.title,
      subtitle: rec.subtitle,
      dynasty: rec.dynasty,
      era: rec.era,
      years: rec.years,
      total: rec.sc ? rec.sc.total : 0,
      origin: rec.origin
    }
  }

  return {
    make, upsert, all, get, remove, clear, count, brief, stamp,
    seenPairs, addSeen, seenCount,
    capacity: () => MAX,
    key: KEY
  }
})
