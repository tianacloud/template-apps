<script setup lang="ts">
import type { Period } from '../types';
const draft = defineModel<Period>({ required: true });
defineProps<{ today: string }>();
</script>
<template><div class="period-fields"><div class="field-pair"><label>经期开始日期<input v-model="draft.startDate" type="date" :max="today" required /></label><label>最后出血日期<input :value="draft.endDate ?? ''" type="date" :min="draft.startDate" :max="today" @input="draft.endDate = ($event.target as HTMLInputElement).value || null" /></label></div>
  <p class="hint">尚未结束时，结束日期留空。</p><fieldset class="tag-field"><legend>此次月经之前是否漏记</legend><div class="chips"><button type="button" :aria-pressed="!draft.gapBefore" :class="{ selected: !draft.gapBefore }" @click="draft.gapBefore = false">没有漏记</button><button type="button" :aria-pressed="draft.gapBefore" :class="{ selected: draft.gapBefore }" @click="draft.gapBefore = true">有漏记</button></div></fieldset>
  <label>经期备注<textarea v-model="draft.note" rows="2" placeholder="可选" /></label>
</div></template>
