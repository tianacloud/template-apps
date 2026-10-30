<script setup>
import { ref, computed } from 'vue';
import { state, tasksByCategory, allCategories, addTask, updateTask, deleteTask } from '../store.js';
import { CATEGORIES } from '../data/constants.js';
import { ask } from '../dialog.js';

const blank = (coins = 0, category = '学习篇') => ({ id: null, name: '', coins, category, isNewCategory: false });
const form = ref(blank());
const open = ref(false);
const saving = ref(false);
const categories = computed(() => [...CATEGORIES, ...allCategories.value.filter(c => !CATEGORIES.includes(c))]);
const STYLE = {
  学习篇: { bg: 'bg-[#FFE7CF]', text: 'text-[#A05A1F]', accent: 'border-l-[#F28B66]' },
  健身篇: { bg: 'bg-[#D7E8C7]', text: 'text-[#6F8A5F]', accent: 'border-l-[#A8B5A3]' },
  技能篇: { bg: 'bg-[#E5E1EE]', text: 'text-[#6F6191]', accent: 'border-l-[#C9C2D9]' },
  自媒体篇: { bg: 'bg-[#FCEFB8]', text: 'text-[#A07B1E]', accent: 'border-l-[#E8C896]' },
};
const style = c => STYLE[c] || { bg: 'bg-[#F3EDE5]', text: 'text-[#555]', accent: 'border-l-[#888]' };

function openNew() { form.value = blank(1); open.value = true; }
function openIn(category) { form.value = blank(1, category); open.value = true; }
function openEdit(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) { form.value = { id: task.id, name: task.name, coins: task.coins, category: task.category, isNewCategory: false }; open.value = true; }
}
function close() { open.value = false; form.value = blank(); }
async function submit() {
  const name = form.value.name.trim();
  if (!name || saving.value) return;
  const category = (form.value.isNewCategory ? form.value.category.trim() : form.value.category).trim() || '学习篇';
  saving.value = true;
  try {
    if (form.value.id) await updateTask(form.value.id, name, form.value.coins, category);
    else await addTask(name, form.value.coins, category);
    close();
  } catch { /* Reported by the store; the form stays open. */ } finally { saving.value = false; }
}
async function remove(id) {
  if (await ask('确定删除这个任务吗？历史已发放的金币不变，仅影响新记录。')) await deleteTask(id).catch(() => {});
}
</script>

