/* 判断引擎：本机规则兜底 + 容器 AI 文本能力增强（可选） */
(function (global) {
  'use strict';

  var FREQ_OPTIONS = [
    { key: 'daily', label: '几乎每天', perYear: 250 },
    { key: 'weekly', label: '每周一两次', perYear: 72 },
    { key: 'monthly', label: '每月几次', perYear: 12 },
    { key: 'rare', label: '很少用', perYear: 2 }
  ];

  var TAG_OPTIONS = ['自己用', '送人', '孩子想要', '囤货/优惠'];

  var SYSTEM_PROMPT = [
    '你是「持家军师」，一位精打细算的购买决策顾问。用户会用文字描述想买的东西、价格、大致使用频率和用途。',
    '',
    '按下面的固定格式回答，每个【】小节都要有，不要加其他内容：',
    '【名称】推断出这件东西的名称，只写名称本身，不超过 20 个字',
    '【结论】只写三个字之一：值得买 / 缓一缓 / 不买',
    '【一句话】用一两句大白话说透买或不买的核心逻辑',
    '【这笔账】花掉什么（钱、时间、占地、注意力），换回什么（使用频率、省下的钱或时间）。能估数字就估数字',
    '【有没有坑】同价位替代品、划线价套路、预付充值、延保等风险；没有就写「暂无明显风险」',
    '【证据等级】只写 A / B / C 其中一个字母，加一句依据',
    '【什么情况会反转】说清楚什么条件下结论会反过来',
    '【冷静期】结论是「缓一缓」时写「N天」（1 到 30 的整数），其他结论写「无」',
    '',
    '立场要求：只算账，不站队，不说教，不评判用户已有的消费；不提供投资建议，不推荐具体品牌。'
  ].join('\n');

  function yuan(value) {
    var rounded = Math.round(value * 10) / 10;
    var text = rounded >= 100 ? String(Math.round(rounded)) : String(rounded);
    return text.replace(/\.0$/, '');
  }

  function freqOf(key) {
    for (var i = 0; i < FREQ_OPTIONS.length; i++) {
      if (FREQ_OPTIONS[i].key === key) return FREQ_OPTIONS[i];
    }
    return FREQ_OPTIONS[2];
  }

  function looksPrepaid(name) {
    return /卡|会员|充值|储值|年费|套餐/.test(name);
  }

  function looksDurable(name) {
    return /机|器|表|屏|脑|耳|相机|电|锅|椅|床|柜/.test(name);
  }

  /* 本机规则：按「价格 ÷ 预期年使用次数」算单次成本 */
  function judgeLocal(input) {
    var name = input.name;
    var price = input.price;
    var freq = freqOf(input.freqKey);
    var tags = input.tags || [];
    var perYear = freq.perYear;
    var unitCost = perYear > 0 ? price / perYear : price;
    var threeYearUnit = perYear > 0 ? price / (perYear * 3) : price;

    var verdict = '值得买';
    var verdictClass = 'buy';
    var coolingDays = 0;
    var reason = '';

    if (tags.indexOf('孩子想要') !== -1 && price >= 300) {
      verdict = '缓一缓';
      verdictClass = 'hold';
      coolingDays = 7;
      reason = '孩子想要的玩具或用品，先隔一周再看还想不想要，成功率往往不低。';
    }

    if (input.hasSimilar) {
      verdict = '不买';
      verdictClass = 'skip';
      coolingDays = 0;
      reason = '家里已有类似的东西，再买一件多半是在解决收纳问题，不是解决问题。';
    } else if (verdict !== '不买') {
      if (perYear <= 2 && price >= 200) {
        verdict = '不买';
        verdictClass = 'skip';
        coolingDays = 0;
        reason = '一年用不到三次的东西，买的其实是「想象中的自己」。';
      } else if (price >= 3000) {
        verdict = '缓一缓';
        verdictClass = 'hold';
        coolingDays = 14;
        reason = '这是大额支出，按经验至少放两周：两周后还想要，且能说清具体用途，再买不迟。';
      } else if (unitCost > 80) {
        verdict = '缓一缓';
        verdictClass = 'hold';
        coolingDays = 7;
        reason = '摊到每次的成本偏高，先把使用场景想具体，再决定要不要花这笔钱。';
      } else if (price >= 500) {
        verdict = '缓一缓';
        verdictClass = 'hold';
        coolingDays = 7;
        reason = '五百元以上的非必需品，隔一周再看，能挡掉相当一部分冲动。';
      } else if (!reason) {
        reason = '单价不高、用得也不算少，这类钱花得比较值。';
      }
    }

    var sections = [];

    sections.push({
      title: '一句话',
      text: reason
    });

    sections.push({
      title: '这笔账',
      text: '总价 ¥' + yuan(price) + '；按「' + freq.label + '」算，一年约 ' + perYear + ' 次，' +
        '单次成本 ¥' + yuan(unitCost) + '；用满三年，单次降到 ¥' + yuan(threeYearUnit) + '。' +
        '另外还要算上比价、收纳和占地方的心思。'
    });

    var pitText;
    if (looksPrepaid(name)) {
      pitText = '预付类（卡/会员/套餐）依法应有书面合同，写清有效期、退款和转让规则；没写清就别充，充了也别充太大额。';
    } else if (looksDurable(name)) {
      pitText = '这个价位常见「划线价」套路，先记住日常价再看折扣；延保一般不划算，三包已覆盖的部分别重复买。';
    } else {
      pitText = '暂无明显风险，留意退换货规则和是否真的会用起来。';
    }
    if (tags.indexOf('囤货/优惠') !== -1) {
      pitText += '「囤货/优惠」最容易把预算变成库存，先算清楚用不用的完。';
    }
    sections.push({ title: '有没有坑', text: pitText });

    sections.push({
      title: '证据等级',
      text: 'C —— 这是本机固定规则按「价格 ÷ 预期年使用次数」算出来的，没有联网比价，也没有你所在城市的实际价格数据。'
    });

    var flipPerYear = perYear > 0 ? perYear : 1;
    sections.push({
      title: '什么情况会反转',
      text: '如果你实际每年用到 ' + Math.ceil(flipPerYear * 1.5) + ' 次以上，单次成本会降到 ¥' +
        yuan(price / (flipPerYear * 1.5)) + '，结论就往「值得买」走；反过来，买回来一周用不到一次，结论就变成「不买」。'
    });

    return {
      name: name,
      verdict: verdict,
      verdictClass: verdictClass,
      coolingDays: coolingDays,
      sections: sections,
      source: 'local'
    };
  }

  function parseAI(text, input) {
    if (!text || typeof text !== 'string') return null;
    var verdictMatch = text.match(/【结论】\s*([^\n【]+)/);
    if (!verdictMatch) return null;

    var verdict = verdictMatch[1].trim();
    var verdictClass = 'hold';
    if (verdict.indexOf('值得买') !== -1) {
      verdict = '值得买';
      verdictClass = 'buy';
    } else if (verdict.indexOf('不买') !== -1) {
      verdict = '不买';
      verdictClass = 'skip';
    } else {
      verdict = '缓一缓';
      verdictClass = 'hold';
    }

    var titles = ['一句话', '这笔账', '有没有坑', '证据等级', '什么情况会反转'];
    var sections = [];
    titles.forEach(function (title) {
      var re = new RegExp('【' + title + '】\\s*([\\s\\S]*?)(?=【|$)');
      var m = text.match(re);
      if (m && m[1].trim()) sections.push({ title: title, text: m[1].trim() });
    });
    if (sections.length === 0) return null;

    var coolingDays = 0;
    var cd = text.match(/【冷静期】\s*(\d+)\s*天/);
    if (cd) {
      var days = parseInt(cd[1], 10);
      if (days >= 1 && days <= 30 && verdictClass === 'hold') coolingDays = days;
    }

    var nameMatch = text.match(/【名称】\s*([^\n【]+)/);
    var aiName = nameMatch ? nameMatch[1].trim() : '';

    return {
      name: aiName || input.name,
      verdict: verdict,
      verdictClass: verdictClass,
      coolingDays: coolingDays,
      sections: sections,
      source: 'ai'
    };
  }

  function buildPrompt(input) {
    var freq = freqOf(input.freqKey);
    var parts = [];
    parts.push('我想买的是：' + input.name + '。');
    parts.push('价格大约：' + yuan(input.price) + ' 元。');
    parts.push('预计使用频率：' + freq.label + '。');
    if (input.tags && input.tags.length) parts.push('用途：' + input.tags.join('、') + '。');
    if (input.hasSimilar) parts.push('家里已经有类似的东西。');
    parts.push('请帮我判断要不要买。');
    return parts.join('');
  }

  /* 调用容器 AI（在线文档：window.xhs.AI，内测，需白名单）。任何异常都返回 null */
  function callAI(input) {
    return new Promise(function (resolve) {
      var xhs = global.xhs;
      if (!xhs || !xhs.AI || typeof xhs.AI.createModel !== 'function') {
        resolve(null);
        return;
      }

      var model;
      try {
        model = xhs.AI.createModel({ model: 'deepseek-v4-flash' });
      } catch (e) {
        resolve(null);
        return;
      }
      if (!model || typeof model.generateText !== 'function') {
        resolve(null);
        return;
      }

      var ret;
      try {
        ret = model.generateText({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildPrompt(input) }
          ],
          max_output_tokens: 900
        });
      } catch (e) {
        resolve(null);
        return;
      }

      if (!ret || typeof ret.then !== 'function') {
        resolve(null);
        return;
      }

      ret.then(function (res) {
        var text = '';
        if (typeof res === 'string') text = res;
        else if (res && typeof res.text === 'string') text = res.text;
        else if (res && typeof res.content === 'string') text = res.content;
        else if (res && res.data && typeof res.data.text === 'string') text = res.data.text;
        resolve(parseAI(text, input));
      }, function () { resolve(null); });
    });
  }

  global.BonEngine = { FREQ_OPTIONS: FREQ_OPTIONS, TAG_OPTIONS: TAG_OPTIONS, judgeLocal: judgeLocal, judge: function(input) { return Promise.resolve(judgeLocal(input)); } };
})(window);
