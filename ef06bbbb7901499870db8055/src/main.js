import { createTianaFetch } from '@tianacloud/serverless';
import standalone from "./standalone.html";
import css from "./style.css";
import body from "./body.html";
const style=document.createElement("style");style.textContent=css;document.head.appendChild(style);document.getElementById("app").innerHTML=body;
// 常量定义
const STUDENT_COUNT = 64;
const TASK_PREFIX = 'class_task_'; 
const SUBJECT_PREFIX = 'class_subject_'; 
const STUDENT_NAMES_KEY = 'class_student_names'; 
const CLASS_NAME_KEY = 'class_name';
const LONG_PRESS_DELAY = 1200;
const SUBJECT_OPTIONS = ['地理', '语文', '数学', '物理', '其他']; 
const DEBOUNCE_DELAY = 500;

// 数据先从安装实例加载，再按键顺序写入数据库。
const values = Object.create(null);
let connection, sqlFetch, writeQueue = Promise.resolve(), failed = false, pendingWrites = 0;
async function sql(statement, args = []) {
  const response = await sqlFetch(`${connection.origin}/v3/pipeline`, {
    method: 'POST', headers: {'content-type': 'application/json'},
    body: JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args:args.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})
  });
  if (!response.ok) throw new Error('数据库请求结果未确认');
  const result = (await response.json()).results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库操作失败');
  return result.response.result;
}
function queueWrite(statement, args) {
  if (failed) return;
  pendingWrites++;
  writeQueue = writeQueue.then(() => { if (!failed) return sql(statement, args); }).catch(() => {
    failed = true;
    document.getElementById('app').inert = true;
    document.getElementById('db-status').textContent = '保存结果未确认，请刷新页面核对数据后再操作。';
  }).finally(() => { pendingWrites--; });
}
const storage = new Proxy(values, {
  get(target, key) {
    if (key === 'getItem') return k => Object.hasOwn(target,k) ? target[k] : null;
    if (key === 'setItem') return (k,v) => { target[k]=String(v); queueWrite('INSERT INTO classroom_state (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[k,String(v)]); };
    if (key === 'removeItem') return k => { delete target[k]; queueWrite('DELETE FROM classroom_state WHERE key=?',[k]); };
    if (key === 'length') return Object.keys(target).length;
    if (key === 'key') return i => Object.keys(target)[i] ?? null;
    return target[key];
  }
});
window.addEventListener('beforeunload', event => { if (pendingWrites) { event.preventDefault(); event.returnValue = ''; } });

// 防抖工具函数
function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// 高频操作使用防抖版存储
const debouncedSaveTaskData = () => saveTaskData();
const debouncedSaveStudentNames = () => saveStudentNames();

// 修仙等级定义
const CULTIVATION_LEVELS = [
  { threshold: 0, name: "普通凡人", symbol: "🐒", color: "var(--level-0-color)" },
  { threshold: 1, name: "筑基", symbol: "🌱", color: "var(--level-1-color)" },
  { threshold: 3, name: "金丹", symbol: "🌿", color: "var(--level-2-color)" },
  { threshold: 6, name: "元婴", symbol: "🌳", color: "var(--level-3-color)" },
  { threshold: 10, name: "大乘", symbol: "🌸", color: "var(--level-4-color)" },
  { threshold: 15, name: "化神", symbol: "🍎", color: "var(--level-5-color)" }
];

// 全局变量
let currentSubject = '默认科目'; 
let currentTask = '默认任务'; 
let currentClassName = '默认班级'; 

// 防苍蝇误触记录
let lastTouchTimes = {};

// 默认学生名
const DEFAULT_STUDENT_NAMES = Array.from({length: STUDENT_COUNT}, (_, i) => `学生${i + 1}`);

// 学生数据初始化
let students = Array.from({length:STUDENT_COUNT},(_,i)=>({
  id:i,
  name: DEFAULT_STUDENT_NAMES[i] || `学生${i+1}`,
  isLeader: false,
  totalCompletedTasks: 0  
}));

let completedOrder = []; 

let groupRows = 3; 

// 触摸相关变量
let longPressTimer = null;
let currentTouchIndex = null;



function init(){
  checkAndSetClassName();
  loadStudentNames();
  
  const latestSubject = getLatestSubjectKey();
  if(latestSubject) {
    currentSubject = latestSubject;
  } else {
    currentSubject = SUBJECT_OPTIONS[0];
  }
  
  const latestTask = getLatestTaskKey();
  if(latestTask) currentTask = latestTask;
  
  if(!storage.getItem(subjectKey(currentSubject))) {
    saveSubjectData();
  }
  
  if(!storage.getItem(taskKey(currentSubject, currentTask))) {
    saveTaskData();
  }
  
  loadTaskData();
  recalculateTotalCompletedTasks(currentSubject);
  renderStudents();
  updateSubjectSelector();
  updateTaskSelector();
  updateHeaderTitle();
  updateStats();
  
  // 输入弹窗：回车=确定
  document.getElementById('inputValue').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') submitInput();
  });

  // 事件委托：所有学生按钮事件在容器上统一处理
  const container = document.getElementById('studentContainer');
  container.addEventListener('click', handleStudentClick);
  container.addEventListener('dblclick', renameStudent);
  
  // 触摸事件委托（拖拽换位已移除，保留点按点亮 + 长按改名）
  container.addEventListener('touchstart', handleTouchStart, { passive: false });
  container.addEventListener('touchend', handleTouchEnd, { passive: false });
  container.addEventListener('touchcancel', handleTouchCancel, { passive: false });
  
  const buttons = document.querySelectorAll('button');
  buttons.forEach(btn => {
    // 学生按钮已有独立的 touch 处理，跳过以防重复
    if (btn.classList.contains('student-btn')) return;
    
    btn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      this.classList.add('touch-active');
    }, {passive: false});
    
    btn.addEventListener('touchend', function(e) {
      e.preventDefault();
      this.classList.remove('touch-active');
      this.click();
    }, {passive: false});
    
    btn.addEventListener('touchcancel', function(e) {
      this.classList.remove('touch-active');
    }, {passive: false});
  });
  
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('touchstart', function(e) {
      this.focus();
    }, {passive: false});
  });
  
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
  
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
}

