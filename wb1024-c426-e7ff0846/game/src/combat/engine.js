// 确定性战斗引擎：固定步长 tick 驱动，纯规则计算，只向外抛 CombatEvent。
// 渲染层与 UI 层不参与任何数值计算。

import { clamp, mulberry32, dist2 } from '../core/util.js';
import { DATA, derivePlayer, deriveCompanion, itemById } from '../data/gamedata.js';
import { updateEnemy, updateCompanion } from '../ai/brains.js';

export const STEP = 50; // 固定 50ms 逻辑步长
const MELEE_RANGE = 5.2;

export class Engine {
  constructor(opts = {}) {
    this.seed = opts.seed || 20261022;
    this.rng = mulberry32(this.seed);
    this.now = 0;
    this.acc = 0;
    this.entities = new Map();
    this.events = [];
    this.grounds = [];
    this.colliders = [];
    this.bounds = { minX: -95, maxX: 95, minZ: -95, maxZ: 95 };
    this.playerId = null;
    this.hooks = {};
    this.mode = 'world';
    this.difficulty = 'normal';
    this.groundSeq = 0;
    this.alpha = 1;
  }

  // ---------- 实体 ----------
  addEntity(cfg) {
    const e = {
      id: cfg.id, name: cfg.name, side: cfg.side, kind: cfg.kind,
      level: cfg.level || 1,
      maxHp: cfg.maxHp, hp: cfg.maxHp,
      maxRes: cfg.maxRes || 0, res: cfg.res || 0, resource: cfg.resource || null,
      ap: cfg.ap || 0, sp: cfg.sp || 0, armor: cfg.armor || 0,
      crit: cfg.crit ?? 0.05, critDmg: cfg.critDmg ?? 2, dr: cfg.dr || 0,
      x: cfg.x || 0, z: cfg.z || 0, px: cfg.x || 0, pz: cfg.z || 0, yaw: cfg.yaw || 0,
      h: 0, ph: 0, vy: 0,
      speed: cfg.speed || 5, radius: cfg.radius || 0.55,
      autoRange: cfg.autoRange || MELEE_RANGE, swingInterval: cfg.swingInterval || 2000, swingAt: 0,
      skills: cfg.skills || [], cds: {}, gcdUntil: 0,
      auras: [], cast: null, dead: false, inCombat: false, lastCombat: -99999,
      target: null, forcedTarget: null, moveTarget: null, moveDir: null,
      threat: {}, mods: cfg.mods || { cdReduce: {}, skillDmg: {} },
      combo: 0, maxCombo: 5,
      ai: cfg.ai || null, spawn: { x: cfg.x || 0, z: cfg.z || 0 }, leash: cfg.leash || 55,
      elite: !!cfg.elite, boss: !!cfg.boss, phases: cfg.phases || null, phaseIdx: 0,
      resType: cfg.resource, visual: cfg.visual || {}, meta: cfg.meta || {},
      reviveAt: 0, summoner: cfg.summoner || null, ownerId: cfg.ownerId || null,
    };
    this.entities.set(e.id, e);
    return e;
  }

  get(id) { return this.entities.get(id); }
  get player() { return this.entities.get(this.playerId); }
  alive() { return [...this.entities.values()].filter((e) => !e.dead); }
  enemiesOf(e) { return [...this.entities.values()].filter((x) => !x.dead && x.side !== e.side); }
  alliesOf(e) { return [...this.entities.values()].filter((x) => !x.dead && x.side === e.side); }

  emit(evt) { this.events.push(evt); }

  createPlayer(player) {
    const d = derivePlayer(player);
    const e = this.addEntity({
      id: 'player', name: player.name, side: 'player', kind: 'player',
      level: player.level, maxHp: d.maxHp, maxRes: d.maxRes,
      res: player.res ?? (DATA.classes[player.classId].resource === 'rage' ? 0 : d.maxRes),
      resource: DATA.classes[player.classId].resource, ap: d.ap, sp: d.sp, armor: d.armor,
      crit: d.crit, critDmg: d.critDmg, dr: d.dr, x: player.pos.x, z: player.pos.z,
      speed: 6.4, autoRange: DATA.classes[player.classId].auto === 'melee' ? MELEE_RANGE : 28,
      swingInterval: 2000, skills: DATA.classes[player.classId].skills, mods: d.mods,
    });
    e.classId = player.classId;
    e.mounted = !!player.hasMount;
    e.derived = d;
    e.hp = Math.min(player.hp ?? d.maxHp, d.maxHp);
    this.playerId = e.id;
    return e;
  }

  /** 装备/天赋/等级变化后重算玩家属性 */
  recalcPlayer(player) {
    const p = this.player;
    if (!p) return;
    const d = derivePlayer(player);
    p.derived = d;
    p.level = player.level;
    p.maxHp = d.maxHp;
    p.hp = Math.min(p.hp, d.maxHp);
    p.maxRes = d.maxRes;
    p.ap = d.ap; p.sp = d.sp; p.armor = d.armor;
    p.crit = d.crit; p.critDmg = d.critDmg; p.dr = d.dr;
    p.mods = d.mods;
    p.autoRange = DATA.classes[player.classId].auto === 'melee' ? MELEE_RANGE : 28;
  }

