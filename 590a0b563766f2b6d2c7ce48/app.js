import "./echarts.js";
import "./guide.js";
import "./data.js";

export async function mount(root, { files }) {
const style=document.createElement("style");style.textContent="\n:root{\n  --bg:#070b14; --bg2:#0d1424; --card:rgba(255,255,255,.045);\n  --line:rgba(255,255,255,.09); --line2:rgba(255,255,255,.14);\n  --tx:#e2e8f0; --tx2:#94a3b8; --tx3:#64748b;\n  --c1:#f59e0b; --c2:#38bdf8; --c3:#34d399; --c4:#94a3b8;\n  --warn:#ef4444; --acc:#22d3ee; --gold:#fbbf24;\n}\n*{box-sizing:border-box;margin:0;padding:0}\nbody{\n  background:\n    radial-gradient(1100px 600px at 12% -8%, rgba(56,189,248,.13), transparent 60%),\n    radial-gradient(900px 500px at 92% 4%, rgba(245,158,11,.09), transparent 60%),\n    linear-gradient(180deg,var(--bg),var(--bg2) 45%,var(--bg));\n  color:var(--tx); min-height:100vh;\n  font-family:\"PingFang SC\",\"Microsoft YaHei\",\"Segoe UI\",system-ui,sans-serif;\n  font-size:14px; -webkit-font-smoothing:antialiased;\n}\n/* 布局宽度统一：wrap 内所有区块（KPI / 选刊条件 / 图表 / 候选清单）同宽、同左右边距 */\n.wrap{max-width:1780px;margin:0 auto;padding:26px 24px 60px}\n.kpis,.panel,.charts,.tw{width:100%;box-sizing:border-box}\n\n/* ---------- header ---------- */\nheader{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:22px}\nh1{font-size:27px;font-weight:800;letter-spacing:.5px;line-height:1.2}\nh1 .g{background:linear-gradient(92deg,var(--c2),var(--acc) 45%,var(--gold));\n  -webkit-background-clip:text;background-clip:text;color:transparent}\n.sub{color:var(--tx3);font-size:12.5px;margin-top:7px;letter-spacing:.3px}\n.hbadge{display:flex;gap:9px;flex-wrap:wrap;align-items:center}\n.pill{background:var(--card);border:1px solid var(--line);border-radius:20px;\n  padding:6px 13px;font-size:12px;color:var(--tx2);white-space:nowrap}\n.pill b{color:var(--tx);font-weight:700}\n/* 中英文刊切换 */\n.modeswitch{display:flex;border:1px solid var(--line);border-radius:10px;overflow:hidden;margin-right:6px}\n.mbtn{background:var(--card);border:0;padding:8px 16px;font-size:12.5px;color:var(--tx2);\n  cursor:pointer;font-family:inherit;font-weight:600;transition:.16s;white-space:nowrap}\n.mbtn+.mbtn{border-left:1px solid var(--line)}\n.mbtn b{font-variant-numeric:tabular-nums;margin-left:3px}\n.mbtn:hover{color:var(--tx)}\n.mbtn.on{background:rgba(56,189,248,.2);color:#bfe9ff}\n.mbtn.on.cn-on{background:rgba(52,211,153,.18);color:#b6f2da}\n/* 模式显隐：body[data-mode] 控制，筛选格/表头/页脚各归其位 */\nbody[data-mode=cn] .en-only{display:none!important}\nbody:not([data-mode=cn]) .cn-only{display:none!important}\n\n/* ---------- KPI ---------- */\n.kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:13px;margin-bottom:20px}\n.kpi{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:15px 15px 14px;\n  position:relative;overflow:hidden;transition:.25s;display:flex;align-items:flex-start;\n  justify-content:space-between;gap:10px;min-width:0}\n.kpi:hover{border-color:var(--line2);transform:translateY(-2px)}\n.kpi::before{content:\"\";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--c2);opacity:.85}\n.kpi.k2::before{background:var(--gold)} .kpi.k3::before{background:var(--c3)}\n.kpi.k4::before{background:var(--acc)} .kpi.k5::before{background:var(--gold)}\n.kpi.k6::before{background:var(--warn)}\n.kpi .kmain{min-width:0;flex:1}\n.kpi .lb{font-size:11.5px;color:var(--tx3);letter-spacing:.4px;white-space:nowrap}\n.kpi .vl{font-size:28px;font-weight:800;margin:7px 0 3px;font-variant-numeric:tabular-nums;line-height:1}\n.kpi .vl small{font-size:13px;font-weight:600;color:var(--tx3);margin-left:2px}\n.kpi .df{font-size:11.5px;color:var(--tx3);line-height:1.5}\n.kpi .df em{font-style:normal;color:var(--c3)}\n.kpi .df em.dn{color:var(--warn)}\n/* 卡片右侧：极值/结构小指标，填补留白并给出更有用的信息 */\n.kside{flex:0 0 auto;text-align:right;font-size:10.5px;color:var(--tx3);line-height:1.55;\n  padding-left:9px;border-left:1px dashed var(--line);max-width:116px}\n.kside .sr{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.kside .sr b{color:var(--tx2);font-weight:700;font-variant-numeric:tabular-nums;margin-left:4px}\n.kside .sr.hi b{color:#7dd3fc}\n.kside .sr.lo b{color:#cbd5e1}\n.kside .hd{color:var(--tx3);letter-spacing:.3px;display:block;margin-bottom:2px}\n\n/* ---------- panel ---------- */\n.panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px 20px;margin-bottom:20px}\n.ph{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px;flex-wrap:wrap;gap:10px}\n.pt{font-size:15px;font-weight:700;display:flex;align-items:center;gap:9px}\n.pt i{width:7px;height:16px;border-radius:3px;background:linear-gradient(180deg,var(--c2),var(--acc));display:inline-block}\n.pt .n{font-size:11.5px;color:var(--tx3);font-weight:500}\n\n/* ---------- filters ---------- */\n/* 分区拓扑：领域板块整行独占（chip 自动换行），其余条件各占一格，互不挤压 */\n.fgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(350px,100%),1fr));gap:13px 16px}\n.fcell{border:1px solid var(--line);border-radius:12px;padding:11px 14px 12px;background:rgba(255,255,255,.022);min-width:0}\n.fcell.wide{grid-column:1/-1}\n.fcell .ft{font-size:11px;color:var(--tx3);letter-spacing:.5px;margin-bottom:9px;display:flex;\n  align-items:center;justify-content:space-between;gap:8px}\n.fcell .ft b{color:var(--tx2);font-weight:600;font-size:11.5px}\n.chips{display:flex;flex-wrap:wrap;gap:9px 10px}\n.frow{display:flex;align-items:center;gap:9px;flex-wrap:wrap;row-gap:9px}\n.flb{font-size:12px;color:var(--tx3);min-width:70px;letter-spacing:.3px}\n.chip{background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:8px;\n  padding:5px 11px;font-size:12px;color:var(--tx2);cursor:pointer;transition:.16s;user-select:none;\n  line-height:1.4;white-space:nowrap}\n.chip .cn{font-size:10.5px;color:var(--tx3);margin-left:5px;font-variant-numeric:tabular-nums}\n.chip:hover{border-color:var(--line2);color:var(--tx)}\n.chip.on{background:rgba(56,189,248,.16);border-color:var(--c2);color:#bfe9ff;font-weight:600}\n.chip.on .cn{color:#7dd3fc}\n.chip.on.z1{background:rgba(245,158,11,.18);border-color:var(--c1);color:#ffe4a8}\n.chip.on.z2{background:rgba(56,189,248,.18);border-color:var(--c2)}\n.chip.on.z3{background:rgba(52,211,153,.16);border-color:var(--c3);color:#b6f2da}\n.chip.on.z4{background:rgba(148,163,184,.16);border-color:var(--c4)}\n.sw{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--tx2);cursor:pointer;user-select:none}\n.sw input{appearance:none;width:34px;height:19px;border-radius:19px;background:rgba(255,255,255,.11);\n  position:relative;cursor:pointer;transition:.2s;border:1px solid var(--line)}\n.sw input::after{content:\"\";position:absolute;top:2px;left:2px;width:13px;height:13px;border-radius:50%;\n  background:var(--tx2);transition:.2s}\n.sw input:checked{background:rgba(56,189,248,.35);border-color:var(--c2)}\n.sw input:checked::after{left:17px;background:var(--c2)}\n.sw input[type=range].rg{appearance:none;width:150px;height:19px;background:none;border:0}\n/* 区间控件：滑块 + 最小/最大数值框 */\n.rng{display:flex;align-items:center;gap:11px;flex-wrap:wrap;row-gap:8px}\ninput[type=range]{-webkit-appearance:none;appearance:none;width:190px;height:3px;border-radius:3px;\n  background:rgba(255,255,255,.16);outline:none;border:0;flex:0 0 auto}\ninput[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;\n  background:var(--c2);cursor:pointer;box-shadow:0 0 0 3px rgba(56,189,248,.2)}\ninput[type=range]::-moz-range-thumb{width:13px;height:13px;border-radius:50%;background:var(--c2);\n  cursor:pointer;border:0}\n.rv{font-size:12.5px;color:var(--acc);font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap;\n  min-width:104px}\n.nin{display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--tx3)}\ninput[type=number]{background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:7px;\n  padding:5px 7px;color:var(--tx);font-size:12px;width:74px;outline:none;font-family:inherit;\n  font-variant-numeric:tabular-nums;text-align:right}\ninput[type=number]:focus{border-color:var(--c2);background:rgba(56,189,248,.08)}\ninput[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{opacity:.35}\ninput[type=text]{background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:8px;\n  padding:6px 11px;color:var(--tx);font-size:12.5px;width:190px;outline:none;font-family:inherit}\ninput[type=text]:focus{border-color:var(--c2)}\nselect{background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:8px;padding:6px 9px;\n  color:var(--tx);font-size:12.5px;outline:none;font-family:inherit}\n.btn{background:rgba(56,189,248,.14);border:1px solid var(--c2);border-radius:8px;padding:6px 15px;\n  color:#bfe9ff;font-size:12.5px;cursor:pointer;transition:.16s;font-family:inherit}\n.btn:hover{background:rgba(56,189,248,.26)}\n.btn.g{background:rgba(255,255,255,.04);border-color:var(--line);color:var(--tx2)}\n.btn.g:hover{border-color:var(--line2);color:var(--tx)}\n\n/* ---------- charts ---------- */\n/* 关键：track 用 minmax(0,1fr)，否则 ECharts 画布内联像素宽度会成为 1fr 的 min-content，\n   窄窗口时三列撑破容器、比候选清单宽出一截（实测 1680px 时超 115px）。 */\n.charts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-bottom:20px}\n.ch{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 14px 10px;\n  position:relative;min-width:0;overflow:hidden}\n.ch .ct{font-size:13px;font-weight:700;color:var(--tx);margin-bottom:2px;padding-left:4px}\n.ch .cs{font-size:11px;color:var(--tx3);margin-bottom:6px;padding-left:4px}\n.cbox{width:100%;height:250px;min-width:0;overflow:hidden}\n\n/* ---------- table ---------- */\n.tw{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden}\n.tbwrap{overflow-x:auto;max-height:620px;overflow-y:auto}\ntable{width:100%;border-collapse:collapse;font-size:12.5px}\nth{background:rgba(255,255,255,.055);color:var(--tx2);font-weight:600;text-align:left;\n  padding:10px 11px;position:sticky;top:0;backdrop-filter:blur(8px);white-space:nowrap;\n  border-bottom:1px solid var(--line);font-size:11.5px;letter-spacing:.3px;z-index:2}\ntd{padding:9px 11px;border-bottom:1px solid rgba(255,255,255,.045);vertical-align:middle}\ntbody tr{transition:.13s}\ntbody tr:hover{background:rgba(56,189,248,.07)}\n.jn{font-weight:600;color:var(--tx);max-width:290px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}\n.jn::after{content:\"要\";font-size:9.5px;font-weight:700;color:var(--tx3);border:1px solid var(--line);\n  border-radius:4px;padding:1px 4px;margin-left:7px;vertical-align:1px}\n.jn:hover::after{color:var(--acc);border-color:var(--acc)}\n.jn a{color:inherit;text-decoration:none} .jn a:hover{color:var(--acc);text-decoration:underline}\n.tag{display:inline-block;padding:2px 7px;border-radius:5px;font-size:11px;font-weight:700;white-space:nowrap}\n.z1{background:rgba(245,158,11,.18);color:#fcd34d} .z2{background:rgba(56,189,248,.18);color:#7dd3fc}\n.z3{background:rgba(52,211,153,.16);color:#6ee7b7} .z4{background:rgba(148,163,184,.16);color:#cbd5e1}\n/* 小类分区：描边款，和大类分区的实心块区分开，避免两列看混 */\n.nz1{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.55);color:#fcd34d}\n.nz2{background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.55);color:#7dd3fc}\n.nz3{background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.55);color:#6ee7b7}\n.nz4{background:rgba(148,163,184,.08);border:1px solid rgba(148,163,184,.55);color:#cbd5e1}\n.tg{background:rgba(251,191,36,.2);color:#fde68a} .tw2{background:rgba(239,68,68,.2);color:#fca5a5}\n.toa{background:rgba(52,211,153,.14);color:#6ee7b7} .tsub{background:rgba(148,163,184,.14);color:#cbd5e1}\n.num{font-variant-numeric:tabular-nums;text-align:right}\n.mut{color:var(--tx3)}\n.empty{padding:50px;text-align:center;color:var(--tx3);font-size:13px}\nfooter{color:var(--tx3);font-size:11.5px;line-height:1.9;margin-top:22px;\n  border-top:1px solid var(--line);padding-top:16px}\nfooter b{color:var(--tx2);font-weight:600}\n/* 免责声明：中英文模式共用，单列一块，边框用琥珀色以示与口径说明不同 */\n.disc{margin-top:18px;border:1px solid rgba(245,158,11,.3);background:rgba(245,158,11,.055);\n  border-radius:12px;padding:15px 18px;color:var(--tx2);font-size:11.5px;line-height:1.95}\n.disc b{display:block;color:#fcd9a0;font-weight:700;letter-spacing:.4px;margin-bottom:6px}\n.disc p{margin:0 0 6px} .disc p:last-child{margin-bottom:0}\n.disc em{font-style:normal;color:#fcd34d}\n\n/* ---------- 期刊详情弹框 ---------- */\n.mask{position:fixed;inset:0;background:rgba(3,7,15,.78);backdrop-filter:blur(6px);\n  z-index:99;display:none;align-items:center;justify-content:center;padding:26px}\n.mask.on{display:flex}\n.modal{background:linear-gradient(180deg,#0e1626,#0a111f);border:1px solid var(--line2);\n  border-radius:18px;width:min(1040px,100%);max-height:90vh;display:flex;flex-direction:column;\n  box-shadow:0 30px 90px rgba(0,0,0,.6);overflow:hidden}\n.mhd{display:flex;gap:18px;padding:20px 22px 16px;border-bottom:1px solid var(--line);position:relative}\n.mcov{width:118px;flex:0 0 118px;height:158px;border-radius:10px;overflow:hidden;\n  background:linear-gradient(150deg,rgba(56,189,248,.16),rgba(245,158,11,.12));\n  border:1px solid var(--line2);display:flex;align-items:center;justify-content:center}\n.mcov img{width:100%;height:100%;object-fit:cover;display:block}\n.mcov .ph2{font-size:30px;font-weight:800;color:rgba(255,255,255,.28);letter-spacing:1px}\n.mtt{flex:1;min-width:0}\n.mtt h2{font-size:19px;font-weight:800;line-height:1.35;margin-bottom:7px;padding-right:36px}\n.mtags{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:9px}\n.mmeta{font-size:12px;color:var(--tx3);line-height:1.75}\n.mmeta b{color:var(--tx2);font-weight:600}\n.mclose{position:absolute;right:14px;top:14px;width:30px;height:30px;border-radius:8px;\n  border:1px solid var(--line);background:var(--card);color:var(--tx2);cursor:pointer;\n  font-size:17px;line-height:1;display:flex;align-items:center;justify-content:center}\n.mclose:hover{border-color:var(--warn);color:var(--warn)}\n.mstat{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:1px;background:var(--line);\n  border-bottom:1px solid var(--line)}\n.mstat div{background:#0c1322;padding:11px 8px;text-align:center}\n.mstat .k{font-size:10.5px;color:var(--tx3);letter-spacing:.3px}\n.mstat .v{font-size:15px;font-weight:700;margin-top:4px;font-variant-numeric:tabular-nums}\n.mbody{display:grid;grid-template-columns:1fr 306px;gap:0;overflow:hidden;flex:1;min-height:0}\n.mleft{overflow-y:auto;padding:18px 20px 22px}\n.mright{overflow-y:auto;padding:18px 18px 22px;border-left:1px solid var(--line);background:rgba(255,255,255,.018)}\n.mh3{font-size:12.5px;font-weight:700;color:var(--tx2);letter-spacing:.5px;margin:0 0 11px;\n  display:flex;align-items:center;gap:7px}\n.mh3 i{width:5px;height:12px;border-radius:2px;background:linear-gradient(180deg,var(--c2),var(--acc));display:inline-block}\n.sec{border:1px solid var(--line);border-radius:11px;margin-bottom:9px;overflow:hidden;background:rgba(255,255,255,.022)}\n.sec .sh{padding:10px 13px;font-size:13px;font-weight:600;cursor:pointer;display:flex;\n  align-items:center;justify-content:space-between;gap:10px;user-select:none}\n.sec .sh:hover{background:rgba(255,255,255,.035)}\n.sec .sh span:last-child{color:var(--tx3);font-size:11px;transition:.2s}\n.sec.open .sh{border-bottom:1px solid var(--line)}\n.sec.open .sh span:last-child{transform:rotate(90deg)}\n.sec .sb{display:none;padding:11px 14px 13px;font-size:12.5px;line-height:1.85;color:var(--tx2)}\n.sec.open .sb{display:block}\n.mfull{margin-top:14px;border:1px dashed var(--line2);border-radius:11px;padding:12px 14px;\n  font-size:12px;line-height:1.9;color:var(--tx3);max-height:210px;overflow-y:auto;display:none}\n.mfull.on{display:block}\n.rlink{display:flex;align-items:center;gap:9px;padding:10px 12px;border:1px solid var(--line);\n  border-radius:10px;margin-bottom:8px;font-size:12.5px;color:var(--tx);text-decoration:none;\n  background:rgba(255,255,255,.022);transition:.18s}\n.rlink:hover{border-color:var(--c2);background:rgba(56,189,248,.09)}\n.rlink .ic{width:22px;height:22px;border-radius:6px;background:rgba(56,189,248,.16);\n  color:#7dd3fc;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex:0 0 22px}\n.rlink.tpl .ic{background:rgba(52,211,153,.16);color:#6ee7b7}\n.rlink small{color:var(--tx3);font-size:10.5px;display:block;margin-top:2px}\n.mnone{font-size:12px;color:var(--tx3);line-height:1.8;padding:9px 11px;border:1px dashed var(--line);\n  border-radius:10px;margin-bottom:9px}\n.mgen{font-size:12px;line-height:1.75;padding:10px 12px;margin-bottom:11px;border-radius:10px;\n  background:rgba(245,158,11,.10);border:1px solid rgba(245,158,11,.35);color:#fcd9a0}\n.mgen b{color:#fbbf24}\n.mfoot{padding:12px 20px;border-top:1px solid var(--line);display:flex;gap:9px;\n  justify-content:flex-end;background:rgba(255,255,255,.015)}\n/* 窄窗口收敛顺序：6→3→2 列（KPI）、3→2→1 列（图表）。\n   图表断点取 1150/760，使卡片宽度始终落在 350–570px 区间，不会出现\"越窄反而越宽\"的跳变。 */\n@media(max-width:1400px){.kpis{grid-template-columns:repeat(3,minmax(0,1fr))}}\n@media(max-width:1150px){.charts{grid-template-columns:repeat(2,minmax(0,1fr))}}\n@media(max-width:900px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}\n  .fgrid{grid-template-columns:minmax(0,1fr)}}\n@media(max-width:760px){.charts{grid-template-columns:minmax(0,1fr)}}\n@media(max-width:820px){.mbody{grid-template-columns:minmax(0,1fr)}.mright{border-left:0;border-top:1px solid var(--line)}\n  .mstat{grid-template-columns:repeat(4,minmax(0,1fr))}.mcov{width:92px;flex:0 0 92px;height:124px}}\n";document.head.append(style);
document.body.dataset.mode="en";root.innerHTML="\n<div class=\"wrap\">\n\n<header>\n  <div>\n    <h1><span class=\"g\">测绘遥感领域期刊 · 选刊仪表盘</span></h1>\n    <div class=\"sub\" id=\"subLine\">英文刊：中科院分区 2025.03 · 新锐分区 2026.03 · JCR/JIF 2025 · OpenAlex 指标 · 中科院预警名单 2020–2025</div>\n  </div>\n  <div class=\"hbadge\">\n    <div class=\"modeswitch\" id=\"modeSwitch\">\n      <button class=\"mbtn on\" data-m=\"en\">英文期刊 <b>179</b></button>\n      <button class=\"mbtn\" data-m=\"cn\">中文期刊 <b>85</b></button>\n      <button class=\"mbtn\" data-m=\"edu\">教育类英文刊 <b>260</b></button>\n    </div>\n    <span class=\"pill\">收录期刊 <b id=\"hTot\">0</b> 本</span>\n    <span class=\"pill\">当前候选 <b id=\"hNow\">0</b> 本</span>\n    <span class=\"pill\">数据日期 <b>2026-10-03</b></span>\n  </div>\n</header>\n\n<div class=\"kpis\" id=\"kpis\"></div>\n\n<div class=\"panel\">\n  <div class=\"ph\">\n    <div class=\"pt\"><i></i>选刊条件 <span class=\"n\">下方六张图与候选清单会随条件实时联动</span></div>\n    <div class=\"frow\">\n      <button class=\"btn g\" id=\"btnReset\">重置条件</button>\n    </div>\n  </div>\n  <div class=\"fgrid\">\n    <!-- 领域板块：整行独占，chip 按 flex 自动换行，行/列均有固定间距，不与其他条件挤压 -->\n    <div class=\"fcell wide en-only\">\n      <div class=\"ft\"><b>领域板块</b><span id=\"fSecHint\">可多选；括号内为全库期刊数</span></div>\n      <div class=\"chips\" id=\"fSec\"></div>\n    </div>\n    <div class=\"fcell wide cn-only\">\n      <div class=\"ft\"><b>核心收录体系</b><span>可多选＝须同时具备；括号内为全库期刊数</span></div>\n      <div class=\"chips\" id=\"fCore\"></div>\n    </div>\n    <div class=\"fcell en-only\">\n      <div class=\"ft\"><b>中科院大类分区</b><span>缺失时用新锐分区兜底</span></div>\n      <div class=\"frow\"><span class=\"chips\" id=\"fZone\"></span></div>\n      <div class=\"frow\" style=\"margin-top:10px\">\n        <label class=\"sw\"><input type=\"checkbox\" id=\"cTop\">仅 TOP</label>\n        <label class=\"sw\"><input type=\"checkbox\" id=\"cWarn\" checked>排除预警刊</label>\n        <label class=\"sw\"><input type=\"checkbox\" id=\"cScie\">仅 SCIE</label>\n        <label class=\"sw\"><input type=\"checkbox\" id=\"cNoEsci\" title=\"排除 WoS 收录库标记为 ESCI 的期刊（15 本）\">排除 ESCI</label>\n      </div>\n    </div>\n    <div class=\"fcell en-only\">\n      <div class=\"ft\"><b>APC 版面费区间（美元）</b><span>滑块＝上限；也可直接填数字</span></div>\n      <div class=\"rng\">\n        <input type=\"range\" id=\"rApc\" min=\"0\" max=\"5000\" step=\"100\" value=\"0\">\n        <span class=\"rv\" id=\"vApc\">不限</span>\n        <span class=\"nin\">最低 <input type=\"number\" id=\"nApcMin\" min=\"0\" max=\"12000\" step=\"50\" placeholder=\"不限\"></span>\n        <span class=\"nin\">最高 <input type=\"number\" id=\"nApcMax\" min=\"0\" max=\"12000\" step=\"50\" placeholder=\"不限\"></span>\n      </div>\n    </div>\n    <div class=\"fcell en-only\">\n      <div class=\"ft\"><b>国人占比区间（%）</b><span>滑块＝下限；也可直接填数字</span></div>\n      <div class=\"rng\">\n        <input type=\"range\" id=\"rCn\" min=\"0\" max=\"90\" step=\"5\" value=\"0\">\n        <span class=\"rv\" id=\"vCn\">不限</span>\n        <span class=\"nin\">最低 <input type=\"number\" id=\"nCnMin\" min=\"0\" max=\"100\" step=\"5\" placeholder=\"不限\"></span>\n        <span class=\"nin\">最高 <input type=\"number\" id=\"nCnMax\" min=\"0\" max=\"100\" step=\"5\" placeholder=\"不限\"></span>\n      </div>\n    </div>\n    <div class=\"fcell cn-only\">\n      <div class=\"ft\"><b>复合影响因子区间（知网）</b><span>滑块＝上限；也可直接填数字</span></div>\n      <div class=\"rng\">\n        <input type=\"range\" id=\"rCif\" min=\"0\" max=\"8\" step=\"0.5\" value=\"0\">\n        <span class=\"rv\" id=\"vCif\">不限</span>\n        <span class=\"nin\">最低 <input type=\"number\" id=\"nCifMin\" min=\"0\" max=\"12\" step=\"0.1\" placeholder=\"不限\"></span>\n        <span class=\"nin\">最高 <input type=\"number\" id=\"nCifMax\" min=\"0\" max=\"12\" step=\"0.1\" placeholder=\"不限\"></span>\n      </div>\n      <div class=\"frow\" style=\"margin-top:10px\">\n        <label class=\"sw\"><input type=\"checkbox\" id=\"cCoreOnly\">仅保留至少一项核心收录的期刊</label>\n      </div>\n    </div>\n    <div class=\"fcell wide\">\n      <div class=\"ft\"><b>关键词与排序</b><span id=\"qHint\">关键词匹配刊名 / 学科 / 出版商；ISSN 框只认刊号，连字符可省</span></div>\n      <div class=\"frow\">\n        <input type=\"text\" id=\"q\" placeholder=\"刊名 / 学科 / 出版商\">\n        <input type=\"text\" id=\"qIssn\" placeholder=\"ISSN / EISSN（如 0196-2892 或 01962892）\" style=\"width:250px\">\n        <span class=\"flb\" style=\"min-width:auto\">排序</span>\n        <select id=\"sort\">\n          <option value=\"jif25\">影响因子 高→低</option>\n          <option value=\"cn\">国人占比 高→低</option>\n          <option value=\"apc\">版面费 低→高</option>\n          <option value=\"cs\">CiteScore 高→低</option>\n          <option value=\"zone\">大类分区 1→4区</option>\n          <option value=\"nfx25\">小类分区 1→4区</option>\n          <option value=\"n25\">年发文量 高→低</option>\n        </select>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"charts\">\n  <div class=\"ch\"><div class=\"ct\">中科院大类分区分布</div><div class=\"cs\">当前候选在各分区的数量</div><div class=\"cbox\" id=\"c1\"></div></div>\n  <div class=\"ch\"><div class=\"ct\">学科归属分布</div><div class=\"cs\">按中科院大类学科统计</div><div class=\"cbox\" id=\"c2\"></div></div>\n  <div class=\"ch\"><div class=\"ct\">出版模式与预警</div><div class=\"cs\">OA 类型构成，预警刊单独标红</div><div class=\"cbox\" id=\"c3\"></div></div>\n  <div class=\"ch\"><div class=\"ct\">版面费 APC 分布</div><div class=\"cs\">美元，按区间统计有 APC 数据的期刊</div><div class=\"cbox\" id=\"c4\"></div></div>\n  <div class=\"ch\"><div class=\"ct\">国人占比 × 影响因子</div><div class=\"cs\">气泡大小＝年发文量；越靠右上＝中国作者多且 IF 高</div><div class=\"cbox\" id=\"c5\"></div></div>\n  <div class=\"ch\"><div class=\"ct\">近五年发文量走势</div><div class=\"cs\">候选期刊合计年发文量，可看扩刊趋势</div><div class=\"cbox\" id=\"c6\"></div></div>\n</div>\n\n<div class=\"tw\">\n  <div class=\"ph\" style=\"padding:16px 20px 12px;margin:0\">\n    <div class=\"pt\"><i></i>候选清单 <span class=\"n\" id=\"tCnt\"></span></div>\n    <div class=\"frow\"><button class=\"btn g\" id=\"btnCsv\">导出当前候选 CSV</button></div>\n  </div>\n  <div class=\"tbwrap\"><table id=\"tb\">\n    <thead id=\"thead\"></thead>\n    <tbody id=\"tbody\"></tbody>\n  </table></div>\n</div>\n\n<footer id=\"footEn\" class=\"en-only\">\n  <b>口径说明：</b>「大类分区」＝中科院大类分区 2025.03（缺失时用新锐分区 2026.03 兜底）；\n  「小类分区」＝中科院分区表 2025.03 中该刊所属小类学科对应的分区，本列取第一个小类（鼠标悬停可看全部小类及各自分区）；\n  「小类学科（中科院）」＝该刊在中科院分区表中的小类学科归属；\n  「年发文量」＝OpenAlex 统计的 2025 年（最近一个完整年度）发文量；\n  JIF 为 2025 年度；国人占比＝OpenAlex 统计 2023–2025 年至少一位作者隶属中国机构的论文占比；\n  APC 为 OpenAlex 记录的美元金额，混合 OA 期刊为开放获取选项价格，订阅制发表通常无 APC。<br>\n  <b>预警名单：</b>中科院文献情报中心《国际期刊预警名单》2020/2021/2023/2024/2025 五版（2022 年未发布），多所高校转载页交叉核对。\n  被预警不等于论文无效，但多数单位在预警期内不予认定，投稿前请核对本单位文件。\n</footer>\n<footer id=\"footCn\" class=\"cn-only\">\n  <b>口径说明：</b>「复合影响因子 / 综合影响因子」来自知网期刊库（2025 年度）；\n  「中信所IF」＝中国科技核心期刊影响因子（万方）；\n  「发文量(累计)」＝知网『出版文献量』，为创刊至今的累计篇数（中文刊暂无公开的逐年发文量）；\n  「核心收录」＝北大核心（中文核心期刊要目总览）、CSCD（中国科学引文数据库）、CSTPCD（中国科技核心期刊）、EI、RCCSE、卓越行动计划（2024—2028 二期）；\n  专辑学科＝知网文献学科分类。中科院《期刊分区表》只覆盖国际期刊，不含中文刊，故中文刊无大类/小类分区列。<br>\n  <b>封面：</b>77 本取自公开网络（已逐张人工核对刊名一致）；8 本检索未命中的用仪表盘风格封面卡占位，标注「封面待补」。\n  核心收录以当年目录为准，投稿前请核对本单位认定文件。\n</footer>\n\n<div class=\"disc\" id=\"disclaimer\">\n  <b>免责声明（请先读）</b>\n  <p>1. 本仪表盘为<em>个人科研工作辅助材料</em>，非官方发布物，不代表任何高校、科研院所或期刊出版机构立场；欢迎转发给同事使用，但请勿删改本声明。</p>\n  <p>2. 数据来自公开渠道自动采集，主要包括：LetPub 公开期刊页（分区、小类学科、审稿周期、收录）、OpenAlex / Crossref（影响因子、CiteScore、国人占比、年发文量）、中科院《期刊分区表》与《国际期刊预警名单》公开信息、知网与万方期刊公开页（中文刊指标）以及各期刊官网投稿须知。<em>采集时点为 2026-10-02 至 2026-10-03</em>，部分字段（APC、审稿周期、国人占比等）本身为估计值或第三方统计值。</p>\n  <p>3. <em>分区、影响因子与核心收录目录逐年修订</em>，本表可能存在滞后、口径差异或个别错误；请以中科院文献情报中心、科睿唯安（JCR）、各核心期刊目录及期刊官网的<em>最新官方发布</em>为准。</p>\n  <p>4. 是否投稿、以及论文在职称评审、学位授予、科研考核中的认定结果，<em>一律以本单位科研管理部门的最新文件与认定结果为准</em>；本表不构成投稿建议，也不构成任何形式的科研评价结论。</p>\n  <p>5. 制表人不因使用本表信息所产生的任何直接或间接后果承担责任；发现数据有误请反馈，以便核实修正。</p>\n</div>\n\n</div>\n\n<!-- 期刊详情弹框：封面 + 指标 + 投稿须知 + 模板 -->\n<div class=\"mask\" id=\"mask\">\n  <div class=\"modal\">\n    <div class=\"mhd\">\n      <div class=\"mcov\" id=\"mCov\"></div>\n      <div class=\"mtt\">\n        <h2 id=\"mName\">—</h2>\n        <div class=\"mtags\" id=\"mTags\"></div>\n        <div class=\"mmeta\" id=\"mMeta\"></div>\n      </div>\n      <button class=\"mclose\" id=\"mClose\" title=\"关闭\">×</button>\n    </div>\n    <div class=\"mstat\" id=\"mStat\"></div>\n    <div class=\"mbody\">\n      <div class=\"mleft\">\n        <div class=\"mh3\"><i></i>投稿须知要点</div>\n        <div id=\"mSecs\"></div>\n        <div id=\"mFullBox\"></div>\n      </div>\n      <div class=\"mright\">\n        <div class=\"mh3\"><i></i>投稿资源</div>\n        <div id=\"mRes\"></div>\n      </div>\n    </div>\n    <div class=\"mfoot\">\n      <button class=\"btn g\" id=\"mBtnFull\">展开原文摘录</button>\n      <button class=\"btn g\" id=\"mBtnCopy\">复制投稿要点</button>\n      <button class=\"btn\" id=\"mBtnClose\">关闭</button>\n    </div>\n  </div>\n</div>\n\n";

(function(){
"use strict";
var D = window.DATA.rows, ALL = D.slice();
var CNR = (window.DATA.cn && window.DATA.cn.rows) || [], CN_ALL = CNR.slice();
var EDU = (window.DATA.edu && window.DATA.edu.rows) || [], EDU_ALL = EDU.slice();
var MODE = "en";
var BASE = ALL;
var ZC = {"1区":"#f59e0b","2区":"#38bdf8","3区":"#34d399","4区":"#94a3b8"};
var AX = "#94a3b8", GRID = "#1e293b";

/* ---------- helpers ---------- */
function zone(d){ return d.大类25 || d.新锐 || ""; }
function uniq(a){ return a.filter(function(x,i){ return x!=null && x!=="" && a.indexOf(x)===i; }); }
function avg(arr){ var v=arr.filter(function(x){return typeof x==="number"&&!isNaN(x);});
  return v.length? v.reduce(function(a,b){return a+b;},0)/v.length : null; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function fmt(v,n){ return v==null? "—" : (Math.round(v*Math.pow(10,n))/Math.pow(10,n)).toFixed(n); }
/* ISSN 归一：去掉连字符/空格、转大写，便于「01962892」与「0196-2892」互通 */
function normIssn(s){ return String(s==null?"":s).replace(/[^0-9Xx]/g,"").toUpperCase(); }
function zIdx(z){ return ["1区","2区","3区","4区"].indexOf(z); }

/* ---------- state ---------- */
var S = { sec:[], zone:[], top:false, warn:true, scie:false, noEsci:false,
          apcMin:null, apcMax:null, cnMin:null, cnMax:null, q:"", issn:"", sort:"jif25" };
/* 中文刊独立状态（核心收录多选＝须同时具备） */
var CS = { core:[], cifMin:null, cifMax:null, coreOnly:false, q:"", issn:"", sort:"cif" };
var CORES = [["bj","北大核心"],["cscd","CSCD"],["cstpcd","CSTPCD(科技核心)"],["ei","EI"],["zy","卓越计划"],["rccse","RCCSE"]];
var CN_TAG_CSS = {"北大核心":"tg","CSCD":"z2","CSTPCD(科技核心)":"toa","EI":"z1","卓越计划":"tg","RCCSE":"z4"};
var charts = {};

/* ---------- build filter chips ---------- */
/* 板块 chip 带全库计数，便于判断该板块规模；每个 chip 独占一行高、flex 固定行列间距，避免相互压盖 */
/* 板块 / 分区 chip 从传入数据集构建，便于英文↔教育类切换时重建计数 */
function buildSecZoneChips(src){
  var secs = uniq(src.map(function(d){return d.板块;})).sort();
  document.getElementById("fSec").innerHTML = secs.map(function(s){
    var n = src.filter(function(d){return d.板块===s;}).length;
    return '<span class="chip" data-sec="'+esc(s)+'">'+esc(s)+'<span class="cn">'+n+'</span></span>'; }).join("");
  var zones = ["1区","2区","3区","4区"];
  document.getElementById("fZone").innerHTML = zones.map(function(z,i){
    var n = src.filter(function(d){return zone(d)===z;}).length;
    return '<span class="chip z'+(i+1)+'" data-zone="'+z+'">'+z+'<span class="cn">'+n+'</span></span>'; }).join("");
}
buildSecZoneChips(ALL);

document.getElementById("fSec").addEventListener("click", function(e){
  var t=e.target.closest ? e.target.closest(".chip") : null; if(!t||!t.dataset.sec) return;
  t.classList.toggle("on"); S.sec = [].slice.call(this.querySelectorAll(".chip.on"))
    .map(function(x){return x.dataset.sec;}); render();
});
document.getElementById("fZone").addEventListener("click", function(e){
  var t=e.target.closest ? e.target.closest(".chip") : null; if(!t||!t.dataset.zone) return;
  t.classList.toggle("on"); S.zone = [].slice.call(this.querySelectorAll(".chip.on"))
    .map(function(x){return x.dataset.zone;}); render();
});
document.getElementById("cTop").onchange=function(){S.top=this.checked;render();};
document.getElementById("cWarn").onchange=function(){S.warn=this.checked;render();};
document.getElementById("cScie").onchange=function(){S.scie=this.checked;render();};
document.getElementById("cNoEsci").onchange=function(){S.noEsci=this.checked;render();};

/* ---------- 中文刊：核心收录 chips + 复合IF区间 ---------- */
function buildCoreChips(){
  var html = CORES.map(function(c){
    var n = CN_ALL.filter(function(d){return d[c[0]]===1;}).length;
    return '<span class="chip" data-core="'+c[0]+'">'+c[1]+'<span class="cn">'+n+'</span></span>';
  }).join("");
  document.getElementById("fCore").innerHTML = html;
}
document.getElementById("fCore").addEventListener("click", function(e){
  var t=e.target.closest ? e.target.closest(".chip") : null; if(!t||!t.dataset.core) return;
  t.classList.toggle("on");
  CS.core = [].slice.call(this.querySelectorAll(".chip.on")).map(function(x){return x.dataset.core;});
  render();
});
function cifLabel(){
  var a=CS.cifMin, b=CS.cifMax;
  if(a==null && b==null) return "不限";
  if(a!=null && b!=null) return a+" – "+b;
  if(b!=null) return "≤ "+b;
  return "≥ "+a;
}
function syncCif(){
  document.getElementById("vCif").textContent = cifLabel();
  var s=document.getElementById("rCif");
  s.value = (CS.cifMax==null? 0 : Math.min(CS.cifMax, +s.max));
  document.getElementById("nCifMin").value = (CS.cifMin==null? "" : CS.cifMin);
  document.getElementById("nCifMax").value = (CS.cifMax==null? "" : CS.cifMax);
}
document.getElementById("rCif").oninput=function(){
  var v=+this.value; CS.cifMax = v>0? v : null; syncCif(); render(); };
document.getElementById("nCifMin").oninput=function(){
  CS.cifMin = num(this.value,0,12); syncCif(); render(); };
document.getElementById("nCifMax").oninput=function(){
  CS.cifMax = num(this.value,0,12); syncCif(); render(); };
document.getElementById("cCoreOnly").onchange=function(){ CS.coreOnly=this.checked; render(); };

/* ---------- 区间控件：滑块 ↔ 数值框 双向同步 ---------- */
function num(v,lo,hi){
  if(v===""||v==null) return null;
  v = parseFloat(v); if(isNaN(v)) return null;
  return Math.max(lo, Math.min(hi, v));
}
function apcLabel(){
  var a=S.apcMin, b=S.apcMax;
  if(a==null && b==null) return "不限";
  if(a!=null && b!=null) return "$"+a+" – $"+b;
  if(b!=null) return "≤ $"+b;
  return "≥ $"+a;
}
function cnLabel(){
  var a=S.cnMin, b=S.cnMax;
  if(a==null && b==null) return "不限";
  if(a!=null && b!=null) return a+"% – "+b+"%";
  if(a!=null) return "≥ "+a+"%";
  return "≤ "+b+"%";
}
function syncApc(){
  document.getElementById("vApc").textContent = apcLabel();
  var s=document.getElementById("rApc");
  s.value = (S.apcMax==null? 0 : Math.min(S.apcMax, +s.max));
  document.getElementById("nApcMax").value = (S.apcMax==null? "" : S.apcMax);
  document.getElementById("nApcMin").value = (S.apcMin==null? "" : S.apcMin);
}
function syncCn(){
  document.getElementById("vCn").textContent = cnLabel();
  var s=document.getElementById("rCn");
  s.value = (S.cnMin==null? 0 : Math.min(S.cnMin, +s.max));
  document.getElementById("nCnMin").value = (S.cnMin==null? "" : S.cnMin);
  document.getElementById("nCnMax").value = (S.cnMax==null? "" : S.cnMax);
}
/* 滑块＝上限（APC）/ 下限（国人占比），拖动时写入对应数值框 */
document.getElementById("rApc").oninput=function(){
  var v=+this.value; S.apcMax = v>0? v : null; syncApc(); render(); };
document.getElementById("rCn").oninput=function(){
  var v=+this.value; S.cnMin = v>0? v : null; syncCn(); render(); };
/* 数值框：可直接填精确区间，反向驱动滑块 */
document.getElementById("nApcMax").oninput=function(){
  S.apcMax = num(this.value,0,12000); syncApc(); render(); };
document.getElementById("nApcMin").oninput=function(){
  S.apcMin = num(this.value,0,12000); syncApc(); render(); };
document.getElementById("nCnMin").oninput=function(){
  S.cnMin = num(this.value,0,100); syncCn(); render(); };
document.getElementById("nCnMax").oninput=function(){
  S.cnMax = num(this.value,0,100); syncCn(); render(); };
document.getElementById("q").oninput=function(){
  var v=this.value.trim().toLowerCase();
  if(MODE==="cn") CS.q=v; else S.q=v;
  render(); };
document.getElementById("qIssn").oninput=function(){
  /* 存原始文本，匹配时再归一化（便于模式切换时回填输入框） */
  if(MODE==="cn") CS.issn=this.value; else S.issn=this.value;
  render(); };
document.getElementById("sort").onchange=function(){
  if(MODE==="cn") CS.sort=this.value; else S.sort=this.value;
  render(); };
document.getElementById("btnReset").onclick=function(){
  [].slice.call(document.querySelectorAll(".chip.on")).forEach(function(x){x.classList.remove("on");});
  document.getElementById("q").value="";
  document.getElementById("qIssn").value="";
  if(MODE!=="cn"){
    S={sec:[],zone:[],top:false,warn:true,scie:false,noEsci:false,apcMin:null,apcMax:null,
       cnMin:null,cnMax:null,q:"",issn:"",sort:"jif25"};
    document.getElementById("cTop").checked=false; document.getElementById("cWarn").checked=true;
    document.getElementById("cScie").checked=false; document.getElementById("cNoEsci").checked=false;
    syncApc(); syncCn();
    document.getElementById("sort").value="jif25";
  } else {
    CS={core:[],cifMin:null,cifMax:null,coreOnly:false,q:"",issn:"",sort:"cif"};
    document.getElementById("cCoreOnly").checked=false;
    syncCif();
    document.getElementById("sort").value="cif";
  }
  render();
};
document.getElementById("btnCsv").onclick=function(){
  if(MODE==="cn"){ exportCsvCn(); return; }
  var cur = filtered();
  var head = ["期刊名称","大类分区","小类分区","小类学科及分区明细","中科院小类学科","TOP",
              "中科院大类学科","JIF25","CiteScore","年发文量(2025)","国人占比%","APC",
              "出版模式","审稿周期","数据库","预警","网址"];
  var lines=[head.join(",")];
  cur.forEach(function(d){
    lines.push([d.刊名,zone(d),d.nfx25||"",d.nfx25d||"",d.小类学科||"",d.top||"",d.学科归属||"",
      d.jif25==null?"":d.jif25,d.cs==null?"":d.cs,d.n25==null?"":d.n25,
      d.cn==null?"":d.cn,d.apc==null?"":d.apc,d.oa||"",d.周期||"",d.数据库||"",d.预警||"",d.url||""]
      .map(function(x){ return '"'+String(x).replace(/"/g,'""')+'"'; }).join(","));
  });
  var blob=new Blob(["\ufeff"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"});
  var a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download="选刊候选_"+cur.length+"本.csv"; a.click();
};
function exportCsvCn(){
  var cur = cnFiltered();
  var head = ["期刊名称","英文刊名","北大核心","CSCD","CSTPCD","EI","卓越计划","RCCSE",
              "复合IF","综合IF","中信所IF","发文量(累计,知网)","出版周期","专辑学科",
              "主办单位","主管单位","ISSN","CN","网址"];
  var lines=[head.join(",")];
  cur.forEach(function(d){
    lines.push([d.刊名,d.英文名||"",d.bj?"是":"",d.cscd?"是":"",d.cstpcd?"是":"",d.ei?"是":"",d.zy?"是":"",d.rccse?"是":"",
      d.cif==null?"":d.cif,d.zif==null?"":d.zif,d.zxisif==null?"":d.zxisif,
      d.ndocs==null?"":d.ndocs,d.period||"",d.专辑||"",
      d.主办||"",d.主管||"",d.issn||"",d.cnno||"",d.url||""]
      .map(function(x){ return '"'+String(x).replace(/"/g,'""')+'"'; }).join(","));
  });
  var blob=new Blob(["\ufeff"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"});
  var a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download="中文刊候选_"+cur.length+"本.csv"; a.click();
}

/* ---------- filter ---------- */
function filtered(){
  var base = (MODE==="edu") ? EDU_ALL : ALL;
  var out = base.filter(function(d){
    if(S.sec.length && S.sec.indexOf(d.板块)<0) return false;
    if(S.zone.length && S.zone.indexOf(zone(d))<0) return false;
    if(S.top && d.top!=="是") return false;
    if(S.warn && d.预警) return false;
    if(S.scie && d.数据库!=="SCIE") return false;
    if(S.noEsci && d.数据库==="ESCI") return false;
    if(S.apcMin!=null && (d.apc==null || d.apc<S.apcMin)) return false;
    if(S.apcMax!=null && (d.apc==null || d.apc>S.apcMax)) return false;
    if(S.cnMin!=null && (d.cn==null || d.cn<S.cnMin)) return false;
    if(S.cnMax!=null && (d.cn==null || d.cn>S.cnMax)) return false;
    if(S.q){
      var hay=[d.刊名,d.简称,d.学科归属,d.小类学科,d.wos学科,d.出版商,d.小类,
               d.issn,d.eissn].join(" ").toLowerCase();
      if(hay.indexOf(S.q)<0) return false;
    }
    if(S.issn){
      var sq=normIssn(S.issn);
      if(sq){
        var ia=normIssn(d.issn), ib=normIssn(d.eissn);
        if(ia.indexOf(sq)<0 && ib.indexOf(sq)<0) return false;
      }
    }
    return true;
  });
  var so=S.sort;
  out.sort(function(a,b){
    if(so==="zone"){ return (zIdx(zone(a))+1||9) - (zIdx(zone(b))+1||9); }
    if(so==="nfx25"){ return (zIdx(a.nfx25)+1||9) - (zIdx(b.nfx25)+1||9); }
    if(so==="apc"){ return (a.apc==null?1e9:a.apc)-(b.apc==null?1e9:b.apc); }
    var k = (so==="n25")?"n25":so;
    var va=(a[k]==null?-1:a[k]), vb=(b[k]==null?-1:b[k]);
    return vb-va;
  });
  return out;
}

/* ---------- 中文刊：筛选 / KPI / 图表 / 表格 ---------- */
function hostType(s){
  if(!s) return "其他";
  if(/科学院|研究所|研究院|研究中心/.test(s)) return "科研院所";
  if(/学会|协会|研究会|联合会/.test(s)) return "学会/协会";
  if(/出版社|出版|报业|杂志/.test(s)) return "出版机构";
  if(/大学|学院/.test(s)) return "高校";
  if(/部|委员会|局/.test(s)) return "政府部门";
  return "其他";
}
function coreTags(d){
  return CORES.filter(function(c){return d[c[0]]===1;}).map(function(c){return c[1];});
}
function cnFiltered(){
  var out = CN_ALL.filter(function(d){
    for(var i=0;i<CS.core.length;i++){ if(d[CS.core[i]]!==1) return false; }
    if(CS.coreOnly && !coreTags(d).length) return false;
    if(CS.cifMin!=null && (d.cif==null || d.cif<CS.cifMin)) return false;
    if(CS.cifMax!=null && (d.cif==null || d.cif>CS.cifMax)) return false;
    if(CS.q){
      var hay=[d.刊名,d.英文名,d.主办,d.主管,d.专辑,d.专题,d.issn,d.cnno].join(" ").toLowerCase();
      if(hay.indexOf(CS.q)<0) return false;
    }
    if(CS.issn){
      var cq=normIssn(CS.issn);
      if(cq){
        var ia2=normIssn(d.issn), ib2=normIssn(d.cnno);
        if(ia2.indexOf(cq)<0 && ib2.indexOf(cq)<0) return false;
      }
    }
    return true;
  });
  var so=CS.sort;
  out.sort(function(a,b){
    if(so==="name"){ return String(a.刊名).localeCompare(String(b.刊名),"zh"); }
    var k = so;
    var va=(a[k]==null?-1:a[k]), vb=(b[k]==null?-1:b[k]);
    return vb-va;
  });
  return out;
}
function cnKpi(cur){
  function vals(k){ return cur.map(function(d){return d[k];}); }
  var aCif=avg(vals("cif")), bCif=avg(CN_ALL.map(function(d){return d.cif;}));
  function cnt(k){ return cur.filter(function(d){return d[k]===1;}).length; }
  var nb=cnt("bj"), nc=cnt("cscd"), nz=cnt("zy"), ne=cnt("ei");
  var eCif=ext(cur,"cif"), mCif=med(vals("cif"));
  function pct(n){ return cur.length? Math.round(n*100/cur.length):0; }
  var sideCif = eCif.max? sideRow("最高",fmt(eCif.max.v,2),"hi",eCif.max.d)
    + sideRow("最低",fmt(eCif.min.v,2),"lo",eCif.min.d)
    + sideRow("中位",fmt(mCif,2)) : sideRow("—","—");
  var sideB = sideRow("占候选",pct(nb)+"%") + sideRow("全库",CN_ALL.filter(function(d){return d.bj===1;}).length+" 本") + sideRow("中位IF",fmt(med(CN_ALL.map(function(d){return d.cif;})),2));
  var sideC = sideRow("占候选",pct(nc)+"%") + sideRow("全库",CN_ALL.filter(function(d){return d.cscd===1;}).length+" 本");
  var sideZ = sideRow("占候选",pct(nz)+"%") + sideRow("全库",CN_ALL.filter(function(d){return d.zy===1;}).length+" 本") + sideRow("北核内占比",nb?(Math.round(nz*100/nb)+"%"):"—");
  var sideE = sideRow("占候选",pct(ne)+"%") + sideRow("全库",CN_ALL.filter(function(d){return d.ei===1;}).length+" 本") + sideRow("双标签",cur.filter(function(d){return d.ei===1&&d.bj===1;}).length+" 本");
  var ht={}; cur.forEach(function(d){ var t=hostType(d.主办); ht[t]=(ht[t]||0)+1; });
  var topH=Object.keys(ht).sort(function(a,b){return ht[b]-ht[a];})[0];
  var sideN = (topH? sideRow("最大类",topH,"hi",topH+": "+ht[topH]+" 本") : sideRow("—","—"))
    + sideRow("主办类型",Object.keys(ht).length+" 类")
    + sideRow("命中率",Math.round(cur.length*100/CN_ALL.length)+"%");
  var cards=[
    ["候选期刊",cur.length,"本",'<span class="df">共 '+CN_ALL.length+' 本 · 命中 '
      +Math.round(cur.length*100/CN_ALL.length)+'%</span>',"",sideN],
    ["平均复合影响因子",fmt(aCif,2),"",df2(aCif,bCif),"k2",sideCif],
    ["北大核心",nb,"本",'<span class="df">占候选 '+pct(nb)+'% · 全库 '
      +CN_ALL.filter(function(d){return d.bj===1;}).length+' 本</span>',"k3",sideB],
    ["CSCD",nc,"本",'<span class="df">占候选 '+pct(nc)+'% · 全库 '
      +CN_ALL.filter(function(d){return d.cscd===1;}).length+' 本</span>',"k4",sideC],
    ["卓越计划",nz,"本",'<span class="df">占候选 '+pct(nz)+'% · 二期(2024—2028)</span>',"k5",sideZ],
    ["EI 收录",ne,"本",'<span class="df">占候选 '+pct(ne)+'% · EI+北核双标签 '
      +cur.filter(function(d){return d.ei===1&&d.bj===1;}).length+' 本</span>',"k6",sideE]
  ];
  document.getElementById("kpis").innerHTML = cards.map(function(c){
    return '<div class="kpi '+c[4]+'"><div class="kmain"><div class="lb">'+c[0]+'</div>'
      +'<div class="vl">'+c[1]+'<small>'+c[2]+'</small></div>'+c[3]+'</div>'
      +'<div class="kside"><span class="hd">候选内</span>'+c[5]+'</div></div>'; }).join("");
  document.getElementById("hTot").textContent = CN_ALL.length;
  document.getElementById("hNow").textContent = cur.length;
}
function df2(a,b){
  if(a==null||b==null) return '<span class="df">全库 —</span>';
  var dv=a-b, up=dv>=0;
  return '<span class="df">全库 '+fmt(b,2)+' · <em class="'+(up?"":"dn")+'">'
    +(up?"+":"")+fmt(dv,2)+'</em></span>';
}
function cnDraw(cur){
  /* 1 核心收录构成 */
  var cd=CORES.map(function(c){ return [c[1], cur.filter(function(d){return d[c[0]]===1;}).length]; })
    .sort(function(a,b){return b[1]-a[1];}).reverse();
  put("c1", bar(cd.map(function(x){return x[1];}), cd.map(function(x){return x[0];}), "#34d399"));
  /* 2 专辑学科 */
  var ac={}; cur.forEach(function(d){ if(d.专辑){ ac[d.专辑]=(ac[d.专辑]||0)+1; } });
  var aa=Object.keys(ac).map(function(k){return [k,ac[k]];})
    .sort(function(a,b){return b[1]-a[1];}).slice(0,9).reverse();
  put("c2", bar(aa.map(function(x){return x[1];}), aa.map(function(x){return x[0];}), "#38bdf8"));
  /* 3 主办单位类型 */
  var ht={}; cur.forEach(function(d){ var t=hostType(d.主办); ht[t]=(ht[t]||0)+1; });
  var HC={"高校":"#38bdf8","科研院所":"#34d399","学会/协会":"#f59e0b","政府部门":"#fb923c","出版机构":"#a78bfa","其他":"#94a3b8"};
  put("c3",{tooltip:base().tooltip,legend:{show:false},
    series:[{type:"pie",radius:["46%","72%"],center:["50%","52%"],avoidLabelOverlap:true,
      minAngle:6,labelLayout:{hideOverlap:true},
      itemStyle:{borderColor:"#0d1424",borderWidth:2},
      label:{color:"#cbd5e1",fontSize:11,formatter:"{b}\n{c} 本"},
      labelLine:{lineStyle:{color:"#475569"},length:8,length2:10},
      data:Object.keys(ht).map(function(k){ return {name:k,value:ht[k],itemStyle:{color:HC[k]||"#64748b"}}; })
        .filter(function(x){return x.value>0;})}]});
  /* 4 复合IF 分布 */
  var bins=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6.1]];
  var bc=bins.map(function(){return 0;});
  cur.forEach(function(d){ if(d.cif==null) return;
    for(var i=0;i<bins.length;i++){ if(d.cif>=bins[i][0]&&d.cif<bins[i][1]){ bc[i]++; break; } } });
  var bl=bins.map(function(b,i){ return i===bins.length-1? "5+":(b[0]+"–"+b[1]); });
  var o4=base(); o4.xAxis={type:"category",data:bl,axisLine:{lineStyle:{color:GRID}},
    axisLabel:{color:AX,fontSize:10,interval:0},axisTick:{show:false}};
  o4.yAxis={type:"value",axisLine:{lineStyle:{color:GRID}},axisLabel:{color:AX,fontSize:11},
    splitLine:{lineStyle:{color:GRID,type:"dashed"}}};
  o4.series=[{type:"bar",data:bc,barMaxWidth:26,
    itemStyle:{color:function(p){ return ["#34d399","#34d399","#38bdf8","#38bdf8","#f59e0b","#ef4444"][p.dataIndex]; },
      borderRadius:[4,4,0,0]},
    label:{show:true,position:"top",color:"#cbd5e1",fontSize:11}}];
  put("c4",o4);
  /* 5 复合IF × 中信所IF 散点 */
  var pts=[]; cur.forEach(function(d){
    if(d.cif==null||d.zxisif==null) return;
    pts.push({value:[d.cif,d.zxisif,d.ndocs||0],name:d.刊名,
      itemStyle:{color:"#38bdf8",opacity:.78},
      symbolSize:Math.max(6,Math.min(26,Math.sqrt((d.ndocs||0)/30)+5))}); });
  var o5=base();
  o5.xAxis={type:"value",name:"复合IF（知网）",nameTextStyle:{color:AX,fontSize:11},
    axisLine:{lineStyle:{color:GRID}},axisLabel:{color:AX,fontSize:11},
    splitLine:{lineStyle:{color:GRID,type:"dashed"}}};
  o5.yAxis={type:"value",name:"中信所IF（万方）",nameTextStyle:{color:AX,fontSize:11},
    axisLine:{lineStyle:{color:GRID}},axisLabel:{color:AX,fontSize:11},
    splitLine:{lineStyle:{color:GRID,type:"dashed"}}};
  o5.tooltip=Object.assign({},base().tooltip,{formatter:function(p){
    var d=p.data;
    return "<b>"+esc(d.name)+"</b><br>复合IF "+d.value[0]+" · 中信所IF "+d.value[1]
      +"<br>累计文献 "+d.value[2]+" 篇"; }});
  o5.series=[{type:"scatter",data:pts,
    emphasis:{itemStyle:{opacity:1,borderColor:"#fff",borderWidth:1.5}}}];
  put("c5",o5);
  /* 6 出版周期构成 */
  var pc={}; cur.forEach(function(d){ var k=d.period||"未标注"; pc[k]=(pc[k]||0)+1; });
  var PK={"月刊":"#38bdf8","双月刊":"#34d399","季刊":"#f59e0b","半月刊":"#a78bfa","周刊":"#ef4444"};
  put("c6",{tooltip:base().tooltip,
    series:[{type:"pie",radius:["42%","68%"],center:["50%","46%"],avoidLabelOverlap:true,
      minAngle:6,labelLayout:{hideOverlap:true},
      itemStyle:{borderColor:"#0d1424",borderWidth:2},
      label:{color:"#cbd5e1",fontSize:11,formatter:"{b}\n{c}"},
      labelLine:{lineStyle:{color:"#475569"},length:8,length2:10},
      data:Object.keys(pc).map(function(k){ return {name:k,value:pc[k],
        itemStyle:{color:PK[k]||"#64748b"}}; })}]});
}
var CN_THEAD = '<tr>'
  +'<th style="min-width:210px">期刊名称</th>'
  +'<th style="min-width:220px">核心收录</th>'
  +'<th style="text-align:right" title="知网复合影响因子（2025 年度口径）">复合IF</th>'
  +'<th style="text-align:right">综合IF</th>'
  +'<th style="text-align:right" title="中国科技核心期刊影响因子（万方）">中信所IF</th>'
  +'<th style="text-align:right" title="知网『出版文献量』，为创刊至今的累计值。中文刊暂无公开的逐年发文量数据（知网/万方逐年统计需机构IP），故此处给累计值。">发文量(累计)</th>'
  +'<th>出版周期</th><th>专辑学科</th>'
  +'<th style="min-width:150px">主办单位</th>'
  +'</tr>';
var EN_THEAD = '<tr>'
  +'<th style="min-width:270px">期刊名称</th>'
  +'<th title="中科院大类分区 2025.03（缺失时用新锐分区 2026.03 兜底）">大类分区</th>'
  +'<th title="中科院小类分区 2025.03：该刊在中科院分区表里所属第一个小类学科的分区；鼠标悬停看全部小类">小类分区</th>'
  +'<th style="min-width:130px" title="中科院小类学科名（该刊所属小类学科，2025.03）">小类学科（中科院）</th>'
  +'<th>TOP</th><th>大类学科</th>'
  +'<th style="text-align:right">JIF25</th><th style="text-align:right">CiteScore</th>'
  +'<th style="text-align:right" title="2025 年发文量（OpenAlex 统计，最近一个完整年度）">年发文量</th>'
  +'<th style="text-align:right">国人占比</th><th style="text-align:right">APC</th>'
  +'<th>出版模式</th><th>审稿周期</th><th>库</th><th>预警</th>'
  +'</tr>';
function cnTable(cur){
  var tb=document.getElementById("tbody");
  document.getElementById("tCnt").textContent = "共 "+cur.length+" 本";
  if(!cur.length){ tb.innerHTML='<tr><td colspan="9" class="empty">当前条件下没有匹配的期刊，试试放宽复合影响因子区间或核心收录组合</td></tr>'; return; }
  tb.innerHTML = cur.map(function(d){
    var tags = coreTags(d).map(function(t){
      return '<span class="tag '+(CN_TAG_CSS[t]||"z4")+'" style="margin-right:4px">'+esc(t)+'</span>'; }).join("")
      || '<span class="mut">—</span>';
    var name = d.url? ('<a href="'+esc(d.url)+'" target="_blank" rel="noopener">'+esc(d.刊名)+'</a>') : esc(d.刊名);
    return "<tr>"
      +'<td class="jn" data-row="'+d.行+'" title="点击查看期刊详情">'+name+'</td>'
      +'<td>'+tags+'</td>'
      +'<td class="num">'+(d.cif==null?"—":d.cif)+'</td>'
      +'<td class="num">'+(d.zif==null?"—":d.zif)+'</td>'
      +'<td class="num">'+(d.zxisif==null?"—":d.zxisif)+'</td>'
      +'<td class="num" title="知网出版文献量（累计）">'+(d.ndocs==null?"—":d.ndocs)+'</td>'
      +'<td class="mut">'+esc(d.period||"—")+'</td>'
      +'<td class="mut" title="'+esc(d.专题||"")+'">'+esc(d.专辑||"—")+'</td>'
      +'<td class="mut">'+esc(d.主办||"—")+'</td>'
      +"</tr>";
  }).join("");
}

/* ---------- KPI ---------- */
function ext(cur,key){          /* 返回 {max:{v,d}, min:{v,d}} */
  var v=cur.filter(function(d){return typeof d[key]==="number"&&!isNaN(d[key]);});
  if(!v.length) return {max:null,min:null};
  v.sort(function(a,b){return b[key]-a[key];});
  return {max:{v:v[0][key],d:v[0].name||v[0].刊名}, min:{v:v[v.length-1][key],d:v[v.length-1].name||v[v.length-1].刊名}};
}
function med(arr){ var v=arr.filter(function(x){return typeof x==="number"&&!isNaN(x);}).sort(function(a,b){return a-b;});
  if(!v.length) return null; var m=Math.floor(v.length/2);
  return v.length%2? v[m] : (v[m-1]+v[m])/2; }
function sideRow(label,val,cls,title){
  return '<div class="sr '+(cls||"")+'"'+(title?' title="'+esc(title)+'"':'')+'>'+label+'<b>'+val+'</b></div>';
}
function kpi(cur){
  function vals(k){ return cur.map(function(d){return d[k];}); }
  var aJif=avg(vals("jif25")), bJif=avg(BASE.map(function(d){return d.jif25;}));
  var aCn=avg(vals("cn")), bCn=avg(BASE.map(function(d){return d.cn;}));
  var aApc=avg(vals("apc")), bApc=avg(BASE.map(function(d){return d.apc;}));
  var nTop=cur.filter(function(d){return d.top==="是";}).length;
  var nWarn=cur.filter(function(d){return d.预警;}).length;
  var nOa=cur.filter(function(d){return d.oa && d.oa.indexOf("全OA")===0;}).length;
  var nMix=cur.filter(function(d){return d.oa==="混合OA";}).length;
  var nSub=cur.filter(function(d){return d.oa==="订阅制";}).length;
  function df(a,b,n,inv){
    if(a==null||b==null) return '<span class="df">全库 —</span>';
    var dv=a-b, up=dv>=0, good=inv? !up : up;
    return '<span class="df">全库 '+fmt(b,n)+' · <em class="'+(good?"":"dn")+'">'
      +(up?"+":"")+fmt(dv,n)+'</em></span>';
  }
  /* 各卡片右侧的补充信息：极值 / 中位数 / 结构占比，填补留白 */
  var eJif=ext(cur,"jif25"), eCn=ext(cur,"cn"), eApc=ext(cur,"apc");
  var mJif=med(vals("jif25")), mApc=med(vals("apc"));
  var secCnt={}; cur.forEach(function(d){ if(d.板块) secCnt[d.板块]=(secCnt[d.板块]||0)+1; });
  var topSec=Object.keys(secCnt).sort(function(a,b){return secCnt[b]-secCnt[a];})[0];
  var n1=cur.filter(function(d){return zone(d)==="1区";}).length;
  var nFree=cur.filter(function(d){return d.apc===0;}).length;
  var nApcData=cur.filter(function(d){return typeof d.apc==="number";}).length;

  var sideJif = eJif.max? sideRow("最高",fmt(eJif.max.v,2),"hi",eJif.max.d)
    + sideRow("最低",fmt(eJif.min.v,2),"lo",eJif.min.d)
    + sideRow("中位",fmt(mJif,2)) : sideRow("—","—");
  var sideCn = eCn.max? sideRow("最高",eCn.max.v+"%","hi",eCn.max.d)
    + sideRow("最低",eCn.min.v+"%","lo",eCn.min.d)
    + sideRow("中位",fmt(med(vals("cn")),1)+"%") : sideRow("—","—");
  var sideApc = (eApc.max&&nApcData)? sideRow("最高","$"+eApc.max.v,"hi",eApc.max.d)
    + sideRow("中位","$"+(mApc==null?"—":Math.round(mApc)))
    + sideRow("$0 免收",nFree+" 本","",'APC 记录为 0 的期刊（多为订阅制或免费发表）') : sideRow("—","—");
  var sideTop = sideRow("1区",""+n1+" 本","hi")
    + sideRow("全库TOP",BASE.filter(function(d){return d.top==="是";}).length+" 本")
    + sideRow("TOP率",(cur.length?Math.round(nTop*100/cur.length):0)+"%");
  var sideOa = sideRow("混合OA",""+nMix,"hi") + sideRow("订阅制",""+nSub)
    + sideRow("预警",nWarn?(""+nWarn+" 本"):"0");
  var sideCnt = (topSec? sideRow("最大板块",String(topSec).slice(0,7),"hi",topSec+": "+secCnt[topSec]+" 本")
    : sideRow("—","—"))
    + sideRow("板块数",Object.keys(secCnt).length+"/"+uniq(BASE.map(function(d){return d.板块;})).length)
    + sideRow("命中率",Math.round(cur.length*100/BASE.length)+"%");

  var cards=[
    ["候选期刊",cur.length,"本",'<span class="df">共 '+BASE.length+' 本 · 命中 '
      +Math.round(cur.length*100/BASE.length)+'%</span>',"",sideCnt],
    ["平均影响因子",fmt(aJif,2),"",df(aJif,bJif,2),"k2",sideJif],
    ["平均国人占比",fmt(aCn,1),"%",df(aCn,bCn,1),"k3",sideCn],
    ["平均 APC",aApc?("$"+Math.round(aApc)):"—","",df(aApc,bApc,0,true),"k4",sideApc],
    ["中科院 TOP",nTop,"本",'<span class="df">占候选 '
      +(cur.length?Math.round(nTop*100/cur.length):0)+'% · 全库 '
      +BASE.filter(function(d){return d.top==="是";}).length+' 本</span>',"k5",sideTop],
    ["完全 OA",nOa,"本",'<span class="df">'+(nWarn?('<em class="dn">含预警 '+nWarn+' 本</em>'):"无预警刊命中")+'</span>',"k6",sideOa]
  ];
  document.getElementById("kpis").innerHTML = cards.map(function(c){
    return '<div class="kpi '+c[4]+'"><div class="kmain"><div class="lb">'+c[0]+'</div>'
      +'<div class="vl">'+c[1]+'<small>'+c[2]+'</small></div>'+c[3]+'</div>'
      +'<div class="kside"><span class="hd">候选内</span>'+c[5]+'</div></div>'; }).join("");
  document.getElementById("hTot").textContent = BASE.length;
  document.getElementById("hNow").textContent = cur.length;
}

/* ---------- charts ---------- */
function base(){ return {
  textStyle:{color:AX,fontFamily:"inherit"},
  tooltip:{backgroundColor:"rgba(13,20,36,.96)",borderColor:"rgba(255,255,255,.14)",
    textStyle:{color:"#e2e8f0",fontSize:12},padding:[9,12],extraCssText:"border-radius:9px;"},
  grid:{left:8,right:14,top:16,bottom:6,containLabel:true}
};}
function put(id,opt){
  if(!charts[id]){ charts[id]=echarts.init(document.getElementById(id),null,{renderer:"canvas"}); }
  charts[id].setOption(opt,true);
}
function bar(series,cats,color,horiz){
  var o=base(); o.grid=Object.assign({},o.grid,{right:36});   /* 右侧留出数值标签空间，避免文字被裁/压盖 */
  o.xAxis={type:"value",axisLine:{lineStyle:{color:GRID}},axisLabel:{color:AX,fontSize:11},
    splitLine:{lineStyle:{color:GRID,type:"dashed"}}};
  o.yAxis={type:"category",data:cats,axisLine:{lineStyle:{color:GRID}},axisLabel:{color:AX,fontSize:11},
    axisTick:{show:false}};
  o.series=[{type:"bar",data:series,barMaxWidth:20,
    itemStyle:{color:color,borderRadius:[0,5,5,0]},
    label:{show:true,position:"right",color:"#cbd5e1",fontSize:11,fontWeight:600},
    labelLayout:{hideOverlap:true}}];
  return o;
}
function draw(cur){
  /* 1 分区分布 */
  var zc={}; cur.forEach(function(d){ var z=zone(d)||"未标注"; zc[z]=(zc[z]||0)+1; });
  var zo=["1区","2区","3区","4区"], zd=zo.map(function(z){return zc[z]||0;});
  put("c1",{tooltip:base().tooltip,legend:{show:false},
    series:[{type:"pie",radius:["46%","72%"],center:["50%","52%"],avoidLabelOverlap:true,
      minAngle:6,labelLayout:{hideOverlap:true},
      itemStyle:{borderColor:"#0d1424",borderWidth:2},
      label:{color:"#cbd5e1",fontSize:11,formatter:"{b}\n{c} 本"},
      labelLine:{lineStyle:{color:"#475569"},length:8,length2:10},
      data:zo.map(function(z,i){ return {name:z,value:zd[i],itemStyle:{color:ZC[z]}}; })
        .filter(function(x){return x.value>0;})}]});

  /* 2 学科归属 */
  var sc={}; cur.forEach(function(d){ if(d.学科归属){ sc[d.学科归属]=(sc[d.学科归属]||0)+1; } });
  var sa=Object.keys(sc).map(function(k){return [k,sc[k]];})
    .sort(function(a,b){return b[1]-a[1];}).slice(0,9).reverse();
  put("c2", bar(sa.map(function(x){return x[1];}), sa.map(function(x){return x[0];}), "#38bdf8"));

  /* 3 OA + 预警 */
  var oc={}; cur.forEach(function(d){ var k=d.oa||"未标注"; oc[k]=(oc[k]||0)+1; });
  var OCM={"全OA(DOAJ)":"#34d399","全OA":"#6ee7b7","混合OA":"#38bdf8","订阅制":"#94a3b8"};
  var ow=cur.filter(function(d){return d.预警;}).length;
  put("c3",{tooltip:base().tooltip,
    series:[{type:"pie",radius:["42%","68%"],center:["50%","46%"],avoidLabelOverlap:true,
      minAngle:6,labelLayout:{hideOverlap:true},
      itemStyle:{borderColor:"#0d1424",borderWidth:2},
      label:{color:"#cbd5e1",fontSize:11,formatter:"{b}\n{c}"},
      labelLine:{lineStyle:{color:"#475569"},length:8,length2:10},
      data:Object.keys(oc).map(function(k){ return {name:k,value:oc[k],
        itemStyle:{color:OCM[k]||"#64748b"}}; })},
      {type:"pie",radius:["0%","26%"],center:["50%","46%"],silent:true,
       label:{show:true,position:"center",color:"#fca5a5",fontSize:12,fontWeight:700,
         formatter:ow?("预警\n"+ow+" 本"):"无预警"},
       data:[{value:1,itemStyle:{color:ow?"rgba(239,68,68,.22)":"rgba(52,211,153,.16)"}}]}]});

  /* 4 APC 分布 */
  var bins=[[0,500],[500,1000],[1000,1500],[1500,2000],[2000,2500],[2500,3000],[3000,3500],[3500,4000],[4000,1e9]];
  var bc=bins.map(function(){return 0;});
  cur.forEach(function(d){ if(d.apc==null) return;
    for(var i=0;i<bins.length;i++){ if(d.apc>=bins[i][0]&&d.apc<bins[i][1]){ bc[i]++; break; } } });
  var bl=bins.map(function(b,i){ return b[1]>=1e9? "4000+":(b[0]+"-"+b[1]); });
  var o4=base(); o4.xAxis={type:"category",data:bl,axisLine:{lineStyle:{color:GRID}},
    axisLabel:{color:AX,fontSize:10,interval:0,rotate:32},axisTick:{show:false}};
  o4.yAxis={type:"value",axisLine:{lineStyle:{color:GRID}},axisLabel:{color:AX,fontSize:11},
    splitLine:{lineStyle:{color:GRID,type:"dashed"}}};
  o4.series=[{type:"bar",data:bc,barMaxWidth:26,
    itemStyle:{color:function(p){ var v=["#34d399","#34d399","#38bdf8","#38bdf8","#38bdf8",
      "#f59e0b","#f59e0b","#fb923c","#ef4444"]; return v[p.dataIndex]; },borderRadius:[4,4,0,0]}}];
  put("c4",o4);

  /* 5 散点：国人占比 × JIF */
  var pts=[]; cur.forEach(function(d){
    if(d.cn==null||d.jif25==null) return;
    var z=zone(d);
    pts.push({value:[d.cn,d.jif25,d.n25||0],name:d.刊名,
      itemStyle:{color:(ZC[z]||"#64748b"),opacity:.78},
      symbolSize:Math.max(6,Math.min(26,Math.sqrt((d.n25||0)/8)+5)),
      zone:z, oa:d.oa, apc:d.apc, cs:d.cs, warn:d.预警}); });
  var o5=base();
  o5.xAxis={type:"value",name:"国人占比 %",nameTextStyle:{color:AX,fontSize:11},max:100,
    axisLine:{lineStyle:{color:GRID}},axisLabel:{color:AX,fontSize:11},
    splitLine:{lineStyle:{color:GRID,type:"dashed"}}};
  o5.yAxis={type:"value",name:"JIF 2025",nameTextStyle:{color:AX,fontSize:11},
    axisLine:{lineStyle:{color:GRID}},axisLabel:{color:AX,fontSize:11},
    splitLine:{lineStyle:{color:GRID,type:"dashed"}}};
  o5.tooltip=Object.assign({},base().tooltip,{formatter:function(p){
    var d=p.data;
    return "<b>"+esc(d.name)+"</b><br>分区 "+esc(d.zone||"—")
      +(d.warn? ' · <span style="color:#fca5a5">预警</span>':'')+"<br>国人占比 "+d.value[0]
      +"% · JIF "+d.value[1]+"<br>年发文 "+d.value[2]+" 篇"
      +(d.cs? " · CiteScore "+d.cs:"")+(d.apc? " · APC $"+d.apc:""); }});
  o5.series=[{type:"scatter",data:pts,
    emphasis:{itemStyle:{opacity:1,borderColor:"#fff",borderWidth:1.5}}}];
  put("c5",o5);

  /* 6 发文量走势 */
  var ys=["n22","n23","n24","n25","n26"], yl=["2022","2023","2024","2025","2026"];
  var tv=ys.map(function(k){ var s=0,n=0; cur.forEach(function(d){ if(d[k]!=null){s+=d[k];n++;} });
    return n? s:0; });
  var o6=base();
  o6.xAxis={type:"category",data:yl,axisLine:{lineStyle:{color:GRID}},
    axisLabel:{color:AX,fontSize:11},axisTick:{show:false}};
  o6.yAxis={type:"value",axisLine:{lineStyle:{color:GRID}},axisLabel:{color:AX,fontSize:11},
    splitLine:{lineStyle:{color:GRID,type:"dashed"}}};
  o6.series=[{type:"line",data:tv,smooth:true,symbol:"circle",symbolSize:7,
    lineStyle:{width:2.6,color:"#22d3ee"},itemStyle:{color:"#22d3ee"},
    areaStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,
      [{offset:0,color:"rgba(34,211,238,.34)"},{offset:1,color:"rgba(34,211,238,.02)"}])},
    label:{show:true,color:"#cbd5e1",fontSize:11,position:"top"}}];
  put("c6",o6);
}

/* ---------- table ---------- */
function table(cur){
  var tb=document.getElementById("tbody");
  document.getElementById("tCnt").textContent = "共 "+cur.length+" 本"
    +(cur.length>60? "（已全部列出，可滚动）":"");
  if(!cur.length){ tb.innerHTML='<tr><td colspan="15" class="empty">当前条件下没有匹配的期刊，试试放宽 APC 区间或国人占比要求</td></tr>'; return; }
  tb.innerHTML = cur.map(function(d){
    var z=zone(d), zc=z==="1区"?"z1":z==="2区"?"z2":z==="3区"?"z3":"z4";
    var nz=d.nfx25, nzc=nz?("nz"+(zIdx(nz)+1)):"";
    var name = d.url? ('<a href="'+esc(d.url)+'" target="_blank" rel="noopener">'+esc(d.刊名)+'</a>') : esc(d.刊名);
    return "<tr>"
      +'<td class="jn" data-row="'+d.行+'" title="点击查看投稿须知">'+name+'</td>'
      +'<td><span class="tag '+zc+'" title="中科院大类分区">'+esc(z||"—")+'</span></td>'
      +'<td>'+(nz? '<span class="tag '+nzc+'" title="'+esc(d.nfx25d||"")+'">'+esc(nz)+'</span>'
                 : '<span class="mut">—</span>')+'</td>'
      +'<td class="mut" title="中科院小类学科（仅学科名）">'+esc(d.小类学科||"—")+'</td>'
      +'<td>'+(d.top==="是"?'<span class="tag tg">TOP</span>':'<span class="mut">—</span>')+'</td>'
      +'<td class="mut">'+esc(d.学科归属||"—")+'</td>'
      +'<td class="num">'+(d.jif25==null?"—":d.jif25)+'</td>'
      +'<td class="num">'+(d.cs==null?"—":d.cs)+'</td>'
      +'<td class="num" title="2025 年发文量（OpenAlex）">'+(d.n25==null?"—":d.n25)+'</td>'
      +'<td class="num">'+(d.cn==null?"—":d.cn+"%")+'</td>'
      +'<td class="num">'+(d.apc==null?"—":"$"+d.apc)+'</td>'
      +'<td><span class="tag '+(d.oa&&d.oa.indexOf("全OA")===0?"toa":"tsub")+'">'+esc(d.oa||"—")+'</span></td>'
      +'<td class="mut">'+esc(d.周期||"—")+'</td>'
      +'<td class="mut">'+esc(d.数据库||"—")+'</td>'
      +'<td>'+(d.预警?'<span class="tag tw2">'+esc(d.预警)+'</span>':'<span class="mut">—</span>')+'</td>'
      +"</tr>";
  }).join("");
}

/* ---------- 期刊详情弹框 ---------- */
var GD = window.GUIDE || {};
var CURROW = null;

function byRow(r){ var src=(MODE==="cn")?CNR:(MODE==="edu"?EDU:D); for(var i=0;i<src.length;i++){ if(src[i].行===r) return src[i]; } return null; }

function statCell(k,v){ return '<div><div class="k">'+k+'</div><div class="v">'+v+'</div></div>'; }
function nv(v,suf){ return (v==null||v==="")? "—" : v+(suf||""); }

function openModal(row){ if(MODE==="cn") openModalCn(row); else openModalEn(row); }

function openModalEn(row){
  var d = byRow(row); if(!d) return;
  CURROW = row;
  var g = GD[String(row)] || {};
  var z = zone(d);
  document.getElementById("mName").textContent = d.刊名 || "—";

  // 封面
  var cv = document.getElementById("mCov");
  if(g.c && g.c.startsWith("template-assets/")){
    const image = document.createElement("img"); image.alt="cover"; cv.replaceChildren(image);
    files.bindImage(image, g.c).catch(function(){ if(image.isConnected) cv.textContent="封面加载失败"; });
  } else if(g.c){ cv.innerHTML = '<img src="'+g.c+'" alt="cover">'; }
  else { cv.innerHTML = '<div class="ph2">'+esc((d.简称||d.刊名||"?").slice(0,2).toUpperCase())+'</div>'; }

  // 标签
  var tags = [];
  if(z) tags.push('<span class="tag '+(z==="1区"?"z1":z==="2区"?"z2":z==="3区"?"z3":"z4")+'">'+esc(z)+'</span>');
  if(d.nfx25) tags.push('<span class="tag nz'+(zIdx(d.nfx25)+1)+'">小类 '+esc(d.nfx25)+'</span>');
  if(d.top==="是") tags.push('<span class="tag tg">中科院 TOP</span>');
  if(d.预警) tags.push('<span class="tag tw2">预警 '+esc(d.预警)+'</span>');
  if(d.数据库) tags.push('<span class="tag tsub">'+esc(d.数据库)+'</span>');
  if(d.oa) tags.push('<span class="tag '+(d.oa.indexOf("全OA")===0?"toa":"tsub")+'">'+esc(d.oa)+'</span>');
  document.getElementById("mTags").innerHTML = tags.join("");

  // 概要
  var meta = [];
  if(d.学科归属) meta.push('中科院大类学科 <b>'+esc(d.学科归属)+'</b>');
  if(d.小类学科) meta.push('中科院小类学科 <b>'+esc(d.小类学科)+'</b>');
  if(d.nfx25d) meta.push('中科院小类分区 <b>'+esc(d.nfx25d)+'</b>');
  if(d.wos学科) meta.push('WoS 学科 <b>'+esc(d.wos学科)+'</b>');
  meta.push('出版商 <b>'+esc(d.出版商||"—")+'</b>');
  if(d.issn) meta.push('ISSN <b>'+esc(d.issn)+'</b>');
  if(d.周期) meta.push('审稿周期 <b>'+esc(d.周期)+'</b>');
  document.getElementById("mMeta").innerHTML = meta.join(" &nbsp;·&nbsp; ");

  // 指标条
  document.getElementById("mStat").innerHTML =
      statCell("JIF 2025", nv(d.jif25)) + statCell("5年 JIF", nv(d.jif5))
    + statCell("CiteScore", nv(d.cs)) + statCell("JCI", nv(d.jci))
    + statCell("国人占比", nv(d.cn, "%")) + statCell("APC", d.apc==null?"—":"$"+d.apc)
    + statCell("年发文", nv(d.n25)) + statCell("JCR 2025", nv(d.jcr25));

  // 投稿须知分节
  var secs = g.s || [], box = document.getElementById("mSecs");
  var note = "";
  if(g.gen){
    note = '<div class="mgen"><b>注意：</b>未能抓到该刊的专属投稿须知，以下为 '
         + '<b>'+esc(g.glabel || "出版社")+'</b> 的通用投稿政策。'
         + '篇幅、栏目、参考文献格式等仍须以期刊官网为准'
         + (g.g? '（见右侧「投稿须知原文」）。' : '。');
  }
  if(!secs.length){
    box.innerHTML = '<div class="mnone">未抓到该刊的结构化投稿须知'
      + (g.g? '，可点击下方「投稿须知原文」直接查看官网页面。' : '，该刊官网在本网络环境下不可达（多为 Cloudflare 验证或域名不通）。')
      + '</div>';
  } else {
    box.innerHTML = note + secs.map(function(s,i){
      return '<div class="sec'+(i<2?" open":"")+'"><div class="sh"><span>'+esc(s.h)+'</span><span>▸</span></div>'
        +'<div class="sb">'+esc(s.t)+'</div></div>';
    }).join("");
    box.querySelectorAll(".sh").forEach(function(h){
      h.addEventListener("click", function(){ h.parentNode.classList.toggle("open"); });
    });
  }

  // 原文摘录
  var fb = document.getElementById("mFullBox");
  if(g.f){ fb.innerHTML = '<div class="mfull" id="mFullTxt">'+esc(g.f)+'</div>'; }
  else { fb.innerHTML = ""; }
  var bf = document.getElementById("mBtnFull");
  bf.style.display = g.f? "" : "none";
  bf.textContent = "展开原文摘录";

  // 右侧资源
  var res = [];
  if(g.g) res.push('<a class="rlink" href="'+esc(g.g)+'" target="_blank" rel="noopener"><span class="ic">须</span>'
    +'<span>投稿须知原文<small>'+esc(String(g.g).replace(/^https?:\/\//,"").slice(0,42))+'</small></span></a>');
  if(d.url) res.push('<a class="rlink" href="'+esc(d.url)+'" target="_blank" rel="noopener"><span class="ic">投</span>'
    +'<span>期刊主页 / 投稿入口<small>'+esc(String(d.url).replace(/^https?:\/\//,"").slice(0,42))+'</small></span></a>');
  (g.t||[]).forEach(function(t){
    res.push('<a class="rlink tpl" href="'+encodeURI(t.path)+'" download><span class="ic">W</span>'
      +'<span>'+esc(t.name)+'<small>Word 模板 · '+Math.round((t.size||0)/1024)+' KB · 点击下载</small></span></a>');
  });
  if(!res.length) res.push('<div class="mnone">暂无可用投稿资源链接</div>');
  document.getElementById("mRes").innerHTML = res.join("");

  document.getElementById("mask").classList.add("on");
  document.body.style.overflow = "hidden";
}

function closeModal(){
  document.getElementById("mask").classList.remove("on");
  document.body.style.overflow = "";
  CURROW = null;
}

function cnByRow(r){ for(var i=0;i<CNR.length;i++){ if(CNR[i].行===r) return CNR[i]; } return null; }

function openModalCn(row){
  var d = cnByRow(row); if(!d) return;
  CURROW = row;
  document.getElementById("mName").textContent = d.刊名 || "—";
  var cv = document.getElementById("mCov");
  if(d.cover){ cv.innerHTML = '<img src="'+d.cover+'" alt="cover">'; }
  else { cv.innerHTML = '<div class="ph2">中</div>'; }

  var tags = coreTags(d).map(function(t){
    return '<span class="tag '+(CN_TAG_CSS[t]||"z4")+'">'+esc(t)+'</span>'; });
  if(d.period) tags.push('<span class="tag tsub">'+esc(d.period)+'</span>');
  document.getElementById("mTags").innerHTML = tags.join("");

  var meta = [];
  if(d.英文名) meta.push('英文刊名 <b>'+esc(d.英文名)+'</b>');
  if(d.主管) meta.push('主管 <b>'+esc(d.主管)+'</b>');
  if(d.主办) meta.push('主办 <b>'+esc(d.主办)+'</b>');
  if(d.issn) meta.push('ISSN <b>'+esc(d.issn)+'</b>');
  if(d.cnno) meta.push('CN <b>'+esc(d.cnno)+'</b>');
  if(d.专辑) meta.push('专辑 <b>'+esc(d.专辑)+'</b>');
  if(d.专题) meta.push('专题 <b>'+esc(d.专题)+'</b>');
  document.getElementById("mMeta").innerHTML = meta.join(" &nbsp;·&nbsp; ");

  document.getElementById("mStat").innerHTML =
      statCell("复合IF", nv(d.cif)) + statCell("综合IF", nv(d.zif))
    + statCell("中信所IF", nv(d.zxisif)) + statCell("万方IF", nv(d.wfif))
    + statCell("出版周期", nv(d.period)) + statCell("累计文献", nv(d.ndocs))
    + statCell("主办类型", hostType(d.主办)) + statCell("卓越计划", d.zy? "是":"—");

  var info = [];
  if(d.备注) info.push('<div class="sec open"><div class="sh"><span>更新备注</span><span>▸</span></div>'
    +'<div class="sb">'+esc(d.备注)+'</div></div>');
  info.push('<div class="mnone">中文刊暂未收录结构化投稿须知；核心收录与指标见上方。'
    +'投稿要求（篇幅、格式、审稿费）请通过右侧期刊主页确认。</div>');
  document.getElementById("mSecs").innerHTML = info.join("");
  document.getElementById("mSecs").querySelectorAll(".sh").forEach(function(h){
    h.addEventListener("click", function(){ h.parentNode.classList.toggle("open"); });
  });
  document.getElementById("mFullBox").innerHTML = "";
  document.getElementById("mBtnFull").style.display = "none";

  var res = [];
  if(d.url) res.push('<a class="rlink" href="'+esc(d.url)+'" target="_blank" rel="noopener"><span class="ic">知</span>'
    +'<span>期刊主页（知网导航）<small>'+esc(String(d.url).replace(/^https?:\/\//,"").slice(0,42))+'</small></span></a>');
  if(d.wfcode) res.push('<a class="rlink tpl" href="https://c.wanfangdata.com.cn/periodical/'+esc(d.wfcode)
    +'" target="_blank" rel="noopener"><span class="ic">万</span><span>万方期刊页<small>c.wanfangdata.com.cn/periodical/'
    +esc(d.wfcode)+'</small></span></a>');
  if(!res.length) res.push('<div class="mnone">暂无可用期刊链接</div>');
  document.getElementById("mRes").innerHTML = res.join("");

  document.getElementById("mask").classList.add("on");
  document.body.style.overflow = "hidden";
}

document.getElementById("tbody").addEventListener("click", function(e){
  var td = e.target.closest ? e.target.closest(".jn") : null;
  if(!td) return;
  e.preventDefault();
  openModal(parseInt(td.getAttribute("data-row"),10));
});
document.getElementById("mClose").addEventListener("click", closeModal);
document.getElementById("mBtnClose").addEventListener("click", closeModal);
document.getElementById("mask").addEventListener("click", function(e){ if(e.target.id==="mask") closeModal(); });
document.addEventListener("keydown", function(e){ if(e.key==="Escape" && CURROW!==null) closeModal(); });
document.getElementById("mBtnFull").addEventListener("click", function(){
  var t = document.getElementById("mFullTxt"); if(!t) return;
  t.classList.toggle("on");
  this.textContent = t.classList.contains("on")? "收起原文摘录" : "展开原文摘录";
});
document.getElementById("mBtnCopy").addEventListener("click", function(){
  if(MODE==="cn"){ copyCn(this); return; }
  var d = byRow(CURROW); if(!d) return;
  var g = GD[String(CURROW)] || {};
  var L = [];
  L.push("期刊：" + (d.刊名||""));
  L.push("分区：" + (zone(d)||"—") + "（中科院大类）"
       + (d.小类学科? " / 小类学科 "+d.小类学科 : "")
       + (d.top==="是"?" / 中科院TOP":"") + (d.预警?" / 预警 "+d.预警:""));
  L.push("JIF2025：" + (d.jif25==null?"—":d.jif25) + "  CiteScore：" + (d.cs==null?"—":d.cs)
       + "  国人占比：" + (d.cn==null?"—":d.cn+"%") + "  APC：" + (d.apc==null?"—":"$"+d.apc));
  L.push("投稿须知：" + (g.g||"—"));
  L.push("");
  (g.s||[]).forEach(function(s){ L.push("【"+s.h+"】"+s.t); });
  var txt = L.join("\n");
  var self=this;
  function done(okmsg){ self.textContent=okmsg; setTimeout(function(){ self.textContent="复制投稿要点"; }, 1600); }
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(function(){ done("已复制 ✓"); },
      function(){ fallbackCopy(txt, done); });
  } else { fallbackCopy(txt, done); }
  function fallbackCopy(t, cb){
    var ta = document.createElement("textarea");
    ta.value = t; ta.style.position="fixed"; ta.style.left="-9999px";
    document.body.appendChild(ta); ta.select();
    var ok=false;
    try{ ok = document.execCommand("copy"); }catch(err){ ok=false; }
    document.body.removeChild(ta);
    cb(ok? "已复制 ✓" : "复制失败");
  }
});

function copyCn(self){
  var d = cnByRow(CURROW); if(!d) return;
  var L = [];
  L.push("期刊：" + (d.刊名||"") + (d.英文名? "（"+d.英文名+"）" : ""));
  L.push("核心收录：" + (coreTags(d).join(" / ")||"—"));
  L.push("复合IF：" + (d.cif==null?"—":d.cif) + "  综合IF：" + (d.zif==null?"—":d.zif)
       + "  中信所IF：" + (d.zxisif==null?"—":d.zxisif));
  L.push("主管：" + (d.主管||"—") + "  主办：" + (d.主办||"—"));
  L.push("ISSN：" + (d.issn||"—") + "  CN：" + (d.cnno||"—") + "  出版周期：" + (d.period||"—"));
  L.push("期刊主页：" + (d.url||"—"));
  var txt = L.join("\n");
  function done(okmsg){ self.textContent=okmsg; setTimeout(function(){ self.textContent="复制期刊要点"; }, 1600); }
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(function(){ done("已复制 ✓"); },
      function(){ fallbackCopy2(txt, done); });
  } else { fallbackCopy2(txt, done); }
  function fallbackCopy2(t, cb){
    var ta = document.createElement("textarea");
    ta.value = t; ta.style.position="fixed"; ta.style.left="-9999px";
    document.body.appendChild(ta); ta.select();
    var ok=false;
    try{ ok = document.execCommand("copy"); }catch(err){ ok=false; }
    document.body.removeChild(ta);
    cb(ok? "已复制 ✓" : "复制失败");
  }
}

function render(){
  if(MODE==="cn"){ var cur2=cnFiltered(); cnKpi(cur2); cnDraw(cur2); cnTable(cur2); return; }
  BASE = (MODE==="edu") ? EDU_ALL : ALL;
  var cur=filtered(); kpi(cur); draw(cur); table(cur);
}

function resizeAll(){ Object.keys(charts).forEach(function(k){ charts[k].resize(); }); }
var rt=null;
function resizeSoon(){ if(rt) clearTimeout(rt); rt=setTimeout(resizeAll,110); }
window.addEventListener("resize", resizeSoon);
/* 除窗口缩放外，布局自身变化（如侧栏/字体导致容器变宽）也要重算画布，
   否则 ECharts 内联像素宽度会与卡片实际宽度脱节 → 图形被裁切或溢出 */
if(window.ResizeObserver){
  new ResizeObserver(resizeSoon).observe(document.querySelector(".charts"));
}

/* ---------- 模式切换：英文刊 / 中文刊 ---------- */
var SUB_EN = "英文刊：中科院分区 2025.03 · 新锐分区 2026.03 · JCR/JIF 2025 · OpenAlex 指标 · 中科院预警名单 2020–2025";
var SUB_CN = "中文刊：北大核心 · CSCD · CSTPCD · EI · 卓越计划(二期) · 知网复合/综合IF · 万方中信所IF";
var SUB_EDU = "教育类英文刊：教育学 / 学科教育 / STEM 教育等 SSCI&SCI 双收录与 SCIE 期刊 · 含 JCR/JIF 2025 · 中科院大类/小类分区 · OA 类型";
var SORTS = {
  en: [["jif25","影响因子 高→低"],["cn","国人占比 高→低"],["apc","版面费 低→高"],
       ["cs","CiteScore 高→低"],["zone","大类分区 1→4区"],["nfx25","小类分区 1→4区"],
       ["n25","年发文量 高→低"]],
  edu: [["jif25","影响因子 高→低"],["cn","国人占比 高→低"],["apc","版面费 低→高"],
       ["cs","CiteScore 高→低"],["zone","大类分区 1→4区"],["nfx25","小类分区 1→4区"],
       ["n25","年发文量 高→低"]],
  cn: [["cif","复合IF 高→低"],["zxisif","中信所IF 高→低"],["zif","综合IF 高→低"],
       ["ndocs","发文量(累计) 多→少"],["name","刊名 拼音"]]
};
var CHART_META = {
  en: [["中科院大类分区分布","当前候选在各分区的数量"],
       ["学科归属分布","按中科院大类学科统计"],
       ["出版模式与预警","OA 类型构成，预警刊单独标红"],
       ["版面费 APC 分布","美元，按区间统计有 APC 数据的期刊"],
       ["国人占比 × 影响因子","气泡大小＝年发文量；越靠右上＝中国作者多且 IF 高"],
       ["近五年发文量走势","候选期刊合计年发文量，可看扩刊趋势"]],
  edu: [["中科院大类分区分布","当前候选在各分区的数量"],
       ["学科归属分布","按中科院大类学科统计"],
       ["出版模式与预警","OA 类型构成，预警刊单独标红"],
       ["版面费 APC 分布","美元，按区间统计有 APC 数据的期刊"],
       ["国人占比 × 影响因子","气泡大小＝年发文量；越靠右上＝中国作者多且 IF 高"],
       ["近五年发文量走势","候选期刊合计年发文量，可看扩刊趋势"]],
  cn: [["核心收录体系构成","候选期刊在各核心库中的命中数"],
       ["专辑学科分布","按知网文献学科分类统计"],
       ["主办单位类型","按主办单位名称归类（高校/科研院所/学会协会等）"],
       ["复合影响因子分布","知网 2025 年度口径，按区间统计"],
       ["复合IF × 中信所IF","气泡大小＝累计文献量；两套口径的对照"],
       ["出版周期构成","月刊/双月刊/季刊等"]]
};
function setChartTitles(m){
  var metas = CHART_META[m];
  var chs = document.querySelectorAll(".charts .ch");
  for(var i=0;i<chs.length && i<metas.length;i++){
    chs[i].querySelector(".ct").textContent = metas[i][0];
    chs[i].querySelector(".cs").textContent = metas[i][1];
  }
}
function setSortOpts(m){
  var sel = document.getElementById("sort");
  sel.innerHTML = SORTS[m].map(function(o){ return '<option value="'+o[0]+'">'+o[1]+'</option>'; }).join("");
  sel.value = (m==="cn"? CS.sort : S.sort);
}
function setMode(m){
  if(MODE===m) return;
  MODE = m;
  document.body.setAttribute("data-mode", m);
  document.querySelectorAll("#modeSwitch .mbtn").forEach(function(b){
    b.classList.toggle("on", b.dataset.m===m);
    b.classList.toggle("cn-on", b.dataset.m==="cn");
  });
  setChartTitles(m); setSortOpts(m);
  document.getElementById("thead").innerHTML = (m==="cn"? CN_THEAD : EN_THEAD);
  document.getElementById("subLine").textContent = (m==="cn"? SUB_CN : (m==="edu"? SUB_EDU : SUB_EN));
  document.getElementById("q").placeholder = (m==="cn"? "刊名 / 主办单位 / 学科" : "刊名 / 学科 / 出版商");
  document.getElementById("qIssn").placeholder = (m==="cn"
    ? "ISSN / CN（如 1001-1595 或 11-2089/P）"
    : "ISSN / EISSN（如 0196-2892 或 01962892）");
  document.getElementById("qHint").textContent = (m==="cn"
    ? "关键词匹配刊名 / 主办 / 学科；ISSN 框匹配 ISSN 或 CN 号"
    : "关键词匹配刊名 / 学科 / 出版商；ISSN 框只认刊号，连字符可省");
  document.getElementById("qIssn").value = (m==="cn"? CS.issn : S.issn) || "";
  document.getElementById("btnCsv").textContent = (m==="cn"? "导出中文刊候选 CSV" : "导出当前候选 CSV");
  /* 英文/教育类共用同一套筛选格：切换时重建板块/分区 chip，并清空跨库残留的筛选 */
  if(m!=="cn"){
    var src = (m==="edu")? EDU_ALL : ALL;
    S.sec=[]; S.zone=[];
    buildSecZoneChips(src);
  }
  /* 清掉旧 option 再重绘，避免散点/条形 option 残留 */
  Object.keys(charts).forEach(function(k){ charts[k].clear(); });
  render();
  setTimeout(resizeAll, 130);
}
document.getElementById("modeSwitch").addEventListener("click", function(e){
  var b = e.target.closest(".mbtn"); if(b) setMode(b.dataset.m);
});
/* 初始化：表头与中文 chips 预构建（中文面板初始隐藏） */
document.getElementById("thead").innerHTML = EN_THEAD;
/* 关键：初始就要给 body 挂上 data-mode，否则 .cn-only 的筛选格与中文口径说明
   会在英文模式下一起显示（历史 bug，靠 .cn-only 显隐但没人设过这个属性） */
document.body.setAttribute("data-mode", MODE);
/* 模式按钮计数随数据动态刷新（含 AJSE 增量、教育类英文刊） */
document.querySelectorAll("#modeSwitch .mbtn").forEach(function(b){
  var m=b.dataset.m;
  b.querySelector("b").textContent = (m==="cn"? CNR.length : (m==="edu"? EDU.length : ALL.length));
});
buildCoreChips();
render();
setTimeout(resizeAll, 260);
})();

}
