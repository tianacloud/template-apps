import assert from 'node:assert/strict';
import { test } from 'node:test';

import { scoreOf } from '../src/store.js';

test('一次答对得 15 分', () => {
  assert.equal(scoreOf({ correct: true, attempts: 1, helped: false, hintTriggered: false }), 15);
});

test('多次尝试后答对得 10 分', () => {
  assert.equal(scoreOf({ correct: true, attempts: 2, helped: false, hintTriggered: false }), 10);
  assert.equal(scoreOf({ correct: true, attempts: 5, helped: false, hintTriggered: false }), 10);
});

test('求助后答对得 5 分', () => {
  assert.equal(scoreOf({ correct: true, attempts: 1, helped: true, hintTriggered: false }), 5);
});

test('看过提示后答对得 5 分', () => {
  assert.equal(scoreOf({ correct: true, attempts: 3, helped: false, hintTriggered: true }), 5);
});

test('答错不得分', () => {
  assert.equal(scoreOf({ correct: false, attempts: 4, helped: true, hintTriggered: true }), 0);
});
