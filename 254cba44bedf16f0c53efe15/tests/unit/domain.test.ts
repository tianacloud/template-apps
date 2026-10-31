import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, localToday, median, parseLocalDate, roundHalfUp } from '../../src/domain/dates';
import { extractCycles, unusualInterval } from '../../src/domain/cycles';
import { estimateDuration, predict } from '../../src/domain/prediction';
import { cycleMass, cycleSurvivalAfter, tailBoundary } from '../../src/domain/probability';
import { estimateFertility, fertileMass, lutealWeights, ovulationMass, ovulationTail, ovulationValidMass } from '../../src/domain/fertility';
import { estimatePhase } from '../../src/domain/phase';
import { emptyDay, parseDaily, relationIssues, validateFacts } from '../../src/domain/records';
import { createSnapshot, evaluateSnapshots, meanAbsoluteError } from '../../src/domain/evaluation';
import { buildObservations, cycleBodyStatistics, dailyStatistics } from '../../src/domain/statistics';
import { chooseKnowledge } from '../../src/domain/knowledge';
import { csvFiles, parseBackup, previewImport } from '../../src/transfer';
import type { Backup, Evaluation } from '../../src/types';
import { daily, history } from '../fixtures/records';

describe('calendar facts',() => {
  it('uses calendar days across leap days, years, and DST dates',() => {
    expect(daysBetween('2024-02-28','2024-03-01')).toBe(2);
    expect(addDays('2025-12-31',1)).toBe('2026-01-01');
    expect(daysBetween('2026-03-07','2026-03-10')).toBe(3);
    expect(() => parseLocalDate('2025-02-29')).toThrow();
    expect(() => parseLocalDate('2026-02-30')).toThrow();
    expect(localToday(new Date(2026,9,13,0,1))).toBe('2026-10-13');
    expect(roundHalfUp(28.5)).toBe(29); expect(median([5,6])).toBe(5.5);
  });
  it('rejects overlaps, open intervals before later records, and future facts',() => {
    const f = history([28]); f.periods[0].endDate = f.periods[1].startDate;
    expect(() => validateFacts(f,'2026-10-13')).toThrow('重叠');
    f.periods[0].endDate = null; expect(() => validateFacts(f,'2026-10-13')).toThrow('结束日期');
    f.periods[0].endDate = '2027-01-01'; expect(() => validateFacts(f,'2026-10-13')).toThrow('未来');
  });
  it('preserves unknown, explicit none, and zero throughout parsing',() => {
    const log = parseDaily(daily('2026-10-01',{ painScore: 0,sleepHours: 0,bowelEvents: [],intimacyEvents: [],symptoms: [],
      discharge: { present: false,amount: null,colors: null,textures: null,odor: null,itching: null,burning: null } }),'2026-10-13');
    expect(log.painScore).toBe(0); expect(log.bowelEvents).toEqual([]); expect(log.moods).toBeNull();
    expect(() => parseDaily({ ...log,painScore: 1.5 },'2026-10-13')).toThrow();
  });
  it('requires classification and neighboring-gap decisions after period changes',() => {
    const f = history([28,28]), after = structuredClone(f);
    after.periods.splice(1,1); after.bleeding = [{ date: f.periods[1].startDate,bleedingType: 'MENSTRUATION' }];
    expect(relationIssues(f,after).map(i => i.kind)).toEqual(['GAP','BLEEDING']);
    const afterInsert = history([14,14,28]); afterInsert.periods[2].id = f.periods[1].id;
    expect(relationIssues(f,afterInsert).some(i => i.kind === 'GAP')).toBe(true);
  });
});
describe('prediction model',() => {
  it('selects only continuous confirmed intervals without removing real unusual lengths',() => {
    const f = history([28,28,83,28,28]); f.periods[3].gapBefore = true;
    expect(predict(f).input!.lengths).toEqual([28,28,28,28]);
    f.periods[3].gapBefore = false; expect(predict(f).input!.lengths).toContain(83);
    f.bleeding = [{ date: addDays(f.periods[2].startDate,3),bleedingType: 'UNKNOWN' }];
    expect(predict(f).input!.lengths).toEqual([28,28,28,28]);
    f.bleeding[0].bleedingType = 'SPOTTING'; expect(predict(f).input!.lengths).toContain(83);
    expect(unusualInterval(83,[28,28,28,28])).toBe(true);
  });
  it('enforces sample gates and caps history at twelve',() => {
    expect(predict(history([])).status).toBe('NO_HISTORY');
    for (const n of [1,2,3]) expect(predict(history(Array(n).fill(28))).windowProbability).toBeNull();
    const p = predict(history([28,29,27,28]));
    expect(p.mean).toBe(28); expect(p.model!.sampleStd).toBeCloseTo(Math.sqrt(2/3));
    expect(p.model!.scale).toBeCloseTo(2*Math.sqrt(1.25)); expect(p.windowProbability).toBeLessThan(1);
    expect(daysBetween(p.windowStart!,p.windowEnd!)).toBe(6);
    const many = predict(history([80,...Array(12).fill(28)])); expect(many.sampleCount).toBe(12); expect(many.mean).toBe(28);
  });
  it('keeps analytic tails and conditional normalization',() => {
    const f = history([28,29,27,28]), p = predict(f), m = p.model!;
    let sum = 0; for (let k = 1; k <= 600; k++) sum += cycleMass(k,m);
    expect(sum + cycleSurvivalAfter(600,m)).toBeCloseTo(1,12);
    const e = 45; f.absences.push({ id: 'absence',anchorPeriodId: p.anchorId!,throughDate: addDays(p.anchorDate!,e),createdAt: '2026-01-01T00:00:00Z' });
    const conditional = predict(f), cm = conditional.model!;
    expect(cycleMass(e,cm)).toBe(0); expect(daysBetween(p.anchorDate!,conditional.centerDate!)).toBe(e+1);
    sum = 0; for (let k = 1; k <= 800; k++) sum += cycleMass(k,cm);
    expect(sum + cycleSurvivalAfter(800,cm)).toBeCloseTo(1,12);
    const h = tailBoundary(k => cycleSurvivalAfter(k,cm),80);
    expect(cycleSurvivalAfter(h,cm)).toBeLessThanOrEqual(1e-6); expect(cycleSurvivalAfter(h-1,cm)).toBeGreaterThan(1e-6);
  });
  it('normalizes valid ovulation combinations, searches delayed modes, and defines fertile days',() => {
    for (const condition of [null,40]) {
      const f = history([28,29,27,28]);
      if (condition) f.absences = [{ id: 'c',anchorPeriodId: f.periods.at(-1)!.id,throughDate: addDays(f.periods.at(-1)!.startDate,condition),createdAt: '2026-01-01T00:00:00Z' }];
      const p = predict(f), m = p.model!, estimate = estimateFertility(f,p)!;
      let directV = 0; for (let k = 1; k <= 600; k++) for (const w of lutealWeights) if (k >= w.h) directV += cycleMass(k,m)*w.q;
      expect(directV + cycleSurvivalAfter(600,m)).toBeCloseTo(ovulationValidMass(m),12);
      let total = 0, best = 0; for (let o = 0; o <= 600; o++) { total += ovulationMass(o,m); if (ovulationMass(o,m) > ovulationMass(best,m)) best = o; }
      expect(total + ovulationTail(600,m)).toBeCloseTo(1,11);
      expect(daysBetween(p.anchorDate!,estimate.peakDate)).toBe(best);
      expect(fertileMass(12,m)).toBeCloseTo([12,13,14,15,16,17].reduce((s,o) => s + ovulationMass(o,m),0),13);
      expect(estimate.tail).toBeLessThanOrEqual(1e-6);
    }
  });
  it('counts duration inclusively and does not infer open-ended bleeding as a current fact',() => {
    const f = history([28]); f.periods.at(-1)!.endDate = null;
    const p = predict(f), d = estimateDuration(f.periods,p)!; expect(d.days).toBe(5);
    const date = addDays(f.periods.at(-1)!.startDate,8);
    expect(estimatePhase(date,f,p,d,estimateFertility(f,p)).phase).toBe('UNKNOWN');
    expect(estimatePhase(date,f,p,d,estimateFertility(f,p),daily(date,{ bleedingType: 'MENSTRUATION' })).phase).toBe('MENSTRUAL');
  });
});
describe('snapshots, observations, and transfer',() => {
  it('keeps natural-key identities and remaps imported period relationships',() => {
    const existing: Backup = { format: 'zhiji',formatVersion: 1,exportedAt: '2026-10-13T00:00:00Z',periods: history([28]).periods,dailyLogs: [],absenceConfirmations: [] };
    const incoming = structuredClone(existing); incoming.periods.forEach(p => p.id = 'import-' + p.id);
    incoming.absenceConfirmations = [{ id: 'absence',anchorPeriodId: incoming.periods[1].id,throughDate: '2025-02-03',createdAt: existing.exportedAt }];
    const merged = previewImport(parseBackup(JSON.stringify(incoming),'2026-10-13'),existing);
    expect(merged.conflicts).toHaveLength(0); expect(merged.identical).toBe(2);
    expect(merged.plan.after.periods.map(p => p.id)).toEqual(existing.periods.map(p => p.id));
    expect(merged.plan.after.absences[0].anchorPeriodId).toBe(existing.periods[1].id);
    incoming.periods[1].note = '导入的新备注';
    const replaced = previewImport(parseBackup(JSON.stringify(incoming),'2026-10-13'),existing,{ ['经期:' + incoming.periods[1].startDate]: 'replace' });
    expect(replaced.plan.after.periods[1].id).toBe(existing.periods[1].id);
    expect(replaced.plan.after.periods[1].note).toBe('导入的新备注');
  });
  it('shows per-period flow coverage and cycle-day colors and pain without filling missing days',() => {
    const f = history([28,28]);
    const logs = f.periods.map(p => daily(p.startDate,{ flowLevel: 'LIGHT',bloodColors: ['RED','BROWN'],painScore: 0 }));
    let stats = cycleBodyStatistics(f.periods,logs,3);
    expect(stats.flows[0].coveredDays).toBe(1); expect(stats.flows[0].totalDays).toBe(5);
    expect(stats.colors[0].coveredDays).toBe(3); expect(stats.colors[0].counts[0].count).toBe(3);
    expect(stats.pains[0]).toMatchObject({ day: 1,average: 0,coveredDays: 3,coveredCycles: 3 });
    f.periods[1].gapBefore = true; stats = cycleBodyStatistics(f.periods,logs,3);
    expect(stats.pains).toHaveLength(0); expect(stats.colors[0].coveredDays).toBe(2);
  });
  it('counts only the first timely base snapshot and updates corrected targets',() => {
    const f = history([28,28,28,28]), anchor = f.periods.at(-1)!;
    const s = createSnapshot(f,1,addDays(anchor.startDate,6))!; s.generatedAt = s.generatedLocalDate + 'T12:00:00Z';
    const later = { ...s,id: 'later',generatedAt: addDays(s.generatedLocalDate,1)+'T12:00:00Z',generatedLocalDate: addDays(s.generatedLocalDate,1) };
    const target = history([28,28,28,28,30]).periods.at(-1)!; f.periods.push(target);
    let evaluations = evaluateSnapshots([s,later],[],f,2); expect(meanAbsoluteError(evaluations)).toEqual({ value: 2,count: 1 });
    target.startDate = addDays(target.startDate,1); evaluations = evaluateSnapshots([s,later],evaluations,f,3); expect(meanAbsoluteError(evaluations).value).toBe(3);
    target.gapBefore = true; expect(meanAbsoluteError(evaluateSnapshots([s],[],f,4)).count).toBe(0);
    target.gapBefore = false; s.generatedLocalDate = target.startDate; expect(evaluateSnapshots([s],[],f,5)[0].status).toBe('INVALIDATED');
  });
  it('invalidates corrected inputs permanently, but end-date edits preserve start-date forecasts',() => {
    const f = history([28,28,28,28]), s = createSnapshot(f,1,'2025-05-01')!;
    f.periods[0].endDate = addDays(f.periods[0].endDate!,1);
    expect(evaluateSnapshots([s],[],f,2)[0].status).toBe('PENDING');
    f.periods[1].startDate = addDays(f.periods[1].startDate,1);
    const e = evaluateSnapshots([s],[],f,3); expect(e[0].status).toBe('INVALIDATED');
    f.periods[1].startDate = addDays(f.periods[1].startDate,-1);
    expect(evaluateSnapshots([s],e,f,4)[0].status).toBe('INVALIDATED');
    f.periods.pop(); expect(meanAbsoluteError(evaluateSnapshots([s],e,f,5)).count).toBe(0);
  });
  it('excludes missing values from denominators and retains zero and empty arrays',() => {
    const logs = [daily('2026-10-01'),daily('2026-10-02',{ painScore: 0,sleepHours: 0,symptoms: [],bowelEvents: [] }),daily('2026-10-03',{ painScore: 6,symptoms: ['FATIGUE'] })];
    const stats = dailyStatistics(logs,'2026-10-01','2026-10-13');
    expect(stats.pain.average).toBe(3); expect(stats.sleep.average).toBe(0); expect(stats.bowel.days).toBe(1);
    expect(stats.distributions.find(d => d.title === '身体感受')?.denominator).toBe(2);
    expect(buildObservations([],[],logs,'2026-10-13')).toEqual([]);
  });
  it('selects deterministic general knowledge for unknown phases',() => {
    const phase = { phase: 'UNKNOWN',source: 'UNKNOWN',cycleDay: null,expectedBoundary: null,reason: null } as const;
    expect(chooseKnowledge('2026-10-13',phase)).toEqual(chooseKnowledge('2026-10-13',phase));
    expect(chooseKnowledge('2026-10-13',phase).main.phases).toContain('UNKNOWN');
  });
  it('round-trips a backup and presents conflicts without overwriting',() => {
    const facts = history([28]), log = daily('2025-01-02',{ bowelEvents: [],note: '中文，O\'Reilly\n第二行' });
    const backup: Backup = { format: 'zhiji',formatVersion: 1,exportedAt: '2026-10-13T00:00:00Z',periods: facts.periods,dailyLogs: [log],absenceConfirmations: [],settings: { hiddenGroups: ['sleep'] } };
    const parsed = parseBackup(JSON.stringify(backup),'2026-10-13'); expect(parsed.invalid).toEqual([]);
    const empty = { ...backup,periods: [],dailyLogs: [],settings: {} };
    const plan = previewImport(parsed,empty).plan; expect(plan.after.periods).toEqual(backup.periods); expect(plan.days[0].bowelEvents).toEqual([]);
    const other = structuredClone(backup); other.dailyLogs[0].note = '保留旧值';
    const preview = previewImport(parsed,other); expect(preview.conflicts).toHaveLength(1); expect(preview.plan.days).toHaveLength(0);
    expect(previewImport(parsed,other,{ '每日记录:2025-01-02': 'replace' }).plan.days[0].note).toBe(log.note);
    const csv = csvFiles(backup); expect(csv).toHaveLength(4); expect(csv[1].content).toContain('"true","0"'); expect(csv[1].content).toContain('中文，O\'Reilly');
  });
});
