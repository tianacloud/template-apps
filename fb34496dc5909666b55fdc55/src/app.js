
/* ---------- 代码雨背景 ---------- */
const cv=document.getElementById('rain'),ctx=cv.getContext('2d');
let cols,drops;const chars='01<>{}[];=/\\+$#@&*const if return fn 1234';
function resize(){cv.width=innerWidth;cv.height=innerHeight;
  cols=Math.floor(cv.width/16);drops=Array(cols).fill(0).map(()=>Math.random()*cv.height/20)}
resize();addEventListener('resize',resize);
setInterval(()=>{ctx.fillStyle='rgba(11,15,20,.12)';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.fillStyle='#2bd576';ctx.font='14px monospace';
  drops.forEach((y,i)=>{const t=chars[Math.floor(Math.random()*chars.length)];
    ctx.fillText(t,i*16,y*16);drops[i]=y*16>cv.height&&Math.random()>.975?0:y+1})},60);

/* ---------- 标签页 ---------- */
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(x=>x.classList.remove('show'));
  t.classList.add('active');document.getElementById('p-'+t.dataset.t).classList.add('show');
});

/* ---------- 简易哈希（同名同卡） ---------- */
function hash(s){let h=1024;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h}
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}

/* ---------- 身份卡 ---------- */
const titles=[['架构之神','🏛️'],['全栈战神','⚔️'],['Bug 终结者','🗡️'],['深夜修仙工程师','🌙'],
  ['AI 驯兽师','🤖'],['开源布道者','📢'],['摸鱼学博士','🐟'],['递归诗人','📜'],['胶囊咖啡驱动机','☕'],['像素炼金术士','✨']];
const mottos=['Talk is cheap. Show me the code. — Linus','它在我机器上是好的。','能跑就行，别动了。',
  '这个需求很简单，怎么实现我不管。','程序员最讨厌四件事：写注释、写文档、别人不写注释、别人不写文档。',
  '删库一分钟，跑路更轻松。','世上本没有 Bug，写的人多了，也便有了 Bug。','代码能编译的瞬间，我是幸福的。'];
function genCard(){
  const name=document.getElementById('nickname').value.trim();
  if(!name){document.getElementById('nickname').focus();return}
  const lang=document.getElementById('lang').value||['JavaScript','Python','Java','Go','Rust','TypeScript'][hash(name)%6];
  const r=rng(hash(name));
  const pick=a=>a[Math.floor(r()*a.length)];
  const [ti,emoji]=pick(titles);
  const yrs=(1+r()*14).toFixed(0), bugs=(r()*40).toFixed(1), hair=Math.round(30+r()*70),
        coffee=(2+r()*8).toFixed(1), salary=(12+Math.round(r()*48));
  const bar=(v,c)=>`<div class="bar"><i style="width:${v}%;background:${c}"></i></div>`;
  document.getElementById('avatar').textContent=emoji;
  document.getElementById('cname').textContent=name;
  document.getElementById('ctitle').textContent=`${lang} · ${ti}`;
  document.getElementById('cardno').textContent='NO.'+String(hash(name)%9000+1000);
  document.getElementById('cstats').innerHTML=`
    <div class="stat"><div class="k">⌨️ 码龄</div><div class="v">${yrs} 年</div></div>
    <div class="stat"><div class="k">💰 身价</div><div class="v" style="color:var(--amber)">${salary}k/月</div></div>
    <div class="stat"><div class="k">🐛 年产 Bug</div><div class="v" style="color:var(--red)">${bugs} 个/k行</div></div>
    <div class="stat"><div class="k">🦱 发际线健康度</div><div class="v">${hair}</div>${bar(hair,hair>60?'var(--green)':'var(--red)')}</div>
    <div class="stat"><div class="k">☕ 日均咖啡</div><div class="v">${coffee} 杯</div></div>
    <div class="stat"><div class="k">🔥 熬夜指数</div><div class="v">${Math.round(20+r()*80)}</div></div>`;
  document.getElementById('cmotto').textContent=pick(mottos);
  document.getElementById('idcard').style.display='block';
  document.getElementById('idcard').scrollIntoView({behavior:'smooth',block:'nearest'});
}

