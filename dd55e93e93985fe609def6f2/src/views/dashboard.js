/** dashboard.js — 工作台：今天该做什么 */

import {
  scope, customers, scopedTodos, getState, daysSince, displayName, assessmentsOf,
  inferLevel, latestAssessment, scriptsOf, storeName, openTodos,
} from '../db.js';
import { kpi, tag, bar, empty, esc, ago, navigate } from '../ui.js';
import { NEED_META } from '../taxonomy.js';
import { buildProfile } from '../engine.js';

export default async function dashboard() {
  const { me } = scope();
  const list = customers();
  const todos = scopedTodos().filter((t) => t.status === 'open');
  const s = getState();

  const now = Date.now();
  const overdue = todos.filter((t) => t.dueAt && new Date(t.dueAt).getTime() < now);
  const dueToday = todos.filter((t) => t.dueAt === new Date().toISOString().slice(0, 10));

  // 30 天内面诊数
  const recentAssess = s.assessments.filter(
    (a) => daysSince(a.at) <= 30 && list.some((c) => c.id === a.customerId),
  );

  // 沉睡客户
  const dormant = [];
  for (const c of list) {
    const last = latestAssessment(c.id);
    if (!last) continue;
    const gap = daysSince(last.at);
    if (gap > 45) dormant.push({ customer: c, gap, last });
  }
  dormant.sort((a, b) => b.gap - a.gap);

  // 录了面诊但一次话术都没生成过 —— 信息沉在库里没用起来
  const dormantData = [];
  for (const c of list) {
    const recs = assessmentsOf(c.id);
    if (!recs.length) continue;
    if (scriptsOf(c.id).length) continue;
    dormantData.push({ customer: c, recs: recs.length, last: recs[0] });
  }

  /* ---------- 今日优先 ---------- */
  const priorities = [];

  for (const t of overdue.slice(0, 2)) {
    const c = list.find((x) => x.id === t.customerId);
    priorities.push({
      kind: '逾期待办',
      cls: 'red',
      title: t.content,
      meta: `${c ? displayName(c) : '客户'} · 应于 ${t.dueAt} 完成 · 已逾期 ${daysSince(t.dueAt)} 天`,
      to: c ? `/customers/${c.id}` : '/todos',
      cta: '去处理',
    });
  }

  for (const d of dormant.slice(0, 1)) {
    priorities.push({
      kind: '沉睡风险',
      cls: 'amber',
      title: `${displayName(d.customer)} 已 ${d.gap} 天未到店`,
      meta: `上次记录 ${d.last.at.slice(0, 10)} · 建议以复测为由触达，不推新项目`,
      to: `/customers/${d.customer.id}`,
      cta: '看档案',
    });
  }

  for (const d of dormantData.slice(0, 2)) {
    priorities.push({
      kind: '待生成话术',
      cls: 'accent',
      title: `${displayName(d.customer)} 的面诊记录还没转成话术`,
      meta: `${d.recs} 次记录 · 最近 ${ago(d.last.at)} · 数据录了但没用起来`,
      to: `/script/${d.customer.id}`,
      cta: '生成话术',
    });
  }

  if (dueToday.length && priorities.length < 4) {
    const t = dueToday[0];
    const c = list.find((x) => x.id === t.customerId);
    priorities.push({
      kind: '今日到期',
      cls: 'blue',
      title: t.content,
      meta: `${c ? displayName(c) : '客户'} · 今天到期`,
      to: '/todos',
      cta: '查看',
    });
  }

  /* ---------- 最近面诊 ---------- */
  const recent = s.assessments
    .filter((a) => list.some((c) => c.id === a.customerId))
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 7);

  /* ---------- 分层分布 ---------- */
  const dist = { new: 0, regular: 0, dormant: 0, vip: 0 };
  for (const c of list) {
    const lv = inferLevel(c);
    dist[lv.key] = (dist[lv.key] || 0) + 1;
  }
  const total = list.length || 1;

  const html = `
  <div class="stack">
    <div class="grid g4">
      ${kpi('可见客户', String(list.length), '位', me.role === 'consultant' ? '仅本人负责' : me.role === 'manager' ? '本门店全部' : '全部门店汇总')}
      ${kpi('待完成事项', String(todos.length), '条', overdue.length ? `${overdue.length} 条已逾期` : '暂无逾期', overdue.length ? 'down' : '')}
      ${kpi('近 30 天面诊', String(recentAssess.length), '次', recentAssess.length ? `覆盖 ${new Set(recentAssess.map((a) => a.customerId)).size} 位客户` : '还没有新记录')}
      ${kpi('沉睡客户', String(dormant.length), '位', dormant.length ? `最久 ${dormant[0].gap} 天未到店` : '暂无超过 45 天的客户', dormant.length ? 'down' : '')}
    </div>

    <div class="grid split">
      <div class="stack">
        <div class="card">
          <div class="card-head">
            <h3>今天优先处理</h3>
            <span class="sub">按「逾期 → 沉睡 → 录了没用」排序，最多四条</span>
          </div>
          ${priorities.length
            ? `<div class="list">
                ${priorities
                  .map(
                    (p) => `
                  <div class="list-row">
                    <div class="lr-main">
                      <div class="lr-title">${tag(p.kind, p.cls)}</div>
                      <div style="font-size:13.5px;margin-top:4px">${esc(p.title)}</div>
                      <div class="lr-sub" style="white-space:normal">${esc(p.meta)}</div>
                    </div>
                    <div class="lr-side">
                      <button class="btn sm" data-nav="${p.to}">${p.cta}</button>
                    </div>
                  </div>`,
                  )
                  .join('')}
              </div>`
            : empty('·', '今天没有到期或异常事项。<br>可以去「面诊录入」补一条新记录，或者看「复盘」里的门店数据。')}
        </div>

        <div class="card">
          <div class="card-head">
            <h3>最近面诊</h3>
            <span class="sub">近 ${recent.length} 条 · 点开看逐维度对比</span>
            <div class="right"><button class="btn sm" data-nav="/intake">录入新面诊</button></div>
          </div>
          ${recent.length
            ? `<div class="list">
                ${recent
                  .map((a) => {
                    const c = list.find((x) => x.id === a.customerId);
                    if (!c) return '';
                    const prof = buildProfile(c.id);
                    const top = prof?.needsRanked?.[0];
                    const issueCount = Object.values(a.dims || {}).filter((d) => d.v).length;
                    return `
                    <div class="list-row clickable" data-nav="/customers/${c.id}">
                      <div class="lr-main">
                        <div class="lr-title">
                          ${esc(displayName(c))}
                          <span style="font-weight:400;color:var(--ink-4);font-size:11.5px">${c.age || '—'} 岁 · ${esc(storeName(c.storeId).replace('沈阳', ''))}</span>
                        </div>
                        <div class="lr-sub">
                          ${top ? `主线：${esc(NEED_META[top.need]?.label || '')}` : '本次无明显问题'} · ${issueCount} 个维度有记录
                        </div>
                      </div>
                      <div class="lr-side">
                        <span style="font-size:11.5px;color:var(--ink-4)">${ago(a.at)}</span>
                      </div>
                    </div>`;
                  })
                  .join('')}
              </div>`
            : empty('·', '还没有面诊记录。先点右上角「录入新面诊」，把第一位客户的状态记下来。')}
        </div>
      </div>

      <div class="stack">
        <div class="card">
          <div class="card-head"><h3>客户分层</h3></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:13px">
            ${[
              { k: 'vip', label: '高客单', cls: 'accent' },
              { k: 'regular', label: '稳定复购', cls: 'green' },
              { k: 'new', label: '体验期', cls: 'blue' },
              { k: 'dormant', label: '沉睡', cls: 'red' },
            ]
              .map(
                (row) => `
              <div>
                <div class="row between" style="margin-bottom:5px">
                  <span style="font-size:12.5px">${row.label}</span>
                  <span style="font-size:12px;color:var(--ink-3);font-family:var(--font-mono)">${dist[row.k] || 0}</span>
                </div>
                ${bar(((dist[row.k] || 0) / total) * 100, row.cls === 'green' ? 'green' : row.cls === 'red' ? 'red' : '')}
              </div>`,
              )
              .join('')}
            <div style="font-size:11px;color:var(--ink-4);line-height:1.7;border-top:1px solid var(--line-2);padding-top:10px">
              分层由到店频次自动推断，不手填：1 次为体验期，2–3 次为稳定复购，超过 45 天未到店记为沉睡。
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><h3>需要提醒的客户</h3></div>
          ${
            dormant.length
              ? `<div class="list">
                  ${dormant
                    .slice(0, 4)
                    .map((d) => {
                      const open = openTodos(d.customer.id).length;
                      return `<div class="list-row clickable" data-nav="/customers/${d.customer.id}">
                        <div class="lr-main">
                          <div class="lr-title">${esc(displayName(d.customer))}</div>
                          <div class="lr-sub">${d.gap} 天未到店${open ? ` · ${open} 条待办未完成` : ''}</div>
                        </div>
                        <div class="lr-side">${tag(`${d.gap} 天`, 'red')}</div>
                      </div>`;
                    })
                    .join('')}
                </div>`
              : empty('·', '没有超过 45 天未到店的客户。')
          }
        </div>

        <div class="card">
          <div class="card-head"><h3>本周提示</h3></div>
          <div class="card-body" style="font-size:12.5px;line-height:1.9;color:var(--ink-2)">
            ${
              dormantData.length
                ? `有 <b>${dormantData.length}</b> 位客户的面诊数据从未转成话术。数据录了却没用，等于白记。`
                : '所有有面诊记录的客户都至少生成过一次话术，数据在转。'
            }
            <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--line-2);color:var(--ink-3)">
              话术生成有前置条件：没有面诊记录就不出销售话术，只提示先补记录。这是硬约束，不是建议。
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  return {
    title: '工作台',
    crumb: `${me.name} · ${me.role === 'hq' ? '全部门店' : storeName(me.storeId)} · 今天 ${new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}`,
    actions: `<button class="btn" data-nav="/ask">问一句</button>
              <button class="btn primary" data-nav="/intake">录入面诊</button>`,
    html,
  };
}
