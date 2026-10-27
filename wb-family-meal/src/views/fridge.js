import { register } from '../js/actions.js';
import { state, setState } from '../js/state.js';
import { icon } from '../js/icons.js';
import {
  escapeHtml, toast, sheet, confirmDialog, emptyState, initialOf,
} from '../js/ui.js';
import { FRIDGE_CATEGORIES, FRIDGE_UNITS, fridgeCategoryLabel } from '../js/config.js';
import * as db from '../js/db.js';

let activeCat = 'all';

const COUNTABLE = ['份', '个', '根', '颗', '把', '盒', '袋', '瓶'];

/* ---------------------------------------------------------------- 小工具 */

function num(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(1)));
}

export function qtyText(item) {
  return `${num(item.qty)}${item.unit || '份'}`;
}

function isCountable(item) {
  return COUNTABLE.includes(item.unit || '份');
}

function catKey(item) {
  const key = item.category || 'other';
  return FRIDGE_CATEGORIES.some((c) => c.key === key) ? key : 'other';
}

/** 距离到期还有几天；没填保质期返回 null */
export function daysLeft(item) {
  if (!item.expire_at) return null;
  const text = String(item.expire_at).slice(0, 10);
  const target = new Date(`${text}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

function expireBadge(item) {
  const days = daysLeft(item);
  if (days === null) return '';
  if (days < 0) return `<span class="pill pill-danger">过期 ${-days} 天</span>`;
  if (days === 0) return '<span class="pill pill-danger">今天到期</span>';
  if (days <= 2) return `<span class="pill pill-warn">剩 ${days} 天</span>`;
  if (days <= 5) return `<span class="pill pill-muted">剩 ${days} 天</span>`;
  return '';
}

function sortItems(list) {
  return [...list].sort((a, b) => {
    const da = daysLeft(a);
    const db2 = daysLeft(b);
    const ka = da === null ? 99999 : da;
    const kb = db2 === null ? 99999 : db2;
    if (ka !== kb) return ka - kb;
    return String(b.created_at).localeCompare(String(a.created_at));
  });
}

function visibleItems() {
  if (activeCat === 'all') return state.fridge;
  return state.fridge.filter((it) => catKey(it) === activeCat);
}

function groups() {
  const buckets = new Map();
  visibleItems().forEach((it) => {
    const key = catKey(it);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(it);
  });
  return FRIDGE_CATEGORIES
    .filter((c) => buckets.has(c.key))
    .map((c) => ({ key: c.key, label: c.label, items: sortItems(buckets.get(c.key)) }));
}

function expiringCount() {
  return state.fridge.filter((it) => {
    const d = daysLeft(it);
    return d !== null && d <= 2;
  }).length;
}

/* ---------------------------------------------------------------- 渲染 */

function itemRow(item) {
  const note = String(item.note || '').trim();
  const countable = isCountable(item);
  // 非计数单位（克/毫升）的数量显示在右侧，描述里就不再重复
  const desc = [countable ? qtyText(item) : '', note].filter(Boolean).join(' · ');
  const stepper = countable
    ? `<div class="qty">
         <button class="qty-btn ${Number(item.qty) <= 1 ? 'is-off' : ''}" data-act="fridge.dec" data-id="${item.id}" aria-label="减少">${icon('minus', 15, 2.4)}</button>
         <span class="qty-num">${num(item.qty)}</span>
         <button class="qty-btn is-plus" data-act="fridge.inc" data-id="${item.id}" aria-label="增加">${icon('plus', 15, 2.4)}</button>
       </div>`
    : `<span class="fridge-amount">${escapeHtml(qtyText(item))}</span>`;

  return `
    <div class="row fridge-row">
      <span class="avatar">${escapeHtml(initialOf(item.name))}</span>
      <div class="row-main" data-act="fridge.edit" data-id="${item.id}">
        <div class="row-title">${escapeHtml(item.name)}${expireBadge(item)}</div>
        <div class="row-desc nowrap">${escapeHtml(desc)}</div>
      </div>
      <div class="row-tail">${stepper}</div>
    </div>
  `;
}

function listHtml() {
  if (!state.fridge.length) return '';
  const list = groups();
  if (!list.length) {
    return emptyState({
      iconName: 'fridge',
      title: '这个分类是空的',
      desc: '换个分类看看，或者往冰箱里加一样',
      actionHtml: '<button class="btn btn-plain" data-act="fridge.all">看全部</button>',
    });
  }
  return list.map((g) => `
    <div class="dish-group-title">${escapeHtml(g.label)} · ${g.items.length} 样</div>
    <div class="card">${g.items.map(itemRow).join('')}</div>
  `).join('');
}

function filterRail() {
  const counts = new Map();
  state.fridge.forEach((it) => {
    const key = catKey(it);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const items = [
    { key: 'all', label: '全部', n: state.fridge.length },
    ...FRIDGE_CATEGORIES.filter((c) => counts.get(c.key)).map((c) => ({
      key: c.key, label: c.label, n: counts.get(c.key),
    })),
  ];
  if (items.length <= 2) return '';
  return items.map((it) => `
    <button class="chip ${activeCat === it.key ? 'chip-brand' : 'chip-line'}" data-act="fridge.cat" data-key="${it.key}">
      ${escapeHtml(it.label)}<span class="chip-count">${it.n}</span>
    </button>
  `).join('');
}

function summaryHtml() {
  const total = state.fridge.length;
  const soon = expiringCount();
  const sub = soon
    ? `${soon} 样两天内要吃掉，别放坏了`
    : '这些都是家里现成的，不用再买';

  return `
    <div class="card card-pad" style="margin-top:6px">
      <div class="inline" style="gap:13px">
        <span class="quick-ico" style="width:38px;height:38px;border-radius:13px">${icon('fridge', 20)}</span>
        <div class="grow">
          <div style="font-size:15.5px;font-weight:800">冰箱里还剩 ${total} 样</div>
          <div class="row-desc">${escapeHtml(sub)}</div>
        </div>
        ${soon ? `<span class="pill pill-warn">${icon('alert', 12, 2)}${soon} 样快到期</span>` : ''}
      </div>
    </div>
  `;
}

export function render() {
  const total = state.fridge.length;

  if (!total) {
    return `
      <div style="margin-top:14px">
        ${emptyState({
          iconName: 'fridge',
          title: '冰箱还是空的',
          desc: '把冰箱里剩下的食材记进来，谁去买菜、今天做什么，心里都有数',
          actionHtml: `<button class="btn btn-primary" data-act="fridge.add">${icon('plus', 17, 2)}记第一样食材</button>`,
        })}
      </div>
    `;
  }

  const rail = filterRail();

  return `
    ${summaryHtml()}
    ${rail ? `<div class="chip-row" id="fridgeFilters" style="margin-top:14px">${rail}</div>` : ''}
    <div id="fridgeList">${listHtml()}</div>
    <button class="btn btn-plain btn-sm" style="margin:22px auto 0;display:flex" data-act="fridge.clear">${icon('trash', 15, 2)}清空冰箱</button>
  `;
}

/* ---------------------------------------------------------------- 编辑表单 */

export function openItemForm(item = null) {
  const isEdit = Boolean(item && item.id);
  const member = state.member;
  if (!member) {
    toast('请先登录', 'error');
    return null;
  }

  let category = isEdit ? catKey(item) : (activeCat !== 'all' ? activeCat : 'veg');
  let unit = isEdit ? (item.unit || '份') : '份';
  let busy = false;

  const catChips = () => FRIDGE_CATEGORIES.map((c) => `
    <button type="button" class="chip ${category === c.key ? 'chip-brand' : 'chip-line'}" data-cat="${c.key}">${escapeHtml(c.label)}</button>
  `).join('');

  const unitChips = () => FRIDGE_UNITS.map((u) => `
    <button type="button" class="chip ${unit === u ? 'chip-brand' : 'chip-line'}" data-unit="${u}">${escapeHtml(u)}</button>
  `).join('');

  const body = `
    <label class="field" style="margin-top:6px">
      <span class="field-label">食材</span>
      <input class="input" id="fiName" maxlength="16" placeholder="例如：西红柿、鸡蛋"
        value="${escapeHtml(isEdit ? item.name : '')}" />
    </label>

    <div class="inline" style="gap:12px;align-items:flex-start">
      <label class="field grow" style="margin-top:14px">
        <span class="field-label">还剩多少</span>
        <div class="inline" style="gap:8px">
          <button type="button" class="qty-btn" id="fiMinus" aria-label="减少">${icon('minus', 15, 2.4)}</button>
          <input class="input grow" id="fiQty" type="number" inputmode="decimal" min="0.5" step="0.5"
            placeholder="1" value="${escapeHtml(isEdit ? num(item.qty) : '1')}" style="text-align:center" />
          <button type="button" class="qty-btn is-plus" id="fiPlus" aria-label="增加">${icon('plus', 15, 2.4)}</button>
        </div>
      </label>
    </div>

    <div class="field">
      <span class="field-label">单位</span>
      <div class="inline" style="flex-wrap:wrap;gap:6px" id="fiUnits">${unitChips()}</div>
    </div>

    <div class="field">
      <span class="field-label">分类</span>
      <div class="inline" style="flex-wrap:wrap;gap:6px" id="fiCats">${catChips()}</div>
    </div>

    <div class="field">
      <span class="field-label">保质期到哪天（可不填）</span>
      <input class="input" id="fiExpire" type="date" value="${escapeHtml(isEdit && item.expire_at ? String(item.expire_at).slice(0, 10) : '')}" />
      <div class="field-hint">填了会按剩余天数提醒，快过期的时候排在最前面</div>
    </div>

    <label class="field">
      <span class="field-label">备注（可不填）</span>
      <input class="input" id="fiNote" maxlength="20" placeholder="例如：昨天买的、给靓靓留的"
        value="${escapeHtml(isEdit ? item.note || '' : '')}" />
    </label>

    ${isEdit ? `<div class="field" style="margin-top:22px">
      <button type="button" class="btn btn-danger btn-block btn-sm" id="fiFinish">${icon('check', 16, 2)}吃完了，从冰箱划掉</button>
    </div>` : ''}
  `;

  const foot = `
    <button class="btn btn-plain" data-sheet-close>取消</button>
    <button class="btn btn-primary" id="fiSave">${isEdit ? '保存修改' : '记进冰箱'}</button>
  `;

  return sheet({
    title: isEdit ? '改一下这份食材' : '冰箱里还有啥',
    body,
    foot,
    onMount(panel, close) {
      const nameInput = panel.querySelector('#fiName');
      const qtyInput = panel.querySelector('#fiQty');
      const saveBtn = panel.querySelector('#fiSave');

      const bump = (delta) => {
        const cur = Number(qtyInput.value) || 0;
        qtyInput.value = num(Math.max(0.5, cur + delta));
      };
      panel.querySelector('#fiMinus').addEventListener('click', () => bump(-0.5));
      panel.querySelector('#fiPlus').addEventListener('click', () => bump(0.5));

      panel.querySelector('#fiUnits').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-unit]');
        if (!btn) return;
        unit = btn.dataset.unit;
        panel.querySelector('#fiUnits').innerHTML = unitChips();
      });

      panel.querySelector('#fiCats').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-cat]');
        if (!btn) return;
        category = btn.dataset.cat;
        panel.querySelector('#fiCats').innerHTML = catChips();
      });

      const finishBtn = panel.querySelector('#fiFinish');
      if (finishBtn) {
        finishBtn.addEventListener('click', async () => {
          finishBtn.disabled = true;
          try {
            await db.deleteFridgeItem(item.id);
            setState({ fridge: state.fridge.filter((it) => Number(it.id) !== Number(item.id)) });
            toast(`「${item.name}」已经从冰箱划掉了`, 'ok');
            close();
          } catch (err) {
            finishBtn.disabled = false;
            toast(err.friendly || err.message || '没能划掉，稍后再试', 'error');
          }
        });
      }

      const doSave = async () => {
        if (busy) return;
        const name = nameInput.value.trim();
        if (!name) {
          toast('写个食材名字吧', 'error');
          nameInput.focus();
          return;
        }
        const qty = Number(qtyInput.value);
        if (!Number.isFinite(qty) || qty <= 0) {
          toast('数量要大于 0', 'error');
          qtyInput.focus();
          return;
        }

        busy = true;
        saveBtn.innerHTML = '<span class="spinner"></span>保存中';

        const payload = {
          family_id: member.family_id,
          name,
          category,
          qty,
          unit,
          expire_at: panel.querySelector('#fiExpire').value || null,
          note: panel.querySelector('#fiNote').value.trim(),
        };

        try {
          if (isEdit) {
            const updated = await db.updateFridgeItem(item.id, payload);
            setState({
              fridge: state.fridge.map((it) => (Number(it.id) === Number(item.id) ? updated : it)),
            });
            toast('已保存', 'ok');
            close();
            return;
          }

          // 同名同单位就合并数量，避免冰箱里出现两条「鸡蛋」
          const dup = state.fridge.find(
            (it) => String(it.name).toLowerCase() === name.toLowerCase() && (it.unit || '份') === unit
          );
          if (dup) {
            const merged = await db.updateFridgeItem(dup.id, {
              qty: Number(dup.qty) + qty,
              expire_at: payload.expire_at || dup.expire_at,
              note: payload.note || dup.note,
            });
            setState({
              fridge: state.fridge.map((it) => (Number(it.id) === Number(dup.id) ? merged : it)),
            });
            toast(`冰箱里本来就有「${name}」，现在一共 ${qtyText(merged)}`, 'ok');
          } else {
            const created = await db.createFridgeItem(payload);
            setState({ fridge: [created, ...state.fridge] });
            toast('已经记进冰箱啦', 'ok');
          }
          close();
        } catch (err) {
          busy = false;
          saveBtn.innerHTML = isEdit ? '保存修改' : '记进冰箱';
          toast(err.friendly || err.message || '保存失败，请重试', 'error');
        }
      };

      saveBtn.addEventListener('click', doSave);
      qtyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); doSave(); }
      });
      setTimeout(() => nameInput.focus(), 220);
    },
  });
}

/* ---------------------------------------------------------------- 行为 */

function findItem(id) {
  return state.fridge.find((it) => String(it.id) === String(id));
}

async function bumpQty(id, delta) {
  const item = findItem(id);
  if (!item) return;
  const prev = Number(item.qty) || 1;
  const next = Math.max(1, prev + delta);
  if (next === prev) return;

  setState({
    fridge: state.fridge.map((it) => (String(it.id) === String(id) ? { ...it, qty: next } : it)),
  });
  try {
    await db.updateFridgeItem(item.id, { qty: next });
  } catch (err) {
    setState({
      fridge: state.fridge.map((it) => (String(it.id) === String(id) ? { ...it, qty: prev } : it)),
    });
    toast(err.friendly || err.message || '没改动成功，稍后再试', 'error');
  }
}

register('fridge.add', () => { openItemForm(null); });

register('fridge.edit', (ds) => {
  const item = findItem(ds.id);
  if (item) openItemForm(item);
});

register('fridge.inc', (ds) => bumpQty(ds.id, 1));
register('fridge.dec', (ds) => bumpQty(ds.id, -1));

register('fridge.cat', (ds) => {
  activeCat = ds.key || 'all';
  repaintList();
});

register('fridge.all', () => {
  activeCat = 'all';
  repaintList();
});

function repaintList() {
  const filters = document.querySelector('#fridgeFilters');
  if (filters) filters.innerHTML = filterRail();
  const list = document.querySelector('#fridgeList');
  if (list) list.innerHTML = listHtml();
}

register('fridge.clear', async () => {
  const ok = await confirmDialog({
    title: '清空冰箱？',
    desc: `会把冰箱里的 ${state.fridge.length} 样食材全部划掉，这个操作没法撤销。`,
    okText: '清空',
    danger: true,
  });
  if (!ok) return;
  const member = state.member;
  if (!member) return;
  try {
    await db.clearFridgeItems(member.family_id);
    setState({ fridge: [] });
    activeCat = 'all';
    toast('冰箱已经清空了', 'ok');
  } catch (err) {
    toast(err.friendly || err.message || '清空失败，稍后再试', 'error');
  }
});
