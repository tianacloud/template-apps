const style = document.createElement("style"); style.textContent = "\n  :root{\n    --bg:#f1f3f8;--card:#fff;--ink:#1a2233;--muted:#6b7688;--line:#e2e7f0;\n    --accent:#2f5bd7;--red:#c0392b;--yellow:#c08a12;--green:#1f8a54;\n    --shadow:0 2px 10px rgba(26,34,51,.07);\n  }\n  *{box-sizing:border-box}\n  body{margin:0;background:var(--bg);color:var(--ink);\n    font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n    -webkit-font-smoothing:antialiased;padding-bottom:70px}\n  .wrap{max-width:600px;margin:0 auto;padding:0 14px}\n  @media(min-width:960px){.wrap{max-width:960px}}\n  header{padding:18px 0 4px}\n  .brand{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}\n  .brand h1{font-size:16px;margin:0}\n  .brand span{font-size:11.5px;color:var(--muted)}\n  .hero{margin-top:12px;background:linear-gradient(135deg,#1f3b73,#2f5bd7);color:#fff;border-radius:16px;padding:16px;\n    box-shadow:0 6px 18px rgba(47,91,215,.25)}\n  .hero .big{font-size:38px;font-weight:800;line-height:1}\n  .hero .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}\n  .hero .cell{background:rgba(255,255,255,.14);border-radius:10px;padding:8px}\n  .hero .cell b{display:block;font-size:15px}\n  .hero .cell span{font-size:10.5px;opacity:.8}\n\n  nav.tabs{display:flex;gap:5px;margin:14px 0 10px;background:#e4e9f2;padding:4px;border-radius:13px}\n  nav.tabs button{flex:1;border:0;background:transparent;padding:9px 4px;border-radius:9px;font-size:12.5px;\n    color:#43506b;font-weight:600;cursor:pointer;font-family:inherit}\n  nav.tabs button.on{background:#fff;color:var(--accent);box-shadow:var(--shadow)}\n\n  .card{background:var(--card);border-radius:14px;padding:15px;box-shadow:var(--shadow);margin-bottom:11px}\n  .card h2{font-size:13.5px;margin:0 0 10px;display:flex;justify-content:space-between;align-items:center}\n  .card h2 small{font-size:11px;color:var(--muted);font-weight:400}\n\n  .slider{margin:12px 0}\n  .slider .lab{display:flex;justify-content:space-between;font-size:12.5px;color:#46536b;margin-bottom:4px}\n  .slider .lab b{color:var(--accent);font-variant-numeric:tabular-nums}\n  input[type=range]{width:100%;accent-color:var(--accent)}\n\n  .modebar{display:flex;gap:6px;margin-top:10px}\n  .modebar button{flex:1;border:1px solid var(--line);background:#fff;border-radius:10px;padding:9px 4px;font-size:12px;\n    font-weight:600;color:#4a5875;cursor:pointer;font-family:inherit}\n  .modebar button.on{background:#eaf0ff;border-color:#b9c9f5;color:var(--accent)}\n\n  .qrow{display:flex;align-items:center;gap:9px;padding:10px 0;border-bottom:1px dashed var(--line);font-size:13px}\n  .qrow:last-child{border-bottom:0}\n  .qrow .dot{width:8px;height:8px;border-radius:50%;flex:0 0 8px}\n  .qrow .tt{flex:1;line-height:1.5;word-break:break-word}\n  .qrow .go{border:0;background:#eef2fb;color:#34508c;border-radius:8px;padding:6px 10px;font-size:11.5px;\n    font-weight:600;cursor:pointer;font-family:inherit}\n\n  button.primary{width:100%;border:0;border-radius:12px;padding:12px;background:var(--accent);color:#fff;font-weight:700;\n    font-size:14px;cursor:pointer;font-family:inherit;box-shadow:0 3px 12px rgba(47,91,215,.22)}\n  button.primary[disabled]{background:#c3ccdd;box-shadow:none;cursor:not-allowed}\n  button.ghost{border:1px solid var(--line);background:#fff;color:#3a475e;border-radius:10px;padding:8px 11px;font-size:12px;\n    cursor:pointer;font-family:inherit;font-weight:600}\n  .btnbar{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}\n\n  .note{font-size:12px;color:var(--muted);line-height:1.7}\n  .warn{background:#fff5e6;border:1px solid #f0d6a6;color:#7a5413;border-radius:10px;padding:9px 11px;font-size:12px;line-height:1.65}\n  .lock{background:#fdecea;border:1px solid #f3c7c1;color:#98302a;border-radius:10px;padding:9px 11px;font-size:12px;line-height:1.65}\n\n  .qcard{border:1px solid var(--line);border-radius:12px;padding:13px;margin-top:10px}\n  .qcard .qt{font-size:14px;line-height:1.65;font-weight:600}\n  .qcard .meta{font-size:11.5px;color:var(--muted);margin-top:6px;display:flex;gap:10px;flex-wrap:wrap}\n  textarea,input[type=number],input[type=text],input[type=date],select{\n    width:100%;border:1px solid var(--line);border-radius:10px;padding:9px 11px;font-size:13.5px;font-family:inherit;\n    color:var(--ink);background:#fff}\n  textarea{min-height:110px;resize:vertical}\n  label.f{display:block;font-size:11.5px;color:#4a5875;font-weight:600;margin:10px 0 4px}\n  .two{display:grid;grid-template-columns:1fr 1fr;gap:9px}\n\n  .timer{font-size:26px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:.5px}\n  .res{border-left:4px solid var(--accent);background:#f6f8ff;border-radius:10px;padding:11px 12px;font-size:12.5px;line-height:1.8}\n  .res b{color:var(--accent)}\n\n  .kv{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}\n  @media(min-width:700px){.kv{grid-template-columns:repeat(4,1fr)}}\n  .kv .b{background:#f6f8fd;border-radius:11px;padding:10px}\n  .kv .b .n{font-size:18px;font-weight:800;font-variant-numeric:tabular-nums}\n  .kv .b .l{font-size:10.5px;color:var(--muted);margin-top:2px}\n\n  .bar{height:8px;border-radius:99px;background:#e7ecf6;overflow:hidden;margin-top:6px}\n  .bar i{display:block;height:100%;border-radius:99px}\n\n  .tabs2{display:flex;gap:6px;margin-bottom:10px}\n  .tabs2 button{flex:1;border:1px solid var(--line);background:#fff;border-radius:9px;padding:7px 4px;font-size:12px;\n    font-weight:600;color:#4a5875;cursor:pointer;font-family:inherit}\n  .tabs2 button.on{background:#eaf0ff;border-color:#b9c9f5;color:var(--accent)}\n\n  .bcard{border:1px solid var(--line);border-radius:11px;padding:11px;margin-bottom:8px}\n  .bcard .t{font-size:12.8px;line-height:1.55}\n  .bcard .m{font-size:11px;color:var(--muted);margin-top:5px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}\n  .pill{background:#eef2fa;border-radius:999px;padding:1px 7px;font-size:10.5px;color:#4a5875}\n\n  .hidden{display:none!important}\n  .muted{color:var(--muted);font-size:11.5px;line-height:1.7}\n  footer{text-align:center;color:#9aa6ba;font-size:10.5px;padding:16px 0}\n  .chk{display:flex;align-items:center;gap:8px;padding:7px 0;font-size:12.8px;border-bottom:1px dashed var(--line)}\n  .chk:last-child{border-bottom:0}\n  .chk input{width:17px;height:17px;accent-color:var(--accent)}\n\n  .searchrow{display:flex;gap:7px;margin-bottom:9px}\n  .searchrow input{flex:1}\n  .chips{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 10px}\n  .chips button{border:1px solid var(--line);background:#fff;border-radius:999px;padding:5px 11px;font-size:11.5px;\n    color:#4a5875;cursor:pointer;font-family:inherit;font-weight:600}\n  .chips button.on{background:#eaf0ff;border-color:#b9c9f5;color:var(--accent)}\n  .modal{position:fixed;inset:0;background:rgba(20,26,38,.45);display:flex;align-items:flex-end;justify-content:center;z-index:50}\n  .modal-box{background:#fff;width:100%;max-width:560px;border-radius:16px 16px 0 0;padding:16px;max-height:86vh;overflow:auto}\n  @media(min-width:960px){.modal{align-items:center}.modal-box{border-radius:16px}}\n  .tag{display:inline-block;font-size:10px;border-radius:5px;padding:1px 6px;margin-left:6px}\n  .tag.no{background:#fdecea;color:#98302a}\n  .tag.ok{background:#e8f5ee;color:#1f8a54}\n"; document.head.appendChild(style);
document.getElementById("app").innerHTML = "\n<div class=\"wrap\">\n  <header>\n    <div class=\"brand\">\n      <h1>631 冲刺 · 三池调度</h1>\n      <span>上体 · 运动人体科学（运人，统招 14）</span>\n    </div>\n    <div class=\"hero\">\n      <div class=\"big\" id=\"dLeft\">--</div>\n      <div style=\"font-size:11.5px;opacity:.85;margin-top:2px\">天后开考（2026-12-19）· <span id=\"phaseTxt\">A</span></div>\n      <div class=\"grid\">\n        <div class=\"cell\"><b id=\"hAvg\">--</b><span>池平均(折算)</span></div>\n        <div class=\"cell\"><b id=\"hRed\">--</b><span>红池待做</span></div>\n        <div class=\"cell\"><b id=\"hDue\">--</b><span>今日到期</span></div>\n      </div>\n    </div>\n  </header>\n\n  <nav class=\"tabs\">\n    <button data-tab=\"today\" class=\"on\">今日</button>\n    <button data-tab=\"bank\">题库</button>\n    <button data-tab=\"stats\">统计</button>\n    <button data-tab=\"cfg\">设置</button>\n  </nav>\n\n  <section id=\"tab-today\">\n    <div class=\"card\" id=\"stateCard\">\n      <h2>今天什么状态<small>按真实填</small></h2>\n      <div class=\"slider\">\n        <div class=\"lab\"><span>昨晚睡了</span><b id=\"vSleep\">7 h</b></div>\n        <input type=\"range\" id=\"sleep\" min=\"3\" max=\"10\" step=\"0.5\" value=\"7\">\n      </div>\n      <div class=\"slider\">\n        <div class=\"lab\"><span>情绪</span><b id=\"vMood\">3 / 5</b></div>\n        <input type=\"range\" id=\"mood\" min=\"1\" max=\"5\" step=\"1\" value=\"3\">\n      </div>\n      <div class=\"slider\">\n        <div class=\"lab\"><span>今天大概能学</span><b id=\"vHours\">4 h</b></div>\n        <input type=\"range\" id=\"hours\" min=\"1\" max=\"10\" step=\"0.5\" value=\"4\">\n      </div>\n      <div class=\"chk\"><input type=\"checkbox\" id=\"bodyBad\"><span>身体不适（燥热 / 烦躁 / 头痛 / 静坐不能）</span></div>\n      <div class=\"chk\"><input type=\"checkbox\" id=\"bodyGood\"><span>今天异常亢奋、话多、想通宵——自己留意一下</span></div>\n      <div class=\"modebar\">\n        <button data-mode=\"good\">好</button>\n        <button data-mode=\"normal\">一般</button>\n        <button data-mode=\"bad\">差</button>\n      </div>\n      <div class=\"note\" style=\"margin-top:8px\" id=\"modeHint\">配方会按状态自动给，也可以手动改。</div>\n    </div>\n\n    <div class=\"card\" id=\"planCard\"></div>\n    <div class=\"card\" id=\"gradeCard\"></div>\n    <div class=\"card\" id=\"blockCard\"></div>\n    <div class=\"card\" id=\"pubCard\"></div>\n    <div class=\"card\" id=\"reportCard\"></div>\n  </section>\n\n  <section id=\"tab-bank\" class=\"hidden\">\n    <div class=\"tabs2\" id=\"bankTabs\">\n      <button data-pool=\"all\" class=\"on\">全部 <span id=\"cAll\"></span></button>\n      <button data-pool=\"red\">红 <span id=\"cRed\"></span></button>\n      <button data-pool=\"yellow\">黄 <span id=\"cYellow\"></span></button>\n      <button data-pool=\"green\">绿 <span id=\"cGreen\"></span></button>\n    </div>\n    <div class=\"card\">\n      <h2>搜题目 <small>自己挑，不用等随机</small></h2>\n      <div class=\"muted\" style=\"margin-bottom:8px\">材料状态：<b>有答案/缺答案</b>　｜　优先级：<b>核心/补充/蓄水池/扫一眼/已搁置</b>　｜　<b>卷面版</b>＝已有短版可背</div>\n      <div class=\"searchrow\">\n        <input type=\"text\" id=\"bankSearch\" placeholder=\"输入关键词，如 足弓、突触、心音\">\n        <button class=\"ghost\" id=\"clearSearch\">清空</button>\n      </div>\n      <div class=\"chips\" id=\"bankChips\">\n        <button data-f=\"all\" class=\"on\">全部</button>\n        <button data-f=\"untested\">未测</button>\n        <button data-f=\"noans\">缺答案</button>\n        <button data-f=\"due\">今日到期</button>\n        <button data-f=\"stuck\">顽固</button>\n        <button data-f=\"jp\">有卷面版</button>\n      </div>\n      <div class=\"muted\" id=\"bankCount\"></div>\n      <details id=\"missBox\" style=\"margin:10px 0;border:1px solid var(--line);border-radius:10px;padding:8px 10px\">\n        <summary style=\"cursor:pointer;font-size:12.5px;font-weight:600;color:#1f3b73\">漏点清单 <span id=\"missCount\" class=\"muted\" style=\"font-weight:400\"></span></summary>\n        <div id=\"missList\" style=\"margin-top:8px\"></div>\n      </details>\n      <div id=\"bankList\" style=\"margin-top:10px\"></div>\n    </div>\n  </section>\n\n  <div id=\"modal\" class=\"modal hidden\"><div class=\"modal-box\" id=\"modalBox\"></div></div>\n\n  <section id=\"tab-stats\" class=\"hidden\">\n    <div class=\"card\">\n      <h2>按分值加权平均<small>50 分题权重 2倍</small></h2>\n      <div class=\"kv\">\n        <div class=\"b\"><div class=\"n\" id=\"sAvg\">--</div><div class=\"l\">折算 / 300</div></div>\n        <div class=\"b\"><div class=\"n\" id=\"sDiff220\">--</div><div class=\"l\">距 220 单科线</div></div>\n        <div class=\"b\"><div class=\"n\" id=\"sDiff225\">--</div><div class=\"l\">距 225 目标</div></div>\n        <div class=\"b\"><div class=\"n\" id=\"sDiff240\">--</div><div class=\"l\">距 240 理想</div></div>\n      </div>\n      <div class=\"note\" style=\"margin-top:9px\">这只是闭卷复现率，掉分是遗忘，不代表退步。</div>\n    </div>\n    <div class=\"card\"><h2>优先级<small>抽题按此顺序</small></h2><div id=\"tierStats\"></div></div>\n    <div class=\"card\"><h2>各池</h2><div id=\"poolStats\"></div></div>\n    <div class=\"card\"><h2>有效题量</h2><div id=\"effStats\"></div></div>\n    <div class=\"card\"><h2>扫一眼清单<small>考前过一遍就行</small></h2><div id=\"skimList\"></div></div>\n    <div class=\"card\"><h2>最近评分</h2><div id=\"recentList\"></div></div>\n    <div class=\"card\"><h2>顽固点<small>同一漏点 ≥3 次</small></h2><div id=\"stuckList\"></div></div>\n  </section>\n\n  <section id=\"tab-cfg\" class=\"hidden\">\n    <div class=\"card\">\n      <h2>考试与分数</h2>\n      <div class=\"two\">\n        <div><label class=\"f\">考试第一天</label><input type=\"date\" id=\"cExam\"></div>\n        <div><label class=\"f\">631 单科线</label><input type=\"number\" id=\"cLine\"></div>\n      </div>\n      <div class=\"two\">\n        <div><label class=\"f\">目标分</label><input type=\"number\" id=\"cTarget\"></div>\n        <div><label class=\"f\">理想分</label><input type=\"number\" id=\"cIdeal\"></div>\n      </div>\n      <div class=\"two\">\n        <div><label class=\"f\">解剖满分</label><input type=\"number\" id=\"cAna\"></div>\n        <div><label class=\"f\">生理满分</label><input type=\"number\" id=\"cPhy\"></div>\n      </div>\n      <div class=\"two\">\n        <div><label class=\"f\">一战 631</label><input type=\"number\" id=\"cMj\"></div>\n        <div><label class=\"f\">一战 英语 / 政治</label>\n          <div style=\"display:flex;gap:6px\"><input type=\"number\" id=\"cEn\"><input type=\"number\" id=\"cPo\"></div>\n        </div>\n      </div>\n      <div class=\"chk\" style=\"margin-top:12px\"><input type=\"checkbox\" id=\"cCoreOnly\"><span>核心优先：只推进核心 90 道（A 阶段建议开）</span></div>\n      <div class=\"chk\"><input type=\"checkbox\" id=\"cOnlyAns\"><span>只抽已有答案的题（28 道缺答案的题暂不排进队列）</span></div>\n      <button class=\"primary\" id=\"saveCfg\" style=\"margin-top:12px\">保存</button>\n      <div class=\"muted\" id=\"cfgMsg\" style=\"margin-top:6px\"></div>\n    </div>\n\n    <div class=\"card\">\n      <h2>公共课 <small>默认关</small></h2>\n      <div class=\"note\">要开始写题，又怕顾此失彼——所以做成总闸：打开后每天合计不超过上限，写题最多 1 项，只排晚上，不碰 14–17 点。</div>\n      <div class=\"chk\"><input type=\"checkbox\" id=\"cPubOn\"><span>启用公共课（单词 / 听课 / 写题）</span></div>\n      <div class=\"two\" style=\"margin-top:8px\">\n        <div><label class=\"f\">每天上限(分钟)</label><input type=\"number\" id=\"cPubCap\" value=\"45\"></div>\n      </div>\n      <button class=\"ghost\" id=\"savePub\" style=\"margin-top:10px\">保存</button>\n    </div>\n\n    <div class=\"card\">\n      <h2>数据</h2>\n      <div class=\"btnbar\">\n        <button class=\"ghost\" id=\"expJson\">导出备份</button>\n        <button class=\"ghost\" id=\"expMd\">导出战报 Markdown</button>\n        <button class=\"ghost\" id=\"copyMd\">复制战报</button>\n        <button class=\"ghost\" id=\"impBtn\">导入备份</button>\n      </div>\n      <input type=\"file\" id=\"impFile\" accept=\"application/json\" class=\"hidden\">\n      <div class=\"muted\" style=\"margin-top:8px\">手机和电脑不自动同步，靠导出/导入搬。</div>\n    </div>\n  </section>\n\n  <footer id=\"foot\">本地离线 · 数据只在你自己的浏览器里</footer>\n</div>\n\n";

