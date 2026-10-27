
(function () {
'use strict';

var DB_ID = '';
var app = document.getElementById('app');
var state = null;
var realState = null;
var ui = { mode: 'kid', parentTab: 'todo', authed: false, pinBuf: '', view: 'app', demo: false, confirmDel: '' };
var sync = { status: 'off', text: '本地模式', rids: {}, busy: false };

/* ============ 图标（内联 SVG，不使用 emoji） ============ */
var P = {
  star:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  check:'M20 6L9 17l-5-5', clock:'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
  gift:'M4 10h16v10H4zM2 6h20v4H2zM12 6v14M12 6C11 4 8 3 8 5s3 1 4 1zM12 6c1-2 4-3 4-1s-3 1-4 1z',
  coin:'M12 21a9 9 0 100-18 9 9 0 000 18zM12 8v8M9.5 10.5h5M9.5 13.5h5',
  lock:'M6 11h12v10H6zM9 11V7a3 3 0 016 0v4',
  plus:'M12 5v14M5 12h14', minus:'M5 12h14',
  trash:'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14',
  down:'M12 3v12M7 11l5 5 5-5M4 21h16', up:'M12 21V9M7 13l5-5 5 5M4 3h16',
  cog:'M4 7h8M16 7h4M4 17h4M12 17h8', note:'M6 3h9l5 5v13H6zM15 3v5h5',
  cal:'M4 6h16v15H4zM4 10h16M9 3v4M15 3v4',
  user:'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  users:'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2 21c0-3.5 3-5.5 7-5.5S16 17.5 16 21M16 4.5a3.5 3.5 0 010 7M17.5 15.5c2.5.7 4.5 2.4 4.5 5.5',
  alert:'M12 3l9 16H3zM12 9v4M12 17h.01',
  flame:'M12 3s4 4 4 8a4 4 0 11-8 0c0-2 1-3 1-3s1 1 1 2c0-3 2-5 2-7z',
  chart:'M4 20V10M10 20V4M16 20v-7M2 20h20',
  x:'M6 6l12 12M18 6L6 18', refresh:'M20 12a8 8 0 11-3-6.2M20 4v5h-5',
  sprout:'M12 21v-7M12 14c-4 0-6-2-6-5 3 0 6 1 6 5zM12 14c4 0 6-2 6-5-3 0-6 1-6 5z',
  pen:'M4 20h4L18 10l-4-4L4 16zM14 6l4 4', inbox:'M4 13h4l1 3h6l1-3h4M4 13l2-8h12l2 8v7H4z',
  cloud:'M7 18h10a4 4 0 000-8 6 6 0 00-11.6 2A3.5 3.5 0 007 18z'
};
function ic(n, cls) {
  var d = P[n]; if (!d) return '';
  return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';
}

/* ============ 工具 ============ */
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function fmt(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function today() { return fmt(new Date()); }
function weekOf(d) { var t = new Date(d.getTime()); t.setDate(t.getDate() - ((t.getDay() + 6) % 7)); return fmt(t); }
function thisWeek() { return weekOf(new Date()); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function num(v, d) { var n = parseFloat(v); return isNaN(n) ? d : n; }
function demoTag(x) { return x && x.demo ? '<span class="tag demo">示例</span>' : ''; }
function toast(msg) {
  var t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function () { t.className = 'toast show'; }, 20);
  setTimeout(function () { t.className = 'toast'; setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300); }, 2400);
}
function arm(el, label) {
  if (el.dataset && el.dataset.armed === '1') { clearTimeout(el._armT); return true; }
  el.dataset = el.dataset || {};
  el.dataset.armed = '1';
  el._old = el.innerHTML;
  el._oldCls = el.className;
  el.textContent = label;
  el.className = 'btn red sm';
  el._armT = setTimeout(function () { el.dataset.armed = ''; if (el._old) { el.innerHTML = el._old; el.className = el._oldCls; } }, 3000);
  toast('再点一次确认');
  return false;
}
function dayDiff(a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000); }

/* ============ 数据层 ============ */
function defaults() {
  return {
    version: 3,
    config: {
      childName: '儿童', parentPin: '0000', dailyGoal: 7, confirmRequired: true, startBonus: 0, ruleVer: 2,
      streakBonus: { days: 3, points: 2 },
      fade: { stage: 1, earnRate: 1, redeemRate: 1 },
      tasks: [
        { id: 't1', name: '主动完成作业', type: 'daily', points: 2, bonus: 3, active: true },
        { id: 't2', name: '桌面整洁', type: 'daily', points: 2, bonus: 1, active: true },
        { id: 't3', name: '洗漱 · 按时睡', type: 'daily', points: 2, bonus: 1, active: true },
        { id: 't4', name: '房间整理', type: 'weekly', points: 5, bonus: 2, active: true }
      ],
      rewards: [
        { id: 'r1', name: '小礼物 A', cost: 15, level: '木头', active: true },
        { id: 'r2', name: '小礼物 B', cost: 60, level: '石头', active: true },
        { id: 'r3', name: '小礼物 C', cost: 150, level: '铁', active: true }
      ]
    },
    checkins: [], redemptions: [], ledger: [], notes: [],
    meta: { created: today(), updatedAt: Date.now(), tipDismissed: false, hasDemo: false, onboarded: true }
  };
}
function demoData(s) {
  var y = new Date(); y.setDate(y.getDate() - 1);
  var y2 = new Date(); y2.setDate(y2.getDate() - 2);
  var d1 = fmt(y), d2 = fmt(y2);
  s.checkins.push({ id: uid(), taskId: 't1', date: d2, slot: d2, status: 'approved', points: 2, ts: Date.now(), demo: true });
  s.checkins.push({ id: uid(), taskId: 't3', date: d2, slot: d2, status: 'approved', points: 2, ts: Date.now(), demo: true });
  s.checkins.push({ id: uid(), taskId: 't2', date: d1, slot: d1, status: 'pending', points: 3, ts: Date.now(), demo: true });
  s.ledger.push({ id: uid(), date: d2, delta: 2, reason: '桌面整洁', ts: Date.now(), demo: true });
  s.ledger.push({ id: uid(), date: d2, delta: 2, reason: '洗漱 · 按时睡', ts: Date.now(), demo: true });
  s.meta.hasDemo = true;
  return s;
}
/* ============ 档案（存档）层 ============ */
var OLDKEY = 'wb_demo_workbench_v2', LEGACYKEY = 'wb_demo_legacy_v2', PKEY = 'wb_demo_profiles_v1';
var profiles = { activeId: '', list: [] };
function stateKey(id) { return 'wb_demo_state_' + id; }
function newProfileId() { return 'p' + Date.now().toString(36); }
function loadProfiles() {
  try {
    var raw = localStorage.getItem(PKEY);
    if (!raw) return;
    var p = JSON.parse(raw);
    if (p && Array.isArray(p.list)) profiles = { activeId: p.activeId || '', list: p.list };
  } catch (e) { }
}
function saveProfiles() { try { localStorage.setItem(PKEY, JSON.stringify(profiles)); } catch (e) { } }
var RULE2_TASKS = { t1: { points: 2, bonus: 3 }, t2: { points: 2, bonus: 1 }, t3: { points: 2, bonus: 1 }, t4: { points: 5, bonus: 2 } };
function normalize(s) {
  var d = defaults();
  if (!s) return d;
  // 先记下"存档里原本写的规则版本"，再合并默认值——否则默认值里的 ruleVer 会顶掉它，迁移就永远不触发
  var prevRule = num(s.config && s.config.ruleVer, 1);
  s.config = Object.assign({}, d.config, s.config || {});
  s.config.fade = Object.assign({}, d.config.fade, s.config.fade || {});
  s.config.streakBonus = Object.assign({}, d.config.streakBonus, s.config.streakBonus || {});
  s.meta = Object.assign({}, d.meta, s.meta || {});
  ['checkins', 'redemptions', 'ledger', 'notes'].forEach(function (k) { if (!Array.isArray(s[k])) s[k] = []; });
  if (!Array.isArray(s.config.tasks)) s.config.tasks = d.config.tasks;
  if (!Array.isArray(s.config.rewards)) s.config.rewards = d.config.rewards;
  // 补字段：任务加「主动加成」，奖励加「档位」
  s.config.tasks.forEach(function (t) {
    if (t.bonus === undefined || t.bonus === null) {
      var ref = null;
      d.config.tasks.forEach(function (x) { if (x.id === t.id) ref = x; });
      t.bonus = ref ? num(ref.bonus, 0) : 0;
    }
    t.points = Math.max(1, num(t.points, 1));
  });
  // 档位命名迁移：小额/中额/大额/大愿望 → 木头/石头/铁/钻石（「我的世界」式）
  // 这套名字只用来区分奖励的级别，不是给孩子的等级体系
  var LV_OLD = { '小额': '木头', '中额': '石头', '大额': '铁', '大愿望': '钻石' };
  var LV_NEW = ['木头', '石头', '铁', '钻石'];
  s.config.rewards.forEach(function (r) {
    if (LV_OLD[r.level]) r.level = LV_OLD[r.level];
    if (LV_NEW.indexOf(r.level) < 0) r.level = '石头';
  });
  // 一次性规则迁移：分值拆成「完成分 + 主动加成」（只改已知 4 个任务，不动历史流水）
  if (prevRule < 2) {
    s.config.tasks.forEach(function (t) { var n = RULE2_TASKS[t.id]; if (n) { t.points = n.points; t.bonus = n.bonus; } });
    if (num(s.config.dailyGoal, 0) === 8) s.config.dailyGoal = 7;
    s.config.ruleVer = 2;
  }
  return s;
}
function convertLegacy(os) {
  var s0 = defaults();
  if (os && os.config) {
    if (Array.isArray(os.config.tasks)) s0.config.tasks = os.config.tasks.map(function (t) { return { id: t.id, name: t.name, type: t.type, points: t.points, active: t.active !== false }; });
    if (Array.isArray(os.config.rewards)) s0.config.rewards = os.config.rewards.map(function (r) { return { id: r.id, name: r.name, cost: r.cost, active: r.active !== false }; });
    ['childName', 'parentPin', 'dailyGoal', 'confirmRequired', 'startBonus'].forEach(function (k) { if (os.config[k] !== undefined) s0.config[k] = os.config[k]; });
    if (os.config.fade) s0.config.fade = Object.assign({}, s0.config.fade, os.config.fade);
    if (os.config.streakBonus) s0.config.streakBonus = Object.assign({}, s0.config.streakBonus, os.config.streakBonus);
  }
  ['checkins', 'redemptions', 'ledger', 'notes'].forEach(function (k) { if (Array.isArray(os[k])) s0[k] = os[k]; });
  if (os && os.meta) s0.meta = Object.assign({}, s0.meta, os.meta);
  return s0;
}
function readState(id) {
  try { var raw = localStorage.getItem(stateKey(id)); return raw ? normalize(JSON.parse(raw)) : null; }
  catch (e) { return null; }
}
function migrateLegacy() { return false; /* 提报演示版：不迁移任何真实数据 */ }
function loadLocal() {
  try {
    loadProfiles();
    if (!profiles.activeId && !profiles.list.length) migrateLegacy();
    if (!profiles.activeId) return null;
    return readState(profiles.activeId);
  } catch (e) { return null; }
}
var storageOK = true;
function checkStorage() {
  try {
    localStorage.setItem('__wb_store_test', '1');
    var ok = localStorage.getItem('__wb_store_test') === '1';
    localStorage.removeItem('__wb_store_test');
    storageOK = !!ok;
  } catch (e2) { storageOK = false; }
}
function saveLocal() {
  if (ui.demo) return;
  if (!profiles.activeId) return;
  state.meta.updatedAt = Date.now();
  try { localStorage.setItem(stateKey(profiles.activeId), JSON.stringify(state)); }
  catch (e) { toast('本地保存失败：浏览器存储可能已满。'); }
  var hit = null;
  profiles.list.forEach(function (p) { if (p.id === profiles.activeId) hit = p; });
  if (hit) { hit.name = state.config.childName || hit.name; hit.updatedAt = state.meta.updatedAt; }
  saveProfiles();
}
function currentPin() {
  if (state && state.config && state.config.parentPin) return state.config.parentPin;
  if (profiles.activeId) { var s = readState(profiles.activeId); if (s && s.config && s.config.parentPin) return s.config.parentPin; }
  return '0000';
}
function fmtTime(ms) {
  if (!ms) return '—';
  var d = new Date(ms);
  return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
function trimForCloud(s) {
  var cut = new Date(); cut.setDate(cut.getDate() - 180); var cs = fmt(cut);
  var o = JSON.parse(JSON.stringify(s));
  o.checkins = o.checkins.filter(function (c) { return c.date >= cs; });
  o.ledger = o.ledger.filter(function (e) { return e.date >= cs; });
  o.redemptions = o.redemptions.slice(-100);
  o.notes = o.notes.slice(-50);
  return o;
}

/* ============ 云端同步层 ============ */
function db() { return null; /* 提报演示版：不连任何数据表，纯本地 */ }
function setSync(st, text) { sync.status = st; sync.text = text; renderSync(); }
function cloudQuery() {
  var d = db(); if (!d) return Promise.reject(new Error('no-sdk'));
  function walk(cur, acc, guard) {
    acc = acc || []; guard = guard || 0;
    if (guard > 20) return Promise.resolve(acc);
    return d.query({ databaseId: DB_ID, pageSize: 200, startCursor: cur }).then(function (r) {
      acc = acc.concat(r.results || []);
      var nx = r.nextCursor;
      if (r.hasMore && nx && nx !== cur && (r.results || []).length) return walk(nx, acc, guard + 1);
      return acc;
    });
  }
  return walk();
}
var remoteCount = 0, remoteUpdatedAt = 0;
function recordCount(s) { return s ? (s.checkins.length + s.ledger.length + s.redemptions.length) : 0; }
function unionById(a, b) {
  var seen = {}, out = [];
  (a || []).concat(b || []).forEach(function (x) {
    if (!x) return;
    if (!x.id) { out.push(x); return; }
    if (!seen[x.id]) { seen[x.id] = 1; out.push(x); }
  });
  return out;
}
function mergeStates(local, remote) {
  var newer = num(remote.meta && remote.meta.updatedAt, 0) >= num(local.meta && local.meta.updatedAt, 0) ? remote : local;
  var out = JSON.parse(JSON.stringify(newer));
  out.checkins = unionById(local.checkins, remote.checkins);
  out.ledger = unionById(local.ledger, remote.ledger);
  out.redemptions = unionById(local.redemptions, remote.redemptions);
  out.notes = unionById(local.notes, remote.notes);
  out.meta.updatedAt = Date.now();
  return out;
}
function isDemoOnly(s) {
  if (!s || s.notes.length || s.redemptions.length) return false;
  if (!s.checkins.length && !s.ledger.length) return false;
  return s.checkins.every(function (c) { return c.demo; }) && s.ledger.every(function (e) { return e.demo; });
}
/* 云端档案列表 = 注册表 + 所有 p:* 记录（任一来源都不遗漏） */
function collectCloudProfiles(map) {
  var list = [];
  var reg = map['profiles'];
  if (reg && reg['内容']) {
    try {
      JSON.parse(reg['内容']).forEach(function (p) {
        if (p && p.id) list.push({ id: p.id, name: p.name || '儿童', created: p.created || '', updatedAt: num(p.updatedAt, 0) });
      });
    } catch (e) { }
  }
  Object.keys(map).forEach(function (k) {
    if (k.indexOf('p:') !== 0) return;
    var id = k.slice(2), hit = null;
    list.forEach(function (p) { if (p.id === id) hit = p; });
    var nm = '', up = 0;
    try {
      var o = JSON.parse(map[k]['内容'] || '{}');
      nm = (o.config && o.config.childName) || '';
      up = num(o.meta && o.meta.updatedAt, 0);
    } catch (e) { }
    if (hit) { if (!hit.updatedAt) hit.updatedAt = up; return; }
    list.push({ id: id, name: nm || '儿童', created: '', updatedAt: up });
  });
  return list;
}
/* 本地档案列表 ∪ 云端（按 id 合并，任何一方的档案都不会消失） */
function mergeProfileLists(local, cloud) {
  var out = (local || []).map(function (p) {
    return { id: p.id, name: p.name || '儿童', created: p.created || '', updatedAt: num(p.updatedAt, 0) };
  });
  (cloud || []).forEach(function (cp) {
    var hit = null;
    out.forEach(function (p) { if (p.id === cp.id) hit = p; });
    if (!hit) { out.push({ id: cp.id, name: cp.name, created: cp.created || today(), updatedAt: cp.updatedAt }); return; }
    if (num(cp.updatedAt, 0) > num(hit.updatedAt, 0)) { hit.updatedAt = cp.updatedAt; if (cp.name) hit.name = cp.name; }
  });
  return out;
}
var pullP = null;
function cloudPull() {
  var d = db();
  if (!d) { setSync('off', '本地模式'); return Promise.resolve(false); }
  if (pullP) return pullP;                 // 同一时刻只拉一次，避免叠加
  setSync('busy', '同步中');
  var cur = cloudQuery().then(function (rows) {
    var map = {};
    rows.forEach(function (r) { map[r['键']] = r; });
    sync.rids['profiles'] = map['profiles'] ? (map['profiles']._id || map['profiles'].record_id) : null;
    var cloudProfs = collectCloudProfiles(map);

    // ① 档案列表：本地 ∪ 云端（修「每台设备各存一份档案列表」）
    var n0 = profiles.list.length;
    profiles.list = mergeProfileLists(profiles.list, cloudProfs);
    if (profiles.list.length !== n0) saveProfiles();

    // ② 云端档案内容回填本机（档案页才能看到云端档案的真实条数）
    cloudProfs.forEach(function (cp) {
      var r = map['p:' + cp.id];
      if (r && r['内容'] && !readState(cp.id)) {
        try { localStorage.setItem(stateKey(cp.id), r['内容']); } catch (e) { }
      }
    });

    // ③ 本机当前档案在云端不存在 → 跟随云端，绝不再各建一份
    var prev = state, prevId = profiles.activeId, switched = false;
    if (profiles.activeId && !map['p:' + profiles.activeId] && cloudProfs.length) {
      var target = null;
      cloudProfs.forEach(function (cp) { if (!target && map['p:' + cp.id]) target = cp; });
      if (target) { profiles.activeId = target.id; switched = true; }
    }
    if (!profiles.activeId) { setSync('on', '已同步'); return false; }
    var row = map['p:' + profiles.activeId];
    sync.rids['p:' + profiles.activeId] = row ? (row._id || row.record_id) : null;
    if (!row || !row['内容']) { remoteCount = 0; remoteUpdatedAt = 0; saveProfiles(); setSync('on', '已同步'); return false; }

    var remote = normalize(JSON.parse(row['内容']));
    remoteUpdatedAt = num(remote.meta && remote.meta.updatedAt, 0);
    remoteCount = recordCount(remote);
    var local = state || readState(profiles.activeId);

    if (switched) {
      // 配置以云端为准，本机独有记录并入；旧重复档案从列表摘掉（内容已并入，不丢数据）
      var out = JSON.parse(JSON.stringify(remote));
      if (prev) {
        out.checkins = unionById(out.checkins, prev.checkins);
        out.ledger = unionById(out.ledger, prev.ledger);
        out.redemptions = unionById(out.redemptions, prev.redemptions);
        out.notes = unionById(out.notes, prev.notes);
      }
      out.meta.updatedAt = Date.now();
      if (prevId) profiles.list = profiles.list.filter(function (p) { return p.id !== prevId; });
      profiles.list = mergeProfileLists(profiles.list, cloudProfs);
      saveProfiles();
      state = out; saveLocal();
      setSync('on', '已同步');
      toast('已跟随云端档案：' + state.config.childName + '（本机重复档案已并入）');
      cloudPush();
      return true;
    }

    var localN = recordCount(local);
    var remoteNewer = remoteUpdatedAt > num(local && local.meta ? local.meta.updatedAt : 0, 0) + 1000;
    var merged = local ? mergeStates(local, remote) : remote;
    var adopted;
    if (!local) adopted = true;
    else if (remoteCount > 0 && (localN === 0 || isDemoOnly(local))) adopted = true;            // 本机空/只有示例 → 云端恢复
    else if (remoteCount > 0 && localN > 0) adopted = recordCount(merged) > localN || remoteNewer; // 记录求并集 + 配置下发
    else adopted = remoteNewer;                                                                  // 都没记录但设置更新了
    if (adopted) {
      state = merged; saveLocal();
      if (remoteCount > 0 && localN === 0) toast('已从云端恢复 ' + remoteCount + ' 条记录');
      else if (remoteNewer && recordCount(merged) === localN) toast('已同步云端的最新设置');
    }
    setSync('on', '已同步');
    return adopted;
  }).catch(function () { setSync('off', '本地模式'); return false; });
  pullP = cur;
  cur.then(function () { if (pullP === cur) pullP = null; }, function () { if (pullP === cur) pullP = null; });
  return cur;
}
var pushTimer = null;
function upsertRecord(key, text, cb) {
  var d = db(); if (!d) return Promise.resolve();
  var props = { '键': { text: key }, '内容': { text: text }, '更新时间': { text: new Date().toISOString() } };
  var rid = sync.rids[key];
  if (rid) return d.updateRecord({ databaseId: DB_ID, recordId: rid, properties: props }).then(function (r) { if (cb) cb(); return r; });
  return cloudQuery().then(function (rows) {
    var rec = null; rows.forEach(function (r) { if (r['键'] === key) rec = r; });
    if (rec) { sync.rids[key] = rec._id || rec.record_id; return d.updateRecord({ databaseId: DB_ID, recordId: sync.rids[key], properties: props }).then(function (r) { if (cb) cb(); return r; }); }
    return d.addRecord({ databaseId: DB_ID, properties: props }).then(function (r) { sync.rids[key] = (r && r.id) || null; if (cb) cb(); return r; });
  });
}
function cloudPush() {
  if (ui.demo) return;
  var d = db();
  if (!d) { setSync('off', '本地模式'); return; }
  if (!profiles.activeId) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(function () {
    var run = function () {
      // 红线：本地是空的、而云端有记录 → 绝不上传覆盖
      if (recordCount(state) === 0 && remoteCount > 0) {
        setSync('on', '已同步');
        toast('本机暂无记录，已跳过上传，避免覆盖云端存档');
        return;
      }
      setSync('busy', '同步中');
      upsertRecord('p:' + profiles.activeId, JSON.stringify(trimForCloud(state)))
        .then(function () {
          var list = profiles.list.map(function (p) { return { id: p.id, name: p.name, created: p.created, updatedAt: p.updatedAt }; });
          return upsertRecord('profiles', JSON.stringify(list));
        })
        .then(function () { remoteCount = recordCount(state); remoteUpdatedAt = num(state.meta.updatedAt, 0); setSync('on', '已同步 · ' + new Date().toTimeString().slice(0, 5)); })
        .catch(function () { setSync('off', '本地模式（已存本机）'); });
    };
    // 云端存档较新 → 先拉取合并，再上传。
    // 绝不直接丢弃本机刚发生的改动（比如孩子这边刚打的卡）。
    if (remoteUpdatedAt > num(state.meta.updatedAt, 0)) {
      cloudPull().then(run, run);
    } else run();
  }, 600);
}
function saveAll() {
  if (ui.demo) { toast('示例演示中，改动不会保存'); return; }
  saveLocal(); cloudPush();
}

/* ============ 计算层 ============ */
function balance() { return num(state.config.startBonus, 0) + state.ledger.reduce(function (s, e) { return s + e.delta; }, 0); }
/* 完成分：她自己做完就给，不随消退倍率下降（否则保底会被吃掉） */
function baseOf(t) { return Math.max(1, Math.round(num(t.points, 1))); }
/* 主动加成：只有家长判定「主动」时才加，随消退倍率递减 */
function bonusOf(t) { return Math.max(0, Math.round(num(t.bonus, 0) * num(state.config.fade.earnRate, 1))); }
function earnOf(t) { return baseOf(t) + bonusOf(t); }
function costOf(r) { return Math.max(1, Math.round(r.cost * num(state.config.fade.redeemRate, 1))); }
/* 奖励档位 → 价格带与建议分（锚点 3 分 = 1 元；起泡胶类按 5 分 = 1 元 自行调整）
   顺序：木头 < 石头 < 铁 < 钻石。只是奖励的分级，不代表孩子的等级 */
var LEVEL_INFO = {
  '木头': { band: '¥0–5', sug: '0–15 分' },
  '石头': { band: '¥5–30', sug: '15–90 分' },
  '铁': { band: '¥30–100', sug: '90–300 分' },
  '钻石': { band: '¥100 以上', sug: '300 分以上，且需家长同意' }
};
var LEVEL_ORDER = ['木头', '石头', '铁', '钻石'];
/* 档位标签：材质图标（内联 SVG）+ 配色，家长端与孩子端共用同一套 */
var LV_CLS = { '木头': 'lv-wood', '石头': 'lv-stone', '铁': 'lv-iron', '钻石': 'lv-diamond' };
var LV_ICON = {
  '木头': '<rect x="2.4" y="2.4" width="11.2" height="11.2" rx="2.6"/><path d="M5.6 6h4.8M5.6 8.5h4.8M5.6 11h3" stroke="#fff" stroke-width="1.1" stroke-linecap="round" fill="none" opacity=".5"/>',
  '石头': '<path d="M4.3 12.7 2.7 7.3 6 3h4.7l2.6 4.4-2.4 5.3Z"/>',
  '铁': '<path d="M4.3 5.1h7.4l1.4 6.3H2.9Z"/>',
  '钻石': '<path d="M8 1.8 13.5 6.6 8 14.2 2.5 6.6Z"/><path d="M2.8 6.6h10.4" stroke="#fff" stroke-width="1" fill="none" opacity=".55"/>'
};
function lvChip(lv) {
  lv = LEVEL_INFO[lv] ? lv : '石头';
  return '<span class="lv-chip ' + LV_CLS[lv] + '"><svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">' + LV_ICON[lv] + '</svg>' + lv + '</span>';
}
function bandOf(r) { return (LEVEL_INFO[r.level] || LEVEL_INFO['石头']).band; }
function sugOf(r) { return (LEVEL_INFO[r.level] || LEVEL_INFO['石头']).sug; }
function activeTasks() { return state.config.tasks.filter(function (t) { return t.active; }); }
function slotOf(type) { return type === 'weekly' ? thisWeek() : today(); }
function findCheckin(id, slot) { for (var i = state.checkins.length - 1; i >= 0; i--) { var c = state.checkins[i]; if (c.taskId === id && c.slot === slot) return c; } return null; }
function taskById(id) { var r = null; state.config.tasks.forEach(function (t) { if (t.id === id) r = t; }); return r; }
function rewardById(id) { var r = null; state.config.rewards.forEach(function (x) { if (x.id === id) r = x; }); return r; }
function todayEarned() { var d = today(); return state.ledger.filter(function (e) { return e.date === d && e.delta > 0; }).reduce(function (s, e) { return s + e.delta; }, 0); }
function todayLedgerN() { var d = today(); return state.ledger.filter(function (e) { return e.date === d; }).length; }
function pendingCheckins() { return state.checkins.filter(function (c) { return c.status === 'pending'; }); }
function pendingRedeems() { return state.redemptions.filter(function (r) { return r.status === 'pending'; }); }
function overdueCheckins() {
  var t = today();
  return pendingCheckins().filter(function (c) { return c.date < t; })
    .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
}
/* 流水归类：打卡分 / 连续奖励 / 家长手动 / 兑换扣分（旧数据按原因推断） */
function ledgerKind(e) {
  if (e.kind) return e.kind;
  if (e.delta < 0) return 'out';
  if (/^连续/.test(e.reason || '')) return 'streak';
  return 'checkin';
}
/* 某天的"打卡分"：只算打卡产生的分，不含家长手动加分和连续奖励本身 */
function goalEarnedOn(ds) {
  return state.ledger.filter(function (e) {
    return e.date === ds && e.delta > 0 && ledgerKind(e) === 'checkin';
  }).reduce(function (s, e) { return s + e.delta; }, 0);
}
/* 当天目标分（读配置，不写死） */
function goalOf() { return Math.max(1, num(state.config.dailyGoal, 7)); }
/* 某天是否达标 */
function metGoal(ds) { return goalEarnedOn(ds) >= goalOf(); }
/* 今天还差多少分达标 */
function toGoal() { return Math.max(0, goalOf() - goalEarnedOn(today())); }
/* 连续达标天数（今天还没达标就从昨天往前数） */
function streakDays() {
  var d = new Date(), n = 0;
  if (!metGoal(fmt(d))) d.setDate(d.getDate() - 1);
  while (metGoal(fmt(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function treeStage(d) { return d < 3 ? 0 : d < 7 ? 1 : d < 14 ? 2 : d < 30 ? 3 : 4; }
var STAGE = ['种子', '小芽', '小树苗', '小树', '大树'];
var STAGE_NEXT = [3, 7, 14, 30, null];
function totalRecords() { return state.checkins.length + state.ledger.length + state.redemptions.length; }
function hasDemo() { return state.checkins.some(function (c) { return c.demo; }) || state.ledger.some(function (e) { return e.demo; }); }

function treeSVG(st) {
  var deco = '<rect x="0" y="0" width="200" height="160" rx="16" fill="#E9F4FE"/>' +
    '<g stroke="#FFC93C" stroke-width="3" stroke-linecap="round"><line x1="36" y1="14" x2="36" y2="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="51" y1="21" x2="56" y2="16"/></g>' +
    '<circle cx="36" cy="32" r="11" fill="#FFC93C"/>' +
    '<g fill="#FFFFFF" opacity="0.92"><ellipse cx="150" cy="28" rx="15" ry="7"/><ellipse cx="161" cy="23" rx="11" ry="6"/><ellipse cx="62" cy="58" rx="12" ry="6"/></g>' +
    '<ellipse cx="100" cy="164" rx="108" ry="24" fill="#BFE8D1"/>' +
    '<ellipse cx="100" cy="134" rx="30" ry="8" fill="#C89B6A"/>';
  var s;
  if (st === 0) s = '<ellipse cx="100" cy="126" rx="10" ry="8" fill="#8B5E34"/><path d="M100 122 q3 -11 10 -14 q-9 1 -10 14z" fill="#22C07E"/>';
  else if (st === 1) s = '<rect x="97" y="98" width="6" height="30" rx="3" fill="#4E9E5F"/><ellipse cx="84" cy="102" rx="13" ry="7" fill="#22C07E" transform="rotate(-16 84 102)"/><ellipse cx="116" cy="98" rx="13" ry="7" fill="#22C07E" transform="rotate(16 116 98)"/>';
  else if (st === 2) s = '<rect x="95.5" y="84" width="9" height="46" rx="4" fill="#7A5530"/><circle cx="100" cy="72" r="20" fill="#2FB87A"/><circle cx="82" cy="88" r="12" fill="#22C07E"/><circle cx="118" cy="88" r="12" fill="#22C07E"/>';
  else if (st === 3) s = '<rect x="93" y="72" width="14" height="58" rx="6" fill="#7A5530"/><circle cx="100" cy="58" r="26" fill="#2FB87A"/><circle cx="72" cy="80" r="17" fill="#22C07E"/><circle cx="128" cy="80" r="17" fill="#22C07E"/><circle cx="100" cy="92" r="15" fill="#1FA96A"/>';
  else s = '<rect x="91" y="64" width="18" height="66" rx="7" fill="#7A5530"/><circle cx="100" cy="50" r="32" fill="#2FB87A"/><circle cx="64" cy="78" r="21" fill="#22C07E"/><circle cx="136" cy="78" r="21" fill="#22C07E"/><circle cx="100" cy="96" r="19" fill="#1FA96A"/><g fill="#FF6B6B"><circle cx="80" cy="48" r="5"/><circle cx="120" cy="60" r="5"/><circle cx="98" cy="32" r="5"/><circle cx="140" cy="86" r="5"/><circle cx="62" cy="88" r="5"/></g>';
  return '<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">' + deco + s + '</svg>';
}

/* ============ 渲染层（各函数互不调用，由 refreshAll 统一调度） ============ */
function renderSync() {
  var el = document.getElementById('syncBox');
  if (!el) return;
  var cls = sync.status === 'on' ? '' : sync.status === 'busy' ? 'busy' : 'off';
  var icon = sync.status === 'on' ? 'cloud' : sync.status === 'busy' ? 'refresh' : 'cloud';
  el.innerHTML = '<span class="dot ' + cls + '"></span><b>' + esc(sync.text) + '</b>';
}
function renderHeader() {
  var name = state ? esc(state.config.childName) : '未命名';
  var title = (name === '儿童') ? '儿童习惯工作台' : name + '的习惯工作台';
  var h = '<div class="hdr"><h1>' + title + (ui.demo ? '（示例）' : '') + '</h1>' +
    '<div class="hdr-right">' + (state ? '<div class="pill-points">' + ic('coin') + '<b>' + balance() + '</b></div>' : '') +
    '<div class="sync" id="syncBox" data-act="syncNow" title="点一下立即同步"></div></div></div>';
  h += '<div class="tabs">' +
    '<button data-act="mode" data-v="kid" class="' + (ui.mode === 'kid' && !ui.demo ? 'on' : '') + '">' + ic('user') + '儿童</button>' +
    '<button data-act="mode" data-v="parent" class="' + (ui.mode === 'parent' && !ui.demo ? 'on' : '') + '">' + ic('users') + '爸爸妈妈</button>' +
    '<button data-act="goProfiles" class="' + ((ui.view === 'profiles' || ui.demo) ? 'on' : '') + '">' + ic('inbox') + '档案</button>' +
    '</div>';
  return h;
}
function renderBackupTip() {
  if (state.meta.tipDismissed || totalRecords() < 30) return '';
  return '<div class="note blue" style="display:flex;align-items:center;gap:8px;margin-bottom:14px">' + ic('alert') +
    '<span style="flex:1">数据已积累 ' + totalRecords() + ' 条，建议导出一次备份。</span>' +
    '<button class="btn ghost sm" data-act="dismissTip">知道了</button></div>';
}
function renderDemoTip() {
  if (!hasDemo()) return '';
  return '<div class="note" style="display:flex;align-items:center;gap:8px;margin-bottom:14px">' + ic('star') +
    '<span style="flex:1">当前有示例数据（含 1 条逾期待确认）。用熟了就清掉。</span>' +
    '<button class="btn ghost sm" data-act="clearDemo">清空示例</button></div>';
}

function renderImportBanner() {
  if (!pendingImport) return '';
  return '<div class="note red" style="display:flex;align-items:center;gap:8px;margin-bottom:14px">' + ic('alert') +
    '<span style="flex:1">将从备份文件恢复，覆盖当前全部数据。</span>' +
    '<button class="btn red sm" data-act="confirmImport">确认导入</button>' +
    '<button class="btn ghost sm" data-act="cancelImport">取消</button></div>';
}
function renderClearBanner() {
  if (!pendingClearLogs) return '';
  return '<div class="note red" style="display:flex;align-items:center;gap:8px;margin-bottom:14px">' + ic('alert') +
    '<span style="flex:1">确认清空所有打卡、兑换和流水？任务和规则保留。</span>' +
    '<button class="btn red sm" data-act="confirmClearLogs">确认清空</button>' +
    '<button class="btn ghost sm" data-act="cancelClearLogs">取消</button></div>';
}
function renderResetBanner() {
  if (!pendingReset) return '';
  return '<div class="note red" style="display:flex;align-items:center;gap:8px;margin-bottom:14px">' + ic('alert') +
    '<span style="flex:1">确认恢复出厂设置？所有任务、规则、记录都会清空！</span>' +
    '<button class="btn red sm" data-act="confirmReset">确认重置</button>' +
    '<button class="btn ghost sm" data-act="cancelReset">取消</button></div>';
}

/* ---- 孩子：今天要处理（置顶） ---- */
function renderKidToday() {
  var t = today(), h = '<div class="card"><h2>' + ic('alert') + '今天要处理</h2>';
  var od = overdueCheckins();
  if (od.length) {
    od.forEach(function (c) {
      var tk = taskById(c.taskId);
      h += '<div class="task overdue"><div class="ico">' + ic('clock') + '</div>' +
        '<div class="mid"><div class="nm">' + esc(tk ? tk.name : '任务') + demoTag(c) + '</div>' +
        '<div class="sub" style="color:#B03030">逾期 ' + dayDiff(c.date, t) + ' 天还没确认（' + esc(c.date) + '）</div></div>' +
        '<div class="act"><span class="tag no">提醒爸爸确认</span></div></div>';
    });
  }
  var todo = [], pend = [], doneToday = [], weekTodo = [], weekDone = [];
  activeTasks().forEach(function (tk) {
    var c = findCheckin(tk.id, slotOf(tk.type));
    var wk = tk.type === 'weekly';
    if (!c) (wk ? weekTodo : todo).push(tk);
    else if (c.status === 'pending') pend.push({ t: tk, c: c });
    else if (c.status === 'approved') (wk ? weekDone : doneToday).push({ t: tk, c: c });
    else (wk ? weekTodo : todo).push(tk);
  });
  if (!od.length && !todo.length && !pend.length) {
    h += '<div class="empty">今天的事都处理完了，很棒。' + (doneToday.length ? '已完成 ' + doneToday.length + ' 项。' : '') + '</div>';
  }
  todo.forEach(function (tk) {
    h += '<div class="task tap" data-act="checkin" data-id="' + tk.id + '"><div class="ico">' + ic('star') + '</div>' +
      '<div class="mid"><div class="nm">' + esc(tk.name) + '</div>' +
      '<div class="sub">今天 · 完成 +' + baseOf(tk) + ' 分' + (bonusOf(tk) ? '（主动再 +' + bonusOf(tk) + '）' : '') + '</div></div>' +
      '<div class="act"><button class="btn primary" data-act="checkin" data-id="' + tk.id + '">我完成了</button></div></div>';
  });
  pend.forEach(function (o) {
    h += '<div class="task wait"><div class="ico">' + ic('clock') + '</div>' +
      '<div class="mid"><div class="nm">' + esc(o.t.name) + demoTag(o.c) + '</div><div class="sub">' + (o.t.type === 'weekly' ? '本周任务 · ' : '') + '等爸爸妈妈确认 +' + num(o.c.points, 0) + ' 分</div></div>' +
      '<div class="act"><span class="tag wait">待确认</span></div></div>';
  });
  doneToday.forEach(function (o) {
    h += '<div class="task done"><div class="ico">' + ic('check') + '</div>' +
      '<div class="mid"><div class="nm">' + esc(o.t.name) + '</div><div class="sub">今天已完成 +' + num(o.c.awarded, o.c.points) + ' 分' + (o.c.withBonus ? '（含主动）' : '') + '</div></div>' +
      '<div class="act"><span class="tag ok">已完成</span></div></div>';
  });
  /* 本周任务单独成区：完成日期写明，避免被当成"今天已经打过卡" */
  if (weekTodo.length || weekDone.length) {
    h += '<div class="wk-split">本周任务（一周做一次）</div>';
    weekTodo.forEach(function (tk) {
      h += '<div class="task tap" data-act="checkin" data-id="' + tk.id + '"><div class="ico">' + ic('star') + '</div>' +
        '<div class="mid"><div class="nm">' + esc(tk.name) + '</div>' +
        '<div class="sub">本周内完成 +' + baseOf(tk) + ' 分' + (bonusOf(tk) ? '（主动再 +' + bonusOf(tk) + '）' : '') + '</div></div>' +
        '<div class="act"><button class="btn primary" data-act="checkin" data-id="' + tk.id + '">我完成了</button></div></div>';
    });
    weekDone.forEach(function (o) {
      h += '<div class="task done"><div class="ico">' + ic('check') + '</div>' +
        '<div class="mid"><div class="nm">' + esc(o.t.name) + '</div><div class="sub">本周已完成 · ' + esc(o.c.date) + ' · +' + num(o.c.awarded, o.c.points) + ' 分</div></div>' +
        '<div class="act"><span class="tag ok">本周已完成</span></div></div>';
    });
  }
  h += '</div>';
  return h;
}
function renderKidFeedback() {
  var goal = goalOf(), got = goalEarnedOn(today());
  var pct = Math.min(100, Math.round(got / goal * 100));
  var doneN = 0, d = today();
  state.checkins.forEach(function (c) { if (c.status === 'approved' && c.date === d) doneN++; });
  var left = Math.max(0, goal - got);
  return '<div class="card"><div class="fb-top">' + ic('flame') + '今日进度</div>' +
    '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
    '<div class="muted" style="margin-top:6px">今日打卡 ' + got + ' / ' + goal + ' 分 · 已完成 ' + doneN + ' 项 · ' +
    (left ? '再 ' + left + ' 分达标' : '今天达标了') + '</div></div>';
}
function renderKidTree() {
  var days = streakDays(), st = treeStage(days);
  return '<div class="card"><h2>' + ic('sprout') + '我的小树</h2><div class="tree-wrap">' + treeSVG(st) +
    '<div class="grow-info"><div class="big">' + STAGE[st] + '</div><div class="muted">' +
    (STAGE_NEXT[st] ? '再连续 ' + (STAGE_NEXT[st] - days) + ' 天达标，长成「' + STAGE[st + 1] + '」' : '已经是最高等级了') +
    ' · 连续 ' + days + ' 天达标 · 可用积分 ' + balance() + '</div></div></div></div>';
}
function renderKidShop() {
  var h = '<div class="card"><h2>' + ic('gift') + '积分商城</h2><div class="shop">';
  var rs = state.config.rewards.filter(function (r) { return r.active; });
  if (!rs.length) return '<div class="card"><h2>' + ic('gift') + '积分商城</h2><div class="empty">商城还是空的，请爸爸妈妈添加。</div></div>';
  rs.forEach(function (r) {
    var c = costOf(r), can = balance() >= c, lv = r.level || '石头';
    h += '<div class="shop-item ' + (can ? 'can' : '') + '"><div class="s-ico">' + ic('gift') + '</div>' +
      '<div class="s-nm">' + esc(r.name) + lvChip(lv) + '</div>' +
      '<div class="s-cost">' + ic('coin') + ' ' + c + ' 分' + (lv === '钻石' ? ' · 需家长同意' : '') + '</div>' +
      '<button class="btn ' + (can ? 'green' : 'ghost') + ' sm" data-act="redeem" data-id="' + r.id + '"' + (can ? '' : ' disabled') + '>' +
      (can ? '申请兑换' : '还差 ' + (c - balance())) + '</button></div>';
  });
  h += '</div></div>';
  var mine = state.redemptions.slice().reverse().slice(0, 6);
  if (mine.length) {
    h += '<div class="card"><h2>' + ic('inbox') + '我的兑换申请</h2>';
    mine.forEach(function (r) {
      var rw = rewardById(r.rewardId);
      var tag = r.status === 'pending' ? '<span class="tag wait">等发放</span>' : r.status === 'approved' ? '<span class="tag ok">已发放</span>' : '<span class="tag no">未通过</span>';
      h += '<div class="log"><span>' + esc(rw ? rw.name : '（已删除）') + ' · ' + esc(r.date) + ' · ' + r.cost + ' 分</span>' + tag + '</div>';
    });
    h += '</div>';
  }
  return h;
}
function renderKid() { return renderKidToday() + renderKidFeedback() + renderKidTree() + renderKidShop(); }

/* ---- 家长 ---- */
function renderPin() {
  var dots = '', i;
  for (i = 0; i < 4; i++) dots += ui.pinBuf.length > i ? '●' : '○';
  var h = '<div class="card"><div class="pin"><h2 style="justify-content:center">' + ic('lock') + '请输入 4 位密码</h2>' +
    '<div class="dots">' + dots + '</div><div class="pad">';
  ['1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(function (n) { h += '<button data-act="pin" data-v="' + n + '">' + n + '</button>'; });
  h += '<button data-act="pindel">' + ic('x') + '</button><button data-act="pin" data-v="0">0</button><button data-act="pinclr">C</button></div>' +
    '<div class="muted" style="margin-top:14px">初始密码 0000，进入后可在「规则」里改。密码只防误触，不是加密。</div></div></div>';
  return h;
}
function renderParentTodo() {
  var h = '<div class="card"><h2>' + ic('alert') + '今天要处理</h2>';
  var od = overdueCheckins(), pc = pendingCheckins().filter(function (c) { return c.date === today(); });
  var pr = pendingRedeems();
  if (!od.length && !pc.length && !pr.length) h += '<div class="empty">' + ic('check') + ' 没有待处理事项</div>';
  od.forEach(function (c) {
    var tk = taskById(c.taskId);
    h += '<div class="task overdue"><div class="ico">' + ic('alert') + '</div>' +
      '<div class="mid"><div class="nm">' + esc(tk ? tk.name : '任务') + demoTag(c) + '</div>' +
      '<div class="sub" style="color:#B03030">逾期 ' + dayDiff(c.date, today()) + ' 天 · ' + esc(c.date) + ' · +' + c.points + ' 分</div></div>' +
      '<div class="act"><div class="row"><button class="btn green sm" data-act="apprCk" data-id="' + c.id + '">通过</button>' +
      '<button class="btn red sm" data-act="rejCk" data-id="' + c.id + '">驳回</button></div></div></div>';
  });
  pc.forEach(function (c) {
    var tk = taskById(c.taskId);
    h += '<div class="task wait"><div class="ico">' + ic('clock') + '</div>' +
      '<div class="mid"><div class="nm">' + esc(tk ? tk.name : '任务') + demoTag(c) + '</div><div class="sub">今天 · +' + c.points + ' 分</div></div>' +
      '<div class="act"><div class="row"><button class="btn green sm" data-act="apprCk" data-id="' + c.id + '">通过</button>' +
      '<button class="btn red sm" data-act="rejCk" data-id="' + c.id + '">驳回</button></div></div></div>';
  });
  pr.forEach(function (r) {
    var rw = rewardById(r.rewardId);
    h += '<div class="task"><div class="ico">' + ic('gift') + '</div>' +
      '<div class="mid"><div class="nm">' + esc(rw ? rw.name : '（已删除）') + '</div>' +
      '<div class="sub">' + esc(r.date) + ' · 扣 ' + r.cost + ' 分 · 当前余额 ' + balance() + '</div></div>' +
      '<div class="act"><div class="row"><button class="btn green sm" data-act="apprRd" data-id="' + r.id + '">已发放</button>' +
      '<button class="btn red sm" data-act="rejRd" data-id="' + r.id + '">驳回</button></div></div></div>';
  });
  h += '</div>';

  /* 今日打卡总览：每条任务当前是什么状态，一眼可核对，漏记可代为补上 */
  h += '<div class="card"><h2>' + ic('check') + '今日打卡</h2>';
  activeTasks().forEach(function (tk) {
    var c = findCheckin(tk.id, slotOf(tk.type));
    var b = bonusOf(tk);
    var tag, act = '';
    if (!c) {
      tag = '<span class="tag">未记录</span>';
      act = '<button class="btn ghost sm" data-act="checkin" data-id="' + tk.id + '">补录</button>';
    } else if (c.status === 'pending') {
      tag = '<span class="tag wait">待确认</span>';
      act = '<button class="btn green sm" data-act="apprCk" data-id="' + c.id + '">通过</button>' +
        (b > 0 ? '<button class="btn teal sm" data-act="apprCkB" data-id="' + c.id + '">主动 +' + b + '</button>' : '') +
        '<button class="btn red sm" data-act="rejCk" data-id="' + c.id + '">驳回</button>';
    } else if (c.status === 'approved') {
      tag = '<span class="tag ok">' + (tk.type === 'weekly' ? '本周已完成' : '已通过') + (c.withBonus ? ' · 含主动' : '') + '</span>';
    } else {
      tag = '<span class="tag no">已驳回</span>';
      act = '<button class="btn ghost sm" data-act="checkin" data-id="' + tk.id + '">重新记录</button>';
    }
    h += '<div class="task"><div class="ico">' + ic('star') + '</div>' +
      '<div class="mid"><div class="nm">' + esc(tk.name) + '</div>' +
      '<div class="sub">' + (tk.type === 'weekly' ? '本周' : '今天') + ' · 完成 +' + baseOf(tk) + ' 分' + (b > 0 ? ' · 主动再 +' + b : '') + (c ? ' · ' + esc(c.date) : '') + '</div></div>' +
      '<div class="act"><div class="row">' + tag + act + '</div></div></div>';
  });
  h += '<div class="note" style="margin-top:10px">判定：「通过」= 她自己做的；「主动 +N」= 不用人提、自己就去做了；「驳回」= 被催着做 / 拖着不做 / 家长代劳 → 不给分。<br>「补录」只用于<b>她做了但忘了点</b>的情况。</div>';
  h += '<div class="muted" style="margin-top:8px">今日已通过 ' + todayLedgerN() + ' 条 · 待确认 ' + pendingCheckins().length + ' 条 · 最后保存 ' + fmtTime(state.meta.updatedAt) + '</div></div>';

  h += '<div class="card"><h2>' + ic('pen') + '临时加分 / 扣分</h2>' +
    '<label>快选分值（扣分用负数）</label>' +
    '<div class="row" style="margin-bottom:8px">' +
    ['1','2','3','5','10','-1','-2'].map(function (n) { return '<button class="btn ghost sm" data-act="setAdj" data-v="' + n + '">' + (n > 0 ? '+' : '') + n + '</button>'; }).join('') +
    '</div>' +
    '<input type="number" id="adjPts" value="1">' +
    '<div class="grid2" style="margin-top:8px"><div><label>原因（可不填）</label><input type="text" id="adjWhy" placeholder="例：临时奖励 / 桌面没收拾"></div>' +
    '<div><label>日期</label><input type="text" id="adjDate" value="' + today() + '"></div></div>' +
    '<div class="row end" style="margin-top:10px"><button class="btn teal" data-act="adjust">' + ic('plus') + '记一笔</button></div></div>';
  var recent = state.ledger.slice().reverse().slice(0, 12);
  h += '<div class="card"><h2>' + ic('chart') + '最近流水</h2>';
  if (!recent.length) h += '<div class="empty">还没有积分记录</div>';
  recent.forEach(function (e) {
    h += '<div class="log"><span>' + esc(e.date) + ' · ' + esc(e.reason) + demoTag(e) + '</span><span class="' + (e.delta >= 0 ? 'plus' : 'minus') + '">' + (e.delta >= 0 ? '+' : '') + e.delta + '</span></div>';
  });
  h += '</div>';
  return h;
}
var FADE = [
  { s: 1, n: '① 洪水期（第 1-2 周）', e: 1, r: 1, tip: '大量给分，做完立刻加分，让她先尝到甜头。' },
  { s: 2, n: '② 巩固期（第 3-4 周）', e: 0.7, r: 1.2, tip: '给分降三成、门槛提两成，开始拉长满足间隔。' },
  { s: 3, n: '③ 消退期（第 2 个月起）', e: 0.5, r: 1.5, tip: '进一步减代币，奖励变少但更值钱。' },
  { s: 4, n: '④ 交接期（稳定后）', e: 0.3, r: 1.5, tip: '把检查权交回她自己：可关闭确认流，让她自己打卡。' }
];
function renderParentTasks() {
  var c = state.config;
  var h = '<div class="card"><h2>' + ic('star') + '任务清单</h2>' +
    '<div class="note">只放「无内驱但必须做」的苦差事，且要写成能确认的具体行为（如"作业前准备好书本和文具"，而不是"好好学习"）。英语、唱歌、画画、拍视频、主动社交<b>不要</b>放进来——加奖励会毁掉兴趣。</div>' +
    '<div class="note" style="margin-top:8px">分值分两栏：<b>完成分</b>（她自己做完就给，消退期也不降）+ <b>主动加成</b>（不用人提、自己就去做了才加，随消退倍率递减）。</div>';
  c.tasks.forEach(function (t) {
    h += '<div class="edit-row"><div class="fields">' +
      '<input type="text" data-f="name" data-id="' + t.id + '" value="' + esc(t.name) + '">' +
      '<input type="number" data-f="points" data-id="' + t.id + '" value="' + num(t.points, 1) + '" min="1" title="完成分">' +
      '<input type="number" data-f="bonus" data-id="' + t.id + '" value="' + num(t.bonus, 0) + '" min="0" title="主动加成">' +
      '</div><div class="row">' +
      '<select data-f="type" data-id="' + t.id + '" style="width:88px;min-height:46px"><option value="daily"' + (t.type === 'daily' ? ' selected' : '') + '>每天</option><option value="weekly"' + (t.type === 'weekly' ? ' selected' : '') + '>每周</option></select>' +
      '<button class="btn ' + (t.active ? 'teal' : 'ghost') + ' sm" data-act="toggleTask" data-id="' + t.id + '">' + (t.active ? '启用' : '停用') + '</button>' +
      '<button class="btn red sm" data-act="delTask" data-id="' + t.id + '">' + ic('trash') + '</button></div></div>';
  });
  h += '<div class="row"><button class="btn primary" data-act="saveTasks">' + ic('check') + '保存</button>' +
    '<button class="btn ghost" data-act="addTask">' + ic('plus') + '新增任务</button></div></div>';

  h += '<div class="card"><h2>' + ic('gift') + '兑换商城</h2>' +
    '<div class="note red">示例用「小礼物 A/B/C」占位。真实奖励（抓娃娃、周边、蜜桃四季春、零花钱）请自己录入；这个页面如果发在线链接，别填真实奖励名。</div>' +
    '<div class="note" style="margin-top:8px">定价锚点：<b>3 分 = 1 元</b>（起泡胶单独按 5 分 = 1 元）。档位（<b>木头 &lt; 石头 &lt; 铁 &lt; 钻石</b>）只是给奖励分级，<b>孩子端只显示分数，不出现这些名字</b>。钻石档（¥100 以上）建议用「家长认可 + 积分门槛」。</div>' +
    '<div class="lv-table"><div class="lv-hd"><span>档位</span><span>价格带</span><span>建议积分</span><span>本店</span></div>' +
    LEVEL_ORDER.map(function (lv) {
      var n = c.rewards.filter(function (r) { return (r.level || '石头') === lv; }).length;
      return '<div class="lv-row"><b>' + lvChip(lv) + '</b><span>' + LEVEL_INFO[lv].band + '</span><span>约 ' + LEVEL_INFO[lv].sug + '</span><em>' + (n ? n + ' 个' : '—') + '</em></div>';
    }).join('') + '</div>';
  c.rewards.forEach(function (r) {
    h += '<div class="edit-row"><div class="fields">' +
      '<input type="text" data-f="rname" data-id="' + r.id + '" value="' + esc(r.name) + '">' +
      '<input type="number" data-f="rcost" data-id="' + r.id + '" value="' + r.cost + '" min="1" title="所需积分">' +
      '<select data-f="level" data-id="' + r.id + '" title="档位">' +
      LEVEL_ORDER.map(function (lv) { return '<option value="' + lv + '"' + (r.level === lv ? ' selected' : '') + '>' + lv + '</option>'; }).join('') +
      '</select>' +
      '</div><div class="row">' +
      '<button class="btn ' + (r.active ? 'teal' : 'ghost') + ' sm" data-act="toggleReward" data-id="' + r.id + '">' + (r.active ? '上架' : '下架') + '</button>' +
      '<button class="btn red sm" data-act="delReward" data-id="' + r.id + '">' + ic('trash') + '</button></div>' +
      '<div class="muted lv-line" style="grid-column:1/-1;margin-top:2px">' + lvChip(r.level || '石头') + ' 档 · ' + esc(bandOf(r)) + ' · 按 3 分 = 1 元 约 ' + esc(sugOf(r)) + '（起泡胶按 5 分 = 1 元）</div></div>';
  });
  h += '<div class="row"><button class="btn primary" data-act="saveTasks">' + ic('check') + '保存</button>' +
    '<button class="btn ghost" data-act="addReward">' + ic('plus') + '新增奖励</button></div></div>';
  return h;
}
function renderParentFade() {
  var c = state.config, cur = FADE[0], i;
  for (i = 0; i < FADE.length; i++) { if (FADE[i].s === num(c.fade.stage, 1)) cur = FADE[i]; }
  var h = '<div class="card"><h2>' + ic('refresh') + '消退计划（最关键）</h2>' +
    '<div class="note">代币的终点是「不再需要代币」。判断标准：<b>半年后撤掉积分，桌面整洁和按时作业还在不在。</b></div>' +
    '<div class="note" style="margin-top:8px">倍率<b>只作用于「主动加成」</b>，完成分保底不降——否则退到阶段③时"她自己做完三项"只剩 3 分，规则就没法玩了。</div><div class="row" style="margin-top:10px">';
  FADE.forEach(function (p) { h += '<button class="btn ' + (p.s === num(c.fade.stage, 1) ? 'purple' : 'ghost') + ' sm" data-act="fade" data-v="' + p.s + '">' + esc(p.n) + '</button>'; });
  h += '</div><div class="muted" style="margin-top:8px">' + esc(cur.tip) + '</div>' +
    '<div class="grid2" style="margin-top:10px"><div><label>主动加成倍率</label><input type="number" step="0.1" id="fadeEarn" value="' + c.fade.earnRate + '"></div>' +
    '<div><label>兑换门槛倍率</label><input type="number" step="0.1" id="fadeRedeem" value="' + c.fade.redeemRate + '"></div></div></div>';

  h += '<div class="card"><h2>' + ic('cog') + '基本规则</h2><div class="grid2">' +
    '<div><label>孩子昵称</label><input type="text" id="cfgName" value="' + esc(c.childName) + '"></div>' +
    '<div><label>每日目标分</label><input type="number" id="cfgGoal" value="' + c.dailyGoal + '" min="1"></div>' +
    '<div><label>连续多少天达标额外奖励</label><input type="number" id="cfgSD" value="' + c.streakBonus.days + '" min="1"></div>' +
    '<div><label>额外奖励分值</label><input type="number" id="cfgSP" value="' + c.streakBonus.points + '" min="0"></div>' +
    '<div><label>家长密码（4 位）</label><input type="text" id="cfgPin" value="' + esc(c.parentPin) + '" maxlength="4"></div></div>' +
    '<div class="note" style="margin-top:8px">「达标」= <b>当天打卡分 ≥ 每日目标分</b>（不含家长手动加减分，也不含连续奖励本身）。<b>当天没达标就不发连续奖励</b>——什么都不做不会加分。</div>' +
    '<label class="switch" style="margin-top:8px"><input type="checkbox" id="cfgConfirm"' + (c.confirmRequired ? ' checked' : '') + '> 打卡需要家长确认（交接期可关）</label>' +
    '<div class="row end" style="margin-top:10px"><button class="btn primary" data-act="saveRules">' + ic('check') + '保存规则</button></div></div>';
  return h;
}
function renderParentNotes() {
  var h = '<div class="card"><h2>' + ic('note') + '每周复盘（跟孩子一起写）</h2>' +
    '<label>哪些任务她愿意做？哪些总要讨价还价？规则要不要改？</label>' +
    '<textarea id="noteText" placeholder="例：桌面整洁基本自动化了；作业还是看心情，准备提到 4 分试试。"></textarea>' +
    '<div class="row end" style="margin-top:10px"><button class="btn primary" data-act="addNote">' + ic('check') + '保存复盘</button></div>';
  if (state.notes.length) {
    h += '<div style="margin-top:14px">';
    state.notes.slice().reverse().slice(0, 10).forEach(function (n) {
      h += '<div class="log" style="display:block"><span class="muted">' + esc(n.date) + '</span><div>' + esc(n.text) + '</div></div>';
    });
    h += '</div>';
  }
  h += '</div>';
  h += '<div class="card"><h2>' + ic('cal') + '打卡日历（最近 14 天）</h2>' + renderHeat() + '</div>';
  h += '<div class="card"><h2>' + ic('down') + '备份与导出</h2>' +
    '<div class="row"><button class="btn teal" data-act="exportJson">' + ic('down') + '导出 JSON 备份</button>' +
    '<button class="btn ghost" data-act="importJson">' + ic('up') + '导入恢复</button>' +
    '<button class="btn ghost" data-act="exportCsv">导出 CSV</button></div>' +
    '<div class="note red" style="margin-top:12px"><b>用这份数据的两条红线</b><br>' +
    '① 积分记录只能当「习惯养成进度」的证据，<b>不能</b>写进观察档案当兴趣或天赋信号——为积分而完成是服从，不是内驱。<br>' +
    '② 「主动加成」记的是<b>行为结果</b>，不是心意——按她做了什么判断，不做心理归因。</div></div>';
  h += '<div class="card"><h2>' + ic('cloud') + '数据体检</h2>' +
    '<div class="log"><span>本机能否保存</span><span class="' + (storageOK ? 'plus' : 'minus') + '">' + (storageOK ? '正常' : '被浏览器拦截') + '</span></div>' +
    '<div class="log"><span>记录条数</span><span>' + totalRecords() + ' 条</span></div>' +
    '<div class="log"><span>最后保存</span><span>' + (state.meta.updatedAt ? new Date(state.meta.updatedAt).toLocaleString('zh-CN', { hour12: false }) : '—') + '</span></div>' +
    '<div class="log"><span>当前余额</span><span class="plus">' + balance() + ' 分</span></div>' +
    '<div class="note" style="margin-top:10px">数据存在这台设备浏览器的固定"格子"里。<b>请固定用同一个入口打开</b>（推荐添加到主屏幕）——不同网址或浏览器使用不同存储空间，换着用会看不到旧数据。建议每周导出一次备份。</div>' +
    '</div>';
  h += '<div class="card"><h2>' + ic('coin') + '起始分设置</h2>' +
    '<div class="muted" style="margin-bottom:10px">当前余额：<b style="color:var(--orange);font-size:18px">' + balance() + '</b> 分。点下面把截止今天的累计锁为「起始分」，明天起重新打卡。</div>' +
    '<button class="btn primary" data-act="setStart">' + ic('check') + '以当前余额作为起始分，清空打卡与流水</button>' +
    '<div class="muted" style="margin-top:8px">点完后：余额不变、打卡与流水清零、小树和连续天数归零，明天第一次打卡即第 1 天。任务和规则不受影响。</div></div>';
  h += '<div class="card"><h2>' + ic('trash') + '危险操作</h2><div class="row">' +
    '<button class="btn ghost sm" data-act="clearLogs">清空流水（保留任务和规则）</button>' +
    '<button class="btn red sm" data-act="resetAll">恢复出厂设置</button></div></div>';
  return h;
}
function renderHeat() {
  var days = [], i, d = new Date();
  for (i = 13; i >= 0; i--) { var x = new Date(); x.setDate(d.getDate() - i); days.push(fmt(x)); }
  var map = {};
  state.checkins.forEach(function (c) { if (c.status === 'approved') { map[c.date] = (map[c.date] || 0) + 1; } });
  var h = '<div style="display:flex;gap:4px;flex-wrap:wrap">';
  days.forEach(function (dd) {
    var n = map[dd] || 0;
    var bg = n === 0 ? '#F2EADF' : n === 1 ? '#C9E9DC' : n === 2 ? '#7FD3B8' : '#22C07E';
    var isToday = dd === today();
    h += '<div title="' + dd + '：' + n + ' 项" style="width:34px;height:34px;border-radius:9px;background:' + bg + ';display:flex;align-items:center;justify-content:center;font-size:12px;color:#5A534A;border:2px solid ' + (isToday ? '#FF8A3D' : 'transparent') + '">' + parseInt(dd.slice(8), 10) + '</div>';
  });
  h += '</div><div class="muted" style="margin-top:8px">颜色越深，那天完成得越多。橙框是今天。</div>';
  return h;
}
function renderParent() {
  if (!ui.authed) return renderPin();
  var tabs = [['todo', '待办', 'inbox'], ['tasks', '任务与奖励', 'star'], ['rules', '规则与消退', 'refresh'], ['maint', '维护', 'note']];
  var h = '<div class="subtabs">';
  tabs.forEach(function (t) {
    var badge = '';
    if (t[0] === 'todo') { var n = pendingCheckins().length + pendingRedeems().length; if (n) badge = ' (' + n + ')'; }
    h += '<button data-act="ptab" data-v="' + t[0] + '" class="' + (ui.parentTab === t[0] ? 'on' : '') + '">' + ic(t[2]) + t[1] + badge + '</button>';
  });
  h += '</div>';
  if (ui.parentTab === 'todo') h += renderParentTodo();
  else if (ui.parentTab === 'tasks') h += renderParentTasks();
  else if (ui.parentTab === 'rules') h += renderParentFade();
  else h += renderParentNotes();
  return h;
}
function renderFooter() {
  return '<div class="card"><div class="foot">' +
    '<button class="btn ghost sm" data-act="exportJson">' + ic('down') + '导出备份</button>' +
    '<button class="btn ghost sm" data-act="importJson">' + ic('up') + '导入恢复</button>' +
    '<button class="btn ghost sm" data-act="exportCsv">导出 CSV</button>' +
    '</div><footer>数据保存在本机浏览器；换设备可用「导出备份」与「导入恢复」。</footer></div>';
}

function renderProfilesView() {
  var h = '<div class="card"><h2>' + ic('inbox') + '我的档案</h2>';
  if (!profiles.list.length) {
    h += '<div class="empty">本机还没有档案。<br>新建一个，或先看看示例演示。</div>';
  }
  profiles.list.forEach(function (p) {
    var s = readState(p.id);
    var n = s ? recordCount(s) : 0;
    var cur = p.id === profiles.activeId;
    h += '<div class="task"><div class="ico">' + ic('user') + '</div>' +
      '<div class="mid"><div class="nm">' + esc(p.name) + (cur ? ' <span class="tag ok">当前</span>' : '') + '</div>' +
      '<div class="sub">' + n + ' 条记录 · 最后保存 ' + fmtTime(s ? s.meta.updatedAt : p.updatedAt) + '</div></div>' +
      '<div class="act"><div class="row">' +
      '<button class="btn primary sm" data-act="openProfile" data-id="' + p.id + '">打开</button>' +
      (ui.authed ? '<button class="btn red sm" data-act="delProfile" data-id="' + p.id + '">' + (ui.confirmDel === p.id ? '确认删除' : ic('trash')) + '</button>' : '') +
      '</div></div></div>';
  });
  if (ui.authed || !profiles.list.length) {
    h += '<label style="margin-top:12px">新建档案（填孩子昵称）</label>' +
      '<div class="row"><input type="text" id="newProfileName" placeholder="例：小明" style="flex:1;min-width:160px">' +
      '<button class="btn primary" data-act="newProfile">' + ic('plus') + '新建</button></div>';
  } else {
    h += '<div class="note" style="margin-top:12px">已有档案：新建 / 删除需要先在「爸爸妈妈」里解锁。</div>';
  }
  h += '<div class="row" style="margin-top:12px">' +
    '<button class="btn ghost" data-act="demo">' + ic('sprout') + '示例演示</button>' +
    '</div>' +
    '<div class="note" style="margin-top:10px">每个档案的记录各自独立，互不覆盖。示例演示是一个临时沙盘，随便点，不会动到你的档案。</div></div>';
  return h;
}
function renderDemoBanner() {
  if (!ui.demo) return '';
  return '<div class="note" style="display:flex;align-items:center;gap:8px;margin-bottom:14px">' + ic('sprout') +
    '<span style="flex:1"><b>示例演示中</b>：这里随便点，所有改动都不会保存。</span>' +
    '<button class="btn ghost sm" data-act="exitDemo">退出示例</button></div>';
}
function renderProfileBar() {
  if (!state || ui.demo || ui.view === 'profiles') return '';
  return '<div class="card" style="display:flex;align-items:center;gap:10px;padding:12px 16px">' + ic('user') +
    '<div style="flex:1"><b>当前档案：' + esc(state.config.childName) + '</b>' +
    '<div class="muted">' + recordCount(state) + ' 条记录 · ' + fmtTime(state.meta.updatedAt) + '</div></div>' +
    '<button class="btn ghost sm" data-act="goProfiles">切换档案</button></div>';
}

function renderStorageWarn() {
  if (storageOK) return '';
  return '<div class="note red" style="margin-bottom:14px">' + ic('alert') +
    '<b>这台设备现在不允许本页保存数据</b>' +
    '<div style="margin-top:4px">也就是说：关掉页面后，记录会丢。常见原因是从不同入口打开（不同网址或浏览器），浏览器把它们存在了不同的"格子"里。</div>' +
    '<div class="row" style="margin-top:8px"><button class="btn red sm" data-act="exportJson">' + ic('down') + '立即导出备份</button>' +
    '<button class="btn ghost sm" data-act="storageHelp">怎么办？</button></div></div>';
}

/* ============ 统一刷新入口（唯一调度点） ============ */
function refreshAll() {
  var head = renderHeader();
  if (ui.view === 'profiles' || !state) {
    app.innerHTML = renderFatal() + head + renderStorageWarn() + renderProfilesView() + renderFooter();
    renderSync();
    return;
  }
  app.innerHTML = renderFatal() + head + renderDemoBanner() + renderProfileBar() + renderStorageWarn() + renderBackupTip() + renderDemoTip() + renderImportBanner() + renderClearBanner() + renderResetBanner() +
    (ui.mode === 'kid' && !ui.demo ? renderKid() : (ui.demo ? renderKid() : renderParent())) + renderFooter();
  renderSync();
}

/* 页面报错时不再静默：顶部红条显示原因，避免"点了没反应"却查不到 */
var fatalMsg = '';
function renderFatal() {
  if (!fatalMsg) return '';
  return '<div class="note red" style="margin-bottom:14px">' + ic('alert') + '<b>页面出错了</b>' +
    '<div style="margin-top:4px">' + esc(fatalMsg) + '</div>' +
    '<div style="margin-top:6px">请把这段文字截图发给搭建者。你的记录已保存在本机，没有丢。</div></div>';
}
function onFatal(e) {
  if (fatalMsg) return;
  fatalMsg = (e && (e.message || e.type)) || '未知错误';
  try { refreshAll(); } catch (x) { }
}
if (window && typeof window.addEventListener === 'function') window.addEventListener('error', onFatal);
else if (typeof document.addEventListener === 'function') document.addEventListener('error', onFatal);

/* ============ 动作层 ============ */
function applyStreakBonus() {
  var sb = state.config.streakBonus;
  if (!(num(sb.days, 0) > 0 && num(sb.points, 0) > 0)) return;
  // 关键：当天没达标就不发——不能"什么都不做也加分"
  if (!metGoal(today())) return;
  var d = streakDays();
  if (d <= 0 || d % num(sb.days, 3) !== 0) return;
  var exists = state.ledger.some(function (e) { return ledgerKind(e) === 'streak' && e.date === today(); });
  if (exists) return;
  state.ledger.push({ id: uid(), date: today(), delta: num(sb.points, 0), reason: '连续' + d + '天达标奖励', kind: 'streak', ts: Date.now() });
}
function checkin(id) {
  var t = taskById(id); if (!t) { toast('找不到这个任务'); return; }
  var slot = slotOf(t.type), c = findCheckin(id, slot), base = baseOf(t);
  if (c && c.status === 'pending') { toast('「' + t.name + '」已经在等爸妈确认了（+' + num(c.points, base) + ' 分）'); return; }
  if (c && c.status === 'approved') { toast('「' + t.name + '」这次已经记过了（+' + num(c.awarded, c.points) + ' 分）'); return; }
  if (c && c.status === 'rejected') {
    c.status = 'pending'; c.points = base; c.bonus = bonusOf(t); c.awarded = 0; c.withBonus = false;
    c.date = today(); c.slot = slot; c.ts = Date.now();
    saveAll(); refreshAll(); toast('已重新记录，等爸妈确认 +' + base + ' 分'); return;
  }
  var auto = !state.config.confirmRequired;
  var rec = {
    id: uid(), taskId: id, date: today(), slot: slot, status: auto ? 'approved' : 'pending',
    points: base, bonus: bonusOf(t), awarded: auto ? base : 0, withBonus: false, ts: Date.now()
  };
  state.checkins.push(rec);
  if (auto) { state.ledger.push({ id: uid(), date: today(), delta: base, reason: t.name, kind: 'checkin', ts: Date.now() }); applyStreakBonus(); }
  saveAll(); refreshAll();
  toast(auto ? '「' + t.name + '」+' + base + ' 分已到账' : '「' + t.name + '」已记录，等爸妈确认 +' + base + ' 分');
}
function approveCheckin(id, withBonus) {
  var c = null; state.checkins.forEach(function (x) { if (x.id === id) c = x; });
  if (!c || c.status !== 'pending') return;
  var t = taskById(c.taskId);
  var add = withBonus ? Math.max(0, num(c.bonus, 0)) : 0;
  var total = num(c.points, 0) + add;
  c.status = 'approved'; c.awarded = total; c.withBonus = !!withBonus;
  state.ledger.push({ id: uid(), date: c.date, delta: total, reason: (t ? t.name : '任务') + (add ? '（主动）' : ''), kind: 'checkin', ts: Date.now() });
  applyStreakBonus(); saveAll(); refreshAll();
  toast('已通过 +' + total + ' 分' + (add ? '（含主动加成 +' + add + '）' : ''));
}
function rejectCheckin(id) { state.checkins.forEach(function (c) { if (c.id === id && c.status === 'pending') c.status = 'rejected'; }); saveAll(); refreshAll(); }
function redeem(id) {
  var r = rewardById(id); if (!r) return;
  var c = costOf(r); if (balance() < c) return;
  state.redemptions.push({ id: uid(), rewardId: id, date: today(), status: 'pending', cost: c, ts: Date.now() });
  saveAll(); refreshAll(); toast('兑换申请已发送，等爸妈发放');
}
function approveRedeem(id) {
  var r = null; state.redemptions.forEach(function (x) { if (x.id === id) r = x; });
  if (!r || r.status !== 'pending') return;
  if (balance() < r.cost) { toast('积分不够，无法通过。'); return; }
  r.status = 'approved';
  var rw = rewardById(r.rewardId);
  state.ledger.push({ id: uid(), date: today(), delta: -r.cost, reason: '兑换：' + (rw ? rw.name : ''), kind: 'out', ts: Date.now() });
  saveAll(); refreshAll();
}
function rejectRedeem(id) { state.redemptions.forEach(function (r) { if (r.id === id && r.status === 'pending') r.status = 'rejected'; }); saveAll(); refreshAll(); }
function collectEdits() {
  document.querySelectorAll('[data-f]').forEach(function (el) {
    var id = el.getAttribute('data-id'), f = el.getAttribute('data-f'), o;
    if (f === 'name' || f === 'points' || f === 'bonus' || f === 'type') {
      o = taskById(id); if (!o) return;
      if (f === 'points') o.points = Math.max(1, num(el.value, 1));
      else if (f === 'bonus') o.bonus = Math.max(0, num(el.value, 0));
      else o[f] = el.value;
    } else if (f === 'rname' || f === 'rcost' || f === 'level') {
      o = rewardById(id); if (!o) return;
      if (f === 'rcost') o.cost = Math.max(1, num(el.value, 1));
      else if (f === 'level') o.level = el.value || '石头';
      else o.name = el.value;
    }
  });
}
function download(name, text, mime) {
  var blob = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
}
function exportJSON() { download('儿童习惯工作台_备份_' + today() + '.json', JSON.stringify(state, null, 2), 'application/json'); }
function exportCSV() {
  var rows = [['日期', '事项', '分值', '类型']];
  state.ledger.forEach(function (e) { rows.push([e.date, e.reason, e.delta, e.delta >= 0 ? '得分' : '兑换/扣分']); });
  state.checkins.forEach(function (c) { var t = taskById(c.taskId); rows.push([c.date, '打卡-' + (t ? t.name : '') + '-' + c.status, c.points, '打卡记录']); });
  download('儿童习惯工作台_流水_' + today() + '.csv', '\ufeff' + rows.map(function (r) { return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(','); }).join('\n'), 'text/csv');
}
var pendingImport = null, pendingClearLogs = false, pendingReset = false;
function importJSON(file) {
  var fr = new FileReader();
  fr.onload = function () {
    try {
      var s = JSON.parse(String(fr.result));
      if (!s || !s.config) throw new Error('格式不对');
      pendingImport = s; refreshAll();
    } catch (e) { toast('导入失败：' + e.message); }
  };
  fr.readAsText(file);
}

/* ============ 事件（唯一入口：改数据 → saveAll → refreshAll） ============ */
document.addEventListener('click', function (ev) {
  var el = ev.target.closest ? ev.target.closest('[data-act]') : null;
  if (!el) return;
  var act = el.getAttribute('data-act'), id = el.getAttribute('data-id'), v = el.getAttribute('data-v');
  if (act === 'goProfiles') { collectEdits(); ui.view = 'profiles'; ui.confirmDel = ''; refreshAll(); }
  else if (act === 'openProfile') {
    profiles.activeId = id; saveProfiles();
    state = readState(id);
    if (!state) { toast('这个档案读不出来'); return; }
    realState = null; ui.demo = false; ui.view = 'app'; ui.authed = false; ui.mode = 'kid';
    refreshAll(); toast('已打开档案：' + state.config.childName);
    cloudPull().then(function (changed) { if (changed) refreshAll(); });
  }
  else if (act === 'newProfile') {
    var nm = (document.getElementById('newProfileName').value || '').trim();
    if (!nm) { toast('先填孩子昵称'); return; }
    var nid = newProfileId();
    var ns = defaults(); ns.config.childName = nm;
    try { localStorage.setItem(stateKey(nid), JSON.stringify(ns)); } catch (e) {}
    profiles.list.push({ id: nid, name: nm, created: today(), updatedAt: Date.now() });
    profiles.activeId = nid; saveProfiles();
    state = ns; ui.view = 'app'; ui.mode = 'kid'; ui.authed = false;
    refreshAll(); cloudPush(); toast('已新建档案：' + nm);
  }
  else if (act === 'delProfile') {
    if (!ui.authed) { toast('请先在爸爸妈妈模式解锁'); return; }
    if (ui.confirmDel !== id) { ui.confirmDel = id; refreshAll(); toast('再点一次确认删除'); return; }
    ui.confirmDel = '';
    profiles.list = profiles.list.filter(function (p) { return p.id !== id; });
    try { localStorage.removeItem(stateKey(id)); } catch (e) {}
    if (profiles.activeId === id) {
      profiles.activeId = profiles.list.length ? profiles.list[0].id : '';
      state = profiles.activeId ? readState(profiles.activeId) : null;
    }
    saveProfiles();
    if (!profiles.activeId) ui.view = 'profiles';
    refreshAll(); toast('档案已删除');
  }
  else if (act === 'demo') {
    if (!ui.demo) realState = state;
    state = demoData(defaults());
    ui.demo = true; ui.view = 'app'; ui.mode = 'kid'; ui.authed = false; ui.pinBuf = '';
    refreshAll(); toast('示例演示模式：改动不会保存');
  }
  else if (act === 'exitDemo') {
    state = realState; realState = null; ui.demo = false; ui.view = 'profiles';
    refreshAll();
  }
  else if (act === 'cloudRestore') {
    var d0 = db();
    if (!d0) { toast('云端没连上（本机是本地模式），无法找回'); return; }
    setSync('busy', '同步中');
    cloudQuery().then(function (rows) {
      var map = {};
      rows.forEach(function (r) { map[r['键']] = r; });
      var plRow = map['profiles'];
      var list = [];
      if (plRow && plRow['内容']) { try { list = JSON.parse(plRow['内容']) || []; } catch (e) {} }
      var states = {};
      rows.forEach(function (r) {
        var k = String(r['键']);
        if (k.indexOf('p:') === 0) states[k.slice(2)] = r['内容'];
        else if (k === 'state' && r['内容']) states.__legacy = r['内容'];
      });
      if (!list.length && states.__legacy) {
        var only = JSON.parse(states.__legacy);
        var lid = newProfileId();
        profiles.list = [{ id: lid, name: only.config.childName || '儿童', created: only.meta.created || today(), updatedAt: only.meta.updatedAt || Date.now() }];
        profiles.activeId = lid; saveProfiles();
        localStorage.setItem(stateKey(lid), states.__legacy);
        state = readState(lid); ui.view = 'app'; refreshAll();
        setSync('on', '已同步'); toast('已从云端找回档案'); return;
      }
      if (!list.length) { setSync('on', '已同步'); toast('云端没有找到任何档案'); return; }
      profiles.list = list.map(function (p) { return { id: p.id, name: p.name, created: p.created, updatedAt: p.updatedAt }; });
      profiles.activeId = profiles.list[0].id;
      saveProfiles();
      profiles.list.forEach(function (p) { if (states[p.id]) { try { localStorage.setItem(stateKey(p.id), states[p.id]); } catch (e) {} } });
      state = readState(profiles.activeId); ui.view = 'app'; ui.mode = 'kid'; refreshAll();
      setSync('on', '已同步'); toast('已从云端找回 ' + profiles.list.length + ' 个档案');
    }).catch(function () { setSync('off', '本地模式'); toast('云端找不回，请检查网络或稍后再试'); });
  }
  else if (act === 'storageHelp') {
    toast('固定用同一个入口打开（推荐加到主屏幕），数据就固定存在同一个"格子"里；换入口可能看不到旧数据。');
  }
  else if (act === 'mode') {
    collectEdits();
    if (!state) { ui.view = 'profiles'; refreshAll(); return; }
    ui.demo = false; ui.view = 'app'; ui.mode = v;
    if (v === 'parent') { ui.authed = false; ui.pinBuf = ''; }
    refreshAll();
  }
  else if (act === 'ptab') { collectEdits(); saveAll(); ui.parentTab = v; refreshAll(); }
  else if (act === 'pin') {
    ui.pinBuf = (ui.pinBuf + v).slice(0, 4);
    if (ui.pinBuf.length === 4) {
      if (ui.pinBuf === currentPin()) { ui.authed = true; ui.pinBuf = ''; refreshAll(); }
      else { ui.pinBuf = ''; toast('密码不对'); refreshAll(); }
    } else refreshAll();
  }
  else if (act === 'pindel') { ui.pinBuf = ui.pinBuf.slice(0, -1); refreshAll(); }
  else if (act === 'pinclr') { ui.pinBuf = ''; refreshAll(); }
  else if (act === 'syncNow') {
    if (!db()) {
      toast('本地模式：请通过备份文件在设备间转移数据。');
      return;
    }
    setSync('busy', '同步中');
    cloudPull().then(function (changed) {
      if (changed) refreshAll();
      cloudPush();
      setTimeout(function () { toast('同步完成 · ' + fmtTime(state && state.meta ? state.meta.updatedAt : 0)); }, 900);
    }).catch(function () { setSync('off', '本地模式'); toast('同步失败，检查网络后重试'); });
  }
  else if (act === 'checkin') checkin(id);
  else if (act === 'redeem') redeem(id);
  else if (act === 'apprCk') approveCheckin(id, false);
  else if (act === 'apprCkB') approveCheckin(id, true);
  else if (act === 'rejCk') rejectCheckin(id);
  else if (act === 'apprRd') approveRedeem(id);
  else if (act === 'rejRd') rejectRedeem(id);
  else if (act === 'adjust') {
    var p = num(document.getElementById('adjPts').value, 0);
    var why = (document.getElementById('adjWhy').value || '').trim();
    var dd = (document.getElementById('adjDate').value || today()).trim();
    if (!p) { toast('分值不能为 0'); return; }
    if (!why) why = p > 0 ? '临时加分' : '临时扣分';
    state.ledger.push({ id: uid(), date: dd, delta: p, reason: why, kind: 'manual', ts: Date.now() });
    saveAll(); refreshAll(); toast((p > 0 ? '+' : '') + p + ' 分已记录');
  }
  else if (act === 'setAdj') { var ip = document.getElementById('adjPts'); if (ip) { ip.value = v; toast('分值设为 ' + v); } }
  else if (act === 'saveRules') {
    collectEdits();
    var c = state.config;
    c.childName = (document.getElementById('cfgName').value || '儿童').trim();
    c.dailyGoal = Math.max(1, num(document.getElementById('cfgGoal').value, 8));
    c.streakBonus.days = Math.max(1, num(document.getElementById('cfgSD').value, 3));
    c.streakBonus.points = Math.max(0, num(document.getElementById('cfgSP').value, 2));
    c.fade.earnRate = Math.max(0.1, num(document.getElementById('fadeEarn').value, 1));
    c.fade.redeemRate = Math.max(0.1, num(document.getElementById('fadeRedeem').value, 1));
    var pin = (document.getElementById('cfgPin').value || '').trim();
    if (/^\d{4}$/.test(pin)) c.parentPin = pin; else toast('密码必须是 4 位数字，未修改。');
    c.confirmRequired = document.getElementById('cfgConfirm').checked;
    saveAll(); refreshAll();
  }
  else if (act === 'saveTasks') { collectEdits(); saveAll(); refreshAll(); }
  else if (act === 'addTask') { collectEdits(); state.config.tasks.push({ id: uid(), name: '新任务', type: 'daily', points: 2, bonus: 0, active: true }); saveAll(); refreshAll(); }
  else if (act === 'delTask') { state.config.tasks = state.config.tasks.filter(function (t) { return t.id !== id; }); saveAll(); refreshAll(); toast('任务已删除'); }
  else if (act === 'toggleTask') { collectEdits(); state.config.tasks.forEach(function (t) { if (t.id === id) t.active = !t.active; }); saveAll(); refreshAll(); }
  else if (act === 'addReward') { collectEdits(); state.config.rewards.push({ id: uid(), name: '新奖励', cost: 50, level: '石头', active: true }); saveAll(); refreshAll(); }
  else if (act === 'delReward') { state.config.rewards = state.config.rewards.filter(function (r) { return r.id !== id; }); saveAll(); refreshAll(); toast('奖励已删除'); }
  else if (act === 'toggleReward') { collectEdits(); state.config.rewards.forEach(function (r) { if (r.id === id) r.active = !r.active; }); saveAll(); refreshAll(); }
  else if (act === 'fade') {
    var p = null; FADE.forEach(function (x) { if (x.s === num(v, 1)) p = x; });
    if (p) { state.config.fade.stage = p.s; state.config.fade.earnRate = p.e; state.config.fade.redeemRate = p.r; if (p.s === 4) state.config.confirmRequired = false; saveAll(); refreshAll(); }
  }
  else if (act === 'addNote') {
    var txt = (document.getElementById('noteText').value || '').trim();
    if (!txt) { toast('写点什么再保存'); return; }
    state.notes.push({ id: uid(), date: today(), text: txt }); saveAll(); refreshAll();
  }
  else if (act === 'exportJson') exportJSON();
  else if (act === 'exportCsv') exportCSV();
  else if (act === 'importJson') {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json'; inp.hidden = true; inp.id = 'backup-file-input'; document.body.appendChild(inp);
    inp.onchange = function () { if (inp.files && inp.files[0]) importJSON(inp.files[0]); inp.remove(); };
    inp.click();
  }
  else if (act === 'clearDemo') {
    state.checkins = state.checkins.filter(function (c) { return !c.demo; });
    state.ledger = state.ledger.filter(function (e) { return !e.demo; });
    saveAll(); refreshAll(); toast('示例已清空');
  }
  else if (act === 'dismissTip') { state.meta.tipDismissed = true; saveAll(); refreshAll(); }
  else if (act === 'confirmImport') {
    if (!pendingImport) return;
    state = pendingImport; pendingImport = null;
    saveLocal(); cloudPush(); refreshAll();
    toast('导入成功：任务 ' + state.config.tasks.length + ' 项、流水 ' + state.ledger.length + ' 条。');
  }
  else if (act === 'cancelImport') { pendingImport = null; refreshAll(); }
  else if (act === 'setStart') {
    state.config.startBonus = balance();
    state.checkins = []; state.redemptions = []; state.ledger = [];
    saveAll(); refreshAll(); toast('已设为起始分 ' + state.config.startBonus + '，明天起重新打卡');
  }
  else if (act === 'clearLogs') { pendingClearLogs = true; refreshAll(); }
  else if (act === 'confirmClearLogs') { pendingClearLogs = false; state.checkins = []; state.redemptions = []; state.ledger = []; saveAll(); refreshAll(); toast('流水已清空'); }
  else if (act === 'cancelClearLogs') { pendingClearLogs = false; refreshAll(); }
  else if (act === 'resetAll') { pendingReset = true; refreshAll(); }
  else if (act === 'confirmReset') {
    pendingReset = false;
    var keepName = state ? state.config.childName : '儿童';
    state = defaults(); state.config.childName = keepName;
    ui.authed = false; ui.pinBuf = '';
    saveAll(); refreshAll(); toast('已重置当前档案（任务与记录回到初始）');
  }
  else if (act === 'cancelReset') { pendingReset = false; refreshAll(); }
});
document.addEventListener('change', function (ev) {
  var el = ev.target;
  if (el && el.getAttribute && el.getAttribute('data-f')) { collectEdits(); saveAll(); }
});

/* ============ 初始化（固定顺序，一次性） ============ */
checkStorage();
state = loadLocal();
/* 提报演示版：首次打开自动建一份「儿童」示例档案，直接进工作台，不让评委先面对空档案页 */
if (!state) {
  var _bid = newProfileId();
  var _bs = demoData(defaults());
  _bs.meta.created = today();
  profiles.list = [{ id: _bid, name: _bs.config.childName, created: today(), updatedAt: Date.now() }];
  profiles.activeId = _bid;
  saveProfiles();
  try { localStorage.setItem(stateKey(_bid), JSON.stringify(_bs)); } catch (e) {}
  state = _bs;
}
refreshAll();
if (db()) {
  cloudPull().then(function () { refreshAll(); if (state && !ui.demo) cloudPush(); });
} else { setSync('off', '本地模式'); }
if (db() && typeof db().onUpdated === 'function') {
  db().onUpdated(function (p) {
    var ids = (p && p.databaseIds) || [];
    if (ids.indexOf(DB_ID) === -1) return;
    if (sync.busy) return;
    cloudPull().then(function (changed) { if (changed) refreshAll(); });
  });
}
/* 切回页面时自动拉一次云端：多端轮流打开也不会各自停在旧数据上 */
var lastAutoPull = 0;
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState !== 'visible') return;
  if (!db() || ui.demo || !profiles.activeId) return;
  if (Date.now() - lastAutoPull < 60000) return;
  lastAutoPull = Date.now();
  cloudPull().then(function (changed) { if (changed) refreshAll(); });
});
})();
