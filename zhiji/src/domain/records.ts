import type { AbsenceConfirmation, BleedingFact, DailyLog, Facts, Period, Settings } from '../types';
import { groups } from '../types';
import { addDays, parseLocalDate } from './dates';

export const options = {
  bleedingType: ['NONE', 'MENSTRUATION', 'SPOTTING', 'UNKNOWN'], flowLevel: ['NONE', 'LIGHT', 'MEDIUM', 'HEAVY'],
  bloodColors: ['PINK', 'RED', 'DARK_RED', 'BROWN', 'OTHER'], painLocations: ['ABDOMEN', 'BACK', 'HEAD', 'BREAST', 'OTHER'],
  symptoms: ['BLOATING', 'BREAST_TENDERNESS', 'HEADACHE', 'FATIGUE', 'BACKACHE', 'NAUSEA', 'ACNE', 'OTHER'],
  moods: ['CALM', 'HAPPY', 'LOW', 'ANXIOUS', 'IRRITABLE', 'OTHER'], sleepQuality: ['POOR', 'FAIR', 'GOOD'],
  dischargeColors: ['CLEAR', 'WHITE', 'YELLOW', 'GREEN', 'BLOODY', 'OTHER'],
  dischargeTextures: ['THIN', 'WATERY', 'STICKY', 'STRETCHY', 'CLUMPY', 'OTHER'],
};
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('记录格式不正确。');
  return value as Record<string, unknown>;
}
export function text(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value) throw new Error(`${field}不能为空。`);
  return value;
}
export function optionalText(value: unknown): string | null {
  if (value === null || value === '') return null;
  if (typeof value !== 'string') throw new Error('文字字段格式不正确。');
  return value;
}
export function bool(value: unknown): boolean { if (typeof value !== 'boolean') throw new Error('请选择有或没有。'); return value; }
const nullableBool = (v: unknown) => v === null ? null : bool(v);
function enumeration(value: unknown, allowed: readonly string[]): any {
  if (value === null) return null;
  if (typeof value !== 'string' || !allowed.includes(value)) throw new Error('记录包含无法识别的选项。');
  return value;
}
function tags(value: unknown, allowed: readonly string[]): string[] | null {
  if (value === null) return null;
  if (!Array.isArray(value) || value.some(v => typeof v !== 'string' || !allowed.includes(v)) || new Set(value).size !== value.length)
    throw new Error('记录包含无法识别或重复的标签。');
  return [...value];
}
function number(value: unknown, min: number, max: number, integer = false): number | null {
  if (value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value)))
    throw new Error(`数值应在 ${min}～${max} 之间${integer ? '，并填写整数' : ''}。`);
  return value;
}
export function timestamp(value: unknown): string {
  const v = text(value, '记录时间');
  if (!Number.isFinite(Date.parse(v))) throw new Error('记录时间格式不正确。');
  return v;
}
export function factDate(value: unknown, today: string): string {
  const date = parseLocalDate(text(value, '日期'));
  if (date > today) throw new Error('实际记录不能填写未来日期。');
  return date;
}
export function parsePeriod(value: unknown, today: string): Period {
  const v = object(value);
  const p: Period = { id: text(v.id, '经期标识'), startDate: factDate(v.startDate, today),
    endDate: v.endDate === null ? null : factDate(v.endDate, today), gapBefore: bool(v.gapBefore),
    note: optionalText(v.note), source: enumeration(v.source, ['USER', 'IMPORT']),
    createdAt: timestamp(v.createdAt), updatedAt: timestamp(v.updatedAt) };
  if (!p.source) throw new Error('经期来源不能为空。');
  if (p.endDate && p.endDate < p.startDate) throw new Error('结束日期不能早于开始日期。');
  return p;
}
export function emptyDay(date: string): DailyLog {
  const now = new Date().toISOString();
  return { date, bleedingType: null, flowLevel: null, bloodColors: null, painScore: null, painLocations: null,
    symptoms: null, moods: null, sleepHours: null, sleepQuality: null, bowelEvents: null,
    intimacyEvents: null, discharge: null, note: null, createdAt: now, updatedAt: now };
}
export function parseDaily(value: unknown, today: string): DailyLog {
  const v = object(value);
  const events = <T>(data: unknown, parse: (x: Record<string, unknown>) => T): T[] | null => {
    if (data === null) return null;
    if (!Array.isArray(data)) throw new Error('事件列表格式不正确。');
    const result = data.map(x => parse(object(x)));
    const ids = result.map(x => (x as { id: string }).id);
    if (new Set(ids).size !== ids.length) throw new Error('同一天的事件标识重复。');
    return result;
  };
  const d = v.discharge === null ? null : object(v.discharge);
  const discharge = d ? { present: bool(d.present), amount: enumeration(d.amount, ['LIGHT', 'MEDIUM', 'HEAVY']),
    colors: tags(d.colors, options.dischargeColors), textures: tags(d.textures, options.dischargeTextures),
    odor: nullableBool(d.odor), itching: nullableBool(d.itching), burning: nullableBool(d.burning) } : null;
  if (discharge && !discharge.present && Object.entries(discharge).some(([k, x]) => k !== 'present' && x !== null))
    throw new Error('选择无白带时，请清空白带观察属性。');
  return { date: factDate(v.date, today), bleedingType: enumeration(v.bleedingType, options.bleedingType),
    flowLevel: enumeration(v.flowLevel, options.flowLevel), bloodColors: tags(v.bloodColors, options.bloodColors),
    painScore: number(v.painScore, 0, 10, true), painLocations: tags(v.painLocations, options.painLocations),
    symptoms: tags(v.symptoms, options.symptoms), moods: tags(v.moods, options.moods), sleepHours: number(v.sleepHours, 0, 24),
    sleepQuality: enumeration(v.sleepQuality, options.sleepQuality),
    bowelEvents: events(v.bowelEvents, x => ({ id: text(x.id, '事件标识'), bristolType: number(x.bristolType, 1, 7, true),
      straining: nullableBool(x.straining), pain: nullableBool(x.pain), note: optionalText(x.note) })),
    intimacyEvents: events(v.intimacyEvents, x => ({ id: text(x.id, '事件标识'), protection: enumeration(x.protection, ['YES', 'NO', 'UNSURE']),
      discomfort: nullableBool(x.discomfort), bleedingAfter: nullableBool(x.bleedingAfter), note: optionalText(x.note) })),
    discharge, note: optionalText(v.note), createdAt: timestamp(v.createdAt), updatedAt: timestamp(v.updatedAt) };
}
export function parseAbsence(value: unknown, today: string): AbsenceConfirmation {
  const v = object(value);
  return { id: text(v.id, '确认标识'), anchorPeriodId: text(v.anchorPeriodId, '经期标识'),
    throughDate: factDate(v.throughDate, addDays(today, -1)), createdAt: timestamp(v.createdAt) };
}
export function parseSettings(value: unknown): Settings {
  const v = object(value);
  return { hiddenGroups: tags(v.hiddenGroups ?? [], groups.map(g => g[0]))! };
}
export function coveringPeriod(date: string, periods: Period[]): Period | undefined {
  return periods.find(p => p.startDate <= date && (!p.endDate || date <= p.endDate));
}
export function validatePeriods(periods: Period[], today: string): void {
  const sorted = periods.map(p => parsePeriod(p, today)).sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (new Set(sorted.map(p => p.id)).size !== sorted.length) throw new Error('经期标识重复。');
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1], next = sorted[i];
    if (!prev.endDate || next.startDate <= prev.endDate)
      throw new Error(`与 ${prev.startDate} 开始的经期重叠${!prev.endDate ? '，请先填写其结束日期' : ''}。`);
  }
}
export function validateFacts(facts: Facts, today: string): void {
  validatePeriods(facts.periods, today);
  for (const b of facts.bleeding) {
    const period = coveringPeriod(b.date, facts.periods);
    if (b.bleedingType === 'MENSTRUATION' && !period) throw new Error(`${b.date} 的月经记录需要所属经期。`);
    if (period && (b.bleedingType === 'SPOTTING' || b.bleedingType === 'UNKNOWN')) throw new Error(`${b.date} 的出血性质与经期范围冲突，请核实。`);
  }
  const keys = new Set<string>();
  for (const a of facts.absences) {
    parseAbsence(a, today);
    const anchor = facts.periods.find(p => p.id === a.anchorPeriodId);
    if (!anchor || a.throughDate < anchor.startDate) throw new Error('尚未来经确认缺少对应的周期起点。');
    const next = facts.periods.filter(p => p.startDate > anchor.startDate).sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
    if (next && a.throughDate >= next.startDate) throw new Error(`截至 ${a.throughDate} 的尚未来经确认与 ${next.startDate} 的经期冲突。`);
    const key = a.anchorPeriodId + '/' + a.throughDate;
    if (keys.has(key)) throw new Error('同一周期同一日期的确认重复。');
    keys.add(key);
  }
}
export type RelationIssue =
  | { kind: 'GAP'; id: string; beforeDate: string; afterDate: string }
  | { kind: 'BLEEDING'; date: string; inside: boolean; current: BleedingFact['bleedingType'] }
  | { kind: 'ABSENCE'; id: string; throughDate: string };
