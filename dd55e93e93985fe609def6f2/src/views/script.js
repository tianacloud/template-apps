/** script.js — 话术工作台：先判断，后话术 */

import {
  customers, customerById, displayName, assessmentsOf, fmtDate, daysSince, scope,
  addScript, addTodo, latestAssessment, storeName,
} from '../db.js';
import { tag, empty, esc, toast, copyText, openModal, navigate, notice, money, $ } from '../ui.js';
import { generateScript, canGenerate, lintText } from '../engine.js';
import { SCENES, SCENE_KEYS, SIGNAL_MAP, NEED_META, BLOCK_RULES } from '../taxonomy.js';
import { addDays } from '../util.js';

const SCENE_ORDER = ['first-visit', 'report-read', 'in-service', 'follow-up', 'price-objection', 'refusal'];

export default async function scriptView({ id }) {
  const list = customers().filter((c) => canGenerate(c.id));
  const allCount = customers().length;
  const me = scope().me;

  /* 没有任何可生成话术的客户 —— 直接拦住，不给按钮 */
  if (!list.length) {
    return {
      title: '话术工作台',
      crumb: `${esc(storeName(me.storeId) || '全部门店')} · 话术生成`,
      html: `<div class="card card-pad">${empty(
        '·',
        `当前没有可生成话术的客户（可见 ${allCount} 位，都没有面诊记录）。<br><br>
         <b>规则：没有面诊记录就不生成销售话术。</b><br>
         话术的上限是专业判断，下限是不让客户不舒服。没有记录，两句都做不到。<br><br>
         <button class="btn primary" data-nav="/intake">先去录入一份面诊</button>`,
      )}</div>`,
      actions: '',
    };
  }

  let currentId = id && list.some((c) => c.id === id) ? id : list[0].id;
  let currentScene = 'first-visit';
  let currentAssessId = null;
  let lastResult = null;

  const html = `
  <div class="stack">
    <div class="card">
      <div class="card-body tight">
        <div class="row wrap" style="gap:10px">
          <div class="field" style="width:210px">
            <label>客户</label>
            <select class="select" id="s-cust">
              ${list
                .map((c) => `<option value="${c.id}" ${c.id === currentId ? 'selected' : ''}>${esc(displayName(c))} · ${assessmentsOf(c.id).length} 次记录</option>`)
                .join('')}
            </select>
          </div>
          <div class="field" style="width:210px">
            <label>依据哪次记录</label>
            <select class="select" id="s-assess"></select>
          </div>
          <div class="field" style="flex:1;min-width:260px">
            <label>场景</label>
            <div class="seg" id="s-scene">
              ${SCENE_ORDER.map((k) => `<button data-scene="${k}" class="${k === currentScene ? 'on' : ''}">${esc(SCENES[k].label)}</button>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="result"></div>
  </div>`;

  function fillAssess() {
    const recs = assessmentsOf(currentId);
    const sel = $('#s-assess');
    if (!sel) return;
    sel.innerHTML = recs
      .map((r, i) => `<option value="${r.id}" ${i === 0 && !currentAssessId ? 'selected' : ''}>${esc(fmtDate(r.at, true))}${i === 0 ? '（最近）' : ''}</option>`)
      .join('');
    currentAssessId = sel.value || recs[0]?.id || null;
  }

  function sceneHint() {
    const sc = SCENES[currentScene];
    return `<div class="notice" style="margin-bottom:2px">
      <span class="n-mark">场</span>
      <div><b>${esc(sc.label)}</b>｜目标：${esc(sc.goal)}<br>
      <span style="color:var(--red)">本场景禁止：${esc(sc.taboo)}</span></div>
    </div>`;
  }

  function renderResult() {
    const res = generateScript(currentId, currentScene, currentAssessId);
    lastResult = res;

    if (!res.ok) {
      $('#result').innerHTML = `<div class="card card-pad">${empty('·', esc(res.message))}</div>`;
      return;
    }

    const c = customerById(currentId);
    const layerMeta = [
      { key: 'observe', idx: '第一层', name: '观察', cls: 'l1', note: '只说看到的事实，不夸大、不恐吓' },
      { key: 'explain', idx: '第二层', name: '解释', cls: 'l2', note: '说明可能的原因，不做医学诊断，不承诺治好' },
      { key: 'advise', idx: '第三层', name: '建议', cls: 'l3', note: '动作与观察直接对应：解决什么、怎么做、几次、什么反应' },
    ];

    const fullText = layerMeta.map((l) => `【${l.name}】${res.layers[l.key] || ''}`).join('\n\n');
    const hasIssues = res.issues.length > 0;
    const hardIssues = res.issues.filter((x) => x.hits.some((h) => h.level === 'block'));

    $('#result').innerHTML = `
    <div class="grid split">
      <div class="stack">
        ${sceneHint()}

        <div class="card">
          <div class="card-head">
            <h3>${esc(displayName(c))} · ${esc(SCENES[currentScene].label)}</h3>
            <span class="sub">${esc(res.sourceNote)}</span>
            <div class="right">
              <button class="btn sm" id="btn-edit">改一版</button>
              <button class="btn sm primary" id="btn-copy">复制全文</button>
            </div>
          </div>
          <div class="card-body">
            ${res.layers.opening ? `<div style="font-size:12.5px;color:var(--ink-3);line-height:1.8;margin-bottom:16px;padding-left:2px">开场：${esc(res.layers.opening)}</div>` : ''}
            ${layerMeta
              .map(
                (l) => `
              <div class="script-layer ${l.cls}">
                <div class="sl-head">${l.idx} · ${l.name}</div>
                <div class="sl-text">${esc(res.layers[l.key] || '')}</div>
                <div class="sl-note">${l.note}<button class="btn ghost sm" data-copy-layer="${l.key}" style="margin-left:6px;padding:0 4px;font-size:10.5px">复制这层</button></div>
              </div>`,
              )
              .join('')}
            ${res.layers.closure ? `<div style="font-size:12.5px;color:var(--ink-3);line-height:1.8;margin-top:16px">收尾：${esc(res.layers.closure)}</div>` : ''}

            ${
              hasIssues
                ? `<div class="notice ${hardIssues.length ? 'red' : 'amber'}" style="margin-top:18px">
                    <span class="n-mark">!</span>
                    <div><b>二次校验命中 ${res.issues.length} 处</b>
                      <ul>${res.issues.map((x) => `<li>${esc(x.field === 'observe' ? '观察层' : x.field === 'explain' ? '解释层' : '建议层')}：${x.hits.map((h) => `${h.label}「${h.word}」`).join('、')} — ${esc(x.action)}</li>`).join('')}</ul>
                    </div>
                  </div>`
                : `<div class="notice green" style="margin-top:18px">
                    <span class="n-mark">✓</span>
                    <div><b>二次校验通过</b><br>未命中恐吓词、绝对化承诺、医学诊断、贬低同行、逼单施压。</div>
                  </div>`
            }
            ${
              res.rewritten.length
                ? `<div class="notice" style="margin-top:10px">
                    <span class="n-mark">改</span>
                    <div>系统在生成时替换了 ${res.rewritten.length} 处高危说法（如「皮肤很差」→「现在偏干」）。被替换的位置在 ${res.rewritten.map((x) => (x === 'observe' ? '观察层' : x === 'explain' ? '解释层' : '建议层')).join('、')}。</div>
                  </div>`
                : ''
            }
            ${
              res.tactics?.length
                ? `<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line-2)">
                    <div style="font-size:11px;color:var(--ink-4);letter-spacing:.06em;margin-bottom:6px">这个场景的用法</div>
                    ${res.tactics.map((t) => `<div style="font-size:12.5px;color:var(--ink-2);line-height:1.9">· ${esc(t)}</div>`).join('')}
                  </div>`
                : ''
            }
          </div>
        </div>

        <div class="card">
          <div class="card-head"><h3>方案落点</h3><span class="sub">话术里提到的项目，来自下面这次匹配</span></div>
          <div class="card-body">
            ${
              res.plan
                ? `<div style="font-size:12.5px;color:var(--ink-2);line-height:1.9;margin-bottom:12px">推进顺序：${esc(res.plan.sequence)}</div>
                   <div class="grid g2">
                     <div>
                       <div style="font-size:11px;color:var(--ink-4);margin-bottom:6px">入门层</div>
                       ${res.plan.tiers.entry.map((i) => `<div class="item-card"><div class="ic-top"><span class="ic-name" style="font-size:12.5px">${esc(i.name)}</span><span class="ic-price">${money(i.price)}</span></div><div class="ic-meta">${esc(i.evidenceText || '')}</div></div>`).join('') || '<div style="font-size:12px;color:var(--ink-4)">无匹配</div>'}
                     </div>
                     <div>
                       <div style="font-size:11px;color:var(--ink-4);margin-bottom:6px">进阶层</div>
                       ${res.plan.tiers.course.map((i) => `<div class="item-card"><div class="ic-top"><span class="ic-name" style="font-size:12.5px">${esc(i.name)}</span><span class="ic-price">${money(i.price)}/${i.sessions}次</span></div><div class="ic-meta">${esc(i.evidenceText || '')}</div></div>`).join('') || '<div style="font-size:12px;color:var(--ink-4)">无匹配</div>'}
                     </div>
                   </div>
                   ${res.plan.tiers.home.length ? `<div style="margin-top:10px;font-size:12px;color:var(--ink-3);line-height:1.8">居家：${res.plan.tiers.home.map((h) => esc(h.name)).join('、')}</div>` : ''}
                   ${res.plan.blocked.length ? `<div style="margin-top:10px;font-size:11.5px;color:var(--red);line-height:1.8">本次不排：${res.plan.blocked.map((b) => esc(b.item.name)).join('、')}（${esc(res.plan.blocked[0].reason)}）</div>` : ''}
                   <div style="margin-top:12px"><button class="btn sm" data-nav="/customers/${currentId}">看完整四层方案</button></div>`
                : '<div style="font-size:12px;color:var(--ink-4)">没有匹配到方案。</div>'
            }
          </div>
        </div>
      </div>

      <div class="stack">
        <div class="card">
          <div class="card-head"><h3>判断依据</h3><span class="sub">每条都能追到记录</span></div>
          <div class="card-body">
            ${
              res.evidence.length
                ? res.evidence
                    .map(
                      (e) => `
                <div style="padding:8px 0;border-bottom:1px solid var(--line-2)">
                  <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                    <b style="font-size:12.5px">${esc(e.needLabel || '')}</b>
                    <span class="source-badge ${e.source === 'device' ? 'device' : e.source === 'self' ? 'self' : 'eye'}">${e.source === 'device' ? '仪器' : e.source === 'self' ? '自述' : '目测'}</span>
                  </div>
                  <div style="font-size:11.5px;color:var(--ink-3);margin-top:2px">${esc(e.dimLabel)} · ${esc(e.value)} · ${esc(fmtDate(e.at))}</div>
                  <div style="font-size:11.5px;color:var(--ink-4);margin-top:3px;line-height:1.7">「${esc(e.quote)}」</div>
                </div>`,
                    )
                    .join('')
                : '<div style="font-size:12px;color:var(--ink-4)">本次没有明显问题维度，话术以维护建议为主。</div>'
            }
          </div>
        </div>

        <div class="card">
          <div class="card-head"><h3>客户画像摘要</h3></div>
          <div class="card-body" style="font-size:12px;line-height:1.9">
            <div style="margin-bottom:8px">${tag(res.profile.level.label, 'accent')} ${tag(`到店 ${res.profile.visits} 次`, 'plain')} ${res.profile.lastGap !== null ? tag(`${res.profile.lastGap} 天前`, res.profile.lastGap > 45 ? 'red' : 'plain') : ''}</div>
            <div style="color:var(--ink-3)">${
              Object.values(res.profile.buckets)
                .flatMap((b) => b.items.map((i) => i.text))
                .slice(0, 8)
                .map((t) => esc(t))
                .join(' · ') || '暂无标签'
            }</div>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><h3>使用提示</h3></div>
          <div class="card-body" style="font-size:12px;color:var(--ink-2);line-height:1.9">
            · 这三段是给<b>你</b>看的骨架，不是说给客户背的稿子。照着说会很像在念。<br>
            · 观察层可以照说，解释层要换成你自己的语气，建议层必须落到具体次数和反应。<br>
            · 客户如果中途打断，先回答问题，别硬把三层走完。
          </div>
        </div>
      </div>
    </div>`;

    // 复制
    $('#btn-copy')?.addEventListener('click', async () => {
      const ok = await copyText(fullText);
      if (ok) {
        const saved = addScript({
          customerId: currentId,
          assessmentId: currentAssessId,
          scene: currentScene,
          level: res.profile.level.key,
          layers: res.layers,
          issues: res.issues,
          engine: 'rule',
        });
        toast(saved.ok ? '已复制并记入话术记录' : '已复制');
      } else {
        toast('复制失败，请手动选择文本', 'warn');
      }
    });

    document.querySelectorAll('[data-copy-layer]').forEach((b) => {
      b.addEventListener('click', async () => {
        const ok = await copyText(res.layers[b.dataset.copyLayer] || '');
        toast(ok ? '已复制这一层' : '复制失败', ok ? '' : 'warn');
      });
    });

    $('#btn-edit')?.addEventListener('click', () => openEditor(res, currentId, currentScene, currentAssessId));
  }

  return {
    title: '话术工作台',
    crumb: `${esc(storeName(me.storeId) || '全部门店')} · 先判断后话术 · 三层结构不可省`,
    actions: `<button class="btn" data-nav="/intake">补录面诊</button>`,
    html,
    mount(root) {
      fillAssess();
      renderResult();

      root.querySelector('#s-cust').addEventListener('change', (e) => {
        currentId = e.target.value;
        currentAssessId = null;
        fillAssess();
        renderResult();
      });

      root.querySelector('#s-assess').addEventListener('change', (e) => {
        currentAssessId = e.target.value;
        renderResult();
      });

      root.querySelectorAll('[data-scene]').forEach((b) => {
        b.addEventListener('click', () => {
          currentScene = b.dataset.scene;
          root.querySelectorAll('[data-scene]').forEach((x) => x.classList.remove('on'));
          b.classList.add('on');
          renderResult();
        });
      });
    },
  };
}

/* ---------------------------------------------------------------- 手改复检 */

function openEditor(res, customerId, scene, assessmentId) {
  const blocks = ['observe', 'explain', 'advise'];
  const label = { observe: '观察', explain: '解释', advise: '建议' };

  openModal({
    title: '改一版 · 边改边检',
    wide: true,
    body: `
      <div style="font-size:12px;color:var(--ink-3);margin-bottom:12px;line-height:1.7">
        顾问改稿是常态。改完点「复检」，命中禁用词会直接标出来——不是拦着不让说，是让你知道这句话客户听了会怎么想。
      </div>
      <div class="stack sm">
        ${blocks
          .map(
            (k) => `
          <div class="field">
            <label>${label[k]}层</label>
            <textarea class="textarea" data-edit="${k}" style="min-height:${k === 'observe' ? '76' : '86'}px">${esc(res.layers[k] || '')}</textarea>
            <div class="help" data-lint="${k}"></div>
          </div>`,
          )
          .join('')}
      </div>
      <div id="lint-summary" style="margin-top:12px"></div>
      <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line-2);font-size:11px;color:var(--ink-4);line-height:1.8">
        禁用规则共 ${BLOCK_RULES.length} 类：${BLOCK_RULES.map((r) => r.label).join('、')}。
      </div>`,
    footer: `<button class="btn" id="btn-lint">复检</button><button class="btn primary" id="btn-save-edit">保存为新版本</button>`,
    onMount(mask, close) {
      const lintAll = () => {
        let total = 0;
        for (const k of blocks) {
          const ta = mask.querySelector(`[data-edit="${k}"]`);
          const out = mask.querySelector(`[data-lint="${k}"]`);
          const r = lintText(ta.value);
          total += r.hits.length;
          if (r.hits.length) {
            out.innerHTML = `<span style="color:var(--red)">命中：${r.hits.map((h) => `${h.label}「${h.word}」`).join('、')}</span>`;
          } else {
            out.innerHTML = `<span style="color:var(--green)">本层无命中</span>`;
          }
        }
        mask.querySelector('#lint-summary').innerHTML =
          total === 0
            ? `<div class="notice green"><span class="n-mark">✓</span><div>三层都没有命中禁用词，可以发给客户听。</div></div>`
            : `<div class="notice red"><span class="n-mark">!</span><div>共命中 ${total} 处。逐条看上面的标红位置，换成事实描述再说。</div></div>`;
      };

      mask.querySelector('#btn-lint').addEventListener('click', lintAll);
      mask.querySelectorAll('[data-edit]').forEach((ta) => ta.addEventListener('input', lintAll));
      lintAll();

      mask.querySelector('#btn-save-edit').addEventListener('click', () => {
        const layers = {};
        for (const k of blocks) layers[k] = mask.querySelector(`[data-edit="${k}"]`).value;
        const issues = [];
        for (const k of blocks) {
          const r = lintText(layers[k]);
          if (r.hits.length) issues.push({ field: k, hits: r.hits, action: '人工改稿后仍有命中' });
        }
        const saved = addScript({
          customerId,
          assessmentId,
          scene,
          level: res.profile.level.key,
          layers,
          issues,
          engine: 'manual',
        });
        close();
        toast(saved.ok ? '已保存为人工改稿版本' : '保存失败', saved.ok ? '' : 'warn');
      });
    },
  });
}
