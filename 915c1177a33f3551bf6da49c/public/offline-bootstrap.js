window.__ironOffline=true;
const root=document.getElementById('app');
try { const {mount}=await import('./app.js');await mount(root,{files:{async bindImage(img,path){img.src=new URL('./offline-media/'+path.split('/').pop(),location.href).href;}}}); }
catch(error){root.textContent='离线应用无法启动，请联网后从原应用重新打开。';console.error(error);}
