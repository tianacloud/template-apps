import {Config} from './view-config.js';
import {assets} from './view-assets.js';
import {createRenderCore} from './render-core.js';
import {mountCanvas} from './canvas-ui.js';
import {createPersonal} from './personal.js';
import css from './style.css';
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:css}));
const app=document.querySelector('#app');app.innerHTML='<canvas id="strategy-canvas" aria-label="微·危策略棋局：选择剧本与英雄，点击手牌与目标格"></canvas>';
const core=createRenderCore(Config),personal=createPersonal(core),renderer=mountCanvas(core,Config,personal,assets);personal.bindRenderer(renderer);renderer.boot(document.querySelector('#strategy-canvas'));window.addEventListener('resize',renderer.resize);
