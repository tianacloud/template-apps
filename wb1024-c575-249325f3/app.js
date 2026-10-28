
"use strict";
/* ═══════════════════════════════════════════════════════
   一、词库：按领域组织的营销动词/痛点/身份/场景词
   ═══════════════════════════════════════════════════════ */
var BANKS = {
  通用:{acts:["盲目跟风","三天打鱼","想太多做太少","一个人硬扛","凭感觉上手"],
       pains:["没结果","没动力","走弯路","半途而废","没方向"],
       ids:["新手","普通人","打工人","小白"],
       scenes:["入门","进阶","瓶颈期"],
       results:["有结果","上手快","不踩坑","少走弯路"],
       covers:["别再跟风了","新手进","真的有用","3招够了","建议收藏"],
       tags:["#干货","#涨知识","#收藏","#实用","#建议收藏","#经验分享"]},
  穿搭:{acts:["乱买","照搬博主","盲入爆款","堆logo","忽略版型"],
       pains:["显土","显胖","没质感","穿一季就腻","撞衫"],
       ids:["小个子","微胖","学生党","上班族","懒人"],
       scenes:["通勤","约会","面试","周末出游","见家长"],
       results:["显高","显瘦","高级","耐看","一套顶三天"],
       covers:["别再乱买了","小个子进","真的显高","3套够了","照抄就行"],
       tags:["#穿搭","#Ootd","#通勤穿搭","#小个子穿搭","#穿搭技巧","#每日穿搭","#衣品","#爆款穿搭"]},
  美食:{acts:["点外卖","重油重盐","凭感觉放调料","剩菜复热","空腹逛超市"],
       pains:["踩雷","长胖","不好吃","浪费","上火"],
       ids:["厨房小白","上班族","独居","学生党","减脂人"],
       scenes:["一人食","周末","深夜","聚会","带饭"],
       results:["好吃","省事","省钱","管饱","零失败"],
       covers:["别再点外卖了","厨房小白进","真的零失败","10分钟搞定","建议收藏"],
       tags:["#美食","#一人食","#厨房小白","#懒人食谱","#美食教程","#减脂餐","#家常菜","#深夜美食"]},
  旅行:{acts:["踩点打卡","说走就走","跟团","只去网红点","不查天气"],
       pains:["踩雷","人挤人","超预算","晒黑","走冤枉路"],
       ids:["学生党","打工人","情侣","亲子","独行侠"],
       scenes:["周末","小长假","毕业旅行","出差","周边游"],
       results:["省心","出片","省钱","不累","值回票价"],
       covers:["别再跟团了","打工人进","真的出片","3天够了","建议收藏"],
       tags:["#旅行","#周末去哪儿","#旅行攻略","#小众旅行地","#毕业旅行","#citywalk","#旅行vlog","#周边游"]},
  职场:{acts:["埋头苦干","秒回消息","裸辞","无效加班","越级汇报"],
       pains:["内耗","被抢功","背锅","卡在基层","加薪无望"],
       ids:["实习生","新人","老员工","中层","应届生"],
       scenes:["汇报","面试","谈薪","开会","摸鱼"],
       results:["升职","加薪","被看见","不内耗","准时下班"],
       covers:["别再埋头干了","实习生进","真的加薪","3步够了","建议收藏"],
       tags:["#职场","#职场干货","#打工人","#升职加薪","#面试技巧","#职场新人","#效率工具","#职场心理学"]},
  学习:{acts:["假努力","抄笔记","死记硬背","堆资料","熬夜刷题"],
       pains:["忘得快","走神","没进展","焦虑","拖延"],
       ids:["考研党","大学生","自律小白","在职党","学渣"],
       scenes:["自习室","通勤","考前","寒暑假","睡前"],
       results:["记得住","省时间","不焦虑","逆袭","上岸"],
       covers:["别再假努力了","考研党进","真的记得住","3招够了","建议收藏"],
       tags:["#学习","#学习方法","#自律","#考研","#大学生","#效率","#逆袭","#上岸"]},
  健身:{acts:["疯狂节食","天天有氧","照抄计划","周末猛练","只看体重"],
       pains:["反弹","受伤","没变化","坚持不下去","体态差"],
       ids:["新手","上班族","宝妈","学生党","大基数"],
       scenes:["居家","健身房","早晨","通勤后","周末"],
       results:["瘦下来","有线条","有精神","不反弹","穿啥都好看"],
       covers:["别再节食了","新手进","真的有线条","3步够了","建议收藏"],
       tags:["#健身","#减肥","#居家健身","#健身新手","#塑形","#自律","#运动打卡","#减脂"]},
  生活:{acts:["冲动消费","熬夜","乱囤","凑满减","久坐"],
       pains:["乱","累","焦虑","存不下钱","精神差"],
       ids:["独居","上班族","学生党","新手妈妈","极简党"],
       scenes:["周末","换季","搬家","睡前","发薪日"],
       results:["清爽","省钱","松弛感","有掌控感","省时间"],
       covers:["别再乱囤了","独居进","真的清爽","3招够了","建议收藏"],
       tags:["#生活","#独居生活","#极简生活","#省钱","#松弛感","#生活方式","#收纳","#日常"]},
  数码:{acts:["参数党","乱装软件","裸奔不备份","追新机","贴膜戴套全副武装"],
       pains:["卡顿","踩雷","吃灰","被坑","不会用"],
       ids:["学生党","上班族","数码小白","等等党"],
       scenes:["开学","出差","居家办公","旅行"],
       results:["流畅","省心","保值","真香"],
       covers:["别再乱装了","小白进","真的省心","3招够了","建议收藏"],
       tags:["#数码","#数码好物","#效率工具","#学生党好物","#APP推荐","#数码测评","#开箱","#办公好物"]}
};

