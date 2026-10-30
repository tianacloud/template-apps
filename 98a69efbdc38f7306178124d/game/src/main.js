// 入口：装配渲染、战斗、UI、存档，并驱动主循环。

import { loadData, DATA, itemById } from './data/gamedata.js';
import { Engine } from './combat/engine.js';
import { World } from './world/scene.js';
import { Overlay } from './render/overlay.js';
import { HUD } from './ui/hud.js';
import { Panels } from './ui/panels.js';
import { Login } from './ui/login.js';
import {
  G, createPlayer, applySave, serialize, setContext, progressObjective,
  handleDeath, countItem, removeItem, log, setParty, recalc, touch,
} from './game/state.js';
import { saveSlot, loadSlot, exportSave, pickJsonFile } from './save/db.js';
import { bus, clamp, TAU } from './core/util.js';
import { initAudio, sfx } from './core/audio.js';

const S = {
  engine: null,
  world: null,
  overlay: null,
  hud: null,
  panels: null,
  login: null,
  running: false,
  currentSlot: 1,
  keys: new Set(),
  spawns: [],
  zoneToken: 0,
  escort: null,
  interact: null,
  returnPos: null,
  last: 0,
  saveTimer: null,
};

// ---------------- 启动 ----------------
async function boot() {
  const loading = document.getElementById('loading');
  loading.classList.remove('hidden');
  try {
    await loadData();
    S.world = new World(document.getElementById('view'));
    S.world.loadZone(DATA.zones.barrens);
    S.overlay = new Overlay(S.world);
    S.hud = new HUD(S.world);
    S.panels = new Panels();
    S.login = new Login({ onNew: newGame, onLoad: loadGame, onImport: importGame });
    S.login.show();
    loading.classList.add('hidden');
    const pending = sessionStorage.getItem('aize_load_slot');
    if (pending) {
      sessionStorage.removeItem('aize_load_slot');
      const data = await loadSlot(Number(pending));
      if (data) loadGame(data, Number(pending));
    }
    requestAnimationFrame(loop);
  } catch (err) {
    loading.innerHTML = `<p style="color:#ff8a7a">载入失败：${err.message}</p><p style="color:#8d8069;font-size:12px">请检查登录状态和文件资源后刷新。</p>`;
    console.error(err);
  }
}

// ---------------- 主循环 ----------------
function loop(now) {
  const dt = Math.min(0.06, (now - S.last) / 1000 || 0.016);
  S.last = now;
  let stop = false;
  try {
    frame(dt, now);
    S.loopErrors = 0;
  } catch (err) {
    S.loopErrors = (S.loopErrors || 0) + 1;
    if (S.lastLoopError !== err.message) {
      S.lastLoopError = err.message;
      console.error('[主循环异常]', err);
      if (S.hud) S.hud.log('运行异常：' + err.message, 'warn');
    }
    // 连续报错才判定为不可恢复，避免一帧坏掉就整局卡死
    if (S.loopErrors > 120) {
      stop = true;
      showLoadError('游戏循环连续报错，已暂停', err);
    }
  }
  if (!stop) requestAnimationFrame(loop);
}

function frame(dt, now) {
  if (S.engine && S.running) {
    updateCameraKeys(dt);
    updateInputMove();
    S.engine.tick(now);
    drainEvents();
    updateEscort(dt);
    S.world.sync(S.engine, dt);
    updateCamera(dt);
    S.overlay.update(S.engine, dt, now);
    S.hud.update(dt);
    updateInteraction();
    S.world.render();
  } else if (S.world) {
    // 登录界面：镜头绕营地缓慢移动
    const t = now / 1000;
    const cam = S.world.camera;
    cam.position.set(Math.sin(t * 0.055) * 52, 26, Math.cos(t * 0.055) * 52 + 10);
    cam.lookAt(0, 4, 12);
    S.world.render();
  }
}

