<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 });
const paths: Record<string,string> = {
  today: 'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  calendar: 'M7 3v4m10-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z',
  insights: 'M4 20h16M6 16v-5m6 5V4m6 12V8',
  settings: 'M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM4 21v-2a8 5 0 0 1 16 0v2',
  plus: 'M12 5v14M5 12h14', close: 'm6 6 12 12M6 18 18 6', chevron: 'm9 5 7 7-7 7',
  arrow: 'M4 12h16m-6-6 6 6-6 6', check: 'm5 12 4 4L19 6', cloud: 'M7 18H6a4 4 0 0 1 0-8 6 6 0 0 1 11.5-2A5 5 0 0 1 18 18h-1m-5 2V10m-4 4 4-4 4 4',
  book: 'M12 6v15M3 4c3-1 6 0 9 2 3-2 6-3 9-2v15c-3-1-6 0-9 2-3-2-6-3-9-2V4Z',
  drop: 'M12 3C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-12Z', leaf: 'M5 19C3 7 9 3 21 3c0 12-5 16-16 16Zm0 0L16 8',
  heart: 'M12 20 4 12C-3 4 8 0 12 7c4-7 15-3 8 5l-8 8Z', download: 'M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4',
  edit: 'm14 4 6 6M4 20l1-6L17 2l5 5-12 12-6 1Z', trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
};
</script>
<template><svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name] || paths.leaf" /></svg></template>
