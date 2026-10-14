<script setup lang="ts">
import { computed } from 'vue';
import { openEditor } from '../store';
import { displayDate } from '../domain/dates';
const props = defineProps<{ title: string; rows: { date: string; value: number; breakBefore?: boolean }[]; unit: string; color?: string }>();
const bounds = computed(() => ({ min: Math.max(0,Math.min(...props.rows.map(r => r.value)) - 2),max: Math.max(...props.rows.map(r => r.value)) + 2 }));
const points = computed(() => props.rows.map((r,i) => ({ ...r,x: props.rows.length === 1 ? 250 : 35 + i / (props.rows.length - 1) * 450,y: 140 - (r.value - bounds.value.min) / (bounds.value.max - bounds.value.min) * 110 })));
const paths = computed(() => points.value.map((p,i) => `${i === 0 || p.breakBefore ? 'M' : 'L'}${p.x},${p.y}`).join(' '));
</script>
<template><div class="trend-chart"><svg v-if="rows.length" viewBox="0 0 520 190" role="img" :aria-label="title + '，' + rows.map(r => displayDate(r.date) + '：' + r.value + unit).join('；')">
  <g v-for="n in 3" :key="n"><line x1="35" x2="485" :y1="30 + (n-1)*55" :y2="30 + (n-1)*55" stroke="#e7e8df" stroke-dasharray="4 5" /><text x="2" :y="34 + (n-1)*55" class="chart-label">{{ (bounds.max - (n-1)*(bounds.max - bounds.min)/2).toFixed(0) }}</text></g>
  <path :d="paths" fill="none" :stroke="color ?? '#6b8270'" stroke-width="2.5" stroke-linejoin="round" />
  <g v-for="(point,i) in points" :key="point.date" role="button" tabindex="0" :aria-label="displayDate(point.date,true) + '，' + point.value + unit + '，查看记录'" @click="openEditor(point.date)" @keydown.enter="openEditor(point.date)"><circle :cx="point.x" :cy="point.y" r="16" fill="transparent" /><circle :cx="point.x" :cy="point.y" r="4.5" :fill="color ?? '#6b8270'" stroke="white" stroke-width="2" /><text v-if="rows.length <= 12" :x="point.x" :y="point.y - 11" text-anchor="middle" class="chart-label">{{ point.value }}</text><text v-if="i === 0 || i === rows.length-1 || rows.length <= 6" :x="point.x" y="174" text-anchor="middle" class="chart-label">{{ Number(point.date.slice(5,7)) }}/{{ Number(point.date.slice(8)) }}</text></g>
  </svg><div v-else class="chart-empty">还没有足够的记录。填写后会在这里看见变化。</div>
  <details v-if="rows.length" class="explanation"><summary>查看记录明细</summary><div class="record-list"><button v-for="row in rows" :key="row.date" class="record-row" @click="openEditor(row.date)"><span>{{ displayDate(row.date,true) }}</span><strong>{{ row.value }} {{ unit }}</strong></button></div></details>
</div></template>
