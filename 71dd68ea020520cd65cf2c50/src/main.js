import content from "./content.html"; import css from "./style.css";
const style=document.createElement("style");style.textContent=css;document.head.appendChild(style);document.body.className="bg-gray-50 text-gray-800";document.querySelector("#app").innerHTML=content;
