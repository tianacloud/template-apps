
const KEY='pet-care-v2';
const D=s=>new Date(s+'T00:00:00');
const fmt=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>fmt(new Date());
const addDays=(s,n)=>{const d=D(s);d.setDate(d.getDate()+n);return fmt(d);};
const ageM=b=>Math.max(0,(new Date()-D(b))/864e5/30.44);
const daysTo=s=>Math.round((D(s)-D(today()))/864e5);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const RULES={
  cat:[
    {k:'v3',n:'猫三联疫苗',start:56,iv:a=>a<9?21:365,g:'疫苗',tip:'幼猫 8/12/16 周龄各一针，之后每年加强'},
    {k:'rab',n:'狂犬疫苗',start:84,iv:()=>365,g:'疫苗',tip:'12 周龄后接种，之后每年一次'},
    {k:'win',n:'体内驱虫',start:42,iv:a=>a<6?30:90,g:'驱虫',tip:'幼猫每月一次至 6 月龄，成年后每 3 个月'},
    {k:'wout',n:'体外驱虫',start:56,iv:()=>30,g:'驱虫',tip:'每月一次，冬季可视环境延长'},
    {k:'bath',n:'洗澡',start:90,iv:()=>75,g:'洗护',tip:'短毛猫 2–3 个月一次，长毛猫 1–2 个月，勿过频'},
    {k:'nail',n:'剪指甲',start:60,iv:()=>21,g:'洗护',tip:'每 2–4 周修剪，避开血线'},
    {k:'ear',n:'清洁耳道',start:60,iv:()=>30,g:'洗护',tip:'每月检查，有分泌物再清洁'},
    {k:'ck',n:'健康体检',start:180,iv:a=>a<84?365:182,g:'体检',tip:'成年每年一次，7 岁以上建议半年一次'}
  ],
  dog:[
    {k:'d4',n:'联苗（犬瘟/细小等）',start:45,iv:a=>a<4?21:365,g:'疫苗',tip:'幼犬 6/9/12 周龄各一针，之后每年加强'},
    {k:'rab',n:'狂犬疫苗',start:90,iv:()=>365,g:'疫苗',tip:'3 月龄后接种，之后每年一次'},
    {k:'win',n:'体内驱虫',start:30,iv:a=>a<6?30:90,g:'驱虫',tip:'幼犬每月一次至 6 月龄，成年后每 3 个月'},
    {k:'wout',n:'体外驱虫',start:45,iv:()=>30,g:'驱虫',tip:'每月一次，蜱活跃季不可中断'},
    {k:'bath',n:'洗澡',start:60,iv:()=>21,g:'洗护',tip:'一般 2–4 周一次，皮肤敏感遵医嘱'},
    {k:'nail',n:'剪指甲',start:60,iv:()=>21,g:'洗护',tip:'每 2–4 周修剪，过长会影响步态'},
    {k:'ear',n:'清洁耳道',start:60,iv:()=>14,g:'洗护',tip:'垂耳犬建议每周，立耳犬每月'},
    {k:'ck',n:'健康体检',start:180,iv:a=>a<84?365:182,g:'体检',tip:'成年每年一次，7 岁以上建议半年一次'}
  ],
  rabbit:[
    {k:'rhd',n:'兔瘟疫苗',start:50,iv:()=>180,g:'疫苗',tip:'常见程序为 40–45 日龄首免、之后每 6 个月加强，以当地兽医建议为准'},
    {k:'wout',n:'体外驱虫',start:60,iv:()=>90,g:'驱虫',tip:'螨虫/跳蚤按环境与兽医建议，通常每季度评估'},
    {k:'win',n:'粪检与驱虫',start:90,iv:()=>180,g:'驱虫',tip:'先粪检再用药，兔子对驱虫药敏感'},
    {k:'nail',n:'剪指甲',start:60,iv:()=>35,g:'洗护',tip:'每 4–6 周修剪一次'},
    {k:'comb',n:'梳毛',start:60,iv:()=>7,g:'洗护',tip:'换毛期每天梳，降低毛球症风险'},
    {k:'nowash',n:'不要水洗',start:9999,iv:()=>0,g:'洗护',tip:'水洗应激风险高，只做局部清洁'},
    {k:'ck',n:'体检（含牙齿）',start:180,iv:()=>365,g:'体检',tip:'每年一次，臼齿过长是常见问题'}
  ]};
const SPECIES={cat:'猫',dog:'狗',rabbit:'兔'};
const DANGER={
  cat:['连续 24 小时不进食','排尿困难或尿不出来','反复呕吐、腹泻带血','张口呼吸、舌色发白'],
  dog:['连续 24 小时不进食','反复呕吐或带血','瘫软站不起来','误食巧克力、洋葱、葡萄'],
  rabbit:['超过 8 小时不进食或不排便','磨牙、弓背、趴平不动','腹胀、腹部紧张','歪头打转、眼球震颤','呼吸急促或张口呼吸','耳朵四肢发凉']};

