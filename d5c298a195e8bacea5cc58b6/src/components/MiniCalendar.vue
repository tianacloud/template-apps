<script setup>
import { ref, computed } from 'vue';
import { dateKey, monthLabel, pad } from '../utils.js';

const props = defineProps({ selectedDate: String, markedDates: Array, dailyProgress: Object });
const emit = defineEmits(['select']);
const today = new Date();
const month = ref(new Date(today.getFullYear(), today.getMonth(), 1));

const cells = computed(() => {
  const year = month.value.getFullYear(), m = month.value.getMonth();
  const lead = new Date(year, m, 1).getDay(), days = new Date(year, m + 1, 0).getDate(), out = [];
  for (let i = 0; i < lead; i++) out.push({ date: null, key: `pad-${i}` });
  for (let d = 1; d <= days; d++) { const date = new Date(year, m, d); out.push({ date, key: dateKey(date) }); }
  while (out.length % 7 !== 0) out.push({ date: null, key: `tail-${out.length}` });
  return out;
});
const progressMap = computed(() => {
  const map = {};
  for (const item of props.markedDates) typeof item === 'string' ? (map[item] = 1) : (map[item.date] = item.progress);
  if (props.dailyProgress) Object.assign(map, props.dailyProgress);
  return map;
});
const todayKey = computed(() => dateKey(today));

function shift(delta) { month.value = new Date(month.value.getFullYear(), month.value.getMonth() + delta, 1); }
function goToday() { month.value = new Date(today.getFullYear(), today.getMonth(), 1); emit('select', dateKey(today)); }
const isSelected = d => !!d && dateKey(d) === props.selectedDate;
const isToday = d => !!d && dateKey(d) === todayKey.value;
const progress = d => (d ? progressMap.value[dateKey(d)] ?? 0 : 0);
const hasProgress = d => progress(d) > 0;
</script>

<template>
  <div class="bg-white rounded-2xl p-4">
    <div class="flex items-center justify-between mb-3">
      <button type="button" class="w-9 h-9 rounded-full flex items-center justify-center text-[#333] hover:bg-[#F3EDE5] transition" aria-label="上一月" @click="shift(-1)">
        <span class="text-lg leading-none">‹</span>
      </button>
      <div class="flex items-center gap-2">
        <span class="text-[15px] font-medium text-[#333]">{{ monthLabel(month) }}</span>
        <button type="button" class="text-[12px] text-[#F28B66] px-2 py-1 rounded-full hover:bg-[#F3EDE5] transition" @click="goToday">今天</button>
      </div>
      <button type="button" class="w-9 h-9 rounded-full flex items-center justify-center text-[#333] hover:bg-[#F3EDE5] transition" aria-label="下一月" @click="shift(1)">
        <span class="text-lg leading-none">›</span>
      </button>
    </div>
    <div class="grid grid-cols-7 text-center text-[12px] text-[#888] mb-2">
      <div v-for="w in ['日', '一', '二', '三', '四', '五', '六']" :key="w" class="py-1">{{ w }}</div>
    </div>
    <div class="grid grid-cols-7 gap-y-1">
      <div v-for="cell in cells" :key="cell.key" class="aspect-square flex items-center justify-center">
        <button
          v-if="cell.date"
          type="button"
          :class="['w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-[12px] font-medium transition relative', [isSelected(cell.date) ? 'bg-[#F28B66] text-white' : isToday(cell.date) ? 'bg-[#F3EDE5] text-[#333]' : 'text-[#333] hover:bg-[#F3EDE5]']]"
          @click="emit('select', dateKey(cell.date))"
        >
          <span class="leading-none">{{ pad(cell.date.getDate()) }}</span>
          <span v-if="hasProgress(cell.date) && !isSelected(cell.date)" class="block mt-[2px] w-3.5 h-2 rounded-sm overflow-hidden border border-[rgba(51,51,51,0.18)] relative" style="background-color: #FFFDF8">
            <span class="absolute bottom-0 left-0 right-0 transition-all duration-500" :style="{ height: Math.round(progress(cell.date) * 100) + '%', background: 'linear-gradient(180deg, #A8D8E8, #5DA9C7)' }"></span>
          </span>
          <span v-if="isSelected(cell.date)" class="block mt-[2px] w-3.5 h-2 rounded-sm overflow-hidden border border-white/60 relative" style="background-color: rgba(255,255,255,0.4)">
            <span class="absolute bottom-0 left-0 right-0" :style="{ height: Math.round(progress(cell.date) * 100) + '%', background: 'rgba(255,255,255,0.9)' }"></span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
