import { createTianaFetch } from '@tianacloud/serverless';
const style=document.createElement("style");style.textContent="\n/* ============================================================\n   OneLaunch · 开号一条龙\n   跨系统账号开通与权限回收编排台\n   ============================================================ */\n\n:root{\n  --ink:#0d1b2a;\n  --ink-2:#475569;\n  --ink-3:#8b98a9;\n  --ink-4:#b3bfcc;\n  --line:#e6ebf1;\n  --line-2:#f0f4f8;\n  --bg:#f4f7fa;\n  --card:#ffffff;\n  --brand:#07c160;\n  --brand-dark:#04a04e;\n  --brand-soft:#e8f9ef;\n  --brand-line:#bdeacf;\n  --blue:#2563eb;\n  --blue-soft:#eaf1ff;\n  --amber:#e8870b;\n  --amber-soft:#fff6e6;\n  --red:#e5484d;\n  --red-soft:#fdeeee;\n  --violet:#7c5cff;\n  --violet-soft:#f1eeff;\n  --r-lg:16px;\n  --r-md:11px;\n  --r-sm:8px;\n  --sh:0 1px 2px rgba(16,28,45,.05), 0 1px 3px rgba(16,28,45,.03);\n  --sh-up:0 8px 28px rgba(16,28,45,.09);\n}\n\n*{margin:0;padding:0;box-sizing:border-box;}\nhtml,body{height:100%;}\nbody{\n  font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;\n  background:var(--bg);color:var(--ink);\n  font-size:14px;line-height:1.6;\n  -webkit-font-smoothing:antialiased;\n}\nbody.lock{overflow:hidden;}\nbutton{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;}\ninput,select{font-family:inherit;font-size:14px;color:var(--ink);}\ninput:focus,select:focus{outline:none;}\n::selection{background:#c8f2da;}\n.num{font-variant-numeric:tabular-nums;}\n\n/* ---------------- 顶栏 ---------------- */\n.top{\n  height:60px;background:rgba(255,255,255,.86);\n  backdrop-filter:blur(12px);\n  border-bottom:1px solid var(--line);\n  display:flex;align-items:center;gap:14px;\n  padding:0 22px;position:sticky;top:0;z-index:60;\n}\n.brand{display:flex;align-items:center;gap:10px;flex-shrink:0;}\n.brand-mark{\n  width:34px;height:34px;border-radius:10px;\n  background:linear-gradient(140deg,#12d675,#04a04e);\n  display:grid;place-items:center;color:#fff;\n  box-shadow:0 2px 8px rgba(7,193,96,.32);\n}\n.brand-name{font-size:15.5px;font-weight:700;letter-spacing:-.2px;line-height:1.15;}\n.brand-name small{display:block;font-size:11px;font-weight:500;color:var(--ink-3);letter-spacing:.2px;}\n.ver{\n  font-size:10.5px;font-weight:600;color:var(--brand-dark);\n  background:var(--brand-soft);border:1px solid var(--brand-line);\n  padding:1px 7px;border-radius:20px;margin-left:2px;\n}\n\n/* 模式切换 */\n.seg{\n  margin-left:8px;display:flex;gap:2px;background:var(--line-2);\n  padding:3px;border-radius:11px;flex-shrink:0;\n}\n.seg button{\n  padding:6px 15px;border-radius:9px;font-size:13px;font-weight:600;\n  color:var(--ink-3);transition:.18s;white-space:nowrap;\n}\n.seg button.on{background:#fff;color:var(--ink);box-shadow:var(--sh);}\n.seg button.on[data-mode=\"off\"]{color:var(--red);}\n\n.top-right{margin-left:auto;display:flex;align-items:center;gap:8px;flex-shrink:0;}\n.tbtn{\n  display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:9px;\n  font-size:13px;font-weight:500;color:var(--ink-2);transition:.16s;\n}\n.tbtn:hover{background:var(--line-2);color:var(--ink);}\n.tbtn svg{opacity:.7;}\n.top-sep{width:1px;height:20px;background:var(--line);margin:0 3px;}\n\n/* ---------------- 布局 ---------------- */\n.wrap{\n  max-width:1340px;margin:0 auto;padding:20px 22px 72px;\n  display:grid;grid-template-columns:418px minmax(0,1fr);gap:18px;\n  align-items:start;\n}\n@media (max-width:1060px){\n  .wrap{grid-template-columns:1fr;}\n  .pgname{display:none;}\n}\n\n.card{\n  background:var(--card);border:1px solid var(--line);\n  border-radius:var(--r-lg);box-shadow:var(--sh);\n}\n.card-head{\n  display:flex;align-items:center;gap:8px;\n  padding:16px 18px 12px;\n}\n.card-head h2{font-size:14.5px;font-weight:700;letter-spacing:-.1px;}\n.card-head .hint{margin-left:auto;font-size:11.5px;color:var(--ink-3);}\n\n/* ---------------- 左栏表单 ---------------- */\n.form{padding:0 18px 18px;}\n.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:11px;}\n.fgrid .full{grid-column:1/-1;}\n.field label{\n  display:block;font-size:11.5px;font-weight:600;color:var(--ink-3);\n  margin-bottom:5px;letter-spacing:.2px;\n}\n.field label em{color:var(--red);font-style:normal;margin-left:2px;}\n.field input,.field select{\n  width:100%;height:38px;padding:0 11px;border:1px solid var(--line);\n  border-radius:var(--r-md);background:#fff;transition:.16s;\n}\n.field select{appearance:none;cursor:pointer;\n  background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b98a9' stroke-width='2.4'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\");\n  background-repeat:no-repeat;background-position:right 11px center;padding-right:30px;}\n.field input:hover,.field select:hover{border-color:#d3dce6;}\n.field input:focus,.field select:focus{border-color:var(--brand);box-shadow:0 0 0 3px rgba(7,193,96,.12);}\n.field input::placeholder{color:var(--ink-4);}\n\n/* 开关行 */\n.toggles{display:flex;flex-direction:column;gap:1px;margin-top:14px;\n  background:var(--line-2);border-radius:12px;overflow:hidden;border:1px solid var(--line);}\n.tg{\n  display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;\n  cursor:pointer;transition:.14s;\n}\n.tg:hover{background:#fafcfe;}\n.tg-txt{flex:1;min-width:0;}\n.tg-txt b{display:block;font-size:12.5px;font-weight:600;}\n.tg-txt span{font-size:11px;color:var(--ink-3);}\n.sw{\n  width:34px;height:20px;border-radius:20px;background:#dbe3ec;position:relative;\n  transition:.2s;flex-shrink:0;\n}\n.sw::after{\n  content:\"\";position:absolute;top:2px;left:2px;width:16px;height:16px;\n  border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.18);transition:.2s;\n}\n.tg.on .sw{background:var(--brand);}\n.tg.on .sw::after{transform:translateX(14px);}\n.tg.on[data-t=\"fin\"] .sw{background:var(--amber);}\n.tg.on[data-t=\"out\"] .sw{background:var(--violet);}\n\n.actions{display:flex;gap:9px;margin-top:16px;}\n.btn{\n  height:40px;border-radius:var(--r-md);font-size:13.5px;font-weight:600;\n  display:inline-flex;align-items:center;justify-content:center;gap:7px;\n  transition:.16s;padding:0 16px;\n}\n.btn-main{flex:1;background:var(--brand);color:#fff;\n  box-shadow:0 2px 10px rgba(7,193,96,.26);}\n.btn-main:hover{background:var(--brand-dark);transform:translateY(-1px);\n  box-shadow:0 4px 14px rgba(7,193,96,.3);}\n.btn-main:active{transform:translateY(0);}\n.btn-ghost{background:#fff;border:1px solid var(--line);color:var(--ink-2);}\n.btn-ghost:hover{border-color:var(--ink-4);color:var(--ink);}\n\n/* 快捷示例 */\n.quick{margin-top:14px;padding-top:14px;border-top:1px dashed var(--line);}\n.quick p{font-size:11px;color:var(--ink-3);margin-bottom:7px;}\n.chips{display:flex;flex-wrap:wrap;gap:6px;}\n.chip{\n  font-size:11.5px;padding:5px 10px;border-radius:20px;color:var(--ink-2);\n  background:var(--line-2);border:1px solid transparent;transition:.15s;\n}\n.chip:hover{background:var(--brand-soft);color:var(--brand-dark);border-color:var(--brand-line);}\n\n/* 离职模式名册 */\n.roster{padding:0 18px 18px;}\n.roster-search{position:relative;margin-bottom:10px;}\n.roster-search input{width:100%;height:38px;border:1px solid var(--line);\n  border-radius:var(--r-md);padding:0 11px 0 32px;}\n.roster-search svg{position:absolute;left:11px;top:11px;color:var(--ink-4);}\n.rlist{display:flex;flex-direction:column;gap:6px;max-height:302px;overflow:auto;}\n.ritem{\n  display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:11px;\n  border:1px solid var(--line);cursor:pointer;transition:.14s;background:#fff;\n}\n.ritem:hover{border-color:var(--brand-line);background:#fbfffd;}\n.ritem.sel{border-color:var(--brand);background:var(--brand-soft);}\n.avatar{\n  width:30px;height:30px;border-radius:9px;display:grid;place-items:center;\n  font-size:12px;font-weight:700;color:#fff;flex-shrink:0;letter-spacing:.5px;\n}\n.ritem .ri-n{flex:1;min-width:0;}\n.ritem .ri-n b{display:block;font-size:12.5px;font-weight:600;}\n.ritem .ri-n span{font-size:11px;color:var(--ink-3);}\n.ri-c{font-size:10.5px;color:var(--ink-3);text-align:right;flex-shrink:0;}\n.ri-c b{display:block;color:var(--red);font-size:12px;}\n\n/* ---------------- 右栏结果 ---------------- */\n.pane{min-height:560px;}\n.empty{\n  padding:78px 40px;text-align:center;\n  display:flex;flex-direction:column;align-items:center;\n}\n.empty-art{\n  width:104px;height:104px;border-radius:26px;margin-bottom:18px;\n  background:linear-gradient(150deg,#f0faf4,#e4f6ec);\n  border:1px solid var(--brand-line);display:grid;place-items:center;\n  position:relative;overflow:hidden;\n}\n.empty-art::after{\n  content:\"\";position:absolute;inset:0;\n  background:radial-gradient(circle at 30% 20%,rgba(7,193,96,.18),transparent 62%);\n}\n.empty h3{font-size:16px;font-weight:700;margin-bottom:7px;}\n.empty p{font-size:12.5px;color:var(--ink-3);max-width:390px;line-height:1.75;}\n.empty .steps{\n  display:flex;gap:0;margin-top:26px;align-items:center;flex-wrap:wrap;justify-content:center;\n}\n.estep{display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--ink-3);}\n.estep i{\n  width:19px;height:19px;border-radius:50%;background:var(--brand-soft);\n  color:var(--brand-dark);font-style:normal;font-size:10.5px;font-weight:700;\n  display:grid;place-items:center;flex-shrink:0;\n}\n.estep .arw{width:22px;height:1px;background:var(--line);margin:0 9px;}\n\n/* 空状态能力卡 */\n.feats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:34px;width:100%;max-width:560px;}\n.feat{background:#fbfdfe;border:1px solid var(--line);border-radius:12px;padding:12px 13px;text-align:left;}\n.feat b{display:block;font-size:12px;font-weight:700;margin-bottom:3px;}\n.feat span{font-size:11px;color:var(--ink-3);line-height:1.55;display:block;}\n.feat i{font-style:normal;font-size:15px;display:block;margin-bottom:7px;}\n@media (max-width:520px){.feats{grid-template-columns:1fr;}}\n\n/* 结果头部 */\n.res-head{padding:16px 18px 0;}\n.res-top{display:flex;align-items:flex-start;gap:14px;}\n.res-id{flex:1;min-width:0;}\n.res-name{font-size:19px;font-weight:750;letter-spacing:-.3px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}\n.res-meta{font-size:12px;color:var(--ink-3);margin-top:4px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;}\n.res-meta .dot{width:3px;height:3px;border-radius:50%;background:var(--ink-4);}\n.res-meta .emp{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;\n  background:var(--line-2);padding:1px 6px;border-radius:5px;}\n\n.ring{width:74px;height:74px;flex-shrink:0;position:relative;display:grid;place-items:center;}\n.ring-c{position:absolute;inset:0;border-radius:50%;\n  background:conic-gradient(var(--brand) calc(var(--p) * 1%), #eef2f6 0);\n  transition:background .4s;}\n.ring-c::after{content:\"\";position:absolute;inset:6px;border-radius:50%;background:#fff;}\n.ring b{position:relative;font-size:15px;font-weight:750;line-height:1;}\n.ring b small{font-size:9.5px;color:var(--ink-3);display:block;text-align:center;margin-top:2px;font-weight:600;}\n\n.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);\n  border:1px solid var(--line);border-radius:12px;overflow:hidden;margin:14px 18px 0;}\n.stat{background:#fff;padding:9px 11px;}\n.stat b{display:block;font-size:16px;font-weight:750;letter-spacing:-.3px;}\n.stat span{font-size:10.5px;color:var(--ink-3);}\n.stat.warn b{color:var(--amber);}\n.stat.danger b{color:var(--red);}\n\n/* 风险条 */\n.alerts{margin:12px 18px 0;display:flex;flex-direction:column;gap:7px;}\n.alert{\n  display:flex;gap:9px;padding:10px 12px;border-radius:11px;font-size:12px;\n  line-height:1.6;align-items:flex-start;\n}\n.alert svg{flex-shrink:0;margin-top:1px;}\n.alert b{font-weight:700;}\n.alert-hi{background:var(--red-soft);color:#a52a2e;border:1px solid #f7d4d5;}\n.alert-md{background:var(--amber-soft);color:#8a5306;border:1px solid #f8e3bf;}\n.alert-ok{background:var(--brand-soft);color:#05743a;border:1px solid var(--brand-line);}\n.alert-info{background:var(--blue-soft);color:#1d4ed8;border:1px solid #d3e1ff;}\n\n/* 分组任务 */\n.groups{padding:6px 18px 0;}\n.grp{margin-top:14px;}\n.grp-h{display:flex;align-items:center;gap:8px;margin-bottom:8px;}\n.grp-h i{\n  width:5px;height:14px;border-radius:3px;background:var(--brand);flex-shrink:0;\n}\n.grp-h b{font-size:12.5px;font-weight:700;letter-spacing:.1px;}\n.grp-h em{font-style:normal;font-size:11px;color:var(--ink-3);}\n.grp-h .cnt{margin-left:auto;font-size:11px;color:var(--ink-3);}\n\n.tasks{display:flex;flex-direction:column;gap:1px;background:var(--line-2);\n  border:1px solid var(--line);border-radius:12px;overflow:hidden;}\n.task{\n  display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;\n  transition:.14s;position:relative;\n}\n.task:hover{background:#fafcfe;}\n.task.done{background:#fbfdfc;}\n.task.done .t-sys,.task.done .t-role{opacity:.5;text-decoration:line-through;}\n.tick{\n  width:17px;height:17px;border-radius:5px;border:1.6px solid #cfd9e3;flex-shrink:0;\n  display:grid;place-items:center;transition:.16s;background:#fff;\n}\n.task.done .tick{background:var(--brand);border-color:var(--brand);}\n.tick svg{opacity:0;transform:scale(.6);transition:.16s;color:#fff;}\n.task.done .tick svg{opacity:1;transform:scale(1);}\n.t-main{flex:1;min-width:0;}\n.t-sys{font-size:12.8px;font-weight:650;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}\n.t-role{font-size:11px;color:var(--ink-3);margin-top:1px;}\n.t-side{display:flex;align-items:center;gap:6px;flex-shrink:0;}\n\n.bdg{\n  font-size:10px;font-weight:650;padding:1.5px 6px;border-radius:5px;\n  letter-spacing:.2px;white-space:nowrap;\n}\n.bdg-risk{background:var(--red-soft);color:var(--red);}\n.bdg-warn{background:var(--amber-soft);color:var(--amber);}\n.bdg-auto{background:var(--line-2);color:var(--ink-3);}\n.bdg-appr{background:var(--blue-soft);color:var(--blue);}\n.bdg-tmp{background:var(--violet-soft);color:var(--violet);}\n.bdg-ok{background:var(--brand-soft);color:var(--brand-dark);}\n.t-min{font-size:10.5px;color:var(--ink-4);font-variant-numeric:tabular-nums;\n  min-width:34px;text-align:right;}\n.t-appr{font-size:10.5px;color:var(--ink-3);}\n\n/* 底部操作 */\n.res-foot{\n  margin-top:16px;padding:12px 18px;border-top:1px solid var(--line);\n  display:flex;gap:8px;align-items:center;flex-wrap:wrap;\n  background:#fcfdfe;border-radius:0 0 var(--r-lg) var(--r-lg);\n}\n.mini{\n  display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;\n  border-radius:9px;border:1px solid var(--line);background:#fff;\n  font-size:12.5px;font-weight:600;color:var(--ink-2);transition:.15s;\n}\n.mini:hover{border-color:var(--brand);color:var(--brand-dark);background:var(--brand-soft);}\n.mini.primary{background:var(--ink);border-color:var(--ink);color:#fff;}\n.mini.primary:hover{background:#1b2b3d;border-color:#1b2b3d;color:#fff;}\n.res-foot .grow{flex:1;}\n.res-foot .fine{font-size:10.5px;color:var(--ink-4);}\n\n/* ---------------- 抽屉 ---------------- */\n.mask{\n  position:fixed;inset:0;background:rgba(13,27,42,.32);backdrop-filter:blur(2px);\n  opacity:0;pointer-events:none;transition:.24s;z-index:80;\n}\n.mask.on{opacity:1;pointer-events:auto;}\n.drawer{\n  position:fixed;top:0;right:0;bottom:0;width:min(560px,92vw);background:#fff;\n  z-index:90;transform:translateX(102%);transition:transform .3s cubic-bezier(.32,.72,0,1);\n  display:flex;flex-direction:column;box-shadow:-12px 0 40px rgba(13,27,42,.12);\n}\n.drawer.on{transform:none;}\n.dw-head{\n  padding:18px 20px;border-bottom:1px solid var(--line);\n  display:flex;align-items:center;gap:10px;\n}\n.dw-head h3{font-size:15.5px;font-weight:750;}\n.dw-head p{font-size:11.5px;color:var(--ink-3);}\n.dw-body{padding:18px 20px 40px;overflow:auto;flex:1;}\n.x-btn{margin-left:auto;width:30px;height:30px;border-radius:8px;display:grid;\n  place-items:center;color:var(--ink-3);}\n.x-btn:hover{background:var(--line-2);color:var(--ink);}\n\n/* 看板 */\n.kpi{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}\n.kpi .k{background:var(--line-2);border-radius:12px;padding:12px 14px;}\n.kpi .k b{display:block;font-size:22px;font-weight:750;letter-spacing:-.6px;line-height:1.2;}\n.kpi .k span{font-size:11px;color:var(--ink-3);}\n.kpi .k.hl b{color:var(--brand-dark);}\n.bars{display:flex;flex-direction:column;gap:9px;}\n.bar-row{display:flex;align-items:center;gap:9px;font-size:11.5px;}\n.bar-row .bl{width:105px;color:var(--ink-2);flex-shrink:0;overflow:hidden;\n  text-overflow:ellipsis;white-space:nowrap;}\n.bar-track{flex:1;height:7px;background:var(--line-2);border-radius:4px;overflow:hidden;}\n.bar-fill{height:100%;border-radius:4px;background:var(--brand);transition:width .5s;}\n.bar-row .bv{width:42px;text-align:right;color:var(--ink-3);font-variant-numeric:tabular-nums;}\n.log-item{\n  display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--line-2);font-size:12px;\n}\n.log-item .lt{color:var(--ink-4);font-size:10.5px;width:72px;flex-shrink:0;\n  font-variant-numeric:tabular-nums;}\n.log-item .lc{flex:1;color:var(--ink-2);}\n.log-item .lc b{color:var(--ink);font-weight:650;}\n\n/* 知识库 */\n.kb{display:flex;flex-direction:column;gap:9px;}\n.kb-item{border:1px solid var(--line);border-radius:12px;padding:12px 14px;\n  transition:.15s;cursor:pointer;}\n.kb-item:hover{border-color:var(--brand-line);background:#fbfffd;}\n.kb-item .kb-t{font-size:12.8px;font-weight:650;display:flex;align-items:center;gap:7px;}\n.kb-item .kb-d{font-size:11.5px;color:var(--ink-3);margin-top:5px;line-height:1.7;}\n.kb-item .kb-tag{font-size:9.5px;padding:1px 6px;border-radius:4px;\n  background:var(--line-2);color:var(--ink-3);font-weight:600;}\n\n/* 关于 */\n.about p{font-size:12.5px;color:var(--ink-2);line-height:1.85;margin-bottom:11px;}\n.about h4{font-size:12.5px;font-weight:700;margin:16px 0 7px;color:var(--ink);}\n.about ul{list-style:none;display:flex;flex-direction:column;gap:7px;}\n.about li{font-size:12px;color:var(--ink-2);display:flex;gap:8px;line-height:1.7;}\n.about li i{color:var(--brand);font-style:normal;font-weight:700;flex-shrink:0;}\n\n/* Toast */\n.toast{\n  position:fixed;left:50%;bottom:34px;transform:translate(-50%,20px);\n  background:var(--ink);color:#fff;padding:10px 20px;border-radius:11px;\n  font-size:12.8px;font-weight:500;opacity:0;pointer-events:none;transition:.26s;\n  z-index:200;display:flex;align-items:center;gap:8px;box-shadow:var(--sh-up);\n}\n.toast.on{opacity:1;transform:translate(-50%,0);}\n\n/* 打印工单 */\n#printArea{display:none;}\n@media print{\n  body{background:#fff;}\n  .top,.wrap,.drawer,.mask,.toast{display:none !important;}\n  #printArea{display:block;padding:0;}\n  #printArea h1{font-size:19px;margin-bottom:4px;}\n  #printArea .pm{font-size:12px;color:#666;margin-bottom:14px;}\n  #printArea table{width:100%;border-collapse:collapse;font-size:12px;}\n  #printArea th,#printArea td{border:1px solid #ddd;padding:6px 8px;text-align:left;}\n  #printArea th{background:#f5f5f5;}\n}\n\n";document.head.appendChild(style);
style.textContent += '@media (max-width:767px){.top{height:auto;flex-wrap:wrap;gap:8px;padding:10px 12px}.brand{flex:1 1 100%}.seg{margin-left:0}.top-right{margin-left:0;flex:1 1 100%;gap:2px}.tbtn{padding:7px 8px}.wrap{padding:14px 12px 48px}.drawer{width:min(560px,92vw)}}';
document.body.innerHTML="\n\n<!-- ============ 顶栏 ============ -->\n<header class=\"top\">\n  <div class=\"brand\">\n    <div class=\"brand-mark\">\n      <svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n        <path d=\"M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5z\"/>\n      </svg>\n    </div>\n    <div class=\"brand-name\">OneLaunch <span class=\"ver\">v1.0</span>\n      <small>开号一条龙 · 账号开通与权限回收</small>\n    </div>\n  </div>\n\n  <div class=\"seg\" id=\"modeSeg\">\n    <button class=\"on\" data-mode=\"on\">入职开通</button>\n    <button data-mode=\"off\">离职回收</button>\n  </div>\n\n  <div class=\"top-right\">\n    <button class=\"tbtn\" id=\"btnBoard\">\n      <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"5\" rx=\"1.5\"/><rect x=\"14\" y=\"12\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"3\" y=\"16\" width=\"7\" height=\"5\" rx=\"1.5\"/></svg>\n      数据看板\n    </button>\n    <button class=\"tbtn\" id=\"btnKb\">\n      <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 19.5A2.5 2.5 0 0 1 6.5 17H20\"/><path d=\"M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z\"/></svg>\n      SOP 库\n    </button>\n    <div class=\"top-sep\"></div>\n    <button class=\"tbtn\" id=\"btnAbout\">\n      <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 16v-4M12 8h.01\"/></svg>\n      关于作品\n    </button>\n  </div>\n</header>\n\n<!-- ============ 主区 ============ -->\n<main class=\"wrap\">\n\n  <!-- 左：输入 -->\n  <section class=\"card\" id=\"leftCard\">\n\n    <!-- 入职模式 -->\n    <div id=\"paneOn\">\n      <div class=\"card-head\">\n        <h2>① 录入员工信息</h2>\n        <span class=\"hint\">岗位决定权限模板</span>\n      </div>\n      <div class=\"form\">\n        <div class=\"fgrid\">\n          <div class=\"field\">\n            <label>姓名 <em>*</em></label>\n            <input id=\"fName\" type=\"text\" placeholder=\"例：示例甲\" autocomplete=\"off\">\n          </div>\n          <div class=\"field\">\n            <label>部门 <em>*</em></label>\n            <select id=\"fDept\"></select>\n          </div>\n          <div class=\"field full\">\n            <label>岗位 <em>*</em></label>\n            <select id=\"fPost\"></select>\n          </div>\n          <div class=\"field\">\n            <label>入职日期</label>\n            <input id=\"fDate\" type=\"date\">\n          </div>\n          <div class=\"field\">\n            <label>直属上级</label>\n            <input id=\"fLeader\" type=\"text\" placeholder=\"例：张主管\" autocomplete=\"off\">\n          </div>\n          <div class=\"field full\">\n            <label>办公地 / 用工主体</label>\n            <select id=\"fSite\">\n              <option value=\"总部（上海）\">总部（上海）</option>\n              <option value=\"分公司（杭州）\">分公司（杭州）</option>\n              <option value=\"云仓现场（嘉定）\">云仓现场（嘉定）</option>\n              <option value=\"远程办公\">远程办公</option>\n            </select>\n          </div>\n        </div>\n\n        <div class=\"toggles\">\n          <div class=\"tg\" data-t=\"fin\" data-key=\"fin\">\n            <div class=\"tg-txt\"><b>涉及资金权限</b><span>开通财务类角色，需财务负责人复核</span></div>\n            <div class=\"sw\"></div>\n          </div>\n          <div class=\"tg\" data-t=\"out\" data-key=\"out\">\n            <div class=\"tg-txt\"><b>外包 / 实习人员</b><span>仅授临时权限，自动加有效期与审计</span></div>\n            <div class=\"sw\"></div>\n          </div>\n          <div class=\"tg\" data-t=\"sign\" data-key=\"sign\">\n            <div class=\"tg-txt\"><b>需要电子签章</b><span>同步开通契约锁 e签章账号</span></div>\n            <div class=\"sw\"></div>\n          </div>\n        </div>\n\n        <div class=\"actions\">\n          <button class=\"btn btn-main\" id=\"btnGen\">\n            <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"><path d=\"M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5z\"/></svg>\n            生成开通方案\n          </button>\n          <button class=\"btn btn-ghost\" id=\"btnReset\" title=\"重置表单\">重置</button>\n        </div>\n\n        <div class=\"quick\">\n          <p>没有数据？试试这几个示例 ↓</p>\n          <div class=\"chips\" id=\"quickChips\"></div>\n        </div>\n      </div>\n    </div>\n\n    <!-- 离职模式 -->\n    <div id=\"paneOff\" style=\"display:none;\">\n      <div class=\"card-head\">\n        <h2>① 选择离职员工</h2>\n        <span class=\"hint\">按在册名册反查权限</span>\n      </div>\n      <div class=\"roster\">\n        <div class=\"roster-search\">\n          <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M21 21l-4.3-4.3\"/></svg>\n          <input id=\"searchEmp\" type=\"text\" placeholder=\"搜索姓名 / 工号 / 部门\" autocomplete=\"off\">\n        </div>\n        <div class=\"rlist\" id=\"rlist\"></div>\n        <div class=\"actions\">\n          <button class=\"btn btn-main\" id=\"btnOffGen\" style=\"background:#e5484d;box-shadow:0 2px 10px rgba(229,72,77,.26);\">\n            <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"><path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"/><path d=\"M16 17l5-5-5-5M21 12H9\"/></svg>\n            生成回收清单\n          </button>\n        </div>\n        <div class=\"quick\">\n          <p>回收顺序由系统依赖自动排定，高危项优先。</p>\n        </div>\n      </div>\n    </div>\n  </section>\n\n  <!-- 右：输出 -->\n  <section class=\"card pane\" id=\"pane\">\n    <div class=\"empty\" id=\"emptyState\">\n      <div class=\"empty-art\">\n        <svg width=\"46\" height=\"46\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#07c160\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"position:relative;z-index:1;\">\n          <rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"3\"/><path d=\"M3 9h18\"/><circle cx=\"7\" cy=\"6.5\" r=\".6\" fill=\"#07c160\"/><circle cx=\"9.5\" cy=\"6.5\" r=\".6\" fill=\"#07c160\"/>\n          <path d=\"M8 14l2.5 2.5L16 11\"/>\n        </svg>\n      </div>\n      <h3>左边填人，右边出方案</h3>\n      <p>选定部门与岗位后，系统按预设的权限矩阵，自动推导出这名员工该在哪些系统开什么角色、由谁审批、按什么顺序开通，并做职责冲突体检。</p>\n      <div class=\"steps\">\n        <div class=\"estep\"><i>1</i>录入信息</div><div class=\"arw\"></div>\n        <div class=\"estep\"><i>2</i>匹配矩阵</div><div class=\"arw\"></div>\n        <div class=\"estep\"><i>3</i>生成清单</div><div class=\"arw\"></div>\n        <div class=\"estep\"><i>4</i>导出派单</div>\n      </div>\n\n      <div class=\"feats\">\n        <div class=\"feat\"><i>🎯</i><b>岗位即模板</b><span>选岗位自动推导该开哪些系统、什么角色</span></div>\n        <div class=\"feat\"><i>🛡️</i><b>职责冲突体检</b><span>制单与审批同人？立刻标红拦下来</span></div>\n        <div class=\"feat\"><i>🔍</i><b>离职反查</b><span>从名册反查权限，五段式回收不漏项</span></div>\n      </div>\n    </div>\n    <div id=\"result\"></div>\n  </section>\n</main>\n\n<!-- ============ 抽屉 ============ -->\n<div class=\"mask\" id=\"mask\"></div>\n<aside class=\"drawer\" id=\"drawer\">\n  <div class=\"dw-head\">\n    <div>\n      <h3 id=\"dwTitle\">数据看板</h3>\n      <p id=\"dwSub\"></p>\n    </div>\n    <button class=\"x-btn\" id=\"dwClose\">\n      <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"><path d=\"M18 6L6 18M6 6l12 12\"/></svg>\n    </button>\n  </div>\n  <div class=\"dw-body\" id=\"dwBody\"></div>\n</aside>\n\n<!-- 打印区 -->\n<div id=\"printArea\"></div>\n\n<!-- Toast -->\n<div class=\"toast\" id=\"toast\"></div>\n\n<!-- 分享卡画布（隐藏） -->\n<canvas id=\"shareCanvas\" width=\"1080\" height=\"1350\" style=\"display:none;\"></canvas>\n\n";

