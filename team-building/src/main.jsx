import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Utensils,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Pencil,
  CalendarDays,
  MapPin,
  Clock,
  NotebookPen,
  Copy,
  History,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Search,
  MessageCircle,
  Send,
  Settings2,
  Lock,
  CheckCheck,
  Users,
  PartyPopper,
  Link as LinkIcon,
  Trash2,
  ImagePlus,
  Vote,
  Menu,
  LoaderCircle,
} from "lucide-react";
import { store, currentUser } from "./store.js";
import { previewImage } from "./preview.js";
import { newEvent, copyEvent, parseShare, leaders } from "./domain.js";
import "./style.css";
const css = document.createElement("link");
css.rel = "stylesheet";
css.href = new URL(/* @vite-ignore */ "./app.css", import.meta.url).href;
document.head.append(css);
document.title = "一起出发 · 团建活动";
const colors = ["mint", "peach", "blue", "lilac", "yellow"];
const tone = (id) =>
  colors[
    Array.from(id || "a").reduce((s, c) => s + c.charCodeAt(0), 0) %
      colors.length
  ];
const dateLabel = (value) =>
  value
    ? new Date(value).toLocaleString("zh-CN", {
        month: "long",
        day: "numeric",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "一起商量一个时间";
function Avatar({ person, size = "", onClick }) {
  const p = person || { name: "伙伴", id: "unknown" };
  return (
    <span
      className={`avatar ${p.color || tone(p.id)} ${size}`}
      title={p.name}
      onClick={onClick}
    >
      {p.avatar ? (
        <img src={p.avatar} alt={p.name} />
      ) : (
        <span>{p.name?.slice(-2) || "伙伴"}</span>
      )}
    </span>
  );
}
function IconButton({ icon: Icon, label, ...props }) {
  return (
    <button className="icon-button" aria-label={label} title={label} {...props}>
      <Icon size={16} />
    </button>
  );
}
function Modal({ title, subtitle, children, onClose }) {
  const ref = useRef();
  useEffect(() => {
    ref.current.showModal();
    return () => ref.current?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <IconButton icon={X} label="关闭对话框" onClick={onClose} />
      </div>
      {children}
    </dialog>
  );
}
function DinnerArt() {
  return (
    <div className="dinner-art" aria-hidden="true">
      <span className="art-spark one">✦</span>
      <span className="art-spark two">✧</span>
      <div className="fork">
        <i />
        <i />
        <i />
        <b />
      </div>
      <div className="plate">
        <div className="plate-inner">
          <span className="noodle n1" />
          <span className="noodle n2" />
          <span className="noodle n3" />
          <span className="leaf l1" />
          <span className="leaf l2" />
          <span className="tomato t1" />
          <span className="tomato t2" />
        </div>
      </div>
      <div className="spoon" />
      <span className="art-label">GOOD FOOD, GREAT COMPANY</span>
    </div>
  );
}
function VoteChart({ event }) {
  const votes = Object.values(event.votes).filter(
    (selected) => selected.length,
  );
  const rows = event.options
    .map((option) => ({
      id: option.id,
      name: option.name,
      count: votes.filter((selected) => selected.includes(option.id)).length,
    }))
    .sort((a, b) => b.count - a.count);
  if (!rows.length) return null;
  const max = rows[0].count;
  return (
    <section className="vote-chart" aria-label="餐厅得票排行">
      <div className="vote-chart-heading">
        <h3>
          <Vote size={16} /> 大家更想去哪家
        </h3>
        <span>
          {votes.length} 人已投票 ·{" "}
          {event.status === "closed" || event.voting === "ended"
            ? "投票已结束"
            : "实时更新"}
        </span>
      </div>
      <ol className="vote-chart-rows">
        {rows.map((row) => (
          <li
            className={`vote-chart-row ${max > 0 && row.count === max ? "leading" : ""}`}
            key={row.id}
          >
            <span className="vote-chart-name">{row.name}</span>
            <div className="vote-chart-track" aria-hidden="true">
              <span
                className="vote-chart-fill"
                style={{ width: `${max ? (row.count / max) * 100 : 0}%` }}
              />
            </div>
            <span className="vote-chart-count">{row.count} 票</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
function App() {
  const [user, setUser] = useState(null),
    [event, setEvent] = useState(null),
    [list, setList] = useState([]),
    [view, setView] = useState("current"),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [modal, setModal] = useState(null),
    [busy, setBusy] = useState(false),
    [menu, setMenu] = useState(false),
    [comment, setComment] = useState(""),
    [mentionIds, setMentionIds] = useState([]),
    [mention, setMention] = useState(null),
    [mentionIndex, setMentionIndex] = useState(0),
    [people, setPeople] = useState({});
  const currentId = useRef(null),
    writing = useRef(false),
    epoch = useRef(0),
    revisionRef = useRef(0);
  const commentRef = useRef();
  const pendingCaret = useRef(null);
  useLayoutEffect(() => {
    if (pendingCaret.current === null || !commentRef.current) return;
    const caret = pendingCaret.current;
    pendingCaret.current = null;
    commentRef.current.focus();
    commentRef.current.setSelectionRange(caret, caret);
  }, [comment]);
  function apply(result) {
    setEvent(result.event);
    revisionRef.current = result.revision;
  }
  async function showEvent(id) {
    const ticket = ++epoch.current;
    setLoading(true);
    try {
      const r = await store.read(id);
      if (ticket !== epoch.current) return;
      currentId.current = id;
      apply(r);
      const profiles = await store.profiles(Object.keys(r.event.people));
      if (ticket !== epoch.current) return;
      setPeople(Object.fromEntries(profiles.map((p) => [p.id, p])));
      setView("current");
      setMenu(false);
      setComment("");
      setMentionIds([]);
      setMention(null);
      location.hash = `event/${id}`;
    } catch (e) {
      setError(e.message);
    } finally {
      if (ticket === epoch.current) setLoading(false);
    }
  }
  async function showHome() {
    const ticket = ++epoch.current;
    const rows = await store.list(null, true);
    if (ticket !== epoch.current) return;
    if (rows[0]) await showEvent(rows[0].id);
    else {
      currentId.current = null;
      setEvent(null);
      setView("current");
      setLoading(false);
      location.hash = "";
    }
    setMenu(false);
  }
  async function showHistory() {
    const ticket = ++epoch.current;
    currentId.current = null;
    setView("history");
    const rows = await store.list();
    if (ticket !== epoch.current) return;
    setList(rows);
    setLoading(false);
    setMenu(false);
    location.hash = "history";
  }
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const account = await currentUser();
        const p = await store.profile(account);
        if (!live) return;
        setUser(p);
        await store.saveProfile(p);
        const hash = location.hash.slice(1);
        if (hash.startsWith("event/")) await showEvent(hash.slice(6));
        else if (hash === "history") {
          await showHistory();
          setLoading(false);
        } else await showHome();
      } catch (e) {
        if (live) {
          setError(e.message);
          setLoading(false);
        }
      }
    })();
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    const handler = () => {
      const hash = location.hash.slice(1);
      if (hash === "history" && view !== "history")
        showHistory().catch((e) => setError(e.message));
      else if (hash.startsWith("event/") && hash.slice(6) !== currentId.current)
        showEvent(hash.slice(6));
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, [view]);
  useEffect(() => {
    let stopped = false,
      inflight = false;
    const poll = async () => {
      const id = currentId.current;
      const ticket = epoch.current;
      if (!id || document.hidden || writing.current || inflight) return;
      inflight = true;
      try {
        const r = await store.read(id);
        if (
          !stopped &&
          ticket === epoch.current &&
          !writing.current &&
          r.revision > revisionRef.current
        ) {
          apply(r);
          setError("");
        }
      } catch (e) {
        if (!stopped && ticket === epoch.current)
          setError(`同步暂时中断：${e.message}`);
      } finally {
        inflight = false;
      }
    };
    const timer = setInterval(poll, 3000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  async function run(task, message = "已保存") {
    if (writing.current) return false;
    writing.current = true;
    setBusy(true);
    setError("");
    try {
      await task();
      setNotice(message);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }
  async function act(action, close = true) {
    const id = event.id,
      ticket = epoch.current;
    const ok = await run(async () => {
      const result = await store.change(id, user, action);
      if (currentId.current === id && ticket === epoch.current) apply(result);
    });
    const stillHere = currentId.current === id && ticket === epoch.current;
    if (ok && close && stillHere) setModal(null);
    return ok && stillHere;
  }
  const person = (id) =>
    id === user?.id
      ? user
      : people[id] || event?.people[id] || { id, name: "伙伴" };
  const closed = event?.status === "closed",
    creator = user?.id === event?.creatorId,
    selected = event?.votes[user?.id] || [],
    voters = event
      ? Object.keys(event.votes).filter((id) => event.votes[id].length)
      : [],
    winner = event?.finalOption,
    top = event ? leaders(event) : [];
  async function create(fields, source) {
    const e = source ? copyEvent(source, user) : newEvent(user, fields);
    if (
      await run(
        async () => {
          await store.create(e);
          await showEvent(e.id);
        },
        source ? "已复制为新的活动" : "新的相聚，安排上了",
      )
    )
      setModal(null);
  }
  const mentionPeople =
    mention && event
      ? Object.keys(event.people)
          .map(person)
          .filter((p) =>
            p.name
              .toLocaleLowerCase()
              .includes(mention.query.toLocaleLowerCase()),
          )
      : [];
  function findMention(text, caret) {
    const match = text.slice(0, caret).match(/@([^@\s]*)$/u);
    const next = match
      ? { start: caret - match[0].length, end: caret, query: match[1] }
      : null;
    if (
      next?.start === mention?.start &&
      next?.end === mention?.end &&
      next?.query === mention?.query
    )
      return;
    setMention(next);
    setMentionIndex(0);
  }
  function pickMention(p) {
    if (!mention) return;
    const inserted = `@${p.name} `;
    pendingCaret.current = mention.start + inserted.length;
    setComment(
      comment.slice(0, mention.start) + inserted + comment.slice(mention.end),
    );
    setMentionIds((ids) => [...new Set([...ids, p.id])]);
    setMention(null);
  }
  function startMention() {
    const input = commentRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const next = comment.slice(0, start) + "@" + comment.slice(end);
    pendingCaret.current = start + 1;
    setComment(next);
    findMention(next, start + 1);
  }
  async function submitComment(e) {
    e.preventDefault();
    if (
      await act(
        {
          type: "comment",
          text: comment,
          mentions: mentionIds.filter((id) =>
            comment.includes(`@${person(id).name}`),
          ),
        },
        false,
      )
    ) {
      setComment("");
      setMentionIds([]);
      setMention(null);
    }
  }
  return (
    <div className="app-shell">
      {menu && (
        <button
          className="menu-backdrop"
          aria-label="收起菜单"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "expanded" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            showHome().catch((e) => setError(e.message));
          }}
        >
          <span className="brand-mark">
            <Users size={22} />
          </span>
          <span>
            一起出发<span className="brand-sub">去往满天繁星</span>
          </span>
        </a>
        <div className="nav-caption">我们的小聚</div>
        <nav>
          <button
            className={view === "current" ? "active" : ""}
            onClick={() => showHome().catch((e) => setError(e.message))}
          >
            <span>
              <PartyPopper size={18} />
              当前活动
            </span>
            <span className="nav-dot" />
          </button>
          <button
            className={view === "history" ? "active" : ""}
            onClick={() => showHistory().catch((e) => setError(e.message))}
          >
            <span>
              <History size={18} />
              历史团建
            </span>
            <ChevronRight size={16} />
          </button>
        </nav>
        <button
          className="new-event"
          disabled={!user}
          onClick={() => setModal({ type: "new" })}
        >
          <Plus size={18} /> 发起一次小聚
        </button>
        <div className="sidebar-note">
          <div className="tiny-doodle">✦</div>
          <p>
            总有一次相聚，
            <br />
            值得大家一起期待。
          </p>
          <span>LESS PLANNING. MORE LAUGHING.</span>
        </div>
        <button
          className="account"
          disabled={!user}
          onClick={() => setModal({ type: "profile" })}
        >
          <Avatar person={user} />
          <span>
            <strong>{user?.name || "正在连接账号"}</strong>
            <small>我的头像与昵称</small>
          </span>
          <Settings2 size={16} />
        </button>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="打开菜单"
              onClick={() => setMenu(!menu)}
            >
              <Menu size={20} />
            </button>
            <span>我们的小聚</span>
            <ChevronRight size={13} />
            <strong>{view === "history" ? "历史团建" : "活动详情"}</strong>
          </div>
          <span className="sync-state">
            <i className={error ? "warning" : ""} />
            {busy ? "正在保存" : error ? "需要留意" : "大家的期待，实时同步"}
          </span>
        </header>
        {error && (
          <div className="error-banner" role="alert">
            {error}
            <IconButton
              icon={X}
              label="收起提示"
              onClick={() => setError("")}
            />
          </div>
        )}
        {loading ? (
          <div className="empty-state">
            <LoaderCircle className="spin" />
            <h2>正在准备这次相聚</h2>
            <p>取回活动安排和大家的选择…</p>
          </div>
        ) : view === "history" ? (
          <section className="history-page">
            <div className="page-heading">
              <div className="eyebrow">OUR LITTLE GATHERINGS</div>
              <h1>
                一起吃过的饭，
                <br />
                都是好时光。
              </h1>
              <p>查看以往安排，也可以把喜欢的一次变成新的相聚。</p>
            </div>
            <div className="history-list">
              {!list.length && (
                <p className="muted">还没有活动，发起第一次小聚吧。</p>
              )}
              {list.map((item) => (
                <button
                  key={item.id}
                  className="history-item"
                  onClick={() => showEvent(item.id)}
                >
                  <span
                    className={`history-icon ${item.status === "active" ? "mint" : "peach"}`}
                  >
                    <Utensils size={24} />
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>
                      {item.time ? dateLabel(item.time) : "时间待定"}
                    </small>
                  </span>
                  <span
                    className={`badge ${item.status === "active" ? "green" : "neutral"}`}
                  >
                    {item.status === "active" ? "进行中" : "已结束"}
                  </span>
                  <ArrowUpRight size={20} />
                </button>
              ))}
              {list.length >= 20 && (
                <button
                  className="button ghost"
                  onClick={async () => {
                    try {
                      const more = await store.list(list.at(-1));
                      setList([...list, ...more]);
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  查看更多活动
                </button>
              )}
            </div>
          </section>
        ) : !event ? (
          <section className="empty-state welcome">
            <DinnerArt />
            <div className="eyebrow">LET'S GET TOGETHER</div>
            <h1>下一顿，和大家一起。</h1>
            <p>
              选个时间，提议几家餐厅，
              <br />
              把期待变成一次真正的相聚。
            </p>
            <button
              className="button primary"
              disabled={!user}
              onClick={() => setModal({ type: "new" })}
            >
              <Plus size={18} />
              发起第一次小聚
            </button>
            <button
              className="button ghost"
              onClick={() => showHistory().catch((e) => setError(e.message))}
            >
              翻翻以前的好时光 <ArrowRight size={16} />
            </button>
          </section>
        ) : (
          <main>
            <section className="hero">
              <div className="hero-copy">
                <div className="hero-eyebrow">
                  <span className={`badge ${closed ? "neutral" : "green"}`}>
                    {closed ? (
                      <Lock size={12} />
                    ) : (
                      <span className="status-dot" />
                    )}
                    {closed ? "已关闭 · 留住好时光" : "这次相聚 · 进行中"}
                  </span>
                  <span className="volume">A LITTLE GET-TOGETHER</span>
                </div>
                <h1>
                  {event.title}
                  {!closed && (
                    <IconButton
                      icon={Pencil}
                      label="编辑活动名称"
                      onClick={() =>
                        setModal({
                          type: "field",
                          field: "title",
                          label: "活动名称",
                        })
                      }
                    />
                  )}
                </h1>
                <p>
                  {closed
                    ? "这一场已收好，下次见面再继续。"
                    : "先把工作放一放，留一点时间给好吃的和彼此。"}
                </p>
                <div className="hero-meta">
                  <div className="avatar-stack">
                    {[...new Set([event.creatorId, ...voters])]
                      .slice(0, 5)
                      .map((id) => (
                        <Avatar key={id} person={person(id)} size="small" />
                      ))}
                  </div>
                  <span>
                    <strong>{voters.length}</strong> 人已投票 <b>·</b>{" "}
                    {person(event.creatorId).name} 发起
                  </span>
                </div>
              </div>
              <DinnerArt />
            </section>
            <div className="content-layout">
              <div className="main-column">
                <section className="arrangement">
                  <div className="section-heading">
                    <h2>
                      <CalendarDays size={19} />
                      这次怎么安排
                    </h2>
                    <span className="section-hint">小事安排好，只管开心</span>
                  </div>
                  <div className="facts-grid">
                    {[
                      {
                        key: "time",
                        label: "聚餐时间",
                        icon: CalendarDays,
                        empty: "时间由大家来定",
                      },
                      {
                        key: "location",
                        label: "集合地点",
                        icon: MapPin,
                        empty: "还没有填写地点",
                      },
                      {
                        key: "departure",
                        label: "出发时间",
                        icon: Clock,
                        empty: "不赶路，慢慢出发",
                      },
                    ].map(({ key, label, icon: Icon, empty }) => (
                      <div className="fact" key={key}>
                        <span className={`fact-icon ${key}`}>
                          <Icon size={20} />
                        </span>
                        <div>
                          <span className="fact-label">{label}</span>
                          <strong>
                            {event[key]
                              ? key === "time" || key === "departure"
                                ? dateLabel(event[key])
                                : event[key]
                              : empty}
                          </strong>
                        </div>
                        {!closed && (
                          <IconButton
                            icon={Pencil}
                            label={`编辑${label}`}
                            onClick={() =>
                              setModal({ type: "field", field: key, label })
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="notes">
                    <NotebookPen size={17} />
                    <div>
                      <span>出发前的小提醒</span>
                      <p>
                        {event.notes ||
                          "忌口、天气、停车位置……有想提醒大家的事，就写在这里。"}
                      </p>
                    </div>
                    {!closed && (
                      <IconButton
                        icon={Pencil}
                        label="编辑注意事项"
                        onClick={() =>
                          setModal({
                            type: "field",
                            field: "notes",
                            label: "注意事项",
                          })
                        }
                      />
                    )}
                  </div>
                </section>
                <section className="voting">
                  <div className="section-heading">
                    <div>
                      <h2>
                        <Utensils size={19} />
                        今晚，吃点什么？
                      </h2>
                      <p>
                        {event.voting === "ended"
                          ? "大家的期待已经有了答案。"
                          : event.mode === "single"
                            ? "每人一票，把心动投给最想吃的那一家。"
                            : event.maxChoices > 0
                              ? `可以心动不止一次，最多选择 ${event.maxChoices} 家。`
                              : "喜欢的都可以选，不限数量。"}
                      </p>
                    </div>
                    {!closed && event.voting === "open" && (
                      <IconButton
                        icon={Settings2}
                        label="设置投票规则"
                        onClick={() => setModal({ type: "settings" })}
                      />
                    )}
                  </div>
                  {winner && (
                    <div className="winner-banner">
                      <span className="winner-icon">
                        <CheckCheck size={26} />
                      </span>
                      <div>
                        <small>就吃这家 · 最终聚餐</small>
                        <strong>{winner.name}</strong>
                      </div>
                      {winner.url && (
                        <a
                          className="button"
                          href={winner.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          查看餐厅 <ArrowUpRight size={15} />
                        </a>
                      )}
                      {!closed && creator && (
                        <IconButton
                          icon={Pencil}
                          label="更换最终餐厅"
                          onClick={() => setModal({ type: "finish" })}
                        />
                      )}
                    </div>
                  )}
                  <div className="restaurant-grid">
                    {event.options.map((o, i) => {
                      const ids = voters.filter((id) =>
                          event.votes[id].includes(o.id),
                        ),
                        chosen = selected.includes(o.id),
                        lead = ids.length > 0 && top.some((t) => t.id === o.id);
                      return (
                        <article
                          key={o.id}
                          className={`restaurant-card ${chosen ? "chosen" : ""} ${winner?.id === o.id ? "final-choice" : ""}`}
                        >
                          <div className={`restaurant-art art-${i % 4}`}>
                            <span className="food-glyph">
                              {["♨", "✿", "◒", "✦"][i % 4]}
                            </span>
                            {o.image && (
                              <img
                                key={o.image}
                                className="restaurant-photo"
                                src={o.image}
                                alt=""
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            )}
                            <span className="restaurant-category">
                              {
                                [
                                  "好好吃饭",
                                  "快乐加倍",
                                  "一起开席",
                                  "不负好食光",
                                ][i % 4]
                              }
                            </span>
                            {lead && (
                              <span className="leading-tag">人气之选</span>
                            )}
                            {!closed && (
                              <IconButton
                                icon={Pencil}
                                label={`编辑餐厅 ${o.name}`}
                                onClick={() =>
                                  setModal({ type: "option", option: o })
                                }
                              />
                            )}
                          </div>
                          <div className="restaurant-body">
                            <h3>{o.name}</h3>
                            {o.url ? (
                              <a
                                className="restaurant-link"
                                href={o.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                餐厅 / 套餐详情 <ArrowUpRight size={13} />
                              </a>
                            ) : (
                              <span className="restaurant-link muted">
                                好味道，等你发现
                              </span>
                            )}
                            <div className="vote-summary">
                              <span>
                                <strong>{ids.length}</strong> 人想去
                              </span>
                              <div className="avatar-stack">
                                {ids.map((id) => (
                                  <Avatar
                                    key={id}
                                    person={person(id)}
                                    size="tiny"
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="vote-track">
                              <span
                                style={{
                                  width: `${voters.length ? (ids.length / voters.length) * 100 : 0}%`,
                                }}
                              />
                            </div>
                            <button
                              className={`vote-button ${chosen ? "selected" : ""}`}
                              disabled={
                                closed || event.voting === "ended" || busy
                              }
                              onClick={() =>
                                act({ type: "vote", optionId: o.id }, false)
                              }
                            >
                              {chosen ? (
                                <Check size={16} />
                              ) : (
                                <Plus size={16} />
                              )}{" "}
                              {chosen ? "我也想吃这家" : "就想吃这家"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  {!event.options.length && (
                    <div className="empty-options">
                      <Utensils size={28} />
                      <p>第一家心动餐厅，就等你推荐。</p>
                    </div>
                  )}
                  {!closed && (
                    <div className="add-row">
                      <button
                        className="button dashed"
                        onClick={() => setModal({ type: "option" })}
                      >
                        <Plus size={17} />
                        推荐一家餐厅
                      </button>
                      <button
                        className="button ghost"
                        onClick={() => setModal({ type: "search" })}
                      >
                        <Search size={16} />
                        从历史里找找
                      </button>
                    </div>
                  )}
                  <VoteChart event={event} />
                  {!closed &&
                    creator &&
                    event.voting === "open" &&
                    event.options.length > 0 && (
                      <div className="finish-row">
                        <span>
                          <Vote size={16} />
                          大家都选好了吗？
                        </span>
                        <button
                          className="text-button"
                          onClick={() => setModal({ type: "finish" })}
                        >
                          结束投票，确定餐厅 <ArrowRight size={15} />
                        </button>
                      </div>
                    )}
                </section>
              </div>
              <aside className="discussion">
                <div className="section-heading">
                  <h2>
                    <MessageCircle size={19} />
                    开饭前，聊两句
                  </h2>
                  <span className="count-badge">{event.comments.length}</span>
                </div>
                <p className="discussion-sub">期待、忌口、小提议，都放这里。</p>
                <div className="comments">
                  {event.comments.length ? (
                    event.comments.map((c) => (
                      <div className="comment" key={c.id}>
                        <Avatar person={person(c.userId)} size="small" />
                        <div>
                          <div className="comment-heading">
                            <strong>{person(c.userId).name}</strong>
                            <time>
                              {new Date(c.createdAt).toLocaleTimeString(
                                "zh-CN",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </time>
                          </div>
                          <p>
                            {c.text
                              .split(/(@[^\s@]+)/g)
                              .map((part, i) =>
                                part.startsWith("@") ? (
                                  <mark key={i}>{part}</mark>
                                ) : (
                                  part
                                ),
                              )}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="comment-empty">
                      <MessageCircle size={30} />
                      <p>
                        还没有人冒泡
                        <br />
                        <span>你来开个头吧</span>
                      </p>
                    </div>
                  )}
                </div>
                {closed ? (
                  <div className="closed-message">
                    <Lock size={15} />
                    这次活动已关闭，讨论留作纪念。
                  </div>
                ) : (
                  <form onSubmit={submitComment} className="comment-form">
                    <div className="comment-input">
                      <textarea
                        ref={commentRef}
                        aria-label="写评论"
                        placeholder="聊聊安排，输入 @ 提到伙伴"
                        value={comment}
                        aria-autocomplete="list"
                        aria-controls={
                          mention ? "mention-suggestions" : undefined
                        }
                        aria-activedescendant={
                          mentionPeople[mentionIndex]
                            ? `mention-${mentionPeople[mentionIndex].id}`
                            : undefined
                        }
                        onChange={(e) => {
                          setComment(e.target.value);
                          findMention(e.target.value, e.target.selectionStart);
                        }}
                        onSelect={(e) =>
                          findMention(e.target.value, e.target.selectionStart)
                        }
                        onBlur={() => setMention(null)}
                        onKeyDown={(e) => {
                          if (!mention || e.nativeEvent.isComposing) return;
                          if (e.key === "Escape") {
                            e.preventDefault();
                            setMention(null);
                          } else if (
                            mentionPeople.length &&
                            (e.key === "ArrowDown" || e.key === "ArrowUp")
                          ) {
                            e.preventDefault();
                            setMentionIndex(
                              (i) =>
                                (i +
                                  (e.key === "ArrowDown" ? 1 : -1) +
                                  mentionPeople.length) %
                                mentionPeople.length,
                            );
                          } else if (
                            mentionPeople[mentionIndex] &&
                            (e.key === "Enter" || e.key === "Tab")
                          ) {
                            e.preventDefault();
                            pickMention(mentionPeople[mentionIndex]);
                          }
                        }}
                        rows={3}
                      />
                      {mention && (
                        <div className="mention-dropdown">
                          <div className="mention-caption">提到活动伙伴</div>
                          <div
                            id="mention-suggestions"
                            role="listbox"
                            aria-label="选择要提到的伙伴"
                          >
                            {mentionPeople.map((p, index) => (
                              <button
                                type="button"
                                role="option"
                                id={`mention-${p.id}`}
                                key={p.id}
                                aria-label={p.name}
                                aria-selected={index === mentionIndex}
                                onPointerDown={(e) => e.preventDefault()}
                                onClick={() => pickMention(p)}
                              >
                                <Avatar person={p} size="small" />
                                <span>{p.name}</span>
                                {index === mentionIndex && (
                                  <span className="mention-enter">↵</span>
                                )}
                              </button>
                            ))}
                          </div>
                          {!mentionPeople.length && (
                            <p className="mention-empty">没有匹配的活动伙伴</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="comment-actions">
                      <div className="mention-control">
                        <button
                          type="button"
                          className="text-button"
                          onClick={startMention}
                        >
                          @ 提到伙伴
                        </button>
                      </div>
                      <button
                        className="send-button"
                        aria-label="发送评论"
                        disabled={!comment.trim() || busy}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </form>
                )}
                <div className="discussion-footer">
                  <span>✦</span> 好的相聚，从一句「我都可以」以外的话开始。
                </div>
              </aside>
            </div>
            <details className="edit-history">
              <summary>
                <span>
                  <History size={16} />
                  每一次用心安排{" "}
                  <small>{event.history.length} 条编辑记录</small>
                </span>
                <ChevronDown size={16} />
              </summary>
              <ol>
                {[...event.history].reverse().map((h) => (
                  <li key={h.id}>
                    <span className="timeline-dot" />
                    <div>
                      <strong>{h.actor.name}</strong>
                      <span>{h.description}</span>
                      <time>{dateLabel(h.at)}</time>
                    </div>
                  </li>
                ))}
                {!event.history.length && (
                  <li className="muted">这里会记下每一次安排的变化。</li>
                )}
              </ol>
            </details>
            <footer className="event-footer">
              <span>
                <Users size={15} />
                一起出发 · 好好相聚，慢慢记录
              </span>
              <div>
                <button
                  className="button ghost"
                  onClick={() => create({}, event)}
                  disabled={busy}
                >
                  <Copy size={15} />
                  复制这次活动
                </button>
                {!closed && (
                  <button
                    className="button ghost"
                    onClick={() => setModal({ type: "close" })}
                  >
                    <Lock size={15} />
                    结束这次团建
                  </button>
                )}
              </div>
            </footer>
          </main>
        )}
      </div>
      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          {notice}
        </div>
      )}
      {modal?.type === "new" && (
        <EventForm
          onClose={() => setModal(null)}
          busy={busy}
          onSave={(fields) => create(fields)}
        />
      )}
      {modal?.type === "field" && (
        <FieldForm
          modal={modal}
          value={event[modal.field]}
          busy={busy}
          onClose={() => setModal(null)}
          onSave={(value) =>
            act({ type: "edit", fields: { [modal.field]: value } })
          }
        />
      )}
      {modal?.type === "option" && (
        <OptionForm
          option={modal.option}
          busy={busy}
          onClose={() => setModal(null)}
          onSave={(o) =>
            act({
              type: modal.option ? "edit-option" : "add-option",
              optionId: modal.option?.id,
              ...o,
            })
          }
          onDelete={() =>
            setModal({ type: "delete-option", option: modal.option })
          }
        />
      )}
      {modal?.type === "search" && (
        <SearchForm
          eventId={event.id}
          onClose={() => setModal(null)}
          busy={busy}
          onPick={(o) =>
            act({
              type: "add-option",
              name: o.name,
              url: o.url,
              image: o.image,
            })
          }
        />
      )}
      {modal?.type === "settings" && (
        <SettingsForm
          event={event}
          busy={busy}
          onClose={() => setModal(null)}
          onSave={(s) => act({ type: "settings", ...s })}
        />
      )}
      {modal?.type === "finish" && (
        <FinishForm
          event={event}
          busy={busy}
          onClose={() => setModal(null)}
          onSave={(optionId) => act({ type: "finish", optionId })}
        />
      )}
      {modal?.type === "profile" && (
        <ProfileForm
          user={user}
          busy={busy}
          onClose={() => setModal(null)}
          onSave={async (p) => {
            if (
              await run(async () => {
                await store.saveProfile(p);
                setUser(p);
              })
            )
              setModal(null);
          }}
        />
      )}
      {modal?.type === "close" && (
        <Modal
          title="把这次相聚收进回忆？"
          subtitle="关闭后，活动安排、投票和评论都将保留，无法再编辑。你仍然可以复制它，发起新活动。"
          onClose={() => setModal(null)}
        >
          <div className="form-actions">
            <button className="button ghost" onClick={() => setModal(null)}>
              再等等
            </button>
            <button
              className="button primary"
              disabled={busy}
              onClick={() => act({ type: "close" })}
            >
              确认关闭活动
            </button>
          </div>
        </Modal>
      )}
      {modal?.type === "delete-option" && (
        <Modal
          title={`移除「${modal.option.name}」？`}
          subtitle="这个选项和它的投票会从当前活动移除，操作会记入编辑历史。"
          onClose={() => setModal(null)}
        >
          <div className="form-actions">
            <button className="button ghost" onClick={() => setModal(null)}>
              取消
            </button>
            <button
              className="button danger"
              disabled={busy}
              onClick={() =>
                act({ type: "remove-option", optionId: modal.option.id })
              }
            >
              确认移除
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function EventForm({ onClose, onSave, busy }) {
  const [f, setF] = useState({
    title: "",
    time: "",
    departure: "",
    location: "",
    notes: "",
  });
  const field = (key, value) => setF({ ...f, [key]: value });
  return (
    <Modal
      title="发起一次值得期待的小聚"
      subtitle="先定个主题，其他安排可以和大家慢慢商量。"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(f);
        }}
      >
        <label>
          活动名称
          <input
            autoFocus
            required
            placeholder="比如：周五的快乐，提前开席"
            value={f.title}
            onChange={(e) => field("title", e.target.value)}
          />
        </label>
        <div className="form-grid">
          <label>
            聚餐时间
            <input
              type="datetime-local"
              value={f.time}
              onChange={(e) => field("time", e.target.value)}
            />
          </label>
          <label>
            出发时间
            <input
              type="datetime-local"
              value={f.departure}
              onChange={(e) => field("departure", e.target.value)}
            />
          </label>
        </div>
        <label>
          集合地点
          <input
            placeholder="比如：一楼大厅见"
            value={f.location}
            onChange={(e) => field("location", e.target.value)}
          />
        </label>
        <label>
          注意事项
          <textarea
            placeholder="有什么想提前提醒大家的？"
            value={f.notes}
            onChange={(e) => field("notes", e.target.value)}
          />
        </label>
        <div className="form-actions">
          <button type="button" className="button ghost" onClick={onClose}>
            取消
          </button>
          <button className="button primary" disabled={busy}>
            创建活动 <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
function FieldForm({ modal, value, onClose, onSave, busy }) {
  const [v, setV] = useState(value);
  return (
    <Modal title={`编辑${modal.label}`} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(v);
        }}
      >
        <label>
          {modal.label}
          {modal.field === "notes" ? (
            <textarea
              autoFocus
              rows={5}
              value={v}
              onChange={(e) => setV(e.target.value)}
            />
          ) : (
            <input
              autoFocus
              type={
                ["time", "departure"].includes(modal.field)
                  ? "datetime-local"
                  : "text"
              }
              required={modal.field === "title"}
              value={v}
              onChange={(e) => setV(e.target.value)}
            />
          )}
        </label>
        <div className="form-actions">
          <button type="button" className="button ghost" onClick={onClose}>
            取消
          </button>
          <button className="button primary" disabled={busy}>
            保存修改
          </button>
        </div>
      </form>
    </Modal>
  );
}
function OptionForm({ option, onClose, onSave, onDelete, busy }) {
  const [name, setName] = useState(option?.name || ""),
    [url, setUrl] = useState(option?.url || ""),
    [share, setShare] = useState(""),
    [hint, setHint] = useState(""),
    [readingImage, setReadingImage] = useState(false);
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );
  async function save(e) {
    e.preventDefault();
    setReadingImage(true);
    try {
      const image =
        option?.url === url && option.image
          ? option.image
          : await previewImage(url);
      if (mounted.current) await onSave({ name, url, image });
    } finally {
      if (mounted.current) setReadingImage(false);
    }
  }
  function parse(text) {
    setShare(text);
    const result = parseShare(text);
    if (result.name) setName(result.name);
    if (result.url) setUrl(result.url);
    setHint(
      result.url && !result.name
        ? "已提取链接。短链接里没有名称，请在下方补充餐厅或套餐名称。"
        : result.url
          ? "名称和链接已提取，可以再改一改。"
          : "",
    );
  }
  return (
    <Modal
      title={option ? "编辑这家餐厅" : "推荐一家心动餐厅"}
      subtitle="粘贴分享文案；链接中可读取的预览图会显示在卡片上。"
      onClose={onClose}
    >
      <form onSubmit={save}>
        <label className="paste-label">
          <LinkIcon size={15} />
          粘贴分享文案
          <textarea
            disabled={busy || readingImage}
            autoFocus={!option}
            placeholder="【餐厅名称】套餐介绍 https://…"
            value={share}
            onChange={(e) => parse(e.target.value)}
          />
        </label>
        {hint && <p className="inline-hint">{hint}</p>}
        <label>
          餐厅 / 套餐名称
          <input
            disabled={busy || readingImage}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="想带大家去吃什么？"
          />
        </label>
        <label>
          链接 <span className="optional">选填</span>
          <input
            disabled={busy || readingImage}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
          />
        </label>
        <div className="form-actions">
          {option && (
            <button
              type="button"
              className="text-button danger-text"
              onClick={onDelete}
            >
              <Trash2 size={16} />
              移除餐厅
            </button>
          )}
          <button type="button" className="button ghost" onClick={onClose}>
            取消
          </button>
          <button className="button primary" disabled={busy || readingImage}>
            {readingImage ? "读取餐厅图片…" : option ? "保存餐厅" : "加入候选"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function SettingsForm({ event, onClose, onSave, busy }) {
  const [mode, setMode] = useState(event.mode),
    [max, setMax] = useState(event.maxChoices);
  return (
    <Modal
      title="大家怎么选？"
      subtitle="已经产生的投票会保留。新上限需要容纳已有选择。"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ mode, maxChoices: Number(max) });
        }}
      >
        <div className="choice-tabs">
          <button
            type="button"
            className={mode === "single" ? "selected" : ""}
            onClick={() => setMode("single")}
          >
            单选 · 最心动的一家
          </button>
          <button
            type="button"
            className={mode === "multiple" ? "selected" : ""}
            onClick={() => setMode("multiple")}
          >
            多选 · 喜欢的都选
          </button>
        </div>
        {mode === "multiple" && (
          <label>
            每人最多选择几家
            <input
              type="number"
              min="0"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
            <small>填写 0 表示不限数量。</small>
          </label>
        )}
        <div className="form-actions">
          <button className="button primary" disabled={busy}>
            保存投票规则
          </button>
        </div>
      </form>
    </Modal>
  );
}
function FinishForm({ event, onClose, onSave, busy }) {
  const top = leaders(event);
  const [id, setId] = useState(
    event.finalOption?.id || (top.length === 1 ? top[0].id : ""),
  );
  return (
    <Modal
      title={
        event.voting === "ended"
          ? "计划有变？换一家也很好"
          : "这顿饭，就这么定了"
      }
      subtitle="默认推荐最高票。并列时请选一家；临时有变化，也可以指定其他餐厅。"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(id);
        }}
      >
        <div className="final-options">
          {event.options.map((o) => (
            <label key={o.id}>
              <input
                type="radio"
                name="finalRestaurant"
                required
                value={o.id}
                checked={id === o.id}
                onChange={() => setId(o.id)}
              />
              <span>{o.name}</span>
              <small>
                {
                  Object.values(event.votes).filter((v) => v.includes(o.id))
                    .length
                }{" "}
                票{top.some((t) => t.id === o.id) ? " · 最高票" : ""}
              </small>
            </label>
          ))}
        </div>
        <div className="form-actions">
          <button type="button" className="button ghost" onClick={onClose}>
            再等等
          </button>
          <button className="button primary" disabled={busy || !id}>
            确定最终餐厅 <Check size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
function SearchForm({ eventId, onClose, onPick, busy }) {
  const [query, setQuery] = useState(""),
    [result, setResult] = useState([]),
    [more, setMore] = useState(false),
    [offset, setOffset] = useState(0),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  const ticket = useRef(0);
  async function search(next = 0) {
    const t = ++ticket.current;
    setLoading(true);
    setError("");
    try {
      const r = await store.search(query, next);
      if (t !== ticket.current) return;
      setResult(next ? [...result, ...r.options] : r.options);
      setMore(r.more);
      setOffset(next);
    } catch (e) {
      setError(e.message);
    } finally {
      if (t === ticket.current) setLoading(false);
    }
  }
  return (
    <Modal
      title="好吃的，值得再去一次"
      subtitle="搜索以往活动中推荐过的餐厅或套餐。"
      onClose={onClose}
    >
      <form
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
      >
        <input
          autoFocus
          aria-label="搜索历史餐厅"
          value={query}
          onChange={(e) => {
            ticket.current++;
            setLoading(false);
            setQuery(e.target.value);
            setResult([]);
            setMore(false);
          }}
          placeholder="输入餐厅或套餐名称"
        />
        <button className="button primary" disabled={!query.trim() || loading}>
          <Search size={17} />
          搜索
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      <div className="search-results">
        {result
          .filter((o) => o.eventId !== eventId)
          .map((o, i) => (
            <button
              key={`${o.eventId}-${o.id}-${i}`}
              disabled={busy}
              onClick={() => onPick(o)}
            >
              <span>
                <strong>{o.name}</strong>
                <small>来自「{o.eventTitle}」</small>
              </span>
              <Plus size={18} />
            </button>
          ))}
        {!result.length && (
          <p className="muted">
            {loading ? "正在寻找好味道…" : "找到后，一键加入这次候选。"}
          </p>
        )}
        {more && (
          <button
            className="button ghost"
            disabled={loading}
            onClick={() => search(offset + 20)}
          >
            继续查找
          </button>
        )}
      </div>
    </Modal>
  );
}
function ProfileForm({ user, onClose, onSave, busy }) {
  const [p, setP] = useState({ ...user }),
    [error, setError] = useState("");
  async function upload(file) {
    if (!file) return;
    try {
      const image = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 160;
      const ctx = canvas.getContext("2d");
      const side = Math.min(image.width, image.height);
      ctx.drawImage(
        image,
        (image.width - side) / 2,
        (image.height - side) / 2,
        side,
        side,
        0,
        0,
        160,
        160,
      );
      setP({ ...p, avatar: canvas.toDataURL("image/jpeg", 0.85) });
      image.close();
    } catch {
      setError("这张图片暂时无法读取，请换一张试试。");
    }
  }
  return (
    <Modal
      title="给伙伴一个熟悉的面孔"
      subtitle="身份来自你的 Tiana 账号，头像和昵称用于这份团建应用。"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(p);
        }}
      >
        <div className="profile-preview">
          <Avatar person={p} size="large" />
          <label className="button ghost upload">
            <ImagePlus size={16} />
            上传头像
            <input
              type="file"
              accept="image/*"
              onChange={(e) => upload(e.target.files[0])}
            />
          </label>
          <button
            className="button ghost"
            type="button"
            onClick={() =>
              setP({
                ...p,
                avatar: "",
                color: colors[(colors.indexOf(p.color) + 1) % colors.length],
              })
            }
          >
            自动生成
          </button>
        </div>
        {error && <p role="alert">{error}</p>}
        <label>
          大家怎么称呼你
          <input
            required
            value={p.name}
            onChange={(e) => setP({ ...p, name: e.target.value })}
          />
        </label>
        <div className="form-actions">
          <button className="button primary" disabled={busy}>
            保存我的资料
          </button>
        </div>
      </form>
    </Modal>
  );
}
createRoot(document.getElementById("app")).render(<App />);
