import {createTianaFetch} from '@tianacloud/serverless';
import css from './style.css';
import shell from './shell.html';
const style=document.createElement('style');style.textContent=css;document.head.append(style);
document.querySelector('#app').innerHTML=shell;