/* ================= 基础 ================= */
/* 631 冲刺 · 三池调度
   版本：v3.2　｜　构建日期：2026-10-21
   变更：核心优先模式、加权指标、复习上限锁、搁置/扫一眼分级、搜索与手动标注、
         v2.6 复习间隔与到期上限；v2.7 漏点清单；v2.8 漏点分隔改分号（顿号逗号不拆）、
         漏点框改多行、实时预览拆成几条、题库卡片显示全部漏点
*/
const APP_VER = 'v3.2';
const APP_DATE = '2026-10-21';
const KEY = 'sanchi-study-v1';
const pad = n => String(n).padStart(2, '0');
const todayStr = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parseDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000);
const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return todayStr(d); };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const POOL = {
  red:    { n: '红', c: '#c0392b', next: 2 },
  yellow: { n: '黄', c: '#c08a12', next: 4 },
  green:  { n: '绿', c: '#1f8a54', next: 7 }
};

/* ================= 题库（48 + 14 + 24） ================= */
function Q(pool, g, t, v, tier) { return { pool, g, t, v: v || 25, tier: tier || 1 }; }
const RAW = [
  Q('red','应用篇·运动处方','运动处方的基本要素（FITT-VP）',50),
  Q('red','应用篇·运动处方','运动处方的制定步骤与实施',50),
  Q('red','应用篇·运动处方','具体运动处方举例：高血压 / 糖尿病 / 肥胖 / 骨质疏松',50),
  Q('red','应用篇·运动技能','运动技能的概念、分类与生理本质',25),
  Q('red','应用篇·运动技能','运动技能形成的三个阶段（泛化/分化/巩固与自动化）及教学要点',50),
  Q('red','应用篇·运动技能','影响运动技能学习发展的因素',25),
  Q('red','应用篇·有氧无氧','需氧量、摄氧量、氧亏、运动后过量氧耗的概念',25),
  Q('red','应用篇·有氧无氧','最大摄氧量：概念、影响因素、训练提高方法',50),
  Q('red','应用篇·有氧无氧','乳酸阈：概念、生理意义、训练提高方法',50),
  Q('red','应用篇·有氧无氧','无氧工作能力的生理基础与评价',25),
  Q('red','应用篇·有氧无氧','提高无氧工作能力的训练方法',25),
  Q('red','应用篇·身体素质','力量素质：决定肌肉力量的生物学因素；力量训练原则与方法',50),
  Q('red','应用篇·身体素质','速度素质的生理基础与训练',50),
  Q('red','应用篇·身体素质','耐力素质：有氧/无氧耐力的生理基础及训练',50),
  Q('red','应用篇·身体素质','平衡、灵敏、柔韧、协调的生理基础',25),
  Q('red','应用篇·疲劳与机能状态','运动性疲劳的概念与分类',25),
  Q('red','应用篇·疲劳与机能状态','运动性疲劳的产生机理（6 学说）',50),
  Q('red','应用篇·疲劳与机能状态','运动性疲劳的判断方法',25),
  Q('red','应用篇·疲劳与机能状态','赛前状态与准备活动',25),
  Q('red','应用篇·疲劳与机能状态','生理“极点”与“第二次呼吸”',25),
  Q('red','应用篇·疲劳与机能状态','进入工作状态的原因与影响因素；稳定状态',25),
  Q('red','应用篇·疲劳与机能状态','恢复过程的一般规律；促进恢复的措施',50),
  Q('red','应用篇·项目特点','田径（短跑/中长跑/跳跃/投掷）的生理学特点',50),
  Q('red','应用篇·项目特点','体操/球类/游泳/重竞技的生理学特点',50),
  Q('red','应用篇·项目特点','体能（基础/专项/综合）的构成要素与测评',25),
  Q('red','生理基础高频章','肌纤维类型的划分及形态、生理、生化特征',50),
  Q('red','生理基础高频章','骨骼肌的收缩形式及力学表现',25),
  Q('red','生理基础高频章','肌纤维的收缩过程完整链条',50),
  Q('red','生理基础高频章','肌纤维类型与运动能力',25),
  Q('red','生理基础高频章','运动对骨骼肌形态和机能的影响',50),
  Q('red','生理基础高频章','延迟性肌肉酸痛（DOMS）',25),
  Q('red','生理基础高频章','心肌的生理特性',25),
  Q('red','生理基础高频章','心脏的泵血功能',50),
  Q('red','生理基础高频章','动脉血压：形成机制与影响因素',50),
  Q('red','生理基础高频章','心血管活动的调节',50),
  Q('red','生理基础高频章','尿的生成过程',50),
  Q('red','生理基础高频章','肾脏在水平衡与酸碱平衡中的作用；运动性蛋白尿/血尿',50),
  Q('red','生理基础高频章','内分泌功能与运动能力的关系',50),
  Q('red','生理基础高频章','体温调节机制（调定点学说）',25),
  Q('red','解剖与真题缺口','躯体运动神经与内脏运动神经的差异',25),
  Q('red','解剖与真题缺口','口服药物从口腔摄入至尿液排出的途径',50),
  Q('red','解剖与真题缺口','影响能量代谢的因素；基础代谢',25),
  Q('red','解剖与真题缺口','呼吸运动的反射性调节',25),
  Q('red','解剖与真题缺口','前庭器官的组成及功能',25),
  Q('red','解剖与真题缺口','激素的作用机制；调节血糖的激素',50),
  Q('red','解剖与真题缺口','内环境稳态：体液分布、稳态定义与意义',25),
  Q('red','解剖与真题缺口','肌组织的分类、构成与特点',25),
  Q('red','解剖与真题缺口','细胞的基本功能（物质转运 / 生物电 / 兴奋性 / 兴奋-收缩耦联）',50),

  Q('yellow','黄池·待二次验证','腹膜与腹腔脏器位置关系、腹膜形成结构'),
  Q('yellow','黄池·待二次验证','肺的形态结构与血液循环特点'),
  Q('yellow','黄池·待二次验证','肾的位置、形态、结构与血液循环'),
  Q('yellow','黄池·待二次验证','微循环的组成与血流通路'),
  Q('yellow','黄池·待二次验证','胰与大肠的结构与功能'),
  Q('yellow','黄池·待二次验证','神经-肌肉接头的兴奋传递过程'),
  Q('yellow','黄池·待二次验证','兴奋-收缩耦联的过程'),
  Q('yellow','黄池·待二次验证','肌丝滑行理论'),
  Q('yellow','黄池·待二次验证','运动单位动员规律'),
  Q('yellow','黄池·待二次验证','氧解离曲线各段特征及运动时的变化',50),
  Q('yellow','黄池·待二次验证','静脉的结构与分布'),
  Q('yellow','黄池·待二次验证','运动员血液的特点'),
  Q('yellow','黄池·待二次验证','骨骼肌的物理特性与生理特性'),
  Q('yellow','黄池·待二次验证','三大供能系统的特点及与运动项目的关系',50),

  Q('green','绿池·轻维护','运动对骨的影响'),
  Q('green','绿池·轻维护','关节的主要结构与辅助结构'),
  Q('green','绿池·轻维护','影响肌肉力量的因素'),
  Q('green','绿池·轻维护','少儿骨骼肌的特点及其训练注意'),
  Q('green','绿池·轻维护','颈、胸、腰椎的异同'),
  Q('green','绿池·轻维护','关节运动幅度及其影响因素'),
  Q('green','绿池·轻维护','肩关节的构造与运动',50),
  Q('green','绿池·轻维护','髋关节的构造与运动',50),
  Q('green','绿池·轻维护','膝关节的构造与运动',50),
  Q('green','绿池·轻维护','踝关节的构造与运动',50),
  Q('green','绿池·轻维护','肘关节的构造与运动'),
  Q('green','绿池·轻维护','足弓的组成与功能',50),
  Q('green','绿池·轻维护','多关节肌的工作特点'),
  Q('green','绿池·轻维护','椎间盘的位置、形态、结构与功能'),
  Q('green','绿池·轻维护','体育运动对消化系统的影响',50),
  Q('green','绿池·轻维护','体育运动对呼吸系统的影响',50),
  Q('green','绿池·轻维护','运动对泌尿系统的影响',50),
  Q('green','绿池·轻维护','长期运动对红细胞的影响'),
  Q('green','绿池·轻维护','交感神经与副交感神经的主要区别',50),
  Q('green','绿池·轻维护','运动员心脏的结构与功能特点',50),
  Q('green','绿池·轻维护','心的位置、外形与体表投影'),
  Q('green','绿池·轻维护','心壁与心腔瓣膜'),
  Q('green','绿池·轻维护','胸廓的组成与运动'),
  Q('green','绿池·轻维护','骨盆的结构与运动'),
  Q('green','绿池·轻维护','心传导系的组成、功能与传导途径',50),
  Q('green','绿池·轻维护','引体向上的解剖学分析',50)
,

  /* ===== 补充卷：一战学过 + 考纲缺口 ===== */
  Q('red','补·解剖基础','人体的基本构成',25,2),
  Q('red','补·解剖基础','常用解剖学术语（轴、面、方位术语）',25,2),
  Q('red','补·解剖基础','骨的分类',25,2),
  Q('red','补·解剖基础','骨的构造',25,2),
  Q('red','补·解剖基础','骨的发生与生长发育',25,2),
  Q('red','补·解剖基础','骨的功能',25,2),
  Q('red','补·解剖基础','影响骨生长发育的因素',25,2),
  Q('red','补·解剖基础','关节的分类（按运动轴）',25,2),
  Q('red','补·解剖基础','关节的运动形式',25,2),
  Q('red','补·解剖基础','骨骼肌的分类与命名',25,2),
  Q('red','补·解剖基础','骨骼肌的构造',25,2),
  Q('red','补·解剖基础','骨骼肌的工作术语',25,2),
  Q('red','补·解剖基础','肌的协作关系',25,2),
  Q('red','补·解剖基础','肌肉的工作性质',25,2),
  Q('red','补·解剖基础','头部骨的连结与肌肉',25,2),
  Q('red','补·解剖基础','脊柱的连结与运动',25,2),
  Q('red','补·解剖基础','腕关节的构造与运动',25,2),
  Q('red','补·解剖基础','上肢带（肩带）的运动',25,2),
  Q('red','补·解剖基础','体育动作解剖学分析的基本理论',50,1),
  Q('red','补·解剖基础','体育动作解剖学分析的基本方法（五列表）',50,1),
  Q('red','补·生理基础','静息电位与动作电位的产生机制',50,2),
  Q('red','补·生理基础','动作电位在同一细胞上的传导',25,2),
  Q('red','补·生理基础','刺激强度、刺激时间与阈值（组织兴奋的条件）',25,2),
  Q('red','补·生理基础','单收缩与强直收缩',25,2),
  Q('red','补·生理基础','前负荷、后负荷与肌肉收缩能力',25,2),
  Q('red','补·生理基础','血液的组成与功能（运输、内环境、调节、防御）',50,2),
  Q('red','补·生理基础','运动对血量、红细胞、白细胞的影响',50,2),
  Q('red','补·生理基础','心动周期与心率',25,2),
  Q('red','补·生理基础','心脏泵血过程',50,2),
  Q('red','补·生理基础','心输出量及其影响因素',25,2),
  Q('red','补·生理基础','心血管活动的神经调节与体液调节',50,2),
  Q('red','补·生理基础','化学感受器反射',25,2),
  Q('red','补·生理基础','运动时呼吸的变化与调节',50,2),
  Q('red','补·生理基础','运动中合理的呼吸方法',25,2),
  Q('red','补·生理基础','感受器的一般生理特征',25,2),
  Q('red','补·生理基础','反射弧的组成、反射类型与生理意义',25,2),
  Q('red','补·生理基础','儿茶酚胺与运动',25,2),
  Q('red','补·生理基础','糖皮质激素、生长激素与运动',50,2),
  Q('red','补·生理基础','胰岛素与胰高血糖素',25,2),
  Q('red','补·生理基础','最大重复次数（RM）及力量训练应用',25,2),
  Q('red','考纲补·特殊环境与评定','高原训练对机体的生理适应及高原训练的要素',50,2),
  Q('red','考纲补·特殊环境与评定','热环境运动时人体的散热方式与热病预防',25,2),
  Q('red','考纲补·特殊环境与评定','运动员身体机能评定的常用指标及意义',50,2),
  Q('red','考纲补·特殊环境与评定','适宜运动量的生理学评定',25,2),
  Q('red','考纲补·儿童少年与女性衰老','儿童少年生长发育的一般规律与影响因素',50,2),
  Q('red','考纲补·儿童少年与女性衰老','儿童少年各系统的生理特点及体育教学与训练注意',50,2),
  Q('red','考纲补·儿童少年与女性衰老','女性的生理特点与运动能力特点',50,2),
  Q('red','考纲补·儿童少年与女性衰老','月经周期中运动能力的变化及经期训练注意',25,2),
  Q('red','考纲补·儿童少年与女性衰老','衰老的机理与老年人的生理特点',50,2),
  Q('red','考纲补·儿童少年与女性衰老','老年人健身运动的原则',25,2),
  Q('red','考纲补·中枢神经','脊髓的位置、外形、内部结构与功能',50,2),
  Q('red','考纲补·中枢神经','脑干、小脑、间脑、端脑的结构与功能',50,2),
  Q('red','考纲补·中枢神经','大脑半球的分叶与大脑皮质的功能定位',25,2),
  Q('red','考纲补·内分泌（解剖）','甲状腺、肾上腺、垂体的结构与功能',50,2),
  Q('red','考纲补·内分泌（解剖）','胰岛与甲状旁腺的结构与功能',25,2),
  Q('red','考纲补·组织学','上皮组织的分类、结构与功能',25,2),
  Q('red','考纲补·组织学','结缔组织的分类与功能（含软骨、骨组织、血液）',25,2),
  Q('red','考纲补·组织学','神经组织的结构（神经元、突触、神经末梢）',25,2),
  Q('red','考纲补·组织学','本体感受器：肌梭与腱梭的结构与功能',25,2),
  Q('red','考纲补·神经机能','突触传递的过程与特征',25,2),
  Q('red','考纲补·神经机能','中枢抑制的类型与生理意义',25,2),
  Q('red','考纲补·神经机能','神经系统对躯体运动的调控（脊髓、脑干、小脑、基底神经节、皮质）',50,2),
  Q('red','考纲补·神经机能','条件反射与两个信号系统',25,2),
  Q('red','考纲补·循环与呼吸节级','心音的产生与意义',25,2),
  Q('red','考纲补·循环与呼吸节级','心电图各波的意义',25,2),
  Q('red','考纲补·循环与呼吸节级','动脉脉搏与静脉回心血量的影响因素',25,2),
  Q('red','考纲补·循环与呼吸节级','肺通气机能的指标（肺活量、时间肺活量、每分通气量）',25,2),
  Q('red','考纲补·循环与呼吸节级','气体交换与气体运输（氧和二氧化碳的运输形式）',25,2),
  Q('red','蓄水池·低优先','男性生殖系统的组成',25,3),
  Q('red','蓄水池·低优先','女性生殖系统的组成',25,3),
  Q('red','蓄水池·低优先','淋巴管道与淋巴器官的组成与功能',25,3),
  Q('red','蓄水池·低优先','脾与胸腺的结构与功能',25,3),
  Q('red','蓄水池·低优先','眼球的构造（眼球壁与内容物）',25,3),
  Q('red','蓄水池·低优先','眼副器与眼球外肌',25,3),
  Q('red','蓄水池·低优先','脑和脊髓的被膜与脑脊液循环',25,3),
  Q('red','蓄水池·低优先','脑屏障的概念与意义',25,3),
  Q('red','蓄水池·低优先','神经系统的区分与常用术语',25,3),
  Q('red','蓄水池·低优先','神经系统的基本活动方式（反射）',25,3),
  Q('red','蓄水池·低优先','细胞的基本结构（细胞膜、细胞质、细胞核）',25,3),
  Q('red','蓄水池·低优先','细胞间质的组成',25,3)
];
RAW.forEach((q, i) => { q.id = String(i + 1).padStart(3, '0'); });
const QBASE = {};
RAW.forEach(q => { QBASE[q.id] = q; });