  spawnCompanion(compId, playerLevel, x, z) {
    const c = DATA.companions[compId];
    const d = deriveCompanion(compId, playerLevel);
    const e = this.addEntity({
      id: 'comp_' + compId, name: c.name, side: 'player', kind: 'companion',
      level: Math.max(1, playerLevel - 1), maxHp: d.maxHp, maxRes: d.maxRes, res: d.maxRes,
      resource: d.resource, ap: d.ap, sp: d.sp, armor: d.armor, crit: d.crit, critDmg: 2,
      x, z, speed: 6.2, autoRange: MELEE_RANGE, swingInterval: 2000, skills: c.skills,
      ai: { type: 'companion', compId, role: c.role, state: 'FOLLOW', nextThink: 0 },
      mods: d.mods, visual: { color: c.color, model: c.model, scale: c.scale },
    });
    e.classId = c.classId;
    e.derived = d;
    return e;
  }

  spawnMonster(monsterId, x, z, opts = {}) {
    const m = DATA.monsters[monsterId];
    const diff = this.difficulty === 'story' ? 0.5 : this.difficulty === 'challenge' ? 1.3 : 1;
    const partyScale = 1 + 0.55 * (opts.partySize || 0);
    const hp = Math.round(m.hp * (m.boss ? partyScale : 1) * (1 + Math.max(0, (opts.levelBonus || 0)) * 0.1));
    const dmg = Math.round(m.dmg * (m.boss ? 1 + 0.12 * (opts.partySize || 0) : 1) * diff);
    const e = this.addEntity({
      id: opts.id || `${monsterId}_${Math.round(x)}_${Math.round(z)}_${Math.random().toString(36).slice(2, 6)}`,
      name: m.name, side: 'enemy', kind: 'monster', level: m.level,
      maxHp: hp, ap: dmg, armor: m.armor, crit: m.boss ? 0.1 : 0.05, critDmg: 2,
      x, z, speed: m.speed, radius: m.boss ? 1.4 : m.elite ? 0.85 : m.model === 'spider' ? 0.9 : 0.6,
      autoRange: m.ranged ? m.ranged : m.boss ? 6.5 : MELEE_RANGE, swingInterval: m.boss ? 2200 : 2400,
      skills: m.boss ? m.skills : (m.skills || []), ai: { type: 'enemy', state: 'IDLE', nextThink: 0, homeX: x, homeZ: z },
      elite: m.elite, boss: m.boss, phases: m.phases || null, leash: m.boss ? 90 : 48,
      visual: { model: m.model, color: m.color, scale: m.scale }, meta: { monsterId },
    });
    e.lootTable = m.loot || null;
    e.lootPool = m.lootPool || null;
    e.goldRange = m.gold || [1, 3];
    e.xpValue = m.xp || 10;
    e.fleeAt = m.fleeAt || 0;
    e.spawnId = opts.spawnId || null;
    return e;
  }

  // ---------- 资源与光环 ----------
  canAct(e) {
    if (e.dead) return false;
    if (e.auras.some((a) => a.kind === 'stun')) return false;
    return true;
  }

  hasAura(e, kind) { return e.auras.some((a) => a.kind === kind); }
  auraSum(e, kind) {
    let v = 0;
    for (const a of e.auras) if (a.kind === kind) v += a.value * (a.stacks || 1);
    return v;
  }

  applyAura(target, def, srcId) {
    const now = this.now;
    let a = target.auras.find((x) => x.id === def.id && x.srcId === srcId);
    const dur = Math.round((def.dur || 5000) * (def.kind === 'slow' ? 1 + (this.combatMods?.slowExtend || 0) / 10000 : 1));
    if (a) {
      a.expires = now + dur;
      a.stacks = Math.min(def.maxStacks || 1, (a.stacks || 1) + 1);
      a.value = def.value;
    } else {
      a = {
        id: def.id, name: def.name, icon: def.icon, kind: def.kind, value: def.value ?? 0,
        stacks: 1, maxStacks: def.maxStacks || 1, srcId, debuff: !!def.debuff,
        expires: now + dur, tick: def.tick || 0, nextTick: now + (def.tick || 0),
        absorb: 0, charges: def.charges || 0,
      };
      if (def.kind === 'shield') {
        const src = this.get(srcId);
        const shieldMul = 1 + (src?.mods?.shieldMul || 0);
        a.absorb = Math.round((src?.sp || 20) * (def.value || 1) * shieldMul);
        a.maxAbsorb = a.absorb;
      }
      if (def.kind === 'dot') {
        const src = this.get(srcId);
        const dotMul = 1 + (src?.mods?.dotMul || 0);
        a.perTick = Math.round((src?.ap || src?.sp || 10) * (def.value || 0.2) * dotMul * (1 + (src?.mods?.dmgMul || 0)));
      }
      if (def.kind === 'hot') {
        const src = this.get(srcId);
        a.perTick = Math.round((src?.sp || 20) * (def.value || 0.2) * (1 + (src?.mods?.healMul || 0)));
      }
      target.auras.push(a);
    }
    this.emit({ t: 'aura', id: target.id, auraId: a.id, name: a.name, icon: a.icon, add: true, debuff: a.debuff });
    return a;
  }

