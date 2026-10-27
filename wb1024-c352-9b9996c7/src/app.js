const s = document.createElement("script");
s.src = new URL("echarts.min.js", import.meta.url).href;
s.onload = () => import("./main.js");
document.head.appendChild(s);
