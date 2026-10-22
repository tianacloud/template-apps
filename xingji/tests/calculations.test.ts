import test from "node:test";
import assert from "node:assert/strict";
import {
  fuelStats,
  anniversary,
  recognizedCents,
  csv,
  type CostRow,
} from "../src/calculations";
import { emptyWorkspace, validate, parseBackup, type Fuel } from "../src/model";
import { sampleWorkspace } from "../src/sample";
function fuel(
  i: number,
  odo: number,
  liters: number,
  extra: Partial<Fuel> = {},
): Fuel {
  return {
    id: "f" + i,
    vehicleId: "car",
    date: `2026-01-${String(i + 1).padStart(2, "0")}T09:00`,
    odometer: odo,
    liters,
    price: 8,
    grossCents: liters * 800,
    paidCents: liters * 700,
    full: true,
    light: false,
    missed: false,
    grade: "92# 汽油",
    station: "",
    note: "",
    ...extra,
  };
}
test("full tank uses next fill, trip belongs to the beginning and newest remains pending", () => {
  const s = fuelStats([fuel(0, 10000, 40), fuel(1, 10500, 35)]);
  assert.equal(s.average, 7);
  assert.equal(s.trips.length, 1);
  assert.equal(s.trips[0].start.id, "f0");
  assert.equal(s.consumed, 35);
  assert.equal(s.paid, 525);
  assert.equal(s.consumedCost, 245);
  assert.equal(s.perKm, 0.49);
});
test("partial fills accumulate, excluding opening full fill and including closing fill", () => {
  const s = fuelStats([
    fuel(0, 10000, 40),
    fuel(1, 10200, 10, { full: false }),
    fuel(2, 10500, 25),
  ]);
  assert.equal(s.average, 7);
  assert.deepEqual(
    s.trips.map((t) => t.rate),
    [7, 7],
  );
  assert.ok(s.trips.every((t) => t.stage));
});
test("warning-light method includes opening fuel, excludes closing fuel", () => {
  const s = fuelStats([
    fuel(0, 10000, 20, { full: false, light: true }),
    fuel(1, 10400, 30, { full: false, light: true }),
  ]);
  assert.equal(s.average, 5);
  assert.equal(s.trips[0].method, "light");
});
test("full method wins if both full and light conditions close together", () => {
  const s = fuelStats([
    fuel(0, 10000, 20, { light: true }),
    fuel(1, 10400, 30, { light: true }),
  ]);
  assert.equal(s.average, 7.5);
  assert.equal(s.trips[0].method, "full");
});
test("missed fuel breaks previous stage and starts a fresh anchor", () => {
  const s = fuelStats([
    fuel(0, 10000, 40),
    fuel(1, 10500, 35, { missed: true }),
    fuel(2, 11000, 30),
  ]);
  assert.equal(s.trips[0].rate, null);
  assert.equal(s.trips[1].rate, 6);
  assert.equal(s.knownDistance, 500);
  assert.equal(s.average, 6);
});
test("unknown segments are excluded; average is weighted by distance", () => {
  const s = fuelStats([
    fuel(0, 10000, 40),
    fuel(1, 10500, 35),
    fuel(2, 11500, 90),
  ]);
  assert.equal(s.average, (7 * 500 + 9 * 1000) / 1500);
  assert.equal(fuelStats([fuel(0, 10000, 40)]).average, null);
  assert.equal(fuelStats([]).perKm, null);
});
test("a stage cannot overwrite an interval that already has a valid rate", () => {
  const s = fuelStats([
    fuel(0, 10000, 40),
    fuel(1, 10200, 10, { full: false }),
    fuel(2, 10400, 20, { full: false, light: true }),
    fuel(3, 10600, 30, { full: false, light: true }),
    fuel(4, 11000, 20),
  ]);
  assert.equal(s.trips[2].rate, 10);
  assert.equal(s.trips[0].rate, 8);
  assert.equal(s.trips[3].rate, 8);
  assert.equal(s.trips[2].method, "light");
});
test("consumed fuel cost draws from most recent paid inventory and marks shortfall estimate", () => {
  const s = fuelStats([fuel(0, 10000, 10), fuel(1, 10100, 20)]);
  assert.equal(s.trips[0].cost, 140);
  assert.equal(s.trips[0].estimatedCost, true);
  assert.equal(s.perKm, 1.4);
});
const expense: CostRow = {
  id: "x",
  date: "2025-01-01",
  name: "保险",
  color: "#123456",
  kind: "expense",
  cents: 365000,
  annual: true,
  source: "expense",
  note: "",
};
test("annual amounts use exclusive elapsed-day boundaries and actual year length", () => {
  assert.equal(
    recognizedCents(expense, "2025-01-01", "2025-01-01", "accrual"),
    0,
  );
  assert.equal(
    recognizedCents(expense, "2025-01-01", "2025-01-02", "accrual"),
    1000,
  );
  assert.equal(
    recognizedCents(expense, "2025-01-01", "2026-01-01", "accrual"),
    365000,
  );
  assert.equal(
    recognizedCents(expense, "2025-01-01", "2025-01-02", "cash"),
    365000,
  );
  assert.equal(
    recognizedCents(
      { ...expense, date: "2024-01-01", cents: 366000 },
      "2024-01-01",
      "2024-01-02",
      "accrual",
    ),
    1000,
  );
  assert.equal(anniversary("2024-02-29"), "2025-02-28");
});
test("valid backup roundtrips and rejects non-increasing odometer, invalid references and inconsistent fuel fields", () => {
  const w = sampleWorkspace();
  validate(w);
  assert.deepEqual(parseBackup(JSON.stringify({ data: w })), w);
  const bad = structuredClone(w);
  bad.fuels[1].odometer = bad.fuels[0].odometer;
  assert.throws(() => validate(bad), /递增/);
  const wrong = structuredClone(w);
  wrong.fuels[0].vehicleId = "missing";
  assert.throws(() => validate(wrong), /无效/);
  const mismatch = structuredClone(w);
  mismatch.fuels[0].grossCents += 100;
  assert.throws(() => validate(mismatch), /不一致/);
  assert.throws(() => parseBackup('{"version":5}'), /无效/);
});
test("CSV protects formula-like user text and preserves quotes, commas and newlines", () => {
  const text = csv([["=1+1", "中文,备注", 'O\'Reilly\n"记录"', 7.2]]);
  assert.ok(text.startsWith("\ufeff"));
  assert.match(text, /'=1\+1/);
  assert.match(text, /""记录""/);
  assert.match(text, /"7.2"/);
});
