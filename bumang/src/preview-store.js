// In-memory stand-in for store.js, used only by the showcase preview build.
// Same exports and record shape; nothing leaves the page.
import { today, addDays, nowMinute } from "./dates.js";

let rows = new Map();

export const same = (actual, expected) => !!actual && actual.updatedAt === expected.updatedAt;

// Sample day built around the current time so the timeline opens on content.
export function reset() {
  const day = today();
  const base = Math.max(0, Math.min(1440 - 240, Math.floor((nowMinute() - 60) / 30) * 30));
  const time = new Date().toISOString();
  const task = (id, title, important, urgent, extra = {}) => ({
    id, title, note: "", important, urgent, day: null, start: null, duration: 60,
    done: false, doneAt: null, createdAt: time, updatedAt: time, ...extra,
  });
  rows = new Map(
    [
      task("report", "交季度报告", true, true, { day, start: base, duration: 90 }),
      task("standup", "项目周会", true, true, { day, start: base + 120, duration: 30 }),
      task("reply", "回复客户邮件", true, true, { day }),
      task("plan", "整理本周计划", true, false),
      task("run", "跑步 5 公里", true, false, { day, start: Math.min(base + 180, 1440 - 60) }),
      task("read", "读完《深度工作》第三章", true, false, { day: addDays(day, 1) }),
      task("dentist", "预约牙医", false, true, { day }),
      task("parcel", "取快递", false, true),
      task("news", "刷新闻", false, false),
      task("closet", "整理衣柜", false, false, { day: addDays(day, 2) }),
    ].map((t) => [t.id, t]),
  );
}
reset();

const copy = (task) => (task ? { ...task } : null);
export async function get(id) {
  return copy(rows.get(id));
}
export async function listCurrent(doneSince) {
  return [...rows.values()].filter((t) => !t.done || (t.doneAt && t.doneAt >= doneSince)).map(copy);
}
export async function listDone(from, to) {
  return [...rows.values()].filter((t) => t.done && t.day && t.day >= from && t.day < to).map(copy);
}
export async function insert(task) {
  rows.set(task.id, copy(task));
}
export async function update(task) {
  if (!rows.has(task.id)) throw new Error("这件事已被删除，请重新加载。");
  rows.set(task.id, copy(task));
}
export async function remove(id) {
  rows.delete(id);
}
