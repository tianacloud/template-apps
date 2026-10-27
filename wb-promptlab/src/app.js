const style=document.createElement('style');style.textContent="\n:root{\n  --bg:#070b18; --panel:rgba(255,255,255,.045); --panel-2:rgba(255,255,255,.08);\n  --border:rgba(255,255,255,.09); --border-strong:rgba(255,255,255,.18);\n  --text:#e8eeff; --text-2:#9fb0d0; --text-3:#6b7a9b;\n  --primary:#6d7cff; --cyan:#22d3ee; --violet:#a78bfa; --green:#34d399; --amber:#fbbf24; --rose:#fb7185;\n  --grad:linear-gradient(120deg,#6d7cff 0%,#22d3ee 100%);\n  --radius:16px; --shadow:0 18px 40px rgba(0,0,0,.42);\n  --glow:0 0 0 1px rgba(109,124,255,.35),0 10px 34px rgba(109,124,255,.26);\n}\n*{box-sizing:border-box}\nhtml,body{margin:0;padding:0}\nbody{\n  font-family:'Inter','PingFang SC','Microsoft YaHei',system-ui,sans-serif;\n  color:var(--text); background:var(--bg);\n  background-image:\n    radial-gradient(900px 520px at 10% -10%,rgba(109,124,255,.22),transparent 60%),\n    radial-gradient(820px 440px at 100% 0%,rgba(34,211,238,.16),transparent 55%),\n    radial-gradient(760px 520px at 50% 120%,rgba(167,139,250,.14),transparent 62%);\n  background-attachment:fixed; min-height:100vh;\n}\n.wrap{max-width:1120px;margin:0 auto;padding:28px 20px 60px}\n/* ---------- 顶部 ---------- */\n.hero{padding:26px 0 30px;text-align:center}\n.hero h1{margin:0;font-size:34px;font-weight:800;letter-spacing:.5px}\n.hero h1 .g{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}\n.hero p{margin:12px auto 0;max-width:640px;color:var(--text-2);font-size:15px;line-height:1.8}\n.badges{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px}\n.badge{font-size:12px;color:var(--text-2);border:1px solid var(--border);background:var(--panel);\n  padding:5px 12px;border-radius:999px}\n/* ---------- 主区 ---------- */\n.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}\n@media (max-width:880px){.grid{grid-template-columns:1fr}}\n.card{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);\n  backdrop-filter:blur(10px);padding:18px;box-shadow:var(--shadow)}\n.card h2{margin:0 0 4px;font-size:16px;display:flex;align-items:center;gap:8px}\n.card .sub{margin:0 0 12px;color:var(--text-3);font-size:12.5px;line-height:1.7}\n.card-head{margin-bottom:14px}\ntextarea{\n  width:100%;min-height:170px;resize:vertical;background:rgba(255,255,255,.05);\n  border:1px solid var(--border);border-radius:12px;padding:14px;color:var(--text);\n  font:14px/1.75 'JetBrains Mono','Cascadia Code',Consolas,'PingFang SC',monospace;outline:none;\n}\ntextarea:focus{border-color:rgba(109,124,255,.55);box-shadow:var(--glow)}\ntextarea::placeholder{color:var(--text-3)}\n.tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px}\n.btn{cursor:pointer;border:none;border-radius:10px;padding:10px 18px;font-size:14px;font-weight:600;\n  color:#fff;background:var(--grad);transition:transform .15s,opacity .15s}\n.btn:hover{transform:translateY(-1px);opacity:.92}\n.btn.ghost{background:var(--panel-2);border:1px solid var(--border);color:var(--text-2);font-weight:500}\n.btn.mini{padding:5px 10px;font-size:12px;border-radius:8px}\n.count{margin-left:auto;color:var(--text-3);font-size:12px}\n.chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}\n.chip{cursor:pointer;font-size:12px;color:var(--text-2);border:1px dashed var(--border-strong);\n  background:transparent;padding:5px 10px;border-radius:999px;transition:.15s}\n.chip:hover{color:var(--text);border-color:var(--primary)}\n/* ---------- 结果 ---------- */\n.score-row{display:flex;gap:18px;align-items:center;margin-bottom:14px;flex-wrap:wrap}\n.ring{position:relative;width:110px;height:110px;flex:none}\n.ring svg{transform:rotate(-90deg)}\n.ring .num{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}\n.ring .num b{font-size:28px;line-height:1}\n.ring .num span{font-size:11px;color:var(--text-3);margin-top:3px}\n.level{font-size:20px;font-weight:800}\n.level small{display:block;font-size:12.5px;color:var(--text-2);font-weight:400;margin-top:6px;line-height:1.7;max-width:380px}\n.dims{display:flex;flex-direction:column;gap:9px;margin-top:6px}\n.dim{display:grid;grid-template-columns:76px 1fr 52px;gap:10px;align-items:center;font-size:13px}\n.dim .name{color:var(--text-2);white-space:nowrap}\n.dim .name i{font-style:normal;color:var(--text-3);font-size:11px;margin-left:4px}\n.bar{height:7px;border-radius:99px;background:rgba(255,255,255,.07);overflow:hidden}\n.bar i{display:block;height:100%;border-radius:99px;background:var(--grad);transition:width .5s ease}\n.dim .val{text-align:right;color:var(--text-3);font-variant-numeric:tabular-nums}\n.dim .val b{color:var(--text)}\n.sugs{margin-top:16px;display:flex;flex-direction:column;gap:10px}\n.sug{border:1px solid var(--border);border-radius:12px;padding:12px 14px;background:rgba(255,255,255,.03)}\n.sug .t{font-weight:700;font-size:13.5px;color:var(--amber);margin-bottom:5px}\n.sug .d{font-size:12.5px;color:var(--text-2);line-height:1.7}\n.sug code{display:block;margin-top:8px;font-size:12px;line-height:1.7;color:#c0c8e8;background:rgba(0,0,0,.3);\n  border-radius:8px;padding:9px 11px;white-space:pre-wrap;word-break:break-word}\n.sug .act{margin-top:8px}\n.pro-box{margin-top:14px;display:none}\n.pro-box.show{display:block}\n.pro-text{font-size:12.5px;line-height:1.8;color:#c0c8e8;background:rgba(0,0,0,.3);border-radius:10px;\n  padding:13px;white-space:pre-wrap;word-break:break-word;max-height:320px;overflow:auto;\n  font-family:'JetBrains Mono',Consolas,'PingFang SC',monospace}\n.notes{margin:10px 0 0;padding:0 0 0 18px;color:var(--text-3);font-size:12px;line-height:1.9}\n.empty{text-align:center;color:var(--text-3);font-size:13px;padding:40px 10px;line-height:2}\n.empty .big{font-size:40px;display:block;margin-bottom:6px}\nfooter{text-align:center;color:var(--text-3);font-size:12px;margin-top:36px;line-height:2}\nfooter a{color:var(--text-2)}\n.toast{position:fixed;left:50%;bottom:34px;transform:translateX(-50%) translateY(20px);opacity:0;\n  background:#111a2e;border:1px solid var(--border-strong);color:var(--text);padding:10px 20px;\n  border-radius:12px;font-size:13px;transition:.25s;pointer-events:none;z-index:9}\n.toast.on{opacity:1;transform:translateX(-50%) translateY(0)}\n";document.head.appendChild(style);document.body.innerHTML="\n<div class=\"wrap\">\n  <div class=\"hero\">\n    <h1><span class=\"g\">PromptLab</span> 提示词体检优化器</h1>\n    <p>不依赖大模型，纯本地规则引擎为你的提示词做 <b>8 维度体检</b>：角色 · 任务 · 背景 · 输入 · 格式 · 约束 · 示例 · 思考。逐条给出改进建议与可复制片段，一键改写成结构化专业版。</p>\n    <div class=\"badges\">\n      <span class=\"badge\">⚡ 离线可用 · 无需 API Key</span>\n      <span class=\"badge\">🩺 8 维度评分 100 分制</span>\n      <span class=\"badge\">✍️ 一键生成结构化专业版</span>\n      <span class=\"badge\">🧩 逐条建议 · 一键追加</span>\n    </div>\n  </div>\n\n  <div class=\"grid\">\n    <!-- 左：输入 -->\n    <div class=\"card\">\n      <div class=\"card-head\">\n        <h2>📝 你的提示词</h2>\n        <p class=\"sub\">把平时发给 AI 的一句话粘贴进来，试试体检能发现什么。</p>\n      </div>\n      <textarea id=\"input\" placeholder=\"例如：帮我写一篇关于大学生时间管理的文章\"></textarea>\n      <div class=\"tools\">\n        <button class=\"btn\" onclick=\"run()\">🩺 开始体检</button>\n        <button class=\"btn ghost mini\" onclick=\"clearAll()\">清空</button>\n        <span class=\"count\" id=\"count\">0 字</span>\n      </div>\n      <div class=\"chips\" id=\"chips\"></div>\n    </div>\n\n    <!-- 右：结果 -->\n    <div class=\"card\">\n      <div class=\"card-head\">\n        <h2>🩺 体检报告</h2>\n        <p class=\"sub\">8 个维度满分合计 100 分，低于 70% 满分的维度会给出补强建议。</p>\n      </div>\n      <div id=\"result\"><div class=\"empty\"><span class=\"big\">🩺</span>在左侧输入提示词，点「开始体检」<br>或者点下面的示例提示词快速体验</div></div>\n      <div class=\"pro-box\" id=\"proBox\">\n        <h2 style=\"margin-top:18px\">✨ 结构化专业版</h2>\n        <p class=\"sub\">由规则引擎基于你的原文改写，{{占位符}} 处替换成你的实际内容即可使用。</p>\n        <div class=\"pro-text\" id=\"proText\"></div>\n        <ul class=\"notes\" id=\"proNotes\"></ul>\n        <div class=\"tools\">\n          <button class=\"btn mini\" onclick=\"copyPro()\">📋 复制专业版</button>\n          <button class=\"btn ghost mini\" onclick=\"usePro()\">⬆ 回填到输入框继续体检</button>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <footer>\n    纯前端规则引擎 · 数据不出浏览器 · 无需登录<br>\n    \n  </footer>\n</div>\n<div class=\"toast\" id=\"toast\"></div>\n\n";