// ========== 页面内输入弹窗（替代系统 prompt，规避 iPad Edge「抑制对话框」误触） ==========
let inputCallback = null;

function showInputModal(title, defaultValue, cb) {
  document.getElementById('inputTitle').textContent = title;
  const inp = document.getElementById('inputValue');
  inp.value = defaultValue || '';
  inputCallback = cb;
  document.getElementById('inputModal').classList.add('visible');
  setTimeout(() => { inp.focus(); inp.select(); }, 120);
}

function submitInput() {
  const v = document.getElementById('inputValue').value.trim();
  const cb = inputCallback;
  closeInput();
  if (cb) cb(v);
}

function closeInput() {
  document.getElementById('inputModal').classList.remove('visible');
  inputCallback = null;
}

function onInputOverlayClick(e) {
  if (e.target === e.currentTarget) closeInput();
}

function checkAndSetClassName() {
  const saved = storage.getItem(CLASS_NAME_KEY);
  if (saved) {
    currentClassName = saved;
    updateClassNameDisplay();
    return;
  }
  // 初次使用：用页面内弹窗设置班级名（后续渲染不依赖它，异步无碍）
  showInputModal('初次使用，请设置班级名称（例如：高三1班）', '默认班级', v => {
    currentClassName = v ? v : '默认班级';
    storage.setItem(CLASS_NAME_KEY, currentClassName);
    updateClassNameDisplay();
  });
}

function changeClassName() {
  showInputModal('修改班级名称：', currentClassName, v => {
    if (v) {
      currentClassName = v;
      storage.setItem(CLASS_NAME_KEY, currentClassName);
      updateClassNameDisplay();
    }
  });
}

function updateClassNameDisplay() {
  const el = document.getElementById('headerClassName');
  if (el) {
    el.textContent = '【' + currentClassName + '】';
  }
}

function updateHeaderTitle() {
  const headerTaskName = document.getElementById('headerTaskName');
  if(headerTaskName) {
    headerTaskName.textContent = currentTask;
  }
}

