import body from './body.html';
import css from './style.css';
document.head.insertAdjacentHTML('beforeend', '<style>'+css+'</style>');
document.getElementById('app').innerHTML=body;
await import('./logic.js');
