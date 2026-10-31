const style=document.createElement("style"); style.textContent="\n  :root{\n    --bg:#f4f6fb; --card:#ffffff; --ink:#1f2733; --muted:#6b7686;\n    --brand:#3b6ef5; --brand2:#7aa2ff; --accent:#f5921b; --line:#e6ebf3;\n    --good:#2faa6a;\n  }\n  *{box-sizing:border-box;margin:0;padding:0}\n  body{\n    font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n    background:linear-gradient(180deg,#eef3ff 0%,#f4f6fb 220px);color:var(--ink);\n    line-height:1.55;padding:0 0 60px;\n  }\n  header{\n    max-width:1040px;margin:0 auto;padding:34px 20px 18px;\n  }\n  .logo{display:flex;align-items:center;gap:12px}\n  .logo .mark{\n    width:46px;height:46px;border-radius:14px;\n    background:linear-gradient(135deg,var(--brand),var(--brand2));\n    display:flex;align-items:center;justify-content:center;font-size:24px;\n    box-shadow:0 6px 18px rgba(59,110,245,.35);\n  }\n  h1{font-size:26px;letter-spacing:.5px}\n  .sub{color:var(--muted);font-size:14px;margin-top:4px}\n  .wrap{max-width:1040px;margin:0 auto;padding:0 20px;display:grid;grid-template-columns:340px 1fr;gap:20px}\n  @media(max-width:860px){.wrap{grid-template-columns:1fr}}\n  .card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;box-shadow:0 8px 24px rgba(31,39,51,.05)}\n  .card h2{font-size:15px;margin-bottom:14px;color:var(--muted);font-weight:600;letter-spacing:.5px}\n  .field{margin-bottom:18px}\n  .field .top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}\n  .field label{font-size:14px;font-weight:600}\n  .field .val{font-size:14px;color:var(--brand);font-weight:700}\n  input[type=range]{width:100%;accent-color:var(--brand);height:6px;cursor:pointer}\n  .num{width:100%;margin-top:8px;padding:7px 10px;border:1px solid var(--line);border-radius:9px;font-size:14px;color:var(--ink)}\n  .seg{display:flex;background:#eef1f7;border-radius:11px;padding:4px;gap:4px}\n  .seg button{flex:1;border:none;background:transparent;padding:9px 0;border-radius:8px;font-size:13.5px;font-weight:600;color:var(--muted);cursor:pointer}\n  .seg button.on{background:#fff;color:var(--brand);box-shadow:0 2px 6px rgba(0,0,0,.08)}\n  .presets{display:flex;gap:8px;margin-top:4px}\n  .presets button{flex:1;border:1px solid var(--line);background:#fff;border-radius:10px;padding:9px 0;font-size:13px;font-weight:600;color:var(--ink);cursor:pointer}\n  .presets button:hover{border-color:var(--brand2);color:var(--brand)}\n  .chartwrap{position:relative}\n  canvas{width:100%;height:340px;display:block}\n  .tip{position:absolute;pointer-events:none;background:rgba(31,39,51,.92);color:#fff;font-size:12px;padding:8px 10px;border-radius:8px;transform:translate(-50%,-115%);white-space:nowrap;opacity:0;transition:opacity .1s}\n  .tip b{color:#ffd591}\n  .legend{display:flex;gap:18px;flex-wrap:wrap;margin-top:10px;font-size:13px;color:var(--muted)}\n  .legend i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-1px}\n  .metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:18px}\n  .metric{background:#f7f9fd;border:1px solid var(--line);border-radius:12px;padding:14px}\n  .metric .k{font-size:12.5px;color:var(--muted)}\n  .metric .v{font-size:21px;font-weight:800;margin-top:3px}\n  .metric .v.good{color:var(--good)}\n  .metric .v.brand{color:var(--brand)}\n  .metric .v.accent{color:var(--accent)}\n  .note{font-size:12.5px;color:var(--muted);margin-top:16px;line-height:1.6}\n  .help{margin-top:20px}\n  .help h3{font-size:14px;margin-bottom:8px}\n  .help ol{margin-left:18px;font-size:13px;color:var(--muted)}\n  .help li{margin-bottom:6px}\n  .tag{display:inline-block;background:#eef3ff;color:var(--brand);font-size:12px;padding:3px 9px;border-radius:999px;margin-right:6px}\n  footer{max-width:1040px;margin:26px auto 0;padding:0 20px;color:#9aa3b2;font-size:12px;text-align:center}\n  .disclaimer{margin-top:10px;font-size:12px;color:#b0b8c4}\n"; document.head.appendChild(style);
document.getElementById("app").innerHTML="\n<header>\n  <div class=\"logo\">\n    <div class=\"mark\">📈</div>\n    <div>\n      <h1>复利时光机</h1>\n      <div class=\"sub\">定投 / 复利收益模拟器 · 拖动滑块，看见时间的力量</div>\n    </div>\n  </div>\n</header>\n\n<div class=\"wrap\">\n  <!-- 控制面板 -->\n  <section class=\"card\" id=\"panel\">\n    <h2>参数设置</h2>\n\n    <div class=\"field\">\n      <div class=\"top\"><label>投资方式</label></div>\n      <div class=\"seg\" id=\"mode\">\n        <button data-mode=\"dca\" class=\"on\">每月定投</button>\n        <button data-mode=\"lump\">一次性投入</button>\n      </div>\n    </div>\n\n    <div class=\"field\" id=\"f-lump\">\n      <div class=\"top\"><label>一次性本金</label><span class=\"val\" id=\"v-lump\"></span></div>\n      <input type=\"range\" id=\"lump\" min=\"0\" max=\"1000000\" step=\"10000\" value=\"200000\">\n      <input type=\"number\" class=\"num\" id=\"lumpN\" min=\"0\" step=\"10000\">\n    </div>\n\n    <div class=\"field\" id=\"f-dca\">\n      <div class=\"top\"><label>每月定投金额</label><span class=\"val\" id=\"v-m\"></span></div>\n      <input type=\"range\" id=\"m\" min=\"0\" max=\"30000\" step=\"500\" value=\"3000\">\n      <input type=\"number\" class=\"num\" id=\"mN\" min=\"0\" step=\"500\">\n    </div>\n\n    <div class=\"field\">\n      <div class=\"top\"><label>起始本金（可选）</label><span class=\"val\" id=\"v-p0\"></span></div>\n      <input type=\"range\" id=\"p0\" min=\"0\" max=\"500000\" step=\"10000\" value=\"50000\">\n      <input type=\"number\" class=\"num\" id=\"p0N\" min=\"0\" step=\"10000\">\n    </div>\n\n    <div class=\"field\">\n      <div class=\"top\"><label>预期年化收益率</label><span class=\"val\" id=\"v-r\"></span></div>\n      <input type=\"range\" id=\"r\" min=\"0\" max=\"20\" step=\"0.5\" value=\"8\">\n      <input type=\"number\" class=\"num\" id=\"rN\" min=\"0\" step=\"0.5\">\n    </div>\n\n    <div class=\"field\">\n      <div class=\"top\"><label>投资年限</label><span class=\"val\" id=\"v-y\"></span></div>\n      <input type=\"range\" id=\"y\" min=\"1\" max=\"40\" step=\"1\" value=\"20\">\n      <input type=\"number\" class=\"num\" id=\"yN\" min=\"1\" step=\"1\">\n    </div>\n\n    <div class=\"field\">\n      <div class=\"top\"><label>年通胀率（看实际购买力）</label><span class=\"val\" id=\"v-infl\"></span></div>\n      <input type=\"range\" id=\"infl\" min=\"0\" max=\"10\" step=\"0.5\" value=\"3\">\n      <input type=\"number\" class=\"num\" id=\"inflN\" min=\"0\" step=\"0.5\">\n    </div>\n\n    <div class=\"field\">\n      <div class=\"top\"><label>快捷情景</label></div>\n      <div class=\"presets\">\n        <button data-r=\"4\" data-y=\"20\">保守 4%</button>\n        <button data-r=\"8\" data-y=\"20\">稳健 8%</button>\n        <button data-r=\"12\" data-y=\"30\">进取 12%</button>\n      </div>\n    </div>\n  </section>\n\n  <!-- 结果 -->\n  <section class=\"card\">\n    <h2>收益曲线（按年）</h2>\n    <div class=\"chartwrap\">\n      <canvas id=\"chart\"></canvas>\n      <div class=\"tip\" id=\"tip\"></div>\n    </div>\n    <div class=\"legend\">\n      <span><i style=\"background:#3b6ef5\"></i>资产总值</span>\n      <span><i style=\"background:#9aa3b2\"></i>累计投入本金</span>\n      <span><i style=\"background:#f5921b\"></i>通胀后实际购买力</span>\n    </div>\n\n    <div class=\"metrics\">\n      <div class=\"metric\"><div class=\"k\">累计投入本金</div><div class=\"v\" id=\"m-invest\">—</div></div>\n      <div class=\"metric\"><div class=\"k\">期末资产总值</div><div class=\"v brand\" id=\"m-final\">—</div></div>\n      <div class=\"metric\"><div class=\"k\">累计投资收益</div><div class=\"v good\" id=\"m-profit\">—</div></div>\n      <div class=\"metric\"><div class=\"k\">实际购买力（剔除通胀）</div><div class=\"v accent\" id=\"m-real\">—</div></div>\n      <div class=\"metric\"><div class=\"k\">总收益率</div><div class=\"v\" id=\"m-rate\">—</div></div>\n      <div class=\"metric\"><div class=\"k\">本金翻倍数</div><div class=\"v\" id=\"m-mult\">—</div></div>\n    </div>\n\n    <div class=\"help\">\n      <h3>怎么看这张图？</h3>\n      <ol>\n        <li>蓝色线是你**真实的资产总值**（本金 + 复利收益），橙线是把这笔钱按通胀折算成今天的购买力，灰线是你**实际掏出的本金**。</li>\n        <li>两条线之间的差距，就是「时间 + 复利」替你赚的钱。年限越长、收益率越高，差距越夸张。</li>\n        <li>橙线低于蓝线，说明名义上钱变多了，但购买力被通胀吃掉了一部分——这就是为什么要投资。</li>\n        <li>拖动左侧任意滑块，图表和指标会实时更新。</li>\n      </ol>\n      <div style=\"margin-top:10px\">\n        <span class=\"tag\">教育演示</span><span class=\"tag\">纯前端</span><span class=\"tag\">数据不出本机</span>\n      </div>\n    </div>\n    <div class=\"disclaimer\">⚠️ 本工具仅用于理财教育演示，所有数字为假设性测算，不构成任何投资建议。投资有风险，入市需谨慎。</div>\n  </section>\n</div>\n\n<footer>\n  复利时光机 v1.0 · 所有计算均在你的浏览器本地完成\n</footer>\n\n";

