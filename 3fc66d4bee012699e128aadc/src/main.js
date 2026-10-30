import {Config} from './view-config.js';
import {assets, loadAssets} from './view-assets.js';
import {createRenderCore} from './render-core.js';
import {mountCanvas} from './canvas-ui.js';
import {createPersonal} from './personal.js';
import css from './style.css';
export async function mount(app, {files}) {
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:css}));
app.innerHTML='<canvas id="strategy-canvas" aria-label="微·危策略棋局：选择剧本与英雄，点击手牌与目标格"></canvas>';
try { await loadAssets(files); } catch (error) { app.textContent='素材加载失败，请刷新重试。'; throw error; }
const core=createRenderCore(Config),personal=createPersonal(core),renderer=mountCanvas(core,Config,personal,assets);personal.bindRenderer(renderer);renderer.boot(document.querySelector('#strategy-canvas'));window.addEventListener('resize',renderer.resize);

}
