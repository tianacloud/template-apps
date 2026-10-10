import { sql, verifiedWrite } from "./db.js";
function applicationScope() {
 const id = globalThis.window?.tiana?.appId;
 if (typeof id !== "string" || !id) throw new Error("Tiana 账号连接未就绪");
 return id;
}
function normalize(row) {
  return row
    ? { ...row, cents: Number(row.cents), amount: Number(row.cents) / 100 }
    : null;
}
function encode(record) {
  return { ...record, cents: Math.round(record.amount * 100) };
}
export async function get(id) {
  return normalize(
    (
      await sql(
        "SELECT id, title, cents, type, category, date, note FROM ledger_entries WHERE app_id = ? AND id = ?",
        [applicationScope(), id],
      )
    ).rows[0],
  );
}
export function same(actual, expected) {
  if (!actual) return false;
  const left = encode(actual),
    right = encode(expected);
  return ["title", "cents", "type", "category", "date", "note"].every(
    (field) => left[field] === right[field],
  );
}
export async function save(record, isNew = false) {
  const row = encode(record);
  const values = ["title", "cents", "type", "category", "date", "note"].map(
    (field) => row[field],
  );
  const statement = isNew
    ? "INSERT INTO ledger_entries (app_id, id, title, cents, type, category, date, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    : "UPDATE ledger_entries SET title = ?, cents = ?, type = ?, category = ?, date = ?, note = ? WHERE app_id = ? AND id = ?";
  await verifiedWrite(
    async () => {
      const result = await sql(
        statement,
        isNew ? [applicationScope(), row.id, ...values] : [...values, applicationScope(), row.id],
      );
      if (!result.affectedRows)
        throw new Error("这条记录已不存在，请重新加载。");
    },
    () => get(row.id),
    (actual) => same(actual, record),
  );
}
export async function remove(id) {
  await verifiedWrite(
    () =>
      sql("DELETE FROM ledger_entries WHERE app_id = ? AND id = ?", [
        applicationScope(),
        id,
      ]),
    () => get(id),
    (actual) => !actual,
  );
}
export async function list(from, to) {
  return (
    await sql(
      "SELECT id, title, cents, type, category, date, note FROM ledger_entries WHERE app_id = ? AND date >= ? AND date < ? ORDER BY date, id",
      [applicationScope(), from, to],
    )
  ).rows.map(normalize);
}
