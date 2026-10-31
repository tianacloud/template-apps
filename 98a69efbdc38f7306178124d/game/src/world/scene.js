// 世界渲染：地形、道具、建筑、角色、地面预警、第三人称相机。
// 只读取引擎状态，不修改任何数值。

import * as THREE from '../../vendor/three.module.js';
import { clamp, lerp, mulberry32, noise2 } from '../core/util.js';
import {
  buildMonster, buildPlayerModel, buildHumanoid, mat, makeRock, makeIceShell,
  makeBuilding, makePillar, makeBell, makeLava, makeAnvil, makeNpcMarker, makeTelegraph, shadowBlob,
} from './models.js';
import { DATA } from '../data/gamedata.js';

const WEAPON_BY_CLASS = { warrior: 'axe', rogue: 'dagger', mage: 'staff', priest: 'mace' };

export class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(58, 1, 0.1, 400);
    this.rig = new CameraRig(this.camera);

    this.hemi = new THREE.HemisphereLight(0xdfe7ff, 0x4a3f2a, 0.78);
    this.sun = new THREE.DirectionalLight(0xfff2d8, 1.05);
    this.sun.position.set(40, 70, 25);
    this.fill = new THREE.DirectionalLight(0xbfd0e8, 0.4);
    this.fill.position.set(-50, 34, -40);
    this.scene.add(this.hemi, this.sun, this.fill);
    this.ambient = new THREE.AmbientLight(0xffffff, 0.42);
    this.scene.add(this.ambient);

    this.staticGroup = new THREE.Group();
    this.actorGroup = new THREE.Group();
    this.fxGroup = new THREE.Group();
    this.scene.add(this.staticGroup, this.actorGroup, this.fxGroup);

    this.actors = new Map();
    this.telegraphs = new Map();
    this.sparks = [];
    this.bolts = [];
    this.shards = [];
    this.npcs = [];
    this.objects = [];
    this.zone = null;
    this.seed = 1;
    this.time = 0;
    this.resize();
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // ---------------- 地形 ----------------
  heightAt(x, z) {
    if (!this.zone || this.zone.isDungeon) return 0;
    const s = this.seed;
    let n = noise2(x * 0.028, z * 0.028, s) * 2.9 + noise2(x * 0.075, z * 0.075, s + 17) * 0.8;
    n -= 1.5;
    const camp = this.zone.def.camp?.pos || [0, 0];
    const d = Math.hypot(x - camp[0], z - camp[1]);
    const flat = clamp((d - 20) / 18, 0, 1);
    const edge = clamp((this.zone.half - Math.max(Math.abs(x), Math.abs(z))) / 12, 0, 1);
    return n * flat * (0.35 + edge * 0.65);
  }

  buildTerrain(def) {
    const size = def.size;
    const seg = 72;
    const geo = new THREE.PlaneGeometry(size, size, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = [];
    const c1 = new THREE.Color(def.theme.ground[0]);
    const c2 = new THREE.Color(def.theme.ground[1]);
    const c3 = new THREE.Color(def.theme.ground[2] || def.theme.ground[0]);
    const tmp = new THREE.Color();
    const rng = mulberry32(this.seed + 5);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      let y = this.zone.isDungeon ? 0 : this.heightAt(x, z);
      if (!this.zone.isDungeon) {
        const edge = clamp((this.zone.half - Math.max(Math.abs(x), Math.abs(z))) / 18, 0, 1);
        y += (1 - edge) * 6.0; // 边缘抬起，形成盆地感
      }
      pos.setY(i, y);
      const h = clamp((y + 3) / 6, 0, 1);
      tmp.copy(c1).lerp(c2, h);
      if (rng() > 0.82) tmp.lerp(c3, 0.45);
      const shade = 0.92 + rng() * 0.16;
      colors.push(tmp.r * shade, tmp.g * shade, tmp.b * shade);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
    mesh.receiveShadow = false;
    this.staticGroup.add(mesh);
  }

  // ---------------- 载入区域 ----------------
  loadZone(def, opts = {}) {
    this.clear();
    this.zone = {
      def,
      isDungeon: !!opts.dungeon,
      half: def.size / 2,
      seed: hashSeed(def.id),
    };
    this.seed = this.zone.seed;
    const t = def.theme;
    this.scene.background = new THREE.Color(t.sky);
    this.scene.fog = new THREE.Fog(new THREE.Color(t.fog), t.fogNear || 40, t.fogFar || 150);
    this.hemi.color = new THREE.Color(t.sky).lerp(new THREE.Color('#ffffff'), 0.5);
    this.hemi.groundColor = new THREE.Color(t.ground[1]);
    this.hemi.intensity = this.zone.isDungeon ? 1.0 : 0.9;
    this.sun.intensity = this.zone.isDungeon ? 0.35 : 1.15;
    this.ambient.intensity = this.zone.isDungeon ? 0.85 : 0.42;

    this.buildTerrain(def);
    if (opts.dungeon) this.buildDungeon(def, t);
    else this.buildOpenWorld(def, t);
    this.camera.far = def.size * 2.2;
    this.camera.updateProjectionMatrix();
  }

  buildOpenWorld(def, theme) {
    const rng = mulberry32(this.seed + 31);
    const half = def.size / 2 - 6;
    const camp = def.camp.pos;
    const near = (x, z, r) => Math.hypot(x - camp[0], z - camp[1]) < r;

    // 树 / 岩石 / 草：全部用 InstancedMesh，把上千个物件压成几个 draw call
    const treeCount = def.props.trees || 0;
    const trunkColor = '#4b3a26';
    const leafColor = theme.tree;
    const leafColor2 = new THREE.Color(theme.tree).multiplyScalar(1.14).getStyle();
    const trunkMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.26, 2.2, 6), mat(trunkColor), treeCount);
    const leaf1 = new THREE.InstancedMesh(new THREE.ConeGeometry(1.5, 1.9, 5), mat(leafColor), treeCount);
    const leaf2 = new THREE.InstancedMesh(new THREE.ConeGeometry(1.1, 1.6, 5), mat(leafColor2), treeCount);
    const dummy = new THREE.Object3D();
    let ti = 0;
    for (let i = 0; i < treeCount; i++) {
      const x = (rng() * 2 - 1) * half, z = (rng() * 2 - 1) * half;
      if (near(x, z, 30)) continue;
      if (this.tooClose(x, z, 3.2)) continue;
      const y = this.heightAt(x, z);
      const s = 0.75 + rng() * 0.75;
      const rot = rng() * Math.PI * 2;
      dummy.position.set(x, y + 1.1 * s, z);
      dummy.rotation.set(0, rot, 0);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      trunkMesh.setMatrixAt(ti, dummy.matrix);
      dummy.position.set(x, y + 2.6 * s, z);
      dummy.updateMatrix();
      leaf1.setMatrixAt(ti, dummy.matrix);
      dummy.position.set(x, y + 3.75 * s, z);
      dummy.scale.setScalar(s * 0.95);
      dummy.updateMatrix();
      leaf2.setMatrixAt(ti, dummy.matrix);
      ti++;
    }
    for (const m of [trunkMesh, leaf1, leaf2]) {
      m.count = ti;
      m.instanceMatrix.needsUpdate = true;
      this.staticGroup.add(m);
    }

    const rockCount = def.props.rocks || 0;
    const rockMesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), mat(theme.rock), rockCount);
    let ri = 0;
    for (let i = 0; i < rockCount; i++) {
      const x = (rng() * 2 - 1) * half, z = (rng() * 2 - 1) * half;
      if (near(x, z, 12)) continue;
      const s = 0.45 + rng() * 1.5;
      dummy.position.set(x, this.heightAt(x, z) + s * 0.32, z);
      dummy.rotation.set(rng(), rng() * Math.PI, rng() * 0.4);
      dummy.scale.set(s, s * (0.55 + rng() * 0.5), s);
      dummy.updateMatrix();
      rockMesh.setMatrixAt(ri++, dummy.matrix);
    }
    rockMesh.count = ri;
    rockMesh.instanceMatrix.needsUpdate = true;
    this.staticGroup.add(rockMesh);

    const grassCount = def.props.grass || 0;
    const grassMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(0.2, 0.62, 4), mat(theme.grass), grassCount);
    let gi = 0;
    for (let i = 0; i < grassCount; i++) {
      const x = (rng() * 2 - 1) * half, z = (rng() * 2 - 1) * half;
      const s = 0.6 + rng() * 1.1;
      dummy.position.set(x, this.heightAt(x, z) + 0.28 * s, z);
      dummy.rotation.set(0, rng() * Math.PI, 0);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      grassMesh.setMatrixAt(gi++, dummy.matrix);
    }
    grassMesh.count = gi;
    grassMesh.instanceMatrix.needsUpdate = true;
    this.staticGroup.add(grassMesh);

    // 建筑：按类型给出贴合外形的碰撞半径与高度
    const FOOT = {
      tower: { r: 2.2, h: 8.6 }, house: { r: 2.6, h: 5.4 }, tent: { r: 1.5, h: 3.0 },
      forge: { r: 2.2, h: 3.6 }, wall: { r: 3.0, h: 4.2 }, well: { r: 1.4, h: 3.2 },
      fire: { r: 0.8, h: 1.0 },
    };
    for (const b of def.buildings || []) {
      const m = makeBuilding(b.type, theme);
      m.position.set(b.pos[0], this.heightAt(b.pos[0], b.pos[1]), b.pos[1]);
      m.rotation.y = b.rot || 0;
      m.scale.setScalar(b.scale || 1);
      this.staticGroup.add(m);
      const foot = FOOT[b.type] || { r: 2.6, h: 4 };
      const sc = b.scale || 1;
      this.colliders = this.colliders || [];
      this.colliders.push({
        type: 'circle', x: b.pos[0], z: b.pos[1],
        r: foot.r * sc, h: foot.h * sc, camBlock: b.type !== 'fire',
      });
    }

    // NPC
    for (const n of def.npcs || []) {
      this.addNpc(n);
    }

    // 可交互物件
    for (const o of def.objects || []) {
      for (const [x, z] of o.positions || []) {
        const mesh = this.makeObject(o.kind, theme);
        const y = this.heightAt(x, z);
        mesh.position.set(x, y, z);
        this.staticGroup.add(mesh);
        this.objects.push({ ...o, x, z, mesh, taken: false });
      }
    }

    // 副本入口
    for (const d of def.dungeons || []) {
      const portal = this.makePortal(d, theme);
      portal.position.set(d.pos[0], this.heightAt(d.pos[0], d.pos[1]), d.pos[1]);
      this.staticGroup.add(portal);
      this.objects.push({ id: 'portal_' + d.id, name: d.name, kind: 'portal', x: d.pos[0], z: d.pos[1], meta: d, mesh: portal });
    }

    this.spawnPoints = (def.spawns || []).map((s) => ({ ...s, monster: s.monster }));
  }

  buildDungeon(def, theme) {
    this.spawnPoints = def.spawns || [];
    for (const [x, z, w, d, h] of def.walls || []) {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshLambertMaterial({ color: theme.rock, flatShading: true })
      );
      wall.position.set(x, h / 2, z);
      this.staticGroup.add(wall);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.4, d + 0.4), new THREE.MeshLambertMaterial({ color: '#4a4640' }));
      cap.position.set(x, h + 0.1, z);
      this.staticGroup.add(cap);
      this.colliders = this.colliders || [];
      this.colliders.push({ type: 'box', x, z, hw: w / 2, hd: d / 2, h, camBlock: true });
    }
    for (const dec of def.decor || []) {
      let m = null;
      if (dec.type === 'pillar') m = makePillar();
      else if (dec.type === 'bell') m = makeBell();
      else if (dec.type === 'lava') m = makeLava();
      else if (dec.type === 'anvil') m = makeAnvil();
      if (m) {
        m.position.set(dec.pos[0], 0, dec.pos[1]);
        if (dec.scale) m.scale.setScalar(dec.scale);
        m.rotation.y = dec.rot || 0;
        this.staticGroup.add(m);
      }
    }
    // 出口
    const exit = this.makePortal({ id: 'exit', name: '出口' }, theme);
    exit.position.set(def.exit[0], 0, def.exit[1]);
    this.staticGroup.add(exit);
    this.objects.push({ id: 'exit', name: '离开副本', kind: 'portal', x: def.exit[0], z: def.exit[1], meta: { id: 'exit' }, mesh: exit });

    for (const o of def.objects || []) {
      for (const [x, z] of o.positions || []) {
        const mesh = this.makeObject(o.kind, theme);
        mesh.position.set(x, 0, z);
        this.staticGroup.add(mesh);
        this.objects.push({ ...o, x, z, mesh });
      }
    }
  }

  tooClose(x, z, r) {
    for (const c of this.colliders || []) {
      if (Math.hypot(c.x - x, c.z - z) < (c.r || 3) + r) return true;
    }
    return false;
  }

  addNpc(n) {
    const h = buildHumanoid({ color: n.color || '#8a7a5c', accent: n.color || '#c9a227', scale: 1, weapon: n.role === 'companion' ? 'sword' : 'none' });
    const y = this.heightAt(n.pos[0], n.pos[1]);
    h.group.position.set(n.pos[0], y, n.pos[1]);
    h.group.rotation.y = Math.PI;
    this.staticGroup.add(h.group);
    const marker = makeNpcMarker(n.role === 'quest' ? '#ffd100' : n.role === 'companion' ? '#69CCF0' : '#69ff8a');
    marker.position.set(n.pos[0], y + 2.6, n.pos[1]);
    this.staticGroup.add(marker);
    this.npcs.push({ ...n, x: n.pos[0], z: n.pos[1], mesh: h.group, marker, baseY: y });
    this.colliders = this.colliders || [];
    this.colliders.push({ type: 'circle', x: n.pos[0], z: n.pos[1], r: 0.8 });
  }

  makeObject(kind, theme) {
    const g = new THREE.Group();
    if (kind === 'stone') {
      for (let i = 0; i < 3; i++) {
        const r = makeRock('#8a8272');
        r.position.set((i - 1) * 0.5, 0.1, (i % 2) * 0.4);
        r.scale.setScalar(0.45 + i * 0.15);
        g.add(r);
      }
    } else if (kind === 'trace') {
      g.add(shadowBlob(0.9, 0x5a2a1a));
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 1.8), new THREE.MeshBasicMaterial({ color: '#7a3b2a' }));
      m.position.y = 0.07;
      m.rotation.y = Math.random();
      g.add(m);
    } else if (kind === 'pack') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.6), new THREE.MeshLambertMaterial({ color: '#8a6a45', flatShading: true }));
      body.position.y = 1.0;
      g.add(body, shadowBlob(0.9));
      for (const x of [-0.35, 0.35]) for (const z of [-0.5, 0.5]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.8, 0.16), new THREE.MeshLambertMaterial({ color: '#6b4a25' }));
        leg.position.set(x, 0.4, z);
        g.add(leg);
      }
    } else if (kind === 'pack') {
      g.add(shadowBlob(0.9));
    } else if (kind === 'rune') {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.8, 1.1, 6),
        new THREE.MeshBasicMaterial({ color: '#8a6dff', transparent: true, opacity: 0.85, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.08;
      g.add(ring);
      const p = new THREE.PointLight('#8a6dff', 1.2, 8);
      p.position.y = 0.8;
      g.add(p);
    } else if (kind === 'tomb') {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.5, 0.24), new THREE.MeshLambertMaterial({ color: '#5c5a52', flatShading: true }));
      s.position.y = 0.75;
      s.rotation.z = 0.12;
      g.add(s, shadowBlob(0.6));
    }
    return g;
  }

  makePortal(d, theme) {
    const g = new THREE.Group();
    const arch = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.2, 0.8), new THREE.MeshLambertMaterial({ color: '#4c4438', flatShading: true }));
    arch.position.set(-2.4, 2.6, 0);
    const arch2 = arch.clone();
    arch2.position.x = 2.4;
    const top = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.8, 0.8), new THREE.MeshLambertMaterial({ color: '#4c4438', flatShading: true }));
    top.position.y = 5.0;
    const veil = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 4.6),
      new THREE.MeshBasicMaterial({ color: theme.accent || '#8a6dff', transparent: true, opacity: 0.22, side: THREE.DoubleSide })
    );
    veil.position.set(0, 2.4, 0);
    const light = new THREE.PointLight(theme.accent || '#8a6dff', 1.4, 14);
    light.position.set(0, 3, 0);
    g.add(arch, arch2, top, veil, light);
    return g;
  }

  // ---------------- 角色 ----------------
  getOrCreateActor(ent) {
    if (this.actors.has(ent.id)) return this.actors.get(ent.id);
    let built;
    const v = ent.visual || {};
    if (ent.kind === 'player') {
      built = buildPlayerModel(ent.classColor || DATA.classes[ent.classId]?.color || '#c9a227', WEAPON_BY_CLASS[ent.classId] || 'sword');
    } else if (ent.kind === 'companion') {
      built = buildHumanoid({
        color: '#43506b', accent: v.color || '#69CCF0',
        scale: v.scale || 1, weapon: WEAPON_BY_CLASS[ent.classId] || 'sword', cape: true,
      });
      built.group.add(shadowBlob(0.6));
    } else {
      built = buildMonster(v.model || 'humanoid', v.color || '#7a6a4a', v.scale || 1);
    }
    const holder = new THREE.Group();
    holder.add(built.group);
    const y = this.heightAt(ent.x, ent.z);
    holder.position.set(ent.x, y, ent.z);
    holder.rotation.y = ent.yaw || 0;
    this.actorGroup.add(holder);
    const shadows = [];
    built.group.traverse((o) => { if (o.userData?.isShadow) shadows.push(o); });
    const actor = { holder, model: built.group, parts: built.parts, ent, shadows, anim: { attackAt: 0, deadAt: 0 }, baseY: y };
    this.actors.set(ent.id, actor);
    return actor;
  }

  removeActor(id) {
    const a = this.actors.get(id);
    if (!a) return;
    this.actorGroup.remove(a.holder);
    this.actors.delete(id);
  }

  sync(engine, dt) {
    this.engineRef = engine;
    this.time += dt;
    this.updateFx(dt);
    const t = this.time;
    for (const ent of engine.entities.values()) {
      const actor = this.getOrCreateActor(ent);
      const rp = this.engineRef?.renderPos ? this.engineRef.renderPos(ent) : ent;
      const y = this.heightAt(rp.x, rp.z) + (rp.h || 0);
      const prevX = actor.holder.position.x, prevZ = actor.holder.position.z;
      const targetY = y + (ent.dead ? 0 : Math.abs(Math.sin(t * 8 + ent.x)) * (ent.moving ? 0.07 : 0.02));
      actor.holder.position.x = lerp(actor.holder.position.x, rp.x, 0.5);
      actor.holder.position.z = lerp(actor.holder.position.z, rp.z, 0.5);
      actor.holder.position.y = lerp(actor.holder.position.y, targetY, 0.3);
      // 朝向最短路径插值
      let dy = (ent.yaw || 0) - actor.holder.rotation.y;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      actor.holder.rotation.y += dy * 0.25;

      const moving = !!ent.moving || !!ent.moveTarget ||
        Math.hypot(actor.holder.position.x - prevX, actor.holder.position.z - prevZ) > 0.012;
      const p = actor.parts;
      if (p.legL && p.legR) {
        const swing = moving ? Math.sin(t * 11) * 0.55 : Math.sin(t * 2) * 0.04;
        p.legL.rotation.x = swing;
        p.legR.rotation.x = -swing;
        if (p.armL) p.armL.rotation.x = -swing * 0.7;
        if (p.armR && !ent.cast) {
          const atk = this.time - actor.anim.attackAt;
          if (atk < 0.32) p.armR.rotation.x = -2.0 + atk * 5.5;
          else p.armR.rotation.x = swing * 0.7;
        } else if (p.armR) {
          p.armR.rotation.x = -2.2;
        }
      }
      if (p.legs && moving) {
        p.legs.forEach((leg, i) => { leg.rotation.z = Math.sin(t * 14 + i) * 0.22; });
      }

      if (ent.dead) {
        if (!actor.anim.deadAt) {
          actor.anim.deadAt = this.time;
          actor.holder.rotation.z = 0;
        }
        const k = clamp((this.time - actor.anim.deadAt) / 0.5, 0, 1);
        actor.holder.rotation.z = -k * Math.PI * 0.48;
        actor.holder.position.y = y + k * 0.1;
        if (this.time - actor.anim.deadAt > 6 && ent.kind !== 'player') actor.holder.visible = false;
      } else if (actor.anim.deadAt) {
        // 复活：清掉倒地状态，重新站起来
        actor.anim.deadAt = 0;
        actor.holder.rotation.z = 0;
        actor.holder.position.y = y;
        actor.holder.visible = true;
      } else if (!actor.holder.visible) {
        actor.holder.visible = true;
      }

      // 影子留在地面，跳起来的时候不会跟着飞
      if (actor.shadows?.length) {
        const lifted = rp.h || 0;
        for (const sh of actor.shadows) sh.position.y = 0.03 - lifted;
      }

      // 定身冰壳：按状态同步，死亡/复活/到期都会自动摘掉
      const frozen = !ent.dead && ent.auras.some((a) => a.kind === 'root');
      if (frozen && !actor.ice) {
        actor.ice = makeIceShell();
        actor.ice.scale.setScalar((ent.visual?.scale || 1) * (ent.boss ? 1.35 : 1));
        actor.holder.add(actor.ice);
      } else if (!frozen && actor.ice) {
        actor.holder.remove(actor.ice);
        actor.ice = null;
      }

      if (ent.kind === 'player') {
        actor.model.traverse((o) => {
          if (o.material && o.material.emissive && o.material.color?.getHex?.() === 0x43506b) o.material.emissive.setHex(0x000000);
        });
      }
    }
    // NPC 标记浮动
    for (const n of this.npcs) {
      if (n.marker) {
        n.marker.position.y = n.baseY + 2.5 + Math.sin(t * 2.2 + n.x) * 0.16;
        n.marker.rotation.y = t * 1.4;
      }
    }
    // 命中火花
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      const k = (this.time - sp.born) / 0.32;
      if (k >= 1) {
        this.fxGroup.remove(sp.mesh);
        sp.mesh.material.dispose();
        this.sparks.splice(i, 1);
        continue;
      }
      sp.mesh.scale.setScalar(sp.size * (0.4 + k * 1.9));
      sp.mesh.material.opacity = 0.75 * (1 - k);
    }
    // 地面预警
    for (const [gid, tg] of this.telegraphs) {
      const k = clamp((this.time - tg.born) / Math.max(0.2, tg.delay), 0, 1);
      tg.fill.scale.setScalar(Math.max(0.01, tg.radius * k));
      tg.ring.material.opacity = 0.5 + Math.sin(this.time * 12) * 0.25;
      if (this.time - tg.born > tg.delay + 0.5) this.removeTelegraph(gid);
    }
  }

  /** 学派配色与弹体风格 */
  static FX = {
    frost:    { color: '#bfe9ff', glow: '#3f8fc8', shape: 'ico', speed: 26, spin: 9 },
    fire:     { color: '#ffb066', glow: '#ff5a1f', shape: 'ico', speed: 24, spin: 14 },
    arcane:   { color: '#c9a0ff', glow: '#7a4ad0', shape: 'oct', speed: 28, spin: 16 },
    holy:     { color: '#ffe9a8', glow: '#c9a227', shape: 'oct', speed: 30, spin: 6 },
    shadow:   { color: '#a06bd8', glow: '#5a2a8a', shape: 'ico', speed: 22, spin: 10 },
    nature:   { color: '#9fe08a', glow: '#3f8f2a', shape: 'ico', speed: 25, spin: 8 },
    physical: { color: '#e8dcc8', glow: '#6b5227', shape: 'oct', speed: 34, spin: 0 },
  };

  fxMat(color, glow, opacity = 1) {
    if (!this.fxMats) this.fxMats = new Map();
    const key = color + '|' + glow + '|' + opacity;
    if (!this.fxMats.has(key)) {
      const m = new THREE.MeshLambertMaterial({
        color, emissive: glow, emissiveIntensity: 1.1, transparent: opacity < 1, opacity,
      });
      m.userData.shared = true;
      this.fxMats.set(key, m);
    }
    return this.fxMats.get(key);
  }

  fxGeo(shape) {
    if (!this.fxGeos) this.fxGeos = {};
    if (!this.fxGeos[shape]) {
      const g = shape === 'oct' ? new THREE.OctahedronGeometry(0.24, 0) : new THREE.IcosahedronGeometry(0.22, 0);
      g.userData.shared = true;
      this.fxGeos[shape] = g;
    }
    return this.fxGeos[shape];
  }

  /** 法术弹道：从施法者飞向目标，途中跟随目标位置 */
  castBolt({ from, toId, to, school = 'arcane', size = 1 }) {
    if (this.bolts.length > 24) return;
    const fx = World.FX[school] || World.FX.arcane;
    const geo = this.fxGeo(fx.shape);
    const core = new THREE.Mesh(geo, this.fxMat(fx.color, fx.glow));
    core.scale.setScalar(1.5 * size);
    core.userData.boltScale = 1.5 * size;

    // 外层光晕：让弹体在远处也能看清
    const halo = new THREE.Mesh(geo, this.fxMat(fx.color, fx.glow, 0.22));
    halo.scale.setScalar(2.6);
    core.add(halo);

    // 彗尾：沿飞行方向拖在后面
    const tail = new THREE.Mesh(geo, this.fxMat(fx.color, fx.glow, 0.34));
    tail.scale.set(0.55, 0.55, 2.6);
    tail.position.z = -0.55;
    core.add(tail);

    const y = this.heightAt(from.x, from.z) + 1.35;
    core.position.set(from.x, y, from.z);
    core.lookAt(from.x, y, from.z + 1);
    this.fxGroup.add(core);

    // 目标位置：优先用传入坐标，其次现场查实体；都拿不到就朝当前朝向飞一小段
    let tx = to && to.x != null ? to.x : null;
    let tz = to && to.z != null ? to.z : null;
    if (tx == null && toId && this.engineRef) {
      const t = this.engineRef.get(toId);
      if (t) { tx = t.x; tz = t.z; }
    }
    if (tx == null) {
      tx = from.x + Math.sin(this.rig ? this.rig.yaw : 0) * 6;
      tz = from.z + Math.cos(this.rig ? this.rig.yaw : 0) * 6;
    }

    this.bolts.push({
      mesh: core, school, size,
      tx, tz,
      toId: toId || null,
      speed: fx.speed,
      life: 0,
    });
  }

  /** 近战斩击：目标处一道快速张开的弧环 */
  slash(x, z, school = 'physical') {
    const fx = World.FX[school] || World.FX.physical;
    const m = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.95, 14, 1, -0.9, 1.8),
      this.fxMat(fx.color, fx.glow, 0.9)
    );
    m.position.set(x, this.heightAt(x, z) + 1.15, z);
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = Math.random() * Math.PI * 2;
    this.fxGroup.add(m);
    this.shards.push({ mesh: m, kind: 'arc', life: 0, max: 0.18 });
  }

  /** 自身范围技：脚下扩散的冲击环 */
  shockwave(x, z, radius, school = 'frost') {
    const fx = World.FX[school] || World.FX.frost;
    const m = new THREE.Mesh(
      new THREE.RingGeometry(0.6, 0.95, 36),
      this.fxMat(fx.color, fx.glow, 0.85)
    );
    m.position.set(x, this.heightAt(x, z) + 0.08, z);
    m.rotation.x = -Math.PI / 2;
    this.fxGroup.add(m);
    this.shards.push({ mesh: m, kind: 'wave', life: 0, max: 0.45, radius: radius || 8 });
  }

  /** 治疗：目标脚下升起的光柱 */
  bless(x, z) {
    const fx = World.FX.holy;
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.75, 3.2, 10, 1, true),
      this.fxMat(fx.color, fx.glow, 0.3)
    );
    m.position.set(x, this.heightAt(x, z) + 1.6, z);
    this.fxGroup.add(m);
    this.shards.push({ mesh: m, kind: 'bless', life: 0, max: 0.6 });
  }

  /** 命中：一圈冲击环 + 几粒碎片 */
  impact(x, z, school = 'arcane', size = 1) {
    const fx = World.FX[school] || World.FX.arcane;
    const y = this.heightAt(x, z) + 1.05;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.42, 18),
      this.fxMat(fx.color, fx.glow, 0.9)
    );
    ring.position.set(x, y, z);
    ring.rotation.x = -Math.PI / 2;
    ring.scale.setScalar(size);
    ring.userData.baseScale = size;
    this.fxGroup.add(ring);
    this.shards.push({ mesh: ring, kind: 'impact', life: 0, max: 0.3 });

    const geo = this.fxGeo('oct');
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(geo, this.fxMat(fx.color, fx.glow, 0.95));
      m.position.set(x, y, z);
      m.scale.setScalar(0.55 * size);
      const a = Math.random() * Math.PI * 2, sp = 2.4 + Math.random() * 2.4;
      this.fxGroup.add(m);
      this.shards.push({
        mesh: m, kind: 'debris', life: 0, max: 0.45,
        vx: Math.sin(a) * sp, vy: 2.2 + Math.random() * 1.8, vz: Math.cos(a) * sp,
      });
    }
  }

  /** 每帧推进弹道与碎片 */
  updateFx(dt) {
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const b = this.bolts[i];
      b.life = (b.life || 0) + dt;
      const tgt = b.toId ? this.engineRef && this.engineRef.get(b.toId) : null;
      if (tgt && !tgt.dead) { b.tx = tgt.x; b.tz = tgt.z; }
      const dx = b.tx - b.mesh.position.x, dz = b.tz - b.mesh.position.z;
      const d = Math.hypot(dx, dz);
      const step = b.speed * dt;
      // 到达 / 目标消失 / 超时，都要收掉，绝不能留在场景里
      if (d <= step || d < 0.3 || b.life > 4) {
        this.impact(b.mesh.position.x, b.mesh.position.z, b.school, b.size);
        this.fxGroup.remove(b.mesh);
        this.bolts.splice(i, 1);
        continue;
      }
      const k = step / d;
      b.mesh.position.x += dx * k;
      b.mesh.position.z += dz * k;
      b.mesh.position.y = this.heightAt(b.mesh.position.x, b.mesh.position.z) + 1.25 + Math.sin(this.time * 10 + i) * 0.05;
      b.mesh.lookAt(b.tx, b.mesh.position.y, b.tz);
    }

    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.life += dt;
      const k = Math.min(1, s.life / s.max);
      if (s.kind === 'arc') {
        s.mesh.scale.setScalar(1 + k * 1.6);
        s.mesh.material.opacity = 0.9 * (1 - k);
      } else if (s.kind === 'wave') {
        s.mesh.scale.setScalar(1 + (s.radius || 8) * k * 0.42);
        s.mesh.material.opacity = 0.85 * (1 - k);
      } else if (s.kind === 'bless') {
        s.mesh.position.y += dt * 1.6;
        s.mesh.material.opacity = 0.3 * (1 - k);
      } else if (s.kind === 'impact') {
        s.mesh.scale.setScalar((0.6 + k * 2.2) * s.mesh.userData.baseScale);
        s.mesh.material.opacity = 0.9 * (1 - k);
      } else {
        s.mesh.position.x += s.vx * dt;
        s.mesh.position.z += s.vz * dt;
        s.mesh.position.y += s.vy * dt;
        s.vy -= 9 * dt;
        s.mesh.scale.multiplyScalar(1 - dt * 2.2);
      }
      if (s.life >= s.max) {
        this.fxGroup.remove(s.mesh);
        this.shards.splice(i, 1);
      }
    }
  }

  spark(x, z, color = '#ffffff', size = 0.7) {
    if (this.sparks.length > 14) return;
    const y = this.heightAt(x, z) + 1.1;
    if (!this.sparkGeo) this.sparkGeo = new THREE.RingGeometry(0.45, 0.72, 10);
    const mesh = new THREE.Mesh(
      this.sparkGeo,
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false })
    );
    mesh.position.set(x, y, z);
    mesh.rotation.y = this.rig.yaw + Math.PI / 2;
    this.fxGroup.add(mesh);
    this.sparks.push({ mesh, born: this.time, size });
  }

  spawnTelegraph(evt) {
    const tg = makeTelegraph(evt.radius);
    tg.group.position.set(evt.x, this.heightAt(evt.x, evt.z) + 0.02, evt.z);
    this.fxGroup.add(tg.group);
    this.telegraphs.set(evt.gid, { ...tg, born: this.time, delay: (evt.delay || 1200) / 1000, gid: evt.gid });
  }

  flashTelegraph(gid) {
    const tg = this.telegraphs.get(gid);
    if (!tg) return;
    tg.fill.scale.setScalar(tg.radius);
    tg.fill.material.opacity = 0.5;
    tg.ring.material.opacity = 1;
    setTimeout(() => this.removeTelegraph(gid), 200);
  }

  clearTelegraphs() {
    for (const [gid] of this.telegraphs) this.removeTelegraph(gid);
  }

  removeTelegraph(gid) {
    const tg = this.telegraphs.get(gid);
    if (!tg) return;
    this.fxGroup.remove(tg.group);
    this.telegraphs.delete(gid);
  }

  /** 释放只属于当前区域、没有共用标记的几何与材质 */
  disposeTree(root) {
    root.traverse((o) => {
      if (o.geometry && !o.geometry.userData?.shared) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of mats) if (!m.userData?.shared) m.dispose();
    });
  }

  clear() {
    for (const a of this.actors.values()) {
      this.actorGroup.remove(a.holder);
      this.disposeTree(a.holder);
    }
    this.actors.clear();
    this.clearTelegraphs();
    for (const sp of this.sparks) { this.fxGroup.remove(sp.mesh); sp.mesh.material.dispose(); }
    this.sparks = [];
    for (const b of this.bolts) this.fxGroup.remove(b.mesh);
    this.bolts = [];
    for (const s of this.shards) this.fxGroup.remove(s.mesh);
    this.shards = [];
    this.disposeTree(this.staticGroup);
    this.staticGroup.clear();
    this.npcs = [];
    this.objects = [];
    this.colliders = [];
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  project(x, y, z) {
    const v = new THREE.Vector3(x, y, z).project(this.camera);
    return {
      x: (v.x * 0.5 + 0.5) * window.innerWidth,
      y: (-v.y * 0.5 + 0.5) * window.innerHeight,
      visible: v.z < 1 && v.z > -1,
    };
  }

  /** 世界坐标 → 距离相机远近，用于剔除远处名字板 */
  distanceToCamera(x, z) {
    return Math.hypot(this.camera.position.x - x, this.camera.position.z - z);
  }
}

