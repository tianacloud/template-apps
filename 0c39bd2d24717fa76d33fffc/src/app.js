export async function mount(root, { files }) {
let urls;
try { urls = await Promise.all(Array.from({length: 12}, (_, i) => files.getUrl(`template-assets/poem${i + 1}.webp`))); }
catch { root.textContent = "配图暂时无法加载，请刷新后重试。"; return; }
document.head.appendChild(Object.assign(document.createElement("style"), {textContent: "\n  :root {\n    --ink: #1a1a1a;\n    --ink-soft: #555;\n    --ink-light: #999;\n    --paper: #ffffff;\n    --paper-warm: #fafaf8;\n    --line: #ececec;\n    --accent: #a8352c;\n  }\n  * { margin: 0; padding: 0; box-sizing: border-box; }\n  html { scroll-behavior: smooth; }\n  body {\n    font-family: \"Noto Serif SC\", \"Source Han Serif SC\", \"Songti SC\", SimSun, serif;\n    background: var(--paper);\n    color: var(--ink);\n    line-height: 1.9;\n    -webkit-font-smoothing: antialiased;\n  }\n  .wrap { max-width: 720px; margin: 0 auto; padding: 0 24px; }\n\n  header {\n    text-align: center;\n    padding: 56px 0 32px;\n    border-bottom: 1px solid var(--line);\n  }\n  header .site-title {\n    font-size: 15px;\n    letter-spacing: 12px;\n    text-indent: 12px;\n    color: var(--ink);\n    font-weight: 600;\n  }\n  header .site-sub {\n    margin-top: 10px;\n    font-size: 12px;\n    letter-spacing: 4px;\n    color: var(--ink-light);\n  }\n  .date-bar {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 18px 0;\n    font-size: 13px;\n    color: var(--ink-soft);\n    font-family: -apple-system, \"PingFang SC\", \"Microsoft YaHei\", sans-serif;\n  }\n  .badge {\n    display: inline-block;\n    font-size: 12px;\n    color: var(--accent);\n    border: 1px solid #ecd5d2;\n    background: #fdf7f6;\n    border-radius: 20px;\n    padding: 2px 12px;\n  }\n\n  .hero img {\n    width: 100%;\n    display: block;\n    border-radius: 6px;\n    box-shadow: 0 8px 40px rgba(0,0,0,.08);\n  }\n  .hero .caption {\n    margin-top: 10px;\n    font-size: 12px;\n    color: var(--ink-light);\n    text-align: right;\n    letter-spacing: 2px;\n  }\n\n  .poem-head { text-align: center; padding: 44px 0 8px; }\n  .poem-title { font-size: 30px; font-weight: 700; letter-spacing: 6px; }\n  .poem-author { margin-top: 10px; font-size: 14px; color: var(--ink-soft); letter-spacing: 3px; }\n  .poem-author .dyn { margin-right: 14px; color: var(--ink-light); }\n\n  .poem-body {\n    padding: 28px 0 8px;\n    text-align: center;\n    font-size: 18px;\n    letter-spacing: 2px;\n    line-height: 2.4;\n  }\n  .poem-body .stanza { margin-bottom: 22px; }\n\n  .divider {\n    width: 36px; height: 2px;\n    background: var(--accent);\n    margin: 40px auto;\n    opacity: .7;\n  }\n\n  section.note, section.appreciation { padding-bottom: 8px; }\n  .sec-label {\n    font-size: 13px;\n    letter-spacing: 6px;\n    color: var(--accent);\n    margin-bottom: 14px;\n    font-weight: 600;\n  }\n  section p { font-size: 15px; color: var(--ink-soft); }\n\n  nav.pager {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    margin: 48px 0 8px;\n    padding-top: 24px;\n    border-top: 1px solid var(--line);\n    font-family: -apple-system, \"PingFang SC\", \"Microsoft YaHei\", sans-serif;\n  }\n  nav.pager a {\n    color: var(--ink-soft);\n    text-decoration: none;\n    font-size: 14px;\n    cursor: pointer;\n    padding: 8px 16px;\n    border: 1px solid var(--line);\n    border-radius: 4px;\n    transition: all .2s;\n  }\n  nav.pager a:hover { border-color: var(--ink); color: var(--ink); }\n  nav.pager .mid { font-size: 12px; color: var(--ink-light); }\n\n  .archive { margin: 64px 0 32px; }\n  .archive h3 {\n    font-size: 14px;\n    letter-spacing: 6px;\n    color: var(--ink);\n    text-align: center;\n    margin-bottom: 24px;\n    font-weight: 600;\n  }\n  .grid {\n    display: grid;\n    grid-template-columns: repeat(4, 1fr);\n    gap: 14px;\n  }\n  @media (max-width: 560px) { .grid { grid-template-columns: repeat(2, 1fr); } }\n  .card {\n    cursor: pointer;\n    border-radius: 6px;\n    overflow: hidden;\n    background: var(--paper-warm);\n    border: 1px solid var(--line);\n    transition: all .2s;\n  }\n  .card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.08); }\n  .card img { width: 100%; aspect-ratio: 3/2; object-fit: cover; display: block; }\n  .card .t { font-size: 12px; padding: 8px 10px; color: var(--ink-soft); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n  .card.today .t { color: var(--accent); font-weight: 600; }\n\n  footer {\n    text-align: center;\n    padding: 32px 0 48px;\n    font-size: 12px;\n    color: var(--ink-light);\n    letter-spacing: 2px;\n    border-top: 1px solid var(--line);\n  }\n\n  #view { animation: fadein .5s ease; }\n  @keyframes fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }\n"}));
root.innerHTML = "\n\n<header>\n  <div class=\"site-title\">每日一诗</div>\n  <div class=\"site-sub\">山河壮阔 · 每天一首 · 五分钟读完</div>\n</header>\n\n<div class=\"wrap\">\n  <div id=\"view\"></div>\n\n  <div class=\"archive\">\n    <h3>往期回顾</h3>\n    <div class=\"grid\" id=\"grid\"></div>\n  </div>\n</div>\n\n<footer>众鸟高飞尽 · 孤云独去闲</footer>\n\n";

const poems = [
  {
    title: "将进酒", author: "李白", dyn: "唐", img: "template-assets/poem1.webp", imgCap: "君不见黄河之水天上来",
    lines: [
      ["君不见黄河之水天上来，奔流到海不复回。","君不见高堂明镜悲白发，朝如青丝暮成雪。"],
      ["人生得意须尽欢，莫使金樽空对月。","天生我材必有用，千金散尽还复来。"],
      ["烹羊宰牛且为乐，会须一饮三百杯。","岑夫子，丹丘生，将进酒，杯莫停。"],
      ["与君歌一曲，请君为我倾耳听。","钟鼓馔玉不足贵，但愿长醉不复醒。","古来圣贤皆寂寞，惟有饮者留其名。"]
    ],
    note: "将（qiāng）进酒：请饮酒，属乐府旧题。高堂：高大的厅堂。金樽：精美的酒杯。会须：应当。岑夫子、丹丘生：李白友人岑勋、元丹丘。钟鼓馔（zhuàn）玉：富贵人家的奢华生活。",
    appr: "这首诗是李白借酒抒怀的巅峰之作。开篇以黄河奔流不返、朝暮白发起兴，写尽人生短暂之悲，却旋即以\"天生我材必有用\"一笔荡开，悲中见豪。全诗如黄河之水，一泻千里，大起大落间尽显盛唐气象与诗仙傲岸不羁的胸襟。"
  },
  {
    title: "念奴娇·赤壁怀古", author: "苏轼", dyn: "宋", img: "template-assets/poem2.webp", imgCap: "乱石穿空，惊涛拍岸",
    lines: [
      ["大江东去，浪淘尽，千古风流人物。","故垒西边，人道是，三国周郎赤壁。"],
      ["乱石穿空，惊涛拍岸，卷起千堆雪。","江山如画，一时多少豪杰。"],
      ["遥想公瑾当年，小乔初嫁了，雄姿英发。","羽扇纶巾，谈笑间，樯橹灰飞烟灭。"],
      ["故国神游，多情应笑我，早生华发。","人生如梦，一尊还酹江月。"]
    ],
    note: "故垒：旧时的营垒。公瑾：周瑜字公瑾。羽扇纶（guān）巾：儒雅的装束，此指周瑜。樯橹：船桅与桨，代指曹军战船。酹（lèi）：以酒洒地，表示祭奠。",
    appr: "苏轼谪居黄州时登临赤壁，面对奔流大江，怀想赤壁之战中的少年英杰。上阕写景，\"乱石穿空，惊涛拍岸\"十三字有千钧之力；下阕写人，谈笑间强敌灰飞烟灭，何等从容。结尾自嘲早生华发，以一尊江月收束，豪放之中含旷达，被誉为千古绝唱。"
  },
  {
    title: "满江红·写怀", author: "岳飞", dyn: "宋", img: "template-assets/poem3.webp", imgCap: "凭栏处，潇潇雨歇",
    lines: [
      ["怒发冲冠，凭栏处、潇潇雨歇。","抬望眼，仰天长啸，壮怀激烈。"],
      ["三十功名尘与土，八千里路云和月。","莫等闲，白了少年头，空悲切。"],
      ["靖康耻，犹未雪。臣子恨，何时灭。","驾长车，踏破贺兰山缺。"],
      ["壮志饥餐胡虏肉，笑谈渴饮匈奴血。","待从头、收拾旧山河，朝天阙。"]
    ],
    note: "怒发冲冠：愤怒得头发直竖顶起帽子。靖康耻：1127 年金兵攻破汴京、掳徽钦二帝的国耻。贺兰山缺：贺兰山山口，代指敌境。朝天阙：朝见皇帝。",
    appr: "全词一气呵成，字字千钧。\"三十功名尘与土，八千里路云和月\"以对仗写尽半生征战；\"莫等闲，白了少年头，空悲切\"成为激励千古的惜时箴言。通篇忠愤之气激荡喷薄，是爱国主义词章中最悲壮的吼声。"
  },
  {
    title: "出塞", author: "王昌龄", dyn: "唐", img: "template-assets/poem4.webp", imgCap: "秦时明月汉时关",
    lines: [
      ["秦时明月汉时关，万里长征人未还。"],
      ["但使龙城飞将在，不教胡马度阴山。"]
    ],
    note: "但使：只要。龙城飞将：指汉代名将卫青、李广等威震边关的将领。不教：不让。胡马：敌人的战马，代指敌军。阴山：横亘于北方的山脉，中原的天然屏障。",
    appr: "仅四句二十八字，却纵贯秦汉、横跨万里。明月与边关本是眼前之景，冠以\"秦\"\"汉\"二字，顿时把时空拉向苍茫千古，寄托了对历代戍边者命运的深沉感慨。末句\"不教胡马度阴山\"斩钉截铁，被誉为唐人七绝的压卷之作。"
  },
  {
    title: "观沧海", author: "曹操", dyn: "汉", img: "template-assets/poem5.webp", imgCap: "东临碣石，以观沧海",
    lines: [
      ["东临碣石，以观沧海。","水何澹澹，山岛竦峙。"],
      ["树木丛生，百草丰茂。","秋风萧瑟，洪波涌起。"],
      ["日月之行，若出其中；","星汉灿烂，若出其里。"],
      ["幸甚至哉，歌以咏志。"]
    ],
    note: "碣（jié）石：山名，在今河北昌黎。澹（dàn）澹：水波荡漾的样子。竦峙（sǒng zhì）：高高耸立。星汉：银河。幸甚至哉：乐府诗结尾套语，与正文内容无涉。",
    appr: "这是我国现存第一首完整的山水诗。曹操北征乌桓得胜途中登碣石山观海，笔下沧海\"洪波涌起\"，日月星辰仿佛吞吐其中——所写是大海，抒的是统一天下的博大襟怀。想象力之雄奇、气魄之宏大，非英雄不能道。"
  },
  {
    title: "望岳", author: "杜甫", dyn: "唐", img: "template-assets/poem6.webp", imgCap: "会当凌绝顶，一览众山小",
    lines: [
      ["岱宗夫如何？齐鲁青未了。"],
      ["造化钟神秀，阴阳割昏晓。"],
      ["荡胸生曾云，决眦入归鸟。"],
      ["会当凌绝顶，一览众山小。"]
    ],
    note: "岱宗：泰山尊称。齐鲁青未了：泰山青色绵延齐鲁两国之外，望不到尽头。造化钟神秀：大自然把神奇秀美都聚集于此。曾云：同\"层云\"。决眦（zì）：睁大眼睛。会当：终当、定要。",
    appr: "这是杜甫青年时期的作品，通篇无一\"望\"字却句句在望。首联以距离写山之绵远，颔联以明暗写山之高峻，颈联以细节写心之激荡。结尾\"会当凌绝顶，一览众山小\"化用孔子\"登泰山而小天下\"，少年壮志喷薄而出，成为千年来攀登者共同的宣言。"
  },
  {
    title: "破阵子·为陈同甫赋壮词以寄之", author: "辛弃疾", dyn: "宋", img: "template-assets/poem7.webp", imgCap: "醉里挑灯看剑",
    lines: [
      ["醉里挑灯看剑，梦回吹角连营。","八百里分麾下炙，五十弦翻塞外声，沙场秋点兵。"],
      ["马作的卢飞快，弓如霹雳弦惊。","了却君王天下事，赢得生前身后名。","可怜白发生！"]
    ],
    note: "挑灯：拨亮灯火。吹角连营：各军营中号角声连成一片。八百里：指牛，此处分牛肉犒赏部下。五十弦：泛指军乐。的卢：烈性快马。天下事：收复中原的大业。",
    appr: "辛弃疾写给挚友陈亮的\"壮词\"。前九句一气直下：看剑、闻角、分炙、奏乐、点兵、飞马、强弓——词人梦中恢复山河的全过程酣畅淋漓。不料结句\"可怜白发生\"陡然一跌，梦想与现实的巨大反差令人扼腕，正是稼轩词悲壮沉郁的本色。"
  },
  {
    title: "使至塞上", author: "王维", dyn: "唐", img: "template-assets/poem8.webp", imgCap: "大漠孤烟直，长河落日圆",
    lines: [
      ["单车欲问边，属国过居延。"],
      ["征蓬出汉塞，归雁入胡天。"],
      ["大漠孤烟直，长河落日圆。"],
      ["萧关逢候骑，都护在燕然。"]
    ],
    note: "单车：轻车简从。征蓬：随风远飞的蓬草，诗人自喻。孤烟：烽烟。长河：黄河。候骑（jì）：负责侦察的骑兵。燕然：山名，代指前线。",
    appr: "王维奉命出使边塞，途中写下此诗。\"大漠孤烟直，长河落日圆\"被誉为\"千古壮观\"：大漠横，孤烟纵，长河横，落日圆——仅十个字，一个\"直\"字写尽苍劲，一个\"圆\"字写尽温暖，构图如画，境界雄浑开阔，是山水田园诗人笔下最壮丽的一笔。"
  },
  {
    title: "白雪歌送武判官归京", author: "岑参", dyn: "唐", img: "template-assets/poem9.webp", imgCap: "千树万树梨花开",
    lines: [
      ["北风卷地白草折，胡天八月即飞雪。","忽如一夜春风来，千树万树梨花开。"],
      ["散入珠帘湿罗幕，狐裘不暖锦衾薄。","将军角弓不得控，都护铁衣冷难着。"],
      ["轮台东门送君去，去时雪满天山路。","山回路转不见君，雪上空留马行处。"]
    ],
    note: "白草：西域的一种牧草，秋天变白。胡天：塞外的天空。控：拉开。锦衾（qīn）：锦缎被子。轮台：地名，在今新疆。结尾与李白\"孤帆远影\"意境相通。",
    appr: "岑参是盛唐边塞诗的代表。最妙的是\"忽如一夜春风来，千树万树梨花开\"——以春天梨花写冬天大雪，奇丽的想象把苦寒之地写得生机盎然，成为咏雪千古第一喻。结尾目送友人远去，唯见雪上马蹄印迹，惆怅之情含蓄悠长。"
  },
  {
    title: "登鹳雀楼", author: "王之涣", dyn: "唐", img: "template-assets/poem10.webp", imgCap: "白日依山尽，黄河入海流",
    lines: [
      ["白日依山尽，黄河入海流。"],
      ["欲穷千里目，更上一层楼。"]
    ],
    note: "鹳（guàn）雀楼：故址在今山西永济，前瞻中条山，下临黄河，为登临胜地。依：依傍。穷：尽，达到极点。更：再。",
    appr: "二十个字，前两句写所见——落日依山、黄河入海，把万里山河收于尺幅；后两句写所想——\"欲穷千里目，更上一层楼\"，把写景诗升华为哲理诗。景壮阔，理浅近，道出了\"站得高才能看得远\"的永恒真谛，是五言绝句中气魄最大的作品。"
  },
  {
    title: "从军行·其四", author: "王昌龄", dyn: "唐", img: "template-assets/poem11.webp", imgCap: "黄沙百战穿金甲",
    lines: [
      ["青海长云暗雪山，孤城遥望玉门关。"],
      ["黄沙百战穿金甲，不破楼兰终不还。"]
    ],
    note: "青海：青海湖。长云：连绵的浓云。穿：磨穿、磨破。楼兰：汉代西域国名，此代指侵扰西北的敌人。终不还：誓不归还。",
    appr: "前两句大开大合：青海、长云、雪山、孤城、玉门关依次铺开，勾勒出数千里的边塞防线，景象苍茫辽阔。后两句是全诗筋骨——金甲磨穿见百战之苦，\"终不还\"三字却掷地有声，把戍边将士百折不挠的钢铁意志写到了极致，是边塞诗中最响亮的誓言。"
  },
  {
    title: "望庐山瀑布", author: "李白", dyn: "唐", img: "template-assets/poem12.webp", imgCap: "飞流直下三千尺",
    lines: [
      ["日照香炉生紫烟，遥看瀑布挂前川。"],
      ["飞流直下三千尺，疑是银河落九天。"]
    ],
    note: "香炉：香炉峰，庐山峰名，因水汽缭绕如香炉青烟得名。挂前川：瀑布像一条白练悬挂在山前。九天：天的最高处。",
    appr: "李白笔下的庐山瀑布是想象力的极致：阳光给香炉峰染上紫色云烟，一条白练悬于山前，飞流直泻三千尺——还不够，索性疑心是天上的银河跌落人间。一个\"生\"字、一个\"挂\"字、一个\"落\"字，把静态的山水写出了宇宙级的动感与气魄。"
  }
];

poems.forEach((poem, i) => { poem.img = urls[i]; });
const POEM_MS = 86400000;
function todayIndex() {
  return Math.floor(Date.now() / POEM_MS) % poems.length;
}
function fmtDate(d) {
  const wk = "日一二三四五六"[d.getDay()];
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · 星期${wk}`;
}

function render(idx) {
  const p = poems[idx];
  const chars = (p.lines.flat().join("") + p.note + p.appr).length;
  const mins = Math.max(1, Math.round(chars / 500));
  const d = new Date();
  const view = document.getElementById("view");
  view.innerHTML = `
    <div class="date-bar">
      <span>今天 · ${fmtDate(d)}</span>
      <span class="badge">约 ${mins} 分钟读完</span>
    </div>
    <div class="hero">
      <img src="${p.img}" alt="${p.imgCap}">
      <div class="caption">${p.imgCap}</div>
    </div>
    <div class="poem-head">
      <div class="poem-title">${p.title}</div>
      <div class="poem-author"><span class="dyn">${p.dyn}</span>${p.author}</div>
    </div>
    <div class="poem-body">
      ${p.lines.map(st => `<div class="stanza">${st.join("<br>")}</div>`).join("")}
    </div>
    <div class="divider"></div>
    <section class="note">
      <div class="sec-label">注释</div>
      <p>${p.note}</p>
    </section>
    <section class="appreciation">
      <div class="sec-label">赏析</div>
      <p>${p.appr}</p>
    </section>
    <nav class="pager">
      <a data-index="${(idx+poems.length-1)%poems.length}">← 上一首</a>
      <span class="mid">第 ${idx + 1} / ${poems.length} 首</span>
      <a data-index="${(idx+1)%poems.length}">下一首 →</a>
    </nav>
  `;
  document.title = `${p.title} · ${p.author} | 每日一诗`;
}

function renderGrid(todayIdx) {
  const grid = document.getElementById("grid");
  grid.innerHTML = poems.map((p, i) => `
    <div class="card ${i === todayIdx ? "today" : ""}" data-index="${i}">
      <img src="${p.img}" alt="${p.title}" loading="lazy">
      <div class="t">${p.title}</div>
    </div>
  `).join("");
}


const onClick = event => { const item = event.target.closest("[data-index]"); if (!item || !root.contains(item)) return; render(Number(item.dataset.index)); scrollTo(0,0); };
root.addEventListener("click", onClick);
const ti = todayIndex();
render(ti);
renderGrid(ti);

return () => { root.removeEventListener("click", onClick); root.innerHTML = ""; };
}
