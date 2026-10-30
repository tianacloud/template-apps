import {ZONES} from './game.js';
import manifest from '../assets/manifest.json';
import smallImages from 'virtual:small-images';
export async function loadArt(files,onProgress){
 if (!files) throw Error('文件服务不可用');
 const images={}, entries=Object.entries(manifest.images); let next=0,done=0;
 await Promise.all(Array.from({length:12},async()=>{while(next<entries.length){
  const [id,item]=entries[next++],img=new Image(); let url=smallImages[item.file], objectUrl;
  if(!url){const response=await files.get('template-assets/'+item.file);if(!response.ok)throw Error('素材读取失败：'+item.file);objectUrl=URL.createObjectURL(await response.blob());url=objectUrl;}
  try{img.src=url;await img.decode();images[id]=img;}finally{if(objectUrl)URL.revokeObjectURL(objectUrl);}
  onProgress(++done/entries.length);
 }}));
 return {manifest,images};
}
export class Renderer{
 constructor(canvas,art){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.art=art;this.time=0;canvas.width=960;canvas.height=540;}
 image(name,x,y,w,h){const id=this.art.manifest.scenes[name],img=this.art.images[id];if(img)this.ctx.drawImage(img,x,y,w,h);}
 actor(a){const ctx=this.ctx,animations=this.art.manifest.animations[a.kind];let key='idle';
  if(a.action==='walk')key='walk';
  if(a.kind==='chad'){if(a.action==='attack')key='attack_'+a.combo;if(a.action==='jump')key='jump';if(a.action==='kick')key='air_attack';if(a.action==='hurt')key='hurt_high';if(a.dead)key='knockout_landed';}
  else if(a.kind==='sargent'){if(a.action==='attack'||a.action==='windup')key='punch_1';if(a.action==='hurt')key='hurt_high';if(a.dead)key='knockout_landed';}
  else {if(a.action==='attack')key='slap';if(a.action==='slam'||(a.action==='windup'&&a.special))key='area_attack';if(a.action==='hurt')key='hurt_light';if(a.dead)key='knockout_kneeled';}
  const animation=animations[key],frame=Math.floor((a.action==='windup'?0:a.time)*animation.fps),id=animation.frames[animation.loop?frame%animation.frames.length:Math.min(frame,animation.frames.length-1)],info=this.art.manifest.images[id],img=this.art.images[id];
  const scale=a.kind==='chad'?.43:a.kind==='sargent'?.40:.34;
  const w=info.width*scale,h=info.height*scale;ctx.save();if(a.dead)ctx.globalAlpha=Math.max(0,1-a.time);
  ctx.fillStyle='#05081070';ctx.beginPath();ctx.ellipse(a.x,a.y+3,35+(a.kind==='taxman'?12:0),9,0,0,Math.PI*2);ctx.fill();
  if(a.action==='windup'){ctx.strokeStyle=a.special?'#e683ef':'#ff7859';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(a.x,a.y+3,a.special?235:56,a.special?62:17,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffbd85';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.fillText('!',a.x,a.y-h-12);}
  // Quiver's Sargent idle frames face left; his other included animations face right.
  const facesLeft=a.kind==='taxman'||(a.kind==='sargent'&&key==='idle');
  ctx.translate(a.x,a.y-a.z+8);ctx.scale(a.dir*(facesLeft?-1:1),1);
  if(a.invincible>0&&Math.floor(a.invincible*18)%2===0)ctx.globalAlpha*=.5;
  ctx.drawImage(img,-w/2,-h,w,h);ctx.restore();
  if(a.kind!=='chad'&&!a.dead&&a.hp<a.maxHp){ctx.fillStyle='#080b14';ctx.fillRect(a.x-25,a.y+16,50,4);ctx.fillStyle=a.kind==='taxman'?'#ce83ee':'#ff7354';ctx.fillRect(a.x-25,a.y+16,50*a.hp/a.maxHp,4);}
 }
 draw(game,dt){this.time+=dt;const ctx=this.ctx,s=game.state,zone=s?.zone||0,base=zone*1100,camera=(s?.camera||0)-base;
  ctx.clearRect(0,0,960,540);ctx.save();if(game.shake)ctx.translate(Math.sin(this.time*170)*game.shake,Math.cos(this.time*131)*game.shake*.4);
  this.image('sky',0,-20,960,270);ctx.fillStyle=['#30245380','#32355680','#31172e88'][zone];ctx.fillRect(0,0,960,360);
  this.image('city',420-camera*.15,60,375,335);this.image('city',-80-camera*.15,100,280,250);
  ctx.fillStyle='#353049';ctx.fillRect(0,270,960,120);
  ctx.save();ctx.translate(-camera,0);
  if(zone<2){
   this.image('cafe',-35,60,240,325);this.image('steak',205,76,322,310);this.image('mart',536,30,350,358);this.image('cafe',915,60,240,325);
   this.image('vending',823,256,95,130);this.image('lanterns',190,78,290,100);
   ctx.fillStyle='#a4788750';ctx.fillRect(0,382,1240,8);
  }else{
   this.image('wall',-20,30,1270,370);this.image('throne',615,140,215,242);this.image('tree',950,25,235,362);
   ctx.fillStyle='#321b414d';ctx.fillRect(0,0,1250,390);
  }
  ctx.fillStyle=zone===2?'#383540':'#343c4a';ctx.fillRect(0,390,1250,150);
  for(let x=-80;x<1300;x+=550)this.image('road',x,383,600,165);
  ctx.fillStyle='#0f142770';ctx.fillRect(0,390,1250,150);ctx.strokeStyle='#8b729936';ctx.lineWidth=2;
  for(let y=403;y<540;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1250,y);ctx.stroke();}
  for(let x=100;x<1300;x+=220){ctx.fillStyle='#d6a98855';ctx.fillRect(x,500,105,6);}
  this.image('lamp',50,50,90,353);this.image('lamp',990,50,90,353);
  const glow=ctx.createRadialGradient(95,370,0,95,370,230);glow.addColorStop(0,'#ffba6c20');glow.addColorStop(1,'#ffba6c00');ctx.fillStyle=glow;ctx.fillRect(-130,170,480,370);
  if(s){
   const actors=[s.player,...s.enemies].sort((a,b)=>a.y-b.y);for(const a of actors){ctx.save();ctx.translate(-base,0);this.actor(a);ctx.restore();}
   for(const e of game.effects){ctx.save();ctx.translate(-base,0);ctx.globalAlpha=1-e.age/.65;
    if(e.ring){ctx.strokeStyle='#f39fff';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(e.x,e.y,40+e.age*450,12+e.age*100,0,0,Math.PI*2);ctx.stroke();}
    else {ctx.strokeStyle='#ffe5a0';ctx.lineWidth=3;for(let i=0;i<7;i++){const r=12+e.age*70,a=i*Math.PI*2/7;ctx.beginPath();ctx.moveTo(e.x+Math.cos(a)*r*.5,e.y+Math.sin(a)*r*.5);ctx.lineTo(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r);ctx.stroke();}ctx.font='italic 900 25px sans-serif';ctx.fillStyle='#fff0c5';ctx.fillText(e.text,e.x+18,e.y-20-e.age*80);}
    ctx.restore();
   }
  }else this.actor({kind:'chad',x:710,y:465,z:0,action:'idle',time:this.time,dir:-1,hp:100,maxHp:100});
  ctx.restore();
  if(s?.gateOpen){ctx.textAlign='right';ctx.font='italic 900 28px sans-serif';ctx.fillStyle='#ffc568';ctx.fillText('GO →',920+Math.sin(this.time*5)*5,210);ctx.font='14px sans-serif';ctx.fillText('前往下一个街区',921,235);}
  if(s?.comboHits>1){ctx.textAlign='right';ctx.font='italic 900 38px sans-serif';ctx.fillStyle='#ffca8a';ctx.fillText(s.comboHits+' HITS',928,126);ctx.font='12px sans-serif';ctx.fillText('KEEP IT GOING',925,145);}
  const boss=s?.enemies.find(e=>e.kind==='taxman'&&!e.dead);if(boss){ctx.fillStyle='#15131fe8';ctx.fillRect(300,500,360,28);ctx.fillStyle='#e395d4';ctx.fillRect(310,518,340*boss.hp/boss.maxHp,4);ctx.fillStyle='#fff1e6';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('TAX MAN',480,513);}
  ctx.restore();
 }
}
