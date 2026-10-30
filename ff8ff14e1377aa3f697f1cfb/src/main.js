import { execute } from './storage.js';
const style = document.createElement("style"); style.textContent = "\n  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }\n  html, body { margin: 0; padding: 0; }\n  body {\n    font-family: -apple-system, \"PingFang SC\", \"Helvetica Neue\", \"Microsoft YaHei\", sans-serif;\n    background: #e2e8f0; color: #134e4a;\n    display: flex; justify-content: center;\n    -webkit-user-select: none; user-select: none;\n  }\n  .phone {\n    width: 100%; max-width: 460px; min-height: 100vh;\n    background: #f0fdfa; position: relative; padding-bottom: 72px;\n    box-shadow: 0 0 30px rgba(0,0,0,0.08);\n  }\n  .nav {\n    background: linear-gradient(135deg, #0f766e, #14b8a6);\n    color: #fff; padding: 30px 20px 22px; border-radius: 0 0 22px 22px;\n  }\n  .nav .date { font-size: 12px; opacity: .85; }\n  .nav h1 { font-size: 21px; margin: 6px 0 0; font-weight: 800; }\n  .nav p { font-size: 13px; opacity: .9; margin: 6px 0 0; }\n  .view { display: none; padding: 16px 14px; }\n  .view.active { display: block; }\n\n  .card { background: #fff; border-radius: 16px; padding: 16px; margin-bottom: 14px; box-shadow: 0 3px 10px rgba(15,118,110,.08); }\n  .title { font-size: 17px; font-weight: 700; color: #0f766e; }\n  .subtitle { font-size: 13px; color: #5e8b86; margin-top: 4px; line-height: 1.5; }\n  .btn { background: #0f766e; color: #fff; border: none; border-radius: 999px; font-size: 15px; padding: 12px; width: 100%; text-align: center; cursor: pointer; }\n  .btn.ghost { background: #ccfbf1; color: #0f766e; }\n  .btn:active { transform: scale(.98); }\n\n  .check { display: flex; align-items: center; padding: 11px; margin-top: 8px; background: #f0fdfa; border-radius: 10px; cursor: pointer; font-size: 14px; }\n  .check.on { background: #ccfbf1; }\n  .dot { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #0f766e; margin-right: 10px; color: #0f766e; font-size: 13px; text-align: center; line-height: 18px; }\n  .check.on .dot { background: #0f766e; color: #fff; }\n  .suggestion { margin-top: 10px; font-size: 13px; color: #0f766e; background: #ccfbf1; padding: 10px; border-radius: 10px; line-height: 1.5; }\n\n  .streak { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg,#ccfbf1,#99f6e4); border-radius: 14px; padding: 12px 16px; margin-bottom: 14px; }\n  .streak .num { font-size: 26px; font-weight: 800; color: #0f766e; }\n  .streak .lbl { font-size: 12px; color: #0f766e; }\n  .streak .do { background: #0f766e; color: #fff; border: none; border-radius: 999px; font-size: 13px; padding: 8px 16px; cursor: pointer; }\n  .streak .done { font-size: 13px; color: #0f766e; }\n\n  .quick-grid { display: flex; gap: 8px; margin-top: 10px; }\n  .quick { flex: 1; background: #f0fdfa; border-radius: 12px; padding: 14px 0; text-align: center; font-size: 13px; cursor: pointer; }\n  .quick .e { font-size: 24px; display: block; margin-bottom: 4px; }\n\n  .m { display: flex; align-items: center; background: #fff; border-radius: 16px; padding: 14px; margin-bottom: 10px; box-shadow: 0 3px 10px rgba(15,118,110,.08); cursor: pointer; }\n  .m .e { font-size: 30px; margin-right: 12px; }\n  .m .b { flex: 1; }\n  .m .n { font-size: 15px; font-weight: 700; color: #134e4a; }\n  .m .s { font-size: 12px; color: #5e8b86; margin-top: 3px; }\n  .m .t { font-size: 10px; color: #0f766e; background: #ccfbf1; border-radius: 999px; padding: 2px 7px; margin: 3px 5px 0 0; display: inline-block; }\n  .m .ar { font-size: 24px; color: #cbd5e1; }\n  .cat-title { font-size: 13px; font-weight: 700; color: #0f766e; margin: 16px 4px 6px; letter-spacing: 1px; }\n  .cat-title:first-child { margin-top: 4px; }\n\n  .back { font-size: 14px; color: #0f766e; cursor: pointer; margin-bottom: 10px; }\n  .principle { font-size: 14px; color: #334155; line-height: 1.7; margin-top: 8px; }\n  .breath { background: #fff; border-radius: 16px; padding: 20px; text-align: center; box-shadow: 0 3px 10px rgba(15,118,110,.08); }\n  .bphase { font-size: 22px; font-weight: 800; color: #0f766e; }\n  .bwrap { height: 210px; display: flex; align-items: center; justify-content: center; margin: 12px 0; }\n  .bcircle { width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #5eead4, #0f766e); display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 22px rgba(15,118,110,.3); }\n  .bcount { color: #fff; font-size: 40px; font-weight: 800; }\n  .gstep { display: flex; align-items: flex-start; padding: 11px; margin-top: 8px; background: #f0fdfa; border-radius: 10px; font-size: 14px; }\n  .gstep.active { background: #ccfbf1; }\n  .gstep.done { opacity: .6; }\n  .gnum { width: 22px; height: 22px; border-radius: 50%; background: #0f766e; color: #fff; font-size: 12px; text-align: center; line-height: 22px; margin-right: 9px; flex-shrink: 0; }\n\n  .picker-row { display: flex; justify-content: space-between; align-items: center; }\n  .picker { font-size: 15px; color: #0f766e; background: #f0fdfa; padding: 8px 14px; border-radius: 999px; border: none; }\n  .item { display: flex; justify-content: space-between; align-items: center; padding: 11px; background: #f0fdfa; border-radius: 10px; margin-top: 8px; font-size: 14px; }\n  .item .del { color: #ef4444; cursor: pointer; font-size: 13px; }\n  .note { font-size: 12px; color: #5e8b86; line-height: 1.8; }\n\n  .tabbar { position: fixed; bottom: 0; width: 100%; max-width: 460px; display: flex; background: #fff; border-top: 1px solid #e2e8f0; padding-bottom: env(safe-area-inset-bottom); }\n  .tab { flex: 1; text-align: center; padding: 10px 0 8px; font-size: 12px; color: #94a3b8; cursor: pointer; }\n  .tab.active { color: #0f766e; font-weight: 700; }\n  .tab .ic { font-size: 20px; display: block; }\n"; document.head.appendChild(style);
document.body.innerHTML = "\n<div class=\"phone\">\n  <div class=\"nav\">\n    <div class=\"date\" id=\"dateText\"></div>\n    <h1>副交感 · 安静下来</h1>\n    <p>交感太兴奋？提醒你，也教你怎么按下放松键。</p>\n  </div>\n\n  <!-- 首页 -->\n  <div class=\"view active\" id=\"v-home\">\n    <div class=\"streak\">\n      <div><div class=\"num\" id=\"streakNum\">0</div><div class=\"lbl\">连续练习天数</div></div>\n      <div id=\"streakBtn\"></div>\n    </div>\n    <div class=\"card\">\n      <div class=\"title\">一分钟自检</div>\n      <div class=\"subtitle\">勾选你此刻的状态</div>\n      <div id=\"checks\"></div>\n      <div class=\"suggestion\" id=\"sug\" style=\"display:none\"></div>\n    </div>\n    <div class=\"card\">\n      <div class=\"title\">今日提醒</div>\n      <div class=\"subtitle\">下次提醒：<span id=\"next\">尚未设置</span></div>\n      <div id=\"remListHome\" style=\"margin-top:8px\"></div>\n    </div>\n    <div class=\"card\">\n      <div class=\"title\">快速开始</div>\n      <div class=\"subtitle\">不用想，跟着做就行</div>\n      <div class=\"quick-grid\">\n        <div class=\"quick\" onclick=\"openDetail('b478')\"><span class=\"e\">🌬️</span>4-7-8 呼吸</div>\n        <div class=\"quick\" onclick=\"openDetail('extend')\"><span class=\"e\">💨</span>延长呼气</div>\n        <div class=\"quick\" onclick=\"switchTab('v-methods')\"><span class=\"e\">📚</span>全部方法</div>\n      </div>\n    </div>\n  </div>\n\n  <!-- 方法库 -->\n  <div class=\"view\" id=\"v-methods\"><div id=\"methodList\"></div></div>\n\n  <!-- 详情 -->\n  <div class=\"view\" id=\"v-detail\"><input type=\"hidden\" id=\"_curM\">\n    <div class=\"back\" onclick=\"switchTab('v-methods')\">‹ 返回方法库</div>\n    <div id=\"detailContent\"></div>\n  </div>\n\n  <!-- 提醒 -->\n  <div class=\"view\" id=\"v-reminder\">\n    <div class=\"card\">\n      <div class=\"title\">提醒设置</div>\n      <div class=\"subtitle\">到点提醒自己\"激活副交感\"</div>\n      <div class=\"picker-row\" style=\"margin-top:10px\">\n        <span style=\"font-weight:600;font-size:15px\">添加提醒时刻</span>\n        <input type=\"time\" class=\"picker\" id=\"timePick\" value=\"12:00\">\n      </div>\n      <button class=\"btn\" style=\"margin-top:12px\" onclick=\"addReminder()\">＋ 添加</button>\n      <div id=\"remList\" style=\"margin-top:10px\"></div>\n    </div>\n    <div class=\"card\">\n      <div class=\"title\">想先试试效果？</div>\n      <div class=\"subtitle\">点下面按钮，10 秒后弹出来一次真实浏览器提醒</div>\n      <button class=\"btn ghost\" style=\"margin-top:10px\" onclick=\"testNotify()\">测试提醒</button>\n    </div>\n    <div class=\"card\">\n      <div class=\"subtitle\">关于\"提醒\"的说明</div>\n      <div class=\"note\">• 网页版用浏览器通知，首次需授权，保持页面打开才会响。<br>\n      • 想让它在后台也准时提醒，可\"添加到主屏幕\"后常驻，或用手机自带的闹钟/提醒事项配合。<br>\n      • 练习记录和提醒设置需要网络连接。</div>\n    </div>\n  </div>\n\n  <div class=\"tabbar\">\n    <div class=\"tab active\" data-v=\"v-home\" onclick=\"switchTab('v-home')\"><span class=\"ic\">🏠</span>首页</div>\n    <div class=\"tab\" data-v=\"v-methods\" onclick=\"switchTab('v-methods')\"><span class=\"ic\">📚</span>方法库</div>\n    <div class=\"tab\" data-v=\"v-reminder\" onclick=\"switchTab('v-reminder')\"><span class=\"ic\">⏰</span>提醒</div>\n  </div>\n</div>\n\n";

