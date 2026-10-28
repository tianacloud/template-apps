/* ============================================================
 * holidays.js —— 节日数据库
 *  type: legal(法定·红) / traditional(传统·橙) / intl(国际/普通·蓝) / term(节气·绿)
 *  公历以 "MM-DD" 为键；农历以 {lm, ld} 匹配
 * ============================================================ */
(function (global) {
  'use strict';

  // 公历固定节日
  var solarHolidays = {
    '01-01': [{ name: '元旦', type: 'legal' }],
    '02-02': [{ name: '世界湿地日', type: 'intl' }],
    '02-10': [{ name: '国际气象节', type: 'intl' }],
    '02-14': [{ name: '情人节', type: 'intl' }],
    '03-03': [{ name: '全国爱耳日', type: 'intl' }],
    '03-05': [{ name: '学雷锋纪念日', type: 'intl' }],
    '03-08': [{ name: '妇女节', type: 'intl' }],
    '03-12': [{ name: '植树节', type: 'intl' }],
    '03-15': [{ name: '消费者权益日', type: 'intl' }],
    '03-21': [{ name: '世界森林日', type: 'intl' }],
    '03-22': [{ name: '世界水日', type: 'intl' }],
    '04-01': [{ name: '愚人节', type: 'intl' }],
    '04-07': [{ name: '世界卫生日', type: 'intl' }],
    '04-22': [{ name: '世界地球日', type: 'intl' }],
    '04-23': [{ name: '世界读书日', type: 'intl' }],
    '05-01': [{ name: '劳动节', type: 'legal' }],
    '05-04': [{ name: '青年节', type: 'intl' }],
    '05-08': [{ name: '世界红十字日', type: 'intl' }],
    '05-12': [{ name: '国际护士节', type: 'intl' }],
    '05-15': [{ name: '国际家庭日', type: 'intl' }],
    '05-20': [{ name: '网络情人节', type: 'intl' }],
    '05-31': [{ name: '世界无烟日', type: 'intl' }],
    '06-01': [{ name: '儿童节', type: 'intl' }],
    '06-05': [{ name: '世界环境日', type: 'intl' }],
    '06-06': [{ name: '全国爱眼日', type: 'intl' }],
    '06-14': [{ name: '世界献血者日', type: 'intl' }],
    '06-21': [{ name: '国际瑜伽日', type: 'intl' }],
    '06-26': [{ name: '国际禁毒日', type: 'intl' }],
    '07-01': [{ name: '建党节', type: 'intl' }],
    '07-07': [{ name: '七夕·抗战纪念日', type: 'intl' }],
    '07-11': [{ name: '世界人口日', type: 'intl' }],
    '08-01': [{ name: '建军节', type: 'intl' }],
    '08-08': [{ name: '全民健身日', type: 'intl' }],
    '08-12': [{ name: '国际青年日', type: 'intl' }],
    '08-19': [{ name: '中国医师节', type: 'intl' }],
    '09-03': [{ name: '抗战胜利纪念日', type: 'intl' }],
    '09-08': [{ name: '国际扫盲日', type: 'intl' }],
    '09-10': [{ name: '教师节', type: 'intl' }],
    '09-18': [{ name: '九一八事变纪念日', type: 'intl' }],
    '09-21': [{ name: '国际和平日', type: 'intl' }],
    '09-27': [{ name: '世界旅游日', type: 'intl' }],
    '10-01': [{ name: '国庆节', type: 'legal' }],
    '10-04': [{ name: '世界动物日', type: 'intl' }],
    '10-10': [{ name: '辛亥革命纪念日', type: 'intl' }],
    '10-16': [{ name: '世界粮食日', type: 'intl' }],
    '10-24': [{ name: '联合国日', type: 'intl' }],
    '10-31': [{ name: '万圣夜', type: 'intl' }],
    '11-08': [{ name: '记者节', type: 'intl' }],
    '11-09': [{ name: '全国消防日', type: 'intl' }],
    '11-11': [{ name: '双十一', type: 'intl' }],
    '11-20': [{ name: '世界儿童日', type: 'intl' }],
    '11-28': [{ name: '感恩节', type: 'intl' }], // 近似（美式）
    '12-01': [{ name: '世界艾滋病日', type: 'intl' }],
    '12-03': [{ name: '国际残疾人日', type: 'intl' }],
    '12-05': [{ name: '国际志愿者日', type: 'intl' }],
    '12-09': [{ name: '一二·九运动纪念日', type: 'intl' }],
    '12-10': [{ name: '世界人权日', type: 'intl' }],
    '12-13': [{ name: '南京大屠杀死难者国家公祭日', type: 'intl' }],
    '12-20': [{ name: '澳门回归纪念日', type: 'intl' }],
    '12-24': [{ name: '平安夜', type: 'intl' }],
    '12-25': [{ name: '圣诞节', type: 'intl' }]
  };

  // 农历固定节日（lm: 农历月, ld: 农历日，均非闰月匹配）
  var lunarHolidays = [
    { lm: 1, ld: 1, name: '春节', type: 'legal' },
    { lm: 1, ld: 15, name: '元宵节', type: 'traditional' },
    { lm: 2, ld: 2, name: '龙抬头', type: 'traditional' },
    { lm: 5, ld: 5, name: '端午节', type: 'legal' },
    { lm: 7, ld: 7, name: '七夕', type: 'traditional' },
    { lm: 7, ld: 15, name: '中元节', type: 'traditional' },
    { lm: 8, ld: 15, name: '中秋节', type: 'legal' },
    { lm: 9, ld: 9, name: '重阳节', type: 'traditional' },
    { lm: 10, ld: 1, name: '寒衣节', type: 'traditional' },
    { lm: 12, ld: 8, name: '腊八节', type: 'traditional' },
    { lm: 12, ld: 23, name: '北方小年', type: 'traditional' },
    { lm: 12, ld: 24, name: '南方小年', type: 'traditional' },
    { lm: 12, ld: 30, name: '除夕', type: 'legal' }
  ];

  global.Holidays = {
    solarHolidays: solarHolidays,
    lunarHolidays: lunarHolidays,
    // 返回某公历日期的所有节日 [{name,type}]
    getHolidays: function (y, m, d) {
      var list = [];
      var key = (m < 10 ? '0' + m : '' + m) + '-' + (d < 10 ? '0' + d : '' + d);
      if (solarHolidays[key]) {
        solarHolidays[key].forEach(function (h) { list.push(h); });
      }
      var l = Lunar.solarToLunar(y, m, d);
      lunarHolidays.forEach(function (h) {
        if (!l.isLeap && l.month === h.lm && l.day === h.ld) list.push(h);
      });
      return list;
    }
  };
})(window);
