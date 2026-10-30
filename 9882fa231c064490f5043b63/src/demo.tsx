import { createRoot } from "react-dom/client";
import { App, applyStyles } from "./main";
import { addDays, monthEnd, monthStart, today } from "./dates";
import { emptyWorkspace, newRoster, validate, type Workspace } from "./model";
import { applyPreview, previewRotation } from "./rotation";
import type { Repository, Snapshot } from "./storage";
function sample() {
  const w = emptyWorkspace(),
    r = newRoster("我的轮班", w.shifts),
    start = monthStart(today());
  w.rosters.push(r);
  const p = previewRotation(
      w,
      r,
      {
        anchor: start,
        cycle: [w.shifts[0].id, w.shifts[1].id, w.shifts[3].id, null, null],
        rules: [],
        generatedThrough: start,
      },
      start,
      monthEnd(start),
    ),
    out = applyPreview(w, p);
  out.rosters[0].notes[addDays(start, 5)] = "交班前核对记录";
  return out;
}
class DemoRepository implements Repository {
  private value: Snapshot = { revision: 0, data: sample() };
  readonly pending = false;
  async load() {
    return structuredClone(this.value);
  }
  async verifyPending() {
    return this.load();
  }
  async save(previous: Snapshot, next: Workspace) {
    validate(next);
    if (previous.revision !== this.value.revision)
      throw new Error("示例数据已变化");
    this.value = {
      revision: this.value.revision + 1,
      data: structuredClone(next),
    };
    return this.load();
  }
}
applyStyles();
let repository = new DemoRepository();
const root = createRoot(document.getElementById("app")!);
const render = () =>
  root.render(
    <App
      key={Math.random()}
      repository={repository}
      demo
      onReset={() => {
        repository = new DemoRepository();
        render();
      }}
    />,
  );
render();