/* ============================================================
   OneLaunch · app.js
   岗位 → 权限矩阵 → 开通/回收清单编排引擎
   ============================================================ */

/* ---------------- 1. 基础数据 ---------------- */

// 系统清单（统一的系统命名，避免各处拼写不一致）
const SYS = {
  WECOM: '企业微信',
  MAIL: '企业邮箱',
  OA: '泛微 OA',
  BIP: 'BIP（用友）',
  JKY: '吉客云',
  IHR: 'i人事',
  XFT: '薪福通',
  WMS: '云仓 WMS（3 仓）',
  QIMEN: '奇门发货接口',
  QYS: '契约锁 e签章',
  TMALL: '天猫商家后台',
  DOUYIN: '抖音商家后台',
  VPN: 'VPN 接入',
  BASTION: '堡垒机',
  UIS: 'UIS 超融合平台',
  MINSHENG: '民生 e家'
};

// 部门 → 岗位
const DEPTS = [
  { name: '总经办', code: 'GM', posts: ['总经理助理', '运营总监'] },
  { name: '财务部', code: 'FI', posts: ['会计', '出纳', '财务主管'] },
  { name: '电商运营部', code: 'EC', posts: ['电商运营', '店铺运营', '美工设计'] },
  { name: '仓储物流部', code: 'WH', posts: ['仓储主管', '仓管员', '物流对接专员'] },
  { name: '销售部', code: 'SA', posts: ['销售代表', '销售内勤'] },
  { name: '人事行政部', code: 'HR', posts: ['人事专员', '行政专员'] },
  { name: '信息技术部', code: 'IT', posts: ['IT 运维工程师', '系统管理员'] },
  { name: '客服部', code: 'CS', posts: ['客服专员', '售后专员'] }
];