const SYMPTOMS={
  cat:[
    ['超过 24 小时不进食','red','猫持续厌食会诱发脂肪肝','立即就医，不要等到第二天'],
    ['排尿困难或尿不出来','red','公猫尿闭可在 24 小时内致命','立即急诊，这是急症'],
    ['反复呕吐或腹泻带血','red','可能是梗阻、中毒或严重肠胃炎','立即就医，带上排泄物照片'],
    ['张口呼吸、舌色发白','red','提示缺氧或循环问题','立即急诊'],
    ['连续打喷嚏、流眼泪','amber','多为上呼吸道感染','48 小时内预约，多猫家庭注意隔离'],
    ['频繁抓耳、甩头','amber','耳螨或外耳炎常见','预约检查，不要自行掏耳'],
    ['体重明显下降','amber','可能提示甲亢、肾病或口腔问题','两周内就诊，并每周称重记录']
  ],
  dog:[
    ['反复呕吐或带血','red','可能是梗阻、中毒或出血性胃肠炎','立即就医'],
    ['瘫软、站不起来','red','可能为神经、骨科或中毒问题','立即急诊，尽量减少搬动'],
    ['误食巧克力、洋葱或葡萄','red','这几类对犬有明确毒性','立即联系兽医，带上包装便于计算剂量'],
    ['呼吸困难、舌色发白','red','提示缺氧、中暑或心脏问题','立即急诊'],
    ['超过 24 小时不进食','amber','成年犬短期厌食需排查病因','48 小时内就诊'],
    ['跛行或不愿跳动','amber','可能为软组织损伤或关节问题','限制活动并尽快预约'],
    ['频繁挠痒、脱毛','amber','皮肤病或寄生虫常见','预约皮肤病检查，不要自行用激素类药膏']
  ],
  rabbit:[
    ['超过 8 小时不进食或不排便','red','胃肠停滞可在 24–48 小时内致命','立即送兔专科兽医，不要等待'],
    ['磨牙、弓背、趴平不动','red','这是兔子疼痛的典型表现','立即就医'],
    ['腹胀、腹部紧张','red','提示积气或梗阻','立即就医，途中保温'],
    ['歪头、打转、眼球震颤','red','可能为脑炎微孢子虫或中耳炎','立即就医'],
    ['呼吸急促或张口呼吸','red','兔子几乎不用口呼吸，属危象','立即就医并缓慢降温'],
    ['臀部脏污或发现蝇蛆','red','蝇蛆病进展极快','立即急诊'],
    ['耳朵或四肢发凉、精神沉郁','red','提示循环衰竭','立即就医并保温'],
    ['尿血或排尿费力','amber','可能为尿石或膀胱泥','24 小时内就诊'],
    ['流鼻涕、打喷嚏','amber','可能为巴氏杆菌呼吸道感染','48 小时内就诊，保持通风'],
    ['耳部结痂、频繁抓挠','amber','耳螨常见','预约检查，勿自行用药'],
    ['脚底红肿或脱毛','amber','足底皮炎，多与笼底和体重相关','改善垫料并预约'],
    ['挑食、流涎、体重下降','amber','臼齿过长是常见诱因','预约牙科检查']
  ]};

const SEASON={
  1:['低温期，幼宠、短毛与老年个体注意保暖','取暖设备注意防烫与防火，保持通风'],
  2:['冬末温差大，呼吸道问题高发','可以开始安排春季的疫苗与驱虫'],
  3:['换毛季开始，梳毛频率要提上来','气温回升，寄生虫开始活跃'],
  4:['寄生虫活跃期，体外驱虫不要断档','换毛持续，毛球问题开始出现'],
  5:['花粉与飞虫增多，注意皮肤与过敏','开窗通风时检查纱窗是否牢固'],
  6:['进入高温期前先检查防暑措施','洗澡后务必彻底吹干，防皮肤病'],
  7:['中暑高发月，避免正午外出与闷热环境','饮水要勤换，水盆可多放一个'],
  8:['持续高温，空调房与室外温差不宜过大','食物易变质，湿粮及时清理'],
  9:['秋季换毛开始，掉毛量明显增加','昼夜温差变大，注意保暖'],
  10:['换毛持续，梳毛和化毛护理要跟上','气温转凉，老年个体关注关节'],
  11:['降温明显，短毛与幼宠加垫保暖','年末可安排一次体检'],
  12:['冬季保暖与室内湿度是重点','节庆装饰、电线与人类食品要收好']};
const SEASON_SP={
  rabbit:['兔子超过 25℃ 就有中暑风险，务必遮阳通风','换毛期每天梳毛，防止毛球堵塞肠道','冬季注意笼内防风，避免直接吹冷风'],
  cat:['猫对高温耐受略强，但仍需凉爽饮水点','换毛期毛球症高发，可配合化毛护理','食盆、水盆与猫砂盆分开摆放，位置尽量固定少变动'],
  dog:['短鼻犬种（法斗、巴哥）高温外出风险高','地面温度高，注意脚垫烫伤','大型犬幼年期避免过度跳跃，减轻关节负担']};
const BASELINE={
  cat:[['进食','成年猫每天 2–3 餐，干粮约 40–60 g，视体重与热量调整'],
       ['饮水','每 kg 体重约 40–60 ml，湿粮为主时饮水量会下降'],
       ['排便','每天 1–2 次，成形、深棕色，不软不硬'],
       ['排尿','每天 2–4 次，尿团大小稳定'],
       ['睡眠','每天 12–16 小时，老年猫更长'],
       ['体重','常见 3.5–6 kg，短期波动超过 5% 要留意']],
  dog:[['进食','成年犬每天 2 餐，按体重与活动量计算，避免自由采食发胖'],
       ['饮水','每 kg 体重约 50–60 ml，运动后与夏季增加'],
       ['排便','每天 1–3 次，成形且颜色稳定'],
       ['排尿','成年犬每天 3–5 次，幼犬更频繁'],
       ['睡眠','成年犬 12–14 小时，幼犬可达 18 小时'],
       ['体重','波动超过 5% 建议复核并连续称重']],
  rabbit:[['排便','每天 200–300 粒以上，圆形、干燥、易压碎'],
       ['进食','牧草应占日粮 75–85% 且无限量供应，兔粮只作辅助'],
       ['饮水','每 kg 体重约 50–150 ml，用滚珠水壶要常检查是否出水'],
       ['排尿','每天数次，颜色可因食物偏黄或偏红，持续浑浊要就医'],
       ['睡眠','白天多浅睡，夜间更活跃，突然长时间不动是危险信号'],
       ['体重','每月称一次，连续下降比单次数字更重要']]};
const HAZARD={
  cat:[['百合类植物','极少量花粉或叶片即可致急性肾衰，家中不要摆放'],
       ['对乙酰氨基酚','常见感冒药成分，对猫致命，绝不可自行给药'],
       ['巧克力、酒精、洋葱大蒜','均对猫有毒，含这些的食物要收好'],
       ['精油与部分驱蚊产品','猫肝脏代谢能力弱，熏香类产品需谨慎'],
       ['细线、橡皮筋、针','易被误食造成肠道梗阻，用后即收']],
  dog:[['巧克力与可可制品','可可碱中毒，黑巧与可可粉风险最高'],
       ['葡萄与葡萄干','可能引发急性肾衰，个体差异大，一律避免'],
       ['木糖醇','无糖口香糖常见，可致急性低血糖'],
       ['熟鸡骨等尖锐骨头','可能划伤或堵塞消化道'],
       ['防冻液（乙二醇）','微甜易被舔食，极少量即可致命']],
  rabbit:[['猫狗粮与零食','高碳水会破坏兔肠道菌群，是胃肠停滞的常见诱因'],
       ['洋葱、大蒜、巧克力','对兔均有毒性，严格避免'],
       ['乳制品与高糖水果','兔子无法消化乳糖，水果只能极少量'],
       ['部分抗生素','林可霉素、部分头孢类可致兔致命性肠炎，必须兔专科开药'],
       ['地毯、纸壳、塑料','啃食后易造成肠道梗阻']]};