function getCultivationLevel(totalCompleted) {
  for (let i = CULTIVATION_LEVELS.length - 1; i >= 0; i--) {
    if (totalCompleted >= CULTIVATION_LEVELS[i].threshold) {
      return CULTIVATION_LEVELS[i];
    }
  }
  return CULTIVATION_LEVELS[0]; 
}

function subjectKey(n){return SUBJECT_PREFIX+n;}
function subjectTsKey(n){return SUBJECT_PREFIX+n+"_ts";}

function taskKey(subject, task){return SUBJECT_PREFIX+subject+"_"+TASK_PREFIX+task;}
function taskTsKey(subject, task){return SUBJECT_PREFIX+subject+"_"+TASK_PREFIX+task+"_ts";}

function getLatestSubjectKey(){
  const keys = Object.keys(storage)
    .filter(k=>k.startsWith(SUBJECT_PREFIX)&&!k.endsWith("_ts")&&!k.includes(TASK_PREFIX) &&
              SUBJECT_OPTIONS.includes(k.slice(SUBJECT_PREFIX.length)));
  if(keys.length===0) return null;
  const subjects = keys.map(k=>k.slice(SUBJECT_PREFIX.length));
  subjects.sort((a,b)=>{
    const ta=+storage.getItem(subjectTsKey(a))||0;
    const tb=+storage.getItem(subjectTsKey(b))||0;
    return tb-ta;
  });
  return subjects[0];
}

function getLatestTaskKey(){
  const keys = Object.keys(storage)
    .filter(k=>k.startsWith(subjectKey(currentSubject) + "_" + TASK_PREFIX)&&!k.endsWith("_ts"));
  if(keys.length===0) return null;
  const tasks = keys.map(k=>k.slice(subjectKey(currentSubject).length + 1 + TASK_PREFIX.length));
  tasks.sort((a,b)=>{
    const ta=+storage.getItem(taskTsKey(currentSubject, a))||0;
    const tb=+storage.getItem(taskTsKey(currentSubject, b))||0;
    return tb-ta;
  });
  return tasks[0];
}

function loadStudentNames() {
  const savedNames = storage.getItem(STUDENT_NAMES_KEY);
  if (savedNames) {
    try {
      const parsedNames = JSON.parse(savedNames);
      parsedNames.forEach((parsedStudent, index) => {
        if (students[index] && parsedStudent) {
          if (parsedStudent.id !== undefined) students[index].id = parsedStudent.id;
          if (parsedStudent.name !== undefined) students[index].name = parsedStudent.name;
          if (parsedStudent.isLeader !== undefined) students[index].isLeader = parsedStudent.isLeader;
        }
      });
    } catch (e) {
      console.error("加载学生数据失败:", e);
    }
  }
}

// 用默认名单填充学生名并保存
function applyDefaultNames() {
  students.forEach((student, i) => {
    student.name = DEFAULT_STUDENT_NAMES[i] || `学生${i + 1}`;
  });
  saveStudentNames();
}

function saveStudentNames() {
  try {
    const namesToSave = students.map(student => ({
      id: student.id,
      name: student.name,
      isLeader: student.isLeader
    }));
    storage.setItem(STUDENT_NAMES_KEY, JSON.stringify(namesToSave));
  } catch (e) {
    console.error("保存学生数据失败:", e);
  }
}

function saveSubjectData() {
  try {
    storage.setItem(subjectKey(currentSubject), JSON.stringify({exists: true}));
    storage.setItem(subjectTsKey(currentSubject), Date.now().toString());
  } catch (e) {}
}

function loadTaskData() {
  const taskDataKey = taskKey(currentSubject, currentTask);
  const savedData = storage.getItem(taskDataKey);
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      students.forEach(student => {
        const savedStudent = parsedData.students.find(s => s.id === student.id);
        student.completed = savedStudent ? (savedStudent.completed || false) : false;
      });
      completedOrder = parsedData.completedOrder || [];
    } catch (e) {
      resetTaskData();
    }
  } else {
    resetTaskData();
  }
}

