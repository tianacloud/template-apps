import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App, applyStyles } from './main';
import { type Repository, type Snapshot, Conflict } from './storage';
import { type Workspace, uid } from './model';
import { demoData } from './demo-data';
import { validate } from './actions';

class DemoRepository implements Repository {
  private snapshot:Snapshot={revision:0,data:demoData()};
  readonly pending=false;
  async load(){return structuredClone(this.snapshot);}
  async save(previous:Snapshot,data:Workspace){
    if(previous.revision!==this.snapshot.revision)throw new Conflict();
    validate(data);
    this.snapshot={revision:previous.revision+1,data:structuredClone(data)};
    return this.load();
  }
  async verifyPending(){return this.load();}
}
function Demo() {
  const [instance,setInstance]=useState(()=>({key:uid(),repository:new DemoRepository()}));
  return <App key={instance.key} repository={instance.repository} demo onReset={()=>{location.hash='today';setInstance({key:uid(),repository:new DemoRepository()});}}/>;
}
applyStyles();
createRoot(document.getElementById('app')!).render(<Demo/>);
