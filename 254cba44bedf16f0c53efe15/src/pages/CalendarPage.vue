<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ensureDays, fertility, openEditor, prediction, state } from '../store';
import { route, navigate } from '../router';
import { addDays, daysBetween, displayDate, toDayNumber } from '../domain/dates';
import { coveringPeriod } from '../domain/records';
import { labels } from '../types';
import CalendarGrid from '../components/CalendarGrid.vue';
import Icon from '../components/Icon.vue';
const month = ref(route.date.slice(0,7)), rangeMode = ref(false), rangeStart = ref<string | null>(null), rangeEnd = ref<string | null>(null), error = ref('');
const selected = computed(() => route.date), period = computed(() => coveringPeriod(route.date,state.facts.periods)), log = computed(() => state.days[route.date]);
const moodText = computed(() => log.value?.moods?.map(x => labels[x]).join('、') || '明确无相关项');
function move(offset: number) {
  const [y,m] = month.value.split('-').map(Number), date = new Date(Date.UTC(y,m-1+offset,1)); month.value = date.toISOString().slice(0,7);
}
watch([month,() => state.revision],async () => {
  const first = month.value + '-01', day = (toDayNumber(first)+3)%7;
  try { await ensureDays(addDays(first,-day),addDays(first,41-day)); error.value = ''; } catch (e) { error.value = (e as Error).message; }
},{ immediate: true });
watch(() => route.date,date => { month.value = date.slice(0,7); });
function select(date: string) {
  if (rangeMode.value && date <= state.today) {
    if (!rangeStart.value || rangeEnd.value) { rangeStart.value = date; rangeEnd.value = null; }
    else { rangeEnd.value = date < rangeStart.value ? rangeStart.value : date; rangeStart.value = date < rangeStart.value ? date : rangeStart.value; }
  }
  navigate('calendar',{ date });
}
function range() {
  if (!rangeStart.value || !rangeEnd.value) return;
  state.editorRange = { start: rangeStart.value,end: rangeEnd.value }; openEditor(rangeStart.value,'range');
}
</script>
<template><div class="page"><header class="page-heading"><div><p class="eyebrow">一点一滴，都是自己的节奏</p><h1>身体的日历</h1><p class="page-subtitle">留下真实发生的事，和自己的变化保持联系。</p></div><button class="secondary-button" @click="rangeMode = !rangeMode; rangeStart = null; rangeEnd = null"><Icon name="plus" :size="17" />{{ rangeMode ? '退出范围选择' : '范围补录' }}</button></header>
  <div class="calendar-layout"><section class="card month-card"><div class="month-toolbar"><h2>{{ month.split('-')[0] }} 年 <strong>{{ Number(month.split('-')[1]) }} 月</strong></h2><div class="button-row"><button class="text-button" @click="month = state.today.slice(0,7); navigate('calendar',{ date: state.today })">今天</button><button class="icon-button" aria-label="上个月" @click="move(-1)"><Icon name="chevron" class="flip" /></button><button class="icon-button" aria-label="下个月" @click="move(1)"><Icon name="chevron" /></button></div></div>
    <CalendarGrid :month="month" :selected="selected" :range-start="rangeStart" :range-end="rangeEnd" @select="select" />
    <div class="calendar-legend"><span><i class="legend-actual" /> 已记录经期</span><span><i class="legend-estimate" /> 月经估计窗口</span><span><i class="legend-fertile" /> 易孕参考</span><span><b>·</b> 身体记录</span><span><b>◇</b> 排卵参考</span></div>
    <div v-if="rangeMode" class="range-form"><label>开始日期<input v-model="rangeStart" type="date" :max="state.today" /></label><label>结束日期<input v-model="rangeEnd" type="date" :min="rangeStart ?? undefined" :max="state.today" /></label><button class="primary-button" :disabled="!rangeStart || !rangeEnd" @click="range">补录这段经期</button><p class="hint">依次选择起止日期，或使用日期输入。</p></div>
    <p v-if="error" class="form-error">{{ error }}</p><details class="explanation"><summary>日历里的估计怎么理解？</summary><p>实色区间来自实际经期记录；虚线窗口是固定 7 天的月经估计。绿色是推测易孕参考，{{ fertility?.probabilistic ? '深浅表示相对可能性。' : '当前样本不足，没有概率色阶。' }}日历不能确认排卵，也不能用作避孕依据。</p></details>
  </section><section class="card date-detail"><span class="eyebrow">这一天</span><h2>{{ displayDate(selected) }}</h2><p class="date-kind">{{ period ? '已记录：经期' : selected > state.today ? '未来日期 · 估计参考' : '日常身体记录' }}</p><p v-if="period">{{ displayDate(period.startDate) }} 开始 · {{ period.endDate ? displayDate(period.endDate) + ' 结束' : '结束日期尚未填写' }}</p>
    <div v-if="log" class="daily-summary"><p v-if="log.bleedingType">出血 · {{ labels[log.bleedingType] }}</p><p v-if="log.flowLevel">出血量 · {{ labels[log.flowLevel] }}</p><p v-if="log.painScore !== null">疼痛 · {{ log.painScore }} 分</p><p v-if="log.sleepHours !== null">睡眠 · {{ log.sleepHours }} 小时</p><p v-if="log.moods !== null">情绪 · {{ moodText }}</p><p v-if="log.bowelEvents !== null">便便 · {{ log.bowelEvents.length }} 次</p><p v-if="log.intimacyEvents !== null">爱爱 · {{ log.intimacyEvents.length }} 次</p><p v-if="log.discharge">白带 · {{ log.discharge.present ? '有' : '无' }}</p><p v-if="log.note" class="personal-note">{{ log.note }}</p></div>
    <div v-else class="detail-empty"><Icon name="leaf" :size="32" /><p>{{ selected > state.today ? '这一天还没到' : '这一天，还没有身体记录' }}</p><small>{{ selected > state.today ? '实际发生后再填写。' : '想记下一点什么时，随时开始。' }}</small></div>
    <div class="stack-actions"><button class="primary-button" :disabled="selected > state.today" @click="openEditor(selected)"><Icon name="edit" :size="17" />{{ log ? '编辑这一天' : '记录这一天' }}</button><button class="secondary-button" :disabled="selected > state.today" @click="openEditor(selected,period ? 'end' : 'period')">{{ period ? '编辑／结束经期' : '经期开始' }}</button></div>
    <p v-if="fertility" class="hint">排卵参考：{{ displayDate(fertility.peakDate) }}{{ fertility.probabilistic ? '' : '（粗略日期）' }}</p>
  </section></div>
  <section class="card period-history"><div class="row-between"><h2>我的经期记录</h2><span class="hint">{{ state.facts.periods.length }} 次</span></div><p v-if="!state.facts.periods.length" class="muted">先记录最近一次经期，慢慢积累就可以。</p><div class="record-list"><button v-for="p in [...state.facts.periods].reverse()" :key="p.id" class="record-row" @click="openEditor(p.startDate,'period')"><span><strong>{{ displayDate(p.startDate,true) }}</strong><small>{{ p.endDate ? displayDate(p.endDate) + ' 结束' : '结束尚未填写' }}{{ p.gapBefore ? ' · 之前有漏记' : '' }}</small></span><span>{{ p.endDate ? daysBetween(p.startDate,p.endDate)+1 + ' 天' : '进行中' }}<Icon name="chevron" :size="16" /></span></button></div></section>
</div></template>
