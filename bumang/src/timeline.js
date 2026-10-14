import { $, $$, esc, icon, toast } from "./ui.js";
import { quadrantOf, columns, snap, clampStart } from "./layout.js";
import { addDays, clock, dayLabel, dayNumber, monthLabel, nowMinute, today, weekStart, weekday } from "./dates.js";
import { state, change, trayFor, scheduledOn, openOn } from "./app.js";
import { ghost } from "./ghost.js";

// One pixel per minute keeps drag maths exact; the grid is 1440px tall.
const EDGE = 56;

function skeleton(root) {
  const hours = Array.from({ length: 24 }, (_, h) => `<div class="hour" style="top:${h * 60}px"><span>${h ? clock(h * 60) : ""}</span></div>`).join("");
  root.innerHTML = `<div class="timeline">
    <div class="week">
      <div class="week-head">
        <button type="button" class="icon-button" data-action="week" data-step="-7" aria-label="上一周">${icon.left}</button>
        <b class="month"></b>
        <button type="button" class="pill-button" data-action="today">今天</button>
        <button type="button" class="icon-button" data-action="week" data-step="7" aria-label="下一周">${icon.right}</button>
      </div>
      <div class="days" role="tablist" aria-label="选择日期"></div>
    </div>
    <section class="tray" data-drop="tray" aria-label="待安排">
      <div class="tray-head"><b>待安排</b><span class="tray-count"></span><small class="tray-hint">长按或拖动事项到时间轴</small></div>
      <div class="tray-list"></div>
    </section>
    <div class="scroller" tabindex="-1">
      <div class="grid" style="height:1440px" aria-label="24 小时时间轴">${hours}<div class="blocks"></div><div class="now-line" hidden></div><div class="preview" hidden></div></div>
    </div>
  </div>`;
  const tray = $(".tray-list", root);
  tray.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX) && tray.scrollWidth > tray.clientWidth) {
      tray.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  }, { passive: false });
}

function days() {
  const from = weekStart(state.day);
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(from, i);
    const marks = openOn(day).slice(0, 3).map((task) => `<i class="${quadrantOf(task).key}"></i>`).join("");
    const selected = day === state.day;
    return `<button type="button" role="tab" aria-selected="${selected}" class="day${selected ? " selected" : ""}${day === today() ? " is-today" : ""}" data-action="day" data-day="${day}" data-drop="day">
      <small>${day === today() ? "今天" : weekday(day)}</small><b>${dayNumber(day)}</b><span class="marks">${marks}</span></button>`;
  }).join("");
}
function chip(task) {
  const q = quadrantOf(task);
  const late = task.day && task.day < today() ? `<small class="late">${dayLabel(task.day)}</small>` : "";
  return `<button type="button" class="chip ${q.key}" data-drag="chip" data-action="edit" data-id="${task.id}" title="${esc(q.name)}：${esc(task.title)}"><span>${esc(task.title)}</span>${late}</button>`;
}
function block(task, place) {
  const q = quadrantOf(task);
  const width = 100 / place.lanes;
  const compact = task.duration < 45 ? " compact" : "";
  return `<div class="block ${q.key}${task.done ? " is-done" : ""}${compact}" data-drag="block" data-id="${task.id}" style="top:${task.start}px;height:${task.duration}px;left:${place.lane * width}%;width:${width}%">
    <button type="button" class="check" data-action="toggle" data-id="${task.id}" aria-label="${task.done ? "标为未完成" : "标记完成"}">${icon.check}</button>
    <button type="button" class="block-body" data-action="edit" data-id="${task.id}"><b>${esc(task.title)}</b><small>${clock(task.start)} – ${clock(task.start + task.duration)}</small></button>
    <span class="grip" data-drag="resize" data-id="${task.id}" aria-hidden="true"></span>
  </div>`;
}

export function renderTimeline(root) {
  const fresh = !$(".timeline", root);
  if (fresh) skeleton(root);
  $(".month", root).textContent = monthLabel(state.day);
  $(".days", root).innerHTML = days();
  const tray = trayFor(state.day);
  $(".tray-count", root).textContent = tray.length ? String(tray.length) : "";
  $(".tray-list", root).innerHTML =
    tray.map(chip).join("") || `<p class="tray-empty">${state.day === today() ? "今天的事都排好了。" : `${dayLabel(state.day)}没有待安排的事项。`}</p>`;
  const blocks = scheduledOn(state.day);
  const places = columns(blocks);
  $(".blocks", root).innerHTML = blocks.map((task) => block(task, places.get(task.id))).join("");
  paintNow(root);
  if (fresh || root.dataset.day !== state.day) scrollToWork(root, blocks);
  root.dataset.day = state.day;
}
export function paintNow(root = document) {
  const line = $(".now-line", root);
  if (!line) return;
  line.hidden = state.day !== today();
  line.style.top = `${nowMinute()}px`;
}
function scrollToWork(root, blocks) {
  const scroller = $(".scroller", root);
  const first = Math.min(...blocks.filter((task) => !task.done).map((task) => task.start), Infinity);
  const target = state.day === today() ? nowMinute() - 90 : Number.isFinite(first) ? first - 30 : 8 * 60;
  scroller.scrollTop = Math.max(0, target);
  $(".day.selected", root)?.scrollIntoView({ block: "nearest", inline: "nearest" });
}
// Empty grid tap: start a new task at that half hour.
export function slotAt(clientY) {
  const grid = $(".grid").getBoundingClientRect();
  return clampStart(Math.floor((clientY - grid.top) / 30) * 30, 60);
}

