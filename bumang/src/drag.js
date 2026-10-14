// Pointer drag. Touch needs a long press first so lists and the timeline still scroll.
const HOLD_MS = 260;
const TOUCH_SLOP = 8;
const MOUSE_SLOP = 4;

export function enableDrag(root, start) {
  let press = null;

  root.addEventListener("pointerdown", (event) => {
    if (press || (event.pointerType === "mouse" && event.button !== 0)) return;
    const el = event.target.closest("[data-drag]");
    if (!el || event.target.closest(".check, input, select, textarea")) return;
    press = {
      el,
      kind: el.dataset.drag,
      id: el.dataset.id,
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
      touch: event.pointerType !== "mouse",
      session: null,
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    if (press.kind === "resize") {
      event.preventDefault();
      begin();
    } else if (press.touch) press.timer = setTimeout(begin, HOLD_MS);
  });

  function begin() {
    if (!press) return;
    press.session = start(press);
    if (!press.session) return stop();
    press.el.classList.add("lifting");
    if (press.touch) navigator.vibrate?.(8);
  }
  function move(event) {
    if (event.pointerId !== press?.pointerId) return;
    if (!press.session) {
      const distance = Math.hypot(event.clientX - press.x, event.clientY - press.y);
      if (press.touch) {
        if (distance > TOUCH_SLOP) stop();
      } else if (distance > MOUSE_SLOP) begin();
      return;
    }
    event.preventDefault();
    press.session.move(event.clientX, event.clientY);
  }
  function up(event) {
    if (event.pointerId !== press?.pointerId) return;
    if (press.session) {
      const { session } = press;
      stop();
      suppressClick();
      session.drop(event.clientX, event.clientY);
    } else stop();
  }
  function cancel(event) {
    if (event.pointerId !== press?.pointerId) return;
    const session = press.session;
    stop();
    session?.cancel();
  }
  function stop() {
    clearTimeout(press?.timer);
    press?.el.classList.remove("lifting");
    press = null;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", cancel);
  }
  // Once a drag is live, the finger moves the item instead of scrolling the page.
  document.addEventListener(
    "touchmove",
    (event) => {
      if (press?.session) event.preventDefault();
    },
    { passive: false },
  );
  root.addEventListener("contextmenu", (event) => {
    if (event.target.closest("[data-drag]")) event.preventDefault();
  });
}

// The click that follows a drop must not also open or pick the item.
function suppressClick() {
  const block = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };
  window.addEventListener("click", block, { capture: true, once: true });
  setTimeout(() => window.removeEventListener("click", block, { capture: true }), 80);
}
