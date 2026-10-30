document.body.innerHTML = "\n<div class=\"wrap\">\n  <header>\n    <h1>📅 课表转日历</h1>\n    <p>粘贴课表 → 一键生成 .ics → 导入手机日历，早八再也不会迟到</p>\n  </header>\n\n  <div class=\"card\">\n    <h2><span class=\"step\">1</span>填基本信息</h2>\n    <div class=\"row\">\n      <div class=\"field\">\n        <label>学期第一周的周一（开学日）</label>\n        <input type=\"date\" id=\"startDate\">\n      </div>\n      <div class=\"field\">\n        <label>日历名称（导入后显示的名字）</label>\n        <input type=\"text\" id=\"calName\" value=\"我的课表\">\n      </div>\n    </div>\n    <details>\n      <summary>ℹ️ 每节课的作息时间（默认 8 点上课，点开可自定义）</summary>\n      <textarea id=\"periods\" style=\"height:150px\">1: 08:00-08:45\n2: 08:55-09:40\n3: 10:00-10:45\n4: 10:55-11:40\n5: 14:00-14:45\n6: 14:55-15:40\n7: 16:00-16:45\n8: 16:55-17:40\n9: 19:00-19:45\n10: 19:55-20:40</textarea>\n    </details>\n  </div>\n\n  <div class=\"card\">\n    <h2><span class=\"step\">2</span>粘贴课表</h2>\n    <textarea id=\"input\" placeholder=\"把教务系统 / Excel 里复制出来的课表粘贴到这里，格式见下方示例\"></textarea>\n    <div class=\"fmt\">\n      每行一门课，用 <code>|</code> 分隔：<code>课程名 | 星期 | 节次 | 周次 | 教室 | 教师</code>\n      （教室、教师可省略）。周次支持 <code>1-16</code>、<code>1-16单</code>、<code>2-16双</code>、<code>1,3,5,7</code>。\n    </div>\n    <details>\n      <summary>看一个完整示例</summary>\n      <pre class=\"sample\">学期开始: 2026-09-07\n示例课程甲 | 周一 | 1-2 | 1-12 | 教学楼104 | 甲老师\n示例课程乙 | 周一 | 3-4 | 1-16 | 教学楼204 | 乙老师\n示例课程丙 | 周二 | 3-4 | 1-16 | 体育馆 | 丙老师\n示例课程丁 | 周五 | 3-4 | 2-16双 | 教学楼303\n示例课程戊 | 周六 | 1-8 | 15-16 | 教学楼827</pre>\n    </details>\n    <div class=\"btns\">\n      <button class=\"btn-main\" id=\"btnGen\">生成课表日历</button>\n      <button class=\"btn-ghost\" id=\"btnDemo\">填入示例课表</button>\n      <button class=\"btn-dl\" id=\"btnDl\">⬇ 下载 .ics 文件</button>\n    </div>\n    <div class=\"msg\" id=\"msg\"></div>\n  </div>\n\n  <div class=\"card\" id=\"previewCard\" style=\"display:none\">\n    <h2><span class=\"step\">3</span>确认预览</h2>\n    <div style=\"overflow-x:auto\"><table id=\"previewTable\"></table></div>\n    <p class=\"howto\" style=\"margin-top:10px\">确认无误后点上方绿色按钮下载，然后：\n      <b>iPhone</b> 把 .ics 通过微信发送给自己 → 用「其他应用打开」→ 选「日历」→ 全部添加；\n      <b>安卓</b> 在文件管理里点开 .ics → 选择「日历」导入。\n      每节课默认<b>上课前 15 分钟提醒</b>。\n    </p>\n  </div>\n\n  <footer>数据只在你的浏览器里处理，不上传任何服务器</footer>\n</div>\n\n";

// ── 作息表 ──
const DEFAULT_PERIODS = {
  1:['08:00','08:45'],2:['08:55','09:40'],3:['10:00','10:45'],4:['10:55','11:40'],
  5:['14:00','14:45'],6:['14:55','15:40'],7:['16:00','16:45'],8:['16:55','17:40'],
  9:['19:00','19:45'],10:['19:55','20:40'],11:['20:50','21:35'],12:['21:45','22:30']
};
const WD_CN = {'一':0,'二':1,'三':2,'四':3,'五':4,'六':5,'日':6,'天':6};
const WD_ALIAS = {};
['周一','周二','周三','周四','周五','周六','周日'].forEach((k,i)=>WD_ALIAS[k]=Math.min(i,6));
['星期一','星期二','星期三','星期四','星期五','星期六','星期日'].forEach((k,i)=>WD_ALIAS[k]=i);
['礼拜一','礼拜二','礼拜三','礼拜四','礼拜五','礼拜六','礼拜日'].forEach((k,i)=>WD_ALIAS[k]=i);

