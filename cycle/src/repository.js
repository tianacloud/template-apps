import { sql, verifiedWrite } from './db.js';
const eventRow = row => ({ ...row, tags: JSON.parse(row.tags), interval_days: Number(row.interval_days), archived: Number(row.archived), count: Number(row.count || 0), minutes: Number(row.minutes || 0) });
const recordRow = row => ({ ...row, duration: Number(row.duration), photos: JSON.parse(row.photos) });
export const demo = false;
export const resetDemo = undefined;
export async function loadHome() {
  const [events, tags] = await Promise.all([
    sql(`SELECT e.*, s.last_at, COALESCE(s.count,0) AS count, COALESCE(s.minutes,0) AS minutes FROM cycle_events e LEFT JOIN (SELECT event_id, MAX(occurred_at) AS last_at, COUNT(*) AS count, SUM(duration) AS minutes FROM cycle_records GROUP BY event_id) s ON s.event_id=e.id ORDER BY e.created_at DESC`),
    sql('SELECT * FROM cycle_tags ORDER BY name'),
  ]);
  return { events: events.rows.map(eventRow), tags: tags.rows };
}
export async function saveEvent(event) {
  const values = [event.id, event.name.trim(), event.interval_days, event.first_due, JSON.stringify(event.tags), event.icon, event.color, event.archived, event.created_at];
  await verifiedWrite(() => sql(`INSERT INTO cycle_events(id,name,interval_days,first_due,tags,icon,color,archived,created_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,interval_days=excluded.interval_days,first_due=excluded.first_due,tags=excluded.tags,icon=excluded.icon,color=excluded.color,archived=excluded.archived`, values), async () => (await sql('SELECT * FROM cycle_events WHERE id=?', [event.id])).rows[0], actual => actual && values.every((value, i) => String(actual[['id','name','interval_days','first_due','tags','icon','color','archived','created_at'][i]]) === String(value)));
}
export async function saveTag(tag) {
  await verifiedWrite(() => sql('INSERT INTO cycle_tags(id,name) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name', [tag.id, tag.name.trim()]), async () => (await sql('SELECT * FROM cycle_tags WHERE id=?', [tag.id])).rows[0], actual => actual?.name === tag.name.trim());
}
export async function deleteTag(id) { await verifiedWrite(() => sql('DELETE FROM cycle_tags WHERE id=?', [id]), async () => (await sql('SELECT id FROM cycle_tags WHERE id=?', [id])).rows[0], actual => !actual); }
export async function loadHistory(id, range, offset = 0) {
  const [records, counts, totals] = await Promise.all([
    sql('SELECT * FROM cycle_records WHERE event_id=? AND occurred_at>=? AND occurred_at<? ORDER BY occurred_at DESC,id DESC LIMIT 40 OFFSET ?', [id, range.start, range.end + 'T23:59:59', offset]),
    sql('SELECT substr(occurred_at,1,10) AS day,COUNT(*) AS count FROM cycle_records WHERE event_id=? AND occurred_at>=? AND occurred_at<? GROUP BY day ORDER BY day', [id, range.start, range.end + 'T23:59:59']),
    sql('SELECT COUNT(*) AS count,COALESCE(SUM(duration),0) AS minutes FROM cycle_records WHERE event_id=? AND occurred_at>=? AND occurred_at<?', [id, range.start, range.end + 'T23:59:59']),
  ]);
  return { records: records.rows.map(recordRow), counts: counts.rows, total: Number(totals.rows[0].count), minutes: Number(totals.rows[0].minutes) };
}
export async function saveRecord(record) {
  const values = [record.id, record.event_id, record.occurred_at, record.duration, record.note, JSON.stringify(record.photos), record.created_at];
  await verifiedWrite(() => sql(`INSERT INTO cycle_records(id,event_id,occurred_at,duration,note,photos,created_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET occurred_at=excluded.occurred_at,duration=excluded.duration,note=excluded.note,photos=excluded.photos`, values), async () => (await sql('SELECT * FROM cycle_records WHERE id=?', [record.id])).rows[0], actual => actual && values.every((value, i) => String(actual[['id','event_id','occurred_at','duration','note','photos','created_at'][i]]) === String(value)));
}
export async function deleteRecord(id) { await verifiedWrite(() => sql('DELETE FROM cycle_records WHERE id=?', [id]), async () => (await sql('SELECT id FROM cycle_records WHERE id=?', [id])).rows[0], actual => !actual); }