  removeAura(target, auraOrId) {
    const id = typeof auraOrId === 'string' ? auraOrId : auraOrId.id;
    const idx = target.auras.findIndex((a) => a.id === id);
    if (idx >= 0) {
      const a = target.auras[idx];
      target.auras.splice(idx, 1);
      this.emit({ t: 'aura', id: target.id, auraId: a.id, name: a.name, icon: a.icon, add: false, debuff: a.debuff });
    }
  }

  // ---------- 技能 ----------
  skill(skillId) { return DATA.skills[skillId]; }

  checkUse(caster, skillId, targetId) {
    const sk = DATA.skills[skillId];
    if (!caster || caster.dead) return { ok: false, reason: '你已经倒下了' };
    if (!sk) return { ok: false, reason: '技能不存在' };
    if (caster.cast) return { ok: false, reason: '正在施法' };
    if (!this.canAct(caster)) return { ok: false, reason: '无法行动' };
    if (sk.gcd && caster.gcdUntil > this.now) return { ok: false, reason: 'GCD' };
    if ((caster.cds[skillId] || 0) > this.now) return { ok: false, reason: '冷却中' };
    if (sk.requiresOutOfCombat && caster.inCombat) return { ok: false, reason: '战斗中无法使用' };
    if (sk.cost > 0 && caster.res < sk.cost) return { ok: false, reason: sk.class === 'warrior' ? '怒气不足' : sk.class === 'rogue' ? '能量不足' : '法力不足' };
    if (sk.combo && sk.combo.spend && caster.combo <= 0) return { ok: false, reason: '没有连击点' };
    if (sk.consumes && this.hooks.canConsume && !this.hooks.canConsume(sk.consumes)) return { ok: false, reason: '没有可用的消耗品' };

    let target = null;
    if (sk.target === 'enemy') {
      target = this.get(targetId || caster.target);
      if (!target || target.dead || target.side === caster.side) return { ok: false, reason: '需要敌对目标' };
      const d = dist2(caster.x, caster.z, target.x, target.z);
      const reach = sk.range + (caster.radius || 0.5) + (target.radius || 0.5);
      if (d > reach) return { ok: false, reason: '距离太远' };
      if (sk.minRange && d < sk.minRange) return { ok: false, reason: '距离太近' };
    } else if (sk.target === 'ally') {
      target = this.get(targetId || caster.target) || caster;
      if (!target || target.side !== caster.side) target = caster;
      if (target.dead) return { ok: false, reason: '目标已经死亡' };
      const d = dist2(caster.x, caster.z, target.x, target.z);
      if (sk.range && d > sk.range + 1.5) return { ok: false, reason: '距离太远' };
    } else {
      target = caster;
    }
    return { ok: true, skill: sk, target };
  }

  useSkill(casterId, skillId, targetId) {
    const caster = this.get(casterId);
    const check = this.checkUse(caster, skillId, targetId);
    if (!check.ok) return check;
    const { skill: sk, target } = check;

    if (sk.cost) caster.res -= sk.cost;
    if (sk.gcd) caster.gcdUntil = this.now + sk.gcd;
    const cdRed = caster.mods?.cdReduce?.[skillId] || 0;
    if (sk.cd) caster.cds[skillId] = this.now + Math.max(0, sk.cd - cdRed);
    this.markCombat(caster);

    if (sk.consumes && this.hooks.consume) this.hooks.consume(sk.consumes);
    if (sk.move) this.doMoveSkill(caster, sk, target);

    if (sk.cast > 0) {
      // 读条类的地面技能在起手就把红圈铺出去，玩家有时间躲
      for (const eff of sk.effects || []) {
        if (eff.type !== 'ground' && eff.type !== 'groundAt') continue;
        if (eff.type === 'ground') {
          const cx = eff.atSelf ? caster.x : target.x;
          const cz = eff.atSelf ? caster.z : target.z;
          this.spawnGround(caster, cx, cz, { ...eff, delay: sk.cast + 300 }, caster.id);
        } else {
          const rings = eff.rings || 1;
          for (let i = 0; i < rings; i++) {
            let cx = target.x, cz = target.z;
            if (i > 0) {
              const ang = (i / rings) * Math.PI * 2 + this.rng() * 1.2;
              cx += Math.cos(ang) * (eff.radius + 4);
              cz += Math.sin(ang) * (eff.radius + 4);
            }
            this.spawnGround(caster, cx, cz, { ...eff, delay: sk.cast + 300 }, caster.id);
          }
        }
      }
      caster.cast = {
        skillId, start: this.now, end: this.now + sk.cast, targetId: target.id,
        interruptible: !!sk.interruptible, channel: !!sk.channel, name: sk.name,
      };
      this.emit({ t: 'castStart', id: caster.id, skillId, dur: sk.cast, interruptible: !!sk.interruptible });
      return { ok: true, casting: true };
    }

    this.resolveSkill(caster, sk, target);
    return { ok: true };
  }

