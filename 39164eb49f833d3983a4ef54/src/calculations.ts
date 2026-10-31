import {
  dayNumber,
  ordered,
  today,
  type Workspace,
  type Fuel,
  type Vehicle,
  type Category,
} from "./model";
export interface Trip {
  start: Fuel;
  end: Fuel;
  distance: number;
  rate: number | null;
  method: "full" | "light" | null;
  stage: boolean;
  cost: number | null;
  estimatedCost: boolean;
}
export function fuelStats(records: Fuel[]) {
  const rows = ordered(records),
    trips: Trip[] = rows
      .slice(0, -1)
      .map((start, i) => ({
        start,
        end: rows[i + 1],
        distance: rows[i + 1].odometer - start.odometer,
        rate: null,
        method: null,
        stage: false,
        cost: null,
        estimatedCost: false,
      }));
  let full = -1,
    light = -1,
    fullVolume = 0,
    lightVolume = 0;
  for (let i = 1; i < rows.length; i++) {
    const a = rows[i - 1],
      b = rows[i];
    if (b.missed || b.odometer <= a.odometer) {
      full = light = -1;
      fullVolume = lightVolume = 0;
      continue;
    }
    if (a.full) {
      full = i - 1;
      fullVolume = 0;
    }
    if (full >= 0) fullVolume += b.liters;
    if (a.light) {
      light = i - 1;
      lightVolume = 0;
    }
    if (light >= 0) lightVolume += a.liters;
    const index =
      b.full && full >= 0 ? full : b.light && light >= 0 ? light : -1;
    if (index < 0) continue;
    const method = b.full && full >= 0 ? "full" : "light";
    const volume = method === "full" ? fullVolume : lightVolume,
      distance = b.odometer - rows[index].odometer;
    if (distance <= 0) continue;
    const rate = (volume * 100) / distance;
    for (let k = index; k < i; k++)
      if (trips[k].rate === null) {
        trips[k].rate = rate;
        trips[k].method = method;
        trips[k].stage = i - index > 1;
      }
  }
  for (let i = 0; i < trips.length; i++) {
    const t = trips[i];
    if (t.rate === null) continue;
    let remaining = (t.rate * t.distance) / 100,
      cost = 0,
      lastPrice: number | null = null;
    for (let k = i; k >= 0 && remaining > 1e-8; k--) {
      const fuel = rows[k],
        amount = Math.min(fuel.liters, remaining),
        price = fuel.paidCents / 100 / fuel.liters;
      cost += amount * price;
      remaining -= amount;
      lastPrice = price;
    }
    if (remaining > 1e-8 && lastPrice !== null) {
      cost += remaining * lastPrice;
      t.estimatedCost = true;
    }
    t.cost = cost;
  }
  return {
    rows,
    trips,
    ...summarize(trips),
    distance: rows.length > 1 ? rows.at(-1)!.odometer - rows[0].odometer : 0,
    odometer: rows.at(-1)?.odometer ?? 0,
    liters: rows.reduce((s, f) => s + f.liters, 0),
    paid: rows.reduce((s, f) => s + f.paidCents, 0) / 100,
    savings: rows.reduce((s, f) => s + f.grossCents - f.paidCents, 0) / 100,
  };
}
export function summarize(trips: Trip[]) {
  const known = trips.filter((t) => t.rate !== null),
    knownDistance = known.reduce((s, t) => s + t.distance, 0),
    weighted = known.reduce((s, t) => s + t.rate! * t.distance, 0),
    consumed = weighted / 100,
    consumedCost = known.reduce((s, t) => s + (t.cost ?? 0), 0);
  return {
    knownDistance,
    average: knownDistance ? weighted / knownDistance : null,
    consumed,
    consumedCost,
    perKm: knownDistance ? consumedCost / knownDistance : null,
    recent: known.at(-1)?.rate ?? null,
    minimum: known.length ? Math.min(...known.map((t) => t.rate!)) : null,
    maximum: known.length ? Math.max(...known.map((t) => t.rate!)) : null,
  };
}
export function anniversary(date: string) {
  const [y, m, d] = date.split("-").map(Number),
    last = new Date(Date.UTC(y + 1, m, 0)).getUTCDate();
  return `${y + 1}-${String(m).padStart(2, "0")}-${String(Math.min(d, last)).padStart(2, "0")}`;
}
export interface CostRow {
  id: string;
  date: string;
  name: string;
  color: string;
  kind: "expense" | "income";
  cents: number;
  annual: boolean;
  source: "fuel" | "expense" | "maintenance";
  note: string;
}
export function costRows(w: Workspace, vehicleId: string): CostRow[] {
  const cats = new Map(w.categories.map((c) => [c.id, c]));
  return [
    ...w.fuels
      .filter((f) => f.vehicleId === vehicleId)
      .map((f) => ({
        id: f.id,
        date: f.date.slice(0, 10),
        name: "油费",
        color: "#21b67c",
        kind: "expense" as const,
        cents: f.paidCents,
        annual: false,
        source: "fuel" as const,
        note: f.station,
      })),
    ...w.expenses
      .filter((e) => e.vehicleId === vehicleId)
      .map((e) => {
        const c = cats.get(e.categoryId)!;
        return {
          id: e.id,
          date: e.date,
          name: c.name,
          color: c.color,
          kind: c.kind,
          cents: e.cents,
          annual: c.annual,
          source: "expense" as const,
          note: e.note,
        };
      }),
    ...w.maintenance
      .filter((m) => m.vehicleId === vehicleId)
      .map((m) => ({
        id: m.id,
        date: m.date,
        name: "维修保养",
        color: "#e2876f",
        kind: "expense" as const,
        cents: m.cents,
        annual: false,
        source: "maintenance" as const,
        note: m.title,
      })),
  ].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
// Boundaries are calendar days and the upper bound is exclusive.
export function recognizedCents(
  r: CostRow,
  from: string,
  toExclusive: string,
  mode: "cash" | "accrual",
) {
  const d = dayNumber(r.date),
    a = dayNumber(from),
    b = dayNumber(toExclusive);
  if (mode === "cash" || !r.annual) return d >= a && d < b ? r.cents : 0;
  const end = dayNumber(anniversary(r.date)),
    overlap = Math.max(0, Math.min(b, end) - Math.max(a, d));
  return (r.cents * overlap) / (end - d);
}
export function nextDay(date: string) {
  return new Date((dayNumber(date) + 1) * 86400000).toISOString().slice(0, 10);
}
export function monthAdd(month: string, offset: number) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + offset, 1)).toISOString().slice(0, 7);
}
export function costSummary(
  rows: CostRow[],
  from: string,
  to: string,
  mode: "cash" | "accrual",
) {
  const categories = new Map<
    string,
    { name: string; color: string; amount: number }
  >();
  let expense = 0,
    income = 0;
  for (const r of rows) {
    const value = recognizedCents(r, from, to, mode) / 100;
    if (r.kind === "income") income += value;
    else {
      expense += value;
      const c = categories.get(r.name) ?? {
        name: r.name,
        color: r.color,
        amount: 0,
      };
      c.amount += value;
      categories.set(r.name, c);
    }
  }
  return {
    expense,
    income,
    categories: [...categories.values()]
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount),
  };
}
export function dueMaintenance(
  w: Workspace,
  car: Vehicle,
  odometer: number,
  date = today(),
) {
  return w.maintenance
    .filter((m) => m.vehicleId === car.id && (m.nextDate || m.nextOdometer))
    .filter(
      (m) =>
        !w.maintenance.some(
          (n) =>
            n.vehicleId === car.id && n.title === m.title && n.date > m.date,
        ),
    )
    .map((m) => {
      const days = m.nextDate ? dayNumber(m.nextDate) - dayNumber(date) : null,
        km = m.nextOdometer ? m.nextOdometer - odometer : null;
      return {
        ...m,
        days,
        km,
        due: (days !== null && days <= 0) || (km !== null && km <= 0),
        soon: (days !== null && days <= 30) || (km !== null && km <= 1000),
      };
    })
    .filter((m) => m.soon)
    .sort((a, b) => Number(b.due) - Number(a.due));
}
export function csv(rows: (string | number)[][]) {
  return (
    "\ufeff" +
    rows
      .map((row) =>
        row
          .map((v) => {
            let s = String(v);
            if (typeof v === "string" && /^[\s]*[=+@-]/.test(s)) s = "'" + s;
            return '"' + s.replaceAll('"', '""') + '"';
          })
          .join(","),
      )
      .join("\r\n")
  );
}
