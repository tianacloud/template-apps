import { DatabaseError, finalRelations, revisionGuard, transaction, type Statement } from './db';
import { insertAbsence, insertEvaluation, insertPeriod, insertSnapshot, loadSnapshots, readBackupSnapshot, saveSettings, upsertDay } from './repository';
import type { DailyLog, Evaluation, Facts, Settings, Snapshot } from './types';
import { sameBusiness, validateFacts } from './domain/records';
import { createSnapshot, evaluateSnapshots, samePrediction } from './domain/evaluation';

export type FactPlan = { before: Facts; after: Facts; days: DailyLog[]; snapshots?: Snapshot[]; evaluations?: Evaluation[]; settings?: Settings; clear?: boolean };
export function planStatements(plan: FactPlan): Statement[] {
  if (plan.clear) return ['zhiji_prediction_evaluations','zhiji_prediction_snapshots','zhiji_absence_confirmations','zhiji_daily_logs','zhiji_periods','zhiji_settings'].map(table => ({ sql: `DELETE FROM ${table}` }));
  const sql: Statement[] = [];
  const changed = plan.before.periods.filter(p => JSON.stringify(p) !== JSON.stringify(plan.after.periods.find(x => x.id === p.id)));
  const changedIds = new Set(changed.map(p => p.id));
  for (const a of plan.before.absences) if (changedIds.has(a.anchorPeriodId) || !plan.after.absences.some(x => JSON.stringify(x) === JSON.stringify(a))) sql.push({ sql: 'DELETE FROM zhiji_absence_confirmations WHERE id=?', args: [a.id] });
  for (const p of changed) sql.push({ sql: 'DELETE FROM zhiji_periods WHERE id=?', args: [p.id] });
  for (const p of [...plan.after.periods].sort((a, b) => a.startDate.localeCompare(b.startDate))) if (changedIds.has(p.id) || !plan.before.periods.some(x => x.id === p.id)) sql.push(insertPeriod(p));
  for (const day of plan.days) sql.push(upsertDay(day));
  for (const a of plan.after.absences) if (changedIds.has(a.anchorPeriodId) || !plan.before.absences.some(x => JSON.stringify(x) === JSON.stringify(a))) sql.push(insertAbsence(a));
  for (const s of plan.snapshots ?? []) sql.push(insertSnapshot(s));
  for (const e of plan.evaluations ?? []) sql.push(insertEvaluation(e));
  if (plan.settings) sql.push(saveSettings(plan.settings));
  return sql;
}
export async function applyPlan(plan: FactPlan, revision: number, today: string, writeId: string): Promise<'saved' | 'failed' | 'uncertain'> {
  validateFacts(plan.after, today);
  try {
    await transaction([revisionGuard(revision, writeId), ...planStatements(plan), finalRelations], true);
    return 'saved';
  } catch (error) {
    if (error instanceof DatabaseError && error.certainty === 'REJECTED') throw error;
    try { return await verifyPlan(plan,revision,writeId); } catch { return 'uncertain'; }
  }
}
export async function verifyPlan(plan: FactPlan, revision: number, writeId: string): Promise<'saved' | 'failed' | 'uncertain'> {
  const actual = await readBackupSnapshot(), b = actual.backup;
  if (actual.lastWriteId === writeId) {
    const matches = plan.clear ? !b.periods.length && !b.dailyLogs.length && !b.absenceConfirmations.length && !b.predictionSnapshots?.length && !b.predictionEvaluations?.length && !b.settings?.hiddenGroups?.length
      : sameBusiness(b.periods.slice().sort((a,b) => a.startDate.localeCompare(b.startDate)),plan.after.periods.slice().sort((a,b) => a.startDate.localeCompare(b.startDate)))
        && sameBusiness(b.absenceConfirmations.slice().sort((a,b) => a.id.localeCompare(b.id)),plan.after.absences.slice().sort((a,b) => a.id.localeCompare(b.id)))
        && plan.days.every(d => sameBusiness(d,b.dailyLogs.find(x => x.date === d.date)))
        && (plan.snapshots ?? []).every(s => b.predictionSnapshots?.some(x => x.id === s.id && JSON.stringify(x.input) === JSON.stringify(s.input) && JSON.stringify(x.output) === JSON.stringify(s.output)))
        && (!plan.settings || sameBusiness(plan.settings,b.settings));
    return matches ? 'saved' : 'uncertain';
  }
  return actual.revision === revision ? 'failed' : 'uncertain';
}
export async function persistPrediction(facts: Facts, revision: number, today: string) {
  const candidate = createSnapshot(facts, revision, today);
  const loaded = await loadSnapshots();
  if (candidate && !loaded.snapshots.some(s => samePrediction(s, candidate))) {
    try { await transaction([revisionGuard(revision), insertSnapshot(candidate)], true); loaded.snapshots.push(candidate); }
    catch (error) {
      const reread = await loadSnapshots();
      if (!reread.snapshots.some(s => samePrediction(s, candidate))) throw error;
      loaded.snapshots = reread.snapshots; loaded.evaluations = reread.evaluations;
    }
  }
  const evaluations = evaluateSnapshots(loaded.snapshots, loaded.evaluations, facts, revision);
  if (evaluations.some(e => {
    const old = loaded.evaluations.find(x => x.snapshotId === e.snapshotId);
    return !old || old.factsRevision !== revision || old.status !== e.status || old.absoluteError !== e.absoluteError || old.isBaseline !== e.isBaseline;
  })) await transaction([revisionGuard(revision), { sql: 'DELETE FROM zhiji_prediction_evaluations' }, ...evaluations.map(insertEvaluation)], true);
  return { snapshots: loaded.snapshots, evaluations };
}
