import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

// 字典加载走 fetch；在 Node 下把 file:// 请求映射到仓库内的 JSON 文件。
const dictionaryPath = new URL('../public/data/hanzi-common.json', import.meta.url);
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input?.url ?? String(input);
  if (url.endsWith('/data/hanzi-common.json')) {
    const text = await readFile(dictionaryPath, 'utf8');
    return new Response(text, { status: 200, headers: { 'content-type': 'application/json' } });
  }
  return originalFetch(input, init);
};

const hanzi = await import('../src/hanzi.js');

test('字典可以加载并包含常用字', async () => {
  const data = await hanzi.loadDictionary();
  assert.ok(data.chars['明'], '应包含「明」');
  assert.ok(data.chars['休'], '应包含「休」');
});

test('parseIds 解析左右结构的 IDS', () => {
  const tree = hanzi.parseIds('⿰日月');
  assert.deepEqual(tree, { op: '⿰', kids: [{ leaf: '日' }, { leaf: '月' }] });
  assert.deepEqual(hanzi.leavesOf(tree), ['日', '月']);
});

test('parseIds 解析三部件嵌套', () => {
  const tree = hanzi.parseIds('⿲木木木');
  assert.equal(tree.op, '⿲');
  assert.deepEqual(hanzi.leavesOf(tree), ['木', '木', '木']);
});

test('parseIds 遇到多余字符返回 null', () => {
  assert.equal(hanzi.parseIds('⿰日'), null);
  assert.equal(hanzi.parseIds(''), null);
  assert.equal(hanzi.parseIds(null), null);
});

test('isEnclosingIds 识别包围结构', () => {
  assert.equal(hanzi.isEnclosingIds('⿴囗玉'), true);
  assert.equal(hanzi.isEnclosingIds('⿰日月'), false);
  assert.equal(hanzi.isEnclosingIds(''), false);
});

test('expectedFormation 由结构标签推出排布方向', () => {
  assert.equal(hanzi.expectedFormation('左右结构'), 'lr');
  assert.equal(hanzi.expectedFormation('左中右结构'), 'lr');
  assert.equal(hanzi.expectedFormation('上下结构'), 'tb');
  assert.equal(hanzi.expectedFormation('上中下结构'), 'tb');
  assert.equal(hanzi.expectedFormation('半包围结构'), null);
  assert.equal(hanzi.expectedFormation(''), null);
});

test('planOf 使用字典条目', async () => {
  await hanzi.loadDictionary();
  const plan = hanzi.planOf('明');
  assert.deepEqual(plan.parts, ['日', '月']);
  assert.equal(plan.structure, '左右结构');
  assert.equal(plan.mode, 'A');
  assert.equal(plan.py, 'míng');
  assert.equal(hanzi.isPlayable(plan), true);
});

test('planOf 独体字不可玩', async () => {
  await hanzi.loadDictionary();
  const plan = hanzi.planOf('生');
  assert.equal(hanzi.isPlayable(plan), false);
});

test('planOf 未收录的字返回 F 模式', async () => {
  await hanzi.loadDictionary();
  const plan = hanzi.planOf('\u{2A6A5}');
  assert.equal(plan.mode, 'F');
  assert.equal(hanzi.isPlayable(plan), false);
});

test('planOf 教师覆盖优先于字典', async () => {
  await hanzi.loadDictionary();
  const plan = hanzi.planOf('明', { parts: ['日', '月'], lockParts: ['月'], structure: '上下结构' });
  assert.equal(plan.overridden, true);
  assert.deepEqual(plan.lockParts, ['月']);
  assert.equal(plan.structure, '上下结构');
  assert.equal(plan.py, 'míng', '拼音仍来自字典');
});

test('splitChars 去重并过滤非汉字', () => {
  assert.deepEqual(hanzi.splitChars('明 明休，abc林!'), ['明', '休', '林']);
  assert.deepEqual(hanzi.splitChars(''), []);
  assert.deepEqual(hanzi.splitChars(null), []);
});

test.after(() => { globalThis.fetch = originalFetch; });
