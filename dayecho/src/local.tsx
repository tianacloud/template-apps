import React from 'react';
import { createRoot } from 'react-dom/client';
import { App, applyStyles } from './main';
import { Conflict, type Repository, type Snapshot } from './storage';
import { emptyWorkspace, type Workspace } from './model';
import { demoData } from './demo-data';
import { validate } from './actions';

class LocalRepository implements Repository{
  readonly pending=false;
  private key='dayecho:local-preview:v1';
  private initial=new URLSearchParams(location.search).has('demo')?demoData():emptyWorkspace();
  async load():Promise<Snapshot>{
    const text=localStorage.getItem(this.key);
    const value=text?JSON.parse(text):{revision:0,data:this.initial};validate(value.data);return structuredClone(value);
  }
  async save(previous:Snapshot,next:Workspace){
    const old=await this.load();if(old.revision!==previous.revision)throw new Conflict();validate(next);
    const value={revision:previous.revision+1,data:next};localStorage.setItem(this.key,JSON.stringify(value));return structuredClone(value);
  }
  async verifyPending(){return this.load();}
}
applyStyles();createRoot(document.getElementById('app')!).render(<App repository={new LocalRepository()}/>);
