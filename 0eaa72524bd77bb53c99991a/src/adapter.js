import {read,save} from './db.js';
import {buildSnapshot,normalizeConfig} from './logic.js';
let ledgerRow=null, ledgerReady=false, configRow=null, autoEnabled=true, autoIntervalMs=15000;
const defaults={schemaVersion:1,cardTriggerPercent:99,cardSkipBeforeResetMinutes:60,quotaLevels:{tight:80,low:95}};
const json=x=>({ok:true,status:200,json:async()=>x});
async function getLedger(track=false){ const row=await read('ledger'); if(track) ledgerRow=row; return row ? JSON.parse(row.value) : null; }
async function getAuto(){
  const row=await read('auto');
  if(row){const value=JSON.parse(row.value); autoEnabled=Boolean(value.enabled); autoIntervalMs=Math.max(5000,Math.min(3600000,Number(value.intervalMs)||15000));}
  return row;
}
async function saveAuto(change){
  const row=await getAuto();
  const next={enabled:autoEnabled,intervalMs:autoIntervalMs,...change};
  await save('auto',JSON.stringify(next),row?.version??null);
  autoEnabled=next.enabled; autoIntervalMs=next.intervalMs;
  return {autoEnabled,autoIntervalMs};
}
async function getConfig(){ configRow=await read('config'); return configRow ? normalizeConfig(JSON.parse(configRow.value)) : {config:defaults,issues:[]}; }
export async function apiFetch(path,options={}) {
  const u=new URL(path,location.origin), post=options.method==='POST';
  try {
    if(u.pathname==='/api/ledger'){
      if(!post){ledgerReady=false;const ledger=await getLedger(true);ledgerReady=true;return json(ledger ? {ok:true,ledger,path:'应用共享台账'} : {ok:false,error:'尚未创建台账，请编辑并保存',path:'应用共享台账'});}
      if (!ledgerReady) throw Error('台账读取失败，请先重新载入后再保存');
      const ledger=JSON.parse(options.body).ledger;
      if(!ledger || typeof ledger!=='object' || Array.isArray(ledger)) throw Error('账本必须是一个 JSON 对象');
      if(ledger.credits!==undefined && !Array.isArray(ledger.credits)) throw Error('credits 必须是数组');
      if(ledger.cards!==undefined && !Array.isArray(ledger.cards)) throw Error('cards 必须是数组');
      const next={...ledger,updatedAtMs:Date.now()};
      ledgerRow=await save('ledger',JSON.stringify(next),ledgerRow?.version??null);return json({ok:true,ledger:next});
    }
    if(u.pathname==='/api/config'){
      if(!post) return json(await getConfig());
      const old=configRow ? normalizeConfig(JSON.parse(configRow.value)) : {config:defaults,issues:[]}, next=structuredClone(old.config);
      for(const key of ['cardTriggerPercent','cardSkipBeforeResetMinutes','tight','low']) if(u.searchParams.has(key)) {const n=Number(u.searchParams.get(key)); if(key==='tight'||key==='low')next.quotaLevels[key]=n;else next[key]=n;}
      const normalized=normalizeConfig(next);configRow=await save('config',JSON.stringify(normalized.config),configRow?.version??null);return json(normalized);
    }
    if(u.pathname==='/api/state'){
      const [ledger,cfg]=await Promise.all([getLedger(),getConfig(),getAuto()]);
      if(!ledger) return json({error:'尚未创建台账，请在页面底部编辑并保存',autoEnabled,autoIntervalMs});
      if (!Array.isArray(ledger.cards)) return json({error:'台账缺少有效的 cards 数组，无法判断',autoEnabled,autoIntervalMs});
      if (!ledger.quota?.fiveHour || !Number.isFinite(Number(ledger.quota.fiveHour.usedPercent)) || ledger.quota.fiveHour.usedPercent == null) return json({error:'台账缺少有效的五小时额度用量，无法判断',autoEnabled,autoIntervalMs});
      const snapshot=buildSnapshot(ledger,cfg.config);return json({...snapshot,config:cfg.config,configIssues:cfg.issues,autoEnabled,autoIntervalMs,autoRuns:[]});
    }
    if(u.pathname==='/api/auto') return json(await saveAuto({enabled:u.searchParams.get('enabled')==='1'}));
    if(u.pathname==='/api/auto-interval') return json(await saveAuto({intervalMs:Math.max(5000,Math.min(3600000,Number(u.searchParams.get('ms'))||15000))}));
    if(u.pathname==='/api/auto-run'){const ledger=await getLedger();if(!ledger) throw Error('尚未创建台账');const cfg=await getConfig();const d=buildSnapshot(ledger,cfg.config).decision;return json({outcome:'OK',reason:d.reason,message:d.reason});}
    throw Error('请求不支持');
  } catch(e) {return json(u.pathname==='/api/ledger'?{ok:false,error:e.message}: u.pathname==='/api/auto-run'?{outcome:'ERROR',message:e.message}: {error:e.message});}
}
export function interval(){return autoIntervalMs}