/* ================= 提示词本地规则引擎（与 PromptLab 后端同源算法） ================= */
var DIMENSIONS=[
 {key:'role',name:'角色设定',max:10,tip:'告诉模型"你是谁"'},
 {key:'task',name:'任务明确',max:15,tip:'用动词讲清要做什么'},
 {key:'context',name:'背景上下文',max:15,tip:'交代场景、受众与目的'},
 {key:'input',name:'输入说明',max:10,tip:'素材与 {{占位符}} 标注'},
 {key:'format',name:'输出格式',max:15,tip:'指定结构与字数'},
 {key:'constraint',name:'约束条件',max:15,tip:'写清边界与兜底'},
 {key:'example',name:'示例引导',max:10,tip:'给 1-2 个输入输出示例'},
 {key:'reasoning',name:'思考步骤',max:10,tip:'先分析再作答'}
];
var SNIPPETS={
 role:'你是一位 {{领域}} 资深专家，拥有 {{N}} 年一线经验，擅长 {{核心技能}}。回答时保持专业、严谨，必要时主动指出风险。',
 task:'【任务】请完成：{{用一句话说清最终要做成什么}}。只做这一件事，不要扩展到其他任务。',
 context:'【背景】这份内容将用于 {{使用场景}}，阅读者是 {{目标受众}}，我希望达到的效果是 {{期望效果}}。',
 input:'【输入】\n{{在此粘贴需要处理的素材；有多段时请编号，例如：\n[1] xxx\n[2] xxx}}',
 format:'【输出要求】\n- 使用 Markdown 输出，包含小标题与要点列表\n- 代码放入代码块并标注语言\n- 总长度控制在 {{500}} 字以内\n- 结构：结论 → 理由 → 可执行建议',
 constraint:'【约束】\n- 不要 {{编造原文中没有的内容}}\n- 语气 {{简洁、面向初学者}}\n- 如果信息不足以判断，请先列出你需要补充的信息，不要猜测',
 example:'【示例】\n输入：{{示例输入}}\n输出：{{示例输出}}',
 reasoning:'【思考方式】请先分步骤分析，再给出结论：\n1) 理解需求与约束 2) 拆解为子问题 3) 逐步推导 4) 自检答案是否满足全部要求'
};
var ADVICE={
 role:'缺少角色设定，模型只能用"通用口吻"回答。加一句身份描述，专业度会立刻提升。',
 task:'任务不够聚焦，模型容易答偏或写得太泛。用动词明确"要做什么、做成什么样"。',
 context:'没有交代背景与受众，回答深浅只能靠猜。补上使用场景、读者对象和期望效果。',
 input:'没有说明输入素材与变量，提示词无法复用。把需要处理的内容或 {{占位符}} 写清楚。',
 format:'没有约定输出格式，结果往往需要二次整理。指定结构、字段与字数。',
 constraint:'缺少约束与兜底，模型可能编造或跑题。写清长度、语气、禁忌，以及信息不足时怎么办。',
 example:'没有给出示例，模型的发挥随机性大。补 1-2 个"输入 → 输出"样例最有效。',
 reasoning:'复杂任务没有要求分步思考，容易一步跳错。加一句"先分析再作答"即可。'
};
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function scoreRole(p){
 if(/(你是|作为)\s*一?[位名个]?/.test(p)||/假设你是/.test(p)||/扮演/.test(p)){
  var m=p.match(/(?:你是|作为|扮演)\s*一?[位名个]?([^，。；,.\n]{2,24})/);
  var specific=m&&/专家|工程师|架构师|开发者|程序员|老师|教授|研究员|学者|分析师|设计师|作家|编辑|翻译|顾问|教练|医生|律师|产品经理|测试|运维|面试官/.test(m[1]);
  return specific?10:7;
 }
 return /role\s*[:：]/i.test(p)?6:0;
}
function scoreTask(p){
 var v=/写|生成|总结|翻译|解释|分析|改写|润色|优化|设计|实现|编写|创建|列出|整理|对比|评估|审查|修复|重构|提取|分类|规划|制作|给出|推荐|检查|测试|搭建|部署/;
 var s=0; if(v.test(p))s=9; if(p.trim().length>=25&&v.test(p))s=12;
 if(/输出|生成一份|写一份|给出.{0,6}方案|返回|产出|交付|目标是|最终要/.test(p))s=Math.max(s,13);
 if(/帮我看看|帮我弄|随便|一点点|之类的|什么的|看看能|搞一下|弄个/.test(p))s-=4;
 if(p.trim().length<12)s=Math.min(s,5);
 return clamp(s,0,15);
}
function scoreContext(p){
 var s=0;
 if(/背景|场景|上下文|现状|正在做/.test(p))s+=6;
 if(/受众|读者|用户是|面向|给学生|给同事|给领导|给客户|给面试官/.test(p))s+=5;
 if(/目的|是为了|用于|想要|希望|目标/.test(p))s+=4;
 if(p.length>=120)s+=2;
 return clamp(s,0,15);
}
function scoreInput(p){
 if(/\{\{[^}]+\}\}/.test(p))return 10;
 var s=0;
 if(/以下|如下|输入|素材|原文|待处理|数据[:：]|代码[:：]|内容[:：]|文本[:：]|材料/.test(p))s+=6;
 if(/[「『""][^」』""]{8,}[」』""]/.test(p))s+=3;
 if(/```/.test(p))s+=3;
 return clamp(s,0,10);
}
function scoreFormat(p){
 var s=0;
 if(/格式|输出结构|结构如下|按.{0,8}(结构|格式)|排版/.test(p))s+=6;
 if(/Markdown|markdown|JSON|json|表格|列表|分点|编号|要点|代码块|YAML|yaml|CSV|csv|标题|字段/.test(p))s+=5;
 if(/\d+\s*字/.test(p))s+=4;
 if(/小节|步骤|示例格式|模板|层级/.test(p))s+=3;
 return clamp(s,0,15);
}
function scoreConstraint(p){
 var s=0;
 if(/不要|禁止|避免|不得|严禁/.test(p))s+=5;
 if(/不超过|至少|最多|限制在|控制在|字数/.test(p))s+=4;
 if(/语气|风格|口吻|正式|口语|幽默|严谨|通俗|简洁|专业|亲切/.test(p))s+=4;
 if(/如果.{0,12}(无法|不清楚|不确定|不足|缺失)|信息不足|不确定时|若有必要/.test(p))s+=4;
 return clamp(s,0,15);
}
function scoreExample(p){
 var s=0;
 if(/例如|举例|示例|比如|样例|参考以下|像这样|示范/.test(p))s+=6;
 if(/(输入|示例|样例|例如)\s*[:：]/.test(p)||/```/.test(p))s+=4;
 return clamp(s,0,10);
}
function scoreReasoning(p){
 var s=0;
 if(/一步步|逐步|分步|分步骤|拆解|先.{0,30}再.{0,30}最后/.test(p))s+=6;
 if(/思考|推理|分析后|思维链|step by step/i.test(p))s+=4;
 if(/验证|检查|复核|自检|回顾/.test(p))s+=3;
 return clamp(s,0,10);
}
var SCORERS={role:scoreRole,task:scoreTask,context:scoreContext,input:scoreInput,format:scoreFormat,constraint:scoreConstraint,example:scoreExample,reasoning:scoreReasoning};
function scoreLevel(s){
 if(s>=85)return{label:'优秀',color:'#34d399'};
 if(s>=75)return{label:'良好',color:'#22d3ee'};
 if(s>=60)return{label:'及格',color:'#fbbf24'};
 return{label:'待提升',color:'#fb7185'};
}
function analyze(prompt){
 var p=(prompt||'').trim();
 var items=DIMENSIONS.map(function(d){
  var score=p?SCORERS[d.key](p):0;
  return {key:d.key,name:d.name,max:d.max,tip:d.tip,score:score,ratio:score/d.max,ok:score>=d.max*0.7};
 });
 var score=items.reduce(function(s,it){return s+it.score},0);
 var suggestions=items.filter(function(it){return !it.ok}).sort(function(a,b){return a.ratio-b.ratio})
  .map(function(it){return{key:it.key,title:it.name+' '+it.score+'/'+it.max,desc:ADVICE[it.key],snippet:SNIPPETS[it.key]}});
 var summary='';
 if(!p)summary='输入一条提示词，开始体检。';
 else if(p.length<15)summary='提示词过短，模型只能靠猜，建议先补齐"角色 + 任务 + 输出要求"。';
 else if(score<55)summary='基础要素缺得较多，按下方建议逐条补齐，分数会有明显提升。';
 else if(score<75)summary='已经能跑出结果，补上格式与约束，稳定性会更好。';
 else summary='结构相当完整，可以再压缩冗余表述，或补示例来锁定风格。';
 return {score:score,level:scoreLevel(score),items:items,suggestions:suggestions,summary:summary,length:p.length};
}
function buildPro(prompt){
 var raw=(prompt||'').trim(),notes=[];
 var analysis=analyze(raw);
 var has=function(k){var f=analysis.items.filter(function(i){return i.key===k})[0];return f&&f.ok};
 var role='',rest=raw;
 var rm=raw.match(/(?:你是一位|你是一名|你是|作为一位|作为一名|作为|扮演)[^。！？\n]{2,40}[。！？]?/);
 if(rm){role=rm[0].trim().replace(/[。！？]$/,'')+'。';rest=raw.replace(rm[0],'').trim();if(rest.length<8)rest=raw;}
 var blocks=[];
 if(role){blocks.push('# 角色\n'+role);notes.push('沿用你已有的角色设定，并把它独立成段');}
 else{blocks.push('# 角色\n'+SNIPPETS.role);notes.push('补充了角色设定，让模型以专家视角作答');}
 blocks.push('# 背景\n'+(has('context')?'（沿用原提示词中的背景描述，可在此处进一步细化）':SNIPPETS.context.replace('【背景】','')));
 if(!has('context'))notes.push('补充了背景与受众说明，回答深浅更贴合场景');
 blocks.push('# 任务\n'+(rest||SNIPPETS.task));
 notes.push('把核心诉求独立为「任务」段，避免与其他要求混在一起');
 blocks.push('# 输入\n'+(has('input')?'（沿用原提示词中的输入说明）':SNIPPETS.input.replace('【输入】\n','')));
 if(!has('input'))notes.push('增加了输入素材占位符，替换内容即可复用');
 blocks.push('# 输出要求\n'+(has('format')?'（沿用原提示词中的格式要求，可补充字数与结构）':SNIPPETS.format.replace('【输出要求】\n','')));
 if(!has('format'))notes.push('明确了输出结构、字数与排版，结果可直接使用');
 blocks.push('# 约束\n'+(has('constraint')?'（沿用原提示词中的约束条件）':SNIPPETS.constraint.replace('【约束】\n','')));
 if(!has('constraint'))notes.push('补充了约束与"信息不足先追问"的兜底策略');
 blocks.push('# 示例\n'+(has('example')?'（沿用原提示词中的示例，建议至少给 1 组"输入 → 输出"）':SNIPPETS.example.replace('【示例】\n','')));
 if(!has('example'))notes.push('预留了示例区块，填入 1 组样例可显著稳定输出风格');
 if(has('reasoning')||rest.length>80){
  blocks.push('# 思考方式\n'+SNIPPETS.reasoning.replace('【思考方式】','').trim());
  if(!has('reasoning'))notes.push('任务偏复杂，追加了"先分析再作答"的要求');
 }
 return {text:blocks.join('\n\n'),notes:notes};
}
function applySnippet(prompt,snippet){var p=(prompt||'').trim();return p?p+'\n\n'+snippet:snippet}

