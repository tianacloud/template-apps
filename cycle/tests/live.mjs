import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from 'playwright/test';
const log=await readFile(process.argv[2],'utf8');
const launch=JSON.parse(log.split('\n').find(line=>line.startsWith('{'))).data.launch_url;
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Shanghai'});
const page=await context.newPage();page.setDefaultTimeout(20000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
const evidence={};await mkdir('.test-output',{recursive:true});
try {
 await page.goto(launch);await expect(page.getByRole('heading',{name:'把日常，照顾好。'})).toBeVisible();await expect(page.locator('.event-card')).toHaveCount(6,{timeout:30000});
 evidence.runtime=await page.evaluate(()=>({auth:typeof window.tiana?.auth?.getAccessToken==='function',connection:typeof window.tiana?.connection==='function',files:typeof window.tiana?.files?.put==='function'}));expect(evidence.runtime).toEqual({auth:true,connection:true,files:true});
 await page.screenshot({path:'.test-output/live-desktop-home.png',fullPage:true});
 await page.getByRole('button',{name:'新建事件',exact:true}).first().click();await page.getByLabel('事件名称',{exact:true}).fill('收拾储物柜');await page.getByLabel('间隔天数').fill('9');await page.getByRole('button',{name:'保存事件'}).click();await expect(page.locator('.event-card')).toHaveCount(7,{timeout:30000});
 await page.reload();await expect(page.locator('.event-card').filter({hasText:'收拾储物柜'})).toHaveCount(1,{timeout:30000});evidence.eventRefresh=true;
 await page.locator('.card-body').filter({hasText:'收拾储物柜'}).click();await expect(page.getByRole('button',{name:'记一次完成'})).toBeVisible();await page.getByRole('button',{name:'记一次完成'}).click();await page.getByLabel('花了多久').fill('23');await page.getByLabel('留点备注').fill('把换季的东西分类收好了。');
 await page.locator('input[type=file]').setInputFiles({name:'record.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aOqkAAAAASUVORK5CYII=','base64')});
 await page.getByRole('button',{name:'保存记录'}).click();await expect(page.getByText('把换季的东西分类收好了。')).toBeVisible({timeout:60000});
 await page.reload();await expect(page.getByText('把换季的东西分类收好了。')).toBeVisible({timeout:30000});await expect(page.locator('.range-stats strong').first()).toHaveText('1');await expect(page.locator('.range-stats strong').nth(1)).toHaveText('23');
 await expect(page.locator('.record-photos img')).toHaveCount(1);await expect.poll(()=>page.locator('.record-photos img').evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);evidence.recordAndPhotoRefresh=true;
 await page.getByRole('button',{name:'编辑记录',exact:true}).click();await page.getByLabel('花了多久').fill('27');await page.getByRole('button',{name:'保存记录'}).click();await expect(page.locator('.range-stats strong').nth(1)).toHaveText('27',{timeout:30000});
 await page.getByRole('button',{name:'记一次完成'}).click();await page.getByLabel('留点备注').fill('补整理了最上面一层。');await page.getByRole('button',{name:'保存记录'}).click();await expect(page.locator('.range-stats strong').first()).toHaveText('2',{timeout:30000});
 await page.getByRole('button',{name:'次数统计'}).click();await expect(page.locator('.bar-value').filter({hasText:'2'})).toHaveCount(1);await page.getByRole('button',{name:'年',exact:true}).click();await expect(page.locator('.chart-column')).toHaveCount(12);await expect(page.locator('.bar-value').filter({hasText:'2'})).toHaveCount(1);evidence.multiplePerDay=true;
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'.test-output/live-mobile-detail.png',fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.getByRole('button',{name:'记一次完成'}).click();await page.screenshot({path:'.test-output/live-mobile-record.png',fullPage:true});await expect(page.getByRole('button',{name:'保存记录'})).toBeInViewport();await page.getByRole('button',{name:'取消',exact:true}).click();
 await page.getByRole('button',{name:'归档事件',exact:true}).click();await page.getByRole('button',{name:'确认归档'}).click();await expect(page.getByRole('heading',{name:'暂时收起来的日常'})).toBeVisible({timeout:30000});
 await page.getByRole('button',{name:'日常',exact:true}).click();await expect(page.locator('.event-card')).toHaveCount(6);evidence.archive=true;
 await page.screenshot({path:'.test-output/live-mobile-home.png',fullPage:true});expect(errors).toEqual([]);evidence.scriptErrors=errors;
 await writeFile('.test-output/live-result.json',JSON.stringify(evidence,null,2));console.log('PASS:',JSON.stringify(evidence));
} catch(error) { console.error('PAGE',await page.locator('body').innerText());console.error('ERRORS',errors);await page.screenshot({path:'.test-output/live-failure.png',fullPage:true});throw error; }
finally {await browser.close();}