// 通用基础账号（所有岗位都有）
const BASE_ITEMS = [
  { sys: SYS.WECOM, role: '企业微信账号 + 部门入群', cat: 'base', appr: 'IT 管理员', mins: 3, risk: 0 },
  { sys: SYS.MAIL, role: '企业邮箱（姓名全拼@公司域名）', cat: 'base', appr: 'IT 管理员', mins: 6, risk: 0 },
  { sys: SYS.OA, role: 'OA 账号 + 员工基础角色', cat: 'base', appr: 'HRBP', mins: 5, risk: 0 }
];

// 岗位专属权限模板
// risk: 0 普通 / 1 敏感 / 2 高危（资金、导出、管理员）
const TPL = {
  '总经理助理': [
    { sys: SYS.OA, role: '全流程发起与督办权限', cat: 'biz', appr: '总经办主任', mins: 8, risk: 1 },
    { sys: SYS.JKY, role: '经营数据看板（只读）', cat: 'biz', appr: '运营总监', mins: 10, risk: 1 },
    { sys: SYS.BIP, role: '管理报表查询', cat: 'biz', appr: '财务总监', mins: 10, risk: 1 },
    { sys: SYS.QYS, role: '合同发起与用印申请', cat: 'biz', appr: '法务', mins: 12, risk: 1 }
  ],
  '运营总监': [
    { sys: SYS.JKY, role: '全模块管理（订单/商品/库存/财务）', cat: 'biz', appr: '总经理', mins: 20, risk: 2 },
    { sys: SYS.BIP, role: '经营报表 + 成本查询', cat: 'biz', appr: '财务总监', mins: 12, risk: 1 },
    { sys: SYS.WMS, role: '三仓库存查询与调拨审批', cat: 'biz', appr: '供应链负责人', mins: 15, risk: 2 },
    { sys: SYS.TMALL, role: '店铺数据查看', cat: 'biz', appr: '电商负责人', mins: 8, risk: 0 },
    { sys: SYS.DOUYIN, role: '店铺数据查看', cat: 'biz', appr: '电商负责人', mins: 8, risk: 0 }
  ],
  '会计': [
    { sys: SYS.BIP, role: '总账 / 应收应付凭证处理', cat: 'biz', appr: '财务经理', mins: 15, risk: 1 },
    { sys: SYS.JKY, role: '财务对账（订单金额核对）', cat: 'biz', appr: '财务总监', mins: 15, risk: 1 },
    { sys: SYS.QYS, role: '发票与合同签署参与人', cat: 'biz', appr: '法务', mins: 10, risk: 0 }
  ],
  '出纳': [
    { sys: SYS.BIP, role: '付款制单', cat: 'biz', appr: '财务经理', mins: 15, risk: 2 },
    { sys: SYS.JKY, role: '收款确认与流水勾对', cat: 'biz', appr: '财务总监', mins: 15, risk: 2 },
    { sys: SYS.BIP, role: '银行账户余额查询', cat: 'biz', appr: '财务总监', mins: 10, risk: 1 },
    { sys: SYS.OA, role: '银行 U 盾借用登记', cat: 'sec', appr: '财务经理', mins: 6, risk: 2 }
  ],
  '财务主管': [
    { sys: SYS.BIP, role: '付款审批（一级）', cat: 'biz', appr: '财务总监', mins: 18, risk: 2 },
    { sys: SYS.BIP, role: '凭证审核与反记账', cat: 'biz', appr: '财务总监', mins: 12, risk: 1 },
    { sys: SYS.JKY, role: '财务主管（全店铺主体）', cat: 'biz', appr: '财务总监', mins: 15, risk: 2 },
    { sys: SYS.XFT, role: '薪酬复核', cat: 'biz', appr: '人事负责人', mins: 12, risk: 2 },
    { sys: SYS.QYS, role: '用印审批人', cat: 'biz', appr: '法务', mins: 12, risk: 1 }
  ],
  '电商运营': [
    { sys: SYS.JKY, role: '订单管理 + 商品管理', cat: 'biz', appr: '电商负责人', mins: 15, risk: 1 },
    { sys: SYS.JKY, role: '价格策略与促销配置', cat: 'biz', appr: '电商负责人', mins: 12, risk: 1 },
    { sys: SYS.TMALL, role: '店铺运营（含子账号）', cat: 'biz', appr: '电商负责人', mins: 12, risk: 0 },
    { sys: SYS.DOUYIN, role: '抖店运营（含子账号）', cat: 'biz', appr: '电商负责人', mins: 12, risk: 0 },
    { sys: SYS.WMS, role: '发货单查询与拦截', cat: 'biz', appr: '仓储主管', mins: 10, risk: 0 }
  ],
  '店铺运营': [
    { sys: SYS.JKY, role: '订单管理（限所属店铺）', cat: 'biz', appr: '电商负责人', mins: 12, risk: 1 },
    { sys: SYS.TMALL, role: '店铺运营子账号', cat: 'biz', appr: '电商负责人', mins: 10, risk: 0 },
    { sys: SYS.DOUYIN, role: '抖店运营子账号', cat: 'biz', appr: '电商负责人', mins: 10, risk: 0 },
    { sys: SYS.WMS, role: '发货单查询', cat: 'biz', appr: '仓储主管', mins: 8, risk: 0 }
  ],
  '美工设计': [
    { sys: SYS.JKY, role: '商品资料编辑（不含价格）', cat: 'biz', appr: '电商负责人', mins: 10, risk: 0 },
    { sys: SYS.TMALL, role: '店铺装修子账号', cat: 'biz', appr: '电商负责人', mins: 8, risk: 0 }
  ],
  '仓储主管': [
    { sys: SYS.WMS, role: '三仓全权限（出入库/库存调整）', cat: 'biz', appr: '供应链负责人', mins: 20, risk: 2 },
    { sys: SYS.JKY, role: '发货单与退货单管理', cat: 'biz', appr: '运营总监', mins: 15, risk: 1 },
    { sys: SYS.QIMEN, role: '奇门接口后台（重推/查日志）', cat: 'biz', appr: 'IT 负责人', mins: 12, risk: 2 }
  ],
  '仓管员': [
    { sys: SYS.WMS, role: '出入库作业（拣货/复核/打包）', cat: 'biz', appr: '仓储主管', mins: 12, risk: 0 },
    { sys: SYS.JKY, role: '发货单查看', cat: 'biz', appr: '仓储主管', mins: 8, risk: 0 },
    { sys: SYS.WECOM, role: '现场考勤组（外勤打卡）', cat: 'sec', appr: '行政', mins: 3, risk: 0 }
  ],
  '物流对接专员': [
    { sys: SYS.QIMEN, role: '接口监控与异常单重推', cat: 'biz', appr: 'IT 负责人', mins: 12, risk: 1 },
    { sys: SYS.WMS, role: '运单与轨迹查询', cat: 'biz', appr: '仓储主管', mins: 10, risk: 0 },
    { sys: SYS.JKY, role: '物流单号回传查看', cat: 'biz', appr: '仓储主管', mins: 8, risk: 0 }
  ],
  '销售代表': [
    { sys: SYS.JKY, role: '销售订单创建', cat: 'biz', appr: '销售总监', mins: 12, risk: 1 },
    { sys: SYS.BIP, role: '客户档案查询', cat: 'biz', appr: '财务经理', mins: 10, risk: 1 },
    { sys: SYS.OA, role: '客户档案 / 合同发起', cat: 'biz', appr: '销售总监', mins: 8, risk: 0 },
    { sys: SYS.QYS, role: '合同签署（业务方）', cat: 'biz', appr: '法务', mins: 10, risk: 0 }
  ],
  '销售内勤': [
    { sys: SYS.JKY, role: '订单录入与改单', cat: 'biz', appr: '销售总监', mins: 12, risk: 1 },
    { sys: SYS.BIP, role: '开票申请', cat: 'biz', appr: '财务经理', mins: 10, risk: 1 },
    { sys: SYS.OA, role: '销售流程发起', cat: 'biz', appr: '销售总监', mins: 8, risk: 0 }
  ],
  '人事专员': [
    { sys: SYS.IHR, role: '员工档案与花名册（含导出）', cat: 'biz', appr: '人事负责人', mins: 15, risk: 2 },
    { sys: SYS.XFT, role: '薪酬核算', cat: 'biz', appr: '人事负责人', mins: 15, risk: 2 },
    { sys: SYS.OA, role: '入离职 / 转正流程', cat: 'biz', appr: '人事负责人', mins: 10, risk: 0 },
    { sys: SYS.WECOM, role: '通讯录管理员', cat: 'sec', appr: 'IT 管理员', mins: 8, risk: 2 },
    { sys: SYS.MINSHENG, role: '员工福利平台管理', cat: 'biz', appr: '人事负责人', mins: 8, risk: 0 }
  ],
  '行政专员': [
    { sys: SYS.OA, role: '行政类流程（采购/车辆/会议室）', cat: 'biz', appr: '行政负责人', mins: 8, risk: 0 },
    { sys: SYS.OA, role: '固定资产台账维护', cat: 'biz', appr: '行政负责人', mins: 8, risk: 1 },
    { sys: SYS.MINSHENG, role: '福利发放管理', cat: 'biz', appr: '人事负责人', mins: 6, risk: 0 }
  ],
  'IT 运维工程师': [
    { sys: SYS.OA, role: '系统管理员（后台配置）', cat: 'sec', appr: 'IT 负责人', mins: 20, risk: 2 },
    { sys: SYS.UIS, role: '超融合平台管理', cat: 'sec', appr: 'IT 负责人', mins: 20, risk: 2 },
    { sys: SYS.BASTION, role: '堡垒机（运维审计）', cat: 'sec', appr: 'IT 负责人', mins: 15, risk: 2 },
    { sys: SYS.VPN, role: '远程接入（绑定设备）', cat: 'sec', appr: 'IT 负责人', mins: 10, risk: 1 },
    { sys: SYS.JKY, role: '吉客云后台配置', cat: 'sec', appr: '运营总监', mins: 15, risk: 2 },
    { sys: SYS.BIP, role: 'BIP 账号与权限管理员', cat: 'sec', appr: '财务总监', mins: 15, risk: 2 }
  ],
  '系统管理员': [
    { sys: SYS.BIP, role: '全模块权限分配', cat: 'sec', appr: '财务总监', mins: 20, risk: 2 },
    { sys: SYS.JKY, role: '全模块权限分配', cat: 'sec', appr: '运营总监', mins: 20, risk: 2 },
    { sys: SYS.IHR, role: '权限与组织架构维护', cat: 'sec', appr: '人事负责人', mins: 15, risk: 2 },
    { sys: SYS.OA, role: '组织架构与流程建模', cat: 'sec', appr: 'IT 负责人', mins: 18, risk: 2 },
    { sys: SYS.BASTION, role: '堡垒机管理', cat: 'sec', appr: 'IT 负责人', mins: 15, risk: 2 }
  ],
  '客服专员': [
    { sys: SYS.JKY, role: '售后工单与换货单', cat: 'biz', appr: '客服主管', mins: 12, risk: 0 },
    { sys: SYS.TMALL, role: '客服子账号（阿里旺旺）', cat: 'biz', appr: '电商负责人', mins: 10, risk: 0 },
    { sys: SYS.DOUYIN, role: '抖店客服子账号', cat: 'biz', appr: '电商负责人', mins: 10, risk: 0 },
    { sys: SYS.WMS, role: '退货单查询', cat: 'biz', appr: '仓储主管', mins: 8, risk: 0 }
  ],
  '售后专员': [
    { sys: SYS.JKY, role: '退货单与退款处理', cat: 'biz', appr: '客服主管', mins: 12, risk: 1 },
    { sys: SYS.WMS, role: '退货入库登记', cat: 'biz', appr: '仓储主管', mins: 10, risk: 1 },
    { sys: SYS.TMALL, role: '售后处理子账号', cat: 'biz', appr: '电商负责人', mins: 8, risk: 0 },
    { sys: SYS.BIP, role: '退款凭证查看', cat: 'biz', appr: '财务经理', mins: 8, risk: 1 }
  ]
};

