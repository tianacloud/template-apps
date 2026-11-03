(function (root) {
  'use strict';
  const COMFORTS = [
    '今天有没处理好的事，也可以先休息。',
    '不必把所有问题，都解决在今天。',
    '今天辛苦的是你，今晚也照顾一下自己。',
    '下班了，你也有自己的生活。',
    '把学校的事，留在学校吧。',
    '明天的事，留给明天有力气的你。',
    '你可以在乎学生，也可以先照顾自己。'
  ];
  const WOOD_WORDS = ['先把这口气，轻轻放下', '备课暂停，自己优先', '不急，明天再说', '莫生气，慢慢来', '班级群，先静音一会儿', '这一声，送走一点烦恼'];
  const END_LINES = ['今天的课，已经上完了。', '没做完的事，可以留给明天。', '现在，你下班了。'];
  function shanghaiTime(date = new Date()) {
    // 上海全年 UTC+8，不受设备本地时区影响。
    const shifted = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    return { day: shifted.toISOString().slice(0, 10), hour: shifted.getUTCHours() };
  }
  function breathingAt(ms) {
    const elapsed = Math.max(0, ms);
    if (elapsed >= 50000) return { done: true, round: 5, phase: 'done', remaining: 0, scale: 1 };
    const inRound = elapsed % 10000;
    const inhale = inRound < 4000;
    return {
      done: false, round: Math.floor(elapsed / 10000) + 1,
      phase: inhale ? 'inhale' : 'exhale',
      remaining: Math.ceil((inhale ? 4000 - inRound : 10000 - inRound) / 1000),
      scale: inhale ? 1 + 0.32 * inRound / 4000 : 1.32 - 0.32 * (inRound - 4000) / 6000
    };
  }
  function createJournal(storage, onError = () => {}) {
    const prefix = 'teacher-rest:v1:';
    const memory = new Map();
    const pending = new Set();
    let failed = false;
    function warn() { if (!failed) { failed = true; onError(); } }
    function read(key) {
      if (pending.has(key)) return memory.get(key);
      try {
        const value = storage.getItem(prefix + key);
        if (value !== null) return JSON.parse(value);
      } catch (_) { warn(); }
      return memory.get(key) ?? null;
    }
    function write(key, value) {
      memory.set(key, value);
      try { storage.setItem(prefix + key, JSON.stringify(value)); pending.delete(key); }
      catch (_) { pending.add(key); warn(); }
    }
    function validRecord(record, day) {
      return record && record.day === day && Number.isInteger(record.quote) && record.quote >= 0 && record.quote < COMFORTS.length && typeof record.late === 'boolean';
    }
    function getDay(day) { const record = read('day:' + day); return validRecord(record, day) ? record : null; }
    function total() {
      const keys = new Set(memory.keys());
      try {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(prefix)) keys.add(key.slice(prefix.length));
        }
      } catch (_) { warn(); }
      let count = 0;
      for (const key of keys) if (/^day:\d{4}-\d{2}-\d{2}$/.test(key) && getDay(key.slice(4))) count++;
      return count;
    }
    function complete(date = new Date(), random = Math.random) {
      const { day, hour } = shanghaiTime(date);
      let record = getDay(day);
      const created = !record;
      if (!record) {
        record = { day, late: hour >= 22, quote: Math.min(COMFORTS.length - 1, Math.max(0, Math.floor(random() * COMFORTS.length))) };
        // 每天独立存储，同一天多个标签页也只有一个记录键。
        write('day:' + day, record);
      }
      return { record, created, total: total() };
    }
    function woodCount(day) { const value = read('wood:' + day); return Number.isSafeInteger(value) && value >= 0 ? value : 0; }
    function knock(day) { const count = woodCount(day) + 1; write('wood:' + day, count); return count; }
    return { getDay, total, complete, woodCount, knock, read, write };
  }
  const api = { COMFORTS, WOOD_WORDS, END_LINES, shanghaiTime, breathingAt, createJournal };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RestCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
