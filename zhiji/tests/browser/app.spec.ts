import { test, expect, type Page } from '@playwright/test';
import { createFixture } from '../fixtures/hrana';
import { history } from '../fixtures/records';
let fixture: ReturnType<typeof createFixture>;
test.beforeEach(async ({ page }) => {
  fixture = createFixture();
  await page.route('https://ep-00000000000000000000000000.fixture.test/**',async route => {
    try { await route.fulfill({ status: 200,headers: { 'content-type': 'application/vnd.tiana.fetch.v1','cache-control': 'no-store' },body: Buffer.from(await fixture.handle(route.request().postDataBuffer()!)) }); }
    catch { await route.abort('failed'); }
  });
});
test.afterEach(() => fixture.close());
async function ready(page: Page, hash = '') { await page.goto('/' + hash); await expect(page.locator('.loading-screen')).toBeHidden(); await expect(page.locator('.page')).toBeVisible(); }
async function period(page: Page,start: string,end: string | null) {
  await page.getByRole('button',{ name: '经期开始',exact: true }).click();
  await page.getByLabel('经期开始日期',{ exact: true }).fill(start);
  if (end) await page.getByLabel('最后出血日期',{ exact: true }).fill(end);
  await page.getByRole('button',{ name: '保存记录',exact: true }).click();
  await expect(page.locator('.status-message')).toContainText('记录已保存');
  await page.getByRole('button',{ name: '关闭记录面板' }).click();
}
test('records periods and full daily event lists, refreshes routes, and preserves null versus none',async ({ page }) => {
  const errors: string[] = []; page.on('pageerror',e => errors.push(e.message));
  await ready(page); await expect(page.locator('h1')).toHaveText('今天，照顾好自己。');
  await period(page,'2026-09-01','2026-09-05'); await period(page,'2026-10-01','2026-10-05');
  await page.getByRole('button',{ name: '记录今天',exact: true }).click();
  await page.getByLabel('疼痛程度（0～10 分）').fill('0');
  await page.getByRole('button',{ name: '添加一次排便' }).click(); await page.getByRole('button',{ name: '添加一次排便' }).click();
  await page.getByLabel('便型').nth(0).selectOption('4');
  await page.getByRole('button',{ name: '添加一次爱爱' }).click();
  await page.getByRole('combobox',{ name: '当天情况',exact: true }).selectOption('yes');
  await page.getByRole('button',{ name: '透明',exact: true }).click(); await page.getByRole('button',{ name: '乳白',exact: true }).click();
  await page.getByRole('button',{ name: '可拉丝',exact: true }).click();
  await page.getByLabel('留给自己的话').fill('中文身体记录，O\'Reilly');
  await page.getByRole('button',{ name: '保存记录',exact: true }).click();
  await expect(page.locator('.status-message')).toContainText('记录已保存');
  const row = fixture.db.prepare('SELECT * FROM zhiji_daily_logs').get()!;
  expect(row.pain_score).toBe(0); expect(JSON.parse(String(row.bowel_events))).toHaveLength(2); expect(JSON.parse(String(row.intimacy_events))).toHaveLength(1);
  expect(row.moods).toBeNull(); expect(JSON.parse(String(row.discharge)).colors).toEqual(['CLEAR','WHITE']);
  await page.getByRole('button',{ name: '关闭记录面板' }).click(); await page.goto('/#/calendar?date=2026-10-01'); await page.reload();
  await expect(page.locator('h1')).toHaveText('身体的日历'); await expect(page.locator('.date-detail')).toContainText('10 月 1 日');
  expect(errors).toEqual([]);
});
test('records and edits start-only history without showing continuous bleeding',async ({page}) => {
  await ready(page);
  for (const start of ['2026-08-01','2026-09-01']) {
    await page.getByRole('button',{name:'经期开始',exact:true}).click();
    await page.getByLabel('经期开始日期',{exact:true}).fill(start);
    await page.getByRole('checkbox',{name:'结束日期未知',exact:true}).check();
    await expect(page.getByLabel('最后出血日期',{exact:true})).toBeDisabled();
    await page.getByRole('button',{name:'保存记录',exact:true}).click();
    await expect(page.locator('.status-message')).toContainText('记录已保存');
    await page.getByRole('button',{name:'关闭记录面板'}).click();
  }
  await page.goto('/#/calendar?date=2026-09-01'); await page.reload();
  await expect(page.locator('.period-history .record-row')).toHaveCount(2);
  await expect(page.locator('.period-history')).toContainText('天数未知');
  await expect(page.locator('.period-history')).not.toContainText('进行中');
  await expect(page.getByRole('button',{name:'2026 年 9 月 1 日，已记录经期',exact:true})).toHaveClass(/actual/);
  await expect(page.getByRole('button',{name:'2026 年 9 月 2 日',exact:true})).not.toHaveClass(/actual/);
  await page.getByRole('button',{name:'编辑／结束经期'}).click();
  await page.getByRole('checkbox',{name:'结束日期未知',exact:true}).uncheck();
  await page.getByLabel('最后出血日期',{exact:true}).fill('2026-09-05');
  await page.getByRole('button',{name:'保存记录',exact:true}).click();
  await expect(page.locator('.status-message')).toContainText('记录已保存');
  expect(fixture.db.prepare("SELECT end_unknown,end_date FROM zhiji_periods WHERE start_date='2026-09-01'").get()).toMatchObject({end_unknown:0,end_date:'2026-09-05'});
});
test('retains draft input and verifies a lost response without a duplicate write',async ({ page }) => {
  await ready(page); await page.getByRole('button',{ name: '记录今天',exact: true }).click();
  await page.getByLabel('留给自己的话').fill('已经提交，响应丢失'); fixture.failNext('after');
  await page.getByRole('button',{ name: '保存记录',exact: true }).click(); await expect(page.locator('.status-message')).toContainText('记录已保存');
  expect(fixture.calls.filter(c => c.sql.includes('last_write_id=?'))).toHaveLength(1);
  await page.getByLabel('留给自己的话').fill('尚未发送，保留输入'); fixture.failNext('before');
  await page.getByRole('button',{ name: '保存记录',exact: true }).click(); await expect(page.locator('.status-message')).toContainText('未写入');
  await expect(page.getByLabel('留给自己的话')).toHaveValue('尚未发送，保留输入');
  await page.getByRole('button',{ name: '保存记录',exact: true }).click(); await expect(page.locator('.status-message')).toContainText('记录已保存');
  expect(fixture.db.prepare('SELECT COUNT(*) n FROM zhiji_daily_logs').get()!.n).toBe(1);
});
test('rejects overlaps without losing input and marks the successor gap when deleting a real middle period',async ({ page }) => {
  await ready(page); await period(page,'2026-07-01','2026-07-05'); await period(page,'2026-08-01','2026-08-05'); await period(page,'2026-09-01','2026-09-05');
  await page.getByRole('button',{ name: '经期开始',exact: true }).click();
  await page.getByLabel('经期开始日期',{ exact: true }).fill('2026-09-04'); await page.getByLabel('最后出血日期',{ exact: true }).fill('2026-09-07');
  await page.getByRole('button',{ name: '保存记录',exact: true }).click(); await expect(page.locator('.form-error')).toContainText('重叠');
  await expect(page.getByLabel('经期开始日期',{ exact: true })).toHaveValue('2026-09-04');
  page.once('dialog',dialog => dialog.accept()); await page.getByRole('button',{ name: '关闭记录面板' }).click();
  await page.goto('/#/calendar?date=2026-08-01'); await page.getByRole('button',{ name: '编辑／结束经期' }).click();
  await page.getByRole('button',{ name: '删除经期',exact: true }).click(); await page.getByRole('button',{ name: '确认删除',exact: true }).click();
  await expect(page.locator('.status-message')).toContainText('记录已保存');
  expect(fixture.db.prepare("SELECT gap_before FROM zhiji_periods WHERE start_date='2026-09-01'").get()!.gap_before).toBe(1);
});
test('exports complete JSON, previews conflicts, and clears then restores an empty database',async ({ page }) => {
  await ready(page); await period(page,'2026-09-01','2026-09-05'); await page.goto('/#/settings');
  const downloaded = page.waitForEvent('download'); await page.getByRole('button',{ name: '导出 JSON 备份' }).click(); const download = await downloaded;
  const stream = await download.createReadStream(); const buffers: Buffer[] = []; for await (const b of stream!) buffers.push(Buffer.from(b)); const data = Buffer.concat(buffers);
  expect(JSON.parse(data.toString()).periods).toHaveLength(1);
  await page.getByRole('button',{ name: '删除数据',exact: true }).click(); await page.getByLabel('输入「删除」确认').fill('删除'); await page.getByRole('button',{ name: '确认清除个人数据' }).click();
  await expect(page.locator('.status-message')).toContainText('记录已保存'); expect(fixture.db.prepare('SELECT COUNT(*) n FROM zhiji_periods').get()!.n).toBe(0);
  await page.locator('input[type=file]').setInputFiles({ name: 'zhiji.json',mimeType: 'application/json',buffer: data });
  await expect(page.locator('.import-preview')).toContainText('新增'); await page.getByRole('button',{ name: '确认导入',exact: true }).click();
  await expect(page.locator('.import-preview')).toBeHidden(); expect(fixture.db.prepare('SELECT COUNT(*) n FROM zhiji_periods').get()!.n).toBe(1);
  const modified = JSON.parse(data.toString()); modified.periods[0].note = '导入冲突内容';
  await page.locator('input[type=file]').setInputFiles({ name: 'conflict.json',mimeType: 'application/json',buffer: Buffer.from(JSON.stringify(modified)) });
  await expect(page.getByRole('button',{ name: '确认导入',exact: true })).toBeDisabled();
  await page.getByLabel('如何处理').selectOption('keep'); await page.getByRole('button',{ name: '确认导入',exact: true }).click();
  await expect(page.locator('.import-preview')).toBeHidden(); expect(fixture.db.prepare('SELECT note FROM zhiji_periods').get()!.note).toBeNull();
});
test('renders probability estimates, conditional updates, insights, and accessible knowledge on mobile',async ({ page }) => {
  const f = history([28,29,27,28],'2026-05-01');
  for (const p of f.periods) fixture.db.prepare('INSERT INTO zhiji_periods(id,start_date,end_date,gap_before,note,source,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').run(p.id,p.startDate,p.endDate,+p.gapBefore,p.note,p.source,p.createdAt,p.updatedAt);
  await page.setViewportSize({ width: 390,height: 844 }); await ready(page);
  await expect(page.locator('.probability')).toBeVisible(); await expect(page.locator('.phase-copy')).toContainText('核实');
  const card = page.locator('.knowledge-toggle').first(); await card.focus(); await page.keyboard.press('Enter'); await expect(card).toHaveAttribute('aria-expanded','true');
  await page.getByRole('button',{ name: '确认尚未来经',exact: true }).click(); await page.getByRole('button',{ name: '保存确认',exact: true }).click();
  await expect(page.locator('.prediction-card')).toContainText('已确认截至');
  await page.goto('/#/insights?cycles=3&days=90'); await expect(page.locator('h1')).toHaveText('慢慢了解自己的规律');
  await page.getByRole('button',{ name: '身体记录',exact: true }).click(); await expect(page.locator('.distribution-grid')).toBeVisible();
  for (const width of [320,375,390]) {
    await page.setViewportSize({ width,height: 844 }); await page.goto('/#/calendar'); await expect(page.locator('.calendar-grid')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.screenshot({ path: 'test-results/mobile-calendar.png',fullPage: true });
});
test('prevents a stale device from overwriting and does not submit twice during a slow save',async ({ page }) => {
  await ready(page); await page.getByRole('button',{ name: '记录今天',exact: true }).click(); await page.getByLabel('留给自己的话').fill('当前草稿');
  fixture.db.prepare('UPDATE zhiji_state SET facts_revision=1,last_write_id=?').run('other-device');
  await page.getByRole('button',{ name: '保存记录',exact: true }).click(); await expect(page.locator('.status-message')).toContainText('另一台设备');
  await expect(page.getByLabel('留给自己的话')).toHaveValue('当前草稿'); await page.getByRole('button',{ name: '我已核实，保留当前输入' }).click();
  const pause = fixture.pauseNextWrite(); await page.getByRole('button',{ name: '保存记录',exact: true }).click(); await pause.started;
  await expect(page.getByRole('button',{ name: '正在保存…' })).toBeDisabled(); pause.resume();
  await expect(page.locator('.status-message')).toContainText('记录已保存'); expect(fixture.db.prepare('SELECT COUNT(*) n FROM zhiji_daily_logs').get()!.n).toBe(1);
});
test('lets a retained draft continue after an uncertain write and a later remote change',async ({ page }) => {
  await ready(page); await page.getByRole('button',{name:'记录今天',exact:true}).click();
  await page.getByLabel('留给自己的话').fill('需要核实的草稿');
  let lost = 0;
  await page.route('https://ep-00000000000000000000000000.fixture.test/**',async route => {
    try { await route.fulfill({status:200,headers:{'content-type':'application/vnd.tiana.fetch.v1','cache-control':'no-store'},body:Buffer.from(await fixture.handle(route.request().postDataBuffer()!))}); }
    catch { if (++lost === 1) fixture.failNext('read'); await route.abort('failed'); }
  });
  fixture.failNext('after');
  await page.getByRole('button',{name:'保存记录',exact:true}).click();
  await expect(page.locator('.status-message')).toContainText('暂时无法确认');
  fixture.db.prepare("UPDATE zhiji_daily_logs SET note='云端后续记录'").run();
  fixture.db.prepare("UPDATE zhiji_state SET facts_revision=2,last_write_id='other-device'").run();
  await page.getByRole('dialog').getByRole('button',{name:'核实保存状态',exact:true}).click();
  await expect(page.getByRole('dialog').getByRole('button',{name:'我已核实，保留当前输入'})).toBeEnabled();
  await page.getByRole('dialog').getByText('查看云端最新记录',{exact:true}).click();
  await expect(page.locator('.remote-record')).toContainText('云端后续记录');
  await expect(page.getByLabel('留给自己的话')).toHaveValue('需要核实的草稿');
  await page.getByRole('button',{name:'我已核实，保留当前输入'}).click();
  await page.getByRole('button',{name:'保存记录',exact:true}).click();
  await expect(page.locator('.status-message')).toContainText('记录已保存');
  expect(fixture.db.prepare('SELECT note FROM zhiji_daily_logs').get()!.note).toBe('需要核实的草稿');
  await page.getByRole('button',{name:'关闭记录面板'}).focus(); await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button',{name:'保存记录',exact:true})).toBeFocused();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button',{name:'记录今天',exact:true})).toBeFocused();
});
