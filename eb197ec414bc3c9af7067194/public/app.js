
import { ReportService, LocalStore } from "./report-core.mjs";
import { IDX, BONES, JOINTS, METRICS, LEVELS, computeFeatures, scoreFeatures, looksHuman, trackSpread } from "./pose-core.mjs";
const style=document.createElement("style");style.textContent="\n:root{\n  --bg:#070c18; --bg2:#0c1322;\n  --panel:rgba(255,255,255,.045); --panel2:rgba(255,255,255,.08);\n  --line:rgba(255,255,255,.10); --line2:rgba(255,255,255,.18);\n  --txt:#e9eef8; --dim:#8b98b2; --mute:#5d6a83;\n  --good:#2ee6a8; --fair:#9be15d; --warn:#ffb340; --bad:#ff5c72; --info:#5b8cff;\n  --r:16px; --ring:#2ee6a8;\n  --shadow:0 10px 34px rgba(0,0,0,.42);\n}\n*{box-sizing:border-box;margin:0;padding:0}\nhtml,body{height:100%}\nbody{\n  background:\n    radial-gradient(1100px 620px at 12% -12%, rgba(91,140,255,.16), transparent 60%),\n    radial-gradient(900px 560px at 96% 8%, rgba(46,230,168,.12), transparent 62%),\n    linear-gradient(180deg,var(--bg),var(--bg2) 55%,#0a101d);\n  color:var(--txt);\n  font:15px/1.55 -apple-system,BlinkMacSystemFont,\"SF Pro Text\",\"PingFang SC\",\"Microsoft YaHei\",system-ui,sans-serif;\n  -webkit-font-smoothing:antialiased;\n  padding:14px clamp(10px,2.2vw,26px) 26px;\n  min-height:100vh;\n}\n.app{max-width:1420px;margin:0 auto}\nh1{font-size:17px;font-weight:650;letter-spacing:.2px}\nh2{font-size:13px;font-weight:640;color:var(--dim);letter-spacing:.4px;text-transform:uppercase}\n.mono{font-variant-numeric:tabular-nums;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}\n\n/* ---------- 顶栏 ---------- */\n.topbar{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:6px 2px 14px}\n.brand{display:flex;align-items:center;gap:10px}\n.logo{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;font-size:18px;\n  background:linear-gradient(150deg,#1b2a4a,#0f1a30);border:1px solid var(--line2)}\n.brand small{display:block;font-size:11px;color:var(--mute);font-weight:500}\n.topbar .grow{flex:1}\n.pill{display:inline-flex;align-items:center;gap:7px;padding:6px 12px;border-radius:999px;\n  background:var(--panel);border:1px solid var(--line);font-size:12.5px;color:var(--dim);white-space:nowrap}\n.dot{width:8px;height:8px;border-radius:50%;background:var(--mute);flex:none}\n.dot.on{background:var(--good);box-shadow:0 0 0 3px rgba(46,230,168,.16)}\n.dot.warn{background:var(--warn)}\n.dot.bad{background:var(--bad)}\n.btn{appearance:none;border:1px solid var(--line2);background:var(--panel);color:var(--txt);\n  padding:9px 15px;border-radius:11px;font-size:13.5px;font-weight:560;cursor:pointer;\n  transition:.16s ease;display:inline-flex;align-items:center;gap:7px;white-space:nowrap}\n.btn:hover{background:var(--panel2);transform:translateY(-1px)}\n.btn:active{transform:translateY(0)}\n.btn.primary{background:linear-gradient(150deg,#2ee6a8,#12b981);color:#04241a;border-color:transparent;font-weight:680}\n.btn.primary:hover{filter:brightness(1.07)}\n.btn.ghost{background:transparent}\n.btn.sm{padding:6px 11px;font-size:12.5px;border-radius:9px}\n.btn[disabled]{opacity:.42;pointer-events:none}\n.btn.stop{background:linear-gradient(150deg,#ff6d81,#e5484d);color:#2a0409;border-color:transparent;font-weight:680}\n\n/* ---------- 布局 ---------- */\n.grid{display:grid;grid-template-columns:minmax(0,1.42fr) minmax(320px,.88fr);gap:16px;align-items:start}\n@media(max-width:960px){.grid{grid-template-columns:minmax(0,1fr)}}\n.card{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow)}\n.card .hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 16px;border-bottom:1px solid var(--line)}\n.card .hd h2{letter-spacing:.6px}\n.card .bd{padding:16px}\n\n/* ---------- 摄像区 ---------- */\n.stage-wrap{min-width:0}\n.stage{position:relative;width:100%;aspect-ratio:4/3;background:#04070e;border-radius:var(--r);\n  overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow)}\n.stage video,.stage canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}\n.stage.mirror video,.stage.mirror canvas{transform:scaleX(-1)}\n#overlay{pointer-events:none}\n.stage .vig{position:absolute;inset:0;pointer-events:none;\n  background:radial-gradient(120% 100% at 50% 45%, transparent 55%, rgba(0,0,0,.5))}\n.hud{position:absolute;inset:auto 12px 12px 12px;display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;pointer-events:none}\n.hint-chip{background:rgba(6,10,20,.78);backdrop-filter:blur(9px);border:1px solid var(--line2);\n  border-radius:13px;padding:10px 14px;max-width:100%;font-size:13.5px;line-height:1.5;color:var(--txt)}\n.hint-chip b{color:var(--warn);font-weight:660}\n.stage-tag{position:absolute;top:12px;left:12px;display:flex;gap:8px;flex-wrap:wrap}\n.tag{font-size:11.5px;padding:5px 10px;border-radius:8px;background:rgba(6,10,20,.7);\n  border:1px solid var(--line2);color:var(--dim);backdrop-filter:blur(8px)}\n.tag b{color:var(--txt);font-weight:640}\n.tag.cal{color:#04241a;background:var(--good);border-color:transparent;font-weight:680}\n.stage-empty{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:24px;\n  background:linear-gradient(160deg,rgba(12,19,34,.9),rgba(4,7,14,.94))}\n.stage-empty.hide{display:none}\n.stage-empty .ic{font-size:44px;margin-bottom:10px;opacity:.85}\n.stage-empty p{color:var(--dim);font-size:13.5px;max-width:430px;margin:0 auto 14px}\n.stage-empty code{background:var(--panel2);padding:2px 6px;border-radius:6px;font-size:12px}\n.err-box{background:rgba(255,92,114,.1);border:1px solid rgba(255,92,114,.36);border-radius:12px;\n  padding:12px 14px;font-size:13px;color:#ffc9d1;max-width:520px;margin:0 auto;text-align:left;white-space:pre-wrap;word-break:break-word}\n.stage-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:12px 2px 0}\n.stage-bar .grow{flex:1}\nselect,input[type=number]{appearance:none;background:var(--panel);border:1px solid var(--line2);color:var(--txt);\n  padding:7px 10px;border-radius:9px;font-size:13px;font-family:inherit}\nselect:focus,input:focus{outline:none;border-color:var(--info)}\n\n/* ---------- 评分卡 ---------- */\n.score-card .bd{display:flex;gap:18px;align-items:center;flex-wrap:wrap}\n.ring-wrap{position:relative;width:128px;height:128px;flex:none}\n.ring-wrap svg{width:100%;height:100%;transform:rotate(-90deg)}\n.ring-wrap .bgc{fill:none;stroke:rgba(255,255,255,.08);stroke-width:11}\n.ring-wrap .fgc{fill:none;stroke:var(--ring);stroke-width:11;stroke-linecap:round;\n  transition:stroke-dashoffset .5s cubic-bezier(.22,1,.36,1),stroke .4s}\n.ring-txt{position:absolute;inset:0;display:grid;place-content:center;text-align:center}\n.ring-txt .n{font-size:34px;font-weight:740;line-height:1;letter-spacing:-.5px}\n.ring-txt .u{font-size:11px;color:var(--mute);margin-top:3px;letter-spacing:1px}\n.score-main{flex:1;min-width:180px}\n.level{display:inline-flex;align-items:center;gap:8px;font-size:19px;font-weight:720;letter-spacing:.4px}\n.level .lv-dot{width:11px;height:11px;border-radius:50%;background:var(--ring);box-shadow:0 0 12px var(--ring)}\n.score-msg{color:var(--dim);font-size:13.5px;margin-top:7px;line-height:1.6}\n.conf{font-size:11.5px;color:var(--mute);margin-top:9px}\n\n/* ---------- 指标条 ---------- */\n.metric{margin-bottom:11px}\n.metric:last-child{margin-bottom:0}\n.metric .row{display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px}\n.metric .row .k{color:var(--dim)}\n.metric .row .v{font-weight:600}\n.bar{height:6px;border-radius:99px;background:rgba(255,255,255,.07);overflow:hidden;position:relative}\n.bar i{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:var(--good);transition:width .3s,background .3s}\n.bar .base{display:none}\n.metric.off{opacity:.34}\n\n/* ---------- 久坐计时 ---------- */\n.timer-big{font-size:42px;font-weight:740;letter-spacing:-1px;line-height:1;font-variant-numeric:tabular-nums}\n.timer-big small{font-size:15px;color:var(--mute);font-weight:560;letter-spacing:0}\n.timer-sub{display:flex;gap:14px;flex-wrap:wrap;margin-top:12px;font-size:12.5px;color:var(--dim)}\n.timer-sub b{color:var(--txt)}\n.prog{height:7px;border-radius:99px;background:rgba(255,255,255,.07);overflow:hidden;margin-top:13px}\n.prog i{display:block;height:100%;background:linear-gradient(90deg,#2ee6a8,#5b8cff);border-radius:99px;transition:width .6s linear}\n.prog.break i{background:linear-gradient(90deg,#ffb340,#ff8a5c)}\n.timer-btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}\n.badge{display:inline-block;font-size:11px;padding:3px 8px;border-radius:7px;background:var(--panel2);\n  border:1px solid var(--line);color:var(--dim);letter-spacing:.3px}\n.badge.g{color:var(--good);border-color:rgba(46,230,168,.3)}\n.badge.w{color:var(--warn);border-color:rgba(255,179,64,.3)}\n.badge.b{color:var(--bad);border-color:rgba(255,92,114,.3)}\n\n/* ---------- 图表 ---------- */\n.bottom{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(280px,1fr);gap:16px;margin-top:16px}\n@media(max-width:960px){.bottom{grid-template-columns:minmax(0,1fr)}}\n.chart-box{position:relative;width:100%;height:170px}\n.chart-box canvas{width:100%;height:100%;display:block}\n.legend{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--dim);margin-top:8px}\n.legend i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:5px;vertical-align:middle}\n.stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}\n.stat{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:11px 13px}\n.stat .l{font-size:11.5px;color:var(--mute);letter-spacing:.3px}\n.stat .n{font-size:21px;font-weight:700;margin-top:3px;font-variant-numeric:tabular-nums}\n.stat .n small{font-size:12px;color:var(--mute);font-weight:560}\n\n/* ---------- 弹窗 ---------- */\ndialog{border:none;border-radius:18px;padding:0;background:#0e1524;color:var(--txt);\n  box-shadow:0 24px 80px rgba(0,0,0,.6);max-width:min(560px,94vw);width:100%}\ndialog::backdrop{background:rgba(3,6,12,.66);backdrop-filter:blur(4px)}\n.dlg-hd{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--line)}\n.dlg-hd h3{font-size:15.5px;font-weight:680}\n.dlg-bd{padding:6px 18px 18px;max-height:70vh;overflow:auto}\n.frow{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 0;border-bottom:1px solid var(--line)}\n.frow:last-child{border-bottom:none}\n.frow .fl{font-size:13.5px}\n.frow .fl small{display:block;color:var(--mute);font-size:11.5px;margin-top:2px;line-height:1.45}\n.frow .fr{flex:none;display:flex;align-items:center;gap:8px}\n.sw{position:relative;width:42px;height:24px;border-radius:99px;background:rgba(255,255,255,.13);cursor:pointer;transition:.2s;flex:none;border:none}\n.sw::after{content:\"\";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:.2s}\n.sw.on{background:var(--good)}\n.sw.on::after{transform:translateX(18px)}\n.seg{display:flex;background:var(--panel);border:1px solid var(--line2);border-radius:10px;padding:3px;gap:2px}\n.seg button{appearance:none;border:none;background:transparent;color:var(--dim);font:inherit;font-size:12.5px;\n  padding:5px 11px;border-radius:7px;cursor:pointer;transition:.15s}\n.seg button.on{background:var(--panel2);color:var(--txt);font-weight:620}\n.range{width:130px;accent-color:#2ee6a8}\n.note{font-size:12px;color:var(--mute);line-height:1.65;padding:10px 0 0}\n.note b{color:var(--dim)}\n.help-item{padding:9px 0;border-bottom:1px solid var(--line);font-size:13px;line-height:1.65}\n.help-item:last-child{border:none}\n.help-item b{color:var(--txt)}\n.help-item .em{color:var(--warn)}\n\n/* ---------- 校准遮罩 ---------- */\n.cal-mask{position:absolute;inset:0;display:none;place-content:center;text-align:center;\n  background:rgba(4,8,16,.82);backdrop-filter:blur(3px);z-index:5}\n.cal-mask.show{display:grid}\n.cal-mask .big{font-size:52px;font-weight:780;font-variant-numeric:tabular-nums;line-height:1.1}\n.cal-mask p{color:var(--dim);font-size:14px;margin-top:8px}\n\n/* ---------- 休息遮罩 ---------- */\n.brk-mask{position:absolute;inset:0;display:none;place-content:center;text-align:center;\n  background:rgba(4,10,14,.9);backdrop-filter:blur(7px);z-index:6;padding:22px}\n.brk-mask.show{display:grid}\n.brk-mask .ic{font-size:46px}\n.brk-mask h3{font-size:23px;font-weight:740;margin:10px 0 6px}\n.brk-mask .cd{font-size:44px;font-weight:760;font-variant-numeric:tabular-nums;color:var(--warn)}\n.brk-mask p{color:var(--dim);font-size:13.5px;max-width:400px;margin:8px auto 0;line-height:1.7}\n.brk-mask .tips{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:14px}\n.brk-mask .tips span{font-size:12px;padding:5px 11px;border-radius:99px;background:var(--panel2);border:1px solid var(--line2)}\n.brk-btns{display:flex;gap:9px;justify-content:center;margin-top:18px;flex-wrap:wrap}\n\n.toast{position:fixed;left:50%;bottom:26px;transform:translate(-50%,20px);opacity:0;pointer-events:none;\n  background:#131c2e;border:1px solid var(--line2);border-radius:12px;padding:11px 17px;font-size:13.5px;\n  box-shadow:var(--shadow);transition:.28s cubic-bezier(.22,1,.36,1);z-index:60;max-width:88vw}\n.toast.show{opacity:1;transform:translate(-50%,0)}\n.foot{text-align:center;color:var(--mute);font-size:11.5px;margin-top:20px;line-height:1.7}\n.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}\n\n/* ---------- 报告 ---------- */\n#dlgReport{max-width:min(820px,96vw)}\n.ins-list{list-style:none;display:grid;gap:7px;font-size:13.5px}\n.ins-list li{padding:8px 11px;border-radius:10px;background:var(--panel);border:1px solid var(--line)}\n.store-err{margin-top:10px;padding:9px 12px;border-radius:10px;background:rgba(255,92,114,.12);border:1px solid rgba(255,92,114,.4);color:#ffc9d1;font-size:13px}\n.store-err:empty{display:none}\n.rp-bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:12px 0}\n.rp-bar .grow{flex:1}\n.seg button:focus-visible,.btn:focus-visible{outline:2px solid var(--info);outline-offset:2px}\n.rp-chart{position:relative;width:100%;height:200px;margin:6px 0 10px}\n.rp-chart canvas{width:100%;height:100%;display:block}\n.rp-warn{font-size:12.5px;color:var(--warn);margin:6px 0}\n.rp-table{width:100%;border-collapse:collapse;font-size:12.5px}\n.rp-table th,.rp-table td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:right}\n.rp-table th:first-child,.rp-table td:first-child{text-align:left}\n.rp-table th{color:var(--mute);font-weight:560}\n.iss{display:flex;align-items:center;gap:8px;font-size:12.5px;margin:5px 0}\n.iss span:first-child{width:76px;color:var(--dim)}\n.iss .bar{flex:1}\n";document.head.appendChild(style);document.getElementById("app").outerHTML="\n<div class=\"app\">\n\n  <header class=\"topbar\">\n    <div class=\"brand\">\n      <div class=\"logo\">🧘</div>\n      <div>\n        <h1>PostureGuard</h1>\n        <small>姿势矫正 · 久坐提醒 · 全程本地推理</small>\n      </div>\n    </div>\n    <div class=\"grow\"></div>\n    <div class=\"pill\" id=\"statusPill\"><span class=\"dot\" id=\"statusDot\"></span><span id=\"statusTxt\">未启动</span></div>\n    <button class=\"btn ghost sm\" id=\"btnReport\">查看报告</button>\n    <button class=\"btn ghost sm\" id=\"btnHelp\">使用说明</button>\n    <button class=\"btn ghost sm\" id=\"btnSettings\">⚙ 设置</button>\n  </header>\n\n  <div class=\"grid\">\n    <!-- 摄像区 -->\n    <section class=\"stage-wrap\">\n      <div class=\"stage mirror\" id=\"stage\">\n        <video id=\"video\" playsinline muted autoplay></video>\n        <canvas id=\"overlay\"></canvas>\n        <div class=\"vig\"></div>\n        <div class=\"stage-tag\">\n          <span class=\"tag\" id=\"tagFps\"><b>—</b> FPS</span>\n          <span class=\"tag\" id=\"tagYaw\">朝向 <b>—</b></span>\n          <span class=\"tag\" id=\"tagPres\">—</span>\n        </div>\n        <div class=\"cal-mask\" id=\"calMask\">\n          <div>\n            <div class=\"big\" id=\"calCount\">3</div>\n            <p>请摆出<b>标准坐姿</b>：腰背挺直、双肩放松下沉、<br>目视前方屏幕、头部居中——保持住</p>\n          </div>\n        </div>\n        <div class=\"brk-mask\" id=\"brkMask\">\n          <div>\n            <div class=\"ic\" id=\"brkIcon\">🧍</div>\n            <h3 id=\"brkTitle\">该起来活动了</h3>\n            <div class=\"cd mono\" id=\"brkCd\">5:00</div>\n            <p id=\"brkMsg\">起身接杯水、望望窗外远处。检测到您离开座位会自动记为有效休息。</p>\n            <div class=\"tips\">\n              <span>🚶 走动 60 秒</span><span>💧 喝口水</span><span>👀 远眺 20 秒</span><span>🤸 扩胸 + 转颈</span>\n            </div>\n            <div class=\"brk-btns\">\n              <button class=\"btn primary\" id=\"brkDone\">我休息好了</button>\n              <button class=\"btn ghost\" id=\"brkSnooze\">再坐 5 分钟</button>\n            </div>\n          </div>\n        </div>\n        <div class=\"stage-empty\" id=\"stageEmpty\">\n          <div>\n            <div class=\"ic\">🎥</div>\n            <p id=\"emptyMsg\">点击「开始监测」授权摄像头后即可实时检测坐姿。<br>画面<b style=\"color:var(--txt)\">仅在本机处理</b>，不上传视频画面。</p>\n            <div id=\"errBox\"></div>\n            <button class=\"btn primary\" id=\"btnStartEmpty\">开始监测</button>\n          </div>\n        </div>\n        <div class=\"hud\">\n          <div class=\"hint-chip\" id=\"hintChip\" style=\"display:none\"></div>\n        </div>\n      </div>\n\n      <div class=\"stage-bar\">\n        <button class=\"btn primary\" id=\"btnStart\">▶ 开始监测</button>\n        <button class=\"btn stop\" id=\"btnStop\" disabled>■ 停止</button>\n        <button class=\"btn\" id=\"btnCal\" disabled>◎ 姿态校准</button>\n        <div class=\"grow\"></div>\n        <label style=\"font-size:12.5px;color:var(--mute)\">摄像头</label>\n        <select id=\"camSel\" style=\"max-width:200px\"><option value=\"\">默认摄像头</option></select>\n      </div>\n    </section>\n\n    <!-- 侧栏 -->\n    <aside class=\"side\">\n      <div class=\"card score-card\">\n        <div class=\"hd\"><h2>坐姿评分</h2><span class=\"badge\" id=\"confBadge\">—</span></div>\n        <div class=\"bd\">\n          <div class=\"ring-wrap\">\n            <svg viewBox=\"0 0 120 120\">\n              <circle class=\"bgc\" cx=\"60\" cy=\"60\" r=\"52\"></circle>\n              <circle class=\"fgc\" id=\"ring\" cx=\"60\" cy=\"60\" r=\"52\" stroke-dasharray=\"326.7\" stroke-dashoffset=\"326.7\"></circle>\n            </svg>\n            <div class=\"ring-txt\"><div class=\"n mono\" id=\"scoreN\">—</div><div class=\"u\">SCORE</div></div>\n          </div>\n          <div class=\"score-main\">\n            <div class=\"level\"><span class=\"lv-dot\"></span><span id=\"levelTxt\">待监测</span></div>\n            <div class=\"score-msg\" id=\"scoreMsg\">启动监测并完成校准后，这里会实时给出坐姿建议。</div>\n            <div class=\"conf\" id=\"confTxt\"></div>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"card\" style=\"margin-top:14px\">\n        <div class=\"hd\"><h2>久坐提醒</h2><span class=\"badge\" id=\"phaseBadge\">未开始</span></div>\n        <div class=\"bd\">\n          <div class=\"timer-big\" id=\"seatedTxt\">0:00 <small>/ 45:00</small></div>\n          <div class=\"prog\" id=\"seatedProg\"><i style=\"width:0%\"></i></div>\n          <div class=\"timer-sub\">\n            <span>连续久坐 <b class=\"mono\" id=\"seatStreak\">0分</b></span>\n            <span>今日已休息 <b class=\"mono\" id=\"breakDone\">0</b> 次</span>\n            <span>用眼提醒 <b class=\"mono\" id=\"eyeCnt\">0</b></span>\n          </div>\n          <div class=\"timer-btns\">\n            <button class=\"btn sm\" id=\"btnPauseBreak\" disabled>☕ 现在就休息</button>\n            <button class=\"btn sm ghost\" id=\"btnResetSeat\">清零计时</button>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"card\" style=\"margin-top:14px\">\n        <div class=\"hd\"><h2>姿势指标</h2><span class=\"badge\" id=\"baseBadge\">未校准</span></div>\n        <div class=\"bd\" id=\"metricList\"></div>\n      </div>\n    </aside>\n  </div>\n\n  <section class=\"card\" style=\"margin-top:16px\" aria-label=\"今日洞察\">\n    <div class=\"hd\"><h2>今日洞察</h2><button class=\"btn sm\" id=\"btnReportHome\">打开姿势报告</button></div>\n    <div class=\"bd\"><ul class=\"ins-list\" id=\"todayInsights\"><li>暂无有效监测数据，完成监测后生成洞察。</li></ul>\n      <div class=\"note\">仅依据真实有效样本生成；报告免费直接查看，近 30 天保存在应用数据库。</div>\n      <div class=\"store-err\" id=\"storageError\" role=\"alert\"></div>\n    </div>\n  </section>\n\n  <!-- 底部统计 -->\n  <div class=\"bottom\">\n    <div class=\"card\">\n      <div class=\"hd\"><h2>本次会话 · 坐姿曲线</h2><span style=\"display:flex;gap:7px\"><button class=\"btn sm ghost\" id=\"btnExport\">导出报告</button><button class=\"btn sm ghost\" id=\"btnClear\">清空数据</button></span></div>\n      <div class=\"bd\">\n        <div class=\"chart-box\"><canvas id=\"chart\"></canvas></div>\n        <div class=\"legend\">\n          <span><i style=\"background:var(--good)\"></i>优 ≥85</span>\n          <span><i style=\"background:var(--fair)\"></i>良 70-84</span>\n          <span><i style=\"background:var(--warn)\"></i>需调整 50-69</span>\n          <span><i style=\"background:var(--bad)\"></i>差 &lt;50</span>\n          <span><i style=\"background:#3a455c\"></i>离开座位</span>\n        </div>\n      </div>\n    </div>\n    <div class=\"card\">\n      <div class=\"hd\"><h2>会话统计</h2><span class=\"badge\" id=\"todayBadge\">今日</span></div>\n      <div class=\"bd\">\n        <div class=\"stat-grid\">\n          <div class=\"stat\"><div class=\"l\">监测时长</div><div class=\"n mono\" id=\"stDur\">0<small> 分</small></div></div>\n          <div class=\"stat\"><div class=\"l\">平均评分</div><div class=\"n mono\" id=\"stAvg\">—</div></div>\n          <div class=\"stat\"><div class=\"l\">良好坐姿占比</div><div class=\"n mono\" id=\"stGood\">—</div></div>\n          <div class=\"stat\"><div class=\"l\">最长连续久坐</div><div class=\"n mono\" id=\"stStreak\">0<small> 分</small></div></div>\n        </div>\n        <div class=\"note\" id=\"advice\">开始监测后，这里会根据数据给出个性化建议。</div>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"foot\">\n    视频画面在本机处理；设置与统计保存至应用数据库 · 模型来自 MediaPipe Pose（首次加载约 6MB，之后有缓存）<br>\n    检测结果仅供健康习惯参考，不构成医疗建议\n  </div>\n</div>\n\n<!-- 设置 -->\n<dialog id=\"dlgSettings\">\n  <div class=\"dlg-hd\"><h3>设置</h3><button class=\"btn sm ghost\" id=\"dlgClose1\">关闭</button></div>\n  <div class=\"dlg-bd\">\n    <div class=\"frow\"><div class=\"fl\">检测灵敏度<small>越高越容易触发提醒，建议从「标准」开始</small></div>\n      <div class=\"fr\"><div class=\"seg\" id=\"segSens\">\n        <button data-v=\"0.78\">敏感</button><button data-v=\"1\" class=\"on\">标准</button><button data-v=\"1.35\">宽松</button>\n      </div></div></div>\n    <div class=\"frow\"><div class=\"fl\">久坐提醒间隔<small>连续坐多久后提醒起身</small></div>\n      <div class=\"fr\"><select id=\"selWork\"><option value=\"20\">20 分钟</option><option value=\"30\">30 分钟</option><option value=\"45\" selected>45 分钟</option><option value=\"60\">60 分钟</option><option value=\"90\">90 分钟</option></select></div></div>\n    <div class=\"frow\"><div class=\"fl\">休息时长<small>建议至少 3 分钟，起身走动效果最好</small></div>\n      <div class=\"fr\"><select id=\"selBreak\"><option value=\"180\">3 分钟</option><option value=\"300\" selected>5 分钟</option><option value=\"600\">10 分钟</option></select></div></div>\n    <div class=\"frow\"><div class=\"fl\">用眼提醒（20-20-20）<small>每 20 分钟提醒远眺 20 秒</small></div>\n      <div class=\"fr\"><button class=\"sw on\" id=\"swEye\"></button></div></div>\n    <div class=\"frow\"><div class=\"fl\">声音提醒</div>\n      <div class=\"fr\"><input type=\"range\" class=\"range\" id=\"rgVol\" min=\"0\" max=\"100\" value=\"55\"><button class=\"sw on\" id=\"swSound\"></button></div></div>\n    <div class=\"frow\"><div class=\"fl\">系统通知<small>切到其他窗口时也能收到提醒</small></div>\n      <div class=\"fr\"><button class=\"sw\" id=\"swNotif\"></button></div></div>\n    <div class=\"frow\"><div class=\"fl\">镜像画面<small>像照镜子一样显示（推荐开启）</small></div>\n      <div class=\"fr\"><button class=\"sw on\" id=\"swMirror\"></button></div></div>\n    <div class=\"frow\"><div class=\"fl\">骨架叠加</div>\n      <div class=\"fr\"><button class=\"sw on\" id=\"swSkel\"></button></div></div>\n    <div class=\"frow\"><div class=\"fl\">检测帧率<small>越低越省电</small></div>\n      <div class=\"fr\"><div class=\"seg\" id=\"segFps\">\n        <button data-v=\"12\">12</button><button data-v=\"20\" class=\"on\">20</button><button data-v=\"30\">30</button>\n      </div></div></div>\n    <div class=\"note\"><b>隐私说明：</b>本应用全部计算在浏览器本地完成，视频帧不会发送到任何服务器；评分与统计保存在应用数据库，可在「清空数据」中一键删除。</div>\n  </div>\n</dialog>\n\n<!-- 帮助 -->\n<dialog id=\"dlgHelp\">\n  <div class=\"dlg-hd\"><h3>使用说明</h3><button class=\"btn sm ghost\" id=\"dlgClose2\">关闭</button></div>\n  <div class=\"dlg-bd\">\n    <div class=\"help-item\"><b>1. 摆放摄像头</b>：摄像头与眼睛大致同高，能拍到<b>头、肩、上臂</b>；距离 60–100cm。髋部若在画面内，还能额外检测塌腰前倾。</div>\n    <div class=\"help-item\"><b>2. 姿态校准（关键）</b>：先坐正——腰背挺直、双肩放松、目视前方——再点「姿态校准」，保持 3 秒。系统以你的标准坐姿为基线，之后所有偏差都相对它计算。<span class=\"em\">换座椅、换摄像头位置后请重新校准。</span></div>\n    <div class=\"help-item\"><b>3. 实时纠正</b>：评分低于 70 时会给出最需要改进的一条建议，并有声音/通知提醒；恢复良好坐姿会有提示音。</div>\n    <div class=\"help-item\"><b>4. 久坐提醒</b>：连续坐够设定时长后进入休息流程。<b>离开画面或站起会被自动识别为有效休息</b>；坐着不动休息效果会打折。</div>\n    <div class=\"help-item\"><b>5. 正对摄像头</b>：身体偏转超过 45° 时正面特征会失真，此时评分仅供参考（会标注低置信度），建议正对屏幕。</div>\n    <div class=\"help-item\"><b>检测原理与局限</b>：正面摄像头无法直接测量「颈椎前伸」的角度，系统用<b>头肩竖直距离缩短</b>、<b>肩宽/耳距变窄（含胸）</b>、<b>躯干变矮</b>、<b>身体尺寸变大（前倾凑近）</b>等尺度无关的比值特征来近似。若需要精确的矢状面测量，请把摄像头移到侧面拍摄。</div>\n  </div>\n</dialog>\n\n<!-- 报告 -->\n<dialog id=\"dlgReport\" aria-labelledby=\"rpTitle\">\n  <div class=\"dlg-hd\"><h3 id=\"rpTitle\">PostureGuard 姿势报告</h3><button class=\"btn sm ghost\" id=\"dlgClose3\">关闭</button></div>\n  <div class=\"dlg-bd\">\n    <div class=\"rp-bar\">\n      <div class=\"seg\" role=\"tablist\" aria-label=\"报告范围\">\n        <button role=\"tab\" id=\"tabHour\" data-tab=\"hour\" aria-controls=\"rpPanel\" aria-selected=\"true\" class=\"on\">小时</button>\n        <button role=\"tab\" id=\"tabDay\" data-tab=\"day\" aria-controls=\"rpPanel\" aria-selected=\"false\" tabindex=\"-1\">日</button>\n        <button role=\"tab\" id=\"tabWeek\" data-tab=\"week\" aria-controls=\"rpPanel\" aria-selected=\"false\" tabindex=\"-1\">周</button>\n      </div>\n      <label for=\"rpDate\" style=\"font-size:12.5px;color:var(--mute)\">日期</label>\n      <select id=\"rpDate\"></select>\n      <div class=\"grow\"></div>\n      <button class=\"btn sm\" id=\"btnRpCsv\">导出 CSV</button>\n    </div>\n    <div id=\"rpPanel\" role=\"tabpanel\" aria-labelledby=\"tabHour\"></div>\n    <div class=\"note\">报告口径：评分 ≥70 记为良好时长（80 为高分参考线，不按 80 计时）；单日良好时长 ≥10 分钟且良好占比 ≥60% 记为达标。仅统计在位、正面高置信度、已提取到特征的监测时间，校准期间不计入。口径如有更新会在此说明。<br>旧版会话记录只有按天累计、不含小时评分，不会补造为小时报告。</div>\n  </div>\n</dialog>\n\n<div class=\"toast\" id=\"toast\"></div>\n\n";