  doMoveSkill(caster, sk, target) {
    if (sk.move.mode === 'charge') {
      const ang = Math.atan2(target.x - caster.x, target.z - caster.z);
      const d = dist2(caster.x, caster.z, target.x, target.z) - 2.2;
      const nx = clamp(caster.x + Math.sin(ang) * d, this.bounds.minX, this.bounds.maxX);
      const nz = clamp(caster.z + Math.cos(ang) * d, this.bounds.minZ, this.bounds.maxZ);
      caster.x = nx; caster.z = nz; caster.yaw = ang;
      this.snapPos(caster);
      this.emit({ t: 'dash', id: caster.id, x: nx, z: nz });
    } else if (sk.move.mode === 'blink') {
      const ang = caster.yaw;
      const d = sk.move.dist || 12;
      caster.x = clamp(caster.x + Math.sin(ang) * d, this.bounds.minX, this.bounds.maxX);
      caster.z = clamp(caster.z + Math.cos(ang) * d, this.bounds.minZ, this.bounds.maxZ);
      this.snapPos(caster);
      this.emit({ t: 'dash', id: caster.id, x: caster.x, z: caster.z });
    }
  }

  resolveSkill(caster, sk, target) {
    const targets = [];
    if (sk.target === 'enemy') {
      if (sk.aoe) {
        const center = sk.aoe.self ? caster : target;
        for (const e of this.enemiesOf(caster)) {
          if (dist2(center.x, center.z, e.x, e.z) <= sk.aoe.radius) targets.push(e);
        }
        if (sk.aoe.max) targets.splice(sk.aoe.max);
      } else targets.push(target);
    } else if (sk.target === 'ally') {
      if (sk.aoe) {
        for (const e of this.alliesOf(caster)) {
          if (dist2(target.x, target.z, e.x, e.z) <= sk.aoe.radius) targets.push(e);
        }
        if (sk.aoe.max) targets.splice(sk.aoe.max);
      } else targets.push(target);
    } else if (sk.target === 'self') {
      if (sk.aoe) {
        for (const e of this.enemiesOf(caster)) {
          if (dist2(caster.x, caster.z, e.x, e.z) <= sk.aoe.radius) targets.push(e);
        }
        if (sk.aoe.max) targets.splice(sk.aoe.max);
      } else targets.push(caster);
    }

    if (sk.heal) {
      if (sk.aoe) {
        for (const e of this.alliesOf(caster)) {
          if (dist2(caster.x, caster.z, e.x, e.z) <= (sk.aoe.radius || 20)) this.heal(caster, e, this.healAmount(caster, sk));
        }
      } else {
        for (const t of targets) this.heal(caster, t, this.healAmount(caster, sk));
      }
    } else if (sk.coef > 0) {
      let coef = sk.coef;
      if (sk.combo && sk.combo.spend) coef += (sk.combo.perPoint || 0.55) * caster.combo;
      for (const t of targets) {
        const dmg = this.damageAmount(caster, sk, coef, t);
        this.dealDamage(caster, t, dmg.amount, { crit: dmg.crit, school: sk.school, skill: sk.name });
      }
    }

    if (sk.combo) {
      if (sk.combo.gen) caster.combo = Math.min(caster.maxCombo, caster.combo + sk.combo.gen);
    }

    if (sk.interrupt) {
      for (const t of targets) this.interrupt(t, caster);
    }

    for (const eff of sk.effects || []) {
      if (sk.cast > 0 && (eff.type === 'ground' || eff.type === 'groundAt')) continue;
      this.applyEffect(caster, sk, eff, targets, target);
    }

    // 连击点结算放在效果之后，保证终结技吃到本次消耗的点数
    if (sk.combo && sk.combo.spend) caster.combo = 0;

    this.emit({ t: 'skill', id: caster.id, skillId: sk.id, name: sk.name, targets: targets.map((x) => x.id) });
  }

  applyEffect(caster, sk, eff, targets, primary) {
    switch (eff.type) {
      case 'aura': {
        // 范围减益只作用于被命中的目标：没打中任何人时不能落到施法者自己身上
        let list;
        if (sk.heal && sk.aoe) {
          list = this.alliesOf(caster).filter(
            (a) => dist2(caster.x, caster.z, a.x, a.z) <= (sk.aoe.radius || 20)
          );
        } else if (sk.aoe) {
          list = targets;
        } else if (sk.target === 'self') {
          list = [caster];
        } else {
          list = targets;
        }
        if (!list || !list.length) break;
        for (const t of list) {
          let v = eff.value;
          if (eff.perPoint) v *= Math.max(1, caster.combo);
          this.applyAura(t, { ...eff, value: v }, caster.id);
        }
        break;
      }
      case 'resource':
        caster.res = clamp(caster.res + eff.amount, 0, caster.maxRes);
        break;
      case 'healPct':
        this.heal(caster, caster, Math.round(caster.maxHp * eff.value));
        break;
      case 'cleanse':
        for (const t of sk.target === 'ally' ? targets : [caster]) {
          const a = t.auras.find((x) => x.kind === eff.kind && x.debuff);
          if (a) this.removeAura(t, a);
        }
        break;
      case 'dispel': {
        const t = targets[0];
        if (t) {
          const bad = t.auras.filter((a) => a.debuff).slice(0, eff.count || 1);
          bad.forEach((a) => this.removeAura(t, a));
        }
        break;
      }
      case 'taunt': {
        const t = targets[0];
        if (t) {
          t.forcedTarget = caster.id;
          t.forcedUntil = this.now + (eff.dur || 4000);
          // 嘲讽同时把仇恨抬到当前第一仇恨的上方，以免 4 秒一过就掉头
          if (t.threat) {
            let top = 0;
            for (const v of Object.values(t.threat)) top = Math.max(top, v);
            const mine = t.threat[caster.id] || 0;
            t.threat[caster.id] = Math.max(mine, top * 1.2, top + 200);
          }
          this.emit({ t: 'taunt', id: t.id, by: caster.id });
        }
        break;
      }
      case 'ground': {
        const cx = eff.atSelf ? caster.x : primary.x;
        const cz = eff.atSelf ? caster.z : primary.z;
        this.spawnGround(caster, cx, cz, eff);
        break;
      }
      case 'groundAt': {
        const rings = eff.rings || 1;
        for (let i = 0; i < rings; i++) {
          let cx = primary.x, cz = primary.z;
          if (i > 0) {
            const ang = (i / rings) * Math.PI * 2 + this.rng() * 1.2;
            cx += Math.cos(ang) * (eff.radius + 4);
            cz += Math.sin(ang) * (eff.radius + 4);
          }
          this.spawnGround(caster, cx, cz, eff);
        }
        break;
      }
      case 'summon': {
        for (let i = 0; i < (eff.count || 1); i++) {
          const ang = this.rng() * Math.PI * 2;
          const m = this.spawnMonster(eff.monster, caster.x + Math.cos(ang) * 3, caster.z + Math.sin(ang) * 3, { partySize: 0 });
          m.summoner = caster.id;
          m.inCombat = true;
          m.target = this.playerId;
          this.emit({ t: 'summon', id: m.id, name: m.name });
        }
        break;
      }
    }
  }

