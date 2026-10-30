export const ZONES = ['霓虹街口', '夜市巷战', '最后的账单'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const actor=(kind,x,y,hp,dir)=>({kind,x,y,hp,maxHp:hp,dir,z:0,vz:0,action:'idle',time:0,cooldown:0,invincible:0,combo:0,comboWindow:0,hits:[],struck:false,dead:false});
export class Game {
 constructor({onEvent=()=>{},random=Math.random}={}){this.onEvent=onEvent;this.random=random;this.state=null;this.paused=true;this.effects=[];this.shake=0;this.freeze=0;}
 start(){this.state={zone:0,wave:0,score:0,kills:0,elapsed:0,status:'playing',camera:0,gateOpen:false,player:actor('chad',170,435,100,1),enemies:[],serial:0,maxCombo:0,comboHits:0,comboTime:0};this.paused=false;this.effects=[];this.spawnWave();this.onEvent('start');}
 restore(state){this.state=structuredClone(state);this.paused=false;this.effects=[];this.freeze=0;this.shake=0;}
 snapshot(){return structuredClone(this.state);}
 spawnWave(){const s=this.state,base=s.zone*1100;const boss=s.zone===2&&s.wave===1;const n=boss?1:2+s.zone+s.wave;
  for(let i=0;i<n;i++){const e=actor(boss?'taxman':'sargent',base+690+(i%2)*170,390+(i%3)*43,boss?280:50+s.zone*10,-1);e.id=++s.serial;e.cooldown=.65+i*.3;s.enemies.push(e);}
  this.onEvent('wave',{zone:s.zone,wave:s.wave,boss});
 }
 setAction(a,name){a.action=name;a.time=0;a.struck=false;a.hits=[];}
 attack(){const s=this.state;if(!s||this.paused||s.status!=='playing')return;const p=s.player;
  if(p.action==='hurt'||p.action==='dead')return;
  if(p.action==='attack'){if(p.time>.10&&p.combo<3)p.queued=true;return;}
  if(p.action==='kick')return;
  if(p.z>12){this.setAction(p,'kick');this.onEvent('swing');return;}
  p.combo=p.comboWindow>0?(p.combo%3)+1:1;this.setAction(p,'attack');p.queued=false;this.onEvent('swing');
 }
 jump(){const s=this.state;if(!s||this.paused||s.status!=='playing')return;const p=s.player;if(p.z===0&&p.action!=='hurt'&&p.action!=='attack'){p.vz=620;this.setAction(p,'jump');this.onEvent('jump');}}
 damage(target,amount,source,knockback){
  if(target.dead||target.invincible>0)return false;
  target.hp=Math.max(0,target.hp-amount);target.invincible=target.kind==='chad'?.6:.16;target.x=clamp(target.x+source.dir*knockback,this.state.zone*1100+35,this.state.zone*1100+1065);
  target.dir=-source.dir;this.setAction(target,target.hp===0?'dead':'hurt');target.dead=target.hp===0;
  this.effects.push({x:target.x-source.dir*22,y:target.y-target.z-100,age:0,text:String(amount),dir:source.dir});this.shake=target.kind==='taxman'?4:7;this.freeze=.045;this.onEvent('hit');
  if(target.kind==='chad'){this.state.comboHits=0;if(target.dead){this.state.status='lost';this.onEvent('lost');}}
  else {const s=this.state;s.comboHits++;s.comboTime=2;s.maxCombo=Math.max(s.maxCombo,s.comboHits);s.score+=amount*10;if(target.dead){s.kills++;s.score+=target.kind==='taxman'?2000:200;this.onEvent('defeat');}}
  return true;
 }
 step(dt,input={}){
  if(!this.state||this.paused)return;
  this.shake=Math.max(0,this.shake-dt*32);this.effects=this.effects.filter(e=>(e.age+=dt)<.65);
  if(this.freeze>0){this.freeze-=dt;return;}
  const s=this.state,p=s.player;if(s.status!=='playing'){p.time+=dt;return;}
  s.elapsed+=dt;s.comboTime-=dt;if(s.comboTime<=0)s.comboHits=0;
  for(const a of [p,...s.enemies]){a.time+=dt;a.cooldown=Math.max(0,a.cooldown-dt);a.invincible=Math.max(0,a.invincible-dt);a.comboWindow=Math.max(0,a.comboWindow-dt);
   if(a.z>0||a.vz>0){a.vz-=1550*dt;a.z=Math.max(0,a.z+a.vz*dt);if(a.z===0){a.vz=0;if(a.action==='jump'||a.action==='kick')this.setAction(a,'idle');}}
   if(a.action==='hurt'&&a.time>.26)this.setAction(a,'idle');
  }
  if(!['hurt','dead','attack','kick'].includes(p.action)){
   const dx=(input.right?1:0)-(input.left?1:0),dy=(input.down?1:0)-(input.up?1:0);const norm=dx&&dy?Math.SQRT1_2:1;
   if(dx)p.dir=dx;p.x+=dx*230*norm*dt;p.y=clamp(p.y+dy*155*norm*dt,375,485);
   if(p.z===0){const action=dx||dy?'walk':'idle';if(p.action!==action)this.setAction(p,action);}
  }else if(p.action==='kick')p.x+=p.dir*100*dt;
  if(p.action==='attack'||p.action==='kick'){
   const kick=p.action==='kick',duration=kick?.55:[0,.28,.38,.55][p.combo],impact=kick?.06:duration*.40;
   if(p.time>=impact&&!p.struck){p.struck=true;for(const e of s.enemies){if(e.dead)continue;const dx=(e.x-p.x)*p.dir;if(dx>-30&&dx<(kick?150:125)&&Math.abs(p.y-e.y)<42&&p.z<160){this.damage(e,kick?20:[0,10,15,30][p.combo],p,kick||p.combo===3?58:18);}}}
   if(p.time>duration){if(p.queued&&p.combo<3&&!kick){p.combo++;p.queued=false;this.setAction(p,'attack');this.onEvent('swing');}else{p.comboWindow=.32;this.setAction(p,p.z>0?'jump':'idle');}}
  }
  for(const e of s.enemies){
   if(e.dead||e.action==='hurt')continue;
   const dx=p.x-e.x,dy=p.y-e.y;
   if(e.action==='windup'){
    if(e.time>(e.kind==='taxman'?.65:.52)){this.setAction(e,e.special?'slam':'attack');this.onEvent('swing');}
   }else if(e.action==='attack'||e.action==='slam'){
    if(e.time>.14&&!e.struck){e.struck=true;const slam=e.action==='slam';if(Math.abs(dy)<(slam?95:42)&&Math.abs(dx)<(slam?235:100)&& (slam||dx*e.dir>-20)&&p.z<(slam?48:60))this.damage(p,slam?22:e.kind==='taxman'?16:9,e,25);if(slam){this.shake=12;this.effects.push({ring:true,x:e.x,y:e.y,age:0});this.onEvent('slam');}}
    if(e.time>(e.action==='slam'?.85:.40)){this.setAction(e,'idle');e.cooldown=e.kind==='taxman'?1.5:1.1+this.random()*.6;}
   }else{
    e.dir=dx>=0?1:-1;
    if(Math.abs(dx)<(e.kind==='taxman'?185:88)&&Math.abs(dy)<35&&e.cooldown===0){e.special=e.kind==='taxman'&&this.random()<.45;this.setAction(e,'windup');}
    else{const speed=e.kind==='taxman'?75:82+s.zone*12;let moving=false;
     if(Math.abs(dx)>80){e.x+=Math.sign(dx)*speed*dt;moving=true;}
     if(Math.abs(dy)>8){e.y+=Math.sign(dy)*speed*.55*dt;moving=true;}
     if(moving&&e.action!=='walk')this.setAction(e,'walk');else if(!moving&&e.action!=='idle')this.setAction(e,'idle');
    }
   }
  }
  s.enemies=s.enemies.filter(e=>!e.dead||e.time<.8);
  if(s.enemies.length===0&&!s.gateOpen&&s.status==='playing'){
   if(s.wave===0){s.wave=1;p.hp=Math.min(100,p.hp+10);this.spawnWave();}
   else if(s.zone===2){s.status='won';s.score+=Math.round(p.hp*20);this.onEvent('won');}
   else {s.gateOpen=true;p.hp=Math.min(100,p.hp+25);this.onEvent('checkpoint');}
  }
  const base=s.zone*1100;p.x=clamp(p.x,base+30,base+(s.gateOpen?1160:1040));
  if(s.gateOpen&&p.x>base+1100){s.zone++;s.wave=0;s.gateOpen=false;s.enemies=[];this.spawnWave();this.onEvent('checkpoint');}
  s.camera=clamp(p.x-350,s.zone*1100,s.zone*1100+140);
 }
}
