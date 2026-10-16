<script setup>
import map from './icon-map.json';
const props=defineProps({value:String});
const files=import.meta.glob('./icons/*.svg',{query:'?raw',import:'default',eager:true});
</script>
<template><span class="cute-icon" aria-hidden="true" v-html="files['./icons/'+map[value]+'.svg']||value"></span></template>
