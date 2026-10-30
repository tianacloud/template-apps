import {
  addDays,
  dates,
  day,
  iso,
  monthEnd,
  moveMonth,
  weekDay,
} from "./dates";
import {
  available,
  duration,
  resolveShift,
  validate,
  validateRotation,
  type Roster,
  type Rotation,
  type Slot,
  type Workspace,
} from "./model";
export interface Match {
  ruleId: string;
  triggerDate: string;
  targetDate: string;
  shiftId: Slot;
}
export interface ProjectionDay {
  date: string;
  base: Slot;
  final: Slot;
  matches: Match[];
  conflict: boolean;
  change: "add" | "replace" | "clear" | "same";
}
export interface Preview {
  rosterId: string;
  plan: Rotation;
  start: string;
  end: string;
  days: ProjectionDay[];
  outside: Match[];
  source: "rotation" | "inferred";
  score?: number;
  fingerprint: string;
}
export function baseShift(p: Rotation, date: string): Slot {
  const n = day(date) - day(p.anchor);
  return p.cycle[((n % p.cycle.length) + p.cycle.length) % p.cycle.length];
}
export function project(
  p: Rotation,
  start: string,
  end: string,
): { days: Omit<ProjectionDay, "change">[]; outside: Match[] } {
  const known = new Set(p.cycle.filter((id): id is string => id !== null));
  for (const rule of p.rules) {
    if (rule.kind === "shift") known.add(rule.shiftId);
    if (rule.target !== null) known.add(rule.target);
  }
  validateRotation(p, known, undefined, { start, end });
  const a = day(start),
    b = day(end),
    anchor = day(p.anchor),
    matches = new Map<string, Match[]>(),
    outside: Match[] = [];
  for (const rule of p.rules) {
    if (!rule.enabled) continue;
    for (
      let n = Math.max(anchor, Math.min(a, a - rule.offset));
      n <= Math.max(b, b - rule.offset);
      n++
    ) {
      const trigger = iso(n),
        base = baseShift(p, trigger),
        targetN = n + rule.offset;
      if (
        (rule.from && (trigger < rule.from || trigger > rule.until)) ||
        (rule.weekdays.length && !rule.weekdays.includes(weekDay(trigger))) ||
        (rule.kind === "rest" && base !== null) ||
        (rule.kind === "shift" && base !== rule.shiftId) ||
        targetN < anchor
      )
        continue;
      const target = iso(targetN);
      const match = {
        ruleId: rule.id,
        triggerDate: trigger,
        targetDate: target,
        shiftId: rule.target,
      };
      if (targetN < a || targetN > b) {
        if (n >= a && n <= b) outside.push(match);
        continue;
      }
      const list = matches.get(target) ?? [];
      list.push(match);
      matches.set(target, list);
    }
  }
  return {
    days: dates(start, end).map((date) => {
      const all = matches.get(date) ?? [],
        base = baseShift(p, date);
      return {
        date,
        base,
        final: all.length ? all[0].shiftId : base,
        matches: all,
        conflict: new Set(all.map((m) => m.shiftId)).size > 1,
      };
    }),
    outside,
  };
}
export function previewRotation(
  w: Workspace,
  r: Roster,
  p: Rotation,
  start: string,
  end: string,
): Preview {
  validateRotation(
    p,
    new Set(w.shifts.map((s) => s.id)),
    new Set(available(w, r).map((s) => s.id)),
    { start, end },
  );
  const result = project(p, start, end);
  return {
    rosterId: r.id,
    plan: structuredClone(p),
    start,
    end,
    ...result,
    days: result.days.map((d) => ({
      ...d,
      change:
        d.final === null
          ? r.entries[d.date] != null
            ? "clear"
            : "same"
          : r.entries[d.date] === d.final
            ? "same"
            : r.entries[d.date] != null
              ? "replace"
              : "add",
    })),
    source: "rotation",
    fingerprint: JSON.stringify(w),
  };
}
export function applyPreview(w: Workspace, p: Preview): Workspace {
  if (JSON.stringify(w) !== p.fingerprint)
    throw new Error("预览后数据已变化，请重新预览");
  const next = structuredClone(w),
    r = next.rosters.find((r) => r.id === p.rosterId);
  if (!r) throw new Error("班表已不存在");
  for (const d of p.days) r.entries[d.date] = d.final;
  if (p.source === "rotation")
    r.rotation = {
      ...structuredClone(p.plan),
      generatedThrough:
        r.rotation?.generatedThrough && r.rotation.generatedThrough > p.end
          ? r.rotation.generatedThrough
          : p.end,
    };
  validate(next);
  return next;
}
export function detectCycle<T>(
  series: T[],
): { length: number; score: number; template: T[] } | null {
  let best = { length: 0, score: 0 };
  for (let k = 1; k <= Math.min(31, Math.floor(series.length / 2)); k++) {
    let same = 0;
    for (let i = k; i < series.length; i++)
      if (series[i] === series[i - k]) same++;
    const score = same / (series.length - k);
    if (score > best.score + 1e-9) best = { length: k, score };
  }
  return best.length && best.score >= 0.85
    ? { ...best, template: series.slice(-best.length) }
    : null;
}
export function sourceEnd(r: Roster) {
  return (
    [...Object.keys(r.entries), r.rotation?.generatedThrough ?? ""]
      .sort()
      .at(-1) ?? ""
  );
}
export function defaultExtendEnd(r: Roster) {
  const end = sourceEnd(r);
  return end ? monthEnd(moveMonth(end, 1)) : "";
}
export function previewExtend(w: Workspace, r: Roster, end: string): Preview {
  const last = sourceEnd(r);
  if (!last) throw new Error("请先排班或保存循环方案");
  if (day(end) <= day(last)) throw new Error("续排截止日必须晚于现有截止日");
  const start = addDays(last, 1);
  if (r.rotation) return previewRotation(w, r, r.rotation, start, end);
  const first = Object.keys(r.entries).sort()[0];
  const series = dates(first, last).map((d) =>
      Object.hasOwn(r.entries, d) ? r.entries[d] : undefined,
    ),
    cycle = detectCycle(series);
  if (!cycle) throw new Error("尚无稳定周期。请增加历史排班，或设置循环方案");
  const active = new Set(available(w, r).map((s) => s.id));
  if (cycle.template.some((id) => id != null && !active.has(id)))
    throw new Error("识别的周期中有不可用班次，请启用后重试");
  const days: ProjectionDay[] = dates(start, end).flatMap((date, i) => {
    const shift = cycle.template[i % cycle.length];
    return shift === undefined
      ? []
      : [
          {
            date,
            base: shift,
            final: shift,
            matches: [],
            conflict: false,
            change: shift === null ? "same" : "add",
          },
        ];
  });
  return {
    rosterId: r.id,
    plan: {
      anchor: start,
      cycle: cycle.template.map((id) => id ?? null),
      rules: [],
      generatedThrough: end,
    },
    start,
    end,
    days,
    outside: [],
    source: "inferred",
    score: cycle.score,
    fingerprint: JSON.stringify(w),
  };
}
export function statistics(
  w: Workspace,
  r: Roster,
  start: string,
  end: string,
) {
  let work = 0,
    minutes = 0;
  const counts = new Map<string, { count: number; minutes: number }>();
  for (const date of dates(start, end)) {
    const id = r.entries[date] ?? null,
      s = resolveShift(w, r, id);
    if (s) {
      work++;
      const span = duration(s);
      minutes += span;
      const item = counts.get(s.id) ?? { count: 0, minutes: 0 };
      item.count++;
      item.minutes += span;
      counts.set(s.id, item);
    }
  }
  return {
    work,
    rest: day(end) - day(start) + 1 - work,
    minutes,
    counts,
    total: day(end) - day(start) + 1,
  };
}
