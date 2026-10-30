export const VEHICLES = [
  {
    id: "comet",
    name: "COMET S",
    label: "彗星 · 流线型概念轿跑",
    color: "#587a8c",
    price: 0,
    maxSpeed: 34,
    acceleration: 8,
    style: "coupe",
    width: 2.12,
    length: 4.5,
    height: 1.55,
  },
  {
    id: "turbo",
    name: "TURBO 86",
    label: "涡轮 · 楔形街道跑车",
    color: "#87cac2",
    price: 1200,
    maxSpeed: 44,
    acceleration: 10,
    style: "wedge",
    width: 2.16,
    length: 4.6,
    height: 1.25,
  },
  {
    id: "night",
    name: "NIGHTRUNNER",
    label: "夜行者 · 宽体超级跑车",
    color: "#e4c078",
    price: 2400,
    maxSpeed: 52,
    acceleration: 12,
    style: "super",
    width: 2.3,
    length: 4.85,
    height: 1.18,
  },
  {
    id: "sedan",
    name: "EXECUTIVE",
    label: "行政官 · 四门轿车",
    color: "#566e90",
    price: 700,
    maxSpeed: 30,
    acceleration: 6,
    style: "sedan",
    width: 2.1,
    length: 4.9,
    height: 1.65,
  },
  {
    id: "roadster",
    name: "BREEZE",
    label: "海风 · 双座敞篷",
    color: "#d06342",
    price: 1600,
    maxSpeed: 40,
    acceleration: 9,
    style: "roadster",
    width: 2.0,
    length: 4.2,
    height: 1.3,
  },
  {
    id: "suv",
    name: "TRAILMASTER",
    label: "开拓者 · 高底盘越野车",
    color: "#a7ab7e",
    price: 1000,
    maxSpeed: 28,
    acceleration: 5,
    style: "suv",
    width: 2.25,
    length: 4.8,
    height: 2.18,
  },
  {
    id: "van",
    name: "COURIER",
    label: "快递员 · 厢式货车",
    color: "#e9d9bc",
    price: 850,
    maxSpeed: 25,
    acceleration: 4,
    style: "van",
    width: 2.25,
    length: 5.3,
    height: 2.4,
  },
  {
    id: "pickup",
    name: "RANCHERO",
    label: "牧场主 · 长货斗皮卡",
    color: "#8ab2b2",
    price: 1100,
    maxSpeed: 31,
    acceleration: 5.5,
    style: "pickup",
    width: 2.2,
    length: 5.4,
    height: 1.95,
  },
];
export const initialState = () => ({
  cash: 300,
  owned: ["comet"],
  vehicle: "comet",
  upgrade: 0,
  completed: 0,
  distance: 0,
  x: 120,
  z: 18,
  heading: Math.PI,
  mission: null,
});
export function purchase(state, id) {
  const item = VEHICLES.find((v) => v.id === id);
  if (!item) return { ok: false, message: "车辆不存在" };
  if (state.owned.includes(id)) {
    state.vehicle = id;
    return { ok: true, message: "车辆已就绪" };
  }
  if (state.cash < item.price)
    return { ok: false, message: "余额不足，先去完成几份委托" };
  state.cash -= item.price;
  state.owned.push(id);
  state.vehicle = id;
  return { ok: true, message: "新车已送达车库" };
}
export function upgrade(state) {
  if (state.upgrade >= 3) return { ok: false, message: "引擎已完全升级" };
  const cost = (state.upgrade + 1) * 350;
  if (state.cash < cost)
    return { ok: false, message: "余额不足，完成任务可赚取现金" };
  state.cash -= cost;
  state.upgrade++;
  return { ok: true, message: "引擎升级完成" };
}
export function completeMission(state, reward) {
  state.cash += reward;
  state.completed++;
  state.mission = null;
}
