<script setup lang="ts">
import { ref } from 'vue';
import type { KnowledgeCard } from '../types';
import Icon from './Icon.vue';
defineProps<{ card: KnowledgeCard }>();
const expanded = ref(false);
</script>
<template><article class="knowledge-card"><button class="knowledge-toggle" :aria-expanded="expanded" :aria-controls="'knowledge-' + card.id" @click="expanded = !expanded"><span class="knowledge-icon"><Icon name="book" /></span><span><strong>{{ card.title }}</strong><small>{{ card.summary }}</small></span><Icon name="chevron" :class="{ rotated: expanded }" /></button>
  <div v-if="expanded" :id="'knowledge-' + card.id" class="knowledge-body"><p v-for="p in card.paragraphs" :key="p">{{ p }}</p><p v-for="p in card.careNotices" :key="p" class="care-note">{{ p }}</p><a :href="'#/knowledge/' + card.id" class="text-link">查看完整资料与来源 <Icon name="arrow" :size="14" /></a></div></article></template>
