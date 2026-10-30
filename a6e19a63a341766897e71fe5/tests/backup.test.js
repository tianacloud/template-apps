import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeBackup, decodeBackup } from '../src/backup.js';
const rows=[{kind:'order',id:'synthetic',payload:{name:'测试',fee:100}}];
test('无密码及密码备份均可往返，错误密码被拒绝',async()=>{
 assert.deepEqual(await decodeBackup(await encodeBackup(rows)),rows);
 const encrypted=await encodeBackup(rows,'测试密码');
 assert.deepEqual(await decodeBackup(encrypted,'测试密码'),rows);
 await assert.rejects(()=>decodeBackup(encrypted,'错误密码'));
});
test('拒绝无效类型和重复记录',async()=>{
 await assert.rejects(()=>decodeBackup(JSON.stringify({records:[{kind:'other',id:'1',payload:{}}]})));
 await assert.rejects(()=>decodeBackup(JSON.stringify({records:[rows[0],rows[0]]})));
});
