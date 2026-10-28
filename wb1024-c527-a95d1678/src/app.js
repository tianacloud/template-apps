document.body.dataset.theme = "dusk";
document.head.insertAdjacentHTML("beforeend", "<style>\n/* ═══════════════════════════════════════════════════════════\n   远眺 — Design tokens\n   自然柔和渐变：青蓝 / 薄荷绿 / 雾气白\n   规则：低饱和、低对比、无纯黑纯白、无强烈红橙\n   ═══════════════════════════════════════════════════════════ */\n:root{\n  --serif: \"Songti SC\",\"Noto Serif SC\",\"Source Han Serif SC\",\"STZhongsong\",serif;\n  --sans: \"PingFang SC\",\"HarmonyOS Sans SC\",\"Microsoft YaHei UI\",\"Microsoft YaHei\",system-ui,sans-serif;\n\n  --radius: 22px;\n  --ease: cubic-bezier(.16,1,.3,1);   /* ease-out-quart */\n  --ease-soft: cubic-bezier(.3,.9,.3,1);\n\n  --haze1: oklch(88% .045 178);\n  --haze2: oklch(89% .04 222);\n  --haze3: oklch(91% .038 140);\n}\n\n/* ── 主题：暮色（默认，夜间更省眼） ── */\n[data-theme=\"dusk\"]{\n  --bg-0: oklch(20% .022 200);\n  --bg-1: oklch(24% .026 195);\n  --ink: oklch(93% .012 170);\n  --ink-2: oklch(80% .016 175);\n  --ink-3: oklch(63% .014 180);\n  --sea: oklch(78% .085 185);\n  --moss: oklch(81% .075 152);\n  --sky: oklch(80% .07 232);\n  --sand: oklch(86% .05 82);\n  --panel: oklch(26% .024 198 / .62);\n  --line: oklch(70% .03 185 / .16);\n  --glow: oklch(86% .09 183 / .35);\n  --haze-op: .5;\n}\n\n/* ── 主题：晨雾（日间） ── */\n[data-theme=\"dawn\"]{\n  --bg-0: oklch(96.5% .012 175);\n  --bg-1: oklch(94% .018 195);\n  --ink: oklch(30% .026 190);\n  --ink-2: oklch(43% .024 188);\n  --ink-3: oklch(58% .02 185);\n  --sea: oklch(52% .088 190);\n  --moss: oklch(54% .085 152);\n  --sky: oklch(56% .08 232);\n  --sand: oklch(56% .075 72);\n  --panel: oklch(99% .008 180 / .66);\n  --line: oklch(45% .03 185 / .14);\n  --glow: oklch(70% .09 185 / .30);\n  --haze-op: .78;\n}\n\n*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}\nhtml,body{height:100%}\nbody{\n  font-family:var(--sans);\n  background:var(--bg-0);\n  color:var(--ink);\n  overflow:hidden;\n  overscroll-behavior:none;\n  -webkit-font-smoothing:antialiased;\n  transition: background .9s var(--ease), color .9s var(--ease);\n  user-select:none;\n}\nbutton{font-family:inherit;color:inherit;background:none;border:none;cursor:pointer}\nbutton:focus-visible,[tabindex]:focus-visible{\n  outline:2px solid var(--sea);\n  outline-offset:4px;\n  border-radius:6px;\n}\n\n/* ═══════════ 背景层 ═══════════ */\n#stage{position:fixed;inset:0;overflow:hidden}\ncanvas#bg{position:absolute;inset:0;width:100%;height:100%;display:block}\n.grain{\n  position:absolute;inset:0;pointer-events:none;opacity:.5;mix-blend-mode:overlay;\n  background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/><feColorMatrix type='saturate' values='0'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='.32'/></svg>\");\n  opacity:.055;\n}\n.vignette{\n  position:absolute;inset:0;pointer-events:none;\n  background:radial-gradient(115% 90% at 50% 42%, transparent 42%, oklch(20% .02 200 / .28) 100%);\n}\n[data-theme=\"dawn\"] .vignette{background:radial-gradient(120% 95% at 50% 45%,transparent 48%,oklch(70% .02 195 / .18) 100%)}\n\n/* ═══════════ 游戏画布 ═══════════ */\ncanvas#game{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}\n\n/* ═══════════ HUD ═══════════ */\n.hud{\n  position:absolute;inset:0;pointer-events:none;\n  display:flex;flex-direction:column;\n  padding:clamp(16px,3.4vh,34px) clamp(18px,4vw,52px) clamp(14px,3vh,28px);\n  z-index:20;\n}\n.hud-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}\n\n.mark{display:flex;flex-direction:column;gap:5px}\n.mark b{\n  font-family:var(--serif);font-size:clamp(19px,2.1vw,24px);font-weight:600;\n  letter-spacing:.22em;color:var(--ink);\n}\n.mark span{\n  font-size:11.5px;letter-spacing:.2em;color:var(--ink-3);font-weight:400;\n}\n.round-tag{\n  font-size:11.5px;letter-spacing:.16em;color:var(--sea);\n  padding:5px 12px;border:1px solid var(--line);border-radius:100px;\n  background:var(--panel);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);\n  white-space:nowrap;\n}\n.hud-right{display:flex;align-items:center;gap:8px;pointer-events:auto}\n\n.icon-btn{\n  width:38px;height:38px;border-radius:12px;display:grid;place-items:center;\n  border:1px solid var(--line);background:var(--panel);\n  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);\n  color:var(--ink-2);transition:color .3s var(--ease),border-color .3s var(--ease),transform .35s var(--ease);\n}\n.icon-btn:hover{color:var(--ink);border-color:oklch(70% .05 185 / .36);transform:translateY(-1px)}\n.icon-btn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}\n\n/* 关卡进度点 */\n.pips{display:flex;gap:6px;align-items:center;margin-top:clamp(10px,2vh,20px);pointer-events:none}\n.pip{\n  width:22px;height:3px;border-radius:3px;background:oklch(70% .03 185 / .18);\n  transition:background .6s var(--ease),box-shadow .6s var(--ease),width .6s var(--ease);\n}\n.pip.done{background:var(--sea);opacity:.55}\n.pip.now{background:var(--sea);width:34px;box-shadow:0 0 12px var(--glow)}\n\n/* 中央提示区 */\n.center-msg{\n  flex:1;display:grid;place-items:center;text-align:center;pointer-events:none;\n  opacity:0;transition:opacity .7s var(--ease),transform .7s var(--ease);transform:translateY(10px);\n}\n.center-msg.show{opacity:1;transform:none}\n.center-msg .big{\n  font-family:var(--serif);font-weight:500;line-height:1.5;\n  font-size:clamp(19px,2.6vw,30px);letter-spacing:.06em;color:var(--ink);\n  text-shadow:0 2px 26px oklch(20% .02 200 / .3);\n  max-width:min(24em,86vw);\n}\n.center-msg .sub{margin-top:14px;font-size:13px;letter-spacing:.14em;color:var(--ink-3)}\n\n/* 底部控制 */\n.hud-bottom{display:flex;align-items:flex-end;justify-content:space-between;gap:14px}\n.hint{\n  font-size:12px;letter-spacing:.1em;color:var(--ink-2);\n  display:flex;align-items:center;gap:9px;opacity:.9;\n  transition:opacity .5s var(--ease);\n}\n.hint .dot{\n  width:6px;height:6px;border-radius:50%;background:var(--sea);\n  box-shadow:0 0 10px var(--glow);animation:breathe 2.6s var(--ease-soft) infinite;\n}\n@keyframes breathe{0%,100%{opacity:.35;transform:scale(.85)}50%{opacity:1;transform:scale(1)}}\n.ctrls{display:flex;gap:9px;pointer-events:auto}\n.pill{\n  padding:10px 19px;border-radius:100px;font-size:12.5px;letter-spacing:.14em;\n  border:1px solid var(--line);background:var(--panel);color:var(--ink-2);\n  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);\n  transition:all .35s var(--ease);\n}\n.pill:hover{color:var(--ink);border-color:oklch(70% .05 185 / .34);transform:translateY(-1px)}\n.pill.solid{background:var(--sea);color:var(--bg-0);border-color:transparent;font-weight:600}\n.pill.solid:hover{box-shadow:0 6px 26px var(--glow);transform:translateY(-1px)}\n\n/* ═══════════ 覆盖层（首页 / 结算 / 暂停） ═══════════ */\n.veil{\n  position:fixed;inset:0;z-index:40;display:grid;place-items:center;\n  padding:clamp(20px,4vw,40px);\n  background:linear-gradient(165deg, oklch(20% .024 200 / .9), oklch(22% .026 190 / .94));\n  backdrop-filter:blur(22px) saturate(.9);-webkit-backdrop-filter:blur(22px) saturate(.9);\n  opacity:0;pointer-events:none;transition:opacity .7s var(--ease);\n}\n[data-theme=\"dawn\"] .veil{\n  background:linear-gradient(165deg, oklch(97% .012 180 / .93), oklch(93% .02 195 / .95));\n}\n.veil.on{opacity:1;pointer-events:auto}\n.veil-inner{\n  width:min(560px,100%);text-align:left;\n  transform:translateY(14px);transition:transform .8s var(--ease);\n}\n.veil.on .veil-inner{transform:none}\n\n.eyebrow{\n  font-size:11px;letter-spacing:.3em;color:var(--sea);margin-bottom:clamp(16px,3vh,26px);\n  display:flex;align-items:center;gap:12px;\n}\n.eyebrow::after{content:\"\";flex:1;height:1px;background:var(--line)}\n\nh1.title{\n  font-family:var(--serif);font-weight:500;\n  font-size:clamp(38px,7.2vw,68px);line-height:1.08;letter-spacing:.04em;\n  color:var(--ink);margin-bottom:16px;\n}\nh1.title em{\n  font-style:normal;display:block;\n  font-size:.4em;letter-spacing:.24em;color:var(--ink-3);margin-top:16px;font-weight:400;\n}\n.lede{\n  font-size:14.5px;line-height:2;color:var(--ink-2);max-width:30em;letter-spacing:.03em;\n  margin-bottom:clamp(20px,3.4vh,32px);\n}\n.lede b{color:var(--ink);font-weight:600}\n\n.rules{display:grid;gap:0;margin-bottom:clamp(22px,4vh,34px);border-top:1px solid var(--line)}\n.rule{\n  display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:baseline;\n  padding:12px 2px;border-bottom:1px solid var(--line);\n  opacity:0;transform:translateY(8px);\n}\n.veil.on .rule{animation:rise .7s var(--ease) forwards}\n.veil.on .rule:nth-child(1){animation-delay:.1s}\n.veil.on .rule:nth-child(2){animation-delay:.18s}\n.veil.on .rule:nth-child(3){animation-delay:.26s}\n.veil.on .rule:nth-child(4){animation-delay:.34s}\n@keyframes rise{to{opacity:1;transform:none}}\n.rule i{\n  font-family:var(--serif);font-style:normal;font-size:13px;color:var(--sea);\n  letter-spacing:.1em;min-width:2.4em;\n}\n.rule div{font-size:13px;line-height:1.75;color:var(--ink-2)}\n.rule div b{color:var(--ink);font-weight:600}\n\n.actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}\n.btn-main{\n  padding:15px 34px;border-radius:100px;background:var(--sea);color:var(--bg-0);\n  font-size:14px;letter-spacing:.18em;font-weight:600;\n  transition:all .4s var(--ease);position:relative;\n}\n[data-theme=\"dawn\"] .btn-main{color:oklch(99% .005 180)}\n.btn-main:hover{box-shadow:0 8px 34px var(--glow);transform:translateY(-2px)}\n.btn-main:active{transform:translateY(0) scale(.985)}\n.btn-ghost{\n  padding:15px 22px;border-radius:100px;font-size:13px;letter-spacing:.14em;\n  color:var(--ink-3);border:1px solid var(--line);transition:all .35s var(--ease);\n}\n.btn-ghost:hover{color:var(--ink-2);border-color:oklch(70% .05 185 / .34)}\n\n.note{\n  margin-top:clamp(16px,3vh,26px);font-size:11.5px;line-height:1.9;color:var(--ink-3);\n  letter-spacing:.04em;max-width:32em;\n}\n.note b{color:var(--ink-2);font-weight:500}\n\n/* ── 结算 ── */\n.result-head{display:flex;align-items:baseline;gap:14px;margin-bottom:6px}\n.result-head .num{\n  font-family:var(--serif);font-size:clamp(56px,11vw,88px);font-weight:500;\n  line-height:1;color:var(--sea);letter-spacing:-.02em;\n  font-variant-numeric:tabular-nums;\n}\n.result-head .unit{font-size:13px;letter-spacing:.2em;color:var(--ink-3);padding-bottom:10px}\n.subline{font-size:13px;color:var(--ink-3);letter-spacing:.1em;margin-bottom:clamp(20px,3.6vh,30px)}\n.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:16px;overflow:hidden;margin-bottom:clamp(22px,4vh,32px)}\n.stat{background:var(--bg-0);padding:15px 16px;display:flex;flex-direction:column;gap:7px}\n[data-theme=\"dawn\"] .stat{background:oklch(98% .008 180)}\n.stat small{font-size:11px;letter-spacing:.1em;color:var(--ink-3)}\n.stat b{font-family:var(--serif);font-size:22px;font-weight:500;color:var(--ink);font-variant-numeric:tabular-nums}\n.stat b span{font-size:12px;color:var(--ink-3);margin-left:3px;font-family:var(--sans)}\n\n/* 眨眼提醒 toast */\n.toast{\n  position:fixed;left:50%;bottom:clamp(80px,12vh,120px);transform:translate(-50%,14px);\n  z-index:15;padding:11px 22px;border-radius:100px;\n  background:var(--panel);border:1px solid var(--line);\n  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);\n  font-size:12.5px;letter-spacing:.12em;color:var(--ink-2);\n  opacity:0;pointer-events:none;transition:all .7s var(--ease);\n  white-space:nowrap;\n}\n.toast.on{opacity:1;transform:translate(-50%,0)}\n\n/* 眨眼遮罩 */\n.blink-veil{\n  position:fixed;inset:0;z-index:30;pointer-events:none;\n  background:var(--bg-0);opacity:0;transition:opacity .28s var(--ease);\n}\n\n/* 距离校准弹窗 */\n.sheet{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:22px;\n  background:oklch(18% .02 200 / .72);backdrop-filter:blur(10px);\n  opacity:0;pointer-events:none;transition:opacity .5s var(--ease)}\n.sheet.on{opacity:1;pointer-events:auto}\n.sheet-box{\n  width:min(430px,100%);background:var(--bg-1);border:1px solid var(--line);\n  border-radius:var(--radius);padding:clamp(22px,4vw,30px);\n  box-shadow:0 30px 80px -30px oklch(10% .02 200 / .8);\n  transform:translateY(10px);transition:transform .6s var(--ease);\n}\n.sheet.on .sheet-box{transform:none}\n.sheet-box h3{font-family:var(--serif);font-size:19px;font-weight:600;letter-spacing:.06em;margin-bottom:10px}\n.sheet-box p{font-size:12.5px;line-height:1.85;color:var(--ink-3);margin-bottom:20px}\n.field{display:flex;align-items:center;gap:10px;margin-bottom:14px}\n.field label{font-size:12.5px;color:var(--ink-2);letter-spacing:.06em;flex:1}\n.field input[type=range]{flex:1.3;accent-color:var(--sea);height:3px}\n.field output{font-family:var(--serif);font-size:15px;color:var(--sea);min-width:4.4em;text-align:right;font-variant-numeric:tabular-nums}\n.sheet-actions{display:flex;gap:10px;margin-top:22px}\n.sheet-actions .btn-main{flex:1;padding:13px 0;text-align:center;font-size:13px}\n\n/* 纯护眼模式（无游戏）计时 */\n.restable{position:fixed;inset:0;z-index:35;display:grid;place-items:center;\n  background:var(--bg-0);opacity:0;pointer-events:none;transition:opacity .9s var(--ease)}\n.restable.on{opacity:1;pointer-events:auto}\n.restable .ring{text-align:center}\n.restable .ring svg{width:min(280px,58vw);height:auto;transform:rotate(-90deg)}\n.restable .t{\n  font-family:var(--serif);font-size:clamp(40px,9vw,64px);font-weight:500;\n  color:var(--ink);font-variant-numeric:tabular-nums;letter-spacing:.02em;\n}\n.restable .lbl{font-size:12.5px;letter-spacing:.24em;color:var(--ink-3);margin-top:12px}\n\n@media (max-width:600px){\n  .rules{font-size:12px}\n  .hud-bottom{flex-direction:column;align-items:stretch;gap:12px}\n  .hint{justify-content:center}\n  .ctrls{justify-content:center}\n  .stats{grid-template-columns:1fr;gap:1px}\n  .stat{flex-direction:row;align-items:baseline;justify-content:space-between}\n}\n@media (prefers-reduced-motion:reduce){\n  *{animation-duration:.01ms !important;transition-duration:.01ms !important}\n}\n</style>");
document.body.insertAdjacentHTML("beforeend", "\n\n<div id=\"stage\">\n  <canvas id=\"bg\"></canvas>\n  <canvas id=\"game\"></canvas>\n  <div class=\"vignette\"></div>\n  <div class=\"grain\"></div>\n</div>\n\n<!-- ══════ HUD ══════ -->\n<div class=\"hud\">\n  <div class=\"hud-top\">\n    <div class=\"mark\">\n      <b>远 眺</b>\n      <span id=\"modeLabel\">20·20·20 护眼闯关</span>\n    </div>\n    <div style=\"display:flex;align-items:center;gap:10px\">\n      <div class=\"round-tag\" id=\"roundTag\">第 1 / 5 轮</div>\n      <div class=\"hud-right\">\n        <button class=\"icon-btn\" id=\"btnTheme\" title=\"切换昼夜\" aria-label=\"切换昼夜主题\">\n          <svg viewBox=\"0 0 24 24\"><path d=\"M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z\"/></svg>\n        </button>\n        <button class=\"icon-btn\" id=\"btnSound\" title=\"声音开关\" aria-label=\"声音开关\">\n          <svg viewBox=\"0 0 24 24\"><path d=\"M11 5 6 9H3v6h3l5 4V5z\"/><path d=\"M15.5 8.5a5 5 0 0 1 0 7\" class=\"wave\"/></svg>\n        </button>\n        <button class=\"icon-btn\" id=\"btnPause\" title=\"暂停\" aria-label=\"暂停\">\n          <svg viewBox=\"0 0 24 24\"><path d=\"M9 5v14M15 5v14\"/></svg>\n        </button>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"pips\" id=\"pips\"></div>\n\n  <div class=\"center-msg\" id=\"centerMsg\">\n    <div>\n      <div class=\"big\" id=\"cmBig\"></div>\n      <div class=\"sub\" id=\"cmSub\"></div>\n    </div>\n  </div>\n\n  <div class=\"hud-bottom\">\n    <div class=\"hint\"><span class=\"dot\"></span><span id=\"hintText\">把视线放到最远处，慢慢眨眼</span></div>\n    <div class=\"ctrls\">\n      <button class=\"pill\" id=\"btnSkip\">跳 过</button>\n      <button class=\"pill\" id=\"btnExit\">首 页</button>\n    </div>\n  </div>\n</div>\n\n<div class=\"toast\" id=\"toast\">记得眨眼 —— 眨眼是眼睛最好的按摩</div>\n<div class=\"blink-veil\" id=\"blinkVeil\"></div>\n\n<!-- ══════ 首页 ══════ -->\n<div class=\"veil on\" id=\"veilHome\">\n  <div class=\"veil-inner\">\n    <div class=\"eyebrow\">EYE REST · 20 20 20</div>\n    <h1 class=\"title\">远眺<em>让眼睛去一趟远方</em></h1>\n    <p class=\"lede\">\n      盯着近处屏幕时，睫状肌一直紧绷着。国际眼科学界推荐的 <b>20-20-20 法则</b>：每用眼 20 分钟，\n      抬头看 6 米以外的东西 20 秒。<br>\n      这一局，就是把那 20 秒变成一场看得见远方的短途旅行。\n    </p>\n\n    <div class=\"rules\">\n      <div class=\"rule\"><i>壹</i><div><b>凝视远方</b> — 让一束光带你沿地平线远去，视线跟着它，越高越远。</div></div>\n      <div class=\"rule\"><i>贰</i><div><b>追随云鸟</b> — 只动眼睛，不转脖子，追一只慢悠悠掠过天空的鸟。</div></div>\n      <div class=\"rule\"><i>叁</i><div><b>眨眼节奏</b> — 屏幕会温柔地暗一下，那是提醒你眨一次眼。</div></div>\n      <div class=\"rule\"><i>肆</i><div><b>远近视交替</b> — 远处的叶与近处的雾间切换焦点，像给肌肉做推拉训练。</div></div>\n    </div>\n\n    <div class=\"actions\">\n      <button class=\"btn-main\" id=\"btnStart\">开 始 一 局</button>\n      <button class=\"btn-ghost\" id=\"btnCalib\">校准观看距离</button>\n      <button class=\"btn-ghost\" id=\"btnPureRest\">只休息，不玩</button>\n    </div>\n\n    <p class=\"note\">\n      <b>说明：</b>本游戏是放松引导，不替代眼科诊断。已有眼疾、眩晕敏感或佩戴棱镜眼镜者，请谨慎跟随动效。<br>\n      建议全屏（F11）使用。你与屏幕的距离：<span id=\"distReadout\">约 60 cm</span>\n    </p>\n  </div>\n</div>\n\n<!-- ══════ 结算 ══════ -->\n<div class=\"veil\" id=\"veilResult\">\n  <div class=\"veil-inner\">\n    <div class=\"eyebrow\">SESSION COMPLETE</div>\n    <div class=\"result-head\">\n      <div class=\"num\" id=\"rsNum\">0</div>\n      <div class=\"unit\">秒 凝 视 远 方</div>\n    </div>\n    <div class=\"subline\" id=\"rsLine\">睫状肌已经松下来了</div>\n\n    <div class=\"stats\">\n      <div class=\"stat\"><small>远眺总时长</small><b id=\"rsFar\">—</b></div>\n      <div class=\"stat\"><small>眨眼次数</small><b id=\"rsBlink\">—</b></div>\n      <div class=\"stat\"><small>眼动跟随</small><b id=\"rsTrack\">—</b></div>\n    </div>\n\n    <div class=\"actions\">\n      <button class=\"btn-main\" id=\"btnAgain\">再 来 一 局</button>\n      <button class=\"btn-ghost\" id=\"btnHome2\">回到首页</button>\n    </div>\n    <p class=\"note\" id=\"rsTip\"></p>\n  </div>\n</div>\n\n<!-- ══════ 暂停 ══════ -->\n<div class=\"veil\" id=\"veilPause\">\n  <div class=\"veil-inner\" style=\"text-align:center\">\n    <div class=\"eyebrow\" style=\"justify-content:center\">PAUSED</div>\n    <h1 class=\"title\" style=\"font-size:clamp(30px,5vw,44px)\">先歇一会儿</h1>\n    <p class=\"lede\" style=\"margin-inline:auto\">转身看看窗外，或者就闭眼十秒。</p>\n    <div class=\"actions\" style=\"justify-content:center\">\n      <button class=\"btn-main\" id=\"btnResume\">继 续</button>\n      <button class=\"btn-ghost\" id=\"btnHome3\">退出</button>\n    </div>\n  </div>\n</div>\n\n<!-- ══════ 距离校准 ══════ -->\n<div class=\"sheet\" id=\"sheetCalib\">\n  <div class=\"sheet-box\">\n    <h3>校准观看距离</h3>\n    <p>不用真实测量。拖动滑块，让下面这条线的长度在你看来等于 10 厘米——用一张银行卡（长边约 8.6 厘米）在旁边对照即可。这个数值只用来估算「20 英尺 ≈ 6 米」在屏幕上该缩多小。</p>\n    <div class=\"field\">\n      <label for=\"calRuler\">屏幕上的这条线，你觉得是 10 cm</label>\n    </div>\n    <div style=\"height:2px;background:var(--sea);opacity:.75;margin-bottom:22px;transition:width .1s linear\" id=\"ruler\"></div>\n    <div class=\"field\">\n      <label for=\"calDist\">我平时离屏幕</label>\n      <input type=\"range\" id=\"calDist\" min=\"30\" max=\"120\" value=\"60\" step=\"5\">\n      <output id=\"calDistOut\">60 cm</output>\n    </div>\n    <div class=\"sheet-actions\">\n      <button class=\"btn-main\" id=\"btnCalibSave\">好 了</button>\n      <button class=\"btn-ghost\" id=\"btnCalibCancel\" style=\"padding:13px 20px\">取消</button>\n    </div>\n  </div>\n</div>\n\n");

