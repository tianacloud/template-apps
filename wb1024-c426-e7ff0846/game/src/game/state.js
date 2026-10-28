// 游戏状态层：角色、背包、任务、掉落、存档序列化。
// 战斗数值不在这里算，这里只管「玩家拥有什么、任务进行到哪」。

import { bus, clamp, mulberry32 } from '../core/util.js';
import {
  DATA, emptyEquip, SLOTS, slotForItem, itemById, itemScore,
  derivePlayer, xpForLevel, QUALITY,
} from '../data/gamedata.js';

export const MAX_LEVEL = 40;

/** 任务可提前多少级接取（避免卡等级造成任务链断档） */
export const QUEST_LEVEL_GRACE = 3;

export const G = {
  player: null,
  quests: { active: {}, done: [] },
  tracked: null,
  world: { unlockedZones: ['barrens'], flight: ['barrens'], bossesKilled: [], cleared: [], visited: ['barrens'] },
  companions: { unlocked: [], active: [] },
  difficulty: 'normal',
  zoneId: 'barrens',
  dungeonId: null,
  playtime: 0,
  started: 0,
};

let ctx = { engine: null, world: null };
export function setContext(c) { ctx = { ...ctx, ...c }; }
export function engine() { return ctx.engine; }

export function touch(evt = 'changed', payload) {
  bus.emit('changed');
  if (evt) bus.emit(evt, payload);
}

export function log(text, tone = 'system') {
  bus.emit('log', { text, tone });
}

// ---------- 角色 ----------
export function createPlayer({ name, classId, difficulty }) {
  G.player = {
    name: name || '无名者',
    classId,
    level: 1,
    xp: 0,
    gold: 40,
    hp: null,
    res: null,
    pos: { x: 0, z: 6 },
    equip: emptyEquip(),
    bag: new Array(40).fill(null),
    bagSlots: 40,
    talent: [null, null],
    talentPoints: 0,
  };
  G.quests = { active: {}, done: [] };
  G.tracked = null;
  G.world = { unlockedZones: ['barrens'], flight: ['barrens'], bossesKilled: [], cleared: [], visited: ['barrens'] };
  G.companions = { unlocked: [], active: [] };
  G.difficulty = difficulty || 'normal';
  G.zoneId = 'barrens';
  G.dungeonId = null;
  G.playtime = 0;
  G.started = Date.now();
  // 初始装备与补给
  G.player.equip.mainhand = starterWeapon(classId);
  addItem('potion', 3, true);
  addItem('ration', 3, true);
  return G.player;
}

function starterWeapon(classId) {
  const map = { warrior: 'w1_axe', rogue: 'w1_dagger', mage: 'w1_staff', priest: 'w1_mace' };
  return map[classId] || 'w1_axe';
}

// 起始武器不在表里就算了，兜底给一把斧
function ensureStarter(id) {
  return itemById(id) ? id : 'w1_axe';
}

// ---------- 背包 ----------
export function bagUsed() {
  return G.player.bag.filter(Boolean).length;
}

export function addItem(id, count = 1, silent = false) {
  const def = itemById(id);
  if (!def) return false;
  const maxStack = def.stack || 1;
  let left = count;
  if (maxStack > 1) {
    for (const slot of G.player.bag) {
      if (slot && slot.id === id && slot.count < maxStack) {
        const add = Math.min(maxStack - slot.count, left);
        slot.count += add;
        left -= add;
        if (!left) break;
      }
    }
  }
  while (left > 0) {
    const idx = G.player.bag.findIndex((s, i) => !s && i < G.player.bagSlots);
    if (idx < 0) {
      log('背包已满，物品掉落在地上（未拾取）。', 'warn');
      touch(); return false;
    }
    const add = Math.min(maxStack, left);
    G.player.bag[idx] = { id, count: add };
    left -= add;
  }
  if (!silent) {
    const q = QUALITY[def.quality] || QUALITY.common;
    log(`你获得了物品：[${def.name}]${count > 1 ? ' ×' + count : ''}`, 'loot:' + q.color);
  }
  syncCollectObjectives();
  touch();
  return true;
}

