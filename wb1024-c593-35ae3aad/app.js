const style = document.createElement("style"); style.textContent = "\n/* ============ tokens ============ */\n:root{\n  --r:16px;\n  --mono:ui-monospace,\"SF Mono\",Menlo,Consolas,monospace;\n\n  /* 深色（默认） */\n  color-scheme:dark;\n  --bg:#0a0908;\n  --panel:#131110;\n  --panel-2:#191614;\n  --line:rgba(255,255,255,.07);\n  --line-2:rgba(255,255,255,.13);\n  --text:#f4f0e9;\n  --dim:#a29b8d;\n  --faint:#615b52;\n  --amber:#ff9f43;\n  --amber-2:#ffcb6b;\n  --amber-deep:#e8792a;\n  --ok:#5ddc8a;\n  --bad:#ff6b6b;\n\n  /* 面 / 轨道 */\n  --field:rgba(255,255,255,.04);\n  --hover:rgba(255,255,255,.05);\n  --track:rgba(255,255,255,.07);\n  --cell:rgba(255,255,255,.045);\n\n  /* 品牌色薄涂 */\n  --tint-a1:rgba(255,159,67,.05);\n  --tint-a2:rgba(255,159,67,.10);\n  --tint-a3:rgba(255,159,67,.20);\n  --tint-ok1:rgba(93,220,138,.05);\n  --tint-ok2:rgba(93,220,138,.14);\n  --tint-ok3:rgba(93,220,138,.30);\n  --tint-bad1:rgba(255,107,107,.12);\n  --tint-bad3:rgba(255,107,107,.30);\n\n  /* 足迹分级 */\n  --heat1:rgba(255,159,67,.22);\n  --heat2:rgba(255,159,67,.48);\n  --heat3:rgba(255,159,67,.80);\n  --heat4:#ffcb6b;\n\n  /* 背景光晕 */\n  --glow1:rgba(255,159,67,.11);\n  --glow2:rgba(255,203,107,.055);\n  --glow3:rgba(93,220,138,.04);\n\n  /* 浮层 */\n  --shade:rgba(6,5,4,.72);\n  --modal:#121110;\n  --toast:#1d1a17;\n\n  /* 图表 */\n  --grid:rgba(255,255,255,.06);\n  --ideal:rgba(255,255,255,.20);\n  --axis:#5c564d;\n  --todayline:rgba(255,255,255,.16);\n}\n\n/* 浅色：同一套语义变量换值，组件不用改 */\n[data-theme=\"light\"]{\n  color-scheme:light;\n  --bg:#faf7f2;\n  --panel:#ffffff;\n  --panel-2:#fdfaf4;\n  --line:rgba(40,30,18,.10);\n  --line-2:rgba(40,30,18,.19);\n  --text:#1b1712;\n  --dim:#5c554c;\n  --faint:#8b8378;\n  --amber:#c96a10;\n  --amber-2:#9e4f09;\n  --amber-deep:#a85510;\n  --ok:#0f8a4d;\n  --bad:#c23434;\n\n  --field:rgba(40,30,18,.035);\n  --hover:rgba(40,30,18,.05);\n  --track:rgba(40,30,18,.09);\n  --cell:rgba(40,30,18,.07);\n\n  --tint-a1:rgba(201,106,16,.055);\n  --tint-a2:rgba(201,106,16,.10);\n  --tint-a3:rgba(201,106,16,.22);\n  --tint-ok1:rgba(15,138,77,.06);\n  --tint-ok2:rgba(15,138,77,.13);\n  --tint-ok3:rgba(15,138,77,.26);\n  --tint-bad1:rgba(194,52,52,.10);\n  --tint-bad3:rgba(194,52,52,.26);\n\n  --heat1:rgba(201,106,16,.20);\n  --heat2:rgba(201,106,16,.45);\n  --heat3:rgba(201,106,16,.75);\n  --heat4:#c96a10;\n\n  --glow1:rgba(201,106,16,.10);\n  --glow2:rgba(216,140,50,.06);\n  --glow3:rgba(15,138,77,.04);\n\n  --shade:rgba(65,50,32,.32);\n  --modal:#ffffff;\n  --toast:#241f19;\n\n  --grid:rgba(40,30,18,.08);\n  --ideal:rgba(40,30,18,.22);\n  --axis:#9a9186;\n  --todayline:rgba(40,30,18,.20);\n}\n\n*{box-sizing:border-box;margin:0;padding:0}\nhtml,body{height:100%}\nbody{\n  background:var(--bg);\n  color:var(--text);\n  font-family:-apple-system,BlinkMacSystemFont,\"SF Pro Display\",\"Segoe UI\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;\n  font-size:15px;\n  line-height:1.55;\n  -webkit-font-smoothing:antialiased;\n  font-variant-numeric:tabular-nums;\n  overflow-x:hidden;\n}\nbody::before{\n  content:\"\";\n  position:fixed;inset:0;z-index:0;pointer-events:none;\n  background:\n    radial-gradient(900px 520px at 12% -12%, var(--glow1), transparent 62%),\n    radial-gradient(720px 420px at 102% -4%, var(--glow2), transparent 58%),\n    radial-gradient(600px 600px at 50% 120%, var(--glow3), transparent 60%);\n}\n.wrap{position:relative;z-index:1;max-width:1120px;margin:0 auto;padding:0 24px 96px}\n\n/* ============ header ============ */\nheader{\n  display:flex;align-items:center;justify-content:space-between;\n  padding:26px 0 30px;\n  animation:fadeUp .5s ease both;\n}\n.brand{display:flex;align-items:center;gap:10px;font-weight:600;letter-spacing:-.3px;font-size:16px}\n.brand .mark{\n  width:22px;height:22px;border-radius:7px;position:relative;\n  background:linear-gradient(150deg,var(--amber),var(--amber-deep));\n  box-shadow:0 0 22px var(--tint-a3);\n  display:grid;place-items:center;\n}\n.brand .mark::after{\n  content:\"\";width:6px;height:6px;border-radius:50%;background:#1b1208;\n}\n.hdr-right{display:flex;align-items:center;gap:10px}\n.pill{\n  display:inline-flex;align-items:center;gap:6px;\n  padding:7px 13px;border:1px solid var(--line);border-radius:999px;\n  font-size:13px;color:var(--dim);background:var(--field);\n}\n.pill.hot{color:var(--amber-2);border-color:var(--tint-a3);background:var(--tint-a1)}\n.btn-add{\n  padding:8px 15px;border-radius:999px;border:1px solid var(--line-2);\n  background:var(--field);color:var(--text);font-size:13px;font-weight:500;\n  cursor:pointer;transition:.18s;font-family:inherit;\n}\n.btn-add:hover{background:var(--hover);border-color:var(--line-2)}\n.btn-icon{\n  width:34px;height:34px;border-radius:50%;border:1px solid transparent;\n  background:none;color:var(--faint);cursor:pointer;font-size:15px;transition:.18s;\n  display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;\n}\n.btn-icon:hover{color:var(--dim);background:var(--hover)}\n\n/* ============ hero ============ */\n.hero{\n  display:flex;align-items:flex-end;justify-content:space-between;gap:32px;\n  padding-bottom:30px;border-bottom:1px solid var(--line);\n  animation:fadeUp .55s .04s ease both;\n}\n.hero-date{\n  font-size:13px;color:var(--faint);letter-spacing:.14em;text-transform:uppercase;\n  margin-bottom:10px;font-family:var(--mono);\n}\n.hero-line{\n  font-size:26px;line-height:1.35;font-weight:600;letter-spacing:-.5px;\n  max-width:640px;text-wrap:balance;\n}\n.hero-line em{font-style:normal;color:var(--amber-2)}\n.ring-wrap{position:relative;flex-shrink:0;display:grid;place-items:center}\n.ring-num{\n  position:absolute;text-align:center;line-height:1.1;\n}\n.ring-num b{display:block;font-size:22px;font-weight:600;letter-spacing:-.5px}\n.ring-num span{font-size:10px;color:var(--faint);letter-spacing:.1em}\n\n/* ============ sections ============ */\n.sec-head{\n  display:flex;align-items:baseline;justify-content:space-between;\n  margin:38px 0 16px;gap:16px;\n}\n.sec-head h2{\n  font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);\n}\n.sec-head .hint{font-size:12.5px;color:var(--faint)}\n\n/* ============ task cards ============ */\n.tasks{display:flex;flex-direction:column;gap:12px}\n.task{\n  position:relative;background:var(--panel);border:1px solid var(--line);\n  border-radius:var(--r);padding:20px 22px 18px;overflow:hidden;\n  transition:border-color .25s,background .25s,transform .25s;\n  animation:fadeUp .45s ease both;\n}\n.task::before{\n  content:\"\";position:absolute;left:0;top:0;bottom:0;width:2px;\n  background:var(--line-2);transition:.3s;\n}\n.task:hover{border-color:var(--line-2);background:var(--panel-2)}\n.task.done::before{background:var(--ok);box-shadow:0 0 16px var(--tint-ok2)}\n.task.done{background:linear-gradient(90deg,var(--tint-ok1),var(--panel) 45%)}\n.task.rest::before{background:var(--line-2)}\n.task-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:16px}\n.task-title{font-size:16px;font-weight:600;letter-spacing:-.2px;margin-bottom:4px}\n.task-meta{font-size:12.5px;color:var(--faint);font-variant-numeric:tabular-nums}\n.task-meta b{color:var(--dim);font-weight:500}\n.task-quota{display:flex;align-items:baseline;gap:8px;flex-shrink:0}\n.q-num{\n  font-size:38px;font-weight:600;letter-spacing:-2px;line-height:1;\n  color:var(--amber-2);font-variant-numeric:tabular-nums;\n}\n.task.done .q-num{color:var(--ok)}\n.q-unit{font-size:13px;color:var(--faint)}\n\n.bar{height:4px;background:var(--track);border-radius:99px;overflow:hidden}\n.bar i{\n  display:block;height:100%;border-radius:99px;\n  background:linear-gradient(90deg,var(--amber),var(--amber-2));\n  transition:width .55s cubic-bezier(.22,1,.36,1);\n}\n.task.done .bar i{background:var(--ok)}\n.bar-label{\n  display:flex;justify-content:space-between;font-size:11.5px;color:var(--faint);\n  margin-top:7px;font-variant-numeric:tabular-nums;\n}\n.task-foot{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:14px}\n.debt{font-size:12px;color:var(--faint);line-height:1.5}\n.debt b{color:var(--bad);font-weight:600}\n.debt.calm b{color:var(--dim)}\n.acts{display:flex;gap:8px;flex-shrink:0}\n.btn{\n  font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;\n  border-radius:10px;padding:9px 15px;transition:.18s;border:1px solid transparent;\n  white-space:nowrap;\n}\n.btn-main{background:linear-gradient(160deg,var(--amber),var(--amber-deep));color:#1a1005;font-weight:600;\n  box-shadow:0 4px 18px var(--tint-a3)}\n.btn-main:hover{filter:brightness(1.08);transform:translateY(-1px)}\n.btn-main:active{transform:translateY(0) scale(.985)}\n.btn-sub{background:var(--hover);border-color:var(--line);color:var(--dim)}\n.btn-sub:hover{background:var(--hover);color:var(--text)}\n.btn-done{background:var(--tint-ok2);border-color:var(--tint-ok3);color:var(--ok)}\n.btn-done:hover{background:var(--tint-ok3)}\n\n/* ============ panels ============ */\n.grid2{display:grid;grid-template-columns:1.35fr 1fr;gap:14px;align-items:start}\n.panel{\n  background:var(--panel);border:1px solid var(--line);border-radius:var(--r);\n  padding:20px 22px;animation:fadeUp .5s .06s ease both;\n}\n.panel-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:14px}\n.panel-head h3{font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}\n.tabs{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}\n.tab{\n  font-family:inherit;font-size:11.5px;padding:4px 10px;border-radius:99px;cursor:pointer;\n  border:1px solid transparent;background:none;color:var(--faint);transition:.18s;\n  max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;\n}\n.tab:hover{color:var(--dim)}\n.tab.on{background:var(--tint-a2);border-color:var(--tint-a3);color:var(--amber-2)}\n\n/* diagnosis */\n.diag{display:flex;flex-direction:column;gap:14px}\n.diag-row{display:flex;align-items:baseline;justify-content:space-between;gap:14px;\n  padding-bottom:12px;border-bottom:1px solid var(--line)}\n.diag-row:last-child{border-bottom:none;padding-bottom:0}\n.diag-k{font-size:12.5px;color:var(--faint);flex-shrink:0}\n.diag-v{font-size:15px;font-weight:600;text-align:right;letter-spacing:-.2px}\n.diag-v.good{color:var(--ok)}\n.diag-v.warn{color:var(--amber-2)}\n.diag-v.bad{color:var(--bad)}\n.diag-note{font-size:11.5px;color:var(--faint);margin-top:-6px;line-height:1.5}\n\n/* quote */\n.quote{position:relative;overflow:hidden}\n.quote-text{font-size:16px;line-height:1.65;letter-spacing:-.15px;color:var(--text);text-wrap:balance}\n.quote-text b{color:var(--amber-2);font-weight:600}\n.quote-sig{margin-top:12px;font-size:11.5px;color:var(--faint);letter-spacing:.08em;font-family:var(--mono)}\n\n/* heatmap */\n.heat{\n  display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,14px);\n  gap:4px;justify-content:start;\n}\n.cell{width:14px;height:14px;border-radius:3px;background:var(--cell);transition:.2s}\n.cell:hover{outline:1px solid var(--line-2);outline-offset:1px}\n.cell.l1{background:var(--heat1)}\n.cell.l2{background:var(--heat2)}\n.cell.l3{background:var(--heat3)}\n.cell.l4{background:var(--heat4);box-shadow:0 0 8px var(--tint-a3)}\n.legend{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--faint)}\n.legend .cell{width:9px;height:9px;border-radius:2px}\n.heat-foot{display:flex;justify-content:space-between;margin-top:12px;font-size:11.5px;color:var(--faint)}\n\n/* goal list */\n.goals{display:flex;flex-direction:column;gap:8px}\n.goal-row{\n  display:flex;align-items:center;gap:14px;padding:13px 16px;border-radius:12px;\n  border:1px solid transparent;transition:.18s;cursor:pointer;\n}\n.goal-row:hover{background:var(--hover);border-color:var(--line)}\n.goal-row .g-name{font-size:14px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.goal-row .g-pct{font-size:12px;color:var(--faint);font-variant-numeric:tabular-nums}\n.mini-bar{width:80px;height:3px;background:var(--track);border-radius:99px;overflow:hidden;flex-shrink:0}\n.mini-bar i{display:block;height:100%;background:var(--amber);border-radius:99px;transition:width .5s}\n.goal-row .del{\n  opacity:0;width:24px;height:24px;border-radius:6px;border:none;background:none;\n  color:var(--faint);cursor:pointer;font-size:14px;transition:.18s;flex-shrink:0;\n}\n.goal-row:hover .del{opacity:1}\n.goal-row .del:hover{background:var(--tint-bad1);color:var(--bad)}\n\n/* ============ empty ============ */\n.empty{\n  margin-top:48px;padding:72px 40px;text-align:center;\n  border:1px dashed var(--line-2);border-radius:22px;\n  background:radial-gradient(600px 300px at 50% 0%, var(--tint-a1), transparent 70%);\n  animation:fadeUp .5s ease both;\n}\n.empty h2{font-size:24px;font-weight:600;letter-spacing:-.5px;margin-bottom:10px}\n.empty p{color:var(--dim);font-size:14px;max-width:420px;margin:0 auto 28px;line-height:1.7}\n.empty-acts{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}\n.btn-lg{padding:13px 26px;font-size:14px;border-radius:12px}\n.link-btn{\n  background:none;border:1px solid var(--line);color:var(--dim);\n  font-size:14px;cursor:pointer;font-family:inherit;\n  padding:13px 22px;border-radius:12px;transition:.18s;\n}\n.link-btn:hover{color:var(--text);border-color:var(--line-2);background:var(--hover)}\n\n/* ============ modal ============ */\n.scrim{\n  position:fixed;inset:0;z-index:50;background:var(--shade);\n  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);\n  display:grid;place-items:center;padding:24px;\n  opacity:0;pointer-events:none;transition:.22s;\n}\n.scrim.on{opacity:1;pointer-events:auto}\n.modal{\n  width:100%;max-width:520px;background:var(--modal);border:1px solid var(--line-2);\n  border-radius:20px;padding:28px;max-height:88vh;overflow-y:auto;\n  transform:translateY(14px) scale(.985);transition:.28s cubic-bezier(.22,1,.36,1);\n  box-shadow:0 30px 80px rgba(0,0,0,.6);\n}\n.scrim.on .modal{transform:none}\n.modal h3{font-size:19px;font-weight:600;letter-spacing:-.3px;margin-bottom:6px}\n.modal .sub{font-size:13px;color:var(--faint);margin-bottom:22px;line-height:1.6}\n.field{margin-bottom:16px}\n.field label{display:block;font-size:12px;color:var(--faint);margin-bottom:7px;letter-spacing:.04em}\ninput,select{\n  width:100%;font-family:inherit;font-size:14px;color:var(--text);\n  background:var(--field);border:1px solid var(--line);\n  border-radius:10px;padding:11px 13px;outline:none;transition:.18s;\n}\ninput:focus,select:focus{border-color:var(--tint-a3);background:var(--tint-a1)}\ninput::placeholder{color:var(--faint)}\n.row{display:flex;gap:10px}\n.row>*{flex:1}\n.seg{display:flex;gap:4px;background:var(--field);padding:4px;border-radius:11px;margin-bottom:20px}\n.seg button{\n  flex:1;font-family:inherit;font-size:12.5px;padding:8px;border-radius:8px;border:none;\n  background:none;color:var(--faint);cursor:pointer;transition:.18s;\n}\n.seg button.on{background:var(--tint-a2);color:var(--amber-2);font-weight:500}\n.dow{display:flex;gap:6px}\n.dow button{\n  flex:1;font-family:inherit;font-size:12px;padding:9px 0;border-radius:9px;\n  border:1px solid var(--line);background:var(--field);color:var(--faint);\n  cursor:pointer;transition:.18s;\n}\n.dow button.on{background:var(--tint-bad1);border-color:var(--tint-bad3);color:var(--bad)}\n.preview{\n  padding:14px 16px;border-radius:12px;background:var(--tint-a1);\n  border:1px solid var(--tint-a3);font-size:13px;color:var(--dim);\n  line-height:1.6;margin:20px 0;\n}\n.preview b{color:var(--amber-2);font-size:16px;font-weight:600;font-variant-numeric:tabular-nums}\n.modal-foot{display:flex;gap:10px;justify-content:flex-end}\n\n/* ============ howto ============ */\n.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}\n.step{\n  padding:22px 20px;border:1px solid var(--line);border-radius:var(--r);\n  background:var(--panel);transition:.2s;\n}\n.step:hover{border-color:var(--line-2);background:var(--panel-2)}\n.step-n{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;color:var(--amber);margin-bottom:14px}\n.step h4{font-size:14px;font-weight:600;letter-spacing:-.15px;margin-bottom:8px;line-height:1.45}\n.step p{font-size:12.5px;color:var(--dim);line-height:1.7}\n.formula{\n  margin-top:12px;padding:24px 26px;border-radius:var(--r);\n  border:1px solid var(--tint-a3);\n  background:linear-gradient(150deg,var(--tint-a1),transparent);\n}\n.formula-k{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--amber);margin-bottom:12px;font-family:var(--mono)}\n.formula code{\n  display:block;font-family:var(--mono);font-size:15px;color:var(--text);\n  margin-bottom:12px;line-height:1.7;letter-spacing:-.2px;\n}\n.formula-n{font-size:12.5px;color:var(--faint);line-height:1.75;max-width:640px}\n\n/* ============ share ============ */\n.btn-add.ghost{background:none;border-color:var(--line);color:var(--dim)}\n.btn-add.ghost:hover{background:var(--hover);border-color:var(--line-2);color:var(--text)}\n.share-modal{max-width:460px}\n.share-preview{\n  border-radius:14px;overflow:hidden;border:1px solid var(--line);\n  background:#0a0908;margin-bottom:18px;line-height:0;\n}\n.share-preview img{width:100%;height:auto;display:block}\n\n/* toast */\n#toast{\n  position:fixed;left:50%;bottom:36px;transform:translate(-50%,16px);z-index:80;\n  background:var(--toast);border:1px solid var(--line-2);border-radius:12px;\n  padding:11px 20px;font-size:13px;color:var(--text);opacity:0;pointer-events:none;\n  transition:.3s;box-shadow:0 12px 40px rgba(0,0,0,.5);\n}\n#toast.on{opacity:1;transform:translate(-50%,0)}\n\n/* float num */\n.float{\n  position:absolute;right:26px;top:16px;font-size:15px;font-weight:600;\n  color:var(--amber-2);pointer-events:none;animation:floatUp 1s ease both;\n  font-variant-numeric:tabular-nums;\n}\n@keyframes floatUp{\n  0%{opacity:0;transform:translateY(6px)}\n  25%{opacity:1}\n  100%{opacity:0;transform:translateY(-26px)}\n}\n@keyframes fadeUp{\n  from{opacity:0;transform:translateY(10px)}\n  to{opacity:1;transform:none}\n}\n.hidden{display:none !important}\n\n@media (max-width:860px){\n  .grid2{grid-template-columns:1fr}\n  .steps{grid-template-columns:1fr}\n  .hero{flex-direction:column;align-items:flex-start;gap:22px}\n  .hero-line{font-size:22px}\n  .ring-wrap{display:none}\n  .task-head{flex-direction:column;gap:10px}\n  .task-quota{align-self:flex-start}\n  .task-foot{flex-direction:column;align-items:stretch}\n  .acts{justify-content:flex-end}\n  .wrap{padding:0 18px 72px}\n  .panel{padding:18px}\n  #btn-reset{display:none}\n  #btn-help{display:none}\n  .hdr-right{gap:6px}\n  /* 小屏上让足迹撑满宽度，格子跟着变大，不然挤在左边一小块 */\n  .heat{\n    grid-auto-columns:1fr;\n    grid-template-rows:repeat(7,1fr);\n    width:100%;\n    height:min(270px,58vw);\n    gap:4px;\n  }\n  .heat .cell{width:auto;height:auto}\n}\n"; document.head.appendChild(style);
document.getElementById("app").innerHTML = "\n<div class=\"wrap\">\n\n  <header>\n    <div class=\"brand\"><span class=\"mark\"></span>Backcast</div>\n    <div class=\"hdr-right\">\n      <div class=\"pill\" id=\"streak-pill\">🔥 0 天</div>\n      <button class=\"btn-icon\" id=\"btn-theme\" title=\"切换深浅色\">☀</button>\n      <button class=\"btn-icon\" id=\"btn-help\" title=\"它是怎么算的\">?</button>\n      <button class=\"btn-add ghost\" id=\"btn-share\">分享</button>\n      <button class=\"btn-add\" id=\"btn-add\">+ 新目标</button>\n      <button class=\"btn-icon\" id=\"btn-reset\" title=\"清空所有数据\">⋯</button>\n    </div>\n  </header>\n\n  <section class=\"hero\">\n    <div>\n      <div class=\"hero-date\" id=\"hero-date\">—</div>\n      <div class=\"hero-line\" id=\"hero-line\">从终点往回走。</div>\n    </div>\n    <div class=\"ring-wrap\">\n      <svg width=\"104\" height=\"104\" viewBox=\"0 0 104 104\">\n        <circle cx=\"52\" cy=\"52\" r=\"45\" fill=\"none\" stroke=\"rgba(255,255,255,.07)\" stroke-width=\"7\"/>\n        <circle id=\"ring-fg\" cx=\"52\" cy=\"52\" r=\"45\" fill=\"none\" stroke=\"var(--amber)\"\n          stroke-width=\"7\" stroke-linecap=\"round\" stroke-dasharray=\"282.7\"\n          stroke-dashoffset=\"282.7\" transform=\"rotate(-90 52 52)\"\n          style=\"transition:stroke-dashoffset .7s cubic-bezier(.22,1,.36,1)\"/>\n      </svg>\n      <div class=\"ring-num\"><b id=\"ring-b\">0%</b><span>今日</span></div>\n    </div>\n  </section>\n\n  <div id=\"empty\" class=\"empty\">\n    <h2>别再立志了。倒推。</h2>\n    <p>设一个截止日和一个总量。Backcast 会把它拆成<br>「今天要做多少」。今天少做一格，明天数字就变大。</p>\n    <div class=\"empty-acts\">\n      <button class=\"btn btn-main btn-lg\" id=\"btn-create\">创建第一个目标</button>\n      <button class=\"link-btn\" id=\"btn-demo\">先看看示例</button>\n    </div>\n  </div>\n\n  <div id=\"board\" class=\"hidden\">\n    <div class=\"sec-head\">\n      <h2>今天</h2>\n      <div class=\"hint\" id=\"today-hint\"></div>\n    </div>\n    <div class=\"tasks\" id=\"tasks\"></div>\n\n    <div class=\"grid2\" style=\"margin-top:28px\">\n      <div class=\"panel\">\n        <div class=\"panel-head\">\n          <h3>燃尽</h3>\n          <div class=\"tabs\" id=\"tabs\"></div>\n        </div>\n        <div id=\"chart\"></div>\n      </div>\n      <div style=\"display:flex;flex-direction:column;gap:14px\">\n        <div class=\"panel diag\" id=\"diag\"></div>\n        <div class=\"panel quote\" id=\"quote\"></div>\n      </div>\n    </div>\n\n    <div class=\"panel\" style=\"margin-top:14px\">\n      <div class=\"panel-head\">\n        <h3>足迹 · 最近 12 周</h3>\n        <div class=\"legend\">\n          少<span class=\"cell\"></span><span class=\"cell l1\"></span><span class=\"cell l2\"></span><span class=\"cell l3\"></span><span class=\"cell l4\"></span>多\n        </div>\n      </div>\n      <div class=\"heat\" id=\"heat\"></div>\n      <div class=\"heat-foot\">\n        <span id=\"heat-left\"></span>\n        <span id=\"heat-right\"></span>\n      </div>\n    </div>\n\n    <div class=\"sec-head\">\n      <h2>全部目标</h2>\n    </div>\n    <div class=\"goals\" id=\"goals\"></div>\n\n    <!-- 使用说明：评分表里「使用说明清晰」是明写的 25 分之一 -->\n    <section id=\"howto\">\n      <div class=\"sec-head\" style=\"margin-top:46px\">\n        <h2>它是怎么算的</h2>\n        <div class=\"hint\">三步，没有黑箱</div>\n      </div>\n      <div class=\"steps\">\n        <div class=\"step\">\n          <div class=\"step-n\">STEP 01</div>\n          <h4>先定终点，不是先定每天</h4>\n          <p>输入总量和截止日就够了。系统先算出这中间有多少个「推进日」——扣掉你选的休息日。</p>\n        </div>\n        <div class=\"step\">\n          <div class=\"step-n\">STEP 02</div>\n          <h4>剩余 ÷ 剩余天数 = 今天的配额</h4>\n          <p>配额每天重算。今天做完，明天的数字变小；今天不做，明天的数字变大。偷懒只有代价，没有清零。</p>\n        </div>\n        <div class=\"step\">\n          <div class=\"step-n\">STEP 03</div>\n          <h4>燃尽图告诉你会不会迟到</h4>\n          <p>实线是你的真实进度，虚线是计划进度。按最近 14 天的速度外推，直接算出「会晚几天」。</p>\n        </div>\n      </div>\n      <div class=\"formula\">\n        <div class=\"formula-k\">今天的配额</div>\n        <code>⌈ (目标总量 − 已完成) ÷ 剩余推进日 ⌉</code>\n        <div class=\"formula-n\">\n          推进日从今天算到截止日，排除你设的休息日。每次打卡后立刻重算，所以这个数字是「活的」。\n          连续达标的天数记为 streak；休息日不打断它，也不计入。\n        </div>\n      </div>\n    </section>\n  </div>\n</div>\n\n<!-- modal -->\n<div class=\"scrim\" id=\"scrim\">\n  <div class=\"modal\">\n    <h3>新目标</h3>\n    <div class=\"sub\">先想清楚终点在哪。今天的数字由它决定。</div>\n\n    <div class=\"seg\">\n      <button data-mode=\"once\" class=\"on\">一次性目标</button>\n      <button data-mode=\"daily\">每日习惯</button>\n    </div>\n\n    <div class=\"field\">\n      <label>目标是什么</label>\n      <input id=\"f-title\" type=\"text\" placeholder=\"读完《思考，快与慢》\" maxlength=\"42\">\n    </div>\n\n    <div id=\"pane-once\">\n      <div class=\"row\">\n        <div class=\"field\">\n          <label>总量</label>\n          <input id=\"f-total\" type=\"number\" min=\"1\" step=\"1\" placeholder=\"360\">\n        </div>\n        <div class=\"field\">\n          <label>单位</label>\n          <input id=\"f-unit\" type=\"text\" placeholder=\"页\" maxlength=\"6\">\n        </div>\n      </div>\n      <div class=\"field\">\n        <label>截止日期</label>\n        <input id=\"f-deadline\" type=\"date\">\n      </div>\n    </div>\n\n    <div id=\"pane-daily\" class=\"hidden\">\n      <div class=\"row\">\n        <div class=\"field\">\n          <label>每天做多少</label>\n          <input id=\"f-perday\" type=\"number\" min=\"1\" step=\"1\" placeholder=\"300\">\n        </div>\n        <div class=\"field\">\n          <label>单位</label>\n          <input id=\"f-unit2\" type=\"text\" placeholder=\"字\" maxlength=\"6\">\n        </div>\n      </div>\n      <div class=\"field\">\n        <label>持续多少天</label>\n        <input id=\"f-days\" type=\"number\" min=\"1\" max=\"3650\" step=\"1\" placeholder=\"30\">\n      </div>\n    </div>\n\n    <div class=\"field\">\n      <label>哪几天不推进（休息日不计入配额）</label>\n      <div class=\"dow\" id=\"dow\"></div>\n    </div>\n\n    <div class=\"preview\" id=\"preview\">填完自动算给你看。</div>\n\n    <div class=\"modal-foot\">\n      <button class=\"btn btn-sub\" id=\"m-cancel\">取消</button>\n      <button class=\"btn btn-main\" id=\"m-save\">创建</button>\n    </div>\n  </div>\n</div>\n\n<!-- 分享 -->\n<div class=\"scrim\" id=\"share-scrim\">\n  <div class=\"modal share-modal\">\n    <h3>分享这一刻</h3>\n    <div class=\"sub\">图片可以直接发小红书 / 朋友圈。文案已写好，复制就能用。</div>\n    <div class=\"share-preview\"><img id=\"share-img\" alt=\"分享卡片\"></div>\n    <div class=\"field\">\n      <label>活动话题（可留空，会自动拼进文案）</label>\n      <input id=\"share-tag\" type=\"text\" placeholder=\"#1024程序员节\" maxlength=\"30\">\n    </div>\n    <div class=\"modal-foot\">\n      <button class=\"btn btn-sub\" id=\"share-copy\">复制文案</button>\n      <button class=\"btn btn-main\" id=\"share-download\">下载图片</button>\n    </div>\n  </div>\n</div>\n\n<div id=\"toast\"></div>\n\n";

