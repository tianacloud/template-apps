/* ============================================================
 * lunar.js —— 农历 + 二十四节气 转换引擎（1900-2100）
 * 纯前端、零依赖、可离线运行
 * 数据基于公开的 lunarInfo 算法
 * ============================================================ */
(function (global) {
  'use strict';

  // 1900-2100 每年农历信息（位运算编码大小月与闰月）
  var lunarInfo = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
    0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
    0x0d520
  ];

  // 二十四节气计算基准（分钟偏移）
  var sTermInfo = [
    0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551,
    218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210,
    440795, 462224, 483532, 504758
  ];

  var termNames = [
    '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满',
    '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
    '立冬', '小雪', '大雪', '冬至'
  ];

  var Gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var Zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var Animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  var lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
  var lunarDays = [
    '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
  ];

  function lYearDays(y) {
    var sum = 348;
    for (var i = 0x8000; i > 0x8; i >>= 1) sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
    return sum + leapDays(y);
  }
  function leapDays(y) {
    if (leapMonth(y)) return (lunarInfo[y - 1900] & 0x10000) ? 30 : 29;
    return 0;
  }
  function leapMonth(y) { return lunarInfo[y - 1900] & 0xf; }
  function monthDays(y, m) { return (lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29; }

  // 公历 -> 农历
  function solarToLunar(y, m, d) {
    var baseDate = Date.UTC(1900, 0, 31);
    var objDate = Date.UTC(y, m - 1, d);
    var offset = Math.round((objDate - baseDate) / 86400000);
    var temp = 0, lunarYear = 1900;
    for (lunarYear = 1900; lunarYear < 2101 && offset > 0; lunarYear++) {
      temp = lYearDays(lunarYear);
      offset -= temp;
    }
    if (offset < 0) { offset += temp; lunarYear--; }
    var leap = leapMonth(lunarYear);
    var isLeap = false;
    var lunarMonth;
    for (lunarMonth = 1; lunarMonth < 13 && offset > 0; lunarMonth++) {
      if (leap > 0 && lunarMonth === (leap + 1) && !isLeap) {
        --lunarMonth; isLeap = true; temp = leapDays(lunarYear);
      } else {
        temp = monthDays(lunarYear, lunarMonth);
      }
      if (isLeap && lunarMonth === (leap + 1)) isLeap = false;
      offset -= temp;
    }
    if (offset === 0 && leap > 0 && lunarMonth === leap + 1) {
      if (isLeap) { isLeap = false; } else { isLeap = true; --lunarMonth; }
    }
    if (offset < 0) { offset += temp; --lunarMonth; }
    var lunarDay = offset + 1;
    return {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      isLeap: isLeap
    };
  }

  // 农历中文表示
  function lunarText(l) {
    var m = (l.isLeap ? '闰' : '') + lunarMonths[l.month - 1] + '月';
    var d = lunarDays[l.day - 1] || ('#' + l.day);
    return m + d;
  }
  function lunarMonthDay(l) {
    // 用于节日匹配：返回 {lm, ld}
    return { lm: l.month, ld: l.day, isLeap: l.isLeap };
  }

  // 农历生肖年
  function lunarAnimal(l) { return Animals[(l.year - 4) % 12]; }
  // 农历干支年
  function lunarGanZhiYear(l) {
    var g = (l.year - 4) % 10, z = (l.year - 4) % 12;
    return Gan[g] + Zhi[z];
  }

  // 二十四节气：返回当天节气名，无则返回 null
  function getTerm(y, n) {
    var calday = new Date((31556925974.7 * (y - 1900) + sTermInfo[n] * 60000) + Date.UTC(1900, 0, 6, 2, 5));
    return calday.getUTCDate();
  }
  function solarTerm(y, m, d) {
    var idx = (m - 1) * 2;
    if (getTerm(y, idx) === d) return termNames[idx];
    if (getTerm(y, idx + 1) === d) return termNames[idx + 1];
    return null;
  }

  global.Lunar = {
    solarToLunar: solarToLunar,
    lunarText: lunarText,
    lunarMonthDay: lunarMonthDay,
    lunarAnimal: lunarAnimal,
    lunarGanZhiYear: lunarGanZhiYear,
    solarTerm: solarTerm,
    termNames: termNames
  };
})(window);
