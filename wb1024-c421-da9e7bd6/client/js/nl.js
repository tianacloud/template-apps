/* 青禾记账 · 一句话记账的中文解析引擎
 *
 * 纯前端、零依赖、完全离线：不调用任何模型或接口，
 * 断网、飞行模式下行为完全一致。
 *
 *   nl.parse('昨天和室友吃火锅 128，打车 32，收到稿费 300')
 *   → [{cat:'餐饮', cents:12800, time:昨天}, {cat:'交通', cents:3200, ...}, ...]
 *
 * 管线：规范化 → 分句 → 每句四路抽取（日期/金额/类型/分类）→ 置信度
 */
(function (global) {
  'use strict';
  var QH = (global.QH = global.QH || {});
  var nl = (QH.nl = QH.nl || {});

  var EXPENSE = 0, INCOME = 1;

  /* ---------------------------------------------------------- 中文数字 */

  var DIGITS = {
    '零': 0, '〇': 0, '一': 1, '壹': 1, '二': 2, '两': 2, '贰': 2, '三': 3, '叁': 3,
    '四': 4, '肆': 4, '五': 5, '伍': 5, '六': 6, '陆': 6, '七': 7, '柒': 7,
    '八': 8, '捌': 8, '九': 9, '玖': 9
  };
  var UNITS = { '十': 10, '拾': 10, '百': 100, '佰': 100, '千': 1000, '仟': 1000 };
  var BIGS = { '万': 10000, '亿': 100000000 };
  var CN_CHARS = '零〇一二两三四五六七八九十百千万亿';
  var CN_RUN = new RegExp('[' + CN_CHARS + ']+', 'g');

  /* 「两千三」=2300、「一万二」=12000：末位数字省略了单位，要乘以前一单位的 1/10 */
  function cnToNumber(str) {
    var total = 0, section = 0, num = 0;
    var lastUnit = 0, sawDigit = false, trailing = 0;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charAt(i);
      if (DIGITS[ch] != null) {
        num = DIGITS[ch];
        sawDigit = true;
        trailing = (i === str.length - 1 && num > 0) ? num : 0;
      } else if (UNITS[ch]) {
        section += (num || 1) * UNITS[ch];
        num = 0;
        lastUnit = UNITS[ch];
        trailing = 0;
      } else if (BIGS[ch]) {
        section = (section + num) * BIGS[ch];
        total += section;
        section = 0;
        num = 0;
        lastUnit = BIGS[ch];
        trailing = 0;
      }
    }
    if (trailing > 0 && lastUnit >= 100) {
      section += trailing * (lastUnit / 10);
      num = 0;
    }
    return { value: total + section + num, ok: sawDigit };
  }

  function digitOf(ch) {
    if (ch == null) return 0;
    if (DIGITS[ch] != null) return DIGITS[ch];
    var n = parseInt(ch, 10);
    return isNaN(n) ? 0 : n;
  }

  /* ------------------------------------------------------------- 日期 */

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function dayStart(ts) {
    var d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function makeDay(y, m, d) {
    var dt = new Date(y, m - 1, d);
    if (dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return dayStart(dt.getTime());
  }

  var WEEKDAY = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 0, '天': 0 };

  function shiftDays(ts, days) {
    var d = new Date(ts);
    d.setDate(d.getDate() + days);
    return dayStart(d.getTime());
  }

  /* 相对日期：今天/昨天/前天/大前天/刚刚 */
  var RELATIVE = [
    { re: /大前天/, days: -3 },
    { re: /前天/, days: -2 },
    { re: /昨天|昨日|昨儿|昨晚/, days: -1 },
    { re: /今天|今日|今儿|今晚|刚刚|刚才/, days: 0 }
  ];

  function findDate(text, today) {
    var best = null;
    function take(match, build) {
      var hit = {
        start: match.index,
        end: match.index + match[0].length,
        raw: match[0],
        time: build(match)
      };
      if (hit.time == null) return;
      if (!best || hit.start < best.start ||
        (hit.start === best.start && hit.end > best.end)) {
        best = hit;
      }
    }

    var now = new Date(today);
    var m;

    /* 2026-10-20 / 2026年10月20日 */
    var full = /(\d{4})\s*[年\-\/]\s*(\d{1,2})\s*[月\-\/]\s*(\d{1,2})\s*[日号]?/g;
    while ((m = full.exec(text))) {
      take(m, function (mm) {
        return makeDay(+mm[1], +mm[2], +mm[3]);
      });
    }

    /* 10月20号 / 十月二十号 */
    var monthDay = /(\d{1,2}|[一二三四五六七八九十]{1,3})\s*月\s*(\d{1,2}|[一二三四五六七八九十]{1,3})\s*[日号]?/g;
    while ((m = monthDay.exec(text))) {
      take(m, function (mm) {
        var mo = /^\d+$/.test(mm[1]) ? +mm[1] : cnToNumber(mm[1]).value;
        var d = /^\d+$/.test(mm[2]) ? +mm[2] : cnToNumber(mm[2]).value;
        if (!mo || !d) return null;
        var t = makeDay(now.getFullYear(), mo, d);
        if (t == null) return null;
        if (t > dayStart(today)) {
          t = makeDay(now.getFullYear() - 1, mo, d);
        }
        return t;
      });
    }

    /* 10-20 / 10/20 */
    var slash = /(\d{1,2})\s*[\/\-]\s*(\d{1,2})(?!\d)/g;
    while ((m = slash.exec(text))) {
      var prev = text.charAt(m.index - 1);
      if (/\d/.test(prev)) continue;
      take(m, function (mm) {
        var t = makeDay(now.getFullYear(), +mm[1], +mm[2]);
        if (t == null) return null;
        if (t > dayStart(today)) t = makeDay(now.getFullYear() - 1, +mm[1], +mm[2]);
        return t;
      });
    }

    /* 20号 / 二十号 */
    var dayOnly = /(\d{1,2}|[一二三四五六七八九十]{1,3})\s*[日号]/g;
    while ((m = dayOnly.exec(text))) {
      var pv = text.charAt(m.index - 1);
      if (/\d/.test(pv)) continue;
      take(m, function (mm) {
        var d = /^\d+$/.test(mm[1]) ? +mm[1] : cnToNumber(mm[1]).value;
        if (!d || d > 31) return null;
        var t = makeDay(now.getFullYear(), now.getMonth() + 1, d);
        if (t == null) return null;
        if (t > dayStart(today)) {
          t = makeDay(now.getFullYear(), now.getMonth(), d);
        }
        return t;
      });
    }

    /* 周三 / 星期三 / 上周三 / 礼拜天 */
    var weekday = /(上上|上|本|这)?\s*(?:周|星期|礼拜)\s*([一二三四五六日天])/g;
    while ((m = weekday.exec(text))) {
      take(m, function (mm) {
        var want = WEEKDAY[mm[2]];
        if (want == null) return null;
        var base = dayStart(today);
        var cur = new Date(base).getDay();
        var delta = want - cur;
        if (delta > 0) delta -= 7;          /* 未到本周该日 → 算上一周 */
        if (mm[1] === '上') delta -= 7;
        if (mm[1] === '上上') delta -= 14;
        return shiftDays(base, delta);
      });
    }

    /* 相对日期 */
    for (var i = 0; i < RELATIVE.length; i++) {
      var rel = RELATIVE[i];
      var re = new RegExp(rel.re.source, 'g');
      while ((m = re.exec(text))) {
        (function (off) {
          take(m, function () { return shiftDays(dayStart(today), off); });
        })(rel.days);
      }
    }

    return best;
  }

  /* ------------------------------------------------------------- 金额 */

  var MULT = { '万': 10000, '千': 1000, 'w': 10000, 'W': 10000, 'k': 1000, 'K': 1000 };
  var COUNTERS = '个人次天杯份斤碗张只条件位点分秒岁节场晚';
  /* 「万一」「一点」这类词不是金额 */
  var NOT_AMOUNT = ['万一', '一点', '一定', '一般', '一样', '一直', '一起', '一边', '一共', '一下'];

  function isCounterAfter(text, index) {
    var ch = text.charAt(index);
    return ch !== '' && COUNTERS.indexOf(ch) >= 0;
  }

  /* 「88块5」→ 88.5、「3块2毛5」→ 3.25、「一块五」→ 1.5 */
  function readJiaoFen(text, end) {
    var rest = text.slice(end);
    var m = /^\s*[块元]\s*([0-9]|[一二三四五六七八九])\s*(?:[毛角]\s*([0-9]|[一二三四五六七八九])?)?/.exec(rest);
    if (m) {
      var jiao = digitOf(m[1]);
      var fen = m[2] ? digitOf(m[2]) : 0;
      return { extra: jiao / 10 + fen / 100, end: end + m[0].length };
    }
    var unit = /^\s*[块元钱]/.exec(rest);
    if (unit) return { extra: 0, end: end + unit[0].length };
    return null;
  }

  function scanAmounts(text) {
    var out = [];
    var re = new RegExp('(\\d[\\d,]*(?:\\.\\d+)?)\\s*(万|千|[wWkK])?|([' + CN_CHARS + ']+)', 'g');
    var m;
    while ((m = re.exec(text))) {
      if (m[1] != null) {
        var num = parseFloat(m[1].replace(/,/g, ''));
        if (!isFinite(num)) continue;
        var end = m.index + m[1].length;
        var value = num;
        if (m[2]) {
          value = num * MULT[m[2]];
          end = m.index + m[0].length;
        } else {
          var jf = readJiaoFen(text, end);
          if (jf) {
            value += jf.extra;
            end = jf.end;
          }
        }
        if (isCounterAfter(text, end)) continue;
        if (text.charAt(end) === '月' || text.charAt(end) === '年' || text.charAt(end) === '日') continue;
        out.push({ cents: Math.round(value * 100), start: m.index, end: end, raw: text.slice(m.index, end) });
      } else {
        var run = m[3];
        if (NOT_AMOUNT.indexOf(run) >= 0) continue;
        var cn = cnToNumber(run);
        var cnEnd = m.index + run.length;
        var cnValue = cn.value;
        var consumedUnit = false;
        var jf2 = readJiaoFen(text, cnEnd);
        if (jf2) {
          cnValue += jf2.extra;
          cnEnd = jf2.end;
          consumedUnit = true;
        } else if (/^[毛角]/.test(text.slice(cnEnd))) {
          cnValue = cnValue / 10;
          cnEnd += 1;
          consumedUnit = true;
        }
        if (!consumedUnit && run.length < 2) continue;   /* 单个「一/两」多半不是钱 */
        if (isCounterAfter(text, cnEnd)) continue;
        if (text.charAt(cnEnd) === '月' || text.charAt(cnEnd) === '年' || text.charAt(cnEnd) === '日') continue;
        if (cnValue <= 0) continue;
        out.push({
          cents: Math.round(cnValue * 100),
          start: m.index,
          end: cnEnd,
          raw: text.slice(m.index, cnEnd)
        });
      }
    }
    return out;
  }
  /* ------------------------------------------------------------- 分类 */

  var CAT_WORDS = {
    '餐饮': ['早饭', '早餐', '午饭', '午餐', '晚饭', '晚餐', '夜宵', '外卖', '食堂', '火锅',
      '烧烤', '麻辣烫', '奶茶', '咖啡', '拿铁', '美式', '面包', '水果', '超市', '零食',
      '聚餐', '吃饭', '饮料', '可乐', '麦当劳', '肯德基', '星巴克', '瑞幸', '蜜雪',
      '小吃', '饭店', '餐厅', '蛋糕', '泡面', '灌饼', '煎饼', '包子', '馒头', '炒饭',
      '米线', '螺蛳粉', '麻辣香锅', '汉堡', '披萨', '寿司', '盖饭', '牛肉面'],
    '交通': ['地铁', '公交', '打车', '滴滴', '出租车', '高铁', '火车', '机票', '飞机',
      '油费', '加油', '停车', '共享单车', '单车', '电动车', '车费', '过路费', '船票', '大巴'],
    '购物': ['淘宝', '京东', '拼多多', '天猫', '衣服', '裤子', '鞋', '外套', '耳机', '键盘',
      '鼠标', '手机', '充电器', '快递', '日用品', '纸巾', '洗发水', '洗衣液', '护肤',
      '化妆品', '文具', '书', '笔记本', '显示器', '帽子', '包'],
    '居住': ['房租', '水电', '水费', '电费', '燃气', '物业', '网费', '宽带', '话费', '流量',
      '宿舍', '空调', '家具', '被子', '床单'],
    '娱乐': ['电影', '演唱会', '展览', '看展', '游戏', '剧本杀', '密室', 'KTV', '唱歌',
      '会员', '视频会员', '健身', '游泳', '桌游', '盲盒', '球赛', '音乐节'],
    '医疗': ['药店', '挂号', '医院', '感冒', '体检', '牙医', '看病', '门诊', '药'],
    '工资': ['工资', '薪水', '月薪', '薪资', '发工资'],
    '奖金': ['奖金', '年终奖', '绩效'],
    '兼职': ['稿费', '兼职', '代课', '家教', '外包', '项目款', '翻译', '接单', '私活', '劳务'],
    '理财': ['利息', '基金', '收益', '分红', '股票', '余额宝'],
    '红包': ['红包', '压岁钱']
  };

  var CAT_TYPE = {
    '工资': INCOME, '奖金': INCOME, '兼职': INCOME, '理财': INCOME, '红包': INCOME
  };

  /* 扁平词典，长词优先，避免「电影票」被「电影」抢先 */
  var FLAT = [];
  Object.keys(CAT_WORDS).forEach(function (cat) {
    CAT_WORDS[cat].forEach(function (word) {
      FLAT.push({ word: word, cat: cat, type: CAT_TYPE[cat] == null ? EXPENSE : CAT_TYPE[cat] });
    });
  });
  FLAT.sort(function (a, b) { return b.word.length - a.word.length; });

  function detectCategory(text, categories) {
    var best = null;
    for (var i = 0; i < FLAT.length; i++) {
      var item = FLAT[i];
      if (text.indexOf(item.word) >= 0) {
        if (!best || item.word.length > best.word.length) best = item;
      }
    }
    /* 用户自建分类名本身也当关键词 */
    if (categories && categories.length) {
      for (var j = 0; j < categories.length; j++) {
        var c = categories[j];
        if (!c || !c.name || c.name.length < 2) continue;
        if (text.indexOf(c.name) >= 0) {
          if (!best || c.name.length >= best.word.length) {
            best = { word: c.name, cat: c.name, type: c.type, custom: true };
          }
        }
      }
    }
    return best;
  }

  /* ------------------------------------------------------------- 类型 */

  var INCOME_WORDS = ['收到', '收入', '进账', '到账', '到帐', '发了', '报销', '退款',
    '退回', '返现', '赚了', '挣了', '收了', '给我', '收到', '入账', '结算'];
  var EXPENSE_WORDS = ['花', '买', '付', '交', '充', '请客', '订', '缴费', '还了', '支出'];

  function detectType(text, catHit) {
    for (var i = 0; i < INCOME_WORDS.length; i++) {
      if (text.indexOf(INCOME_WORDS[i]) >= 0) return INCOME;
    }
    for (var j = 0; j < EXPENSE_WORDS.length; j++) {
      if (text.indexOf(EXPENSE_WORDS[j]) >= 0) return EXPENSE;
    }
    if (catHit) return catHit.type;
    return EXPENSE;
  }

  /* ------------------------------------------------------------- 人数 */

  var CN_NUM = { '两': 2, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };

  /* 「3 个人」「三个人」「我们仨」「AA」→ 人数；没提到就返回 0 */
  function extractPeople(text) {
    var m = /(\d{1,2}|[一两二三四五六七八九十])\s*(?:个|位|名)?\s*(?:人|个人)/.exec(text);
    var count = 0;
    if (m) {
      count = /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : (CN_NUM[m[1]] || 0);
    } else if (/仨/.test(text)) {
      count = 3;
    } else if (/AA/i.test(text)) {
      count = 2;   /* 只说了 AA 没说人数，按两人 AA 处理 */
    }
    return count >= 2 && count <= 30 ? count : 0;
  }

  /* ------------------------------------------------------------- 分句 */

  function normalize(text) {
    return String(text || '')
      .replace(/[０-９]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
      .replace(/[．]/g, '.')
      .replace(/[。、]/g, '，')
      .replace(/[；]/g, ';')
      .replace(/[：]/g, ':')
      .replace(/[\u3000\s]+/g, ' ')
      .replace(/[（(][^）)]*[）)]/g, '')
      .trim();
  }

  var WORD_SEP = /然后|还有|另外|加上|以及|顺便|紧接着|同时/;

  /* 手写切分：半角小数点与千分位逗号不能当分隔符；
     全角「，」一定是分句符（中文里它就是逗号，不可能是千分位） */
  function splitClauses(text) {
    var parts = [];
    var buf = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      var prev = text.charAt(i - 1);
      var next = text.charAt(i + 1);
      var betweenDigits = /\d/.test(prev) && /\d/.test(next);
      if ((ch === '.' || ch === ',') && betweenDigits) {
        buf += ch;
        continue;
      }
      if (ch === '.' || ch === ',' || ch === '，' || /[;!?\n\r]/.test(ch)) {
        parts.push(buf);
        buf = '';
        continue;
      }
      buf += ch;
    }
    parts.push(buf);

    var out = [];
    parts.forEach(function (part) {
      String(part).split(WORD_SEP).forEach(function (piece) {
        var p = piece.trim().replace(/^[,\s]+|[,\s]+$/g, '');
        if (p) out.push(p);
      });
    });
    return out;
  }

  function stripSpans(text, spans) {
    var out = text;
    spans.slice().sort(function (a, b) { return b.start - a.start; }).forEach(function (s) {
      out = out.slice(0, s.start) + ' ' + out.slice(s.end);
    });
    return out.replace(/\s+/g, ' ').replace(/^[\s,;:.!?、]+|[\s,;:.!?、]+$/g, '').trim();
  }

  /* --------------------------------------------------------- 单句解析 */

  function parseClause(raw, options) {
    var opts = options || {};
    var today = opts.today || Date.now();
    var text = raw.trim();
    if (!text) return null;

    var dateHit = findDate(text, today);
    var masked = dateHit ? (text.slice(0, dateHit.start) + ' ' + text.slice(dateHit.end)) : text;
    var amounts = scanAmounts(masked);

    if (!amounts.length) {
      return {
        skip: true,
        reason: '没有识别到金额',
        raw: raw,
        people: extractPeople(text)
      };
    }

    /* 多笔金额时取最大的一笔，其余留在备注里，并降低置信度 */
    var primary = amounts[0];
    for (var i = 1; i < amounts.length; i++) {
      if (amounts[i].cents > primary.cents) primary = amounts[i];
    }

    var catHit = detectCategory(masked, opts.categories);
    var type = detectType(masked, catHit);

    /* masked 已把日期挖空，金额坐标直接可用 */
    var note = stripSpans(masked, [{ start: primary.start, end: primary.end }]);
    if (catHit && note.trim() === catHit.word) note = '';
    note = note.replace(/^(收到|到账|到帐|进账|入账|收入|付了|买了|花了|交了|充了|发工资)/, '').trim();
    /* 去掉动词后如果只剩分类词（「收到红包」→「红包」），就别重复显示了 */
    if (catHit && note === catHit.word) note = '';

    var confidence = 0.95;
    var warnings = [];
    if (amounts.length > 1) {
      confidence -= 0.2;
      warnings.push('这句话里有多个金额，已取最大的一笔');
    }
    if (!catHit) {
      confidence -= 0.35;
      warnings.push('没有匹配到分类，暂记为「其他」');
    }
    if (!dateHit) confidence -= 0.05;

    var categoryName = catHit ? catHit.cat : (type === INCOME ? '其他收入' : '其他');
    var people = type === EXPENSE ? extractPeople(masked) : 0;

    return {
      type: type,
      cents: primary.cents,
      time: dateHit ? dateHit.time : dayStart(today),
      categoryName: categoryName,
      categoryWord: catHit ? catHit.word : '',
      note: note.slice(0, 120),
      dateText: dateHit ? dateHit.raw : '',
      amountText: primary.raw,
      people: people,
      perPersonCents: people ? Math.round(primary.cents / people) : primary.cents,
      confidence: Math.max(0.3, Math.round(confidence * 100) / 100),
      warnings: warnings,
      raw: raw
    };
  }

  /* ------------------------------------------------------------- 入口 */

  nl.parse = function (input, options) {
    var opts = options || {};
    var today = opts.today || Date.now();
    var text = normalize(input);
    var items = [];
    var skipped = [];
    if (!text) return { items: items, skipped: skipped };

    /* 日期会向后继承：「昨天火锅 128，打车 32」两句都算昨天 */
    var carryDate = null;

    splitClauses(text).forEach(function (clause) {
      var item = parseClause(clause, {
        today: today,
        categories: opts.categories
      });
      if (!item) return;
      if (item.skip) {
        /* 「火锅 240，3 个人」：人数写在下一个分句里，补到上一笔上 */
        var prev = items[items.length - 1];
        if (item.people >= 2 && prev && !prev.people && prev.type === EXPENSE) {
          prev.people = item.people;
          prev.perPersonCents = Math.round(prev.cents / item.people);
          return;
        }
        skipped.push(item);
        return;
      }
      if (item.dateText) carryDate = item.time;
      else if (carryDate != null) item.time = carryDate;
      items.push(item);
    });

    return { items: items, skipped: skipped };
  };

  nl.examples = [
    '昨天和室友吃火锅 128，打车 32，收到稿费 300',
    '早上咖啡 18 块，中午食堂 12',
    '10月20号交房租 1800',
    '工资到账 8000，还花呗 1200',
    '奶茶 15 块 5'
  ];

  nl.cnToNumber = cnToNumber;
  nl.scanAmounts = scanAmounts;
  nl.findDate = findDate;
  nl.normalize = normalize;
  nl.splitClauses = splitClauses;
})(typeof window !== 'undefined' ? window : globalThis);