function saveTaskData() {
  try {
    const dataToSave = {
      students: students.map(student => ({
        id: student.id,
        completed: student.completed
      })),
      completedOrder: completedOrder
    };
    const taskDataKey = taskKey(currentSubject, currentTask);
    storage.setItem(taskDataKey, JSON.stringify(dataToSave));
    storage.setItem(taskTsKey(currentSubject, currentTask), Date.now().toString());
  } catch (e) {}
}

function resetTaskData() {
  students.forEach(student => { student.completed = false; });
  completedOrder = [];
  saveTaskData();
}

function recalculateTotalCompletedTasks(subject = currentSubject) {
  students.forEach(s => s.totalCompletedTasks = 0);
  const targetPrefix = subjectKey(subject) + "_" + TASK_PREFIX;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key.startsWith(targetPrefix) && !key.endsWith('_ts')) {
      try {
        const taskData = JSON.parse(storage.getItem(key));
        if (taskData && taskData.students) {
          taskData.students.forEach(ts => {
            if (ts.completed) {
              const stu = students.find(s => s.id === ts.id);
              if (stu) stu.totalCompletedTasks++;
            }
          });
        }
      } catch(e) {}
    }
  }
}

function isFlyTouching(index) {
  const now = Date.now();
  if (lastTouchTimes[index] && (now - lastTouchTimes[index] < DEBOUNCE_DELAY)) {
    return true; 
  }
  lastTouchTimes[index] = now;
  return false;
}

function escapeHtml(value){ const el=document.createElement("span"); el.textContent=value; return el.innerHTML; }
function renderStudents(){
  const container=document.getElementById('studentContainer');
  container.innerHTML='';
  const rows=Math.ceil(STUDENT_COUNT/8);
  
  for(let r=0;r<rows;r++){
    const base=r*8;
    const order=[0,1,'a',2,3,'a',4,5,'a',6,7];
    
    order.forEach(item=>{
      if(item==='a'){
        const aisle=document.createElement('div');
        aisle.className='aisle';
        container.appendChild(aisle);
      }else{
        const idx=base+item;
        if(idx>=STUDENT_COUNT){
          const empty=document.createElement('div');
          empty.className='aisle';
          container.appendChild(empty);
        }else{
          const s=students[idx];
          const btn=document.createElement('button');
          
          let className = 'student-btn';
          if (s.completed) className += ' completed';
          if (s.isLeader) className += ' leader';
          btn.className = className;

          if (s.completed) {
            btn.style.setProperty('--aura-delay', `${-(Math.random() * 6).toFixed(2)}s`);
          }
          
          const level = getCultivationLevel(s.totalCompletedTasks);
          
          btn.innerHTML = '<span class="cultivation-symbol" style="color: ' + level.color + '">' + level.symbol + '</span>' + '<span class="student-name">' + escapeHtml(s.name) + '</span>' + '<span class="total-tasks-badge">' + s.totalCompletedTasks + '</span>';
          
          btn.dataset.index=idx;
          const orderNum=completedOrder.indexOf(s.id);
          btn.dataset.order=orderNum>=0?(orderNum+1):'';
          
          container.appendChild(btn);
        }
      }
    });
    
    if((r+1)%groupRows===0 && r!==rows-1){
      const sep=document.createElement('div');
      sep.className='group-separator';
      container.appendChild(sep);
    }
  }
}

function handleStudentClick(e) {
  const btn = getStudentBtn(e);
  if (!btn) return;
  
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }
  
  const idx = +btn.dataset.index;
  if (isFlyTouching(idx)) return;
  
  toggleStatus(e);
}

function handleTouchStart(e) {
  const btn = getStudentBtn(e);
  if (!btn) { e.preventDefault(); return; }
  
  currentTouchIndex = parseInt(btn.dataset.index);
  
  e.preventDefault();
  btn.classList.add('touch-active');
  
  longPressTimer = setTimeout(() => {
    if (currentTouchIndex !== null) {
      renameStudentByIndex(currentTouchIndex);
      currentTouchIndex = null; // 长按已处理，抬手时不再触发点亮
    }
    longPressTimer = null;
  }, LONG_PRESS_DELAY);
}