/* ============================================================
   0. 工具
============================================================ */
const $ = id => document.getElementById(id);
const clamp = (v,a,b) => v<a?a:(v>b?b:v);
const lerp = (a,b,t) => a+(b-a)*t;
const fmtClock = ms => { ms=Math.max(0,ms|0); const s=Math.round(ms/1000); return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; };
const fmtMin = ms => Math.round(ms/60000);

/* ============================================================
   1. 常量
============================================================ */
const RING_LEN = 2*Math.PI*52;
const LS_SET="sguard.settings.v1", LS_HIST="sguard.history.v1", LS_BASE="sguard.base.v1";

/* ============================================================
   2. 设置
============================================================ */
const SET = Object.assign({
  sens:1, workMin:45, breakSec:300, eye:true, sound:true, vol:0.55,
  notif:false, mirror:true, skel:true, fps:20
}, JSON.parse(window.postureStore.getItem(LS_SET)||"{}"));
const saveSet = () => window.postureStore.setItem(LS_SET, JSON.stringify(SET));

/* ============================================================
   3. 状态
============================================================ */
const S = {
  mode:"idle",                 // idle | loading | running | calibrating
  landmarker:null, stream:null, rafId:0,
  videoW:0, videoH:0,
  lastTs:0, lastInfer:0, fpsAvg:0,
  base:null,                   // 校准基线
  smooth:{},                   // 指标平滑值（检测不到的指标会被自动清除）
  missCnt:{},                  // 各指标连续缺失帧数（自适应判定的退避计数）
  trackHist:[],                // 关键点位置历史（幽灵冻结检测用）
  frozen:false,                // 跟踪已冻结（幽灵骨架）标记
  score:100, scoreHist:[], levelIdx:0, pendLevel:-1, pendSince:0,
  hintKey:null, hintDir:0, hintHold:0,
  poseSeen:false, lastSeen:0, awaySince:0, presentSince:0, standSince:0, awayStart:0,
  testHoldPresence:false,     // 仅测试钩子用：强制视为「在位」，便于无头验证状态机
  curState:"present",          // present | away | standing
  calBuf:null, calT0:0, calCount:3,
  timer:{ phase:"idle", seatedMs:0, breakLeftMs:0, streakMs:0, maxStreakMs:0,
          breakCreditMs:0, breakTotalMs:0, eyeMs:0, breaks:0, eyeCount:0, snoozes:0, lastTick:0 },
  session:{ t0:0, goodMs:0, fairMs:0, warnMs:0, badMs:0, awayMs:0, monitoredMs:0, scoreSum:0, scoreN:0 },
  chart:[],                    // {t, score, away}
  sndCtx:null,
  cspHit:null, loadErr:null,
};
const dayKey = () => new Date().toISOString().slice(0,10);
const report = new ReportService(new LocalStore());

