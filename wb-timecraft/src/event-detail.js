import {esc,eventTheme,appearanceColors,parseCategories,formatDate,occurrenceLabel} from './interface.js';
import {eventStatus,dateOf} from './rules.js';
const field=(label,body)=>`<div class="field"><div class="field-label">${label}</div>${body}</div>`;
const input=(name,value,type='text',extra='')=>`<input class="input" data-detail-field="${name}" name="${name}" type="${type}" value="${esc(value)}" ${extra}>`;
export function renderEventDetail(e,{error='',confirm=false,persisted=false}={}){
 let status;try{status=eventStatus(e);}catch{status={next:null,days:null};}let dateLabel='请选择有效日期';try{dateLabel=formatDate(status.next||e.date)+(e.time?' '+e.time:'')+' 周'+'日一二三四五六'[dateOf(status.next||e.date).getDay()];}catch{}const theme=eventTheme(e),yearly=['yearly','lunar'].includes(e.repeat),color=Object.hasOwn(appearanceColors,e.appearanceColor)?appearanceColors[e.appearanceColor]:'var(--accent)';
 return `<div class="overlay"><div class="sheet event-detail-sheet"><form class="screen" data-form="event-detail">
 <div class="screen-head"><button type="button" class="btn btn-ghost" data-detail-action="done">‹ 返回</button></div>
 <div class="card detail-counter"><div style="color:${color}" class="detail-day">${status.days==null?'—':Math.abs(status.days)}</div><div class="muted">${status.days<0?'天前 · 已过':'天后'}</div><div class="faint mt-s detail-date">${esc(dateLabel)}${e.repeat==='none'?'':' · '+esc(occurrenceLabel(e,status.next||e.date))}</div></div>
 ${field('标题',input('title',e.title,'text','required maxlength="120"'))}
 ${field('备注',`<textarea class="input" rows="3" data-detail-field="note" name="note" maxlength="5000" placeholder="想记点什么…">${esc(e.note)}</textarea>`)}
 ${field('分类',`<div class="chips">${parseCategories.map(([key,emoji,label])=>`<button type="button" class="chip ${theme[0]===key?'selected':''}" data-detail-category="${key}">${emoji} ${label}</button>`).join('')}</div>`)}
 ${field('颜色',`<div class="chips">${Object.entries(appearanceColors).map(([key,color])=>`<button type="button" class="detail-color ${e.appearanceColor===key?'selected':''}" style="background:${color}" data-detail-color="${key}" aria-label="${key}"></button>`).join('')}</div>`)}
 ${field('日期',input('date',e.date,'date','required min="1901-01-01" max="2099-12-31"'))}
 ${field('精确时刻',`<div class="flex gap8">${input('time',e.time,'time')}${e.time?'<button type="button" class="btn" data-detail-action="day-only">仅按天</button>':''}</div>`)}
 ${field('重复',`<div class="chips">${[['none','不重复'],['weekly','每周'],['monthly','每月'],['yearly','每年']].map(([key,label])=>`<button type="button" class="chip ${e.repeat===key||key==='yearly'&&yearly?'selected':''}" data-detail-repeat="${key}">${label}</button>`).join('')}${yearly?`<button type="button" class="chip ${e.repeat==='lunar'?'selected':''}" data-detail-repeat="lunar">按农历</button>`:''}</div>`)}
 ${field('持续天数（行程/假期）',`<div class="flex gap8 detail-duration"><button type="button" class="btn" data-detail-duration="-1" data-unavailable="${e.duration<=1}">−</button><span>${e.duration}</span><button type="button" class="btn" data-detail-duration="1" data-unavailable="${e.duration>=366}">+</button></div>`)}
 ${field('行动提醒（提前通知）',`<div class="chips">${[1,3,7,14,30].map(n=>`<button type="button" class="chip ${(e.reminderDays||[]).includes(n)?'selected':''}" data-detail-reminder="${n}">提前${n===7?'1周':n===14?'2周':n===30?'1个月':n+'天'}</button>`).join('')}</div>`)}
 ${field('准备期（提前 N 天提示「该准备了」）',`<div class="chips">${[0,3,7,14,30].map(n=>`<button type="button" class="chip ${e.prep===n?'selected':''}" data-detail-prep="${n}">${n===0?'关闭':'提前'+n+'天'}</button>`).join('')}</div>`)}
 <div class="card row-between detail-pin"><span>📌 置顶显示</span><button type="button" class="btn" data-detail-action="pin">${e.pinned?'已置顶':'置顶'}</button></div>
 <div id="detail-sync-status" class="notice error" role="status" hidden></div><div id="detail-error" class="${error?'notice error':''}" role="status">${esc(error)}</div>
 ${confirm?'<div class="card detail-delete-confirm"><p>删除这条日程？确认后自动保存。</p><button type="button" class="btn btn-danger" data-detail-action="confirm-delete">确认删除</button><button type="button" class="btn" data-detail-action="cancel-delete">继续编辑</button></div>':''}
 <div class="flex gap8"><button type="button" class="btn btn-danger grow" data-detail-action="delete" ${persisted?'':'data-unavailable="true"'}>删除</button><button type="button" class="btn btn-primary grow" data-detail-action="done">完成</button></div>

 </form></div></div>`;
}
