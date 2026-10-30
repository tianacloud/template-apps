import "./style.css";
import "./load-style.js";
import shell from "./shell.html?raw";
import { api } from "./api.js";
document.getElementById("app").innerHTML = shell;
const API = "/api/divination";
const state = {
  bootstrap: null,
  library: [],
  reading: null,
  tosses: [],
  librarySelection: null
};
const el = (id) => document.getElementById(id);
const announce = (text) => {
  el("live-region").textContent = text;
};
const CASTING_TITLES = {
  \u6BCF\u65E5\u4E00\u5366: "\u4ECA\u65E5\u4E4B\u5366",
  \u65F6\u95F4\u8D77\u5366: "\u6B64\u523B\u4E4B\u5366",
  \u6570\u5B57\u8D77\u5366: "\u5FC3\u4E2D\u4E4B\u5366",
  \u94DC\u94B1\u6447\u5366: "\u624B\u63B7\u4E4B\u5366"
};
const castingTitle = (method) => CASTING_TITLES[method] || "\u4E00\u5366";
const TABS = ["cast", "library", "almanac", "history"];
for (const name of TABS) {
  el(`tab-${name}`).addEventListener("click", () => selectTab(name));
}
function selectTab(name) {
  for (const tab of TABS) {
    const active = tab === name;
    el(`tab-${tab}`).setAttribute("aria-selected", String(active));
    const panel = el(`panel-${tab}`);
    const wasHidden = panel.hidden;
    panel.hidden = !active;
    if (active && wasHidden) restart(panel, "panel-enter");
  }
  if (name === "library" && state.library.length === 0) loadLibrary();
  if (name === "history") loadHistory();
}
function restart(node, className) {
  if (!node) return;
  node.classList.remove(className);
  void node.offsetWidth;
  node.classList.add(className);
}
for (const button of el("methods").querySelectorAll("[data-method]")) {
  button.addEventListener("click", () => onMethod(button.dataset.method));
}
async function onMethod(method) {
  const question = el("question").value.trim();
  if (method === "coins") {
    el("number-form").hidden = true;
    el("toss-card").hidden = false;
    announce("\u8BF7\u63B7\u94DC\u94B1\u8D77\u5366");
    return;
  }
  el("toss-card").hidden = true;
  if (method === "numbers") {
    el("number-form").hidden = false;
    return;
  }
  el("number-form").hidden = true;
  await cast({ method, question });
}
el("num-submit").addEventListener("click", async () => {
  const upper = Number(el("num-upper").value);
  const lower = Number(el("num-lower").value);
  if (!Number.isInteger(upper) || !Number.isInteger(lower) || upper < 1 || lower < 1) {
    announce("\u8BF7\u586B\u5199\u4E24\u4E2A\u6B63\u6574\u6570");
    return;
  }
  const ran = await cast({ method: "numbers", question: el("question").value.trim(), upper, lower });
  if (!ran) return;
  el("num-upper").value = "";
  el("num-lower").value = "";
});
el("num-random").addEventListener("click", () => {
  el("num-upper").value = String(1 + Math.floor(Math.random() * 99));
  el("num-lower").value = String(1 + Math.floor(Math.random() * 99));
  announce("\u5DF2\u53D6\u4E24\u6570\uFF0C\u53EF\u76F4\u63A5\u8D77\u5366");
});
const CASTING_OPENERS = ["\u4F9D\u6570\u53D6\u5366", "\u89C2\u8C61\u63A8\u6F14", "\u9759\u5FC3\u8D77\u5366", "\u5FAA\u6570\u800C\u884C"];
const CASTING_CLOSERS = [
  (name) => `\u6210${name}\u5366\uFF0C\u9759\u5019\u5176\u65AD`,
  (name) => `${name}\u5366\u65E2\u5B9A\uFF0C\u4F11\u548E\u5728\u4EBA\u4E3A`,
  (name) => `\u5F97${name}\uFF0C\u770B\u4F53\u7528\u751F\u514B`,
  (name) => `${name}\u5366\u5DF2\u6210\uFF0C\u53C2\u4E92\u9519\u7EFC`
];
const castingTimers = /* @__PURE__ */ new Set();
const CASTING_LINE_MS = 110;
const CASTING_BUDGET_MS = 4e3;
const CASTING_BASE_CHAR_MS = 18;
const CASTING_CHAR_MIN = 18;
const CASTING_CHAR_MAX = 55;
const CASTING_MAX_LINES = 10;
const CASTING_HOLD_MS = 4400;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
function castingAftermath(reading) {
  const out = [];
  const hex = reading?.hexagram;
  const labelAt = (position) => reading?.lines?.[position - 1]?.label;
  if (hex?.upper?.name && hex?.lower?.name) {
    out.push(`\u4E0A\u5366${hex.upper.name}\u3001\u4E0B\u5366${hex.lower.name}\uFF0C\u5F97${hex.name}`);
  }
  const moving = (reading?.movingLines ?? []).map((line) => line.label).filter(Boolean);
  if (moving.length && reading?.changed?.name) {
    out.push(`${moving.join("\u3001")}\u52A8\uFF0C\u9634\u9633\u53CD\u8F6C\uFF0C\u53D8${reading.changed.name}`);
  }
  const jf = reading?.jingfang;
  const shi = labelAt(jf?.shi);
  const ying = labelAt(jf?.ying);
  if (jf?.stage && shi && ying) {
    out.push(`${jf.palaceName ?? ""}${jf.stage}\u5366\uFF0C\u4E16\u5728${shi}\uFF0C\u5E94\u5728${ying}`);
  }
  const st = reading?.structure;
  if (st?.body?.name && st?.use?.name) {
    out.push(`\u4F53\u5366${st.body.name}${st.body.element}\uFF0C\u7528\u5366${st.use.name}${st.use.element}`);
  }
  return out;
}
function castingLines(reading) {
  const opener = pick(CASTING_OPENERS);
  const closer = pick(CASTING_CLOSERS)(reading?.hexagram?.name ?? "");
  const lines = [opener];
  let used = (opener.length + closer.length) * CASTING_BASE_CHAR_MS + CASTING_LINE_MS;
  const push = (text) => {
    const cost = text.length * CASTING_BASE_CHAR_MS + CASTING_LINE_MS;
    if (lines.length >= CASTING_MAX_LINES || used + cost > CASTING_BUDGET_MS) return false;
    lines.push(text);
    used += cost;
    return true;
  };
  for (const step of reading?.details ?? []) {
    if (!push(step.value)) break;
  }
  for (const text of castingAftermath(reading)) {
    if (!push(text)) break;
  }
  lines.push(closer);
  return lines;
}
function castingSpeed(lines) {
  const chars = lines.reduce((sum, text) => sum + text.length, 0);
  const room = CASTING_BUDGET_MS - (lines.length - 1) * CASTING_LINE_MS;
  return Math.min(CASTING_CHAR_MAX, Math.max(CASTING_CHAR_MIN, Math.floor(room / chars)));
}
function stopCastingTyping() {
  for (const id of castingTimers) clearTimeout(id);
  castingTimers.clear();
}
function typeCasting(log, lines) {
  const add = (text, done) => {
    const row2 = document.createElement("div");
    row2.className = done ? "casting-line done" : "casting-line";
    row2.textContent = text;
    log.append(row2);
    return row2;
  };
  if (reducedMotion()) {
    lines.forEach((text) => add(text, true));
    return;
  }
  const charMs = castingSpeed(lines);
  let index = 0;
  let row = add(lines[0].slice(0, 1), false);
  let count = 1;
  const step = () => {
    const text = lines[index];
    count += 1;
    row.textContent = text.slice(0, count);
    if (count < text.length) {
      castingTimers.add(setTimeout(step, charMs));
      return;
    }
    row.classList.add("done");
    index += 1;
    if (index >= lines.length) return;
    row = add(lines[index].slice(0, 1), false);
    count = 1;
    castingTimers.add(setTimeout(step, CASTING_LINE_MS));
  };
  step();
}
function growCastingHex(box, reading) {
  if (!box) return;
  box.replaceChildren();
  const lines = reading?.lines ?? [];
  if (lines.length === 0) return;
  const rows = [];
  for (let position = 6; position >= 1; position -= 1) {
    const line = lines[position - 1];
    const row = document.createElement("div");
    const isYang = line ? line.value === 1 : false;
    row.className = `grow ${isYang ? "yang" : "yin"}`;
    row.innerHTML = `<i></i>${isYang ? "" : "<i></i>"}`;
    box.append(row);
    rows.push({ row, line, position });
  }
  if (reducedMotion()) {
    for (const item of rows) {
      item.row.classList.add("in");
      if (item.line?.moving) item.row.classList.add("moving");
    }
    return;
  }
  const order = [...rows].sort((a, b) => a.position - b.position);
  const stepMs = Math.max(70, Math.floor(CASTING_BUDGET_MS * 0.35 / order.length));
  order.forEach((item, index) => {
    castingTimers.add(setTimeout(() => {
      item.row.classList.add("in");
      if (index === order.length - 1) {
        for (const other of rows) {
          if (other.line?.moving) other.row.classList.add("moving");
        }
      }
    }, stepMs * (index + 1)));
  });
}
let casting = false;
function castTriggers() {
  return [
    ...el("methods").querySelectorAll("[data-method]"),
    el("num-random"),
    el("num-submit"),
    el("toss-btn"),
    el("toss-reset"),
    el("toss-finish")
  ];
}
function lockCasting() {
  const nodes = castTriggers();
  const saved = nodes.map((node) => [node, node.disabled]);
  for (const node of nodes) node.disabled = true;
  return () => {
    for (const [node, was] of saved) node.disabled = was;
  };
}
async function cast(payload) {
  if (casting) return false;
  casting = true;
  const unlock = lockCasting();
  const slot = el("result-slot");
  try {
    const stage = showCasting();
    const data = await api("/cast", {
      method: "POST",
      body: JSON.stringify({ ...payload, question: payload.question ?? el("question").value.trim() })
    });
    if (stage?.log?.isConnected) typeCasting(stage.log, castingLines(data.reading));
    if (stage?.hex?.isConnected) growCastingHex(stage.hex, data.reading);
    await wait(reducedMotion() ? 0 : CASTING_HOLD_MS);
    stopCastingTyping();
    state.reading = data.reading;
    renderReading(data.reading);
    announce(`\u5F97\u5366 ${data.reading.hexagram.name}\uFF0C${data.reading.verdict.label}`);
    return true;
  } catch (error) {
    slot.replaceChildren();
    announce(error.message);
    window.alert(error.message);
    return false;
  } finally {
    unlock();
    casting = false;
  }
}
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const BAGUA = [
  { name: "\u574E", at: 0, lines: [0, 1, 0] },
  { name: "\u826E", at: 45, lines: [0, 0, 1] },
  { name: "\u9707", at: 90, lines: [1, 0, 0] },
  { name: "\u5DFD", at: 135, lines: [0, 1, 1] },
  { name: "\u79BB", at: 180, lines: [1, 0, 1] },
  { name: "\u5764", at: 225, lines: [0, 0, 0] },
  { name: "\u5151", at: 270, lines: [1, 1, 0] },
  { name: "\u4E7E", at: 315, lines: [1, 1, 1] }
];
function trigramBars(lines) {
  return lines.map((yang, i) => {
    const y = 9 - i * 9;
    return `<rect x="-13" y="${y}" width="${yang ? 26 : 10}" height="3.6" rx="1.2"/>` + (yang ? "" : `<rect x="3" y="${y}" width="10" height="3.6" rx="1.2"/>`);
  }).join("");
}
function baguaSvg() {
  const outer = BAGUA.map(
    (t) => `<g transform="rotate(${t.at} 100 100) translate(100 28)">${trigramBars(t.lines)}</g>`
  ).join("") + BAGUA.map(
    (t) => `<circle cx="100" cy="14" r="1.9" fill="var(--seal)" transform="rotate(${t.at + 22.5} 100 100)"/>`
  ).join("");
  const inner = BAGUA.map(
    (t) => `<rect x="99.1" y="50" width="1.8" height="8" rx="0.9" transform="rotate(${t.at + 22.5} 100 100)"/>`
  ).join("");
  return `<svg class="bagua" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><defs><radialGradient id="bagua-halo"><stop offset="0%" stop-color="var(--seal)" stop-opacity="0.3"/><stop offset="55%" stop-color="var(--seal)" stop-opacity="0.12"/><stop offset="100%" stop-color="var(--seal)" stop-opacity="0"/></radialGradient></defs><circle class="halo" cx="100" cy="100" r="36" fill="url(#bagua-halo)"/><circle cx="100" cy="100" r="90" fill="none" stroke="var(--border)" stroke-width="1"/><g class="ring-outer" fill="currentColor"><circle cx="100" cy="100" r="72" fill="none" stroke="currentColor" stroke-opacity="0.22"/>` + outer + `</g><g class="ring-inner" fill="currentColor" opacity="0.38">${inner}</g><g class="core"><text x="100" y="112" text-anchor="middle" font-size="34" fill="var(--seal)">\u262F</text></g></svg>`;
}
const QI_RING = [
  { b: "\u5B50", s: "\u590D", n: 1, p: "\u606F" },
  { b: "\u4E11", s: "\u4E34", n: 2, p: "\u606F" },
  { b: "\u5BC5", s: "\u6CF0", n: 3, p: "\u606F" },
  { b: "\u536F", s: "\u5927\u58EE", n: 4, p: "\u606F" },
  { b: "\u8FB0", s: "\u592C", n: 5, p: "\u606F" },
  { b: "\u5DF3", s: "\u4E7E", n: 6, p: "\u606F" },
  { b: "\u5348", s: "\u59E4", n: 1, p: "\u6D88" },
  { b: "\u672A", s: "\u9041", n: 2, p: "\u6D88" },
  { b: "\u7533", s: "\u5426", n: 3, p: "\u6D88" },
  { b: "\u9149", s: "\u89C2", n: 4, p: "\u6D88" },
  { b: "\u620C", s: "\u5265", n: 5, p: "\u6D88" },
  { b: "\u4EA5", s: "\u5764", n: 6, p: "\u6D88" }
];
function qiRingSvg(qi) {
  if (!qi) return "";
  const C = 100;
  const R = 58;
  const now = qi.branch;
  const selfIndex = qi.self ? QI_RING.findIndex((m) => m.s === qi.self) : -1;
  const cells = QI_RING.map((m, i) => {
    const deg = i * 30 - 90;
    const at = deg * (Math.PI / 180);
    const isNow = i === now;
    const isSelf = i === selfIndex;
    const bars = Array.from({ length: m.n }, (_, k) => {
      const off = 5 + k * 4.2;
      const bx = C + Math.cos(at) * (R + off);
      const by = C + Math.sin(at) * (R + off);
      const w = 13 - k * 0.9;
      return `<rect class="cell-bar" x="${(bx - w / 2).toFixed(2)}" y="${(by - 2.2).toFixed(2)}" width="${w.toFixed(2)}" height="4.4" rx="2.2" transform="rotate(${i * 30} ${bx.toFixed(2)} ${by.toFixed(2)})" fill="currentColor" opacity="${(0.52 + k * 0.075).toFixed(2)}"/>`;
    }).join("");
    const lx = C + Math.cos(at) * (R + 40);
    const ly = C + Math.sin(at) * (R + 40);
    return `<g class="${isNow ? "now-sector" : ""}" opacity="${isNow ? 1 : 0.68}"><g color="var(--seal)">${bars}</g><text class="${isNow ? "now-label" : "month-label"}" x="${lx.toFixed(2)}" y="${(ly - 1).toFixed(2)}" text-anchor="middle">${escapeHtml(m.s)}<tspan font-size="5.6" dy="6.4">${escapeHtml(m.b)}</tspan></text>` + (isSelf ? `<circle class="mark" cx="${(C + Math.cos(at) * (R - 9)).toFixed(2)}" cy="${(C + Math.sin(at) * (R - 9)).toFixed(2)}" r="2.6"/>` : "") + `</g>`;
  }).join("");
  const axes = [0, 3, 6, 9].map((a) => {
    const at = (a * 30 - 90) * (Math.PI / 180);
    const x1 = C + Math.cos(at) * (R - 3);
    const y1 = C + Math.sin(at) * (R - 3);
    const x2 = C + Math.cos(at) * 36;
    const y2 = C + Math.sin(at) * 36;
    return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="var(--border-strong)" stroke-width="0.8" stroke-dasharray="2 3"/>`;
  }).join("");
  return `<svg class="qiring" viewBox="-16 -16 232 232" role="img" aria-label="\u5341\u4E8C\u8F9F\u5366\u6D88\u957F\u73AF\uFF0C\u5F53\u6708\u4E3B\u5366${escapeHtml(qi.lord)}"><circle cx="100" cy="100" r="${R}" fill="none" stroke="var(--border)" stroke-width="1"/><circle cx="100" cy="100" r="36" fill="none" stroke="var(--border)" stroke-width="0.8" opacity="0.5"/>` + axes + cells + `<text x="100" y="92" text-anchor="middle" font-size="7" fill="var(--text-muted)">\u5F53\u6708\u4E3B\u5366</text><text x="100" y="105" text-anchor="middle" font-size="12" fill="var(--seal)">${escapeHtml(qi.lord)}</text><text x="100" y="117" text-anchor="middle" font-size="6.8" fill="var(--text-muted)">${qi.phase === "\u606F" ? "\u9633\u6C14\u6E10\u957F" : "\u9634\u6C14\u6E10\u76DB"}</text></svg>`;
}
function miniGua(key, touched) {
  const rows = [];
  for (let position = 6; position >= 1; position -= 1) {
    const isYang = key[position - 1] === "1";
    const on = touched && touched.includes(position);
    rows.push(
      `<div class="mini-line ${isYang ? "yang" : "yin"}${on ? " touched" : ""}"><i></i>${isYang ? "" : "<i></i>"}</div>`
    );
  }
  return `<div class="mini-gua">${rows.join("")}</div>`;
}
const DERIVE_HOW = {
  mutual: ["\u4E92\u5366", "\u53D6\u4E8C\u4E09\u56DB\u4E3A\u4E0B\u5366\n\u4E09\u56DB\u4E94\u4E3A\u4E0A\u5366"],
  changed: ["\u53D8\u5366", "\u52A8\u723B\u9634\u9633\u53CD\u8F6C"],
  opposite: ["\u9519\u5366", "\u516D\u723B\u9634\u9633\u5168\u53CD"],
  inverted: ["\u7EFC\u5366", "\u516D\u723B\u4E0A\u4E0B\u5012\u7F6E"]
};
function deriveBlock(reading) {
  const base = reading.hexagram;
  const moving = (reading.movingLines || []).map((line) => line.position);
  const steps = [
    ["mutual", reading.mutual, [2, 3, 4, 5]],
    ["changed", reading.changed, moving],
    ["opposite", reading.opposite, [1, 2, 3, 4, 5, 6]],
    ["inverted", reading.inverted, [1, 2, 3, 4, 5, 6]]
  ].filter(([, target]) => Boolean(target));
  if (steps.length === 0) return null;
  const arrow = (label, how) => `<div class="arrow"><div class="how">${how.split("\n").map(escapeHtml).join("<br>")}</div><svg width="30" height="8" viewBox="0 0 30 8" aria-hidden="true"><line x1="0" y1="4" x2="24" y2="4" stroke="currentColor" stroke-width="1"/><path d="M24 1.5 L29 4 L24 6.5 Z" fill="currentColor"/></svg></div>`;
  const units = steps.map(([kind, target, touched]) => {
    const [label, how] = DERIVE_HOW[kind];
    const isChanged = kind === "changed";
    return (
      // 箭头与卦裹在一格里：格子才是排布的单位。原先箭头与卦是
      // 平级的 flex item，注记长短一差就把后面的卦挤偏，四列间距不等。
      `<div class="derive-step">` + arrow(label, how) + `<div class="unit">` + miniGua(target.key, isChanged ? touched : null) + `<span class="unit-name">${escapeHtml(target.name)}</span><span class="unit-tag">${escapeHtml(label)}</span></div></div>`
    );
  }).join("");
  return `<div class="derive"><div class="derive-head">\u672C\u5366\u4E4B\u5916\uFF0C\u56DB\u79CD\u53D6\u6CD5\u5404\u6709\u6240\u636E</div><div class="derive-body"><div class="derive-row"><div class="unit self-unit">` + miniGua(base.key, null) + `<span class="unit-name">${escapeHtml(base.name)}</span><span class="unit-tag">\u672C\u5366</span></div></div><div class="derive-row">${units}</div></div></div>`;
}
function palaceBlock(jingfang) {
  const roster = jingfang && jingfang.roster;
  if (!roster || roster.length === 0) return null;
  const units = roster.map((slot) => {
    const isHere = slot.stage === jingfang.stage;
    const isOdd = slot.stage === "\u6E38\u9B42" || slot.stage === "\u5F52\u9B42";
    const classes = ["unit", isHere ? "self self-unit" : "", isOdd ? "odd" : ""].filter(Boolean).join(" ");
    return `<div class="${classes}">` + miniGua(slot.key, slot.flips) + `<span class="unit-name">${escapeHtml(slot.name)}</span><span class="unit-tag">${escapeHtml(slot.stage)}</span></div>`;
  }).join("");
  return `<div class="palace"><div class="derive-head">${escapeHtml(jingfang.palaceName)}\u516B\u5366 \xB7 \u4E94\u884C${escapeHtml(jingfang.element)} \xB7 ${escapeHtml(jingfang.polarity)}</div><div class="palace-row">${units}</div><p class="palace-note">\u6731\u7802\u6846\u4F4F\u7684\u662F\u4F60\u8FD9\u4E00\u5366\uFF1B\u6731\u7802\u723B\u662F\u76F8\u5BF9\u672C\u5BAB\u7EAF\u5366\u53D8\u8FC7\u7684\u723B\u3002\u4E00\u4E16\u5230\u4E94\u4E16\u4E16\u723B\u9010\u723B\u4E0A\u79FB\uFF08\u521D\u3001\u4E8C\u3001\u4E09\u3001\u56DB\u3001\u4E94\uFF09\uFF0C\u6E38\u9B42\u9000\u5230\u56DB\u723B\u3001\u5F52\u9B42\u9000\u5230\u4E09\u723B\u2014\u2014\u8FD9\u4E24\u7EA7\u662F\u6298\u56DE\u53BB\u7684\uFF0C\u6240\u4EE5\u53EB\u300C\u6E38\u300D\u300C\u5F52\u300D\u3002</p></div>`;
}
function showCasting() {
  const slot = el("result-slot");
  stopCastingTyping();
  slot.replaceChildren();
  const card = document.createElement("div");
  card.className = "card casting";
  card.setAttribute("role", "status");
  card.innerHTML = baguaSvg() + '<div class="casting-bar"></div><div class="casting-text">\u8D77 \u5366 \u4E2D</div><div class="casting-hex" aria-hidden="true"></div><div class="casting-log" aria-hidden="true"></div>';
  slot.append(card);
  return {
    log: card.querySelector(".casting-log"),
    hex: card.querySelector(".casting-hex")
  };
}
el("toss-btn").addEventListener("click", tossOnce);
el("toss-reset").addEventListener("click", () => {
  state.tosses = [];
  renderToss();
});
el("toss-finish").addEventListener("click", () => {
  if (state.tosses.length !== 6) return;
  cast({ method: "coins", question: el("question").value.trim(), sums: state.tosses });
});
function syncTossProgress() {
  const done = state.tosses.length;
  const total = 6;
  el("toss-fill").style.width = `${done / total * 100}%`;
  el("toss-count").textContent = `\u5DF2\u6447 ${done} / ${total} \u723B`;
}
function syncTossButtons() {
  el("toss-btn").disabled = state.tosses.length >= 6;
  el("toss-finish").disabled = state.tosses.length !== 6;
}
function lockToss() {
  el("toss-btn").disabled = true;
  el("toss-reset").disabled = true;
  return function unlockToss() {
    el("toss-reset").disabled = false;
    syncTossButtons();
  };
}
async function tossOnce() {
  if (state.tosses.length >= 6) return;
  const unlock = lockToss();
  try {
    const data = await api("/toss", { method: "POST" });
    const slots = el("coins").children;
    data.coins.forEach((isBack, index) => {
      const slot = slots[index];
      const coin = slot.querySelector(".coin");
      slot.classList.remove("spin");
      coin.classList.remove("spin");
      void coin.offsetWidth;
      slot.classList.add("spin");
      coin.classList.add("spin");
      coin.textContent = isBack ? "\u80CC" : "\u5B57";
      setTimeout(() => {
        slot.classList.remove("spin");
        coin.classList.remove("spin");
      }, 940);
    });
    state.tosses.push(data.sum);
    renderToss(data);
  } catch (error) {
    announce(error.message);
  } finally {
    unlock();
  }
}
function renderToss(latest) {
  const log = el("toss-log");
  log.replaceChildren();
  state.tosses.forEach((sum, index) => {
    const row = document.createElement("div");
    const isLatest = latest && index === state.tosses.length - 1;
    const kind = sum === 9 ? "\u8001\u9633 \u25CB" : sum === 8 ? "\u5C11\u9634" : sum === 7 ? "\u5C11\u9633" : "\u8001\u9634 \xD7";
    const name = ["\u521D\u723B", "\u4E8C\u723B", "\u4E09\u723B", "\u56DB\u723B", "\u4E94\u723B", "\u4E0A\u723B"][index];
    row.innerHTML = `<b>${name}</b><span>${sum} \xB7 ${kind}</span>`;
    if (isLatest) row.style.color = "var(--seal)";
    log.prepend(row);
  });
  syncTossButtons();
  syncTossProgress();
}
function body(entry) {
  if (!entry) return "";
  const at = entry.indexOf("\uFF1A");
  return at < 0 ? entry : entry.slice(at + 1);
}
function guaLines(hexagram, lines, jingfang, useGodPosition, hidden, states, gods, transforms, circle, clash) {
  const wrap = document.createElement("div");
  wrap.className = "gua-lines";
  const names = ["\u4E0A\u723B", "\u4E94\u723B", "\u56DB\u723B", "\u4E09\u723B", "\u4E8C\u723B", "\u521D\u723B"];
  for (let position = 6; position >= 1; position -= 1) {
    const line = lines ? lines[position - 1] : null;
    const row = document.createElement("div");
    const isYang = line ? line.value === 1 : hexagram.key[position - 1] === "1";
    row.className = `gua-line ${isYang ? "yang" : "yin"}${line && line.moving ? " moving" : ""}`;
    row.dataset.pos = String(position);
    const mark = line && line.moving ? line.kind === "\u8001\u9633" ? "\u25CB" : "\xD7" : line && !isYang ? "" : "";
    const na = jingfang && jingfang.lines ? jingfang.lines[position - 1] : null;
    const isGod = useGodPosition === position;
    const fu = (hidden || []).find((item) => item.position === position);
    const st = states ? states[position - 1] : null;
    const stateMark = !st ? "" : [
      st.void ? `\u7A7A${st.voidKind && st.voidKind !== "\u65EC\u7A7A\u672A\u5224" ? st.voidKind[0] : ""}` : "",
      st.broken ? "\u7834" : "",
      st.tomb ? "\u5893" : "",
      st.dark ? "\u6697" : "",
      st.dayBroken ? "\u65E5\u7834" : "",
      st.pressed ? "\u51B2\u6563" : "",
      st.combined ? "\u5408" : "",
      st.punished ? "\u5211" : ""
    ].filter(Boolean).map((word) => `<span class="st${word === "\u7834" || word === "\u5893" || word === "\u65E5\u7834" ? " po" : ""}${word === "\u5893" ? " tomb" : ""}"${word === "\u51B2\u6563" ? ' title="\u52A8\u723B\u9022\u65E5\u51B2\uFF0C\u8C13\u4E4B\u51B2\u6563\uFF1B\u539F\u4E66\u5C61\u8BD5\u7684\u7ED3\u8BBA\u662F\u51B2\u4E4B\u4E0D\u6563"' : ""}${word === "\u5408" ? ' title="\u6B64\u723B\u9022\u5408\uFF1A\u5408\u8D77\u3001\u5408\u7ECA\u3001\u5408\u597D\u6216\u5316\u6276\uFF0C\u56DB\u540D\u89C1\u53F3\u680F\u90A3\u4E00\u683C\u3002\u5408\u4E0D\u662F\u5224\u8BCD\uFF0C\u539F\u4E66\u8BF4\u300C\u5B9C\u5408\u5409\uFF0C\u4E0D\u5B9C\u5408\u51F6\u300D\uFF0C\u5409\u51F6\u4ECD\u770B\u7528\u795E\u65FA\u8870"' : ""}${word === "\u5211" ? ' title="\u6B64\u723B\u72AF\u5211\u3002\u4E09\u5211\u7AE0\u8BF4\u300C\u6216\u56E0\u7528\u795E\u4F11\u56DA\u53C8\u517C\u4ED6\u723B\u72AF\u4E4B\uFF0C\u5211\u8005\u5219\u89C1\u51F6\uFF1B\u800C\u72EC\u72AF\u4E09\u5211\u5F97\u9A8C\u8005\u5C11\uFF0C\u5360\u8FC7\u6570\u5341\u5E74\u53EA\u9A8C\u5F97\u4E00\u5366\u300D\u2014\u2014\u72AF\u5211\u672C\u8EAB\u4E0D\u662F\u5224\u8BCD"' : ""}>${word}</span>`).join("");
    const role = !circle ? null : (circle.yuan || []).includes(position) ? "\u5143" : (circle.ji || []).includes(position) ? "\u5FCC" : (circle.chou || []).includes(position) ? "\u4EC7" : null;
    const roleMark = role ? `<span class="role role-${role}" title="${role === "\u5143" ? "\u5143\u795E\uFF1A\u751F\u7528\u795E\u7684\u90A3\u4E00\u723B" : role === "\u5FCC" ? "\u5FCC\u795E\uFF1A\u514B\u7528\u795E\u7684\u90A3\u4E00\u723B" : "\u4EC7\u795E\uFF1A\u538B\u7740\u5143\u795E\u3001\u53CD\u53BB\u751F\u5FCC\u795E"}">${role}</span>` : "";
    const tf = (transforms || []).find((item) => item.position === position);
    const huMark = tf ? `<span class="hu${tf.relation === "\u56DE\u5934\u514B" || tf.relation === "\u56DE\u5934\u751F" ? " hot" : ""}" title="\u5316\u51FA\u4E4B\u723B">${escapeHtml(tf.relation)}</span>` : "";
    row.innerHTML = `<span class="pos">${names[6 - position]}</span><span class="sg">${gods ? escapeHtml(gods[position - 1]) : ""}</span><span class="bars">${isYang ? "<i></i>" : "<i></i><i></i>"}</span><span class="mark">${mark}</span>` + (na ? `<span class="rel"><span class="ganzhi">${escapeHtml(na.stem + na.branch + na.element)}</span><span class="qin">${escapeHtml(na.relative)}</span>` + (na.role ? `<span class="role">${na.role}</span>` : "") + (isGod ? '<span class="role god">\u7528</span>' : "") + roleMark + stateMark + (fu ? `<span class="fu" title="\u4F0F\u795E">\u4F0F ${escapeHtml(fu.hushen)}${escapeHtml(fu.relative)}</span>` : "") + huMark + `</span>` : "");
    wrap.append(row);
  }
  const ribbon = clashPairs(clash);
  if (ribbon.length > 0) wrap.ribbon = { pairs: ribbon, jingfang };
  return wrap;
}
function clashPairs(clash) {
  if (!clash) return [];
  return (clash.pairs || []).filter((pair) => pair.kind);
}
function mountClashRibbons(root) {
  for (const wrap of root.querySelectorAll(".gua-lines")) {
    if (wrap.ribbon) clashRibbon(wrap);
  }
}
function clashRibbon(wrap) {
  const { pairs, jingfang } = wrap.ribbon;
  delete wrap.ribbon;
  if (!jingfang || !jingfang.lines) return;
  const rowOf = (position) => wrap.querySelector(`.gua-line[data-pos="${position}"]`);
  const svgNS = "http://www.w3.org/2000/svg";
  const width = wrap.clientWidth;
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "clash-ribbon");
  svg.setAttribute("aria-hidden", "true");
  for (const pair of pairs) {
    const lower = rowOf(pair.lower);
    const upper = rowOf(pair.upper);
    if (!lower || !upper) continue;
    const x = width + 3;
    const y1 = lower.offsetTop + lower.offsetHeight / 2;
    const y2 = upper.offsetTop + upper.offsetHeight / 2;
    const mid = (y1 + y2) / 2;
    const bulge = 7 + Math.abs(y2 - y1) / 12;
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", `M ${x} ${y1} Q ${x + bulge} ${mid} ${x} ${y2}`);
    path.setAttribute("class", `clash-arc ${pair.kind === "\u51B2" ? "is-chong" : "is-he"}`);
    const title = document.createElementNS(svgNS, "title");
    title.textContent = `${jingfang.lines[pair.lower - 1].branch}${pair.kind}${jingfang.lines[pair.upper - 1].branch}`;
    path.append(title);
    svg.append(path);
  }
  wrap.append(svg);
}
function clashFact(reading) {
  const c = reading.clash;
  const jf = reading.jingfang;
  if (!c || !jf) return null;
  if (!(c.chong || c.he || c.changedChong || c.transformClash.length)) return null;
  const br = (position) => jf.lines[position - 1].branch;
  const out = [c.chong ? "\u672C\u5366\u516D\u51B2\u5366" : c.he ? "\u672C\u5366\u516D\u5408\u5366" : "\u672C\u5366\u975E\u516D\u51B2\u975E\u516D\u5408"];
  const spoken = c.pairs.filter((pair) => pair.kind).map((pair) => `${br(pair.lower)}${pair.kind}${br(pair.upper)}`);
  if (spoken.length > 0) out.push(spoken.join(" \xB7 "));
  const tail = [];
  if (c.chongToChong) tail.push("\u53D8\u5366\u4EA6\u516D\u51B2");
  else if (c.heToChong) tail.push("\u53D8\u5366\u516D\u51B2\uFF08\u516D\u5408\u53D8\u516D\u51B2\uFF09");
  else if (c.changedChong) tail.push("\u53D8\u5366\u516D\u51B2");
  if (c.transformClash.length > 0) tail.push(`${c.transformClash.length} \u723B\u52A8\u723B\u53D8\u51B2`);
  return out.join("\uFF0C") + (tail.length > 0 ? `\uFF1B${tail.join("\uFF1B")}` : "");
}
function clashTag(reading, which) {
  const c = reading.clash;
  if (!c) return null;
  if (which === "\u672C\u5366") {
    if (c.chong) return "\u516D\u51B2";
    if (c.he) return "\u516D\u5408";
    return null;
  }
  if (c.changedChong) return "\u516D\u51B2";
  if (c.changedHe) return "\u516D\u5408";
  return null;
}
function guaBlock(hexagram, lines, label, jingfang, useGodPosition, hidden, states, gods, transforms, circle, tag, clash) {
  const block = document.createElement("div");
  const title = document.createElement("div");
  title.className = "gua-title";
  const gong = jingfang ? ` \xB7 ${escapeHtml(jingfang.palaceName + jingfang.stage + "\u5366")}` : "";
  title.innerHTML = `<h3 class="serif">${hexagram.name}</h3><span class="meta">${label} \xB7 \u7B2C ${hexagram.order} \u5366 \xB7 \u4E0A\u4E0B ${hexagram.upper.name}${hexagram.lower.name} \xB7 \u4E94\u884C ${hexagram.element}${gong}</span>` + (tag ? `<span class="gua-tag" title="${tag === "\u516D\u51B2" ? "\u521D\u56DB\u3001\u4E8C\u4E94\u3001\u4E09\u516D\u4E09\u5BF9\u5730\u652F\u4E24\u4E24\u76F8\u51B2" : "\u521D\u56DB\u3001\u4E8C\u4E94\u3001\u4E09\u516D\u4E09\u5BF9\u5730\u652F\u4E24\u4E24\u76F8\u5408"}">${tag}</span>` : "");
  block.append(title);
  block.append(guaLines(hexagram, lines, jingfang, useGodPosition, hidden, states, gods, transforms, circle, clash));
  const text = document.createElement("div");
  text.className = "text-line serif";
  text.innerHTML = `<p style="margin:0">${escapeHtml(hexagram.judgment)}</p><p class="tuan">${escapeHtml(hexagram.tuan)}</p><p style="margin:0">${escapeHtml(hexagram.image)}</p>`;
  block.append(text);
  const moving = lines ? lines.filter((line) => line.moving && line.text) : [];
  if (moving.length > 0) {
    const yao = document.createElement("div");
    yao.className = "yao-line serif anim-rise";
    yao.innerHTML = '<span class="tag">\u52A8\u723B\u723B\u8F9E</span>' + moving.map((line) => {
      const say = body(line.text);
      const why = line.xiang ? `<em>\u8C61\u66F0\uFF1A${escapeHtml(body(line.xiang))}</em>` : "";
      return `<p style="margin:0"><b>${escapeHtml(line.label)}</b>\u3000${escapeHtml(say)}${why}</p>`;
    }).join("");
    block.append(yao);
  }
  return block;
}
function useGodFact(useGod) {
  if (useGod.picked) {
    return `\u53D6${useGod.present.join("\u3001")} \xB7 ${useGod.picked.label}\uFF08${useGod.why}\uFF09`;
  }
  const named = useGod.absent.join("\u3001");
  if (!useGod.hidden || useGod.hidden.length === 0) {
    return `\u53D6${named} \xB7 \u4E0D\u4E0A\u5366\uFF0C\u672C\u5BAB\u9996\u5366\u4EA6\u65E0`;
  }
  const where = useGod.hidden.map((h) => `\u4F0F${h.position}\u723B ${h.hushen}`).join("\u3001");
  return `\u53D6${named} \xB7 \u4E0D\u4E0A\u5366\uFF0C${where}`;
}
function renderReading(reading) {
  const slot = el("result-slot");
  slot.replaceChildren();
  const card = document.createElement("div");
  card.className = "card";
  const head = document.createElement("div");
  head.className = "row";
  head.style.justifyContent = "space-between";
  const headline = document.createElement("div");
  headline.innerHTML = `<h2 class="serif" style="margin:0">${escapeHtml(reading.question || castingTitle(reading.method))}</h2><p class="hint" style="margin:4px 0 0">${reading.method} \xB7 ${new Date(reading.createdAt).toLocaleString("zh-CN")}</p>`;
  const badge = document.createElement("span");
  badge.className = "verdict reveal-seal";
  badge.textContent = `${reading.verdict.label} \xB7 ${escapeHtml(reading.verdict.key)}`;
  head.append(headline, badge);
  card.append(head);
  const lead = document.createElement("section");
  lead.className = "verdict-block anim-rise";
  lead.setAttribute("aria-label", "\u7ED3\u8BBA");
  const leadRow = document.createElement("div");
  leadRow.className = "verdict-lead";
  const mark = document.createElement("span");
  mark.className = "verdict-mark";
  mark.textContent = reading.verdict.label;
  const markShort = document.createElement("span");
  markShort.className = "verdict-say-short";
  markShort.textContent = reading.verdict.summary.split("\uFF1A").slice(1).join("\uFF1A") || reading.verdict.summary;
  leadRow.append(mark, markShort);
  lead.append(leadRow);
  const say = document.createElement("p");
  say.className = "verdict-say";
  say.textContent = reading.verdict.text;
  lead.append(say);
  if (reading.topicLine) {
    const onTopic = document.createElement("p");
    onTopic.className = "verdict-say verdict-on-topic";
    onTopic.textContent = reading.topicLine;
    lead.append(onTopic);
  }
  const calc = document.createElement("p");
  calc.className = "verdict-calc";
  calc.textContent = `\u600E\u4E48\u7B97\u7684\uFF1A${reading.verdict.key}\uFF0C\u5149\u770B\u751F\u514B\u672C\u4E3A${reading.verdict.relationVerdict}\uFF1B\u4F53\u5366\u9022\u5F53\u6708\u4EE4\u4E3A\u300C${reading.verdict.vitality}\u300D\uFF0C\u4E24\u4E0B\u4E00\u5408 ${reading.verdict.score} \u5206\uFF0C\u843D\u5230${reading.verdict.label}\u3002`;
  lead.append(calc);
  if (reading.advice.suitable.length > 0 || reading.advice.avoid.length > 0) {
    const picks = document.createElement("div");
    picks.className = "verdict-picks";
    if (reading.advice.suitable.length > 0) {
      const good = document.createElement("div");
      good.className = "good";
      good.innerHTML = `<h3>\u5B9C</h3><ul>${reading.advice.suitable.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
      picks.append(good);
    }
    if (reading.advice.avoid.length > 0) {
      const bad = document.createElement("div");
      bad.className = "bad";
      bad.innerHTML = `<h3>\u5FCC</h3><ul>${reading.advice.avoid.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
      picks.append(bad);
    }
    lead.append(picks);
  }
  if (reading.advice.caution) {
    const warn = document.createElement("p");
    warn.className = "verdict-warn";
    warn.textContent = reading.advice.caution;
    lead.append(warn);
  }
  card.append(lead);
  const body2 = document.createElement("div");
  body2.className = "reading";
  body2.style.marginTop = "16px";
  const left = document.createElement("div");
  left.className = "gua-block reveal";
  left.append(guaBlock(
    reading.hexagram,
    reading.lines,
    "\u672C\u5366",
    reading.jingfang,
    reading.useGod && reading.useGod.picked ? reading.useGod.picked.position : null,
    reading.useGod && reading.useGod.hidden || [],
    reading.states || [],
    reading.sixGods || null,
    null,
    reading.useGod && reading.useGod.circle || null,
    clashTag(reading, "\u672C\u5366"),
    reading.clash
  ));
  if (reading.changed) {
    const changed = document.createElement("div");
    changed.append(guaBlock(
      reading.changed,
      null,
      "\u53D8\u5366",
      reading.changedJingfang,
      null,
      [],
      [],
      null,
      reading.transforms || [],
      null,
      clashTag(reading, "\u53D8\u5366"),
      reading.clash ? { pairs: reading.clash.changedPairs || [] } : null
    ));
    left.append(changed);
  }
  body2.append(left);
  const right = document.createElement("div");
  const facts = document.createElement("dl");
  facts.className = "facts";
  const s = reading.structure;
  const jf = reading.jingfang;
  const rows = [
    ["\u4F53\u5366\uFF08\u6211\uFF09", `${s.body.name} \xB7 ${s.body.element} \xB7 ${s.body.nature} \xB7 ${s.body.direction} \xB7 ${s.body.position}`],
    ["\u7528\u5366\uFF08\u4E8B\uFF09", `${s.use.name} \xB7 ${s.use.element} \xB7 ${s.use.nature} \xB7 ${s.use.direction} \xB7 ${s.use.position}`],
    // 写成「生克本为 X」而不是「A → B」：这一行是依据不是结论，箭头读起来
    // 像「所以是 B」，而 B 已经不是这一行的结论了——总分还要过旺衰那一关。
    ["\u751F\u514B", `${reading.verdict.key} \xB7 \u751F\u514B\u672C\u4E3A${reading.verdict.relationVerdict}`],
    ["\u4E3B\u5BA2", `\u4F53\u5728${s.shi.label}\uFF0C\u7528\u5728${s.ying.label}`],
    jf ? ["\u516D\u4EB2\u4E16\u5E94", `${jf.palaceName}${jf.stage}\u5366 \xB7 \u4E16${jf.shi}\u723B\u6301${jf.lines[jf.shi - 1].relative} \xB7 \u5E94${jf.ying}\u723B\u4E3A${jf.lines[jf.ying - 1].relative}`] : null,
    clashFact(reading) ? ["\u5366\u4F53\u51B2\u5408", clashFact(reading)] : null,
    reading.useGod ? ["\u7528\u795E", useGodFact(reading.useGod)] : null,
    ["\u6708\u4EE4\u65FA\u8870", `\u5F53\u4EE4 ${s.monthElement} \xB7 \u4F53 ${s.bodyVitality} \xB7 \u7528 ${s.useVitality}`],
    reading.void ? ["\u65EC\u7A7A\u6708\u7834", `${reading.void.headName}\u65EC\u7A7A ${reading.void.names.join("")} \xB7 \u672C\u6708\u7834 ${reading.void.brokenName}`] : null
  ].filter(Boolean);
  for (const [term, value] of rows) {
    const dt = document.createElement("dt");
    dt.textContent = term;
    const dd = document.createElement("dd");
    dd.textContent = value;
    facts.append(dt, dd);
  }
  right.append(facts);
  if (reading.cadence) {
    const cadence = document.createElement("div");
    cadence.className = "cadence anim-rise";
    cadence.setAttribute("role", "note");
    cadence.innerHTML = `<b>\u4F55\u65F6\u4F1A\u53D8\uFF1A</b>${escapeHtml(reading.cadence.text)}<span class="next">\u5F53\u524D\u53D6\u6570\u4F9D\u636E\uFF1A${escapeHtml(reading.cadence.current)} \uFF5C \u4E0B\u4E00\u6B21\uFF1A${escapeHtml(reading.cadence.next)}</span>`;
    right.append(cadence);
  }
  const palace = palaceBlock(reading.jingfang);
  if (palace) {
    const box = document.createElement("div");
    box.className = "anim-fade";
    box.innerHTML = palace;
    right.append(box);
  }
  const derive = deriveBlock(reading);
  if (derive) {
    const box = document.createElement("div");
    box.className = "anim-fade";
    box.innerHTML = derive;
    right.append(box);
  }
  if (reading.qi) {
    const ring = document.createElement("div");
    ring.className = "qi-block anim-fade";
    ring.innerHTML = qiRingSvg(reading.qi);
    const note = document.createElement("p");
    note.className = "hint";
    note.style.textAlign = "center";
    note.style.marginTop = "6px";
    note.textContent = reading.qi.self ? `\u73AF\u4E0A\u6731\u7802\u70B9\u662F\u4F60\u8FD9\u4E00\u5366\u300C${reading.qi.selfName}\u300D\u5728\u5341\u4E8C\u8F9F\u5366\u4E2D\u7684\u4F4D\u7F6E\uFF1B\u5F53\u6708\u4E3B\u5366\u4E3A${reading.qi.lord}` : `\u672C\u5366\u4E0D\u5728\u5341\u4E8C\u8F9F\u5366\u4E4B\u5217\uFF1B\u73AF\u4E0A\u9AD8\u4EAE\u7684\u662F\u5F53\u6708\u4E3B\u5366${reading.qi.lord}`;
    ring.append(note);
    right.append(ring);
  }
  const ins = document.createElement("ul");
  ins.className = "insights";
  ins.style.marginTop = "14px";
  for (const item of reading.insights) {
    const li = document.createElement("li");
    li.className = "anim-rise";
    const strong = document.createElement("strong");
    strong.textContent = item.title;
    const span = document.createElement("span");
    span.textContent = item.text;
    li.append(strong, span);
    ins.append(li);
  }
  right.append(ins);
  body2.append(right);
  card.append(body2);
  const detail = document.createElement("div");
  detail.className = "cols anim-rise";
  detail.style.marginTop = "14px";
  const base = document.createElement("div");
  base.innerHTML = `<h3>\u8D77\u5366\u4F9D\u636E</h3><ul>${reading.details.map((item) => `<li>${escapeHtml(item.label)}\uFF1A${escapeHtml(item.value)}</li>`).join("")}</ul>`;
  const relations = document.createElement("div");
  relations.innerHTML = `<h3>\u53C2\u8BE6\u4E4B\u5366</h3><ul><li>\u4E92\u5366\uFF08\u8FC7\u7A0B\uFF09\uFF1A${escapeHtml(reading.mutual.name)}</li><li>\u9519\u5366\uFF08\u65C1\u652F\uFF09\uFF1A${escapeHtml(reading.opposite.name)}</li><li>\u7EFC\u5366\uFF08\u53CD\u6C42\uFF09\uFF1A${escapeHtml(reading.inverted.name)}</li>` + (reading.timing ? `<li>\u5E94\u671F\uFF1A${escapeHtml(reading.timing)}</li>` : "") + `</ul>`;
  detail.append(base, relations);
  card.append(detail);
  const save = document.createElement("div");
  save.className = "row anim-rise";
  save.style.marginTop = "18px";
  const noteInput = document.createElement("input");
  noteInput.type = "text";
  noteInput.maxLength = "2000";
  noteInput.placeholder = "\u8865\u4E00\u53E5\u6279\u6CE8\uFF08\u53EF\u7559\u7A7A\uFF09";
  noteInput.id = "note-input";
  noteInput.style.flex = "1 1 220px";
  const saveBtn = document.createElement("button");
  saveBtn.className = "primary";
  saveBtn.textContent = "\u5B58\u5165\u5366\u5386";
  const saveStatus = document.createElement("span");
  saveStatus.className = "save-status";
  saveStatus.setAttribute("aria-live", "polite");
  saveBtn.addEventListener("click", () => saveReading(reading, saveBtn, noteInput, saveStatus));
  save.append(noteInput, saveBtn, saveStatus);
  card.append(save);
  slot.append(card);
  mountClashRibbons(card);
}
async function saveReading(reading, button, noteInput, status) {
  button.disabled = true;
  setSaveStatus(status, "\u5B58\u5165\u4E2D\u2026");
  try {
    await api("/history", {
      method: "POST",
      body: JSON.stringify({ id: reading.id, note: noteInput.value })
    });
    button.textContent = "\u5DF2\u5B58\u5165\u5366\u5386";
    setSaveStatus(status, "");
    announce("\u5DF2\u5B58\u5165\u5366\u5386");
  } catch (error) {
    if (error.code === "unknown_cast") {
      button.textContent = "\u8FD9\u4E00\u5366\u5B58\u4E0D\u4E86\u4E86";
      setSaveStatus(status, error.message, true);
      announce(error.message);
      return;
    }
    button.disabled = false;
    button.textContent = "\u5B58\u5165\u5366\u5386";
    setSaveStatus(status, error.message, true);
    announce(error.message);
  }
}
function setSaveStatus(status, text, isError = false) {
  status.textContent = text;
  status.classList.toggle("err", Boolean(isError));
  status.setAttribute("role", isError ? "alert" : "status");
}
async function loadLibrary() {
  try {
    const data = await api("/library");
    state.library = data.hexagrams;
    renderLibrary();
  } catch (error) {
    announce(error.message);
  }
}
el("library-search").addEventListener("input", renderLibrary);
function renderLibrary() {
  const keyword = el("library-search").value.trim();
  const grid = el("library-grid");
  grid.replaceChildren();
  const matched = state.library.filter(
    (item) => !keyword || item.name.includes(keyword) || item.upper.includes(keyword) || item.lower.includes(keyword)
  );
  if (matched.length === 0) {
    grid.innerHTML = '<div class="empty">\u6CA1\u6709\u5339\u914D\u7684\u5366</div>';
    return;
  }
  for (const item of matched) {
    const cell = document.createElement("button");
    cell.className = "gua-cell";
    cell.setAttribute("aria-pressed", String(state.librarySelection === item.order));
    cell.innerHTML = `<div class="order">${item.order}</div><div class="mini serif">${item.symbol}</div><div class="nm serif">${item.name}</div>`;
    cell.addEventListener("click", () => {
      state.librarySelection = item.order;
      renderLibrary();
      renderLibraryDetail(item);
    });
    grid.append(cell);
  }
}
function renderLibraryDetail(item) {
  const slot = el("library-detail");
  slot.replaceChildren();
  const card = document.createElement("div");
  card.className = "card";
  const head = document.createElement("div");
  const gong = item.palace ? ` \xB7 ${escapeHtml(item.palace.palaceName + item.palace.stage + "\u5366")}` : "";
  head.innerHTML = `<h2 class="serif" style="margin:0">${escapeHtml(item.name)}</h2><p class="hint" style="margin:4px 0 0">\u7B2C ${item.order} \u5366 \xB7 \u4E0A${escapeHtml(item.upper)}\u4E0B${escapeHtml(item.lower)} \xB7 \u4E94\u884C ${escapeHtml(item.element)}${gong}</p>`;
  card.append(head);
  const body2 = document.createElement("div");
  body2.className = "reading";
  body2.style.marginTop = "12px";
  const left = document.createElement("div");
  left.append(guaLines(item, null, item.palace || null));
  const rel = document.createElement("div");
  rel.className = "row";
  rel.style.marginTop = "14px";
  rel.style.gap = "16px";
  const shiYing = item.palace ? `<span>\u4E16${item.palace.shi}\u723B\u6301${escapeHtml(item.palace.lines[item.palace.shi - 1].relative)}</span><span>\u5E94${item.palace.ying}\u723B\u4E3A${escapeHtml(item.palace.lines[item.palace.ying - 1].relative)}</span>` : "";
  rel.innerHTML = shiYing + `<span>\u4E92\u5366 ${escapeHtml(item.mutual)}</span><span>\u9519\u5366 ${escapeHtml(item.opposite)}</span><span>\u7EFC\u5366 ${escapeHtml(item.inverted)}</span>`;
  left.append(rel);
  body2.append(left);
  const right = document.createElement("div");
  const quote = document.createElement("p");
  quote.className = "text-line serif";
  quote.innerHTML = `<p style="margin:0 0 8px">${escapeHtml(item.judgment)}</p><p class="tuan">${escapeHtml(item.tuan)}</p><p style="margin:0">${escapeHtml(item.image)}</p>`;
  const seek = document.createElement("div");
  seek.className = "row";
  seek.style.marginTop = "16px";
  const seekBtn = document.createElement("button");
  seekBtn.textContent = "\u4EE5\u6B64\u5366\u8D77\u4E00\u5366";
  seekBtn.addEventListener("click", async () => {
    selectTab("cast");
    await cast({ method: "hexagram", key: item.key, question: el("question").value.trim() });
  });
  seek.append(seekBtn);
  right.append(quote, seek);
  body2.append(right);
  card.append(body2);
  slot.append(card);
}
function renderAlmanac(data) {
  const slot = el("almanac-slot");
  slot.replaceChildren();
  const a = data.almanac;
  const head = document.createElement("div");
  head.className = "card";
  head.innerHTML = `<h2 class="serif">${a.date} \xB7 ${a.year.name}\u5E74 ${a.year.zodiac}\u5E74</h2><p class="hint">\u5F53\u524D ${escapeHtml(a.currentTerm)} \u8282\uFF0C\u6708\u5EFA ${a.month.name}\uFF08${a.month.element}\uFF09</p>`;
  const facts = document.createElement("dl");
  facts.className = "facts";
  const pairs = [
    ["\u5E74\u67F1", `${a.year.name} \xB7 ${a.year.element ?? ""}`],
    ["\u6708\u67F1", `${a.month.name} \xB7 ${a.month.element}`],
    ["\u65E5\u67F1", a.day.name],
    ["\u65F6\u8FB0", `${a.hour.name}\uFF08${a.hour.range}\uFF09`],
    ["\u5EFA\u9664", `${a.jianchu.name}\u65E5 \xB7 \u5B9C ${a.jianchu.suitable} \xB7 \u5FCC ${a.jianchu.avoid}`],
    ["\u6570\u4E5D", a.shujiu ? `${a.shujiu.label} \xB7 ${a.shujiu.stage}\uFF08\u7B2C ${a.shujiu.elapsed} \u5929\uFF09` : "\u4E0D\u5728\u6570\u4E5D"]
  ];
  for (const [term, value] of pairs) {
    const dt = document.createElement("dt");
    dt.textContent = term;
    const dd = document.createElement("dd");
    dd.textContent = value;
    facts.append(dt, dd);
  }
  head.append(facts);
  slot.append(head);
  const hours = document.createElement("div");
  hours.className = "card";
  const hourTitle = document.createElement("h2");
  hourTitle.textContent = "\u5341\u4E8C\u65F6\u8FB0\u5409\u51F6";
  const hourHint = document.createElement("p");
  hourHint.className = "hint";
  hourHint.textContent = `\u4F9D\u65E5\u67F1 ${a.day.name} \u8BBA\u9EC4\u9ED1\u9053\uFF1A\u5409\u65F6 ${a.luckyHours.join("\u3001")}`;
  hours.append(hourTitle, hourHint);
  const hourGrid = document.createElement("div");
  hourGrid.className = "hour-grid";
  for (const item of a.hours) {
    const cell = document.createElement("div");
    cell.className = `hour ${item.auspicious ? "auspicious" : "inauspicious"}${item.current ? " current" : ""}`;
    cell.innerHTML = `<div class="nm">${escapeHtml(item.name)}</div><div class="tm">${escapeHtml(item.range)}</div><div class="god">${escapeHtml(item.pillar)} \xB7 ${escapeHtml(item.office)}</div>`;
    hourGrid.append(cell);
  }
  hours.append(hourGrid);
  slot.append(hours);
  const terms = document.createElement("div");
  terms.className = "card";
  const termTitle = document.createElement("h2");
  termTitle.textContent = "\u4E8C\u5341\u56DB\u8282\u6C14";
  const termHint = document.createElement("p");
  termHint.className = "hint";
  termHint.textContent = "\u65E5\u671F\u4E3A\u5E38\u5E74\u8FD1\u4F3C\u503C\uFF0C\u4EA4\u8282\u65F6\u523B\u9010\u5E74\u6446\u52A8\uFF0C\u53EF\u80FD\u6709\u4E00\u65E5\u4E4B\u5DEE\u3002";
  terms.append(termTitle, termHint);
  const termList = document.createElement("div");
  termList.className = "term-list";
  for (const term of data.solarTerms) {
    const cell = document.createElement("div");
    const active = term.name === a.currentTerm;
    cell.className = active ? "now" : "";
    cell.innerHTML = `<b>${escapeHtml(term.name)}</b> <span>${term.month}/${term.day}</span> ${escapeHtml(term.kind)}`;
    termList.append(cell);
  }
  terms.append(termList);
  slot.append(terms);
  const zodiac = document.createElement("div");
  zodiac.className = "card";
  const zTitle = document.createElement("h2");
  zTitle.textContent = "\u5341\u4E8C\u751F\u8096";
  const zHint = document.createElement("p");
  zHint.className = "hint";
  zHint.textContent = "\u76F8\u5408\u3001\u4E09\u5408\u4E0E\u76F8\u51B2\u3002";
  zodiac.append(zTitle, zHint);
  const zList = document.createElement("div");
  zList.className = "term-list";
  for (const item of data.zodiac) {
    const cell = document.createElement("div");
    cell.innerHTML = `<b>${escapeHtml(item.branch)}${escapeHtml(item.zodiac)}</b> <span>${escapeHtml(item.element)}</span> <span>\u5408 ${escapeHtml(item.harmony ?? "\u2014")} \xB7 \u51B2 ${escapeHtml(item.conflict)}</span>`;
    zList.append(cell);
  }
  zodiac.append(zList);
  slot.append(zodiac);
}
async function loadHistory() {
  const slot = el("history-slot");
  try {
    const data = await api("/history");
    slot.replaceChildren();
    if (data.entries.length === 0) {
      slot.innerHTML = '<div class="empty">\u8FD8\u6CA1\u6709\u5B58\u8FC7\u5366\u3002\u8D77\u4E00\u5366\uFF0C\u5B58\u5165\u5366\u5386\u3002</div>';
      return;
    }
    for (const entry of data.entries) {
      const item = document.createElement("div");
      item.className = "history-item";
      const main = document.createElement("div");
      main.className = "main";
      const q = document.createElement("div");
      q.className = "q";
      q.textContent = entry.question || castingTitle(entry.method);
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `${entry.hexagram.name} \xB7 ${entry.verdict ? entry.verdict.label : ""} \xB7 ${new Date(entry.createdAt).toLocaleString("zh-CN")}`;
      main.append(q, meta);
      if (entry.note) {
        const note = document.createElement("div");
        note.className = "meta";
        note.textContent = `\u6279\u6CE8\uFF1A${entry.note}`;
        main.append(note);
      }
      const remove = document.createElement("button");
      remove.className = "ghost";
      remove.textContent = "\u5220\u9664";
      remove.addEventListener("click", async () => {
        try {
          await api(`/history/${encodeURIComponent(entry.id)}`, { method: "DELETE" });
          announce("\u5DF2\u5220\u9664");
          loadHistory();
        } catch (error) {
          announce(error.message);
        }
      });
      item.append(main, remove);
      slot.append(item);
    }
  } catch (error) {
    slot.innerHTML = `<div class="empty">\u8BFB\u53D6\u5931\u8D25\uFF1A${escapeHtml(error.message)}</div>`;
  }
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}
async function boot() {
  try {
    const data = await api("/bootstrap");
    state.bootstrap = data;
    el("ganzhi-strip").innerHTML = `<span class="pill">${escapeHtml(data.almanac.year.name)}\u5E74 <b>${escapeHtml(data.almanac.year.zodiac)}</b></span><span class="pill">\u6708 <b>${escapeHtml(data.almanac.month.name)}</b></span><span class="pill">\u65E5 <b>${escapeHtml(data.almanac.day.name)}</b></span><span class="pill">${escapeHtml(data.almanac.jianchu.name)}\u65E5</span>` + (data.almanac.shujiu ? `<span class="pill">${escapeHtml(data.almanac.shujiu.label)}</span>` : "");
    renderAlmanac(data);
  } catch (error) {
    el("ganzhi-strip").innerHTML = `<span class="pill">\u5386\u6CD5\u52A0\u8F7D\u5931\u8D25\uFF1A${escapeHtml(error.message)}</span>`;
  }
}
const topbarEl = document.querySelector(".topbar");
if (topbarEl && typeof ResizeObserver === "function") {
  const syncTopbarHeight = () => {
    document.documentElement.style.setProperty("--topbar-h", `${Math.round(topbarEl.offsetHeight)}px`);
  };
  const topbarObserver = new ResizeObserver(syncTopbarHeight);
  topbarObserver.observe(topbarEl);
  syncTopbarHeight();
  window.addEventListener("pagehide", () => topbarObserver.disconnect(), { once: true });
}
boot();
