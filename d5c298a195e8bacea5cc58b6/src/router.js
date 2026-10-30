import { createRouter, createWebHashHistory, createMemoryHistory } from 'vue-router';
import MainLayout from './views/MainLayout.vue';
import Diary from './views/Diary.vue';
import TaskConfig from './views/TaskConfig.vue';
import Exchange from './views/Exchange.vue';

export function makeRouter(memory = false) {
  return createRouter({
    history: memory ? createMemoryHistory() : createWebHashHistory(),
    routes: [
      { path: '/', redirect: '/diary' },
      { path: '/', component: MainLayout, children: [
        { path: 'diary', name: 'diary', component: Diary },
        { path: 'task', name: 'task', component: TaskConfig },
        { path: 'exchange', name: 'exchange', component: Exchange },
      ] },
    ],
  });
}
