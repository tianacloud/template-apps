
(function(){
'use strict';
var NS='wb_gz_title_';
function L(k){try{return JSON.parse(localStorage.getItem(NS+k))||null;}catch(e){return null;}}
function S(k,v){localStorage.setItem(NS+k,JSON.stringify(v));}

var state={critFilter:'all',todoFilter:'all',modalOk:null};

/* ===== 工具 ===== */
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function todayStr(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function shiftDate(days){var d=new Date();d.setDate(d.getDate()+days);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function daysUntil(ds){if(!ds)return 9999;var a=new Date(todayStr()+'T00:00:00'),b=new Date(ds+'T00:00:00');return Math.round((b-a)/86400000);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},1800);}

/* ===== 预置条款（高中高级教师） ===== */
function criteriaSeed(){
  var rows=[
    ['基本条件','第五条','思想政治素质与职业道德','拥护党的领导，遵守宪法法律，贯彻党和国家教育方针，遵守《教师法》《中小学教师职业道德规范》《新时代中小学教师职业行为十项准则》，践行社会主义核心价值观，爱岗敬业、关爱学生、为人师表、教书育人。'],
    ['基本条件','第五条','教师资格与一线任教','具备相应教师资格及专业知识和教育教学能力，在教育教学一线任教，切实履行教师岗位职责和义务。'],
    ['基本条件','第五条','年度考核与师德表现','任现职以来年度考核合格次数≥学历资历条件规定的任教年数，且近2年年度考核为合格以上；2年内无失职事故、体罚学生、有偿补课、弄虚作假等情形。'],
    ['基本条件','第七条','继续教育','按照《广东省专业技术人员继续教育条例》等要求完成继续教育学习任务。'],
    ['基本条件','第八条','身心健康','身体健康，心理素质良好，具备从事教育教学工作的身心健康条件。'],
    ['学历资历','第三十五条','学历资历（二选一）','①具备博士学位，在一级教师岗位任教2年以上；②具备大学本科学历或学士学位、硕士学位，在一级教师岗位任教5年以上。'],
    ['学历资历','第三十五条','农村/薄弱学校任教经历','城镇教师需有1年以上在薄弱学校或农村学校任教经历（支教、特教、民办校、少数民族班教学年限可视为同等经历）。'],
    ['育人工作','第三十六条(一)','育人经验总结/案例','长期工作在教育教学第一线，能有效开展思想道德教育，引导学生健康成长成绩突出，有优秀的育人经验总结材料或案例。'],
    ['育人工作','第三十六条(二)','班主任工作年限','从教以来担任班主任8年以上，其中任现职以来3年以上（硕士：从教6年+任现职2年；博士：任现职1年；可按附则折算/减半）。'],
    ['育人工作','第三十六条(三)','班级表彰/德育荣誉','任现职以来所带班级获校级以上表彰奖励2次以上，或个人获与德育（班主任）工作相关的县级以上荣誉称号。'],
    ['课程教学','第三十七条(一)','学情分析报告','提交近1年来对学生的学情分析报告1份。'],
    ['课程教学','第三十七条(二)','教学工作量与循环教学','周课时量达标（专任教师10节+/班主任5节+/中层4节+/校级领导2节+）；胜任并进行高中循环教学1次以上，或担任高中毕业班把关教师3年以上。'],
    ['课程教学','第三十七条(二)','公开课/示范课/比赛','每年承担校级以上公开课1次以上，或任现职以来在县级以上开设教学示范/观摩课1次，或获县级以上教学比赛奖。'],
    ['课程教学','第三十七条(三)','选修课/社团','能独立开设活动课程、选修课程或指导学生开展社团活动。'],
    ['课程教学','第三十七条(四)','学生满意度','学生对教学的满意度高。'],
    ['教研科研','第三十八条(一)','教研能力与成果推广','具有指导与开展教育教学研究的能力，成果在课程改革、教学方法改进等方面得到推广运用。'],
    ['教研科研','第三十八条(二)','教研科研7选2','以下任选2项：①县级以上课题（主持或参与前6）；②出版学术著作1部（本人≥5万字）；③成果获市教学成果二等奖/省级三等奖以上；④论文2篇（1篇正式发表或县级以上宣读）；⑤参与省级教研基地项目或资源被市级以上采用；⑥主编/参编教材或教学用书1部；⑦研究成果转化为市级以上政策文件/决策参考。'],
    ['示范引领','第三十九条(一)','县级以上教研活动','积极承担县级以上教研活动任务，为同行作出示范，获得好评。'],
    ['示范引领','第三十九条(二)','指导青年教师','发挥教育教学带头人作用，在县（区）级以上教师队伍建设中正确指导青年教师，取得明显成效。'],
    ['示范引领','第三十九条(三)','表彰奖励（优先项）','获县（区）级以上人民政府、教育行政部门或教研部门表彰奖励者同等条件下优先申报。']
  ];
  return rows.map(function(r,i){return {id:'c'+(i+1),sec:r[0],no:r[1],title:r[2],detail:r[3],status:'待核实',evidence:'',proof:''};});
}
function materialsSeed(){
  return [
    {id:uid(),name:'教师资格证书',cat:'教师资格',date:'',clause:'第五条(二)',proof:'已齐',note:'扫描件已归档'},
    {id:uid(),name:'学历学位证书',cat:'学历学位',date:'',clause:'第三十五条(一)',proof:'已齐',note:''},
    {id:uid(),name:'班主任工作年限证明',cat:'班主任/德育',date:'',clause:'第三十六条(二)',proof:'待补',note:'需学校出具任教年限及班主任工作证明（示例数据，请替换为本人真实材料）'}
  ];
}
function achievementsSeed(){
  return [
    {id:uid(),title:'大单元教学改革实践（示例）',bg:'传统课时教学碎片化，学生知识结构松散（示例）。',task:'本人承担单元整体设计并执教示范课。',process:'重构单元目标→设计任务链→实施→评价。',innov:'以真实情境任务统领单元。',effect:'学生单元测评优良率提升（示例，请替换为本人真实数据）。',contrib:'独立完成单元设计与课堂实施。',clause:'第三十七条(一)(二)',proof:''},
    {id:uid(),title:'指导学生社团/竞赛（示例）',bg:'',task:'',process:'',innov:'',effect:'',contrib:'',clause:'第三十七条(三)',proof:''}
  ];
}
function todosSeed(){
  return [
    {id:uid(),title:'补齐班主任工作年限证明',type:'材料补充',prio:'high',due:shiftDate(-2),clause:'第三十六条(二)',note:'（示例）联系学校教务处开具证明',done:false},
    {id:uid(),title:'整理近1年学情分析报告',type:'待办事项',prio:'mid',due:todayStr(),clause:'第三十七条(一)',note:'（示例）整理学生成绩与学情分析',done:false},
    {id:uid(),title:'核对论文/课题证明是否齐全',type:'风险缺口',prio:'high',due:shiftDate(5),clause:'第三十八条(二)',note:'（示例）确认发表论文原件与课题结题证书',done:false},
    {id:uid(),title:'确认校级公开课记录',type:'待办事项',prio:'low',due:shiftDate(12),clause:'第三十七条(二)',note:'（示例）联系科组核实公开课登记',done:false}
  ];
}

/* ===== 数据读写 ===== */
function loadAll(){
  var d={materials:L('materials'),criteria:L('criteria'),achievements:L('achievements'),todos:L('todos')};
  if(!d.criteria){d.criteria=criteriaSeed();S('criteria',d.criteria);}
  var seeded=L('seeded');
  if(!seeded){
    d.materials=(d.materials&&d.materials.length)?d.materials:materialsSeed();
    d.achievements=(d.achievements&&d.achievements.length)?d.achievements:achievementsSeed();
    d.todos=(d.todos&&d.todos.length)?d.todos:todosSeed();
    S('materials',d.materials);S('achievements',d.achievements);S('todos',d.todos);
    S('seeded',true);
  }else{
    d.materials=d.materials||[];d.achievements=d.achievements||[];d.todos=d.todos||[];
  }
  return d;
}
function getColl(n){return L(n)||[];}
function setColl(n,a){S(n,a);}

/* ===== 计算层 ===== */
function calcCritSummary(){
  var c=getColl('criteria');
  var r={total:c.length,ok:0,check:0,miss:0};
  c.forEach(function(x){if(x.status==='已证明')r.ok++;else if(x.status==='待核实')r.check++;else if(x.status==='暂缺')r.miss++;});
  return r;
}
function todayItems(){
  var todos=getColl('todos'),mats=getColl('materials');
  var list=[];
  todos.filter(function(t){return !t.done;}).forEach(function(t){
    var d=daysUntil(t.due);
    if(d<0)list.push({kind:'overdue',type:'待办',title:t.title,meta:'逾期 '+t.due+(t.clause?' · '+t.clause:''),todoId:t.id});
    else if(d===0)list.push({kind:'today',type:'待办',title:t.title,meta:'今天到期'+(t.clause?' · '+t.clause:''),todoId:t.id});
    else if(d<=3)list.push({kind:'soon',type:'待办',title:t.title,meta:d+'天后到期'+(t.clause?' · '+t.clause:''),todoId:t.id});
  });
  mats.filter(function(m){return m.proof!=='已齐';}).forEach(function(m){
    list.push({kind:'material',type:'材料',title:m.name,meta:'证明情况：'+(m.proof||'未标')+(m.clause?' · '+m.clause:''),matId:m.id});
  });
  return list;
}

/* ===== 渲染层（渲染函数之间互不调用） ===== */
function renderToday(){
  var box=document.getElementById('todayList');
  var items=todayItems();
  if(!items.length){box.innerHTML='<div class="empty">暂无需要处理的事项，保持这个节奏</div>';return;}
  var h=items.map(function(it){
    var tag='',cls='';
    if(it.kind==='overdue'){tag='逾期';cls='overdue';}
    else if(it.kind==='today'){tag='今天';cls='today';}
    else if(it.kind==='soon'){tag='临近';cls='soon';}
    else{tag='待补';cls='today';}
    var btn;
    if(it.todoId){btn='<button class="btn small" onclick="markTodoDone(\''+it.todoId+'\')">标记完成</button>';}
    else{btn='<button class="btn small" onclick="jumpTab(\'materials\')">去处理</button>';}
    return '<div class="today-item"><span class="today-tag '+cls+'">'+tag+'</span>'+
      '<div class="today-body"><div class="t">'+esc(it.title)+'</div><div class="m">'+esc(it.meta)+'</div></div>'+btn+'</div>';
  }).join('');
  box.innerHTML=h;
}
function renderStats(){
  var m=getColl('materials'),a=getColl('achievements'),t=getColl('todos'),c=calcCritSummary();
  var mOk=m.filter(function(x){return x.proof==='已齐';}).length;
  var mBad=m.length-mOk;
  var aOk=a.filter(function(x){return x.proof&&x.proof.trim();}).length;
  var tUndone=t.filter(function(x){return !x.done;}).length;
  var tOver=t.filter(function(x){return !x.done&&daysUntil(x.due)<0;}).length;
  var tHigh=t.filter(function(x){return !x.done&&x.prio==='high';}).length;
  document.getElementById('matStats').innerHTML=
    stat('材料总数',m.length,'primary')+stat('证明已齐',mOk,'green')+stat('待补/待核实',mBad,'amber')+stat('业绩成果',a.length,'primary');
  document.getElementById('critStats').innerHTML=
    stat('评审条款',c.total,'primary')+stat('已证明',c.ok,'green')+stat('待核实',c.check,'amber')+stat('暂缺',c.miss,'red');
  document.getElementById('achStats').innerHTML=
    stat('业绩总数',a.length,'primary')+stat('已附证明',aOk,'green')+stat('未附证明',a.length-aOk,'amber')+stat('覆盖条款',a.map(function(x){return x.clause;}).filter(Boolean).length,'primary');
  document.getElementById('todoStats').innerHTML=
    stat('待办总数',tUndone,'primary')+stat('高优先级',tHigh,'red')+stat('已逾期',tOver,'red')+stat('已处理',t.length-tUndone,'green');
  var pct=c.total?Math.round(c.ok/c.total*100):0;
  document.getElementById('critBar').style.width=pct+'%';
  document.getElementById('critBarText').textContent='对标完成度：'+c.ok+'/'+c.total+' 项已证明（'+pct+'%）';
}
function stat(n,v,c){return '<div class="stat"><div class="n '+c+'">'+v+'</div><div class="l">'+n+'</div></div>';}

function renderMaterials(){
  var m=getColl('materials'),box=document.getElementById('matList');
  if(!m.length){box.innerHTML='<div class="empty">还没有登记材料，点击「添加材料」开始</div>';return;}
  var pb={'已齐':'green','待补':'amber','待核实':'red'};
  box.innerHTML=m.map(function(x){
    var p=pb[x.proof]||'gray';
    return '<div class="item"><div class="row1"><div class="grow">'+
      '<div class="tt">'+esc(x.name)+'</div>'+
      '<div class="meta"><span class="badge cat">'+esc(x.cat)+'</span>'+(x.date?'<span>'+esc(x.date)+'</span>':'')+(x.clause?'<span>'+esc(x.clause)+'</span>':'')+'<span class="badge '+p+'">'+(x.proof||'未标')+'</span></div>'+
      (x.note?'<div class="desc">'+esc(x.note)+'</div>':'')+
      '</div><div class="ops">'+
      '<button class="btn ghost" title="编辑" onclick="editMaterial(\''+x.id+'\')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></button>'+
      '<button class="btn ghost" title="删除" onclick="deleteMaterial(\''+x.id+'\')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button>'+
      '</div></div></div>';
  }).join('');
}

function renderCriteria(){
  var c=getColl('criteria'),f=state.critFilter,box=document.getElementById('critList');
  var filtered=c;
  if(f!=='all')filtered=c.filter(function(x){return x.status===f;});
  if(!filtered.length){box.innerHTML='<div class="empty">该筛选条件下暂无条款</div>';return;}
  var groups={};
  filtered.forEach(function(x){(groups[x.sec]=groups[x.sec]||[]).push(x);});
  var order=['基本条件','学历资历','育人工作','课程教学','教研科研','示范引领'];
  var stOpts=[['已证明','已证明'],['待核实','待核实'],['待补充','待补充'],['暂缺','暂缺']];
  var stBadge={'已证明':'green','待核实':'amber','待补充':'gray','暂缺':'red'};
  var h=order.filter(function(s){return groups[s];}).map(function(s){
    var items=groups[s].map(function(x){
      return '<div class="crit"><div class="no">'+x.id.replace('c','')+'</div><div class="body">'+
        '<div class="tt">'+esc(x.title)+' <span style="font-weight:400;color:var(--muted);font-size:12px">'+esc(x.no)+'</span></div>'+
        '<div class="dt">'+esc(x.detail)+'</div>'+
        (x.evidence?'<div class="ev"><b>我的证据：</b>'+esc(x.evidence)+(x.proof?'<br><b>证明材料：</b>'+esc(x.proof):'')+'</div>':'')+
        '<div class="ev" id="critEdit'+x.id+'" style="display:none">'+
          '<label style="margin-top:4px">我的证据</label><textarea id="critEv'+x.id+'" style="min-height:60px">'+esc(x.evidence)+'</textarea>'+
          '<label style="margin-top:6px">证明材料</label><input id="critPf'+x.id+'" value="'+esc(x.proof)+'">'+
          '<div class="form-actions" style="justify-content:flex-start;margin-top:8px"><button class="btn small" onclick="toggleCritEdit(\''+x.id+'\')">收起</button><button class="btn small primary" onclick="saveCrit(\''+x.id+'\')">保存</button></div>'+
        '</div>'+
        '</div><div class="status">'+
        '<select style="font-size:12px;padding:6px 8px;min-height:34px" onchange="setCritStatus(\''+x.id+'\',this.value)">'+
        stOpts.map(function(o){return '<option value="'+o[0]+'"'+(x.status===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join('')+
        '</select>'+
        '<div style="margin-top:6px"><button class="btn small" onclick="toggleCritEdit(\''+x.id+'\')">填证据</button></div>'+
        '</div></div>';
    }).join('');
    return '<div class="crit-group"><div class="gh"><span>'+esc(s)+'</span><span>'+items.length+' 项</span></div>'+items+'</div>';
  }).join('');
  box.innerHTML=h;
}

function renderAchievements(){
  var a=getColl('achievements'),box=document.getElementById('achList');
  if(!a.length){box.innerHTML='<div class="empty">还没有业绩成果，点击「新增业绩」开始梳理</div>';return;}
  box.innerHTML=a.map(function(x){
    var fields=[['背景与问题',x.bg],['本人任务',x.task],['实施过程',x.process],['创新做法',x.innov],['可核实成效',x.effect],['个人贡献',x.contrib]];
    var body=fields.filter(function(f){return f[1]&&f[1].trim();}).map(function(f){
      return '<div class="meta" style="margin-top:4px"><b style="color:var(--muted);font-weight:600">'+f[0]+'：</b>'+esc(f[1])+'</div>';
    }).join('');
    return '<div class="item"><div class="row1"><div class="grow">'+
      '<div class="tt">'+esc(x.title)+'</div>'+
      '<div class="meta">'+(x.clause?'<span class="badge primary">'+esc(x.clause)+'</span>':'')+(x.proof?'<span class="badge green">有证明</span>':'<span class="badge amber">未附证明</span>')+'</div>'+
      body+
      '</div><div class="ops">'+
      '<button class="btn ghost" onclick="editAchievement(\''+x.id+'\')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></button>'+
      '<button class="btn ghost" onclick="deleteAchievement(\''+x.id+'\')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button>'+
      '</div></div></div>';
  }).join('');
}

function renderTodos(){
  var t=getColl('todos'),f=state.todoFilter,box=document.getElementById('todoList');
  var list=t;
  if(f==='未处理')list=t.filter(function(x){return !x.done;});
  if(f==='已处理')list=t.filter(function(x){return x.done;});
  if(!list.length){box.innerHTML='<div class="empty">该筛选条件下暂无待办</div>';return;}
  var prioTxt={high:'高',mid:'中',low:'低'};
  box.innerHTML=list.map(function(x){
    var d=daysUntil(x.due);
    var dueBadge='';
    if(x.done){dueBadge='<span class="badge green">已处理</span>';}
    else if(d<0){dueBadge='<span class="badge red">逾期 '+esc(x.due)+'</span>';}
    else if(d===0){dueBadge='<span class="badge amber">今天到期</span>';}
    else{dueBadge='<span class="badge gray">'+esc(x.due)+'</span>';}
    return '<div class="item" style="'+(x.done?'opacity:.55':'')+'"><div class="row1"><div class="grow">'+
      '<div class="tt"><span class="prio '+x.prio+'"></span>'+esc(x.title)+'</div>'+
      '<div class="meta"><span class="badge cat">'+esc(x.type)+'</span><span class="badge '+(x.prio==='high'?'red':x.prio==='mid'?'amber':'gray')+'">'+prioTxt[x.prio]+'优先级</span>'+dueBadge+(x.clause?'<span>'+esc(x.clause)+'</span>':'')+'</div>'+
      (x.note?'<div class="desc">'+esc(x.note)+'</div>':'')+
      '</div><div class="ops">'+
      (x.done?'':'<button class="btn small" onclick="markTodoDone(\''+x.id+'\')">完成</button>')+
      '<button class="btn ghost" onclick="editTodo(\''+x.id+'\')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></button>'+
      '<button class="btn ghost" onclick="deleteTodo(\''+x.id+'\')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button>'+
      '</div></div></div>';
  }).join('');
}

/* ===== 统一刷新入口（唯一允许串起各渲染函数的地方） ===== */
function refreshAll(){
  renderToday();
  renderStats();
  renderMaterials();
  renderCriteria();
  renderAchievements();
  renderTodos();
}

/* ===== 交互：Tab 与表单 ===== */
function switchTab(name){
  document.querySelectorAll('.tab').forEach(function(b){b.classList.toggle('active',b.dataset.panel===name);});
  document.querySelectorAll('.panel').forEach(function(p){p.classList.toggle('active',p.id==='panel-'+name);});
}
function jumpTab(name){switchTab(name);window.scrollTo({top:0,behavior:'smooth'});}
function toggleForm(id){var el=document.getElementById(id);el.classList.toggle('show');}

/* ===== 交互：材料 ===== */
function saveMaterial(){
  var name=document.getElementById('matName').value.trim();
  if(!name){toast('请填写材料名称');return;}
  var id=document.getElementById('matId').value;
  var obj={name:name,cat:document.getElementById('matCat').value,date:document.getElementById('matDate').value.trim(),
    clause:document.getElementById('matClause').value.trim(),proof:document.getElementById('matProof').value,note:document.getElementById('matNote').value.trim()};
  var arr=getColl('materials');
  if(id){var i=arr.findIndex(function(x){return x.id===id;});if(i>=0){obj.id=id;arr[i]=obj;}toast('已更新');}
  else{obj.id=uid();arr.unshift(obj);toast('已添加');}
  setColl('materials',arr);
  document.getElementById('matForm').classList.remove('show');
  refreshAll();
}
function editMaterial(id){
  var x=getColl('materials').find(function(v){return v.id===id;});if(!x)return;
  document.getElementById('matId').value=x.id;
  document.getElementById('matName').value=x.name;
  document.getElementById('matCat').value=x.cat;
  document.getElementById('matDate').value=x.date||'';
  document.getElementById('matClause').value=x.clause||'';
  document.getElementById('matProof').value=x.proof||'待补';
  document.getElementById('matNote').value=x.note||'';
  document.getElementById('matForm').classList.add('show');
  switchTab('materials');
  document.getElementById('matForm').scrollIntoView({behavior:'smooth',block:'center'});
}
function deleteMaterial(id){
  openModal('删除材料','确定删除这条材料记录吗？此操作不可撤销。',function(){
    setColl('materials',getColl('materials').filter(function(x){return x.id!==id;}));
    refreshAll();toast('已删除');
  });
}

/* ===== 交互：条款 ===== */
function setCritStatus(id,val){
  var arr=getColl('criteria');var i=arr.findIndex(function(x){return x.id===id;});
  if(i>=0){arr[i].status=val;setColl('criteria',arr);refreshAll();toast('已标注「'+val+'」');}
}
function toggleCritEdit(id){
  var el=document.getElementById('critEdit'+id);
  if(el)el.style.display=el.style.display==='none'?'block':'none';
}
function saveCrit(id){
  var arr=getColl('criteria');var i=arr.findIndex(function(x){return x.id===id;});
  if(i>=0){
    arr[i].evidence=document.getElementById('critEv'+id).value.trim();
    arr[i].proof=document.getElementById('critPf'+id).value.trim();
    setColl('criteria',arr);refreshAll();toast('证据已保存');
  }
}
function setCritFilter(f){state.critFilter=f;document.querySelectorAll('#critFilter .chip').forEach(function(c){c.classList.toggle('active',c.dataset.f===f);});renderCriteria();}

/* ===== 交互：业绩 ===== */
function saveAchievement(){
  var title=document.getElementById('achTitle').value.trim();
  if(!title){toast('请填写业绩名称');return;}
  var id=document.getElementById('achId').value;
  var obj={title:title,bg:document.getElementById('achBg').value.trim(),task:document.getElementById('achTask').value.trim(),
    process:document.getElementById('achProcess').value.trim(),innov:document.getElementById('achInnov').value.trim(),
    effect:document.getElementById('achEffect').value.trim(),contrib:document.getElementById('achContrib').value.trim(),
    clause:document.getElementById('achClause').value.trim(),proof:document.getElementById('achProof').value.trim()};
  var arr=getColl('achievements');
  if(id){var i=arr.findIndex(function(x){return x.id===id;});if(i>=0){obj.id=id;arr[i]=obj;}toast('已更新');}
  else{obj.id=uid();arr.unshift(obj);toast('已新增');}
  setColl('achievements',arr);
  document.getElementById('achForm').classList.remove('show');
  refreshAll();
}
function editAchievement(id){
  var x=getColl('achievements').find(function(v){return v.id===id;});if(!x)return;
  document.getElementById('achId').value=x.id;
  document.getElementById('achTitle').value=x.title;
  document.getElementById('achBg').value=x.bg||'';document.getElementById('achTask').value=x.task||'';
  document.getElementById('achProcess').value=x.process||'';document.getElementById('achInnov').value=x.innov||'';
  document.getElementById('achEffect').value=x.effect||'';document.getElementById('achContrib').value=x.contrib||'';
  document.getElementById('achClause').value=x.clause||'';document.getElementById('achProof').value=x.proof||'';
  document.getElementById('achForm').classList.add('show');
  switchTab('achievements');
  document.getElementById('achForm').scrollIntoView({behavior:'smooth',block:'center'});
}
function deleteAchievement(id){
  openModal('删除业绩','确定删除这条业绩成果吗？此操作不可撤销。',function(){
    setColl('achievements',getColl('achievements').filter(function(x){return x.id!==id;}));
    refreshAll();toast('已删除');
  });
}

/* ===== 交互：待办 ===== */
function saveTodo(){
  var title=document.getElementById('todoTitle').value.trim();
  if(!title){toast('请填写待办事项');return;}
  var id=document.getElementById('todoId').value;
  var obj={title:title,type:document.getElementById('todoType').value,prio:document.getElementById('todoPrio').value,
    due:document.getElementById('todoDue').value,clause:document.getElementById('todoClause').value.trim(),
    note:document.getElementById('todoNote').value.trim(),done:false};
  var arr=getColl('todos');
  if(id){var i=arr.findIndex(function(x){return x.id===id;});if(i>=0){obj.id=id;obj.done=arr[i].done;arr[i]=obj;}toast('已更新');}
  else{obj.id=uid();arr.unshift(obj);toast('已新增');}
  setColl('todos',arr);
  document.getElementById('todoForm').classList.remove('show');
  refreshAll();
}
function editTodo(id){
  var x=getColl('todos').find(function(v){return v.id===id;});if(!x)return;
  document.getElementById('todoId').value=x.id;
  document.getElementById('todoTitle').value=x.title;
  document.getElementById('todoType').value=x.type;
  document.getElementById('todoPrio').value=x.prio;
  document.getElementById('todoDue').value=x.due||'';
  document.getElementById('todoClause').value=x.clause||'';
  document.getElementById('todoNote').value=x.note||'';
  document.getElementById('todoForm').classList.add('show');
  switchTab('todos');
  document.getElementById('todoForm').scrollIntoView({behavior:'smooth',block:'center'});
}
function deleteTodo(id){
  openModal('删除待办','确定删除这条待办吗？此操作不可撤销。',function(){
    setColl('todos',getColl('todos').filter(function(x){return x.id!==id;}));
    refreshAll();toast('已删除');
  });
}
function markTodoDone(id){
  var arr=getColl('todos');var i=arr.findIndex(function(x){return x.id===id;});
  if(i>=0){arr[i].done=true;setColl('todos',arr);refreshAll();toast('已标记完成');}
}
function setTodoFilter(f){state.todoFilter=f;document.querySelectorAll('#todoFilter .chip').forEach(function(c){c.classList.toggle('active',c.dataset.f===f);});renderTodos();}

/* ===== 备份与恢复 ===== */
function exportJSON(){
  var data={_app:'高级教师申报工作台',_exportAt:new Date().toISOString(),
    materials:getColl('materials'),criteria:getColl('criteria'),achievements:getColl('achievements'),todos:getColl('todos')};
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='高级教师申报工作台备份_'+todayStr()+'.json';a.click();URL.revokeObjectURL(a.href);
  toast('已导出 JSON 备份');
}
function importJSON(input){
  var f=input.files&&input.files[0];if(!f)return;
  var r=new FileReader();
  r.onload=function(){
    try{
      var d=JSON.parse(r.result);
      var need=['materials','criteria','achievements','todos'];
      var ok=need.filter(function(k){return Array.isArray(d[k]);});
      if(!ok.length){toast('文件格式不正确');return;}
      ok.forEach(function(k){setColl(k,d[k]);});
      S('seeded',true);
      refreshAll();toast('已恢复 '+ok.length+' 类数据');
    }catch(e){toast('导入失败：文件解析错误');}
  };
  r.readAsText(f);
  input.value='';
}
function confirmClearSample(){
  openModal('清空示例数据','将清空当前所有示例材料、业绩与待办（保留「条款对标」的评审标准）。确定继续吗？',function(){
    ['materials','achievements','todos'].forEach(function(k){setColl(k,[]);});
    S('seeded',true);
    refreshAll();toast('已清空示例数据');
  });
}

/* ===== 弹窗 ===== */
function openModal(title,text,onOk){
  document.getElementById('modalTitle').textContent=title;
  document.getElementById('modalText').textContent=text;
  state.modalOk=onOk;
  document.getElementById('modal-mask').classList.add('show');
}
function closeModal(){
  var cb=state.modalOk;
  document.getElementById('modal-mask').classList.remove('show');
  state.modalOk=null;
  if(cb)cb();
}
document.getElementById('modalOk').addEventListener('click',function(){closeModal();});
document.getElementById('modalCancel').addEventListener('click',function(){state.modalOk=null;document.getElementById('modal-mask').classList.remove('show');});
document.getElementById('modal-mask').addEventListener('click',function(e){if(e.target===this){state.modalOk=null;this.classList.remove('show');}});

/* ===== 暴露给内联 onclick ===== */
window.switchTab=switchTab;window.jumpTab=jumpTab;window.toggleForm=toggleForm;
window.saveMaterial=saveMaterial;window.editMaterial=editMaterial;window.deleteMaterial=deleteMaterial;
window.setCritStatus=setCritStatus;window.toggleCritEdit=toggleCritEdit;window.saveCrit=saveCrit;window.setCritFilter=setCritFilter;
window.saveAchievement=saveAchievement;window.editAchievement=editAchievement;window.deleteAchievement=deleteAchievement;
window.saveTodo=saveTodo;window.editTodo=editTodo;window.deleteTodo=deleteTodo;window.markTodoDone=markTodoDone;window.setTodoFilter=setTodoFilter;
window.exportJSON=exportJSON;window.importJSON=importJSON;window.confirmClearSample=confirmClearSample;window.closeModal=closeModal;

/* ===== 初始化 ===== */
loadAll();
refreshAll();
})();
