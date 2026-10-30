<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const tabs = [
  { name: 'diary', label: '日记', icon: '📓', path: '/diary' },
  { name: 'task', label: '任务', icon: '📚', path: '/task' },
  { name: 'exchange', label: '兑换', icon: '🎁', path: '/exchange' },
];
const active = computed(() => route.path.startsWith('/task') ? 'task' : route.path.startsWith('/exchange') ? 'exchange' : 'diary');
function go(path) { if (route.path !== path) router.push(path); }
</script>

<template>
  <div class="min-h-screen w-full bg-[#F9F5F0] flex flex-col">
    <header class="px-4 pt-4 pb-2">
      <div class="flex items-baseline justify-between">
        <h1 class="text-[20px] font-medium text-[#333]">大兜力量池✨</h1>
        <span class="text-[10px] text-[#888]">把每一天都攒成一束光</span>
      </div>
    </header>
    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <nav class="fixed bottom-0 left-0 right-0 z-40 pb-[max(env(safe-area-inset-bottom),8px)] bg-[#F9F5F0]/95 backdrop-blur" style="border-top: 1px solid rgba(51,51,51,0.06)">
      <div class="max-w-screen-md mx-auto grid grid-cols-3 px-2 py-2">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          type="button"
          :class="['flex flex-col items-center justify-center py-2 rounded-2xl transition active:scale-95', active === tab.name ? 'text-[#F28B66]' : 'text-[#888]']"
          @click="go(tab.path)"
        >
          <span class="text-[20px] leading-none">{{ tab.icon }}</span>
          <span class="text-[12px] mt-1">{{ tab.label }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