/* ================= UI ================= */
var DEMOS=[
 {t:'大学生时间管理文章',p:'帮我写一篇关于大学生时间管理的文章'},
 {t:'代码审查',p:'你是一位资深前端工程师。请审查以下这段 Vue 3 组件代码，从性能、可维护性、类型安全三个角度给出修改建议，按严重程度排序输出，每条附上修改后的代码片段：\n```vue\n（在此粘贴代码）\n```'},
 {t:'周报生成',p:'你是一名互联网公司的产品运营。请根据我提供的本周工作流水，生成一份面向部门领导周报：结构为「本周成果（3 条以内）→ 数据表现 → 下周计划」，语气简洁专业，每条不超过 40 字。如果流水里缺少数据，请先列出需要我补充的信息。\n【本周流水】\n[1] （粘贴流水）\n[2] （粘贴流水）'},
 {t:'简历润色',p:'假设你是一位互联网大厂的 HR 面试官，请帮我润色这份实习经历描述：用「场景 + 动作 + 可量化结果」的句式改写，突出项目管理与沟通协作能力，输出修改前后对照表格，并给出 2 条面试时可能被追问的点。\n【原始描述】\n（粘贴简历段落）'}
];
var inputEl=document.getElementById('input'),resultEl=document.getElementById('result'),
    proBox=document.getElementById('proBox'),proText=document.getElementById('proText'),
    proNotes=document.getElementById('proNotes'),countEl=document.getElementById('count'),
    lastPro='',lastResult=null;