// 恢复上次校准基线（刷新/重开浏览器后不必重新校准；摄像头挪动过则建议重校）
try{
  const b = JSON.parse(window.postureStore.getItem(LS_BASE)||"null");
  if (b && typeof b.at==="number" && typeof b.neckH==="number") S.base=b;
}catch(e){}

/* ============================================================
   4. 持久化（按天累计）
============================================================ */
function loadHist(){ try{ return JSON.parse(window.postureStore.getItem(LS_HIST)||"{}"); }catch(e){ return {}; } }
function bumpHist(patch){
  const h=loadHist(), d=Object.assign({goodMs:0,fairMs:0,warnMs:0,badMs:0,monitoredMs:0,breaks:0}, h[dayKey()]||{});
  for (const k in patch) d[k]=(d[k]||0)+patch[k];
  h[dayKey()]=d; window.postureStore.setItem(LS_HIST, JSON.stringify(h));
}
function todayTotals(){
  const d = loadHist()[dayKey()]||{};
  return { goodMs:d.goodMs||0, fairMs:d.fairMs||0, warnMs:d.warnMs||0, badMs:d.badMs||0,
           monitoredMs:d.monitoredMs||0, breaks:d.breaks||0 };
}
// 会话统计每 30s 落盘一次（只写增量，避免覆盖当天已有记录）
function flushHist(){
  const st=S.session, f=S.flushed||(S.flushed={goodMs:0,fairMs:0,warnMs:0,badMs:0,monitoredMs:0});
  const patch={};
  for (const k of ["goodMs","fairMs","warnMs","badMs","monitoredMs"]) patch[k]=st[k]-f[k];
  bumpHist(patch);
  for (const k in patch) f[k]=st[k];
}
setInterval(()=>{ if (S.mode==="running") flushHist(); }, 30000);

