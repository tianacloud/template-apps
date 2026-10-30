import { sql } from './db.js';

/* ============ 数据：测试题（12题，每维度3题） ============ */
const TEST = [
 {dim:'E/I',pole:'E',q:'末日里，你更愿意……',opts:['主动联络其他幸存者组队','找人搭伙但不强求','多半独自行动','绝不与人同行']},
 {dim:'E/I',pole:'E',q:'在营地中，你通常……',opts:['成为人群的中心','享受社交但也会累','更爱独处的角落','完全回避集体']},
 {dim:'E/I',pole:'E',q:'听到远处的求救信号，你……',opts:['立刻集结队伍去救','评估后很可能去','优先保全自己','假装没有听见']},
 {dim:'S/N',pole:'S',q:'面对一片废墟，你更关注……',opts:['眼前能用的物资','具体可行的出路','长远的可能','宏大的生存蓝图']},
 {dim:'S/N',pole:'S',q:'做计划时，你倾向……',opts:['列清单按步骤走','有大致安排','留些机动空间','走一步看一步']},
 {dim:'S/N',pole:'S',q:'你更信任……',opts:['经验和事实','实际证据','直觉和灵感','预感与想象']},
 {dim:'T/F',pole:'T',q:'分配稀缺物资时，你……',opts:['按效率与贡献','尽量公平理性','先照顾弱者','谁更可怜帮谁']},
 {dim:'T/F',pole:'T',q:'发生冲突时，你……',opts:['冷静分析对错','讲逻辑也顾情面','先安抚情绪','完全凭感情']},
 {dim:'T/F',pole:'T',q:'救人时，你更看重……',opts:['整体存活率','理性取舍','情感纽带','每个生命都重要']},
 {dim:'J/P',pole:'J',q:'末日作息，你……',opts:['严格按作息表','有节奏但不死板','随情况调整','完全随性']},
 {dim:'J/P',pole:'J',q:'突遇尸潮，你……',opts:['按预案撤离','快速定方案','随机应变','边跑边想']},
 {dim:'J/P',pole:'J',q:'囤积物资，你……',opts:['系统化分类存储','大致归类','够用就行','用到再找']},
];
const ATTRS=['体力','资源','理智','社交'];
const BASE={体力:60,资源:50,理智:60,社交:40};

