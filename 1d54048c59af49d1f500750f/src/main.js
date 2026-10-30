import html from "./view.html?raw";
import css from "./style.css?raw";
document.getElementById("app").outerHTML = html.trim();
const style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);
await import("./app.js");
