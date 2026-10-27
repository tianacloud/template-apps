
// ============ Data Layer ============
const STORE_KEY='student_pc_manager';
let DB=loadDB();
let charts={};
let pomoTimer=null,pomoState={mode:'work',remaining:1500,running:false,workMin:25,breakMin:5,completed:0};
let reportRange='week';
let weekTrendChartInst=null,todayDistChartInst=null,reportTrendChartInst=null,reportDistChartInst=null;

function loadDB(){
  try{let s=localStorage.getItem(STORE_KEY);if(s)return JSON.parse(s);}catch(e){}
  return defaultDB();
}
function saveDB(){localStorage.setItem(STORE_KEY,JSON.stringify(DB));}
function defaultDB(){
  return{
    student:{name:'',grade:'',school:'',termStart:''},
    settings:{dailyLimitHours:4,overtimeAction:'remind',parentPwd:'',protectLimit:true,protectApps:true,protectData:true},
    timeSlots:[{start:'07:00',end:'21:30',enabled:true}],
    apps:[
      {id:'a1',name:'Chrome浏览器',icon:'🌐',category:'study',limitMin:120,usedTodayMin:0,totalUsedMin:0,useCount:0},
      {id:'a2',name:'微信',icon:'💬',category:'social',limitMin:30,usedTodayMin:0,totalUsedMin:0,useCount:0},
      {id:'a3',name:'网易云课堂',icon:'📖',category:'study',limitMin:0,usedTodayMin:0,totalUsedMin:0,useCount:0},
      {id:'a4',name:'B站',icon:'📺',category:'fun',limitMin:45,usedTodayMin:0,totalUsedMin:0,useCount:0}
    ],
    usageLogs:[],
    tasks:[],
    reminders:[
      {id:'r1',icon:'👁️',title:'护眼提醒（20-20-20法则）',desc:'每20分钟看20英尺外的物体20秒',enabled:true,intervalMin:20,todayCount:0},
      {id:'r2',icon:'🧘',title:'久坐提醒',desc:'每45分钟起身活动5分钟',enabled:true,intervalMin:45,todayCount:0},
      {id:'r3',icon:'💧',title:'喝水提醒',desc:'每60分钟喝一杯水',enabled:true,intervalMin:60,todayCount:0},
      {id:'r4',icon:'🪑',title:'坐姿提醒',desc:'每30分钟检查并调整坐姿',enabled:false,intervalMin:30,todayCount:0}
    ],
    pomodoroHistory:[],
    lastDateReset:''
  };
}
function today(){return new Date().toISOString().slice(0,10);}
function uid(){return 'x'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function fmtDuration(min){let h=Math.floor(min/60),m=Math.round(min%60);return h>0?`${h}h ${m}m`:`${m}m`;}
function fmtDurationCN(min){let h=Math.floor(min/60),m=Math.round(min%60);return h>0?`${h}小时${m}分`:`${m}分钟`;}

// Daily reset
function checkDailyReset(){
  let t=today();
  if(DB.lastDateReset!==t){
    DB.apps.forEach(a=>{a.usedTodayMin=0;});
    DB.reminders.forEach(r=>{r.todayCount=0;});
    DB.lastDateReset=t;
    saveDB();
  }
}

// ============ Navigation ============
document.querySelectorAll('.nav-item').forEach(item=>{
  item.addEventListener('click',()=>navTo(item.dataset.page));
});
function navTo(page){
  document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');
  document.getElementById('page-'+page).classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
  renderPage(page);
}

// ============ Toast ============
function toast(msg,type=''){
  let c=document.getElementById('toast-container');
  let d=document.createElement('div');
  d.className='toast '+type;
  d.textContent=msg;
  c.appendChild(d);
  setTimeout(()=>{d.style.opacity='0';d.style.transform='translateX(100%)';setTimeout(()=>d.remove(),300);},2500);
}

// ============ Modal ============
function openModal(title,body){
  document.getElementById('modalTitle').textContent=title;
  document.getElementById('modalBody').innerHTML=body;
  document.getElementById('modalOverlay').classList.add('show');
}
function closeModal(){document.getElementById('modalOverlay').classList.remove('show');}

// ============ Password Check ============
function checkPassword(scope){
  if(!DB.settings.parentPwd)return true;
  let isProtected=false;
  if(scope==='limit'&&DB.settings.protectLimit)isProtected=true;
  if(scope==='apps'&&DB.settings.protectApps)isProtected=true;
  if(scope==='data'&&DB.settings.protectData)isProtected=true;
  if(!isProtected)return true;
  let pwd=prompt('请输入管理密码：');
  if(pwd===DB.settings.parentPwd)return true;
  toast('密码错误','error');
  return false;
}

// ============ Render Functions ============
function renderPage(page){
  checkDailyReset();
  if(page==='dashboard')renderDashboard();
  if(page==='time')renderTime();
  if(page==='apps')renderApps();
  if(page==='study')renderStudy();
  if(page==='health')renderHealth();
  if(page==='report')renderReport();
  if(page==='settings')renderSettings();
}

// --- Dashboard ---
function renderDashboard(){
  let logs=todayLogs();
  let totalMin=logs.reduce((s,l)=>s+l.minutes,0);
  let studyMin=logs.filter(l=>l.category==='study').reduce((s,l)=>s+l.minutes,0);
  let funMin=logs.filter(l=>l.category==='fun').reduce((s,l)=>s+l.minutes,0);
  let otherMin=totalMin-studyMin-funMin;
  let doneTasks=DB.tasks.filter(t=>t.done&&t.date===today()).length;
  let totalTasks=DB.tasks.filter(t=>t.date===today()).length;
  let limit=DB.settings.dailyLimitHours*60;
  let pct=limit>0?Math.min(100,totalMin/limit*100):0;
  let pomoToday=DB.pomodoroHistory.filter(p=>p.date===today()).length;

  document.getElementById('dashboardStats').innerHTML=`
    <div class="stat-card"><div class="stat-icon" style="background:var(--primary-light);">⏱️</div><div class="stat-info"><h3>${fmtDuration(totalMin)}</h3><p>今日总使用时长</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--green-light);">📖</div><div class="stat-info"><h3>${fmtDuration(studyMin)}</h3><p>今日学习时长</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--amber-light);">🎮</div><div class="stat-info"><h3>${fmtDuration(funMin)}</h3><p>今日娱乐时长</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--purple-light);">🍅</div><div class="stat-info"><h3>${pomoToday}</h3><p>今日完成番茄数</p></div></div>
  `;

  // Week trend chart
  let weekLabels=[],weekData=[];
  for(let i=6;i>=0;i--){
    let d=new Date();d.setDate(d.getDate()-i);
    let ds=d.toISOString().slice(0,10);
    let dayMin=DB.usageLogs.filter(l=>l.date===ds).reduce((s,l)=>s+l.minutes,0);
    weekLabels.push(d.toLocaleDateString('zh-CN',{weekday:'short'}));
    weekData.push(Math.round(dayMin*10/6)/10);
  }
  if(weekTrendChartInst)weekTrendChartInst.destroy();
  weekTrendChartInst=new Chart(document.getElementById('weekTrendChart'),{
    type:'bar',
    data:{labels:weekLabels,datasets:[{label:'使用时长(小时)',data:weekData,backgroundColor:'#3b82f6',borderRadius:6}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:v=>v+'h'}}}}
  });

  // Today distribution
  if(todayDistChartInst)todayDistChartInst.destroy();
  todayDistChartInst=new Chart(document.getElementById('todayDistChart'),{
    type:'doughnut',
    data:{labels:['学习','娱乐','其他'],datasets:[{data:[studyMin,funMin,otherMin],backgroundColor:['#22c55e','#f59e0b','#8b5cf6'],borderWidth:0}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}
  });
}