var saved=localStorage.getItem('promptlab_demo_input');if(saved)inputEl.value=saved;

function toast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('on');setTimeout(function(){t.classList.remove('on')},1600)}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
inputEl.addEventListener('input',function(){
 countEl.textContent=inputEl.value.trim().length+' 字';
 localStorage.setItem('promptlab_demo_input',inputEl.value);
});
countEl.textContent=inputEl.value.trim().length+' 字';

function ringSvg(score){
 var r=46,c=2*Math.PI*r,off=c*(1-score/100),col=scoreLevel(score).color;
 return '<svg width="110" height="110"><circle cx="55" cy="55" r="'+r+'" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="9"/>'+
 '<circle cx="55" cy="55" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+c+'" stroke-dashoffset="'+off+'" style="transition:stroke-dashoffset .6s"/>'+
 '<circle cx="55" cy="55" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+c+'" stroke-dashoffset="'+off+'" opacity=".35" style="filter:blur(4px)"/></svg>';
}
function run(){
 var p=inputEl.value.trim();
 if(!p){toast('先输入一条提示词，或点示例试试');return}
 var r=analyze(p);lastResult=r;
 var html='<div class="score-row"><div class="ring">'+ringSvg(r.score)+
  '<div class="num"><b style="color:'+r.level.color+'">'+r.score+'</b><span>/ 100</span></div></div>'+
  '<div class="level" style="color:'+r.level.color+'">'+r.level.label+'<small>'+esc(r.summary)+'</small></div></div>';
 html+='<div class="dims">'+r.items.map(function(it){
  var col=it.ok?'var(--green)':(it.score>0?'var(--amber)':'var(--rose)');
  return '<div class="dim" title="'+it.tip+'"><span class="name">'+it.name+'<i>'+it.max+'分</i></span>'+
  '<span class="bar"><i style="width:'+(it.ratio*100)+'%;background:'+(it.ratio>0.99?'var(--grad)':col)+'"></i></span>'+
  '<span class="val"><b>'+it.score+'</b>/'+it.max+'</span></div>';
 }).join('')+'</div>';
 if(r.suggestions.length){
  html+='<div class="sugs">'+r.suggestions.map(function(s,i){
   return '<div class="sug"><div class="t">⚠ '+esc(s.title)+'</div><div class="d">'+esc(s.desc)+'</div>'+
   '<code>'+esc(s.snippet)+'</code><div class="act"><button class="btn ghost mini" onclick="addSnippet(\''+s.key+'\')">＋ 一键追加到提示词</button></div></div>';
  }).join('')+'</div>';
 }else{
  html+='<div class="sugs"><div class="sug"><div class="t" style="color:var(--green)">🎉 全部维度达标</div><div class="d">这条提示词结构完整，可以直接投入使用了。试着补一组真实示例进一步锁定输出风格。</div></div></div>';
 }
 resultEl.innerHTML=html;
 var pro=buildPro(p);lastPro=pro.text;
 proText.textContent=pro.text;
 proNotes.innerHTML=pro.notes.map(function(n){return '<li>'+esc(n)+'</li>'}).join('');
 proBox.classList.add('show');
 proBox.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function addSnippet(key){
 inputEl.value=applySnippet(inputEl.value,SNIPPETS[key]);
 inputEl.dispatchEvent(new Event('input'));
 toast('已追加「'+DIMENSIONS.filter(function(d){return d.key===key})[0].name+'」片段，重新体检看看提升');
 run();
}
function clearAll(){inputEl.value='';inputEl.dispatchEvent(new Event('input'));lastPro='';
 proBox.classList.remove('show');
 resultEl.innerHTML='<div class="empty"><span class="big">🩺</span>在左侧输入提示词，点「开始体检」<br>或者点下面的示例提示词快速体验</div>';}
function copyPro(){
 var txt=lastPro||'';
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(function(){toast('已复制到剪贴板')},fallbackCopy)}
 else fallbackCopy();
 function fallbackCopy(){
  var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();
  try{document.execCommand('copy');toast('已复制到剪贴板')}catch(e){toast('复制失败，请手动选择复制')}
  document.body.removeChild(ta);
 }
}
function usePro(){inputEl.value=lastPro;inputEl.dispatchEvent(new Event('input'));toast('已回填，点「开始体检」看新分数');window.scrollTo({top:0,behavior:'smooth'})}
function copyOut(){copyPro()}

/* 示例提示词 */
var chipsEl=document.getElementById('chips');
chipsEl.innerHTML='<span style="font-size:12px;color:var(--text-3);align-self:center">示例：</span>'+
 DEMOS.map(function(d,i){return '<button class="chip" onclick="useDemo('+i+')">'+d.t+'</button>'}).join('');
function useDemo(i){inputEl.value=DEMOS[i].p;inputEl.dispatchEvent(new Event('input'));run();window.scrollTo({top:0,behavior:'smooth'})}

/* 自动体检一次预填内容 */
if(saved&&saved.trim())run();

Object.assign(window,{run,addSnippet,clearAll,copyPro,usePro,copyOut,useDemo});