/* ============ 数据：16型人格 + 天赋 ============ */
const TYPES={
 INTJ:{name:'暗夜建筑师',tl:'战略级物资规划',cat:'trade',bonus:{资源:15,理智:8},
   talent:'战略储备',desc:'在交易类事件中，你总能低价囤到关键物资。',
   lore:'你用一张地图和半盒罐头，换来了整座城市的地下情报网。'},
 INTP:{name:'真理学者',tl:'废墟中的洞察',cat:'explore',bonus:{理智:15},
   talent:'废墟洞察',desc:'在探索类事件中，你总能看穿陷阱、找到真相。',
   lore:'别人在找罐头，你在找世界的答案。'},
 ENTJ:{name:'末日霸主',tl:'铁血资源整合',cat:'combat',bonus:{资源:12,社交:10},
   talent:'铁血整合',desc:'在战斗类事件中，你一边开火一边收编人心。',
   lore:'尸潮退去时，活下来的人开始叫你“首领”。'},
 ENTP:{name:'诡辩者',tl:'混乱中找破局',cat:'combat',bonus:{理智:12,体力:6},
   talent:'临场破局',desc:'在战斗类事件中，你用脑子把劣势扭成优势。',
   lore:'没有你接不住的烂摊子，只有你懒得接的。'},
 INFJ:{name:'引路先知',tl:'守护弱者的直觉',cat:'social',bonus:{社交:12,理智:6},
   talent:'引路直觉',desc:'在社交类事件中，你一句话就能稳住人心。',
   lore:'你未必能救所有人，但每个被你点过头的人都不慌了。'},
 INFP:{name:'理想旅人',tl:'温柔的坚持',cat:'social',bonus:{社交:12,理智:6},
   talent:'温柔坚持',desc:'在社交类事件中，你的真诚能换来真心。',
   lore:'废墟里你种了一盆草，说等春天就有人信了。'},
 ENFJ:{name:'鼓舞领袖',tl:'点燃众人的火',cat:'social',bonus:{社交:15,理智:8},
   talent:'点燃之火',desc:'在社交类事件中，你让一群散兵变成家庭。',
   lore:'你倒下之前，先把希望分给了每一个人。'},
 ENFP:{name:'希望信使',tl:'天生的联结者',cat:'social',bonus:{社交:15},
   talent:'希望联结',desc:'在社交类事件中，你走到哪都能凑出一支队伍。',
   lore:'你笑着把最后一块巧克力掰成了八份。'},
 ISTJ:{name:'末日保管员',tl:'一丝不苟的库存',cat:'trade',bonus:{资源:15},
   talent:'精密库存',desc:'在交易类事件中，你从不被奸商糊弄。',
   lore:'账本比枪更重要——这是你活下来的理由。'},
 ISFJ:{name:'守护天使',tl:'默默兜底的人',cat:'social',bonus:{社交:15},
   talent:'默默守护',desc:'在社交类事件中，你总把 weakest 护在身后。',
   lore:'没人记得你递过的水，但每个人都活下来了。'},
 ESTJ:{name:'铁腕指挥官',tl:'高效的后勤',cat:'trade',bonus:{资源:12,体力:8},
   talent:'高效后勤',desc:'在交易类事件中，你把补给线拉得又稳又长。',
   lore:'“按我的表来”，于是混乱第一次有了秩序。'},
 ESFJ:{name:'温情外交官',tl:'黏合团队的胶',cat:'social',bonus:{社交:12,资源:8},
   talent:'温情黏合',desc:'在社交类事件中，你用一碗热汤收买全场。',
   lore:'营地的气氛，是你一勺一勺搅出来的。'},
 ISTP:{name:'废土巧匠',tl:'什么都能修',cat:'explore',bonus:{资源:15},
   talent:'废土巧手',desc:'在探索类事件中，破烂到你手里就是装备。',
   lore:'你拆了一辆坦克，造了一辆能跑的自行车。'},
 ISFP:{name:'流浪诗人',tl:'独行的自在',cat:'explore',bonus:{体力:15},
   talent:'独行自在',desc:'在探索类事件中，你比谁都耐得住孤单的路。',
   lore:'你哼着歌走过尸群，像逛自家后院。'},
 ESTP:{name:'嗜血冒险家',tl:'硬碰硬的胆',cat:'combat',bonus:{体力:15},
   talent:'硬碰硬',desc:'在战斗类事件中，你越打越精神。',
   lore:'别人躲子弹，你迎着子弹去捡空投。'},
 ESFP:{name:'废墟明星',tl:'绝望里的笑声',cat:'social',bonus:{社交:15},
   talent:'废墟星光',desc:'在社交类事件中，你让末日也有了派对。',
   lore:'你用一段即兴舞蹈，换来了全营地的干粮。'}
};
const TYPE_ORDER=['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
 'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];

/* ============ 数据：事件池（探索/交易/战斗/社交） ============
   设计原则：每个事件都有
   · 一个“稳妥/恢复向”选项（牺牲资源或社交，保全体力/理智）
   · 一个“贪心”选项（换取资源/社交，但消耗体力/理智）
   配合每日 -4体力/-3理智 衰减 + 整局最多 2 次补给，谨慎玩法可持续，鲁莽玩法易死。 */
const POOL=[
 {id:'E1',cat:'explore',title:'废弃超市',desc:'货架大多被翻过，但深处可能还有存货。',
  opts:[{t:'稳妥搜刮（省体力）',m:{资源:10,体力:10,理智:-3}},
        {t:'快速搜门口',m:{资源:6,体力:-2}},
        {t:'深入冒险',m:{资源:22,体力:-12,理智:-5}}]},
 {id:'E2',cat:'explore',title:'地下车库',desc:'昏暗的车库里停着不少车，也许有零件。',
  opts:[{t:'仔细找零件',m:{资源:14,体力:10,理智:-2}},
        {t:'只拿可见物资',m:{资源:6}},
        {t:'撬车冒险',m:{资源:20,体力:-12}}]},
 {id:'E3',cat:'explore',title:'医院废墟',desc:'药品或许能救命，但弥漫着危险气息。',
  opts:[{t:'翻找药品',m:{资源:8,体力:6,理智:8}},
        {t:'找安眠药休息',m:{体力:15,理智:10,资源:-5}},
        {t:'不碰医疗区',m:{理智:-3}}]},
 {id:'E4',cat:'explore',title:'公路驿站',desc:'一处在地图边缘的补给点。',
  opts:[{t:'搜刮加油站',m:{资源:14,体力:12}},
        {t:'设陷阱等猎物',m:{体力:-3,资源:10,理智:-2}},
        {t:'直接上路',m:{体力:-2}}]},
 {id:'E5',cat:'explore',title:'河边取水',desc:'水是生命线，但下游可能已被污染。',
  opts:[{t:'上游取水',m:{体力:12,资源:10,理智:-2}},
        {t:'下游就近',m:{资源:8,理智:-3}},
        {t:'暂不取水',m:{体力:-2}}]},
 {id:'E6',cat:'explore',title:'安全屋休整',desc:'一处暂时安全的地方，可以喘口气。',
  opts:[{t:'酣睡一觉',m:{体力:18,理智:10,资源:-3}},
        {t:'整理物资',m:{资源:10,理智:5,体力:-2}},
        {t:'主动守夜',m:{理智:3,社交:3,体力:-4}}]},
 {id:'T1',cat:'trade',title:'流浪商队',desc:'一支走南闯北的商队愿意交易。',
  opts:[{t:'用物资换休整',m:{资源:-6,体力:16}},
        {t:'用资源换情报',m:{资源:-8,理智:10}},
        {t:'体力换大量物资',m:{体力:-12,资源:22}}]},
 {id:'T2',cat:'trade',title:'黑市',desc:'暗处的交易，价高但风险也高。',
  opts:[{t:'高价买药恢复',m:{资源:-12,体力:12,理智:4}},
        {t:'卖出多余物资',m:{资源:14,理智:-3}},
        {t:'顺手偷窃',m:{资源:18,理智:-10,社交:-8}}]},
 {id:'T3',cat:'trade',title:'以物易物',desc:'幸存者想用东西换你手里的货。',
  opts:[{t:'换食物',m:{资源:-8,体力:18}},
        {t:'换药品',m:{资源:-10,理智:12}},
        {t:'换同伴信任',m:{资源:-6,社交:12}}]},
 {id:'T4',cat:'trade',title:'拾荒者窝点',desc:'一处可合作开发的资源点。',
  opts:[{t:'合作开发',m:{资源:12,社交:8,理智:-2}},
        {t:'独占资源',m:{资源:22,社交:-10}},
        {t:'退出观望',m:{理智:5,体力:9}}]},
 {id:'T5',cat:'trade',title:'旧军营',desc:'曾经的军事据点，物资诱人。',
  opts:[{t:'搜刮粮食',m:{资源:14,体力:13}},
        {t:'搜刮军火',m:{资源:16,体力:-8,理智:-4}},
        {t:'快速离开',m:{理智:3}}]},
 {id:'C1',cat:'combat',title:'尸群遭遇',desc:'一小波丧尸挡住了去路。',
  opts:[{t:'硬刚突破',m:{体力:-16,资源:10,理智:-6}},
        {t:'绕路避开',m:{体力:-3,理智:5}},
        {t:'设陷阱脱身',m:{体力:-6,资源:8,理智:-2}}]},
 {id:'C2',cat:'combat',title:'劫匪',desc:'几个落单的劫匪盯上了你。',
  opts:[{t:'战斗驱离',m:{体力:-14,资源:5}},
        {t:'破财消灾',m:{资源:-12,理智:3}},
        {t:'试图谈判',m:{社交:-5,资源:-5,理智:8}}]},
 {id:'C3',cat:'combat',title:'屋顶狙击',desc:'高处有狙击手，你得做决定。',
  opts:[{t:'反击狙杀',m:{理智:5,资源:-5,体力:-4}},
        {t:'隐蔽躲藏',m:{体力:-3,理智:2}},
        {t:'引开火力',m:{体力:-10,社交:5}}]},
 {id:'C4',cat:'combat',title:'尸潮小队战',desc:'一场小规模的尸潮需要团队协作。',
  opts:[{t:'带头冲锋',m:{体力:-12,社交:12,资源:8}},
        {t:'稳固防守',m:{体力:-6,理智:6}},
        {t:'果断撤离',m:{体力:-4,社交:-5}}]},
 {id:'C5',cat:'combat',title:'辐射区',desc:'一片残留辐射的禁区，物资却很丰厚。',
  opts:[{t:'穿防化服深入',m:{资源:20,体力:-10,理智:-4}},
        {t:'远远观察',m:{理智:6,体力:9}},
        {t:'绕行避开',m:{体力:-3}}]},
 {id:'S1',cat:'social',title:'幸存者求救',desc:'废墟下有微弱的呼救声。',
  opts:[{t:'全力救援',m:{体力:-8,社交:15,资源:-5}},
        {t:'给物资不冒险',m:{资源:-8,社交:10}},
        {t:'假装没听见',m:{社交:-12,理智:3}}]},
 {id:'S2',cat:'social',title:'营地选举',desc:'幸存者们要选一个带头人。',
  opts:[{t:'参选领袖',m:{社交:12,理智:-3,体力:-3}},
        {t:'支持他人',m:{社交:8}},
        {t:'退出回避',m:{理智:5,社交:-3}}]},
 {id:'S3',cat:'social',title:'孩童走失',desc:'营地里一个孩子不见了。',
  opts:[{t:'倾力寻找',m:{体力:-10,社交:12,理智:-3}},
        {t:'派人寻找',m:{资源:-6,社交:6}},
        {t:'顾不上',m:{社交:-10,理智:3}}]},
 {id:'S4',cat:'social',title:'恋人争执',desc:'营地两人为分配吵得不可开交。',
  opts:[{t:'出面调解',m:{社交:10,理智:4}},
        {t:'回避是非',m:{社交:-5,理智:5}},
        {t:'站队支持一方',m:{社交:5,理智:-2}}]},
 {id:'S5',cat:'social',title:'老人遗赠',desc:'一位老人想托付最后的物品。',
  opts:[{t:'悉心照料他',m:{社交:12,资源:-5,理智:4}},
        {t:'取走物资离开',m:{资源:14,社交:-8}},
        {t:'陪伴他终老',m:{社交:15,理智:8,资源:-8}}]}
];

/* ============ 数据：里程碑 + 补救 ============ */
const MILES={
 3:{id:'M3',cat:'social',title:'【里程碑·第3天】初遇营地',desc:'你发现了第一个幸存者营地，是否加入？',
    opts:[{t:'正式加入',m:{社交:15,资源:-5,理智:-3}},
          {t:'短暂合作',m:{资源:8,社交:5}},
          {t:'拒绝，继续独行',m:{理智:5,社交:-5}}]},
 7:{id:'M7',cat:'trade',title:'【里程碑·第7天】资源争夺',desc:'一处丰厚的物资点，多方势力虎视眈眈。',
    opts:[{t:'武力夺取',m:{体力:-15,资源:20,社交:-8}},
          {t:'谈判瓜分',m:{社交:-3,资源:10,理智:5}},
          {t:'主动退让',m:{理智:3,资源:-3}}]},
 15:{id:'M15',cat:'combat',title:'【里程碑·第15天】尸潮总攻',desc:'一场大规模尸潮席卷而来！',
    opts:[{t:'死守阵地',m:{体力:-20,资源:10,社交:12}},
          {t:'有序转移',m:{体力:-12,理智:5}},
          {t:'弃城而逃',m:{社交:-10,资源:5}}]},
 30:{id:'M30',cat:'social',title:'【终章·第30天】末日抉择',desc:'三十天过去，你站在废墟之巅，要如何选择？',
    opts:[{t:'建立新秩序',m:{社交:15,资源:10,理智:5}},
          {t:'独自远行',m:{体力:10,理智:5,社交:-10}},
          {t:'守护弱者',m:{社交:12,理智:8,资源:-8}}]}
};
const REMEDY={
 体力:{id:'REM_HP',cat:'explore',title:'【补救·临时安全屋】',desc:'你找到一处可遮蔽的角落，必须抓紧恢复体力。',
    opts:[{t:'充分休息',m:{体力:25,理智:5,资源:-3}},
          {t:'勉强进食',m:{体力:14,资源:4}},
          {t:'强撑前行',m:{体力:3}}]},
 理智:{id:'REM_SAN',cat:'social',title:'【补救·静心之所】',desc:'连续紧绷的神经需要放松，否则你会崩溃。',
    opts:[{t:'冥想静心',m:{理智:25,体力:3}},
          {t:'写末日日记',m:{理智:15,社交:3}},
          {t:'借酒消愁',m:{理智:8,体力:-3}}]}
};

/* ============ 数据：结局 ============ */
const ENDINGS={
 leader:{name:'末日领袖',flavor:'你不是活下来，你是带着一群人活下来。'},
 lone:{name:'孤独幸存者',flavor:'世界只剩你，和你的影子。'},
 philosopher:{name:'末日哲学家',flavor:'你失去了很多人，但你想通了很多事。'},
 utopia:{name:'乌托邦建立者',flavor:'你用罐头换来了笑声，废墟里长出了新秩序。'},
 sacrifice:{name:'悲壮牺牲者',flavor:'你倒下的地方，后来有人立了碑。'},
 hidden:{name:'隐藏·乌托邦',flavor:'别人在求生，你在建天堂。这才是真正的隐藏结局。'}
};
const ENDING_KEYS=Object.keys(ENDINGS);

/* ============ 状态 ============ */
let st=null, gameEpoch=0;
function gameDelay(fn,ms){const epoch=gameEpoch;setTimeout(()=>{if(epoch===gameEpoch)fn()},ms)}
function freshState(type){
  return {type, attrs:{...BASE}, day:1, locked:false, remedyArmed:null,
          remedyUsed:0, log:[], lastEventId:null, currentEvent:null};
}

/* ============ 工具 ============ */
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));
  document.getElementById(id).classList.add('on');window.scrollTo(0,0);}
