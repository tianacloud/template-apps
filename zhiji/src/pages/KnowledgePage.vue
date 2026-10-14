<script setup lang="ts">
import { computed } from 'vue';
import { cards } from '../content/cards';
import { route } from '../router';
import { openEditor, state } from '../store';
import Icon from '../components/Icon.vue';
const card = computed(() => cards.find(c => c.id === route.cardId));
</script>
<template><div class="page knowledge-page"><a class="text-link" href="#/settings"><Icon name="chevron" class="flip" :size="16" /> 返回知识目录</a><article v-if="card" class="card knowledge-article"><span class="eyebrow">身体知识 · 陪伴资料</span><h1>{{ card.title }}</h1><p class="article-summary">{{ card.summary }}</p><p v-for="p in card.paragraphs" :key="p">{{ p }}</p><div v-if="card.suggestions.length" class="suggestion-box"><h2>今天可以试试</h2><ul><li v-for="p in card.suggestions" :key="p">{{ p }}</li></ul></div><div v-if="card.careNotices.length" class="care-notices"><h2>需要关注的情况</h2><p v-for="p in card.careNotices" :key="p">{{ p }}</p></div><div class="sources"><h2>资料来源</h2><a v-for="source in card.sources" :key="source.url" :href="source.url" target="_blank" rel="noreferrer">{{ source.title }} ↗</a><p class="hint">资料核对日期：{{ card.reviewedAt }}</p></div><button class="primary-button" @click="openEditor(state.today)"><Icon name="plus" :size="18" /> 记录今天的感受</button></article><section v-else class="card empty-state"><h1>这篇资料暂未找到</h1><a href="#/settings" class="secondary-button">查看知识目录</a></section></div></template>