/* ============================================================
   5. 声音 / 通知
============================================================ */
function beep(freqs, dur=0.16, gain=1){
  if (!SET.sound || SET.vol<=0) return;
  try{
    S.sndCtx = S.sndCtx || new (window.AudioContext||window.webkitAudioContext)();
    if (S.sndCtx.state==="suspended") S.sndCtx.resume();
    const t0=S.sndCtx.currentTime;
    freqs.forEach((f,i)=>{
      const o=S.sndCtx.createOscillator(), g=S.sndCtx.createGain();
      o.type="sine"; o.frequency.value=f;
      const st=t0+i*dur, en=st+dur;
      g.gain.setValueAtTime(0,st);
      g.gain.linearRampToValueAtTime(0.22*gain*SET.vol, st+0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, en);
      o.connect(g).connect(S.sndCtx.destination); o.start(st); o.stop(en+0.02);
    });
  }catch(e){}
}
const sndWarn = () => beep([660,520],0.17,1);
const sndGood = () => beep([523,784],0.13,0.7);
const sndBreak= () => beep([784,988,1319],0.2,1);
function notify(title, body){
  if (!SET.notif || !("Notification" in window) || Notification.permission!=="granted") return;
  try{ new Notification(title,{body, tag:"sguard", silent:true}); }catch(e){}
}
let toastT=0;
function toast(msg){
  const el=$("toast"); el.innerHTML=msg; el.classList.add("show");
  clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove("show"), 3600);
}

/* ============================================================
   6. 相机（含 play() 竞态修复 + 错误分类）
============================================================ */
function camErrMsg(e){
  const n=e && e.name;
  if (n==="NotAllowedError") return "摄像头权限被拒绝。请在浏览器地址栏的权限设置中允许本页面使用摄像头，然后重试。";
  if (n==="NotFoundError") return "没有找到可用的摄像头设备。";
  if (n==="NotReadableError") return "摄像头被其他应用占用，请关闭占用它的程序后重试。";
  if (n==="SecurityError" || (window.isSecureContext===false)) return "当前不是安全上下文（需 https:// 或 http://localhost）。请勿直接双击打开文件，请用启动脚本或本地服务器打开。";
  if (n==="AbortError") return "";
  return "无法访问摄像头：" + (e && e.message ? e.message : "未知错误");
}
async function startCam(){
  if (S.stream) stopCam(true);
  const devId = $("camSel").value;
  const constraints = { audio:false, video: devId ? {deviceId:{exact:devId}} : {facingMode:"user", width:{ideal:1280}, height:{ideal:720}} };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const video = $("video");
  if (video.srcObject !== stream) video.srcObject = stream;   // 重复赋值会打断 play()
  await new Promise(res=>{
    if (video.readyState>=1 && video.videoWidth) return res();
    const done=()=>{ video.removeEventListener("loadedmetadata",done); res(); };
    video.addEventListener("loadedmetadata",done);
    setTimeout(done, 3500);
  });
  try{ await video.play(); }catch(e){ if (e.name!=="AbortError") throw e; }
  S.stream = stream;
  S.videoW = video.videoWidth || 1280; S.videoH = video.videoHeight || 720;
  $("stage").style.aspectRatio = S.videoW + "/" + S.videoH;
  $("stageEmpty").classList.add("hide");
  await refreshDevices();
}
function stopCam(keepMode){
  if (S.stream){ S.stream.getTracks().forEach(t=>t.stop()); S.stream=null; }
  const v=$("video"); if (v) v.srcObject=null;
  if (!keepMode){ S.mode="idle"; updateUI(); }
}
async function refreshDevices(){
  try{
    const list=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==="videoinput");
    const sel=$("camSel"), cur=sel.value;
    sel.innerHTML="";
    list.forEach((d,i)=>{
      const o=document.createElement("option");
      o.value=d.deviceId; o.textContent=d.label || ("摄像头 "+(i+1));
      sel.appendChild(o);
    });
    if (list.length===0){ const o=document.createElement("option"); o.value=""; o.textContent="默认摄像头"; sel.appendChild(o); }
    if ([...sel.options].some(o=>o.value===cur)) sel.value=cur;
  }catch(e){}
}

/* ============================================================
   7. 模型加载
============================================================ */
const BASE=new URL('./',import.meta.url).href;
const WASM=BASE+'wasm';
const MODEL=window.postureModelUrl;
async function loadModel(){
  window.addEventListener("securitypolicyviolation", ev=>{
    S.cspHit = `${ev.violatedDirective} 拦截了 ${ev.blockedURI}`;
  }, {once:true});
  setStatus("loading","正在加载姿态模型…");
  try{
    const { PoseLandmarker, FilesetResolver } = await import("./vision_bundle.mjs");
    const vision = await FilesetResolver.forVisionTasks(WASM);
    S.landmarker = await PoseLandmarker.createFromOptions(vision,{
      baseOptions:{ modelAssetPath:MODEL, delegate:"GPU" },
      runningMode:"VIDEO", numPoses:1,
      minPoseDetectionConfidence:0.5, minPosePresenceConfidence:0.5, minTrackingConfidence:0.5,
    });
    return true;
  }catch(e){
    S.loadErr = S.cspHit
      ? `模型资源被页面安全策略(CSP)拦截：\n${S.cspHit}\n\n请在已安装的应用中检查浏览器安全策略。`
      : `模型加载失败：${e && e.message ? e.message : e}\n\n请检查文件服务和网络后重试。`;
    return false;
  }
}

/* ============================================================
   8. 启停
============================================================ */
async function start(){
  if (location.protocol==="file:"){
    showError("当前通过 file:// 打开，浏览器会禁用摄像头。\n请从已安装的应用地址打开。\n");
    return;
  }
  if (!("mediaDevices" in navigator) || !navigator.mediaDevices.getUserMedia){
    showError("当前环境不支持摄像头访问（需要 https 或 localhost）。"); return;
  }
  S.mode="loading"; updateUI();
  const ok = await loadModel();
  if (!ok){ showError(S.loadErr); S.mode="idle"; updateUI(); return; }
  try{ await startCam(); }
  catch(e){ const m=camErrMsg(e); if (m){ showError(m); S.mode="idle"; updateUI(); } return; }

  S.session={ t0:performance.now(), goodMs:0,fairMs:0,warnMs:0,badMs:0,awayMs:0,monitoredMs:0,scoreSum:0,scoreN:0 };
  S.flushed={goodMs:0,fairMs:0,warnMs:0,badMs:0,monitoredMs:0};
  S.lastSeen=performance.now(); S.awaySince=0; S.curState="present";
  S.chart=[]; S.scoreHist=[];
  S.timer={ phase:"work", seatedMs:0, breakLeftMs:0, streakMs:0, maxStreakMs:0,
            breakCreditMs:0, breakTotalMs:SET.breakSec*1000, eyeMs:0, breaks:0, eyeCount:0, snoozes:0, lastTick:performance.now() };
  report.resetSession();
  S.mode="running"; updateUI();
  toast("监测已开始。建议先<b>坐正</b>再点「姿态校准」建立基线。");
  notify("坐姿卫士","监测已开始");
  if (!S.base) setTimeout(()=>{ if (S.mode==="running" && !S.base) toast("提示：先点「◎ 姿态校准」，检测才更准。"); }, 8000);
  cancelAnimationFrame(S.rafId);
  S.rafId = requestAnimationFrame(loop);
}
function stop(){
  cancelAnimationFrame(S.rafId); S.rafId=0;
  if (S.mode==="running"||S.mode==="calibrating") flushHist();
  stopCam(false);
  S.trackHist=[]; S.frozen=false;
  $("brkMask").classList.remove("show");
  if (S.timer.phase==="break") endBreak(true);
  report.resetSession(); report.flush(); refreshReport();
  S.mode="idle"; updateUI();
}
function showError(msg){
  $("emptyMsg").style.display="none";
  $("btnStartEmpty").style.display="none";
  $("errBox").innerHTML = '<div class="err-box">'+String(msg).replace(/&/g,"&amp;").replace(/</g,"&lt;")+'</div>';
  $("stageEmpty").classList.remove("hide");
}

/* ============================================================
   9. 校准
============================================================ */
function startCalibration(){
  if (S.mode!=="running") return;
  S.mode="calibrating"; S.calBuf=[]; S.calT0=performance.now(); S.calCount=3;
  $("calMask").classList.add("show"); updateUI();
}
function feedCalibration(f, now){
  const left = 3000 - (now - S.calT0);
  const c = Math.ceil(Math.max(0,left)/1000);
  if (c!==S.calCount){ S.calCount=c; $("calCount").textContent=c>0?c:"✓"; }
  if (f && f.ok && f.yawDeg<28 && Math.abs(f.headYawM||0)<0.45 && (f.shRound||f.neckH)) S.calBuf.push(f);
  if (left<=0) finishCalibration();
}
function finishCalibration(){
  $("calMask").classList.remove("show");
  S.mode="running"; updateUI();
  if (S.calBuf.length < 8){
    toast("校准失败：没稳定检测到上半身。请调整距离/光线后重试。"); beep([420,330],0.2,1); S.calBuf=null; return;
  }
  const avg = k => {
    const arr=S.calBuf.map(f=>f[k]).filter(v=>typeof v==="number"&&isFinite(v));
    if (!arr.length) return undefined;
    arr.sort((a,b)=>a-b);
    return arr[Math.floor(arr.length/2)];   // 中位数，抗离群
  };
  S.base={};
  for (const m of METRICS){ const v=avg(m.k); if (typeof v==="number") S.base[m.k]=v; }
  S.base.shMidY = S.calBuf[S.calBuf.length-1].shMidY;
  S.base.sw = S.calBuf[S.calBuf.length-1].sw;
  S.base.at = Date.now();
  S.smooth={}; S.calBuf=null;
  try{ window.postureStore.setItem(LS_BASE, JSON.stringify(S.base)); }catch(e){}
  beep([523,659,784],0.14,0.9);
  // 报告实际生效的指标数：光线差/角度偏会让部分指标采不到，必须让用户知道
  const nOK = METRICS.filter(m=>typeof S.base[m.k]==="number").length;
  toast(`校准完成 ✓ ${nOK}/${METRICS.length} 项指标已建立基线` +
        (nOK<METRICS.length ? "。部分指标未采集（改善光线/正对镜头后重新校准会更准）。" : "。"));
}

