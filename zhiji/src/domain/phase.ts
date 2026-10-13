import type { DailyLog, DurationEstimate, Facts, FertilityEstimate, PhaseResult, Prediction } from '../types';
import { addDays, daysBetween } from './dates';

export function estimatePhase(date: string, facts: Facts, p: Prediction, duration: DurationEstimate, fertility: FertilityEstimate, daily?: DailyLog): PhaseResult {
  const anchor = [...facts.periods].filter(x => x.startDate <= date).sort((a, b) => a.startDate.localeCompare(b.startDate)).at(-1);
  const day = anchor ? daysBetween(anchor.startDate, date) + 1 : null;
  const unknown = (reason: string): PhaseResult => ({ phase: 'UNKNOWN', source: 'UNKNOWN', cycleDay: day, expectedBoundary: null, reason });
  const recorded = facts.periods.find(x => x.startDate <= date && x.endDate !== null && x.endDate >= date);
  if (recorded) return { phase: 'MENSTRUAL', source: 'RECORDED', cycleDay: daysBetween(recorded.startDate, date) + 1, expectedBoundary: recorded.endDate, reason: null };
  if (!anchor) return unknown('记录最近一次经期，慢慢了解自己的规律。');
  if (!anchor.endDate) {
    if (date === anchor.startDate || daily?.bleedingType === 'MENSTRUATION')
      return { phase: 'MENSTRUAL', source: 'RECORDED', cycleDay: day, expectedBoundary: duration?.currentEnd ?? null, reason: '结束日期尚未填写' };
    return unknown(anchor.endUnknown ? '这次经期的结束日期未知，今天的出血情况还需要记录。' : duration?.currentEnd && date > duration.currentEnd ? '预计结束日已过，请补充实际结束日期。' : '结束日期尚未填写，今天的出血情况还需要记录。');
  }
  if (facts.bleeding.some(b => b.date > anchor.startDate && b.date <= date && b.bleedingType === 'UNKNOWN')) return unknown('有尚未明确性质的出血，请先核实记录。');
  if (p.conditionUnavailable) return unknown('已确认尚未来经，数据不足，暂不能更新日期估计。');
  if (p.windowEnd && date > p.windowEnd && (!p.conditionThrough || p.conditionThrough < addDays(date, -1))) return unknown('预测窗口已过，请核实记录。');
  if (!fertility || !p.centerDate || anchor.id !== p.anchorId) return unknown('当前阶段暂不能确定。');
  if (date < addDays(fertility.peakDate, -1)) return { phase: 'FOLLICULAR', source: 'ESTIMATED', cycleDay: day, expectedBoundary: addDays(fertility.peakDate, -1), reason: null };
  if (date <= addDays(fertility.peakDate, 1)) return { phase: 'OVULATION_REFERENCE', source: 'ESTIMATED', cycleDay: day, expectedBoundary: addDays(fertility.peakDate, 1), reason: null };
  if (date < p.centerDate) return { phase: 'LUTEAL', source: 'ESTIMATED', cycleDay: day, expectedBoundary: p.centerDate, reason: null };
  return unknown('当前阶段暂不能确定。');
}