function handleTouchEnd(e) {
  const btn = getStudentBtn(e);
  if (!btn) { e.preventDefault(); return; }
  btn.classList.remove('touch-active');
  
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  
  if (currentTouchIndex !== null) {
    handleStudentClick({ target: btn });
  }
  
  currentTouchIndex = null;
  e.preventDefault();
}

function handleTouchCancel(e) {
  const btn = getStudentBtn(e);
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  if (btn) btn.classList.remove('touch-active');
  currentTouchIndex = null;
}

function renameStudentByIndex(index) {
  showInputModal('请输入弟子名讳：', students[index].name, newName => {
    if (newName) {
      students[index].name = newName;
      saveStudentNames();
      saveTaskData();
      syncStudentBtn(index);
    }
  });
}

function getStudentBtn(e) {
  return e.target.closest('.student-btn');
}

function toggleStatus(e){
  const btn = getStudentBtn(e);
  const idx = +btn.dataset.index;
  const stu=students[idx];
  const orderIdx = completedOrder.indexOf(stu.id);
  
  if(stu.completed){
    if(orderIdx>=0) completedOrder.splice(orderIdx,1);
    stu.totalCompletedTasks = Math.max(0, stu.totalCompletedTasks - 1);
  }else{
    completedOrder.push(stu.id);
    stu.totalCompletedTasks++;
  }
  
  stu.completed=!stu.completed;
  debouncedSaveStudentNames();
  debouncedSaveTaskData();
  
  // 只更新当前按钮的 DOM，不重建全部按钮
  if (stu.completed) {
    btn.classList.add('completed');
    btn.style.setProperty('--aura-delay', `${-(Math.random() * 6).toFixed(2)}s`);
  } else {
    btn.classList.remove('completed');
    btn.style.removeProperty('--aura-delay');
  }
  
  // 更新完成顺序角标
  const newOrderIdx = completedOrder.indexOf(stu.id);
  btn.dataset.order = newOrderIdx >= 0 ? (newOrderIdx + 1) : '';
  
  // 更新修仙等级符号
  const level = getCultivationLevel(stu.totalCompletedTasks);
  const symbolSpan = btn.querySelector('.cultivation-symbol');
  if (symbolSpan) {
    symbolSpan.textContent = level.symbol;
    symbolSpan.style.color = level.color;
  }
  
  // 更新总完成数角标
  const badge = btn.querySelector('.total-tasks-badge');
  if (badge) {
    badge.textContent = stu.totalCompletedTasks;
  }
  
  updateStats();
}

function renameStudent(e){
  const btn = getStudentBtn(e);
  if (!btn) return;
  const idx=+btn.dataset.index;
  showInputModal('请输入弟子名讳：', students[idx].name, newName => {
    if (newName) {
      students[idx].name = newName;
      saveStudentNames();
      saveTaskData();
      syncStudentBtn(idx);
    }
  });
}

function updateStats(){
  const completed=students.filter(s=>s.completed).length;
  document.getElementById('completedCount').textContent=completed;
  document.getElementById('totalCount').textContent=STUDENT_COUNT;
  updateLevelCounts();
}

// 各修仙境界人数统计（纯展示）
function updateLevelCounts() {
  const counts = [0, 0, 0, 0, 0, 0];
  students.forEach(s => {
    for (let i = CULTIVATION_LEVELS.length - 1; i >= 0; i--) {
      if (s.totalCompletedTasks >= CULTIVATION_LEVELS[i].threshold) { counts[i]++; break; }
    }
  });
  counts.forEach((n, i) => {
    const el = document.getElementById('levelCount' + i);
    if (el) el.textContent = n;
  });
}