/* ============================================================
   10. 久坐状态机
============================================================ */
function tickTimer(now){
  const T=S.timer;
  const dt = Math.min(2000, now - (T.lastTick||now)); T.lastTick=now;
  if (S.mode!=="running" && S.mode!=="calibrating"){ return; }
  const away = S.curState!=="present";

  // —— 在位状态判定 ——
  // 站立：肩部较基线明显升高，按肩宽归一（与拍摄距离无关）
  const seen = S.testHoldPresence || S.poseSeen;
  let standing=false;
  if (seen && S.base && S.smooth.shMidY_raw!=null && S.base.sw){
    standing = (S.base.shMidY - S.smooth.shMidY_raw)/S.base.sw > 0.62;
  }
  const wasAway = S.curState!=="present";
  if (seen){
    S.lastSeen=now; S.awaySince=0;
    S.curState = standing ? "standing" : "present";
    if (standing && !S.standSince) S.standSince=now;
    if (!standing) S.standSince=0;
  } else {
    S.standSince=0;
    if (!S.awaySince && now-S.lastSeen>2500) S.awaySince=now;
    if (S.awaySince && now-S.awaySince>1200) S.curState="away";
  }
  // —— 离开→回来转变：离开 ≥1 分钟视为一次完整休息，久坐计时清零重新开始；
  //     短于 1 分钟只暂停不清零（短暂取个外卖回来继续算）
  const isAway = S.curState!=="present";
  if (isAway && !wasAway){ S.awayStart = now; report.resetSession(); }
  if (!isAway && wasAway && S.awayStart){
    // 仅 work 阶段处理；break 阶段的离开由 breakCreditMs 结算、endBreak 统一清零
    if (T.phase==="work" && now - S.awayStart >= 60000){
      T.seatedMs=0; T.streakMs=0; T.eyeMs=0;
      // 同一次离开若已在 endBreak 计过休息，不再重复计
      if (S.awayStart >= (S.breakRecAt||0)) report.recordBreak(Date.now());
      toast("离开超过 1 分钟，久坐计时已重新开始 ✓");
    }
    S.awayStart=0;
  }

  if (T.phase==="work"){
    if (!away){
      T.seatedMs+=dt; T.streakMs+=dt;
      T.maxStreakMs=Math.max(T.maxStreakMs,T.streakMs);
      if (SET.eye){ T.eyeMs+=dt; if (T.eyeMs>=20*60000){ T.eyeMs=0; T.eyeCount++; eyeRest(); } }
      if (T.seatedMs>=SET.workMin*60000) startBreak(now);
    }
  } else if (T.phase==="break"){
    T.breakLeftMs-=dt;
    if (away) T.breakCreditMs+=dt;
    if (T.breakCreditMs>120000 && away && now-(S.awaySince||S.standSince||now)>120000){ endBreak(); return; }
    if (T.breakLeftMs<=0) endBreak();
    const left=Math.max(0,T.breakLeftMs);
    $("brkCd").textContent=fmtClock(left);
    const credited=Math.round(100*T.breakCreditMs/Math.max(1,T.breakTotalMs));
    $("brkMsg").innerHTML = `离开座位 / 站起会被自动识别为有效休息。<br>本段休息有效时长：<b style="color:var(--good)">${credited}%</b>（建议起身活动）`;
  }
}
function eyeRest(){
  sndWarn(); toast("👀 <b>用眼提醒</b>：远眺 6 米外 20 秒，让眼睛放松一下。");
  notify("20-20-20 用眼提醒","看看 6 米外的地方，持续 20 秒");
}
function startBreak(now){
  const T=S.timer;
  T.phase="break"; T.breakLeftMs=SET.breakSec*1000; T.breakTotalMs=SET.breakSec*1000;
  T.breakCreditMs=0; T.breakStart=now;
  sndBreak(); notify("该起来活动了","连续久坐 "+SET.workMin+" 分钟，起来走走、喝口水");
  $("brkMask").classList.add("show"); $("seatedProg").classList.add("break");
  updateUI();
}
function endBreak(silent){
  const T=S.timer;
  const credit = Math.round(100*T.breakCreditMs/Math.max(1,T.breakTotalMs));
  if (T.breakCreditMs>=60000){ report.recordBreak(Date.now()); S.breakRecAt=performance.now(); }
  T.phase="work"; T.seatedMs=0; T.streakMs=0; T.eyeMs=Math.min(T.eyeMs, 8*60000);
  T.breaks++; T.breakCreditMs=0;
  $("brkMask").classList.remove("show"); $("seatedProg").classList.remove("break");
  bumpHist({breaks:1});
  if (!silent){
    if (credit>=70){ toast(`休息完成 ✓ 有效休息 ${credit}%，状态会更好。`); beep([523,784],0.15,0.8); }
    else { toast(`休息结束，但有效休息仅 ${credit}%。下次尽量真的起身走动。`); sndWarn(); }
  }
  updateUI();
}
function snoozeBreak(){
  const T=S.timer;
  T.phase="work"; T.seatedMs=SET.workMin*60000-5*60000; T.streakMs=T.seatedMs;
  T.snoozes++; T.breakCreditMs=0; T.breakLeftMs=0;
  $("brkMask").classList.remove("show"); $("seatedProg").classList.remove("break");
  toast("已延后 5 分钟。久坐伤腰，尽量还是起来动一动。");
  updateUI();
}

/* ============================================================
   11. 主循环
============================================================ */
function nextTs(){
  const now=performance.now();
  S.lastTs = now>S.lastTs ? now : S.lastTs+1;   // 严格单调，绝不重置
  return S.lastTs;
}
let chartSampleAt=0;
function loop(){
  S.rafId=requestAnimationFrame(loop);
  const now=performance.now();
  const video=$("video");
  const active = S.mode==="running" || S.mode==="calibrating";
  tickTimer(now);

  // 离开画面兜底（模型推理失败也照常计时）
  if (!active) return;
  if (video.readyState<2 || !S.landmarker){ S.poseSeen=false; renderIdle(); return; }

  if (now - S.lastInfer < 1000/SET.fps - 2) return;
  S.lastInfer = now;
  let res=null;
  try{ res = S.landmarker.detectForVideo(video, nextTs()); }
  catch(e){ S.poseSeen=false; renderIdle(); return; }

  // 时间统计（必须在可能提前 return 的特征提取之前，否则离开时长会漏计）
  const dtStat = Math.min(2000, now-(S.lastStatAt||now)); S.lastStatAt=now;
  if (S.mode==="running" && S.curState!=="present") S.session.awayMs += dtStat;

  const lm = res && res.landmarks && res.landmarks[0];
  const wl = res && res.worldLandmarks && res.worldLandmarks[0];
  // ★ 在位判定三道防线（人走了仍在累计久坐的修复）：
  //   1. 可见度门控：MediaPipe 人离开后仍会输出低可见度骨架，仅"有 33 点"不够
  //   2. 人体几何校验：幽灵跟踪椅子/杂物时几何常崩（头点掉到肩下、躯干比例异常）
  //   3. 冻结检测：真实摄像头必有传感器噪声，真人静坐关键点也持续微动；
  //      幽灵输出经内部平滑后近乎恒定 → 3s 窗口极差过小即判骨架不可信
  const keyVis = lm ? (lm[11].visibility + lm[12].visibility + lm[0].visibility)/3 : 0;
  const ar0 = (S.videoW/S.videoH) || (4/3);
  const human = lm ? looksHuman(lm, ar0) : false;
  if (lm && human){
    const shx=(lm[IDX.LSH].x+lm[IDX.RSH].x)/2, shy=(lm[IDX.LSH].y+lm[IDX.RSH].y)/2;
    S.trackHist.push({t:now, xs:[shx, shy, lm[IDX.NOSE].x, lm[IDX.NOSE].y]});
    while (S.trackHist.length && now-S.trackHist[0].t>4000) S.trackHist.shift();
  } else {
    S.trackHist=[];   // 中断后重新积累，避免跨间断点污染极差统计
  }
  S.frozen = !!(lm && human && trackSpread(S.trackHist, 3000) < 0.0012);
  S.poseSeen = !!(lm && lm.length===33 && keyVis>0.5 && human && !S.frozen);
  if (S.poseSeen){ S.lastSeen=now; S.awaySince=0; S.lastLm=lm; }

  const ar = (S.videoW/S.videoH) || (4/3);
  let f=null;
  if (S.poseSeen){ f=computeFeatures(lm, wl, ar); if (f && !f.ok) f=null; }
  if (!f){ updateSmooth(null); renderIdle(); return; }

  // 自适应平滑（EMA）：检测到才更新；连续 8 帧（≈0.25s）检测不到则清除缓存，
  // 该指标随之退出评分（scoreFeatures 对 undefined 指标自动跳过且不计权重）——
  // 短暂缺失保留旧值只为抵抗单帧可见度抖动，不允许过期数据长期参与判定
  updateSmooth(f);
  if (S.mode==="calibrating"){ feedCalibration(f, now); }

  // 评分
  const r = scoreFeatures(smoothedF(), S.base, SET.sens);
  S.score = r.score;
  const conf = S.smooth.yawDeg<35 ? "ok" : (S.smooth.yawDeg<55 ? "fair" : "low");
  S.conf = conf;

  // 级别迟滞 1.2s（新级别需持续出现才切换），避免评分闪烁与提示音乱响
  const li = LEVELS.indexOf(r.level);
  if (li===S.levelIdx){ S.pendLevel=-1; }
  else if (S.pendLevel===li && now-S.pendSince>1200){
    const prev=S.levelIdx; S.levelIdx=li; S.pendLevel=-1;
    if (S.mode==="running" && S.base){ if (li>prev) sndWarn(); else if (li===0 && prev>0) sndGood(); }
  } else if (S.pendLevel!==li){ S.pendLevel=li; S.pendSince=now; }

  // 统计（仅高置信度且在位的样本计入坐姿时段）
  if (S.mode==="running" && conf==="ok" && S.curState==="present"){
    S.session.monitoredMs+=dtStat; S.session.scoreSum+=r.score; S.session.scoreN++;
    const key=["goodMs","fairMs","warnMs","badMs"][li];   // 与 LEVELS 顺序一致（0=优秀）
    S.session[key]+=dtStat;
    // 报告有效样本：运行中 + 高置信 + 在位 + 骨架可信 + 特征已提取（校准期 mode 为 calibrating，不计）
    if (S.poseSeen) report.recordSample({ now:Date.now(), score:r.score, issueKeys:r.issues.map(i=>i.k), present:true, dtMs:dtStat });
  }

  // 曲线采样：每 2s
  if (now-chartSampleAt>2000){
    chartSampleAt=now;
    S.chart.push({t:now, score:S.score, away:S.curState!=="present"});
    if (S.chart.length>1400) S.chart.shift();
  }
  render(f, r, conf);
}
function smoothedF(){
  const o={};
  for (const m of METRICS){ if (S.smooth[m.k]!=null) o[m.k]=S.smooth[m.k]; }
  return o;
}
function renderIdle(){
  $("tagPres").innerHTML="○ 未见人体"; $("tagPres").style.color="var(--mute)";
  sizeCanvas(); octx.setTransform(dpr,0,0,dpr,0,0);
  octx.clearRect(0,0,ov.clientWidth,ov.clientHeight);
}
/* 自适应平滑：检测到才更新，连续 8 帧缺失则清除。
 * f=null（整帧不判定）等价于所有指标缺失。缺失的指标从评分中自动退出。 */
function updateSmooth(f){
  const A=0.35, MISS_MAX=8;
  for (const m of METRICS){
    const v = f ? f[m.k] : undefined;
    if (typeof v==="number" && isFinite(v)){
      S.missCnt[m.k]=0;
      S.smooth[m.k] = S.smooth[m.k]==null ? v : S.smooth[m.k]+A*(v-S.smooth[m.k]);
    } else if (++S.missCnt[m.k] > MISS_MAX){
      delete S.smooth[m.k];
    }
  }
  if (f){
    S.smooth.shMidY_raw = S.smooth.shMidY_raw==null ? f.shMidY : S.smooth.shMidY_raw + A*(f.shMidY-S.smooth.shMidY_raw);
    S.smooth.yawDeg = S.smooth.yawDeg==null ? f.yawDeg : S.smooth.yawDeg+0.3*(f.yawDeg-S.smooth.yawDeg);
  } else {
    delete S.smooth.shMidY_raw; delete S.smooth.yawDeg;
  }
}
// 指标数值的人类可读格式
function fmtMetric(k, v, b){
  if (k==="leanDeg"||k==="headTilt"||k==="twistDeg"||k==="pelvicTiltDeg") return (v>=0?"+":"")+v.toFixed(0)+"°";
  if (k==="headFwd") return (v*100).toFixed(1)+"cm";
  if (k==="headYawM") return (v>=0?"+":"")+(Math.atan(v/0.61)*180/Math.PI).toFixed(0)+"°";  // 0.61·tanθ → 反解角度
  if (k==="sizeR") return (typeof b==="number"&&Math.abs(b)>1e-6) ? (v/b*100).toFixed(0)+"%" : v.toFixed(2);
  return v.toFixed(2);
}

