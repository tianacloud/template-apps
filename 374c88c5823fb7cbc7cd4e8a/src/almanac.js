import {dateOf} from './rules.js';

const stems='甲乙丙丁戊己庚辛壬癸',branches='子丑寅卯辰巳午未申酉戌亥',animals='鼠牛虎兔龙蛇马羊猴鸡狗猪';
const officers=['建','除','满','平','定','执','破','危','成','收','开','闭'];
const activities=[
 [['出行','祈福','见客','求财'],['动土','迁移','开张']],
 [['大扫除','洗涤衣物','剔除旧物','就诊'],['嫁娶','入宅','签约']],
 [['祭祀','祈福','答谢','添置物资'],['诉讼','拆卸','搬家']],
 [['整理房间','日常办公','修缮房屋','理发'],['开张','远行','安床']],
 [['约定会面','签约洽谈','裁衣','入学'],['诉讼','搬迁','动土']],
 [['建造','收获','守成事务','缔约'],['远行','开张','剃头']],
 [['破除旧规','就医检查','拆解整理'],['置业','合伙','嫁娶','入库']],
 [['谨慎行事','检修设备','祭祀祈福'],['登高涉险','开工动土','行船']],
 [['开业庆典','成果验收','婚嫁礼仪','签约合作'],['诉讼','拆卸','破土']],
 [['收纳归档','收款结算','储藏物资','采购囤货'],['出行','开张','动土']],
 [['启动新项目','开业','学习入门','疏通管道'],['裁剪','安床','结网']],
 [['封存归档','静养休息','修补堤防','盘点清点'],['出嫁','开业','挖沟渠','远行']]
];
const radians=Math.PI/180,mod=(n,m)=>(n%m+m)%m;
function julianDay(year,month,day){const a=Math.floor((14-month)/12),y=year+4800-a,m=month+12*a-3;return day+Math.floor((153*m+2)/5)+365*y+Math.floor(y/4)-Math.floor(y/100)+Math.floor(y/400)-32045;}
function solarLongitude(jd){const t=(jd-2451545)/36525,mean=(280.46646+36000.76983*t+.0003032*t*t)%360*radians,anomaly=(357.52911+35999.05029*t-.0001537*t*t)%360*radians,correction=((1.914602-.004817*t-.000014*t*t)*Math.sin(anomaly)+(.019993-.000101*t)*Math.sin(2*anomaly)+.000289*Math.sin(3*anomaly))*radians,omega=(125.04-1934.136*t)*radians;return mod(mean+correction-(.00569+.00478*Math.sin(omega))*radians,2*Math.PI);}
function solarTerm(year,index){const longitude=mod(285+15*index,360)*radians;let jd=julianDay(year,1+Math.floor(index/2),6);for(let i=0;i<60;i++){let delta=mod(longitude-solarLongitude(jd),2*Math.PI);if(delta>Math.PI)delta-=2*Math.PI;if(Math.abs(delta)<1e-10)break;jd+=delta/radians/.98564736;}return jd;}
const monthCache=new Map();
function solarMonth(year,jd){let terms=monthCache.get(year);if(!terms){terms=[];for(let y=year-1;y<=year+1;y++)for(let i=0;i<24;i+=2)terms.push([solarTerm(y,i),(i/2+1)%12]);terms.sort((a,b)=>a[0]-b[0]);monthCache.set(year,terms);}let branch=terms[0][1];for(const [at,index] of terms){if(at>jd)break;branch=index;}return branch;}
export function almanacInfo(date){const d=dateOf(date),jd=julianDay(d.getFullYear(),d.getMonth()+1,d.getDate()),cycle=mod(jd+49,60),branch=cycle%12,officer=mod(branch-solarMonth(d.getFullYear(),jd+.5),12),opposite=(branch+6)%12;return {ganZhi:stems[cycle%10]+branches[branch]+'日',jianChu:officers[officer],chong:'冲'+branches[opposite]+animals[opposite],yi:[...activities[officer][0]],ji:[...activities[officer][1]]};}