// --- Time Management ---
function renderTime(){
  let logs=todayLogs();
  let totalMin=logs.reduce((s,l)=>s+l.minutes,0);
  let limit=DB.settings.dailyLimitHours*60;
  let pct=limit>0?Math.min(100,totalMin/limit*100):0;
  document.getElementById('todayUsage').textContent=fmtDuration(totalMin);
  document.getElementById('usageProgress').style.width=pct+'%';
  if(pct>=100){document.getElementById('usageProgress').style.background='var(--red)';}
  else if(pct>=80){document.getElementById('usageProgress').style.background='var(--amber)';}
  else{document.getElementById('usageProgress').style.background='var(--primary)';}
  document.getElementById('usageLimitText').textContent=`每日限制: ${fmtDurationCN(limit)} · 已用 ${Math.round(pct)}%`;
  document.getElementById('dailyLimitInput').value=DB.settings.dailyLimitHours;
  document.getElementById('overtimeAction').value=DB.settings.overtimeAction;

  // Time slots
  let slotsHtml=DB.timeSlots.map((s,i)=>`
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <input type="time" value="${s.start}" class="form-control" style="width:auto;" onchange="updateTimeSlot(${i},'start',this.value)">
      <span>至</span>
      <input type="time" value="${s.end}" class="form-control" style="width:auto;" onchange="updateTimeSlot(${i},'end',this.value)">
      <div class="toggle ${s.enabled?'on':''}" onclick="updateTimeSlot(${i},'enabled',!${s.enabled})"></div>
      <button class="btn btn-outline btn-sm" onclick="removeTimeSlot(${i})">×</button>
    </div>
  `).join('');
  document.getElementById('timeSlots').innerHTML=slotsHtml||'<p style="color:var(--gray-400);font-size:13px;">暂无时段设置</p>';

  // App select for logging
  let opts=DB.apps.map(a=>`<option value="${a.id}">${a.icon} ${a.name}</option>`).join('');
  document.getElementById('logAppSelect').innerHTML=opts;
}

