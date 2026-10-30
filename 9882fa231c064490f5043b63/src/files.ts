import { addDays, dates, day } from "./dates";
import {
  newRoster,
  palette,
  resolveShift,
  uid,
  validate,
  validateShift,
  type Roster,
  type Workspace,
} from "./model";
export function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
const csvCell = (value: string) =>
  '"' +
  (/^[\s]*[=+\-@]/.test(value) || value.startsWith("'")
    ? "'" + value
    : value
  ).replaceAll('"', '""') +
  '"';
export function exportCsv(w: Workspace, r: Roster, start: string, end: string) {
  const rows = [
    ["date", "shift", "start", "end", "end_offset", "color", "note"],
  ];
  for (const date of dates(start, end)) {
    const id = r.entries[date] ?? null,
      s = resolveShift(w, r, id);
    rows.push([
      date,
      s?.name ?? "休息",
      s?.start ?? "",
      s?.end ?? "",
      String(s?.endOffset ?? 0),
      s?.color ?? "",
      r.notes[date] ?? "",
    ]);
  }
  return "\ufeff" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false,
    afterQuote = false;
  text = text.replace(/^\ufeff/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
          afterQuote = true;
        }
      } else cell += c;
      continue;
    }
    if (c === '"') {
      if (cell || afterQuote) throw new Error("CSV 引号位置无效");
      quoted = true;
      continue;
    }
    if (c === "," || c === "\n" || c === "\r") {
      row.push(cell);
      cell = "";
      afterQuote = false;
      if (c !== ",") {
        rows.push(row);
        row = [];
        if (c === "\r" && text[i + 1] === "\n") i++;
      }
      continue;
    }
    if (afterQuote) throw new Error("CSV 引号后有多余内容");
    cell += c;
  }
  if (quoted) throw new Error("CSV 引号未闭合");
  if (cell || row.length || afterQuote) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((row) => row.some((x) => x.length));
}
export function importCsv(w: Workspace, text: string, name: string): Workspace {
  if (new TextEncoder().encode(text).length > 5 * 1024 * 1024)
    throw new Error("CSV 文件最多 5 MB");
  const rows = parseCsv(text),
    header = rows.shift();
  if (
    !header ||
    header[0] !== "date" ||
    header[1] !== "shift" ||
    header.length !== new Set(header).size
  )
    throw new Error(
      "CSV 需要 date,shift 表头；可选 start,end,end_offset,color,note",
    );
  if (rows.length > 60000 || !rows.length)
    throw new Error("CSV 需要 1–60000 条记录");
  const next = structuredClone(w),
    r = newRoster(name.trim() || "导入的班表", next.shifts);
  const unprotect = (v: string) =>
    v.startsWith("''") || /^'[\s]*[=+\-@]/.test(v) ? v.slice(1) : v;
  for (const [index, values] of rows.entries()) {
    if (values.length !== header.length)
      throw new Error(`CSV 第 ${index + 2} 行列数不一致`);
    const item = Object.fromEntries(
        header.map((h, i) => [h, unprotect(values[i])]),
      ),
      date = item.date;
    day(date);
    if (Object.hasOwn(r.entries, date))
      throw new Error(`CSV 日期重复：${date}`);
    if (!item.shift.trim() || item.shift === "休息") {
      r.entries[date] = null;
    } else {
      const existing = next.shifts.find(
        (s) => s.name === item.shift && !s.archived,
      );
      if (existing) {
        if (
          item.start !== undefined &&
          (item.start !== existing.start ||
            item.end !== existing.end ||
            Number(item.end_offset ?? existing.endOffset) !==
              existing.endOffset)
        )
          throw new Error(
            `班次「${item.shift}」时间与班次库不同，请改名后导入`,
          );
        r.entries[date] = existing.id;
      } else {
        const start = item.start ?? "",
          end = item.end ?? "";
        const offset =
          item.end_offset !== undefined
            ? Number(item.end_offset)
            : start && end && end <= start
              ? 1
              : 0;
        const shift = {
          id: uid(),
          name: item.shift,
          color: item.color || palette[next.shifts.length % palette.length],
          start,
          end,
          endOffset: offset,
          archived: false,
        };
        validateShift(shift);
        next.shifts.push(shift);
        r.enabled.push(shift.id);
        r.entries[date] = shift.id;
      }
    }
    if (item.note) r.notes[date] = item.note;
  }
  next.rosters.push(r);
  validate(next);
  return next;
}
export function importJson(text: string): Workspace {
  if (new TextEncoder().encode(text).length > 5 * 1024 * 1024)
    throw new Error("JSON 文件最多 5 MB");
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("JSON 格式无效");
  }
  validate(value);
  return value;
}
const icsEscape = (s: string) =>
  s
    .replaceAll("\\", "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
export function foldLine(line: string) {
  const lines: string[] = [];
  let current = "";
  for (const c of line) {
    if (new TextEncoder().encode(current + c).length > 75) {
      lines.push(current);
      current = " ";
    }
    current += c;
  }
  lines.push(current);
  return lines.join("\r\n");
}
export function exportIcs(
  w: Workspace,
  r: Roster,
  start: string,
  end: string,
  now = new Date(),
) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Qingban//Personal Calendar//ZH",
    "CALSCALE:GREGORIAN",
  ];
  for (const date of dates(start, end)) {
    const shift = resolveShift(w, r, r.entries[date] ?? null);
    if (!shift) continue;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${r.id}-${date}@qingban`,
      `DTSTAMP:${now
        .toISOString()
        .replaceAll("-", "")
        .replaceAll(":", "")
        .replace(/\.\d{3}/, "")}`,
    );
    if (shift.start)
      lines.push(
        `DTSTART:${date.replaceAll("-", "")}T${shift.start.replace(":", "")}00`,
        `DTEND:${addDays(date, shift.endOffset).replaceAll("-", "")}T${shift.end.replace(":", "")}00`,
      );
    else
      lines.push(
        `DTSTART;VALUE=DATE:${date.replaceAll("-", "")}`,
        `DTEND;VALUE=DATE:${addDays(date, 1).replaceAll("-", "")}`,
      );
    lines.push(
      "SUMMARY:" + icsEscape(shift.name),
      "DESCRIPTION:" + icsEscape(r.notes[date] ?? ""),
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
