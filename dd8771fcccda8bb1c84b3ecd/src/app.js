(function(){
"use strict";

function cloudClient(){return window.wenmaiCloud || null}
function clientId(){
  var k="wenmai_cid",v="";
  try{v=localStorage.getItem(k)||""}catch(e){}
  if(!v){
    v="c"+Date.now().toString(36)+Math.random().toString(36).slice(2,10);
    try{localStorage.setItem(k,v)}catch(e){}
  }
  return v;
}
function serializeTree(t){
  function slim(n){
    var o={label:n.label,kind:n.kind||"leaf",children:[]};
    if(n.lead) o.lead=String(n.lead).slice(0,80);
    (n.children||[]).forEach(function(c){o.children.push(slim(c))});
    return o;
  }
  return slim(t);
}
function cloudError(e){
  if(!e) return "未知错误";
  var c=(e.error&&e.error.code)||e.code||"";
  if(String(c).indexOf("quota_")===0) return "额度已用完，稍后再试";
  if(String(c).indexOf("gateway_")===0||String(c).indexOf("model_")===0) return "模型暂时不可用，稍后再试";
  if(String(c).indexOf("auth_")===0) return "云端鉴权失败，请刷新页面";
  return (e.error&&e.error.message)||e.message||"请求失败";
}

var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

var DEMOS=[
 {name:"周报为什么没人看",text:
"为什么你写的周报没人看\n\n"+
"周报是职场里最被低估的一份文件。它不只是记录，更是你向决策者证明判断力的唯一固定窗口。可惜大多数人的周报，写成了流水账。\n\n"+
"一、没人看的周报，通常坏在三处\n\n"+
"第一处，用过程代替结果。写了三天的推进会、改了五版方案，却没有一句话说清这件事现在到了哪一步。读者关心的从来不是你做了什么，而是事情变成了什么样。\n\n"+
"第二处，用形容词代替数字。进展顺利、效果明显、大幅提升，这些词在读的人眼里等于零。数字才是可以被检验的语言，没有数字的结论只是态度。\n\n"+
"第三处，用平铺代替取舍。把十件事并列写成十条，等于告诉对方这十件事一样重要。而实际上，一个月里真正改变局面的往往只有一两件。\n\n"+
"二、把周报写成决策材料的三步\n\n"+
"第一步，先写结论。开头一句话说清本周最关键的变化：是风险提前暴露了，还是某个环节被打通了。结论要能被单独转发。\n\n"+
"第二步，再写证据。最多三个数字，配一个对比。同比、环比、目标差距，选一个最有力的。数字后面必须跟一句解释，说明它意味着什么。\n\n"+
"第三步，最后写请求。明确需要谁、在什么时候、做什么决定。没有请求的周报，只是一份通知；有请求的周报，才是一次协作。\n\n"+
"三、一个可以直接套用的模板\n\n"+
"本周结论：一句话。关键数字：三个，每个配一句解读。风险与阻塞：只写需要上级知道的。下周计划：不超过三件。需要支持：写清对象和时间。\n\n"+
"四、写在最后\n\n"+
"周报的价值不在于写完，而在于它逼你把一周的混乱压缩成一个判断。写不清楚，往往不是文笔问题，是你还没想清楚。"},

 {name:"会议为什么越开越长",text:
"会议为什么越开越长\n\n"+
"很少有公司死于会议太少，但很多团队被会议拖慢。一个原本四十分钟的会，最后开成两小时，通常不是因为议题变多，而是三台机制在同时起作用。\n\n"+
"一、会议变长的三个机制\n\n"+
"议题漂移。会开到一半，有人提起另一个更紧急的问题，话题就拐了弯。没有人切断它，因为切断显得不合作。于是原定议程被挤到最后一刻，草草收场。\n\n"+
"责任稀释。人越多，越没有人觉得该由自己拍板。每个人都发言，每个人都不决定，会议就变成了信息交换所，散会时问题还在原地。\n\n"+
"沉默成本。已经坐了四十分钟，大家潜意识里觉得必须开出一个结论才对得起这段时间。于是为了结论而结论，把决定做得更糟。\n\n"+
"二、把会议砍短的四条规矩\n\n"+
"第一条，没有议题不开。议题不是会议主题，而是要在会上做的决定。写不出决定，就说明这件事不该用会议解决。\n\n"+
"第二条，有结论才散。会议结束前必须留下三样东西：决定了什么、谁负责、什么时候完成。写不下来，就当没开过。\n\n"+
"第三条，异议前置。反对意见在会前单独收集，会上只处理分歧。把争议留到会上公开碰撞，通常只增加时长，不增加质量。\n\n"+
"第四条，超时顺延。时间到就停，没讨论完的另约。这条规矩最反直觉，却最能倒逼议程被认真设计。\n\n"+
"三、主持人真正的工作\n\n"+
"主持人不是串场的人，而是守门的人。他要守住三件事：议题不漂移、发言不重复、结论不模糊。做到这三件，会议自然会短。\n\n"+
"四、一句话总结\n\n"+
"会议的长度，本质上是组织决策能力的显影。开得越长，往往说明越少有人在会前把问题想清楚。"},

 {name:"三分钟读懂一份财报",text:
"三分钟读懂一份财报\n\n"+
"读财报不是把每张表都看完，而是先建立骨架，再找异常。三分钟能做的，是把一家公司的轮廓看清楚。\n\n"+
"一、先看三张表的关系\n\n"+
"利润表回答赚不赚钱，资产负债表回答家底厚不厚，现金流量表回答钱有没有真的回来。三张表里最容易被忽略的是第三张，因为它最难被会计手法修饰。\n\n"+
"利润是观点，现金是事实。一家公司可以连续几年利润为正，同时经营现金流持续为负，这通常意味着它在用应收账款换取收入。\n\n"+
"二、四个必须算的比率\n\n"+
"毛利率看产品有没有定价权，净利率看整体效率，应收账款周转看客户质量，经营现金流与净利润的比值看利润的含金量。\n\n"+
"这四个指标不需要精确到小数点，只需要看趋势。连续三年毛利率下滑，比任何管理层的解释都更值得相信。\n\n"+
"三、三个危险信号\n\n"+
"第一个，收入增长而现金流恶化。第二个，应收账款增速长期高于收入增速。第三个，存货周转变慢同时毛利率上升。\n\n"+
"这三个信号单独出现可能只是行业周期，同时出现就值得警惕。\n\n"+
"四、一句话总结\n\n"+
"财报不是用来证明公司好，而是用来找它哪里不对。带着怀疑读，比带着欣赏读更有收获。"}
];

var STOP=new Set(("我们 你们 他们 她们 它们 自己 这个 那个 这些 那些 一个 一种 一次 什么 怎么 为什么 如何 可以 可能 应该 需要 已经 还是 只是 不是 但是 因为 所以 如果 虽然 然后 同时 另外 此外 不过 因此 其实 就是 没有 这样 那样 其中 目前 现在 今天 今年 去年 明年 非常 特别 比较 很多 一些 有些 大家 以及 并且 或者 而且 然而 于是 对于 关于 通过 进行 这份 这次 那是 这是 的话 时候 东西 事情 问题 方面 情况 一样 一直 一定 终于 开始 觉得 知道 看到 发现 那就 这种 那种 之一 上面 下面 里面 出来 起来 下去 下来 过来 过去 还有 无论 不管 只要 只有 除了 否则 即使 哪怕 似乎 显得 等等 所谓 而言 之类 左右 前后 之间 之后 之前 以后 以前 当时 往往 总是 经常 偶尔 大概 也许 恐怕 当然 显然 确实 本质 真正 通常 其实 不只 而是 不能 不会 必须 只是 一样 时候 可能 几乎 多半 多数 少数 有人 每个 每天 每周 每年 之间").split(" "));

var state={title:"",tree:null,sections:[],deep:3,view:null,words:0,ai:null,fromCloud:false};

function toast(msg){
  var t=$("#toast");t.textContent=msg;t.classList.add("on");
  clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove("on")},1900);
}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

