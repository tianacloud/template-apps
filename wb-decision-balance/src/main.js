import {preview} from './ui.js';
import {documentStore} from './platform.js';
import {createScenario,rank as engineRank,sensitivity as engineSensitivity,validate} from './model.js';
import {toDocument,fromDocument,removeCandidate} from './document-shape.js';
import {layout} from './layout.js';
const store=documentStore(createScenario());
let ready=false,loading=true,saving=false,dirty=false,editVersion=0,error='';
document.title='决策天平 · 多方案量化权衡器';
document.getElementById('app').innerHTML=(preview?'<div class="preview-notice">示例体验 · 数据仅保留在本页 <button class="btn sm" id="reset-example">恢复示例</button></div>':'')+layout;
if(preview)document.getElementById('storage-note').textContent='示例数据只保留在本页，不会写入云端；安装后可保存到当前应用。可随时切换顶部「场景模板」一键体验。';

"use strict";

var COLORS=["#12C87A","#3D7EFF","#F59E0B","#A855F7","#E0433B","#0EA5A4"];
var MEDALS=["🥇","🥈","🥉"];

/* ── 场景模板：打开即有真实数据可体验 ── */
var TEMPLATES=[
 {label:"选 Offer",title:"我应该选哪个 Offer？",
  options:["A 公司 · 大厂","B 公司 · 创业公司","C 公司 · 外企"],
  criteria:[{n:"薪资水平",w:9,hb:true},{n:"成长空间",w:8,hb:true},{n:"通勤耗时",w:5,hb:false},{n:"团队氛围",w:6,hb:true},{n:"稳定性",w:7,hb:true}],
  scores:[[8,6,7],[7,9,5],[7,3,5],[6,8,7],[9,4,8]]},
 {label:"买房选筹",title:"这三个楼盘该选哪个？",
  options:["甲楼盘 · 市中心","乙楼盘 · 近郊","丙楼盘 · 新区"],
  criteria:[{n:"总价",w:9,hb:false},{n:"地段",w:8,hb:true},{n:"学区",w:7,hb:true},{n:"通勤耗时",w:6,hb:false},{n:"户型",w:5,hb:true}],
  scores:[[8,4,6],[9,5,6],[6,4,8],[3,8,6],[6,8,7]]},
 {label:"技术选型",title:"前端框架该选哪个？",
  options:["React","Vue","Svelte"],
  criteria:[{n:"上手成本",w:6,hb:false},{n:"生态成熟度",w:9,hb:true},{n:"运行性能",w:7,hb:true},{n:"团队熟悉度",w:8,hb:true},{n:"长期维护性",w:7,hb:true}],
  scores:[[6,3,3],[9,8,5],[7,7,9],[8,9,3],[9,8,6]]},
 {label:"买车决策",title:"这三款车该买哪辆？",
  options:["车型 A · 纯电","车型 B · 混动","车型 C · 燃油"],
  criteria:[{n:"购车价格",w:8,hb:false},{n:"续航/油耗",w:8,hb:true},{n:"智能座舱",w:6,hb:true},{n:"品牌口碑",w:5,hb:true},{n:"空间",w:6,hb:true}],
  scores:[[7,5,4],[9,7,3],[9,6,4],[6,7,8],[7,7,8]]}
];

var S={title:"",options:[],criteria:[],step:1};
var uid=0;
function nid(){return "x"+(++uid)+Date.now().toString(36)}

