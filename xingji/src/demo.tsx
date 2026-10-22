import { createRoot } from "react-dom/client";
import { App } from "./app";
import { sampleWorkspace } from "./sample";
import css from "./style.css";
const style = document.createElement("style");
style.textContent = css;
document.head.append(style);
createRoot(document.getElementById("app")!).render(
  <App initial={sampleWorkspace()} demo />,
);
