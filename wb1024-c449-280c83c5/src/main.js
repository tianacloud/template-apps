import "./styles.css";
import "./load-style.js";
import body from "./body.html?raw";
import { sql } from "./db.js";
window.scheduleSQL = sql;
document.body.innerHTML = body;
await import("./data.js");
await import("./app.js");