/* ================= 漏点修复（v3.1 一次性重写：漏/错分开） =================
   旧版把顿号、逗号也当分隔符，一条漏点被拆成一堆碎片。
   这里按题目重写成整句，并把「没写」和「写错」分开，只执行一次（DB.missFix 记版本）。
*/
const MISSFIX = [];
function applyMissFix() {
  if ((DB.missFix || 0) >= 2) return 0;
  let n = 0;
  MISSFIX.forEach(f => {
    const q = RAW.find(x => x.t.includes(f.k));
    if (!q) return;
    const s = st(q.id);
    s.miss = f.miss.slice();
    s.wrong = (f.wrong || []).slice();
    if (!s.missLog.length) s.missLog.push({ d: s.date || todayStr(), pct: s.pct === null ? 0 : s.pct, miss: s.miss.slice(), wrong: s.wrong.slice() });
    else {
      const last = s.missLog[s.missLog.length - 1];
      last.miss = s.miss.slice();
      last.wrong = s.wrong.slice();
    }
    n++;
  });
  DB.missFix = 2;
  save();
  return n;
}

/* ================= 状态 ================= */
function fresh() {
  return {
    v: 2,
    cfg: {
      exam: '2026-12-19', line: 220, target: 225, ideal: 240,
      split: { ana: 200, phy: 100 }, mFull: 300,
      one: { mj: 190, en: 68, po: 62 },
      pub: { on: false, cap: 45 },
      onlyAns: true, reviewCap: 6, coreOnly: true
    },
    qs: {}, days: {}, log: []
  };
}
let storageOK = true;
let DB = fresh();
try {
  const raw = localStorage.getItem(KEY);
  if (raw) { const p = JSON.parse(raw); if (p && p.cfg) DB = Object.assign(fresh(), p); }
} catch (e) { storageOK = false; }
function save() {
  if (!storageOK) return;
  try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { storageOK = false; }
}

