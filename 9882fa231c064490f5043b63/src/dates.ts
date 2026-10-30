export const DAY = 86400000;
export const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
export function day(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("请输入有效日期");
  const n = Date.parse(value + "T00:00:00Z");
  if (
    !Number.isFinite(n) ||
    new Date(n).toISOString().slice(0, 10) !== value ||
    value < "0100-01-01" ||
    value > "9998-12-31"
  )
    throw new Error("日期不存在或超出范围");
  return n / DAY;
}
export const iso = (n: number) => new Date(n * DAY).toISOString().slice(0, 10);
export const addDays = (value: string, n: number) => iso(day(value) + n);
export const weekDay = (value: string) =>
  (new Date(day(value) * DAY).getUTCDay() + 6) % 7;
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export function dates(start: string, end: string) {
  const a = day(start),
    b = day(end);
  if (b < a || b - a > 3659) throw new Error("日期范围需为 1–3660 天");
  return Array.from({ length: b - a + 1 }, (_, i) => iso(a + i));
}
export const monthStart = (date: string) => date.slice(0, 7) + "-01";
export function moveMonth(date: string, n: number) {
  const d = new Date(day(monthStart(date)) * DAY);
  d.setUTCMonth(d.getUTCMonth() + n);
  const result = d.toISOString().slice(0, 10);
  day(result);
  return result;
}
export const monthEnd = (date: string) => addDays(moveMonth(date, 1), -1);
export const weekStart = (date: string) => addDays(date, -weekDay(date));
export const dateLabel = (value: string) =>
  `${Number(value.slice(5, 7))}月${Number(value.slice(8))}日 · 周${weekdays[weekDay(value)]}`;
export const monthLabel = (value: string) =>
  `${value.slice(0, 4)}年${Number(value.slice(5, 7))}月`;
export function clockMinutes(value: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))
    throw new Error("时间需要为 00:00–23:59");
  return Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
}