const methods = [
  { id:'b478', name:'4-7-8 呼吸法', subtitle:'延长呼气，直接激活迷走神经', type:'breathing', level:'入门', minutes:4, tags:['迷走神经','助眠'],
    principle:'吸气 4 秒、屏息 7 秒、呼气 8 秒。呼气远长于吸气，会改变胸腔压力并刺激迷走神经，使心率下降、血压平稳，是副交感激活最经典、研究最充分的做法，也常用于改善入睡。',
    steps:['舌尖轻抵上颚（门牙后方，全程不动）','闭嘴用鼻吸气，默数 4 秒','屏住呼吸，默数 7 秒','用嘴呼气（像吹蜡烛，发出"呼"声），默数 8 秒','以上为 1 组，重复 4 组；每天可做 2 次'],
    pattern:{inhale:4,hold:7,exhale:8} },
  { id:'box', name:'方块呼吸（箱式呼吸）', subtitle:'4-4-4-4，稳定自主神经', type:'breathing', level:'进阶', minutes:5, tags:['稳定情绪','专注'],
    principle:'吸—屏—呼—屏各 4 秒，形成一个"方块"。等长的四相让呼吸节律高度规律，能快速把过度兴奋的交感神经"拉回"基线，特种部队与高压职业者常用它稳定状态。',
    steps:['用鼻吸气，默数 4 秒','屏住呼吸，默数 4 秒','用鼻/嘴呼气，默数 4 秒','屏住（空肺），默数 4 秒','循环 4~8 轮'],
    pattern:{inhale:4,hold:4,exhale:4,holdAfter:4} },
  { id:'extend', name:'延长呼气呼吸', subtitle:'吸 4 呼 6，最简单日常法', type:'breathing', level:'入门', minutes:3, tags:['随时可做','通勤'],
    principle:'只做一件事：让呼气比吸气长。吸气 4 秒、呼气 6 秒。生理上，呼气相由副交感神经主导，刻意拉长呼气等于"踩油门"给副交感，适合在工位、地铁上随时做。',
    steps:['用鼻轻松吸气，默数 4 秒','用鼻或嘴缓慢呼气，默数 6 秒','保持节奏，做 10~15 个循环','不必追求完美，重点是"呼气更长更慢"'],
    pattern:{inhale:4,exhale:6} },
  { id:'humming', name:'嗡鸣唱诵（Humming）', subtitle:'发声振动，牵拉迷走神经', type:'guide', level:'入门', minutes:3, tags:['迷走神经','无需工具'],
    principle:'声带由迷走神经直接支配。发出"嗡——"的低频振动，会机械性刺激迷走神经分支，提升心率变异性（HRV），带来即时的平静感。瑜伽中的 Bhramari 呼吸即基于此。',
    steps:['闭眼，用鼻吸气','闭唇，发出低沉的"嗡——"声，越长越好','感到面部、鼻腔轻微振动为佳','重复 5~8 次，每次呼气都发声'] },
  { id:'cold', name:'冷面刺激（潜水反射）', subtitle:'冷水敷脸，瞬间降心率', type:'guide', level:'进阶', minutes:1, tags:['冷敷','强刺激'],
    principle:'面部接触冷水会触发"哺乳动物潜水反射"：身体误以为入水，自动减慢心率、收缩外周血管、激活副交感。这是少数能在几十秒内起效的强刺激方法。',
    steps:['准备一盆冷水或冷毛巾','深吸一口气','将脸浸入冷水（或敷冷毛巾）10~30 秒，屏息','抬头换气，重复 2~3 次','注意：如有心肺疾病或不适请勿尝试，避免过冷；这不是急救措施'] },
  { id:'pmr', name:'渐进式肌肉放松（PMR）', subtitle:'先紧后松，释放躯体张力', type:'guide', level:'入门', minutes:10, tags:['躯体放松','睡前'],
    principle:'交感兴奋时常伴随无意识的肌肉紧绷。依次"收紧→放松"各大肌群，利用"放松后抑制"效应，让神经系统体验到明显的松弛对比，从而进入副交感主导。',
    steps:['找个舒服的姿势坐/躺好','从拳头开始：用力握紧 5 秒，然后突然放松，感受差异','依次向上：手臂→肩膀→面部→腹部→腿→脚','每处"紧 5 秒、松 10 秒"','全程配合缓慢呼吸'] },
  { id:'bodyscan', name:'身体扫描冥想', subtitle:'注意力漫游，回到当下', type:'guide', level:'入门', minutes:12, tags:['正念','减压'],
    principle:'把注意力温柔地依次投向身体各部位，能降低默认模式网络过度活跃（焦虑常源于此），把"跑向未来"的思绪拉回身体当下，自然唤起副交感状态。',
    steps:['闭眼，做 3 次延长呼气','把注意力放到脚趾，停留片刻，不评判','像扫描仪一样慢慢向上：脚→腿→腹→胸→手→肩→脸','某处紧张就对它"呼气"','最后感受整个身体的整体感，缓缓睁眼'] },

  /* ===== 生活扩展：日常就能做、有据可循的做法 ===== */
  { id:'footbath', name:'温水泡脚（足浴）', subtitle:'温热扩张血管，副交感上线', type:'guide', cat:'生活扩展', level:'入门', minutes:20, tags:['睡前','助眠'],
    principle:'40℃ 左右的温水泡脚 15~20 分钟，足部温热引发末梢血管扩张，核心体温随后回落，这个"降"的过程由副交感神经主导，并能缩短入睡潜伏期。不少睡眠门诊把它列为非药物助眠的一线做法。',
    steps:['准备一盆 40℃ 左右温水，没过脚踝','泡 15~20 分钟，身体微微发热即可','过程中可配合缓慢呼吸或闭目','泡完立刻擦干，避免受凉','睡前做效果最好'] },
  { id:'nature', name:'自然接触（森林浴）', subtitle:'走进自然，皮质醇自然降', type:'guide', cat:'生活扩展', level:'入门', minutes:30, tags:['户外','减压'],
    principle:'大量研究（如日本"森林浴" Shinrin-yoku）显示，身处自然环境 20~30 分钟，皮质醇、血压、心率都会下降，心率变异性（HRV）上升——这正是副交感占优的标志。视觉、听觉、气味的多重自然刺激共同起作用。',
    steps:['去公园、河边或树下，不必爬山','放慢脚步，不戴耳机','留意树叶的光、风声、泥土味','做几次延长呼气','待 20~30 分钟，让身体"接收"自然'] },
  { id:'laugh', name:'开怀大笑', subtitle:'笑是副交感的天然开关', type:'guide', cat:'生活扩展', level:'入门', minutes:5, tags:['即时','情绪'],
    principle:'大笑会激活副交感神经、降低皮质醇与肾上腺素，并促使内啡肽释放。研究观察到笑过后心率变异性提升、血压回落。哪怕"假装笑"几秒，面部反馈也能轻微触发放松反应。',
    steps:['找一段喜欢的搞笑视频或段子','允许自己大笑出声','笑到肚子微微发紧最好','笑完做几次缓慢呼吸收尾','平时存几个"笑点"备用'] },
  { id:'pet', name:'撸宠物（动物互动）', subtitle:'催产素上升，压力激素下降', type:'guide', cat:'生活扩展', level:'入门', minutes:10, tags:['温情','陪伴'],
    principle:'与猫狗等动物互动会刺激催产素分泌，同时降低皮质醇和血压。催产素被称为"依恋激素"，它能抑制交感活性、增强副交感张力，是一种被进化保留下来的安抚机制。',
    steps:['陪伴自家或朋友的猫狗几分钟','抚摸、轻声说话，专注当下','感受手掌下的温度与呼吸','没有宠物时，看萌宠视频也有轻微效果','把它当作每天的小确幸'] },
  { id:'scent', name:'闻香放松（芳香）', subtitle:'气味直连情绪脑', type:'guide', cat:'生活扩展', level:'入门', minutes:5, tags:['嗅觉','助眠'],
    principle:'嗅觉通路不经过丘脑中转，直接连到杏仁核与边缘系统（情绪中枢）。薰衣草等香气在多项研究中被证明能提升 HRV、降低焦虑评分，是一种"低门槛"的副交感入口。',
    steps:['准备薰衣草、甜橙等精油或香薰','深呼吸闻 3~5 次','闭上眼，把注意力放在气味上','配合延长呼气效果更好','睡前在枕边使用助眠'] },
  { id:'slowwalk', name:'慢走 / 温和散步', subtitle:'节奏运动，把神经"走"回放松', type:'guide', cat:'生活扩展', level:'入门', minutes:15, tags:['日常','通勤'],
    principle:'高强度运动让交感兴奋，但低强度、有节奏的步行属于"主动休息"，能温和提升副交感张力、改善 HRV。饭后慢走还有助血糖平稳，是性价比最高的日常做法。',
    steps:['选平坦、安全的路线','速度以"能轻松说话"为准','手臂自然摆动，配合鼻吸鼻呼','走 10~20 分钟','结束时做几次延长呼气收尾'] },
  { id:'gratitude', name:'感恩三件事', subtitle:'积极书写，安抚压力系统', type:'guide', cat:'生活扩展', level:'入门', minutes:5, tags:['心理','睡前'],
    principle:'积极心理学研究发现，每天写下"三件值得感恩的事"，持续数周可显著降低皮质醇、提升心率变异性与主观幸福感。把注意力从"威胁扫描"转向"资源扫描"，本身就在给交感系统降温。',
    steps:['准备纸笔或手机备忘录','写下今天 3 件让你感激的小事','不必宏大，一杯好茶也算','为每个写一句话感受','睡前做，助眠又安心'] }
];
const emoji = { b478:'🌬️', box:'⬜', extend:'💨', humming:'🔔', cold:'🧊', pmr:'💪', bodyscan:'🧘', footbath:'🛁', nature:'🌿', laugh:'😄', pet:'🐱', scent:'🌸', slowwalk:'🚶', gratitude:'🙏' };

