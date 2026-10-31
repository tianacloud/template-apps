import { emptyWorkspace, today, dayNumber, type Workspace } from "./model";
export function sampleWorkspace(): Workspace {
  const w = emptyWorkspace(),
    base = dayNumber(today()),
    date = (n: number) =>
      new Date((base - n) * 86400000).toISOString().slice(0, 10);
  w.vehicles = [
    {
      id: "demo-car",
      name: "我的小白",
      model: "本田思域 180TURBO",
      plate: "京A · 16888",
      fuel: "92# 汽油",
      capacity: 47,
      purchaseDate: "2022-06-18",
      archived: false,
    },
    {
      id: "demo-moto",
      name: "周末伙伴",
      model: "城市通勤摩托车",
      plate: "",
      fuel: "95# 汽油",
      capacity: 14,
      purchaseDate: "2024-03-20",
      archived: false,
    },
  ];
  let odo = 26800;
  const rates = [
      7.42, 7.16, 7.63, 6.98, 7.34, 7.08, 7.55, 6.87, 7.11, 6.94, 7.28, 6.82,
    ],
    prices = [
      7.68, 7.68, 7.56, 7.56, 7.62, 7.62, 7.51, 7.51, 7.6, 7.6, 7.48, 7.48,
    ];
  w.fuels = rates.map((r, i) => {
    const distance = 450 + (i % 4) * 29;
    if (i) odo += distance;
    const liters = +((r * distance) / 100).toFixed(3),
      grossCents = Math.round(liters * prices[i] * 100);
    return {
      id: "demo-fuel-" + i,
      vehicleId: "demo-car",
      date: date(91 - i * 8) + "T" + (i % 2 ? "18:32" : "09:16"),
      odometer: odo,
      liters,
      price: prices[i],
      grossCents,
      paidCents: grossCents - 1200,
      full: true,
      light: false,
      missed: false,
      grade: "92# 汽油",
      station: i % 3 === 0 ? "中石化 · 城南加油站" : "中石油 · 滨河加油站",
      note: i === 11 ? "周末短途，一路好风景" : i === 7 ? "自驾回家" : "",
    };
  });
  w.fuels.push(
    ...[0, 1, 2].map((i) => ({
      id: "demo-moto-fuel-" + i,
      vehicleId: "demo-moto",
      date: date(36 - i * 15) + "T10:00",
      odometer: 3600 + i * 260,
      liters: 8.2,
      price: 8.1,
      grossCents: 6642,
      paidCents: 6642,
      full: true,
      light: false,
      missed: false,
      grade: "95# 汽油",
      station: "中石化 · 城南加油站",
      note: "",
    })),
  );
  w.expenses = [
    {
      id: "demo-insurance",
      vehicleId: "demo-car",
      date: date(80),
      categoryId: "insurance",
      cents: 365000,
      note: "年度车险 · 安心出行",
    },
    ...Array.from({ length: 9 }, (_, i) => ({
      id: "demo-expense-" + i,
      vehicleId: "demo-car",
      date: date(i * 9 + 2),
      categoryId: i % 3 === 0 ? "parking" : i % 3 === 1 ? "toll" : "wash",
      cents: i % 3 === 0 ? 4500 : i % 3 === 1 ? 8600 : 3000,
      note: i % 3 === 0 ? "商场停车" : i % 3 === 1 ? "周末高速" : "日常洗车",
    })),
  ];
  w.maintenance = [
    {
      id: "demo-maintenance",
      vehicleId: "demo-car",
      date: date(65),
      odometer: 27500,
      title: "更换机油机滤",
      cents: 48000,
      note: "全合成机油，检查轮胎气压",
      nextDate: date(-16),
      nextOdometer: 33500,
    },
  ];
  return w;
}
