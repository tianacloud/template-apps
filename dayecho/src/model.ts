export type Day = string;
export interface Project {
  id: string; name: string; color: string; createdDate: Day;
  startDate: Day | null; deadline: Day | null; bufferDays: number;
}
export interface Module { id: string; projectId: string; name: string }
export interface Task {
  id: string; projectId: string; moduleId: string; title: string;
  minutes: number; originalMinutes?: number; notes: string;
}
export interface Entry {
  id: string; taskId: string | null; projectId: string | null; moduleId: string | null;
  title: string; minutes: number; date: Day | null; due: Day | null;
  start: string; end: string; notes: string; done: boolean; version: number;
  seriesId?: string; continuationOf?: string;
}
export interface Completion {
  id: string; entryId: string; projectId: string | null; moduleId: string | null;
  taskId: string | null; title: string; planned: number; original: number;
  actual: number | null; excluded: boolean; doneAt: string;
}
export interface Settings {
  timeZone: string; startHour: number; weekly: number[];
  overrides: Record<Day, number>; holidayRest: boolean; balance: boolean; askActual: boolean;
}
export interface Workspace {
  schemaVersion: 1; projects: Project[]; modules: Module[]; tasks: Task[]; entries: Entry[];
  completions: Completion[]; notes: Record<Day, string>; settings: Settings;
  targets: Record<Day, Record<string, number>>;
  calibrations: {moduleId: string; signature: string; accepted: boolean}[];
}
export function uid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
export const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
export const colors = ['#ad9abb', '#8ea6bd', '#82adb4', '#91a486', '#b2b17c', '#c6ae78', '#dfa282', '#bf8e7c', '#d08e86', '#c699ad', '#a48b7a', '#8d959b'];
export function emptyWorkspace(): Workspace {
  return {
    schemaVersion: 1, projects: [], modules: [], tasks: [], entries: [], completions: [],
    notes: {}, targets: {}, calibrations: [],
    settings: {timeZone: 'Asia/Shanghai', startHour: 7, weekly: Array(7).fill(480),
      overrides: {}, holidayRest: true, balance: true, askActual: true},
  };
}
export function completionFor(s: Workspace, e: Entry) {
  return s.completions.find(c => c.entryId === e.id);
}
export function spent(s: Workspace, e: Entry) {
  const c = completionFor(s, e);
  return c?.actual ?? c?.planned ?? e.minutes;
}
export function completedPlan(s: Workspace, taskId: string) {
  return sum(s.entries.filter(e => e.taskId === taskId && e.done).map(e => completionFor(s, e)?.planned ?? e.minutes));
}
export function remainingTask(s: Workspace, task: Task) {
  return Math.max(0, task.minutes - completedPlan(s, task.id));
}
export function projectWork(s: Workspace, projectId: string) {
  const tasks = s.tasks.filter(t => t.projectId === projectId);
  const linked = s.entries.filter(e => e.projectId === projectId && !e.taskId);
  const total = sum(tasks.map(t => t.minutes)) + sum(linked.map(e => e.minutes));
  const done = sum(tasks.map(t => Math.min(t.minutes, completedPlan(s, t.id)))) +
    sum(linked.filter(e => e.done).map(e => completionFor(s, e)?.planned ?? e.minutes));
  const pending = s.entries.filter(e => e.projectId === projectId && !e.done && e.date);
  return {total, done, remaining: Math.max(0, total - done), scheduled: sum(pending.map(e => e.minutes)),
    count: tasks.length + linked.length,
    doneCount: tasks.filter(t => remainingTask(s, t) === 0).length + linked.filter(e => e.done).length};
}
export function minutesText(n: number) {
  const m = Math.round(Math.abs(n));
  return `${n < 0 ? '−' : ''}${m >= 60 ? `${Math.floor(m / 60)} 小时${m % 60 ? ` ${m % 60} 分` : ''}` : `${m} 分钟`}`;
}
