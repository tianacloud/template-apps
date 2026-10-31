export const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const minuteKey = (date = new Date()) => `${dayKey(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
export const parseDay = (value) => new Date(`${value.slice(0, 10)}T00:00:00`);
export function addDays(value, amount) { const date = parseDay(value); date.setDate(date.getDate() + amount); return dayKey(date); }
export function dayDistance(a, b) { const x = a.split('-').map(Number), y = b.split('-').map(Number); return Math.round((Date.UTC(...[y[0], y[1] - 1, y[2]]) - Date.UTC(...[x[0], x[1] - 1, x[2]])) / 86400000); }
export function due(event, today = dayKey()) {
  const date = event.last_at ? addDays(event.last_at, Number(event.interval_days)) : event.first_due;
  const days = dayDistance(today, date);
  return { date, days, label: days < 0 ? `已逾期 ${-days} 天` : days === 0 ? '今天该做了' : days === 1 ? '明天该做' : `${days} 天后`, state: days < 0 ? 'overdue' : days === 0 ? 'today' : 'upcoming' };
}
export function rangeFor(mode, anchor = dayKey(), custom = {}) {
  const date = parseDay(anchor);
  let start, end;
  if (mode === 'day') { start = addDays(anchor, -6); end = anchor; }
  else if (mode === 'week') { start = addDays(anchor, -((date.getDay() + 6) % 7)); end = addDays(start, 6); }
  else if (mode === 'month') { start = dayKey(new Date(date.getFullYear(), date.getMonth(), 1)); end = dayKey(new Date(date.getFullYear(), date.getMonth() + 1, 0)); }
  else if (mode === 'year') { start = `${date.getFullYear()}-01-01`; end = `${date.getFullYear()}-12-31`; }
  else { start = custom.start; end = custom.end; }
  if (!start || !end || start > end) throw new Error('结束日期不能早于开始日期。');
  return { start, end };
}
export function bucketsFor(range, counts, mode) {
  const totals = new Map(counts.map(item => [item.day, Number(item.count)]));
  if (mode === 'year') return Array.from({ length: 12 }, (_, i) => { const key = `${range.start.slice(0, 4)}-${String(i + 1).padStart(2, '0')}`; return { key, label: `${i + 1}月`, count: counts.filter(x => x.day.startsWith(key)).reduce((n, x) => n + Number(x.count), 0) }; });
  const result = [];
  for (let key = range.start; key <= range.end; key = addDays(key, 1)) result.push({ key, label: `${Number(key.slice(5, 7))}/${Number(key.slice(8, 10))}`, count: totals.get(key) || 0 });
  return result;
}
export function shiftAnchor(mode, anchor, step) {
  const date = parseDay(anchor);
  if (mode === 'year') return dayKey(new Date(date.getFullYear() + step, 0, 1));
  if (mode === 'month') return dayKey(new Date(date.getFullYear(), date.getMonth() + step, 1));
  return addDays(anchor, step * 7);
}
