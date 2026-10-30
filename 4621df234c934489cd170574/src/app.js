import { sql } from "./db.js";
const style = document.createElement("style");
style.textContent = "\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\nhtml,body{margin:0;padding:0}\nbody{\n  font-family:-apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Microsoft YaHei\",\"Segoe UI\",Roboto,sans-serif;\n  background:#f4f6f8;color:#1c2430;line-height:1.55;\n  padding:0 0 72px;\n}\n.wrap{max-width:980px;margin:0 auto;padding:0 20px}\n\n/* ── header ── */\nheader{padding:28px 0 6px}\n.brand{display:flex;align-items:center;gap:10px}\n.logo{\n  width:38px;height:38px;border-radius:11px;flex:0 0 auto;\n  background:linear-gradient(140deg,#0f8f76,#0a6b5c);\n  color:#fff;display:flex;align-items:center;justify-content:center;\n  font-size:19px;font-weight:700;letter-spacing:-1px;\n  box-shadow:0 6px 16px rgba(15,143,118,.28)\n}\n.brand h1{font-size:19px;margin:0;letter-spacing:.3px}\n.brand .sub{font-size:12px;color:#6b7885;margin-top:1px}\n.tagline{margin:18px 0 6px;font-size:15px;color:#46525f;max-width:620px}\n.tagline b{color:#0a6b5c}\n\n/* ── cards ── */\n.card{\n  background:#fff;border:1px solid #e5eaee;border-radius:16px;\n  padding:20px;margin-top:16px;\n  box-shadow:0 1px 2px rgba(20,35,50,.04)\n}\n.card-h{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:14px}\n.card-h h2{font-size:15px;margin:0;font-weight:650;letter-spacing:.2px}\n.card-h .hint{font-size:11.5px;color:#8c99a5}\n\n/* ── form ── */\n.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 18px}\n.field{display:flex;flex-direction:column;gap:6px}\n.field label{font-size:12px;color:#5c6b78;font-weight:550}\n.field label em{font-style:normal;color:#98a4b0;font-weight:400}\n.field input[type=text],.field input[type=time],.field input[type=number],.field select{\n  width:100%;padding:9px 11px;border:1px solid #dde4ea;border-radius:9px;\n  font-size:16px;font-family:inherit;background:#fbfcfd;color:#1c2430;\n  transition:border-color .15s,background .15s\n}\n.field input:focus,.field select:focus{outline:none;border-color:#0f8f76;background:#fff}\n.field select{\n  -webkit-appearance:none;appearance:none;\n  background-image:url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%236b7885' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E\");\n  background-repeat:no-repeat;background-position:right 11px center;padding-right:30px\n}\n.seg{display:flex;background:#eef2f5;border-radius:10px;padding:3px}\n.seg button{\n  flex:1;border:0;background:transparent;padding:7px 4px;border-radius:8px;\n  font-family:inherit;font-size:12.5px;color:#5c6b78;cursor:pointer;transition:.15s\n}\n.seg button.on{background:#fff;color:#0a6b5c;font-weight:650;box-shadow:0 1px 3px rgba(20,35,50,.1)}\n\n/* ── routes ── */\n.route{\n  border:1px solid #e5eaee;border-radius:13px;padding:14px;margin-bottom:12px;background:#fcfdfe\n}\n.route-top{display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap}\n.dot{width:9px;height:9px;border-radius:50%;flex:0 0 auto}\n.route-name{\n  flex:1 1 150px;min-width:120px;border:0;border-bottom:1px dashed #cfd9e1;\n  padding:3px 2px;font-size:14px;font-weight:600;font-family:inherit;\n  background:transparent;color:#1c2430\n}\n.route-name:focus{outline:none;border-bottom-color:#0f8f76}\n.chip{\n  font-size:11px;padding:2px 8px;border-radius:999px;background:#eef2f5;color:#5c6b78\n}\n.rm{\n  border:0;background:transparent;color:#a9b4bf;font-size:18px;line-height:1;\n  cursor:pointer;padding:0 4px\n}\n.rm:hover{color:#d94a3d}\n.route-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:10px 12px}\n.route-fields .field label{font-size:11px}\n.route-fields input{padding:7px 9px;font-size:15px}\n.route-foot{display:flex;justify-content:space-between;align-items:center;margin-top:11px;gap:10px;flex-wrap:wrap}\n.mech{font-size:11.5px;color:#7c8996}\n.mech b{color:#33414f;font-weight:600}\n.mini-warn{font-size:11.5px;color:#b4741b}\n\n/* ── buttons ── */\n.btn{\n  border:0;border-radius:10px;padding:9px 16px;font-family:inherit;font-size:13px;\n  cursor:pointer;transition:.15s;font-weight:600\n}\n.btn-ghost{background:#fff;border:1px solid #dde4ea;color:#41505e}\n.btn-ghost:hover{border-color:#0f8f76;color:#0a6b5c}\n.btn-main{\n  width:100%;margin-top:6px;padding:13px;font-size:15px;\n  background:linear-gradient(180deg,#129e83,#0c7a66);color:#fff;\n  box-shadow:0 8px 20px rgba(12,122,102,.24)\n}\n.btn-main:active{transform:translateY(1px)}\n\n/* ── verdict ── */\n.verdict{\n  display:none;margin-top:18px;border-radius:16px;padding:22px;\n  background:linear-gradient(150deg,#0d7d69,#0a5f52);color:#fff;\n  box-shadow:0 12px 30px rgba(10,95,82,.22)\n}\n.verdict.show{display:block}\n.verdict .v-k{font-size:11.5px;opacity:.78;letter-spacing:1px}\n.verdict .v-main{font-size:22px;font-weight:700;margin:4px 0 2px;letter-spacing:.3px}\n.verdict .v-sub{font-size:13px;opacity:.9}\n.verdict .v-row{display:flex;gap:26px;margin-top:18px;flex-wrap:wrap}\n.verdict .v-cell .n{font-size:20px;font-weight:700}\n.verdict .v-cell .l{font-size:11px;opacity:.75}\n\n/* ── results ── */\n.res{margin-top:16px}\n.res-row{\n  display:grid;grid-template-columns:150px 1fr 84px;gap:14px;align-items:center;\n  padding:12px 4px;border-bottom:1px solid #eef2f5\n}\n.res-row:last-child{border-bottom:0}\n.res-row.best{background:#f2faf7;border-radius:10px;padding:12px 10px;border-bottom:0;margin-bottom:4px}\n.res-name{font-size:13.5px;font-weight:600;display:flex;align-items:center;gap:7px}\n.res-name .tag{font-size:10px;padding:1px 6px;border-radius:5px;background:#0f8f76;color:#fff;font-weight:600}\n.bar{height:9px;border-radius:5px;background:#eef2f5;overflow:hidden}\n.bar i{display:block;height:100%;border-radius:5px;transition:width .5s ease}\n.res-meta{font-size:11.5px;color:#7c8996;margin-top:5px;display:flex;gap:12px;flex-wrap:wrap}\n.res-meta b{color:#33414f;font-weight:600}\n.res-rate{text-align:right}\n.res-rate .p{font-size:17px;font-weight:700}\n.res-rate .l{font-size:10.5px;color:#8c99a5}\n\n.legend{display:flex;gap:16px;flex-wrap:wrap;font-size:11.5px;color:#7c8996;margin-top:8px}\n.legend span{display:flex;align-items:center;gap:5px}\n.legend i{width:9px;height:9px;border-radius:3px;display:inline-block}\n\n/* ── tips ── */\n.tip{\n  display:flex;gap:12px;padding:12px 14px;border-radius:11px;background:#fbfcfd;\n  border:1px solid #eef2f5;margin-bottom:10px;font-size:13px;color:#41505e\n}\n.tip .k{\n  flex:0 0 auto;width:22px;height:22px;border-radius:50%;background:#e6f4f0;color:#0a6b5c;\n  font-size:11.5px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px\n}\n.tip b{color:#1c2430}\n\n/* ── faq ── */\ndetails{border-top:1px solid #eef2f5;padding:12px 0}\ndetails:first-of-type{border-top:0}\nsummary{\n  cursor:pointer;font-size:13.5px;font-weight:600;list-style:none;\n  display:flex;justify-content:space-between;align-items:center;gap:10px\n}\nsummary::-webkit-details-marker{display:none}\nsummary::after{content:\"+\";color:#0f8f76;font-size:16px;font-weight:400}\ndetails[open] summary::after{content:\"−\"}\ndetails p{margin:8px 0 0;font-size:12.8px;color:#5c6b78;line-height:1.75}\ndetails p b{color:#33414f}\n\nfooter{text-align:center;font-size:11.5px;color:#9aa6b2;padding:26px 0 10px;line-height:1.9}\nfooter b{color:#65727f}\n\n@media(max-width:620px){\n  .wrap{padding:0 14px}\n  .grid{grid-template-columns:1fr}\n  .res-row{grid-template-columns:1fr 64px;grid-template-areas:\"name rate\" \"bar bar\";gap:8px 10px}\n  .res-name{grid-area:name}.bar{grid-area:bar}.res-rate{grid-area:rate}\n  .verdict .v-row{gap:18px}\n  .brand h1{font-size:17px}\n}\n";
document.head.appendChild(style);
document.getElementById("app").innerHTML = "\n<div class=\"wrap\">\n\n<header>\n  <div class=\"brand\">\n    <div class=\"logo\">通</div>\n    <div>\n      <h1>通勤决策台</h1>\n      <div class=\"sub\">Commute Deck · 赶不赶得上，先算再走</div>\n    </div>\n  </div>\n  <p class=\"tagline\">早高峰的路况从来不是一个数字。把每条路线拆成<b>固定耗时</b>和<b>会抖动的耗时</b>，算出你在打卡前到岗的概率——比“平均 32 分钟”有用得多。</p>\n</header>\n\n<!-- 参数 -->\n<section class=\"card\">\n  <div class=\"card-h\">\n    <h2>一、今天的时间安排</h2>\n    <span class=\"hint\">填写后自动重算</span>\n  </div>\n  <div class=\"grid\">\n    <div class=\"field\">\n      <label>出门时间</label>\n      <input id=\"depart\" type=\"time\" value=\"08:05\">\n    </div>\n    <div class=\"field\">\n      <label>规定到岗时间</label>\n      <input id=\"deadline\" type=\"time\" value=\"09:00\">\n    </div>\n    <div class=\"field\">\n      <label>我能接受的迟到上限 <em>分钟</em></label>\n      <input id=\"tolerance\" max=\"60\" min=\"0\" step=\"1\" type=\"number\" value=\"5\">\n    </div>\n    <div class=\"field\">\n      <label>换乘 / 出站缓冲 <em>分钟</em></label>\n      <input id=\"buffer\" max=\"60\" min=\"0\" step=\"1\" type=\"number\" value=\"6\">\n    </div>\n    <div class=\"field\" style=\"grid-column:1/-1\">\n      <label>天气 / 路况</label>\n      <div class=\"seg\" id=\"weatherSeg\">\n        <button class=\"on\" data-w=\"sunny\" type=\"button\">☀️ 正常</button>\n        <button data-w=\"rain\" type=\"button\">🌧 雨天 +18%</button>\n        <button data-w=\"storm\" type=\"button\">⛈ 暴雨 +35%</button>\n        <button data-w=\"event\" type=\"button\">🎪 大活动 +25%</button>\n      </div>\n    </div>\n  </div>\n</section>\n\n<!-- 路线 -->\n<section class=\"card\">\n  <div class=\"card-h\">\n    <h2>二、我的常用路线</h2>\n    <span class=\"hint\">固定耗时 = 不会变的部分；波动 = 等车、堵车、找车的浮动</span>\n  </div>\n  <div id=\"routes\"></div>\n  <button class=\"btn btn-ghost\" id=\"addRoute\" type=\"button\">＋ 添加一条路线</button>\n  <button class=\"btn btn-main\" id=\"calc\" type=\"button\">算一算今天怎么走</button>\n\n  <div class=\"verdict\" id=\"verdict\">\n    <div class=\"v-k\">今日建议</div>\n    <div class=\"v-main\" id=\"vMain\">—</div>\n    <div class=\"v-sub\" id=\"vSub\"></div>\n    <div class=\"v-row\">\n      <div class=\"v-cell\"><div class=\"n\" id=\"vRate\">—</div><div class=\"l\">准点到岗率</div></div>\n      <div class=\"v-cell\"><div class=\"n\" id=\"vTypical\">—</div><div class=\"l\">典型到达耗时</div></div>\n      <div class=\"v-cell\"><div class=\"n\" id=\"vMargin\">—</div><div class=\"l\">相对截止的余量</div></div>\n    </div>\n  </div>\n</section>\n\n<!-- 结果 -->\n<section class=\"card\" id=\"resultCard\" style=\"display:none\">\n  <div class=\"card-h\">\n    <h2>三、各路线准点到岗率</h2>\n    <span class=\"hint\">按到达时间的分布计算，不是按平均值</span>\n  </div>\n  <div class=\"res\" id=\"res\"></div>\n  <div class=\"legend\">\n    <span><i style=\"background:#0f8f76\"></i>≥85% 稳</span>\n    <span><i style=\"background:#c9a227\"></i>60–85% 有风险</span>\n    <span><i style=\"background:#d94a3d\"></i>&lt;60% 大概率迟到</span>\n    <span><i style=\"background:#0f6fb5\"></i>打车浮动最大</span>\n  </div>\n</section>\n\n<!-- 建议 -->\n<section class=\"card\" id=\"tipCard\" style=\"display:none\">\n  <div class=\"card-h\">\n    <h2>四、今天怎么用这几条路线</h2>\n    <span class=\"hint\">根据上面的计算生成</span>\n  </div>\n  <div id=\"tips\"></div>\n</section>\n\n<!-- 说明 -->\n<section class=\"card\">\n  <div class=\"card-h\"><h2>使用说明与算法口径</h2></div>\n  <details open>\n    <summary>怎么填才准？</summary>\n    <p>先连走三天，每天记一下实际到达时间。<b>固定耗时</b>取你最快的那个用时，<b>波动</b>取（最慢 − 最快）÷ 2。例如地铁最快 26 分钟、最慢 38 分钟，就填固定 26、波动 6。</p>\n  </details>\n  <details>\n    <summary>“准点到岗率”是怎么算的？</summary>\n    <p>每条路线的总耗时 = 固定耗时 + 波动项。波动项按对数正态分布采样（<b>只会拖慢、不会提前</b>，符合等车和堵车的实际表现），再加上天气系数与换乘缓冲。对 4000 次模拟统计“到达时间 ≤ 规定到岗 + 迟到上限”的比例，即为准点到岗率。</p>\n  </details>\n  <details>\n    <summary>为什么不直接看平均耗时？</summary>\n    <p>两条路线平均都是 34 分钟，一条几乎不变，一条有时 22 分钟有时 50 分钟——风险完全不同。只看平均值会让人在暴雨天选错路。这里给出的是<b>分布</b>和<b>达标概率</b>，也就是“迟到的可能性有多大”。</p>\n  </details>\n  <details>\n    <summary>红色和蓝色有什么区别？</summary>\n    <p>颜色只表示准点到岗率高低。打车类路线的波动通常最大，柱状条右侧会标出它的波动区间，方便你看清“最坏会到几点”。</p>\n  </details>\n  <details>\n    <summary>数据存在哪里？</summary>\n    <p>路线和时间设置保存在当前应用的数据库中，可在登录后重新打开。</p>\n  </details>\n</section>\n\n<footer>\n  <b>通勤决策台</b><br>\n  本工具提供的是时间概率参考，不构成出行或考勤建议 · 设置保存在应用数据库\n</footer>\n\n</div>\n\n";

