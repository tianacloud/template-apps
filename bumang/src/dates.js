const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export const pad = (n) => String(n).padStart(2, "0");
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => iso(new Date());
export const isDay = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? "") && iso(parse(value)) === value;

export function parse(day) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function addDays(day, n) {
  const d = parse(day);
  d.setDate(d.getDate() + n);
  return iso(d);
}
// Weeks start on Monday.
export function weekStart(day) {
  const d = parse(day);
  return addDays(day, -((d.getDay() + 6) % 7));
}
export const weekday = (day) => "周" + WEEKDAYS[parse(day).getDay()];
export const dayNumber = (day) => parse(day).getDate();
export const monthLabel = (day) => {
  const d = parse(day);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
};
export function dayLabel(day) {
  const offset = Math.round((parse(day) - parse(today())) / 86400000);
  if (offset === 0) return "今天";
  if (offset === 1) return "明天";
  if (offset === -1) return "昨天";
  const d = parse(day);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
export const clock = (minute) => `${pad(Math.floor(minute / 60))}:${pad(minute % 60)}`;
export function parseClock(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value ?? "");
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}
export function duration(minutes) {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return [h && `${h}小时`, m && `${m}分钟`].filter(Boolean).join("") || "0分钟";
}
export function nowMinute() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