let reminders = [];
let checksDone = [];
let storageReady = false;
async function loadData(){
  const [r,c] = await Promise.all([execute('SELECT time FROM reminders ORDER BY time'), execute('SELECT day FROM checkins ORDER BY day')]);
  reminders=r.rows.map(row=>row[0].value); checksDone=c.rows.map(row=>row[0].value); storageReady=true; renderHome(); renderRemList(); renderStreak();
}
function storageError(){ alert('数据库连接或保存失败，请检查网络后重新打开应用确认数据。'); }
let breathTimer = null, breathStep = 0, breathCycles = 0, seq = [];

const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today = () => fmt(new Date());

function switchTab(v){
  document.querySelectorAll('.view').forEach(e=>e.classList.remove('active'));
  document.getElementById(v).classList.add('active');
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.v===v));
  if(v==='v-home') { renderHome(); renderStreak(); }
  if(v==='v-reminder') renderRemList();
}

/* 日期 */
(function(){
  const d=new Date(), w=['日','一','二','三','四','五','六'][d.getDay()];
  document.getElementById('dateText').textContent = `${d.getMonth()+1} 月 ${d.getDate()} 日 周${w}`;
})();

/* 自检 */
const checks = [
  {key:'heart', label:'心跳偏快 / 胸口发紧', on:false},
  {key:'shallow', label:'呼吸又浅又快', on:false},
  {key:'mind', label:'脑子里停不下念头', on:false},
  {key:'tight', label:'肩颈 / 牙关紧绷', on:false}
];
function renderChecks(){
  document.getElementById('checks').innerHTML = checks.map((c,i)=>
    `<div class="check ${c.on?'on':''}" onclick="toggleCheck(${i})"><div class="dot">${c.on?'✓':''}</div>${c.label}</div>`
  ).join('');
}
function toggleCheck(i){
  checks[i].on=!checks[i].on;
  const score=checks.filter(c=>c.on).length;
  const sug=document.getElementById('sug');
  if(score===0) sug.textContent='状态不错，保持就好。';
  else if(score<=2) sug.textContent='💡 轻度交感兴奋，做一次「延长呼气」就能缓过来。';
  else sug.textContent='💡 交感偏兴奋，建议做一组「4-7-8 呼吸」来帮助放松。';
  sug.style.display='block';
  renderChecks();
}