function saveTimeLimit(){
  if(!checkPassword('limit'))return;
  DB.settings.dailyLimitHours=parseFloat(document.getElementById('dailyLimitInput').value)||4;
  DB.settings.overtimeAction=document.getElementById('overtimeAction').value;
  saveDB();
  toast('时间限制已保存','success');
  renderTime();
}
function addTimeSlot(){DB.timeSlots.push({start:'19:00',end:'21:00',enabled:true});saveDB();renderTime();}
function updateTimeSlot(i,field,val){DB.timeSlots[i][field]=val;saveDB();renderTime();}
function removeTimeSlot(i){DB.timeSlots.splice(i,1);saveDB();renderTime();}

function logUsage(){
  let appId=document.getElementById('logAppSelect').value;
  let minutes=parseInt(document.getElementById('logMinutes').value)||0;
  let category=document.getElementById('logCategory').value;
  if(minutes<=0){toast('请输入有效时长','error');return;}
  let app=DB.apps.find(a=>a.id===appId);
  DB.usageLogs.push({id:uid(),date:today(),appId:appId,appName:app?app.name:'未知',appIcon:app?app.icon:'💻',category:category,minutes:minutes,time:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})});
  if(app){app.usedTodayMin+=minutes;app.totalUsedMin+=minutes;app.useCount++;}
  saveDB();
  toast(`已记录 ${fmtDurationCN(minutes)} 使用时间`,'success');
  document.getElementById('logMinutes').value=30;
  renderTime();
}

