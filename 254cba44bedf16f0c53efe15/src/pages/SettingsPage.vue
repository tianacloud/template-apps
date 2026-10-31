<script setup lang="ts">
import { computed, ref } from 'vue';
import { APP_VERSION, ALGORITHM_VERSION, groups, type Backup } from '../types';
import { cards } from '../content/cards';
import { readBackup, readBackupSnapshot } from '../repository';
import { csvFiles, download, parseBackup, type ParsedImport } from '../transfer';
import { savePlan, state, updateSettings } from '../store';
import { displayDate } from '../domain/dates';
import Icon from '../components/Icon.vue';
import ImportPreview from '../components/ImportPreview.vue';
const error = ref(''), parsed = ref<ParsedImport | null>(null), existing = ref<Backup | null>(null), importRevision = ref(0), deleting = ref(false), deleteText = ref(''), busy = ref(false);
const hasData = computed(() => state.facts.periods.length || state.facts.bleeding.length);
async function exportJson() { busy.value = true; try { download(`zhiji-${state.today}.json`,JSON.stringify(await readBackup(),null,2)); } catch (e) { error.value = (e as Error).message; } finally { busy.value = false; } }
async function exportCsv() { busy.value = true; try { for (const file of csvFiles(await readBackup())) download(file.name,file.content,'text/csv;charset=utf-8'); } catch (e) { error.value = (e as Error).message; } finally { busy.value = false; } }
async function importFile(event: Event) {
  const input = event.target as HTMLInputElement, file = input.files?.[0]; if (!file) return;
  busy.value = true; error.value = '';
  try { parsed.value = parseBackup(await file.text(),state.today); const snapshot = await readBackupSnapshot(); existing.value = snapshot.backup; importRevision.value = snapshot.revision; }
  catch (e) { error.value = (e as Error).message; parsed.value = null; }
  finally { busy.value = false; input.value = ''; }
}
async function preference(key: string, show: boolean) {
  try { const hidden = state.settings.hiddenGroups ?? []; await updateSettings({ hiddenGroups: show ? hidden.filter(x => x !== key) : [...hidden,key] }); }
  catch (e) { error.value = (e as Error).message; }
}
async function removeAll() {
  if (deleteText.value !== '删除') return;
  if (await savePlan({ before: state.facts,after: { periods: [],bleeding: [],absences: [] },days: [],clear: true },state.revision)) { deleting.value = false; deleteText.value = ''; parsed.value = null; }
}
async function removeAbsence(id: string) {
  if (!window.confirm('确认删除这条尚未来经事实？')) return;
  const after = JSON.parse(JSON.stringify(state.facts)); after.absences = after.absences.filter((a: any) => a.id !== id);
  await savePlan({ before: state.facts,after,days: [] },state.revision);
}
</script>
<template><div class="page settings-page"><header class="page-heading"><div><p class="eyebrow">记录属于你，按自己的方式使用</p><h1>我的</h1><p class="page-subtitle">管理记录、偏好和陪伴资料。</p></div><Icon name="settings" :size="28" /></header>
  <section class="card"><div class="section-heading"><h2><Icon name="cloud" :size="21" /> 我的数据</h2><p class="muted">同一 Tiana 身份在手机和桌面读取同一份云端记录。JSON 可完整恢复，CSV 便于查看。</p></div><div class="data-actions"><button class="secondary-button" :disabled="busy" @click="exportJson"><Icon name="download" /> 导出 JSON 备份</button><button class="secondary-button" :disabled="busy" @click="exportCsv"><Icon name="download" /> 导出 CSV 记录</button><label class="secondary-button upload-button"><Icon name="plus" /> 导入 JSON<input type="file" accept="application/json,.json" :disabled="busy" @change="importFile" /></label></div>
    <p class="hint">CSV 包含经期、每日状态、便便和爱爱四个文件。个人备份不含登录凭据或数据库连接信息。</p><p v-if="busy" class="hint">正在处理文件…</p><p v-if="error" class="form-error" role="alert">{{ error }}</p><ImportPreview v-if="parsed && existing" :parsed="parsed" :existing="existing" :revision="importRevision" @done="parsed = null" @cancel="parsed = null" />
  </section>
  <section class="card"><h2>记录项目偏好</h2><p class="muted">选择表单里显示的项目，隐藏不会删除已有记录。</p><div class="preferences-grid"><label v-for="[key,title] in groups" :key="key" class="preference"><span>{{ title }}</span><input type="checkbox" :checked="!state.settings.hiddenGroups?.includes(key)" @change="preference(key,($event.target as HTMLInputElement).checked)" /></label></div></section>
  <section v-if="state.facts.absences.length" class="card"><h2>尚未来经的确认记录</h2><div v-for="a in state.facts.absences" :key="a.id" class="record-row"><span>确认截至 {{ displayDate(a.throughDate,true) }} 结束仍未开始</span><button class="text-button danger" @click="removeAbsence(a.id)">删除确认</button></div></section>
  <section class="card"><h2><Icon name="book" :size="20" /> 陪伴知识</h2><div class="knowledge-directory"><a v-for="card in cards" :key="card.id" :href="'#/knowledge/' + card.id"><span>{{ card.title }}</span><Icon name="chevron" :size="16" /></a></div></section>
  <section class="card health-boundary"><h2>使用范围与健康说明</h2><p>知己适用于个人自然月经周期记录。怀孕、产后恢复、激素类药物影响及其他改变周期机制的情况，日历模型不适用。</p><p>日期和阶段来自统计估计，不能确认排卵、判断安全日、提供避孕保证或诊断。出血量是主观等级，白带、便型和症状只是观察事实。明显或持续不适，请寻求专业医疗帮助。</p><p>概率参数是工程基线，尚未经临床校准。平均预测误差只反映已核实日期预测的偏差。</p><p>云端读写依赖网络和登录会话。当前页面尚未保存的输入不等于已经备份。</p></section>
  <section class="card danger-zone"><div class="row-between"><div><h2>删除个人数据</h2><p class="muted">清除原始记录、确认、预测快照及偏好。静态知识保留。</p></div><button class="text-button danger" @click="deleting = !deleting"><Icon name="trash" :size="17" /> 删除数据</button></div><div v-if="deleting" class="confirm-box"><p>建议先导出备份。清除后应用恢复空库状态，数据库实例和源码不会删除。</p><label>输入「删除」确认<input v-model="deleteText" placeholder="删除" /></label><button class="danger-button" :disabled="deleteText !== '删除' || state.saveStatus === 'saving' || !!state.uncertain" @click="removeAll">确认清除个人数据</button></div></section>
  <p class="quiet-footer">知己 {{ APP_VERSION }} · 算法 {{ ALGORITHM_VERSION }} · 数据格式 1</p>
</div></template>