function parseWeekday(t){
  t = String(t).trim();
  for (const k in WD_ALIAS) if (t.includes(k)) return WD_ALIAS[k];
  const m = t.match(/[周星期礼拜]\s*([一二三四五六日天1-7])/);
  if (m){ const c = m[1]; return /[1-7]/.test(c) ? +c-1 : WD_CN[c]; }
  if (/^[1-7]$/.test(t)) return +t-1;
  return null;
}
function parsePeriods(t){
  t = String(t).replace(/节|第/g,'');
  const nums = [];
  for (const part of t.split(/[,，、\s]+/)){
    if (!part) continue;
    const m = part.match(/^(\d+)\s*[-~至]\s*(\d+)$/);
    if (m){ const a=+m[1], b=+m[2]; for(let i=Math.min(a,b);i<=Math.max(a,b);i++) nums.push(i); }
    else if (/^\d+$/.test(part)) nums.push(+part);
  }
  return [...new Set(nums)].sort((a,b)=>a-b);
}
function parseWeeks(t){
  t = String(t).replace(/周|第/g,'');
  const set = new Set();
  for (const part of t.split(/[,，、\s]+/)){
    if (!part) continue;
    let parity = null;
    if (part.includes('单')) parity = 1; else if (part.includes('双')) parity = 0;
    const core = part.replace(/[单双]/g,'');
    let rng = [];
    const m = core.match(/^(\d+)\s*[-~至]\s*(\d+)$/);
    if (m){ const a=+m[1], b=+m[2]; for(let i=Math.min(a,b);i<=Math.max(a,b);i++) rng.push(i); }
    else if (/^\d+$/.test(core)) rng = [+core];
    else continue;
    for (const w of rng) if (parity===null || w%2===parity) set.add(w);
  }
  return [...set].sort((a,b)=>a-b);
}

function parsePeriodsCfg(text){
  const p = Object.assign({}, DEFAULT_PERIODS);
  for (const raw of text.split('\n')){
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^(\d{1,2})\s*[:：]\s*(.+)$/);
    if (m){
      const tr = m[2].match(/(\d{1,2}):(\d{2})\s*[-~至]\s*(\d{1,2}):(\d{2})/);
      if (tr) p[+m[1]] = [tr[1]+':'+tr[2], tr[3]+':'+tr[4]];
    }
  }
  return p;
}