function updateCamera(dt) {
  const p = S.engine.player;
  if (!p) return;
  const y = S.world.heightAt(p.x, p.z) + (p.h || 0);
  if (!S.world.rig.rayLimit) {
    S.world.rig.rayLimit = (ox, oz, dx, dz, maxLen, camH) => {
      let best = maxLen;
      for (const c of S.world.colliders) {
        // 镜头比障碍物还高时不该被挡（帐篷、房子都在镜头下方）
        if (c.h != null && c.h < camH - 0.5) continue;
        if (c.type === 'circle') {
          if (!c.camBlock) continue;
          const R = (c.r || 3) * 0.92;
          const rx = ox - c.x, rz = oz - c.z;
          const b = 2 * (dx * rx + dz * rz);
          const cc = rx * rx + rz * rz - R * R;
          const disc = b * b - 4 * cc;
          if (disc <= 0) continue;
          const t = (-b - Math.sqrt(disc)) / 2;
          if (t > 0 && t < best) best = Math.max(0, t - 0.4);
        } else {
          const minX = c.x - c.hw - 0.35, maxX = c.x + c.hw + 0.35;
          const minZ = c.z - c.hd - 0.35, maxZ = c.z + c.hd + 0.35;
          let t0 = 0, t1 = best;
          if (Math.abs(dx) < 1e-6) {
            if (ox < minX || ox > maxX) continue;
          } else {
            let ta = (minX - ox) / dx, tb = (maxX - ox) / dx;
            if (ta > tb) { const tmp = ta; ta = tb; tb = tmp; }
            t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
          }
          if (Math.abs(dz) < 1e-6) {
            if (oz < minZ || oz > maxZ) continue;
          } else {
            let ta = (minZ - oz) / dz, tb = (maxZ - oz) / dz;
            if (ta > tb) { const tmp = ta; ta = tb; tb = tmp; }
            t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
          }
          if (t0 <= t1 && t0 < best) best = Math.max(0, t0 - 0.3);
        }
      }
      return best;
    };
  }
  const rp = S.engine.renderPos(p);
  S.world.rig.update({ x: rp.x, y, z: rp.z }, (x, z) => S.world.heightAt(x, z), dt, p.dead);
}

/** A/D 旋转镜头（不移动角色），1.9 弧度/秒 */
function updateCameraKeys(dt) {
  const dir = (S.keys.has('a') ? 1 : 0) - (S.keys.has('d') ? 1 : 0);
  if (!dir) return;
  S.world.rig.yaw += dir * 1.9 * dt;
}

function updateInputMove() {
  const p = S.engine.player;
  if (!p) return;
  const f = S.world.rig.forward();
  const r = S.world.rig.right();
  let x = 0, z = 0;
  if (S.keys.has('w')) { x += f.x; z += f.z; }
  if (S.keys.has('s')) { x -= f.x; z -= f.z; }
  if (S.keys.has('e')) { x += r.x; z += r.z; }
  if (S.keys.has('q')) { x -= r.x; z -= r.z; }
  const len = Math.hypot(x, z);
  if (len > 0) { x /= len; z /= len; }
  p.moveDir = { x, z };
  // 移动打断读条
  if (len > 0 && p.cast && !p.cast.channel) S.engine.cancelCast(p);
}

// ---------------- 开局 / 读档 ----------------
function newGame({ name, classId, difficulty, slot }) {
  initAudio();
  createPlayer({ name, classId, difficulty });
  S.currentSlot = slot || 1;
  startRuntime();
  enterZone('barrens');
  log(`欢迎来到艾泽，${G.player.name}。按 Tab 选中目标，1—8 放技能。`, 'system');
  log('和洛恩·石肩交谈（靠近后按 F）开始主线。', 'quest');
}

function loadGame(data, slot) {
  initAudio();
  S.currentSlot = slot || 1;
  bootInto(data, `读取存档：${data?.player?.name || ''}`);
}

function importGame(data) {
  S.currentSlot = 1;
  bootInto(data, '已导入外部存档。');
}

/**
 * 统一的「读档进游戏」入口：任何一步失败都要看得见，不能停在登录页什么都不发生。
 */
function bootInto(data, okMessage) {
  let stage = '读取存档';
  try {
    applySave(data);
    stage = '初始化战斗';
    startRuntime();
    stage = '载入区域';
    const zone = G.world.unlockedZones.includes(G.zoneId) ? G.zoneId : 'barrens';
    enterZone(zone, { loaded: true });
    log(`${okMessage}${G.player.name} · ${G.player.level} 级`, 'system');
  } catch (e) {
    console.error('[读档失败]', stage, e);
    // 区域载入失败时退回家园区域再试一次，尽量让人进得去
    if (stage === '载入区域') {
      try {
        enterZone('barrens', { loaded: true });
        showLoadError('区域载入失败，已退回荒瘠原', e);
        return;
      } catch (e2) { console.error('[退回失败]', e2); e = e2; }
    }
    resetToLogin();
    showLoadError(`进入游戏失败（${stage}）`, e);
  }
}

