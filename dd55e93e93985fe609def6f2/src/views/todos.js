/** todos.js — 待办与跟进：按期限分组，先看逾期的 */

import {
  scopedTodos, customers, displayName, toggleTodo, daysSince, fmtDate, storeName, scope,
} from '../db.js';
import { tag, empty, esc, toast, kpi, bar } from '../ui.js';
import { TODO_TYPES } from '../taxonomy.js';

function bucketOf(t, today) {
  if (t.status === 'done') return 'done';
  if (!t.dueAt) return 'later';
  if (t.dueAt < today) return 'overdue';
  if (t.dueAt === today) return 'today';
  const d = new Date(t.dueAt);
  const diff = Math.ceil((d - new Date(today)) / 86400000);
  if (diff <= 7) return 'week';
  return 'later';
}

export default async function todosView() {
  const me = scope().me;
  const list = customers();
  const all = scopedTodos();
  const today = new Date().toISOString().slice(0, 10);

  const groups = { overdue: [], today: [], week: [], later: [], done: [] };
  for (const t of all) groups[bucketOf(t, today)].push(t);

  for (const k of Object.keys(groups)) {
    groups[k].sort((a, b) => String(a.dueAt || '9999').localeCompare(String(b.dueAt || '9999')));
  }

  const totalOpen = all.filter((t) => t.status === 'open').length;
  const overdue = groups.overdue.length;
  const doneRate = all.length ? Math.round((groups.done.length / all.length) * 100) : 0;

  const meta = {
    overdue: { label: '已逾期', cls: 'red', hint: '先处理这些，客户已经等了' },
    today: { label: '今天到期', cls: 'amber', hint: '今天做完再下班' },
    week: { label: '本周', cls: 'blue', hint: '排进日程' },
    later: { label: '以后', cls: 'plain', hint: '还没到时间' },
    done: { label: '已完成', cls: 'green', hint: '留档用' },
  };

  function row(t) {
    const c = list.find((x) => x.id === t.customerId);
    const type = TODO_TYPES[t.type] || TODO_TYPES.action;
    const isOverdue = t.status === 'open' && t.dueAt && t.dueAt < today;
    return `<div class="list-row">
      <input type="checkbox" data-todo="${t.id}" ${t.status === 'done' ? 'checked' : ''}
        style="width:16px;height:16px;accent-color:var(--accent);flex:none" />
      <div class="lr-main">
        <div style="font-size:13px;line-height:1.65;${t.status === 'done' ? 'text-decoration:line-through;color:var(--ink-4)' : ''}">${esc(t.content)}</div>
        <div class="lr-sub" style="white-space:normal;margin-top:3px">
          ${c ? `<a href="#/customers/${c.id}" style="color:var(--accent)">${esc(displayName(c))}</a>` : '客户已不可见'}
          <span style="margin:0 6px;color:var(--line)">|</span>
          ${tag(type.label, type.cls)}
          <span style="margin-left:6px;${isOverdue ? 'color:var(--red)' : ''}">${t.dueAt || '未设期限'}${isOverdue ? ` · 逾期 ${daysSince(t.dueAt)} 天` : ''}</span>
          ${t.origin === 'auto' ? '<span style="margin-left:6px;color:var(--ink-4)">· 从沟通原文自动提取</span>' : ''}
        </div>
      </div>
    </div>`;
  }

  const html = `
  <div class="stack">
    <div class="grid g4">
      ${kpi('未完成', String(totalOpen), '条', me.role === 'consultant' ? '仅本人名下客户' : me.role === 'manager' ? '本门店全部' : '全部门店')}
      ${kpi('已逾期', String(overdue), '条', overdue ? '优先处理' : '没有逾期', overdue ? 'down' : '')}
      ${kpi('已完成', String(groups.done.length), '条', `完成率 ${doneRate}%`)}
      ${kpi('涉及客户', String(new Set(all.filter((t) => t.status === 'open').map((t) => t.customerId)).size), '位')}
    </div>

    <div class="card">
      <div class="card-head">
        <h3>待办清单</h3>
        <span class="sub">勾选即完成，自动记录完成时间</span>
        <div class="right"><span style="font-size:11.5px;color:var(--ink-4)">完成率</span><div style="width:90px">${bar(doneRate, 'green')}</div></div>
      </div>
      ${
        all.length
          ? Object.entries(groups)
              .filter(([, arr]) => arr.length)
              .map(
                ([key, arr]) => `
            <div style="border-bottom:1px solid var(--line-2)">
              <div style="padding:10px 20px 6px;display:flex;align-items:baseline;gap:8px">
                <span style="font-size:12px;font-weight:600">${meta[key].label}</span>
                <span style="font-size:11px;color:var(--ink-4)">${arr.length} 条 · ${meta[key].hint}</span>
              </div>
              <div class="list" style="padding-bottom:4px">${arr.map(row).join('')}</div>
            </div>`,
              )
              .join('')
          : `<div class="card-body">${empty('·', '还没有待办。<br>录入面诊时，系统会从沟通原文里自动提出几条，由你确认后加入。')}</div>`
      }
    </div>

    <div class="notice">
      <span class="n-mark">·</span>
      <div>待办与客户档案绑定，下次打开该客户时会自动浮现「上次未完成事项」。自动提取的条目可能误判，加入前已让你逐条确认。</div>
    </div>
  </div>`;

  return {
    title: '待办与跟进',
    crumb: `${esc(me.role === 'hq' ? '全部门店' : storeName(me.storeId))} · ${totalOpen} 条未完成`,
    actions: '<button class="btn" data-nav="/customers">按客户查看</button>',
    html,
    mount(root) {
      root.querySelectorAll('[data-todo]').forEach((cb) => {
        cb.addEventListener('change', (e) => {
          const r = toggleTodo(e.target.dataset.todo);
          toast(r.ok ? (e.target.checked ? '已完成' : '已重新打开') : '操作失败', r.ok ? '' : 'warn');
          window.dispatchEvent(new Event('mkt:refresh'));
        });
      });
    },
  };
}
