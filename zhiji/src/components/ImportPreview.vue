<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Backup, Period } from '../types';
import { previewImport, validateImportPlan, type ParsedImport } from '../transfer';
import { relationIssues } from '../domain/records';
import { state, savePlan } from '../store';
const props = defineProps<{ parsed: ParsedImport; existing: Backup; revision: number }>();
const emit = defineEmits<{ done: []; cancel: [] }>();
const decisions = ref<Record<string,'keep' | 'replace'>>({}), ignoredInvalid = ref(false), gapsConfirmed = ref(false), error = ref('');
const skipped = ref<string[]>([]), adjustments = ref<Record<string,string>>({});
const gapValues = ref<Record<string,boolean>>({});
const filtered = computed(() => ({ ...props.parsed,backup: { ...props.parsed.backup,periods: props.parsed.backup.periods.filter(p => !skipped.value.includes(p.id)),
  absenceConfirmations: props.parsed.backup.absenceConfirmations.filter(a => !skipped.value.includes(a.anchorPeriodId)),predictionSnapshots: props.parsed.backup.predictionSnapshots?.filter(s => !skipped.value.includes(s.anchorPeriodId)) } }));
const preview = computed(() => previewImport(filtered.value,props.existing,decisions.value));
const issues = computed(() => relationIssues(preview.value.plan.before,preview.value.plan.after).filter(i => i.kind !== 'GAP'));
const changedGaps = computed(() => {
  const old = [...props.existing.periods].sort((a,b) => a.startDate.localeCompare(b.startDate)), next = [...preview.value.plan.after.periods].sort((a,b) => a.startDate.localeCompare(b.startDate));
  return next.slice(1).filter((p,i) => { const index = old.findIndex(x => x.id === p.id); return index < 0 || old[index-1]?.id !== next[i].id; });
});
function issueKey(i: typeof issues.value[number]) { return i.kind === 'BLEEDING' ? i.date : i.id; }
const unresolved = computed(() => preview.value.conflicts.some(c => !decisions.value[c.key]) || issues.value.some(i => !adjustments.value[issueKey(i)]));
async function submit() {
  error.value = '';
  if (props.revision !== state.revision) { error.value = '云端记录已变化，请重新选择文件并预览。'; return; }
  try {
    const plan = JSON.parse(JSON.stringify(preview.value.plan));
    for (const p of changedGaps.value) (plan.after.periods as Period[]).find(x => x.id === p.id)!.gapBefore = gapValues.value[p.id] ?? p.gapBefore;
    for (const issue of issues.value) {
      if (issue.kind === 'ABSENCE') plan.after.absences = plan.after.absences.filter((a: any) => a.id !== issue.id);
      if (issue.kind === 'BLEEDING') {
        const answer = adjustments.value[issueKey(issue)], type = answer === 'unset' ? null : answer;
        plan.after.bleeding.find((d: any) => d.date === issue.date).bleedingType = type;
        const record = [...filtered.value.backup.dailyLogs,...props.existing.dailyLogs].find(d => d.date === issue.date)!;
        const day = { ...record,bleedingType: type,updatedAt: new Date().toISOString() };
        plan.days = plan.days.filter((d: any) => d.date !== issue.date); plan.days.push(day);
      }
    }
    validateImportPlan(plan,state.today);
    if (await savePlan(plan,props.revision)) emit('done');
  } catch (e) { error.value = (e as Error).message; }
}
</script>
<template><div class="import-preview"><h3>导入预览</h3><div class="import-counts"><span>新增 <strong>{{ preview.added }}</strong></span><span>相同 <strong>{{ preview.identical }}</strong></span><span>冲突 <strong>{{ preview.conflicts.length }}</strong></span><span>无效 <strong>{{ parsed.invalid.length }}</strong></span></div>
  <div v-if="parsed.invalid.length" class="confirm-box"><p v-for="row in parsed.invalid" :key="row.title">{{ row.title }} · {{ row.message }}</p><label class="check-label"><input v-model="ignoredInvalid" type="checkbox" /> 我确认忽略这些无效记录</label></div>
  <div v-for="conflict in preview.conflicts" :key="conflict.key" class="confirm-box"><h4>{{ conflict.title }}</h4><details><summary>对比两份内容</summary><div class="conflict-values"><pre>{{ JSON.stringify(conflict.existing,null,2) }}</pre><pre>{{ JSON.stringify(conflict.incoming,null,2) }}</pre></div></details><label>如何处理<select v-model="decisions[conflict.key]"><option :value="undefined">请选择</option><option value="keep">保留现有</option><option v-if="!conflict.key.startsWith('快照:')" value="replace">采用导入值</option></select></label></div>
  <details class="explanation"><summary>查看待导入经期，处理重叠范围</summary><div v-for="p in parsed.backup.periods" :key="p.id" class="import-period"><label class="check-label"><input type="checkbox" :checked="skipped.includes(p.id)" @change="skipped = skipped.includes(p.id) ? skipped.filter(x => x !== p.id) : [...skipped,p.id]" /> 忽略 {{ p.startDate }} 开始的这条经期及其关联确认／快照</label><div class="field-pair"><label>开始<input v-model="p.startDate" type="date" :max="state.today" /></label><label>结束<input :value="p.endDate ?? ''" type="date" :max="state.today" @input="p.endDate = ($event.target as HTMLInputElement).value || null; if (p.endDate) p.endUnknown = false" /></label></div><label class="check-label"><input type="checkbox" :checked="p.endUnknown" @change="p.endUnknown = ($event.target as HTMLInputElement).checked; if (p.endUnknown) p.endDate = null" /> 结束日期未知</label></div></details>
  <div v-if="changedGaps.length" class="confirm-box"><h4>核实新形成的间隔</h4><label v-for="p in changedGaps" :key="p.id">{{ p.startDate }} 之前是否仍有漏记<select :value="gapValues[p.id] ?? p.gapBefore" @change="gapValues[p.id] = ($event.target as HTMLSelectElement).value === 'true'"><option :value="false">没有漏记</option><option :value="true">有漏记</option></select></label><label class="check-label"><input v-model="gapsConfirmed" type="checkbox" /> 上述相邻间隔已按事实核实</label></div>
  <div v-for="issue in issues" :key="issueKey(issue)" class="confirm-box"><label v-if="issue.kind === 'BLEEDING'">{{ issue.date }} 的出血分类需要核实<select v-model="adjustments[issueKey(issue)]"><option value="">请选择</option><option v-if="issue.inside" value="MENSTRUATION">确认属于月经</option><option v-if="!issue.inside" value="SPOTTING">点滴出血</option><option v-if="!issue.inside" value="UNKNOWN">不确定</option><option value="NONE">无出血</option><option value="unset">未记录</option></select></label><label v-if="issue.kind === 'ABSENCE'">截至 {{ issue.throughDate }} 的尚未来经确认与经期冲突<select v-model="adjustments[issueKey(issue)]"><option value="">请选择</option><option value="remove">这条确认有误，删除确认</option></select></label></div>
  <p v-if="error" class="form-error" role="alert">{{ error }}</p><p class="hint">所有已确认记录会在同一事务中导入，完全相同的记录跳过。</p><div class="button-row"><button class="primary-button" :disabled="unresolved || (parsed.invalid.length > 0 && !ignoredInvalid) || (changedGaps.length > 0 && !gapsConfirmed) || state.saveStatus === 'saving' || !!state.uncertain" @click="submit">确认导入</button><button class="secondary-button" @click="emit('cancel')">取消</button></div>
</div></template>