  spawnGround(src, x, z, eff, castBound = null) {
    const g = {
      gid: ++this.groundSeq, x, z, radius: eff.radius || 5,
      explodeAt: this.now + Math.max(900, eff.delay || 1600),
      srcId: src.id, coef: eff.coef || 1, maxTargets: eff.maxTargets || 8,
      skillName: eff.name || '地面效果', castBound,
    };
    this.grounds.push(g);
    this.emit({ t: 'groundSpawn', gid: g.gid, x, z, radius: g.radius, delay: g.explodeAt - this.now, srcId: src.id });
    return g;
  }

  updateGrounds() {
    for (let i = this.grounds.length - 1; i >= 0; i--) {
      const g = this.grounds[i];
      if (this.now >= g.explodeAt) {
        const src = this.get(g.srcId);
        this.emit({ t: 'groundExplode', gid: g.gid, x: g.x, z: g.z, radius: g.radius });
        if (src && !src.dead) {
          const victims = this.entities.values();
          let hits = 0;
          for (const v of victims) {
            if (v.dead || v.side === src.side) continue;
            if (dist2(g.x, g.z, v.x, v.z) > g.radius + v.radius * 0.5) continue;
            if (hits++ >= g.maxTargets) break;
            const fakeSkill = { school: 'physical', coef: g.coef, name: g.skillName };
            const dmg = this.damageAmount(src, fakeSkill, g.coef, v);
            this.dealDamage(src, v, dmg.amount, { crit: dmg.crit, school: fakeSkill.school, skill: g.skillName });
          }
        }
        this.grounds.splice(i, 1);
      }
    }
  }

  healAmount(src, sk) {
    const healMul = 1 + (src.mods?.healMul || 0) + this.auraSum(src, 'buff_heal');
    const skillMul = 1 + (src.mods?.skillDmg?.[sk.id] || 0);
    return Math.round((src.sp || 20) * (sk.coef || 1) * healMul * skillMul * (0.95 + this.rng() * 0.1));
  }

  damageAmount(src, sk, coef, target) {
    const power = sk.school === 'physical' ? src.ap : src.sp;
    const buff = 1 + this.auraSum(src, 'buff_dmg') + (src.mods?.dmgMul || 0) + (src.mods?.skillDmg?.[sk.id] || 0);
    const base = Math.max(1, power * coef * buff);
    // 护甲减伤：armor/(armor + K)，K 随等级增长，避免高护甲把伤害压成 0
    const armor = Math.max(0, target.armor * (1 - clamp(this.auraSum(target, 'armor_debuff'), 0, 0.6)));
    const mitig = clamp(armor / (armor + 180 + target.level * 16), 0, 0.72);
    let dmg = base * (1 - mitig);
    dmg *= 1 + this.auraSum(target, 'vuln');
    dmg *= 1 - clamp(this.auraSum(target, 'dmg_reduce') + (target.dr || 0), 0, 0.8);
    dmg *= 0.9 + this.rng() * 0.2;
    const crit = this.rng() < (src.crit || 0.05);
    if (crit) dmg *= (src.critDmg || 2);
    return { amount: Math.max(1, Math.round(dmg)), crit };
  }

