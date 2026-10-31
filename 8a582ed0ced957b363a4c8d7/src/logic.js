
/* ================= 存储 ================= */
import {createTianaFetch} from "@tianacloud/serverless";
var cache={}, versions={}, writeQueue=Promise.resolve(), db;
var root=document.querySelector('.wrap'); root.inert=true;
var status=document.createElement('div'); status.setAttribute('role','status'); status.style.cssText='padding:12px;text-align:center;background:#18382e;color:white'; status.textContent='正在读取数据…'; document.body.prepend(status);
async function execute(sql,args=[]){
 const response=await db.fetch(db.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
 if(!response.ok) throw Error('数据库请求失败，写入结果可能未知');
 const body=await response.json(), result=body.results?.[0];
 if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作失败，写入结果可能未知');
 return result.response.result;
}
function load(k,d){return Object.prototype.hasOwnProperty.call(cache,k)?JSON.parse(JSON.stringify(cache[k])):d}
function save(k,v){
 const snapshot=JSON.stringify(v); cache[k]=JSON.parse(snapshot); status.textContent='正在保存…';
 writeQueue=writeQueue.then(async()=>{
   const version=versions[k]||0;
   const result=version ? await execute('UPDATE leadforge_state SET value=?, version=version+1 WHERE key=? AND version=? RETURNING version',[{type:'text',value:snapshot},{type:'text',value:k},{type:'integer',value:String(version)}]) : await execute('INSERT INTO leadforge_state(key,value,version) VALUES(?,?,1) ON CONFLICT(key) DO NOTHING RETURNING version',[{type:'text',value:k},{type:'text',value:snapshot}]);
   if(!result.rows?.length) throw Error('数据已被其他会话修改');
   versions[k]=version+1; status.textContent='已保存';
 }).catch(err=>{status.textContent='保存未确认：'+err.message+'。请刷新并核对数据后再操作。';root.inert=true;throw err});
 writeQueue.catch(()=>{});
}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function toast(m){var t=document.getElementById("toast");t.textContent=m;t.classList.add("on");clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove("on")},1900)}
function copyText(s){
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(s).then(function(){toast("已复制")},fb)}else fb();
  function fb(){var ta=document.createElement("textarea");ta.value=s;ta.style.position="fixed";ta.style.opacity=0;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");toast("已复制")}catch(e){toast("复制失败，请手动选中")}document.body.removeChild(ta)}
}
function today(){var d=new Date(),p=function(n){return n<10?"0"+n:n};return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())}

/* ================= Tab 切换 ================= */
var tabs=document.getElementById("tabs");
tabs.addEventListener("click",function(e){
  var b=e.target.closest(".tab"); if(!b)return;
  [].forEach.call(tabs.querySelectorAll(".tab"),function(x){x.classList.remove("on")});
  b.classList.add("on");
  [].forEach.call(document.querySelectorAll(".pane"),function(p){p.classList.remove("on")});
  document.getElementById("p-"+b.dataset.p).classList.add("on");
  if(b.dataset.p==="board") drawBoard();
});