function st(id) {
  if (!DB.qs[id]) DB.qs[id] = { pool: QBASE[id].pool, attempts: 0, pct: null, date: null, next: null, success: 0, miss: [], wrong: [], missLog: [], hist: [], qdays: { yellow: [], green: [] }, stuck: false, mastered: false, note: '', skip: false, skim: false };
  if (!Array.isArray(DB.qs[id].missLog)) DB.qs[id].missLog = [];
  if (!Array.isArray(DB.qs[id].wrong)) DB.qs[id].wrong = [];
  return DB.qs[id];
}
function poolOf(id) { return st(id).pool; }

const SEED = [];

/* 明确不考、默认搁置的题：生殖 2 道 + 颅面骨 1 道 */
const SKIP_DEFAULT = (function () {
  const t2 = RAW.filter(q => (q.tier || 1) === 2);
  const t3 = RAW.filter(q => (q.tier || 1) === 3);
  const out = [];
  if (t3[0]) out.push(t3[0].id);
  if (t3[1]) out.push(t3[1].id);
  if (t2[14]) out.push(t2[14].id);
  return out;
})();
(function initSkip() {
  SKIP_DEFAULT.forEach(id => { st(id).skip = true; });
})();
function isSkip(id) { return !!st(id).skip; }
/* 扫一眼级：蓄水池里没被搁置的，只在考前过一遍，不进首轮 */
(function initSkim() {
  RAW.filter(q => (q.tier || 1) === 3).forEach(q => { if (!st(q.id).skip) st(q.id).skim = true; });
})();
function isSkim(id) { return !!st(id).skim; }
const rank = p => ({ red: 0, yellow: 1, green: 2 }[p]);

function day(dt) {
  const d = dt || todayStr();
  if (!DB.days[d]) DB.days[d] = { d, mode: null, sleep: 7, mood: 3, hours: 4, bodyBad: false, bodyGood: false, graded: [], blocks: { a: false, b: false, c: false }, pub: { items: [] }, note: '' };
  return DB.days[d];
}

