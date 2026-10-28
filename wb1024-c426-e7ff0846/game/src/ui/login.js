// 登录界面与建角：存档槽位读写、职业预览。

import { DATA, QUALITY } from '../data/gamedata.js';
import { listSlots, loadSlot, deleteSlot, pickJsonFile } from '../save/db.js';
import { glyphSvg } from './hud.js';

const CLASS_GLYPH = { warrior: '战', mage: '法', priest: '牧', rogue: '贼' };
const CLASS_TAG = { warrior: '怒气 · 近战', mage: '法力 · 远程', priest: '法力 · 治疗', rogue: '能量 · 连击点' };

export class Login {
  constructor({ onNew, onLoad, onImport }) {
    this.onNew = onNew;
    this.onLoad = onLoad;
    this.onImport = onImport;
    this.slotsEl = document.getElementById('login-slots');
    this.loginEl = document.getElementById('login');
    this.createEl = document.getElementById('create');
    this.selectedClass = 'warrior';
    this.rewardCache = {};
    this.buildCreate();
    document.getElementById('btn-new').addEventListener('click', () => this.showCreate());
    document.getElementById('btn-back').addEventListener('click', () => this.hideCreate());
    document.getElementById('btn-enter').addEventListener('click', () => this.enter());
    document.getElementById('btn-import').addEventListener('click', async () => {
      const data = await pickJsonFile();
      if (!data) return;
      this.onImport(data);
    });
    document.getElementById('btn-settings').addEventListener('click', () => {
      alert('画面：浏览器窗口越大越清晰。\n音效：首次点击后启用，由浏览器内合成，无音频文件。\n存档：三个本地槽位，切换区域与交任务时自动保存。');
    });
  }

  showInfo() {
    let dlg = document.getElementById('login-dialog');
    if (!dlg) {
      dlg = document.createElement('div');
      dlg.id = 'login-dialog';
      dlg.className = 'login-dialog';
      dlg.innerHTML = `<div class="panel panel-modal" onclick="event.stopPropagation()">
        <div class="panel-head"><span>画面与音效</span><span class="close-x" data-x>×</span></div>
        <div class="panel-body">
          <div class="stat-list" style="grid-template-columns:1fr">
            <div><span>画面</span><b>浏览器窗口越大越清晰</b></div>
            <div><span>渲染</span><b>WebGL · 无外部贴图，程序化几何</b></div>
            <div><span>音效</span><b>浏览器内合成，首次点击后启用</b></div>
            <div><span>存档</span><b>三个本地槽位 · 自动保存 · 可导出 JSON</b></div>
            <div><span>数据</span><b>全部在本地，不联网，不上传</b></div>
          </div>
          <div style="margin-top:14px;font-size:12px;color:#8d8069">建议使用 Chrome / Edge 的较新版本。集成显卡笔记本请把窗口控制在 1600×900 以内。</div>
          <div class="qbtn-row"><button class="btn-gold" data-x>知道了</button></div>
        </div>
      </div>`;
      document.getElementById('app').appendChild(dlg);
      dlg.addEventListener('click', (e) => {
        if (e.target === dlg || e.target.hasAttribute('data-x')) dlg.remove();
      });
    }
  }

  show() {
    this.loginEl.classList.remove('hidden');
    this.refresh();
  }

  hide() {
    this.loginEl.classList.add('hidden');
    this.createEl.classList.add('hidden');
  }

