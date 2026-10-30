import { clockMinutes, day } from "./dates";
export type Slot = string | null;
export interface ShiftFields {
  name: string;
  color: string;
  start: string;
  end: string;
  endOffset: number;
}
export interface Shift extends ShiftFields {
  id: string;
  archived: boolean;
}
export interface Rule {
  id: string;
  enabled: boolean;
  kind: "any" | "rest" | "shift";
  shiftId: string;
  weekdays: number[];
  from: string;
  until: string;
  offset: number;
  target: Slot;
}
export interface Rotation {
  anchor: string;
  cycle: Slot[];
  rules: Rule[];
  generatedThrough: string;
}
export interface Roster {
  id: string;
  name: string;
  enabled: string[];
  overrides: Record<string, ShiftFields>;
  entries: Record<string, Slot>;
  notes: Record<string, string>;
  rotation: Rotation | null;
}
export interface Workspace {
  version: 1;
  shifts: Shift[];
  rosters: Roster[];
}
export const uid = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (n) => n.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
export const palette = [
  "#8c9f63",
  "#c4a574",
  "#9caeb1",
  "#566b4c",
  "#a995ad",
  "#b98a7c",
  "#7c9c8c",
  "#7889b1",
];
export function newRoster(name: string, shifts: Shift[]): Roster {
  return {
    id: uid(),
    name,
    enabled: shifts.filter((s) => !s.archived).map((s) => s.id),
    overrides: {},
    entries: {},
    notes: {},
    rotation: null,
  };
}
export function emptyWorkspace(): Workspace {
  const shifts: Shift[] = [
    ["早班", "06:00", "14:00", 0],
    ["白班", "08:00", "16:00", 0],
    ["中班", "14:00", "22:00", 0],
    ["夜班", "22:00", "06:00", 1],
  ].map(([name, start, end, endOffset], i) => ({
    id: uid(),
    name: String(name),
    start: String(start),
    end: String(end),
    endOffset: Number(endOffset),
    color: palette[i],
    archived: false,
  }));
  return { version: 1, shifts, rosters: [] };
}
export function resolveShift(w: Workspace, r: Roster, id: Slot): Shift | null {
  if (id === null) return null;
  const s = w.shifts.find((s) => s.id === id);
  return s ? { ...s, ...r.overrides[id] } : null;
}
export const available = (w: Workspace, r: Roster) =>
  w.shifts
    .filter((s) => !s.archived && r.enabled.includes(s.id))
    .map((s) => resolveShift(w, r, s.id)!);
export const slotName = (w: Workspace, r: Roster, id: Slot) =>
  id === null ? "休息" : (resolveShift(w, r, id)?.name ?? "未知班次");
export function duration(s: ShiftFields | null): number {
  if (!s?.start || !s.end) return 0;
  const start = clockMinutes(s.start),
    end = clockMinutes(s.end);
  return end - start + 1440 * Math.max(s.endOffset, end <= start ? 1 : 0);
}
export const timeLabel = (s: ShiftFields | null) =>
  s?.start
    ? `${s.start} – ${s.endOffset === 1 ? "次日 " : s.endOffset > 1 ? `+${s.endOffset}天 ` : ""}${s.end}`
    : s
      ? "未设置时间"
      : "好好休息";
const record = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);
const idValid = (s: unknown): s is string =>
  typeof s === "string" && /^[a-zA-Z0-9-]{1,80}$/.test(s);
const text = (v: unknown, max: number) =>
  typeof v === "string" && v.length <= max;