/* ================= 模块 1：钩子工坊 ================= */
var FX="ALL";
function setFx(v){FX=v;["A","B","ALL"].forEach(function(k){document.getElementById(k==="ALL"?"fxAll":"fx"+k).classList.toggle("on",k===v)})}
function resetHook(){
  document.getElementById("hProd").value="凯美瑞双擎";
  document.getElementById("hWho").value="每天通勤 60 公里的上班族";
  document.getElementById("hPain").value="油价涨、养车贵、怕买错";
  document.getElementById("hRes").value="一年省下 6000 块油钱";
  genHook();
}
function genHook(){
  var P=document.getElementById("hProd").value.trim()||"这台车";
  var W=document.getElementById("hWho").value.trim()||"你";
  var N=document.getElementById("hPain").value.trim()||"买车踩坑";
  var R=document.getElementById("hRes").value.trim()||"省钱又省心";
  var out=[];

  /* 公式 A · 结果承诺 = 场景 + 痛点 + 数字 + 结果 */
  var A=[
    W+"别再硬扛"+N+"了，这台"+P+"实测"+R,
    "开了 30 天"+P+"，我把"+N+"这笔账算给你看",
    W+"选车的 3 个坑，第 2 个让"+R+"直接白搭",
    P+"真实用车 1 个月："+N+"解决了，结果是"+R,
    "预算不多的"+W+"看过来，"+P+"帮你"+R,
    W+"提车前必看的 5 个数，看完少花冤枉钱"
  ];
  /* 公式 B · 认知刷新 = 观点 + 反转 + 新知 + 证明 */
  var B=[
    "别再只看裸车价了。真正决定你五年花多少钱的，是另一个数字",
    "「省油」是最大的误解。"+P+"省钱的关键不在油耗，在这个 90% 的人忽略的地方",
    "销售不会主动告诉你：这套配置，其实一年用不上 3 次",
    "以为"+N+"是必然？我把"+P+"的账算完，结论反过来了",
    "越贵越省钱？"+P+"的这笔账，算完我自己都愣了",
    W+"买车最大的成本不是车价，是这 3 项隐性支出"
  ];

  if(FX==="A"||FX==="ALL") A.forEach(function(t){out.push({f:"A · 结果承诺",t:t})});
  if(FX==="B"||FX==="ALL") B.forEach(function(t){out.push({f:"B · 认知刷新",t:t})});

  /* 正文开头：三段式模板 */
  var bodies=[
    "先说结论：如果你是"+W+"，"+P+"这次真的可以放进候选清单。\n\n我之前也觉得"+N+"是没法避免的，直到自己提车跑了 30 天，把每一笔账都记下来——结果和我预想的完全不一样。\n\n下面这 3 点，是我认为买之前最该搞清楚的事，第 2 点销售一般不会主动说。",
    "很多"+W+"在后台问我同一个问题："+N+"到底怎么解决？\n\n我干脆把自己这台"+P+"的真实数据摊开讲。不谈参数，只讲每天开车时你真正会感受到的东西。\n\n看完你会明白，为什么我说"+R+"这件事，选对车比什么都重要。",
    "提车一个月，"+P+"最让我意外的不是省油，而是它把"+N+"这个老问题处理得比我想象中彻底。\n\n这段时间我记录了完整的用车开销，包括很多人根本不会算进去的部分。\n\n数据摆在这儿，你可以自己对号入座。"
  ];
  bodies.forEach(function(t,i){out.push({f:"正文开头 · 模板 "+(i+1),t:t})});

  document.getElementById("hookN").textContent=out.length;
  document.getElementById("hookOut").innerHTML=out.map(function(o,i){
    return '<div class="out">'+
      '<span class="tag'+(o.f.charAt(0)==="B"?" b":"")+'">'+esc(o.f)+'</span>'+
      '<button class="btn gh sm cp" onclick="copyText(this.parentNode.querySelector(\'.txt\').innerText)">复制</button>'+
      '<div class="txt">'+esc(o.t)+'</div></div>';
  }).join("");
}

/* ================= 模块 2：直播话术台 ================= */
var DEFAULT_SCRIPT=[
  {n:"开场留人",items:[
    "刚进来的朋友别划走，今天我只讲一件事：通勤族买车，怎么把钱花在刀刃上。",
    "在线的家人们扣个 1，我看看今天有多少是准备年底提车的。",
    "先说好，今天不报底价，报底价的都是骗你留资的。我讲的是你签字前必须搞清楚的 3 个数。",
    "如果你每天开车超过 40 公里，今天这条一定要看完，能帮你省下一笔实打实的钱。"
  ]},
  {n:"痛点挖掘",items:[
    "你们现在开车最烦的是什么？油耗高、保养贵、还是当初买的配置根本用不上？评论区告诉我。",
    "我猜大部分人买车的时候，算的是月供，而不是五年总成本。这两个数差得远了。",
    "有没有人跟我一样，提车三个月才发现，那个加钱选的包一次都没用过？",
    "最坑的不是买贵了，是买错了。买贵了认了，买错了要难受五年。"
  ]},
  {n:"卖点种草",items:[
    "这台车我最认可的一点：它把日常用车最花钱的那部分压下来了，不是靠减配，是靠技术路线不同。",
    "讲个具体的：同样一段通勤路，它的能耗表现和同级别油车的差距，跑一年就是几千块的现实差别。",
    "还有个细节很多人忽略——保养周期和项目。五年下来这块的差距，够你一家人出趟远门了。",
    "我说的这些不是参数，是我这一个月真实开出来的体感，你们可以自己来试。"
  ]},
  {n:"价格异议",items:[
    "贵不贵，得看跟谁比、比多久。只比裸车价没意义，要比五年总持有成本。",
    "预算卡得紧的朋友，我建议先算清楚你每年跑多少公里，再决定选哪套动力，这比砍价有用。",
    "底价我不能在这儿说，但我可以帮你把该争取的东西列清楚，你拿着去谈不吃亏。",
    "别急着问优惠多少，先问清楚落地包含什么。很多时候差距不在优惠，在杂项。"
  ]},
  {n:"邀约到店",items:[
    "想自己体验的，点右下角小风车留个联系方式，我让顾问给你安排一次完整试驾，路线我给你规划好。",
    "今天预约到店的朋友，我把刚才讲的那 3 个数做成了一张表，到店直接给你，对照着看更清楚。",
    "线上说一百句，不如你自己开一圈。试驾不收钱，但能帮你避免五年后悔。",
    "留资的朋友今天内会有顾问联系你，记得说是直播间来的，安排优先。"
  ]}
];
var script=load("script",null)||JSON.parse(JSON.stringify(DEFAULT_SCRIPT));

