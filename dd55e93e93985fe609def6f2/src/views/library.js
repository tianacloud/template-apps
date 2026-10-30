/** library.js — 品项库：方案匹配的事实来源 */

import { activeItems, scope, storeName, addItem } from '../db.js';
import { tag, empty, esc, toast, openModal, money, bar } from '../ui.js';
import { ITEM_CATEGORIES, NEED_META } from '../taxonomy.js';

const TIER_LABEL = { entry: '入门层', course: '进阶层', home: '居家层', long: '长期管理' };
const TIER_CLS = { entry: 'blue', course: 'accent', home: 'green', long: 'plain' };

export default async function libraryView() {
  const me = scope().me;
  // 注意：不能对 activeItems() 的返回数组做 length=0 —— 那是状态里的同一个引用
  let items = activeItems();

  const html = `
  <div class="stack">
    <div class="card">
      <div class="card-body tight">
        <div class="row wrap" style="gap:10px">
          <div class="field" style="flex:1;min-width:180px">
            <input class="input" id="lq" placeholder="搜品项名、方向…" />
          </div>
          <div class="field" style="width:140px">
            <select class="select" id="lkind">
              <option value="">全部类型</option>
              <option value="service">院内服务</option>
              <option value="home">居家产品</option>
            </select>
          </div>
          <div class="field" style="width:140px">
            <select class="select" id="ltier">
              <option value="">全部层级</option>
              <option value="entry">入门层</option>
              <option value="course">进阶层</option>
              <option value="home">居家层</option>
              <option value="long">长期管理</option>
            </select>
          </div>
          <button class="btn primary" id="btn-add" style="margin-left:auto">新增品项</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h3>品项库</h3>
        <span class="sub" id="lcount"></span>
        <div class="right"><span style="font-size:11.5px;color:var(--ink-4)">方案匹配与问答都只引用这张表</span></div>
      </div>
      <div id="lbody"></div>
    </div>

    <div class="notice">
      <span class="n-mark">·</span>
      <div>「对应方向」是方案匹配的唯一依据。一个品项挂错方向，方案就会推荐错——改这里等于改判断逻辑，比改话术影响更大。</div>
    </div>
  </div>`;

  function render() {
    const q = (document.getElementById('lq')?.value || '').trim().toLowerCase();
    const kind = document.getElementById('lkind')?.value || '';
    const tier = document.getElementById('ltier')?.value || '';

    let rows = items;
    if (q) rows = rows.filter((i) => i.name.toLowerCase().includes(q) || (i.desc || '').toLowerCase().includes(q));
    if (kind) rows = rows.filter((i) => i.kind === kind);
    if (tier) rows = rows.filter((i) => i.tier === tier);

    const cov = {};
    for (const i of items) for (const n of i.needs || []) cov[n] = (cov[n] || 0) + 1;

    document.getElementById('lcount').textContent = `${rows.length} / ${items.length} 项`;

    if (!rows.length) {
      document.getElementById('lbody').innerHTML = empty('·', '没有符合条件的品项。');
      return;
    }

    document.getElementById('lbody').innerHTML = `
      <div style="overflow-x:auto">
      <table class="table">
        <thead>
          <tr>
            <th style="min-width:150px">品项</th>
            <th>层级</th>
            <th style="min-width:150px">对应方向</th>
            <th>价格</th>
            <th>次数 / 周期</th>
            <th style="min-width:200px">说明与注意</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (i) => `
            <tr>
              <td>
                <div style="font-weight:600;font-size:13px">${esc(i.name)}</div>
                <div style="font-size:11px;color:var(--ink-4)">${i.kind === 'home' ? '居家产品' : '院内服务'} · ${esc(ITEM_CATEGORIES[i.category] || '')}</div>
              </td>
              <td>${tag(TIER_LABEL[i.tier] || i.tier, TIER_CLS[i.tier] || '')}</td>
              <td>
                <div style="display:flex;flex-wrap:wrap;gap:4px">
                  ${(i.needs || []).map((n) => `<span class="tag plain" style="font-size:11px">${esc(NEED_META[n]?.label || n)}</span>`).join('')}
                </div>
              </td>
              <td class="num" style="white-space:nowrap">${money(i.price)}</td>
              <td style="font-size:12px;color:var(--ink-3);white-space:nowrap">${i.sessions ? `${i.sessions} 次` : '单次'}${i.cycleDays ? ` / ${i.cycleDays} 天` : ''}</td>
              <td style="font-size:12px;line-height:1.7">
                ${esc(i.desc || '')}
                ${i.caution ? `<div style="color:var(--red);margin-top:3px">注意：${esc(i.caution)}</div>` : ''}
              </td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
      </div>

      <div style="padding:14px 20px;border-top:1px solid var(--line-2)">
        <div style="font-size:11px;color:var(--ink-4);letter-spacing:.06em;margin-bottom:8px">方向覆盖度（品项库能支撑哪些问题维度）</div>
        <div class="grid g4" style="gap:10px">
          ${Object.keys(NEED_META)
            .map((n) => {
              const c = cov[n] || 0;
              return `<div>
                <div class="row between" style="margin-bottom:3px">
                  <span style="font-size:11.5px">${esc(NEED_META[n].label)}</span>
                  <span style="font-size:11px;color:var(--ink-4);font-family:var(--font-mono)">${c}</span>
                </div>
                ${bar(Math.min(100, (c / 6) * 100), c === 0 ? 'red' : c < 2 ? '' : 'green')}
              </div>`;
            })
            .join('')}
        </div>
        <div style="font-size:11px;color:var(--ink-4);margin-top:9px;line-height:1.7">
          某个方向为 0 或 1 项时，方案匹配会缺位或只能给单一推荐——这是品项结构问题，不是话术能补的。
        </div>
      </div>`;
  }

  return {
    title: '品项库',
    crumb: `${esc(me.role === 'hq' ? '全部门店' : storeName(me.storeId))} · 方案与问答的事实来源`,
    actions: '',
    html,
    mount(root) {
      render();
      ['#lq', '#lkind', '#ltier'].forEach((sel) => {
        const el = root.querySelector(sel);
        if (el) el.addEventListener('input', render);
      });

      root.querySelector('#btn-add').addEventListener('click', () => {
        openAddItem(() => {
          items = activeItems();
          render();
          toast('品项已添加，方案匹配立即生效');
        });
      });
    },
  };
}

function openAddItem(onDone) {
  openModal({
    title: '新增品项',
    body: `
      <div class="stack sm">
        <div class="grid g2">
          <div class="field"><label>名称 <span class="req">*</span></label><input class="input" id="ai-name" placeholder="如 屏障修护疗程" /></div>
          <div class="field"><label>类型</label>
            <select class="select" id="ai-kind"><option value="service">院内服务</option><option value="home">居家产品</option></select>
          </div>
        </div>
        <div class="grid g3">
          <div class="field"><label>层级</label>
            <select class="select" id="ai-tier">
              <option value="entry">入门层</option><option value="course">进阶层</option>
              <option value="home">居家层</option><option value="long">长期管理</option>
            </select>
          </div>
          <div class="field"><label>价格</label><input class="input" type="number" id="ai-price" placeholder="2680" /></div>
          <div class="field"><label>次数</label><input class="input" type="number" id="ai-sessions" placeholder="6" /></div>
        </div>
        <div class="field">
          <label>对应方向（决定方案匹配）<span class="req">*</span></label>
          <div class="chip-set" id="ai-needs">
            ${Object.entries(NEED_META).map(([k, v]) => `<button type="button" class="chip" data-need="${k}">${esc(v.label)}</button>`).join('')}
          </div>
        </div>
        <div class="field"><label>说明</label><textarea class="textarea" id="ai-desc" placeholder="做什么、怎么做、适合谁"></textarea></div>
        <div class="field"><label>禁忌 / 注意</label><input class="input" id="ai-caution" placeholder="什么情况不能做" /></div>
      </div>`,
    footer: `<button class="btn" data-close>取消</button><button class="btn primary" data-ok>保存</button>`,
    onMount(mask, close) {
      const pickedNeeds = new Set();
      mask.querySelectorAll('[data-need]').forEach((b) => {
        b.addEventListener('click', () => {
          const k = b.dataset.need;
          if (pickedNeeds.has(k)) {
            pickedNeeds.delete(k);
            b.classList.remove('on');
          } else {
            pickedNeeds.add(k);
            b.classList.add('on');
          }
        });
      });

      mask.querySelector('[data-ok]').addEventListener('click', () => {
        const name = mask.querySelector('#ai-name').value.trim();
        if (!name) return toast('请填写名称', 'warn');
        if (!pickedNeeds.size) return toast('至少选一个对应方向，否则方案匹配不到它', 'warn');
        const r = addItem({
          name,
          kind: mask.querySelector('#ai-kind').value,
          tier: mask.querySelector('#ai-tier').value,
          price: Number(mask.querySelector('#ai-price').value) || 0,
          sessions: Number(mask.querySelector('#ai-sessions').value) || 1,
          needs: [...pickedNeeds],
          category: [...pickedNeeds][0],
          desc: mask.querySelector('#ai-desc').value,
          caution: mask.querySelector('#ai-caution').value,
        });
        if (!r.ok) return toast(r.message, 'warn');
        close();
        if (onDone) onDone();
      });
    },
  });
}
