export const tiers=['上上签','上签','中签','下签'];
export const fortunes=[
  { tier:0, text: '今年你写的代码全年 0 bug，运维闲得开始养绿萝' },
  { tier:0, text: '你的技术方案评审一次过，产品经理当场鼓掌' },
  { tier:1,  text: '明天上线一次成功，灰度到全量零回滚' },
  { tier:1,  text: '本周准点下班五天，群里无人 @ 你' },
  { tier:1,  text: '三年后回看自己写的代码，依然看得懂，还骄傲' },
  { tier:2,  text: '今日宜重构，忌上新' },
  { tier:2,  text: '键盘手感回暖，敲代码如弹钢琴' },
  { tier:3,  text: '明天上线，今晚改需求' },
  { tier:3,  text: '你将听到那句：『这个改动很简单吧？』' },
  { tier:3,  text: '周五 17:59，告警准时响起' }
];
export function scene(w,h){const scale=Math.max(.7,Math.min(1.25,w/1200,h/800));const pots=[];for(const [row,y,s,xs]of [[0,.435,.78,[.2,.36,.5,.64,.8]],[1,.6,1,[.22,.38,.5,.62,.78]]])for(const x of xs)pots.push({x:x*w,y:y*h,r:34*scale*s,alive:true,row});return {pots,scale,hand:{x:Math.min(w-150*scale,w*.5+320*scale),y:h-84*scale}}}
export function trajectory(hand,aim,power){const end={x:hand.x+(aim.x-hand.x)*power,y:hand.y+(aim.y-hand.y)*power};const d=Math.hypot(end.x-hand.x,end.y-hand.y);return {start:hand,end,control:{x:(hand.x+end.x)/2,y:(hand.y+end.y)/2-d*.2},duration:.3+d/2000}}
export function point(path,t){const u=1-t;return {x:u*u*path.start.x+2*u*t*path.control.x+t*t*path.end.x,y:u*u*path.start.y+2*u*t*path.control.y+t*t*path.end.y}}
export class Round{constructor(rng=Math.random){this.rng=rng;this.bricks=0;this.used=new Set();this.draws=[];this.broken=new Set()}
 draw(){let pool;for(let tries=0;tries<40;tries++){const r=this.rng();const tier=r<.1?0:r<.4?1:r<.7?2:3;pool=fortunes.map((f,i)=>({...f,id:i})).filter(f=>f.tier===tier&&!this.used.has(f.id));if(pool.length)break}if(!pool?.length)pool=fortunes.map((f,i)=>({...f,id:i})).filter(f=>!this.used.has(f.id));const f=pool[Math.floor(this.rng()*pool.length)];this.used.add(f.id);this.draws.push(f);return f}
 throw(power,aim,layout){if(this.bricks>=3)throw Error('本轮砖块已用完');if(power<.08)return {dropped:true};this.bricks++;const path=trajectory(layout.hand,aim,Math.min(1,power));const index=layout.pots.findIndex((p,i)=>!this.broken.has(i)&&Math.hypot(path.end.x-p.x,path.end.y-(p.y-p.r*.3))<p.r*.95+12);let fortune=null;if(index>=0){this.broken.add(index);fortune=this.draw()}return {path,index,fortune}}
 get over(){return this.bricks>=3}summary(){return {bricks:this.bricks,hits:this.broken.size,draws:this.draws}}}
