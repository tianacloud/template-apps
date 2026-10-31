import type { Backup, Evaluation, Facts, Period, Snapshot } from './types';
import { ALGORITHM_VERSION } from './types';
import { object, parseAbsence, parseDaily, parsePeriod, parseSettings, sameBusiness, text, timestamp, validateFacts } from './domain/records';
import { parseLocalDate } from './domain/dates';
import type { FactPlan } from './commands';

export type ImportConflict = { key: string; title: string; existing: unknown; incoming: unknown };
export type ParsedImport = { backup: Backup; invalid: { title: string; message: string }[] };
export function parseBackup(raw: string, today: string): ParsedImport {
  const v = object(JSON.parse(raw));
  if (v.format !== 'zhiji' || v.formatVersion !== 1) throw new Error('请选择知己格式版本 1 的 JSON 备份。');
  const invalid: ParsedImport['invalid'] = [];
  function parseList<T>(key: string, parser: (x: unknown) => T, optional = false): T[] {
    if (v[key] === undefined && optional) return [];
    if (!Array.isArray(v[key])) throw new Error(`${key} 应为记录列表。`);
    const result: T[] = [];
    for (const [i, x] of (v[key] as unknown[]).entries()) try { result.push(parser(x)); }
      catch (error) { invalid.push({ title: `${key} 第 ${i + 1} 条`, message: (error as Error).message }); }
    return result;
  }
  const snapshots = parseList('predictionSnapshots', parseSnapshot, true);
  const backup: Backup = { format: 'zhiji', formatVersion: 1, exportedAt: timestamp(v.exportedAt),
    periods: parseList('periods', x => parsePeriod(x, today)), dailyLogs: parseList('dailyLogs', x => parseDaily(x, today)),
    absenceConfirmations: parseList('absenceConfirmations', x => parseAbsence(x, today)), predictionSnapshots: snapshots,
    predictionEvaluations: parseList('predictionEvaluations', parseEvaluation, true),
    settings: v.settings === undefined ? undefined : parseSettings(v.settings) };
  return { backup, invalid };
}
function parseEvaluation(value: unknown): Evaluation {
  const v = object(value);
  const snapshotId = text(v.snapshotId,'核实快照标识'), anchorPeriodId = text(v.anchorPeriodId,'核实锚点');
  if (typeof v.isBaseline !== 'boolean' || !['PENDING','EVALUATED','SKIPPED_GAP','INVALIDATED'].includes(String(v.status))
    || !Number.isInteger(v.factsRevision) || Number(v.factsRevision) < 0
    || (v.absoluteError !== null && (!Number.isInteger(v.absoluteError) || Number(v.absoluteError) < 0))) throw new Error('预测核实字段不完整。');
  if (v.targetDate !== null) parseLocalDate(text(v.targetDate,'核实目标日期'));
  if (v.targetPeriodId !== null) text(v.targetPeriodId,'核实目标标识');
  if (v.reason !== null) text(v.reason,'核实原因');
  return { ...v,snapshotId,anchorPeriodId,evaluatedAt: timestamp(v.evaluatedAt) } as Evaluation;
}
function parseSnapshot(value: unknown): Snapshot {
  const v = object(value), input = object(v.input), output = object(v.output), prediction = object(output.prediction);
  const anchorId = text(v.anchorPeriodId, '快照锚点');
  if (v.algorithmVersion !== ALGORITHM_VERSION || !['BASE','CONDITIONAL'].includes(String(v.kind))
    || !Number.isInteger(v.factsRevision) || Number(v.factsRevision) < 0 || input.anchorId !== anchorId
    || !Array.isArray(input.periods) || !Array.isArray(input.unknownDates) || !Array.isArray(input.lengths)
    || input.lengths.some(x => !Number.isInteger(x) || x <= 0) || input.lengths.length === 0 || input.lengths.length > 12
    || !Array.isArray(output.probabilities) || !prediction.centerDate) throw new Error('快照缺少完整的预测输入。');
  parseLocalDate(text(input.anchorDate, '快照起点')); parseLocalDate(text(prediction.centerDate, '预测中心'));
  for (const p of input.periods) { const row = object(p); text(row.id,'历史标识'); parseLocalDate(text(row.startDate,'历史日期')); if (typeof row.gapBefore !== 'boolean') throw new Error('快照漏记事实不完整。'); }
  for (const d of input.unknownDates) parseLocalDate(text(d,'出血日期'));
  timestamp(v.generatedAt); parseLocalDate(text(v.generatedLocalDate,'生成日期'));
  text(v.id,'快照标识');
  return { ...v, origin: 'BACKUP' } as Snapshot;
}
export function previewImport(parsed: ParsedImport, existing: Backup, decisions: Record<string, 'keep' | 'replace'> = {}) {
  const conflicts: ImportConflict[] = [], remap = new Map<string,string>();
  let added = 0, identical = 0;
  function merge<T>(rows: T[], incoming: T[], key: (x: T) => string, kind: string, sameId?: (a: T,b: T) => boolean) {
    let out = [...rows];
    for (const row of incoming) {
      const old = out.find(x => key(x) === key(row) || sameId?.(x,row));
      const conflictKey = kind + ':' + key(row);
      if (old && sameBusiness(old,row)) { identical++; continue; }
      if (old) {
        conflicts.push({ key: conflictKey, title: `${kind} · ${key(row)}`, existing: old, incoming: row });
        if (decisions[conflictKey] !== 'replace') continue;
        out = out.filter(x => x !== old);
      } else added++;
      out.push(old && typeof old === 'object' && old !== null && 'id' in old ? { ...row,id: old.id } : row);
    }
    return out;
  }
  const periods = merge(existing.periods, parsed.backup.periods, p => p.startDate, '经期', (a,b) => a.id === b.id);
  for (const p of parsed.backup.periods) {
    const resolved = periods.find(x => x.startDate === p.startDate) ?? periods.find(x => x.id === p.id);
    if (resolved) remap.set(p.id,resolved.id);
  }
  const dailyLogs = merge(existing.dailyLogs,parsed.backup.dailyLogs,d => d.date,'每日记录');
  const absences = parsed.backup.absenceConfirmations.map(a => ({ ...a,anchorPeriodId: remap.get(a.anchorPeriodId) ?? a.anchorPeriodId }));
  const absenceConfirmations = merge(existing.absenceConfirmations,absences,a => a.anchorPeriodId + '/' + a.throughDate,'尚未来经确认');
  const snapshots = [...(existing.predictionSnapshots ?? [])];
  const imported: Snapshot[] = [];
  for (const original of parsed.backup.predictionSnapshots ?? []) {
    const s: Snapshot = structuredClone(original);
    s.anchorPeriodId = remap.get(s.anchorPeriodId) ?? s.anchorPeriodId;
    s.input.anchorId = s.anchorPeriodId;
    s.input.periods = s.input.periods.map(p => ({ ...p,id: remap.get(p.id) ?? p.id }));
    s.output.prediction.anchorId = s.anchorPeriodId;
    s.output.prediction.input = s.input;
    const old = snapshots.find(x => x.id === s.id || (x.anchorPeriodId === s.anchorPeriodId && x.kind === s.kind && x.algorithmVersion === s.algorithmVersion && x.factsRevision === s.factsRevision));
    if (old) {
      if (JSON.stringify({ ...old,origin: 'BACKUP' }) !== JSON.stringify(s)) conflicts.push({ key: '快照:' + s.id,title: '不可变预测快照 · ' + s.id,existing: old,incoming: s });
      else identical++;
      continue;
    }
    imported.push(s); snapshots.push(s);
  }
  const facts: Facts = { periods,bleeding: dailyLogs.map(d => ({ date: d.date,bleedingType: d.bleedingType })),absences: absenceConfirmations };
  const before: Facts = { periods: existing.periods,bleeding: existing.dailyLogs.map(d => ({ date: d.date,bleedingType: d.bleedingType })),absences: existing.absenceConfirmations };
  const changedDays = dailyLogs.filter(d => !existing.dailyLogs.some(x => sameBusiness(x,d)));
  const importedIds = new Set(imported.map(s => s.id));
  const evaluations = (parsed.backup.predictionEvaluations ?? []).filter(e => importedIds.has(e.snapshotId)).map(e => ({ ...e,
    anchorPeriodId: remap.get(e.anchorPeriodId) ?? e.anchorPeriodId,targetPeriodId: e.targetPeriodId ? remap.get(e.targetPeriodId) ?? e.targetPeriodId : null,isBaseline: false }));
  const plan: FactPlan = { before,after: facts,days: changedDays,snapshots: imported,evaluations,
    settings: existing.periods.length === 0 && existing.dailyLogs.length === 0 ? parsed.backup.settings : undefined };
  return { added,identical,conflicts,plan };
}
export function validateImportPlan(plan: FactPlan, today: string) { validateFacts(plan.after,today); }
function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  return '"' + s.replace(/"/g,'""') + '"';
}
export function csvFiles(backup: Backup): { name: string; content: string }[] {
  function file(name: string, columns: string[], rows: Record<string, unknown>[]) {
    return { name,content: '\uFEFF' + [columns.map(csvCell).join(','),...rows.map(r => columns.map(c => csvCell(r[c])).join(','))].join('\r\n') + '\r\n' };
  }
  const columns = ['date','bleedingType','flowLevel','bloodColors','painScore','painLocations','symptoms','moods','sleepHours','sleepQuality','bowelRecorded','bowelCount','intimacyRecorded','intimacyCount','discharge','note'];
  return [file('zhiji-periods.csv',['id','startDate','endDate','gapBefore','note'],backup.periods),
    file('zhiji-daily.csv',columns,backup.dailyLogs.map(d => ({ ...d,bowelRecorded: d.bowelEvents !== null,bowelCount: d.bowelEvents?.length ?? null,
      intimacyRecorded: d.intimacyEvents !== null,intimacyCount: d.intimacyEvents?.length ?? null }))),
    file('zhiji-bowel.csv',['date','id','bristolType','straining','pain','note'],backup.dailyLogs.flatMap(d => (d.bowelEvents ?? []).map(e => ({ date: d.date,...e })))),
    file('zhiji-intimacy.csv',['date','id','protection','discomfort','bleedingAfter','note'],backup.dailyLogs.flatMap(d => (d.intimacyEvents ?? []).map(e => ({ date: d.date,...e }))))];
}
export function download(name: string, content: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content],{ type })), link = document.createElement('a');
  link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
}
