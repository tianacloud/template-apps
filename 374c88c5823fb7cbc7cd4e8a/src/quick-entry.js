import {uid,today,parseEvent,dateOf} from './rules.js';
import {parseCategories} from './interface.js';
import {festivalsInYear,festivalEmoji} from './festivals.js';

const categories=[[/生日|周年|纪念日/,'birthday','🎂'],[/截止|deadline|交付|ddl|续费|账单|房贷|房租|水电/i,'bill','💰'],[/考试|面试|答辩|高考|考研|四六级|教资/i,'exam','📝'],[/出发|旅行|旅游|机票|高铁|行程|自驾/,'travel','✈️'],[/发布|上线|开板|开盘|首发/,'launch','🚀'],[/复查|体检|疫苗|手术|健身/,'health','🩺'],[/结婚|婚礼|订婚|领证/,'holiday','💍'],[/毕业|开学|放假/,'holiday','🎓']];
export function parseQuickEntry(text,base=today()){
 const value=text.trim();if(value.length<2)return null;
 let draft,confidence;try{draft=parseEvent(value==='双十一'?'11月11日 双十一':value,base);confidence=draft.repeat!=='none'||draft.parsed.split('、').includes('今天')?'medium':'high';}catch(error){if(!error.message.startsWith('未识别到日期'))throw error;draft={id:uid(),title:value,date:base,time:'',repeat:'none',interval:1,weekdays:[],duration:1,prep:0,category:'生活',note:'',pinned:false,archived:false};confidence='low';}
 const classified=categories.find(([pattern])=>pattern.test(value)),key=classified?.[1]||'custom',category=parseCategories.find(c=>c[0]===key);
 draft.category=category[3];draft.appearanceCategory=key;draft.prep=({birthday:3,bill:3,exam:14,travel:7,launch:5,holiday:7})[key]||0;
 const festival=Object.keys(festivalEmoji).find(name=>value.includes(name));draft.appearanceEmoji=classified?.[2]||(festival?festivalEmoji[festival]:undefined);
 if(festival&&confidence!=='low'){const found=festivalsInYear(dateOf(draft.date).getFullYear()).find(f=>f.title===festival&&f.date===draft.date);if(found)draft.duration=found.duration;}
 return {draft,confidence};
}