/* 打卡连续天数 */
function getStreak(dates){
  const set=new Set(dates); let cur=new Date();
  if(!set.has(fmt(cur))){ cur.setDate(cur.getDate()-1); if(!set.has(fmt(cur))) return 0; }
  let n=0; while(set.has(fmt(cur))){ n++; cur.setDate(cur.getDate()-1); }
  return n;
}
function renderStreak(){
  const n=getStreak(checksDone);
  document.getElementById('streakNum').textContent=n;
  const box=document.getElementById('streakBtn');
  if(checksDone.includes(today())) box.innerHTML='<span class="done">今天已练习 ✓</span>';
  else box.innerHTML='<button class="do" onclick="doCheckin()">今天练过了</button>';
}
async function doCheckin(){
  if(!storageReady){ storageError(); return; }
  const day=today();
  try { if(!checksDone.includes(day)){ await execute('INSERT OR IGNORE INTO checkins(day) VALUES (?)', [day]); checksDone.push(day); } } catch(e) { storageError(); return; }
  renderStreak();
  alert('已记下，明天也来一次就更稳了 🌿');
}

/* 方法库（按分类展示） */
const CAT_ORDER = ['呼吸调节','身体放松','生活扩展'];
const catOf = m => m.cat || (m.type==='breathing' ? '呼吸调节' : '身体放松');
function renderMethods(){
  let html = '';
  CAT_ORDER.forEach(cat=>{
    const list = methods.filter(m=>catOf(m)===cat);
    if(!list.length) return;
    html += `<div class="cat-title">${cat}</div>`;
    html += list.map(m=>
      `<div class="m" onclick="openDetail('${m.id}')">
         <div class="e">${emoji[m.id]}</div>
         <div class="b"><div class="n">${m.name}</div><div class="s">${m.subtitle}</div>
         <div><span class="t">${m.level}</span><span class="t">${m.minutes}分钟</span>${m.tags.map(t=>`<span class="t">${t}</span>`).join('')}</div></div>
         <div class="ar">›</div></div>`
    ).join('');
  });
  document.getElementById('methodList').innerHTML = html;
}

