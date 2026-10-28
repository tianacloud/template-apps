// AI：队友与敌人共用一套 FSM 框架，用优先级规则代替复杂规划。
// 只读引擎状态、只通过引擎 API 行动，不碰渲染。

import { clamp, dist2 } from '../core/util.js';
import { DATA } from '../data/gamedata.js';

const COMP_RANGE = { grom: 5.4, kai: 5.4, lia: 26, selin: 26 };

function enemiesNear(eng, e, r) {
  const out = [];
  for (const x of eng.entities.values()) {
    if (x.dead || x.side === e.side) continue;
    if (dist2(e.x, e.z, x.x, x.z) <= r) out.push(x);
  }
  return out;
}

function inDangerZone(eng, e) {
  for (const g of eng.grounds) {
    const src = eng.get(g.srcId);
    if (!src || src.side === e.side) continue;
    if (dist2(g.x, g.z, e.x, e.z) < g.radius + 0.8) return g;
  }
  return null;
}

function stepOutOf(eng, e, g) {
  const ang = Math.atan2(e.x - g.x, e.z - g.z) || 0;
  const tx = g.x + Math.sin(ang) * (g.radius + 4.5);
  const tz = g.z + Math.cos(ang) * (g.radius + 4.5);
  e.moveTarget = { x: tx, z: tz, stop: 0.6 };
}

function cast(eng, e, sid, tid) {
  const r = eng.useSkill(e.id, sid, tid);
  return !!(r && r.ok);
}

/** 有没有队友血量低于 98%（牧师的“立刻停手去奶”判定） */
function someoneHurt(eng, e) {
  return eng.alliesOf(e).some((a) => !a.dead && a.hp / a.maxHp < 0.98);
}

/** 坦克拉怪：找出正在攻击队友的怪，嘲讽或冲过去抢回来 */
function peelForAllies(eng, e, dt) {
  const p = eng.player;
  const victims = [];
  for (const x of eng.entities.values()) {
    if (x.side === e.side || x.dead) continue;
    if (!x.target || x.target === e.id) continue;
    const t = eng.get(x.target);
    if (!t || t.dead || t.side !== e.side) continue;
    const d = dist2(e.x, e.z, x.x, x.z);
    if (d > 26) continue;
    victims.push({ mob: x, d, hp: x.hp / x.maxHp });
  }
  if (!victims.length) {
    if (e.ai.peelUntil && eng.now > e.ai.peelUntil) e.ai.peelId = null;
    return false;
  }
  // 优先：离自己最近、且血还多的（残血怪不值得交嘲讽）
  victims.sort((a, b) => a.d - b.d || b.hp - a.hp);
  const pick = victims[0].mob;
  e.ai.peelId = pick.id;
  e.ai.peelUntil = eng.now + 6000;
  e.target = pick.id;

  const d = victims[0].d;
  const tauntReady = canUse(eng, e, 'w_taunt');
  if (d <= 19 && tauntReady) {
    cast(eng, e, 'w_taunt', pick.id);
    e.ai.state = 'PEEL';
    // 嘲讽完不返回，让下面的逻辑继续打它，把仇恨吃住
    return false;
  }
  if (d > 4.2) {
    e.moveTarget = { x: pick.x, z: pick.z, stop: 3.2 };
    e.ai.state = 'PEEL';
    moveAlong(eng, e, dt);
    return true;
  }
  e.ai.state = 'PEEL';
  return false;
}

