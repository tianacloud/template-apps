<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { confirmCurrentDraft, ensureDays, savePlan, state, verifySave } from '../store';
import { type FactPlan } from '../commands';
import type { DailyLog, Facts, Period } from '../types';
import { coveringPeriod, emptyDay, parseDaily, parsePeriod, relationIssues, validatePeriods, type RelationIssue } from '../domain/records';
import { addDays, displayDate, daysBetween } from '../domain/dates';
import { extractCycles, unusualInterval } from '../domain/cycles';
import { loadDays } from '../repository';
import DailyForm from './DailyForm.vue';
import PeriodForm from './PeriodForm.vue';
import Icon from './Icon.vue';
import RemoteRecords from './RemoteRecords.vue';
const draft = ref<DailyLog>(emptyDay(state.editorDate ?? state.today));
const period = ref<Period>();
const tab = ref('daily'), loading = ref(false), error = ref(''), deleting = ref(false), deletionReason = ref('real');
const deleteGap = ref<boolean | null>(null), pending = ref<FactPlan | null>(null), issues = ref<RelationIssue[]>([]);
const answers = ref<Record<string,string>>({}), anomaly = ref(false);
const panel = ref<HTMLElement>();
let previousFocus: HTMLElement | null = null;
onMounted(() => { previousFocus = document.activeElement as HTMLElement; panel.value?.querySelector<HTMLButtonElement>('button')?.focus(); });
onUnmounted(() => previousFocus?.focus());
function keepFocus(event: KeyboardEvent) {
  const fields = Array.from(panel.value?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,a[href],[tabindex="0"]') ?? []).filter(x => x.getClientRects().length);
  if (!fields.length) return;
  const target = event.shiftKey ? fields.at(-1)! : fields[0];
  if (document.activeElement === (event.shiftKey ? fields[0] : fields.at(-1))) { event.preventDefault(); target.focus(); }
}
const existing = computed(() => state.editorDate ? coveringPeriod(state.editorDate,state.facts.periods) : undefined);
const busy = computed(() => ['saving','verifying','uncertain'].includes(state.saveStatus));
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)); }
watch(() => state.editorDate, async date => {
  if (!date) return;
  loading.value = true; error.value = ''; pending.value = null; deleting.value = false;
  try {
    await ensureDays(date,date);
    if (state.editorDate !== date) return;
    draft.value = clone(state.days[date] ?? emptyDay(date));
    const current = coveringPeriod(date,state.facts.periods), now = new Date().toISOString();
    period.value = clone(state.editorMode === 'range' && state.editorRange ? { id: crypto.randomUUID(),startDate: state.editorRange.start,endDate: state.editorRange.end,endUnknown: false,gapBefore: false,note: null,source: 'USER',createdAt: now,updatedAt: now } : current ?? { id: crypto.randomUUID(),startDate: date,endDate: null,endUnknown: false,gapBefore: false,note: null,source: 'USER',createdAt: now,updatedAt: now });
    tab.value = state.editorMode === 'daily' ? 'daily' : 'period';
    if (state.editorMode === 'end' && current && !current.endDate) period.value!.endDate = date;
    await nextTick(); state.draftDirty = false;
  } catch (e) { error.value = (e as Error).message; }
  finally { if (state.editorDate === date) loading.value = false; }
},{ immediate: true });
watch(() => state.editorMode, mode => { tab.value = mode === 'daily' ? 'daily' : 'period'; });
watch([draft,period],() => { if (!loading.value) state.draftDirty = true; },{ deep: true });
function close() {
  if (busy.value) return;
  if (state.draftDirty && !window.confirm('当前记录尚未保存，确认放弃这些输入？')) return;
  state.editorDate = null; state.draftDirty = false;
}
function key(issue: RelationIssue) { return issue.kind === 'BLEEDING' ? issue.kind + issue.date : issue.kind + issue.id; }
async function prepare(remove = false) {
  error.value = ''; anomaly.value = false;
  try {
    const before = clone(state.facts), after = clone(before), days: DailyLog[] = [];
    if (tab.value === 'daily' && !remove) {
      const day = parseDaily({ ...draft.value,updatedAt: new Date().toISOString() },state.today);
      after.bleeding = after.bleeding.filter(d => d.date !== day.date); after.bleeding.push({ date: day.date,bleedingType: day.bleedingType }); days.push(day);
    } else {
      const p = parsePeriod(period.value,state.today);
      after.periods = after.periods.filter(x => x.id !== p.id);
      if (!remove) {
        p.updatedAt = new Date().toISOString(); after.periods.push(p);
        const cycles = extractCycles(after.periods,after.bleeding.filter(b => b.bleedingType === 'UNKNOWN').map(b => b.date));
        const index = cycles.findIndex(c => c.toId === p.id);
        anomaly.value = index >= 0 && unusualInterval(cycles[index].length,cycles.slice(0,index).filter(c => !c.exclusion).map(c => c.length));
      } else {
        after.absences = after.absences.filter(a => a.anchorPeriodId !== p.id);
        const successor = after.periods.filter(x => x.startDate > p.startDate).sort((a,b) => a.startDate.localeCompare(b.startDate))[0];
        if (successor && before.periods.some(x => x.startDate < p.startDate)) successor.gapBefore = deletionReason.value === 'real' ? true : deleteGap.value ?? false;
      }
      validatePeriods(after.periods,state.today);
    }
    const related = relationIssues(before,after,tab.value === 'period' ? period.value?.id : undefined);
    if (remove) {
      const successor = after.periods.filter(x => x.startDate > period.value!.startDate).sort((a,b) => a.startDate.localeCompare(b.startDate))[0];
      for (let i = related.length - 1; i >= 0; i--) if (related[i].kind === 'GAP' && (related[i] as any).id === successor?.id) related.splice(i,1);
    }
    pending.value = { before,after,days }; issues.value = related; answers.value = {};
    if (related.length) return;
    if (anomaly.value) return;
    await commit();
  } catch (e) { error.value = (e as Error).message; }
}
async function commit() {
  const plan = pending.value;
  if (!plan) return;
  try {
    for (const issue of issues.value) {
      const answer = answers.value[key(issue)];
      if (!answer) throw new Error('请先核实关联记录。');
      if (issue.kind === 'GAP') plan.after.periods.find(p => p.id === issue.id)!.gapBefore = answer === 'yes';
      if (issue.kind === 'ABSENCE') plan.after.absences = plan.after.absences.filter(a => a.id !== issue.id);
      if (issue.kind === 'BLEEDING') {
        const type = answer === 'unset' ? null : answer as DailyLog['bleedingType'];
        const b = plan.after.bleeding.find(d => d.date === issue.date)!; b.bleedingType = type;
        let day = plan.days.find(d => d.date === issue.date);
        if (!day) { day = (await loadDays(issue.date,issue.date))[0] ?? emptyDay(issue.date); plan.days.push(day); }
        day.bleedingType = type; day.updatedAt = new Date().toISOString();
      }
    }
    if (await savePlan(plan)) { deleting.value = false; error.value = ''; }
    pending.value = null;
  } catch (e) { error.value = (e as Error).message; }
}
</script>
<template>
  <div class="panel-backdrop" @click.self="close"><aside ref="panel" class="day-panel" role="dialog" aria-modal="true" aria-labelledby="day-title" @keydown.tab="keepFocus" @keydown.esc.prevent="close">
    <header class="panel-heading"><div><span class="eyebrow">给自己留一份记录</span><h2 id="day-title">{{ displayDate(state.editorDate,true) }}</h2></div><button class="icon-button" type="button" aria-label="关闭记录面板" @click="close"><Icon name="close" /></button></header>
    <div v-if="state.editorDate! > state.today" class="empty-state"><Icon name="leaf" :size="32" /><h3>这一天还没到</h3><p>可以查看日历估计，实际发生后再记录。</p></div>
    <template v-else><div class="segmented"><button :class="{ active: tab === 'daily' }" @click="tab = 'daily'; pending = null">身体记录</button><button :class="{ active: tab === 'period' }" @click="tab = 'period'; pending = null">{{ existing ? '编辑经期' : '记录经期' }}</button></div>
      <p v-if="loading" class="hint">正在读取这一天…</p>
      <form v-else @submit.prevent="prepare()" @input="state.draftDirty = true">
        <DailyForm v-if="tab === 'daily'" v-model="draft" :hidden="state.settings.hiddenGroups ?? []" />
        <PeriodForm v-else-if="period" v-model="period" :today="state.today" />
        <div v-if="deleting" class="confirm-box"><h3>删除这次经期</h3><p>同一天的身体记录会保留。</p><label>删除原因<select v-model="deletionReason"><option value="real">这次月经真实发生，但不保留记录</option><option value="mistake">原记录并不是月经</option></select></label>
          <label v-if="deletionReason === 'mistake'">剩余相邻经期之间是否漏记<select v-model="deleteGap"><option :value="null">请选择</option><option :value="true">有漏记</option><option :value="false">没有漏记</option></select></label>
          <button type="button" class="danger-button" :disabled="busy || (deletionReason === 'mistake' && deleteGap === null)" @click="prepare(true)">确认删除</button><button type="button" class="text-button" @click="deleting = false">取消</button>
        </div>
        <div v-if="pending && (issues.length || anomaly)" class="confirm-box"><h3>核实关联记录</h3>
          <div v-for="issue in issues" :key="key(issue)">
            <label v-if="issue.kind === 'GAP'">{{ issue.beforeDate }} → {{ issue.afterDate }} 之间是否仍有漏记<select v-model="answers[key(issue)]"><option value="">请选择</option><option value="no">没有漏记</option><option value="yes">有漏记</option></select></label>
            <label v-if="issue.kind === 'BLEEDING'">{{ issue.date }} 原为「{{ issue.current === 'MENSTRUATION' ? '月经' : issue.current === 'UNKNOWN' ? '不确定出血' : '点滴出血' }}」，请核实性质<select v-model="answers[key(issue)]"><option value="">请选择</option><option v-if="issue.inside" value="MENSTRUATION">确认属于这次月经</option><option value="NONE">当天无出血</option><option v-if="!issue.inside" value="SPOTTING">点滴出血</option><option v-if="!issue.inside" value="UNKNOWN">不确定出血</option><option value="unset">未记录</option></select></label>
            <label v-if="issue.kind === 'ABSENCE'">截至 {{ issue.throughDate }} 的确认与新日期冲突<select v-model="answers[key(issue)]"><option value="">请选择</option><option value="remove">这条确认有误，删除确认</option></select></label>
          </div>
          <div v-if="anomaly"><p>这次间隔与以往有所不同，期间是否有月经未记录？</p><div class="chips"><button type="button" @click="pending!.after.periods.find(p => p.id === period!.id)!.gapBefore = true; anomaly = false">有漏记</button><button type="button" @click="pending!.after.periods.find(p => p.id === period!.id)!.gapBefore = false; anomaly = false">没有漏记</button><button type="button" @click="anomaly = false">关闭提示</button></div></div>
          <button type="button" class="primary-button" :disabled="busy || issues.some(i => !answers[key(i)])" @click="commit">保存已核实记录</button><button type="button" class="text-button" @click="pending = null">继续编辑</button>
        </div>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        <div v-if="state.uncertain" class="confirm-box"><p>{{ state.notice }}</p><button type="button" class="secondary-button" :disabled="state.saveStatus === 'verifying'" @click="verifySave">核实保存状态</button></div>
        <div v-if="(state.editorRevision !== state.revision && state.draftDirty) || state.uncertainReviewed" class="confirm-box"><p>云端记录已变化，当前输入已保留。请核实日期和内容后继续。</p><details><summary>查看云端最新记录</summary><RemoteRecords /></details><button type="button" class="secondary-button" :disabled="!!state.uncertain && !state.uncertainReviewed" @click="confirmCurrentDraft(); pending = null">我已核实，保留当前输入</button></div>
        <footer class="panel-footer"><button type="submit" class="primary-button" :disabled="busy || !!pending"><Icon name="check" :size="17" /> {{ state.saveStatus === 'saving' ? '正在保存…' : '保存记录' }}</button><button v-if="tab === 'period' && state.facts.periods.some(p => p.id === period?.id) && !deleting" type="button" class="text-button danger" :disabled="busy" @click="deleting = true">删除经期</button></footer>
      </form>
    </template>
  </aside></div>
</template>
