/** intake.js — 面诊录入：九个维度 + 沟通信号 + 原文，实时预览标签 */

import {
  customers, customerById, scope, displayName, addAssessment, addTodo, assessmentsOf,
  latestAssessment, getState, daysSince, storeName,
} from '../db.js';
import { tag, empty, esc, toast, openModal, navigate, sourceBadge, notice, $ } from '../ui.js';
import { DIMENSIONS, DIM_MAP, SIGNALS, SIGNAL_MAP, findDimValue, NEED_META } from '../taxonomy.js';
import { rankNeeds, extractTodos, canGenerate } from '../engine.js';
import { addDays } from '../util.js';

const SOURCES = [
  { v: 'device', label: '仪器' },
  { v: 'eye', label: '目测' },
  { v: 'self', label: '自述' },
];

export default async function intakeView({ id }) {
  const list = customers();
  const me = scope().me;

  if (!list.length) {
    return {
      title: '面诊录入',
      html: `<div class="card card-pad">${empty('·', '当前身份下没有可见客户。先去新建一位，或者切换到店长身份。')}</div>`,
      actions: '',
    };
  }

  const initial = id && customerById(id) ? customerById(id) : list[0];

  /* 局部表单状态：不写回 db，直到点提交 */
  const form = {
    customerId: initial.id,
    dims: {},
    signals: [],
    device: { hydration: '', oil: '', pigment: '' },
    concern: '',
    note: '',
  };

  const html = `
  <div class="grid split">
    <div class="stack">
      <div class="card">
        <div class="card-head"><h3>1 · 本次是谁</h3><span class="sub">选客户，或先去新建</span></div>
        <div class="card-body">
          <div class="row wrap">
            <div class="field" style="flex:1;min-width:200px">
              <label>客户</label>
              <select class="select" id="f-cust">
                ${list
                  .map(
                    (c) =>
                      `<option value="${c.id}" ${c.id === form.customerId ? 'selected' : ''}>${esc(displayName(c))} · ${c.age || '—'} 岁 · ${assessmentsOf(c.id).length} 次记录</option>`,
                  )
                  .join('')}
              </select>
            </div>
            <div style="padding-top:18px"><span id="cust-hint" style="font-size:12px;color:var(--ink-3)"></span></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h3>2 · 面部观察</h3>
          <span class="sub">每个维度选一个值；来源分「仪器 / 目测 / 自述」，不要混着填</span>
        </div>
        <div class="card-body dim-picker" id="dim-wrap">
          ${DIMENSIONS.map(
            (d) => `
            <div data-dim="${d.key}">
              <div class="row between" style="margin-bottom:6px">
                <span style="font-size:12.5px;font-weight:600">${esc(d.label)}</span>
                <div class="seg" data-src-seg="${d.key}">
                  ${SOURCES.map((s) => `<button type="button" data-src="${s.v}" data-dimkey="${d.key}" class="${s.v === 'eye' ? 'on' : ''}">${s.label}</button>`).join('')}
                </div>
              </div>
              <div class="chip-set">
                ${d.values
                  .map(
                    (v) =>
                      `<button type="button" class="chip" data-pick="${d.key}" data-v="${v.v}">${esc(v.label)}</button>`,
                  )
                  .join('')}
              </div>
            </div>`,
          ).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h3>3 · 沟通信号</h3>
          <span class="sub">客户说了什么、你在她话里听出了什么。这些决定话术策略</span>
        </div>
        <div class="card-body">
          <div class="chip-set" id="sig-wrap">
            ${SIGNALS.map(
              (s) => `<button type="button" class="chip" data-sig="${s.v}" title="${esc(s.note)}">${esc(s.label)}</button>`,
            ).join('')}
          </div>
          <div class="field" style="margin-top:16px">
            <label>客户原话 / 明确诉求</label>
            <input class="input" id="f-concern" placeholder="例如：想提亮，但怕又刺激" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h3>4 · 沟通原文与仪器读数</h3>
          <span class="sub">原文越具体，自动提取的待办越准</span>
        </div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:14px">
          <div class="field">
            <label>面诊 / 服务沟通原文</label>
            <textarea class="textarea" id="f-note" style="min-height:104px"
              placeholder="把客户说的、你观察到的照实记下来。例如：这两周加班到十二点，卡粉更明显了。问能不能做提亮，说上次那个美白精华用完脸有点烫。提到价格时停顿了一下。"></textarea>
            <span class="help">提交后系统会从这段话里拆出诉求、后续动作和风险信号，变成待办。</span>
          </div>
          <div>
            <div style="font-size:11.5px;color:var(--ink-3);margin-bottom:6px">仪器读数（有就填，没有留空——留空不等于正常）</div>
            <div class="grid g3">
              <div class="field"><label>含水量</label><input class="input" type="number" min="0" max="100" id="d-hydration" placeholder="如 39" /></div>
              <div class="field"><label>出油值</label><input class="input" type="number" min="0" max="100" id="d-oil" placeholder="如 60" /></div>
              <div class="field"><label>色素值</label><input class="input" type="number" min="0" max="100" id="d-pigment" placeholder="如 41" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="stack" style="position:sticky;top:80px">
      <div class="card">
        <div class="card-head"><h3>实时预览</h3><span class="sub" id="prev-count">0 个维度</span></div>
        <div class="card-body" id="preview"></div>
      </div>
      <div class="card card-pad">
        <div class="row" style="gap:8px">
          <button class="btn primary lg" id="btn-save" style="flex:1">保存面诊记录</button>
        </div>
        <div style="font-size:11px;color:var(--ink-4);margin-top:9px;line-height:1.7">
          保存后会自动比对上一次记录，并给出可生成的场景。
        </div>
      </div>
    </div>
  </div>`;

  function currentRecordLike() {
    return { dims: form.dims, signals: form.signals, device: form.device };
  }

  function renderPreview() {
    const dimCount = Object.keys(form.dims).length;
    const rec = currentRecordLike();
    const ranked = rankNeeds(rec);
    const tags = [];
    for (const d of Object.values(form.dims)) {
      const val = findDimValue(d.dimKey, d.v);
      if (val && val.sev > 0) tags.push(...val.tags);
    }
    for (const sv of form.signals) {
      const sig = SIGNAL_MAP[sv];
      if (sig?.tags?.length) tags.push(sig.tags[0]);
    }
    const uniqTags = [...new Set(tags)];

    const prev = assessmentsOf(form.customerId)[0];

    $('#prev-count').textContent = `${dimCount} 个维度`;

    let body = '';
    if (!dimCount && !form.signals.length) {
      body = `<div style="font-size:12px;color:var(--ink-4);line-height:1.9">
        还没有选任何维度。<br>先点右边的值——每个维度选一个就够了，不用九个都填完。
      </div>`;
    } else {
      body = `
        <div style="margin-bottom:12px">
          <div style="font-size:11px;color:var(--ink-4);letter-spacing:.06em;margin-bottom:6px">自动提取的标签</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px">
            ${uniqTags.length ? uniqTags.map((t) => tag(t, 'amber')).join('') : '<span style="font-size:12px;color:var(--ink-4)">本次没有异常标签</span>'}
          </div>
        </div>
        ${
          ranked.length
            ? `<div style="margin-bottom:12px">
                <div style="font-size:11px;color:var(--ink-4);letter-spacing:.06em;margin-bottom:6px">需求排序（决定话术主线）</div>
                ${ranked
                  .slice(0, 4)
                  .map(
                    (r, i) => `<div style="display:flex;gap:8px;font-size:12px;padding:4px 0;align-items:baseline">
                      <span style="font-family:var(--font-mono);color:var(--ink-4);font-size:11px">${i + 1}</span>
                      <span style="flex:1">${esc(NEED_META[r.need]?.label || r.need)}</span>
                      <span class="tag ${r.sev >= 2 ? 'red' : 'plain'}">${r.sev >= 3 ? '高' : r.sev === 2 ? '中' : '低'}</span>
                    </div>`,
                  )
                  .join('')}
              </div>`
            : ''
        }
        ${prev ? `<div style="font-size:11.5px;color:var(--ink-3);line-height:1.8;border-top:1px solid var(--line-2);padding-top:10px">
            将与 ${prev.at.slice(0, 10)} 的记录做对比（间隔 ${daysSince(prev.at)} 天）。
          </div>` : `<div class="notice" style="margin-top:4px">这是该客户的第一份面诊记录，暂时没有可对比的基线。</div>`}
        ${Object.values(form.dims).some((d) => d.source === 'device') ? '<div style="font-size:11px;color:var(--ink-4);margin-top:8px">含仪器数据：话术里会优先用数值对比。</div>' : ''}
      `;
    }
    $('#preview').innerHTML = body;
    $('#btn-save').disabled = dimCount === 0;
  }

  function updateCustHint() {
    const recs = assessmentsOf(form.customerId);
    const hint = $('#cust-hint');
    if (!hint) return;
    hint.textContent = recs.length
      ? `上次记录 ${daysSince(recs[0].at)} 天前，本次会自动对比`
      : '该客户还是空白档案，这是第一份记录';
  }

  return {
    title: '面诊录入',
    crumb: `面诊录入 · ${esc(storeName(me.storeId))} · 记录人 ${esc(me.name)}`,
    actions: `<button class="btn" data-nav="/customers">客户列表</button>`,
    html,
    mount(root) {
      updateCustHint();
      renderPreview();

      // 客户切换
      root.querySelector('#f-cust').addEventListener('change', (e) => {
        form.customerId = e.target.value;
        form.dims = {};
        form.signals = [];
        root.querySelectorAll('[data-pick]').forEach((b) => b.classList.remove('on'));
        root.querySelectorAll('[data-sig]').forEach((b) => b.classList.remove('on'));
        updateCustHint();
        renderPreview();
      });

      // 维度选择
      root.querySelectorAll('[data-pick]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const dimKey = btn.dataset.pick;
          const v = btn.dataset.v;
          const group = btn.closest('.chip-set');
          const isOn = btn.classList.contains('on');
          group.querySelectorAll('.chip').forEach((b) => b.classList.remove('on'));
          if (isOn) {
            delete form.dims[dimKey];
          } else {
            btn.classList.add('on');
            // 来源取该维度当前选中的 seg
            const seg = root.querySelector(`[data-src-seg="${dimKey}"] .on`);
            form.dims[dimKey] = { v, source: seg?.dataset.src || 'eye', dimKey };
          }
          renderPreview();
        });
      });

      // 来源切换
      root.querySelectorAll('[data-src]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const dimKey = btn.dataset.dimkey;
          const seg = btn.closest('.seg');
          seg.querySelectorAll('button').forEach((b) => b.classList.remove('on'));
          btn.classList.add('on');
          if (form.dims[dimKey]) form.dims[dimKey].source = btn.dataset.src;
          renderPreview();
        });
      });

      // 信号
      root.querySelectorAll('[data-sig]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const v = btn.dataset.sig;
          btn.classList.toggle('on');
          if (btn.classList.contains('on')) form.signals.push(v);
          else form.signals = form.signals.filter((x) => x !== v);
          renderPreview();
        });
      });

      // 数值与文本
      ['hydration', 'oil', 'pigment'].forEach((k) => {
        const el = root.querySelector(`#d-${k}`);
        el.addEventListener('input', () => {
          const n = Number(el.value);
          form.device[k] = el.value === '' ? '' : n;
        });
      });
      root.querySelector('#f-concern').addEventListener('input', (e) => (form.concern = e.target.value));
      root.querySelector('#f-note').addEventListener('input', (e) => (form.note = e.target.value));

      // 保存
      root.querySelector('#btn-save').addEventListener('click', () => {
        if (!Object.keys(form.dims).length) return toast('至少选一个观察维度', 'warn');
        const device = {};
        for (const [k, v] of Object.entries(form.device)) if (v !== '' && !Number.isNaN(v)) device[k] = v;

        const res = addAssessment({
          customerId: form.customerId,
          dims: Object.fromEntries(Object.entries(form.dims).map(([k, v]) => [k, { v: v.v, source: v.source }])),
          signals: form.signals,
          note: form.note,
          concern: form.concern,
          device: Object.keys(device).length ? device : null,
        });
        if (!res.ok) return toast(res.message, 'warn');

        toast('面诊记录已保存');

        // 从原文提取待办，让顾问确认
        const extracted = extractTodos(form.note, form.customerId);
        if (extracted.length) {
          openExtractConfirm(extracted, form.customerId, () => {
            navigate(`/script/${form.customerId}`);
          });
        } else {
          navigate(`/script/${form.customerId}`);
        }
      });
    },
  };
}

