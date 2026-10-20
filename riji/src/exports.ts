import { DateTime } from 'luxon';
import { type Workspace, type Day, completionFor } from './model';
import { addDays } from './dates';

function csvCell(value: unknown) {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r]/.test(text)) text = "'" + text;
  return `"${text.replaceAll('"','""')}"`;
}
export function exportCsv(s: Workspace, from: Day, to: Day) {
  const rows = [['日期','事项','项目','模块','计划分钟','实际分钟','状态','开始','结束','截止','备注']];
  for (const e of s.entries.filter(e => e.date && e.date >= from && e.date <= to)) {
    const c = completionFor(s,e);
    rows.push([e.date!,e.title,s.projects.find(p => p.id === e.projectId)?.name ?? '',
      s.modules.find(m => m.id === e.moduleId)?.name ?? '',String(c?.planned ?? e.minutes),
      c?.actual == null ? '' : String(c.actual),e.done ? '已完成' : '待完成',e.start,e.end,e.due ?? '',e.notes]);
  }
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
const escapeIcs = (text: string) => text.replaceAll('\\','\\\\').replace(/\r?\n/g,'\\n').replaceAll(';','\\;').replaceAll(',','\\,');
export function foldIcs(line: string) {
  const encoder = new TextEncoder();
  let current = '', count = 0;
  const parts: string[] = [];
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    if (count + bytes > 75) {parts.push(current); current = ' '; count = 1;}
    current += char; count += bytes;
  }
  parts.push(current);
  return parts.join('\r\n');
}
export function exportIcs(s: Workspace, from: Day, to: Day, now = DateTime.utc()) {
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Riji//Personal Planner//ZH','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
  for (const e of s.entries.filter(e => e.date && e.date >= from && e.date <= to)) {
    lines.push('BEGIN:VEVENT',`UID:${e.id}@riji`, `DTSTAMP:${now.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")}`);
    if (e.start && e.end) {
      const begin = DateTime.fromISO(`${e.date}T${e.start}`,{zone:s.settings.timeZone});
      const end = DateTime.fromISO(`${e.date}T${e.end}`,{zone:s.settings.timeZone});
      if (!begin.isValid || !end.isValid) throw new Error('事项时间无法导出');
      lines.push(`DTSTART:${begin.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")}`,`DTEND:${end.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")}`);
    } else lines.push(`DTSTART;VALUE=DATE:${e.date!.replaceAll('-','')}`,`DTEND;VALUE=DATE:${addDays(e.date!,1).replaceAll('-','')}`);
    const project = s.projects.find(p => p.id === e.projectId);
    lines.push(`SUMMARY:${escapeIcs(e.title)}`,`DESCRIPTION:${escapeIcs([project?.name,e.notes,e.done ? '已完成' : '待完成'].filter(Boolean).join('\n'))}`,'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldIcs).join('\r\n') + '\r\n';
}
export function download(text: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([text],{type}));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url),30000);
}
