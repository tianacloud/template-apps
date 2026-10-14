<script setup lang="ts">
import type { DailyLog, Discharge } from '../types';
import { labels } from '../types';
import { options } from '../domain/records';
import TagField from './TagField.vue';
import Icon from './Icon.vue';
const draft = defineModel<DailyLog>({ required: true });
defineProps<{ hidden: string[] }>();
function setDischarge(value: string) {
  const blank: Discharge = { present: value === 'yes',amount: null,colors: null,textures: null,odor: null,itching: null,burning: null };
  draft.value.discharge = value === '' ? null : blank;
}
function addBowel() { (draft.value.bowelEvents ??= []).push({ id: crypto.randomUUID(),bristolType: null,straining: null,pain: null,note: null }); }
function addIntimacy() { (draft.value.intimacyEvents ??= []).push({ id: crypto.randomUUID(),protection: null,discomfort: null,bleedingAfter: null,note: null }); }
</script>
<template>
  <div class="daily-fields">
    <fieldset v-if="!hidden.includes('bleeding')" class="field-group"><legend><Icon name="drop" :size="17" /> 出血</legend>
      <div class="field-pair"><label>出血性质<select v-model="draft.bleedingType"><option :value="null">未记录</option><option v-for="x in options.bleedingType" :key="x" :value="x">{{ labels[x] }}</option></select></label>
      <label>出血量<select v-model="draft.flowLevel"><option :value="null">未记录</option><option v-for="x in options.flowLevel" :key="x" :value="x">{{ labels[x] }}</option></select></label></div>
      <TagField v-model="draft.bloodColors" :options="options.bloodColors" label="颜色（可多选）" />
    </fieldset>
    <fieldset v-if="!hidden.includes('pain')" class="field-group"><legend>疼痛</legend>
      <label>疼痛程度（0～10 分）<input v-model.number="draft.painScore" type="number" min="0" max="10" step="1" placeholder="未记录" @change="draft.painScore = draft.painScore === ('' as any) ? null : draft.painScore" /></label>
      <p class="hint">0 分代表明确无痛，留空代表未记录。</p><TagField v-model="draft.painLocations" :options="options.painLocations" label="疼痛位置" />
    </fieldset>
    <div v-if="!hidden.includes('symptoms')" class="field-group"><TagField v-model="draft.symptoms" :options="options.symptoms" label="身体感受" /></div>
    <div v-if="!hidden.includes('moods')" class="field-group"><TagField v-model="draft.moods" :options="options.moods" label="今天的情绪" /></div>
    <fieldset v-if="!hidden.includes('sleep')" class="field-group"><legend>睡眠</legend><div class="field-pair">
      <label>时长（小时）<input v-model.number="draft.sleepHours" type="number" min="0" max="24" step="0.1" placeholder="未记录" @change="draft.sleepHours = draft.sleepHours === ('' as any) ? null : draft.sleepHours" /></label>
      <label>睡眠质量<select v-model="draft.sleepQuality"><option :value="null">未记录</option><option v-for="x in options.sleepQuality" :key="x" :value="x">{{ labels[x] }}</option></select></label></div>
    </fieldset>
    <fieldset v-if="!hidden.includes('bowel')" class="field-group"><legend>便便</legend>
      <div class="event-status"><span>{{ draft.bowelEvents === null ? '未记录' : draft.bowelEvents.length ? `已记录 ${draft.bowelEvents.length} 次` : '已记录：当天没有' }}</span><button type="button" class="text-button" @click="draft.bowelEvents = []">当天没有</button><button type="button" class="text-button" @click="draft.bowelEvents = null">清空</button></div>
      <div v-for="(event,i) in draft.bowelEvents" :key="event.id" class="event-card"><div class="row-between"><strong>第 {{ i + 1 }} 次</strong><button type="button" class="icon-button" :aria-label="`删除第 ${i + 1} 次便便`" @click="draft.bowelEvents!.splice(i,1)"><Icon name="close" :size="16" /></button></div>
        <label>便型<select v-model="event.bristolType"><option :value="null">未填写</option><option v-for="n in 7" :key="n" :value="n">Bristol {{ n }} 型 · {{ ['坚硬小块','结块香肠状','表面有裂纹','光滑柔软','柔软小块','松散糊状','水样'][n-1] }}</option></select></label>
        <div class="field-pair"><label>费力<select v-model="event.straining"><option :value="null">未记录</option><option :value="true">有</option><option :value="false">没有</option></select></label>
        <label>疼痛<select v-model="event.pain"><option :value="null">未记录</option><option :value="true">有</option><option :value="false">没有</option></select></label></div><label>这次的备注<input v-model="event.note" placeholder="可选" /></label>
      </div><button type="button" class="add-event" @click="addBowel"><Icon name="plus" :size="16" /> 添加一次排便</button>
    </fieldset>
    <fieldset v-if="!hidden.includes('intimacy')" class="field-group"><legend>爱爱</legend>
      <div class="event-status"><span>{{ draft.intimacyEvents === null ? '未记录' : draft.intimacyEvents.length ? `已记录 ${draft.intimacyEvents.length} 次` : '已记录：当天没有' }}</span><button type="button" class="text-button" @click="draft.intimacyEvents = []">当天没有</button><button type="button" class="text-button" @click="draft.intimacyEvents = null">清空</button></div>
      <div v-for="(event,i) in draft.intimacyEvents" :key="event.id" class="event-card"><div class="row-between"><strong>第 {{ i + 1 }} 次</strong><button type="button" class="icon-button" :aria-label="`删除第 ${i + 1} 次爱爱`" @click="draft.intimacyEvents!.splice(i,1)"><Icon name="close" :size="16" /></button></div>
        <label>保护措施<select v-model="event.protection"><option :value="null">未记录</option><option value="YES">有</option><option value="NO">没有</option><option value="UNSURE">不确定</option></select></label>
        <div class="field-pair"><label>疼痛／不适<select v-model="event.discomfort"><option :value="null">未记录</option><option :value="true">有</option><option :value="false">没有</option></select></label>
        <label>事后出血<select v-model="event.bleedingAfter"><option :value="null">未记录</option><option :value="true">有</option><option :value="false">没有</option></select></label></div><label>这次的备注<input v-model="event.note" placeholder="可选" /></label>
      </div><button type="button" class="add-event" @click="addIntimacy"><Icon name="plus" :size="16" /> 添加一次爱爱</button>
    </fieldset>
    <fieldset v-if="!hidden.includes('discharge')" class="field-group"><legend>白带</legend>
      <label>当天情况<select :value="draft.discharge === null ? '' : draft.discharge.present ? 'yes' : 'no'" @change="setDischarge(($event.target as HTMLSelectElement).value)"><option value="">未记录</option><option value="no">无</option><option value="yes">有</option></select></label>
      <template v-if="draft.discharge?.present"><label>量<select v-model="draft.discharge.amount"><option :value="null">未记录</option><option v-for="x in ['LIGHT','MEDIUM','HEAVY']" :key="x" :value="x">{{ labels[x] }}</option></select></label>
        <TagField v-model="draft.discharge.colors" :options="options.dischargeColors" label="白带颜色" /><TagField v-model="draft.discharge.textures" :options="options.dischargeTextures" label="白带质地" />
        <div class="field-pair"><label v-for="[key,title] in [['odor','明显异味'],['itching','瘙痒'],['burning','灼热']] as const" :key="key">{{ title }}<select v-model="draft.discharge[key]"><option :value="null">未记录</option><option :value="true">有</option><option :value="false">没有</option></select></label></div>
      </template>
    </fieldset>
    <label class="field-group">留给自己的话<textarea v-model="draft.note" rows="3" placeholder="今天有什么想记下来的？（可选）" /></label>
  </div>
</template>
