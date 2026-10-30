import {test} from 'node:test';
import assert from 'node:assert/strict';
import {installRules} from '../src/rules.js';

test('完整规则引擎从正常发车推进到八车结算，分数与事件一致',()=>{
 const K=installRules();let events=0;
 const race=K.createRace({kartId:'nixie',trackId:'silverstone',mode:'race',onEvent:type=>{if(type==='finished')events++}});
 assert.equal(race.cars.length,8);assert.equal(race.countdown,3);assert.equal(race.results,null);
 for(let i=0;i<360*60&&race.state!=='finished';i++)K.stepRace(race,1/60,{steer:0,throttle:true});
 assert.equal(race.state,'finished');assert.equal(events,1);assert.equal(race.results.length,8);
 assert.deepEqual(race.results.map(r=>r.rank),[1,2,3,4,5,6,7,8]);
 for(const row of race.results){
  const expected=K.RANK_POINTS[row.rank-1]+(row.car.finished?K.SCORE_BONUS.finish:0)+(row.car===race.fastestCar&&race.fastestLap?K.SCORE_BONUS.fastestLap:0)+(row.car.finished&&row.car.wallHits<3?K.SCORE_BONUS.clean:0);
  assert.equal(row.points,expected);assert.equal(row.dnf,!row.car.finished);
  assert.equal(row.time,row.car.finished?row.car.finishTime:null);
 }
 const finalTime=race.time;K.stepRace(race,1,{});assert.equal(race.time,finalTime);assert.equal(events,1);
});

test('道具输入跨规则与音频模块保留实际使用种类且不重复触发',()=>{
 const K=installRules();const race=K.createRace({mode:'item'});race.countdown=0;race.player.item='rocket';
 const input={steer:0,throttle:true,useItem:true};K.stepRace(race,1/60,input);
 assert.equal(input.useItem,false);assert.equal(K.pendingItemSfx,'rocket');assert.equal(race.player.item,null);
 K.pendingItemSfx=null;K.stepRace(race,1/60,input);assert.equal(K.pendingItemSfx,null);
});

test('正常行驶后触控幅度转向蓄力并松开，三级漂移各产生一次对应涡轮',()=>{
 const random=Math.random;Math.random=()=>.5;
 try{
  const K=installRules();
  for(const [hold,kind,mul,duration] of [[.7,'mini',1.12,1],[1.5,'strong',1.2,1.6],[2.3,'super',1.28,2.2]]){
   const race=K.createRace({kartId:'nixie',trackId:'silverstone',mode:'race',onEvent(){}});
   for(let i=0;i<7*60;i++)K.stepRace(race,1/60,{steer:0,throttle:true});
   for(let i=0;i<hold*60;i++)K.stepRace(race,1/60,{steer:.25,drift:true,throttle:true});
   K.stepRace(race,1/60,{steer:0,throttle:true,drift:false});
   const boost=race.player.boosts.find(x=>x.kind===kind);
   assert.ok(boost,`蓄力${hold}秒应出现${kind}`);assert.equal(boost.mul,mul);assert.equal(boost.total,duration);
   assert.equal(race.player.driftBoosts,1);assert.equal(race.player.drifting,false);
  }
 }finally{Math.random=random}
});