/* ---------- 码生模拟器 ---------- */
const S={money:10,hair:100,happy:80,fame:50,year:1,step:0,done:false};
const $=id=>document.getElementById(id);
function paint(){ $('st-money').textContent=S.money+'k';$('st-hair').textContent=S.hair;
  $('st-happy').textContent=S.happy;$('st-fame').textContent=S.fame;$('st-year').textContent='第 '+S.year+' 年'}
function log(txt,cls=''){const d=document.createElement('div');d.className='line '+cls;
  d.textContent=txt;const L=$('log');L.appendChild(d);L.scrollTop=L.scrollHeight}
function clamp(){S.hair=Math.max(0,Math.min(100,S.hair));S.happy=Math.max(0,Math.min(100,S.happy));
  S.fame=Math.max(0,Math.min(100,S.fame));S.money=Math.max(3,S.money)}
/* 每年两个事件，共 10 年 */
const events=[
 {t:'毕业季：拿到了两份 Offer',c:[
   {x:'🏢 大厂 offer：钱多活多 996',f:()=>{S.money=25;S.hair-=15;S.happy-=10;S.fame+=10;log('你选择了大厂，薪资翻倍，头发开始离家出走。','ev')}},
   {x:'🌱 创业公司：钱少但能全栈成长',f:()=>{S.money=14;S.fame+=3;S.happy+=8;log('你加入创业公司，什么都干，什么都学。','ev')}}]},
 {t:'上线前夜，测试环境突然崩了',c:[
   {x:'🛠️ 熬夜排查到凌晨四点',f:()=>{log('凌晨四点，你找到了那个少写一个分号的循环。','good');S.fame+=12;S.hair-=10;S.happy-=8}},
   {x:'🚪 先回滚，明天再说',f:()=>{log('回滚保平安，但锅还是落在你的 Jira 上。','dim');S.fame-=6;S.happy+=4}}]},
 {t:'公司想让你转管理岗',c:[
   {x:'👔 接受：带团队，告别一线代码',f:()=>{S.money+=15;S.fame+=10;S.hair+=5;log('你成了 Leader，代码越写越少，会议越开越多。','ev')}},
   {x:'⌨️ 拒绝：我生来就是写代码的',f:()=>{S.happy+=12;S.fame+=4;log('你拒绝了管理岗，键盘就是你的剑。','good')}}]},
 {t:'一个大版本上线，全网热搜——因为出了事故',c:[
   {x:'🔥 主动扛下责任，带队 48 小时修复',f:()=>{S.fame+=18;S.hair-=12;S.happy-=10;S.money+=5;log('你成了公司传说：那个 48 小时没合眼的人。','good')}},
   {x:'🤫 默默把锅甩给第三方依赖',f:()=>{log('“上游库的问题”——你在周报里这样写。','warn');S.fame-=10;S.happy+=6}}]},
 {t:'AI 编程助手全面普及，同事开始焦虑',c:[
   {x:'🤖 拥抱 AI：学习提示词工程，效率翻倍',f:()=>{S.money+=12;S.happy+=10;S.fame+=8;log('你和 AI 双剑合璧，一个人干一个团队的活。','good')}},
   {x:'🐢 观望：手写代码才是真功夫',f:()=>{S.happy+=3;S.fame-=4;log('你依然手写每一行 for 循环，像一位坚守阵地的老兵。','dim')}}]},
 {t:'猎头来电：竞争对手双倍薪资挖你',c:[
   {x:'💸 跳槽：双倍薪资，从头再来',f:()=>{S.money=Math.round(S.money*2);S.happy+=8;S.fame-=4;log('你跳了。新工牌到手，旧群里悄悄潜水。','ev')}},
   {x:'🏠 留下：老团队，老兄弟',f:()=>{S.money+=6;S.happy+=5;log('你留下了，老板请全组吃了顿火锅。','good')}}]},
 {t:'开源项目突然火了，每天几百个 Issue',c:[
   {x:'🌟 全力维护：写文档、修 Bug、回邮件',f:()=>{S.fame+=20;S.hair-=10;S.happy-=5;log('你的 GitHub 星标破万， README 被翻译成 9 种语言。','good')}},
   {x:'📦 归档：感谢关注，项目停止维护',f:()=>{S.happy+=10;S.fame-=6;log('你写下「不再维护」，然后关掉了通知。','warn')}}]},
 {t:'体检报告：颈椎变直，脂肪肝前期',c:[
   {x:'🏃 开始健身：每周三练，戒掉夜宵',f:()=>{S.hair+=10;S.happy+=8;S.money-=2;log('你办了健身卡，居然真的去了。奇迹。','good')}},
   {x:'💊 无视：忙完这个版本再说',f:()=>{S.hair-=8;S.happy-=5;log('“忙完这个版本再说”——你今年说了六次。','bad')}}]},
 {t:'公司裁员传闻四起',c:[
   {x:'🧳 主动谈优化，拿 N+1 休息半年',f:()=>{S.money+=8;S.happy+=12;S.fame-=3;log('你拿着赔偿去了大理，晒了一个月的太阳。','ev')}},
   {x:'💪 硬刚：用绩效证明自己不可替代',f:()=>{S.fame+=8;S.hair-=6;log('你连续三个月绩效第一，安全上岸。','good')}}]},
 {t:'最后一站：你收到了两封邮件',c:[
   {x:'🏆 某大厂 CTO Offer（年薪七位数）',f:()=>{S.money=Math.round(S.money*2.2);S.fame+=15;log('你点开了 CTO Offer，回了一句：谢谢，我考虑一下。','good')}},
   {x:'🌅 远程小公司 Offer：钱少，但每天四点半下班',f:()=>{S.money+=3;S.happy+=20;S.hair+=10;log('你选择了四点半下班的那个。有些东西比钱贵。','good')}}]}
];
function startSim(){
  Object.assign(S,{money:10,hair:100,happy:80,fame:50,year:1,step:0,done:false});
  $('sim-start').style.display='none';$('sim-play').style.display='block';
  $('endcard').style.display='none';$('log').innerHTML='';$('choices').innerHTML='';
  log('$ git init life && git commit -m "毕业"','dim');
  paint();nextStep();
}
function nextStep(){
  if(S.step>=events.length||S.hair<=0||S.happy<=0){return endSim()}
  const ev=events[S.step];
  log(`\n【第 ${S.year} 年】${ev.t}`,'ev');
  paint();
  const box=$('choices');box.innerHTML='';
  ev.c.forEach(ch=>{const b=document.createElement('button');b.className='choice';
    b.innerHTML=ch.x;b.onclick=()=>{ch.f();clamp();S.step++;S.year+=2;paint();
      box.innerHTML='';nextStep()};box.appendChild(b)});
}
function endSim(){
  $('choices').innerHTML='';paint();
  let rank,desc;
  if(S.hair<=0){rank='💀 秃头传说';desc='头发散尽还复来？不，不会复来的。但你成了行业传说：那位为代码献祭了全部毛囊的男人。'}
  else if(S.happy>=85){rank='🌳 人生赢家';desc='钱不多但刚刚好，头发还在，快乐很满。同事们说你活成了程序员不该有的样子——健康。'}
  else if(S.fame>=80){rank='⭐ 行业之光';desc='大会演讲、技术书籍、粉丝私信……你证明了敲代码的人也能被世界看见。'}
  else if(S.money>=60){rank='💎 财务自由预备役';desc='账户余额让你有底气说出那句名言：“这个需求我不想接。”'}
  else{rank='☕ 平凡而伟大的码农';desc='没有逆天改命，也没有一夜暴富。但你修过的每一个 Bug、上线的每一个版本，都是这个世界稳定运行的一部分。致敬每一位普通程序员。'}
  log('$ git log --oneline | wc -l','dim');
  log(`> 20 年，${1000+S.step*256} 次提交，无数个咖啡因驱动的夜晚。`,'dim');
  $('erank').textContent=rank;$('edesc').textContent=desc;
  $('endcard').style.display='block';
  $('endcard').scrollIntoView({behavior:'smooth',block:'nearest'});
}

document.getElementById("generate-card").addEventListener("click",genCard);
document.querySelectorAll("[data-start-sim]").forEach(button=>button.addEventListener("click",startSim));