/** 读档失败时收回到登录页，不留半截界面 */
function resetToLogin() {
  S.running = false;
  try { S.panels?.close(); } catch (e) { /* ignore */ }
  document.getElementById('hud')?.classList.add('hidden');
  document.getElementById('panels')?.classList.add('hidden');
  document.getElementById('tooltip')?.classList.add('hidden');
  try { if (S.world) S.world.loadZone(DATA.zones.barrens); } catch (e) { S.world?.clear(); }
  S.login?.show();
}

/** 把错误原文摆到屏幕上，方便直接截图反馈 */
function showLoadError(title, err) {
  if (document.getElementById('load-error')) return;
  const msg = String((err && (err.stack || err.message)) || err || '未知错误').slice(0, 900);
  const div = document.createElement('div');
  div.id = 'load-error';
  div.className = 'load-error';
  div.innerHTML = `<div class="panel panel-modal" onclick="event.stopPropagation()">
    <div class="panel-head"><span>${title}</span><span class="close-x" data-x>×</span></div>
    <div class="panel-body">
      <p style="color:#e8dcc8;font-size:13px;line-height:1.8;margin:0 0 10px">角色没能进入游戏。下面的信息可以原样复制反馈：</p>
      <pre class="load-error-text">${msg.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))}</pre>
      <div class="qbtn-row"><button class="btn-gold" data-x>知道了</button></div>
    </div>
  </div>`;
  document.getElementById('app').appendChild(div);
  div.addEventListener('click', (e) => {
    if (e.target === div || e.target.hasAttribute('data-x')) div.remove();
  });
}

function startRuntime() {
  S.engine = new Engine({ seed: 20261022 });
  S.engine.difficulty = G.difficulty;
  S.engine.hooks = {
    canConsume: (type) => countItem(type) > 0,
    consume: (type) => removeItem(type, 1),
  };
  setContext({ engine: S.engine, world: S.world });
  S.engine.createPlayer(G.player);
  if (G.player.hp) S.engine.player.hp = Math.min(G.player.hp, S.engine.player.maxHp);
  S.hud.attach(S.engine);
  S.hud.onSkill = useSkill;
  S.login.hide();
  S.running = true;
  S.zoneToken++;
  document.getElementById('release-spirit').onclick = releaseSpirit;
  if (S.runtimeBound) return;
  S.runtimeBound = true;
  bus.on('travel', doTravel);
  bus.on('partyChanged', () => { syncCompanions(); S.hud.renderCompanions(); });
  bus.on('difficultyChanged', () => {
    S.engine.difficulty = G.difficulty;
    repopulate();
  });
  bus.on('questAccept', () => sfx('quest'));
  bus.on('questDone', () => sfx('quest'));
  bus.on('autosave', () => scheduleSave());
  bus.on('exportSave', () => {
    exportSave(serialize(), `艾泽残响-${G.player.name}-${G.player.level}级.json`);
    log('存档已导出为 JSON 文件。', 'system');
  });
  bus.on('importSave', async () => {
    const data = await pickJsonFile();
    if (!data) return;
    try {
      await saveSlot(3, data);
      sessionStorage.setItem('aize_load_slot', '3');
      location.reload();
    } catch (e) {
      alert('导入失败：' + e.message);
    }
  });
  bus.on('levelup', () => sfx('levelup'));
  setInterval(() => { if (S.running) doSave(S.currentSlot, true); }, 60000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && S.running) doSave(S.currentSlot, true);
  });
  bindInput();
}

// ---------------- 区域 ----------------
function enterZone(zoneId, opts = {}) {
  const eng = S.engine;
  const isDungeon = !!opts.dungeon;
  const def = isDungeon ? DATA.dungeons[opts.dungeon] : DATA.zones[zoneId];
  if (!def) return;
  const token = ++S.zoneToken;

  S.world.loadZone(def, { dungeon: isDungeon });
  eng.colliders = S.world.colliders;
  const h = def.size / 2 - 3;
  eng.bounds = { minX: -h, maxX: h, minZ: -h, maxZ: h };
  eng.grounds = [];
  eng.events = [];

  for (const id of [...eng.entities.keys()]) {
    if (id === 'player') continue;
    eng.entities.delete(id);
    S.world.removeActor(id);
  }
  S.overlay.clearPlates();
  S.escort = null;

  const p = eng.player;
  const spawn = isDungeon ? def.entry : (def.spawn || def.camp.pos);
  p.x = spawn[0];
  p.z = spawn[1];
  p.px = p.x;
  p.pz = p.z;
  p.yaw = 0;
  p.auras = [];
  p.cds = {};
  p.cast = null;
  p.target = null;
  p.inCombat = false;
  p.moveTarget = null;
  p.hp = clamp(p.hp, 1, p.maxHp);
  S.world.rig.pos.set(p.x - 4, S.world.heightAt(p.x, p.z) + 10, p.z - 12);
  S.world.rig.distCur = S.world.rig.dist;
  S.world.rig.lookCur = null;

  if (isDungeon) {
    G.dungeonId = opts.dungeon;
  } else {
    G.zoneId = zoneId;
    G.dungeonId = null;
    if (!G.world.visited.includes(zoneId)) {
      G.world.visited.push(zoneId);
      progressObjective('zone', zoneId, 1);
    }
  }

  populate();
  syncCompanions();
  S.hud.banner(isDungeon ? def.name : def.name, isDungeon ? def.sub : def.sub);
  S.hud.refresh();
  S.hud.renderCompanions();
  sfx('portal');
  if (!opts.loaded) scheduleSave();
  if (opts.dungeon) log(`你进入了副本：${def.name}。`, 'unlock');
  if (token !== S.zoneToken) return;
}