  async refresh() {
    let slots = [];
    try { slots = await listSlots(); } catch (e) { slots = []; }
    this.slotsEl.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const s = slots.find((x) => x.slot === i);
      const el = document.createElement('div');

      // 有记录但读不出角色：当成损坏档，只允许删除，不能让整页渲染挂掉
      if (s && !s.player) {
        el.className = 'slot broken';
        el.innerHTML = `<div class="slot-class">!</div>
          <div><div class="slot-name">存档损坏</div><div class="slot-meta">这个槽位里没有角色数据</div></div>
          <div class="slot-del" title="删除存档">删除</div>`;
        el.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (confirm('删除这个损坏的存档？')) {
            await deleteSlot(i);
            this.refresh();
          }
        });
        this.slotsEl.appendChild(el);
        continue;
      }

      el.className = 'slot' + (s ? '' : ' empty');
      if (s) {
        const p = s.player;
        const cls = DATA.classes[p.classId] || { name: '未知职业', color: '#C9A227' };
        const zone = DATA.zones[s.zoneId] || { name: '未知之地' };
        const when = Number.isFinite(s.savedAt) ? new Date(s.savedAt).toLocaleString('zh-CN', { hour12: false }) : '时间未知';
        el.innerHTML = `<div class="slot-class" style="color:${cls.color};border-color:${cls.color}">${CLASS_GLYPH[p.classId] || '?'}</div>
          <div>
            <div class="slot-name">${String(p.name || '无名者')} <span style="font-size:12px;color:${cls.color};font-family:var(--font-body)">${cls.name} · ${p.level || 1} 级</span></div>
            <div class="slot-meta">${zone.name} · ${when} · 游玩 ${Math.floor((s.playtime || 0) / 60)} 分钟</div>
          </div>
          <div class="slot-play">继续</div>
          <div class="slot-del" title="删除存档">×</div>`;
        el.addEventListener('click', async (e) => {
          if (e.target.classList.contains('slot-del')) {
            if (confirm(`删除「${p.name || '无名者'}」的存档？`)) {
              await deleteSlot(i);
              this.refresh();
            }
            return;
          }
          if (this.busy) return;
          this.busy = true;
          el.classList.add('loading');
          const play = el.querySelector('.slot-play');
          const oldText = play ? play.textContent : '';
          if (play) play.textContent = '载入中…';
          try {
            const data = await loadSlot(i);
            if (data) this.onLoad(data, i);
            else alert('这个存档位读不到数据，可能已被删除。');
          } catch (err) {
            alert('读取存档失败：' + (err?.message || err));
          } finally {
            setTimeout(() => {
              this.busy = false;
              if (play) play.textContent = oldText;
              el.classList.remove('loading');
            }, 1500);
          }
        });
      } else {
        el.innerHTML = `<div class="slot-class">＋</div>
          <div><div class="slot-name">空存档位 ${i}</div><div class="slot-meta">点击创建新角色</div></div>
          <div class="slot-play">新建</div>`;
        el.addEventListener('click', () => this.showCreate(i));
      }
      this.slotsEl.appendChild(el);
    }
  }

  buildCreate() {
    const list = document.getElementById('class-list');
    list.innerHTML = '';
    for (const c of Object.values(DATA.classes)) {
      const el = document.createElement('div');
      el.className = 'class-card' + (c.id === this.selectedClass ? ' on' : '');
      el.dataset.cls = c.id;
      el.innerHTML = `<div class="cc-icon" style="color:${c.color}">${CLASS_GLYPH[c.id]}</div>
        <div><div class="cc-name" style="color:${c.color}">${c.name}</div><div class="cc-role">${c.role}</div></div>`;
      el.addEventListener('click', () => {
        this.selectedClass = c.id;
        list.querySelectorAll('.class-card').forEach((x) => x.classList.toggle('on', x.dataset.cls === c.id));
        this.renderClass();
      });
      list.appendChild(el);
    }
    this.renderClass();
  }

  renderClass() {
    const c = DATA.classes[this.selectedClass];
    const hero = document.getElementById('class-hero');
    hero.innerHTML = `<div class="hero-glyph" style="color:${c.color};text-shadow:0 0 40px ${c.color}66">${CLASS_GLYPH[c.id]}</div>`;
    document.getElementById('class-name').textContent = c.name;
    document.getElementById('class-name').style.color = c.color;
    document.getElementById('class-role').textContent = `${c.role} · ${CLASS_TAG[c.id]}`;
    document.getElementById('class-desc').textContent = c.desc;
    document.getElementById('class-skills').innerHTML = c.skills
      .slice(0, 8)
      .map((sid) => {
        const sk = DATA.skills[sid];
        return `<span title="${sk.desc}">${sk.name}</span>`;
      })
      .join('');
  }

  showCreate(slot = 1) {
    this.slot = slot;
    this.loginEl.classList.add('hidden');
    this.createEl.classList.remove('hidden');
    document.getElementById('char-name').value = randomName(this.selectedClass);
  }

  hideCreate() {
    this.createEl.classList.add('hidden');
    this.loginEl.classList.remove('hidden');
  }

  enter() {
    const name = (document.getElementById('char-name').value || '').trim() || '无名者';
    const difficulty = document.getElementById('char-diff').value;
    this.onNew({ name, classId: this.selectedClass, difficulty, slot: this.slot || 1 });
  }
}

function randomName(classId) {
  const pool = {
    warrior: ['洛恩', '格罗姆', '石肩', '布兰'],
    mage: ['莉亚', '奥兰', '霜语', '烬'],
    priest: ['塞琳', '祷者', '微光', '白塔'],
    rogue: ['凯', '薇恩', '影刃', '棘'],
  }[classId] || ['无名者'];
  const a = pool[Math.floor(Math.random() * pool.length)];
  return `${a}${Math.floor(Math.random() * 90 + 10)}`;
}
