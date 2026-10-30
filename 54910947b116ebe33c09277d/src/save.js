export function uniqueId(){return globalThis.crypto?.randomUUID?.()||Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('')}
export class StableWrite{
 constructor({id=uniqueId(),read,insert,args}){this.id=id;this.read=read;this.insert=insert;this.args=Object.freeze([...args(id)]);this.saved=false;this.pending=null}
 async run(sql){if(this.saved)return {status:'already-saved',id:this.id};if(this.pending)return this.pending;this.pending=this.perform(sql);try{return await this.pending}finally{this.pending=null}}
 async perform(sql){const before=await sql(this.read,[this.id]);if(before.length){this.saved=true;return {status:'confirmed-by-read',id:this.id}}try{await sql(this.insert,this.args);this.saved=true;return {status:'saved',id:this.id}}catch(error){try{const rows=await sql(this.read,[this.id]);if(rows.length){this.saved=true;return {status:'confirmed-after-response-loss',id:this.id}}}catch{}throw Error('保存尚未确认。再次保存会先核对同一记录，请勿另建副本。')}}
}
