import { type Workspace, type Day, type Project, type Entry, projectWork, sum, spent } from './model';
import { addDays, capacity, daysBetween, distance } from './dates';

export interface ProjectPlan {
  projectId: string; targetDate: Day | null; endDate: Day | null; available: Day[];
  remaining: number; allocations: Record<Day, number>; fixed: Record<Day, number>;
  status: 'longterm'|'empty'|'complete'|'overdue'|'notstarted'|'no-capacity'|'buffer'|'ontrack';
  capacityRisk: boolean; unallocated: number;
}
export interface Plan { projects: ProjectPlan[]; total: Record<Day, number> }
export function plan(s: Workspace, today: Day): Plan {
  const total: Record<Day, number> = {};
  const projects: ProjectPlan[] = s.projects.map(p => {
    const work = projectWork(s, p.id);
    const targetDate = p.deadline ? addDays(p.deadline, -p.bufferDays) : null;
    const endDate = targetDate && today > targetDate && today <= p.deadline! ? p.deadline : targetDate;
    const start = p.startDate && p.startDate > today ? p.startDate : today;
    const available = endDate ? daysBetween(start, endDate).filter(d => capacity(d, s.settings) > 0) : [];
    const fixed: Record<Day, number> = {};
    for (const e of s.entries.filter(e => e.projectId === p.id && !e.done && e.date && e.date >= today && (!p.deadline || !e.taskId))) {
      fixed[e.date!] = (fixed[e.date!] ?? 0) + e.minutes;
      total[e.date!] = (total[e.date!] ?? 0) + e.minutes;
    }
    let status: ProjectPlan['status'] = !p.deadline ? 'longterm' : 'ontrack';
    if (!work.count) status = 'empty';
    else if (work.remaining <= .6) status = 'complete';
    else if (p.deadline && p.deadline < today) status = 'overdue';
    else if (p.startDate && p.startDate > today) status = 'notstarted';
    else if (p.deadline && !available.length) status = 'no-capacity';
    else if (targetDate && today > targetDate) status = 'buffer';
    return {projectId: p.id, targetDate, endDate, available, remaining: work.remaining, fixed,
      allocations: {...fixed}, status, capacityRisk: !!p.deadline && work.remaining > sum(available.map(d => capacity(d, s.settings))),
      unallocated: 0};
  });
  const ordered = [...projects].sort((a,b) => (a.endDate ?? '9999').localeCompare(b.endDate ?? '9999'));
  for (const p of ordered) {
    if (!p.endDate) continue;
    let left = Math.max(0, p.remaining - sum(Object.values(p.fixed)));
    if (!p.available.length) { p.unallocated = left; continue; }
    const extra: Record<Day, number> = {};
    if (!s.settings.balance) {
      const each = Math.floor(left / p.available.length);
      let remainder = Math.round(left - each * p.available.length);
      for (const d of p.available) extra[d] = each + (remainder-- > 0 ? 1 : 0);
    } else {
      // Preserve exact workload: the final slice may contain fewer than 15 minutes.
      while (left > 0) {
        const chunk = Math.min(15, left);
        let best = p.available[0], score = Infinity;
        for (const d of p.available) {
          const ratio = ((total[d] ?? 0) + (extra[d] ?? 0) + chunk) / Math.max(30, capacity(d, s.settings));
          if (ratio < score) {score = ratio; best = d;}
        }
        extra[best] = (extra[best] ?? 0) + chunk;
        left -= chunk;
      }
    }
    for (const [d, n] of Object.entries(extra)) {
      p.allocations[d] = (p.allocations[d] ?? 0) + n;
      total[d] = (total[d] ?? 0) + n;
    }
  }
  return {projects, total};
}
export function freezeToday(s: Workspace, today: Day): boolean {
  const computed = plan(s, today);
  const target = {...s.targets[today]};
  let changed = !s.targets[today];
  for (const p of computed.projects) {
    const next = Math.max(0, (p.allocations[today] ?? 0) - (p.fixed[today] ?? 0));
    if (!(target[p.projectId] > 0) && next > 0) { target[p.projectId] = next; changed = true; }
  }
  if (changed) s.targets[today] = target;
  return changed;
}
export function goals(s: Workspace, date: Day, today: Day): Record<string, number> {
  let frozen = s.targets[date];
  if (date > today) {
    frozen = {};
    for (const p of plan(s,date).projects) frozen[p.projectId] = Math.max(0,(p.allocations[date] ?? 0)-(p.fixed[date] ?? 0));
  }
  const result: Record<string, number> = {};
  for (const p of s.projects) {
    result[p.id] = frozen?.[p.id] ?? 0;
    const fixed = s.entries.filter(e => e.date === date && e.projectId === p.id &&
      (!e.taskId || !p.deadline && !(result[p.id] > 0)));
    result[p.id] += sum(fixed.map(e => e.minutes));
  }
  return result;
}
export function daySummary(s: Workspace, date: Day, today: Day) {
  const entries = s.entries.filter(e => e.date === date);
  const completed = entries.filter(e => e.done);
  const byProject = Object.fromEntries(s.projects.map(p => [p.id, sum(completed.filter(e => e.projectId === p.id).map(e => spent(s,e)))]));
  const target = sum(Object.values(goals(s,date,today))), invested = sum(Object.values(byProject));
  return {entries, completed, byProject, target, invested, planned: sum(entries.map(e => e.minutes)),
    actual: sum(completed.map(e => spent(s,e))), capacity: capacity(date,s.settings),
    status: target <= 0 ? '暂无目标' : invested === 0 ? '还未开始' : invested < target - 1 ? '正在推进' : invested > target + 1 ? '已超额' : '已达标'};
}
export function yesterdayBill(s: Workspace, today: Day) {
  const date = addDays(today,-1);
  if (!s.targets[date]) return null;
  const g = goals(s,date,today), past = daySummary(s,date,today), current = plan(s,today);
  return s.projects.map(p => {
    const count = current.projects.find(v => v.projectId === p.id)!.available.length;
    const gap = (g[p.id] ?? 0) - (past.byProject[p.id] ?? 0);
    return {project: p, gap, days: count, change: count ? gap/count : null};
  }).filter(p => p.gap !== 0);
}
export interface Move {id: string; previousDate: Day | null; date: Day; minutes: number; pastTarget: boolean; pastDeadline: boolean}
export interface Replan {
  fingerprint: string; changes: Move[]; baseline: Record<string, number>; unscheduled: string[];
  days: {date: Day; capacity: number; load: number}[]; warnings: string[];
}
export function planningFingerprint(s: Workspace) {
  return JSON.stringify([s.projects,s.tasks,s.entries,s.completions,s.settings]);
}
function deadlineFlags(p: Project | undefined, date: Day) {
  return {pastTarget: !!p?.deadline && date > addDays(p.deadline,-p.bufferDays), pastDeadline: !!p?.deadline && date > p.deadline};
}
export function previewReplan(s: Workspace, today: Day, selectedIds?: string[], reserved?: {date: Day; minutes: number}): Replan {
  const selected = selectedIds ? new Set(selectedIds) : null;
  const items = s.entries.filter(e => !e.done && (selected ? selected.has(e.id) : e.date && e.date < today));
  const ids = new Set(items.map(e => e.id));
  const days = daysBetween(today,addDays(today,20)).map(date => ({date,capacity: capacity(date,s.settings),
    load: sum(s.entries.filter(e => e.date === date && !ids.has(e.id)).map(e => e.done ? spent(s,e) : e.minutes)) +
      (reserved?.date === date ? reserved.minutes : 0)}));
  const project = (e: Entry) => s.projects.find(p => p.id === e.projectId);
  items.sort((a,b) => (project(a)?.deadline ?? '9999').localeCompare(project(b)?.deadline ?? '9999') ||
    (a.date ?? today).localeCompare(b.date ?? today) || a.id.localeCompare(b.id));
  const changes: Move[] = [], unscheduled: string[] = [];
  for (const item of items) {
    const p = project(item);
    const available = days.filter(d => d.capacity > 0 && (!p?.startDate || d.date >= p.startDate));
    if (!available.length) {unscheduled.push(item.id); continue;}
    const preferred = p?.deadline ? available.filter(d => d.date <= addDays(p.deadline!,-p.bufferDays)) : available;
    const inDeadline = p?.deadline ? available.filter(d => d.date <= p.deadline!) : available;
    const choices = preferred.length ? preferred : inDeadline.length ? inDeadline : available;
    let chosen = choices[0], best = Infinity;
    for (const d of choices) {
      const score = (d.load + item.minutes) / Math.max(30,d.capacity) + distance(today,d.date)*.002;
      if (score < best) {chosen = d; best = score;}
    }
    chosen.load += item.minutes;
    changes.push({id:item.id,previousDate:item.date,date:chosen.date,minutes:item.minutes,...deadlineFlags(p,chosen.date)});
  }
  const preview = {fingerprint:planningFingerprint(s), changes, baseline:Object.fromEntries(items.map(e => [e.id,e.version])), unscheduled, days, warnings:[]};
  return {...preview,warnings:replanWarnings(preview)};
}
export function replanWarnings(p: Replan) {
  return [
    p.unscheduled.length ? `${p.unscheduled.length} 项没有可用日期，将保留原安排` : '',
    p.changes.some(c => c.pastDeadline) ? '部分事项超过项目截止日' : '',
    p.changes.some(c => c.pastTarget) ? '部分事项进入缓冲期或更晚日期' : '',
    p.days.some(d => d.load > d.capacity) ? `${p.days.filter(d => d.load > d.capacity).length} 天超过可投入容量` : '',
  ].filter(Boolean);
}
export function editPreview(s: Workspace, preview: Replan, id: string, date: Day): Replan {
  const next = structuredClone(preview), move = next.changes.find(c => c.id === id)!;
  const old = next.days.find(d => d.date === move.date);
  if (old) old.load -= move.minutes;
  let day = next.days.find(d => d.date === date);
  if (!day) {
    const movedIds = new Set(next.changes.map(c => c.id));
    day = {date,capacity:capacity(date,s.settings),load:sum(s.entries.filter(e => e.date === date && !movedIds.has(e.id)).map(e => e.done ? spent(s,e) : e.minutes))};
    next.days.push(day);
  }
  day.load += move.minutes;
  Object.assign(move,{date,...deadlineFlags(s.projects.find(p => p.id === s.entries.find(e => e.id === id)?.projectId),date)});
  next.warnings = replanWarnings(next);
  return next;
}
