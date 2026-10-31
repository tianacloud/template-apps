<script setup lang="ts">
import { computed } from 'vue';
import { route } from './router';
import { confirmCurrentDraft, refresh, state, verifySave } from './store';
import TodayPage from './pages/TodayPage.vue';
import CalendarPage from './pages/CalendarPage.vue';
import InsightsPage from './pages/InsightsPage.vue';
import SettingsPage from './pages/SettingsPage.vue';
import KnowledgePage from './pages/KnowledgePage.vue';
import DayPanel from './components/DayPanel.vue';
import Icon from './components/Icon.vue';
import RemoteRecords from './components/RemoteRecords.vue';
const current = computed(() => ({ today: TodayPage,calendar: CalendarPage,insights: InsightsPage,settings: SettingsPage,knowledge: KnowledgePage }[route.page] ?? TodayPage));
const navigation = [['today','今天'],['calendar','日历'],['insights','观察'],['settings','我的']];
</script>
<template><div class="app-shell"><aside class="sidebar"><a href="#/today" class="brand"><span class="brand-flower"><i /><i /><i /><i /></span><span>知己<small>听见身体的声音</small></span></a><nav aria-label="主导航"><a v-for="[name,label] in navigation" :key="name" :href="'#/' + name" :class="{ active: route.page === name || name === 'settings' && route.page === 'knowledge' }" :aria-current="route.page === name ? 'page' : undefined"><Icon :name="name" :size="21" /><span>{{ label }}</span><span v-if="route.page === name" class="nav-dot" /></a></nav><div class="sidebar-note"><Icon name="leaf" :size="23" /><p>每一种节奏，<br />都值得被好好照顾。</p></div><div class="cloud-status"><i :class="{ error: state.error }" />{{ state.loading ? '正在读取云端记录' : state.error ? '连接需要恢复' : '记录保存在你的云端' }}</div></aside>
  <main><div class="mobile-brand"><a href="#/today" class="brand"><span class="brand-flower"><i /><i /><i /><i /></span><span>知己</span></a><span class="mobile-tagline">听见身体的声音</span></div>
    <div v-if="state.loading" class="loading-screen"><div class="brand-flower"><i /><i /><i /><i /></div><p>正在打开你的记录…</p></div><div v-else-if="state.error && state.facts.periods.length === 0" class="page"><section class="card empty-state"><Icon name="cloud" :size="40" /><h1>云端连接暂未就绪</h1><p>{{ state.error }}</p><button class="primary-button" @click="refresh">重新连接</button></section></div><component :is="current" v-else />
    <div v-if="state.notice || state.error || state.snapshotError" class="status-message" role="status"><p>{{ state.notice || state.error || state.snapshotError }}</p><button v-if="state.uncertain" class="secondary-button" :disabled="state.saveStatus === 'verifying'" @click="verifySave">{{ state.saveStatus === 'verifying' ? '正在核实…' : '核实保存状态' }}</button><details v-if="state.uncertainReviewed && !state.editorDate"><summary>查看云端最新记录</summary><RemoteRecords /><button class="secondary-button" @click="confirmCurrentDraft">我已核实，保留当前输入</button></details><button v-if="!state.uncertain" class="icon-button" aria-label="收起提示" @click="state.notice = ''; state.snapshotError = ''"><Icon name="close" :size="16" /></button></div>
  </main><nav class="bottom-nav" aria-label="手机主导航"><a v-for="[name,label] in navigation" :key="name" :href="'#/' + name" :class="{ active: route.page === name || name === 'settings' && route.page === 'knowledge' }" :aria-current="route.page === name ? 'page' : undefined"><Icon :name="name" :size="21" /><span>{{ label }}</span></a></nav>
  <DayPanel v-if="state.editorDate" />
</div></template>
