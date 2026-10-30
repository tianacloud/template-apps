import {sql} from './db.js';
document.title = "买菜记账";
const style=document.createElement("style"); style.textContent="\n:root{\n  --bg:#f4f7f5;\n  --card:#ffffff;\n  --ink:#1f2a24;\n  --ink-2:#5c6b62;\n  --ink-3:#8a978f;\n  --line:#e7ede9;\n  --primary:#22a06b;\n  --primary-deep:#1a8156;\n  --primary-soft:#e7f5ee;\n  --warn:#e53935;\n  --warn-soft:#fdecea;\n  --radius:16px;\n  --shadow:0 1px 2px rgba(20,40,30,.04),0 8px 24px rgba(20,40,30,.06);\n  --shadow-lg:0 12px 40px rgba(20,40,30,.14);\n}\n*{box-sizing:border-box;margin:0;padding:0}\nhtml{-webkit-text-size-adjust:100%}\nbody{\n  font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n  background:var(--bg);color:var(--ink);\n  line-height:1.5;min-height:100vh;\n}\nbutton{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}\ninput,select,textarea{font-family:inherit;font-size:14px;color:var(--ink)}\n::-webkit-scrollbar{width:10px;height:10px}\n::-webkit-scrollbar-thumb{background:#cdd8d1;border-radius:8px;border:2px solid var(--bg)}\n::-webkit-scrollbar-thumb:hover{background:#b6c4bc}\n\n/* 顶部栏 */\n.topbar{\n  position:sticky;top:0;z-index:20;\n  background:rgba(255,255,255,.85);backdrop-filter:blur(12px);\n  border-bottom:1px solid var(--line);\n}\n.topbar-inner{\n  max-width:1120px;margin:0 auto;padding:14px 20px;\n  display:flex;align-items:center;gap:14px;\n}\n.logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px}\n.logo .mark{\n  width:34px;height:34px;border-radius:10px;\n  background:linear-gradient(135deg,#2fbf82,#178a5b);\n  display:flex;align-items:center;justify-content:center;color:#fff;font-size:19px;\n}\n.logo small{font-weight:400;font-size:12px;color:var(--ink-3);display:block;margin-top:-2px}\n.spacer{flex:1}\n.month-nav{display:flex;align-items:center;gap:6px;background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:4px}\n.month-nav button{width:32px;height:32px;border-radius:9px;font-size:16px;color:var(--ink-2);display:flex;align-items:center;justify-content:center;transition:.15s}\n.month-nav button:hover{background:var(--primary-soft);color:var(--primary-deep)}\n.month-nav .label{min-width:110px;text-align:center;font-weight:600;font-size:14px}\n.icon-btn{\n  width:40px;height:40px;border-radius:11px;background:var(--card);\n  border:1px solid var(--line);display:flex;align-items:center;justify-content:center;\n  font-size:18px;color:var(--ink-2);transition:.15s;position:relative;\n}\n.icon-btn:hover{background:var(--bg);color:var(--ink)}\n\n/* 主容器 */\n.wrap{max-width:1120px;margin:0 auto;padding:24px 20px 80px}\n\n/* 统计卡片 */\n.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px}\n.stat{\n  background:var(--card);border:1px solid var(--line);border-radius:var(--radius);\n  padding:18px 20px;box-shadow:var(--shadow);position:relative;overflow:hidden;\n}\n.stat .k{font-size:13px;color:var(--ink-3);display:flex;align-items:center;gap:6px}\n.stat .v{font-size:28px;font-weight:800;margin-top:8px;letter-spacing:-.5px}\n.stat .v small{font-size:14px;font-weight:600;color:var(--ink-2)}\n.stat .sub{font-size:12px;color:var(--ink-3);margin-top:4px}\n.stat.hl{background:linear-gradient(135deg,#1d9c6c,#178a5b);border:none;color:#fff}\n.stat.hl .k{color:rgba(255,255,255,.8)}\n.stat.hl .v small{color:rgba(255,255,255,.85)}\n.stat.hl .sub{color:rgba(255,255,255,.75)}\n\n/* 两栏 */\n.grid{display:grid;grid-template-columns:380px 1fr;gap:16px;align-items:start}\n.panel{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}\n.panel-h{padding:16px 20px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between}\n.panel-h h2{font-size:15px;font-weight:700}\n.panel-h .hint{font-size:12px;color:var(--ink-3)}\n.panel-b{padding:16px 20px}\n\n/* 环形图 */\n.donut-wrap{display:flex;align-items:center;gap:20px}\n.donut{position:relative;flex-shrink:0}\n.donut svg{display:block}\n.donut .center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}\n.donut .center .num{font-size:22px;font-weight:800}\n.donut .center .txt{font-size:11px;color:var(--ink-3)}\n.legend{flex:1;display:flex;flex-direction:column;gap:8px;min-width:0}\n.legend .item{display:flex;align-items:center;gap:8px;font-size:13px}\n.legend .dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}\n.legend .name{color:var(--ink-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.legend .bar{flex:1;height:6px;background:var(--bg);border-radius:4px;overflow:hidden;min-width:30px}\n.legend .bar i{display:block;height:100%;border-radius:4px}\n.legend .amt{margin-left:auto;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}\n\n/* 趋势图 */\n.trend-bars{display:flex;align-items:flex-end;gap:6px;height:150px;padding-top:10px}\n.trend-bars .col{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end}\n.trend-bars .col .v{font-size:10px;color:var(--ink-3);opacity:0;transition:.2s}\n.trend-bars .col:hover .v{opacity:1}\n.trend-bars .bar{width:100%;max-width:34px;background:var(--primary-soft);border-radius:6px 6px 3px 3px;position:relative;transition:.2s;min-height:2px}\n.trend-bars .bar:hover{background:var(--primary)}\n.trend-bars .col .d{font-size:10px;color:var(--ink-3);white-space:nowrap}\n\n/* 工具栏 */\n.toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px}\n.search{flex:1;min-width:180px;display:flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--line);border-radius:11px;padding:0 12px}\n.search input{border:none;background:none;outline:none;height:40px;flex:1;font-size:14px}\n.search .ico{color:var(--ink-3);font-size:15px}\n.select{\n  height:40px;padding:0 34px 0 12px;border:1px solid var(--line);border-radius:11px;\n  background:var(--card) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a978f' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\") no-repeat right 12px center;\n  appearance:none;-webkit-appearance:none;outline:none;cursor:pointer;color:var(--ink);\n}\n.select:focus{border-color:var(--primary)}\n.ghost-btn{\n  height:40px;padding:0 14px;border-radius:11px;border:1px solid var(--line);\n  background:var(--card);color:var(--ink-2);font-size:13px;font-weight:600;\n  display:flex;align-items:center;gap:6px;transition:.15s;\n}\n.ghost-btn:hover{background:var(--bg);color:var(--ink)}\n\n/* 明细列表 */\n.list{display:flex;flex-direction:column}\n.row{\n  display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid var(--line);\n  transition:.12s;position:relative;\n}\n.row:last-child{border-bottom:none}\n.row:hover{background:#fafcfb}\n.row .cat{\n  width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;\n  font-size:20px;flex-shrink:0;\n}\n.row .main{flex:1;min-width:0}\n.row .main .name{font-weight:600;font-size:14px;display:flex;align-items:center;gap:8px}\n.row .main .name .tag{font-size:10px;color:var(--ink-3);background:var(--bg);padding:1px 7px;border-radius:20px;font-weight:500}\n.row .main .meta{font-size:12px;color:var(--ink-3);margin-top:2px}\n.row .amt{font-weight:700;font-size:15px;font-variant-numeric:tabular-nums;white-space:nowrap}\n.row .acts{display:flex;gap:4px;opacity:0;transition:.15s}\n.row:hover .acts{opacity:1}\n.mini-btn{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--ink-3);transition:.12s}\n.mini-btn:hover{background:var(--bg);color:var(--ink)}\n.mini-btn.del:hover{background:var(--warn-soft);color:var(--warn)}\n.empty{text-align:center;padding:60px 20px;color:var(--ink-3)}\n.empty .em{font-size:44px;margin-bottom:12px}\n.empty p{font-size:14px}\n\n/* 悬浮添加按钮 */\n.fab{\n  position:fixed;right:28px;bottom:28px;z-index:30;\n  width:56px;height:56px;border-radius:18px;\n  background:linear-gradient(135deg,#2fbf82,#178a5b);color:#fff;font-size:28px;\n  box-shadow:0 8px 24px rgba(23,138,91,.4);display:flex;align-items:center;justify-content:center;\n  transition:.18s;\n}\n.fab:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(23,138,91,.5)}\n.fab:active{transform:scale(.96)}\n\n/* 弹窗 */\n.mask{\n  position:fixed;inset:0;background:rgba(20,30,24,.4);backdrop-filter:blur(3px);\n  display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;\n  opacity:0;pointer-events:none;transition:.2s;\n}\n.mask.show{opacity:1;pointer-events:auto}\n.modal{\n  width:100%;max-width:440px;background:var(--card);border-radius:20px;box-shadow:var(--shadow-lg);\n  transform:translateY(16px) scale(.97);transition:.2s;max-height:92vh;display:flex;flex-direction:column;\n}\n.mask.show .modal{transform:none}\n.modal-h{padding:20px 24px 0;display:flex;align-items:center;justify-content:space-between}\n.modal-h h3{font-size:17px;font-weight:700}\n.modal-h .x{width:32px;height:32px;border-radius:9px;font-size:18px;color:var(--ink-3);display:flex;align-items:center;justify-content:center}\n.modal-h .x:hover{background:var(--bg)}\n.modal-b{padding:20px 24px;overflow-y:auto}\n.field{margin-bottom:14px}\n.field label{display:block;font-size:12px;color:var(--ink-2);font-weight:600;margin-bottom:6px}\n.field input,.field select,.field textarea{\n  width:100%;height:44px;padding:0 12px;border:1px solid var(--line);border-radius:11px;\n  background:var(--bg);outline:none;transition:.15s;font-size:14px;\n}\n.field textarea{height:auto;min-height:64px;padding:10px 12px;resize:vertical}\n.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--primary);background:#fff}\n.field .row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}\n.cat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}\n.cat-opt{\n  padding:9px 6px;border:1px solid var(--line);border-radius:11px;text-align:center;\n  font-size:12px;color:var(--ink-2);cursor:pointer;transition:.12s;display:flex;flex-direction:column;gap:3px;align-items:center;\n}\n.cat-opt .ic{font-size:18px}\n.cat-opt:hover{border-color:var(--primary)}\n.cat-opt.on{border-color:var(--primary);background:var(--primary-soft);color:var(--primary-deep);font-weight:600}\n.modal-f{padding:16px 24px 22px;border-top:1px solid var(--line);display:flex;gap:10px}\n.btn{\n  flex:1;height:46px;border-radius:12px;font-size:15px;font-weight:700;transition:.15s;\n}\n.btn.primary{background:linear-gradient(135deg,#2fbf82,#178a5b);color:#fff;box-shadow:0 6px 16px rgba(23,138,91,.28)}\n.btn.primary:hover{filter:brightness(1.05)}\n.btn.plain{background:var(--bg);color:var(--ink-2)}\n.btn.plain:hover{background:#e9efeb}\n.btn.danger{background:var(--warn-soft);color:var(--warn)}\n.btn.danger:hover{background:#f8d7d4}\n\n/* toast */\n.toast{\n  position:fixed;left:50%;bottom:30px;transform:translateX(-50%) translateY(20px);\n  background:#1f2a24;color:#fff;padding:11px 20px;border-radius:12px;font-size:14px;\n  box-shadow:0 8px 30px rgba(0,0,0,.25);z-index:200;opacity:0;pointer-events:none;transition:.25s;\n}\n.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}\n\n@media(max-width:860px){\n  .stats{grid-template-columns:repeat(2,1fr)}\n  .grid{grid-template-columns:1fr}\n  .row .acts{opacity:1}\n}\n@media(max-width:480px){\n  .stats{grid-template-columns:repeat(2,1fr);gap:10px}\n  .stat{padding:14px}\n  .stat .v{font-size:22px}\n  .topbar-inner{padding:12px 14px}\n  .month-nav .label{min-width:86px}\n  .wrap{padding:16px 14px 90px}\n  .donut-wrap{flex-direction:column}\n}\n"; document.head.appendChild(style);
document.getElementById("app").innerHTML="\n\n<header class=\"topbar\">\n  <div class=\"topbar-inner\">\n    <div class=\"logo\">\n      <span class=\"mark\">🥬</span>\n      <div>买菜记账<small>今天花了多少？记下来</small></div>\n    </div>\n    <div class=\"spacer\"></div>\n    <div class=\"month-nav\">\n      <button id=\"prevM\" title=\"上个月\">‹</button>\n      <span class=\"label\" id=\"monthLabel\"></span>\n      <button id=\"nextM\" title=\"下个月\">›</button>\n    </div>\n    <button class=\"icon-btn\" id=\"btnExport\" title=\"导出数据\">⤓</button>\n  </div>\n</header>\n\n<main class=\"wrap\">\n  <section class=\"stats\">\n    <div class=\"stat hl\">\n      <div class=\"k\">本月支出</div>\n      <div class=\"v\" id=\"stMonth\">¥<small></small></div>\n      <div class=\"sub\" id=\"stMonthSub\"></div>\n    </div>\n    <div class=\"stat\">\n      <div class=\"k\">本月笔数</div>\n      <div class=\"v\" id=\"stCount\">0<small> 笔</small></div>\n      <div class=\"sub\" id=\"stCountSub\"></div>\n    </div>\n    <div class=\"stat\">\n      <div class=\"k\">今日支出</div>\n      <div class=\"v\" id=\"stToday\">¥<small></small></div>\n      <div class=\"sub\" id=\"stTodaySub\"></div>\n    </div>\n    <div class=\"stat\">\n      <div class=\"k\">月日均</div>\n      <div class=\"v\" id=\"stAvg\">¥<small></small></div>\n      <div class=\"sub\" id=\"stAvgSub\"></div>\n    </div>\n  </section>\n\n  <div class=\"grid\">\n    <div class=\"panel\">\n      <div class=\"panel-h\"><h2>分类占比</h2><span class=\"hint\" id=\"catHint\">本月</span></div>\n      <div class=\"panel-b\">\n        <div class=\"donut-wrap\">\n          <div class=\"donut\" id=\"donut\"></div>\n          <div class=\"legend\" id=\"legend\"></div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"panel\">\n      <div class=\"panel-h\"><h2>支出趋势</h2><span class=\"hint\" id=\"trendHint\">近 14 天</span></div>\n      <div class=\"panel-b\">\n        <div class=\"trend-bars\" id=\"trend\"></div>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"panel\" style=\"margin-top:16px\">\n    <div class=\"panel-h\">\n      <h2>明细</h2>\n      <span class=\"hint\" id=\"listCount\"></span>\n    </div>\n    <div style=\"padding:16px 20px 0\">\n      <div class=\"toolbar\">\n        <div class=\"search\">\n          <span class=\"ico\">🔍</span>\n          <input id=\"q\" type=\"text\" placeholder=\"搜索品名、地点、备注…\">\n        </div>\n        <select class=\"select\" id=\"catFilter\">\n          <option value=\"\">全部分类</option>\n        </select>\n        <select class=\"select\" id=\"sortBy\">\n          <option value=\"date-desc\">日期 新→旧</option>\n          <option value=\"date-asc\">日期 旧→新</option>\n          <option value=\"amt-desc\">金额 高→低</option>\n          <option value=\"amt-asc\">金额 低→高</option>\n        </select>\n        <button class=\"ghost-btn\" id=\"btnClearFilter\">重置</button>\n      </div>\n    </div>\n    <div class=\"list\" id=\"list\"></div>\n  </div>\n</main>\n\n<button class=\"fab\" id=\"fab\" title=\"记一笔\">+</button>\n\n<!-- 记账弹窗 -->\n<div class=\"mask\" id=\"mask\">\n  <div class=\"modal\">\n    <div class=\"modal-h\">\n      <h3 id=\"modalTitle\">记一笔</h3>\n      <button class=\"x\" id=\"modalClose\">×</button>\n    </div>\n    <div class=\"modal-b\">\n      <div class=\"field\">\n        <label>品名 *</label>\n        <input id=\"fName\" type=\"text\" placeholder=\"例如：西红柿、五花肉\" maxlength=\"30\">\n      </div>\n      <div class=\"field\">\n        <label>分类</label>\n        <div class=\"cat-grid\" id=\"catGrid\"></div>\n      </div>\n      <div class=\"field\">\n        <label>金额（元）*</label>\n        <div class=\"row2\">\n          <input id=\"fAmount\" type=\"number\" inputmode=\"decimal\" placeholder=\"0.00\" step=\"0.01\" min=\"0\">\n          <input id=\"fPlace\" type=\"text\" placeholder=\"购买地点（选填）\" maxlength=\"30\">\n        </div>\n      </div>\n      <div class=\"field\">\n        <label>数量 / 日期</label>\n        <div class=\"row2\">\n          <div style=\"display:flex;gap:8px\">\n            <input id=\"fQty\" type=\"number\" inputmode=\"decimal\" placeholder=\"数量\" step=\"0.1\" min=\"0\" style=\"width:60%\">\n            <select id=\"fUnit\" class=\"select\" style=\"width:40%;height:44px;background-color:var(--bg)\">\n              <option value=\"斤\">斤</option>\n              <option value=\"公斤\">公斤</option>\n              <option value=\"个\">个</option>\n              <option value=\"盒\">盒</option>\n              <option value=\"袋\">袋</option>\n              <option value=\"把\">把</option>\n              <option value=\"瓶\">瓶</option>\n              <option value=\"份\">份</option>\n              <option value=\"\">无</option>\n            </select>\n          </div>\n          <input id=\"fDate\" type=\"date\">\n        </div>\n      </div>\n      <div class=\"field\">\n        <label>备注</label>\n        <textarea id=\"fNote\" placeholder=\"选填，例如：特价、孩子爱吃…\" maxlength=\"100\"></textarea>\n      </div>\n    </div>\n    <div class=\"modal-f\">\n      <button class=\"btn plain\" id=\"btnDelete\" style=\"display:none\">删除</button>\n      <button class=\"btn primary\" id=\"btnSave\">保存</button>\n    </div>\n  </div>\n</div>\n\n<div class=\"toast\" id=\"toast\"></div>\n\n";

