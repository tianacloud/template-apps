import { isEnclosingIds, parseIds, leavesOf, expectedFormation } from './hanzi.js';

const DRAG_THRESHOLD = 10;
const SCALE_OUTER = 1.55;
const SCALE_INNER = 0.6;

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
const centerOf = (part) => ({ cx: part.x + part.w / 2, cy: part.y + part.h / 2 });

export function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// 由已放部件的中心点推排布方向与顺序：横向跨度不小于纵向跨度即为左右排布。
export function orderOf(placed) {
  if (!placed.length) return { order: [], formation: null };
  const centers = placed.map((part) => ({ part, ...centerOf(part) }));
  if (centers.length === 1) return { order: [centers[0].part.uid], formation: null };
  const xs = centers.map((c) => c.cx);
  const ys = centers.map((c) => c.cy);
  const spanX = Math.max(...xs) - Math.min(...xs);
  const spanY = Math.max(...ys) - Math.min(...ys);
  const formation = spanY > spanX ? 'tb' : 'lr';
  const order = [...centers]
    .sort((a, b) => (formation === 'tb' ? a.cy - b.cy || a.cx - b.cx : a.cx - b.cx || a.cy - b.cy))
    .map((c) => c.part.uid);
  return { order, formation };
}

const sameMultiset = (a, b) => a.length === b.length && [...a].sort().join('') === [...b].sort().join('');

function insideRect(inner, outer) {
  const { cx, cy } = centerOf(inner);
  return cx >= outer.x - 6 && cx <= outer.x + outer.w + 6 && cy >= outer.y - 6 && cy <= outer.y + outer.h + 6;
}

// 判分：多重集一致 + 顺序与 IDS 一致 + 结构标签与排布方向一致；包围结构改为判断内部部件落在外框内。
export function judgePlacement(placed, plan) {
  if (!placed.length || placed.length !== plan.parts.length) return false;
  const chars = placed.map((part) => part.char);
  if (!sameMultiset(chars, plan.parts)) return false;

  const { formation } = orderOf(placed);
  const tree = plan.ids ? parseIds(plan.ids) : null;
  const enclosing = isEnclosingIds(plan.ids);

  if (enclosing && tree && tree.kids.length === 2 && 'leaf' in tree.kids[0]) {
    const outer = tree.kids[0].leaf;
    const outerPart = placed.find((part) => part.char === outer);
    const inners = leavesOf(tree.kids[1]);
    if (outerPart && inners.length) {
      return inners.every((ch) => {
        const innerPart = placed.find((part) => part.char === ch);
        return Boolean(innerPart) && insideRect(innerPart, outerPart);
      });
    }
  }

  const canonical = tree ? leavesOf(tree) : plan.parts;
  const { order } = orderOf(placed);
  const byUid = new Map(placed.map((part) => [part.uid, part]));
  const orderedChars = order.map((uid) => byUid.get(uid).char);
  if (!sameMultiset(orderedChars, canonical)) return false;
  const orderOk = orderedChars.every((ch, index) => ch === canonical[index]);

  const expected = expectedFormation(plan.structure);
  const formationOk = !expected || !formation || formation === expected;
  return orderOk && formationOk;
}

