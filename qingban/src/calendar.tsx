import type { CSSProperties } from "react";
import {
  addDays,
  clockMinutes,
  dateLabel,
  dates,
  day,
  monthEnd,
  monthStart,
  today,
  weekDay,
  weekdays,
  weekStart,
} from "./dates";
import {
  duration,
  resolveShift,
  slotName,
  timeLabel,
  type Roster,
  type Workspace,
} from "./model";
import { statistics } from "./rotation";
import { Button, Icon } from "./ui";
export function Month({
  w,
  r,
  date,
  select,
}: {
  w: Workspace;
  r: Roster;
  date: string;
  select: (d: string) => void;
}) {
  const first = monthStart(date),
    last = monthEnd(date),
    start = addDays(first, -weekDay(first)),
    end = addDays(last, 6 - weekDay(last)),
    list = dates(start, end),
    current = today();
  return (
    <div className="month-grid" role="group" aria-label="月历">
      {weekdays.map((d, i) => (
        <span className={"week-label " + (i >= 5 ? "weekend" : "")} key={d}>
          周{d}
        </span>
      ))}
      {list.map((d) => {
        const s = resolveShift(w, r, r.entries[d] ?? null);
        return (
          <button
            type="button"
            key={d}
            aria-label={`${d} ${s?.name ?? "休息"}${r.notes[d] ? " 有备注" : ""}`}
            className={
              "day-cell " +
              (!d.startsWith(date.slice(0, 7)) ? "other-month " : "") +
              (d === date ? "selected-day " : "") +
              (d === current ? "today" : "")
            }
            onClick={() => select(d)}
          >
            <span className="day-number">
              {Number(d.slice(8))}
              {r.notes[d] && <i aria-label="有备注" />}
            </span>
            <span
              className={"calendar-shift " + (!s ? "rest" : "")}
              style={{ "--shift": s?.color ?? "#c0c7b8" } as CSSProperties}
            >
              {s?.name ?? "休"}
            </span>
            {s?.start && <small>{s.start}</small>}
          </button>
        );
      })}
    </div>
  );
}
export function Week({
  w,
  r,
  date,
  select,
}: {
  w: Workspace;
  r: Roster;
  date: string;
  select: (d: string) => void;
}) {
  const start = weekStart(date),
    list = dates(start, addDays(start, 6));
  return (
    <div className="week-list">
      {list.map((d) => {
        const items = dates(addDays(d, -7), d).flatMap((source) => {
          const s = resolveShift(w, r, r.entries[source] ?? null);
          if (!s) return [];
          if (!s.start)
            return source === d
              ? [{ s, source, left: 0, width: 100, untimed: true }]
              : [];
          const a = day(source) * 1440 + clockMinutes(s.start),
            b = a + duration(s),
            left = Math.max(day(d) * 1440, a),
            right = Math.min((day(d) + 1) * 1440, b);
          return right > left
            ? [
                {
                  s,
                  source,
                  left: ((left - day(d) * 1440) / 1440) * 100,
                  width: ((right - left) / 1440) * 100,
                  untimed: false,
                },
              ]
            : [];
        });
        return (
          <article
            className={"week-day " + (d === date ? "current" : "")}
            key={d}
          >
            <button
              type="button"
              onClick={() => select(d)}
              className="week-day-title"
            >
              <span>周{weekdays[weekDay(d)]}</span>
              <b>{Number(d.slice(8))}</b>
              <small>{Number(d.slice(5, 7))}月</small>
            </button>
            <div className="week-day-content">
              <div className="time-scale">
                <span>00:00</span>
                <span>06</span>
                <span>12</span>
                <span>18</span>
                <span>24:00</span>
              </div>
              {items.length ? (
                items.map(({ s, source, left, width, untimed }) => (
                  <div key={source} className="timeline-row">
                    <div className="timeline-track">
                      <span
                        className="timeline-bar"
                        style={{
                          left: left + "%",
                          width: width + "%",
                          background: s.color,
                        }}
                      />
                    </div>
                    <button type="button" onClick={() => select(source)}>
                      <span className="dot" style={{ background: s.color }} />
                      <strong>{s.name}</strong>
                      <span>
                        {untimed
                          ? "未设置时间"
                          : source !== d
                            ? `承接 ${source} · ${timeLabel(s)}`
                            : timeLabel(s)}
                      </span>
                    </button>
                  </div>
                ))
              ) : (
                <p className="rest-text">休息 · 留一点时间给自己</p>
              )}
              {r.notes[d] && <p className="day-note">{r.notes[d]}</p>}
            </div>
          </article>
        );
      })}
    </div>
  );
}
export function Summary({
  w,
  r,
  date,
  edit,
  cycle,
  extend,
}: {
  w: Workspace;
  r: Roster;
  date: string;
  edit: () => void;
  cycle: () => void;
  extend: () => void;
}) {
  const s = resolveShift(w, r, r.entries[date] ?? null),
    stats = statistics(w, r, monthStart(date), monthEnd(date));
  return (
    <aside className="day-summary">
      <article className="focus-card">
        <p className="eyebrow">{date === today() ? "TODAY" : "YOUR DAY"}</p>
        <div className="focus-heading">
          <h2>{dateLabel(date)}</h2>
          <Icon
            name={s?.start && s.start >= "18:00" ? "moon" : "sun"}
            size={28}
          />
        </div>
        <div className="focus-shift">
          <span className="dot" style={{ background: s?.color ?? "#b6c2a8" }} />
          <strong>{s?.name ?? "休息"}</strong>
        </div>
        <p>{timeLabel(s)}</p>
        {s && <small className="muted">{duration(s) / 60} 小时</small>}
        {r.notes[date] && <p className="focus-note">{r.notes[date]}</p>}
        <Button icon="edit" onClick={edit}>
          编辑当天
        </Button>
      </article>
      <article className="panel compact">
        <div className="section-heading">
          <h3>本月节奏</h3>
          <Icon name="chart" />
        </div>
        <div className="summary-numbers">
          <div>
            <b>{stats.work}</b>
            <span>工作日</span>
          </div>
          <div>
            <b>{stats.rest}</b>
            <span>休息日</span>
          </div>
          <div>
            <b>{Number((stats.minutes / 60).toFixed(1))}</b>
            <span>小时</span>
          </div>
        </div>
        <div className="composition">
          {Array.from(stats.counts).map(([id, item]) => (
            <span
              key={id}
              title={`${slotName(w, r, id)} ${item.count} 天`}
              style={{
                width: (item.count / stats.total) * 100 + "%",
                background: resolveShift(w, r, id)!.color,
              }}
            />
          ))}
          <span
            style={{
              width: (stats.rest / stats.total) * 100 + "%",
              background: "#e1e6dc",
            }}
          />
        </div>
        <p className="muted small">按班次开始日计入，包含跨日工时。</p>
      </article>
      <article className="panel compact tool-card">
        <Icon name="cycle" size={26} />
        <h3>让节奏自然延续</h3>
        <p className="muted">从循环到例外规则，预览之后再安排。</p>
        <Button kind="primary" onClick={cycle}>
          设置循环
        </Button>
        <Button onClick={extend}>自动续排</Button>
      </article>
    </aside>
  );
}
export function Stats({
  w,
  r,
  date,
  period,
}: {
  w: Workspace;
  r: Roster;
  date: string;
  period: "month" | "week";
}) {
  const start = period === "month" ? monthStart(date) : weekStart(date),
    end = period === "month" ? monthEnd(date) : addDays(start, 6),
    stats = statistics(w, r, start, end),
    weeks = Array.from(new Set(dates(start, end).map(weekStart))).map((d) => ({
      date: d,
      minutes: statistics(
        w,
        r,
        d < start ? start : d,
        addDays(d, 6) > end ? end : addDays(d, 6),
      ).minutes,
    })),
    max = Math.max(1, ...weeks.map((w) => w.minutes));
  return (
    <section className="stats-body">
      <p className="muted">
        {start} — {end} · {r.name}
      </p>
      <div className="metric-cards">
        {[
          [Number((stats.minutes / 60).toFixed(1)), "总工时", "小时"],
          [stats.work, "出勤天数", "天"],
          [stats.rest, "休息天数", "天"],
          [Math.round((stats.work / stats.total) * 100), "出勤率", "%"],
        ].map(([n, label, unit]) => (
          <article className="panel" key={label}>
            <span className="muted">{label}</span>
            <strong>
              {n}
              <small>{unit}</small>
            </strong>
          </article>
        ))}
      </div>
      <div className="stats-columns">
        <article className="panel">
          <h2>班次构成</h2>
          {w.shifts.map((s) => {
            const n = stats.counts.get(s.id);
            if (!n && !r.enabled.includes(s.id)) return null;
            return (
              <div className="stat-row" key={s.id}>
                <span
                  className="dot"
                  style={{ background: resolveShift(w, r, s.id)!.color }}
                />
                <span>{slotName(w, r, s.id)}</span>
                <b>{n?.count ?? 0} 天</b>
                <span>{Number(((n?.minutes ?? 0) / 60).toFixed(1))} h</span>
                <small>
                  {stats.work
                    ? Math.round(((n?.count ?? 0) / stats.work) * 100)
                    : 0}
                  %
                </small>
              </div>
            );
          })}
          <div className="stat-row">
            <span className="dot rest-dot" />
            <span>休息</span>
            <b>{stats.rest} 天</b>
          </div>
        </article>
        <article className="panel">
          <h2>按周工时</h2>
          <div
            className="bar-chart"
            role="img"
            aria-label={weeks
              .map((w) => `${w.date} 当周 ${w.minutes / 60} 小时`)
              .join("；")}
          >
            {weeks.map((w) => (
              <div className="bar-column" key={w.date}>
                <span>{Number((w.minutes / 60).toFixed(1))} h</span>
                <i style={{ height: `${(w.minutes / max) * 155 + 2}px` }} />
                <small>{w.date.slice(5)}</small>
              </div>
            ))}
          </div>
          <p className="muted small">仅统计所选范围内开始的班次。</p>
        </article>
      </div>
    </section>
  );
}
