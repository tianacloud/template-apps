import { Controller } from "jsnes";

const sectors = [
  ["RIGHT"],
  ["DOWN", "RIGHT"],
  ["DOWN"],
  ["DOWN", "LEFT"],
  ["LEFT"],
  ["UP", "LEFT"],
  ["UP"],
  ["UP", "RIGHT"],
];

export function directionsAt(x, y, radius, previous = []) {
  if (Math.hypot(x, y) < radius * (previous.length ? 0.06 : 0.1)) return [];
  const angle = Math.atan2(y, x);
  const previousSector = sectors.findIndex(
    (names) =>
      names.length === previous.length &&
      names.every((name) => previous.includes(name)),
  );
  if (previousSector !== -1) {
    const difference = Math.atan2(
      Math.sin(angle - (previousSector * Math.PI) / 4),
      Math.cos(angle - (previousSector * Math.PI) / 4),
    );
    if (Math.abs(difference) <= Math.PI / 6) return sectors[previousSector];
  }
  return sectors[(Math.round(angle / (Math.PI / 4)) + 8) % 8];
}

export function createTouchControls(root, controls, enabled) {
  const surface = root.querySelector(".direction-surface");
  const thumb = root.querySelector(".stick-thumb");
  const actions = new Map();
  let pointer = null;
  let geometry;
  let directions = [];

  function setDirections(next) {
    if (
      next.length === directions.length &&
      next.every((name) => directions.includes(name))
    )
      return;
    for (const name of directions) {
      if (!next.includes(name)) controls.release(`direction-${name}`);
    }
    for (const name of next) {
      if (!directions.includes(name))
        controls.press(`direction-${name}`, Controller[`BUTTON_${name}`]);
    }
    directions = next;
    for (const button of surface.querySelectorAll("[data-direction]")) {
      const names = button.dataset.direction.split(" ");
      button.classList.toggle(
        "pressed",
        names.length === next.length &&
          names.every((name) => next.includes(name)),
      );
    }
    surface.classList.toggle("engaged", next.length > 0);
  }

  function releaseDirection() {
    const previous = pointer;
    pointer = null;
    setDirections([]);
    thumb.style.transform = "translate(0px, 0px)";
    if (previous !== null && surface.hasPointerCapture(previous))
      surface.releasePointerCapture(previous);
  }

  function move(event) {
    if (pointer !== event.pointerId) return;
    if (!enabled()) return releaseDirection();
    const { rect, rotated, radius, travel } = geometry;
    const dx = event.clientX - rect.left - rect.width / 2;
    const dy = event.clientY - rect.top - rect.height / 2;
    const x = rotated ? dy : dx;
    const y = rotated ? -dx : dy;
    setDirections(
      directionsAt(
        x,
        y,
        radius,
        surface.dataset.mode === "stick" ? directions : [],
      ),
    );
    const scale = Math.min(1, travel / (Math.hypot(x, y) || 1));
    thumb.style.transform = `translate(${x * scale}px, ${y * scale}px)`;
  }

  surface.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (!enabled() || pointer !== null || event.button !== 0) return;
    const rect = surface.getBoundingClientRect();
    const radius = Math.min(rect.width, rect.height) / 2;
    geometry = {
      rect,
      radius,
      rotated: !!root.closest(".rotated"),
      travel: radius - thumb.offsetWidth / 2 - 6,
    };
    pointer = event.pointerId;
    surface.setPointerCapture(pointer);
    move(event);
  });
  surface.addEventListener("pointermove", move);
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    surface.addEventListener(type, (event) => {
      if (pointer === event.pointerId) releaseDirection();
    });

  function setAction(id, button) {
    const action = actions.get(id);
    if (action.button === button) return;
    const previous = action.button;
    action.button = button;
    if (previous) {
      controls.release(`touch-${id}`);
      previous.classList.toggle(
        "pressed",
        [...actions.values()].some((value) => value.button === previous),
      );
    }
    if (button) {
      controls.press(`touch-${id}`, Controller[`BUTTON_${button.dataset.key}`]);
      button.classList.add("pressed");
    }
  }

  function releaseAction(id) {
    if (!actions.has(id)) return;
    setAction(id, null);
    actions.delete(id);
    if (root.hasPointerCapture(id)) root.releasePointerCapture(id);
  }

  function reset() {
    releaseDirection();
    for (const id of [...actions.keys()]) releaseAction(id);
  }

  for (const button of root.querySelectorAll("[data-key]")) {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (!enabled() || event.button !== 0) return;
      const targets = button.closest(".ab")
        ? [...root.querySelectorAll(".ab [data-key]")]
        : [button];
      actions.set(event.pointerId, {
        button: null,
        targets: targets.map((target) => ({
          button: target,
          rect: target.getBoundingClientRect(),
        })),
      });
      root.setPointerCapture(event.pointerId);
      setAction(event.pointerId, button);
    });
  }
  root.addEventListener("pointermove", (event) => {
    const action = actions.get(event.pointerId);
    if (!action) return;
    if (!enabled()) return releaseAction(event.pointerId);
    const target = action.targets.find(
      ({ rect }) =>
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom,
    );
    setAction(event.pointerId, target?.button ?? null);
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    root.addEventListener(type, (event) => releaseAction(event.pointerId));

  for (const button of root.querySelectorAll(".direction-modes button")) {
    button.addEventListener("click", () => {
      reset();
      const mode = button.dataset.mode;
      surface.dataset.mode = mode;
      surface.setAttribute(
        "aria-label",
        mode === "stick" ? "八方向摇杆" : "八方向方向键",
      );
      root.querySelector(".stick-face").hidden = mode !== "stick";
      root.querySelector(".dpad").hidden = mode !== "pad";
      for (const choice of root.querySelectorAll(".direction-modes button"))
        choice.setAttribute("aria-pressed", String(choice === button));
    });
  }
  document.addEventListener("scroll", reset, { capture: true, passive: true });
  root.addEventListener("contextmenu", (event) => event.preventDefault());
  return { reset };
}