function populate() {
  const eng = S.engine;
  const zone = S.world.zone;
  const isDungeon = zone.isDungeon;
  const def = zone.def;
  const partySize = G.companions.active.length;
  S.spawns = [];

  const list = def.spawns || [];
  for (const sp of list) {
    const count = sp.count || 1;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU;
      const r = Math.sqrt(Math.random()) * (sp.radius || 8);
      const x = sp.center[0] + Math.cos(a) * r;
      const z = sp.center[1] + Math.sin(a) * r;
      eng.spawnMonster(sp.monster, x, z, { partySize });
    }
  }
  for (const b of def.bosses || []) {
    eng.spawnMonster(b.monster, b.pos[0], b.pos[1], { partySize });
  }
  if (!isDungeon) log(`你进入了 ${def.name}。`, 'unlock');
}

function repopulate() {
  const eng = S.engine;
  for (const e of [...eng.entities.values()]) {
    if (e.kind === 'monster') {
      eng.entities.delete(e.id);
      S.world.removeActor(e.id);
    }
  }
  populate();
  log('敌人已按新难度重新配置。', 'system');
}

function syncCompanions() {
  const eng = S.engine;
  for (const id of [...eng.entities.keys()]) {
    if (id.startsWith('comp_')) {
      eng.entities.delete(id);
      S.world.removeActor(id);
    }
  }
  const p = eng.player;
  G.companions.active.filter((id) => DATA.companions[id]).forEach((id, i) => {
    const ang = Math.PI + (i === 0 ? -0.6 : 0.6);
    const c = eng.spawnCompanion(id, G.player.level, p.x + Math.sin(ang) * 3.2, p.z + Math.cos(ang) * 3.2);
    if (!c) return;
    c.ai.command = 'follow';
  });
}

function doTravel(zoneId) {
  if (!G.world.unlockedZones.includes(zoneId)) { log('这个区域还没有解锁。', 'warn'); return; }
  if (!G.world.flight.includes(zoneId)) { log('这里没有已知的飞行点。', 'warn'); return; }
  if (G.dungeonId) { log('先离开副本。', 'warn'); return; }
  if (zoneId === G.zoneId) { log('你已经在这里了。', 'system'); return; }
  log('起飞。', 'system');
  const p = S.engine.player;
  p.hp = Math.min(p.maxHp, Math.round(p.hp * 1.15));
  enterZone(zoneId);
}

// ---------------- 副本 ----------------
function enterDungeon(dungeonId) {
  const d = DATA.dungeons[dungeonId];
  if (!d) return;
  if (G.player.level < d.level - 2) {
    log(`${d.name} 建议 ${d.level} 级再进。`, 'warn');
  }
  S.returnPos = { x: S.engine.player.x, z: S.engine.player.z };
  S.returnZone = G.zoneId;
  enterZone(G.zoneId, { dungeon: dungeonId });
  scheduleSave();
}

function exitDungeon() {
  if (!G.dungeonId) return;
  const d = DATA.dungeons[G.dungeonId];
  enterZone(S.returnZone || G.zoneId);
  const p = S.engine.player;
  if (S.returnPos) { p.x = S.returnPos.x; p.z = S.returnPos.z; }
  log(`你离开了 ${d.name}。`, 'system');
  scheduleSave();
}

// ---------------- 交互 ----------------

const SCHOOL_COLOR = {
  frost: '#bfe9ff', fire: '#ffb066', arcane: '#c9a0ff', holy: '#ffe9a8',
  shadow: '#c06bd8', nature: '#9fe08a', physical: '#e8dcc8',
};

