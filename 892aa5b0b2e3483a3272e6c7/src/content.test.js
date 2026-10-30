import {test} from 'node:test';
import assert from 'node:assert/strict';
import {decode,roles,examples,fortunes} from './content.js';
test('五类已收录发言有解读，未知输入使用统一处方',()=>{const cases=['这个需求很简单，你随便做一下','我们是一家人','标志放大一点','在我电脑上是好的','降本增效'];roles.forEach((role,i)=>{assert.ok(examples[role].length>0);assert.ok(decode(role,cases[i]).matched);const unknown=decode(role,'一只绿色的杯子');assert.equal(unknown.matched,false);assert.match(unknown.text,/词库未收录/);assert.match(unknown.prescription,/留痕/)});assert.equal(fortunes.length,10)});
test('按角色及字典顺序首次命中',()=>{assert.notEqual(decode('HR','拥抱变化').text,decode('老板','拥抱变化').text);assert.equal(decode('产品经理','这个需求很简单，随便做').text,decode('产品经理','很简单').text)});
