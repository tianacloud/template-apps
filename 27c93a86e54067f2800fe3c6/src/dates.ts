import { DateTime } from 'luxon';
import type { Day, Settings } from './model';

export function validDay(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && DateTime.fromISO(value, {zone: 'UTC'}).isValid;
}
export function addDays(day: Day, count: number): Day {
  const d = DateTime.fromISO(day, {zone: 'UTC'}).plus({days: count}).toISODate();
  if (!d) throw new Error('日期无效');
  return d;
}
export function distance(a: Day, b: Day) {
  return Math.round(DateTime.fromISO(b, {zone: 'UTC'}).diff(DateTime.fromISO(a, {zone: 'UTC'}), 'days').days);
}
export function daysBetween(a: Day, b: Day): Day[] {
  if (a > b) return [];
  const count = distance(a, b);
  if (!Number.isFinite(count) || count > 36600) throw new Error('日期范围过长');
  return Array.from({length: count + 1}, (_, i) => addDays(a, i));
}
export const weekday = (d: Day) => DateTime.fromISO(d, {zone: 'UTC'}).weekday % 7;
export function businessDay(settings: Settings, now = Date.now()) {
  const local = DateTime.fromMillis(now, {zone: settings.timeZone});
  if (!local.isValid) throw new Error('请选择有效的 IANA 时区');
  return (local.hour < settings.startHour ? local.minus({days: 1}) : local).toISODate()!;
}
// Published holiday ranges; personal working-day preferences remain authoritative.
// https://www.gov.cn/zhengce/zhengceku/202411/content_6986383.htm
// https://www.gov.cn/zhengce/content/202511/content_7047090.htm
const holidayRanges = [
  ['2025-01-01','2025-01-01'], ['2025-01-28','2025-02-04'], ['2025-04-04','2025-04-06'],
  ['2025-05-01','2025-05-05'], ['2025-05-31','2025-06-02'], ['2025-10-01','2025-10-08'],
  ['2026-01-01','2026-01-03'], ['2026-02-15','2026-02-23'], ['2026-04-04','2026-04-06'],
  ['2026-05-01','2026-05-05'], ['2026-06-19','2026-06-21'], ['2026-09-25','2026-09-27'],
  ['2026-10-01','2026-10-07'],
];
export function capacity(day: Day, settings: Settings) {
  if (Object.hasOwn(settings.overrides, day)) return settings.overrides[day];
  if (settings.holidayRest && holidayRanges.some(([a,b]) => day >= a && day <= b)) return 0;
  return settings.weekly[weekday(day)];
}
export const shortDate = (d: Day) => `${Number(d.slice(5,7))}/${Number(d.slice(8))}`;
export const weekName = (d: Day) => `周${'日一二三四五六'[weekday(d)]}`;
export const monthStart = (d: Day) => d.slice(0, 7) + '-01';
export function monthMove(d: Day, count: number) {
  return DateTime.fromISO(d, {zone: 'UTC'}).plus({months: count}).toISODate()!;
}
export type Repeat = 'none'|'daily'|'workdays'|'weekly'|'biweekly'|'monthly'|'custom';
export function repeatDates(start: Day, end: Day, rule: Repeat, selected: number[] = []) {
  if (!validDay(start) || !validDay(end) || start > end) throw new Error('重复结束日须不早于首日');
  if (rule === 'none') return {dates: [start], truncated: false};
  const dates: Day[] = [];
  const wd = weekday(start);
  for (const d of daysBetween(start, end)) {
    const offset = distance(start, d);
    const matches = rule === 'daily' || rule === 'workdays' && weekday(d) >= 1 && weekday(d) <= 5 ||
      rule === 'weekly' && weekday(d) === wd || rule === 'biweekly' && offset % 14 === 0 ||
      rule === 'monthly' && d.slice(8) === start.slice(8) ||
      rule === 'custom' && (selected.length ? selected : [wd]).includes(weekday(d));
    if (!matches) continue;
    if (dates.length === 120) return {dates, truncated: true};
    dates.push(d);
  }
  if (!dates.length) throw new Error('所选日期没有重复事项');
  return {dates, truncated: false};
}