/** 技能表现：远程飞弹、近战斩击、自身范围冲击波、治疗光柱 */
function castVfx(eng, evt) {
  const sk = DATA.skills[evt.skillId];
  const caster = eng.get(evt.id);
  if (!sk || !caster) return;
  const from = S.world.engineRef.renderPos(caster);

  // 以自身为中心的爆发（冰棱环、影舞、赞美诗…）
  if (sk.aoe && !sk.range) {
    S.world.shockwave(from.x, from.z, sk.aoe.radius || 8, sk.school || 'frost');
    return;
  }

  for (const tid of evt.targets || []) {
    const t = eng.get(tid);
    if (!t) continue;
    if (t.side === caster.side) {
      S.world.bless(t.x, t.z);
    } else if ((sk.range || 0) > 8) {
      S.world.castBolt({ from, toId: tid, school: sk.school || 'arcane', size: sk.aoe ? 1.25 : 1 });
    } else {
      S.world.slash(t.x, t.z, sk.school || 'physical');
    }
  }
}

function updateInteraction() {
  const p = S.engine.player;
  if (!p || p.dead) { S.interact = null; S.hud.setHint(null); return; }
  let best = null;
  const consider = (type, obj, x, z, range, label) => {
    const d = Math.hypot(p.x - x, p.z - z);
    if (d > range) return;
    if (!best || d < best.d) best = { type, obj, d, label };
  };
  for (const n of S.world.npcs) {
    consider('npc', n, n.x, n.z, 4.6, `与 ${n.name} 交谈`);
    if (n.role === 'flight') {
      const c = Math.hypot(p.x - n.x, p.z - n.z);
      if (c <= 4.6) consider('flight', n, n.x, n.z, 4.6, `使用飞行点`);
    }
    if (n.role === 'vendor') {
      const c = Math.hypot(p.x - n.x, p.z - n.z);
      if (c <= 4.6) consider('vendor', n, n.x, n.z, 4.6, `与 ${n.name} 交易`);
    }
  }
  for (const o of S.world.objects) {
    if (o.taken) continue;
    if (o.id === 'exit') { consider('exit', o, o.x, o.z, 5, '离开副本'); continue; }
    if (o.kind === 'portal') { consider('portal', o, o.x, o.z, 6, `进入 ${o.name}`); continue; }
    if (o.kind === 'pack') { consider('escort', o, o.x, o.z, 5, '护送驮马回营地'); continue; }
    const relevant = Object.entries(G.quests.active).some(([qid, st]) =>
      DATA.quests[qid].objectives.some((ob, i) => ob.kind === 'investigate' && ob.target === o.id && st.obj[i] < ob.count)
    );
    consider('object', o, o.x, o.z, 4, relevant ? `查看 ${o.name}` : `打量 ${o.name}`);
  }
  S.interact = best;
  S.hud.setHint(best ? `<b>F</b>${best.label}` : null);
}

function interact() {
  const it = S.interact;
  if (!it) return;
  if (it.type === 'npc') {
    progressObjective('talk', it.obj.id, 1);
    S.panels.open('npc', { npc: it.obj });
  } else if (it.type === 'flight') {
    S.panels.open('npc', { npc: it.obj });
  } else if (it.type === 'vendor') {
    S.panels.open('vendor', { npc: it.obj });
  } else if (it.type === 'portal') {
    enterDungeon(it.obj.meta.id);
  } else if (it.type === 'exit') {
    exitDungeon();
  } else if (it.type === 'escort') {
    startEscort(it.obj);
  } else if (it.type === 'object') {
    useObject(it.obj);
  }
}

function useObject(o) {
  const flavor = {
    stone: '你把松动的石块撬下来，塞进背包。',
    trace: '泥地上有拖拽的痕迹，还有半枚靴印。他往营地西边去了。',
    rune: '符文在你指尖下发烫，脑子里响起一声钟。',
    tomb: '碑上的名字被人磨平了，只剩一个模糊的刻痕。',
    anvil: '铁砧被熔穿了一个洞，边缘还是温的。',
  }[o.kind] || '你看了看，没看出什么。';
  const active = Object.entries(G.quests.active).some(([qid, st]) =>
    DATA.quests[qid].objectives.some((ob, i) => ob.kind === 'investigate' && ob.target === o.id && st.obj[i] < ob.count)
  );
  if (active) {
    progressObjective('investigate', o.id, 1);
    o.taken = true;
    if (o.mesh) o.mesh.visible = false;
    sfx('loot');
  }
  log(flavor, 'system');
}