/** 治疗决策：按「会不会死人」的紧急度排序，返回是否已出手 */
function tryHeal(eng, e) {
  const allies = eng.alliesOf(e);
  const pct = (a) => a.hp / a.maxHp;
  const wounded = allies.filter((a) => pct(a) < 0.95).sort((a, b) => pct(a) - pct(b));
  const lowest = wounded[0];
  const bad = allies.filter((a) => pct(a) < 0.7).length;

  // 有队友中了可驱散的负面
  const debuffed = allies.find((a) => a.auras.some((x) => x.debuff && x.kind !== 'root' && x.kind !== 'stun'));
  if (debuffed && canUse(eng, e, 'p_dispel')) {
    if (cast(eng, e, 'p_dispel', debuffed.id)) { e.ai.state = 'HEAL'; return true; }
  }

  // 团血崩了：先开赞美诗，再接群体祷言
  if (bad >= 3 && canUse(eng, e, 'p_hymn')) {
    if (cast(eng, e, 'p_hymn', null)) { e.ai.state = 'HEAL'; return true; }
  }
  if (bad >= 2 && canUse(eng, e, 'p_prayer')) {
    if (cast(eng, e, 'p_prayer', null)) { e.ai.state = 'HEAL'; return true; }
  }

  if (lowest) {
    // 濒死救急
    if (pct(lowest) < 0.36 && canUse(eng, e, 'p_grace')) {
      if (cast(eng, e, 'p_grace', lowest.id)) { e.ai.state = 'HEAL'; return true; }
    }
    // 预判护盾：血线过半就先垫，挡掉一次爆发
    if (pct(lowest) < 0.55 && !lowest.auras.some((a) => a.kind === 'shield') && canUse(eng, e, 'p_shield')) {
      if (cast(eng, e, 'p_shield', lowest.id)) { e.ai.state = 'HEAL'; return true; }
    }
    if (pct(lowest) < 0.72 && canUse(eng, e, 'p_mend')) {
      if (cast(eng, e, 'p_mend', lowest.id)) { e.ai.state = 'HEAL'; return true; }
    }
    // 平时挂回复，避免小伤害拖成重伤
    if (pct(lowest) < 0.99 && !lowest.auras.some((a) => a.id === 'renew') && canUse(eng, e, 'p_renew')) {
      if (cast(eng, e, 'p_renew', lowest.id)) { e.ai.state = 'HEAL'; return true; }
    }
  }
  return false;
}

/** 队友 AI */
export function updateCompanion(eng, e, dt) {
  const now = eng.now;
  const p = eng.player;

  // 施法中：站定；但治疗职业一旦发现有人掉血，立刻断掉自己的输出读条
  if (e.cast) {
    if (e.ai.role === 'healer' && e.cast.skillId === 'p_smite' && someoneHurt(eng, e)) {
      eng.cancelCast(e, true);
    } else {
      e.moveTarget = null;
      return;
    }
  }
  if (!p || p.dead) {
    e.moveTarget = null;
    e.target = null;
    return;
  }

  // 死亡复活计时由引擎处理；这里只处理撤退
  if (now < (e.ai.nextThink || 0)) {
    moveAlong(eng, e, dt);
    return;
  }
  e.ai.nextThink = now + 220;

  const role = e.ai.role;
  const myRange = COMP_RANGE[e.ai.compId] || 5.4;
  const allies = eng.alliesOf(e);
  const hpPct = e.hp / e.maxHp;

  // 1) 站在红圈里 —— 最高优先级，先走出来
  const danger = inDangerZone(eng, e);
  if (danger) {
    stepOutOf(eng, e, danger);
    e.ai.state = 'REPOSITION';
    moveAlong(eng, e, dt);
    return;
  }

  // 2) 坦克：把正在打队友的怪拽回自己身上（优先嘲讽，其次冲过去抢仇恨）
  if (role === 'tank' && peelForAllies(eng, e, dt)) return;

  // 3) 治疗职业：先保人（重伤/团血/驱散/护盾）
  if (role === 'healer' && tryHeal(eng, e)) return;

  // 3) 打断：有敌人正在读可打断的条
  const myInterrupt = { grom: 'w_pummel', lia: 'm_lock', selin: null, kai: null }[e.ai.compId];
  if (myInterrupt) {
    const caster = enemiesNear(eng, e, 28).find(
      (x) => x.cast && x.cast.interruptible && now < x.cast.end - 120
    );
    if (caster && canUse(eng, e, myInterrupt)) {
      if (dist2(e.x, e.z, caster.x, caster.z) > (DATA.skills[myInterrupt].range || 5) - 1 && e.ai.compId !== 'lia') {
        e.moveTarget = { x: caster.x, z: caster.z, stop: 3.5 };
        e.ai.state = 'ENGAGE';
      } else {
        eng.useSkill(e.id, myInterrupt, caster.id);
        e.ai.state = 'ATTACK';
      }
      moveAlong(eng, e, dt);
      return;
    }
  }

  // 4) 自身濒死且队里没有治疗 → 后撤
  const hasHealer = allies.some((a) => a.ai?.role === 'healer' && !a.dead);
  if (hpPct < 0.25 && (!hasHealer || e.ai.compId === 'selin')) {
    const threat = enemiesNear(eng, e, 22)[0];
    if (threat) {
      const ang = Math.atan2(e.x - threat.x, e.z - threat.z);
      e.moveTarget = { x: p.x + Math.sin(ang) * 6, z: p.z + Math.cos(ang) * 6, stop: 1 };
      e.ai.state = 'RETREAT';
      moveAlong(eng, e, dt);
      return;
    }
  }

  // 5) 选目标：先打玩家正在打的那个
  const cmd = e.ai.command || 'follow';
  const peeling = e.ai.peelId ? eng.get(e.ai.peelId) : null;
  const inCombat = peeling && !peeling.dead ? true : (cmd === 'attack' ? true : (p.inCombat || e.inCombat || allies.some((a) => a.inCombat)));
  let target = null;
  if (cmd === 'stay') {
    target = enemiesNear(eng, e, myRange + 4).filter((x) => x.inCombat)[0] || null;
    e.target = target ? target.id : null;
    if (!target) { e.moveTarget = null; e.ai.state = 'FOLLOW'; return; }
  }
  if (!target && inCombat) {
    if (peeling && !peeling.dead) target = peeling;
    const pt = p.target ? eng.get(p.target) : null;
    if (pt && !pt.dead && pt.side === 'enemy') target = pt;
    if (!target) {
      target = enemiesNear(eng, e, 30)
        .filter((x) => x.inCombat)
        .sort((a, b) => dist2(e.x, e.z, a.x, a.z) - dist2(e.x, e.z, b.x, b.z))[0];
    }
    if (!target) target = enemiesNear(eng, e, 22)[0] || null;
  }
  e.target = target ? target.id : null;

  if (!target) {
    // 跟随
    if (cmd === 'stay') { e.moveTarget = null; e.ai.state = 'FOLLOW'; return; }
    const d = dist2(e.x, e.z, p.x, p.z);
    e.ai.state = 'FOLLOW';
    if (d > 9) {
      const ang = Math.atan2(e.x - p.x, e.z - p.z);
      e.moveTarget = { x: p.x + Math.sin(ang) * 6.5, z: p.z + Math.cos(ang) * 6.5, stop: 0.8 };
    } else e.moveTarget = null;
    moveAlong(eng, e, dt);
    return;
  }

  const dist = dist2(e.x, e.z, target.x, target.z);
  const reach = myRange + target.radius;
  if (dist > reach && cmd === 'stay') {
    e.moveTarget = null;
    e.ai.state = 'ATTACK';
    return;
  }
  if (dist > reach) {
    e.ai.state = 'ENGAGE';
    e.moveTarget = { x: target.x, z: target.z, stop: Math.max(1.2, reach - 1.2) };
    moveAlong(eng, e, dt);
    // 远程在移动中也能打瞬发
    if (myRange > 10 && dist < 30) maybeRangedInstant(eng, e, target);
    return;
  }

  e.moveTarget = null;
  e.ai.state = 'ATTACK';

  // 6) 交技能（优先级从高到低）
  useCompanionSkills(eng, e, target, role);
}

