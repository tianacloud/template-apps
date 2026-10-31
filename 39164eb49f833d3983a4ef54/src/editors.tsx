import { useState, type ReactNode } from "react";
import {
  uid,
  today,
  nowInput,
  ordered,
  type Workspace,
  type Vehicle,
  type Fuel,
  type Expense,
  type Maintenance,
  type Category,
} from "./model";
import { Field, FormFoot, Icon, fmt, money } from "./ui";
export interface EditorProps {
  w: Workspace;
  vehicleId: string;
  busy: boolean;
  error: string;
  onClose: () => void;
  save: (w: Workspace) => Promise<void>;
}
function useSave(p: EditorProps) {
  return (next: Workspace) => {
    void p.save(next).catch(() => {});
  };
}
function ErrorBox({ text }: { text: string }) {
  return text ? (
    <p className="form-error" role="alert">
      {text}
    </p>
  ) : null;
}
function update<T extends { id: string }>(rows: T[], row: T) {
  return rows.some((r) => r.id === row.id)
    ? rows.map((r) => (r.id === row.id ? row : r))
    : [...rows, row];
}
export function VehicleEditor(p: EditorProps & { item?: Vehicle }) {
  const [v, set] = useState<Vehicle>(
    p.item ?? {
      id: uid(),
      name: "",
      model: "",
      plate: "",
      fuel: "92# 汽油",
      capacity: 50,
      purchaseDate: today(),
      archived: false,
    },
  );
  const commit = useSave(p);
  return (
    <>
      <div className="dialog-body">
        <div className="form-grid">
          <Field label="车辆昵称">
            <input
              autoFocus
              maxLength={60}
              value={v.name}
              placeholder="例如：我的小白"
              onChange={(e) => set({ ...v, name: e.target.value })}
            />
          </Field>
          <Field label="车型">
            <input
              maxLength={100}
              value={v.model}
              placeholder="例如：大众高尔夫 1.4T"
              onChange={(e) => set({ ...v, model: e.target.value })}
            />
          </Field>
          <Field label="车牌号">
            <input
              maxLength={30}
              value={v.plate}
              placeholder="选填"
              onChange={(e) => set({ ...v, plate: e.target.value })}
            />
          </Field>
          <Field label="常用油品">
            <select
              value={v.fuel}
              onChange={(e) => set({ ...v, fuel: e.target.value })}
            >
              {["92# 汽油", "95# 汽油", "98# 汽油", "0# 柴油", "其他燃油"].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </select>
          </Field>
          <Field label="油箱容量（升）">
            <input
              type="number"
              min="1"
              max="1000"
              value={v.capacity || ""}
              onChange={(e) => set({ ...v, capacity: Number(e.target.value) })}
            />
          </Field>
          <Field label="购车日期">
            <input
              type="date"
              value={v.purchaseDate}
              onChange={(e) => set({ ...v, purchaseDate: e.target.value })}
            />
          </Field>
        </div>
        {p.item && (
          <label className="check-row">
            <input
              type="checkbox"
              checked={v.archived}
              onChange={(e) => set({ ...v, archived: e.target.checked })}
            />
            <span>
              归档车辆<small>保留历史数据，停止新增加油及费用记录</small>
            </span>
          </label>
        )}
        <ErrorBox text={p.error} />
      </div>
      <FormFoot
        busy={p.busy}
        onClose={p.onClose}
        label="保存车辆"
        onSave={() => commit({ ...p.w, vehicles: update(p.w.vehicles, v) })}
      />
    </>
  );
}
export function FuelEditor(p: EditorProps & { item?: Fuel }) {
  const previous = ordered(
      p.w.fuels.filter((f) => f.vehicleId === p.vehicleId),
    ).at(-1),
    car = p.w.vehicles.find((v) => v.id === p.vehicleId)!;
  const [v, set] = useState(
    p.item
      ? {
          ...p.item,
          odometer: String(p.item.odometer),
          liters: String(p.item.liters),
          price: String(p.item.price),
          gross: String(p.item.grossCents / 100),
          paid: String(p.item.paidCents / 100),
        }
      : {
          id: uid(),
          vehicleId: p.vehicleId,
          date: nowInput(),
          odometer: "",
          liters: "",
          price: String(previous?.price ?? ""),
          gross: "",
          paid: "",
          full: true,
          light: false,
          missed: false,
          grade: car.fuel,
          station: "",
          note: "",
        },
  );
  const [paidTouched, touch] = useState(Boolean(p.item));
  const commit = useSave(p);
  function linked(key: "price" | "gross" | "liters", val: string) {
    set((old) => {
      const x = { ...old, [key]: val };
      if (key === "gross") {
        x.liters =
          Number(x.price) > 0
            ? (Number(val) / Number(x.price))
                .toFixed(6)
                .replace(/0+$/, "")
                .replace(/\.$/, "")
            : "";
      } else {
        x.gross =
          x.liters !== "" && x.price !== ""
            ? (
                Math.round(Number(x.liters) * Number(x.price) * 100) / 100
              ).toFixed(2)
            : "";
      }
      if (!paidTouched) x.paid = x.gross;
      return x;
    });
  }
  const selected = p.w.vehicles.find((c) => c.id === v.vehicleId)!,
    last = ordered(
      p.w.fuels.filter((f) => f.vehicleId === v.vehicleId && f.id !== v.id),
    ).at(-1);
  return (
    <>
      <div className="dialog-body">
        <div className="editor-car">
          <Icon name="car" />
          <select
            aria-label="记录车辆"
            disabled={!!p.item}
            value={v.vehicleId}
            onChange={(e) =>
              set({
                ...v,
                vehicleId: e.target.value,
                grade: p.w.vehicles.find((c) => c.id === e.target.value)!.fuel,
              })
            }
          >
            {p.w.vehicles
              .filter((c) => !c.archived || c.id === v.vehicleId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.model || "我的爱车"}
                </option>
              ))}
          </select>
          <span>{selected.fuel}</span>
        </div>
        <div className="form-grid">
          <Field label="加油时间">
            <input
              autoFocus
              type="datetime-local"
              value={v.date}
              onChange={(e) => set({ ...v, date: e.target.value })}
            />
          </Field>
          <Field
            label="当前总里程（公里）"
            hint={
              last
                ? `最近记录：${fmt(last.odometer, 0)} 公里`
                : "填写里程表上的总里程"
            }
          >
            <input
              inputMode="decimal"
              type="number"
              min="0"
              value={v.odometer}
              placeholder={last ? String(last.odometer + 500) : "例如 12800"}
              onChange={(e) => set({ ...v, odometer: e.target.value })}
            />
          </Field>
        </div>
        <div className="linked-fields">
          <Field label="加油量（升）">
            <input
              inputMode="decimal"
              type="number"
              min="0"
              step="0.001"
              value={v.liters}
              placeholder="0.00"
              onChange={(e) => linked("liters", e.target.value)}
            />
          </Field>
          <span>×</span>
          <Field label="挂牌单价（元/升）">
            <input
              inputMode="decimal"
              type="number"
              min="0"
              step="0.001"
              value={v.price}
              placeholder="0.00"
              onChange={(e) => linked("price", e.target.value)}
            />
          </Field>
          <span>=</span>
          <Field label="挂牌金额（元）">
            <input
              inputMode="decimal"
              type="number"
              min="0"
              step="0.01"
              value={v.gross}
              placeholder="0.00"
              onChange={(e) => linked("gross", e.target.value)}
            />
          </Field>
        </div>
        <div className="payment-grid">
          <Field label="实付金额（元）" hint="优惠不改变加油升数">
            <input
              inputMode="decimal"
              type="number"
              min="0"
              step="0.01"
              value={v.paid}
              placeholder="0.00"
              onChange={(e) => {
                touch(true);
                set({ ...v, paid: e.target.value });
              }}
            />
          </Field>
          <div className="discount">
            <span>本次优惠</span>
            <strong>{money(Number(v.gross) - Number(v.paid))}</strong>
          </div>
        </div>
        <div className="fuel-checks">
          {[
            ["full", "油箱加满", "加油后已跳枪"],
            ["light", "油灯亮了", "加油前警告灯亮"],
            ["missed", "上次漏记", "切断之前的累计"],
          ].map(([k, label, hint]) => (
            <label key={k} className={(v as any)[k] ? "selected" : ""}>
              <input
                type="checkbox"
                checked={(v as any)[k]}
                onChange={(e) => set({ ...v, [k]: e.target.checked })}
              />
              <Icon name={(v as any)[k] ? "check" : "plus"} size={16} />
              <span>
                {label}
                <small>{hint}</small>
              </span>
            </label>
          ))}
        </div>
        <div className="form-grid">
          <Field label="油品">
            <select
              value={v.grade}
              onChange={(e) => set({ ...v, grade: e.target.value })}
            >
              {["92# 汽油", "95# 汽油", "98# 汽油", "0# 柴油", "其他燃油"].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </select>
          </Field>
          <Field label="加油站">
            <input
              maxLength={200}
              value={v.station}
              placeholder="选填 · 例如中石化城南站"
              onChange={(e) => set({ ...v, station: e.target.value })}
            />
          </Field>
          <Field label="备注" full>
            <textarea
              maxLength={3000}
              rows={2}
              value={v.note}
              placeholder="记下这一路的点滴…"
              onChange={(e) => set({ ...v, note: e.target.value })}
            />
          </Field>
        </div>
        <ErrorBox text={p.error} />
      </div>
      <FormFoot
        busy={p.busy}
        onClose={p.onClose}
        label={p.item ? "保存修改" : "保存加油记录"}
        onSave={() =>
          commit({
            ...p.w,
            fuels: update(p.w.fuels, {
              id: v.id,
              vehicleId: v.vehicleId,
              date: v.date,
              odometer: v.odometer === "" ? NaN : Number(v.odometer),
              liters: Number(v.liters),
              price: Number(v.price),
              grossCents: Math.round(Number(v.gross) * 100),
              paidCents: v.paid === "" ? NaN : Math.round(Number(v.paid) * 100),
              full: v.full,
              light: v.light,
              missed: v.missed,
              grade: v.grade,
              station: v.station.trim(),
              note: v.note,
            }),
          })
        }
      />
    </>
  );
}
export function ExpenseEditor(p: EditorProps & { item?: Expense }) {
  const [v, set] = useState(
      p.item ?? {
        id: uid(),
        vehicleId: p.vehicleId,
        date: today(),
        categoryId: p.w.categories.find((c) => c.kind === "expense")?.id ?? "",
        cents: 0,
        note: "",
      },
    ),
    [kind, setKind] = useState(
      p.w.categories.find((c) => c.id === v.categoryId)?.kind ?? "expense",
    );
  const commit = useSave(p),
    category = p.w.categories.find((c) => c.id === v.categoryId);
  return (
    <>
      <div className="dialog-body">
        <div className="tabs fill">
          {(["expense", "income"] as const).map((k) => (
            <button
              key={k}
              className={kind === k ? "active" : ""}
              onClick={() => {
                setKind(k);
                set({
                  ...v,
                  categoryId:
                    p.w.categories.find((c) => c.kind === k)?.id ?? "",
                });
              }}
            >
              {k === "expense" ? "记录支出" : "记录收入"}
            </button>
          ))}
        </div>
        <div className="category-picks">
          {p.w.categories
            .filter((c) => c.kind === kind)
            .map((c) => (
              <button
                key={c.id}
                className={v.categoryId === c.id ? "selected" : ""}
                onClick={() => set({ ...v, categoryId: c.id })}
              >
                <span style={{ background: c.color + "20", color: c.color }}>
                  <Icon name={kind === "income" ? "wallet" : "receipt"} />
                </span>
                {c.name}
              </button>
            ))}
        </div>
        <div className="form-grid">
          <Field label="金额（元）">
            <input
              autoFocus
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={v.cents ? v.cents / 100 : ""}
              onChange={(e) =>
                set({ ...v, cents: Math.round(Number(e.target.value) * 100) })
              }
            />
          </Field>
          <Field label="发生日期">
            <input
              type="date"
              value={v.date}
              onChange={(e) => set({ ...v, date: e.target.value })}
            />
          </Field>
          <Field label="备注" full>
            <textarea
              maxLength={3000}
              rows={3}
              value={v.note}
              placeholder="选填"
              onChange={(e) => set({ ...v, note: e.target.value })}
            />
          </Field>
        </div>
        {category?.annual && (
          <p className="notice">
            此分类为年度费用：现金视图记入发生日，分摊视图从发生日起按天计入未来一年。
          </p>
        )}
        <ErrorBox text={p.error} />
      </div>
      <FormFoot
        busy={p.busy}
        onClose={p.onClose}
        onSave={() => commit({ ...p.w, expenses: update(p.w.expenses, v) })}
      />
    </>
  );
}
export function MaintenanceEditor(p: EditorProps & { item?: Maintenance }) {
  const [v, set] = useState(
    p.item ?? {
      id: uid(),
      vehicleId: p.vehicleId,
      date: today(),
      odometer:
        ordered(p.w.fuels.filter((f) => f.vehicleId === p.vehicleId)).at(-1)
          ?.odometer ?? 0,
      title: "更换机油机滤",
      cents: 0,
      note: "",
      nextDate: "",
      nextOdometer: 0,
    },
  );
  const commit = useSave(p);
  return (
    <>
      <div className="dialog-body">
        <div className="form-grid">
          <Field label="保养项目" full>
            <input
              autoFocus
              value={v.title}
              maxLength={100}
              onChange={(e) => set({ ...v, title: e.target.value })}
            />
          </Field>
          <Field label="保养日期">
            <input
              type="date"
              value={v.date}
              onChange={(e) => set({ ...v, date: e.target.value })}
            />
          </Field>
          <Field label="保养时总里程（公里）">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={v.odometer}
              onChange={(e) => set({ ...v, odometer: Number(e.target.value) })}
            />
          </Field>
          <Field label="保养费用（元）" hint="自动计入用车费用">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={v.cents / 100}
              onChange={(e) =>
                set({ ...v, cents: Math.round(Number(e.target.value) * 100) })
              }
            />
          </Field>
          <Field label="下次保养里程（公里）">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="选填"
              value={v.nextOdometer || ""}
              onChange={(e) =>
                set({ ...v, nextOdometer: Number(e.target.value) })
              }
            />
          </Field>
          <Field label="下次保养日期">
            <input
              type="date"
              value={v.nextDate}
              onChange={(e) => set({ ...v, nextDate: e.target.value })}
            />
          </Field>
          <Field label="保养备注" full>
            <textarea
              maxLength={3000}
              rows={3}
              value={v.note}
              onChange={(e) => set({ ...v, note: e.target.value })}
            />
          </Field>
        </div>
        <p className="notice">
          日期或里程达到任一条件时，打开账本即可看到保养待办。
        </p>
        <ErrorBox text={p.error} />
      </div>
      <FormFoot
        busy={p.busy}
        onClose={p.onClose}
        label="保存保养记录"
        onSave={() =>
          commit({ ...p.w, maintenance: update(p.w.maintenance, v) })
        }
      />
    </>
  );
}
export function CategoryEditor(p: EditorProps & { item?: Category }) {
  const [v, set] = useState<Category>(
    p.item ?? {
      id: uid(),
      name: "",
      kind: "expense",
      annual: false,
      color: "#6f93dc",
    },
  );
  const commit = useSave(p);
  return (
    <>
      <div className="dialog-body">
        <div className="form-grid">
          <Field label="分类名称">
            <input
              autoFocus
              value={v.name}
              maxLength={30}
              onChange={(e) => set({ ...v, name: e.target.value })}
            />
          </Field>
          <Field label="收支类型">
            <select
              value={v.kind}
              disabled={
                !!p.item && p.w.expenses.some((e) => e.categoryId === v.id)
              }
              onChange={(e) =>
                set({ ...v, kind: e.target.value as any, annual: false })
              }
            >
              <option value="expense">支出</option>
              <option value="income">收入</option>
            </select>
          </Field>
          <Field label="分类颜色">
            <input
              type="color"
              value={v.color}
              onChange={(e) => set({ ...v, color: e.target.value })}
            />
          </Field>
          {v.kind === "expense" && (
            <Field label="统计分摊方式">
              <select
                value={v.annual ? "annual" : "ordinary"}
                onChange={(e) =>
                  set({ ...v, annual: e.target.value === "annual" })
                }
              >
                <option value="ordinary">普通费用</option>
                <option value="annual">年度费用</option>
              </select>
            </Field>
          )}
        </div>
        <p className="notice">
          修改分摊方式后，此分类的历史费用也会按新的方式统计。
        </p>
        <ErrorBox text={p.error} />
      </div>
      <FormFoot
        busy={p.busy}
        onClose={p.onClose}
        label="保存分类"
        onSave={() => commit({ ...p.w, categories: update(p.w.categories, v) })}
      />
    </>
  );
}
