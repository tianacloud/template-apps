// 弹出面板：角色、背包、任务、天赋、地图、队友、对话、商人、战利品。

import {
  DATA, itemById, qualityOf, QUALITY, SLOTS, SLOT_LABEL, slotForItem,
  itemScore, derivePlayer, xpForLevel,
} from '../data/gamedata.js';
import {
  G, acceptQuest, turnInQuest, equipFromBag, sellItem, unequip, pickTalent, useBagItem, setTrackedQuest,
  setParty, questReady, questAvailable, isQuestDone, compareItem, addItem, log,
} from '../game/state.js';
import { showTooltip, hideTooltip, glyphSvg, itemIconSvg } from './hud.js';
import { bus, goldStr } from '../core/util.js';

const CLASS_GLYPH = { warrior: '战', mage: '法', priest: '牧', rogue: '贼' };

export class Panels {
  constructor() {
    this.root = document.getElementById('panels');
    this.current = null;
    this.opts = {};
    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.current) this.close();
    });
  }

  isOpen() { return !!this.current; }
  get name() { return this.current; }

  close() {
    this.current = null;
    this.root.classList.add('hidden');
    this.root.innerHTML = '';
    hideTooltip();
    bus.emit('panelClosed');
  }

  toggle(name, opts = {}) {
    if (this.current === name) this.close();
    else this.open(name, opts);
  }

  open(name, opts = {}) {
    this.current = name;
    this.opts = opts;
    this.root.classList.remove('hidden');
    this.render();
  }

  refresh() {
    if (this.current) this.render();
  }

  render() {
    const map = {
      character: () => this.htmlCharacter(),
      bags: () => this.htmlBags(),
      quests: () => this.htmlQuests(),
      talents: () => this.htmlTalents(),
      map: () => this.htmlMap(),
      party: () => this.htmlParty(),
      npc: () => this.htmlNpc(),
      vendor: () => this.htmlVendor(),
      loot: () => this.htmlLoot(),
      settings: () => this.htmlSettings(),
      help: () => this.htmlHelp(),
    };
    const fn = map[this.current];
    if (!fn) return this.close();
    this.root.innerHTML = fn();
    this.wire();
  }

  modal(title, body, cls = '') {
    return `<div class="panel panel-modal ${cls}" onclick="event.stopPropagation()">
      <div class="panel-head"><span>${title}</span><span class="close-x" data-close>×</span></div>
      <div class="panel-body scroll">${body}</div>
    </div>`;
  }

  wire() {
    this.root.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', () => this.close()));
    this.root.querySelectorAll('.bag-slot').forEach((el) => {
      const i = Number(el.dataset.i);
      el.addEventListener('click', () => {
        const slot = G.player.bag[i];
        if (!slot) return;
        useBagItem(i);
        this.render();
      });
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const slot = G.player.bag[i];
        if (!slot) return;
        const def = itemById(slot.id);
        if (def.quest) { discardItem(i); this.render(); return; }
        sellItem(i);
        this.render();
      });
      el.addEventListener('mouseenter', () => {
        const slot = G.player.bag[i];
        if (!slot) return;
        const def = itemById(slot.id);
        const r = el.getBoundingClientRect();
        showTooltip(itemTooltip(def, true), r.right, r.top);
      });
      el.addEventListener('mouseleave', hideTooltip);
    });
    this.root.querySelectorAll('.equip-cell').forEach((el) => {
      const slot = el.dataset.slot;
      el.addEventListener('mouseenter', () => {
        const id = G.player.equip[slot];
        if (!id) return;
        const r = el.getBoundingClientRect();
        showTooltip(itemTooltip(itemById(id)), r.left, r.top);
      });
      el.addEventListener('mouseleave', hideTooltip);
      el.addEventListener('click', () => {
        if (!G.player.equip[slot]) return;
        unequip(slot);
        this.render();
      });
    });
    this.root.querySelectorAll('[data-qaccept]').forEach((el) =>
      el.addEventListener('click', () => {
        acceptQuest(el.dataset.qaccept);
        this.render();
      })
    );
    this.root.querySelectorAll('[data-qturnin]').forEach((el) =>
      el.addEventListener('click', () => {
        const qid = el.dataset.qturnin;
        const r = this.opts.reward || {};
        const q = DATA.quests[qid];
        if (q.rewards?.choices && !r[qid]) {
          log('先选择一件任务奖励。', 'warn');
          return;
        }
        if (r[qid]) addItem(r[qid], 1);
        turnInQuest(qid);
        this.render();
      })
    );
    this.root.querySelectorAll('[data-reward]').forEach((el) =>
      el.addEventListener('click', () => {
        const [qid, itemId] = el.dataset.reward.split(':');
        this.opts.reward = { ...(this.opts.reward || {}), [qid]: itemId };
        this.render();
      })
    );
    this.root.querySelectorAll('[data-talent]').forEach((el) =>
      el.addEventListener('click', () => {
        if (el.classList.contains('locked')) return;
        pickTalent(el.dataset.talent);
        this.render();
      })
    );
    this.root.querySelectorAll('[data-zone]').forEach((el) =>
      el.addEventListener('click', () => {
        if (el.classList.contains('locked')) return;
        bus.emit('travel', el.dataset.zone);
        this.close();
      })
    );
    this.root.querySelectorAll('[data-locked]').forEach((el) =>
      el.addEventListener('click', () => log('这名队友还没有加入。推进主线任务可以招募。', 'warn'))
    );
    this.root.querySelectorAll('[data-party]').forEach((el) =>
      el.addEventListener('click', () => {
        const id = el.dataset.party;
        if (!DATA.companions[id]) return; // 只接受真实的队友 id
        const act = G.companions.active.slice();
        const i = act.indexOf(id);
        if (i >= 0) act.splice(i, 1);
        else if (act.length < 2) act.push(id);
        else { log('队伍最多带两名队友。', 'warn'); return; }
        setParty(act);
        this.render();
      })
    );
    this.root.querySelectorAll('[data-buy]').forEach((el) =>
      el.addEventListener('click', () => {
        const def = itemById(el.dataset.buy);
        const price = def.price || 10;
        if (G.player.gold < price) { log('金币不够。', 'warn'); return; }
        G.player.gold -= price;
        addItem(def.id, 1);
        this.render();
      })
    );
    this.root.querySelectorAll('.loot-item').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        const def = itemById(el.dataset.item);
        if (def) showTooltip(itemTooltip(def, true), el.getBoundingClientRect().right, el.getBoundingClientRect().top);
      });
      el.addEventListener('mouseleave', hideTooltip);
    });
    this.root.querySelector('[data-loot-all]')?.addEventListener('click', () => this.close());
    this.root.querySelector('[data-export]')?.addEventListener('click', () => bus.emit('exportSave'));
    this.root.querySelector('[data-import]')?.addEventListener('click', () => bus.emit('importSave'));
  }

  // ---------------- 角色 ----------------
  htmlCharacter() {
    const d = derivePlayer(G.player);
    const cls = DATA.classes[G.player.classId];
    const eq = SLOTS.map((s) => {
      const id = G.player.equip[s];
      const def = id ? itemById(id) : null;
      const q = def ? QUALITY[def.quality] : null;
      return `<div class="equip-cell" data-slot="${s}">
        <span class="eq-slot">${SLOT_LABEL[s]}</span>
        <span class="eq-icon">${def ? itemIconSvg(def, 24) : ''}</span>
        <span class="eq-name" style="color:${q ? q.color : '#4a4030'}">${def ? def.name : '— 空 —'}</span>
      </div>`;
    }).join('');

    const setLines = Object.entries(d.setCount).map(([sid, n]) => {
      const set = DATA.sets[sid];
      if (!set) return '';
      return `<div class="set-bonus ${n >= 2 ? '' : 'off'}">${set.name} (${n}/4)<br>
        <span class="${n >= 2 ? '' : 'off'}">2 件：${set.bonus2}</span><br>
        <span class="${n >= 4 ? '' : 'off'}">4 件：${set.bonus4}</span></div>`;
    }).join('');

    const talents = (G.player.talent || []).filter(Boolean).map((id) => {
      const all = Object.values(DATA.talents).flat();
      const t = all.find((x) => x.id === id);
      return t ? `<div class="set-bonus">${t.name} —— ${t.desc}</div>` : '';
    }).join('');

    return this.modal(`角色 · ${G.player.name}`, `<div class="sheet">
      <div>
        <h4 class="sheet-title">装备</h4>
        <div class="equip-grid">${eq}</div>
        <div style="margin-top:14px;font-size:12px;color:#8d8069">左键点击已装备的物品可以卸下。</div>
      </div>
      <div>
        <h4 class="sheet-title">属性</h4>
        <div class="stat-list">
          <div><span>等级</span><b>${G.player.level}</b></div>
          <div><span>职业</span><b style="color:${cls.color}">${cls.name}</b></div>
          <div><span>力量</span><b>${d.stats.str}</b></div>
          <div><span>敏捷</span><b>${d.stats.agi}</b></div>
          <div><span>智力</span><b>${d.stats.int}</b></div>
          <div><span>耐力</span><b>${d.stats.sta}</b></div>
          <div><span>生命</span><b>${d.maxHp}</b></div>
          <div><span>${cls.resource === 'mana' ? '法力' : cls.resource === 'rage' ? '怒气' : '能量'}</span><b>${d.maxRes}</b></div>
          <div><span>攻击强度</span><b>${d.ap}</b></div>
          <div><span>法术强度</span><b>${d.sp}</b></div>
          <div><span>护甲</span><b>${d.armor}</b></div>
          <div><span>暴击率</span><b>${(d.crit * 100).toFixed(1)}%</b></div>
          <div><span>暴击伤害</span><b>${Math.round(d.critDmg * 100)}%</b></div>
          <div><span>伤害减免</span><b>${(d.dr * 100).toFixed(0)}%</b></div>
        </div>
        ${setLines}
        ${talents}
        <h4 class="sheet-title" style="margin-top:16px">伤害公式</h4>
        <div style="font-size:12px;color:#8a7d68;line-height:1.8">
          单次伤害 = 攻击强度 × 技能倍率 ×（1 − 护甲减伤）× 随机浮动（0.90—1.10）<br>
          暴击时再 × ${Math.round(d.critDmg * 100)}%。护甲减伤 = 护甲 ÷（护甲 + 180 + 等级 × 16），上限 72%。
        </div>
      </div>
    </div>`, 'wide');
  }

  // ---------------- 背包 ----------------
  htmlBags() {
    const used = G.player.bag.filter(Boolean).length;
    let cells = '';
    for (let i = 0; i < G.player.bagSlots; i++) {
      const slot = G.player.bag[i];
      if (!slot) { cells += `<div class="bag-slot" data-i="${i}"></div>`; continue; }
      const def = itemById(slot.id);
      const q = QUALITY[def.quality] || QUALITY.common;
      cells += `<div class="bag-slot" data-i="${i}" style="color:${q.color}" title="${def.name}">
        <span class="bq"></span>
        <span class="bicon">${itemIconSvg(def, 40)}</span>
        ${slot.count > 1 ? `<span class="bcount">${slot.count}</span>` : ''}
      </div>`;
    }
    return this.modal('背包', `<div class="bag-grid">${cells}</div>
      <div class="bag-foot"><span>${used} / ${G.player.bagSlots} 格</span><span class="money">${goldStr(G.player.gold)}</span></div>
      <div style="font-size:11px;color:#6b5f4d;margin-top:8px">左键装备或使用 · 右键出售（任务物品则丢弃）· 商人处可扩容</div>`);
  }

  // ---------------- 任务 ----------------
  htmlQuests() {
    const ids = [...Object.keys(G.quests.active), ...G.quests.done.filter((id) => DATA.quests[id])];
    if (!ids.length) return this.modal('任务日志', '<div style="padding:30px;text-align:center;color:#8d8069">还没有任务。去营地里找头上有金色感叹号的人。</div>');
    const sel = this.opts.qid && ids.includes(this.opts.qid) ? this.opts.qid : ids[0];
    this.opts.qid = sel;
    const list = ids.filter((qid) => DATA.quests[qid]).map((qid) => {
      const q = DATA.quests[qid];
      const done = isQuestDone(qid);
      const ready = !done && questReady(qid);
      const tracking = G.tracked === qid;
      return `<div class="qitem ${sel === qid ? 'on' : ''} ${ready ? 'done' : ''} ${tracking ? 'tracked' : ''}" data-qid="${qid}">
        <div class="qi-title">${q.title}${ready ? ' ✓' : ''}${done && !ready ? ' · 已完成' : ''}${tracking ? ' <span class="qi-track">追踪中</span>' : ''}</div>
        <div class="qi-sub">${DATA.zones[q.zone]?.name || ''} · ${q.type === 'main' ? '主线' : '支线'} · ${q.level} 级</div>
      </div>`;
    }).join('');
    const q = DATA.quests[sel];
    const st = G.quests.active[sel];
    const done = isQuestDone(sel);
    const objs = q.objectives.map((o, i) => {
      const need = o.count || 1;
      const p = st ? (st.obj[i] || 0) : need;
      return `<div class="qobj ${p >= need ? 'done' : ''}">· ${o.label} ${p}/${need}</div>`;
    }).join('');
    const rw = q.rewards?.choices
      ? `<div class="qreward">${q.rewards.choices.map((id) => `<div class="rw">${itemName(id)}</div>`).join('')}</div>`
      : `<div class="qreward">${q.rewards?.item ? `<div class="rw">${itemName(q.rewards.item)}</div>` : ''}
         ${q.rewards?.gold ? `<div class="rw">${q.rewards.gold} 铜</div>` : ''}
         ${q.rewards?.xp ? `<div class="rw">${q.rewards.xp} 经验</div>` : ''}</div>`;
    let html = `<div class="qlog"><div class="qlist scroll">${list}</div><div class="qdetail">
      <h4>${q.title}</h4>
      <div style="font-size:11px;color:#8d8069;margin:-2px 0 8px">点左侧任意进行中的任务即可切换顶部指引</div>
      <div class="qmeta">${q.type === 'main' ? '主线任务' : '支线任务'} · 建议等级 ${q.level} · 发布者 ${npcName(q.giver)}</div>
      <p>${q.text}</p>
      ${objs}
      <div style="margin-top:12px;color:#c9a227;font-size:12px;letter-spacing:.1em">奖励</div>
      ${rw}
      ${done ? '<div style="margin-top:12px;color:#6ee66e;font-size:12px">已完成。原话：' + (q.complete || '') + '</div>' : ''}
      ${st && questReady(sel) ? `<div class="qbtn-row"><button class="btn-gold" data-goto-npc="${q.turnin}">去找 ${npcName(q.turnin)} 交任务</button></div>` : ''}
    </div></div>`;
    setTimeout(() => {
      this.root.querySelectorAll('[data-qid]').forEach((el) =>
        el.addEventListener('click', () => {
          const qid = el.dataset.qid;
          this.opts.qid = qid;
          if (G.quests.active[qid]) setTrackedQuest(qid);
          this.render();
        })
      );
      this.root.querySelectorAll('[data-goto-npc]').forEach((el) => el.addEventListener('click', () => this.close()));
    }, 0);
    return this.modal('任务日志', html, 'wide');
  }

  // ---------------- 天赋 ----------------
  htmlTalents() {
    const list = DATA.talents[G.player.classId] || [];
    const tiers = [10, 20].map((tier) => {
      const items = list.filter((t) => t.tier === tier);
      const chosen = G.player.talent?.[tier === 10 ? 0 : 1];
      const locked = G.player.level < tier;
      return `<div class="talent-tier"><h5>${tier} 级天赋 ${locked ? '（未解锁）' : ''}</h5>
        ${items.map((t) => `<div class="talent ${chosen === t.id ? 'on' : ''} ${locked ? 'locked' : ''}" data-talent="${t.id}">
          <div class="tname">${t.name}${chosen === t.id ? ' ✓' : ''}</div>
          <div class="tdesc">${t.desc}</div>
        </div>`).join('')}
      </div>`;
    }).join('');
    return this.modal('天赋', `<div style="font-size:12px;color:#8a7d68;margin-bottom:12px">10 级与 20 级各选一次。两条路线在玩法上不同，不只是数值微调。当前等级 ${G.player.level}。</div>
      <div class="talent-grid">${tiers}</div>`);
  }

  // ---------------- 地图 ----------------
  htmlMap() {
    const pos = { barrens: [18, 66], mist: [46, 44], rift: [78, 64], ashlands: [62, 18] };
    const P = (id) => pos[id] || [50, 50];
    // 连线从区域数据里的 connections 推导，新增区域不用改这里
    const seen = new Set();
    const pairs = [];
    for (const z of Object.values(DATA.zones)) {
      for (const c of z.connections || []) {
        const k = [z.id, c].sort().join('|');
        if (seen.has(k) || !pos[z.id] || !pos[c]) continue;
        seen.add(k);
        pairs.push([z.id, c]);
      }
    }
    const lines = pairs.map(([a, b]) => {
      const [x1, y1] = pos[a], [x2, y2] = pos[b];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      return `<div class="map-line" style="left:${x1}%;top:${y1}%;width:${len}%;transform:rotate(${ang}deg)"></div>`;
    }).join('');
    const nodes = Object.values(DATA.zones).map((z) => {
      const unlocked = G.world.unlockedZones.includes(z.id);
      const here = G.zoneId === z.id;
      return `<div class="map-zone ${unlocked ? '' : 'locked'} ${here ? 'current' : ''}" data-zone="${z.id}" style="left:${P(z.id)[0]}%;top:${P(z.id)[1]}%">
        <div class="mz-name">${z.name}</div><div class="mz-sub">${unlocked ? (here ? '当前位置' : '点击前往') : '未解锁'}</div>
      </div>`;
    }).join('');
    const dg = Object.values(DATA.dungeons).map((d, i) =>
      `<div style="position:absolute;left:${[34, 66][i] || 50}%;top:${[78, 80][i] || 80}%;transform:translate(-50%,-50%);font-size:11px;color:#b08ae0">◆ ${d.name} · ${d.level} 级</div>`
    ).join('');
    return this.modal('世界地图', `<div class="worldmap">${lines}${nodes}${dg}</div>
      <div style="font-size:11px;color:#6b5f4d;margin-top:10px">只能前往已经解锁且有飞行点的区域。副本要从对应区域的传送门进入。</div>
      <div class="qbtn-row"><button class="btn-dark" data-export>导出存档</button><button class="btn-dark" data-import>导入存档</button></div>`, 'wide');
  }

  // ---------------- 队友 ----------------
  htmlParty() {
    const rows = Object.values(DATA.companions).map((c) => {
      const unlocked = G.companions.unlocked.includes(c.id);
      const active = G.companions.active.includes(c.id);
      return `<div class="party-row ${unlocked ? '' : 'locked'}" ${unlocked ? `data-party="${c.id}"` : 'data-locked="1"'} style="color:${c.color}">
        <div class="pr-icon" style="color:${c.color}">${CLASS_GLYPH[c.classId]}</div>
        <div class="pr-body">
          <div class="pr-name" style="color:${unlocked ? c.color : '#6b5f4d'}">${c.name} <span style="font-size:11px;color:#8d8069">${c.title} · ${c.species}</span> ${active ? '<span style="color:#6ee66e">[已入队]</span>' : ''}</div>
          <div class="pr-desc">${unlocked ? c.desc : '尚未加入。推进主线任务可以招募。'}</div>
        </div>
      </div>`;
    }).join('');
    return this.modal('队伍', `<div class="party-list">${rows}</div>
      <div style="font-size:11px;color:#6b5f4d;margin-top:10px">最多带两名队友。点击已解锁的队友加入或移出队伍。副本里队友会自动躲红圈、打断读条、治疗血线。</div>`);
  }

  // ---------------- NPC 对话 ----------------
  htmlNpc() {
    const npc = this.opts.npc;
    const giverQuests = Object.values(DATA.quests).filter((q) => q.giver === npc.id && questAvailable(q.id));
    const readyQuests = Object.values(DATA.quests).filter((q) => q.turnin === npc.id && questReady(q.id));
    const reward = this.opts.reward || {};

    let body = `<div style="font-size:13px;color:#b8a888;margin-bottom:14px">${npc.name} · ${npc.title}</div>`;
    if (!giverQuests.length && !readyQuests.length) {
      body += `<div style="color:#8d8069;font-size:13px">「${idleLine(npc)}」</div>`;
    }
    for (const q of readyQuests) {
      body += `<div class="qitem" style="margin-bottom:10px">
        <div class="qi-title">${q.title} <span style="color:#6ee66e;font-size:11px">可以交付</span></div>
        <div style="font-size:12px;color:#a89880;line-height:1.8;margin:6px 0">「${q.complete || ''}」</div>
        ${q.rewards?.choices ? `<div class="qreward">${q.rewards.choices.map((id) => {
          const def = itemById(id);
          const on = reward[q.id] === id;
          return `<div class="rw ${on ? 'picked' : ''}" data-reward="${q.id}:${id}" style="color:${QUALITY[def.quality].color}">${def.name}</div>`;
        }).join('')}</div>` : `<div class="qreward">${
          [q.rewards?.item ? itemName(q.rewards.item) : '', q.rewards?.gold ? q.rewards.gold + ' 铜' : '', q.rewards?.xp ? q.rewards.xp + ' 经验' : ''].filter(Boolean).map((t) => `<div class="rw">${t}</div>`).join('')
        }</div>`}
        <div class="qbtn-row"><button class="btn-gold" data-qturnin="${q.id}">完成</button></div>
      </div>`;
    }
    for (const q of giverQuests) {
      body += `<div class="qitem" style="margin-bottom:10px">
        <div class="qi-title">${q.title} <span style="color:#ffd100;font-size:11px">${q.type === 'main' ? '主线' : '支线'} · ${q.level} 级</span></div>
        <div style="font-size:12px;color:#a89880;line-height:1.9;margin:6px 0">「${q.text}」</div>
        <div class="qbtn-row"><button class="btn-gold" data-qaccept="${q.id}">接受</button></div>
      </div>`;
    }
    if (npc.role === 'vendor') body += `<div class="qbtn-row"><button class="btn-dark" data-vendor="1">看看货</button></div>`;
    if (npc.role === 'flight') {
      const routes = DATA.zones[G.zoneId]?.flight?.routes || [];
      body += `<div style="margin-top:10px"><div style="color:#c9a227;font-size:12px;letter-spacing:.1em;margin-bottom:6px">飞行路线</div>`;
      for (const r of routes) {
        const z = DATA.zones[r];
        if (!z || !G.world.unlockedZones.includes(r)) continue;
        body += `<div class="qitem" data-zone="${r}" style="margin-bottom:6px;cursor:pointer"><div class="qi-title">${z.name}</div><div class="qi-sub">飞过去</div></div>`;
      }
      body += `</div>`;
    }
    if (npc.role === 'companion') {
      const c = Object.values(DATA.companions).find((x) => x.id === npc.id || x.name === npc.name);
      const unlocked = c && G.companions.unlocked.includes(c.id);
      body += `<div style="color:#8d8069;font-size:13px">${unlocked ? '「随时可以走。按 P 编队。」' : '「等我该上场的时候，再来叫我。」'}</div>`;
      if (unlocked && c) body += `<div class="qbtn-row"><button class="btn-gold" data-party="${c.id}">${G.companions.active.includes(c.id) ? '移出队伍' : '加入队伍'}</button></div>`;
    }
    if (npc.role === 'trainer') {
      body += `<div style="color:#8d8069;font-size:13px">「技能是跟着等级自己长出来的，不用花钱学。省下金币买装备吧。」</div>`;
    }
    const title = `${npc.name}`;
    setTimeout(() => {
      this.root.querySelectorAll('[data-vendor]').forEach((el) => el.addEventListener('click', () => this.open('vendor', { npc })));
    }, 0);
    return this.modal(title, body);
  }

  htmlVendor() {
    // 库存随等级走：消耗品常驻 + 当前等级段能用的装备
    const lv = G.player.level;
    const gearSlots = ['mainhand', 'offhand', 'head', 'chest', 'leg', 'hand', 'feet', 'neck', 'ring', 'trinket'];
    const gear = Object.values(DATA.itemsById)
      .filter((i) => gearSlots.includes(i.slot) && i.price > 0)
      .filter((i) => (i.req || 1) <= lv + 2 && (i.req || 1) >= Math.max(1, lv - 8))
      .sort((a, b) => (b.req || 1) - (a.req || 1))
      .slice(0, 8)
      .map((i) => i.id);
    const stock = ['potion', 'ration', 'mount_riding', ...new Set(gear)];
    const rows = stock.map((id) => {
      const def = itemById(id);
      if (!def) return '';
      return `<div class="vendor-item" data-buy="${id}">
        <span class="vi-icon">${itemIconSvg(def, 24)}</span>
        <span class="vi-name" style="color:${QUALITY[def.quality].color}">${def.name}</span>
        <span class="money">${def.price || 10} 铜</span>
      </div>`;
    }).join('');
    const expand = G.player.bagSlots < 80
      ? `<div class="qbtn-row"><button class="btn-dark" id="buy-slots">扩容背包 +10 格（${200 + G.player.bagSlots * 2} 铜）</button></div>`
      : '<div style="color:#6ee66e;font-size:12px">背包已经扩到最大。</div>';
    setTimeout(() => {
      document.getElementById('buy-slots')?.addEventListener('click', () => {
        const cost = 200 + G.player.bagSlots * 2;
        if (G.player.gold < cost) { log('金币不够。', 'warn'); return; }
        G.player.gold -= cost;
        G.player.bagSlots = Math.min(80, G.player.bagSlots + 10);
        log(`背包扩容到 ${G.player.bagSlots} 格。`, 'system');
        this.render();
      });
    }, 0);
    return this.modal('商人', `<div class="vendor-grid"><div>${rows}</div><div>
      <div style="font-size:12px;color:#8a7d68;line-height:1.9">固定价格，不搞拍卖行。卖东西给商人按原价 25% 回收。</div>
      ${expand}
      <div class="money" style="margin-top:12px">${goldStr(G.player.gold)}</div>
    </div></div>`);
  }

  htmlLoot() {
    const drops = this.opts.drops || [];
    const rows = drops.map((d) => {
      const def = itemById(d.id);
      if (!def) return '';
      const q = QUALITY[def.quality];
      return `<div class="loot-item" data-item="${d.id}">
        <div class="li-icon">${itemIconSvg(def, 34)}</div>
        <div><div class="li-name" style="color:${q.color}">${def.name}${d.count > 1 ? ' ×' + d.count : ''}</div>
        <div class="li-sub">${q.name}${def.armor ? ' · 护甲 ' + def.armor : ''}${def.power ? ' · 强度 ' + def.power : ''}</div></div>
      </div>`;
    }).join('');
    return this.modal('战利品', `<div class="loot-window">${rows || '<div style="color:#8d8069">这次什么都没掉。</div>'}</div>
      <div class="qbtn-row"><button class="btn-gold" data-loot-all>全部收下</button></div>
      <div style="font-size:11px;color:#6b5f4d;margin-top:8px">首领的掉落池是公开的：每次必掉列表里的东西，再从随机池里抽固定件数。</div>`);
  }

  htmlSettings() {
    return this.modal('设置', `<div style="display:flex;flex-direction:column;gap:14px;font-size:13px;color:#b8a888">
      <label>视野距离 <input type="range" id="set-dist" min="8" max="20" value="12" /></label>
      <label>画质上限 <select id="set-quality"><option value="1">流畅</option><option value="1.6" selected>标准</option></select></label>
      <label><input type="checkbox" id="set-save" checked /> 自动存档（切换区域、交任务、退出时）</label>
      <div style="font-size:12px;color:#6b5f4d">音效由浏览器内的合成器实时生成，没有音频文件。</div>
      <div class="qbtn-row"><button class="btn-gold" id="set-export">导出存档</button><button class="btn-dark" id="set-import">导入存档</button></div>
    </div>`);
  }

  htmlHelp() {
    return this.modal('操作', `<div style="font-size:13px;line-height:2;color:#b8a888">
      <b style="color:#e8dcc8">W/S</b> 前后 · <b style="color:#e8dcc8">Q/E</b> 左右平移 · <b style="color:#e8dcc8">A/D</b> 转镜头 · <b style="color:#e8dcc8">空格</b> 跳跃<br>
      <b style="color:#e8dcc8">左键/右键拖拽</b> 也能转视角 · <b style="color:#e8dcc8">滚轮</b> 拉近拉远<br>
      <b style="color:#e8dcc8">Tab</b> 选最近敌人 · <b style="color:#e8dcc8">左键</b> 选目标 · <b style="color:#e8dcc8">1—0</b> 技能 · <b style="color:#e8dcc8">F</b> 交互 / 对话<br>
      选中目标只是选中：出过手（放技能或被攻击）才会自动平砍，不会一点目标就开打。<br>
      <b style="color:#e8dcc8">C</b> 角色 · <b style="color:#e8dcc8">B</b> 背包 · <b style="color:#e8dcc8">L</b> 任务 · <b style="color:#e8dcc8">N</b> 天赋 · <b style="color:#e8dcc8">M</b> 地图 · <b style="color:#e8dcc8">P</b> 队伍<br>
      <b style="color:#e8dcc8">Esc</b> 关闭面板<br><br>
      队友指令：点左侧队友框循环切换「跟随 / 攻击我的目标 / 停留」。<br>
      地面红圈是敌方 AOE，读条被打断会取消红圈。目标框里的读条如果写着「可打断」，就用打断技能。
    </div>`);
  }
}

