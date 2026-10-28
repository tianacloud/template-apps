// HUD：玩家框、目标框、动作条、读条、聊天、任务追踪、队友条、飘字与 tooltip。
// 全部由数据驱动渲染；每帧只更新变化的部分。

import { DATA, itemById, qualityOf, QUALITY, SLOTS, SLOT_LABEL } from '../data/gamedata.js';
import { G, MAX_LEVEL, engine, xpPct, log as pushLog, questReady, setDifficulty, setTrackedQuest } from '../game/state.js';
import { cachedGuide } from '../game/guide.js';
import { bus, fmt } from '../core/util.js';

const SCHOOL_COLOR = {
  physical: '#6b4a25', frost: '#2a6f9e', fire: '#a83c1e', arcane: '#5b3fa0',
  holy: '#b08a2a', shadow: '#4a2a6b', nature: '#3f6b2a',
};

const GLYPH = {
  axe: '<rect x="11.4" y="3.4" width="1.8" height="17.6" rx="0.5" fill="#8a6d3b"/><path d="M11.4 5.4 C7.4 4.9 4.7 7.2 4.4 10.6 C4.1 13.5 6.3 15.7 9 15.9 L11.4 15 Z" fill="#cfd5db"/><path d="M9 6.8 C7.4 8 6.6 10.4 6.8 12.8 L4.6 11.4 C4.6 8.8 6.4 6.9 9 6.8 Z" fill="#9aa1a8"/><path d="M13.2 6.6 C15.7 6 17.7 7.4 18.5 9.7 L13.2 10.5 Z" fill="#9aa1a8"/>',
  sword: '<path d="M12 2 L14 4 L14 15 L12 18 L10 15 L10 4 Z" fill="#e8dcc8"/><rect x="7" y="15" width="10" height="2" fill="#c9a227"/><rect x="11" y="17" width="2" height="5" fill="#8a6d3b"/>',
  claw: '<path d="M5 4 C8 8 8 14 6 20" stroke="#e8dcc8" stroke-width="2" fill="none"/><path d="M11 3 C14 8 14 14 12 20" stroke="#e8dcc8" stroke-width="2" fill="none"/><path d="M17 4 C20 9 20 15 18 20" stroke="#e8dcc8" stroke-width="2" fill="none"/>',
  shield: '<path d="M12 3 L20 6 V12 C20 17 16 20 12 21 C8 20 4 17 4 12 V6 Z" fill="#c9b06a" stroke="#f0e0b0" stroke-width="1"/>',
  boot: '<path d="M8 3.4 H13.2 V11.4 L19.2 15.6 C20.8 16.8 20.2 19.6 18 19.6 H8 Z" fill="#cfd5db"/><path d="M8 17.4 H19.6" stroke="#7c838a" stroke-width="1"/>',
  chain: '<circle cx="8" cy="8" r="3.4" fill="none" stroke="#d8c8a8" stroke-width="2"/><circle cx="16" cy="16" r="3.4" fill="none" stroke="#d8c8a8" stroke-width="2"/><path d="M10 10 L14 14" stroke="#d8c8a8" stroke-width="2"/>',
  fist: '<rect x="6" y="7" width="12" height="11" rx="3" fill="#d8c8a8"/><path d="M8 7 V4 M12 7 V3 M16 7 V4" stroke="#d8c8a8" stroke-width="2"/>',
  skull: '<circle cx="12" cy="10" r="6" fill="#e8e0d0"/><rect x="9" y="15" width="6" height="4" fill="#e8e0d0"/><circle cx="9.5" cy="10" r="1.6" fill="#1a1714"/><circle cx="14.5" cy="10" r="1.6" fill="#1a1714"/>',
  frost: '<g stroke="#bfe6ff" stroke-width="1.6" stroke-linecap="round"><path d="M12 2 V22"/><path d="M3.5 7 L20.5 17"/><path d="M20.5 7 L3.5 17"/><path d="M9 4 L12 6 L15 4"/><path d="M9 20 L12 18 L15 20"/></g>',
  fire: '<path d="M12 22 C7 18 8 13 11 9 C11 12 13 13 13 10 C15 13 17 15 17 18 C17 20 15 22 12 22 Z" fill="#ffb03a"/><path d="M12 22 C10 20 11 17 13 15 C13 18 15 18 14 20 Z" fill="#ffe28a"/>',
  aoe: '<circle cx="12" cy="12" r="9" fill="none" stroke="#d8c8a8" stroke-width="1.6"/><circle cx="12" cy="12" r="5" fill="none" stroke="#d8c8a8" stroke-width="1.4"/><circle cx="12" cy="12" r="1.8" fill="#ffd100"/>',
  blink: '<path d="M4 12 H15" stroke="#c9b8ff" stroke-width="2"/><path d="M13 7 L19 12 L13 17" fill="none" stroke="#c9b8ff" stroke-width="2"/><path d="M4 8 H8 M4 16 H8" stroke="#c9b8ff" stroke-width="1.4"/>',
  lock: '<rect x="6" y="10" width="12" height="10" rx="2" fill="#d8c8a8"/><path d="M9 10 V7 A3 3 0 0 1 15 7 V10" fill="none" stroke="#d8c8a8" stroke-width="2"/>',
  shieldfrost: '<path d="M12 3 L20 6 V12 C20 17 16 20 12 21 C8 20 4 17 4 12 V6 Z" fill="#7fb6d8" stroke="#dff2ff" stroke-width="1"/><path d="M12 7 V17 M8 10 L16 14 M16 10 L8 14" stroke="#dff2ff" stroke-width="1.2"/>',
  bolt: '<path d="M13 2 L6 13 H11 L10 22 L18 10 H13 Z" fill="#d8c8ff"/>',
  star: '<path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#e8dcc8"/>',
  holy: '<path d="M11 3 H13 V9 H19 V11 H13 V21 H11 V11 H5 V9 H11 Z" fill="#ffe9a0"/><circle cx="12" cy="12" r="9" fill="none" stroke="#ffe9a0" stroke-width=".8" opacity=".6"/>',
  heal: '<path d="M10 4 H14 V10 H20 V14 H14 V20 H10 V14 H4 V10 H10 Z" fill="#6ee66e"/>',
  hot: '<path d="M12 21 C6 16 8 9 12 4 C16 9 18 16 12 21 Z" fill="#6ee66e" opacity=".9"/><path d="M12 18 V9" stroke="#0f4d0f" stroke-width="1.2"/>',
  shieldholy: '<path d="M12 3 L20 6 V12 C20 17 16 20 12 21 C8 20 4 17 4 12 V6 Z" fill="#ffe9a0"/><path d="M12 7 V17 M8 11 H16" stroke="#8a6a12" stroke-width="2"/>',
  prayer: '<path d="M8 21 V12 C8 9 10 7 12 7 C14 7 16 9 16 12 V21" fill="none" stroke="#ffe9a0" stroke-width="2"/><path d="M6 21 H18" stroke="#ffe9a0" stroke-width="2"/>',
  dispel: '<circle cx="12" cy="12" r="8" fill="none" stroke="#cfe8ff" stroke-width="1.6"/><path d="M6 18 L18 6" stroke="#cfe8ff" stroke-width="2"/>',
  bigheal: '<path d="M10 3 H14 V9 H21 V13 H14 V21 H10 V13 H3 V9 H10 Z" fill="#8affb0"/>',
  hymn: '<circle cx="8" cy="17" r="3" fill="#ffe9a0"/><circle cx="17" cy="15" r="3" fill="#ffe9a0"/><path d="M11 17 V6 L20 4 V15" stroke="#ffe9a0" stroke-width="2" fill="none"/>',
  dagger: '<path d="M12 2 L14 10 L12 14 L10 10 Z" fill="#e8e0d0"/><rect x="9" y="14" width="6" height="2" fill="#c9a227"/><rect x="11" y="16" width="2" height="6" fill="#8a6d3b"/>',
  eye: '<path d="M2 12 C6 6 18 6 22 12 C18 18 6 18 2 12 Z" fill="none" stroke="#d8c8ff" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="#d8c8ff"/>',
  stealth: '<path d="M3 12 C7 8 17 8 21 12 C17 16 7 16 3 12 Z" fill="#9a8ac8" opacity=".85"/><circle cx="12" cy="12" r="2.4" fill="#1a1714"/>',
  poison: '<path d="M12 2 C16 8 18 12 18 15 A6 6 0 0 1 6 15 C6 12 8 8 12 2 Z" fill="#7fe07f"/><circle cx="10" cy="15" r="1.4" fill="#1a3a1a"/>',
  dance: '<path d="M5 20 L15 6" stroke="#ffe9a0" stroke-width="2"/><path d="M19 20 L9 6" stroke="#ffe9a0" stroke-width="2"/><circle cx="6" cy="6" r="2" fill="#e8dcc8"/>',
  potion: '<path d="M10 3 H14 V7 L18 12 V20 A2 2 0 0 1 16 22 H8 A2 2 0 0 1 6 20 V12 L10 7 Z" fill="#e05a7a" stroke="#f0d0d8"/><rect x="9" y="2" width="6" height="2" fill="#c9a227"/>',
  food: '<path d="M4 15 C4 10 7 7.4 12 7.4 C17 7.4 20 10 20 15 Z" fill="#d8a860"/><rect x="3.4" y="15" width="17.2" height="3.2" rx="0.6" fill="#8a6d3b"/><path d="M8.6 10.2 L10.4 12.8 M12 9.6 L13.8 12.2 M15.4 10.2 L17.2 12.8" stroke="#a8763a" stroke-width="1.1"/>',
  shadow: '<path d="M12 3 C6 6 6 16 12 21 C9 16 9 8 12 3 Z" fill="#b088e0"/><path d="M16 6 C19 10 19 14 16 18" stroke="#b088e0" stroke-width="1.6" fill="none"/>',
  web: '<g stroke="#d8d8d8" stroke-width="1.1"><path d="M12 2 V22 M2 12 H22 M4 4 L20 20 M20 4 L4 20"/><path d="M12 6 A6 6 0 0 1 18 12 A6 6 0 0 1 12 18 A6 6 0 0 1 6 12 A6 6 0 0 1 12 6" fill="none"/></g>',
  roar: '<path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="#e8dcc8"/><path d="M16 9 A4 4 0 0 1 16 15 M19 6 A8 8 0 0 1 19 18" stroke="#e8dcc8" stroke-width="1.6" fill="none"/>',
  mark: '<circle cx="12" cy="12" r="7" fill="none" stroke="#ff8a7a" stroke-width="1.6"/><path d="M12 1 V6 M12 18 V23 M1 12 H6 M18 12 H23" stroke="#ff8a7a" stroke-width="1.6"/>',
  bell: '<path d="M12 3 C8 3 7 7 7 11 L5 16 H19 L17 11 C17 7 16 3 12 3 Z" fill="#d8c48c"/><circle cx="12" cy="19" r="2" fill="#d8c48c"/>',
  summon: '<ellipse cx="12" cy="12" rx="5" ry="9" fill="none" stroke="#c9a2ff" stroke-width="1.6"/><ellipse cx="12" cy="12" rx="9" ry="4" fill="none" stroke="#c9a2ff" stroke-width="1.4"/><circle cx="12" cy="12" r="2" fill="#c9a2ff"/>',
  enrage: '<path d="M12 21 V6 M7 11 L12 5 L17 11" fill="none" stroke="#ff6a4a" stroke-width="2.2"/><path d="M6 21 H18" stroke="#ff6a4a" stroke-width="2"/>',
  stun: '<circle cx="12" cy="12" r="4" fill="#ffe28a"/><g stroke="#ffe28a" stroke-width="1.6"><path d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M5 5 L7 7 M17 17 L19 19 M19 5 L17 7 M7 17 L5 19"/></g>',
  rune: '<path d="M5 21 L12 3 L19 21 M8 15 H16" fill="none" stroke="#b088e0" stroke-width="2"/>',
  helm: '<path d="M5 13 C5 7 8 4 12 4 C16 4 19 7 19 13 L19 17 H15.5 V12 H8.5 V17 H5 Z" fill="#cfd5db"/><rect x="8.5" y="14" width="7" height="2" fill="#23262a"/>',
  chest: '<path d="M6.2 4.6 L9.2 3.6 C10.6 5.7 13.4 5.7 14.8 3.6 L17.8 4.6 L17.8 8.5 L16.2 9.5 L16.2 20.4 L7.8 20.4 L7.8 9.5 L6.2 8.5 Z" fill="#cfd5db"/><path d="M7.8 15.4 H16.2" stroke="#7c838a" stroke-width="1.1"/><path d="M10.3 4.1 L12 7.1 L13.7 4.1" fill="none" stroke="#7c838a" stroke-width="1.1"/>',
  leg: '<path d="M8 3.5 H16 L15.4 21 H13 L12 10.5 L11 21 H8.6 Z" fill="#cfd5db"/><rect x="8" y="3.5" width="8" height="2" fill="#6d7378"/>',
  glove: '<path d="M7.5 21 V11 C7.5 9.2 9.4 9.2 9.4 11 V7.5 C9.4 5.6 11.4 5.6 11.4 7.5 V6.5 C11.4 4.6 13.4 4.6 13.4 6.5 V8.5 C13.4 6.8 15.3 6.8 15.3 8.7 V14.5 L17.5 12.6 V17.5 C17.5 19.8 15.6 21 13.5 21 Z" fill="#cfd5db"/>',
  shoulder: '<path d="M3.6 15.8 C3.6 9.7 8.2 7.8 10.9 10.7 L9.4 16.4 Z" fill="#cfd5db"/><path d="M20.4 15.8 C20.4 9.7 15.8 7.8 13.1 10.7 L14.6 16.4 Z" fill="#cfd5db"/><path d="M10.4 9.4 H13.6" stroke="#7c838a" stroke-width="1.2"/>',
  staff: '<path d="M12 21 V9" stroke="#6b4a25" stroke-width="2.4"/><circle cx="12" cy="6" r="3" fill="#bfe9ff"/><circle cx="12" cy="6" r="1.4" fill="#eaf8ff"/>',
  mace: '<rect x="11" y="9" width="2" height="12" fill="#6b4a25"/><circle cx="12" cy="6.6" r="3.6" fill="#cfd5db"/><path d="M12 1.6 V3 M12 10.2 V11.6 M7.6 6.6 H9 M15 6.6 H16.4" stroke="#b8bec4" stroke-width="1.4"/>',
  ring: '<circle cx="12" cy="14.5" r="5.6" fill="none" stroke="#e8dcc8" stroke-width="2.2"/><circle cx="12" cy="7" r="2.4" fill="#bfe9ff"/>',
  neck: '<path d="M5.5 5.5 C7 14 17 14 18.5 5.5" fill="none" stroke="#e8dcc8" stroke-width="1.8"/><path d="M12 14 L14.4 17 L12 20.5 L9.6 17 Z" fill="#ffd100"/>',
  trinket: '<path d="M12 2.5 L15.5 9 L12 21.5 L8.5 9 Z" fill="#d9b3ff"/><circle cx="12" cy="9" r="2.2" fill="#fff"/><path d="M8.5 9 H15.5" stroke="#7a5aa8" stroke-width="1"/>',
  material: '<path d="M6 9.5 L18 9.5 L20 20 H4 Z" fill="#a8894f"/><path d="M6 9.5 C8.5 5.5 15.5 5.5 18 9.5" fill="none" stroke="#7d6437" stroke-width="1.6"/><path d="M9.5 13.5 V16.5 M14.5 13.5 V16.5" stroke="#7d6437" stroke-width="1.2"/>',
  quest: '<path d="M12 3 L21 12 L12 21 L3 12 Z" fill="#ffd100" opacity=".9"/><rect x="11" y="7" width="2" height="6.5" fill="#1a1714"/><rect x="11" y="15" width="2" height="2" fill="#1a1714"/>',
  mount: '<path d="M6 21 V12.5 C6 7.5 9 4 12 4 C15 4 18 7.5 18 12.5 V21 H15 V12.5 C15 9.5 14 7.5 12 7.5 C10 7.5 9 9.5 9 12.5 V21 Z" fill="#d8c48c"/><rect x="5" y="17" width="4" height="2" fill="#8a6d3b"/><rect x="15" y="17" width="4" height="2" fill="#8a6d3b"/>',

};