// --- App Management ---
function renderApps(){
  let html=DB.apps.map(a=>{
    let catMap={study:'badge-study',fun:'badge-fun',social:'badge-social',other:'badge-other'};
    let catName={study:'学习',fun:'娱乐',social:'社交',other:'其他'};
    let catBg={study:'var(--green-light)',fun:'var(--amber-light)',social:'var(--purple-light)',other:'var(--gray-200)'};
    let limitText=a.limitMin>0?`限制 ${a.limitMin}分钟`:'无限制';
    let usedPct=a.limitMin>0?Math.min(100,a.totalUsedMin/a.limitMin*100):0;
    return `<div class="app-item">
      <div class="ai-icon" style="background:${catBg[a.category]};">${a.icon}</div>
      <div class="ai-info">
        <div class="ai-name">${a.name} <span class="badge ${catMap[a.category]}" style="margin-left:4px;">${catName[a.category]}</span></div>
        <div class="ai-time">${limitText} · 总使用 ${fmtDurationCN(a.totalUsedMin)} · ${a.useCount}次</div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="editApp('${a.id}')">编辑</button>
      <button class="btn btn-outline btn-sm" style="color:var(--red);border-color:var(--red);" onclick="deleteApp('${a.id}')">删除</button>
    </div>`;
  }).join('');
  document.getElementById('appList').innerHTML=html||'<div class="empty-state"><div class="es-icon">📱</div><p>暂无应用，点击上方添加</p></div>';
}

function addApp(){
  if(!checkPassword('apps'))return;
  let name=document.getElementById('newAppName').value.trim();
  if(!name){toast('请输入应用名称','error');return;}
  DB.apps.push({id:uid(),name:name,icon:document.getElementById('newAppIcon').value,category:document.getElementById('newAppCategory').value,limitMin:parseInt(document.getElementById('newAppLimit').value)||0,usedTodayMin:0,totalUsedMin:0,useCount:0});
  saveDB();
  toast('应用已添加','success');
  document.getElementById('newAppName').value='';
  renderApps();
}
function editApp(id){
  let app=DB.apps.find(a=>a.id===id);if(!app)return;
  openModal('编辑应用',`
    <div class="form-group"><label>应用名称</label><input type="text" class="form-control" id="editAppName" value="${app.name}"></div>
    <div class="form-group"><label>分类</label><select class="form-control" id="editAppCat"><option value="study" ${app.category==='study'?'selected':''}>学习</option><option value="fun" ${app.category==='fun'?'selected':''}>娱乐</option><option value="social" ${app.category==='social'?'selected':''}>社交</option><option value="other" ${app.category==='other'?'selected':''}>其他</option></select></div>
    <div class="form-group"><label>每日限制（分钟，0=不限）</label><input type="number" class="form-control" id="editAppLimit" value="${app.limitMin}" min="0"></div>
    <button class="btn btn-primary btn-block" onclick="saveEditApp('${id}')">保存</button>
  `);
}
function saveEditApp(id){
  if(!checkPassword('apps'))return;
  let app=DB.apps.find(a=>a.id===id);if(!app)return;
  app.name=document.getElementById('editAppName').value.trim();
  app.category=document.getElementById('editAppCat').value;
  app.limitMin=parseInt(document.getElementById('editAppLimit').value)||0;
  saveDB();closeModal();toast('应用已更新','success');renderApps();
}
function deleteApp(id){
  if(!checkPassword('apps'))return;
  if(!confirm('确认删除此应用？'))return;
  DB.apps=DB.apps.filter(a=>a.id!==id);
  saveDB();toast('应用已删除','success');renderApps();
}

