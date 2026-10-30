<script setup>
import { ref, computed } from 'vue';
import { state, addReward, redeemReward, deleteReward, reorderRewards } from '../store.js';
import { ask, notify } from '../dialog.js';

// Open goals first in the user's order, completed ones after, newest completion first.
const sorted = computed(() => [...state.rewards].sort((a, b) => {
  if (a.redeemed !== b.redeemed) return a.redeemed ? 1 : -1;
  if (!a.redeemed && !b.redeemed) return (a.order ?? state.rewards.indexOf(a)) - (b.order ?? state.rewards.indexOf(b));
  return a.redeemed && b.redeemed ? (b.redeemedAt || 0) - (a.redeemedAt || 0) : 0;
}));
const firstRequired = computed(() => sorted.value[0]?.requiredCoins ?? 0);
const scale = computed(() => (firstRequired.value > 0 ? firstRequired.value : 200));
const level = computed(() => Math.max(4, Math.min(100, (state.totalCoins / scale.value) * 100)));
const waterTop = computed(() => 312 - (312 * level.value) / 100);
const BOTTLE = `M 70 8
                     L 70 38
                     Q 70 48 60 56
                     Q 30 80 30 130
                     L 30 300
                     Q 30 312 42 312
                     L 158 312
                     Q 170 312 170 300
                     L 170 130
                     Q 170 80 140 56
                     Q 130 48 130 38
                     L 130 8
                     Z`;

const open = ref(false);
const name = ref('');
const coins = ref(20);
const saving = ref(false);
function openNew() { name.value = ''; coins.value = 20; open.value = true; }
async function submit() {
  const value = name.value.trim();
  if (!value || saving.value) return;
  saving.value = true;
  try { await addReward(value, coins.value); open.value = false; } catch { /* Reported by the store. */ } finally { saving.value = false; }
}
const percent = (index, required, redeemed) => (redeemed ? 100 : index === 0 ? Math.min(100, Math.round((state.totalCoins / required) * 100)) : 0);
const progressText = (index, required, redeemed) => (redeemed ? '已达成' : index === 0 ? `已攒 ${Math.min(state.totalCoins, required)} / ${required}` : `还差 ${required} 金币`);
async function redeem(id) {
  const reward = state.rewards.find(r => r.id === id);
  if (!reward || reward.redeemed) return;
  if (state.totalCoins < reward.requiredCoins) { await notify('金币还不够，再攒一攒吧～'); return; }
  if (await ask(`兑换「${reward.name}」将扣除 ${reward.requiredCoins} 金币，确定吗？`)) await redeemReward(id).catch(() => {});
}
async function remove(id) {
  const reward = state.rewards.find(r => r.id === id);
  if (reward && (await ask(reward.redeemed ? '删除已完成的目标？' : '删除这个兑换目标？'))) await deleteReward(id).catch(() => {});
}

