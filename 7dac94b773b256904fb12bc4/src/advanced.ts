import { type Workspace, type Project, type Completion, completedPlan, remainingTask, projectWork, spent, sum } from './model';
import { addDays, daysBetween, capacity } from './dates';
import { plan } from './planning';

const sampleMinutes = (c: Completion) => c.original || c.planned;
function validSample(c: Completion) { return !!c.taskId && !c.excluded && (c.actual ?? 0) > 0 && sampleMinutes(c) > 0; }
export interface Calibration {
  moduleId: string; signature: string; sampleCount: number; ratio: number;
  previous: number; suggested: number; changes: {taskId: string; minutes: number}[];
}
export function calibration(s: Workspace, moduleId: string): Calibration | null {
  const samples = s.completions.filter(c => c.moduleId === moduleId && validSample(c));
  if (samples.length < 2) return null;
  const signature = JSON.stringify(samples.map(c => [c.id,c.actual,sampleMinutes(c)]).sort((a,b) => String(a[0]).localeCompare(String(b[0]))));
  if (s.calibrations.some(c => c.moduleId === moduleId && c.signature === signature)) return null;
  const ratio = sum(samples.map(c => c.actual!))/sum(samples.map(sampleMinutes));
  const tasks = s.tasks.filter(t => t.moduleId === moduleId && completedPlan(s,t.id) === 0);
  const changes = tasks.map(t => ({taskId:t.id,minutes:Math.max(5,Math.round((t.originalMinutes ?? t.minutes)*ratio/5)*5)}));
  const previous = sum(tasks.map(t => t.minutes)), suggested = sum(changes.map(c => c.minutes));
  if (!tasks.length || Math.abs(suggested-previous) < Math.max(15,previous*.1)) return null;
  return {moduleId,signature,sampleCount:samples.length,ratio,previous,suggested,changes};
}
export function unusualActual(s: Workspace, moduleId: string | null, value: number, entryId?: string) {
  if (!moduleId || value <= 0) return false;
  const samples = s.completions.filter(c => c.moduleId === moduleId && c.entryId !== entryId && validSample(c));
  if (samples.length < 3) return false;
  const avg = sum(samples.map(c => c.actual!))/samples.length;
  return value > avg*2 || value < avg/2;
}
export interface Prediction {
  status: 'longterm'|'complete'|'insufficient'|'estimated'|'beyond-horizon';
  date: string | null; average: number; sampleCount: number; observedDays: number; ratio: number; adjustedRemaining: number;
}
export function prediction(s: Workspace, p: Project, today: string): Prediction {
  const work = projectWork(s,p.id);
  const base: Prediction = {status:'insufficient',date:null,average:0,sampleCount:0,observedDays:0,ratio:1,adjustedRemaining:work.remaining};
  if (!p.deadline) return {...base,status:'longterm'};
  if (work.count && work.remaining <= .6) return {...base,status:'complete',date:today};
  const earliest = [p.createdDate,...s.entries.filter(e => e.projectId === p.id && e.date).map(e => e.date!)].sort()[0];
  const start = [addDays(today,-13),p.startDate ?? earliest].sort().at(-1)!;
  const entries = s.entries.filter(e => e.projectId === p.id && e.date && e.date >= start && e.date <= today && e.done);
  const observed = daysBetween(start,today).filter(d => entries.some(e => e.date === d) || d < today && capacity(d,s.settings) > 0);
  const invested = sum(entries.map(e => spent(s,e)));
  const samples = s.completions.filter(c => !c.excluded && (c.actual ?? 0) > 0 && sampleMinutes(c) > 0 && entries.some(e => e.id === c.entryId));
  const ratio = samples.length >= 3 ? sum(samples.map(c => c.actual!))/sum(samples.map(sampleMinutes)) : 1;
  const adjustedRemaining = sum(s.tasks.filter(t => t.projectId === p.id).map(t => remainingTask(s,t)*(t.originalMinutes === undefined ? ratio : 1))) +
    sum(s.entries.filter(e => e.projectId === p.id && !e.taskId && !e.done).map(e => e.minutes*ratio));
  const average = observed.length ? invested/observed.length : 0;
  const info = {...base,sampleCount:entries.length,observedDays:observed.length,ratio,adjustedRemaining,average};
  if (entries.length < 3 || !observed.length || invested <= 0) return info;
  let left = adjustedRemaining;
  const first = entries.some(e => e.date === today) ? addDays(today,1) : today;
  for (let i=0; i<1500; i++) {
    const d = addDays(first,i);
    if (capacity(d,s.settings) <= 0) continue;
    left -= average;
    if (left <= 0) return {...info,status:'estimated',date:d};
  }
  return {...info,status:'beyond-horizon'};
}
export function projectRisk(s: Workspace, p: Project, today: string) {
  const computed = plan(s,today), item = computed.projects.find(v => v.projectId === p.id)!;
  if (item.status === 'empty') return '等待添加任务';
  if (item.status === 'complete') return '已完成';
  if (!p.deadline) return '长期推进';
  if (item.status === 'overdue') return '已逾期';
  if (item.status === 'notstarted') return '尚未开始';
  const forecast = prediction(s,p,today), target = addDays(p.deadline,-p.bufferDays);
  if (forecast.status === 'estimated' && forecast.date) {
    if (forecast.date <= target) return '节奏平稳';
    if (forecast.date >= p.deadline) return '需要调整';
    if (forecast.date >= addDays(target,Math.ceil(p.bufferDays/2))) return '有些紧张';
    return '节奏平稳';
  }
  if (item.capacityRisk || !item.available.length) return '需要调整';
  if (item.status === 'buffer' || item.available.some(d => (computed.total[d] ?? 0) > capacity(d,s.settings))) return '有些紧张';
  return '节奏平稳';
}
