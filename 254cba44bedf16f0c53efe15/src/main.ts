import { createApp } from 'vue';
import App from './App.vue';
import { startRouter } from './router';
import { startStore } from './store';
import './style.css';

if (!document.querySelector('link[data-zhiji-style]') && import.meta.env.PROD) {
  const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = new URL(/* @vite-ignore */ './app.css',import.meta.url).href;
  link.dataset.zhijiStyle = ''; document.head.append(link);
}
document.title = '知己 · 听见身体的声音';
startRouter(); createApp(App).mount('#app'); startStore();