const COST={
  cat:[['疫苗与驱虫','700–1,300'],['洗护与日常用品','400–1,200'],['主粮与猫砂','3,000–6,000'],['体检','300–800']],
  dog:[['疫苗与驱虫','800–1,600'],['洗护','800–2,400'],['主粮与零食','3,000–8,000'],['体检','300–1,000']],
  rabbit:[['疫苗与驱虫','300–700'],['垫料与用品','600–1,500'],['牧草与兔粮','1,200–2,500'],['体检与牙科','300–800']]};
const KNOW={
  vaccine:['接种前确认健康状态，发热、腹泻、应激或孕期应推迟','接种后一周内不洗澡、不换环境、不做绝育','留好免疫证，寄养、托运、保险都会用到','个别个体会短暂精神不振，超过 48 小时需就医'],
  dewormIn:['按体重计算剂量，剂量不足等于白做','不同产品对空腹要求不同，按说明书执行','幼年按月做，成年后每 3 个月一次','排出虫体或腹泻持续，需复诊而非重复给药'],
  dewormOut:['滴剂要滴在颈部舔不到的皮肤上，滴在毛上无效','用药后 48 小时内不要洗澡','多宠家庭要同时处理，否则会互相传染','兔子必须兔专科开药，猫狗产品不可直接套用'],
  bath:['水温 37–39℃，用宠物专用浴液','必须彻底吹干，潮湿是皮肤病的温床','洗太勤会破坏皮脂，反而越洗越痒','兔子不要水洗，只做局部清洁'],
  nail:['只剪透明尖端，避开粉红色的血线','剪到血线会出血疼痛，备好止血粉','不配合的个体分次剪，不要一次硬来','兔子指甲偏厚，建议两人配合固定'],
  ear:['洗耳液灌洗后让它自行甩出，再用棉球擦外耳','不要用棉签深入耳道','有异味、深色分泌物或频繁抓挠应就医','垂耳犬种耳道不通风，频率要更高'],
  comb:['换毛期每天梳，平时每周 2–3 次','重点梳腹部、腋下与后腿内侧','兔子换毛期不梳毛，毛球症风险明显升高'],
  nowash:['水洗极易引发应激，可能诱发致命的胃肠停滞','脏了用湿巾局部擦拭或干洗粉','臀部持续脏污要警惕腹泻或蝇蛆病','确需水洗请交由兔专科处理'],
  checkup:['基础项：体格、牙齿、体重、心肺听诊','7 岁以上建议加血检与影像','带上一年的体重与排泄记录','兔子必查臼齿，牙病是最高发问题']};
const KNOWMAP={v3:'vaccine',d4:'vaccine',rhd:'vaccine',rab:'vaccine',win:'dewormIn',wout:'dewormOut',
  bath:'bath',nail:'nail',ear:'ear',comb:'comb',nowash:'nowash',ck:'checkup'};
function humanAge(sp,months){
  const y=months/12;
  if(sp==='dog')return y<1?Math.round(16*Math.log(Math.max(y,.5))+31):Math.round(16*Math.log(y)+31);
  if(sp==='cat')return y<=1?15:y<=2?24:Math.round(24+(y-2)*4);
  return Math.round(y<=1?y*20:20+(y-1)*4.5);
}
function stage(sp,months){
  const y=months/12;
  if(sp==='rabbit')return y<1?'幼年':y<5?'成年':y<8?'中老年':'老年';
  return y<1?'幼年':y<7?'成年':y<10?'老年':'高龄';
}

let db=load(),cur=null,tab='sched';
function load(){
  try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&d.pets)return d;}catch(e){}
  return seed();
}
function seed(){
  const bd=n=>{const d=new Date();d.setMonth(d.getMonth()-n);return fmt(d);};
  const ago=n=>addDays(today(),-n);
  const W=a=>a.map((x,i)=>({d:ago(x[0]),kg:x[1]}));
  return{demo:true,pets:[
    {id:'d1',name:'芝麻糊',species:'cat',birth:bd(26),
      log:{v3:[ago(200)],rab:[ago(295)],win:[ago(110),ago(20)],wout:[ago(115),ago(85),ago(45)],
           bath:[ago(70)],nail:[ago(27),ago(6)],ear:[ago(40)],ck:[ago(160)]},
      weights:W([[150,'4.62'],[120,'4.58'],[90,'4.71'],[60,'4.66'],[30,'4.53'],[7,'4.28']])},
    {id:'d2',name:'铁蛋',species:'dog',birth:bd(8),
      log:{d4:[ago(170),ago(149),ago(128)],rab:[ago(145)],win:[ago(95),ago(60)],
           wout:[ago(55),ago(25)],bath:[ago(30)],nail:[ago(39),ago(18)],ear:[ago(16)]},
      weights:W([[120,'11.8'],[90,'12.9'],[60,'13.6'],[30,'14.1'],[9,'14.35']])},
    {id:'d3',name:'年糕',species:'rabbit',birth:bd(7),
      log:{rhd:[ago(120)],wout:[ago(100)],win:[ago(150)],nail:[ago(75),ago(40)],
           comb:[ago(10),ago(3)],ck:[ago(200)]},
      weights:W([[120,'1.94'],[90,'1.88'],[60,'1.91'],[30,'1.87'],[6,'1.86']])}
  ]};
}
const canStore=(()=>{try{localStorage.setItem('__t','1');localStorage.removeItem('__t');return true;}catch(e){return false;}})();
function save(){try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}}
const pet=()=>db.pets.find(p=>p.id===cur)||null;