// --- Study Plan ---
function renderStudy(){
  let todayTasks=DB.tasks.filter(t=>t.date===today());
  let doneCount=todayTasks.filter(t=>t.done).length;
  let pomoToday=DB.pomodoroHistory.filter(p=>p.date===today()).length;
  let studyMinToday=todayLogs().filter(l=>l.category==='study').reduce((s,l)=>s+l.minutes,0);

  document.getElementById('studyStats').innerHTML=`
    <div class="stat-card"><div class="stat-icon" style="background:var(--green-light);">✅</div><div class="stat-info"><h3>${doneCount}/${todayTasks.length}</h3><p>今日任务完成</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--purple-light);">🍅</div><div class="stat-info"><h3>${pomoToday}</h3><p>今日番茄数</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--primary-light);">📖</div><div class="stat-info"><h3>${fmtDuration(studyMinToday)}</h3><p>今日学习时长</p></div></div>
  `;

  // Tasks
  let taskHtml=todayTasks.map(t=>`
    <div class="task-item ${t.done?'task-done':''}">
      <div class="task-check ${t.done?'done':''}" onclick="toggleTask('${t.id}')">${t.done?'✓':''}</div>
      <div class="task-info">
        <div class="task-name">${t.name}</div>
        <div class="task-meta">创建于 ${t.time}${t.pomos?` · ${t.pomos}个番茄`:''}</div>
      </div>
      <button class="btn btn-outline btn-sm" style="color:var(--red);border-color:var(--red);" onclick="deleteTask('${t.id}')">×</button>
    </div>
  `).join('');
  document.getElementById('taskList').innerHTML=taskHtml||'<div class="empty-state"><div class="es-icon">📝</div><p>暂无任务，添加一个开始学习吧</p></div>';

  // Update pomodoro display
  updatePomoDisplay();
}

function addTask(){
  let input=document.getElementById('newTaskInput');
  let name=input.value.trim();
  if(!name){toast('请输入任务名称','error');return;}
  DB.tasks.push({id:uid(),name:name,done:false,date:today(),time:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}),pomos:0});
  saveDB();input.value='';renderStudy();toast('任务已添加','success');
}
function toggleTask(id){
  let t=DB.tasks.find(t=>t.id===id);if(!t)return;
  t.done=!t.done;saveDB();renderStudy();
}
function deleteTask(id){
  DB.tasks=DB.tasks.filter(t=>t.id!==id);saveDB();renderStudy();
}

// Pomodoro
function togglePomodoro(){
  if(pomoState.running){
    pomoState.running=false;
    clearInterval(pomoTimer);
    document.getElementById('pomoStartBtn').textContent='▶ 继续';
    document.getElementById('pomoLabel').textContent=pomoState.mode==='work'?'学习时间 — 已暂停':'休息时间 — 已暂停';
  }else{
    pomoState.running=true;
    document.getElementById('pomoStartBtn').textContent='⏸ 暂停';
    pomoTimer=setInterval(()=>{
      pomoState.remaining--;
      if(pomoState.remaining<=0){
        if(pomoState.mode==='work'){
          pomoState.completed++;
          DB.pomodoroHistory.push({id:uid(),date:today(),time:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}),workMin:pomoState.workMin});
          saveDB();
          toast('🍅 番茄完成！休息一下吧','success');
          pomoState.mode='break';
          pomoState.remaining=pomoState.breakMin*60;
        }else{
          toast('休息结束，继续学习！','success');
          pomoState.mode='work';
          pomoState.remaining=pomoState.workMin*60;
        }
      }
      updatePomoDisplay();
    },1000);
    document.getElementById('pomoLabel').textContent=pomoState.mode==='work'?'学习时间 — 专注中':'休息时间 — 放松中';
  }
}
function startPomodoro(){if(!pomoState.running)togglePomodoro();}
function resetPomodoro(){
  clearInterval(pomoTimer);pomoState.running=false;
  pomoState.workMin=parseInt(document.getElementById('pomoWorkMin').value)||25;
  pomoState.breakMin=parseInt(document.getElementById('pomoBreakMin').value)||5;
  pomoState.mode='work';pomoState.remaining=pomoState.workMin*60;
  document.getElementById('pomoStartBtn').textContent='▶ 开始';
  updatePomoDisplay();
}
function skipPomodoro(){
  if(pomoState.mode==='work'){
    pomoState.mode='break';pomoState.remaining=pomoState.breakMin*60;
  }else{
    pomoState.mode='work';pomoState.remaining=pomoState.workMin*60;
  }
  if(pomoState.running){clearInterval(pomoTimer);pomoState.running=false;document.getElementById('pomoStartBtn').textContent='▶ 开始';}
  updatePomoDisplay();
}
function updatePomoDisplay(){
  let m=Math.floor(pomoState.remaining/60),s=pomoState.remaining%60;
  document.getElementById('pomoTime').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  let label=pomoState.mode==='work'?'学习时间':'休息时间';
  if(!pomoState.running)label+=' — 准备开始';else label+=pomoState.mode==='work'?' — 专注中':' — 放松中';
  document.getElementById('pomoLabel').textContent=label;
}

