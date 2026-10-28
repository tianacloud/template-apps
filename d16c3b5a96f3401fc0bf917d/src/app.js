import './data.js';
import {startGame} from './game.js';
import {createScoreStore} from './scores.js';
import {sql} from './db.js';
const css = document.createElement('link');
css.rel = 'stylesheet'; css.href = new URL('./style.css', import.meta.url).href;
document.head.appendChild(css);
const root = document.getElementById('app');
async function boot() {
  root.innerHTML = '<div class="wrap" role="status" style="padding-top:40px">正在读取云端成绩…</div>';
  try {
    const scores = createScoreStore(sql, window.tiana?.appId);
    const initial = await scores.load();
    startGame(initial, scores.save);
  } catch (error) {
    root.innerHTML = '<div class="wrap" style="padding-top:40px"><p role="alert">暂时无法读取云端成绩，请检查登录及数据库连接。</p><button class="btn btn-primary" id="reloadScores">重新加载</button></div>';
    root.querySelector('#reloadScores').onclick = boot;
  }
}
boot();
