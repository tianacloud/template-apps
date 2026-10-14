import { $, esc, icon } from "./ui.js";
import { QUADRANTS, quadrantOf } from "./layout.js";
import { clock, parseClock, today, addDays, duration as durationText } from "./dates.js";
import { state, save, remove, toggleDone } from "./app.js";

const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240];

// preset: { task } to edit, or fields such as { important, urgent, day, start } for a new one.
export function openEditor(preset = {}) {
  const dialog = $("#editor");
  const task = preset.task;
  const base = task ?? { title: "", note: "", important: true, urgent: false, day: null, start: null, duration: 60, ...preset };
  const quadrant = quadrantOf(base);
  const durations = [...new Set([...DURATIONS, base.duration])].sort((a, b) => a - b);
  dialog.innerHTML = `<form class="sheet" id="task-form" novalidate>
    <div class="sheet-head"><h2>${task ? "编辑事项" : "新建事项"}</h2><button type="button" class="icon-button" data-close aria-label="关闭">${icon.close}</button></div>
    <input class="title-input" name="title" maxlength="200" placeholder="要做什么？" autocomplete="off" value="${esc(base.title)}" aria-label="事项名称">
    <fieldset class="quad-pick"><legend>重要 / 紧急</legend>${QUADRANTS.map(
      (q) => `<label class="${q.key}"><input type="radio" name="quadrant" value="${q.key}" ${q === quadrant ? "checked" : ""}><span><b>${q.name}</b><small>${q.tags}</small></span></label>`,
    ).join("")}</fieldset>
    <div class="field-row">
      <label class="field">日期<input type="date" name="day" value="${base.day ?? ""}"></label>
      <div class="quick-days" role="group" aria-label="快捷日期">
        <button type="button" data-quick="${today()}">今天</button><button type="button" data-quick="${addDays(today(), 1)}">明天</button><button type="button" data-quick="">不定</button>
      </div>
    </div>
    <div class="field-row two">
      <label class="field">开始时间<input type="time" name="start" value="${base.start === null ? "" : clock(base.start)}"></label>
      <label class="field">时长<select name="duration">${durations.map((d) => `<option value="${d}" ${d === base.duration ? "selected" : ""}>${durationText(d)}</option>`).join("")}</select></label>
    </div>
    <textarea name="note" rows="2" maxlength="2000" placeholder="备注（可选）" aria-label="备注">${esc(base.note)}</textarea>
    <p class="form-message" role="status"></p>
    <div class="sheet-actions">
      ${task ? `<button type="button" class="ghost-button danger" data-delete>删除</button><button type="button" class="ghost-button" data-done>${task.done ? "标为未完成" : "完成"}</button>` : ""}
      <span class="spacer"></span>
      <button type="submit" class="primary">保存</button>
    </div>
  </form>`;
  const form = $("#task-form");
  const dayInput = form.elements.day, startInput = form.elements.start;
  const syncTime = () => {
    startInput.disabled = !dayInput.value;
    if (!dayInput.value) startInput.value = "";
    for (const button of form.querySelectorAll("[data-quick]"))
      button.classList.toggle("on", button.dataset.quick === dayInput.value);
  };
  syncTime();
  dayInput.addEventListener("input", syncTime);
  form.querySelectorAll("[data-quick]").forEach((button) =>
    button.addEventListener("click", () => {
      dayInput.value = button.dataset.quick;
      syncTime();
    }),
  );
  const message = (text) => ($(".form-message", form).textContent = text);
  const busy = async (action) => {
    if (form.dataset.busy) return;
    form.dataset.busy = "1";
    const controls = [...form.elements].filter((control) => !control.disabled);
    controls.forEach((control) => (control.disabled = true));
    message("正在保存…");
    try {
      await action();
      dialog.close();
    } catch (error) {
      message(error.message || "没有保存成功，请稍后再试。");
    } finally {
      delete form.dataset.busy;
      controls.forEach((control) => (control.disabled = false));
    }
  };
  $("[data-close]", form).onclick = () => dialog.close();
  const deleteButton = $("[data-delete]", form);
  if (deleteButton)
    deleteButton.onclick = () => {
      if (!deleteButton.dataset.confirm) {
        deleteButton.dataset.confirm = "1";
        deleteButton.textContent = "确认删除";
        return;
      }
      busy(() => remove(task.id));
    };
  const doneButton = $("[data-done]", form);
  if (doneButton)
    doneButton.onclick = () => {
      toggleDone(task.id);
      dialog.close();
    };
  form.onsubmit = (event) => {
    event.preventDefault();
    const title = form.elements.title.value.trim();
    if (!title) {
      message("写下要做的事。");
      form.elements.title.focus();
      return;
    }
    const q = QUADRANTS.find((item) => item.key === form.elements.quadrant.value);
    const day = dayInput.value || null;
    let start = day ? parseClock(startInput.value) : null;
    let length = Number(form.elements.duration.value);
    if (start !== null) {
      start = Math.min(start, 1425);
      length = Math.max(15, Math.min(length, 1440 - start));
    }
    busy(() =>
      save(task?.id, { title, note: form.elements.note.value.trim(), important: q.important, urgent: q.urgent, day, start, duration: length }),
    );
  };
  dialog.showModal();
  if (!task && matchMedia("(hover: hover)").matches) form.elements.title.focus();
}
export const editTask = (id) => {
  const task = state.tasks.get(id);
  if (task) openEditor({ task });
};