/* ═══════════════════════════════════════════════════════════
   远眺 · 20-20-20 护眼闯关
   单文件实现 —— 无依赖，纯 Canvas 2D
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ─────────── 工具 ─────────── */
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const DPR = () => Math.min(window.devicePixelRatio || 1, 2.5);

/* ─────────── 状态 ─────────── */
const S = {
  W: 0, H: 0, cx: 0, cy: 0,
  t: 0,            // 全局秒
  running: false,
  paused: false,
  scene: 'home',   // home | level
  round: 0,
  totalRounds: 5,
  phase: 'idle',   // 当前关卡阶段
  phaseT: 0,
  script: null,
  // 统计
  stats: { far: 0, blink: 0, track: 0, session: 0 },
  // 设置
  sound: true,
  distCm: 60,
  // 眼睛位置（追踪用），屏幕坐标
  eye: { x: 0, y: 0, vx: 0, vy: 0 },
  blinkIn: 0,
  // 主题调色板（从 CSS 变量读取）
  palette: {},
};

/* ─────────── 安全存储（沙箱/隐私模式下 localStorage 会抛异常，回退内存） ─────────── */
const _mem = {};
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return _mem[k] ?? null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { _mem[k] = v; } },
};

/* ─────────── Canvas 初始化 ─────────── */
const bg = $('#bg'), bgx = bg.getContext('2d');
const gm = $('#game'), gx = gm.getContext('2d');