(function(){
"use strict";


/* 演示用默认路线：逻辑与真实一致，普通人可一键替换成自己的 */
var DEFAULT_ROUTES = [
  {name:"地铁 2 号线 → 换乘 1 号线", color:"#0f6fb5", fixed:28, jitter:6, mode:"metro"},
  {name:"家门口直达公交", color:"#c9a227", fixed:24, jitter:14, mode:"bus"},
  {name:"骑行到地铁口 + 地铁", color:"#0f8f76", fixed:31, jitter:5, mode:"bike"},
  {name:"打车走快速路", color:"#7a5cc4", fixed:26, jitter:18, mode:"car"}
];

var WEATHER = {
  sunny:{label:"正常", factor:1.00},
  rain:{label:"雨天", factor:1.18},
  storm:{label:"暴雨", factor:1.35},
  event:{label:"大活动", factor:1.25}
};

var state = {weather:"sunny", routes:[]};

/* ── 工具 ── */
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
});}
function toMin(t){
  var m=/^(\d{1,2}):(\d{2})$/.exec(String(t||""));
  if(!m) return null;
  return (+m[1])*60 + (+m[2]);
}
function fmtHM(min){
  min = Math.round(min);
  var h = Math.floor(min/60) % 24, m = min % 60;
  return (h<10?"0":"")+h + ":" + (m<10?"0":"")+m;
}
function pct(x){return Math.round(x*100) + "%";}