function normalize(t){
  return t.replace(/\r\n?/g,"\n").replace(/\u00a0/g," ").replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim();
}

function isHtml(raw){return /<(p|div|section|h[1-6]|strong|br|span)\b/i.test(raw)}

function fromHtml(raw){
  var doc=new DOMParser().parseFromString(raw,"text/html");
  var host=doc.querySelector("#js_content")||doc.querySelector("article")||doc.body;
  var blocks=[];
  var nodes=host.querySelectorAll("h1,h2,h3,h4,h5,p,section,li,blockquote");
  for(var i=0;i<nodes.length;i++){
    var el=nodes[i];
    if(el.querySelector("h1,h2,h3,h4,p,li")) continue;
    var tag=el.tagName.toLowerCase();
    var txt=(el.textContent||"").replace(/\s+/g," ").trim();
    if(!txt || txt.length<2) continue;
    var level=0;
    if(tag==="h1")level=1;else if(tag==="h2")level=2;else if(tag==="h3")level=3;else if(tag==="h4"||tag==="h5")level=4;
    if(!level && tag==="p"){
      var b=el.querySelector("strong,b");
      var boldLen=b?(b.textContent||"").trim().length:0;
      if(b && boldLen>0 && boldLen>=txt.length*0.75 && txt.length<=30 && !/[。；]$/.test(txt)) level=2;
    }
    blocks.push({level:level,text:txt});
  }
  return blocks;
}

