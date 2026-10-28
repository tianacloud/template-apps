/* =========================================================================
 * 学习档案数据模块（localStorage）—— P0 建模块，UI 随 P1 完善
 * 仅存本机，不上传、不联网；所有写操作 try/catch 静默失败。
 * key: 'escalator-sim.profile.v1'（schema 版本化）
 * 提供：Profile.get() / save(p) / recordQuiz(scope,qIdx,ok)
 *       recordSimVisit(simKey) / recordSimAction(simKey) / clear()
 * ========================================================================= */
const Profile = (function () {
  const KEY = 'escalator-sim.profile.v1';
  const THROTTLE = 5000;                 // 仿真时长累计节流：每 5 秒最多写一次
  let data = load();
  let act = null;                        // 当前活动仿真 { key, last }
  let timer = null;
  let exam = { done: 0, right: 0 };      // 本次综合测验练习快照（内存累计）
  let examIdx = -1;                      // 当前快照在 attempts 中的下标

  function nowISO() { return new Date().toISOString(); }
  function blank() {
    return {
      schema: 1,
      student: { name: '', clazz: '' },
      updatedAt: null,
      quiz: { exam: { attempts: [], best: null, wrong: [] }, bySystem: {} },
      sims: {},
      settings: { present: false }
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      const p = JSON.parse(raw) || {};
      const b = blank();
      // 合并默认字段，兼容旧数据缺字段
      b.student = Object.assign(b.student, p.student || {});
      b.updatedAt = p.updatedAt || null;
      b.quiz.exam = Object.assign(b.quiz.exam, (p.quiz && p.quiz.exam) || {});
      b.quiz.exam.attempts = Array.isArray(b.quiz.exam.attempts) ? b.quiz.exam.attempts : [];
      b.quiz.exam.wrong = Array.isArray(b.quiz.exam.wrong) ? b.quiz.exam.wrong : [];
      b.quiz.bySystem = (p.quiz && p.quiz.bySystem) || {};
      b.sims = p.sims || {};
      b.settings = Object.assign(b.settings, p.settings || {});
      return b;
    } catch (e) { return blank(); }
  }
  function persist() {
    try { data.updatedAt = nowISO(); localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (e) { /* 静默：隐私模式 / QuotaExceeded */ }
  }
  function simRec(key) {
    if (!data.sims[key]) data.sims[key] = { visits: 0, totalSec: 0, actions: 0, lastAt: null };
    return data.sims[key];
  }
  function ensureTimer() {
    if (timer) return;
    timer = setInterval(flushActive, THROTTLE);
  }
  /* 累计当前活动仿真的时长（节流写入） */
  function flushActive() {
    if (!act) return;
    const now = Date.now();
    const rec = simRec(act.key);
    rec.totalSec += (now - act.last) / 1000;
    act.last = now;
    persist();
  }

  return {
    get() { return data; },
    save(p) { if (p) data = Object.assign(blank(), p); persist(); },
    clear() {
      try { localStorage.removeItem(KEY); } catch (e) { }
      data = blank(); act = null; exam = { done: 0, right: 0 }; examIdx = -1;
    },
    /* 测验判分后调用。scope='exam' 为综合测验，其余为系统 id（专项练习） */
    recordQuiz(scope, qIdx, ok) {
      try {
        if (scope === 'exam') {
          const ex = data.quiz.exam;
          const wi = ex.wrong.findIndex(w => w.q === qIdx);
          if (!ok) {
            if (wi >= 0) { ex.wrong[wi].n++; ex.wrong[wi].last = nowISO(); }
            else ex.wrong.push({ q: qIdx, n: 1, last: nowISO() });
          } else if (wi >= 0) { ex.wrong.splice(wi, 1); }
          exam.done++; if (ok) exam.right++;
          const rate = exam.done ? Math.round(exam.right / exam.done * 100) : 0;
          const snap = { at: nowISO(), done: exam.done, right: exam.right, rate };
          if (examIdx >= 0 && examIdx < ex.attempts.length) ex.attempts[examIdx] = snap;
          else { ex.attempts.push(snap); if (ex.attempts.length > 50) ex.attempts.shift(); examIdx = ex.attempts.length - 1; }
          if (!ex.best || exam.right > ex.best.right) ex.best = { right: exam.right, rate, at: snap.at };
        } else {
          const bs = data.quiz.bySystem[scope] || (data.quiz.bySystem[scope] = { done: 0, right: 0 });
          bs.done++; if (ok) bs.right++;
        }
        persist();
      } catch (e) { }
    },
    /* 打开某仿真时调用；key 为空表示当前仿真结束（冲刷时长，不计访问） */
    recordSimVisit(key) {
      try {
        flushActive();
        if (!key) { act = null; return; }
        const rec = simRec(key);
        rec.visits++; rec.lastAt = nowISO();
        act = { key, last: Date.now() };
        ensureTimer();
        persist();
      } catch (e) { }
    },
    /* 控件交互（onchange/onaction）时调用一次 */
    recordSimAction(key) {
      try {
        simRec(key).actions++;
        if (!act || act.key !== key) persist();   // 非活动仿真立即写；活动仿真由节流冲刷
      } catch (e) { }
    },
    /* 立即冲刷当前活动仿真时长（页面隐藏 / 仿真切换时调用） */
    flushActive() { flushActive(); }
  };
})();
/* 页面隐藏时立即冲刷时长，避免丢失 */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && typeof Profile !== 'undefined' && Profile.flushActive) Profile.flushActive();
});
