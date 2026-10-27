import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
const schema=readFileSync(new URL('../schema.sql',import.meta.url),'utf8');
function database(){const db=new DatabaseSync(':memory:');db.exec(schema);return db;}
test('修改招生官名称同步归属并增加版本，删除时清空归属',()=>{
 const db=database();const insert=db.prepare('INSERT INTO gym_records(kind,id,payload) VALUES(?,?,?)');
 insert.run('coach','c',JSON.stringify({name:'教练甲'}));insert.run('order','o',JSON.stringify({owner:'教练甲'}));
 db.prepare('UPDATE gym_records SET payload=? WHERE kind=? AND id=?').run(JSON.stringify({name:'教练乙'}),'coach','c');
 let row=db.prepare('SELECT payload,revision FROM gym_records WHERE id=?').get('o');assert.equal(JSON.parse(row.payload).owner,'教练乙');assert.equal(row.revision,2);
 db.prepare('DELETE FROM gym_records WHERE kind=? AND id=?').run('coach','c');row=db.prepare('SELECT payload,revision FROM gym_records WHERE id=?').get('o');assert.equal(JSON.parse(row.payload).owner,'');assert.equal(row.revision,3);db.close();
});
test('恢复失败不会删除现有业务数据',()=>{
 const db=database();const insert=db.prepare('INSERT INTO gym_records(kind,id,payload) VALUES(?,?,?)');insert.run('order','old',JSON.stringify({name:'旧记录'}));
 const duplicate={records:[{kind:'order',id:'new',payload:{name:'甲'}},{kind:'order',id:'new',payload:{name:'乙'}}]};
 assert.throws(()=>insert.run('restore','request',JSON.stringify(duplicate)));
 assert.equal(db.prepare('SELECT id FROM gym_records WHERE kind=?').get('order').id,'old');db.close();
});
test('创建订单和关联新客户在同一写入中完成',()=>{
 const db=database();const insert=db.prepare('INSERT INTO gym_records(kind,id,payload) VALUES(?,?,?)');
 insert.run('order','first',JSON.stringify({name:'合成会员',phone:'13900001234',course:'私教课',time:'2026-01-02',autoCustomer:true}));
 insert.run('order','second',JSON.stringify({name:'合成会员',phone:'13900001234',course:'私教课',time:'2026-01-02',autoCustomer:true}));
 assert.equal(db.prepare("SELECT count(*) AS n FROM gym_records WHERE kind='customer'").get().n,1);db.close();
});
test('导入在一条语句内去除已有电话并创建课程',()=>{
 const db=database(),insert=db.prepare('INSERT INTO gym_records(kind,id,payload) VALUES(?,?,?)');
 insert.run('order','old',JSON.stringify({phone:'13900001111'}));
 const batch={courses:[{id:'course1',payload:{name:'合成课',rate:20,price:100}}],orders:[{id:'one',payload:{name:'甲',phone:'13900001111'}},{id:'two',payload:{name:'乙',phone:'13900002222'}}]};
 insert.run('import','request',JSON.stringify(batch));
 assert.deepEqual(db.prepare("SELECT id FROM gym_records WHERE kind='order' ORDER BY id").all().map(x=>x.id),['old','two']);
 assert.equal(db.prepare("SELECT count(*) AS n FROM gym_records WHERE kind='course'").get().n,1);db.close();
});
test('批量结算遇到版本冲突时整个操作回滚',()=>{
 const db=database(),insert=db.prepare('INSERT INTO gym_records(kind,id,payload) VALUES(?,?,?)');
 insert.run('order','a',JSON.stringify({settled:false}));insert.run('order','b',JSON.stringify({settled:false}));
 const request={action:'settle',settledAt:'2026-01-01',items:[{id:'a',revision:1},{id:'b',revision:2}]};
 assert.throws(()=>insert.run('batch','x',JSON.stringify(request)));
 assert.equal(JSON.parse(db.prepare("SELECT payload FROM gym_records WHERE id='a'").get().payload).settled,false);
 request.items[1].revision=1;insert.run('batch','y',JSON.stringify(request));
 assert.equal(JSON.parse(db.prepare("SELECT payload FROM gym_records WHERE id='a'").get().payload).settled,true);db.close();
});
test('设置与课程费率的批量保存保持原子性',()=>{
 const db=database(),insert=db.prepare('INSERT INTO gym_records(kind,id,payload) VALUES(?,?,?)');insert.run('settings','s','{"mode":"custom"}');insert.run('course','c','{"name":"合成课","rate":15}');
 const request={items:[{kind:'settings',id:'s',revision:1,payload:{mode:'fixed'}},{kind:'course',id:'c',revision:9,payload:{name:'合成课',rate:20}}]};assert.throws(()=>insert.run('update-many','req',JSON.stringify(request)));assert.equal(JSON.parse(db.prepare("SELECT payload FROM gym_records WHERE id='s'").get().payload).mode,'custom');request.items[1].revision=1;insert.run('update-many','req2',JSON.stringify(request));assert.equal(JSON.parse(db.prepare("SELECT payload FROM gym_records WHERE id='c'").get().payload).rate,20);db.close();
});
test('恢复订单时不会重复生成备份中的客户',()=>{
 const db=database(),insert=db.prepare('INSERT INTO gym_records(kind,id,payload) VALUES(?,?,?)');
 const request={records:[{kind:'order',id:'o',payload:{name:'合成',phone:'13900001111',autoCustomer:true}},{kind:'customer',id:'c',payload:{name:'合成',phone:'13900001111'}}]};insert.run('restore','r',JSON.stringify(request));assert.equal(db.prepare("SELECT count(*) AS n FROM gym_records WHERE kind='customer'").get().n,1);db.close();
});

test('新订单补全已有客户的空门店和招生官，同时保留已填写的归属',()=>{
 const db=database(), insert=db.prepare('INSERT INTO gym_records(kind,id,payload) VALUES(?,?,?)');
 insert.run('customer','c',JSON.stringify({name:'合成会员',phone:'13900001234',owner:'',store:'原门店'}));
 insert.run('order','o',JSON.stringify({name:'合成会员',phone:'13900001234',owner:'合成教练',store:'新门店',autoCustomer:true}));
 const row=db.prepare("SELECT payload,revision FROM gym_records WHERE kind='customer' AND id='c'").get(),customer=JSON.parse(row.payload);
 assert.equal(customer.owner,'合成教练');assert.equal(customer.store,'原门店');assert.equal(row.revision,2);db.close();
});
