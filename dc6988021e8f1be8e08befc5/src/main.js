import {Game,ZONES} from './game.js';
import {Renderer,loadArt} from './render.js';
import {openStorage} from './storage.js';
import {Sound} from './audio.js';
export async function mount(root, context){
const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('./style.css',import.meta.url).href;document.head.append(style);document.title='Downtown Beatdown · 街头激斗';
const upstream='https://github.com/quiver-dev/template-beat-em-up/tree/ba9542d79b013b6446af1501f74dea3fcde0dcfc';
root.innerHTML=`
<header><div><div class="brand">DOWNTOWN <span>BEATDOWN</span></div><div class="edition">街头激斗 / BROWSER EDITION</div></div><nav class="toolbar" aria-label="游戏工具"><button class="quiet" id="sound" aria-pressed="true">声音 开</button><button class="quiet" id="fullscreen">全屏</button><button class="quiet" id="pause" disabled>暂停</button></nav></header>
<main class="layout"><section class="game-shell" id="shell" aria-label="游戏画面"><canvas id="game" tabindex="0" aria-label="街头激斗，方向键移动，X攻击，C跳跃，Escape暂停"></canvas>
<div class="hud" id="hud" hidden><div class="fighter"><div class="name-line"><span>CHAD</span><span id="hp">100 / 100</span></div><div class="health"><i id="health"></i></div></div><div class="zone"><span id="zone-number">01 / 03</span><strong id="zone-name">霓虹街口</strong></div><div class="score">SCORE<strong id="score">000000</strong></div></div>
<div class="overlay" id="overlay"><div class="intro"><div class="eyebrow" id="eyebrow">QUIVER ORIGINAL · WEB ADAPTATION</div><h1 id="title">DOWNTOWN<br><span>BEATDOWN</span></h1><p id="subtitle">穿过霓虹街头，用拳头终结这张账单。<br>三片街区，一场硬仗。准备好了吗？</p><div class="loading" id="loading"><i id="progress"></i></div><div class="actions"><button class="primary" id="start" disabled>加载素材…</button><button class="secondary" id="continue" hidden>继续上次游戏</button></div><div class="start-meta" id="record">单人闯关 · 键盘 / 触屏</div></div></div></section>
<div class="touch" aria-label="触屏操作"><div class="dpad"><button class="up" data-input="up" aria-label="向上">▲</button><button class="left" data-input="left" aria-label="向左">◀</button><button class="down" data-input="down" aria-label="向下">▼</button><button class="right" data-input="right" aria-label="向右">▶</button></div><div class="combat-buttons"><button data-input="jump" aria-label="跳跃">跳跃</button><button class="punch" data-input="attack" aria-label="攻击">攻击</button></div></div>
<div class="hint-mobile">横屏游玩更畅快 · 连按攻击打出连招 · 跳起后攻击使出飞踢</div>
<div class="bottom-bar"><div class="save-info"><span class="status" id="save-status" role="status">连接云存档…</span><button class="quiet" id="save" disabled>保存进度</button><button class="quiet" id="reload-save" hidden>重新读取</button></div><div class="instructions"><span><kbd>← ↑ ↓ →</kbd> / <kbd>WASD</kbd> 移动</span><span><kbd>X</kbd> / <kbd>J</kbd> 连击</span><span><kbd>C</kbd> / <kbd>K</kbd> 跳跃</span><span><kbd>ESC</kbd> 暂停</span></div></div>
<footer class="details"><div><strong>每一拳，都算数。</strong><br>自动保存街区进度，也可随时手动保存。</div><div>原作与美术：<a href="${upstream}" target="_blank" rel="noreferrer">Quiver</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a><br><button class="credits-button" id="credits">署名、许可与改动说明 ↗</button></div></footer></main>
<dialog id="credits-dialog"><h2>署名与许可</h2><p><strong>Downtown Beatdown</strong> 原作与美术由 Quiver 提供。本应用基于 <a href="${upstream}" target="_blank" rel="noreferrer">quiver-dev/template-beat-em-up</a> 的公开版本制作。</p><p>上游代码：<a href="${new URL('../licenses/Quiver-MIT.txt',import.meta.url)}" target="_blank">MIT License · Copyright © 2022 Quiver</a>。上游声明全部美术、音乐、音效采用 <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>。</p><p>本版复用了角色和场景美术，选择动画帧、缩小纹理并转为 WebP，重新编排场景；以 JavaScript / Canvas 改编战斗，增加触屏操作与 SQLite 存档。此版本未使用上游音频，配乐与音效由新增代码实时合成。未分发上游字体。</p><p>素材可依 CC BY 4.0 使用和改编，请保留作者署名、来源、许可链接与改动说明。此改编不表示 Quiver 对本应用或 Tiana 提供背书。</p><p><a href="${new URL('../ATTRIBUTION.md',import.meta.url)}" target="_blank">完整许可与来源清单</a> · <a href="https://creativecommons.org/licenses/by/4.0/legalcode" target="_blank" rel="noreferrer">CC BY 4.0 法律文本</a></p><div class="close-row"><button class="primary" id="close-credits">返回游戏</button></div></dialog>`;
const $=id=>document.getElementById(id),input={},sound=new Sound();let renderer,storage,profile={run:null,best:0,wins:0,sound:true},menu='title',ready=false,saving=Promise.resolve(),saveGeneration=0;
function status(text,error=false){$('save-status').textContent=text;$('save-status').classList.toggle('error',error);}
function clearInput(){for(const key of Object.keys(input))delete input[key];document.querySelectorAll('.pressed').forEach(b=>b.classList.remove('pressed'));}
const game=new Game({onEvent:(name)=>{sound.event(name);if(name==='won'){profile.wins++;profile.best=Math.max(profile.best,game.state.score);showMenu('won');save();}else if(name==='lost'){profile.best=Math.max(profile.best,game.state.score);showMenu('lost');save();}else if(name==='checkpoint'||name==='start')save();}});
function record(){const checkpoint=profile.run?.status==='playing'?` · 存档：${ZONES[profile.run.zone]}`:'';$('record').textContent=`最高分 ${String(profile.best).padStart(6,'0')} · 通关 ${profile.wins} 次${checkpoint}`;}
function showMenu(type){menu=type;game.paused=true;clearInput();$('overlay').hidden=false;$('pause').textContent='暂停';
 if(type==='pause'){$('eyebrow').textContent='TAKE A BREATHER';$('title').innerHTML='稍事休息<span>。</span>';$('subtitle').textContent='街头在等你。继续连击，或跳起来躲开敌人的攻击。';$('start').textContent='继续战斗';$('continue').textContent='重新开始';$('continue').hidden=false;}
 else if(type==='won'||type==='lost'){$('eyebrow').textContent=type==='won'?'STREETS CLEARED':'ONE MORE ROUND';$('title').innerHTML=type==='won'?'街头，<br><span>属于你。</span>':'再来，<br><span>还没完。</span>';$('subtitle').textContent=`本局 ${game.state.score} 分 · 击败 ${game.state.kills} 人 · 最高 ${game.state.maxCombo} 连击`;$('start').textContent='再战一局';$('continue').hidden=true;}
 else{$('eyebrow').textContent='QUIVER ORIGINAL · WEB ADAPTATION';$('title').innerHTML='DOWNTOWN<br><span>BEATDOWN</span>';$('subtitle').innerHTML='穿过霓虹街头，用拳头终结这张账单。<br>三片街区，一场硬仗。准备好了吗？';$('start').textContent='开始新游戏';$('continue').textContent='继续上次游戏';$('continue').hidden=profile.run?.status!=='playing';}
 record();
}
function resume(){menu=null;game.paused=false;$('overlay').hidden=true;$('hud').hidden=false;$('pause').disabled=false;$('pause').textContent='暂停';$('game').focus({preventScroll:true});}
async function start(){await sound.unlock();if(menu==='pause')resume();else{game.start();resume();}}
function pause(){if(!game.state||game.state.status!=='playing')return;if(game.paused){resume();sound.unlock();}else{showMenu('pause');save();}}
function save(){
 if(!storage){status('云存档未连接；本局尚未保存',true);$('reload-save').hidden=false;return Promise.resolve();}
 const data={...profile,run:game.state?game.snapshot():profile.run,sound:sound.enabled};profile=data;record();const generation=++saveGeneration;status('正在保存…');$('save').disabled=true;
 const task=saving.then(()=>storage.save(data));saving=task.catch(()=>{});
 return task.then(()=>{if(generation!==saveGeneration)return;status('已保存 · '+new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}));$('reload-save').hidden=true;},()=>{if(generation!==saveGeneration)return;status('存档结果未确认；请重新读取核对',true);$('reload-save').hidden=false;}).finally(()=>{if(generation===saveGeneration)$('save').disabled=false;});
}
async function readSave(){
 try{storage=await openStorage();const saved=await storage.read();if(saved)profile=saved.data;sound.enabled=profile.sound;$('sound').textContent='声音 '+(sound.enabled?'开':'关');$('sound').setAttribute('aria-pressed',String(sound.enabled));status(saved?'云存档已读取 · '+new Date(saved.updatedAt).toLocaleString('zh-CN'):'云存档已连接');$('reload-save').hidden=true;$('save').disabled=false;if(ready){game.state=null;game.paused=true;$('hud').hidden=true;$('pause').disabled=true;showMenu('title');}}
 catch(e){status('云存档暂不可用；本局尚未保存',true);$('reload-save').hidden=false;console.error('Save connection:',e.message);}
}
$('start').onclick=start;$('continue').onclick=async()=>{await sound.unlock();if(menu==='pause'){game.start();resume();}else if(profile.run){game.restore(profile.run);resume();}};$('pause').onclick=pause;$('save').onclick=save;
$('reload-save').onclick=async()=>{if(game.state&&!game.paused)showMenu('pause');await saving;await readSave();};
$('sound').onclick=async()=>{await sound.unlock();sound.enabled=!sound.enabled;profile.sound=sound.enabled;$('sound').textContent='声音 '+(sound.enabled?'开':'关');$('sound').setAttribute('aria-pressed',String(sound.enabled));save();};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await (matchMedia('(pointer:coarse)').matches?document.documentElement:$('shell')).requestFullscreen();}catch{status('当前浏览器不支持全屏；可以横屏游玩',true);}};
$('credits').onclick=()=>{if(game.state&&!game.paused)showMenu('pause');$('credits-dialog').showModal();};$('close-credits').onclick=()=>$('credits-dialog').close();
const keyMap={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',KeyA:'left',KeyD:'right',KeyW:'up',KeyS:'down',KeyX:'attack',KeyJ:'attack',KeyC:'jump',KeyK:'jump',Space:'jump'};
function press(action){if(action==='attack')game.attack();else if(action==='jump')game.jump();else input[action]=true;}
window.addEventListener('keydown',e=>{if($('credits-dialog').open)return;if(e.code==='Escape'){e.preventDefault();if(!e.repeat)pause();return;}const action=keyMap[e.code];if(!action||game.paused)return;e.preventDefault();if(!e.repeat)press(action);});
window.addEventListener('keyup',e=>{const action=keyMap[e.code];if(action)delete input[action];});
for(const button of document.querySelectorAll('[data-input]')){button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);button.classList.add('pressed');press(button.dataset.input);});const release=()=>{delete input[button.dataset.input];button.classList.remove('pressed');};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);}
window.addEventListener('blur',()=>{clearInput();if(game.state&&!game.paused)pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(game.state&&!game.paused)pause();}});
try{
 const [art]=await Promise.all([loadArt(context.files, fraction=>{$('progress').style.width=`${fraction*100}%`;$('start').textContent=`加载素材 ${Math.round(fraction*100)}%`;}),readSave()]);renderer=new Renderer($('game'),art);ready=true;$('loading').hidden=true;$('start').disabled=false;showMenu('title');
 let previous=performance.now(),accumulator=0;
 function frame(now){const dt=Math.max(0,Math.min((now-previous)/1000,.1));previous=now;accumulator+=dt;while(accumulator>=1/60){game.step(1/60,input);accumulator-=1/60;}renderer.draw(game,dt);sound.update(!game.paused&&game.state?.status==='playing');
  if(game.state){const s=game.state;$('hp').textContent=`${s.player.hp} / 100`;$('health').style.width=s.player.hp+'%';$('zone-number').textContent=`0${s.zone+1} / 03`;$('zone-name').textContent=ZONES[s.zone];$('score').textContent=String(s.score).padStart(6,'0');}
  requestAnimationFrame(frame);
 }requestAnimationFrame(frame);
}catch(e){$('start').textContent='加载失败';$('subtitle').textContent='素材加载失败，请刷新页面重试。';status(e.message,true);console.error(e);}

}
