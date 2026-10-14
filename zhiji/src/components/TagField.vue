<script setup lang="ts">
import { labels } from '../types';
const props = defineProps<{ modelValue: string[] | null; options: string[]; label: string }>();
const emit = defineEmits<{ 'update:modelValue': [string[] | null] }>();
function toggle(key: string) { const selected = props.modelValue ?? []; emit('update:modelValue',selected.includes(key) ? selected.filter(x => x !== key) : [...selected,key]); }
</script>
<template>
  <fieldset class="tag-field"><legend>{{ label }}</legend>
    <div class="chips"><button v-for="key in options" :key="key" type="button" :aria-pressed="modelValue?.includes(key) ?? false" :class="{ selected: modelValue?.includes(key) }" @click="toggle(key)">{{ labels[key] || key }}</button></div>
    <div class="field-reset"><button type="button" :class="{ active: modelValue?.length === 0 }" @click="emit('update:modelValue',[])">明确没有</button><span>·</span><button type="button" :class="{ active: modelValue === null }" @click="emit('update:modelValue',null)">未记录</button></div>
  </fieldset>
</template>
