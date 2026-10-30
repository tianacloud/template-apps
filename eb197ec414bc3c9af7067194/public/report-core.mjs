/* report-core.mjs —— 姿势报告聚合（与 Flutter lib/services/report_service.dart 同口径）
 * 小时桶 → 日报 / 曲线 / 连续达标 / 洞察。纯逻辑，存储注入，可在 node 单测。 */
export const GOOD_SCORE = 80, BAD_SCORE = 70, LONG_SIT_MIN = 45, MIN_VALID_MIN = 10, STREAK_RATIO = 0.6, KEEP_DAYS = 30;
// 报告良好时长按 >=70 分计算；80 分仅为高分参考线（沿用移动端实际统计口径）。

export const hourKey = t => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).getTime(); };
const dayStart = t => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
// 按日历回退 n 天（跨夏令时也落在自然日）
const daysAgo = (t, n) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate() - n, 12).getTime(); };
const newBucket = t => ({ t, s: 0, f: 0, se: 0, b: 0, br: 0, co: 0, wb: false, ic: {} });

export class MemoryStore { constructor(){ this.data = null; } read(){ return this.data; } write(d){ this.data = d; } }
export class LocalStore {
  constructor(key = "sguard.report.v1"){ this.key = key; }
  read(){ try{ return window.postureStore.getItem(this.key); }catch(e){ return null; } }
  write(d){ window.postureStore.setItem(this.key, d); }   // 抛错交给 flush() 设置 storageError
}

export class ReportService {
  constructor(store){ this.store = store; this.b = new Map(); this.dirty = false; this.wasBad = false; this.storageError = null; this.load(); }

  bucket(now){
    const k = hourKey(now);
    let b = this.b.get(k); if (!b){ b = newBucket(k); this.b.set(k, b); }
    return b;
  }
  // 离位 / 停止后断开纠正链，避免「坐差→离开→回来坐好」被算作主动纠正
  resetSession(){ this.wasBad = false; }
  recordBreak(now){ if (!Number.isFinite(+now)) return false; this.bucket(now).br++; this.dirty = true; this.prune(now); return true; }

  recordSample({ now, score, issueKeys = [], present, dtMs = 0, breakTriggered = false }){
    if (!Number.isFinite(+now) || !Number.isFinite(score) || score < 0 || score > 100 ||
        !Number.isFinite(dtMs) || dtMs < 0 || !Array.isArray(issueKeys)) return false;
    const b = this.bucket(now);
    this.dirty = true;
    if (breakTriggered) b.br++;
    if (!present){ this.wasBad = false; return; }
    const dt = Math.min(Math.max(dtMs, 0), 2000);   // 单帧最多 2s，防卡顿虚增
    b.f++; b.s += score; b.se += dt;
    const bad = score < BAD_SCORE;
    if (bad) b.b += dt;
    if (this.wasBad && !bad) b.co++;               // 不良→良好 = 一次主动纠正（跨小时连续）
    this.wasBad = bad;
    for (const key of issueKeys) b.ic[key] = (b.ic[key] || 0) + 1;
    this.prune(now);
  }

  prune(now){
    const cut = hourKey(now) - KEEP_DAYS * 24 * 3600000;
    for (const k of this.b.keys()) if (k < cut) this.b.delete(k);
  }

  dayReport(day){
    const d0 = dayStart(day), d1 = dayStart(daysAgo(day, -1));
    let s = 0, f = 0, se = 0, bad = 0, br = 0, co = 0, worst = null, best = null;
    const ic = {};
    for (const [k, b] of this.b){
      if (k < d0 || k >= d1) continue;
      s += b.s; f += b.f; se += b.se; bad += b.b; br += b.br; co += b.co;
      for (const key in b.ic) ic[key] = (ic[key] || 0) + b.ic[key];
      if (b.f > 0){
        const p = { t: k, score: b.s / b.f, hour: new Date(k).getHours() };
        if (!worst || p.score < worst.score) worst = p;
        if (!best || p.score > best.score) best = p;
      }
    }
    const topIssues = Object.entries(ic).map(([k, c]) => ({ k, count: c, ratio: f ? c / f : 0 }))
      .sort((a, b) => b.count - a.count || (a.k < b.k ? -1 : 1));
    return { date: d0, avgScore: f ? s / f : 0, frames: f, seatedMs: se, badMs: bad, goodMs: Math.max(0, se - bad),
             breaks: br, corrections: co, topIssues, worstHour: worst, bestHour: best,
             get minutes(){ return se / 60000; }, get goodRatio(){ return se > 0 ? (se - bad) / se : 0; }, get hasData(){ return f > 0; } };
  }