export function countItem(id) {
  let n = 0;
  for (const s of G.player.bag) if (s && s.id === id) n += s.count;
  return n;
}

export function removeItem(id, count = 1) {
  let left = count;
  for (let i = 0; i < G.player.bag.length && left > 0; i++) {
    const s = G.player.bag[i];
    if (!s || s.id !== id) continue;
    const take = Math.min(s.count, left);
    s.count -= take;
    left -= take;
    if (s.count <= 0) G.player.bag[i] = null;
  }
  syncCollectObjectives();
  touch();
  return left === 0;
}

export function sellItem(index) {
  const slot = G.player.bag[index];
  if (!slot) return;
  const def = itemById(slot.id);
  const price = Math.max(1, Math.round((def?.price || 10) * 0.25)) * slot.count;
  G.player.gold += price;
  G.player.bag[index] = null;
  log(`你把 [${def.name}] 卖给了商人，获得 ${price} 铜。`, 'money');
  touch();
}

// ---------- 装备 ----------
export function useBagItem(index) {
  const slot = G.player.bag[index];
  if (!slot) return;
  const def = itemById(slot.id);
  if (!def) return;
  if (def.slot !== 'none') { equipFromBag(index); return; }
  if (slot.id === 'mount_riding') {
    if (G.player.level < 15) { log('需要 15 级才能骑乘。', 'warn'); return; }
    if (G.player.hasMount) { log('你已经有一匹了。', 'system'); return; }
    G.player.hasMount = true;
    removeItem('mount_riding', 1);
    if (ctx.engine?.player) ctx.engine.player.mounted = true;
    log('你学会了骑乘：战斗外移动速度提高 60%。', 'unlock');
    return;
  }
  if (slot.id === 'potion' || slot.id === 'ration') {
    log('战斗中点动作条上的对应格子使用。', 'system');
    return;
  }
  log(`${def.name} 现在用不上。`, 'system');
}

export function equipFromBag(index) {
  const slot = G.player.bag[index];
  if (!slot) return;
  const def = itemById(slot.id);
  if (!def || def.slot === 'none') return;
  const target = slotForItem(def, G.player.equip);
  const prev = G.player.equip[target];
  G.player.equip[target] = slot.id;
  G.player.bag[index] = prev ? { id: prev, count: 1 } : null;
  if (prev) log(`你换下了 [${itemById(prev).name}]。`, 'system');
  log(`你装备了 [${def.name}]。`, 'loot:' + (QUALITY[def.quality] || QUALITY.common).color);
  recalc();
  touch();
}

export function unequip(slot) {
  const id = G.player.equip[slot];
  if (!id) return;
  if (bagUsed() >= G.player.bagSlots) { log('背包已满，无法卸下。', 'warn'); return; }
  G.player.equip[slot] = null;
  addItem(id, 1, true);
  recalc();
  touch();
}

export function recalc() {
  const e = ctx.engine;
  if (e && G.player) e.recalcPlayer(G.player);
  touch();
}

export function compareItem(def) {
  const cur = G.player.equip[slotForItem(def, G.player.equip)];
  const curDef = cur ? itemById(cur) : null;
  return { cur: curDef, delta: itemScore(def) - itemScore(curDef) };
}

