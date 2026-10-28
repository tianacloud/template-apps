// 2D 叠加层：头顶名字板、伤害飘字、小地图。全部用 DOM/Canvas，不额外依赖。

import { DATA, itemById, qualityOf } from '../data/gamedata.js';
import { G, questAvailable, questReady } from '../game/state.js';
import { cachedGuide } from '../game/guide.js';

export class Overlay {
  constructor(world) {
    this.world = world;
    this.plates = new Map();
    this.floats = [];
    this.floatPool = [];
    this.root = document.getElementById('nameplates');
    this.floatRoot = document.getElementById('floaters');
    this.icons = {};
    this.iconAt = 0;
    this.mini = document.getElementById('minimap-canvas');
    this.mctx = this.mini?.getContext('2d');
  }

  clearPlates() {
    for (const el of this.plates.values()) el.remove();
    this.plates.clear();
  }

  refreshIcons() {
    this.icons = {};
    for (const npc of this.world.npcs) {
      let icon = '';
      for (const [qid, q] of Object.entries(DATA.quests)) {
        if (q.turnin === npc.id && questReady(qid)) { icon = '?'; break; }
        if (q.giver === npc.id && questAvailable(qid)) { icon = '!'; break; }
      }
      if (!icon && (npc.role === 'vendor' || npc.role === 'flight' || npc.role === 'trainer')) icon = '·';
      this.icons[npc.id] = icon;
    }
  }

  update(engine, dt, now) {
    if (now - this.iconAt > 600) {
      this.refreshIcons();
      this.iconAt = now;
    }
    const seen = new Set();
    const camPos = this.world.camera.position;

    const consider = (ent) => {
      if (ent.kind === 'player') return;
      if (ent.dead) return;
      const d = this.world.distanceToCamera(ent.x, ent.z);
      if (d > 55) return;
      seen.add(ent.id);
      let el = this.plates.get(ent.id);
      if (!el) {
        el = document.createElement('div');
        el.className = 'plate ' + (ent.side === 'enemy' ? 'enemy' : ent.kind === 'player' ? 'self' : 'ally');
        if (ent.boss) el.classList.add('boss');
        else if (ent.elite) el.classList.add('elite');
        el.innerHTML = `<div class="plate-name"></div><div class="plate-bar"><i></i></div>`;
        this.root.appendChild(el);
        this.plates.set(ent.id, el);
      }
      const rp = engine.renderPos ? engine.renderPos(ent) : ent;
      const p = this.world.project(rp.x, this.world.heightAt(rp.x, rp.z) + (rp.h || 0) + 2.5 + (ent.boss ? 1.4 : 0), rp.z);
      if (!p.visible) { el.style.display = 'none'; return; }
      el.style.display = '';
      el.style.transform = `translate(-50%,-100%) translate(${p.x}px,${p.y}px)`;
      el.style.opacity = String(Math.max(0.25, 1 - (d - 30) / 30));
      const nameEl = el.firstChild;
      const mark = ent.boss ? '☠ ' : '';
      if (nameEl.textContent !== mark + ent.name) nameEl.textContent = mark + ent.name;
      const fill = el.lastChild.firstChild;
      const pct = Math.max(0, ent.hp / ent.maxHp) * 100;
      fill.style.width = pct.toFixed(1) + '%';
      el.classList.toggle('casting', !!ent.cast);
      if (ent.cast) {
        fill.style.width = ((ent.hp / ent.maxHp) * 100).toFixed(1) + '%';
      }
    };

    for (const ent of engine.entities.values()) consider(ent);

    // NPC 名字板
    for (const npc of this.world.npcs) {
      const id = 'npc_' + npc.id;
      seen.add(id);
      let el = this.plates.get(id);
      if (!el) {
        el = document.createElement('div');
        el.className = 'plate npc';
        el.innerHTML = `<div class="plate-name"></div><div class="plate-icon"></div>`;
        this.root.appendChild(el);
        this.plates.set(id, el);
      }
      const p = this.world.project(npc.x, this.world.heightAt(npc.x, npc.z) + 2.9, npc.z);
      const d = this.world.distanceToCamera(npc.x, npc.z);
      if (!p.visible || d > 70) { el.style.display = 'none'; continue; }
      el.style.display = '';
      el.style.transform = `translate(-50%,-100%) translate(${p.x}px,${p.y}px)`;
      el.style.opacity = d > 50 ? '0.6' : '1';
      el.firstChild.textContent = npc.name;
      const iconEl = el.lastChild;
      const icon = this.icons[npc.id] || '';
      if (iconEl.textContent !== icon) iconEl.textContent = icon;
      iconEl.className = 'plate-icon ' + (icon === '?' ? 'turnin' : icon === '!' ? 'available' : 'minor');
    }

    for (const [id, el] of this.plates) {
      if (!seen.has(id)) { el.remove(); this.plates.delete(id); }
    }

    // 飘字
    for (let i = this.floats.length - 1; i >= 0; i--) {
      const f = this.floats[i];
      if (now - f.born > (f.ttl || 1150)) {
        f.el.remove();
        this.floatPool.push(f.el);
        this.floats.splice(i, 1);
      }
    }
    this.drawMinimap(engine);
  }