/* ── 工具 ── */
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function toast(m){var t=$("toast");t.textContent=m;t.className="toast on";clearTimeout(t._t);t._t=setTimeout(function(){t.className="toast"},2100)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

/* ── 载入模板 / 新建 ── */
function loadTpl(i){
  var t=TEMPLATES[i];
  S.name=t.label;
  S.title=t.title;
  S.options=t.options.map(function(n){return{id:nid(),name:n}});
  S.criteria=t.criteria.map(function(c){return{id:nid(),name:c.n,weight:c.w,hb:c.hb}});
  S.scores={};
  t.criteria.forEach(function(c,ci){
    S.scores[c.id]=t.scores[ci];
  });
  // scores 以数组存：scores[criId] = [按 option 顺序的分数]
  var m={};
  t.criteria.forEach(function(c,ci){m[S.criteria[ci].id]=t.scores[ci].slice()});
  S.scores=m;
  save();renderAll();
}
function blank(){
  delete S.name;
  S.title="";
  S.options=[{id:nid(),name:"方案 A"},{id:nid(),name:"方案 B"},{id:nid(),name:"方案 C"}];
  S.criteria=[{id:nid(),name:"维度一",weight:5,hb:true},{id:nid(),name:"维度二",weight:5,hb:true},{id:nid(),name:"维度三",weight:5,hb:true}];
  S.scores={};
  S.criteria.forEach(function(c){S.scores[c.id]=S.options.map(function(){return 5})});
  save();renderAll();
}

function save(){if(!ready||loading||saving)return;dirty=true;editVersion++;refreshPersistenceUi()}

/* ── 计算 ── */
function normScore(s,hb){return hb?(s/10):((11-s)/10)}
function getScore(ci,oi){
  var arr=S.scores[ci]||[];
  var v=arr[oi];
  return (typeof v==="number")?v:5;
}
function setScore(ci,oi,v){
  if(!S.scores[ci])S.scores[ci]=[];
  var a=S.scores[ci].slice();
  while(a.length<S.options.length)a.push(5);
  a[oi]=v;
  S.scores[ci]=a;
}
function rankWith(weights){return engineRank(toDocument(S),weights).map(x=>({id:S.options[x.index].id,name:x.name,oi:x.index,score:x.score,parts:S.criteria.map(c=>({name:c.name,v:normScore(getScore(c.id,x.index),c.hb)}))}))}
function rank(){return rankWith(S.criteria.map(c=>c.weight))}

/* ── 反转分析 ── */
function sensitivity(){return engineSensitivity(toDocument(S)).map(x=>({name:x.name,pct:x.percent,basePct:x.basePercent,newTop:x.winner,f:x.factor}))}

/* ── 渲染 ── */
function renderAll(){renderOpts();renderCris();renderScores();renderResult();$("qTitle").value=S.title||""}

function renderOpts(){
  var h="";
  S.options.forEach(function(o,i){
    h+='<div class="row"><span class="idx">'+(i+1)+'</span>'
      +'<input type="text" data-opt="'+o.id+'" value="'+esc(o.name)+'" maxlength="24">'
      +'<button class="del" data-delopt="'+o.id+'" title="删除">✕</button></div>';
  });
  $("optList").innerHTML=h||'<div class="empty">还没有方案</div>';
}

function renderCris(){
  var tot=S.criteria.reduce(function(a,b){return a+b.weight},0)||1;
  var h="";
  S.criteria.forEach(function(c,i){
    var pct=(c.weight/tot*100);
    h+='<div class="wrow">'
      +'<div class="nm"><input type="text" data-cri="'+c.id+'" value="'+esc(c.name)+'" maxlength="16"></div>'
      +'<div class="dir"><select data-dir="'+c.id+'">'
        +'<option value="1"'+(c.hb?" selected":"")+'>越高越好</option>'
        +'<option value="0"'+(c.hb?"":" selected")+'>越低越好</option>'
      +'</select></div>'
      +'<div class="wsl"><input type="range" min="1" max="10" step="1" value="'+c.weight+'" data-w="'+c.id+'"><b>'+Math.round(pct)+'%</b></div>'
      +'<button class="del" data-delcri="'+c.id+'" title="删除">✕</button>'
      +'<div class="wbar"><i style="width:'+pct.toFixed(1)+'%"></i></div>'
      +'</div>';
  });
  $("criList").innerHTML=h||'<div class="empty">还没有维度</div>';
  $("wsum").textContent="共 "+S.criteria.length+" 个维度 · "+S.options.length+" 个方案 · 权重合计已自动归一化";
}

function renderScores(){
  var h="";
  S.criteria.forEach(function(c,ci){
    var tot=S.criteria.reduce(function(a,b){return a+b.weight},0)||1;
    h+='<div class="cbox"><div class="ch"><b>'+esc(c.name)+'</b>'
      +'<span class="tag">权重 '+Math.round(c.weight/tot*100)+'%</span>'
      +'<span class="dir2">'+(c.hb?"↑ 越高越好":"↓ 越低越好")+'</span></div><div class="sgroup">';
    S.options.forEach(function(o,oi){
      var v=getScore(c.id,oi);
      h+='<div class="sitem"><div class="sn"><i style="background:'+COLORS[oi%COLORS.length]+'"></i>'
        +'<span>'+esc(o.name)+'</span><u>'+v+'</u></div>'
        +'<input type="range" min="1" max="10" step="1" value="'+v+'" data-sc="'+ci+"|"+oi+'">'
        +'<div class="ends"><span>'+(c.hb?"1 差":"1 低")+'</span><span>'+(c.hb?"10 好":"10 高")+'</span></div>'
        +'</div>';
    });
    h+='</div></div>';
  });
  $("scoreList").innerHTML=h||'<div class="empty">请先添加维度和方案</div>';
}

function renderResult(){
  if(!S.options.length||!S.criteria.length){$("podium").innerHTML='<div class="empty">请先添加方案与维度</div>';$("radar").innerHTML="";$("insight").innerHTML="";$("rpt").value="";return}
  var r=rank(),max=r[0].score||1;
  var h="";
  r.forEach(function(x,i){
    var cls=i===0?"top1":(i===1?"top2":(i===2?"top3":""));
    h+='<div class="pd '+cls+'"><span class="rk">'+(MEDALS[i]||(i+1))+'</span>'
      +'<div class="bd"><div class="nm">'+esc(x.name)+'</div>'
      +'<div class="br"><i style="width:'+(x.score/max*100).toFixed(1)+'%;background:'+COLORS[x.oi%COLORS.length]+'"></i></div></div>'
      +'<div class="sc">'+x.score.toFixed(1)+'<small>加权分</small></div></div>';
  });
  $("podium").innerHTML=h;

  radar(r);
  insights(r);
  report(r);
}

function radar(r){
  var show=r.slice(0,3),n=S.criteria.length;
  if(n<3){$("radar").innerHTML='<div class="empty">至少 3 个维度才能画雷达图</div>';$("legend").innerHTML="";return}
  var cx=170,cy=158,R=104,W=340,H=316;
  var s='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="维度对比雷达图">';
  // 网格
  [0.25,0.5,0.75,1].forEach(function(g){
    var pts=[];
    for(var i=0;i<n;i++){
      var a=-Math.PI/2+2*Math.PI*i/n;
      pts.push((cx+R*g*Math.cos(a)).toFixed(1)+","+(cy+R*g*Math.sin(a)).toFixed(1));
    }
    s+='<polygon points="'+pts.join(" ")+'" fill="none" stroke="#E6E8EC" stroke-width="1"/>';
  });
  // 轴线 + 标签
  for(var i=0;i<n;i++){
    var a=-Math.PI/2+2*Math.PI*i/n;
    s+='<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+R*Math.cos(a)).toFixed(1)+'" y2="'+(cy+R*Math.sin(a)).toFixed(1)+'" stroke="#E6E8EC" stroke-width="1"/>';
    var lx=cx+(R+22)*Math.cos(a),ly=cy+(R+22)*Math.sin(a);
    var nm=S.criteria[i].name.length>6?S.criteria[i].name.slice(0,6)+"…":S.criteria[i].name;
    var an=lx<cx-4?"end":(lx>cx+4?"start":"middle");
    s+='<text x="'+lx.toFixed(1)+'" y="'+(ly+4).toFixed(1)+'" text-anchor="'+an+'" font-size="11" fill="#5F6672" font-family="inherit">'+esc(nm)+'</text>';
  }
  // 数据多边形
  show.forEach(function(x){
    var pts=[],col=COLORS[x.oi%COLORS.length];
    x.parts.forEach(function(p,i){
      var a=-Math.PI/2+2*Math.PI*i/n,rr=R*clamp(p.v,0.04,1);
      pts.push((cx+rr*Math.cos(a)).toFixed(1)+","+(cy+rr*Math.sin(a)).toFixed(1));
    });
    s+='<polygon points="'+pts.join(" ")+'" fill="'+col+'" fill-opacity="0.16" stroke="'+col+'" stroke-width="2" stroke-linejoin="round"/>';
    x.parts.forEach(function(p,i){
      var a=-Math.PI/2+2*Math.PI*i/n,rr=R*clamp(p.v,0.04,1);
      s+='<circle cx="'+(cx+rr*Math.cos(a)).toFixed(1)+'" cy="'+(cy+rr*Math.sin(a)).toFixed(1)+'" r="2.8" fill="'+col+'"/>';
    });
  });
  s+='</svg>';
  $("radar").innerHTML=s;
  $("legend").innerHTML=show.map(function(x){
    return '<span><i style="background:'+COLORS[x.oi%COLORS.length]+'"></i>'+esc(x.name)+'</span>';
  }).join("");
}

function insights(r){
  var h="",top=r[0],second=r[1];
  var gap=second?(top.score-second.score):0;
  if(gap<2){
    h+='<div class="ins warn"><b>⚠️ 首选与次选只差 '+gap.toFixed(1)+' 分</b>'
      +'<p><strong>'+esc(top.name)+'</strong> 与 <strong>'+esc(second.name)+'</strong> 几乎打平，说明这个决策本身很胶着，任何一个维度的微小调整都可能改变结论。建议重点看下面的反转分析。</p></div>';
  }else{
    h+='<div class="ins"><b>✅ 首选领先 '+gap.toFixed(1)+' 分</b>'
      +'<p><strong>'+esc(top.name)+'</strong> 以 '+top.score.toFixed(1)+' 分领先第二名 <strong>'+esc(second.name)+'</strong>（'+second.score.toFixed(1)+' 分），优势比较明确。</p></div>';
  }
  var sen=sensitivity();
  if(!sen.length){
    h+='<div class="ins"><b>🔒 结论相当稳健</b><p>在合理范围内调整任何单一维度的权重，首选都维持不变。说明这个结果不是由某一个因素单独决定的。</p></div>';
  }else{
    sen.forEach(function(x){
      var dir=x.f>1?"提高到":"降低到";
      h+='<div class="ins"><b>🔁 '+esc(x.name)+'：'+dir+' '+x.pct.toFixed(0)+'% 时，首选会变成「'+esc(x.newTop)+'」</b>'
        +'<p>当前该维度权重 '+x.basePct.toFixed(0)+'%。这是本决策最敏感的一个杠杆点——你对它的看重程度，直接决定了最终选谁。</p></div>';
    });
  }
  $("insight").innerHTML=h;
}

function report(r){
  var L=[];
  L.push("决策报告 · "+ (S.title||"未命名决策"));
  L.push("生成时间："+new Date().toLocaleString("zh-CN"));
  L.push("");
  L.push("【决策问题】"+(S.title||"（未填写）"));
  L.push("");
  L.push("【候选方案】");
  S.options.forEach(function(o,i){L.push("  "+(i+1)+". "+o.name)});
  L.push("");
  L.push("【维度与权重】");
  var tot=S.criteria.reduce(function(a,b){return a+b.weight},0)||1;
  S.criteria.forEach(function(c){
    L.push("  · "+c.name+"　权重 "+Math.round(c.weight/tot*100)+"%　"+(c.hb?"越高越好":"越低越好"));
  });
  L.push("");
  L.push("【打分明细】（括号内为统一为「越大越好」后的归一化值）");
  var head="  维度\\方案";
  S.options.forEach(function(o){head+="\t"+(o.name.length>8?o.name.slice(0,8):o.name)});
  L.push(head);
  S.criteria.forEach(function(c){
    var line="  "+c.name;
    S.options.forEach(function(o,oi){
      var raw=getScore(c.id,oi);
      line+="\t"+raw+" ("+normScore(raw,c.hb).toFixed(2)+")";
    });
    L.push(line);
  });
  L.push("");
  L.push("【加权结果】");
  r.forEach(function(x,i){
    L.push("  "+(i+1)+". "+x.name+"　"+x.score.toFixed(1)+" 分");
    x.parts.forEach(function(p){L.push("       - "+p.name+"："+ (p.v*10).toFixed(1) +"/10（归一化）")});
  });
  L.push("");
  L.push("【反转分析】");
  var sen=sensitivity();
  if(!sen.length){L.push("  结论稳健：单一维度权重在合理范围内调整，首选不变。")}
  else{
    sen.forEach(function(x){
      L.push("  · "+x.name+"权重"+(x.f>1?"提高到":"降低到")+" "+x.pct.toFixed(0)+"% 时，首选变为「"+x.newTop+"」（当前 "+x.basePct.toFixed(0)+"%）");
    });
  }
  L.push("");
  L.push("— 由「决策天平 · 多方案量化权衡器」生成");
  $("rpt").value=L.join("\n");
}

/* ── 事件 ── */
function go(step){
  S.step=step;
  if(ready&&location.hash!=="#"+step)history.replaceState(null,"","#"+step);
  [1,2,3].forEach(function(i){$("p"+i).className="panel"+(i===step?" on":"")});
  [].forEach.call(document.querySelectorAll(".steps button"),function(b){
    b.className=(parseInt(b.dataset.step,10)===step?"on":"");
  });
  if(step===3)renderResult();
  refreshPersistenceUi();
}
document.querySelector(".steps").addEventListener("click",function(e){
  var b=e.target.closest("button[data-step]");if(b)go(parseInt(b.dataset.step,10));
});

$("qTitle").addEventListener("input",function(){S.title=this.value;save()});

/* 方案增删改 */
$("optList").addEventListener("input",function(e){
  var t=e.target,id=t.dataset.opt;if(!id)return;
  S.options.forEach(function(o){if(o.id===id)o.name=t.value});save();renderScores();renderResult();
});
$("optList").addEventListener("click",function(e){
  var b=e.target.closest("[data-delopt]");if(!b)return;
  if(S.options.length<=2){toast("至少保留 2 个方案");return}
  var id=b.dataset.delopt;
  removeCandidate(S,id);
  save();renderAll();
});
$("addOpt").onclick=function(){
  if(S.options.length>=6){toast("最多 6 个方案");return}
  S.options.push({id:nid(),name:"方案 "+String.fromCharCode(65+S.options.length)});
  save();renderAll();
};

/* 维度增删改 */
$("criList").addEventListener("input",function(e){
  var t=e.target;
  if(t.dataset.cri){
    var id=t.dataset.cri;
    S.criteria.forEach(function(c){if(c.id===id)c.name=t.value});
    save();renderScores();renderResult();
  }else if(t.dataset.w){
    var id2=t.dataset.w,v=parseInt(t.value,10);
    S.criteria.forEach(function(c){if(c.id===id2)c.weight=v});
    save();renderCris();renderScores();renderResult();
  }
});
$("criList").addEventListener("change",function(e){
  var t=e.target;
  if(t.dataset.dir){
    var id=t.dataset.dir,hb=t.value==="1";
    S.criteria.forEach(function(c){if(c.id===id)c.hb=hb});
    save();renderScores();renderResult();
  }
});
$("criList").addEventListener("click",function(e){
  var b=e.target.closest("[data-delcri]");if(!b)return;
  if(S.criteria.length<=2){toast("至少保留 2 个维度");return}
  var id=b.dataset.delcri;
  S.criteria=S.criteria.filter(function(c){return c.id!==id});
  delete S.scores[id];
  save();renderAll();
});
$("addCri").onclick=function(){
  if(S.criteria.length>=8){toast("最多 8 个维度");return}
  var id=nid();
  S.criteria.push({id:id,name:"维度"+(S.criteria.length+1),weight:5,hb:true});
  S.scores[id]=S.options.map(function(){return 5});
  save();renderAll();
};

/* 打分 */
$("scoreList").addEventListener("input",function(e){
  var t=e.target;if(!t.dataset.sc)return;
  var p=t.dataset.sc.split("|"),ci=parseInt(p[0],10),oi=parseInt(p[1],10);
  var c=S.criteria[ci];if(!c)return;
  setScore(c.id,oi,parseInt(t.value,10));
  var u=t.parentNode.querySelector("u");if(u)u.textContent=t.value;
  save();renderResult();
});

/* 顶栏 */
$("tpl").innerHTML=TEMPLATES.map(function(t,i){return '<option value="'+i+'">场景：'+esc(t.label)+'</option>'}).join("");
$("tpl").onchange=function(){loadTpl(parseInt(this.value,10));toast("已载入「"+TEMPLATES[this.value].label+"」场景")};
$("btnNew").onclick=function(){confirmCloudAction("新建将清空当前决策，确定吗？",function(){blank();go(1);toast("已新建空白决策")})};
$("btnHelp").onclick=function(){var b=$("helpBox");b.style.display=b.style.display==="none"?"":"none"};
$("helpClose").onclick=function(){$("helpBox").style.display="none"};

/* 复制 / 打印 */
$("btnCopy").onclick=function(){
  var ta=$("rpt");
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(ta.value).then(function(){toast("报告已复制")},function(){fallbackCopy(ta)});
  }else fallbackCopy(ta);
};
function fallbackCopy(ta){ta.removeAttribute("readonly");ta.select();try{document.execCommand("copy");toast("报告已复制")}catch(e){toast("请手动复制")}ta.setAttribute("readonly","readonly")}
$("btnPrint").onclick=function(){window.print()};


