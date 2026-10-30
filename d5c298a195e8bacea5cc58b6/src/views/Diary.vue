<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import MiniCalendar from '../components/MiniCalendar.vue';
import { state, tasksByCategory, allCategories, saveDiary, deleteDiary } from '../store.js';
import { ask } from '../dialog.js';
import { dateKey, pad, photoId, readPhoto, cleanHtml } from '../utils.js';

const FONT = '"ZCOOL XiaoWei", "STKaiti", "KaiTi", "楷体", "Yuanti SC", cursive';
const STICKER_EMOJI = { sun: '☀️', leaf: '🍃', cloud: '☁️', star: '⭐', heart: '💗', flower: '🌸' };
const STICKER_BG = { sun: 'bg-[#FFE7CF]', leaf: 'bg-[#D7E8C7]', cloud: 'bg-[#E5E1EE]', star: 'bg-[#FCEFB8]', heart: 'bg-[#F7D7DC]', flower: 'bg-[#FBD4DE]' };
const MOODS = [
  { id: 'excited', label: '超兴奋', emoji: '🤩', color: '#F28B66' },
  { id: 'happy', label: '开心', emoji: '😊', color: '#F9C5B0' },
  { id: 'calm', label: '平静', emoji: '😐', color: '#A8B5A3' },
  { id: 'tired', label: '有点累', emoji: '😮‍💨', color: '#C9C2D9' },
  { id: 'sad', label: '低落', emoji: '😭', color: '#9BB3C7' },
];
const MOOD_STYLE = {
  excited: { color: '#B07A6E', weight: 700, rotate: -1, bg: 'bg-[#EFE0D6]' },
  happy: { color: '#C9A78F', weight: 600, rotate: 0, bg: 'bg-[#F1E7DA]' },
  calm: { color: '#8FA38B', weight: 500, rotate: 0, bg: 'bg-[#E5EAE0]' },
  tired: { color: '#9F8FA8', weight: 500, rotate: 0, bg: 'bg-[#ECE6EF]' },
  sad: { color: '#8FA0AE', weight: 500, rotate: 0, bg: 'bg-[#E4EAEE]' },
};
const CATEGORY_STYLE = {
  学习篇: { bg: 'bg-[#FFE7CF]', text: 'text-[#A05A1F]' },
  健身篇: { bg: 'bg-[#D7E8C7]', text: 'text-[#6F8A5F]' },
  技能篇: { bg: 'bg-[#E5E1EE]', text: 'text-[#6F6191]' },
  自媒体篇: { bg: 'bg-[#FCEFB8]', text: 'text-[#A07B1E]' },
};

const selectedDate = ref(dateKey(new Date()));
const editing = ref(true);
const fontKey = ref('serif');
const editorRef = ref(null);
const content = ref('');
const mood = ref('happy');
const quantities = ref({});
const photos = ref([]);
const saving = ref(false);

const current = computed(() => state.diaries.find(d => d.date === selectedDate.value));
watch(() => state.diaries, () => { editing.value = !current.value; }, { deep: true });

// Each typed text node is wrapped in a span carrying the editor font class.
function wrapTextNodes() {
  if (!editorRef.value) return;
  const cls = `font-${fontKey.value}`, selection = window.getSelection();
  let range = null;
  if (selection && selection.rangeCount > 0) { try { range = selection.getRangeAt(0).cloneRange(); } catch { range = null; } }
  for (const node of Array.from(editorRef.value.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim()) {
      const span = document.createElement('span');
      span.className = cls; span.textContent = node.textContent;
      try { editorRef.value.replaceChild(span, node); } catch { /* Node already moved. */ }
    }
  }
  if (range && selection) { try { selection.removeAllRanges(); selection.addRange(range); } catch { /* Range no longer valid. */ } }
}
function onEditorInput() { if (editorRef.value) { wrapTextNodes(); content.value = editorRef.value.innerHTML; } }
function onPaste(event) {
  const text = event.clipboardData?.getData('text/plain') || '', selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const span = document.createElement('span');
  span.className = `font-${fontKey.value}`; span.textContent = text;
  range.insertNode(span); range.setStartAfter(span); range.collapse(true);
  selection.removeAllRanges(); selection.addRange(range);
  if (editorRef.value) content.value = editorRef.value.innerHTML;
}
async function syncEditor() {
  await nextTick();
  if (editorRef.value) { editorRef.value.innerHTML = content.value || ''; wrapTextNodes(); content.value = editorRef.value.innerHTML; }
}
const editorEmpty = computed(() => !content.value || content.value.replace(/<br\s*\/?>/g, '').replace(/<[^>]+>/g, '').trim() === '');