// 条件附加项
const EXTRA_FIN = [
  { sys: SYS.BIP, role: '付款审批（二级复核）', cat: 'biz', appr: '财务总监 + 总经理', mins: 20, risk: 2, why: '涉及资金' },
  { sys: SYS.JKY, role: '收款确认', cat: 'biz', appr: '财务总监', mins: 12, risk: 2, why: '涉及资金' }
];
const EXTRA_SIGN = [
  { sys: SYS.QYS, role: 'e签章账号 + 个人证书绑定', cat: 'biz', appr: '法务', mins: 15, risk: 1, why: '电子签' }
];
const EXTRA_OUT = [
  { sys: SYS.BASTION, role: '运维审计（全量会话留痕）', cat: 'sec', appr: 'IT 负责人', mins: 10, risk: 0, why: '外包管控' },
  { sys: SYS.OA, role: '临时权限有效期设置（≤ 90 天）', cat: 'sec', appr: 'IT 管理员', mins: 5, risk: 0, why: '外包管控' }
];

// 职责分离（SoD）冲突规则
const SOD = [
  { a: '付款制单', b: '付款审批', lv: 'hi', msg: '同时持有「付款制单」与「付款审批」，可一人走完付款闭环，属重大内控风险' },
  { a: '销售订单', b: '收款确认', lv: 'md', msg: '同时持有「销售订单创建」与「收款确认」，存在虚构订单收款风险' },
  { a: '价格策略', b: '订单管理', lv: 'md', msg: '同时持有「价格策略」与「订单管理」，可自行改价成单，建议拆人' },
  { a: '出入库', b: '库存调整', lv: 'md', msg: '同时持有「出入库作业」与「库存调整」，存在库存挪移风险' },
  { a: '员工档案', b: '薪酬核算', lv: 'md', msg: '同时持有「员工档案」与「薪酬核算」，建议由两人分持' }
];

