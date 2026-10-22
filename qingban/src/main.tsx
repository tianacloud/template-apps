import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  addDays,
  dateLabel,
  day,
  monthLabel,
  monthStart,
  moveMonth,
  today,
} from "./dates";
import {
  newRoster,
  slotName,
  uid,
  validate,
  type Roster,
  type Workspace,
} from "./model";
import {
  CloudRepository,
  Conflict,
  type Repository,
  type Runtime,
  type Snapshot,
} from "./storage";
import { Button, ConfirmButton, Icon, errorMessage } from "./ui";
import { DayEditor, RosterEditor, Shifts, type Save } from "./editors";
import { RotationEditor } from "./rotation-ui";
import { Month, Week, Summary, Stats } from "./calendar";
import { Files } from "./files-ui";
import css from "./style.css";
const nav = [
  { id: "calendar", label: "日历", icon: "calendar" },
  { id: "stats", label: "排班统计", icon: "chart" },
  { id: "shifts", label: "班次设置", icon: "clock" },
  { id: "files", label: "导入导出", icon: "file" },
];
interface Route {
  page: string;
  date: string;
  roster: string;
  view: "month" | "week";
}
function readRoute(): Route {
  const [page, query] = location.hash.slice(1).split("?"),
    params = new URLSearchParams(query);
  let date = params.get("date") || today();
  try {
    day(date);
  } catch {
    date = today();
  }
  return {
    page: nav.some((n) => n.id === page) ? page : "calendar",
    date,
    roster: params.get("roster") ?? "",
    view: params.get("view") === "week" ? "week" : "month",
  };
}
export function App({
  repository,
  demo = false,
  onReset,
}: {
  repository: Repository;
  demo?: boolean;
  onReset?: () => void;
}) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null),
    current = useRef(snapshot),
    [route, setRoute] = useState(readRoute),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    working = useRef(false),
    [modal, setModal] = useState<
      "day" | "roster" | "new-roster" | "rotation" | "extend" | null
    >(null),
    [search, setSearch] = useState("");
  const replace = useCallback((s: Snapshot) => {
    current.current = s;
    setSnapshot(s);
  }, []);
  const load = useCallback(async () => {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    try {
      replace(await repository.load());
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      working.current = false;
      setBusy(false);
    }
  }, [repository, replace]);
  useEffect(() => {
    void load();
    const change = () => {
      setRoute(readRoute());
      setSearch("");
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, [load]);
  const save: Save = async (next) => {
    if (working.current || !current.current) return false;
    working.current = true;
    setBusy(true);
    setError("");
    try {
      validate(next);
      replace(await repository.save(current.current, next));
      setNotice("已保存");
      return true;
    } catch (e) {
      if (e instanceof Conflict) {
        const latest = await repository.load().catch(() => null);
        if (latest) replace(latest);
      }
      setError(errorMessage(e));
      return false;
    } finally {
      working.current = false;
      setBusy(false);
    }
  };
  const w = snapshot?.data,
    r = w?.rosters.find((r) => r.id === route.roster) ?? w?.rosters[0];
  const go = (patch: Partial<Route>) => {
    const next = { ...route, roster: r?.id ?? "", ...patch };
    const params = new URLSearchParams({
      roster: next.roster,
      date: next.date,
      view: next.view,
    });
    location.hash = next.page + "?" + params;
    setRoute(next);
    setSearch("");
  };
  const chooseDay = (date: string) => {
    go({ date });
    setModal("day");
  };
  const shiftDate = (n: number) =>
    go({
      date:
        route.view === "week"
          ? addDays(route.date, n * 7)
          : moveMonth(route.date, n),
    });
  const verify = async () => {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    try {
      replace(await repository.verifyPending());
      setError("");
      setNotice("已核实保存结果");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      working.current = false;
      setBusy(false);
    }
  };
  const hits =
    w && r && search.trim()
      ? Array.from(
          new Set([...Object.keys(r.entries), ...Object.keys(r.notes)]),
        )
          .filter((d) =>
            `${d} ${slotName(w, r, r.entries[d] ?? null)} ${r.notes[d] ?? ""}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
          .sort()
          .slice(0, 100)
      : [];
  const navItem = (item: (typeof nav)[number]) => (
    <button
      type="button"
      key={item.id}
      className={route.page === item.id ? "active" : ""}
      aria-current={route.page === item.id ? "page" : undefined}
      onClick={() => go({ page: item.id })}
    >
      <Icon name={item.icon} />
      <span>{item.label}</span>
    </button>
  );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#calendar">
          <span className="brand-mark">
            <Icon name="leaf" size={28} />
          </span>
          <span>
            <b>
              青班 <small>QINGBAN</small>
            </b>
            <em>工作有序，生活有余</em>
          </span>
        </a>
        <Button
          kind="primary new-roster"
          icon="plus"
          disabled={busy}
          onClick={() => setModal("new-roster")}
        >
          新建班表
        </Button>
        <nav aria-label="页面导航">{nav.map(navItem)}</nav>
        <div className="rosters-heading">
          <span>我的班表</span>
          <button
            type="button"
            aria-label="添加班表"
            onClick={() => setModal("new-roster")}
          >
            <Icon name="plus" size={17} />
          </button>
        </div>
        <div className="roster-list">
          {w?.rosters.map((roster) => (
            <button
              type="button"
              className={roster.id === r?.id ? "active" : ""}
              key={roster.id}
              onClick={() => go({ roster: roster.id })}
            >
              <span className="roster-dot" />
              {roster.name}
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <Icon name="leaf" />
          <p>
            把每一天
            <br />
            安排成喜欢的样子。
          </p>
          <div className="save-state" role="status">
            <i className={busy ? "working" : ""} />
            {demo
              ? "示例 · 仅本页"
              : repository.pending
                ? "保存结果待核实"
                : busy
                  ? "正在保存…"
                  : notice || "个人排班工作区"}
          </div>
          <Button
            disabled={busy}
            onClick={() => {
              if (modal) {
                setError("请先保存或取消当前编辑，再重新读取。");
                return;
              }
              void load();
            }}
          >
            重新读取
          </Button>
        </div>
      </aside>
      <main className="workspace">
        {demo && (
          <div className="demo-banner">
            <span>示例体验 · 数据仅保留在本页</span>
            <button type="button" onClick={onReset}>
              恢复示例
            </button>
          </div>
        )}
        {error && (
          <div className="app-error" role="alert">
            <span>{error}</span>
            <Button
              disabled={busy}
              onClick={() => (repository.pending ? void verify() : void load())}
            >
              {repository.pending ? "核实保存结果" : "重新读取"}
            </Button>
            <Button
              aria-label="收起错误提示"
              icon="close"
              kind="icon"
              onClick={() => setError("")}
            />
          </div>
        )}
        <header className="topbar">
          <div className="mobile-brand">
            <Icon name="leaf" />
            <b>青班</b>
          </div>
          <div className="breadcrumb">
            我的班表 <span>/</span> {r?.name ?? "新的一页"}
          </div>
          <div className="topbar-right">
            <span className="personal-badge">
              <Icon name="check" size={14} />
              个人空间
            </span>
            <select
              aria-label="当前班表"
              value={r?.id ?? ""}
              onChange={(e) => {
                if (e.target.value === "new") setModal("new-roster");
                else go({ roster: e.target.value });
              }}
            >
              {!r && <option value="">选择班表</option>}
              {w?.rosters.map((roster) => (
                <option key={roster.id} value={roster.id}>
                  {roster.name}
                </option>
              ))}
              <option value="new">＋ 新建班表</option>
            </select>
          </div>
        </header>
        {!w ? (
          <div className="loading">
            <Icon name="leaf" size={40} />
            <h2>{error ? "暂时无法连接工作区" : "正在打开你的日历"}</h2>
            <p>让每一天，都有合适的节奏。</p>
          </div>
        ) : (
          <fieldset
            className="app-content"
            disabled={busy || repository.pending}
          >
            {route.page === "shifts" ? (
              <Shifts w={w} r={r} save={save} busy={busy} />
            ) : route.page === "files" ? (
              <Files
                w={w}
                r={r}
                date={route.date}
                save={save}
                busy={busy}
                demo={demo}
              />
            ) : !r ? (
              <div className="empty">
                <div className="empty-art">
                  <Icon name="calendar" size={72} />
                  <i />
                  <i />
                  <i />
                </div>
                <p className="eyebrow">A LITTLE ORDER, MORE LIFE</p>
                <h1>从一份班表开始</h1>
                <p>
                  安排工作，也为自己的生活留白。
                  <br />
                  先建班表，再用循环轻松延续。
                </p>
                <Button
                  kind="primary"
                  icon="plus"
                  onClick={() => setModal("new-roster")}
                >
                  创建我的班表
                </Button>
              </div>
            ) : (
              <>
                <section className="calendar-heading">
                  <div>
                    <p className="eyebrow">
                      {route.page === "stats"
                        ? "YOUR RHYTHM"
                        : "WORK IN BALANCE"}
                    </p>
                    <h1>
                      {route.page === "stats"
                        ? "排班统计"
                        : monthLabel(route.date)}
                    </h1>
                    <p className="muted">
                      {route.page === "stats"
                        ? "从数据中看见工作与休息的节奏。"
                        : r.name + " · 每一班，都从容有序"}
                    </p>
                  </div>
                  <div className="heading-actions">
                    <Button
                      icon="left"
                      aria-label="上一期"
                      onClick={() => shiftDate(-1)}
                    />
                    <input
                      type="month"
                      aria-label="选择月份"
                      value={route.date.slice(0, 7)}
                      onChange={(e) =>
                        e.target.value && go({ date: e.target.value + "-01" })
                      }
                    />
                    <Button
                      icon="right"
                      aria-label="下一期"
                      onClick={() => shiftDate(1)}
                    />
                    <Button onClick={() => go({ date: today() })}>今天</Button>
                  </div>
                </section>
                <div className="calendar-toolbar">
                  <div className="tabs">
                    <button
                      type="button"
                      className={route.view === "month" ? "active" : ""}
                      onClick={() => go({ view: "month" })}
                    >
                      月{route.page === "calendar" ? "历" : ""}
                    </button>
                    <button
                      type="button"
                      className={route.view === "week" ? "active" : ""}
                      onClick={() => go({ view: "week" })}
                    >
                      周{route.page === "calendar" ? "视图" : ""}
                    </button>
                  </div>
                  {route.page === "calendar" && (
                    <label className="search">
                      <Icon name="search" size={18} />
                      <input
                        aria-label="搜索排班"
                        placeholder="搜索班次、日期或备注"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </label>
                  )}
                  <div className="toolbar-tools">
                    <Button icon="cycle" onClick={() => setModal("rotation")}>
                      循环排班
                    </Button>
                    <details className="roster-menu">
                      <summary aria-label="班表操作">
                        <Icon name="more" />
                      </summary>
                      <div>
                        <button
                          type="button"
                          onClick={() => setModal("extend")}
                        >
                          自动续排
                        </button>
                        <button
                          type="button"
                          onClick={() => setModal("roster")}
                        >
                          班表设置
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const next = structuredClone(w),
                              copy = structuredClone(r);
                            copy.id = uid();
                            copy.name = (r.name + " · 副本").slice(0, 60);
                            next.rosters.push(copy);
                            if (await save(next)) go({ roster: copy.id });
                          }}
                        >
                          复制班表
                        </button>
                        <ConfirmButton
                          className="danger"
                          message={`删除「${r.name}」及其排班、备注和循环方案？此操作不可恢复。`}
                          onConfirm={async () => {
                            const next = structuredClone(w);
                            next.rosters = next.rosters.filter(
                              (x) => x.id !== r.id,
                            );
                            return save(next);
                          }}
                        >
                          删除班表
                        </ConfirmButton>
                      </div>
                    </details>
                  </div>
                </div>
                {route.page === "stats" ? (
                  <Stats w={w} r={r} date={route.date} period={route.view} />
                ) : search.trim() ? (
                  <section className="search-results panel">
                    <h2>
                      搜索结果 <small>最多显示 100 项</small>
                    </h2>
                    {hits.length ? (
                      hits.map((d) => (
                        <button
                          type="button"
                          key={d}
                          onClick={() => chooseDay(d)}
                        >
                          <span>{dateLabel(d)}</span>
                          <strong>
                            {slotName(w, r, r.entries[d] ?? null)}
                          </strong>
                          <small>{r.notes[d]}</small>
                        </button>
                      ))
                    ) : (
                      <p className="muted">没有符合条件的排班。</p>
                    )}
                  </section>
                ) : (
                  <div className="calendar-layout">
                    <section className="calendar-panel">
                      {route.view === "month" ? (
                        <Month
                          w={w}
                          r={r}
                          date={route.date}
                          select={chooseDay}
                        />
                      ) : (
                        <Week
                          w={w}
                          r={r}
                          date={route.date}
                          select={chooseDay}
                        />
                      )}
                      <div className="calendar-legend">
                        {w.shifts
                          .filter(
                            (s) => r.enabled.includes(s.id) && !s.archived,
                          )
                          .map((s) => (
                            <span key={s.id}>
                              <i
                                style={{
                                  background:
                                    r.overrides[s.id]?.color ?? s.color,
                                }}
                              />
                              {slotName(w, r, s.id)}
                            </span>
                          ))}
                        <span>
                          <i className="rest-dot" />
                          休息
                        </span>
                      </div>
                    </section>
                    <Summary
                      w={w}
                      r={r}
                      date={route.date}
                      edit={() => setModal("day")}
                      cycle={() => setModal("rotation")}
                      extend={() => setModal("extend")}
                    />
                  </div>
                )}
              </>
            )}
          </fieldset>
        )}
        {w &&
          modal &&
          (modal === "new-roster" || modal === "roster" ? (
            <RosterEditor
              key={modal}
              w={w}
              r={modal === "roster" ? r : undefined}
              save={save}
              busy={busy}
              close={() => setModal(null)}
            />
          ) : (
            r &&
            (modal === "day" ? (
              <DayEditor
                key={r.id + route.date}
                w={w}
                r={r}
                date={route.date}
                save={save}
                busy={busy}
                close={() => setModal(null)}
              />
            ) : (
              <RotationEditor
                key={modal + r.id}
                w={w}
                r={r}
                date={route.date}
                save={save}
                busy={busy}
                extend={modal === "extend"}
                close={() => setModal(null)}
              />
            ))
          ))}
      </main>
      <nav className="mobile-nav" aria-label="主要页面">
        {nav.map(navItem)}
      </nav>
    </div>
  );
}
export function applyStyles() {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
  document.documentElement.lang = "zh-CN";
  document.title = "青班 · 轮班日历";
}
export async function mount(element: HTMLElement, runtime: Runtime) {
  applyStyles();
  createRoot(element).render(<App repository={new CloudRepository(runtime)} />);
}
