import { reactive } from 'vue';
import { localToday, parseLocalDate } from './domain/dates';
export const route = reactive({ page: 'today', date: localToday(), cycles: 6, days: 30, cardId: '' });
function read() {
  const url = new URL((location.hash.slice(1) || '/today'), 'https://route.local');
  const [page, id] = url.pathname.slice(1).split('/');
  route.page = ['today','calendar','insights','settings','knowledge'].includes(page) ? page : 'today';
  try { route.date = parseLocalDate(url.searchParams.get('date') || localToday()); } catch { route.date = localToday(); }
  route.cycles = [3,6,12].includes(Number(url.searchParams.get('cycles'))) ? Number(url.searchParams.get('cycles')) : 6;
  route.days = [30,90].includes(Number(url.searchParams.get('days'))) ? Number(url.searchParams.get('days')) : 30;
  route.cardId = id || '';
}
export function navigate(page: string, params: Record<string, string | number> = {}) {
  const query = new URLSearchParams(Object.entries(params).map(([k,v]) => [k,String(v)])).toString();
  location.hash = `/${page}${query ? '?' + query : ''}`;
}
export function startRouter() { read(); window.addEventListener('hashchange', read); }