"use strict";

/* ============================================================
   日期工具 —— 全部用本地 YYYY-MM-DD 字符串，避开时区偏移
   ============================================================ */
const pad2 = n => String(n).padStart(2, "0");
function ymd(d){ return d.getFullYear() + "-" + pad2(d.getMonth()+1) + "-" + pad2(d.getDate()); }
function parseYmd(s){ const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); }
function addDays(s, n){ const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); }
function daysBetween(a, b){ return Math.round((parseYmd(b) - parseYmd(a)) / 86400000); }
function todayKey(){ return ymd(new Date()); }
function dowOf(s){ return (parseYmd(s).getDay() + 6) % 7; } // 周一=0 … 周日=6

const WEEK_CN = ["一","二","三","四","五","六","日"];
const MONTH_CN = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

/* ============================================================
   状态
   ============================================================ */
const STORE = "backcast.v1";
let S = { goals: [], focus: null };

function load(){
  try{
    const raw = localStorage.getItem(STORE);
    if(!raw) return;
    const p = JSON.parse(raw);
    if(p && Array.isArray(p.goals)) S = { goals: p.goals, focus: p.focus || null };
  }catch(e){ /* 损坏就重来 */ }
}
function save(){
  try{ localStorage.setItem(STORE, JSON.stringify(S)); }catch(e){}
}
function uid(){ return "g" + Math.random().toString(36).slice(2,9); }