<template>
  <div class="min-h-screen w-full bg-[#F9F5F0] pb-28">
    <div class="px-4 pt-6 flex items-end justify-between">
      <div>
        <h1 class="text-[22px] font-medium text-[#333]">爽文女主养成计划</h1>
        <p class="text-[12px] text-[#888] mt-1">分类养成 · 规则仅对新日记生效</p>
      </div>
      <button type="button" class="w-12 h-12 rounded-full text-white text-2xl leading-none flex items-center justify-center transition active:scale-95" style="background: linear-gradient(180deg, #F28B66 0%, #FF6B35 100%)" aria-label="新增任务" @click="openNew">+</button>
    </div>
    <div class="mx-4 mt-5 space-y-4">
      <div v-for="category in categories" v-show="(tasksByCategory[category] || []).length" :key="category" :class="['rounded-2xl bg-white overflow-hidden border-l-[3px]', style(category).accent]">
        <div :class="['flex items-center justify-between px-4 py-3', style(category).bg]">
          <div class="flex items-center gap-2">
            <span :class="['text-[14px] font-medium', style(category).text]">{{ category }}</span>
            <span :class="['text-[11px] px-2 py-[2px] rounded-full bg-white/70', style(category).text]">{{ tasksByCategory[category].length }} 项 </span>
          </div>
          <button type="button" :class="['text-[12px] px-3 py-1 rounded-full bg-white/80 transition active:scale-95', style(category).text]" @click="openIn(category)">+ 添加</button>
        </div>
        <div>
          <div v-for="task in tasksByCategory[category]" :key="task.id" class="grid grid-cols-12 items-center px-4 py-3 border-t border-[rgba(51,51,51,0.06)]">
            <div class="col-span-6 flex items-center gap-2 min-w-0">
              <span class="text-[14px] text-[#333] truncate">{{ task.name }}</span>
              <span v-if="task.isBuiltIn" class="text-[10px] px-2 py-[2px] rounded-full bg-[#FCEFB8] text-[#A07B1E] shrink-0">示例</span>
            </div>
            <div class="col-span-3 text-right text-[14px] text-[#F28B66] font-medium"> +{{ task.coins }}</div>
            <div class="col-span-3 flex justify-end gap-1">
              <button type="button" class="px-2 py-1 text-[12px] text-[#555] hover:bg-[#F3EDE5] rounded-lg transition" @click="openEdit(task.id)">编辑</button>
              <button type="button" class="px-2 py-1 text-[12px] text-[#D4A89C] hover:bg-[#F7D7DC] rounded-lg transition" @click="remove(task.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!state.tasks.length" class="rounded-2xl bg-white p-8 text-center text-[#B8B8B8] text-[13px]"> 还没有任务，点右上角 + 添加吧 </div>
    </div>
    <div class="mx-4 mt-5 rounded-2xl bg-[#F3EDE5] border-l-[3px] border-[#F28B66] p-4">
      <p class="text-[13px] text-[#555] leading-[1.6]"> 小提示：每条日记在保存时会按当前任务表快照金币数，之后再修改任务不会回头改写历史。 所以以前完成网课奖励 2 金币，以后改成 5 也只对新日记生效。 </p>
    </div>
    <div v-if="open" class="fixed inset-0 bg-[rgba(51,51,51,0.45)] z-50 flex items-end md:items-center justify-center" @click.self="close">
      <div class="bg-[#FFFDF8] w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6">
        <h3 class="text-[18px] font-medium text-[#333] mb-4">{{ form.id ? '编辑任务' : '新增任务' }}</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-[12px] text-[#888] mb-1">任务名称</label>
            <input v-model="form.name" type="text" maxlength="20" placeholder="例如：练字30分钟" class="w-full px-4 py-3 rounded-2xl bg-[#F3EDE5] text-[14px] text-[#333] focus:outline-none focus:ring-1 focus:ring-[#F28B66]" />
          </div>
          <div>
            <label class="block text-[12px] text-[#888] mb-1">金币数</label>
            <input v-model.number="form.coins" type="number" min="0" max="999" class="w-full px-4 py-3 rounded-2xl bg-[#F3EDE5] text-[14px] text-[#333] focus:outline-none focus:ring-1 focus:ring-[#F28B66]" />
          </div>
          <div>
            <label class="block text-[12px] text-[#888] mb-1">分类</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="category in categories"
                :key="category"
                type="button"
                :class="['px-3 py-1.5 rounded-full text-[12px] transition', form.isNewCategory || form.category !== category ? 'bg-[#F3EDE5] text-[#555] hover:bg-[#ECE5DD]' : 'bg-[#F28B66] text-white']"
                @click="form.isNewCategory = false; form.category = category"
              >{{ category }}</button>
              <button
                type="button"
                :class="['px-3 py-1.5 rounded-full text-[12px] transition border border-dashed', form.isNewCategory ? 'bg-[#F28B66] text-white border-[#F28B66]' : 'bg-[#F3EDE5] text-[#555] border-[#B8B8B8] hover:bg-[#ECE5DD]']"
                @click="form.isNewCategory = true; form.category = ''"
              >+ 其他篇</button>
            </div>
            <input v-if="form.isNewCategory" v-model="form.category" type="text" maxlength="10" placeholder="例如：副业篇" class="mt-2 w-full px-4 py-3 rounded-2xl bg-[#F3EDE5] text-[14px] text-[#333] focus:outline-none focus:ring-1 focus:ring-[#F28B66]" />
          </div>
        </div>
        <div class="mt-6 flex gap-3">
          <button type="button" class="flex-1 py-3 rounded-2xl bg-[#F3EDE5] text-[#555] text-[14px] transition active:scale-[0.98]" @click="close">取消</button>
          <button type="button" class="flex-1 py-3 rounded-2xl text-white text-[14px] font-medium transition active:scale-[0.98]" style="background: linear-gradient(180deg, #F28B66 0%, #FF6B35 100%)" @click="submit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>