/* ═══════════════════════════════════════════════════════
   二、十条爆款公式：每条挂一个报纸"栏目名"与基础点击欲
   ═══════════════════════════════════════════════════════ */
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function ri(a,b){return a+Math.floor(Math.random()*(b-a+1));}
var ADJS=["简单","偷懒","少","慢","随便","朴素","早睡","不买新"];
var FORMULAS = [
  {col:"清单栏", base:0.4, build:function(k,b){return ri(3,6)+"个"+k+"技巧，第"+ri(2,5)+"个太绝了";}},
  {col:"悬念栏", base:0.3, build:function(k,b){return k+"千万别"+pick(b.acts)+"，除非…";}},
  {col:"共鸣栏", base:0.3, build:function(k,b){return "为什么你的"+k+"总是"+pick(b.pains)+"？";}},
  {col:"身份栏", base:0.1, build:function(k,b){return (b._aud||pick(b.ids))+"必看的"+k+"攻略，先码住";}},
  {col:"承诺栏", base:0.3, build:function(k,b){return "学会这招，"+k+"也能"+pick(b.results);}},
  {col:"避坑栏", base:0.2, build:function(k,b){return k+"的"+ri(3,6)+"个坑，我替你踩完了";}},
  {col:"反差栏", base:0.4, build:function(k,b){return k+ri(2,6)+"周后，我从"+pick(b.pains)+"到"+pick(b.results);}},
  {col:"反问栏", base:0.3, build:function(k,b){return "有没有人和我一样，"+k+"总是"+pick(b.pains)+"？";}},
  {col:"亲历栏", base:0.2, build:function(k,b){return k+"翻车"+ri(2,8)+"次后，我悟了";}},
  {col:"洞察栏", base:0.4, build:function(k,b){return k+"越"+pick(ADJS)+"，越"+pick(b.results);}}
];
var EMOJI={稳健:[],均衡:["✨","🔥","💯","👇","📌"],大胆:["🔥","✨","💥","⭐","🎯"]};

/* ═══════════════════════════════════════════════════════
   三、引擎：合规灯 + 点击率星级 + 精简
   ═══════════════════════════════════════════════════════ */
function clen(t){return Array.from(t).length;} /* emoji 记 1 字 */
function tighten(t){
  t=t.replace(/，?(建议收藏|先码住|收藏吃灰也行)$/,"");
  t=t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,"");
  return t.trim();
}
function lampOf(t){var n=clen(t);return n<=16?{c:"ok",t:"舒适"}:n<=20?{c:"warn",t:"贴线"}:{c:"over",t:"超长"};}
/* 预估点击率：基准 1 分 + 公式强度微差 + 特征加减分，映射 1—5 星。
   权重经过校准：普通标题落 3—4 星，只有"有数字 + 有钩子 + 短 +
   有身份锚点 + 合规"的标题才够 5 星，保证星级有区分度。 */
