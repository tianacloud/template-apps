import * as store from "./store.js";
import { newId } from "./id.js";
import { today, weekStart, addDays } from "./dates.js";
import { quadrantOf, QUADRANTS } from "./layout.js";
import { toast } from "./ui.js";

export const state = {
  tasks: new Map(),
  route: "matrix",
  day: today(),
  loading: true,
  error: "",
  dragging: false,
};
const loadedWeeks = new Set();
const queues = new Map();
let renderer = () => {};
let pending = false;

export function onRender(fn) {
  renderer = fn;
}
// Re-rendering under a live drag would drop the element the pointer holds.
export function render() {
  if (state.dragging) pending = true;
  else renderer();
}
export function endDrag() {
  state.dragging = false;
  if (pending) {
    pending = false;
    renderer();
  }
}

let loadSequence = 0;
export async function load() {
  const sequence = ++loadSequence;
  state.loading = true;
  state.error = "";
  render();
  try {
    const since = new Date(Date.now() - 7 * 86400000).toISOString();
    const current = await store.listCurrent(since);
    if (sequence !== loadSequence) return;
    state.tasks = new Map(current.map((task) => [task.id, task]));
    loadedWeeks.clear();
    state.loading = false;
    render();
    await ensureWeek(state.day);
  } catch (error) {
    if (sequence !== loadSequence) return;
    state.loading = false;
    state.error = error.message || "读取失败，请检查连接后重新加载。";
    render();
  }
}
// Finished tasks for the shown week, so the timeline keeps what was done.
export async function ensureWeek(day) {
  const from = weekStart(day);
  if (loadedWeeks.has(from)) return;
  loadedWeeks.add(from);
  const sequence = loadSequence;
  try {
    const done = await store.listDone(from, addDays(from, 7));
    if (sequence !== loadSequence) return;
    for (const task of done) if (!state.tasks.has(task.id)) state.tasks.set(task.id, task);
    render();
  } catch {
    loadedWeeks.delete(from);
  }
}

function enqueue(id, job) {
  const next = (queues.get(id) ?? Promise.resolve()).then(job);
  queues.set(id, next.catch(() => {}));
  return next;
}
async function recover(id, error) {
  try {
    const actual = await store.get(id);
    if (actual) state.tasks.set(id, actual);
    else state.tasks.delete(id);
    toast(error.message || "没有保存成功，已恢复为数据库中的内容。");
  } catch {
    state.error = "保存结果暂时无法确认，请恢复连接后重新加载。";
  }
  render();
}
function stamp(task, patch) {
  const next = { ...task, ...patch, updatedAt: new Date().toISOString() };
  if ("done" in patch && patch.done !== task.done) next.doneAt = patch.done ? next.updatedAt : null;
  if (next.start === null || next.start === undefined) next.start = null;
  if (!next.day) {
    next.day = null;
    next.start = null;
  }
  return next;
}

// Optimistic change for drags and checkboxes; the database row wins on failure.
export function change(id, patch) {
  const task = state.tasks.get(id);
  if (!task) return Promise.resolve();
  const next = stamp(task, patch);
  state.tasks.set(id, next);
  render();
  return enqueue(id, async () => {
    try {
      await store.update(next);
    } catch (error) {
      await recover(id, error);
    }
  });
}
export function toggleDone(id) {
  const task = state.tasks.get(id);
  if (!task) return;
  const done = !task.done;
  change(id, { done });
  if (done) toast(`已完成「${task.title}」`, { label: "撤销", run: () => change(id, { done: false }) });
}
// Editor saves wait for the database so the form can show the real outcome.
export async function save(id, fields) {
  const existing = id && state.tasks.get(id);
  if (existing) {
    const next = stamp(existing, fields);
    await enqueue(id, () => store.update(next));
    state.tasks.set(id, next);
  } else {
    const time = new Date().toISOString();
    const task = stamp({ id: newId(), done: false, doneAt: null, createdAt: time }, fields);
    await store.insert(task);
    state.tasks.set(task.id, task);
  }
  render();
}
export async function remove(id) {
  await enqueue(id, () => store.remove(id));
  state.tasks.delete(id);
  render();
}

const rank = (task) => QUADRANTS.indexOf(quadrantOf(task));
export const openTasks = () => [...state.tasks.values()].filter((task) => !task.done);
export function byQuadrant() {
  const groups = Object.fromEntries(QUADRANTS.map((q) => [q.key, []]));
  for (const task of openTasks()) groups[quadrantOf(task).key].push(task);
  const key = (task) => `${task.day ?? "9999-99-99"} ${String(task.start ?? 9999).padStart(4, "0")} ${task.createdAt}`;
  for (const list of Object.values(groups)) list.sort((a, b) => (key(a) < key(b) ? -1 : 1));
  return groups;
}
// Unscheduled tasks for a day: undated ones, that day's, and on today also overdue ones.
export function trayFor(day) {
  const now = today();
  return openTasks()
    .filter((task) => task.start === null && (!task.day || task.day === day || (day === now && task.day < now)))
    .sort((a, b) => rank(a) - rank(b) || (a.createdAt < b.createdAt ? -1 : 1));
}
export const scheduledOn = (day) =>
  [...state.tasks.values()].filter((task) => task.day === day && task.start !== null);
export const openOn = (day) => openTasks().filter((task) => task.day === day);
