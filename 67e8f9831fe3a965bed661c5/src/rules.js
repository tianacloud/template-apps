/**
 * ============================================================================
 * 车辆年检提醒工具 —— 核心规则引擎（纯函数，无 DOM 依赖）
 * ----------------------------------------------------------------------------
 * 设计要点：
 * 1. UMD 包装，浏览器（window.VIR）与 Node（require）双端可直接运行；
 * 2. 判定过程全部记录在 result.steps 中，供界面展示"从输入到结论"的推演逻辑；
 * 3. 规则以数据（spec）方式描述，法规更新时只需改 getCycleSpec()；
 * 4. 所有日期按"自然日"计算（忽略时分秒），日期仅作估算，官方有效期以交管记录为准。
 *
 * 法规依据（整理自公开规定，截至 2026-10）：
 * - 《机动车登记规定》（公安部令第 164 号，2022-04-01 施行）关于定期安全技术检验期限；
 * - 《道路交通安全法实施条例》有关机动车定期检验规定；
 * - 《机动车安全技术检验规程》GB 38900 及配套检验方法标准；
 * - 2022 年机动车检验制度改革有关规定。
 *
 * 免责说明：本工具仅用于到期提醒推演，最终检验结论以公安交管部门业务系统为准。
 * ============================================================================
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VIR = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ============================ 1. 基础时间工具 ============================ */

  const MS_PER_DAY = 86400000;

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  /** 统一格式化为 YYYY-MM-DD */
  function fmtDate(d) {
    if (!d) return '';
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  /** 取当天零点，去除时分秒影响 */
  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /**
   * 解析日期字符串，支持 YYYY-MM-DD / YYYY/M/D / YYYY.M.D / YYYY年M月D日
   * 非法日期（含 2026-02-30 这类不存在的日期）返回 null
   */
  function parseDate(value) {
    if (value instanceof Date) return startOfDay(value);
    if (value === null || value === undefined || value === '') return null;
    const m = /^(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})\s*日?$/.exec(String(value).trim());
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const da = Number(m[3]);
    if (mo < 0 || mo > 11 || da < 1 || da > 31) return null;
    const d = new Date(y, mo, da);
    // 回读校验，排除"自动进位"型非法日期
    if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== da) return null;
    return d;
  }

  /** 加月份，遇到月末自动收敛（如 1-31 + 1 月 → 2-28/29） */
  function addMonths(d, months) {
    const y = d.getFullYear();
    const m = d.getMonth() + months;
    const day = d.getDate();
    const target = new Date(y, m, 1);
    const daysInMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(day, daysInMonth));
    return target;
  }

  function addYears(d, years) { return addMonths(d, years * 12); }

  /** a - b 的自然日天数（a 在后为正） */
  function diffDays(a, b) {
    return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / MS_PER_DAY);
  }

  /** 已满周年数（整年数），用于 6 年 / 10 年 等阈值判定 */
  function fullYears(from, to) {
    let y = to.getFullYear() - from.getFullYear();
    if (addYears(from, y).getTime() > to.getTime()) y -= 1;
    return y;
  }

  /** 车龄文本，如 "8年4个月" */
  function ageText(from, to) {
    const y = fullYears(from, to);
    const anniv = addYears(from, y);
    let m = 0;
    while (m < 11 && addMonths(anniv, m + 1).getTime() <= to.getTime()) m += 1;
    return y + '年' + (m > 0 ? m + '个月' : '整');
  }

  /* ====================== 2. 车辆类型 / 使用性质定义 ====================== */

  const VEHICLE_TYPES = [
    { value: 'passenger', label: '载客汽车（轿车 / SUV / 客车等）' },
    { value: 'truck', label: '载货汽车' },
    { value: 'trailer', label: '挂车' },
    { value: 'motorcycle', label: '摩托车' },
    { value: 'schoolBus', label: '校车' },
    { value: 'specialVehicle', label: '专项作业车' },
    { value: 'tractor', label: '拖拉机 / 低速载货汽车' }
  ];

  const USAGE_NATURES = [
    { value: 'nonOperating', label: '非营运' },
    { value: 'operating', label: '营运' },
    { value: 'operatingToNon', label: '营转非' },
    { value: 'nonToOperating', label: '非营转营' }
  ];

  /** 需要填写核定载人数的车辆类型 */
  const SEATS_REQUIRED_TYPES = ['passenger', 'schoolBus'];

  /**
   * 检验周期规则表（按车辆类型 + 使用性质 + 车龄阈值划分）
   * thresholdYears：检验周期变化的年限
   * cycleBefore / cycleAfter：阈值前后的检验周期（月）
   * exemptable：是否可能适用免上线政策
   */
  function getCycleSpec(type, usage, seats, isDangerous) {
    const operating = usage === 'operating' || usage === 'nonToOperating';
    if (type === 'passenger' && !operating && Number(seats) <= 9) return {regime:'非营运小微型载客汽车（符合适用条件）',thresholdYears:10,cycleBefore:24,cycleAfter:12,exemptable:true,basis:'10 年内每两年申领检验标志，第 6、10 年上线；超过 10 年每年检验。'};
    if (type === 'motorcycle') return {regime:'摩托车（符合适用条件）',thresholdYears:10,cycleBefore:24,cycleAfter:12,exemptable:true,basis:'10 年内每两年申领检验标志，第 6、10 年上线；超过 10 年每年检验。'};
    if (type === 'passenger' && operating) return {regime:'营运载客汽车',thresholdYears:5,cycleBefore:12,cycleAfter:6,exemptable:false,basis:'5 年以内每年检验；达到 5 年后每半年检验。'};
    if (type === 'truck' && isDangerous) return {regime:'危险货物运输车辆',fixedMonths:6,exemptable:false,basis:'每半年检验。'};
    if (type === 'truck' || type === 'trailer' || type === 'passenger') return {regime:type === 'passenger'?'大型、中型非营运载客汽车':'载货汽车或挂车',thresholdYears:10,cycleBefore:12,cycleAfter:6,exemptable:false,basis:'10 年以内每年检验；达到 10 年后每半年检验。'};
    if (type === 'schoolBus') return {regime:'校车',fixedMonths:6,exemptable:false,basis:'每半年检验；具体以校车标牌和登记信息为准。'};
    return {regime:'其他机动车',fixedMonths:12,exemptable:false,basis:'一般机动车每年检验；特殊车辆请咨询登记地交管部门。'};
  }

  const RULE_TABLE = [
    {type:'符合条件的非营运小微型载客汽车、摩托车',cycle:'10 年内每两年申领标志，第 6、10 年上线；超过 10 年每年检验',basis:'2022 年车检改革；面包车和特殊情形除外'},
    {type:'营运载客汽车',cycle:'5 年内每年；达到 5 年每半年',basis:'机动车检验规定'},
    {type:'载货汽车、大型中型非营运载客汽车',cycle:'10 年内每年；达到 10 年每半年',basis:'机动车检验规定'},
    {type:'危险货物运输车辆 / 校车',cycle:'每半年',basis:'以登记信息及专项规定为准'},
    {type:'其他机动车',cycle:'一般每年',basis:'特殊车辆请向交管部门核实'}
  ];

  /* ============================ 3. 输入校验 ============================ */

  const PLATE_PROVINCES = '京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领学港澳';
  const PLATE_RE = new RegExp('^[' + PLATE_PROVINCES + '][A-Z][A-Z0-9]{5,7}$');

  /**
   * 校验用户输入，返回错误数组 [{field, message}]
   * @param {object} input 表单原始输入
   * @param {Date}   today 计算基准日
   */
  function validateInput(input, today) {
    const errors = [];
    const base = today || startOfDay(new Date());

    // --- 车牌号：省份简称 + 字母 + 5~7 位（新能源多 1 位），挂车可带"挂"后缀 ---
    const plate = String(input.plate || '').trim().toUpperCase().replace(/\s|·/g, '');
    if (!plate) {
      errors.push({ field: 'plate', message: '请输入车牌号' });
    } else if (plate.endsWith('挂')) {
      if (!new RegExp('^[' + PLATE_PROVINCES + '][A-Z][A-Z0-9]{4,6}挂$').test(plate)) {
        errors.push({ field: 'plate', message: '挂车号牌格式有误，应为"省份简称+字母+4~6 位+挂"，例如 冀A1234挂' });
      }
    } else if (!PLATE_RE.test(plate)) {
      errors.push({
        field: 'plate',
        message: '车牌号格式不正确：应为"省份简称+字母+5~7 位"，例如 京A12345、粤BD12345（新能源 6 位）'
      });
    }

    // --- 车辆类型 / 使用性质 ---
    if (!input.vehicleType || !VEHICLE_TYPES.some((t) => t.value === input.vehicleType)) {
      errors.push({ field: 'vehicleType', message: '请选择车辆类型' });
    }
    if (!input.usage || !USAGE_NATURES.some((u) => u.value === input.usage)) {
      errors.push({ field: 'usage', message: '请选择车辆使用性质' });
    }

    // --- 核定载人数（载客汽车 / 校车必填）---
    if (SEATS_REQUIRED_TYPES.includes(input.vehicleType)) {
      const seats = Number(input.seats);
      if (input.seats === '' || input.seats === null || input.seats === undefined || Number.isNaN(seats)) {
        errors.push({ field: 'seats', message: '请填写核定载人数（用于判断小型/中型载客汽车）' });
      } else if (!Number.isInteger(seats) || seats < 1 || seats > 99) {
        errors.push({ field: 'seats', message: '核定载人数需为 1~99 之间的整数' });
      }
    }

    if (!input.officialExpiryDate && input.usage === 'operatingToNon') errors.push({field:'usage', message:'营转非车辆适用规则可能不同，请向交管部门核实，暂不能估算。'});
    if (!input.officialExpiryDate && (input.vehicleType === 'motorcycle' || (input.vehicleType === 'passenger' && input.usage === 'nonOperating' && Number(input.seats) <= 9)) && input.eligibility !== 'confirmed') errors.push({field:'eligibility', message:'请确认符合所列条件；不确定或不符合时请向交管部门核实。'});
    if (!input.officialExpiryDate && (input.vehicleType === 'trailer' || input.vehicleType === 'specialVehicle' || input.vehicleType === 'tractor')) errors.push({field:'vehicleType', message:'该车辆可能适用专项规则，暂不能准确估算，请向交管部门核实。'});

    if (input.officialExpiryDate && !parseDate(input.officialExpiryDate)) errors.push({field:'officialExpiryDate', message:'请输入合法的检验有效期日期。'});

    // --- 首次登记日期 ---
    const firstReg = parseDate(input.firstRegDate);
    if (!input.firstRegDate) {
      errors.push({ field: 'firstRegDate', message: '请选择车辆首次登记日期' });
    } else if (!firstReg) {
      errors.push({ field: 'firstRegDate', message: '首次登记日期格式不合法，请使用 YYYY-MM-DD' });
    } else if (firstReg.getTime() > base.getTime()) {
      errors.push({ field: 'firstRegDate', message: '首次登记日期不能晚于判定基准日' });
    } else if (firstReg.getFullYear() < 1990) {
      errors.push({ field: 'firstRegDate', message: '首次登记日期早于 1990 年，请核对输入' });
    }

    // --- 上次年检日期（可选）---
    let lastInsp = null;
    if (input.lastInspectionDate) {
      lastInsp = parseDate(input.lastInspectionDate);
      if (!lastInsp) {
        errors.push({ field: 'lastInspectionDate', message: '上次年检日期格式不合法，请使用 YYYY-MM-DD' });
      } else if (lastInsp.getTime() > base.getTime()) {
        errors.push({ field: 'lastInspectionDate', message: '上次年检日期不能晚于判定基准日' });
      } else if (firstReg && lastInsp.getTime() < firstReg.getTime()) {
        errors.push({ field: 'lastInspectionDate', message: '上次年检日期不能早于首次登记日期' });
      }
    }

    // --- 判定方式与必填联动 ---
    const method = input.method || 'auto';
    if (!['auto', 'lastInspection', 'firstRegistration'].includes(method)) {
      errors.push({ field: 'method', message: '未知的判定方式' });
    } else if (!input.officialExpiryDate && method === 'lastInspection' && !lastInsp) {
      errors.push({ field: 'lastInspectionDate', message: '选择"按上次年检时间推算"时，必须填写上次年检日期' });
    }

    // --- 提醒阈值 ---
    const warnDays = Number(input.warnDays);
    if (Number.isNaN(warnDays) || warnDays < 0 || warnDays > 365) {
      errors.push({ field: 'warnDays', message: '提醒阈值需为 0~365 之间的天数' });
    }

    return errors;
  }

  /* ====================== 4. 检验周期与到期日推算 ====================== */

  /** 某次检验日对应的下一检验周期（月）；摩托车走专用排期 */
  function cycleMonthsAt(spec, firstReg, date) {
    if (spec.fixedMonths) return spec.fixedMonths;
    return fullYears(firstReg, date) < spec.thresholdYears ? spec.cycleBefore : spec.cycleAfter;
  }
  function nextDueFromInspection(spec, firstReg, date) { return addMonths(date, cycleMonthsAt(spec, firstReg, date)); }
  function motorcycleSchedule(firstReg, count) { const out=[]; for (let y=2;y<=10;y+=2) out.push(addYears(firstReg,y)); for(let y=11;y<11+(count||40);y++) out.push(addYears(firstReg,y)); return out; }
  function buildDueSequence(spec, firstReg, count) { const out=[]; let d=firstReg; for(let i=0;i<(count||80);i++){d=nextDueFromInspection(spec,firstReg,d);out.push(d);} return out; }
  function getExemption(spec, firstReg, baseDate) { return {applicable:!!spec.exemptable,active:false,endDate:spec.exemptable?addYears(firstReg,10):null,reason:spec.exemptable?'第 2、4、8 年可免上线；实际适用条件由交管部门核实。':'本类别按相应规定上线检验。'}; }
  function evaluate(input, options) {
    const baseDate=parseDate(options && options.today)||startOfDay(new Date());
    const errors=validateInput(input,baseDate); if(errors.length) return {ok:false,errors};
    const first=parseDate(input.firstRegDate), last=parseDate(input.lastInspectionDate), age=fullYears(first,baseDate);
    const suppliedExpiry=parseDate(input.officialExpiryDate);
    const spec=getCycleSpec(input.vehicleType,input.usage,Number(input.seats),!!input.isDangerous);
    if (suppliedExpiry && (input.usage === 'operatingToNon' || input.eligibility !== 'confirmed' || ['trailer','specialVehicle','tractor'].includes(input.vehicleType))) { spec.basis='此情形的周期须向交管部门核实，提醒使用自行填写的有效期。'; spec.regime='具体规则待核实'; }
    const seq=buildDueSequence(spec,first,120); const method=input.method||'auto';
    const useLast=method==='lastInspection'||(method==='auto' && last);
    const due=suppliedExpiry || (useLast?nextDueFromInspection(spec,first,last):(seq.find(d=>d.getTime()>=baseDate.getTime())||seq[seq.length-1]));
    const days=diffDays(due,baseDate), warnDays=Number(input.warnDays), months=cycleMonthsAt(spec,first,useLast?last:baseDate);
    const typeLabel=VEHICLE_TYPES.find(x=>x.value===input.vehicleType).label, usageLabel=USAGE_NATURES.find(x=>x.value===input.usage).label;
    const sourceLabel=suppliedExpiry?'按用户填写的有效期提醒':useLast?'按上次检验日估算':'按登记周期估算';
    const status=days<0?'overdue':days<=warnDays?'expiring':'valid';
    const statusLabel=suppliedExpiry?(days<0?'填写日期已过':days<=warnDays?'填写日期临近':'填写日期'):(days<0?'估算已到期':days<=warnDays?'估算临期':'估算日期');
    const next=seq.find(d=>d.getTime()>due.getTime());
    const warnings=['请在交管 12123 或行驶证上核实有效期；本页面不能证明车辆当前检验有效。', suppliedExpiry?'提醒使用自行填写的日期，请确认其与官方记录一致。':'提前检验、逾期、变更用途和特殊车辆等可能影响有效期，不能仅用上次检验日确定官方到期日。'];
    const exemption=getExemption(spec,first,baseDate); if(suppliedExpiry && spec.regime==='具体规则待核实') exemption.reason='具体适用条件和是否需上线请向交管部门核实。';
    return {ok:true,input:{plate:String(input.plate).trim().toUpperCase(),vehicleType:input.vehicleType,vehicleTypeLabel:typeLabel,usage:input.usage,usageLabel,seats:Number(input.seats)||null,warnDays},baseDate:fmtDate(baseDate),age:{years:age,text:ageText(first,baseDate)},spec:{regime:spec.regime,basis:spec.basis,thresholdYears:spec.thresholdYears||null},cycle:{months:spec.regime==='具体规则待核实'?'待核实':months,text:spec.regime==='具体规则待核实'?'具体周期待核实':months+' 个月（估算周期）'},exemption:{applicable:exemption.applicable,active:false,endDate:exemption.endDate?fmtDate(exemption.endDate):'',reason:exemption.reason},due:{date:fmtDate(due),sourceLabel,periodDue:fmtDate(due),nextAfterThis:next?fmtDate(next):''},days:{raw:days,remaining:Math.max(days,0),overdue:Math.max(-days,0),isOverdue:days<0},status,statusLabel,statusTone:days<0?'danger':days<=warnDays?'warn':'info',needOnSite:null,inspectNote:'需根据车辆情况及官方记录核实',warnings,advice:['先核对官方检验有效期和是否需要上线，再安排申领或检验。'],timeline:[{date:fmtDate(first),label:'首次登记',type:'start'},...(last?[{date:fmtDate(last),label:'上次检验',type:'last'}]:[]),{date:fmtDate(due),label:suppliedExpiry?'填写日期':'估算日期',type:'due'}],steps:[{title:'输入与适用条件',detail:typeLabel+' · '+usageLabel+'；'+spec.regime},{title:'周期规则',detail:spec.basis},{title:'日期估算',detail:sourceLabel+'：'+fmtDate(due),formula:'估算日期与官方有效期可能不同'}]};
  }

  /* ============================ 6. 导出 ============================ */

  return {
    VEHICLE_TYPES,
    USAGE_NATURES,
    SEATS_REQUIRED_TYPES,
    RULE_TABLE,
    parseDate,
    fmtDate,
    addMonths,
    addYears,
    diffDays,
    fullYears,
    ageText,
    getCycleSpec,
    getExemption,
    buildDueSequence,
    nextDueFromInspection,
    motorcycleSchedule,
    validateInput,
    evaluate
  };
});
