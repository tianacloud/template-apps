// Small, page-local interactions for the selected production UI screens.
let screen = "home",
  saved = {},
  records = [],
  note = { title: "周末的小计划", body: "去逛一家书店，再找个地方喝杯咖啡。" },
  editing = false,
  timer = null,
  seconds = 1500;
const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function initialNotes() {
  return [
    {
      id: "weekend",
      title: "周末的小计划",
      body: "去逛一家书店，再找个地方喝杯咖啡。",
      folder: "生活",
      pinned: true,
    },
    {
      id: "ideas",
      title: "想做的小工具",
      body: "记下灵光一闪的想法。试着编辑这篇笔记，或者新建一篇。",
      folder: "工作",
      pinned: false,
    },
  ];
}
let notes = initialNotes();
note = notes[0];
function updateNotes() {
  const host = $("#note-cards");
  if (!host) return;
  const q = $("#note-search")?.value.toLowerCase() || "";
  const rows = notes
    .filter(
      (n) =>
        (screen === "置顶笔记"
          ? n.pinned
          : ["生活", "工作", "灵感"].includes(screen)
            ? n.folder === screen
            : true) && (n.title + n.body).toLowerCase().includes(q),
    )
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  host.innerHTML = rows
    .map(
      (n) =>
        `<button class="note-card" data-note="${esc(n.id)}"><strong>${n.pinned ? "⌑ " : ""}${esc(n.title)}</strong><p>${esc(n.body)}</p><small>${esc(n.folder)} · 本页示例</small></button>`,
    )
    .join("");
  if ($("#note-count")) $("#note-count").textContent = rows.length + " 篇笔记";
}
function imageSources() {
  document
    .querySelectorAll("[data-preview-image]")
    .forEach((e) => (e.src = preview.images[e.dataset.previewImage]));
}
function draw(next = "home") {
  screen = next;
  const state = preview.states[next] || preview.states.home;
  document.body.className = state.bodyClass;
  document.body.innerHTML = saved[next] || state.html;
  imageSources();
  for (const c of document.querySelectorAll("canvas"))
    if (preview.images.scene) {
      if (preview.name === "neon-coast") {
        c.style.width = "100%";
        c.style.height = "100%";
      }
      const img = new Image();
      img.onload = () => {
        c.width = img.width;
        c.height = img.height;
        c.getContext("2d")?.drawImage(img, 0, 0);
      };
      img.src = preview.images.scene;
    }
  if (preview.name === "neon-coast") {
    const start = $("#start");
    if (start) {
      start.disabled = false;
      start.textContent = "查看驾驶指南 ↗";
    }
    const status = $("#save-status");
    if (status) status.textContent = "轻量界面预览";
  }
  if (preview.name === "notes" && $("#note-title")) {
    $("#note-title").value = note.title;
    $("#note-body").value = note.body;
  }
  if (preview.name === "notes") updateNotes();
  if (records.length && screen !== "new") renderRecords();
  document.querySelectorAll("dialog[open]").forEach((d) => {
    d.removeAttribute("open");
    d.showModal();
  });
  const badge = document.createElement("div");
  badge.id = "preview-tools";
  badge.style.cssText =
    "position:fixed;z-index:2147483647;bottom:8px;right:8px;padding:7px 10px;border-radius:9px;background:#fffef8f5;color:#70736b;font:11px/1.4 system-ui;box-shadow:0 1px 6px #0001";
  const game = ["neon-coast", "downtown-beatdown", "nes-loader"].includes(
    preview.name,
  );
  badge.innerHTML = `${game ? "轻量界面预览 · 完整游戏请安装" : "示例体验 · 数据仅保留在本页"} <button id="preview-home" type="button">首页</button> <button id="preview-reset" type="button">恢复示例</button>`;
  badge
    .querySelectorAll("button")
    .forEach(
      (b) =>
        (b.style.cssText =
          "border:0;background:transparent;color:inherit;text-decoration:underline;cursor:pointer;font:inherit;padding:2px 4px"),
    );
  document.body.append(badge);
  document.querySelectorAll("button").forEach((b) => {
    const supported =
      b.id.startsWith("preview-") ||
      b.hasAttribute("data-preview-remove") ||
      (b.form && b.type === "submit") ||
      b.matches(
        "[data-close],.close,.close-button,[aria-label^=关闭],.tick,.check,.favorite-button,[data-date],[data-template],[data-note],[data-view=all],[data-nav=today],[data-nav=journey],[data-tab=matrix],[data-quick-ledger],[data-event-template],[data-starter-title]",
      ) ||
      [
        "pin-note",
        "delete-note",
        "notes-back",
        "timer-reset",
        "timer-toggle",
        "start-focus",
        "save-task",
      ].includes(b.id) ||
      [
        "取消",
        "关闭",
        "返回",
        "添加到今天",
        "保存记录",
        "创建活动",
        "保存这句话",
      ].includes(b.textContent.trim()) ||
      (preview.name === "neon-coast" && b.id === "start") ||
      Object.keys(preview.actions).some((s) =>
        s.startsWith("text:")
          ? b.textContent.trim() === s.slice(5)
          : b.matches(s),
      );
    if (!supported) {
      b.disabled = true;
      b.title = "完整功能请安装后体验";
    }
  });
  if (preview.name === "nes-loader")
    document.querySelectorAll("input[type=file]").forEach((e) => {
      e.disabled = true;
      e.title = "上传卡带请安装后体验";
    });
}
function renderRecords() {
  if ($("#preview-records")) return;
  const area = document.createElement("section");
  area.id = "preview-records";
  area.className = "panel";
  area.style.cssText =
    "margin:16px 0;padding:16px;border:1px solid #deded8;border-radius:12px;background:#fff";
  area.innerHTML =
    '<h3 style="margin:0 0 12px">刚刚添加</h3>' +
    records
      .map(
        (r, i) =>
          `<div style="padding:10px 0;border-top:1px solid #eee"><strong>${esc(r.title)}</strong><p>${esc(r.detail)}</p><button type="button" data-preview-remove="${i}">删除</button></div>`,
      )
      .join("");
  const host =
    $("#task-list") ||
    $(".quadrant-content") ||
    $("main .content") ||
    $("main") ||
    $("#app");
  host?.prepend(area);
}
function remember() {
  document.querySelector("#preview-tools")?.remove();
  saved[screen] = document.body.innerHTML;
}
function reset() {
  notes = initialNotes();
  clearInterval(timer);
  timer = null;
  seconds = 1500;
  saved = {};
  records = [];
  editing = false;
  note = notes[0];
  draw();
}
function submit(form) {
  if (form.reportValidity && !form.reportValidity()) return;
  const fields = [
    ...form.querySelectorAll(
      "input:not([type=hidden]):not([type=radio]):not([type=checkbox]),textarea,select",
    ),
  ];
  const title =
    fields.find(
      (e) => e.name === "title" || e.name === "name" || e.id.includes("title"),
    )?.value ||
    fields.find((e) => e.value.trim())?.value ||
    "新的记录";
  const detail = fields
    .filter((e) => e.value && e.value !== title)
    .map((e) => e.value)
    .join(" · ");
  records.push({ title, detail });
  draw("home");
}
function toggleTask(button) {
  const active = button.textContent !== "✓";
  button.textContent = active ? "✓" : "";
  button.setAttribute("aria-pressed", String(active));
  button
    .closest(".task,.task-row,.task-card,article")
    ?.classList.toggle("done", active);
  const count = $("#count");
  if (count)
    count.textContent = String(
      document.querySelectorAll(".tick[aria-pressed=true]").length,
    );
}
function startTimer() {
  clearInterval(timer);
  if ($("#timer-toggle")?.textContent === "暂停专注") {
    $("#timer-toggle").textContent = "继续专注";
    timer = null;
    return;
  }
  if ($("#timer-toggle")) $("#timer-toggle").textContent = "暂停专注";
  timer = setInterval(() => {
    seconds = Math.max(0, seconds - 1);
    if ($("#timer-display"))
      $("#timer-display").textContent =
        String(Math.floor(seconds / 60)).padStart(2, "0") +
        ":" +
        String(seconds % 60).padStart(2, "0");
    if (!seconds) clearInterval(timer);
  }, 1000);
}
document.addEventListener("submit", (e) => {
  e.preventDefault();
  submit(e.target);
});
document.addEventListener("input", (e) => {
  if (e.target.matches("#note-title,#note-body")) {
    note.title = $("#note-title").value;
    note.body = $("#note-body").value;
    editing = true;
    updateNotes();
    if ($("#save-state")) $("#save-state").textContent = "已保存";
  }
  if (e.target.matches("#note-search")) {
    updateNotes();
    return;
  }
  if (e.target.matches("input[type=search]")) {
    const q = e.target.value.toLowerCase();
    document
      .querySelectorAll(".note-card,.photo-card")
      .forEach((c) => (c.hidden = !c.textContent.toLowerCase().includes(q)));
  }
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("button,a,[data-note],[data-date]");
  if (!b) return;
  if (b.id === "preview-reset") {
    reset();
    return;
  }
  if (b.id === "preview-home") {
    remember();
    draw();
    return;
  }
  if (b.tagName === "A") e.preventDefault();
  if (b.dataset.previewRemove !== undefined) {
    records.splice(Number(b.dataset.previewRemove), 1);
    draw(screen);
    return;
  }
  if (
    b.matches("[data-close],.close,.close-button,[aria-label^=关闭]") ||
    ["取消", "关闭", "返回"].includes(b.textContent.trim())
  ) {
    draw("home");
    return;
  }
  if (
    b.id === "save-task" ||
    ["添加到今天", "保存记录", "创建活动", "保存这句话"].includes(
      b.textContent.trim(),
    )
  ) {
    e.preventDefault();
    submit(
      b.closest("form") ||
        b.closest("[role=dialog]") ||
        b.closest(".modal") ||
        document.body,
    );
    return;
  }
  if (b.form && b.type === "submit") {
    e.preventDefault();
    submit(b.form);
    return;
  }
  if (b.matches(".tick,.check")) {
    toggleTask(b);
    return;
  }
  if (preview.name === "sunlit-album" && b.matches(".photo-open")) {
    const image = b.querySelector("img")?.dataset.previewImage;
    const title = b.closest("article")?.querySelector("h3,h2")?.textContent;
    remember();
    draw("photo");
    const large = document.querySelector(
      ".viewer .photo-stage img,.viewer .image-stage img,.viewer-main img",
    );
    if (large && image) large.src = preview.images[image];
    if (title && document.querySelector(".viewer-heading strong"))
      document.querySelector(".viewer-heading strong").textContent = title;
    return;
  }
  if (b.matches(".favorite-button")) {
    b.classList.toggle("active");
    b.setAttribute("aria-pressed", String(b.classList.contains("active")));
    b.style.color = b.classList.contains("active") ? "#bd6555" : "";
    return;
  }
  if (b.id === "pin-note") {
    note.pinned = !note.pinned;
    updateNotes();
    b.textContent = note.pinned ? "取消置顶" : "置顶";
    return;
  }
  if (b.id === "delete-note") {
    notes = notes.filter((n) => n !== note);
    draw();
    return;
  }
  if (b.id === "notes-back") {
    draw();
    return;
  }
  if (b.id === "timer-reset") {
    clearInterval(timer);
    seconds = 1500;
    if ($("#timer-display")) $("#timer-display").textContent = "25:00";
    if ($("#timer-toggle")) $("#timer-toggle").textContent = "开始专注";
    return;
  }
  if (b.id === "timer-toggle" || b.id === "start-focus") {
    startTimer();
    return;
  }
  if (b.dataset.date) {
    document
      .querySelectorAll("[data-date]")
      .forEach((x) => x.classList.toggle("chosen", x === b));
    return;
  }
  if (preview.name === "neon-coast" && b.id === "start") {
    draw("驾驶指南");
    return;
  }
  if (preview.name === "notes" && b.matches("[data-template],[data-note]")) {
    if (b.hasAttribute("data-template")) {
      note = {
        id: String(Date.now()),
        title: "未命名笔记",
        body: "",
        folder: "生活",
        pinned: false,
      };
      notes.unshift(note);
      editing = true;
      draw("new");
    } else {
      note = notes.find((n) => n.id === b.dataset.note) || notes[0];
      draw("note");
    }
    return;
  }
  for (const [selector, target] of Object.entries(preview.actions)) {
    if (
      selector.startsWith("text:")
        ? b.textContent.trim() === selector.slice(5)
        : b.matches(selector)
    ) {
      remember();
      draw(target);
      return;
    }
  }
  if (
    b.matches(
      "[data-view=all],[data-nav=today],[data-nav=journey],[data-tab=matrix],.brand",
    )
  ) {
    remember();
    draw();
    return;
  }
  if (
    b.matches("[data-quick-ledger],[data-event-template],[data-starter-title]")
  ) {
    draw("new");
    return;
  }
  if (b.matches('a[href^="#"]')) {
    draw();
    return;
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") draw();
  if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.form) {
    e.preventDefault();
    submit(e.target.form);
  }
});
draw();
