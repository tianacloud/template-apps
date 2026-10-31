import { createRoot } from "react-dom/client";
import { App } from "./app";
import { CloudRepository, type Runtime } from "./storage";
import css from "./style.css";
const style = document.createElement("style");
style.textContent = css;
document.head.append(style);
document.title = "行迹 · 油耗账本";
const icon = document.createElement("link");
icon.rel = "icon";
icon.href = new URL("../icon.png", import.meta.url).href;
document.head.append(icon);
export async function mount(element: HTMLElement, runtime: Runtime) {
  const root = createRoot(element);
  try {
    root.render(<App repository={new CloudRepository(runtime)} />);
  } catch (e) {
    root.render(
      <div className="loading-page">
        <h2>账本暂时无法打开</h2>
        <p>{e instanceof Error ? e.message : "请重新登录后打开应用"}</p>
      </div>,
    );
  }
}