function renderScript(){
  document.getElementById("scriptBox").innerHTML=script.map(function(st,si){
    return '<div class="card stage">'+
      '<div class="stage-h"><span class="stage-n">'+(si+1)+'</span><b>'+esc(st.n)+'</b>'+
      '<span class="cnt">'+st.items.length+' 条</span>'+
      '<button class="icon del" style="margin-left:auto" onclick="delStage('+si+')" title="删除阶段">✕</button></div>'+
      st.items.map(function(it,ii){
        return '<div class="item">'+
          '<div class="t" contenteditable="true" data-s="'+si+'" data-i="'+ii+'" onblur="editItem(this)">'+esc(it)+'</div>'+
          '<div class="op">'+
            '<button class="icon" onclick="copyText(this.closest(\'.item\').querySelector(\'.t\').innerText)" title="复制">📋</button>'+
            '<button class="icon del" onclick="delItem('+si+','+ii+')" title="删除">✕</button>'+
          '</div></div>';
      }).join("")+
      '<button class="btn gh sm" style="margin-top:6px" onclick="addItem('+si+')">+ 加一条</button>'+
    '</div>';
  }).join("");
  updStore();
}
function editItem(el){
  var s=+el.dataset.s,i=+el.dataset.i;
  script[s].items[i]=el.innerText.trim();
  save("script",script); updStore();
}
function addItem(si){
  if(si<0){ script.push({n:"新阶段",items:["在这里写你的话术"]}); }
  else{ script[si].items.push("在这里写你的话术"); }
  save("script",script); renderScript();
}
function delItem(si,ii){ script[si].items.splice(ii,1); save("script",script); renderScript(); }
function delStage(si){ if(!confirm("删除阶段「"+script[si].n+"」？"))return; script.splice(si,1); save("script",script); renderScript(); }
function renStage(si){
  var v=prompt("重命名阶段",script[si].n); if(v==null)return;
  script[si].n=v.trim()||script[si].n; save("script",script); renderScript();
}
function resetScript(){ if(!confirm("恢复默认话术？你的修改会丢失。"))return; script=JSON.parse(JSON.stringify(DEFAULT_SCRIPT)); save("script",script); renderScript(); toast("已恢复默认") }
function exportScript(){
  var blob=new Blob([JSON.stringify(script,null,2)],{type:"application/json"});
  var a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download="leadforge-scripts-"+today()+".json"; a.click(); toast("已导出");
}