function clamp(v){return Math.max(0,Math.min(100,v));}
function modsText(m){
  let s='';
  for(const k of ATTRS){ if(m[k]) s+= (m[k]>0?'+':'')+m[k]+k+' '; }
  return s.trim();
}
function bonusText(b){let s='';for(const k in b){s+=(b[k]>0?'+':'')+b[k]+k+' ';}return s.trim();}
function chipsHTML(m){
  let h='<div class="ochip">';
  for(const k of ATTRS){ if(m[k]){const c=m[k]>0?'g':'b';h+=`<span class="chip ${c}">${k}${m[k]>0?'+':''}${m[k]}</span>`;} }
  return h+'</div>';
}
let unlockedCache=[], boardCache={};
function loadUnlocked(){return unlockedCache}
async function refreshRecords(){
  const rows=await sql('SELECT ending, personality, score, ranked FROM game_results');
  unlockedCache=[...new Set(rows.map(r=>r.ending))]; boardCache={};
  for(const row of rows){if(Number(row.ranked)!==1)continue;const rec=boardCache[row.personality]||{best:0,plays:0};rec.best=Math.max(rec.best,Number(row.score));rec.plays++;rec.last=Number(row.score);boardCache[row.personality]=rec;}
  refreshHomeUnlock();
}

/* ============ 首页 ============ */
function refreshHomeUnlock(){
  const n=loadUnlocked().length;
  document.getElementById('homeUnlock').textContent=`已解锁结局 ${n} / ${ENDING_KEYS.length}`;
}

