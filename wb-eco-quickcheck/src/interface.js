import {statutes,FACTORS,CHECKLISTS,STATES,formatRange,calculateRange} from './rules.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const emojis={'排污许可':'🏭','监测':'📡','环评':'📐','大气':'💨','水':'💧','固废危废':'⚠️','噪声':'🔊','土壤':'🌱','其他':'📌'};
const categories=['全部',...new Set(statutes.map(r=>r.category))];
const navs={match:['🧠','速判'],library:['🔍','速查'],calculator:['⚖️','裁量'],checklist:['☑','清单']};
const lawCode=r=>(r.law==='生态环境监测条例'?'条例 ':'')+'第'+r.article+'条';
const saveLabel=c=>!c.loaded?'正在读取个人记录…':c.busy?'正在保存…':c.dirty?'有未保存修改':'个人核查工作区';

export function frame(c,content){
 return `${c.preview?'<div class="sample">本页合成示例 · 记录仅保留在当前页面 <button data-action="reset">恢复示例</button></div>':''}<header><div class="wrap"><div class="logo">🌿</div><div class="header-title"><h1>执法现场速查</h1><div class="sub">生态环境法典随身包 · 法条 · 裁量 · 清单</div></div><button class="header-records" data-page="records">个人记录</button></div><div class="wrap badge-wrap"><div class="badge-line"><span class="pill">依《生态环境法典》2026-08-15施行</span><span class="pill">${statutes.length} 条高频罚则</span></div></div></header><div id="notice" role="status" class="${c.notice?'notice '+(c.isError?'error':''):''}">${esc(c.notice)}</div><main class="wrap"><section class="panel on">${content}</section><footer><b>数据来源与边界：</b>条款内容依据《中华人民共和国生态环境法典》及《生态环境监测条例》正式文本整理，按主体、行为与情形分别核查；条款卡可查看完整条文与官方链接。<br>本工具为个人核查辅助，不构成执法依据；正式文书引用前请核对现行文本、事实与有效裁量基准。<br>法典：2026-08-15施行 · 监测条例：2026-08-08修订 · 共 ${statutes.length} 条主题卡 / ${Object.keys(CHECKLISTS).length} 套清单</footer></main><nav>${Object.entries(navs).map(([id,[icon,name]])=>`<button data-page="${id}" class="${c.page===id?'on':''}"><span class="ic">${icon}</span>${name}</button>`).join('')}</nav><div id="modal"></div>`;
}

export function caseFields(current){
 return `<div class="case-fields"><label class="field">记录名称<input data-case-field="title" maxlength="120" value="${esc(current.title)}"></label><label class="field">日期<input data-case-field="date" type="date" value="${esc(current.date)}"></label></div>`;
}

function recordDetails(c){
 return `<details class="record-details"><summary>本次记录信息与保存${c.dirty?' · 有未保存修改':''}</summary><div>${caseFields(c.current)}<div class="legal-note">候选条款需逐项核实后引用；保存仅记录个人核查过程。</div>${c.current.ruleIds.map(id=>{const r=statutes.find(v=>v.id===id);return `<div class="reference-row"><button data-detail="${id}">${esc(lawCode(r))}</button><button data-unselect="${id}" aria-label="移除${esc(lawCode(r))}">移除引用</button></div>`;}).join('')}<div class="record-actions"><button class="btn p" data-action="save">保存本次记录</button><button class="btn s" data-page="records">查看个人记录</button></div><span id="save-state" class="save-status">${saveLabel(c)}</span></div></details>`;
}

export function ruleCard(r,c,m=null){
 const open=c.openedRules.has(r.id),selected=c.current.ruleIds.includes(r.id),fine=r.ranges.length===1?formatRange(r.ranges[0]):r.ranges.length+' 个主体 / 情形档次';
 return `<article class="card ${open?'open':''}" data-rule-card="${r.id}"><div class="row1"><span class="code">${esc(lawCode(r))}</span><div class="title">${esc(r.title)}</div></div><div class="money">${fine}<small>法定幅度 · 需核对具体档次</small></div><div class="meta"><span class="tag">${emojis[r.category]||''} ${esc(r.category)}</span><span class="tag sub" title="${esc(r.law)}">${r.law==='生态环境监测条例'?'监测条例':'法典'}</span>${m?`<span class="tag">检索分 ${m.score}</span>`:''}${r.detention.status==='explicit'?'<span class="tag move">行政拘留条件须核实</span>':''}</div>${m?.hits.length?'<div class="kws">'+m.hits.slice(0,5).map(h=>'<span class="kwchip">命中：'+esc(h)+'</span>').join('')+'</div>':''}<div class="note"><div>${esc(r.detention.condition)}</div>${r.ranges.map(v=>`<div><b>${esc(v.label)}</b>：${formatRange(v)}</div>`).join('')}<p>核查主体、行为、后果与完整要件，固定现场时点、位置、工况和原始资料；不得仅凭关键词认定适用。</p><button class="tog" data-calc="${r.id}">用本条测算裁量 ›</button><button class="tog" data-detail="${r.id}">核对全文与证据要点 ›</button><button class="tog ${selected?'chosen':''}" data-select="${r.id}">${selected?'✓ 已引用候选':'引用候选条款'}</button><div class="official">${esc(r.version)} · ${c.preview?esc(r.url):`<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">官方完整条文 ↗</a>`}</div></div><button class="tog" data-toggle-rule="${r.id}" aria-expanded="${open}">${open?'收起要点':'展开要点'}</button></article>`;
}

