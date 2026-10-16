import {chromium} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
await mkdir('test-results',{recursive:true});
const html=await readFile('showcase/preview.html','utf8');assert.ok(Buffer.byteLength(html)<500000);
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<html><body style="margin:0"><iframe sandbox="allow-scripts" style="border:0;width:100%;height:100vh"></iframe></body></html>');});await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{await page.goto('http://127.0.0.1:'+server.address().port);requests.length=0;await page.locator('iframe').evaluate((el,html)=>el.srcdoc=html,html);const app=page.frameLocator('iframe');await app.getByRole('heading',{name:'小满，你好呀'}).waitFor();await page.screenshot({path:'test-results/showcase-desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/showcase-mobile.png',fullPage:true});assert.equal(await app.locator('html').evaluate(el=>el.scrollWidth>innerWidth),false);
await app.locator('.feature-card').filter({hasText:'身高体重'}).click();await app.getByRole('button',{name:'＋ 记录身高体重'}).click();await app.getByLabel('身高 / 身长（cm）').fill('72.2');await app.getByLabel('体重（kg）').fill('8.55');await app.getByLabel('备注（选填）').fill('预览里的成长记录');await app.getByRole('button',{name:'保存记录',exact:true}).click();await app.getByText('预览里的成长记录',{exact:true}).waitFor();
await app.getByRole('button',{name:'返回首页',exact:true}).click();await app.locator('.feature-card').filter({hasText:'身高体重'}).click();assert.equal(await app.getByText('预览里的成长记录',{exact:true}).count(),1);await app.getByRole('button',{name:'记录身高体重',exact:true}).count();
await app.locator('.record-row').filter({hasText:'预览里的成长记录'}).getByRole('button',{name:/编辑测量/}).click();await app.getByLabel('备注（选填）').fill('已编辑的预览成长记录');await app.getByRole('button',{name:'取消',exact:true}).click();assert.equal(await app.getByText('预览里的成长记录',{exact:true}).count(),1);
await app.locator('.record-row').filter({hasText:'预览里的成长记录'}).getByRole('button',{name:/编辑测量/}).click();await app.getByLabel('备注（选填）').fill('已编辑的预览成长记录');await app.getByRole('button',{name:'保存记录',exact:true}).click();await app.getByText('已编辑的预览成长记录',{exact:true}).waitFor();
await app.locator('.record-row').filter({hasText:'已编辑的预览成长记录'}).getByRole('button',{name:/删除测量/}).click();await app.getByRole('button',{name:'确认删除'}).click();await app.locator('.dialog').waitFor({state:'hidden'});assert.equal(await app.getByText('已编辑的预览成长记录',{exact:true}).count(),0);
for(let i=0;i<2;i++){await app.getByRole('button',{name:'恢复示例',exact:true}).click();await app.getByRole('heading',{name:'小满，你好呀'}).waitFor();}
for(const route of ['meals','ledger','categories','todos','vaccines','teeth','milestones','settings']){await app.locator('body').evaluate((el,r)=>location.hash='#/'+r,route);await page.waitForTimeout(80);assert.equal(await app.locator('html').evaluate(el=>el.scrollWidth>innerWidth),false);await page.screenshot({path:`test-results/showcase-${route}.png`,fullPage:true});}
assert.deepEqual(errors,[]);assert.equal(requests.filter(x=>/^https?:/.test(x)&&!x.startsWith('http://127.0.0.1:')).length,0);console.log('PASS: opaque sandbox showcase add/edit/cancel/delete + navigation + two resets + all mobile pages + zero external requests/errors');
}finally{await browser.close();server.close();}
