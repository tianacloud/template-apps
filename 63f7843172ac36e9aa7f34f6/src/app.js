const style = document.createElement("style");
style.textContent = "\n  :root{\n    --bg:#0a0e14; --panel:rgba(18,24,33,.86); --line:#1e2a38;\n    --neon:#3ddc97; --cyan:#36c5f0; --pink:#ff5d8f; --txt:#d7e2ee; --dim:#8aa0b4;\n  }\n  *{box-sizing:border-box;margin:0;padding:0}\n  html,body{height:100%}\n  body{\n    font-family:\"PingFang SC\",\"Microsoft YaHei\",-apple-system,system-ui,sans-serif;\n    background:var(--bg); color:var(--txt); overflow-x:hidden; line-height:1.6;\n  }\n  #rain{position:fixed;inset:0;z-index:0;opacity:.35}\n  .wrap{position:relative;z-index:1;max-width:640px;margin:0 auto;padding:28px 18px 60px}\n  .badge{\n    display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--neon);\n    border:1px solid var(--neon);border-radius:999px;padding:4px 12px;margin-bottom:18px;\n    background:rgba(61,220,151,.08);\n  }\n  h1{font-size:30px;line-height:1.25;letter-spacing:.5px;margin-bottom:8px;\n    background:linear-gradient(90deg,var(--neon),var(--cyan),var(--pink));\n    -webkit-background-clip:text;background-clip:text;color:transparent}\n  .sub{color:var(--dim);font-size:14px;margin-bottom:26px}\n  .card{background:var(--panel);border:1px solid var(--line);border-radius:18px;\n    padding:22px;backdrop-filter:blur(6px);box-shadow:0 12px 40px rgba(0,0,0,.4)}\n  .q{font-size:17px;font-weight:600;margin-bottom:4px}\n  .qno{color:var(--neon);font-size:13px;margin-bottom:14px;font-family:ui-monospace,monospace}\n  .opt{display:block;width:100%;text-align:left;background:rgba(255,255,255,.03);\n    border:1px solid var(--line);color:var(--txt);border-radius:12px;padding:13px 15px;\n    margin-bottom:11px;font-size:15px;cursor:pointer;transition:.18s;font-family:inherit}\n  .opt:hover{border-color:var(--neon);background:rgba(61,220,151,.08);transform:translateX(3px)}\n  .opt .k{color:var(--cyan);font-family:ui-monospace,monospace;margin-right:9px}\n  .progress{height:5px;background:var(--line);border-radius:99px;overflow:hidden;margin:6px 0 18px}\n  .progress>i{display:block;height:100%;background:linear-gradient(90deg,var(--neon),var(--cyan));\n    width:0;transition:width .3s}\n  .btn{display:block;width:100%;border:none;border-radius:12px;padding:15px;font-size:16px;\n    font-weight:700;cursor:pointer;color:#04130d;\n    background:linear-gradient(90deg,var(--neon),var(--cyan));font-family:inherit;transition:.2s}\n  .btn:hover{filter:brightness(1.08);transform:translateY(-1px)}\n  .btn.ghost{background:transparent;border:1px solid var(--line);color:var(--txt);font-weight:600}\n  .btn.ghost:hover{border-color:var(--cyan)}\n  .row{display:flex;gap:12px;margin-top:14px}\n  .row .btn{flex:1}\n  .hide{display:none}\n  .result .emoji{font-size:64px;text-align:center;margin:6px 0 4px}\n  .result h2{text-align:center;font-size:26px;margin-bottom:4px}\n  .result .tag{text-align:center;color:var(--neon);font-family:ui-monospace,monospace;font-size:13px;margin-bottom:14px}\n  .result p.desc{color:var(--txt);font-size:15px;margin-bottom:14px}\n  .result .line{background:rgba(54,197,240,.1);border-left:3px solid var(--cyan);\n    padding:11px 14px;border-radius:0 10px 10px 0;color:var(--cyan);font-size:14px;\n    font-family:ui-monospace,monospace;margin-bottom:18px}\n  .field{margin:14px 0}\n  .field label{display:block;font-size:13px;color:var(--dim);margin-bottom:6px}\n  .field input{width:100%;background:rgba(255,255,255,.04);border:1px solid var(--line);\n    border-radius:10px;padding:11px 13px;color:var(--txt);font-size:15px;font-family:inherit}\n  .field input:focus{outline:none;border-color:var(--neon)}\n  #poster{width:100%;max-width:320px;display:block;margin:6px auto 4px;border-radius:14px;\n    box-shadow:0 8px 30px rgba(0,0,0,.5)}\n  .tip{text-align:center;color:var(--dim);font-size:12px;margin-top:8px}\n  .foot{text-align:center;color:var(--dim);font-size:12px;margin-top:30px;line-height:1.8}\n  .foot code{color:var(--neon);background:rgba(61,220,151,.08);padding:1px 6px;border-radius:5px}\n  .toast{position:fixed;left:50%;bottom:40px;transform:translateX(-50%);background:#11161d;\n    border:1px solid var(--line);color:var(--txt);padding:11px 18px;border-radius:10px;\n    font-size:14px;z-index:50;opacity:0;transition:.25s;pointer-events:none}\n  .toast.show{opacity:1}\n";
document.head.appendChild(style);
document.getElementById("app").innerHTML = "\n<canvas id=\"rain\"></canvas>\n<div class=\"wrap\">\n  <div class=\"badge\">⌨️ 代码人格测试</div>\n\n  <!-- 首页 -->\n  <div id=\"home\">\n    <h1>代码人格生成器</h1>\n    <div class=\"sub\">9 道程序梗，算出你是哪种程序员。生成专属海报，一键带走上分。</div>\n    <div class=\"card\">\n      <p style=\"color:var(--dim); font-size:14px; margin-bottom:16px\">用九道趣味题探索你的代码人格。</p>\n      <button class=\"btn\" id=\"startBtn\">开始测一测 →</button>\n    </div>\n  </div>\n\n  <!-- 答题 -->\n  <div class=\"hide\" id=\"quiz\">\n    <div class=\"card\">\n      <div class=\"qno\" id=\"qno\"></div>\n      <div class=\"q\" id=\"qtext\"></div>\n      <div class=\"progress\"><i id=\"bar\"></i></div>\n      <div id=\"opts\"></div>\n    </div>\n  </div>\n\n  <!-- 结果 -->\n  <div class=\"result hide\" id=\"result\">\n    <div class=\"card\">\n      <div class=\"emoji\" id=\"rEmoji\"></div>\n      <h2 id=\"rName\"></h2>\n      <div class=\"tag\" id=\"rTag\"></div>\n      <p class=\"desc\" id=\"rDesc\"></p>\n      <div class=\"line\" id=\"rLine\"></div>\n\n      <div class=\"field\">\n        <label>给海报署个名（可空，默认「匿名程序员」）</label>\n        <input id=\"nick\" maxlength=\"12\" placeholder=\"例如：星蓝\">\n      </div>\n\n      <canvas height=\"800\" id=\"poster\" width=\"640\"></canvas>\n      <div class=\"tip\">↑ 你的专属代码人格海报，可下载分享</div>\n\n      <div class=\"row\">\n        <button class=\"btn\" id=\"dlBtn\">下载海报 PNG</button>\n      </div>\n      <div class=\"row\">\n        <button class=\"btn ghost\" id=\"shareBtn\">复制分享文案</button>\n        <button class=\"btn ghost\" id=\"againBtn\">再测一次</button>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"foot\">\n    代码人格生成器<br>\n    结果仅在当前页面保留\n  </div>\n</div>\n<div class=\"toast\" id=\"toast\"></div>\n\n";

