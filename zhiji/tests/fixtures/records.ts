import type { DailyLog, Facts, Period } from '../../src/types';
import { addDays } from '../../src/domain/dates';
import { emptyDay } from '../../src/domain/records';
export function history(lengths: number[], start = '2025-01-01'): Facts {
  let date = start;
  const periods: Period[] = [0,...lengths].map((length,i) => {
    date = addDays(date,length);
    return { id: 'period-' + i,startDate: date,endDate: addDays(date,4),endUnknown: false,gapBefore: false,note: null,source: 'USER',createdAt: date + 'T12:00:00.000Z',updatedAt: date + 'T12:00:00.000Z' };
  });
  return { periods,bleeding: [],absences: [] };
}
export function daily(date: string, patch: Partial<DailyLog> = {}): DailyLog { return { ...emptyDay(date),...patch }; }