/* 对数正态采样：只拖慢不提前 */
function sampleJitter(sigma){
  if(sigma <= 0) return 0;
  var u1 = Math.random(), u2 = Math.random();
  var z = Math.sqrt(-2*Math.log(u1||1e-9)) * Math.cos(2*Math.PI*u2);
  var mu = -0.5*sigma*sigma;           // 让 E[e^z] = 1，波动项平均为 0 额外
  return (Math.exp(mu + sigma*z) - 1);
}

/* ── 渲染路线编辑区 ── */
function renderRoutes(){
  var box = $("routes");
  box.innerHTML = state.routes.map(function(r,i){
    return '<div class="route" data-i="'+i+'">'
      + '<div class="route-top">'
      +   '<span class="dot" style="background:'+esc(r.color)+'"></span>'
      +   '<input class="route-name" data-k="name" maxlength="24" value="'+esc(r.name)+'" placeholder="路线名称">'
      +   '<span class="chip">'+modeLabel(r.mode)+'</span>'
      +   '<button class="rm" data-rm="'+i+'" type="button" title="删除这条路线">×</button>'
      + '</div>'
      + '<div class="route-fields">'
      +   '<div class="field"><label>固定耗时 <em>分钟</em></label>'
      +     '<input type="number" data-k="fixed" min="1" max="240" step="1" value="'+esc(r.fixed)+'"></div>'
      +   '<div class="route-fields" style="display:contents">'
      +   '<div class="field"><label>波动 <em>±分钟</em></label>'
      +     '<input type="number" data-k="jitter" min="0" max="120" step="1" value="'+esc(r.jitter)+'"></div>'
      +   '</div>'
      +   '<div class="field"><label>出行方式</label>'
      +     '<select data-k="mode">'
      +       ['metro','bus','bike','car','walk'].map(function(m){
                return '<option value="'+m+'"'+(r.mode===m?' selected':'')+'>'+modeLabel(m)+'</option>';
              }).join('')
      +     '</select></div>'
      +   '<div class="field"><label>颜色</label>'
      +     '<select data-k="color">'
      +       ['#0f6fb5','#0f8f76','#c9a227','#d94a3d','#7a5cc4','#3b8a3b'].map(function(c){
                return '<option value="'+c+'"'+(r.color===c?' selected':'')+'>'+colorLabel(c)+'</option>';
              }).join('')
      +     '</select></div>'
      + '</div>'
      + '<div class="route-foot">'
      +   '<span class="mech">最快约 <b>'+Math.round(r.fixed)+'</b> 分钟，最慢可能到 <b>'+Math.round(r.fixed + r.jitter*2.4)+'</b> 分钟</span>'
      +   (r.mode==='walk' && r.jitter>10 ? '<span class="mini-warn">步行波动填这么大不太常见</span>' : '')
      + '</div>'
      + '</div>';
  }).join("");

  // 绑定
  Array.prototype.forEach.call(box.querySelectorAll(".route"), function(el){
    var i = +el.dataset.i;
    Array.prototype.forEach.call(el.querySelectorAll("[data-k]"), function(inp){
      inp.addEventListener("input", function(){
        var k = inp.dataset.k, v = inp.value;
        if(k==="fixed"||k==="jitter") v = Math.max(0, parseInt(v||"0",10)||0);
        state.routes[i][k] = v;
        if(k==="fixed"||k==="jitter"){
          var f = state.routes[i].fixed, j = state.routes[i].jitter;
          var mech = el.querySelector(".mech");
          if(mech) mech.innerHTML = '最快约 <b>'+Math.round(f)+'</b> 分钟，最慢可能到 <b>'+Math.round(f + j*2.4)+'</b> 分钟';
        }
        if(k==="mode"){
          var chip = el.querySelector(".chip");
          if(chip) chip.textContent = modeLabel(v);
        }
        save();
      });
      inp.addEventListener("change", function(){ save(); });
    });
  });
  Array.prototype.forEach.call(box.querySelectorAll("[data-rm]"), function(b){
    b.addEventListener("click", function(){
      var i = +b.dataset.rm;
      if(state.routes.length <= 1){ toast("至少保留一条路线"); return; }
      state.routes.splice(i,1);
      save(); renderRoutes();
    });
  });
}