function headLevel(line){
  if(/^#{1,4}\s+/.test(line)) return 1;
  if(/^[一二三四五六七八九十]{1,3}[、.．]\s*/.test(line)) return 1;
  if(/^[（(][一二三四五六七八九十]{1,3}[）)]\s*/.test(line)) return 2;
  if(/^第[一二三四五六七八九十]{1,3}[章节部分讲课]\s*/.test(line)) return 1;
  if(/^\d{1,2}[、.．)）]\s*/.test(line)) return 2;
  if(/^[（(]\d{1,2}[）)]\s*/.test(line)) return 3;
  var t=line.replace(/\s/g,"");
  if(t.length>=2 && t.length<=26 && !/[。！？!?；;，,、：:…]$/.test(t) && !/^["'“”‘’]/.test(t)) return 1;
  return 0;
}

function fromText(raw){
  var lines=normalize(raw).split("\n");
  var blocks=[];
  for(var i=0;i<lines.length;i++){
    var line=lines[i].trim();
    if(!line) continue;
    var lv=headLevel(line);
    blocks.push({level:lv,text:line.replace(/^#{1,4}\s+/,"").replace(/^[一二三四五六七八九十]{1,3}[、.．]\s*/,"").replace(/^[（(][一二三四五六七八九十]{1,3}[）)]\s*/,"").replace(/^第[一二三四五六七八九十]{1,3}[章节部分讲课]\s*/,"").replace(/^\d{1,2}[、.．)）]\s*/,"").replace(/^[（(]\d{1,2}[）)]\s*/,"")});
  }
  return blocks;
}

function splitSent(t){
  var out=[],cur="";
  for(var i=0;i<t.length;i++){
    cur+=t[i];
    if(/[。！？!?；;]/.test(t[i])){out.push(cur);cur="";}
  }
  if(cur.trim()) out.push(cur);
  return out.map(function(s){return s.trim()}).filter(function(s){return s.length>1});
}

function keywords(text,n){
  n=n||6;
  var clean=text.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g," ");
  var runs=clean.match(/[\u4e00-\u9fa5]{2,}/g)||[];
  var freq=Object.create(null);
  for(var r=0;r<runs.length;r++){
    var s=runs[r],L=s.length,seen=Object.create(null);
    for(var len=2;len<=4;len++){
      for(var i=0;i+len<=L;i++){
        var g=s.slice(i,i+len);
        if(STOP.has(g)||seen[g]) continue;
        seen[g]=1;
        freq[g]=(freq[g]||0)+1;
      }
    }
  }
  var arr=[];
  var BAD_START=/^[的了着过吗呢吧啊么是在和也就很都一我这那你他她它们与及或而但把被对从向为以于之并还有谁把]/;
  var BAD_END=/[的了着过吗呢吧啊么哪谁把被给让向从对为以于之并还]/;
  var BAD_ANY=/[的了着过吗呢吧啊么在就都很也还又再把被让给]/;
  for(var k in freq){
    if(freq[k]<2) continue;
    if(/^\d+$/.test(k)) continue;
    if(k.indexOf("的")>-1||k.indexOf("了")>-1||k.indexOf("是")>-1) continue;
    if(BAD_START.test(k)||BAD_END.test(k)||BAD_ANY.test(k)) continue;
    arr.push([k,freq[k]]);
  }
  arr.sort(function(a,b){
    var sa=a[1]*Math.min(a[0].length,4),sb=b[1]*Math.min(b[0].length,4);
    if(sb!==sa) return sb-sa;
    return b[0].length-a[0].length;
  });
  var out=[];
  for(var j=0;j<arr.length && out.length<n;j++){
    var g2=arr[j][0],dup=false;
    for(var m=0;m<out.length;m++){
      if(out[m].indexOf(g2)>-1 || g2.indexOf(out[m])>-1){dup=true;break}
    }
    if(!dup) out.push(g2);
  }
  return out;
}

function scoreSents(sents,kws){
  return sents.map(function(s){
    var sc=0;
    for(var i=0;i<kws.length;i++) if(s.indexOf(kws[i])>-1) sc+=3;
    if(s.length>=14&&s.length<=62) sc+=2;
    if(/因此|所以|关键|核心|本质|方法|步骤|首先|其次|最后|结论|原因|意味着|往往|通常|必须|只有/.test(s)) sc+=3;
    if(/\d/.test(s)) sc+=1;
    if(/^(这|那|它|他|她|因为)/.test(s)) sc-=1;
    if(s.length<10) sc-=2;
    return {s:s,score:sc};
  }).sort(function(a,b){return b.score-a.score});
}

function brief(s){
  s=String(s).replace(/^[\s\-—·•]+/,"").replace(/[。！？；，,、：:]+$/,"");
  if(s.length<=22) return s;
  var cut=s.slice(0,24).replace(/[，,、；;：:].*$/,"");
  return (cut.length>=10?cut:s.slice(0,20))+"…";
}

function paragraphsToSections(paras){
  var n=paras.length;
  var k=Math.max(2,Math.min(6,Math.round(Math.sqrt(n))));
  var per=Math.ceil(n/k),secs=[];
  for(var i=0;i<n;i+=per){
    var group=paras.slice(i,i+per);
    if(!group.length) continue;
    var txt=group.join("");
    var kw=keywords(txt,3);
    secs.push({title:kw.length?kw.join(" · "):"第 "+(secs.length+1)+" 段",paras:group,auto:true});
  }
  return secs;
}

function buildSections(blocks,fallbackTitle){
  var title="",start=0;
  if(blocks.length && blocks[0].level>0 && blocks[0].level<=2 && blocks[0].text.length<=40){
    title=blocks[0].text.replace(/[。！？；]$/,"");
    start=1;
  }
  var pre=[],secs=[],cur=null;
  for(var i=start;i<blocks.length;i++){
    var b=blocks[i];
    if(b.level>0 && b.level<=3){
      if(cur) secs.push(cur);
      cur={title:b.text,paras:[]};
    }else{
      if(cur) cur.paras.push(b.text);
      else pre.push(b.text);
    }
  }
  if(cur) secs.push(cur);

  if(!title){
    title=(fallbackTitle||"").trim();
    if(!title){
      var seed=pre.length?pre[0]:blocks[0].text;
      if(seed && seed.replace(/\s/g,"").length<=34) title=seed.replace(/[。！？；]$/,"");
      else{
        var tk=keywords(seed||"",2);
        title=tk.length?("关于「"+tk.join("·")+"」的笔记"):"未命名文章";
      }
      if(pre.length && pre[0]===seed) pre=pre.slice(1);
    }
  }
  if(pre.length){
    if(secs.length) secs[0].paras.unshift(pre.join(""));
    else secs=paragraphsToSections(pre);
  }
  if(!secs.length && blocks.length){
    secs=paragraphsToSections(blocks.slice(start).map(function(b){return b.text}));
  }
  secs=secs.filter(function(s){return s.paras.join("").length>8});
  return {title:title,sections:secs};
}

function toTree(title,secs){
  var root={label:title,children:[],kind:"root"};
  secs.forEach(function(s){
    var all=s.paras.join("");
    var kws=keywords(all,5);
    var sents=[];s.paras.forEach(function(p){sents=sents.concat(splitSent(p))});
    var ranked=scoreSents(sents,kws);
    var lead=(ranked[0]&&ranked[0].s)||sents[0]||s.title;
    var node={label:s.title,children:[],kind:"sec",lead:lead,kws:kws,src:sents.slice(0,4).join("")};
    var used={};
    var picks=[];
    if(sents[0] && sents[0].length>8) picks.push(sents[0]);
    ranked.forEach(function(r){
      if(picks.length>=4) return;
      if(picks.indexOf(r.s)>-1) return;
      picks.push(r.s);
    });
    picks.slice(0,4).forEach(function(p){
      var b=brief(p);
      if(!b || used[b] || b===brief(lead)) return;
      used[b]=1;
      node.children.push({label:b,kind:"leaf",children:[],src:p});
    });
    if(!node.children.length) node.children.push({label:brief(lead),kind:"leaf",children:[],src:lead});
    root.children.push(node);
  });
  return root;
}

function analyze(raw,manualTitle){
  var blocks=isHtml(raw)?fromHtml(raw):fromText(raw);
  if(!blocks.length) return null;
  var r=buildSections(blocks,manualTitle||"");
  if(!r.sections.length) return null;
  var tree=toTree(r.title,r.sections);
  return {title:r.title,sections:r.sections,tree:tree};
}

function countText(raw){
  var t=isHtml(raw)?raw.replace(/<[^>]+>/g," "):raw;
  return (t.match(/[\u4e00-\u9fa5]/g)||[]).length;
}

var FONT='"PingFang SC","Microsoft YaHei",-apple-system,sans-serif';
var mc=document.createElement("canvas").getContext("2d");
function measure(text,size){
  mc.font=size+"px "+FONT;
  return mc.measureText(text).width;
}
function wrapLabel(text,maxW,size,maxLines){
  size=size||13;maxLines=maxLines||2;
  var lines=[],cur="";
  for(var i=0;i<text.length;i++){
    var ch=text[i],t=cur+ch;
    if(measure(t,size)>maxW && cur){
      lines.push(cur);cur=ch;
      if(lines.length>=maxLines){break}
    }else cur=t;
  }
  if(cur && lines.length<maxLines) lines.push(cur);
  var rest=lines.join("");
  if(rest.length<text.length && lines.length){
    var last=lines[lines.length-1];
    while(last.length>1 && measure(last+"…",size)>maxW) last=last.slice(0,-1);
    lines[lines.length-1]=last+"…";
  }
  return lines.length?lines:[text];
}

var PALETTE=["#2A6F6B","#4C6B8A","#C4553B","#5B7A4C","#8A5B6B","#9A6A28"];
var LAY={NODEW:200,ROW:46,GAPX:66,PAD:30};

function layout(root){
  var rows=0;
  (function walk(n,d){
    n.depth=d;
    if(!n.children||!n.children.length){n.y=rows*LAY.ROW;rows++;}
    else{
      n.children.forEach(function(c){walk(c,d+1)});
      n.y=(n.children[0].y+n.children[n.children.length-1].y)/2;
    }
    n.x=LAY.PAD+d*(LAY.NODEW+LAY.GAPX);
  })(root,0);
  var maxD=0;
  (function dep(n){maxD=Math.max(maxD,n.depth);(n.children||[]).forEach(dep)})(root);
  return {w:LAY.PAD*2+maxD*(LAY.NODEW+LAY.GAPX)+LAY.NODEW,h:LAY.PAD*2+(rows-1)*LAY.ROW+56};
}

var viewBox={x:0,y:0,w:900,h:560};
function applyVB(){ $("#mm").setAttribute("viewBox",[viewBox.x,viewBox.y,viewBox.w,viewBox.h].join(" ")) }

function renderMindmap(){
  var g=$("#mmg");g.innerHTML="";
  if(!state.tree) return;
  var box=layout(state.tree);
  var NS="http://www.w3.org/2000/svg";
  function el(tag,attrs){
    var e=document.createElementNS(NS,tag);
    for(var k in attrs) e.setAttribute(k,attrs[k]);
    return e;
  }
  var maxDepth=state.deep-1;
  function draw(n,branch,isRoot){
    var color=isRoot?"#23282D":PALETTE[branch%PALETTE.length];
    var lines=wrapLabel(n.label,LAY.NODEW-26,isRoot?14:13,2);
    var h=lines.length===1?34:50;
    var cy=n.y+LAY.PAD;
    var rect=el("rect",{x:n.x,y:cy-h/2,width:LAY.NODEW,height:h,rx:9,ry:9,
      fill:isRoot?"#23282D":"#FFFFFF",
      stroke:isRoot?"#23282D":color,
      "stroke-width":n.kind==="sec"?1.4:1,
      "stroke-opacity":isRoot?1:(n.kind==="sec"?"0.9":"0.4")});
    if(n.src){
      rect.setAttribute("data-src",n.src);
      rect.setAttribute("data-label",n.label);
      rect.style.cursor="pointer";
    }
    g.appendChild(rect);
    var tp=el("text",{x:n.x+13,y:cy-(lines.length-1)*9.5+4.5,
      "font-family":FONT,"font-size":isRoot?14:13,
      "font-weight":isRoot?"600":(n.kind==="sec"?"500":"400"),
      fill:isRoot?"#FFFFFF":(n.kind==="sec"?"#23282D":"#565C63"),
      "pointer-events":"none"});
    lines.forEach(function(ln,i){
      var ts=el("tspan",{x:n.x+13,dy:i===0?0:19});
      ts.textContent=ln;tp.appendChild(ts);
    });
    g.appendChild(tp);
    if(!isRoot) g.appendChild(el("circle",{cx:n.x+LAY.NODEW-10,cy:cy,r:2.6,fill:color,"fill-opacity":"0.45"}));
    if(n.children&&n.children.length&&n.depth<maxDepth){
      n.children.forEach(function(c,ci){
        var bc=isRoot?ci:branch;
        var x1=n.x+LAY.NODEW,y1=cy,x2=c.x,y2=c.y+LAY.PAD;
        g.appendChild(el("path",{d:"M"+x1+","+y1+" C"+(x1+36)+","+y1+" "+(x2-36)+","+y2+" "+x2+","+y2,
          fill:"none",stroke:PALETTE[bc%PALETTE.length],"stroke-opacity":"0.32","stroke-width":1.3}));
        draw(c,bc,false);
      });
    }
  }
  draw(state.tree,0,true);
  $("#mm")._box=box;
  var rc=$("#mm").getBoundingClientRect();
  if(rc.width>0 && rc.width<720){
    var w=Math.min(box.w,540);
    var h=w*(rc.height/Math.max(rc.width,1));
    viewBox={x:0,y:Math.max(0,(box.h-h)/2),w:w,h:h};
  }else{
    viewBox={x:0,y:0,w:box.w,h:box.h};
  }
  applyVB();
  var em=$("#mmEmpty");if(em) em.classList.add("hide");
}

function fitView(){
  if(!$("#mm")._box) return;
  var b=$("#mm")._box;
  viewBox={x:0,y:0,w:b.w,h:b.h};
  applyVB();
}

function renderCards(){
  var wrap=$("#cards");wrap.innerHTML="";
  if(!state.tree) return;
  var secs=state.tree.children||[];
  secs.forEach(function(sec,i){
    var div=document.createElement("div");
    div.className="kcard";
    var lead=sec.lead||"";
    var bullets=(sec.children||[]).slice(0,3).map(function(c){return "<li>"+esc(c.label)+"</li>"}).join("");
    var kws=(sec.kws||[]).map(function(k){return '<span class="kw">'+esc(k)+"</span>"}).join("");
    div.innerHTML='<div class="ktag">主题 '+String(i+1).padStart(2,"0")+"</div>"+
      '<div class="ktitle">'+esc(sec.label)+"</div>"+
      '<div class="klead">'+esc(brief(lead))+"</div>"+
      (bullets?'<ul class="klist">'+bullets+"</ul>":"")+
      (kws?'<div class="kwords">'+kws+"</div>":"");
    wrap.appendChild(div);
  });
  var all=[];
  secs.forEach(function(s){all=all.concat(s.children||[])});
  if(all.length){
    var q=document.createElement("div");
    q.className="kcard quote";
    q.innerHTML='<div class="ktag">金句</div><p>'+esc(all[0].label)+"</p>";
    wrap.appendChild(q);
  }
}

function renderOutline(){
  var o=$("#outlineBody");o.innerHTML="";
  if(!state.tree) return;
  var html='<h1>'+esc(state.title)+"</h1>";
  var words=state.words||countText($("#raw").value);
  html+='<div class="meta">'+state.tree.children.length+" 个主题 · 约 "+words+" 字 · 阅读约 "+Math.max(1,Math.round(words/400))+" 分钟"+(state.fromCloud?" · 来自拆解广场":"")+"</div><ol>";
  (state.tree.children||[]).forEach(function(sec){
    html+="<li><b>"+esc(sec.label)+"</b>";
    if(sec.children&&sec.children.length){
      html+="<ol>";
      sec.children.forEach(function(c){html+="<li>"+esc(c.label)+"</li>"});
      html+="</ol>";
    }
    html+="</li>";
  });
  html+="</ol>";
  o.innerHTML=html;
}

function renderStats(){
  var words=state.words||countText($("#raw").value);
  var s=$("#stats");
  if(!state.tree){s.innerHTML="";return}
  s.innerHTML='<span class="chip">主题 <em>'+state.tree.children.length+"</em></span>"+
    '<span class="chip">约 <em>'+words+'</em> 字</span>'+
    '<span class="chip"><em>'+Math.max(1,Math.round(words/400))+"</em> 分钟读完</span>";
  $("#cnt").textContent=words+" 字";
}

function run(){
  var raw=$("#raw").value;
  if(!raw || countText(raw)<40){
    if(/^https?:\/\/\S+$/i.test((raw||"").trim())){
      toast("浏览器不允许直接读取公众号链接，请把正文复制过来");
      return;
    }
    toast("先粘一段正文，至少 40 字");return;
  }
  var r=analyze(raw,"");
  if(!r||!r.sections.length){toast("没读出结构，试试粘贴完整正文");return}
  state.title=r.title;state.sections=r.sections;state.tree=r.tree;
  state.words=countText($("#raw").value);state.ai=null;state.fromCloud=false;
  $("#aiBox").classList.remove("on");$("#aiBox").innerHTML="";
  renderMindmap();renderCards();renderOutline();renderStats();
  $("#footNote").textContent="已拆解 · 本地解析";
  toast("拆完了：识别出 "+r.sections.length+" 个主题");
}

function outlineText(){
  if(!state.tree) return "";
  var out=["# "+state.title,""];
  (state.tree.children||[]).forEach(function(sec){
    out.push("## "+sec.label);
    if(sec.lead) out.push("> "+brief(sec.lead));
    (sec.children||[]).forEach(function(c){out.push("- "+c.label)});
    out.push("");
  });
  return out.join("\n");
}

function cardsText(){
  if(!state.tree) return "";
  var out=["# "+state.title+" · 知识卡",""];
  (state.tree.children||[]).forEach(function(sec,i){
    out.push("### "+(i+1)+". "+sec.label);
    if(sec.lead) out.push(brief(sec.lead));
    (sec.children||[]).forEach(function(c){out.push("- "+c.label)});
    if((sec.kws||[]).length) out.push("关键词："+sec.kws.join(" / "));
    out.push("");
  });
  return out.join("\n");
}

function download(name,blob){
  var a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=name;
  document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},600);
}

function exportMD(){
  if(!state.tree){toast("先拆一篇");return}
  download((state.title||"文脉").slice(0,20)+".md",new Blob([outlineText()+"\n\n---\n\n"+cardsText()],{type:"text/markdown;charset=utf-8"}));
  toast("Markdown 已导出");
}

function exportPNG(){
  if(!state.tree){toast("先拆一篇");return}
  var src=$("#mm");
  var clone=src.cloneNode(true);
  var b=src._box||{w:viewBox.w,h:viewBox.h};
  clone.setAttribute("viewBox","0 0 "+b.w+" "+b.h);
  clone.setAttribute("width",b.w*2);
  clone.setAttribute("height",b.h*2);
  clone.insertBefore((function(){
    var r=document.createElementNS("http://www.w3.org/2000/svg","rect");
    r.setAttribute("x",0);r.setAttribute("y",0);r.setAttribute("width",b.w);r.setAttribute("height",b.h);
    r.setAttribute("fill","#FCFBF7");return r;
  })(),clone.firstChild);
  var s=new XMLSerializer().serializeToString(clone);
  var img=new Image();
  img.onload=function(){
    var c=document.createElement("canvas");
    c.width=b.w*2;c.height=b.h*2;
    var ctx=c.getContext("2d");
    ctx.fillStyle="#FCFBF7";ctx.fillRect(0,0,c.width,c.height);
    ctx.drawImage(img,0,0);
    c.toBlob(function(bl){download((state.title||"文脉").slice(0,20)+"-脑图.png",bl);toast("脑图 PNG 已导出")});
  };
  img.onerror=function(){toast("导出失败，试试截屏")};
  img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s);
}

function copyOutline(){
  var t=outlineText();
  if(!t){toast("先拆一篇");return}
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(t).then(function(){toast("大纲已复制")},function(){fallbackCopy(t)});
  }else fallbackCopy(t);
}
function fallbackCopy(t){
  var ta=document.createElement("textarea");
  ta.value=t;ta.style.position="fixed";ta.style.opacity="0";
  document.body.appendChild(ta);ta.select();
  try{document.execCommand("copy");toast("大纲已复制")}catch(e){toast("复制失败，请手动选择")}
  ta.remove();
}