  todayCurve(now){
    const d = new Date(now), out = [];
    for (let h = 0; h < 24; h++){
      const t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h).getTime(), b = this.b.get(t);
      out.push({ t, hour: h, score: b && b.f ? b.s / b.f : null, badRatio: b && b.se > 0 ? b.b / b.se : 0, seatedMs: b ? b.se : 0 });
    }
    return out;
  }

  dailyCurve(now, days = 14){
    const out = [];
    for (let i = days - 1; i >= 0; i--){
      const r = this.dayReport(daysAgo(now, i));
      out.push({ t: r.date, score: r.hasData ? r.avgScore : null, badRatio: r.seatedMs > 0 ? r.badMs / r.seatedMs : 0, goodMs: r.goodMs });
    }
    return out;
  }

  qualified(r){ return r.hasData && r.goodMs / 60000 >= MIN_VALID_MIN && r.goodRatio >= STREAK_RATIO; }

  /* 今天达标→从今天数；今天样本够但未达标→0；今天样本不足→从昨天数；空白日中断 */
  streak(now){
    const today = this.dayReport(now), todayOk = this.qualified(today);
    let best = 0, run = 0;
    for (let i = KEEP_DAYS - 1; i >= 0; i--){
      if (this.qualified(i ? this.dayReport(daysAgo(now, i)) : today)){ run++; best = Math.max(best, run); } else run = 0;
    }
    let current = 0;
    if (todayOk || today.minutes < MIN_VALID_MIN){
      current = todayOk ? 1 : 0;
      for (let i = 1; i < KEEP_DAYS && this.qualified(this.dayReport(daysAgo(now, i))); i++) current++;
    }
    return { current, best, todayQualified: todayOk };
  }

  /* 当天按小时近似：在位 ≥45 分且无休息的连续小时段数 */
  longSitCount(now){
    let n = 0, run = 0;
    for (const p of this.todayCurve(now)){
      const b = this.b.get(p.t);
      if (b && b.se >= LONG_SIT_MIN * 60000 && b.br === 0) run++;
      else { if (run) n++; run = 0; }
    }
    return n + (run ? 1 : 0);
  }

  insights(now, max = 4){
    const today = this.dayReport(now);
    if (!today.hasData || today.minutes < MIN_VALID_MIN) return [{ kind: "notEnoughData", v: today.minutes }];
    const out = [{ kind: "goodMinutes", v: today.goodMs / 60000 }, { kind: "corrections", v: today.corrections }];
    const y = this.dayReport(daysAgo(now, 1)), diff = today.avgScore - y.avgScore;
    if (y.hasData && diff >= 1) out.push({ kind: "improved", v: diff });
    else if (y.hasData && diff <= -1) out.push({ kind: "declined", v: -diff });
    if (today.topIssues.length) out.push({ kind: "topIssue", v: today.topIssues[0].ratio * 100, s: today.topIssues[0].k });
    if (today.worstHour && today.worstHour.score < GOOD_SCORE) out.push({ kind: "worstSlot", v: today.worstHour.score, s: today.worstHour.hour });
    const longs = this.longSitCount(now);
    if (longs) out.push({ kind: "longSit", v: longs });
    const st = this.streak(now);
    if (st.current > 0 && [3, 7, 14, 21, 30, 50, 100].includes(st.current)) out.push({ kind: "milestone", v: st.current });
    return out.slice(0, max);
  }

  load(){
    const raw = this.store && this.store.read();
    if (!raw) return;
    try{
      for (const b of JSON.parse(raw).hours || []){
        if (Number.isFinite(b && b.t)) this.b.set(b.t, Object.assign(newBucket(b.t), b, { ic: { ...(b.ic || {}) } }));
      }
    }
    catch(e){ this.b.clear(); this.storageError = "报告数据损坏，已从空白开始"; }   // 不阻塞应用
  }
  flush(){
    if (!this.store || !this.dirty) return true;
    try{
      this.store.write(JSON.stringify({ v: 1, hours: [...this.b.values()].map(({ wb, ...b }) => b) }));
      this.dirty = false; this.storageError = null; return true;
    }catch(e){ this.storageError = "报告保存失败（云端存储不可用）"; return false; }
  }
  clear(){ this.b.clear(); this.dirty = true; this.flush(); }
}