export function matchView(c){
 return `<div class="sec">把现场看到的情况打进来</div><textarea class="case" id="description" maxlength="10000" placeholder="例：厂区东侧有一根软管从调节池接到雨水沟，检查时正在排放，废水呈深褐色；污水处理设施曝气池停运，操作工说坏了半个月；在线监测 COD 数据一直稳定在 40 左右，但手工采样测得 380。">${esc(c.current.description)}</textarea><div class="btnrow"><button class="btn p" data-action="match">分析可能适用的条款</button></div><div class="steps"><div class="step"><b>1 写清事实</b>排放方式、位置、持续时间、监测数据反差</div><div class="step"><b>2 看命中</b>按关键词检索分排序，条款与幅度一并给出</div><div class="step"><b>3 去核验</b>点进条款看要件，再到现场补证据</div></div><div class="count" id="match-count">${c.matches.length?'按检索分排序，共 '+c.matches.length+' 条候选。点任意一条展开要件。':'结果会显示在这里。本工具只做条款匹配，不替代事实认定。'}</div><div id="match-results">${c.matches.map(m=>ruleCard(m.rule,c,m)).join('')}</div>${recordDetails(c)}`;
}

export function libraryRows(c){
 return statutes.filter(r=>(c.category==='全部'||r.category===c.category)&&(!c.libraryQuery||[r.title,r.article,r.text,r.law].some(v=>v.includes(c.libraryQuery))));
}

export function libraryView(c){
 const rows=libraryRows(c);
 return `<div class="search"><input id="rule-search" type="text" placeholder="搜条号 / 违法行为，如 暗管、未批先建、1108" autocomplete="off" value="${esc(c.libraryQuery)}"><span class="ic2">⌕</span></div><div class="chips">${categories.map(n=>`<button class="chip ${c.category===n?'on':''}" data-category="${n}">${n}</button>`).join('')}</div><div class="count" id="library-count">命中 ${rows.length} 条${c.libraryQuery?'（关键词：'+esc(c.libraryQuery)+'）':''}</div><div id="library-cards">${rows.map(r=>ruleCard(r,c)).join('')||'<div class="empty">没有匹配的条款，换个关键词试试</div>'}</div>`;
}

export function calcResult(c){
 const r=statutes.find(v=>v.id===c.selectedRule)||statutes[0],range=r.ranges[c.rangeIndex]||r.ranges[0],s=c.current.scenario;
 const result=s?.ruleId===r.id&&s.rangeIndex===c.rangeIndex?calculateRange(range,s.percent,s.basis):null;
 return `<div class="result"><div class="k">使用者给定位置的算术参考</div><div class="v ${result?'':'empty-value'}">${result?result.amountWan+'<span>万元</span>':'待填写有效基准与位置'}</div><div class="range">法定幅度：${formatRange(range)}${result?'　｜　填写位置：'+result.percent+'%':''}</div></div><div class="calc"><b>${esc(lawCode(r))}</b> · ${esc(r.title)}<br>适用主体 / 情形：<b>${esc(range.label)}</b>${result?`<div class="barlbl" style="margin-top:11px"><span>${result.minWan} 万</span><span>${result.maxWan} 万</span></div><div class="bar"><i style="width:${result.percent}%"></i><u style="left:calc(${result.percent}% - 1.5px)"></u></div>计算：<code>${esc(result.formula)} = ${result.amountWan} 万元</code><br>基准：${esc(result.basis)}`:'<p class="legal-note">不提供默认百分比，不将法定情节换算为任意加减权重。</p>'}<div class="legal-note">${esc(r.detention.condition)}</div></div>`;
}

