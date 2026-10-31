import { useState } from "react";
import {
  today,
  dayNumber,
  ordered,
  parseBackup,
  type Workspace,
  type Vehicle,
  type Fuel,
} from "./model";
import {
  fuelStats,
  costRows,
  costSummary,
  monthAdd,
  nextDay,
  summarize,
  dueMaintenance,
  csv,
  type Trip,
} from "./calculations";
import { Icon, fmt, money, Stat, CardTitle, Empty, CarArt } from "./ui";
import { TrendChart, MonthlyChart, Donut } from "./charts";
export type ModalKind =
  | "fuel"
  | "vehicle"
  | "expense"
  | "maintenance"
  | "category"
  | "detail"
  | "help"
  | "delete";
export interface PageProps {
  w: Workspace;
  car: Vehicle;
  open: (type: ModalKind, id?: string) => void;
  nav: (route: string) => void;
  demo: boolean;
  busy: boolean;
  save: (w: Workspace) => Promise<void>;
  notify: (s: string) => void;
  setCar: (id: string) => void;
}
export function FuelRows({
  fuels,
  trips,
  open,
  compact = false,
}: {
  fuels: Fuel[];
  trips: Trip[];
  open: PageProps["open"];
  compact?: boolean;
}) {
  const map = new Map(trips.map((t) => [t.start.id, t]));
  return (
    <div className={"fuel-table " + (compact ? "compact" : "")}>
      <div className="fuel-table-head">
        <span>加油记录</span>
        <span>油量 / 单价</span>
        <span>实付金额</span>
        <span>百公里油耗</span>
        <span />
      </div>
      {fuels.map((f) => {
        const t = map.get(f.id);
        return (
          <button
            className="fuel-table-row"
            key={f.id}
            onClick={() => open("detail", f.id)}
          >
            <div className="fuel-main">
              <span className={"record-icon " + (f.full ? "" : "partial")}>
                <Icon name="fuel" size={19} />
              </span>
              <div>
                <strong>
                  {f.date.slice(5, 10).replace("-", "月")}日{" "}
                  <small>
                    {f.full ? "已加满" : "未加满"}
                    {f.missed ? " · 漏记" : ""}
                  </small>
                </strong>
                <span>
                  {f.station || "未填写加油站"}
                  <i>·</i>
                  {fmt(f.odometer, 0)} km
                </span>
              </div>
            </div>
            <div className="fuel-volume">
              <strong>
                {fmt(f.liters)}
                <small> L</small>
              </strong>
              <span>¥{fmt(f.price)}/L</span>
            </div>
            <div className="fuel-paid">
              <strong>{money(f.paidCents / 100)}</strong>
              <span>
                {f.grossCents > f.paidCents
                  ? `已省 ¥${fmt((f.grossCents - f.paidCents) / 100)}`
                  : f.grade}
              </span>
            </div>
            <div className="fuel-rate">
              <strong>
                {fmt(t?.rate)}
                <small>{t?.rate != null ? " L" : ""}</small>
              </strong>
              <span>
                {t?.rate != null
                  ? t.stage
                    ? "阶段油耗"
                    : "单次油耗"
                  : t
                    ? "条件不足"
                    : "等待下次"}
              </span>
            </div>
            <Icon name="chevron" size={16} />
          </button>
        );
      })}
    </div>
  );
}
export function Dashboard(p: PageProps) {
  const s = fuelStats(p.w.fuels.filter((f) => f.vehicleId === p.car.id)),
    date = today(),
    month = date.slice(0, 7),
    rows = costRows(p.w, p.car.id),
    monthly = costSummary(
      rows,
      month + "-01",
      monthAdd(month, 1) + "-01",
      "cash",
    ),
    last = s.rows.at(-1),
    due = dueMaintenance(p.w, p.car, s.odometer),
    year = costSummary(
      rows,
      date.slice(0, 4) + "-01-01",
      nextDay(date),
      "cash",
    );
  return (
    <>
      <div className="overview-grid">
        <section className="overview-card">
          <div className="hero-top">
            <span className="eyebrow">每一程，都心中有数</span>
            <span className="tag">
              <i className="dot green" /> {p.car.fuel}
            </span>
          </div>
          <div className="hero-content">
            <div>
              <p className="muted">
                平均油耗{" "}
                <button
                  className="help-dot"
                  aria-label="查看油耗算法"
                  onClick={() => p.open("help")}
                >
                  ?
                </button>
              </p>
              <div className="big-number">
                {fmt(s.average)}
                <span>
                  L<small>/100km</small>
                </span>
              </div>
              <div className="hero-label">
                <Icon name="leaf" size={16} />
                {s.average === null
                  ? "从下一次加满开始，了解爱车"
                  : `已记录 ${s.rows.length} 次加油，${fmt(s.knownDistance, 0)} 公里有效行程`}
              </div>
            </div>
            <div className="hero-car">
              <CarArt />
              <span>{p.car.model || p.car.name}</span>
            </div>
          </div>
          <div className="hero-bottom">
            <span>
              最近油耗{" "}
              <strong>
                {fmt(s.recent)}
                <small> L/100km</small>
              </strong>
            </span>
            <i />
            <span>
              耗油成本{" "}
              <strong>
                {fmt(s.perKm)}
                <small> 元/公里</small>
              </strong>
            </span>
            <button className="text-button" onClick={() => p.nav("statistics")}>
              查看分析 <Icon name="arrow" size={16} />
            </button>
          </div>
        </section>
        <section className="quick-card">
          <span className="eyebrow">认真记录，好好出发</span>
          <h2>给爱车记一笔</h2>
          <p>把油耗和花费，变成看得见的安心。</p>
          <button
            className="primary yellow"
            disabled={p.car.archived}
            onClick={() => p.open("fuel")}
          >
            <Icon name="plus" /> 记加油 <Icon name="arrow" size={17} />
          </button>
          <div className="quick-options">
            <button disabled={p.car.archived} onClick={() => p.open("expense")}>
              <Icon name="wallet" size={18} />
              记费用
            </button>
            <i />
            <button
              disabled={p.car.archived}
              onClick={() => p.open("maintenance")}
            >
              <Icon name="tool" size={18} />
              记保养
            </button>
          </div>
          <div className="quick-decoration">↗</div>
        </section>
      </div>
      <div className="metrics-grid">
        <Stat
          label="累计行驶"
          value={fmt(s.distance, 0)}
          unit="公里"
          icon="road"
          foot={`总里程 ${fmt(s.odometer, 0)} km`}
        />
        <Stat
          label="累计加油"
          value={fmt(s.liters)}
          unit="升"
          icon="fuel"
          foot={`${s.rows.length} 次温柔的补给`}
        />
        <Stat
          label="本月支出"
          value={"¥" + fmt(monthly.expense)}
          icon="wallet"
          foot={`${month.replace("-", "年")}月 · 实付口径`}
        />
        <Stat
          label="累计优惠"
          value={"¥" + fmt(s.savings)}
          icon="leaf"
          foot="每一份节省，都有记录"
        />
      </div>
      <div className="content-grid">
        <section className="card trend-card">
          <CardTitle
            title="油耗变化趋势"
            icon="chart"
            action={
              <button
                className="text-button"
                onClick={() => p.nav("statistics")}
              >
                全部记录 <Icon name="chevron" size={14} />
              </button>
            }
          />
          <TrendChart
            trips={s.trips.slice(-12)}
            onSelect={(id) => p.open("detail", id)}
          />
          <div className="chart-foot">
            <span>
              最低油耗 <strong>{fmt(s.minimum)}</strong>
            </span>
            <span>
              最高油耗 <strong>{fmt(s.maximum)}</strong>
            </span>
            <small>单位：L/100km · 按行程起点日期</small>
          </div>
        </section>
        <section className="card last-fill">
          <CardTitle title="上次加油" icon="fuel" />
          {last ? (
            <>
              <div className="last-price">
                <span>{last.grade} · 挂牌单价</span>
                <strong>
                  {fmt(last.price)}
                  <small>元/升</small>
                </strong>
              </div>
              <div className="last-fill-info">
                <p>
                  <span>加油日期</span>
                  <strong>{last.date.slice(0, 10).replaceAll("-", ".")}</strong>
                </p>
                <p>
                  <span>加油站</span>
                  <strong>{last.station || "未填写"}</strong>
                </p>
                <p>
                  <span>实付金额</span>
                  <strong>{money(last.paidCents / 100)}</strong>
                </p>
              </div>
              <button
                className="outline-button"
                onClick={() => p.open("detail", last.id)}
              >
                查看这次记录 <Icon name="arrow" size={15} />
              </button>
            </>
          ) : (
            <Empty title="还没留下第一笔">
              记下油量与总里程，慢慢积累一条属于你的曲线。
            </Empty>
          )}
        </section>
      </div>
      <div className="content-grid">
        <section className="card recent-records">
          <CardTitle
            title="最近加油记录"
            action={
              <button className="text-button" onClick={() => p.nav("records")}>
                查看全部 <Icon name="chevron" size={14} />
              </button>
            }
          />
          {s.rows.length ? (
            <FuelRows
              compact
              fuels={s.rows.slice(-3).reverse()}
              trips={s.trips}
              open={p.open}
            />
          ) : (
            <Empty
              title="旅程从第一笔开始"
              action={
                <button className="primary" onClick={() => p.open("fuel")}>
                  记录第一次加油
                </button>
              }
            >
              如实填写加满和亮灯状态，算清每一公里。
            </Empty>
          )}
        </section>
        <section className="card maintenance-note">
          <CardTitle title="爱车小提醒" icon="bell" />
          {due.length ? (
            due.slice(0, 2).map((m) => (
              <button
                key={m.id}
                className="reminder"
                onClick={() => p.open("maintenance", m.id)}
              >
                <span className={"record-icon " + (m.due ? "warning" : "")}>
                  <Icon name="tool" />
                </span>
                <div>
                  <strong>{m.title}</strong>
                  <p>
                    {m.due
                      ? "保养条件已到，记得安排检查"
                      : m.days !== null
                        ? `距离下次保养还有 ${m.days} 天`
                        : `距离下次保养还有 ${fmt(m.km, 0)} 公里`}
                  </p>
                </div>
                <Icon name="chevron" size={15} />
              </button>
            ))
          ) : (
            <div className="tip-illustration">
              <Icon name="shield" size={35} />
              <h3>好车况，陪你走更远</h3>
              <p>
                记录保养项目与下次时间，
                <br />
                把对爱车的照顾放在心上。
              </p>
            </div>
          )}
          <button className="text-button" onClick={() => p.nav("vehicles")}>
            管理车辆与保养 <Icon name="arrow" size={15} />
          </button>
        </section>
      </div>
      <p className="page-footer">
        <Icon name="leaf" size={13} /> 用心记录每一次出发{" "}
        <span>行迹 · 你的个人汽车账本</span>
      </p>
    </>
  );
}
export function Records(p: PageProps) {
  const [search, setSearch] = useState(""),
    [month, setMonth] = useState(""),
    [filter, setFilter] = useState("all"),
    s = fuelStats(p.w.fuels.filter((f) => f.vehicleId === p.car.id)),
    list = s.rows
      .filter(
        (f) =>
          (!month || f.date.startsWith(month)) &&
          (filter === "all" ||
            (filter === "full" && f.full) ||
            (filter === "partial" && !f.full)) &&
          `${f.station} ${f.note} ${f.odometer} ${f.date}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      )
      .reverse();
  return (
    <section className="card">
      <CardTitle
        title="加油详单"
        action={
          <span className="muted">
            {s.rows.length} 次加油 · 累计 {fmt(s.liters)} 升
          </span>
        }
      />
      <div className="filter-bar">
        <label className="search-field">
          <Icon name="search" size={18} />
          <input
            aria-label="搜索加油记录"
            value={search}
            placeholder="搜索加油站、备注或里程"
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <input
          aria-label="筛选月份"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <div className="tabs">
          {[
            ["all", "全部"],
            ["full", "已加满"],
            ["partial", "未加满"],
          ].map(([k, t]) => (
            <button
              key={k}
              className={filter === k ? "active" : ""}
              onClick={() => setFilter(k)}
            >
              {t}
            </button>
          ))}
        </div>
        {(search || month || filter !== "all") && (
          <button
            className="text-button"
            onClick={() => {
              setSearch("");
              setMonth("");
              setFilter("all");
            }}
          >
            清除筛选
          </button>
        )}
      </div>
      <div className="list-summary">
        <span>
          当前显示 <strong>{list.length}</strong> 条
        </span>
        <span>
          加油量{" "}
          <strong>{fmt(list.reduce((a, f) => a + f.liters, 0))} L</strong>
        </span>
        <span>
          实付{" "}
          <strong>
            {money(list.reduce((a, f) => a + f.paidCents, 0) / 100)}
          </strong>
        </span>
      </div>
      {list.length ? (
        <FuelRows fuels={list} trips={s.trips} open={p.open} />
      ) : (
        <Empty title={s.rows.length ? "没有找到相符记录" : "还没有加油记录"}>
          换个关键词试试，或记下你的第一次加油。
        </Empty>
      )}
      <div className="info-line">
        <Icon name="help" size={16} />
        <p>
          油耗归于这条记录开始的行程。最后一条等待下次加油，未能计算时显示“—”。
        </p>
        <button className="text-button" onClick={() => p.open("help")}>
          了解计算规则
        </button>
      </div>
    </section>
  );
}
export function Statistics(p: PageProps) {
  const [range, setRange] = useState("year"),
    s = fuelStats(p.w.fuels.filter((f) => f.vehicleId === p.car.id)),
    now = today(),
    from =
      range === "year"
        ? now.slice(0, 4) + "-01-01"
        : range === "quarter"
          ? monthAdd(now.slice(0, 7), -2) + "-01"
          : "1900-01-01",
    trips = s.trips.filter(
      (t) => t.start.date >= from && t.start.date.slice(0, 10) <= now,
    ),
    summary = summarize(trips),
    rows = costRows(p.w, p.car.id),
    stations = new Map<
      string,
      { count: number; liters: number; paid: number }
    >();
  for (const f of s.rows.filter(
    (f) => f.date >= from && f.date.slice(0, 10) <= now,
  )) {
    const name = f.station || "未填写加油站",
      v = stations.get(name) ?? { count: 0, liters: 0, paid: 0 };
    v.count++;
    v.liters += f.liters;
    v.paid += f.paidCents / 100;
    stations.set(name, v);
  }
  return (
    <>
      <div className="section-toolbar">
        <p>看见变化，也看见每一程的进步。</p>
        <div className="tabs">
          {[
            ["quarter", "近3个月"],
            ["year", "今年"],
            ["all", "全部"],
          ].map(([k, t]) => (
            <button
              key={k}
              className={range === k ? "active" : ""}
              onClick={() => setRange(k)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="metrics-grid">
        <Stat
          label="平均油耗"
          value={fmt(summary.average)}
          unit="L/100km"
          icon="fuel"
        />
        <Stat
          label="最低油耗"
          value={fmt(summary.minimum)}
          unit="L/100km"
          icon="leaf"
        />
        <Stat
          label="最高油耗"
          value={fmt(summary.maximum)}
          unit="L/100km"
          icon="chart"
        />
        <Stat
          label="有效统计里程"
          value={fmt(summary.knownDistance, 0)}
          unit="km"
          icon="road"
        />
      </div>
      <section className="card">
        <CardTitle
          title="每一次加油，连成一条风景"
          action={
            <span className="tag">
              {trips.filter((t) => t.rate !== null).length} 段有效行程
            </span>
          }
        />
        <TrendChart trips={trips} onSelect={(id) => p.open("detail", id)} />
      </section>
      <div className="two-columns">
        <section className="card">
          <CardTitle
            title="油费月度支出"
            action={<span className="muted">最近6个月 · 实付</span>}
          />
          <MonthlyChart
            rows={rows.filter((r) => r.source === "fuel")}
            month={now.slice(0, 7)}
          />
        </section>
        <section className="card">
          <CardTitle
            title="加油站比较"
            action={<span className="muted">优惠后均价</span>}
          />
          {[...stations.entries()]
            .sort((a, b) => a[1].paid / a[1].liters - b[1].paid / b[1].liters)
            .map(([name, v]) => (
              <div className="station-row" key={name}>
                <span className="record-icon">
                  <Icon name="fuel" />
                </span>
                <div>
                  <strong>{name}</strong>
                  <small>
                    {v.count} 次 · {fmt(v.liters)} 升
                  </small>
                </div>
                <strong>
                  {fmt(v.paid / v.liters)}
                  <small> 元/升</small>
                </strong>
              </div>
            ))}
          {!stations.size && (
            <Empty title="还没有可比较的加油站">
              记录加油站后，平均单价会显示在这里。
            </Empty>
          )}
          <p className="fine-print">
            仅使用本车记录计算，车型、油品与驾驶环境也会影响油耗。
          </p>
        </section>
      </div>
      <section className="card">
        <CardTitle title="行程报告" />
        <div className="report-metrics">
          <div>
            <span>已知耗油量</span>
            <strong>
              {fmt(summary.consumed)} <small>升</small>
            </strong>
          </div>
          <div>
            <span>已消耗燃油成本</span>
            <strong>{money(summary.consumedCost)}</strong>
          </div>
          <div>
            <span>平均耗油成本</span>
            <strong>
              {fmt(summary.perKm)} <small>元/公里</small>
            </strong>
          </div>
        </div>
        <p className="fine-print">
          按行程起点日期筛选。耗油成本按最近加油的实际单价分摊；燃油来源不足时使用最早可知单价估计。
          {trips.some((t) => t.estimatedCost) ? "当前报告包含成本估计。" : ""}
        </p>
      </section>
    </>
  );
}
export function Expenses(p: PageProps) {
  const [month, setMonth] = useState(today().slice(0, 7)),
    [mode, setMode] = useState<"cash" | "accrual">("cash"),
    [kind, setKind] = useState("all"),
    rows = costRows(p.w, p.car.id),
    from = month ? month + "-01" : "1900-01-01",
    to = month ? monthAdd(month, 1) + "-01" : nextDay(today()),
    effectiveTo = mode === "accrual" && to > today() ? today() : to,
    summary = costSummary(rows, from, effectiveTo, mode),
    list = rows.filter(
      (r) =>
        (!month || r.date.startsWith(month)) &&
        (kind === "all" || r.kind === kind),
    );
  return (
    <>
      <div className="section-toolbar">
        <div className="row">
          <input
            aria-label="费用月份"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <button className="text-button" onClick={() => setMonth("")}>
            全部时间
          </button>
        </div>
        <div className="tabs">
          <button
            className={mode === "cash" ? "active" : ""}
            onClick={() => setMode("cash")}
          >
            实付支出
          </button>
          <button
            className={mode === "accrual" ? "active" : ""}
            onClick={() => setMode("accrual")}
          >
            按日分摊
          </button>
        </div>
      </div>
      <div className="three-metrics">
        <Stat
          label={mode === "cash" ? "实付总支出" : "已分摊支出"}
          value={money(summary.expense)}
          icon="wallet"
        />
        <Stat label="用车收入" value={money(summary.income)} icon="arrowdown" />
        <Stat
          label="收支差额"
          value={money(summary.income - summary.expense)}
          icon="receipt"
        />
      </div>
      <div className="two-columns">
        <section className="card">
          <CardTitle
            title="支出月度统计"
            action={
              <span className="muted">
                {mode === "cash" ? "实付口径" : "按日分摊"}
              </span>
            }
          />
          <MonthlyChart
            rows={rows.filter((r) => mode === "cash" || r.date < today())}
            month={month || today().slice(0, 7)}
            mode={mode}
          />
        </section>
        <section className="card">
          <CardTitle title="钱都花在哪里" />
          <Donut categories={summary.categories} total={summary.expense} />
        </section>
      </div>
      {mode === "accrual" && (
        <p className="notice">
          年度费用按发生日起未来一年分摊，仅计入截至今天之前已过的天数。下面的详单保留原始实付金额。
        </p>
      )}
      <section className="card">
        <CardTitle
          title="收支明细"
          action={
            <div className="row">
              <button
                className="text-button"
                onClick={() => p.open("category")}
              >
                管理分类
              </button>
              <div className="tabs">
                {[
                  ["all", "全部"],
                  ["expense", "支出"],
                  ["income", "收入"],
                ].map(([k, t]) => (
                  <button
                    key={k}
                    className={kind === k ? "active" : ""}
                    onClick={() => setKind(k)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          }
        />
        {list.map((r) => (
          <button
            className="cost-row"
            key={r.id}
            onClick={() =>
              p.open(
                r.source === "fuel"
                  ? "detail"
                  : r.source === "maintenance"
                    ? "maintenance"
                    : "expense",
                r.id,
              )
            }
          >
            <span
              className="record-icon"
              style={{ color: r.color, background: r.color + "17" }}
            >
              <Icon
                name={
                  r.source === "fuel"
                    ? "fuel"
                    : r.source === "maintenance"
                      ? "tool"
                      : "wallet"
                }
              />
            </span>
            <div>
              <strong>
                {r.name} {r.annual && <small className="mini-tag">年度</small>}
              </strong>
              <span>
                {r.note || "未填写备注"} · {r.date}
              </span>
            </div>
            <strong className={r.kind === "income" ? "positive" : ""}>
              {r.kind === "income" ? "+" : "−"} {money(r.cents / 100)}
            </strong>
            <Icon name="chevron" size={15} />
          </button>
        ))}
        {!list.length && (
          <Empty title="这个月，账本还是空白">
            记下停车、过路或洗车费用，了解完整的用车开销。
          </Empty>
        )}
      </section>
    </>
  );
}
export function Vehicles(p: PageProps) {
  const stat = fuelStats(p.w.fuels.filter((f) => f.vehicleId === p.car.id)),
    maintenance = p.w.maintenance
      .filter((m) => m.vehicleId === p.car.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <div className="vehicle-grid">
        {p.w.vehicles.map((c) => (
          <section
            key={c.id}
            className={
              "card vehicle-card " + (p.car.id === c.id ? "selected" : "")
            }
          >
            <div className="row between">
              <span className="record-icon">
                <Icon name="car" size={24} />
              </span>
              <span className="tag">
                {c.archived
                  ? "已归档"
                  : p.car.id === c.id
                    ? "当前车辆"
                    : "在用"}
              </span>
            </div>
            <CarArt />
            <h2>{c.name}</h2>
            <p>{c.model || "我的爱车"}</p>
            <div className="vehicle-facts">
              <span>{c.fuel}</span>
              <span>{c.capacity}L 油箱</span>
              <span>{c.plate || "未设置车牌"}</span>
            </div>
            <div className="vehicle-actions">
              <button onClick={() => p.open("vehicle", c.id)}>
                <Icon name="edit" size={15} />
                编辑车辆
              </button>
              <button
                className={p.car.id === c.id ? "text-button" : "primary"}
                onClick={() => p.setCar(c.id)}
                disabled={p.car.id === c.id}
              >
                {p.car.id === c.id ? "正在查看" : "切换车辆"}
              </button>
            </div>
          </section>
        ))}
        <button className="add-car-card" onClick={() => p.open("vehicle")}>
          <span>
            <Icon name="plus" size={28} />
          </span>
          <strong>添加一辆爱车</strong>
          <small>汽车与摩托车，分别记录</small>
        </button>
      </div>
      <section className="card">
        <CardTitle
          title={p.car.name + " · 保养记录"}
          action={
            <button
              className="primary"
              disabled={p.car.archived}
              onClick={() => p.open("maintenance")}
            >
              <Icon name="plus" size={17} />
              记保养
            </button>
          }
        />
        {maintenance.map((m) => (
          <div key={m.id} className="maintenance-row">
            <span className="record-icon">
              <Icon name="tool" />
            </span>
            <div>
              <strong>{m.title}</strong>
              <p>
                {m.date} · {fmt(m.odometer, 0)} km · {money(m.cents / 100)}
              </p>
              {(m.nextDate || m.nextOdometer > 0) && (
                <small>
                  下次：
                  {[
                    m.nextDate,
                    m.nextOdometer ? fmt(m.nextOdometer, 0) + " 公里" : "",
                  ]
                    .filter(Boolean)
                    .join(" / ")}
                </small>
              )}
            </div>
            <button
              className="icon-button"
              aria-label={"编辑保养 " + m.title}
              onClick={() => p.open("maintenance", m.id)}
            >
              <Icon name="edit" size={16} />
            </button>
            <button
              className="icon-button danger-text"
              aria-label={"删除保养 " + m.title}
              onClick={() => p.open("delete", m.id)}
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        ))}
        {!maintenance.length && (
          <Empty
            title="照顾好爱车的每个细节"
            action={
              <button
                className="outline-button"
                onClick={() => p.open("maintenance")}
              >
                添加保养记录
              </button>
            }
          >
            记录换油、检查与维修，下次保养不再靠记忆。
          </Empty>
        )}
      </section>
    </>
  );
}
export function DataPage(p: PageProps) {
  const [pending, setPending] = useState<Workspace | null>(null),
    [confirm, setConfirm] = useState(false),
    [error, setError] = useState("");
  function download(text: string, type: string, name: string) {
    if (p.demo) return;
    const url = URL.createObjectURL(new Blob([text], { type })),
      a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    p.notify("已导出 " + name);
  }
  return (
    <>
      <section className="card">
        <CardTitle title="把每一段旅程，好好收藏" icon="folder" />
        <p className="muted">
          完整备份包含所有车辆、加油、费用、分类和保养记录；CSV
          用于查看和整理明细。
        </p>
        {p.demo && (
          <p className="notice">
            示例体验中的下载和导入不可用，安装后即可导出和恢复个人账本。
          </p>
        )}
        <div className="export-grid">
          <button
            disabled={p.demo}
            onClick={() =>
              download(
                JSON.stringify(
                  {
                    format: "xingji-backup",
                    exportedAt: new Date().toISOString(),
                    data: p.w,
                  },
                  null,
                  2,
                ),
                "application/json",
                "xingji-backup.json",
              )
            }
          >
            <Icon name="download" size={28} />
            <strong>完整 JSON 备份</strong>
            <small>所有车辆与记录，可完整恢复</small>
          </button>
          <button
            disabled={p.demo}
            onClick={() =>
              download(
                csv([
                  [
                    "日期",
                    "车辆",
                    "总里程",
                    "加油量L",
                    "单价",
                    "挂牌金额",
                    "实付",
                    "加满",
                    "亮灯",
                    "漏记",
                    "油品",
                    "油站",
                    "备注",
                  ],
                  ...p.w.fuels.map((f) => [
                    f.date,
                    p.w.vehicles.find((c) => c.id === f.vehicleId)!.name,
                    f.odometer,
                    f.liters,
                    f.price,
                    f.grossCents / 100,
                    f.paidCents / 100,
                    f.full ? "是" : "否",
                    f.light ? "是" : "否",
                    f.missed ? "是" : "否",
                    f.grade,
                    f.station,
                    f.note,
                  ]),
                ]),
                "text/csv;charset=utf-8",
                "xingji-fuel.csv",
              )
            }
          >
            <Icon name="fuel" size={28} />
            <strong>加油明细 CSV</strong>
            <small>油量、优惠、油站及里程</small>
          </button>
          <button
            disabled={p.demo}
            onClick={() =>
              download(
                csv([
                  ["日期", "车辆", "类型", "金额", "备注"],
                  ...p.w.vehicles.flatMap((c) =>
                    costRows(p.w, c.id).map((r) => [
                      r.date,
                      c.name,
                      r.name,
                      ((r.kind === "income" ? -1 : 1) * r.cents) / 100,
                      r.note,
                    ]),
                  ),
                ]),
                "text/csv;charset=utf-8",
                "xingji-costs.csv",
              )
            }
          >
            <Icon name="wallet" size={28} />
            <strong>收支明细 CSV</strong>
            <small>加油、费用与保养合并导出</small>
          </button>
          <button
            disabled={p.demo}
            onClick={() =>
              download(
                csv([
                  [
                    "日期",
                    "车辆",
                    "保养项目",
                    "总里程",
                    "金额",
                    "下次日期",
                    "下次里程",
                    "备注",
                  ],
                  ...p.w.maintenance.map((m) => [
                    m.date,
                    p.w.vehicles.find((c) => c.id === m.vehicleId)!.name,
                    m.title,
                    m.odometer,
                    m.cents / 100,
                    m.nextDate,
                    m.nextOdometer,
                    m.note,
                  ]),
                ]),
                "text/csv;charset=utf-8",
                "xingji-maintenance.csv",
              )
            }
          >
            <Icon name="tool" size={28} />
            <strong>保养明细 CSV</strong>
            <small>保养内容及下次计划</small>
          </button>
        </div>
      </section>
      <section className="card">
        <CardTitle title="从备份恢复" icon="upload" />
        <p className="muted">
          选择行迹的 JSON
          备份，先预览数据，再确认替换。当前账本会被完整替换，请先导出备份。
        </p>
        <label className={"upload-box " + (p.demo ? "disabled" : "")}>
          <Icon name="upload" size={25} />
          <strong>选择 JSON 备份文件</strong>
          <small>最大6MB · 仅支持完整JSON备份</small>
          <input
            aria-label="导入备份文件"
            type="file"
            accept="application/json,.json"
            disabled={p.demo || p.busy}
            onChange={async (e) => {
              setError("");
              setPending(null);
              setConfirm(false);
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                if (f.size > 6 * 1024 * 1024) throw Error("备份超过6MB");
                setPending(parseBackup(await f.text()));
              } catch (x) {
                setError(x instanceof Error ? x.message : "无法读取备份");
              }
            }}
          />
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        {pending && (
          <div className="import-preview">
            <h3>准备恢复这些记录</h3>
            <p>
              {pending.vehicles.length} 辆车辆 · {pending.fuels.length} 条加油 ·{" "}
              {pending.expenses.length} 条费用 · {pending.maintenance.length}{" "}
              条保养
            </p>
            <label className="check-row">
              <input
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
              />
              我已备份当前账本，确认完整替换
            </label>
            <div className="row">
              <button
                disabled={p.busy}
                onClick={() => {
                  setPending(null);
                  setConfirm(false);
                }}
              >
                取消恢复
              </button>
              <button
                className="primary"
                disabled={!confirm || p.busy}
                onClick={async () => {
                  try {
                    await p.save(pending);
                    setPending(null);
                    setConfirm(false);
                  } catch {}
                }}
              >
                确认恢复备份
              </button>
            </div>
          </div>
        )}
      </section>
      <section className="card">
        <CardTitle
          title="费用分类"
          action={
            <button className="text-button" onClick={() => p.open("category")}>
              添加分类 <Icon name="plus" size={16} />
            </button>
          }
        />
        <div className="category-list">
          {p.w.categories.map((c) => (
            <button key={c.id} onClick={() => p.open("category", c.id)}>
              <i className="dot" style={{ background: c.color }} />
              <strong>{c.name}</strong>
              <small>
                {c.kind === "income"
                  ? "收入"
                  : c.annual
                    ? "年度分摊"
                    : "普通支出"}
              </small>
              <Icon name="edit" size={14} />
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
