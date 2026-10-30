export async function mount(root, { files }) {
try {
const style=document.createElement("style");style.textContent="\n:root{--bg:#fff;--fg:#1f2933;--muted:#647084;--line:#e3e8ef;--accent:#2563eb;--chip:#eef2ff;}\n*{box-sizing:border-box}\nbody{margin:0;font-family:-apple-system,\"Segoe UI\",\"Microsoft YaHei\",sans-serif;background:var(--bg);color:var(--fg);font-size:14px;}\nheader{padding:18px 22px;border-bottom:1px solid var(--line);}\nh1{margin:0 0 4px;font-size:20px;}\n.sub{color:var(--muted);font-size:13px;}\n.summary{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;}\n.chip{background:var(--chip);border:1px solid var(--line);border-radius:999px;padding:4px 12px;font-size:13px;}\n.chip b{color:var(--accent);}\n.controls{position:sticky;top:0;background:var(--bg);padding:14px 22px;border-bottom:1px solid var(--line);display:flex;flex-wrap:wrap;gap:10px;align-items:center;z-index:5;}\n.controls input,.controls select{padding:7px 10px;border:1px solid var(--line);border-radius:8px;font-size:13px;background:#fff;color:var(--fg);}\n.controls input[type=text]{min-width:220px;}\n.btn{padding:7px 14px;border:1px solid var(--line);border-radius:8px;background:#f5f7fa;cursor:pointer;font-size:13px;}\n.btn:hover{background:#e9edf3;}\n.count{margin-left:auto;color:var(--muted);font-size:13px;}\ntable{width:100%;border-collapse:collapse;}\nth,td{padding:8px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top;}\nth{background:#f8fafc;font-size:12px;color:var(--muted);cursor:pointer;user-select:none;}\ntbody tr:hover{background:#f6f9ff;}\n.code{font-family:\"SFMono-Regular\",Consolas,monospace;font-size:13px;}\n.name{font-weight:600;}\n.note{color:var(--muted);font-size:12px;}\n.badge{display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;}\n.b-basic{background:#e8f5e9;color:#1b5e20;}\n.b-K{background:#fff3e0;color:#b26a00;}\n.b-T{background:#ede7f6;color:#5e35b1;}\n.b-TK{background:#fde0e0;color:#b71c1c;}\n.cat-tag{font-size:12px;color:var(--muted);}\n.wrap{padding:0 22px 40px;overflow-x:auto;}\n";document.head.appendChild(style);
root.innerHTML="\n<header>\n  <h1>普通高等学校本科专业目录（2026年）</h1>\n  <div class=\"sub\">教育部 · 2026年4月 · 共 <b>883</b> 个具体专业（含基本/特设/控制布点）· 13 学科门类</div>\n  <div class=\"summary\" id=\"summary\"></div>\n</header>\n<div class=\"controls\">\n  <input id=\"q\" placeholder=\"搜索：专业名称 / 代码 / 备注\" type=\"text\">\n  <select id=\"fcat\"></select>\n  <select id=\"fcls\"><option value>全部专业类</option></select>\n  <select id=\"fflag\">\n    <option value>全部备注</option>\n    \n  </select>\n  <button class=\"btn\" id=\"reset\">重置</button>\n  <span class=\"count\" id=\"count\"></span>\n</div>\n<div class=\"wrap\">\n<table>\n  <thead><tr>\n    <th data-k=\"idx\">#</th><th data-k=\"code\">专业代码</th><th data-k=\"name\">专业名称</th>\n    <th data-k=\"cat\">门类</th><th data-k=\"cls\">专业类</th><th data-k=\"flag\">备注</th><th data-k=\"note\">学位备注</th>\n  </tr></thead>\n  <tbody id=\"tb\"></tbody>\n</table>\n</div>\n";

const response = await files.get('template-assets/majors.json');
if (!response.ok) throw new Error('目录资料读取失败');
const DATA = await response.json();
const CATS=["交叉学科", "农学", "医学", "历史学", "哲学", "工学", "教育学", "文学", "法学", "理学", "管理学", "经济学", "艺术学"];
const CLS={"哲学": ["哲学类"], "经济学": ["经济与贸易类", "经济学类", "财政学类", "金融学类"], "法学": ["公安学类", "政治学类", "民族学类", "法学类", "社会学类", "马克思主义理论类"], "教育学": ["体育学类", "教育学类"], "文学": ["中国语言文学类", "外国语言文学类", "新闻传播学类"], "历史学": ["历史学类"], "理学": ["化学类", "地球物理学类", "地理科学类", "地质学类", "大气科学类", "天文学类", "心理学类", "数学类", "海洋科学类", "物理学类", "生物科学类", "统计学类"], "工学": ["交通运输类", "仪器类", "公安技术类", "兵器类", "农业工程类", "力学类", "化工与制药类", "土木类", "地质类", "安全科学与工程类", "建筑类", "机械类", "材料类", "林业工程类", "核工程类", "水利类", "测绘类", "海洋工程类", "环境科学与工程类", "生物医学工程类", "生物工程类", "电子信息类", "电气类", "矿业类", "纺织类", "能源动力类", "自动化类", "航空航天类", "计算机类", "轻工类", "食品科学与工程类"], "农学": ["动物医学类", "动物生产类", "林学类", "植物生产类", "水产类", "自然保护与环境生态类", "草学类"], "医学": ["中医学类", "中药学类", "中西医结合类", "临床医学类", "公共卫生与预防医学类", "医学技术类", "口腔医学类", "基础医学类", "护理学类", "法医学类", "药学类"], "管理学": ["公共管理类", "农业经济管理类", "图书情报与档案管理类", "工业工程类", "工商管理类", "旅游管理类", "物流管理与工程类", "电子商务类", "管理科学与工程类"], "艺术学": ["戏剧与影视学类", "美术学类", "艺术学理论类", "设计学类", "音乐与舞蹈学类"], "交叉学科": ["（直接列专业）"]};
const FLAG={"":"基本专业","K":"国家控制布点(K)","T":"特设专业(T)","TK":"特设+控制(TK)"};
const fc=document.getElementById('fcat');
CATS.forEach(c=>{let o=document.createElement('option');o.value=c;o.textContent=c;fc.appendChild(o);});
fc.insertBefore(new Option('全部门类',''),fc.firstChild);
fc.value='';
const ff=document.getElementById('fflag');
['basic','K','T','TK'].forEach(f=>{let o=document.createElement('option');o.value=f;o.textContent=f==='basic'?'基本专业':FLAG[f];ff.appendChild(o);});
const tb=document.getElementById('tb');
const q=document.getElementById('q'),fcls=document.getElementById('fcls');
let sortK='idx',sortAsc=true;
function render(){
  const qv=q.value.trim().toLowerCase();
  const cv=fc.value, lv=fcls.value, fv=ff.value;
  let arr=DATA.filter(r=>{
    if(qv && !(r.name.toLowerCase().includes(qv)||r.code.includes(qv)||r.note.toLowerCase().includes(qv)))return false;
    if(cv && r.cat!==cv)return false;
    if(lv && r.cls!==lv)return false;
    if(fv && r.flag!==(fv==='basic'?'':fv))return false;
    return true;
  });
  arr.sort((a,b)=>{let x=a[sortK],y=b[sortK];if(sortK==='idx'){x=+x;y=+y;}else{x=(x||'').toString();y=(y||'').toString();}
    if(x<y)return sortAsc?-1:1;if(x>y)return sortAsc?1:-1;return 0;});
  tb.innerHTML=arr.map(r=>{
    const fb=r.flag||'basic';
    return `<tr>
      <td class="code">${r.idx}</td>
      <td class="code">${r.code}${r.flag}</td>
      <td><span class="name">${r.name}</span></td>
      <td class="cat-tag">${r.cat}</td>
      <td class="cat-tag">${r.cls}</td>
      <td><span class="badge b-${fb}">${r.flag?FLAG[r.flag]:'基本'}</span></td>
      <td class="note">${r.note||''}</td>
    </tr>`;
  }).join('');
  document.getElementById('count').textContent='显示 '+arr.length+' / '+DATA.length+' 条';
}
function fillCls(){
  const cv=fc.value; const list=cv?CLS[cv]:[];
  fcls.innerHTML='<option value="">全部专业类</option>'+list.map(c=>`<option value="${c}">${c}</option>`).join('');
}
[fc,fcls,ff].forEach(e=>e.addEventListener('change',()=>{if(e===fc)fillCls();render();}));
q.addEventListener('input',render);
document.getElementById('reset').addEventListener('click',()=>{q.value='';fc.value='';fcls.value='';ff.value='';fillCls();render();});
document.querySelectorAll('th').forEach(th=>th.addEventListener('click',()=>{const k=th.dataset.k;if(sortK===k)sortAsc=!sortAsc;else{sortK=k;sortAsc=true;}render();}));
// summary chips
const sc=document.getElementById('summary');
const flagcnt={"":319,"K":33,"T":390,"TK":141};
sc.innerHTML=
  `<span class="chip">基本专业 <b>${flagcnt['']}</b></span>`+
  `<span class="chip">国家控制(K) <b>${flagcnt['K']}</b></span>`+
  `<span class="chip">特设(T) <b>${flagcnt['T']}</b></span>`+
  `<span class="chip">特设+控制(TK) <b>${flagcnt['TK']}</b></span>`;
DATA.forEach((r,i)=>r.idx=i+1);
fillCls();render();

} catch (error) { root.textContent = "目录资料加载失败，请刷新后重试。"; console.error(error); }
}
