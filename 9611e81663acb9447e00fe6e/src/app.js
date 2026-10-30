const style=document.createElement("style");style.textContent="\n:root{\n  --bg:#f5f7f3; --card:#ffffff; --ink:#1b1f1a; --muted:#6b7266; --line:#e4e8de;\n  --accent:#4c9a2a; --accent-2:#3f7f22; --accent-soft:#eef6e7;\n  --amber:#9a6b0a; --amber-soft:#fdf4e0; --amber-line:#e8d7ab;\n  --gray-soft:#f1f2ee;\n  --lv1:#eef6e7; --lv1-ink:#3f7f22;\n  --lv2:#b7e096; --lv2-ink:#22420f;\n  --lv3:#4c9a2a; --lv3-ink:#ffffff;\n  --danger:#b23c3c; --danger-line:#e3b6b6;\n  --radius:14px;\n}\n@media (prefers-color-scheme: dark){\n  :root{\n    --bg:#15170f; --card:#1e2119; --ink:#ecefe6; --muted:#9aa294; --line:#2c3126;\n    --accent:#7cc95a; --accent-2:#9dde7e; --accent-soft:#22301a;\n    --amber:#e0b154; --amber-soft:#2e2716; --amber-line:#4a3f22;\n    --gray-soft:#242a1e;\n    --lv1:#22301a; --lv1-ink:#9dde7e;\n    --lv2:#3d6a2a; --lv2-ink:#e8f5df;\n    --lv3:#7cc95a; --lv3-ink:#12210a;\n    --danger:#e88a8a; --danger-line:#5a2c2c;\n  }\n}\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\nhtml,body{margin:0;padding:0}\nbody{\n  background:var(--bg); color:var(--ink);\n  font-family:-apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",system-ui,sans-serif;\n  font-size:15px; line-height:1.55; -webkit-font-smoothing:antialiased;\n  padding-bottom:calc(76px + env(safe-area-inset-bottom));\n}\n.wrap{max-width:520px;margin:0 auto;padding:0 14px}\n\nheader{\n  position:sticky;top:0;z-index:20;background:var(--accent);color:#fff;\n  padding:calc(12px + env(safe-area-inset-top)) 0 12px;\n}\nheader .wrap{display:flex;align-items:baseline;justify-content:space-between;gap:10px}\n.h-title{font-size:17px;font-weight:600;letter-spacing:.2px}\n.h-sub{font-size:12px;opacity:.88}\n\n.weekstrip{display:flex;gap:6px;padding:12px 0 2px}\n.wd{\n  flex:1;text-align:center;padding:8px 0 7px;border-radius:11px;border:1px solid var(--line);\n  background:var(--card);cursor:pointer;user-select:none;\n}\n.wd .d{font-size:12px;color:var(--muted);line-height:1.2}\n.wd .dot{width:5px;height:5px;border-radius:50%;background:var(--line);margin:5px auto 0}\n.wd.s-train .dot{background:var(--accent)}\n.wd.s-climb .dot{background:#d9a520}\n.wd.today{border-color:var(--accent)}\n.wd.active{background:var(--accent-soft);border-color:var(--accent)}\n.wd.active .d{color:var(--accent-2);font-weight:600}\n\n.card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:14px;margin-top:12px}\n.card.climb{background:var(--amber-soft);border-color:var(--amber-line)}\n.dayhead{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}\n.dayhead h2{margin:0;font-size:18px;font-weight:600}\n.card.climb .dayhead h2{color:var(--amber)}\n.tag{display:inline-block;font-size:11px;padding:2px 8px;border-radius:999px;background:var(--accent-soft);color:var(--accent-2);margin-top:6px}\n.card.climb .tag{background:var(--amber-soft);color:var(--amber);border:1px solid var(--amber-line)}\n.meta{font-size:12.5px;color:var(--muted);margin-top:8px}\n\n.progress{margin-top:12px}\n.pbar{height:7px;border-radius:99px;background:var(--gray-soft);overflow:hidden}\n.pbar i{display:block;height:100%;width:0;background:var(--accent);border-radius:99px;transition:width .25s ease}\n.plabel{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-top:6px}\n\n.ex{border-top:1px solid var(--line);padding:12px 0 2px;margin-top:4px}\n.ex:first-of-type{border-top:none}\n.ex-top{display:flex;gap:10px;align-items:flex-start}\n.ck{\n  flex:0 0 22px;width:22px;height:22px;margin:2px 0 0;border:1.6px solid var(--line);\n  border-radius:7px;background:transparent;appearance:none;cursor:pointer;position:relative;\n}\n.ck:checked{background:var(--accent);border-color:var(--accent)}\n.ck:checked::after{content:\"\";position:absolute;left:6px;top:2.5px;width:5px;height:9px;border:2px solid #fff;border-top:0;border-left:0;transform:rotate(40deg)}\n.ex-main{flex:1;min-width:0}\n.ex-name{font-size:15.5px;font-weight:600}\n.ex.done .ex-name{color:var(--muted);text-decoration:line-through;text-decoration-thickness:1px}\n.ex-spec{font-size:12.5px;color:var(--muted);margin-top:3px;display:flex;flex-wrap:wrap;gap:4px 8px}\n.pill{background:var(--gray-soft);border-radius:6px;padding:1px 7px;font-size:11.5px;color:var(--ink)}\n.pill.rir{background:var(--accent-soft);color:var(--accent-2)}\n\ndetails{margin:10px 0 0;border-radius:11px;background:var(--gray-soft);padding:0 12px}\ndetails[open]{padding-bottom:12px}\nsummary{\n  list-style:none;cursor:pointer;padding:9px 0;font-size:13px;color:var(--accent-2);font-weight:600;\n  display:flex;align-items:center;justify-content:space-between;\n}\nsummary::-webkit-details-marker{display:none}\nsummary::after{content:\"＋\";font-weight:400;color:var(--muted)}\ndetails[open] summary::after{content:\"－\"}\n.cue{font-size:13.5px;margin:0 0 9px;color:var(--ink)}\n.cue:last-child{margin-bottom:0}\n.cue b{display:inline-block;min-width:34px;color:var(--accent-2);font-weight:600;margin-right:6px}\n.card.climb .cue b{color:var(--amber)}\n.cue.warn b{color:var(--danger)}\n\n.tips{margin:0;padding-left:0;list-style:none}\n.tips li{font-size:13.5px;margin:8px 0;padding-left:14px;position:relative;color:var(--ink)}\n.tips li::before{content:\"\";position:absolute;left:2px;top:9px;width:5px;height:5px;border-radius:50%;background:var(--accent)}\n\n.btnrow{display:flex;gap:10px;margin-top:12px}\n.btn{\n  flex:1;border:1px solid var(--line);background:var(--card);border-radius:11px;padding:11px;\n  font-size:14px;color:var(--ink);cursor:pointer;font-family:inherit;\n}\n.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}\n.btn.danger{color:var(--danger);border-color:var(--danger-line)}\n\n.tabbar{\n  position:fixed;left:0;right:0;bottom:0;z-index:30;background:var(--card);\n  border-top:1px solid var(--line);padding:8px 14px calc(8px + env(safe-area-inset-bottom));\n}\n.tabbar .wrap{display:flex;gap:8px;padding:0}\n.tab{flex:1;text-align:center;padding:9px 6px;border-radius:11px;font-size:13.5px;color:var(--muted);cursor:pointer;user-select:none}\n.tab.on{background:var(--accent-soft);color:var(--accent-2);font-weight:600}\n\n.hint{font-size:12px;color:var(--muted);margin:10px 2px 0;line-height:1.6}\n.foot{font-size:11.5px;color:var(--muted);text-align:center;margin:18px 0 6px}\n.hidden{display:none}\n\n/* ---- 训练记录 ---- */\n.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:12px}\n.stat{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:12px 14px}\n.stat .n{font-size:23px;font-weight:700;color:var(--accent-2);line-height:1.2}\n.stat .k{font-size:12px;color:var(--muted);margin-top:3px}\n.stat.wide{grid-column:span 2}\n\n.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-top:12px}\n.cal .hd{font-size:11px;color:var(--muted);text-align:center;padding-bottom:2px}\n.cal .d{\n  aspect-ratio:1/1;border-radius:9px;border:1px solid var(--line);background:var(--gray-soft);\n  display:flex;align-items:center;justify-content:center;font-size:12.5px;color:var(--muted);\n  cursor:pointer;user-select:none;\n}\n.cal .d.blank{border:none;background:transparent;cursor:default}\n.cal .d.plan{border-color:var(--accent);color:var(--accent-2);background:var(--accent-soft);font-weight:600}\n.cal .d.climb{border-color:var(--amber-line);color:var(--amber);background:var(--amber-soft);font-weight:600}\n.cal .d.lv1{background:var(--lv1);border-color:var(--lv1);color:var(--lv1-ink);font-weight:600}\n.cal .d.lv2{background:var(--lv2);border-color:var(--lv2);color:var(--lv2-ink);font-weight:700}\n.cal .d.lv3{background:var(--lv3);border-color:var(--lv3);color:var(--lv3-ink);font-weight:700}\n.cal .d.today{outline:2px solid var(--accent-2);outline-offset:1px}\n.cal .d.sel{box-shadow:0 0 0 2px var(--card),0 0 0 4px var(--accent-2)}\n\n.bars{display:flex;align-items:flex-end;gap:6px;height:118px;margin-top:12px}\n.bars .b{flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%}\n.bars .b i{display:block;background:var(--accent);border-radius:6px 6px 3px 3px;min-height:3px;opacity:.9}\n.bars .b.zero i{background:var(--gray-soft)}\n.bars .b .lb{font-size:10px;color:var(--muted);text-align:center;margin-top:5px;white-space:nowrap}\n.bars .b .pv{font-size:10px;color:var(--accent-2);text-align:center;margin-bottom:3px;font-weight:600}\n\n.dlist{margin:10px 0 0;padding:0;list-style:none}\n.dlist li{font-size:13.5px;padding:6px 0 6px 16px;position:relative;border-top:1px solid var(--line)}\n.dlist li:first-child{border-top:none}\n.dlist li::before{content:\"\";position:absolute;left:2px;top:12px;width:5px;height:5px;border-radius:50%;background:var(--accent)}\n.dlist li.miss{color:var(--muted)}\n.dlist li.miss::before{background:var(--line)}\n\ntextarea.data{\n  width:100%;margin-top:12px;height:150px;border-radius:11px;border:1px solid var(--line);\n  background:var(--gray-soft);color:var(--ink);font-size:11.5px;padding:10px;font-family:ui-monospace,Menlo,Consolas,monospace;\n  resize:vertical;line-height:1.5;\n}\n.legend{display:flex;flex-wrap:wrap;gap:6px 12px;margin-top:10px;font-size:11.5px;color:var(--muted)}\n.legend span{display:inline-flex;align-items:center;gap:5px}\n.legend i{width:11px;height:11px;border-radius:3px;display:inline-block;background:var(--gray-soft);border:1px solid var(--line)}\n.legend i.l1{background:var(--lv1);border-color:var(--lv1)}\n.legend i.l2{background:var(--lv2);border-color:var(--lv2)}\n.legend i.l3{background:var(--lv3);border-color:var(--lv3)}\n.legend i.pl{border-color:var(--accent);background:var(--accent-soft)}\n\n/* 动作演示（简笔动图） */\n.artbox{margin:2px 0 10px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:6px 6px 2px}\n.artbox svg{width:100%;height:auto;display:block;max-height:230px}\n.artbox .bone{stroke:var(--accent-2);stroke-width:3.4;stroke-linecap:round;fill:none}\n.artbox .bone.far{opacity:.26;stroke-width:3}\n.artbox .head{fill:none;stroke:var(--accent-2);stroke-width:3.4}\n.artbox .cap{fill:var(--muted);font-size:10px}\n.artbox .guide{stroke:var(--amber);stroke-width:1.6;stroke-dasharray:5 4;fill:none}\n.artbox .gtext{fill:var(--amber);font-size:9px}\n\n/* 肌群图（黑白人体 + 目标肌群标红） */\n:root{--skin:#ffffff;--mred:#e05656;--mred-line:#b23c3c}\n@media (prefers-color-scheme:dark){\n  :root{--skin:#23271e;--mred:#d95f5f;--mred-line:#8f3a3a}\n}\n.artrow{display:flex;gap:8px;margin:2px 0 10px;align-items:stretch}\n.artrow .artbox{flex:1;margin:0;padding:5px}\n.artbox .mf{fill:transparent;stroke:none}\n.artbox .mf.on{fill:var(--mred);stroke:var(--mred-line);opacity:.95}\n.artbox .oline{fill:none;stroke:var(--ink);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}\n.artbox .detail{fill:none;stroke:var(--ink);stroke-width:.9;opacity:.55}\n.artbox .body-cap{fill:var(--muted);font-size:9.5px}\n.artbox .mtag{fill:var(--mred);font-size:9.5px;font-weight:600}\n.artbox svg.bodyfig{height:225px;width:auto;margin:0 auto}\n/* AI 底图 + SVG 标红叠层 */\n.artbox .fig{position:relative}\n.artbox .fig img{width:100%;height:auto;display:block}\n.artbox .fig svg{position:absolute;inset:0;width:100%;height:100%;max-height:none}\n.artbox .fig .mf{fill:transparent;stroke:none}\n.artbox .fig .mf.on{fill:var(--mred);opacity:.85}\n@media (prefers-color-scheme:dark){.artbox .fig img{filter:invert(1) hue-rotate(180deg)}}\n";document.head.append(style);
document.getElementById("app").innerHTML="\n\n<header>\n  <div class=\"wrap\">\n    <div class=\"h-title\">薄肌训练 · 手机版</div>\n    <div class=\"h-sub\" id=\"hSub\">训练计划</div>\n  </div>\n</header>\n\n<div class=\"wrap\" id=\"viewTrain\">\n  <div class=\"weekstrip\" id=\"weekstrip\"></div>\n  <div class=\"card\" id=\"dayCard\"></div>\n  <div class=\"foot\">打卡记录保存在云端 · 在「训练记录」页可查看历史与备份</div>\n</div>\n\n<div class=\"wrap hidden\" id=\"viewRecords\">\n  <div class=\"stats\" id=\"statBox\"></div>\n\n  <div class=\"card\">\n    <div class=\"dayhead\">\n      <h2 id=\"calTitle\">—</h2>\n      <div style=\"display:flex; gap:8px; flex:0 0 auto\">\n        <button class=\"btn\" id=\"calPrev\" style=\"padding:5px 13px; flex:0 0 auto\">‹</button>\n        <button class=\"btn\" id=\"calNext\" style=\"padding:5px 13px; flex:0 0 auto\">›</button>\n      </div>\n    </div>\n    <div class=\"cal\" id=\"calGrid\"></div>\n    <div class=\"legend\">\n      <span><i class=\"pl\"></i>安排训练</span>\n      <span><i class=\"l1\"></i>完成 1/3 以下</span>\n      <span><i class=\"l2\"></i>完成过半</span>\n      <span><i class=\"l3\"></i>全部完成</span>\n    </div>\n    <div class=\"meta\" id=\"calMeta\"></div>\n  </div>\n\n  <div class=\"card\" id=\"dayDetail\"></div>\n\n  <div class=\"card\">\n    <div class=\"dayhead\"><h2>近 8 周完成率</h2></div>\n    <div class=\"bars\" id=\"bars\"></div>\n    <div class=\"hint\">按周统计：该周应做的动作总数里，你实际勾掉了多少。</div>\n  </div>\n\n  <div class=\"card\">\n    <div class=\"dayhead\"><h2>数据备份与迁移</h2></div>\n    <div class=\"hint\" id=\"storeNote\"></div>\n    <div class=\"btnrow\">\n      <button class=\"btn\" id=\"expJson\">导出备份（JSON）</button>\n      <button class=\"btn\" id=\"expCsv\">导出表格（CSV）</button>\n    </div>\n    <div class=\"btnrow\">\n      <button class=\"btn\" id=\"impBtn\">导入备份恢复</button>\n      <button class=\"btn\" id=\"copyBtn\">复制数据文本</button>\n    </div>\n    <div class=\"btnrow\">\n      <button class=\"btn\" id=\"showTxt\">显示 / 隐藏数据文本</button>\n      <button class=\"btn danger\" id=\"clrBtn\">清空全部记录</button>\n    </div>\n    <textarea class=\"data hidden\" id=\"dataTxt\" readonly></textarea>\n    <input accept=\".json,application/json\" class=\"hidden\" id=\"impFile\" type=\"file\">\n  </div>\n\n  <div class=\"foot\">按笔记「肌肉预算」思路整理 · 仅供训练参考</div>\n</div>\n\n<div class=\"wrap hidden\" id=\"viewRules\">\n  <div class=\"card\">\n    <div class=\"dayhead\"><h2>我的数据</h2></div>\n    <div class=\"meta\" style=\"margin-top:10px\">按个人情况调整训练与饮食；蛋白质建议参考 1.2~1.5 g/kg 体重。</div>\n    <div class=\"hint\">这份计划的目标是<b>增肌塑形</b>，请根据自身情况调整。</div>\n  </div>\n  <div class=\"card\">\n    <div class=\"dayhead\"><h2>执行原则</h2></div>\n    <div id=\"rulesList\"></div>\n  </div>\n  <div class=\"foot\">按笔记「肌肉预算」思路整理 · 仅供训练参考</div>\n</div>\n\n<div class=\"tabbar\">\n  <div class=\"wrap\">\n    <div class=\"tab on\" id=\"tabTrain\">今日训练</div>\n    <div class=\"tab\" id=\"tabRecords\">训练记录</div>\n    <div class=\"tab\" id=\"tabRules\">饮食与原则</div>\n  </div>\n</div>\n\n";

const DATA = {
  1:{label:'周一',title:'A · 肩 + 背',type:'train',focus:'三角肌中后束 · 背阔肌',dur:'约 50 分钟',ex:[
    {n:'哑铃侧平举',s:'3 组',r:'12~20 次',rir:'RIR 1~3',
     cues:[['起始','双手握铃垂于体侧，肘微屈约 15°，肩先沉下来不要耸。'],
           ['发力','用三角肌中束把手臂向两侧抬起，到与肩同高即停、不要过肩；想象小指略高像倒水。'],
           ['节奏','抬 1 秒 → 顶点 0.5 秒 → 下放 2~3 秒慢回。'],
           ['避坑','耸肩用斜方肌甩铃、靠身体晃动借力 —— 宁可减重量也要保证中束发力。',1]]},
    {n:'绳索侧平举',s:'3 组',r:'12~20 次',rir:'RIR 1~3',
     cues:[['起始','低位绳索从身体前方穿过，单手握住把位，另一手扶稳、身体微微侧倾站定。'],
           ['发力','肘保持微屈的固定角度，靠三角肌中束把把位拉到与肩同高。'],
           ['节奏','慢起慢落，全程不甩。'],
           ['避坑','躯干跟着摆动、手臂完全伸直靠肩关节硬扛重量。',1]]},
    {n:'反向飞鸟',s:'3 组',r:'12~20 次',rir:'RIR 1~3',
     cues:[['起始','俯身 30~45°，背部平直不弓腰，双手微屈持铃、手心相对。'],
           ['发力','向两侧打开至与肩同高，肩胛略收，主动感受三角肌后束收缩。'],
           ['节奏','打开 1 秒 → 顶点 0.5 秒 → 控制 2 秒回落。'],
           ['避坑','耸肩让斜方肌代偿、靠甩手臂把重量荡起来。',1]]},
    {n:'面拉',s:'2~3 组',r:'12~20 次',rir:'RIR 1~3',
     cues:[['起始','绳索调到面部高度，双手握绳、拇指朝后。'],
           ['发力','肘部高于手腕，把绳拉向额头两侧，末端外旋（手背朝前）停 1 秒。'],
           ['节奏','拉 1 秒 → 回 2 秒。'],
           ['作用','练后束 + 护肩袖，平时久坐圆肩的人尤其别省这个动作。']]},
    {n:'高位下拉',s:'3 组',r:'8~12 次',rir:'RIR 1~3',
     cues:[['起始','握距略宽于肩，挺胸、上身微微后仰约 10°。'],
           ['发力','先沉肩，再想着用肘部向下砸，把杆拉到锁骨附近。'],
           ['节奏','下拉 1 秒 → 顶点 0.5 秒 → 放回 2~3 秒（不要松掉张力）。'],
           ['避坑','靠后仰和惯性拉、耸肩缩脖子。',1]]},
    {n:'坐姿划船',s:'3 组',r:'8~12 次',rir:'RIR 1~3',
     cues:[['起始','坐稳、骨盆中立、膝盖微屈，背部保持平直。'],
           ['发力','先收肩胛、再屈肘把手拉向腹部，肘部贴着身体走。'],
           ['节奏','拉 1 秒 → 放回 2 秒，放回时让肩胛自然前伸。'],
           ['避坑','弓背借力、耸肩、用腰部前后晃。',1]]},
    {n:'直臂下压',s:'2~3 组',r:'12~15 次',rir:'RIR 1~3',
     cues:[['起始','站距与肩同宽、上身微俯，手臂基本伸直（肘部保持很小的固定弯曲）。'],
           ['发力','用背阔肌把绳索压向大腿前侧，顶点夹背 1 秒。'],
           ['节奏','下压 1 秒 → 回放 2 秒并感受背阔拉伸。'],
           ['避坑','做成屈肘的臂屈伸、靠身体上下起伏把重量压下去。',1]]}
  ]},
  2:{label:'周二',title:'休息 / 轻活动',type:'rest',dur:'—',focus:'给周三攀岩留出恢复',
     tips:['完全休息，或散步 20~30 分钟。','如昨天肩背有酸胀，可做 10 分钟肩部与胸椎的拉伸活动。','今晚睡够 7 小时以上，明早上墙的状态靠它。']},
  3:{label:'周三',title:'攀岩（固定）',type:'climb',focus:'上肢拉力 + 有氧 · 全身',dur:'60~90 分钟',ex:[
    {n:'攀岩 · 抱石 / 顶绳',s:'不计组数',r:'60~90 分钟',rir:'当天不排力量',
     cues:[['热身','手腕绕环、肩绕环、前臂拉伸各 1 分钟；前 1~2 条线路当热身，别一上来就冲难度。'],
           ['定位','攀岩属于上肢拉力 + 有氧的复合刺激，已经覆盖背部与握力，所以当天不再安排背部力量、上墙前也别做高位下拉。'],
           ['收尾','拉伸前臂屈肌与背阔肌各 30 秒；若手指或肩有明显酸胀，次日优先恢复、不要硬顶。',1]]}
  ]},
  4:{label:'周四',title:'B · 臀 + 腿后侧',type:'train',focus:'臀 · 腘绳肌 · 臀中肌',dur:'约 50 分钟',ex:[
    {n:'臀推',s:'4 组',r:'6~10 次',rir:'RIR 1~3',
     cues:[['起始','上背靠在凳沿（凳沿大致齐肩胛下角），重物垫在髋部。'],
           ['发力','由臀部把髋顶起，到躯干与大腿成一条线即停，顶点夹臀 1 秒。'],
           ['节奏','顶起 1 秒 → 顶点停 1 秒 → 下放 2 秒。'],
           ['避坑','用腰后仰代替夹臀、下巴上扬、脚位太远变成蹬腿。',1]]},
    {n:'罗马尼亚硬拉',s:'3 组',r:'8~12 次',rir:'RIR 1~3',
     cues:[['起始','双脚与髋同宽，膝盖微屈且角度固定（下放过程中不再变化），器械贴着腿走。'],
           ['发力','屁股向后推，下放到腘绳肌有明显拉伸（约膝下 10cm）即可，不必追求触地；起身靠臀和腘绳肌收缩站直、顶点夹臀。'],
           ['节奏','下放 3 秒慢 → 起身 1 秒。'],
           ['避坑','弓背、把动作做成深蹲。',1]]},
    {n:'保加利亚分腿蹲',s:'3 组',r:'8~12 次/侧',rir:'RIR 1~3',
     cues:[['起始','后脚搭在凳上，前脚向前迈一小步站稳。'],
           ['发力','先屈髋再屈膝下蹲，身体微微前倾更偏臀；下到前腿大腿接近水平。'],
           ['节奏','下蹲 2~3 秒 → 起身 1 秒。'],
           ['避坑','膝盖内扣、重心跑到前脚脚尖、靠后腿蹬地借力。',1]]},
    {n:'45 度挺身',s:'3 组',r:'10~15 次',rir:'RIR 1~3',
     cues:[['起始','髋部垫在靠垫边缘，双脚踩稳，下巴微收、背不弓。'],
           ['发力','用臀和腘绳肌收缩把身体起上来，到躯干与腿成一条直线即停，不要过度后仰。'],
           ['节奏','起 1 秒 → 下 2 秒。'],
           ['提示','找不到臀部发力就先减轻重量、放慢速度。']]},
    {n:'髋外展 / 绳索侧抬腿',s:'3 组',r:'15~25 次',rir:'RIR 1~3',
     cues:[['起始','站稳（可扶固定物），上身保持不动。'],
           ['发力','用臀中肌把腿向外打开到最大幅度，顶点停 1 秒再慢回。'],
           ['节奏','慢开慢回、不借惯性。'],
           ['要点','练上臀与臀中肌线条，重量宁小勿大；别让上身跟着晃、别靠甩腿完成。',1]]}
  ]},
  5:{label:'周五',title:'休息 / 轻有氧（可选）',type:'rest',dur:'—',focus:'为周六核心日留状态',
     tips:['想动就快走或椭圆机 20~30 分钟，中低强度即可。','不加力量，避免周四臀腿的酸胀累积到周六。']},
  6:{label:'周六',title:'C · 核心 + 弱项补强',type:'train',focus:'核心稳定 · 弱项补充',dur:'约 40 分钟',ex:[
    {n:'平板支撑',s:'3 组',r:'30~60 秒',rir:'不必力竭',
     cues:[['起始','肘关节在肩正下方，前臂贴地，臀腿收紧、身体成一条直线。'],
           ['节奏','均匀呼吸不要憋气，撑到动作开始变形就停。'],
           ['避坑','塌腰、撅屁股、低头看地 —— 宁可 30 秒标准，也不要 60 秒塌着腰硬扛。',1]]},
    {n:'死虫式',s:'3 组',r:'12~15 次/侧',rir:'不必力竭',
     cues:[['起始','仰卧，双手向天花板举起，双膝屈约 90°；先把腰压紧地面、核心收紧再开始动。'],
           ['发力','对侧的手和脚缓慢伸出、靠近地面但不触地，再收回。'],
           ['节奏','伸出 2~3 秒 → 收回 2 秒。'],
           ['避坑','腰部离地拱起、速度太快变甩动。',1]]},
    {n:'臀桥（轻重量激活）',s:'2 组',r:'15 次',rir:'不必力竭',
     cues:[['起始','仰卧屈膝，脚跟距臀部约一掌宽，双脚与髋同宽。'],
           ['发力','先把臀收紧再把髋顶到肩-髋-膝一条线，顶点夹臀 1 秒。'],
           ['节奏','顶 1 秒 → 停 1 秒 → 下 2 秒。'],
           ['用途','正式臀推前的激活组，目的是找发力感，不是练到累。']]},
    {n:'弱项补强（自选）',s:'2~3 组',r:'自选',rir:'RIR 1~3',
     cues:[['怎么选','想让肩更挺、显腰细 → 加侧平举；想上臀饱满 → 加髋外展 / 绳索侧抬腿；想整体臀线 → 加臀推。'],
           ['要求','同样保留 1~3 次余量、同样不用力竭；每组做完感觉还能再做 1~3 次就停。']]}
  ]},
  7:{label:'周日',title:'休息',type:'rest',dur:'—',focus:'完全恢复',
     tips:['彻底放松，做 10 分钟拉伸或泡沫轴。','回顾本周打卡，把下周的重量/次数往上加一点。','每周拍一次正/背面照对比，比称体重更能看出变化。']}
};

const RULES = [
  ['排期逻辑','力量三练放在周一 / 周四 / 周六，周三固定攀岩不排力量。任意两次训练之间都至少隔一天。'],
  ['攀岩怎么算','攀岩本身就是「上肢拉力 + 有氧」的复合刺激，已覆盖背部与握力；所以当天不再加背部力量，也不建议上墙前做高位下拉。'],
  ['强度把控','RIR 1~3：每组做完大约还能再做 1~3 次就停，不用力竭，但必须离力竭足够近。「累」不等于「塑形」。'],
  ['有氧安排','攀岩日已经给到了有氧；其余力量训练后加 15~20 分钟低强度有氧即可，体重基数小，有氧别过量。'],
  ['蛋白质','可按 1.2~1.5 g/kg 体重参考蛋白质摄入，并根据自身情况调整。'],
  ['热量方向','根据个人状况调整热量摄入，重点放在增肌塑形。'],
  ['碳水','力量日与攀岩日都要吃够碳水；攀岩前 1~2 小时补一份易消化碳水，不然后半程没力气。'],
  ['脂肪','适量优质脂肪（坚果、牛油果、橄榄油），有助激素平衡和饱腹感。'],
  ['渐进超负荷','每 1~2 周试着加一点重量或次数；攀岩难度也按周小幅升级，别一次跳到极限。'],
  ['进度记录','每周拍一次正面 / 背面照片对比，比称体重更能反映进步；坚持 8~12 周会看到明显体态变化。']
];

/* ============ 通用 ============ */
/* ============ 动作演示（简笔动图） ============ */
/* 角度约定：绝对角，0°=屏幕右，90°=向下，-90°=向上，180°=向左。
   侧视：人物面朝右，根=髋，torso 为「髋→肩」方向角（站立=-90）。
   正视：根=肩中点，torso 竖直向下。
   所有角度数组：2 帧自动扩展为往返循环（起→终→起），3 帧及以上按均分时间插值。 */
const ART={
  '哑铃侧平举':{view:'front',shoulder:[95,48],dur:2.6,
    torso:90,legL:{th:[90,90],sh:[90,90],dx:-6},legR:{th:[90,90],sh:[90,90],dx:6},
    armL:{sh:[90,165],el:[82,157],dx:-8},armR:{sh:[90,15],el:[98,23],dx:8},
    guide:{type:'h',y:48,text:'与肩同高即停'},
    cap:'抬臂到与肩同高，小指略高像倒水'},
  '绳索侧平举':{view:'front',shoulder:[95,48],dur:2.6,
    torso:90,legL:{th:[90,90],sh:[90,90],dx:-6},legR:{th:[90,90],sh:[90,90],dx:6},
    armL:{sh:[90,168],el:[96,162],dx:-8},armR:{sh:[90,90],el:[88,88],dx:8},
    guide:{type:'h',y:48,text:'与肩同高'},
    cap:'肘角固定，单臂拉到与肩同高'},
  '反向飞鸟':{view:'front',shoulder:[95,52],dur:2.6,
    torso:90,legL:{th:[90,90],sh:[90,90],dx:-6},legR:{th:[90,90],sh:[90,90],dx:6},
    armL:{sh:[85,162],el:[78,155],dx:-8},armR:{sh:[95,18],el:[102,25],dx:8},
    guide:{type:'h',y:52,text:'打开至与肩同高'},
    cap:'俯身 30~45° 保持背平，向两侧打开'},
  '面拉':{view:'side',hip:[84,100],dur:2.6,
    torso:[-90,-88],armN:{sh:[-15,-15],el:[-15,-145]},armF:{sh:[-10,-10],el:[-10,-140]},
    legN:{th:[88,88],sh:[92,92]},legF:{th:[92,92],sh:[88,88]},
    cap:'肘高于手腕，拉向额头两侧再外旋'},
  '高位下拉':{view:'side',hip:[84,116],dur:2.8,
    torso:[-90,-80],armN:{sh:[-80,50],el:[-80,-40]},armF:{sh:[-76,56],el:[-76,-36]},
    legN:{th:[0,0],sh:[95,95]},legF:{th:[5,5],sh:[92,92]},
    cap:'先沉肩，再用肘把杆「砸」到锁骨附近'},
  '坐姿划船':{view:'side',hip:[84,116],dur:2.8,
    torso:[-90,-84],armN:{sh:[5,55],el:[5,-55]},armF:{sh:[10,60],el:[10,-50]},
    legN:{th:[0,0],sh:[95,95]},legF:{th:[5,5],sh:[92,92]},
    cap:'先收肩胛，再屈肘把手拉向腹部'},
  '直臂下压':{view:'side',hip:[84,100],dur:2.6,
    torso:[-90,-80],armN:{sh:[-25,40],el:[-10,55]},armF:{sh:[-20,45],el:[-5,60]},
    legN:{th:[88,88],sh:[92,92]},legF:{th:[92,92],sh:[88,88]},
    cap:'整条手臂基本伸直，用背阔肌压向大腿'},
  '攀岩 · 抱石 / 顶绳':{view:'side',hip:[84,106],dur:2.6,
    torso:[-90,-85],
    armN:{sh:[-100,-30],el:[-100,-35]},armF:{sh:[-30,-100],el:[-35,-100]},
    legN:{th:[70,95],sh:[115,65]},legF:{th:[95,70],sh:[65,115]},
    cap:'交替伸手够点，重心贴墙，前臂别先力竭'},
  '臀推':{view:'side',hip:[[66,108],[66,92]],dur:2.8,
    torso:[187,159],armN:{sh:[23,23],el:[22,22]},armF:{sh:[26,26],el:[25,25]},
    legN:{th:[27,45],sh:[30,30]},legF:{th:[24,42],sh:[27,27]},
    cap:'由臀部把髋顶起，到肩-髋-膝一条线即停'},
  '罗马尼亚硬拉':{view:'side',hip:[84,100],dur:2.8,
    torso:[-90,-8],
    armN:{sh:[90,90],el:[90,90]},armF:{sh:[90,90],el:[90,90]},
    legN:{th:[88,86],sh:[92,94]},legF:{th:[92,94],sh:[88,86]},
    cap:'屁股向后推，器械贴腿走，背保持平直'},
  '保加利亚分腿蹲':{view:'side',hip:[[78,74],[78,98]],dur:2.8,
    torso:[-95,-100],
    armN:{sh:[90,90],el:[88,88]},armF:{sh:[88,88],el:[90,90]},
    legN:{th:[95,70],sh:[78,130]},legF:{th:[120,135],sh:[75,39]},
    cap:'先屈髋再屈膝下蹲，前膝不要内扣'},
  '45 度挺身':{view:'side',hip:[64,102],dur:2.8,
    torso:[0,-80],
    armN:{sh:[90,90],el:[90,90]},armF:{sh:[90,90],el:[90,90]},
    legN:{th:[88,88],sh:[92,92]},legF:{th:[92,92],sh:[88,88]},
    cap:'用臀和腘绳肌起身上来，不要过度后仰'},
  '髋外展 / 绳索侧抬腿':{view:'front',shoulder:[95,50],dur:2.6,
    torso:90,legL:{th:[90,90],sh:[90,90],dx:-6},legR:{th:[90,52],sh:[90,58],dx:6},
    armL:{sh:[90,90],el:[88,88],dx:-8},armR:{sh:[90,90],el:[92,92],dx:8},
    cap:'用臀中肌把腿向外打开，顶点停 1 秒'},
  '平板支撑':{view:'side',hip:[84,96],dur:2.6,
    torso:[180,180],
    armN:{sh:[90,90],el:[0,0]},armF:{sh:[90,90],el:[0,0]},
    legN:{th:[6,6],sh:[4,4]},legF:{th:[9,9],sh:[7,7]},
    guide:{type:'seg',x1:36,y1:96,x2:150,y2:102,text:'头-背-臀-脚一条线'},
    cap:'肘在肩正下方，撑到动作变形就停'},
  '死虫式':{view:'side',hip:[100,112],dur:2.8,
    torso:[180,180],
    armN:{sh:[-90,-168],el:[-95,-172]},armF:{sh:[-90,-90],el:[-95,-95]},
    legN:{th:[-60,-88],sh:[-125,-95]},legF:{th:[-60,-60],sh:[-125,-125]},
    cap:'对侧手、脚缓慢伸出，靠近地面但不触地'},
  '臀桥（轻重量激活）':{view:'side',hip:[[70,112],[70,102]],dur:2.6,
    torso:[184,168],armN:{sh:[24,24],el:[23,23]},armF:{sh:[27,27],el:[26,26]},
    legN:{th:[30,40],sh:[32,32]},legF:{th:[27,37],sh:[29,29]},
    cap:'先收紧臀，再把髋顶到肩-髋-膝一条线'}
};

function cycleArr(x){
  if(!Array.isArray(x)) return [x,x,x];
  return x.length===2?[x[0],x[1],x[0]]:x.slice();
}
function kts(n){const s=[];for(let i=0;i<n;i++)s.push((i/(n-1)).toFixed(3));return s.join(';');}
function ksp(n){return new Array(n-1).fill('0.42 0 0.58 1').join(';');}
function rotG(rel,dur,n){
  const dyn=rel.some(function(v){return Math.abs(v-rel[0])>0.05;});
  if(!dyn) return '<g transform="rotate('+rel[0].toFixed(1)+')">';
  return '<g><animateTransform attributeName="transform" type="rotate" dur="'+dur+'s" repeatCount="indefinite" calcMode="spline" keyTimes="'+kts(n)+'" keySplines="'+ksp(n)+'" values="'+rel.map(function(v){return v.toFixed(1)+' 0 0';}).join(';')+'"/>';
}
function limb(len,abs,par,inner,cls,dur,n){
  return rotG(abs.map(function(v,i){return v-par[i];}),dur,n)+
    '<line class="'+cls+'" x1="0" y1="0" x2="0" y2="'+len+'"/>'+
    (inner?'<g transform="translate(0,'+len+')">'+inner+'</g>':'')+'</g>';
}
function ART_FRAME_LEN(art){ /* 收集该动作全部角度数组的统一帧长 */
  const lists=[art.torso];
  ['armN','armF','legN','legF','armL','armR','legL','legR'].forEach(function(k){
    if(art[k]){lists.push(art[k].sh||art[k].th);lists.push(art[k].el||art[k].sh);}
  });
  const lens=lists.filter(Boolean).map(function(x){return cycleArr(x).length;});
  return Math.max.apply(null,lens.concat([3]));
}
function resample(arr,N){
  const c=cycleArr(arr);
  if(c.length===N) return c;
  const out=[];
  for(let i=0;i<N;i++){
    const t=i/(N-1)*(c.length-1), i0=Math.floor(t), i1=Math.min(c.length-1,i0+1);
    out.push(c[i0]+(c[i1]-c[i0])*(t-i0));
  }
  return out;
}
function artFoot(){return '<line class="bone" x1="0" y1="0" x2="7" y2="-3"/>';}

function figSide(a){
  const dur=a.dur||2.6;
  const L={torso:48,head:8.5,uarm:26,farm:24,thigh:34,shin:32};
  const N=ART_FRAME_LEN(a);
  const base=new Array(N).fill(90);
  const torsoA=resample(a.torso,N);
  function armSide(arm,cls){
    if(!arm) return '';
    const shA=resample(arm.sh,N), elA=resample(arm.el,N);
    return limb(L.uarm,shA,torsoA,limb(L.farm,elA,shA,'',cls,dur,N),cls,dur,N);
  }
  function legSide(leg,cls){
    if(!leg) return '';
    const thA=resample(leg.th,N), shA=resample(leg.sh,N);
    return limb(L.thigh,thA,base,limb(L.shin,shA,thA,artFoot(),cls,dur,N),cls,dur,N);
  }
  let hipOpen,hipClose;
  if(Array.isArray(a.hip[0])){
    const hp=a.hip.length===2?[a.hip[0],a.hip[1],a.hip[0]]:a.hip;
    hipOpen='<g transform="translate('+hp[0][0]+','+hp[0][1]+')"><animateTransform attributeName="transform" type="translate" dur="'+dur+'s" repeatCount="indefinite" calcMode="spline" keyTimes="'+kts(hp.length)+'" keySplines="'+ksp(hp.length)+'" values="'+hp.map(function(p){return p[0].toFixed(1)+' '+p[1].toFixed(1);}).join(';')+'"/>';
    hipClose='</g>';
  }else{
    hipOpen='<g transform="translate('+a.hip[0]+','+a.hip[1]+')">';
    hipClose='</g>';
  }
  const head='<circle class="head" cx="0" cy="'+(L.head+3)+'" r="'+L.head+'"/>';
  const torsoHtml=rotG(torsoA.map(function(v){return v-90;}),dur,N)+
    armSide(a.armF,'bone far')+
    '<line class="bone" x1="0" y1="0" x2="0" y2="'+L.torso+'"/>'+
    '<g transform="translate(0,'+L.torso+')">'+head+armSide(a.armN,'bone')+'</g></g>';
  let guide='';
  if(a.guide&&a.guide.type==='seg'){
    guide='<line class="guide" x1="'+a.guide.x1+'" y1="'+a.guide.y1+'" x2="'+a.guide.x2+'" y2="'+a.guide.y2+'"/>'+
      '<text class="gtext" x="'+a.guide.x2+'" y="'+(a.guide.y2-6)+'" text-anchor="end">'+a.guide.text+'</text>';
  }
  return '<svg viewBox="0 0 190 178" xmlns="http://www.w3.org/2000/svg">'+
    '<g class="bones">'+legSide(a.legF,'bone far')+hipOpen+torsoHtml+legSide(a.legN,'bone')+hipClose+'</g>'+guide+
    (a.cap?'<text class="cap" x="95" y="174" text-anchor="middle">'+a.cap+'</text>':'')+
    '</svg>';
}

function figFront(a){
  const dur=a.dur||2.6;
  const L={torso:48,head:8.5,uarm:26,farm:24,thigh:34,shin:32};
  const N=ART_FRAME_LEN(a);
  const base=new Array(N).fill(90);
  const sh=a.shoulder;
  function armF(arm,cls){
    if(!arm) return '';
    const shA=resample(arm.sh,N), elA=resample(arm.el,N);
    const dx=arm.dx||0;
    return '<g transform="translate('+dx+',0)">'+limb(L.uarm,shA,base,limb(L.farm,elA,shA,'',cls,dur,N),cls,dur,N)+'</g>';
  }
  function legF(leg,cls){
    if(!leg) return '';
    const thA=resample(leg.th,N), shA=resample(leg.sh,N);
    const dx=leg.dx||0;
    return '<g transform="translate('+dx+','+L.torso+')">'+limb(L.thigh,thA,base,limb(L.shin,shA,thA,artFoot(),cls,dur,N),cls,dur,N)+'</g>';
  }
  let guide='';
  if(a.guide&&a.guide.type==='h'){
    guide='<line class="guide" x1="14" y1="'+a.guide.y+'" x2="176" y2="'+a.guide.y+'"/>'+
      '<text class="gtext" x="174" y="'+(a.guide.y-4)+'" text-anchor="end">'+a.guide.text+'</text>';
  }
  return '<svg viewBox="0 0 190 178" xmlns="http://www.w3.org/2000/svg">'+guide+
    '<g transform="translate('+sh[0]+','+sh[1]+')">'+
    '<circle class="head" cx="0" cy="-15" r="'+L.head+'"/>'+
    legF(a.legL,'bone far')+armF(a.armL,'bone far')+
    '<line class="bone" x1="0" y1="0" x2="0" y2="'+L.torso+'"/>'+
    legF(a.legR,'bone')+armF(a.armR,'bone')+
    '</g>'+
    (a.cap?'<text class="cap" x="95" y="174" text-anchor="middle">'+a.cap+'</text>':'')+
    '</svg>';
}

function renderArt(a){return a.view==='front'?figFront(a):figSide(a);}

/* ============ 目标肌群图（黑白人体 + 标红） ============ */
/* 左半身绘制一次，右侧用 use 镜像；激活肌群时给对应 data-g 的 path 加 .on，镜像自动同步 */
/* ============ 目标肌群图（AI 底图 + 程序标红） ============ */

const MPATH={front:{w:136,h:450,p:{"abs":"M65 123L71 123L74 125L81 132L83 137L83 140L84 140L83 150L82 153L82 156L82 157L82 167L82 168L82 173L83 174L82 186L76 202L73 206L69 209L66 208L61 202L56 191L54 185L54 182L53 182L55 160L54 160L54 155L53 154L53 146L52 145L53 137L55 132L62 125L65 123Z","quads":"M36 188L38 190L38 191L38 191L39 196L42 202L41 204L42 205L44 212L57 242L61 254L62 260L62 261L62 265L63 265L64 275L63 275L63 279L58 286L54 288L50 287L40 276L34 263L34 260L32 257L33 255L32 255L32 251L31 251L32 249L31 249L31 247L30 246L30 239L29 239L30 230L29 230L29 215L30 215L30 211L31 210L30 207L31 207L32 198L34 193L34 190L36 188ZM100 188L102 189L102 191L103 195L103 196L104 198L104 202L105 203L105 205L106 205L105 207L106 208L106 216L107 216L107 234L106 236L106 244L105 245L106 247L105 247L105 250L104 250L105 252L104 252L104 254L103 256L103 257L102 260L102 264L96 276L90 283L86 287L80 287L75 283L73 279L73 277L72 276L73 274L72 273L73 264L74 264L74 260L75 259L74 258L75 257L77 248L79 245L78 244L80 243L82 234L84 231L89 217L91 215L91 212L93 209L100 188ZM40 185L58 202L63 208L65 211L66 223L65 225L66 231L65 231L65 244L64 245L64 250L63 254L62 254L62 250L59 245L60 244L58 243L59 241L55 232L54 229L53 227L51 220L49 218L48 211L43 202L40 192L40 190L39 190L40 185ZM96 185L98 186L98 187L97 188L97 190L96 195L92 203L92 204L90 208L88 215L84 222L84 225L82 227L81 234L79 235L78 243L75 249L75 250L73 254L74 256L72 256L72 246L71 241L71 221L70 221L71 212L74 207L96 185Z","pec":"M58 82L64 84L67 91L67 104L65 115L59 122L54 125L47 126L46 125L41 124L38 120L35 115L36 101L33 97L48 85L58 82ZM75 82L81 82L88 85L103 97L103 98L101 99L100 103L102 111L101 118L100 120L94 125L83 125L81 123L79 123L72 117L71 115L71 110L70 110L70 107L69 107L69 93L70 92L71 87L75 82Z","calf":"M43 304L45 305L46 312L47 313L46 316L47 317L47 321L48 322L47 326L48 331L48 341L49 342L49 351L51 356L50 360L51 360L52 376L52 376L52 383L50 383L51 382L48 375L48 373L46 369L46 367L45 365L44 361L43 361L44 360L42 358L42 355L41 353L42 351L41 351L41 350L39 345L40 344L39 343L39 341L38 341L38 335L38 335L38 320L39 319L39 317L40 317L41 309L43 304ZM92 303L93 304L96 317L97 317L97 320L98 322L98 335L98 335L97 344L96 346L94 355L92 360L92 361L86 380L86 382L85 382L84 376L85 370L86 350L87 350L87 340L88 340L88 323L89 323L89 319L90 318L90 308L91 307L91 304L92 303ZM76 308L78 308L78 311L80 313L79 315L80 315L80 317L81 320L81 323L82 323L81 326L82 327L82 330L82 331L82 350L82 351L82 360L81 361L81 364L80 365L81 368L79 372L79 378L77 376L76 365L75 364L74 353L73 352L73 344L72 344L72 340L72 340L72 326L73 325L73 320L74 320L74 314L75 313L75 312L76 308ZM59 308L60 308L62 312L61 314L62 315L62 316L62 317L62 321L63 321L64 341L63 345L63 348L62 351L62 356L61 356L62 359L61 359L61 361L60 362L60 372L59 373L58 377L57 378L56 368L55 367L56 365L55 363L55 359L54 358L55 354L54 353L53 337L54 336L55 322L56 322L56 317L57 317L57 313L58 313L59 308Z","biceps":"M32 100L33 100L34 104L34 126L33 127L33 132L32 133L33 135L32 135L32 137L32 138L31 145L30 145L28 153L25 154L22 151L22 145L21 145L21 143L20 143L20 127L21 126L21 121L22 121L22 116L24 112L24 110L28 104L32 100ZM103 99L107 102L110 106L114 115L116 125L116 142L115 143L115 148L112 154L108 153L106 145L105 138L104 137L104 132L103 132L103 125L102 125L103 99Z","delt":"M34 78L40 78L44 81L43 86L30 99L23 109L22 109L20 106L20 100L19 100L20 90L26 82L29 79L34 78ZM98 78L107 79L115 87L116 91L117 92L116 94L117 94L117 103L116 104L116 107L115 109L112 109L108 102L92 85L92 81L95 78L97 79L98 78Z","forearm":"M19 148L20 148L21 155L22 155L22 173L21 177L22 180L21 180L21 182L19 186L20 188L17 197L16 206L14 207L13 206L13 204L12 203L12 194L11 193L11 176L12 175L12 171L12 170L13 163L14 163L14 159L15 158L17 150L19 148ZM117 148L119 149L118 150L122 157L121 159L122 160L122 162L123 164L123 165L124 169L124 172L125 172L125 194L124 195L124 199L123 199L124 201L122 206L122 208L121 208L120 198L119 198L119 196L118 196L119 195L118 194L118 193L118 192L118 191L116 187L117 185L115 181L115 176L114 175L114 161L115 160L114 158L115 158L115 155L116 155L115 153L116 152L116 150L117 150L117 148Z","obliques":"M45 149L47 151L47 154L49 160L49 161L50 162L49 164L50 164L50 166L51 166L50 169L51 169L51 171L52 172L52 186L55 195L52 194L46 188L40 181L38 176L39 175L38 175L38 168L44 154L45 149ZM90 150L91 150L94 160L98 168L98 175L95 183L90 189L85 194L81 195L84 187L83 185L84 185L84 174L85 174L86 165L87 165L86 163L87 162L87 160L88 160L87 159L88 158L88 157L88 156L90 150Z","traps":"M58 55L59 55L63 64L62 65L64 67L63 68L67 77L66 81L61 81L60 80L57 80L55 79L52 79L51 78L46 78L43 77L44 76L45 76L52 72L57 67L57 64L58 63L58 55ZM77 55L78 55L78 64L81 70L85 72L93 76L93 78L90 78L90 78L82 79L81 80L75 80L75 81L70 80L70 77L71 76L71 71L72 71L73 65L74 63L74 62L77 55Z"}},side:{w:79,h:450,p:{"glutes":"M22 170L23 171L25 174L24 175L27 180L27 183L28 185L34 200L31 210L26 218L22 221L19 221L14 216L10 210L8 203L8 194L13 181L22 170Z","pec":"M41 82L43 82L57 93L68 106L70 110L70 116L65 123L58 124L57 123L51 122L45 118L40 112L40 108L39 105L43 95L43 89L42 89L42 86L40 83L41 82Z","delt":"M30 78L36 79L40 83L43 87L43 93L42 94L43 97L42 97L42 101L35 113L30 116L28 116L22 112L19 105L19 102L18 100L18 99L17 98L17 92L18 92L18 88L20 84L30 78Z","calf":"M24 300L26 301L28 306L29 317L30 318L29 335L28 335L29 337L28 337L28 342L25 346L20 351L17 351L13 348L12 343L12 343L12 340L11 337L11 327L12 327L12 321L16 313L19 305L24 300ZM30 320L32 320L32 323L32 323L32 326L33 327L32 330L33 331L34 336L34 357L33 358L33 365L32 365L33 372L32 374L32 379L31 386L30 385L30 383L29 382L29 380L28 380L29 378L28 377L28 375L27 373L27 366L26 366L26 363L25 362L26 349L28 346L28 338L29 338L30 333L30 320Z","abs":"M40 126L42 127L42 129L49 142L55 157L55 163L56 163L56 165L57 166L56 170L57 170L57 180L56 181L57 185L55 187L54 186L52 178L48 172L38 163L38 160L35 156L35 147L36 144L36 142L37 140L38 134L39 129L39 127L40 126Z","traps":"M25 40L29 43L36 54L40 66L40 67L41 69L41 70L42 71L42 76L42 78L38 78L35 76L30 76L24 79L20 83L17 92L17 99L18 101L18 112L18 112L18 116L16 117L13 109L13 94L14 93L13 90L14 90L14 88L15 84L24 66L25 61L26 60L27 51L26 51L26 47L25 44L25 40Z","hams":"M19 224L21 226L27 241L27 246L29 250L29 255L30 255L30 260L31 261L31 268L32 268L31 272L32 273L32 280L32 282L31 303L29 301L29 299L28 299L28 292L27 291L26 285L24 281L22 270L21 268L21 266L20 266L21 264L20 264L20 259L19 258L18 235L18 235L18 230L19 229L19 224Z","quads":"M41 237L43 238L43 245L46 249L47 243L48 244L49 249L50 251L52 250L52 247L52 245L54 245L55 248L57 248L58 249L52 268L45 286L42 285L41 279L40 279L40 271L39 270L39 265L38 265L39 260L38 259L38 244L41 244L41 237Z","lats":"M28 146L31 147L38 163L38 165L39 168L40 181L41 182L41 185L42 185L41 188L42 189L42 190L42 191L42 193L43 194L42 195L43 196L43 198L44 199L45 204L43 203L39 197L33 186L33 184L31 178L31 176L30 175L29 168L28 167L29 165L28 164L28 159L28 158L28 146ZM18 109L20 110L22 113L21 115L23 120L27 136L26 150L25 151L24 156L22 158L20 156L21 155L20 154L21 141L20 140L19 131L18 130L19 126L18 125L18 109Z","biceps":"M38 110L39 110L40 113L40 125L39 125L38 135L37 135L38 137L36 141L36 143L35 145L35 147L33 148L31 144L31 135L32 135L31 132L32 132L32 130L33 128L33 123L35 121L38 110Z","forearm":"M61 152L62 153L62 159L62 160L63 169L62 175L62 177L61 178L62 180L61 182L60 182L59 178L60 169L60 155L61 152ZM66 128L68 129L67 131L67 134L66 134L66 139L64 143L64 144L62 147L63 149L61 149L61 145L62 144L61 142L62 141L62 137L64 130L66 128Z"}}};

const MUSCLE_MAP={
  '哑铃侧平举':{view:'front',groups:['delt'],label:'三角肌中束'},
  '绳索侧平举':{view:'front',groups:['delt'],label:'三角肌中束'},
  '反向飞鸟':{view:'side',groups:['delt','traps'],label:'三角肌后束 · 斜方肌'},
  '面拉':{view:'side',groups:['delt','traps'],label:'三角肌后束 · 斜方肌'},
  '高位下拉':{view:'side',groups:['lats'],label:'背阔肌'},
  '坐姿划船':{view:'side',groups:['lats','traps'],label:'背阔肌 · 斜方肌中下束'},
  '直臂下压':{view:'side',groups:['lats'],label:'背阔肌'},
  '攀岩 · 抱石 / 顶绳':{view:'side',groups:['lats','forearm'],label:'背阔肌 · 前臂'},
  '臀推':{view:'side',groups:['glutes','hams'],label:'臀大肌 · 腘绳肌'},
  '罗马尼亚硬拉':{view:'side',groups:['glutes','hams'],label:'臀大肌 · 腘绳肌'},
  '保加利亚分腿蹲':{view:'side',groups:['glutes','quads'],label:'臀大肌 · 股四头肌'},
  '45 度挺身':{view:'side',groups:['glutes','hams'],label:'臀大肌 · 腘绳肌'},
  '髋外展 / 绳索侧抬腿':{view:'side',groups:['glutes'],label:'臀中肌 · 臀大肌'},
  '平板支撑':{view:'front',groups:['abs'],label:'核心（腹直肌）'},
  '死虫式':{view:'front',groups:['abs'],label:'核心（腹直肌）'},
  '臀桥（轻重量激活）':{view:'side',groups:['glutes','hams'],label:'臀大肌 · 腘绳肌'}
};

function renderMuscle(key){
  var m=MUSCLE_MAP[key];
  if(!m) return '';
  var v=MPATH[m.view]||MPATH.front;
  var inner='';
  for(var g in v.p){ inner+='<path class="mf'+(m.groups.indexOf(g)>=0?' on':'')+'" data-g="'+g+'" d="'+v.p[g]+'"/>'; }
  return '<div class="fig"><img alt="" data-muscle-image="'+m.view+'" draggable="false">'+
    '<svg viewBox="0 0 '+v.w+' '+v.h+'" preserveAspectRatio="none">'+inner+'</svg></div>';
}

const DOW = {0:7,1:1,2:2,3:3,4:4,5:5,6:6};

const WD_CN = ['一','二','三','四','五','六','日'];
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function parseIso(s){const p=String(s).split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
function weekStart(){const t=new Date();const wd=DOW[t.getDay()];const m=new Date(t.getFullYear(),t.getMonth(),t.getDate());m.setDate(m.getDate()-(wd-1));return m;}
function dateOf(d){const m=weekStart();m.setDate(m.getDate()+(d-1));return m;}
function todayIso(){return iso(new Date());}
function dowOf(dIso){return DOW[parseIso(dIso).getDay()];}
function planOf(dIso){return DATA[dowOf(dIso)]||{};}
function exCount(dIso){const p=planOf(dIso);return (p.ex||[]).length;}

/* ============ 存储层 ============ */
/* 结构：{v:1, days:{"2026-10-10":{dow:6,title:'C · 核心 + 弱项补强',type:'train',total:4,done:[0,1,2]}}} */
const STORE_KEY='bomi-log-v1';
const LEGACY_RE=/^bomi-\d{4}-\d{2}-\d{2}$/;
let db={v:1,days:{}};

function migrate(){ return 0; }
function loadAll(){ db=window.trainingInitial || {v:1,days:{}}; return db; }
function saveAll(){
  const value=JSON.stringify(db);
  window.trainingSave(value).catch(() => note('保存未确认，请重新打开并核对记录。'));
}
function markDay(dIso,doneArr){
  const p=planOf(dIso);
  const total=(p.ex||[]).length;
  const arr=(doneArr||[]).filter(n=>typeof n==='number'&&n>=0&&n<total).sort((a,b)=>a-b);
  if(!total||!arr.length){delete db.days[dIso];saveAll();return;}
  db.days[dIso]={dow:dowOf(dIso),title:p.title||'',type:p.type||'train',total:total,done:arr};
  saveAll();
}
function recOf(dIso){return db.days[dIso]||null;}
function doneSet(dIso){const r=recOf(dIso);return new Set(r?(r.done||[]):[]);}

/* ============ 统计 ============ */
function stats(){
  const ks=Object.keys(db.days).filter(k=>{const r=db.days[k];return r&&r.done&&r.done.length;});
  let acts=0, full=0, climb=0;
  ks.forEach(k=>{
    const r=db.days[k];
    acts+=r.done.length;
    if(r.total&&r.done.length>=r.total) full++;
    if(r.type==='climb') climb++;
  });
  // 连续周（本周尚未练不打断）
  let streak=0;
  const ws=weekStart();
  for(let i=0;i<300;i++){
    const s=new Date(ws); s.setDate(ws.getDate()-i*7);
    let hit=false;
    for(let j=0;j<7;j++){
      const dd=new Date(s); dd.setDate(s.getDate()+j);
      if(dd>new Date()) continue;
      const r=db.days[iso(dd)];
      if(r&&r.done&&r.done.length){hit=true;break;}
    }
    if(hit) streak++;
    else if(i===0) continue;
    else break;
  }
  return {sessions:ks.length, acts:acts, full:full, climb:climb, streak:streak, last:ks.sort().pop()||null};
}
function monthStat(y,m){
  const days=new Date(y,m+1,0).getDate();
  let planned=0, done=0;
  for(let i=1;i<=days;i++){
    const dIso=iso(new Date(y,m,i));
    if(new Date(y,m,i)>new Date()) break;
    const p=planOf(dIso);
    if(p.type==='train'||p.type==='climb') planned++;
    const r=recOf(dIso);
    if(r&&r.done&&r.done.length) done++;
  }
  return {planned:planned, done:done};
}
function weekStat(start){
  let total=0, done=0;
  for(let j=0;j<7;j++){
    const dd=new Date(start); dd.setDate(start.getDate()+j);
    if(dd>new Date()) continue;
    const p=planOf(iso(dd));
    const n=(p.ex||[]).length;
    total+=n;
    const r=recOf(iso(dd));
    if(r&&r.done) done+=Math.min(r.done.length,n);
  }
  return {total:total, done:done, pct: total?done/total:0};
}

/* ============ 状态 ============ */
let selected = DOW[new Date().getDay()];
let calMonth = new Date(); calMonth.setDate(1);
let selDate = null;
let toastMsg = '';
function note(msg){
  toastMsg=msg;
  if(typeof document==='undefined'||!document.getElementById) return;
  const el=document.getElementById('storeNote');
  if(el){el.textContent=msg;el.style.color='var(--danger)';}
}

/* ============ 渲染：今日训练 ============ */
function renderStrip(){
  const ws=weekStart();
  document.getElementById('weekstrip').innerHTML=[1,2,3,4,5,6,7].map(d=>{
    const dd=new Date(ws); dd.setDate(ws.getDate()+(d-1));
    const cls=['wd'];
    if(DATA[d].type==='train') cls.push('s-train');
    if(DATA[d].type==='climb') cls.push('s-climb');
    if(d===selected) cls.push('active');
    if(d===DOW[new Date().getDay()]) cls.push('today');
    const r=recOf(iso(dd));
    const hit=(r&&r.done&&r.done.length)?' ✓':'';
    return '<div class="'+cls.join(' ')+'" data-d="'+d+'"><div class="d">'+DATA[d].label.slice(1)+'</div><div class="d" style="font-size:10.5px">'+dd.getDate()+hit+'</div><div class="dot"></div></div>';
  }).join('');
  document.querySelectorAll('.wd').forEach(el=>{
    el.onclick=()=>{selected=+el.dataset.d;renderTrain();};
  });
}

function renderDay(){
  const d=DATA[selected];
  const dIso=iso(dateOf(selected));
  const state=doneSet(dIso);
  const isRest = d.type==='rest';
  const card=document.getElementById('dayCard');
  card.className='card'+(d.type==='climb'?' climb':'');

  const total = d.ex? d.ex.length : 0;
  const doneN = d.ex? d.ex.filter((_,i)=>state.has(i)).length : 0;

  let h='<div class="dayhead"><div><h2>'+d.title+'</h2>'+
        (d.focus?'<div class="tag">'+d.focus+'</div>':'')+
        '</div><div class="meta" style="text-align:right">'+d.label+'<br>'+(d.dur||'')+'</div></div>';

  if(isRest){
    h+='<ul class="tips">'+d.tips.map(t=>'<li>'+t+'</li>').join('')+'</ul>';
  }else{
    h+= d.type==='train'
      ? '<div class="progress"><div class="pbar"><i style="width:'+(total?doneN/total*100:0)+'%"></i></div><div class="plabel"><span>完成 '+doneN+' / '+total+'</span><span>'+dIso+'</span></div></div>'
      : '<div class="progress"><div class="pbar"><i style="width:'+(state.size?'100%':'0')+'%"></i></div><div class="plabel"><span>'+(state.size?'已记录今天上墙':'还没记录今天上墙')+'</span><span>'+dIso+'</span></div></div>';
    h+= d.ex.map((e,i)=>{
      const isDone=state.has(i)?' done':'';
      const artHtml=(MUSCLE_MAP[e.n]||ART[e.n])?'<div class="artrow">'+
        (MUSCLE_MAP[e.n]?'<div class="artbox">'+renderMuscle(e.n)+'</div>':'')+
        (ART[e.n]?'<div class="artbox">'+renderArt(ART[e.n])+'</div>':'')+
        '</div>':'';
      const cues=e.cues.map(c=>'<div class="cue'+(c[2]?' warn':'')+'"><b>'+c[0]+'</b>'+c[1]+'</div>').join('');
      return '<div class="ex'+isDone+'">'+
        '<div class="ex-top">'+
          '<input class="ck" type="checkbox" data-i="'+i+'"'+(state.has(i)?' checked':'')+'>'+
          '<div class="ex-main"><div class="ex-name">'+(i+1)+'. '+e.n+'</div>'+
          '<div class="ex-spec"><span class="pill">'+e.s+'</span><span class="pill">'+e.r+'</span><span class="pill rir">'+e.rir+'</span></div>'+
          '<details><summary>动作怎么做</summary>'+artHtml+cues+'</details>'+
          '</div></div></div>';
    }).join('');
    h+='<div class="btnrow"><button class="btn" id="rst">清空这天</button>'+
       '<button class="btn primary" id="all">全部打勾</button></div>';
  }
  card.innerHTML=h;
  card.querySelectorAll('[data-muscle-image]').forEach(img => {
    window.trainingFiles.bindImage(img, 'template-assets/images/'+img.dataset.muscleImage+'.png').catch(() => { img.alt='图解加载失败，请重新打开应用'; });
  });

  card.querySelectorAll('.ck').forEach(el=>{
    el.onchange=()=>{
      const set=doneSet(dIso); const i=+el.dataset.i;
      if(el.checked) set.add(i); else set.delete(i);
      markDay(dIso,[...set]);
      renderDay(); renderRecords();
    };
  });
  const rst=document.getElementById('rst');
  if(rst) rst.onclick=()=>{markDay(dIso,[]);renderDay();renderRecords();};
  const all=document.getElementById('all');
  if(all) all.onclick=()=>{const a=[];d.ex.forEach((_,i)=>a.push(i));markDay(dIso,a);renderDay();renderRecords();};
}

function renderTrain(){renderStrip();renderDay();}

/* ============ 渲染：训练记录 ============ */
function renderStats(){
  const s=stats();
  const ws=weekStart();
  const w=weekStat(ws);
  document.getElementById('statBox').innerHTML=
    '<div class="stat"><div class="n">'+s.sessions+'</div><div class="k">累计训练天数</div></div>'+
    '<div class="stat"><div class="n">'+s.streak+'</div><div class="k">连续打卡周数</div></div>'+
    '<div class="stat"><div class="n">'+s.acts+'</div><div class="k">累计完成动作（项）</div></div>'+
    '<div class="stat"><div class="n">'+Math.round(w.pct*100)+'%</div><div class="k">本周完成率</div></div>'+
    '<div class="stat wide"><div class="n" style="font-size:15px;font-weight:600">'+
      (s.last?('最近打卡：'+s.last):'还没有打卡记录')+'</div>'+
      '<div class="k">完整完成的天数 '+s.full+' 天 · 攀岩记录 '+s.climb+' 次</div></div>';
}

function renderCal(){
  const y=calMonth.getFullYear(), m=calMonth.getMonth();
  const first=new Date(y,m,1);
  const lead=DOW[first.getDay()]-1;              // 周一为一周起点
  const ndays=new Date(y,m+1,0).getDate();
  let cells='';
  ['一','二','三','四','五','六','日'].forEach(w=>{cells+='<div class="hd">'+w+'</div>';});
  for(let i=0;i<lead;i++) cells+='<div class="d blank"></div>';
  const tIso=todayIso();
  for(let i=1;i<=ndays;i++){
    const dIso=iso(new Date(y,m,i));
    const p=planOf(dIso);
    const r=recOf(dIso);
    const cls=['d'];
    if(r&&r.done&&r.done.length){
      const rate=r.total?r.done.length/r.total:1;
      cls.push(rate>=1?'lv3':(rate>=0.5?'lv2':'lv1'));
    }else if(p.type==='train'||p.type==='climb'){
      cls.push(p.type==='climb'?'climb':'plan');
    }
    if(dIso===tIso) cls.push('today');
    if(dIso===selDate) cls.push('sel');
    cells+='<div class="'+cls.join(' ')+'" data-d="'+dIso+'">'+i+'</div>';
  }
  document.getElementById('calGrid').innerHTML=cells;
  document.getElementById('calTitle').textContent=y+' 年 '+(m+1)+' 月';
  const ms=monthStat(y,m);
  document.getElementById('calMeta').textContent=
    '本月安排 '+ms.planned+' 个训练日，已打卡 '+ms.done+' 天'+(ms.planned?('（'+Math.round(ms.done/ms.planned*100)+'%）'):'');
  document.querySelectorAll('#calGrid .d[data-d]').forEach(el=>{
    el.onclick=()=>{selDate=el.dataset.d;renderCal();renderDetail();};
  });
}

function renderDetail(){
  const box=document.getElementById('dayDetail');
  if(!selDate){
    box.innerHTML='<div class="dayhead"><h2>某一天练了什么</h2></div>'+
      '<div class="hint">点上面的日期，可以回看那天完成了哪些动作、落下了哪些。</div>';
    return;
  }
  const p=planOf(selDate);
  const r=recOf(selDate);
  const done=r?(r.done||[]):[];
  const total=(p.ex||[]).length;
  const wd='周'+WD_CN[DOW[parseIso(selDate).getDay()]-1];
  let h='<div class="dayhead"><div><h2>'+selDate+'</h2>'+
        '<div class="tag">'+wd+' · '+(p.title||'—')+'</div></div>'+
        '<div class="meta" style="text-align:right">'+(done.length?('完成 '+done.length+' / '+total):'未打卡')+'</div></div>';
  if(!total){
    h+='<div class="hint">这天是休息日，没有安排动作。</div>';
  }else{
    h+='<ul class="dlist">'+p.ex.map((e,i)=>{
      const ok=done.indexOf(i)>=0;
      return '<li class="'+(ok?'':'miss')+'">'+(ok?'✓ ':'○ ')+e.n+' <span style="color:var(--muted);font-size:12px">'+e.s+' × '+e.r+'</span></li>';
    }).join('')+'</ul>';
    if(!done.length) h+='<div class="hint">这天没有打卡记录。</div>';
  }
  box.innerHTML=h;
}

function renderBars(){
  const ws=weekStart();
  const arr=[];
  for(let i=7;i>=0;i--){
    const s=new Date(ws); s.setDate(ws.getDate()-i*7);
    const st=weekStat(s);
    arr.push({label:(s.getMonth()+1)+'/'+s.getDate(), pct:st.pct, done:st.done, total:st.total});
  }
  const maxPct=1;
  document.getElementById('bars').innerHTML=arr.map(w=>{
    const hpx=Math.max(3, Math.round(w.pct/maxPct*86));
    const zero=w.pct<=0;
    return '<div class="b'+(zero?' zero':'')+'">'+
      '<div class="pv">'+(w.total?Math.round(w.pct*100)+'%':'—')+'</div>'+
      '<i style="height:'+hpx+'px"></i>'+
      '<div class="lb">'+w.label+'</div></div>';
  }).join('');
}

function renderRecords(){
  renderStats();
  renderCal();
  renderDetail();
  renderBars();
  if(!toastMsg){
    document.getElementById('storeNote').innerHTML=
      '打卡记录保存在应用数据库中。可导出 JSON 备份并在需要时导入。';
  }
}

/* ============ 导出 / 导入 ============ */
function exportObj(){
  return {v:1, exportAt:new Date().toISOString(), deviceName:'薄肌训练-手机版', days:db.days};
}
function download(name, text, mime){
  try{
    const blob=new Blob([text],{type:(mime||'text/plain')+';charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=name;
    document.body.appendChild(a); a.click();
    setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},1500);
  }catch(e){
    // 部分手机浏览器不支持下载，退化为显示文本
    note('这台设备不支持直接下载文件，已改为显示数据文本，请手动复制保存。');
    showTxt(true);
  }
}
function toCsv(){
  const rows=[['日期','星期','当天计划','完成动作数','计划动作数','完成率','完成的动作']];
  Object.keys(db.days).sort().forEach(k=>{
    const r=db.days[k];
    const p=planOf(k);
    const names=(r.done||[]).map(i=>(p.ex&&p.ex[i])?p.ex[i].n:('动作'+(i+1)));
    const rate=r.total?Math.round(r.done.length/r.total*100)+'%':'—';
    rows.push([k,'周'+WD_CN[r.dow-1],r.title||p.title||'',
      String((r.done||[]).length),String(r.total||0),rate,names.join(' / ')]);
  });
  return '\ufeff'+rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\r\n');
}
function showTxt(force){
  const ta=document.getElementById('dataTxt');
  ta.value=JSON.stringify(exportObj(),null,1);
  if(force===true) ta.classList.remove('hidden');
  else ta.classList.toggle('hidden');
}
function copyText(text,btn){
  const done=()=>{if(btn){const t=btn.textContent;btn.textContent='已复制 ✓';setTimeout(()=>btn.textContent=t,1500);}};
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(done).catch(()=>{fallback();});
  }else fallback();
  function fallback(){
    const ta=document.getElementById('dataTxt');
    ta.value=text; ta.classList.remove('hidden');
    ta.removeAttribute('readonly'); ta.select();
    try{document.execCommand('copy');done();}catch(e){note('这个浏览器不支持自动复制，请在上面的文本框里手动全选复制。');}
    ta.setAttribute('readonly','readonly');
  }
}
function importJson(text){
  let obj=null;
  try{obj=JSON.parse(text);}catch(e){note('导入失败：这个文件不是有效的备份文件。');return {added:0,merged:0,error:'bad-json'};}
  const days=obj&&obj.days?obj.days:null;
  if(!days||typeof days!=='object'){note('导入失败：备份文件里没有找到打卡数据。');return {added:0,merged:0,error:'no-days'};}
  let added=0, merged=0, skipped=0;
  Object.keys(days).forEach(k=>{
    if(!/^\d{4}-\d{2}-\d{2}$/.test(k)){skipped++;return;}
    const src=days[k]||{};
    const total=(planOf(k).ex||[]).length;
    const ok=(src.done||[]).filter(n=>typeof n==='number'&&n>=0&&n<total);
    if(!total||!ok.length){skipped++;return;}
    const p=planOf(k);
    if(!db.days[k]){ db.days[k]={dow:dowOf(k),title:p.title||src.title||'',type:p.type||'train',total:total,done:ok}; added++; }
    else{
      const set=new Set(db.days[k].done||[]);
      ok.forEach(i=>set.add(i));
      db.days[k].done=[...set].filter(i=>i<total).sort((a,b)=>a-b);
      merged++;
    }
  });
  saveAll();
  toastMsg='已导入：新增 '+added+' 天、合并 '+merged+' 天'+(skipped?('、跳过 '+skipped+' 条无效记录'):'')+'。';
  if(typeof document!=='undefined'&&document.getElementById){
    document.getElementById('storeNote').textContent=toastMsg;
    document.getElementById('storeNote').style.color='var(--accent-2)';
    renderRecords();
  }
  return {added:added, merged:merged, skipped:skipped};
}

/* ============ 渲染：原则 ============ */
function renderRules(){
  document.getElementById('rulesList').innerHTML = RULES.map((r,i)=>
    '<div class="ex"><div class="ex-main"><div class="ex-name" style="font-size:14.5px">'+(i+1)+'. '+r[0]+'</div>'+
    '<div class="cue" style="margin-top:6px">'+r[1]+'</div></div></div>').join('');
}

/* ============ 启动 ============ */
function bootstrap(){
  loadAll();
  renderRules();
  renderTrain();
  renderRecords();
  document.getElementById('hSub').textContent=(function(){
    const t=new Date();
    return (t.getMonth()+1)+'月'+t.getDate()+'日 '+DATA[DOW[t.getDay()]].label;
  })();

  const views={train:['viewTrain','tabTrain'],records:['viewRecords','tabRecords'],rules:['viewRules','tabRules']};
  function go(which){
    Object.keys(views).forEach(k=>{
      document.getElementById(views[k][0]).classList.toggle('hidden',k!==which);
      document.getElementById(views[k][1]).classList.toggle('on',k===which);
    });
    if(which==='records') renderRecords();
  }
  document.getElementById('tabTrain').onclick=()=>go('train');
  document.getElementById('tabRecords').onclick=()=>go('records');
  document.getElementById('tabRules').onclick=()=>go('rules');
  selected=DOW[new Date().getDay()];

  document.getElementById('calPrev').onclick=()=>{calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()-1,1);renderCal();};
  document.getElementById('calNext').onclick=()=>{calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()+1,1);renderCal();};

  document.getElementById('expJson').onclick=()=>download('薄肌训练-打卡备份-'+todayIso()+'.json',
    JSON.stringify(exportObj(),null,2),'application/json');
  document.getElementById('expCsv').onclick=()=>download('薄肌训练-打卡记录-'+todayIso()+'.csv',toCsv(),'text/csv');
  document.getElementById('showTxt').onclick=()=>showTxt();
  document.getElementById('copyBtn').onclick=(e)=>copyText(JSON.stringify(exportObj()),e.currentTarget);
  document.getElementById('impBtn').onclick=()=>document.getElementById('impFile').click();
  document.getElementById('impFile').onchange=(e)=>{
    const f=e.target.files&&e.target.files[0];
    if(!f) return;
    const fr=new FileReader();
    fr.onload=()=>importJson(String(fr.result||''));
    fr.onerror=()=>note('读取这个文件时中断了，换个文件再试试。');
    fr.readAsText(f);
    e.target.value='';
  };
  document.getElementById('clrBtn').onclick=()=>{
    if(!confirm('清空全部打卡记录？此操作不可恢复，建议先导出备份。')) return;
    if(!confirm('再确认一次：真的要清空吗？')) return;
    db={v:1,days:{}};
    saveAll(); selDate=null; toastMsg='已请求清空全部打卡记录。';
    document.getElementById('storeNote').textContent=toastMsg;
    document.getElementById('storeNote').style.color='var(--danger)';
    renderTrain(); renderRecords();
  };
}

if(typeof document!=='undefined'&&document.getElementById&&document.getElementById('tabTrain')){
  bootstrap();
}
if(typeof module!=='undefined'&&module.exports){
  module.exports={loadAll:loadAll,markDay:markDay,stats:stats,monthStat:monthStat,weekStat:weekStat,
    doneSet:doneSet,recOf:recOf,toCsv:toCsv,exportObj:exportObj,importJson:importJson,iso:iso,
    weekStart:weekStart,dateOf:dateOf,dowOf:dowOf,planOf:planOf,getDb:function(){return db;},setDb:function(x){db=x;},
    onNote:function(m){note(m);},migrate:migrate,STORE_KEY:STORE_KEY,DATA:DATA};
}
