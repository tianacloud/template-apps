export const APP_NAME = '奶绿家今天的饭';
export const APP_SHORT = '奶绿家的饭';

export const MEAL_TYPES = [
  { key: 'breakfast', label: '早餐' },
  { key: 'lunch', label: '午餐' },
  { key: 'dinner', label: '晚餐' },
  { key: 'night', label: '宵夜' },
];

export const ORDER_STATUS = {
  pending: { label: '待做', tone: 'warn' },
  cooking: { label: '制作中', tone: 'brand' },
  served: { label: '已上桌', tone: 'ok' },
  canceled: { label: '已取消', tone: 'muted' },
};

export const ROLE_LABEL = {
  diner: '点菜人',
  cook: '做饭人',
};

export const DEFAULT_CATEGORIES = [
  { name: '家常菜', icon_key: 'flame' },
  { name: '汤羹', icon_key: 'soup' },
  { name: '主食', icon_key: 'rice' },
  { name: '凉菜', icon_key: 'salad' },
  { name: '饮品', icon_key: 'drink' },
];

/* 冰箱食材：分类固定几档，够用又不用维护 */
export const FRIDGE_CATEGORIES = [
  { key: 'veg', label: '蔬菜' },
  { key: 'meat', label: '肉蛋' },
  { key: 'staple', label: '主食' },
  { key: 'fruit', label: '水果' },
  { key: 'sauce', label: '调料' },
  { key: 'other', label: '其他' },
];

export const FRIDGE_UNITS = ['份', '个', '根', '颗', '把', '盒', '袋', '瓶', '克', '毫升'];

export function fridgeCategoryLabel(key) {
  const hit = FRIDGE_CATEGORIES.find((c) => c.key === key);
  return hit ? hit.label : '其他';
}
