import body from './body.html?raw';
import QRCode from 'qrcode';
import { initialize } from './logic.js';
document.title = '中考英语时文阅读';
const link = document.createElement('link'); link.rel='stylesheet'; link.href=new URL('./app.css',import.meta.url).href; document.head.append(link);
export async function mount(root, { files }) {
root.innerHTML=body;
document.querySelectorAll('.qrbox').forEach((box,i)=>{const url=location.href.split('#')[0]+'#answers'+(i<3?i+1:''); box.querySelector('.u').textContent=url; const canvas=document.createElement('canvas'); box.querySelector('.qs').append(canvas); QRCode.toCanvas(canvas,url,{width:148,margin:2}).catch(console.error);});
initialize(files);
}
