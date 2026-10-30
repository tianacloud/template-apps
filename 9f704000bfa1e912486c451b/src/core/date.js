// core/date.js
// 本地时区日期工具。所有「今天」比较都用本地 YYYY-MM-DD 字符串，避免 UTC 偏差。

// 本地日期 -> "YYYY-MM-DD"
export function localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// "YYYY-MM-DD" -> Date（本地零点）
export function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// 两个本地日期字符串相差天数（b - a，按本地日界）
export function daysBetween(aStr, bStr) {
  const a = parseDate(aStr).getTime();
  const b = parseDate(bStr).getTime();
  return Math.round((b - a) / 86400000);
}

// 返回 str 的前一天（本地）
export function yesterday(str) {
  const d = parseDate(str);
  d.setDate(d.getDate() - 1);
  return localDateStr(d);
}

// 返回 str 的后一天（本地）
export function tomorrow(str) {
  const d = parseDate(str);
  d.setDate(d.getDate() + 1);
  return localDateStr(d);
}
