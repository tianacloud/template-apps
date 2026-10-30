/**
 * 示例数据集：覆盖"正常未到期 / 即将到期 / 已逾期 / 免检期内 / 摩托车特殊排期"五类典型场景
 * baseDate 固定为 2026-10-22，保证演示结果可复现（可在界面中修改基准日）
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VIR_SAMPLES = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  return [
    {
      key: 'valid',
      title: '正常未到期',
      badge: '检验有效',
      desc: '小型微客满 6 年后每年检验一次，上次年检在有效期内',
      input: {
        plate: '京A88888',
        vehicleType: 'passenger',
        usage: 'nonOperating',
        seats: 5,
        isNewEnergy: false,
        isDangerous: false,
        firstRegDate: '2018-03-15',
        lastInspectionDate: '2026-03-16',
        method: 'lastInspection',
        baseDate: '2026-10-22',
        warnDays: 30
      },
      expect: {
        status: 'valid',
        statusLabel: '检验有效',
        dueDate: '2027-03-16',
        remaining: 145,
        overdue: 0,
        needOnSite: false
      }
    },
    {
      key: 'expiring',
      title: '即将到期',
      badge: '剩余 14 天',
      desc: '距离到期不足 30 天，需要尽快预约上线检测',
      input: {
        plate: '粤BD12345',
        vehicleType: 'passenger',
        usage: 'nonOperating',
        seats: 5,
        isNewEnergy: true,
        isDangerous: false,
        firstRegDate: '2019-11-01',
        lastInspectionDate: '2025-11-05',
        method: 'lastInspection',
        baseDate: '2026-10-22',
        warnDays: 30
      },
      expect: {
        status: 'expiring',
        statusLabel: '即将到期',
        dueDate: '2026-11-05',
        remaining: 14,
        overdue: 0,
        needOnSite: true
      }
    },
    {
      key: 'overdue',
      title: '已逾期',
      badge: '逾期 157 天',
      desc: '载货汽车 10 年以内每 2 年检验一次，已超过检验有效期',
      input: {
        plate: '川AD66H66',
        vehicleType: 'truck',
        usage: 'nonOperating',
        seats: null,
        isNewEnergy: false,
        isDangerous: false,
        firstRegDate: '2016-05-20',
        lastInspectionDate: '2024-05-18',
        method: 'lastInspection',
        baseDate: '2026-10-22',
        warnDays: 30
      },
      expect: {
        status: 'overdue',
        statusLabel: '已逾期',
        dueDate: '2026-05-18',
        remaining: 0,
        overdue: 157,
        needOnSite: true
      }
    },
    {
      key: 'exempt',
      title: '免检期内',
      badge: '免检至 2030-05-10',
      desc: '小型微客登记未满 6 年，本周期可申请免检上线检验',
      input: {
        plate: '沪C88888',
        vehicleType: 'passenger',
        usage: 'nonOperating',
        seats: 5,
        isNewEnergy: false,
        isDangerous: false,
        firstRegDate: '2024-05-10',
        lastInspectionDate: '',
        method: 'firstRegistration',
        baseDate: '2026-10-22',
        warnDays: 30
      },
      expect: {
        status: 'exempt',
        statusLabel: '免检期内',
        dueDate: '2031-05-10',
        exemptionEnd: '2030-05-10',
        needOnSite: false
      }
    },
    {
      key: 'motorcycle',
      title: '摩托车特殊排期',
      badge: '逾期 63 天',
      desc: '摩托车第 3 年首次检验，自注册满 3 年起算，当前已错过检验期',
      input: {
        plate: '桂D88888',
        vehicleType: 'motorcycle',
        usage: 'nonOperating',
        seats: null,
        isNewEnergy: false,
        isDangerous: false,
        firstRegDate: '2023-08-20',
        lastInspectionDate: '',
        method: 'firstRegistration',
        baseDate: '2026-10-22',
        warnDays: 30
      },
      expect: {
        status: 'overdue',
        statusLabel: '已逾期',
        dueDate: '2026-08-20',
        overdue: 63,
        needOnSite: true
      }
    }
  ];
});