function loadSelected() {
  const diary = current.value;
  if (diary) {
    content.value = diary.content; mood.value = diary.mood || 'happy';
    if (diary.quantities && Object.keys(diary.quantities).length > 0) quantities.value = { ...diary.quantities };
    else { const counts = {}; for (const id of diary.completedTaskIds) counts[id] = (counts[id] || 0) + 1; quantities.value = counts; }
    photos.value = [...diary.photos]; editing.value = false;
  } else { content.value = ''; mood.value = 'happy'; quantities.value = {}; photos.value = []; editing.value = true; }
}
function change(taskId, delta) {
  const next = (quantities.value[taskId] || 0) + delta;
  if (next <= 0) { const { [taskId]: _removed, ...rest } = quantities.value; quantities.value = rest; }
  else quantities.value = { ...quantities.value, [taskId]: next };
}
onMounted(loadSelected);
watch(selectedDate, loadSelected);
watch(editing, async value => { if (value) await syncEditor(); });
watch(() => current.value?.content, async value => { if (editing.value && value !== undefined) await syncEditor(); });

const picked = computed(() => Object.entries(quantities.value).filter(([, n]) => n > 0).map(([id]) => id));
async function addPhotos(event) {
  const input = event.target, files = input.files;
  if (!files || !files.length) return;
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue;
    photos.value.push({ id: photoId(), dataUrl: await readPhoto(file) });
  }
  input.value = '';
}
const estimate = computed(() => {
  let sum = 0;
  for (const [id, n] of Object.entries(quantities.value)) { const task = state.tasks.find(t => t.id === id); if (task) sum += task.coins * n; }
  return sum;
});
async function save() {
  if (saving.value) return;
  saving.value = true;
  try {
    await saveDiary({ date: selectedDate.value, content: cleanHtml(content.value), mood: mood.value, quantities: quantities.value, photos: photos.value });
    editing.value = false;
  } catch { /* The store reported it; the input stays. */ } finally { saving.value = false; }
}
async function remove() {
  if (!current.value || !(await ask('删除这一天的日记会同时扣除对应金币，确定吗？'))) return;
  try { await deleteDiary(current.value.id); loadSelected(); } catch { /* Reported by the store. */ }
}

// Stickers get a stable look from the photo id.
function sticker(photo) {
  let hash = 0;
  for (const ch of photo.id) hash = (31 * hash + ch.charCodeAt(0)) >>> 0;
  const style = ['sun', 'leaf', 'cloud', 'star', 'heart', 'flower'][hash % 6];
  return { bg: STICKER_BG[style], emoji: STICKER_EMOJI[style], rotate: Math.round(24 * (((9301 * hash + 49297) % 233280) / 233280) - 12) };
}
const dateLabel = computed(() => {
  const [y, m, d] = selectedDate.value.split('-').map(Number), date = new Date(y, (m || 1) - 1, d || 1);
  return `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日 · 周${['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}`;
});
const showEstimate = computed(() => editing.value && (content.value.trim() || picked.value.length || photos.value.length));
const moodKey = computed(() => editing.value ? mood.value : current.value?.mood || 'happy');
const moodStyle = computed(() => MOOD_STYLE[moodKey.value]);
const moodOption = computed(() => MOODS.find(m => m.id === moodKey.value));
const categoryBg = c => CATEGORY_STYLE[c]?.bg || 'bg-[#F3EDE5]';
const categoryText = c => CATEGORY_STYLE[c]?.text || 'text-[#555]';
const markedDates = computed(() => state.diaries.map(d => ({ date: d.date, progress: Math.min(1, d.earnedCoins / 30) })));
const dailyProgress = computed(() => { const map = {}; for (const d of state.diaries) map[d.date] = Math.min(1, d.earnedCoins / 30); return map; });
</script>

