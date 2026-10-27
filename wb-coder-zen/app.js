'use strict';
const el = id => document.getElementById(id);
const pick = values => values[Math.floor(Math.random() * values.length)];
const state = {duck:0, smash:0, wishes:[], sound:false};
try { Object.assign(state, JSON.parse(localStorage.getItem('coderzen.v2') || '{}')); if (!Array.isArray(state.wishes)) state.wishes = []; } catch (_) {}
function save(){try{localStorage.setItem('coderzen.v2',JSON.stringify(state));}catch(_){}}
let noticeTimer; function notice(t){el('toast').textContent=t;el('toast').classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el('toast').classList.remove('show'),2000)}
let audio; function context(){try { audio ||= new (window.AudioContext||window.webkitAudioContext)(); if(audio.state==='suspended') audio.resume(); return audio; }catch(_){return null}}
function tone(freq,duration,type,volume,end){if(!state.sound)return;const c=context();if(!c)return;const o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.type=type;o.frequency.setValueAtTime(freq,t);if(end)o.frequency.exponentialRampToValueAtTime(end,t+duration);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+duration+.02)}
const sounds={tick:()=>tone(660,.05,'square',.05), duck:()=>{tone(420,.14,'sawtooth',.10,200);setTimeout(()=>tone(360,.12,'sawtooth',.08,180),90)},coin:()=>{tone(988,.09,'triangle',.12);setTimeout(()=>tone(1319,.22,'triangle',.10),80)}, smash:()=>{if(!state.sound)return;const c=context();if(!c)return;const n=Math.floor(c.sampleRate*.32),buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.4);const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=buf;f.type='lowpass';f.frequency.value=1600;g.gain.value=.22;s.connect(f);f.connect(g);g.connect(c.destination);s.start()}};
function renderSound(){el('sound').textContent=state.sound?'🔊 音效开':'🔇 音效关';el('sound').classList.toggle('on',state.sound)}
el('sound').onclick=()=>{state.sound=!state.sound;save();renderSound();if(state.sound)sounds.tick();notice(state.sound?'音效已开，注意工位音量':'已静音')};renderSound();
const samples=[
  "Cannot read property of undefined",
  "线上好了测试炸了 测试好了线上炸了",
  "这个需求很简单 你怎么还做不完",
  "npm install 失败 CI 红了一整天",
  "周五下午六点的上线需求",
  "改一行配置重启三次才好",
  "生产数据库的 update 忘了带 where",
  "祖传代码 没人敢动 也没人敢删",
  "在我电脑上是好的呀",
  "这个 bug 只有客户能复现",
  "接口文档和实际返回永远差两个字段",
  "又是时区问题",
  "压测通过了 一到真实流量就抖",
  "需求已上线 用户没发现 但老板发现了",
  "你先把功能做了 设计稿下周给",
  "这个改动很小 不影响其他模块（信我）"
];
let bugText='';function renderBug(){bugText=el('bug').value.trim();const z=el('zone');z.replaceChildren();z.className='smash '+(bugText?'filled':'empty');if(!bugText){z.textContent='把烦心事写上面，然后一拳打碎它。';return}for(const c of bugText){const span=document.createElement('span');span.className='char';span.textContent=c===' '?'\u00a0':c;z.append(span)}}
el('bug').oninput=renderBug;el('bug').onkeydown=e=>{if(e.key==='Enter')el('smash').click()};el('sample').onclick=()=>{el('bug').value=pick(samples);renderBug();sounds.tick();el('sample').classList.remove('hint')};el('smash').onclick=()=>{if(!bugText){notice('先写点什么，或者点「随机来一个」');el('bug').focus();return}const z=el('zone'),old=bugText;z.classList.add('shake');setTimeout(()=>z.classList.remove('shake'),300);for(const ch of z.children){const a=Math.random()*Math.PI*2,d=120+Math.random()*280;ch.style.transform=`translate(${Math.cos(a)*d}px,${Math.sin(a)*d+60}px) rotate(${(Math.random()-.5)*900}deg) scale(${.3+Math.random()*.9})`;ch.style.opacity='0';ch.style.filter='blur(3px)'}sounds.smash();state.smash++;el('smashCount').textContent=state.smash;save();setTimeout(()=>{z.className='smash empty';z.textContent=`碎了。（${old.slice(0,16)}${old.length>16?'…':''} 已物理删除，代码里那份还得你自己删）`;el('bug').value='';bugText=''},700)};el('smashCount').textContent=state.smash;
const YI=['上线发版','写注释','重构老代码','提 PR','删代码','喝冰美式','准时下班','给同事点赞','清理 TODO','更新依赖','跟产品对需求','补单元测试','给文档加目录','顺手修个小 bug','当面沟通','把日志看全'];
const JI=['周五下午上线','动公共组件','改数据库结构','回复「在吗」','开会超过一小时','复制网上的代码不看','给变量起名叫 data2','在生产库练手','跨年跑批','口头确认需求','本地改完直接推','说「这次肯定没问题」'];
const FN=['sort()','map()','parseInt()','flatMap()','reduce()','trim()','split()','stringify()','debounce()','groupBy()'];
function fortune(date){const key=`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;let s=2166136261;for(let i=0;i<key.length;i++){s^=key.charCodeAt(i);s=Math.imul(s,16777619)}s>>>=0;const rand=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296};const take=(arr,n)=>{const pool=arr.slice(),out=[];while(out.length<n)out.push(pool.splice(Math.floor(rand()*pool.length),1)[0]);return out};const yi=take(YI,3),ji=take(JI,3),fn=take(FN,1)[0],hour=9+Math.floor(rand()*10),min=Math.floor(rand()*60),idx=(60+Math.floor(rand()*40))+'%';return{key,dateLabel:`${date.getFullYear()} 年 ${date.getMonth()+1} 月 ${date.getDate()} 日`,yi,ji,fn,time:`${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`,idx}}
let almanac,cardUrl='';function updateDate(){const next=fortune(new Date());if(almanac?.key===next.key)return;almanac=next;cardUrl='';el('yi').innerHTML=next.yi.map(x=>'· '+x).join('<br>');el('ji').innerHTML=next.ji.map(x=>'· '+x).join('<br>');el('fn').textContent=next.fn;el('time').textContent=next.time;el('index').textContent=next.idx}function scheduleMidnight(){const now=new Date(),next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);setTimeout(()=>{updateDate();scheduleMidnight()},Math.max(1,next-now+10))}updateDate();scheduleMidnight();setInterval(updateDate,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateDate()});
function makeCard(){updateDate();const c=document.createElement('canvas');c.width=1500;c.height=2380;const x=c.getContext('2d');if(!x.roundRect)x.roundRect=function(a,b,w,h,r){this.moveTo(a+r,b);this.lineTo(a+w-r,b);this.quadraticCurveTo(a+w,b,a+w,b+r);this.lineTo(a+w,b+h-r);this.quadraticCurveTo(a+w,b+h,a+w-r,b+h);this.lineTo(a+r,b+h);this.quadraticCurveTo(a,b+h,a,b+h-r);this.lineTo(a,b+r);this.quadraticCurveTo(a,b,a+r,b);this.closePath();return this};const W=750,H=1190,F='"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif';x.scale(2,2);const bg=x.createRadialGradient(W/2,-120,40,W/2,-120,900);bg.addColorStop(0,'#262c47');bg.addColorStop(1,'#0e0f13');x.fillStyle=bg;x.fillRect(0,0,W,H);function box(a,b,w,h,r,fill,stroke){x.beginPath();x.roundRect(a,b,w,h,r);if(fill){x.fillStyle=fill;x.fill()}if(stroke){x.strokeStyle=stroke;x.lineWidth=2;x.stroke()}}box(28,28,W-56,H-56,26,null,'#2b2f42');x.textAlign='center';x.fillStyle='#6ee7c8';x.font='600 26px '+F;x.fillText("10 · 24  PROGRAMMERS' DAY",W/2,108);x.fillStyle='#eceef4';x.font='700 64px '+F;x.fillText('程序员解压所',W/2,190);x.fillStyle='#98a0b5';x.font='400 26px '+F;x.fillText(almanac.dateLabel+' · 今日黄历',W/2,240);x.textAlign='left';const bw=(W-112-28)/2;for(const [pos,items,label,color,bg] of [[56,almanac.yi,'宜','#6ee7c8','rgba(110,231,200,.10)'],[56+bw+28,almanac.ji,'忌','#ff8fb3','rgba(255,143,179,.10)']]){box(pos,296,bw,336,24,bg,color);x.fillStyle=color;x.font='700 34px '+F;x.fillText(label,pos+32,360);x.fillStyle='#eceef4';x.font='400 30px '+F;items.forEach((t,i)=>x.fillText('· '+t,pos+32,426+i*64,bw-64))}let y=704;for(const [label,value] of [['幸运函数',almanac.fn],['今日提交吉时',almanac.time],['Bug 退散指数',almanac.idx]]){box(56,y,W-112,84,20,'#1f222f','#2b2f42');x.fillStyle='#98a0b5';x.font='400 28px '+F;x.fillText(label,88,y+52);x.textAlign='right';x.fillStyle='#ffb454';x.font='700 32px '+F;x.fillText(value,W-88,y+52);x.textAlign='left';y+=104}x.textAlign='center';x.fillStyle='#98a0b5';x.font='400 26px '+F;x.fillText('代码会崩，心态不能崩',W/2,H-96);x.fillStyle='#4b5163';x.font='400 20px '+F;x.fillText('同一天全公司算出来是同一卦，去群里对答案',W/2,H-58);return c.toDataURL('image/png')}
el('card').onclick=()=>{try{updateDate();cardUrl=cardUrl||makeCard();el('cardImg').src=cardUrl;if(/MicroMessenger/i.test(navigator.userAgent)){el('download').style.display='none';el('cardTip').textContent='长按上面这张图 → 「保存图片」，就能发到群里了。'}el('mask').classList.add('show')}catch(_){notice('这段浏览器画不了图，换个浏览器试试')}};el('close').onclick=()=>el('mask').classList.remove('show');el('mask').onclick=e=>{if(e.target===el('mask'))el('mask').classList.remove('show')};el('download').onclick=()=>{const a=document.createElement('a');a.href=cardUrl||makeCard();a.download='程序员黄历-'+almanac.dateLabel.replace(/\s/g,'')+'.png';a.click();notice('图片已开始下载')};
const duckReplies=[
  "嘎。（翻译：你把报错信息从第一行重新读一遍，慢慢读。）",
  "嘎嘎。（翻译：先说说你期望它输出什么，再说它实际输出了什么。）",
  "嘎。（翻译：把最近改的那三行，注释掉一半试试。）",
  "嘎嘎嘎。（翻译：你是不是又在用生产环境的数据测试？）",
  "嘎。（翻译：去接杯水。回来的时候答案经常自己排队站好了。）",
  "嘎嘎。（翻译：console.log 虽然土，但它从不说谎。）",
  "嘎。（翻译：检查一下，是不是忘了保存文件。本鸭见过太多了。）",
  "嘎。（翻译：把这个函数的名字读出声，它真的在做名字说的事吗？）",
  "嘎嘎。（翻译：昨天能跑、今天不能跑——中间你只动过一行？说实话。）",
  "嘎。（翻译：橡皮鸭定理：当你能把问题说清楚，问题就解决了一半。）",
  "嘎嘎嘎嘎。（翻译：重启一下。别问，问就是玄学管够。）",
  "嘎。（翻译：分号、括号、时区、编码——四大天王你查了几个？）",
  "嘎。（翻译：这段逻辑你三个月后还看得懂吗？看不懂就现在改。）",
  "嘎嘎。（翻译：先去吃饭。饿着肚子改的 bug，明天还要再改一遍。）",
  "嘎。（翻译：你把 if 反过来写，分别打印一下，谁真谁假立刻见分晓。）",
  "嘎嘎。（翻译：报错说的是第 12 行，但真正错的常常在第 8 行。）",
  "嘎。（翻译：先写一个能复现它的最小例子。百分之七十的问题在这一步就没了。）",
  "嘎嘎。（翻译：你确定改的是你以为的那个文件吗？本鸭怀疑你改的是另一个同名目录。）",
  "嘎。（翻译：这个变量到底是谁改的？加个断点，让代码自己招供。）",
  "嘎嘎。（翻译：把缓存清了试试。你可能在和十分钟前的自己搏斗。）",
  "嘎。（翻译：找个同事讲三分钟。不是为了让他答，是为了让你自己听见自己。）",
  "嘎嘎。（翻译：需求可能本来就是这么设计的。去问一句，别硬改。）",
  "嘎。（翻译：加个 try-catch 不叫解决问题，那叫把问题藏起来养着。）",
  "嘎嘎。（翻译：你写了注释解释它为什么这样，说明它本来就不该这样。）",
  "嘎。（翻译：删掉一半代码看看还能不能跑。能跑的话，你刚才在维护什么？）",
  "嘎嘎。（翻译：先提交一次。你现在的状态，任何改动都可能是灾难。）",
  "嘎。（翻译：这个 bug 你查了多久？超过两小时就该换个人看了，眼睛会瞎。）",
  "嘎嘎。（翻译：顺手把那段看不懂的旧逻辑记下来，下次别再猜了。）",
  "嘎。（翻译：看看监控时间线。它比你的记忆诚实。）",
  "嘎嘎。（翻译：跑一遍单元测试。你刚改的东西可能已经有三个人在依赖了。）",
  "嘎。（翻译：下班。明天早上你会用一半的时间解决它。本鸭担保。）",
  "嘎嘎嘎。（翻译：你已经很棒了。真的。代码崩了不代表你也崩了。）"
];
function say(){el('duckOut').textContent=pick(duckReplies);state.duck++;el('duckCount').textContent=state.duck;save();const d=el('duck');d.classList.remove('bounce');void d.offsetWidth;d.classList.add('bounce');sounds.duck();if(state.duck===10) setTimeout(()=>notice('鸭子：你已经说了 10 次了，要不……真去看眼代码？'),400);if(state.duck===30)setTimeout(()=>notice('鸭子：本鸭建议你直接下班。'),400)}el('say').onclick=say;el('duck').onclick=say;el('duck').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();say()}};el('duckCount').textContent=state.duck;
const phrases={
  stand: {
    A:["这块我这边今天继续跟一下，","同步一下进展：","昨天那个问题是这样，","目前初步结论是，","简单说一下，" ],
    B:["卡在等上游给接口字段","本地复现不了，得拿测试环境的日志","依赖的那个库升级后行为变了","等测试同学补个用例再继续",
       "这块涉及公共逻辑，改之前想先对齐一下","评估下来工作量比原估的大，需要拆一下","数据侧还没给到，我先用假数据把流程跑通"],
    C:["今天下班前给结论。","预计下午能有结果。","不会阻塞整体排期。","风险可控，我先盯着。","需要谁配合我会单独拉。"]
  },
  postmortem: {
    A:["我们完整复盘了一遍，","从链路日志来看，","根因定位之后发现，","把时间线拉出来对齐后，","按五分为什么问到第五层，"],
    B:["问题出在第三方接口昨晚悄悄改了返回格式","是测试环境配置被覆盖了，跟代码无关",
       "历史版本的兼容逻辑在特定分支才触发","监控告警阈值设得太松，没第一时间发现",
       "灰度比例太小，问题没在灰度期暴露","缓存预热没跟上，属于历史欠账集中爆发",
       "缺少对脏数据的兜底校验，防御没做够","上线流程里少了一道回滚演练，属于机制问题"],
    C:["改进项已经拆到下个迭代。","已补齐监控和回滚预案。","建议走正式流程排期处理。",
       "已同步相关方，后续我来兜底。","这个我们自己认一半，另一半是流程的。"]
  },
  group: {
    A:["各位同步一下，","刚和上游确认过，","经初步排查，","打扰大家一下，","简单说明一下情况，"],
    B:["云厂商那个可用区刚才有短暂网络毛刺","是某个历史版本的兼容逻辑在作祟",
       "安全策略升级把回调域名拦了，纯属误伤","数据是上周导入的那批触发了边界情况",
       "上游服务高峰期抖了一下，我们这边是受害者","CDN 那边节点回源异常，已经切走了"],
    C:["已经在推动对方修复了。","先临时绕行，根治方案下个迭代跟上。","有进展我随时同步。",
       "已同步相关方，全员都在看。","不影响大家今天的节奏，继续忙。"]
  },
  boss: {
    A:["和您说一声，","简单汇报一下，","刚处理完，情况是这样，","占用您半分钟，"],
    B:["影响范围已经收住，只涉及部分边缘请求","是外部依赖的变更，我们不在变更链路上",
       "已经止血，补偿脚本在跑","没有数据损失，只是短暂不可用","用户侧无感知，是我们巡检先发现的"],
    C:["目前可控，不需要您介入。","根治方案我这边跟到底。","明天给您一份完整复盘。","后续我会把这块纳入巡检。"]
  },
  client: {
    A:["感谢反馈，我们已定位到原因：","给您同步一下处理进度，","关于刚才的情况，我们这边确认到：","非常抱歉，"],
    B:["是一次计划外的外部变更导致的短暂波动","是环境配置差异引起的，非功能缺陷","网络链路抖动造成的偶发超时","访问量突增触发了限流保护，属于正常防护"],
    C:["已修复，感谢您的耐心。","我们会加一道防护避免再发生。","稍后给您一份书面说明。","给您带来不便，非常抱歉。"]
  }
};const modes=['stand','postmortem','group','boss','client'];let mode=0,last='';function generate(){const a=phrases[modes[mode]];last=pick(a.A)+pick(a.B)+'，'+pick(a.C);el('blameOut').textContent=last;tone(520,.08,'triangle',.08)}el('modes').onclick=e=>{const b=e.target.closest('button');if(!b)return;mode=[...el('modes').children].indexOf(b);[...el('modes').children].forEach((x,i)=>x.classList.toggle('sel',i===mode));sounds.tick();if(last)generate()};el('blame').onclick=generate;el('copy').onclick=async()=>{if(!last){notice('先生成一句再复制');return}try{await navigator.clipboard.writeText(last);notice('已复制，去群里体面地发吧')}catch(_){const t=document.createElement('textarea');t.value=last;document.body.append(t);t.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}t.remove();notice(ok?'已复制':'复制失败，手动选中这行字吧')}};
const replies=[
  "神仙批复：准了。今晚的库稳如老狗。",
  "神仙批复：愿望收到，已转发给值班同事的守护神。",
  "神仙批复：这个愿望上周有人许过，后来他转岗去做产品了。祝好运。",
  "神仙批复：已受理。实现方式可能比较曲折，比如需求被砍了。",
  "神仙批复：准。但代价是明天的需求评审会多开半小时。",
  "神仙批复：池水泛起涟漪——这是「快了」的意思。",
  "神仙批复：愿望很合理，已盖章。附赠一句：记得提交代码再下班。",
  "神仙批复：驳回。愿望里不能有「永远」这种词，数据库都不敢这么写。",
  "神仙批复：准了，但只保到发版前。发版之后的事归运维管。",
  "神仙批复：已记录。神仙说这个得你自己来，他只负责不添乱。",
  "神仙批复：准。附带一个小条件：明天不许再许同一个愿。",
  "神仙批复：收到愿望一份，回赠一句——先把那个 TODO 删了。",
  "神仙批复：池底已经有 99 个人许过这句了，你是第 100 个，排队靠后一点。",
  "神仙批复：神仙看了半天，说这不叫愿望，这叫待办事项。",
  "神仙批复：准了。今晚的告警都归别人。",
  "神仙批复：已上报。上级神仙说这个要开会讨论，你先回去写代码。"
];
function renderWishes(){const box=el('wishes');box.replaceChildren();el('wishCount').textContent=state.wishes.length;if(!state.wishes.length){box.textContent='池子里还是空的，你是第一个许愿的人。';return}state.wishes.forEach((w,i)=>{const row=document.createElement('div'),text=document.createElement('b'),del=document.createElement('button');row.append('🎋 ');text.textContent=w;del.textContent='×';del.setAttribute('aria-label','删除这条愿望');del.onclick=()=>{state.wishes.splice(i,1);save();renderWishes();notice('愿望已撤回')};row.append(text,del);box.prepend(row)})}function wish(){const v=el('wish').value.trim();if(!v){notice('先写个愿望再投币');el('wish').focus();return}const coin=el('coin');coin.classList.remove('flip');void coin.offsetWidth;coin.classList.add('flip');sounds.coin();state.wishes.unshift(v);state.wishes.length=Math.min(state.wishes.length,30);save();renderWishes();el('wishOut').textContent=pick(replies);el('wish').value=''}el('wishBtn').onclick=wish;el('wish').onkeydown=e=>{if(e.key==='Enter')wish()};renderWishes();el('reset').onclick=()=>{if(!confirm('清空这台设备上保存的愿望和计数？清完就找不回来了。'))return;state.wishes=[];state.duck=0;state.smash=0;save();el('duckCount').textContent='0';el('smashCount').textContent='0';renderWishes();notice('已重置，重新开始打工')};

if(!state.duck&&!state.smash&&!state.wishes.length)setTimeout(()=>el('sample').classList.add('hint'),1600);