function dropTarget(x, y, grab, length) {
  const scroller = $(".scroller")?.getBoundingClientRect();
  if (scroller && x >= scroller.left && x <= scroller.right && y >= scroller.top && y <= scroller.bottom) {
    const grid = $(".grid").getBoundingClientRect();
    return { type: "timeline", start: clampStart(snap(y - grid.top - grab), length) };
  }
  const hit = document.elementFromPoint(x, y)?.closest("[data-drop]");
  if (hit?.dataset.drop === "tray") return { type: "tray", el: hit };
  if (hit?.dataset.drop === "day") return { type: "day", day: hit.dataset.day, el: hit };
  return null;
}
// Scroll only once the pointer has been well inside the grid, so carrying a chip
// down from the tray across the top edge does not shift the timeline.
function autoScroll(x, y, drag) {
  const scroller = $(".scroller");
  if (!scroller) return false;
  const rect = scroller.getBoundingClientRect();
  if (x < rect.left || x > rect.right || y < rect.top - 8 || y > rect.bottom + 40) return false;
  if (y > rect.top + EDGE && y < rect.bottom - EDGE) drag.armed = true;
  if (!drag.armed) return false;
  const speed = y < rect.top + EDGE ? -(rect.top + EDGE - y) : y > rect.bottom - EDGE ? y - (rect.bottom - EDGE) : 0;
  if (!speed) return false;
  const before = scroller.scrollTop;
  scroller.scrollTop += Math.max(-18, Math.min(18, speed / 3));
  return scroller.scrollTop !== before;
}

// Chips and blocks: move onto the grid, back into the tray, or onto another day.
export function scheduleDrag(press) {
  const task = state.tasks.get(press.id);
  if (!task) return null;
  const isBlock = press.kind === "block";
  const length = task.duration;
  const rect = press.el.getBoundingClientRect();
  const grab = isBlock ? Math.max(0, Math.min(press.y - rect.top, length - 8)) : 12;
  const floating = ghost(press.el, press.x, press.y);
  const preview = $(".preview");
  if (isBlock) press.el.classList.add("moving");
  else $(".tray").classList.add("drop-source");
  let pointer = { x: press.x, y: press.y };
  let target = null;
  let frame = 0;
  const scrolling = { armed: false };
  const paint = () => {
    target = dropTarget(pointer.x, pointer.y, grab, length);
    $$(".drop-over").forEach((el) => el.classList.remove("drop-over"));
    floating.move(pointer.x, pointer.y);
    if (target?.type === "timeline") {
      floating.hide(true);
      preview.hidden = false;
      preview.className = `preview ${quadrantOf(task).key}`;
      preview.style.top = `${target.start}px`;
      preview.style.height = `${length}px`;
      preview.textContent = `${clock(target.start)} – ${clock(target.start + length)}`;
    } else {
      floating.hide(false);
      preview.hidden = true;
      if (target && !(target.type === "tray" && !isBlock)) target.el.classList.add("drop-over");
    }
  };
  const tick = () => {
    if (autoScroll(pointer.x, pointer.y, scrolling)) paint();
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  paint();
  const finish = () => {
    cancelAnimationFrame(frame);
    floating.remove();
    preview.hidden = true;
    press.el.classList.remove("moving");
    $(".tray")?.classList.remove("drop-source");
    $$(".drop-over").forEach((el) => el.classList.remove("drop-over"));
  };
  return {
    move(x, y) {
      pointer = { x, y };
      paint();
    },
    drop(x, y) {
      pointer = { x, y };
      paint();
      finish();
      const before = { day: task.day, start: task.start };
      const undo = { label: "撤销", run: () => change(task.id, before) };
      if (target?.type === "timeline") {
        if (task.day === state.day && task.start === target.start) return;
        change(task.id, { day: state.day, start: target.start });
      } else if (target?.type === "tray" && isBlock) {
        change(task.id, { start: null });
        toast("已放回待安排", undo);
      } else if (target?.type === "day" && target.day !== task.day) {
        change(task.id, { day: target.day });
        toast(`已移到${dayLabel(target.day)}`, undo);
      }
    },
    cancel: finish,
  };
}

// Pull the bottom edge of a block to change its length.
export function resizeDrag(press) {
  const task = state.tasks.get(press.id);
  const el = press.el.closest(".block");
  if (!task || !el || task.start === null) return null;
  const label = $(".block-body small", el);
  let length = task.duration;
  // Keep the gap between the finger and the bottom edge so the block does not jump.
  const offset = task.start + task.duration - (press.y - $(".grid").getBoundingClientRect().top);
  el.classList.add("resizing");
  const finish = () => el.classList.remove("resizing");
  const move = (x, y) => {
    const grid = $(".grid").getBoundingClientRect();
    length = Math.max(15, Math.min(1440 - task.start, snap(y - grid.top + offset) - task.start));
    el.style.height = `${length}px`;
    label.textContent = `${clock(task.start)} – ${clock(task.start + length)}`;
  };
  return {
    move,
    drop(x, y) {
      move(x, y);
      finish();
      if (length !== task.duration) change(task.id, { duration: length });
    },
    cancel() {
      finish();
      el.style.height = `${task.duration}px`;
    },
  };
}
