import { $$, esc, icon, toast } from "./ui.js";
import { QUADRANTS, quadrantOf } from "./layout.js";
import { clock, dayLabel, today } from "./dates.js";
import { state, byQuadrant, change } from "./app.js";
import { ghost } from "./ghost.js";

const EMPTY = {
  q1: "现在没有火烧眉毛的事。",
  q2: "重要但不急的事，提前排进日子里。",
  q3: "别人催的小事，顺手做掉或交出去。",
  q4: "可做可不做的事，先放在这里。",
};
export const view = { showDone: false };

function meta(task) {
  if (task.done) return "已完成";
  if (!task.day) return "待安排";
  return task.start === null ? dayLabel(task.day) : `${dayLabel(task.day)} ${clock(task.start)}`;
}
function card(task) {
  const overdue = !task.done && task.day && task.day < today();
  return `<li class="card${task.done ? " is-done" : ""}${overdue ? " overdue" : ""}" data-drag="card" data-id="${task.id}">
    <button type="button" class="check" data-action="toggle" data-id="${task.id}" aria-label="${task.done ? "标为未完成" : "标记完成"}">${icon.check}</button>
    <button type="button" class="card-body" data-action="edit" data-id="${task.id}">
      <span class="card-title">${esc(task.title)}</span>
      <small class="card-meta${task.day ? "" : " soft"}">${esc(meta(task))}</small>
    </button></li>`;
}
function finished(key) {
  return [...state.tasks.values()]
    .filter((task) => task.done && quadrantOf(task).key === key)
    .sort((a, b) => (a.doneAt < b.doneAt ? 1 : -1))
    .slice(0, 20);
}
function quadrant(q, groups) {
  const open = groups[q.key];
  const rows = view.showDone ? [...open, ...finished(q.key)] : open;
  return `<section class="quad ${q.key}" data-drop="quad" data-quadrant="${q.key}" aria-label="${q.name}（${q.tags}）">
    <header class="quad-head">
      <h2>${q.name}<small>${q.tags}</small></h2>
      <span class="quad-count" aria-label="${open.length} 件未完成">${open.length || ""}</span>
      <button type="button" class="icon-button small" data-action="new" data-quadrant="${q.key}" aria-label="在${q.name}里新建">${icon.plus}</button>
    </header>
    <ul class="cards">${rows.map(card).join("") || `<li class="empty">${EMPTY[q.key]}</li>`}</ul>
  </section>`;
}
export function renderMatrix(root) {
  const groups = byQuadrant();
  root.innerHTML = `<div class="matrix">
    <div class="axis top" aria-hidden="true"><span>紧急</span><span>不紧急</span></div>
    <div class="axis side" aria-hidden="true"><span>重要</span><span>不重要</span></div>
    <div class="board">${QUADRANTS.map((q) => quadrant(q, groups)).join("")}</div>
    <label class="done-toggle"><input type="checkbox" data-action="show-done"${view.showDone ? " checked" : ""}>显示已完成</label>
  </div>`;
}

const highlight = (key) => {
  for (const section of $$(".quad")) section.classList.toggle("drop-over", section.dataset.quadrant === key);
};
// Dropping a card on another quadrant re-labels importance and urgency.
export function cardDrag(press) {
  const task = state.tasks.get(press.id);
  if (!task) return null;
  const floating = ghost(press.el, press.x, press.y);
  let key = null;
  const locate = (x, y) => {
    floating.move(x, y);
    key = document.elementFromPoint(x, y)?.closest("[data-drop=quad]")?.dataset.quadrant ?? null;
    highlight(key);
  };
  const finish = () => {
    floating.remove();
    highlight(null);
  };
  return {
    move: locate,
    drop(x, y) {
      locate(x, y);
      finish();
      const q = QUADRANTS.find((item) => item.key === key);
      if (!q || (q.important === task.important && q.urgent === task.urgent)) return;
      change(task.id, { important: q.important, urgent: q.urgent });
      toast(`已移到「${q.name}」`, { label: "撤销", run: () => change(task.id, { important: task.important, urgent: task.urgent }) });
    },
    cancel: finish,
  };
}