export function relationIssues(before: Facts, after: Facts, editedId?: string): RelationIssue[] {
  const issues: RelationIssue[] = [];
  const old = [...before.periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const next = [...after.periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  for (let i = 1; i < next.length; i++) {
    const current = next[i], previous = next[i - 1];
    const oldIndex = old.findIndex(p => p.id === current.id);
    if (oldIndex >= 0 && old[oldIndex - 1]?.id !== previous.id && current.id !== editedId)
      issues.push({ kind: 'GAP', id: current.id, beforeDate: previous.startDate, afterDate: current.startDate });
  }
  for (const b of after.bleeding) {
    const inside = !!coveringPeriod(b.date, after.periods);
    if ((b.bleedingType === 'MENSTRUATION' && !inside) || (inside && (b.bleedingType === 'UNKNOWN' || b.bleedingType === 'SPOTTING')))
      issues.push({ kind: 'BLEEDING', date: b.date, inside, current: b.bleedingType });
  }
  for (const a of after.absences) {
    const anchor = next.find(p => p.id === a.anchorPeriodId);
    if (!anchor) continue;
    const target = next.find(p => p.startDate > anchor.startDate);
    if (a.throughDate < anchor.startDate || (target && a.throughDate >= target.startDate))
      issues.push({ kind: 'ABSENCE', id: a.id, throughDate: a.throughDate });
  }
  return issues;
}
export function sameBusiness(a: unknown, b: unknown): boolean {
  const normalize = (v: any): any => {
    if (Array.isArray(v)) return v.map(normalize);
    if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().filter(k => !['id', 'createdAt', 'updatedAt', 'source'].includes(k)).map(k => [k, normalize(v[k])]));
    return v;
  };
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}