/* ================= 模块 3：线索评分器 ================= */
var LEAD_RULES={
  H:{name:"H 级 · 立即跟进",color:"var(--hot)",
     act:"30 分钟内电话联系，当天给到明确报价方案，48 小时内敲定到店时间。",
     why:"留资完整、有互动、有明确到店意愿——这类线索当天不跟，第二天就凉。",
     script:"您好，我是XX店的XX，刚才您在直播间留了信息。您关注的这台车我今天正好有现车可以安排试驾，您下午方便还是晚上方便？我把路线发给您。"},
  A:{name:"A 级 · 当日跟进",color:"var(--warn)",
     act:"当天内加微信并发送车型资料，2 天内完成一次电话邀约，锁定到店时间。",
     why:"意向明确但还没定时间——先用资料养住，再拿具体时间。",
     script:"您好，我是XX店的XX。看到您关注这台车，我把详细配置和近期政策整理了一份发您微信，您先看看。这周末有空来店试驾吗？我给您预留车位。"},
  B:{name:"B 级 · 3 日内培育",color:"var(--gold)",
     act:"加微信进内容池，3 天内推送对比测评/用车成本内容，7 天后二次邀约。",
     why:"有需求但周期偏长——硬推会掉，用内容慢慢建立信任。",
     script:"您好，我是XX店的XX。您这台车我先帮您盯着政策变化。我这边有些真实车主的用车成本和对比测评，发您参考，不着急做决定。"},
  C:{name:"C 级 · 长期池",color:"var(--ink3)",
     act:"纳入月度内容触达池，不做单独跟进，等其主动互动或活动节点再激活。",
     why:"信息不足或无明显意向——投入人力产出比太低，交给内容自动化。",
     script:"（暂不单独触达，保留在内容触达池中）"}
};
var lastLead=null;
function calcLead(){
  var s=0; for(var i=1;i<=5;i++){ s+=parseInt(document.getElementById("s"+i).value,10)||0 }
  var src=document.getElementById("sSrc").value;
  var g = s>=85?"H" : s>=70?"A" : s>=50?"B" : "C";
  var r=LEAD_RULES[g];
  document.getElementById("leadResult").style.display="";
  document.getElementById("scNum").textContent=s;
  document.getElementById("scNum").style.color=r.color;
  var ge=document.getElementById("scGrade");
  ge.textContent=r.name; ge.className="grade g-"+g;
  document.getElementById("scBar").style.width=s+"%";
  document.getElementById("scAdv").innerHTML=
    '<div class="adv"><b>为什么这么判</b><br>'+esc(r.why)+'</div>'+
    '<div class="adv"><b>下一步动作</b><br>'+esc(r.act)+'</div>'+
    '<div class="adv"><b>开口话术（可直接用）</b><br>'+esc(r.script)+'</div>'+
    '<div class="adv"><b>分项得分</b><br>留资完整度 '+(document.getElementById("s1").value)+
    ' · 互动深度 '+(document.getElementById("s2").value)+
    ' · 车系明确度 '+(document.getElementById("s3").value)+
    ' · 到店意愿 '+(document.getElementById("s4").value)+
    ' · 购车周期 '+(document.getElementById("s5").value)+
    ' · 来源 '+esc(src)+'</div>';
  lastLead={score:s,grade:g,src:src};
  return lastLead;
}
function saveLead(){
  var r=lastLead||calcLead();
  var d=load("board",[]);
  d.push({date:today(),name:"线索 "+String(d.length+1).padStart(2,"0"),car:"—",stat:r.grade==="H"||r.grade==="A"?"visit":"lead",src:r.src,score:r.score});
  save("board",d); drawBoard(); toast("已存入看板");
}

