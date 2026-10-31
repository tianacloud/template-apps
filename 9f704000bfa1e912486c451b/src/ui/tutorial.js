// ui/tutorial.js
// 首关新手引导：仅「首次进入」展示（localStorage 标记），分步 coach-mark 卡片。
// 纯 DOM 覆盖层，不依赖 three.js；每步可「下一步 / 跳过」，最后写入完成标记。
// 引导的是玩法，不阻塞 3D 场景；高亮某一步可锚定到工具栏位置。

const TUT_KEY = 'gq_tutorial_done';

const STEPS = [
  {
    title: '欢迎来到 GlassQuest',
    body: '每天擦净一块玻璃，背后会浮现一句治愈金句。坚持 365 天，一天一句，只说给你一个人听。',
  },
  {
    title: '① 选工具',
    body: '下方工具栏：🧽 干擦 / 💧 喷水 / 🪥 刷子 / 🧴 清洁剂卡。不同工具对付不同污渍。',
    anchor: '.toolbar',
  },
  {
    title: '② 擦拭',
    body: '在玻璃上「按住并拖动」来擦拭。污渍擦净后，金句会慢慢显形。',
  },
  {
    title: '③ 油污 & 顽固渍技巧',
    body: '油污先用 💧 喷水打湿，再用 🧽 擦；顽固渍用 🪥 打圈最有效；贴纸先按住剥离再撕。',
  },
  {
    title: '④ 旋转视角',
    body: '点「🔄 旋转」拖动可转动玻璃，从侧面看清金句；点「🖐 擦拭」再回来擦。六个面都能擦。',
  },
  {
    title: '开始吧 ✨',
    body: '擦净全部污渍即通关，可点 📤 分享，把金句分享给朋友。',
  },
];

export function maybeShowTutorial(store) {
  if (store.read(TUT_KEY)) return;
  requestAnimationFrame(() => buildOverlay(store));
}

function buildOverlay(store) {
  if (document.getElementById('tutorialOverlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'tutorialOverlay';
  overlay.className = 'tutorial-overlay';
  document.body.appendChild(overlay);

  const spot = document.createElement('div');
  spot.className = 'tutorial-spot';
  spot.style.display = 'none';
  overlay.appendChild(spot);

  const card = document.createElement('div');
  card.className = 'tutorial-card';
  overlay.appendChild(card);

  let idx = 0;

  function render() {
    const s = STEPS[idx];
    card.innerHTML =
      `<div class="tut-step">${idx + 1} / ${STEPS.length}</div>` +
      `<div class="tut-title">${s.title}</div>` +
      `<div class="tut-body">${s.body}</div>` +
      `<div class="tut-actions">` +
      `<button class="tut-skip" id="tutSkip">跳过</button>` +
      `<button class="tut-next" id="tutNext">${idx === STEPS.length - 1 ? '开始擦拭' : '下一步'}</button>` +
      `</div>`;

    // 高亮锚点（如工具栏）
    spot.style.display = 'none';
    if (s.anchor) {
      const el = document.querySelector(s.anchor);
      if (el) {
        const r = el.getBoundingClientRect();
        spot.style.display = 'block';
        spot.style.left = (r.left - 8) + 'px';
        spot.style.top = (r.top - 8) + 'px';
        spot.style.width = (r.width + 16) + 'px';
        spot.style.height = (r.height + 16) + 'px';
      }
    }

    card.querySelector('#tutNext').onclick = () => {
      if (idx === STEPS.length - 1) finish();
      else { idx++; render(); }
    };
    card.querySelector('#tutSkip').onclick = finish;
  }

  function finish() {
    store.safeWrite(TUT_KEY, true);
    overlay.remove();
  }

  render();
}