// ---------- tooltip 构造 ----------
export function itemTooltip(def, withCompare = false) {
  if (!def) return '';
  const q = QUALITY[def.quality] || QUALITY.common;
  const slotName = def.slot === 'none' ? '消耗品 / 材料' : SLOT_LABEL[def.slot] || def.slot;
  let html = `<div class="tt-name" style="color:${q.color}">${def.name}</div>
    <div class="tt-sub">${q.name} · ${slotName}${def.ilvl ? ' · 物品等级 ' + def.ilvl : ''}</div>`;
  if (def.armor) html += `<div class="tt-stat">${def.armor} 点护甲</div>`;
  if (def.power) html += `<div class="tt-stat">${def.power} 点近战强度</div>`;
  for (const [k, v] of Object.entries(def.stats || {})) {
    const label = { str: '力量', agi: '敏捷', int: '智力', sta: '耐力', crit: '暴击率' }[k] || k;
    const val = k === 'crit' ? (v * 100).toFixed(1) + '%' : v;
    html += `<div class="tt-stat tt-green">+${val} ${label}</div>`;
  }
  if (def.desc) html += `<div class="tt-flavor">${def.desc}</div>`;
  if (def.req) html += `<div class="tt-stat" style="color:#e8d08a">需要等级 ${def.req}</div>`;
  if (def.price) html += `<div class="tt-gold">售价：${def.price} 铜</div>`;
  if (def.set && DATA.sets[def.set]) {
    const set = DATA.sets[def.set];
    const n = Object.values(G.player.equip || {}).filter((id) => id && itemById(id)?.set === def.set).length;
    html += `<div class="tt-set ${n >= 2 ? '' : 'off'}">${set.name} (${n}/4)</div>
      <div class="tt-set ${n >= 2 ? '' : 'off'}">2 件：${set.bonus2}</div>
      <div class="tt-set ${n >= 4 ? '' : 'off'}">4 件：${set.bonus4}</div>`;
  }
  if (withCompare && def.slot !== 'none') {
    const { cur, delta } = compareItem(def);
    html += `<div class="tt-sub" style="margin-top:6px">${cur ? '当前：' + cur.name : '该部位为空'}</div>`;
    if (cur) html += `<div class="${delta >= 0 ? 'tt-green' : 'tt-red'}">${delta >= 0 ? '↑ 评分 +' + delta : '↓ 评分 ' + delta}</div>`;
  }
  return html;
}

function itemName(id) {
  const def = itemById(id);
  if (!def) return id;
  return `<span style="color:${QUALITY[def.quality].color}">${def.name}</span>`;
}

function npcName(id) {
  for (const z of Object.values(DATA.zones)) {
    const n = (z.npcs || []).find((x) => x.id === id);
    if (n) return n.name;
  }
  return id;
}

function idleLine(npc) {
  const lines = {
    loen: '墙上的缺口补好了没有？',
    mera: '补给不多，省着点用。',
    tuk: '买点什么？不买也让开点，你挡着我晒太阳了。',
    kade: '手上的活儿比嘴上的道理管用。',
    vane: '雾里的东西越来越靠前了。',
    oran: '钟不是用来报时的，是用来叫人的。',
    bran: '铁要趁热打。',
    selin: '愿光记得你。',
    grom: '站我后面。',
    kai: '别问我来历，问你出多少钱。',
    lia: '别站在我弹道上。',
    tun: '要飞就快点，风向要变了。',
    kar: '坐稳了，别往下看。',
    mu: '路我熟，价钱好说。',
  };
  return lines[npc.id] || '一路小心。';
}