/* ============ 测试流程 ============ */
let testState=null;
function startTest(){
  testState={idx:0,scores:{E:0,S:0,T:0,J:0}};
  show('test');renderTest();
}
function renderTest(){
  const i=testState.idx, item=TEST[i];
  document.getElementById('testProg').textContent=`第 ${i+1} / ${TEST.length} 题`;
  document.getElementById('testBar').style.width=(i/TEST.length*100)+'%';
  document.getElementById('testQ').textContent=item.q;
  const box=document.getElementById('testOpts');box.innerHTML='';
  const labels=['A 非常符合','B 比较符合','C 不太符合','D 完全不符'];
  item.opts.forEach((o,oi)=>{
    const b=document.createElement('button');b.className='opt';
    const v=[2,1,-1,-2][oi];
    b.innerHTML=`<b style="color:var(--amber)">${labels[oi].split(' ')[0]}</b> · ${o}`;
    b.onclick=()=>pickTest(item,v);
    box.appendChild(b);
  });
}
function pickTest(item,v){
  testState.scores[item.pole]+=v;
  testState.idx++;
  if(testState.idx<TEST.length){renderTest();}
  else finishTest();
}
function finishTest(){
  const s=testState.scores;
  const type=(s.E>=0?'E':'I')+(s.S>=0?'S':'N')+(s.T>=0?'T':'F')+(s.J>=0?'J':'P');
  enterReveal(type);
}

/* ============ 自选人格 ============ */
function openSelect(){
  const grid=document.getElementById('typeGrid');grid.innerHTML='';
  TYPE_ORDER.forEach(tp=>{
    const b=document.createElement('button');
    b.textContent=tp;
    b.onclick=()=>{closeModal('selectModal');enterReveal(tp);};
    grid.appendChild(b);
  });
  document.getElementById('selectModal').classList.add('on');
}
function closeModal(id){document.getElementById(id).classList.remove('on');}