/* 详情 */
function openDetail(id){
  const m=methods.find(x=>x.id===id);
  let html=`<div class="card"><div class="title">${m.name}</div><div class="subtitle">${m.subtitle}</div>
    <div style="margin-top:8px">${[m.level,m.minutes+'分钟',...m.tags].map(t=>`<span class="t">${t}</span>`).join('')}</div></div>
    <div class="card"><div class="title">为什么有效</div><div class="principle">${m.principle}</div></div>`;
  if(m.type==='breathing'){
    html+=`<div class="breath"><div class="bphase" id="bphase">准备</div>
      <div class="bwrap"><div class="bcircle" id="bcircle" style="transform:scale(1);transition:transform 1s ease-in-out"><span class="bcount" id="bcount"></span></div></div>
      <div id="bcycles" style="font-size:13px;color:#5e8b86;margin-bottom:10px"></div>
      <button class="btn" id="bbtn" onclick="startBreath('${m.id}')">开始练习</button></div>`;
  } else {
    html+=`<div class="card"><div class="title">怎么做</div><div id="gsteps"></div>
      <button class="btn" id="gbtn" style="margin-top:10px" onclick="startGuide('${m.id}')">开始练习</button></div>`;
  }
  html+=`<div class="card"><div class="subtitle">小兴提醒</div><div class="note" style="margin-top:6px">副交感像肌肉，越练越灵敏。把它当作一天的"系统维护"，比等崩溃了再救更划算。</div></div>`;
  document.getElementById('detailContent').innerHTML=html;
  document.getElementById('_curM').value = m.id;
  switchTab('v-detail');
  if(m.type!=='breathing') renderGuideSteps(m, -1);
}