// 离职回收流程（固定骨架 + 动态系统项）
const OFF_GROUPS = [
  { key: 'freeze', name: '高危权限即时冻结', note: '离职生效即刻执行，先断风险' },
  { key: 'biz', name: '业务系统账号停用', note: '按依赖逆序，避免单据挂死' },
  { key: 'base', name: '基础账号停用', note: '留到最后，离职流程还要走' },
  { key: 'asset', name: '设备与凭证归还', note: '实体资产，最容易漏' },
  { key: 'data', name: '数据与关系交接', note: '客户、文件、外部联系人' }
];

// 在册名册（离职场景的模拟数据）
const ROSTER = [
  { name: '示例员工甲', emp: 'EC-2408', dept: '电商运营部', post: '电商运营', days: 640 },
  { name: '示例员工乙', emp: 'FI-2311', dept: '财务部', post: '出纳', days: 810 },
  { name: '示例员工丙', emp: 'WH-2503', dept: '仓储物流部', post: '仓储主管', days: 420 },
  { name: '示例员工丁', emp: 'HR-2412', dept: '人事行政部', post: '人事专员', days: 560 },
  { name: '示例员工戊', emp: 'IT-2205', dept: '信息技术部', post: 'IT 运维工程师', days: 990 },
  { name: '示例员工己', emp: 'CS-2507', dept: '客服部', post: '售后专员', days: 310 },
  { name: '示例员工庚', emp: 'SA-2409', dept: '销售部', post: '销售代表', days: 520 },
  { name: '示例员工辛', emp: 'GM-2301', dept: '总经办', post: '总经理助理', days: 1120 }
];

// SOP 库（沉淀的实战经验）
const SOPS = [
  { t: '吉客云「店铺主体」字段与财务对账口径', tag: '吉客云', d: '销售渠道新增店铺主体字段后，财务对账必须按主体 + 店铺双维度归集，否则跨主体订单会串账。开号时若岗位涉及对账，需同步授予全部主体数据权限。' },
  { t: '云仓无单销售退货未生成补单排查顺序', tag: '云仓', d: '① 查奇门推送日志是否有该退单回传 ② 核对吉客云退货单状态是否卡在「待审核」 ③ 确认仓侧 WMS 是否已生成入库单 ④ 三者都正常则检查接口凭证是否过期。' },
  { t: '契约锁 e签章开通与用印人绑定', tag: '电子签', d: '账号开通后必须完成「个人证书实名 → 企业用印人授权 → 印章可用范围」三步，缺任一步签署时会提示无可用印章。' },
  { t: '企业微信通讯录 API 迁移要点', tag: '企微', d: '切换通讯录同步系统时，需重新核对授权与部门映射，并避免旧任务与新任务同时同步。' },
  { t: '泛微 OA 账号与组织架构同步', tag: 'OA', d: '新建账号需同时挂到岗位与部门两个维度，只挂部门会导致流程找不到审批人；离职时先转办在途流程再停用账号。' },
  { t: 'BIP 单据权限与凭证打印', tag: 'BIP', d: '「能查单据」不等于「能打凭证」，凭证打印是独立的打印模板权限，财务岗开号时容易被漏掉，需单独勾选。' },
  { t: '离职权限回收 24 小时硬约束', tag: '合规', d: '高危权限（资金、批量导出、管理员）需在离职生效 2 小时内冻结，全部账号 24 小时内停用，设备 3 个工作日内归还并登记。' }
];

/* ---------------- 2. 状态与工具 ---------------- */

const state = {
  mode: 'on',
  plan: null,
  done: {},
  flags: { fin: false, out: false, sign: false },
  selEmp: null,
  log: []
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function el(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}

let toastTimer = null;
function toast(msg, icon) {
  const t = $('#toast');
  t.innerHTML = (icon || '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.6" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>') + '<span>' + msg + '</span>';
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 2200);
}

function fmtDate(d) {
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function todayStr() { return fmtDate(new Date()); }

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

const AV_COLORS = ['#07c160', '#2563eb', '#7c5cff', '#e8870b', '#e5484d', '#0891b2', '#db2777', '#65a30d'];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  return AV_COLORS[h % AV_COLORS.length];
}

/* ---------------- 3. 编排引擎 ---------------- */

const RISK_TXT = ['普通', '敏感', '高危'];
const CAT_NAME = { base: '基础账号', biz: '业务系统', sec: '权限与安全' };
const CAT_NOTE = {
  base: '先有身份，才能开业务',
  biz: '按单据流转顺序开通',
  sec: '权限加固与审计，最后收口'
};

function buildPlan(p) {
  const items = [];
  const seen = new Set();

  const push = (it, src) => {
    const k = it.sys + '|' + it.role;
    if (seen.has(k)) return;
    seen.add(k);
    items.push({
      sys: it.sys, role: it.role, cat: it.cat, appr: it.appr,
      mins: it.mins, risk: it.risk, why: it.why || '', src: src
    });
  };

  BASE_ITEMS.forEach((i) => push(i, 'base'));
  (TPL[p.post] || []).forEach((i) => push(i, 'post'));

  if (state.flags.fin) EXTRA_FIN.forEach((i) => push(i, 'fin'));
  if (state.flags.sign) EXTRA_SIGN.forEach((i) => push(i, 'sign'));
  if (state.flags.out) EXTRA_OUT.forEach((i) => push(i, 'out'));

  // 外包：全部降级为临时权限
  if (state.flags.out) {
    items.forEach((i) => { i.temp = true; });
  }

  // 排序：base → biz → sec，同组内高危靠前
  const order = { base: 0, biz: 1, sec: 2 };
  items.sort((a, b) => (order[a.cat] - order[b.cat]) || (b.risk - a.risk));

  // 职责冲突体检
  const hay = items.map((i) => i.role).join(' § ');
  const conflicts = [];
  SOD.forEach((r) => {
    if (hay.indexOf(r.a) >= 0 && hay.indexOf(r.b) >= 0) conflicts.push(r);
  });
  const risk2 = items.filter((i) => i.risk === 2);
  if (risk2.length >= 4) {
    conflicts.push({
      lv: 'hi',
      msg: '该岗位高危权限达 ' + risk2.length + ' 项，已超出最小权限原则的建议阈值（≤3），建议按「一人一职」拆分账号'
    });
  }
  if (state.flags.out && risk2.length > 0) {
    conflicts.push({ lv: 'hi', msg: '外包人员持有 ' + risk2.length + ' 项高危权限，违反外包管控要求，应回收后改授只读' });
  }

  const totalMin = items.reduce((s, i) => s + i.mins, 0);
  // 手工基准：单个系统平均 9 分钟切换 + 沟通催办，另加一次 15 分钟串联
  const manualMin = items.length * 9 + 15;
  const savedMin = Math.max(0, manualMin - 1);

  return {
    name: p.name, dept: p.dept, post: p.post, date: p.date, leader: p.leader, site: p.site,
    emp: p.emp, items: items, conflicts: conflicts, risk2: risk2.length,
    totalMin: totalMin, manualMin: manualMin, savedMin: savedMin,
    flags: Object.assign({}, state.flags), mode: 'on'
  };
}

function buildOffPlan(emp) {
  const items = [];
  (TPL[emp.post] || []).forEach((it) => items.push(Object.assign({}, it)));
  BASE_ITEMS.forEach((it) => items.push(Object.assign({}, it, { cat: 'base' })));

  // 高危：资金/管理员/导出类
  const hiKw = ['付款', '审批', '管理员', '入库', '导出', '调整', '制单', '权限分配', '后台', 'U 盾', '薪酬'];
  const groups = OFF_GROUPS.map((g) => ({ key: g.key, name: g.name, note: g.note, tasks: [] }));

  items.forEach((it) => {
    const isHi = it.risk === 2 || hiKw.some((k) => it.role.indexOf(k) >= 0);
    let g = 'biz';
    if (it.cat === 'base') g = 'base';
    if (isHi) g = 'freeze';
    const target = groups.find((x) => x.key === g);
    target.tasks.push({
      sys: it.sys,
      role: it.role,
      appr: it.appr,
      mins: Math.max(3, Math.round(it.mins * 0.6)),
      risk: it.risk,
      hi: isHi
    });
  });

  // 设备与凭证
  const assetTasks = [
    { sys: '办公设备', role: '笔记本电脑 + 显示器归还登记', appr: 'IT 资产管理员', mins: 10, risk: 1 },
    { sys: '门禁 / 工牌', role: '门禁卡回收与注销', appr: '行政', mins: 5, risk: 0 }
  ];
  if (emp.dept === '财务部') assetTasks.push({ sys: '银行 U 盾', role: 'U 盾归还 + 银行端解约', appr: '财务经理', mins: 15, risk: 2 });
  if (emp.post.indexOf('运维') >= 0 || emp.post.indexOf('管理员') >= 0) assetTasks.push({ sys: SYS.BASTION, role: '堡垒机账号吊销 + 密钥删除', appr: 'IT 负责人', mins: 10, risk: 2 });
  groups.find((x) => x.key === 'asset').tasks = assetTasks;

  // 数据交接
  groups.find((x) => x.key === 'data').tasks = [
    { sys: '企业微信', role: '外部联系人移交直属上级', appr: emp.post ? '直属上级' : 'IT', mins: 8, risk: 0 },
    { sys: SYS.OA, role: '在途流程转办（不可留死单）', appr: 'HRBP', mins: 10, risk: 0 },
    { sys: '文件盘', role: '个人盘资料归档至部门共享盘', appr: '直属上级', mins: 8, risk: 0 }
  ];

  groups.forEach((g) => { if (!g.tasks.length) g.tasks.push({ sys: '—', role: '无事项', appr: '—', mins: 0, risk: 0 }); });

  const all = groups.reduce((a, g) => a.concat(g.tasks.filter((t) => t.sys !== '—')), []);
  return {
    name: emp.name, dept: emp.dept, post: emp.post, emp: emp.emp,
    date: todayStr(), site: '—', mode: 'off',
    groups: groups, items: all,
    risk2: all.filter((t) => t.risk === 2).length,
    totalMin: all.reduce((s, t) => s + t.mins, 0),
    manualMin: all.length * 8 + 20,
    savedMin: Math.max(0, all.length * 8 + 20 - 1),
    flags: {}
  };
}

