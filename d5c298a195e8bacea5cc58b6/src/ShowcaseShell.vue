<script setup>
import { ref } from 'vue';
import App from './App.vue';
import { useDialogs } from './dialog.js';

const props = defineProps({ reset: Function });
// The preview iframe has no native dialogs: confirmations and notices appear in the page.
const dialog = ref(null);
useDialogs({
  ask: message => new Promise(resolve => { dialog.value = { message, confirm: true, resolve }; }),
  notify: message => new Promise(resolve => { dialog.value = { message, confirm: false, resolve: () => resolve() }; }),
});
function answer(value) { const current = dialog.value; dialog.value = null; current?.resolve(value); }
const appKey = ref(0);
async function restore() { await props.reset(); appKey.value++; }
</script>

<template>
  <div class="bg-[#F9F5F0]">
    <div class="px-4 pt-2 text-[11px] text-[#888] flex items-center justify-between">
      <span>示例体验，数据仅保留在本页</span>
      <button type="button" class="text-[#F28B66] px-2 py-0.5 rounded-full hover:bg-[#F3EDE5] transition" @click="restore">恢复示例</button>
    </div>
    <App :key="appKey" />
    <div v-if="dialog" class="fixed inset-0 bg-[rgba(51,51,51,0.45)] z-[60] flex items-end md:items-center justify-center">
      <div class="bg-[#FFFDF8] w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6">
        <p class="text-[15px] text-[#333] leading-[1.6]">{{ dialog.message }}</p>
        <div class="mt-6 flex gap-3">
          <button v-if="dialog.confirm" type="button" class="flex-1 py-3 rounded-2xl bg-[#F3EDE5] text-[#555] text-[14px] transition active:scale-[0.98]" @click="answer(false)">取消</button>
          <button type="button" class="flex-1 py-3 rounded-2xl text-white text-[14px] font-medium transition active:scale-[0.98]" style="background: linear-gradient(180deg, #F28B66 0%, #FF6B35 100%)" @click="answer(true)">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>
