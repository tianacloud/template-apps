import test from "node:test";
import assert from "node:assert/strict";
import { addDays, day, dates, monthEnd, weekStart } from "../src/dates";
import {
  duration,
  emptyWorkspace,
  newRoster,
  resolveShift,
  uid,
  validate,
  validateShift,
  type Rotation,
  type Rule,
} from "../src/model";
import {
  applyPreview,
  baseShift,
  defaultExtendEnd,
  detectCycle,
  previewExtend,
  previewRotation,
  project,
  statistics,
} from "../src/rotation";
import {
  exportCsv,
  exportIcs,
  foldLine,
  importCsv,
  importJson,
  parseCsv,
} from "../src/files";
function fixture() {
  const w = emptyWorkspace(),
    r = newRoster("测试班表", w.shifts);
  w.rosters.push(r);
  return { w, r, a: w.shifts[0].id, b: w.shifts[1].id, night: w.shifts[3].id };
}
const rule = (patch: Partial<Rule> = {}): Rule => ({
  id: uid(),
  enabled: true,
  kind: "any",
  shiftId: "",
  weekdays: [],
  from: "",
  until: "",
  offset: 0,
  target: null,
  ...patch,
});
test("date arithmetic handles leap days, invalid dates, year boundaries and DST consistently", () => {
  assert.equal(addDays("2024-02-28", 2), "2024-03-01");
  assert.equal(monthEnd("2024-02-12"), "2024-02-29");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(weekStart("2026-10-25"), "2026-10-19");
  for (const bad of [
    "2025-02-29",
    "2026-04-31",
    "2026-13-01",
    "2026-1-01",
    "0000-01-01",
  ])
    assert.throws(() => day(bad));
  const old = process.env.TZ;
  process.env.TZ = "America/New_York";
  try {
    assert.equal(day("2026-03-09") - day("2026-03-07"), 2);
    assert.equal(day("2026-11-02") - day("2026-10-31"), 2);
  } finally {
    process.env.TZ = old;
  }
  assert.throws(() => dates("2026-01-02", "2026-01-01"));
  assert.throws(() => dates("2020-01-01", "2031-01-01"));
});
test("rotation keeps its anchor across months and applies noncascading priority, conflicts and edge effects", () => {
  const { w, r, a, b, night } = fixture();
  const p: Rotation = {
    anchor: "2024-02-28",
    cycle: [a, b, null],
    rules: [],
    generatedThrough: "2024-02-28",
  };
  assert.equal(baseShift(p, "2024-02-27"), null);
  assert.deepEqual(
    project(p, "2024-02-28", "2024-03-02").days.map((d) => d.final),
    [a, b, null, a],
  );
  p.rules = [
    rule({ kind: "shift", shiftId: a, offset: 1, target: night }),
    rule({ kind: "shift", shiftId: night, target: b }),
    rule({ weekdays: [3], target: null }),
  ];
  const projected = project(p, "2024-02-29", "2024-03-01");
  assert.equal(projected.days[0].final, night);
  assert.equal(projected.days[0].matches.length, 2);
  assert.equal(projected.days[0].conflict, true);
  assert.equal(projected.days[0].matches[0].triggerDate, "2024-02-28");
  assert.equal(
    projected.days[1].final,
    null,
    "night result must not trigger a later night predicate",
  );
  p.rules = [rule({ offset: -1, target: night })];
  const edge = project(p, "2024-02-29", "2024-03-01");
  assert.equal(edge.days[1].matches[0].triggerDate, "2024-03-02");
  assert.equal(edge.outside[0].targetDate, "2024-02-28");
  p.rules = [rule({ from: "2024-02-29", until: "2024-02-29", target: night })];
  assert.deepEqual(
    project(p, "2024-02-28", "2024-03-01").days.map((d) => d.final),
    [a, night, null],
  );
  const preview = previewRotation(w, r, p, "2024-02-28", "2024-03-01");
  const changed = structuredClone(w);
  changed.rosters[0].notes["2024-02-28"] = "修改后";
  assert.throws(() => applyPreview(changed, preview), /重新预览/);
  assert.equal(Object.keys(r.entries).length, 0, "preview is read only");
});
test("disabled and archived shifts preserve historical data but stop new plans; local definitions stay independent", () => {
  const { w, r, a } = fixture();
  r.entries["2026-10-22"] = a;
  const other = newRoster("另一张", w.shifts);
  w.rosters.push(other);
  other.entries["2026-10-22"] = a;
  const global = w.shifts[0];
  r.overrides[a] = {
    name: "专用早班",
    start: "07:00",
    end: "19:00",
    endOffset: 0,
    color: "#637a4d",
  };
  global.start = "08:00";
  global.end = "16:00";
  assert.equal(resolveShift(w, r, a)!.name, "专用早班");
  assert.equal(duration(resolveShift(w, r, a)), 720);
  assert.equal(duration(resolveShift(w, other, a)), 480);
  global.archived = true;
  validate(w);
  assert.equal(resolveShift(w, r, a)!.name, "专用早班");
  assert.throws(
    () =>
      previewRotation(
        w,
        r,
        {
          anchor: "2026-10-22",
          cycle: [a],
          rules: [],
          generatedThrough: "2026-10-22",
        },
        "2026-10-22",
        "2026-10-23",
      ),
    /不可用班次/,
  );
});
test("night, equal-time and long shifts count against their start day and reject invalid offsets", () => {
  const { w, r, night } = fixture();
  r.entries["2026-10-31"] = night;
  assert.equal(statistics(w, r, "2026-10-01", "2026-10-31").minutes, 480);
  assert.equal(statistics(w, r, "2026-11-01", "2026-11-30").minutes, 0);
  const shift = {
    name: "长班",
    color: "#637a4d",
    start: "08:00",
    end: "08:00",
    endOffset: 7,
  };
  assert.equal(duration(shift), 7 * 1440);
  validateShift(shift);
  assert.throws(() => validateShift({ ...shift, endOffset: 0 }));
  assert.throws(() => validateShift({ ...shift, endOffset: 8 }));
  assert.throws(() => validateShift({ ...shift, end: "" }));
  assert.equal(duration({ ...shift, start: "", end: "" }), 0);
});
test("saved rotation extends its original rhythm without replacing manual history or notes", () => {
  const { w, r, a, night } = fixture(),
    p: Rotation = {
      anchor: "2026-10-30",
      cycle: [a, null],
      rules: [],
      generatedThrough: "2026-10-30",
    };
  const generated = applyPreview(
      w,
      previewRotation(w, r, p, "2026-10-30", "2026-11-03"),
    ),
    rr = generated.rosters[0];
  rr.entries["2026-11-02"] = night;
  rr.notes["2026-11-02"] = "手动调整";
  assert.equal(defaultExtendEnd(rr), "2026-12-31");
  const extended = applyPreview(
    generated,
    previewExtend(generated, rr, "2026-11-06"),
  ).rosters[0];
  assert.equal(extended.entries["2026-11-02"], night);
  assert.equal(extended.notes["2026-11-02"], "手动调整");
  assert.equal(extended.entries["2026-11-04"], null);
  assert.equal(extended.entries["2026-11-05"], a);
  assert.equal(extended.rotation!.anchor, "2026-10-30");
  assert.equal(extended.rotation!.generatedThrough, "2026-11-06");
});
test("cycle inference uses historical confidence, short ties and distinguishes missing days from rest", () => {
  assert.equal(detectCycle(["a", "b", "c", "d"]), null);
  assert.equal(detectCycle(["a", "a", "a", "a"])!.length, 1);
  const { w, r, a, b } = fixture();
  for (let i = 0; i < 20; i++)
    r.entries[addDays("2026-10-01", i)] = i % 2 ? null : a;
  const p = previewExtend(w, r, "2026-10-24");
  assert.equal(p.source, "inferred");
  assert.equal(p.score, 1);
  assert.deepEqual(
    p.days.map((d) => d.final),
    [a, null, a, null],
  );
  const gapped = structuredClone(w);
  delete gapped.rosters[0].entries["2026-10-02"];
  assert.equal(Object.hasOwn(gapped.rosters[0].entries, "2026-10-02"), false);
  assert.ok(
    previewExtend(gapped, gapped.rosters[0], "2026-10-24").score! >= 0.85,
  );
  const low = structuredClone(w);
  low.rosters[0].entries = {
    "2026-10-01": a,
    "2026-10-02": b,
    "2026-10-03": w.shifts[2].id,
    "2026-10-04": w.shifts[3].id,
  };
  assert.throws(
    () => previewExtend(low, low.rosters[0], "2026-10-10"),
    /稳定周期/,
  );
});
test("CSV quoting, input validation, JSON references and calendar export preserve actual data safely", () => {
  const { w, r, night } = fixture();
  r.entries["2026-10-31"] = night;
  r.notes["2026-10-31"] = '=SUM(1,2)\n交班 "检查"';
  const csv = exportCsv(w, r, "2026-10-31", "2026-10-31");
  assert.ok(csv.includes("'=SUM"));
  const restored = importCsv(w, csv, "恢复");
  assert.equal(
    restored.rosters.at(-1)!.notes["2026-10-31"],
    r.notes["2026-10-31"],
  );
  assert.equal(restored.rosters.at(-1)!.entries["2026-10-31"], night);
  assert.equal(restored.rosters.length, 2);
  assert.throws(() => parseCsv('date,shift\n"bad'));
  assert.throws(
    () => importCsv(w, "date,shift\n2026-10-31,早班\n2026-10-31,夜班", "重复"),
    /重复/,
  );
  assert.throws(
    () =>
      importCsv(w, "date,shift,start,end\n2026-10-31,夜班,08:00,16:00", "冲突"),
    /不同/,
  );
  const invalid = structuredClone(w);
  invalid.rosters[0].entries["2026-11-01"] = "does-not-exist";
  assert.throws(() => importJson(JSON.stringify(invalid)));
  assert.deepEqual(importJson(JSON.stringify(w)), w);
  const ics = exportIcs(
    w,
    r,
    "2026-10-31",
    "2026-10-31",
    new Date("2026-10-22T00:00:00Z"),
  );
  assert.ok(ics.includes("DTSTART:20261031T220000"));
  assert.ok(ics.includes("DTEND:20261101T060000"));
  assert.ok(ics.includes("DTSTAMP:20261022T000000Z"));
  assert.ok(ics.includes("=SUM(1\\,2)\\n交班"));
  r.notes["2026-10-31"] = "交班\r检查";
  assert.ok(
    exportIcs(w, r, "2026-10-31", "2026-10-31").includes(
      "DESCRIPTION:交班\\n检查",
    ),
  );
  for (const line of foldLine("DESCRIPTION:" + "汉字,中文；".repeat(40)).split(
    "\r\n",
  ))
    assert.ok(Buffer.byteLength(line) <= 75);
});
test("CSV reimport preserves literal apostrophes as well as formula-like notes", () => {
  const { w, r, night } = fixture();
  r.entries["2026-10-31"] = night;
  for (const note of [
    "'=SUM(1,2)",
    "''plain",
    "'ordinary",
    " =SUM(1,2)",
    "@提醒",
    "+文字",
    "-文字",
    "\t=SUM(1,2)",
  ]) {
    r.notes["2026-10-31"] = note;
    const roundtrip = importCsv(
      w,
      exportCsv(w, r, "2026-10-31", "2026-10-31"),
      "重新导入",
    );
    assert.equal(roundtrip.rosters.at(-1)!.notes["2026-10-31"], note);
  }
});
