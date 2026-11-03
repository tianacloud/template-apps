/**
 * core/archive.js —— 末日生存模拟器 · 本地档案
 *
 * 和人生模拟器同构：只存纯数据（函数不能 JSON 化），存的是"回看一局所需的最小集"。
 * 这个游戏只有网页版，所以直接用 localStorage，不写 wx 分支。
 *
 * 两个 key：
 *   doom_sim_archive_v1       30 局存档
 *   doom_sim_seen_endings_v1  见过的「走向×光景」（不受 30 局上限影响，单独存）
 *
 * 大事记（log）单独剪枝：一局有 30+ 条，全存会把 localStorage 撑爆，
 * 只留"选了东西的"和"调子重的"，各取前 14 条。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.DoomArchive = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const KEY = 'doom_sim_archive_v1'
  const SEEN_KEY = 'doom_sim_seen_endings_v1'
  const SEEN_MAX = 1300
  const MAX = 30
  const VERSION = 1
  const LOG_MAX = 14

  function hasLS() {
    try { return typeof localStorage !== 'undefined' && !!localStorage } catch (e) { return false }
  }

  function readRaw() {
    try {
      if (!hasLS()) return []
      const list = JSON.parse(localStorage.getItem(KEY) || '[]')
      return Array.isArray(list) ? list.filter(r => r && r.id && r.title) : []
    } catch (e) {
      return []
    }
  }

  function writeRaw(list) {
    try {
      if (!hasLS()) return false
      localStorage.setItem(KEY, JSON.stringify(list))
      return true
    } catch (e) {
      return false
    }
  }

  function uid() {
    return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  }

  function cut(str, n) {
    str = String(str == null ? '' : str)
    return str.length > n ? str.slice(0, n) + '…' : str
  }

  function stamp(ts) {
    const d = new Date(ts)
    const p = n => (n < 10 ? '0' + n : '' + n)
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
  }

  /* ------------------------- 造档 ------------------------- */

  /**
   * @param {object} s       引擎 state
   * @param {object} result  settle() 的返回值
   * @param {object} extra   { tags }
   */
  function make(s, result, extra) {
    extra = extra || {}
    const sc = result.sc || s.sc || {}
    const log = (s.log || []).filter(l => l && l.kind !== 'stage')

    // 选过的优先；同一档内按"离现在近"排
    const chosen = log.filter(l => l.choice)
    const events = log.filter(l => !l.choice && l.tone !== 'neutral')
    const picked = chosen.slice(0, LOG_MAX)
    events.slice(0, Math.max(0, LOG_MAX - picked.length)).forEach(e => picked.push(e))
    picked.sort((a, b) => (a.day || 0) - (b.day || 0))

    return {
      v: VERSION,
      id: extra.id || uid(),
      ts: Date.now(),
      gender: s.gender === 'f' ? 'f' : 'm',
      origin: (s.origin && s.origin.tag) || '',
      talents: (s.talents || []).map(t => t.name),
      day: sc.days || s.day || 0,
      survive: !!sc.survive,
      death: sc.death || '',
      sc: {
        health: sc.health || 0, morale: sc.morale || 0,
        supply: sc.supply || 0, camp: sc.camp || 0,
        total: sc.total || 0, people: sc.people || 1, days: sc.days || 0
      },
      tags: (extra.tags || []).slice(0, 6),
      title: result.ending.title,
      subtitle: result.ending.subtitle,
      desc: result.ending.desc,
      base: result.ending._base || '',
      plight: result.ending._plight || '',
      review: (result.review || []).slice(0, 7),
      advice: (result.advice || []).map(a => ({ title: a.title, text: a.text })),
      log: picked.map(l => ({
        day: l.day,
        title: cut(l.title, 26),
        choice: cut(l.choice || '', 34),
        tone: l.tone || 'neutral'
      }))
    }
  }

  /* ------------------------- 增删查 ------------------------- */

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
      if (!hasLS()) return []
      const list = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')
      return Array.isArray(list) ? list.filter(x => typeof x === 'string') : []
    } catch (e) {
      return []
    }
  }

  function writeSeen(list) {
    try {
      if (!hasLS()) return false
      localStorage.setItem(SEEN_KEY, JSON.stringify(list))
      return true
    } catch (e) {
      return false
    }
  }

  function seenPairs() {
    return readSeen()
  }

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

  function brief(rec) {
    return {
      id: rec.id,
      stamp: stamp(rec.ts),
      title: rec.title,
      total: rec.sc ? rec.sc.total : 0,
      days: rec.sc ? rec.sc.days : 0,
      survive: rec.survive,
      death: rec.death,
      origin: rec.origin,
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