function nextDue(p,r){
  const recs=(p.log[r.k]||[]).slice().sort();
  if(recs.length)return addDays(recs[recs.length-1],r.iv(ageM(p.birth)));
  return r.start>=9999?null:addDays(p.birth,r.start);
}
function plan(p){
  return RULES[p.species].map(r=>{
    const d=nextDue(p,r);
    if(!d)return{r,d:null,cls:'ok',days:1e9,label:'不适用',last:null};
    const n=daysTo(d),last=(p.log[r.k]||[]).slice().sort().pop()||null;
    const cls=n<0?'bad':n<=7?'warn':'ok';
    const label=n<0?('逾期 '+(-n)+' 天'):n===0?'今天到期':(n+' 天后');
    return{r,d,cls,days:n,label,last};
  }).sort((a,b)=>a.days-b.days);
}
const overdue=p=>plan(p).filter(x=>x.days<0).length;
const doneCount=p=>Object.values(p.log||{}).reduce((a,b)=>a+b.length,0);

function render(){
  document.getElementById('stamp').textContent=today()+' · '+db.pets.length+' 只';
  renderPets();renderSide();renderOverview();
  const v=document.getElementById('view'),p=pet();
  v.innerHTML=!p?emptyState():(tab==='sched'?viewSched(p):tab==='health'?viewHealth(p):viewProfile(p));
  if(p)bind(p);
}
function renderPets(){
  const box=document.getElementById('petList');
  box.innerHTML=db.pets.map(p=>{
    const n=overdue(p);
    return '<div class="pet-row'+(p.id===cur?' on':'')+'" data-id="'+p.id+'">'
      +'<div class="avatar">'+esc(p.name.slice(0,1))+'</div>'
      +'<div><div class="nm">'+esc(p.name)+'</div><div class="mt">'+SPECIES[p.species]+' · '+Math.floor(ageM(p.birth))+' 月</div></div>'
      +(n?'<div class="badge">'+n+'</div>':'')+'</div>';
  }).join('')||'<div style="padding:6px 12px;font-size:12px;color:var(--ink3)">还没有档案，先建一只。</div>';
  box.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{cur=b.dataset.id;save();render();});
  document.getElementById('demoNote').innerHTML=db.demo
    ?'<div class="demo-note">上面 3 只是示例宠物，用来演示效果<br><button id="clearDemo">清空，开始记录我自己的</button></div>':'';
  const cd=document.getElementById('clearDemo');
  if(cd)cd.onclick=()=>{if(confirm('清空示例宠物，开始记录你自己的？')){db={pets:[]};cur=null;save();openForm();}};
}
function renderOverview(){
  const p=pet(),el=document.getElementById('overview');
  if(!p){el.innerHTML=emptyState();return;}
  const all=db.pets.reduce((a,x)=>a+overdue(x),0);
  const soon=plan(p).filter(x=>x.days>=0&&x.days<=7).length;
  const w=(p.weights||[]).slice().sort();
  el.innerHTML=(canStore?'':'<div class="alert w"><span class="dot" style="background:var(--warn)"></span>'
      +'<div><b>当前浏览器不允许本地保存</b>（可能是无痕模式或隐私设置），刷新后数据会丢失。请用「生成同步链接」或导出备份留存。</div></div>')
    +'<div class="stat">'
    +'<div><div class="v" style="color:'+(all?'var(--danger)':'var(--ink)')+'">'+all+'</div><div class="k">已逾期</div></div>'
    +'<div><div class="v" style="color:'+(soon?'var(--warn)':'var(--ink)')+'">'+soon+'</div><div class="k">7 天内</div></div>'
    +'<div><div class="v">'+(w.length?w[w.length-1].kg:'—')+'</div><div class="k">'+(w.length?'体重 kg':'未记录')+'</div></div>'
    +'</div>'+nextUp()+weightAlert(p)+dangerCard(p);
}
function nextUp(){
  if(db.pets.length<2)return'';
  const items=[];
  db.pets.forEach(p=>plan(p).forEach(x=>{if(x.days<8)items.push({n:p.name,x});}));
  if(!items.length)return'';
  items.sort((a,b)=>a.x.days-b.x.days);
  return '<div style="margin-top:16px;border-top:1px solid var(--line);padding-top:14px">'
    +'<div class="panel-t" style="margin-bottom:8px">全家近期待办</div>'
    +items.slice(0,5).map(o=>'<div class="kv"><span>'+esc(o.n)+' · '+esc(o.x.r.n)+'</span>'
      +'<span style="color:'+(o.x.days<0?'var(--danger)':'var(--warn)')+'">'+o.x.label+'</span></div>').join('')
    +'</div>';
}
function weightAlert(p){
  const w=(p.weights||[]).slice().sort();
  if(w.length<2)return'';
  const a=parseFloat(w[w.length-2].kg),b=parseFloat(w[w.length-1].kg);
  const drop=(a-b)/a*100;
  if(drop<5)return'';
  const bad=drop>=10;
  return '<div class="alert '+(bad?'d':'w')+'"><span class="dot '+(bad?'pulse':'')+'" style="background:'
    +(bad?'var(--danger)':'var(--warn)')+'"></span><div><b>体重较上次下降 '+drop.toFixed(1)+'%</b>（'+a+' → '+b+' kg）'
    +(bad?'。短时间内大幅下降属于危险信号，建议尽快就医。':'，建议复核称重方式，持续下降请就医。')+'</div></div>';
}
function dangerCard(p){
  return '<div class="alert n"><div><b style="color:var(--ink)">'+SPECIES[p.species]+'的危险信号</b><br>'
    +DANGER[p.species].join(' · ')+'<br><span style="color:var(--ink3)">出现任意一条，不要等，立即送医。</span></div></div>';
}
function emptyState(){
  return '<div class="empty"><svg width="52" height="52" viewBox="0 0 52 52" fill="none">'
    +'<circle cx="26" cy="26" r="25" stroke="#D8D7D1" stroke-width="1.5"/>'
    +'<path d="M18 22c0-4.4 3.6-8 8-8s8 3.6 8 8c0 5-8 12-8 12s-8-7-8-12z" stroke="#0F6E56" stroke-width="1.8" stroke-linejoin="round"/>'
    +'<circle cx="26" cy="22" r="2.6" fill="#0F6E56"/></svg>'
    +'还没有宠物档案。<br>点右侧「新建档案」建第一份，或先放一只示例看看效果。</div>';
}