  dealDamage(src, target, amount, opts = {}) {
    if (!target || target.dead) return 0;
    let dmg = amount;
    // 护盾吸收
    for (const a of target.auras) {
      if (a.kind === 'shield' && a.absorb > 0) {
        const absorbed = Math.min(a.absorb, dmg);
        a.absorb -= absorbed;
        dmg -= absorbed;
        this.emit({ t: 'absorb', id: target.id, amount: absorbed });
        if (a.absorb <= 0) this.removeAura(target, a);
        if (dmg <= 0) break;
      }
    }
    if (dmg > 0) target.hp = Math.max(0, target.hp - dmg);
    this.markCombat(src);
    this.markCombat(target);
    this.addThreat(target, src.id, opts.dot ? dmg * 0.4 : dmg);
    this.emit({
      t: 'damage', srcId: src.id, dstId: target.id, amount: dmg, absorbed: amount - dmg,
      crit: !!opts.crit, school: opts.school || 'physical', skill: opts.skill || '攻击',
      dot: !!opts.dot,
    });
    if (target.kind === 'monster' && target.ai && !target.boss) target.ai.state = 'ATTACK';
    if (target.hp <= 0) this.kill(target, src);
    return dmg;
  }

  heal(src, target, amount) {
    if (!target || target.dead) return 0;
    const before = target.hp;
    target.hp = Math.min(target.maxHp, target.hp + amount);
    const real = Math.round(target.hp - before);
    this.emit({ t: 'heal', srcId: src.id, dstId: target.id, amount: real, crit: false });
    // 治疗产生仇恨
    if (src.side !== target.side) return real;
    for (const e of this.entities.values()) {
      if (e.dead || e.side === src.side || !e.inCombat) continue;
      this.addThreat(e, src.id, real * 0.5);
    }
    return real;
  }

  addThreat(enemy, srcId, amount) {
    if (!enemy.threat) return;
    if (enemy.side !== 'enemy') return;
    if (!srcId || srcId === enemy.id) return;
    // 坦克仇恨加成：同样一下伤害，盾卫拉得更稳
    const src = this.get(srcId);
    const tank = src && src.kind === 'companion' && src.ai && src.ai.role === 'tank';
    enemy.threat[srcId] = (enemy.threat[srcId] || 0) + amount * (tank ? 2.2 : 0.9);
  }

  markCombat(e) {
    if (!e) return;
    e.inCombat = true;
    e.lastCombat = this.now;
  }

  cancelCast(e) {
    if (!e || !e.cast) return;
    const skillId = e.cast.skillId;
    e.cast = null;
    this.grounds = this.grounds.filter((g) => g.castBound !== e.id);
    this.emit({ t: 'groundClear', srcId: e.id });
    this.emit({ t: 'castEnd', id: e.id, interrupted: true, cancelled: true, skillId });
  }

  clearGrounds() {
    this.grounds = [];
  }

  interrupt(target, caster) {
    if (!target.cast) return false;
    if (!target.cast.interruptible) {
      this.emit({ t: 'castEnd', id: target.id, interrupted: false, immune: true });
      return false;
    }
    this.emit({ t: 'castEnd', id: target.id, interrupted: true, skillId: target.cast.skillId });
    this.emit({ t: 'log', tone: 'combat', text: `${target.name} 的施法被打断。` });
    target.cast = null;
    // 打断后撤掉由这次读条铺出的红圈
    this.grounds = this.grounds.filter((g) => g.castBound !== target.id);
    this.emit({ t: 'groundClear', srcId: target.id });
    if (target.ai) target.ai.lockCast = this.now + 1500;
    this.addThreat(target, caster.id, 200);
    return true;
  }

  kill(e, killer) {
    if (e.dead) return;
    e.dead = true;
    e.hp = 0;
    e.cast = null;
    e.auras = [];
    e.target = null;
    e.moveTarget = null;
    e.moveDir = null;
    e.h = 0;
    e.vy = 0;
    // 死亡即脱离战斗：别的单位对他的仇恨与锁定全部清掉，否则复活后会被全图追
    for (const other of this.entities.values()) {
      if (other === e) continue;
      if (other.threat) delete other.threat[e.id];
      if (other.target === e.id) other.target = null;
      if (other.forcedTarget === e.id) { other.forcedTarget = null; other.forcedUntil = 0; }
    }
    e.threat = {};
    e.forcedTarget = null;
    e.forcedUntil = 0;
    this.emit({ t: 'death', id: e.id, name: e.name, kind: e.kind, killer: killer?.id, x: e.x, z: e.z, boss: e.boss, elite: e.elite });
  }

  revive(e, hpPct = 1) {
    e.dead = false;
    e.hp = Math.round(e.maxHp * hpPct);
    e.res = e.maxRes;
    e.inCombat = false;
    e.auras = [];
    e.reviveAt = 0;
    e.cast = null;
    e.gcdUntil = 0;
    e.swingAt = 0;
    e.target = null;
    e.h = 0;
    e.vy = 0;
    this.emit({ t: 'revive', id: e.id });
  }

  // ---------- 移动 ----------
  /** 跳跃：只有落地状态才能起跳；定身/昏迷不能跳 */
  jump(e) {
    if (!e || e.dead) return false;
    if (e.h > 0.02) return false;
    if (this.hasAura(e, 'stun') || this.hasAura(e, 'root')) return false;
    e.h = 0.001;
    e.vy = 7.2;
    this.emit({ t: 'jump', id: e.id });
    return true;
  }

  /** 垂直方向：重力 + 落地 */
  updateVertical(e, dt) {
    if (e.h <= 0 && e.vy === 0) return;
    const sec = dt / 1000;
    e.vy -= 21 * sec;
    e.h += e.vy * sec;
    if (e.h <= 0) {
      e.h = 0;
      e.vy = 0;
      if (e.kind === 'player') this.emit({ t: 'land', id: e.id });
    }
  }

