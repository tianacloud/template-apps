import type { Facts, FertilityEstimate, Prediction, TModel } from '../types';
import { addDays } from './dates';
import { cycleMass, cycleSurvivalAfter, normalCdf, tailBoundary } from './probability';

const raw = Array.from({ length: 15 }, (_, i) => ({ h: i + 6, q: normalCdf((i + 6.5 - 12.4) / 2.4) - normalCdf((i + 5.5 - 12.4) / 2.4) }));
const total = raw.reduce((sum, x) => sum + x.q, 0);
export const lutealWeights = raw.map(x => ({ ...x, q: x.q / total }));
export function ovulationValidMass(model: TModel): number {
  return lutealWeights.reduce((sum, x) => sum + x.q * cycleSurvivalAfter(x.h - 1, model), 0);
}
export function ovulationMass(o: number, model: TModel, v = ovulationValidMass(model)): number {
  if (o < 0) return 0;
  return lutealWeights.reduce((sum, x) => sum + x.q * cycleMass(o + x.h, model), 0) / v;
}
export function ovulationTail(o: number, model: TModel, v = ovulationValidMass(model)): number {
  return lutealWeights.reduce((sum, x) => sum + x.q * cycleSurvivalAfter(o + x.h, model), 0) / v;
}
export function fertileMass(d: number, model: TModel): number {
  if (d < 0) return 0;
  return Array.from({ length: 6 }, (_, i) => ovulationMass(d + i, model)).reduce((a, b) => a + b, 0);
}
export function estimateFertility(facts: Facts, p: Prediction): FertilityEstimate {
  if (!p.anchorDate || !p.centerDate || p.conditionUnavailable || facts.bleeding.some(b => b.date > p.anchorDate! && b.bleedingType === 'UNKNOWN')) return null;
  if (!p.model) {
    const date = addDays(p.centerDate, -12);
    if (date < p.anchorDate || date >= p.centerDate) return null;
    return { peakDate: date, windowStart: date < addDays(p.anchorDate, 5) ? p.anchorDate : addDays(date, -5), windowEnd: date,
      probabilistic: false, validMass: 1, supportUpper: 0, tail: 0 };
  }
  const m = p.model, v = ovulationValidMass(m);
  if (!Number.isFinite(v) || v <= 0) return null;
  const M = Math.max(m.mean, (m.conditionOffset ?? 0) + 1);
  let peak = Math.max(0, Math.floor(M - 20) - 1), best = -1;
  for (let o = peak; o <= Math.max(0, Math.ceil(M - 6) + 1); o++) {
    const mass = ovulationMass(o, m, v);
    if (mass > best) { best = mass; peak = o; }
  }
  const upper = tailBoundary(o => ovulationTail(o, m, v), M + 20);
  return { peakDate: addDays(p.anchorDate, peak), windowStart: addDays(p.anchorDate, Math.max(0, peak - 5)), windowEnd: addDays(p.anchorDate, peak),
    probabilistic: true, validMass: v, supportUpper: upper, tail: ovulationTail(upper, m, v) };
}
