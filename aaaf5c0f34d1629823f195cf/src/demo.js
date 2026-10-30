export class MemoryRepository{
 constructor(seed){this.seed=structuredClone(seed);this.data=structuredClone(seed);}
 async list(){return structuredClone(this.data);}
 async get(id){return structuredClone(this.data.find(d=>d.id===id)||null);}
 async save(doc){const n=structuredClone(doc),i=this.data.findIndex(d=>d.id===n.id);n.revision=(n.revision||0)+1;n.updatedAt=new Date().toISOString();if(i<0)this.data.unshift(n);else this.data[i]=n;return structuredClone(n);}
 async remove(doc){this.data=this.data.filter(d=>d.id!==doc.id);}
 reset(){this.data=structuredClone(this.seed);}
}
