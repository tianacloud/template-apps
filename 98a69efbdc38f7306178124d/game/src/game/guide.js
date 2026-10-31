// 任务指引：算出「现在该往哪走」，供屏幕箭头、任务追踪和小地图共用。
// 只读数据表与引擎状态，不做任何写入。

import { DATA } from '../data/gamedata.js';
import { G, engine, questAvailable, questReady } from './state.js';

function npcInZone(id, zoneId) {
  const z = DATA.zones[zoneId];
  const n = (z?.npcs || []).find((x) => x.id === id);
  return n ? { ...n, zone: zoneId } : null;
}

export function findNpc(id) {
  const here = npcInZone(id, G.zoneId);
  if (here) return here;
  for (const z of Object.values(DATA.zones)) {
    const n = (z.npcs || []).find((x) => x.id === id);
    if (n) return { ...n, zone: z.id };
  }
  return null;
}

function aliveMonsters(monsterId) {
  const e = engine();
  if (!e) return [];
  const out = [];
  for (const m of e.entities.values()) {
    if (!m.dead && m.side === 'enemy' && m.meta?.monsterId === monsterId) out.push(m);
  }
  return out;
}

function centerOf(list) {
  if (!list.length) return null;
  let x = 0, z = 0;
  for (const m of list) { x += m.x; z += m.z; }
  return { x: x / list.length, z: z / list.length };
}

function spawnCenter(zoneId, monsterId) {
  const z = DATA.zones[zoneId];
  const sp = (z?.spawns || []).filter((s) => s.monster === monsterId);
  if (!sp.length) return null;
  let x = 0, zz = 0;
  for (const s of sp) { x += s.center[0]; zz += s.center[1]; }
  return { x: x / sp.length, z: zz / sp.length };
}

function zoneOfDungeon(dungeonId) {
  for (const z of Object.values(DATA.zones)) {
    if ((z.dungeons || []).some((d) => d.id === dungeonId)) return z.id;
  }
  return null;
}

function droppersOf(itemId) {
  const ids = [];
  for (const m of Object.values(DATA.monsters)) {
    const inLoot = (m.loot || []).some((l) => l.id === itemId);
    const inPool = m.lootPool && [...(m.lootPool.guaranteed || []), ...(m.lootPool.random || [])].includes(itemId);
    if (inLoot || inPool) ids.push(m.id);
  }
  return ids;
}

/** 某条目标的坐标；跨区域时返回 zone 而不是坐标 */
function objectiveTarget(o) {
  const zoneId = G.zoneId;
  const here = (kind) => (kind ? { ...kind, zone: zoneId } : null);

  if (o.kind === 'kill') {
    const alive = aliveMonsters(o.target);
    const c = centerOf(alive) || spawnCenter(zoneId, o.target);
    return here(c ? { x: c.x, z: c.z, label: o.label } : null);
  }
  if (o.kind === 'collect') {
    const alive = droppersOf(o.target).flatMap(aliveMonsters);
    const c = centerOf(alive);
    if (c) return here({ x: c.x, z: c.z, label: o.label });
    const obj = (DATA.zones[zoneId]?.objects || []).find((ob) => ob.id === o.target);
    if (obj?.positions?.length) return here({ x: obj.positions[0][0], z: obj.positions[0][1], label: o.label });
    for (const mid of droppersOf(o.target)) {
      const sp = spawnCenter(zoneId, mid);
      if (sp) return here({ x: sp.x, z: sp.z, label: o.label });
    }
    return null;
  }
  if (o.kind === 'investigate') {
    const lists = [...(DATA.zones[zoneId]?.objects || []), ...(G.dungeonId ? DATA.dungeons[G.dungeonId]?.objects || [] : [])];
    const obj = lists.find((ob) => ob.id === o.target);
    if (!obj?.positions?.length) return null;
    return here({ x: obj.positions[0][0], z: obj.positions[0][1], label: o.label });
  }
  if (o.kind === 'talk') {
    const n = npcInZone(o.target, zoneId) || findNpc(o.target);
    if (!n) return null;
    if (n.zone !== zoneId) {
      const zn = DATA.zones[n.zone]?.name || '别处';
      const locked = !G.world.unlockedZones.includes(n.zone);
      return { otherZone: n.zone, label: `在 ${zn}${locked ? '（区域未解锁）' : ''}`, title: o.label };
    }
    return here({ x: n.pos[0], z: n.pos[1], label: o.label });
  }
  if (o.kind === 'dungeon') {
    const alive = aliveMonsters(o.target);
    const c = centerOf(alive);
    if (c) return here({ x: c.x, z: c.z, label: o.label });
    for (const [did, d] of Object.entries(DATA.dungeons)) {
      if (!(d.bosses || []).some((b) => b.monster === o.target)) continue;
      const dz = zoneOfDungeon(did);
      const portal = (DATA.zones[dz]?.dungeons || []).find((x) => x.id === did);
      if (!portal) continue;
      if (dz !== zoneId) return { otherZone: dz, label: `${d.name} 在 ${DATA.zones[dz].name}`, title: o.label };
      return here({ x: portal.pos[0], z: portal.pos[1], label: `进入 ${d.name}` });
    }
    return null;
  }
  if (o.kind === 'escort') {
    const obj = (DATA.zones[zoneId]?.objects || []).find((ob) => ob.id === o.target);
    if (!obj?.positions?.length) return null;
    return here({ x: obj.positions[0][0], z: obj.positions[0][1], label: o.label });
  }
  return null;
}

