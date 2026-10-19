<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import Icon from './icons.js';
import Photo from './Photo.vue';
import * as repo from './repository.js';
import { dayKey, minuteKey, due, rangeFor, bucketsFor, shiftAnchor } from './domain.js';

const events = ref([]), tags = ref([]), loading = ref(true), error = ref(''), search = ref(''), category = ref('all'), status = ref('all'), view = ref('home'), selectedId = ref('');
const toast = ref(''), dialog = ref(''), saving = ref(false), formError = ref(''), form = ref({}), tagName = ref(''), tagEdit = ref(''), tagNew = ref(''), modalEl = ref(null), photoInput = ref(null), photoView = ref('');
const mode = ref('month'), anchor = ref(dayKey()), customStart = ref(dayKey().slice(0,7)+'-01'), customEnd = ref(dayKey());
const history = ref({ records: [], counts: [], total: 0, minutes: 0 }), historyLoading = ref(false), historyError = ref(''), historyReady = ref(false);
const today = ref(dayKey()), detailTab = ref('history'), pendingPhotos = ref([]);
const icons = ['sparkles','home','plant','shirt','heart','drop','book','coffee'];
const colors = ['green','orange','blue','purple','pink'];
let historySeq = 0, toastTimer, clockTimer, previousFocus;
const id = () => globalThis.crypto?.randomUUID?.() || 'c'+Date.now().toString(36)+Math.random().toString(36).slice(2);
const active = computed(() => events.value.filter(e => !e.archived));
const selected = computed(() => events.value.find(e => e.id === selectedId.value));
const dueEvents = computed(() => active.value.filter(e => due(e,today.value).days <= 0));
const weekCount = computed(() => active.value.reduce((n,e) => n + Number(e.count),0));
const shownEvents = computed(() => events.value.filter(e => Boolean(e.archived) === (view.value === 'archive')).filter(e => category.value === 'all' || e.tags.includes(category.value)).filter(e => e.name.toLocaleLowerCase().includes(search.value.toLocaleLowerCase())).filter(e => status.value === 'all' || (status.value === 'due' ? due(e,today.value).days <= 0 : due(e,today.value).days > 0)).sort((a,b) => due(a,today.value).days - due(b,today.value).days || a.name.localeCompare(b.name,'zh-CN')));
const range = computed(() => { try { return rangeFor(mode.value,anchor.value,{start:customStart.value,end:customEnd.value}); } catch { return null; } });
const buckets = computed(() => range.value ? bucketsFor(range.value, history.value.counts, mode.value) : []);
const chartMax = computed(() => Math.max(1,...buckets.value.map(b => b.count)));
const rangeTitle = computed(() => mode.value === 'year' ? `${anchor.value.slice(0,4)} 年` : mode.value === 'month' ? `${anchor.value.slice(0,4)} 年 ${Number(anchor.value.slice(5,7))} 月` : range.value ? `${shortDate(range.value.start)} — ${shortDate(range.value.end)}` : '请选择日期范围');
const filteredTags = event => tags.value.filter(t => event.tags.includes(t.id));
const groupedRecords = computed(() => { const result = []; for (const record of history.value.records) { const day = record.occurred_at.slice(0,10); let group = result[result.length-1]; if (!group || group.day !== day) { group = {day,records:[]}; result.push(group); } group.records.push(record); } return result; });
function shortDate(value) { return `${Number(value.slice(5,7))}月${Number(value.slice(8,10))}日`; }
function fullDate(value) { return `${value.slice(0,4)}年${shortDate(value)}`; }
function relative(value) { return !value ? '还没有完成记录' : `${shortDate(value)} ${value.slice(11,16)}完成`; }
function notify(message) { toast.value = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.value = '',3200); }
async function refresh() {
  error.value = '';
  try { const data = await repo.loadHome(); events.value = data.events; tags.value = data.tags; }
  catch(e) { error.value = e.message || '暂时无法读取数据，请重新加载。'; }
  finally { loading.value = false; }
}
function readRoute() {
  const parts = location.hash.slice(1).split('/').filter(Boolean);
  if (parts[0] === 'event' && parts[1]) { selectedId.value = parts[1]; view.value = 'detail'; }
  else { view.value = parts[0] === 'archive' ? 'archive' : 'home'; selectedId.value = ''; }
  search.value = ''; category.value = 'all'; status.value = 'all';
  nextTick(() => window.scrollTo(0,0));
}
function go(page) { location.hash = page === 'home' ? '/' : `/${page}`; }
function openEvent(event) { mode.value = 'month'; anchor.value = dayKey(); detailTab.value = 'history'; location.hash = `/event/${event.id}`; }
async function loadDetail(more = false) {
  const seq = ++historySeq;
  if (view.value !== 'detail' || !selected.value || !range.value) { history.value = { records: [], counts: [], total: 0, minutes: 0 }; return; }
  historyLoading.value = true; historyError.value = ''; historyReady.value = false;
  try { const data = await repo.loadHistory(selectedId.value, range.value, more ? history.value.records.length : 0); if (seq !== historySeq) return; history.value = more ? { ...data, records: [...history.value.records,...data.records] } : data; historyReady.value = true; }
  catch(e) { if (seq === historySeq) historyError.value = e.message; }
  finally { if (seq === historySeq) historyLoading.value = false; }
}
watch([selectedId, range, () => view.value], () => loadDetail());
watch(dialog, async value => {
  if (value) { previousFocus = document.activeElement; await nextTick(); modalEl.value?.showModal(); modalEl.value?.querySelector('input,button')?.focus(); }
  else { modalEl.value?.close(); previousFocus?.focus?.(); }
});
function submitForm(event, action) { if (event.currentTarget.form.reportValidity()) action(); }
function closeModal() { if (!saving.value) { dialog.value = ''; formError.value = ''; clearPhotos(); } }
function showModal(type) { formError.value = ''; dialog.value = type; }
function editEvent(event) {
  form.value = event ? {...event,tags:[...event.tags].filter(t => tags.value.some(tag => tag.id === t))} : { id: id(), name:'', interval_days:7, first_due:dayKey(), tags:[], icon:'sparkles', color:'green', archived:0, created_at:minuteKey() };
  tagNew.value = ''; showModal('event');
}
function clearPhotos() { for (const photo of pendingPhotos.value) URL.revokeObjectURL(photo.preview); pendingPhotos.value = []; }
function editRecord(record, event = selected.value) {
  clearPhotos();
  form.value = record ? {...record,photos:[...record.photos]} : { id:id(), event_id:event.id, occurred_at:minuteKey(), duration:0, note:'', photos:[], created_at:minuteKey() };
  showModal('record');
}
async function persistEvent() {
  saving.value = true; formError.value = '';
  try {
    const event = {...form.value, interval_days:Number(form.value.interval_days)};
    if (!event.name.trim()) throw new Error('给这件事起个名字吧。');
    if (!Number.isInteger(event.interval_days) || event.interval_days < 1 || event.interval_days > 36500) throw new Error('间隔请填写 1 到 36500 之间的整数天数。');
    await repo.saveEvent(event); dialog.value = ''; await refresh(); notify('事件已保存');
  } catch(e) { formError.value = e.message; }
  finally { saving.value = false; }
}
async function addTag() {
  if (!tagNew.value.trim()) return;
  saving.value = true; formError.value = '';
  try { const existing = tags.value.find(t => t.name === tagNew.value.trim()); const tag = existing || {id:id(),name:tagNew.value.trim()}; if (!existing) { await repo.saveTag(tag); tags.value.push(tag); } if (!form.value.tags.includes(tag.id)) form.value.tags.push(tag.id); tagNew.value = ''; }
  catch(e) { formError.value = e.message; }
  finally { saving.value = false; }
}
function toggleTag(tagId) { form.value.tags = form.value.tags.includes(tagId) ? form.value.tags.filter(t => t !== tagId) : [...form.value.tags,tagId]; }
function archiveEvent() { form.value = {...selected.value,tags:[...selected.value.tags]}; showModal('archive'); }
async function persistArchive() {
  saving.value = true; formError.value = '';
  try { await repo.saveEvent({...form.value,archived:form.value.archived ? 0 : 1}); dialog.value = ''; await refresh(); go(form.value.archived ? 'home' : 'archive'); notify(form.value.archived ? '事件已恢复' : '事件已归档'); }
  catch(e) { formError.value = e.message; }
  finally { saving.value = false; }
}
function removePending(index) { URL.revokeObjectURL(pendingPhotos.value[index].preview); pendingPhotos.value.splice(index,1); }
function selectPhotos(event) {
  const files = Array.from(event.target.files || []); event.target.value = '';
  for (const file of files) {
    if (form.value.photos.length + pendingPhotos.value.length >= 6) { formError.value = '每条记录最多添加 6 张照片。'; break; }
    if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) { formError.value = '请选择 JPG、PNG、WebP 或 GIF 照片。'; continue; }
    if (file.size > 10*1024*1024) { formError.value = '单张照片请控制在 10 MB 以内。'; continue; }
    pendingPhotos.value.push({file,preview:URL.createObjectURL(file),path:`records/${form.value.id}/${id()}.${file.type.split('/')[1]}`,uploaded:false});
  }
}
async function persistRecord() {
  saving.value = true; formError.value = '';
  try {
    if (!form.value.occurred_at || form.value.occurred_at > minuteKey()) throw new Error('完成时间不能晚于现在。');
    const duration = Number(form.value.duration);
    if (!Number.isInteger(duration) || duration < 0 || duration > 525600) throw new Error('耗时请填写 0 到 525600 之间的整数分钟。');
    for (const photo of pendingPhotos.value) {
      if (photo.uploaded) continue;
      if (repo.demo) photo.path = await new Promise((resolve,reject) => {const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(photo.file);});
      else {
        const files = window.tiana.files;
        if (photo.uploadId) {
          const receipt = await files.uploadStatus(photo.uploadId);
          if (!receipt.completed) await files.completeUpload(photo.uploadId);
        } else {
          try { await files.put(photo.path,photo.file,{onPrepared:receipt => photo.uploadId = receipt.id}); }
          catch(error) {
            if (error.code !== 'FILE_UPLOAD_UNCERTAIN' || !photo.uploadId) throw error;
            const receipt = await files.uploadStatus(photo.uploadId);
            if (!receipt.completed) await files.completeUpload(photo.uploadId);
          }
        }
      }
      photo.uploaded = true;
    }
    await repo.saveRecord({...form.value,duration,photos:[...form.value.photos,...pendingPhotos.value.map(p => p.path)]});
    dialog.value = ''; clearPhotos(); await refresh(); await loadDetail(); notify('又完成了一次，做得不错');
  } catch(e) { formError.value = e.message || '保存失败，请保留内容并检查连接。'; }
  finally { saving.value = false; }
}
function requestDelete(record) { form.value = {...record}; showModal('delete-record'); }
async function persistDeleteRecord() {
  saving.value = true; formError.value = '';
  try { await repo.deleteRecord(form.value.id); dialog.value=''; await refresh(); await loadDetail(); notify('记录已删除'); }
  catch(e) { formError.value=e.message; } finally { saving.value=false; }
}
function manageTags() { tagEdit.value=''; tagName.value=''; showModal('tags'); }
async function persistTag() {
  saving.value=true; formError.value='';
  try { const name=tagName.value.trim(); if (!name) throw new Error('请输入标签名称。'); const item={id:tagEdit.value && !tagEdit.value.startsWith('delete:') ? tagEdit.value : id(),name}; if (tags.value.some(t=>t.name===name && t.id!==item.id)) throw new Error('已经有这个标签了。'); await repo.saveTag(item); await refresh(); tagEdit.value=''; tagName.value=''; notify('标签已保存'); }
  catch(e) { formError.value=e.message; } finally { saving.value=false; }
}
async function removeTag(tag) {
  if (tagEdit.value !== `delete:${tag.id}`) { tagEdit.value=`delete:${tag.id}`; return; }
  saving.value=true; formError.value='';
  try { await repo.deleteTag(tag.id); await refresh(); if (category.value===tag.id) category.value='all'; tagEdit.value=''; notify('标签已删除，事件仍然保留'); }
  catch(e) { formError.value=e.message; } finally { saving.value=false; }
}
function onKey(event) { if (event.key === 'Escape') photoView.value=''; }
async function resetDemo() { repo.resetDemo(); await refresh(); go('home'); readRoute(); notify('已恢复示例数据'); }
onMounted(async () => { readRoute(); window.addEventListener('hashchange',readRoute); window.addEventListener('keydown',onKey); clockTimer=setInterval(()=>today.value=dayKey(),60000); await refresh(); await loadDetail(); });
onBeforeUnmount(()=>{window.removeEventListener('hashchange',readRoute);window.removeEventListener('keydown',onKey);clearTimeout(toastTimer);clearInterval(clockTimer);clearPhotos();});
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <a class="brand" href="#/" aria-label="周期首页"><span class="brandmark"><Icon name="cycle" :size="26"/></span><span>周期<small>一点一滴，井井有条</small></span></a>
      <div class="sidebar-caption">我的生活</div>
      <nav aria-label="主导航">
        <button :class="{active:view!=='archive'}" @click="go('home')"><Icon name="grid"/>全部事件<span class="nav-count">{{active.length}}</span></button>
        <button :class="{active:view==='archive'}" @click="go('archive')"><Icon name="archive"/>已归档</button>
        <button @click="manageTags"><Icon name="tag"/>管理标签</button>
      </nav>
      <div class="side-note"><Icon name="plant" :size="30"/><p>生活里的小事，<br>慢慢做好就很棒。</p><span>留一点时间，照顾日常。</span></div>
      <div class="side-bottom"><span class="avatar"><Icon name="leaf" :size="18"/></span><div>我的日常<small>按自己的节奏来</small></div><span class="connection-dot" title="云端存储"></span></div>
    </aside>
    <main class="main">
      <div v-if="repo.demo" class="demo-banner">示例体验，数据仅保留在本页<button @click="resetDemo">恢复示例</button></div>
      <div v-if="error" class="error-banner" role="alert">{{error}}<button @click="refresh">重新加载</button></div>
      <template v-if="view!=='detail'">
        <a class="mobile-brand" href="#/"><Icon name="cycle" :size="22"/><span>周期</span><span class="mobile-brand-note">{{shortDate(today)}} · {{['周日','周一','周二','周三','周四','周五','周六'][new Date(today+'T00:00:00').getDay()]}}</span></a>
        <header class="page-header"><div><p class="eyebrow">{{view==='archive'?'SAVED FOR LATER':'A LITTLE CARE, EVERY DAY'}}</p><h1>{{view==='archive'?'暂时收起来的日常':'把日常，照顾好。'}}<span v-if="view!=='archive'" class="heading-leaf"><Icon name="plant" :size="27"/></span></h1><p class="subtitle">{{view==='archive'?'不再提醒，做过的每一次依然留在这里。':'不用记住每件小事，按自己的节奏，一件件完成。'}}</p></div><span class="today-date"><Icon name="calendar" :size="17"/>{{fullDate(today)}}<span class="weekday">{{['周日','周一','周二','周三','周四','周五','周六'][new Date(today+'T00:00:00').getDay()]}}</span></span></header>
        <section v-if="view==='home'" class="overview" aria-label="日常概览">
          <div class="overview-main"><span class="overview-icon"><Icon name="sun" :size="27"/></span><div><p>今天，照顾一下这些事</p><div class="overview-line"><strong>{{dueEvents.length}}</strong><span>件事等你完成</span><span v-if="dueEvents.length===0" class="all-good">今天可以慢一点</span></div></div><div class="overview-illustration" aria-hidden="true"><span class="plant-pot"></span><i></i><i></i><i></i><i></i><span class="illus-spark">✧</span></div></div>
          <div class="overview-small"><span><Icon name="cycle" :size="19"/>持续照顾</span><p><strong>{{active.length}}</strong> 件日常</p></div>
          <div class="overview-small"><span><Icon name="check" :size="19"/>小小积累</span><p><strong>{{weekCount}}</strong> 次完成</p></div>
        </section>
        <section class="events-section">
          <div class="section-top"><div class="section-heading"><h2>{{view==='archive'?'已归档':'我的日常'}}</h2><span>{{view==='archive'?events.filter(e=>e.archived).length:active.length}} 件</span></div><div class="section-actions"><button class="icon-button mobile-tag" aria-label="管理标签" @click="manageTags"><Icon name="tag"/></button><button class="primary desktop-add" :disabled="loading" @click="editEvent()"><Icon name="plus" :size="18"/>新建事件</button></div></div>
          <div class="filter-line"><div class="tag-filters" aria-label="按标签筛选"><button :class="{selected:category==='all'}" @click="category='all'">全部</button><button v-for="tag in tags" :key="tag.id" :class="{selected:category===tag.id}" @click="category=tag.id">{{tag.name}}</button><button class="filter-manage" aria-label="管理标签" @click="manageTags"><Icon name="plus" :size="16"/></button></div><label class="search"><Icon name="search" :size="18"/><input v-model="search" placeholder="搜索事件名称" aria-label="搜索事件名称"><button v-if="search" @click="search=''" aria-label="清空搜索"><Icon name="close" :size="16"/></button></label></div>
          <div class="list-toolbar"><div class="status-filters"><button :class="{chosen:status==='all'}" @click="status='all'">全部状态</button><button :class="{chosen:status==='due'}" @click="status='due'">待完成</button><button :class="{chosen:status==='upcoming'}" @click="status='upcoming'">未到期</button></div><span><Icon name="clock" :size="14"/>按下次提醒排序</span></div>
          <div v-if="loading" class="empty-state" role="status"><Icon name="cycle" :size="32"/><h3>正在整理你的日常…</h3></div>
          <div v-else-if="shownEvents.length" class="event-grid">
            <article v-for="event in shownEvents" :key="event.id" class="event-card" :class="[event.color,{'is-due':due(event,today).days<=0 && !event.archived}]">
              <button class="card-body" @click="openEvent(event)"><div class="card-top"><span class="event-icon"><Icon :name="event.icon" :size="25"/></span><span class="due-pill" :class="event.archived?'archived':due(event,today).state">{{event.archived?'已归档':due(event,today).label}}</span></div><h3>{{event.name}}</h3><div class="event-meta"><Icon name="cycle" :size="14"/>每 {{event.interval_days}} 天<span class="meta-dot">·</span><span>{{event.count}} 次完成</span></div><div class="card-tags"><span v-for="tag in filteredTags(event)" :key="tag.id">{{tag.name}}</span><span v-if="!filteredTags(event).length" class="untagged">未分类</span></div><div class="progress-track"><span :style="{width:Math.max(4,Math.min(100,(1-Math.max(0,due(event,today).days)/event.interval_days)*100))+'%'}"></span></div></button>
              <div class="card-footer"><span>{{relative(event.last_at)}}</span><button v-if="!event.archived" class="quick-record" :aria-label="'记录完成：'+event.name" @click="editRecord(null,event)"><Icon name="check" :size="16"/>记一次</button><button v-else class="text-button" @click="openEvent(event)">查看历史<Icon name="arrow" :size="15"/></button></div>
            </article>
          </div>
          <div v-else class="empty-state"><span class="empty-icon"><Icon :name="view==='archive'?'archive':search?'search':'plant'" :size="34"/></span><h3>{{search?'没有找到这件事':view==='archive'?'这里暂时空着':'从一件小事开始'}}</h3><p>{{search?'试试其他名称，或换一个分类。':view==='archive'?'归档的事件会保留所有完成记录。':'浇花、换床单、清理冰箱，都可以交给周期记着。'}}</p><button v-if="!search && view==='home'" class="primary" @click="editEvent()"><Icon name="plus" :size="17"/>添加第一件日常</button></div>
        </section>
        <footer class="page-footer"><Icon name="leaf" :size="15"/>不赶时间，让日常慢慢变好。</footer>
        <button class="fab mobile-fab" aria-label="新建事件" :disabled="loading" @click="editEvent()"><Icon name="plus" :size="25"/></button>
      </template>
      <template v-else-if="selected">
        <header class="detail-header"><button class="back-button" @click="go(selected.archived?'archive':'home')"><Icon name="back" :size="18"/><span>我的日常</span></button><div class="detail-actions"><button class="secondary" @click="editEvent(selected)"><Icon name="edit" :size="16"/>编辑事件</button><button class="icon-button" :aria-label="selected.archived?'恢复事件':'归档事件'" @click="archiveEvent"><Icon :name="selected.archived?'refresh':'archive'"/></button></div></header>
        <section class="detail-summary" :class="selected.color"><span class="event-icon large"><Icon :name="selected.icon" :size="31"/></span><div><div class="detail-title"><h1>{{selected.name}}</h1><span class="due-pill" :class="selected.archived?'archived':due(selected,today).state">{{selected.archived?'已归档':due(selected,today).label}}</span></div><p class="detail-sub"><Icon name="cycle" :size="15"/>每 {{selected.interval_days}} 天<span>·</span><span v-for="tag in filteredTags(selected)" :key="tag.id" class="inline-tag">{{tag.name}}</span><span v-if="!selected.archived">下次 {{shortDate(due(selected,today).date)}}</span></p></div><div class="lifetime-stat"><strong>{{selected.count}}</strong><span>累计完成</span></div></section>
        <section class="history-panel">
          <div class="history-top"><div class="detail-tabs"><button :class="{active:detailTab==='history'}" @click="detailTab='history'">完成记录</button><button :class="{active:detailTab==='stats'}" @click="detailTab='stats'">次数统计</button></div><span class="history-hint">每一次，都算数</span></div>
          <div class="period-tools"><div class="segmented" aria-label="统计时间范围"><button v-for="(label,key) in {day:'天',week:'周',month:'月',year:'年',custom:'自定义'}" :key="key" :class="{active:mode===key}" @click="mode=key">{{label}}</button></div><div v-if="mode!=='custom'" class="period-switch"><button class="icon-button" aria-label="上一时段" @click="anchor=shiftAnchor(mode,anchor,-1)"><Icon name="back" :size="16"/></button><strong>{{rangeTitle}}</strong><button class="icon-button" aria-label="下一时段" @click="anchor=shiftAnchor(mode,anchor,1)"><Icon name="arrow" :size="16"/></button><button class="text-button this-period" @click="anchor=dayKey()">本期</button></div></div>
          <div v-if="mode==='custom'" class="custom-range"><label>开始日期<input type="date" v-model="customStart" aria-label="开始日期" required></label><span>至</span><label>结束日期<input type="date" v-model="customEnd" :min="customStart" aria-label="结束日期" required></label></div>
          <p v-if="!range" class="inline-error">结束日期不能早于开始日期。</p>
          <p class="period-caption">{{mode==='day'?'最近七天，每天完成了几次':mode==='week'?'周一到周日，每天完成了几次':mode==='month'?'这个月，每天完成了几次':mode==='year'?'这一年，每月完成了几次':'所选日期内，每天完成了几次'}}</p>
          <div v-if="historyError" class="error-banner" role="alert">{{historyError}}<button @click="loadDetail()">重新加载</button></div>
          <div v-if="historyLoading" class="history-loading" role="status">正在读取记录…</div>
          <template v-else-if="range && historyReady">
            <div class="range-stats"><div><strong>{{history.total}}</strong><span>次完成</span></div><div><strong>{{history.minutes}}</strong><span>分钟投入</span></div><span class="stat-description">{{rangeTitle}}</span></div>
            <div v-if="detailTab==='stats'" class="chart-panel"><div class="chart-label"><span>完成次数</span><span>最高 {{chartMax}} 次</span></div><div class="chart-scroll"><div class="chart" :style="{'--bars':buckets.length}"><div v-for="(bucket,i) in buckets" :key="bucket.key" class="chart-column" :title="bucket.key+'：'+bucket.count+' 次'" tabindex="0"><span class="bar-value">{{bucket.count||''}}</span><div class="bar-area"><span :class="{zero:!bucket.count}" :style="{height:Math.max(2,bucket.count/chartMax*140)+'px'}"></span></div><small>{{buckets.length<=12 || i%Math.ceil(buckets.length/12)===0 ? bucket.label : ''}}</small></div></div></div><p v-if="!history.total" class="chart-empty">这段时间还没有记录，完成一次就会出现在这里。</p></div>
            <template v-else>
              <div v-if="!history.records.length" class="empty-state history-empty"><span class="empty-icon"><Icon name="book" :size="30"/></span><h3>这段时间，还没留下记录</h3><p>换个时间范围看看，或记下刚刚完成的那一次。</p></div>
              <div v-else class="timeline"><section v-for="group in groupedRecords" :key="group.day" class="day-group"><h3><span>{{group.day===today?'今天':shortDate(group.day)}}</span><small>{{group.day.slice(0,4)}} · {{group.records.length}} 次</small></h3><article v-for="record in group.records" :key="record.id" class="record"><span class="record-dot"><Icon name="check" :size="13"/></span><div class="record-content"><div class="record-heading"><strong>{{record.occurred_at.slice(11,16)}}</strong><span v-if="record.duration" class="record-duration"><Icon name="clock" :size="14"/>{{record.duration}} 分钟</span><span v-else class="record-completed">完成了一次</span><div class="record-actions"><button class="icon-button" aria-label="编辑记录" @click="editRecord(record)"><Icon name="edit" :size="15"/></button><button class="icon-button" aria-label="删除记录" @click="requestDelete(record)"><Icon name="trash" :size="15"/></button></div></div><p v-if="record.note" class="record-note">{{record.note}}</p><div v-if="record.photos.length" class="record-photos"><button v-for="photo in record.photos" :key="photo" @click="photoView=photo" aria-label="查看照片"><Photo :path="photo"/></button></div></div></article></section></div>
              <button v-if="history.records.length<history.total" class="load-more secondary" :disabled="historyLoading" @click="loadDetail(true)">加载更多记录</button>
            </template>
          </template>
        </section>
        <button v-if="!selected.archived" class="fab record-fab" @click="editRecord()"><Icon name="plus" :size="23"/><span>记一次完成</span></button>
      </template>
      <div v-else-if="!loading" class="empty-state"><Icon name="search" :size="32"/><h3>没有找到这个事件</h3><button class="primary" @click="go('home')">返回首页</button></div>
    </main>
    <nav v-if="view!=='detail'" class="mobile-nav" aria-label="手机导航"><button :class="{active:view==='home'}" @click="go('home')"><Icon name="grid" :size="21"/>日常</button><button @click="manageTags"><Icon name="tag" :size="21"/>标签</button><button :class="{active:view==='archive'}" @click="go('archive')"><Icon name="archive" :size="21"/>归档</button></nav>
  </div>
  <dialog ref="modalEl" class="modal" @cancel.prevent="closeModal" @click="e=>{if(e.target===modalEl)closeModal()}">
    <div v-if="dialog" class="modal-content"><div class="modal-handle"></div><header class="modal-header"><div><span class="eyebrow">{{dialog==='record'?'ONE MORE LITTLE WIN':'A LITTLE MORE ORGANIZED'}}</span><h2>{{dialog==='event'?(events.some(e=>e.id===form.id)?'编辑日常':'添加一件日常'):dialog==='record'?(history.records.some(r=>r.id===form.id)?'编辑完成记录':'记下一次完成'):dialog==='tags'?'管理标签':dialog==='archive'?(form.archived?'恢复这件日常？':'暂时归档这件日常？'):'删除这条记录？'}}</h2></div><button class="icon-button" aria-label="关闭弹窗" :disabled="saving" @click="closeModal"><Icon name="close"/></button></header>
      <form v-if="dialog==='event'" @submit.prevent="persistEvent" class="event-form">
        <fieldset :disabled="saving"><label class="field">事件名称<input v-model="form.name" maxlength="80" placeholder="比如，给绿植浇水" required autofocus></label><div class="form-row"><label class="field">间隔天数<div class="input-suffix"><input v-model="form.interval_days" type="number" min="1" max="36500" step="1" required><span>天</span></div></label><label class="field">首次提醒日期<input v-model="form.first_due" type="date" required :disabled="Boolean(form.last_at)"></label></div><p class="field-hint">{{form.last_at?'下次提醒按最近一次完成日期和间隔天数计算。':'第一次按所选日期提醒，之后从最近一次完成开始计算。'}}</p><label class="field-label">选个图标</label><div class="icon-options" :class="form.color"><button v-for="icon in icons" type="button" :key="icon" :aria-label="'选择图标 '+icon" :aria-pressed="form.icon===icon" :class="{chosen:form.icon===icon}" @click="form.icon=icon"><Icon :name="icon" :size="23"/></button></div><label class="field-label">喜欢的颜色</label><div class="color-options"><button v-for="color in colors" :key="color" :class="color" type="button" :aria-label="'选择颜色 '+color" :aria-pressed="form.color===color" @click="form.color=color"><Icon v-if="form.color===color" name="check" :size="18"/></button></div><label class="field-label">标签<span class="optional">可多选</span></label><div class="tag-options"><button v-for="tag in tags" type="button" :key="tag.id" :class="{selected:form.tags.includes(tag.id)}" @click="toggleTag(tag.id)">{{tag.name}}<Icon v-if="form.tags.includes(tag.id)" name="check" :size="13"/></button><span v-if="!tags.length" class="muted">还没有标签，添加一个吧。</span></div><div class="inline-create"><input v-model="tagNew" maxlength="24" placeholder="新标签名称" aria-label="新标签名称" @keydown.enter.prevent="addTag"><button type="button" class="secondary" :disabled="!tagNew.trim()" @click="addTag"><Icon name="plus" :size="16"/>添加标签</button></div></fieldset><p v-if="formError" class="inline-error" role="alert">{{formError}}</p><div class="modal-footer"><button type="button" class="secondary" :disabled="saving" @click="closeModal">取消</button><button type="button" class="primary" :disabled="saving" @click="e=>submitForm(e,persistEvent)">{{saving?'正在保存…':'保存事件'}}<Icon name="check" :size="17"/></button></div>
      </form>
      <form v-else-if="dialog==='record'" @submit.prevent="persistRecord" class="record-form"><p class="record-event-name"><Icon :name="events.find(e=>e.id===form.event_id)?.icon" :size="18"/>{{events.find(e=>e.id===form.event_id)?.name}}</p><fieldset :disabled="saving"><label class="field">完成时间<input v-model="form.occurred_at" type="datetime-local" :max="minuteKey()" step="60" required></label><label class="field">花了多久<span class="optional">选填</span><div class="input-suffix"><input v-model="form.duration" type="number" min="0" max="525600" step="1"><span>分钟</span></div></label><label class="field">留点备注<span class="optional">选填</span><textarea v-model="form.note" rows="3" maxlength="5000" placeholder="做了哪些事？有什么想记下的？"></textarea></label><label class="field-label">照片<span class="optional">选填，最多 6 张</span></label><div class="upload-photos"><div v-for="(photo,index) in form.photos" :key="photo" class="upload-thumb"><Photo :path="photo"/><button type="button" aria-label="移除此照片" @click="form.photos.splice(index,1)"><Icon name="close" :size="13"/></button></div><div v-for="(photo,index) in pendingPhotos" :key="photo.preview" class="upload-thumb"><img :src="photo.preview" alt="待上传照片"><button type="button" aria-label="移除此照片" @click="removePending(index)"><Icon name="close" :size="13"/></button></div><button v-if="form.photos.length+pendingPhotos.length<6" type="button" class="upload-button" @click="photoInput.click()"><Icon name="camera" :size="24"/><span>添加照片</span></button><input ref="photoInput" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" hidden @change="selectPhotos"></div></fieldset><p v-if="formError" class="inline-error" role="alert">{{formError}}</p><div class="modal-footer"><button type="button" class="secondary" :disabled="saving" @click="closeModal">取消</button><button type="button" class="primary" :disabled="saving" @click="e=>submitForm(e,persistRecord)">{{saving?'正在保存…':'保存记录'}}<Icon name="check" :size="17"/></button></div></form>
      <template v-else-if="dialog==='tags'"><p class="modal-description">给日常分个类，找起来更方便。</p><div class="tag-manager"><div v-for="tag in tags" :key="tag.id"><span><Icon name="tag" :size="16"/>{{tag.name}}</span><div><button class="icon-button" :disabled="saving" aria-label="重命名标签" @click="tagEdit=tag.id;tagName=tag.name"><Icon name="edit" :size="16"/></button><button class="text-button danger-text" :disabled="saving" @click="removeTag(tag)">{{tagEdit==='delete:'+tag.id?'确认删除':'删除'}}</button></div></div><p v-if="!tags.length" class="muted">还没有标签，添加第一个吧。</p></div><form @submit.prevent="persistTag"><div class="inline-create"><input v-model="tagName" aria-label="标签名称" maxlength="24" :placeholder="tagEdit && !tagEdit.startsWith('delete:')?'修改标签名称':'新标签名称'" required><button type="button" class="primary" :disabled="saving" @click="e=>submitForm(e,persistTag)">{{tagEdit && !tagEdit.startsWith('delete:')?'保存':'添加'}}</button></div><button v-if="tagEdit && !tagEdit.startsWith('delete:')" type="button" class="text-button" @click="tagEdit='';tagName=''">取消修改</button></form><p v-if="formError" class="inline-error" role="alert">{{formError}}</p></template>
      <template v-else><p class="modal-description">{{dialog==='archive'?(form.archived?'恢复后，事件会重新显示在全部事件里，并按原来的间隔提醒。':'归档后，不再出现在全部事件中。历史记录和照片都会保留，随时可以恢复。'):'删除后无法恢复，统计和下次提醒日期会随之更新。'}}</p><p v-if="formError" class="inline-error" role="alert">{{formError}}</p><div class="modal-footer"><button class="secondary" :disabled="saving" @click="closeModal">取消</button><button :class="dialog==='delete-record'?'danger':'primary'" :disabled="saving" @click="dialog==='archive'?persistArchive():persistDeleteRecord()">{{saving?'正在保存…':dialog==='archive'?(form.archived?'恢复事件':'确认归档'):'确认删除'}}</button></div></template>
    </div>
  </dialog>
  <dialog :open="Boolean(photoView)" class="lightbox" @click="photoView=''"><button class="lightbox-close icon-button" aria-label="关闭照片" @click="photoView=''"><Icon name="close" :size="24"/></button><Photo v-if="photoView" :path="photoView"/></dialog>
  <Transition name="toast"><div v-if="toast" class="toast" role="status"><Icon name="check" :size="17"/>{{toast}}</div></Transition>
</template>