/* ===== 代码雨背景 ===== */
(function(){
  const c=document.getElementById('rain'),x=c.getContext('2d');
  let W,H,cols,drops;
  const chars="01ABCDEF{}[]</>();=+-*#$%&10КОД".split("");
  function init(){
    W=c.width=innerWidth;H=c.height=innerHeight;
    cols=Math.floor(W/16);drops=Array(cols).fill(0).map(()=>Math.random()*H/16);
  }
  function draw(){
    x.fillStyle="rgba(10,14,20,.10)";x.fillRect(0,0,W,H);
    x.font="14px ui-monospace,monospace";
    for(let i=0;i<cols;i++){
      const t=chars[(Math.random()*chars.length)|0];
      const y=drops[i]*16;
      x.fillStyle=Math.random()<.04?"#3ddc97":"#1c5a45";
      x.fillText(t,i*16,y);
      if(y>H&&Math.random()>.975)drops[i]=0;else drops[i]++;
    }
    requestAnimationFrame(draw);
  }
  addEventListener('resize',init);init();draw();
})();

/* ===== 题库 ===== */
const ARCH={
  bug:{name:"Bug 捕手",emoji:"🐛",tag:"THE BUG HUNTER",
    desc:"你对 Bug 有种天然的嗅觉，编译报错前你已经闻到了味道。别人在群里@全员救火，你早已默默提了修复 PR。",
    line:"// TODO: 这行没 Bug？不可能，再查一遍"},
  fish:{name:"摸鱼大师",emoji:"🐟",tag:"THE FISH MASTER",
    desc:"工作五分钟，摸鱼两小时。你深谙『能用就行』的奥义，把自动化玩成艺术，把 KPI 摸成了手感。",
    line:"if(boss.looking()) work(); else fish();"},
  arch:{name:"架构诗人",emoji:"🏛️",tag:"THE ARCHITECT",
    desc:"你写的不是代码，是诗。一个 if 都要分出三层抽象，README 比代码还长。同行看你的设计图会沉默三秒，然后鼓掌。",
    line:"// 先别写，我们先对齐一下架构"},
  oss:{name:"开源侠",emoji:"🦸",tag:"THE OPEN SOURCER",
    desc:"你坚信世界是开源的。Star 数就是你的勋章，Issue 就是你的江湖。深夜合入一个 PR，比涨工资还快乐。",
    line:"git commit -m 'fix: 拯救世界的小修补'"},
  warrior:{name:"996 战士",emoji:"⚔️",tag:"THE SHIPPER",
    desc:"你与编译器同呼吸、共命运。需求再改你也不慌，因为你的武器是『上线再说』。咖啡是你的血液，周报是你的战歌。",
    line:"while(alive){ ship(); }"},
  neat:{name:"代码洁癖",emoji:"✨",tag:"THE TIDIER",
    desc:"缩进不对你浑身难受，命名不语义化你夜不能寐。Prettier 是你的信仰，Lint 是你的底线。你的代码，连空格都站得笔直。",
    line:"npm run lint && npm run format"}
};
const QS=[
  {q:"周五 17:50，你刚提交一个功能，突然嗅到一丝 Bug 的味道。你？",
   o:[["立刻回头修，不修今晚睡不着","bug"],["先记进 backlog，周一再说","fish"],
      ["顺手把相关模块重构优雅","arch"],["发到社区求个 review","oss"]]},
  {q:"你最离不开的开发神器是？",
   o:[["编译器 + 断点，破案现场","bug"],["自动化脚本，能不手点就不手点","fish"],
      ["白板 + 架构图，先画为敬","arch"],["GitHub，全世界一起改","oss"]]},
  {q:"看到一段能跑但丑陋的代码，你的第一反应？",
   o:[["它能跑就别动它，修坏算我的","warrior"],["封装一层，隐藏它的丑","arch"],
      ["提 PR 美化，顺手加注释","neat"],["复制一份存着以后复用","oss"]]},
  {q:"需求又双叒改了，你的内心 OS 是？",
   o:[["行，上线再说，后续再补","warrior"],["正好，趁机重画架构","arch"],
      ["先格式化心情，再格式化代码","neat"],["改完发个动态：今日份的修仙","fish"]]},
  {q:"你的代码仓库长这样：",
   o:[["分支清晰、commit 小且语义化","neat"],["master 一条线，删库才建分支","fish"],
      ["一堆实验分支，每个都是论文","arch"],["公开仓库，欢迎来 Star","oss"]]},
  {q:"如果给你的程序员生涯配一句座右铭：",
   o:[["Talk is cheap. Show me the code.","oss"],["过早优化是万恶之源","arch"],
      ["能跑的就是好代码","fish"],["没有单测的代码都是耍流氓","neat"]]},
  {q:"凌晨 3 点，线上报警，手环震了。你的第一反应？",
   o:[["立刻爬起来拉日志定位，不解决不睡","bug"],["先看监控大盘，能写脚本自动化就自动化","fish"],
      ["拉出架构图复盘整条链路","arch"],["在群里喊人一起看，开源协作精神","oss"]]},
  {q:"别人夸你代码写得好，你最想被夸哪一点？",
   o:[["又快又稳，上线从不返工","warrior"],["干净得像艺术品，读起来舒服","neat"],
      ["设计巧妙，扩展性强","arch"],["文档齐全，谁都能轻松接手","oss"]]},
  {q:"你心里的「程序员浪漫」是？",
   o:[["一次提交零 Bug 优雅上线","bug"],["三行脚本自动干完一周的活","fish"],
      ["周末默默上线救了全公司的功能","warrior"],["把祖传乱码重构成整洁模样","neat"]]}
];

