<script setup>
import { state } from './store.js';
</script>

<template>
  <router-view v-if="state.ready" />
  <div v-else class="min-h-screen w-full bg-[#F9F5F0] flex items-center justify-center px-6 text-center text-[13px] text-[#888]">{{ state.error }}</div>
</template>