export function glyphSvg(key, school = 'physical', size = 24) {
  const bg = SCHOOL_COLOR[school] || '#6b4a25';
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">
    <defs><radialGradient id="g_${key}_${(bg + school).replace('#', '')}" cx="45%" cy="30%">
      <stop offset="0" stop-color="${bg}" stop-opacity="1"/><stop offset="1" stop-color="#0b0908"/></radialGradient></defs>
    <rect width="24" height="24" fill="url(#g_${key}_${(bg + school).replace('#', '')})"/>
    <rect x="0.5" y="0.5" width="23" height="23" fill="none" stroke="rgba(201,162,39,.35)"/>
    ${GLYPH[key] || GLYPH.star}
  </svg>`;
}

const ITEM_GLYPH = {
  potion: 'potion', food: 'food', mount_riding: 'mount',
};

export function itemGlyphKey(def) {
  if (!def) return 'material';
  if (ITEM_GLYPH[def.id]) return ITEM_GLYPH[def.id];
  if (def.type) return def.type;              // axe / sword / dagger / staff / mace
  const slot = def.slot || 'none';
  if (slot === 'head') return 'helm';
  if (slot === 'shoulder') return 'shoulder';
  if (slot === 'chest') return 'chest';
  if (slot === 'hand') return 'glove';
  if (slot === 'leg') return 'leg';
  if (slot === 'feet') return 'boot';
  if (slot === 'offhand') return 'shield';
  if (slot === 'neck') return 'neck';
  if (slot === 'ring' || slot === 'ring1' || slot === 'ring2') return 'ring';
  if (slot === 'trinket' || slot === 'trinket1' || slot === 'trinket2') return 'trinket';
  return def.quest ? 'quest' : 'material';
}

/** 物品图标：底色取品质色，图形取类型 */
export function itemIconSvg(def, size = 32) {
  const q = QUALITY[def?.quality] || QUALITY.common;
  const key = itemGlyphKey(def);
  const gid = 'i_' + String(def?.id || key).replace(/[^a-zA-Z0-9_-]/g, '');
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">
    <defs><radialGradient id="${gid}" cx="50%" cy="34%">
      <stop offset="0" stop-color="#241d16"/><stop offset="1" stop-color="#0b0908"/></radialGradient></defs>
    <rect width="24" height="24" fill="url(#${gid})"/>
    <rect width="24" height="24" fill="${q.color}" opacity="0.16"/>
    <rect x="0.5" y="0.5" width="23" height="23" fill="none" stroke="${q.color}" stroke-opacity=".55"/>
    ${GLYPH[key] || GLYPH.material}
  </svg>`;
}

