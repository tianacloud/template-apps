import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validPhoto, savePhoto, photoBlob} from '../src/photos.js';
const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
test('photo writes use relative paths, verify bytes and reconcile a lost response',async()=>{
 const data=new Map();let writes=0;
 const files={put:async(path,blob)=>{writes++;data.set(path,blob);throw new Error('lost response');},get:async path=>data.has(path)?new Response(data.get(path)):new Response('',{status:404})};
 const blob=new Blob(['photo'],{type:'image/jpeg'});const path=await savePhoto(blob,files);
 assert.match(path,/^photos\/[\w-]+\.jpg$/);assert.equal(writes,1);assert.equal(await (await photoBlob({path},files)).text(),'photo');assert.equal(validPhoto({path}),true);assert.equal(validPhoto({path:'../other'}),false);
});
test('unknown prior upload blocks another write',async()=>{
 values.set('opengym-photo-upload:unknown',JSON.stringify({path:'photos/a.jpg',size:1,sha256:'bad'}));let writes=0;
 await assert.rejects(savePhoto(new Blob(['x']),{put:async()=>{writes++},get:async()=>new Response('',{status:404})}));assert.equal(writes,0);values.clear();
});

test('legacy photo decoding does not depend on a data URL fetch',async()=>{
 const original=globalThis.fetch;globalThis.fetch=()=>{throw new Error('CSP blocks fetch')};
 try { const blob=await photoBlob({image:'data:image/jpeg;base64,YWJj'});assert.equal(blob.type,'image/jpeg');assert.equal(await blob.text(),'abc'); } finally {globalThis.fetch=original;}
});
