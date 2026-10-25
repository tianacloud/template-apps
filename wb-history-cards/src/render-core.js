import {StrategyGame} from './engine.js';

export function createRenderCore(config) {
  let game=null,lastMsg='';
  const cell=c=>({t:c.type,f:c.side,lv:c.level,fog:c.fog,revealed:c.revealed,shine:c.shine});
  const detail=d=>({...d,conn:d.connection,mult:d.multiplier,shine:d.timing>0});
  const result=r=>{
    if(!r)return null;
    const d={...r,own:r.own?detail(r.own):undefined,enemy:r.opponent?detail(r.opponent):undefined,ownFinal:r.ours,enemyFinal:r.theirs};
    if(r.own&&r.opponent&&['setback','defeat','enemySetback'].includes(r.status)){
      if(r.status==='enemySetback'){
        d.enemyLoss=Math.max(2,Math.floor(r.opponent.base*.4));
        d.ownLoss=Math.min(Math.floor(r.own.base*.25),Math.max(0,d.enemyLoss-1));
      }else{
        d.ownLoss=Math.max(2,Math.floor(r.own.base*.4));
        d.enemyLoss=Math.min(Math.floor(r.opponent.base*.25),Math.max(0,d.ownLoss-1));
      }
    }
    return d;
  };
  const fields={scenarioId:()=>game.scenario.id,hero:()=>game.hero.name,boardSize:()=>game.size,board:()=>game.board.map(cell),actionsLeft:()=>game.actions,handLimit:()=>6+(game.has('智慧')?1:0)-(game.has('刚愎')?1:0),lastMsg:()=>lastMsg,result:()=>result(game.result),taohuiTurns:()=>game.taohui,xiuDaoGain:()=>game.dao,freeUtilityUsed:()=>game.freeUsed};
  const state=new Proxy({}, {get:(_,key)=>game?(fields[key]?fields[key]():game[key]):undefined});
  const legalTargets=card=>game.board.flatMap((_,i)=>game.legal(card,i)?[i]:[]);
  const canPlay=card=>{
    if(!game||game.over)return{ok:false,msg:'本局已结束'};
    if(game.actions<=0&&!(card==='调研'&&game.has('勤奋')&&!game.freeUsed))return{ok:false,msg:'本回合没有行动力了'};
    if(card!=='调研'&&!game.hand.includes(card))return{ok:false,msg:'手牌里没有这张牌'};
    if(card==='修心')return game.indices('DELUSION','OWN').length?{ok:true}:{ok:false,msg:'没有己方妄念，修心无合法目标'};
    if(card==='正道')return game.vacant()>=0?{ok:true}:{ok:false,msg:'无空位，正道无法生成'};
    if(card==='用间')return{ok:true,need:2};
    const legal=legalTargets(card);
    return legal.length?{ok:true,legal}:{ok:false,msg:card==='调研'?'没有雾格可调研':'没有合法目标（雾里的格子不能选）'};
  };
  function action(fn){try{const msg=fn();lastMsg=typeof msg==='string'?msg:game.log.at(-1)||'';return{ok:true,msg:lastMsg}}catch(e){lastMsg=e.message;return{ok:false,msg:lastMsg}}}
  return {
    get state(){return game?state:null},get currentGame(){return game},get scenario(){return game?.scenario},get SCENARIO(){return game?.scenario},get hero(){return game?.hero},get CARDS(){return config.CARDS},
    newGame(id,name){game=new StrategyGame(id,name);lastMsg='';return state},
    restore(text){game=StrategyGame.restore(text);lastMsg='存档已恢复';return state},
    has:name=>game?.has(name)||false,
    canPickHero:(id,name)=>!config.scenarioById(id)?.isTutorial||name==='韩信',
    rollShine(){game.shine()},legalTargets,canPlay,
    calcSide:(side,visible)=>detail(game.score(side,visible)),
    realtime(){const own=game.score('OWN'),enemy=game.score('ENEMY');return{own:own.total,enemy:enemy.total,ownDetail:detail(own),enemyDetail:detail(enemy),hiddenCells:game.board.filter(c=>c.fog).length,enemyFoggedCount:game.board.filter(c=>c.fog&&c.side==='ENEMY').length}},
    play(card,targets){const chk=canPlay(card);return chk.ok?action(()=>game.play(card,targets)):chk},
    replaceCard:card=>action(()=>game.utility(card,true)),destroyCard:card=>action(()=>game.utility(card,false)),
    endTurn(){const old=game.result;game.endTurn();lastMsg=game.log.at(-1)||'';return game.result!==old&&game.result?.enemy?{enemyShowdown:result(game.result)}:{}},
    showdown(){try{return result(game.showdown())}catch(e){return{status:'blocked',text:'无法摊牌',msg:e.message}}}
  };
}