const STATE_LABEL = { FOLLOW: '跟随', ENGAGE: '接战', ATTACK: '攻击', HEAL: '治疗', RETREAT: '撤退', REPOSITION: '躲红圈', DEAD: '阵亡' };

export class HUD {
  constructor(world) {
    this.world = world;
    this.engine = null;
    this.el = {
      hud: document.getElementById('hud'),
      pf: document.getElementById('player-frame'),
      tf: document.getElementById('target-frame'),
      actionbar: document.getElementById('actionbar'),
      xpbar: document.getElementById('xpbar'),
      chat: document.getElementById('chat'),
      tracker: document.getElementById('quest-tracker'),
      comp: document.getElementById('companion-bar'),
      castbar: document.getElementById('castbar'),
      targetCast: document.getElementById('target-cast'),
      hint: document.getElementById('interact-hint'),
      banner: document.getElementById('zone-banner'),
      death: document.getElementById('death-overlay'),
      diff: document.getElementById('difficulty-badge'),
      guide: document.getElementById('quest-guide'),
      guideArrow: document.querySelector('#quest-guide .qg-arrow'),
      guideTitle: document.querySelector('#quest-guide b'),
      guideText: document.querySelector('#quest-guide i'),
      miniCoord: document.getElementById('minimap-coord'),
      pAuras: document.getElementById('player-auras'),
      tAuras: document.getElementById('target-auras'),
    };
    this.barCache = {};
    this.slots = [];
    this.lastTrack = 0;
    this.guideAt = 0;
    this.guide = null;
    this.logLines = [];
    this.bindEvents();
  }

