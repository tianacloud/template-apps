import tCDF from '@stdlib/stats-base-dists-t-cdf';
import normalCDF from '@stdlib/stats-base-dists-normal-cdf';
import type { TModel } from '../types';

export const TAIL_TOLERANCE = 1e-6;
export const studentTCdf = (z: number, df: number) => tCDF(z, df);
export const studentTSurvival = (z: number, df: number) => tCDF(-z, df);
export const normalCdf = (z: number) => normalCDF(z, 0, 1);
function survival(x: number, model: TModel): number { return studentTSurvival((x - model.mean) / model.scale, model.df); }
function interval(lo: number, hi: number, model: TModel): number {
  if (hi <= model.mean) return studentTCdf((hi - model.mean) / model.scale, model.df) - studentTCdf((lo - model.mean) / model.scale, model.df);
  if (lo >= model.mean) return survival(lo, model) - survival(hi, model);
  return (0.5 - studentTCdf((lo - model.mean) / model.scale, model.df)) + (0.5 - survival(hi, model));
}
export function cycleMass(k: number, model: TModel): number {
  const e = model.conditionOffset ?? 0;
  if (k < 1 || k <= e) return 0;
  const value = interval(k - 0.5, k + 0.5, model) / survival(Math.max(0, e) + 0.5, model);
  if (!Number.isFinite(value) || value < -1e-12) throw new Error('日期概率暂不能计算。');
  return Math.max(0, value);
}
export function cycleSurvivalAfter(e: number, model: TModel): number {
  const condition = Math.max(0, model.conditionOffset ?? 0);
  if (e <= condition) return 1;
  return survival(e + 0.5, model) / survival(condition + 0.5, model);
}
export function windowMass(center: number, radius: number, model: TModel): number {
  let total = 0;
  for (let k = center - radius; k <= center + radius; k++) total += cycleMass(k, model);
  return total;
}
export function tailBoundary(tail: (k: number) => number, initial: number): number {
  let high = Math.max(1, Math.ceil(initial)), low = 0;
  while (tail(high) > TAIL_TOLERANCE) { low = high; high *= 2; }
  while (low + 1 < high) {
    const mid = Math.floor((low + high) / 2);
    if (tail(mid) <= TAIL_TOLERANCE) high = mid; else low = mid;
  }
  return high;
}
export function integerPeak(model: TModel): number {
  const start = Math.max(1, (model.conditionOffset ?? 0) + 1);
  const candidates = [start, Math.max(start, Math.floor(model.mean)), Math.max(start, Math.ceil(model.mean))].sort((a, b) => a - b);
  return candidates.reduce((best, k) => cycleMass(k, model) > cycleMass(best, model) ? k : best);
}
