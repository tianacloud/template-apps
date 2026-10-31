import { initPreferences } from "./preferences.js";
import body from "./body.json";
import "./app.css";
import "./leaflet.css";
if (!window.TRAVEL_PREVIEW) { const link=document.createElement("link"); link.rel="stylesheet"; link.href=new URL(["app","css"].join("."),import.meta.url).href; document.head.append(link); }
const meta=document.createElement("meta"); meta.name="theme-color"; meta.content="#1450d2"; document.head.append(meta);
document.body.innerHTML=body;
const preferenceNotice=document.createElement("div"); preferenceNotice.id="preferenceNotice"; preferenceNotice.setAttribute("role","status"); preferenceNotice.hidden=true; document.body.append(preferenceNotice);
window.lucide=(await import("./icons.js")).default;
window.L=(await import("./leaflet.js")).default;
await initPreferences();
await import("./map-adapter.js");
await import("./app.js");
