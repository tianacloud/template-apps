<script setup lang="ts">
import { computed } from 'vue';
import { state } from '../store';
import { displayDate } from '../domain/dates';
import { labels } from '../types';
const dates = computed(() => state.editorDate ? [state.editorDate] : state.uncertain?.plan.days.map(d => d.date) ?? []);
</script>
<template><div class="remote-record"><h4>云端经期</h4><p v-if="!state.facts.periods.length">还没有经期记录。</p><div v-for="p in state.facts.periods" :key="p.id" class="period-distribution"><strong>{{ displayDate(p.startDate,true) }} 开始</strong><p>{{ p.endDate ? displayDate(p.endDate,true) + ' 结束' : '结束日期未填写' }}{{ p.gapBefore ? ' · 之前有漏记' : '' }}</p><p v-if="p.note">{{ p.note }}</p></div><div v-for="date in dates" :key="date" class="period-distribution"><h4>{{ displayDate(date,true) }} 的身体记录</h4><template v-if="state.days[date]"><p>出血性质：{{ labels[state.days[date].bleedingType!] ?? '未记录' }} · 出血量：{{ labels[state.days[date].flowLevel!] ?? '未记录' }}</p><p>疼痛：{{ state.days[date].painScore === null ? '未记录' : state.days[date].painScore + ' 分' }} · 睡眠：{{ state.days[date].sleepHours === null ? '未记录' : state.days[date].sleepHours + ' 小时' }}</p><p>便便：{{ state.days[date].bowelEvents === null ? '未记录' : state.days[date].bowelEvents!.length + ' 次' }} · 爱爱：{{ state.days[date].intimacyEvents === null ? '未记录' : state.days[date].intimacyEvents!.length + ' 次' }}</p><p>{{ state.days[date].note || '没有填写备注。' }}</p></template><p v-else>云端还没有这一天的身体记录。</p></div></div></template>
