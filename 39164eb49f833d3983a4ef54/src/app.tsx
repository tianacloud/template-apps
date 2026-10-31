import { useEffect, useRef, useState } from "react";
import { type Workspace, validate, emptyWorkspace, today } from "./model";
import { type Repository, type Snapshot } from "./storage";
import { sampleWorkspace } from "./sample";
import { fuelStats } from "./calculations";
import { Brand, Icon, Modal, Empty, fmt, money, FormFoot, CarArt } from "./ui";
import {
  FuelEditor,
  VehicleEditor,
  ExpenseEditor,
  MaintenanceEditor,
  CategoryEditor,
  type EditorProps,
} from "./editors";
import {
  Dashboard,
  Records,
  Statistics,
  Expenses,
  Vehicles,
  DataPage,
  type ModalKind,
  type PageProps,
} from "./pages";
const routes = [
  { id: "overview", label: "爱车概览", short: "概览", icon: "home" },
  { id: "records", label: "加油记录", short: "加油", icon: "fuel" },
  { id: "statistics", label: "油耗统计", short: "统计", icon: "chart" },
  { id: "expenses", label: "用车费用", short: "费用", icon: "wallet" },
  { id: "vehicles", label: "车辆与保养", short: "爱车", icon: "car" },
  { id: "data", label: "数据与设置", short: "设置", icon: "settings" },
];
export function App({
  repository,
  initial,
  demo = false,
}: {
  repository?: Repository;
  initial?: Workspace;
  demo?: boolean;
}) {
  const [snap, setSnap] = useState<Snapshot | null>(
      initial ? { revision: 0, data: initial } : null,
    ),
    [route, setRoute] = useState(
      demo ? "overview" : location.hash.slice(1).split("?")[0] || "overview",
    ),
    [selected, setSelected] = useState(
      demo
        ? ""
        : (new URLSearchParams(location.hash.split("?")[1]).get("car") ?? ""),
    ),
    [modal, setModal] = useState<{ type: ModalKind; id?: string } | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [pending, setPending] = useState(false),
    [reset, setReset] = useState(false);
  const lock = useRef(false),
    toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const w = snap?.data,
    car =
      w?.vehicles.find((v) => v.id === selected) ??
      w?.vehicles.find((v) => !v.archived) ??
      w?.vehicles[0],
    active = routes.find((r) => r.id === route) ?? routes[0];
  useEffect(() => {
    if (!repository) return;
    let live = true;
    repository
      .load()
      .then((s) => {
        if (live) {
          setSnap(s);
          setPending(repository.pending);
        }
      })
      .catch((e) => {
        if (live) {
          setError(e.message);
          setPending(repository.pending);
        }
      });
    return () => {
      live = false;
    };
  }, [repository]);
  useEffect(() => {
    if (demo) return;
    const fn = () => {
      setRoute(location.hash.slice(1).split("?")[0] || "overview");
      setSelected(
        new URLSearchParams(location.hash.split("?")[1]).get("car") ?? "",
      );
    };
    addEventListener("hashchange", fn);
    return () => removeEventListener("hashchange", fn);
  }, [demo]);
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (lock.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    addEventListener("beforeunload", fn);
    return () => removeEventListener("beforeunload", fn);
  }, []);
  function nav(r: string) {
    if (busy) return;
    setRoute(r);
    if (!demo)
      location.hash = r + (car ? "?car=" + encodeURIComponent(car.id) : "");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function notify(s: string) {
    setToast(s);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  }
  function open(type: ModalKind, id?: string) {
    if (busy) return;
    setError("");
    setModal({ type, id });
  }
  function close() {
    if (!lock.current) {
      setModal(null);
      setError("");
    }
  }
  async function save(next: Workspace) {
    if (lock.current || !snap) throw Error("请等待当前保存完成");
    if (repository?.pending) {
      setPending(true);
      setError("上次保存结果尚未确认，请先核实");
      throw Error("待核实");
    }
    try {
      validate(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "记录无效");
      throw e;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const s = repository
        ? await repository.save(snap, next)
        : { revision: snap.revision + 1, data: next };
      setSnap(s);
      setModal(null);
      notify("已保存，记录又多了一程");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "保存失败，请保留输入并检查连接",
      );
      throw e;
    } finally {
      lock.current = false;
      setBusy(false);
      setPending(repository?.pending ?? false);
    }
  }
  async function reload(verify = false) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      if (repository) {
        const s = verify
          ? await repository.verifyPending()
          : await repository.load();
        setSnap(s);
        setPending(repository.pending);
        setError("");
        notify(
          verify ? "已核实保存结果，请重新打开记录查看" : "已读取最新账本",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "读取失败");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function setCar(id: string) {
    if (busy) return;
    setSelected(id);
    if (!demo) location.hash = route + "?car=" + encodeURIComponent(id);
    setError("");
    notify("已切换车辆");
  }
  if (!w)
    return (
      <div className="loading-page">
        <Brand />
        <Icon name="road" size={46} />
        <h2>{error ? "账本暂时无法打开" : "正在打开你的行迹…"}</h2>
        <p>{error || "每一公里，都值得认真记录"}</p>
        {error && (
          <button
            className="primary"
            onClick={() => void reload(pending)}
            disabled={busy}
          >
            重新读取账本
          </button>
        )}
      </div>
    );
  const props: PageProps = {
      w,
      car: car!,
      open,
      nav,
      demo,
      busy,
      save,
      notify,
      setCar,
    },
    editor: EditorProps = {
      w,
      vehicleId: car?.id ?? "",
      busy,
      error,
      onClose: close,
      save,
    };
  const fuels = car
      ? fuelStats(w.fuels.filter((f) => f.vehicleId === car.id))
      : null,
    detail =
      modal?.type === "detail"
        ? w.fuels.find((f) => f.id === modal.id)
        : undefined,
    trip = fuels?.trips.find((t) => t.start.id === detail?.id),
    removing =
      modal?.type === "delete"
        ? (w.fuels.find((f) => f.id === modal.id) ??
          w.expenses.find((e) => e.id === modal.id) ??
          w.maintenance.find((m) => m.id === modal.id))
        : undefined;
  const saveQuiet = (next: Workspace) => {
    void save(next).catch(() => {});
  };
  const typeTitles: Record<ModalKind, string> = {
    fuel: modal?.id ? "编辑加油记录" : "记录一次加油",
    vehicle: modal?.id ? "编辑爱车" : "添加一辆爱车",
    expense: modal?.id ? "编辑费用记录" : "记录用车费用",
    maintenance: modal?.id ? "编辑保养记录" : "记录一次保养",
    category: modal?.id ? "编辑费用分类" : "添加费用分类",
    detail: "加油记录详情",
    help: "让每一公里，都算得明白",
    delete: "删除这条记录",
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <div className="sidebar-label">我的用车生活</div>
        <nav aria-label="页面导航">
          {routes.slice(0, 5).map((r) => (
            <button
              key={r.id}
              className={active.id === r.id ? "active" : ""}
              onClick={() => nav(r.id)}
            >
              <Icon name={r.icon} size={20} />
              <span>{r.label}</span>
              {active.id === r.id && <i />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="road-badge">
            <Icon name="leaf" size={24} />
          </span>
          <strong>出发，去看看世界</strong>
          <p>
            把平凡的里程，
            <br />
            记成生活的风景。
          </p>
          <span className="note-road">⌁</span>
        </div>
        <div className="sidebar-bottom">
          <button
            className={active.id === "data" ? "active" : ""}
            onClick={() => nav("data")}
          >
            <Icon name="settings" size={19} />
            数据与设置
          </button>
          <button onClick={() => open("help")}>
            <Icon name="help" size={19} />
            使用帮助
          </button>
          <div className="profile">
            <span>迹</span>
            <div>
              <strong>我的个人账本</strong>
              <small>{demo ? "示例体验" : "记录安心，同步随行"}</small>
            </div>
            <Icon name="shield" size={17} />
          </div>
        </div>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <Icon name="car" size={16} />
            <span>我的车库</span>
            <b>/</b>
            <strong>{active.label}</strong>
          </div>
          <div className="topbar-right">
            <span className="date">
              <Icon name="calendar" size={15} />
              {today().replaceAll("-", ".")}{" "}
              {
                ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
                  new Date().getDay()
                ]
              }
            </span>
            <button
              className="sync-button"
              disabled={busy || demo}
              onClick={() => void reload(pending)}
            >
              <i className={busy ? "pending" : ""} />
              {demo
                ? "示例体验"
                : busy
                  ? "同步中"
                  : pending
                    ? "待核实"
                    : "已同步"}
            </button>
            <button
              className="icon-button"
              aria-label="打开使用帮助"
              onClick={() => open("help")}
            >
              <Icon name="help" size={19} />
            </button>
          </div>
        </header>
        <div className="mobile-brand">
          <Brand />
          <button
            className="icon-button"
            aria-label="数据与设置"
            onClick={() => nav("data")}
          >
            <Icon name="settings" />
          </button>
        </div>
        {demo && (
          <div className="demo-bar">
            <span>
              <i />
              示例体验 · 数据仅保留在本页
            </span>
            <button
              disabled={busy}
              onClick={() => {
                setSnap({ revision: 0, data: sampleWorkspace() });
                setSelected("demo-car");
                setModal(null);
                setError("");
                nav("overview");
                notify("已恢复示例数据");
              }}
            >
              恢复示例 <Icon name="refresh" size={13} />
            </button>
          </div>
        )}
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              {active.id === "overview"
                ? "YOUR EVERYDAY DRIVE"
                : "A LITTLE RECORD, A LONG WAY"}
            </div>
            <h1>
              {active.id === "overview" ? "每一公里，心中有数。" : active.label}
            </h1>
            <p>
              {active.id === "overview"
                ? "记录真实油耗，让每一程都从容。"
                : active.id === "records"
                  ? "留下每一次补给，也留下生活的轨迹。"
                  : active.id === "statistics"
                    ? "看懂油耗变化，慢慢开出更好的自己。"
                    : active.id === "expenses"
                      ? "算清用车开销，把生活安排得更妥帖。"
                      : active.id === "vehicles"
                        ? "照顾好每一位陪你出发的伙伴。"
                        : "把属于你的行迹，稳稳地保存。"}
            </p>
          </div>
          <div className="heading-actions">
            {car && (
              <div className="car-select">
                <Icon name="car" size={18} />
                <select
                  aria-label="当前车辆"
                  value={car.id}
                  disabled={busy}
                  onChange={(e) => setCar(e.target.value)}
                >
                  {w.vehicles.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                      {c.archived ? "（已归档）" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {car && active.id !== "overview" && active.id !== "data" && (
              <button
                className="primary"
                disabled={car.archived || busy}
                onClick={() =>
                  open(
                    active.id === "expenses"
                      ? "expense"
                      : active.id === "vehicles"
                        ? "vehicle"
                        : "fuel",
                  )
                }
              >
                <Icon name="plus" size={17} />
                {active.id === "expenses"
                  ? "记费用"
                  : active.id === "vehicles"
                    ? "添加车辆"
                    : "记加油"}
              </button>
            )}
          </div>
        </div>
        {error && !modal && (
          <div className="app-error" role="alert">
            <Icon name="help" />
            <span>{error}</span>
            <button disabled={busy} onClick={() => void reload(pending)}>
              {pending ? "核实保存结果" : "读取最新数据"}
            </button>
          </div>
        )}
        {pending && !modal && (
          <div className="app-error" role="alert">
            <span>保存结果尚未确认，草稿已保留。请先核实结果。</span>
            <button disabled={busy} onClick={() => void reload(true)}>
              核实保存结果
            </button>
          </div>
        )}
        {!car && active.id !== "data" ? (
          <section className="card welcome-card">
            <CarArt />
            <div className="eyebrow">你好，新的旅程</div>
            <h2>从你的第一辆爱车开始</h2>
            <p>
              记下加油、费用和保养，
              <br />
              让零散的里程，成为看得懂的生活账本。
            </p>
            <button className="primary" onClick={() => open("vehicle")}>
              <Icon name="plus" size={18} />
              添加我的爱车
            </button>
            <button
              className="text-button"
              disabled={busy}
              onClick={() => saveQuiet(sampleWorkspace())}
            >
              先载入合成示例看看 <Icon name="arrow" size={16} />
            </button>
            <button className="text-button" onClick={() => nav("data")}>
              从已有备份恢复
            </button>
          </section>
        ) : (
          <>
            {car?.archived && (
              <p className="notice">
                这辆车已归档。历史记录可查看和修改，编辑车辆可重新启用。
              </p>
            )}
            {active.id === "overview" ? (
              <Dashboard {...props} />
            ) : active.id === "records" ? (
              <Records {...props} />
            ) : active.id === "statistics" ? (
              <Statistics {...props} />
            ) : active.id === "expenses" ? (
              <Expenses {...props} />
            ) : active.id === "vehicles" ? (
              <Vehicles {...props} />
            ) : (
              <DataPage {...props} />
            )}
          </>
        )}
      </main>
      <nav className="mobile-nav" aria-label="手机页面导航">
        {routes.slice(0, 5).map((r) => (
          <button
            className={active.id === r.id ? "active" : ""}
            key={r.id}
            onClick={() => nav(r.id)}
          >
            <Icon name={r.icon} size={21} />
            <span>{r.short}</span>
          </button>
        ))}
      </nav>
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={17} />
          {toast}
        </div>
      )}
      {modal && (
        <Modal
          key={modal.type + modal.id}
          title={typeTitles[modal.type]}
          subtitle={
            ["fuel", "detail", "maintenance"].includes(modal.type)
              ? car?.name
              : undefined
          }
          wide={modal.type === "fuel" || modal.type === "help"}
          busy={busy}
          onClose={close}
        >
          {pending && (
            <div className="app-error" role="alert">
              <span>保存结果尚未确认，草稿已保留。请先核实结果。</span>
              <button disabled={busy} onClick={() => void reload(true)}>
                核实保存结果
              </button>
            </div>
          )}
          {modal.type === "vehicle" && (
            <VehicleEditor
              {...editor}
              item={w.vehicles.find((v) => v.id === modal.id)}
            />
          )}
          {modal.type === "fuel" && car && (
            <FuelEditor
              {...editor}
              item={w.fuels.find((f) => f.id === modal.id)}
            />
          )}
          {modal.type === "expense" && car && (
            <ExpenseEditor
              {...editor}
              item={w.expenses.find((e) => e.id === modal.id)}
            />
          )}
          {modal.type === "maintenance" && car && (
            <MaintenanceEditor
              {...editor}
              item={w.maintenance.find((m) => m.id === modal.id)}
            />
          )}
          {modal.type === "category" && (
            <CategoryEditor
              {...editor}
              item={w.categories.find((c) => c.id === modal.id)}
            />
          )}
          {modal.type === "detail" && detail && (
            <>
              <div className="dialog-body">
                <div className="detail-hero">
                  <span className="record-icon">
                    <Icon name="fuel" size={27} />
                  </span>
                  <div>
                    <span>本次加油实付</span>
                    <strong>{money(detail.paidCents / 100)}</strong>
                  </div>
                  <span className="tag">
                    {detail.full ? "已加满" : "未加满"}
                  </span>
                </div>
                <dl className="detail-grid">
                  {[
                    ["加油时间", detail.date.replace("T", " ")],
                    ["总里程", fmt(detail.odometer, 0) + " 公里"],
                    ["加油量", fmt(detail.liters, 3) + " 升"],
                    ["挂牌单价", fmt(detail.price, 3) + " 元/升"],
                    ["挂牌金额", money(detail.grossCents / 100)],
                    [
                      "优惠金额",
                      money((detail.grossCents - detail.paidCents) / 100),
                    ],
                    ["油品", detail.grade],
                    ["加油站", detail.station || "未填写"],
                    ["油灯亮了", detail.light ? "是" : "否"],
                    ["上次漏记", detail.missed ? "是" : "否"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                {detail.note && (
                  <div className="detail-note">
                    <small>随手记</small>
                    <p>{detail.note}</p>
                  </div>
                )}
                <div className="trip-card">
                  <strong>这条记录之后的行程</strong>
                  {trip ? (
                    <>
                      <p>
                        {fmt(trip.distance, 0)} 公里 ·{" "}
                        {detail.date.slice(0, 10)} 至{" "}
                        {trip.end.date.slice(0, 10)}
                      </p>
                      <div>
                        <span>
                          百公里油耗
                          <strong>
                            {fmt(trip.rate)}
                            <small> L/100km</small>
                          </strong>
                        </span>
                        <span>
                          耗油成本
                          <strong>
                            {trip.cost === null ? "—" : money(trip.cost)}
                            {trip.estimatedCost && <small> 含估计</small>}
                          </strong>
                        </span>
                      </div>
                      <small>
                        {trip.rate === null
                          ? "加满/亮灯条件不足或存在漏记，暂不能计算。"
                          : `${trip.stage ? "阶段" : "单次"}油耗 · ${trip.method === "full" ? "加满法" : "亮灯法"}`}
                      </small>
                    </>
                  ) : (
                    <p>等待下一次加油，才能算出这段行程。</p>
                  )}
                </div>
              </div>
              <footer className="dialog-foot">
                <button
                  className="text-button danger-text"
                  disabled={busy}
                  onClick={() => open("delete", detail.id)}
                >
                  <Icon name="trash" size={15} />
                  删除
                </button>
                <div className="row">
                  <button onClick={close}>关闭</button>
                  <button
                    className="primary"
                    onClick={() => open("fuel", detail.id)}
                  >
                    <Icon name="edit" size={16} />
                    编辑记录
                  </button>
                </div>
              </footer>
            </>
          )}
          {modal.type === "delete" && removing && (
            <>
              <div className="dialog-body">
                <div className="delete-symbol">
                  <Icon name="trash" size={28} />
                </div>
                <h3>删除后会重新计算油耗和费用</h3>
                <p className="muted">这条记录将从当前车辆的账本中移除。</p>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
              </div>
              <footer className="dialog-foot">
                <span />
                <div className="row">
                  <button disabled={busy} onClick={close}>
                    保留记录
                  </button>
                  <button
                    className="danger"
                    disabled={busy}
                    onClick={() =>
                      saveQuiet({
                        ...w,
                        fuels: w.fuels.filter((f) => f.id !== modal.id),
                        expenses: w.expenses.filter((e) => e.id !== modal.id),
                        maintenance: w.maintenance.filter(
                          (m) => m.id !== modal.id,
                        ),
                      })
                    }
                  >
                    {busy ? "正在删除…" : "确认删除"}
                  </button>
                </div>
              </footer>
            </>
          )}
          {modal.type === "help" && (
            <>
              <div className="dialog-body help-content">
                <div className="help-intro">
                  <Icon name="leaf" size={30} />
                  <p>
                    如实记下每一次补给，
                    <br />
                    时间会给你一条清晰的曲线。
                  </p>
                </div>
                <h3>两次加满，算出一段真实油耗</h3>
                <p>
                  油耗 = 后一次加油量 ÷ 两次总里程之差 ×
                  100。例如第一次总里程10,000公里，第二次10,500公里并加满35升，这段油耗就是7.00
                  L/100km。
                </p>
                <h3>没有每次加满，也可以记录</h3>
                <p>
                  两次加满之间的加油量会累计，算出阶段油耗。两次亮灯也能成段，使用起点加油量。漏记会切断前面的累计，当前记录可成为新起点。油耗归于行程开始记录，最后一条等待下次加油；条件不足时显示“—”。
                </p>
                <h3>平均油耗与耗油成本</h3>
                <p>
                  平均油耗按有效行程的里程加权。耗油成本使用最近加油的优惠后单价分配实际耗油量；库存不足时按最早可知单价估计。它与包含最后一箱油的实付支出不同。
                </p>
                <h3>优惠金额与加油量</h3>
                <p>
                  挂牌单价 × 油量 = 挂牌金额，优惠 = 挂牌金额 −
                  实付。油量按挂牌金额计算，不会因为优惠而减少。请核对油枪小票，精确填写。
                </p>
                <h3>费用、保养和备份</h3>
                <p>
                  年度费用在实付视图按发生日记账，在分摊视图按未来一年逐日统计，今天尚未经过的天数不提前计入。保养费用自动计入支出；日期或里程到期会在打开应用时显示待办。完整JSON可恢复所有车辆，CSV方便整理明细。
                </p>
                <p className="notice">
                  适用于个人燃油汽车及摩托车记录。数据按应用分别保存，访问权限遵循所属Tiana租户。示例为合成记录。
                </p>
              </div>
              <footer className="dialog-foot">
                <span />
                <button className="primary" onClick={close}>
                  明白了，出发
                </button>
              </footer>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
