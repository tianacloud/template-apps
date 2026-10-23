import {StableWrite} from './save.js';
import {Session,colors,labels,shapeNames,requirement} from './rules.js';
import {sql} from './db.js';
import {layout} from './layout.js';
import css from './style.css';

document.head.appendChild(Object.assign(document.createElement('style'),{textContent:css}));
document.querySelector('#app').innerHTML=layout;
const $=id=>document.getElementById(id);
const screens={intro:$('s-intro'),play:$('s-play'),over:$('s-over')};
const INKS=['#c0333b','#8a5f00','#0b7444','#1c5aa8','#6a3cd0'];
const SHAPES={...shapeNames,L:'L 形折角'};
const PM_LINES=['这个需求很简单，今天能上吧？','颜色不对，换一个。','往旁边挪挪，别贴边。','还是第一版好，改回去。','老板刚开完会，说要更有科技感。','参考一下竞品（发来一张图）。','我觉得可以再优化一下。','就调一点点，五分钟的事。','客户很急，先出个效果图。','这个不够明显，再大一点。'];
const RANKS=[
 {min:1200,title:'甲方克星 · 需求免疫体',line:'你交付的不是代码，是对方的沉默。'},
 {min:900,title:'资深接锅侠',line:'改了八版不改心情，客户已经不敢再提需求。'},
 {min:600,title:'熟练工',line:'活儿干得漂亮，就是不太想再改了。'},
 {min:300,title:'正式员工 · 试用期第四天',line:'需求能读懂，手速还需要一点时间。'},
 {min:0,title:'实习生 · 今天刚配好环境',line:'没关系，第一版永远是这样。'}
];
let game=null,screen='intro',tool=0,painting=false,lastPaintIdx=-1,frame=0;
let runWrite=null,saved=false,saveBusy=false,saveError='',runs=[],historyKnown=false,currentId=null,uiEpoch=0;
let historyReadVersion=0,historyLoadBusy=false,historyError=false;
let audioCtx=null,soundOn=true;
const cells=[],miniCells=[],demoCells=[];
const pick=a=>a[Math.floor(Math.random()*a.length)];
function preference(name,fallback){try{return localStorage.getItem(name)??fallback}catch{return fallback}}
function storePreference(name,value){try{localStorage.setItem(name,value)}catch{}}
document.documentElement.dataset.theme=preference('reqsim-theme','light')==='dark'?'dark':'light';
soundOn=preference('reqsim-sound','1')!=='0';
function renderTheme(){const dark=document.documentElement.dataset.theme==='dark';$('btn-theme').textContent=dark?'🌙 深色':'☀ 浅色';$('btn-theme').setAttribute('aria-pressed',String(dark));document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#0a0d0c':'#f5f7f4')}
function renderSound(){$('btn-sound').textContent=soundOn?'🔊 音效 ON':'🔇 音效 OFF';$('btn-sound').setAttribute('aria-pressed',String(soundOn))}
function ensureAudio(){if(!audioCtx)try{const AC=window.AudioContext||window.webkitAudioContext;if(AC)audioCtx=new AC()}catch{}}
function tone(freq,type,vol,dur){if(!audioCtx||!soundOn)return;try{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.value=vol;o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);o.stop(audioCtx.currentTime+dur+.02)}catch{}}
function tone2(freq){tone(freq,'sine',.05,.18)}
function tickSound(){tone(760+Math.random()*140,'square',.011,.04)}
$('btn-sound').onclick=()=>{soundOn=!soundOn;storePreference('reqsim-sound',soundOn?'1':'0');renderSound();if(soundOn){ensureAudio();tone2(660)}};
$('btn-theme').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;storePreference('reqsim-theme',t);renderTheme();if(soundOn){ensureAudio();tone2(520)}};
for(let i=0;i<64;i++){
 const cell=document.createElement('div');cell.className='cell';cell.dataset.i=String(i);cell.setAttribute('role','gridcell');cell.setAttribute('aria-label',`第${Math.floor(i/8)+1}行第${i%8+1}列`);$('board').append(cell);cells.push(cell);
 const mini=document.createElement('i');$('mini').append(mini);miniCells.push(mini);
 const demo=document.createElement('div');demo.className='dcell';$('demo-grid').append(demo);demoCells.push(demo);
}
for(let i=0;i<6;i++){
 const erase=i===5,b=document.createElement('button');b.type='button';b.className='sw'+(erase?' erase':'');b.dataset.tool=erase?'erase':String(i);b.setAttribute('aria-label',erase?'橡皮':labels[i]);b.setAttribute('aria-pressed',String(i===0));if(!erase)b.style.setProperty('--c',colors[i]);const k=document.createElement('span');k.className='k';k.textContent=erase?'X':String(i+1);b.append(k);b.onclick=()=>setTool(erase?null:i);$('tools').append(b);
}
function setTool(next){tool=next;for(const b of $('tools').querySelectorAll('.sw'))b.setAttribute('aria-pressed',String(b.dataset.tool===(tool===null?'erase':String(tool))))}
function renderCell(i){const c=game?.board[i];cells[i].classList.toggle('on',c!==null&&c!==undefined);cells[i].style.background=c===null||c===undefined?'':colors[c]}
function renderBoard(){for(let i=0;i<64;i++)renderCell(i)}
function paintCell(i){if(screen!=='play'||!game||game.over||!Number.isInteger(i)||i<0||i>=64||game.board[i]===tool)return;game.board[i]=tool;renderCell(i);tickSound()}
function lineCells(a,b){const out=[];let x=a%8,y=Math.floor(a/8);const x1=b%8,y1=Math.floor(b/8),dx=Math.abs(x1-x),dy=Math.abs(y1-y),sx=x<x1?1:-1,sy=y<y1?1:-1;let err=dx-dy;for(;;){out.push(y*8+x);if(x===x1&&y===y1)break;const e2=2*err;if(e2>-dy){err-=dy;x+=sx}if(e2<dx){err+=dx;y+=sy}}return out}
function paintAt(e){const el=document.elementFromPoint(e.clientX,e.clientY);if(!el||el.dataset.i===undefined)return;const i=Number(el.dataset.i);if(lastPaintIdx>=0&&lastPaintIdx!==i)lineCells(lastPaintIdx,i).forEach(paintCell);else paintCell(i);lastPaintIdx=i}
$('board').addEventListener('pointerdown',e=>{if(screen!=='play')return;painting=true;lastPaintIdx=-1;try{$('board').setPointerCapture(e.pointerId)}catch{}paintAt(e);e.preventDefault()});
$('board').addEventListener('pointermove',e=>{if(painting)paintAt(e)});
window.addEventListener('pointerup',()=>{painting=false;lastPaintIdx=-1});window.addEventListener('pointercancel',()=>{painting=false;lastPaintIdx=-1});
function positionName(r){const v=r.row===0?'上':r.row+r.h===8?'下':'中',h=r.col===0?'左':r.col+r.w===8?'右':'中';return v==='中'&&h==='中'?'画面正中间':v==='中'?h+'侧居中':h==='中'?v+'方居中':h+v+'角'}
function specText(r){return `${positionName(r)} · ${r.w}×${r.h} ${labels[r.color]}${SHAPES[r.kind]}`}
function setSpec(el,r){el.replaceChildren();const p=document.createElement('span');p.className='accent';p.textContent=positionName(r);const c=document.createElement('span');c.className='cname';c.style.setProperty('--sw',colors[r.color]);c.style.setProperty('--sw-ink',INKS[r.color]);c.textContent=labels[r.color];el.append(p,document.createTextNode(` · ${r.w}×${r.h} `),c,document.createTextNode(SHAPES[r.kind]))}
function announce(s){$('live').textContent=s}
function renderMini(r){const target=new Set(r.cells);for(let i=0;i<64;i++){miniCells[i].classList.toggle('on',target.has(i));if(target.has(i))miniCells[i].style.setProperty('--mc',colors[r.color]);else miniCells[i].style.removeProperty('--mc')}}
function showRequirement(first,forced){const r=game.req;$('ticket-no').textContent=String(game.ticket).padStart(3,'0');setSpec($('spec'),r);$('hint').textContent={L:'竖线贴左边，横线贴底边',diag:'从左上角连到右下角',cross:'一横一竖，交叉在中心',frame:'只有最外面一圈，中间是空的',checker:'左上角那一格是涂色的，其余交错',heart:'顶部两个凸起是心瓣，底部收成一个尖'}[r.kind]||'';renderMini(r);const em=document.createElement('em');em.textContent='甲方：';$('pm').replaceChildren(em,document.createTextNode(first?'先按这个来，很简单。':forced?'不等了，我自己改了：'+pick(PM_LINES):pick(PM_LINES)));announce((first?'第一单需求：':forced?'甲方改需求了：':'新需求：')+specText(r))}
function restartClass(el,name){el.classList.remove(name);void el.offsetWidth;el.classList.add(name)}
function flash(p,s,color){$('flash-p').textContent=p;$('flash-p').style.color=color;$('flash-s').textContent=s;restartClass($('flash'),'show')}
function deliver(){
 if(screen!=='play'||!game)return;const r=game.deliver(performance.now());if(!r){if(game.over)endGame();return}
 $('hud-score').textContent=String(game.score);const color=r.pct>=90?'var(--green)':r.pct>=70?'var(--amber)':'var(--red)';$('float').textContent='+'+r.gain;$('float').style.color=color;restartClass($('float'),'go');restartClass($('hud-score'),'pulse');
 let msg=r.pct>=100?'一次过，甲方居然没意见':r.pct>=90?(r.extra>0?'过了，但画布上还留着上一版的残骸':'过了，甲方说『再微调一下』'):r.pct>=70?'勉强收下，返工边缘':r.missing>=r.extra?'被打回：图形没画全':'被打回：『这不是我要的感觉』';if(r.pct<100){const diff=[];if(r.missing)diff.push('少 '+r.missing+' 格');if(r.extra)diff.push('多 '+r.extra+' 格');if(diff.length)msg+='（'+diff.join('，')+'）'}
 flash((r.pct>=100?'完美交付 · ':'还原度 ')+r.pct+'%',r.pct>=90&&game.combo>1?msg+' · 连击 ×'+game.combo:msg,color);if(r.pct<70)restartClass($('board'),'shake');tone2(r.pct>=90?880:320);showRequirement(false,false);
}
function show(name){screen=name;for(const [key,el]of Object.entries(screens))el.hidden=key!==name;window.scrollTo(0,0)}
function saveLocked(){return saveBusy||Boolean(runWrite&&!saved)}
function startGame(){if(saveLocked())return;ensureAudio();stopDemo();cancelAnimationFrame(frame);game=new Session(performance.now());runWrite=null;saved=false;saveBusy=false;saveError='';currentId=null;painting=false;lastPaintIdx=-1;renderBoard();$('hud-score').textContent='0';$('hud-score').classList.remove('pulse');$('t-num').classList.remove('tnum-danger');$('flash').classList.remove('show');setTool(0);show('play');showRequirement(true,false);renderSaveState();tick()}
function tick(){if(screen!=='play'||!game)return;const now=performance.now(),state=game.tick(now),left=game.remaining(now);if(state==='end'){$('t-num').textContent='0.0';$('t-fill').style.width='0%';endGame();return}$('t-num').textContent=(left/1000).toFixed(1);$('t-num').classList.toggle('tnum-danger',left<5100);$('t-fill').style.width=(left/45000*100)+'%';$('t-bar').className='bar'+(left/45000<.2?' danger':left/45000<.45?' warn':'');if(state==='changed'){showRequirement(false,true);flash('甲方自己改了需求','未交付的部分全部作废','var(--red)');tone2(240)}frame=requestAnimationFrame(tick)}
function clearBoard(){if(screen!=='play')return;game.board.fill(null);renderBoard()}
function reroll(){if(screen!=='play')return;game.reroll(performance.now());showRequirement(false,true);tone2(340)}
function bestScore(){return runs.length?Number(runs[0].score)||0:0}
function refreshBest(){const el=$('best-line');el.replaceChildren();const b=bestScore();if(b>0){const strong=document.createElement('b');strong.textContent=b+' 分';el.append(document.createTextNode('历史最高 '),strong)}else el.textContent='还没有记录，第一单就是你的基准线。'}
function summaryOf(row){try{return typeof row.summary==='string'?JSON.parse(row.summary):row.summary||{}}catch{return {}}}
function renderLeaderboard(){
 $('lb-rows').replaceChildren();if(!runs.length){const empty=document.createElement('div');empty.className='lb-row';empty.textContent='还没有记录';$('lb-rows').append(empty);return}
 runs.forEach((r,i)=>{const row=document.createElement('div');row.className='lb-row'+(r.id===currentId?' me':'');const rank=document.createElement('span'),score=document.createElement('span'),meta=document.createElement('span'),s=summaryOf(r);rank.className='rk';rank.textContent='#'+(i+1);score.className='sc';score.textContent=r.score+' 分';meta.className='mt';meta.textContent='还原度 '+(Number(s.accuracy)||0)+'% · '+(Number(s.deliveries)||0)+' 版';row.append(rank,score,meta);$('lb-rows').append(row)});
}
function renderHistoryControls(){for(const id of ['btn-reload-records','btn-reload-result-records']){$(id).hidden=!historyError;$(id).disabled=historyLoadBusy}}
async function loadHistory(){
 const epoch=uiEpoch,version=++historyReadVersion;historyLoadBusy=true;renderHistoryControls();
 const current=()=>epoch===uiEpoch&&version===historyReadVersion;
 try{const next=await sql('SELECT id,score,summary,created_at FROM challenge_runs ORDER BY score DESC LIMIT 5');if(!current())return;runs=next;historyKnown=true;historyError=false;refreshBest();renderLeaderboard()}
 catch{if(!current())return;historyKnown=false;historyError=true;$('best-line').textContent='个人记录暂未连接，重新读取后可继续核对。'}
 finally{if(current()){historyLoadBusy=false;renderSaveState()}}
}
function renderSaveState(){
 $('btn-again').disabled=saveLocked();$('btn-start').disabled=saveLocked();$('btn-retry-save').hidden=!saveError;$('btn-retry-save').disabled=saveBusy;renderHistoryControls();
 const el=$('cloud-state');el.hidden=screen!=='over'||(!saveBusy&&!saveError&&!historyError);el.classList.toggle('error',Boolean(saveError||historyError));el.textContent=saveBusy?'正在保存个人记录…':saveError||(historyError?(saved?'记录已保存，个人排行暂未读取，请重试。':'个人排行暂未读取，请重试。'):'');
}
function endGame(){
 if(screen!=='play'||!game)return;game.over=true;cancelAnimationFrame(frame);$('flash').classList.remove('show');const s=game.summary(),rank=RANKS.find(x=>s.score>=x.min),newRecord=historyKnown&&s.score>bestScore();$('rank-title').textContent=rank.title;$('final-score').textContent=String(s.score);$('st-deliver').textContent=String(s.deliveries);$('st-acc').textContent=s.accuracy+'%';$('st-combo').textContent=String(s.bestCombo);const b=document.createElement('b');b.textContent='评语：';$('verdict').replaceChildren(b,document.createTextNode(rank.line+'（45 秒内甲方自己动手改了 '+s.forced+' 次需求）'));$('rank-line').textContent=newRecord?'NEW RECORD · DELIVERY REPORT':'DELIVERY REPORT';show('over');tone2(520);setTimeout(()=>tone2(720),170);announce('本局结束，得分 '+s.score+' 分，'+rank.title);void saveCurrentRun();
}
async function saveCurrentRun(){
 if(screen!=='over'||!game||saved||saveBusy)return;const savingGame=game,epoch=uiEpoch;if(!runWrite){const summary=game.summary(),payload=JSON.stringify(summary),at=new Date().toISOString();runWrite=new StableWrite({read:'SELECT id FROM challenge_runs WHERE id=?',insert:'INSERT OR IGNORE INTO challenge_runs(id,score,summary,created_at) VALUES(?,?,?,?)',args:id=>[id,summary.score,payload,at]});currentId=runWrite.id}
 const write=runWrite;saveBusy=true;saveError='';renderSaveState();try{await write.run(sql);if(game===savingGame&&epoch===uiEpoch){saved=true;await loadHistory()}}catch(e){if(game===savingGame&&epoch===uiEpoch)saveError=e.message}finally{if(game===savingGame&&epoch===uiEpoch){saveBusy=false;renderSaveState()}}
}
$('btn-retry-save').onclick=()=>void saveCurrentRun();$('btn-reload-records').onclick=()=>void loadHistory();$('btn-reload-result-records').onclick=()=>void loadHistory();$('btn-start').onclick=startGame;$('btn-again').onclick=startGame;$('btn-deliver').onclick=deliver;$('btn-clear').onclick=clearBoard;$('btn-reroll').onclick=reroll;
$('btn-share').onclick=()=>{if(!game)return;const s=game.summary(),text=`我在《需求变更模拟器》拿了 ${s.score} 分（${$('rank-title').textContent}），交付 ${s.deliveries} 版，平均还原度 ${s.accuracy}%。45 秒，你能活下来吗？`,btn=$('btn-share');const done=()=>{btn.textContent='已复制 ✓';setTimeout(()=>btn.textContent='复制战绩',1600)};const fallback=()=>{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.append(ta);ta.select();try{if(document.execCommand('copy'))done();else btn.textContent='复制失败'}catch{btn.textContent='复制失败'}ta.remove()};if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(done,fallback);else fallback()};
document.addEventListener('keydown',e=>{if(e.target?.closest?.('#btn-retry-save,#btn-reload-records,#btn-reload-result-records'))return;if(screen!=='play'){if((screen==='intro'||screen==='over')&&(e.key==='Enter'||e.key===' ')){startGame();e.preventDefault()}return}const k=e.key.toLowerCase();if(k>='1'&&k<='5'){setTool(Number(k)-1);e.preventDefault()}else if(k==='x'){setTool(null);e.preventDefault()}else if(k==='r'){clearBoard();e.preventDefault()}else if(k===' '||k==='enter'){deliver();e.preventDefault()}});
window.addEventListener('beforeunload',e=>{if(saveLocked()){e.preventDefault();e.returnValue=''}});
let demoGeneration=0,demoTimer=0,demoPainter=0,demoSeconds=0;
const demoTimeouts=new Set();
function stopDemo(){demoGeneration++;clearInterval(demoTimer);clearInterval(demoPainter);for(const id of demoTimeouts)clearTimeout(id);demoTimeouts.clear()}
function scheduleDemo(fn,ms,generation){const id=setTimeout(()=>{demoTimeouts.delete(id);if(generation===demoGeneration)fn()},ms);demoTimeouts.add(id)}
function demoRound(generation){
 if(generation!==demoGeneration)return;const r=requirement();setSpec($('demo-spec'),r);$('demo-spec').querySelector('.accent').style.color='var(--green)';$('demo-foot').textContent='甲方：'+pick(PM_LINES);let k=0;
 demoPainter=setInterval(()=>{if(generation!==demoGeneration){clearInterval(demoPainter);return}if(k>=r.cells.length){clearInterval(demoPainter);scheduleDemo(()=>{$('demo-foot').textContent='交付验收 → 还原度 100% · 甲方满意';scheduleDemo(()=>{for(const cell of demoCells){cell.classList.remove('on');cell.style.background=''}scheduleDemo(()=>demoRound(generation),620,generation)},900,generation)},420,generation);return}const cell=demoCells[r.cells[k++]];cell.classList.add('on');cell.style.background=colors[r.color]},62);
}
function startDemo(){stopDemo();const generation=demoGeneration;for(const cell of demoCells){cell.classList.remove('on');cell.style.background=''}demoSeconds=0;$('demo-t').textContent='00:00';demoTimer=setInterval(()=>{$('demo-t').textContent='00:'+(++demoSeconds<10?'0':'')+demoSeconds},1000);demoRound(generation)}
function resetExperience(){uiEpoch++;historyReadVersion++;historyLoadBusy=false;historyError=false;cancelAnimationFrame(frame);stopDemo();game=null;runWrite=null;saved=false;saveBusy=false;saveError='';currentId=null;runs=[];historyKnown=false;tool=0;painting=false;lastPaintIdx=-1;soundOn=true;document.documentElement.dataset.theme='light';$('btn-share').textContent='复制战绩';renderTheme();renderSound();renderBoard();setTool(0);$('flash').classList.remove('show');show('intro');renderSaveState();void loadHistory();startDemo()}
renderTheme();renderSound();renderSaveState();refreshBest();renderLeaderboard();show('intro');void loadHistory();startDemo();