export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.yaw = 0;
    this.pitch = 0.42;
    this.dist = 12;
    this.pos = new THREE.Vector3(0, 8, -12);
    this.lookY = 1.5;
    this.shake = 0;
    this.blockedAt = null;
    this.rayLimit = null;
    this.distCur = this.dist;
    this.lookCur = null;
  }

  handleDrag(dx, dy) {
    this.yaw -= dx * 0.005;
    this.pitch = clamp(this.pitch + dy * 0.004, 0.08, 1.05);
  }

  zoom(delta) {
    this.dist = clamp(this.dist + delta * 0.012, 6, 20);
  }

  update(target, heightAt, dt, isDead = false) {
    const pitch = isDead ? 0.85 : this.pitch;
    let dist = isDead ? 16 : this.dist;
    // 相机避障：解析求交，得到连续的可用距离；只挡高于镜头的障碍
    let wantDist = dist;
    const camH = this.lookY + Math.sin(pitch) * dist;
    if (this.rayLimit && !isDead) {
      const hx = Math.cos(pitch);
      const horiz = dist * hx;
      const dirX = -Math.sin(this.yaw);
      const dirZ = -Math.cos(this.yaw);
      const lim = this.rayLimit(target.x, target.z, dirX, dirZ, horiz, camH);
      if (lim < horiz - 0.01) wantDist = Math.max(3.2, lim / Math.max(hx, 0.25));
    }
    if (isDead) {
      this.distCur = 16;
    } else {
      // 收要快（别穿墙），放要慢（别弹跳），并限制单帧位移
      const k = 1 - Math.exp(-dt * (wantDist < this.distCur ? 24 : 5));
      const next = lerp(this.distCur, wantDist, k);
      const cap = (wantDist < this.distCur ? 9 : 5) * dt;
      this.distCur += Math.max(-cap, Math.min(cap, next - this.distCur));
    }
    dist = this.distCur;
    const cx = target.x - Math.sin(this.yaw) * Math.cos(pitch) * dist;
    const cz = target.z - Math.cos(this.yaw) * Math.cos(pitch) * dist;
    let cy = target.y + this.lookY + Math.sin(pitch) * dist;
    const ty = heightAt(cx, cz);
    if (cy < ty + 1.4) cy = ty + 1.4;
    const k = 1 - Math.exp(-dt * 8);
    this.pos.x = lerp(this.pos.x, cx, k);
    this.pos.y = lerp(this.pos.y, cy, k);
    this.pos.z = lerp(this.pos.z, cz, k);
    this.camera.position.copy(this.pos);
    // 看向点的高度和相机位置用同样的平滑系数，跳跃时才不会上下抖
    const wantLookY = target.y + this.lookY;
    this.lookCur = this.lookCur == null ? wantLookY : lerp(this.lookCur, wantLookY, k);
    if (this.shake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.shake;
      this.camera.position.y += (Math.random() - 0.5) * this.shake;
      this.shake = Math.max(0, this.shake - dt * 2);
    }
    this.camera.lookAt(target.x, this.lookCur, target.z);
  }

  forward() {
    return { x: Math.sin(this.yaw), z: Math.cos(this.yaw) };
  }

  right() {
    // forward = (sin yaw, cos yaw)，右手系下屏幕右方向是 cross(up, forward)
    return { x: -Math.cos(this.yaw), z: Math.sin(this.yaw) };
  }
}

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