function starsOf(t,base){
  var s=1.3+(base||0);
  if(/\d/.test(t))s+=.8;                                    /* 有具体数字 */
  if(/[？?…]|太绝|悟了|越.+，越/.test(t))s+=.8;              /* 有悬念钩子 */
  if(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(t))s+=.4; /* 有表情符号 */
  if(clen(t)<=16)s+=.6;                                     /* 长度舒适 */
  if(/必看|人进|党|姐妹|上班族|学生|新手|打工人/.test(t))s+=.5; /* 有身份锚点 */
  var lp=lampOf(t);
  if(lp.c==="over")s-=.8;else if(lp.c==="warn")s-=.3;
  return Math.max(1,Math.min(5,Math.round(s)));
}
function decorate(t,style){
  var ems=EMOJI[style]||[];
  if(!ems.length)return t;
  if(style==="均衡")return t+" "+pick(ems);
  return pick(ems)+t+" "+pick(ems);
}
/* 生成一批头条：公式轮换 + 去重 + 优先 20 字内，装不满再补超长款；
   批次按星级降序——最高分的一条做特大"今日头条" */
function makeBatch(kw,aud,dom,style,count){
  var bank=BANKS[dom]||BANKS["通用"];
  var b=Object.assign({},bank);b._aud=aud||"";
  var formulas=FORMULAS.slice();
  var used={},ok=[],over=[],guard=0;
  while(ok.length+over.length<count&&guard<count*60){
    guard++;
    if(!formulas.length)formulas=FORMULAS.slice();
    var f=formulas.splice(Math.floor(Math.random()*formulas.length),1)[0];
    var t=decorate(f.build(kw,b),style);
    if(clen(t)>20)t=decorate(tighten(t),style);
    if(clen(t)>24)continue; /* 精简后仍严重超长，弃用重排 */
    if(used[t])continue;
    used[t]=1;
    var it={t:t,col:f.col,base:f.base,stars:starsOf(t,f.base),lamp:lampOf(t)};
    (it.lamp.c==="over"?over:ok).push(it);
  }
  var out=ok.concat(over).slice(0,count);
  out.sort(function(a,c){return c.stars-a.stars;});
  return out;
}
/* 封面大字：4—8 字，直接可做封面 */
function makeCovers(kw,aud,dom){
  var bank=BANKS[dom]||BANKS["通用"];
  var b=Object.assign({},bank);b._aud=aud||"";
  var pool=[
    "别再"+pick(b.acts)+"了",
    (b._aud||pick(b.ids))+"进",
    "真的"+pick(b.results),
    ri(3,5)+"招够了",
    kw+"，我悟了",
    "翻车"+ri(2,9)+"次",
    pick(b.covers),
    "手残党进",
    "零失败",
    "照抄就行"
  ];
  var seen={},out=[];
  for(var i=0;i<pool.length&&out.length<6;i++){
    var t=pool[i];
    if(seen[t]||clen(t)>9)continue;
    seen[t]=1;out.push(t);
  }
  while(out.length<6)out.push(pick(b.covers));
  return out.slice(0,6);
}
/* 话题 + 正文 Hook */
function makeTags(kw,aud,dom){
  var bank=BANKS[dom]||BANKS["通用"];
  var list=bank.tags.slice();
  list.push("#"+kw,"#"+kw+"教程","#"+kw+"攻略");
  if(aud)list.push("#"+aud);
  list.push("#WorkBuddy","#1024程序员节","#自媒体运营","#涨粉");
  var seen={},out=[];
  for(var i=0;i<list.length;i++){
    var t=list[i].replace(/\s+/g,"");
    if(seen[t])continue;seen[t]=1;out.push(t);
    if(out.length>=12)break;
  }
  return out;
}
function makeHooks(kw,aud,dom){
  var bank=BANKS[dom]||BANKS["通用"];
  var who=aud||pick(bank.ids);
  return [
    "被问了800遍的"+kw+"，今天一次讲清楚。",
    "如果你"+pick(bank.pains)+"，这篇一定要看完。",
    who+"做"+kw+"，看这一篇就够了。"
  ];
}

/* ═══════════════════════════════════════════════════════
   四、状态与工具
   ═══════════════════════════════════════════════════════ */