function modeLabel(m){
  return {metro:"地铁",bus:"公交",bike:"骑行",car:"打车",walk:"步行"}[m] || "其他";
}
function colorLabel(c){
  return {"#0f6fb5":"蓝","#0f8f76":"绿","#c9a227":"黄","#d94a3d":"红","#7a5cc4":"紫","#3b8a3b":"深绿"}[c] || "蓝";
}

/* ── 计算 ── */
function simulate(){
  var dep = toMin($("depart").value) || 485;
  var ddl = toMin($("deadline").value) || 540;
  var tol = Math.max(0, parseInt($("tolerance").value||"0",10) || 0);
  var buf = Math.max(0, parseInt($("buffer").value||"0",10) || 0);
  var wf  = WEATHER[state.weather].factor;
  var limit = ddl + tol;                 // 到达时间上限（当天分钟数）
  var N = 4000;

  var out = state.routes.map(function(r){
    var fixed = Math.max(1, +r.fixed || 1);
    var jit   = Math.max(0, +r.jitter || 0);
    // 波动折算成对数正态的 sigma：jitter 视作 1 个标准差的量级
    var sigma = jit > 0 ? Math.min(0.9, jit / Math.max(8, fixed*0.85)) : 0;
    var sum = 0, ok = 0, samples = [];
    for(var i=0;i<N;i++){
      var used = (fixed + jit * sampleJitter(sigma) ) * wf + buf;
      samples.push(used);
      sum += used;
      if(dep + used <= limit) ok++;
    }
    samples.sort(function(a,b){return a-b;});
    var q = function(p){ return samples[Math.min(N-1, Math.floor(p*N))]; };
    return {
      name: r.name, color: r.color, mode: r.mode,
      mean: sum/N,
      p10: q(0.10), p50: q(0.50), p90: q(0.90),
      arriveMedian: dep + q(0.50),
      arriveP90: dep + q(0.90),
      arriveWorst: dep + q(0.99),
      rate: ok/N
    };
  });
  out.sort(function(a,b){ return b.rate - a.rate || a.p50 - b.p50; });
  return {rows: out, dep: dep, limit: limit, tol: tol, buf: buf, wf: wf, ddl: ddl};
}

