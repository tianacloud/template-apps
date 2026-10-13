import type { LocalDate } from '../types';

export function parseLocalDate(input: string): LocalDate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) throw new Error('请填写有效日期。');
  const [y, m, d] = input.split('-').map(Number);
  const date = new Date(0);
  date.setUTCFullYear(y, m - 1, d);
  date.setUTCHours(0, 0, 0, 0);
  if (y < 1 || date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d)
    throw new Error('这一天不存在，请检查日期。');
  return input;
}
export function localToday(now = new Date()): LocalDate {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function toDayNumber(date: LocalDate): number {
  parseLocalDate(date);
  const [y, m, d] = date.split('-').map(Number);
  const instant = new Date(0);
  instant.setUTCFullYear(y, m - 1, d);
  instant.setUTCHours(0, 0, 0, 0);
  return instant.getTime() / 86400000;
}
export function fromDayNumber(day: number): LocalDate { return new Date(day * 86400000).toISOString().slice(0, 10); }
export function addDays(date: LocalDate, days: number): LocalDate { return fromDayNumber(toDayNumber(date) + days); }
export function daysBetween(start: LocalDate, end: LocalDate): number { return toDayNumber(end) - toDayNumber(start); }
export function roundHalfUp(value: number): number { return Math.floor(value + 0.5); }
export function displayDate(date: LocalDate | null, year = false): string {
  if (!date) return '暂不能估计';
  const [y, m, d] = date.split('-').map(Number);
  return `${year ? y + ' 年 ' : ''}${m} 月 ${d} 日`;
}
export function median(values: number[]): number {
  const a = [...values].sort((x, y) => x - y), i = Math.floor(a.length / 2);
  return a.length % 2 ? a[i] : (a[i - 1] + a[i]) / 2;
}
export function mean(values: number[]): number { return values.reduce((a, b) => a + b, 0) / values.length; }
export function sampleStd(values: number[]): number | null {
  if (values.length < 2) return null;
  const m = mean(values);
  return Math.sqrt(values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1));
}
