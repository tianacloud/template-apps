import test from 'node:test';
import assert from 'node:assert/strict';
import { orderCommission, countedCommission, commissionPreview } from '../src/commission.js';
const settings = { mode: 'custom', fixedRate: 12, countDue: true };
const courses = [{ name: '私教课', rate: 15 }];
test('比例、优惠与二级分成按订单计算', () => {
  const order = { fee: 1000, discount: 200, course: '私教课', secondCommission: 30 };
  assert.deepEqual(orderCommission(order, settings, courses), { rate: 15, gross: 120, earned: 90 });
});
test('固定金额和二级分成超出时的下限', () => {
  assert.equal(orderCommission({ commissionType: 'fixed', fixedAmount: 345, secondCommission: 50 }, settings, courses).earned, 295);
  assert.equal(orderCommission({ commissionType: 'fixed', fixedAmount: 30, secondCommission: 50 }, settings, courses).earned, 0);
});
test('待付款开关仅影响统计，单据金额仍可查看', () => {
  const order = { fee: 1000, discount: 100, customRate: 20, status: 'due' };
  assert.equal(orderCommission(order, settings, courses).earned, 180);
  assert.equal(countedCommission(order, { ...settings, countDue: false }, courses), 0);
});
test('本单费率优先；输入预览分别舍入', () => {
  assert.equal(orderCommission({ fee: 101, discount: 10, customRate: 15, secondCommission: 20 }, settings, courses).gross, 14);
  assert.deepEqual(commissionPreview({ fee: 101, discount: 10, rate: 15 }), { base: 15, discount: 2, amount: 13 });
});