/* ---------------- 4. 渲染 ---------------- */

function bdg(text, cls) { return '<span class="bdg ' + cls + '">' + text + '</span>'; }

function taskRow(t, idx, groupKey) {
  const key = state.plan.mode + '-' + state.plan.name + '-' + groupKey + '-' + idx;
  const done = !!state.done[key];
  const tags = [];
  if (t.risk === 2) tags.push(bdg('高危', 'bdg-risk'));
  else if (t.risk === 1) tags.push(bdg('敏感', 'bdg-warn'));
  if (t.temp) tags.push(bdg('临时', 'bdg-tmp'));
  if (t.why) tags.push(bdg(t.why, 'bdg-appr'));
  if (t.hi) tags.push(bdg('优先冻结', 'bdg-risk'));

  return '<div class="task' + (done ? ' done' : '') + '" data-key="' + key + '">' +
    '<div class="tick"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg></div>' +
    '<div class="t-main">' +
      '<div class="t-sys">' + esc(t.sys) + tags.join('') + '</div>' +
      '<div class="t-role">' + esc(t.role) + '</div>' +
    '</div>' +
    '<div class="t-side">' +
      '<span class="t-appr">' + esc(t.appr) + '</span>' +
      '<span class="t-min num">' + t.mins + '′</span>' +
    '</div>' +
  '</div>';
}

function renderResult() {
  const p = state.plan;
  const box = $('#result');
  $('#emptyState').style.display = 'none';

  const flat = [];
  if (p.mode === 'on') {
    ['base', 'biz', 'sec'].forEach((c) => {
      const arr = p.items.filter((i) => i.cat === c);
      if (arr.length) flat.push({ cat: c, name: CAT_NAME[c], note: CAT_NOTE[c], tasks: arr });
    });
  } else {
    p.groups.forEach((g) => { flat.push({ cat: g.key, name: g.name, note: g.note, tasks: g.tasks }); });
  }

  const totalDone = Object.keys(state.done).filter((k) => k.indexOf(p.mode + '-' + p.name + '-') === 0 && state.done[k]).length;
  const total = flat.reduce((s, g) => s + g.tasks.filter((t) => t.sys !== '—').length, 0);
  const pct = total ? Math.round((totalDone / total) * 100) : 0;

  const al = [];
  (p.conflicts || []).forEach((c) => {
    al.push('<div class="alert ' + (c.lv === 'hi' ? 'alert-hi' : 'alert-md') + '">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>' +
      '<div><b>职责冲突：</b>' + esc(c.msg) + '</div></div>');
  });
  if (p.mode === 'on' && p.flags.out) {
    al.push('<div class="alert alert-md">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>' +
      '<div><b>外包管控已生效：</b>全部权限标记为临时，有效期 90 天，并自动开启堡垒机会话审计。</div></div>');
  }
  if (!al.length && p.mode === 'on') {
    al.push('<div class="alert alert-ok">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6L9 17l-5-5"/></svg>' +
      '<div><b>权限体检通过：</b>未发现职责分离冲突，权限范围符合最小权限原则。</div></div>');
  }
  if (p.mode === 'off' && p.risk2 > 0) {
    al.push('<div class="alert alert-hi">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' +
      '<div><b>时限要求：</b>该员工持有 <b>' + p.risk2 + '</b> 项高危权限，须在离职生效后 <b>2 小时</b>内冻结，全部账号 24 小时内停用。</div></div>');
  }

  let html = '<div class="res-head">';
  html += '<div class="res-top">';
  html += '<div class="res-id">';
  html += '<div class="res-name">' + esc(p.name || '未命名') +
    (p.mode === 'off' ? bdg('离职回收', 'bdg-risk') : bdg('入职开通', 'bdg-ok')) + '</div>';
  html += '<div class="res-meta"><span>' + esc(p.dept) + '</span><span class="dot"></span><span>' + esc(p.post) + '</span>' +
    '<span class="dot"></span><span class="emp num">' + esc(p.emp || '') + '</span>' +
    (p.leader ? '<span class="dot"></span><span>上级：' + esc(p.leader) + '</span>' : '') +
    '<span class="dot"></span><span>' + esc(p.date) + '</span></div>';
  html += '</div>';
  html += '<div class="ring" style="--p:' + pct + '"><div class="ring-c"></div><b class="num">' + pct + '%<small>已完成</small></b></div>';
  html += '</div>';

  html += '<div class="stats">' +
    '<div class="stat"><b class="num">' + total + '</b><span>' + (p.mode === 'off' ? '回收事项' : '开通任务') + '</span></div>' +
    '<div class="stat"><b class="num">' + flat.length + '</b><span>涉及环节</span></div>' +
    '<div class="stat danger"><b class="num">' + p.risk2 + '</b><span>高危权限</span></div>' +
    '<div class="stat warn"><b class="num">' + (p.savedMin / 60).toFixed(1) + 'h</b><span>预计节省</span></div>' +
  '</div>';

  html += '</div>';

  if (al.length) html += '<div class="alerts">' + al.join('') + '</div>';

  html += '<div class="groups">';
  flat.forEach((g, gi) => {
    const n = g.tasks.filter((t) => t.sys !== '—').length;
    html += '<div class="grp">' +
      '<div class="grp-h"><i></i><b>' + esc(g.name) + '</b><em>' + esc(g.note) + '</em>' +
      '<span class="cnt">' + n + ' 项</span></div>' +
      '<div class="tasks">' + g.tasks.map((t, ti) => taskRow(t, ti, g.cat)).join('') + '</div>' +
    '</div>';
  });
  html += '</div>';

  html += '<div class="res-foot">' +
    '<button class="mini primary" id="btnCopy"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>复制派单文本</button>' +
    '<button class="mini" id="btnCsv">导出 CSV</button>' +
    '<button class="mini" id="btnPrint">打印工单</button>' +
    '<button class="mini" id="btnShare">生成分享卡</button>' +
    '<span class="grow"></span>' +
    '<span class="fine">预估手工耗时 ' + (p.manualMin / 60).toFixed(1) + 'h · 系统编排 1 秒</span>' +
  '</div>';

  box.innerHTML = html;

  // 勾选交互
  box.querySelectorAll('.task').forEach((row) => {
    row.addEventListener('click', () => {
      const k = row.dataset.key;
      state.done[k] = !state.done[k];
      row.classList.toggle('done', state.done[k]);
      updateRing();
      saveProgress(k);
    });
  });

  $('#btnCopy').onclick = copyPlan;
  $('#btnCsv').onclick = exportCsv;
  $('#btnPrint').onclick = printPlan;
  $('#btnShare').onclick = makeShareCard;

  updateRing();
}

function updateRing() {
  const p = state.plan;
  if (!p) return;
  const rows = $('#result').querySelectorAll('.task');
  let done = 0;
  rows.forEach((r) => { if (r.classList.contains('done')) done++; });
  const pct = rows.length ? Math.round((done / rows.length) * 100) : 0;
  const ring = $('#result').querySelector('.ring');
  if (ring) {
    ring.style.setProperty('--p', pct);
    ring.querySelector('b').innerHTML = pct + '%<small>已完成</small>';
  }
}

/* ---------------- 5. 导出 ---------------- */

function planText() {
  const p = state.plan;
  const L = [];
  L.push('【' + (p.mode === 'off' ? '离职权限回收清单' : '新员工账号开通工单') + '】');
  L.push('姓名：' + p.name + '　工号：' + (p.emp || '—') + '　部门：' + p.dept + '　岗位：' + p.post);
  L.push('日期：' + p.date + '　经办：IT 信息部');
  L.push('高危权限：' + p.risk2 + ' 项　预估节省：' + (p.savedMin / 60).toFixed(1) + ' 小时');
  L.push('');

  let n = 1;
  if (p.mode === 'on') {
    ['base', 'biz', 'sec'].forEach((c) => {
      const arr = p.items.filter((i) => i.cat === c);
      if (!arr.length) return;
      L.push('— ' + CAT_NAME[c] + ' —');
      arr.forEach((i) => {
        const flag = i.risk === 2 ? '[高危]' : (i.temp ? '[临时]' : '');
        L.push(n++ + '. ' + i.sys + '｜' + i.role + '｜审批：' + i.appr + '｜约 ' + i.mins + ' 分钟 ' + flag);
      });
      L.push('');
    });
  } else {
    p.groups.forEach((g) => {
      L.push('— ' + g.name + '（' + g.note + '）—');
      g.tasks.forEach((t) => {
        if (t.sys === '—') return;
        L.push(n++ + '. ' + t.sys + '｜' + t.role + '｜责任人：' + t.appr + ' ' + (t.hi ? '[优先]' : ''));
      });
      L.push('');
    });
  }
  (p.conflicts || []).forEach((c) => L.push('⚠ 风险提示：' + c.msg));
  L.push('');
  L.push('—— 由 OneLaunch 开号一条龙自动编排生成');
  return L.join('\n');
}

function copyPlan() {
  const txt = planText();
  const done = () => toast('派单文本已复制，可直接粘贴到企业微信');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(done).catch(() => fallbackCopy(txt, done));
  } else {
    fallbackCopy(txt, done);
  }
}

function fallbackCopy(txt, cb) {
  const ta = document.createElement('textarea');
  ta.value = txt;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); cb(); } catch (e) { toast('复制失败，请手动选择'); }
  document.body.removeChild(ta);
}

function exportCsv() {
  const p = state.plan;
  const rows = [['序号', '环节', '系统', '角色/事项', '审批/责任人', '耗时(分钟)', '风险等级', '状态']];
  let n = 1;
  if (p.mode === 'on') {
    ['base', 'biz', 'sec'].forEach((c) => {
      p.items.filter((i) => i.cat === c).forEach((i, idx) => {
        const k = p.mode + '-' + p.name + '-' + c + '-' + idx;
        rows.push([n++, CAT_NAME[c], i.sys, i.role, i.appr, i.mins, RISK_TXT[i.risk], state.done[k] ? '已完成' : '待处理']);
      });
    });
  } else {
    p.groups.forEach((g) => {
      g.tasks.forEach((t) => {
        if (t.sys === '—') return;
        rows.push([n++, g.name, t.sys, t.role, t.appr, t.mins, RISK_TXT[t.risk], '']);
      });
    });
  }
  const csv = '\ufeff' + rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'OneLaunch_' + p.name + '_' + p.date + '.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('CSV 已导出，可用 Excel 直接打开');
}

