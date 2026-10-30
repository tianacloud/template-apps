import { almanac, zodiacProfile, SOLAR_TERMS, ELEMENTS } from './engine/almanac.mjs';
import { MAX_QUESTION, castFromParams, clampText } from './engine/cast-params.mjs';
import { buildReading, castDaily, tossCoins } from './engine/divination.mjs';
import { HEXAGRAM_LIST, TRIGRAMS, hexagramSymbol, invertedHexagram, mutualHexagram, oppositeHexagram } from './engine/hexagrams.mjs';
import { jingfang } from './engine/jingfang.mjs';
import { sql } from './db.js';

const cache = new Map();
function appId() {
  const id = window.tiana?.appId;
  if (typeof id !== 'string' || !id) throw new Error('应用身份未就绪，请重新打开应用。');
  return id;
}
function fail(code, message) { const error = new Error(message); error.code = code; throw error; }
export async function api(path, options = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : {};
  if (path === '/bootstrap') {
    const now = new Date();
    return { almanac: almanac(now), trigrams: Object.values(TRIGRAMS), elements: ELEMENTS, solarTerms: SOLAR_TERMS, zodiac: Array.from({ length: 12 }, (_, i) => zodiacProfile(i)), today: castDaily(now) };
  }
  if (path === '/library') return { hexagrams: HEXAGRAM_LIST.map(h => ({order:h.order,key:h.key,name:h.name,symbol:hexagramSymbol(h.key),upper:h.upperTrigram.name,lower:h.lowerTrigram.name,element:h.upperTrigram.element === h.lowerTrigram.element ? h.upperTrigram.element : `${h.upperTrigram.element}${h.lowerTrigram.element}`,judgment:h.judgment,tuan:h.tuan,image:h.image,palace:jingfang(h),mutual:mutualHexagram(h).name,opposite:oppositeHexagram(h).name,inverted:invertedHexagram(h).name})) };
  if (path === '/toss') { const t = tossCoins(); return {...t,kind: t.sum === 9 ? '老阳' : t.sum === 8 ? '少阴' : t.sum === 7 ? '少阳' : '老阴'}; }
  if (path === '/cast') {
    const now = new Date();
    const reading = buildReading(castFromParams(body, now), {question:clampText(body.question, MAX_QUESTION),now,id:crypto.randomUUID()});
    cache.set(reading.id, reading);
    if (cache.size > 500) cache.delete(cache.keys().next().value);
    return {reading};
  }
  if (path === '/history' && method === 'GET') {
    const result = await sql('SELECT reading_json FROM divination_history WHERE app_id = ? ORDER BY rowid DESC LIMIT 500', [appId()]);
    return {entries:result.rows.map(row => JSON.parse(row.reading_json))};
  }
  if (path === '/history' && method === 'POST') {
    const reading = cache.get(body.id);
    if (!reading) fail('unknown_cast','这一卦无法再存，请重新起一卦。');
    const entry = {...reading, note:clampText(body.note,2000)};
    try { await sql('INSERT INTO divination_history (app_id,id,created_at,reading_json) VALUES (?,?,?,?)', [appId(),entry.id,entry.createdAt,JSON.stringify(entry)]); }
    catch (error) {
      try { const found = await sql('SELECT reading_json FROM divination_history WHERE app_id = ? AND id = ?', [appId(),entry.id]); if (found.rows.length && found.rows[0].reading_json === JSON.stringify(entry)) return {entry}; }
      catch { throw new Error('保存结果暂时无法确认，请稍后查看卦历。'); }
      throw error;
    }
    return {entry};
  }
  const match = /^\/history\/([A-Za-z0-9-]{1,80})$/.exec(path);
  if (match && method === 'DELETE') {
    try { await sql('DELETE FROM divination_history WHERE app_id = ? AND id = ?', [appId(),match[1]]); }
    catch (error) { try { const result = await sql('SELECT id FROM divination_history WHERE app_id = ? AND id = ?', [appId(),match[1]]); if (!result.rows.length) return {removed:true}; } catch { throw new Error('删除结果暂时无法确认，请稍后查看卦历。'); } throw error; }
    return {removed:true};
  }
  fail('not_found','请求不存在。');
}