// ---------- 经验与等级 ----------
export function addXp(amount) {
  const p = G.player;
  if (p.level >= MAX_LEVEL) return;
  p.xp += amount;
  log(`你获得了 ${amount} 点经验。`, 'xp');
  let leveled = false;
  while (p.level < MAX_LEVEL && p.xp >= xpForLevel(p.level)) {
    p.xp -= xpForLevel(p.level);
    p.level += 1;
    leveled = true;
    log(`你升到了 ${p.level} 级！`, 'levelup');
    bus.emit('levelup', p.level);
    if (p.level === 10 || p.level === 20) {
      log('你获得了一个天赋选择（按 N 打开天赋面板）。', 'system');
    }
  }
  if (leveled) {
    recalc();
    const e = ctx.engine;
    if (e?.player) { e.player.hp = e.player.maxHp; e.player.res = e.player.maxRes; }
  }
  touch();
}

// ---------- 任务 ----------
export function questState(qid) {
  return G.quests.active[qid] || null;
}

export function isQuestDone(qid) { return G.quests.done.includes(qid); }

export function questAvailable(qid) {
  const q = DATA.quests[qid];
  if (!q || !G.player) return false;
  if (G.quests.active[qid] || isQuestDone(qid)) return false;
  if (G.player.level < (q.level || 1) - QUEST_LEVEL_GRACE) return false;
  for (const pre of q.prereq || []) if (!isQuestDone(pre)) return false;
  return true;
}

export function acceptQuest(qid) {
  const q = DATA.quests[qid];
  if (!q || !questAvailable(qid)) return false;
  G.quests.active[qid] = { obj: q.objectives.map(() => 0), at: Date.now() };
  log(`接受任务：[${q.title}]`, 'quest');
  syncCollectObjectives();
  bus.emit('questAccept', qid);
  bus.emit('autosave');
  touch();
  return true;
}

/** 指定任务日志里追踪哪一条；传空则恢复自动（可交 > 第一个进行中） */
export function setTrackedQuest(qid) {
  if (qid && !G.quests.active[qid]) return false;
  G.tracked = qid || null;
  bus.emit('autosave');
  touch();
  return true;
}

export function abandonQuest(qid) {
  delete G.quests.active[qid];
  if (G.tracked === qid) G.tracked = null;
  touch();
}

export function questReady(qid) {
  const q = DATA.quests[qid];
  const st = G.quests.active[qid];
  if (!q || !st) return false;
  return q.objectives.every((o, i) => (st.obj[i] || 0) >= (o.count || 1));
}

export function progressObjective(kind, target, amount = 1) {
  let changed = false;
  for (const [qid, st] of Object.entries(G.quests.active)) {
    const q = DATA.quests[qid];
    q.objectives.forEach((o, i) => {
      const need = o.count || 1;
      if (o.kind !== kind || o.target !== target) return;
      const cur = st.obj[i] || 0;
      if (cur >= need) return;
      st.obj[i] = Math.min(need, cur + amount);
      changed = true;
      log(`${q.title}：${o.label} ${st.obj[i]}/${need}`, 'quest');
    });
    if (changed && questReady(qid)) {
      log(`任务完成：[${q.title}] —— 回去交任务。`, 'questready');
      bus.emit('questReady', qid);
    }
  }
  if (changed) touch();
}

function syncCollectObjectives() {
  if (!G.player) return;
  for (const [qid, st] of Object.entries(G.quests.active)) {
    const q = DATA.quests[qid];
    q.objectives.forEach((o, i) => {
      if (o.kind === 'collect') {
        const n = Math.min(o.count, countItem(o.target));
        if (n !== st.obj[i]) st.obj[i] = n;
      }
    });
  }
}