// --- Health ---
function renderHealth(){
  let html=DB.reminders.map(r=>`
    <div class="reminder-item">
      <div class="ri-icon">${r.icon}</div>
      <div class="ri-info">
        <div class="ri-title">${r.title}</div>
        <div class="ri-desc">${r.desc} · 每${r.intervalMin}分钟提醒 · 今日已提醒${r.todayCount}次</div>
      </div>
      <input type="number" value="${r.intervalMin}" min="5" max="180" style="width:60px;padding:6px;border:1.5px solid var(--gray-300);border-radius:6px;font-size:13px;" onchange="updateReminder('${r.id}','intervalMin',parseInt(this.value))">
      <span style="font-size:12px;color:var(--gray-400);">分钟</span>
      <div class="toggle ${r.enabled?'on':''}" onclick="updateReminder('${r.id}','enabled',!${r.enabled})"></div>
    </div>
  `).join('');
  document.getElementById('reminderList').innerHTML=html;

  let statsHtml=DB.reminders.map(r=>`
    <div style="text-align:center;padding:16px;background:var(--gray-50);border-radius:8px;">
      <div style="font-size:24px;">${r.icon}</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px;color:${r.enabled?'var(--primary)':'var(--gray-400)'};">${r.todayCount}</div>
      <div style="font-size:12px;color:var(--gray-500);margin-top:2px;">${r.title.slice(0,6)}</div>
    </div>
  `).join('');
  document.getElementById('healthStats').innerHTML=statsHtml;
}
function updateReminder(id,field,val){
  let r=DB.reminders.find(r=>r.id===id);if(!r)return;
  r[field]=val;saveDB();renderHealth();
}

// --- Report ---
function switchReportRange(r){
  reportRange=r;
  document.querySelectorAll('.report-tab').forEach(t=>t.classList.remove('active'));
  document.querySelector(`.report-tab[data-range="${r}"]`).classList.add('active');
  document.querySelectorAll('.report-tab').forEach(t=>{
    if(t.dataset.range===r)t.style.borderColor='var(--primary)';else t.style.borderColor='';
  });
  renderReport();
}

