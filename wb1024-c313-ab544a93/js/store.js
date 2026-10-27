'use strict';
/* ==========================================================
   配置存储 —— 网页版用 localStorage 替代 Electron 的 settings.json
   保留原版的深合并语义：默认值兜底，文件值优先
   ========================================================== */

const STORE_KEY = 'baobei-qishen.v1';

const DEFAULTS = {
  version: 1,
  // 提醒项：每种都有独立开关、间隔、音效
  water:    { enabled: true,  intervalMin: 45, targetCups: 8, cupSize: 250, sound: 'ripple' },
  eye:      { enabled: true,  intervalMin: 20, sound: 'breeze' },
  sit:      { enabled: true,  intervalMin: 50, idleGuard: true, sound: 'wood' },
  stand:    { enabled: false, intervalMin: 90, sound: 'bell' },
  pomodoro: { enabled: false, focusMin: 25, shortMin: 5, longMin: 15, rounds: 4, sound: 'bell' },
  // 音效总控
  audio:    { volume: 0.7, muted: false, fade: true, fadeSec: 5 },
  // 全局
  general: {
    badgeBreath: true,
    notify: false,
    workHoursOnly: false,
    workStart: '09:00',
    workEnd: '18:00'
  },
  // 今日统计（滚动更新，不清空历史）
  stats: {
    date: '',
    waterCups: 0,
    focusMin: 0,
    remindTotal: 0,
    remindDone: 0,
    logs: [],     // [{ts, kind, action}] 今日提醒流水
    history: []   // [{date, waterCups, focusMin, remindTotal, remindDone}]
  },
  lastWaterAt: 0,
  lastEyeAt: 0,
  lastSitAt: 0,
  lastStandAt: 0
};

const clone = (v) => JSON.parse(JSON.stringify(v));

/**
 * 深合并：patch 里的值覆盖 base（文件值优先，默认值补缺）
 */
function deepMerge(base, patch) {
  if (!patch || typeof patch !== 'object') return base;
  const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
  for (const k of Object.keys(patch)) {
    const pv = patch[k];
    if (pv && typeof pv === 'object' && !Array.isArray(pv) &&
        base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
      out[k] = deepMerge(base[k], pv);
    } else if (pv !== undefined) {
      out[k] = pv;
    }
  }
  return out;
}

const store = {
  data: clone(DEFAULTS),
  _failWarned: false,

  load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        // DEFAULTS 作底、存档作 patch：存档里的用户设置覆盖默认值
        this.data = deepMerge(clone(DEFAULTS), JSON.parse(raw));
      } else {
        this.data = clone(DEFAULTS);
      }
    } catch (e) {
      console.warn('[store] 读取失败，回退默认值:', e.message);
      this.data = clone(DEFAULTS);
    }
    return this.data;
  },

  save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.data));
    } catch (e) {
      if (!this._failWarned) {
        this._failWarned = true;
        console.warn('[store] 写入失败:', e.message);
        if (window.__toast) window.__toast('本地存储写入失败，设置可能不会被记住');
      }
    }
  },

  get(key) { return this.data[key]; },

  patch(key, value) {
    this.data[key] = deepMerge(this.data[key], value);
    this.save();
    return this.data[key];
  },

  /** 整体替换（导入备份用） */
  replace(patch) {
    this.data = deepMerge(clone(DEFAULTS), patch || {});
    this.save();
    return this.data;
  },

  /** 跨天检测：把昨天的记录归档，重置今日计数 */
  rollDay() {
    const today = new Date().toISOString().slice(0, 10);
    const s = this.data.stats;
    if (s.date === today) return false;

    if (s.date && (s.waterCups || s.focusMin || s.remindTotal)) {
      s.history.push({
        date: s.date,
        waterCups: s.waterCups,
        focusMin: s.focusMin,
        remindTotal: s.remindTotal,
        remindDone: s.remindDone
      });
      if (s.history.length > 120) s.history.shift();
    }
    s.date = today;
    s.waterCups = 0;
    s.focusMin = 0;
    s.remindTotal = 0;
    s.remindDone = 0;
    s.logs = [];
    this.save();
    return true;
  }
};
