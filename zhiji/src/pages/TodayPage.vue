<script setup lang="ts">
import { computed } from 'vue';
import { duration, openEditor, phase, prediction, state } from '../store';
import { chooseKnowledge } from '../domain/knowledge';
import { addDays, daysBetween, displayDate } from '../domain/dates';
import { labels } from '../types';
import KnowledgeCard from '../components/KnowledgeCard.vue';
import PredictionCard from '../components/PredictionCard.vue';
import Icon from '../components/Icon.vue';
const knowledge = computed(() => chooseKnowledge(state.today,phase.value,state.days[state.today]));
const open = computed(() => state.facts.periods.find(p => !p.endDate));
const ringProgress = computed(() => phase.value.cycleDay && prediction.value.mean ? Math.min(1,phase.value.cycleDay / prediction.value.mean) : 0);
const remaining = computed(() => phase.value.expectedBoundary ? Math.max(0,daysBetween(state.today,phase.value.expectedBoundary)) : null);
</script>
<template><div class="page today-page"><header class="page-heading"><div><p class="eyebrow">{{ displayDate(state.today,true) }} · {{ ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][new Date().getDay()] }}</p><h1>今天，照顾好自己。</h1><p class="page-subtitle">身体的每一点变化，都可以慢慢了解。</p></div><span class="header-leaf"><Icon name="leaf" :size="27" /></span></header>
  <div class="today-layout"><section class="card companion-card"><div class="row-between"><span class="eyebrow">我的周期</span><span class="badge" :class="{ rose: phase.source === 'RECORDED' }">{{ phase.source === 'RECORDED' ? '已记录' : phase.source === 'ESTIMATED' ? '日历估计' : '慢慢积累' }}</span></div>
    <div class="cycle-overview"><div class="cycle-ring"><svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="75" fill="none" stroke="#e7eadf" stroke-width="9" /><circle cx="90" cy="90" r="75" fill="none" :stroke="phase.phase === 'MENSTRUAL' ? '#c1847b' : '#7c9479'" stroke-width="9" stroke-linecap="round" :stroke-dasharray="`${ringProgress * 471.24} 471.24`" transform="rotate(-90 90 90)" /></svg><div class="cycle-ring-copy"><span>{{ phase.source === 'RECORDED' ? '月经第' : phase.cycleDay ? '周期第' : '从记录开始' }}</span><strong v-if="phase.cycleDay">{{ phase.cycleDay }}<small>天</small></strong><Icon v-else name="leaf" :size="47" /></div></div>
      <div class="phase-copy"><h2>{{ phase.phase === 'UNKNOWN' ? '让记录陪你认识自己' : (phase.source === 'ESTIMATED' ? '可能处于' : '') + labels[phase.phase] }}</h2><p v-if="phase.reason" class="muted">{{ phase.reason }}</p><p v-else-if="remaining !== null" class="muted">{{ phase.source === 'ESTIMATED' ? '大致' : '' }}还有 {{ remaining }} 天到{{ phase.phase === 'MENSTRUAL' ? '记录的结束日' : '下一个参考阶段' }}</p><p v-if="open && duration?.currentEnd" class="hint">预计 {{ displayDate(duration.currentEnd) }} 结束{{ duration.sampleCount < 3 ? ' · 粗略估计' : '' }}</p></div>
    </div>
    <div class="companion-copy"><span class="small-leaf"><Icon name="leaf" :size="18" /></span><h3>{{ knowledge.main.title }}</h3><p>{{ knowledge.main.paragraphs[0] }}</p><ul class="suggestions"><li v-for="s in knowledge.main.suggestions.slice(0,2)" :key="s">{{ s }}</li></ul></div>
    <p v-for="p in knowledge.careNotices" :key="p" class="care-note">{{ p }}</p>
    <div class="quick-actions"><button class="primary-button" @click="openEditor(state.today)"><Icon name="plus" :size="18" />记录今天</button><button class="secondary-button" @click="openEditor(state.today,open ? 'end' : 'period')"><Icon name="drop" :size="17" />{{ open ? '经期结束' : '经期开始' }}</button></div>
  </section><div class="today-side"><PredictionCard /><div class="little-note"><Icon name="heart" :size="19" /><p>不用每天填满所有项目。<br />愿意记录的那一点，就已经有意义。</p></div></div></div>
  <section class="knowledge-section"><div class="row-between section-heading"><h2>给今天的一点陪伴</h2><a href="#/knowledge/recording" class="text-link">了解如何记录 <Icon name="arrow" :size="16" /></a></div><div class="knowledge-grid"><KnowledgeCard v-for="card in knowledge.cards" :key="card.id" :card="card" /></div></section>
  <p class="quiet-footer">每一条记录，都只为更了解自己。</p>
</div></template>