function startEscort(o) {
  if (S.escort) return;
  const ent = S.engine.addEntity({
    id: 'escort_pack', name: '受惊的驮马', side: 'player', kind: 'escort', level: 1,
    maxHp: 1, x: o.x, z: o.z, speed: 6.2,
    visual: { model: 'beast', color: '#8a6a45', scale: 0.85 },
  });
  S.escort = { ent, dest: o.dest || [0, 0], obj: o.id, mesh: o };
  o.taken = true;
  if (o.mesh) o.mesh.visible = false;
  log('驮马跟上了你。把它带回营地。', 'quest');
}

function updateEscort(dt) {
  if (!S.escort) return;
  const p = S.engine.player;
  const e = S.escort.ent;
  if (!e || e.dead) { S.escort = null; return; }
  const d = Math.hypot(p.x - e.x, p.z - e.z);
  if (d > 4.5) S.engine.moveTowards(e, p.x, p.z, dt * 1000, 3.2);
  else e.moving = false;
  const [dx, dz] = S.escort.dest;
  if (Math.hypot(p.x - dx, p.z - dz) < 11) {
    progressObjective('escort', S.escort.obj, 1);
    log('驮马回到了营地，塞琳松了口气。', 'quest');
    S.engine.entities.delete(e.id);
    S.world.removeActor(e.id);
    S.escort = null;
  }
}

// ---------------- 战斗事件 ----------------
function drainEvents() {
  const eng = S.engine;
  for (const evt of eng.drainEvents()) {
    switch (evt.t) {
      case 'damage': {
        const dst = eng.get(evt.dstId);
        if (!dst) break;
        if (!evt.dot) {
          const isCrit = evt.crit;
          S.world.spark(dst.x, dst.z, isCrit ? '#ffd100' : dst.side === 'enemy' ? '#ff9a7a' : '#ff4a3a', isCrit ? 1.1 : 0.75);
        }
        const isPlayerSide = dst.side === 'player';
        const cls = evt.crit ? 'crit' : evt.dot ? 'dot' : isPlayerSide ? 'taken' : '';
        const txt = evt.absorbed > 0 ? `-${Math.round(evt.amount)}` : `${evt.crit ? '暴击 ' : ''}${Math.round(evt.amount)}`;
        S.overlay.float(txt, cls, dst.x, dst.z, 2.1 + Math.random() * 0.4);
        if (evt.srcId === 'player' || dst.side === 'player') {
          if (evt.crit) sfx('crit'); else if (Math.random() < 0.5) sfx('hit');
        }
        break;
      }
      case 'heal':
        if (evt.amount > 0) S.overlay.float(`+${Math.round(evt.amount)}`, 'heal', eng.get(evt.dstId)?.x || 0, eng.get(evt.dstId)?.z || 0, 2.1);
        if (evt.dstId === 'player') sfx('heal');
        break;
      case 'absorb': {
        const d = eng.get(evt.id);
        if (d) S.overlay.float(`吸收 ${Math.round(evt.amount)}`, 'absorb', d.x, d.z, 2.3);
        break;
      }
      case 'swing': {
        const a = S.world.actors.get(evt.id);
        if (a) a.anim.attackAt = S.world.time;
        break;
      }
      case 'skill': {
        const a = S.world.actors.get(evt.id);
        if (a) a.anim.attackAt = S.world.time;
        if (evt.id === 'player') sfx('cast');
        castVfx(eng, evt);
        // 队友施法时在头顶浮一下技能名
        const caster = eng.get(evt.id);
        const sk = DATA.skills[evt.skillId];
        if (caster && caster.kind === 'companion' && sk) {
          S.overlay.castName(caster.x, caster.z, sk.name, SCHOOL_COLOR[sk.school] || '#ffe9a8');
        }
        break;
      }
      case 'death': onDeath(evt);
        break;
      case 'castStart': {
        if (evt.id === 'player') sfx('cast');
        break;
      }
      case 'castEnd': {
        if (evt.interrupted) {
          const e = eng.get(evt.id);
          if (e) S.overlay.float('打断！', 'crit', e.x, e.z, 2.8);
          sfx('interrupt');
        }
        break;
      }
      case 'groundSpawn':
        S.world.spawnTelegraph(evt);
        break;
      case 'groundExplode': {
        S.world.flashTelegraph(evt.gid);
        const p = eng.player;
        if (p && Math.hypot(p.x - evt.x, p.z - evt.z) < evt.radius + 3) S.world.rig.shake = 0.22;
        break;
      }
      case 'groundClear':
        for (const [gid, tg] of S.world.telegraphs) {
          if (tg.srcId === evt.srcId) S.world.removeTelegraph(gid);
        }
        break;
      case 'revive':
        S.hud.renderCompanions();
        break;
      case 'taunt': {
        const e = eng.get(evt.id);
        if (e) S.overlay.float('嘲讽', 'dot', e.x, e.z, 2.6);
        break;
      }
      case 'phase': {
        S.hud.banner(eng.get(evt.id)?.name || '首领', evt.label);
        break;
      }
      case 'log':
        S.hud.log(evt.text, evt.tone || 'system');
        break;
    }
  }
}

