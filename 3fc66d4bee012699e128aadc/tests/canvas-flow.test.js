import test from 'node:test';
import assert from 'node:assert/strict';
import {Config} from '../src/view-config.js';
import {createRenderCore} from '../src/render-core.js';
import {mountCanvas} from '../src/canvas-ui.js';
test('Canvas normal tutorial input advances turn, restores stored game and blocks mutation while saving',()=>{
 const oldRAF=globalThis.requestAnimationFrame;let pending=false,paint;
 globalThis.requestAnimationFrame=fn=>{paint=fn;return 1};
 try{
  const core=createRenderCore(Config),events=new Map(),drawn=[];
  const ctx=new Proxy({measureText:s=>({width:s.length*12}),fillText:s=>drawn.push(s)},{get:(o,k)=>o[k]||(()=>{})});
  const canvas={style:{},width:0,height:0,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0}),addEventListener:(type,fn)=>events.set(type,fn)};
  const ui=mountCanvas(core,Config,{isPending:()=>pending,onTap:()=>false,drawEntry:()=>{},openRecords:()=>{}},{});ui.boot(canvas);
  const click=(x,y)=>events.get('click')({clientX:x,clientY:y});
  const tutorial=Config.SCENARIOS.findIndex(s=>s.id==='tutorial');click(48+(tutorial%3)*234+110,168+Math.floor(tutorial/3)*174+80);assert.equal(ui.getView().screen,'hero');
  const hero=Config.HEROES.findIndex(h=>h.name==='韩信');click(40+(hero%4)*170+80,194+Math.floor(hero/4)*170+90);assert.equal(ui.getView().screen,'game');
  const state=core.state,g=core.currentGame,stored=g.serialize(),fogIndex=g.board.findIndex(c=>c.fog),fogCount=g.board.filter(c=>c.fog).length;
  assert.ok(fogIndex>=0);click(69,1014);assert.equal(ui.getView().selCard,'调研');pending=true;click(160+fogIndex%4*110+50,140+Math.floor(fogIndex/4)*110+50);assert.equal(g.turn,1);assert.equal(g.board.filter(c=>c.fog).length,fogCount);
  pending=false;click(160+fogIndex%4*110+50,140+Math.floor(fogIndex/4)*110+50);assert.equal(g.turn,2);assert.equal(state.turn,2);assert.equal(core.state.actionsLeft,1);assert.equal(g.board.filter(c=>c.fog).length,fogCount-1);assert.equal(ui.getView().selCard,null);
  paint();assert.ok(drawn.some(s=>typeof s==='string'&&s.includes('第 2 回合')));
  core.restore(stored);ui.resume();assert.equal(core.currentGame.turn,1);assert.equal(core.currentGame.board.filter(c=>c.fog).length,fogCount);assert.equal(ui.getView().screen,'game');
  click(171,1014);assert.ok(ui.getView().resultOverlay?.status);assert.ok(['setback','defeat','victory','decisive'].includes(ui.getView().resultOverlay.status));
 }finally{globalThis.requestAnimationFrame=oldRAF}
});
