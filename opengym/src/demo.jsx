import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.jsx';
import {GymStore} from './storage.js';
import {starter,startSession,addDays,today,clone} from './domain.js';
import catalogue from './demo-catalogue.js';
import styles from './styles.css';
import baseStyles from './opengym.css';
import adaptationStyles from './adaptation.css';
const style=document.createElement('style');style.textContent=styles+'\n'+baseStyles+'\n'+adaptationStyles;document.head.append(style);
const index=new Map(catalogue.map(e=>[e.id,e]));const routines=starter('ppl',index);const now=today();const records=[];
routines.forEach((r,i)=>{r.id='example-routine-'+i;records.push({kind:'routine',id:r.id,payload:r});});
for(let i=0;i<18;i++){const r=routines[i%3];const w=startSession(r,[],index);w.id='example-workout-'+i;w.date=addDays(now,-(38-i*2));w.duration=2400+(i%4)*360;w.finishedAt=Date.now()-(38-i*2)*86400000;w.entries.forEach((e,j)=>{e.sets.forEach(s=>{s.done=true;s.weight=[50,35,15,8,20][j%5]+Math.floor(i/6)*2.5;s.rir=2;});});records.push({kind:'workout',id:w.id,payload:w});}
for(let i=0;i<12;i++){const id='example-weight-'+i;records.push({kind:'weight',id,payload:{id,date:addDays(now,-33+i*3),weight:79.5-i*.16+(i%3)*.08,note:'晨起记录'}});}
records.push({kind:'setting',id:'name',payload:{value:'Alex'}},{kind:'setting',id:'goal',payload:{value:76}},{kind:'override',id:now,payload:{date:now,routineId:routines[0].id}});
const store=new GymStore(null,records);
createRoot(document.getElementById('app')).render(<App store={store} catalogue={catalogue}/>);
