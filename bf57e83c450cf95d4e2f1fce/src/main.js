import { createApp } from 'vue';
import App from './App.vue';
import css from './style.css?inline';

const style = document.createElement('style');
style.textContent = css;
document.head.append(style);
document.title = '睡前聊聊 · 今晚，听你说';
createApp(App).mount('#app');
