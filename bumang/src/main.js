import "./style.css";
import "./load-style.js";
import { $, $$, icon } from "./ui.js";
import { addDays, isDay, today } from "./dates.js";
import { QUADRANTS } from "./layout.js";
import { state, onRender, render, load, ensureWeek, endDrag, toggleDone } from "./app.js";
import { renderMatrix, cardDrag, view as matrixState } from "./matrix.js";
import { renderTimeline, scheduleDrag, resizeDrag, slotAt, paintNow } from "./timeline.js";
import { openEditor, editTask } from "./editor.js";
import { enableDrag } from "./drag.js";

document.title = "不忙";
document.getElementById("app").innerHTML = `<div class="shell">
  <header class="topbar">
    <div class="brand"><span class="logo" aria-hidden="true">不</span><span>不忙<small>重要的事，从容地做</small></span></div>
    <nav class="tabs" aria-label="视图">
      <a href="#/matrix" data-tab="matrix">${icon.matrix}<span>四象限</span></a>
      <a href="#/timeline" data-tab="timeline">${icon.timeline}<span>时间轴</span></a>
    </nav>
    <button type="button" class="primary new-button" data-action="new">${icon.plus}<span>新建</span></button>
  </header>
  <div class="status" role="status" hidden><span></span><button type="button" data-action="reload">重新加载</button></div>
  <main id="view"></main>
  <button type="button" class="fab" data-action="new" aria-label="新建事项">${icon.plus}</button>
  <dialog id="editor" aria-label="事项"></dialog>
  <div id="toast" role="status" aria-live="polite"></div>
</div>`;

const viewRoot = $("#view");
function readRoute() {
  const [, route, day] = /^#\/(matrix|timeline)(?:\/([\d-]+))?/.exec(location.hash) ?? [];
  state.route = route ?? "matrix";
  if (state.route === "timeline") state.day = isDay(day) ? day : state.day;
}
function goDay(day) {
  state.day = day;
  history.replaceState(null, "", `#/timeline/${day}`);
  render();
  ensureWeek(day);
}
onRender(() => {
  const status = $(".status");
  status.hidden = !state.loading && !state.error;
  $("span", status).textContent = state.loading ? "正在读取你的安排…" : state.error;
  $("[data-action=reload]", status).hidden = state.loading;
  viewRoot.inert = state.loading;
  viewRoot.dataset.route = state.route;
  for (const tab of $$("[data-tab]")) {
    const on = tab.dataset.tab === state.route;
    on ? tab.setAttribute("aria-current", "page") : tab.removeAttribute("aria-current");
    if (tab.dataset.tab === "timeline") tab.href = `#/timeline/${state.day}`;
  }
  if (state.route === "timeline") {
    if (!$(".timeline", viewRoot)) viewRoot.replaceChildren();
    renderTimeline(viewRoot);
  } else {
    const lists = $$(".cards", viewRoot).map((list) => list.scrollTop);
    renderMatrix(viewRoot);
    $$(".cards", viewRoot).forEach((list, i) => (list.scrollTop = lists[i] ?? 0));
  }
});

window.addEventListener("hashchange", () => {
  readRoute();
  render();
  if (state.route === "timeline") ensureWeek(state.day);
});

document.addEventListener("click", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el) {
    const grid = event.target.closest(".grid");
    if (grid && !event.target.closest(".block")) openEditor({ day: state.day, start: slotAt(event.clientY) });
    return;
  }
  const { action, id } = el.dataset;
  if (action === "edit") editTask(id);
  else if (action === "toggle") toggleDone(id);
  else if (action === "new") {
    const q = QUADRANTS.find((item) => item.key === el.dataset.quadrant);
    const preset = q ? { important: q.important, urgent: q.urgent } : {};
    if (state.route === "timeline") preset.day = state.day;
    openEditor(preset);
  } else if (action === "day") goDay(el.dataset.day);
  else if (action === "week") goDay(addDays(state.day, Number(el.dataset.step)));
  else if (action === "today") goDay(today());
  else if (action === "reload") load();
});
document.addEventListener("change", (event) => {
  if (event.target.matches("[data-action=show-done]")) {
    matrixState.showDone = event.target.checked;
    render();
  }
});
$("#editor").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});

enableDrag(viewRoot, (press) => {
  const session = press.kind === "card" ? cardDrag(press) : press.kind === "resize" ? resizeDrag(press) : scheduleDrag(press);
  if (!session) return null;
  state.dragging = true;
  document.body.classList.add("dragging");
  const done = () => {
    document.body.classList.remove("dragging");
    endDrag();
  };
  return {
    move: session.move,
    drop(x, y) {
      session.drop(x, y);
      done();
    },
    cancel() {
      session.cancel();
      done();
    },
  };
});

setInterval(() => state.route === "timeline" && paintNow(), 60_000);
readRoute();
render();
load();
