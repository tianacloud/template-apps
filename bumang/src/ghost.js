// A copy of the dragged element that follows the pointer.
export function ghost(source, x, y) {
  const rect = source.getBoundingClientRect();
  const el = source.cloneNode(true);
  el.classList.add("ghost");
  el.classList.remove("lifting", "moving");
  el.removeAttribute("data-drag");
  el.setAttribute("aria-hidden", "true");
  const width = Math.min(rect.width, 260);
  const height = Math.min(rect.height, 96);
  Object.assign(el.style, { top: "0", left: "0", width: `${width}px`, height: `${height}px` });
  const dx = Math.min(x - rect.left, width - 12);
  const dy = Math.min(y - rect.top, height - 8);
  document.body.append(el);
  const api = {
    move(px, py) {
      el.style.transform = `translate3d(${px - dx}px, ${py - dy}px, 0)`;
    },
    hide(hidden) {
      el.classList.toggle("hidden", hidden);
    },
    remove() {
      el.remove();
    },
  };
  api.move(x, y);
  return api;
}
