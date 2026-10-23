import css from './style.css?inline';
export const preview=import.meta.env.MODE==='showcase';
const style=document.createElement('style');style.textContent=css;document.head.append(style);