  speedOf(e) {
    let mul = 1 + this.auraSum(e, 'buff_speed');
    mul *= 1 - clamp(this.auraSum(e, 'slow'), 0, 0.85);
    if (e.auras.some((a) => a.kind === 'stealth')) mul *= 0.7;
    // 坐骑只在战斗外生效
    if (e.kind === 'player' && e.mounted && !e.inCombat) mul *= 1.6;
    return e.speed * mul;
  }

  moveTowards(e, tx, tz, dt, stopDist = 0) {
    if (e.dead) return true;
    // 定身与昏迷在这里统一拦截，敌人的追击、巡逻、逃跑都走这条路径
    if (this.hasAura(e, 'root') || this.hasAura(e, 'stun')) return false;
    const d = dist2(e.x, e.z, tx, tz);
    if (d <= stopDist) return true;
    const speed = this.speedOf(e) * (dt / 1000);
    const ang = Math.atan2(tx - e.x, tz - e.z);
    e.yaw = ang;
    const step = Math.min(speed, d - stopDist);
    const nx = e.x + Math.sin(ang) * step;
    const nz = e.z + Math.cos(ang) * step;
    this.tryMove(e, nx, nz);
    return false;
  }

  tryMove(e, nx, nz) {
    const r = e.radius || 0.5;
    const resolve = (x, z) => {
      let ax = x, az = z;
      for (const c of this.colliders) {
        if (c.type === 'box') {
          if (Math.abs(ax - c.x) < c.hw + r && Math.abs(az - c.z) < c.hd + r) {
            // 推出最近的轴
            const dx = (c.hw + r) - Math.abs(ax - c.x);
            const dz = (c.hd + r) - Math.abs(az - c.z);
            if (dx < dz) ax += ax > c.x ? dx : -dx;
            else az += az > c.z ? dz : -dz;
          }
        } else if (c.type === 'circle') {
          const d = dist2(ax, az, c.x, c.z);
          if (d < c.r + r) {
            const ang = Math.atan2(ax - c.x, az - c.z) || 0;
            ax = c.x + Math.sin(ang) * (c.r + r);
            az = c.z + Math.cos(ang) * (c.r + r);
          }
        }
      }
      return [ax, az];
    };
    let [ax, az] = resolve(nx, e.z);
    let [bx, bz] = resolve(ax, nz);
    e.x = clamp(bx, this.bounds.minX, this.bounds.maxX);
    e.z = clamp(bz, this.bounds.minZ, this.bounds.maxZ);
  }

  // ---------- tick ----------
  tick(nowMs) {
    if (this.lastReal == null) this.lastReal = nowMs;
    let delta = nowMs - this.lastReal;
    this.lastReal = nowMs;
    if (delta > 250) delta = 250;
    this.acc += delta;
    let guard = 0;
    while (this.acc >= STEP && guard++ < 10) {
      this.acc -= STEP;
      this.step(STEP);
    }
    // 渲染插值系数：0 = 刚走完一步，1 = 下一次步进即将发生
    this.alpha = Math.max(0, Math.min(1, this.acc / STEP));
  }

  /** 渲染用的插值坐标；逻辑坐标仍以 e.x / e.z 为准 */
  renderPos(e) {
    if (!e) return { x: 0, z: 0, h: 0 };
    const a = this.alpha;
    return {
      x: e.px + (e.x - e.px) * a,
      z: e.pz + (e.z - e.pz) * a,
      h: (e.ph || 0) + ((e.h || 0) - (e.ph || 0)) * a,
    };
  }

  /** 瞬移类操作要清掉插值起点，否则会看到一条拖影 */
  snapPos(e) {
    if (!e) return;
    e.px = e.x;
    e.pz = e.z;
    e.ph = e.h || 0;
  }

