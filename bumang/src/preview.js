// Showcase entry: the real app with preview-store.js in place of store.js.
import "./main.js";
import "./preview.css";
import { reset } from "./preview-store.js";
import { state, load } from "./app.js";
import { view } from "./matrix.js";
import { today } from "./dates.js";

const bar = document.createElement("div");
bar.className = "preview-bar";
bar.innerHTML =
  '<span>示例体验 · 数据仅保留在本页</span><button type="button" id="preview-home" data-preview="home">首页</button><button type="button" id="preview-reset" data-preview="reset">恢复示例</button>';
document.querySelector(".shell").prepend(bar);

// sandbox="allow-scripts" blocks native form submission, so hand the
// submit event to the app's own handler.
function submit(form) {
  form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
}
document.addEventListener(
  "click",
  (event) => {
    const button = event.target.closest?.("button[type=submit]");
    if (!button?.form) return;
    event.preventDefault();
    submit(button.form);
  },
  true,
);
document.addEventListener(
  "keydown",
  (event) => {
    const field = event.target;
    if (event.key !== "Enter" || event.isComposing || field.tagName !== "INPUT" || !field.form) return;
    event.preventDefault();
    submit(field.form);
  },
  true,
);

function home() {
  document.querySelector("#editor").close();
  history.replaceState(null, "", "#/matrix");
  state.route = "matrix";
  state.day = today();
}
bar.addEventListener("click", (event) => {
  const action = event.target.closest("[data-preview]")?.dataset.preview;
  if (!action) return;
  home();
  if (action === "reset") {
    reset();
    view.showDone = false;
  }
  load();
});