function printPlan() {
  const p = state.plan;
  const box = $('#printArea');
  let h = '<h1>' + (p.mode === 'off' ? '离职权限回收工单' : '新员工账号开通工单') + '</h1>';
  h += '<div class="pm">姓名：' + esc(p.name) + '　工号：' + esc(p.emp || '—') + '　部门：' + esc(p.dept) +
    '　岗位：' + esc(p.post) + '　日期：' + esc(p.date) + '　高危权限：' + p.risk2 + ' 项</div>';
  h += '<table><thead><tr><th>#</th><th>系统</th><th>角色 / 事项</th><th>审批</th><th>耗时</th><th>风险</th><th>完成</th></tr></thead><tbody>';
  let n = 1;
  if (p.mode === 'on') {
    p.items.forEach((i) => {
      h += '<tr><td>' + (n++) + '</td><td>' + esc(i.sys) + '</td><td>' + esc(i.role) + '</td><td>' + esc(i.appr) +
        '</td><td>' + i.mins + '′</td><td>' + RISK_TXT[i.risk] + '</td><td>□</td></tr>';
    });
  } else {
    p.groups.forEach((g) => {
      g.tasks.forEach((t) => {
        if (t.sys === '—') return;
        h += '<tr><td>' + (n++) + '</td><td>' + esc(t.sys) + '</td><td>' + esc(g.name + ' · ' + t.role) + '</td><td>' + esc(t.appr) +
          '</td><td>' + t.mins + '′</td><td>' + RISK_TXT[t.risk] + '</td><td>□</td></tr>';
      });
    });
  }
  h += '</tbody></table>';
  h += '<p style="margin-top:12px;font-size:11px;color:#888;">经办人签字：____________　　信息部盖章：____________　　生成工具：OneLaunch</p>';
  box.innerHTML = h;
  window.print();
}

/* ---------------- 6. 分享卡 ---------------- */

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function makeShareCard() {
  const p = state.plan;
  const cv = $('#shareCanvas');
  const c = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  c.fillStyle = '#f4f7fa';
  c.fillRect(0, 0, W, H);

  // 顶部渐变
  const g = c.createLinearGradient(0, 0, W, 520);
  g.addColorStop(0, '#0bbf67');
  g.addColorStop(1, '#059c6b');
  c.fillStyle = g;
  c.fillRect(0, 0, W, 500);

  // 光晕
  const rg = c.createRadialGradient(880, 80, 20, 880, 80, 460);
  rg.addColorStop(0, 'rgba(255,255,255,.28)');
  rg.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = rg;
  c.fillRect(0, 0, W, 520);

  // 品牌
  c.fillStyle = '#fff';
  roundRect(c, 80, 74, 60, 60, 17);
  c.globalAlpha = 0.18;
  c.fill();
  c.globalAlpha = 1;
  c.font = 'bold 34px -apple-system,"PingFang SC",sans-serif';
  c.fillText('⚡', 92, 118);
  c.font = 'bold 40px -apple-system,"PingFang SC",sans-serif';
  c.fillText('OneLaunch', 158, 118);
  c.font = '26px -apple-system,"PingFang SC",sans-serif';
  c.globalAlpha = 0.86;
  c.fillText('开号一条龙 · 跨系统账号开通与权限回收', 160, 154);
  c.globalAlpha = 1;

  // 主标题（数字全部取自本次真实编排结果，不写死）
  c.font = 'bold 72px -apple-system,"PingFang SC",sans-serif';
  c.fillText(p.items.length + ' 个系统', 80, 280);
  c.fillText((p.manualMin / 60).toFixed(1) + 'h → 1 分钟', 80, 372);
  c.font = '30px -apple-system,"PingFang SC",sans-serif';
  c.globalAlpha = 0.9;
  c.fillText('岗位一选，权限自动编排，责任到人、顺序不乱', 82, 424);
  c.globalAlpha = 1;

  // 白卡
  c.fillStyle = '#fff';
  roundRect(c, 56, 452, W - 112, 640, 40);
  c.shadowColor = 'rgba(13,27,42,.12)';
  c.shadowBlur = 40;
  c.shadowOffsetY = 14;
  c.fill();
  c.shadowColor = 'transparent';
  c.shadowBlur = 0;
  c.shadowOffsetY = 0;

  // 员工信息
  c.fillStyle = '#0d1b2a';
  c.font = 'bold 40px -apple-system,"PingFang SC",sans-serif';
  c.fillText(p.name || '示例员工', 108, 546);
  c.fillStyle = '#8b98a9';
  c.font = '26px -apple-system,"PingFang SC",sans-serif';
  c.fillText(p.dept + ' · ' + p.post, 108, 588);

  // 三数字
  const stats = [
    { v: String(p.items.length), l: p.mode === 'off' ? '回收事项' : '开通任务' },
    { v: String(p.risk2), l: '高危权限' },
    { v: (p.savedMin / 60).toFixed(1) + 'h', l: '节省工时' }
  ];
  stats.forEach((s, i) => {
    const x = 108 + i * 290;
    c.fillStyle = i === 1 ? '#e5484d' : '#07c160';
    c.font = 'bold 68px -apple-system,"PingFang SC",sans-serif';
    c.fillText(s.v, x, 706);
    c.fillStyle = '#8b98a9';
    c.font = '24px -apple-system,"PingFang SC",sans-serif';
    c.fillText(s.l, x, 746);
  });

  // 分隔
  c.fillStyle = '#eef2f6';
  c.fillRect(108, 790, W - 216, 2);

  // 明细
  c.fillStyle = '#475569';
  c.font = '25px -apple-system,"PingFang SC",sans-serif';
  const lines = p.items.slice(0, 6).map((i, k) => (k + 1) + '. ' + i.sys + '｜' + i.role);
  lines.forEach((t, i) => {
    c.fillText(t.length > 26 ? t.slice(0, 26) + '…' : t, 108, 838 + i * 38);
  });
  if (p.items.length > 6) {
    c.fillStyle = '#b3bfcc';
    c.fillText('…… 还有 ' + (p.items.length - 6) + ' 项', 108, 838 + 6 * 38);
  }

  // 底部
  c.fillStyle = '#0d1b2a';
  c.font = 'bold 30px -apple-system,"PingFang SC",sans-serif';
  c.fillText('权限给得准，才不会留坑。', 80, 1170);
  c.fillStyle = '#8b98a9';
  c.font = '24px -apple-system,"PingFang SC",sans-serif';
  c.fillText('#IT运维', 80, 1218);

  // 右侧小徽章
  c.fillStyle = '#e8f9ef';
  roundRect(c, W - 268, 1136, 188, 62, 31);
  c.fill();
  c.fillStyle = '#04a04e';
  c.font = 'bold 24px -apple-system,"PingFang SC",sans-serif';
  c.fillText('自动编排 · 0 遗漏', W - 246, 1176);

  const a = document.createElement('a');
  a.download = 'OneLaunch_分享卡_' + (p.name || 'demo') + '.png';
  a.href = cv.toDataURL('image/png');
  a.click();
  toast('分享卡已生成（1080×1350），可直接发抖音/朋友圈');
}

/* ---------------- 7. 抽屉 ---------------- */

function openDrawer(title, sub, html) {
  $('#dwTitle').textContent = title;
  $('#dwSub').textContent = sub || '';
  $('#dwBody').innerHTML = html;
  $('#drawer').classList.add('on');
  $('#mask').classList.add('on');
  document.body.classList.add('lock');
}
function closeDrawer() {
  $('#drawer').classList.remove('on');
  $('#mask').classList.remove('on');
  document.body.classList.remove('lock');
}