export function turnInQuest(qid) {
  const q = DATA.quests[qid];
  if (!q || !questReady(qid)) return null;
  delete G.quests.active[qid];
  if (G.tracked === qid) G.tracked = null;
  if (!G.quests.done.includes(qid)) G.quests.done.push(qid);
  const r = q.rewards || {};
  if (r.xp) addXp(r.xp);
  if (r.gold) { G.player.gold += r.gold; log(`你获得了 ${r.gold} 铜。`, 'money'); }
  if (r.item) addItem(r.item, 1);
  purgeObsoleteQuestItems();
  if (q.unlockZone && !G.world.unlockedZones.includes(q.unlockZone)) {
    G.world.unlockedZones.push(q.unlockZone);
    G.world.flight.push(q.unlockZone);
    log(`你解锁了新的区域：${DATA.zones[q.unlockZone].name}。`, 'unlock');
  }
  if (q.unlockCompanion && !G.companions.unlocked.includes(q.unlockCompanion)) {
    G.companions.unlocked.push(q.unlockCompanion);
    log(`新的队友加入：[${DATA.companions[q.unlockCompanion].name}]（按 P 编队）。`, 'unlock');
  }
  // 后续任务自动进入可接状态，但需要回 NPC 处接
  if (q.next) log(`新任务可接：[${DATA.quests[q.next].title}]`, 'quest');
  bus.emit('questDone', qid);
  bus.emit('autosave');
  touch();
  return r;
}

/** 任务物品：当前进行中的任务还需要几个（不需要返回 0） */
export function questNeedFor(itemId) {
  let need = 0;
  for (const [qid, st] of Object.entries(G.quests.active)) {
    const q = DATA.quests[qid];
    if (!q) continue;
    q.objectives.forEach((o, i) => {
      if (o.kind === 'collect' && o.target === itemId) {
        need = Math.max(need, (o.count || 1) - (st.obj[i] || 0));
      }
    });
  }
  return need;
}

/** 背包里已有多少个该物品 */
export function bagCount(itemId) {
  let n = 0;
  for (const slot of G.player.bag) if (slot && slot.id === itemId) n += slot.count;
  return n;
}

/** 这个任务物品是不是已经彻底没用了（所有引用它的任务都已完成） */
function isObsoleteQuestItem(itemId) {
  const def = itemById(itemId);
  if (!def || !def.quest) return false;
  const users = Object.values(DATA.quests).filter((q) =>
    (q.objectives || []).some((o) => o.kind === 'collect' && o.target === itemId)
  );
  if (!users.length) return true;
  return users.every((q) => G.quests.done.includes(q.id));
}

/** 清掉过期任务物品（任务已交付后残留的那些） */
export function purgeObsoleteQuestItems() {
  let removed = 0;
  const names = new Set();
  G.player.bag.forEach((slot, i) => {
    if (!slot) return;
    if (!isObsoleteQuestItem(slot.id)) return;
    const def = itemById(slot.id);
    if (def) names.add(def.name);
    removed += slot.count;
    G.player.bag[i] = null;
  });
  if (removed > 0) {
    log(`清理了 ${removed} 件已经用不上的任务物品（${[...names].join('、')}）。`, 'system');
    touch();
  }
  return removed;
}

/** 主动丢弃一件物品（任务物品也能丢） */
export function discardItem(index) {
  const slot = G.player.bag[index];
  if (!slot) return;
  const def = itemById(slot.id);
  G.player.bag[index] = null;
  log(`丢弃了 [${def ? def.name : slot.id}] ×${slot.count}。`, 'system');
  touch();
}