function resize() {
  const d = DPR();
  S.W = window.innerWidth; S.H = window.innerHeight;
  S.cx = S.W / 2; S.cy = S.H / 2;
  [bg, gm].forEach((c) => {
    c.width = Math.floor(S.W * d); c.height = Math.floor(S.H * d);
    c.style.width = S.W + 'px'; c.style.height = S.H + 'px';
  });
  bgx.setTransform(d, 0, 0, d, 0, 0);
  gx.setTransform(d, 0, 0, d, 0, 0);
  buildFog();
}
window.addEventListener('resize', resize);

/* ─────────── 读取主题色（oklch → 用于 canvas） ─────────── */
function readPalette() {
  // 临时关闭 body 过渡，避免读到过渡中间值
  const prev = document.body.style.transition;
  document.body.style.transition = 'none';
  void document.body.offsetWidth;
  const cs = getComputedStyle(document.body);
  const gv = (n) => cs.getPropertyValue(n).trim();
  const tmp = document.createElement('canvas').getContext('2d');
  const norm = (c) => { tmp.fillStyle = '#000'; tmp.fillStyle = c; return tmp.fillStyle; };
  S.palette = {
    bg0: norm(gv('--bg-0')),
    bg1: norm(gv('--bg-1')),
    sea: norm(gv('--sea')),
    moss: norm(gv('--moss')),
    sky: norm(gv('--sky')),
    sand: norm(gv('--sand')),
    ink: norm(gv('--ink')),
    ink3: norm(gv('--ink-3')),
    hazeOp: parseFloat(gv('--haze-op')) || .5,
    dawn: document.body.dataset.theme === 'dawn',
  };
  document.body.style.transition = prev;
}
/* ─────────── oklch → sRGB 转换（canvas 需要真实 rgb 值） ─────────── */
const _colCache = new Map();
function parseColor(str) {
  if (_colCache.has(str)) return _colCache.get(str);
  let out = [0, 0, 0];
  const s = str.trim();
  let m;
  if ((m = s.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/))) {
    // oklch → oklab（L 支持 0-1 或 0-100 两种写法）
    const Lv0 = parseFloat(m[1]);
    const Lv = Lv0 <= 1 ? Lv0 : Lv0 / 100;
    const C = parseFloat(m[2]);
    const Hd = parseFloat(m[3]) * Math.PI / 180;
    const a = Math.cos(Hd) * C, b = Math.sin(Hd) * C;
    // oklab → lms'
    const l_ = Lv + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = Lv - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = Lv - 0.0894841775 * a - 1.2914855480 * b;
    const l = l_ ** 3, mm = m_ ** 3, ss = s_ ** 3;
    // lms' → linear sRGB
    let r = +4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * ss;
    let g = -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * ss;
    let bl = -0.0041960863 * l - 0.7034186147 * mm + 1.7076147010 * ss;
    // gamma
    const gam = (c) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    out = [
      Math.round(clamp(gam(r), 0, 1) * 255),
      Math.round(clamp(gam(g), 0, 1) * 255),
      Math.round(clamp(gam(bl), 0, 1) * 255),
    ];
  } else if ((m = s.match(/#([0-9a-f]{6})/i))) {
    const n = parseInt(m[1], 16);
    out = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  } else if ((m = s.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/))) {
    out = [Math.round(+m[1]), Math.round(+m[2]), Math.round(+m[3])];
  }
  _colCache.set(str, out);
  return out;
}
const hex2rgb = (h) => parseColor(h);
const rgba = (c, a) => { const [r, g, b] = parseColor(c); return `rgba(${r},${g},${b},${a})`; };
const mix = (c1, c2, t) => {
  const a = parseColor(c1), b = parseColor(c2);
  return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
};

