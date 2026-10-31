import { transaction, type Row, type Statement } from './db';
import type { AbsenceConfirmation, Backup, DailyLog, Evaluation, Facts, Period, Settings, Snapshot } from './types';

const json = (v: unknown) => v === null ? null : JSON.stringify(v);
const parseJson = (v: string | number | null) => v === null ? null : JSON.parse(String(v));
function camel(row: Row): Record<string, any> {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), v]));
}
export function periodRow(row: Row): Period { const v = camel(row); return { ...v, gapBefore: Number(v.gapBefore) === 1 } as Period; }
export function dailyRow(row: Row): DailyLog {
  const v = camel(row);
  for (const k of ['bloodColors', 'painLocations', 'symptoms', 'moods', 'bowelEvents', 'intimacyEvents', 'discharge']) v[k] = parseJson(v[k]);
  for (const k of ['painScore', 'sleepHours']) v[k] = v[k] === null ? null : Number(v[k]);
  return v as DailyLog;
}
export function snapshotRow(row: Row): Snapshot {
  const v = camel(row);
  return { ...v, factsRevision: Number(v.factsRevision), input: parseJson(v.inputJson), output: parseJson(v.outputJson) } as Snapshot;
}
export function evaluationRow(row: Row): Evaluation {
  const v = camel(row);
  return { ...v, isBaseline: Number(v.isBaseline) === 1, factsRevision: Number(v.factsRevision), absoluteError: v.absoluteError === null ? null : Number(v.absoluteError) } as Evaluation;
}
export async function loadFacts(today: string) {
  const r = await transaction([
    { sql: 'SELECT facts_revision, last_write_id FROM zhiji_state WHERE id=1' },
    { sql: 'SELECT * FROM zhiji_periods ORDER BY start_date' },
    { sql: 'SELECT date, bleeding_type FROM zhiji_daily_logs WHERE bleeding_type IS NOT NULL ORDER BY date' },
    { sql: 'SELECT * FROM zhiji_absence_confirmations ORDER BY through_date' },
    { sql: 'SELECT * FROM zhiji_daily_logs WHERE date=?', args: [today] },
    { sql: "SELECT value_json FROM zhiji_settings WHERE key='preferences'" },
  ]);
  const facts: Facts = { periods: r[1].map(periodRow), bleeding: r[2].map(x => camel(x) as Facts['bleeding'][number]), absences: r[3].map(x => camel(x) as AbsenceConfirmation) };
  return { facts, revision: Number(r[0][0].facts_revision), lastWriteId: r[0][0].last_write_id,
    daily: r[4].map(dailyRow), settings: r[5][0] ? parseJson(r[5][0].value_json) as Settings : { hiddenGroups: [] } };
}
export async function loadDays(start: string, end: string): Promise<DailyLog[]> {
  return (await transaction([{ sql: 'SELECT * FROM zhiji_daily_logs WHERE date BETWEEN ? AND ? ORDER BY date', args: [start, end] }]))[0].map(dailyRow);
}
export async function loadSnapshots(anchorId?: string) {
  const clause = anchorId ? ' WHERE anchor_period_id=?' : '';
  const args = anchorId ? [anchorId] : [];
  const r = await transaction([{ sql: `SELECT * FROM zhiji_prediction_snapshots${clause} ORDER BY generated_at, id`, args },
    { sql: `SELECT * FROM zhiji_prediction_evaluations${clause}`, args }]);
  return { snapshots: r[0].map(snapshotRow), evaluations: r[1].map(evaluationRow) };
}
export function insertPeriod(p: Period): Statement {
  return { sql: 'INSERT INTO zhiji_periods(id,start_date,end_date,gap_before,note,source,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)',
    args: [p.id, p.startDate, p.endDate, +p.gapBefore, p.note, p.source, p.createdAt, p.updatedAt] };
}
export function upsertDay(d: DailyLog): Statement {
  const fields = ['date','bleeding_type','flow_level','blood_colors','pain_score','pain_locations','symptoms','moods','sleep_hours','sleep_quality','bowel_events','intimacy_events','discharge','note','created_at','updated_at'];
  return { sql: `INSERT INTO zhiji_daily_logs(${fields.join(',')}) VALUES(${fields.map(() => '?').join(',')}) ON CONFLICT(date) DO UPDATE SET ${fields.filter(x => x !== 'date' && x !== 'created_at').map(x => `${x}=excluded.${x}`).join(',')}`,
    args: [d.date,d.bleedingType,d.flowLevel,json(d.bloodColors),d.painScore,json(d.painLocations),json(d.symptoms),json(d.moods),d.sleepHours,d.sleepQuality,json(d.bowelEvents),json(d.intimacyEvents),json(d.discharge),d.note,d.createdAt,d.updatedAt] };
}
export function insertAbsence(a: AbsenceConfirmation): Statement {
  return { sql: 'INSERT INTO zhiji_absence_confirmations(id,anchor_period_id,through_date,created_at) VALUES(?,?,?,?)', args: [a.id,a.anchorPeriodId,a.throughDate,a.createdAt] };
}
export function insertSnapshot(s: Snapshot): Statement {
  return { sql: 'INSERT INTO zhiji_prediction_snapshots(id,anchor_period_id,kind,algorithm_version,facts_revision,generated_at,generated_local_date,origin,input_json,output_json) VALUES(?,?,?,?,?,?,?,?,?,?)',
    args: [s.id,s.anchorPeriodId,s.kind,s.algorithmVersion,s.factsRevision,s.generatedAt,s.generatedLocalDate,s.origin,JSON.stringify(s.input),JSON.stringify(s.output)] };
}
export function insertEvaluation(e: Evaluation): Statement {
  return { sql: 'INSERT INTO zhiji_prediction_evaluations(snapshot_id,anchor_period_id,is_baseline,status,reason,target_period_id,target_date,absolute_error,evaluated_at,facts_revision) VALUES(?,?,?,?,?,?,?,?,?,?)',
    args: [e.snapshotId,e.anchorPeriodId,+e.isBaseline,e.status,e.reason,e.targetPeriodId,e.targetDate,e.absoluteError,e.evaluatedAt,e.factsRevision] };
}
export function saveSettings(s: Settings): Statement {
  return { sql: "INSERT INTO zhiji_settings(key,value_json,updated_at) VALUES('preferences',?,?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,updated_at=excluded.updated_at", args: [JSON.stringify(s),new Date().toISOString()] };
}
export async function readBackupSnapshot() {
  const r = await transaction(['zhiji_periods','zhiji_daily_logs','zhiji_absence_confirmations','zhiji_prediction_snapshots','zhiji_prediction_evaluations','zhiji_settings','zhiji_state'].map(table => ({ sql: `SELECT * FROM ${table}` })));
  const backup: Backup = { format: 'zhiji', formatVersion: 1, exportedAt: new Date().toISOString(), periods: r[0].map(periodRow),
    dailyLogs: r[1].map(dailyRow), absenceConfirmations: r[2].map(x => camel(x) as AbsenceConfirmation),
    predictionSnapshots: r[3].map(snapshotRow), predictionEvaluations: r[4].map(evaluationRow),
    settings: r[5].find(x => x.key === 'preferences') ? parseJson(r[5].find(x => x.key === 'preferences')!.value_json) : { hiddenGroups: [] } };
  return { backup,revision: Number(r[6][0].facts_revision),lastWriteId: r[6][0].last_write_id };
}
export async function readBackup(): Promise<Backup> { return (await readBackupSnapshot()).backup; }