function startBreath(id){
  const m=methods.find(x=>x.id===id); const p=m.pattern; seq=[];
  seq.push({scale:1.4, sec:p.inhale, text:'吸气'});
  if(p.hold) seq.push({scale:1.4, sec:p.hold, text:'屏息'});
  if(p.exhale) seq.push({scale:1, sec:p.exhale, text:'呼气'});
  if(p.holdAfter) seq.push({scale:1, sec:p.holdAfter, text:'屏息'});
  breathStep=0; breathCycles=0;
  const b=document.getElementById('bbtn'); b.textContent='结束'; b.onclick=()=>stopBreath(false);
  nextBreath();
}
function nextBreath(){
  if(breathCycles>=4){ stopBreath(true); return; }
  if(breathStep>=seq.length){ breathStep=0; breathCycles++; document.getElementById('bcycles').textContent=`已完成 ${breathCycles} / 4 组`; if(breathCycles>=4){ stopBreath(true); return; } }
  const s=seq[breathStep];
  document.getElementById('bphase').textContent=s.text;
  document.getElementById('bcount').textContent=s.sec;
  document.getElementById('bcircle').style.transition=`transform ${s.sec}s ease-in-out`;
  document.getElementById('bcircle').style.transform=`scale(${s.scale})`;
  breathStep++;
  clearInterval(breathTimer);
  breathTimer=setInterval(()=>{
    let c=parseInt(document.getElementById('bcount').textContent)-1;
    if(c<=0){ clearInterval(breathTimer); nextBreath(); }
    else document.getElementById('bcount').textContent=c;
  },1000);
}
function stopBreath(done){
  clearInterval(breathTimer);
  document.getElementById('bphase').textContent=done?'完成 ✅':'已暂停';
  document.getElementById('bcount').textContent='';
  document.getElementById('bcircle').style.transform='scale(1)';
  const b=document.getElementById('bbtn'); b.textContent='开始练习'; b.onclick=()=>startBreath(document.getElementById('_curM').value);
  if(done) doCheckin();
}

