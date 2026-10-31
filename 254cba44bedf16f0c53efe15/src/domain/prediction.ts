import type { DurationEstimate, Facts, Period, Prediction, TModel } from '../types';
import { addDays, daysBetween, mean, median, roundHalfUp, sampleStd } from './dates';
import { extractCycles, predictionInput } from './cycles';
import { integerPeak, windowMass } from './probability';

export function predict(facts: Facts): Prediction {
  const anchor = [...facts.periods].sort((a, b) => a.startDate.localeCompare(b.startDate)).at(-1);
  const empty: Prediction = { status: 'NO_HISTORY', anchorId: anchor?.id ?? null, anchorDate: anchor?.startDate ?? null,
    input: null, model: null, sampleCount: 0, mean: null, centerDate: null, windowStart: null, windowEnd: null,
    windowProbability: null, conditionThrough: null, conditionUnavailable: false, interrupted: false };
  if (!anchor) return empty;
  const input = predictionInput(facts, anchor), n = input.lengths.length;
  if (!n) return { ...empty, input };
  const mu = mean(input.lengths), std = sampleStd(input.lengths);
  const through = facts.absences.filter(a => a.anchorPeriodId === anchor.id).map(a => a.throughDate).sort().at(-1) ?? null;
  const model: TModel | null = n >= 4 ? { mean: mu, sampleStd: std!, scale: Math.max(std!, 2) * Math.sqrt(1 + 1 / n), df: n - 1, n,
    conditionOffset: through ? daysBetween(anchor.startDate, through) : null } : null;
  const offset = model?.conditionOffset !== null && model ? integerPeak(model) : roundHalfUp(mu);
  const center = addDays(anchor.startDate, offset);
  const cycles = extractCycles(facts.periods, facts.bleeding.filter(b => b.bleedingType === 'UNKNOWN').map(b => b.date));
  const lastBreak = cycles.findLastIndex(c => c.exclusion === 'GAP');
  return { status: model ? 'PROBABILISTIC' : 'MEAN_ONLY', anchorId: anchor.id, anchorDate: anchor.startDate,
    input, model, sampleCount: n, mean: mu, centerDate: center, windowStart: addDays(center, -3), windowEnd: addDays(center, 3),
    windowProbability: model ? windowMass(offset, 3, model) : null, conditionThrough: through, conditionUnavailable: !!through && !model,
    interrupted: lastBreak >= 0 && cycles.slice(lastBreak + 1).filter(c => !c.exclusion).length < 4 };
}
export function estimateDuration(periods: Period[], prediction: Prediction): DurationEstimate {
  const closed = [...periods].filter(p => p.endDate).sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(-6);
  if (!closed.length) return null;
  const days = roundHalfUp(median(closed.map(p => daysBetween(p.startDate, p.endDate!) + 1)));
  const open = periods.find(p => !p.endDate);
  return { days, sampleCount: closed.length, currentEnd: open ? addDays(open.startDate, days - 1) : null,
    nextEnd: prediction.centerDate ? addDays(prediction.centerDate, days - 1) : null };
}
