<script setup>
import { computed,ref } from 'vue';
import {dateOf,dateKey,addDays} from './domain.js';
const props=defineProps({modelValue:String,marked:{type:Array,default:()=>[]},week:Boolean});const emit=defineEmits(['update:modelValue']);const cursor=ref(props.modelValue||dateKey());
const heading=computed(()=>{const d=dateOf(cursor.value);return `${d.getFullYear()}年${d.getMonth()+1}月`;});
const days=computed(()=>{const d=dateOf(cursor.value);let start;if(props.week)start=addDays(cursor.value,-(d.getDay()+6)%7);else {d.setDate(1);start=addDays(dateKey(d),-(d.getDay()+6)%7);}return Array.from({length:props.week?7:42},(_,i)=>addDays(start,i));});
function move(n){const d=dateOf(cursor.value);if(props.week)d.setDate(d.getDate()+n*7);else {d.setDate(1);d.setMonth(d.getMonth()+n);}cursor.value=dateKey(d);}
function today(){cursor.value=dateKey();emit('update:modelValue',cursor.value);}
</script>
<template><div class="calendar"><div class="calendar-head"><button class="icon-button" aria-label="上一页日历" @click="move(-1)">‹</button><b>{{heading}}</b><button class="icon-button" aria-label="下一页日历" @click="move(1)">›</button><button class="text-button" @click="today">今天</button></div><div class="calendar-grid"><span v-for="d in ['一','二','三','四','五','六','日']" :key="d" class="weekday">{{d}}</span><button v-for="d in days" :key="d" :class="['calendar-day',{selected:d===modelValue,muted:d.slice(0,7)!==cursor.slice(0,7),today:d===dateKey()}]" @click="emit('update:modelValue',d)"><span>{{+d.slice(-2)}}</span><i v-if="marked.includes(d)"></i></button></div></div></template>