function switchTab(name){
  $$(".tab").forEach(function(b){b.classList.toggle("on",b.dataset.tab===name)});
  $("#v-mm").classList.toggle("on",name==="mm");
  $("#v-cards").classList.toggle("on",name==="cards");
  $("#v-outline").classList.toggle("on",name==="outline");
  state.view=name;
}

function cloudGuard(){
  var c=cloudClient();
  if(!c){toast("云服务没连上，刷新页面再试");return null}
  return c;
}

var sqRows=[];
function syncCounts(){
  $("#svTc").textContent=$("#svTitle").value.length+"/120";
  $("#svSc").textContent=$("#svSummary").value.length+"/300";
}
function openSave(){
  if(!state.tree){toast("先拆一篇");return}
  if(!cloudGuard()) return;
  $("#svTitle").value=state.title||"未命名文章";
  $("#svSummary").value=(state.ai&&state.ai.summary)||((state.tree.children[0]&&state.tree.children[0].lead)||"");
  syncCounts();
  $("#saveDlg").classList.add("on");
}
async function doSave(){
  var c=cloudGuard(); if(!c) return;
  var t=$("#svTitle").value.trim(),s=$("#svSummary").value.trim();
  if(!t){toast("先填个标题");return}
  var btn=$("#svOk");btn.disabled=true;btn.textContent="保存中…";
  try{
    var res=await c.database.from("wenmai_notes").insert({
      client_id:clientId(),
      title:t.slice(0,120),
      summary:s?s.slice(0,300):null,
      topics:(state.tree.children||[]).length,
      words:state.words||0,
      tree:serializeTree(state.tree)
    }).select();
    if(res.error) throw res.error;
    $("#saveDlg").classList.remove("on");
    $("#footNote").textContent="已保存到拆解广场";
    toast("已保存，别人可以在广场里点开");
  }catch(e){
    toast("保存失败："+cloudError(e));
  }finally{
    btn.disabled=false;btn.textContent="保存";
  }
}