let sqlFetch, sqlOrigin;
let progressQueue = Promise.resolve();
async function execute(sql, values = []) {
  const response = await sqlFetch(`${sqlOrigin}/v3/pipeline`, {
    method: 'POST', headers: {'content-type': 'application/json'},
    body: JSON.stringify({requests: [
      {type: 'execute', stmt: {sql, args: values.map(value => ({type: 'text', value})), want_rows: true}},
      {type: 'close'}
    ]})
  });
  if (!response.ok) throw new Error('数据库请求失败，写入结果可能未知，请刷新核对');
  const body = await response.json();
  const result = body.results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库操作未确认，请刷新核对');
  return result.response.result;
}
async function loadData() {
  if (typeof window.tiana?.auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw new Error('数据库连接尚未就绪');
  const conn = await window.tiana.connection();
  if (conn.sql_api !== 'hrana-v3') throw new Error('当前数据库协议暂不支持');
  sqlOrigin = conn.origin;
  sqlFetch = createTianaFetch({origin: conn.origin, auth: window.tiana.auth, requestBodyMode: 'buffered'});
  const result = await execute('SELECT kind, key, value FROM onelaunch_records ORDER BY rowid DESC');
  for (const row of result.rows) {
    const [kind, key, value] = row.map(cell => cell.value);
    if (kind === 'log') { try { state.log.push(JSON.parse(value)); } catch {} }
    else if (kind === 'progress') state.done[key] = value === '1';
  }
  state.log = state.log.slice(0, 40);
}
function saveLog(rec) {
  const id = crypto.randomUUID();
  state.log.unshift(rec);
  state.log = state.log.slice(0, 40);
  execute('INSERT INTO onelaunch_records (kind, key, value) VALUES (?, ?, ?)', ['log', id, JSON.stringify(rec)])
    .catch(() => toast('记录保存未确认，请刷新核对'));
}
function saveProgress(key) {
  const value = state.done[key] ? '1' : '0';
  progressQueue = progressQueue.then(() => execute('INSERT INTO onelaunch_records (kind, key, value) VALUES (?, ?, ?) ON CONFLICT(kind, key) DO UPDATE SET value=excluded.value', ['progress', key, value])).catch(() => { toast('进度保存未确认，请刷新核对'); throw new Error('进度写入未确认'); });
  progressQueue.catch(() => {});
}

function showBoard() {
  const log = state.log;
  let cnt = log.length, sysSum = 0, saveSum = 0, riskSum = 0;
  const deptMap = {};
  log.forEach((r) => {
    sysSum += r.n || 0;
    saveSum += r.saved || 0;
    riskSum += r.risk || 0;
    deptMap[r.dept] = (deptMap[r.dept] || 0) + 1;
  });
  const maxD = Math.max(1, ...Object.values(deptMap));

  let h = '<div class="kpi">' +
    '<div class="k"><b class="num">' + cnt + '</b><span>累计编排次数</span></div>' +
    '<div class="k"><b class="num">' + sysSum + '</b><span>累计处理权限项</span></div>' +
    '<div class="k hl"><b class="num">' + (saveSum / 60).toFixed(1) + 'h</b><span>累计节省工时</span></div>' +
    '<div class="k"><b class="num" style="color:#e5484d">' + riskSum + '</b><span>拦截高危/冲突</span></div>' +
  '</div>';

  h += '<h4 style="font-size:12.5px;margin:6px 0 10px;">部门分布</h4><div class="bars">';
  const ds = Object.keys(deptMap);
  if (!ds.length) h += '<p style="font-size:12px;color:#8b98a9">还没有数据，先在左边生成一份方案。</p>';
  ds.forEach((d) => {
    h += '<div class="bar-row"><span class="bl">' + esc(d) + '</span>' +
      '<span class="bar-track"><i class="bar-fill" style="width:' + Math.round(deptMap[d] / maxD * 100) + '%;display:block"></i></span>' +
      '<span class="bv num">' + deptMap[d] + '</span></div>';
  });
  h += '</div>';

  h += '<h4 style="font-size:12.5px;margin:22px 0 4px;">最近记录</h4>';
  if (!log.length) h += '<p style="font-size:12px;color:#8b98a9;margin-top:6px">暂无记录。</p>';
  log.slice(0, 12).forEach((r) => {
    h += '<div class="log-item"><span class="lt num">' + esc(r.time) + '</span>' +
      '<span class="lc"><b>' + esc(r.name) + '</b> · ' + esc(r.post) + ' · ' +
      (r.mode === 'off' ? '离职回收' : '入职开通') + ' ' + r.n + ' 项</span></div>';
  });

  openDrawer('数据看板', '应用记录统计', h);
}

function showKb() {
  let h = '<p style="font-size:12px;color:#8b98a9;margin-bottom:14px;">下面是踩过坑之后沉淀下来的判断依据，编排规则就是从这些经验里长出来的。</p><div class="kb">';
  SOPS.forEach((s) => {
    h += '<div class="kb-item"><div class="kb-t">' + esc(s.t) + '<span class="kb-tag">' + esc(s.tag) + '</span></div>' +
      '<div class="kb-d">' + esc(s.d) + '</div></div>';
  });
  h += '</div>';
  openDrawer('SOP 知识库', SOPS.length + ' 条跨系统开通与排查经验', h);
}

function showAbout() {
  const h = '<div class="about">' +
    '<p><b>为什么做这个？</b>新人入职时，要在 8 个系统里各开一次号：企业微信、邮箱、泛微 OA、BIP、吉客云、i人事、云仓 WMS、契约锁。每个系统的角色口径不一样、审批人不一样、还要讲究先后顺序。全靠人记，结果就是——漏开、错开、离职忘了收。</p>' +
    '<p>OneLaunch 把这套隐性经验变成了一套可执行的规则引擎。</p>' +
    '<h4>三个真正解决问题的设计</h4>' +
    '<ul>' +
    '<li><i>①</i><span><b>岗位即模板</b>：选部门和岗位，自动推导出该在哪些系统开什么角色，连审批人和耗时都标好。</span></li>' +
    '<li><i>②</i><span><b>职责冲突体检</b>：同时持有「付款制单」和「付款审批」会被立刻标红——这是审计最容易抓的内控漏洞。</span></li>' +
    '<li><i>③</i><span><b>离职反查</b>：从在册名册反查权限，按「高危冻结 → 业务停用 → 基础停用 → 设备归还 → 数据交接」五段式出回收清单，把最容易漏的那一步补上。</span></li>' +
    '</ul>' +
    '<h4>技术说明</h4>' +
    '<p>权限矩阵、SoD 规则和回收流程可按实际需要调整。工单进度与统计记录保存在应用数据库中。</p>' +
    '<p style="color:#8b98a9;font-size:11.5px;margin-top:16px;">OneLaunch v1.0</p>' +
    '</div>';
  openDrawer('关于这个作品', '一个 IT 运维的日常，被做成了一台机器', h);
}

/* ---------------- 8. 表单初始化 ---------------- */

const EXAMPLES = [
  { name: '示例甲', dept: '电商运营部', post: '电商运营', leader: '示例主管', fin: false, out: false, sign: false },
  { name: '示例乙', dept: '财务部', post: '出纳', leader: '示例经理', fin: true, out: false, sign: true },
  { name: '示例丙', dept: '信息技术部', post: 'IT 运维工程师', leader: '示例工程师', fin: false, out: false, sign: false },
  { name: '示例丁', dept: '人事行政部', post: '人事专员', leader: '示例经理', fin: false, out: false, sign: true }
];

function fillDepts() {
  const sel = $('#fDept');
  sel.innerHTML = DEPTS.map((d) => '<option value="' + d.name + '">' + d.name + '</option>').join('');
}

function fillPosts() {
  const dept = $('#fDept').value;
  const d = DEPTS.find((x) => x.name === dept);
  const sel = $('#fPost');
  sel.innerHTML = (d ? d.posts : []).map((p) => '<option value="' + p + '">' + p + '</option>').join('');
}

function mockEmp(dept) {
  const d = DEPTS.find((x) => x.name === dept);
  const code = d ? d.code : 'XX';
  const n = String(Math.floor(Math.random() * 9000) + 1000);
  return code + '-' + n;
}

function renderRoster(kw) {
  const box = $('#rlist');
  const k = (kw || '').trim();
  const list = ROSTER.filter((r) => !k || r.name.indexOf(k) >= 0 || r.emp.indexOf(k) >= 0 || r.dept.indexOf(k) >= 0);
  if (!list.length) {
    box.innerHTML = '<p style="font-size:12px;color:#8b98a9;padding:10px 2px;">没有匹配的在册员工。</p>';
    return;
  }
  box.innerHTML = list.map((r) => {
    const all = (TPL[r.post] || []).length + BASE_ITEMS.length;
    const hi = (TPL[r.post] || []).filter((i) => i.risk === 2).length;
    return '<div class="ritem' + (state.selEmp && state.selEmp.emp === r.emp ? ' sel' : '') + '" data-emp="' + r.emp + '">' +
      '<div class="avatar" style="background:' + avatarColor(r.name) + '">' + esc(r.name.slice(0, 1)) + '</div>' +
      '<div class="ri-n"><b>' + esc(r.name) + '</b><span>' + esc(r.dept) + ' · ' + esc(r.post) + '</span></div>' +
      '<div class="ri-c num">' + all + ' 项权限<b>' + hi + ' 高危</b></div>' +
    '</div>';
  }).join('');

  box.querySelectorAll('.ritem').forEach((row) => {
    row.addEventListener('click', () => {
      state.selEmp = ROSTER.find((r) => r.emp === row.dataset.emp);
      box.querySelectorAll('.ritem').forEach((r) => r.classList.remove('sel'));
      row.classList.add('sel');
    });
  });
}

/* ---------------- 9. 事件 ---------------- */

function setMode(m) {
  state.mode = m;
  $('#paneOn').style.display = m === 'on' ? '' : 'none';
  $('#paneOff').style.display = m === 'off' ? '' : 'none';
  $$('#modeSeg button').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
  state.plan = null;
  $('#result').innerHTML = '';
  $('#emptyState').style.display = '';
  $('#emptyState').querySelector('h3').textContent = m === 'off' ? '选一个要走的同事' : '左边填人，右边出方案';
  $('#emptyState').querySelector('p').textContent = m === 'off'
    ? '系统按该员工在册期间实际开通的权限反查，生成五段式回收清单；高危项自动前置并标注时限要求。'
    : '选定部门与岗位后，系统按预设的权限矩阵，自动推导出这名员工该在哪些系统开什么角色、由谁审批、按什么顺序开通，并做职责冲突体检。';
  $('#emptyState').querySelector('.steps').style.display = m === 'off' ? 'none' : 'flex';
  $('#emptyState').querySelector('.feats').style.display = m === 'off' ? 'none' : 'grid';
}

function doGenerate() {
  const name = $('#fName').value.trim();
  if (!name) { toast('先填个姓名吧', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.4"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>'); $('#fName').focus(); return; }
  const p = {
    name: name,
    dept: $('#fDept').value,
    post: $('#fPost').value,
    date: $('#fDate').value || todayStr(),
    leader: $('#fLeader').value.trim(),
    site: $('#fSite').value,
    emp: mockEmp($('#fDept').value)
  };
  state.plan = buildPlan(p);
  renderResult();
  saveLog({
    time: todayStr().slice(5) + ' ' + new Date().toTimeString().slice(0, 5),
    name: p.name, dept: p.dept, post: p.post, n: state.plan.items.length,
    saved: state.plan.savedMin, risk: state.plan.risk2 + state.plan.conflicts.length, mode: 'on'
  });
  toast('方案已生成：' + state.plan.items.length + ' 项，' + state.plan.risk2 + ' 项高危已标注');
}

function doOffGenerate() {
  if (!state.selEmp) { toast('先在左边选一位待离职员工'); return; }
  state.plan = buildOffPlan(state.selEmp);
  renderResult();
  saveLog({
    time: todayStr().slice(5) + ' ' + new Date().toTimeString().slice(0, 5),
    name: state.selEmp.name, dept: state.selEmp.dept, post: state.selEmp.post,
    n: state.plan.items.length, saved: state.plan.savedMin, risk: state.plan.risk2, mode: 'off'
  });
  toast('回收清单已生成，' + state.plan.risk2 + ' 项高危需 2 小时内冻结');
}

function init() {
  fillDepts();
  fillPosts();
  $('#fDate').value = todayStr();
  renderRoster('');


  $('#fDept').addEventListener('change', fillPosts);

  $$('.tg').forEach((tg) => {
    tg.addEventListener('click', () => {
      const k = tg.dataset.key;
      state.flags[k] = !state.flags[k];
      tg.classList.toggle('on', state.flags[k]);
    });
  });

  $('#quickChips').innerHTML = EXAMPLES.map((e, i) => '<button class="chip" data-i="' + i + '">' + e.name + ' · ' + e.post + '</button>').join('');
  $('#quickChips').addEventListener('click', (ev) => {
    const b = ev.target.closest('.chip');
    if (!b) return;
    const e = EXAMPLES[+b.dataset.i];
    $('#fName').value = e.name;
    $('#fDept').value = e.dept;
    fillPosts();
    $('#fPost').value = e.post;
    $('#fLeader').value = e.leader;
    state.flags = { fin: e.fin, out: e.out, sign: e.sign };
    $$('.tg').forEach((tg) => tg.classList.toggle('on', !!state.flags[tg.dataset.key]));
    doGenerate();
  });

  $('#btnGen').addEventListener('click', doGenerate);
  $('#btnReset').addEventListener('click', () => {
    $('#fName').value = '';
    $('#fLeader').value = '';
    $('#fDate').value = todayStr();
    state.flags = { fin: false, out: false, sign: false };
    $$('.tg').forEach((tg) => tg.classList.remove('on'));
    $('#result').innerHTML = '';
    $('#emptyState').style.display = '';
    state.plan = null;
    toast('已重置');
  });

  $$('#modeSeg button').forEach((b) => {
    b.addEventListener('click', () => setMode(b.dataset.mode));
  });

  $('#searchEmp').addEventListener('input', (e) => renderRoster(e.target.value));
  $('#btnOffGen').addEventListener('click', doOffGenerate);

  $('#btnBoard').addEventListener('click', showBoard);
  $('#btnKb').addEventListener('click', showKb);
  $('#btnAbout').addEventListener('click', showAbout);
  $('#dwClose').addEventListener('click', closeDrawer);
  $('#mask').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
}

async function start() {
  try { await loadData(); init(); }
  catch (error) { document.body.innerHTML = ''; const message = document.createElement('p'); message.textContent = '无法加载应用数据：' + error.message + '。请检查连接后刷新。'; document.body.append(message); }
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