function colorOf(rate){
  if(rate >= 0.85) return "#0f8f76";
  if(rate >= 0.60) return "#c9a227";
  return "#d94a3d";
}

function renderResult(res){
  var rows = res.rows;
  var maxP90 = Math.max.apply(null, rows.map(function(r){return r.p90;})) * 1.05;

  $("resultCard").style.display = "";
  $("res").innerHTML = rows.map(function(r,i){
    var w = Math.min(100, Math.max(4, r.p90 / maxP90 * 100));
    var isBest = i === 0;
    return '<div class="res-row'+(isBest?' best':'')+'">'
      + '<div class="res-name">'
      +   '<span class="dot" style="background:'+esc(r.color)+'"></span>'
      +   '<span>'+esc(r.name)+'</span>'
      +   (isBest ? '<span class="tag">推荐</span>' : '')
      + '</div>'
      + '<div>'
      +   '<div class="bar"><i style="width:'+w+'%;background:'+colorOf(r.rate)+'"></i></div>'
      +   '<div class="res-meta">'
      +     '<span>耗时中位 <b>'+Math.round(r.p50)+'</b> 分</span>'
      +     '<span>到达 <b>'+fmtHM(r.arriveMedian)+'</b>（中位）</span>'
      +     '<span>最坏 <b>'+fmtHM(r.arriveWorst)+'</b></span>'
      +   '</div>'
      + '</div>'
      + '<div class="res-rate">'
      +   '<div class="p" style="color:'+colorOf(r.rate)+'">'+pct(r.rate)+'</div>'
      +   '<div class="l">准点率</div>'
      + '</div>'
      + '</div>';
  }).join("");

  var best = rows[0];
  var second = rows[1];
  $("verdict").classList.add("show");
  $("vMain").textContent = best.name;
  $("vSub").textContent  = "出门 " + fmtHM(res.dep) + "，中位到达 " + fmtHM(best.arriveMedian)
    + "，卡在 " + fmtHM(res.ddl) + " 前到岗的概率约 " + pct(best.rate) + "。";
  $("vRate").textContent    = pct(best.rate);
  $("vTypical").textContent = Math.round(best.p50) + " 分";
  var margin = res.limit - best.arriveMedian;
  $("vMargin").textContent  = (margin >= 0 ? "+" : "") + Math.round(margin) + " 分";

  // 建议
  var tips = [];
  if(best.rate >= 0.9){
    tips.push(["可以走", "<b>" + esc(best.name) + "</b> 的准点到岗率约 " + pct(best.rate) + "，今天风险不大。按 " + fmtHM(res.dep) + " 出门即可。"]);
  } else if(best.rate >= 0.6){
    tips.push(["有风险", "最好的路线准点率也只有 " + pct(best.rate) + "，" + (margin < 3 ? "余量已经很薄。" : "") + "建议提前 <b>" + Math.max(5, Math.ceil((0.9 - best.rate) * 30 / 5) * 5) + " 分钟</b>出门，或改走下面这条。"]);
  } else {
    tips.push(["今天大概率迟到", "所有路线准点率都低于 60%。最早也要提前 <b>" + Math.max(10, Math.ceil((res.limit - best.arriveMedian))) + " 分钟</b>出门，同时建议先给同事或主管打个招呼。"]);
  }

  if(second){
    var gap = second.rate - best.rate;
    if(gap >= 0 && gap < 0.08){
      tips.push(["两条差不多", "<b>" + esc(second.name) + "</b> 与推荐路线只差 " + Math.round(gap*100) + " 个百分点，可以按体感选：坐得舒服点就走它。"]);
    } else if(best.rate - second.rate > 0.25 && second.rate < 0.6){
      tips.push(["避开的路线", "<b>" + esc(second.name) + "</b> 今天准点率只有 " + pct(second.rate) + "，波动太大，先别赌。"]);
    }
  }

  if(res.wf > 1.05){
    tips.push(["天气提醒", "已按「" + WEATHER[state.weather].label + "」把整体耗时放大约 " + Math.round((res.wf-1)*100) + "%。雨天最容易拉长的是等车和打车接驾，地铁相对稳。"]);
  }

  var carRows = rows.filter(function(r){return r.mode === "car";});
  if(carRows.length){
    var c = carRows[0];
    tips.push(["打车的代价", "<b>" + esc(c.name) + "</b> 中位 " + Math.round(c.p50) + " 分，但 10% 的情况会超过 " + Math.round(c.p90) + " 分——浮动区间 " + Math.round(c.p10) + "—" + Math.round(c.p90) + " 分，是全表最宽的一条。"]);
  }

  if(res.buf >= 3){
    tips.push(["缓冲在算什么", "已计入 " + res.buf + " 分钟的换乘/出站缓冲。这段最容易被人忽略：它不产生里程，却每天都在消耗你的余量。"]);
  }

  $("tipCard").style.display = "";
  $("tips").innerHTML = tips.slice(0,5).map(function(t,i){
    return '<div class="tip"><div class="k">'+(i+1)+'</div><div><b>'+t[0]+'</b>：'+t[1]+'</div></div>';
  }).join("");
}