/* ═══════════════════════════════════════════════════════════
   背景：柔和渐变 + 缓慢流动的雾 + 漂浮光尘
   ═══════════════════════════════════════════════════════════ */
let fogBlobs = [], motes = [];

function buildFog() {
  const p = S.palette;
  const cols = [p.sea, p.moss, p.sky, p.sand];
  fogBlobs = [];
  const n = S.W < 700 ? 4 : 6;
  for (let i = 0; i < n; i++) {
    fogBlobs.push({
      x: rand(0, S.W), y: rand(0, S.H),
      r: rand(Math.min(S.W, S.H) * .34, Math.min(S.W, S.H) * .78),
      c: cols[i % cols.length],
      a: rand(.10, .22),
      sx: rand(-.028, .028), sy: rand(-.02, .02),
      ph: rand(0, Math.PI * 2), sp: rand(.05, .13),
    });
  }
  motes = [];
  const mn = S.W < 700 ? 34 : 66;
  for (let i = 0; i < mn; i++) {
    motes.push({
      x: rand(0, S.W), y: rand(0, S.H), r: rand(.5, 1.9),
      vx: rand(-.10, .10), vy: rand(-.13, -.025),
      a: rand(.12, .48), ph: rand(0, 6.28), sp: rand(.3, 1.0),
      c: Math.random() < .5 ? p.sea : p.moss,
    });
  }
}