// ---------- 战斗事件 ----------
export function onMonsterKilled(ent) {
  const monsterId = ent.meta?.monsterId;
  addXp(Math.round(ent.xpValue || 10));
  const [g0, g1] = ent.goldRange || [1, 3];
  const gold = Math.round(g0 + Math.random() * (g1 - g0));
  G.player.gold += gold;
  progressObjective('kill', monsterId, 1);

  const rng = mulberry32((Date.now() ^ (ent.x * 31 + ent.z * 17)) >>> 0);
  const drops = [];
  // 任务物品：只在还有任务需要、并且没攒够时掉落
  const questLootOk = (id) => {
    const def = itemById(id);
    if (!def || !def.quest) return true;
    const need = questNeedFor(id);
    if (need <= 0) return false;
    return bagCount(id) + drops.filter((d) => d.id === id).reduce((a, d) => a + d.count, 0) < need;
  };
  if (ent.lootTable) {
    for (const l of ent.lootTable) {
      if (rng() < l.chance && questLootOk(l.id)) drops.push({ id: l.id, count: 1 });
    }
  }
  if (ent.lootPool) {
    for (const id of ent.lootPool.guaranteed || []) drops.push({ id, count: 1 });
    const pool = (ent.lootPool.random || []).slice();
    for (let i = 0; i < (ent.lootPool.pick || 0) && pool.length; i++) {
      const idx = Math.floor(rng() * pool.length);
      drops.push({ id: pool[idx], count: 1 });
      pool.splice(idx, 1);
    }
  }
  if (ent.boss) G.world.bossesKilled.push(monsterId);
  const merged = [];
  for (const d of drops) {
    const ex = merged.find((m) => m.id === d.id);
    if (ex) ex.count += d.count; else merged.push(d);
  }
  for (const d of merged) addItem(d.id, d.count);
  bus.emit('kill', { ent, gold, drops: merged });
  touch();
  return { gold, drops: merged };
}

// 兼容入口：把引擎的 death 事件交给任务/经验/掉落
export function handleDeath(ent) {
  if (!ent || ent.side !== 'enemy') return null;
  const res = onMonsterKilled(ent);
  if (ent.boss) progressObjective('dungeon', ent.meta?.monsterId, 1);
  return res;
}

// ---------- 世界 ----------
export function unlockZone(zoneId) {
  if (!G.world.unlockedZones.includes(zoneId)) {
    G.world.unlockedZones.push(zoneId);
    G.world.flight.push(zoneId);
    log(`你发现了新的区域：${DATA.zones[zoneId].name}。`, 'unlock');
  }
}

export function setDifficulty(d) {
  G.difficulty = d;
  log(`难度已切换为：${{ story: '剧情', normal: '普通', challenge: '挑战' }[d]}`, 'system');
  bus.emit('difficultyChanged', d);
  touch();
}

// ---------- 天赋 ----------
export function talentChoices(cls) {
  return DATA.talents[cls] || [];
}

export function pickTalent(talentId) {
  const list = DATA.talents[G.player.classId];
  const t = list.find((x) => x.id === talentId);
  if (!t) return false;
  const idx = t.tier === 10 ? 0 : 1;
  if (G.player.level < t.tier) return false;
  G.player.talent[idx] = talentId;
  log(`你选择了天赋：[${t.name}]`, 'system');
  recalc();
  return true;
}

// ---------- 序列化 ----------
export function serialize() {
  const p = G.player;
  const e = ctx.engine;
  return {
    version: 1,
    ts: Date.now(),
    playtime: G.playtime,
    player: {
      name: p.name, classId: p.classId, level: p.level, xp: p.xp, gold: p.gold,
      hp: Math.round(e?.player?.hp ?? p.hp ?? 1), res: Math.round(e?.player?.res ?? 0),
      pos: { x: +(e?.player?.x ?? p.pos.x).toFixed(2), z: +(e?.player?.z ?? p.pos.z).toFixed(2) },
      equip: p.equip, bag: p.bag, bagSlots: p.bagSlots, talent: p.talent, hasMount: !!p.hasMount,
    },
    quests: G.quests,
    tracked: G.tracked || null,
    world: G.world,
    companions: G.companions,
    difficulty: G.difficulty,
    zoneId: G.zoneId,
    dungeonId: G.dungeonId,
  };
}

