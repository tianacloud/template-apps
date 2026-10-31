import {createTianaFetch} from '@tianacloud/serverless';
import './style.css';
export async function mount(root, {files}) {
let questionBank;
try { const response = await files.get('template-assets/question-bank.json'); if (!response.ok) throw new Error('题库读取失败'); questionBank = await response.json(); } catch (error) { root.textContent = '无法读取题库，请检查网络并刷新页面。'; return; }
const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href=new URL('./architect-study-workbench.css',import.meta.url).href;document.head.append(stylesheet);
root.innerHTML = '<div id="app"></div>';
document.getElementById('app').innerHTML = "\n<header>\n  <div class=\"wrap\">\n    <div class=\"hd-top\">\n      <div class=\"hd-brand\">\n        <svg fill=\"none\" height=\"20\" viewBox=\"0 0 24 24\" width=\"20\"><path d=\"M4 5a2 2 0 012-2h7l3 3h4a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z\" fill=\"rgba(255,255,255,.9)\"/><path d=\"M8 12h8M8 16h5\" stroke=\"#3b5bdb\" stroke-linecap=\"round\" stroke-width=\"2\"/></svg>\n        备考工作台\n      </div>\n      <div class=\"hd-sync\" id=\"syncStatus\"><span class=\"dot\" id=\"syncDot\"></span><span id=\"syncTxt\">已同步</span></div>\n    </div>\n    <h1>系统架构设计师备考台</h1>\n    <div class=\"hd-sub\">软考高级 · 三科均 45 分合格 · 一年两考（5月 / 11月）</div>\n    <div class=\"hd-cd\" id=\"countdown\">距离下一次考试：-- 天</div>\n  </div>\n  <div class=\"wrap\">\n    <nav id=\"nav\">\n      <button class=\"active\" data-view=\"today\">今日</button>\n      <button data-view=\"kemu\">科目考点</button>\n      <button data-view=\"err\">易错点</button>\n      <button data-view=\"quiz\">题库刷题</button>\n      <button data-view=\"plan\">规划打卡</button>\n      <button data-view=\"book\">资料</button>\n    </nav>\n  </div>\n</header>\n\n<main class=\"wrap\">\n\n  <!-- 今日要处理 -->\n  <section class=\"panel\" id=\"view-today\">\n    <div class=\"panel-title\"><span class=\"bar\"></span>今天要处理</div>\n    <div id=\"todayList\"></div>\n    <div class=\"sub\" id=\"todayEmpty\" style=\"display:none\">今天没有待办，可以开始刷题或打卡啦。</div>\n  </section>\n\n  <!-- 科目考点 -->\n  <section class=\"panel\" id=\"view-kemu\" style=\"display:none\">\n    <div class=\"panel-title\"><span class=\"bar\"></span>科目与易考点</div>\n    <div class=\"sub\">系统架构设计师考三科，以下是各科章节与高频易考点（依据 2022 版新大纲）。</div>\n    <div class=\"kemu-tabs\" id=\"kemuTabs\"></div>\n    <div id=\"kemuContent\"></div>\n  </section>\n\n  <!-- 易错点 -->\n  <section class=\"panel\" id=\"view-err\" style=\"display:none\">\n    <div class=\"panel-title\"><span class=\"bar\"></span>易错点说明</div>\n    <div class=\"sub\">高频易错点，勾选后标记「已掌握」并同步到云端。</div>\n    <div id=\"errList\"></div>\n  </section>\n\n  <!-- 题库 -->\n  <section class=\"panel\" id=\"view-quiz\" style=\"display:none\">\n    <div class=\"panel-title\"><span class=\"bar\"></span>题库刷题 <span class=\"tag\" id=\"quizCat\">计算机系统基础</span></div>\n    <div class=\"sub\">666 题 · 26 章节（自主命题原创题库，可逐题修改答案，修改结果同步云端）。</div>\n    <div class=\"form-row\">\n      <select id=\"quizChapSel\" onchange=\"onChapChange()\" style=\"flex:1; min-width:180px\"></select>\n      <select id=\"quizQSel\" onchange=\"onQChange()\" style=\"flex:1; min-width:140px\"></select>\n      <button class=\"btn ghost\" onclick=\"randomQuiz()\">随机一题</button>\n    </div>\n    <div class=\"quiz-stats\" id=\"quizStats\"></div>\n    <div class=\"quiz-box\" id=\"quizBox\" style=\"margin-top:14px\"></div>\n  </section>\n\n  <!-- 修改答案弹窗 -->\n  <div class=\"edit-mask\" id=\"editMask\" style=\"display:none\">\n    <div class=\"edit-dialog\">\n      <div class=\"edit-head\">\n        <span id=\"editTitle\">修改题目</span>\n        <button class=\"edit-close\" onclick=\"closeEditQuestion()\">×</button>\n      </div>\n      <div class=\"edit-body\">\n        <label class=\"edit-lb\">题干</label>\n        <textarea id=\"editQ\" rows=\"3\"></textarea>\n        <label class=\"edit-lb\">选项 A</label>\n        <input id=\"editO0\" type=\"text\">\n        <label class=\"edit-lb\">选项 B</label>\n        <input id=\"editO1\" type=\"text\">\n        <label class=\"edit-lb\">选项 C</label>\n        <input id=\"editO2\" type=\"text\">\n        <label class=\"edit-lb\">选项 D</label>\n        <input id=\"editO3\" type=\"text\">\n        <label class=\"edit-lb\">正确答案（0=A，1=B，2=C，3=D）</label>\n        <input id=\"editAns\" max=\"3\" min=\"0\" type=\"number\">\n        <label class=\"edit-lb\">解析</label>\n        <textarea id=\"editExp\" rows=\"3\"></textarea>\n      </div>\n      <div class=\"edit-foot\">\n        <button class=\"btn ghost\" onclick=\"resetEditQuestion()\">恢复默认</button>\n        <span style=\"flex:1\"></span>\n        <button class=\"btn ghost\" onclick=\"closeEditQuestion()\">取消</button>\n        <button class=\"btn\" onclick=\"saveEditQuestion()\">保存</button>\n      </div>\n    </div>\n  </div>\n\n  <!-- 规划打卡 -->\n  <section class=\"panel\" id=\"view-plan\" style=\"display:none\">\n    <div class=\"panel-title\"><span class=\"bar\"></span>备考规划与答题安排</div>\n    <div class=\"sub\">三段式规划 + 答题时间分配 + 每日打卡。规划任务与打卡记录同步云端。</div>\n    <div class=\"ring-wrap\" id=\"planProgress\" style=\"margin-bottom:16px\"></div>\n\n    <div class=\"panel-title\" style=\"font-size:14px\"><span class=\"bar\"></span>今日打卡</div>\n    <div class=\"form-row\">\n      <select id=\"checkinSubject\" style=\"flex:1\">\n        <option value=\"综合知识\">综合知识</option>\n        <option value=\"案例分析\">案例分析</option>\n        <option value=\"论文\">论文</option>\n      </select>\n      <button class=\"btn\" onclick=\"doCheckin()\">今日打卡</button>\n    </div>\n    <div class=\"check-grid\" id=\"checkGrid\"></div>\n\n    <div class=\"panel-title\" style=\"font-size:14px; margin-top:20px\"><span class=\"bar\"></span>规划任务清单</div>\n    <table class=\"plan-table\" id=\"planTable\"></table>\n\n    <div class=\"panel-title\" style=\"font-size:14px; margin-top:20px\"><span class=\"bar\"></span>答题时间安排（参考）</div>\n    <div id=\"examPlan\"></div>\n  </section>\n\n  <!-- 开源资料 -->\n  <section class=\"panel\" id=\"view-book\" style=\"display:none\">\n    <div class=\"panel-title\"><span class=\"bar\"></span>开源备考资料导航</div>\n    <div class=\"sub\">免费开源/公开备考资源索引（仅提供链接，不搬运内容），含许可证说明。</div>\n    <div id=\"bookList\"></div>\n  </section>\n\n</main>\n\n<!-- 底部tab -->\n<div class=\"mtab\" id=\"mtab\">\n  <button class=\"active\" data-view=\"today\"><svg fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><rect height=\"18\" rx=\"2\" width=\"18\" x=\"3\" y=\"4\"/><path d=\"M3 10h18M8 2v4M16 2v4\"/></svg>今日</button>\n  <button data-view=\"kemu\"><svg fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><path d=\"M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14\"/><path d=\"M4 19h16M8 8h8M8 12h8\"/></svg>考点</button>\n  <button data-view=\"quiz\"><svg fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9 10a3 3 0 016 0c0 2-3 2-3 4\"/><path d=\"M12 17h.01\"/></svg>刷题</button>\n  <button data-view=\"err\"><svg fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><path d=\"M12 3l9 16H3l9-16z\"/><path d=\"M12 10v4M12 17h.01\"/></svg>易错</button>\n  <button data-view=\"plan\"><svg fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><path d=\"M12 20a8 8 0 100-16 8 8 0 000 16z\"/><path d=\"M12 8v4l3 2\"/></svg>规划</button>\n  <button data-view=\"book\"><svg fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><path d=\"M4 5a2 2 0 012-2h12v18H6a2 2 0 01-2-2V5z\"/><path d=\"M18 8h2v13h-2\"/></svg>资料</button>\n</div>\n\n<div class=\"mask\" id=\"mask\">\n  <div class=\"modal\" id=\"modal\"></div>\n</div>\n<div id=\"toast\"></div>\n\n";
let cache = {}, execute, queue=Promise.resolve();
// Route the page's declared actions through registered handlers under a strict CSP.
for (const type of ['click','change']) document.addEventListener(type, event => {
  const element=event.target.closest(type==='click'?'[onclick]':'[onchange]');
  if(!element) return;
  const action=element.getAttribute(type==='click'?'onclick':'onchange');
  const match=/^(\w+)\((.*?)\)$/.exec(action || '');
  if(!match || typeof window[match[1]]!=='function') return;
  event.stopPropagation();
  const arg=match[2].trim();
  if(!arg) window[match[1]]();
  else if(arg==='this') window[match[1]](element);
  else if(/^\d+$/.test(arg)) window[match[1]](Number(arg));
  else if(/^'[^']*'$/.test(arg)) window[match[1]](arg.slice(1,-1));
}, true);

async function connect(){const c=await window.tiana.connection();if(c.sql_api!=='hrana-v3')throw Error('不支持的数据库协议'); const f=createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});return async(sql,args=[])=>{const r=await f(`${c.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})}); if(!r.ok)throw Error('数据库请求失败');const b=await r.json();const x=b.results?.[0];if(x?.type!=='ok'||x.response?.type!=='execute')throw Error('数据库操作失败');return x.response.result;};}
function save(k,v){syncIndicator('sync','正在同步');queue=queue.then(()=>execute('INSERT INTO study_state(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[{type:'text',value:k},{type:'text',value:JSON.stringify(v)}])).then(()=>syncIndicator('','已同步')).catch(()=>syncIndicator('off','同步失败，请刷新检查'));}
async function start(){try{execute=await connect();const r=await execute('SELECT key,value FROM study_state');for(const row of r.rows){cache[row[0].value]=JSON.parse(row[1].value)} init();}catch(e){document.getElementById('app').innerHTML='<div style="padding:2em">无法连接学习数据，请检查网络并刷新页面。</div>';}}


/* ============ 数据层 ============ */
const LS_PREFIX = 'wb_arch_';
let state = {
  dbOnline: false,
  checkins: {},      // { 'YYYY-MM-DD': {subjects:[...]} }
  plans: [],         // 规划任务
  mastered: {},      // 易错点掌握 { id: true }
  quizDone: {},      // 已做题 { qid: bool }
  quizTotal: { correct:0, wrong:0 },
  bankOverride: {}   // 修改过的题 { '章_题': {q,opts,ans,exp} }
};
let pendingSync = [];  // 离线待同步操作

/* ============ 静态知识数据 ============ */
const KEMU = {
  '综合知识': [
    { name:'软件工程', meta:'约 12%-28%', kps:['软件生命周期与开发模型（瀑布/敏捷/螺旋）','需求工程与需求分析','面向对象基础与 UML（用例图/类图/时序图）','UML 4+1 视图','设计模式（工厂/单例/观察者等）','软件测试（黑盒/白盒）','软件过程改进与 CMMI','遗留系统演化'] },
    { name:'软件架构设计', meta:'约 25%-37%（核心）', kps:['架构 4+1 视图','架构风格（管道过滤器/仓库/分层/事件驱动）','MVC 与三层架构','基于构件的开发（CBD）','架构需求与 ABSD','架构描述语言 ADL','架构评估方法（ATAM/SAAM）','质量属性与敏感点/权衡点','中间件与 CORBA'] },
    { name:'计算机系统基础', meta:'综合', kps:['计算机组成与存储体系','操作系统（进程/存储管理/PV操作）','数据库系统与规范化（1NF/2NF/3NF）','嵌入式系统','计算机网络（OSI/TCP-IP）','系统性能与可靠性'] },
    { name:'信息安全', meta:'约 4%-9%', kps:['对称/非对称加密算法','信息摘要与数字签名','数字证书与 PKI','访问控制','常见网络攻击与防护'] },
    { name:'法规标准 + 专业英语', meta:'约 6%-8%', kps:['著作权法/专利法','标准化知识','专业英语 5 题（架构/DFD 等术语）'] }
  ],
  '案例分析': [
    { name:'软件架构评估', meta:'高频', kps:['质量属性场景（6 个质量属性）','架构风险/敏感点/权衡点','ATAM 评估流程','架构风格对比（管道过滤器 vs 仓库）'] },
    { name:'系统设计', meta:'高频', kps:['非功能性需求分类','C/S 与 B/S、瘦客户端','MVC 组成与 EJB','响应式 Web 设计','主从复制/读写分离'] },
    { name:'软件系统建模', meta:'高频', kps:['结构化分析（DFD/ERD）','面向对象分析（用例/类图）','数据流图补全外部实体/加工/数据流'] },
    { name:'数据库与缓存设计', meta:'高频', kps:['ORM 优缺点与数据访问层','工厂设计模式','Memcached 与 Redis','缓存穿透/雪崩/击穿','Redis 集群切片','分布式数据库一致性'] },
    { name:'嵌入式与分布式', meta:'中频', kps:['ROS 机器人操作系统','实时任务（简单/复杂任务）','“腰”型通信模式','CPS 信息物理系统','SOA 与 ESB','微服务与分布式架构'] }
  ],
  '论文': [
    { name:'传统架构实践', meta:'高频选题', kps:['MVC 架构设计实践','SOA 面向服务架构','高并发系统设计','系统可靠性设计'] },
    { name:'新技术应用', meta:'2026 新增重点', kps:['云原生架构设计实践','大数据架构（Lambda/Kappa）','DevOps 与微服务','AI 大模型工程化架构'] },
    { name:'软件工程与安全', meta:'常规选题', kps:['单元测试与模型驱动架构','加密技术与容灾备份','架构演化的技术债治理'] },
    { name:'写作要求', meta:'答题规范', kps:['120 分钟 2500 字左右','含项目背景/设计思路/技术选型依据/实践效果','需量化数据，忌纯理论空谈'] }
  ]
};

const ERRORS = [
  { id:'e1', subject:'综合知识', q:'架构风格混淆', a:'管道-过滤器风格 vs 仓库风格（黑板）', tip:'关键区别：管道过滤器是数据流驱动、构件间独立无共享；仓库风格是中心数据共享、构件通过中心数据交互。' },
  { id:'e2', subject:'综合知识', q:'质量属性识别错误', a:'把「性能」「可用性」「安全性」等质量属性与功能需求混淆', tip:'质量属性是非功能性需求，用质量属性场景（刺激源/刺激/环境/制品/响应/度量）描述。' },
  { id:'e3', subject:'综合知识', q:'数据库范式判断', a:'1NF/2NF/3NF/BCNF 边界不清', tip:'1NF 消重复列；2NF 消部分依赖；3NF 消传递依赖。记住「逐级消除依赖」。' },
  { id:'e4', subject:'综合知识', q:'加密算法归类', a:'对称（DES/AES）与非对称（RSA/ECC）混淆', tip:'对称快、密钥同一；非对称用公钥加密私钥解密，用于签名与密钥分发。' },
  { id:'e5', subject:'案例分析', q:'敏感点 vs 权衡点', a:'两个概念写反', tip:'敏感点＝影响某质量属性的关键设计决策；权衡点＝影响多个质量属性的设计决策（一个改多个受影响）。' },
  { id:'e6', subject:'案例分析', q:'缓存三兄弟', a:'穿透/雪崩/击穿解决方案混用', tip:'穿透→布隆过滤器/空值缓存；雪崩→随机过期时间/多级缓存；击穿→互斥锁/热点永不过期。' },
  { id:'e7', subject:'案例分析', q:'DFD 补图遗漏', a:'漏画数据存储或外部实体', tip:'先找外部实体（矩形）与数据存储（缺边矩形），再顺着数据流核对加工（圆）。' },
  { id:'e8', subject:'论文', q:'论文空谈无数据', a:'通篇理论、无量化指标', tip:'务必写具体项目+量化数据（如 QPS、可用性 99.99%、响应时间），否则难及格。' }
];

const QUESTION_BANK = questionBank;

const BOOKS = [
  { name:'fire9288/senior-software-architect-review', tag:'GitHub · 最全', author:'自主命题复习仓库（无 License 声明，仅供个人学习）', desc:'综合选择题 320+、案例模拟题 26、论文模拟题 21、范文 18 篇、思维导图、速查表，全部自主命题规避真题版权。', lic:'无 LICENSE（默认保留权利，个人学习可用，商用需联系作者）', url:'https://github.com/fire9288/senior-software-architect-review', channel:'三科全覆盖，最新维护（2026-05），推荐首选' },
  { name:'pianpian315/ruankao-architect-notes', tag:'GitHub · 考点讲解', author:'软考系统架构设计师备考资料', desc:'知识点讲解最系统：4 本考点速记手册（主干索引/选择题/案例分析/论文），逐考点拆解 + 记忆口诀 + 2024-2025 真题，带在线网页版（全文搜索 + 暗色模式），可下载 PDF。', lic:'CC BY-NC-SA 4.0（禁商用，需署名 + 相同方式共享）', url:'https://github.com/pianpian315/ruankao-architect-notes', channel:'在线版：pianpian315.github.io/ruankao-architect-notes，考点讲解首选' },
  { name:'tyronczt/system_architect', tag:'GitHub · 逐章笔记', author:'2025 系统架构设计师备考笔记', desc:'按教材 20 章逐章拆解的知识点讲解笔记（硬件/OS/数据库/网络/软工/面向对象/架构设计等），含新老教材对比、三科考点详解、学习方法推荐。', lic:'无 LICENSE（默认保留权利，个人学习可用）', url:'https://github.com/tyronczt/system_architect', channel:'逐章知识点最细，适合按章节系统复习' },
  { name:'YoungHong1992/ruankao-senior-architecture-designer', tag:'GitHub · 知识库', author:'系统架构设计师备考知识库', desc:'教材 OCR + 2022 考试大纲 + 2016-2025 历年真题的 Markdown 整理，INDEX 索引 + 按需加载，适合 AI 辅助检索与校对。', lic:'无 LICENSE（默认保留权利，个人学习可用）', url:'https://github.com/YoungHong1992/ruankao-senior-architecture-designer', channel:'资料最全的汇编型知识库，适合检索定位' },
  { name:'AngelSnow1129/system-architect-learningV2', tag:'GitHub · 在线学习', author:'软考系统架构师在线学习站', desc:'19 个完整章节 + 18 个重点提纲 + 必背内容，带 5 星重点章节标记与学习路径（系统学习→强化复习→考前冲刺）。', lic:'无 LICENSE（默认保留权利，个人学习可用）', url:'https://github.com/AngelSnow1129/system-architect-learningV2', channel:'结构化在线学习站，含章节提纲与必背' },
  { name:'xxlllq / gotanksgn system_architect', tag:'GitHub · 真题', author:'多位作者维护的资源库', desc:'2009-2020 历年真题（综合/案例/论文）+ 答案解析 + 教学视频链接，PDF 格式。', lic:'作者注明「仅限个人学习备考，严禁商业用途」', url:'https://github.com/gotanksgn/system_architect', channel:'历年真题+答案解析最全，适合刷真题' },
  { name:'中国计算机技术职业资格网', tag:'官方', author:'软考官方网站', desc:'官方通知、报名、成绩查询、准考证打印、机考模拟系统入口。', lic:'官方信息，免费公开', url:'https://www.ruankao.org.cn', channel:'报名 / 查分 / 机考模拟的唯一官方渠道' }
];

const PLANS_DEFAULT = [
  { subject:'综合知识', task:'基础阶段：通读教材第1-10章（计算机系统/软件工程/架构设计）', due:30 },
  { subject:'综合知识', task:'强化阶段：刷近5年综合知识真题，整理高频考点', due:20 },
  { subject:'案例分析', task:'强化阶段：专攻架构评估/DFD建模/缓存设计三类大题', due:25 },
  { subject:'案例分析', task:'冲刺阶段：模拟机考环境，练习架构图绘制', due:12 },
  { subject:'论文', task:'准备3-5个架构案例（微服务/高并发/云原生）', due:40 },
  { subject:'论文', task:'冲刺阶段：限时120分钟完整写2-3篇论文', due:10 }
];

const EXAM_PLAN = [
  { k:'综合知识', t:'150 分钟 · 75 道单选', plan:'前 60 分钟做完 60 题（每分钟 1 题），留 90 分钟检查与难题攻坚；专业英语 5 题放最后。' },
  { k:'案例分析', t:'90 分钟 · 5 大题选 3', plan:'每题约 25 分钟，先读题勾画关键字，画出架构图/Dfd 草图再落笔；第 1 题必答不可跳过。' },
  { k:'论文', t:'120 分钟 · 2500 字', plan:'前 10 分钟选题列提纲，正文 90 分钟，留 20 分钟检查；先写项目背景与总体架构，再分述关键设计。' }
];

/* ============ 计算层 ============ */
function todayStr(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function nextExamDate(){
  const now = new Date();
  let y = now.getFullYear();
  // 上半年 5 月最后一个周末（约 5/23），下半年 11 月第一周（约 11/7）
  const may = new Date(y, 4, 23);   // 5月23日
  const nov = new Date(y, 10, 7);   // 11月7日
  let target;
  if(now <= may) target = may;
  else if(now <= nov) target = nov;
  else target = new Date(y+1, 4, 23);
  return target;
}
function daysLeft(){ const ms = nextExamDate().getTime() - Date.now(); return Math.max(0, Math.ceil(ms/86400000)); }

/* ============ 存储适配层（资料库 / localStorage） ============ */
function syncIndicator(mode, txt){ 
  const dot = document.getElementById('syncDot');
  const t = document.getElementById('syncTxt');
  dot.className = 'dot ' + (mode==='sync'?'sync':mode==='off'?'off':'');
  t.textContent = txt;
}
function lsGet(k,d){ return Object.hasOwn(cache,k) ? cache[k] : d; }
function lsSet(k,v){ cache[k]=JSON.parse(JSON.stringify(v)); save(k,cache[k]); }
function lsClear(){}
function dbAvailable(){return true;}
async function dbAdd(){}
/* ============ 初始化 ============ */
function seedDefaults(){
  if(!cache.seeded){
    state.checkins = {};
    state.plans = PLANS_DEFAULT.map(p=>({...p, done:false}));
    state.mastered = { 'e5':true, 'e8':true };
    lsSet('seeded',true);
    // 首次打开：昨日一条逾期打卡示例 + 规划任务默认
  } else {
    state.checkins = lsGet('checkins', {});
    state.plans = lsGet('plans', PLANS_DEFAULT.map(p=>({...p,done:false})));
    state.mastered = lsGet('mastered', {'e5':true,'e8':true});
    state.quizDone = lsGet('quizDone', {});
    state.quizTotal = lsGet('quizTotal', {correct:0,wrong:0});
    state.bankOverride = lsGet('bankOverride', {});
  }
}

/* ============ 渲染层 ============ */
function renderNav(active){
  document.querySelectorAll('#nav button,#mtab button').forEach(b=>{
    b.classList.toggle('active', b.dataset.view===active);
  });
  ['today','kemu','err','quiz','plan','book'].forEach(v=>{
    document.getElementById('view-'+v).style.display = v===active?'block':'none';
  });
}

/* 今日 */
function renderToday(){
  const list = document.getElementById('todayList');
  const empty = document.getElementById('todayEmpty');
  const items = [];
  const today = todayStr();
  // 1. 今日未打卡 → 待办
  if(!state.checkins[today] || !state.checkins[today].subjects || state.checkins[today].subjects.length===0){
    items.push({ type:'today', title:'今日尚未打卡', desc:'点击「规划打卡」完成今日学习打卡', action:'去打卡', go:'plan' });
  }
  // 2. 逾期任务：规划任务里 due<=7（临近到期）且未完成 → 红色逾期
  state.plans.forEach((p,i)=>{
    if(!p.done && p.due <= 7){
      items.push({ type:'overdue', title:p.task, desc:'规划任务 · '+p.subject+'（'+p.due+'天内到期，未完成）', action:'标记完成', idx:i });
    }
  });
  const overdueCount = items.filter(i=>i.type==='overdue').length;
  empty.style.display = items.length? 'none':'block';
  if(items.length===0){ list.innerHTML=''; return; }
  list.innerHTML = items.map((it,i)=>{
    const cls = it.type==='overdue'?'overdue':'';
    const badge = it.type==='overdue'?'<span class="t-badge">逾期</span>':'<span class="t-badge" style="color:var(--amber)">待办</span>';
    return '<div class="today-item '+cls+'">'+
      '<div class="t-main"><div class="t-t">'+it.title+'</div><div class="t-d">'+it.desc+'</div></div>'+
      badge+
      (it.type==='overdue'
        ? '<button class="btn sm green" onclick="completePlan('+it.idx+')">标记完成</button>'
        : '<button class="btn sm" onclick="switchView(\''+it.go+'\')">'+it.action+'</button>')+
    '</div>';
  }).join('');
}

/* 科目 */
function renderKemuTabs(){
  const tabs = document.getElementById('kemuTabs');
  tabs.innerHTML = Object.keys(KEMU).map((k,i)=>'<button class="'+(i===0?'active':'')+'" onclick="switchKemu(\''+k+'\')">'+k+'</button>').join('');
  renderKemuContent(Object.keys(KEMU)[0]);
}
function switchKemu(k){
  document.querySelectorAll('#kemuTabs button').forEach(b=>b.classList.toggle('active', b.textContent===k));
  renderKemuContent(k);
}
function renderKemuContent(k){
  const el = document.getElementById('kemuContent');
  el.innerHTML = KEMU[k].map((c,i)=>{
    const kps = c.kps.map((kp,j)=>'<div class="kp"><span class="idx">'+(j+1)+'</span><span>'+kp+(j<3?'<span class="hot">高频</span>':'')+'</span></div>').join('');
    return '<div class="chap open" onclick="toggleChap(this)"><div class="chap-h"><div><div class="c-name">'+c.name+'</div><div class="c-meta">'+c.meta+'</div></div><span class="arrow">▾</span></div><div class="chap-b">'+kps+'</div></div>';
  }).join('');
}
function toggleChap(el){ el.classList.toggle('open'); }

/* 易错点 */
function renderErrors(){
  const el = document.getElementById('errList');
  el.innerHTML = ERRORS.map(e=>{
    const mastered = state.mastered[e.id];
    return '<div class="err-item '+(mastered?'mastered':'')+'" id="err-'+e.id+'">'+
      '<input type="checkbox" class="e-check" '+(mastered?'checked':'')+' onchange="toggleMastered(\''+e.id+'\')">'+
      '<div class="e-main">'+
        '<div class="e-q"><span class="tag">'+e.subject+'</span> '+e.q+'</div>'+
        '<div class="e-a">正确理解：'+e.a+'</div>'+
        '<div class="e-tip">避坑：'+e.tip+'</div>'+
      '</div></div>';
  }).join('');
}
function toggleMastered(id){
  state.mastered[id] = !state.mastered[id];
  lsSet('mastered', state.mastered);
  renderErrors();
  toast(state.mastered[id]?'已标记掌握':'已取消标记');
}

/* 题库 */
let curChapIdx = 0, curQuizIdx = 0, curAnswered = false;

function renderQuizTabs(){
  // 填充章节下拉
  const chapSel = document.getElementById('quizChapSel');
  chapSel.innerHTML = QUESTION_BANK.map((c,i)=>'<option value="'+i+'">'+c.name+'（'+c.count+'题）</option>').join('');
  renderQuizStats();
  renderQuiz(0, 0);
}
function fillQSel(){
  const qSel = document.getElementById('quizQSel');
  const chap = QUESTION_BANK[curChapIdx];
  qSel.innerHTML = chap.questions.map((q,i)=>'<option value="'+i+'">第 '+(i+1)+' 题</option>').join('');
  qSel.value = curQuizIdx;
}
function onChapChange(){
  curChapIdx = parseInt(document.getElementById('quizChapSel').value);
  curQuizIdx = 0;
  fillQSel();
  renderQuiz(curChapIdx, curQuizIdx);
}
function onQChange(){
  curQuizIdx = parseInt(document.getElementById('quizQSel').value);
  renderQuiz(curChapIdx, curQuizIdx);
}
function randomQuiz(){
  curChapIdx = Math.floor(Math.random()*QUESTION_BANK.length);
  const chap = QUESTION_BANK[curChapIdx];
  curQuizIdx = Math.floor(Math.random()*chap.questions.length);
  document.getElementById('quizChapSel').value = curChapIdx;
  fillQSel();
  renderQuiz(curChapIdx, curQuizIdx);
}
function getQuestion(ci, qi){
  // 优先返回用户修改过的题，否则返回默认题库题
  const key = ci + '_' + qi;
  if(state.bankOverride[key]) return state.bankOverride[key];
  return QUESTION_BANK[ci].questions[qi];
}
function renderQuizStats(){
  const el = document.getElementById('quizStats');
  const total = state.quizTotal.correct + state.quizTotal.wrong;
  const rate = total? Math.round(state.quizTotal.correct/total*100):0;
  const bankTotal = QUESTION_BANK.reduce((s,c)=>s+c.questions.length,0);
  el.innerHTML = '<div class="stat"><div class="num">'+bankTotal+'</div><div class="lb">题库总量</div></div>'+
    '<div class="stat"><div class="num">'+total+'</div><div class="lb">已做题</div></div>'+
    '<div class="stat"><div class="num" style="color:var(--green)">'+state.quizTotal.correct+'</div><div class="lb">答对</div></div>'+
    '<div class="stat"><div class="num" style="color:var(--amber)">'+rate+'%</div><div class="lb">正确率</div></div>';
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderQuiz(ci, qi){
  curChapIdx = ci; curQuizIdx = qi; curAnswered = false;
  const chap = QUESTION_BANK[ci];
  const q = getQuestion(ci, qi);
  document.getElementById('quizCat').textContent = chap.name;
  document.getElementById('quizChapSel').value = ci;
  fillQSel();
  const box = document.getElementById('quizBox');
  const edited = state.bankOverride[ci+'_'+qi] ? '<span class="edited-tag">已改</span>' : '';
  box.innerHTML = '<div class="quiz-q">'+(qi+1)+' / '+chap.questions.length+'　'+escapeHtml(q.q)+' '+edited+'</div>'+
    q.opts.map((o,i)=>'<label class="quiz-opt" data-i="'+i+'"><span class="qol"></span>'+escapeHtml(o)+'</label>').join('')+
    '<div class="quiz-fb" id="quizFb"></div>'+
    '<div class="quiz-bar"><button class="btn ghost" onclick="prevQuiz()">上一题</button>'+
    '<button class="btn ghost" onclick="nextQuiz()">下一题</button>'+
    '<button class="btn ghost" onclick="openEditQuestion()">修改本题</button></div>';
  box.querySelectorAll('.quiz-opt').forEach((opt,oi)=>{
    opt.addEventListener('click', ()=>answerQuiz(oi));
  });
}
function answerQuiz(i){
  if(curAnswered) return;
  curAnswered = true;
  const q = getQuestion(curChapIdx, curQuizIdx);
  const right = i===q.ans;
  const box = document.getElementById('quizBox');
  box.querySelectorAll('.quiz-opt').forEach((opt,oi)=>{
    if(oi===q.ans) opt.classList.add('correct');
    else if(oi===i) opt.classList.add('wrong');
    opt.classList.add('selected');
  });
  const fb = document.getElementById('quizFb');
  fb.className = 'quiz-fb '+(right?'right':'false');
  fb.textContent = (right?'✓ 回答正确！':'✗ 回答错误')+'　解析：'+q.exp;
  // 记录
  if(right) state.quizTotal.correct++; else state.quizTotal.wrong++;
  const qkey = curChapIdx+'_'+curQuizIdx;
  state.quizDone[qkey] = right;
  lsSet('quizDone', state.quizDone);
  lsSet('quizTotal', state.quizTotal);
  renderQuizStats();
  // 错题入库
  if(!right){
    dbAdd('错题', { '科目':{select:'综合知识'}, '题目内容':{text:q.q}, '答案':{text:q.opts[q.ans]}, '解析':{text:q.exp} });
  } else {
    dbAdd('刷题记录', { '科目':{select:'综合知识'}, '题目内容':{text:q.q} });
  }
}

/* ============ 修改答案窗口 ============ */
function openEditQuestion(){
  const q = getQuestion(curChapIdx, curQuizIdx);
  const chap = QUESTION_BANK[curChapIdx];
  document.getElementById('editTitle').textContent = chap.name + ' · 第 ' + (curQuizIdx+1) + ' 题';
  document.getElementById('editQ').value = q.q;
  document.getElementById('editO0').value = q.opts[0] || '';
  document.getElementById('editO1').value = q.opts[1] || '';
  document.getElementById('editO2').value = q.opts[2] || '';
  document.getElementById('editO3').value = q.opts[3] || '';
  document.getElementById('editAns').value = q.ans;
  document.getElementById('editExp').value = q.exp;
  document.getElementById('editMask').style.display = 'flex';
}
function closeEditQuestion(){
  document.getElementById('editMask').style.display = 'none';
}
function saveEditQuestion(){
  const q = document.getElementById('editQ').value.trim();
  const opts = [0,1,2,3].map(i=>document.getElementById('editO'+i).value.trim());
  const ans = parseInt(document.getElementById('editAns').value);
  const exp = document.getElementById('editExp').value.trim();
  if(!q){ alert('题干不能为空'); return; }
  if(opts.some(o=>!o)){ alert('四个选项均不能为空'); return; }
  if(isNaN(ans) || ans<0 || ans>3){ alert('正确答案须为 0-3'); return; }
  const key = curChapIdx+'_'+curQuizIdx;
  state.bankOverride[key] = { q:q, opts:opts, ans:ans, exp:exp };
  lsSet('bankOverride', state.bankOverride);
  closeEditQuestion();
  renderQuiz(curChapIdx, curQuizIdx);
}
function resetEditQuestion(){
  const key = curChapIdx+'_'+curQuizIdx;
  if(!state.bankOverride[key]) return;
  if(!confirm('恢复该题到默认题库的原始内容？')) return;
  delete state.bankOverride[key];
  lsSet('bankOverride', state.bankOverride);
  closeEditQuestion();
  renderQuiz(curChapIdx, curQuizIdx);
}
function prevQuiz(){ const n=QUESTION_BANK[curChapIdx].questions.length; renderQuiz(curChapIdx,(curQuizIdx-1+n)%n); }
function nextQuiz(){ const n=QUESTION_BANK[curChapIdx].questions.length; renderQuiz(curChapIdx,(curQuizIdx+1)%n); }

/* 规划打卡 */
function renderPlanProgress(){
  const el = document.getElementById('planProgress');
  const total = state.plans.length;
  const done = state.plans.filter(p=>p.done).length;
  const pct = total? Math.round(done/total*100):0;
  const r = 34, c = 2*Math.PI*r;
  const off = c*(1-pct/100);
  el.innerHTML = '<svg width="80" height="80" viewBox="0 0 80 80">'+
    '<circle cx="40" cy="40" r="'+r+'" fill="none" stroke="#e8eaf0" stroke-width="8"/>'+
    '<circle cx="40" cy="40" r="'+r+'" fill="none" stroke="#3b5bdb" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+c+'" stroke-dashoffset="'+off+'" transform="rotate(-90 40 40)"/>'+
    '<text x="40" y="44" text-anchor="middle" font-size="16" font-weight="700" fill="#3b5bdb">'+pct+'%</text></svg>'+
    '<div><div style="font-size:14px;font-weight:600">规划完成度 '+done+'/'+total+'</div>'+
    '<div style="font-size:12px;color:var(--sub)">建议三段式：基础(1-2月)→强化(1月)→冲刺(2周)</div></div>';
}
function renderPlanTable(){
  const el = document.getElementById('planTable');
  if(state.plans.length===0){ el.innerHTML='<tr><td colspan="4" class="empty">暂无规划任务</td></tr>'; return; }
  el.innerHTML = '<tr><th>科目</th><th>任务</th><th>状态</th><th>操作</th></tr>'+
    state.plans.map((p,i)=>'<tr>'+
      '<td><span class="tag">'+p.subject+'</span></td>'+
      '<td style="'+(p.done?'text-decoration:line-through;color:#9aa1ad':'')+'">'+p.task+'</td>'+
      '<td>'+(p.done?'<span class="tag green">已完成</span>':'<span class="tag amber">进行中</span>')+'</td>'+
      '<td>'+(p.done?'<button class="btn sm gray" onclick="undoPlan('+i+')">撤销</button>':'<button class="btn sm green" onclick="completePlan('+i+')">完成</button>')+
      '</tr>').join('');
}
function completePlan(i){
  state.plans[i].done = true;
  lsSet('plans', state.plans);
  renderPlanTable(); renderPlanProgress(); renderToday();
  toast('已完成任务');
}
function undoPlan(i){
  state.plans[i].done = false;
  lsSet('plans', state.plans);
  renderPlanTable(); renderPlanProgress(); renderToday();
  toast('已撤销');
}
function renderCheckGrid(){
  const el = document.getElementById('checkGrid');
  const today = todayStr();
  let html='';
  for(let i=6;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i);
    const ds = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const rec = state.checkins[ds];
    const has = rec && rec.subjects && rec.subjects.length>0;
    const cls = (ds===today?'today ':'')+(has?'done':(i===0?'':'future'));
    const label = d.getDate();
    html += '<div class="check-cell '+cls+'" title="'+ds+'">'+label+'</div>';
  }
  el.innerHTML = html;
}
function doCheckin(){
  const subj = document.getElementById('checkinSubject').value;
  const today = todayStr();
  if(!state.checkins[today]) state.checkins[today] = {subjects:[]};
  if(!state.checkins[today].subjects.includes(subj)){
    state.checkins[today].subjects.push(subj);
    lsSet('checkins', state.checkins);
    dbAdd('打卡', { '科目':{select:subj} });
    renderCheckGrid(); renderToday();
    toast('已打卡「'+subj+'」');
  } else {
    toast('今天已打卡该科目');
  }
}
function renderExamPlan(){
  const el = document.getElementById('examPlan');
  el.innerHTML = EXAM_PLAN.map(e=>'<div class="chap open"><div class="chap-h"><div><div class="c-name">'+e.k+'　<span style="font-weight:400;color:var(--sub);font-size:12px">'+e.t+'</span></div></div><span class="arrow">▾</span></div><div class="chap-b" style="font-size:13px;color:var(--txt)">'+e.plan+'</div></div>').join('');
}

/* 教材 · 开源资料 */
function renderBooks(){
  const el = document.getElementById('bookList');
  el.innerHTML = BOOKS.map(b=>{
    const licCls = b.lic.indexOf('CC')>=0 || b.lic.indexOf('NC')>=0 || b.lic.indexOf('禁')>=0 || b.lic.indexOf('个人')>=0 ? 'amber' : 'green';
    return '<div class="chap open"><div class="chap-h"><div><div class="c-name">'+b.name+'　<span class="tag '+(b.tag==='GitHub · 最全'?'red':b.tag==='官方'?'green':'')+'">'+b.tag+'</span></div><div class="c-meta">'+b.author+'</div></div><span class="arrow">▾</span></div><div class="chap-b" style="font-size:13px">'+
      '<div class="kp"><span class="idx">容</span><span>'+b.desc+'</span></div>'+
      '<div class="kp"><span class="idx">许</span><span><span class="tag '+licCls+'">'+b.lic+'</span></span></div>'+
      '<div class="kp"><span class="idx">链</span><span><a href="'+b.url+'" target="_blank" rel="noopener">'+b.url+'</a></span></div>'+
      '<div class="kp"><span class="idx">用</span><span>'+b.channel+'</span></div>'+
    '</div></div>';
  }).join('');
  el.innerHTML += '<div class="sub" style="margin-top:14px">提示：以上为免费备考资源导航（仅提供链接，不搬运内容）。其中 GitHub 仓库多为个人学习用途（CC BY-NC-SA 或未声明许可证），<b>请勿商用</b>；官方教材《系统架构设计师教程（第2版）》清华社 ISBN 9787302619925 需购买正版。</div>';
}

/* ============ 统一刷新入口（铁律9：单向调用） ============ */
function refreshAll(){
  renderToday();
  renderKemuTabs();
  renderErrors();
  renderQuizTabs();
  renderPlanProgress();
  renderPlanTable();
  renderCheckGrid();
  renderExamPlan();
  renderBooks();
}

/* ============ 交互 ============ */
function switchView(v){ renderNav(v); }
document.querySelectorAll('#nav button,#mtab button').forEach(b=>{
  b.addEventListener('click', ()=>switchView(b.dataset.view));
});

function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 1800);
}

/* ============ 倒计时 ============ */
function renderCountdown(){
  const d = daysLeft();
  const el = document.getElementById('countdown');
  el.innerHTML = '距离下一次考试：<b>'+d+'</b> 天';
}

/* ============ 启动 ============ */
function init(){
  seedDefaults();
  renderCountdown();
  refreshAll();
  // 同步状态
  if(dbAvailable()){ syncIndicator('','已同步'); }
  else { syncIndicator('off','离线模式'); }
  // 每日刷新倒计时
  setInterval(renderCountdown, 60000);
}
Object.assign(window, {todayStr,nextExamDate,daysLeft,syncIndicator,lsGet,lsSet,lsClear,dbAvailable,seedDefaults,renderNav,renderToday,renderKemuTabs,switchKemu,renderKemuContent,toggleChap,renderErrors,toggleMastered,renderQuizTabs,fillQSel,onChapChange,onQChange,randomQuiz,getQuestion,renderQuizStats,renderQuiz,answerQuiz,openEditQuestion,closeEditQuestion,saveEditQuestion,resetEditQuestion,prevQuiz,nextQuiz,renderPlanProgress,renderPlanTable,completePlan,undoPlan,renderCheckGrid,doCheckin,renderExamPlan,renderBooks,refreshAll,switchView,toast,renderCountdown,init});
start();

}
