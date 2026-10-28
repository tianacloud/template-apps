import { createTianaFetch } from '@tianacloud/serverless';
import view from './view.html?raw';
import './public/design-tokens.css'; import './public/app.css'; import './public/modal.css';
window.createTianaFetch = createTianaFetch; document.body.innerHTML = view;
for (const path of ['cloud.js','app.js','edit.js']) await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=path;s.onload=resolve;s.onerror=reject;document.body.append(s)});
