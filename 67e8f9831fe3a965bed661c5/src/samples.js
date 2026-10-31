/**
 * 示例数据集：展示不同车辆和日期的估算
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
      title: '非营运客车',
      badge: '日期估算',
      desc: '非营运小微型客车，按上次检验日期估算',
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
      }
    },
    {
      key: 'expiring',
      title: '新能源客车',
      badge: '日期估算',
      desc: '新能源客车按上次检验日期估算',
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
      }
    },
    {
      key: 'overdue',
      title: '载货汽车',
      badge: '日期估算',
      desc: '载货汽车按登记年限估算周期',
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
      }
    },
    {
      key: 'exempt',
      title: '新登记客车',
      badge: '日期估算',
      desc: '符合条件的小微型客车按登记日期估算',
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
      }
    },
    {
      key: 'motorcycle',
      title: '摩托车',
      badge: '日期估算',
      desc: '符合条件的摩托车按登记周期估算',
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
      }
    }
  ];
});