function confirmCloudAction(text,action){
 if(!preview){if(confirm(text))action();return}
 if(document.getElementById('preview-confirm'))return;
 const opener=document.activeElement,mask=document.createElement('div');mask.id='preview-confirm';mask.className='preview-confirm-mask';
 mask.innerHTML='<section role="dialog" aria-modal="true" aria-labelledby="preview-confirm-title"><h3 id="preview-confirm-title"></h3><div class="foot"><button class="btn" id="preview-cancel">取消</button><button class="btn pri" id="preview-accept">确认</button></div></section>';
 mask.querySelector('h3').textContent=text;
 const background=[...document.getElementById('app').children];background.forEach(e=>e.inert=true);document.getElementById('app').append(mask);
 const close=()=>{mask.remove();background.forEach(e=>e.inert=false);if(opener?.isConnected)opener.focus()};
 mask.querySelector('#preview-cancel').onclick=close;mask.querySelector('#preview-accept').onclick=()=>{close();action()};
 mask.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}else if(e.key==='Tab'){const first=mask.querySelector('#preview-cancel'),last=mask.querySelector('#preview-accept');if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 mask.querySelector('#preview-cancel').focus();
}
function refreshPersistenceUi(){
 const blocked=!ready||loading||saving;
 document.querySelectorAll('#app input,#app select,#app button').forEach(e=>{e.disabled=blocked});
 $('reload').disabled=loading||saving;
 if(preview){$('btnPrint').disabled=true;$('export-input').disabled=true;}
 $('save-label').textContent=loading?'正在读取…':saving?'正在保存…':dirty?'有修改尚未保存':ready?'已读取当前文档':'尚未连接数据库';
 $('cloud-error').textContent=error;
 document.querySelectorAll('[data-opt]').forEach((e,i)=>e.setAttribute('aria-label','方案'+(i+1)));
 document.querySelectorAll('[data-cri]').forEach((e,i)=>e.setAttribute('aria-label','维度'+(i+1)));
 document.querySelectorAll('[data-w]').forEach((e,i)=>e.setAttribute('aria-label',S.criteria[i]?.name+'权重'));
 document.querySelectorAll('[data-dir]').forEach((e,i)=>e.setAttribute('aria-label','维度'+(i+1)+'方向'));
 document.querySelectorAll('[data-sc]').forEach(e=>{const [j,i]=e.dataset.sc.split('|').map(Number);e.setAttribute('aria-label',S.options[i]?.name+' '+S.criteria[j]?.name+'评分')});
 $('qTitle').setAttribute('aria-label','决策问题');$('tpl').setAttribute('aria-label','场景');
}
const baseRenderAll=renderAll,baseRenderOpts=renderOpts,baseRenderCris=renderCris,baseRenderScores=renderScores,baseRenderResult=renderResult;
renderOpts=function(){baseRenderOpts();refreshPersistenceUi()};renderCris=function(){baseRenderCris();refreshPersistenceUi()};renderScores=function(){baseRenderScores();refreshPersistenceUi()};renderResult=function(){baseRenderResult();refreshPersistenceUi()};renderAll=function(){baseRenderAll();refreshPersistenceUi()};
function applyDocument(value){validate(value);S=fromDocument(value,nid);renderAll();go(Math.max(1,Math.min(3,Number(location.hash.slice(1))||S.step||1)))}
async function cloudSave(){
 if(!ready||loading||saving)return;
 let snapshot;try{snapshot=structuredClone(toDocument(S));validate(snapshot)}catch(e){error=e.message;refreshPersistenceUi();toast(error);return}
 const version=editVersion;saving=true;error='';refreshPersistenceUi();
 try{await store.save(snapshot);if(editVersion===version)dirty=false;toast(dirty?'先前版本已保存，本页仍有修改尚未保存':'决策已保存')}catch(e){error=e.message;toast(error)}finally{saving=false;refreshPersistenceUi()}
}
async function cloudLoad(){
 if(saving||loading&&ready)return;loading=true;error='';refreshPersistenceUi();
 try{const loaded=await store.load();validate(loaded);applyDocument(loaded);ready=true;dirty=false;editVersion++}catch(e){error=e.message;toast(error)}finally{loading=false;refreshPersistenceUi()}
}
$('save').onclick=cloudSave;
$('reload').onclick=function(){if(loading||saving)return;if(!dirty)cloudLoad();else confirmCloudAction('重新读取并放弃本页未保存修改？',cloudLoad)};
$('export-input').onclick=function(){if(!ready||loading||saving)return;const url=URL.createObjectURL(new Blob([JSON.stringify(toDocument(S),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='决策输入.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
if(preview){$('reset-example').onclick=function(){if(loading||saving)return;applyDocument(store.reset());$("tpl").value="0";dirty=false;editVersion++;go(1);refreshPersistenceUi();toast('已恢复示例')};$('btnPrint').disabled=true}
// All conflicting header, navigation and editing actions are locked for actual load/save requests.
for(const type of ['input','change','click'])document.getElementById('app').addEventListener(type,e=>{if((!ready||loading||saving)&&e.target.closest('button,input,select')&&!(e.target.closest('#reload')&&!loading&&!saving)){e.preventDefault();e.stopImmediatePropagation()}},true);
window.addEventListener('hashchange',()=>{if(ready&&!loading&&!saving)go(Math.max(1,Math.min(3,Number(location.hash.slice(1))||1)))});
S=fromDocument(createScenario(),nid);renderAll();go(1);cloudLoad();
