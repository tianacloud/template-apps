export interface Vehicle {
  id: string;
  name: string;
  model: string;
  plate: string;
  fuel: string;
  capacity: number;
  purchaseDate: string;
  archived: boolean;
}
export interface Fuel {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  liters: number;
  price: number;
  grossCents: number;
  paidCents: number;
  full: boolean;
  light: boolean;
  missed: boolean;
  grade: string;
  station: string;
  note: string;
}
export interface Category {
  id: string;
  name: string;
  kind: "expense" | "income";
  annual: boolean;
  color: string;
}
export interface Expense {
  id: string;
  vehicleId: string;
  date: string;
  categoryId: string;
  cents: number;
  note: string;
}
export interface Maintenance {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  title: string;
  cents: number;
  note: string;
  nextDate: string;
  nextOdometer: number;
}
export interface Workspace {
  version: 1;
  vehicles: Vehicle[];
  fuels: Fuel[];
  expenses: Expense[];
  maintenance: Maintenance[];
  categories: Category[];
}
export function uid() {
  const a = new Uint32Array(4);
  crypto.getRandomValues(a);
  return [...a].map((n) => n.toString(16).padStart(8, "0")).join("");
}
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function nowInput() {
  const d = new Date();
  return (
    today() +
    `T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  );
}
export function dayNumber(date: string) {
  return Date.parse(date.slice(0, 10) + "T00:00:00Z") / 86400000;
}
export function dateValid(s: unknown): s is string {
  if (
    typeof s !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(s) ||
    s < "1900-01-01" ||
    s > "2199-12-31"
  )
    return false;
  const n = dayNumber(s);
  return (
    Number.isFinite(n) &&
    new Date(n * 86400000).toISOString().slice(0, 10) === s
  );
}
export function ordered(f: Fuel[]) {
  return [...f].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  );
}
export function emptyWorkspace(): Workspace {
  return {
    version: 1,
    vehicles: [],
    fuels: [],
    expenses: [],
    maintenance: [],
    categories: [
      {
        id: "parking",
        name: "停车费",
        kind: "expense",
        annual: false,
        color: "#f3bb4b",
      },
      {
        id: "toll",
        name: "过路过桥",
        kind: "expense",
        annual: false,
        color: "#6f93dc",
      },
      {
        id: "wash",
        name: "洗车美容",
        kind: "expense",
        annual: false,
        color: "#5bb6b0",
      },
      {
        id: "insurance",
        name: "保险税费",
        kind: "expense",
        annual: true,
        color: "#a794d2",
      },
      {
        id: "other",
        name: "其他支出",
        kind: "expense",
        annual: false,
        color: "#9da7b2",
      },
      {
        id: "income",
        name: "用车收入",
        kind: "income",
        annual: false,
        color: "#409b71",
      },
    ],
  };
}
const text = (v: unknown, max = 1000) =>
  typeof v === "string" && v.length <= max;
const num = (v: unknown, max = 1e9) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max;
const money = (v: unknown) => num(v) && Number.isInteger(v);
export function validate(w: Workspace) {
  if (
    !w ||
    w.version !== 1 ||
    !["vehicles", "fuels", "expenses", "maintenance", "categories"].every((k) =>
      Array.isArray((w as any)[k]),
    )
  )
    throw Error("备份格式无效");
  const all = [
    ...w.vehicles,
    ...w.fuels,
    ...w.expenses,
    ...w.maintenance,
    ...w.categories,
  ];
  if (all.length > 20000) throw Error("最多支持20,000条数据");
  const ids = new Set<string>();
  for (const row of all) {
    if (!text(row?.id, 100) || !row.id || ids.has(row.id))
      throw Error("记录ID无效或重复");
    ids.add(row.id);
  }
  const cars = new Set(w.vehicles.map((v) => v.id)),
    cats = new Map(w.categories.map((c) => [c.id, c]));
  for (const v of w.vehicles)
    if (
      !text(v.name, 60) ||
      !v.name.trim() ||
      !text(v.model, 100) ||
      !text(v.plate, 30) ||
      !text(v.fuel, 30) ||
      !num(v.capacity, 1000) ||
      v.capacity === 0 ||
      !dateValid(v.purchaseDate) ||
      typeof v.archived !== "boolean"
    )
      throw Error("车辆信息无效");
  for (const c of w.categories)
    if (
      !text(c.name, 30) ||
      !c.name.trim() ||
      !["expense", "income"].includes(c.kind) ||
      typeof c.annual !== "boolean" ||
      (c.kind === "income" && c.annual) ||
      !/^#[a-f\d]{6}$/i.test(c.color)
    )
      throw Error("费用分类无效");
  for (const f of w.fuels) {
    if (
      !cars.has(f.vehicleId) ||
      !text(f.date, 16) ||
      !dateValid(f.date.slice(0, 10)) ||
      !/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(f.date) ||
      !num(f.odometer, 1e7) ||
      !num(f.liters, 1000) ||
      !f.liters ||
      !num(f.price, 100) ||
      !f.price ||
      !money(f.grossCents) ||
      !f.grossCents ||
      !money(f.paidCents) ||
      !text(f.note, 3000) ||
      !text(f.station, 200) ||
      !text(f.grade, 30) ||
      !["full", "light", "missed"].every(
        (k) => typeof (f as any)[k] === "boolean",
      )
    )
      throw Error("加油记录有无效的日期、金额、油量或车辆");
    if (Math.abs(f.grossCents - f.liters * f.price * 100) > 2)
      throw Error("油量、单价和挂牌金额不一致");
  }
  for (const v of w.vehicles) {
    const records = ordered(w.fuels.filter((f) => f.vehicleId === v.id));
    for (let i = 1; i < records.length; i++)
      if (
        records[i].date === records[i - 1].date ||
        records[i].odometer <= records[i - 1].odometer
      )
        throw Error("同一车辆的加油时间与总里程必须逐次递增，请核对前后记录");
  }
  for (const e of w.expenses)
    if (
      !cars.has(e.vehicleId) ||
      !dateValid(e.date) ||
      !cats.has(e.categoryId) ||
      !money(e.cents) ||
      !e.cents ||
      !text(e.note, 3000)
    )
      throw Error("费用记录无效");
  for (const m of w.maintenance)
    if (
      !cars.has(m.vehicleId) ||
      !dateValid(m.date) ||
      !num(m.odometer, 1e7) ||
      !text(m.title, 100) ||
      !m.title.trim() ||
      !money(m.cents) ||
      !text(m.note, 3000) ||
      !num(m.nextOdometer, 1e7) ||
      (m.nextDate && !dateValid(m.nextDate))
    )
      throw Error("保养记录无效");
  if (new TextEncoder().encode(JSON.stringify(w)).length > 6 * 1024 * 1024)
    throw Error("账本超过6MB，请先导出并整理");
}
export function parseBackup(text: string): Workspace {
  if (new TextEncoder().encode(text).length > 6 * 1024 * 1024)
    throw Error("备份文件超过6MB");
  let j;
  try {
    j = JSON.parse(text);
  } catch {
    throw Error("无法解析JSON备份");
  }
  const w = j.data ?? j;
  validate(w);
  return w;
}