function viewSched(p){
  const list=plan(p);
  const color=x=>x.cls==='bad'?'var(--danger)':x.cls==='warn'?'var(--warn)':'var(--accent)';
  const soft=x=>x.cls==='bad'?'var(--danger-soft)':x.cls==='warn'?'var(--warn-soft)':'var(--accent-soft)';
  return seasonCard(p)
    +'<div class="panel flat"><div class="panel-t">'+esc(p.name)+' 的养护日程</div>'
    +list.map((x,i)=>'<div class="task rise" style="animation-delay:'+(i*45)+'ms">'
      +'<div class="rail" style="background:'+color(x)+';opacity:'+(x.cls==='ok'?'.35':'1')+'"></div>'
      +'<div class="body"><div class="ttl">'+esc(x.r.n)
      +'<span style="font:500 11.5px \'JetBrains Mono\',monospace;color:'+color(x)+';background:'+soft(x)+';padding:2px 8px;border-radius:6px">'+x.label+'</span></div>'
      +'<div class="why">'+esc(x.r.tip)+'</div>'
      +'<div class="when" style="color:var(--ink3)">'+(x.d?x.d+' · '+x.r.g:x.r.g)+(x.last?' · 上次 '+x.last:'')+'</div>'
      +'<button class="btn sm mute" style="margin-top:9px" data-know="'+x.r.k+'">怎么做</button>'
      +'<div class="know hide" id="k_'+x.r.k+'"><b>'+esc(x.r.n)+' · 操作要点</b><ul style="margin:0;padding-left:17px">'
      +KNOW[KNOWMAP[x.r.k]].map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></div></div>'
      +(x.d?'<button class="btn sm '+(x.cls==='ok'?'ghost':'')+'" data-done="'+x.r.k+'">完成</button>':'')
      +'</div>').join('')
    +'<div style="display:flex;gap:10px;margin-top:22px;flex-wrap:wrap">'
    +'<button class="btn" id="icsBtn">导出日历 .ics</button>'
    +'<button class="btn ghost" id="notifyBtn">开启网页通知</button>'
    +'<button class="btn mute" id="cardBtn">生成分享卡</button></div></div>';
}
function viewHealth(p){
  const w=(p.weights||[]).slice().sort();
  let plot='<div class="empty" style="padding:22px 0;font-size:13.5px">至少记录两次体重，这里会出现趋势曲线</div>';
  if(w.length>1){
    const v=w.map(x=>parseFloat(x.kg)),mn=Math.min(...v),mx=Math.max(...v),rg=(mx-mn)||1;
    const X=i=>52+i*(496/(w.length-1)),Y=x=>118-(x-mn)/rg*92;
    plot='<svg viewBox="0 0 560 140" style="width:100%;height:150px" role="img">'
      +'<line x1="52" y1="118" x2="548" y2="118" stroke="rgba(24,24,22,.10)" stroke-width="1"/>'
      +'<polyline points="'+w.map((x,i)=>X(i)+','+Y(v[i])).join(' ')+'" fill="none" stroke="#0F6E56" stroke-width="2" stroke-linejoin="round"/>'
      +w.map((x,i)=>'<circle cx="'+X(i)+'" cy="'+Y(v[i])+'" r="3.4" fill="#fff" stroke="#0F6E56" stroke-width="2"/>').join('')
      +'<text x="0" y="16" font-size="11" fill="#9A988F" font-family="JetBrains Mono,monospace">'+mx+'</text>'
      +'<text x="0" y="122" font-size="11" fill="#9A988F" font-family="JetBrains Mono,monospace">'+mn+'</text></svg>';
  }
  const log=Object.entries(p.log||{}).flatMap(([k,ds])=>ds.map(d=>({d,k}))).sort((a,b)=>a.d<b.d?1:-1);
  const nm=k=>{const r=RULES[p.species].find(x=>x.k===k);return r?r.n:k;};
  return triageCard(p)
    +'<div class="panel"><div class="panel-t">体重趋势</div>'+plot
    +'<div style="display:flex;gap:10px;margin-top:14px"><input id="wkg" type="number" step="0.01" placeholder="今日体重（kg）" style="flex:1">'
    +'<button class="btn" id="wAdd">记录</button></div>'
    +'<div class="err" id="wErr">请输入大于 0 的体重</div></div>'
    +baselineCard(p)+hazardCard(p)
    +'<div class="panel" style="margin-top:20px"><div class="panel-t">养护履历</div>'
    +(log.length?log.slice(0,24).map(e=>'<div class="kv"><span>'+esc(nm(e.k))+'</span><span>'+e.d+'</span></div>').join('')
      :'<div class="empty" style="padding:20px 0;font-size:13.5px">完成一次日程，这里就会留下记录</div>')+'</div>';
}
function seasonCard(p){
  const m=new Date().getMonth()+1,sp=SEASON_SP[p.species];
  const items=SEASON[m].concat([sp[(m-1)%sp.length]]);
  return '<div class="panel" style="margin-bottom:20px"><div class="panel-t">'+m+' 月要注意</div>'
    +items.map(t=>'<div style="display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--line);font-size:13.5px;line-height:1.6">'
      +'<span class="dot" style="background:var(--accent);margin-top:7px"></span><span>'+t+'</span></div>').join('')
    +'</div>';
}
function baselineCard(p){
  return '<div class="panel" style="margin-top:20px"><div class="panel-t">每日正常值</div>'
    +'<div style="font-size:12.5px;color:var(--ink2);margin-bottom:8px;line-height:1.6">先知道正常是什么样，才判断得出异常。以下为成年个体的参考范围。</div>'
    +BASELINE[p.species].map(b=>'<div style="padding:11px 0;border-top:1px solid var(--line)">'
      +'<div style="font-weight:500;font-size:14px">'+b[0]+'</div>'
      +'<div style="font-size:12.5px;color:var(--ink2);margin-top:3px;line-height:1.6">'+b[1]+'</div></div>').join('')
    +'</div>';
}
function hazardCard(p){
  return '<div class="panel" style="margin-top:20px"><div class="panel-t">家里要先收好的东西</div>'
    +'<div style="font-size:12.5px;color:var(--ink2);margin-bottom:8px;line-height:1.6">误食是新手最常碰到的急症。'
    +(p.species==='rabbit'?'兔子对药物格外敏感，任何用药都要由兔专科兽医开。':'这几类提前收起来，比事后急救有用。')+'</div>'
    +HAZARD[p.species].map(h=>'<div style="padding:11px 0;border-top:1px solid var(--line)">'
      +'<div style="font-weight:500;font-size:14px;color:#7E2B28">'+esc(h[0])+'</div>'
      +'<div style="font-size:12.5px;color:var(--ink2);margin-top:3px;line-height:1.6">'+esc(h[1])+'</div></div>').join('')
    +'</div>';
}
function triageCard(p){
  return '<div class="panel" style="margin-bottom:20px"><div class="panel-t">症状自查</div>'
    +'<div style="font-size:12.5px;color:var(--ink2);line-height:1.6">勾选你观察到的表现，会得到处理建议。拿不准的时候，宁可去看医生。</div>'
    +'<div class="syms" style="margin-top:14px">'
    +SYMPTOMS[p.species].map((s,i)=>'<label class="sym"><input type="checkbox" data-sym="'+i+'"><span>'+esc(s[0])+'</span></label>').join('')
    +'</div><div id="triageOut"></div></div>';
}
function renderTriage(p){
  const box=document.getElementById('triageOut');
  if(!box)return;
  const picks=[...document.querySelectorAll('[data-sym]:checked')].map(i=>SYMPTOMS[p.species][+i.dataset.sym]);
  if(!picks.length){box.innerHTML='';return;}
  const red=picks.filter(x=>x[1]==='red'),amber=picks.filter(x=>x[1]!=='red');
  const lvl=red.length?'red':'amber';
  const seg=(t,arr)=>arr.length?'<div style="margin-top:10px;font-weight:600">'+t+'</div><ul>'
    +arr.map(x=>'<li><b>'+esc(x[0])+'</b> — '+esc(x[2])+'。'+esc(x[3])+'。</li>').join('')+'</ul>':'';
  box.innerHTML='<div class="verdict '+lvl+'">'
    +'<div class="h">'+(lvl==='red'?'建议立即就医':'建议尽快预约就诊')+'</div>'
    +(lvl==='red'?'这些表现对应的问题可能进展很快，不要等到第二天。':'暂未发现需要立刻急诊的表现，但建议在 24–48 小时内就诊确认。')
    +seg(red.length?'需要马上处理':'建议处理',red.length?red:amber)
    +seg('同时留意',red.length?amber:[])
    +'<div style="margin-top:10px;font-size:12px;opacity:.85">依据常规兽医指南整理，不构成诊断。就医时可以把这份清单给医生看。</div></div>';
}
function vaxText(p){
  const line=r=>{const ds=(p.log[r.k]||[]).slice().sort();return r.n+'：'+(ds.length?ds.join('、'):'暂无记录');};
  let s=p.name+'（'+SPECIES[p.species]+'）养护记录\n生成日期 '+today()+' · 出生 '+p.birth+'\n\n【疫苗】\n'
    +RULES[p.species].filter(r=>r.g==='疫苗').map(line).join('\n')+'\n\n【其他养护】\n'
    +RULES[p.species].filter(r=>r.g!=='疫苗'&&(p.log[r.k]||[]).length).map(line).join('\n')
    +'\n\n由「毛孩子养护台」生成，实际接种情况以免疫证与兽医记录为准。';
  return s;
}
function stageTip(s){
  if(s==='幼年')return '幼年期重点：疫苗程序要打满、驱虫按月做、饮食过渡要慢。';
  if(s==='成年')return '成年期重点：每年体检一次，维持体重与运动量，驱虫不要断档。';
  if(s==='中老年')return '中老年期重点：缩短体检间隔，关注牙齿、体重与排泄变化。';
  return '老年期重点：建议每半年体检，关注牙齿、关节、肝肾指标与体重变化。';
}
function ageCard(p){
  const m=Math.floor(ageM(p.birth)),s=stage(p.species,m);
  return '<div class="panel" style="margin-top:20px"><div class="panel-t">年龄换算</div>'
    +'<div style="display:flex;align-items:baseline;gap:10px"><span class="mono" style="font-size:32px;font-weight:500">'
    +humanAge(p.species,m)+'</span><span style="font-size:13px;color:var(--ink3)">岁 · 相当于人类'+s+'</span></div>'
    +'<div style="font-size:12.5px;color:var(--ink2);margin-top:10px;line-height:1.6">'+stageTip(s)+'</div></div>';
}
function costCard(p){
  const rows=COST[p.species];
  const sum=rows.reduce((a,r)=>{
    const v=r[1].split('–').map(x=>+x.replace(/,/g,''));
    return [a[0]+v[0],a[1]+v[1]];},[0,0]);
  return '<div class="panel" style="margin-top:20px"><div class="panel-t">年度养护支出估算</div>'
    +'<div style="display:flex;align-items:baseline;gap:7px"><span class="mono" style="font-size:26px;font-weight:500">¥'
    +sum[0].toLocaleString()+'</span><span class="mono" style="font-size:20px;color:var(--ink3)">–'
    +sum[1].toLocaleString()+'</span></div>'
    +'<div style="font-size:12px;color:var(--ink3);margin-top:4px">每年常规支出，不含意外医疗</div>'
    +rows.map(r=>'<div class="kv"><span>'+r[0]+'</span><span>¥'+r[1]+'</span></div>').join('')
    +'<div style="font-size:12px;color:var(--ink3);margin-top:12px;line-height:1.6">区间因地区、品牌与体型差异较大，建议另留一份应急医疗金。</div></div>';
}
function viewProfile(p){
  const now=new Date(),curYM=fmt(now).slice(0,7);
  const months=plan(p).filter(x=>x.d).map(x=>x.d.slice(0,7));
  const cells=[...Array(12)].map((_,i)=>{
    const ym=fmt(new Date(now.getFullYear(),i,1)).slice(0,7),n=months.filter(m=>m===ym).length;
    return '<div class="'+(n?'has ':'')+(ym===curYM?'now':'')+'">'+(i+1)+'月'+(n?' · '+n:'')+'</div>';
  }).join('');
  return '<div class="panel"><div class="panel-t">档案</div>'
    +'<div class="kv"><span>名字</span><span>'+esc(p.name)+'</span></div>'
    +'<div class="kv"><span>物种</span><span>'+SPECIES[p.species]+'</span></div>'
    +'<div class="kv"><span>生日</span><span>'+p.birth+'</span></div>'
    +'<div class="kv"><span>月龄</span><span>'+Math.floor(ageM(p.birth))+' 个月</span></div>'
    +'<div class="kv"><span>累计完成</span><span>'+doneCount(p)+' 次</span></div>'
    +'<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">'
    +'<button class="btn ghost" id="vaxBtn">导出养护记录</button>'
    +'<button class="btn ghost" id="linkBtn">生成同步链接</button>'
    +'<button class="btn mute" id="expBtn">导出备份</button>'
    +'<button class="btn mute" id="impBtn">导入备份</button>'
    +'<button class="btn mute" id="delBtn">删除档案</button></div>'
    +'<div style="font-size:12px;color:var(--ink3);margin-top:10px;line-height:1.6">寄养、托运、保险常被要求提供疫苗记录，可先导出一份留底。<br>数据只存在本机，换设备时用「生成同步链接」把档案带过去。</div></div>'
    +ageCard(p)+costCard(p)
    +'<div class="panel" style="margin-top:20px"><div class="panel-t">'+now.getFullYear()+' 年日程分布</div>'
    +'<div class="cal">'+cells+'</div>'
    +'<div style="font-size:12px;color:var(--ink3);margin-top:12px;line-height:1.6">按当前推算，标数字的月份有养护事项到期</div></div>';
}
function renderSide(){
  const el=document.getElementById('side'),p=pet();
  if(!p){el.style.display='none';return;}
  el.style.display='';
  const l=plan(p),over=l.filter(x=>x.days<0).length;
  const pct=Math.round((l.length-over)/l.length*100);
  el.innerHTML='<div class="panel-t">养护进度</div>'
    +'<div style="display:flex;align-items:baseline;gap:8px"><span class="mono" style="font-size:30px;font-weight:500">'+pct+'</span>'
    +'<span style="font-size:13px;color:var(--ink3)">% 在计划内</span></div>'
    +'<div style="height:5px;border-radius:3px;background:var(--sunken);margin:12px 0 18px;overflow:hidden">'
    +'<div style="height:100%;width:'+pct+'%;background:var(--accent);border-radius:3px;transition:width .6s var(--ease)"></div></div>'
    +'<div class="panel-t">近期</div>'
    +l.slice(0,4).map(x=>'<div class="kv"><span>'+esc(x.r.n)+'</span><span style="color:'
      +(x.cls==='bad'?'var(--danger)':x.cls==='warn'?'var(--warn)':'var(--ink3)')+'">'
      +(x.d?x.label:'不适用')+'</span></div>').join('');
}
function bind(p){
  document.querySelectorAll('[data-done]').forEach(b=>b.onclick=()=>{
    (p.log[b.dataset.done]=p.log[b.dataset.done]||[]).push(today());save();render();
  });
  document.querySelectorAll('[data-sym]').forEach(c=>c.onchange=()=>renderTriage(p));
  document.querySelectorAll('[data-know]').forEach(b=>b.onclick=()=>{
    const e=document.getElementById('k_'+b.dataset.know);
    if(e)e.classList.toggle('hide');
  });
  const on=(id,fn)=>{const e=document.getElementById(id);if(e)e.onclick=fn;};
  on('icsBtn',()=>download(p.name+'-养护日程.ics',makeIcs(p),'text/calendar'));
  on('vaxBtn',()=>download(p.name+'-养护记录.txt',vaxText(p),'text/plain'));
  on('linkBtn',()=>shareLink());
  on('notifyBtn',()=>{
    if(!('Notification' in window)){alert('当前浏览器不支持网页通知，请用导出日历的方式提醒。');return;}
    Notification.requestPermission().then(r=>{
      if(r!=='granted'){alert('未授权通知权限，建议改用导出日历。');return;}
      const o=plan(p).filter(x=>x.days<0);
      new Notification(p.name+'：'+o.length+' 项养护已逾期',{body:o.slice(0,3).map(x=>x.r.n).join('、')||'全部在计划内'});
    });
  });
  on('cardBtn',()=>shareCard(p));
  on('wAdd',()=>{
    const kg=parseFloat(document.getElementById('wkg').value),err=document.getElementById('wErr');
    if(!kg||kg<=0){err.classList.add('show');return;}
    (p.weights=p.weights||[]).push({d:today(),kg:kg.toFixed(2)});save();render();
  });
  on('delBtn',()=>{if(confirm('删除「'+p.name+'」的全部档案与记录？此操作不可恢复。')){
    db.pets=db.pets.filter(x=>x.id!==p.id);cur=db.pets.length?db.pets[0].id:null;save();render();}});
  on('expBtn',()=>download('毛孩子养护台-备份.json',JSON.stringify(db,null,2),'application/json'));
  on('impBtn',()=>{const i=document.createElement('input');i.type='file';i.accept='.json';
    i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader();
      r.onload=()=>{try{const d=JSON.parse(r.result);
        if(d&&Array.isArray(d.pets)){db=d;cur=db.pets.length?db.pets[0].id:null;save();render();}
        else alert('文件格式不对，请选择本工具导出的备份。');}catch(e){alert('解析失败，文件可能已损坏。');}};
      r.readAsText(f);};i.click();});
}
function download(name,text,type){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([text],{type:type+';charset=utf-8'}));
  a.download=name;a.click();URL.revokeObjectURL(a.href);
}
function shareLink(){
  const s=btoa(unescape(encodeURIComponent(JSON.stringify(db))));
  const u=location.href.split('#')[0]+'#d='+s;
  const tip='链接已生成，在另一台设备打开就能恢复这 '+db.pets.length+' 份档案（数据只在这条链接里，不会上传）';
  if(navigator.clipboard&&navigator.clipboard.writeText)
    navigator.clipboard.writeText(u).then(()=>alert(tip+'\n\n已复制到剪贴板。'),()=>prompt(tip,u));
  else prompt(tip,u);
}
function fromHash(){
  const m=location.hash.match(/^#d=(.+)$/);
  if(!m)return false;
  try{
    const d=JSON.parse(decodeURIComponent(escape(atob(m[1]))));
    if(d&&Array.isArray(d.pets)&&d.pets.length){
      db=d;save();
      if(history.replaceState)history.replaceState(null,'',location.pathname+location.search);
      return true;
    }
  }catch(e){}
  return false;
}
function makeIcs(p){
  const stamp=fmt(new Date()).replace(/-/g,'')+'T090000Z';
  let s='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//毛孩子养护台//CN\r\nCALSCALE:GREGORIAN\r\n';
  plan(p).forEach((x,i)=>{if(!x.d)return;
    s+='BEGIN:VEVENT\r\nUID:'+p.id+'-'+x.r.k+'-'+i+'@petcare\r\nDTSTAMP:'+stamp+'\r\n'
      +'DTSTART;VALUE=DATE:'+x.d.replace(/-/g,'')+'\r\nSUMMARY:'+p.name+' · '+x.r.n+'\r\n'
      +'DESCRIPTION:'+x.r.tip+'\r\nBEGIN:VALARM\r\nTRIGGER:-P1D\r\nACTION:DISPLAY\r\n'
      +'DESCRIPTION:'+p.name+' 明天该做：'+x.r.n+'\r\nEND:VALARM\r\nEND:VEVENT\r\n';});
  return s+'END:VCALENDAR\r\n';
}
function shareCard(p){
  const c=document.createElement('canvas');c.width=720;c.height=1020;
  const g=c.getContext('2d'),F=(w,s)=>w+' '+s+'px Outfit,"PingFang SC",sans-serif';
  g.fillStyle='#F7F6F3';g.fillRect(0,0,720,1020);
  g.fillStyle='#0F6E56';g.fillRect(0,0,720,240);
  g.fillStyle='#fff';g.font=F(600,46);g.fillText(p.name,52,116);
  g.font=F(400,20);g.fillStyle='rgba(255,255,255,.72)';
  g.fillText(SPECIES[p.species]+' · '+Math.floor(ageM(p.birth))+' 个月 · '+p.birth,52,158);
  g.fillStyle='#18181A';g.font=F(500,24);g.fillText('接下来的养护',52,318);
  plan(p).slice(0,6).forEach((x,i)=>{
    const y=368+i*104;
    g.fillStyle='#fff';g.beginPath();g.roundRect(52,y,616,84,18);g.fill();
    g.fillStyle=x.cls==='bad'?'#B4403C':x.cls==='warn'?'#B4741A':'#0F6E56';
    g.beginPath();g.roundRect(52,y,4,84,2);g.fill();
    g.fillStyle='#18181A';g.font=F(500,22);g.fillText(x.r.n,80,y+38);
    g.fillStyle='#6B6A64';g.font=F(400,17);g.fillText(x.d?x.d+' · '+x.label:'不适用',80,y+66);
  });
  g.fillStyle='#9A988F';g.font=F(400,16);
  g.fillText('毛孩子养护台 · 周期依据常规兽医指南，不替代兽医诊断',52,980);
  c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);
    a.download=p.name+'-养护卡.png';a.click();URL.revokeObjectURL(a.href);});
}