function maybeRangedInstant(eng, e, target) {
  if (e.ai.compId === 'lia' && canUse(eng, e, 'm_fireblast')) eng.useSkill(e.id, 'm_fireblast', target.id);
}

/** 队友技能表：按战况判断，而不是固定顺序 */
const COMP_RULES = {
  // 盾卫：保命 > 嘲讽拉怪 > 打断 > 爆发 > 群体仇恨 > 补伤害
  grom: [
    { id: 'w_shield', when: (c) => c.selfPct < 0.45 && c.melee >= 1 },
    { id: 'w_taunt', when: (c) => !!c.allyThreat, target: (c) => c.allyThreat.id },
    { id: 'w_pummel', when: (c) => !!c.casting && c.castingDist < 6, target: (c) => c.casting.id },
    { id: 'w_blood', when: (c) => c.selfPct < 0.6 || c.boss || c.elite },
    { id: 'w_cleave', when: (c) => c.melee >= 2 },
    { id: 'w_rend', when: (c) => c.targetPct > 0.4 && !c.targetHas('bleed') },
    { id: 'w_charge', when: (c) => c.dist > 9 && c.dist < 24 },
    { id: 'w_hamstring', when: (c) => c.targetFleeing },
    { id: 'w_strike', when: () => true },
  ],
  // 影刃：脱战 > 追击 > 起手 > 毒药/割裂维持 > 爆发 > 终结技
  kai: [
    { id: 'r_stealth', when: (c) => c.selfPct < 0.28 && c.melee >= 2 },
    { id: 'r_sprint', when: (c) => c.dist > 14 },
    { id: 'r_ambush', when: (c) => c.dist < 8 && c.targetPct > 0.55 },
    { id: 'r_poison', when: (c) => !c.targetHas('poison') },
    { id: 'r_dance', when: (c) => (c.boss || c.elite) && c.targetPct > 0.35 },
    { id: 'r_rupture', when: (c) => c.targetPct > 0.55 && !c.targetHas('bleed') },
    { id: 'r_evis', when: (c) => c.combo >= 4 },
    { id: 'r_strike', when: () => true },
  ],
  // 秘术师：解控 > 保命 > 打断 > 控场 > 爆发 > 填充
  lia: [
    { id: 'm_blink', when: (c) => c.rooted },
    { id: 'm_barrier', when: (c) => c.selfPct < 0.55 && c.melee >= 1 },
    { id: 'm_lock', when: (c) => !!c.casting && c.castingDist < 30, target: (c) => c.casting.id },
    { id: 'm_nova', when: (c) => c.melee >= 2 },
    { id: 'm_surge', when: (c) => (c.boss || c.elite) && c.targetPct > 0.4 },
    { id: 'm_fireblast', when: () => true },
    { id: 'm_lance', when: (c) => c.targetPct > 0.45 },
    { id: 'm_bolt', when: () => true },
  ],
  // 祷者：输出交给 tryHeal；只要有人掉血就绝不放惩击
  selin: [
    { id: 'p_smite', when: (c) => !c.anyHurt },
  ],
};