/* ================= 配方 ================= */
function autoMode(rec) {
  if (rec.bodyBad || rec.sleep < 5 || rec.mood <= 2 || rec.hours < 2) return 'bad';
  if (rec.hours >= 4 && rec.mood >= 3) return 'good';
  return 'normal';
}
function quota(mode) {
  const early = phase().indexOf('A') === 0;
  const n = early ? 4 : 2;
  return mode === 'good' ? { red: n, yellow: 1 }
       : mode === 'normal' ? { red: Math.max(1, n - 1), yellow: 0 }
       : { red: 0, yellow: 0 };
}
function dueRaw() {
  const t = todayStr();
  return RAW.filter(q => { const s = st(q.id); return !isSkip(q.id) && s.next && s.next <= t; })
    .sort((a, b) => {
      const sa = st(a.id), sb = st(b.id);
      const pa = sa.pct === null ? 101 : sa.pct, pb = sb.pct === null ? 101 : sb.pct;
      if (pa !== pb) return pa - pb;
      const ta = (QBASE[a.id].tier || 1), tb = (QBASE[b.id].tier || 1);
      if (ta !== tb) return ta - tb;
      return sa.next.localeCompare(sb.next);
    });
}
function dueList() {
  const cap = DB.cfg.reviewCap || 6;
  const all = dueRaw();
  if (all.length <= cap) return all;
  all.slice(cap).forEach(q => { st(q.id).next = addDays(todayStr(), 1); });
  save();
  return all.slice(0, cap);
}
function drawNew(poolWant) {
  const r = day(), used = new Set(r.graded);
  const cands = RAW.filter(q => poolOf(q.id) === poolWant && !used.has(q.id)
    && !isSkip(q.id) && !(DB.cfg.onlyAns && NO_ANS.has(q.id))
    && (!DB.cfg.coreOnly || (q.tier || 1) === 1));
  if (!cands.length) return null;
  // 核心优先时只从核心抽；否则全池随机
  const pool2 = DB.cfg.coreOnly ? cands.filter(q => (q.tier || 1) === 1) : cands;
  const arr = pool2.length ? pool2 : cands;
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ================= 批改 ================= */
// 达标日：记录「哪几天达到过 70/85」。升池要两个不同日期都达标，同一天写两遍不算
function qdays(s) {
  if (!s.qdays || typeof s.qdays !== 'object') {
    s.qdays = { yellow: [], green: [] };
    (s.hist || []).forEach(h => {   // 老数据从历史回填，避免升级后白丢一天的达标
      if (!s.qdays.yellow.includes(h.d) && h.pct >= 70) s.qdays.yellow.push(h.d);
      if (!s.qdays.green.includes(h.d) && h.pct >= 85) s.qdays.green.push(h.d);
    });
  }
  if (!Array.isArray(s.qdays.yellow)) s.qdays.yellow = [];
  if (!Array.isArray(s.qdays.green)) s.qdays.green = [];
  return s.qdays;
}
function markDay(s, pct, d) {
  const q = qdays(s);
  if (pct >= 70 && !q.yellow.includes(d)) q.yellow.push(d);
  if (pct >= 85 && !q.green.includes(d)) q.green.push(d);
  return q;
}
// 能升到哪一池：绿要 2 个 ≥85 的日期，黄要 2 个 ≥70 的日期；不够就 null
function qualify(s) {
  const q = qdays(s);
  if (q.green.length >= 2) return 'green';
  if (q.yellow.length >= 2) return 'yellow';
  return null;
}
// 漏点分隔规则：只认分号（中英文）和换行；顿号、逗号属于点内文字，不拆
function splitMiss(s) {
  return String(s || '').split(/[;；\n\r]+/).map(x => x.trim()).filter(Boolean);
}

function grade(id, score, max, miss, wrong) {
  const s = st(id), t = todayStr();
  const pct = Math.max(0, Math.min(100, Math.round(score / max * 100)));
  const target = pct >= 85 ? 'green' : pct >= 70 ? 'yellow' : 'red';
  // 先把今天记进「达标日」；升池要看两个不同日期都达标
  const q = markDay(s, pct, t);
  let newPool = s.pool, verdict = '维', pending = false;

  const qual = qualify(s);
  if (qual && rank(qual) > rank(s.pool)) {
    newPool = qual;
    verdict = '升（达标 ' + (qual === 'green' ? q.green.length : q.yellow.length) + ' 次，已满 2 次）';
  } else if (rank(target) > rank(s.pool)) {
    const got = Math.min(target === 'green' ? q.green.length : q.yellow.length, 2);
    verdict = '维（达标 ' + got + '/2 次，再隔一日验 1 次才升）';
    pending = true;
  } else if (rank(target) < rank(s.pool)) {
    newPool = target; verdict = '降';
    s.qdays = { yellow: [], green: [] };   // 掉池后重新攒两次
  }

  s.attempts += 1; s.pct = pct; s.date = t; s.pool = newPool;
  if (pct >= 85) s.success += 1;
  const missArr = splitMiss(miss), wrongArr = splitMiss(wrong);
  s.missLog.push({ d: t, pct, miss: missArr, wrong: wrongArr });
  s.miss = missArr;
  s.wrong = wrongArr;
  s.hist.push({ d: t, pct, pool: newPool });

  const tier = (QBASE[id].tier || 1);
  let interval;
  if (pending) {
    interval = 1;
  } else if (tier === 1) {
    interval = (s.attempts <= 5) ? [1, 2, 4, 7, 15][Math.min(s.attempts - 1, 4)] : POOL[newPool].next;
    if (newPool === 'green' && s.success >= 2) interval = 15;
  } else if (tier === 2) {
    interval = POOL[newPool].next;
  } else {
    interval = null;
  }
  s.next = interval === null ? null : addDays(t, interval);

  DB.log.push({ d: t, id, pct, max, pool: newPool });
  if (!day().graded.includes(id)) day().graded.push(id);
  save();
  return { pct, newPool, verdict, next: s.next, interval };
}

/* ================= 顶部 ================= */
function overall() {
  const done = RAW.filter(q => st(q.id).pct !== null);
  if (!done.length) return { pct: 0, n: 0, score: 0 };
  const wsum = done.reduce((a, q) => a + (q.v || 25), 0);
  const psum = done.reduce((a, q) => a + st(q.id).pct * (q.v || 25), 0);
  const pct = psum / wsum;
  return { pct, n: done.length, score: Math.round(pct / 100 * 300) };
}
function phase() {
  const t = todayStr();
  if (t <= '2026-11-09') return 'A · 核心覆盖';
  if (t <= '2026-12-07') return 'B · 收尾整卷';
  return 'C · 冲刺';
}
const TIERS = { 1: '核心', 2: '补充', 3: '蓄水池' };
function milestone() {
  const ph = phase();
  const p1 = RAW.filter(q => (q.tier || 1) === 1);
  const p1done = p1.filter(q => st(q.id).pct !== null).length;
  if (ph.indexOf('A') === 0) return 'A 阶段目标：核心 ' + p1.length + ' 道先全过一遍（已测 ' + p1done + '）。红池是待测池，不是债。';
  if (ph.indexOf('B') === 0) return 'B 阶段目标：核心题推到黄以上，每 7–10 天一次 300 分限时整卷。';
  return 'C 阶段目标：不碰新章，回滚高频 + 答题层次，池平均 ≥75%。';
}
function renderTop() {
  const left = Math.max(0, daysBetween(todayStr(), DB.cfg.exam));
  document.getElementById('dLeft').textContent = left;
  document.getElementById('phaseTxt').textContent = phase();
  const o = overall();
  document.getElementById('hAvg').textContent = o.n ? o.score + '/300' : '--';
  document.getElementById('hRed').textContent = RAW.filter(q => poolOf(q.id) === 'red' && !isSkip(q.id)).length;
  document.getElementById('hDue').textContent = dueList().length;
}

/* ================= 今日 ================= */
let curQ = null, timerId = null, elapsed = 0;

function renderState() {
  const r = day();
  if (!r.mode) r.mode = autoMode(r);
  document.getElementById('sleep').value = r.sleep;
  document.getElementById('mood').value = r.mood;
  document.getElementById('hours').value = r.hours;
  document.getElementById('bodyBad').checked = !!r.bodyBad;
  document.getElementById('bodyGood').checked = !!r.bodyGood;
  document.getElementById('vSleep').textContent = r.sleep + ' h';
  document.getElementById('vMood').textContent = r.mood + ' / 5';
  document.getElementById('vHours').textContent = r.hours + ' h';
  document.querySelectorAll('.modebar button').forEach(b => b.classList.toggle('on', b.dataset.mode === r.mode));
  const q = quota(r.mode);
  const hint = {
    good: '好：到期全清 + 红池新题 ' + q.red + ' + 黄池 1。想再加点“抽绿池”，但别通宵。',
    normal: '一般：到期全清 + 红池新题 ' + q.red + '。',
    bad: '差：只做到期题 + 绿池 1 道保手感，不追新题。'
  }[r.mode];
  const el = document.getElementById('modeHint');
  el.textContent = hint;
  el.className = r.mode === 'bad' ? 'warn' : 'note';
}

function renderPlan() {
  const r = day(), due = dueList(), q = quota(r.mode);
  const el = document.getElementById('planCard');
  const redLeft = RAW.filter(x => poolOf(x.id) === 'red' && !r.graded.includes(x.id)).length;

  const core = RAW.filter(q => (q.tier || 1) === 1);
  const coreDone = core.filter(q => st(q.id).pct !== null).length;
  let html = '<h2>今日配方<small>' + (r.mode === 'good' ? '好' : r.mode === 'normal' ? '一般' : '差')
    + ' · 核心 ' + coreDone + '/' + core.length + '</small></h2>'
    + '<div class="note" style="margin-bottom:10px">' + milestone() + '</div>'
    + '<div class="muted" style="margin-bottom:8px">规则：模考日替代当日新题配额，模考后只复盘最关键的错题，当天不再叠加普通任务。</div>';

  const cap = DB.cfg.reviewCap || 6;
  const locked = dueRaw().length > cap;
  if (due.length) {
    html += locked
      ? '<div class="lock" style="margin-bottom:8px">到期 ' + due.length + ' 道，超过上限 ' + cap + '：<b>先清到 ' + cap + ' 道以内再抽新题</b>。</div>'
      : '<div class="warn" style="margin-bottom:8px">到期 ' + due.length + ' 道（上限 ' + cap + '）。建议先做，但不锁新题。</div>'
      + due.map(x => {
        const s = st(x.id);
        return '<div class="qrow"><i class="dot" style="background:' + POOL[s.pool].c + '"></i>'
          + '<div class="tt">' + esc(x.t) + '<div class="muted" style="font-size:10.5px">到期 ' + s.next + '</div></div>'
          + '<button class="go" data-practice="' + x.id + '">去练</button></div>';
      }).join('');
  } else {
    html += '<div class="note" style="margin-bottom:4px">队列空了，可以抽新题。</div>';
  }

  const canNew = !locked;
  html += '<div class="btnbar" style="margin-top:10px">'
    + '<button class="primary" style="flex:1;width:auto" id="drawRed" ' + (canNew && q.red > 0 && redLeft > 0 ? '' : 'disabled') + '>'
    + '抽红池新题（剩 ' + (canNew ? q.red : 0) + '）</button>'
    + '<button class="ghost" id="drawYellow" ' + (canNew && q.yellow > 0 ? '' : 'disabled') + '>抽黄池</button>'
    + '</div><div class="btnbar"><button class="ghost" id="drawGreen">绿池 1 道保手感</button></div>';

  el.innerHTML = html;

  el.querySelectorAll('[data-practice]').forEach(b => b.addEventListener('click', () => openQuestion(b.dataset.practice, 'review')));
  const dr = document.getElementById('drawRed');
  if (dr) dr.addEventListener('click', () => { const x = drawNew('red'); if (x) openQuestion(x.id, 'new'); else alert('红池没有可抽的新题了'); });
  const dy = document.getElementById('drawYellow');
  if (dy) dy.addEventListener('click', () => { const x = drawNew('yellow'); if (x) openQuestion(x.id, 'new'); else alert('黄池为空'); });
  const dg = document.getElementById('drawGreen');
  if (dg) dg.addEventListener('click', () => { const x = drawNew('green'); if (x) openQuestion(x.id, 'review'); else alert('绿池为空'); });
}

function openQuestion(id, kind) {
  curQ = { id, kind }; elapsed = 0;
  if (timerId) { clearInterval(timerId); timerId = null; }
  renderGrade();
  document.getElementById('gradeCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderGrade() {
  const el = document.getElementById('gradeCard');
  if (!curQ) {
    el.innerHTML = '<h2>出题</h2><div class="note">从上面点「去练」或「抽红池新题」，题干会出现在这里。</div>';
    return;
  }
  const q = QBASE[curQ.id], s = st(curQ.id);
  el.innerHTML = '<h2>' + (curQ.kind === 'review' ? '复习' : '新题') + '<small>' + POOL[s.pool].n + '池 · ' + q.g + '</small></h2>'
    + '<div class="qcard"><div class="qt">' + esc(q.t) + '</div>'
    + '<div class="meta"><span>上次：' + (s.pct === null ? '未测' : s.pct + '%') + '</span>'
    + '<span>已测 ' + s.attempts + ' 次</span><span>建议口径：' + q.v + ' 分整题</span>'
    + '<span>优先级：' + (TIERS[q.tier || 1] || '核心') + '</span>' + ansTag(q.id) + '</div></div>'
    + '<div style="display:flex;align-items:center;gap:12px;margin-top:12px">'
    + '<div class="timer" id="timer">00:00</div>'
    + '<button class="ghost" id="tStart">开始计时</button><button class="ghost" id="tStop">停</button></div>'
    + '<label class="f">闭卷写完整题（这里写提纲/采分点也行）</label>'
    + '<textarea id="ans" placeholder="按采分点分条写：① ② ③ ……"></textarea>'
    + '<label class="f">分值口径</label>'
    + '<select id="maxSel"><option value="25"' + (q.v === 25 ? ' selected' : '') + '>25 分（单点题）</option>'
    + '<option value="50"' + (q.v === 50 ? ' selected' : '') + '>50 分（综合题）</option></select>'
    + '<div class="two" style="margin-top:8px">'
    + '<div><label class="f">自评得分</label><input type="number" id="scoreIn" min="0" placeholder="如 18"></div>'
    + '<div style="margin-top:8px"><label class="f">没写的采分点（一行一条；顿号逗号不用分）</label>'
    + '<textarea id="missIn" rows="2" placeholder="关节腔的定义与作用没写&#10;关节内软骨的作用没展开"></textarea>'
    + '<div id="missPrev" class="note" style="margin-top:4px"></div></div>'
    + '<div style="margin-top:8px"><label class="f">写错的采分点（一行一条）</label>'
    + '<textarea id="wrongIn" rows="2" placeholder="关节面概念答成了关节软骨&#10;把提高动作速率当成速度训练"></textarea>'
    + '<div id="wrongPrev" class="note" style="margin-top:4px"></div></div></div>'
    + '<button class="primary" id="submitGrade" style="margin-top:12px">提交批改</button>'
    + '<div id="gradeOut" style="margin-top:10px"></div>'
    + '<div class="note" style="margin-top:8px">判分：按采分点逐点判。<70% 红、70–85% 黄、≥85% 绿；升池要隔日再验一次。</div>';

  document.getElementById('tStart').addEventListener('click', () => {
    if (timerId) clearInterval(timerId);
    const from = Date.now() - elapsed * 1000;
    timerId = setInterval(() => {
      elapsed = Math.floor((Date.now() - from) / 1000);
      const t = document.getElementById('timer');
      if (t) t.textContent = pad(Math.floor(elapsed / 60)) + ':' + pad(elapsed % 60);
    }, 500);
  });
  document.getElementById('tStop').addEventListener('click', () => { if (timerId) { clearInterval(timerId); timerId = null; } });

  // 实时预览：让你当场看到拆成了几条
  const bindPrev = (inId, prevId, label) => {
    const el = document.getElementById(prevId), input = document.getElementById(inId);
    const upd = () => {
      const arr = splitMiss(input.value);
      if (!arr.length) { el.innerHTML = ''; return; }
      const marks = '①②③④⑤⑥⑦⑧⑨⑩';
      el.innerHTML = '<span style="color:#1f3b73">识别到 ' + arr.length + ' 个' + label + '：</span>'
        + arr.map((x, i) => '<span style="color:#98302a">' + (marks[i] || '·') + ' ' + esc(x) + '</span>').join('　');
    };
    input.addEventListener('input', upd);
  };
  bindPrev('missIn', 'missPrev', '漏点');
  bindPrev('wrongIn', 'wrongPrev', '错点');

  document.getElementById('submitGrade').addEventListener('click', () => {
    const sc = parseFloat(document.getElementById('scoreIn').value);
    const mx = parseFloat(document.getElementById('maxSel').value);
    if (isNaN(sc) || sc < 0 || sc > mx) { alert('分数要在 0–' + mx + ' 之间'); return; }
    const miss = document.getElementById('missIn').value.trim();
    const wrong = document.getElementById('wrongIn').value.trim();
    const r = grade(curQ.id, sc, mx, miss, wrong);
    document.getElementById('gradeOut').innerHTML = '<div class="res">'
      + '<b>' + sc + ' / ' + mx + '（' + r.pct + '%）</b><br>'
      + '池判定：<b>' + r.verdict + '</b> → ' + POOL[r.newPool].n + '池<br>'
      + '下次复习：<b>' + r.next + '</b>（' + r.interval + ' 天后）</div>';
    if (timerId) { clearInterval(timerId); timerId = null; }
    renderTop(); renderPlan(); renderReport();
  });
}

/* 漏点块：漏（没写）与错（写错）分开列；只显示「最近一次」，历史另折叠 */
function missLines(arr, color) {
  return (arr && arr.length)
    ? arr.map(x => '<span style="color:' + color + '">· ' + esc(x) + '</span>').join('<br>')
    : '<span class="muted">无</span>';
}
function missBlock(s) {
  const log = s.missLog || [];
  if (!log.length) return '';
  const last = log[log.length - 1];
  const wrong = last.wrong || [];
  let h = '<div style="font-size:11.5px;margin-top:2px;line-height:1.7">'
    + '<span style="color:#888;font-size:10.5px">最近一次 ' + last.d + ' · ' + last.pct + '%</span>'
    + '<div style="margin-top:3px"><b style="color:#98302a;font-size:11px">没写</b><br>' + missLines(last.miss, '#98302a') + '</div>'
    + (wrong.length ? '<div style="margin-top:3px"><b style="color:#9a5b00;font-size:11px">写错</b><br>' + missLines(wrong, '#9a5b00') + '</div>' : '')
    + '</div>';
  if (log.length > 1) {
    h += '<details style="margin-top:3px"><summary style="cursor:pointer;font-size:10.5px;color:#888">历史 ' + (log.length - 1) + ' 次</summary>'
      + log.slice(0, -1).reverse().map(e => '<div style="font-size:11px;margin-top:5px;line-height:1.6">'
        + '<span style="color:#888">' + e.d + ' · ' + e.pct + '%</span>'
        + '<div><b style="color:#98302a">没写：</b>' + missLines(e.miss, '#98302a') + '</div>'
        + ((e.wrong && e.wrong.length) ? '<div><b style="color:#9a5b00">写错：</b>' + missLines(e.wrong, '#9a5b00') + '</div>' : '')
        + '</div>').join('')
      + '</details>';
  }
  return h;
}

function renderReport() {
  const r = day(), el = document.getElementById('reportCard');
  const list = r.graded.map(id => DB.log.filter(x => x.id === id && x.d === r.d).slice(-1)[0]).filter(Boolean);
  // 漏点清单（只在这里展示，答题页不显示）
  const withMiss = RAW.filter(q => (st(q.id).miss.length || (st(q.id).wrong || []).length));
  document.getElementById('missCount').textContent = withMiss.length ? '· ' + withMiss.length + ' 道' : '· 暂无';
  document.getElementById('missList').innerHTML = withMiss.length
    ? withMiss.map(q => {
        const s2 = st(q.id);
        return '<div style="margin-bottom:7px;font-size:12px"><b>' + esc(q.t) + '</b>'
          + '<span class="muted" style="font-size:10.5px"> · ' + (s2.pct === null ? '未测' : s2.pct + '%') + '</span>'
          + missBlock(s2)
          + '</div>';
      }).join('')
    : '<div class="note">批改时填过的漏点会汇总到这里。</div>';

  if (!list.length) { el.innerHTML = '<h2>今日战报</h2><div class="note">还没有批改记录。</div>'; return; }
  const avg = Math.round(list.reduce((a, b) => a + b.pct, 0) / list.length);
  el.innerHTML = '<h2>今日战报<small>' + list.length + ' 题 · 平均 ' + avg + '%</small></h2>'
    + list.map(x => '<div class="qrow"><i class="dot" style="background:' + POOL[x.pool].c + '"></i>'
      + '<div class="tt">' + esc(QBASE[x.id].t) + '<div class="muted" style="font-size:10.5px">' + x.pct + '%</div></div></div>').join('');
}

function renderBlocks() {
  const r = day();
  const items = [['a', '10:00–11:00', 'Block A · 新内容闭卷'],
                 ['b', '14:00–15:00', 'Block B · 新内容闭卷（下午黄金窗）'],
                 ['c', '15:15–16:15', 'Block C · 到期复习优先']];
  document.getElementById('blockCard').innerHTML = '<h2>时间块<small>只记录，不打分</small></h2>'
    + items.map(([k, t, n]) => '<div class="chk"><input type="checkbox" data-blk="' + k + '"' + (r.blocks[k] ? ' checked' : '') + '>'
      + '<span>' + t + ' · ' + n + '</span></div>').join('')
    + '<div class="note" style="margin-top:8px">8:00 起床 → 9–10 低强度(单词/补漏) → 11–12 订正补漏卡 → 12–14 午休 → 16:15–17 整理今日漏点。</div>';
  document.querySelectorAll('[data-blk]').forEach(c => c.addEventListener('change', () => {
    day().blocks[c.dataset.blk] = c.checked; save();
  }));
}

const PUB_ITEMS = [
  { k: 'word', n: '英语单词', m: 20, kind: '基础' },
  { k: 'listen', n: '政治/英语听课', m: 25, kind: '基础' },
  { k: 'en_read', n: '英语阅读 1 篇（限时）', m: 30, kind: '写题' },
  { k: 'po_mc', n: '政治选择 20 题', m: 20, kind: '写题' }
];
function renderPub() {
  const r = day(), cfg = DB.cfg.pub, el = document.getElementById('pubCard');
  if (!cfg.on) {
    el.innerHTML = '<h2>公共课<small>已关闭</small></h2><div class="note">要开始写题又怕顾此失彼，所以留了总闸但默认关着。打开在「设置 → 公共课」。</div>';
    return;
  }
  const items = r.pub.items || (r.pub.items = []);
  const used = items.reduce((a, k) => a + ((PUB_ITEMS.find(x => x.k === k) || { m: 0 }).m), 0);
  const writeUsed = items.filter(k => (PUB_ITEMS.find(x => x.k === k) || {}).kind === '写题').length;
  el.innerHTML = '<h2>公共课<small>' + used + ' / ' + cfg.cap + ' 分钟</small></h2>'
    + '<div class="bar"><i style="width:' + Math.min(100, used / cfg.cap * 100) + '%;background:' + (used > cfg.cap * 0.9 ? '#c08a12' : '#2f5bd7') + '"></i></div>'
    + PUB_ITEMS.map(it => {
      const on = items.includes(it.k);
      const over = used + it.m > cfg.cap;
      const blockWrite = it.kind === '写题' && writeUsed >= 1 && !on;
      return '<div class="chk"><input type="checkbox" data-pub="' + it.k + '"' + (on ? ' checked' : '') + ((over || blockWrite) && !on ? ' disabled' : '') + '>'
        + '<span>' + it.n + ' <span class="pill">' + it.m + ' 分钟</span>'
        + (blockWrite ? ' <span class="pill">写题每天限 1 项</span>' : '') + '</span></div>';
    }).join('')
    + '<div class="note" style="margin-top:6px">超时或第二项写题会被锁住，这就是不重演“顾此失彼”的硬闸。</div>';
  document.querySelectorAll('[data-pub]').forEach(c => c.addEventListener('change', () => {
    const arr = day().pub.items || (day().pub.items = []);
    const k = c.dataset.pub, i = arr.indexOf(k);
    if (c.checked && i < 0) arr.push(k); else if (!c.checked && i >= 0) arr.splice(i, 1);
    save(); renderPub();
  }));
}

/* ================= 题库 ================= */
let bankPool = 'all', bankFilter = 'all', bankQuery = '';

/* 缺答案的题：补51–66（补充池后 16 道）+ 池01–12（蓄水池全部） */
const NO_ANS = (function () {
  const t2 = RAW.filter(q => (q.tier || 1) === 2);
  const t3 = RAW.filter(q => (q.tier || 1) === 3);
  const set = new Set();
  t2.slice(50).forEach(q => set.add(q.id));
  t3.forEach(q => set.add(q.id));
  return set;
})();
function hasAns(id) { return !NO_ANS.has(id); }

/* 卷面版 48 题（核NN / 补NN） */
const JP_CORE = [2,3,5,8,9,12,13,14,19,22,26,32,33,35,36,37,38,39,40,41,42,44,45,46,47,54,58,59,61,62,63,64,65,68,69,70,71,72,74,75,76,86,87,88,89,90];
const JP_SUPP = [24,35];
const JP = (function () {
  const t1 = RAW.filter(q => (q.tier || 1) === 1);
  const t2 = RAW.filter(q => (q.tier || 1) === 2);
  const set = new Set();
  JP_CORE.forEach(n => { if (t1[n - 1]) set.add(t1[n - 1].id); });
  JP_SUPP.forEach(n => { if (t2[n - 1]) set.add(t2[n - 1].id); });
  return set;
})();
function hasJp(id) { return JP.has(id); }
function ansTag(id) {
  const a = hasAns(id) ? '<span class="tag ok">有答案</span>' : '<span class="tag no">缺答案</span>';
  return a + (hasJp(id) ? '<span class="tag ok">卷面版</span>' : '');
}

function matchQuery(q) {
  if (!bankQuery) return true;
  const k = bankQuery.toLowerCase();
  return (q.t + ' ' + q.g).toLowerCase().indexOf(k) >= 0;
}
function passFilter(q) {
  const s = st(q.id);
  const today = todayStr();
  if (bankFilter === 'untested') return s.pct === null;
  if (bankFilter === 'noans') return !hasAns(q.id);
  if (bankFilter === 'due') return !!(s.next && s.next <= today);
  if (bankFilter === 'stuck') return !!s.stuck;
  if (bankFilter === 'jp') return hasJp(q.id);
  return true;
}

function renderBank() {
  const counts = { red: 0, yellow: 0, green: 0 };
  RAW.forEach(q => counts[poolOf(q.id)]++);
  document.getElementById('cAll').textContent = RAW.length;
  document.getElementById('cRed').textContent = counts.red;
  document.getElementById('cYellow').textContent = counts.yellow;
  document.getElementById('cGreen').textContent = counts.green;

  const list = RAW.filter(q => (bankPool === 'all' || poolOf(q.id) === bankPool) && matchQuery(q) && passFilter(q));
  const el = document.getElementById('bankList');
  document.getElementById('bankCount').textContent =
    '当前范围 ' + (bankPool === 'all' ? RAW.length : counts[bankPool]) + ' 道 · 命中 ' + list.length + ' 道' +
    (bankQuery ? ' · 关键词“' + bankQuery + '”' : '');

  // 漏点清单（只在这里展示，答题页不显示）
  const withMiss = RAW.filter(q => (st(q.id).miss.length || (st(q.id).wrong || []).length));
  document.getElementById('missCount').textContent = withMiss.length ? '· ' + withMiss.length + ' 道' : '· 暂无';
  document.getElementById('missList').innerHTML = withMiss.length
    ? withMiss.map(q => {
        const s2 = st(q.id);
        return '<div style="margin-bottom:7px;font-size:12px"><b>' + esc(q.t) + '</b>'
          + '<span class="muted" style="font-size:10.5px"> · ' + (s2.pct === null ? '未测' : s2.pct + '%') + '</span>'
          + missBlock(s2)
          + '</div>';
      }).join('')
    : '<div class="note">批改时填过的漏点会汇总到这里。</div>';

  if (!list.length) {
    el.innerHTML = '<div class="note">没有匹配的题。换个关键词，或把筛选切回“全部”。</div>';
    return;
  }
  el.innerHTML = list.map(q => {
    const s = st(q.id);
    return '<div class="bcard"><div class="t">' + esc(q.t) + ansTag(q.id) + '</div>'
      + '<div class="m"><span>' + esc(q.g) + '</span><span>' + q.v + ' 分</span>'
      + '<span>' + (TIERS[q.tier || 1] || '核心') + '</span>'
      + '<span>上次 ' + (s.pct === null ? '未测' : s.pct + '%') + '</span>'
      + '<span>下次 ' + (s.next || '—') + '</span>'
      + (s.stuck ? '<span class="tag no">顽固</span>' : '')
      + (s.skip ? '<span class="tag no">已搁置</span>' : '')
      + (s.skim ? '<span class="tag">扫一眼</span>' : '')
      + ((s.miss.length || (s.wrong || []).length) ? '<div style="flex-basis:100%;font-size:11px;white-space:normal;line-height:1.7;word-break:break-word"><span style="color:#888;font-size:10.5px">上次（' + (s.date || '—') + ' · ' + (s.pct === null ? '未测' : s.pct + '%') + '）</span>'
        + (s.miss.length ? '<div><b style="color:#98302a">没写：</b>' + s.miss.map(x => '· ' + esc(x)).join('<br>') + '</div>' : '')
        + ((s.wrong || []).length ? '<div><b style="color:#9a5b00">写错：</b>' + s.wrong.map(x => '· ' + esc(x)).join('<br>') + '</div>' : '')
        + '</div>' : '')
      + '<button class="go" data-prac="' + q.id + '">练这道</button>'
      + '<button class="go" data-mark="' + q.id + '">标注</button>'
      + '<button class="go" data-skip="' + q.id + '">' + (s.skip ? '恢复' : '搁置') + '</button></div></div>';
  }).join('');

  el.querySelectorAll('[data-prac]').forEach(b => b.addEventListener('click', () => {
    openQuestion(b.dataset.prac, 'review');
    switchTab('today');
  }));
  el.querySelectorAll('[data-mark]').forEach(b => b.addEventListener('click', () => openMark(b.dataset.mark)));
  el.querySelectorAll('[data-skip]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.skip;
    st(id).skip = !st(id).skip;
    save(); renderBank(); renderTop();
  }));
}