(function(){
  "use strict";

  // ===== 分类配置 =====
  const CATS = [
    {id:'veg',   name:'蔬菜',   icon:'🥬', color:'#4caf50'},
    {id:'fruit', name:'水果',   icon:'🍎', color:'#ff9800'},
    {id:'meat',  name:'肉禽蛋', icon:'🥩', color:'#e53935'},
    {id:'fish',  name:'水产海鲜',icon:'🐟', color:'#1e88e5'},
    {id:'grain', name:'粮油米面',icon:'🌾', color:'#8d6e63'},
    {id:'spice', name:'调味品', icon:'🧂', color:'#7e57c2'},
    {id:'dairy', name:'乳品饮料',icon:'🥛', color:'#00acc1'},
    {id:'snack', name:'零食',   icon:'🍪', color:'#ec407a'},
    {id:'other', name:'其他',   icon:'🛒', color:'#9e9e9e'},
  ];
  const catById = id => CATS.find(c=>c.id===id) || CATS[CATS.length-1];

  // ===== 数据 =====
  let records = [];
  let busy = true;
  async function refreshRecords(){
    const rows = await sql('SELECT data FROM grocery_records');
    records = rows.map(row => JSON.parse(row.data));
    renderAll();
  }
  async function persist(statement, args, success){
    if(busy) return;
    busy = true;
    try { await sql(statement, args); await refreshRecords(); success(); }
    catch(error) { toast('保存结果未确认，请刷新核对后再操作'); return; }
    busy = false;
  }
  function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
  function fmtDate(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }

  // ===== 状态 =====
  let viewYM = (()=>{ const n=new Date(); return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0'); })();
  let catFilter = '', q = '', sortBy='date-desc';
  let editingId = null;

  // ===== 工具 =====
  const $ = id => document.getElementById(id);
  const money = n => (Math.round(n*100)/100).toFixed(2);
  const fmtAmount = n => money(n).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1');
  function todayStr(){ return fmtDate(new Date()); }

  // ===== 渲染 =====
  function renderAll(){ renderStats(); renderDonut(); renderTrend(); renderList(); }

  function monthRecords(){
    return records.filter(r=>r.date && r.date.slice(0,7)===viewYM);
  }
  function filtered(){
    let arr = monthRecords();
    if(catFilter) arr = arr.filter(r=>r.category===catFilter);
    if(q){ const k=q.trim().toLowerCase(); arr=arr.filter(r=>(r.name||'').toLowerCase().includes(k)||(r.place||'').toLowerCase().includes(k)||(r.note||'').toLowerCase().includes(k)); }
    const dir = sortBy.endsWith('asc')?1:-1;
    if(sortBy.startsWith('amt')) arr.sort((a,b)=>(a.amount-b.amount)*dir);
    else arr.sort((a,b)=>(a.date===b.date? (a.createdAt||0)-(b.createdAt||0) : (a.date<b.date?-1:1))*dir);
    return arr;
  }

  function renderStats(){
    const m = monthRecords();
    const total = m.reduce((s,r)=>s+r.amount,0);
    const count = m.length;
    const today = m.filter(r=>r.date===todayStr()).reduce((s,r)=>s+r.amount,0);
    const days = new Date(parseInt(viewYM.slice(0,4)), parseInt(viewYM.slice(5,7)), 0).getDate();
    const avg = total/days;

    $('stMonth').innerHTML = '¥<small>'+money(total)+'</small>';
    $('stMonthSub').textContent = count+' 笔记录';
    $('stCount').innerHTML = count+'<small> 笔</small>';
    $('stCountSub').textContent = '累计 ¥'+money(total);
    $('stToday').innerHTML = '¥<small>'+money(today)+'</small>';
    $('stTodaySub').textContent = '今天 '+todayStr().slice(5).replace('-','/');
    $('stAvg').innerHTML = '¥<small>'+money(avg)+'</small>';
    $('stAvgSub').textContent = '平均每天';

    const [y,mth] = viewYM.split('-').map(Number);
    $('monthLabel').textContent = y+' 年 '+mth+' 月';
    $('catHint').textContent = viewYM.replace('-',' 年 ')+' 月';
  }

  // 环形图
  function renderDonut(){
    const m = monthRecords();
    const agg = {};
    m.forEach(r=>{ agg[r.category]=(agg[r.category]||0)+r.amount; });
    const total = m.reduce((s,r)=>s+r.amount,0);
    const entries = CATS.map(c=>({c, val:agg[c.id]||0})).filter(e=>e.val>0).sort((a,b)=>b.val-a.val);

    const R=70, C=2*Math.PI*R, size=170;
    if(!total || !entries.length){
      $('donut').innerHTML = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;color:var(--ink-3);font-size:13px;text-align:center">本月还没有<br>记账记录</div>`;
      $('legend').innerHTML = '';
      return;
    }
    let offset=0, segs='';
    entries.forEach(e=>{
      const frac=e.val/total;
      const dash=frac*C;
      segs += `<circle cx="85" cy="85" r="${R}" fill="none" stroke="${e.c.color}" stroke-width="26" stroke-dasharray="${dash} ${C-dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 85 85)"></circle>`;
      offset += dash;
    });
    $('donut').innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="85" cy="85" r="${R}" fill="none" stroke="var(--bg)" stroke-width="26"></circle>
        ${segs}
      </svg>
      <div class="center"><div class="num">¥${fmtAmount(total)}</div><div class="txt">${m.length} 笔</div></div>`;
    $('legend').innerHTML = entries.slice(0,6).map(e=>{
      const pct=(e.val/total*100).toFixed(0);
      return `<div class="item"><span class="dot" style="background:${e.c.color}"></span>
        <span class="name">${e.c.icon} ${e.c.name}</span>
        <span class="bar"><i style="width:${pct}%;background:${e.c.color}"></i></span>
        <span class="amt">¥${fmtAmount(e.val)}</span></div>`;
    }).join('');
  }

  // 趋势柱状图
  function renderTrend(){
    const days=14, max=170, today=new Date();
    const labels=[], vals=[];
    let maxVal=0;
    for(let i=days-1;i>=0;i--){
      const d=new Date(today); d.setDate(today.getDate()-i);
      const ds=fmtDate(d);
      const v=records.filter(r=>r.date===ds).reduce((s,r)=>s+r.amount,0);
      labels.push({ds, week:['日','一','二','三','四','五','六'][d.getDay()], day:d.getDate()});
      vals.push(v); if(v>maxVal)maxVal=v;
    }
    const H=150, top=Math.max(maxVal,1)*1.15;
    $('trend').innerHTML = labels.map((l,i)=>{
      const h = Math.max(vals[i]>0?2:0, vals[i]/top*H);
      const isToday = l.ds===todayStr();
      return `<div class="col" title="${l.ds}  ¥${money(vals[i])}">
        <span class="v">${vals[i]>0?fmtAmount(vals[i]):''}</span>
        <div class="bar" style="height:${h}px;${isToday?'background:var(--primary);':''}"></div>
        <span class="d" style="${isToday?'color:var(--primary-deep);font-weight:700':''}">${l.day}</span>
      </div>`;
    }).join('');
  }

  // 明细列表
  function renderList(){
    const arr = filtered();
    const list = $('list');
    $('listCount').textContent = '共 '+arr.length+' 笔 · 合计 ¥'+money(arr.reduce((s,r)=>s+r.amount,0));
    if(!arr.length){
      list.innerHTML = `<div class="empty"><div class="em">🧺</div><p>这个月还没有记录，点右下角「+」记一笔吧</p></div>`;
      return;
    }
    list.innerHTML = arr.map(r=>{
      const c=catById(r.category);
      const meta=[];
      if(r.qty) meta.push(r.qty+(r.unit||''));
      if(r.place) meta.push(r.place);
      return `<div class="row" data-id="${r.id}">
        <div class="cat" style="background:${c.color}1a">${c.icon}</div>
        <div class="main">
          <div class="name">${esc(r.name)}<span class="tag">${c.name}</span></div>
          <div class="meta">${meta.length?esc(meta.join(' · '))+'　':''}${r.date.slice(5).replace('-','/')}${r.note?'　💬'+esc(r.note):''}</div>
        </div>
        <div class="amt">¥${fmtAmount(r.amount)}</div>
        <div class="acts">
          <button class="mini-btn" data-act="edit" title="编辑">✎</button>
          <button class="mini-btn del" data-act="del" title="删除">🗑</button>
        </div>
      </div>`;
    }).join('');
  }
  function esc(s){ return String(s||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }

  // 分类筛选下拉
  function renderCatFilter(){
    $('catFilter').innerHTML = '<option value="">全部分类</option>'+
      CATS.map(c=>`<option value="${c.id}" ${c.id===catFilter?'selected':''}>${c.icon} ${c.name}</option>`).join('');
  }

  // ===== 弹窗 =====
  function buildCatGrid(selected){
    $('catGrid').innerHTML = CATS.map(c=>`
      <div class="cat-opt ${c.id===selected?'on':''}" data-cat="${c.id}">
        <span class="ic">${c.icon}</span>${c.name}
      </div>`).join('');
  }
  function openModal(id){
    editingId = id || null;
    const r = id ? records.find(x=>x.id===id) : null;
    $('modalTitle').textContent = r ? '编辑记录' : '记一笔';
    $('btnDelete').style.display = r ? 'block' : 'none';
    $('fName').value = r?r.name:'';
    $('fAmount').value = r?(r.amount===0?'':r.amount):'';
    $('fPlace').value = r?r.place:'';
    $('fQty').value = r?(r.qty||''):'';
    $('fUnit').value = r?(r.unit||''):'斤';
    $('fDate').value = r?r.date:todayStr();
    $('fNote').value = r?r.note:'';
    buildCatGrid(r?r.category:'veg');
    $('mask').classList.add('show');
    setTimeout(()=>$('fName').focus(),150);
  }
  function closeModal(){ $('mask').classList.remove('show'); editingId=null; }

  function collectForm(){
    const name=$('fName').value.trim();
    const amount=parseFloat($('fAmount').value);
    const cat=$('catGrid').querySelector('.on')?.dataset.cat || 'other';
    const qty=parseFloat($('fQty').value)||null;
    const unit=qty? $('fUnit').value : '';
    if(!name){ toast('请填写品名'); $('fName').focus(); return null; }
    if(isNaN(amount)||amount<=0){ toast('请填写正确的金额'); $('fAmount').focus(); return null; }
    return {
      id: editingId || uid(),
      name, amount:Math.round(amount*100)/100, category:cat,
      qty, unit,
      place:$('fPlace').value.trim(),
      date:$('fDate').value || todayStr(),
      note:$('fNote').value.trim(),
      createdAt: editingId ? (records.find(x=>x.id===editingId)?.createdAt||Date.now()) : Date.now(),
    };
  }

  function saveRecord(){
    const data = collectForm(); if(!data) return;
    persist('INSERT INTO grocery_records(id,data) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data', [data.id,JSON.stringify(data)], ()=>{closeModal(); toast('已保存');});
  }
  function deleteRecord(){
    if(!editingId || !confirm('确定删除这条记录吗？')) return;
    persist('DELETE FROM grocery_records WHERE id=?', [editingId], ()=>{closeModal(); toast('已删除');});
  }

  // ===== 导出 / 导入 =====
  function exportCSV(){
    if(!records.length){ toast('暂无数据'); return; }
    const head=['品名','分类','金额(元)','数量','单位','地点','日期','备注'];
    const rows=records.map(r=>[r.name,catById(r.category).name,r.amount,r.qty||'',r.unit||'',r.place||'',r.date,r.note||'']);
    const csv='\uFEFF'+[head,...rows].map(line=>line.map(c=>{c=String(c);return /[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c;}).join(',')).join('\r\n');
    download(csv,'买菜记账_'+viewYM+'.csv','text/csv;charset=utf-8');
    toast('CSV 已导出（可用 Excel 打开）');
  }
  function exportJSON(){
    if(!records.length){ toast('暂无数据'); return; }
    download(JSON.stringify(records,null,2),'买菜记账_备份_'+todayStr()+'.json','application/json');
    toast('备份已导出');
  }
  function download(content, filename, mime){
    const blob=new Blob([content],{type:mime});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob); a.download=filename;
    document.body.appendChild(a); a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},300);
  }
  function importJSON(file){
    const reader=new FileReader();
    reader.onload=e=>{
      try{
        const arr=JSON.parse(e.target.result);
        if(!Array.isArray(arr)) throw 0;
        const clean=arr.filter(r=>r && typeof r.name==='string' && r.name.trim() && Number.isFinite(r.amount) && r.amount>0 && typeof r.date==='string' && /^\d{4}-\d{2}-\d{2}$/.test(r.date)).map(r=>({id:uid(),name:r.name.slice(0,30),amount:r.amount,category:CATS.some(c=>c.id===r.category)?r.category:'other',qty:Number.isFinite(r.qty)?r.qty:null,unit:typeof r.unit==='string'?r.unit.slice(0,12):'',place:typeof r.place==='string'?r.place.slice(0,30):'',date:r.date,note:typeof r.note==='string'?r.note.slice(0,100):'',createdAt:Number.isFinite(r.createdAt)?r.createdAt:Date.now()}));
        if(!clean.length) throw 0;
        if(!confirm('导入 '+clean.length+' 条记录（追加到现有数据），继续？')) return;
        const imported=clean.map(r=>({...r,id:uid()}));
        persist("INSERT INTO grocery_records(id,data) SELECT json_extract(value, '$.id'), value FROM json_each(?)", [JSON.stringify(imported)], ()=>toast('已导入 '+imported.length+' 条'));
      }catch(err){ toast('文件格式不正确'); }
    };
    reader.readAsText(file);
  }

  function toast(msg){
    const t=$('toast'); t.textContent=msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove('show'),1800);
  }

  // ===== 事件 =====
  $('fab').onclick=()=>openModal();
  $('modalClose').onclick=closeModal;
  $('btnSave').onclick=saveRecord;
  $('btnDelete').onclick=deleteRecord;
  $('mask').addEventListener('click',e=>{ if(e.target===$('mask')) closeModal(); });

  $('catGrid').addEventListener('click',e=>{
    const el=e.target.closest('.cat-opt'); if(!el) return;
    $('catGrid').querySelectorAll('.cat-opt').forEach(x=>x.classList.remove('on'));
    el.classList.add('on');
  });

  $('prevM').onclick=()=>{ viewYM=shiftYM(-1); renderAll(); };
  $('nextM').onclick=()=>{ viewYM=shiftYM(1); renderAll(); };
  function shiftYM(d){
    let [y,m]=viewYM.split('-').map(Number); m+=d;
    if(m<1){y--;m=12;} if(m>12){y++;m=1;}
    return y+'-'+String(m).padStart(2,'0');
  }

  $('catFilter').onchange=e=>{ catFilter=e.target.value; renderList(); };
  $('sortBy').onchange=e=>{ sortBy=e.target.value; renderList(); };
  $('q').addEventListener('input',e=>{ q=e.target.value; renderList(); });
  $('btnClearFilter').onclick=()=>{ catFilter=''; q=''; $('q').value=''; $('catFilter').value=''; $('sortBy').value='date-desc'; sortBy='date-desc'; renderList(); };

  $('list').addEventListener('click',e=>{
    const btn=e.target.closest('[data-act]'); if(!btn) return;
    const id=e.target.closest('.row')?.dataset.id;
    if(btn.dataset.act==='edit') openModal(id);
    else if(btn.dataset.act==='del'){
      const r=records.find(x=>x.id===id);
      if(r && confirm('删除「'+r.name+'」这笔记录？')){
        persist('DELETE FROM grocery_records WHERE id=?', [id], ()=>toast('已删除'));
      }
    }
  });

  // 导出按钮 → 简单菜单
  let exportMenu=null;
  $('btnExport').onclick=()=>{
    if(exportMenu){ exportMenu.remove(); exportMenu=null; return; }
    exportMenu=document.createElement('div');
    exportMenu.style.cssText='position:fixed;top:64px;right:20px;z-index:150;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 12px 40px rgba(20,40,30,.16);padding:6px;display:flex;flex-direction:column;min-width:180px';
    exportMenu.innerHTML=`
      <div style="padding:8px 12px;font-size:12px;color:var(--ink-3);font-weight:600">导出数据</div>
      <button data-e="csv" style="padding:10px 12px;border-radius:9px;text-align:left;font-size:14px;display:flex;gap:8px;align-items:center">📊 导出 CSV（Excel）</button>
      <button data-e="json" style="padding:10px 12px;border-radius:9px;text-align:left;font-size:14px;display:flex;gap:8px;align-items:center">💾 备份 JSON</button>
      <button data-e="imp" style="padding:10px 12px;border-radius:9px;text-align:left;font-size:14px;display:flex;gap:8px;align-items:center;color:var(--primary-deep)">📥 导入 JSON 备份</button>`;
    exportMenu.querySelector('[data-e=csv]').onclick=()=>{exportCSV();dismiss();};
    exportMenu.querySelector('[data-e=json]').onclick=()=>{exportJSON();dismiss();};
    exportMenu.querySelector('[data-e=imp]').onclick=()=>{
      const inp=document.createElement('input'); inp.type='file'; inp.accept='.json,application/json';
      inp.onchange=()=>{ if(inp.files[0]) importJSON(inp.files[0]); dismiss(); };
      inp.click();
    };
    document.body.appendChild(exportMenu);
    function dismiss(){ if(exportMenu){exportMenu.remove();exportMenu=null;} }
    setTimeout(()=>document.addEventListener('click',function h(ev){ if(!exportMenu || (!exportMenu.contains(ev.target)&&ev.target!==$('btnExport'))){dismiss();document.removeEventListener('click',h);} }),0);
  };

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){ if(exportMenu){exportMenu.remove();exportMenu=null;} closeModal(); }
    if(e.key==='Enter' && $('mask').classList.contains('show')){ saveRecord(); }
  });

  // 初始化
  renderCatFilter();
  refreshRecords().then(()=>{busy=false;}).catch(()=>{toast('数据库连接失败，请刷新重试');});
})();