/** 一次决策需要的战场快照 */
function buildCtx(eng, e, target) {
  const foes = enemiesNear(eng, e, 30);
  const dist = dist2(e.x, e.z, target.x, target.z);
  const reach = (COMP_RANGE[e.ai.compId] || 5.4) + target.radius;
  const melee = foes.filter((f) => dist2(e.x, e.z, f.x, f.z) <= 9).length;
  const casting = foes.find((f) => f.cast && f.cast.interruptible);
  const anyHurt = eng.alliesOf(e).some((a) => !a.dead && a.hp / a.maxHp < 0.98);
  // 有怪正在打别人（不是自己）→ 坦克该拉走
  const allyThreat = [...eng.entities.values()].find((x) => {
    if (x.side === 'enemy' || x.dead) return false;
    if (!x.target || x.target === e.id) return false;
    const t = eng.get(x.target);
    return t && t.side === e.side && dist2(e.x, e.z, x.x, x.z) < 20;
  });
  return {
    selfPct: e.hp / e.maxHp,
    anyHurt,
    dist, reach, melee,
    casting,
    castingDist: casting ? dist2(e.x, e.z, casting.x, casting.z) : 999,
    allyThreat,
    targetPct: target.hp / target.maxHp,
    boss: !!target.boss,
    elite: !!target.elite,
    combo: e.combo || 0,
    rooted: e.auras.some((a) => a.kind === 'root'),
    targetFleeing: target.ai && target.ai.state === 'FLEE',
    targetHas: (kind) => target.auras.some((a) => a.kind === kind || a.id === kind),
  };
}

function useCompanionSkills(eng, e, target, role) {
  const c = buildCtx(eng, e, target);
  const rules = COMP_RULES[e.ai.compId] || [];
  for (const r of rules) {
    if (r.when && !r.when(c)) continue;
    const sk = DATA.skills[r.id];
    if (!sk) continue;
    // 读条技：站到范围内再放，别边走边读
    if (sk.cast > 0 && c.dist > c.reach + 1) continue;
    if (!canUse(eng, e, r.id)) continue;
    const tid = sk.target === 'self' ? null : (r.target ? r.target(c).id : target.id);
    if (sk.target !== 'self' && !tid) continue;
    const res = eng.useSkill(e.id, r.id, tid);
    if (res && res.ok) {
      e.ai.lastSkill = r.id;
      return true;
    }
  }
  return false;
}

function canUse(eng, e, skillId) {
  if ((e.cds[skillId] || 0) > eng.now) return false;
  if (e.gcdUntil > eng.now) return false;
  if (e.cast) return false;
  const sk = DATA.skills[skillId];
  if (!sk) return false;
  if (sk.cost && e.res < sk.cost) return false;
  return true;
}

function moveAlong(eng, e, dt) {
  if (!e.moveTarget) return;
  if (e.auras.some((a) => a.kind === 'root') || e.auras.some((a) => a.kind === 'stun')) return;
  const { x, z, stop } = e.moveTarget;
  const done = eng.moveTowards(e, x, z, dt, stop || 0.5);
  if (done) e.moveTarget = null;
}