function run(){
  var res = simulate();
  renderResult(res);
}

/* ── 存储 ── */
function showStorageError(message){
 var el=document.getElementById("storageError");
 if(!el){el=document.createElement("div");el.id="storageError";el.setAttribute("role","alert");el.style.cssText="padding:12px;background:#fff0e8;color:#803b20;text-align:center";document.querySelector(".wrap").prepend(el);}
 el.textContent=message;
}
var saveQueue = Promise.resolve(), savingAllowed = false;
function save(){
 if(!savingAllowed) return;
 var payload=JSON.stringify({weather:state.weather,routes:state.routes,depart:$("depart").value,deadline:$("deadline").value,tolerance:$("tolerance").value,buffer:$("buffer").value});
 saveQueue=saveQueue.then(async function(){
  if(!savingAllowed) return;
  try {await sql("INSERT INTO commute_settings (id, document) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET document=excluded.document",[payload]);}
  catch(e){try {var rows=(await sql("SELECT document FROM commute_settings WHERE id=1")).rows; if(rows[0]?.document===payload) return;} catch(_){} savingAllowed=false; showStorageError("保存结果未确认，当前输入保留在页面，请重新打开检查数据库。");}
 });
}
async function load(){
 var rows=(await sql("SELECT document FROM commute_settings WHERE id=1")).rows;
 var d=rows.length ? JSON.parse(rows[0].document) : null;
 if(d && Array.isArray(d.routes) && d.routes.length){
  state.weather=WEATHER[d.weather] ? d.weather : "sunny";
  state.routes=d.routes.map(function(r){return {name:String(r.name||"未命名路线"),color:/^#[0-9a-f]{6}$/i.test(r.color||"") ? r.color : "#0f6fb5",fixed:Math.max(1,parseInt(r.fixed,10)||20),jitter:Math.max(0,parseInt(r.jitter,10)||0),mode:r.mode||"metro"};});
  if(d.depart) $("depart").value=d.depart; if(d.deadline) $("deadline").value=d.deadline;
  if(d.tolerance != null) $("tolerance").value=d.tolerance; if(d.buffer != null) $("buffer").value=d.buffer;
 } else state.routes=JSON.parse(JSON.stringify(DEFAULT_ROUTES));
}
function resetAll(){
  state.weather = "sunny";
  state.routes = JSON.parse(JSON.stringify(DEFAULT_ROUTES));
  $("depart").value = "08:05"; $("deadline").value = "09:00";
  $("tolerance").value = 5; $("buffer").value = 6;
  syncWeatherSeg(); renderRoutes(); run(); save();
}

/* ── toast ── */
var toastT = null;
function toast(msg){
  var el = document.getElementById("__toast");
  if(!el){
    el = document.createElement("div");
    el.id = "__toast";
    el.style.cssText = "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);"
      + "background:rgba(28,36,48,.92);color:#fff;font-size:13px;padding:10px 18px;"
      + "border-radius:999px;z-index:99;pointer-events:none;opacity:0;transition:opacity .2s";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = "1";
  clearTimeout(toastT);
  toastT = setTimeout(function(){ el.style.opacity = "0"; }, 1800);
}

/* ── 天气切换 ── */
function syncWeatherSeg(){
  Array.prototype.forEach.call($("weatherSeg").querySelectorAll("button"), function(b){
    b.classList.toggle("on", b.dataset.w === state.weather);
  });
}
$("weatherSeg").addEventListener("click", function(e){
  var b = e.target.closest("button[data-w]");
  if(!b) return;
  state.weather = b.dataset.w;
  syncWeatherSeg(); save(); run();
});

/* ── 事件 ── */
$("addRoute").addEventListener("click", function(){
  if(state.routes.length >= 8){ toast("最多 8 条路线，够用了"); return; }
  var palette = ["#0f6fb5","#0f8f76","#c9a227","#d94a3d","#7a5cc4","#3b8a3b"];
  state.routes.push({
    name: "新路线 " + (state.routes.length + 1),
    color: palette[state.routes.length % palette.length],
    fixed: 25, jitter: 8, mode: "metro"
  });
  save(); renderRoutes();
});
$("calc").addEventListener("click", function(){
  run(); save();
  $("resultCard").scrollIntoView({behavior:"smooth", block:"start"});
});
["depart","deadline","tolerance","buffer"].forEach(function(id){
  $(id).addEventListener("change", function(){ run(); save(); });
});
// 重置按钮（放在说明里，低调）
var resetLink = document.createElement("button");
resetLink.type = "button";
resetLink.className = "btn btn-ghost";
resetLink.style.cssText = "margin-top:4px;font-size:12px;padding:6px 12px";
resetLink.textContent = "恢复演示数据";
resetLink.addEventListener("click", function(){ resetAll(); toast("已恢复演示路线"); });
document.querySelector("footer").parentNode.insertBefore(resetLink, document.querySelector("footer"));

/* ── 初始化 ── */
document.querySelectorAll("input, button, select").forEach(function(el){el.disabled=true;});
load().then(function(){savingAllowed=true; syncWeatherSeg(); renderRoutes(); run(); run(); document.querySelectorAll("input, button, select").forEach(function(el){el.disabled=false;});}).catch(function(){state.routes=JSON.parse(JSON.stringify(DEFAULT_ROUTES)); syncWeatherSeg(); renderRoutes(); run(); document.querySelectorAll("input, button, select").forEach(function(el){el.disabled=true;}); showStorageError("数据库读取失败，请重新打开应用。当前页面不可保存。");});

})();