function openMark(id) {
  const q = QBASE[id], s = st(id);
  const m = document.getElementById('modalBox');
  m.innerHTML = '<h2 style="font-size:14px;margin:0 0 4px">标注：' + esc(q.t) + '</h2>'
    + '<div class="muted" style="margin-bottom:10px">' + esc(q.g) + ' · ' + q.v + ' 分 · ' + (TIERS[q.tier || 1] || '核心') + ansTag(id) + '</div>'
    + '<label class="f">改池</label>'
    + '<div class="chips" id="markPool">'
    + ['red', 'yellow', 'green'].map(x => '<button data-p="' + x + '" class="' + (s.pool === x ? 'on' : '') + '">' + POOL[x].n + '池</button>').join('')
    + '</div>'
    + '<label class="f">手动记一次分（0–100，留空就不记）</label>'
    + '<input type="number" id="markPct" min="0" max="100" placeholder="' + (s.pct === null ? '未测' : s.pct) + '">'
    + '<label class="f">下次复习日期（留空按池自动算）</label>'
    + '<input type="date" id="markNext">'
    + '<label class="f">标记</label>'
    + '<div class="chips" id="markFlags">'
    + '<button data-k="stuck" class="' + (s.stuck ? 'on' : '') + '">顽固</button>'
    + '<button data-k="mastered" class="' + (s.mastered ? 'on' : '') + '">已掌握</button>'
    + '</div>'
    + '<label class="f">备注</label><input type="text" id="markNote" value="' + esc(s.note || '') + '" placeholder="例：单收缩那块总漏">'
    + '<label class="f">没写的采分点（一行一条）</label>'
    + '<textarea id="markMiss" rows="3">' + esc(s.miss.join('\n')) + '</textarea>'
    + '<label class="f">写错的采分点（一行一条）</label>'
    + '<textarea id="markWrong" rows="3">' + esc((s.wrong || []).join('\n')) + '</textarea>'
    + '<div class="note" style="margin-top:4px">改完保存，卡片和漏点清单会跟着变。</div>'
    + '<div class="btnbar" style="margin-top:14px"><button class="primary" style="flex:1;width:auto" id="markSave">保存</button>'
    + '<button class="ghost" id="markCancel">取消</button></div>';

  let pickPool = s.pool, flags = { stuck: !!s.stuck, mastered: !!s.mastered };
  document.querySelectorAll('#markPool button').forEach(b => b.addEventListener('click', () => {
    pickPool = b.dataset.p;
    document.querySelectorAll('#markPool button').forEach(x => x.classList.toggle('on', x === b));
  }));
  document.querySelectorAll('#markFlags button').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.k;
    flags[k] = !flags[k];
    b.classList.toggle('on', flags[k]);
  }));
  document.getElementById('markCancel').addEventListener('click', closeMark);
  document.getElementById('markSave').addEventListener('click', () => {
    s.pool = pickPool;
    s.stuck = flags.stuck;
    s.mastered = flags.mastered;
    s.note = document.getElementById('markNote').value.trim();
    s.miss = splitMiss(document.getElementById('markMiss').value);
    s.wrong = splitMiss(document.getElementById('markWrong').value);
    if (s.missLog && s.missLog.length) {
      s.missLog[s.missLog.length - 1].miss = s.miss.slice();
      s.missLog[s.missLog.length - 1].wrong = s.wrong.slice();
    }
    const pv = document.getElementById('markPct').value;
    if (pv !== '') { s.pct = Math.max(0, Math.min(100, +pv)); s.date = todayStr(); }
    const nd = document.getElementById('markNext').value;
    s.next = nd ? nd : addDays(todayStr(), POOL[pickPool].next);
    save(); closeMark(); renderTop(); renderBank();
  });
  document.getElementById('modal').classList.remove('hidden');
}
function closeMark() { document.getElementById('modal').classList.add('hidden'); }

