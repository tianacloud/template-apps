import type { CycleObservation, Facts, ModelInput, Period } from '../types';
import { daysBetween, median } from './dates';

export function extractCycles(periods: Period[], unknownDates: string[]): CycleObservation[] {
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  return sorted.slice(1).map((next, i) => ({
    fromId: sorted[i].id, toId: next.id, startDate: sorted[i].startDate, endDate: next.startDate,
    length: daysBetween(sorted[i].startDate, next.startDate),
    exclusion: next.gapBefore ? 'GAP' : unknownDates.some(d => d > sorted[i].startDate && d < next.startDate) ? 'UNKNOWN_BLEEDING' : null,
  }));
}
export function predictionInput(facts: Facts, anchor: Period): ModelInput {
  const periods = facts.periods.filter(p => p.startDate <= anchor.startDate).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const unknownDates = facts.bleeding.filter(b => b.bleedingType === 'UNKNOWN' && b.date <= anchor.startDate).map(b => b.date).sort();
  const cycles = extractCycles(periods, unknownDates).filter(c => !c.exclusion).slice(-12);
  const first = cycles[0]?.startDate ?? anchor.startDate;
  return { anchorId: anchor.id, anchorDate: anchor.startDate,
    periods: periods.filter(p => p.startDate >= first).map(p => ({ id: p.id, startDate: p.startDate, gapBefore: p.gapBefore })),
    unknownDates: unknownDates.filter(d => d >= first), lengths: cycles.map(c => c.length) };
}
export function unusualInterval(length: number, history: number[]): boolean {
  if (history.length < 4) return false;
  const m = median(history), mad = median(history.map(x => Math.abs(x - m)));
  return mad === 0 ? Math.abs(length - m) >= 7 : Math.abs(0.6745 * (length - m) / mad) > 3.5;
}
export function cyclePosition(date: string, periods: Period[]): { day: number; anchorId: string } | null {
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const index = sorted.findLastIndex(p => p.startDate <= date);
  if (index < 0 || sorted[index + 1]?.gapBefore) return null;
  return { day: daysBetween(sorted[index].startDate, date) + 1, anchorId: sorted[index].id };
}
