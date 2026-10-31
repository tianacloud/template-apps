import css from './style.css?inline';
export const preview=import.meta.env.MODE==='showcase';
const style=document.createElement('style');style.textContent=css;document.head.append(style);
export const clone=x=>structuredClone(x);
export const uid=()=>[...crypto.getRandomValues(new Uint32Array(4))].map(x=>x.toString(16).padStart(8,'0')).join('');