// 局部更新单个学生按钮，避免全量重渲染
function syncStudentBtn(idx) {
  const btn = document.querySelector(`.student-btn[data-index="${idx}"]`);
  if (!btn) return;
  const s = students[idx];
  btn.className = 'student-btn' + (s.completed ? ' completed' : '') + (s.isLeader ? ' leader' : '');
  if (s.completed) {
    btn.style.setProperty('--aura-delay', `${-(Math.random() * 6).toFixed(2)}s`);
  } else {
    btn.style.removeProperty('--aura-delay');
  }
  const level = getCultivationLevel(s.totalCompletedTasks);
  const orderNum = completedOrder.indexOf(s.id);
  btn.innerHTML = '<span class="cultivation-symbol" style="color:' + level.color + '">' + level.symbol + '</span>' + '<span class="student-name">' + escapeHtml(s.name) + '</span>' + '<span class="total-tasks-badge">' + s.totalCompletedTasks + '</span>';
  btn.dataset.order = orderNum >= 0 ? (orderNum + 1) : '';
}

function updateSubjectSelector(){
  const selector=document.getElementById('subjectSelector');
  selector.innerHTML='';
  SUBJECT_OPTIONS.forEach(subject=>{
    const opt=document.createElement('option');
    opt.value=subject;
    opt.textContent=subject;
    if(subject===currentSubject) opt.selected=true;
    selector.appendChild(opt);
  });
}

function updateTaskSelector(){
  const selector=document.getElementById('taskSelector');
  selector.innerHTML='';
  const tasks = Object.keys(storage)
    .filter(k=>k.startsWith(subjectKey(currentSubject) + "_" + TASK_PREFIX)&&!k.endsWith("_ts"))
    .map(k=>k.slice(subjectKey(currentSubject).length + 1 + TASK_PREFIX.length))
    .sort((a,b)=>{
      const ta=+storage.getItem(taskTsKey(currentSubject, a))||0;
      const tb=+storage.getItem(taskTsKey(currentSubject, b))||0;
      return tb-ta;
    });
  
  tasks.forEach(task=>{
    const opt=document.createElement('option');
    opt.value=task;
    opt.textContent=task;
    if(task===currentTask) opt.selected=true;
    selector.appendChild(opt);
  });
}

function switchSubject(subjectName){
  if(!subjectName||subjectName===currentSubject) return;
  saveTaskData();
  currentSubject=subjectName;
  const latestTask = getLatestTaskKey();
  if(latestTask) {
    currentTask = latestTask;
  } else {
    currentTask='默认任务';
    if(!storage.getItem(taskKey(currentSubject, currentTask))){
      resetTaskData();
    }
  }
  saveSubjectData();
  loadTaskData();
  recalculateTotalCompletedTasks(currentSubject); 
  renderStudents();
  updateTaskSelector();
  updateHeaderTitle(); 
  updateStats();
}

function createNewTask(){
  const nameInput=document.getElementById('newTaskName');
  const newName=nameInput.value.trim();
  if(!newName){ alert('请指定新的修炼任务'); return; }
  if(storage.getItem(taskKey(currentSubject, newName))){ alert('该任务已存在'); return; }
  
  saveTaskData();
  currentTask=newName;
  resetTaskData();
  renderStudents();
  updateTaskSelector();
  updateHeaderTitle(); 
  updateStats();
  nameInput.value='';
}

function switchTask(taskName){
  if(!taskName||taskName===currentTask) return;
  saveTaskData();
  currentTask=taskName;
  loadTaskData();
  renderStudents();
  updateHeaderTitle(); 
  updateStats();
}

function renameCurrentTask(){
  showInputModal('请输入新的任务名称：', currentTask, newName => {
    if(newName && newName !== currentTask){
      if(storage.getItem(taskKey(currentSubject, newName))){
        alert('该任务名称已存在'); return;
      }
      const oldKey=taskKey(currentSubject, currentTask);
      const oldTsKey=taskTsKey(currentSubject, currentTask);
      const newKey=taskKey(currentSubject, newName);
      const newTsKey=taskTsKey(currentSubject, newName);
      const data=storage.getItem(oldKey);
      if(data){
        storage.setItem(newKey, data);
        storage.setItem(newTsKey, Date.now().toString());
      }
      storage.removeItem(oldKey);
      storage.removeItem(oldTsKey);
      currentTask=newName;
      updateTaskSelector();
      updateHeaderTitle();
    }
  });
}