function parseInput(text){
  const lines = text.split('\n');
  let startDate = document.getElementById('startDate').value;
  const courses = [], warns = [];
  for (let i=0;i<lines.length;i++){
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    const sm = line.match(/^(?:学期开始|开学日期|第一周周一)\s*[:：]\s*(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (sm){ if (!startDate) startDate = `${sm[1]}-${String(+sm[2]).padStart(2,'0')}-${String(+sm[3]).padStart(2,'0')}`; continue; }
    if (/^(节次时间|作息时间|课程|课表)\s*[:：]?\s*$/.test(line)) continue;
    if (line.includes('|')){
      const cols = line.split('|').map(s=>s.trim());
      if (cols.length < 4){ warns.push(`第 ${i+1} 行字段不足，已跳过`); continue; }
      const wd = parseWeekday(cols[1]), ps = parsePeriods(cols[2]), ws = parseWeeks(cols[3]);
      if (!cols[0] || wd===null || !ps.length || !ws.length){ warns.push(`第 ${i+1} 行解析失败，已跳过：${line}`); continue; }
      courses.push({name:cols[0], weekday:wd, periods:ps, weeks:ws, room:cols[4]||'', teacher:cols[5]||''});
    }
  }
  return {startDate, courses, warns};
}

function pad(n){ return String(n).padStart(2,'0'); }
function icsEsc(s){ return String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n'); }
function utcStamp(y,mo,d,h,mi){ // 北京时间 → UTC（Z 后缀，任何日历都能正确换算）
  const dtu = new Date(Date.UTC(y, mo-1, d, h-8, mi));
  return `${dtu.getUTCFullYear()}${pad(dtu.getUTCMonth()+1)}${pad(dtu.getUTCDate())}T${pad(dtu.getUTCHours())}${pad(dtu.getUTCMinutes())}00Z`;
}

let lastIcs = '', lastCount = 0;

function generate(){
  const msg = document.getElementById('msg');
  msg.className = 'msg'; msg.textContent = '';
  const text = document.getElementById('input').value;
  if (!text.trim()){ msg.className='msg err'; msg.textContent='请先粘贴课表内容'; return; }
  const {startDate, courses, warns} = parseInput(text);
  if (!startDate){ msg.className='msg err'; msg.textContent='缺少开学日期：请在上方选择，或在课表第一行写「学期开始: 2026-09-07」'; return; }
  if (!courses.length){ msg.className='msg err'; msg.textContent='没有解析到任何课程，请检查每行是否用 | 分隔'; return; }

  const periods = parsePeriodsCfg(document.getElementById('periods').value);
  const sd = new Date(startDate + 'T00:00:00');
  sd.setDate(sd.getDate() - ((sd.getDay()+6)%7)); // 对齐到周一
  const y0=sd.getFullYear(), m0=sd.getMonth()+1, d0=sd.getDate();

  const now = new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const calName = document.getElementById('calName').value.trim() || '我的课表';
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Calendar Export//kebiao2ics//CN',
    'CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:'+icsEsc(calName),'X-WR-TIMEZONE:Asia/Shanghai'];
  let total = 0;
  for (const c of courses){
    const pf = c.periods[0], pl = c.periods[c.periods.length-1];
    if (!periods[pf] || !periods[pl]){ warns.push(`${c.name} 的节次超出作息表，已跳过`); continue; }
    const [hs,ms] = periods[pf][0].split(':').map(Number);
    const [he,me] = periods[pl][1].split(':').map(Number);
    for (const w of c.weeks){
      const day = new Date(y0, m0-1, d0); day.setDate(day.getDate() + (w-1)*7 + c.weekday);
      lines.push('BEGIN:VEVENT',
        'UID:'+Math.random().toString(36).slice(2)+'@kebiao2ics',
        'DTSTAMP:'+now,
        'DTSTART:'+utcStamp(day.getFullYear(), day.getMonth()+1, day.getDate(), hs, ms),
        'DTEND:'+utcStamp(day.getFullYear(), day.getMonth()+1, day.getDate(), he, me),
        'SUMMARY:'+icsEsc(c.name));
      if (c.room) lines.push('LOCATION:'+icsEsc(c.room));
      const desc = [];
      if (c.teacher) desc.push('教师：'+c.teacher);
      desc.push('周次：第 '+w+' 周');
      lines.push('DESCRIPTION:'+icsEsc(desc.join('｜')));
      lines.push('BEGIN:VALARM','TRIGGER:-PT15M','ACTION:DISPLAY',
        'DESCRIPTION:'+icsEsc('15 分钟后上课：'+c.name),'END:VALARM','END:VEVENT');
      total++;
    }
  }
  lines.push('END:VCALENDAR');
  lastIcs = lines.join('\r\n') + '\r\n';
  lastCount = total;

  // 预览表
  const tb = document.getElementById('previewTable');
  const wdName = ['周一','周二','周三','周四','周五','周六','周日'];
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let html = '<tr><th>课程</th><th>星期</th><th>节次</th><th>时间</th><th>周次</th><th>教室</th><th>教师</th><th>次数</th></tr>';
  for (const c of courses){
    const pf=c.periods[0], pl=c.periods[c.periods.length-1];
    if (!periods[pf] || !periods[pl]) continue;
    html += `<tr><td>${escapeHtml(c.name)}</td><td>${wdName[c.weekday]}</td><td>${c.periods[0]}-${c.periods[c.periods.length-1]}</td>`+
      `<td>${periods[pf][0]}-${periods[pl][1]}</td><td>${c.weeks[0]}-${c.weeks[c.weeks.length-1]}（共${c.weeks.length}周）</td>`+
      `<td>${escapeHtml(c.room||'-')}</td><td>${escapeHtml(c.teacher||'-')}</td><td>${c.weeks.length}</td></tr>`;
  }
  tb.innerHTML = html;
  document.getElementById('previewCard').style.display = 'block';
  document.getElementById('btnDl').style.display = 'inline-block';

  let m = `✓ 解析出 ${courses.length} 门课程，将生成 ${total} 条上课提醒`;
  if (warns.length) m += `；⚠ ${warns.length} 条警告：` + warns.slice(0,5).join('；');
  msg.className = warns.length ? 'msg warn' : 'msg ok';
  msg.textContent = m;
  document.getElementById('previewCard').scrollIntoView({behavior:'smooth'});
}

function download(){
  if (!lastIcs) return;
  const blob = new Blob(['\ufeff' + lastIcs], {type:'text/calendar;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (document.getElementById('calName').value.trim() || '我的课表') + '.ics';
  a.click();
  URL.revokeObjectURL(a.href);
}

document.getElementById('btnGen').addEventListener('click', generate);
document.getElementById('btnDl').addEventListener('click', download);
document.getElementById('btnDemo').addEventListener('click', ()=>{
  document.getElementById('startDate').value = '2026-09-07';
  document.getElementById('input').value =
`学期开始: 2026-09-07
示例课程甲 | 周一 | 1-2 | 1-12 | 教学楼104 | 甲老师
示例课程乙 | 周一 | 3-4 | 1-16 | 教学楼204 | 乙老师
示例课程丙 | 周二 | 3-4 | 1-16 | 体育馆 | 丙老师
示例课程丁 | 周二 | 5-6 | 1-16 | 教学楼305 | 乙老师
示例课程己 | 周三 | 3-4 | 1-16 | 教学楼203 | 丁老师
示例课程丁 | 周五 | 3-4 | 2-16双 | 教学楼303 | 乙老师
示例课程戊 | 周六 | 1-8 | 15-16 | 教学楼827 | 戊老师
示例课程庚 | 周日 | 1-4 | 6,12 | 教学楼203 | 乙老师`;
});

// 默认日期：下周一
(function(){
  const d = new Date(); d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  document.getElementById('startDate').value = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
})();
