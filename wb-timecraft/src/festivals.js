import LunarLib from 'lunar-javascript';
import {today,dateOf,pad,distance,lunarYearEnd} from './rules.js';

const solar=[
 [1,1,'元旦','🎉'],[2,14,'情人节','💝'],[3,8,'妇女节','🌷'],[3,12,'植树节','🌳'],
 [4,1,'愚人节','🤡'],[5,1,'劳动节','⛑️',5],[5,4,'青年节','🔥'],[6,1,'儿童节','🧸'],
 [9,10,'教师节','🍎'],[10,1,'国庆节','🇨🇳',7],[11,11,'双十一','🛒'],[12,25,'圣诞节','🎄']
];
const lunar=[
 [1,1,'春节','🧨',8],[1,15,'元宵节','🏮'],[5,5,'端午节','🥟',3],[7,7,'七夕','🪙'],
 [7,15,'中元节','🕯️'],[8,15,'中秋节','🥮',3],[9,9,'重阳节','🍂'],[12,8,'腊八节','🥣'],
 [12,30,'除夕','🐉'],[12,23,'小年','🍬']
];
export const festivalEmoji=Object.fromEntries([...solar,...lunar,...[[5,0,'母亲节','💐'],[6,0,'父亲节','👔']]].map(([, ,title,emoji])=>[title,emoji]));
const key=(year,month,day)=>`${year}-${pad(month)}-${pad(day)}`;
function nthSunday(year,month,n){return 1+(7-new Date(year,month-1,1,12).getDay())%7+(n-1)*7;}
export function festivalsInYear(year){
 const out=solar.map(([month,day,title,emoji,duration=1])=>({date:key(year,month,day),title,emoji,duration,lunar:false}));
 out.push({date:key(year,5,nthSunday(year,5,2)),title:'母亲节',emoji:'💐',duration:1,lunar:false},{date:key(year,6,nthSunday(year,6,3)),title:'父亲节',emoji:'👔',duration:1,lunar:false});
 for(const[month,day,title,emoji,duration=1]of lunar){
  for(const lunarYear of [year,year+1,year-1]){try{const date=title==='除夕'?lunarYearEnd(lunarYear):LunarLib.Lunar.fromYmd(lunarYear,month,day).getSolar().toYmd();if(+date.slice(0,4)===year){out.push({date,title,emoji,duration,lunar:true,lastDay:title==='除夕'});break;}}catch{}}
 }
 return out.sort((a,b)=>a.date.localeCompare(b.date));
}
export function festivalSuggestions(events,from=today()){
 const year=dateOf(from).getFullYear(),titles=new Set(events.filter(e=>!e.archived).map(e=>e.title));
 return [...festivalsInYear(year),...(year<2099?festivalsInYear(year+1):[])].filter(f=>f.date>=from&&f.date<='2099-12-31'&&distance(from,f.date)<=45&&!titles.has(f.title)).slice(0,6);
}
