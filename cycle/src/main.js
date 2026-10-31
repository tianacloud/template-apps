import { createApp } from 'vue';
import App from './App.vue';
import { demo } from './repository.js';
import './style.css';
if (!demo && import.meta.env.PROD && !document.querySelector('link[data-cycle-style]')) {
  const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = new URL(/* @vite-ignore */ './app.css', import.meta.url).href; style.dataset.cycleStyle = ''; document.head.append(style);
}
document.title = '周期 · 让生活有条不紊';
createApp(App).mount('#app');