/* ================= 模块 4：转化看板 ================= */
function addBoard(){
  var date=document.getElementById("bDate").value.trim()||today();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){toast("日期格式应为 YYYY-MM-DD");return}
  var name=document.getElementById("bName").value.trim();
  var car=document.getElementById("bCar").value.trim()||"—";
  var stat=document.getElementById("bStat").value;
  var src=document.getElementById("bSrc").value;
  if(!name){ toast("请填客户标识"); return }
  var d=load("board",[]);
  d.push({date:date,name:name,car:car,stat:stat,src:src,score:null});
  save("board",d);
  document.getElementById("bName").value=""; document.getElementById("bCar").value="";
  drawBoard(); toast("已记录");
}
function delBoard(i){ var d=load("board",[]); d.splice(i,1); save("board",d); drawBoard() }
function clearBoard(){ if(!confirm("清空全部线索数据？"))return; save("board",[]); drawBoard(); toast("已清空") }
function demoBoard(){
  var names=["张先生","李女士","王哥","陈小姐","刘总","赵女士","周先生","吴姐","郑先生","孙女士","何先生","林女士"];
  var cars=["凯美瑞双擎","汉兰达","锋兰达","赛那","凯美瑞双擎","汉兰达","锋兰达","凯美瑞双擎","赛那","汉兰达","锋兰达","凯美瑞双擎"];
  var stats=["lead","lead","visit","lead","visit","deal","lead","visit","lead","deal","visit","lead"];
  var srcs=["直播","短视频","直播","私信","直播","老客转介","短视频","直播","私信","直播","短视频","直播"];
  var d=[],base=new Date(); base.setDate(base.getDate()-4);
  /* 5 天内分布 12 条，每天条数有起伏，趋势图更好看 */
  var perDay=[3,1,4,2,2];
  var di=0;
  for(var p=0;p<perDay.length;p++){
    for(var q=0;q<perDay[p]&&di<12;q++,di++){
      var dd=new Date(base); dd.setDate(dd.getDate()+p);
      var pd=function(n){return n<10?"0"+n:n};
      d.push({date:dd.getFullYear()+"-"+pd(dd.getMonth()+1)+"-"+pd(dd.getDate()),name:names[di],car:cars[di],stat:stats[di],src:srcs[di],score:null});
    }
  }
  save("board",d); drawBoard(); toast("已载入 12 条示例数据");
}
function drawBoard(){
  var d=load("board",[]);
  var lead=d.length, visit=d.filter(function(x){return x.stat==="visit"||x.stat==="deal"}).length,
      deal=d.filter(function(x){return x.stat==="deal"}).length;
  document.getElementById("k1").textContent=lead;
  document.getElementById("k2").textContent=visit;
  document.getElementById("k3").textContent=deal;
  document.getElementById("k4").textContent=(lead?Math.round(deal/lead*100):0)+"%";

  /* 漏斗 */
  var mx=Math.max(lead,1), rows=[["线索",lead,"#58a6ff"],["到店",visit,"#00a67d"],["成交",deal,"#e3b341"]];
  document.getElementById("funnel").innerHTML=rows.map(function(r,i){
    var w=Math.round(r[1]/mx*100);
    var rate = i===0 ? "100%" : (lead?Math.round(r[1]/lead*100):0)+"%";
    var conv = i===0 ? "" : '<span style="color:var(--ink3);font-size:12px"> 较线索 '+rate+'</span>';
    return '<div style="margin-bottom:11px">'+
      '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">'+
      '<span>'+r[0]+conv+'</span><b style="font-variant-numeric:tabular-nums">'+r[1]+'</b></div>'+
      '<div style="height:26px;background:var(--bg2);border-radius:7px;overflow:hidden">'+
      '<div style="height:100%;width:'+Math.max(w,2)+'%;background:'+r[2]+';opacity:.85;border-radius:7px;transition:width .5s"></div></div></div>';
  }).join("") + (lead? '' : '<div class="empty">还没有数据，点上方「载入示例数据」看效果</div>');

  /* 趋势 */
  var map={}; d.forEach(function(x){map[x.date]=(map[x.date]||0)+1});
  var keys=Object.keys(map).sort();
  if(!keys.length){ document.getElementById("trend").innerHTML='<div class="empty">暂无趋势数据</div>'; }
  else{
    var W=680,H=190,PL=34,PR=12,PT=16,PB=26;
    var mxv=Math.max.apply(null,keys.map(function(k){return map[k]}))||1;
    var iw=W-PL-PR, ih=H-PT-PB;
    var pts=keys.map(function(k,i){
      var x=PL+(keys.length===1?iw/2:i*iw/(keys.length-1));
      var y=PT+ih-(map[k]/mxv*ih);
      return {x:x,y:y,k:k,v:map[k]};
    });
    var line=pts.map(function(p,i){return (i?"L":"M")+p.x.toFixed(1)+" "+p.y.toFixed(1)}).join(" ");
    var area=line+" L"+pts[pts.length-1].x.toFixed(1)+" "+(PT+ih)+" L"+pts[0].x.toFixed(1)+" "+(PT+ih)+" Z";
    var yl="";
    for(var g=0;g<=2;g++){ var v=Math.round(mxv*g/2), y=PT+ih-(v/mxv*ih);
      yl+='<line x1="'+PL+'" y1="'+y+'" x2="'+(W-PR)+'" y2="'+y+'" stroke="#262c36"/>'+
          '<text x="'+(PL-7)+'" y="'+(y+4)+'" fill="#7d8590" font-size="10" text-anchor="end">'+v+'</text>'; }
    var xl="";
    keys.forEach(function(k,i){ if(keys.length<=7||i%Math.ceil(keys.length/6)===0){
      xl+='<text x="'+pts[i].x.toFixed(1)+'" y="'+(H-8)+'" fill="#7d8590" font-size="10" text-anchor="middle">'+k.slice(5)+'</text>'; }});
    document.getElementById("trend").innerHTML=
      '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block">'+
      '<defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0%" stop-color="#00a67d" stop-opacity=".38"/>'+
      '<stop offset="100%" stop-color="#00a67d" stop-opacity="0"/></linearGradient></defs>'+
      yl+xl+
      '<path d="'+area+'" fill="url(#g1)"/>'+
      '<path d="'+line+'" fill="none" stroke="#00d69a" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>'+
      pts.map(function(p){return '<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="3.2" fill="#0d1117" stroke="#00d69a" stroke-width="2"><title>'+p.k+"： "+p.v+' 条</title></circle>'}).join("")+
      '</svg>';
  }

  /* 明细表 */
  var S={lead:["仅线索","var(--ink3)"],visit:["已到店","var(--brand2)"],deal:["已成交","var(--gold)"]};
  var body=document.getElementById("boardBody");
  if(!d.length){ body.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--ink3);padding:22px">暂无记录</td></tr>' }
  else{
    body.innerHTML=d.slice().reverse().map(function(x,ri){
      var i=d.length-1-ri;
      return '<tr><td class="num">'+esc(x.date)+'</td><td>'+esc(x.name)+'</td><td>'+esc(x.car)+'</td>'+
        '<td style="color:'+S[x.stat][1]+'">'+S[x.stat][0]+(x.score?' · '+x.score+'分':'')+'</td>'+
        '<td>'+esc(x.src||"—")+'</td>'+
        '<td style="text-align:right"><button class="icon del" onclick="delBoard('+i+')">✕</button></td></tr>';
    }).join("");
  }
  updStore();
}
function updStore(){ document.getElementById("chipStore").textContent=load("board",[]).length }

