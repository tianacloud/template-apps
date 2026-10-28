
'use strict';
/* ================= 工具 ================= */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function hsl(h,s,l){return 'hsl('+((h%360)+360)%360+','+s+'%,'+l+'%)';}
function hsla(h,s,l,a){return 'hsla('+((h%360)+360)%360+','+s+'%,'+l+'%,'+a+')';}
function fmtTime(ts){const d=new Date(ts);return (d.getMonth()+1)+'/'+d.getDate();}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

/* ================= 常量 ================= */
const STAGES=['神秘蛋','破壳宝宝','小小幼崽','好奇宝贝','活力少年','围巾新秀','茁壮勇士','星章精英','王者气质','超凡大师','究极形态'];
/* 全站唯一版本号：顶栏读它，页脚文案与它保持一致（改版本只改这一处） */
const APP_VER='v6.18';

/* ---- 奖品槽位（v6.11 奖励设置）----
   【为什么槽位数和概率锁死】
   课堂激励工具一旦允许老师调概率，很快就会出现"我们班运气差"的分班争议，
   而且老师实际上想改的从来不是"谁该中"，而是"奖品是什么"。
   所以设计上只放开两样：**奖品名称 + 奖品图标**；
   槽位固定 5 个、4 档实物奖各 3/14 + 谢谢惠顾 1/7 的暗概率，一概不提供开关。

   ic 字段 = 图标池下标（0~9），不再等于奖品下标：
   老师把「面皮」改成「免作业券」时，图标必须能跟着换，否则图文不符。
   c 字段 = 转盘扇区配色，同样可换（默认沿用出厂配色）。 */
const PRIZE_DEFAULTS=[
  {n:'面皮一份',      ic:0, c:'#ff8a5c'},   // 0 面皮
  {n:'奶茶一杯',      ic:1, c:'#5fbf9f'},   // 1 奶茶
  {n:'免作业一次',    ic:2, c:'#7fb3e8'},   // 2 奖券
  {n:'谢谢惠顾',      ic:3, c:'#b3ab99'},   // 3 试卷
  {n:'书包编织挂件',  ic:4, c:'#e884b8'}    // 4 编织挂件
];
/* 运行期可变（原地改，不重新赋值 —— 避免闭包/引用拿到旧数组） */
const PRIZES=PRIZE_DEFAULTS.map((d,i)=>({i:i,n:d.n,ic:d.ic,c:d.c}));
const PZ_POOL_N=10;                     // 图标池大小：0面皮 1奶茶 2奖券 3试卷 4挂件 5蛋糕 6苹果 7爱心 8星星 9书本
/* 把 DB.settings.prizes 里的老师配置写回运行期 PRIZES。
   任何读取奖品的地方都只认 PRIZES，所以调完设置只要跑一次它，全站立刻生效。 */
function syncPrizes(){
  const cfg=(DB&&DB.settings&&Array.isArray(DB.settings.prizes))?DB.settings.prizes:null;
  PRIZES.forEach((p,i)=>{
    const s=cfg&&cfg[i];if(!s)return;
    if(typeof s.n==='string'){
      const t=s.n.trim().slice(0,12);
      if(t)p.n=t;                                   // 空名不采纳，保留原名（转盘上不能出现空格）
    }
    if(Number.isInteger(s.ic)&&s.ic>=0&&s.ic<PZ_POOL_N)p.ic=s.ic;
    if(typeof s.c==='string'&&/^#[0-9a-fA-F]{6}$/.test(s.c))p.c=s.c;
  });
}
const SPARKPOS=[[-12,2],[-10,-4],[-5,-7],[0,-8],[5,-7],[10,-4],[12,2],[-14,-1]];

/* ================= 像素绘制基元 ================= */
const W=52,H=72;                     // 本体画布：v6 起加宽到 52（转生翅膀已删，画布全部让给精灵本体），高 72；底部留 14px 容纳等级条/影/脚，竖耳与头顶特效均不被裁
function R(g,x,y,w,hh,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(hh)));}
function ER(g,cx,cy,rx,ry,c){
  rx=Math.max(1,rx);ry=Math.max(1,ry);g.fillStyle=c;
  for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++){
    for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){
      const dx=(x+0.5-cx)/rx,dy=(y+0.5-cy)/ry;
      if(dx*dx+dy*dy<=1.06)g.fillRect(x,y,1,1);
    }
  }
}
function triUp(g,cx,topY,w,hh,c){
  for(let i=0;i<hh;i++){
    const rw=Math.max(1,Math.round(w*(i+1)/hh));
    g.fillStyle=c;g.fillRect(Math.round(cx-rw/2),Math.round(topY)+i,rw,1);
  }
}
function triDown(g,cx,yTop,w,hh,c){
  for(let i=0;i<hh;i++){
    const rw=Math.max(1,Math.round(w*(1-i/hh)));
    g.fillStyle=c;g.fillRect(Math.round(cx-rw/2),Math.round(yTop)+i,rw,1);
  }
}
function star4(g,x,y,c){R(g,x-1,y,3,1,c);R(g,x,y-1,1,3,c);}
function halfW(bw,bh,dy){const t=1-Math.pow(dy/(bh/2),2);return (bw/2)*Math.sqrt(Math.max(0,t));}

/* ---- 奖品像素图标（16×16 自绘，替代 emoji，全平台统一） ---- */
const PRIZE_ICONCV=[],PRIZE_ICONS=[];
function iconNoodle(g){ // 面皮：凉皮碗 + 辣油黄瓜 + 筷子
  R(g,11,0,1,4,'#a06a3a');R(g,13,1,1,4,'#8a5830');
  R(g,4,4,8,1,'#f5e6b8');R(g,3,5,10,3,'#f5e6b8');
  R(g,5,5,1,1,'#e14b4b');R(g,9,4,1,1,'#e14b4b');R(g,7,6,1,1,'#7cc24f');R(g,11,5,1,1,'#7cc24f');
  R(g,2,7,12,2,'#e06a3c');
  R(g,3,9,10,1,'#ff8a5c');R(g,4,10,8,1,'#ff8a5c');R(g,5,11,6,1,'#ff8a5c');R(g,6,12,4,1,'#ff8a5c');R(g,7,13,2,1,'#ff8a5c');
  R(g,4,10,8,1,'#ffb489');
}
function iconTea(g){ // 奶茶：封口杯 + 吸管 + 珍珠
  R(g,4,2,9,1,'#5fbf9f');R(g,3,3,11,1,'#4aa384');
  R(g,4,4,9,2,'#f2e3c8');
  R(g,3,6,11,4,'#d9a066');R(g,4,10,9,2,'#c98f57');R(g,5,12,7,1,'#b57f47');R(g,6,13,5,1,'#b57f47');
  R(g,9,0,1,4,'#ff5e5e');R(g,10,0,1,2,'#d94545');
  R(g,4,6,1,4,'#eebf8a');
  R(g,5,11,2,2,'#3a2a20');R(g,8,12,2,2,'#3a2a20');R(g,11,11,1,2,'#3a2a20');
}
function iconPass(g){ // 免作业：金色奖券 + 白星 + 打孔
  R(g,1,4,14,9,'#d99a1e');R(g,2,5,12,7,'#ffc53d');
  R(g,7,5,1,1,'#fff');R(g,7,6,1,1,'#fff');
  R(g,6,6,3,1,'#fff');
  R(g,4,7,7,1,'#fff');
  R(g,5,8,5,1,'#fff');
  R(g,5,9,2,1,'#fff');R(g,8,9,2,1,'#fff');
  R(g,4,10,2,1,'#fff');R(g,9,10,2,1,'#fff');
  R(g,3,5,1,1,'#fff8e0');R(g,12,9,1,1,'#fff8e0');
  g.clearRect(1,7,2,3);g.clearRect(13,7,2,3);
}
function iconPaper(g){ // 试卷：白卷子 + 题行 + 红笔判分圈
  R(g,3,1,10,14,'#fdf9ec');
  R(g,3,1,10,1,'#e3dcc8');R(g,3,1,1,14,'#e3dcc8');R(g,12,1,1,14,'#e3dcc8');R(g,3,14,10,1,'#e3dcc8');
  R(g,5,3,6,1,'#9aa3b5');R(g,5,5,6,1,'#9aa3b5');R(g,5,7,6,1,'#9aa3b5');R(g,5,9,3,1,'#9aa3b5');
  R(g,8,9,3,1,'#e14b4b');R(g,7,10,1,3,'#e14b4b');R(g,11,10,1,3,'#e14b4b');R(g,8,13,3,1,'#e14b4b');
}
function iconCharm(g){
  /* 金属挂环（空心） */
  R(g,6,0,4,1,'#9aa3b5');R(g,5,1,1,2,'#9aa3b5');R(g,10,1,1,2,'#9aa3b5');R(g,6,3,4,1,'#9aa3b5');
  R(g,7,1,2,1,'#fffdf6'); /* 环内镂空高光 */
  /* 编织爱心挂坠 */
  R(g,3,4,4,1,'#f27ba8');R(g,9,4,4,1,'#f27ba8');
  R(g,3,5,10,1,'#f27ba8');
  R(g,4,6,8,2,'#f27ba8');
  R(g,5,8,6,2,'#f27ba8');
  R(g,6,10,4,1,'#f27ba8');
  R(g,7,11,2,2,'#f27ba8');
  /* 编织横纹 */
  R(g,4,7,8,1,'#d9558f');
  R(g,5,9,6,1,'#d9558f');
  R(g,7,11,2,1,'#d9558f');
  /* 高光 */
  R(g,4,5,1,1,'#ffd1e5');
  R(g,3,4,1,1,'#ffd1e5');
}
/* ---- 以下 5 个是 v6.11 为「奖励设置」新增的通用图标 ----
   为什么必须加：奖品名称开放给老师自定义后，只剩原来 5 个图标可挑的话，
   老师把「面皮」改成「免作业券」就只能继续挂一张面皮图 —— 图文不符，
   在投影上比不改还糟。所以按"课堂通用奖励"补齐 5 个中性物件。 */
function iconCake(g){          // 蛋糕：三层胚 + 奶油 + 草莓
  R(g,4,4,8,1,'#5fbf9f');R(g,11,4,1,1,'#ff8a5c');
  R(g,3,7,10,2,'#f7e3c0');R(g,2,9,12,3,'#e8c088');R(g,3,12,10,2,'#d9a86a');
  R(g,2,7,12,1,'#fffdf6');
  R(g,6,2,4,2,'#e8c088');R(g,7,0,2,3,'#ff5e5e');       // 蜡烛
  R(g,4,8,3,1,'#ff5e5e');R(g,9,8,3,1,'#ff5e5e');R(g,6,8,4,1,'#fffdf6');
  R(g,6,3,4,1,'#fffdf6');
}
function iconApple(g){         // 苹果：红果 + 绿叶 + 梗
  R(g,7,1,2,2,'#a9703c');
  R(g,9,1,4,2,'#5fbf9f');R(g,12,0,2,2,'#7fd0ac');
  R(g,3,4,10,2,'#e35d4a');R(g,2,6,12,6,'#e35d4a');
  R(g,3,12,10,2,'#c9452f');R(g,5,14,6,1,'#c9452f');
  R(g,4,6,3,2,'#ff8a7a');
}
function iconHeart(g){         // 爱心：粉心 + 高光
  R(g,4,3,3,2,'#f27ba8');R(g,9,3,3,2,'#f27ba8');
  R(g,3,5,10,3,'#f27ba8');R(g,4,8,8,3,'#f27ba8');
  R(g,6,11,4,2,'#f27ba8');R(g,7,13,2,1,'#f27ba8');
  R(g,4,6,3,1,'#ffd1e5');
}
function iconStar(g){          // 星星：金星 + 高光
  R(g,7,1,2,3,'#e39a1e');
  R(g,5,4,6,2,'#e39a1e');R(g,2,6,12,4,'#e39a1e');
  R(g,5,10,6,2,'#e39a1e');R(g,7,12,2,2,'#e39a1e');
  R(g,7,3,2,3,'#ffc53d');R(g,5,6,6,4,'#ffc53d');
  R(g,7,11,2,2,'#ffc53d');R(g,5,5,6,2,'#ffc53d');
  R(g,6,6,2,1,'#ffe9a8');
}
function iconBook(g){          // 书本：封面 + 书页 + 书签
  R(g,2,2,12,12,'#7fb3e8');R(g,2,2,2,12,'#5a92c8');
  R(g,4,4,8,8,'#fffdf6');R(g,4,4,1,8,'#e3dcc8');
  R(g,6,6,4,1,'#c9c2ae');R(g,6,8,4,1,'#c9c2ae');R(g,6,10,3,1,'#c9c2ae');
  R(g,9,2,2,4,'#e35d4a');
}
function buildPrizeIcons(){
  /* 图标池顺序固定为 PZ_POOL_N=10，DB 里存的就是这个下标，别随意重排 */
  [iconNoodle,iconTea,iconPass,iconPaper,iconCharm,
   iconCake,iconApple,iconHeart,iconStar,iconBook].forEach((fn,i)=>{
    const cv=document.createElement('canvas');cv.width=16;cv.height=16;
    fn(cv.getContext('2d'));
    PRIZE_ICONCV[i]=cv;PRIZE_ICONS[i]=cv.toDataURL();
  });
}
function picon(i,px){
  const p=PRIZES[i]||PRIZES[0];
  const k=p?p.ic:0;
  return '<img class="picon" src="'+PRIZE_ICONS[k]+'" style="width:'+px+'px;height:'+px+'px" alt="'+esc(p?p.n:'')+'">';
}
buildPrizeIcons();

/* ================= UI 像素图标（16×16 自绘） =================
   为什么不用 emoji：投影仪 / Win10 / 不同浏览器上 emoji 字形差异极大，
   甚至会显示成方框（此前 🧋 就翻过车）。按钮、列表、徽章上的关键图形
   一律自绘，保证任何一台电脑打开都长一个样。 */
const UI_SRC={};
const UI_FN={
  back(g){ R(g,7,7,7,2,'#33333d');R(g,3,6,2,4,'#33333d');R(g,5,5,2,6,'#33333d');R(g,7,4,2,8,'#33333d'); },
  plus(g){ R(g,7,3,2,10,'#33333d');R(g,3,7,10,2,'#33333d');R(g,7,3,1,10,'#5fbf9f');R(g,3,7,10,1,'#5fbf9f'); },
  check(g){                                    // 白色对勾 + 深色描边：放在绿色按钮上也清楚
    const P=[[3,8],[4,9],[5,10],[6,11],[6,10],[7,9],[8,8],[9,7],[10,6],[11,5],[12,4],
             [3,9],[4,10],[5,11],[6,12],[7,10],[8,9],[9,8],[10,7],[11,6],[12,5],[13,4]];
    P.forEach(([x,y])=>{R(g,x-1,y,3,1,'#33333d');R(g,x,y-1,1,3,'#33333d');});
    P.forEach(([x,y])=>R(g,x,y,1,1,'#fffdf6'));
  },
  undo(g){                                     // 逆时针回环箭头
    R(g,3,8,7,2,'#5fbf9f');R(g,3,6,2,4,'#5fbf9f');R(g,5,4,6,2,'#5fbf9f');R(g,10,4,2,3,'#5fbf9f');
    R(g,8,7,5,2,'#33333d');R(g,8,7,2,4,'#33333d');R(g,10,9,2,2,'#33333d');
  },
  snd(g){ R(g,1,6,2,4,'#33333d');R(g,3,5,2,6,'#33333d');R(g,5,4,2,8,'#33333d');R(g,7,6,2,4,'#33333d');
          R(g,10,6,2,4,'#5fbf9f');R(g,13,3,2,10,'#5fbf9f'); },
  mute(g){ R(g,1,6,2,4,'#33333d');R(g,3,5,2,6,'#33333d');R(g,5,4,2,8,'#33333d');R(g,7,6,2,4,'#33333d');
           for(let i=0;i<4;i++){R(g,10+i,5+i,2,2,'#ff5e5e');R(g,13-i,5+i,2,2,'#ff5e5e');} },
  expo(g){ R(g,7,1,2,8,'#33333d');R(g,4,7,8,2,'#33333d');R(g,5,5,6,2,'#33333d');R(g,6,3,4,2,'#33333d');
           R(g,2,12,12,3,'#ffc53d');R(g,2,12,12,1,'#ffe9a8'); },
  impo(g){ R(g,7,1,2,4,'#33333d');R(g,4,5,8,2,'#33333d');R(g,5,7,6,2,'#33333d');R(g,6,9,4,2,'#33333d');
           R(g,2,12,12,3,'#7fb3e8');R(g,2,12,12,1,'#d7e8fb'); },
  sort(g){ R(g,2,3,9,2,'#33333d');R(g,2,7,6,2,'#33333d');R(g,2,11,3,2,'#33333d');
           R(g,12,4,4,2,'#ff8a5c');R(g,13,6,2,2,'#ff8a5c');R(g,13,8,2,2,'#ff8a5c'); },
  dice(g){ R(g,2,2,12,12,'#33333d');R(g,4,4,8,8,'#fffdf6');
           R(g,5,5,2,2,'#33333d');R(g,7,7,2,2,'#33333d');R(g,9,9,2,2,'#33333d');
           R(g,10,5,2,2,'#e06a3c'); },
  trophy(g){ R(g,3,1,10,2,'#e39a1e');R(g,4,3,8,5,'#ffc53d');R(g,4,3,2,5,'#ffe9a8');
             R(g,2,3,2,3,'#e39a1e');R(g,12,3,2,3,'#e39a1e');
             R(g,7,8,2,3,'#e39a1e');R(g,4,11,8,2,'#e39a1e');R(g,3,13,10,2,'#c8912a'); },
  gift(g){ R(g,1,3,14,3,'#e06a3c');R(g,2,6,12,8,'#ff8a5c');R(g,3,7,4,1,'#ffb489');
           R(g,7,3,2,11,'#ffc53d');R(g,5,1,2,2,'#ffc53d');R(g,9,1,2,2,'#ffc53d');
           R(g,2,13,12,1,'#c95a2c'); },
  trash(g){ R(g,6,0,4,2,'#ff5e5e');R(g,3,2,10,2,'#ff5e5e');R(g,4,4,8,10,'#33333d');
            R(g,5,5,6,8,'#fffdf6');R(g,6,6,1,6,'#33333d');R(g,9,6,1,6,'#33333d'); },
  pen(g){ R(g,3,12,3,2,'#8a7d60');R(g,4,10,3,3,'#ffc53d');R(g,6,8,2,3,'#ffc53d');
          R(g,7,6,2,3,'#e39a1e');R(g,9,4,2,3,'#e39a1e');R(g,10,2,3,3,'#ff5e5e');
          R(g,3,13,10,1,'#33333d'); },
  people(g){ R(g,8,1,5,5,'#33333d');R(g,6,7,9,6,'#33333d');R(g,8,7,3,3,'#fffdf6');
             R(g,1,3,5,5,'#8a7d60');R(g,0,8,7,6,'#8a7d60');R(g,1,8,3,2,'#f6eeda'); },
  chat(g){ R(g,1,1,13,10,'#33333d');R(g,2,2,11,8,'#fffdf6');
           R(g,4,11,4,2,'#33333d');R(g,5,13,2,1,'#33333d');
           R(g,4,5,2,2,'#5fbf9f');R(g,7,5,2,2,'#5fbf9f');R(g,10,5,2,2,'#5fbf9f'); },
  star(g){ R(g,7,1,2,4,'#ffc53d');R(g,6,3,4,2,'#ffc53d');R(g,3,4,10,2,'#ffc53d');R(g,2,6,12,2,'#ffc53d');
           R(g,3,8,10,2,'#ffc53d');R(g,5,10,6,2,'#ffc53d');R(g,6,12,4,2,'#e39a1e');R(g,7,13,2,2,'#e39a1e'); },
  egg(g){ R(g,5,1,6,1,'#33333d');R(g,4,2,8,1,'#33333d');R(g,3,3,10,7,'#33333d');
          R(g,4,10,8,2,'#33333d');R(g,5,12,6,1,'#33333d');
          R(g,5,4,6,5,'#fff3c2');R(g,6,5,2,2,'#ffc53d');R(g,9,8,2,2,'#ffc53d'); },
  scene(g){                                    // 小屋 + 太阳 = "首页风景"
    R(g,1,9,8,5,'#f3ddb0');R(g,0,6,10,3,'#e06a3c');R(g,3,3,4,3,'#e06a3c');
    R(g,2,11,2,2,'#7fb3e8');R(g,6,11,2,3,'#a9703c');
    R(g,2,1,4,4,'#ffc53d');R(g,3,2,2,2,'#fff6d2');
    R(g,0,14,16,2,'#5fbf9f'); },
  sceneoff(g){                                 // 同一间小屋 + 红斜杠 = "风景关"
    R(g,1,9,8,5,'#d8d1c0');R(g,0,6,10,3,'#b0a693');R(g,3,3,4,3,'#b0a693');
    R(g,2,11,2,2,'#c6d2dd');R(g,6,11,2,3,'#c0b4a0');
    R(g,0,14,16,2,'#bdb7a8');
    for(let i=0;i<5;i++)R(g,1+i*3,12-i*3,4,4,'#ff5e5e'); },
  sheet(g){                                    // 成绩单：白卷 + 表格线 + 红勾
    R(g,2,1,12,14,'#fffdf6');R(g,2,1,12,1,'#8a7d60');R(g,2,14,12,1,'#8a7d60');
    R(g,2,1,1,14,'#8a7d60');R(g,13,1,1,14,'#8a7d60');
    R(g,4,4,8,1,'#c9c2ae');R(g,4,6,8,1,'#c9c2ae');R(g,4,8,5,1,'#c9c2ae');
    R(g,9,10,3,1,'#7fb3e8');R(g,4,10,4,1,'#e8c088');
    const P=[[8,9],[9,10],[10,11],[11,12],[12,13],[12,12],[13,11],[14,10],[15,9]];
    P.forEach(([x,y])=>{R(g,x-1,y,3,1,'#33333d');R(g,x,y-1,1,3,'#33333d');});
    P.forEach(([x,y])=>R(g,x,y,1,1,'#5fbf9f')); },
  tune(g){                                     // 奖励设置：滑块三档（= 可调项）
    R(g,2,7,12,2,'#33333d');
    R(g,3,4,2,8,'#33333d');R(g,11,4,2,8,'#33333d');
    R(g,3,5,2,2,'#ffc53d');R(g,11,9,2,2,'#ffc53d');
    R(g,6,6,4,2,'#5fbf9f'); }
};
(function buildUIcons(){
  Object.keys(UI_FN).forEach(k=>{
    const cv=document.createElement('canvas');cv.width=16;cv.height=16;
    UI_FN[k](cv.getContext('2d'));
    UI_SRC[k]=cv.toDataURL();
  });
})();
function uicon(k,px){return '<img class="picon" src="'+UI_SRC[k]+'" style="width:'+px+'px;height:'+px+'px" alt="">';}

/* ================= 物种图鉴（45种·宝可梦专属） ================= */
/* 复用像素基元：R / ER / triUp / triDown / star4。default 身体为椭圆+肚皮，front 在其上叠耳朵/腮/特征；
   custom 则完全自绘（鱼/植物/球状等）。所有竖耳长度夹在 top-1 内，配合 H=50 永不被裁。 */
function earPair(g,cx,top,bw,eh,col,tipCol){
  const ew=Math.max(3,Math.round(bw*0.20));
  [-1,1].forEach(s=>{const ex=cx+s*bw*0.24;
    triUp(g,ex,top-eh,ew,eh,col);
    if(tipCol)triUp(g,ex,top-eh,Math.max(2,Math.round(ew*0.66)),Math.max(3,Math.round(eh*0.34)),tipCol);
  });
}
function cheeks(g,cx,cy,bw,bh,col){
  ER(g,cx-bw*0.32,cy+bh*0.14,Math.max(2,Math.round(bw*0.15)),Math.max(2,Math.round(bh*0.12)),col);
  ER(g,cx+bw*0.32,cy+bh*0.14,Math.max(2,Math.round(bw*0.15)),Math.max(2,Math.round(bh*0.12)),col);
}
/* ---- 御三家/可达鸭 专用自绘部件（根治"同质圆球"：让龙有翼、龟有壳炮、蛙有眼瘤、鸭有扁嘴） ---- */
function memWing(g,hx,hy,dir,reach,mem,edge){           // 龙/飞龙膜翼：横向椭圆膜 + 上下缘描边 + 两道翼指
  const rx=Math.max(5,Math.round(reach*0.8)),ry=Math.max(3,Math.round(reach*0.34));
  const wx=hx+dir*Math.round(reach*0.3);
  ER(g,wx,hy,rx,ry,mem);
  R(g,Math.round(wx-rx),Math.round(hy-ry*0.7),rx*2,1,edge);
  R(g,Math.round(wx-rx),Math.round(hy+ry*0.7),rx*2,1,edge);
  R(g,hx,Math.round(hy-ry*0.45),Math.round(reach*0.6),1,edge);
  R(g,hx,Math.round(hy+ry*0.15),Math.round(reach*0.55),1,edge);
}
function turtleShell(g,cx,cy,bw,bh,col,belly,dark){       // 龟壳：穹顶 + 中缝 + 两道甲片格
  ER(g,cx,cy,Math.max(6,bw*0.5),Math.max(5,bh*0.5),col);
  R(g,Math.round(cx-bw*0.5),Math.round(cy),Math.max(2,Math.round(bw)),1,dark);
  R(g,Math.round(cx-bw*0.16),Math.round(cy-bh*0.3),1,Math.max(2,Math.round(bh*0.6)),dark);
  R(g,Math.round(cx+bw*0.14),Math.round(cy-bh*0.25),1,Math.max(2,Math.round(bh*0.5)),dark);
}
function duckBill(g,cx,by,bw,col,line){                   // 鸭嘴：扁椭圆 + 中缝
  ER(g,cx,by,Math.max(4,bw*0.34),Math.max(3,bw*0.15),col);
  R(g,Math.round(cx-bw*0.3),Math.round(by-1),Math.max(3,Math.round(bw*0.6)),1,line);
}
function frogEyeBump(g,cx,ey,bw,scol){                     // 蛙眼凸起：头顶两只白底眼球（自动脸的瞳孔会填进其中）
  ER(g,Math.round(cx-bw*0.22),ey,Math.max(3,bw*0.16),Math.max(3,bw*0.18),scol);
  ER(g,Math.round(cx+bw*0.22),ey,Math.max(3,bw*0.16),Math.max(3,bw*0.18),scol);
}
/* 精灵态等级条：进化进度画在脚下地面线下方，不遮挡本体 */
function drawStageBar(g,cx,gy,t){
  const w=Math.max(14,Math.min(28,t*2.6)),x=Math.round(cx-w/2),y=Math.min(H-1,gy+5);
  R(g,x-1,y-1,w+2,3,'rgba(0,0,0,.20)');
  R(g,x,y,w,1,'#4a4a5a');
  R(g,x,y,Math.max(1,Math.round(w*t/10)),1,t>=8?'#ffd23e':'#7ad3ff');
}
/* 精灵渲染：AI 画的 PNG 原样 drawImage（不量化，保住辨识细节）
   - 惰性解码：首次用到某只时才把 base64 转成 Image
   - 按体型缩放：成体大、幼体小；底部对齐地面 gy，水平居中 cx
   - 缩放用 imageSmoothingEnabled=false，保持硬像素边缘 */
const SPR={
"evo_meow_baby":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAE+klEQVR4nO2WC0yTVxTH/0UmEEBAQV5FQEEergQQgqITVxgyRWTqEkOmk41IWFyGj8gQNerwlc0A4iI6XcRNVDSZ0UF0RkQQ2oDtNpjgAAWkvOoCA1ILipzlXsCwV2baZl2y75fcfF/7nXu/c75z7v8eQEBAQEBAQEBAQEBAQEBAQEDg/4hIz/n0kmuRgd73J0ygO+Tu4ojEOCmm2Fj+7v8JDvP7hRI/bmdvYTYxYIOgawDcqd3r3oGt6VTc3peOg/ErWUCkfViI3LTl3ObpnXwsmCdBYsQiJEsjsPbN5SzYiQHqjamuEy1tbBEotsOaxRLk5F2BXNuCO1/tgLnNIMJDfJCZZAJpykEkLVvKbRj1Xf3ATRgUU10navp+ha+XGAXfynBJLsc3Z9Mhnu8FlawJwdIAPGu3hqWXJ6TTZuC19dtRfno/XOzMMaQZMWgAIh3nEavpnuZeTPW0w64DyfDwnMKdFwfaQFlSA2tygvfb7wPDjcg+XIDSs7cx03sWypRyKFpU+rxb7wwQq/H8fAXgbIWjH70Hsb8/Bpvroe5phboEo87HzoGsuAjOHq8gNW0jn5h95BxaO7r5vZmpBQ0Na0VGKSHfGXMRH2uCTVsSYGLpDJVMCfH8YPgDKCttRPCaORjsGoCVgys6W9ph2lfBgxjoVqP5QRca1I9RIa/lH0PfTOhcQoqLW9GjtkLUB+mora5E50+ViE6MGX2qVeO780o4vxoOSehi1FaXwttpEsztNTywT3Mv40pxOcwnW6FR9QjdvRqDnw//iBlMKH9/CjGyjqfT3k0JRNRENFJKRLVUU3WLWJmM0kvaR2X8GhI0e1xumczS9UMZ5GjHpfXfKyGm5bdOpiB4VSwwXIPIoGggiOWlBxBZA3gKSegUVFcWc3uV7ArEgdMBrRzi6VZ8qG92omdoABGv++CaZTqCNu7QqZx0Ocjox8ovsXTDMXyy5QSAIe4sG3gOYPj5iyEJtYdKdgbiUD/A3AIeXuvxVkQYIgNdMTvlY75YT6sWao0WRuuFMpNWIOOLTDy5X4fC/KoXD5jmR29bCWAyoFXBYVo8MrI3o0hZB7fOASyc4Y20U6fRceMEblU0YEnaPkP4oxusplkwKyRBpL12mhoKPyN59h5+z8qNDbZPGp8o+IhKXkFzPcT0/dFMbsOuurYX+jRz49Cq1ZG4ey4H82d5YpKVCK4SNwSGe8IiZj1K8vajv08DR393buxlMZNfW7sfwzduEdr6f0HMzgNG+/qUdTCVNPUXuPLcPZfDmjyuMCFOLtR87wLPBrsumCehgvI8nokQHzdqu5nLn41lz2hwp4mGuKQyJyuLvuZSygJLjJOOBddLrJVmpcRsOi4e5wGEOLno7bzeaYtfEkwzfXzR29KFgGVhSN2wDcBDvnk3r9qDmNggXP/hHqY+0XD7tWFSDNk8Q8LOHNz9uc04m/YvGDvIiJcPkYLoWRX/fePz3XyDskBPbUxmqsU3sNHb6T8gUtbdJ8X5I3B0t0XJ+ZNofdwHdwcbrEtPwt6mBuzKKsDl68oX9vgPQiwLiotbxyWRD95ujJQadaP+LUxN2GBKwtSFbVbW20zUdNbnDFadoU0rV3M7Zm/IEhLpMZd3pM7wRsfwIPwCndBe2wZZ0wO8u/3Y+NpMhfgJHfWGB7rVIwhws8Xxq5fw4aGr+r5f7wB4EC+x7svY6MxvISNler+l3Y0AAAAASUVORK5CYII=",
"evo_meow":"data:image/png;base64,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",
"evo_persian":"data:image/png;base64,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",
"evo_persian_gold":"data:image/png;base64,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",
"evo_meowstic":"data:image/png;base64,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",
"evo_happiny":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAEMElEQVR4nO2XDUxbVRTH/7wWZglDM8tHBcbHMG4DgbpKsmkyRSbJFLMP0WnSzTiVxDiTjWjSERdqMjTGsahxcVGJGWBmnGkzMYLbzPiYM5tjlFEMghHpZDhwUBZHS197zLntJp0a59q1JL5fcvNeb8999/zfPeee+wAFBQUFBQUFBQUFBQUFBQUFhf8jMTfouaRWxwZ1yLLnRs8ZOhopjhalJtPRI1/T31FnfoVyEnTCBnPR+cZ9H9O1sO7BUhYwd0TESdIs593/KoDHFC7VU07WouiLYCeu9c3/ifuKCEQbduK/4xcQIHoiEucnioQ93dsRtAqcrFcL47ifbRMuAepQBhfn5+OeZQtReu8GxA27kHdXBuxdDnQeO45Njz+M9WWr8FnrIdx3590ovS0P779RJ8alp6Vedjwm0C7fR34FVuYb6KC5hpz2ZipdvkK8ac/kIBGdJ9OWjSJR7e/tJaIBcWV7tmmtenN2EkcvjHhPZ2c5bNhhvhc70UwvEfWJEGOHuc872iZEdD+9l+Qjg7Q60xD9JOa3zmw1VnD19Rcx+RzRtI1oxiZygfv9nCKvrZ2873bSry8eEEK4sIUyvxQ+KcCWJ9ZgZUkGMD0KeGTAC1j3vIR4jQbAGJc7/6RTgPaOVGSnpIU8Z8iJs71wLVU0bUNRZgKgScXunXtQlpKOvpYRzNPHoNz0KOD1AioVMOJEX0svki8mYUF8shh/5pQdRfWV1+1LSCvwVF457dxQheZtH2Ci+wfx5rdWPy8cXGd+AOU7HoNYBtknnB8a+hmN9mPY3diAC5fOQ3KroEu4FTkJusivACfgF+Ym2NqPIm1JEnwOH8aX/obFaxYH2UkuNXq+G0SiNhZvf2iB/pdsGDduBs6NAfNUsPX2CLtl9ZUsNSYiK6AC6GD9fnx15nO8evZTaJPyIGVI0OXdAufAaFCbcJxF/u3ZsLR9j4kuF56sfg7jY3ZAl4SGZgt6hn4Uz/RGupCpHF5IkzK6v7FDftaFBXotpAIOhSvn/iByrSqMq9ViHAs+3GFBzYkG1BQbRRhFOoRoe+FadE864Jlw4UuLFaoSJ2TnzVDH/w74ZpUm3o3mJ2Kqrx/rn6lF8aUU0X3ypwEYDathXPUIqvfvQq3NEoo/1yeCG+/jhza/Liot7/t08TSRy+Zv04Hf3GiALnR8Iooa58++kpeJ6o6LayiVOFyK+TiB8h0mAMOAxw34AlEtqQC3x79Lcax/GysSPjkrDQfaW1BhNYfkR9iWjBP7/uUrsKuqEgWGXPhukoP+54Q+aXWgyJOFt9qaRPgddnRhxueLidppdDZlmQbULtkEU9U76HcP/+X/dO1CvJD7EFqnTkCfXYCRATlk58MGFzT6qJ/otU5xvuHv46tttNCQ09QsbLjNiYMcAvA3ccBp4vt/suMwYzu+husI/QfIEPnZQPYl4gAAAABJRU5ErkJggg==",
"evo_munchlax":"data:image/png;base64,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",
"evo_snorlax_young":"data:image/png;base64,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",
"evo_snorlax":"data:image/png;base64,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",
"evo_ultra_snorlax":"data:image/png;base64,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",
"evo_gastly":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFBUlEQVR4nO2Xa2xURRTHf3e7z+52t93utoUuLoU+lBAESihISJAQiCBRY0SICX6QhBCDJBohhg+ogaAxSsBANLFWLAI+gKQCCUEeieGhUkSRR6HFQlvsc/va7rs75k7rIoEPdruUD95fcrMzZ+7cOf87554zCxoaGhoaGhoaGhoaGhoaGhoa/0eUFD1HjNA6KX2wdNpLIUuyPsAsBCFFues3YO7lGj/wfXNlKta7L3qSpMy8iJxMJ7MdL/FKcam0KQ0u2oJgMd2570T3XFrNPtluDtWIm9SmVISSzCQvhWJzyTkWFEfJKnUl7J3V7Zz62YXVJLCYFKx68BuhJRhB321kX/Rd9vg2EiGqPKQdUESZeSFrvF/d4/zF/dDelY3dLu9L2G0CAhgImvuZJ1aBE/b5Ngk/kZSIGKIAgc4WZukyh+ztPfYd1dcDrM9bTqwH+sIKXisYDPBpYzlnAwcoTVvEykdW0W9UcBnd1Idm4PdFUuH70AXMdM1j9WMrZagc6TrJ2lNruR2/RXoogzn2Z/HYBa39Cmf9Ryn3rcWPj0ucwdo8ivnuZ8gyg1vxyu+nKXJZNMb/fGDZ6X6I3bO/FfG3hajKFcKGU81CiWt73iXRUizEprwfEza3kp9obxn9i6gpEeJocVzsLukSU/Vz/hkbFrqhTlDfvopFsdxlt5lk8JOuMydsQRG8Z75BKERDvaQKXbIT08UdATac6IKmu/r/xoYRYzxdtqOKIGjq46EIqL4eGGiY++lgILerqLHeo2uT7UA8JPsqJgyD4xEiuoCsD+oOhAjQEWsceQHB3j5ZrOzGNIr1kxJ2tRrb427CZsjEiUdXIO29g0KyycViy6AzOrADZtLJ1ntGXkCjcpWTgQhZFtg14QRT9XOks58/co0J6W4agzDPMYGKwjo5FiEqxVV4m5iZVsKZ/houcQG7kodBb02JgP+cRo2D4ZBrMWIQkKeD1/I/krZRDoXy1i857a9koeVNXs2ez5r8Sv7oOcdYUzHe9DRZG3L6CzjTdpjj0S/UY4U6VRlBAQotsTqqO6t5IrOUG3GY7pgihVwRcDpWSWOknsuuz9jly2aWrpQZOQNh0hGD+ng3XouDTJOLqs5tKXF+SALU0v9T6JBovlVDf2wP093TZBb3x++48v7jm5lYMI6Vh9fhsFYwMeyhKy5IMym0ihvU+dpojzQwxl5IQ0+tnOPRFchakGxRG2oaVdTT5IfNS7jQcnkwqO5F3QmVsAEumi9wVakhRxnHwbZt7I+9x9dH9rLs0RfEZJ4SVeNr2empQ20nU9iS3ka1kj436i3mOudT29XI7+Hj3M48KMdGdz1Nkb0sca+aNo/1bMGWGWJ1xTppe3HBUrJ7ijg++bDs1/fF2dqxkZ2+DUPyK+n/A+djJ+EvaO9rYGrGAhZnLOebhj6ZqWaNXkpICcqwcVjSCQWhtctH1qQiOfeTDbvwGMcyxbqYqs5fqeuuZ7xjbFJ+DPdDEmqaXDFmO7roQKXNMFrojQSJGwJkWNwy56s7oAo5ULeDKv82mdHKc5qIW8K8fnMaHbQk7VNKMkE2uTJ2DejR64wE4wHCRHkybxHLHB/jFnauhM5T7T+ENeymzLWYGWYPO9rK2epbkTI/Uo4q7GXnO+J0kZCXegr9bZIQvslCvJG3U929YZ9GH7hyG0bxvHM9meQnbNFwhP19m2imadjrj9TW3e9Np2TtvwETpux8n5drwwAAAABJRU5ErkJggg==",
"evo_haunter":"data:image/png;base64,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",
"evo_gengar":"data:image/png;base64,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",
"evo_mega_gengar":"data:image/png;base64,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",
"evo_ultra_gengar":"data:image/png;base64,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",
"evo_cleffa":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFNklEQVR4nO1YfUyVZRT/3at8qHwEIhgg6vSKwoApxoe5iuFqLFGEmtlybkjXaWlJVn6toLWY2cypWWOhm5bO5YRdMWWuzdRrSs7LTJ2iRl0Q8XIR0csF773c0855BWFlU7iX/uj9bc/e5znvec9zznM+3vO+gAoVKlSoUKFChQoVKlSoUKFChYr/IzRelE2DsZfGgwp2y6NhGi0atp5AZ7Ai3v+cBdGbc9FB7t57Pur5QQGVpC+ie4eu0dmjF6hlm5HydZk0I2SSzJlObaSg1kVkstCfGyrIWXKaXho9lRWnz7KX0I3dp4TO17KMFUIfFOXLXl1NdNFOZOkiMruI7G5RYGJopKK0yaYYwKP6JtEvZiGzkavi5lG9fg91fX9RnhMZtS5Z98cIbX8smDU9DYgbpiyaHCjOfhNGasAbr7yGvLQ8YKQ/Fs/NQ3pCEjAuHIgbg/SxSYjJSMLvgRoUGDaioeGq8ryfFnA6oNWFIidvPrwNWp65QE6NvTAn7llZ57+QK6HEJ1qkLxQ68y6ds0DmTOPBYL7c1FxKi0mUK98Xj7aRhJI3PUBL03OxpaQMFVt24ZC5FmHhEdj6017c6QCSYycDHV1ICk/AtJmpOFq6H9t37pJ5UekmoTNa6y4jMSAEwY4hcN27haiJMTA216L4/fcQFBqO5ZkLZK8nPNjHM4AMjVS+fifpfEYpJ84hri+VNZ8oe4L5+N6V+maiFicdLd3PhgudvcAe605i4gQ3u+hAwTdSAHjNie41AzjRWBlJQE5UTs6qTqlIfJ/DgRXpDrVuY5mHE3yYRktUfkNksLFk6ZKw4UMQmaeskuBeM+DM/C9EGaq2KwYYGmVDVlpyo7JDlGFDWFFRuNouSrIBbBCvxVu6TOEXOeyJU1Y5fd7jSQwY+gQGaFL3raLy9jt4Tjcd19stmDo+USrK7JkZWLNkMzQfbUJWhBWV60qBKC3sVxxA+21ELXwRRHex9vMKpFypwTO6eNRevIwGQ3mP8OEjhuP41bOYV/mp7AUvgnoPDh86XC8VaM2GA5SVtVJeXBJe/A4wWRRai1NyQ3LncD0VZS7uI6fXgLffA5peA+HRTwMzogFn70MbDnT4AV3OHsrabw/KNdbhD5v7Pj7+4CuUpC/6R5neNqAP6kMcwH033JWXMO+6FfrkROVGRCAQFAa0a/DjikLUHDsB876TCND6ISBhHGBvwVVrA/5LiMu5NZBk5DDiYbJJ0nICS2vBoWSySX8klaaNpAJJ0lc9rGD9VWJAHihfvxPtE/1R/OXbwPNRwFME+GoRGTYGe15ei40z8h9w2hEQGQTt7DgsW/g6YiaNw6LV64AQN2Lj0weiwsAMmBYYgu36HTCb/0Dxu6uUkLlrBUYORU7hcuTolwFDfABnlzJ+vomvDXsxptUXyWMnAxYNNE0DC6MBlSuu/1xCdxgPYoJvBI4YjMoNH9vfmVsJrjN1OFdzEj/8pvCNDA7CsbrzqGoy9VsPT9RbiV/+iHlrylxMiY9FfkERcP/2Qw6/UJRsewfXLl+DLiwan5ze3f1xM2AdPPLCeNB9wnqzWdbZk5W4DvcP7uEpqzki12ZbK6boJsnccMk4aF9g/walMeMPk6pOaS24/+EK1F2peN2yskKpVoZGj1Sf/rQSj4TD7lImaX6I9snEpfEHYao7j5RSvZC/y/0QoRkpQKIPEDYauNCJlra7ntjaMwbcsrfCVfYrGrVNCBgxCseNh/v0NNxDVQcHYYI5Hrb2ZkS6R+O20zMGaDwi5fH+MHjlL8RfLAdAL9O4NpgAAAAASUVORK5CYII=",
"evo_clefairy_small":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAHIklEQVR4nO2Ye1DU1xXHP7srLghB1ChYIGoTUZtJIlpf03Qmop0mnal2JuPEMi2JU1JTU9NOMlhnMrZTU5uH7Yy0SeurEqyJqVUmIS1tgibRAEpBEFEkODyWhSVAKK8FZNn93c49PxZJta27IP1nvzN3Bn733nPP43vOPXchhBBCCCGEEEIIIYQQQgghhP8PLLdBpprAs7COszy1b10GKs+JL7celV+POu5i94pNMvdfjJsw+JW4mTLqjZ1ZSlA9oNRZl1LF7eY441DGkUq1e8Wmm+7jP8scX+Ubsj5QyqWUqvMq74kqNc82U92g/FWPKKyKXaYRfkMq2pQvt/5zRsyPuUu+qY/qlaroF/m30wilitqVPnTopSKlPEqp0y1qujVC7f/qVqU6lWmcVsaveFGjUqUtSp1zmv9XtCmV51Q7lqbJPqUjddWjfAcqRa6WH6gBgeVAZCT5aa8Qtf1BanbnwP1xTLVEEfm1JdDpgwYnRNjBZ0B4BHRZ4K+tGG1emDJJRPgGetmRspH6shaIDcdRUIDtyft4bsPT4HFzOyBeOXs0Xy1b9GWhjqaBpo/2op77ZNcJoYB4XHu6ekCosSV5nbJjlfXq+HAEdIT0Ok2ZZ96S+X3rMiQyWk6g+XBLETh7NJ+KD8oouVKK7f57eDb9Wep97bz0lXSZ72/uvr542jRqTuShhgZ4MeswF3f9mcpPG3h611PQPGhGaPpMav7yNxb8JpVtS7/DvRFxeC86WfD8o7yxM4uC8kYZ45UPkpvdF7okUTVXtef8nne+XSORkCjoBNacP+4S7+998mXZqzmvoyfzkrBtEsm0OatFXsFjvxYZOsp+aLnjltDrl6wZEew3QiunldDJqw/Ta6QS6cSsdItBopDLNEBk1HlNGmmaVbqltPqN81cx7Si9blSFGxcIZ/3CR0pqpxJPawX0txGu61GkS2e/GOrntJ7XSmvlxZCidvG+yNfRcZkGDMu7JZil4X/D8q1N31Sv/vT3RC+fOvJx/+PbcC9axo8XJvBedRP78w6wP/0UMbNn0dXSJmtWTb1beP3PxPnyf3OUnfiKeiwPzIOhXiJnTGPH0jSaLjfww50/kDUlV0pvue0IqD/RNIhXkfL3a4eysSRPkwRfuXEtr75eSEn+h9xXW0eP1ydrEuJjqXB+wne3bR1Zk7z4Lpa/eYmw762GbjdGqxvnyWJ+VHCAd8pO3ZZ+6d9hXmTDPNU8LyhvVNhTTB7rcprnNEenEu5rSug1aakvSI54MvJMGpW2yC1dvuVQ0AkbVDPXHHtNLquczS+zcuODlF9oJO3R1aSueshcEKPM0ekjc+vzLEpez/7d2Xw/43FYEI5lRsx1YV5FX0dnMGoEZYBOWhKi46C7l8XPfBvO98tE9k+eY9+xYzjKzkHcF2BuIm8e+SOFTgfZm9P5+sIE5jiuwekGJi2dDUY/2MJl74rkVWi5E2EAe9Y+hW1OLOABdxdGoYMtXjOxi/o8bHhlG47TZzh3+iR7jr5Gr7MN5seR+lAKcdWfoZrccGcMdPmgxQ2TvEx6ZDGZj20XBwWqT6BJo+s7ScuXQLQdCIPw4TM7++CBuVKZelo/k0ReuH41qelPwOUGc/3kCLNPAgxXD9byblg3BzxeHFWVzN2UErBOARvgPVGF7ZIHls2AWVPg2gDYrGYsBwYhPp6aY+9yz6wkrGsWQa1u8MKuSzB8MNVsJY7kvMPOQ3vBGGQo9wyTf7Y+YJ0CptAfsrP4VV6m9C6ieLht2DQf2O3Q3EzSN1KwJt8JjU6I0pEaBXsY9PXRfrGBv/dXwdUu1OUmMvPeJhgEU3eFM+VbDrE45WFIBGwW8AyB1QKGksoisA4b5/d8mBkJVduBt7YOV8cA7zWcp6m5lRfOHw5Kn1u9iUdDH6JOnv+YeyPjsFrmYpsZaXpW09swboyrjlSYHYwhjEsd+Gqc2JK+SFPV+2zO3T1aLhNhgByWUZylpk6O4gkewZKUiJpu+7whfljDYMANQ4OoVjdGR6/cAwffPUxhRemYlB+LAXLo9sKDwpUvNc4lITaexLUrsEYPYvSM0j96UEqnt8KJa7CHTm8/Onovlrw1ZuVFfrAbdf/e+stTXHA7WPOnDN4vL5SexpFTjFHVMjK851po/MdlUV7zfeXv0qn3dNBxrJbcDb8QOWMxIGjl5S2g+x7dBh93yeNk+KaWB48eusfRfY/+pvsm6YH0Hv1m+KheHvP+dnoi9TeV19A9fUGTNGW+zDKlfn5hxJDRQ3/TcyrffI3JTy7yU0v/yOtuQilUW30Fznxq3r53TMYobMHX5Ry9xDJqCIwYAyKjwH4HJM2Ga14MR6tQbywIKon1JTTPO7zVHSb8Trw7ieV70ylx3PAYsRx2fEh3dobKmbIHn6sOi30m1ohwDp46yuaPf+s3OCgEuzHYH3Bvtm9MVehfFJrLteTUZnoAAAAASUVORK5CYII=",
"evo_clefairy":"data:image/png;base64,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",
"evo_clefable":"data:image/png;base64,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",
"evo_ultra_clefable":"data:image/png;base64,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",
"evo_poliwag":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAC30lEQVR4nO2YS0gVURjH/+fMzL3p1UpaRPZCwaRAvbZIUzQzsoVZF5IgUISkXWQgtgh3SqBRWYoLQZRa9KAnaUIvjFwERorVDfX6QMqtZaXpPE7Msbl1jTZxJi50fptzzjcz32Pm/80ZBpBIJBKJRCKRSCQSiUQikfyPEJf8sn8Vi7iR+J62t9DUGBDCQJiCsZlJjFQXOFUJjUkE+mK5l/qRmZGBDQkaHr8chwoCnZrwWhqm1S+ATjFYuU1oXCrIDzvYOflb8oQyeEAxq81hrb4Sq1Uv1tXc4OdHVQEeABuTEtGcr6GrPwSFMRg/clQUgudlW7Gg6lBNIGVLOkRCBfhgO9qG8W54FIQQaFChEBUrCIXCKGASbp83LF6YpilYc/o2vw5RJCEsQIX/8ht4YC4ZyE+l53QGEQt1yWxRMIGdp4pwQgmDxkxA9+KzsgjlVnP4mE8j8BZXYQ4GKEzYp4lEFeWEEQWl830oPRDA+oqmiOOvB8ZRfvE+EnYFwKgFIqyFxcD87UF25GgNc9jd8NB+pfLR4f3UDMsrqWKp53pZYu1Nu4SoKSMi+bS6O+H58vWTZ4O8CLsAEk1NnLWdb05Ir7+LodoAn+9v6eajvS5sfMTnqUmbw9eIuv0UAvHxHQHIbryOruPF4SKWEw/LtY+wv4VLJLuuOyyX4uauiJ6waWrpYJtOXokq/TtwfdsUXuiJ6IGshmt8DI18YMnHWoUXQEQ5spMaejWGtMxk7Kx/wA0xHg1PT+3F2Og0is7eg+GLx1RTuei44vAA/E7/ir3OqDjP/Gd6XJEOEe3QeRIOZVeDWPDOY6L+MBZdiEfg3t6AmY86JnIDCFUX2F9I0SmbP8ByOoOsqHWAy+YT++rIR7iEKFzCQ7yIiU1AXkkVVhEf/O1B5HSMQhFcBIVLGIaFb6aBuEMnsK89hNkXvdyuCI5D4Q6krzIFhsKgW+BjYn4B4giDLjoQ3MX13yvfAdjTdK6pj5jJAAAAAElFTkSuQmCC",
"evo_poliwag_big":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFCklEQVR4nO1YbWxTVRh+bu9tb9mnW8fGFKjdZIIBIXPI/BhxxmkQZ9wyQUFixEQMusSJEtGg8AujEeQ7aELItgDKXMwCxgBxCZkD3AcjM0MFOgrM0a7fXbt+3PaYc7Z1IRD/3EO2H/dJTu9tzznv+zz3fc957ymgQYMGDRo0aNCgQYMGDRomB8I9sEkEOXPiixKGIBlBIr574k/gZ0oi+tzZeGbVBhieeg2JkWEIooH1BEQZl44fgO/k9yCuASjxCDe/AhcrokyKqj7EivUfYVZmAjd8OnT2uxAVJBiIMupIL0O6Px9nD30DZ+Mmbr51PIxYFj/PyFNQ8uOEKXl6DSgEbo8bMds1zHtpHVKrP6FDyJQQoM8tIJa1X6H9ZhjLFkgsAqd6r4PEIoy8fySM8jk52L6qgAlJiwZQvGLjmAidahGqwyjImeTFRiv8cQFpv3wNJXsm9IurkQgHWL/OmI5YRzOyXVfw7/LN0PvtMIgiOu12OD8tB6Co4iCpYi/KpHTLzxjxOJBmTIHVshTZRiOyxsXpZZB4FPGCJ9CTWYDCeAThsd9NkWE4kVDlXr0AasCyEPDbEQmHUFi0COGgF2HX4FjvMPs0mvJRaMpnUaFPn6YXL0hqDehDXkYqGhxGQhQh9v0GyX0TOVkTtcAqVyFjmjGZUlf/6cGQ3zu2BBOTKwCSjMBIDMWKFVUWM8rXrr9jyI7dDTipPAohPYtFIREKQpD0ql0z92om0woLJYKUS6ex+u1KLJk/C11XhnD+RgDTM0Q25tXHzKirXQPsbsD+3hToUlLhCrkgpJi4CFC1jZJIEDcudWPTy48nybf02DASDWLIH2dtX6uVjV21shIPxuxwhoIwcSLPIYUUbC02ory8JEl+a03JbSO+aOrEd90ZeKc4B28tMePCiV4gfw54QadmsiTKqKlehnann5HfUlPCnvjcLb8my2xtxSKcaOtLzhkJ+eDJykNOSiogkClQiQ06DNg8yDNlo6lrNH3a6p7DK7vO/O886/73ABIXJl2A06ewhUpx3enHhhcWYPepHix9eLScBb0BZJim3zFP8bnUulYvQIlH0FB/hN3TXccfGC1QdB1QIRSvH7mIhtXzEIsmcHYwDNm8EImBiZRSC9UhnJGbRwbtt9j9sS4bi8LsnIxk/3hUWls7UbnnJ0wrWQ7ft28i5rBOnddpWqgoaCo9/cB9+LN/iLVx8jTNtrX8wcijrw1TDjNy88iQN0buhlt2D6n4YC8xfdxEct7YRiRR5nIO4BoBivdrN7InbbN5ks3u8GLNtsPo1udBGLwMZ+NmrsdJPu9CAG457MK5jlby91UbJMPoOVgyGrFzx0F0Gx4CCbngavyMvrhxP9TreBmy/dWDA/VNKJyVz77v3HMQJ3RmRt69d90YeXYCIxPXKSSA7mhRt53t+zPS0+D0sL9REBnsTw6wlC5H2VE3yo46YSmt5OKUpwD80LADzS3HMds8diaL+hFs/pLe0dQh+pnzoXdcg9J/EY9sOMROdFNKACV6vuMC2ruvoqJkHnQ+9219bmMGbp45hjR7H3RZ6Zxd8wM5fOQ420K376onKHxyPN+JpbSSPFs/QCpPR0lRzSYCQeS6pXKDee4icq73OqsBnx/rIHLFu6zROlB21D1KntMivqfFra3rChPRedlBfuy8Rn4f8pGVa+q4khd4GbobaNWVZT3S01IRGA6yq9fhQBiEm9//ANHfOuyu6dyLAAAAAElFTkSuQmCC",
"evo_poliwhirl":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAIhUlEQVR4nO1YeVSU1xX/wTADw4zIOsMiiLiignocjERFE9wiGJemiqBpjhhrk7r0tDkatNqa1sTamh49JsaIHtMo7lEjakw5LkWj4oKgbMrmcAgDOiwzwzIwvJ57UZSmpjBD5I/yO+ed73vvu+++e79777v3PaAb3ehGN7rRjW504/8Xdp3ER7STp+js9e1sZUBCjYlLgL0mCnnHE6E7v+t5fIV6wkIMmjoPRSVlqC+/j+pjm1FvNtgkg4MtkxWuaqEIGIr7jVKEB2u4XdYXozwj5T//NFShkRgwIx5uwRq49qlGee0YZJzdDpgNRGu1EvawEeGrkzDFIRfyE+vQVG/G6JW74RfQj5SDtNdIflJ/3IqPMfu1gUxn2TkXvsL4hEXXWYAQ6WvE0r1J+EXcPJx7qx8m7X8AzabLqG+ytKErNdchfqAH7HztsXpfFvIPDETMNhXO39ChyxRwdemBvk52iH33fXx1OBkW1QAetzjKIXVsoZE01HFf5SDBa/NXIz05kec1GSptErzTXGiaJhAXTx6mYMSUYBd2I2ZsquRGlqAnKXEv8ypMVTr095LDL0CNexV1XacABXDguDnQ1wpMW7ASE0aGwGdULAtryLkCaUMVaqp0qNfeYfpGkxEzpsdwMDcOms7zAsfNYT62KGBtAPGWGL7qUzzKvg6JTAZH116Qe7hDUpqLspT98I6MQUWJFpbcS/B8fQVEUz0aIOXJDVUlsJjN8AjW4LuPfvVjW+9PGwPkLs3Xk9FMnZdnsQJNCm94TFuCJgcnuPZ1BfqGMK2dgxPQZEFd/k1Wiuf3CbVledsVcHCS4f3Fs/j97LViHD+ZA6/mZghnGexqzfxk4Wtb4uLl8L6YPF6FvKChGODfHzvrZF2mgJ3+/m1Be/r4tQuh9OqPB3Xkyg+eIZH+4H1ygCOGB/pDExIKhbkYx7d+Af3928zPWgVsSiJugDh6cif6h0S3i77K2GIJQkXhWcyOXoTKrkxklZBjTVIBEtR1GKaStxHweXBVypBepEX8F1qeD9i2lVq9C1GZMPq3W2DfUAthNiNmlBci/L1RW9v43EnOzlJc1JYhKbuFRiKT4dKHS9BYcsNqWayxgKC9PDh2FXr0CcWjygqEOZRiQK8ADBmkhr5ewN35h7LQvu/uZIfiWgtUPQ2w+A7k8fDF65FzePOTAtDuJ1eA/jwJ7zY8gnNAmKdAQlQY1G4tOwoJn3K3bX3j5a1EqIeiNXN7oQDvpVyEWd0X6lETESyToVJf9cQSHUKHNHaS9RBhG89wAspPO4fR9Vosj52CIYP92/zpWX87jRKTGf5uSmgrjeilkOHgrye2KkmJY/HancjxHIwmVx+offxQlZ+BK795tcPng3YTU8qfuvlbNDq6olnhhrKzRzG46jT27E3i759+k4YD6dU4sDjiqaCPoas0Y+6Oi9iyKLzVEneztPjztk+Q5zwMPmOjuQSpLNfi5h9nU71k16m10ISRIeLQ9jVocO/D5QDVNdqHBdBXPHUVEp6CmYRf/uUlvLE7k9up60U8RsInnk7H1tRCpierGe5dRcmDHO4TX7IsrUPrdVYMCCrSli6Zialzh6Hom2zkGMw4kLgL1ZcPwf2NKCYin587vCeaFJ4ssNJDDQpR4yMdLlXI4XhXh8ghavQL9MX9olJkBKtaLVF9bDPSAMS/NR/eijpMnTIMwGJg0w5x/kYmkdiUJ8SRz38vmsVFobt9iNvaZXHCL6CfoHh4MzZGEEI+OCP+eadM1AghItYni0emZn4nlOkbRNDKr3iMsOVfBWLCtjR+nzAyhPnQk/iaCo/yGg21ubzuf7kE6LAFoNU9PVmlXsvA+i17cfJCGvK095Cw8JfYsxcY4OeLvJIH/JcpWGdvTeGD+4k/zILaXspB/Cw85C2nnSuZRdiw6zOui6LHh2FYSBCmThwBqVyHalPbE53VMeCiBOqKHiJLW91mfIRrLR9iaNdZ+3oQcirMbf19yaRWN6Ed6VmUVxs4sJ+gpY56ClqvqKAYnaJAjRGQB3pC/30xdh9MxZuxMYiK0OBWlTN/z88qbBV04+ksflKfrJHxyIQNyWnYsSCc8wMpSDGwaqwv9p06wj+AMH9KGPPduv0Yrt3V83qdBfZP8sfoSa+wT5JvG8ry2P9VoZHi7dWf89jth0ax7B+p3CgeqNE7+TzhRn6hGP/RtyI5rVAIixDz3lnF84kP8SMQf1rn2fU6RYknjapPEoSY0+IzzzQI9Zx1YvOX+1oDduTvkjiQNe/saRFWCHEtLZ8VPXmhJXjpOSYuQUQfM1BNxfxo7rNrtVf4Dm9RlNCGR8XDa8E67mecOwXT1a+xctFExE77WettA1Wmnj5qXM/MwPGz6Xh75qsI0wThfHIiV7B0k+esCoJUoUTloQ/5tqIjCczqWohuFep9QjA+0IDUy6VQKOWwDH0FR07fQXa2CTMmD0dEhAZ+zeDCLtBTzWPltXos/+st3EgvQIlbMFyMBkhkJZB7hKKh50Dm+8LOA3REvFDUA/oSLWQ1NXBRe6FG7YUTmd/h+Nf7ETk2rA39S7722HDwKuzce0Px0nS4KOVw/F4HuHvwd8fqXKuEt1oBbdYFVNjbQ6JQAhInwFjHlkC5lspiJGWktKFvqZYAuskguhpdBTwfn5czzp2CMfNq1xxo/OPWcIeE0h3axML/r+t1Okuof/4eTI+Vzvls9Ys/0KxdFod342ci9dpNzpje3j74i7Qc5e2YPFhajqXel3heT4UEY5NXYVviMcrwL+RAI/7+pwTMmz4CShcJZi2axFmT8Il7+5KP0t2TywWCPNCT59PPCAzqjYUrNnRYiQ5bgEoL+mM3s0sxOyqcxyjt38rVtms+0W38+AjcVb3hr5Zw9o0YE8p1kDXoqMl+LLl0hFdn8cG/AevcFzbwQUYUAAAAAElFTkSuQmCC",
"evo_poliwrath":"data:image/png;base64,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",
"evo_politoed":"data:image/png;base64,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",
"evo_lapras_small":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAElklEQVR4nO2YDUyUZRzAf3fHvYAcHMh1gHyU5tQaKNHlR7hdajGcH3OQC0xNm63FqNyo9WHi0tZqWZvOnJuWq61mJbZZMzU0dQ4BB36QJiAfeYDycXcgcMDdcU97X5ScW1scBGy9v+3d+97/+b/P/f/v/+N53hdUVFRUVFRUVFRUVFRUVFRUVP6PaPy9UQ8i4D5ZzzDm85f7bfi3iJz87cxds46zx45hMpuoqbxBweaXxFg4MVTEJ1vfFuf7fOKrartyfNvSL3ZWNIvV2/aKmKgYwSiiHYqyOVArrFk5zFm/mus3HHT0emm4VsWBnFXK+DNZGYzrFHL5YPWrudR3RtDnbKG1qo4z331B2NRE3J29tLa043Z7GLcREB4f9i4XASFhSOYoLpaVYDToyc7foowHSlokSc+4LmJbdSWmaDOiq4vsN99SZE0VvyvG9+nCGG20Q1HuBs3nuc/TvHslpvYLVF67RdP163i9HnoqiqgsLRn1FPILg14rIiNMArRiYUqSKD/+scjd/+uod6AhR+AuXR6fxu5s04APh87ASUOWIu9vbx7UCQERDEILQl705BJiHC1kd5EXLSGFBmEMCkAXHgXNNxXjwy3zmL1sAyFaH74JBnxOOwc+yJWd0IwnB4TOGIspykRnfRC3m2/KIVWMz9nyGWlpcwYVT5fZuO3t4/RHeUKuJcYyhe5B02GrUi7Cwg1Y0jOIiorBmv0acTOmkSy1Ksely3WUnyti4fJnsWTlEB8/ecTSSTOcm+UCTlr6Ailr1tPtcODqcnGxqJTgUCOBxghmTYtV9IovNxAXKfD2SwRMTODLDU9js9WNSBSGEwGxeMUStr+/htradiStFmOQnifTnqKns4O+DieXqho5UniOSUEe3luZTKIlibbqYgInhI6E7SOSQgrBOJWzJ2BgFU7LXKo44XC0YUl5FEd3O3vOtvBnbb0ybt24nVjLPCEX+0A7HiMH3I2/0e84zEbLBdw+H65+SYmEu9ulOBGi01FfY2NyynxKThVTUnwJTYiZRZmLeEADC3Pzydq2Q55KjEkXOnHeRd6d6xennuKX4gnYzXMHJpb3SwEeOpwuwkM0PJKciE7SY5oYwZUTZ7DfukX1rq3ETJ8pq/tdD8MqJHl7/fq6J8j7cANXyxyKrMA+m4gHp2AOl2iyNdLQ5KSnd+ABx015GK/jBjVXrtCnD8ZkDKX85+8pKzzoty3DSqGwhxI5VBPPp+/uG5RVFOwhsP82er2e6PgE2moqqdubx9KEVpK9xWRGlvK41EDqfAsLVmWS/c5mrOkZfqeR3ylkTc8QSc+9Qq1d4njhDig4pMgvHyxh1pK1RCZMweuyExkdwTWdgauHdyrjVwEpdoHSsSov1DP9sURe/voHWLuSoqOHhGeIkfDLAXmPI7/EyF1GV/+H8kKzadeAAzJHvtmPdtIMps+IJnXZCup649j0hvVOwH1Y02OJcZ9UVubynzqYmbqA+NTFcPTvOUajBgZDLjfPQL1W2eTd+S3Sc/NJXbZcqYGKYz9SemD3vV8t/ildNMOwZ2SRnbi7E5Uj9l/9z1/6KrC/umlS4gAAAABJRU5ErkJggg==",
"evo_lapras":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAGK0lEQVR4nO2Yf2xb1RXHP8+OY6exk7hO7PwwTUncQBrSQtvQNl7DyEbFVOgoTSHSJCiCsoJGq650YoJFTBtCYoyJCZUJwTSQRocIWtqiNRLQNoQklQppg5LSJk6aZLFTO3EcJ3Zsxz/e9G5pOqb9kW759Ye/0tO9795zzzvfd849754HSSSRRBJJJJFEEkkkkUQSSSwOpBtdkJqikXPMZqKRGBptimg9XvcN65krSDdqfG3dH7l39268njGiaAl4x3n/ud2MuoYYdfcvOBHVbAWzV5QI43/zdCX2Zd3IwQByKECWXqLu6Cd8b++vFTGZpUrApEkTxis40qEjlm7izBdfce7Liwz2DLK6ooLyXQdYkgQK8gvk6qefpWWqhKNdOjSpWlr++mfKbTm0/eVlJkJx8nIzKbHmLbgXVLMV3LKrhs6vLxOOJMhZrqHp/cMYXM1Mui+L+elQFJ/XrXSlJUcgGokRmxwjK/Wqbf4QWG9Zw4H9z5NjWy/GpDQ9iwHVbAVHxqIk1Cpx+YaHefBQHS8caeb4q2XsVB8mOBViyRLweN3Saw/b8Q06yM/VQ3iKxywf8cKGY2LeEVrLYiFltoJOl1O69NaT8t2RzZiBLu/V8ZzCXM7G11MQC7OkCShoaHNKDW31M1mm9vk3KLJWo4t5kTNWYDRZlGF5ITey6n9YoxgnqYGNZj9rp1tIGEwMnD9H1+ljSzML/TfEv21/XN5NWoaBoa5zXDz3BQsN1f+zuKpkGI1hGdpwAM2yZd+ZU4OsXN+G1LX+4u6B/4TZZBCtJuW6mmzLSlnl7ue2Rw5iKq0UX2sFWWYLDe+8JTe993vFe9Jie0Bu/FMN1nKNuEloNBiXZ4p+XtUOat9torzqXu7fvoms/AI8I34GPUG2PvokrzT3c3vVdnnRQyinMHemH52OYLtzC9WPHCTqOMtgXz/FpUWMjwYYdzk59NAKvK5hhi8PolHF+eEzL2ItLpsTEqo5URJPoElEuG/fL8kv30j/qY+IReN82XSSlauL+aA9lQJzhpAdH/MRHnHyYN1hcURfEgQUxOMqUoJetu15hlu3bKXvwiVsd1Rw6tPzDDocOD0TmCxGjHl5lJSVsKrMxt1PvSw2+6IQGBm4Itro5BQefwi1VkVMlpDi09h37GDIPYbX7ePmIgvqVB2lpUVC/uN362lu7cTd0yc2+LV0vKAE/vD6S9zzQBkJvyTS6P7CD7nii5CiUSMlJFGtrdtQxsWOC0wHQqzfvJpwJCgI/WRvDUW5OiaDYbG5dx545d9VX0u780pAzr/JjJx9l3j7CnKMMXShUaIJNbJKFp5QQsW+1U7riQb6L/QKIqZMrZAPhhIY0nUEoyqsZXcInUpmevbDdm4pXjv/HnD90yNa5e0r0FrTeKzwBAN9A2j06Qw4BsSRWyFR+aMH6Gg9g2VVEcHAJG2NJ8kyZjHY08k6++34XA4yDZks37ST1DTdwpyFlELm07cPo8q87m3FC3ZDN59/cgadepqs5UbkSJjUFFlUakF/AFPB1X3QebGPDXdV4/OGGHI4yLOVi/H39u/iUm+HNO8eyLas5IN2PZGhq0XMtbbS2kf02D4GHJeRtDrikQQGU544pZ5qaCSi05Nf8X3W/6Ca8bCa9tYWyF3Drdv38NWb+xjq7ZLm/SihfIBKdv4CV2ic2uea+dUTueJI0dXeQ9m6VUKmq7sXuxLYKlmE1NrKTZw+fpSe0x+z7bbrj+yY8HH/yiiy/afkZajwjfnlv730s/n1QHZBMfc9tI2MfCu9qpt44+8B6t4enjF+76Obxd+J8akEgYiK4St+bBsrxNzEid9SUzlEY2MLR373IulGA0pCUMpR5Ut+545apcaQzSbLrDPRDbFVMsXjr70pYvf0Zy0z4xm9x8HVNnP/jSebNU/U8eoeG03ubEZHgowNu+msf13I/eOsh+lYVFL0VT1+UKzRm3LIzjWTa07n0CabqADnPIRCzgHe+flTDF36+vqgNpXRwe7vPEyNU14D1H+TSU3pKEeu6Fht30DriUJOttUrIkL+/OfHpFFnrxwOBNHp09FnGAlM+GZt/Iyi+YASBpHpMHqDXvyWUaDc+yf9c/rMfwHJnGtcAvyfGwAAAABJRU5ErkJggg==",
"evo_lapras_lush":"data:image/png;base64,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",
"evo_eiscue":"data:image/png;base64,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",
"evo_gmax_eiscue":"data:image/png;base64,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",
"evo_mew":"data:image/png;base64,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",
"evo_mewtwo":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFgklEQVR4nO2YaUxUVxTH/2/YhFmYcTqCLAJjsGwdBpCiGGiNC9EiEsSlatXW/YMQq6UtsRZNmyo0KmjViJZF60a0ti444IIiUkqFEaOAC1gcCp1hGGYBRdTbvNvYpMqHpjxAk/l9mffOfffMOfeee+65F7BixYoVK1asWLFixYoVK685b7koSG/ySWETe5VzBY8rRYkT5uGrtLR/GXt4SwERCWV4LRx4c7QcMUFz0VJqIU8aCVFlXyX1vzXgWMkhvBYOuLl5IyTMF53oQfW1O5gwcSyCQ0NgAxv0JwxXihLCE8mi+cvwrAfg2QHgA1K44KngMaLnhHP2Py/CpWKyYe5miF2kKL51DP7CMERFRSMueXK/Gc9iC45wsucjJCIEQX6j0XDvNgT2wn43ntM10PW4k1m5cRF2ZW/Bg5YGOhMDAY8rRclxKWR30gFU3yhHREA05GI5ctcfJWvjvujXfYDhShGbOptuG3C57BwCFUp4uLghO28nJoyJ6deFbMuFkgi/sUSn6YTe3EbfWeN1RgOu360G6SLQOxqo3MmeT7oed7KPzCu3iC9VFuL+g0b4uStRWXUV7foOGFu0uGIuRlJcKkZ+5EbkEjdANBQwtZMVuUlo1v/RZ0c4GYkGVTvZkZuB+OkJ8HX3p6Ofv2cP9A4a2I4EyHVHiMTOKL5wGi5iGYK9w6DwDMT+0nycqz/PDOoMsIv35NnjUPiGIDJiNO5rOqh8n2oHvr+fC77aEYu3fYi92wtgeNJKHTJBB5tHtkiOXQlGwJDia+eYQclC7lI3smreWqg1ZTA+a8O3WRk4mJcNgR0fHmJPNKkbMcorGGJnKboZC+ZMXkr7TU2Ox/azO2B82o3Y4Li+mNA3B3atz8Vp1WFotW1w5r0BR+MQmDtMWJ46C7u/3o/IzqmYnRAPJwkfYoEED40WtFS30r5zt87GPa0G7LqQOEjIgDvAjn7XUyPU5mosT1iFixeLIPcKgvbPVrAldGBgAM1GY0ZFwcPVm4aX3M8fy2au/kfHtmOb6G+YdygG1AG27k8cN59mnZIbJQgPjUSorwJGQwttF8mGQOBqSxfz1Gnx8BB5IiU1FU7OAjTebKKhNULpgzWfJ9MwmjZu+sA68Et5BeYvWAJvTx/kpR1FTV0NHrTp4GzjQNtNukdg9wXWYDb281XZyDyUjnt1tUjPXw9Ts4l+p/CIRLNBD41JO7AOnFIVMg+fGP82wkuJut/V0Bla6GjW6W5SuaOtA7qMFni7+iPu7RlI2/slVBdOIuVACoLeC6azkJWxmX4rFIsG1gEWtjSY8/FMJmvfVsyKWUBlx8t+hJ8skD436VtpNmpvaIfc0xeM5hmOFOXR0DmTeQIute74IGoBdAYd3bEHbR/YlL8B0YoYBMgVuNVQA5lkOOx69Lh4XoVgn3CYDXqcqToBVAHvj1sMm6OOEFXLUIlKiKRSMPYEF8rPDl41ypbRn+5cgYiwd2Cx6aShxLcT0DNBxbVLEEqkNAu5C92hlPuhtqqOGs4T2sNssaCNaYah2zA4G9lzKurKmZyC7Vg0finySvdS2VCBFHe0dbhco8KqhM+orKS+jIbM87ivNaqRU5DDvBLnAXb02dFm66vMn9MZI+lA4a8nUHGnFB4uw1F5oxxiOylEw4S4Ul9M4/70pZP9fmL7z+QtyaNXKS/KiwqLSEd5D9m4JL1fDzacVKQ+fj69Gpm5bicpybrOtnHuBI8LJZ8kriNDRUIMg2uv7er6SijDA9hrRnAN05fOd49oycHiXCQtXk3zviLW8yV9sTFTyKSAGfByH4EgTyUaRGpMnsLdbQXv/3ZcE5NCfvgpB+9OHI92kxlZ333T63cykSsWzlqI/ady0MXvRm3Z3b7Y+xJ/AcMPHG2MV+bXAAAAAElFTkSuQmCC",
"evo_mega_mewtwo_x":"data:image/png;base64,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",
"evo_mega_mewtwo_y":"data:image/png;base64,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",
"evo_ultra_mewtwo":"data:image/png;base64,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",
"evo_togepi_baby":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAEkklEQVR4nO2XfUyVVRzHPwgXQS5igihiyIsIoQ4HDGTOpf3hC5so9U+tzbVGTVmRc73oXGasF5Yym3+Us82iqNxyrMy0dzUDJBiRfzBvIK/GmwhduMSFC/e0c557CZDWLs8V/+j5br97zj3n95zf++85DxgwYMCAAQMGDBgwYMCAAQMGDBj4P8LnLp4tZkOOj04F/+15ceDFAiIWBvPxmdNUVlfqleVdmM2LRGB0upDjNNtic3K8cKOhsk6sjQ2TfNPx3hOIgHW7RMwFIViRNVUxpWxb4V4hhG3ciLOlP/2XEWICeYQ5M7cD6O6epMTLSbGUhSUQkhzEwNdvQmOz2ti8bQMFR0vJSMtwKzvpuYDHPiNk425mC8rzAQUjUrBKJaVkcrwYTF8vxK5cRXI+1H5uPAruSGSkZUxMPRGycbeKpjxrttJMKR1W7FSCpQIyPaRybsUlOe5bLKwlz00yoHXAqfhcBoynonTGNOl491JoqNeJrWWUlm96iY7NUumxPWcDN5PM+Nc3jPP5Ha/G3vHV+P/7zVojGh28BSuyMO/5gI4qB5zPhYbvZ6VTKa/JcCfvqxTMT5Pt8h8X32hSUZDel4Xcf+GgtjYBvzf2qajN2XtbeT8y58yMC1jCz+MnYrZj3voIXD6H2dnCQF8H9U1/Eh+zAGKj4ZWD6tBlz78FvibabAIkuSIQFbGAZVve4IbDzEC3wBYgCFi3C3tdHfRXe6yOxyGTnnPPD4WX0tNUw5XgJ6gtSr+Dt6J7jMdrfJlX26f+v5bZy7aMOFLf7lMGmJf7qVSUo+P9PKyXTnisk8cRcJ7aok3Cw+HJHPbmPkv+oohped/74Q/mV3eyIy+dL975hd/Kr7HzwThlyOGz9dDcRXPjeRyAtaZ6Rg71PIX6q6UQQT+kJO7HPymRm385iafCxRDqGleqX0tHK5DO4exQfHsTZFzYubqKZUMWiksFlssnsGsxnfWrhurz5V2jqqCFyBZCPOQiObeJQw1CFatsk5JPiHIhRKaLssVH+1br7v263sRjbYfIDP+Qd19KBY4A8YD29mXMn1fj4Hr+HMqi88h07gCKgUDoXAidY3pE60ihCbBYUkhJTyQz3Be47VpdrA2+JcB64mMiYf4aYI1icbQ0AQ5MS01eUF9nBFqj9gOZwCBQCFwDFgE22XOAMiAIQvM1smbT9V0SI6M9sGTo3hvQdvVLbdJ4C0eN/Y794TH/yQux0Qxvehp/vzAcFqce0V5JIZ9TJ18XHb0DHNg0TPBaEw7LXNmmXNtRzA35FExaatlH4rgVnEVcWCDMM1FypJ2izzvVOXoM0Nu6RIAPvPBALNlFW0kOb1DpIT2sEDTCiFUz6MfrDzO2/FF8e9ux/pynlK9t7NGtg64ilsLtAnGsdYDRi0voWLWUSJ9mEhJqtF2rVuhl7auIXpnKqqhQPim/yNGTXdhs+pX3BsQzT+0R9iHtkibpeOExdb12k/xOkGuSR0KO7u8CvHD/1xsBhW8vXKHi6iV1sav6tcadGi70YDWdRtaK/MiXkHNvwcdL50z15NRzp/O0V2T/Dc/EdHfNAIKgAAAAAElFTkSuQmCC",
"evo_togepi":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFiUlEQVR4nO1Xf0yUZRz/vLfTVxDuFE9BSc8zo7vJ4Y80OLVW2Bw6s9zUmq1Yks6Yo99uuYnmZszSqflHC62Btmz9I51JJNVSKKSWMcgwmCnigZ7CeYIIIn7b9zne4w6RA+8uZ3s/27Pnfd7neb/P5/N9v8/zfB9AhQoVKlSoUKFChQoVKlT8P0HhnkATLsMmSUP5pumixv0Gk6Shr+bMIXpzA4ugcIrQhNogk90624Zlyami/dIYDXYMHc6PdD8IIF/yKLYDbTfx6OjRSLWaRf+9EkCBJpchcdj0kP+5UFSNrhZRp7dGIBzQBugnzaQliEswikZD0U4WIfVFPtc0zZ98200gUotfay6JV3p46gGCfJ6lYARAY8tE7NankHKtCfWv/YXiomLqAHmNGs0ptLmjA8sssbeR3+e8hYiZSVikj8Y37hbE1/4Jh9Pd73zS6JmCPLlqgZv9jx0IyPDi1yTn3SKLvZPqr3fSorT5vuFEZ2sbRCmQo4mSH/GWhgcmiR3oyJHjxOAxX3yyi+LH6PsIR63nnVZPOnsXTT9PFL3YHjBsBwY5kWRbllfEjqMNlJmRIYwr5M4V7fEIsE6ltoVpgjxvo0y6N/ibVKvZzwmZGRnCri6nWczDIqIe2xMiAZ51IIyy8Vf/vkwrd5fQuLTXe1hd+Ufs+Qp5rlnUneAr4vHVucImF56DRTD57lAKhQCtEKB9oZiMedc9HsppFiJug3XqHT3vC+5nr8u2LEHc9gsJu2xfeF4rwizkEBPGvXOejNsuecPH7y9w/HPdD24QUfb6zWJtWeydgrjiFE/ci/UQNogJmAAT4d/PHrtNDBG5W7qEYO7n+FbAHmdPsxMmrikUJZiQGfhJLCey12A0z4TZqMcQACeqJbRPmIiT8gS/oTuPNWJ7zhYcem8FpJGxqKo87e2raBoFV8xQRCaMAE2ehfboJESlLMCotA2QbVkYbPgEPAe6QZJuGMbnLEbzl7Mx11iAzu6OVdnTsXSCHvXf7fUOdh1rxPt1NpyZZoWs/97P0PLORuwqrEDb5FmIed6A0yduifdTDIvRUDMfdb/li/kCHWCDFSDR1XY6vd+FqKNbUBptwlIAMyyE9SMjQEfzoH0lByOSEhBR3wjz2pV4KOUJmN74CREtEqxJD3oNrWhbjhidjE9rnkPFfrbiwUkAMXXHvfMhPPAcOLwGfCG2TF7AvRYrF/+F/iwRpYo6f9287gWrJWiH9DwPEgNWyifoiXwrZqRX4eHYsfihcgmAcgCf4WrreOi66gC9qddX63se3dWA/qq36Sy6gaLMa0g/88egudx1Ou2+MN6nVY4Duc/gfHs8dFGaPsjXiTHOohIcyI0D9BY/8gxbthn56+YpqTbCKsDhdEsJLx8QyVj6gngAydhtzer/I7cOmyYVYM3YtciseUu0mfwYm0F0l1U7kfZkhzI6ZKlDIIiELtBp67sWOAmsd14Ta+Xit3N91gB6l/8GshwlchnlAONDiwly4WffQuUbPYu3fKOHPL0ryHdnpfcUQgSnyEycPa2QVsRwYfKK1xXPh5K8NohvpR+rTtGpg2ewDXthMCWLlwkm/1O5tjQCZdUy0nBZbALZ9gtwuHkzCP6yEqwAgaET52P15w50ltiQkbEShljP9VPB1u2HEGdKRHnTFBQ4oqH/YB+iPsxDa8mqAZ+2/SEYA5yQYeHTEgrLhsNRXArDOAuGtVTi3JE9GOIoFoO6lh4U7xmuKeNELTdeQYd9EzrKPgqWw90R58sM5/B89eOa02K+jPSVzyspOI8Tu1F34fsEQrDz3HUIWX4vhf3jZrSfdYo2Z51NrotoLXubL+Ner7KXnRfrkeBegJKq65hrjERpXRuchw8Hy90zbxDf3sl7fdkczNhB4V/4Pj4iZB5geQAAAABJRU5ErkJggg==",
"evo_togetic":"data:image/png;base64,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",
"evo_togekiss":"data:image/png;base64,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",
"evo_ultra_togekiss":"data:image/png;base64,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",
"evo_koffing_small":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAEB0lEQVR4nO2YbWhbVRjHfzdNbtI0S9Km2brMvemcUzuKdKhVp0NXB9UycOKcWmQf9MuEIYJ+E0VlKKhI2YcNdOILuuqYrJPpVnB0gzmkbNINWbrNde3Spk16k5s0yb036ZF7uwlOUNlSU/H+4MLhOeee5/mf59zzHC7Y2NjY2NjY2NjY2NjY2NjY2PwfkWZoXvFv+XMyAyxfcjvhSO0fbOlkhlNnfua/gHjvnU6RTxdEYli1HrNt2v4iM7MCsf7BjeLN17eJKaMkrsa0mX3mmNkqRJgB/h3lzoSDMpKKFzi4/0eSlzJ/6iuomtUXu5BgNiOufANXY2bnSj+zHNHa8qg4+cOoyI1pYuC4agVf7a6ZkeAd5ZysylElgr4QtcFaoufOoQw5ONHfT3fXt+S1SardNdaYcvqUyrzydHQ8z62LV+Dy+gnVBBmIRjnadxhVS+J3hzjUu48jfT1l8+0sV/Bh/zw2tG/imeceQXI60C9BQjFoWBhhffgpgn4fKTVrCek/c4JUdkKAkGaDAGFW3heefYWNj29CckqI4hQjiUlyaR2XRybgq6aol8gXdNru2UDIP4/P9+4wK7O5naSKCQj6QiIYCLH5yS1s2dyBYzHkx3XGYhqGBvPn1yG7JVKqgaKmMAopblyynDm1YZJqnImJCXL5nEhlk9cs4nrUi8Zbmnh56xs83dZO8fJSmNsmlyvg9XoI+l2WzRRg2qx2YpKMMm61j586yq4vtxO9cPqaY7muDITCdaxreZiEorHjk53MDYdoX/cEkYY5DJyP89ner5nKOVi7ei23Nd6MrgnG0hdJFDLcuaIZikW+8uyq3DEql2pQdZ3d33Tx6vtbOdCzD++cKryLYPDiIB90vk3nh9uIJRQcQc16Z0px4HY5yecnSWdT6EKv7Efsl2Ualzayuvkhmpvuxeud3gmR+lruW7Xm97Yj42ZkJMlEIYNmFPH6agj4gsiSXDkBqpoiGj3PA2vuYOeC3ZYtES+CIggvaOCt17YjT8k45Sp+GYgTG4lZwZsZECUqn4GhsUE6P96GkX/REjE0rNH9fReKmuamZU203t+CX5bo/zVuVeaCnmT5glUEvG6+691jbTnzJKqUACk2PkTXgU+FklJIKi/hdAnODkeJJ0asAUvnh5lbt4jM2HSQ9cEbqPbInBs8y57uLzh0bL81z/UIKEs5Ny9qqxpbaGt9jLtW3I2r2oNhFAmFI7g8MJk1iDTU43SU6D18jJ1d73Ly9E+Mq/FZUYnNi5p0pK9H1AVCrFzWTAAPyfEk0Yv96FoJ2V1FRlk5fWwe/KgsKz8jfwki4YWiIdSAq8qNUdLIFnLohoHscuHzeK0xo8lRYuNDZfMrlWuiy/zTq3LZ/P4GnVwMsfhhf98AAAAASUVORK5CYII=",
"evo_koffing":"data:image/png;base64,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",
"evo_weezing":"data:image/png;base64,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",
"evo_galar_weezing":"data:image/png;base64,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",
"evo_ultra_weezing":"data:image/png;base64,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",
"evo_slowpoke_small":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFa0lEQVR4nO2Ye0xTVxzHv72lFFpaKLTFFrCKg1mxW1U2UYTBoIq6xUemyYAZt8wXaNA5xqbLHsliyEQy3RJ8z+mYOpZN2VAQiBOFgClCUIayiIJ2NdxCK++KcJd7KtVs2R+7KPrH/SQn59x7fuf297vn/B63AA8PDw8PDw8PDw8PDw8PDw8Pz//Gk/GVyJmRsatRD9qj/PP68UFxXZiRkszU5uzHR3HLiILpC5ehbNt2HNq8FSVZOxAaNIlVmkmaHcPU5hxC5oIVT8QID47rmCkCLYx6Pcz1DchOXYN3Fy5BgC7cLbDXl0LJhVoyvmz9E4mGaejssDAHasoFeAYMQL75POyddij8FchKyyL3hu006e1ddiS8bEJC3CIUHcnDyt15aP3mGMou17HT7E4InrYBgoqrNYzE3xNF6blAXx+Gnb2gxFIMOjrQarmD+htNME7UIyo2AfnycbC1XIXZ2oxnxQeY+GlRWBI6E2UVF4jSlEKFS/VmfHviJAIZH4T1C7H/yHFUV5RjzmQD3io4grN11eybFzwTTrx0USJWH1yHok4LKpovwVJ5CYYJE7F4Qxy+bK6C/xtJsCr6kX3iFEQyMW532/Ak8OC4jn2LTHtdE5ZHaxChVQNwghrvDYlTg9tt+4jQ+0nzkS/wRfsNGhK5CLDgsUNxXVhwrBQ/nq5G9MJI3POVwW9KAIQBDrRYipH2yqs4t3sf/O9r3A7e1zWIJwHFcR2zJC4K67e8DTid2LbrB1SWXQZEXnhhthEJaTOwo/ocPis4/J8PYBOgUqokzcvThxnzMHqzmwbar8PxRweWmWYgQqvFkPUv9zw94ECfYIiMh7oe3mdhlS6cE41JItfPb6EdOFBTzim8co4IbKbVqVUQe4sgkfmjr7sTt+00ghUqbIpZCuv9Thg0YZhujISl7ioM21bBbu/ASl04Vk/WI0rjh2qrA0a5FN39TpTesCK1sUowZj7AMninF8VVNWhuu/avueRZc0mmZlFPVCFr1mKIKTm5HlG+pXcIP1u7XPIvhY3dEWLPb17qekQodYj9KhO7s1YhamYIum8NQRYiJDICixj19U2w0R1IjJ2DzPS1ONVyBei3k3lW+eTnAoghpQ4nkpU+nAzgsgPMznUZmGuah0ZbK4xTpyJM/zyEGq0rEmm0ECoDQb3Yj8N1xcg+c5xkaDbRsZmbhbb1kH6gd/SRidMRei0yhmTdzYV78GmGCepQL2DQ5bAEkRAbN+6BRuCLsu27SJkxQsmtO5B5i2HyE5Pjw+4EO+YKJyfOTl3H7D17Bi20BUxLIeAjAXr6HgqIxagsMqOgtBavR8wkhd0HudkkKkkYIejGagjHhSBe5O1Wfkyd+MPv82Cx0shMXI6GhmaX8mLK1VhjRELiEyy/VF5E+cVSXB+6i3fi5yFCr8Oh1pu41tZO5lVKH6L8xpvcCj3OUejz5BRkxC/GwfwqkgsIzmH3UTIu/QQTZCrs2pRBvgsKMreSkNrY1AqdKhBrJ+mIHOvEZT029AwOjG0iU0BK+l9/r3ElMgBt9zsw3iPALePsuQdKokZ2+gbYaTvkIie5L1NKYdiShKwvjqO4pAYKhQwD93o4HWfOiUxDyZmwcD1SImPIx82CyOlYsyLWHUZNybmkz0lJI+W1QinH1wVHkXPuJKQSb4QGB42U16OC8w7MMsXjvTdjER08HxOCglB4xYyPd/4GDz+GRJ/WdhrhOi3UgQJoNMEYuNVF8oCtly2rlazyo9V9VAYwIUopZGoxvjt9FBoPf1y3t6G46vwjIp5gS42fKs0wjO+E+UIDhu+SSCVwGfEU8SLVI/sXCh5UkhTp2SLtUZmROVcj8o+dvwGQEAy7T5YmBgAAAABJRU5ErkJggg==",
"evo_slowpoke":"data:image/png;base64,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",
"evo_slowbro":"data:image/png;base64,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",
"evo_slowking":"data:image/png;base64,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",
"evo_ultra_slowking":"data:image/png;base64,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",
"evo_ditto_baby":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAEM0lEQVR4nO2XTWwbRRTHf7teb2zHsZ0mTprEbUUVFCgIQYFIOYAIQgoqB3qquFAkwo3eeu0BbtwQUrlEHCJVIIj4kOBGDyAQHCKhXlo+GqVJ23y1SWPHib3+WO9DM+vEaoBD4iStxP6lkd+8nXnz3rwvDwQIECBAgAABAgQIECBAgAABAgT4P8LYD6EdZkYiVislt4Bp+rxld25fzjL2Qygg0LKNVX74DYjSI4/193Jm5DSZdDdzy3eIOBalqMsnX3zK4uoiRW9tvy6tOYTpEnXzffaAbMGpjxtlUWGlvsfD7ep3z2DulaBjbYeVB+g6GodcXccFRwU/rORIHYoTM5N0J7t5qNBnDwjE5dJ7Y7K+sK6HzJZFposiy3VPZD3JjV8RmbgpF86e156IEN0TTzTtgfnKPLCh6XhPXA88IF8Bq65jyiCZOQJPdG7tK+E0e7SG1czm/ran5NUXBjUdTyb80CnXlbaBtarODsWTcAXDCfHsM89zbuUdvWT88leyUc02ldTGbsNmtZKnry3Nnx9PEOrthFQIOmNQcMAKQTIGJdefKyNsE2I2zK6CY1BbWCE1OsRGNUuEqPKIcaAecKnp3w3PIeE41MTFSoQgbIJhQrbgL7TDuisgHlRd3OIGVtbU+7yairUHkAPRlhYsQppu7UthvJLh/UsXGX7rNLS3QSzC8Nun+eDiR5CJQc03lqqH1dkOzx0m8Ug3va3HVPkl0/YoB4wWfacxMynVyzO60Lw09LLmqYqjqo+iFU/jWk7kesEfilZrJu+IanxqXb2HcGAhdO7Um6Q6k7S2pbB0rMPoyBuMnByGotaJC2fPM3B8AFaUn7c5Wq0xbUZPvaanlfUiYz9/xoHV/G8+/LzRbW+URa7kRJZqft3/a13kj7xPz9d8evP21Zgq+D1iyhH5ZVnkVlW+fHdMy/Xl77sHqmys5RtTqfklc73kzw1Bp0eu6M9D2+rdpopSRVZLGKkKt517O1djNwZUPL+yrNy6B7/lkIKD0RX3K09F1fx6uCil3XriatTANCBsw2JeK67gZQuE5ppqRTszwDZb1dVyJNoBURuj7IJdF2GHGrFerfqeCFsNnutBzGooHokS6k5CJnFwBmx64MeZSULf+we/fvJFjEQMyRepVcq+UJXY4RYkv9bgxZSnPMStacWl4vL1t9/pb9NL0zo0N+XvBLtt4zqSVQddGv9V/89ZvDbL3OoymUNp0ic6sNpTrF2d5frMkub19KT9nUkbBrthapnw4FFcyk3psqtGphRXsMKRLV4suZmtdXiV/xbg+rpGwrH75O0GTb+Oho4/LeGITbVUoWSGiHg11FxB8e7m/YTtSjSM3fz+0++TTZ+/F887eZDnW80KUO5/vP8EyXTyPv7tqQXmV25q2sXD+pdoLe3Bm2BPHtgTV3/4hxfOPDl8II/3vwE+uPGKJWKwsgAAAABJRU5ErkJggg==",
"evo_ditto":"data:image/png;base64,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",
"evo_ditto_beast":"data:image/png;base64,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",
"evo_ditto_transform":"data:image/png;base64,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",
"evo_ultra_ditto":"data:image/png;base64,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","evo_pichu_baby":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAEOklEQVR4nO2XXWxURRTHf3d37y677XYpLC2SlrYQTaVpIaEkFBQ0trFgETSp8CI8GMQPDNHUFx5MNKImNZg0PIBJTUh8QMEYiCA0CmpKba0QLGnAKlDbQumH7dLWbXe3e4+5U/tFokl7N/bl/pNJdvacmfn/58ycMxds2LBhw4YNGzZs2LBhw4YNGzZs2Jgd5J82J3AkYpKCvOXMUoRYFa9ZGWwuvnZN/kTnWnML98IRbSZjw+EwTc03Zs3FcgSCC92KhNnuhSPMhHxwoZu5hmTlZErtVxskdHeD1B0plvyM4H8eiYDPo3zNMVk5mapZOUaWI3DsgzTWP5pEIMXD2h1Z+B0qCuOkppEzxbU1FxFY5GHdSidvFC4m4LMWBat3gHVL/VL7czHaojDdJxzcDuZNs3t9NRx8L8Ynp27RerKYjC0xBlojpARS4KobbeMJSzwsCxg/FnW121mxKnm6IdYD7gFFuLnGRVHufFgZQqJ+hhoNSl8+T13boCUOiRAgRw+Xs/PF18c6g9UwcJPBUSEl1QUBPxCGYYNou4NL38WpONCgfOsskk/EHZAfP1s9SZxP0eI9qp+SnUr9uX5KHrnCxdPD4HWgByHzgXlkBhaY5K1ytyxADr1Zyl1Zona/smqQ6421MG8YLd1H/edteNIep6R0DRVv9ysRmt9FxhadDw9M1o65hIg8o9Lg5QsVZl43oyEiT4rIZtm99WEpK12tbGgL1G9l63taoh1lys4cPkGUADOff3lsiyJoEjKJSahYJFwi1xoKpHh9zgT55ss7lTDlEymX9lNlCRHgsjK4v9rDtv1RjoaeYOu2LvT0GNLthAjkFqZT/Y6Pd6vmsWt3Eg/1Rhg8o+Pf7EB6RmnvHLHK3boA7zmN9jQnO/f8BQNJSJ+BphvgdCF3oix9zM/Hq/y0HobL1SGyMgSvnopro0GqNykhAixloX39v9L5fpzoTwLJo5OG+CiaW1eR6D7vUkJN8iY6GvsYuNPDwS9aLJO3KkC70N5L2gsGerahyGJqGD/ZLoFBjbRnR0mtdKoB0eddZO/XVVE7+X2bmsOqgFlPUJC3XC59VKiOAyNDIDEwNIhPv5cyEgefW6VQhpxEf4vR1aQhy/oo2/U7Vzt656QSixivgNZJ1XMdvFQRxP2gDvEw6OYTYoqn4VDRiN52cfPK2MMtd8co6G74wWn5LTTrS1x/vIElQZ19xxtxZpeyp8SLkRVR1RZjzEfTPcQihhKkL9b59uoweyvP0uXdRN/SG9Qc8sx2ecsCtKLtl8bPira38qxAKa+W+bneMHX7IXk+BJxOvOaOM6z+Sy//etpczFEanVg44PMQb/3TpMtrR5r45uKtCaft+VlUvbWCUCjGLy1/KN8ZfHb+L1BVV6LLZOD0VjG/D+53MCuyRJ+SSNMm8/2U0CeEloA57ifzb3NO9UtYBP4GtVDIBSbxdgoAAAAASUVORK5CYII=","evo_pichu":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAGL0lEQVR4nO2YbVCU1xXHf8+zyy67BHkJK7AqICMKglaYGCWTl2bAKDZmYurgpCa0k9ZOJ2nGyUwTCyhTBkw6dtpMgpl2kja1plZTTdMWm/qhk8xYazIlo1ZJ3KSmvkJYQMjKru7C7p7Oczf4gkbZddEv+5+Bu/c+99z7P/eec8+5FxJIIIEEEkgggQQSSCCBBBK4NdBikJEblI8r9BhkFOnZUzMxoV2qzHhhyMQid1WYiRLTnJniSEule3CEEFlAn0SxEzLNmclIOJmBfrcMB0PazVZAjMkrq4sZcp8kNTuPv77VwanugesqYSg+qyQVv9eu6h95PQx7fdEoHx8TCng9fC2nl9+9Wciml83cMS/lujIWs0nWP5XP7m2LVP3oCQ8+vz82xjeqwLKleaxeezviC0MoMB4R2dQ8l9UN0zHZh2hvnk6S7udL89G4yQpo+w+5aHr2CFpKumpYX1vIyrkZiuhX/JE701jtABI4S3pqFt6z41J8Ypy40yVap6tLQr0HefSpdMprS9lelE/WdjeZ5s4r+gcOWSmYYihrxdPh5+nWvcQTWqyCFSX50v7bGTgX3E04XK7adH2LWmmD7ChCH1rQU4bxnPTzszeO8fzWIzc071hEPZBx9j+0dCo729tUXdcPgM9F+JwbnWQgqDZWTBoSOo+WDNrhPB5fu5ff7/1fTHPG0wdk7api/vS3Jy62nO+6QN4grcjbNbTbtIhCYidkGcZ5cVPiCj1agcqHjf+Hue+ueno62sA2cOGbFhoBh51fv9RD4xPHwJGBZkpFcwSpf7aYLWvmE88oHJMC9etd/OE1YfGDy8nJyUCGBiKrn+xHrBZ27TyCO1yDrXg5rz3vItwfQsvykb44jbLySBCLZ6qhR0O+uiofz9kMfvkbF+vWbUCfnI5mG1Img24Dk/DkGrfq29BwJ99vPE3fcD9aik74xAju09c2/7JiTcqKo3ORaBSQjY8XcOj1hSqSlk67HffpoxDOprf7/IVOD31zPq+8spkpU56krtbIlUCGfOhZputG6xdaitn2+sIJU4Dtb5wi2GPh4J6ZvPvuXLILzfzwRyFa2qxqlbVAkLYNAR64N42y0iQ2tmbzWYvg2WeH5DPXGlre2jaTB1cU8v57/okLZHVDU1VpEMc0CYb9/ODRwQgDnxGszGh2UcR7PrVh2mcl7ZMBupq8pKcWkDuv7wriAO07Sqi6N1fFj0jUHj+iMThZluLkx48UseDnRejJR9H8ZnBYVU4knqTIgCGBzCBf/MOiiF+KjQV9FM1ZrkysssLEvAorubZUlVthstL5/gBNrad5+51T4+YWjQlp7b5unv7wOK5NXWh6NjgmIWcFPGPmCllIy0uGJRcz1fqPjiryhvMbKJsVpqllFavXzGTX211jyU8oJOO2FOnb/LCEjq+QUO/XRXqrRc4skvCZGlVK7xIJe2vU986mGnUstrQ0yCjAIeufmSJy7nuyZc38yxK/m3GlZNDrw/GdP1P/3f0MvJOO9E9CkkbQCKpS+u2c2Wll64snuOcXe66QN9FPUdjJgT/+l7qXOoymmFPraIXEiAUvtjg53vUF5k+yWXiHnbS7zqGNJCGGExtKmJOQQTs9PYPsP9XNNFsBLzR8QJcth39+8LEa6NsrZxNw9fCN+2dcqkTUiOYUkrraEn7VlottcjalRwJoK+aoRA6rG/xG2hBErGY+7wxgcVlw1k7HuWCyylAfO5/D7j15tLY2Xjaoq/9yR48WUZ1Cr24op/L+ZA68GaQiLYvS5juBTwn3fY5uipxCpAn/2Z2E+d+R6rE5x9V9oKzygciEWrMqn6sqpDvAhGSo11Ri1In3b74v4qyG4/ZWqzLye4lIYKmEP35EGlaVqP6vbigX8a684LAr52bI7KmZcXleiVlzI/T/5Sf3sGhxjqqbhi0qbR4tRy8x7X/vo3HHZ7h7PaqfcRc27hShCHftlinwJYxVxeFIoXHrMdWwpMLOM4tmkVU0id3vneRbP+0wTq1b/oJ3VTSvmyHyr7rLzvJlKU55rqpQtRlmZJhPdVV+XO8A8YK07yiRg7tq5LG7C2XMM6PxAieH91Wq7/Gyd66CG9nasYQuHeuryMbdlP4P/FqRPfx9C5sAAAAASUVORK5CYII=","evo_pikachu":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFcklEQVR4nO2Z228UVRzHP2dmb23pbhsRvEAIEI2JRotFUm/UELQ8EDCEmEii8ck3Xhr+BOMjMZHESHyiSiJWgghYiEFKUtQAQYh4bZtw1ZZqu6Wl7c7lmN+Z2W1pCexOtwjJfpPZuZ3L93c9vzMLFVRQQQUVVFBBBRVEgeYegBWxn25c0WjO3IcC6GWLluDm4L61wIKHFnA9O8C9gNj/NO9011NRB4rSUbt/rsZOW6iFx0odwxBvWvkcjucTty1+OHUyKo9IFtBaf4K+shuskr1Pr37hZXK5cXNTDvJ3y4WM1vXwJlAODU1XiSXg9JnT8nhW5KMJ0P8pKi5Ty88dofVAC1g+uBPmQVVVeTQfPQvZocx3diGt3VbAK3AdOpksK3lB6Y5MDm37XD9eM/noFofECsPnAiP7iv4ORX3L3rKSj+RCimrc7moG+3MYkoLrhyA3GnCzXPo7Uuh/dqGoMZYS8gu3HAi6lxmqxPZ6rOMtUi3Nwd3Il8HZ88H3A+WL/n0xrI+e8Ll0aB5L3t1fyly6FH4l5XCj8ZGvwHKCJ3KyFXji58I5HM6H7NkqTh3sY+3274udR5sfEzegYtuL6ldSDIhbNLcMBUTdcHhPG8IwwfKnfwOVMC8yKzzWtFYVNSz59SUfN6MSO8WhJAFWNI/S2fUeeI5MGRwiRCJHw4sj9FzaRcNLV8GyTXuVriueeLYNBj+bTANzIUAmU03DU63gJyEeWleECLHy2VbTBl/MIxI4SMzcgtIk8ZHPg8NPyfocvPW9sgtggvfYnnhAMDFK86uSdcQCCnI1nDmcMQ07D6fASgSWcWaOU4gl0Xi2DbwcOCENbXyxJBRtgYn3g/K580AduEk6D1UHQSCULA81z+LUd/XgpPh3W5LsRhftZ/ETYzdLICWFuIpoWyfBl5jxQXsF97nYXlt+AQTDW5KQdKZkGyu4NhPHQCtD3u4W68DwphoS1TdpVan0Xkkx4R0BBV/6ivvIUV1S2i12IVMPHP9G9+7cQMZ3QImPW6C8SR0oDTYF8oZaaw2ppvYZZLQ3gZKKzra5uCeeJ3zTfGW3gAdKJnLPVwV+b2ocmcoPyAucGJn9N8xl5osxs1rfKhyvHUmb9WO8a/5UbU895m4l/rb1eVatfpTaV4YCtxHy4kaJceP/xp9VqBfbwz1fS7xpRg2k8+W1qv06Co9ItVBQXY6cBl9KY4fxHx8uvEw19QUp1VLgh2fPIvakgx5qQdUd1iHRwFxqZoqaSwECjY38DDoN1pjJIKmma5MtTP0TGMD8mFwuASoPYib7qPRe/eGax8MO44UFbzYoJgaCvO0OGgW6v0v6syYLN1O8TXFdiQkcdmy+CCqZl8hoXA9sYOvRP8ztjo0XZk3eDFvsJt6qB697Ph9s/5ttH6eCtGeCefo6G1amXozljb/S80sj5IbBrgJPMX4qQ9W6tig8omche+lK/EFMMH504krY05ushwoIry2PHW/2svONR1Dpfaj5R8GOQyJG15HufONIWWc6SqrRte5k+eK36Tm3LAyf6fPnYzQMZCNMgub1Qxw/0WWsI1/1ei9fuOtbSmVWUdVMz0/PgGdPqV2m7yYJs5AImIRYnLZ36lm2aDESwL2Xy+P7kbeUbneM2FJZiaVgi4ErK7AbDpUASxay/MZfkz3pk5rnG+JbL1P2baWK0EfrvnVoJ0f2fB0pXdjcG6RW/QV+UNdkz1rEVYyaNe2zma/sH7aUWtihh/dtRtW6dB3szm8bC5B3dlquXBztzhn5yJ/X+3avZ+xG8InwsScenJFV0q+3G63Lnlgg7e+F/xIEWo+uk3VB62uvSV10uw1g0G5g7Z3aMRuUXMyVMEbZPqHfDv8BVlFEeRHnuv0AAAAASUVORK5CYII=","evo_raichu_young":"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","evo_raichu":"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","evo_bulba_baby":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAEjUlEQVR4nO2Xe0xbVRzHv33dQjsoLRTLSwiPZa3iRIlG51yybAs6DAiZxDgmRsNmZhZN/ENNTFyiQdww6sRosiViRP/ZRia6MVBndBEExquMKtAuo/SxjhZooS/aHnNPpRlZ4h+9ZWhyP8nJPeeec8/9/u7vce8FeHh4eHh4eHh4eHh4eHh4eHh41h/yT0sYQtxB4TVn8qFtYFbH/yuItoEhze59tLH9RBkhxvoRE7i7OQcpxWKIZnMQzrXgPx9CEhlDWNEn2t+g4nXVGnimQ7F57VNZCQslARKNgiG731Jj18uP0qHVZsLNP5eh3iJHdlZhbOwP+WDotMHwZZCTjkR4YM1TTM1Pp0+cZfSSnh6/f3sR3U362JglSZxMPSHJU922xx3zQF5FORFtLoKlowcrZhe7F5HIGBQ/s3admJTDavVAnibAY/uD1Bvm8TkaVmxunK29HrcWLklMtje9Au2Wh3AaDO4yXSGGkAzzUy5c/24eQqUytvCT/hdgkW1D872VGJbPYs+bpWs8sWFVyO/xoO9iD7Yd2ouWkpM4HjLi/I/nUJChgVqXT9eoGQ36zlyAt2wE0kL5muuXfGEsDS9skAEKWkWg3JoLu8uNml8+w4LFCZUsHaJUKVyzdjo/F5yBsCwLkEljl9ocCkz/7IRcDWxKFnEyIN4kJnvbjiElOxNhuzu60bIQqjQ1Mh7IpmOvP0CbkGEgkoowPzCDFK0OEnk2zD9N0DVZpVLqhY0wAH3vn8DckBWMWoaAMRoGUpUQc+N2eJ1OdG4/SJvTegNhkZga9sizFZg3ZsDyVQjFOwls+gB637FzKiZxh9Dsb1dxdUcZjlaXQLnvAPWESJMKy9hFPD4ShHvRg9NqBZxLBJO+FbhJhBp736F69LWexNla/WoYCjbEA6x4lj05WvjFYgiSBPS4X6lCXXc/qp6Ozh+sPAxxTiYNJ9YTCEaw+bkqFBypAxaDnN/GcRtgmDDF+iToBfETRBwuGMrup+fqL5ug1RXG1oiSJRCFQ5BqxCjaUQZNpoT95MDDnzZyMiJe95GPOj6knV/TJYB8E1IUMvqEIwsepEmToB0eofMLNQdwM2iH8ZKe5gib+Aq1GlP9oxhvaYc3HICzRx+3lrgNyKsoR+7hWmTrCpAsZDDd3gGfQ4DS16rhiwQhYGTRhUEv/FeiJVVREn25XRudBtLlgHMZvQ3vctERdwgJzF2DgtHnP8D0x+cR8PnoyUUEaR749Q5Ers1AMuui4uccBkiL0mhJZcWXipV4cldVvJoTYgDFG16Ga9KAgc87YXesQAEGg8e+oYlqM91A77ddVHzli68itzgf+i8uwDY0hbzaJ/C6uAiRJQdnAzh9CzW2NsFTpMLlo60wdw3Sk2xisoQnjTD3juHBoTYq9jiAiY4fkJqjwl+mEew0nYN3YJyzAVxqMPmD9OBU+xi6+/ujgrsGV/ejVaXx6xYs3ZMOf4TAZrVj8r1TcI/NQPdSHSKLRujbfueqgTOr/7a3/ePeXZhBfCsBsvVIPW2SPNWt8wn7JxYkYpN/4VaR63KvvwGPQ8uqbiP/XgAAAABJRU5ErkJggg==","evo_bulba":"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","evo_ivysaur":"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","evo_venusaur_young":"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","evo_venusaur":"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","evo_charmander_baby":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAE5UlEQVR4nO2Xe2wURRjAf3t3vd7RA+QshfKQSoEq1asEii8e5dFUY9SAGqipTRErUQgVEioq4S0ipphUrFxBDMRQMIRGTFARhJImSpHano0hpMViCuVRDZb2Ss+9HbOzcLUk/uH2ABP3l0xmdma+2e/b75uZb8HCwsLCwsLCwsLCwsLCwsLC4v+IEuX1xC16T9QXFguTFBZm2FHjujod7VB8JExxo7ipRvSICQmImg2TRH1TtRBasxCb3EK8jxAldiGKER1vOMVSn/TMP3mnRzh6IrwyI168ltFC38zRMCgRaldBpwZXbaBq0Btcw0KseMIJhFgfkEZE1RO2HsiKb+xp9Bk7CvHjCUP5L/yghaCfAh1QVu6kqtIrjXjnWQU9zLwOJaqeUMwKLsp5TOxLyCXVc4XPvfOgVQGvC9QO2a51TSQ/8BDO5hN8fE8FKcNV6RnHWxrhKHrBZlJOzF+/jsIV2caTiy7lbdBw2s6hcduxvb2G82lzecQfBrcdnIKHE+A/EUJZG0+yef9FpsfY9fDutlqWdweesUn4mw7SsGkRQ1wCOsNy7HCOG58nehvaZkJGaNvSyXnh2te/Ec2odOOWf92E3Rbu6lejf5LazAgpefvYX/Q6T/tTWfDABrisgC0UUb6gX1DWF+bmkfRqMTPHxRtvchoT+vTqWqtyiF16IzjYY8orilkPtP56nJZGB8kFLxm9X5WC65oFMW5qg+kc7cxl0oCDJJ3bRd/e0PCTg2HeGAYUXyVXEWzIdtF8TmXYQfOuUcxeXlufc5Byv4pwphNQk0kL7ury5xWb0dbt0Y2KAbXRLYeWfNAh63UJHtzz2iFB0LHGI/t6nW371/qYtNwpfJ6QDI3Hh2j4hrbJs572WGN46hxqj182vnycgtrsovqim/LA7xzyFVJxuIRL915laMFwGH836pIK1EMOUwaYvIlDSqAN0VT5G6OmxeAe5KCuHALNnfgSnez6Y4w8nTyNe4jzxkiJOx2t+k2MqFlE7XeTGe1/xliq6hduC/qNenK+QxzL8Rp5Tv/USLGDHNPzoJ1ZTiE2Iy6vNPIhPV86pWkyfwoO9ohQrkvWZvUw5QFdwSOL3aQkddJQ1UpN6WyOzSqLjD/on0zKn5UUbAlTHRRkz+guPyczk4mXjuK7z8nzO0K3PFMVgcJeMts8M90hakpnC6EdiBRN/UTWj06bpqfYMiOV5T1Fztf3j/RKEVHJUk3dAzklQdR6J0X1YebvvmRYpZ2V5Tqn62ppzN0MCw4Y90Ss4MnvVZb6QoxP1I+nWFze+J7obtoAfQMrUz41jsNZGdmUXsnsNkE35Mu922k+3cCEzHepOtWPtDch0AavJDhIHqlRdkCw94cWuR63CRkK9XkO8dRyv9yYfy96GOkbXA8TfQPrd4cuU7xmq9D/I6L1g6OYEVpWKcTaqQOp2TSFtPQ7KFu6jdHLy8n/qCIyR0+jP5zVH9+LWbCjhHBdHTEbO0hevBPvxRoShyezb/U85fb9kfWNJ//oXWxJnUxy/8/4efUMjlePlEOJtgs0X2ghP7GQ2SMyaPp2N7EBI+QaNuYxs/wMI6YOZMyMl0W4HdZOUG5tKnGN7iHgHMCKY+cjj3qyV71nm2yHNbs0WGdZeV1kztoeKH6dm7KB9BCzx4H+dW9E7181pueKX+cvt5wUC/tzAowAAAAASUVORK5CYII=","evo_charmander":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAEuElEQVR4nO1Yf0xVVRz/3Pfj8mCAr6DUB6RbghNBY7BYOSFrrKYiJpnYD7CgZW2VawlpbK1CNGqzwrkoGwFDMJcJ6JAf4mYzU1w/Bj2E2RgQAdVDHrz4cd+999vuuUwi1z/ci0G7n+3s3PO995zv73O+5wIGDBgwYMCAAQMGDBgwYOB/BOftPN0qXia9F3SCo9CHRQhRZpqXCiyLMsE31Ip5CSHKTHTUTkQOGt5umn8eENyTy1WM4pc6C24FOD0XO/TMo8zqPh01qOoXgTEOtf2AJJOufGYFx8qKiEa/UJsSRh+AqBD0eRJL5lkLJ04v4R+/px44XqUS/P8mr6+EkmozdjRIuvHTNQeiHntDFb72JBDMAXeIjF5wcTGePmUHJCBjg4RP17CcoDmnwKYN8cDA8BRBAlp6guHN68EPd+7EkeMWwBfYdpeMCLsZc06B6tOX4OofBngJmDy7dsddZn3biXxY/VRaQLyM3Su5uaXARgdH1XENCBr8DlCMK3FqD+DrK91YsWXv1MeCGb2jLA/mhgLhkVFUc+0Ywlw/AlnlQJAd4Lzs3Rn3MtaviV2AjPs4wGNj4xA//UOIm+nECLuZWnb5od3lh+ilbggjVvBBI4Bgg2vhagRcc4IP8AJWCRiXIXRb8WKDiM/aRW5OeKBjSOJiW19G271vo7FZ3XkEVwCyPhHxccy3yGziAbeoekW2zIrwmnNgYrALufsL0esiZm3eJiAtBrC/vwUZDjcQIgJ/+iD5I0ER/qb5njArKY00bK+6WGTj3aoANbsA8EDeUTNSVgVjhW0I8hiHinYvMs/KN5UUwmTJzbcq2T8z6OZSO2eiPZsd2BrvYGNPbxeWkxu8QwaCBDSesyCpUpzGc3i7iWwtnCYFLHp5YO0qB9aVd+CPSdrqgoVody0A+oDogAE8EGZGkr+EBg/dsL71fglItkPIHyEtSmhC5nILUT5P63PKiKibiIqJ6EuillRS3r2TaCYqmlbYQfbzZ2MiB2tabm+aklgR8MirIpIPeXH6QCKAZgCB6suoJ3ApOgeLlI1HnO5o06iHG/lGZS1muzSFkPYLTa+F1fwqhqf1ykHGTl+LyJK7R5iaFlghc97oAVjfm9AUOnrEHSlFWvv1TgBnpzzAlAhExENf4cnr5VgabEL5RRldFhM7Q5TQWiRyeO6CtrNBswee31+AM6/H/oOqCn/uSiDSpQqYA03M+vVv+SDCT2Y1VG6q7v8TZgRqam4gakyi8Aefosujo5NJXMzoyl3hxg1NSdoDPpTkz1FDmoVd+iPs2n+9aDUDd+G1R4DfmpE9UYln0/dhn3MHmse2obF1jJ3UDFc9AFkhjPNseHBJMeJqORZKWhXQvIBSlWbfdhXpMRaUfi+iqlNCyEvvomdoMRI79uAF268ICDdBGFR3otTacZz6WR/emj2wt7iaikoOojPrBE7Gf4j0JF+8kmBGU1kpwux9cG86jFJbCpCwDnxBKfjNa9mfivU5ZWx+3k9KGaQNmqygCFCyNRo+kSksXBJ6K3E+JA0ZhaqAlW/mYsKpXvTZN84q/N7mRFqdiNAQlXXuSu4/30b/FTvrZers62HPZud5SJEJ7LkuY4lufP8CAEUKXIy2cywAAAAASUVORK5CYII=","evo_charmeleon":"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","evo_charizard_young":"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","evo_charizard":"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","evo_squirtle_baby":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFlklEQVR4nO1Ya0yTVxh+Tlv6tbW1IC1QoFTl4gANarSITOdtEySbDmNM1Lmpc3ODON3FTdmybMsW3YzJFNhMjCYqbhpH1ETJjNEpwdEIQako46JyLdCKLS0thdKz9HRp4v5ZGJLse5L2Oz3veU/Pey7P+5wP4MGDBw8ePHjw4MGDBw8ePHjw4PF/BBmtjmKIkBKJDOAE/gq3FxIMs2KTyzlq//NviDBCcERE3dSDufmfQJvxEnpbWwO2SXFxaPvzOqyF+6iFUjLuAliSvZLqly1mZfm8LKgnq2EfXBiwK8QDCE9IZOWqI0W03WUn4ykA6vtavvkN9sPQ7EBT9X0ow1UQcVLcrjKw+jnLczB/6w5YukygNy7Tjm7TqAYhCNaRI/7YG5z+wXc9sbLBe0JE8LhdsJUcgvPKBThsFphtFiwr+BrTZuuhIoSOhwDozv378fEXW1CUvRj36usRFRbKZv5xUyOOv7UKuy6cw4bVepRufBUTFAr8VxAF6zicOAfS5GS0NzYjxWGDQMzBO+hmNqfZhJOffYnOe3cC7fvtdoyjAAQI+/0gmhu00Ej9XTgHHBANeViZoyGoOlzIyqrslew5NOCnVAWlsOA5B8ARAcw9/mFMSEiDNjoacrUGXrsdErkCuvmZWLc0AXWGGpTZyVOzbycEoKN3DEgwTlMAGpf3OdQ7PoDmVhViklJYve8gq2QcO8j9XV3o7ut/yq+9pBjdhj9gDZFhtNiIBOMUr1RRRXgYlNlrMWvVGjw4/AN6jZUYVEYH2gxaTMh//zXEb9mDYxerULnnPRT+tBOpWiHWrjkAu9WOO93dIw4i6A58qyCUypCSk4v8TemYGkkx7PIG7OWGNvyV9DoGHHa0lJaglwgxbZICGYkc21rXqttw+0EjeW4sFL1gCdQz9fCa2mHtoxie6EVLnzBgbyJaGO4YQbo6kBAeCv3GfFy+eg3VxQegiYmCPIQy/dRBh0cURFDOaZGRNHvXbqhyt6Lm9EkYTxXB1WUGkUghEwnh9AwjQipg20SxMIslMY1aznxvnDiLW8X7mL2Pk0GhVKG/I/jVeOYViJUq2OB9EqK07AYeXTyN7RtfxoJ0LVsB3UQ/XcqVYuz/5iyutDQzFjINDjGaTczKwnBoGOq/L8CMTXmYtXYDm4TWrz6kva5+MiaZuG1IiustDtRWVGDI7cGiRTokZaZj9vQ4Zg+Pm4Lo6bOQ9+kqLNOJUf1dAfrdA4ydZAIO2lQ/azWWlsDz2MJUqyxIUfDMK+BTlMZTRYzIaVQMrF3tkIqf7iZcG8Ge8bPnIiMXOLNuJxyPn2BF4VGYHzXh/EdvgzocyMrLZbrJJ7nZPcL17AEEFXZtbS2xV5WzAxoaFQuHbZDVu20dbBt13q0JtE2L9WLS3AwW6O0TRyBsrELOzGiIPU70a6ZBEq1lStWXvceUhS6cPUn0+oV06uZ8lBsMgX3vY6SKOg+WKHtYQD46XbSjABKtFjf3bIfeq8Lu099iac5etgVtXgFUURo8+kdHjaWcpvLwMLwwLx3Hztfgt19vsvrMVBH7WM0t7BD/eMbAMvWK6Rpk7y3GpR4p0ma+i4iV66HLWADruRMwHj/CtuaYroCbekh7nZHWVxqgXb8N5SWHcGnNAcSkJjF7n9mO1rpaCBJmoKPhHkobAKHan6lbao1QlPzMyj4KbbZZyBiLORHd8M42rH7zFbTpMmEyO1DvO+BHD8JYWgYbCBN8KlBM5sRs4MkpsXhickAYoYVaKkVn+VXW18MRvlgY0Z1YmpwJ7f0KlP1yE70ROsSnvwhvkxG2XhtxUy/EALX7bmTVlZhvceNhpxfdzXcxwIWg3TU6b0TISJx9SY0TcxBwIfC6hyCXCEEmTAxk1ZhIDZVRMJubDDGm8bVxUgEae0ZHjf4NnL9AjDsLTvkAAAAASUVORK5CYII=","evo_squirtle":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAHuklEQVR4nO1Ye1BU1xn/3V32wb5gF3ZheT9XUKmgCYJWjBiBIFqbKnGMxkgjto1xpk3bmNTUaKk1JtGMHcaUpM3UsY118mirEZNR0xIQJNhgKMgbFnZhWV7LY9n33s45G2icNDNhu5b+sb+ZO/fce77v3O937ve6F/DDDz/88MMPP/zwww8//PBjYcD4YpGIYDnLCwiAw+kEOc+C73ChY2LMJ8/4Kvz7aV5AIxCxJqcdL5w5AYPyfrR1dCFIKrxLhvvDPWzrsPGekWC8VczKyGA3HDuDaFMT7N/Igy1QAbfZ/CW5xuoa3Dh+ED3aDub/6g0sf7oM2as05D2gpkEHYAKCAD4cMybwRMEQR0dirKcHy/PzqHxYRRlb9+mnPifB8UZpcf632NkxMZ4YLhEKYXPaIYuKg2l6DNdOvIBglQr2wUGs3VaEZTtKoUldPqe3YAQE4LIhDivSuQO4dLGWGs8L4MDhdFMSJqMR5pbbUJq06Ll9i94fbdNCkFsIddYaKMCwC0pAJFdg8/r78cT2lfjz/p101zkCAeCwgq9Wo/rcb2G5ehZvvvVzvLN3Kwz9XQiQyWDVGzDhcCOAy8WCEVCAYYufO4qe2GwEMhmIiY+7a54EsVKtxgdVjYhXrodcIoVQLse9BGe+CmN2FpuWCJAZq8KY1ROTbpvNs5hYTM+JFifWrkiCYngcgUIJdSWzXocgnlch57ssJPr83B+9BruOH0WjKwIC1j03b+7XI2Z1DkJeOo0kux6SXYdoIPe2d8AZKEKoSAynywVfgpmvwprcfFaqWQpp1oNYX5SLqUk7um5UITx1CcTyECojlfHRevMWWi++A/myVRBHRqH+wjlo3z+P8fFhn6ZSZr4KJA6W5OYhreQAhmpr6L07nc1QRsRR/2cnJj0LB8mwUjyNRkUGmmv+hkdTg+j9n/ysjFnYGADLqFJXwDXYh8n6SiRyRrAnJw0rJRYkTHXTa3KQcdC+52Hr76A7H5QQi6WFD2D39q3smli1z1Ip460icSXyFo6snvnS3OTIFMqNKbj19p9ga6yiRezjq1dQpAnD8dP78XjBPtTWtfmk0Zv3AlFg2JVPPovIkn2oOvUyUH15bs7udIAfwJu7FsplSCw9hOyc+8APC8fbpypgOXcMm0u/i6aqa2ho1qNF18f8z7IQ8f8dT+3FA2U/RsUb70PYXI2qhlcxOjwEk3GKyoya3ViUGkPHG9YdRFiMGglRUnTrDPjmw5vQJOLirxW/QHxKHEK4jv/G9vkRIC3EuiefgeTxUugcYkSEKTA6ZkBXcyc1+osY6dPRe+SNiDkcdOumMDY4DkGwHNHp6TDmFqPn+gV02zkICwxkHRbrXIU2upyMzwmQD5b07SXI+t4BWqwMjXdgbGmic3xREBbFSNF2pw8hYg5CY6I8Sn06RKpD0N2rh5svgoAnhM1sQbBEgRVbH8En2lYEfPYPFB09Ca46BhNTVozfvoG6106yJFH4lICMx0PW3qfQeeU9WonVBRvR2aeHUhWOhGVKsLxYhPTpEKySIjTS80ETGpmEvC0b8frpX0L84hkkx6swqeul3apAHEhlrOZpRGZkIzw9lV5rNckw25xoPV/BDlksjM8IuOxO1L3+awRyBbC4bND/7jeQDrTDajSgtbYTi3JiqdzMtCcrOyZB42Lnw3FoqhJAd/kCJJu+g8jUNOjvNNEC5xg3QiiW4PxLhxEXnwRxdCLdmCXr89Dx3lnAYvFdHSDpru61k7Q4Edws/xXaa6vomPi6c1RLx/aZiTnjSVCHJ4bhjT88h6nKP+LK6Rep8drLl2irXfLTH0AukUFm7IPj1nUYrv0Fo/UN1JVcNuvXMv5rEyAgfnm7/AQ63noTOrAMecVCVTgyMzVzgUyO+vp2anxKdpKH4PAQzTiW1hZc3FEEyWg7bbVJO04Q9dAj2FZZh8UPbaExQHomruDu72qfpdEvFh5ayJ4+jK7mm9RY4kokoElMzMLQNYSDR67AkrML3z6QjmkXF9Xlx5CfuRsf1P8eSqUMn71yFKrFaQhdvhpDHAnGOzrvbSEj6TRrz35sfr4MprZmXPz+o6isfJa6S83VdpqJCKERvRU7io9BvP1HKH1ioyeVWlmYDANzFVpWWAKRIhjj/2yAfOl94Fmn0Hji0LwqtFcNulgQQDtOiVKNiIIteOyxcmp8YnzQ3M6TWtDc0QtVsoYaP2WyQcAyUMckQBCRhL6eXsiTk+h8+NoCSqKh4tS824t5/5UQw01TnaG5h34ukra6bdqOI4fPQa0QgpFHgh3XU9lgiZRmIOW23VCHB9FiRv4dzc4NnH0VA2QXY1MwWPexV79e5k2ABPPER5fYdx1uqGI11AUWPViINgAt196Fw/gJJlyeZjM8VIHOv38EfnI6hpM1MHa0Y2bMROfMVgsmr3/4+aof0sQAL+CVC5EmLSkmEusK8yEWiWAbHUFm8U4kFWxFcAAfNrgYcmhHhhnOiI4aLeG6kLY4mbpNkMjTNujAMrOHN3Z4RYA0dIL0HJQ8U4pifjWGdQPUwN6b9XBrW/+jjlHbjg0RM1gVPk3Jmvs9bgQfYN7MY0OVbCDD0OrM5Xs8kCMQwm2zQiiW0uvG3q65dVOUKupPFpYF0SOyBETeF/9M/wUBLjkQiTR7twAAAABJRU5ErkJggg==","evo_wartortle":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAKX0lEQVR4nO2Ze1TUZRrHPwwMDAz3YbjMgNySVFA0I1HRzGu6qbmZlmu12lkvm57dPdWmp3LNtc22TtmJttwtd9tjecnM0nSP11OQaIYiiiI5AiLXYQYYGIZhgN+e951ArdXAS/2xPOf8zvwuz/v7fb/P87zP+zzvQK/0Sq/0Sq/0Sq/0yv+veNzoCwYaDEoLHmhQ5HXn+cmKiht+d3fEi+sUI15Kn+HpzFq3mdLzxVc8CzYYCHvpOaXoky34GSL4tqL8lpHxuJ5B98yYo0xdvorwhmLOBSUSpPGhocV5xW8nqYtb3iTnw48pp+2WkFBdL/hfDw3DHDEAp62Jpvp6PFsc5Hz+H6nT1GBHpwsnKnUQ0bOWEjzlAemxn53APTPmKPqpD9MnNpB/5dZSU2PBz0cDHmr53ND/dr546Tkslhr8g7S0FJlkOCXPnIt/2gj6BfgpPxuB4cMzlOQZswj3amfL2vXYUOHn7QmKq0tHgH38t/PcYfPNMZSQIOkZY1wCxmF3U38LokjVXcWcnGzSo7TyOPLBO/jqw+hwtLqtL0h4qPlo5XKmjE3jDsVE7bGvL+kAYQFagm9BFHn1RPns/s/lr3/KMPmr8vV2P/BQ0+7jhe3oQY5ufZcdJRpi4rR4NzbSKnTaoLbRftPB98gDt6eNZt9H21m/JpNwH89LD4T1FReezja0oZHMn70MZ042BOppDQiQHlBsde6PabQMT4xTfnIPBOChpC5+mmkxGoozl3LQmHjpYWcIAZ6J/Vl5dwCtdhtnjDp5z1xdSk2bpwwhs1rNlBQNTQ6DcrMWOq9ua1bXkBuXjjLvXUYbDNSbSvAJ9JdpVGYi4NG3/sGJrAPyXB3dl9ayMrwCw+gwlWJttBMdpiYq1JfoMAcnK37ChcyIlyLSYKj1AjGzFmEYlsFFUynRibFUnDlLYlpal64gJVJpdfZeImcvIuyOuzDv2EhL/iHmjzNK76w9aKXF5aLMXCO/PyguTtF6QtN3E15Iu8vFabP5R/H1xI3Khr175cniCRNJSYzF3n6lggBRXGHmdFM5rz+7km35lUQkJFG1+R3mjo+ln849dyrrmlmzp1oSiNGHKwtGhJIcE4Sl1Qudd5vUySqqZ2PWRaoc9mti7FEcxvaJU9IyhvG3FVMI0QVQZ2m84nlNmQXD2PkseGQhv5meRvbxi2z/9xZ+NymCUK13F7DDJie1DheNdfU8MTFGgv++WO2tFJQ3s/V4XZenboiARh2mLL5HR6Ud2mIHs/GN2T/Q8dL5U7D/FA8/9ioe+nAG6r0ZEeFgQGIoddYWCX7nqSbKzE5i9D48mhbQZXkhwvoabw9aWpUuT/152/lreqFHBFbMjJNhIIDodQEy3ydoWzlvd1vXGG+k6NARjIEKI+J95YQ1hPiQa6rngwMXpE58vJ77BgbKEPrTfUbpGUHAw9XMvqJm8mp9mBzrZFp6pCRdUNbAW3vKrkqi2wQifbWKWEmXTkuUFs0+UU1BrUJDY8sVeqOS9ZKksGQn8JCUO4iZNs+tYDOj+vKf8nRccpi0urD0zpM2eU8QF+/19A3iV4NUVNQ5eWFn+VXDqNtptP+902HIaDbs3sCUpmoyUiOIKrMRqg3umnwibg0hXvj6+3DaZGVXTRiGxx5kwF1DGTNpBKZmDVXFZew5cZw+Fw/LjKTx15JV4s4+wjPCONbDVewvqoFBkThb3ZP6auLV3Sp0zKKnCYwK5zNg1+4NFOyvks8WjgskBKiztvFxrpV6uwfBWoXiYjNR4+9n9KPzSIn150KpjVZnPTH+PkxYsJRND+90e6zDR3pRWD4+Qoujydldm3aPgKhC716+muRYf86cNaPTBkC8kdMFTRSdvkiU1q1XWNVCaHgE2vB4+veJIvSbQ4i1qrYwnzJNGnZnh7teAvoYIsmYcR9Hs4/Qz9Iox3n6dZBX2YbZ0igTxQCjT9dkvu5aSIAXLaPosAryymnX+HJm/2ey2ty3+Q8MubMfNR1B7K/2lSBez3yCjzY8zqq/TGHDntUYGs9xcNNGWRMJEfWSOEQpPnLZawSp4Da9OwG0NzfJY1uhU8b/wnGRMiQ7w6vHHhALzJPbt5GdUySvdaEhWCoqaDNXQhDok6I49NUKcDnYs/1bJt7f1z3Q5aDN1i5TanpaAid3FXJ02w5GThgjOzXR6Ngqa2gSVWpQMOfMDtodrVhVMCopmLcTg6XlTWU2uQ5s/9pCi6vWo8cEXE12pquy+SRzDZX9JhFmjHMP0EdRYC7GXFSJPj5Ygr3aejD7scnyOnPTOll2xCbEY8o7Sk25hXCjjj+++gp/feppHoxzZzKRnpONfnLiCsv/GPhrElD7awnVP4Cto4AP9pezesmTUHHO3VWNTJarriDQKdLqge5SQYAPj9FJLy15cT6wng9fXgbPrCH3hd8T8+yb7HhuKauK83gvYQBWe64MpV2nGmUIebe5ZK30Y+CvSaAz7yZFT1B8vdUUlpR0vkwRoZE8OlGGTqccOHAeY6iKcmuH/O0i53KQNPhOrPsqZKv5eVEeqZFJaNRqxiQOpqEDxg7R4OPtxeOjQ6i0Onj+065v3XgWuuqejtqXIal6WRMJ8GPHJkgP3P5d/AsvdJJcs+kYhqlzyFmxhAVAbtYrrHvmJfmaLUdtePqFsa+okfwiK7d8W0Ws3l+UKhKgsLIALcCfzSuRDwV4YfXkcSlkrtzIyrXb0WX8An20kaQZsyg/cgSvvtOxOhRZB4keYevGb6gOH0rKy+uJyJggG6hbRmDW8jWKauBE3ntlHaj7ytgXVakInYIvTRK88I6Y5FkMZujip3ho7gQS+8SS/sQyfCc/wtJJE3l+9xE+LlTIzy8neMnz8t0ddTY8Lu/2bjaBmXNmK+kzZmIcls6JpFlkPrtKghcTWsS9EBEybZYmNr+/WzbyooQQIro2faAfg8ZPIs87XvYLuUdOyU0vkeEEcFVIYI/A94iAcGvkve5NLVEOpP7yITL3VfDuC2/KjNN5CCIinL768njXWFFGNDtbsLc45SosNrrWrnkDz1FT6T9umtQRnZtoWx25B2lEuXmT+HKpOVOIadRYWurKURx2Bj60kB1b3ybg/d0/0C2tcqIpN/FVgZlQtVpaXxA4X3gK88Uq4uNi6TdzrtStPVYI5SUSfE5Odo+arG4TCMQTs6hrsg7IRv1E/ilZFxlnLuatv79M/QUTdkez1HWpdeiDVWhPn4LsLAZnjMJiqaPNVktBSRV6tRqL2LHYsVGGTsXeT2k8e/q6NoB7NECEkSFtlLS8qvWyPiAinLIXl5JjupS/RfvpW1eDd0ISYaOmooQb5X1BWozNeW05HWYrQfqQbjXvN2USpwwfSer4KbIs6PDWXDrqbD9o8EsvlHiIjSxtU728Fmk0OS5Snosx0bclSYvfCPgeERDWF13VO6sXMdl5GGtxIaraMiz2Rnn8L2kw16EZNEJOeLEptuKuBjlO6IvQG5Q6+IZ36brFvq/BKD8k6hMhogz4vohyI/9SuSHHiHuOVpf8y0n89STHXvZX1PfHXI/8F3Y5hBFnkIrAAAAAAElFTkSuQmCC","evo_blastoise_young":"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","evo_blastoise":"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","evo_eevee_baby":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFWElEQVR4nO2We0xTVxzHv+3t41JKW1qgVAoVBQSBOMaEVcXATHSCM+Jjj7iHE5folmk2nSYL26JzLks0ZjMBs6hxLjPZdBANKNMtcUN0jqFRBBkPI+AoLVSg5dH3We7pMLK/bOsaTe7nn9t7en/nfr/n/H6/cwEeHh4eHh4eHh4eHh4eHh4eHp6HgAGIjGUJHhOEgQbkpatx6qNcRDFC8kQaaOqwobvbi6Nb59LdwJNmQCQWoWdoEAOWMexcmRnwC8sK9cSYribLMrUkM15Bwm6AcbvotaZxADEKATgxDxFFXjLqyLtF6cSYpkfVF8sxI4NFS79NgHAbkIhFWLEoCZe7htA35sDqZw20Hubr1CQnMZKuLKamFtm8Wo8XC5Jg0AlRf92E49XX0XjTHqp2SsArwHWgMuN0RMd40N3jRnwMi5Y7wyico0Fqihoehxunf+3HuUYTTD4XPl6TQuNO1PWCVYmwtsCA7+q7ca13bPLdnNmgdyLIQIaUFeqQrFbC7vQgL1OF9DQFbGNuEJEPSqkUx6p7EKtkYHO7sL/qNorztCiapcGBup4pqfNGcS6pa2iDeeS+oXAYoJCyQj3efzUDTo8XE07/VAKPx38VCdDc5UJl9XWUv5JFd+VG3+CDK0/nuHx0Ff2xYN2P8AahJ6Qi4gpTLmWw9c3ZGB50UtHEQ/xXkQ8DZh/Mwz5q4j/CwdXM519/gJkpUsQZ4rFh9T58c6YpfAZ0Qgn5/tROZOXPwA/bP0V2jhaqSCE27G1CyWwdSounYcTpROmHTVPSg4v75PU0FG1YgRlPz8boqJOOj1uHkJy1HS6vR/C/dqFJ1HEsag8eRdGCLUg2aBCtYrDr8E3U/laJDgeLtnYbWEbEiafPc51qR8kscnJ/AWamKiHXqHH7aiss7V30f5kmmp4xgRK0gUkSxQT6RAkcEx5oEyR4au474IpSoZwqJitVhRWLdRDCC5mcxZ1ztei7cp4aaTtTc99I2AwMTnipoLdWpaL+oglSEYOSzOkwThNje2kaEvSRcHg92LcuB9yJy6WVxeov8EmkYNF95hRcQ3bUH/sZ4w4HwlrEXCHu3pYKKSuF28VCJPTSVHLbfLDYJjDBxiG3uACj1nvYs+csCvRiMCo5ZmndtNB9YGjXav3Lif5BO8qrWgLWFPJRzvXx5VkiDA37pzIYGCqcgxPP5TaXIgNWH87X3EJ2thpiVga9coI+w30YJuqkeGF3Q8AFzBF41fxLkiGGbN5Ygi1bluBs5QnEaf3jnCxVWh6y8+NBIINc7oU6JQMHK7/FyiWJaOkcQZzchxsWJ6IUETDopGhsHkSUWAirN3AdQRuInabFe9vWo6HuEpZuWgP7KEPHldHx8Ln/ph3mwTY5Pz+Bngkmkxu5C6VIhF94w5VRVP3ZC7vXF1Q2BG3AY7Vi/94jyMtKh6W7HxGaBETJvejvbKJpc+n07zAPRcK4yIAjh2qxtCgWHV3jaAZw4GQbIhVCXGi1TbbZcH8L3YdwXeblHa/RG044x+HDF6AwdaC5+R4Mi/OROtGFWK0QdouAiq9pMYdce5OEPJGGlZBlc3TYuOkZWqhWsx1uxzi0KiGOn+9CHKvExc5eVGybSz8v6i70YdeJzkdmQBjqBFaHS2AddQAjVtplrHf7sCBXjqqfejEnOQYyGcGXFeVYX34ZkT4JWHEEF0YeGwPGdDX5bGM2DlV34mqbBc8tjMetlhF09tghgRd1HSOY//w8tNudECuEcLj97fNRIQgluPTtzaTn2i9o/+MW0vIy6Njd1juIiWAgUsjQb7Zj3toyOv7gc0k5i+hYdcVXIafSP+IXFZaokjw5AAAAAElFTkSuQmCC","evo_eevee":"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","evo_vaporeon":"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","evo_jolteon":"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","evo_sylveon":"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","evo_oddish_baby":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAEi0lEQVR4nO2XbUxbVRjH/6Wvt7RAS2GljHcYm7ANcIwxM2cIQVz84IwhYpYoiVOSxfhlOBbfcIRM1BAd2cxm4rI5s4YPi7otTsBlwiTdC+FlOooDSYFRSlta1rf1BY65p9gF/WK8Rfxwf8nNOfc55zznee59nnueC/Dw8PDw8PDw8PDw8PDw8PDw8HCHLF//VM6ZGEQJYZKKPHMhF1vatiKGYchf5ey1Gk6IoqVIKBeDaIug0wJoAWauMESkdqG4xk/l88ZZAGP43zqw6A1i8NgI7bNGo1wNWYYIRKvFjOEejJ+ZsRoIoqyPhoj2xQIkb3/0bH49OolFq2M19kPU3sAy1EC7fowwyqexmCSB86oDMVYjFlfBeJaoKGWTVqCQQe4K52ju/gOQ5tCkBQmGYL85jIlr50DcD7Hk80XVEUEUdBDNpnzkvt74SKJk4HEtQOr3wiMQRsRekwXTHSfYcIqaEwKuCrZV1hDG40SgQAdmz+6I3G8hcPuDEI1Pgty+GZE7SrbDfOkLBExzUdmfaw6Qp0qy8HFrC7q7f8arn34J3bO7QSRyCOCFa2gcT6gZNH/djjmzA0OTszgvdUKe8Q6sp4/DNjJKuDrBZTF59/2jONLUwJ4CVHCjz4A3T5/EQkoBpAIBCj0uNB+oRVZWfmTRvoNN6JcrIE6Mg0nfgQeGHznZwekkrnt5L2z2WTQcasQp/Tco27kDOpuYjjn77+CV6goo4xR0/L2mD6n8jeer8bjXjVDAD01uHpftuTvAcqHrFj75qBUH6+rovTROSZ++wz4NpVyC8dEpOt78wWHY7Pepk9kKGbw/9XM2nnMOsHG9NV2LXeVVKNtVTGX+B67IuMsbQFFxDsqKnoQqRQFNIltnLJO5HliwY00duNx5DUeaGtHT9wNbTKC7uycylpz2GHqu91EHDANXI3J2zvdyGRi1CDP9hrUNoWZ9B419lomJMRxuPQ7jzs2QKeORVFGM83dncKz9q0iSn9JfxFvfdcLtDmGm6wrnBOa8GBASMUTYUFCCouoqDKfpIA+Gn4lXvERb9hyQ9PZiUaOFu7yUfn3MJ9uwLkYNSUUFBtpb1u4zmr2vHurN+bAZzSBzFqh/6QfRpUAUq0LI46Ati888RdvJ8REk1r4G2fokKBQiWHsGYbp8hpMdnHKANV6Rl0BDwjdngaNiD1QKMVu4UYvmHXbE+MUIpWWG52duQODiWWgaDtF183cYcIXT69NsyidplS9AOHIPo9c7kdrwNg2RWGX8inkL9jlaBwm8QbgN34aFaSpgysGexmuZA4BSlkBESXIsaQVISK4EU1IYTlDHPOJUatqybKx5Cd7FGxBaAzCd62Kr0qjsz1lBfGkqyajVQLcjD3cvAd7b09gmVIMJhU/kP+kVWFBab6P9gQ4pfONOLNy6v7bFnBhSwuQkIDXTA8wOIkETi8nOIZz43bii/pmYGEV29kagPvyPkF6lwujnTro+CP9/H0J7n9tP/1xsFhMsk8MrxmJFGkhUakgYWUQW8D2Ew/rb3/SsS9+C1LxC2tefbftXtvwBmm+jK6ceII8AAAAASUVORK5CYII=","evo_oddish":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFXklEQVR4nO1Ya2wUVRT+Zjvbndmh2zetlD4o0C2SWtJIqxiTRikt0BhAg2kU1AgoLzHhj/ijP/jhL01UXgn8ICklNjQiQSBCY61CoQ/blMaifacv2LLddtruY9jXmHu3bHfFxGRn+4iZL7l799577p3v7Dn3nDMLqFChQoUKFSpUqFChQoWK/w/kmfZfc2GBJpyHJRavlfPrS0iPQMIxGZkg85wxM+xKsGE8y09uRXkq7WOXrpe7LlQi62LWP+WYxWgBxtE8iv7jQ34l5OUuJBYb6ZjMuwceUbnFagFYx8cY601RDrQC6Ql5882OsJOfkwNnIJN7EJO3DmJr25yRD/slDgDj6nTQLzP9XP1QCOvBESwv8wYBrMGAFXs/hVPQwDvixKPqk3BPTVEZ67gIwB225zLhIs6wQELe60jdsR3W0UnokyPhlbx03aXXQ+eV6Hiw+juIf7TReY/bwSwGBeSUre9i2datdJCaa8VgCwPZJfkFCHFiDQKn6AJrkzFRXwvT3WuKOShVQM7a9T6iXy6mxAPRX+eAhtNAiph5kMz5155MTgMWCeO3r8LSdk8RDyUKyBkfH0SkzQauvRuaks3IfCOJLgzd08DL+C4xo+Xg+rEG8uNh/0ZvYT54Yz5cA70w3W5QZAlFUejctm34q+I86uuuokjrRvM3v2Po/hLYWQclTjBcdQVfHt2DtoZa2ojsfuNKmOrqoE1fCe3yFCUUQlZAPnX6JDYWb4RNHKcT5UcP47PCHNgba6GPjIdn2o4ng724UH6Eyp05fw5vfXQYHX092P/BXipramoE93w2kjeU0jPnUwEc2L+P9kJMHN47cgwNja3YXVYGSzctF+B2isjotlDyp8+cwsEDh3C54ixaGpvBcJHIyjTC1dUDXXQUtFmr5r+UsIrTWBITh6bWJtz/+QZupS1DVKIhSCYygbiRC58cPkTHESz/zDkyI8FrHlu4TLxn5270jgzjhbVGrM1cBZfd4l9zjpFQqgUfnUDHHrfvYhOYJmZJawRh/i1AfLkgLx+by8oQW1tP54gbcSkrIbttfgs0tjZhU+kOmHv66RxxHVlyor2jE/Grn6N5gSAiAvB45i+MyrlFb2Pf9lep3xNXqqyqwuc/1CG5sBB256wV2Ou3cefSaSpDYBXHcfyrE6geM0PIXoOpth7qQiPXK0PioygPkOiRJAg0xj+N7e4JM01g/geQPHDpe8jTU4gW9JgS4sDk5YAxGGA12WDv6wiZvFIFwIOVE3Z+SEMhyawsp/tXObf0JGj8VG4iDOWE4lKC+C6j5ZGdkobYpDRM2uxgooKjUSAGhjsxPdRH97gl5aW2YheiMdzuiy5cUgYEve8mWkbHwEX5SgtpenR2l90Br81GI4802A5zg7JaiFVCPuXNEmj4eDohPjbRXrs0mfbRyb6eQIdE8DoB1v5H1J1i1mT49vyZAa8EUtCF/KIfch6IfeU1pL+ko+VA39lvEdn/gGZVEkJJ4yIQ1MjlpqSbr9IijlSv0asTadhVgpDzwOOaanhMRnyxpRjn2ptRf7ESOcnp8BgMYHUCoNcHyVtNZnp5HV3d6On6Gm5pF8aauyE9fIAFuwPko+anGty6U48T1RVIzC0C9DytcQIzMoF+XQGWrdCi7+6Npy/5Sp8fngOIIuRfNwLHrQ0w/3YFk7+0Y31eQZDQZPxy2F9kEVtqwcS1eAxdvgeps49Z6P+F5NXH3iExhw74TXchVonIyi3Ary13ggRzVmVD1BAFUqkSYisPVw9kj2cBwmjplt3UfaZMvRgZHXhmnecEmhMCMTE6GDR2SDakJKWjYEsRegcfklI7JC5/AxdaJfAF/5/xAAAAAElFTkSuQmCC","evo_gloom":"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","evo_vileplume_young":"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","evo_vileplume":"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","evo_magikarp_baby":"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","evo_magikarp":"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","evo_magikarp2":"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","evo_gyarados_young":"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","evo_gyarados":"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","evo_jigglypuff_baby":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFhklEQVR4nO2Ye2xTVRzHP7drd7vSlS515SFjgwnMQX0AGiI6GCZuIAZxJP6hUQmGKD5wOJ8xGk2MxoCoQQWV+ApqFEIQEIXwmIoKYjTiYDrZ6giDday769quXR/HnHNjjPEvOlNicj//nHvPI/f7Pb977u+cCxYWFhYWFhYWFhYWFhYWFhYWFufIpVwp+L8yR18g2hu3iwcq7j5nE3UjF4k5roVClsPVYc91oEglGVU/hbW3zqR3SVy83/Gu9pc4l2YnLtIkUhmcjgJVNsd3qPYXAw+Kxg8foWPjIZZu2MB5M6A5dJLHT+NaOYn3nlyF72mX2B48yOO33UJN/SUku6Oqn94n2LTvEO0720VjYD5SPP5ivCN0snoC4ufJAAU2VQQf20XFlAtZu+pOnh6zHM+cKogl0Uv7oaAQ7BpLSjRmlZZSuTBAyojy7YYDVI0ehS1eODz1wzKQyVIyrpRDX7Xir70I19WVeGS9ywbhGAymoEi+a6BX+6icVqrqOt/6Hoo1/GO9wxYvMacxB5Lpfja9vY/p06twXV5mCg8NwM/dEJPiHZAR6jqVFuaTihwqChcOCG5qfIbm5GdqXeQ9Atc554vG629U4v0PXA1GFH6NmcJTCbDbIAX43FBWgkOa64pA0IBpfioJcM0PhzliVIuTHNPyHgFNL6R+4SwlftEQLHK56cumQQyBwwnpLFR4+aJ8pNluZFntL1Z1nDJgQgmNTy3jjYaVw84lORn4vb8D5pazulBjhTNLy7EIV/Tp9Ll004TNpgQftReo/t++2cL6w/2miYkXQDQG44qonVE9HO25GZAJaF3DPVAxkheSLYR3fM3cV9arto2T/Obsp+CrqFCiF23aqtoiB0+q/nIcaSCWoavHoKjAkV8DMjHVr7hWXT+sT2Vlh49PZ1zP1GoPy9pCIDRIpFRkJI/GJ6vSM7uM9wuqoKXHXHkuO5puRiivi1hm1Uh4AE88S5NcnI3T1My+09lDSdYG40tgSFAXjvPqdDevVU9V46Shuj/6oX8Q7A5oNYYtPicDejbz901PgqYRhQTkzNJLaNtxWs90q6bLaiZRd9VE6rxus++ZGPTGzOvfDAgPnR8DEn0gA7EhkK+MMUidrKweTeObH9ER7FJ9VnELNYEyaO0wnyJn3SYgnibUZRA7G2FsqTf/BjLJIfbv/IH6ci8UO8Cnmw2RBItvqFVJqm3AYPwI999P8HmIHD9F4rcI/oapuGdm2fPKUXydXQxmZMLI4yLeK/Zqz239mOQfxj9HG1Fq7pnHuMljmVTsVfsj9bmUCzWT5acv29jzzVGZwnHZbSxpmMWjWzZSWzGDXLbkORuQOAsL2bzlOwjGIGODZAYK7dBtoF83nsqmWgh4zczcm4S2MCfbQxxpaYG0IHnotIri7YFrWLv6PtY+dRc1tmtF3tbA7sQu7cTOU8LndFB/1XSoKgan/ESlISo/8oPgtENnjOTpCLrbRdlEP6HODoKf/Ehr20ne2Lub9Q/dD/OnEP/6hJoUEnkyIDnBz9ryLS+L5xIrmN0zkTGeYnRduvgnUnwyGqemYgLMhZrnm2iomMOapXeohUxHL92f/5qrDIa9G5ShXz5/MQsuNxOWpD8towAimVEHF3l/8Gi7+QqBOjv0hXpxuYpUNn7w7XfYamzR8m5AHh+3PdKEPsbDieZW1h04wLEzQUY4XbhL3ET7opR7/dy/eAETZlcSPBKkMxYlcHcNl1bP42JnOUmh/Sfb6pxmvvvZZiFaz4rwS80i/MRuIdZ8rw75H3yyX/zFxnWbVZ3Y2SrELyH1I6CSS/6zvxnauQ6QgmR5YM12QmEDeYCXxBJxbl69jKJRvn+NGezu5YP7Xscz0qv6VY+uINBk7qcky+5dknME/gRtTkMuQJieOgAAAABJRU5ErkJggg==","evo_jigglypuff":"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","evo_wigglytuff":"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","evo_wigglytuff2":"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","evo_wigglytuff3":"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","evo_psyduck_baby":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAADmUlEQVR4nO2WX2gcRRzHvzN7d3vJJRd7Mbm7eJezZ9I2f9raXBQFiaCCFtGHEl8qRRCLDyKi0PrQohQK0gYhfSi0FEpLQQxI+tCQ+gcEa2OVJm1tY5JeNKsxJm0vOevlsrvZ7N6UnZMrfe4cTWE+MOzszPL9/X6z85vfABKJRCKRSCQSiUQikUgkEkkZqASY21AmKMoL27xlA/T/+w9NAJFKlSUSzSxSqfL33iNH3LFymAIpiyoAn3cjizaYvN8QUqBd13BDXyYPTQBvv1hT2jKDF8yyOO8iXLRvb5C1pEJo7YyCmTYfm88u4dShMez+Qrw9j0ixg9vBuvdsQ4F2gOoDWPEauPZ9kM99uC8A4CITHQQVJfTxNsp29rzD+4o+AGZb0J31OJ97DXTDuzBJCDs+aMWurWJPIypKaE1tJU6e6cR3fX+ABBTYjoOqRzeh72gvnx/XkohsSeDpZx7DqgzAX12UujJ0mT8VXwGXz41jNuuUvnHyOTTFqrAjpbBVmQPvv/Uzhu0Ezu9Pw1fvR8fOFpw+vRX2wlmknhyHbRWD9Kp3g1o1ASiTFH9/M4pmpR6IAlbmJi4dO4pwrAKxLpU7b4x58PtMHsd/EpfIVIRId5KwZKACwblqoKG4Jr66MBJZhsMHryJzhXHnvx0cxRuf/iP0FPKIEPlqipHn2ww2NVjc/24wLlNLBrq3N0NdDECbn8bI1AJEQ0SK9X4UZM8m43zbBMka2IYB3W/ikWA1AvE8LNOHE59fxHsnLGF2iSihMz1BlmgKoaW9jjvqwpYJiMpK/cCmaujXczj82ZCwquwR6Xw43Aoaq4dqTII43tK8/p+Kr/tH8ZxTw2uBW9AWzAl2oL9AHngSuxW4syuGxpq1CKVeAfJ/wrEoL2RuY+YyqhopCiuLyMzqsLJ5hNfF0NFadb+mxfyBWn8Bw+dmEAs5aI+fAqv1gZK76+LAA/PqIhpoHSaGckjGGeZmshgeyd2vabE54N5CX34hBU9wBXbOCwPLpTnlFuXJ/Mtwmr/Pz5jCEplCEJfG8tC0WUz+msHt3CIqoPLj022u89cm06hp2sy/HUlbq68SH+gvkMINjdGIzff3urVRPm4ZHkwv3MYtzcRTb7bzu5LISkxECf34yROsLdqI3+amMTCqYfavonREVfD6S3G4cxd+mMCrX84JrT1EhIh7u+xq8/P+v/bSPWe8e/9/PFysC76CF+nMEnrOilu4OymyUjLEP9vjAAAAAElFTkSuQmCC","evo_psyduck":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAEu0lEQVR4nO2Xa2yTZRTHf2/7du3Wdpd2LWQ32DqcbBaUaxQI4TIhoosKQWOiRv2AotGEL8boJy+fTEj0A9Fgwhcl3lBC4iXiMAsIgwgIQ8hkN5CNrevade3W9fY+5n0qIyKf3Lusmv6TN+d9Tvucc/7P5ZzzQh555JFHHnnkkUceeeSRRx7/U5TYCsRM2jfNhFFPebm4Idcstk6N/zMEmkqTMuhkbIyT3VZee8F/g4ThRBRmCLdb9eFg0HB/KjOElb4EZb4lhLvPcPRcgshkckYWSzHS2K7NiAe21LBuex0k0lIXvBbn2JFeDreG+OCnmdvxaeOdx1WRHHhUaKn3RDq0TqSCm0QqsFFkRpqFiDWL6MVl4v2dZSInL/GuzYhX3l2L6lkLieNoCRNoGUxKhomhMONhDXuNj2de8kmi5BqBZYu99Ee2MTF4CBEPoJjMMvhYPwxoz3HkVANifIiiOWWsXFVBzhFwrNhGZ2cHRXNb0NKa1OlyUN0u9Q0NfsKXFBRripUbvHLHyCUCXb9e4osDv8l3s1NBtQtUZ4Ect2zdI+XxkYVSToyK3EujWx7bzhYgcPhz+vqvU2hz4H/EyYKGJIcO7JT/Wb+iE20GMqk6XQP7X/WK+uJPuNAWpypixk8JsYE4HV9H8c7bz4Ob5iPGPwOTAilBaCB7xHLmCPVeGCO4L8LcniTJ6nKpc7gLqY+Yad17mSP7TmCyW4hPmgh2R3GpCdylxtVPxQgjHz/pEs31lZwLxP/pwJvk3mcXMNmt0XV5gFNnA7y8J2zYWVKMMrRjKWLtRi+eItuUrqrJLWUkPEH/0DA/Hwux+3tjq7FqlCG7B7xVNjylnildX8yBJdpL4NokTXfVsmhpJfPrromc24EDb7tESYmDu/0+0hM39ap+cW2CsroU2AuzynSKg3vPs/WNkCG+TUZkoco5HvxLPZQ0mlGLoLACKW1NCsUNJhSXSs+pQeITmrzQD+9YLOcx2wT0ilpXX4a7qgDP8qcwF7kpXQSOapUyv4rVml1kBYuU7Qcv/+VV5aGnawypyNMisGq1i9omB741jVmF9T6UlEBLK/JBmFDMCqmoRt2S7IWOXQ3rfQb2GoecP6sE9EvZcXoYGJJdaCbyLZpyS14QWRf60XHYCjnZGkApFIi4wur1tdMKXtr9txP13r44kSESiWXjDPXLFvpGwCi3r7g6Cf1IpYTA5XNLO8wGgb6eMB99+juJqIoIpREOCxnSCC0jH52IlIqGWdXkMaq1O2U96Do6SOyiQt+Z60RD0dlNo/oKPtFyD5a5AmvFzcU0m6wopiST4yYyIxqpUWSKHRoZo+1ED40LnXL3pptODcnF7XsbRH11pcz5t0IPWhmNIkqdWYfJIVpPBGn7McCHp6fv3xACz69DNG9w0XjnPMqKSv9eyHQSmpDvw7EwX33Zwcho2rCWQjXCyOoqF/FOOBvtJxjto9xpIRhNyd8qKxR5T8pjxXI82Wdid7tx/ZA6XQM/vFgvlt9/BwV/BImNxDkXi3O07SpvtWe/XvQm780WP47qbCuxaqELm/u8eP2bydnfAT24oGOM747/Qu+VEPMsxVwJTUwFr0MphsNd/dAFIafAFTX2q+xPazTgfvjvt04AAAAASUVORK5CYII=","evo_psyduck2":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFIElEQVR4nO1Ye2hbVRj/3UcebZomtmuWPtIuXTvbtN1s3btSdNpaX7SsurG5ocw/VASdiMz5xwT/GTIQFYaCA5mO4cYsc2+24ZQxVpRZ6+xjczVNH2mbtluStrnJTe89ck624P5S6A29Qn5wOZzvXL77Pc453/e7QBpppJFGGmmkkUYamsMMECSelIJPgdEMDfUVqKny3JuS/4MDpLzKQ41mkR8N8nh+02Y01VeQJa4Sto4UgNNYH2mqr8DNQQnWbEtSeL27JxXfQsqULnGVJKM9MORL2XcoRGiInU0gTS2LULvWwebTM3FcPTOOzs4o+eS8zjOwp00kb79TB3tdNaAMJeXqrIz+3hCununDSx9FOd1mYMuWkoTxAOYiiR3Ekzg4I0H5yjyUlJnh9/9Cdn+jcLq7hfa0iaQ7thKxkBdquB+E4yAYZEQDWWg/nY+xviCMditaW5awbQa9OVC5bjW6b3nQ5WtlEQcxYbxfwh+RJrjK12NQ2YbYVAylVXZkW0V91oFjR4+wkTOKEA1hOKtqcO5sEJvbPmbyQW8YqYColaIDX72K6szzCHSE2NyxHmh+yg5gB5vTMxDxqdClA/zUADP+5tcjSZl35ArqmgNYvcsB2XsCBosF0mTCOV1toR3LrWSZ4sDM9TEU1ApMRkfXjIBPt15G36mfYCzOgTRsxcVLA/jwuzlNbyFOCyWHti4iVUVFmBi1JWUBpRtUVtAswGgW8Nvvo3jstSHN6wCnlSKaifIVEZQWLWbzNavsyLBn4FqvDxODMykpYhSaK730hYtkWDLhHc+Fe/EUnBYBPaMBPP3GJKd7PrB3u5AsUutKgyi2mZFfmYEnX6jCmf2LUk5u5oXP38whsd6HyQdvlRLKCehIpCdIdLCByP5GogYbyMFdZqLbDGxsdaP9tAntF83It6ts/HZ/BAYzhzt9t9k7TZtq9NlK7FhuJaqNhxIZv09Oz4DKGdB+3MtaC6fHhpaNLujKgb3bBfLK+3ms93/8mRwWfYov31Owpq0QiiSjwmNB0HsbUDk0bCy976wsuANShEOOyMGaZWARPnnAgpNH7cz42DSBMRvwLHPg+PcDjBvwWQJe3lkH3TiwdoMd3vEQnBV2xMIKq7qcyYp4UIDACyAyB1uZBfYHbOj4IUF0nJVWzW4lfr4KyqqL7mpK2BOX7i4YE0Oc8DDlmtg2koNxgOOhziioXetmPGJBHaBRpFuHVtp/Q2FlLiRFAoiKeJTA4crE0jJx4TMQ883+p/dGeqfYSOQ5cILMnIhImQvrQFfHHUhqDH5/HGM9IRhNClRlLrlOqSVFsCvRRk/eimPi11lwnBXScBTBO/Nvr+fdn9ArsaDAgGJ3HipWOZFbYocaiYEXTWx9diCE0Fhii3kD0xi6EcasIjDjd2tA8DVpsGiLsHpVIa71ABseyoKQJbIWWpqMQZ6Ls3dopjJ4E87+OIbXP7vN6YqRdXZGUeyW4V5mwOWrE/hrOFGRaWYa6x9ESJ5hxtMMjI6khhtrgiO7C0jvsaX3NW1U5j+xggy0e4iWFTgl7fS9yP8Tm/f6uQtXbmBsVmEZ0aUDLW6OUFrZnF/DqrKZz8G7tRnJaNN5+LwTj+QU4uCL9MeRdhDnq4Aa3vhcCbJqnAhe9gLeIoiMG//M1vc12sijy/MxVzwBwITmZ2twiPjItsPaMDRxvgoULowLfwaBkz6MTsSRn2dAV+8N7OuUmIGBSRnnTl2HQLLZusMhoT+m3f+hvwERSwgZH6oGiQAAAABJRU5ErkJggg==","evo_golduck_young":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFQ0lEQVR4nO1Ya0xbVRz/3UtrH8DaUl6FwgQ3kEGAoQFluIjghE2zLcHpB7MvW/ZhiY4sS3zMLyYaP7gQjYlP8JNGM7PEmMEWdKuG7YOM8Rh7OOXVWVZoodD1ebltjzmnYWVDE5XDdk34JTf33NPm/z+/c87/CaxhDWtYw/2EwEPIsQMiqazJh2cmgj2vOrjI/KcQwQHFm8yoq7FCp5FwryGuVEDrDpDa+kKEfgvDNx7B/45A7VYrko05CJJ5hJL/9vYQKJWATiMhdmMUPq+E4SHPst+ri9JJdVE6FG0Dmg0pODfkwvudCadQZUkhBoOB7fz1aZkRWfxWHAFBrUEkdKeofqdfWFz84tvr9XL3UKqVChBCIUS8Qfix3AOdaDPBt0Bgv+pF64fz99S9/ivMDtWQk++m3L4eHW+kkbB9NyHhpvgjNZLJc2Xk6K7VM+b/jP1PgESdtSR8uY4tji4yNlNPSLSVxGa3sN8oQUok2FNODjbyJSGuVEB7D4SBszch6mS0lIBUPG7FpZGNgO8iyALBsL0Mn3btwNBgPnRV6agvN0JxRvzTzzfgHpxl45HYAXTZrNS/QsysZmPHlS/htAPyVADWYgMUZcQURz6LCbsbw6Rpmwa5hQ42d/PCFLJLVdhcmA/gJTS1eBBzJWEmFITiCFDYzrtRV5EJh78b6aXb4LGlQzs8jfrtOjS16BFz9UKeFTE6GnerirpCFBPTEtQpBJ6Tt5A3cAHWYj+b/3xnNy6dPsUWP9Frx8TYPHhC4CmMulJzmhl9H88gq0ADoSDG7rxJHcPwZR8Gx+bxznd8dQo8hdHMtOHpDLhcUfZdUboOsp/gytUp7P9AWpVApuIpjOZCOaZ5UvKoEZaMZDaXn65GRUsxTSbIapAQeQv0+mW2+INv+THmiCCj0gxtiRl7X6nEmy/yj8Qib4E0kH1x6gE2PtYRhsqgxy8nxuB2BlDzWAYUT0C3pKw8sk8LITWJjQd6JvDMc4XMThRrAxQRjR5tr2XiVI+EnXusIL4o/piP4sZ4ENuNKuSY1ABk5Z6ASgqyAmfX3ocgaDVYmJIxMTzNorXzmhdPNedy1SdylUa9zsY0QIiAhAh71OYY0sxxNdeu+2FZn6JcAkd3gZQ8bAQisYSCND2yCtaxcb9tEpYSA9oPaYgiCQhaQGW8y6yIClV58Qz0ViR+95uf3whFEnih4kkIyakgYQmCLhGztBvMt8e0RuB5CiI4wlFYxN79pyfhGQmAyBKIX4IpV88W/PY3EGxdNxmJ5q15XHRyJaD2dwPhACxaFTre60fv95PsJIQUDSqrLew/IV+AvWe0SVxOgbsXojBl6iHqo+i02QFVXEVZhZWVnLT9KOqSYLUal7Vi7jv6vnqQdSBGj1tv7+xQZzEr6BdGa8jStHtpF0Mxkdjpjl+POTkhtu+8G+WNefDF6xuGZ1+PN714gOsZnvnBDdnhYzawmHmOXfWwueQkNT45oFNeX+hufHvYyPo/S6/IX80ptx6IhjDnCmJDlgmLTSxaSjqdHmwuyuZeE4jgDFp10Vb7nJwQTetg11w8rSZhvvpEvuLAdp12J4YuuvDRj4mam3c/aNUI0EXLfgEqXSKho5gev8XeAVnhBNoPaUiqQYPSTdnL+kbhaBjWXL4qRZ7CqJukmWZOg4X1gu5up9OT2fIInxyIayA7vjuNNGxbz8aiKwmer/1Y+F2P7AnaWokHtz05xciQ9KBl/aXDWlLedp1LMFsxgX1lAtvlM932O+anxyW8PBhgi2ytEciv426clWPIFAU4ZpeE5RXiTzp/L25zEPHeAAAAAElFTkSuQmCC","evo_golduck":"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","evo_vulpix_baby":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFfklEQVR4nO2Ya2xURRiGn3N29+xuCy21tFTkFmqLVUIArRgIQvqHi4AiCEGsPwgaCMhF+QNBLgmhIUBIDRWCBo0UCAkNiTHRiAHKpUGqQCltuVgqFQqVVsB2u+3unjNm5qyFmGDYpaiJ500mM2fOzJ73/eb7vplZcODAgQMHDhw4cODAgQMHDhw4cPB/hBbL4MlPIQw3lFx9+HnP+FxC1hfaTa0nqLZEU4zffhB0YsSeKTAn8x6Rv8OMdETJJJOsVJPZ/RFXr9dRWVnGrZU6i7Ie7je6XMCaE7BtIiwfbhOYN9Qn/iz3j5MEC6foHGq0Db3pqzJVJz3xJPi8FL6qs3yw1iUiYnKh8VlucWgSQizThSQpgi1CiLC4UVkmts7LU4SkteX72dmakHNmyOd1SWqMWO0TYm13Idb5VXnUlYh5BRItweqzXo5esSg81wI+H20N18gYnMvQKYvUyhS/obPrNDQLF7+3uzDVlwQZJXngMcAVdf+IoHC6m1kD4xcRs4ANYyHdGyF7bZkif/N8Od98Uajqs19+xPo8nZt34JNLHjW+MRCdGAYMD4Qt+9l027XXzYCE+OM5JgGDUzR6JEF2sqksLlH7y6+Mf3sxJUUrmRY5Aj54/7BFol/ZncNvCdllW12KUOSjBncbqlo/2dUZU49VQMF5oW0uNVk0XKdo/jjVlztqtFqBdxKPkNE3UfV9PtF2tc/GWOy/KFiRC6HbrewqDbD1UIDa+jZbkCnsxOrxQCi+VYh51phUl5BuUbNMUNQ0VvUtSDkKhg9EB2guEBq110PUN5psOQM7JujU3LQYNUjHMHS2HjdZOM4HYTnWVKXqqklBqcnuGPaYuGIgyWdSc/sOzQGNBenHWNDziE3eq/HyTr2TUGaKoKgSlg6DjAwU+cu3pBtZfHtFcPhkEDymLRhZwG+HDY9VgESav7vdMPwqpxNqR1vRwq2mCLuOSwER8LsZ209j+ykov4yy/HP9DapvQC8/9ErWIWy7fdXVUDw0YhcwrT9i/+uQ08dLRXNCNKN4wO2RRwaa2u3ARXjBcjEhWycYtWp1vcXRqiBbvrfIHwLPDnSDpUEoOidORHPZw0Geg4xkne9mhmFVAzm90qlZaYDuIq2nmzTc5I8Mq8iqvtJB411Lzdlw0iLZDR0RWPySTu5AHSK221Rdt62/+7TFpz/FHpMxCdhbi5a2zxIbp+jkD0m1fTci3SDC0TnR/K4lUH4pQLBDqADeX93Mm0NSGdZbY0Tve/xCrUHO3bZFJAgBRnx7WVy5Sx4Vdk7XVQjgMlTWkYEbaotQcQ0OVAlmD9dpC1sU/yBoDMIHox/8qQOVdor+xwRIyBOpHp09a6Qd1DUJueS0lZNktZHitd/17SHYcUrQEBBMHRSdIH1fQhccuCgoOB0/j0c6k8uD2tIPl2P0G9HZ590zjRekj+suMC2IWIRaI6w5rDE+W+D36LQGbHc72MAjkY85Bv6Kbl4UebkbG4ZBKBTCOJsAVkSlyOorEZVtjCQ/OekdFP0o6Oa2ycuA3h3jptVl+8D92Db/NVVL8sffGxDt9VB7LcyheqHSKVaYPgkWmamwsxZNlq4g/+gCNHj3ecjPSuXE3k18XNpiW98UlNUJjtQLZhYH1R7QrbvG1Cyd+6+V/7oAPXqun/ciFG8siPZ6wBJ8/bOF24R9F1rYfNKib2KXGLzrIG9bHXebVZE3tGmZrs7nG3N1dQub+zTqVha4XqdublXTEf+ZFeie4KX8xDHVLqqxN6Tf6i+qeuFBO1ALS+vUuDMVFep51RlXl/0bQRQx/VhJwRJxcN92Iq3tBKQdo7Y0TXC5wZTuHz1bumxNne+ku1mm6HQ7ryl4Ze4S1U5J8ZM3ryAuYX8ABhZB0vzPIkwAAAAASUVORK5CYII=","evo_vulpix":"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","evo_vulpix2":"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","evo_ninetales_young":"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","evo_ninetales":"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","evo_marill_baby":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAD4klEQVR4nO2XbWxTVRjH/7fturYbXbuNbby0k9lsxcm1TChhJGNkkG7JnMExI5lEJGiE+GFRQsw+YLIYE1IlfuCDL18wQDRowKnB6hYtWzaz6aQDu1loQLqWvXR9k+62a9cdcw+hidH4xUNWk/tLbnLueZLz/J97nnOe5wISEhISEhISEhISEhISEhISEhIPATPfRMQH/0uUevKP41yHNz9B6h+3EoOR/4voyup65kEoWC/47NM28mnLUTqe8viwv+8sGf51lMNDQsZ0NaWe2Kta74/DAgw1RrRu2pU1LyfjyO0AUhHu/Iyfin+wAxgfyZoLdKuR8ynU/clJziXYiEVjgUtw4cKEM5s+iWQCOYmx1ECqtjQTVXHNvx5S8TotNu0gcihJzuxAaYmJrDtsR2XFBvo+53aS7z/q+tuhNXe+QxptTyEaTmDa58bImR6SDHu4FQ9At2k7FX/yziAmDevQJSzh8HE7uRXJo3bfzTEERr/Ck3vaoZ//GW3uCXy4+Rms563wOj1Y8QBCwSCmwzEq/lxSg9bmFhRp1UhE7n/cstpG5PN7MT3Ui7MbyoFHqzGY+g1Obvk/i2dyC0XcDi7wUy+OTRegprYacaLAgDeGTDSGTEoANHmw1G3GrNqIl6N+fKfKx3C0DLKp35kEwKTAyGUaYj1+HurQHZRt3QMIach1RRg5cwKNVh6VO9oxNrUA790o/D++j6UbbsQDLia+mdQB7cYGRC6fRne7FaF7qaz4Q2vWYvTLc/C4b6CgsBCmtTpEBy4yE88sAN52ALy5BB2v96CsRIeFeBwdbW1iTYC5poKmlji3sLgEqLXIuUIWmBzDm/bTMF4NwhuLQ6WUIaLl0e8YpvbP59I0fZJXLwHxWaZ9EcdiEbVGR7QNR7H7uZcwF4oiFfuDzq9ZXwq5UkPnrvV9hlnH29SfqeU14v3mFBP/bLtEwxby/JG3UGEw0FfHNT98t3+BwvU1wt4h6ku3q5Ns3LYPypSAK6c6V76QPcDUeIDcUxlwsE6LJttjWE4tYnwuhVVyMyL5eQj7Jki1sRxth7oRvX4ZCX4fE78KVr2QWKw6Hsmgybadipcp89FgKsLH/YN44ZVXYV9Mw5J2YnfQg64Ah3KVj4Vrdimkr20mejVwc+gLKl7kB3cQ+4+9h1XJKYi7I1Jl2QqlshhXenYy8c/0DIjdaH37EVoPRBzBInoO7l7qQZ5pJ1bXtQBpAZPv7kVmWWDim2MpftvBEwipjJj54EXMh7xiBwpDXRO16wfewIXeb5n/WipYLVTIZbB0vQ9CZAYLiXlxikt5+sntwDjC/lvZW4g1fwJGaXYz59s2QwAAAABJRU5ErkJggg==","evo_marill":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFNElEQVR4nO2Ye0wURxzHv8udwnLnIRwcoCJHOcBapSBaghWEmsZHW7VJG22lkX+M12htbZM+qK9aa5OahjRpFIPGV2nVlqgtValprWILIipQqievO0A8hONxHPe+ZZodigaRNrqH+Md+ks3szm9n5vfdmfn9dhcQERERERERERERERERGR2YkR4gfkYacdrs8PVnYensht5QNeJjeo3U1BfJvXXhYXFD6h5P5IphHfWmCB+MAFHqeBIVrB7WUU1MDB5bNm75kpC9haRjQx49XhhGRMaiFV6ZBa/OwKFXPiBbN6yj5+MD5QiKCsfyOUsxkvh4szP/6GjgQBH6ui30eqC8Hx6L2StjelXAzvPHBjnd3dU77L3FxYVMTNLQKPWgeD0mz0tZSLImxt+53tFQgqor50cs9jOCWssVJD424YESFJ8bzNYeel7lBWFSIY3nv/8Dgidp0NbeBhzbQfSlBf/p0LRFq0nA4nehdLtQmb9FyNDCBTyv/YrETk9AeulxlGumwahJgbS0gEzJyETIrCX9nffcQtPv3+CG7hJd7xmrPoWp4gy1PZW1HXZbL2mtKmJGRUBNowHa0uNYqhoH1FVjb2cnXt2cj7ikdGqvNTkBJEEaMweu77cTX5aFWX8dX3M2al/jcSBYGYLW0YpCzpZr9MnzVLAWLFv1DnVeZ7SgorYZjp4OegT4SpGcuQmYmIAlt2/cyQ9jXd2w2u2ju4kjF64nAZoUzH2u/6k3NzTQUiKR0HIMO46WbrsFNs4HjtsNWMt0UcEHL95E46kcwZtYUAd+PgyJXXMEoW4jEJUMpYyF2+MCx3Hwk49H9YkcJIaPRfSSD+msODEGl38tgPNSPsztjV4JrYISWWTsTOr8m7OVgP4iJP7jqPOyQBWqiwuxdXkqTny3B9yVw7ROIpODJXaEKVXe8F24gMnpmdT59zZ9AU9T2RB7Tt5u9NjsSHwiFEGBckjdLtgZFvW6S3gsBHgUE5CYnAxj019oICpwbhett1qtmDFjFiovl0Phz9K69rZOOF39dg+8h1RI4/ZbjTjdloHr12uw/hcH3az8BuZcVnCBEdifm0fvK/DMhqO3DZ67njPB6gQyxmGHsfWGoL0gqDHvxISXsmkUam8xDrLxm9lPoaTnNFMDqDz3I1Y/o4Sh2QDT1CwEyGW4uO9j/F8GHzEBAyK4qCTEpKyA3TE0rrN+LBwWE1rrK5C7fCqt++iEDuqn09By9iDCF6yF4eg21F4uZB75EuIxGSqYYIAY2FDMnrcYCobPwP3oTBwVdbO6CBHmWrz8xlYYavToOnwNqDyP07mbsSD7AHxDJ2LUZoB/J+JzwLNPRmDzIhUgudtl7oVu7DtVhQnhIajXNyFY9y1++/kQNn2SQ5eROkKNMp/paCktQPXJ3cwjj0K7ik1kyvzXYDy3DyvjbIBE+m+X/ZlYmxIAmacD5mYd0lNnwTTldaSlLaZhlXe+yJUIH5nyoZ0XvISOfv42DJ0OyDQpUMdqAHCDb5BIEca68GdZOaTKCLgaS1BrdkN7+BrCohMQOskfVw9kC3FBmICzJ/Ppk4sMnExyL3RAO6c/6gxgqKmjL3i8gKu7tJAqQtE3KQmqoCCY60pg2LuST3SjF0YHCAiJJBHz38Ka1VlYoOoaZNMe0aPPV4GmskI0HvsMjj7i1c9LRmgH0zIyiXrZRnDWXrQY6mH5adsdW6fVDF5Y3My5cPop8Pf+bEExH/dBcBh19nSjfOc6sP5yen3vt3FQXQn5o+oMtdttw/+leFj+ATdGEC35SRjuAAAAAElFTkSuQmCC","evo_marill2":"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","evo_azumarill_young":"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","evo_azumarill":"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","pikachu":"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","raichu":"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","pichu":"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","eevee":"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","vaporeon":"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","jolteon":"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","flareon":"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","espeon":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAALG0lEQVR42u2ZaZRV1ZXHf+fc4b1679U8UlDMCYgYRxAT7ZbEFVtMDJGIrXavxPSKMTEhg9E4gbbGmFY62qxWQ6sBozIEVEzAhAIEB0SIxi5LKEEKEKQYavTVqzfc4ez+UEUZY1Sw6mWl18r+eO+5++z/ns5/nwt/l79hKS+sk/+3xhcVl8qK/9woQF5ARLUlRdGotLa3D0i//qAXSgu2pQDYv3/voIPIGiGZzVJZXq7yAkDEUFoT59VVOxgzesKgGK2xZcTwkTJ86EhZt7iRJ+7bNGCd9gdGQIRozCGZyvH0Iy/x2ZkTBRiAtxx55bmdZNpDvKyHshXi6EFwygeICQ22dllZ/xzb9+7i599f/LE2cB1XXB2VjcteJdvuoR1hV/NhlMC3r/tS/gBYWqG1AtvlqbUvcMbUybhWRKIR9yProbXtkFw6c6YUFpVL/SONPPNYI1o73PHAIm6/fymjxtagrABLm/wBWLDgIb7w9WlMOnECwyqH0JFuAUthKesjlVZWVKvpX7ycDUv+gN+T5cmVq3ns9y8QKy4hmoghlnDn/8ympfWwylsNfHnGxcrGESsLOdFEYwl0EKHHJI9KcdhjoNwi6aV4ubmZIWPr8FM9OKKQnMfaDasHpTHYH/YywCdWrQk7s9yzYAVL7l+Ln7O5aNbJH6p09MhTpbZmLGvXbmHN9pcpHz8SutNcecl0bLEpLI4zcvRImpq25i+FjjSj8y47g3M/fRrpZJYgZ5DMuy9POe1kmThxvFj63cMuFonJoruXcMct86jfsomSylJ0MsP5Z56DLZqYG+W0L4yhqWmrGowIqKNbZMv5585CxKcyMZQXtj5CqvMQc2qncOLsO4gkAj5/8ecIAsMTD67B9WMseG4tLUE3yYYdfHfmlQypLeKK713Nm52bga6P3DcWK5Z0+h01oBTqP9QIVEFCJLuzjUxaeHzeShrm3sQJXg8m0CTbNI//Yh1r1m/B8uJcMedqxn3yFCrjZVz3/Ru54dYf8sru5/DC7qNy2P6WA7JjfQ8bNi+Wf583Ww0YAEAkkqD58GGiuZDKaIrjzp7GsHAPbwchlqtxHZuzpkzGy+bo6ejmR1/7Z5KtHSSTh9jW0ogXdh91WtSvWM3Y8imUxcoHJ4WOBOLFJ5vxiPP89V9k9Amjqdy9jeCCeyg9bhiB6yFaU5CNMn/Bwzz49O1A2Oej4JjyvSQ6XFY9uglR3ew7vI1rfjqLt/e9rT5OEf/p0UboemSsHG+2BZwSt9jflaby+CpytiEiFpanCaKGz06ewoFDb/c56OiNjzhxAVd+t/hZNAFK+ZQlyvFyuY/dhQCoqqiQu/97OTVVAWXRNq785UIW/vYp7OOnEURdKotdvv6DGXzvP27E1prRU4YypLrumDtKGB5h7x7GMmiTwNZRlKiB1UB3Ks2ORxdyw28cXnptE4vmP8MF8zfiWYo9L27hlnuv41eTP8O1f1iPSzdpXwMWEBy18XVDa+Sh239HzgsQ4xLYIQ4+joriutYAi1iEcgTjF1ItpaBsLMdBxMPt8SgMQ8JAYUVc7P6yOrY2HwQhTjSBkSyhGEQJoFFaY4SBpZDRQsxSxJrqqUtYWKEQio0jRdyy7Gf87BOjCZLdzJh0ISZUZNP+MQPIZXIEGXB1FCMa0QGWaNIdOQri0YF1oYJIgbz4+CYq3omCKHY7Gh31UDgoHTAqqzlIG8aqob09xcL6R1m0bO5R6W49sEeqh4zl2aebCLoErS10JElEamls2MrVc79CV0+HGpQ2+uzKPThxoSoNnenDpCMlGB1g+4Y95Wnq2sp46fd/5PJbp1JdU3VMul9Z+ybdrRrBxnaSdLa4XDzrTDK0qoFwoX55YvlSujobaD/4OqJ8EmJjmxCbKOgI7vo0992/kHOnTzlW49Eo2g4kwU2DztJ2IMuGpmWsrF8wqAcZI2qrJZXJ8sS8DeiCBIgha3cSixbTsGYfQ+qqKauO8o+XjjtGoqZl6V2bGTa8EG3b7G5q5Ws3n40X5tSgAvhT2fr8Aeloy5I1WSLaJqpB0PiBx5kzjnuP7rq6MWKyKWxLIQK2djGA68T5xMRx/MuXv0OhV4mf9gjE4/I5/0Qq260GjY3+JTnxU9Pk3jl340Zs0IpQBMQACkdFOGfGFIaOqGL7zt2sXvECsSCOICil3j2bleI737qMt9oOcMr403nmtcW4kRheLq0GZaD50LGxvJZDPV0Mc8sIUWQ8n5hroxGMhHxmyueoGz6COT/+PIjq7eVK+tjtkQsOw0WXXEpxaRE/mv1tAOXl0oM/D7zv1q6gVKZNvwshTUng4zguew60cP11l4LvghiMD14YUEwCXzuI9o/Yj7EMYAh0SEyKCewkZ0ybAIQqLwPNn8vML10rRfHhBCiU9PIX27bZ9sZLXD7zAsaNmoi2NCL6SKb0bSX9xFD3RUBZPmJCWva3MeOqs9Rgj5TvkbJ4mZTEq2TU8E9jOyGWCRBRIDZBEPLJiSdy423X4kSc3lTRaUTAGDA6jegs6Cy9E6iA9iB0UGGCYUMrAUtiblQGbaj/c+noOxH3vtkoxFspMOMx8TRRP4Krczz08DxWPr4KIwKi0SaGwcPSGhXGQQwajSchRFJYQWEv4VMBonLYKCytyRuA/tu2ggTrNi/n+JExaqKV9GS6WPfKGupXrcKELhKY3uAq0DpExNDZ0UVnexJHu7R2ZDh58hgEjepjrGJ7GMDSVv4B7Dr0JDdfcz233TqXqroLeew3d/L8yg1ETRyDwWjd59mQtl0+vi8Ybbj/nnnEnQI27l9L/YqNuLkAz7JBCdoUsK/hLWJlRZTWFR71PezHul3tSXVgOiLc8M0rKUwo4pEEbzQc7s1rEVAhKIPSGs9tRxJJrrj5QkonFqNHxzjnrGns2XaIwI70fqPAhBHe2tvFttda8h8BY3q7Tkn0JJbPP4+f/PROVq/+LSd96mpQGqM8tIkQepoZV51HTWUZD16/hEBDICXYpFjXsJphYy7DtjRaqV5fagjx8teF+kc/wBKL4liE+XNWk9x1iOX192HSLlpSoMCyFG807AR8tX3Hy3SakLhTQkFCiBS6TD17Mk+tf4yCwhLMOw6hSqFMCXYYY+PK7fkF0Pj6VnXTL75L1unC0hYnjZvadyVvAxoduOzft4/Xm18HoLi0Tv3grq+QKekiq0J0xOJgezs/v/cn6oe3TecfvnoCXiqBMVmMBDjEyDuVCIyHrz2sQGNLb983ymAMaK2JJuJMGD+qf31FWTGGDE7gIgURMsleyrBo8XK02NQMreb5ZW+BFSIS5B9A6HuEPthisFUvAE/34IRFBG4X5/3rqTTvaILZvesnTTodlY2gHRcnVCxdsgiA2tqhR7qNmDBAB4pAh/kHYFkKW2lMaDCYPlYvIArL6s1M23pXfTLj4TpFGARlW2TCzPuNsQyiA4JcnosY4NarHsZ4UbIFWUyfnRm/C9/uwusqxKKUw22dAHzjoovlq2d9k4SOU25VMve/bmf73j8qgKu+9Q2ZMOpU+eUtT2FyMSRdxd4d+/MbAYWSAtsl9DzciOb8WZNY9+SruCaKMrBh068J6VSTTp8MwAPLlqoHli2Vv0QiK8oqwHUYMa4WdBKfLv7ttgvyC8CyLGwXtDEU2FHAkMp6lDkRlLJIdXe+75sxY8ZjvDRh6LP51UYZUl2hAGLxOAfbdtHwv1uJWA65wMcPs/kFEISBuuSaqe9hjbu37GCXCdl5cB/3Lr3jfTSgufmN/mdDqiv6n//4hpsUQIdulJKSBF7WRjCD8vPj7/LXkP8DdC7LkH+uif0AAAAASUVORK5CYII=","umbreon":"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","leafeon":"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","glaceon":"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","sylveon":"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","bulbasaur":"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","ivysaur":"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","venusaur":"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","charmander":"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","charmeleon":"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","charizard":"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","squirtle":"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","wartortle":"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","blastoise":"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","jigglypuff":"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","wigglytuff":"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","meowth":"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","psyduck":"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","golduck":"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","vulpix":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAALJUlEQVR42u2ae3DdxXXHP7v7e9yHdPWy3rJsyUZW/MaubTAG3AKTkABpyQszZEooUPoYGrehBNNCO5NJoCkNCU4aCi5toE06ARIgCQkmhEeAYGpj/JDAT8mSLOlK17pX9/G79/fY7R+mdDIhgzOVEX/k/Lv7O3u+e87unu85P/itzK6ImVb4iY9+3Oze9Sq2LwBB3/hRcToBWL/J5JWtC83u0UO/1qC13cvN2g9fQ3rVtViFkBEU7fddbUay46cNhDzVieu7ek3qljvZuPAC807jly5ZYjo238qPJiE3uY9MdZowZei55l5SdevMrAMwXp661k56Nn+eMxbMMwtaWn7JqCAu+IPlq6jkBtBeI4OPPUn5W1tQsZBYjcusA4jXOoyEBSajkPV/+RBX3vwVzpzf9DYIIwQ/3vkKyk1iyxhqYpBFYYaICpFfmX0A2eI0Z5XKlKTHcJBnzKnBjjW/PR5GYNXU4kUhge1jWyF+FOEon6QTkRkbNbMK4Gd9/ez6uxtwIwumpjgwUkJv2ML89jazoK3DKNunaAlUqHjj4XtpCY5TNprxrTez9+UnaWhpFbMKoKa6ScSVBVITaYHrR2ghmPuxe2m/6isIk0RIjTEWl2++neGyRcFY7J5Ki5rWRvG+uEZloLGICLQhZ0p0revFVwEqrMYr3sQx7WB8D2FrVt36ryTcJG1brzY/3X9w9q/RdCZtfC2paJ/mjnl09izA6BArMEQCald1Mrfk0LRkAbmEoio1zVTcovGarTR1vQ+u0U2r19G75R42LjuPMgUckSS0i2CBJQQV5RM6FkraxIQiDJtIRGWK9YZEs0VmdGh2DnFufMJ01dSZxI1f4EhKYpcLbFq+jEvO7KK6lAKjEWh0CBBimRJeBCbQ2CFEQZI1V9xGa/eq2fFATXOjWFnbRr5UxIoUIuFSFAUmvQyTSYN5a1+1APOWynqmaHQNERpMDM+pxU01zc4hzoweN5s2nEX42j504zxe2juAZ0cYJXCkQKARWhEm06j8XHK7tlOffoGg60KmU/XUNy2n4I4jk87seCDSBmUsLv3YB2l/7AFUMo1RAiMEQmgQIITBLbXT88OvcsefXsxt93yH9P6nOPMXjxIlsjR4NlLbswMgCH0CJbn+ovWMTA9wvD8PpkgxyECYJRYkmNr+XR6/9hwRKcOaFWtEZ0eDiCXjhKqEMRZxodCI2QkhiSBUEhEv0eFkGd/5H/ivJkCXCdBkgK1bPsri/4KpwvD/fachiHwQkt0H+nD1LAFIJJI4xmLbLTfy5Qef46YntlNQdYhQoKQkJmy+8O8PAPBv218UUycmzPWbPsmGSz7NAU9gG1CxGiLjzw6AQt5nAIv1K86kKB0m7Vq0iYFlIYxNXmlOJBZzNDNlEo5DqMuopm4OhtUM2TbxKMAyGhmF72rMyNBRIwJNW/cCMWOUct78DnPZlrt46Yc7UKvPprm1CpSLiiRCwvwww2gpjxxOU13lMmQ30NzWiRf6YFkMvvYmKVFm8Pv388axPe+43vjIiDFacs6FH6JSDPj5C08wv+vUQLzrpDdf32c2rD+bS+94hLJTQyAEZTuiynjM0ZN0PPpPOEKxyCgezCapuX4zo1EcNz2JDAI4nmXP0/fw0ivPUNvwq0ndinXnG1u4lDzBZ+75Ojv6h3jz9qvYMzYiZiSEFq1YKsYr4+bKrvMwn/oi1a1tlBvLdGfzND39z/x+3XJSK5bT99S3CP/4ZgJRQzE9zsCj36S+PEx+bIK+ibSobWj8VQ7dvtAs+/zdnNvZQ8nK85OdRyjKENdtBEZmviqxtLHVJF0L1l/HVFmwcM06anSEICJQMYKkxVAhzcC2O8kM7HxX3b+3sMdc8Z/f49V9Y4yaACPimCgimPCIHrqFZ/r2iBlNp0XMxndjdBaPIqkHK0eofZxQIUyeVMmmIZ3ncHhqeVvkFfErDsVyQCjBsk+WYkLfohR4M88H9g4dEwBtMmbKfgk/NgqVeopIhBNhVbXQkKxHilNLG4acJl7pG8W3XKQtkBFIAT4aafkzD+Dt1zmaZjJKkFx8HVOFIaR28YWPs6ibqRPjzF19MT/90X2mu62FmoZ3ZmNL2nvNipvupqgMIHE1aKEBUBZIKU4fgHxo4fuaSPm0Le3FFRUCKdFGE5tfQ3XdWjZdfi1OOfvryzTKoiQVxoRIIdBoAgm2BqkF5nRQSoDf7ewxieu/hKMiNiyez/6JSXwrhq3LaAHVFY1r1WLf8DfURgHVD33NvLjnWbF8bpdZXClSsC22HTnGhkUbiJIe+BZSC+xIIJVAR5rIBFhCzjyAT6xYYUY2/gVx2yKhPZa2wqGxkLLSSCMBzcSuvazsXcaxlmZCKejacheZb9xiLvvI1eyKL6YsK3z2sk38zp/dRd9ghu6mGhCghUAKxbGDA1Q5dUgTzSylBAimDiKYYOO5i7n4wx/k4ddPYCyJkWDQGGFoXLmaF7//bRb5RUqqhJ2P6N50E9+4dytnqKM8o0uMOecQpHxaGqsoqYiQk7yaSGMHMXRYhTH6lGxSp1wbPaPX6Bu2Udr5HKqhmQOZLIYEkpNXoDS8xQ005cFBLFMkN2Rhd7hUqYjO8y/g+a/+I8sPbMf5zEWEYTVKCIwAFRosZTOy9whJHHyTx//vpxgpTP/9jHkgU47h1HZSX8xSdgTZSIEOMRjE27tliIeGSm0jBweOMSd3hKLRyMiiYtcRNjSR8zRrjEskQRsDWmMZQzmXJ6iU0dqn1U9jEomZCaFD/f3mIwuXmCW33o9IpEH5+AUQQRIty2gMSp8MIYwg5yjmnHUWuckMHHoc1ySouA6pSo6eD32a+utu5437vkR2okQqcEgqyfFDQ6QPZLFj9SQtj6M/u58dhw+ImTkDOiRgmlS7S2X3EJnSJHZfkfK+QYyUIAQCMJj/ZfU4lo10YxQ8j1gEIYbRnc/TVqdxcKn2MpSPDGKwGdw/gQriqKRFC0W8J7/Ga317Zy6dPvpmv/ns+ZdQ2vod9N4cMc+m8NTnODpVoeeKu6npFQQywgpdzFsPkTEQaogJH2/b32KsEONlqZINlNFUmtbhLTybipSgFEExRTKZ4/ADf87o5IQ4LS2mC5cvNVpa2CbGT17/hQBYv3alURfcRveCMyipwskw0icdIUPwTYzRkb3kj49S78wnIV1UJCi5ARqBIcQamGBs9zaCzEGOFEriPemRXbSq1+D5uKGNb9VRvPRGYt5cCu4JHFkBFKE1hp2fRzbuEX/+MVLebpgzj7S2SX5gMzo2jigbMt/bwoHRw+I9Ke7WJizTXNfCZX9yB5mST05DMJnluWcfIVeeovbcPwIbpDZ40kHZEXLXEyxeeTY5s4j9T/+AUIwwlf86NfGQSiH7/zL+N/JAT2uzuegP7yS1dgkvvPwyvhK0LOkmfyRDR8YnFlc8/t27sXVIaKroWbSM4YrmvNUbOayqCSNNGxon5uP/4Ms8sme3eE/L6/OqG3g9NocGr4jJZFCpGurCeibzmkEZomWZ5tgIc6I5EGVIqSwF5TIcKLywAkIyasWwdJwGFcJ73R/w8lM0tDVS+Zdv0nPNVVQKKazAp/7hv8IXRWxL8PODkwImmdfeZjZdfi2BaUTa09RTJgoSDB8Yot6qx1X27DS6V8+fZ6xAEKmIMApxVZxXjh35JR0ddXVm01//A/32ApJBienOahqnJf3Dhxja9iDVcpSDx/vFrHRodg4MvuvCYRRR8SJ2PPttEnqSpVd+jn3Tg0zt3sXY2DNijPf5rwYAS3o/YHS+CFGWrNOKMZp9O15izmnslf1WZkv+B598JFwc/T3pAAAAAElFTkSuQmCC","ninetales":"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","snorlax":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAN3ElEQVR42u2Ze7BddXXHP2v99t7nnnPvTW5ILoSQMQSjPAfIYLGCYRSFAa0i+AJUBMbqjJhCp0OpEt+MvOooOvKKGAULkqpTnU5j6wNKAAUKoTWEGBMkz5vcPG7u65x79t6/tfrHPgkJCalGaacz/P44Z+bevfdZr+/6ftfa8Mp55fz/O6edPs9FxFXU/08MSELmijqwlwH1ri7vqtW8lmaeaOJZluxjYHdXrz+4cq0v+uU6P+XmRQ64qhy0I8lB3aXGeZ+7AR8a4IE77vRGdzclxopHF1OMT5AmGXm7Ce2SI95wgStCLcswK/nK6gEuu+rj9Bx6KMFAFeyPCeZB2S/CzqP/jMndzuhXvsrIeBMQJrUbNLduQ0RpbxsmlUBPo0FRRsroJFmNB9euZfKUwyjTLvKtm8EEDYoRD8oBOZibumfNcU49g67WVr5xwrG898MXEbVkfMNqXBxccKoKy0rFozE+OMKKbTu4cLjksFaClG2eueVLmJfC/3YGUmsxdXgzfdIk+jjRJjADwyAKSAceIpQK5spIUTI61iIbKuhOM3LJcS//aDzKwYFY/DPzL6c/S7nwvDdjeYG5ogbgqEsVf3EIhkoGouTNMb7200f49lNrSGp95Mv/nYGNQ5XDfnC26MHcFDThyne+jYsvvohzr1iATgjqnUbiUKojGC7GyKpt7NgyxLuv/gyiXXzo2BM4/uTjSU96NVaAqhBUSRO8lu7b2V6WEtr0zbtp06I2OMCS665j3vyr8NJ56Fu3gBurlq/ks3d+i1aSEGNkYMsOlt9/D+1YULiTWwuzLgpzxEHE+fwlb0coSYrAgvt+6nlZ4ri8LA40y7GqxGmQ5zkkgUZQxAVEyETp6Z3MRBu6EkHDMKUquOImbFdHMxAUVUEFrGgiHml5Rm7xT4+BRr3miShdqbLq7ruIXSWYUOKoCqiTJIJAFTdTRBRRAQQjw4uc9SvX8/7/eIKR2jSai7/LxMgIpoFPv+9UAjXMHCHBYptPL36YQCQewM7fKwNpSPz7n7qIR5atwKTOpbfcyJ3X/g3RIRQdMsq6uO+xZ3GED82diYcaFUUFRAAp2fTbTVy+Yi3SfQQNVYaLHHfAnbFmzqkn96EieATzhGvfdRx9PZO55r5HHa1hRUsOCsRTa11MtMcYG59gghxHURJMSwoiOqmH7un9pPWCUGvT0oQ8zSizDGnU0d4euqZPJtScGJQ01LBkAo8FAYhlpCCg3oWVNSIZ4glBGnipWDSsaP3hGQiiXg/Kk/9wPU88/SCvnzsHgrPqgWeIgzmFFEgjcOmV1+CeYl7l+p8Bj4qIIALuoOrMOf1UeutHMhKNQyxjkzsXnXMazdYoawcneLNm5EQyy4lAEox2ND773tNohzo33f8LN98b2AfEQKqJI8K9176PX69ay7GzDyGppUwMCjc/9AR9IWP+OWdzxhtPJU2AEJAgIFo92A0BVBJGBjbz/DPrePe993LIRZdRjETezzo+8aazKEdKJBZc+Z1bSUPkPWfOQcoEE3CLPLtmJ1HrfOHef8NfZPMBS6iwEmIkCU6z2YLQRVarY0lOliT0pN3U6lPIDYZjwqgFxmMCJJgoLimlJJQGbRHKWkZ9pEn/lkF6tI1u2UmZpbQ00vJIc3yCZltJDaKDu2EGMc9peyVOtg9t9P8xA289+2x//MEH+eY1ZyGhCzWw2OY3q4cxSTjqsMl8+7HV9Pf0cdeirwNVx0GqeEysXglmdBAK3pEZKC7K2z/yt/xu5xY2/vgHDMcRggnBhEX3/BACzJxZYmUbd8HdMXPymLJpcIRP3v2zvezeBwO1rOYfPOVQ3n/Mezj2Nf0kaZ3lz6xEPXDsnKl4cJYu20TRjkRGic89X/VNqQScu+3xeOloIlAT3AquvuE2vn/HddTGJrC+BsnWJm6GY8w7+UTaVnLTjxZz4WlHIoC5Y51HltF3PfGlQRzLkvqklBmTc9asXkuMjgp4UMQd88CGMfjJ179E6dqJ7AuR9l2/sGduHVDn8uu/xrXveAeHH3cibgk7Vy4j0xTHcIdZJ7yKLELrBykrVo+QJQlBlFfNrFV4QBFV3OwAGHDh7IsvZe6bzsZdEAVBCBiDQ2NsHRoHd8zBRDuWyq5b94qOv4gzY+GceO45bFy9krENawgaMDfAcBxTsCiUFjlq9hRmzejhiMN7WbrsOX759Eq2Dw/zqY9cgJD6S2bAccpmi4mJvJNCRTryOJCA1nYbbOKo78/Y6hLZ5VXnv9FBCyNDCIXg0sGGd3otgGiVQJ9AJEG0xNOeSuF6oLljkCRxinI/DtRUfd33bufEU95F77RebrrkdFxbOHVST/jVmgFyT1hw8XnEKqZUjX5fJ16oVkcQsIiZIWWBjbdo10pCR0WLV1eLCWLg7qQaKvALnHHCNDw0+NdHVnPKjOmovAQGuiwjhIQiCeStNjE0iKFOFktKhHa7xIKShRpRwRSSWGXNX0Jq7fp7zCNla4xW6WgK2uEjwXZfU++qYUHpT2JV3ObVFxF3KGIBmRBtPw5kqr7tsSXs2LGOhVddRrcqty35GeITfPS8N7B63U62Do8jmjPz6KNQq3q0oy8t4MU7+FGGhof5xkf/kjM/eDGP/8sPGd+wlrywKlPiiAg3f+2beArnzZuxuyGIVVDVsuSY6dPYvGlkr1wne3JanGhR0xrz3ngaEuD6w2bRjjnPrXuef3rqaW78wKWUDuLS6T2yn9h3uHL3gOOYR/oOnUYzGeLLH/4A884+n6zRYPFNX0REUIUd63bw1NrVaDBee9TRaLGrp1SemBjRI0rcq1Z3OxDdWfLdJcyZO5MZr54JBlNmH0KZGxu3D3ZGC0dFd9f2vpH33Z/y4k4k0DNlEjOnH8Y9n/k71JXtg4Ps3LGVTHr46299g/nveF21ECjaFBLBBEN4dvX26rdJOzPHfh2Icv4dX3cBPnvx2+hLjKOO6Kd3ykzu+PkSvnPjDbznsitIk4R7Z32S3v5+TCt2DR0Vt+c86J3ou3uH4KB0Z/LMw/ivx39NPQbmL7qdxDJKjSz42LmUzZ0UsSSqkRg8ufI5amkvojUwr7KB7D8DVZCURi2h3qgzNtGikTaY1uilq9ZLfWScAqGNIpKhKCEaUV7olPtygCBedRmiV2LCYJI2SM2p9TQwEzIyytEdVc0jBA/gTqM2icIz1ByTavxE/KWZ2DEpyuij7RZ5c4JvP/wozfGHWfS5z+Fm3PzRDzK13s3Hbvx7br36KpJOinumT8FeRL6KYuIMb9xZwdwFzNi5fYgv/+g+2jVl/lnzePy3qwj1HmJwsEo6IMKzzw/hJCQOsYO2/Ym3/Yq5uccf68+uWskj99xJX1+dqRIo1XEVspDxqa/ewvD2HcyePoNLzn0n1BTr1KbS0UVuJBhpTHZPXdcsvI3j+qdzyulH02xuhbxEJDBWFCx9cgVved0cSnfWrN1KLZtMszlecYiDixFE+eI/PrzXiLnfgWb9lkHMlSMndQGhIi0TUlNimTORl4yasHnrCIkHkjLpkKiSAjmQmBCDoDEnOpgZrcTQ3oTm2GYUw9TBShqpk6R1rDQiilAHi7sESqeBCKaOq1ZK90AO1NIa0YwQFBfHXYgeWfbErwmS8paT+wn006aLv1q0kNwNi5GAcccnrsTd+eLie3luaAcJATMHTXjrcbN47cyMaGUllfGOTBHOnHskDyz7HUFSDulNabXLigg7ta8IuO5BjQdwYOPAJgF4bOly37BpI2e++XR8eJw7H1xCK8J5rzuc360bIXqbD7xlNmt/O1xtHzTw0GNLueuBpdx/z0L6mm20dPLuyVxwxVXMnpESTcAj3mGS6IKhrFkzxM6JiFpkWk/tBX7ubCqbnnHT4l/sU/YHnIkbWYPe7j5Sg7aBxRJUCAJBnVg4E0XZWXwIFqEtkWKiJLOAJQGLOXk5xnh7DNnFrhI6Ak46jgiSSGdDXW35rEOIu9as6tKRFX/AXkgJbkSe/PJNXP/j7/HGWf2kWY3l69bz5yccTm7GwEATVUUVsMDKrSMsvG0h29aupF6OkXYdgqY1nnrgUX7+zMOc8OqprFm/HSzDpLJIMEogKZ08KE+t28JJ0ydXY4RAcEfqvSy4+yf72Px7LbaCiN9wyVls2LadgsDUemDVwDBiBccc1UMtn0ypGcs2DXDXggWQ2B6jRqdqPXL5dTfz+iOmoSFW7dJf4G53oRBDYsLT6wc56fAexBUS5/OLf4VV2zo56M1cFvALzziJ8Vhy/KHdOBkeAh4LhptNylI54jXHMP/886uykF1iY9ewo6z/zWauXvgVzpp7DGW7he8xKxjVEB8JLN+wlf6ejCWPriCPkYHRXP7o7XQeoTGpTpZ2kYVAoo5aibsimlXpNu/s/KvZWMx3D/bqkVozR7MUDNzY/RIEd8R89w4gaKArSWlHZ2C0+JMtd+X2Hz3mKoKK8On3noZaRA0SM9KsxtKnVvDxC/6CEsWkykJiglrC5hWbScpAiE7ZMdaBsoxV+EXAhJgJP370GdpFifuffDvt1ZbAhbaljHqKJEK0QE93A9mWk2UN1EqiVUJODKxUNHHy4BTjY1XiO7PCaFvIGgkJAVRJGz1MlEJ3Tx/jo0MvzxuaDut26MU7vQ7SkPKft9yIt7WjfSBieHREhSsW38o5r5kNWqIYKsoX7n+IZnTMDDcjDQlFLORlfcV0wNabJC5mL+xvOuIM31NFyu6hx36PMnnlvHJexvPfbZU51ZQVHh8AAAAASUVORK5CYII=","gengar":"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","clefairy":"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","oddish":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAQ30lEQVR42u2ZaZgV1bWG372r6kx9ep7ogUbmJoATVyUaRUw0khvjjYlxQFExg3MSBSRoMIrR4DzFOSYEg6IRg0aFYIzBRAWHqEGlg9BCd9OcPt196O4z1rDX/dGE6AUiJvfxyQ+/P+fZVbt2rW+ttff6zir4FJ/ik8dhw8bIf6Rhk5qGyRFD99ujceNrhsqEygrZeP2xcsDY/wwS+oODcLqfX10VY2pj826N8/MDhE2IeLyHMina5f4Ro8bJ1OYJcvT4idJYUy6fOAEtEWL+Zvp77d1Orgz5FKnt9Mcn8c621l3uFzo3kE5sIVxSRN3Qpk8+HJNr66Xj7pEytXjfD3kv4yVkUtNI6bzjeGm763A5vPm/d97PBB0CcGTlftL2owNk5oiiTzS1PuzqIEPEi/Orm+F/zkfcimG80blZFTm1akJljeD3AwYV6gXg0LrxMq3h6xxR3SyL5m1HZ8rZlHT3+LKphxwkhc5elG1hoVEKBEErjfJBtMXEqYdw+89+pvaWwIcmTq6plRMnupx56kj82HC2JhyO++Hj9GZyLLvle4weWIPrGC5e7PLq5haeu+40IkUav9+l2HuNL816k1e3tRGqGrqLAc2jx8rjDz9CZUmc4ooSdBjC8epd5v1u+WMy/cxvkUz1qo9NAKA5FpFnf1SLE6lEQgo7Ppk51z1GR76fYuPiOcXUH3w6500sEHeepzgQAgGxInzp6q283t29y5rjR42Vt99r2Xm9t6tTCspQV92gnlq5SixlYzzY78AxNNQ1qLtvulnm/mAuyhFSaVd9LAL7DxklK+cWwN8fK7YNXduEv++lSNV40IKb2U7ryhsYtu4ZVJOiyCslHy3jjEtX8mx61/XGNjZIS3uHyvQmpc/3cRG+OX0mngd2OIQfeARGsMXB83NEwhGswGXfxjjHjYY5j7ayaMkSmieOUx+9B4Coa+PrIkLxLQQ5oUeOYntvgaZYhi6TpMbu44D2d+iKlBM1A7iRPNulQLaqEdLtu7ygpnIIq19aK3nPkMm6GA11dY34rgFj0CoAI9hiE4hgo8gPpEh1dlE/spvqVHaPxu82AgAHRsbJ71tW0LV1M3bzKCJ5n4jtEC8U013kk9U+8bRN+4NnUFXooVeFmH3PRigEPJdsVwBdbW1y4tTPc819DzFybD0bt7Sz5NFliA+zZ19ALBzBsYXABGgbbNdBoSipLlcbkwkJ8poLz7yAdPIN/vxWy15vavatqJKnFq2U3u4OSWzbIolEpyQTCenq7JTW91qkZeNGmX351dKZ7JREqk3ae9ukrzMhG174uWy5pVm+UhYTgIFkUr447gDpb03Iu5tb5buXXi4A/Zu3S093h/QkOySV7JBUT5f0JFLS09kjyVSndPd1SSqVlNRAp7zf8Z4kbp8sX4w6Mrps94XxQ8yGFhfJDT/6JcecMYFkMk9RvAQd1tTVDFPnfHeWtL39Jl3b+7n2rntZsuQRFsy9mJjuw1VFxD0h/8sptLuKU65ZT5vEWPHbFxjTVMOlt9zAA3feqhKJhDiBIbBcLMtGAqGytlE98eQqsW0wtoPn+dRXVzKqvh6LKAXrXd5f/gTl2Q6Ov34F727dpvZ8jEbLZFVbG8ceMYyrb3uMSHkVzfUV3HTbLcyYdSbfP+ViMgMef3jpOXXR/c/I948/nArdj0GwAqHY6ubpBbO4/9GXeMOLcP/DK6kosqhtbCTsKNwgRyHIM+/ymxHR+J5Be/0UfA9fApRVBEZRXhHn8KMP55ijDiGWs9Bdq4kPbOTFF9/iG9c8RTKbU7uVEnZZGb0DndSUfwYRG218fF+x/m9b8enGlwx2KERnd0oyXjcqCBAEBEQJraE6MlhYlo9tWQTGI+/71DdUK0cUmYKH50Hj0EZKK6soLSsjFI5RGo1RFolTGrKoijuEHQdLx+hJZCjYFv0eBHYZFZkNjIkX7/4U2ndovSz645+49JKZHHfRZRx19OEqmegUQ5ab7ryBU06aQY1VTl572I5h1owTKOl18ZQ7eIrYIcTV1NYNwSPANwYRAwZ6kt2y+rU3WbR4EbX1NUw/7ZsMKY3iaEU0EsFYhrAXQiwfbENpea3q3LhZlqsCF82ZDa3P02/+Rv2oPOFwZvcETE6hIg6BU8QJR+zPcV3bBAogNtpEOG7yBGZeOAfRCkHhtbZzzrwruPG2heR9Q3U8REgbCn3b0J4hX8ihLRvRii3t27j/np9z5VVz6R8oMLqxCMtYaK3AeKhAQdhDGxCgL5UUN59HLDj3lG8x78tNOPkO/HANjnQBmV3VqFYKx7HJpz16tm/DyrTi5LrRPliSp6ZpH2ylsbVFTWmFckI2/fkMrptl9KjhygkZbO2SqxtPOlSMoyxM4BNgcAlwQjaRcAytLBQeogREgVgIGhGFUQpEocRQFApjWTZOSZQn1m6iwxqLdnpRBLs/heJWRNJBXi1d9ozcPX8hdaVbaGocxqU33kGuABIpQdtZFHF+8egKSrWmalgT88+dSXqgl7Wvr6GspAjbz3PyN77F6rWv8fDvnyeuHJY/u4JJEw9k3LhxWE6IaNjgWCG0pSkYnwCf4bV1O23pSXUKCLZxSLv9TD/yMIJcmiULjuP47zzE6/l/2L0zhdJBXh1Y2yT7T5jAdxbM4fbrb6KwPc4l3zyFtOtgx+rJ2SV42X5+sHA+w+qH8MfVaznsmK+AZzj60K/y6oof8+qSG+hc8zJ5YqiBASReyW8WLebM303nhTfeIVIUYcktN6BFIwguLk5QzJrX35ac8tFZD9+10baP7ecJhUJcde4XGGW9ybfv2cIzVxzEOfcNyOOb1qtdpIRlaR5b/gRHHnskZ59/HmUl1Tx47VwOmzGTcRMPJB4KiOaFgw44SCVTm+XYoybz9LJlpPvz3LfsEbqfm8sdD/6FF/MoyDL3nLMk5JTw+Slf4Mo588h0p4mVVHD/4jsJi8YxijwKI8LFF84hUJpt6T5OOfVkvnb8NLRfwHbTIAOEnTCu0midQ7S/ZykxsbZBHvnTC0wdP4mSkjhPrnmRe+++nzmXnEfUYTADlULrAgQRNm3pwkRsHnpoCWsf+AWr2zeraQd/Tt7c+C4PLX0aIprRI+uJasWqF17BCRVx/bzZPPv8CnKORmc9sDVa2ZRWVSmAlnc2yDWXXcuUy77NlMQ68pufJaI2k9/qM/PuLYRjUVZvfn/P8mKfqsqdZfvUk06T19a8LT3JHsn0dEp/T0J6tiekL9UhfT2JnfP+8ua7MnXUeDm4eYSs+cPL8vhDj0lLS5sAJHuSkk507Jz79Irfy9RDJ8vZ06fLk6tW7rye6u2UVGpwzY62Tjn4kEPkD5eMkY6fHitb7j1UNv3gIDli2Iclhd4dgUR3L6ufWyEDqW4Jmyj9qV60NlhGoTD42gwGTxkGku9LKpmUDYlt5LSP6Bg9fSm2Z7OUlBezPZkQG4PSQk9PpyR6kjKQz9DRsolE+xYi8VJaW3c4IrDRvqGvLyGRaIxCMkdNZRN2oHECCwlrJK/+uZwGyCHq68edIMNrG7h18RJGjxmFpfIU7MGHIwGABQqMJRjJU+7Aky89j6U1FuD7HlpnEa1ABNdW6MAmJLDP6BGUl9cQ5B1+MOM0Lrh8Ad0DA2LcPPgK8QUjWX77yrNMn3IsC48fQUmwjli0jkjE4iMjAGArCIUcspZLZXW5MjBYZXb8yo6hEbAIOHTCGLQRVGAQfGzboLS74xm18znQGFFcsfB2Lp5/Jbb2eWDeLF5f+w6CwSgPC0VIC1U6T1xDJBQGqxRffBTy0REAKHg+vu1hJMSqF9ZI4IaxnQARgyiDNgofD0tFEMDVf/eGoIzG7BhpUbiBNZiCykXEZ8zQCGtbHTQFMqkcL3cl1PxTviQTv3Im3T0J7rt3ATZx8ihmXvcTpp38DepiZSy7qA4v8PYuAsoHy7eobxrKg/fcx/aePhCNGA1isebtFrSyd4RCPhAehflgo0MUi5c+QmV1rZLBNgRiwLYctIaIdgYLaSSEZwzhsIW1YzXbwGcn7YcJDE7IwRBgRPaOQKSomK5tSeLKIp0tkNNQWlWpyqurlbY0RSXloGSH2YIaFASDFOTvGSMIiuLSip1jpRTGCEb5uK47KCkA3/hk+/tRQHn1cOVaBXw0ZSZHVFlYVgQduBjRe5dC7f09CuD0z02RS269joU33sifX3lXfHwy+YC31q1n6JDJlFqDC7oa0Bb4QjhQFBxN1nPZ0pnknjtvHxSMQQhlwMYCbdCOhdqxPbJBhJObM3jhOvqPnSZaC74fJ5bJUltZjWUKFGgg8Nr3jsDOvZDNURqJM+P007l8zveJlpRw0lkz8QClbBQBIgoQ1r70GsNHjia1tQsdjfDG++08u3QxjeVl3P7KXyVwHCLZPAVlBhtkO6owgNFxJsW38J7v4Xo5HE/jW/1se+oMamQT3ZEDuHTxNlau20BxbfneE3h5W6uaffYZctejS1lw9dXkCzlu/fGVeDrMlIn7Ex8SBwTHwDXzr+Ss2d8jTz3DKwdYOmse0+afg87EOPPEr3LjbXfQY0eptcD4BhQEZpBAVMVwgxRDvHKCVJ6c+IiJk+3uxe9ThMMplre8pz5o/F4RAMim0zQ1NNDdn0dUCRfMvYJ31q3jhC8fxca2LaqjrVWisQhFAdw6ay4F45E2wk9vvhentgbLN2RNngtnnIpRwt1LHsEJR/AyabLB4JZ/of01dd4dw6VX1jBz/jWUpdpZv3wB59/QwosZT5F676O703uCrwTb0bi5NIHrYtBksj7DG6rp60qIHRr0Q8HNUJLPUxUEqFwWv7qUkKcJG4Xne1SGi6iOlROxIogxFFyfwPpHZfViJWQcSBuDBdQXbURKG/e+vb4nrO/pVf81bl9GNA6hpqaYQw4Yw2cnfw4VFRztYFwfbTRBLs+tyx5is+9iCh6RQFBWAS8UEA8V8cyrf+LVjk1qwezvEQ47xKv24aZFv2Lfhn12lLgMJufwmcoogclDdDxlOvgY3el/AtEGbSCso3iSpbqqDFwbEIwxKMDNBCjCKF+TFo2KFkHBA98Q0ha+GZTBIccCOyDXn6WsrIJoURSA1kQSr9DPyA130ZL+DGfPepEXE28TjlT/+wS0a2FsjScD2FTwk+tnEbLDiBn84x5guPHXv2XatMNZ+uASciWlhH2F74A2IYqcKPn8YOs9KASMaagjP6acMiy+es7F9F19mbze8le2D+Q5unkY9y+chKN9wpFq9W+n0Njaeln060dxfRdUhLZEL0r5WMQwxqD1DoWiFaGIRWl5GaXlEa697AKyvuG7J5/IKy1vqZLywRPEcwO0pUAFYALyRT62o4lV16r6EcPU2y5q+rVLWbW+5eN9YtoTOrtSpDJ5BA3YFAKXwA9wCwHFQ2qVjyLt+qAEowRDQJAZwPLTVBgXOzLoxK09PYNFMp0CxyFuQXltpRJX0PaHHX3WuedQXFutPvb3gf+LKSPGyv5fPomLzj+bkogQWBY33vpz3l3/V344dy5jRtfhisWfX1tHQ209Xz9mCqOLi/F9H41COyGea/2bAqgujsnYqqEsfHgJzc2NWMri3gcep3HEBBae9zXebN+6903cvd0DGS/H6795kBnLlyCWhVHgF3zKGqtoaqjBz1mIpfjlA/dy7RVX4eddlm94meKK3XgvsDGeR3EkBJmAsvpadUhjk1jKQ7mafwWKfxEHDxsuKvBRDKpI21bkjceyVb9j5Lhx/3TdCXX1UhSJUDe2md+sePpftuFTfIr/B/wvHjQawGT9gi4AAAAASUVORK5CYII=","gloom":"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","vileplume":"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","poliwhirl":"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","magikarp":"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","gyarados":"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","lapras":"iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAALBUlEQVR42u2Ze5AV9ZXHP+f36+47M3cGEAjDYwYSHkOUFaPB4AOHZBFcYzSaZE1qWWPUsLqbpARMkJhk3SSyisbykdoiRjQPEx9gsoksIggIMioZQUDegzwGhtfADMz73tv9+5394w4YSg2QcgNVy6nqqq7q7l+d7/e8T8MZOSP/v0WO90I6sIpYjAHnPWEYEhYVcvBgo5zWACpHXKK1u7cwc/Va9tQ3IS5HZCyuJcuihYuonv0469ZtPuUggg96YNOGxkNZtrW20thicBKA8URBiraibqxfv/n0daGSkmKd9sJLdKjlnHPKMEZYWXOAwAYI4BEaWxt59LOfIY7dKbWCeY/Pp9M66fcvct55Q/m7YeV4hdU1+wnFHEUbGqFLrx5c+5NfUVIS6WnlQm1tbRw+1IK3BmJFjcHYgMh4igKLBEJD1iCJI3Ix2azntLFAKox08m/+wGUXDeVQcyvtHjbuPMjAbkWUrHubzb+cwdJHHqK3ZCDr0TBFGKTZuGWNnhYx0KN3P52+ZCFd0xE1tY2IBGDgxe98i6qqKtm9/5Dmkg7+864p9JvwHQD27d/Hz67/HLj4hNLy/5kFwtDob1YuZ9+BDDU7m0ECQDCAWMvYceO0X+lZ8rF+fSVRjyiIKoohtMGpjwFjIqpr9mGDACMBRj0Oj/fClfc9wvwf3sUv/7RKWxwcdgGK6/zSo14RDIo/dTFgPLQHHh8ZNv12BpHN828QFLj67uk0aECrGCy+01sUr533coqDuCPOyE+uuhzjPZVfmUAuyWvkDRg8G6rf5M2XX2LZ3Dl4ySsvwOGd+1D1qOqpT6OuuUW+f/H5ioCxBmsD/umL1/ARSXPLPfdQvWU7KimaXYiYDN5A4hW8xxjBez31dSAMLGFo8ApGYNwuMK6BooJiWqUYh9ARNVHoQwRDoXiIIkySwZ9m3agihmeW/JqQkJfnr+HmG1qoz1awrmEcPp2lZu1mZk36KrU1m+nVt7+cFq3EMeDUy83jbmH1sk1Mva2BJ+ZW8Ox8QxsNiAjee1wuOUb5Hr266Vndi7V7jxI9q3uJdjurWItLUvo370aPiDdCWBziUx8lYxSvBu8t3vt8HpJjdWuoP0wQhlhjEIEk8SRJzCkDkO3IyL133q3b7c8p7tOT9lwHxV0K8yYSRVXZX79NS3sNFLGBPjzzcTauWkkYBNggoLy8P84lTJk4WU90iPpQAQCoKokGlA8aCJoPVTFwhPyyPhWEYYFOunMiRaHhs9ddSbYjC2Ko274La0Me/tlPObC/nvun3adxLj4ZEPqut/v3EGBONNR79+vbeZYcPcMICMKK1at4Y/kbpIKAwRWDWfjHl6hasISqxUsZNHgQvrP16FvWh0nf/sYRpf5iXKSiSAvCQr3jxTf49pxl/HbnLu5YVk233kO0qEtXPSkARoQ9W3eiRwGA8Yah5w/nljvvorGlFU2UAWcPQfXdtySXsGDePKJUASYVsKF6Da2NrfzL12/ktttuxhh5D4iS4kIt69tP75j9Io+v30Dl8FJGjehPTW09JSaicvJkEi8nZ4HzR4zkvMtGHOVMjtCniojwmUsulgtHXiCN9Y2IkG8+RPB4nDq8evZtq8VJggJGAtQr3//eFKIwVIBAAgV0/P0zuX/5G1w26my27t3L2toG1m49gEXypAQR8mcF8/gATKRXTXsQxWM6DznS+4gINkqxbPnrunjpUp3yrUmyZM48Rl35D3QrLeUj/copLe9P9549GXTucKxC4D0GBwql/T/K1KlT8lRYpewTIynp3Zu6A82sqjlIFKYRE2EkxCJ0z1pM4rASnHgQR6HhaxUvk6Urz+2s7MRs8kyi9L/iGh54aDopEgAOHjxA4+69HNyzi9jA2DFjWbZkKTjHJypHs+LVV7h07BjCoACDYVvNZj516UVUv7YcE3fQ+2O9yOViEMEguCNsG2HVlg0snP5D2tsa5IQBiBGcprDeIwQYERI0bzqFjtDgrSFl8sZM4oRUKgI8obEgiqjHOIcxgkPoRI8x0vlNvk5kmpoIxOAk3wXH4hGVfMdrhUzgyGRbOaks5J2COLCer5a9ypcHVOdTiOav0CldRoymsPI6vnT9F/WxmU9KR3MWk01wSUw2zqG5hIzCqqoqhg0/j8KCQqLA8tqiRaAel8kCSH1drfxx8jcRG+CMsmbeK2DBhoaWQ/uZdduNxK1NclJ1QABrApw3YDxGYqwDb/KmFScMu2gkEhmaFgX8/g//rV+49jqZMOFrGmSFN5e+jhdFvWPYiAvwiVJXtwdjDWEYsL12F2veXiffmzJJC7qWUHHhKG4dcxH/Mb+Kj1/6KUySA2PY9faW962Axy0oYRjpA/eO5eNnD0ET8N7TZvuwtfSaP0urngRLQS7Donu/y7Wf/xL/euuEo2fv3FWn/cvLZOKkb+jAirPJiicUoXrBAp7+3Rz5n7nz9JmnZxJGETlrePS+ifzbY6/xyU+P5tV583A+x8KHp5O0d8hJA7DW6oo/TaN3v74Yb1GjpEwJM3YMRJR8kUJwgFOh3LWwdOYMcA4xQlgQccONExh96SUCcN9D9+uaFSspKu7KE4/9XJ769TM6+/lnGX3DTUhxV2IPh7Yvpj4uY8iIC/nu6BHg/QfqelwXcs6DyWICh/eKGENMG3hI5EhNUJwo4kN2YomsxZv8bBHHijHRu4xZQxiEhJ1FJZVOU9IlTRMRzT7AiqHVVmBcDkQoKizEuYRsPk5O3IV69uiph1uauHtRFQ9cOZq5i+9kcPlAECERj/XCozsvoMQrqEMFclFCw1Oz6fOP4xEDJufZu3Y59a8upPLTf881n/8CIjbPXBhy19SJlPTtR9x/OIPOHYa3BhsYEu+R2JGoYhJQa5h2xSiM8RxuapETAjCgfIDWH6jnRyvfoi2T8Nw/f4WnZ11Pe+wZ3PccWgrTpFu384sdo8gFhkiU2lmzGDrhBpLDCR5wDvbu2k1zUzPRW68jtGMxqHq8N7iLL6ds8BC6pwPeenM1BWGECIReKT93KHjIGk8sECps37uDX1x73TF6fxAAXbBhM3UakMWxu76BrW9t4oUffJM4bueJZ2+nJFXIlrouuDjLobAUN2A4TcsXMuyqK/BSSFYNipC0d7Bxwztk92ym4uLKzmbWgFgCiThwcA1N9REvTP8Bvv0Q1hiu/q8ZlHQYBg0/Jw9WAfXkvFAUO6ZefuFR3d8/MAKrs1etpy7XQfWCV8hIMTawhOludNUcMyffSpJkWL9jCsYlrN7QRNfuQ/nyFT9icd0WFq/dQc5GeAWXzVGzdhPPT7yJf5/zHFeXrcCLJ4gK8BxixNAnKUgZmjoOH9WlqKBQxzz4U7q4AInBqyIKFnj+x1Npb97/ly1QEIU6ftoj7Nm+m8pbb2bl3LlEJuCFH0+ltb35yEaFKAqPblPixHHPvCq6l/egI+OJk/xiLGlr551NNcya/HV84jFi8plLIE48qu+/ni9Kp9UYg0sc6vODU5LkcN4fv5Bl45hCiSAICbwHIjKpkEwuc0wX77zHJQ4rltAYcnEHoXra8QTGI17JCYgYELCRIUkcvpMBMYq6D5gEczlE5OjOSVWPpNMTzEJduurh9o68u6rHuYTOMfg9Utqju+5vaOTxVRuZ/9SvuHj8eFbPXUhSaKn45Ehq39nG83fcRGtL5kMfKT/cVYiE+mBVFctmPsmYybcjuZiVr72NRoanb7+RXDaRv/lfyr9C1ASGIF2EtYakPYsJA7ItbafFX80zckbOyGkm/wtb6wqVISC7iAAAAABJRU5ErkJggg==","mew":"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","mwtwo":"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","togepi":"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","marill":"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","ditto":"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","koffing":"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","slowpoke":"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"};
/* 精灵渲染：AI 画的 PNG 原样绘制（不量化，保住辨识细节）
   —— 关键：45 只一次性解码进 6×8 离屏 atlas，渲染时从 atlas 取区域 drawImage。
   这样渲染路径完全同步，不会出现「bodyCanvas 缓存了尚未解码完的空图」这个经典 bug。 */
/* v6.11：SPR 共 155 条（45 原种 + 22 链 × 5 阶 = 110 进化形态）。
   155 / 10 列 = 16 行。⚠️ 这个常量必须 >= ceil(Object.keys(SPR).length / SPR_COLS)，
   否则第N 行之后的精灵画到 atlas 画布外，drawImage 静默失败 → 那些形态全变空白。
   改 SPR 条目数时，务必同步核对这个值（.workbuddy/tmp/count_spr.js 会打印容量校验）。*/
const SPR_COLS=10,SPR_ROWS=16,SPR_CELL=48;
let SPR_ATLAS=null;
const SPR_IDX={};Object.keys(SPR).forEach(function(id,k){SPR_IDX[id]=k;});
/* 轮廓掩膜缓存（v6.8转生辉光用）。
   必须用 var 且声明在 buildAtlas 之前 —— atlas 的 onload 是异步回调，
   会在这里清缓存；若用 const 且声明在后面，回触发 TDZ ReferenceError。 */
var SIL_CACHE={};
function buildAtlas(){
  const cv=document.createElement('canvas');
  cv.width=SPR_COLS*SPR_CELL;cv.height=SPR_ROWS*SPR_CELL;
  const g=cv.getContext('2d');
  let i=0;
  Object.keys(SPR).forEach(function(id){
    const b=SPR[id];if(!b)return;
    const col=i%SPR_COLS,row=Math.floor(i/SPR_COLS);
    const im=new Image();
    im.onload=function(){
      g.drawImage(im,col*SPR_CELL,row*SPR_CELL,SPR_CELL,SPR_CELL);
      /* atlas 变了，轮廓掩膜缓存必须一起失效，否则辉光会按空掩膜画成"没光" */
      try{BODY_CACHE.clear();}catch(e){}
      try{for(const k in SIL_CACHE)delete SIL_CACHE[k];}catch(e){}
      try{for(const k in RING_CACHE)delete RING_CACHE[k];}catch(e){}   /* v6.15：外扩环缓存同理 */
      try{AUR_LAYER.clear();}catch(e){}                               /* v6.17：柔光图层同理 */
    };
    /* ⚠️ SPR 里存在两种格式（v6.11 探针查出来的隐藏 bug）：
       · v6.7烘焙的旧进化链 = 裸 base64（没有 data: 前缀）→ 直接赋给 img.src 会加载失败，
         那 11 张精灵在 atlas 里一直是空白格，只因当时 100 格容量刚好没人注意到；
       · v6.11 新烘焙的 55 张 = 完整 data URL。
       这里统一判断是否已带前缀，两种格式都能用。 */
    im.src=(b.indexOf('data:')===0)?b:('data:image/png;base64,'+b);
    i++;
  });
  SPR_ATLAS=cv;
  return cv;
}
/* ============================================================================
   进化形态系统（v6.4 · 美术策划版）
   ----------------------------------------------------------------------------
   先诊断再动手：45 只 AI 精灵源图经程序化体检（包围盒 / 重心 / 触边 / 透明率）
   全部合格，可疑度 0 —— 雷丘、霸王花"缺一块"其实是 128px 高质量原图
   被压到 23~47px 显示后细节糊掉造成的错觉，素材本身没有被裁。
   结论：不需要重画 45 只，真正要做的是让 1-10 阶段有"形态变化"而不只是变大。

   关键教训（走过的弯路，务必记住）：
   最初尝试用程序做 Q 版变形 —— 把精灵上半部分（头）放大后叠回身体。
   在像素画上这是错的：每个像素都是轮廓信息，切开重组会破坏连通性。
   实测皮卡丘的耳朵被拉成两块黑方砖横在两侧，比不做更难看。
   正确做法：每个阶段整只重绘。AI 一次生成一条链的三阶（同风格同比例），
   形态差异由美术完成，程序只负责"取对应那一张图"。

   阶段划分（对齐进化图的三段式：种子→草→花）：
     t=0      蛋
     t=1..3   幼体（Q 版小圆）
     t=4..7   一阶
     t=8..10  成体（完全体）
   ==========================================================================*/

/* v6.6：11 条真实进化链 × 5 阶 = 55 只 AI 精灵。
   为什么是 5 阶（v6.5 的教训）：
   v6.5 只有 3 阶图却映射到 10 个阶段（t1-3/t4-7/t8-10），
   结果 7 个阶段里只发生了 2 次变化 —— 学生看到"到第四阶段就不动了"。
   现在每条链 5 阶，10 个阶段每 2 阶变一次，共 5 次可见进化。 */
const EVO_CHAINS={
  pika:['evo_pichu_baby','evo_pichu','evo_pikachu','evo_raichu_young','evo_raichu'],
  bulba:['evo_bulba_baby','evo_bulba','evo_ivysaur','evo_venusaur_young','evo_venusaur'],
  char:['evo_charmander_baby','evo_charmander','evo_charmeleon','evo_charizard_young','evo_charizard'],
  squirt:['evo_squirtle_baby','evo_squirtle','evo_wartortle','evo_blastoise_young','evo_blastoise'],
  eevee:['evo_eevee_baby','evo_eevee','evo_vaporeon','evo_jolteon','evo_sylveon'],
  oddish:['evo_oddish_baby','evo_oddish','evo_gloom','evo_vileplume_young','evo_vileplume'],
  magikarp:['evo_magikarp_baby','evo_magikarp','evo_magikarp2','evo_gyarados_young','evo_gyarados'],
  jiggly:['evo_jigglypuff_baby','evo_jigglypuff','evo_wigglytuff','evo_wigglytuff2','evo_wigglytuff3'],
  psyduck:['evo_psyduck_baby','evo_psyduck','evo_psyduck2','evo_golduck_young','evo_golduck'],
  vulpix:['evo_vulpix_baby','evo_vulpix','evo_vulpix2','evo_ninetales_young','evo_ninetales'],
  marill:['evo_marill_baby','evo_marill','evo_marill2','evo_azumarill_young','evo_azumarill'],
  meow:['evo_meow_baby','evo_meow','evo_persian','evo_persian_gold','evo_meowstic'],
  lax:['evo_happiny','evo_munchlax','evo_snorlax_young','evo_snorlax','evo_ultra_snorlax'],
  gengar:['evo_gastly','evo_haunter','evo_gengar','evo_mega_gengar','evo_ultra_gengar'],
  clef:['evo_cleffa','evo_clefairy_small','evo_clefairy','evo_clefable','evo_ultra_clefable'],
  poli:['evo_poliwag','evo_poliwag_big','evo_poliwhirl','evo_poliwrath','evo_politoed'],
  lpras:['evo_lapras_small','evo_lapras','evo_lapras_lush','evo_eiscue','evo_gmax_eiscue'],
  mewtwo:['evo_mew','evo_mewtwo','evo_mega_mewtwo_x','evo_mega_mewtwo_y','evo_ultra_mewtwo'],
  toge:['evo_togepi_baby','evo_togepi','evo_togetic','evo_togekiss','evo_ultra_togekiss'],
  weez:['evo_koffing_small','evo_koffing','evo_weezing','evo_galar_weezing','evo_ultra_weezing'],
  slow:['evo_slowpoke_small','evo_slowpoke','evo_slowbro','evo_slowking','evo_ultra_slowking'],
  ditto:['evo_ditto_baby','evo_ditto','evo_ditto_beast','evo_ditto_transform','evo_ultra_ditto'],
};
/* 物种 id -> 链 key。链内所有物种共用同一条 5 阶链
   （皮卡丘/皮丘/雷丘 都是同一条链的第 1/3/5 阶形态） */
const EVO_OF={
  pichu:'pika',
  pikachu:'pika',
  raichu:'pika',
  bulbasaur:'bulba',
  ivysaur:'bulba',
  venusaur:'bulba',
  charmander:'char',
  charmeleon:'char',
  charizard:'char',
  squirtle:'squirt',
  wartortle:'squirt',
  blastoise:'squirt',
  eevee:'eevee',
  vaporeon:'eevee',
  jolteon:'eevee',
  flareon:'eevee',
  espeon:'eevee',
  umbreon:'eevee',
  leafeon:'eevee',
  glaceon:'eevee',
  sylveon:'eevee',
  oddish:'oddish',
  gloom:'oddish',
  vileplume:'oddish',
  magikarp:'magikarp',
  gyarados:'magikarp',
  jigglypuff:'jiggly',
  wigglytuff:'jiggly',
  psyduck:'psyduck',
  golduck:'psyduck',
  vulpix:'vulpix',
  ninetales:'vulpix',
  marill:'marill',
  clefairy:'clef',
  ditto:'ditto',
  gengar:'gengar',
  koffing:'weez',
  lapras:'lpras',
  meowth:'meow',
  mew:'mewtwo',
  mwtwo:'mewtwo',
  poliwhirl:'poli',
  slowpoke:'slow',
  snorlax:'lax',
  togepi:'toge',
};
const EVOSZ=[SPR_CELL,SPR_CELL,SPR_CELL,SPR_CELL,SPR_CELL];
function evoStageOf(t){
  const t2=Math.max(1,Math.min(10,t||1));
  return Math.floor((t2-1)/2);   /* t1-2→0  t3-4→1  t5-6→2  t7-8→3  t9-10→4 */
}
function pickEvoImg(sid,stage){
  const ck=EVO_OF[sid];
  if(!ck)return sid;
  const arr=EVO_CHAINS[ck];
  if(!arr)return sid;
  return arr[Math.max(0,Math.min(arr.length-1,stage))];
}
function drawSprite(g,o,sid){
  const stage=evoStageOf(o.t||1);
  const k=SPR_IDX[pickEvoImg(sid,stage)];
  const size=SPR_CELL;                            /* 1:1，不缩放 */
  const x=Math.round(o.cx-size/2),y=Math.round(o.gy-size);
  if(SPR_ATLAS&&k!==undefined){
    const col=k%SPR_COLS,row=Math.floor(k/SPR_COLS);
    const prev=g.imageSmoothingEnabled;
    g.imageSmoothingEnabled=false;              /* 硬像素边缘，不糊 */
    g.drawImage(SPR_ATLAS,col*SPR_CELL,row*SPR_CELL,SPR_CELL,SPR_CELL,x,y,size,size);
    g.imageSmoothingEnabled=prev;
  }else{
    ER(g,o.cx,o.gy-2,2,2,'rgba(255,215,94,.5)');
  }
  return {x:x,y:y,w:size,h:size,top:y};
}

/* ---- 转生·炫彩背景（v6.7 美术改版） ----
   为什么废弃「转生外框」（v6.5 / v6.6 都栽在这里）：
     ① 框是「闭合矩形」，而精灵是有机轮廓 —— 矩形永远和轮廓打架，
        放到画布四边 → 变成一个无意义的方框噪声；贴到精灵身上 → 压住辨识特征。
     ② 框只能表达「有/无」「高/低」，不能表达「炫」。
   v6.7 改为「背景」：
     · 光晕画在精灵【背后】（drawPet 里在 drawSprite 之前调用），永远不遮本体；
     · 用 4×4 Bayer 有序抖动做径向衰减 —— 像素画里画柔和渐变的唯一正确姿势，
       渐变靠 dither 点阵表达，颜色全部自带 alpha，不碰 g.globalAlpha（缓存画布会糊）；
     · 色相环随角度铺开 + 随 frame 缓慢旋转，转生一眼可辨；
     · 脚下一圈「地光环」把精灵和背景在空间上咬合，避免精灵像贴纸浮在光晕上；
     · 三个转生档位共用同一套形状，只换色相环（Hue base）与地光环密度 → 一眼比出高低。
   美术约束：像素画里「炫」= 高饱和 + 高频细节，不是大面积高光。
   所以外圈用稀疏抖点（不糊成一坨），内圈才给密点，整体是「发光的星云」而不是「白色光球」。 */
/* v6.8 决策（美术 + 游戏策划共同拍板）：取消 ★1/★2/★3 三档分级。
   原分级失败的原因不是"炫度不够"，而是【认知负担】：
     ① 课堂上要同时解释"进化阶段"和"转生星级"两套数字，学生记不住；
     ② 三档差异靠色相环分辨，投影仪上三档几乎看不出差别，等于白做；
     ③ 唯一真正被感知的只有"转生了 / 没转生"这一件事。
   所以星级只保留【文字与图标的★★★统一徽记】，表现层永远只有一套最炫的规格。
   prestige 数值仍照常自增、照常进排行榜/存档，只是【不再改变任何画面】——
   玩家的成长感来自"它是转生宠"，不是"它是几星宠"。 */
/* ==================================================================
   【v6.15 美术终稿】转生特效 = 「金阙圣光 · Aureole」（贵金属觉醒态）
   ------------------------------------------------------------------
   淘汰旧版「彩虹流光」的三条理由（美术策划复核）：
     ① 彩虹全谱色相 + Bayer 抖点 = 糖果噪点，是「廉价像素特效」的典型特征；
     ② 只有「贴身描边 + 地环」两层，没有纵深，投影上就是一圈彩色毛边；
     ③ 相位只有 2 帧（f2），表现为「抖」而不是「流」，课堂上看久了闹眼睛。
   新方案四条原则：
     ① 限色 —— 贵金属只取 5 阶（浅金/正金/深金/暗金 + 冷白高光）。限色=克制=高级；
     ② 纵深 —— 四层结构：脚下法阵 → 贴身圣辉 → 头顶金轮 → 上升金尘；
     ③ 慢   —— 全部由 12 帧相位驱动，慢转 + 呼吸，绝不闪；
     ④ 符号 —— 头顶悬浮金轮是跨文化通用的「觉醒/神圣」符号，一眼读懂。
   冷暖对比（暖金 + 极稀疏的冷白高光）是金属质感的来源，全暖会显得像塑料。
   ================================================================== */
const AUREOLE={
  /* 【v6.16 修正】v6.15 首版把外圈写成 #6E4210（明度 24% 的褐），理由是"白底上要靠它立边界"。
     实测在深色 hero 上直接变成一圈泥点，浅底卡片上也土 —— 用"降明度换对比"是错的。
     正确做法：色相钉在 38~42°（纯金），只让【明度】从 88% 递减到 38%，并用 alpha 快速衰减。
     这样既是金属渐变（金→深金），又不会跑出褐色；浅底上深金仍可见，深底上亮金够跳。 */
  rim :['#FFF7CE','#FFDA6E','#F2B23C','#D68C1E','#A86414'],
  rimA:[1.00,0.96,0.80,0.54,0.30],
  spec  :'#FFFFFF',   /* 镜面高光：内圈极稀疏的纯白点 —— 金属「发亮」的关键，只提亮不改色相 */
  glow  :'#EAF6FF',   /* 冷白高光：最外圈极稀疏，模拟金属边缘的反光（冷暖对比=金属感） */
  bright:'#FFF8DC',   /* 光点最亮处 */
  motes :5,           /* 上升金尘数量 —— 少而慢，一多就退化成噪点（旧版最失败处） */
  haloN :20           /* 头顶金轮点数：必须够密（20 点在 rx=8 上间距约 2.5px）才连成环，
                         10 点会断成散点，读不出「轮」 */
};

/* =========================================================================
   v6.17 转生特效重制：从「像素点阵」到「矢量柔光」
   -------------------------------------------------------------------------
   为什么旧版无论怎么调配色都「不高级」：
     drawPet 画在 52×72 的离屏画布上，paint() 再把它最近邻放大 8 倍。
     这块画布上的每一个 1×1 点，放大后都是 8×8 的硬边色块 ——
     于是「彩虹描边」「Bayer 棋盘格」「随机散点」看上去全都是像素特效。
     【病灶是分辨率，不是配色】—— 改颜色永远治不好。
   根治办法：
     把光环从离屏小画布搬到 paint() 的最终分辨率画布上，全部用矢量路径
     （createRadialGradient / arc / ellipse / 高斯 shadow）绘制，
     一个 1×1 像素点都不画。
     宠物本体仍是像素精灵（保持像素画风），光晕是连续柔光 ——
     「像素本体 + 电影级柔光」的材质对比，才是高级感的来源。
   ========================================================================= */
const AUR_SR=4;        /* 预渲染图层倍率：1 逻辑像素 = 4 位图像素 */
const AUR_PAD=10;      /* 图层外扩留白（逻辑像素）：容纳高斯外晕 */
var AUR_LAYER=new Map();
var AUR=null;          /* drawPet 写入 → bodyCanvas 随缓存一起存 → paint 读取 */

/* 身体柔光图层：金色剪影 + 三层高斯外晕。
   预渲染并缓存 —— 每帧只需 1 次 drawImage，blur 开销为零（60 只宠同时跑也不卡）。 */
function auraLayer(sid){
  let c=AUR_LAYER.get(sid);
  if(c)return c;
  const S=AUR_SR,C=SPR_CELL,P=AUR_PAD;
  const w=(C+P*2)*S,h=(C+P*2)*S;
  c=document.createElement('canvas');c.width=w;c.height=h;
  const g=c.getContext('2d');
  const k=SPR_IDX[sid];
  if(SPR_ATLAS&&k!==undefined){
    const col=k%SPR_COLS,row=Math.floor(k/SPR_COLS);
    const ox=P*S,oy=P*S,side=C*S;
    g.imageSmoothingEnabled=false;
    g.drawImage(SPR_ATLAS,col*C,row*C,C,C,ox,oy,side,side);
    /* ① 本体：方向性金渐变 —— 光源在上方，上亮下暗，光壳才有体积而不是平涂金块 */
    g.save();
    g.globalCompositeOperation='source-atop';
    const lg=g.createLinearGradient(0,oy,0,oy+side);
    lg.addColorStop(0,   'rgba(255,251,228,0.96)');
    lg.addColorStop(0.32,'rgba(255,224,136,0.82)');
    lg.addColorStop(0.66,'rgba(243,180,64,0.64)');
    lg.addColorStop(1,   'rgba(196,122,26,0.48)');
    g.fillStyle=lg;g.fillRect(0,0,w,h);
    g.restore();
    /* ② 外晕：把本体推到画布外，只让它的高斯投影落在画布内 —— 得到纯柔光、不含本体。
       三层由远及近：远处极淡极散（氛围），近处亮而实（贴身圣辉）。 */
    g.save();
    g.globalCompositeOperation='lighter';
    /* v6.17b 柔化：内层原本 a=0.42/b=1.8 → 在轮廓外压出一条亮边，看起来像「金描边」而不是「光」。
       改成 大半径低浓度 的弥散配比：光要「晕」出去，不能「贴」上去。 */
    const LR=[
      {b:14.0*S,a:0.22,c:'rgba(255,166,34,1)'},
      {b:6.5*S, a:0.36,c:'rgba(255,202,88,1)'},
      {b:3.1*S, a:0.38,c:'rgba(255,238,188,1)'}
    ];
    for(let i=0;i<LR.length;i++){
      const L=LR[i];
      g.shadowColor=L.c;g.shadowBlur=L.b;g.shadowOffsetX=-w*2;
      g.globalAlpha=L.a;
      g.drawImage(SPR_ATLAS,col*C,row*C,C,C,ox+w*2,oy,side,side);
    }
    g.restore();
  }
  if(AUR_LAYER.size>48)AUR_LAYER.clear();
  AUR_LAYER.set(sid,c);
  return c;
}
/* 脚下法阵：平滑椭圆光斑 + 细金环 + 旋转刻符（全是矢量路径，无点阵） */
function drawAureoleGround(g,aur,S,br){
  const T=Math.PI*2;
  const cx=aur.cx*S,gy=aur.gy*S;
  const rw=Math.max(7.5,SPR_CELL*0.46)*S, rh=rw*0.24;
  g.save();
  g.translate(cx,gy);g.scale(1,rh/rw);
  /* 地面被照亮的连续光斑：中心暖白 → 中段暖金 → 外缘透明 */
  const rg=g.createRadialGradient(0,0,rw*0.12,0,0,rw);
  rg.addColorStop(0,   'rgba(255,240,196,0.50)');
  rg.addColorStop(0.62,'rgba(255,202,92,0.26)');
  rg.addColorStop(1,   'rgba(255,172,44,0)');
  g.fillStyle=rg;g.beginPath();g.arc(0,0,rw,0,T);g.fill();
  /* 一道细金环：给光斑收边，投影仪上读数更清晰 */
  g.beginPath();g.arc(0,0,rw,0,T);
  g.lineWidth=Math.max(1,0.85*S);
  g.strokeStyle='rgba(255,238,182,'+(0.80*br).toFixed(3)+')';
  g.stroke();
  g.restore();
  /* 6 段旋转刻符，12 帧转一圈 —— 慢，才有「法阵」的仪式感（快了就变噪点） */
  g.save();
  g.translate(cx,gy);g.scale(1,rh/rw);g.rotate(aur.frame/12*T);
  g.lineWidth=Math.max(1,0.9*S);
  g.strokeStyle='rgba(255,250,214,'+(0.85*br).toFixed(3)+')';
  for(let i=0;i<6;i++){
    const a=i/6*T;
    g.beginPath();g.arc(0,0,rw*0.70,a,a+0.40);g.stroke();
  }
  g.restore();
}
/* 背后层：贴身圣辉 + 脚下法阵（画在本体之前，绝不遮宠物） */
function drawAureoleBack(g,aur,S){
  const T=Math.PI*2;
  const br=0.84+0.16*Math.sin(aur.frame/12*T);        /* 12 帧慢呼吸 */
  if(aur.sid){
    const L=auraLayer(aur.sid);
    /* 精灵 0 阶会缩到 78%，光晕图层必须按【实际边长】等比缩放，否则光环比宠物大一圈 */
    const a2=(aur.aw||SPR_CELL)/SPR_CELL;
    const sz=(SPR_CELL+AUR_PAD*2)*S*a2;
    const off=AUR_PAD*S*a2;
    g.save();
    g.imageSmoothingEnabled=true;                     /* 柔光是连续色调，必须平滑缩放 */
    g.globalAlpha=br;
    g.drawImage(L,(aur.x*S)-off,(aur.y*S)-off,sz,sz);
    g.restore();
  }else{
    /* 手绘态（无精灵掩膜）：用体型近似的柔光椭圆 */
    const cx=aur.cx*S,cy=(aur.gy-aur.bh*0.52)*S;
    const rw=aur.bw*0.80*S,rh=aur.bh*0.66*S;
    g.save();g.translate(cx,cy);g.scale(1,rh/rw);
    const rg=g.createRadialGradient(0,0,rw*0.15,0,0,rw);
    rg.addColorStop(0,   'rgba(255,232,168,0.42)');
    rg.addColorStop(0.50,'rgba(255,200,88,0.26)');
    rg.addColorStop(1,   'rgba(255,176,50,0)');
    g.fillStyle=rg;g.beginPath();g.arc(0,0,rw,0,T);g.fill();
    g.restore();
  }
  drawAureoleGround(g,aur,S,br);
}
/* 头顶金轮：柔光底 + 金属渐变主环 + 旋转刻符 + 十字星芒 */
function drawAureoleHalo(g,aur,S,br){
  const T=Math.PI*2;
  const cx=aur.cx*S, y=Math.max(2.5,aur.top-5)*S;
  const rx=9.4*S, ry=3.6*S;
  const k=ry/rx;
  /* ① 柔光底：让金轮像「自身在发光」，而不是「描了个圈」 */
  g.save();g.translate(cx,y);g.scale(1,k);
  const rg=g.createRadialGradient(0,0,rx*0.42,0,0,rx*1.75);
  rg.addColorStop(0,'rgba(255,228,146,0.34)');
  rg.addColorStop(1,'rgba(255,198,74,0)');
  g.fillStyle=rg;g.beginPath();g.arc(0,0,rx*1.75,0,T);g.fill();
  g.restore();
  g.save();
  g.translate(cx,y);g.scale(1,k);
  /* ② 主环：横向金渐变描边（两端暗、中段亮 = 圆柱受光的金属环，不是平涂线） */
  g.beginPath();g.arc(0,0,rx,0,T);
  const lg=g.createLinearGradient(-rx,0,rx,0);
  lg.addColorStop(0,   'rgba(255,206,96,0.60)');
  lg.addColorStop(0.42,'rgba(255,249,220,1)');
  lg.addColorStop(0.58,'rgba(255,249,220,1)');
  lg.addColorStop(1,   'rgba(255,206,96,0.60)');
  g.strokeStyle=lg;
  g.lineWidth=Math.max(1,1.95*S);
  g.globalAlpha=br;
  g.stroke();
  /* ③ 外圈刻痕：6 段短弧，随帧极慢转动。
     原本用的是整圈虚线（setLineDash），但椭圆被 scale(1,k) 压扁后，
     上下两侧的虚线首尾相连成【两条横向虚线】，观感很怪 —— 换成离散短弧才读得出「法轮」。 */
  for(let i=0;i<6;i++){
    const a=i/6*T+(aur.frame/12)*T*0.30;
    g.beginPath();g.arc(0,0,rx*1.34,a-0.13,a+0.13);
    g.strokeStyle='rgba(255,246,200,'+(0.78*br).toFixed(3)+')';
    g.lineWidth=Math.max(1,1.05*S);
    g.stroke();
  }
  g.restore();
  /* ④ 十字星芒：一道极细的镜头光斑 —— 提升「精致度」最有效的一笔，成本极低 */
  g.save();
  g.translate(cx,y);
  g.globalCompositeOperation='lighter';
  const fl=rx*2.1, th=Math.max(1,0.7*S);
  const lg2=g.createLinearGradient(-fl,0,fl,0);
  lg2.addColorStop(0,  'rgba(255,226,150,0)');
  lg2.addColorStop(0.5,'rgba(255,246,214,'+(0.85*br).toFixed(3)+')');
  lg2.addColorStop(1,  'rgba(255,226,150,0)');
  g.fillStyle=lg2;g.fillRect(-fl,-th/2,fl*2,th);
  const vh=ry*2.6;
  const lg3=g.createLinearGradient(0,-vh,0,vh);
  lg3.addColorStop(0,  'rgba(255,226,150,0)');
  lg3.addColorStop(0.5,'rgba(255,246,214,'+(0.58*br).toFixed(3)+')');
  lg3.addColorStop(1,  'rgba(255,226,150,0)');
  g.fillStyle=lg3;g.fillRect(-th/2,-vh,th,vh*2);
  g.restore();
}
/* 上升金尘：6 颗柔和光点（径向渐变圆，不是方块），12 帧一循环 */
function drawAureoleMotes(g,aur,S){
  const n=6,H0=Math.max(8,aur.gy-aur.top-2);
  for(let i=0;i<n;i++){
    const ph=((aur.frame/12)+i/n)%1;
    const px=(aur.cx+Math.sin(i*2.1)*(13+i))*S;
    const py=(aur.gy-3-ph*H0)*S;
    const fade=Math.sin(ph*Math.PI);                 /* 两端淡出 */
    if(fade<=0.03)continue;
    const r=(1.6+1.4*fade)*S;
    const rg=g.createRadialGradient(px,py,0,px,py,r);
    rg.addColorStop(0,   'rgba(255,252,232,'+(0.90*fade).toFixed(3)+')');
    rg.addColorStop(0.38,'rgba(255,216,124,'+(0.40*fade).toFixed(3)+')');
    rg.addColorStop(1,   'rgba(255,190,70,0)');
    g.fillStyle=rg;
    g.beginPath();g.arc(px,py,r,0,Math.PI*2);g.fill();
  }
}
/* 前景层：头顶金轮 + 上升金尘（画在本体之上） */
function drawAureoleFront(g,aur,S){
  const T=Math.PI*2;
  const br=0.88+0.12*Math.sin(aur.frame/12*T);
  drawAureoleHalo(g,aur,S,br);
  drawAureoleMotes(g,aur,S);
}

/* 兼容残留的旧引用（手绘态 / 蛋态仍在读 PRISM.hue）：统一改成金色，
   保证「转生＝金」这一套视觉语言在全站一致，不会出现彩虹与金并存。 */
const PRISM={
  hue:43,sat:95,lit:62,dens:2.05,rays:6,halo:0.70
};
/* 4×4 Bayer 抖动矩阵：像素画做渐变的行业标准做法 */
const BAYER4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
/* ------------------------------------------------------------------
   【v6.8 美术终稿】转生辉光 = 精灵真实轮廓外扩，不是矩形放射
   ------------------------------------------------------------------
   v6.7 踩的最后一个坑：把径向渐变直接铺在画布上，结果在白卡片上
   出现一个「四边硬切的大色块」—— 形状还是矩形，只是换了颜色，
   和v6.5/v6.6 的外框是同一个毛病的马甲。实测截图里雷丘、小火龙
   都被身后那块青绿方砖压掉了辨识度。

   正确做法（像素游戏通行方案·轮廓辉光 SilhouetteGlow）：
     1. 取 sprite 自身的 alpha 掩膜（即它真正的有机轮廓）；
     2. 把掩膜按 8 邻域向外膨胀 N 圈 → 得到一圈紧贴身体的「光壳」；
     3. 光壳用 Bayer 抖动上色：越外圈越稀 → 天然的柔和衰减，
        而且边界永远是身体形状，永远不会出现直线边；
     4. 辉光在【精灵之前】绘制，永不遮挡本体。
   这样「炫」来自紧贴身体的高频彩虹色边，而不是一坨大面积背景雾。
   ------------------------------------------------------------------ */
/* 精灵掩膜缓存：key = 精灵图 id（已含阶段）—— 轮廓是静态的，只有辉光颜色随帧变 */
/* （SIL_CACHE 已在文件头部声明，此处不再重复声明） */
/* 关键：AI 素材带抗锯齿，alpha>40 会把轮廓外的半透明杂散点也当身体，
   dilate 之后整格被填满 → 辉光变成一个 48×48 的方块（v6.8 首次实测翻车）。
   所以两件事必须一起做：① 阈值提到 160，只认实心像素；
   ② 再做一次「去毛刺」—— 删掉四邻域里同伴少于 3 个的孤立点。 */
function spriteMask(sid){
  if(SIL_CACHE[sid])return SIL_CACHE[sid];
  const k=SPR_IDX[sid];
  const m=new Uint8Array(SPR_CELL*SPR_CELL);
  if(SPR_ATLAS&&k!==undefined){
    const col=k%SPR_COLS,row=Math.floor(k/SPR_COLS);
    const tc=document.createElement('canvas');tc.width=SPR_CELL;tc.height=SPR_CELL;
    const tg=tc.getContext('2d',{willReadFrequently:true});
    tg.drawImage(SPR_ATLAS,col*SPR_CELL,row*SPR_CELL,SPR_CELL,SPR_CELL,0,0,SPR_CELL,SPR_CELL);
    try{
      const d=tg.getImageData(0,0,SPR_CELL,SPR_CELL).data;
      let any=0;
      for(let i=0;i<SPR_CELL*SPR_CELL;i++){ if(d[i*4+3]>160){m[i]=1;any++;} }
      /* atlas 还没解码完时 getImageData 全 0 —— 这种空掩膜【绝不能缓存】，
         否则后续所有帧都画不出辉光（onload 清缓存也可能已经错过）。 */
      if(!any)return m;
      /* 去毛刺：3×3 窗口内同伴 <3 的点删掉（最多迭代 2 轮，收敛快） */
      for(let pass=0;pass<2;pass++){
        const out=Uint8Array.from(m);let changed=false;
        for(let y=1;y<SPR_CELL-1;y++)for(let x=1;x<SPR_CELL-1;x++){
          const i=y*SPR_CELL+x;
          if(!m[i])continue;
          let n=0;
          for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
            if(!dx&&!dy)continue;
            if(m[(y+dy)*SPR_CELL+x+dx])n++;
          }
          if(n<3){out[i]=0;changed=true;}
        }
        m.set(out);
        if(!changed)break;
      }
    }catch(e){}
  }
  SIL_CACHE[sid]=m;
  return m;
}
/* 轮廓外扩：ring[p] = 该像素属于第几圈（1=身体本体，2..dist+1=依次向外）。
   必须是 src/dst 双缓冲 —— 早期版本在同一个数组里「读+写」，
   导致刚写入的邻居立刻成为下一跳的源，一轮就扩散成整张图（v6.8 首次实测翻车）。 */
function dilate(mask,dist){
  const N=SPR_CELL*SPR_CELL;
  const ring=new Uint8Array(N);
  let cur=new Uint8Array(N);
  for(let i=0;i<N;i++)if(mask[i]){ring[i]=1;cur[i]=1;}
  let dst=new Uint8Array(N);
  for(let p=1;p<=dist;p++){
    dst.fill(0);
    for(let y=0;y<SPR_CELL;y++){
      for(let x=0;x<SPR_CELL;x++){
        const i=y*SPR_CELL+x;
        if(!cur[i])continue;
        /* 写 dst，并把 8 邻域一起点亮 —— 只读cur、只写 dst，无链式传播 */
        for(let dy=-1;dy<=1;dy++){
          const Y=y+dy;if(Y<0||Y>=SPR_CELL)continue;
          for(let dx=-1;dx<=1;dx++){
            const X=x+dx;if(X<0||X>=SPR_CELL)continue;
            dst[Y*SPR_CELL+X]=1;
          }
        }
      }
    }
    /* 把本轮新点记为第 p+1 圈 */
    for(let i=0;i<N;i++){
      if(dst[i]&&!ring[i])ring[i]=p+1;
    }
    const t=cur;cur=dst;dst=t;
  }
  return ring;
}
/* 膨胀结果缓存：dilate 是 48×48 × 5 轮 × 8 邻域 ≈ 9 万次内层运算，
   而班级页可能同时有 60 只转生宠在跑动画 —— 每帧重算会直接卡死。
   轮廓是静态的（只随精灵图变），算一次缓存起来即可。 */
var RING_CACHE={};
function silRing(sid,dist){
  const ck=sid+'|'+dist;
  const c=RING_CACHE[ck];
  if(c)return c;
  const r=dilate(spriteMask(sid),dist);
  /* ⚠️ 空掩膜（atlas 还没解码完）绝不能缓存，否则后续所有帧都画不出圣辉 */
  let any=0;for(let i=0;i<r.length;i++)if(r[i]){any=1;break;}
  if(any)RING_CACHE[ck]=r;
  return r;
}
/* #RRGGBB + alpha → rgba()：贵金属配色用十六进制写最直观，绘制时需要带透明度 */
function hexA(hex,a){
  const n=parseInt(hex.charAt(0)==='#'?hex.slice(1):hex,16);
  return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','
         +Math.max(0,Math.min(1,a)).toFixed(3)+')';
}
/* v6.17：旧的点阵光环函数（drawSilGlow / drawAureoleHalo / drawAureoleMotes / drawPrismGround）已整体移除。
   ⚠️ 它们与新写的矢量版本【同名】，而定义位置更靠后 → 会静默覆盖新函数，
   导致 drawAureoleHalo(g,aur,S,br) 收到旧签名 (g,cx,topY,frame)，cx 变成对象 → 坐标 NaN → 金轮一个像素都画不出来。
   教训：同名重新实现时，必须先把旧定义删掉，不能只改调用点。 */

/* 各进化阶的「实际视觉高度」（素材预处理时的目标高度梯度）。
   精灵一律按整格 SPR_CELL=48 1:1 贴出，但格子里留白不同：
   t1 的皮丘宝宝只占 24px，其余是透明 —— 背景光晕必须按【实际高度】算，
   否则第一阶会被一圈巨大的光包住，看起来像「小孩穿大人袍」。 */
const SPR_VIS_H=[24,30,36,42,46];
function sprBoxGuess(t){
  return SPR_VIS_H[Math.max(0,Math.min(SPR_VIS_H.length-1,evoStageOf(t||1)))]||40;
}
/* v6.8：旧的 drawPrismBackdrop（矩形径向）已删除——
   它在白卡片上必然形成四边硬切的色块，与v6.5/v6.6 的外框是同一类错误。
   精灵态走 drawSilGlow（贴轮廓辉光），手绘态走 drawBeam（低矮横条，本来就贴身体，不构成矩形）。 */


const SP=[
{id:'pikachu',n:'皮卡丘',wr:1,hr:1,
  fix:{base:'#ffd23e',belly:'#fff4c2',dark:'#3a2c12',accent:'#3a2c12',egg:'#ffd23e'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(11,bh*0.62),top-1),pal.base,'#2a2620');
    cheeks(g,cx,cy,bw,bh,'#ff5a3c');},
  behind(g,o){const{cx,cy,bw,bh,pal}=o;const x=cx+bw*0.5;
    R(g,x,cy+bh*0.2,2,2,pal.base);R(g,x+2,cy+bh*0.12,2,2,pal.base);R(g,x+1,cy+bh*0.28,2,2,'#8a6a44');}
},
{id:'raichu',n:'雷丘',wr:1.05,hr:1.05,
  fix:{base:'#f6a93c',belly:'#fff4c2',dark:'#3a2c12',accent:'#3a2c12',egg:'#f6a93c'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(13,bh*0.72),top-1),pal.base,'#2a2620');
    cheeks(g,cx,cy,bw,bh,'#ff5a3c');
    R(g,cx-1,cy-bh*0.04,2,2,pal.dark);}
},
{id:'pichu',n:'皮丘',wr:0.9,hr:0.9,
  fix:{base:'#ffd23e',belly:'#fff4c2',dark:'#3a2c12',accent:'#3a2c12',egg:'#ffd23e'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    const eh=Math.min(Math.max(8,bh*0.5),top-1),ew=Math.max(2,bw*0.16);
    [-1,1].forEach(s=>{const ex=cx+s*bw*0.2;triUp(g,ex,top-eh,ew,eh,pal.base);triUp(g,ex,top-eh,Math.max(1,Math.round(ew*0.6)),Math.max(2,Math.round(eh*0.4)),'#2a2620');});
    cheeks(g,cx,cy,bw,bh,'#ff7a3c');}
},
{id:'eevee',n:'伊布',wr:1,hr:1,
  fix:{base:'#c89b6a',belly:'#f3e3c6',dark:'#4a3a26',accent:'#8a6a44',egg:'#c89b6a'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(10,bh*0.55),top-1),pal.base,'#f3e3c6');
    R(g,cx-bw*0.34,cy-bh*0.02,2,2,pal.dark);R(g,cx+bw*0.32,cy-bh*0.02,2,2,pal.dark);},
  behind(g,o){const{cx,cy,bw,bh,pal}=o;const x=cx+bw*0.5;
    ER(g,x+1,cy,Math.max(4,bw*0.32),Math.max(4,bh*0.34),pal.base);
    ER(g,x+1,cy,Math.max(2,bw*0.2),Math.max(2,bh*0.22),pal.belly);}
},
{id:'vaporeon',n:'水伊布',wr:1.05,hr:1,
  fix:{base:'#5fc6e8',belly:'#e7f7ff',dark:'#274b5a',accent:'#3a8fb0',egg:'#5fc6e8'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(9,bh*0.5),top-1),pal.base,'#e7f7ff');
    R(g,cx-bw*0.3,cy-bh*0.05,2,3,pal.belly);},
  behind(g,o){const{cx,cy,bw,bh,pal}=o;const x=cx+bw*0.5;
    ER(g,x+1,cy+bh*0.05,Math.max(3,bw*0.26),Math.max(3,bh*0.2),pal.accent);}
},
{id:'jolteon',n:'雷伊布',wr:0.95,hr:1,
  fix:{base:'#ffe14d',belly:'#fff7c8',dark:'#4a3a12',accent:'#ffd23e',egg:'#ffe14d'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    for(let i=-2;i<=2;i++){const sx=cx+i*bw*0.18;triUp(g,sx,top-2,2,4,pal.accent);}
    R(g,cx-bw*0.3,cy-bh*0.05,2,2,pal.dark);}
},
{id:'flareon',n:'火伊布',wr:1.05,hr:1,
  fix:{base:'#f0733a',belly:'#ffe2c4',dark:'#5a2a16',accent:'#ffb13c',egg:'#f0733a'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(10,bh*0.55),top-1),pal.base,'#ffe2c4');
    R(g,cx-bw*0.34,cy-bh*0.02,2,2,pal.dark);},
  behind(g,o){const{cx,cy,bw,bh,pal}=o;const x=cx+bw*0.5;
    ER(g,x+1,cy,Math.max(4,bw*0.34),Math.max(4,bh*0.36),pal.accent);}
},
{id:'espeon',n:'太阳伊布',wr:0.95,hr:1.05,
  fix:{base:'#d8a0d8',belly:'#f7e2f7',dark:'#4a2c4a',accent:'#b06ab0',egg:'#d8a0d8'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(12,bh*0.66),top-1),pal.base);
    star4(g,cx,Math.round(cy-bh*0.02),'#ff5a6a');}
},
{id:'umbreon',n:'月亮伊布',wr:1.05,hr:1,
  fix:{base:'#2c2c3a',belly:'#3a3a4a',dark:'#10101a',accent:'#ffd75e',egg:'#2c2c3a'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(10,bh*0.55),top-1),pal.base,'#ffe9a0');
    R(g,cx-bw*0.3,cy-bh*0.05,2,2,pal.accent);R(g,cx+bw*0.3,cy-bh*0.05,2,2,pal.accent);}
},
{id:'leafeon',n:'叶伊布',wr:1,hr:1,
  fix:{base:'#7cc85a',belly:'#eaf8d6',dark:'#3f6b2f',accent:'#4f9a3a',egg:'#7cc85a'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(10,bh*0.55),top-1),pal.base,'#eaf8d6');
    R(g,cx,top-2,2,3,pal.accent);},
  behind(g,o){const{cx,cy,bw,bh,pal}=o;const x=cx+bw*0.5;
    triUp(g,x+2,cy-bh*0.1,3,5,pal.accent);}
},
{id:'glaceon',n:'冰伊布',wr:0.98,hr:1,
  fix:{base:'#bfe8f4',belly:'#ffffff',dark:'#3a6a7a',accent:'#7cc6e0',egg:'#bfe8f4'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(10,bh*0.55),top-1),pal.base,'#7cc6e0');
    R(g,cx,top-1,2,2,pal.accent);}
},
{id:'sylveon',n:'妖精伊布',wr:0.95,hr:1,
  fix:{base:'#f7c8e8',belly:'#fff0f8',dark:'#8a4a6e',accent:'#ff9ad2',egg:'#f7c8e8'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(10,bh*0.55),top-1),pal.base,'#ff9ad2');
    R(g,cx-bw*0.34,cy-bh*0.04,2,2,pal.accent);R(g,cx+bw*0.32,cy-bh*0.04,2,2,pal.accent);},
  behind(g,o){const{cx,cy,bw,bh,pal}=o;const x=cx+bw*0.5;
    ER(g,x+1,cy,Math.max(3,bw*0.26),Math.max(4,bh*0.3),pal.accent);}
},
{id:'bulbasaur',n:'妙蛙种子',wr:1,hr:1,fo:-0.34,noMouth:true,
  fix:{base:'#7cc85a',belly:'#eaf8d6',dark:'#3f6b2f',accent:'#4f9a3a',egg:'#7cc85a'},
  custom(g,o){const{cx,cy,bw,bh,topY,gy,pal}=o;
    ER(g,Math.round(cx+bw*0.18),Math.round(cy-bh*0.42),Math.max(4,bw*0.24),Math.max(4,bh*0.24),pal.accent);
    R(g,Math.round(cx+bw*0.08),Math.round(cy-bh*0.6),2,3,'#6fae4a');
    ER(g,cx,cy+bh*0.05,bw*0.44,bh*0.46,pal.base);
    ER(g,cx,cy+bh*0.18,bw*0.3,bh*0.3,pal.belly);
    frogEyeBump(g,cx,Math.round(cy-bh*0.34),bw,'#fff');
    R(g,Math.round(cx-bw*0.28),Math.round(cy+bh*0.04),Math.max(5,Math.round(bw*0.56)),1,pal.dark);
    R(g,Math.round(cx-bw*0.4),Math.round(gy-3),3,3,pal.base);
    R(g,Math.round(cx+bw*0.32),Math.round(gy-3),3,3,pal.base);
  }
},
{id:'ivysaur',n:'妙蛙草',wr:1.02,hr:1.05,fo:-0.34,noMouth:true,
  fix:{base:'#6cbe52',belly:'#eaf8d6',dark:'#3f6b2f',accent:'#4f9a3a',egg:'#6cbe52'},
  custom(g,o){const{cx,cy,bw,bh,topY,gy,pal}=o;
    ER(g,Math.round(cx+bw*0.16),Math.round(cy-bh*0.44),Math.max(5,bw*0.28),Math.max(5,bh*0.28),pal.accent);
    R(g,Math.round(cx+bw*0.04),Math.round(cy-bh*0.64),2,4,'#5fae4a');
    R(g,Math.round(cx+bw*0.2),Math.round(cy-bh*0.62),2,3,'#5fae4a');
    ER(g,cx,cy+bh*0.05,bw*0.44,bh*0.46,pal.base);
    ER(g,cx,cy+bh*0.18,bw*0.3,bh*0.3,pal.belly);
    frogEyeBump(g,cx,Math.round(cy-bh*0.34),bw,'#fff');
    R(g,Math.round(cx-bw*0.28),Math.round(cy+bh*0.04),Math.max(5,Math.round(bw*0.56)),1,pal.dark);
    R(g,Math.round(cx-bw*0.4),Math.round(gy-3),3,3,pal.base);
    R(g,Math.round(cx+bw*0.32),Math.round(gy-3),3,3,pal.base);
  }
},
{id:'venusaur',n:'妙蛙花',wr:1.05,hr:1.1,fo:-0.34,noMouth:true,
  fix:{base:'#5fb848',belly:'#eaf8d6',dark:'#3f6b2f',accent:'#e0556a',egg:'#5fb848'},
  custom(g,o){const{cx,cy,bw,bh,topY,gy,pal}=o;
    for(let i=-2;i<=2;i++)ER(g,Math.round(cx+bw*0.16+i*bw*0.1),Math.round(cy-bh*0.5),Math.max(2,bw*0.12),Math.max(2,bh*0.12),pal.accent);
    ER(g,Math.round(cx+bw*0.16),Math.round(cy-bh*0.46),Math.max(3,bw*0.16),Math.max(3,bh*0.16),'#ffd0d8');
    ER(g,cx,cy+bh*0.05,bw*0.44,bh*0.46,pal.base);
    ER(g,cx,cy+bh*0.18,bw*0.3,bh*0.3,pal.belly);
    frogEyeBump(g,cx,Math.round(cy-bh*0.34),bw,'#fff');
    R(g,Math.round(cx-bw*0.28),Math.round(cy+bh*0.04),Math.max(5,Math.round(bw*0.56)),1,pal.dark);
    R(g,Math.round(cx-bw*0.4),Math.round(gy-3),3,3,pal.base);
    R(g,Math.round(cx+bw*0.32),Math.round(gy-3),3,3,pal.base);
  }
},
{id:'charmander',n:'小火龙',wr:1,hr:1,fo:-0.16,noMouth:true,
  fix:{base:'#f08a3c',belly:'#ffe2c0',dark:'#5a2a16',accent:'#ff5a3c',egg:'#f08a3c'},
  custom(g,o){const{cx,cy,bw,bh,topY,gy,pal}=o;
    R(g,Math.round(cx+bw*0.32),Math.round(gy-5),3,4,pal.base);
    R(g,Math.round(cx+bw*0.42),Math.round(gy-3),3,3,'#ff7a2f');
    R(g,Math.round(cx+bw*0.42),Math.round(gy-4),2,2,'#ffd23e');
    ER(g,cx,cy+bh*0.04,bw*0.3,bh*0.4,pal.base);
    ER(g,cx,cy+bh*0.18,bw*0.24,bh*0.26,pal.belly);
    ER(g,cx,cy-bh*0.3,bw*0.3,bh*0.22,pal.base);
    R(g,Math.round(cx-bw*0.3),Math.round(cy-bh*0.02),2,2,pal.dark);
    R(g,Math.round(cx-bw*0.08),Math.round(cy-bh*0.14),Math.max(2,Math.round(bw*0.18)),1,pal.dark);
    R(g,Math.round(cx-bw*0.3),Math.round(cy+bh*0.04),2,Math.max(3,Math.round(bh*0.15)),pal.base);
    R(g,Math.round(cx+bw*0.3),Math.round(cy+bh*0.04),2,Math.max(3,Math.round(bh*0.15)),pal.base);
  }
},
{id:'charmeleon',n:'火恐龙',wr:1.04,hr:1.06,fo:-0.18,noMouth:true,
  fix:{base:'#e07a2c',belly:'#ffe2c0',dark:'#5a2a16',accent:'#ff5a3c',egg:'#e07a2c'},
  custom(g,o){const{cx,cy,bw,bh,topY,gy,pal}=o;
    R(g,Math.round(cx+bw*0.34),Math.round(gy-6),3,5,pal.base);
    R(g,Math.round(cx+bw*0.44),Math.round(gy-3),3,3,'#ff7a2f');
    R(g,Math.round(cx+bw*0.44),Math.round(gy-4),2,2,'#ffd23e');
    ER(g,cx,cy+bh*0.05,bw*0.3,bh*0.42,pal.base);
    ER(g,cx,cy+bh*0.18,bw*0.24,bh*0.28,pal.belly);
    ER(g,cx,cy-bh*0.32,bw*0.3,bh*0.22,pal.base);
    R(g,Math.round(cx+bw*0.18),Math.round(cy-bh*0.42),1,2,'#fff2cf');
    R(g,Math.round(cx-bw*0.1),Math.round(cy-bh*0.16),Math.max(2,Math.round(bw*0.2)),1,pal.dark);
    R(g,Math.round(cx-bw*0.32),Math.round(cy+bh*0.04),2,Math.max(3,Math.round(bh*0.16)),pal.base);
    R(g,Math.round(cx+bw*0.32),Math.round(cy+bh*0.04),2,Math.max(3,Math.round(bh*0.16)),pal.base);
  }
},
{id:'charizard',n:'喷火龙',wr:1.06,hr:1.1,fo:-0.2,noMouth:true,
  fix:{base:'#e8762c',belly:'#ffe2c0',dark:'#5a2a16',accent:'#ff5a3c',egg:'#e8762c'},
  custom(g,o){const{cx,cy,bw,bh,topY,gy,pal}=o;
    const wr_=Math.min(Math.round(bw*0.6),13);
    memWing(g,cx,Math.round(cy-bh*0.16),-1,wr_,'#5a8fd8','#274b8a');
    memWing(g,cx,Math.round(cy-bh*0.16), 1,wr_,'#5a8fd8','#274b8a');
    R(g,Math.round(cx+bw*0.3),Math.round(gy-7),3,5,pal.base);
    R(g,Math.round(cx+bw*0.4),Math.round(gy-4),4,4,pal.base);
    R(g,Math.round(cx+bw*0.5),Math.round(gy-2),3,3,'#ff7a2f');
    R(g,Math.round(cx+bw*0.5),Math.round(gy-3),2,2,'#ffd23e');
    ER(g,cx,cy+bh*0.05,bw*0.32,bh*0.4,pal.base);
    ER(g,cx,cy+bh*0.18,bw*0.26,bh*0.28,pal.belly);
    ER(g,cx,cy-bh*0.3,bw*0.3,bh*0.22,pal.base);
    triUp(g,Math.round(cx-bw*0.16),Math.round(cy-bh*0.5),3,Math.round(bh*0.2),'#fff2cf');
    triUp(g,Math.round(cx+bw*0.16),Math.round(cy-bh*0.5),3,Math.round(bh*0.2),'#fff2cf');
    R(g,Math.round(cx-bw*0.1),Math.round(cy-bh*0.14),Math.max(2,Math.round(bw*0.2)),1,pal.dark);
    R(g,Math.round(cx-bw*0.32),Math.round(cy+bh*0.04),2,Math.max(3,Math.round(bh*0.16)),pal.base);
    R(g,Math.round(cx+bw*0.32),Math.round(cy+bh*0.04),2,Math.max(3,Math.round(bh*0.16)),pal.base);
  }
},
{id:'squirtle',n:'杰尼龟',wr:1,hr:1,fo:-0.22,noMouth:true,
  fix:{base:'#5aa0d8',belly:'#e8f4ff',dark:'#274b5a',accent:'#caa06a',egg:'#5aa0d8'},
  custom(g,o){const{cx,cy,bw,bh,topY,gy,pal}=o;
    turtleShell(g,cx,cy+bh*0.06,bw,bh,pal.accent,pal.base,pal.dark);
    ER(g,cx,cy-bh*0.32,bw*0.24,bh*0.2,pal.base);
    R(g,Math.round(cx-bw*0.12),Math.round(cy-bh*0.2),Math.max(3,Math.round(bw*0.26)),1,pal.dark);
    R(g,Math.round(cx-bw*0.38),Math.round(gy-3),3,3,pal.base);
    R(g,Math.round(cx+bw*0.32),Math.round(gy-3),3,3,pal.base);
    R(g,Math.round(cx+bw*0.36),Math.round(gy-5),2,2,pal.base);
  }
},
{id:'wartortle',n:'卡咪龟',wr:1.04,hr:1.04,fo:-0.24,noMouth:true,
  fix:{base:'#4f95cf',belly:'#e8f4ff',dark:'#274b5a',accent:'#caa06a',egg:'#4f95cf'},
  custom(g,o){const{cx,cy,bw,bh,topY,gy,pal}=o;
    turtleShell(g,cx,cy+bh*0.06,bw,bh,pal.accent,pal.base,pal.dark);
    ER(g,cx,cy-bh*0.32,bw*0.24,bh*0.2,pal.base);
    R(g,Math.round(cx-bw*0.26),Math.round(cy-bh*0.44),2,4,pal.base);
    R(g,Math.round(cx+bw*0.24),Math.round(cy-bh*0.44),2,4,pal.base);
    R(g,Math.round(cx-bw*0.1),Math.round(cy-bh*0.2),Math.max(3,Math.round(bw*0.26)),1,pal.dark);
    R(g,Math.round(cx-bw*0.4),Math.round(gy-3),4,3,pal.base);
    R(g,Math.round(cx+bw*0.34),Math.round(gy-3),4,3,pal.base);
    R(g,Math.round(cx+bw*0.4),Math.round(gy-5),3,3,pal.base);
  }
},
{id:'blastoise',n:'水箭龟',wr:1.08,hr:1.08,fo:-0.26,noMouth:true,
  fix:{base:'#4790cc',belly:'#e8f4ff',dark:'#274b5a',accent:'#3a7aa8',egg:'#4790cc'},
  custom(g,o){const{cx,cy,bw,bh,topY,gy,pal}=o;
    turtleShell(g,cx,cy+bh*0.06,bw,bh,pal.accent,pal.base,pal.dark);
    ER(g,cx,cy-bh*0.34,bw*0.26,bh*0.22,pal.base);
    R(g,Math.round(cx-bw*0.14),Math.round(cy-bh*0.22),Math.max(3,Math.round(bw*0.3)),1,pal.dark);
    R(g,Math.round(cx-bw*0.42),Math.round(cy-bh*0.18),4,5,'#9aa6b4');
    R(g,Math.round(cx-bw*0.42),Math.round(cy-bh*0.18),4,1,'#cfd8e0');
    R(g,Math.round(cx+bw*0.4),Math.round(cy-bh*0.18),4,5,'#9aa6b4');
    R(g,Math.round(cx+bw*0.4),Math.round(cy-bh*0.18),4,1,'#cfd8e0');
    R(g,Math.round(cx-bw*0.4),Math.round(gy-3),4,3,pal.base);
    R(g,Math.round(cx+bw*0.34),Math.round(gy-3),4,3,pal.base);
    R(g,Math.round(cx+bw*0.4),Math.round(gy-5),3,3,pal.base);
  }
},
{id:'jigglypuff',n:'胖丁',wr:1.1,hr:0.95,fo:-0.05,
  fix:{base:'#ffd0e0',belly:'#ffeaf2',dark:'#7a4a5a',accent:'#ff9ad2',egg:'#ffd0e0'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    R(g,cx-1,top-3,1,3,pal.dark);R(g,cx,top-5,2,2,pal.accent);
    R(g,cx-bw*0.34,cy-bh*0.1,2,2,pal.dark);R(g,cx+bw*0.32,cy-bh*0.1,2,2,pal.dark);}
},
{id:'wigglytuff',n:'胖可丁',wr:1.15,hr:1,fo:-0.05,
  fix:{base:'#ffd0e0',belly:'#ffeaf2',dark:'#7a4a5a',accent:'#ff9ad2',egg:'#ffd0e0'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    R(g,cx-1,top-3,1,3,pal.dark);R(g,cx,top-5,2,2,pal.accent);
    R(g,cx-bw*0.34,cy-bh*0.1,2,2,pal.dark);R(g,cx+bw*0.32,cy-bh*0.1,2,2,pal.dark);}
},
{id:'meowth',n:'喵喵',wr:1,hr:1,
  fix:{base:'#f4e4c0',belly:'#fff7e6',dark:'#4a3a26',accent:'#ffd23e',egg:'#f4e4c0'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(9,bh*0.5),top-1),pal.base,'#f4c0c0');
    R(g,cx,cy-bh*0.18,2,2,pal.accent);},
  behind(g,o){const{cx,cy,bw,bh,pal}=o;const x=cx+bw*0.5;
    ER(g,x+1,cy,Math.max(3,bw*0.24),Math.max(4,bh*0.34),pal.base);}
},
{id:'psyduck',n:'可达鸭',wr:1,hr:1,fo:-0.08,noMouth:true,
  fix:{base:'#ffd23e',belly:'#fff4c2',dark:'#3a2c12',accent:'#ffb13c',egg:'#ffd23e'},
  custom(g,o){const{cx,cy,bw,bh,topY,gy,pal}=o;
    ER(g,cx,cy+bh*0.06,bw*0.4,bh*0.42,pal.base);
    ER(g,cx,cy+bh*0.18,bw*0.28,bh*0.3,pal.belly);
    ER(g,cx,cy-bh*0.26,bw*0.34,bh*0.22,pal.base);
    R(g,cx,Math.round(cy-bh*0.5),1,2,pal.dark);
    duckBill(g,cx,Math.round(cy-bh*0.2),bw,'#f0a830','#a06a20');
    R(g,Math.round(cx-bw*0.36),Math.round(cy+bh*0.02),2,Math.max(3,Math.round(bh*0.18)),pal.base);
    R(g,Math.round(cx+bw*0.34),Math.round(cy+bh*0.02),2,Math.max(3,Math.round(bh*0.18)),pal.base);
    R(g,Math.round(cx-bw*0.2),Math.round(gy-2),3,2,'#ff9a3c');
    R(g,Math.round(cx+bw*0.12),Math.round(gy-2),3,2,'#ff9a3c');
  }
},
{id:'golduck',n:'哥达鸭',wr:1.02,hr:1.05,fo:-0.08,noMouth:true,
  fix:{base:'#5aa0d8',belly:'#e8f4ff',dark:'#274b5a',accent:'#ff5a3c',egg:'#5aa0d8'},
  custom(g,o){const{cx,cy,bw,bh,topY,gy,pal}=o;
    ER(g,cx,cy+bh*0.06,bw*0.4,bh*0.42,pal.base);
    ER(g,cx,cy+bh*0.18,bw*0.28,bh*0.3,pal.belly);
    ER(g,cx,cy-bh*0.26,bw*0.34,bh*0.22,pal.base);
    R(g,cx,Math.round(cy-bh*0.4),2,2,'#ff3a3a');
    duckBill(g,cx,Math.round(cy-bh*0.2),bw,'#f0a830','#a06a20');
    R(g,Math.round(cx-bw*0.36),Math.round(cy+bh*0.02),2,Math.max(3,Math.round(bh*0.18)),pal.base);
    R(g,Math.round(cx+bw*0.34),Math.round(cy+bh*0.02),2,Math.max(3,Math.round(bh*0.18)),pal.base);
    R(g,Math.round(cx-bw*0.2),Math.round(gy-2),3,2,'#ff9a3c');
    R(g,Math.round(cx+bw*0.12),Math.round(gy-2),3,2,'#ff9a3c');
    triUp(g,Math.round(cx+bw*0.42),Math.round(gy-4),4,Math.max(4,Math.round(bh*0.3)),pal.base);
  }
},
{id:'vulpix',n:'六尾',wr:1,hr:1,
  fix:{base:'#ff9a4a',belly:'#ffe6c8',dark:'#5a2a16',accent:'#ffb13c',egg:'#ff9a4a'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(9,bh*0.5),top-1),pal.base,'#ffe6c8');
    R(g,cx-bw*0.32,cy-bh*0.02,2,2,pal.dark);},
  behind(g,o){const{cx,cy,bw,bh,pal}=o;const x=cx+bw*0.5;
    for(let i=0;i<3;i++){ER(g,x+1+i*2,cy-bh*0.1+i*2,Math.max(2,bw*0.16),Math.max(3,bh*0.24),pal.base);}
    R(g,x+1,cy-bh*0.3,2,3,pal.accent);}
},
{id:'ninetales',n:'九尾',wr:1.05,hr:1.1,
  fix:{base:'#ffb15a',belly:'#fff0d8',dark:'#5a2a16',accent:'#ffd23e',egg:'#ffb15a'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(10,bh*0.56),top-1),pal.base,'#fff0d8');
    R(g,cx-bw*0.3,cy-bh*0.02,2,2,pal.dark);},
  behind(g,o){const{cx,cy,bw,bh,pal}=o;const x=cx+bw*0.5;
    for(let i=0;i<4;i++){ER(g,x+1+i*2,cy-bh*0.12+i*2,Math.max(2,bw*0.18),Math.max(4,bh*0.32),pal.base);}
    R(g,x+2,cy-bh*0.4,2,4,pal.accent);}
},
{id:'snorlax',n:'卡比兽',wr:1.15,hr:0.92,fo:0.05,
  fix:{base:'#9ab0c0',belly:'#eef4f8',dark:'#3a4a5a',accent:'#7a93a6',egg:'#9ab0c0'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    ER(g,cx-bw*0.3,top+1,Math.max(3,bw*0.14),Math.max(3,bw*0.14),pal.base);
    ER(g,cx+bw*0.3,top+1,Math.max(3,bw*0.14),Math.max(3,bw*0.14),pal.base);
    R(g,cx-bw*0.2,cy-bh*0.02,2,2,pal.dark);R(g,cx+bw*0.16,cy-bh*0.02,2,2,pal.dark);}
},
{id:'gengar',n:'耿鬼',wr:1,hr:1.05,fo:0.02,
  fix:{base:'#6a4a8a',belly:'#9a7ab8',dark:'#2a1a3a',accent:'#ff5a8a',egg:'#6a4a8a'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    triUp(g,cx-bw*0.3,top-2,3,5,pal.base);triUp(g,cx+bw*0.3,top-2,3,5,pal.base);
    R(g,cx-bw*0.34,cy-bh*0.05,2,3,pal.dark);R(g,cx+bw*0.3,cy-bh*0.05,2,3,'#ffffff');},
  behind(g,o){const{cx,cy,bw,bh,pal}=o;const x=cx+bw*0.5;
    triUp(g,x+1,cy-bh*0.2,3,5,pal.dark);}
},
{id:'clefairy',n:'皮皮',wr:1,hr:0.98,fo:-0.05,
  fix:{base:'#ffc8e0',belly:'#ffeaf2',dark:'#7a4a5a',accent:'#ff9ad2',egg:'#ffc8e0'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(9,bh*0.5),top-1),pal.base);
    R(g,cx,top-2,1,2,pal.accent);}
},
{id:'oddish',n:'走路草',wr:0.95,hr:1.05,fo:0.02,noMouth:true,
  fix:{base:'#6a9fd8',belly:'#8fb8e8',dark:'#274b5a',accent:'#5a9f4a',egg:'#6a9fd8'},
  custom(g,o){const{cx,cy,bw,bh,pal}=o;
    ER(g,cx,cy+bh*0.2,bw*0.42,bh*0.38,pal.base);
    ER(g,cx,cy+bh*0.2,bw*0.28,bh*0.24,pal.belly);
    for(let i=-2;i<=2;i++)triUp(g,cx+i*bw*0.18,cy-bh*0.12,2,Math.max(4,bh*0.4),pal.accent);
    R(g,cx-bw*0.3,cy+bh*0.12,2,2,'#ffffff');R(g,cx+bw*0.28,cy+bh*0.12,2,2,'#ffffff');}
},
{id:'gloom',n:'臭臭花',wr:1,hr:1.05,fo:0.02,noMouth:true,
  fix:{base:'#7a8f4a',belly:'#5a6b2f',dark:'#3a4a2f',accent:'#9a4a8a',egg:'#7a8f4a'},
  custom(g,o){const{cx,cy,bw,bh,pal}=o;
    ER(g,cx,cy+bh*0.18,bw*0.4,bh*0.4,pal.base);
    for(let i=-2;i<=2;i++)ER(g,cx+i*bw*0.22,cy-bh*0.06,Math.max(2,bw*0.14),Math.max(2,bh*0.16),pal.accent);
    R(g,cx-bw*0.3,cy+bh*0.12,2,2,'#ffffff');R(g,cx+bw*0.28,cy+bh*0.12,2,2,'#ffffff');}
},
{id:'vileplume',n:'霸王花',wr:1.1,hr:1.05,fo:0.02,noMouth:true,
  fix:{base:'#5a8f4a',belly:'#3a6b2f',dark:'#274b2f',accent:'#e0556a',egg:'#5a8f4a'},
  custom(g,o){const{cx,cy,bw,bh,pal}=o;
    ER(g,cx,cy+bh*0.2,bw*0.36,bh*0.36,pal.base);
    ER(g,cx,cy-bh*0.06,Math.max(6,bw*0.5),Math.max(5,bh*0.4),pal.accent);
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ER(g,Math.round(cx+Math.cos(a)*bw*0.32),Math.round(cy-bh*0.06+Math.sin(a)*bh*0.26),2,2,pal.belly);}
    R(g,cx-bw*0.3,cy+bh*0.14,2,2,'#ffffff');R(g,cx+bw*0.28,cy+bh*0.14,2,2,'#ffffff');}
},
{id:'poliwhirl',n:'蚊香君',wr:1.05,hr:0.98,fo:0,noMouth:true,
  fix:{base:'#5aa0d8',belly:'#e8f4ff',dark:'#274b5a',accent:'#274b5a',egg:'#5aa0d8'},
  custom(g,o){const{cx,cy,bw,bh,pal}=o;
    ER(g,cx,cy,bw*0.46,bh*0.46,pal.base);
    ER(g,cx,cy+bh*0.08,Math.max(4,bw*0.3),Math.max(4,bh*0.28),pal.belly);
    R(g,cx-2,cy+bh*0.06,4,1,pal.dark);R(g,cx-1,cy+bh*0.12,2,1,pal.dark);R(g,cx,cy+bh*0.18,1,1,pal.dark);}
},
{id:'magikarp',n:'鲤鱼王',wr:1.1,hr:0.85,fo:0.05,noMouth:true,
  fix:{base:'#ff7a3c',belly:'#ffd0a0',dark:'#5a2a16',accent:'#ffd23e',egg:'#ff7a3c'},
  custom(g,o){const{cx,cy,bw,bh,pal}=o;
    ER(g,cx,cy,bw*0.5,bh*0.5,pal.base);
    ER(g,cx,cy+bh*0.1,bw*0.32,bh*0.3,pal.belly);
    R(g,cx-bw*0.1,cy-bh*0.1,2,2,pal.accent);
    triUp(g,cx-bw*0.5,cy,4,Math.max(4,bh*0.4),pal.base);
    R(g,cx-bw*0.5-1,cy-2,3,Math.max(4,bh*0.4),pal.dark);}
},
{id:'gyarados',n:'暴鲤龙',wr:1.2,hr:0.95,fo:0.05,noMouth:true,
  fix:{base:'#3a6ad8',belly:'#cfe0ff',dark:'#1a2a6a',accent:'#ff5a3c',egg:'#3a6ad8'},
  custom(g,o){const{cx,cy,bw,bh,pal}=o;
    ER(g,cx,cy,bw*0.5,bh*0.48,pal.base);
    ER(g,cx,cy+bh*0.12,bw*0.3,bh*0.3,pal.belly);
    R(g,cx-bw*0.4,cy-bh*0.2,3,1,pal.dark);R(g,cx+bw*0.36,cy-bh*0.2,3,1,pal.dark);
    R(g,cx-bw*0.1,cy-bh*0.36,2,4,pal.belly);}
},
{id:'lapras',n:'拉普拉斯',wr:1.1,hr:1,fo:0.02,noMouth:true,
  fix:{base:'#6ab0d8',belly:'#e8f4ff',dark:'#274b6a',accent:'#3a7aa8',egg:'#6ab0d8'},
  custom(g,o){const{cx,cy,bw,bh,pal}=o;
    ER(g,cx,cy+bh*0.05,bw*0.46,bh*0.44,pal.base);
    ER(g,cx,cy+bh*0.05,bw*0.3,bh*0.3,pal.accent);
    R(g,cx-bw*0.1,cy-bh*0.1,2,2,pal.dark);
    triUp(g,cx,cy-bh*0.4,2,5,pal.belly);}
},
{id:'mew',n:'梦幻',wr:1,hr:1,fo:0,
  fix:{base:'#ff9ec0',belly:'#ffd6e6',dark:'#7a3a5a',accent:'#ff9ad2',egg:'#ff9ec0'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(8,bh*0.42),top-1),pal.base,'#ffd6e6');
    R(g,cx-bw*0.32,cy-bh*0.02,2,2,pal.dark);},
  behind(g,o){const{cx,cy,bw,bh,pal}=o;const x=cx+bw*0.5;
    ER(g,x+1,cy,Math.max(3,bw*0.26),Math.max(5,bh*0.4),pal.base);}
},
{id:'mwtwo',n:'超梦',wr:1,hr:1.05,fo:0,
  fix:{base:'#d8a8c8',belly:'#f4dce8',dark:'#5a3a5a',accent:'#b06ab0',egg:'#d8a8c8'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    R(g,cx-bw*0.34,top,3,2,pal.base);R(g,cx+bw*0.32,top,3,2,pal.base);
    R(g,cx-1,top-3,2,3,pal.dark);
    R(g,cx-bw*0.3,cy-bh*0.02,2,2,pal.dark);}
},
{id:'togepi',n:'波克比',wr:0.98,hr:1,fo:0,noMouth:true,
  fix:{base:'#fff0d8',belly:'#ffe27a',dark:'#7a5a2a',accent:'#ff9ad2',egg:'#fff0d8'},
  custom(g,o){const{cx,cy,bw,bh,pal}=o;
    ER(g,cx,cy+bh*0.05,bw*0.46,bh*0.46,pal.base);
    R(g,cx-bw*0.2,cy,2,2,pal.belly);R(g,cx+bw*0.16,cy,2,2,pal.belly);R(g,cx,cy+bh*0.2,2,2,pal.belly);
    triUp(g,cx,cy-bh*0.42,3,5,pal.accent);}
},
{id:'marill',n:'玛力露',wr:1.02,hr:1,fo:0,
  fix:{base:'#5aa0e8',belly:'#ffffff',dark:'#274b6a',accent:'#ff9ad2',egg:'#5aa0e8'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(8,bh*0.44),top-1),pal.base);
    R(g,cx-bw*0.32,cy-bh*0.02,2,2,pal.dark);},
  behind(g,o){const{cx,cy,bw,bh,pal}=o;const x=cx+bw*0.5;
    ER(g,x+1,cy+bh*0.1,Math.max(3,bw*0.2),Math.max(4,bh*0.3),pal.base);
    ER(g,x+Math.max(2,bw*0.2),cy-bh*0.2,Math.max(3,bw*0.16),Math.max(3,bh*0.16),pal.accent);}
},
{id:'ditto',n:'百变怪',wr:1.1,hr:0.9,fo:0.05,noMouth:true,
  fix:{base:'#e88ab0',belly:'#f4c0d6',dark:'#7a3a5a',accent:'#ff9ad2',egg:'#e88ab0'},
  custom(g,o){const{cx,cy,bw,bh,pal}=o;
    ER(g,cx,cy+bh*0.1,bw*0.46,bh*0.42,pal.base);
    R(g,cx-bw*0.2,cy-bh*0.26,Math.max(3,bw*0.2),2,pal.base);
    R(g,cx-bw*0.28,cy,2,2,'#ffffff');R(g,cx+bw*0.26,cy,2,2,'#ffffff');}
},
{id:'koffing',n:'瓦斯弹',wr:1.1,hr:0.95,fo:0.05,noMouth:true,
  fix:{base:'#9a6ac8',belly:'#c4a0e0',dark:'#4a2a6a',accent:'#6a4a8a',egg:'#9a6ac8'},
  custom(g,o){const{cx,cy,bw,bh,pal}=o;
    ER(g,cx,cy,bw*0.46,bh*0.44,pal.base);
    ER(g,cx-bw*0.4,cy-bh*0.3,Math.max(2,bw*0.12),Math.max(2,bh*0.12),pal.belly);
    ER(g,cx+bw*0.38,cy-bh*0.28,Math.max(2,bw*0.12),Math.max(2,bh*0.12),pal.belly);
    R(g,cx-bw*0.26,cy+bh*0.02,2,2,pal.dark);R(g,cx+bw*0.24,cy+bh*0.02,2,2,pal.dark);}
},
{id:'slowpoke',n:'呆呆兽',wr:1.05,hr:1,fo:0,
  fix:{base:'#ff9aa0',belly:'#ffe0e2',dark:'#7a3a4a',accent:'#ffb13c',egg:'#ff9aa0'},
  front(g,o){const{cx,cy,bw,bh,pal}=o;const top=cy-bh/2;
    earPair(g,cx,top,bw,Math.min(Math.max(8,bh*0.42),top-1),pal.base);
    R(g,cx,cy-bh*0.1,2,2,pal.accent);},
  behind(g,o){const{cx,cy,bw,bh,pal}=o;const x=cx+bw*0.5;
    ER(g,x+1,cy,Math.max(3,bw*0.24),Math.max(5,bh*0.4),pal.base);}
}
];

/* ================= 调色板（转生配色） ================= */
/* v6.8：转生统一为「彩虹流光」一套配色，不再按星级换色。
   分级取消的理由：课堂上要同时讲"进化阶段"和"转生星级"两套数字，学生记不住；
   三档色相环在投影仪上几乎看不出差别，唯一被感知的只有"转生了 / 没转生"。
   手绘态宠物会用到它；AI 精灵态自带原色不走这里，两套保持同一视觉语言即可。 */
function palOf(pet,pr,frame){
  let p;
  if(pr>0){
    const hu=(pet.hue+frame*22)%360;
    p={base:hsl(hu,80,62),belly:hsl(hu,70,86),accent:hsl(hu+180,80,60),dark:'#3a3340',egg:hsl(hu,80,62)};
  }else{
    p={base:hsl(pet.hue,62,64),belly:hsl(pet.hue,55,88),accent:hsl(pet.hue+150,70,62),dark:hsl(pet.hue,35,28),egg:hsl(pet.hue,62,64)};
  }
  const fix=SP[pet.species].fix;
  if(fix&&pr===0)Object.assign(p,fix);
  return p;
}

/* ================= 宠物部件 ================= */
function drawEgg(g,pet,cx,gy,hh,pal,prestige){
  const w=hh*0.76,cy=gy-hh/2;
  ER(g,cx,cy,w/2,hh/2,pal.egg||pal.base);
  pet.spots.forEach(s=>{R(g,cx+s[0]*w*0.5,cy+s[1]*hh*0.5,2,2,pal.accent);});
  const zw=Math.round(w*0.66);
  for(let i=0;i<zw;i++){
    const x=Math.round(cx-zw/2)+i;
    const y=cy+Math.round(hh*0.05)+((i%2)?1:0);
    R(g,x,y,1,1,pal.dark);
  }
  R(g,cx-w*0.22,cy-hh*0.28,2,2,'rgba(255,255,255,.85)');
  if(prestige>0){
    R(g,cx-zw/2,cy+hh*0.34,zw,2,'#ffd75e');
    star4(g,cx,cy-hh*0.08,'#ffd75e');
  }
}
function drawScarf(g,cx,y,bw,sub){
  if(sub){R(g,cx-bw*0.26,y,Math.max(4,bw*0.52),1,'#e8705f');return;}  // 精灵态：细领带，1px，不喧宾夺主
  R(g,cx-bw*0.42,y,Math.max(4,bw*0.84),2,'#ff5e5e');
  R(g,cx+bw*0.20,y+2,2,3,'#e14b4b');
}
function drawBadge(g,cx,y,sub){ // 7 级星章：围巾上的金星徽章
  if(sub){star4(g,cx,y,'#ffd75e');return;}                                // 精灵态：单颗小星
  [[-1,0],[1,0],[0,-1],[0,1]].forEach(o=>star4(g,cx+o[0],y+o[1],'#8a5a12'));
  star4(g,cx,y,'#ffd75e');
  R(g,cx,y,1,1,'#fff3c2');
}
function drawCrown(g,cx,y,big,sub){
  const w=sub?(big?7:5):(big?9:7),hh=sub?3:(big?4:3);
  const x=Math.round(cx-w/2);
  R(g,x,y+hh-2,w,2,'#ffd75e');
  for(let i=0;i<3;i++){
    const px=x+Math.round(i*(w-3)/2);
    triUp(g,px+1,y,3,hh-1,'#ffd75e');
  }
  R(g,cx-1,y+hh-3,2,1,'#ff5e5e');
}
function drawAura(g,cx,cy,bw,frame){
  const r=bw*0.7+5;
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2+(frame?0.26:-0.26);
    const x=Math.round(cx+Math.cos(a)*r),y=Math.round(cy+Math.sin(a)*r*0.85);
    R(g,x,y,2,2,i%2?'#ffd75e':'#ffe9a8');
  }
}
function drawSparkles(g,cx,topY,progress,frame,t){
  if(t<9)return;
  let n=1;
  if(t>=10)n=2;
  if(progress>10)n=Math.min(8,2+progress-10);
  for(let i=0;i<n&&i<SPARKPOS.length;i++){
    const p=SPARKPOS[i],x=cx+p[0],y=topY-4+p[1];
    if(frame)star4(g,x,y,'#ffd75e');else R(g,x,y,1,1,'#ffd75e');
  }
}
/* v6.8：转生星级视觉统一 —— 只画【固定 3 颗彩虹星】，
   不再按 prestige 画 1/2/3/4/5 颗。理由同PRISM：三档差异学生读不出来，多颗星反而挤成一坨。 */
function drawStars(g,cx,topY,prestige,frame){
  if(prestige<=0)return;
  const n=3;
  for(let i=0;i<n;i++){
    const x=Math.round(cx-(n-1)*3.5+i*7),y=topY-9;
    const hu=(i*72+frame*40)%360,c=hsl(hu,90,62),c2=hsl(hu,90,80);
    R(g,x-1,y,3,1,c);R(g,x,y-1,1,3,c);
    R(g,x-1,y-1,1,1,c2);R(g,x+1,y+1,1,1,c2);
  }
}
/* ===== 转生特效层（v6.8：全部统一为「彩虹流光」一套，不分档） ===== */
function drawBeam(g,o,pr,frame){ // 背景光柱：三色
  const{cx,topY,bw,bh}=o;
  const hu=frame*30;
  R(g,cx-bw*0.52,topY-2,bw*0.34,bh+7,hsla(hu,90,65,.32));
  R(g,cx+bw*0.18,topY-2,bw*0.34,bh+7,hsla(hu+120,90,65,.32));
  R(g,cx-bw*0.09,topY-2,bw*0.18,bh+7,hsla(hu+240,90,65,.26));
}
function drawPrestigeRim(g,o,pr,frame){ // 轮廓光 / 彩虹渐变纹
  const{cx,cy,bw,bh}=o;
  for(let y=Math.round(cy-bh/2)+1;y<cy+bh/2;y++){
    const hw=halfW(bw,bh,y-cy);
    if(hw<1.5)continue;
    const hu=(y*14+frame*30)%360;
    R(g,cx-hw,y,Math.max(1,hw*0.26),1,hsla(hu,90,62,.8));
    R(g,cx+hw*0.74,y,Math.max(1,hw*0.26),1,hsla(hu,90,62,.8));
    if((y+cy)%2===0)R(g,cx-hw*0.72,y,hw*1.44,1,hsla((hu+180)%360,90,65,.28));
  }
}
function drawPrestigeFlame(g,o,pr,frame){ // 头顶彩虹圣火
  const{cx,topY,bw,t}=o;
  const x=t>=8?cx+bw*0.30:cx; // 有皇冠时移到侧上方
  const y=topY-3-(frame?1:0);
  const hu=frame*40;
  triUp(g,x,y-3,3,4,hsl(hu,90,62));
  triUp(g,x-3,y-1,2,3,hsl(hu+120,90,62));
  triUp(g,x+3,y-1,2,3,hsl(hu+240,90,62));
  R(g,x-1,y-2,2,2,'#ffffff');
}
function drawPrestigeOrbit(g,o,pr,frame){ // 环绕星环：恒12点全彩
  const{cx,cy,bw,bh}=o;
  const rx=bw*0.72+4,ry=bh*0.58+3;
  const n=12;
  for(let i=0;i<n;i++){
    const a=i/n*Math.PI*2+(frame?0.35:-0.35);
    const x=Math.round(cx+Math.cos(a)*rx),y=Math.round(cy+Math.sin(a)*ry);
    R(g,x,y,2,2,hsl((i*30+frame*40)%360,90,62));
  }
}
function drawPrestigeSparks(g,o,pr,frame){ // 飞升火花：恒7点
  const{cx,cy,bw,bh}=o;
  const n=7;
  for(let i=0;i<n;i++){
    const ph=(frame+i)%2;
    const x=cx+Math.round(Math.cos(i*2.4+frame*0.8)*bw*0.6);
    const y=cy+bh*0.30-ph*(6+i*2);
    const c=hsl((i*51+frame*40)%360,90,65);
    if(ph)star4(g,x,y,c);else R(g,x,y,1,1,c);
  }
}
function drawEggRays(g,cx,cyE,hh,pr,frame){ // 转生蛋·彩虹光壳 + 六道光芒
  if(pr<1)return;
  const P=PRISM;
  /* 与精灵态同语言：光贴着蛋的椭圆轮廓，而不是一圈彩色噪点。
     椭圆解析式算环形距离 → Bayer抖动上色 → 边界是蛋形，永远不是矩形。 */
  const rw=hh*0.38,rh=hh*0.5,TH=4;
  const rot=frame*5;
  for(let y=Math.max(0,Math.floor(cyE-rh-TH-1));y<=Math.min(H-1,Math.ceil(cyE+rh+TH+1));y++){
    for(let x=Math.max(0,Math.floor(cx-rw-TH-1));x<=Math.min(W-1,Math.ceil(cx+rw+TH+1));x++){
      const nx=(x-cx)/rw,ny=(y-cyE)/rh;
      const d=Math.sqrt(nx*nx+ny*ny);
      if(d<1)continue;                              /* 蛋本体不碰 */
      /* 把归一化半径差换算成近似像素厚度 */
      const thick=(d-1)*Math.min(rw,rh);
      if(thick>TH)continue;
      const t=thick/TH;
      const lum=Math.pow(1-t,1.7)*0.9+0.06;
      const thr=(BAYER4[(y&3)*4+(x&3)]+0.5)/16;
      if(lum<thr)continue;
      const ang=Math.atan2(ny,nx)*180/Math.PI;
      const h=(P.hue+ang*1.8+thick*22+rot+360)%360;
      const lit=P.lit+22*lum,a=Math.min(0.95,lum*P.halo+0.12);
      R(g,x,y,1,1,'hsla('+h.toFixed(0)+','+P.sat+'%,'+lit.toFixed(0)+'%,'+a.toFixed(3)+')');
    }
  }
  /* 外圈 6 道短光芒：明确的射线，不再是散点 */
  const r=hh*0.62,n=6;
  for(let i=0;i<n;i++){
    const a=i/n*Math.PI*2+(frame?0.20:-0.20);
    const hu=(i*60+frame*40)%360;
    const px2=Math.round(cx+Math.cos(a)*(r+3)),py2=Math.round(cyE+Math.sin(a)*(r+3)*0.92);
    if(py2>=0&&py2<H)R(g,px2,py2,1,1,hsl(hu,P.sat,86));
    const px=Math.round(cx+Math.cos(a)*r),py=Math.round(cyE+Math.sin(a)*r*0.92);
    if(py>=0&&py<H)R(g,px,py,1,1,hsl(hu,P.sat,68));
  }
}
/* v6.7 废弃 drawShell（破壳白壳）
   它原本是给手绘态设计的「1 阶破壳」记号：一枚 #fffdf2 的 10×8 白色椭圆 + 顶盖。
   套到 AI 精灵上后实测像素矩阵（t=1，皮丘宝宝）：
     38..45 行出现 W 连续 8~10 列的纯白块 → 整块糊在脸中央，
     看起来就是「白色幽灵」，把 5 阶进化链第一阶最重要的辨识特征（眼睛+红脸颊）全盖住。
   结论：精灵态一律不画任何覆盖在本体上的色块。破壳感改由「进化阶段名」文字承担。 */
function drawPattern(g,pet,cx,cy,bw,bh,pal){
  if(pet.pattern===1){
    R(g,cx-bw*0.30,cy+bh*0.05,2,2,pal.dark);
    R(g,cx+bw*0.22,cy-bh*0.18,2,2,pal.dark);
    R(g,cx+bw*0.10,cy+bh*0.30,1,1,pal.dark);
  }else if(pet.pattern===2){
    [-bh*0.12,bh*0.02].forEach(dy=>{
      const hw=halfW(bw,bh,dy),y=Math.round(cy+dy);
      R(g,cx-hw*0.8,y,Math.max(2,hw*1.6),1,pal.dark);
    });
  }else if(pet.pattern===3){
    R(g,cx-bw*0.10,cy-bh*0.32,Math.max(2,bw*0.2),2,pal.accent);
  }
}
function drawFace(g,cx,fy,bw,t,pal,mood){
  const m=mood||{};
  const spec=SP._cur;
  const gap=Math.max(2,Math.round(bw*0.17));
  const ey=Math.round(fy-1);
  const dark=pal.dark;
  const dx=m.dx||0; // 张望：整对眼睛左右平移
  if(m.sleep){                                                    // 熟睡：闭眼微笑弧 ‿
    R(g,cx-gap-1,ey,1,1,dark);R(g,cx-gap,ey+1,1,1,dark);R(g,cx-gap+1,ey,1,1,dark);
    R(g,cx+gap-1,ey,1,1,dark);R(g,cx+gap,ey+1,1,1,dark);R(g,cx+gap+1,ey,1,1,dark);
    if(t>=1&&!(spec&&spec.noMouth))R(g,cx,ey+3,1,1,dark);
    if(t>=3){R(g,cx-gap-3,ey+2,2,1,'#ffb3c1');R(g,cx+gap+2,ey+2,2,1,'#ffb3c1');}
    return;
  }
  if(m.sleepy){                                                   // 犯困：半眯着
    R(g,cx-gap-1,ey+1,2,1,dark);R(g,cx+gap,ey+1,2,1,dark);
    if(t>=1&&!(spec&&spec.noMouth)){R(g,cx-1,ey+3,1,1,dark);R(g,cx+1,ey+3,1,1,dark);R(g,cx,ey+4,1,1,dark);}
    if(t>=3){R(g,cx-gap-3,ey+2,2,1,'#ffb3c1');R(g,cx+gap+2,ey+2,2,1,'#ffb3c1');}
    return;
  }
  if(t<=2){
    if(m.blink){R(g,cx-gap-1,ey+1,2,1,dark);R(g,cx+gap,ey+1,2,1,dark);}
    else{
      R(g,cx-gap-1+dx,ey,1,1,dark);R(g,cx-gap+dx,ey-1,1,1,dark);R(g,cx-gap+1+dx,ey,1,1,dark);
      R(g,cx+gap-1+dx,ey,1,1,dark);R(g,cx+gap+dx,ey-1,1,1,dark);R(g,cx+gap+1+dx,ey,1,1,dark);
    }
  }else if(t>=10){
    if(m.blink){R(g,cx-gap-1+dx,ey+1,2,1,'#ffd75e');R(g,cx+gap+dx,ey+1,2,1,'#ffd75e');}
    else{star4(g,cx-gap+dx,ey,'#ffd75e');star4(g,cx+gap+dx,ey,'#ffd75e');}
  }else{
    if(m.blink){R(g,cx-gap-1+dx,ey+1,2,1,dark);R(g,cx+gap+dx,ey+1,2,1,dark);}
    else{
      R(g,cx-gap-1+dx,ey,2,2,dark);R(g,cx+gap+dx,ey,2,2,dark);
      R(g,cx-gap-1+dx,ey,1,1,'#fff');R(g,cx+gap+dx,ey,1,1,'#fff');
    }
  }
  const my=ey+3;
  if(t>=1&&!(spec&&spec.noMouth)){
    if(m.happy){R(g,cx-1,my,3,1,dark);R(g,cx-1,my+1,1,1,dark);R(g,cx+1,my+1,1,1,dark);} // 咧嘴笑
    else{R(g,cx-1,my,1,1,dark);R(g,cx+1,my,1,1,dark);R(g,cx,my+1,1,1,dark);}
  }
  if(t>=3){
    R(g,cx-gap-3,my-1,2,1,'#ffb3c1');R(g,cx+gap+2,my-1,2,1,'#ffb3c1');
  }
}
/* ---- 待机小动作系统：每只宠物独立相位+性格，全班不再整齐划一 ---- */
const PERSONA=['活泼好动','好奇心旺','悠闲淡定'];
/* ---- 行为状态系统：把课堂数据翻译成宠物情绪（不是随机卖萌，而是学情可视化） ---- */
const ACT={IDLE:0,SLEEPY:1,SLEEP:2,BEG:3,SKIP:4};
const ACT_NAME={0:'精神抖擞',1:'有点犯困',2:'睡大觉中',3:'求投喂',4:'欢呼跳跃'};
const BEG_TEXT='求投喂';            // 三个字足够：投影上一眼读懂，不啰嗦
const BEG_CYCLE=30,BEG_SHOW=6;      // 喊一句歇一大阵：只占约 20% 时间（≈3.4 秒一现），不一直吵

/* ---- 「求投喂」气泡：矢量高清字，不做像素点阵 ----
   这三个字是给全班看清的"台词"，不是装饰笔画：必须干净利落。
   做法是先在离屏按 3 倍字号（54px）画好，再整体缩到 18px 显示——等于给文字
   做了一次超采样，笔画圆润、边缘平滑，又不像直接画小字那样糊成一团。
   框体是圆角矢量 + 硬投影，和像素宠物形成"字现代、画复古"的对比。 */
const BEG_FONT='"PingFang SC","HarmonyOS Sans SC","Microsoft YaHei UI","Microsoft YaHei","Source Han Sans SC","Noto Sans CJK SC",sans-serif';
const BEG_S=3,BEG_FS=18,BEG_PADX=10,BEG_PADY=6,BEG_TAIL=6,BEG_SH=3;
const BEG_COL='#5b4636';            // 暖咖色字：和奶油底同色系，一眼醒目但不刺眼（不再是红字）
const BEG_BG='#fffdf6',BEG_LINE='#33333d';
const BEG_H=BEG_FS+BEG_PADY*2+BEG_TAIL;     // 含尾巴的整高（CSS px，气泡定位用）
function rrPath(g,x,y,w,h,r){               // 圆角矩形路径（自己写，兼容性稳）
  g.beginPath();
  g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);
  g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);
  g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);
}
function paintBeg(cv,text){
  text=text||BEG_TEXT;
  let S=BEG_S;
  /* 按容器可用宽度收敛（v6.3 修横向溢出）：
     班级卡片只有 212px 宽，而"请投喂！"这类气泡按字号算出来 282px。
     .begcv 是 position:absolute 且宽度由本函数写进 style，
     绝对定位元素超宽不裁剪也不换行 —— 会直接顶出容器，
     页面出现横向滚动条，窗口最大化后尤其明显（1366 视口实测溢出 8px）。
     做法：先按标准字号量一次，放不下就按比例压小 S 重新量。
     宁可气泡小一点，也不能让整页横向抖动。S 改成 let就是为了这一步重绑。 */
  try{
    const pw=cv.parentElement;
    const avail=(pw&&pw.clientWidth)?pw.clientWidth:0;
    if(avail){
      const m0=document.createElement('canvas').getContext('2d');
      m0.font='900 '+(BEG_FS*BEG_S)+'px '+BEG_FONT;
      const raw=Math.ceil([...text].map(c=>m0.measureText(c).width).reduce((a,b)=>a+b,0)
                +Math.round(2*BEG_S)*(text.length-1)||BEG_FS*BEG_S*text.length)
                +BEG_PADX*BEG_S*2+BEG_SH*BEG_S;
      if(raw>avail)S=Math.max(0.62,BEG_S*avail/raw);   /* 最多缩到 62%：再小就认不出是气泡 */
    }
  }catch(e){}
  const fs=BEG_FS*S,px=BEG_PADX*S,py=BEG_PADY*S,tl=BEG_TAIL*S,sh=BEG_SH*S;
  let tw=0,CHS=null,GAP=0,WID=null;
  try{
    const m=document.createElement('canvas').getContext('2d');
    m.font='900 '+fs+'px '+BEG_FONT;
    CHS=[...text];GAP=Math.round(2*S);WID=CHS.map(c=>m.measureText(c).width);
    tw=WID.reduce((a,b)=>a+b,0)+GAP*(CHS.length-1);
  }catch(e){}
  const bw=Math.ceil((tw||fs*text.length)+px*2),bh=Math.ceil(fs+py*2);
  const W=bw+sh,H=bh+tl+sh,rad=Math.round(11*S),lw=Math.max(2,Math.round(2.2*S));
  cv.width=W;cv.height=H;
  cv.style.width=(W/S)+'px';cv.style.height=(H/S)+'px';
  const g=cv.getContext('2d');
  const cx=Math.round(bw*0.44),t1=cx-Math.round(6*S),t2=cx+Math.round(7*S),t3=cx+Math.round(1*S);
  const tail=()=>{g.beginPath();g.moveTo(t1,bh-2);g.lineTo(t3,bh+tl);g.lineTo(t2,bh-2);};
  g.fillStyle='rgba(51,51,61,.20)';                        // 硬投影：整体偏移一层剪影，干净利落
  g.save();g.translate(sh,sh);rrPath(g,0,0,bw,bh,rad);g.fill();tail();g.fill();g.restore();
  g.fillStyle=BEG_BG;                                      // 奶油底（框 + 尾巴一次成型）
  rrPath(g,0,0,bw,bh,rad);g.fill();tail();g.fill();
  g.strokeStyle=BEG_LINE;g.lineWidth=lw;g.lineJoin='round';g.lineCap='round';
  rrPath(g,lw/2,lw/2,bw-lw,bh-lw,Math.max(2,rad-lw/2));g.stroke();
  g.beginPath();g.moveTo(t1,bh-1);g.lineTo(t3,bh+tl);g.lineTo(t2,bh-1);g.stroke();  // 尾巴只描两条斜边
  g.font='900 '+fs+'px '+BEG_FONT;g.textAlign='left';g.textBaseline='middle';
  g.fillStyle=BEG_COL;
  if(CHS){let x=px;for(let i=0;i<CHS.length;i++){g.fillText(CHS[i],x,bh/2+Math.round(.5*S));x+=WID[i]+GAP;}}
  else g.fillText(text,px,bh/2);
}
function petSeed(pet){return (pet.species*37+Math.round(pet.hue)*11+pet.pattern*7)%64;}
/* 分档人数：标准 50 人班 = 倒数 10 名睡觉 / 倒数 11–20 名求投喂，其余正常活动。
   小班按比例收敛（每档约 20%，最少 1 人），免得 12 人班里 10 个都在睡。 */
const ZONE_SIZE=10;
function classStats(){
  if(!CUR||!CUR.students||!CUR.students.length)return{avg:0,max:0,n:0,sum:0,rank:{},sleepZone:0,begZone:0};
  if(CUR._stats)return CUR._stats;
  let sum=0,mx=0;
  CUR.students.forEach(s=>{const v=s.total||0;sum+=v;if(v>mx)mx=v;});
  const n=CUR.students.length;
  // 倒数排名：分数从低到高排；同分先按"更久没被点到"，再按 id 稳定兜底
  const arr=CUR.students.slice().sort((a,b)=>{
    const d=(a.total||0)-(b.total||0);if(d)return d;
    const t=(a.lastTs||0)-(b.lastTs||0);if(t)return t;
    return a.id<b.id?-1:1;
  });
  const rank={};arr.forEach((s,i)=>rank[s.id]=i+1);     // 1 = 全班垫底
  const zone=Math.max(1,Math.min(ZONE_SIZE,Math.round(n*0.2)));
  CUR._stats={avg:n?sum/n:0,max:mx,n,sum,rank,sleepZone:zone,begZone:zone*2};
  return CUR._stats;
}
function petCtx(pet){
  // 演示宠物 / 非班级对象 → 纯待机；否则按【班级积分排名】判定行为
  if(!pet||!CUR||!CUR.students||!pet.id)return{act:ACT.IDLE};
  const s=classStats(),tot=pet.total||0;
  if(!s.n||!s.sum)return{act:ACT.IDLE};        // 全班还没开张：先不贴任何标签，大家都正常活动
  const r=s.rank[pet.id]||s.n;                  // 倒数第几名（1 = 垫底）
  // ① 倒数后 10 名：直接上床盖被子睡大觉
  if(r<=s.sleepZone)return{act:ACT.SLEEP};
  // ② 倒数 11–20 名：时不时冒一句「求投喂」
  if(r<=s.begZone)return{act:ACT.BEG};
  // ③ 其余人正常活动；其中明显领先的尖子生欢呼跳跃
  if(tot>=3&&tot>=Math.max(3,s.avg*1.4))return{act:ACT.SKIP};
  return{act:ACT.IDLE};
}
function idleState(pet,frame,ctx){ // frame: 0-11 相位（由全局 TICK 驱动）
  const seed=petSeed(pet),ph=(frame+seed)%12,perso=seed%3;
  const act=(ctx&&ctx.act)||ACT.IDLE;
  const s={ph,perso,act,breathe:false,hop:false,blink:false,dx:0,happy:false,
           sleep:false,sleepy:false,zz:-1,bubble:0,rope:-1};
  if(act===ACT.SLEEP||act===ACT.SLEEPY){
    s.sleep=(act===ACT.SLEEP);s.sleepy=(act===ACT.SLEEPY);
    if(((frame+seed)/3|0)%2)s.breathe=true;            // 沉睡的慢呼吸（比醒着更缓）
    if(act===ACT.SLEEP)s.zz=(frame+seed)%12;           // Zzz 上升循环
    else{                                              // 犯困：眼皮打架 + 偶尔冒一颗小 z
      if((frame+seed)%6===0)s.blink=true;
      if((frame+seed)%12<5)s.zz=(frame+seed)%12;
    }
    return s;
  }
  if(act===ACT.BEG){
    const cyc=(TICK+seed*5)%BEG_CYCLE;                 // 全局节拍驱动：30 拍里只喊 6 拍（≈3.4 秒），每只错开，绝不刷屏
    s.bubble=cyc<BEG_SHOW?1:0;
    if(ph%2===1)s.breathe=true;
    if(ph===(seed*5+3)%12)s.blink=true;
    if(cyc===BEG_SHOW+2)s.blink=true;                  // 收声时眨个眼，更像真的
    return s;
  }
  if(act===ACT.SKIP){
    // 领先的同学「欢呼跳跃」：原地开心地蹦跳，不再画跳绳（跳绳与宝可梦形象违和）
    const rp=((frame+seed)%4)*2;                       // 4 拍一循环，各宠物按种子错开
    s.rope=-1;                                         // 不画绳
    s.hop=(rp===2||rp===4);                            // 一拍一跳
    s.happy=true;
    if(rp===0||rp===6)s.blink=true;
    return s;
  }
  if(ph%2===1)s.breathe=true;                      // 呼吸：身体轻微起伏（全员）
  if(ph===(seed*5+3)%12)s.blink=true;              // 眨眼（全员，时刻各异）
  if(perso===2&&ph===(seed*5+4)%12)s.blink=true;   // 悠闲型：连眨两拍更慵懒
  if(perso===0){                                    // 活泼型：偶尔雀跃+咧嘴笑
    if(ph===2||ph===8){s.hop=true;s.happy=true;}
  }else if(perso===1){                              // 好奇型：左右张望
    if(ph===4||ph===5)s.dx=-1;
    else if(ph===10||ph===11)s.dx=1;
  }
  return s;
}
/* ---- 行为特效：像素层绘制 ---- */
function drawZmark(g,x,y,sz,c){                     // 像素 Z（顶横+斜+底横）
  R(g,x,y,sz,1,c);
  for(let i=1;i<sz;i++)R(g,x+sz-i,y+i,1,1,c);
  R(g,x,y+sz,sz,1,c);
}
function drawSleepZ(g,cx,topY,zz,n){                // n=1 犯困的单小 z；n=2 熟睡的大小两个 Z
  const far='#9aa7c0',near='#6b7a99';
  const rise=Math.floor(zz/3)%4;                    // 缓慢上升后重置，形成飘动循环
  if(n<=1){drawZmark(g,cx+5,Math.max(0,topY-2-rise),2,far);return;}
  for(let i=0;i<2;i++){
    const y=Math.max(0,topY-2-i*4-((rise+i*2)%4));
    drawZmark(g,cx+4+i*3,y,i===1?3:2,i===1?far:near);
  }
}
/* ---- 熟睡：睡在床上盖被子（犯困只是坐着打盹，不上床） ---- */
function bedGeom(o){                                  // 床宽随体型自适应，并夹在画布内
  const bedW=Math.min(W-6,Math.max(22,Math.round(o.bw+10)));
  const bx=Math.max(1,Math.min(W-1-bedW,Math.round(o.cx-bedW/2)));
  return {bedW,bx,mTop:o.gy-2};
}
function drawBed(g,o){                                // 床头板 + 床垫 + 枕头（画在身体之前＝身后）
  const {cx,cy,bw,bh}=o,B=bedGeom(o);
  const hbTop=Math.max(1,Math.round(cy-bh/2-2));
  const hbH=Math.max(2,B.mTop-hbTop+1);
  R(g,B.bx,hbTop,B.bedW,hbH,'#c3935f');               // 床头板
  R(g,B.bx,hbTop,B.bedW,1,'#8a6a44');                 // 顶横梁
  R(g,B.bx,hbTop-1,2,1,'#8a6a44');                    // 床柱（左右各一个圆头）
  R(g,B.bx+B.bedW-2,hbTop-1,2,1,'#8a6a44');
  if(hbH>2){
    R(g,B.bx+1,hbTop+1,1,hbH-2,'#d6ab77');            // 木纹高光
    R(g,B.bx+B.bedW-2,hbTop+1,1,hbH-2,'#a8825a');
  }
  R(g,B.bx,B.mTop,B.bedW,3,'#fffdf6');                // 床垫
  R(g,B.bx,B.mTop,B.bedW,1,'#ffffff');
  R(g,B.bx,B.mTop+2,B.bedW,1,'#dfd7c2');              // 床垫厚度
  R(g,B.bx+2,B.mTop+3,2,2,'#8a6a44');                 // 床腿
  R(g,B.bx+B.bedW-4,B.mTop+3,2,2,'#8a6a44');
  const pw=Math.min(B.bedW-4,Math.max(9,Math.round(bw*0.92)));
  const px=Math.round(cx-pw/2),py=Math.max(hbTop+1,Math.round(cy-bh/2)-1);
  R(g,px,py,pw,3,'#fffdf6');                          // 枕头（头枕在上面）
  R(g,px,py,pw,1,'#ffffff');
  R(g,px,py+2,pw,1,'#e6dfcb');
}
function drawQuilt(g,o,hue,br){                       // 被子：盖住脖子以下露出脑袋，配色随宠物
  const {cx,cy,bh}=o,B=bedGeom(o);
  const qx=B.bx,qW=B.bedW;                            // 与床同宽同起点：边缘整齐，不露木色
  const qTop=Math.round(cy-bh*0.02)+(br?1:0);         // 盖到胸口上方：只露出脑袋和肩（呼吸时随胸口起伏）
  const qBot=B.mTop;                                  // 一路盖到床垫上，脚不外露
  const qH=Math.max(3,qBot-qTop+1);
  const qh=(hue+165)%360;                             // 被面取身体的对角色相：一眼分得清被子和宠物
  const c1=hsl(qh,42,78),c2=hsl(qh,36,64),c3=hsl(qh,32,50),c4=hsl(qh,44,88);
  R(g,qx+1,qTop,Math.max(2,qW-2),1,'#fffdf6');        // 被头翻边（两端收进 1px：被子鼓起来的蓬松感）
  R(g,qx,qTop+1,qW,1,'#f0e9d6');                      // 翻边厚度
  R(g,qx,qTop+2,qW,qH-2,c1);                          // 被面
  R(g,qx,qTop+2,qW,1,c4);                             // 被面高光
  const b1=qTop+3+Math.round((qH-3)*0.42),b2=qTop+3+Math.round((qH-3)*0.78);
  if(b1<qBot)R(g,qx,b1,qW,1,c2);                      // 横条纹
  if(b2<qBot)R(g,qx,b2,qW,1,c2);
  const f1=Math.round(cx-qW*0.24),f2=Math.round(cx+qW*0.22);
  R(g,f1,qTop+3,1,Math.max(1,qH-4),c2);               // 垂坠褶皱
  R(g,f2,qTop+3,1,Math.max(1,qH-4),c2);
  R(g,qx,qTop+2,1,qH-2,c3);R(g,qx+qW-1,qTop+2,1,qH-2,c3);
  R(g,qx,qBot,qW,1,c3);
}
function drawPet(g,pet,progress,prestige,frame){
  g.clearRect(0,0,W,H);
  const t=Math.min(progress,10);
  const pr=prestige;
  const spec=SP[pet.species];
  SP._cur=spec;
  const f2=frame%2; // 特效/配色沿用双帧节奏，与待机相位解耦
  const pal=palOf(pet,pr,f2);
  const cx=W/2,gy=H-14;              // 地面线：本体底边贴地，脚下留 14px 放等级条/影子
  let sprBox=null;                    // 精灵实际绘制尺寸（转生边框要贴着它画）
  let B=t===0?16:14+Math.round(t*1.9);
  if(pr>0)B=Math.min(38,B+6); // 转生体型加成（v6.8：不分档，统一 +6）
  const ctx=petCtx(pet);
  const idle=idleState(pet,frame,ctx);
  if(!idle.sleep)ER(g,cx,gy+1,Math.max(5,B*0.45),2,'rgba(70,55,35,.15)'); // 睡在床上不需要地面投影
  if(t===0){
    const eh=Math.max(19,B)+5;   // 转生蛋更大（原来只有 15px，光壳贴不住，全被星环散点淹没）
    const cyE=gy-eh/2;
    if(pr>0)drawEggRays(g,cx,cyE,eh,pr,f2);
    drawEgg(g,pet,cx,gy,eh,pal,pr);
    if(pr>0){
      /* v6.8：蛋态不再画环绕星环 —— 12 个 2×2 彩块散在 19px 的蛋周围，
         投影上就是一团彩色噪点，反而把"彩虹光壳"盖掉了。改为顶部三颗星。 */
      drawStars(g,cx,gy-eh,pr,f2);
    }
    return;   // 求投喂改用卡片上的像素气泡（见 paintBeg），画布只画宠物本体，避免与气泡抢位置
  }
  let bw=Math.max(8,Math.round(B*spec.wr)),bh=Math.max(8,Math.round(B*spec.hr));
  if(idle.sleep){bw=Math.round(bw*1.10);bh=Math.round(bh*0.88);} // 躺姿：身子摊开、躺平（保留体积感）
  else if(idle.sleepy)bh=Math.round(bh*0.88);                    // 犯困：身子塌下去一点
  if(idle.breathe&&!idle.sleep)bh=Math.max(7,bh-1); // 呼吸（睡着时改用被子起伏表现）
  if(idle.hop){bw=Math.max(7,bw-1);bh=bh+1;}        // 雀跃/欢呼跳：拉伸（挤压伸展原则）
  const cy=idle.sleep?(gy-2-bh/2):(gy-bh/2-1),topY=cy-bh/2; // 躺着时抬到床垫上
  const o={cx,cy,bw,bh,topY,pal,frame:f2,t,gy,pr};
  g.save();
  if(idle.hop)g.translate(0,-3);           // 欢呼跳起：整体上移，影子留在原地
  if(idle.sleep)drawBed(g,o);                    // 床（身后）：床头板+床垫+枕头
  /* 背景光柱只给手绘态：它按 bw/bh 定位，精灵态会与精灵错位成色带 */
  if(pr>0&&!idle.sleep&&!spec.spr)drawBeam(g,o,pr,f2);
  /* v6.8 转生辉光：精灵态走【贴轮廓辉光】，在精灵之前画，永远不遮本体；
     边界永远是身体形状，不会出现矩形色块（v6.7 的教训）。
     睡着时不画（被子里透光很怪）。 */
  if(pr>0&&!idle.sleep&&spec.spr){
    const sid2=pickEvoImg(spec.id,evoStageOf(t));
    const sox=Math.round(cx-SPR_CELL/2),soy=Math.round(gy-SPR_CELL);
    /* v6.15：传 12 帧相位（frame）而不是 f2 —— 法阵/光尘要慢速循环，2 帧只会「抖」 */
    /* v6.17：贴身圣辉改由 paint() 在高分辨率画布上用矢量绘制 */
    /* v6.17：上升金尘同上 */
  }
  if(spec.behind)spec.behind(g,o);
  if(spec.spr)sprBox=drawSprite(g,o,spec.id);
  else if(spec.custom)spec.custom(g,o);
  else{
    ER(g,cx,cy,bw/2,bh/2,pal.base);
    ER(g,cx,cy+bh*0.16,Math.max(2,bw*0.30),Math.max(2,bh*0.28),pal.belly);
    if(spec.front)spec.front(g,o);
    drawPattern(g,pet,cx,cy,bw,bh,pal);
  }
  if(!spec.spr)drawFace(g,cx,cy+bh*(idle.sleep?-0.24:(spec.fo||0)),bw,t,pal,idle); // 精灵自带脸，不叠系统脸
  if(idle.sleep)drawQuilt(g,o,pet.hue,idle.breathe);  // 盖好被子，露出脑袋
  const isSpr=!!spec.spr;
  const accTop=topY, accW=bw;
  const neckY=Math.round(cy+bh*0.36);
  // 精灵态（spr）不画皇冠/围巾/徽章/光环：这些配饰会压住 AI 画的辨识特征，让画面全变"彩球+皇冠"
  if(!isSpr){
    if(t>=5&&!idle.sleep)drawScarf(g,cx,neckY,accW,false);
    if(t>=7&&!idle.sleep)drawBadge(g,cx,neckY,false);
    if(t>=8)drawCrown(g,cx,accTop-(t>=9?4:2),t>=9,false);
    if(t>=10)drawAura(g,cx,cy,bw,f2);
  }
  /* 转生特效分层（v6.4 修正）：
     覆盖型特效（轮廓光/火花/圣火/星环/撒星星）全部只给「手绘态」用。
     精灵态为什么一律不画：
       ① 它们按旧的手绘身体尺寸 bw/bh 定位，而精灵实际大小是 sprBox.w（38~50px），
          尺寸对不上 → 色块与精灵错位，看起来像"身上盖了块颜色"（★2 时最明显）；
       ② 就算尺寸对上了，压在 AI 精灵身上也会把物种特征糊掉（实测 ★3 时皮卡丘认不出）。
     精灵态的转生身份由 drawSilGlow（贴轮廓虹彩辉光）表达，边界是身体形状而非矩形。 */
  if(!isSpr){
    if(pr>0&&!idle.sleep)drawPrestigeRim(g,o,pr,f2);
    if(pr>0&&!idle.sleep)drawPrestigeSparks(g,o,pr,f2);
    if(pr>0&&!idle.sleep)drawPrestigeFlame(g,o,pr,f2);
    if(pr>0&&!idle.sleep)drawPrestigeOrbit(g,o,pr,f2);
    if(!idle.sleep)drawSparkles(g,cx,accTop,progress,f2,t);
    if(pr>0)drawStars(g,cx,accTop,pr,f2);
  }
  if(isSpr)drawStageBar(g,cx,gy,Math.min(progress,10));      // 精灵态：等级进度挪到脚下，不遮本体
  /* v6.15：头顶悬浮金轮 —— 画在精灵之后，但严格位于头顶上方，绝不压住脸和花纹 */
  if(isSpr&&pr>0&&!idle.sleep&&sprBox){
    /* 欢呼起跳时整体 translate(0,-3)，金轮会跟着顶出画布 —— 这里补回来，
       否则「欢呼」这一帧卡片上的转生光环会整圈消失。 */
    /* v6.17：金轮改由 paint() 在高分辨率画布上用矢量绘制 */
  }
  /* v6.7：地光环代替转生外框。画在本体之后但只在脚下 1~4px，
     是"站进光里"的接地提示，不会压到脸和花纹。 */
  /* v6.17：地光环改由 paint() 在高分辨率画布上用矢量绘制 */
  if(idle.zz>=0)drawSleepZ(g,cx,topY,idle.zz,idle.sleep?2:1); // 💤 Zzz
  // 求投喂气泡不画在宠物画布上（画布缓存会冻结相位），改由卡片上的像素气泡统一呈现
  /* v6.17：收集光环参数，交给 paint() 在最终分辨率画布上矢量绘制。
     · sid  —— 精灵图 id（手绘态为 null，走体型近似的柔光椭圆）
     · x/y  —— 精灵左上角（柔光图层对齐用）
     · top  —— 头顶 y；欢呼起跳 translate(0,-3) 会把它顶出画布，这里补回来 */
  AUR=null;
  if(pr>0&&!idle.sleep){
    AUR={sid:isSpr?pickEvoImg(spec.id,evoStageOf(t)):null,
         x:(sprBox?sprBox.x:Math.round(cx-SPR_CELL/2)),
         y:(sprBox?sprBox.y:Math.round(gy-SPR_CELL)),
         aw:(sprBox?sprBox.w:SPR_CELL),      /* 精灵实际绘制边长（0 阶为 0.78×48） */
         cx:cx,gy:gy,bw:bw,bh:bh,
         top:(sprBox?sprBox.top:topY)+(idle.hop?3:0),
         frame:frame,pr:pr};
  }
  g.restore();
}
/* v6.17 关键修复：判据必须落在【映射表】上，绝不能假设两个命名空间同名。
   SPR 的键是链图 id（evo_pikachu…），SP 的 id 是物种 id（pikachu…），两者不相交，
   旧写法 SPR[s.id] 一个都没命中 → 45 只宝可梦全部退回手绘椭圆兜底分支（这就是「丑」的根源）。 */
SP.forEach(function(s){if(EVO_OF[s.id]||SPR[s.id]){s.spr=1;s.custom=null;s.front=null;s.behind=null;}});
const BODY_CACHE=new Map();
function bodyCanvas(pet,progress,prestige,frame){
  const key=pet.species+'|'+pet.hue+'|'+pet.pattern+'|'+pet.spots.map(p=>p.join()).join(';')+'|'+Math.min(progress,10)+'|'+prestige+'|'+frame+'|'+petCtx(pet).act;
  let e=BODY_CACHE.get(key);
  if(!e){
    const c=document.createElement('canvas');c.width=W;c.height=H;
    AUR=null;                                   /* drawPet 会写入，随缓存一起存 */
    drawPet(c.getContext('2d'),pet,progress,prestige,frame);
    if(BODY_CACHE.size>1500)BODY_CACHE.clear();
    e={c:c,aur:AUR};
    BODY_CACHE.set(key,e);
  }
  return e;
}
/* v6.18 新增 trim 参数：只画离屏画布的一条纵向带，用来压掉列表里的空白。
   【为什么需要】离屏画布是 52×72，但实测 45 物种 × 11 阶 × 4 转生档的墨迹
   只占 y12..y64 —— 上下各空 10~12 行（占画布 28%）。列表里每行都拖着这 20 行空白，
   60 人的排行榜行高被撑到 144px，要滚 10 屏以上。
   【裁切带怎么定】trim=[10,67] 是量出来的：墨迹 y12..64，上下各留 2 行呼吸。
   ⚠ 若以后改 drawPet 让宠物更高，必须重跑 .workbuddy/tmp/review618e_probe.js 复测再改这里。
   【为什么不能靠 CSS 裁】overflow:hidden 裁掉的是【已放大】的位图边缘，
   会把宠物切掉；这里是在【放大之前】就只取中间那段，边缘依然完整。 */
function paint(cv,pet,progress,prestige,scale,trim){
  // v6.17：光环分三层画在【最终分辨率】画布上（旧版画在 52×72 离屏画布上，放大必成像素块）
  const off=bodyCanvas(pet,progress,prestige,TICK%12);
  const sy0=trim?trim[0]:0, syH=trim?(trim[1]-trim[0]):H;
  const wpx=W*scale, hpx=syH*scale;
  cv.width=wpx;cv.height=hpx;
  cv.style.width=wpx+'px';cv.style.height=hpx+'px';
  const g=cv.getContext('2d');
  g.clearRect(0,0,cv.width,cv.height);
  /* 裁切靠【画布自身高度】自然截断，不要改 drawImage 的源矩形 ——
     源矩形一旦写成 (0,0,wpx,hpx)，整幅图会被纵向压扁 hpx/H 倍，实测丢 20~220 个像素。
     正确做法：内容照旧按全画布 H*scale 画，只把它整体上移 sy0 行，多出部分由画布边界裁掉。 */
  g.save();if(sy0)g.translate(0,-sy0*scale);
  const aur=off.aur;
  if(aur)drawAureoleBack(g,aur,scale);        /* ① 贴身圣辉 + 脚下法阵（本体之下） */
  g.imageSmoothingEnabled=false;
  g.drawImage(off.c,0,0,wpx,H*scale);         /* ② 宠物本体：保持硬像素边缘 */
  if(aur)drawAureoleFront(g,aur,scale);       /* ③ 头顶金轮 + 上升金尘（本体之上） */
  g.restore();
}
/* ================= 8bit 音效 ================= */
let AC=null,SOUND=true;
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}return AC;}
function tone(f,d,type,v,dl){
  if(!SOUND)return;
  const a=ac();if(!a)return;
  try{
    const o=a.createOscillator(),g=a.createGain();
    o.type=type||'square';o.frequency.value=f;
    o.connect(g);g.connect(a.destination);
    const t0=a.currentTime+(dl||0);
    g.gain.setValueAtTime(v||0.12,t0);
    g.gain.exponentialRampToValueAtTime(0.001,t0+d);
    o.start(t0);o.stop(t0+d+0.02);
  }catch(e){}
}
const sfx={
  plus(){tone(660,.08);tone(880,.09,'square',.12,.08);},
  evolve(){[523,659,784,1046].forEach((f,i)=>tone(f,.13,'square',.13,i*.09));},
  win(){[392,523,659,784,1046,1318].forEach((f,i)=>tone(f,.16,'triangle',.15,i*.11));},
  sad(){[330,294,262,233].forEach((f,i)=>tone(f,.26,'triangle',.13,i*.24));},
  click(){tone(440,.05,'square',.06);},
  tick(){tone(1250,.03,'square',.04);}
};

/* ================= 数据层 ================= */
const KEY='pixPetClassroom_v1';
let DB=null,CUR=null,FRAME=0,TICK=0;
function load(){
  try{DB=JSON.parse(localStorage.getItem(KEY));}catch(e){DB=null;}
  if(!DB||!Array.isArray(DB.classes))DB={classes:[],settings:{sound:true}};
  if(!DB.settings)DB.settings={sound:true};
  SOUND=DB.settings.sound!==false;
  /* v6.11：奖品配置随settings 走。备份/恢复会覆盖 settings，
     所以恢复后必须再跑一次 syncPrizes，否则新奖品名要等到下次刷新才生效。*/
  syncPrizes();
  // 老存档迁移：补 lastTs（最后答题时刻），避免历史数据一进班就全体"睡着"
  DB.classes.forEach(c=>(c.students||[]).forEach(s=>{
    if(!s.lastTs&&(s.total||0)>0)s.lastTs=Date.now();
  }));
}
function save(){DB.settings.sound=SOUND;localStorage.setItem(KEY,JSON.stringify(DB));}
function parseNames(t){
  const raw=(t||'').split(/[\n\r,，、;；\t ]+/).map(s=>s.trim()).filter(Boolean);
  const seen={},out=[];
  raw.forEach(x=>{
    x=x.replace(/^\s*(\d{1,3}|[①②③④⑤⑥⑦⑧⑨⑩])[.．、:：)）]?\s*/,'').trim();
    if(!x)return;
    if(seen[x]){seen[x]++;out.push(x+'('+seen[x]+')');}
    else{seen[x]=1;out.push(x);}
  });
  return out;
}
function makeStudents(names,classId){
  const cs=rng(hash('class'+classId));
  const order=SP.map((_,i)=>i);
  for(let i=order.length-1;i>0;i--){const j=Math.floor(cs()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  return names.map((nm,i)=>{
    const r=rng(hash(nm+'#'+i+'@'+classId));
    return{
      id:uid(),name:nm,species:order[i%SP.length],
      hue:Math.floor(r()*360),pattern:i%4,
      spots:[[r()*0.7-0.35,r()*0.7-0.35],[r()*0.7-0.35,r()*0.7-0.35],[r()*0.7-0.35,r()*0.7-0.35]],
      total:0,progress:0,prestige:0,prizes:[],created:Date.now()
    };
  });
}
function demoNames(n){
  const SN='王李张刘陈杨黄赵吴周徐孙马朱胡郭何高林罗郑梁谢宋唐许韩冯邓曹彭曾肖田董潘袁蔡蒋余于杜叶程魏苏吕丁任卢姚沈钟姜崔谭陆范汪廖石金韦贾夏付方邹熊白孟秦邱侯江尹薛闫段雷龙黎史陶贺毛郝顾龚邵万钱严覃武戴莫孔向汤';
  const GN='明华强伟磊军洋勇艳杰娟涛超霞平刚桂英秀兰玉梅红建国志文心怡欣宇泽楠春夏秋冬雨晨星辰月雪桐涵轩然乐天朗宁琪瑶嘉悦晨曦子涵浩然雨桐梓萱';
  const seen={},out=[];
  for(let i=0;out.length<n&&i<n*4;i++){
    let nm=SN[(i*7+3)%SN.length]+GN[(i*13+5)%GN.length]+(i%3===0?GN[(i*11+9)%GN.length]:'');
    if(seen[nm])continue;seen[nm]=1;out.push(nm);
  }
  return out;
}
/* ================= 通用 UI ================= */
function toast(msg,ms){
  const t=$('#toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(t._tm);t._tm=setTimeout(()=>t.classList.remove('show'),ms||2200);
}
function burst(card,big){
  if(!card)return;
  const n=big?14:6;
  /* 用基本符号（★✦●▲）而不是 emoji：任何系统都能渲染，颜色自己给，更像素、更统一 */
  const CH=['★','✦','●','▲'],CC=['#ffc53d','#ff8a5c','#5fbf9f','#9b8cf0'];
  for(let i=0;i<n;i++){
    const s=document.createElement('span');
    s.className='fx';
    s.textContent=CH[i%4];
    s.style.color=CC[i%4];
    s.style.left=(15+Math.random()*70)+'%';
    s.style.top='34%';
    s.style.setProperty('--dx',(Math.random()*64-32)+'px');
    s.style.animationDuration=(0.6+Math.random()*0.45)+'s';
    card.appendChild(s);
    setTimeout(()=>s.remove(),1150);
  }
}
function confetti(panel,mono){
  const colors=mono?[mono,'#ddd6c4','#b8b0a0']:['#ff8a5c','#5fbf9f','#ffc53d','#9b8cf0','#7fb3e8','#ff5e5e'];
  for(let i=0;i<60;i++){
    const s=document.createElement('i');
    s.className='conf';
    s.style.left=Math.random()*100+'%';
    s.style.background=colors[i%6];
    s.style.animationDelay=(Math.random()*0.6)+'s';
    s.style.animationDuration=(0.9+Math.random()*1.3)+'s';
    panel.appendChild(s);
    setTimeout(()=>s.remove(),3000);
  }
}
let CF_CB=null;
function confirmBox(title,text,cb){
  $('#cfTitle').textContent=title;$('#cfText').textContent=text;
  CF_CB=cb;openModal('confirmModal');
}
function openModal(id){$('#'+id).classList.remove('hidden');}
function closeModal(id){
  $('#'+id).classList.add('hidden');
  if(id==='pickModal')clearTimeout(pickTimer);
  if(id==='stuModal')STU_OPEN=null;
}

/* ================= 首页 ================= */
function renderHome(){
  const box=$('#classList');box.innerHTML='';
  if(!DB.classes.length){
    const d=document.createElement('div');
    d.className='class-card';
    d.innerHTML='<h3>'+uicon('egg',20)+' 还没有班级</h3><div class="meta">先建一个班级，学生们就能领取自己的宝可梦宠物啦！<br>建班时可直接把花名册整段粘贴进输入框。</div>';
    box.appendChild(d);
  }
  DB.classes.forEach(c=>{
    const total=c.students.reduce((a,s)=>a+s.total,0);
    const pz=c.students.reduce((a,s)=>a+s.prizes.length,0);
    const el=document.createElement('div');
    el.className='class-card';
    const last=c.students.reduce((a,s)=>Math.max(a,s.lastTs||0),0);   // 运营视角：多班并行时靠"最近活跃"分辨
    el.innerHTML='<h3>'+uicon('people',19)+' '+esc(c.name)+'</h3>'+
      '<div class="meta">'+uicon('people',15)+' '+c.students.length+' 名学生　'+uicon('chat',15)+' 累计答题 '+total+' 次<br>'+
      uicon('gift',15)+' 已发奖品 '+pz+' 份　'+(last?fmtTime(last)+' 最近答题':'尚无答题记录')+'</div>'+
      '<div class="row"><button class="btn btn-teal" style="flex:1">进入班级 →</button>'+
      '<button class="btn btn-sm btn-ren" title="重命名">'+uicon('pen',15)+'</button>'+
      '<button class="btn btn-sm btn-del" title="删除班级">'+uicon('trash',15)+'</button></div>';
    el.querySelector('.btn-teal').onclick=()=>openClass(c.id);
    el.querySelector('.btn-ren').onclick=()=>{                       // 运营：建班后打错字/换学期改名，不必删班重建
      const nn=window.prompt('修改班级名称：',c.name);
      if(nn===null)return;
      const t=nn.trim().slice(0,20);
      if(!t){toast('班级名称不能为空');return;}
      c.name=t;save();renderHome();
      if(CUR&&CUR.id===c.id){$('#className').innerHTML=uicon('people',18)+' '+esc(CUR.name);}
      toast('✅ 班级名称已改为「'+t+'」');
    };
    el.querySelector('.btn-del').onclick=()=>confirmBox('删除班级','确定删除「'+esc(c.name)+'」？该班所有宠物养成进度将永久消失！',()=>{
      DB.classes=DB.classes.filter(x=>x.id!==c.id);save();renderHome();toast('班级已删除');
    });
    box.appendChild(el);
  });
  const add=document.createElement('div');
  add.className='class-card new';
  add.textContent='＋ 新建班级';
  add.onclick=()=>{$('#inpClassName').value='';$('#inpNames').value='';openModal('createModal');};
  box.appendChild(add);
}
let demoTick=0,HERO=null;
/* 首页主角的位图倍率必须【等于】CSS 的 --u。
   CSS 用 !important 把 #heroPet 显示成 52×--u（1180 以下 5、常见屏 6、≥1700 为 8）。
   位图若固定 8×，显示时会被重采样成 0.625 / 0.75 倍 —— 非整数缩放，
   像素台阶粗细不匀（蛋的轮廓有的地方 1 格宽、有的 2 格宽），放大看就是"糊"。
   倍率改成 --u 后位图与显示 1:1，任何档位都是干净的整数像素块。 */
function heroUnit(){
  const h=document.querySelector('.hero');
  if(!h)return 6;
  const u=parseFloat(getComputedStyle(h).getPropertyValue('--u'));
  return (u&&u>=2)?Math.round(u):6;
}
let heroUnitCur=0;
function heroLoop(){
  const cv=$('#heroPet');
  if(!cv)return;
  // 封面只展示神秘蛋：不剧透任何进化/转生形态，把揭晓的惊喜留给课堂
  const PH=8;                                  // 每 8 拍换一次配色/花纹（约 9 秒）；原来是 24 拍≈27 秒，首屏看着像静止画面
  const sp=Math.floor(demoTick/PH)%SP.length;
  const fake={species:sp,hue:(sp*29+Math.floor(demoTick/PH)*7)%360,pattern:demoTick%4,spots:[[0.2,0.1],[-0.3,0.2],[0.1,-0.3]]};
  HERO={fake,st:0,pr:0};
  const HV=heroUnit();heroUnitCur=HV;          /* 位图倍率 = --u：与显示 1:1，整数像素不糊 */
  cv.__draw=()=>paint(cv,HERO.fake,0,0,HV);
  cv.__draw();
  // 孵化预告：每隔几拍晃动一下，暗示"蛋里有动静"，但绝不破壳
  if(demoTick%6===5){cv.classList.remove('wobble');void cv.offsetWidth;cv.classList.add('wobble');}
  demoTick++;
}
/* --u 在 1180 / 1700 / 2200 三个断点跳档（5 → 6 → 8）。
   窗口跨档时（投影机切分辨率、笔记本接投影）必须按新倍率重画，否则位图还停在旧倍率，
   又变回非整数缩放。这里只在档位真的变了才重画，不做无谓刷新。 */
window.addEventListener('resize',()=>{if(heroUnit()!==heroUnitCur)heroLoop();});

/* ================= 班级页 ================= */
/* ---- 姓氏首字母引擎（离线三重保险：多音字表 → ICU拼音collator → 常见姓氏兜底） ---- */
const SURNAME_FIX={
  /* 多音字姓氏（按姓氏读音取首字母） */
  '曾':'Z','解':'X','仇':'Q','单':'S','区':'O','朴':'P','查':'Z','翟':'Z','乐':'Y',
  '缪':'M','宓':'M','覃':'Q','冼':'X','阚':'K','逄':'P','郇':'H','贲':'B','折':'S',
  '繁':'P','员':'Y','句':'G','种':'C','重':'C','燕':'Y','召':'S','洗':'X','尉':'Y',
  '过':'G','都':'D','阆':'L','应':'Y','於':'Y','荀':'X','郄':'Q','啜':'C','蔄':'M',
  /* 百家姓前 100（collator 不可用时的兜底，正常情况下二者一致） */
  '王':'W','李':'L','张':'Z','刘':'L','陈':'C','杨':'Y','黄':'H','赵':'Z','吴':'W','周':'Z',
  '徐':'X','孙':'S','马':'M','朱':'Z','胡':'H','郭':'G','何':'H','林':'L','罗':'L','高':'G',
  '郑':'Z','梁':'L','谢':'X','宋':'S','唐':'T','许':'X','韩':'H','冯':'F','邓':'D','曹':'C',
  '彭':'P','肖':'X','田':'T','董':'D','潘':'P','袁':'Y','蔡':'C','蒋':'J','余':'Y','于':'Y',
  '杜':'D','叶':'Y','程':'C','苏':'S','魏':'W','吕':'L','丁':'D','任':'R','沈':'S','姚':'Y',
  '卢':'L','姜':'J','崔':'C','钟':'Z','谭':'T','陆':'L','汪':'W','范':'F','金':'J','石':'S',
  '廖':'L','贾':'J','夏':'X','韦':'W','傅':'F','方':'F','白':'B','邹':'Z','孟':'M','秦':'Q',
  '邱':'Q','江':'J','尹':'Y','薛':'X','闫':'Y','段':'D','雷':'L','侯':'H','龙':'L','史':'S',
  '陶':'T','黎':'L','贺':'H','顾':'G','毛':'M','郝':'H','龚':'G','邵':'S','万':'W','钱':'Q'
};
/* 23 个拼音声母起始边界参照字（按拼音序），配合 Intl.Collator 中文-中文拼音比较 */
const PINYIN_EDGE=[['A','阿'],['B','八'],['C','嚓'],['D','哒'],['E','屙'],['F','发'],['G','旮'],
  ['H','哈'],['J','击'],['K','咔'],['L','垃'],['M','妈'],['N','拿'],['O','噢'],['P','趴'],
  ['Q','七'],['R','然'],['S','仨'],['T','他'],['W','挖'],['X','夕'],['Y','丫'],['Z','匝']];
let _COL=null,_COL_OK=null;
function _coll(){
  if(_COL===null){
    try{
      _COL=new Intl.Collator('zh-CN-u-co-pinyin',{sensitivity:'base'});
      /* 探针：验证该 collator 确实按拼音排中文 */
      _COL_OK=_COL.compare('李','王')<0&&_COL.compare('张','陈')>0&&_COL.compare('安','白')<0;
    }catch(e){_COL=false;_COL_OK=false;}
  }
  return _COL_OK?_COL:null;
}
function surnameInitial(name){
  if(!name)return '#';
  const ch=name.trim()[0];
  if(!ch)return '#';
  if(/[A-Za-z]/.test(ch))return ch.toUpperCase();
  if(!/[\u4e00-\u9fa5]/.test(ch))return '#';
  if(SURNAME_FIX[ch])return SURNAME_FIX[ch];
  const c=_coll();
  if(c){
    let last=null;
    for(const e of PINYIN_EDGE){
      if(c.compare(ch,e[1])>=0)last=e[0];
      else break;
    }
    return last||'A';
  }
  return '#';
}
let SORT_MODE=localStorage.getItem('pxkt_sort')||'surname';
function nameHTML(n){
  if(!n)return '';
  return '<span class="sn">'+esc(n[0])+'</span>'+esc(n.slice(1));
}
/* ---- A-Z 索引栏 ---- */
let _bubbleT=0;
function railBubble(L){
  const b=$('#railBubble');
  b.textContent=L;b.classList.add('show');
  clearTimeout(_bubbleT);
  _bubbleT=setTimeout(()=>b.classList.remove('show'),750);
}
function jumpToLetter(L){
  const h=document.querySelector('.ghead[data-l="'+L+'"]');
  if(!h)return;
  h.scrollIntoView({behavior:'smooth',block:'start'});
  railBubble(L);
  sfx.click();
}
function buildRail(letters){
  const rail=$('#rail');
  rail.innerHTML='';
  const has=new Set(letters);
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('').forEach(L=>{
    const s=document.createElement('span');
    s.textContent=L;
    if(has.has(L)){s.classList.add('on');s.onclick=()=>jumpToLetter(L);}
    rail.appendChild(s);
  });
  rail.classList.toggle('hidden',!letters.length);
}
/* 滚动侦测：高亮当前字母组 */
let _spyRAF=0;
window.addEventListener('scroll',()=>{
  const rail=$('#rail');
  if(rail.classList.contains('hidden'))return;
  if(_spyRAF)return;
  _spyRAF=requestAnimationFrame(()=>{
    _spyRAF=0;
    const heads=$$('.ghead');
    let cur=heads.length?heads[0].dataset.l:null;
    heads.forEach(h=>{if(h.getBoundingClientRect().top<=96)cur=h.dataset.l;});
    $$('#rail span').forEach(s=>{
      s.classList.toggle('cur',s.classList.contains('on')&&s.textContent===cur);
    });
  });
},{passive:true});
function openClass(id){
  CUR=DB.classes.find(c=>c.id===id);
  if(!CUR)return;
  CUR._stats=null;
  $('#screenHome').classList.add('hidden');
  $('#screenClass').classList.remove('hidden');
  Scenery.show(false);                 // 班级页要看 60 张卡，收起风景以免干扰，也省投影机资源
  renderClass();
}
function backHome(){
  CUR=null;
  $('#screenClass').classList.add('hidden');
  $('#screenHome').classList.remove('hidden');
  Scenery.show(true);
  $('#rail').classList.add('hidden');
  $('#railBubble').classList.remove('show');
  renderHome();
}
function stageTagCls(t){return t>=10?'st-10':t>=7?'st-7':t>=4?'st-4':'';}
function renderClass(){
  $('#className').innerHTML=uicon('people',18)+' '+esc(CUR.name);
  const total=CUR.students.reduce((a,s)=>a+s.total,0);
  const pz=CUR.students.reduce((a,s)=>a+s.prizes.length,0);
  const ready=CUR.students.filter(s=>s.progress>=10).length;      // 运营视角：一眼看到还有几个人等着抽奖
  $('#classStats').innerHTML=uicon('people',15)+' '+CUR.students.length+' 人　'+uicon('chat',15)+' 累计答题 '+total+' 次　'+
    uicon('gift',15)+' 已抽奖 '+pz+' 次'+(ready?'　★ 待抽奖 '+ready+' 人':'');
  const grid=$('#pets');grid.innerHTML='';
  const btnSort=$('#btnSort');
  if(SORT_MODE==='surname'){
    btnSort.innerHTML=uicon('sort',15)+' 名单顺序';
    btnSort.title='当前：按姓氏首字母 A–Z 排序（点击切回名单导入顺序）';
    const list=CUR.students.slice().sort((a,b)=>{
      const ia=surnameInitial(a.name),ib=surnameInitial(b.name);
      const oa=ia==='#'?1:0,ob=ib==='#'?1:0;
      if(oa!==ob)return oa-ob;
      if(ia!==ib)return ia<ib?-1:1;
      return 0;
    });
    let curL=null,buf=[];
    const flush=()=>{
      if(!buf.length)return;
      const hd=document.createElement('div');
      hd.className='ghead';hd.dataset.l=curL;
      hd.innerHTML='<span class="gl'+(buf.length>=5?' hot':'')+'">'+curL+'</span>'+
        '<i class="gr"></i><span class="gc">'+buf.length+' 位同学</span>';
      grid.appendChild(hd);
      buf.forEach(st=>grid.appendChild(makeCard(st)));
      buf=[];
    };
    list.forEach(st=>{
      const L=surnameInitial(st.name);
      if(L!==curL){flush();curL=L;}
      buf.push(st);
    });
    flush();
    buildRail([...grid.querySelectorAll('.ghead')].map(h=>h.dataset.l));
  }else{
    btnSort.innerHTML=uicon('sort',15)+' 姓氏排序';
    btnSort.title='当前：名单导入顺序（点击切换为姓氏首字母排序）';
    CUR.students.forEach(st=>grid.appendChild(makeCard(st)));
    $('#rail').classList.add('hidden');
  }
}
$('#btnSort').onclick=()=>{
  SORT_MODE=SORT_MODE==='surname'?'roster':'surname';
  try{localStorage.setItem('pxkt_sort',SORT_MODE);}catch(e){}
  sfx.click();
  renderClass();
};
function makeCard(st){
  const el=document.createElement('div');
  el.className='card';el.dataset.id=st.id;
  el.innerHTML=
    '<div class="cheadrow"><span class="pres-chip hidden"></span><span class="stage"></span><span class="total"></span></div>'+
    '<div class="petwrap"><canvas class="pet"></canvas><canvas class="begcv"></canvas><div class="pzb"></div></div>'+
    '<div class="cname">'+nameHTML(st.name)+'</div>'+
    '<div class="bar"><i></i></div><div class="bl"></div>'+
    '<div class="cbtns"><button class="b-plus" data-act="plus">'+uicon('check',14)+'答对 +1</button>'+
    '<button class="b-undo" data-act="undo">'+uicon('undo',14)+'</button>'+
    '<button class="b-lot hidden" data-act="lot">'+uicon('gift',17)+'</button></div>';
  updateCard(st,el);
  return el;
}
function updateCard(st,el){
  el=el||document.querySelector('.card[data-id="'+st.id+'"]');
  if(!el)return;
  const t=Math.min(st.progress,10);
  const tag=el.querySelector('.stage');
  tag.textContent=(st.prestige>0?'★★★ ':'')+STAGES[t];
  tag.className='stage '+(st.prestige>0?'st-10':stageTagCls(t));
  const chip=el.querySelector('.pres-chip');
  if(chip){
    if(st.prestige>0){chip.textContent='⚡转生';chip.classList.remove('hidden');}
    else chip.classList.add('hidden');
  }
  el.classList.toggle('pr',st.prestige>0);
  el.querySelector('.total').innerHTML=uicon('chat',12)+st.total;
  const bar=el.querySelector('.bar i');
  const pct=Math.min(st.progress,10)*10;
  bar.style.width=pct+'%';
  bar.className=pct>=100?'full':'';
  const bl=el.querySelector('.bl');
  if(st.progress>=10){
    bl.textContent='可抽奖 ×'+Math.floor(st.progress/10);
    bl.className='bl go';
  }else{
    bl.textContent=Math.min(st.progress,10)+'/10';
    bl.className='bl';
  }
  const cnt=[0,0,0,0,0];st.prizes.forEach(p=>cnt[p.p]++);
  el.querySelector('.pzb').innerHTML=cnt.map((n,i)=>n?picon(i,16)+'×'+n:'').filter(Boolean).join('<br>');
  el.querySelector('.b-lot').classList.toggle('hidden',st.progress<10);
  updateActUI(st,el);
  const cv=el.querySelector('canvas.pet');
  if(!cv.style.animationDelay)cv.style.animationDelay='-'+(petSeed(st)%12*0.0917).toFixed(3)+'s'; // 浮动相位错开，全班不同步
  cv.__draw=()=>paint(cv,st,st.progress,st.prestige,3);
  cv.__draw();
}
/* 行为状态在卡片上的呈现：像素气泡「求投喂」+ 睡眠/欢呼角标 */
function updateActUI(st,el){
  const wrap=el.querySelector('.petwrap');if(!wrap)return;
  const act=petCtx(st).act;
  const cv=el.querySelector('canvas.pet');
  if(cv)cv.classList.toggle('slp',act===ACT.SLEEP);  // 上床睡觉时停止整卡浮动
  let ab=el.querySelector('.actbadge');
  const showAB=(act===ACT.SLEEP||act===ACT.SLEEPY||act===ACT.SKIP);
  if(showAB){
    if(!ab){ab=document.createElement('div');wrap.appendChild(ab);}
    ab.textContent=act===ACT.SKIP?'🎉 欢呼中':(act===ACT.SLEEP?'💤 睡大觉':'😪 犯困');
    ab.className='actbadge '+(act===ACT.SKIP?'sk':'sl');
    ab.style.display='';
  }else if(ab)ab.style.display='none';
  updateBegUI(st,el);
}
/* 「求投喂」气泡：画在绝对定位的 canvas 上，显隐只切一个 class ——
   它根本不参与排版，所以永远挤不动蛋和宠物；字是像素点阵，不会换行、更不会重复。 */
function updateBegUI(st,el){
  const bg=el.querySelector('canvas.begcv');if(!bg)return;
  let on=false;
  if(petCtx(st).act===ACT.BEG){
    if(!bg.dataset.beg){bg.dataset.beg='1';paintBeg(bg);}   // 第一次喊饿才画字，之后只切显隐（canvas 默认 300×150，不能用 width 判断）
    const top=begTop(st);                                   // 贴着自家宠物的头顶放：蛋就悬在头顶上方，大只的才压住冠一点点
    if(bg.dataset.top!==''+top){bg.dataset.top=''+top;bg.style.top=top+'px';}
    on=idleState(st,TICK%12,{act:ACT.BEG}).bubble===1;
  }
  bg.classList.toggle('on',on);
}
/* 气泡纵位：按宠物实际最高点算，绝不撞上面的阶段标签与答题计数。
   ⚠️ 必须与 drawPet 里的尺寸公式【逐字一致】——
      v6.8 改了转生蛋高(Math.max(19,B)+5)和转生体型(+6)，这里若不同步，
      「求投喂」气泡就会整体偏移压在头顶上（实测过一次）。 */
function begTop(st){
  const t=Math.min(st.progress||0,10),pr=st.prestige||0;
  let head;                                                 // 宠物最高点（逻辑像素 → 屏幕像素 ×3）
  if(t===0){
    const eh=Math.max(19,10+ (pr>0?6:0)) +5;                // ←同 drawPet
    head=(36-eh)*3;
  }else{
    let B=Math.min(27,10+Math.round(t*1.5));
    if(pr>0)B=Math.min(38,B+6);                            // ←同 drawPet
    const bh=Math.max(8,Math.round(B*(SP[st.species]?SP[st.species].hr:1)));
    head=(36-bh)*3;
  }
  return Math.max(0,Math.min(84,head-BEG_H));               // 尾巴尖正好落到头顶，上面不够就贴边
}
/* 气泡显隐跟着节拍走：每拍巡检一遍（只切 class，开销极小） */
function refreshBeg(){
  if(!CUR||!CUR.students)return;
  const grid=$('#pets');if(!grid)return;
  for(let i=0;i<grid.children.length;i++){
    const el=grid.children[i],st=findStu(el.dataset.id);
    if(st)updateBegUI(st,el);
  }
}
/* 睡眠是随时间触发的：定时巡检一次，保证角标与画面同步 */
function refreshActUI(){
  if(!CUR||!CUR.students)return;
  const sc=$('#screenClass');if(!sc||sc.classList.contains('hidden'))return;
  CUR.students.forEach(st=>{
    const el=document.querySelector('.card[data-id="'+st.id+'"]');
    if(el)updateActUI(st,el);
  });
}

/* ================= 核心动作 ================= */
function findStu(id){return CUR?CUR.students.find(s=>s.id===id):null;}
function addAnswer(st){
  const wasAsleep=(petCtx(st).act===ACT.SLEEP||petCtx(st).act===ACT.SLEEPY);
  const prev=Math.min(st.progress,10);
  st.progress++;st.total++;st.lastTs=Date.now();
  if(CUR)CUR._stats=null;                       // 班级均值失效，行为状态重算
  const cur=Math.min(st.progress,10);
  save();updateCard(st);
  const card=document.querySelector('.card[data-id="'+st.id+'"]');
  burst(card,cur>prev);
  if(cur>prev){
    sfx.evolve();
    if(card){card.classList.add('flash');setTimeout(()=>card.classList.remove('flash'),950);}
    toast('✨ '+st.name+' 进化 → '+STAGES[cur]+'！');
  }else{
    sfx.plus();
    /* 策划细节：已到究极形态却还没抽奖时，再点 +1 画面不会有任何变化，
       老师会以为没记上——必须明确告诉他"该去抽奖了"，而不是让他反复点。 */
    if(st.progress>=10)toast('🎁 '+st.name+' 已是究极形态，先去抽奖开启新一轮！',2800);
  }
  if(wasAsleep)setTimeout(()=>toast('😪 '+st.name+' 睡醒啦，精神抖擞！'),700); // 点醒睡着的宠物
  if(st.progress===10)toast('🏅 '+st.name+' 达成究极形态！可以抽奖啦',3000);
  refreshStuModal(st.id);
}
function undoAnswer(st){
  if(st.progress<=0){toast('本轮进度已为 0，没有可撤销的答题');return;}
  st.progress--;st.total--;
  if(CUR)CUR._stats=null;
  save();updateCard(st);sfx.click();
  /* 撤销是"改数据"的操作，必须给回执，否则老师不知道到底撤没撤掉 */
  toast('↩ 已撤销 '+st.name+' 的一次答题，当前累计 '+st.total+' 次');
  refreshStuModal(st.id);
}

/* ================= 学生详情 ================= */
let STU_OPEN=null;
function openStudent(st){
  STU_OPEN=st.id;
  $('#stuName').textContent=st.name;
  openModal('stuModal');          // 先开弹窗：refreshStuModal 里有"弹窗可见才刷新"的守卫，反了会导致首次打开是空白
  refreshStuModal(st.id);
}
function refreshStuModal(id){
  if(STU_OPEN!==id||$('#stuModal').classList.contains('hidden'))return;
  const st=findStu(id);if(!st)return;
  const t=Math.min(st.progress,10);
  const act=petCtx(st).act;
  $('#stuSpecies').textContent='物种：'+SP[st.species].n+' · 性格：'+PERSONA[petSeed(st)%3]+' · 状态：'+ACT_NAME[act]+(st.prestige>0?' · 已转生':'');
  $('#stuTotal').textContent=st.total;
  $('#stuStage').textContent=STAGES[t];
  $('#stuPrestige').textContent=st.prestige>0?'★★★':'—';
  $('#stuPz').textContent=st.prizes.length;
  $('#stuLot').classList.toggle('hidden',st.progress<10);
  const cv=$('#stuPet');
  cv.__draw=()=>paint(cv,st,st.progress,st.prestige,5);
  cv.__draw();
  const list=$('#stuPzList');
  if(st.prizes.length){
    list.classList.remove('hidden');
    list.innerHTML='<b>'+uicon('gift',14)+' 中奖记录</b><br>'+st.prizes.slice(-10).reverse().map(p=>picon(p.p,18)+' '+PRIZES[p.p].n+'　'+fmtTime(p.ts)).join('<br>');
  }else{list.classList.add('hidden');}
}

/* ================= 抽奖转盘 ================= */
let spinning=false;
/* WHEEL = 转盘上5 格的排列顺序。
   ⚠️ 这是**固定常量**，不随奖励设置变：槽位数量就是 5，
   老师能改的只是每格的名字/图标/配色（改的是"奖什么"，不是"谁该中"）。
   第 5 位（值 3）是「谢谢惠顾」安慰档，抽中不撒彩带、发灰色纸屑。*/
const WHEEL=[0,1,2,4,3]; // 转盘外观：五种奖励各一格（面皮/奶茶/免作业/编织挂件/谢谢惠顾）
const SEG=360/WHEEL.length; // 每格角度（5格=72°）
/* 暗概率：四档真实奖品均分（各3/14），谢谢惠顾仅1/7（不公示） */
function rollSeg(){
  if(Math.random()*7<1)return WHEEL.indexOf(3);
  const real=[0,1,2,4];
  const pz=real[Math.floor(Math.random()*real.length)];
  const cand=WHEEL.map((p,i)=>p===pz?i:-1).filter(i=>i>=0);
  return cand[Math.floor(Math.random()*cand.length)];
}

/* ---------- 奖励设置（v6.11）---------- */
/* 面板里的草稿：不直接改 PRIZES，点「保存」才提交。
   好处：老师点错了可以直接「取消」，转盘不会出现"改了一半"的尴尬状态。*/
let PZ_DRAFT=null;
/* 每一格显示的文案由它在**转盘上的第几格**决定，而不是数组下标。
   踩过的坑：一开始按 PRIZES 下标 0,1,2,3,4 排面板，但转盘顺序是 WHEEL=[0,1,2,4,3]
   —— 安慰档（index 3）在数组里排第 4，在转盘上却是第 5 格。
   老师照面板第4 行改，转盘第 5 格却没变，直接引发"设置没生效"的报障。 */
const PZ_ODDS=['3/14','3/14','3/14','3/14','1/7 · 安慰档'];
/* PZ_ROW[k] = 转盘第 k 格对应 PRIZES 的下标（与 WHEEL 严格同序，改 WHEEL 必须同步这里） */
const PZ_ROW=WHEEL.slice();
function openPzSet(){
  PZ_DRAFT=PRIZES.map(p=>({n:p.n,ic:p.ic,c:p.c}));
  renderPzSet();
  openModal('pzModal');
}
function renderPzSet(){
  const box=$('#pzRows');if(!box)return;
  box.innerHTML='';
  for(let k=0;k<PZ_ROW.length;k++){
    const i=PZ_ROW[k], d=PZ_DRAFT[i];
    const row=document.createElement('div');
    row.className='pzrow';
    row.innerHTML='<div class="no" style="background:'+d.c+'">'+(k+1)+'</div><div class="bd">'+
      '<input class="pzin" type="text" maxlength="12" value="'+esc(d.n)+'" data-i="'+i+
        '" placeholder="填写奖品名称" title="转盘第 '+(k+1)+' 格">'+
      '<div class="pzbar"><div class="pzik" data-i="'+i+'">'+piconRow(i)+
      '</div><input class="pzcol" type="color" value="'+d.c+'" data-i="'+i+'" title="转盘扇区配色"></div></div>'+
      '<div class="pzod">'+(PZ_ODDS[k]||'')+'</div>';
    box.appendChild(row);
  }
  // 名称输入
  $$('#pzRows .pzin').forEach(inp=>{
    inp.oninput=()=>{
      const i=+inp.dataset.i;
      PZ_DRAFT[i].n=inp.value;
      drawPzPreview();
    };
  });
  // 配色
  $$('#pzRows .pzcol').forEach(inp=>{
    inp.oninput=()=>{
      const i=+inp.dataset.i;
      PZ_DRAFT[i].c=inp.value;
      const no=inp.closest('.pzrow').querySelector('.no');
      if(no)no.style.background=inp.value;
      drawPzPreview();
    };
  });
  // 图标点选
  $$('#pzRows .pzik button').forEach(btn=>{
    btn.onclick=()=>{
      const i=+btn.dataset.i;
      PZ_DRAFT[i].ic=+btn.dataset.k;
      PZ_DRAFT[i].c=PRIZE_DEFAULTS[i].c;   // 换图标时回到该槽位默认配色，避免图标与扇区色打架
      renderPzSet();
    };
  });
  drawPzPreview();
}
/* 图标选择器的一行10 个按钮 */
function piconRow(i){
  let h='';
  for(let k=0;k<PZ_POOL_N;k++){
    h+='<button type="button" data-i="'+i+'" data-k="'+k+'" class="'+(PZ_DRAFT[i].ic===k?'on':'')+
       '" title="图标 '+(k+1)+'">'+piconRaw(k,20)+'</button>';
  }
  return h;
}
/* 设置面板里的迷你转盘预览：老师改名字/图标/颜色时实时看到转盘长什么样。
   复用 drawWheel 的画法，但读 PZ_DRAFT 而不是 PRIZES —— 所以取消后主转盘不受影响。*/
function drawPzPreview(){
  const cv=$('#pzPrev');if(!cv||!PZ_DRAFT)return;
  const g=cv.getContext('2d'), c=80;
  g.clearRect(0,0,160,160);
  g.save();g.translate(c,c);
  for(let k=0;k<PZ_ROW.length;k++){
    const d=PZ_DRAFT[PZ_ROW[k]];
    const a0=(k*SEG-90)*Math.PI/180,a1=((k+1)*SEG-90)*Math.PI/180;
    g.beginPath();g.moveTo(0,0);g.arc(0,0,72,a0,a1);g.closePath();
    g.fillStyle=d.c;g.fill();
    g.strokeStyle='#fffdf6';g.lineWidth=2;g.stroke();
    const am=(a0+a1)/2;
    g.save();g.rotate(am);g.translate(52,0);g.rotate(Math.PI/2);
    g.imageSmoothingEnabled=false;
    g.drawImage(PRIZE_ICONCV[d.ic],-8,-17,16,16);
    g.restore();
  }
  g.restore();
  g.beginPath();g.arc(c,c,15,0,7);
  g.fillStyle='#fffdf6';g.fill();g.lineWidth=2;g.strokeStyle='#33333d';g.stroke();
  g.font='bold 13px sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='#ffc53d';g.fillText('★',c,c+1);
}
/* 纯图标（按图标池下标取，不看奖品槽位）—— 设置面板的图标选择器要用它，
   不能用 picon(i,px)：那个读的是 PRIZES[i].ic，会被老师刚改的值污染。*/
function piconRaw(k,px){
  return '<img class="picon" src="'+PRIZE_ICONS[k]+'" style="width:'+px+'px;height:'+px+'px" alt="">';
}
function savePzSet(){
  for(let i=0;i<PRIZES.length;i++){
    const d=PZ_DRAFT[i];
    PRIZES[i].n=d.n.trim().slice(0,12)||PRIZE_DEFAULTS[i].n;
    PRIZES[i].ic=d.ic;
    PRIZES[i].c=d.c;
  }
  DB.settings.prizes=PRIZES.map(p=>({n:p.n,ic:p.ic,c:p.c}));
  save();
  refreshPzUI();
  closeModal('pzModal');
  toast('🎁 奖励已更新：'+[0,1,2,4].map(i=>PRIZES[i].n).join(' / '));
}
function resetPzSet(){
  PRIZES.forEach((p,i)=>{p.n=PRIZE_DEFAULTS[i].n;p.ic=PRIZE_DEFAULTS[i].ic;p.c=PRIZE_DEFAULTS[i].c;});
  DB.settings.prizes=null;
  save();
  PZ_DRAFT=PRIZES.map(p=>({n:p.n,ic:p.ic,c:p.c}));
  renderPzSet();
  refreshPzUI();
  toast('已恢复出厂默认奖励');
}
/* ---- 首页「神秘大奖」占位：故意只给三枚问号，不写奖品名 ----
   【为什么不写真名】首页横幅是学生每天第一眼看到的东西。
   一旦把"面皮 / 奶茶 / 免作业"直接印在上面，转盘的悬念就没了 ——
   学生还没抽奖就已经知道奖池里有什么，动机从"想试试手气"变成"反正会中xx"。
   改成问号后，"到底能抽到什么"重新变成一个未知的期待，这是转盘存在的意义。
   【关键】这里【写死问号】，绝不能读 PRIZES 动态生成：
   老师一旦在「奖励设置」里改了名，refreshPzUI 就会把这行重刷一遍，
   问号会又变回真名 —— 悬念从后门漏掉。这里必须与 PRIZES 解耦。*/
function heroPrizeMystery(){ return '<span class="qm">？</span><span class="qm qm2">？</span><span class="qm qm3">？</span>'; }
/* 全站凡是「显示奖品」的地方都要跟着变：转盘、首页文案、卡片统计、学生详情、历史记录 */
function refreshPzUI(){
  drawWheel(0);
  if($('#heroPrizes'))$('#heroPrizes').innerHTML=heroPrizeMystery();
  if(CUR&&Array.isArray(CUR.students))CUR.students.forEach(st=>{
    const el=document.querySelector('.card[data-id="'+st.id+'"]');
    if(el)updateCard(st,el);
  });
  if(STU_OPEN)refreshStuModal(STU_OPEN);
}
function openLottery(st){
  /* 转盘尺寸随视口走：投影（≥1700）放大到 400 / 440，后排才看得清扇区里的奖品名。
     drawWheel 全部按 canvas 实际边长等比换算，所以这里改尺寸不需要动绘制代码。 */
  const WZ=window.innerWidth>=2200?440:(window.innerWidth>=1700?400:300);
  const wcv=$('#wheel');
  if(wcv&&wcv.width!==WZ){wcv.width=WZ;wcv.height=WZ;}
  const lpn=document.querySelector('#lotModal .panel');
  if(lpn)lpn.style.setProperty('--wz',WZ+'px');
  /* 转盘转到一半时允许关窗会让老师错过结果 → 转的时候拦一下并给提示 */
  const lx=$('#lotX');
  if(lx)lx.onclick=()=>{ if(spinning){toast('转盘还在转，等它停下来～');return;} closeModal('lotModal'); };
  $('#wheelBox').classList.remove('hidden');
  $('#lotResult').classList.add('hidden');
  $('#lotTip').textContent=st.name+' 的宠物已达成究极形态！转动转盘赢取大奖，抽完宠物将转生为金阙圣光形态，开启新一轮进化！';
  drawWheel(0);
  const go=$('#wheelGo');go.disabled=false;
  go.onclick=()=>{
    if(spinning)return;
    spinning=true;go.disabled=true;sfx.click();
    const seg=rollSeg();
    const target=360*5+(360-SEG/2-seg*SEG);
    const t0=performance.now(),dur=4200;
    let lastTick=-1;
    function step(now){
      const p=Math.min(1,(now-t0)/dur);
      const e=1-Math.pow(1-p,3);
      const rot=e*target;
      drawWheel(rot);
      const tk=Math.floor(rot/SEG);
      if(tk!==lastTick){lastTick=tk;sfx.tick();}
      if(p<1)requestAnimationFrame(step);
      else{spinning=false;finishLottery(st,PRIZES[WHEEL[seg]]);}
    }
    requestAnimationFrame(step);
  };
  openModal('lotModal');
}
function drawWheel(rot){
  const cv=$('#wheel');if(!cv)return;
  const g=cv.getContext('2d');
  const c=150;g.clearRect(0,0,300,300);
  g.save();g.translate(c,c);g.rotate(rot*Math.PI/180);
  for(let i=0;i<WHEEL.length;i++){
    const pz=PRIZES[WHEEL[i]];
    const a0=(i*SEG-90)*Math.PI/180,a1=((i+1)*SEG-90)*Math.PI/180;
    g.beginPath();g.moveTo(0,0);g.arc(0,0,142,a0,a1);g.closePath();
    g.fillStyle=pz.c;g.fill();
    g.strokeStyle='#fffdf6';g.lineWidth=3;g.stroke();
    const am=(a0+a1)/2;
    /* v6.18 修正：左半圈（am 在 90°~270°）的文字是倒的。
       原因：文字沿半径方向排布（rotate(am) 后再 rotate(90°)），字头方向 = (sin am, -cos am)。
       am=18°/306° 时字头朝上，可读；am=162°/234° 时字头朝下，整段字翻转 180°，
       投影上就是"倒着写的奖品名"，老师得转个头才认得出。
       修法：字头朝下时再转 180°。注意用 rotate(PI) 而不是 scale(1,-1) ——
       后者会把图标上下镜像（像素图标一镜像就认不出了），rotate(PI) 只是整体转 180°，图标仍可辨。
       阈值取 0.08 而不是 0：正上方/正下方的扇区 sin am≈0，卡在临界点上会因浮点抖动
       导致文字忽正忽反地跳。 */
    const flip=Math.sin(am)>0.08;
    g.save();g.rotate(am);g.translate(100,0);g.rotate(Math.PI/2);
    if(flip)g.rotate(Math.PI);
    g.imageSmoothingEnabled=false;
    g.drawImage(PRIZE_ICONCV[pz.ic],-12,-24,24,24);
    g.font='bold 13px "Microsoft YaHei",sans-serif';g.textAlign='center';g.textBaseline='middle';
    g.fillStyle='#fff';g.fillText(pz.n,0,14);
    g.restore();
  }
  g.restore();
  g.beginPath();g.arc(c,c,22,0,7);
  g.fillStyle='#fffdf6';g.fill();
  g.lineWidth=3;g.strokeStyle='#33333d';g.stroke();
  g.font='bold 20px sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.strokeStyle='#33333d';g.lineWidth=3;g.strokeText('★',c,c+1);
  g.fillStyle='#ffc53d';g.fillText('★',c,c+1);
}
function finishLottery(st,prize){
  st.prizes.push({p:prize.i,ts:Date.now()});
  st.progress-=10;
  st.prestige++;
  save();updateCard(st);refreshStuModal(st.id);
  $('#wheelBox').classList.add('hidden');
  const res=$('#lotResult');
  if(prize.i===3){
    sfx.sad();
    /*⚠️ 这里不能写死「试卷一张」——v6.11 起奖品名可自定义，
       老师把安慰档改成"下次再来"后，硬编码文案会和图标打架。
       一律从 PRIZES 读当前配置。 */
    res.innerHTML='<div class="big">'+picon(3,64)+'</div>'+
      '<h3>'+esc(st.name)+' 抽中「'+esc(prize.n)+'」！</h3>'+
      '<p>奖励 '+picon(3,16)+' <b style="color:#b3541e">'+esc(prize.n)+'</b>，以资鼓励！下次一定好运~'+
      '<br>宠物已转生为 <b style="color:#b3541e">金阙圣光</b> 形态，头顶升起金轮，从蛋开始新一轮养成！</p>'+
      '<div class="prow" style="justify-content:center"><button class="btn btn-coral" id="lotClose">'+uicon('star',15)+' 继续养成！</button></div>';
    confetti($('#lotModal .panel'),'#c9c2b2');
  }else{
    sfx.win();
    res.innerHTML='<div class="big">'+picon(prize.i,64)+'</div>'+
      '<h3>恭喜 '+esc(st.name)+' 抽中「'+prize.n+'」！</h3>'+
      /* v6.18 文案对齐：转生视觉早已从「彩虹流光」改成金色圣光（v6.16/6.17），
         这里却还在说虹彩星云、三色光柱、彩虹轮廓光 —— 而精灵态压根不画这几层。
         现在照实描述实际画出来的四件套：金轮 / 圣辉 / 法阵 / 金尘。 */
      '<p>宠物已转生为 <b style="color:#b3541e">金阙圣光</b> 形态'+
      '：头顶金轮 + 贴身圣辉 + 脚下金色法阵 + 上升金尘！'+
      '<br>从蛋开始新一轮养成，每 10 次答题仍可继续抽奖！</p>'+
      '<div class="prow" style="justify-content:center"><button class="btn btn-coral" id="lotClose">'+uicon('star',15)+' 继续养成！</button></div>';
    confetti($('#lotModal .panel'));
  }
  res.classList.remove('hidden');
  $('#lotClose').onclick=()=>closeModal('lotModal');
}

/* ================= 随机点名 ================= */
let pickTimer=null,PICKED=null;
/* 抽人规则（课堂公平性）：最近点过的同学进入"冷却"，不再被抽到；
   全班都轮过一遍后清空冷却，开新一轮。避免连点同一人、也避免总抽那几个。 */
function pickTarget(){
  const sts=CUR.students;
  if(!Array.isArray(CUR._pickLog))CUR._pickLog=[];
  const cool=Math.max(2,Math.min(sts.length-1,Math.round(sts.length*0.4)));  // 冷却窗口≈全班 40%
  let pool=sts.filter(s=>CUR._pickLog.indexOf(s.id)<0);
  if(!pool.length){CUR._pickLog=[];pool=sts;}                                 // 都轮过了 → 重新洗牌
  const s=pool[Math.floor(Math.random()*pool.length)];
  CUR._pickLog.push(s.id);
  while(CUR._pickLog.length>cool)CUR._pickLog.shift();
  return s;
}
function openPicker(){
  if(!CUR||!CUR.students.length){toast('请先添加学生');return;}
  $('#pickName').textContent='?';
  $('#pickName').classList.remove('done');
  $('#pickOk').disabled=true;$('#pickRe').disabled=true;
  openModal('pickModal');
  let times=0;
  function roll(){
    const s=CUR.students[Math.floor(Math.random()*CUR.students.length)];   // 滚动阶段：随机闪名字，纯表演
    $('#pickName').textContent=s.name;
    sfx.tick();
    times++;
    if(times>=22){
      const hit=pickTarget();                                              // 最终结果：走公平冷却规则
      PICKED=hit.id;
      $('#pickName').textContent=hit.name;
      $('#pickName').classList.add('done');
      $('#pickOk').disabled=false;$('#pickRe').disabled=false;
      sfx.evolve();
      return;
    }
    pickTimer=setTimeout(roll,55+times*9);
  }
  clearTimeout(pickTimer);
  pickTimer=setTimeout(roll,150);
}

/* ================= 排行榜 ================= */
function openBoard(){
  const list=$('#boardList');
  /* 名次稳定：总分 → 当前形态 → 转生 → 姓名；同分并列同名次，避免每次打开顺序乱跳 */
  const arr=[...CUR.students].sort((a,b)=>(b.total-a.total)||(b.progress-a.progress)||
    (b.prestige-a.prestige)||String(a.name).localeCompare(String(b.name),'zh'));
  if(!arr.length){list.innerHTML='<p class="sub" style="padding:20px 0;text-align:center">还没有答题记录哦</p>';}
  else{
    list.innerHTML='';
    let prev=null,rank=0;
    arr.forEach((st,i)=>{
      if(st.total!==prev){rank=i+1;prev=st.total;}
      const row=document.createElement('div');
      row.className='brow';
      const rk=rank<=3?'<div class="rk med g'+rank+'">'+rank+'</div>':'<div class="rk">'+rank+'</div>';
      row.innerHTML=rk+'<canvas></canvas>'+
        '<div class="nm">'+esc(st.name)+'<div style="font-size:11px;color:#9a8e70;font-weight:700">'+
        STAGES[Math.min(st.progress,10)]+(st.prestige>0?' · 转生':'')+
        (st.progress>=10?' · <b style="color:#b3541e">待抽奖</b>':'')+'</div></div>'+
        '<div class="dt">'+uicon('chat',13)+' '+st.total+' 次<br>'+uicon('gift',13)+' '+st.prizes.length+' 份</div>';
      const rcv=row.querySelector('canvas');
      /* 排行榜用 trim=[0,67] 裁掉底部 5 行空白：行高 144 → 134px。
         ⚠ 上界必须是 0，不能按"本体墨迹 y12 起"取 10 ——
           实测 paint() 最终画布里，转生态的【头顶金轮】会上探到 y0（本体只有 y12），
           按本体留头会把金轮切掉半边，实测出现"上留白=0 贴边"。详见 review618e_probe.js。
           倍率仍为整数 2，不产生糊边。 */
      rcv.__draw=()=>paint(rcv,st,st.progress,st.prestige,2,[0,67]);
      rcv.__draw();
      list.appendChild(row);
    });
  }
  openModal('boardModal');
}

/* ================= 备份/恢复 ================= */
function exportData(){
  DB.v=4;DB.exportedAt=new Date().toISOString();      // 备份带上版本号与时间：恢复时能告诉老师"这份是哪天存的"
  const blob=new Blob([JSON.stringify(DB)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='像素宠物班级备份-'+new Date().toISOString().slice(0,10)+'.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('📤 备份文件已下载，请妥善保存');
}
/* 运营视角：学期末/家长会要交数据 —— 一键导出成绩单（带 BOM，Excel 双击直接开） */
function exportSheet(){
  if(!CUR||!CUR.students.length){toast('班级里还没有学生');return;}
  const head=['姓名','累计答题次数','当前形态','转生次数','本轮进度','已抽奖品','最近答题日期'];
  const rows=[head];
  CUR.students.slice().sort((a,b)=>b.total-a.total).forEach(s=>{
    rows.push([s.name,s.total,STAGES[Math.min(s.progress,10)],s.prestige,
      Math.min(s.progress,10)+'/10',s.prizes.map(p=>PRIZES[p.p].n).join('、'),s.lastTs?fmtTime(s.lastTs):'']);
  });
  const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='成绩单-'+CUR.name.replace(/[\\/:*?"<>|]/g,'')+'-'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();URL.revokeObjectURL(a.href);
  toast('📄 成绩单已导出，Excel 可直接打开');
}
function importData(file){
  const rd=new FileReader();
  rd.onload=()=>{
    try{
      const data=JSON.parse(rd.result);
      if(!data||!Array.isArray(data.classes))throw 0;
      const when=data.exportedAt?new Date(data.exportedAt).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'未知时间';
      confirmBox('恢复备份','将用备份中的 '+data.classes.length+' 个班级（'+when+' 保存）覆盖当前全部数据，确定吗？',()=>{
        DB=data;if(!DB.settings)DB.settings={sound:true};
        syncPrizes();                 // v6.11：恢复备份后奖品名/图标要立刻跟着变
        save();backHome();refreshPzUI();
        toast('📥 恢复成功！共 '+data.classes.length+' 个班级');
      });
    }catch(e){toast('⚠️ 文件格式不正确');}
  };
  rd.readAsText(file);
}

/* ================= 事件绑定 & 启动 ================= */
/* 按钮图标统一注入：全部自绘像素图标，不依赖系统 emoji */
function decorateUI(){
  $('#logoIcon').innerHTML=uicon('egg',26);
  $('#btnBack').innerHTML=uicon('back',15)+' 返回';
  $('#btnAddStu').innerHTML=uicon('plus',15)+' 添加学生';
  $('#btnSort').innerHTML=uicon('sort',15)+' 姓氏排序';      // renderClass 里会按当前排序再改一次
  $('#btnPick').innerHTML=uicon('dice',15)+' 随机点名';
  $('#btnBoard').innerHTML=uicon('trophy',15)+' 排行榜';
  $('#btnSheet').innerHTML=uicon('sheet',15)+' 成绩单';
  $('#btnPzSet').innerHTML=uicon('tune',15)+' 奖励设置';
  $('#btnExport').innerHTML=uicon('expo',15)+' 备份';
  $('#btnImport').innerHTML=uicon('impo',15)+' 恢复';
  $('#stuPlus').innerHTML=uicon('check',16)+' 答对 +1';
  $('#stuUndo').innerHTML=uicon('undo',15)+' 撤销';
  $('#stuLot').innerHTML=uicon('gift',15)+' 去抽奖';
  $('#btnDemo').innerHTML=uicon('dice',15)+' 一键生成演示班级(60人)';
  $('#btnCreate').innerHTML=uicon('check',15)+' 创建班级';
  $('#btnAddStuOk').innerHTML=uicon('check',15)+' 添加';
  $('#wheelGo').innerHTML=uicon('star',15)+' 开始抽奖！';
  $('#pzSave').innerHTML=uicon('check',15)+' 保存';
  $('#pzReset').innerHTML=uicon('undo',15)+' 恢复默认';
  $('#lotSet').innerHTML=uicon('tune',14)+' 奖励设置';
  $('#pickOk').innerHTML=uicon('check',16)+' 答对 +1';
  $('#pickRe').innerHTML=uicon('dice',15)+' 再抽一个';
  /* 弹窗标题也换成自绘图标，避免 emoji 在不同电脑上变形 */
  const T=(sel,ic,txt,px)=>{const e=$(sel);if(e)e.innerHTML=uicon(ic,px||19)+' '+txt;};
  T('#lotModal h2','gift','究极形态 · 幸运大转盘',20);
  T('#pzModal h2','tune','奖励设置');
  T('#pickModal h2','dice','幸运抽问',20);
  T('#boardModal h2','trophy','养成排行榜',20);
  T('#createModal h2','plus','新建班级');
  T('#addStuModal h2','plus','添加学生');
  T('#screenHome .sec-title','people','选择班级');
  setSoundBtn();
}
function setSoundBtn(){$('#btnSound').innerHTML=uicon(SOUND?'snd':'mute',15)+' '+(SOUND?'音效开':'音效关');}
/* 首页风景开关：老投影机扛不住动效时，老师一点就能关（状态记在本机） */
function setSceneBtn(on){$('#btnScene').innerHTML=uicon(on?'scene':'sceneoff',15)+' '+(on?'风景开':'风景关');}
function setBgBtn(on){$('#btnBg').innerHTML=(on?'🖼':'🚫')+' '+(on?'背景开':'背景关');}
function bind(){
  $$('.xclose,[data-x]').forEach(b=>b.onclick=()=>closeModal(b.dataset.x));
  $('#btnBack').onclick=backHome;
  $('#btnSheet').onclick=exportSheet;
  $('#btnSound').onclick=()=>{
    SOUND=!SOUND;save();setSoundBtn();
    if(SOUND)sfx.click();
  };
  $('#btnExport').onclick=exportData;
  $('#btnPzSet').onclick=openPzSet;
  $('#pzSave').onclick=savePzSet;
  $('#pzReset').onclick=resetPzSet;
  /* 转盘弹窗里也放一个入口：老师往往是抽到一半发现奖品名不对，当场改比切页面快。
     pzModal 在 lotModal 之后（DOM 同层级 z-index:100），天然盖在上面；
     关掉设置后 lotModal 仍开着，转盘会带着新名字重绘（refreshPzUI 里已调 drawWheel）。*/
  $('#lotSet').onclick=openPzSet;
  $('#btnImport').onclick=()=>$('#importFile').click();
  $('#importFile').onchange=e=>{
    if(e.target.files[0])importData(e.target.files[0]);
    e.target.value='';
  };
  $('#btnAddStu').onclick=()=>{$('#inpNames2').value='';openModal('addStuModal');};
  $('#btnPick').onclick=openPicker;
  $('#btnBoard').onclick=openBoard;
  $('#btnCreate').onclick=()=>{
    const name=$('#inpClassName').value.trim();
    const names=parseNames($('#inpNames').value);
    if(!name){toast('请填写班级名称');return;}
    if(!names.length){toast('请导入学生名单（每行一个名字）');return;}
    const id=uid();
    DB.classes.push({id,name,created:Date.now(),students:makeStudents(names,id)});
    save();closeModal('createModal');
    toast('🎉 班级创建成功！'+names.length+' 只宠物已孵化');
    openClass(id);
  };
  $('#btnDemo').onclick=()=>{
    const id=uid();
    DB.classes.push({id,name:'演示班级',created:Date.now(),students:makeStudents(demoNames(60),id)});
    save();closeModal('createModal');
    toast('🎉 演示班级已生成，60 只宠物闪亮登场！');
    openClass(id);
  };
  $('#btnAddStuOk').onclick=()=>{
    const names=parseNames($('#inpNames2').value);
    if(!names.length){toast('请输入学生名单');return;}
    CUR.students.push(...makeStudents(names,CUR.id));
    save();closeModal('addStuModal');renderClass();
    toast('✅ 已添加 '+names.length+' 名学生');
  };
  $('#pets').addEventListener('click',e=>{
    const card=e.target.closest('.card');
    if(!card||!CUR)return;
    const st=findStu(card.dataset.id);if(!st)return;
    const b=e.target.closest('button');
    if(!b){openStudent(st);return;}
    const act=b.dataset.act;
    if(act==='plus')addAnswer(st);
    else if(act==='undo')undoAnswer(st);
    else if(act==='lot')openLottery(st);
  });
  $('#stuPlus').onclick=()=>{const st=findStu(STU_OPEN);if(st)addAnswer(st);};
  $('#stuUndo').onclick=()=>{const st=findStu(STU_OPEN);if(st)undoAnswer(st);};
  $('#stuLot').onclick=()=>{const st=findStu(STU_OPEN);if(st){closeModal('stuModal');openLottery(st);}};
  $('#pickOk').onclick=()=>{
    const st=findStu(PICKED);
    if(st){
      addAnswer(st);
      closeModal('pickModal');
      /* 策划细节：点名加分后镜头摇到该生卡片并闪光，全班一眼锁定 */
      const card=document.querySelector('.card[data-id="'+st.id+'"]');
      if(card){
        card.scrollIntoView({behavior:'smooth',block:'center'});
        card.classList.add('flash');
        setTimeout(()=>card.classList.remove('flash'),950);
      }
    }
  };
  $('#pickRe').onclick=()=>openPicker();
  $('#cfOk').onclick=()=>{closeModal('confirmModal');if(CF_CB)CF_CB();};
}
load();
buildAtlas();          // 启动即把 155 张精灵图解码进 atlas（异步完成后自动清缓存重绘）
decorateUI();
/* syncPrizes() 已在 load() 内跑过（备份恢复也要用，这里不重复） */
$('#heroPrizes').innerHTML=heroPrizeMystery();
/* v6.11：45 种已全部接入进化线，这里动态统计，避免文案和真实数据脱节 */
(function(){
  var el=$('#evoCount');if(!el)return;
  var n=0,keys={};
  for(var i=0;i<SP.length;i++){var k=EVO_OF[SP[i].id];if(k&&!keys[k]){keys[k]=1;n++;}}
  el.textContent='共 '+n+' 条进化线、每条 5 个形态，进（第10 题）就是究极体。';
})();
renderHome();
bind();
let heroCount=0;
let actCount=0;
setInterval(()=>{
  TICK++;FRAME=TICK&1;
  $$('canvas.pet').forEach(cv=>cv.__draw&&cv.__draw());
  refreshBeg();                                    // 求投喂气泡：每拍按节拍显隐
  heroCount++;
  if(heroCount%2===0)heroLoop();
  if(++actCount>=18){actCount=0;refreshActUI();}   // 约每 10 秒巡检一次行为状态（睡眠随时间触发）
},560);
/* ==========================================================================
   首页动态像素风景（纯自绘 · 无外部资源 · 投影机友好）
   --------------------------------------------------------------------------
   【美术方案】宽幅单屏 / 横向三段式构图：
     上层 天空：13 段离散色带 + 1px 棋盘抖动过渡（拒绝 CSS 渐变的糊）、暖阳 + 扩散光环
     中层 远景：三层视差山峦 → 山脚针叶林带（原来这里有一圈湖，删了：水波纹在小尺寸下
               会被看成"看不懂的小方块"，付出的辨识成本远大于美感收益）
     下层 前景：木屋（屋檐挑出 / 烟囱炊烟 / 双窗暖灯呼吸 / 门前小路 / 柴堆花盆）
               大树（树冠随风摆动）+ 灌木丛、云影、草浪、圆瓣野花
     收尾：全幅统一米黄水洗 + 竖向渐隐，保证卡片文字对比度
   【构图铁律】一切"能被人认出来的主体"（屋子 / 大树 / 太阳）只允许摆在
       #screenHome 内容卡两侧的"掩体带"里——那是首页唯一永远不被卡片压住的地方；
       带子宽度由 bandCols() 实测得出，景物尺寸随之自适应，宁可画小，绝不被卡片劈成两半。
       地平线则钉死在 hero 卡片下沿之下（horRow()），山脚、村口一律不越界。
   【性能】静态层预烘焙成两张离屏图，云与树冠各缓存成小图整体位移；
          每帧 = 2 次 blit + 约 300 个 1px 矩形，锁 20fps，切页/后台即停。
   ========================================================================== */
const Scenery=(function(){
  let cv=null,g=null,wrapEl=null,skyC=null,landC=null;
  let W=0,H=0,VH=0,PAD=0,FAR=0,HILLY=0,GND=0,FG=0,PIX=5;
  let BW=0,TSC=1,HOUSE_OK=true;                        /* 屋子宽度随"掩体带"自适应；带子太窄就不画房子 */
  let raf=0,last=0,TK=0,off=0,tOff=0,live=false,rt=null,onHome=true;
  let pref=(localStorage.getItem('pxkt_scene')||'1')!=='0';   /* 运营开关：老投影上一键关动效 */
  /* 背景图开关与"风景动效"开关分开存。
     踩坑记录：原先 has-bgpic 跟着 pref 走，而 pref 存在 pxkt_scene。一旦用户（或旧版）
     点过"风景关"，pxkt_scene='0' 会永久留在 localStorage 里 —— 升级到新版后背景图
     永远不加载，且没有任何报错，极难排查。静态底图是自己的东西，必须独立。 */
  let bgOn=(localStorage.getItem('pxkt_bgpic')||'1')!=='0';
  const rnd=rng(20261003);
  const CLOUD=[],BIRD=[],SMOKE=[],TREE=[],FLOWER=[],BLADE=[];
  let HOUSE={win:[],sunX:0,sunY:0,sunR:4,smokeX:0,smokeY:0,x:0,y:0,w:0,h:0,bottom:0,cx:0};
  const STEP=50;                                       /* 20fps：像素动画的黄金帧率 */
  const REDUCED=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function hx(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
  function mix(a,b,t){const A=hx(a),B=hx(b);t=t<0?0:t>1?1:t;
    return 'rgb('+Math.round(A[0]+(B[0]-A[0])*t)+','+Math.round(A[1]+(B[1]-A[1])*t)+','+Math.round(A[2]+(B[2]-A[2])*t)+')';}
  function offc(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));
    c.height=Math.max(1,Math.round(h));const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x];}

  /* —— 地平线所在行：必须落在 hero 卡片下沿之下 ——
     hero 卡片横跨首屏中部，地平线要是压进卡片里，山脚、村口就会从卡片两侧各露出半截碎块，
     老师看到的就是"一堆看不懂的方块"。所以按 hero 的真实底边来定山脚线（字体加载后还会再校一次）。 */
  function horRow(){
    const ch=Math.max(360,window.innerHeight);
    let horPx=ch*0.36;
    const hz=document.querySelector('#screenHome .hero');
    if(hz&&hz.offsetParent!==null){
      const rb=hz.getBoundingClientRect().bottom+(window.scrollY||0);
      if(rb>ch*0.12)horPx=rb+Math.max(6,Math.max(4,Math.min(8,Math.round(ch*0.008))));
    }
    return Math.max(Math.round(VH*0.24),Math.min(Math.round(VH*0.58),Math.round(horPx/PIX)));
  }

  /* ---------- 尺寸：逻辑像素固定 ~5 CSS px，保证任何屏幕颗粒大小一致 ---------- */
  function measure(){
    const cw=Math.max(320,window.innerWidth),ch=Math.max(360,window.innerHeight);
    /* PIX 连续取值，不再是 6/5/4 三档跳变。
       原来的分档有个隐蔽问题：从 900 拉到 2560 时 PIX 从 6 跳到 5，
       景物的颗粒大小和整体密度会突变一次，视觉上像"换了张背景"。
       现在按对数插值，小屏仍然粗（大景物更清楚），大屏自动变细，跨档平滑。 */
    PIX=Math.max(4,Math.min(8,Math.round(4+2*Math.log2(cw/560))));
    /* 逻辑宽度上限跟着视口走。原来写死 Math.min(520, ...)，
       大屏上画布按 520 逻辑像素被拉伸到 2500+px 宽 —— 背景图 cover 时
       用的宽高比和真实视口不符，宝可梦被拉变形、木屋缩在角落。
       关键：让逻辑宽高比尽量接近真实视口宽高比，cover 出来的形变才最小。
       640是"逻辑宽上限"：再大就纯属浪费 CPU（每帧要重画几十万像素），够了。 */
    W=Math.max(84,Math.min(640,Math.round(cw/PIX)));
    VH=Math.round(ch/PIX);
    PAD=Math.max(14,Math.round(VH*0.16));              /* 底部冗余行：留给滚动视差 */
    H=VH+PAD;
    FAR=horRow();
    HILLY=FAR+Math.max(5,Math.round(VH*0.055));        /* 山脚树林线 */
    GND=HILLY+Math.max(5,Math.round(VH*0.05));         /* 草地平台：屋子站在这一线 */
    FG=GND+Math.max(10,Math.round(VH*0.15));           /* 前景草带：叶子只长在画面最下沿，铺满整片草地会显得脏 */
    /* —— 屋子：宽度跟着"掩体带"走，带子窄就整体等比缩小，绝不让卡片劈掉半边 —— */
    const bnd=bandCols();
    /* 减 8 列：给左右挑出的屋檐和贴边余量留地方——不然 1366 上屋檐会被屏幕边切掉 */
    BW=Math.min(Math.round(VH*0.26),Math.max(0,bnd-9));
    HOUSE_OK=BW>=11;                                   /* 带子太窄就别画：半截房子比没有房子更糟 */
    TSC=HOUSE_OK?Math.max(0.55,Math.min(1.15,BW/46)):0.70;
  }
  /* 首页内容区左右两侧永远露出来的"掩体带"宽度（逻辑列）：
     主体景物按这个宽度对中摆放，宽屏左右各一大块，1366 窄屏也能卡得下 */
  function bandCols(){
    const css=Math.max(320,window.innerWidth);
    const box=Math.min(1080,css-36)+36;              /* #screenHome 外框实际宽（1080 内容 + 左右各 18 内边距） */
    return Math.max(0,Math.round((css-box)/2/PIX));  /* 卡片两侧"真正露得出来"的列数：这才是掩体带 */
  }
  /* 锚点返回"中心列"，保证整件景物都落在带子里——宽屏自动变大，窄屏自动收小，
     带子彻底没有（1024 老投影）时退到边缘，绝不压在文字上 */
  function anchorL(hw){
    const b=bandCols(),c=Math.round(b*0.5);
    return Math.round(Math.min(W*0.15,Math.max(hw+4,c)));   /* +4：屋檐/树冠的横向余量，顺带把屋子推到带子正中 */
  }
  function anchorR(hw){
    const b=bandCols(),c=Math.round(b*0.5);
    return Math.round(W-Math.min(W*0.15,Math.max(hw+4,c)));
  }

  /* ---------- 山峰轮廓：低频大峰 + 高频小起伏，注意取绝对值才出"峰" ---------- */
  function ridgeTop(ph,amp,fq){
    const a=new Array(W);
    fq=fq||0.019;
    for(let i=0;i<W;i++){
      const s=Math.abs(Math.sin(i*fq+ph)*0.66+Math.sin(i*fq*1.9+ph*1.7)*0.22+Math.sin(i*fq*0.42+ph*0.6)*0.42);
      a[i]=-Math.round(Math.min(1.18,s)*amp);
    }
    return a;
  }
  function ridge(x,a,baseY,col,topCol){
    for(let i=0;i<W;i++){
      const dy=-a[i];if(dy<=0)continue;
      R(x,i,baseY-dy,1,dy,col);
      R(x,i,baseY-dy,1,Math.min(3,dy),topCol);
    }
  }
  /* 远岸针叶林：间距和高度都随机，成排就成"篱笆"了 */
  function treeLine(x,a,baseY){
    let i=2;
    while(i<W){
      const top=baseY+a[i];
      const hh=Math.max(4,Math.round(VH*0.028))+Math.round(rnd()*3);
      triUp(x,i,top-hh+1,Math.max(4,Math.round(hh*0.88)),hh,'#4d8a5b');
      i+=5+Math.round(rnd()*10);                     /* 间距拉大：排太密就成了一道锯齿篱笆 */
    }
  }

  /* ---------- 静态层①：天空 ---------- */
  const SSTP=[[0,'#5f9fd8'],[.30,'#8abde4'],[.55,'#bcd9f0'],[.72,'#f4e2c4'],[.88,'#ffd49c'],[1,'#ffca90']];
  function skyAt(t){
    for(let i=0;i<SSTP.length-1;i++){
      if(t<=SSTP[i+1][0]){
        const a=SSTP[i],b=SSTP[i+1];
        return mix(a[1],b[1],(t-a[0])/Math.max(.001,(b[0]-a[0])));
      }
    }
    return SSTP[SSTP.length-1][1];
  }
  function buildSky(){
    const [c,x]=offc(W,H);
    const N=13;
    for(let i=0;i<N;i++){
      const y0=Math.round(i*FAR/N),y1=Math.round((i+1)*FAR/N);
      const c0=skyAt(i/N),c1=skyAt((i+1)/N);
      R(x,0,y0,W,Math.max(1,y1-y0),c0);
      /* 相邻色带之间铺 3 行 1px 棋盘抖动：像素画的过渡方式，看得出格子感 */
      for(let y=Math.max(0,y1-3);y<y1;y++)
        for(let px=0;px<W;px++)if(((px+y)&1)===0)R(x,px,y,1,1,c1);
    }
    /* 太阳放在右侧掩体带正中：整颗都在带子里，既不被卡片压住，也不会只剩半个 */
    const b=bandCols();
    const sx=Math.round(W-Math.max(8,Math.min(b*0.46,W*0.12))),sy=Math.round(VH*0.14);
    const sr=Math.max(4,Math.min(Math.round(Math.max(3,b)*0.30),Math.round(VH*0.046)));
    HOUSE.sunX=sx;HOUSE.sunY=sy;HOUSE.sunR=sr;
    /* 光环用棋盘抖动的稀疏像素铺开：比实心圆盘更像像素画里的"晨光" */
    for(let r=sr+2;r<sr+10;r++){
      const dens=1-(r-sr-2)/9;
      for(let a=0;a<72;a++){
        const th=a/72*Math.PI*2;
        const px=Math.round(sx+Math.cos(th)*r),py=Math.round(sy+Math.sin(th)*r);
        if(((px+py)&1)===0&&rnd()<dens)R(x,px,py,1,1,r>=sr+5?'#ffe3a6':'#ffedbe');
      }
    }
    ER(x,sx,sy,sr+2,sr+2,'#ffe9ac');ER(x,sx,sy,sr,sr,'#fff6d2');ER(x,sx,sy,Math.max(2,sr-1),Math.max(2,sr-1),'#fffdf0');
    return c;
  }

  /* ---------- 静态层②：山 / 湖 / 地 / 树身 / 木屋 ---------- */
  function buildTree(x,bx,sc,isStatic,lift){
    sc=sc*TSC;                                                     /* 树跟屋子一起缩放，比例才协调 */
    const base=GND+Math.round(VH*0.02*sc)-(lift||0);              /* lift：中景树站得更高，靠基线差异做纵深 */
    const tw=Math.max(3,Math.round(VH*0.022*sc));
    const th=Math.max(7,Math.round(VH*0.13*sc));
    const cr=Math.max(4,Math.round(VH*0.055*sc));
    const T={x:bx,base:base,tw:tw,th:th,cr:cr,ph:Math.round(rnd()*10),static:!!isStatic};
    T.B=Math.round(cr*2.8);
    T.yc=base-th-Math.round(cr*0.35);                              /* 树冠中心 */
    /* 树干 + 受光面 + 两根枝杈 */
    R(x,bx-Math.round(tw/2),base-th,tw,th,'#8a5f3a');
    R(x,bx-Math.round(tw/2),base-th,Math.max(1,Math.round(tw*0.34)),th,'#a8764a');
    R(x,bx-Math.round(tw/2),base-1,tw,1,'#6f4a2c');
    R(x,bx-Math.round(tw/2)-2,base-th+2,2,1,'#8a5f3a');
    R(x,bx+Math.round(tw/2),base-th+4,2,1,'#8a5f3a');
    ER(x,bx,base+1,Math.max(3,Math.round(cr*0.9)),2,'#4d9455');   /* 树根草影 */
    return T;
  }
  /* 三层叶球（暗底 → 中间色 → 左上高光），像素画的"体积"就靠这三巴掌 */
  function crownAt(ctx,cx,cy,cr){
    const L=[[-cr*0.62,cr*0.10,cr*0.78],[cr*0.62,cr*0.10,cr*0.78],[0,-cr*0.40,cr*1.02]];
    L.forEach(o=>ER(ctx,Math.round(cx+o[0]),Math.round(cy+o[1]),o[2],o[2]*0.82,'#3f8f5c'));
    L.forEach(o=>ER(ctx,Math.round(cx+o[0]),Math.round(cy+o[1]-1),o[2],o[2]*0.74,'#57ab6e'));
    L.forEach(o=>ER(ctx,Math.round(cx+o[0]-o[2]*0.3),Math.round(cy+o[1]-o[2]*0.32),Math.max(2,o[2]*0.48),Math.max(2,o[2]*0.36),'#7cc98a'));
  }
  function buildHouse(x,bx){
    /* 尺寸全部按 bw 等比走：掩体带多宽，屋子就多大——绝不越过卡片去要空间 */
    const bw=BW;
    const wallH=Math.max(7,Math.round(bw*0.50));
    const roofH=Math.max(6,Math.round(bw*0.38));
    /* 屋基线：站在草地上，同时保证整个屋顶都落在 hero 卡片下沿之下（不会再被字压住） */
    const baseY=Math.max(GND,HILLY+Math.round(Math.max(2,VH*0.02))+wallH+roofH);
    const cy=baseY-wallH;
    const cx=bx+Math.round(bw/2);
    const apexY=cy-roofH;
    HOUSE.x=bx;HOUSE.y=cy;HOUSE.w=bw;HOUSE.h=wallH;HOUSE.bottom=baseY;HOUSE.cx=cx;
    /* 墙体：奶油黄 + 右侧暗面 + 横向板缝 */
    R(x,bx,cy,bw,wallH,'#f3ddb0');
    R(x,bx+bw-2,cy,2,wallH,'#d9ba85');
    if(wallH>=13){                                       /* 小屋身不画板缝：墙面本来就没几行，再切就只剩缝 */
      const stp=Math.max(3,Math.round(wallH/4));
      for(let i=1;i<wallH;i+=stp)R(x,bx,cy+i,bw,1,'#e7cd97');
    }
    R(x,bx,cy,bw,1,'#e8cf9c');
    R(x,bx,baseY-1,bw,1,'#c8a878');
    /* 屋顶：逐行变宽的三角形 + 受光面 + 瓦楞 + 挑出的屋檐 */
    const ov=Math.max(2,Math.round(bw*0.13));
    const rw=bw+ov*2,rx=bx-ov;
    for(let i=0;i<roofH;i++){
      const hw=Math.max(1,Math.round(rw/2*(i+1)/roofH));
      R(x,cx-hw,apexY+i,hw*2,1,(i%3===2)?'#c85f34':'#e06a3c');
      R(x,cx-hw,apexY+i,Math.max(1,Math.round(hw*0.55)),1,(i%3===2)?'#dd7b4c':'#ff8f60');
    }
    R(x,rx,cy-1,rw,2,'#a94a26');
    R(x,cx-1,apexY,2,1,'#ffb489');
    /* 烟囱（画在屋顶之上，从坡面探出） */
    const chw=Math.max(3,Math.round(bw*0.13));
    const chx=bx+Math.round(bw*0.70);
    const chH=Math.max(5,Math.round(bw*0.19));
    const chB=cy-Math.max(1,Math.round(roofH*0.34));
    R(x,chx,chB-chH,chw,chH+3,'#b0603a');
    R(x,chx,chB-chH,chw,2,'#c9713f');
    R(x,chx+chw-1,chB-chH,1,chH+3,'#8e4b2e');
    R(x,chx,chB-chH,chw,1,'#e0a06a');
    R(x,chx,chB-chH+3,chw,1,'#94502f');
    HOUSE.smokeX=chx+Math.round(chw/2);HOUSE.smokeY=chB-chH-1;
    /* 门 */
    const dw=Math.max(4,Math.round(bw*0.22)),dh=Math.max(6,Math.round(wallH*0.62));
    const dx=cx-Math.round(dw/2);
    const dy=baseY-dh;
    R(x,dx,dy,dw,dh,'#a9703c');
    R(x,dx,dy,1,dh,'#c08a52');R(x,dx+dw-1,dy,1,dh,'#7a4a28');R(x,dx,dy,dw,1,'#8a5b2e');
    if(dh>=6)for(let i=2;i<dh;i+=Math.max(2,Math.round(dh/3)))R(x,dx+1,dy+i,Math.max(1,dw-2),1,'#9a6534');
    R(x,dx+dw-2,dy+Math.round(dh*0.55),1,1,'#ffc53d');
    R(x,dx-1,baseY-1,dw+2,2,'#8a5b2e');
    /* 两扇窗（玻璃区每帧重绘：里面是"家里亮着的灯"） */
    HOUSE.win=[];
    const winW=Math.max(3,Math.round(bw*0.19)),winH=Math.max(3,Math.round(wallH*0.42));
    /* 小屋身只放一扇窗：硬塞两扇会把整面墙吃光，只剩门窗框，看着像一堆格子 */
    const wfx=bw>=22?[0.09,0.66]:[0.70];
    wfx.map(f=>[bx+Math.round(bw*f),cy+Math.round(wallH*0.17)]).forEach(p=>{
      const wx=p[0],wy=p[1];
      R(x,wx-1,wy-1,winW+2,winH+2,'#7a4a28');
      R(x,wx,wy,winW,winH,'#cfe3f2');
      HOUSE.win.push({x:wx,y:wy,w:winW,h:winH});
    });
    /* 生活细节：门口柴堆 + 窗台花盆 */
    const sx0=bx+bw+Math.max(1,Math.round(bw*0.04));
    R(x,sx0,baseY-3,Math.max(3,Math.round(bw*0.13)),3,'#8a5f3a');
    R(x,sx0,baseY-6,Math.max(3,Math.round(bw*0.13)),3,'#9a6f45');
    R(x,sx0+1,baseY-5,1,1,'#e0bd8c');
    R(x,sx0+1,baseY-8,1,1,'#ff8a5c');R(x,sx0+3,baseY-9,1,1,'#ff8a5c');
    R(x,HOUSE.win[0].x-1,HOUSE.win[0].y+winH,winW+2,2,'#8a5b2e');
    R(x,HOUSE.win[0].x,HOUSE.win[0].y+winH-2,Math.max(1,winW),2,'#e8744f');
    return HOUSE;
  }
  function buildLand(){
    const [c,x]=offc(W,H);
    /* 远山三层。频率是关键：原来 fq 只有 0.0105，一个周期比屏幕还宽 → 山脊成了一条平缓的弧线，
       看着像"几层横向的水面带"（老师第一眼就把它当成水）。现在提高频率、加足高度，
       每个周期只占屏幕的 1/2~1/3，层层叠出真正的山脉轮廓 */
    ridge(x,ridgeTop(1.3,VH*0.165,0.0225),FAR+1,'#8dabc7','#b2c9de');
    ridge(x,ridgeTop(3.4,VH*0.122,0.0330),FAR+1,'#7b99b9','#9bb5cd');
    ridge(x,ridgeTop(5.2,VH*0.086,0.0490),FAR+1,'#6787a6','#829ab5');
    /* 草地：必须从地平线 FAR 就开始铺，一路到画布底。
       原来湖的那一段被删掉之后，如果草地还从山脚 HILLY 起铺，FAR~HILLY 之间就会漏出
       整行透明（露纸色、出现一条横带）——删除水面时最容易踩的坑 */
    for(let r=0;r<H-FAR;r++){
      const t=Math.min(1,r/Math.max(1,H-FAR-1));
      const cA=mix('#7fc381','#64ae6a',t),cB=mix('#8acb89','#6cb571',t);
      for(let px=0;px<W;px++){
        const v=Math.sin(px*0.041+r*0.023)+Math.sin(px*0.017-r*0.036)+Math.sin(px*0.073+r*0.011);
        R(x,px,FAR+r,1,1,v>0.62?cB:cA);
      }
    }
    /* 山脚针叶林带：画在草地之上，把远山和近草缝在一起，一眼能看懂这是山脚 */
    const hl=ridgeTop(2.6,Math.max(4,Math.round(VH*0.055)),0.030);
    ridge(x,hl,HILLY,'#6fae7c','#8cc48f');
    treeLine(x,hl,HILLY);
    R(x,0,HILLY,W,1,'#a2d8a3');                                   /* 山脚亮草线，跟树林咬合住 */
    R(x,0,HILLY+1,W,1,'#93d094');
    /* 云影：天上那几朵云落在草地上的影子，就靠它把一大片绿"呼吸"起来 */
    for(let i=0;i<3;i++){
      const px=Math.round(W*(0.12+rnd()*0.72)),py=HILLY+Math.round((H-HILLY)*(0.22+rnd()*0.52));
      ER(x,px,py,Math.round(W*(0.10+rnd()*0.06)),Math.max(3,Math.round(VH*0.042)),'rgba(34,84,50,0.055)');
      ER(x,px+Math.round(W*0.07),py+Math.round(VH*0.018),Math.round(W*(0.06+rnd()*0.05)),Math.max(2,Math.round(VH*0.030)),'rgba(34,84,50,0.045)');
    }
    for(let i=0;i<Math.round(W*1.5);i++){                          /* 草地质感斑点：只差一档，不许跳出来 */
      const px=Math.round(rnd()*W),py=HILLY+Math.round(rnd()*(H-HILLY));
      R(x,px,py,1,1,rnd()<0.5?'#8ecb8c':'#579a5e');
    }
    /* 近景压暗：画面最下面一条缓缓收深，把视线从"一大片绿"里收住 */
    const d0=Math.round(VH*0.74);
    for(let r=d0;r<H;r++){
      const a=(r-d0)/Math.max(1,H-d0);
      R(x,0,r,W,1,'rgba(30,78,46,'+(a*0.24).toFixed(3)+')');
    }
    /* 灌木丛：只留"一眼认得出是灌木"的圆叶团；草垛、石头、零散碎点全删——
       草地上孤零零的小方块在投影上最难辨认，纯属噪音（老师反馈的"看不懂的方块"） */
    for(let i=0;i<7;i++){
      const px=Math.round(W*(0.04+rnd()*0.92));
      const py=GND+Math.round(rnd()*Math.max(4,(H-GND)*0.72));
      const s=Math.max(4,Math.round(VH*0.036));
      ER(x,px,py+1,Math.round(s*1.20),Math.round(s*0.66),'#3f8f5c');
      ER(x,px,py,Math.round(s*1.00),Math.round(s*0.54),'#57ab6e');
      ER(x,px-Math.round(s*0.34),py-Math.round(s*0.44),Math.round(s*0.62),Math.round(s*0.40),'#7cc98a');
    }
    /* 树：只种在左右两条"掩体带"里——那是首页唯一永远露得出来的地方。
       带子窄到放不下（1280 以下）就干脆不种，免得从卡片背后透出半个树冠 */
    const bnd=bandCols();
    const HX=HOUSE_OK?anchorL(Math.round(BW/2)):anchorL(Math.round(VH*0.07));
    const RX=anchorR(Math.round(VH*0.09));
    TREE.length=0;
    const MT=Math.round(VH*0.045);                                /* 中景树抬高的量：靠基线差异做纵深 */
    const list=[];
    if(bnd>=14){
      list.push([RX,1.00,false,0]);                               /* 右带主树：和左边的屋子形成一左一右两个支点 */
      list.push([RX-Math.round(VH*0.115),0.56,false,MT]);         /* 右带陪衬树：站得更高，显得更远 */
    }
    if(HOUSE_OK)list.push([HX+Math.round(BW*0.60),0.70,true,0]);  /* 屋后那棵：树冠钉在静态层，才被屋子正确挡住 */
    list.forEach(t=>TREE.push(buildTree(x,t[0],t[1],t[2],t[3])));
    TREE.filter(T=>T.static).forEach(T=>crownAt(x,T.x,T.yc,T.cr));
    if(HOUSE_OK){
      buildHouse(x,HX-Math.round(BW/2));                          /* 传的是左边缘：锚点算的是中心列 */
      /* 屋前小路：由近及远收窄，颜色也向草色靠拢，一眼就认出"这是人家" */
      const y0=HOUSE.bottom;
      for(let r=0;r<H-y0;r++){
        const t=r/Math.max(1,H-y0-1);
        const pw=Math.max(2,Math.round(2+t*Math.min(7,W*0.020)));
        const cc=mix('#7fc381','#d2a970',Math.min(1,0.30+t*0.70));
        R(x,Math.round(HOUSE.cx+t*Math.min(7,W*0.024)-pw/2),y0+r,pw,1,cc);
      }
    }else{
      HOUSE.win=[];HOUSE.smokeX=-999;HOUSE.smokeY=-999;           /* 窄屏不画房子：也别漏出烟囱的烟 */
    }
    return c;
  }

  function buildCrowns(){
    TREE.forEach(T=>{
      if(T.static)return;                                          /* 屋后那棵已烘进静态层，别再画一遍糊在屋前 */
      const B=T.B;
      const [cc,cx2]=offc(B,B);
      const mid=Math.round(B/2),base=Math.round(B*0.72);
      crownAt(cx2,mid,base,T.cr);
      T.cv=cc;T.ph=Math.round(rnd()*12);
    });
  }

  /* ---------- 云 ---------- */
  function buildClouds(){
    CLOUD.length=0;
    for(let i=0;i<4;i++){
      const w=Math.max(18,Math.round(W*(0.09+rnd()*0.10)));
      const h=Math.max(4,Math.round(w*0.24));                      /* 压扁一点：贴地横云比"棉花糖"更耐看 */
      const [c,x]=offc(w+6,h+8);
      const puffs=2+Math.round(rnd()*2);
      for(let p=0;p<puffs;p++){
        const q=puffs>1?p/(puffs-1):0.5;
        const cxx=Math.round(w*(0.22+0.56*q));
        const rx0=Math.round(w*(0.19+rnd()*0.13));
        const ry0=Math.max(2,Math.round(h*(0.40+rnd()*0.40)));
        const byy=h+2-Math.round(rnd()*2);
        ER(x,cxx,byy,rx0,ry0,'#b3cde5');
        ER(x,cxx,byy-1,rx0,ry0,'#f2f8ff');
        ER(x,cxx,byy-1,rx0,Math.max(1,ry0-1),'#ffffff');
      }
      CLOUD.push({cv:c,x:Math.round(rnd()*(W+w)),y:Math.round(VH*(0.05+rnd()*0.14)),v:0.05+rnd()*0.09,w:w+6});
    }
  }
  /* ---------- 前景：草叶 / 野花 / 浮尘 ---------- */
  function buildFlora(){
    BLADE.length=0;FLOWER.length=0;
    const n=Math.min(120,Math.round(W/4));                          /* 草叶：只做近景一层 */
    for(let i=0;i<n;i++){
      const x0=Math.round(rnd()*W);
      const y0=FG+Math.round(rnd()*Math.max(2,H-FG));
      BLADE.push({x:x0,y:y0,h:2+Math.round(rnd()*4),c:rnd()<0.5?'#5aa464':'#4b9463',c2:'#9ad39b',ph:rnd()*6.28});
    }
    for(let i=0;i<15;i++){
      const x0=Math.round(rnd()*W);
      const y0=GND+Math.round(rnd()*Math.max(4,H-GND-2));
      const cs=['#ff9f7a','#ffd07a','#f79cc4','#e9a0d0','#a9a0f0'];   /* 柔和暖粉系：高饱和的黄/白在绿底上最像"纸片" */
      FLOWER.push({x:x0,y:y0,c:cs[Math.floor(rnd()*cs.length)],ph:rnd()*6.28});
    }
  }

  /* ================= 每帧动态 ================= */
  function drawSun(){
    const p=(TK%170)/170;
    const rr=HOUSE.sunR+3+p*Math.max(4,HOUSE.sunR*1.1);
    if(p<0.02)return;
    g.save();g.globalAlpha=Math.max(0,(1-p)*0.4);
    const cx=HOUSE.sunX,cy=HOUSE.sunY;
    for(let a=0;a<56;a++){
      const th=a/56*Math.PI*2;
      R(g,Math.round(cx+Math.cos(th)*rr),Math.round(cy+Math.sin(th)*rr),1,1,'#fff6cf');
    }
    g.restore();
  }
  function drawClouds(){
    CLOUD.forEach(c=>{
      c.x-=c.v;                                   /* 云向西飘：慢到看第二眼才发现 */
      if(c.x<-c.w){c.x=W+Math.round(rnd()*40);c.y=Math.round(VH*(0.05+rnd()*0.14));}
      g.drawImage(c.cv,Math.round(c.x),c.y);
    });
  }
  const LAMP=['#ffd75e','#ffd23f','#ffdf85','#ffe9a0'];
  function drawWindows(){
    const lv=LAMP[Math.floor(TK/12)%LAMP.length];
    HOUSE.win.forEach(w=>{
      R(g,w.x,w.y,w.w,w.h,lv);
      R(g,w.x+Math.round(w.w/2),w.y,1,w.h,'#7a4a28');
      R(g,w.x,w.y+Math.round(w.h/2),w.w,1,'#7a4a28');
    });
    /* 窗光洒到门前的草地上：把"有人在等他回家"这句话画出来 */
    g.save();g.globalAlpha=0.20;
    R(g,HOUSE.x-2,HOUSE.bottom+1,HOUSE.w+5,3,'#ffd75e');
    R(g,HOUSE.x+1,HOUSE.bottom+1,HOUSE.w-1,6,'#ffd75e');
    g.restore();
  }
  function updSmoke(){
    if(TK%4===0&&SMOKE.length<26&&HOUSE.smokeY>-100)SMOKE.push({x:HOUSE.smokeX,y:HOUSE.smokeY,t:0,life:36+Math.round(rnd()*12)});
    for(let i=SMOKE.length-1;i>=0;i--){
      const s=SMOKE[i];s.t++;s.y-=0.42;s.x+=Math.sin(s.t*0.15)*0.55;
      if(s.t>s.life||s.y<-6)SMOKE.splice(i,1);
    }
  }
  function drawSmoke(){
    const cols=['#f2f0e8','#dcd8cb','#c4bfb0','#a9a293'];
    SMOKE.forEach(s=>{
      const k=s.t/s.life,sz=1+Math.floor(k*3);
      R(g,Math.round(s.x),Math.round(s.y),sz,sz,cols[Math.min(3,Math.floor(k*4))]);
    });
  }
  function drawTrees(){
    TREE.forEach(T=>{
      if(T.static||!T.cv)return;
      const sw=Math.round(Math.sin(TK*0.055+T.ph)*1.4);           /* 整棵冠 0.5~1px 微摆 */
      g.drawImage(T.cv,T.x-Math.round(T.B/2)+sw,T.yc-Math.round(T.B*0.62));
    });
  }
  function drawGrass(){
    BLADE.forEach(b=>{
      const s=Math.round(Math.sin(TK*0.075+b.ph)*1.2);
      R(g,b.x+s,b.y-b.h,1,b.h,b.c);
      R(g,b.x+s,b.y-b.h,1,1,b.c2);
    });
  }
  function drawFlowers(){
    FLOWER.forEach(f=>{
      const s=Math.round(Math.sin(TK*0.055+f.ph)*1.2);
      const x=f.x+s,y=f.y;
      /* 圆花 + 花心 + 深绿托底 —— 方瓣花在投影上会被看成"草地上的小方块"，
         圆的一眼就是花；托底那圈深绿让花从草里"浮"出来，而不是糊在草上 */
      R(g,f.x,y-3,1,4,'#3f8550');
      ER(g,x,y-8,4,3,'#3f8550');
      ER(g,x,y-8,3,2,f.c);
      ER(g,x,y-8,1,1,'#fff3cf');
    });
  }
  function updBirds(){
    if(BIRD.length<3&&Math.random()<0.014){
      const dir=Math.random()<0.5?1:-1;
      BIRD.push({x:dir>0?-8:W+8,y:Math.round(VH*(0.075+Math.random()*0.13)),
        v:dir*(0.75+Math.random()*0.55),ph:Math.round(Math.random()*3)});
    }
    for(let i=BIRD.length-1;i>=0;i--){
      BIRD[i].x+=BIRD[i].v;
      if(BIRD[i].x<-10||BIRD[i].x>W+10)BIRD.splice(i,1);
    }
  }
  function drawBirds(){
    BIRD.forEach(b=>{
      const x=Math.round(b.x),y=Math.round(b.y+Math.sin(TK*0.1+b.ph)*1.3);
      const up=((TK>>1)+b.ph)%2===0;
      R(g,x,y,2,1,'#41506b');
      R(g,x-2,y+(up?-1:1),2,1,'#41506b');
      R(g,x+2,y+(up?-1:1),2,1,'#41506b');
    });
  }

  /* ---------- 主循环 ---------- */
  function step(){
    TK++;
    off+=(tOff-off)*0.16;                                   /* 滚动视差：缓动跟随，不跟手 */
    updSmoke();updBirds();
    g.clearRect(0,0,W,H);
    /* 天空组：位移 0.35 倍（远层慢） */
    g.save();g.translate(0,-Math.round(off*0.35));
    g.drawImage(skyC,0,0);
    drawSun();drawClouds();
    g.restore();
    /* 地面组：位移 1 倍 */
    g.save();g.translate(0,-Math.round(off));
    g.drawImage(landC,0,0);
    drawWindows();drawTrees();drawSmoke();drawGrass();drawFlowers();drawBirds();
    g.restore();
  }
  function loop(ts){
    if(!live){raf=0;return;}
    raf=requestAnimationFrame(loop);
    if(REDUCED)return;
    if(!last)last=ts;
    if(ts-last<STEP)return;
    last=ts;
    if(document.hidden)return;
    step();
  }
  function build(){
    measure();
    cv.width=W;cv.height=H;
    cv.style.width=(W*PIX)+'px';cv.style.height=(H*PIX)+'px';
    cv.getContext('2d').imageSmoothingEnabled=false;
    g=cv.getContext('2d');
    skyC=buildSky();landC=buildLand();
    buildCrowns();buildClouds();buildFlora();
    SMOKE.length=0;BIRD.length=0;TK=0;off=0;tOff=0;
    step();
  }
  function init(){
    wrapEl=document.getElementById('bgWrap');
    cv=document.getElementById('bgCanvas');
    if(!wrapEl||!cv)return;
    build();
    /* 首帧之后字体/布局稳定了，hero 卡片高度可能微变 → 地平线要跟着重新校准 */
    const relayout=function(){const f0=FAR;measure();if(FAR!==f0)build();};
    if(document.fonts&&document.fonts.ready&&document.fonts.ready.then)document.fonts.ready.then(relayout);
    setTimeout(relayout,340);
    let t=null;
    window.addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(()=>{build();},220);});
    window.addEventListener('scroll',()=>{
      tOff=Math.min(PAD,(window.scrollY||window.pageYOffset||0)/PIX*0.30);
    },{passive:true});
  }
  function apply(){
    const want=pref&&onHome;
    /* has-bgpic 每次都同步，且只看 bgOn+onHome，与 pref（动效开关）完全解耦。
       放在提前 return 之前：pref 翻转时 want 可能与live 相同（都是 false），
       若被拦掉，has-bgpic 会残留，首页背景关不掉。 */
    document.body.classList.toggle('has-bgpic',bgOn&&onHome);
    if(want===live)return;
    live=want;
    wrapEl.classList.toggle('on',live);
    document.body.classList.toggle('bg-on',live);
    if(live&&!raf){last=0;raf=requestAnimationFrame(loop);}
  }
  function show(on){
    if(!wrapEl)init();
    if(!wrapEl)return;
    onHome=!!on;
    apply();
  }
  function toggle(){
    pref=!pref;
    try{localStorage.setItem('pxkt_scene',pref?'1':'0');}catch(e){}
    apply();
    return pref;
  }
  /* 背景图单独开关：给顶栏一个按钮，与"风景动效"互不影响 */
  function toggleBg(){
    bgOn=!bgOn;
    try{localStorage.setItem('pxkt_bgpic',bgOn?'1':'0');}catch(e){}
    apply();
    return bgOn;
  }
  return {init:init,show:show,build:build,toggle:toggle,toggleBg:toggleBg,
          isPref:function(){return pref;},isBgOn:function(){return bgOn;}};
})();
Scenery.init();
Scenery.show(true);
setSceneBtn(Scenery.isPref());
setBgBtn(Scenery.isBgOn());
/* 顶栏版本号：这份文件在老师机器上存在多个副本（工作区 / 桌面），
   曾经因为打开的是旧副本导致"改了没生效"，白排查半天。把版本号摆到界面上，
   一眼就能确认自己开的是哪一版。 */
/* 版本号只在这里写一次：以前顶栏写 v6.11、页脚写 v6.17，两个数字对不上，老师会以为装错了版本 */
$('#hudTitle').innerHTML='像素课堂 · 宝可梦养成 <span style="font-size:11px;font-weight:700;opacity:.55;letter-spacing:0">'+APP_VER+'</span>';
$('#ftVer').textContent=APP_VER;
/* 首页三个数字改成按真实数据统计。
   【为什么必须算】原来直接写死 45/22/155。以后往物种表里加一只、删一条进化线，
   这三个数字就会变成"骗人的宣传语"——老师数一数发现对不上，反而更不信任这个工具。
   统计口径：物种=SP 长度，进化线=EVO_CHAINS 的键数（它是对象不是数组，
   写 .length 会得到 undefined，页面上那个数字直接变空白——这类"看着没事、其实少一块"的坑最难查），
   立绘=图集实际精灵数。 */
$('#hbSpecies').textContent=SP.length;
$('#hbChains').textContent=Object.keys(EVO_CHAINS).length;
$('#hbArts').textContent=Object.keys(SPR_IDX).length;
/* 首屏必须先同步画一次主角。
   【为什么】动画主循环每 560ms 一拍、且隔拍才调 heroLoop()，所以首帧要等 ~1.1 秒才画。
   那 1.1 秒里 <canvas> 还是 HTML 里写死的 144×168 位图，被 CSS 拉到 312×432 ——
   312/144 = 2.17 倍【非整数缩放】，正是像素画最忌讳的糊法；老师打开文件第一眼看到的
   是一个模糊空框，蛋"啪"地一下跳出来。这里在启动时补画，动画循环只管后续帧。 */
heroLoop();
$('#btnScene').onclick=function(){
  const on=Scenery.toggle();
  setSceneBtn(on);
  sfx.click();
  toast(on?'已开启首页风景动效':'已关闭首页风景动效（投影更省力）');
};
$('#btnBg').onclick=function(){
  const on=Scenery.toggleBg();
  setBgBtn(on);
  sfx.click();
  toast(on?'已显示首页背景图':'已隐藏首页背景图');
};

document.querySelector('.hero-btn').addEventListener('click',()=>{document.getElementById('inpClassName').value='';document.getElementById('inpNames').value='';openModal('createModal')});