/* ================= 统计 ================= */
function renderStats() {
  const o = overall();
  const s300 = DB.cfg.split.ana + DB.cfg.split.phy;
  const score = o.n ? Math.round(o.pct / 100 * s300) : 0;
  document.getElementById('sAvg').textContent = o.n ? score : '--';
  const diff = v => o.n ? ((score - v > 0 ? '+' : '') + (score - v)) : '--';
  document.getElementById('sDiff220').textContent = diff(DB.cfg.line);
  document.getElementById('sDiff225').textContent = diff(DB.cfg.target);
  document.getElementById('sDiff240').textContent = diff(DB.cfg.ideal);

  document.getElementById('tierStats').innerHTML = [1, 2, 3].map(t => {
    const arr = RAW.filter(q => (q.tier || 1) === t);
    const done = arr.filter(q => st(q.id).pct !== null);
    const ok = arr.filter(q => st(q.id).pct !== null && st(q.id).pct >= 70).length;
    return '<div class="qrow"><div class="tt" style="font-size:12px">' + TIERS[t] + ' · ' + arr.length + ' 道'
      + '<div class="muted" style="font-size:10.5px">已测 ' + done.length + ' · 过线(≥70%) ' + ok + '</div></div></div>';
  }).join('');

  document.getElementById('poolStats').innerHTML = ['red', 'yellow', 'green'].map(p => {
    const arr = RAW.filter(q => poolOf(q.id) === p);
    const done = arr.filter(q => st(q.id).pct !== null);
    const avg = done.length ? Math.round(done.reduce((a, q) => a + st(q.id).pct, 0) / done.length) : 0;
    return '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12.5px">'
      + '<span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + POOL[p].c + ';margin-right:6px"></i>'
      + POOL[p].n + '池 · ' + arr.length + ' 道</span><span>' + (done.length ? '平均 ' + avg + '%' : '未测') + '</span></div>'
      + '<div class="bar"><i style="width:' + avg + '%;background:' + POOL[p].c + '"></i></div></div>';
  }).join('');

  const coreAll = RAW.filter(q => (q.tier || 1) === 1);
  const coreDoneN = coreAll.filter(q => st(q.id).pct !== null).length;
  document.getElementById('effStats').innerHTML =
    '<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:12.5px">'
    + '<span>核心 90 道（必守主线）</span><span>' + coreDoneN + ' / ' + coreAll.length + '</span></div>'
    + '<div class="bar"><i style="width:' + Math.round(coreDoneN / coreAll.length * 100) + '%;background:#2f5bd7"></i></div></div>';

  const eff = RAW.filter(q => !isSkip(q.id) && hasAns(q.id));
  const effDone = eff.filter(q => st(q.id).pct !== null).length;
  document.getElementById('effStats').innerHTML =
    '<div class="qrow"><div class="tt" style="font-size:12.5px">可测题（有答案且未搁置）'
    + '<div class="muted" style="font-size:10.5px">共 ' + eff.length + ' 道 · 已测 ' + effDone + ' 道 · 未测 ' + (eff.length - effDone) + ' 道</div></div>'
    + '<span class="pill">' + Math.round(effDone / eff.length * 100) + '%</span></div>';

  const skim = RAW.filter(q => isSkim(q.id) && !isSkip(q.id));
  document.getElementById('skimList').innerHTML = skim.length
    ? '<div class="note" style="margin-bottom:8px">共 ' + skim.length + ' 道，不闭卷、不计分。注意：这 10 道目前<b>没有答案</b>，只能对着教材章节看骨架——不是“确认不考”，是主动降低投入。</div>'
      + skim.map(q => '<div class="qrow"><i class="dot" style="background:#8a93a6"></i>'
        + '<div class="tt" style="font-size:12px">' + esc(q.t) + '</div></div>').join('')
    : '<div class="note">没有。</div>';

  const recent = DB.log.slice(-12).reverse();
  document.getElementById('recentList').innerHTML = recent.length
    ? recent.map(x => '<div class="qrow"><i class="dot" style="background:' + POOL[x.pool].c + '"></i>'
      + '<div class="tt" style="font-size:12px">' + esc(QBASE[x.id].t)
      + '<div class="muted" style="font-size:10.5px">' + x.d + ' · ' + x.pct + '%</div></div></div>').join('')
    : '<div class="note">还没有记录。</div>';

  const freq = {};
  RAW.forEach(q => (st(q.id).missLog || []).forEach(e => {
    (e.miss || []).forEach(m => { freq[m] = (freq[m] || 0) + 1; });
    (e.wrong || []).forEach(m => { freq[m] = (freq[m] || 0) + 1; });
  }));
  const stuck = Object.entries(freq).filter(x => x[1] >= 3).sort((a, b) => b[1] - a[1]);
  document.getElementById('stuckList').innerHTML = stuck.length
    ? stuck.map(x => '<div class="qrow"><div class="tt">' + esc(x[0]) + '</div><span class="pill">' + x[1] + ' 次</span></div>').join('')
    : '<div class="note">同一漏点出现 3 次以上会自动列在这里。</div>';
}