const dragging = ref(null);
const over = ref(null);
function dragStart(id, event) {
  dragging.value = id;
  if (event.dataTransfer) { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', id); }
}
function dragOver(index, event) {
  const target = sorted.value[index];
  if (!target || target.redeemed) return;
  if (dragging.value && sorted.value.find(r => r.id === dragging.value)?.redeemed) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  over.value = index;
}
function drop(index, event) {
  event.preventDefault();
  const id = dragging.value || event.dataTransfer?.getData('text/plain') || '';
  if (!id) return;
  const openIds = sorted.value.filter(r => !r.redeemed).map(r => r.id);
  if (!openIds.includes(id)) return;
  let target = openIds.indexOf(sorted.value[index]?.id);
  if (target === -1) target = openIds.length;
  reorderRewards(id, target).catch(() => {});
  dragging.value = null; over.value = null;
}
function dragEnd() { dragging.value = null; over.value = null; }
</script>

<template>
  <div class="min-h-screen w-full bg-[#F9F5F0] pb-28">
    <div class="px-4 pt-6">
      <h1 class="text-[22px] font-medium text-[#333]">解锁犒赏</h1>
      <p class="text-[12px] text-[#888] mt-1">把努力攒起来，换你想要的小奖励 · 长按拖动调整顺序</p>
    </div>
    <div class="mx-4 mt-5 relative" style="height: 320px">
      <svg viewBox="0 0 200 320" preserveAspectRatio="xMidYMid meet" class="w-full h-full absolute inset-0">
        <defs>
          <linearGradient id="bottleBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#EAF6F8" stop-opacity="0.9" />
          </linearGradient>
          <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#A8D8E8" />
            <stop offset="100%" stop-color="#5DA9C7" />
          </linearGradient>
          <clipPath id="bottleClip"><path :d="BOTTLE" /></clipPath>
        </defs>
        <path d="M 70 8 L 70 38 Q 70 48 60 56 Q 30 80 30 130 L 30 300 Q 30 312 42 312 L 158 312 Q 170 312 170 300 L 170 130 Q 170 80 140 56 Q 130 48 130 38 L 130 8 Z" fill="url(#bottleBody)" stroke="rgba(51,51,51,0.18)" stroke-width="2" />
        <rect x="74" y="6" width="52" height="14" rx="3" fill="#FFFDF8" stroke="rgba(51,51,51,0.15)" />
        <text x="100" y="16" text-anchor="middle" fill="#888" font-size="9" font-family="sans-serif">CAP</text>
        <g clip-path="url(#bottleClip)">
          <rect x="0" :y="waterTop" width="200" :height="(312 * level) / 100" fill="url(#waterGradient)" />
          <path :d="`M 0 ${waterTop} Q 50 ${waterTop - 6} 100 ${waterTop} T 200 ${waterTop} L 200 ${waterTop + 8} L 0 ${waterTop + 8} Z`" fill="rgba(255,255,255,0.35)" />
        </g>
        <g v-for="i in 5" :key="i">
          <line :x1="170" :x2="178" :y1="80 + (i - 1) * 46" :y2="80 + (i - 1) * 46" stroke="rgba(51,51,51,0.25)" stroke-width="1.2" />
        </g>
      </svg>
      <div class="absolute top-6 left-0 right-0 z-10 text-center pointer-events-none">
        <div class="text-[12px] text-[#888]">当前总金币</div>
        <div class="text-[40px] leading-tight font-medium text-[#333] mt-1 inline-block px-4 rounded-2xl bg-white/70 backdrop-blur-sm">{{ state.totalCoins }}</div>
        <div class="text-[11px] text-[#888] mt-1">继续加油，离下一个目标越来越近啦</div>
      </div>
      <div class="absolute top-6 right-4 z-10 text-right pointer-events-none">
        <div class="text-[11px] text-[#888]">本瓶刻度</div>
        <div class="text-[14px] text-[#555]">{{ scale }}</div>
      </div>
      <div v-if="state.totalCoins === 0" class="absolute bottom-10 left-0 right-0 text-center text-[13px] text-[#888] z-10"> 蓄水瓶空空如也，去写日记来灌水吧～ </div>
    </div>
    <div class="px-4 mt-6 flex items-baseline justify-between">
      <h2 class="text-[16px] font-medium text-[#333]">兑换目标</h2>
      <button type="button" class="px-3 py-1.5 rounded-full bg-[#F3EDE5] text-[#555] text-[12px] transition active:scale-95" @click="openNew">+ 自定义目标</button>
    </div>
    <div class="mx-4 mt-3 space-y-3">
      <div v-if="!state.rewards.length" class="rounded-2xl bg-white p-6 text-center text-[13px] text-[#B8B8B8]"> 还没有兑换目标，加一个想要的东西吧～ </div>
      <div
        v-for="(reward, index) in sorted"
        :key="reward.id"
        :class="['rounded-2xl bg-white p-4 transition', [over === index ? 'ring-2 ring-[#5DA9C7]' : '', dragging === reward.id ? 'opacity-50' : '']]"
        :draggable="!reward.redeemed"
        @dragstart="dragStart(reward.id, $event)"
        @dragover="dragOver(index, $event)"
        @dragleave="over = null"
        @drop="drop(index, $event)"
        @dragend="dragEnd"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span v-if="!reward.redeemed" class="text-[#888] cursor-grab text-sm select-none" aria-label="拖动排序" title="长按拖动">⠿</span>
              <span class="text-[11px] text-[#5DA9C7] font-medium bg-[#EAF6F8] rounded-full px-2 py-[2px]"> #{{ index + 1 }} <span v-if="index === 0 && !reward.redeemed" class="text-[#F28B66] ml-1">本期</span></span>
              <span class="text-[15px] font-medium text-[#333] truncate">{{ reward.name }}</span>
              <span v-if="reward.redeemed" class="text-[10px] px-2 py-[2px] rounded-full bg-[#D7E8C7] text-[#6F8A5F]">已完成</span>
            </div>
            <div class="text-[11px] text-[#888] mt-1"> 需要 <span class="text-[#5DA9C7] font-medium">{{ reward.requiredCoins }}</span> 金币 <span v-if="index === 0 && !reward.redeemed" class="ml-2 text-[#F28B66]">· 当前正在攒</span></div>
          </div>
          <div class="flex gap-1">
            <button
              type="button"
              :class="['px-3 py-1.5 rounded-full text-[12px] transition active:scale-95', reward.redeemed || state.totalCoins < reward.requiredCoins ? 'bg-[#F3EDE5] text-[#B8B8B8] cursor-not-allowed' : 'text-white hover:brightness-110']"
              :style="reward.redeemed || state.totalCoins < reward.requiredCoins ? '' : 'background: linear-gradient(180deg, #7FBED4 0%, #5DA9C7 100%);'"
              :disabled="reward.redeemed || state.totalCoins < reward.requiredCoins"
              @click="redeem(reward.id)"
            >{{ reward.redeemed ? '已兑换' : '兑换' }}</button>
            <button type="button" class="px-2 py-1.5 rounded-full text-[12px] text-[#D4A89C] hover:bg-[#F7D7DC] transition" aria-label="删除目标" @click="remove(reward.id)">删除</button>
          </div>
        </div>
        <div class="mt-3">
          <div class="h-2 rounded-full bg-[#ECE5DD] overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500" :style="{ width: percent(index, reward.requiredCoins, reward.redeemed) + '%', background: reward.redeemed ? 'linear-gradient(90deg, #A8B5A3, #8FA587)' : 'linear-gradient(90deg, #A8D8E8, #5DA9C7)' }"></div>
          </div>
          <div class="flex justify-between mt-1">
            <span class="text-[11px] text-[#888]">{{ progressText(index, reward.requiredCoins, reward.redeemed) }}</span>
            <span class="text-[11px] text-[#888]">{{ percent(index, reward.requiredCoins, reward.redeemed) }}% </span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="open" class="fixed inset-0 bg-[rgba(51,51,51,0.45)] z-50 flex items-end md:items-center justify-center" @click.self="open = false">
      <div class="bg-[#FFFDF8] w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6">
        <h3 class="text-[18px] font-medium text-[#333] mb-4">新增兑换目标</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-[12px] text-[#888] mb-1">目标名称</label>
            <input v-model="name" type="text" maxlength="20" placeholder="例如：一本书" class="w-full px-4 py-3 rounded-2xl bg-[#F3EDE5] text-[14px] text-[#333] focus:outline-none focus:ring-1 focus:ring-[#F28B66]" />
          </div>
          <div>
            <label class="block text-[12px] text-[#888] mb-1">所需金币</label>
            <input v-model.number="coins" type="number" min="1" max="9999" class="w-full px-4 py-3 rounded-2xl bg-[#F3EDE5] text-[14px] text-[#333] focus:outline-none focus:ring-1 focus:ring-[#F28B66]" />
          </div>
        </div>
        <div class="mt-6 flex gap-3">
          <button type="button" class="flex-1 py-3 rounded-2xl bg-[#F3EDE5] text-[#555] text-[14px] transition active:scale-[0.98]" @click="open = false">取消</button>
          <button type="button" class="flex-1 py-3 rounded-2xl text-white text-[14px] font-medium transition active:scale-[0.98]" style="background: linear-gradient(180deg, #F28B66 0%, #FF6B35 100%)" @click="submit">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>
