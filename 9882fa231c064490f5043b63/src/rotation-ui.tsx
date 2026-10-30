import { useState } from "react";
import {
  addDays,
  monthEnd,
  monthLabel,
  today,
  weekDay,
  weekdays,
} from "./dates";
import {
  available,
  slotName,
  uid,
  type Roster,
  type Rotation,
  type Rule,
  type Slot,
  type Workspace,
} from "./model";
import {
  applyPreview,
  defaultExtendEnd,
  previewExtend,
  previewRotation,
  sourceEnd,
  type Preview,
} from "./rotation";
import { Button, ErrorBox, Field, Modal, errorMessage } from "./ui";
import type { Save } from "./editors";
const slotValue = (id: Slot) => id ?? "";
export function SlotSelect({
  w,
  r,
  value,
  onChange,
  label,
}: {
  w: Workspace;
  r: Roster;
  value: Slot;
  onChange: (s: Slot) => void;
  label: string;
}) {
  const options = available(w, r);
  if (value !== null && !options.some((s) => s.id === value)) {
    const old = w.shifts.find((s) => s.id === value);
    if (old)
      options.push({ ...old, name: slotName(w, r, old.id) + "（已停用）" });
  }
  return (
    <select
      aria-label={label}
      value={slotValue(value)}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">休息</option>
      {options.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
function RuleEditor({
  w,
  r,
  rule,
  index,
  update,
  remove,
  move,
  count,
}: {
  w: Workspace;
  r: Roster;
  rule: Rule;
  index: number;
  count: number;
  update: (v: Rule) => void;
  remove: () => void;
  move: (n: number) => void;
}) {
  const set = (v: Partial<Rule>) => update({ ...rule, ...v });
  return (
    <article className={"rule-card " + (!rule.enabled ? "disabled-rule" : "")}>
      <div className="rule-header">
        <label className="toggle">
          <input
            type="checkbox"
            checked={rule.enabled}
            onChange={(e) => set({ enabled: e.target.checked })}
          />
          <strong>规则 {index + 1}</strong>
        </label>
        <div>
          <Button
            aria-label={`上移规则 ${index + 1}`}
            disabled={index === 0}
            onClick={() => move(-1)}
          >
            ↑
          </Button>
          <Button
            aria-label={`下移规则 ${index + 1}`}
            disabled={index === count - 1}
            onClick={() => move(1)}
          >
            ↓
          </Button>
          <Button
            aria-label={`删除规则 ${index + 1}`}
            icon="close"
            kind="icon"
            onClick={remove}
          />
        </div>
      </div>
      <div className="form-row">
        <Field label="触发日的基础班次">
          <select
            value={rule.kind === "shift" ? rule.shiftId : rule.kind}
            onChange={(e) => {
              const v = e.target.value;
              set(
                v === "any" || v === "rest"
                  ? { kind: v, shiftId: "" }
                  : { kind: "shift", shiftId: v },
              );
            }}
          >
            <option value="any">任意班次 / 休息</option>
            <option value="rest">休息</option>
            {available(w, r).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="改变哪一天">
          <select
            value={rule.offset}
            onChange={(e) => set({ offset: Number(e.target.value) })}
          >
            {Array.from({ length: 63 }, (_, i) => i - 31).map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "当天" : n < 0 ? `前 ${-n} 天` : `后 ${n} 天`}
              </option>
            ))}
          </select>
        </Field>
        <Field label="改为">
          <SlotSelect
            w={w}
            r={r}
            value={rule.target}
            onChange={(target) => set({ target })}
            label={`规则 ${index + 1} 目标班次`}
          />
        </Field>
      </div>
      <div
        className="weekdays"
        role="group"
        aria-label={`规则 ${index + 1} 星期`}
      >
        {weekdays.map((label, n) => (
          <button
            type="button"
            key={n}
            aria-pressed={rule.weekdays.includes(n)}
            onClick={() =>
              set({
                weekdays: rule.weekdays.includes(n)
                  ? rule.weekdays.filter((d) => d !== n)
                  : [...rule.weekdays, n].sort(),
              })
            }
          >
            {label}
          </button>
        ))}
      </div>
      <small className="muted">
        不选星期表示每天；条件依据基础循环，不级联触发。
      </small>
      <div className="form-row">
        <Field label="触发日期从（可选）">
          <input
            type="date"
            value={rule.from}
            onChange={(e) => set({ from: e.target.value })}
          />
        </Field>
        <Field label="触发日期至（可选）">
          <input
            type="date"
            value={rule.until}
            onChange={(e) => set({ until: e.target.value })}
          />
        </Field>
      </div>
    </article>
  );
}
function PreviewView({
  w,
  r,
  p,
  confirm,
  busy,
}: {
  w: Workspace;
  r: Roster;
  p: Preview;
  confirm: () => void;
  busy: boolean;
}) {
  const months = Array.from(new Set(p.days.map((d) => d.date.slice(0, 7)))),
    [month, setMonth] = useState(months[0] ?? p.start.slice(0, 7)),
    [chosen, setChosen] = useState(p.days[0]?.date ?? p.start);
  const list = p.days.filter((d) => d.date.startsWith(month)),
    selected = p.days.find((d) => d.date === chosen),
    changed = p.days.filter((d) => d.change !== "same"),
    conflicts = p.days.filter((d) => d.conflict),
    counts = ["add", "replace", "clear"].map(
      (kind) => p.days.filter((d) => d.change === kind).length,
    );
  return (
    <div className="preview">
      <div className="preview-heading">
        <div>
          <h3>生成预览</h3>
          <p className="muted">
            {p.start} 至 {p.end} · {p.days.length} 天
          </p>
        </div>
        <span className="badge">
          {p.source === "inferred"
            ? `识别周期 ${p.plan.cycle.length} 天 · ${Math.round((p.score ?? 0) * 100)}% 吻合`
            : "保存循环方案"}
        </span>
      </div>
      <div className="preview-counts">
        <span>
          新增 <b>{counts[0]}</b>
        </span>
        <span>
          替换 <b>{counts[1]}</b>
        </span>
        <span>
          清除 <b>{counts[2]}</b>
        </span>
        <span>
          冲突 <b>{conflicts.length}</b>
        </span>
      </div>
      {conflicts.length > 0 && (
        <p className="notice">
          {conflicts.length}{" "}
          天命中不同结果，按规则顺序采用首项。可点击日期查看原因。
        </p>
      )}
      {p.outside.length > 0 && (
        <details className="notice">
          <summary>
            {p.outside.length} 项影响落在生成范围外，仅提示，不写入
          </summary>
          {p.outside.map((m, i) => (
            <p key={i}>
              {m.triggerDate} → {m.targetDate}：{slotName(w, r, m.shiftId)}
            </p>
          ))}
        </details>
      )}
      <div className="preview-month">
        <Button
          aria-label="预览上月"
          icon="left"
          disabled={months.indexOf(month) <= 0}
          onClick={() => setMonth(months[months.indexOf(month) - 1])}
        />
        <select
          aria-label="预览月份"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m + "-01")}
            </option>
          ))}
        </select>
        <Button
          aria-label="预览下月"
          icon="right"
          disabled={months.indexOf(month) >= months.length - 1}
          onClick={() => setMonth(months[months.indexOf(month) + 1])}
        />
      </div>
      <div className="preview-grid">
        {weekdays.map((d) => (
          <span className="week-label" key={d}>
            {d}
          </span>
        ))}
        {list[0] &&
          Array.from({ length: weekDay(list[0].date) }, (_, n) => (
            <span key={"blank" + n} />
          ))}
        {list.map((d) => (
          <button
            type="button"
            aria-label={`预览 ${d.date} ${slotName(w, r, d.final)}${d.conflict ? " 冲突" : ""}`}
            className={
              (chosen === d.date ? "chosen " : "") +
              (d.conflict ? "conflict" : "")
            }
            key={d.date}
            onClick={() => setChosen(d.date)}
          >
            <span>{Number(d.date.slice(8))}</span>
            <b>{slotName(w, r, d.final)}</b>
            {d.final !== d.base && <small>{slotName(w, r, d.base)} →</small>}
            {d.conflict && <i>!</i>}
          </button>
        ))}
      </div>
      {selected && (
        <div className="preview-reason">
          <strong>
            {chosen} · {slotName(w, r, selected.final)}
          </strong>
          <p>
            基础循环：{slotName(w, r, selected.base)} ·{" "}
            {selected.change === "same"
              ? "安排不变"
              : selected.change === "clear"
                ? "清除原班次"
                : selected.change === "replace"
                  ? "替换原班次"
                  : "新增班次"}
          </p>
          {selected.matches.map((m, i) => (
            <p key={i}>
              规则 {p.plan.rules.findIndex((rule) => rule.id === m.ruleId) + 1}
              ，由 {m.triggerDate} 触发：{slotName(w, r, m.shiftId)}
              {i === 0 ? "（采用）" : ""}
            </p>
          ))}
        </div>
      )}
      <p className="muted">
        确认后一次保存{changed.length}天的变更；预览期间的数据变化会阻止提交。
      </p>
      <Button
        kind="primary"
        icon="check"
        disabled={busy || !p.days.length}
        onClick={confirm}
      >
        {busy ? "保存中…" : "确认生成并保存"}
      </Button>
    </div>
  );
}
export function RotationEditor({
  w,
  r,
  date,
  save,
  busy,
  close,
  extend = false,
}: {
  w: Workspace;
  r: Roster;
  date: string;
  save: Save;
  busy: boolean;
  close: () => void;
  extend?: boolean;
}) {
  const first = available(w, r)[0]?.id ?? null;
  const [plan, setPlan] = useState<Rotation>(
      structuredClone(
        r.rotation ?? {
          anchor: date,
          cycle: [first, null],
          rules: [],
          generatedThrough: date,
        },
      ),
    ),
    [start, setStart] = useState(
      r.rotation && date < r.rotation.anchor ? r.rotation.anchor : date,
    ),
    [end, setEnd] = useState(
      extend
        ? defaultExtendEnd(r)
        : monthEnd(
            r.rotation && date < r.rotation.anchor ? r.rotation.anchor : date,
          ),
    ),
    [preview, setPreview] = useState<Preview | null>(null),
    [error, setError] = useState("");
  const change = (p: Partial<Rotation>) => {
    setPlan({ ...plan, ...p });
    setPreview(null);
    setError("");
  };
  const recalc = () => {
    try {
      setPreview(
        extend
          ? previewExtend(w, r, end)
          : previewRotation(w, r, plan, start, end),
      );
      setError("");
    } catch (e) {
      setPreview(null);
      setError(errorMessage(e));
    }
  };
  const confirm = async () => {
    if (!preview) return;
    try {
      const next = applyPreview(w, preview);
      if (await save(next)) close();
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  return (
    <Modal
      title={extend ? "自动续排" : "循环与附加规则"}
      wide
      onClose={() => !busy && close()}
    >
      {extend ? (
        <>
          <p className="muted">
            从 {sourceEnd(r) || "尚未排班"}{" "}
            之后开始。优先沿用保存的循环；无方案时识别历史周期，确认后才保存。
          </p>
          <Field label="续排截止日期">
            <input
              type="date"
              value={end}
              onChange={(e) => {
                setEnd(e.target.value);
                setPreview(null);
              }}
            />
          </Field>
        </>
      ) : (
        <>
          <p className="muted">设置一次节奏，先预览再排入日历。</p>
          <div className="form-row">
            <Field label="循环锚点 · 第 1 天">
              <input
                type="date"
                value={plan.anchor}
                onChange={(e) => {
                  change({ anchor: e.target.value });
                  if (e.target.value > start) {
                    setStart(e.target.value);
                    if (e.target.value > end) setEnd(e.target.value);
                  }
                }}
              />
            </Field>
            <Field label="生成开始">
              <input
                type="date"
                min={plan.anchor}
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  setPreview(null);
                }}
              />
            </Field>
            <Field label="生成结束">
              <input
                type="date"
                min={start}
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value);
                  setPreview(null);
                }}
              />
            </Field>
          </div>
          <h3>
            循环序列 <small className="muted">{plan.cycle.length} 天一轮</small>
          </h3>
          <div className="cycle-slots">
            {plan.cycle.map((slot, i) => (
              <div className="cycle-slot" key={i}>
                <span>第 {i + 1} 天</span>
                <SlotSelect
                  w={w}
                  r={r}
                  value={slot}
                  label={`循环第 ${i + 1} 天`}
                  onChange={(id) =>
                    change({
                      cycle: plan.cycle.map((old, n) => (n === i ? id : old)),
                    })
                  }
                />
                <Button
                  aria-label={`移除循环第 ${i + 1} 天`}
                  icon="close"
                  kind="icon"
                  disabled={plan.cycle.length <= 1}
                  onClick={() =>
                    change({ cycle: plan.cycle.filter((_, n) => n !== i) })
                  }
                />
              </div>
            ))}
          </div>
          <Button
            icon="plus"
            disabled={plan.cycle.length >= 366}
            onClick={() => change({ cycle: [...plan.cycle, null] })}
          >
            添加一天
          </Button>
          <div className="section-heading">
            <h3>附加规则</h3>
            <Button
              icon="plus"
              disabled={plan.rules.length >= 100}
              onClick={() =>
                change({
                  rules: [
                    ...plan.rules,
                    {
                      id: uid(),
                      enabled: true,
                      kind: "any",
                      shiftId: "",
                      weekdays: [],
                      from: "",
                      until: "",
                      offset: 0,
                      target: null,
                    },
                  ],
                })
              }
            >
              添加规则
            </Button>
          </div>
          <p className="muted">
            从上到下优先。可将某种班次或星期之前、之后的日期改为另一班次。
          </p>
          {plan.rules.map((rule, i) => (
            <RuleEditor
              w={w}
              r={r}
              key={rule.id}
              rule={rule}
              index={i}
              count={plan.rules.length}
              update={(value) =>
                change({
                  rules: plan.rules.map((old) =>
                    old.id === rule.id ? value : old,
                  ),
                })
              }
              remove={() =>
                change({
                  rules: plan.rules.filter((old) => old.id !== rule.id),
                })
              }
              move={(n) => {
                const list = [...plan.rules];
                [list[i], list[i + n]] = [list[i + n], list[i]];
                change({ rules: list });
              }}
            />
          ))}
        </>
      )}
      <ErrorBox error={error} />
      <footer>
        <Button disabled={busy} onClick={close}>
          取消
        </Button>
        <Button
          icon="calendar"
          disabled={busy}
          kind={preview ? "" : "primary"}
          onClick={recalc}
        >
          预览{extend ? "续排" : "生成"}
        </Button>
      </footer>
      {preview && (
        <PreviewView
          key={JSON.stringify(preview)}
          w={w}
          r={r}
          p={preview}
          confirm={confirm}
          busy={busy}
        />
      )}
    </Modal>
  );
}