function openSquare(){
  $("#square").classList.add("on");
  loadSquare();
}
async function loadSquare(){
  var c=cloudClient();
  var list=$("#sqList");
  if(!c){list.innerHTML='<div class="dempty">云服务没连上<br>刷新页面后再试</div>';return}
  list.innerHTML='<div class="dempty">正在读取…</div>';
  try{
    var res=await c.database.from("wenmai_notes")
      .select("id,title,summary,topics,words,created_at,client_id,tree")
      .order("created_at",{ascending:false})
      .limit(50);
    if(res.error) throw res.error;
    sqRows=res.data||[];
    if(!sqRows.length){
      list.innerHTML='<div class="dempty">广场还空着<br>点「保存到广场」，你的拆解就出现在这里</div>';
      $("#sqNote").textContent="0 条";return;
    }
    var me=clientId();
    list.innerHTML=sqRows.map(function(r,i){
      var d=new Date(r.created_at);
      var ts=(d.getMonth()+1)+"月"+d.getDate()+"日 "+("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2);
      return '<div class="sqitem" data-i="'+i+'"><b>'+esc(r.title)+"</b>"+
        (r.summary?'<p>'+esc(r.summary)+"</p>":"")+
        '<span class="sqmeta">'+r.topics+" 个主题 · 约 "+r.words+" 字 · "+ts+
        (r.client_id===me?" · <em>我的</em>":"")+"</span></div>";
    }).join("");
    $("#sqNote").textContent=sqRows.length+" 条 · 云端";
    $$(".sqitem",list).forEach(function(el){
      el.onclick=function(){loadRecord(sqRows[+el.getAttribute("data-i")])};
    });
  }catch(e){
    list.innerHTML='<div class="dempty">读取失败：'+esc(cloudError(e))+"</div>";
  }
}
function loadRecord(rec){
  if(!rec||!rec.tree) return;
  state.title=rec.title;
  state.tree=rec.tree;
  state.words=rec.words||0;
  state.sections=[];
  state.ai=rec.summary?{summary:rec.summary,points:[]}:null;
  state.fromCloud=true;
  renderMindmap();renderCards();renderOutline();renderStats();renderAI();
  $("#footNote").textContent="来自拆解广场 · "+(rec.topics||0)+" 个主题";
  $("#square").classList.remove("on");
  switchTab("mm");
  toast("已载入："+String(rec.title).slice(0,14));
}

function renderAI(){
  var box=$("#aiBox");
  if(!state.ai||!state.ai.summary){box.classList.remove("on");box.innerHTML="";return}
  var pts=(state.ai.points||[]).filter(Boolean);
  box.innerHTML='<div class="aiTag">AI 提炼</div><p>'+esc(state.ai.summary)+"</p>"+
    (pts.length?"<ul>"+pts.map(function(p){return "<li>"+esc(p)+"</li>"}).join("")+"</ul>":"");
  box.classList.add("on");
}
function bind(){
  $("#buildBtn").onclick=run;
  $("#clearBtn").onclick=function(){
    $("#raw").value="";$("#cnt").textContent="0 字";
    state.tree=null;state.words=0;state.ai=null;state.fromCloud=false;
    $("#mmg").innerHTML="";$("#cards").innerHTML="";$("#outlineBody").innerHTML="";
    $("#stats").innerHTML="";$("#footNote").textContent="解析在本地 · 保存时共享标题、摘要与结构";$("#inspect").classList.remove("on");
    $("#aiBox").classList.remove("on");$("#aiBox").innerHTML="";
    $("#mmEmpty").classList.remove("hide");
  };
  $("#saveBtn").onclick=openSave;
  $("#squareBtn").onclick=openSquare;
  $("#sqClose").onclick=function(){$("#square").classList.remove("on")};
  $("#sqRefresh").onclick=loadSquare;
  $("#svCancel").onclick=function(){$("#saveDlg").classList.remove("on")};
  $("#svOk").onclick=doSave;
  $("#svTitle").addEventListener("input",syncCounts);
  $("#svSummary").addEventListener("input",syncCounts);
  $("#saveDlg").onclick=function(e){if(e.target.id==="saveDlg")$("#saveDlg").classList.remove("on")};
  $("#raw").addEventListener("input",function(){
    $("#cnt").textContent=countText($("#raw").value)+" 字";
  });
  $("#raw").addEventListener("keydown",function(e){
    if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){$("#buildBtn").click()}
  });
  $$(".tab").forEach(function(b){b.onclick=function(){switchTab(b.dataset.tab)}});
  $("#helpBtn").onclick=function(){$("#help").classList.add("on")};
  $("#helpClose").onclick=function(){$("#help").classList.remove("on")};
  $("#help").onclick=function(e){if(e.target.id==="help")$("#help").classList.remove("on")};
  $("#mdBtn").onclick=exportMD;
  $("#pngBtn").onclick=exportPNG;
  $("#copyBtn").onclick=copyOutline;

  $$(".depth").forEach(function(b){
    b.onclick=function(){
      $$(".depth").forEach(function(x){x.classList.remove("on")});
      b.classList.add("on");
      state.deep=+b.dataset.d;
      renderMindmap();
      $("#inspect").classList.remove("on");
    };
  });

  var svg=$("#mm");
  $("#zin").onclick=function(){zoomAt(0.8)};
  $("#zout").onclick=function(){zoomAt(1.25)};
  $("#zfit").onclick=fitView;

  function zoomAt(k){
    var cx=viewBox.x+viewBox.w/2,cy=viewBox.y+viewBox.h/2;
    viewBox.w*=k;viewBox.h*=k;
    viewBox.x=cx-viewBox.w/2;viewBox.y=cy-viewBox.h/2;
    applyVB();
  }
  svg.addEventListener("wheel",function(e){
    e.preventDefault();
    var r=svg.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var k=e.deltaY>0?1.12:0.89;
    var px=viewBox.x+(mx/r.width)*viewBox.w;
    var py=viewBox.y+(my/r.height)*viewBox.h;
    viewBox.w*=k;viewBox.h*=k;
    viewBox.x=px-(mx/r.width)*viewBox.w;
    viewBox.y=py-(my/r.height)*viewBox.h;
    applyVB();
  },{passive:false});

  var drag=null;
  svg.addEventListener("pointerdown",function(e){
    var hit=e.target.closest?e.target.closest("g.nodehit"):null;
    drag={x:e.clientX,y:e.clientY,vx:viewBox.x,vy:viewBox.y,moved:false};
    svg.setPointerCapture(e.pointerId);
    svg.classList.add("drag");
  });
  svg.addEventListener("pointermove",function(e){
    if(!drag) return;
    var r=svg.getBoundingClientRect();
    var dx=(e.clientX-drag.x)/r.width*viewBox.w;
    var dy=(e.clientY-drag.y)/r.height*viewBox.h;
    if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)>3) drag.moved=true;
    viewBox.x=drag.vx-dx;viewBox.y=drag.vy-dy;
    applyVB();
  });
  function endDrag(){drag=null;svg.classList.remove("drag")}
  svg.addEventListener("pointerup",endDrag);
  svg.addEventListener("pointerleave",endDrag);

  svg.addEventListener("click",function(e){
    var t=e.target;
    var label="",src="";
    while(t && t!==svg){
      if(t.getAttribute&&t.getAttribute("data-src")!==null && t.getAttribute("data-src")!==undefined){
        src=t.getAttribute("data-src")||"";label=t.getAttribute("data-label")||"";
        break;
      }
      t=t.parentNode;
    }
    if(src){
      var ins=$("#inspect");
      ins.innerHTML="<b>原文 · "+esc(label)+"</b><br>"+esc(src);
      ins.classList.add("on");
    }
  });
}

function initDemos(){
  var wrap=$("#demos");
  DEMOS.forEach(function(d,i){
    var b=document.createElement("button");
    b.className="demo";b.textContent=d.name;
    b.onclick=function(){
      $("#raw").value=d.text;
      $("#cnt").textContent=countText(d.text)+" 字";
      run();
    };
    wrap.appendChild(b);
  });
}

initDemos();
bind();
$("#raw").value=DEMOS[0].text;
$("#cnt").textContent=countText(DEMOS[0].text)+" 字";

})();