var LS_KEY="hedge_collect_v1";
var state={kw:"",aud:"",dom:"通用",style:"均衡",count:8,titles:[],clips:[]};
try{state.clips=JSON.parse(localStorage.getItem(LS_KEY)||"[]");}catch(e){state.clips=[];}
var $=function(id){return document.getElementById(id);};
var toastTimer=0;
function toast(msg){
  var el=$("toast");el.textContent=msg;el.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove("show");},1800);
}
function copyText(t,okMsg){
  function done(){toast(okMsg||"已复制到剪贴板");}
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(t).then(done,function(){fallback(t);done();});
  }else{fallback(t);done();}
}
function fallback(t){
  var ta=document.createElement("textarea");
  ta.value=t;ta.setAttribute("readonly","");
  ta.style.cssText="position:fixed;top:-999px;opacity:0";
  document.body.appendChild(ta);ta.select();
  try{document.execCommand("copy");}catch(e){}
  document.body.removeChild(ta);
}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){
  return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function saveClips(){try{localStorage.setItem(LS_KEY,JSON.stringify(state.clips));}catch(e){}}

/* ═══════════════════════════════════════════════════════
   五、渲染
   ═══════════════════════════════════════════════════════ */
function starHTML(n){
  var s="";for(var i=1;i<=5;i++)s+=i<=n?"★":"<span class=\"dim\">★</span>";
  return s;
}
function renderFront(){
  var box=$("frontList");
  if(!state.titles.length){
    box.innerHTML="<div class=\"empty-front\"><p class=\"big\">头版虚位以待</p>"+
      "<p>在左侧「选题单」填一个主题关键词，<br>点「开始排版」，10 条爆款公式即刻上版。<br>"+
      "每条头条都带预估点击率星级与 20 字合规灯。</p></div>";
    return;
  }
  var html="";
  state.titles.forEach(function(it,i){
    var lead=i===0?" hl-lead":"";
    var starred=state.clips.some(function(c){return c.t===it.t;});
    html+="<article class=\"hl"+lead+"\" style=\"--i:"+i+"\">"+
      "<div class=\"hl-meta\"><span class=\"col-tag\">"+esc(it.col)+(i===0?" · 今日头条":"")+"</span>"+
      "<span class=\"stars\" title=\"预估点击率 "+it.stars+"/5\">"+starHTML(it.stars)+"</span>"+
      "<span class=\"lamp "+it.lamp.c+"\">"+clen(it.t)+" 字 · "+it.lamp.t+"</span></div>"+
      "<p class=\"hl-t\">"+esc(it.t)+"</p>"+
      "<div class=\"hl-act\">"+
      "<button class=\"act\" data-act=\"copy\" data-i=\""+i+"\">⧉ 复制</button>"+
      "<button class=\"act"+(starred?" starred":"")+"\" data-act=\"star\" data-i=\""+i+"\">"+(starred?"★ 已收藏":"☆ 收藏")+"</button>"+
      "<button class=\"act\" data-act=\"redo\" data-i=\""+i+"\">↻ 重写</button>"+
      "</div></article>";
  });
  box.innerHTML=html;
}
function renderCovers(){
  var box=$("coverGrid");
  if(!state.titles.length){
    box.innerHTML="<div class=\"cover-card\" style=\"cursor:default\"><span class=\"ct\" style=\"color:var(--muted)\">待排版</span><span class=\"cs\">先生成头条</span></div>".repeat(3);
    return;
  }
  var covers=makeCovers(state.kw,state.aud,state.dom);
  var html="";
  covers.forEach(function(t){
    html+="<div class=\"cover-card\" role=\"button\" tabindex=\"0\" data-cover=\""+esc(t)+"\">"+
      "<span class=\"ct\">"+esc(t)+"</span><span class=\"cs\">点击复制</span></div>";
  });
  box.innerHTML=html;
}
function renderTags(){
  var cloud=$("tagCloud"),hooks=$("hookList");
  if(!state.titles.length){
    cloud.innerHTML="<span class=\"sec-note\">生成头条后，这里会出现领域话题 + 活动话题。</span>";
    hooks.innerHTML="<p class=\"sec-note\" style=\"margin-bottom:8px\">正文开头三选一（点右侧复制）：</p>"+
      "<div class=\"hook\"><span class=\"ht\">生成头条后自动给出正文开头 Hook。</span></div>";
    return;
  }
  var tags=makeTags(state.kw,state.aud,state.dom);
  var html="";
  tags.forEach(function(t,i){
    var act=/^#(WorkBuddy|1024程序员节)$/.test(t);
    html+="<button class=\"tag"+(act?" act-tag":"")+"\" data-tag=\""+esc(t)+"\">"+esc(t)+"</button>";
  });
  cloud.innerHTML=html;
  var hs=makeHooks(state.kw,state.aud,state.dom),hh="";
  hs.forEach(function(t){
    hh+="<div class=\"hook\"><span class=\"ht\">"+esc(t)+"</span><button data-hook=\""+esc(t)+"\">复制</button></div>";
  });
  hooks.innerHTML="<p class=\"sec-note\" style=\"margin-bottom:8px\">正文开头三选一（点右侧复制）：</p>"+hh;
}
function renderClips(){
  var wrap=$("clipsWrap"),bar=$("clipsBar");
  if(!state.clips.length){
    bar.hidden=true;
    wrap.innerHTML="<div class=\"clips-empty\">剪报簿还是空的——点头条卡片上的「☆ 收藏」，攒成一版再导出。</div>";
    return;
  }
  bar.hidden=false;
  var html="<table class=\"clip-table\"><thead><tr><th style=\"width:64px\">栏目</th><th>头条</th>"+
    "<th style=\"width:110px\">收藏于</th><th style=\"width:120px\"></th></tr></thead><tbody>";
  state.clips.forEach(function(c,i){
    html+="<tr><td style=\"color:var(--muted);font-size:var(--fs-xs);letter-spacing:.1em\">"+esc(c.col)+"</td>"+
      "<td class=\"clip-t\">"+esc(c.t)+"</td>"+
      "<td style=\"color:var(--muted);font-size:var(--fs-xs);font-variant-numeric:tabular-nums\">"+esc(c.ts)+"</td>"+
      "<td style=\"text-align:right\"><button class=\"clip-del\" data-del=\""+i+"\">删除</button></td></tr>";
  });
  wrap.innerHTML=html+"</tbody></table>";
}

/* ═══════════════════════════════════════════════════════
   六、交互
   ═══════════════════════════════════════════════════════ */
function generate(){
  var kw=$("kw").value.trim();
  if(!kw){toast("先填一个主题关键词，比如：通勤穿搭");$("kw").focus();return;}
  state.kw=kw;
  state.aud=$("aud").value.trim();
  state.titles=makeBatch(kw,state.aud,state.dom,state.style,state.count);
  renderFront();renderCovers();renderTags();
  var first=document.querySelector(".hl");
  if(first)first.scrollIntoView({behavior:"smooth",block:"nearest"});
}
/* 选题单控件 */
var DOMS=["通用","穿搭","美食","旅行","职场","学习","健身","生活","数码"];
(function initChips(){
  var html="";
  DOMS.forEach(function(d){
    html+="<button type=\"button\" class=\"chip"+(d===state.dom?" on":"")+"\" data-dom=\""+d+"\">"+d+"</button>";
  });
  $("domChips").innerHTML=html;
  $("domChips").addEventListener("click",function(e){
    var b=e.target.closest("[data-dom]");if(!b)return;
    state.dom=b.dataset.dom;
    [].forEach.call(this.querySelectorAll(".chip"),function(c){c.classList.toggle("on",c===b);});
    if(state.titles.length){generate();}
  });
})();
(function initSegs(){
  function segs(el,items,key,after){
    var html="";
    items.forEach(function(v){
      html+="<button type=\"button\" class=\"seg"+(state[key]===v?" on":"")+"\" data-v=\""+v+"\">"+v+"</button>";
    });
    el.innerHTML=html;
    el.addEventListener("click",function(e){
      var b=e.target.closest("[data-v]");if(!b)return;
      state[key]=isNaN(+b.dataset.v)?b.dataset.v:+b.dataset.v;
      [].forEach.call(this.querySelectorAll(".seg"),function(s){s.classList.toggle("on",s===b);});
      if(after)after();
    });
  }
  segs($("styleSegs"),["稳健","均衡","大胆"],"style",function(){if(state.titles.length)generate();});
  segs($("countSegs"),["6","8","10"],"count",function(){if(state.titles.length)generate();});
})();
$("brief").addEventListener("submit",function(e){e.preventDefault();generate();});
$("btnReroll").addEventListener("click",function(){
  if(!$("kw").value.trim()){toast("先填一个主题关键词");$("kw").focus();return;}
  generate();toast("已换一批头条");
});
$("btnCopyAll").addEventListener("click",function(){
  if(!state.titles.length){toast("头版还是空的");return;}
  var t=state.titles.map(function(it,i){return (i+1)+". "+it.t;}).join("\n");
  copyText(t,"整版头条已复制（共 "+state.titles.length+" 条）");
});
/* 头版卡片操作（事件委托） */
$("frontList").addEventListener("click",function(e){
  var b=e.target.closest("[data-act]");if(!b)return;
  var i=+b.dataset.i,it=state.titles[i];if(!it)return;
  if(b.dataset.act==="copy"){copyText(it.t);}
  else if(b.dataset.act==="star"){
    var idx=-1;state.clips.forEach(function(c,k){if(c.t===it.t)idx=k;});
    if(idx>=0){state.clips.splice(idx,1);toast("已取消收藏");}
    else{
      state.clips.unshift({t:it.t,col:it.col,ts:new Date().toISOString().slice(0,10)});
      saveClips();toast("已收进剪报簿");
    }
    renderFront();renderClips();
  }
  else if(b.dataset.act==="redo"){
    var dom=state.dom,style=state.style,aud=state.aud;
    var b2=Object.assign({},BANKS[dom]||BANKS["通用"]);b2._aud=aud||"";
    var fs=FORMULAS.filter(function(f){return f.col!==it.col;});
    var t="",guard=0;
    while(guard++<30){
      var f=pick(fs);t=decorate(f.build(state.kw,b2),style);
      if(clen(t)>20)t=decorate(tighten(t),style);
      if(clen(t)<=22&&t!==it.t&&!state.titles.some(function(x){return x.t===t;}))break;
      t="";
    }
    if(!t){toast("这个栏目灵感枯竭了，换一批试试");return;}
    it.t=t;it.col=f.col;it.base=f.base;it.stars=starsOf(t,f.base);it.lamp=lampOf(t);
    renderFront();
  }
});
/* 封面大字 */
$("coverGrid").addEventListener("click",function(e){
  var c=e.target.closest("[data-cover]");if(!c)return;
  copyText(c.dataset.cover);
});
$("coverGrid").addEventListener("keydown",function(e){
  if(e.key!=="Enter"&&e.key!==" ")return;
  var c=e.target.closest("[data-cover]");if(!c)return;
  e.preventDefault();copyText(c.dataset.cover);
});
/* 话题与 Hook */
$("tagCloud").addEventListener("click",function(e){
  var b=e.target.closest("[data-tag]");if(!b)return;
  copyText(b.dataset.tag);
});
$("hookList").addEventListener("click",function(e){
  var b=e.target.closest("[data-hook]");if(!b)return;
  copyText(b.dataset.hook);
});
$("btnCopyTags").addEventListener("click",function(){
  if(!state.titles.length){toast("先生成头条，话题才会出现");return;}
  copyText(makeTags(state.kw,state.aud,state.dom).join(" "),"全部话题已复制");
});
/* 剪报簿 */
$("clipsWrap").addEventListener("click",function(e){
  var b=e.target.closest("[data-del]");if(!b)return;
  state.clips.splice(+b.dataset.del,1);saveClips();renderClips();renderFront();
  toast("已删除");
});
$("btnClipsCopy").addEventListener("click",function(){
  if(!state.clips.length)return;
  copyText(state.clips.map(function(c,i){return (i+1)+". "+c.t+"（"+c.col+"）";}).join("\n"),
    "剪报簿已复制（"+state.clips.length+" 条）");
});
$("btnClipsExport").addEventListener("click",function(){
  if(!state.clips.length)return;
  var txt="头条编辑部 · 剪报簿\n导出时间："+new Date().toLocaleString("zh-CN")+"\n\n"+
    state.clips.map(function(c,i){return (i+1)+". "+c.t+"（"+c.col+" · 收藏于 "+c.ts+"）";}).join("\n")+"\n";
  var a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([txt],{type:"text/plain;charset=utf-8"}));
  a.download="剪报簿.txt";document.body.appendChild(a);a.click();
  document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
  toast("已导出 TXT");
});
$("btnClipsClear").addEventListener("click",function(){
  if(!state.clips.length)return;
  state.clips=[];saveClips();renderClips();renderFront();toast("剪报簿已清空");
});

/* ═══════════════════════════════════════════════════════
   七、初始化：刊头日期 + 号外跑马灯
   ═══════════════════════════════════════════════════════ */
(function init(){
  var d=new Date();
  var week=["日","一","二","三","四","五","六"][d.getDay()];
  $("mastDate").textContent=d.getFullYear()+" 年 "+(d.getMonth()+1)+" 月 "+d.getDate()+" 日 · 星期"+week;
  var news=["号外！WorkBuddy 1024 造物挑战参赛作品","输入主题，30 秒排出今日头版",
    "20 字红线实时监测，超长自动精简","10 条爆款公式轮换，换一批不重样",
    "封面大字 + 发布话题一并奉上","纯本地运行，收藏存在你的浏览器"];
  var one=news.map(function(n){return "<span>"+n+"</span>";}).join("");
  $("extraTrack").innerHTML=one+one; /* 两份拼接实现无缝循环 */
  renderClips();
})();
