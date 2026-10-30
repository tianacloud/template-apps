import { almanac, zodiacProfile, SOLAR_TERMS, ELEMENTS } from '../src/engine/almanac.mjs';
import { MAX_QUESTION, castFromParams, clampText } from '../src/engine/cast-params.mjs';
import { buildReading, castDaily, tossCoins } from '../src/engine/divination.mjs';
import { HEXAGRAM_LIST, TRIGRAMS, hexagramSymbol, invertedHexagram, mutualHexagram, oppositeHexagram } from '../src/engine/hexagrams.mjs';
import { jingfang } from '../src/engine/jingfang.mjs';
const cache = new Map(), entries = [];
export async function api(path, options={}) {
 const body=options.body ? JSON.parse(options.body) : {};
 if(path==='/bootstrap') {const now=new Date();return {almanac:almanac(now),trigrams:Object.values(TRIGRAMS),elements:ELEMENTS,solarTerms:SOLAR_TERMS,zodiac:Array.from({length:12},(_,i)=>zodiacProfile(i)),today:castDaily(now)}}
 if(path==='/library') return {hexagrams:HEXAGRAM_LIST.map(h=>({order:h.order,key:h.key,name:h.name,symbol:hexagramSymbol(h.key),upper:h.upperTrigram.name,lower:h.lowerTrigram.name,element:h.upperTrigram.element===h.lowerTrigram.element?h.upperTrigram.element:`${h.upperTrigram.element}${h.lowerTrigram.element}`,judgment:h.judgment,tuan:h.tuan,image:h.image,palace:jingfang(h),mutual:mutualHexagram(h).name,opposite:oppositeHexagram(h).name,inverted:invertedHexagram(h).name}))};
 if(path==='/cast') {const now=new Date(),reading=buildReading(castFromParams(body,now),{now,question:clampText(body.question,MAX_QUESTION),id:crypto.randomUUID()});cache.set(reading.id,reading);return {reading}}
 if(path==='/toss') {const t=tossCoins();return {...t,kind:t.sum===9?'老阳':t.sum===8?'少阴':t.sum===7?'少阳':'老阴'}}
 if(path==='/history'&&options.method==='POST') {const entry={...cache.get(body.id),note:clampText(body.note,2000)};entries.unshift(entry);return {entry}}
 if(path==='/history') return {entries};
 if(path.startsWith('/history/')&&options.method==='DELETE') {const id=path.split('/').pop(),index=entries.findIndex(x=>x.id===id);if(index>=0)entries.splice(index,1);return {removed:true}}
 throw new Error('请求不存在');
}