export function validateShift(s: ShiftFields) {
  if (
    !s ||
    typeof s.name !== "string" ||
    !s.name.trim() ||
    s.name.length > 40 ||
    !/^#[0-9a-fA-F]{6}$/.test(s.color)
  )
    throw new Error("班次名称或颜色无效");
  if (!Number.isInteger(s.endOffset) || s.endOffset < 0 || s.endOffset > 7)
    throw new Error("班次最多延续到 +7 天");
  if (
    typeof s.start !== "string" ||
    typeof s.end !== "string" ||
    Boolean(s.start) !== Boolean(s.end)
  )
    throw new Error("请同时填写开始和结束时间，或同时留空");
  if (s.start) {
    const a = clockMinutes(s.start),
      b = clockMinutes(s.end);
    if (s.endOffset < (b <= a ? 1 : 0))
      throw new Error("结束时间需晚于开始时间，请增加结束日偏移");
  }
}
export function validateRotation(
  p: Rotation,
  known: Set<string>,
  usable?: Set<string>,
  range?: { start: string; end: string },
) {
  day(p.anchor);
  if (!Array.isArray(p.cycle) || !p.cycle.length || p.cycle.length > 366)
    throw new Error("循环需要 1–366 个位置");
  const slot = (id: unknown, active: boolean) => {
    if (
      id !== null &&
      (!idValid(id) || !known.has(id) || (active && usable && !usable.has(id)))
    )
      throw new Error("循环或规则引用了不可用班次，请启用或替换");
  };
  p.cycle.forEach((id) => slot(id, true));
  if (!Array.isArray(p.rules) || p.rules.length > 100)
    throw new Error("最多添加 100 条附加规则");
  const ids = new Set<string>();
  for (const rule of p.rules) {
    if (
      !rule ||
      !idValid(rule.id) ||
      ids.has(rule.id) ||
      typeof rule.enabled !== "boolean" ||
      !["any", "rest", "shift"].includes(rule.kind) ||
      !Number.isInteger(rule.offset) ||
      rule.offset < -31 ||
      rule.offset > 31
    )
      throw new Error("附加规则无效");
    ids.add(rule.id);
    slot(rule.target, rule.enabled);
    if (rule.kind === "shift") slot(rule.shiftId, rule.enabled);
    if (
      !Array.isArray(rule.weekdays) ||
      new Set(rule.weekdays).size !== rule.weekdays.length ||
      rule.weekdays.some((n) => !Number.isInteger(n) || n < 0 || n > 6)
    )
      throw new Error("规则星期无效");
    if (typeof rule.from !== "string" || typeof rule.until !== "string")
      throw new Error("规则日期无效");
    if (rule.from || rule.until) {
      day(rule.from);
      day(rule.until);
      if (rule.from > rule.until) throw new Error("规则日期范围无效");
    }
  }
  if (range) {
    day(range.start);
    day(range.end);
    if (
      range.start < p.anchor ||
      range.end < range.start ||
      day(range.end) - day(range.start) > 3659
    )
      throw new Error("生成范围需在锚点之后，且为 1–3660 天");
  }
}
export function validate(value: unknown): asserts value is Workspace {
  if (
    !record(value) ||
    value.version !== 1 ||
    !Array.isArray(value.shifts) ||
    value.shifts.length > 300 ||
    !Array.isArray(value.rosters) ||
    value.rosters.length > 50
  )
    throw new Error("数据格式或数量不受支持");
  const w = value as unknown as Workspace,
    shiftIds = new Set<string>(),
    rosterIds = new Set<string>();
  for (const s of w.shifts) {
    if (
      !s ||
      !idValid(s.id) ||
      shiftIds.has(s.id) ||
      typeof s.archived !== "boolean"
    )
      throw new Error("班次标识无效");
    validateShift(s);
    shiftIds.add(s.id);
  }
  for (const r of w.rosters) {
    if (
      !r ||
      !idValid(r.id) ||
      rosterIds.has(r.id) ||
      !text(r.name, 60) ||
      !r.name.trim() ||
      !record(r.entries) ||
      !record(r.notes) ||
      !record(r.overrides) ||
      !Array.isArray(r.enabled) ||
      new Set(r.enabled).size !== r.enabled.length ||
      r.enabled.some((id) => !shiftIds.has(id))
    )
      throw new Error("班表格式无效");
    rosterIds.add(r.id);
    if (
      Object.keys(r.entries).length > 60000 ||
      Object.keys(r.notes).length > 60000
    )
      throw new Error("班表记录过多");
    for (const [date, id] of Object.entries(r.entries)) {
      day(date);
      if (id !== null && !shiftIds.has(id))
        throw new Error("排班引用不存在的班次");
    }
    for (const [date, note] of Object.entries(r.notes)) {
      day(date);
      if (!text(note, 2000)) throw new Error("备注最多 2000 字");
    }
    for (const [id, s] of Object.entries(r.overrides)) {
      if (!shiftIds.has(id)) throw new Error("本表班次引用无效");
      validateShift(s);
    }
    if (r.rotation !== null) {
      validateRotation(r.rotation, shiftIds);
      day(r.rotation.generatedThrough);
    }
  }
}
