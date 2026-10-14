<script setup lang="ts">
import { computed } from 'vue';
import { fertility, prediction, state } from '../store';
import { addDays, daysBetween, displayDate, toDayNumber } from '../domain/dates';
import { coveringPeriod } from '../domain/records';
import { fertileMass } from '../domain/fertility';
const props = defineProps<{ month: string; selected: string; rangeStart?: string | null; rangeEnd?: string | null }>();
const emit = defineEmits<{ select: [date: string] }>();
const dates = computed(() => { const first = props.month + '-01', weekday = (toDayNumber(first) + 3) % 7; return Array.from({ length: 42 },(_,i) => addDays(first,i - weekday)); });
function probability(date: string) { return fertility.value?.probabilistic && prediction.value.model && prediction.value.anchorDate ? fertileMass(daysBetween(prediction.value.anchorDate,date),prediction.value.model) : 0; }
const max = computed(() => Math.max(...dates.value.map(probability),0.001));
function recorded(date: string) { return !!coveringPeriod(date,state.facts.periods) && (state.facts.periods.find(p => p.startDate <= date && (!p.endDate || p.endDate >= date))!.endDate !== null || state.days[date]?.bleedingType === 'MENSTRUATION' || state.facts.periods.some(p => p.startDate === date)); }
function estimated(date: string) { return !!prediction.value.windowStart && date >= prediction.value.windowStart && date <= prediction.value.windowEnd!; }
function fertile(date: string) { return fertility.value && date >= fertility.value.windowStart && date <= fertility.value.windowEnd; }
function inRange(date: string) { return props.rangeStart && date >= props.rangeStart && date <= (props.rangeEnd ?? props.rangeStart); }
</script>
<template><div class="calendar-grid" role="group" aria-label="月历"><div v-for="day in ['一','二','三','四','五','六','日']" :key="day" class="weekday">{{ day }}</div>
  <button v-for="date in dates" :key="date" class="calendar-day" :class="{ outside: !date.startsWith(month),actual: recorded(date),estimated: estimated(date) && !recorded(date),fertile: fertile(date) && !recorded(date),selected: date === selected,today: date === state.today,'in-range': inRange(date),'estimated-center': date === prediction.centerDate }"
    :style="fertile(date) && !recorded(date) ? { '--fertile-opacity': fertility?.probabilistic ? String(0.12 + probability(date) / max * 0.2) : '0.17' } : undefined"
    :aria-label="`${displayDate(date,true)}${recorded(date) ? '，已记录经期' : estimated(date) ? '，月经估计窗口' : fertile(date) ? '，易孕参考' : ''}${state.days[date] ? '，有身体记录' : ''}${date === state.today ? '，今天' : ''}`" :aria-pressed="date === selected" @click="emit('select',date)">
    <span>{{ Number(date.slice(-2)) }}</span><span class="day-marks"><i v-if="recorded(date)" class="period-mark">•</i><i v-if="state.days[date]" class="record-mark">·</i><i v-if="date === fertility?.peakDate" class="ovulation-mark">◇</i></span>
  </button></div></template>