function questStep(qid) {
  const q = DATA.quests[qid];
  const st = G.quests.active[qid];
  if (!q || !st) return null;
  if (questReady(qid)) {
    const n = findNpc(q.turnin);
    return {
      qid, title: q.title, ready: true,
      label: n ? `回去找 ${n.name} 交任务` : '回去交任务',
      x: n?.pos?.[0], z: n?.pos?.[1], zone: n?.zone,
    };
  }
  let idx = q.objectives.findIndex((o, i) => (st.obj[i] || 0) < (o.count || 1));
  if (idx < 0) idx = 0;
  const o = q.objectives[idx];
  const t = objectiveTarget(o);
  if (!t) return { qid, title: q.title, label: o.label, none: true };
  return { qid, title: q.title, label: t.title || o.label, x: t.x, z: t.z, otherZone: t.otherZone, zone: t.zone };
}

/** 最近的、有任务可接的 NPC */
function nearestQuestGiver() {
  const p = engine()?.player;
  if (!p) return null;
  let best = null;
  for (const q of Object.values(DATA.quests)) {
    if (!questAvailable(q.id)) continue;
    const n = npcInZone(q.giver, G.zoneId);
    if (!n) continue;
    const d = Math.hypot(n.pos[0] - p.x, n.pos[1] - p.z);
    if (!best || d < best.d) best = { d, n, q };
  }
  if (!best) return null;
  return {
    title: '可接任务',
    label: `${best.n.name} · ${best.q.title}`,
    x: best.n.pos[0], z: best.n.pos[1], zone: G.zoneId,
  };
}

export function currentGuide() {
  // 1) 玩家在任务日志里手动选中的那条，优先
  if (G.tracked && G.quests.active[G.tracked]) return questStep(G.tracked);
  const actives = Object.keys(G.quests.active);
  // 2) 没有手选时：可交的 > 第一个进行中的
  const ready = actives.find((qid) => questReady(qid));
  if (ready) return questStep(ready);
  if (actives.length) return questStep(actives[0]);
  // 3) 一条任务都没有，就指向最近的接任务 NPC
  return nearestQuestGiver();
}

let cache = null;
let cacheAt = 0;
/** 200ms 缓存，屏幕箭头和小地图共用同一份结果 */
export function cachedGuide(now = performance.now()) {
  if (now - cacheAt < 200) return cache;
  cache = currentGuide();
  cacheAt = now;
  return cache;
}