/* ============================================================
   核心算法
   ============================================================ */

// 区间内所有工作日的日期数组（daysOff: 0-6, 周一=0）
function workDaysInRange(start, end, daysOff){
  const out = [];
  if(start > end) return out;
  let cur = start, guard = 0;
  while(cur <= end && guard++ < 4000){
    if(!daysOff.includes(dowOf(cur))) out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

// 截至某日（含）累计完成量
function doneThrough(goal, date){
  let sum = 0;
  for(const k in goal.log){
    if(k <= date) sum += goal.log[k];
  }
  return sum;
}
function doneOn(goal, date){ return goal.log[date] || 0; }
function doneTotal(goal){ return doneThrough(goal, "9999-12-31"); }
function remain(goal){ return Math.max(0, goal.total - doneTotal(goal)); }

// 某一天应该做多少（该日清晨视角的配额）
// 关键：doneBefore 只算这一天之前，所以今天做超了不会让今天的配额变小
function quotaForDate(goal, date){
  if(date < goal.start) return 0;
  if(date > goal.deadline) return 0;
  if(goal.daysOff.includes(dowOf(date))) return 0;
  const rd = workDaysInRange(date, goal.deadline, goal.daysOff).length;
  if(rd <= 0) return 0;
  const rem = Math.max(0, goal.total - doneThrough(goal, addDays(date, -1)));
  return Math.ceil(rem / rd);
}

// 今天是真的休息日，还是已经过了截止日
function isRestDay(goal, date){
  return goal.daysOff.includes(dowOf(date)) && date >= goal.start && date <= goal.deadline;
}
function isExpired(goal, date){ return date > goal.deadline; }
function isUpcoming(goal, date){ return date < goal.start; }

// 下一个推进日应做多少（以今天的完成情况为起点）。
// 今天欠的账会直接推高这个数字 —— 这就是「债务感」的来源。
function tomorrowQuota(goal){
  const t = todayKey();
  if(t >= goal.deadline) return null;
  let nxt = addDays(t, 1), guard = 0;
  while(goal.daysOff.includes(dowOf(nxt)) && guard++ < 14) nxt = addDays(nxt, 1);
  if(nxt > goal.deadline) return null;
  return quotaForDate(goal, nxt);
}

// 明天的日期标签，用于文案
function tomorrowLabel(goal){
  const t = todayKey();
  let nxt = addDays(t, 1), guard = 0;
  while(goal.daysOff.includes(dowOf(nxt)) && guard++ < 14) nxt = addDays(nxt, 1);
  return "周" + WEEK_CN[dowOf(nxt)];
}

// 最近 N 天的平均推进速度。
// 只统计「今天之前」的完整日子 —— 今天还没过完，把它算进平均会拉低速度，
// 导致「诊断说晚 1 天、分享文案说晚 3 天」这种自相矛盾。
function recentRate(goal, days = 14){
  const t = todayKey();
  let sum = 0, activeDays = 0;
  for(let i = 1; i <= days; i++){
    const d = addDays(t, -i);
    if(d < goal.start) break;
    const amt = doneOn(goal, d);
    if(amt > 0){ sum += amt; activeDays++; }
  }
  if(activeDays === 0){
    // 今天之前没有历史，只能用今天的量兜底
    return doneOn(goal, t) || 0;
  }
  return sum / activeDays;
}

// 按当前速度：还需要多少个工作单位日 vs 还剩多少个工作日
function forecast(goal){
  const t = todayKey();
  const rd = workDaysInRange(t > goal.deadline ? goal.deadline : t, goal.deadline, goal.daysOff).length;
  const rem = remain(goal);
  const rate = recentRate(goal);
  if(rem <= 0) return { state: "done", rd, rem };
  if(rate <= 0) return { state: "unknown", rd, rem };
  const need = Math.ceil(rem / rate);
  return { state: "run", rd, rem, rate, need, gap: need - rd };
}

/* ============================================================
   视图计算
   ============================================================ */
function activeGoals(date){
  return S.goals.filter(g => g.start <= date && date <= g.deadline);
}
function visibleGoals(){
  const t = todayKey();
  return S.goals.filter(g => g.start <= t && (t <= g.deadline || remain(g) > 0));
}

// 当天状态：达标几件 / 共几件 —— 不同目标的单位不能相加（页 + 字没有意义）
function dayState(date){
  const gs = S.goals.filter(g => g.start <= date && date <= g.deadline);
  if(!gs.length) return { kind: "none", ratio: 0 };
  let taskCount = 0, metCount = 0;
  gs.forEach(g => {
    const q = quotaForDate(g, date);
    if(q > 0){
      taskCount++;
      if(doneOn(g, date) >= q) metCount++;
    }
  });
  // 配额为 0 但当天仍有记录 → 说明已经提前完成，算达标
  if(!taskCount){
    const anyDone = gs.some(g => doneOn(g, date) > 0);
    return anyDone ? { kind: "met", ratio: 1 } : { kind: "rest", ratio: 0 };
  }
  const ratio = metCount / taskCount;
  return { kind: ratio >= 1 ? "met" : (ratio > 0 ? "partial" : "miss"),
           ratio, need: taskCount, got: metCount };
}

function streak(){
  let d = todayKey(), n = 0, guard = 0;
  const st = dayState(d);
  if(st.kind === "met") n++;
  d = addDays(d, -1);
  while(guard++ < 800){
    const s = dayState(d);
    if(s.kind === "met"){ n++; d = addDays(d, -1); }
    else if(s.kind === "none" || s.kind === "rest"){ d = addDays(d, -1); }
    else break;
  }
  return n;
}

function todayTotals(){
  const t = todayKey();
  const gs = visibleGoals();
  let total = 0, done = 0;
  gs.forEach(g => {
    const q = quotaForDate(g, t);
    if(q > 0){
      total++;
      if(doneOn(g, t) >= q) done++;
    }
  });
  return { total, done, ratio: total > 0 ? done / total : 0 };
}

/* ============================================================
   渲染
   ============================================================ */
const $ = id => document.getElementById(id);

function render(){
  const t = todayKey();

  // 日期行
  const td = parseYmd(t);
  $("hero-date").textContent =
    MONTH_CN[td.getMonth()] + " " + td.getDate() + " 日 · 周" + WEEK_CN[dowOf(t)];

  const st = streak();
  const sp = $("streak-pill");
  sp.textContent = "🔥 " + st + " 天";
  sp.className = "pill" + (st > 0 ? " hot" : "");

  const has = visibleGoals().length > 0;
  $("empty").classList.toggle("hidden", has);
  $("board").classList.toggle("hidden", !has);
  // 没有目标时藏掉进度环，0% 会让人以为「什么都没做」
  document.querySelector(".ring-wrap").classList.toggle("hidden", !has);
  if(!has){ $("hero-line").innerHTML = "从终点往回走。"; return; }

  const tt = todayTotals();
  // ring —— 全是休息日时视为满格，别让人看着像没做事
  const C = 282.7;
  const ringRatio = tt.total > 0 ? Math.min(1, tt.ratio) : 1;
  $("ring-fg").setAttribute("stroke-dashoffset", String(C * (1 - ringRatio)));
  $("ring-fg").setAttribute("stroke", ringRatio >= 1 ? "var(--ok)" : "var(--amber)");
  $("ring-b").textContent = Math.round(ringRatio * 100) + "%";

  // hero line
  $("hero-line").innerHTML = heroLine(st, tt);

  // hint
  $("today-hint").textContent = tt.total > 0
    ? (tt.done >= tt.total ? "今天 " + tt.total + " 件，全部交完。" : "还差 " + (tt.total - tt.done) + " 件")
    : "今天没有配额。";

  renderTasks();
  renderTabs();
  renderChart();
  renderDiag();
  renderQuote(st);
  renderHeat();
  renderGoals();
}

function heroLine(st, tt){
  if(tt.total === 0) return "今天全部休息。休息也是计划的一部分。";
  if(tt.ratio >= 1) return "今天的分量已交完。明天的数字自己会变小——<em>这就是复利</em>。";
  if(st >= 7) return "已经连续 <em>" + st + " 天</em>没有断。别在今天破功。";
  if(tt.done > 0) return "开了个头。" + tt.total + " 件里还剩 <em>" + (tt.total - tt.done) + "</em> 件。";
  return "今天有 <em>" + tt.total + "</em> 件。做完就不用再想它了。";
}

function renderTasks(){
  const t = todayKey();
  const wrap = $("tasks");
  wrap.innerHTML = "";
  const gs = visibleGoals();

  gs.forEach((g, i) => {
    const q = quotaForDate(g, t);
    const got = doneOn(g, t);
    const done = q > 0 && got >= q;
    const rest = isRestDay(g, t);
    const expired = isExpired(g, t);
    const rem = remain(g);
    const pct = q > 0 ? Math.min(100, got / q * 100) : (rem === 0 ? 100 : 0);
    const left = daysBetween(t, g.deadline);

    const el = document.createElement("div");
    el.className = "task" + (done ? " done" : "") + (rest ? " rest" : "");
    el.style.animationDelay = (i * 45) + "ms";

    const nxtQ = tomorrowQuota(g);
    let quotaHtml, debtHtml;

    if(rest){
      quotaHtml = '<span class="q-num" style="color:var(--faint)">—</span><span class="q-unit">休息日</span>';
      debtHtml = "今天是休息日，配额已经摊到别的日子上了。";
    } else if(rem === 0){
      quotaHtml = '<span class="q-num" style="color:var(--ok)">✓</span><span class="q-unit">已完成</span>';
      debtHtml = "这个目标已经走完了。";
    } else if(expired){
      quotaHtml = '<span class="q-num" style="color:var(--bad)">' + rem + '</span><span class="q-unit">' + esc(g.unit) + '欠账</span>';
      debtHtml = "已经过了截止日。要么补完，要么承认它需要一个新的截止日。";
    } else {
      quotaHtml = '<span class="q-num">' + q + '</span><span class="q-unit">' + esc(g.unit) + '</span>';
      if(done){
        if(nxtQ === null){
          debtHtml = "今天做完了，明天就是终点。";
        } else {
          const drop = q - nxtQ;
          debtHtml = "今天做完了。<b style='color:var(--dim)'>" + tomorrowLabel(g) + "</b>" +
            (drop > 0 ? "只要" : "还要") + " <b style='color:var(--dim)'>" + nxtQ + " " + esc(g.unit) + "</b>";
        }
      } else if(nxtQ === null){
        debtHtml = "这是最后一个推进日。今天不做，就只能改截止日了。";
      } else if(nxtQ > q){
        debtHtml = "今天不做 → 明天要做 <b>" + nxtQ + " " + esc(g.unit) + "</b>";
      } else {
        debtHtml = "今天不做 → 明天 " + nxtQ + " " + esc(g.unit) + "，还不算太糟。";
      }
    }

    el.innerHTML = `
      <div class="task-head">
        <div>
          <div class="task-title">${esc(g.title)}</div>
          <div class="task-meta">还剩 <b>${rem}</b> / ${g.total} ${esc(g.unit)} · ${
            left >= 0 ? "距截止 <b>" + left + "</b> 天" : "已过期 " + (-left) + " 天"}</div>
        </div>
        <div class="task-quota">${quotaHtml}</div>
      </div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="bar-label">
        <span>今日 ${got} / ${q > 0 ? q : "—"}</span>
        <span>${Math.round(doneTotal(g) / g.total * 100)}% 总计</span>
      </div>
      <div class="task-foot">
        <div class="debt ${done ? 'calm' : ''}">${debtHtml}</div>
        <div class="acts">
          ${q > 0 && !done ? '<button class="btn btn-sub" data-act="one" data-id="' + g.id + '">+1</button>' : ''}
          ${q > 0 && !done ? '<button class="btn btn-main" data-act="fill" data-id="' + g.id + '">完成今天 +' + q + '</button>' : ''}
          ${done ? '<button class="btn btn-done" data-act="undo" data-id="' + g.id + '">✓ 已达标 · 撤销</button>' : ''}
          ${expired && rem > 0 ? '<button class="btn btn-sub" data-act="extend" data-id="' + g.id + '">顺延 7 天</button>' : ''}
        </div>
      </div>`;
    wrap.appendChild(el);
  });
}

function renderTabs(){
  const tabs = $("tabs");
  const gs = visibleGoals();
  if(!S.focus || !gs.find(g => g.id === S.focus)) S.focus = gs[0] ? gs[0].id : null;
  if(gs.length <= 1){ tabs.innerHTML = ""; return; }
  tabs.innerHTML = "";
  gs.forEach(g => {
    const b = document.createElement("button");
    b.className = "tab" + (g.id === S.focus ? " on" : "");
    b.textContent = g.title;
    b.onclick = () => { S.focus = g.id; save(); renderTabs(); renderChart(); };
    tabs.appendChild(b);
  });
}

/* ---------- 燃尽图 ---------- */
function renderChart(){
  const g = S.goals.find(x => x.id === S.focus) || visibleGoals()[0];
  const host = $("chart");
  if(!g){ host.innerHTML = ""; return; }

  const W = 640, H = 216, PL = 36, PR = 14, PT = 16, PB = 26;
  const iw = W - PL - PR, ih = H - PT - PB;
  const span = Math.max(1, daysBetween(g.start, g.deadline));
  const t = todayKey();
  const X = d => PL + (daysBetween(g.start, d) / span) * iw;
  const Y = v => PT + (1 - Math.max(0, Math.min(v, g.total)) / g.total) * ih;

  // 理想线
  const ideal = `M ${X(g.start).toFixed(1)} ${Y(g.total).toFixed(1)} L ${X(g.deadline).toFixed(1)} ${Y(0).toFixed(1)}`;

  // 实际线（start → min(today, deadline)）
  const lastDate = t < g.start ? g.start : (t > g.deadline ? g.deadline : t);
  const steps = Math.min(daysBetween(g.start, lastDate), 400);
  const step = Math.max(1, Math.ceil((daysBetween(g.start, lastDate) + 1) / 80));
  let pts = [];
  for(let i = 0; i <= daysBetween(g.start, lastDate); i += step){
    const d = addDays(g.start, i);
    pts.push([X(d), Y(g.total - doneThrough(g, d))]);
  }
  const lastD = addDays(g.start, daysBetween(g.start, lastDate));
  if(!pts.length || pts[pts.length-1][0] !== X(lastD)) pts.push([X(lastD), Y(g.total - doneThrough(g, lastD))]);
  const actual = "M " + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L ");

  // 投影线
  let proj = "", projDot = "";
  const rate = recentRate(g);
  if(rate > 0 && remain(g) > 0){
    const needDays = remain(g) / rate;
    const endD = addDays(t, Math.ceil(needDays));
    const x0 = X(t < g.start ? g.start : t), y0 = Y(remain(g));
    const x1 = X(endD), y1 = Y(0);
    proj = `M ${x0.toFixed(1)} ${y0.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    projDot = `<circle cx="${x0.toFixed(1)}" cy="${y0.toFixed(1)}" r="3.5" fill="var(--amber-2)"/>`;
  }

  // 今天竖线
  const todayX = (t >= g.start && t <= g.deadline) ? X(t) : null;

  // y 轴刻度
  const ticks = [0, .5, 1].map(f => {
    const v = Math.round(g.total * f);
    return `<text x="${PL-8}" y="${Y(v)+3.5}" text-anchor="end" font-size="10.5"
      fill="var(--axis)" font-family="ui-monospace,monospace">${v}</text>`;
  }).join("");

  // x 轴标签
  const mid = addDays(g.start, Math.floor(span/2));
  const xlab = `
    <text x="${X(g.start)}" y="${H-8}" font-size="10.5" fill="var(--axis)" font-family="ui-monospace,monospace">${g.start.slice(5)}</text>
    <text x="${X(g.deadline)}" y="${H-8}" text-anchor="end" font-size="10.5" fill="var(--axis)" font-family="ui-monospace,monospace">${g.deadline.slice(5)}</text>`;

  host.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block" preserveAspectRatio="xMidYMid meet">
    <defs>
      <clipPath id="plot"><rect x="${PL}" y="${PT-6}" width="${iw}" height="${ih+8}"/></clipPath>
      <linearGradient id="fillA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--amber)" stop-opacity=".22"/>
        <stop offset="100%" stop-color="var(--amber)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${ticks}
    <line x1="${PL}" y1="${Y(g.total)}" x2="${PL+iw}" y2="${Y(g.total)}" stroke="var(--grid)"/>
    <line x1="${PL}" y1="${Y(0)}" x2="${PL+iw}" y2="${Y(0)}" stroke="var(--grid)"/>
    <g clip-path="url(#plot)">
      <path d="${ideal}" fill="none" stroke="var(--ideal)" stroke-width="1.5" stroke-dasharray="4 4"/>
      ${pts.length > 0 ? `<path d="${actual} L ${pts[pts.length-1][0].toFixed(1)} ${Y(0)} L ${pts[0][0].toFixed(1)} ${Y(0)} Z" fill="url(#fillA)" stroke="none"/>` : ""}
      ${pts.length > 0 ? `<path d="${actual}" fill="none" stroke="var(--amber)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>` : ""}
      ${proj ? `<path d="${proj}" fill="none" stroke="var(--amber-2)" stroke-width="1.8" stroke-dasharray="3 4" opacity=".75"/>` : ""}
      ${projDot}
    </g>
    ${todayX !== null ? `<line x1="${todayX}" y1="${PT-6}" x2="${todayX}" y2="${PT+ih}" stroke="var(--todayline)" stroke-dasharray="2 3"/>` : ""}
    ${xlab}
  </svg>`;
}

/* ---------- 诊断 ---------- */
function renderDiag(){
  const g = S.goals.find(x => x.id === S.focus) || visibleGoals()[0];
  if(!g){ $("diag").innerHTML = ""; return; }
  const f = forecast(g);
  const t = todayKey();
  const left = daysBetween(t, g.deadline);
  const pct = Math.round(doneTotal(g) / g.total * 100);

  let verdict, cls;
  if(f.state === "done"){ verdict = "已完成"; cls = "good"; }
  else if(f.state === "unknown"){ verdict = "还没有数据"; cls = "warn"; }
  else if(f.gap > 0){ verdict = "会晚 " + f.gap + " 天"; cls = "bad"; }
  else if(f.gap < 0){ verdict = "会提前 " + (-f.gap) + " 天"; cls = "good"; }
  else { verdict = "刚好压线"; cls = "warn"; }

  $("diag").innerHTML = `
    <div class="diag-row">
      <span class="diag-k">当前速度</span>
      <span class="diag-v">${f.rate ? f.rate.toFixed(1) : "—"} ${esc(g.unit)}/天</span>
    </div>
    <div class="diag-note">${f.rate ? "最近 14 天里，你平均每个推进日完成这么多。" : "还没有完成记录，先做一次。"}</div>
    <div class="diag-row">
      <span class="diag-k">按此速度</span>
      <span class="diag-v ${cls}">${verdict}</span>
    </div>
    <div class="diag-note">${f.state === "run"
      ? "还需要 " + f.need + " 个推进日，实际只剩 " + f.rd + " 个。"
      : "剩余 " + f.rem + " " + esc(g.unit) + "，剩 " + Math.max(0,left) + " 天。"}</div>
    <div class="diag-row">
      <span class="diag-k">总体进度</span>
      <span class="diag-v">${pct}%</span>
    </div>
    <div class="mini-bar" style="width:100%;height:4px"><i style="width:${pct}%"></i></div>`;
}

/* ---------- 激励 ---------- */
function renderQuote(st){
  const tt = todayTotals();
  const t = todayKey();
  const gs = visibleGoals();
  const behind = gs.filter(g => {
    const f = forecast(g);
    return f.state === "run" && f.gap > 0;
  }).length;

  let text, sig;
  if(tt.ratio >= 1){
    text = "今天的额度清零了。你刚把「未来的自己」往后挪了一格——<b>他今天轻松一点了</b>。";
    sig = "DONE · " + t;
  } else if(st >= 21){
    text = "<b>" + st + " 天</b>。到这个程度，它已经不是在靠意志力运转了，是你换了个身份。";
    sig = "STREAK " + st;
  } else if(st >= 7){
    text = "连续 <b>" + st + " 天</b>。人对自己的信任，是一次一次兑现小承诺攒出来的。";
    sig = "STREAK " + st;
  } else if(behind >= 2){
    text = "有两个目标正在往后滑。不是要你一次补完，<b>今天先把最大的那格填掉</b>，剩下的明天再说。";
    sig = "REALIGN";
  } else if(behind === 1){
    text = "有一格落后了。落后不可怕，可怕的是让它变成「反正也追不上」。<b>今天追一点就够了</b>。";
    sig = "REALIGN";
  } else if(tt.got > 0){
    text = "已经动了。剩下那部分，<b>拆成两次做完</b>比一次硬扛更容易兑现。";
    sig = "IN PROGRESS";
  } else {
    text = "今天还没开始。别计划了，<b>先做最小的那一步</b>——配额这种东西，开始之后就只剩数字了。";
    sig = "START";
  }

  $("quote").innerHTML = `<div class="quote-text">${text}</div><div class="quote-sig">${sig}</div>`;
}

/* ---------- 热力图 ---------- */
function renderHeat(){
  const t = todayKey();
  const d = parseYmd(t);
  const dow = (d.getDay() + 6) % 7;
  const weekEnd = addDays(t, 6 - dow);       // 本周日
  const start = addDays(weekEnd, -12*7 + 1); // 12 周前

  const host = $("heat");
  host.innerHTML = "";
  let met = 0, total = 0;

  for(let i = 0; i < 12*7; i++){
    const date = addDays(start, i);
    const cell = document.createElement("div");
    cell.className = "cell";
    if(date <= t){
      const s = dayState(date);
      if(s.kind === "met"){ cell.classList.add("l4"); met++; total++; }
      else if(s.kind === "partial"){ cell.classList.add(s.ratio >= .5 ? "l2" : "l1"); total++; }
      else if(s.kind === "miss"){ total++; }
      else if(s.kind === "rest" || s.kind === "none"){ /* 留空 */ }
    }
    if(date > t) cell.style.opacity = ".25";
    cell.title = date + " · " + ({
      met: "达标", partial: "部分完成", miss: "未完成", rest: "休息日", none: "无任务"
    }[dayState(date).kind] || "");
    host.appendChild(cell);
  }

  $("heat-left").textContent = met + " 天达标 / 共 " + total + " 个推进日";
  $("heat-right").textContent = total > 0 ? "达标率 " + Math.round(met/total*100) + "%" : "";
}

/* ---------- 目标列表 ---------- */
function renderGoals(){
  const host = $("goals");
  host.innerHTML = "";
  if(!S.goals.length){ host.innerHTML = '<div style="color:var(--faint);font-size:13px">还没有目标。</div>'; return; }
  S.goals.forEach(g => {
    const pct = Math.min(100, Math.round(doneTotal(g) / g.total * 100));
    const row = document.createElement("div");
    row.className = "goal-row";
    row.innerHTML = `
      <div class="g-name">${esc(g.title)}</div>
      <div class="g-pct">${doneTotal(g)} / ${g.total} ${esc(g.unit)}</div>
      <div class="mini-bar"><i style="width:${pct}%"></i></div>
      <div class="g-pct" style="width:36px;text-align:right">${pct}%</div>
      <button class="del" data-del="${g.id}" title="删除">✕</button>`;
    row.querySelector("[data-del]").onclick = (e) => {
      e.stopPropagation();
      if(confirm("删除「" + g.title + "」？记录会一起消失。")){
        S.goals = S.goals.filter(x => x.id !== g.id);
        if(S.focus === g.id) S.focus = null;
        save(); render();
      }
    };
    host.appendChild(row);
  });
}

function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}

/* ============================================================
   交互
   ============================================================ */
$("tasks").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-act]");
  if(!btn) return;
  const g = S.goals.find(x => x.id === btn.dataset.id);
  if(!g) return;
  const t = todayKey();
  const q = quotaForDate(g, t);
  const act = btn.dataset.act;
  const before = g.log[t] || 0;

  if(act === "extend"){
    g.deadline = addDays(g.deadline, 7);
    save(); render();
    toast("截止日顺延 7 天 · 每天的量重新算了");
    return;
  }

  if(act === "one") g.log[t] = before + 1;
  else if(act === "fill") g.log[t] = Math.max(before, q);
  else if(act === "undo") delete g.log[t];

  const delta = (g.log[t] || 0) - before;
  const card = btn.closest(".task");
  const rect = card.getBoundingClientRect();

  save();

  // 浮动数字挂到 body 上，否则会被随后的重绘一起抹掉
  if(delta > 0){
    const f = document.createElement("div");
    f.className = "float";
    f.style.position = "fixed";
    f.style.left = (rect.left + rect.width - 96) + "px";
    f.style.top = (rect.top + 22) + "px";
    f.textContent = "+" + delta;
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1000);
  }

  render();

  const nst = dayState(t);
  if(nst.kind === "met" && delta > 0){
    const s = streak();
    toast(s > 1 ? "今天全部达标 · 连续 " + s + " 天" : "今天全部达标");
  }
});

$("btn-add").onclick = openModal;
$("btn-create").onclick = openModal;
$("btn-demo").onclick = seedDemo;

$("btn-reset").onclick = () => {
  if(!confirm("清空所有目标和记录？这个操作不可撤销。")) return;
  S = { goals: [], focus: null };
  save(); render(); toast("已清空");
};

/* ---------- modal ---------- */
let mode = "once";
let offDays = [6]; // 默认周日休息

function buildDow(){
  const host = $("dow");
  host.innerHTML = "";
  WEEK_CN.forEach((w, i) => {
    const b = document.createElement("button");
    b.textContent = w;
    b.className = offDays.includes(i) ? "on" : "";
    b.onclick = () => {
      if(offDays.includes(i)){
        if(offDays.length >= 6){ toast("至少留一天推进"); return; }
        offDays = offDays.filter(x => x !== i);
      } else {
        offDays.push(i);
      }
      buildDow(); updatePreview();
    };
    host.appendChild(b);
  });
}

function openModal(){
  $("scrim").classList.add("on");
  $("f-title").value = "";
  $("f-total").value = "";
  $("f-unit").value = "";
  $("f-deadline").value = addDays(todayKey(), 60);
  $("f-perday").value = "";
  $("f-unit2").value = "";
  $("f-days").value = 30;
  offDays = [6];
  setMode("once");
  buildDow();
  updatePreview();
  setTimeout(() => $("f-title").focus(), 120);
}

function setMode(m){
  mode = m;
  document.querySelectorAll(".seg button").forEach(b => {
    b.classList.toggle("on", b.dataset.mode === m);
  });
  $("pane-once").classList.toggle("hidden", m !== "once");
  $("pane-daily").classList.toggle("hidden", m !== "daily");
  updatePreview();
}

document.querySelectorAll(".seg button").forEach(b => {
  b.onclick = () => setMode(b.dataset.mode);
});

function previewData(){
  const t = todayKey();
  const off = offDays;
  if(mode === "once"){
    const total = parseInt($("f-total").value, 10);
    const deadline = $("f-deadline").value;
    const unit = $("f-unit").value.trim() || "单位";
    if(!total || total <= 0 || !deadline) return null;
    if(deadline <= t) return { err: "截止日必须在今天之后。" };
    const rd = workDaysInRange(t, deadline, off).length;
    if(rd <= 0) return { err: "这段时间里没有可用推进日。" };
    return { total, deadline, unit, rd, per: Math.ceil(total / rd), title: $("f-title").value.trim() };
  } else {
    const per = parseInt($("f-perday").value, 10);
    const days = parseInt($("f-days").value, 10);
    const unit = $("f-unit2").value.trim() || "单位";
    if(!per || per <= 0 || !days || days <= 0) return null;
    // 从今天起算 days 个推进日
    let cnt = 0, cur = t, end = t, guard = 0;
    while(cnt < days && guard++ < 4000){
      if(!off.includes(dowOf(cur))) cnt++;
      if(cnt < days) cur = addDays(cur, 1);
      end = cur;
    }
    return { total: per * days, deadline: end, unit, rd: days, per, title: $("f-title").value.trim() };
  }
}

function updatePreview(){
  const d = previewData();
  const box = $("preview");
  if(!d){ box.innerHTML = "填完自动算给你看。"; return; }
  if(d.err){ box.innerHTML = '<span style="color:var(--bad)">' + d.err + "</span>"; return; }
  box.innerHTML = "接下来 <b>" + d.rd + "</b> 个推进日，每天大约 <b>" + d.per + "</b> " +
    esc(d.unit) + "。<br>今天开始，第一格就是 <b>" + d.per + "</b>。";
}

["f-total","f-deadline","f-unit","f-perday","f-unit2","f-days"].forEach(id => {
  const el = $(id);
  if(el) el.addEventListener("input", updatePreview);
});

$("m-cancel").onclick = () => $("scrim").classList.remove("on");
$("scrim").onclick = (e) => { if(e.target === $("scrim")) $("scrim").classList.remove("on"); };

$("m-save").onclick = () => {
  const d = previewData();
  if(!d){ toast("先把必填项填完"); return; }
  if(d.err){ toast(d.err); return; }
  if(!d.title){ toast("给目标起个名字"); $("f-title").focus(); return; }

  const g = {
    id: uid(),
    title: d.title,
    unit: d.unit,
    total: d.total,
    start: todayKey(),
    deadline: d.deadline,
    daysOff: offDays.slice().sort(),
    log: {},
    createdAt: new Date().toISOString()
  };
  S.goals.push(g);
  S.focus = g.id;
  save();
  $("scrim").classList.remove("on");
  render();
  toast("已创建 · 今天 " + d.per + " " + d.unit);
};

/* ---------- toast ---------- */
let toastTimer = null;
function toast(msg){
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("on"), 2400);
}

/* ---------- 分享卡片 ---------- */
const CN_F = "'PingFang SC','Hiragino Sans GB','Microsoft YaHei',system-ui,sans-serif";
const MONO_F = "'SF Mono',Menlo,Consolas,monospace";
let shareCanvas = null;

function rr(c, x, y, w, h, r){
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function wrapText(c, text, x, y, maxW, lh, maxLines){
  const chars = Array.from(text);
  const lines = [];
  let line = "";
  chars.forEach(ch => {
    if(c.measureText(line + ch).width > maxW && line){ lines.push(line); line = ch; }
    else line += ch;
  });
  if(line) lines.push(line);
  const show = lines.slice(0, maxLines || 2);
  if(lines.length > show.length) show[show.length-1] = show[show.length-1].slice(0, -1) + "…";
  show.forEach((ln, i) => c.fillText(ln, x, y + i * lh));
  return show.length;
}

function drawMiniBurn(c, g, x0, y0, w, h){
  const span = Math.max(1, daysBetween(g.start, g.deadline));
  const t = todayKey();
  const X = d => x0 + (daysBetween(g.start, d) / span) * w;
  const Y = v => y0 + (1 - Math.max(0, Math.min(v, g.total)) / g.total) * h;

  c.strokeStyle = "rgba(255,255,255,0.07)";
  c.lineWidth = 1;
  [0, g.total].forEach(v => {
    c.beginPath(); c.moveTo(x0, Y(v)); c.lineTo(x0 + w, Y(v)); c.stroke();
  });

  c.setLineDash([7, 8]);
  c.strokeStyle = "rgba(255,255,255,0.22)";
  c.lineWidth = 2;
  c.beginPath(); c.moveTo(X(g.start), Y(g.total)); c.lineTo(X(g.deadline), Y(0)); c.stroke();
  c.setLineDash([]);

  const last = t > g.deadline ? g.deadline : (t < g.start ? g.start : t);
  const n = Math.max(1, daysBetween(g.start, last));
  c.strokeStyle = "#ff9f43";
  c.lineWidth = 4;
  c.lineJoin = "round";
  c.lineCap = "round";
  c.beginPath();
  for(let i = 0; i <= n; i++){
    const d = addDays(g.start, i);
    const px = X(d), py = Y(g.total - doneThrough(g, d));
    i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
  }
  c.stroke();

  const endD = addDays(g.start, n);
  c.fillStyle = "#ffcb6b";
  c.beginPath();
  c.arc(X(endD), Y(g.total - doneThrough(g, endD)), 7, 0, Math.PI * 2);
  c.fill();
}

function buildShareCanvas(){
  const g = S.goals.find(x => x.id === S.focus) || visibleGoals()[0];
  if(!g) return null;

  const W = 900, H = 1200, PAD = 68;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  const t = todayKey();

  // 底 + 光晕
  c.fillStyle = "#0a0908"; c.fillRect(0, 0, W, H);
  const glow = c.createRadialGradient(W * 0.18, -120, 0, W * 0.18, -120, 1100);
  glow.addColorStop(0, "rgba(255,159,67,0.20)");
  glow.addColorStop(1, "rgba(255,159,67,0)");
  c.fillStyle = glow; c.fillRect(0, 0, W, H);
  c.strokeStyle = "rgba(255,255,255,0.08)"; c.lineWidth = 2;
  c.strokeRect(1, 1, W - 2, H - 2);

  // 品牌
  c.fillStyle = "#ff9f43";
  rr(c, PAD, 60, 32, 32, 10); c.fill();
  c.fillStyle = "#1b1208";
  c.beginPath(); c.arc(PAD + 16, 76, 5.5, 0, Math.PI * 2); c.fill();

  c.textBaseline = "middle";
  c.fillStyle = "#f4f0e9";
  c.font = "600 28px " + CN_F;
  c.fillText("Backcast", PAD + 46, 76);

  c.fillStyle = "#615b52";
  c.font = "400 17px " + MONO_F;
  c.textAlign = "right";
  c.fillText(t, W - PAD, 76);
  c.textAlign = "left";

  // 目标名
  c.textBaseline = "alphabetic";
  c.fillStyle = "#615b52";
  c.font = "400 16px " + MONO_F;
  c.fillText("TARGET", PAD, 192);
  c.fillStyle = "#f4f0e9";
  c.font = "600 38px " + CN_F;
  wrapText(c, g.title, PAD, 246, W - PAD * 2, 54, 2);

  // 目标元信息 —— 填掉标题和配额之间的空档，也让数据更完整
  c.fillStyle = "#7d766a";
  c.font = "400 20px " + CN_F;
  {
    const left = Math.max(0, daysBetween(t, g.deadline));
    const rd = workDaysInRange(t, g.deadline, g.daysOff).length;
    const parts = [g.total + " " + g.unit, "距截止 " + left + " 天", rd + " 个推进日"];
    if(g.daysOff.length){
      parts.push("每周休 " + g.daysOff.map(i => "周" + WEEK_CN[i]).join("、"));
    }
    c.fillText(parts.join("  ·  "), PAD, 304);
  }

  // 今日配额
  const q = quotaForDate(g, t) || tomorrowQuota(g) || 0;
  c.fillStyle = "#615b52";
  c.font = "400 16px " + MONO_F;
  c.fillText("TODAY'S QUOTA", PAD, 404);

  c.fillStyle = "#ffcb6b";
  c.font = "700 146px " + CN_F;
  const qs = String(q);
  c.fillText(qs, PAD - 4, 546);
  const qw = c.measureText(qs).width;

  c.fillStyle = "#a29b8d";
  c.font = "400 36px " + CN_F;
  c.fillText(g.unit, PAD + qw + 16, 542);

  c.fillStyle = "#615b52";
  c.font = "400 21px " + CN_F;
  c.fillText("今天必须做完的分量", PAD, 600);

  c.strokeStyle = "rgba(255,255,255,0.09)";
  c.lineWidth = 1;
  c.beginPath(); c.moveTo(PAD, 664); c.lineTo(W - PAD, 664); c.stroke();

  // 三格数据
  const st = streak();
  const f = forecast(g);
  const pct = Math.round(doneTotal(g) / g.total * 100);
  let verdict = "—", vcolor = "#f4f0e9";
  if(f.state === "run"){
    if(f.gap > 0){ verdict = "晚 " + f.gap + " 天"; vcolor = "#ff6b6b"; }
    else if(f.gap < 0){ verdict = "提前 " + (-f.gap) + " 天"; vcolor = "#5ddc8a"; }
    else { verdict = "压线"; vcolor = "#ffcb6b"; }
  } else if(f.state === "done"){ verdict = "已完成"; vcolor = "#5ddc8a"; }

  const cw = (W - PAD * 2) / 3;
  [
    { k: "连续", v: String(st) },
    { k: "总进度", v: pct + "%" },
    { k: "当前速度", v: verdict, col: vcolor }
  ].forEach((o, i) => {
    const x0 = PAD + i * cw;
    c.fillStyle = "#615b52";
    c.font = "400 16px " + MONO_F;
    c.fillText(o.k, x0, 716);
    c.fillStyle = o.col || "#f4f0e9";
    c.font = "600 42px " + CN_F;
    c.fillText(o.v, x0, 774);
  });

  drawMiniBurn(c, g, PAD, 840, W - PAD * 2, 180);

  // 底部
  c.fillStyle = "#615b52";
  c.font = "400 18px " + CN_F;
  c.fillText("从终点往回走 · 今天只需要走一步", PAD, 1116);

  c.textAlign = "right";
  c.fillStyle = "#ff9f43";
  c.font = "500 18px " + CN_F;
  {
    const tag = ($("share-tag").value || "").trim();
    let bottomTag = "#Backcast" + (tag ? "  " + tag : "");
    if(c.measureText(bottomTag).width > 380){
      let cut = tag;
      while(cut.length > 0 && c.measureText("#Backcast  " + cut + "…").width > 380){
        cut = cut.slice(0, -1);
      }
      bottomTag = "#Backcast" + (cut ? "  " + cut + "…" : "");
    }
    c.fillText(bottomTag, W - PAD, 1116);
  }
  c.textAlign = "left";

  return cv;
}

function shareText(){
  const g = S.goals.find(x => x.id === S.focus) || visibleGoals()[0];
  if(!g) return "";
  const t = todayKey();
  const q = quotaForDate(g, t) || tomorrowQuota(g) || 0;
  const st = streak();
  const f = forecast(g);
  const pct = Math.round(doneTotal(g) / g.total * 100);
  const tag = ($("share-tag").value || "").trim();

  let mid;
  if(f.state === "done") mid = "已经走完了，总进度 100%。";
  else if(f.state === "run" && f.gap > 0) mid = "按现在的速度，我会晚 " + f.gap + " 天 —— 但至少我知道晚了几天。";
  else if(f.state === "run" && f.gap < 0) mid = "按现在的速度，我能提前 " + (-f.gap) + " 天做完。";
  else if(f.state === "run") mid = "按现在的速度，刚好压线。";
  else mid = "还在路上，总进度 " + pct + "%。";

  const lines = [
    "我把「" + g.title + "」的 " + g.total + " " + g.unit + "，",
    "拆成了今天必须做完的 " + q + " " + g.unit + "。",
    ""
  ];
  if(st > 0) lines.push("连续第 " + st + " 天。");
  lines.push(mid, "", "用 Backcast 从截止日往回倒推。");
  lines.push("#Backcast #习惯养成 #倒推计划" + (tag ? " " + tag : ""));
  return lines.join("\n");
}

$("btn-share").onclick = () => {
  shareCanvas = buildShareCanvas();
  if(!shareCanvas){ toast("先创建一个目标再分享"); return; }
  $("share-img").src = shareCanvas.toDataURL("image/png");
  $("share-scrim").classList.add("on");
};

$("share-scrim").onclick = (e) => {
  if(e.target === $("share-scrim")) $("share-scrim").classList.remove("on");
};

// 改话题 → 卡片底部同步重绘
$("share-tag").addEventListener("input", () => {
  shareCanvas = buildShareCanvas();
  if(shareCanvas) $("share-img").src = shareCanvas.toDataURL("image/png");
});

$("share-download").onclick = () => {
  if(!shareCanvas) return;
  shareCanvas.toBlob(blob => {
    if(!blob){ toast("导出失败"); return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backcast-" + todayKey() + ".png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, "image/png");
  toast("图片已保存");
};

$("share-copy").onclick = async () => {
  const txt = shareText();
  try{
    await navigator.clipboard.writeText(txt);
    toast("文案已复制");
  }catch(e){
    const ta = document.createElement("textarea");
    ta.value = txt;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand("copy"); toast("文案已复制"); }
    catch(err){ toast("复制失败，请手动选中"); }
    ta.remove();
  }
};

$("btn-help").onclick = () => {
  const el = $("howto");
  if(el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  else toast("先创建一个目标，说明在页面底部");
};

/* ---------- 示例数据 ---------- */
// 造一个「一好一坏」的局面：一个目标在追，一个刚好压线。
// 演示时讲得清楚，也看得出诊断逻辑真的在算。
function seedDemo(){
  const t = todayKey();
  const start = addDays(t, -20);

  const g1 = {
    id: uid(),
    title: "读完《思考，快与慢》",
    unit: "页", total: 720,
    start, deadline: addDays(t, 18),
    daysOff: [6], log: {},
    createdAt: new Date().toISOString()
  };
  const g2 = {
    id: uid(),
    title: "论文初稿",
    unit: "字", total: 11000,
    start, deadline: addDays(t, 35),
    daysOff: [5, 6], log: {},
    createdAt: new Date().toISOString()
  };

  const p1 = [18,22,14,26,12,20,16,24,8,19,21,15,23,17,12,25,16,20,18,22];
  const p2 = [300,320,280,310,300,290,340,300,310,280,300,320,300,290,310,300,280,330,300,310];
  let i1 = 0, i2 = 0;

  for(let i = 0; i < 20; i++){
    const d = addDays(start, i);
    if(!g1.daysOff.includes(dowOf(d))) g1.log[d] = p1[i1++ % p1.length];
    if(!g2.daysOff.includes(dowOf(d))) g2.log[d] = p2[i2++ % p2.length];
  }

  // 把最近若干个推进日补到达标，让示例带着一段真实的连胜进来
  function topUp(g, n){
    const ds = workDaysInRange(addDays(t, -n*2 - 4), addDays(t, -1), g.daysOff).slice(-n);
    ds.forEach(d => {
      const q = quotaForDate(g, d);
      if(q > 0 && (g.log[d] || 0) < q) g.log[d] = Math.ceil(q * 1.15);
    });
  }
  topUp(g1, 5);
  topUp(g2, 5);

  S.goals = [g1, g2];
  S.focus = g1.id;
  save();
  render();
  toast("示例已加载 · 点右上角 ⋯ 可清空");
}

/* ---------- 主题 ---------- */
// 组件全部走 CSS 变量，所以切换只需要换根节点上的 data-theme，
// 图表、热力图、弹层会自动跟着变，不用重绘。
const THEME_KEY = "backcast.theme";

// 用 SVG 而不是 ☀/☾ 字形：小字号下那些符号细得几乎看不见
const ICON_SUN = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.1M12 19.3v2.1M4.3 4.3l1.5 1.5M18.2 18.2l1.5 1.5M2.6 12h2.1M19.3 12h2.1M4.3 19.7l1.5-1.5M18.2 5.8l1.5-1.5"/></svg>';
const ICON_MOON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20.6 14.3A8.7 8.7 0 1 1 9.7 3.4a6.9 6.9 0 0 0 10.9 10.9z"/></svg>';

function applyTheme(t, persist){
  document.documentElement.dataset.theme = t;
  const b = $("btn-theme");
  if(b){
    b.innerHTML = t === "dark" ? ICON_SUN : ICON_MOON;
    b.title = t === "dark" ? "切到浅色模式" : "切到深色模式";
    b.setAttribute("aria-label", b.title);
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute("content", t === "dark" ? "#0a0908" : "#faf7f2");
  if(persist){
    try{ localStorage.setItem(THEME_KEY, t); }catch(e){}
  }
}

function initTheme(){
  let saved = null;
  try{ saved = localStorage.getItem(THEME_KEY); }catch(e){}
  if(saved === "light" || saved === "dark"){ applyTheme(saved, false); return; }
  let sysDark = true;
  try{ sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches; }catch(e){}
  applyTheme(sysDark ? "dark" : "light", false);
}

$("btn-theme").onclick = () => {
  const cur = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  applyTheme(cur === "light" ? "dark" : "light", true);
};

/* ---------- 启动 ---------- */
initTheme();
load();
render();

// 跨天自动刷新
let lastDay = todayKey();
setInterval(() => {
  if(todayKey() !== lastDay){ lastDay = todayKey(); render(); }
}, 60000);

// Esc 关弹窗
document.addEventListener("keydown", e => {
  if(e.key === "Escape") $("scrim").classList.remove("on");
});