function onDeath(evt) {
  const eng = S.engine;
  const ent = eng.get(evt.id);
  if (!ent) return;

  if (evt.kind === 'monster') {
    const res = handleDeath(ent);
    if (evt.boss) {
      sfx('levelup');
      S.hud.banner(ent.name, '已被击败');
      if (res && res.drops?.length) {
        setTimeout(() => S.panels.open('loot', { drops: res.drops }), 900);
      }
      const d = G.dungeonId;
      if (d) {
        const remaining = [...eng.entities.values()].filter((x) => x.boss && !x.dead);
        if (!remaining.length && !G.world.cleared.includes(d)) {
          G.world.cleared.push(d);
          log(`${DATA.dungeons[d].name} 已通关。`, 'unlock');
          bus.emit('autosave');
        }
      }
    } else if (Math.random() < 0.35) {
      sfx('loot');
    }
    // 掉了东西再提示一次
    if (res?.drops?.length) {
      const p = res.drops.map((x) => itemById(x.id)?.name).filter(Boolean);
      if (p.length) log(`拾取：${p.join('、')}`, 'system');
    }
    const token = S.zoneToken;
    setTimeout(() => {
      if (token !== S.zoneToken) return;
      eng.entities.delete(evt.id);
      S.world.removeActor(evt.id);
    }, 6000);
    // 野外 45 秒重生
    if (!S.world.zone.isDungeon) {
      const sx = ent.spawn.x, sz = ent.spawn.z;
      const mid = ent.meta.monsterId;
      setTimeout(() => {
        if (token !== S.zoneToken || !S.running) return;
        if (!S.world.zone.isDungeon) eng.spawnMonster(mid, sx, sz, { partySize: G.companions.active.length });
      }, 45000);
    }
  } else if (evt.kind === 'companion') {
    const c = eng.get(evt.id);
    if (c) c.reviveAt = eng.now + 10000;
    log(`${evt.name} 倒下了，10 秒后会回来。`, 'ally');
    sfx('death');
  } else if (evt.kind === 'player') {
    sfx('death');
    S.hud.log('你倒下了。按提示在营地复活。', 'warn');
  }
}

function releaseSpirit() {
  const eng = S.engine;
  const p = eng.player;
  if (!p?.dead) return;
  const def = S.world.zone.isDungeon ? DATA.dungeons[S.world.zone.def.id] : S.world.zone.def;
  const spawn = S.world.zone.isDungeon ? def.entry : def.camp.pos;
  p.x = spawn[0];
  p.z = spawn[1] + 4;
  p.px = p.x;
  p.pz = p.z;
  p.target = null;
  eng.revive(p, 0.35);
  eng.clearGrounds?.();
  S.world.clearTelegraphs();
  document.getElementById('death-overlay').classList.add('hidden');
  log('你的灵魂回到了最近的营地。按 Tab 选中目标即可继续战斗。', 'system');
}

// ---------------- 技能与目标 ----------------
function useSkill(sid) {
  const eng = S.engine;
  const p = eng.player;
  if (!p || p.dead) return;
  const res = eng.useSkill('player', sid, p.target);
  if (!res.ok) {
    if (res.reason !== 'GCD' && res.reason !== '冷却中') {
      S.hud.log(res.reason, 'warn');
      sfx('error');
      const btn = [...document.querySelectorAll('.slot-btn')].find((b) => b.dataset.skill === sid);
      if (btn) { btn.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }], { duration: 180 }); }
    }
  }
  return res;
}

function targetNearest() {
  const eng = S.engine;
  const p = eng.player;
  const target = eng.nearestEnemy(p, 45);
  if (target) {
    p.target = target.id;
    log(`目标：${target.name}`, 'combat');
  } else {
    p.target = null;
    log('附近没有可攻击的目标。', 'warn');
  }
}