/* ===== 逻辑 ===== */
let lastResult='bug';let step=0;const score={bug:0,fish:0,arch:0,oss:0,warrior:0,neat:0};
const $=(id)=>document.getElementById(id);
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),1800);}
function show(id){['home','quiz','result'].forEach(s=>$(s).classList.toggle('hide',s!==id));}

$('startBtn').onclick=()=>{step=0;for(const k in score)score[k]=0;renderQ();show('quiz');};
function renderQ(){
  const q=QS[step];
  $('qno').textContent="问题 "+(step+1)+" / "+QS.length;
  $('qtext').textContent=q.q;
  $('bar').style.width=((step)/QS.length*100)+"%";
  $('opts').innerHTML=q.o.map((o,i)=>
    '<button class="opt" data-k="'+o[1]+'"><span class="k">'+"ABCD"[i]+'</span>'+o[0]+'</button>'
  ).join('');
  [...$('opts').children].forEach(b=>b.onclick=()=>{
    score[b.dataset.k]++;step++;
    if(step<QS.length)renderQ();else finish();
  });
}
function finish(){
  $('bar').style.width="100%";
  let best='bug',max=-1;for(const k in score)if(score[k]>max){max=score[k];best=k;}
  const a=ARCH[best];
  $('rEmoji').textContent=a.emoji;
  $('rName').textContent=a.name;
  $('rTag').textContent=a.tag;
  $('rDesc').textContent=a.desc;
  $('rLine').textContent=a.line;
  drawPoster(a);
  show('result');
  lastResult=best;
}
function drawPoster(a){
  const cv=$('poster'),g=cv.getContext('2d');
  const W=cv.width,H=cv.height;
  const bg=g.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,"#0a0e14");bg.addColorStop(1,"#10202b");
  g.fillStyle=bg;g.fillRect(0,0,W,H);
  // 网格
  g.strokeStyle="rgba(61,220,151,.08)";g.lineWidth=1;
  for(let i=0;i<W;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i,H);g.stroke();}
  for(let j=0;j<H;j+=32){g.beginPath();g.moveTo(0,j);g.lineTo(W,j);g.stroke();}
  // 顶部徽标
  g.fillStyle="#3ddc97";g.font="bold 26px ui-monospace,monospace";
  g.textAlign="center";g.fillText("CODE",W/2,70);
  g.fillStyle="#8aa0b4";g.font="13px ui-monospace,monospace";
  g.fillText("CODE · 代码人格",W/2,96);
  // 大 emoji
  g.font="120px serif";g.fillText(a.emoji,W/2,240);
  // 称号
  const grd=g.createLinearGradient(0,290,W,290);
  grd.addColorStop(0,"#3ddc97");grd.addColorStop(1,"#36c5f0");
  g.fillStyle=grd;g.font="bold 46px 'PingFang SC',sans-serif";
  g.fillText(a.name,W/2,300);
  g.fillStyle="#36c5f0";g.font="14px ui-monospace,monospace";
  g.fillText(a.tag,W/2,330);
  // 描述（自动换行）
  g.fillStyle="#d7e2ee";g.font="17px 'PingFang SC',sans-serif";
  wrap(g,a.desc,W/2,380,W-90,26);
  // 代码梗框
  const ly=H-200;
  g.fillStyle="rgba(54,197,240,.10)";
  roundRect(g,45,ly,W-90,70,12);g.fill();
  g.fillStyle="#36c5f0";g.font="15px ui-monospace,monospace";
  wrap(g,a.line,W/2,ly+30,W-130,22);
  // 署名 + 日期
  const nick=($('nick').value||"匿名程序员").slice(0,12);
  const d=new Date();
  const ds=d.getFullYear()+"."+(d.getMonth()+1)+"."+d.getDate();
  g.fillStyle="#d7e2ee";g.textAlign="left";g.font="bold 18px 'PingFang SC',sans-serif";
  g.fillText("— "+nick,W/2-110,H-90);
  g.fillStyle="#8aa0b4";g.textAlign="right";g.font="13px ui-monospace,monospace";
  g.fillText(ds,W/2+110,H-90);
  g.fillStyle="#8aa0b4";g.textAlign="center";g.font="12px ui-monospace,monospace";
  g.fillText("代码人格生成器",W/2,H-55);
}
function wrap(g,text,cx,y,maxw,lh){
  g.textAlign="center";const chars=[...text];let line="",yy=y;
  for(const ch of chars){
    if(g.measureText(line+ch).width>maxw){g.fillText(line,cx,yy);line=ch;yy+=lh;}
    else line+=ch;
  }
  if(line)g.fillText(line,cx,yy);
}
function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);
  g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);
  g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}

$('nick').oninput=()=>{const a=ARCH[lastKey()];if(a)drawPoster(a);};
function lastKey(){return lastResult;}

$('dlBtn').onclick=()=>{
  const a=$('poster').toDataURL('image/png');
  const link=document.createElement('a');
  link.download="1024代码人格.png";link.href=a;link.click();toast("海报已下载，去炫耀吧 🎉");
};
$('againBtn').onclick=()=>{$('nick').value="";show('home');window.scrollTo(0,0);};
$('shareBtn').onclick=async()=>{
  const a=ARCH[lastKey()];
  const txt="我测出自己是「"+a.name+"」"+a.emoji+"——"+a.line+" 你是哪种代码人格？来测测你的代码人格！";
  try{await navigator.clipboard.writeText(txt);toast("分享文案已复制 📋");}
  catch(e){toast("复制失败，请手动选择");}
};
