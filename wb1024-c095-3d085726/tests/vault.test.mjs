import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { createAtomicStore } from '../src/atomic-store.js';
let row = null, lost = false, unavailable = false;
async function sql(stmt, args = []) {
  if (stmt.startsWith('SELECT')) { if (unavailable) throw Error('offline'); return {rows: row ? [{...row}] : []}; }
  if (stmt.startsWith('INSERT')) { if (row) return {affectedRows:0}; row={revision:1,write_id:args[0],payload:args[1]}; }
  else { if (!row || row.revision !== args[2]) return {affectedRows:0}; row={revision:row.revision+1,write_id:args[0],payload:args[1]}; }
  if (lost) { lost=false; throw Error('response lost'); }
  return {affectedRows:1};
}
const context=vm.createContext({crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,console,structuredClone});
for (const file of ['bip39-wordlist.js','crypto.js','bip39.js','vault-store.js']) {
 const src=await readFile(new URL('../src/core/'+file,import.meta.url),'utf8');
 assert((await readFile(new URL('../src/legacy.js',import.meta.url),'utf8')).includes(src));
 vm.runInContext(src,context);
}
test('加密、密码错误、助记词恢复、持久化和篡改检测',async()=>{
 row=null;
 const store=context.VaultStore.createVaultStore(createAtomicStore(sql));
 const marker='synthetic secret 3b58';
 await store.initialize('synthetic master password', {cards:[{title:marker}],todos:[],settings:{}});
 assert(!row.payload.includes(marker));
 const words=await context.Bip39.generateMnemonic();
 await store.setRecovery(words);
 store.lock();
 await assert.rejects(store.unlock('wrong password'));
 await store.unlock('synthetic master password');
 assert.equal(store.getPlaintext().cards[0].title,marker);
 store.lock(); await store.unlockWithMnemonic(words);
 assert.equal(store.getPlaintext().cards[0].title,marker);
 const item=JSON.parse(row.payload); item.vault.ciphertext=(item.vault.ciphertext.startsWith('00')?'01':'00')+item.vault.ciphertext.slice(2); row.payload=JSON.stringify(item);
 const other=context.VaultStore.createVaultStore(createAtomicStore(sql));
 await assert.rejects(other.unlock('synthetic master password'));
});
test('并发冲突拒绝覆盖；丢失回执先回读；未知状态锁住写入',async()=>{
 row=null; const a=createAtomicStore(sql),b=createAtomicStore(sql);
 await a.get('meta'); await b.get('meta');
 await a.putMany({meta:{m:1},vault:{v:1}});
 await assert.rejects(b.putMany({meta:{m:2},vault:{v:2}}),/更改/);
 assert.deepEqual(JSON.parse(row.payload),{meta:{m:1},vault:{v:1}});
 lost=true; await a.putMany({meta:{m:3},vault:{v:3}});
 assert.deepEqual(JSON.parse(row.payload),{meta:{m:3},vault:{v:3}});
 lost=true; unavailable=true;
 await assert.rejects(a.putMany({meta:{m:4},vault:{v:4}}),/无法确认/);
 unavailable=false;
 await assert.rejects(a.putMany({meta:{m:5},vault:{v:5}}),/未确认/);
 assert.deepEqual(JSON.parse(row.payload),{meta:{m:4},vault:{v:4}});
 const c=createAtomicStore(sql); assert.equal((await c.get('meta')).m,4);
});
