'use strict';
/* ==========================================================
   配置和统计存储
   保留原版的深合并语义：默认值兜底，文件值优先
   ========================================================== */



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
const localDateKey = (d) => [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');

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

  async load() {
    if (!window.tiana?.auth?.getAccessToken || !window.tiana?.connection) throw Error('应用数据服务未就绪');
    this.connection = await window.tiana.connection();
    if (this.connection.sql_api !== 'hrana-v3') throw Error('数据库协议不兼容');
    this.request = createTianaFetch({origin:this.connection.origin, auth:window.tiana.auth, requestBodyMode:'buffered'});
    await this.sql('INSERT OR IGNORE INTO reminder_state (id, data, revision) VALUES (1, ?, 0)', [JSON.stringify(DEFAULTS)]);
    const result = await this.sql('SELECT data, revision FROM reminder_state WHERE id=1');
    if (!result.rows?.length) throw Error('无法读取设置');
    this.data = deepMerge(clone(DEFAULTS), JSON.parse(result.rows[0][0].value));
    this.revision = Number(result.rows[0][1].value);
    this.queue = Promise.resolve();
    return this.data;
  },
  async sql(query, args=[]) {
    const response = await this.request(this.connection.origin + '/v3/pipeline', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:query,args:args.map(value=>({type:'text',value:String(value)})),want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw Error('数据库请求失败');
    const result = (await response.json()).results?.[0];
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作失败');
    return result.response.result;
  },
  save() {
    const payload = JSON.stringify(this.data);
    this.queue = this.queue.then(async () => {
      if (this.failed) return;
      const expected = this.revision;
      try {
        const result = await this.sql('UPDATE reminder_state SET data=?, revision=revision+1 WHERE id=1 AND revision=? RETURNING revision', [payload, expected]);
        if (!result.rows?.length) throw Error('数据已在其他页面更新');
        this.revision = Number(result.rows[0][0].value);
      } catch (error) {
        this.failed = true;
        window.__toast?.('保存未确认或数据已在其他页面更新，请导出备份并重新打开核对');
        console.error('保存未确认', error);
      }
    });
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
    const today = localDateKey(new Date());
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
