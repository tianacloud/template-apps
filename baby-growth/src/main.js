import { createApp } from 'vue';
import App from './App.vue';
import css from './style.css?inline';
const style=document.createElement('style');style.textContent=css;document.head.append(style);
createApp(App).mount('#app');