function startGuide(id){ renderGuideSteps(methods.find(x=>x.id===id), 0); }
function renderGuideSteps(m, idx){
  document.getElementById('gsteps').innerHTML=m.steps.map((s,i)=>
    `<div class="gstep ${idx===i?'active':''} ${idx>i?'done':''}"><div class="gnum">${idx>i?'✓':i+1}</div>${s}</div>`
  ).join('');
  const btn=document.getElementById('gbtn');
  if(idx===-1){ btn.textContent='开始练习'; btn.onclick=()=>startGuide(m.id); }
  else if(idx>=m.steps.length-1){ btn.textContent='完成 ✓'; btn.onclick=()=>{ renderGuideSteps(m,-1); doCheckin(); }; }
  else { btn.textContent='下一步'; btn.onclick=()=>renderGuideSteps(m, idx+1); }
}

/* 提醒 */
async function addReminder(){
  if(!storageReady){ storageError(); return; }
  const t=document.getElementById('timePick').value;
  if(!/^\d{2}:\d{2}$/.test(t)){ alert('请选择提醒时刻'); return; }
  if(reminders.includes(t)){ alert('该时刻已存在'); return; }
  try { await execute('INSERT OR IGNORE INTO reminders(time) VALUES (?)',[t]); reminders.push(t); reminders.sort(); renderRemList(); renderHome(); } catch(e) { storageError(); }
}
async function delReminder(t){ if(!storageReady){ storageError(); return; } try { await execute('DELETE FROM reminders WHERE time = ?',[t]); reminders=reminders.filter(x=>x!==t); renderRemList(); renderHome(); } catch(e) { storageError(); } }
function renderRemList(){
  const el=document.getElementById('remList');
  if(!reminders.length){ el.innerHTML='<div class="note">还没有提醒，添加几个放松时刻吧。</div>'; return; }
  el.innerHTML=reminders.map(t=>`<div class="item"><span>⏰ ${t}</span><span class="del" onclick="delReminder('${t}')">删除</span></div>`).join('');
}
function renderHome(){
  const now=new Date(); const cur=now.getHours()*60+now.getMinutes();
  let next=null;
  for(const t of reminders){ const [h,m]=t.split(':').map(Number); const mins=h*60+m; if(mins>=cur){ next=t; break; } }
  if(!next) next=reminders.length?reminders[0]+'（明天）':'尚未设置';
  document.getElementById('next').textContent=next;
  document.getElementById('remListHome').innerHTML = reminders.length
    ? reminders.map(t=>`<span class="t">${t}</span>`).join(' ')
    : '<span class="note">还没有提醒，去"提醒"页添加。</span>';
}
function testNotify(){
  if(!('Notification' in window)){ alert('当前浏览器不支持通知，可改用手机闹钟配合。'); return; }
  Notification.requestPermission().then(p=>{
    if(p!=='granted'){ alert('已拒绝通知授权，无法演示；不影响其他方法使用。'); return; }
    setTimeout(()=>{ new Notification('该放松一下了 🌿', { body:'来做一组副交感激活练习吧。' }); }, 10000);
    alert('已设置：10 秒后会弹出系统通知（请保持本页面打开）。');
  });
}

renderChecks(); renderMethods(); renderHome(); renderRemList(); renderStreak();
loadData().catch(storageError);

// Keep scheduled reminders in the open page; browser permission is requested by the test button.
let lastReminderMinute = '';
setInterval(() => {
  const d = new Date();
  const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${time}`;
  if (reminders.includes(time) && key !== lastReminderMinute && 'Notification' in window && Notification.permission === 'granted') {
    lastReminderMinute = key; new Notification('该放松一下了 🌿', {body:'来做一组副交感激活练习吧。'});
  }
}, 1000);
Object.assign(window,{switchTab,toggleCheck,doCheckin,openDetail,startBreath,startGuide,addReminder,delReminder,testNotify,stopBreath});
// Delegate source markup actions without executing inline scripts under the host CSP.
document.addEventListener('click', event => {
  const el = event.target.closest('[onclick]');
  if (!el || typeof el.onclick === 'function') return;
  const action = el.getAttribute('onclick');
  const match = /^([A-Za-z]+)\((?:'([^']*)'|(\d+))?\)$/.exec(action || '');
  if (!match) return;
  const fn = window[match[1]];
  if (typeof fn === 'function') fn(match[2] ?? (match[3] === undefined ? undefined : Number(match[3])));
});
