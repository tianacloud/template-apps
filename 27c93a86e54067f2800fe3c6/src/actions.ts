import { type Workspace, type Project, type Task, type Entry, type Module, uid, remainingTask, completionFor } from './model';
import { addDays, validDay, businessDay } from './dates';
import { type Replan, planningFingerprint, previewReplan } from './planning';
import { type Calibration, calibration } from './advanced';
import { DateTime } from 'luxon';

export function requireInteger(n: number, min: number, max: number, label: string) {
  if (!Number.isSafeInteger(n) || n < min || n > max) throw new Error(`${label}须为 ${min}–${max} 的整数`);
}
export function validate(s: Workspace) {
  if (s.settings.theme && !['warm','sage','blue','rose','night'].includes(s.settings.theme)) throw new Error('主题无效');
  if (s.schemaVersion !== 1) throw new Error('数据版本不受支持，请升级应用');
  if (!DateTime.now().setZone(s.settings.timeZone).isValid) throw new Error('时区无效');
  requireInteger(s.settings.startHour,0,10,'业务日起点');
  if (s.settings.weekly.length !== 7) throw new Error('每周容量须包含七天');
  [...s.settings.weekly,...Object.values(s.settings.overrides)].forEach(n => requireInteger(n,0,1440,'可投入分钟'));
  const ids = [...s.projects,...s.modules,...s.tasks,...s.entries,...s.completions].map(x => x.id);
  if (new Set(ids).size !== ids.length) throw new Error('记录标识重复');
  for (const [d,n] of Object.entries(s.notes)) if (!validDay(d) || n.length > 1000) throw new Error('随记日期或长度无效');
  for (const p of s.projects) {
    if (!p.name.trim() || p.name.length > 40) throw new Error('项目名称须为 1–40 字');
    if (!/^#[0-9a-f]{6}$/i.test(p.color)) throw new Error('项目颜色无效');
    if (p.startDate && !validDay(p.startDate) || p.deadline && !validDay(p.deadline)) throw new Error('项目日期无效');
    requireInteger(p.bufferDays,0,3650,'提前天数');
    if (p.deadline && p.startDate && p.startDate > addDays(p.deadline,-p.bufferDays)) throw new Error('开始日不能晚于计划完成日');
  }
  for (const m of s.modules) if (!s.projects.some(p => p.id === m.projectId) || !m.name.trim()) throw new Error('模块归属或名称无效');
  for (const t of s.tasks) {
    if (!t.title.trim() || t.title.length > 80) throw new Error('任务标题须为 1–80 字');
    requireInteger(t.minutes,1,525600,'任务预计分钟');
    if (!s.modules.some(m => m.id === t.moduleId && m.projectId === t.projectId)) throw new Error('任务归属无效');
  }
  for (const e of s.entries) {
    if (!e.title.trim() || e.title.length > 80) throw new Error('事项标题须为 1–80 字');
    requireInteger(e.minutes,1,525600,'事项预计分钟');
    if (e.date && !validDay(e.date) || e.due && !validDay(e.due)) throw new Error('事项日期无效');
    if (e.projectId && !s.projects.some(p => p.id === e.projectId)) throw new Error('事项项目不存在');
    if (e.taskId && !s.tasks.some(t => t.id === e.taskId)) throw new Error('项目任务不存在');
    if (!!e.start !== !!e.end || e.start && (!e.date || !/^\d{2}:\d{2}$/.test(e.start) || !/^\d{2}:\d{2}$/.test(e.end) || e.end <= e.start)) throw new Error('请填写同日有效的开始与结束时间');
    if (e.done !== !!completionFor(s,e)) throw new Error('完成状态与记录不一致');
  }
  if (s.entries.length > 20000 || s.tasks.length > 5000) throw new Error('当前工作区记录过多，请先导出并整理');
}
export function makeEntry(patch: Partial<Entry> = {}): Entry {
  return {id:uid(),taskId:null,projectId:null,moduleId:null,title:'',minutes:30,date:null,due:null,start:'',end:'',notes:'',done:false,version:1,...patch};
}
export function scheduleTask(s: Workspace, taskId: string, date: string | null): Entry | undefined {
  const task = s.tasks.find(t => t.id === taskId);
  if (!task) throw new Error('任务已被删除，请刷新');
  const minutes = remainingTask(s,task);
  if (!minutes) return;
  let entry = s.entries.find(e => e.taskId === taskId && !e.done);
  if (!date) {s.entries = s.entries.filter(e => e.taskId !== taskId || e.done); return;}
  if (!entry) {
    entry = makeEntry({taskId,projectId:task.projectId,moduleId:task.moduleId,title:task.title,notes:task.notes,minutes,date});
    s.entries.push(entry);
  } else {entry.date = date; entry.minutes = minutes; entry.version++;}
  return entry;
}
export function scheduleEntry(s: Workspace, id: string, date: string | null) {
  const e = s.entries.find(v => v.id === id);
  if (!e) throw new Error('事项已被删除');
  if (date && !validDay(date)) throw new Error('日期无效');
  if (e.taskId && !date && !e.done) {s.entries = s.entries.filter(v => v.id !== id); return;}
  if (e.due && e.due === e.date && date) e.due = date;
  e.date = date; e.version++;
  if (!date) {e.start = ''; e.end = '';}
}
export function complete(s: Workspace, id: string, actual: number | null, excluded: boolean, today = businessDay(s.settings)) {
  const e = s.entries.find(v => v.id === id);
  if (!e || e.done) throw new Error('事项不存在或已经完成，请刷新');
  if (actual !== null) requireInteger(actual,1,525600,'实际分钟');
  const task = s.tasks.find(t => t.id === e.taskId);
  const original = task?.originalMinutes ? Math.round(e.minutes*task.originalMinutes/task.minutes) : e.minutes;
  e.done = true; e.date ??= today; e.version++;
  s.completions.push({id:uid(),entryId:e.id,taskId:e.taskId,projectId:e.projectId,moduleId:e.moduleId,title:e.title,
    planned:e.minutes,original,actual,excluded,doneAt:new Date().toISOString()});
  syncTaskEntries(s);
}
export function undoComplete(s: Workspace, id: string) {
  const entry = s.entries.find(e => e.id === id);
  if (!entry?.done) throw new Error('没有可撤销的完成记录');
  entry.done = false; entry.version++;
  s.completions = s.completions.filter(c => c.entryId !== id);
  if (entry.taskId) {
    // Coalesce any later remainder schedule; retain this entry's date.
    s.entries = s.entries.filter(e => e.id === id || e.taskId !== entry.taskId || e.done);
  }
  syncTaskEntries(s);
}
export function syncTaskEntries(s: Workspace) {
  s.entries = s.entries.filter(e => !e.taskId || e.done || s.tasks.some(t => t.id === e.taskId && remainingTask(s,t) > 0));
  for (const e of s.entries.filter(e => e.taskId && !e.done)) {
    const t = s.tasks.find(t => t.id === e.taskId)!;
    const minutes = remainingTask(s,t);
    const changed = e.minutes !== minutes || e.title !== t.title || e.notes !== t.notes || e.moduleId !== t.moduleId;
    if (changed) {
      Object.assign(e,{minutes,title:t.title,notes:t.notes,moduleId:t.moduleId,projectId:t.projectId,start:'',end:'',version:e.version+1});
    }
  }
}
export function partialSuggestion(s: Workspace, id: string, completed: number, today: string) {
  const copy = structuredClone(s), e = copy.entries.find(e => e.id === id);
  if (!e || e.done) throw new Error('事项不存在或已完成');
  requireInteger(completed,1,e.minutes-1,'完成计划量');
  e.minutes -= completed; e.start = ''; e.end = '';
  return {...previewReplan(copy,today,[id],{date:e.date ?? today,minutes:completed}),fingerprint:planningFingerprint(s)};
}
export function partialComplete(s: Workspace, id: string, minutes: number, actual: number | null, excluded: boolean,
    remainderDate: string | null, fingerprint: string, today: string) {
  if (planningFingerprint(s) !== fingerprint) throw new Error('计划条件已变化，请重新预览');
  const e = s.entries.find(e => e.id === id);
  if (!e || e.done) throw new Error('事项不存在或已经完成');
  requireInteger(minutes,1,e.minutes-1,'本次完成量');
  const remaining = e.minutes-minutes, original = structuredClone(e);
  e.minutes = minutes; e.start = ''; e.end = '';
  complete(s,id,actual,excluded,today);
  if (e.taskId) scheduleTask(s,e.taskId,remainderDate);
  else s.entries.push(makeEntry({...original,id:uid(),minutes:remaining,date:remainderDate,
    due:original.due === original.date && remainderDate ? remainderDate : original.due,start:'',end:'',
    seriesId:undefined,continuationOf:id,done:false,version:1}));
}
export function applyReplan(s: Workspace, preview: Replan) {
  if (planningFingerprint(s) !== preview.fingerprint) throw new Error('预览后的计划条件已变化，请重新预览');
  for (const c of preview.changes) {
    const e = s.entries.find(e => e.id === c.id);
    if (!e || e.version !== preview.baseline[c.id] || e.done) throw new Error('预览后的事项已变化，请重新预览');
  }
  for (const c of preview.changes) scheduleEntry(s,c.id,c.date);
}
export function applyCalibration(s: Workspace, proposal: Calibration, accept: boolean) {
  const current = calibration(s,proposal.moduleId);
  if (!current || JSON.stringify(current) !== JSON.stringify(proposal)) throw new Error('校准条件已变化，请重新查看');
  if (accept) for (const change of current.changes) {
    const task = s.tasks.find(t => t.id === change.taskId)!;
    task.originalMinutes ??= task.minutes;
    task.minutes = change.minutes;
  }
  s.calibrations.push({moduleId:proposal.moduleId,signature:proposal.signature,accepted:accept});
  syncTaskEntries(s);
}
export function removeEntry(s: Workspace, id: string) {
  s.entries = s.entries.filter(e => e.id !== id);
  s.completions = s.completions.filter(c => c.entryId !== id);
  syncTaskEntries(s);
}
export function removeProject(s: Workspace, id: string) {
  const moduleIds = new Set(s.modules.filter(m => m.projectId === id).map(m => m.id));
  s.projects = s.projects.filter(p => p.id !== id);
  s.modules = s.modules.filter(m => m.projectId !== id);
  s.tasks = s.tasks.filter(t => t.projectId !== id);
  s.entries = s.entries.filter(e => e.projectId !== id);
  s.completions = s.completions.filter(c => c.projectId !== id);
  s.calibrations = s.calibrations.filter(c => !moduleIds.has(c.moduleId));
  for (const target of Object.values(s.targets)) delete target[id];
}
export function saveProject(s: Workspace, project: Project, modules: Module[], tasks: Task[], schedules: Record<string,string>) {
  const oldTasks = new Set(s.tasks.filter(t => t.projectId === project.id).map(t => t.id));
  const kept = new Set(tasks.map(t => t.id));
  s.projects = s.projects.some(p => p.id === project.id) ? s.projects.map(p => p.id === project.id ? project : p) : [...s.projects,project];
  s.modules = [...s.modules.filter(m => m.projectId !== project.id),...modules];
  s.tasks = [...s.tasks.filter(t => t.projectId !== project.id),...tasks];
  const removed = new Set([...oldTasks].filter(id => !kept.has(id)));
  s.entries = s.entries.filter(e => !e.taskId || !removed.has(e.taskId));
  s.completions = s.completions.filter(c => !c.taskId || !removed.has(c.taskId));
  syncTaskEntries(s);
  for (const task of tasks) scheduleTask(s,task.id,schedules[task.id] || null);
}