(function(){
  const $ = id => document.getElementById(id);
  const fmt = n => '¥' + Math.round(n).toLocaleString('zh-CN');
  const fmtW = n => n>=1e8 ? (n/1e8).toFixed(2)+'亿' : n>=1e4 ? (n/1e4).toFixed(1)+'万' : Math.round(n).toLocaleString('zh-CN');

  const ids = ['lump','m','p0','r','y','infl'];
  const state = {};
  let mode = 'dca';

  function syncLabels(){
    $('v-lump').textContent = fmtW(+$('lump').value);
    $('v-m').textContent = fmtW(+$('m').value);
    $('v-p0').textContent = fmtW(+$('p0').value);
    $('v-r').textContent = (+$('r').value).toFixed(1) + '%';
    $('v-y').textContent = $('y').value + ' 年';
    $('v-infl').textContent = (+$('infl').value).toFixed(1) + '%';
  }
  function syncNums(){
    ids.forEach(k=>{ const n=$(''+k+'N'); if(n) n.value = $(''+k).value; });
  }

  // 联动：range 与 number 互相同步
  ids.forEach(k=>{
    const range=$(k), num=$(''+k+'N');
    range.addEventListener('input',()=>{ if(num) num.value=range.value; syncLabels(); compute(); });
    if(num) num.addEventListener('input',()=>{ range.value=num.value; syncLabels(); compute(); });
  });

  // 模式切换
  $('mode').addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b) return;
    mode=b.dataset.mode;
    [...$('mode').children].forEach(x=>x.classList.toggle('on',x===b));
    $('f-dca').style.display = mode==='dca'?'':'none';
    $('f-lump').style.display = mode==='lump'?'':'none';
    compute();
  });

  // 预设情景
  document.querySelectorAll('.presets button').forEach(b=>{
    b.addEventListener('click',()=>{
      $('r').value=b.dataset.r; $('y').value=b.dataset.y;
      syncNums(); syncLabels(); compute();
    });
  });

  // 核心计算
  function compute(){
    const P0=+$('p0').value;
    const r=+$('r').value/100;
    const years=+$('y').value;
    const infl=+$('infl').value/100;
    const i=Math.pow(1+r,1/12)-1;            // 月化收益率
    const m = mode==='dca' ? +$('m').value : 0;
    const lump = mode==='lump' ? +$('lump').value : 0;

    const asset=[], invest=[], real=[];
    let bal = P0 + lump;
    for(let yr=0; yr<=years; yr++){
      asset.push(bal);
      const inv = P0 + lump + m*12*yr;
      invest.push(inv);
      real.push(bal / Math.pow(1+infl, yr));
      // 推进到下一年（12 个月）
      for(let mo=0; mo<12; mo++){ bal = bal*(1+i) + m; }
    }

    const finalA=asset[years], invested=invest[years];
    const profit=finalA-invested;
    const rate = invested>0 ? (finalA/invested-1)*100 : 0;
    const mult = invested>0 ? finalA/invested : 0;

    $('m-invest').textContent = fmt(finalA*0+invested);
    $('m-final').textContent = fmt(finalA);
    $('m-profit').textContent = fmt(profit);
    $('m-real').textContent = fmt(real[years]);
    $('m-rate').textContent = (rate>=0?'+':'') + rate.toFixed(1) + '%';
    $('m-mult').textContent = mult.toFixed(2) + ' 倍';

    drawChart(asset,invest,real,years);
  }

  // 纯 Canvas 折线图（无外部依赖）
  const cv=$('chart'), ctx=cv.getContext('2d'), tip=$('tip');
  let CH={asset:[],invest:[],real:[],years:0};
  function size(){
    const dpr=window.devicePixelRatio||1;
    const w=cv.clientWidth, h=cv.clientHeight;
    cv.width=w*dpr; cv.height=h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    return {w,h};
  }
  function drawChart(a,b,c,yr){
    CH={asset:a,invest:b,real:c,years:yr};
    const {w,h}=size();
    const padL=58,padR=16,padT=14,padB=28;
    const x0=padL,x1=w-padR,y0=h-padB,y1=padT;
    const maxV=Math.max(...a,...b)*1.08 || 1;
    const N=yr;
    const X=i=> x0 + (N===0?0:(i/N))*(x1-x0);
    const Y=v=> y1 + (1 - v/maxV)*(y0-y1);

    ctx.clearRect(0,0,w,h);
    // 网格 + Y 轴刻度
    ctx.font='11px sans-serif'; ctx.textBaseline='middle';
    for(let g=0; g<=4; g++){
      const v=maxV*g/4, y=Y(v);
      ctx.strokeStyle='#eef1f7'; ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(x1,y); ctx.stroke();
      ctx.fillStyle='#9aa3b2'; ctx.textAlign='right';
      ctx.fillText(fmtW(v), x0-8, y);
    }
    // X 轴刻度
    ctx.textAlign='center'; ctx.textBaseline='top';
    const step = N<=10?1:(N<=20?5:10);
    for(let i=0;i<=N;i+=step){
      ctx.fillStyle='#9aa3b2'; ctx.fillText(i+'年', X(i), y0+8);
    }

    const line=(arr,color,dash)=>{
      ctx.strokeStyle=color; ctx.lineWidth=2.4; ctx.setLineDash(dash||[]);
      ctx.beginPath();
      arr.forEach((v,i)=>{ const x=X(i),y=Y(v); i?ctx.lineTo(x,y):ctx.moveTo(x,y); });
      ctx.stroke(); ctx.setLineDash([]);
    };
    line(b,'#9aa3b2');
    line(c,'#f5921b',[6,4]);
    line(a,'#3b6ef5');

    // 末点圆点
    const dot=(arr,color)=>{ const x=X(N),y=Y(arr[N]); ctx.fillStyle=color; ctx.beginPath(); ctx.arc(x,y,3.5,0,7); ctx.fill(); };
    dot(b,'#9aa3b2'); dot(c,'#f5921b'); dot(a,'#3b6ef5');
  }

  // 悬浮提示
  cv.addEventListener('mousemove',e=>{
    if(!CH.asset.length) return;
    const rect=cv.getBoundingClientRect();
    const mx=e.clientX-rect.left;
    const padL=58,padR=16,x0=padL,x1=rect.width-padR,N=CH.years;
    let i=Math.round((mx-x0)/(x1-x0)*N);
    i=Math.max(0,Math.min(N,i));
    const x=x0+(N===0?0:(i/N))*(x1-x0);
    const yY=v=>{ const maxV=Math.max(...CH.asset,...CH.invest)*1.08||1; const y1=14,y0=rect.height-28; return y1+(1-v/maxV)*(y0-y1); };
    tip.style.left=x+'px'; tip.style.top=yY(CH.asset[i])+'px'; tip.style.opacity=1;
    tip.innerHTML=`第 <b>${i}</b> 年<br>资产 <b>${fmt(CH.asset[i])}</b><br>本金 <b>${fmt(CH.invest[i])}</b><br>购买力 <b>${fmt(CH.real[i])}</b>`;
  });
  cv.addEventListener('mouseleave',()=>tip.style.opacity=0);
  window.addEventListener('resize',()=>{ if(CH.asset.length) drawChart(CH.asset,CH.invest,CH.real,CH.years); });

  // 初始化
  $('f-lump').style.display='none';
  syncLabels(); syncNums(); compute();
})();