/** 敌人 AI */
export function updateEnemy(eng, e, dt) {
  const now = eng.now;
  const ai = e.ai;
  if (!ai) return;
  if (e.cast) return;

  const p = eng.player;

  // 回归 / 脱战
  if (ai.state === 'RETURN') {
    const d = dist2(e.x, e.z, ai.homeX, ai.homeZ);
    if (d < 2) {
      ai.state = 'IDLE';
      e.hp = e.maxHp;
      e.inCombat = false;
      e.threat = {};
      e.target = null;
    } else {
      eng.moveTowards(e, ai.homeX, ai.homeZ, dt, 1);
      e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.15 * (dt / 1000));
    }
    return;
  }

  // 逃跑
  if (ai.state === 'FLEE') {
    const threat = e.target ? eng.get(e.target) : null;
    if (!threat || now > (ai.fleeUntil || 0)) {
      ai.state = 'RETURN';
      return;
    }
    const ang = Math.atan2(e.x - threat.x, e.z - threat.z);
    eng.moveTowards(e, e.x + Math.sin(ang) * 12, e.z + Math.cos(ang) * 12, dt, 0);
    return;
  }

  // 选目标
  let target = null;
  if (e.forcedTarget && now < (e.forcedUntil || 0)) {
    const f = eng.get(e.forcedTarget);
    if (f && !f.dead) target = f;
  }
  if (!target && e.threat) {
    let bestId = null, best = 0;
    for (const [id, v] of Object.entries(e.threat)) {
      const cand = eng.get(id);
      if (!cand || cand.dead) continue;
      if (dist2(e.x, e.z, cand.x, cand.z) > 60) continue;
      if (v > best) { best = v; bestId = id; }
    }
    if (bestId) target = eng.get(bestId);
  }
  if (!target && e.target) {
    const t = eng.get(e.target);
    if (t && !t.dead) target = t;
  }
  if (!target) {
    const cand = eng.nearestEnemy(e, (DATA.monsters[e.meta.monsterId]?.aggro || 10), (x) => {
      if (x.auras?.some((a) => a.kind === 'stealth')) return dist2(e.x, e.z, x.x, x.z) < 3;
      return true;
    });
    if (cand) {
      target = cand;
      eng.addThreat(e, cand.id, 30);
      ai.state = 'CHASE';
    }
  }
  e.target = target ? target.id : null;

  if (!target) {
    // 巡逻
    if (!ai.patrolUntil || now > ai.patrolUntil) {
      ai.patrolUntil = now + 4000 + Math.random() * 5000;
      const ang = Math.random() * Math.PI * 2;
      const r = 4 + Math.random() * 7;
      ai.patrolX = ai.homeX + Math.cos(ang) * r;
      ai.patrolZ = ai.homeZ + Math.sin(ang) * r;
    }
    if (ai.patrolX != null && dist2(e.x, e.z, ai.patrolX, ai.patrolZ) > 1.5) {
      eng.moveTowards(e, ai.patrolX, ai.patrolZ, dt, 1);
    }
    return;
  }

  const dist = dist2(e.x, e.z, target.x, target.z);
  const leashDist = dist2(e.x, e.z, ai.homeX, ai.homeZ);

  // 超出牵引范围 → 脱战回归
  if (leashDist > e.leash || (!e.boss && dist2(target.x, target.z, ai.homeX, ai.homeZ) > e.leash + 12)) {
    ai.state = 'RETURN';
    e.target = null;
    e.threat = {};
    eng.emit({ t: 'log', tone: 'combat', text: `${e.name} 脱离了战斗。` });
    return;
  }

  // 低血逃跑
  if (e.fleeAt && e.hp / e.maxHp < e.fleeAt && !e.boss && ai.state !== 'FLEE') {
    ai.state = 'FLEE';
    ai.fleeUntil = now + 5000;
    return;
  }

  if (dist > e.autoRange + target.radius) {
    ai.state = 'CHASE';
    eng.moveTowards(e, target.x, target.z, dt, Math.max(1, e.autoRange - 1));
    return;
  }

  ai.state = 'ATTACK';
  // 技能决策
  if (now < (ai.nextSkill || 0)) return;
  ai.nextSkill = now + (e.boss ? 1200 : 1800 + Math.random() * 1200);

  const skillIds = e.boss && e.phaseIdx > 0 && e.phases?.[e.phaseIdx]?.skills
    ? e.phases[e.phaseIdx].skills
    : e.boss && e.phases ? e.phases[0].skills : e.skills;
  const usable = skillIds.filter((sid) => {
    const sk = DATA.skills[sid];
    if (!sk) return false;
    if ((e.cds[sid] || 0) > now) return false;
    const r = sk.range || 5;
    return dist <= r + target.radius + 0.5;
  });
  if (!usable.length) return;
  const pick = usable[Math.floor(Math.random() * usable.length)];
  if (pick === 'b_summon' && eng.entities.size > 24) return;
  eng.useSkill(e.id, pick, target.id);
}
