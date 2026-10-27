import { apiFetch as fetch, interval } from "./adapter.js";
export function initView() {
  const escape = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const $ = (id) => document.getElementById(id);
  let snapshot = null;
  let busy = false;
  const cachedCredits = { lost: null, active: null, usedUp: null };
  const TONE = { "use-card": "use-card", "use-credit": "use-credit", idle: "idle", wait: "wait" };
  const LABEL = { "use-card": "建议用卡", "use-credit": "建议用积分", idle: "额度充足", wait: "暂不处理" };
  const LEVEL_LABEL = {
    comfortable: "额度充足",
    tight: "额度紧张",
    low: "额度不足",
    burned: "额度燃尽"
  };
  const LEVEL_TONE = {
    comfortable: "idle",
    tight: "tight",
    low: "low",
    burned: "burned"
  };
  const OUTCOME = {
    OK: "已判定",
    ERROR: "判定失败"
  };
  const DAY = 864e5;
  const fmtDay = (ms) => {
    if (!ms) return "未知";
    const d = new Date(ms);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const daysLeft = (ms) => ms ? Math.round((ms - Date.now()) / DAY) : null;
  const dayText = (ms) => {
    const n = daysLeft(ms);
    if (n === null) return "—";
    if (n < 0) return `已过期 ${-n} 天`;
    if (n === 0) return "今天到期";
    return `剩 ${n} 天`;
  };
  const num = (v) => Number(v ?? 0).toLocaleString("zh-CN");
  const label = (r) => OUTCOME[r?.outcome] || r?.outcome || "未知结果";
  const setStatus = (el, text, tone) => {
    el.textContent = text || "";
    el.dataset.tone = tone || "info";
  };
  function fmtInterval(ms) {
    const n = Number(ms);
    if (!Number.isFinite(n) || n <= 0) return "15 秒";
    if (n < 6e4) return `${Math.round(n / 1e3)} 秒`;
    const m = n / 6e4;
    return `${Number.isInteger(m) ? m : m.toFixed(1)} 分钟`;
  }
  function renderAlert(d) {
    const e = d.expiry || {};
    const fig = $("alert-figure");
    fig.textContent = num(Math.round(e.soon7Balance ?? 0));
    const has = (e.soon7Count ?? 0) > 0;
    const tone = !has ? "ok" : e.soon7Balance / Math.max(1, d.codeCredits.liveBalance) > 0.2 ? "danger" : "warning";
    $("alert").dataset.tone = tone;
    fig.dataset.tone = has ? tone : "";
    $("alert-sub").textContent = has ? `${e.soon7Count} 笔即将过期，占有效余额 ${(e.soon7Balance / Math.max(1, d.codeCredits.liveBalance) * 100).toFixed(1)}%` : "7 天内没有积分到期";
    $("soon30").textContent = num(Math.round(e.soon30Balance ?? 0));
    $("live-balance").textContent = num(Math.round(d.codeCredits.liveBalance ?? 0));
    $("lost-balance").textContent = num(Math.round(d.codeCredits.lostBalance ?? 0));
  }
  function renderKpis(d) {
    const f = d.quota?.fiveHour;
    if (f) {
      $("kpi-5h").textContent = f.unlimited ? "不限量" : `剩 ${f.remainingPercent.toFixed(0)}%`;
      const bar = $("bar-5h");
      bar.style.width = f.unlimited ? "100%" : `${Math.min(100, f.remainingPercent)}%`;
      const lv = d.config?.quotaLevels ?? { tight: 80, low: 95 };
      const usedRatio = f.unlimited ? 0 : f.usedPercent / (f.totalPercent || 100) * 100;
      bar.dataset.tone = f.exhausted ? "danger" : usedRatio >= lv.low ? "danger" : usedRatio >= lv.tight ? "warning" : "";
      $("kpi-5h-foot").textContent = f.exhausted ? "已耗尽，请求将扣积分" : `已用 ${f.usedPercent.toFixed(0)}%`;
      const resetIn = d.decision?.resetInMinutes;
      const resetEl = $("kpi-5h-reset");
      if (typeof resetIn === "number" && Number.isFinite(resetIn)) {
        resetEl.textContent = resetIn <= 0 ? "额度正在刷新…" : `距刷新 ${Math.round(resetIn)} 分钟`;
        resetEl.style.color = resetIn <= 15 ? "var(--mcode-warning)" : "";
      } else {
        resetEl.textContent = "";
      }
      const skipEl = $("kpi-5h-skip");
      if (d.decision?.skipCardActive) {
        skipEl.hidden = false;
        skipEl.textContent = `距刷新不足 ${d.decision.cardSkipBeforeResetMinutes} 分钟，建议先别用重置卡`;
        skipEl.style.color = "var(--mcode-warning)";
      } else {
        skipEl.hidden = true;
        skipEl.textContent = "";
      }
    }
    const summary = d.creditSummary;
    $("kpi-total").textContent = summary ? num(Math.round(summary.total)) : num(Math.round(d.codeCredits.liveBalance ?? 0));
    $("kpi-total-foot").textContent = summary ? `购入 ${num(Math.round(summary.purchased))} + 赠送 ${num(Math.round(summary.free))}` : `共 ${d.codeCredits.totalCount ?? 0} 笔`;
    const nx = d.expiry?.nextExpireMs;
    $("kpi-next").textContent = fmtDay(nx);
    $("kpi-next-foot").textContent = nx ? dayText(nx) : "—";
    $("kpi-card").textContent = String(d.cards.live ?? 0);
    $("kpi-card-foot").textContent = `共 ${d.cards.total ?? 0} 张`;
  }
  function renderVerdict(d) {
    const v = d.decision || {};
    const isIdle = v.action === "idle";
    const level = v.level || "comfortable";
    const tone = isIdle ? LEVEL_TONE[level] || "idle" : TONE[v.action] || "idle";
    const label2 = isIdle ? LEVEL_LABEL[level] || "额度充足" : LABEL[v.action] || "未知";
    $("verdict").dataset.tone = tone;
    $("verdict-badge").textContent = label2;
    $("verdict-title").textContent = v.reason || "暂无结论";
    $("verdict-reason").textContent = v.action === "use-card" && v.target ? `目标卡 ${v.target.cardId}，到期 ${fmtDay(v.target.expireTimeMs)}` : "";
  }
  function renderCredits(d) {
    const c = d.codeCredits;
    if (c.usedUp) cachedCredits.usedUp = c.usedUp;
    if (c.lost) cachedCredits.lost = c.lost;
    if (c.active) cachedCredits.active = c.active;
    const active = [...cachedCredits.active ?? []].sort((a, b) => (a.expireTimeMs ?? 0) - (b.expireTimeMs ?? 0));
    const lost = [...cachedCredits.lost ?? []].sort((a, b) => (a.expireTimeMs ?? 0) - (b.expireTimeMs ?? 0));
    $("credit-caption").textContent = c.available ? `${active.length} 笔仍有余额待使用，另有 ${lost.length} 笔已过期未用完（见下方）` : "未能读取积分明细";
    const usedUp = cachedCredits.usedUp;
    if (usedUp && usedUp.consumed > 0) {
      $("usedup-note").innerHTML = `你已经蹬掉了 <strong class="mono">${num(Math.round(usedUp.consumed))}</strong> 积分！享受 继续保持吧！<span class="sub">（${usedUp.count} 笔已用尽，其中 ${usedUp.expiredCount} 笔已到期）</span>`;
      $("usedup-note").hidden = false;
    } else {
      $("usedup-note").hidden = true;
    }
    const host = $("credit-table");
    if (!c.available || active.length === 0) {
      host.innerHTML = c.available ? '<div class="empty">暂无有余额的积分</div>' : '<div class="empty">积分数据不完整</div>';
    } else {
      const rows = active.map((i) => {
        const n = daysLeft(i.expireTimeMs);
        const tone = n <= 7 ? "urgent" : n <= 14 ? "soon" : "ok";
        return `<tr>
                <td class="mono">${fmtDay(i.grantedAtMs)}</td>
                <td>${escape(i.label)}</td>
                <td class="mono">${num(i.granted)}</td>
                <td class="mono">${num(i.consumed)}</td>
                <td class="mono">${num(i.balance)}</td>
                <td class="mono">${fmtDay(i.expireTimeMs)}</td>
                <td><span class="pill" data-tone="${tone}">${dayText(i.expireTimeMs)}</span></td>
              </tr>`;
      }).join("");
      host.innerHTML = `<table>
            <thead><tr><th>到账日</th><th>类型</th><th>授予</th><th>已用</th><th>剩余</th><th>到期日</th><th>状态</th></tr></thead>
            <tbody>${rows}</tbody></table>`;
    }
    renderLost(lost, c);
  }
  function renderLost(lost, c) {
    const host = $("lost-table");
    $("lost-caption").textContent = lost.length ? `${lost.length} 笔已过期，合计 ${num(Math.round(c.lostBalance ?? 0))} 积分作废` : "";
    const total = Math.round(c.lostBalance ?? 0);
    if (lost.length === 0) {
      $("lostup-note").hidden = true;
      host.innerHTML = '<div class="empty">太好了，没有过期未用完的积分</div>';
      return;
    }
    $("lostup-note").innerHTML = `你未能蹬完 <strong class="mono">${num(total)}</strong> 积分！你的工作量不饱和！你辜负了小大老师的信任！老师对你很失望！😠`;
    $("lostup-note").hidden = false;
    const rows = lost.map(
      (i) => `<tr data-expired="1">
              <td class="mono">${fmtDay(i.grantedAtMs)}</td>
              <td>${escape(i.label)}</td>
              <td class="mono">${num(i.granted)}</td>
              <td class="mono">${num(i.consumed)}</td>
              <td class="mono">${num(i.balance)}</td>
              <td class="mono">${fmtDay(i.expireTimeMs)}</td>
              <td><span class="pill" data-tone="urgent">${dayText(i.expireTimeMs)}</span></td>
            </tr>`
    ).join("");
    host.innerHTML = `<table>
          <thead><tr><th>到账日</th><th>类型</th><th>授予</th><th>已用</th><th>作废</th><th>到期日</th><th>状态</th></tr></thead>
          <tbody>${rows}</tbody></table>`;
  }
  function renderCards(d) {
    const host = $("cards");
    const items = (d.cards.items || []).slice(0, 12);
    const u = d.cardUsage || {};
    const note = $("cardup-note");
    if (u.available && typeof u.usedCount === "number") {
      note.innerHTML = `你已经蹬掉了 <strong class="mono">${num(u.usedCount)}</strong> 张重置卡！继续保持！` + (u.lastUsedAtMs ? `<span class="sub">（最近一次 ${new Date(u.lastUsedAtMs).toLocaleString("zh-CN", { hour12: false })}）</span>` : "");
      note.hidden = false;
    } else {
      note.hidden = true;
    }
    if (items.length === 0) {
      host.innerHTML = '<div class="empty">没有可用的重置卡</div>';
      return;
    }
    host.innerHTML = `<table><thead><tr><th>序号</th><th>到期日</th><th>状态</th></tr></thead><tbody>${items.map((c) => {
      const n = daysLeft(c.expireTimeMs);
      return `<tr><td class="mono">${c.index}</td><td class="mono">${fmtDay(c.expireTimeMs)}</td>
              <td><span class="pill" data-tone="${n <= 7 ? "soon" : "ok"}">${dayText(c.expireTimeMs)}</span></td></tr>`;
    }).join("")}</tbody></table>`;
  }
  function renderPools(d) {
    const host = $("platform-pools");
    const pools = d.platformCredits?.pools || [];
    if (pools.length === 0) {
      host.innerHTML = '<div class="empty">暂无平台积分池</div>';
      return;
    }
    host.innerHTML = `<table><thead><tr><th>池</th><th>余额</th><th>到期日</th></tr></thead><tbody>${pools.map((p) => `<tr><td>${escape(p.label)}</td><td class="mono">${num(p.balance)}</td>
            <td class="mono">${fmtDay(p.expireTimeMs)} <span class="pill" data-tone="${daysLeft(p.expireTimeMs) <= 14 ? "soon" : "ok"}">${dayText(p.expireTimeMs)}</span></td></tr>`).join("")}</tbody></table>`;
  }
  function renderAutoLog(runs) {
    const host = $("auto-log");
    if (!runs || runs.length === 0) {
      host.innerHTML = "";
      return;
    }
    host.innerHTML = runs.map((r) => `<div class="log-row">
            <span class="log-time mono">${new Date(r.atMs).toLocaleString("zh-CN", { hour12: false })}</span>
            <span>${label(r)}</span>
            <span class="sub" style="flex:1">${r.message || r.reason || ""}</span>
          </div>`).join("");
  }
  function render(d) {
    if (d.staleError) {
      $("alert").dataset.tone = "warning";
      $("alert-figure").textContent = "数据暂时未更新";
      $("alert-sub").textContent = `${d.staleError}（下方是上一次读到的数据，正在自动重试）`;
    }
    if (d.error) {
      $("alert").dataset.tone = "danger";
      $("alert-figure").textContent = "读取失败";
      $("alert-sub").textContent = d.error;
      $("verdict-badge").textContent = "读取失败";
      $("verdict-title").textContent = d.error;
      return;
    }
    snapshot = d;
    renderAlert(d);
    renderKpis(d);
    renderVerdict(d);
    renderCredits(d);
    renderCards(d);
    renderPools(d);
    renderAutoLog(d.autoRuns);
    if (!d.codeCredits.available) {
      $("alert").dataset.tone = "warning";
      $("alert-figure").textContent = "数据不完整";
      $("alert-sub").textContent = "未提供积分数据，无法统计到期或损失";
      $("soon30").textContent = "—";
      $("lost-balance").textContent = "—";
      $("live-balance").textContent = "—";
      $("kpi-total").textContent = "—";
      $("kpi-total-foot").textContent = "积分数据不完整";
      $("lost-table").textContent = "积分数据不完整";
    }
    $("auto-toggle").checked = Boolean(d.autoEnabled);
    $("auto-hint").textContent = d.autoEnabled ? `已开启：每 ${fmtInterval(d.autoIntervalMs)}自动判定一次，结论为用卡时也只给建议，不会真的扣卡（本应用只给建议）` : "关闭时只在页面给出建议，不会扣卡（本应用只给建议）";
    if (document.activeElement !== $("interval-value")) {
      const ms = d.autoIntervalMs ?? 15e3;
      if (ms % 6e4 === 0 && ms / 6e4 >= 1) {
        $("interval-unit").value = "60000";
        $("interval-value").value = String(ms / 6e4);
      } else {
        $("interval-unit").value = "1000";
        $("interval-value").value = String(Math.round(ms / 1e3));
      }
    }
    $("auto-note").textContent = d.autoEnabled ? `当前每 ${fmtInterval(d.autoIntervalMs)}自动判定一次，可在左侧随时调整。「立即判定一次」无节流，随时可点。判定为「保留积分」时不执行任何写操作。` : "自动刷新已关闭，页面只给出建议。开启后按设定间隔重算一次结论；「立即判定一次」无节流，随时可点。本应用只给建议，不做任何写操作。";
    renderSettings(d.config, d.configIssues);
  }
  function renderSettings(cfg, issues) {
    if (!cfg) return;
    const F = [
      ["cfg-card-trigger", cfg.cardTriggerPercent, 1, 100],
      ["cfg-tight", cfg.quotaLevels?.tight, 1, 100],
      ["cfg-low", cfg.quotaLevels?.low, 1, 100],
      ["cfg-skip", cfg.cardSkipBeforeResetMinutes, 0, 1440]
    ];
    for (const [id, val, lo, hi] of F) {
      const el = $(id);
      if (document.activeElement !== el) el.value = String(val ?? lo);
      el.min = String(lo);
      el.max = String(hi);
    }
    const tight = Number(cfg.quotaLevels?.tight ?? 80);
    const low = Number(cfg.quotaLevels?.low ?? 95);
    const cardT = Number(cfg.cardTriggerPercent ?? 99);
    const BREAK = 16;
    const posOf = (p) => p <= tight ? BREAK * p / Math.max(1, tight) : BREAK + (100 - BREAK) * (p - tight) / Math.max(1, 100 - tight);
    const xLow = posOf(low);
    const xBreak = BREAK;
    const wave = (x0, x1, yTop, yBot, amp, cycles) => {
      const steps = 60;
      const mid = (yTop + yBot) / 2;
      const span = (x1 - x0) / 1e3;
      let d = `M${x0},${mid}`;
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        d += ` L${x0 + (x1 - x0) * t},${mid + Math.sin(t * Math.PI * 2 * cycles) * amp}`;
      }
      for (let i = steps; i >= 0; i -= 1) {
        const t = i / steps;
        d += ` L${x0 + (x1 - x0) * t},${mid - Math.sin(t * Math.PI * 2 * cycles) * amp}`;
      }
      void span;
      return `${d} Z`;
    };
    const W = 1e3;
    const toPx = (pct) => pct / 100 * W;
    $("cfg-scale-bar").innerHTML = `
          <svg viewBox="0 0 ${W} 26" preserveAspectRatio="none" aria-hidden="true">
            <path d="${wave(toPx(0), toPx(xBreak), 4, 22, 7, 3)}" fill="var(--mcode-success)" opacity=".28"></path>
            <rect x="${toPx(xBreak)}" y="4" width="${toPx(xLow) - toPx(xBreak)}" height="18" fill="var(--mcode-warning)" opacity=".75"></rect>
            <rect x="${toPx(xLow)}" y="4" width="${toPx(100) - toPx(xLow)}" height="18" fill="var(--mcode-danger)" opacity=".75"></rect>
            <g stroke="var(--mcode-border)" stroke-width="2">
              <line x1="${toPx(xBreak)}" y1="2" x2="${toPx(xBreak)}" y2="24"></line>
            </g>
          </svg>`;
    const MERGE = 2;
    const groups = [];
    for (const [p, name, color] of [
      [tight, "黄", "var(--mcode-warning)"],
      [low, "红", "var(--mcode-danger)"],
      [cardT, "用卡", "var(--mcode-text-muted)"]
    ].sort((a, b) => a[0] - b[0])) {
      const g = groups[groups.length - 1];
      if (g && p - g.p < MERGE) g.names.push(name);
      else groups.push({ p, names: [name], color });
    }
    const charW = (s) => [...s].reduce((w, ch) => w + (/[⺀-鿿·%]/.test(ch) ? 11 : 6.5), 0);
    const PAD = 6;
    const rows = [];
    let maxRow = 0;
    $("cfg-scale-marks").innerHTML = groups.map((g) => {
      const x = posOf(g.p);
      const label2 = `${g.names.join("·")} ${g.p}%`;
      const w = charW(label2) + PAD;
      const left = x > 92 ? x - w : x < 5 ? x : x - w / 2;
      const right = left + w;
      let r = 0;
      while ((rows[r] ?? []).some(([l, rr]) => left < rr + 4 && right > l - 4)) r += 1;
      rows[r] = [...rows[r] ?? [], [left, right]];
      maxRow = Math.max(maxRow, r);
      const shift = x > 92 ? "translateX(-100%)" : x < 5 ? "translateX(0)" : "translateX(-50%)";
      return `<b style="left:${x}%;top:${r * 14}px;transform:${shift};color:${g.color}">${label2}</b>`;
    }).join("");
    $("cfg-scale-marks").style.height = `${14 * (maxRow + 2)}px`;
    $("cfg-scale-legend").innerHTML = `
          <span><i style="background:var(--mcode-success)"></i>额度充足</span>
          <span><i style="background:var(--mcode-warning)"></i>额度紧张</span>
          <span><i style="background:var(--mcode-danger)"></i>额度不足 / 燃尽</span>`;
    const warns = [];
    if (!(tight < low)) warns.push("「额度紧张」必须小于「额度不足」，否则整个红/黄分档失效");
    if (cardT <= low) warns.push(`用卡线 ${cardT}% 不高于红色档 ${low}%，红灯将永远不会亮`);
    if (Number(cfg.cardSkipBeforeResetMinutes) > 0 && Number(cfg.cardSkipBeforeResetMinutes) >= 300) {
      warns.push(`刷新前不用卡窗口 ${cfg.cardSkipBeforeResetMinutes} 分钟超过一个 5 小时周期的 1/2，可能长期不建议用卡`);
    }
    const all = [...Array.isArray(issues) ? issues : [], ...warns];
    if (all.length > 0) {
      $("cfg-status").textContent = `⚠️ ${all.join("；")}`;
      $("cfg-status").className = "status err";
      $("cfg-low").classList.toggle("bad", !(tight < low));
    } else {
      $("cfg-status").textContent = "";
      $("cfg-status").className = "status";
      $("cfg-low").classList.remove("bad");
    }
    $("cfg-note").textContent = `当前生效：额度 ≥ ${cardT}% 时**建议**动用一张重置卡（只给建议，本应用不会真的扣卡）。`;
  }
  async function saveSetting(field, rawValue, inputEl) {
    const value = Number(rawValue);
    try {
      const r = await (await fetch(`/api/config?${field}=${encodeURIComponent(value)}`, { method: "POST" })).json();
      if (r.error) {
        setStatus($("cfg-status"), r.error, "err");
        if (inputEl && snapshot?.config) {
          const c = snapshot.config;
          inputEl.value = String(field === "tight" || field === "low" ? c.quotaLevels[field] : c[field]);
        }
        return;
      }
      renderSettings(r.config, r.issues);
      setStatus(
        $("cfg-status"),
        `已保存，立即生效：${r.issues?.length ? "⚠️ " + r.issues.join("；") : "无误报"}`,
        r.issues?.length ? "err" : "ok"
      );
    } catch {
      setStatus($("cfg-status"), "保存失败，请重试", "err");
      if (inputEl && snapshot?.config) {
        const c = snapshot.config;
        inputEl.value = String(field === "tight" || field === "low" ? c.quotaLevels[field] : c[field]);
      }
    }
  }
  function setLive(state, text) {
    $("live-dot").dataset.state = state;
    $("live-status").textContent = text;
  }
  async function load() {
    if (busy) return;
    busy = true;
    $("refresh").disabled = true;
    try {
      render(await (await fetch("/api/state")).json());
    } catch (e) {
      render({ error: `读取失败：${e.message}` });
    } finally {
      busy = false;
      $("refresh").disabled = false;
    }
  }
  const setLedgerStatus = (text, cls) => {
    const el = $("ledger-status");
    if (!el) return;
    el.textContent = text;
    el.className = `sub${cls ? " " + cls : ""}`;
  };
  async function loadLedger() {
    try {
      const r = await (await fetch("/api/ledger")).json();
      const pathEl = $("ledger-path");
      if (pathEl && r.path) pathEl.textContent = r.path;
      const meta = $("ledger-meta");
      const ta = $("ledger-json");
      if (!r.ok) {
        if (meta) meta.textContent = "读取失败";
        if (ta && !ta.value) ta.value = JSON.stringify({ schemaVersion: 1, quota: {}, cards: [], credits: [] }, null, 2);
        setLedgerStatus(r.error ?? "读取失败", "err");
        return;
      }
      if (meta) {
        const at = Number(r.ledger?.updatedAtMs ?? 0);
        meta.textContent = at ? `最后更新 ${new Date(at).toLocaleString()}` : "未记录更新时间";
      }
      if (ta) ta.value = JSON.stringify(r.ledger ?? {}, null, 2);
      setLedgerStatus("");
    } catch (e) {
      setLedgerStatus(String(e?.message ?? e), "err");
    }
  }
  $("ledger-save")?.addEventListener("click", async () => {
    const ta = $("ledger-json");
    if (!ta) return;
    let parsed;
    try {
      parsed = JSON.parse(ta.value);
    } catch (e) {
      setLedgerStatus(`JSON 解析失败：${e.message}`, "err");
      return;
    }
    try {
      const r = await (await fetch("/api/ledger", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ledger: parsed })
      })).json();
      if (!r.ok) {
        setLedgerStatus(r.error ?? "保存失败", "err");
        return;
      }
      setLedgerStatus("已保存 ✓");
      await loadLedger();
      setLedgerStatus("已保存 ✓");
      await load();
    } catch (e) {
      setLedgerStatus(String(e?.message ?? e), "err");
    }
  });
  $("ledger-reload")?.addEventListener("click", loadLedger);
  void loadLedger();
  $("refresh").addEventListener("click", load);
  $("auto-toggle").addEventListener("change", async (e) => {
    const enabled = e.target.checked;
    try {
      const r = await (await fetch(`/api/auto?enabled=${enabled ? 1 : 0}`, { method: "POST" })).json();
      $("auto-toggle").checked = r.autoEnabled;
      $("auto-hint").textContent = r.autoEnabled ? `已开启：每 ${fmtInterval(r.autoIntervalMs)}自动判定一次，结论为用卡时也只给建议，不会真的扣卡（本应用只给建议）` : "关闭时只在页面给出建议，不会扣卡（本应用只给建议）";
      $("auto-note").textContent = r.autoEnabled ? `当前每 ${fmtInterval(r.autoIntervalMs)}自动判定一次，可在左侧随时调整。「立即判定一次」无节流，随时可点。判定为「保留积分」时不执行任何写操作。` : "自动刷新已关闭，页面只给出建议。开启后按设定间隔重算一次结论；「立即判定一次」无节流，随时可点。本应用只给建议，不做任何写操作。";
      if (enabled) {
        const f = r.firstRun;
        const txt = f?.message ? `${label(f)} · ${f.message}` : f?.reason || "";
        setStatus($("auto-status"), txt ? `首次判定：${txt}` : "已开启自动刷新", f?.outcome === "ERROR" ? "err" : "ok");
      } else {
        setStatus($("auto-status"), "已关闭自动刷新", "ok");
      }
      await load();
    } catch {
      setStatus($("auto-status"), "开关设置失败", "err");
    }
  });
  const SETTING_FIELDS = [
    ["cfg-card-trigger", "cardTriggerPercent"],
    ["cfg-tight", "tight"],
    ["cfg-low", "low"],
    ["cfg-skip", "cardSkipBeforeResetMinutes"]
  ];
  for (const [id, field] of SETTING_FIELDS) {
    const el = $(id);
    if (!el) continue;
    el.addEventListener("change", (e) => saveSetting(field, e.target.value, e.target));
  }
  $("auto-run").addEventListener("click", async () => {
    $("auto-run").disabled = true;
    setStatus($("auto-status"), "正在判定…", "info");
    try {
      const r = await (await fetch("/api/auto-run", { method: "POST" })).json();
      const txt = r.message || r.reason || "";
      const failed = r?.outcome === "ERROR";
      setStatus($("auto-status"), `${label(r)}${txt ? " · " + txt : ""}`, failed ? "err" : "ok");
      await load();
    } catch {
      setStatus($("auto-status"), "判定失败", "err");
    } finally {
      $("auto-run").disabled = false;
    }
  });
  async function saveInterval() {
    const unit = Number($("interval-unit").value);
    const raw = Number($("interval-value").value);
    if (!Number.isFinite(raw) || raw <= 0) return;
    try {
      const r = await (await fetch(`/api/auto-interval?ms=${Math.round(raw * unit)}`, { method: "POST" })).json();
      const clamped = r.autoIntervalMs;
      $("auto-hint").textContent = snapshot?.autoEnabled ? `已开启：每 ${fmtInterval(clamped)}自动判定一次，结论为用卡时也只给建议，不会真的扣卡（本应用只给建议）` : "关闭时只在页面给出建议，不会扣卡（本应用只给建议）";
      $("auto-note").textContent = snapshot?.autoEnabled ? `当前每 ${fmtInterval(clamped)}自动判定一次，可在左侧随时调整。「立即判定一次」无节流，随时可点。判定为「保留积分」时不执行任何写操作。` : "自动刷新已关闭，页面只给出建议。开启后按设定间隔重算一次结论；「立即判定一次」无节流，随时可点。本应用只给建议，不做任何写操作。";
      const wasClamped = Math.abs(clamped - raw * unit) > 1;
      setStatus(
        $("auto-status"),
        `检测间隔已设为 ${fmtInterval(clamped)}${wasClamped ? "（超出范围，已调整到最近可用值）" : ""}`,
        "ok"
      );
    } catch {
      setStatus($("auto-status"), "间隔设置失败", "err");
    }
  }
  $("interval-value").addEventListener("change", saveInterval);
  $("interval-unit").addEventListener("change", saveInterval);
  $("auto-toggle").checked = true;
  setLive("live", "页面打开时自动更新");
  void load();
  let nextTick = Date.now() + interval();
  setInterval(() => {
    if (Date.now() >= nextTick) {
      nextTick = Date.now() + interval();
      if ($("auto-toggle").checked) void load();
    }
  }, 1e3);
}
