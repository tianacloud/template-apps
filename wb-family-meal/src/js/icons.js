/* 统一线性图标集：24x24 网格，stroke=currentColor，不使用 Emoji */

const PATHS = {
  home: '<path d="M4 10.6 12 4.2l8 6.4V19a1.6 1.6 0 0 1-1.6 1.6h-3.3v-5.7H8.9v5.7H5.6A1.6 1.6 0 0 1 4 19v-8.4Z"/>',
  bowl: '<path d="M3.6 11h16.8v.6a8.4 8.4 0 0 1-16.8 0V11Z"/><path d="M9.6 8.6c0-1.1 1.3-1.3 1.3-2.4"/><path d="M13.1 8.6c0-1.1 1.3-1.3 1.3-2.4"/>',
  cart: '<path d="M3 4.2h2.1l2.3 10.6a2 2 0 0 0 1.96 1.6h7.9a2 2 0 0 0 1.96-1.6L21 7.4H6.1"/><circle cx="10" cy="20" r="1.4"/><circle cx="17.6" cy="20" r="1.4"/>',
  receipt: '<path d="M6.2 3.2h11.6a1 1 0 0 1 1 1v16.6l-2.9-1.9-2.5 1.9-1.4-1.6-1.4 1.6-2.5-1.9-2.9 1.9V4.2a1 1 0 0 1 1-1Z"/><path d="M9 8.6h6M9 12.4h6"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0"/>',
  users: '<circle cx="9.2" cy="8.4" r="3.2"/><path d="M3.4 19.8a5.8 5.8 0 0 1 11.6 0"/><path d="M16.4 5.6a3.1 3.1 0 0 1 0 6"/><path d="M17.6 14.6a5.6 5.6 0 0 1 3 5.2"/>',
  plus: '<path d="M12 5.2v13.6M5.2 12h13.6"/>',
  minus: '<path d="M5.2 12h13.6"/>',
  search: '<circle cx="11" cy="11" r="6.6"/><path d="M15.8 15.8 20 20"/>',
  chevronLeft: '<path d="M14.8 5.2 8 12l6.8 6.8"/>',
  chevronRight: '<path d="M9.2 5.2 16 12l-6.8 6.8"/>',
  chevronDown: '<path d="M5.6 9.2 12 15.6l6.4-6.4"/>',
  arrowRight: '<path d="M4.6 12h14.2"/><path d="M13.4 6.6 18.8 12l-5.4 5.4"/>',
  clock: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.6V12l3 2"/>',
  calendar: '<rect x="3.6" y="5.2" width="16.8" height="15.2" rx="2.4"/><path d="M3.6 9.8h16.8M8.4 3.4v3.4M15.6 3.4v3.4"/>',
  flame: '<path d="M12 3.2c2.9 3.9 5.4 5.6 5.4 9.1a5.4 5.4 0 0 1-10.8 0c0-1.9.9-3.2 2.1-4.5.6 1.2 1.7 1.6 2.4.9.7-.7.5-2.3.9-5.5Z"/>',
  soup: '<path d="M4 10.4h16v.6A8 8 0 0 1 12 19a8 8 0 0 1-8-8v-.6Z"/><path d="M9 7.4c0-1.4 1.6-1.4 1.6-2.6"/><path d="M13.4 7.4c0-1.4 1.6-1.4 1.6-2.6"/><path d="M3 21h18"/>',
  rice: '<path d="M5.2 10.2h13.6c0 4.3-3 7.8-6.8 7.8s-6.8-3.5-6.8-7.8Z"/><path d="M8.4 10.2a3.6 3.6 0 0 1 7.2 0"/><path d="M4.6 20.4h14.8"/>',
  salad: '<path d="M3.6 12.6h16.8v.4a8.4 8.4 0 0 1-16.8 0v-.4Z"/><path d="M8.2 12.4c-1.4-2.2.2-4.6 2.4-4.2"/><path d="M15.6 12.4c1.6-1.8.4-4.6-1.6-4.6"/><path d="M12 12.4V4.6"/>',
  drink: '<path d="M7 4.4h10l-1 15.2a1 1 0 0 1-1 .93h-6a1 1 0 0 1-1-.93L7 4.4Z"/><path d="M7.4 9.6h9.2"/>',
  check: '<path d="M5.2 12.6 9.6 17l9.2-9.6"/>',
  checkCircle: '<circle cx="12" cy="12" r="8.4"/><path d="M8.4 12.2 11 14.8l4.6-5"/>',
  bell: '<path d="M18 16.6V11a6 6 0 1 0-12 0v5.6L4.4 19.4h15.2L18 16.6Z"/><path d="M10 19.6a2.1 2.1 0 0 0 4 0"/>',
  bellOff: '<path d="M8.4 5.6A6 6 0 0 1 18 11v3.2"/><path d="M6 9.6v5l-1.6 4.8h11.8"/><path d="M10 19.6a2.1 2.1 0 0 0 4 0"/><path d="M4.2 3.4 20 19.6"/>',
  share: '<path d="M12 15.4V4.2"/><path d="M8.4 7.8 12 4.2l3.6 3.6"/><path d="M6 13.2v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6"/>',
  edit: '<path d="M4.2 19.8h4L19 9l-4-4L4.2 15.8v4Z"/><path d="M14.2 5.8 18.2 9.8"/>',
  trash: '<path d="M4 6.8h16"/><path d="M9.2 6.8V4.6h5.6v2.2"/><path d="M6.2 6.8l.9 13.1a1 1 0 0 0 1 .93h7.8a1 1 0 0 0 1-.93l.9-13.1"/>',
  camera: '<rect x="3.2" y="7.2" width="17.6" height="12.4" rx="2.6"/><path d="M8.6 7.2 10 4.6h4l1.4 2.6"/><circle cx="12" cy="13.2" r="3.2"/>',
  image: '<rect x="3.4" y="4.8" width="17.2" height="14.4" rx="2.6"/><circle cx="9" cy="10" r="1.6"/><path d="M4.2 17.2 9.6 12l3.4 3.2 2.6-2.4 4.2 4"/>',
  close: '<path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"/>',
  key: '<circle cx="8.4" cy="12" r="3.6"/><path d="M12 12h8.2"/><path d="M17.2 12v3.2"/><path d="M20.2 12v2.2"/>',
  logout: '<path d="M14.4 5H6.6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h7.8"/><path d="M13.2 12h7.6"/><path d="M18 8.6 21.4 12 18 15.4"/>',
  sparkle: '<path d="m12 3.8 1.7 4.6 4.6 1.7-4.6 1.7L12 16.4l-1.7-4.6L5.7 10l4.6-1.7L12 3.8Z"/><path d="m18.4 15.4.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4.4v4.2h-4.2"/>',
  alert: '<path d="M12 4.2 20.6 19H3.4L12 4.2Z"/><path d="M12 10v3.6"/><circle cx="12" cy="16.4" r=".9" fill="currentColor" stroke="none"/>',
  copy: '<rect x="8.4" y="8.4" width="11.4" height="11.4" rx="2.4"/><path d="M15.6 8.2V6.6a2.4 2.4 0 0 0-2.4-2.4H6.6A2.4 2.4 0 0 0 4.2 6.6v6.6a2.4 2.4 0 0 0 2.4 2.4h1.6"/>',
  tag: '<path d="M11.2 3.6H4.6a1 1 0 0 0-1 1v6.6l8.9 8.9a1 1 0 0 0 1.4 0l6.6-6.6a1 1 0 0 0 0-1.4l-8.9-8.9a1 1 0 0 0-.7-.3Z"/><circle cx="8" cy="8" r="1.4"/>',
  info: '<circle cx="12" cy="12" r="8.4"/><path d="M12 11v5.4"/><circle cx="12" cy="7.9" r=".95" fill="currentColor" stroke="none"/>',
  filter: '<path d="M4.2 6.4h15.6M7 12h10M9.6 17.6h4.8"/>',
  moon: '<path d="M20 14.4A8.4 8.4 0 0 1 9.6 4 8.6 8.6 0 1 0 20 14.4Z"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2.2M12 19v2.2M4.4 12H2.2M21.8 12h-2.2M6.6 6.6 5 5M19 19l-1.6-1.6M6.6 17.4 5 19M19 5l-1.6 1.6"/>',
  more: '<circle cx="5.6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18.4" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
  fridge: '<rect x="5.4" y="2.8" width="13.2" height="18.4" rx="2.8"/><path d="M5.4 10.4h13.2"/><path d="M8.8 6.2v2M8.8 13.4v2"/>',
};

export const ICON_KEYS = Object.keys(PATHS);

export function icon(name, size = 22, stroke = 1.7) {
  const body = PATHS[name] || PATHS.bowl;
  return (
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" ` +
    `stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" ` +
    `stroke-linejoin="round" aria-hidden="true">${body}</svg>`
  );
}

export const CATEGORY_ICONS = ['flame', 'soup', 'rice', 'salad', 'drink', 'bowl', 'tag', 'sparkle'];