/* ============ 鉴定页 ============ */
function enterReveal(type){
  st=freshState(type);
  const t=TYPES[type];
  document.getElementById('rvBadge').textContent=type;
  document.getElementById('rvName').textContent=type+' · '+t.name;
  document.getElementById('rvTl').textContent=t.tl;
  document.getElementById('rvBars').innerHTML=avatarHTML(st.attrs);
  document.getElementById('rvTalName').textContent='🌟 天赋 · '+t.talent;
  document.getElementById('rvTalDesc').textContent=t.desc;
  document.getElementById('rvLore').textContent='“'+t.lore+'”';
  show('reveal');
}
/* ============ 动态小人：按四维数值塑造角色 ============ */
function tier(v,lo,mid,hi){return v>=hi?3:v>=mid?2:v>=lo?1:0;} // 0极差 1差 2一般 3良好
function avatarSVG(a){
  const hp=a.体力,res=a.资源,san=a.理智,soc=a.社交;
  const tHp=tier(hp,20,45,70), tRes=tier(res,20,45,70), tSan=tier(san,20,45,70), tSoc=tier(soc,20,45,70);
  // 站姿：0 濒死(深蹲) / 1 佝偻 / 2 半屈 / 3 挺拔
  // hipY=髋部高度(越小越蹲)，footY 恒为地面(54)，躯干永远在脚之上
  const lean=[16,8,3,0][tHp];
  const hipY=[50,43,36,30][tHp];
  const footY=54;
  const legLen=Math.max(3,footY-hipY);
  const skin=['#a8846a','#b8927a','#c9a184','#d9b494'][tHp];
  const coat=['#8a5a3c','#94633f','#9d6d45','#a6764b'][tRes];
  const pants=['#3f3229','#4a3b30','#544438','#5e4d40'][tHp];
  // 背包：资源越高越大越新（深色，与大衣形成对比）
  const packW=[0,11,18,25][tRes], packH=[0,13,21,29][tRes];
  const packCol=['#4a3c2e','#574535','#634f3c','#6f5a44'][tRes];
  // 同伴数量
  const mates=[0,0,1,2][tSoc];
  let m='';
  for(let i=0;i<mates;i++){
    const x=[20,98][i]||20, sc=0.68;
    m+=`<g class="bob" style="animation-delay:${i*0.45}s" transform="translate(${x},112) scale(${sc})" opacity=".8">
      <circle cx="0" cy="-40" r="11" fill="#9a8069"/><path d="M-11 -28 h22 v28 h-22 z" fill="#6b5a4a"/>
      <path d="M-11 -22 q-7 5 -6 14" stroke="#8a7460" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M11 -22 q7 5 6 13" stroke="#8a7460" stroke-width="6" stroke-linecap="round" fill="none"/>
      <circle cx="-4" cy="-42" r="1.9" fill="#241b14"/><circle cx="4" cy="-42" r="1.9" fill="#241b14"/></g>`;
  }
  // 资源携带物（从背包顶部露出：背包 x=-31 顶 y=10，物资底插入包内 y=12）
  let loot='';
  if(tRes>=2) loot+=`<rect x="-30" y="-4" width="7" height="16" rx="2" fill="#b9b2a4"/>`;
  if(tRes>=3) loot+=`<rect x="-21" y="-8" width="6" height="20" rx="3" fill="#8fa86a"/>`;
  // 理智：眼神（头部局部坐标）
  let eyes='';
  if(tSan===3) eyes=`<circle cx="-6" cy="-16" r="2.6" fill="#241b14"/><circle cx="6" cy="-16" r="2.6" fill="#241b14"/>
    <path d="M-9 -19 l-4 -3 M9 -19 l4 -3" stroke="#241b14" stroke-width="1.6" stroke-linecap="round"/>`;
  else if(tSan===2) eyes=`<circle cx="-6" cy="-16" r="2.4" fill="#241b14"/><circle cx="6" cy="-16" r="2.4" fill="#241b14"/>`;
  else if(tSan===1) eyes=`<path d="M-9 -16 h6 M3 -16 h6" stroke="#241b14" stroke-width="2" stroke-linecap="round"/>`;
  else eyes=`<path d="M-9 -15 l6 3 M9 -15 l-6 3" stroke="#241b14" stroke-width="2" stroke-linecap="round"/>
    <path d="M-6 -18 h12" stroke="#241b14" stroke-width="1.6" stroke-linecap="round"/>`;
  // 头顶状态符号（相对头部定位）
  let halo='';
  if(tSan===0) halo=`<text x="0" y="-30" font-size="15" text-anchor="middle" fill="#ff6a2b" class="pop">✷</text>`;
  else if(tHp===0) halo=`<text x="0" y="-30" font-size="15" text-anchor="middle" fill="#ff6a2b" class="pop">✚</text>`;
  else if(tSoc===0) halo=`<text x="0" y="-30" font-size="15" text-anchor="middle" fill="#8a7a68" class="pop">…</text>`;
  // 伤口绷带
  let wound='';
  if(tHp<=1){wound+=`<path d="M-9 -22 l18 8" stroke="#e8e0d2" stroke-width="3.4" stroke-linecap="round" opacity=".92"/>`;}
  if(tHp===0){wound+=`<path d="M12 6 l7 7 M19 6 l-7 7" stroke="#c0392b" stroke-width="2.4" stroke-linecap="round"/>`;}
  // 汗滴
  const sweat=tHp<=1||tSan<=1?`<circle cx="16" cy="-14" r="2" fill="#6fc3e8" class="drip"/>`:'';
  return `<svg class="av" viewBox="0 0 128 132" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2a1d12"/><stop offset="1" stop-color="#150f0a"/></linearGradient></defs>
  <rect width="128" height="132" fill="url(#skyG)"/>
  <circle cx="104" cy="20" r="15" fill="#ff6a2b" opacity=".13"/>
  <circle cx="18" cy="112" r="26" fill="#ff6a2b" opacity=".07"/>
  <path d="M0 108 h128" stroke="#3a2a1c" stroke-width="1.4" stroke-dasharray="5 5"/>
  ${m}
  <g transform="translate(58,58)">
    <g class="${tSan===0||tHp===0?'shk':'breathe'}">
      <ellipse cx="0" cy="${footY+2}" rx="17" ry="3.4" fill="#000" opacity=".3"/>
      <g transform="rotate(${lean})">
        ${packW?`<g><rect x="-31" y="10" width="${packW}" height="${packH}" rx="4" fill="${packCol}"/>
        <path d="M-31 20 h${packW}" stroke="#000" stroke-width="1" opacity=".25"/>
        ${loot}</g>`:''}
        <path d="M-8 ${hipY} l-3 ${legLen*0.55} l1 ${legLen*0.45}" stroke="${pants}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M8 ${hipY} l4 ${legLen*0.55} l-1 ${legLen*0.45}" stroke="${pants}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M-14 ${footY} h10" stroke="#241b14" stroke-width="4" stroke-linecap="round"/>
        <path d="M7 ${footY} h11" stroke="#241b14" stroke-width="4" stroke-linecap="round"/>
        <rect x="-13" y="0" width="26" height="${hipY-10}" rx="8" fill="${coat}"/>
        <path d="M-13 ${hipY-16} h26" stroke="#000" stroke-width="1" opacity=".18"/>
        <path d="M-13 ${hipY-26} q-9 6 -8 18" stroke="${skin}" stroke-width="7" stroke-linecap="round" fill="none"/>
        <path d="M13 ${hipY-26} q9 6 8 16" stroke="${skin}" stroke-width="7" stroke-linecap="round" fill="none"/>
        <g transform="translate(0,${hipY-42})">
          ${halo}
          <circle cx="0" cy="0" r="15" fill="${skin}"/>
          <path d="M-15 2 q-3 -14 15 -14 t15 14 q-4 -7 -15 -6 t-15 6z" fill="#3a2a1e"/>
          ${eyes}
          <path d="M-5 9 q5 ${tSan>=2?3:2} 10 ${tSan>=2?-1:0}" stroke="#3a2a1e" stroke-width="1.6" fill="none" stroke-linecap="round"/>
          ${wound}
          ${sweat}
        </g>
      </g>
    </g>
  </g>
  ${tSoc===0?`<text x="18" y="126" font-size="10" fill="#6a5f50">独行</text>`:''}
  </svg>`;
}
function avatarHTML(a){
  const ic={'体力':'❤️','资源':'🎒','理智':'🧠','社交':'👥'};
  const col={'体力':'var(--hp)','资源':'var(--res)','理智':'var(--san)','社交':'var(--soc)'};
  const tag={'体力':a.体力>=70?'健壮':a.体力>=45?'正常':a.体力>=20?'疲惫':'重伤',
    '资源':a.资源>=70?'充足':a.资源>=45?'够用':a.资源>=20?'匮乏':'弹尽粮绝',
    '理智':a.理智>=70?'清醒':a.理智>=45?'稳定':a.理智>=20?'动摇':'疯狂',
    '社交':a.社交>=70?'人缘好':a.社交>=45?'有同伴':a.社交>=20?'独行':'彻底孤独'};
  let chips='';
  for(const k of ATTRS){chips+=`<span class="vchip" style="--c:${col[k]}"><i>${ic[k]}</i>${k}<b>${a[k]}</b></span>`;}
  let tg='';
  for(const k of ATTRS){const g=a[k]>=70?'g':a[k]>=20?'':'b';tg+=`<span class="${g}">${tag[k]}</span>`;}
  return `<div class="vitalrow"><div style="flex:1;min-width:0">
      <div class="vchips">${chips}</div>
      <div class="avtag">${tg}</div>
    </div>
    <div class="avbox">${avatarSVG(a)}</div></div>`;
}

