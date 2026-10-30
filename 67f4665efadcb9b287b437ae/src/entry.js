import {createTianaFetch} from '@tianacloud/serverless';
import body from './body.html?raw';
import css from './main.css?raw';
window.createPoemFetch = createTianaFetch;
document.getElementById('app').innerHTML = body;
const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
await import('./data-rhyme.js'); await import('./data-lexicon.js'); await import('./core.js'); await import('./app.js');