document.getElementById('addBtn').onclick=()=>openForm();
document.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{
  tab=b.dataset.t;
  document.querySelectorAll('.seg button').forEach(x=>x.classList.toggle('on',x===b));
  render();
});
function openForm(){
  document.getElementById('view').innerHTML='<div class="panel"><div class="panel-t">新建宠物档案</div>'
    +'<label>名字</label><input id="fName" placeholder="例如：芝麻糊">'
    +'<div class="err" id="eName">请填写名字</div>'
    +'<label>物种</label><select id="fSp"><option value="cat">猫</option><option value="dog">狗</option><option value="rabbit">兔</option></select>'
    +'<label>生日（不确定可填估算日期）</label><input id="fBirth" type="date">'
    +'<div class="err" id="eBirth">请选择生日</div>'
    +'<label>当前体重（kg，可留空）</label><input id="fW" type="number" step="0.01" placeholder="例如：4.20">'
    +'<div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">'
    +'<button class="btn" id="fSave">保存档案</button>'
    +'<button class="btn ghost" id="fDemo">放一只示例兔</button>'
    +'<button class="btn mute" id="fCancel">取消</button></div></div>';
  document.getElementById('fCancel').onclick=()=>render();
  document.getElementById('fDemo').onclick=()=>{
    const d=new Date();d.setMonth(d.getMonth()-7);
    add({name:'年糕',species:'rabbit',birth:fmt(d),weight:'1.85'});
  };
  document.getElementById('fSave').onclick=()=>{
    const n=document.getElementById('fName').value.trim(),b=document.getElementById('fBirth').value;
    document.getElementById('eName').classList.toggle('show',!n);
    document.getElementById('eBirth').classList.toggle('show',!b);
    if(!n||!b)return;
    add({name:n,species:document.getElementById('fSp').value,birth:b,weight:document.getElementById('fW').value});
  };
}
function add(o){
  if(db.demo)db={pets:[]};
  const p={id:Date.now().toString(36),name:o.name,species:o.species,birth:o.birth,log:{},weights:[]};
  if(o.weight)p.weights.push({d:today(),kg:parseFloat(o.weight).toFixed(2)});
  db.pets.push(p);cur=p.id;save();render();
}
const restored=fromHash();
if(db.pets.length)cur=db.pets[0].id;
window.addEventListener('hashchange',()=>{
  if(!fromHash())return;
  cur=db.pets.length?db.pets[0].id:null;
  render();
  document.getElementById('stamp').textContent='已恢复 '+db.pets.length+' 份档案';
});
document.getElementById('overview').innerHTML='<div class="skel" style="height:62px"></div>';
setTimeout(()=>{
  render();
  if(restored)document.getElementById('stamp').textContent='已恢复 '+db.pets.length+' 份档案';
},320);