/* ============ 开局 ============ */
function beginDays(){
  st=freshState(st.type);
  show('survival');renderDay();
}

/* ============ 生存页 ============ */
function getEventForDay(day){
  if(day===30) return MILES[30];
  if(st.remedyArmed) return REMEDY[st.remedyArmed];
  if([3,7,15].includes(day)) return MILES[day];
  let ev;let tries=0;
  do{ ev=POOL[Math.floor(Math.random()*POOL.length)]; tries++; }
  while(ev.id===st.lastEventId && tries<8);
  return ev;
}
function renderDay(){
  const t=TYPES[st.type];
  document.getElementById('dayLabel').textContent='末日第 '+st.day+' 天';
  document.getElementById('svBadge').textContent=st.type;
  document.getElementById('svName').textContent=st.type+' · '+t.name;
  document.getElementById('svTal').textContent='天赋：'+t.talent;
  document.getElementById('svBars').innerHTML=avatarHTML(st.attrs);
  // calendar
  const cal=document.getElementById('cal');cal.innerHTML='';
  for(let d=1;d<=30;d++){
    const c=document.createElement('div');c.className='d';
    c.textContent=d;
    if(d<st.day)c.classList.add('done');
    if(d===st.day)c.classList.add('cur');
    if([3,7,15,30].includes(d))c.classList.add('ms');
    cal.appendChild(c);
  }
  // warning banner
  const wb=document.getElementById('warnBox');
  if(st.remedyArmed){
    const left=2-st.remedyUsed;
    wb.innerHTML=`<div class="warn">⚠️ 警告：你的【${st.remedyArmed}】已低于 20！触发「补救事件」（本局剩余补给 ${left} 次），抓住机会恢复。</div>`;
  }
  else wb.innerHTML='';
  // event
  const ev=getEventForDay(st.day);
  st.currentEvent=ev;st.lastEventId=ev.id;
  const catName={explore:'探索',trade:'交易',combat:'战斗',social:'社交'}[ev.cat];
  const box=document.getElementById('evBox');
  let html=`<div class="ev"><span class="cat">${catName}</span><h3>${ev.title}</h3>
    <div class="desc">${ev.desc}</div>`;
  ev.opts.forEach((o,oi)=>{
    html+=`<button class="opt" data-action="choose" data-argument="${oi}" style="border-color:var(--line)">
      <div>${o.t}</div></button>`;
  });
  html+='</div>';
  box.innerHTML=html;
}