/* ============================================================
   12. 渲染
============================================================ */
const dpr = Math.min(2, window.devicePixelRatio||1);
const ov=$("overlay"), octx=ov.getContext("2d");
function sizeCanvas(){
  const w=ov.clientWidth, h=ov.clientHeight;
  if (w&&h&&(ov.width!==w*dpr||ov.height!==h*dpr)){ ov.width=w*dpr; ov.height=h*dpr; }
}
function drawSkel(lm, ar, color){
  sizeCanvas(); octx.setTransform(dpr,0,0,dpr,0,0); octx.clearRect(0,0,ov.clientWidth,ov.clientHeight);
  if (!SET.skel) return;
  const W=ov.clientWidth, H=ov.clientHeight;
  // 坐标取整：避免抗锯齿造成的发虚，也让左右两条臂的像素覆盖完全对称
  const P=i=>({x:Math.round(lm[i].x*W), y:Math.round(lm[i].y*H)});
  octx.lineCap="round"; octx.lineJoin="round";
  for (const b of BONES){
    if (lm[b.a].visibility<0.3 || lm[b.b].visibility<0.3) continue;
    const p=P(b.a), q=P(b.b);
    octx.strokeStyle=b.c; octx.lineWidth=3.2; octx.globalAlpha=1;
    octx.beginPath(); octx.moveTo(p.x,p.y); octx.lineTo(q.x,q.y); octx.stroke();
  }
  octx.globalAlpha=1;
  for (const j of JOINTS){
    if (lm[j].visibility<0.3) continue;
    const p=P(j);
    octx.fillStyle="#8e44ad"; octx.beginPath(); octx.arc(p.x,p.y,3.6,0,7); octx.fill();
  }
  // 肩中线 + 头部中心参考线
  if (lm[IDX.LSH].visibility>0.3 && lm[IDX.RSH].visibility>0.3){
    const a=P(IDX.LSH), b=P(IDX.RSH), m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    octx.strokeStyle="rgba(255,255,255,.5)"; octx.lineWidth=1.4; octx.setLineDash([4,5]);
    octx.beginPath(); octx.moveTo(m.x,m.y); octx.lineTo(m.x,Math.max(0,m.y-H*0.3)); octx.stroke();
    octx.setLineDash([]);
  }
}
function render(f, r, conf){
  const now = performance.now();
  // ---- 建议提示（同类 25s 冷却，避免反复唠叨）----
  if (r.issues.length && S.mode==="running" && conf!=="low"){
    const top=r.issues[0];
    if (top.k!==S.hintKey || now-S.hintHold>25000){
      S.hintKey=top.k; S.hintHold=now;
      const m=METRICS.find(x=>x.k===top.k);
      const el=$("hintChip");
      el.innerHTML = "💡 " + m.hint(top.dir);
      el.style.display="block";
      if (r.score<70) sndWarn();
    }
  } else if (!r.issues.length){
    S.hintKey=null; $("hintChip").style.display="none";
  }
  // ---- 标签 ----
  $("tagFps").innerHTML=`<b>${SET.fps}</b> FPS`;
  $("tagYaw").innerHTML=`朝向 <b>${Math.round(S.smooth.yawDeg||0)}°</b>`;
  const presTxt={present:"✓ 在位", away:"○ 离开", standing:"🧍 站立中"}[S.curState];
  $("tagPres").innerHTML=presTxt;
  $("tagPres").style.color = S.curState==="present" ? "var(--good)" : "var(--warn)";

  // ---- 评分环 ----
  const score=S.score;
  // 未校准也显示参考分（仅绝对指标参与），但明确标注
  $("scoreN").textContent = score;
  $("ring").style.strokeDashoffset = RING_LEN*(1-clamp(score,0,100)/100);
  const lv=LEVELS[S.levelIdx];
  document.documentElement.style.setProperty("--ring", lv.hex);
  $("levelTxt").textContent = S.base?lv.n:"参考分";
  $("scoreMsg").innerHTML = S.base ? (r.issues.length? lv.msg : "各项指标都在标准范围内，继续保持。")
    : "当前为<b>参考评分</b>（仅用绝对指标）。点「◎ 姿态校准」建立基线后评分更精准。";
  const confBadge=$("confBadge");
  if (conf==="low"){ confBadge.textContent="低置信度"; confBadge.className="badge b"; $("confTxt").textContent="身体偏转较大，正面特征失真，评分仅供参考。"; }
  else if (conf==="fair"){ confBadge.textContent="一般"; confBadge.className="badge w"; $("confTxt").textContent="略偏离正面，建议正对屏幕。"; }
  else { confBadge.textContent="高置信度"; confBadge.className="badge g"; $("confTxt").textContent=S.base?`基线建立于 ${new Date(S.base.at).toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"})}`:""; }

  // ---- 指标条 ----
  const list=$("metricList");
  if (list.childElementCount!==METRICS.length){
    list.innerHTML = METRICS.map(m=>`<div class="metric" data-k="${m.k}">
      <div class="row"><span class="k">${m.n}</span><span class="v mono" data-v>—</span></div>
      <div class="bar"><i></i><span class="base"></span></div></div>`).join("");
  }
  for (const m of METRICS){
    const el=list.querySelector(`[data-k="${m.k}"]`);
    const v=S.smooth[m.k], b=S.base?S.base[m.k]:undefined;
    const has=typeof v==="number";
    // abs 指标有中性默认值（b0），未校准也可参与；rel 指标必须已校准
    const active = has && (m.mode==="abs" || (S.base && typeof b==="number"));
    el.classList.toggle("off", !active);
    let pct=0, col="var(--good)", txt="—";
    if (active){
      let x=0;
      if (m.mode==="abs"){
        const bb=(typeof b==="number")?b:(m.b0||0);
        x=clamp((Math.abs(v-bb)-m.tol*SET.sens)/(m.scale*SET.sens),0,1);
      }
      else{
        const d=(v-b)/Math.max(Math.abs(b),1e-6);
        if (m.kind==="lower"&&d<0) x=clamp((-d-m.tol*SET.sens)/(m.scale*SET.sens),0,1);
        else if (m.kind==="upper"&&d>0) x=clamp((d-m.tol*SET.sens)/(m.scale*SET.sens),0,1);
        else if (m.kind==="both") x=clamp((Math.abs(d)-m.tol*SET.sens)/(m.scale*SET.sens),0,1);
      }
      pct=Math.round(x*100);
      col = x<0.2?"var(--good)":x<0.5?"var(--warn)":"var(--bad)";
      txt = fmtMetric(m.k, v, (m.mode==="abs"&&typeof b!=="number")?(m.b0||0):b);
    }
    el.querySelector(".bar i").style.width=pct+"%";
    el.querySelector(".bar i").style.background=col;
    el.querySelector("[data-v]").textContent=txt;
  }

  // ---- 久坐计时 ----
  const T=S.timer;
  const cap=SET.workMin*60000;
  $("seatedTxt").innerHTML = T.phase==="break"
    ? `休息中 <small>剩余 ${fmtClock(Math.max(0,T.breakLeftMs))}</small>`
    : `${fmtClock(T.seatedMs)} <small>/ ${fmtClock(cap)}</small>`;
  $("seatedProg").querySelector("i").style.width = clamp(100*T.seatedMs/cap,0,100)+"%";
  $("seatStreak").textContent=fmtMin(T.streakMs)+"分";
  $("breakDone").textContent=T.breaks;
  $("eyeCnt").textContent=T.eyeCount;
  $("phaseBadge").textContent={idle:"未开始",work:"监测中",break:"休息中"}[T.phase];
  $("phaseBadge").className="badge"+(T.phase==="break"?" w":T.phase==="work"?" g":"");

  // ---- 统计 ----
  const st=S.session;
  $("stDur").innerHTML=fmtMin(st.monitoredMs)+"<small> 分</small>";
  $("stAvg").textContent=st.scoreN?Math.round(st.scoreSum/st.scoreN):"—";
  const goodPct = st.monitoredMs?Math.round(100*(st.goodMs+st.fairMs)/st.monitoredMs):0;
  $("stGood").textContent=st.monitoredMs?goodPct+"%":"—";
  $("stStreak").innerHTML=fmtMin(T.maxStreakMs)+"<small> 分</small>";
  const tot=todayTotals();
  $("todayBadge").textContent=`今日休息 ${tot.breaks} 次`;
  $("advice").innerHTML = buildAdvice(st, T);

  // ---- 骨架 ----
  if (S.lastLm) drawSkel(S.lastLm, S.videoW/S.videoH, lv.hex);
}
function buildAdvice(st, T){
  if (!st.monitoredMs) return "开始监测后，这里会根据数据给出个性化建议。";
  const avg=Math.round(st.scoreSum/st.scoreN);
  const out=[];
  if (T.maxStreakMs>=45*60000) out.push("你有过 ≥45 分钟的连续久坐，建议把提醒间隔调到 <b>30 分钟</b>。");
  if (st.warnMs+st.badMs > st.monitoredMs*0.3) out.push("不良坐姿占比偏高，重点留意<b>含胸塌肩</b>与<b>低头</b>，可把屏幕垫高。");
  if (T.snoozes>=2) out.push("已多次延后休息——起身活动的收益远大于多坐那几分钟。");
  if (!out.length) out.push(avg>=85?"数据很棒，继续保持！":"整体稳定，留意提示即可。");
  return out.map(s=>"· "+s).join("<br>");
}

/* ============================================================
   13. 图表
============================================================ */
const chart=$("chart"), cctx=chart.getContext("2d");
function drawChart(){
  const w=chart.clientWidth, h=chart.clientHeight;
  if (!w||!h) return;
  if (chart.width!==w*dpr||chart.height!==h*dpr){ chart.width=w*dpr; chart.height=h*dpr; }
  cctx.setTransform(dpr,0,0,dpr,0,0);
  cctx.clearRect(0,0,w,h);
  const pad={l:30,r:12,t:12,b:22};
  const iw=w-pad.l-pad.r, ih=h-pad.t-pad.b;
  // 网格 + 刻度
  cctx.strokeStyle="rgba(255,255,255,.07)"; cctx.fillStyle="#5d6a83"; cctx.font="10px ui-monospace,monospace"; cctx.lineWidth=1;
  [0,50,70,85,100].forEach(v=>{
    const y=pad.t+ih*(1-v/100);
    cctx.beginPath(); cctx.moveTo(pad.l,y); cctx.lineTo(w-pad.r,y); cctx.stroke();
    cctx.fillText(String(v), 6, y+3);
  });
  const C=S.chart;
  if (C.length<2){
    cctx.fillStyle="#5d6a83"; cctx.font="12px sans-serif";
    cctx.fillText("暂无数据", w/2-24, h/2); return;
  }
  const t0=C[0].t, t1=C[C.length-1].t, span=Math.max(1000,t1-t0);
  const X=t=>pad.l+iw*((t-t0)/span), Y=s=>pad.t+ih*(1-clamp(s,0,100)/100);
  // 离开时段阴影
  cctx.fillStyle="rgba(90,102,130,.28)";
  let run=null;
  for (let i=0;i<C.length;i++){
    if (C[i].away){ if (!run) run={s:C[i].t}; }
    else if (run){ cctx.fillRect(X(run.s),pad.t,Math.max(1.5,X(C[i].t)-X(run.s)),ih); run=null; }
  }
  if (run) cctx.fillRect(X(run.s),pad.t,Math.max(1.5,X(t1)-X(run.s)),ih);
  // 分段着色折线
  for (let i=1;i<C.length;i++){
    const a=C[i-1], b=C[i];
    if (b.away) continue;
    const col = b.score>=85?"#2ee6a8":b.score>=70?"#9be15d":b.score>=50?"#ffb340":"#ff5c72";
    cctx.strokeStyle=col; cctx.lineWidth=1.8; cctx.beginPath();
    cctx.moveTo(X(a.t),Y(a.score)); cctx.lineTo(X(b.t),Y(b.score)); cctx.stroke();
  }
  // x 轴时间
  cctx.fillStyle="#5d6a83"; cctx.font="10px ui-monospace,monospace";
  const mins=Math.round(span/60000);
  cctx.fillText(`0分`, pad.l, h-4);
  cctx.textAlign="right";
  cctx.fillText(`${mins}分`, w-pad.r, h-4);
  cctx.textAlign="left";
}
setInterval(()=>{ if (S.mode!=="idle") drawChart(); }, 1500);
window.addEventListener("resize", ()=>{ drawChart(); });

