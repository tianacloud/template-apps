/**
 * ============================================================================
 * 车辆年检提醒工具 —— 核心规则引擎（纯函数，无 DOM 依赖）
 * ----------------------------------------------------------------------------
 * 设计要点：
 * 1. UMD 包装，浏览器（window.VIR）与 Node（require）双端可直接运行；
 * 2. 判定过程全部记录在 result.steps 中，供界面展示"从输入到结论"的推演逻辑；
 * 3. 规则以数据（spec）方式描述，法规更新时只需改 getCycleSpec()；
 * 4. 所有日期按"自然日"计算（忽略时分秒），到期日与检验有效期对齐。
 *
 * 法规依据（整理自公开规定，截至 2026-10）：
 * - 《机动车登记规定》（公安部令第 164 号，2022-04-01 施行）关于定期安全技术检验期限；
 * - 《道路交通安全法实施条例》第九十二条（机动车定期检验）；
 * - 《机动车安全技术检验规程》GB 38900 及配套检验方法标准；
 * - 小型/微型载客汽车 6 年内（含第 6 年）免检政策。
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
   * thresholdYears：达到该年限后检验周期缩短为 12 个月（每年 1 次）
   * cycleBefore / cycleAfter：阈值前后的检验周期（月）
   * exemptable：是否适用"6 年内免检"政策
   */
  function getCycleSpec(type, usage, seats, isDangerous) {
    switch (type) {
      case 'passenger': {
        const isOperating = usage === 'operating' || usage === 'nonToOperating';
        if (isOperating) {
          // 营运载客汽车：5 年以内每 2 年 1 次，5 年以上每年 1 次
          return {
            regime: '营运载客汽车',
            thresholdYears: 5,
            cycleBefore: 24,
            cycleAfter: 12,
            exemptable: false,
            basis: '营运载客汽车：5 年以内每 2 年检验 1 次，5 年以上每年检验 1 次。'
          };
        }
        if (Number(seats) <= 9) {
          // 小型、微型载客汽车：6 年内（含第 6 年）可免检，6 年以上每年 1 次
          return {
            regime: '小型、微型载客汽车（9 座以下非营运）',
            thresholdYears: 6,
            cycleBefore: 24,
            cycleAfter: 12,
            exemptable: true,
            basis: '小型、微型载客汽车：登记 6 年以内（含第 6 年）可申请免检；6 年以上每年检验 1 次。'
          };
        }
        // 其他非营运载客汽车：10 年以内每 2 年，10 年以上每年
        return {
          regime: '非营运载客汽车（10 座及以上）',
          thresholdYears: 10,
          cycleBefore: 24,
          cycleAfter: 12,
          exemptable: false,
          basis: '非营运载客汽车：10 年以内每 2 年检验 1 次，超过 10 年每年检验 1 次。'
        };
      }
      case 'truck': {
        if (isDangerous) {
          // 危险货物运输车辆：检验有效期 6 个月
          return {
            regime: '危险货物运输车辆',
            fixedMonths: 6,
            exemptable: false,
            basis: '危险货物运输车辆检验有效期 6 个月，即每半年检验 1 次。'
          };
        }
        return {
          regime: '载货汽车',
          thresholdYears: 10,
          cycleBefore: 24,
          cycleAfter: 12,
          exemptable: false,
          basis: '载货汽车：10 年以内每 2 年检验 1 次，超过 10 年每年检验 1 次。'
        };
      }
      case 'trailer':
        return {
          regime: '挂车',
          thresholdYears: 10,
          cycleBefore: 24,
          cycleAfter: 12,
          exemptable: false,
          basis: '挂车按载货汽车周期执行：10 年以内每 2 年检验 1 次，超过 10 年每年检验 1 次。'
        };
      case 'motorcycle':
        // 摩托车为特殊排期：第 3 年、第 5 年、第 6 年各 1 次，此后每年 1 次
        return {
          regime: '摩托车',
          motorcycle: true,
          exemptable: false,
          basis: '摩托车：自注册之日起第 3 年、第 5 年、第 6 年各检验 1 次，此后每年检验 1 次。'
        };
      case 'schoolBus':
        return {
          regime: '校车',
          fixedMonths: 12,
          exemptable: false,
          basis: '校车每年检验 1 次。'
        };
      case 'specialVehicle':
        return {
          regime: '专项作业车',
          fixedMonths: 12,
          exemptable: false,
          basis: '专项作业车每年检验 1 次。'
        };
      case 'tractor':
        return {
          regime: '拖拉机、低速载货汽车',
          fixedMonths: 12,
          exemptable: false,
          basis: '拖拉机、低速载货汽车每年检验 1 次。'
        };
      default:
        return {
          regime: '未知车辆类型',
          fixedMonths: 12,
          exemptable: false,
          basis: '未识别的车辆类型，按每年检验 1 次保守处理。'
        };
    }
  }

  /** 用于界面"规则速查表"展示 */
  const RULE_TABLE = [
    { type: '小型、微型载客汽车（9 座以下非营运）', cycle: '6 年内免检（每 2 年一周期，可申请免检）；满 6 年后每年 1 次', basis: '小型、微型载客汽车 6 年内（含第 6 年）免检政策' },
    { type: '非营运载客汽车（10 座及以上）', cycle: '10 年以内每 2 年 1 次；超过 10 年每年 1 次', basis: '《机动车登记规定》定期检验期限' },
    { type: '营运载客汽车', cycle: '5 年以内每 2 年 1 次；5 年以上每年 1 次', basis: '《机动车登记规定》定期检验期限' },
    { type: '载货汽车', cycle: '10 年以内每 2 年 1 次；超过 10 年每年 1 次', basis: '《机动车登记规定》定期检验期限' },
    { type: '危险货物运输车辆', cycle: '检验有效期 6 个月（每半年 1 次）', basis: '危险货物运输车辆专项要求' },
    { type: '挂车', cycle: '10 年以内每 2 年 1 次；超过 10 年每年 1 次', basis: '与载货汽车周期一致' },
    { type: '摩托车', cycle: '第 3 年、第 5 年、第 6 年各 1 次，此后每年 1 次', basis: '《机动车登记规定》定期检验期限' },
    { type: '校车 / 专项作业车 / 拖拉机（低速载货汽车）', cycle: '每年检验 1 次', basis: '《机动车登记规定》定期检验期限' }
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
    } else if (method === 'lastInspection' && !lastInsp) {
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
  function cycleMonthsAt(spec, firstReg, inspectionDate) {
    if (spec.fixedMonths) return spec.fixedMonths;
    if (spec.motorcycle) return 12;
    const age = fullYears(firstReg, inspectionDate);
    return age < spec.thresholdYears ? spec.cycleBefore : spec.cycleAfter;
  }

  /**
   * 由"某次检验日"推算下一次到期日
   * 若检验周期跨过了年限阈值（如 6 年 / 10 年），按阈值后的年度周期提前到期
   */
  function nextDueFromInspection(spec, firstReg, inspectionDate) {
    const months = cycleMonthsAt(spec, firstReg, inspectionDate);
    let due = addMonths(inspectionDate, months);

    if (!spec.fixedMonths && !spec.motorcycle && months > 12) {
      const thresholdDate = addYears(firstReg, spec.thresholdYears);
      const crosses = inspectionDate.getTime() < thresholdDate.getTime() && due.getTime() > thresholdDate.getTime();
      if (crosses) {
        const yearlyDue = addMonths(thresholdDate, 12);
        if (yearlyDue.getTime() < due.getTime()) due = yearlyDue;
      }
    }
    return due;
  }

  /** 摩托车专用检验排期：第 3 年、第 5 年、第 6 年各 1 次，此后每年 1 次（count 为逐年项数量） */
  function motorcycleSchedule(firstReg, count) {
    const list = [addYears(firstReg, 3), addYears(firstReg, 5), addYears(firstReg, 6)];
    const years = count || 40;
    for (let y = 7; y < 7 + years; y += 1) list.push(addYears(firstReg, y));
    return list;
  }

  /** 生成自首次登记起的完整检验周期序列（用于"按首次登记推算"与一致性核对） */
  function buildDueSequence(spec, firstReg, count) {
    const n = count || 40;
    if (spec.motorcycle) return motorcycleSchedule(firstReg, n);
    const seq = [];
    let cursor = startOfDay(firstReg);
    for (let i = 0; i < n; i += 1) {
      cursor = nextDueFromInspection(spec, firstReg, cursor);
      seq.push(cursor);
    }
    return seq;
  }

  /**
   * 免检判定
   * 依据：小型、微型载客汽车登记 6 年以内（含第 6 年）可申请免检上线检验
   */
  function getExemption(spec, firstReg, baseDate) {
    if (!spec.exemptable) {
      return {
        applicable: false,
        active: false,
        endDate: null,
        reason: '该车辆类型不适用"6 年内免检"政策（仅小型、微型载客汽车适用）'
      };
    }
    const endDate = addYears(firstReg, 6);
    // 基准日早于或等于免检截止日 → 仍在免检期内（diffDays(baseDate, endDate) <= 0）
    const active = diffDays(baseDate, endDate) <= 0;
    return {
      applicable: true,
      active: active,
      endDate: endDate,
      reason: active
        ? '车龄未满 6 年，登记 6 年以内（含第 6 年）可申请免检上线检验'
        : '车龄已满 6 年，免检政策不再适用，需按周期上线检验'
    };
  }

  /* ========================= 5. 主判定流程 ========================= */

  /**
   * 车辆年检到期判定主函数
   * @param {object} input  表单输入
   * @param {object} options { today, warnDays }
   * @returns {object} 判定结果（含推演步骤 steps）
   */
  function evaluate(input, options) {
    const opts = options || {};
    const baseDate = parseDate(opts.today) || startOfDay(new Date());
    const warnDays = opts.warnDays != null ? Number(opts.warnDays) : 30;

    const errors = validateInput(input, baseDate);
    if (errors.length) {
      return { ok: false, errors: errors, steps: [], timeline: [], warnings: [], advice: [] };
    }

    const steps = [];
    const warnings = [];
    const advice = [];
    const push = (title, detail, formula) => steps.push({ index: steps.length + 1, title, detail, formula: formula || '' });

    /* 步骤 1：输入解析 */
    const plate = String(input.plate || '').trim().toUpperCase().replace(/\s|·/g, '');
    const typeLabel = VEHICLE_TYPES.find((t) => t.value === input.vehicleType).label;
    const usageLabel = USAGE_NATURES.find((u) => u.value === input.usage).label;
    const firstReg = parseDate(input.firstRegDate);
    const lastInsp = input.lastInspectionDate ? parseDate(input.lastInspectionDate) : null;
    const seats = input.vehicleType === 'truck' ? null : Number(input.seats || 0);

    push(
      '输入解析与校验',
      `车牌 ${plate}、车辆类型「${typeLabel}」、使用性质「${usageLabel}」` +
        (seats ? `、核定载人数 ${seats} 人` : '') +
        `、首次登记日期 ${fmtDate(firstReg)}` +
        (lastInsp ? `、上次年检日期 ${fmtDate(lastInsp)}` : '、未填写上次年检日期'),
      '校验通过：无空值、日期合法、车牌格式合法、日期先后关系正确'
    );

    /* 步骤 2：车龄计算 */
    const ageYears = fullYears(firstReg, baseDate);
    const ageTextValue = ageText(firstReg, baseDate);
    push(
      '车龄计算',
      `首次登记 ${fmtDate(firstReg)} → 判定基准日 ${fmtDate(baseDate)}，车龄 ${ageTextValue}（已满 ${ageYears} 年）`,
      `车龄 = 基准日 ${fmtDate(baseDate)} − 首次登记日 ${fmtDate(firstReg)} = ${ageTextValue}`
    );

    /* 步骤 3：检验周期判定 */
    const spec = getCycleSpec(input.vehicleType, input.usage, seats, !!input.isDangerous);
    let cycleMonths;
    let cycleText;
    if (spec.motorcycle) {
      cycleMonths = 12;
      cycleText = '特殊排期（第 3 / 5 / 6 年各 1 次，此后每年 1 次）';
    } else if (spec.fixedMonths) {
      cycleMonths = spec.fixedMonths;
      cycleText = cycleMonths + ' 个月（' + (cycleMonths === 6 ? '每半年 1 次' : '每年 1 次') + '）';
    } else {
      cycleMonths = ageYears < spec.thresholdYears ? spec.cycleBefore : spec.cycleAfter;
      const beforeText = spec.cycleBefore === 24 ? '每 2 年 1 次' : '每年 1 次';
      const afterText = spec.cycleAfter === 24 ? '每 2 年 1 次' : '每年 1 次';
      cycleText = cycleMonths + ' 个月（' + (ageYears < spec.thresholdYears ? beforeText : afterText) + '）';
    }
    push(
      '检验周期判定',
      `适用规则：${spec.regime} → 当前周期 ${cycleText}；依据：${spec.basis}`,
      spec.motorcycle
        ? `摩托车按第 3、5、6 年及此后每年排期`
        : spec.fixedMonths
        ? `固定周期 = ${cycleMonths} 个月`
        : `车龄 ${ageYears} 年 ${ageYears < spec.thresholdYears ? '<' : '≥'} 阈值 ${spec.thresholdYears} 年 → 周期 = ${cycleMonths} 个月`
    );

    /* 步骤 4：免检判定 */
    const exemption = getExemption(spec, firstReg, baseDate);
    let exemptionDue = null;
    if (exemption.applicable) {
      if (exemption.active) {
        // 免检期内：满 6 年后转入年度周期，首次需要上线的到期日 = 免检截止日 + 12 个月
        exemptionDue = addMonths(exemption.endDate, 12);
        push(
          '免检政策判定',
          `符合免检条件，免检期至 ${fmtDate(exemption.endDate)}；首个需上线检验的到期日预计 ${fmtDate(exemptionDue)}`,
          `免检截止日 = 首次登记日 ${fmtDate(firstReg)} + 6 年 = ${fmtDate(exemption.endDate)}；满 6 年后按年度周期 → ${fmtDate(exemptionDue)}`
        );
      } else {
        push(
          '免检政策判定',
          `车龄已满 6 年，免检政策不再适用（免检截止日 ${fmtDate(exemption.endDate)}）`,
          `基准日 ${fmtDate(baseDate)} > 免检截止日 ${fmtDate(exemption.endDate)}`
        );
      }
    } else {
      push('免检政策判定', exemption.reason, '不满足小型、微型载客汽车免检适用条件');
    }

    /* 步骤 5：推算下一次到期日 */
    const method = input.method || 'auto';
    const effectiveMethod = method === 'auto' ? (lastInsp ? 'lastInspection' : 'firstRegistration') : method;

    // 检验周期序列（自首次登记起）：两种推算方式与一致性核对共用
    const sequence = buildDueSequence(spec, firstReg, 40);

    let dueDate = null;    // 主到期日（界面主展示）
    let periodDue = null;  // 本检验周期到期日
    let nextAfter = null;  // 完成本次检验后的下一到期日
    let dueSource = '';
    let dueSourceLabel = '';

    if (effectiveMethod === 'lastInspection') {
      // 方式一：上次年检日 + 检验周期
      dueDate = nextDueFromInspection(spec, firstReg, lastInsp);
      periodDue = dueDate;
      nextAfter = nextDueFromInspection(spec, firstReg, dueDate);
      dueSource = 'lastInspection';
      dueSourceLabel = '按上次年检时间推算';
      push(
        '推算下次到期日（以上次年检为基准）',
        `上次年检 ${fmtDate(lastInsp)} + 检验周期 ${cycleMonths} 个月 → 本次检验到期日 ${fmtDate(dueDate)}；` +
          `若本次检验合格，下一到期日为 ${fmtDate(nextAfter)}`,
        `本次到期日 = 上次年检日 ${fmtDate(lastInsp)} + ${cycleMonths} 个月 = ${fmtDate(dueDate)}`
      );
    } else {
      // 方式二：首次登记日按周期序列推演
      // 取"已到期但未推演到的上一个周期"作为本检验周期到期日，避免漏判逾期
      const passed = sequence.filter((d) => diffDays(baseDate, d) >= 0);
      periodDue = passed.length ? passed[passed.length - 1] : sequence[0];
      const upcoming = sequence.find((d) => diffDays(d, baseDate) > 0);
      nextAfter = upcoming || sequence[sequence.length - 1];
      dueDate = periodDue;
      dueSource = 'firstRegistration';
      dueSourceLabel = '按首次登记日期推算';
      const recent = sequence.filter((d) => diffDays(baseDate, d) >= 0).slice(-4);
      push(
        '推算检验周期序列与到期日（以首次登记为基准）',
        `周期序列：${recent.map(fmtDate).join(' → ')} → …；` +
          `本检验周期到期日 ${fmtDate(periodDue)}，完成检验后下一到期日 ${fmtDate(nextAfter)}`,
        `序列推演：${recent.map(fmtDate).join(' → ')} → ${fmtDate(periodDue)}（≤ ${fmtDate(baseDate)}）→ ${fmtDate(nextAfter)}`
      );
      if (!exemption.active) {
        warnings.push(
          '未填写"上次年检日期"：以上到期日由首次登记日期按周期序列推演得到。若该周期已完成过检验，' +
            '请补充上次年检日期，系统将自动切换为"按上次年检时间推算"精确判定。'
        );
      }
    }

    /* 步骤 6：一致性与边界核对 */
    if (effectiveMethod === 'lastInspection' && !spec.motorcycle) {
      const nearest = sequence.reduce((best, d) => {
        const dist = Math.abs(diffDays(d, lastInsp));
        return !best || dist < best.dist ? { date: d, dist } : best;
      }, null);
      if (nearest && nearest.dist > 45) {
        warnings.push(
          `填写的上次年检日期 ${fmtDate(lastInsp)} 与按首次登记推算的检验周期序列（最近一次 ${fmtDate(nearest.date)}）相差 ${nearest.dist} 天，请核对是否填错。`
        );
        push(
          '检验周期一致性核对',
          `上次年检 ${fmtDate(lastInsp)} 与周期序列最近节点 ${fmtDate(nearest.date)} 相差 ${nearest.dist} 天（超过 45 天容差），请核对填报日期`,
          `|${fmtDate(lastInsp)} − ${fmtDate(nearest.date)}| = ${nearest.dist} 天 > 45 天容差`
        );
      } else {
        push(
          '检验周期一致性核对',
          `上次年检 ${fmtDate(lastInsp)} 与周期序列最近节点 ${fmtDate(nearest.date)} 相差 ${nearest.dist} 天，数据自洽`,
          `|${fmtDate(lastInsp)} − ${fmtDate(nearest.date)}| = ${nearest.dist} 天 ≤ 45 天容差`
        );
      }
    } else {
      push(
        '检验周期一致性核对',
        effectiveMethod === 'firstRegistration'
          ? '本次结论直接由首次登记日期的检验周期序列推演得出，无需交叉核对'
          : '摩托车采用第 3 / 5 / 6 年及此后逐年的专用排期，不与常规周期序列交叉核对',
        '核对方式：按车辆类型选用对应周期序列'
      );
    }

    /* 步骤 6.5：免检期内到期日改按"首个需上线检验日" */
    const exemptMode = exemption.active;
    if (exemptMode) {
      dueDate = exemptionDue;
      nextAfter = addMonths(exemptionDue, 12);
      dueSource = 'exemption';
      dueSourceLabel = '免检期内（按满 6 年后年度周期推算首个上线日）';
    }

    /* 步骤 7：天数计算 */
    const days = diffDays(dueDate, baseDate);
    const remaining = days >= 0 ? days : 0;
    const overdue = days < 0 ? -days : 0;
    push(
      '剩余天数计算',
      days >= 0
        ? `基准日 ${fmtDate(baseDate)} → 到期日 ${fmtDate(dueDate)}，剩余 ${days} 天`
        : `基准日 ${fmtDate(baseDate)} → 到期日 ${fmtDate(dueDate)}，已逾期 ${-days} 天`,
      days >= 0
        ? `剩余天数 = ${fmtDate(dueDate)} − ${fmtDate(baseDate)} = ${days} 天`
        : `逾期天数 = ${fmtDate(baseDate)} − ${fmtDate(dueDate)} = ${-days} 天`
    );

    /* 步骤 8：状态判定 */
    let status;
    let statusLabel;
    let statusTone;
    if (exemptMode) {
      status = 'exempt';
      statusLabel = '免检期内';
      statusTone = 'info';
    } else if (days < 0) {
      status = 'overdue';
      statusLabel = '已逾期';
      statusTone = 'danger';
    } else if (days <= warnDays) {
      status = 'expiring';
      statusLabel = days === 0 ? '今日到期' : '即将到期';
      statusTone = 'warn';
    } else {
      status = 'valid';
      statusLabel = '检验有效';
      statusTone = 'ok';
    }
    push(
      '状态判定',
      `剩余 ${days >= 0 ? days + ' 天' : '逾期 ' + -days + ' 天'}，提醒阈值 ${warnDays} 天 → 判定为「${statusLabel}」`,
      status === 'exempt'
        ? '免检政策生效 → 免检期内'
        : status === 'overdue'
          ? `${days} < 0 → 已逾期`
          : status === 'expiring'
            ? `0 ≤ ${days} ≤ ${warnDays} → 即将到期`
            : `${days} > ${warnDays} → 检验有效`
    );

    /* 是否需要上线检测 */
    const needOnSite = status === 'expiring' || status === 'overdue';
    const inspectNote = spec.motorcycle
      ? '摩托车检验需将车辆送至具备摩托车检测能力的检测站上线检测'
      : spec.fixedMonths === 6
        ? '危险货物运输车辆须每半年到检测站上线检验并取得检验合格标志'
        : '安全技术检验需将车辆驶入检测站上线检测';

    /* 连续 3 个检验周期未检验提示 */
    const cycleSpanMonths = spec.motorcycle ? 12 : cycleMonths;
    if (!exemptMode && overdue > 0 && overdue > cycleSpanMonths * 3 * 30) {
      warnings.push(
        `已连续超过 3 个检验周期（≈ ${cycleSpanMonths * 3} 个月）未参加定期检验，车辆可能已达到强制报废/注销条件，请尽快到检测站检验并咨询车管所。`
      );
    }

    /* 处罚与提示 */
    if (status === 'overdue') {
      warnings.push(
        `逾期未检验的机动车上道路行驶，将被扣留机动车并处罚款（通常 200 元），且未按规定定期进行安全技术检验的，一次记 3 分（以实际执法为准）。`
      );
    }
    if (exemptMode) {
      advice.push('免检期内仍需在每个检验周期到期前，通过"交管 12123"办理免检申请（需无违法未处理、无未结事故，并已投保交强险）。');
      advice.push(`免检期至 ${fmtDate(exemption.endDate)}，首个需上线检验的到期日预计 ${fmtDate(exemptionDue)}，建议提前 30 天关注。`);
    } else if (status === 'valid') {
      advice.push(`当前检验有效，下次到期日 ${fmtDate(dueDate)}，建议在到期前 30 天内预约检测。`);
    } else if (status === 'expiring') {
      advice.push(`请尽快到具备资质的检测站进行上线检验，检验合格后由系统自动更新检验有效期；${inspectNote}。`);
    } else {
      advice.push(`车辆已逾期 ${overdue} 天，请立即联系检测站预约上线检验，检验合格前不得上路行驶。`);
    }

    /* 时间轴 */
    const timeline = [];
    timeline.push({ date: fmtDate(firstReg), label: '首次登记', type: 'start' });
    if (exemption.applicable) {
      timeline.push({
        date: fmtDate(exemption.endDate),
        label: exemption.active ? '免检截止' : '免检期结束',
        type: 'exempt'
      });
    }
    if (lastInsp) timeline.push({ date: fmtDate(lastInsp), label: '上次年检', type: 'last' });
    timeline.push({ date: fmtDate(dueDate), label: exemptMode ? '首个上线日' : '下次到期', type: 'due' });

    return {
      ok: true,
      input: {
        plate,
        vehicleType: input.vehicleType,
        vehicleTypeLabel: typeLabel,
        usage: input.usage,
        usageLabel,
        seats: seats || null,
        isNewEnergy: !!input.isNewEnergy,
        isDangerous: !!input.isDangerous,
        firstRegDate: fmtDate(firstReg),
        lastInspectionDate: lastInsp ? fmtDate(lastInsp) : '',
        method,
        effectiveMethod,
        warnDays
      },
      baseDate: fmtDate(baseDate),
      age: { years: ageYears, text: ageTextValue },
      spec: { regime: spec.regime, basis: spec.basis, thresholdYears: spec.thresholdYears || null },
      cycle: { months: cycleMonths, text: cycleText },
      exemption: {
        applicable: exemption.applicable,
        active: exemption.active,
        endDate: exemption.endDate ? fmtDate(exemption.endDate) : '',
        firstOnSiteDue: exemptionDue ? fmtDate(exemptionDue) : '',
        remainingDays: exemption.endDate ? Math.max(0, diffDays(exemption.endDate, baseDate)) : null,
        reason: exemption.reason
      },
      due: {
        date: fmtDate(dueDate),
        periodDue: fmtDate(periodDue),
        nextAfterThis: fmtDate(nextAfter),
        source: dueSource,
        sourceLabel: dueSourceLabel,
        methodLabel: dueSourceLabel
      },
      days: {
        raw: days,
        remaining: remaining,
        overdue: overdue,
        isOverdue: days < 0
      },
      status: status,
      statusLabel: statusLabel,
      statusTone: statusTone,
      needOnSite: needOnSite,
      inspectNote: inspectNote,
      warnings: warnings,
      advice: advice,
      steps: steps,
      timeline: timeline
    };
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
