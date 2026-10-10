// Bootstrap imports only the entry; the entry owns its stylesheet.
const cssPath = "./app.css";
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = new URL(cssPath, import.meta.url).href;
document.head.append(link);