function choose(oi){
  if(st.locked)return; st.locked=true;
  const ev=st.currentEvent, opt=ev.opts[oi];
  const t=TYPES[st.type];
  let mods={...opt.m};
  let talentLine='';
  if(t.cat===ev.cat){
    for(const k in t.bonus) mods[k]=(mods[k]||0)+t.bonus[k];
    talentLine=`你的【${t.talent}】天赋生效（${bonusText(t.bonus)}）`;
  }
  const changes={};
  for(const k of ATTRS){
    const before=st.attrs[k];
    const after=clamp(before+(mods[k]||0));
    st.attrs[k]=after; changes[k]=after-before;
  }
  // 每日自然衰减
  const decay={体力:-4,理智:-3};
  for(const k of ['体力','理智']){
    const before=st.attrs[k];
    const after=clamp(before+decay[k]);
    st.attrs[k]=after; changes[k]=(changes[k]||0)+(after-before);
  }
  // 日志
  st.log.push({day:st.day,ev:ev.title,choice:opt.t,changes,talent:talentLine});
  // 渲染结果
  renderResult(ev,opt,changes,talentLine);
  // 死亡判定（仅体力/理智归零 → 重新开局）
  const dead=st.attrs.体力<=0||st.attrs.理智<=0;
  if(dead){ gameDelay(()=>endGame(true),2300); return; }
  // 预警 + 补救武装（整局最多 2 次补给）
  if(!st.remedyArmed && st.remedyUsed<2){
    if(st.attrs.体力<20) st.remedyArmed='体力';
    else if(st.attrs.理智<20) st.remedyArmed='理智';
  }
  // 补救事件触发后：消耗一次补给额度并解除武装
  if(ev.id && ev.id.indexOf('REM_')===0){ st.remedyArmed=null; st.remedyUsed++; }
  // 终章
  if(st.day===30){ gameDelay(()=>endGame(false),2300); return; }
  gameDelay(()=>{ st.day++; st.locked=false; renderDay(); },2300);
}

function renderResult(ev,opt,changes,talentLine){
  let html=`<div class="ev result"><span class="cat">结果</span><h3>${ev.title}</h3>
    <div style="color:var(--muted);font-size:13px;margin-bottom:8px">你选择了：${opt.t}</div>`;
  for(const k of ATTRS){
    if(changes[k]){const c=changes[k]>0?'g':'b';
      html+=`<div class="rrow"><span>${k}</span><span class="chip ${c}">${changes[k]>0?'+':''}${changes[k]}</span></div>`;}
  }
  if(talentLine) html+=`<div class="talent">⚡ ${talentLine}</div>`;
  html+='<div style="text-align:center;color:var(--muted);font-size:12px;margin-top:10px">2 秒后进入下一天…</div></div>';
  document.getElementById('evBox').innerHTML=html;
  document.getElementById('svBars').innerHTML=avatarHTML(st.attrs);
}

/* ============ 日志 ============ */
function openLog(){
  const box=document.getElementById('logBox');
  if(!st||!st.log.length){box.innerHTML='<div style="color:var(--muted);font-size:13px">还没有记录。</div>';}
  else{
    box.innerHTML=st.log.map(r=>{
      let diff=ATTRS.filter(k=>r.changes[k]).map(k=>`${k}${r.changes[k]>0?'+':''}${r.changes[k]}`).join(' ');
      return `<div class="logrow"><div class="lh">第${r.day}天 · ${r.ev}</div>
        选择：${r.choice}<br>变化：${diff}${r.talent?'<br><span style="color:#bdf08a">'+r.talent+'</span>':''}</div>`;
    }).join('');
  }
  document.getElementById('logModal').classList.add('on');
}

/* ============ 结局 ============ */
function evaluateEnding(dead){
  const a=st.attrs;
  if(dead) return 'sacrifice';
  // 隐藏·乌托邦：在废土里真正建起"天堂"——物资充裕、人心归附、头脑清醒（组合条件）
  if(a.资源>=70 && a.社交>=65 && a.理智>=60) return 'hidden';
  if(a.资源>=75 && a.社交>=55) return 'utopia';
  if(a.社交>=70) return 'leader';
  if(a.理智>=65) return 'philosopher';
  if(a.社交<=25) return 'lone';
  return 'leader';
}
async function endGame(dead){
  const epoch=gameEpoch;
  const key=evaluateEnding(dead);
  const e=ENDINGS[key];
  const score=computeScore(dead,key);
  try {
    const id=crypto.randomUUID();
    await sql('INSERT INTO game_results (id, ending, personality, score) VALUES (?, ?, ?, ?)',[id,key,st.type,score]);
    await refreshRecords();
  } catch(error) {
    alert('结局保存未确认，请检查网络并刷新后查看排行榜。');
  }
  if(epoch!==gameEpoch)return;
  const unlocked=loadUnlocked();
  document.getElementById('endTitle').textContent='『'+e.name+'』';
  document.getElementById('endFlavor').textContent=e.flavor;
  document.getElementById('endUnlock').textContent=`已解锁结局 ${unlocked.length} / ${ENDING_KEYS.length}`;
  drawCard(key,dead);
  renderMiniBoard();
  show('ending');
}

/* ============ 人格团队排行榜 ============ */
const ENDING_SCORE={sacrifice:0,lone:40,philosopher:55,leader:70,utopia:85,hidden:100};
function loadBoard(){return boardCache}
function computeScore(dead,key){
  const a=st.attrs;
  const days=st.day;                       // 撑过的天数（死亡=倒下当天；通关=30）
  const survivedBonus=dead?0:150;          // 通关加成
  const attrSum=a.体力+a.资源+a.理智+a.社交; // 四维之和（上限 400）
  return days*10 + (ENDING_SCORE[key]||0) + attrSum + survivedBonus;
}
function rankedBoard(){
  const board=loadBoard();
  return TYPE_ORDER.map(tp=>({
    tp, name:TYPES[tp].name,
    best:(board[tp]&&board[tp].best)||0,
    plays:(board[tp]&&board[tp].plays)||0
  })).sort((a,b)=>b.best-a.best);
}
function renderMiniBoard(){
  const rows=rankedBoard().slice(0,5);
  let h='<div style="font-size:13px;color:var(--amber);margin-bottom:8px">🏆 人格团队排行榜（前 5）</div>';
  if(rows.every(r=>r.best===0)){
    h+='<div style="font-size:13px;color:var(--muted);padding:6px 0">还没有队伍拿到声望，快去末日里拼一把！</div>';
  }else{
    rows.forEach((r,i)=>{
      const medal=['🥇','🥈','🥉'][i]||('#'+(i+1));
      const me=r.tp===st?.type?' style="outline:1px solid var(--orange);border-radius:8px"':'';
      h+=`<div class="brow"${me}><span>${medal} <b>${r.tp}</b> ${r.name}</span><span class="bv">${r.best}分</span></div>`;
    });
  }
  h+='<button class="btn sm ghost" style="margin-top:10px" data-action="openBoard">查看完整 16 队排行榜</button>';
  document.getElementById('endBoard').innerHTML=h;
}
function openBoard(){
  const rows=rankedBoard();
  let h='';
  rows.forEach((r,i)=>{
    const medal=['🥇','🥈','🥉'][i]||('#'+(i+1));
    const me=r.tp===st?.type?' me':'';
    h+=`<div class="brow${me}"><span>${medal} <b>${r.tp}</b> ${r.name}<span class="bp">${r.plays}局</span></span><span class="bv">${r.best}分</span></div>`;
  });
  document.getElementById('boardBox').innerHTML=h;
  document.getElementById('boardModal').classList.add('on');
}
async function resetBoard(){ try { await sql('UPDATE game_results SET ranked = 0 WHERE ranked = 1'); await refreshRecords(); renderMiniBoard(); openBoard(); } catch(error) { alert('清空排行榜未确认，请刷新后查看。'); } }

