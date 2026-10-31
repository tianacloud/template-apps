import type { CycleObservation, DailyLog, Period } from '../types';
import { labels } from '../types';
import { addDays, daysBetween, mean, median, sampleStd } from './dates';
import { cyclePosition } from './cycles';

export function cycleStatistics(cycles: CycleObservation[], range: number) {
  const rows = cycles.filter(c => !c.exclusion).slice(-range), values = rows.map(c => c.length);
  return { rows, sampleCount: rows.length, mean: values.length ? mean(values) : null, std: sampleStd(values),
    min: values.length ? Math.min(...values) : null, max: values.length ? Math.max(...values) : null };
}
export function periodStatistics(periods: Period[], range: number) {
  const rows = [...periods].filter(p => p.endDate).sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(-range)
    .map(p => ({ ...p, length: daysBetween(p.startDate, p.endDate!) + 1 }));
  return { rows, sampleCount: rows.length, median: rows.length ? median(rows.map(p => p.length)) : null };
}
export type Distribution = { title: string; coveredDays: number; denominator: number; unit: string; counts: { label: string; count: number }[]; dates: string[] };
export function cycleBodyStatistics(periods: Period[], logs: DailyLog[], range: number) {
  const flows = periodStatistics(periods,range).rows.map(p => {
    const recorded = logs.filter(d => d.date >= p.startDate && d.date <= p.endDate! && d.flowLevel !== null);
    const counts = ['NONE','LIGHT','MEDIUM','HEAVY'].map(level => ({ label: labels[level],count: recorded.filter(d => d.flowLevel === level).length }));
    return { date: p.startDate,totalDays: p.length,coveredDays: recorded.length,counts,dates: recorded.map(d => d.date) };
  });
  const positions = logs.map(log => ({ log,position: cyclePosition(log.date,periods) })).filter(x => x.position);
  const colors = new Map<number,{ day: number;coveredDays: number;counts: Record<string,number>;dates: string[] }>();
  const pains = new Map<number,{ day: number;scores: number[];dates: string[];anchors: Set<string> }>();
  const painAnchors = new Set<string>();
  for (const {log,position} of positions) {
    if (log.bloodColors !== null) {
      const row = colors.get(position!.day) ?? { day: position!.day,coveredDays: 0,counts: {},dates: [] };
      row.coveredDays++; row.dates.push(log.date);
      for (const color of log.bloodColors) row.counts[color] = (row.counts[color] ?? 0) + 1;
      colors.set(row.day,row);
    }
    if (log.painScore !== null) {
      const row = pains.get(position!.day) ?? { day: position!.day,scores: [],dates: [],anchors: new Set<string>() };
      row.scores.push(log.painScore); row.dates.push(log.date); row.anchors.add(position!.anchorId); painAnchors.add(position!.anchorId); pains.set(row.day,row);
    }
  }
  return { flows,colors: [...colors.values()].sort((a,b) => a.day-b.day).map(r => ({ ...r,counts: Object.entries(r.counts).map(([key,count]) => ({ label: labels[key],count })) })),
    painAnchorCount: painAnchors.size,pains: painAnchors.size < 3 ? [] : [...pains.values()].sort((a,b) => a.day-b.day).map(r => ({ day: r.day,average: mean(r.scores),coveredDays: r.scores.length,coveredCycles: r.anchors.size,dates: r.dates })) };
}
export function dailyStatistics(logs: DailyLog[], start: string, end: string) {
  const rows = logs.filter(d => d.date >= start && d.date <= end);
  const distributions: Distribution[] = [];
  function categories(title: string, select: (d: DailyLog) => (string | number)[] | null, unit = '天') {
    const recorded = rows.filter(d => select(d) !== null), counts: Record<string, number> = {};
    for (const d of recorded) for (const key of select(d)!) counts[String(key)] = (counts[String(key)] ?? 0) + 1;
    distributions.push({ title, coveredDays: recorded.length, denominator: unit === '次' ? recorded.reduce((s, d) => s + select(d)!.length, 0) : recorded.length,
      unit, dates: recorded.map(d => d.date), counts: Object.entries(counts).map(([k, count]) => ({ label: labels[k] ?? k, count })) });
  }
  categories('出血量', d => d.flowLevel === null ? null : [d.flowLevel]);
  categories('出血颜色', d => d.bloodColors);
  categories('疼痛位置', d => d.painLocations);
  categories('身体感受', d => d.symptoms);
  categories('情绪', d => d.moods);
  categories('睡眠质量', d => d.sleepQuality === null ? null : [d.sleepQuality]);
  categories('便型', d => d.bowelEvents === null ? null : d.bowelEvents.filter(e => e.bristolType !== null).map(e => `Bristol ${e.bristolType} 型`), '次');
  categories('排便感受', d => d.bowelEvents === null ? null : d.bowelEvents.flatMap(e => [...(e.straining === true ? ['费力'] : []), ...(e.pain === true ? ['疼痛'] : [])]), '次');
  categories('爱爱感受', d => d.intimacyEvents === null ? null : d.intimacyEvents.flatMap(e => [...(e.discomfort === true ? ['不适'] : []), ...(e.bleedingAfter === true ? ['事后出血'] : [])]), '次');
  categories('白带情况', d => d.discharge === null ? null : [d.discharge.present ? '有' : '无']);
  categories('白带量', d => d.discharge?.present && d.discharge.amount !== null ? [d.discharge.amount] : null);
  categories('白带颜色', d => d.discharge?.present ? d.discharge.colors : null);
  categories('白带质地', d => d.discharge?.present ? d.discharge.textures : null);
  for (const [key, title] of [['odor','明显异味'],['itching','瘙痒'],['burning','灼热']] as const)
    categories(`白带 · ${title}`, d => d.discharge?.present && d.discharge[key] !== null ? [d.discharge[key] ? '有' : '无'] : null);
  const pain = rows.filter(d => d.painScore !== null), sleep = rows.filter(d => d.sleepHours !== null);
  const bowel = rows.filter(d => d.bowelEvents !== null), intimacy = rows.filter(d => d.intimacyEvents !== null);
  return { rows, totalDays: daysBetween(start, end) + 1, distributions,
    pain: { average: pain.length ? mean(pain.map(d => d.painScore!)) : null, rows: pain },
    sleep: { average: sleep.length ? mean(sleep.map(d => d.sleepHours!)) : null, rows: sleep },
    bowel: { count: bowel.reduce((s, d) => s + d.bowelEvents!.length, 0), days: bowel.length, rows: bowel },
    intimacy: { count: intimacy.reduce((s, d) => s + d.intimacyEvents!.length, 0), days: intimacy.length, rows: intimacy } };
}
export type Observation = { id: string; text: string; ranges: string[]; sampleCounts: number[]; sourceDates: string[] };
export function buildObservations(cycles: CycleObservation[], periods: Period[], logs: DailyLog[], today: string): Observation[] {
  const observations: Observation[] = [];
  const valid = cycles.filter(c => !c.exclusion), closed = periodStatistics(periods, 6).rows;
  for (const [id, title, rows] of [
    ['cycle', '周期', valid.slice(-6).map(c => ({ value: c.length, date: c.endDate }))],
    ['duration', '经期', closed.map(p => ({ value: p.length, date: p.startDate }))],
  ] as const) if (rows.length === 6) {
    const previous = rows.slice(0, 3), current = rows.slice(3), difference = mean(current.map(r => r.value)) - mean(previous.map(r => r.value));
    observations.push({ id, text: `最近 3 次${title}比此前 3 次平均${difference >= 0 ? '长' : '短'} ${Math.abs(difference).toFixed(1)} 天。`,
      ranges: [previous[0].date + ' 至 ' + previous[2].date, current[0].date + ' 至 ' + current[2].date], sampleCounts: [3,3], sourceDates: rows.map(r => r.date) });
  }
  const previousStart = addDays(today, -59), currentStart = addDays(today, -29), previousEnd = addDays(currentStart, -1);
  for (const [id, label, select, unit] of [
    ['pain','疼痛自评分',(d: DailyLog) => d.painScore,'分'], ['sleep','睡眠时长',(d: DailyLog) => d.sleepHours,'小时'],
    ['bowel','排便次数',(d: DailyLog) => d.bowelEvents === null ? null : d.bowelEvents.length,'次'],
  ] as const) {
    const a = logs.filter(d => d.date >= previousStart && d.date <= previousEnd && select(d) !== null);
    const b = logs.filter(d => d.date >= currentStart && d.date <= today && select(d) !== null);
    if (a.length >= 7 && b.length >= 7) observations.push({ id, text: `近 30 天已填日的${label}平均为 ${mean(b.map(d => select(d)!)).toFixed(1)} ${unit}，此前 30 天为 ${mean(a.map(d => select(d)!)).toFixed(1)} ${unit}。`,
      ranges: [previousStart + ' 至 ' + previousEnd, currentStart + ' 至 ' + today], sampleCounts: [a.length,b.length], sourceDates: [...a,...b].map(d => d.date) });
  }
  const positioned = logs.filter(d => d.painScore !== null).map(d => ({ log: d, position: cyclePosition(d.date, periods) })).filter(x => x.position);
  if (new Set(positioned.map(x => x.position!.anchorId)).size >= 3) {
    const group: Record<number, { scores: number[]; dates: string[] }> = {};
    for (const x of positioned) { const g = group[x.position!.day] ??= { scores: [], dates: [] }; g.scores.push(x.log.painScore!); g.dates.push(x.log.date); }
    const most = Object.entries(group).sort((a,b) => mean(b[1].scores) - mean(a[1].scores))[0];
    observations.push({ id: 'pain-position', text: `在已有疼痛记录中，周期第 ${most[0]} 天的平均自评分为 ${mean(most[1].scores).toFixed(1)} 分。未填写的周期日没有参与比较。`,
      ranges: [positioned[0].log.date + ' 至 ' + positioned.at(-1)!.log.date], sampleCounts: [most[1].scores.length], sourceDates: most[1].dates });
  }
  return observations;
}
