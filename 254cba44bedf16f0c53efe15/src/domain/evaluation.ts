import { ALGORITHM_VERSION, type Evaluation, type Facts, type Snapshot } from '../types';
import { addDays, daysBetween } from './dates';
import { predictionInput } from './cycles';
import { estimateDuration, predict } from './prediction';
import { estimateFertility } from './fertility';
import { cycleMass, cycleSurvivalAfter, tailBoundary } from './probability';

export function createSnapshot(facts: Facts, revision: number, today: string): Snapshot | null {
  const p = predict(facts);
  if (!p.centerDate || !p.input || !p.anchorId || !p.anchorDate) return null;
  const duration = estimateDuration(facts.periods, p), fertility = estimateFertility(facts, p);
  const probabilities = p.model ? Array.from({ length: 29 }, (_, i) => {
    const date = addDays(p.centerDate!, i - 14);
    return { date, probability: cycleMass(daysBetween(p.anchorDate!, date), p.model!) };
  }) : [];
  const start = probabilities[0]?.date ?? null, end = probabilities.at(-1)?.date ?? null;
  return { id: crypto.randomUUID(), anchorPeriodId: p.anchorId, kind: p.conditionThrough ? 'CONDITIONAL' : 'BASE',
    algorithmVersion: ALGORITHM_VERSION, factsRevision: revision, generatedAt: new Date().toISOString(), generatedLocalDate: today,
    origin: 'APP', input: p.input,
    output: { prediction: p, duration, fertility, probabilities, tableStart: start, tableEnd: end,
      leftTail: p.model && start ? 1 - cycleSurvivalAfter(daysBetween(p.anchorDate, start) - 1, p.model) : 0,
      rightTail: p.model && end ? cycleSurvivalAfter(daysBetween(p.anchorDate, end), p.model) : 0,
      supportUpper: p.model ? tailBoundary(k => cycleSurvivalAfter(k, p.model!), p.mean! + 20) : null } };
}
export function samePrediction(a: Snapshot, b: Snapshot): boolean {
  return a.kind === b.kind && a.algorithmVersion === b.algorithmVersion && JSON.stringify(a.input) === JSON.stringify(b.input)
    && a.output.prediction.conditionThrough === b.output.prediction.conditionThrough;
}
export function evaluateSnapshots(snapshots: Snapshot[], previous: Evaluation[], facts: Facts, revision: number): Evaluation[] {
  const sorted = [...snapshots].sort((a, b) => a.generatedAt.localeCompare(b.generatedAt) || a.id.localeCompare(b.id));
  const periods = [...facts.periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const baseline = new Set<string>();
  return sorted.map(s => {
    const old = previous.find(e => e.snapshotId === s.id);
    const e: Evaluation = { snapshotId: s.id, anchorPeriodId: s.anchorPeriodId, isBaseline: false, status: 'PENDING', reason: null,
      targetPeriodId: null, targetDate: null, absoluteError: null, evaluatedAt: new Date().toISOString(), factsRevision: revision };
    const anchorIndex = periods.findIndex(p => p.id === s.anchorPeriodId), anchor = periods[anchorIndex], target = periods[anchorIndex + 1];
    if ((old?.status === 'INVALIDATED' && old.reason === 'INPUT_CORRECTED') || !anchor || JSON.stringify(predictionInput(facts, anchor)) !== JSON.stringify(s.input))
      return { ...e, status: 'INVALIDATED', reason: 'INPUT_CORRECTED' };
    if (s.kind !== 'BASE') return { ...e, reason: 'CONDITIONAL' };
    if (target && s.generatedLocalDate >= target.startDate) return { ...e, status: 'INVALIDATED', reason: 'GENERATED_TOO_LATE' };
    if (baseline.has(s.anchorPeriodId)) return { ...e, reason: 'LATER_BASE' };
    baseline.add(s.anchorPeriodId); e.isBaseline = true;
    if (!target) return e;
    e.targetPeriodId = target.id; e.targetDate = target.startDate;
    if (target.gapBefore) return { ...e, status: 'SKIPPED_GAP', reason: 'GAP' };
    if (facts.bleeding.some(b => b.bleedingType === 'UNKNOWN' && b.date > anchor.startDate && b.date < target.startDate)) return { ...e, reason: 'UNKNOWN_BLEEDING' };
    return { ...e, status: 'EVALUATED', absoluteError: Math.abs(daysBetween(s.output.prediction.centerDate!, target.startDate)) };
  });
}
export function meanAbsoluteError(evaluations: Evaluation[]): { value: number | null; count: number } {
  const rows = evaluations.filter(e => e.isBaseline && e.status === 'EVALUATED' && e.absoluteError !== null);
  return { value: rows.length ? rows.reduce((sum, e) => sum + e.absoluteError!, 0) / rows.length : null, count: rows.length };
}
