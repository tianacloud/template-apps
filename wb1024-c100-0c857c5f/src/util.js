/** util.js — 视图共用的零散工具 */

export function dayGreeting() {
  const h = new Date().getHours();
  if (h < 6) return '夜深了，还在看客户';
  if (h < 11) return '早安，今天的面诊排好了吗';
  if (h < 14) return '午间，先把待办过一遍';
  if (h < 18) return '下午好，面诊结束后记得录记录';
  return '晚上好，今天的数据今天录';
}

/** 客户年龄段，用于列表分组 */
export function ageBand(age) {
  if (!age) return '未填';
  if (age < 30) return '25–29';
  if (age < 35) return '30–34';
  if (age < 40) return '35–39';
  if (age < 46) return '40–45';
  return '46+';
}

/** 按维度取分数的文字评价，避免直接展示「32 分」这种无意义数字 */
export function scoreWord(score) {
  if (score === null || score === undefined) return '未记录';
  if (score >= 80) return '良好';
  if (score >= 65) return '基本稳定';
  if (score >= 50) return '偏弱';
  return '需要处理';
}

/** 数值区间裁剪 */
export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/** 生成简单 ID，视图层临时用 */
export function tmpId(prefix = 'tmp') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** 从 ISO 生成 <input type="date"> 需要的值 */
export function dateInputValue(iso) {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return new Date(iso).toISOString().slice(0, 10);
}

/** 按天偏移生成日期字符串 */
export function addDays(days, from = new Date()) {
  const d = new Date(from.getTime() + days * 86400000);
  return d.toISOString().slice(0, 10);
}
