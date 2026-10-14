import { computed, reactive } from 'vue';
import { applyPlan, persistPrediction, verifyPlan, type FactPlan } from './commands';
import { transaction } from './db';
import { loadDays, loadFacts, saveSettings } from './repository';
import { localToday } from './domain/dates';
import { estimateDuration, predict } from './domain/prediction';
import { estimateFertility } from './domain/fertility';
import { estimatePhase } from './domain/phase';
import type { DailyLog, Evaluation, Facts, Settings, Snapshot } from './types';

export const state = reactive({ today: localToday(), facts: { periods: [], bleeding: [], absences: [] } as Facts,
  revision: 0, days: {} as Record<string, DailyLog>, ranges: [] as { start: string; end: string }[], settings: { hiddenGroups: [] } as Settings,
  snapshots: [] as Snapshot[], evaluations: [] as Evaluation[], loading: true, error: '', notice: '',
  saveStatus: 'idle', editorDate: null as string | null, editorMode: 'daily', editorRevision: 0, draftDirty: false,
  editorRange: null as { start: string; end: string } | null,
  uncertain: null as { plan: FactPlan; revision: number; writeId: string } | null, uncertainReviewed: false, snapshotError: '' });
export const prediction = computed(() => predict(state.facts));
export const duration = computed(() => estimateDuration(state.facts.periods, prediction.value));
export const fertility = computed(() => estimateFertility(state.facts, prediction.value));
export const phase = computed(() => estimatePhase(state.today, state.facts, prediction.value, duration.value, fertility.value, state.days[state.today]));
let generation = 0;
const pendingRanges = new Map<string, Promise<void>>();
let refreshJob: Promise<void> | undefined;
export async function refresh() {
  if (refreshJob) return refreshJob;
  refreshJob = (async () => {
    try {
      const loaded = await loadFacts(state.today), changed = loaded.revision !== state.revision;
      if (changed) { generation++; state.days = {}; state.ranges = []; }
      state.facts = loaded.facts; state.revision = loaded.revision; state.settings = loaded.settings;
      for (const d of loaded.daily) state.days[d.date] = d;
      state.error = '';
      try {
        const saved = await persistPrediction(state.facts, state.revision, state.today);
        state.snapshots = saved.snapshots; state.evaluations = saved.evaluations; state.snapshotError = '';
      } catch { state.snapshotError = '记录已读取；预测快照暂未保存，恢复连接后会核实并补存。'; }
    } catch (error) { state.error = (error as Error).message; }
    finally { state.loading = false; refreshJob = undefined; }
  })();
  return refreshJob;
}
export async function ensureDays(start: string, end: string) {
  if (state.ranges.some(r => r.start <= start && r.end >= end)) return;
  const key = generation + '/' + start + '/' + end;
  if (pendingRanges.has(key)) return pendingRanges.get(key)!;
  const at = generation;
  const job = loadDays(start,end).then(rows => {
    if (at !== generation) return;
    for (const d of rows) state.days[d.date] = d;
    state.ranges.push({ start,end });
  }).finally(() => pendingRanges.delete(key));
  pendingRanges.set(key,job); return job;
}
export function openEditor(date: string, mode = 'daily') {
  if (state.editorDate !== date && state.draftDirty) { state.notice = '当前输入尚未保存，请先保存或关闭记录面板。'; return; }
  state.editorDate = date; state.editorMode = mode; state.editorRevision = state.revision;
}
export async function savePlan(plan: FactPlan, revision = state.editorRevision) {
  if (state.saveStatus === 'saving' || state.saveStatus === 'verifying' || state.uncertain) return false;
  state.saveStatus = 'saving'; state.notice = '';
  const writeId = crypto.randomUUID();
  try {
    const result = await applyPlan(plan,revision,state.today,writeId);
    if (result === 'uncertain') {
      state.uncertain = { plan,revision,writeId }; state.uncertainReviewed = false; state.saveStatus = 'uncertain';
      state.notice = '保存结果暂时无法确认，输入已保留。请恢复连接后核实。'; return false;
    }
    if (result === 'failed') { state.saveStatus = 'failed'; state.notice = '云端确认本次未写入，输入已保留，可以再次保存。'; return false; }
    state.saveStatus = 'saved'; state.draftDirty = false;
    await refresh(); state.editorRevision = state.revision;
    for (const d of plan.days) state.days[d.date] = d;
    if (plan.clear) { state.days = {}; state.ranges = []; state.editorDate = null; }
    state.notice = '记录已保存'; return true;
  } catch (error) { state.saveStatus = 'failed'; state.notice = (error as Error).message; await refresh(); return false; }
}
export async function verifySave() {
  const pending = state.uncertain;
  if (!pending) return;
  state.saveStatus = 'verifying';
  try {
    const result = await verifyPlan(pending.plan,pending.revision,pending.writeId);
    if (result === 'saved') {
      state.uncertain = null; state.saveStatus = 'saved'; state.draftDirty = false;
      await refresh(); state.editorRevision = state.revision; state.notice = '已核实：记录已保存。';
    } else if (result === 'failed') {
      state.uncertain = null; state.saveStatus = 'failed'; state.notice = '已核实：本次未写入，可以再次保存。';
    } else {
      state.saveStatus = 'uncertain'; state.notice = '云端已有后续修改，无法确定本次结果。请查看最新记录后核实输入。';
      await refresh();
      for (const day of pending.plan.days) await ensureDays(day.date,day.date);
      state.uncertainReviewed = !state.error;
    }
  } catch { state.saveStatus = 'uncertain'; state.notice = '连接仍不可用，输入已保留。'; }
}
export function confirmCurrentDraft() {
  if (state.uncertain && !state.uncertainReviewed) return;
  state.uncertain = null; state.uncertainReviewed = false; state.saveStatus = 'failed';
  state.editorRevision = state.revision; state.notice = '已保留当前输入，请核对云端记录后按需保存。';
}
export async function updateSettings(settings: Settings) {
  await transaction([saveSettings(settings)],true); state.settings = settings;
}
export function startStore() {
  void refresh();
  const resume = () => {
    if (document.visibilityState !== 'visible') return;
    const date = localToday();
    if (date !== state.today) { state.today = date; generation++; state.days = {}; state.ranges = []; }
    void refresh();
  };
  window.addEventListener('online', resume); document.addEventListener('visibilitychange',resume);
  window.setInterval(() => { if (localToday() !== state.today) resume(); }, 30_000);
  window.addEventListener('beforeunload', event => { if (state.draftDirty) { event.preventDefault(); event.returnValue = ''; } });
}