/* ================= 设置 ================= */
function fillCfg() {
  const c = DB.cfg;
  document.getElementById('cExam').value = c.exam;
  document.getElementById('cLine').value = c.line;
  document.getElementById('cTarget').value = c.target;
  document.getElementById('cIdeal').value = c.ideal;
  document.getElementById('cAna').value = c.split.ana;
  document.getElementById('cPhy').value = c.split.phy;
  document.getElementById('cMj').value = c.one.mj;
  document.getElementById('cEn').value = c.one.en;
  document.getElementById('cPo').value = c.one.po;
  document.getElementById('cCoreOnly').checked = c.coreOnly !== false;
  document.getElementById('cOnlyAns').checked = c.onlyAns !== false;
  document.getElementById('cPubOn').checked = !!c.pub.on;
  document.getElementById('cPubCap').value = c.pub.cap;
}
function saveCfg() {
  const c = DB.cfg;
  c.exam = document.getElementById('cExam').value || c.exam;
  c.line = +document.getElementById('cLine').value || c.line;
  c.target = +document.getElementById('cTarget').value || c.target;
  c.ideal = +document.getElementById('cIdeal').value || c.ideal;
  c.split.ana = +document.getElementById('cAna').value || c.split.ana;
  c.split.phy = +document.getElementById('cPhy').value || c.split.phy;
  c.one.mj = +document.getElementById('cMj').value || c.one.mj;
  c.one.en = +document.getElementById('cEn').value || c.one.en;
  c.one.po = +document.getElementById('cPo').value || c.one.po;
  c.coreOnly = document.getElementById('cCoreOnly').checked;
  c.onlyAns = document.getElementById('cOnlyAns').checked;
  save(); renderTop(); document.getElementById('cfgMsg').textContent = '已保存。';
}
function savePub() {
  DB.cfg.pub.on = document.getElementById('cPubOn').checked;
  DB.cfg.pub.cap = +document.getElementById('cPubCap').value || 45;
  save(); renderPub(); document.getElementById('cfgMsg').textContent = '公共课设置已保存。';
}

/* ================= 导出 ================= */
function exportJson() {
  const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'kaoyan631-v2-' + todayStr() + '.json';
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function reportMd() {
  const r = day(), o = overall();
  const lines = ['# 631 战报 ' + r.d, '',
    '池平均：' + (o.n ? o.score + '/300（' + Math.round(o.pct) + '%）' : '未测'),
    '红池剩余：' + RAW.filter(q => poolOf(q.id) === 'red').length, '', '## 今日批改'];
  const l = r.graded.map(id => DB.log.filter(x => x.id === id && x.d === r.d).slice(-1)[0]).filter(Boolean);
  if (!l.length) lines.push('（无）');
  l.forEach(x => lines.push('- [' + POOL[x.pool].n + '] ' + QBASE[x.id].t + ' — ' + x.pct + '%'));
  lines.push('', '## 到期队列');
  const due = dueList();
  if (!due.length) lines.push('（空）');
  due.forEach(q => lines.push('- ' + q.t + '（到期 ' + st(q.id).next + '）'));
  lines.push('', '## 需要批改的作答', '<!-- 贴在这里，按采分点判，只补漏的，不重写全文 -->');
  return lines.join('\n');
}
function copyMd() {
  const ta = document.createElement('textarea');
  ta.value = reportMd(); document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta); alert('战报已复制');
}
function exportMd() {
  const blob = new Blob([reportMd()], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'kaoyan631-report-' + todayStr() + '.md';
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function importJson(file) {
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const p = JSON.parse(fr.result);
      if (!p || !p.cfg) throw new Error('格式不对');
      DB = Object.assign(fresh(), p); save(); boot2(); alert('导入成功');
    } catch (e) { alert('导入失败：' + e.message); }
  };
  fr.readAsText(file);
}

/* ================= 切换 ================= */
function switchTab(n) {
  document.querySelectorAll('nav.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === n));
  ['today', 'bank', 'stats', 'cfg'].forEach(t => document.getElementById('tab-' + t).classList.toggle('hidden', t !== n));
  if (n === 'bank') renderBank();
  if (n === 'stats') renderStats();
  if (n === 'cfg') fillCfg();
}

/* ================= 启动 ================= */
function applySeed() {
  let n = 0;
  SEED.forEach(r => {
    const s = st(r.id);
    if (s.hist.some(h => h.d === r.d)) return;
    s.attempts += 1;
    s.pct = r.pct; s.date = r.d; s.pool = r.pool;
    s.hist.push({ d: r.d, pct: r.pct, pool: r.pool });
    const seedMiss = splitMiss(r.miss);
    s.miss = seedMiss;
    s.missLog.push({ d: r.d, pct: r.pct, miss: seedMiss });
    if (r.note) s.note = r.note;
    s.next = addDays(r.d, POOL[r.pool].next);
    s.seeded = true;
    DB.log.push({ d: r.d, id: r.id, pct: r.pct, max: 20, pool: r.pool });
    n++;
  });
  if (n) save();
  return n;
}

/* ================= 池子补齐（v3.2 一次性） =================
   旧规则要求「上一次成绩」也达标才算第二次，导致 84% → 100% 这种永远升不上去。
   新版按「达标日」算：老数据从历史回填后，够 2 天的直接把池子补正。
*/
function applyQualifyFix() {
  if ((DB.qfix || 0) >= 1) return 0;
  let n = 0;
  RAW.forEach(q => {
    const s = DB.qs[q.id];
    if (!s || !s.hist || !s.hist.length) return;
    qdays(s);
    const qual = qualify(s);
    if (qual && rank(qual) > rank(s.pool)) {
      s.pool = qual;
      const days = (qual === 'green' ? s.qdays.green : s.qdays.yellow).slice(-2).join('、');
      s.note = (s.note ? s.note + '；' : '') + '升池补齐（' + days + '两次达标）';
      n++;
    }
  });
  DB.qfix = 1;
  if (n) save();
  return n;
}

function boot2() {
  applySeed();
  applyMissFix();
  applyQualifyFix();
  const f = document.getElementById('foot');
  if (f) f.textContent = '本地离线 · ' + APP_VER + ' · 构建 ' + APP_DATE + ' · 数据只在你自己的浏览器里';
  renderBank(); renderTop(); renderState(); renderPlan(); renderGrade(); renderReport(); renderBlocks(); renderPub(); fillCfg();
}
function boot() {
  const r = day();
  const sync = () => {
    r.sleep = +document.getElementById('sleep').value;
    r.mood = +document.getElementById('mood').value;
    r.hours = +document.getElementById('hours').value;
    r.bodyBad = document.getElementById('bodyBad').checked;
    r.bodyGood = document.getElementById('bodyGood').checked;
    r.mode = autoMode(r);
    save(); renderState(); renderPlan();
  };
  ['sleep', 'mood', 'hours', 'bodyBad', 'bodyGood'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', sync);
    el.addEventListener('change', sync);
  });
  document.querySelectorAll('.modebar button').forEach(b => b.addEventListener('click', () => {
    day().mode = b.dataset.mode; save(); renderState(); renderPlan();
  }));
  document.querySelectorAll('nav.tabs button').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  document.querySelectorAll('#bankTabs button').forEach(b => b.addEventListener('click', () => {
    bankPool = b.dataset.pool;
    document.querySelectorAll('#bankTabs button').forEach(x => x.classList.toggle('on', x === b));
    renderBank();
  }));
  document.getElementById('bankSearch').addEventListener('input', e => { bankQuery = e.target.value.trim(); renderBank(); });
  document.getElementById('clearSearch').addEventListener('click', () => {
    document.getElementById('bankSearch').value = ''; bankQuery = ''; renderBank();
  });
  document.querySelectorAll('#bankChips button').forEach(b => b.addEventListener('click', () => {
    bankFilter = b.dataset.f;
    document.querySelectorAll('#bankChips button').forEach(x => x.classList.toggle('on', x === b));
    renderBank();
  }));
  document.getElementById('saveCfg').addEventListener('click', saveCfg);
  document.getElementById('savePub').addEventListener('click', savePub);
  document.getElementById('expJson').addEventListener('click', exportJson);
  document.getElementById('expMd').addEventListener('click', exportMd);
  document.getElementById('copyMd').addEventListener('click', copyMd);
  document.getElementById('impBtn').addEventListener('click', () => document.getElementById('impFile').click());
  document.getElementById('impFile').addEventListener('change', e => { if (e.target.files[0]) importJson(e.target.files[0]); });

  boot2();
}
boot();