/** 自动提取的待办不直接落库，先让人确认——机器拆句子会有误差 */
export function openExtractConfirm(items, customerId, onDone) {
  const rows = items
    .map(
      (t, i) => `
    <label style="display:flex;gap:9px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--line-2);cursor:pointer">
      <input type="checkbox" data-ex="${i}" checked style="margin-top:3px;width:15px;height:15px;accent-color:var(--accent);flex:none" />
      <div style="flex:1;min-width:0">
        <div style="font-size:12.5px;line-height:1.65">${esc(t.content)}</div>
        <div style="font-size:11px;color:var(--ink-4);margin-top:3px">
          <span class="tag ${t.type === 'risk' ? 'red' : t.type === 'need' ? 'blue' : 'accent'}" style="margin-right:5px">${t.type === 'risk' ? '风险信号' : t.type === 'need' ? '客户诉求' : '顾问动作'}</span>
          截止 ${t.dueAt}${t.assumed ? '（未提到时间，默认 7 天后）' : ''} · ${esc(t.reason)}
        </div>
      </div>
    </label>`,
    )
    .join('');

  openModal({
    title: `从沟通原文提取到 ${items.length} 条事项`,
    body: `
      <div style="font-size:12px;color:var(--ink-3);margin-bottom:10px;line-height:1.7">
        这几条是按句式规则拆出来的，可能有误判。勾掉不准确的，剩下的会加进待办并关联到这位客户。
      </div>
      ${rows}`,
    footer: `<button class="btn" id="skip">都不加</button><button class="btn primary" id="ok">加入待办</button>`,
    onMount(mask, close) {
      mask.querySelector('#skip').addEventListener('click', () => {
        close();
        if (onDone) onDone();
      });
      mask.querySelector('#ok').addEventListener('click', () => {
        const picks = [...mask.querySelectorAll('[data-ex]:checked')].map((cb) => Number(cb.dataset.ex));
        let n = 0;
        for (const i of picks) {
          const t = items[i];
          const r = addTodo({
            customerId,
            type: t.type,
            content: t.content,
            dueAt: t.dueAt,
            origin: 'auto',
          });
          if (r.ok) n += 1;
        }
        close();
        if (n) toast(`已加入 ${n} 条待办`);
        if (onDone) onDone();
      });
    },
  });
}
