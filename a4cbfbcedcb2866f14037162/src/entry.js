import {configure} from './cloud.js';
export async function mount(root,context){try{await configure(context);window.__todayRoot=root;await import('./app.js')}catch(error){root.textContent=`无法连接数据或文件服务：${error.message}。请检查连接后重新打开。`}}