<template>
  <div class="min-h-screen w-full bg-[#F9F5F0] pb-28">
    <div class="px-4 pt-6">
      <h1 class="text-[22px] font-medium text-[#333]">日记本</h1>
      <p class="text-[12px] text-[#888] mt-1">写下今天，完成的事会自己变成金币</p>
    </div>
    <div class="mx-4 mt-4 rounded-3xl bg-[#FFFDF8] border border-dashed border-[#E5DCC9] relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none opacity-40" style="background-image:repeating-linear-gradient(transparent 0px, transparent 30px, #EEE3CD 30px, #EEE3CD 31px);"></div>
      <div class="absolute top-0 bottom-0 left-12 w-px bg-[#F4C7B0] opacity-70"></div>
      <div aria-hidden="true" class="absolute inset-0 pointer-events-none">
        <span class="absolute top-2 right-4 text-[22px] drop-shadow-sm" style="transform:rotate(12deg);">🌸</span>
        <span class="absolute top-12 left-3 text-[18px] opacity-90" style="transform:rotate(-10deg);">✨</span>
        <span class="absolute bottom-32 right-3 text-[20px]" style="transform:rotate(8deg);">🦋</span>
        <span class="absolute bottom-6 right-6 text-[16px] opacity-80" style="transform:rotate(-14deg);">💫</span>
        <span class="absolute top-1/2 left-1.5 text-[14px] opacity-70" style="transform:rotate(15deg);">⭐️</span>
        <span class="absolute top-24 right-2 text-[14px] opacity-70" style="transform:rotate(-18deg);">🍡</span>
      </div>
      <div class="relative px-5 py-5 pl-16">
        <div class="flex items-baseline justify-between mb-2">
          <span class="text-[15px] font-medium text-[#333]">{{ dateLabel }}</span>
          <span v-if="showEstimate || current" class="text-[12px] text-[#F28B66]"> +{{ estimate }} 金币 </span>
        </div>
        <div class="relative z-10 flex items-center gap-2 mb-3 flex-wrap">
          <span v-for="m in MOODS" :key="`top-${m.id}`">
            <button
              v-if="editing"
              type="button"
              :class="['w-9 h-9 rounded-full text-lg flex items-center justify-center transition border-2', mood === m.id ? 'border-[#F28B66] bg-[#FFE7CF] scale-110' : 'border-transparent bg-[#F3EDE5] hover:bg-[#ECE5DD] hover:scale-105']"
              :aria-label="`心情：${m.label}`"
              @click="mood = m.id"
            >{{ m.emoji }}</button>
          </span>
        </div>
        <div v-if="photos.length" class="relative z-10 mt-2 mb-3">
          <div class="flex flex-wrap gap-3">
            <div v-for="(photo, index) in photos" :key="photo.id" class="relative">
              <div :class="['w-24 h-24 rounded-2xl overflow-hidden border-[3px] border-white shadow-inner relative', sticker(photo).bg]" :style="{ transform: `rotate(${sticker(photo).rotate}deg)` }">
                <img :src="photo.dataUrl" class="w-full h-full object-cover" />
                <span v-if="index % 2 === 0" class="absolute -top-2 -right-2 text-2xl drop-shadow">{{ sticker(photo).emoji }}</span>
              </div>
              <button
                v-if="editing"
                type="button"
                class="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-[#D4A89C] text-white text-xs leading-none flex items-center justify-center"
                aria-label="删除贴纸"
                @click="photos = photos.filter(p => p.id !== photo.id)"
              >×</button>
            </div>
          </div>
        </div>
        <div v-if="editing" class="relative">
          <div
            ref="editorRef"
            contenteditable="true"
            spellcheck="false"
            class="editor-area w-full bg-transparent focus:outline-none text-[15px] leading-[30px] min-h-[180px] whitespace-pre-wrap break-words"
            :style="{ color: moodStyle.color, fontWeight: moodStyle.weight, transform: `rotate(${moodStyle.rotate}deg)`, letterSpacing: '0.5px', textShadow: '0.5px 0.5px 0 rgba(255,255,255,0.6)', fontFamily: FONT }"
            @input="onEditorInput"
            @blur="onEditorInput"
            @paste.prevent="onPaste"
          ></div>
          <span v-if="editorEmpty" class="pointer-events-none absolute text-[#B8B8B8] text-[15px]" style="left: 0; top: 56px">今天发生了什么呢……</span>
        </div>
        <div v-else class="relative">
          <div aria-hidden="true" class="absolute inset-0 pointer-events-none overflow-visible">
            <span class="absolute -top-1 -left-2 w-9 h-9 rounded-full flex items-center justify-center text-base shadow-sm" style="background:#D4A89C;transform:rotate(-8deg);">🌷</span>
            <span class="absolute top-2 -right-3 w-8 h-8 rounded-2xl flex items-center justify-center text-sm shadow-sm" style="background:#A8B5A3;transform:rotate(10deg);">🍃</span>
            <span class="absolute -bottom-2 left-6 w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-sm" style="background:#C9C2D9;transform:rotate(-12deg);">💜</span>
            <span class="absolute bottom-4 -right-2 w-8 h-8 rounded-2xl flex items-center justify-center text-sm shadow-sm" style="background:#E8D9B0;transform:rotate(6deg);">☁️</span>
            <span class="absolute top-1/2 -left-4 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm opacity-90" style="background:#9BB3C7;transform:rotate(14deg);">🪻</span>
            <span class="absolute top-1/3 right-4 w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-sm opacity-90" style="background:#D8C9B5;transform:rotate(-6deg);">🧵</span>
          </div>
          <div class="relative inline-block w-full">
            <span aria-hidden="true" class="absolute -top-3 left-8 w-16 h-5 z-20 pointer-events-none" style="background:rgba(232,217,176,0.55);transform:rotate(-6deg);box-shadow:0 1px 2px rgba(0,0,0,0.08);"></span>
            <span aria-hidden="true" class="absolute -top-3 right-10 w-14 h-5 z-20 pointer-events-none" style="background:rgba(212,168,156,0.55);transform:rotate(8deg);box-shadow:0 1px 2px rgba(0,0,0,0.08);"></span>
            <span aria-hidden="true" class="absolute -bottom-2 right-16 w-10 h-4 z-20 pointer-events-none opacity-80" style="background:rgba(168,181,163,0.55);transform:rotate(-10deg);box-shadow:0 1px 2px rgba(0,0,0,0.06);"></span>
            <span aria-hidden="true" class="absolute -top-3 left-8 w-16 h-5 z-30 pointer-events-none" style="background:repeating-linear-gradient(90deg, transparent 0 6px, rgba(255,255,255,0.25) 6px 7px);transform:rotate(-6deg);mix-blend-mode:overlay;"></span>
            <span aria-hidden="true" class="absolute -top-3 right-10 w-14 h-5 z-30 pointer-events-none" style="background:repeating-linear-gradient(90deg, transparent 0 6px, rgba(255,255,255,0.25) 6px 7px);transform:rotate(8deg);mix-blend-mode:overlay;"></span>
            <div
              :class="['diary-content whitespace-pre-wrap text-[17px] leading-[34px] min-h-[120px] rounded-xl px-3 py-2 inline-block w-full relative', moodStyle.bg]"
              :style="{ color: moodStyle.color, fontWeight: moodStyle.weight, transform: `rotate(${moodStyle.rotate}deg)`, letterSpacing: '1px', lineHeight: '36px', textShadow: '1.5px 1.5px 0 rgba(255,255,255,0.85), 0 0 2px rgba(0,0,0,0.05)', fontFamily: FONT, boxShadow: '0 4px 14px rgba(180,160,140,0.18)' }"
              v-html="cleanHtml(current?.content) || '（今天还没有日记，点击下方编辑开始记录吧）'"
            ></div>
          </div>
        </div>
        <div class="relative z-10 mt-4 pt-3 border-t border-dashed border-[#E5DCC9]">
          <div class="flex items-center gap-2">
            <span :class="['inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-medium', moodStyle.bg]" :style="{ color: moodStyle.color }">
              <span class="text-lg leading-none">{{ moodOption?.emoji }}</span>
              <span>{{ moodOption?.label }}</span>
            </span>
          </div>
        </div>
        <div v-if="!editing && current?.snapshots.length" class="mt-4 flex flex-wrap gap-2">
          <span v-for="snap in current.snapshots" :key="snap.taskId" :class="['inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px]', [categoryBg(snap.category), categoryText(snap.category)]]">
            <span>✓</span> {{ snap.taskName }} <span v-if="snap.count > 1" class="opacity-70">×{{ snap.count }}</span><span class="opacity-80">+{{ snap.coins * snap.count }}</span>
          </span>
        </div>
        <div v-if="editing" class="mt-4">
          <div class="text-[12px] text-[#888] mb-2">完成任务（点加减数量）</div>
          <div class="space-y-3">
            <div v-for="category in allCategories" :key="category">
              <div class="text-[11px] text-[#999] mb-1.5 pl-1">{{ category }}</div>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="task in tasksByCategory[category]"
                  :key="task.id"
                  :class="['inline-flex items-center rounded-full text-[13px] overflow-hidden border transition', quantities[task.id] ? [categoryBg(task.category), categoryText(task.category), 'border-transparent'] : 'bg-[#F3EDE5] text-[#555] border-transparent']"
                >
                  <button type="button" :class="['w-7 h-7 flex items-center justify-center text-base leading-none transition', quantities[task.id] ? 'hover:bg-black/10' : 'text-[#888] hover:bg-[#ECE5DD]']" :disabled="!quantities[task.id]" aria-label="减少" @click="change(task.id, -1)">−</button>
                  <span class="px-1.5 font-medium">{{ task.name }}</span>
                  <span v-if="quantities[task.id]" class="px-1 text-[11px] opacity-70 font-medium">×{{ quantities[task.id] }}</span>
                  <button type="button" :class="['w-7 h-7 flex items-center justify-center text-base leading-none transition', quantities[task.id] ? 'hover:bg-black/10' : 'text-[#F28B66] hover:bg-[#ECE5DD]']" aria-label="增加" @click="change(task.id, 1)">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="editing" class="mt-4">
          <label class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#F3EDE5] text-[#555] text-[13px] cursor-pointer hover:bg-[#ECE5DD] transition">
            <span class="text-lg leading-none">📷</span>
            <span>添加照片贴纸</span>
            <input type="file" accept="image/*" multiple class="hidden" @change="addPhotos" />
          </label>
          <p class="text-[11px] text-[#B8B8B8] mt-1">照片会自动变成可爱贴画，贴在日记里</p>
        </div>
      </div>
    </div>
    <div class="mx-4 mt-4 flex gap-3">
      <template v-if="editing">
        <button type="button" class="flex-1 py-3 rounded-2xl bg-[#F28B66] text-white text-[15px] font-medium transition active:scale-[0.98]" @click="save">保存日记</button>
        <button v-if="current" type="button" class="px-4 py-3 rounded-2xl bg-[#F3EDE5] text-[#D4A89C] text-[14px] transition active:scale-[0.98]" @click="remove">删除</button>
      </template>
      <button v-else type="button" class="flex-1 py-3 rounded-2xl bg-[#F28B66] text-white text-[15px] font-medium transition active:scale-[0.98]" @click="editing = true">编辑今天的日记</button>
    </div>
    <div class="px-4 mt-6">
      <div class="flex items-baseline justify-between mb-2 px-1">
        <h2 class="text-[16px] font-medium text-[#333]">来时路</h2>
        <span class="text-[12px] text-[#888]">小水瓶 = 当天任务进度</span>
      </div>
      <MiniCalendar :selected-date="selectedDate" :marked-dates="markedDates" :daily-progress="dailyProgress" @select="date => (selectedDate = date)" />
    </div>
  </div>
</template>

<style scoped>
.editor-area :deep(span),
.diary-content :deep(span) {
  font-family: "ZCOOL XiaoWei", STKaiti, KaiTi, 楷体, "Yuanti SC", cursive;
  white-space: pre-wrap;
}
.editor-area,
.diary-content {
  font-family: "ZCOOL XiaoWei", STKaiti, KaiTi, 楷体, "Yuanti SC", cursive;
}
</style>
