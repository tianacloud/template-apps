import { useState } from "react";
import { dateLabel } from "./dates";
import {
  available,
  duration,
  newRoster,
  palette,
  resolveShift,
  slotName,
  timeLabel,
  uid,
  validateShift,
  type Roster,
  type Shift,
  type ShiftFields,
  type Workspace,
} from "./model";
import {
  Button,
  ConfirmButton,
  ErrorBox,
  Field,
  Modal,
  errorMessage,
} from "./ui";
export type Save = (next: Workspace) => Promise<boolean>;
export function DayEditor({
  w,
  r,
  date,
  save,
  close,
  busy,
}: {
  w: Workspace;
  r: Roster;
  date: string;
  save: Save;
  close: () => void;
  busy: boolean;
}) {
  const [slot, setSlot] = useState(r.entries[date] ?? null),
    [note, setNote] = useState(r.notes[date] ?? ""),
    [error, setError] = useState("");
  const options = available(w, r),
    old = resolveShift(w, r, slot);
  if (old && !options.some((s) => s.id === old.id)) options.push(old);
  return (
    <Modal title={dateLabel(date)} onClose={() => !busy && close()}>
      <p className="muted">{r.name} · 当天排班</p>
      <div className="shift-options">
        {[null, ...options].map((s) => (
          <button
            type="button"
            key={s?.id ?? "rest"}
            className={
              "shift-option " + (slot === (s?.id ?? null) ? "selected" : "")
            }
            style={{ "--shift": s?.color ?? "#b7c0ac" } as React.CSSProperties}
            onClick={() => setSlot(s?.id ?? null)}
          >
            <span className="dot" />
            <strong>{s?.name ?? "休息"}</strong>
            <small>{timeLabel(s)}</small>
          </button>
        ))}
      </div>
      <Field label="当天备注">
        <textarea
          rows={3}
          maxLength={2000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="记录临时调整、交班事项…"
        />
      </Field>
      <ErrorBox error={error} />
      <footer>
        <Button disabled={busy} onClick={close}>
          取消
        </Button>
        <Button
          kind="primary"
          disabled={busy}
          onClick={async () => {
            try {
              if (
                slot !== null &&
                !available(w, r).some((s) => s.id === slot) &&
                r.entries[date] !== slot
              )
                throw new Error("该班次已停用");
              const next = structuredClone(w),
                rr = next.rosters.find((x) => x.id === r.id)!;
              rr.entries[date] = slot;
              if (note.trim()) rr.notes[date] = note.trim();
              else delete rr.notes[date];
              if (await save(next)) close();
            } catch (e) {
              setError(errorMessage(e));
            }
          }}
        >
          {busy ? "保存中…" : "保存排班"}
        </Button>
      </footer>
    </Modal>
  );
}
export function RosterEditor({
  w,
  r,
  save,
  close,
  busy,
}: {
  w: Workspace;
  r?: Roster;
  save: Save;
  close: () => void;
  busy: boolean;
}) {
  const [name, setName] = useState(r?.name ?? ""),
    [error, setError] = useState("");
  return (
    <Modal title={r ? "班表设置" : "新建班表"} onClose={() => !busy && close()}>
      <Field label="班表名称">
        <input
          autoComplete="off"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：我的轮班"
        />
      </Field>
      <ErrorBox error={error} />
      <footer>
        <Button disabled={busy} onClick={close}>
          取消
        </Button>
        <Button
          kind="primary"
          disabled={busy}
          onClick={async () => {
            if (!name.trim()) {
              setError("请填写班表名称");
              return;
            }
            const next = structuredClone(w);
            if (r) next.rosters.find((x) => x.id === r.id)!.name = name.trim();
            else next.rosters.push(newRoster(name.trim(), next.shifts));
            if (await save(next)) close();
          }}
        >
          保存
        </Button>
      </footer>
    </Modal>
  );
}
function ShiftForm({
  value,
  onSave,
  onCancel,
  busy,
  title,
}: {
  value: ShiftFields;
  onSave: (s: ShiftFields) => Promise<void>;
  onCancel: () => void;
  busy: boolean;
  title: string;
}) {
  const [draft, setDraft] = useState(value),
    [error, setError] = useState("");
  const update = (patch: Partial<ShiftFields>) => {
    setDraft((s) => {
      const next = { ...s, ...patch };
      if (
        next.start &&
        next.end &&
        next.end <= next.start &&
        next.endOffset === 0
      )
        next.endOffset = 1;
      return next;
    });
  };
  return (
    <div className="subform">
      <h3>{title}</h3>
      <Field label="班次名称">
        <input
          maxLength={40}
          value={draft.name}
          onChange={(e) => update({ name: e.target.value })}
        />
      </Field>
      <div className="form-row">
        <Field label="开始时间">
          <input
            type="time"
            value={draft.start}
            onChange={(e) => update({ start: e.target.value })}
          />
        </Field>
        <Field label="结束时间">
          <input
            type="time"
            value={draft.end}
            onChange={(e) => update({ end: e.target.value })}
          />
        </Field>
        <Field label="结束日">
          <select
            value={draft.endOffset}
            onChange={(e) => update({ endOffset: Number(e.target.value) })}
          >
            {Array.from({ length: 8 }, (_, n) => (
              <option value={n} key={n}>
                {n === 0 ? "当天" : n === 1 ? "次日" : `+${n}天`}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <p className="muted">
        {timeLabel(draft)} · {duration(draft) / 60} 小时
      </p>
      <div className="swatches" role="group" aria-label="班次颜色">
        {palette.map((color, i) => (
          <button
            type="button"
            key={color}
            aria-label={`颜色 ${i + 1}`}
            aria-pressed={draft.color === color}
            style={{ background: color }}
            onClick={() => update({ color })}
          />
        ))}
      </div>
      <ErrorBox error={error} />
      <footer>
        <Button disabled={busy} onClick={onCancel}>
          取消编辑
        </Button>
        <Button
          kind="primary"
          disabled={busy}
          onClick={async () => {
            try {
              const s = { ...draft, name: draft.name.trim() };
              validateShift(s);
              await onSave(s);
            } catch (e) {
              setError(errorMessage(e));
            }
          }}
        >
          保存班次
        </Button>
      </footer>
    </div>
  );
}
export function Shifts({
  w,
  r,
  save,
  busy,
}: {
  w: Workspace;
  r?: Roster;
  save: Save;
  busy: boolean;
}) {
  const [editing, setEditing] = useState<{
      id: string;
      scope: "global" | "local";
    } | null>(null),
    [scope, setScope] = useState<"global" | "local">("global");
  const edited =
    editing?.id === "new"
      ? {
          name: "",
          color: palette[w.shifts.length % palette.length],
          start: "09:00",
          end: "17:00",
          endOffset: 0,
        }
      : w.shifts.find((s) => s.id === editing?.id);
  async function mutate(fn: (next: Workspace) => void) {
    const next = structuredClone(w);
    fn(next);
    return save(next);
  }
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SHIFT LIBRARY</p>
          <h1>班次设置</h1>
          <p className="muted">用适合自己的节奏，安排工作与休息。</p>
        </div>
        <Button
          icon="plus"
          kind="primary"
          onClick={() => setEditing({ id: "new", scope: "global" })}
        >
          新建班次
        </Button>
      </div>
      <div className="tabs">
        <button
          type="button"
          className={scope === "global" ? "active" : ""}
          onClick={() => setScope("global")}
        >
          全局班次库
        </button>
        <button
          type="button"
          className={scope === "local" ? "active" : ""}
          disabled={!r}
          onClick={() => setScope("local")}
        >
          本表班次
        </button>
      </div>
      <p className="muted">
        {scope === "global"
          ? "修改共享班次会影响使用它的全部班表及历史显示。归档后保留历史，停止新分配。"
          : `${r?.name}：启停仅影响新的分配，本表专用版本独立保存。`}
      </p>
      <div className="cards">
        {w.shifts.map((s) => {
          const resolved = r ? resolveShift(w, r, s.id)! : s;
          return (
            <article
              className={"shift-card " + (s.archived ? "archived" : "")}
              key={s.id}
              style={
                {
                  "--shift": (scope === "local" ? resolved : s).color,
                } as React.CSSProperties
              }
            >
              <div className="shift-card-title">
                <span className="dot" />
                <h3>{scope === "local" ? resolved.name : s.name}</h3>
                {s.archived && <span className="badge">已归档</span>}
              </div>
              <p>{timeLabel(scope === "local" ? resolved : s)}</p>
              <small className="muted">
                {scope === "local" && r?.overrides[s.id]
                  ? "本表专用"
                  : "共享版本"}{" "}
                · {duration(scope === "local" ? resolved : s) / 60} 小时
              </small>
              <div className="card-actions">
                {scope === "local" && r ? (
                  <>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        disabled={busy || s.archived}
                        checked={r.enabled.includes(s.id)}
                        onChange={() =>
                          mutate((next) => {
                            const rr = next.rosters.find((x) => x.id === r.id)!;
                            rr.enabled = rr.enabled.includes(s.id)
                              ? rr.enabled.filter((id) => id !== s.id)
                              : [...rr.enabled, s.id];
                          })
                        }
                      />
                      用于新排班
                    </label>
                    <Button
                      disabled={busy}
                      onClick={() => setEditing({ id: s.id, scope: "local" })}
                    >
                      编辑专用版
                    </Button>
                    {r.overrides[s.id] && (
                      <ConfirmButton
                        className="btn"
                        disabled={busy}
                        message="恢复共享版本后，本表该班次的历史显示也会更新。继续？"
                        onConfirm={() =>
                          mutate((next) => {
                            delete next.rosters.find((x) => x.id === r.id)!
                              .overrides[s.id];
                          })
                        }
                      >
                        恢复共享
                      </ConfirmButton>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      icon="edit"
                      disabled={busy}
                      onClick={() => setEditing({ id: s.id, scope: "global" })}
                    >
                      编辑
                    </Button>
                    <Button
                      disabled={busy}
                      onClick={() =>
                        mutate((next) => {
                          next.shifts.find((x) => x.id === s.id)!.archived =
                            !s.archived;
                        })
                      }
                    >
                      {s.archived ? "恢复" : "归档"}
                    </Button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {editing && edited && (
        <Modal
          title={
            editing.scope === "local" ? "编辑本表专用班次" : "编辑全局班次"
          }
          onClose={() => !busy && setEditing(null)}
        >
          <ShiftForm
            key={editing.id + editing.scope}
            title={
              editing.scope === "global"
                ? "共享更改会同步到使用它的班表"
                : "仅改变当前班表的显示与工时"
            }
            value={
              editing.scope === "local" && r
                ? resolveShift(w, r, editing.id)!
                : edited
            }
            busy={busy}
            onCancel={() => setEditing(null)}
            onSave={async (fields) => {
              if (
                await mutate((next) => {
                  if (editing.id === "new") {
                    const shift: Shift = {
                      ...fields,
                      id: uid(),
                      archived: false,
                    };
                    next.shifts.push(shift);
                    for (const roster of next.rosters)
                      roster.enabled.push(shift.id);
                  } else if (editing.scope === "local" && r)
                    next.rosters.find((x) => x.id === r.id)!.overrides[
                      editing.id
                    ] = fields;
                  else
                    Object.assign(
                      next.shifts.find((x) => x.id === editing.id)!,
                      fields,
                    );
                })
              ) {
                setEditing(null);
              }
            }}
          />
        </Modal>
      )}
    </section>
  );
}