/* ================= 初始化 ================= */
async function initialize(){
 try{
  if(typeof window.tiana?.auth?.getAccessToken!=="function"||typeof window.tiana?.connection!=="function") throw Error("应用数据库连接不可用");
  const connection=await window.tiana.connection(); if(connection.sql_api!=="hrana-v3") throw Error("当前数据库协议不支持写入");
  db={origin:connection.origin,fetch:createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:"buffered"})};
  const result=await execute('SELECT key,value,version FROM leadforge_state');
  for(const row of result.rows||[]){const [key,value,version]=row.map(cell=>cell.value);cache[key]=JSON.parse(value);versions[key]=Number(version)}
  script=load("script",null)||JSON.parse(JSON.stringify(DEFAULT_SCRIPT));
  document.getElementById("bDate").value=today();renderScript();genHook();drawBoard();root.inert=false;status.textContent='数据已读取';
 }catch(err){status.textContent='读取失败：'+err.message+'。请检查连接并刷新。'}
}
initialize();

// 托管页面的安全策略不执行内联事件，统一以事件委托调用相同操作。
document.addEventListener('click', function(event) {
  var el = event.target.closest('[onclick]'); if (!el) return;
  var action = el.getAttribute('onclick'), match;
  var simple = {addBoard, calcLead, clearBoard, demoBoard, exportScript, genHook, resetHook, resetScript, saveLead};
  if ((match = /^(\w+)\(\)$/.exec(action)) && simple[match[1]]) simple[match[1]]();
  else if ((match = /^setFx\('(A|B|ALL)'\)$/.exec(action))) setFx(match[1]);
  else if ((match = /^(addItem|delStage|delBoard)\((-?\d+)\)$/.exec(action))) ({addItem,delStage,delBoard})[match[1]](+match[2]);
  else if ((match = /^delItem\((\d+),(\d+)\)$/.exec(action))) delItem(+match[1],+match[2]);
  else if (action.indexOf('copyText(') === 0) { var text = el.closest('.item')?.querySelector('.t') || el.parentNode.querySelector('.txt'); if (text) copyText(text.innerText); }
});
document.addEventListener('focusout', function(event) { if (event.target.matches('[onblur="editItem(this)"]')) editItem(event.target); });
