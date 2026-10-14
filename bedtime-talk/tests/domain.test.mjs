import test from 'node:test';
import assert from 'node:assert/strict';
import { drawQuestion, nextAudience, localDay } from '../src/domain.js';

test('a turn alternates between parent and child', () => {
  assert.equal(nextAudience('parent'), 'child');
  assert.equal(nextAudience('child'), 'parent');
});
test('draws stay in the selected deck and avoid repeats until exhausted', () => {
  const questions = [{ id: 'c1', audience: 'child', content: 'Original' }, { id: 'c2', audience: 'child' }, { id: 'p1', audience: 'parent' }];
  const seen = new Set();
  const first = drawQuestion(questions, 'child', seen, () => 0);
  assert.equal(first.id, 'c1');
  assert.equal(drawQuestion(questions, 'child', seen, () => 0).id, 'c2');
  assert.equal(drawQuestion(questions, 'child', seen, () => 0).id, 'c1');
  questions[0].content = 'Edited';
  assert.equal(first.content, 'Original');
  assert.equal(drawQuestion([], 'parent', seen), null);
});
test('deleting questions does not prevent drawing from the remaining deck', () => {
  const seen = new Set(['removed', 'remaining', 'p1']);
  const question = drawQuestion([{ id: 'remaining', audience: 'child' }], 'child', seen, () => 0);
  assert.equal(question.id, 'remaining');
  assert.ok(seen.has('p1'));
});
test('history days follow the browser calendar', () => {
  assert.equal(localDay(new Date(2026, 0, 2, 23, 59)), '2026-01-02');
});
