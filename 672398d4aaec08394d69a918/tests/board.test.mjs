import assert from 'node:assert/strict';
import { test } from 'node:test';

import { judgePlacement, orderOf, shuffle } from '../src/board.js';

const W = 78;
const H = 88;

// 以左上角坐标造一个已放部件。
const part = (char, uid, x, y, w = W, h = H) => ({ char, uid, x, y, w, h });

const plan = (over = {}) => ({
  mode: 'A',
  parts: ['日', '月'],
  lockParts: [],
  structure: '左右结构',
  ids: '⿰日月',
  ...over,
});

test('orderOf 横向摆放推出左右排布与从左到右顺序', () => {
  const placed = [part('月', 'p1', 200, 100), part('日', 'p0', 60, 100)];
  const { order, formation } = orderOf(placed);
  assert.equal(formation, 'lr');
  assert.deepEqual(order, ['p0', 'p1']);
});

test('orderOf 纵向摆放推出上下排布与从上到下顺序', () => {
  const placed = [part('日', 'p0', 100, 40), part('月', 'p1', 100, 200)];
  const { order, formation } = orderOf(placed);
  assert.equal(formation, 'tb');
  assert.deepEqual(order, ['p0', 'p1']);
});

test('orderOf 只有一个部件时没有排布方向', () => {
  const { order, formation } = orderOf([part('日', 'p0', 10, 10)]);
  assert.deepEqual(order, ['p0']);
  assert.equal(formation, null);
});

test('左右摆好且顺序正确时判对', () => {
  const placed = [part('日', 'p0', 40, 100), part('月', 'p1', 140, 100)];
  assert.equal(judgePlacement(placed, plan()), true);
});

test('顺序反了判错', () => {
  const placed = [part('月', 'p1', 40, 100), part('日', 'p0', 140, 100)];
  assert.equal(judgePlacement(placed, plan()), false);
});

test('摆成上下判错（结构不符）', () => {
  const placed = [part('日', 'p0', 100, 30), part('月', 'p1', 100, 150)];
  assert.equal(judgePlacement(placed, plan()), false);
});

test('上下结构的字摆成上下判对', () => {
  const placed = [part('日', 'p0', 100, 30), part('月', 'p1', 100, 150)];
  assert.equal(judgePlacement(placed, plan({ parts: ['日', '月'], structure: '上下结构', ids: '⿱日月' })), true);
});

test('部件数量不足判错', () => {
  assert.equal(judgePlacement([part('日', 'p0', 40, 100)], plan()), false);
  assert.equal(judgePlacement([], plan()), false);
});

test('重复同一部件代替另一部件判错', () => {
  const placed = [part('日', 'p0', 40, 100), part('日', 'p1', 140, 100)];
  assert.equal(judgePlacement(placed, plan()), false);
});

test('结构标签为空时不校验排布方向', () => {
  const placed = [part('日', 'p0', 100, 30), part('月', 'p1', 100, 150)];
  assert.equal(judgePlacement(placed, plan({ structure: '', ids: '' })), true);
});

test('三部件左右结构按从左到右判对', () => {
  const placed = [
    part('木', 'p0', 10, 100),
    part('木', 'p1', 120, 100),
    part('木', 'p2', 230, 100),
  ];
  const p = plan({ parts: ['木', '木', '木'], ids: '⿲木木木', structure: '左中右结构' });
  assert.equal(judgePlacement(placed, p), true);
});

test('包围结构：内件落在外框内判对', () => {
  const placed = [part('囗', 'p0', 100, 100, 220, 220), part('玉', 'p1', 160, 160, 60, 60)];
  const p = plan({ parts: ['囗', '玉'], ids: '⿴囗玉', structure: '全包围结构' });
  assert.equal(judgePlacement(placed, p), true);
});

test('包围结构：内件在外框外判错', () => {
  const placed = [part('囗', 'p0', 100, 100, 220, 220), part('玉', 'p1', 600, 160, 60, 60)];
  const p = plan({ parts: ['囗', '玉'], ids: '⿴囗玉', structure: '全包围结构' });
  assert.equal(judgePlacement(placed, p), false);
});

test('半包围结构按内外位置判定', () => {
  const placed = [part('辶', 'p0', 100, 120, 240, 120), part('云', 'p1', 180, 150, 70, 70)];
  const p = plan({ parts: ['辶', '云'], ids: '⿺辶云', structure: '半包围结构' });
  assert.equal(judgePlacement(placed, p), true);
});

test('shuffle 保留全部元素', () => {
  const source = ['a', 'b', 'c', 'd'];
  const result = shuffle(source);
  assert.equal(result.length, source.length);
  assert.deepEqual([...result].sort(), [...source].sort());
  assert.deepEqual(source, ['a', 'b', 'c', 'd'], '不修改入参');
});
