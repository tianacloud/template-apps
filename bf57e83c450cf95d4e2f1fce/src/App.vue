<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import Icon from './Icon.vue';
import { topics, responders, localDay, nextAudience, drawQuestion } from './domain.js';
import { getQuestions, getStats, saveAnswer, saveQuestion, deleteQuestion, getHistory } from './db.js';

const readRoute = () => ['library', 'history'].includes(location.hash.slice(2)) ? location.hash.slice(2) : 'home';
const route = ref(readRoute());
const syncRoute = () => { route.value = readRoute(); };
const questions = ref([]), stats = ref({ total: 0, nights: 0 });
const loading = ref(true), error = ref(''), toast = ref(''), busy = ref(false);
const audience = ref('parent'), parent = ref('mom'), stage = ref('ready');
const active = ref(null), answer = ref(''), savedAnswer = ref(null), answerId = ref(null);
const tonight = ref([]), goodnight = ref(false), seen = new Set();
let sessionId = crypto.randomUUID(), toastTimer;
const audienceLabel = computed(() => audience.value === 'child' ? '孩子' : '家长');
const deckCount = computed(() => questions.value.filter(q => q.audience === audience.value).length);
const dateLabel = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
const libraryAudience = ref('child'), librarySearch = ref('');
const library = computed(() => questions.value.filter(q => q.audience === libraryAudience.value && q.content.includes(librarySearch.value.trim())));
const editor = ref(null), editorError = ref(''), isNew = ref(false), deleting = ref(null), dialog = ref(null);
const history = ref([]), historyTotal = ref(0), historyLoading = ref(false), historyError = ref('');
const search = ref(''), historySearch = ref(''), historyResponder = ref(''), historyPage = ref(1);
let historyRequest = 0;
const historyDays = computed(() => {
  const groups = [];
  for (const record of history.value) {
    let group = groups.at(-1);
    if (!group || group.day !== record.local_day) groups.push(group = { day: record.local_day, records: [] });
    group.records.push(record);
  }
  return groups;
});
function notify(text) {
  clearTimeout(toastTimer); toast.value = text;
  toastTimer = setTimeout(() => { toast.value = ''; }, 4000);
}
async function initialize() {
  loading.value = true; error.value = '';
  try { [questions.value, stats.value] = await Promise.all([getQuestions(), getStats()]); }
  catch (e) { error.value = e.message; }
  finally { loading.value = false; }
}
function draw() {
  error.value = '';
  const question = drawQuestion(questions.value, audience.value, seen);
  if (!question) { notify(`${audienceLabel.value}问题库还没有卡片，先去添加一题吧。`); return; }
  if (goodnight.value) { sessionId = crypto.randomUUID(); tonight.value = []; seen.clear(); seen.add(question.id); goodnight.value = false; }
  active.value = question; answer.value = ''; answerId.value = crypto.randomUUID();
  savedAnswer.value = null; stage.value = 'answer';
}
function changeAudience(value) {
  if (stage.value !== 'ready') return;
  audience.value = value;
}
async function recordAnswer() {
  if (busy.value || !answer.value.trim()) return;
  busy.value = true; error.value = '';
  const record = savedAnswer.value ?? {
    id: answerId.value, session_id: sessionId, question_id: active.value.id,
    question_text: active.value.content, topic: active.value.topic, audience: active.value.audience,
    responder: active.value.audience === 'child' ? 'child' : parent.value,
    content: answer.value.trim(), local_day: localDay(), created_at: new Date().toISOString(),
  };
  savedAnswer.value = record;
  try {
    await saveAnswer(record);
    tonight.value.push(record); stage.value = 'saved';
    audience.value = nextAudience(record.audience);
    try { stats.value = await getStats(); } catch { /* The answer has been saved. */ }
  } catch (e) { error.value = e.message; }
  finally { busy.value = false; }
}
function endTonight() {
  stage.value = 'ready'; active.value = null; answer.value = ''; audience.value = 'parent';
  goodnight.value = true; error.value = '';
}
function skip() { stage.value = 'ready'; active.value = null; answer.value = ''; savedAnswer.value = null; error.value = ''; }
function openEditor(question) {
  isNew.value = !question;
  editor.value = question ? { ...question } : { id: crypto.randomUUID(), audience: libraryAudience.value, topic: 'feelings', content: '' };
  editorError.value = ''; dialog.value?.showModal();
}
function closeEditor() { if (!busy.value) { dialog.value?.close(); editor.value = null; } }
async function submitQuestion() {
  if (busy.value || !editor.value.content.trim()) return;
  busy.value = true; editorError.value = '';
  const now = new Date().toISOString();
  const question = { ...editor.value, content: editor.value.content.trim(), created_at: editor.value.created_at ?? now, updated_at: now };
  try {
    await saveQuestion(question, isNew.value);
    const index = questions.value.findIndex(q => q.id === question.id);
    if (index === -1) questions.value.push(question); else questions.value[index] = question;
    libraryAudience.value = question.audience;
    dialog.value.close(); editor.value = null; notify(isNew.value ? '新问题已加入卡片库' : '问题已保存');
  } catch (e) { editorError.value = e.message; }
  finally { busy.value = false; }
}
async function removeQuestion() {
  if (busy.value || !deleting.value) return;
  busy.value = true; error.value = '';
  const id = deleting.value.id;
  try { await deleteQuestion(id); questions.value = questions.value.filter(q => q.id !== id); deleting.value = null; notify('问题已删除，过去的回答仍会保留'); }
  catch (e) { error.value = e.message; }
  finally { busy.value = false; }
}
async function loadHistory() {
  const request = ++historyRequest;
  historyLoading.value = true; historyError.value = '';
  try {
    const result = await getHistory({ search: historySearch.value, responder: historyResponder.value, page: historyPage.value });
    if (request !== historyRequest) return;
    history.value = result.rows; historyTotal.value = result.total;
  } catch (e) { if (request === historyRequest) historyError.value = e.message; }
  finally { if (request === historyRequest) historyLoading.value = false; }
}
function searchHistory() { historySearch.value = search.value.trim(); historyPage.value = 1; loadHistory(); }
function filterHistory() { historyPage.value = 1; loadHistory(); }
function turnHistoryPage(step) { historyPage.value += step; loadHistory(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function displayDay(day) { return new Date(`${day}T12:00:00`).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }); }
function displayTime(iso) { return new Date(iso).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }); }
function preventLeave(event) {
  if (stage.value === 'answer' && answer.value.trim()) { event.preventDefault(); event.returnValue = ''; }
}
watch(route, value => { error.value = ''; if (value === 'history') loadHistory(); });
onMounted(async () => {
  window.addEventListener('hashchange', syncRoute); window.addEventListener('beforeunload', preventLeave);
  await initialize(); if (route.value === 'history') loadHistory();
});
onUnmounted(() => { window.removeEventListener('hashchange', syncRoute); window.removeEventListener('beforeunload', preventLeave); clearTimeout(toastTimer); });
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <a class="brand" href="#/home" aria-label="睡前聊聊主页"><span class="brand-icon"><Icon name="moon" /></span><span>睡前聊聊<small>GOOD NIGHT, GOOD TALK</small></span></a>
      <nav aria-label="主导航">
        <a href="#/home" :class="{ current: route === 'home' }" :aria-current="route === 'home' ? 'page' : undefined"><Icon name="cards" />抽张卡聊聊</a>
        <a href="#/library" :class="{ current: route === 'library' }" :aria-current="route === 'library' ? 'page' : undefined"><Icon name="book" />问题库</a>
        <a href="#/history" :class="{ current: route === 'history' }" :aria-current="route === 'history' ? 'page' : undefined"><Icon name="heart" />聊过的时光</a>
      </nav>
      <span class="header-note"><span class="status-dot"></span>今晚也，靠近一点</span>
    </header>

    <main>
      <div v-if="error" class="error-banner" role="alert">{{ error }}<button v-if="!questions.length" @click="initialize">重新连接</button><button v-else aria-label="关闭提示" @click="error = ''"><Icon name="close" /></button></div>
      <div v-if="loading" class="loading-screen"><span class="brand-icon"><Icon name="moon" /></span><p>正在准备今晚的问题卡…</p></div>
      <template v-else>
        <section v-if="route === 'home'" class="home-page">
          <div class="intro"><span class="eyebrow"><Icon name="moon" />留十分钟，听听彼此</span><h1>今晚，<em>听你说。</em></h1><p>今天的开心、委屈，还有那些没来得及说的话。<br class="mobile-break">抽一张卡，我们慢慢聊。</p><div class="intro-date"><Icon name="calendar" />{{ dateLabel }}</div></div>
          <div v-if="goodnight" class="goodnight" role="status"><Icon name="moon" /><span>今晚的话，我们都记下了。晚安，做个好梦。</span></div>
          <div class="home-grid">
            <section class="draw-panel" aria-label="抽卡与回答">
              <div class="panel-top"><div><span class="tiny-label">OUR LITTLE BEDTIME RITUAL</span><h2>{{ stage === 'ready' ? '今晚，谁先说？' : stage === 'answer' ? `这张卡，请${active.audience === 'child' ? '孩子' : '家长'}回答` : '谢谢你，愿意说给我听' }}</h2></div><span class="round-icon"><Icon :name="stage === 'saved' ? 'check' : 'sparkle'" /></span></div>

              <template v-if="stage === 'ready'">
                <div class="role-picker" aria-label="选择先回答的人">
                  <button :class="{ selected: audience === 'parent' }" @click="changeAudience('parent')" :aria-pressed="audience === 'parent'"><span class="role-avatar parent-avatar"><Icon name="moon" /></span><span>家长先说<small>也聊聊你的今天</small></span><span class="radio-dot"></span></button>
                  <button :class="{ selected: audience === 'child' }" @click="changeAudience('child')" :aria-pressed="audience === 'child'"><span class="role-avatar child-avatar"><Icon name="leaf" /></span><span>孩子先说<small>今天过得怎么样</small></span><span class="radio-dot"></span></button>
                </div>
                <div class="card-stack"><div class="question-card card-back"><span class="card-star star-one">✧</span><span class="card-star star-two">✦</span><span class="card-moon"><Icon name="moon" /></span><span class="card-overline">一张卡，一段真心话</span><h3>把今天的心事，<br>慢慢说给彼此听。</h3><span class="card-bottom"><span></span><Icon name="sparkle" /><span></span></span></div></div>
                <button class="primary draw-button" @click="draw" :disabled="!deckCount || !!error"><Icon name="cards" />为{{ audienceLabel }}抽一张卡<Icon name="arrow" /></button>
                <p v-if="!deckCount" class="empty-deck">{{ audienceLabel }}问题库还是空的。<a href="#/library" @click="libraryAudience = audience">去添加问题</a></p>
                <p v-else class="under-button">{{ deckCount }} 张问题卡 · 聊完后，换另一位来回答</p>
              </template>

              <template v-else-if="stage === 'answer'">
                <div class="question-card revealed"><div class="card-meta"><span class="topic"><Icon name="sparkle" />{{ topics[active.topic] }}</span><span>{{ active.audience === 'child' ? '孩子卡' : '家长卡' }} · 第 {{ tonight.length + 1 }} 题</span></div><h3>{{ active.content }}</h3><p>没有标准答案，说到哪儿都可以。</p></div>
                <form class="answer-form" @submit.prevent="recordAnswer">
                  <div class="answer-label"><label for="answer">记下这段真心话</label><div v-if="active.audience === 'parent'" class="speaker-picker" aria-label="回答人"><button type="button" :aria-pressed="parent === 'mom'" :class="{ active: parent === 'mom' }" @click="parent = 'mom'" :disabled="busy || !!savedAnswer">妈妈</button><button type="button" :aria-pressed="parent === 'dad'" :class="{ active: parent === 'dad' }" @click="parent = 'dad'" :disabled="busy || !!savedAnswer">爸爸</button></div><span v-else class="answer-speaker"><Icon name="leaf" />孩子回答</span></div>
                  <textarea id="answer" v-model="answer" maxlength="5000" rows="5" placeholder="可以记下原话，也可以一起写几个关键词…" :disabled="busy || !!savedAnswer" required></textarea>
                  <div class="answer-hint"><span><Icon name="lock" />保存后，这段回答会一直保留</span><span>{{ answer.length }} / 5000</span></div>
                  <button class="primary" type="submit" :disabled="busy || !answer.trim()"><Icon name="check" />{{ busy ? '正在保存…' : savedAnswer ? '确认并保存这段回答' : '保存这段回答' }}</button>
                  <button v-if="!savedAnswer" class="text-button skip-button" type="button" @click="skip" :disabled="busy">这题先不聊，换张卡</button>
                </form>
              </template>

              <div v-else class="saved-panel" role="status">
                <span class="saved-icon"><Icon name="check" /></span><h3>这段话，记下了。</h3><p>每一次认真听见，都是多一点了解。</p>
                <div class="saved-preview"><span>{{ responders[savedAnswer.responder] }}说</span><p>{{ savedAnswer.content }}</p></div>
                <button class="primary" @click="draw" :disabled="!deckCount"><Icon name="cards" />再抽一题，轮到{{ audienceLabel }}<Icon name="arrow" /></button>
                <p v-if="!deckCount" class="empty-deck">{{ audienceLabel }}问题库还是空的，<a href="#/library" @click="libraryAudience = audience">添加问题</a>后再继续。</p>
                <button class="secondary" @click="endTonight"><Icon name="moon" />今天就到这儿，晚安</button>
              </div>
            </section>

            <aside class="home-aside">
              <section class="tonight-panel"><div class="aside-title"><Icon name="message" /><h2>今晚的聊天</h2><span class="small-pill">{{ tonight.length }} 题</span></div><p class="aside-description">你一题，我一题，慢慢了解彼此。</p><div class="conversation-steps"><template v-if="tonight.length"><div v-for="record in tonight.slice(-3)" :key="record.id" class="conversation-step done"><span class="step-mark"><Icon name="check" /></span><div><strong>{{ responders[record.responder] }}的真心话</strong><small>{{ topics[record.topic] }} · 已记下</small></div></div></template><div class="conversation-step next"><span class="step-mark"><Icon :name="audience === 'parent' ? 'moon' : 'leaf'" /></span><div><strong>{{ goodnight ? '今晚，晚安啦' : `接下来，${audienceLabel}说` }}</strong><small>{{ goodnight ? '想聊的时候，随时再来' : stage === 'answer' ? '认真听，慢慢说' : '抽一张卡，开启聊天' }}</small></div></div><div v-if="!tonight.length" class="conversation-step future"><span class="step-mark"><Icon :name="audience === 'parent' ? 'leaf' : 'moon'" /></span><div><strong>然后，换{{ audience === 'parent' ? '孩子' : '家长' }}</strong><small>每个人都有被听见的机会</small></div></div></div></section>
              <section class="gentle-panel"><span class="aside-overline"><Icon name="heart" />一个小约定</span><h2>今晚，先好好听。</h2><ul><li><span>01</span><div>先听完，再回应<small>不用急着讲道理或给建议。</small></div></li><li><span>02</span><div>不想说，可以跳过<small>想聊多少，都由你决定。</small></div></li><li><span>03</span><div>大人也说真心话<small>开心和烦恼，我们都有。</small></div></li></ul><span class="gentle-decoration" aria-hidden="true">✧</span></section>
              <a class="memories-link" href="#/history"><span class="round-icon"><Icon name="heart" /></span><span>我们已经聊过 <strong>{{ stats.nights }}</strong> 个夜晚<small>留下了 {{ stats.total }} 段真心话</small></span><Icon name="arrow" /></a>
            </aside>
          </div>
        </section>

        <section v-else-if="route === 'library'" class="library-page">
          <div class="page-heading"><div><span class="eyebrow"><Icon name="book" />让问题，更懂我们</span><h1>我们的<em>问题库。</em></h1><p>收集想聊的话题，也可以写下只属于你们的问题。</p></div><button class="primary compact" @click="openEditor()"><Icon name="plus" />添加问题</button></div>
          <div class="library-toolbar"><div class="tabs" aria-label="问题库分类"><button :class="{ active: libraryAudience === 'child' }" :aria-pressed="libraryAudience === 'child'" @click="libraryAudience = 'child'"><Icon name="leaf" />孩子的卡<span>{{ questions.filter(q => q.audience === 'child').length }}</span></button><button :class="{ active: libraryAudience === 'parent' }" :aria-pressed="libraryAudience === 'parent'" @click="libraryAudience = 'parent'"><Icon name="moon" />家长的卡<span>{{ questions.filter(q => q.audience === 'parent').length }}</span></button></div><label class="search-field"><Icon name="search" /><input v-model="librarySearch" type="search" placeholder="找一找想聊的问题" aria-label="搜索问题"></label></div>
          <p class="library-note"><Icon name="sparkle" />{{ libraryAudience === 'child' ? '关于学校、朋友、心情，还有值得骄傲的小事。' : '说说自己的今天，也分享曾经和孩子一样的年纪。' }}<span>{{ library.length }} 张卡片</span></p>
          <div v-if="library.length" class="question-grid"><article v-for="question in library" :key="question.id" class="library-card"><span class="topic"><Icon :name="question.topic === 'proud' ? 'sparkle' : question.topic === 'family' ? 'heart' : 'message'" />{{ topics[question.topic] }}</span><h2>{{ question.content }}</h2><div class="library-card-bottom"><span>{{ question.audience === 'child' ? '孩子卡' : '家长卡' }}</span><div><button class="icon-button" :aria-label="`编辑问题：${question.content}`" @click="openEditor(question)"><Icon name="pen" /></button><button class="icon-button" :aria-label="`删除问题：${question.content}`" @click="deleting = question"><Icon name="trash" /></button></div></div></article></div>
          <div v-else class="empty-state"><Icon name="book" /><h2>{{ librarySearch ? '没有找到这个问题' : '这里还没有问题卡' }}</h2><p>{{ librarySearch ? '换个词找找，或者添加一个新问题。' : '写下想聊的话，今晚就可以抽到它。' }}</p><button class="secondary" @click="openEditor()"><Icon name="plus" />添加问题</button></div>
          <p class="page-footnote"><Icon name="lock" />修改或删除问题，不会改变已经保存的回答。</p>
        </section>

        <section v-else class="history-page">
          <div class="page-heading"><div><span class="eyebrow"><Icon name="heart" />每一句，都有好好听</span><h1>聊过的<em>时光。</em></h1><p>有些心事，说出来就轻了一点。有些瞬间，我们想记久一点。</p></div><div class="history-stats"><strong>{{ stats.total }}</strong><span>段真心话<small>{{ stats.nights }} 个一起聊天的夜晚</small></span></div></div>
          <div class="history-toolbar"><form class="search-field history-search" @submit.prevent="searchHistory"><Icon name="search" /><input v-model="search" type="search" placeholder="搜索问题或回答里的关键词" aria-label="搜索历史回答"><button class="search-submit" type="submit">搜索</button></form><label class="history-filter">回答人<select v-model="historyResponder" @change="filterHistory"><option value="">所有人</option><option value="child">孩子</option><option value="mom">妈妈</option><option value="dad">爸爸</option></select></label></div>
          <div v-if="historyError" class="error-banner" role="alert">{{ historyError }}<button @click="loadHistory">重新加载</button></div>
          <p v-if="historyLoading" class="loading-history" role="status">正在翻开聊过的时光…</p>
          <template v-else-if="history.length"><section v-for="group in historyDays" :key="group.day" class="history-day"><div class="day-heading"><span class="day-dot"></span><h2>{{ displayDay(group.day) }}</h2><span>{{ group.records.length }} 段回答</span></div><article v-for="record in group.records" :key="record.id" class="history-card"><div class="record-person"><span class="role-avatar" :class="record.responder === 'child' ? 'child-avatar' : 'parent-avatar'"><Icon :name="record.responder === 'child' ? 'leaf' : 'moon'" /></span><strong>{{ responders[record.responder] }}</strong><span class="topic">{{ topics[record.topic] }}</span><time :datetime="record.created_at">{{ displayTime(record.created_at) }}</time></div><h3>{{ record.question_text }}</h3><p class="record-answer">{{ record.content }}</p><div class="record-footer"><Icon name="lock" />已保存的真心话</div></article></section><div v-if="historyTotal > 30" class="pagination"><button class="secondary" :disabled="historyPage === 1" @click="turnHistoryPage(-1)">上一页</button><span>{{ historyPage }} / {{ Math.ceil(historyTotal / 30) }}</span><button class="secondary" :disabled="historyPage * 30 >= historyTotal" @click="turnHistoryPage(1)">下一页</button></div></template>
          <div v-else-if="!historyError" class="empty-state"><Icon name="heart" /><h2>{{ historySearch || historyResponder ? '还没有找到这样的回答' : '第一段真心话，等你们来写' }}</h2><p>{{ historySearch || historyResponder ? '换个关键词或回答人，再找找看。' : '从一张问题卡开始，把今晚的话记下来。' }}</p><a v-if="!historySearch && !historyResponder" href="#/home" class="primary compact"><Icon name="cards" />抽张卡聊聊</a></div>
          <p class="page-footnote"><Icon name="lock" />回答保存后不能修改或删除，留下当时真实的心情。</p>
        </section>
      </template>
    </main>
    <footer class="site-footer"><span><Icon name="moon" />睡前聊聊</span><p>一天的最后一点时间，留给最在乎的人。</p><span class="footer-stars">✧ &nbsp; ✦ &nbsp; ✧</span></footer>
    <div v-if="toast" class="toast" role="status"><Icon name="check" />{{ toast }}</div>

    <dialog ref="dialog" class="editor-dialog" @cancel="busy ? $event.preventDefault() : closeEditor()">
      <form v-if="editor" @submit.prevent="submitQuestion"><div class="dialog-heading"><h2>{{ isNew ? '添加一张问题卡' : '编辑问题卡' }}</h2><button type="button" class="icon-button" aria-label="关闭编辑" @click="closeEditor" :disabled="busy"><Icon name="close" /></button></div><p>一个愿意回答的问题，就是聊天的好开始。</p><label>给谁回答<select v-model="editor.audience" :disabled="busy"><option value="child">孩子</option><option value="parent">家长</option></select></label><label>聊什么<select v-model="editor.topic" :disabled="busy"><option v-for="(label, key) in topics" :value="key" :key="key">{{ label }}</option></select></label><label>问题<textarea v-model="editor.content" rows="4" maxlength="300" placeholder="比如：今天有没有一件事，让你觉得自己挺棒的？" :disabled="busy" required></textarea></label><span class="field-count">{{ editor.content.length }} / 300</span><div v-if="editorError" class="error-banner" role="alert">{{ editorError }}</div><div class="dialog-actions"><button type="button" class="secondary" @click="closeEditor" :disabled="busy">取消</button><button class="primary" :disabled="busy || !editor.content.trim()">{{ busy ? '正在保存…' : '保存问题' }}</button></div></form>
    </dialog>
    <div v-if="deleting" class="modal-overlay" @click.self="!busy && (deleting = null)"><section class="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title"><span class="round-icon"><Icon name="trash" /></span><h2 id="delete-title">删除这张问题卡？</h2><p class="delete-question">{{ deleting.content }}</p><p>这张卡以后不会再抽到，过去的回答仍会保留。</p><div class="dialog-actions"><button class="secondary" @click="deleting = null" :disabled="busy">留着这张</button><button class="danger" @click="removeQuestion" :disabled="busy">{{ busy ? '正在删除…' : '删除问题' }}</button></div></section></div>
  </div>
</template>