  step(dt) {
    this.now += dt;
    // 记录步进前的位置，供渲染插值使用
    for (const e of this.entities.values()) { e.px = e.x; e.pz = e.z; e.ph = e.h; }
    const p = this.player;

    // 玩家输入移动
    if (p && !p.dead) {
      if (p.moveDir && (p.moveDir.x || p.moveDir.z) && !this.hasAura(p, 'stun') && !this.hasAura(p, 'root')) {
        const ang = Math.atan2(p.moveDir.x, p.moveDir.z);
        p.yaw = ang;
        const speed = this.speedOf(p) * (dt / 1000);
        this.tryMove(p, p.x + p.moveDir.x * speed, p.z + p.moveDir.z * speed);
        p.moving = true;
      } else {
        p.moving = false;
      }
      // 护盾/资源回复
      this.regen(p, dt);
    }

    for (const e of this.entities.values()) {
      if (e.dead) {
        if (e.kind === 'companion' && e.reviveAt && this.now >= e.reviveAt) {
          const pl = this.player;
          e.x = pl.x + (this.rng() - 0.5) * 3;
          e.z = pl.z + (this.rng() - 0.5) * 3;
          this.snapPos(e);
          this.revive(e, 0.6);
          this.emit({ t: 'log', tone: 'ally', text: `${e.name} 重新站了起来。` });
        }
        continue;
      }
      if (e.kind !== 'player') this.regen(e, dt);
      this.updateVertical(e, dt);
      this.updateAuras(e, dt);

      // 施法推进
      if (e.cast) {
        if (this.now >= e.cast.end) {
          const sk = DATA.skills[e.cast.skillId];
          const target = this.get(e.cast.targetId) || e;
          e.cast = null;
          if (sk) this.resolveSkill(e, sk, target);
          this.emit({ t: 'castEnd', id: e.id, interrupted: false });
        }
      } else if (e.kind !== 'player') {
        // AI
        if (e.ai?.type === 'enemy') updateEnemy(this, e, dt);
        else if (e.ai?.type === 'companion') updateCompanion(this, e, dt);
      }

      // 自动攻击：玩家必须已经进入战斗（出过手或被攻击）才会平砍，
      // 单纯“选中”一个目标不会自动动手，避免点一下怪就先开打。
      const autoOk = e.kind !== 'player' || e.inCombat;
      if (autoOk && !e.cast && e.target) {
        const t = this.get(e.target);
        if (t && !t.dead && dist2(e.x, e.z, t.x, t.z) <= e.autoRange + t.radius) {
          if (this.now >= e.swingAt) {
            e.swingAt = this.now + e.swingInterval;
            const sk = { school: 'physical', coef: e.kind === 'player' && DATA.classes[e.classId]?.auto === 'ranged' ? 0.45 : 1, name: '攻击' };
            if (e.kind === 'player' && DATA.classes[e.classId]?.auto === 'ranged') sk.school = 'arcane';
            const dmg = this.damageAmount(e, sk, sk.coef, t);
            this.dealDamage(e, t, dmg.amount, { crit: dmg.crit, school: sk.school, skill: '普通攻击' });
            this.emit({ t: 'swing', id: e.id, targetId: t.id });
            if (e.classId === 'warrior') e.res = clamp(e.res + 5, 0, e.maxRes);
          }
        }
      }

      // 战斗状态衰减
      if (e.inCombat && this.now - e.lastCombat > 5000) {
        if (!this.enemiesOf(e).some((x) => x.target === e.id)) {
          e.inCombat = false;
          if (e.kind === 'monster' && e.ai) e.ai.state = 'IDLE';
        }
      }
    }

    this.updateGrounds();
  }

  regen(e, dt) {
    if (e.dead) return;
    const sec = dt / 1000;
    if (e.resource === 'energy') e.res = clamp(e.res + 10 * sec, 0, e.maxRes);
    else if (e.resource === 'rage') {
      if (!e.inCombat) e.res = clamp(e.res - 2 * sec, 0, e.maxRes);
    } else if (e.resource === 'mana') {
      const pct = e.inCombat ? 0.006 : 0.02;
      const flat = e.inCombat ? 1.5 : 5;
      e.res = clamp(e.res + (e.maxRes * pct + flat) * (1 + (e.mods?.resourceRegenMul || 0)) * sec, 0, e.maxRes);
    }
  }

  updateAuras(e, dt) {
    for (let i = e.auras.length - 1; i >= 0; i--) {
      const a = e.auras[i];
      if (a.tick && a.perTick != null && this.now >= a.nextTick) {
        a.nextTick += a.tick;
        if (a.kind === 'dot') {
          const src = this.get(a.srcId) || e;
          this.dealDamage(src, e, a.perTick, { dot: true, school: 'shadow', skill: a.name });
        } else if (a.kind === 'hot') {
          const src = this.get(a.srcId) || e;
          this.heal(src, e, a.perTick);
        }
      }
      if (this.now >= a.expires) {
        e.auras.splice(i, 1);
        this.emit({ t: 'aura', id: e.id, auraId: a.id, name: a.name, icon: a.icon, add: false, debuff: a.debuff });
      }
    }
    if (e.forcedUntil && this.now > e.forcedUntil) e.forcedTarget = null;
    if (e.boss && e.phases && !e.dead) this.updatePhase(e);
  }

  updatePhase(e) {
    const pct = e.hp / e.maxHp;
    for (let i = e.phases.length - 1; i >= 0; i--) {
      const ph = e.phases[i];
      if (pct <= ph.at && e.phaseIdx < i) {
        e.phaseIdx = i;
        e.phaseSkills = ph.skills;
        e.cds = {};
        if (ph.enrage) {
          e.ap = Math.round(e.ap * (1 + ph.enrage));
          this.emit({ t: 'log', tone: 'boss', text: `${e.name} 进入「${ph.label}」，攻击变得更加凶猛！` });
        } else {
          this.emit({ t: 'log', tone: 'boss', text: `${e.name} 进入「${ph.label}」。` });
        }
        this.emit({ t: 'phase', id: e.id, label: ph.label });
        break;
      }
    }
  }

  // ---------- 查询辅助 ----------
  nearestEnemy(e, maxDist = 60, filter) {
    let best = null, bd = Infinity;
    for (const x of this.entities.values()) {
      if (x.dead || x.side === e.side) continue;
      if (filter && !filter(x)) continue;
      const d = dist2(e.x, e.z, x.x, x.z);
      if (d < bd && d <= maxDist) { bd = d; best = x; }
    }
    return best;
  }

  inCombatAny() {
    const p = this.player;
    if (!p) return false;
    return p.inCombat;
  }

  drainEvents() {
    const e = this.events;
    this.events = [];
    return e;
  }
}
