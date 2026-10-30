import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.jsx';
import catalogue from './catalogue.js';
import {GymStore,connectDatabase} from './storage.js';
import {importPhoto} from './photos.js';
import {ExerciseMedia} from './exercise-media.js';
import styles from './styles.css';
import baseStyles from './opengym.css';
import adaptationStyles from './adaptation.css';
export function mount(element, context) {
  const style=document.createElement('style');style.textContent=styles+'\n'+baseStyles+'\n'+adaptationStyles;document.head.append(style);
  const store=new GymStore();store.ready=false;store.demo=false;
  const files=context.files;
  const media=new ExerciseMedia(files);
  store.boot=async()=>{store.error='';store.emit();try{store.execute=await connectDatabase();await store.load();for(const photo of store.list('photo')) if(photo.image){const migrated=await importPhoto(photo,files);store.set('photo',photo.id,migrated);if(!await store.flush())throw new Error(store.error);}}catch(e){store.error=e.message||'暂时无法连接数据库，请检查登录和网络';store.emit();}};
  const root=createRoot(element);root.render(<App store={store} catalogue={catalogue} media={media} files={files}/>);store.boot();
  return ()=>{root.unmount();media.dispose();style.remove();};
}