  /** 技能名：在头顶浮一下就走，不要常驻 */
  castName(x, z, text, color) {
    const p = this.world.project(x, this.world.heightAt(x, z) + 3.05, z);
    if (!p.visible) return;
    if (this.floats.length > 46) return;
    const el = this.floatPool.pop() || document.createElement('div');
    el.className = 'floater cast';
    el.textContent = text;
    el.style.color = color || '';
    el.style.left = Math.round(p.x) + 'px';
    el.style.top = Math.round(p.y) + 'px';
    el.style.setProperty('--drift', '0px');
    this.floatRoot.appendChild(el);
    this.floats.push({ el, born: performance.now(), ttl: 1900 });
  }

  float(text, cls, x, z, height = 2.2) {
    const p = this.world.project(x, this.world.heightAt(x, z) + height, z);
    if (!p.visible) return;
    if (this.floats.length > 42) return;
    const el = this.floatPool.pop() || document.createElement('div');
    el.className = 'floater ' + cls;
    el.textContent = text;
    // 用 left/top 定基准位置，动画只负责向上的位移，避免 transform 被动画覆盖
    el.style.left = Math.round(p.x + (Math.random() * 26 - 13)) + 'px';
    el.style.top = Math.round(p.y) + 'px';
    el.style.setProperty('--drift', (Math.random() * 30 - 15).toFixed(0) + 'px');
    this.floatRoot.appendChild(el);
    this.floats.push({ el, born: performance.now() });
  }

  drawMinimap(engine) {
    const ctx = this.mctx;
    if (!ctx) return;
    const W = this.mini.width, H = this.mini.height;
    ctx.clearRect(0, 0, W, H);
    const world = this.world;
    if (!world.zone) return;
    const half = world.zone.half;
    const scale = W / (half * 2.2);
    const cx = W / 2, cy = H / 2;
    const p = engine.player;
    if (!p) return;
    const mapX = (x, z) => cx + (x - p.x) * scale;
    const mapY = (x, z) => cy + (z - p.z) * scale;

    ctx.fillStyle = 'rgba(20,17,14,0.55)';
    ctx.fillRect(0, 0, W, H);

    // 可走范围
    ctx.strokeStyle = 'rgba(201,162,39,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(mapX(-half, 0), mapY(0, -half), half * 2 * scale, half * 2 * scale);

    // 建筑/地形点
    ctx.fillStyle = 'rgba(160,140,100,0.55)';
    for (const o of world.objects) {
      ctx.fillRect(mapX(o.x, o.z) - 2, mapY(o.x, o.z) - 2, 4, 4);
    }

    // NPC
    for (const n of world.npcs) {
      const x = mapX(n.x, n.z), y = mapY(n.x, n.z);
      if (x < 0 || y < 0 || x > W || y > H) continue;
      const icon = this.icons[n.id];
      ctx.fillStyle = icon === '?' ? '#ffd100' : icon === '!' ? '#ffd100' : n.role === 'flight' ? '#1EFF00' : '#8fd0ff';
      ctx.beginPath();
      ctx.arc(x, y, icon === '!' || icon === '?' ? 3.6 : 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 副本入口 / 传送门
    for (const o of world.objects) {
      if (o.kind !== 'portal') continue;
      if (Math.hypot(o.x - p.x, o.z - p.z) > 120) continue;
      const x = mapX(o.x, o.z), y = mapY(o.x, o.z);
      if (x < 2 || y < 2 || x > W - 2 || y > H - 2) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#b08ae0';
      ctx.fillRect(-3, -3, 6, 6);
      ctx.restore();
    }

    // 当前任务目标：金色菱形，出圈时贴边显示
    const g = cachedGuide();
    if (g && g.x != null && g.zone === G.zoneId) {
      let gx = mapX(g.x, g.z) - cx, gy = mapY(g.x, g.z) - cy;
      const gd = Math.hypot(gx, gy), R = W / 2 - 9;
      if (gd > R && gd > 0) { gx = gx / gd * R; gy = gy / gd * R; }
      const px = cx + gx, py = cy + gy;
      const pulse = 1 + Math.sin(performance.now() / 260) * 0.18;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#ffd100';
      ctx.strokeStyle = 'rgba(20,14,4,.9)';
      ctx.lineWidth = 1.5;
      const s2 = 4.2 * pulse;
      ctx.fillRect(-s2, -s2, s2 * 2, s2 * 2);
      ctx.strokeRect(-s2, -s2, s2 * 2, s2 * 2);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,209,0,.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, 9 * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 战斗单位
    for (const e of engine.entities.values()) {
      if (e.id === p.id) continue;
      if (e.dead) continue;
      if (Math.hypot(e.x - p.x, e.z - p.z) > 72) continue;
      const x = mapX(e.x, e.z), y = mapY(e.x, e.z);
      ctx.fillStyle = e.side === 'enemy' ? (e.boss ? '#ff2b2b' : '#e05a4a') : '#59d97a';
      const r = e.boss ? 3.6 : e.elite ? 3 : 1.9;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 玩家箭头
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-(engine.player.yaw || 0) + Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4.5, 5);
    ctx.lineTo(0, 2.5);
    ctx.lineTo(-4.5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const zdef = world.zone.def;
    const coordEl = document.getElementById('minimap-coord');
    if (coordEl) coordEl.textContent = `${zdef.name}  ${Math.round(p.x)}, ${Math.round(p.z)}`;
  }

  lootToast(items) {
    for (const it of items) {
      const def = itemById(it.id);
      if (!def) continue;
      this.float(def.name, 'loot-' + def.quality, 0, 0, 0);
    }
  }
}
