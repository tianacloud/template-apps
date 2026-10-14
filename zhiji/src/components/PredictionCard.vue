<script setup lang="ts">
import { ref } from 'vue';
import { duration, prediction, savePlan, state } from '../store';
import { addDays, displayDate } from '../domain/dates';
import { parseAbsence } from '../domain/records';
import Icon from './Icon.vue';
const showConfirmation = ref(false), throughDate = ref(addDays(state.today,-1)), error = ref('');
async function confirmAbsence() {
  try {
    const confirmation = parseAbsence({ id: crypto.randomUUID(),anchorPeriodId: prediction.value.anchorId,throughDate: throughDate.value,createdAt: new Date().toISOString() },state.today);
    const facts = JSON.parse(JSON.stringify(state.facts));
    facts.absences = facts.absences.filter((a: any) => !(a.anchorPeriodId === confirmation.anchorPeriodId && a.throughDate === confirmation.throughDate)); facts.absences.push(confirmation);
    if (await savePlan({ before: state.facts,after: facts,days: [] },state.revision)) showConfirmation.value = false;
  } catch (e) { error.value = (e as Error).message; }
}
</script>
<template><section class="card prediction-card"><div class="row-between"><h2><span class="section-icon"><Icon name="calendar" :size="18" /></span>下次月经</h2><span class="badge">个人历史估计</span></div>
  <template v-if="prediction.centerDate"><p class="prediction-date">{{ displayDate(prediction.centerDate) }}<small>预计开始</small></p><p class="muted">可能在 {{ displayDate(prediction.windowStart) }} — {{ displayDate(prediction.windowEnd) }} 之间</p>
    <p v-if="duration?.nextEnd" class="hint">预计 {{ displayDate(duration.nextEnd) }} 结束 · 根据 {{ duration.sampleCount }} 次完整经期{{ duration.sampleCount < 3 ? '，粗略估计' : '' }}</p>
    <div v-if="prediction.windowProbability !== null" class="probability"><span>此窗口的统计估计概率</span><strong>{{ (prediction.windowProbability * 100).toFixed(0) }}<small>%</small></strong></div>
    <details v-if="prediction.windowProbability !== null" class="explanation"><summary>这个概率代表什么？</summary><p>根据个人历史和 Student's t 模型计算，固定窗口为中心日期前后 3 天。它是统计估计，不是已经验证的个人准确率。{{ prediction.sampleCount < 6 ? '目前样本较少。' : '' }}</p></details>
    <p class="hint">根据最近 {{ prediction.sampleCount }} 个有效周期计算{{ prediction.sampleCount < 4 ? ' · 数据较少，暂不显示概率' : '' }}</p>
    <p v-if="prediction.interrupted" class="care-note">记录曾中断，当前估计可能与近期情况有差异。</p>
    <p v-if="prediction.conditionThrough" class="care-note">已确认截至 {{ displayDate(prediction.conditionThrough) }} 结束时尚未来经。{{ prediction.conditionUnavailable ? '数据不足，暂不能更新日期估计。' : '当前日期根据这条事实更新。' }}</p>
    <div v-if="state.today > prediction.windowEnd! || prediction.conditionThrough" class="verification"><p>请核实记录：月经已经开始，可以补录；尚未开始，可以确认完整日的事实。</p><div class="button-row"><a class="secondary-button" :href="'#/calendar?date=' + state.today">去日历补录</a><button class="secondary-button" @click="showConfirmation = !showConfirmation">确认尚未来经</button></div></div>
    <form v-if="showConfirmation" class="confirm-box" @submit.prevent="confirmAbsence"><label>确认截至哪一天结束仍未开始<input v-model="throughDate" type="date" :min="prediction.anchorDate!" :max="addDays(state.today,-1)" required /></label><p class="hint">今天尚未结束，最晚确认到昨天。</p><p v-if="error" class="form-error" role="alert">{{ error }}</p><button class="primary-button" :disabled="state.saveStatus === 'saving' || !!state.uncertain">保存确认</button></form>
  </template><div v-else class="prediction-empty"><span class="empty-dashes">— —</span><p>多一点记录，慢慢看见规律</p><small>两个真实开始日期会形成第一个周期。<br />先记录最近一次经期就可以。</small></div>
</section></template>