  bindEvents() {
    bus.on('log', ({ text, tone }) => this.log(text, tone));
    bus.on('changed', () => this.scheduleRefresh());
    bus.on('levelup', () => this.buildActionBar());
    // 点右侧任意一条任务即可切换追踪
    this.el.tracker.addEventListener('click', (e) => {
      const item = e.target.closest('[data-qid]');
      if (!item) return;
      const qid = item.dataset.qid;
      if (!G.quests.active[qid]) return;
      setTrackedQuest(G.tracked === qid ? null : qid);
      this.refresh();
    });
    this.el.diff.addEventListener('click', () => {
      const order = ['story', 'normal', 'challenge'];
      const next = order[(order.indexOf(G.difficulty) + 1) % 3];
      setDifficulty(next);
      this.el.diff.textContent = { story: '剧情', normal: '普通', challenge: '挑战' }[next];
    });
  }

  attach(engine) {
    this.engine = engine;
    this.buildActionBar();
    this.refresh();
    this.el.hud.classList.remove('hidden');
    this.el.diff.textContent = { story: '剧情', normal: '普通', challenge: '挑战' }[G.difficulty] || '普通';
  }

  scheduleRefresh() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => {
      this._raf = null;
      this.refresh();
    });
  }

  // ---------- 动作条 ----------
  buildActionBar() {
    if (!G.player) return;
    const cls = DATA.classes[G.player.classId];
    this.el.actionbar.innerHTML = '';
    this.slots = [];
    cls.skills.forEach((sid, i) => {
      const sk = DATA.skills[sid];
      const btn = document.createElement('div');
      btn.className = 'slot-btn';
      btn.dataset.skill = sid;
      const keyLabel = i === 9 ? '0' : String(i + 1);
      btn.innerHTML = `<div class="icon">${glyphSvg(sk.icon, sk.school)}</div>
        <div class="cd"></div><div class="cd-text"></div>
        <span class="key">${keyLabel}</span>
        ${sk.cost ? `<span class="cost">${sk.cost}</span>` : ''}`;
      btn.addEventListener('click', () => this.onSkillClick(sid));
      btn.addEventListener('mouseenter', (e) => this.showSkillTip(sid, e));
      btn.addEventListener('mouseleave', hideTooltip);
      this.el.actionbar.appendChild(btn);
      this.slots.push({ sid, btn, cdEl: btn.querySelector('.cd'), textEl: btn.querySelector('.cd-text') });
    });
  }

  onSkillClick(sid) {
    if (this.onSkill) this.onSkill(sid);
  }

  // ---------- 刷新静态信息 ----------
  refresh() {
    if (!G.player || !this.engine) return;
    const p = this.engine.player;
    const cls = DATA.classes[G.player.classId];
    this.el.pf.querySelector('.unit-name').textContent = G.player.name;
    this.el.pf.querySelector('.unit-level').textContent = G.player.level;
    this.el.pf.querySelector('.portrait').style.borderColor = cls.color;
    this.el.pf.querySelector('.portrait-glyph').textContent = cls.name[0];
    this.el.pf.querySelector('.portrait-glyph').style.color = cls.color;
    const resBar = this.el.pf.querySelector('.bar.res');
    resBar.className = 'bar res ' + cls.resource;
    this.el.tf.className = 'unit-frame' + (p?.target ? '' : ' hidden');

    this.renderTracker();
    this.renderCompanions();
    this.el.xpbar.querySelector('span').textContent =
      G.player.level >= MAX_LEVEL ? `已满级 · ${MAX_LEVEL}` : `${G.player.xp} / ${Math.round(require_xp(G.player.level))} 经验`;
  }

  renderTracker() {
    const active = Object.entries(G.quests.active);
    if (!active.length) {
      this.el.tracker.innerHTML = `<div class="qt-head">任务</div><div class="qt"><div class="qt-hint">在营地里找头上有金色感叹号的人接任务。</div></div>`;
      return;
    }
    let html = `<div class="qt-head">任务追踪${active.length > 1 ? ' · 点击切换' : ''}</div>`;
    for (const [qid, st] of active) {
      const q = DATA.quests[qid];
      if (!q) continue;
      const ready = questReady(qid);
      const tracking = G.tracked === qid;
      html += `<div class="qt ${tracking ? 'tracking' : ''}" data-qid="${qid}" title="点击追踪这条任务（再点一次取消）"><div class="qt-title ${ready ? 'done' : ''}">${tracking ? '<span class="qt-pin">▸</span>' : ''}${q.title}</div>`;
      q.objectives.forEach((o, i) => {
        const need = o.count || 1;
        const cur = st.obj[i] || 0;
        const done = cur >= need;
        html += `<div class="qt-obj ${done ? 'done' : ''}">· ${o.label} ${cur}/${need}</div>`;
      });
      if (ready) html += `<div class="qt-hint" style="color:#6ee66e">可以交了 · 找 ${DATA.quests[qid].turnin ? npcName(q.turnin) : '发布者'}</div>`;
      html += `</div>`;
    }
    this.el.tracker.innerHTML = html;
  }

  renderCompanions() {
    const ids = (G.companions.active || []).filter((id) => DATA.companions[id]);
    if (!ids.length) { this.el.comp.innerHTML = ''; return; }
    let html = '';
    for (const id of ids) {
      const c = DATA.companions[id];
      const ent = this.engine.get('comp_' + id);
      const state = ent?.dead ? 'DEAD' : ent?.ai?.state || 'FOLLOW';
      const cmd = ent?.ai?.command || 'follow';
      html += `<div class="comp ${ent?.dead ? 'dead' : ''}" data-comp="${id}" title="点击切换指令：跟随 / 攻击我的目标 / 原地停留">
        <div class="cp-icon" style="color:${c.color}">${c.name[0]}</div>
        <div class="cp-body">
          <div class="cp-name"><span>${c.name}</span><span class="cp-state">${STATE_LABEL[state] || ''}${cmd === 'stay' ? ' · 停留' : cmd === 'attack' ? ' · 集火' : ''}</span></div>
          <div class="bar hp"><i style="width:${ent ? (ent.hp / ent.maxHp) * 100 : 0}%"></i></div>
        </div>
      </div>`;
    }
    this.el.comp.innerHTML = html;
    this.el.comp.querySelectorAll('.comp').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.dataset.comp;
        const ent = this.engine.get('comp_' + id);
        if (!ent) return;
        const order = ['follow', 'attack', 'stay'];
        ent.ai.command = order[(order.indexOf(ent.ai.command || 'follow') + 1) % 3];
        pushLog(`${DATA.companions[id].name}：${ent.ai.command === 'follow' ? '跟着你。' : ent.ai.command === 'attack' ? '打你的目标。' : '留在这里。'}`, 'ally');
        this.renderCompanions();
      });
    });
  }

  // ---------- 每帧 ----------
  update(dt) {
    const eng = this.engine;
    if (!eng || !G.player) return;
    const p = eng.player;
    if (!p) return;
    const now = eng.now;

    // 玩家条
    setBar(this.el.pf.querySelector('.bar.hp'), p.hp, p.maxHp, `${fmt(p.hp)} / ${fmt(p.maxHp)}`);
    const cls = DATA.classes[G.player.classId];
    const resName = { mana: '法力', rage: '怒气', energy: '能量' }[cls.resource];
    setBar(this.el.pf.querySelector('.bar.res'), p.res, p.maxRes, `${resName} ${Math.round(p.res)}`);
    this.renderAuras(this.el.pAuras, p.auras);

    // 动作条
    const target = p.target ? eng.get(p.target) : null;
    for (const s of this.slots) {
      const sk = DATA.skills[s.sid];
      const cdLeft = Math.max(0, (p.cds[s.sid] || 0) - now);
      const gcdLeft = sk.gcd ? Math.max(0, p.gcdUntil - now) : 0;
      let pct = 0;
      if (cdLeft > 0) pct = cdLeft / Math.max(1, sk.cd);
      else if (gcdLeft > 0) pct = gcdLeft / sk.gcd;
      s.cdEl.style.setProperty('--cd', pct.toFixed(3));
      s.textEl.textContent = cdLeft > 1000 ? Math.ceil(cdLeft / 1000) : cdLeft > 0 ? (cdLeft / 1000).toFixed(1) : '';
      const noRes = sk.cost > 0 && p.res < sk.cost;
      const noCombo = sk.combo?.spend && p.combo <= 0;
      s.btn.classList.toggle('nomana', noRes || noCombo);
      s.btn.classList.toggle('disabled', cdLeft > 0 || gcdLeft > 0 || p.dead);
      s.btn.classList.toggle('ready-glow', cdLeft === 0 && gcdLeft === 0 && !noRes);
    }

    // 目标框
    if (target && !target.dead) {
      this.el.tf.classList.remove('hidden');
      this.el.tf.classList.toggle('elite', !!target.elite);
      this.el.tf.classList.toggle('boss', !!target.boss);
      this.el.tf.querySelector('.unit-name').textContent = target.name + (target.boss ? ' 【首领】' : target.elite ? ' 【精英】' : '');
      this.el.tf.querySelector('.unit-level').textContent = target.level;
      this.el.tf.querySelector('.portrait').style.borderColor = target.boss ? '#A335EE' : target.elite ? '#C9A227' : '#8a3a3a';
      this.el.tf.querySelector('.portrait-glyph').textContent = target.boss ? '☠' : '敌';
      setBar(this.el.tf.querySelector('.bar.hp'), target.hp, target.maxHp, `${fmt(target.hp)} / ${fmt(target.maxHp)}`);
      const tc = this.el.targetCast;
      if (target.cast) {
        tc.classList.remove('hidden');
        tc.classList.toggle('uninterruptible', !target.cast.interruptible);
        const prog = (now - target.cast.start) / (target.cast.end - target.cast.start);
        tc.querySelector('i').style.width = (prog * 100).toFixed(1) + '%';
        tc.querySelector('span').textContent = (DATA.skills[target.cast.skillId]?.name || '') + (target.cast.interruptible ? '（可打断）' : '');
      } else tc.classList.add('hidden');
      this.renderAuras(this.el.tAuras, target.auras);
    } else {
      this.el.tf.classList.add('hidden');
      this.el.targetCast.classList.add('hidden');
    }

    // 玩家读条
    if (p.cast) {
      this.el.castbar.classList.remove('hidden');
      const prog = (now - p.cast.start) / (p.cast.end - p.cast.start);
      this.el.castbar.querySelector('.bar > i').style.width = (prog * 100).toFixed(1) + '%';
      this.el.castbar.querySelector('.castbar-label span').textContent = DATA.skills[p.cast.skillId]?.name || '';
      this.el.castbar.querySelector('.castbar-label b').textContent = Math.max(0, ((p.cast.end - now) / 1000)).toFixed(1) + 's';
      this.el.castbar.querySelector('.bar').classList.toggle('uninterruptible', !p.cast.interruptible);
    } else this.el.castbar.classList.add('hidden');

    // XP
    this.el.xpbar.querySelector('i').style.width = (xpPct() * 100).toFixed(1) + '%';

    // 队友血量
    if (G.companions.active.length) {
      for (const id of G.companions.active) {
        const ent = eng.get('comp_' + id);
        const row = this.el.comp.querySelector(`[data-comp="${id}"]`);
        if (row && ent) {
          row.querySelector('.bar > i').style.width = Math.max(0, (ent.hp / ent.maxHp) * 100) + '%';
          const st = row.querySelector('.cp-state');
          const label = ent.dead ? '阵亡 · 10 秒后归队' : (STATE_LABEL[ent.ai?.state] || '') + (ent.ai?.command === 'stay' ? ' · 停留' : ent.ai?.command === 'attack' ? ' · 集火' : '');
          if (st.textContent !== label) st.textContent = label;
          row.classList.toggle('dead', !!ent.dead);
        }
      }
    }

    // 死亡
    if (p.dead) {
      this.el.death.classList.remove('hidden');
      if (this.el.castbar) this.el.castbar.classList.add('hidden');
    } else this.el.death.classList.add('hidden');

    this.updateGuide(performance.now());
  }

  /** 任务指引：箭头指向当前该去的地方，显示距离 */
  updateGuide(now) {
    const el = this.el.guide;
    if (!el) return;
    if (now - this.guideAt < 110) return;
    this.guideAt = now;
    const g = cachedGuide(now);
    this.guide = g;
    if (!g) { el.classList.add('hidden'); return; }
    const p = this.engine.player;
    el.classList.remove('hidden');
    this.el.guideTitle.textContent = g.title;
    if (g.otherZone) {
      this.el.guideText.textContent = ` · ${g.label}`;
      this.el.guideArrow.classList.add('none');
      return;
    }
    if (g.x == null) {
      this.el.guideText.textContent = ` · ${g.label}`;
      this.el.guideArrow.classList.add('none');
      return;
    }
    const dx = g.x - p.x, dz = g.z - p.z;
    const dist = Math.hypot(dx, dz);
    // 箭头方向：以相机朝向为“上”
    const ang = Math.atan2(dx, dz) - this.world.rig.yaw;
    this.el.guideArrow.classList.remove('none');
    this.el.guideArrow.style.transform = `rotate(${(-ang * 180 / Math.PI).toFixed(1)}deg)`;
    const dTxt = dist < 4 ? '就在附近' : `${Math.round(dist)} 米`;
    this.el.guideText.textContent = ` · ${g.label} · ${dTxt}`;
  }

  renderAuras(root, auras) {
    if (!root) return;
    const key = auras.map((a) => a.id + a.stacks + (a.absorb > 0 ? 's' : '')).join('|');
    if (root.dataset.key === key) return;
    root.dataset.key = key;
    root.innerHTML = auras.slice(0, 10).map((a) => {
      const icon = a.icon && GLYPH[a.icon] ? a.icon : 'star';
      const dur = Math.max(0, Math.round((a.expires - this.engine.now) / 1000));
      return `<div class="aura ${a.debuff ? 'debuff' : ''}" title="${a.name}">${glyphSvg(icon, 'shadow', 17)}<b>${dur > 0 ? dur : ''}</b></div>`;
    }).join('');
  }

  // ---------- 聊天 ----------
  log(text, tone = 'system') {
    const line = document.createElement('div');
    line.className = 'line ' + (tone.startsWith('loot:') ? '' : 'tone-' + tone);
    if (tone.startsWith('loot:')) line.style.color = tone.slice(5);
    line.textContent = text;
    this.el.chat.appendChild(line);
    this.logLines.push({ el: line, at: performance.now() });
    setTimeout(() => line.classList.add('fade'), 18000);
    while (this.logLines.length > 9) {
      const old = this.logLines.shift();
      old.el.remove();
    }
  }

  banner(name, sub) {
    const el = this.el.banner;
    el.querySelector('b').textContent = name;
    el.querySelector('span').textContent = sub || '';
    el.classList.remove('hidden');
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'zoneIn 3.4s ease forwards';
    setTimeout(() => el.classList.add('hidden'), 3500);
  }

  setHint(html) {
    if (!html) { this.el.hint.classList.add('hidden'); return; }
    if (this.el.hint.innerHTML !== html) this.el.hint.innerHTML = html;
    this.el.hint.classList.remove('hidden');
  }

  showSkillTip(sid, evt) {
    const sk = DATA.skills[sid];
    if (!sk) return;
    const costName = { warrior: '怒气', rogue: '能量' }[G.player.classId] || '法力';
    const html = `<div class="tt-name" style="color:#f0dfae">${sk.name}</div>
      <div class="tt-sub">${sk.cast ? sk.cast / 1000 + ' 秒施法' : '瞬发'} · ${sk.range ? sk.range + ' 码' : '自身'}${sk.cd ? ' · ' + sk.cd / 1000 + ' 秒冷却' : ''}</div>
      ${sk.cost ? `<div class="tt-stat">消耗 ${sk.cost} 点${costName}</div>` : ''}
      <div class="tt-stat" style="margin-top:4px">${sk.desc || ''}</div>
      ${sk.interrupt ? '<div class="tt-green">可以打断施法</div>' : ''}`;
    showTooltip(html, evt.clientX, evt.clientY);
  }
}

