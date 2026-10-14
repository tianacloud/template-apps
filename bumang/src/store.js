import { sql, verifiedWrite } from "./db.js";

const COLUMNS =
  "id, title, note, important, urgent, day, start_minute, duration_minutes, done, done_at, created_at, updated_at";
const FIELDS = ["title", "note", "important", "urgent", "day", "start", "duration", "done", "doneAt"];

function scope() {
  const id = globalThis.window?.tiana?.appId;
  if (typeof id !== "string" || !id) throw new Error("Tiana 账号连接未就绪，请重新登录后加载。");
  return id;
}
const int = (value) => (value === null || value === undefined ? null : Number(value));
function decode(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    note: row.note,
    important: row.important === "1",
    urgent: row.urgent === "1",
    day: row.day,
    start: int(row.start_minute),
    duration: int(row.duration_minutes),
    done: row.done === "1",
    doneAt: row.done_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
function values(task) {
  return [
    task.title,
    task.note,
    task.important ? 1 : 0,
    task.urgent ? 1 : 0,
    task.day,
    task.start,
    task.duration,
    task.done ? 1 : 0,
    task.doneAt,
    task.updatedAt,
  ];
}
export const same = (actual, expected) =>
  !!actual && FIELDS.every((field) => actual[field] === expected[field]);

export async function get(id) {
  const { rows } = await sql(`SELECT ${COLUMNS} FROM bumang_tasks WHERE app_id = ? AND id = ?`, [scope(), id]);
  return decode(rows[0]);
}
// Open tasks feed every view; finished ones load when recent or in the visible week.
export async function listCurrent(doneSince) {
  const { rows } = await sql(
    `SELECT ${COLUMNS} FROM bumang_tasks WHERE app_id = ? AND (done = 0 OR done_at >= ?) ORDER BY created_at, id LIMIT 5000`,
    [scope(), doneSince],
  );
  return rows.map(decode);
}
export async function listDone(from, to) {
  const { rows } = await sql(
    `SELECT ${COLUMNS} FROM bumang_tasks WHERE app_id = ? AND done = 1 AND day >= ? AND day < ? ORDER BY day, start_minute, id LIMIT 2000`,
    [scope(), from, to],
  );
  return rows.map(decode);
}
export async function insert(task) {
  await verifiedWrite(
    () =>
      sql(
        `INSERT INTO bumang_tasks (app_id, id, title, note, important, urgent, day, start_minute, duration_minutes, done, done_at, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [scope(), task.id, ...values(task), task.createdAt],
      ),
    () => get(task.id),
    (actual) => same(actual, task),
  );
}
export async function update(task) {
  await verifiedWrite(
    async () => {
      const result = await sql(
        `UPDATE bumang_tasks SET title = ?, note = ?, important = ?, urgent = ?, day = ?, start_minute = ?, duration_minutes = ?, done = ?, done_at = ?, updated_at = ? WHERE app_id = ? AND id = ?`,
        [...values(task), scope(), task.id],
      );
      if (!result.affectedRows) throw new Error("这件事已被删除，请重新加载。");
    },
    () => get(task.id),
    (actual) => same(actual, task),
  );
}
export async function remove(id) {
  await verifiedWrite(
    () => sql("DELETE FROM bumang_tasks WHERE app_id = ? AND id = ?", [scope(), id]),
    () => get(id),
    (actual) => !actual,
  );
}