export function calculatorView(c){
 const r=statutes.find(v=>v.id===c.selectedRule)||statutes[0],range=r.ranges[c.rangeIndex]||r.ranges[0];
 return `<div class="lbl">选择要核查的条款</div><select id="calc-rule" class="selbox">${categories.slice(1).map(cat=>`<optgroup label="${cat}">${statutes.filter(v=>v.category===cat).map(v=>`<option value="${v.id}" ${r.id===v.id?'selected':''}>${esc(lawCode(v))} · ${esc(v.title)}</option>`).join('')}</optgroup>`).join('')}</select><div class="lbl">具体主体 / 情形</div><select id="calc-range" class="selbox">${r.ranges.map((v,i)=>`<option value="${i}" ${i===c.rangeIndex?'selected':''}>${esc(v.label)}：${formatRange(v)}</option>`).join('')}</select><div class="lbl">法定情节核查（核查记录，不自动换算百分比）</div><div id="factors">${FACTORS.map(f=>`<label class="chk ${c.current.factors.includes(f.id)?'on':''}"><input type="checkbox" data-factor="${f.id}" ${c.current.factors.includes(f.id)?'checked':''}><span><b>${esc(f.text)}</b><em class="e">第1056条 · ${f.effect}</em></span></label>`).join('')}</div><div class="calc-fields"><label>有效裁量基准名称 / 条目<input id="calc-basis" value="${esc(c.basis)}" maxlength="300" placeholder="填写本次适用的有效基准"></label><label>幅度内位置（%）<input id="calc-percent" type="number" min="0" max="100" step="0.1" value="${esc(c.percent)}" placeholder="0–100"></label></div><div class="btnrow"><button class="btn p" data-action="calculate" ${range.minWan==null?'disabled':''}>计算并记入本次记录</button><button class="btn s" data-action="general">核对第1056条</button></div>${range.minWan==null?'<div class="warnbox">条文未明示数值下限，本工具不补造下限进行计算。</div>':''}<div id="range-result">${calcResult(c)}</div><div class="warnbox">一般幅度内算术不替代不予、减轻处罚或其他特别规则。先核对主体、完整要件和有效地方基准，再决定适用。</div>${recordDetails(c)}`;
}

export function checklistView(c){
 const items=CHECKLISTS[c.current.scene],n=c.current.checks.filter(v=>v.state!=='pending').length,pct=Math.round(n/items.length*100);
 return `<div class="scene">${Object.keys(CHECKLISTS).map(name=>`<button class="chip ${name===c.current.scene?'on':''}" data-scene="${name}">${name}</button>`).join('')}</div><div class="count" id="pcnt">已核 ${n} / ${items.length}（${pct}%）</div><div class="prog"><i id="pi" style="width:${pct}%"></i></div><div id="items">${items.map(item=>{const v=c.current.checks.find(x=>x.id===item.id);return `<article class="item ${v.state!=='pending'?'on':''}" data-check-row="${item.id}"><input type="checkbox" data-check-toggle="${item.id}" aria-label="已核${esc(item.title)}" ${v.state!=='pending'?'checked':''}><div class="item-control"><div class="tx">${esc(item.title)}</div><span class="hint">取证要点：${esc(item.hint)}</span><select class="state-select" data-check-state="${item.id}" aria-label="${esc(item.title)}的核查状态">${Object.entries(STATES).map(([k,label])=>`<option value="${k}" ${v.state===k?'selected':''}>${label}</option>`).join('')}</select><input class="check-note" data-check-note="${item.id}" maxlength="2000" value="${esc(v.note)}" aria-label="${esc(item.title)}的备注" placeholder="记录实际观察、证据与待补资料…"></div></article>`;}).join('')}</div><label class="field">补充备注<textarea id="case-note" rows="3" maxlength="10000">${esc(c.current.note)}</textarea></label><div class="btnrow"><button class="btn p" data-action="text">生成检查记录</button><button class="btn s" data-action="clear-checks">清空本场景状态</button></div><textarea id="record-text" class="out" readonly placeholder="点「生成检查记录」后，这里会出现保留待核实项的文本">${esc(c.generatedText)}</textarea><div class="btnrow"><button class="btn s" data-action="download-text" ${c.preview||!c.generatedText?'disabled':''}>导出当前文本</button></div><div class="legal-note">已核实表示已完成该项核查，不自动认定符合；发现问题、不适用与待核实均分别保留。</div>${recordDetails(c)}`;
}

export function recordsView(c){
 const rows=c.records.filter(v=>!c.recordQuery||v.title.includes(c.recordQuery)||v.description.includes(c.recordQuery));
 return `<div class="sec">个人核查记录</div><div class="btnrow"><button class="btn p" data-action="new">新记录</button><button class="btn s" data-action="refresh">重新读取列表</button></div><div class="search record-search"><input id="record-search" value="${esc(c.recordQuery)}" placeholder="搜索记录" aria-label="搜索个人记录"></div>${recordDetails(c)}<div>${rows.map(v=>`<article class="card"><h2 class="record-title">${esc(v.title)}</h2><div class="count">${v.date} · ${esc(v.scene)} · 引用 ${v.ruleIds.length} 条</div><p class="record-body">${esc(v.description.slice(0,140)||'未填写现场描述')}</p><div class="record-actions"><button class="btn s" data-open="${v.id}">打开</button><button class="btn s danger" data-delete="${v.id}">删除</button></div></article>`).join('')||'<div class="empty">尚无匹配的保存记录。</div>'}</div><div class="btnrow"><button class="btn s" data-action="json" ${c.preview?'disabled':''}>导出全部记录 JSON</button></div>`;
}
