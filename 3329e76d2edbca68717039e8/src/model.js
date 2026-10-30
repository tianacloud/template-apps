export const scenarios = [
  {name:'选 Offer',title:'我应该选哪个 Offer？',options:['A 公司 · 大厂','B 公司 · 创业公司','C 公司 · 外企'],criteria:[['薪资水平',9,true],['成长空间',8,true],['通勤耗时',5,false],['团队氛围',6,true],['稳定性',7,true]],scores:[[8,6,7],[7,9,5],[7,3,5],[6,8,7],[9,4,8]]},
  {name:'买房选筹',title:'怎样选择适合自己的住房？',options:['中心城区','近郊社区','新城社区'],criteria:[['总价',9,false],['地段',8,true],['教育配套',7,true],['通勤耗时',6,false],['户型',5,true]],scores:[[8,4,6],[9,5,6],[6,4,8],[3,8,6],[6,8,7]]},
  {name:'技术选型',title:'选择哪一种前端框架？',options:['React','Vue','Svelte'],criteria:[['上手成本',6,false],['生态成熟度',9,true],['运行性能',7,true],['团队熟悉度',8,true],['长期维护性',7,true]],scores:[[6,3,3],[9,8,5],[7,7,9],[8,9,3],[9,8,6]]},
  {name:'买车决策',title:'哪一款车更适合日常生活？',options:['纯电车型','混动车型','燃油车型'],criteria:[['购车价格',8,false],['续航与使用成本',8,true],['智能座舱',6,true],['品牌口碑',5,true],['空间',6,true]],scores:[[7,5,4],[9,7,3],[9,6,4],[6,7,8],[7,7,8]]}
];
export const createScenario=(i=0)=>structuredClone({...scenarios[i],step:1});
export function validate(state){
  if(state.options.length<2||state.options.length>6)throw Error('请保留2至6个方案');
  if(!state.criteria.length||state.criteria.length>10)throw Error('请保留1至10个维度');
  if(state.options.some(x=>!x.trim())||state.criteria.some(x=>!x[0].trim()))throw Error('方案和维度名称不能为空');
  if(state.criteria.some(x=>!Number.isFinite(x[1])||x[1]<1||x[1]>10))throw Error('权重需在1至10之间');
  if(state.scores.length!==state.criteria.length||state.scores.some(row=>row.length!==state.options.length||row.some(x=>!Number.isFinite(x)||x<1||x>10)))throw Error('评分需完整且位于1至10之间');
}
export const normalized=(score,higher)=>higher?score/10:(11-score)/10;
export function rank(state,weights=state.criteria.map(c=>c[1])){
 const total=weights.reduce((a,b)=>a+b,0)||1;
 return state.options.map((name,i)=>({name,index:i,score:100*state.criteria.reduce((sum,c,j)=>sum+weights[j]/total*normalized(state.scores[j][i],c[2]),0)})).sort((a,b)=>b.score-a.score||a.index-b.index);
}
export function sensitivity(state){
 const top=rank(state)[0].index,base=state.criteria.map(c=>c[1]),sum=base.reduce((a,b)=>a+b,0),result=[];
 for(let j=0;j<base.length;j++){
  const factors=[...Array.from({length:40},(_,k)=>1+(k+1)*.05),...Array.from({length:19},(_,k)=>1-(k+1)*.05)];
  for(const factor of factors){const weights=base.map((w,i)=>i===j?w*factor:w),winner=rank(state,weights)[0];if(winner.index!==top){result.push({name:state.criteria[j][0],factor,percent:100*weights[j]/weights.reduce((a,b)=>a+b,0),basePercent:100*base[j]/sum,winner:winner.name});break}}
 }
 return result.sort((a,b)=>Math.abs(Math.log(a.factor))-Math.abs(Math.log(b.factor))).slice(0,3);
}
export function report(state){
 const weights=state.criteria.map(c=>c[1]),total=weights.reduce((a,b)=>a+b,0);
 return [`决策报告：${state.title||'未命名决策'}`,'',...state.criteria.map((c,j)=>`${c[0]}：权重 ${(100*c[1]/total).toFixed(1)}%，${c[2]?'越高越好':'越低越好'}；原始分 ${state.scores[j].join(' / ')}`),'','方案：'+state.options.join(' / '),'',...rank(state).map((r,i)=>`${i+1}. ${r.name} ${r.score.toFixed(1)}分`),'','反转分析（5%原始权重步长采样，非精确临界值）：',...sensitivity(state).map(x=>`${x.name}归一化权重从${x.basePercent.toFixed(1)}%${x.factor>1?'提高':'降低'}至${x.percent.toFixed(1)}%时，首选为${x.winner}`)].join('\n');
}
