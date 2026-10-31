import { useState } from "react";
import { today } from "./model";
import { fmt, Empty } from "./ui";
import { costSummary, monthAdd, type CostRow, type Trip } from "./calculations";
export function TrendChart({
  trips,
  onSelect,
}: {
  trips: Trip[];
  onSelect?: (id: string) => void;
}) {
  const [hover, setHover] = useState(-1),
    points = trips.filter((t) => t.rate !== null);
  if (!points.length)
    return (
      <Empty title="等下一次加满，就有答案">
        至少两次加满或两次亮灯记录，才能绘出油耗曲线。
      </Empty>
    );
  const values = points.map((t) => t.rate!),
    min = Math.max(0, Math.floor(Math.min(...values) - 0.5)),
    max = Math.ceil(Math.max(...values) + 0.5),
    h = 180,
    w = 700,
    average =
      points.reduce((s, t) => s + t.rate! * t.distance, 0) /
      points.reduce((s, t) => s + t.distance, 0),
    x = (i: number) => 48 + (i * (w - 74)) / Math.max(points.length - 1, 1),
    y = (v: number) => 20 + ((max - v) / (max - min)) * (h - 45),
    coords = points.map((t, i) => `${x(i)},${y(t.rate!)}`).join(" ");
  const focused = hover >= 0 ? points[hover] : null;
  return (
    <div className="trend-wrap">
      <div className="chart-legend">
        <span>
          <i className="dot green" />
          百公里油耗
        </span>
        <span>
          <i className="line-dot" />
          平均 {fmt(average)} L/100km
        </span>
        <small>
          {focused
            ? `${focused.start.date.slice(5, 10).replace("-", "/")} · ${fmt(focused.rate)} L/100km`
            : "点选曲线上的记录查看行程"}
        </small>
      </div>
      <svg
        className="trend-svg"
        viewBox={`0 0 ${w} ${h}`}
        aria-label="油耗变化趋势图"
        role="img"
      >
        <defs>
          <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#1bb67e" stopOpacity=".2" />
            <stop offset="1" stopColor="#1bb67e" stopOpacity=".01" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => {
          const val = min + ((max - min) * i) / 3;
          return (
            <g key={i}>
              <line
                x1="43"
                x2="685"
                y1={y(val)}
                y2={y(val)}
                stroke="#e9eeea"
                strokeDasharray="3 4"
              />
              <text x="25" y={y(val) + 4} textAnchor="end">
                {fmt(val, 1)}
              </text>
            </g>
          );
        })}
        <polygon
          points={`${x(0)},${h - 25} ${coords} ${x(points.length - 1)},${h - 25}`}
          fill="url(#greenFill)"
        />
        <line
          x1="48"
          x2="685"
          y1={y(average)}
          y2={y(average)}
          stroke="#aebdb4"
          strokeDasharray="5 5"
        />
        <polyline
          points={coords}
          stroke="#19ad77"
          fill="none"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {points.map((t, i) => (
          <g key={t.start.id} onMouseEnter={() => setHover(i)}>
            <circle cx={x(i)} cy={y(t.rate!)} r="13" fill="transparent" />
            <circle
              cx={x(i)}
              cy={y(t.rate!)}
              r={hover === i ? 5 : 3.5}
              fill="#fff"
              stroke="#16aa73"
              strokeWidth="2"
            />
            {(i === 0 ||
              i === points.length - 1 ||
              i === Math.floor(points.length / 2)) && (
              <text x={x(i)} y={h - 3} textAnchor="middle">
                {t.start.date.slice(5, 10).replace("-", "/")}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="chart-point-buttons">
        {points.map((t, i) => (
          <button
            key={t.start.id}
            aria-label={`${t.start.date.slice(0, 10)} 油耗 ${fmt(t.rate)}`}
            className={hover === i ? "active" : ""}
            onClick={() => {
              setHover(i);
              onSelect?.(t.start.id);
            }}
          >
            {t.start.date.slice(5, 10).replace("-", "/")}
            <strong>{fmt(t.rate)}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}
export function MonthlyChart({
  rows,
  month,
  mode = "cash",
}: {
  rows: CostRow[];
  month: string;
  mode?: "cash" | "accrual";
}) {
  const months = Array.from({ length: 6 }, (_, i) => monthAdd(month, i - 5)),
    data = months.map((m) =>
      costSummary(
        rows,
        m + "-01",
        mode === "accrual" && monthAdd(m, 1) + "-01" > today()
          ? today()
          : monthAdd(m, 1) + "-01",
        mode,
      ),
    ),
    max = Math.max(...data.map((d) => d.expense), 100);
  return (
    <div className="monthly-chart">
      {data.map((d, i) => (
        <div
          className="bar-column"
          key={months[i]}
          title={`${months[i]} 支出 ${fmt(d.expense)} 元`}
        >
          <span>{fmt(d.expense, 0)}</span>
          <div className="bar-track">
            <div
              className="bar-stack"
              style={{ height: `${(d.expense / max) * 100}%` }}
            >
              {[...d.categories].reverse().map((c) => (
                <i
                  key={c.name}
                  style={{
                    background: c.color,
                    height: `${(c.amount / Math.max(d.expense, 1)) * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>
          <small>{Number(months[i].slice(5))}月</small>
        </div>
      ))}
    </div>
  );
}
export function Donut({
  categories,
  total,
}: {
  categories: { name: string; color: string; amount: number }[];
  total: number;
}) {
  let sum = 0;
  const stops = categories.map((c) => {
    const start = sum;
    sum += (c.amount / Math.max(total, 1)) * 100;
    return `${c.color} ${start}% ${sum}%`;
  });
  return (
    <div className="donut-layout">
      <div
        className="donut"
        style={{
          background: stops.length
            ? `conic-gradient(${stops.join(",")})`
            : "#edf1ee",
        }}
      >
        <div>
          <span>总支出</span>
          <strong>{fmt(total, 0)}</strong>
          <small>元</small>
        </div>
      </div>
      <div className="donut-legend">
        {categories.slice(0, 6).map((c) => (
          <div key={c.name}>
            <span>
              <i className="dot" style={{ background: c.color }} />
              {c.name}
            </span>
            <strong>
              {fmt((c.amount / Math.max(total, 1)) * 100, 1)}
              <small>%</small>
            </strong>
          </div>
        ))}
        {!categories.length && <p className="muted">还没有支出记录</p>}
      </div>
    </div>
  );
}