function drawFog(dt) {
  const p = S.palette;
  // 基础渐变
  const g = bgx.createLinearGradient(0, 0, S.W * .35, S.H);
  g.addColorStop(0, p.bg1);
  g.addColorStop(.55, p.bg0);
  g.addColorStop(1, p.bg1);
  bgx.fillStyle = g;
  bgx.fillRect(0, 0, S.W, S.H);

  // 雾团（柔和径向渐变，缓慢飘移）
  bgx.globalCompositeOperation = p.dawn ? 'source-over' : 'lighter';
  for (const b of fogBlobs) {
    b.x += b.sx * dt * 10; b.y += b.sy * dt * 10;
    b.ph += dt * b.sp;
    const wob = Math.sin(b.ph) * 26;
    if (b.x < -b.r * .6) b.x = S.W + b.r * .6;
    if (b.x > S.W + b.r * .6) b.x = -b.r * .6;
    if (b.y < -b.r * .6) b.y = S.H + b.r * .6;
    if (b.y > S.H + b.r * .6) b.y = -b.r * .6;
    const rg = bgx.createRadialGradient(b.x + wob, b.y + wob * .5, 0, b.x + wob, b.y + wob * .5, b.r);
    rg.addColorStop(0, rgba(b.c, b.a * p.hazeOp));
    rg.addColorStop(.45, rgba(b.c, b.a * .42 * p.hazeOp));
    rg.addColorStop(1, rgba(b.c, 0));
    bgx.fillStyle = rg;
    bgx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
  }
  bgx.globalCompositeOperation = 'source-over';

  // 光尘
  for (const m of motes) {
    m.x += m.vx * dt * 10 + Math.sin(S.t * m.sp + m.ph) * .28;
    m.y += m.vy * dt * 10;
    if (m.y < -8) { m.y = S.H + 8; m.x = rand(0, S.W); }
    if (m.x < -8) m.x = S.W + 8; if (m.x > S.W + 8) m.x = -8;
    m.ph += dt * m.sp;
    const a = m.a * (.55 + .45 * Math.sin(m.ph)) * (p.dawn ? .75 : 1);
    bgx.beginPath();
    bgx.arc(m.x, m.y, m.r, 0, 6.283);
    bgx.fillStyle = rgba(m.c, a);
    bgx.fill();
  }
}

/* ═══════════════════════════════════════════════════════════
   关卡脚本系统
   每个关卡是一个 phase 序列，每 phase 有 duration + enter + draw + exit
   ═══════════════════════════════════════════════════════════ */
const LEVELS = [
  /* ① 凝视远方 —— 20 秒倒计时，光点沿地平线远去 */
  {
    id: 'vista', name: '凝视远方', hint: '视线跟着那束光，走向地平线',
    build: () => ({
      phases: [
        { id: 'settle', dur: 2.6 },
        { id: 'gaze', dur: 20 },
      ],
    }),
  },
  /* ② 追随云鸟 —— 用眼睛追踪慢速目标 */
  {
    id: 'bird', name: '追随云鸟', hint: '只动眼睛，别转头',
    build: () => ({
      phases: [
        { id: 'settle', dur: 2.2 },
        { id: 'track', dur: 22 },
      ],
    }),
  },
  /* ③ 远近交替 —— 焦点在远/近之间推拉 */
  {
    id: 'focus', name: '远近交替', hint: '远处的叶清晰时，近处的雾会模糊',
    build: () => ({
      phases: [
        { id: 'settle', dur: 2.2 },
        { id: 'pull', dur: 24 },
      ],
    }),
  },
  /* ④ 眨眼节奏 —— 跟随呼吸式眨眼 */
  {
    id: 'blink', name: '眨眼节奏', hint: '遮罩落下时，轻轻闭上眼',
    build: () => ({
      phases: [
        { id: 'settle', dur: 2.2 },
        { id: 'rhythm', dur: 22 },
      ],
    }),
  },
  /* ⑤ 全景漫游 —— 综合：缓慢环视，最后一次深度放松 */
  {
    id: 'panorama', name: '全景漫游', hint: '让视线慢慢画一个大圈',
    build: () => ({ phases: [{ id: 'settle', dur: 2.0 }, { id: 'pan', dur: 24 }] }),
  },
];

/* ─────────── 关卡渲染 ─────────── */

// ① 远方光点：从近地板沿地平线远去，同时强度递减
const vista = { k: 0, trail: [] };

function drawVista(ctx, phase, p, dt) {
  const W = S.W, H = S.H, cx = S.cx;
  const horizon = H * .52;
  const pIn = clamp(phase.t / 2.4, 0, 1);         // 淡入
  const kTarget = phase.id === 'gaze' ? clamp(phase.t / 18, 0, 1) : 0;
  vista.k = lerp(vista.k, kTarget, 1 - Math.pow(.001, dt));

  // 远山剪影（三层，越远越淡，营造深度）
  const far = S.palette;
  const layers = [
    { y: horizon - H * .02, amp: H * .075, a: .10, col: far.sky, f: .0021, ph: 0 },
    { y: horizon + H * .045, amp: H * .055, a: .14, col: far.moss, f: .0032, ph: 1.7 },
    { y: horizon + H * .11, amp: H * .038, a: .18, col: far.sea, f: .0047, ph: 3.4 },
  ];
  for (let i = 0; i < layers.length; i++) {
    const L = layers[i];
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) {
      const n = Math.sin(x * L.f + L.ph) * .6 + Math.sin(x * L.f * 2.3 + L.ph * 1.9) * .3
        + Math.sin(x * L.f * 5.1 + L.ph * .7) * .12;
      ctx.lineTo(x, L.y - n * L.amp);
    }
    ctx.lineTo(W, H); ctx.closePath();
    const lg = ctx.createLinearGradient(0, L.y - L.amp, 0, H);
    lg.addColorStop(0, rgba(L.col, L.a * 1.5 * pIn));
    lg.addColorStop(1, rgba(L.col, L.a * .25 * pIn));
    ctx.fillStyle = lg; ctx.fill();
  }

  // 地平线光带
  const hg = ctx.createLinearGradient(0, horizon - H * .16, 0, horizon + H * .06);
  hg.addColorStop(0, rgba(p.sand, 0));
  hg.addColorStop(.72, rgba(p.sand, .045 * pIn));
  hg.addColorStop(1, rgba(p.sand, 0));
  ctx.fillStyle = hg; ctx.fillRect(0, horizon - H * .16, W, H * .22);

  // 光点：远处逐渐缩小 + 淡化 + 上移（透视）
  const k = vista.k;
  const px = cx + Math.sin(phase.t * .4) * W * .035 * k;
  const py = H * .78 - k * (H * .78 - horizon) * .92;
  const pr = lerp(Math.min(W, H) * .028, Math.min(W, H) * .006, easeOutQuart(k));
  const alpha = (1 - k * .42) * pIn;

  // 光晕
  const halo = ctx.createRadialGradient(px, py, 0, px, py, pr * 7);
  halo.addColorStop(0, rgba(p.sea, .30 * alpha));
  halo.addColorStop(.35, rgba(p.sea, .10 * alpha));
  halo.addColorStop(1, rgba(p.sea, 0));
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(px, py, pr * 7, 0, 6.283); ctx.fill();

  // 核心
  const core = ctx.createRadialGradient(px, py - pr * .2, 0, px, py, pr);
  core.addColorStop(0, rgba(p.ink, .92 * alpha));
  core.addColorStop(.4, rgba(p.sand, .72 * alpha));
  core.addColorStop(1, rgba(p.sand, 0));
  ctx.beginPath(); ctx.arc(px, py, pr, 0, 6.283); ctx.fillStyle = core; ctx.fill();

  // 地面反光路径
  const pathW = lerp(W * .34, W * .04, k);
  const pg = ctx.createLinearGradient(px, py, px, H);
  pg.addColorStop(0, rgba(p.sea, .13 * alpha));
  pg.addColorStop(1, rgba(p.sea, 0));
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.moveTo(px - pathW * .5, H); ctx.lineTo(px - pr * .8, py);
  ctx.lineTo(px + pr * .8, py); ctx.lineTo(px + pathW * .5, H);
  ctx.closePath(); ctx.fill();

  // 倒计时环（极细，不喧宾夺主）
  if (phase.id === 'gaze') {
    const prog = clamp(phase.t / 20, 0, 1);
    const R = Math.min(W, H) * .115;
    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = rgba(p.ink3, .12);
    ctx.beginPath(); ctx.arc(S.cx, H * .5, R, 0, 6.283); ctx.stroke();
    ctx.strokeStyle = rgba(p.sea, .55);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(S.cx, H * .5, R, -Math.PI / 2, -Math.PI / 2 + 6.283 * prog);
    ctx.stroke();
    ctx.restore();
  }
}