/* ============ Canvas 分享卡 ============ */
function drawCard(key,dead){
  const c=document.getElementById('shareCanvas');const x=c.getContext('2d');
  const W=c.width,H=c.height;
  const g=x.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#1a120c');g.addColorStop(1,'#0a0807');
  x.fillStyle=g;x.fillRect(0,0,W,H);
  // hazard strip
  for(let i=0;i<W;i+=24){x.fillStyle=(i/24)%2? '#3a2817':'#2a1d12';x.fillRect(i,0,12,16);}
  x.fillStyle='#ffb347';x.font='bold 22px sans-serif';x.textAlign='center';
  x.fillText('MBTI 末日生存模拟器',W/2,52);
  const t=TYPES[st.type];
  // badge
  x.fillStyle='#ff8a3d';roundRect(x,W/2-54,72,108,108,16);x.fill();
  x.fillStyle='#1a120b';x.font='bold 30px sans-serif';x.fillText(st.type,W/2,128);
  x.font='bold 17px sans-serif';x.fillText(t.name,W/2,156);
  // ending
  x.fillStyle='#ff6a2b';x.font='bold 30px sans-serif';
  x.fillText('『'+ENDINGS[key].name+'』',W/2,212);
  x.fillStyle='#c9bca8';x.font='14px sans-serif';
  const fl=ENDINGS[key].flavor;wrapText(x,fl,W/2,240,W-80,20);
  // survived
  x.fillStyle='#ece3d6';x.font='bold 18px sans-serif';
  x.fillText(dead?('倒在了第 '+st.day+' 天'):('成功撑过 30 天'),W/2,300);
  // attrs bars
  let y=330;const colors={'体力':'#ff6a2b','资源':'#ffb347','理智':'#5bc0eb','社交':'#b388ff'};
  for(const k of ATTRS){
    x.fillStyle='#9a8f80';x.font='14px sans-serif';x.textAlign='left';
    x.fillText(k,60,y);
    x.fillStyle='#241b14';roundRect(x,120,y-10,360,16,8);x.fill();
    x.fillStyle=colors[k];roundRect(x,120,y-10,360*(st.attrs[k]/100),16,8);x.fill();
    x.fillStyle='#ece3d6';x.textAlign='right';x.fillText(st.attrs[k],480,y+4);
    y+=38;
  }
  // talent
  x.textAlign='center';x.fillStyle='#7ed957';x.font='bold 15px sans-serif';
  x.fillText('天赋 · '+t.talent,W/2,520);
  x.fillStyle='#c9bca8';x.font='13px sans-serif';
  wrapText(x,t.desc,W/2,546,W-80,18);
  // footer
  const n=loadUnlocked().length;
  x.fillStyle='#ffb347';x.font='bold 15px sans-serif';
  x.fillText('已解锁结局 '+n+' / '+ENDING_KEYS.length,W/2,640);
  x.fillStyle='#6a5f50';x.font='12px sans-serif';
  x.fillText('— 你的人格，决定你的末日 —',W/2,672);
}
function roundRect(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);
  x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath();}
function wrapText(x,text,cx,y,maxW,lh){
  const chars=text.split('');let line='',yy=y;
  for(const ch of chars){const test=line+ch;
    if(x.measureText(test).width>maxW){x.fillText(line,cx,yy);line=ch;yy+=lh;}else line=test;}
  x.fillText(line,cx,yy);
}
function downloadCard(){
  const c=document.getElementById('shareCanvas');
  try{const a=document.createElement('a');
    a.download='MBTI末日生存_'+st.type+'.png';
    a.href=c.toDataURL('image/png');a.click();
  }catch(e){alert('当前环境不支持下载，可长按图片保存。');}
}

/* ============ 导航 ============ */
function goHome(){
  gameEpoch++; document.querySelectorAll('.modal').forEach(m=>m.classList.remove('on'));
  st=null;refreshHomeUnlock();show('home');
}
window.addEventListener('DOMContentLoaded',refreshHomeUnlock);

Object.assign(window,{startTest,openSelect,closeModal,beginDays,choose,openLog,openBoard,resetBoard,downloadCard,goHome});

refreshRecords().catch(()=>{document.getElementById('homeUnlock').textContent='数据库连接失败，请刷新重试';});

const actions={startTest,openSelect,closeModal,beginDays,choose,openLog,openBoard,resetBoard,downloadCard,goHome};
document.getElementById('app').addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');
  if(!button || !Object.hasOwn(actions,button.dataset.action))return;
  const argument=button.dataset.argument;
  actions[button.dataset.action](argument);
});
