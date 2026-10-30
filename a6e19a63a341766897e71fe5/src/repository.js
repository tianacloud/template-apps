import { sql } from './db.js';

export class ConflictError extends Error {
  constructor() { super('记录已被其他人修改，请重新读取后再保存。'); this.name = 'ConflictError'; }
}
const kinds = new Set(['order', 'customer', 'coach', 'store', 'course', 'settings']);
function validKind(kind) {
  if (!kinds.has(kind)) throw new Error('无效的记录类别');
}
function decode(row) {
  return { ...JSON.parse(row.payload), id: row.id, revision: Number(row.revision) };
}
export async function list(kind) {
  validKind(kind);
  const result = await sql('SELECT id, payload, revision FROM gym_records WHERE kind = ? ORDER BY updated_at DESC, id', [kind]);
  return result.rows.map(decode);
}
export async function get(kind, id) {
  validKind(kind);
  const result = await sql('SELECT id, payload, revision FROM gym_records WHERE kind = ? AND id = ?', [kind, id]);
  return result.rows.length ? decode(result.rows[0]) : null;
}
export async function create(kind, record) {
  validKind(kind);
  const id = record.id || crypto.randomUUID();
  const { revision: _revision, id: _id, ...payload } = record;
  await sql('INSERT INTO gym_records(kind, id, payload) VALUES (?, ?, ?)', [kind, id, JSON.stringify(payload)]);
  return { ...payload, id, revision: 1 };
}
export async function update(kind, record) {
  validKind(kind);
  const { id, revision, ...payload } = record;
  if (!id || !Number.isInteger(revision)) throw new Error('记录版本无效');
  const result = await sql('UPDATE gym_records SET payload = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP WHERE kind = ? AND id = ? AND revision = ?', [JSON.stringify(payload), kind, id, revision]);
  if (result.affectedRows !== 1) throw new ConflictError();
  return { ...payload, id, revision: revision + 1 };
}
export async function remove(kind, record) {
  validKind(kind);
  const result = await sql('DELETE FROM gym_records WHERE kind = ? AND id = ? AND revision = ?', [kind, record.id, record.revision]);
  if (result.affectedRows !== 1) throw new ConflictError();
}
/** The restore trigger replaces all business records in one SQLite statement. */
export async function restore(records) {
  await sql('INSERT INTO gym_records(kind,id,payload) VALUES (?, ?, ?)', ['restore', crypto.randomUUID(), JSON.stringify({records})]);
}
/** Import courses and orders as one statement; the trigger rechecks existing phones. */
export async function importBatch(orders,courses) {
  await sql('INSERT INTO gym_records(kind,id,payload) VALUES (?, ?, ?)', ['import', crypto.randomUUID(), JSON.stringify({orders,courses})]);
}
export async function batchOrders(action,items,settledAt='') {
  if (!['settle','delete'].includes(action)) throw new Error('无效的批量操作');
  await sql('INSERT INTO gym_records(kind,id,payload) VALUES (?, ?, ?)', ['batch',crypto.randomUUID(),JSON.stringify({action,items:items.map(({id,revision})=>({id,revision})),settledAt})]);
}
export async function updateMany(items) {
  await sql('INSERT INTO gym_records(kind,id,payload) VALUES (?, ?, ?)', ['update-many',crypto.randomUUID(),JSON.stringify({items})]);
}