/* ============================================================
   14. UI 绑定
============================================================ */
function setStatus(mode, txt){
  const d=$("statusDot");
  d.className="dot"+(mode==="running"?" on":mode==="loading"?" warn":mode==="error"?" bad":"");
  $("statusTxt").textContent=txt;
}
function updateUI(){
  const running = S.mode==="running" || S.mode==="calibrating";
  $("btnStart").disabled = running || S.mode==="loading";
  $("btnStop").disabled = !running;
  $("btnCal").disabled = S.mode!=="running";
  $("btnPauseBreak").disabled = !running || S.timer.phase==="break";
  $("btnStart").innerHTML = running ? "● 监测中" : "▶ 开始监测";
  $("stageEmpty").classList.toggle("hide", running || S.mode==="loading");
  if (S.mode==="idle" && !$("errBox").innerHTML){
    $("emptyMsg").style.display="";
    $("btnStartEmpty").style.display="";
  }
  setStatus(S.mode==="running"?"running":S.mode==="loading"?"loading":"idle",
    S.mode==="running"?(S.base?"监测中 · 已校准":"监测中 · 未校准"):S.mode==="loading"?"加载模型…":S.mode==="calibrating"?"校准中…":"未启动");
  $("baseBadge").textContent = S.base?("已校准 · "+new Date(S.base.at).toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"})):"未校准";
  $("baseBadge").className="badge"+(S.base?" g":"");
}

$("btnStart").onclick=start;
$("btnStartEmpty").onclick=start;
$("btnStop").onclick=stop;
$("btnCal").onclick=startCalibration;
$("btnResetSeat").onclick=()=>{ S.timer.seatedMs=0;S.timer.streakMs=0;S.timer.eyeMs=0;toast("久坐计时已清零。"); };
$("btnPauseBreak").onclick=()=>{ if (S.mode==="running") startBreak(performance.now()); };
$("brkDone").onclick=()=>endBreak();
$("brkSnooze").onclick=snoozeBreak;
$("btnClear").onclick=()=>{
  if (!confirm("将清空全部历史与 30 天姿势报告，无法恢复。继续？")) return;
  window.postureStore.removeItem(LS_HIST); report.clear(); refreshReport();
  toast("历史数据已清空。"); S.chart=[];drawChart();
};
function downloadCsv(rows, name){
  const cell=v=>{ const s=String(v??""); return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; };
  const url=URL.createObjectURL(new Blob(["\uFEFF"+rows.map(r=>r.map(cell).join(",")).join("\n")],{type:"text/csv"}));
  const a=document.createElement("a"); a.href=url; a.download=name; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 0);
}
$("btnExport").onclick=()=>{
  const st=S.session, T=S.timer, tot=todayTotals();
  const rows=[["项目","数值"],
    ["监测时长(分)",fmtMin(st.monitoredMs)],
    ["平均评分",st.scoreN?Math.round(st.scoreSum/st.scoreN):"-"],
    ["优秀(分)",fmtMin(st.goodMs)],["良好(分)",fmtMin(st.fairMs)],
    ["需调整(分)",fmtMin(st.warnMs)],["较差(分)",fmtMin(st.badMs)],
    ["离开座位(分)",fmtMin(st.awayMs)],
    ["最长连续久坐(分)",fmtMin(T.maxStreakMs)],
    ["完成休息次数",T.breaks],["延后休息次数",T.snoozes],
    ["用眼提醒次数",T.eyeCount],
    ["今日累计休息(次)",tot.breaks]];
  downloadCsv(rows, "坐姿报告_"+dayKey()+".csv");
};

/* ============================================================
   14b. 姿势报告（数据来自 report-core 小时桶；无数据不捏造）
============================================================ */
const esc = s => String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const issueName = k => (METRICS.find(m=>m.k===k)||{n:k}).n;
const DAY = 86400000;
const noonOf = (t, back=0) => { const d=new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()-back, 12).getTime(); };
const fmtDate = t => new Date(t).toLocaleDateString("zh-CN",{month:"numeric",day:"numeric",weekday:"short"});
const MILESTONES=[3,7,14,21,30,50,100];
let rpNow=Date.now(), rpTab="hour", rpDay=noonOf(rpNow);

function insightText(i){
  switch(i.kind){
    case "notEnoughData": return `今日有效监测 ${Math.round(i.v)} 分钟，不足 10 分钟，暂不生成结论。`;
    case "goodMinutes": return `今日良好坐姿（≥70 分）累计 ${Math.round(i.v)} 分钟。`;
    case "corrections": return `今日从不良坐姿主动纠正 ${i.v} 次。`;
    case "improved": return `平均分比昨日高 ${Math.round(i.v)} 分。`;
    case "declined": return `平均分比昨日低 ${Math.round(i.v)} 分。`;
    case "topIssue": return `最常见问题：${esc(issueName(i.s))}（占有效样本 ${Math.round(i.v)}%）。`;
    case "worstSlot": return `${i.s}:00 时段平均 ${Math.round(i.v)} 分，是今日最低时段。`;
    case "longSit": return `今日有 ${i.v} 段连续久坐（单小时在位 ≥45 分钟且未休息）。`;
    case "milestone": return `已连续达标 ${i.v} 天！`;
  }
  return "";
}
function drawReportChart(cv, pts, labelEvery){
  const w=cv.clientWidth, h=cv.clientHeight; if (!w||!h) return;
  if (cv.width!==w*dpr||cv.height!==h*dpr){ cv.width=w*dpr; cv.height=h*dpr; }
  const g=cv.getContext("2d"); g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,w,h);
  const pad={l:30,r:12,t:12,b:22}, iw=w-pad.l-pad.r, ih=h-pad.t-pad.b;
  const X=i=>pad.l+iw*(pts.length>1?i/(pts.length-1):.5), Y=s=>pad.t+ih*(1-clamp(s,0,100)/100);
  g.font="10px ui-monospace,monospace"; g.lineWidth=1;
  for (const v of [0,50,70,80,100]){
    g.strokeStyle=v===70?"rgba(155,225,93,.45)":v===80?"rgba(46,230,168,.35)":"rgba(255,255,255,.07)";
    g.setLineDash(v===70||v===80?[4,4]:[]);
    g.beginPath(); g.moveTo(pad.l,Y(v)); g.lineTo(w-pad.r,Y(v)); g.stroke();
    g.fillStyle="#5d6a83"; g.fillText(String(v),4,Y(v)+3);
  }
  g.setLineDash([]);
  pts.forEach((p,i)=>{ if (i%labelEvery===0){ g.fillStyle="#5d6a83"; g.fillText(p.label, X(i)-8, h-6); } });
  if (!pts.some(p=>p.score!=null)){ g.fillStyle="#8b98b2"; g.font="12px sans-serif"; g.fillText("暂无有效数据", w/2-36, h/2); return; }
  g.strokeStyle="#5b8cff"; g.lineWidth=2;
  let prev=null;   // 无数据处断开，不插值捏造
  pts.forEach((p,i)=>{
    if (p.score==null){ prev=null; return; }
    if (prev!=null){ g.beginPath(); g.moveTo(X(prev),Y(pts[prev].score)); g.lineTo(X(i),Y(p.score)); g.stroke(); }
    g.fillStyle=p.score>=70?"#2ee6a8":"#ff5c72"; g.beginPath(); g.arc(X(i),Y(p.score),3,0,7); g.fill();
    prev=i;
  });
}
function agg7(now, back){
  let s=0,f=0,se=0,good=0,days=0;
  for (let i=back;i<back+7;i++){
    const r=report.dayReport(noonOf(now,i));
    if (r.hasData){ s+=r.avgScore*r.frames; f+=r.frames; se+=r.seatedMs; good+=r.goodMs; days++; }
  }
  return { avg:f?s/f:null, goodRatio:se?good/se:null, minutes:se/60000, days };
}
function renderReportPanel(){
  const P=$("rpPanel"), r=report.dayReport(rpDay);
  const thin = r.minutes<10 ? `<div class="rp-warn">该日有效样本 ${Math.round(r.minutes)} 分钟，不足 10 分钟，以下结论仅供参考，不计入达标。</div>` : "";
  if (rpTab==="hour"){
    const c=report.todayCurve(rpDay);
    const rows=c.filter(p=>p.seatedMs>0).map(p=>`<tr><td>${p.hour}:00–${p.hour+1}:00</td><td>${p.score==null?"—":Math.round(p.score)}</td><td>${Math.round(p.seatedMs/60000)}</td><td>${Math.round(100*(1-p.badRatio))}%</td></tr>`).join("");
    P.innerHTML = `<h2>${fmtDate(rpDay)} · 24 小时平均分</h2>${thin}
      <div class="rp-chart"><canvas id="rpCanvas" role="img" aria-label="24 小时平均分曲线，虚线为 70 良好线与 80 高分参考线"></canvas></div>
      ${rows?`<table class="rp-table"><thead><tr><th>时段</th><th>平均分</th><th>有效分钟</th><th>良好占比</th></tr></thead><tbody>${rows}</tbody></table>`:'<p class="note">该日没有有效监测记录。</p>'}`;
    drawReportChart($("rpCanvas"), c.map(p=>({label:String(p.hour), score:p.score})), 3);
  } else if (rpTab==="day"){
    if (!r.hasData){ P.innerHTML=`<h2>${fmtDate(rpDay)} · 日报</h2><p class="note">该日没有有效监测记录。</p>`; return; }
    const y=report.dayReport(noonOf(rpDay,1)), st=report.streak(rpDay);
    const next=MILESTONES.find(m=>m>st.current);
    const diff = y.hasData ? Math.round(r.avgScore-y.avgScore) : null;
    const iss = r.topIssues.slice(0,5).map(i=>`<div class="iss"><span>${esc(issueName(i.k))}</span><div class="bar"><i style="width:${Math.round(i.ratio*100)}%;background:var(--warn)"></i></div><span class="mono">${Math.round(i.ratio*100)}%</span></div>`).join("");
    P.innerHTML = `<h2>${fmtDate(rpDay)} · 日报</h2>${thin}
      <div class="stat-grid" style="margin-top:10px">
        <div class="stat"><div class="l">平均分</div><div class="n mono">${Math.round(r.avgScore)}</div></div>
        <div class="stat"><div class="l">良好时长占比（≥70 分）</div><div class="n mono">${Math.round(r.goodRatio*100)}%<small> ${Math.round(r.goodMs/60000)} 分</small></div></div>
        <div class="stat"><div class="l">不良时长（&lt;70 分）</div><div class="n mono">${Math.round(r.badMs/60000)}<small> 分</small></div></div>
        <div class="stat"><div class="l">主动纠正</div><div class="n mono">${r.corrections}<small> 次</small></div></div>
        <div class="stat"><div class="l">有效休息（≥60 秒）</div><div class="n mono">${r.breaks}<small> 次</small></div></div>
        <div class="stat"><div class="l">较前一日</div><div class="n mono">${diff==null?"—":(diff>=0?"+":"")+diff}<small>${diff==null?" 前一日无数据":" 分"}</small></div></div>
      </div>
      <p class="note">连续达标 <b>${st.current}</b> 天（最长 ${st.best} 天）${st.todayQualified?"，当日已达标":""}${next?`，距 ${next} 天里程碑还差 ${next-st.current} 天`:""}。</p>
      <h2 style="margin-top:12px">问题分布（占有效样本）</h2>${iss||'<p class="note">未检测到明显问题。</p>'}`;
  } else {
    const c=report.dailyCurve(rpDay,14), a=agg7(rpDay,0), b=agg7(rpDay,7);
    const f=v=>v==null?"—":Math.round(v);
    const pct=v=>v==null?"—":Math.round(v*100)+"%";
    P.innerHTML = `<h2>近 14 日平均分趋势（截至 ${fmtDate(rpDay)}）</h2>
      <div class="rp-chart"><canvas id="rpCanvas" role="img" aria-label="近 14 日每日平均分趋势"></canvas></div>
      <table class="rp-table"><thead><tr><th>指标</th><th>近 7 日</th><th>前 7 日</th></tr></thead><tbody>
        <tr><td>有数据天数</td><td>${a.days}</td><td>${b.days}</td></tr>
        <tr><td>平均分</td><td>${f(a.avg)}</td><td>${f(b.avg)}</td></tr>
        <tr><td>良好时长占比</td><td>${pct(a.goodRatio)}</td><td>${pct(b.goodRatio)}</td></tr>
        <tr><td>有效监测（分）</td><td>${Math.round(a.minutes)}</td><td>${Math.round(b.minutes)}</td></tr>
      </tbody></table>`;
    drawReportChart($("rpCanvas"), c.map(p=>{ const d=new Date(p.t); return {label:`${d.getMonth()+1}/${d.getDate()}`, score:p.score}; }), 2);
  }
}
function refreshReport(now=Date.now()){
  rpNow=now;
  const ins=report.insights(now);
  $("todayInsights").innerHTML=ins.map(i=>`<li>${insightText(i)}</li>`).join("");
  $("storageError").textContent=report.storageError||"";
  const sel=$("rpDate"), keep=rpDay;
  sel.innerHTML=Array.from({length:30},(_,i)=>{ const t=noonOf(now,i); return `<option value="${t}">${i===0?"今天 · ":""}${fmtDate(t)}</option>`; }).join("");
  rpDay = [...sel.options].some(o=>+o.value===keep) ? keep : noonOf(now);
  sel.value=String(rpDay);
  if ($("dlgReport").open) renderReportPanel();
}
function setTab(tab){
  rpTab=tab;
  for (const b of document.querySelectorAll("[data-tab]")){
    const on=b.dataset.tab===tab;
    b.classList.toggle("on",on); b.setAttribute("aria-selected",on); b.tabIndex=on?0:-1;
    if (on) $("rpPanel").setAttribute("aria-labelledby",b.id);
  }
  renderReportPanel();
}
document.querySelectorAll("[data-tab]").forEach((b,i,all)=>{
  b.onclick=()=>setTab(b.dataset.tab);
  b.onkeydown=e=>{   // 方向键切换 tab（WAI-ARIA tabs 模式）
    const d=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0; if (!d) return;
    const n=all[(i+d+all.length)%all.length]; n.focus(); setTab(n.dataset.tab);
  };
});
$("rpDate").onchange=e=>{ rpDay=+e.target.value; renderReportPanel(); };
const openReport=()=>{ report.flush(); refreshReport(); $("dlgReport").showModal(); renderReportPanel(); };
$("btnReport").onclick=openReport; $("btnReportHome").onclick=openReport;
$("dlgClose3").onclick=()=>$("dlgReport").close();
$("btnRpCsv").onclick=()=>{
  const rows=[["类型","日期","时段","平均分","有效分钟","良好分钟(>=70)","不良分钟(<70)","纠正次数","有效休息次数"]];
  for (let i=29;i>=0;i--){
    const r=report.dayReport(noonOf(rpNow,i)); if (!r.hasData && !r.breaks) continue;
    rows.push(["日",new Date(r.date).toLocaleDateString("zh-CN"),"",r.hasData?Math.round(r.avgScore):"",Math.round(r.minutes),Math.round(r.goodMs/60000),Math.round(r.badMs/60000),r.corrections,r.breaks]);
  }
  for (const p of report.todayCurve(rpDay)) if (p.seatedMs>0)
    rows.push(["小时",new Date(p.t).toLocaleDateString("zh-CN"),`${p.hour}:00`,p.score==null?"":Math.round(p.score),Math.round(p.seatedMs/60000),Math.round(p.seatedMs*(1-p.badRatio)/60000),Math.round(p.seatedMs*p.badRatio/60000),"",""]);
  if (rows.length===1){ toast("暂无可导出的报告数据。"); return; }
  downloadCsv(rows, "PostureGuard报告_"+new Date(rpNow).toLocaleDateString("sv")+".csv");
};
setInterval(()=>{ report.flush(); refreshReport(); }, 30000);
document.addEventListener("visibilitychange",()=>{ if (document.hidden) report.flush(); });
window.addEventListener("pagehide",()=>report.flush());
window.addEventListener("resize",()=>{ if ($("dlgReport").open) renderReportPanel(); });
$("camSel").onchange=async()=>{ if (S.stream){ try{ await startCam(); }catch(e){ showError(camErrMsg(e)); } } };