function renderReport(){
  let days=reportRange==='week'?7:reportRange==='month'?30:365;
  let startDate=new Date();startDate.setDate(startDate.getDate()-days);
  let startStr=startDate.toISOString().slice(0,10);
  let logs=DB.usageLogs.filter(l=>l.date>=startStr);

  let totalMin=logs.reduce((s,l)=>s+l.minutes,0);
  let studyMin=logs.filter(l=>l.category==='study').reduce((s,l)=>s+l.minutes,0);
  let funMin=logs.filter(l=>l.category==='fun').reduce((s,l)=>s+l.minutes,0);
  let socialMin=logs.filter(l=>l.category==='social').reduce((s,l)=>s+l.minutes,0);
  let otherMin=logs.filter(l=>l.category==='other').reduce((s,l)=>s+l.minutes,0);
  let avgMin=days>0?Math.round(totalMin/days):0;
  let pomoCount=DB.pomodoroHistory.filter(p=>p.date>=startStr).length;

  let rangeLabel=reportRange==='week'?'本周':reportRange==='month'?'本月':'全部';
  document.getElementById('reportStats').innerHTML=`
    <div class="stat-card"><div class="stat-icon" style="background:var(--primary-light);">⏱️</div><div class="stat-info"><h3>${fmtDuration(totalMin)}</h3><p>${rangeLabel}总使用</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--green-light);">📊</div><div class="stat-info"><h3>${fmtDuration(avgMin)}</h3><p>日均使用</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--purple-light);">🍅</div><div class="stat-info"><h3>${pomoCount}</h3><p>${rangeLabel}番茄数</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--amber-light);">📖</div><div class="stat-info"><h3>${totalMin>0?Math.round(studyMin/totalMin*100):0}%</h3><p>学习占比</p></div></div>
  `;

  // Trend chart
  let labels=[],trendData=[];
  let step=days<=7?1:days<=30?1:7;
  for(let i=days-1;i>=0;i-=step){
    let d=new Date();d.setDate(d.getDate()-i);
    let ds=d.toISOString().slice(0,10);
    let dayMin=DB.usageLogs.filter(l=>l.date===ds).reduce((s,l)=>s+l.minutes,0);
    labels.push(d.toLocaleDateString('zh-CN',{month:reportRange==='all'?'numeric':'numeric',day:'numeric'}));
    trendData.push(Math.round(dayMin*10/6)/10);
  }
  if(reportTrendChartInst)reportTrendChartInst.destroy();
  reportTrendChartInst=new Chart(document.getElementById('reportTrendChart'),{
    type:'line',
    data:{labels:labels,datasets:[{label:'使用时长(小时)',data:trendData,borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,.1)',fill:true,tension:.3}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:v=>v+'h'}}}}
  });

  // Distribution chart
  if(reportDistChartInst)reportDistChartInst.destroy();
  reportDistChartInst=new Chart(document.getElementById('reportDistChart'),{
    type:'doughnut',
    data:{labels:['学习','娱乐','社交','其他'],datasets:[{data:[studyMin,funMin,socialMin,otherMin],backgroundColor:['#22c55e','#f59e0b','#8b5cf6','#9ca3af'],borderWidth:0}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}
  });

  // App detail table
  let appStats=DB.apps.map(a=>{
    let appLogs=logs.filter(l=>l.appId===a.id);
    let appMin=appLogs.reduce((s,l)=>s+l.minutes,0);
    let appCount=appLogs.length;
    let avg=days>0?Math.round(appMin/days):0;
    let catMap={study:'badge-study',fun:'badge-fun',social:'badge-social',other:'badge-other'};
    let catName={study:'学习',fun:'娱乐',social:'社交',other:'其他'};
    return {app:a,min:appMin,count:appCount,avg:avg,catMap:catMap[a.category],catName:catName[a.category]};
  }).sort((a,b)=>b.min-a.min);

  document.getElementById('reportTableBody').innerHTML=appStats.map(s=>`
    <tr>
      <td>${s.app.icon} ${s.app.name}</td>
      <td><span class="badge ${s.catMap}">${s.catName}</span></td>
      <td>${fmtDurationCN(s.min)}</td>
      <td>${s.count}</td>
      <td>${fmtDurationCN(s.avg)}</td>
    </tr>
  `).join('')||'<tr><td colspan="5" style="text-align:center;color:var(--gray-400);">暂无数据</td></tr>';
}

// --- Settings ---
function renderSettings(){
  document.getElementById('setStudentName').value=DB.student.name||'';
  document.getElementById('setGrade').value=DB.student.grade||'';
  document.getElementById('setSchool').value=DB.student.school||'';
  document.getElementById('setTermStart').value=DB.student.termStart||'';
  document.getElementById('protectLimit').checked=DB.settings.protectLimit;
  document.getElementById('protectApps').checked=DB.settings.protectApps;
  document.getElementById('protectData').checked=DB.settings.protectData;
}

function saveParentPwd(){
  let pwd=document.getElementById('setParentPwd').value;
  if(!pwd){toast('请输入密码','error');return;}
  if(pwd.length<4){toast('密码至少4位','error');return;}
  DB.settings.parentPwd=pwd;saveDB();
  document.getElementById('setParentPwd').value='';
  DB.settings.protectLimit=document.getElementById('protectLimit').checked;
  DB.settings.protectApps=document.getElementById('protectApps').checked;
  DB.settings.protectData=document.getElementById('protectData').checked;
  saveDB();
  toast('管理密码已设置','success');
}

// Auto-save settings on change
document.addEventListener('change',e=>{
  if(e.target.id==='setStudentName'){DB.student.name=e.target.value;saveDB();}
  if(e.target.id==='setGrade'){DB.student.grade=e.target.value;saveDB();}
  if(e.target.id==='setSchool'){DB.student.school=e.target.value;saveDB();}
  if(e.target.id==='setTermStart'){DB.student.termStart=e.target.value;saveDB();}
  if(e.target.id==='protectLimit'){DB.settings.protectLimit=e.target.checked;saveDB();}
  if(e.target.id==='protectApps'){DB.settings.protectApps=e.target.checked;saveDB();}
  if(e.target.id==='protectData'){DB.settings.protectData=e.target.checked;saveDB();}
});

// Data export/import/reset
function exportData(){
  let data=JSON.stringify(DB,null,2);
  let blob=new Blob([data],{type:'application/json'});
  let a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`学生电脑使用数据_${today()}.json`;
  a.click();
  toast('数据已导出','success');
}
function importData(e){
  let file=e.target.files[0];if(!file)return;
  let reader=new FileReader();
  reader.onload=ev=>{
    try{
      let data=JSON.parse(ev.target.result);
      if(!data.apps||!data.settings)throw new Error('格式错误');
      DB=data;saveDB();
      toast('数据已导入','success');
      renderPage('dashboard');navTo('dashboard');
    }catch(err){toast('导入失败：文件格式错误','error');}
  };
  reader.readAsText(file);
  e.target.value='';
}
function confirmReset(){
  if(!checkPassword('data'))return;
  openModal('确认重置',`
    <p style="color:var(--red);font-weight:500;margin-bottom:12px;">⚠️ 此操作将清除所有使用记录、任务、应用列表和设置，且不可恢复！</p>
    <p style="font-size:14px;color:var(--gray-600);margin-bottom:16px;">确认要重置所有数据吗？</p>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-danger btn-block" onclick="resetData()">确认重置</button>
      <button class="btn btn-outline btn-block" onclick="closeModal()">取消</button>
    </div>
  `);
}
function resetData(){
  DB=defaultDB();saveDB();closeModal();
  toast('所有数据已重置','success');
  navTo('dashboard');
}

// ============ Helpers ============
function todayLogs(){return DB.usageLogs.filter(l=>l.date===today());}

// ============ Init ============
checkDailyReset();
renderDashboard();

// Reminder simulation (checks every minute)
setInterval(()=>{
  let now=Date.now();
  DB.reminders.forEach(r=>{
    if(!r.enabled)return;
    let lastKey='lastReminder_'+r.id;
    let last=localStorage.getItem(lastKey);
    if(!last||now-parseInt(last)>=r.intervalMin*60000){
      localStorage.setItem(lastKey,now.toString());
      r.todayCount=(r.todayCount||0)+1;
      saveDB();
      toast(`${r.icon} ${r.title}`,'warning');
      if(document.getElementById('page-health').classList.contains('active'))renderHealth();
    }
  });
},30000);

// Close modal on overlay click
document.getElementById('modalOverlay').addEventListener('click',e=>{
  if(e.target.id==='modalOverlay')closeModal();
});
