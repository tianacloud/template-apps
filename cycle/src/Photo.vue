<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
const props = defineProps({ path: String });
const element = ref(null), failed = ref(false);
let unbind, revision = 0;
watch([element, () => props.path], async () => {
  const version = ++revision;
  unbind?.(); unbind = undefined;
  if (!element.value) return;
  failed.value = false;
  if (props.path.startsWith('data:') || props.path.startsWith('blob:')) { element.value.src = props.path; return; }
  try {
    const cleanup = await window.tiana.files.bindImage(element.value, props.path);
    if (version === revision) unbind = cleanup; else cleanup();
  } catch { if (version === revision) failed.value = true; }
}, { flush: 'post' });
onBeforeUnmount(() => { revision++; unbind?.(); });
</script>
<template><span v-if="failed" class="photo-error">照片加载失败</span><img v-else ref="element" alt="完成记录照片" @error="failed = true" loading="lazy"></template>