// 设置面板
function bindSwitch(id, key, cb){
  const el=$(id); el.classList.toggle("on", !!SET[key]);
  el.onclick=()=>{ SET[key]=!SET[key]; el.classList.toggle("on",!!SET[key]); saveSet(); if (cb) cb(); };
}
function bindSeg(id, key, cast){
  const box=$(id);
  [...box.children].forEach(b=>{
    b.classList.toggle("on", cast(b.dataset.v)===SET[key]);
    b.onclick=()=>{ SET[key]=cast(b.dataset.v); saveSet();
      [...box.children].forEach(x=>x.classList.toggle("on",x===b)); };
  });
}
bindSeg("segSens","sens",Number);
bindSeg("segFps","fps",Number);
bindSwitch("swEye","eye"); bindSwitch("swSound","sound"); bindSwitch("swMirror","mirror",
  ()=>$("stage").classList.toggle("mirror",SET.mirror)); bindSwitch("swSkel","skel");
bindSwitch("swNotif","notif",async()=>{
  if (SET.notif && "Notification" in window && Notification.permission!=="granted"){
    const p=await Notification.requestPermission();
    if (p!=="granted"){ SET.notif=false; $("swNotif").classList.remove("on"); saveSet(); toast("通知权限未授予。"); }
  }
});
$("selWork").value=String(SET.workMin); $("selWork").onchange=e=>{SET.workMin=+e.target.value;saveSet();};
$("selBreak").value=String(SET.breakSec); $("selBreak").onchange=e=>{SET.breakSec=+e.target.value;saveSet();};
$("rgVol").value=Math.round(SET.vol*100); $("rgVol").oninput=e=>{SET.vol=+e.target.value/100;saveSet();};
$("stage").classList.toggle("mirror",SET.mirror);
$("btnSettings").onclick=()=>$("dlgSettings").showModal();
$("btnHelp").onclick=()=>$("dlgHelp").showModal();
$("dlgClose1").onclick=()=>$("dlgSettings").close();
$("dlgClose2").onclick=()=>$("dlgHelp").close();

/* ============================================================
   15. 测试钩子（供无头验证脚本使用）
============================================================ */
window.__guard = {
  get ready(){ return S.mode==="running" && !!S.landmarker && !!S.stream; },
  get mode(){ return S.mode; },
  get base(){ return S.base; },
  get state(){ return { score:S.score, level:LEVELS[S.levelIdx].n, smooth:{...S.smooth},
    curState:S.curState, poseSeen:S.poseSeen, frozen:S.frozen, awayStart:S.awayStart,
    timer:{...S.timer}, session:{...S.session}, yaw:S.smooth.yawDeg }; },
  get issues(){ return scoreFeatures(smoothedF(), S.base, SET.sens).issues.map(i=>({k:i.k,x:+i.x.toFixed(3),dir:i.dir})); },
  startCam, stopCam, start, stop,
  get set(){ return SET; },
  setTestPresence(v){ S.testHoldPresence=!!v; return true; },
  // 测试钩子：把「离开开始时刻」快进到 msAgo 毫秒前（模拟已离开一段时长）
  forceAwayStart(msAgo){ if (S.awayStart) S.awayStart = performance.now() - msAgo; return S.awayStart; },
  pauseLoop(){ cancelAnimationFrame(S.rafId); S.rafId=0; return true; },
  resumeLoop(){ if (!S.rafId && (S.mode==="running")) S.rafId=requestAnimationFrame(loop); return true; },
  camState(){ const v=$("video"); return { mode:S.mode, hasStream:!!S.stream, readyState:v?v.readyState:0,
    w:S.videoW, h:S.videoH, t:v?v.currentTime:0, paused:v?v.paused:true,
    errorShown:!!$("errBox").innerHTML && !$("errBox").hidden, errorBox:$("errBox").textContent.slice(0,120) }; },
  // 注入合成骨架：走完整链路 特征→评分→渲染（供无头验证脚本驱动）
  feedSynthetic(lm33, world){
    const now=performance.now();
    const ar=S.videoW/S.videoH||4/3;
    const f=computeFeatures(lm33, world, ar);
    if (!f.ok) return {ok:false, reason:f.reason};
    // 与主循环相同的在位三防线（几何校验 + 冻结检测），保证测试语义一致
    const human = looksHuman(lm33, ar);
    if (human){
      const shx=(lm33[IDX.LSH].x+lm33[IDX.RSH].x)/2, shy=(lm33[IDX.LSH].y+lm33[IDX.RSH].y)/2;
      S.trackHist.push({t:now, xs:[shx, shy, lm33[IDX.NOSE].x, lm33[IDX.NOSE].y]});
      while (S.trackHist.length && now-S.trackHist[0].t>4000) S.trackHist.shift();
    } else { S.trackHist=[]; }
    S.frozen = !!(human && trackSpread(S.trackHist, 3000) < 0.0012);
    // 全量替换语义：清掉旧缓存后只保留本次特征产出的指标（与自适应判定一致）
    S.smooth={}; S.missCnt={};
    for (const m of METRICS){ const v=f[m.k];
      if (typeof v==="number"&&isFinite(v)) S.smooth[m.k]=v; }
    S.smooth.shMidY_raw=f.shMidY; S.smooth.yawDeg=f.yawDeg;
    S.poseSeen = human && !S.frozen; S.lastSeen=now; if (S.poseSeen) S.curState="present"; S.lastLm=lm33;
    const r=scoreFeatures(smoothedF(), S.base, SET.sens);
    S.score=r.score; S.levelIdx=LEVELS.indexOf(r.level);
    S.conf = f.yawDeg<35?"ok":(f.yawDeg<55?"fair":"low");
    render(f, r, S.conf);
    return {ok:true, score:r.score, level:r.level.n, issues:r.issues.map(i=>({k:i.k,x:+i.x.toFixed(3),dir:i.dir}))};
  },
  setBase(b){ S.base=Object.assign({at:Date.now(),sw:0.2,shMidY:0.5},b); S.smooth={}; updateUI(); return S.base; },
  scoreOf(f, b, sens){ return scoreFeatures(f, b, sens===undefined?SET.sens:sens); },
  computeFeatures,
  METRICS,
  get report(){ return report; },
  refreshReport,
};

/* 初始化 */
updateUI();
drawChart();
refreshReport();
if (location.protocol==="file:") showError("当前通过 file:// 打开，浏览器会禁用摄像头。\n请从已安装的应用地址打开。");
else {
  $("camSel").onclick=refreshDevices;
  if ("Notification" in window && Notification.permission==="default"){}
}