export function applySave(data) {
  if (!data || !data.player) throw new Error('存档格式不正确：缺少角色数据');
  const p = data.player;
  const classId = DATA.classes[p.classId] ? p.classId : 'warrior';

  // 装备：过滤掉已经不存在的物品
  const equip = emptyEquip();
  for (const slot of SLOTS) {
    const id = p.equip?.[slot];
    equip[slot] = id && itemById(id) ? id : null;
  }
  if (!equip.mainhand) equip.mainhand = starterWeapon(classId);

  // 任务：丢掉已经不存在的任务 id，补齐进度数组
  const active = {};
  for (const [qid, st] of Object.entries(data.quests?.active || {})) {
    const def = DATA.quests[qid];
    if (!def || !st) continue;
    const obj = Array.isArray(st.obj) ? st.obj.slice(0, def.objectives.length) : [];
    while (obj.length < def.objectives.length) obj.push(0);
    active[qid] = { obj: obj.map((n) => Math.max(0, Number(n) || 0)), at: st.at || Date.now() };
  }
  const done = (data.quests?.done || []).filter((id) => DATA.quests[id]);

  // 队友：过滤未知 id
  const unlocked = (data.companions?.unlocked || []).filter((id) => DATA.companions[id]);
  const party = (data.companions?.active || []).filter((id) => DATA.companions[id]).slice(0, 2);

  G.player = {
    ...p,
    name: String(p.name || '无名者').slice(0, 16),
    classId,
    level: clamp(Number(p.level) || 1, 1, MAX_LEVEL),
    xp: Math.max(0, Number(p.xp) || 0),
    gold: Math.max(0, Number(p.gold) || 0),
    bag: normalizeBag(p.bag),
    bagSlots: clamp(Number(p.bagSlots) || 40, 40, 80),
    equip,
    talent: Array.isArray(p.talent) ? p.talent.slice(0, 2) : [null, null],
    hasMount: !!p.hasMount,
    pos: (p.pos && Number.isFinite(p.pos.x) && Number.isFinite(p.pos.z)) ? p.pos : { x: 0, z: 6 },
  };
  G.quests = { active, done };
  G.tracked = active[data.tracked] ? data.tracked : null;
  const w = data.world || {};
  G.world = {
    unlockedZones: (w.unlockedZones || ['barrens']).filter((id) => DATA.zones[id]),
    flight: (w.flight || ['barrens']).filter((id) => DATA.zones[id]),
    bossesKilled: w.bossesKilled || [],
    cleared: (w.cleared || []).filter((id) => DATA.dungeons[id]),
    visited: w.visited || ['barrens'],
  };
  if (!G.world.unlockedZones.length) G.world.unlockedZones = ['barrens'];
  if (!G.world.flight.length) G.world.flight = ['barrens'];
  G.companions = { unlocked, active: party };
  G.difficulty = ['story', 'normal', 'challenge'].includes(data.difficulty) ? data.difficulty : 'normal';
  G.zoneId = DATA.zones[data.zoneId] ? data.zoneId : 'barrens';
  G.dungeonId = null;
  G.playtime = data.playtime || 0;
  G.started = Date.now();
  // 读档时静默清掉已经用不上的任务物品（旧存档里可能堆积了）
  for (let i = 0; i < G.player.bag.length; i++) {
    const slot = G.player.bag[i];
    if (slot && isObsoleteQuestItem(slot.id)) G.player.bag[i] = null;
  }
  return G;
}

function normalizeBag(bag) {
  const arr = new Array(80).fill(null);
  (bag || []).forEach((s, i) => { if (s && itemById(s.id)) arr[i] = s; });
  return arr;
}

export function xpPct() {
  if (!G.player) return 0;
  if (G.player.level >= MAX_LEVEL) return 1;
  return clamp(G.player.xp / xpForLevel(G.player.level), 0, 1);
}

export function playerStats() {
  return G.player ? derivePlayer(G.player) : null;
}

export function setParty(ids) {
  // 只保留真实存在、且不重复的队友 id，最多两名
  const clean = [];
  for (const id of ids || []) {
    if (!DATA.companions[id] || clean.includes(id)) continue;
    clean.push(id);
    if (clean.length >= 2) break;
  }
  G.companions.active = clean;
  bus.emit('partyChanged', G.companions.active);
  bus.emit('autosave');
  touch();
}