// ② 云鸟：缓慢的 8 字形/利萨如轨迹，引导眼球做大幅平滑转动
function drawBird(ctx, phase, p, dt) {
  const W = S.W, H = S.H, t = phase.t;
  const pIn = clamp(t / 1.8, 0, 1);
  const ax = Math.min(W, H) * .34, ay = Math.min(H, W) * .26;

  // 轨迹上淡淡的云带
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const off = i * 2.1;
    const gx0 = S.cx + Math.sin(t * .55 + off) * ax;
    const gy0 = S.cy - H * .06 + Math.sin(t * .8 + off * 1.4) * ay;
    const rg = ctx.createRadialGradient(gx0, gy0, 0, gx0, gy0, Math.min(W, H) * .28);
    rg.addColorStop(0, rgba(p.sky, .055 * pIn));
    rg.addColorStop(1, rgba(p.sky, 0));
    ctx.fillStyle = rg;
    ctx.fillRect(gx0 - W, gy0 - H * .4, W * 2, H);
  }
  ctx.restore();

  // 位置（利萨如曲线）
  const x = S.cx + Math.sin(t * .55) * ax;
  const y = S.cy - H * .05 + Math.sin(t * .83) * ay;
  const vx = Math.cos(t * .55) * ax * .55;
  const vy = Math.cos(t * .83) * ay * .83;
  const ang = Math.atan2(vy, vx);
  const flap = Math.sin(t * 5.2);

  // 方向变化 → 统计「眼动跟随」质量
  if (phase.t > 1) S.stats.track += 0.0022;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang * .22);
  const sc = Math.min(W, H) / 720;

  // 光晕
  const hlg = ctx.createRadialGradient(0, 0, 0, 0, 0, 46 * sc);
  hlg.addColorStop(0, rgba(p.sea, .22 * pIn));
  hlg.addColorStop(1, rgba(p.sea, 0));
  ctx.fillStyle = hlg; ctx.beginPath(); ctx.arc(0, 0, 46 * sc, 0, 6.283); ctx.fill();

  // 双翼（贝塞尔，随速度开合）
  const wing = 26 + flap * 9;
  ctx.fillStyle = rgba(p.ink, .88 * pIn);
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(s * wing * .55, -wing * .52, s * wing * 1.15, -wing * .30, s * wing * 1.35, wing * .05);
    ctx.bezierCurveTo(s * wing * .95, wing * .18, s * wing * .45, wing * .28, 0, wing * .12);
    ctx.closePath(); ctx.fill();
  }
  // 身体
  ctx.beginPath();
  ctx.ellipse(0, 0, 9 * sc, 4.2 * sc, 0, 0, 6.283);
  ctx.fillStyle = rgba(p.ink, .82 * pIn); ctx.fill();

  // 注视提示环
  ctx.beginPath();
  ctx.arc(0, 0, 20 * sc, 0, 6.283);
  ctx.strokeStyle = rgba(p.sea, .16 * pIn);
  ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}

// ③ 远近交替：焦点在「远处叶片」与「近处雾滴」之间切换
const focus = { near: 0, nearTarget: 0 };
function drawFocus(ctx, phase, p, dt) {
  const W = S.W, H = S.H, t = phase.t;
  const pIn = clamp(t / 2, 0, 1);
  // 周期 6 秒切换一次焦距
  const cycle = 6.0;
  const inCycle = (t % cycle) / cycle;
  const toNear = Math.floor(t / cycle) % 2 === 1;
  focus.nearTarget = toNear ? 1 : 0;
  focus.near = lerp(focus.near, focus.nearTarget, 1 - Math.pow(.06, dt));

  const nf = focus.near;              // 0=远清晰 1=近清晰
  const blurFar = 1 - clamp((1 - nf) * 1.6, 0, 1);   // 远处模糊度
  const blurNear = 1 - clamp(nf * 1.6, 0, 1);

  // 远景：一片模糊的柔和林影
  ctx.save();
  ctx.filter = `blur(${(blurFar * 9).toFixed(1)}px)`;
  // 树冠群
  const seedCount = 7;
  for (let i = 0; i < seedCount; i++) {
    const bx = W * (.10 + i * .135) + Math.sin(S.t * .12 + i) * 12;
    const by = H * .46 + Math.sin(i * 2.3) * H * .05;
    const rr = Math.min(W, H) * (.10 + (i % 3) * .035);
    const cg = ctx.createRadialGradient(bx, by, 0, bx, by, rr);
    cg.addColorStop(0, rgba(i % 2 ? p.moss : p.sea, .26 * pIn));
    cg.addColorStop(.6, rgba(i % 2 ? p.moss : p.sea, .11 * pIn));
    cg.addColorStop(1, rgba(i % 2 ? p.moss : p.sea, 0));
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(bx, by, rr, 0, 6.283); ctx.fill();
  }
  // 远方的叶脉主叶
  const lx = S.cx, ly = H * .40, ls = Math.min(W, H) * .20;
  drawLeaf(ctx, lx, ly, ls, rgba(p.moss, .42 * pIn), rgba(p.sea, .18 * pIn));
  ctx.restore();

  // 近景：一片更大的叶（前景），在画面右下
  ctx.save();
  ctx.filter = `blur(${(blurNear * 12).toFixed(1)}px)`;
  const nx = S.cx + W * .26, ny = S.cy + H * .18, ns = Math.min(W, H) * .42;
  ctx.globalAlpha = .9;
  drawLeaf(ctx, nx, ny, ns, rgba(p.sea, .13 * pIn), rgba(p.sand, .05 * pIn), -.42);
  ctx.restore();

  // 呼吸的焦点环（提示看哪里）
  const target = nf > .5 ? { x: nx, y: ny, s: ns } : { x: lx, y: ly, s: ls };
  const pulse = .5 + .5 * Math.sin(t * 1.5);
  ctx.beginPath();
  ctx.arc(target.x, target.y, target.s * .62, 0, 6.283);
  ctx.strokeStyle = rgba(p.ink, (.10 + pulse * .10) * pIn);
  ctx.lineWidth = 1; ctx.stroke();

  // 状态提示交给 centerMsg
  if (phase.t > 1.2) {
    const wantNear = toNear;
    if (S._focusState !== wantNear) {
      S._focusState = wantNear;
      showCenter(wantNear ? '看近处' : '看远处', wantNear ? '眼前这片叶' : '林间那抹光', 1.6);
    }
  }
}

function drawLeaf(ctx, x, y, s, fill, vein, rot = .28) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, -s * .5);
  ctx.bezierCurveTo(s * .48, -s * .28, s * .40, s * .30, 0, s * .5);
  ctx.bezierCurveTo(-s * .40, s * .30, -s * .48, -s * .28, 0, -s * .5);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  // 主脉
  ctx.beginPath();
  ctx.moveTo(0, -s * .48); ctx.lineTo(0, s * .48);
  ctx.strokeStyle = vein; ctx.lineWidth = Math.max(1, s * .012); ctx.stroke();
  // 侧脉
  for (let i = -3; i <= 3; i++) {
    if (!i) continue;
    const yy = i * s * .11;
    const w = s * .30 * (1 - Math.abs(i) / 4.4);
    ctx.beginPath();
    ctx.moveTo(0, yy);
    ctx.quadraticCurveTo(w * .6, yy - s * .05, w, yy - s * .10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, yy);
    ctx.quadraticCurveTo(-w * .6, yy - s * .05, -w, yy - s * .10);
    ctx.stroke();
  }
  ctx.restore();
}

