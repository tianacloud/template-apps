import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture } from '../fixtures/hrana';
import { history, daily } from '../fixtures/records';
let fixture: ReturnType<typeof createFixture>;
beforeEach(() => {
  vi.resetModules(); fixture = createFixture();
  vi.stubGlobal('window',{ tiana: { auth: { getAccessToken: async () => 'fixture-only' },connection: async () => ({ origin: 'https://ep-00000000000000000000000000.fixture.test',sql_api: 'hrana-v3' }) } });
  vi.stubGlobal('fetch',async (_: unknown,init: RequestInit) => new Response(await fixture.handle(init.body as Uint8Array) as any,{ headers: { 'content-type': 'application/vnd.tiana.fetch.v1','cache-control': 'no-store' } }));
});
afterEach(() => { fixture.close(); vi.unstubAllGlobals(); });
describe('schema and framed Hrana transactions',() => {
  it('saves multiple unknown-ended periods and preserves known interval constraints',async () => {
    const {transaction,finalRelations} = await import('../../src/db');
    const {insertPeriod,readBackup,upsertDay} = await import('../../src/repository');
    const facts = history([28,28]);
    facts.periods.forEach(p => { p.endDate = null; p.endUnknown = true; });
    await transaction(facts.periods.map(insertPeriod),true);
    expect((await readBackup()).periods.map(p => p.endUnknown)).toEqual([true,true,true]);
    await expect(transaction([insertPeriod({...facts.periods[0],id:'overlap',startDate:'2025-01-02',endDate:'2025-02-01',endUnknown:false})],true)).rejects.toThrow();
    await transaction([upsertDay(daily('2025-01-02',{bleedingType:'SPOTTING'})),finalRelations],true);
    await expect(transaction([{sql:'UPDATE zhiji_periods SET end_date=? WHERE id=?',args:['2025-01-05',facts.periods[0].id]}],true)).rejects.toThrow();
  });
  it('rejects overlapping inserts and updates, second open intervals, invalid enums, and mutable snapshots',async () => {
    const { transaction } = await import('../../src/db'); const { insertPeriod,insertSnapshot } = await import('../../src/repository');
    const periods = history([28]).periods;
    await transaction(periods.map(insertPeriod),true);
    await expect(transaction([insertPeriod({ ...periods[0],id: 'duplicate' })],true)).rejects.toThrow();
    await expect(transaction([{ sql: 'UPDATE zhiji_periods SET end_date=? WHERE id=?',args: [periods[1].startDate,periods[0].id] }],true)).rejects.toThrow();
    await expect(transaction([{ sql: 'UPDATE zhiji_periods SET end_date=NULL WHERE id=?',args: [periods[0].id] }],true)).rejects.toThrow();
    await expect(transaction([{ sql: "INSERT INTO zhiji_daily_logs(date,pain_score,created_at,updated_at) VALUES('2025-01-01',11,'x','x')" }],true)).rejects.toThrow();
    await expect(transaction([{ sql: "INSERT INTO zhiji_daily_logs(date,symptoms,created_at,updated_at) VALUES('2025-01-01','{}','x','x')" }],true)).rejects.toThrow();
    const { createSnapshot } = await import('../../src/domain/evaluation'); const s = createSnapshot(history([28]),0,'2025-02-01')!;
    await transaction([insertSnapshot(s)],true);
    await expect(transaction([{ sql: 'UPDATE zhiji_prediction_snapshots SET generated_at=? WHERE id=?',args: ['changed',s.id] }],true)).rejects.toThrow();
    expect(fixture.db.isTransaction).toBe(false);
  });
  it('rolls back every fact and revision when a middle statement fails',async () => {
    const { transaction,revisionGuard } = await import('../../src/db'); const { insertPeriod } = await import('../../src/repository'); const p = history([]).periods[0];
    await expect(transaction([revisionGuard(0,'write'),insertPeriod(p),insertPeriod({ ...p,id: 'overlap' })],true)).rejects.toThrow();
    expect(fixture.db.prepare('SELECT COUNT(*) n FROM zhiji_periods').get()!.n).toBe(0);
    expect(fixture.db.prepare('SELECT facts_revision FROM zhiji_state').get()!.facts_revision).toBe(0);
    expect(fixture.db.isTransaction).toBe(false);
  });
  it('allows only one writer with an expected revision and checks final relationships',async () => {
    const { applyPlan } = await import('../../src/commands'); const f = history([]), before = { periods: [],bleeding: [],absences: [] };
    expect(await applyPlan({ before,after: f,days: [] },0,'2026-10-13','first')).toBe('saved');
    await expect(applyPlan({ before,after: history([],'2025-02-01'),days: [] },0,'2026-10-13','second')).rejects.toThrow('另一台设备');
    expect(fixture.db.prepare('SELECT COUNT(*) n FROM zhiji_periods').get()!.n).toBe(1);
    const { transaction,finalRelations,revisionGuard } = await import('../../src/db'); const { upsertDay } = await import('../../src/repository');
    await expect(transaction([revisionGuard(1,'bad'),upsertDay(daily('2025-02-03',{ bleedingType: 'MENSTRUATION' })),finalRelations],true)).rejects.toThrow();
    expect(fixture.db.prepare('SELECT COUNT(*) n FROM zhiji_daily_logs').get()!.n).toBe(0);
  });
  it('verifies a lost committed response without replaying the fact write',async () => {
    const { applyPlan } = await import('../../src/commands'); const f = history([]);
    fixture.failNext('after'); expect(await applyPlan({ before: { periods: [],bleeding: [],absences: [] },after: f,days: [] },0,'2026-10-13','lost')).toBe('saved');
    expect(fixture.calls.filter(c => c.sql.includes('last_write_id=?'))).toHaveLength(1);
    expect(fixture.db.prepare('SELECT COUNT(*) n FROM zhiji_periods').get()!.n).toBe(1);
  });
  it('restores backup facts atomically and clearing also removes predictions and settings',async () => {
    const { applyPlan,persistPrediction } = await import('../../src/commands'); const { readBackup } = await import('../../src/repository');
    const { parseBackup,previewImport } = await import('../../src/transfer'); const f = history([28,28,28,28]);
    await applyPlan({ before: { periods: [],bleeding: [],absences: [] },after: f,days: [daily('2025-01-02',{ painScore: 0,bowelEvents: [] })],settings: { hiddenGroups: ['sleep'] } },0,'2026-10-13','initial');
    await persistPrediction(f,1,'2026-10-13'); const backup = await readBackup();
    await applyPlan({ before: f,after: { periods: [],bleeding: [],absences: [] },days: [],clear: true },1,'2026-10-13','clear');
    for (const table of ['zhiji_periods','zhiji_daily_logs','zhiji_prediction_snapshots','zhiji_settings']) expect(fixture.db.prepare(`SELECT COUNT(*) n FROM ${table}`).get()!.n).toBe(0);
    const empty = await readBackup(); const plan = previewImport(parseBackup(JSON.stringify(backup),'2026-10-13'),empty).plan;
    await applyPlan(plan,2,'2026-10-13','restore');
    expect((await readBackup()).dailyLogs[0].bowelEvents).toEqual([]); expect((await readBackup()).periods.map(p => p.id)).toEqual(backup.periods.map(p => p.id));
  });
});
it('restores permanent input invalidation from a JSON backup',async () => {
  const { applyPlan,persistPrediction } = await import('../../src/commands');
  const { readBackup } = await import('../../src/repository');
  const { parseBackup,previewImport } = await import('../../src/transfer');
  const f = history([28,28,28,28]); const emptyFacts = { periods: [],bleeding: [],absences: [] };
  await applyPlan({before:emptyFacts,after:f,days:[]},0,'2026-10-13','first');
  await persistPrediction(f,1,'2026-10-13');
  fixture.db.prepare("UPDATE zhiji_prediction_evaluations SET status='INVALIDATED',reason='INPUT_CORRECTED',is_baseline=0").run();
  const backup = await readBackup();
  await applyPlan({before:f,after:emptyFacts,days:[],clear:true},1,'2026-10-13','clear');
  const plan = previewImport(parseBackup(JSON.stringify(backup),'2026-10-13'),await readBackup()).plan;
  await applyPlan(plan,2,'2026-10-13','restore');
  await persistPrediction(f,3,'2026-10-13');
  expect((await readBackup()).predictionEvaluations![0]).toMatchObject({status:'INVALIDATED',reason:'INPUT_CORRECTED'});
});