function deleteCurrentTask(){
  if(currentTask==='默认任务' && confirm('确定要废弃默认任务吗？这将清除当前修仙科目的所有完成状态！')){
    storage.removeItem(taskKey(currentSubject, currentTask));
    storage.removeItem(taskTsKey(currentSubject, currentTask));
    currentTask='默认任务';
    resetTaskData();
    recalculateTotalCompletedTasks(currentSubject); 
    renderStudents();
    updateTaskSelector();
    updateHeaderTitle(); 
    updateStats();
  } else if(currentTask!=='默认任务' && confirm(`确定要废弃任务"${currentTask}"吗？`)){
    storage.removeItem(taskKey(currentSubject, currentTask));
    storage.removeItem(taskTsKey(currentSubject, currentTask));
    const tasks = Object.keys(storage)
      .filter(k=>k.startsWith(subjectKey(currentSubject) + "_" + TASK_PREFIX)&&!k.endsWith("_ts"))
      .map(k=>k.slice(subjectKey(currentSubject).length + 1 + TASK_PREFIX.length));
    
    if(tasks.length>0){
      currentTask = tasks[0];
      loadTaskData();
    } else {
      currentTask='默认任务';
      resetTaskData();
    }
    recalculateTotalCompletedTasks(currentSubject); 
    renderStudents();
    updateTaskSelector();
    updateHeaderTitle(); 
    updateStats();
  }
}

// ========== 使用说明弹窗 ==========
function showHelp() {
  document.getElementById('helpModal').classList.add('visible');
}

function closeHelp() {
  document.getElementById('helpModal').classList.remove('visible');
}

function onHelpOverlayClick(e) {
  // 只在点击遮罩空白处时关闭，点击卡片内部不关闭
  if (e.target === e.currentTarget) {
    closeHelp();
  }
}

// ========== 下载本文件 ==========
function downloadSelf() {
  const url = URL.createObjectURL(new Blob([standalone], {type: 'text/html;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = '修仙之路.html'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

Object.assign(window,{debounce,init,showInputModal,submitInput,closeInput,onInputOverlayClick,checkAndSetClassName,changeClassName,updateClassNameDisplay,updateHeaderTitle,getCultivationLevel,subjectKey,subjectTsKey,taskKey,taskTsKey,getLatestSubjectKey,getLatestTaskKey,loadStudentNames,applyDefaultNames,saveStudentNames,saveSubjectData,loadTaskData,saveTaskData,resetTaskData,recalculateTotalCompletedTasks,isFlyTouching,renderStudents,handleStudentClick,handleTouchStart,handleTouchEnd,handleTouchCancel,renameStudentByIndex,getStudentBtn,toggleStatus,renameStudent,updateStats,updateLevelCounts,syncStudentBtn,updateSubjectSelector,updateTaskSelector,switchSubject,createNewTask,switchTask,renameCurrentTask,deleteCurrentTask,showHelp,closeHelp,onHelpOverlayClick,downloadSelf});
for (const el of document.querySelectorAll('[data-handler-click], [data-handler-change]')) {
  for (const type of ['click','change']) {
    const code = el.dataset['handler' + type[0].toUpperCase() + type.slice(1)];
    if (!code) continue;
    const match = /^(\w+)\((this\.value|event)?\)$/.exec(code);
    if (match) el.addEventListener(type, event => window[match[1]](match[2] === 'event' ? event : match[2] === 'this.value' ? el.value : undefined));
  }
}
const status = document.createElement('div');
status.id = 'db-status'; status.setAttribute('role','status');
status.textContent = '正在加载数据…'; document.body.prepend(status);
document.getElementById('app').inert = true;
(async () => {
  try {
    if (typeof window.tiana?.auth?.getAccessToken !== 'function') throw new Error('缺少账号授权');
    connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw new Error('数据库协议不支持参数化操作');
    sqlFetch = createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
    const result = await sql('SELECT key,value FROM classroom_state');
    for (const row of result.rows || []) values[row[0].value] = row[1].value;
    init(); document.getElementById('app').inert = false; status.textContent = '';
  } catch (error) { status.textContent = '数据加载失败，请检查连接后刷新页面。'; console.error(error); }
})();