// 拼字板：托盘 → 拖入虚线框 → 自由摆放；包围结构的内件落在已放外框上时自动嵌入。
export function createBoard({ area, tray, plan, placed, onChange }) {
  let parts = placed ? placed.map((part) => ({ ...part })) : [];
  let drag = null;
  let ghost = null;

  const trayItems = plan.parts.map((char, index) => ({ uid: `p${index}`, char }));
  const trayOrder = shuffle(trayItems);

  const areaSize = () => ({ w: area.clientWidth, h: area.clientHeight });
  const partSize = () => {
    const probe = tray.querySelector('.part');
    const rect = probe?.getBoundingClientRect();
    return { w: Math.round(rect?.width || 78), h: Math.round(rect?.height || 88) };
  };

  function render() {
    const used = new Set(parts.map((part) => part.char));
    tray.innerHTML = trayOrder.map((item) => `
      <div class="part${used.has(item.char) ? ' used' : ''}" data-tray-uid="${item.uid}" data-char="${item.char}">
        <span>${item.char}</span>
      </div>`).join('');

    const nested = new Set(parts.filter((part) => part.inside).map((part) => part.inside));
    area.innerHTML = (parts.length ? '' : `
      <div class="assembly-hint">
        把部件拖进来
        <div class="assembly-hint-sub">自己摆成这个字的样子</div>
      </div>`) + parts.map((part) => {
      const frame = nested.has(part.uid) && !part.inside;
      const cls = `part part-in-area${frame ? ' part-frame' : ''}${part.inside ? ' part-inner' : ''}`;
      return `<div class="${cls}" data-placed-uid="${part.uid}" data-char="${part.char}"
        style="left:${part.x}px;top:${part.y}px;width:${part.w}px;height:${part.h}px;font-size:${Math.round(part.w * 0.46)}px;z-index:${part.inside ? 3 : frame ? 1 : 2}">
        <span>${part.char}</span></div>`;
    }).join('');
    onChange?.(parts);
  }

  function dropAt(uid, char, clientX, clientY) {
    const rect = area.getBoundingClientRect();
    const size = partSize();
    const { w: areaW, h: areaH } = areaSize();
    let x = clamp(clientX - rect.left - size.w / 2, 4, Math.max(4, areaW - size.w - 4));
    let y = clamp(clientY - rect.top - size.h / 2, 4, Math.max(4, areaH - size.h - 4));
    const existing = parts.find((part) => part.uid === uid);
    const rest = parts.filter((part) => part.uid !== uid);
    let w = existing?.w ?? size.w;
    let h = existing?.h ?? size.h;
    let inside = null;

    // 包围结构：内件落在已放外框上 → 嵌入并缩小
    const tree = plan.ids ? parseIds(plan.ids) : null;
    if (tree && isEnclosingIds(plan.ids) && tree.kids.length === 2 && 'leaf' in tree.kids[0]) {
      const outerChar = tree.kids[0].leaf;
      const innerChars = leavesOf(tree.kids[1]);
      const outer = rest.find((part) => part.char === outerChar && !part.inside);
      const isInner = innerChars.includes(char) && char !== outerChar;
      const hit = outer && clientX >= rect.left + outer.x && clientX <= rect.left + outer.x + outer.w
        && clientY >= rect.top + outer.y && clientY <= rect.top + outer.y + outer.h;
      if (isInner && outer && hit) {
        if (!outer.scaled) {
          const big = Math.min(outer.w * SCALE_OUTER, areaW - 8);
          outer.w = big;
          outer.h = Math.min(outer.h * SCALE_OUTER, areaH - 8);
          outer.x = clamp(outer.x + (size.w * SCALE_OUTER) / 2 - big / 2, 4, Math.max(4, areaW - outer.w - 4));
          outer.y = clamp(outer.y, 4, Math.max(4, areaH - outer.h - 4));
          outer.scaled = true;
        }
        w = outer.w * SCALE_INNER;
        h = outer.h * SCALE_INNER;
        x = outer.x + (outer.w - w) / 2;
        y = outer.y + (outer.h - h) / 2;
        inside = outer.uid;
      }
    }

    const next = [...rest, { uid, char, x, y, w, h, ...(inside ? { inside } : {}) }];
    parts = next;
    render();
  }

  function remove(uid) {
    parts = parts.filter((part) => part.uid !== uid);
    render();
  }

  function onPointerDown(event) {
    const trayTile = event.target.closest('[data-tray-uid]');
    const placedTile = event.target.closest('[data-placed-uid]');
    if (!trayTile && !placedTile) return;
    if (event.button !== undefined && event.button !== 0 && event.pointerType === 'mouse') return;
    const uid = trayTile ? trayTile.dataset.trayUid : placedTile.dataset.placedUid;
    const char = trayTile ? trayTile.dataset.char : placedTile.dataset.char;
    const source = trayTile || placedTile;
    const rect = source.getBoundingClientRect();
    drag = {
      pointerId: event.pointerId,
      uid,
      char,
      fromPlaced: Boolean(placedTile),
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      moved: false,
    };
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!drag.moved) {
      drag.moved = true;
      const size = partSize();
      ghost = document.createElement('div');
      ghost.className = 'part ghost-part';
      ghost.style.position = 'fixed';
      ghost.style.width = `${size.w}px`;
      ghost.style.height = `${size.h}px`;
      ghost.style.fontSize = `${Math.round(size.w * 0.46)}px`;
      ghost.style.pointerEvents = 'none';
      ghost.style.zIndex = '9999';
      ghost.textContent = drag.char;
      document.body.append(ghost);
    }
    ghost.style.left = `${event.clientX - drag.offsetX}px`;
    ghost.style.top = `${event.clientY - drag.offsetY}px`;
    event.preventDefault();
  }

  function onPointerUp(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const current = drag;
    drag = null;
    ghost?.remove();
    ghost = null;
    if (!current.moved) {
      if (current.fromPlaced) remove(current.uid);
      return;
    }
    const rect = area.getBoundingClientRect();
    const overArea = event.clientX >= rect.left && event.clientX <= rect.right
      && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!overArea) return;
    dropAt(current.uid, current.char, event.clientX, event.clientY);
  }

  area.addEventListener('pointerdown', onPointerDown);
  tray.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  render();

  return {
    getPlaced: () => parts.map((part) => ({ ...part })),
    reset() { parts = []; render(); },
    destroy() {
      area.removeEventListener('pointerdown', onPointerDown);
      tray.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      ghost?.remove();
    },
  };
}