// ④ 眨眼节奏：屏幕柔和暗下 → 提示闭眼 → 恢复
const blink = { a: 0, phaseIdx: -1 };
function drawBlinkRhythm(ctx, phase, p, dt) {
  const W = S.W, H = S.H, t = phase.t;
  const pIn = clamp(t / 2, 0, 1);
  const cycle = 4.2;                       // 每 4.2 秒一次眨眼
  const cyc = t / cycle;
  const idx = Math.floor(cyc);
  const frac = cyc - idx;

  // 遮罩曲线：0 → 快速暗下(0.35) → 保持(0.25) → 缓慢恢复
  let dark = 0;
  if (frac < .18) dark = easeOutCubic(frac / .18);
  else if (frac < .42) dark = 1;
  else if (frac < .78) dark = 1 - easeInOutSine((frac - .42) / .36);
  else dark = 0;

  // 眨眼计数
  if (idx !== blink.phaseIdx) {
    if (blink.phaseIdx >= 0 && t > 1.5) {
      S.stats.blink++;
      blip(520 + Math.random() * 60, .05);
    }
    blink.phaseIdx = idx;
  }

  // 柔和的雾环（视觉焦点）
  const R = Math.min(W, H) * .19;
  ctx.beginPath();
  ctx.arc(S.cx, H * .48, R, 0, 6.283);
  const rg = ctx.createRadialGradient(S.cx, H * .48, R * .2, S.cx, H * .48, R);
  rg.addColorStop(0, rgba(p.moss, .10 * pIn * (1 - dark * .6)));
  rg.addColorStop(.7, rgba(p.sea, .06 * pIn));
  rg.addColorStop(1, rgba(p.sea, 0));
  ctx.fillStyle = rg; ctx.fill();

  // 外圈呼吸
  const br = R * (1 + Math.sin(t * 1.4) * .05);
  ctx.beginPath(); ctx.arc(S.cx, H * .48, br, 0, 6.283);
  ctx.strokeStyle = rgba(p.sea, .28 * pIn * (1 - dark));
  ctx.lineWidth = 1.2; ctx.stroke();

  // 暗幕
  blink.a = dark;
  if (dark > .001) {
    ctx.fillStyle = rgba(p.bg0, dark * .97);
    ctx.fillRect(0, 0, W, H);
  }

  // 提示文案
  if (frac < .05 && idx !== S._blinkMsgIdx) {
    S._blinkMsgIdx = idx;
    showCenter('轻轻闭眼', '', 1.4);
  }
}

// ⑤ 全景漫游：视线沿大圆环缓慢旋转
function drawPanorama(ctx, phase, p, dt) {
  const W = S.W, H = S.H, t = phase.t;
  const pIn = clamp(t / 2, 0, 1);
  const R = Math.min(W, H) * .30;
  const ang = t * .34 - Math.PI / 2;

  // 视线引导圆环
  ctx.beginPath(); ctx.arc(S.cx, S.cy, R, 0, 6.283);
  ctx.strokeStyle = rgba(p.ink3, .10 * pIn);
  ctx.lineWidth = 1; ctx.stroke();

  // 已走过的弧
  ctx.beginPath();
  ctx.arc(S.cx, S.cy, R, -Math.PI / 2, ang);
  ctx.strokeStyle = rgba(p.sea, .22 * pIn);
  ctx.lineWidth = 2; ctx.stroke();

  // 引导光点
  const x = S.cx + Math.cos(ang) * R;
  const y = S.cy + Math.sin(ang) * R;
  const hg = ctx.createRadialGradient(x, y, 0, x, y, R * .42);
  hg.addColorStop(0, rgba(p.sea, .30 * pIn));
  hg.addColorStop(1, rgba(p.sea, 0));
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, R * .42, 0, 6.283); ctx.fill();

  ctx.beginPath(); ctx.arc(x, y, 5.5, 0, 6.283);
  ctx.fillStyle = rgba(p.ink, .85 * pIn); ctx.fill();

  // 八方向柔和标记
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 - Math.PI / 2;
    const mx = S.cx + Math.cos(a) * R, my = S.cy + Math.sin(a) * R;
    ctx.beginPath(); ctx.arc(mx, my, 2.2, 0, 6.283);
    ctx.fillStyle = rgba(p.ink3, .22 * pIn); ctx.fill();
  }

  if (t > 1.5 && !S._panMsg) {
    S._panMsg = 1;
    showCenter('慢慢画圈', '让视线绕着远方走一圈', 2.4);
  }
}

const RENDERERS = { vista: drawVista, bird: drawBird, focus: drawFocus, blink: drawBlinkRhythm, panorama: drawPanorama };

/* ═══════════════════════════════════════════════════════════
   游戏循环
   ═══════════════════════════════════════════════════════════ */
let lastT = performance.now();

function loop(now) {
  const dt = Math.min((now - lastT) / 1000, .05);
  lastT = now;

  if (!S.paused) {
    S.t += dt;
    drawFog(dt);
    gx.clearRect(0, 0, S.W, S.H);

    if (S.running && S.script) {
      const ph = S.script.phases[S.phaseIdx];
      if (ph) {
        S.phaseT += dt;
        const phase = { ...ph, t: S.phaseT };
        const fn = RENDERERS[S.script.id];
        if (fn) fn(gx, phase, S.palette, dt);

        // 远眺计时
        if (ph.id === 'gaze' || ph.id === 'track' || ph.id === 'pan' || ph.id === 'pull') {
          S.stats.far += dt;
        }
        S.stats.session += dt;

        if (S.phaseT >= ph.dur) nextPhase();
      }
    }
  }
  requestAnimationFrame(loop);
}

/* ═══════════ 流程控制 ═══════════ */
function nextPhase() {
  S.phaseIdx++;
  S.phaseT = 0;
  const sc = S.script;
  if (!sc || S.phaseIdx >= sc.phases.length) {
    endRound();
    return;
  }
  const ph = sc.phases[S.phaseIdx];
  if (ph.id === 'settle') {
    showCenter(LEVELS[S.round].name, LEVELS[S.round].hint, 2.0);
  }
}

function startRound(i) {
  S.round = i;
  S.phaseIdx = 0; S.phaseT = 0;
  S.script = LEVELS[i].build();
  S.script.id = LEVELS[i].id;
  S.running = true; S.paused = false;
  S._focusState = null; S._blinkMsgIdx = -1; S._panMsg = 0;
  blink.phaseIdx = -1; vista.k = 0; vista.trail = [];
  updateHUD();
  showCenter(LEVELS[i].name, LEVELS[i].hint, 2.2);
  tone(392, .18, .04);
}

function endRound() {
  S.running = false;
  if (S.round + 1 < LEVELS.length) {
    tone(523, .4, .05);
    setTimeout(() => startRound(S.round + 1), 900);
    showPips();
  } else {
    finish();
  }
}

function finish() {
  S.running = false;
  toastOff();
  const far = Math.round(S.stats.far);
  $('#rsNum').textContent = far;
  $('#rsFar').innerHTML = far + '<span>秒</span>';
  $('#rsBlink').innerHTML = S.stats.blink + '<span>次</span>';
  $('#rsTrack').innerHTML = Math.round(clamp(S.stats.track, 0, 100) / 100 * 100) + '<span>%</span>';
  const lines = [
    '睫状肌已经松下来了，现在看远处会更清楚一点。',
    '眼睛最怕的不是久看，是不休息。你刚刚给了它一段很长的远方。',
    '这是一次完整的远眺训练，做得好。',
  ];
  $('#rsLine').textContent = lines[Math.floor(Math.random() * lines.length)];
  const tips = [
    '下一个 20 分钟后再来一次。若眼睛仍然干涩，可能是眨眼频率偏低——有意识地多眨眼比点药水更有效。',
    '如果长时间看屏幕后出现头痛或视物模糊，建议做一次正规验光，排除屈光不正和干眼。',
    '记得把屏幕亮度调到与周围环境接近，过亮比过暗更容易累眼。',
  ];
  $('#rsTip').textContent = tips[Math.floor(Math.random() * tips.length)];
  fade($('#veilResult'), true);
  tone(659, .5, .05);
}

function updateHUD() {
  $('#roundTag').textContent = S.running ? `第 ${S.round + 1} / ${LEVELS.length} 轮 · ${LEVELS[S.round].name}` : '准备';
  $('#hintText').textContent = S.running ? LEVELS[S.round].hint : '把视线放到最远处，慢慢眨眼';
  showPips();
}

function showPips() {
  const box = $('#pips');
  box.innerHTML = '';
  for (let i = 0; i < LEVELS.length; i++) {
    const d = document.createElement('div');
    d.className = 'pip' + (i < S.round ? ' done' : i === S.round && S.running ? ' now' : '');
    box.appendChild(d);
  }
}

/* ─────────── 中央提示 ─────────── */
let msgTimer = null;
function showCenter(big, sub, dur = 2) {
  const el = $('#centerMsg');
  $('#cmBig').textContent = big || '';
  $('#cmSub').textContent = sub || '';
  el.classList.add('show');
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => el.classList.remove('show'), dur * 1000);
}

/* ─────────── 淡入淡出工具 ─────────── */
function fade(el, on) { el.classList.toggle('on', on); }

/* ═══════════════════════════════════════════════════════════
   声音（WebAudio 极简音景，无外部资源）
   ═══════════════════════════════════════════════════════════ */