function selectAtScreen(x, y) {
  const eng = S.engine;
  const p = eng.player;
  let best = null, bd = 46;
  for (const e of eng.entities.values()) {
    if (e.side !== 'enemy' || e.dead) continue;
    const sp = S.world.project(e.x, S.world.heightAt(e.x, e.z) + 1.4, e.z);
    if (!sp.visible) continue;
    const d = Math.hypot(sp.x - x, sp.y - y);
    if (d < bd) { bd = d; best = e; }
  }
  if (best) {
    p.target = best.id;
  } else {
    p.target = null;
  }
}

// ---------------- 输入 ----------------
function bindInput() {
  if (S._bound) return;
  S._bound = true;
  const canvas = document.getElementById('view');

  window.addEventListener('keydown', (e) => {
    if (!S.running) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'q', 'e'].includes(k)) { S.keys.add(k); e.preventDefault(); return; }
    if (e.key === 'Tab') { e.preventDefault(); targetNearest(); return; }
    if (k === 'f') { e.preventDefault(); interact(); return; }
    if (k === 'escape') {
      if (S.panels.isOpen()) S.panels.close();
      else if (S.engine.player?.target) S.engine.player.target = null;
      return;
    }
    if (k === 'c') { S.panels.toggle('character'); return; }
    if (k === 'b') { S.panels.toggle('bags'); return; }
    if (k === 'l') { S.panels.toggle('quests'); return; }
    if (k === 'n') { S.panels.toggle('talents'); return; }
    if (k === 'm') { S.panels.toggle('map'); return; }
    if (k === 'p') { S.panels.toggle('party'); return; }
    if (k === 'h') { S.panels.toggle('help'); return; }
    if (k === ' ') { e.preventDefault(); initAudio(); if (S.engine.jump(S.engine.player)) sfx('jump'); return; }
    if (/^[0-9]$/.test(k)) {
      const cls = DATA.classes[G.player.classId];
      const idx = k === '0' ? 9 : Number(k) - 1;
      const sid = cls.skills[idx];
      if (sid) { initAudio(); useSkill(sid); }
    }
  });
  window.addEventListener('keyup', (e) => {
    S.keys.delete(e.key.toLowerCase());
  });
  window.addEventListener('blur', () => S.keys.clear());

  // 鼠标：左右键都能拖拽转视角；左键「按下→抬起不移动」才算点选目标
  let dragging = false, dragMoved = false, lastX = 0, lastY = 0, downX = 0, downY = 0, downBtn = -1;
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('mousedown', (e) => {
    initAudio();
    if (e.button !== 0 && e.button !== 2) return;
    dragging = true;
    dragMoved = false;
    downBtn = e.button;
    downX = lastX = e.clientX;
    downY = lastY = e.clientY;
    canvas.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup', (e) => {
    if (e.button !== downBtn) return;
    if (dragging) { dragging = false; canvas.style.cursor = 'default'; }
    // 左键没拖动 = 点选；右键不参与选择
    if (e.button === 0 && !dragMoved && S.running && !S.panels.isOpen()) {
      selectAtScreen(e.clientX, e.clientY);
    }
    downBtn = -1;
  });
  // 焦点丢失 / 指针离开文档时松开拖拽状态，避免相机“粘”在鼠标上
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    downBtn = -1;
    canvas.style.cursor = 'default';
  };
  window.addEventListener('blur', endDrag);
  document.addEventListener('mouseleave', endDrag);
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    if (!dragMoved && Math.hypot(e.clientX - downX, e.clientY - downY) > 3) dragMoved = true;
    if (!dragMoved) return;
    S.world.rig.handleDrag(e.clientX - lastX, e.clientY - lastY);
    lastX = e.clientX;
    lastY = e.clientY;
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    S.world.rig.zoom(e.deltaY);
  }, { passive: false });
  window.addEventListener('resize', () => S.world.resize());
}

// ---------------- 存档 ----------------
function scheduleSave() {
  clearTimeout(S.saveTimer);
  S.saveTimer = setTimeout(() => doSave(S.currentSlot, true), 900);
}

async function doSave(slot, silent = true) {
  if (!S.running || !S.engine || !G.player) return;
  try {
    const data = serialize();
    await saveSlot(slot, data);
    if (!silent) log('已保存到存档位 ' + slot + '。', 'system');
  } catch (e) {
    console.error('保存失败', e);
    log('保存失败，请检查网络并刷新核对存档：' + e.message, 'warn');
  }
}

bus.on('panelClosed', () => {
  if (!S.engine) return;
});

window.addEventListener('beforeunload', () => {
  if (S.running) doSave(S.currentSlot, true);
});

boot();

// 调试入口（用于自动化验证，不影响正常玩法）
window.__aize = { G, S, get engine() { return S.engine; }, start: newGame, enterZone, save: doSave };