function require_xp(level) {
  return Math.round(80 + 30 * Math.pow(level, 1.55));
}

function setBar(bar, cur, max, text) {
  const i = bar.querySelector('i');
  const em = bar.querySelector('em');
  const pct = Math.max(0, Math.min(1, cur / max)) * 100;
  if (bar.dataset.pct !== pct.toFixed(1)) {
    i.style.width = pct.toFixed(1) + '%';
    bar.dataset.pct = pct.toFixed(1);
  }
  if (em && em.textContent !== text) em.textContent = text;
}

function npcName(id) {
  for (const z of Object.values(DATA.zones)) {
    const n = (z.npcs || []).find((x) => x.id === id);
    if (n) return n.name;
  }
  return id;
}

// ---------- Tooltip ----------
let tipEl = null;
export function showTooltip(html, x, y) {
  if (!tipEl) tipEl = document.getElementById('tooltip');
  tipEl.innerHTML = html;
  tipEl.classList.remove('hidden');
  const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
  let px = x + 16, py = y + 12;
  if (px + w > window.innerWidth - 8) px = x - w - 12;
  if (py + h > window.innerHeight - 8) py = window.innerHeight - h - 8;
  tipEl.style.left = px + 'px';
  tipEl.style.top = py + 'px';
}
export function hideTooltip() {
  if (!tipEl) tipEl = document.getElementById('tooltip');
  if (tipEl) tipEl.classList.add('hidden');
}
export { QUALITY, SLOTS, SLOT_LABEL, qualityOf, itemById };