let AC = null;
function ac() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } }
  return AC;
}
function tone(freq, dur = .2, gain = .04) {
  if (!S.sound) return;
  const c = ac(); if (!c) return;
  if (c.state === 'suspended') c.resume();
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + .02);
  g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + dur);
  o.connect(g); g.connect(c.destination);
  o.start(); o.stop(c.currentTime + dur + .05);
}
function blip(freq, gain) { tone(freq, .35, gain); }

/* ═══════════════════════════════════════════════════════════
   眨眼提醒 & toast
   ═══════════════════════════════════════════════════════════ */
let toastTimer = null;
function toast(msg, dur = 3.4) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), dur * 1000);
}
function toastOff() { $('#toast').classList.remove('on'); }

/* 全局眨眼提醒：游戏进行中每 45~70 秒一次轻提示 */
let blinkHintTimer = null;
function scheduleBlinkHint() {
  clearTimeout(blinkHintTimer);
  blinkHintTimer = setTimeout(() => {
    if (S.running && !S.paused) toast('记得眨眼 —— 眨眼是眼睛最好的按摩', 3.2);
    scheduleBlinkHint();
  }, rand(45000, 70000));
}

/* ═══════════════════════════════════════════════════════════
   UI 事件
   ═══════════════════════════════════════════════════════════ */
// 主题
function applyTheme(th) {
  document.body.dataset.theme = th;
  store.set('yuantiao.theme', th);
  readPalette(); buildFog();
}
$('#btnTheme').addEventListener('click', () => {
  applyTheme(document.body.dataset.theme === 'dusk' ? 'dawn' : 'dusk');
});

// 声音
$('#btnSound').addEventListener('click', () => {
  S.sound = !S.sound;
  store.set('yuantiao.sound', S.sound ? '1' : '0');
  $('#btnSound').style.opacity = S.sound ? '1' : '.45';
  if (S.sound) tone(523, .18, .04);
  toast(S.sound ? '声音已开启' : '声音已关闭', 1.8);
});

// 暂停
$('#btnPause').addEventListener('click', () => {
  if (!S.running) return;
  S.paused = true; fade($('#veilPause'), true);
});
$('#btnResume').addEventListener('click', () => {
  S.paused = false; fade($('#veilPause'), false); lastT = performance.now();
});
$('#btnHome3').addEventListener('click', () => { goHome(); });

// 开始
$('#btnStart').addEventListener('click', () => {
  ac(); // 解锁音频
  resetStats();
  fade($('#veilHome'), false);
  fade($('#veilResult'), false);
  S.scene = 'level';
  startRound(0);
  scheduleBlinkHint();
});

function resetStats() {
  S.stats = { far: 0, blink: 0, track: 0, session: 0 };
}

// 跳过当前轮
$('#btnSkip').addEventListener('click', () => {
  if (!S.running) return;
  S.stats.far += 20;          // 跳过时按「完成一轮 20 秒远眺」计入
  endRound();
});

// 回首页
$('#btnExit').addEventListener('click', goHome);
$('#btnHome2').addEventListener('click', goHome);
function goHome() {
  S.running = false; S.paused = false;
  clearTimeout(blinkHintTimer);
  toastOff();
  fade($('#veilPause'), false);
  fade($('#veilResult'), false);
  fade($('#veilHome'), true);
  fade($('#restTable'), false);
  gx.clearRect(0, 0, S.W, S.H);
  updateHUD();
}

// 再来一局
$('#btnAgain').addEventListener('click', () => {
  resetStats();
  fade($('#veilResult'), false);
  startRound(0);
  scheduleBlinkHint();
});

/* ─────────── 距离校准 ─────────── */
const CAL = { saved: parseFloat(store.get('yuantiao.dist')) || 60 };
S.distCm = CAL.saved;
$('#distReadout').textContent = '约 ' + CAL.saved + ' cm';

function updateRuler() {
  // 10cm 在屏幕上该占多少像素：假设典型像素密度 ~ 100px/cm 的近似
  // 更准确：用 distCm 换算 —— 越小说明屏幕物理密度越小
  const pxPerCm = 38 * (60 / CAL.saved); // 经验系数，仅用于视觉参照
  $('#ruler').style.width = Math.round(pxPerCm * 10) + 'px';
}
$('#btnCalib').addEventListener('click', () => {
  $('#calDist').value = CAL.saved;
  $('#calDistOut').textContent = CAL.saved + ' cm';
  updateRuler();
  fade($('#sheetCalib'), true);
});
$('#calDist').addEventListener('input', (e) => {
  CAL.saved = +e.target.value;
  $('#calDistOut').textContent = CAL.saved + ' cm';
  updateRuler();
});
$('#btnCalibSave').addEventListener('click', () => {
  store.set('yuantiao.dist', CAL.saved);
  S.distCm = CAL.saved;
  $('#distReadout').textContent = '约 ' + CAL.saved + ' cm';
  fade($('#sheetCalib'), false);
  toast('已按 ' + CAL.saved + ' cm 估算远眺距离', 2.2);
});
$('#btnCalibCancel').addEventListener('click', () => fade($('#sheetCalib'), false));

/* ─────────── 纯休息模式（无游戏，20 秒远眺计时环） ─────────── */
let restRAF = null, restStart = 0;
$('#btnPureRest').addEventListener('click', () => {
  fade($('#veilHome'), false);
  startPureRest();
});
function startPureRest() {
  // 动态创建一个休息遮罩（保持 DOM 简洁，这里直接构建）
  let el = document.getElementById('restTable');
  if (!el) {
    el = document.createElement('div');
    el.className = 'restable'; el.id = 'restTable';
    el.innerHTML = `
      <div class="ring">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" stroke-opacity=".12" stroke-width="1.5"/>
          <circle id="restArc" cx="100" cy="100" r="86" fill="none" stroke="currentColor" stroke-opacity=".8"
                  stroke-width="2" stroke-linecap="round" stroke-dasharray="540" stroke-dashoffset="540"/>
        </svg>
        <div class="t" id="restT">20</div>
        <div class="lbl">秒 · 看 6 米以外</div>
        <div style="margin-top:34px"><button class="pill" id="restExit">结 束</button></div>
      </div>`;
    el.style.color = 'var(--sea)';
    document.body.appendChild(el);
    el.querySelector('#restExit').addEventListener('click', () => {
      fade(el, false);
      cancelAnimationFrame(restRAF);
      fade($('#veilHome'), true);
    });
  }
  fade(el, true);
  restStart = performance.now();
  const total = 20000;
  const arc = el.querySelector('#restArc'), tn = el.querySelector('#restT');
  const step = () => {
    const p = clamp((performance.now() - restStart) / total, 0, 1);
    arc.setAttribute('stroke-dashoffset', 540 * (1 - p));
    tn.textContent = Math.ceil((1 - p) * 20);
    if (p < 1) restRAF = requestAnimationFrame(step);
    else { tone(659, .6, .05); fade(el, false); setTimeout(() => fade($('#veilHome'), true), 300); }
  };
  step();
}

/* ─────────── 眼睛位置追踪（鼠标/触摸，用于轻量反馈） ─────────── */
gm.addEventListener('pointermove', (e) => {
  const r = gm.getBoundingClientRect();
  S.eye.x = (e.clientX - r.left) / r.width;
  S.eye.y = (e.clientY - r.top) / r.height;
}, { passive: true });

/* ─────────── 键盘 ─────────── */
window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') {
    if (S.running && !S.paused) $('#btnPause').click();
    else if (S.paused) $('#btnResume').click();
  }
  if (e.code === 'Space') { e.preventDefault(); if (!S.running) $('#btnStart').click(); }
  if (e.key && e.key.toLowerCase() === 't') $('#btnTheme').click();
});

/* ─────────── 初始化 ─────────── */
function init() {
  const savedTheme = store.get('yuantiao.theme');
  if (savedTheme) document.body.dataset.theme = savedTheme;
  const savedSound = store.get('yuantiao.sound');
  if (savedSound === '0') { S.sound = false; $('#btnSound').style.opacity = '.45'; }

  resize();
  readPalette();
  buildFog();
  updateRuler();
  showPips();
  requestAnimationFrame((t) => { lastT = t; loop(t); });
}
init();
