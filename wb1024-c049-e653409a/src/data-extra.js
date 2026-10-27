/* 逛博馆 · 扩展数据：专题合集 / 朝代时间轴 / 印章册 */

/* ===== 专题合集（手工挑选的趣味榜单） ===== */
window.TOPICS = [
  {
    id: "meng", name: "表情包天团", emoji: "😜",
    desc: "这几件文物，网友比专家还熟",
    ids: ["tao-ying-ding", "yachou-yue", "matafeiyan", "funiao-shuangwei-hu", "jigu-shuochang-yong", "caitao-ping"]
  },
  {
    id: "banned", name: "不许出国的国宝", emoji: "🔒",
    desc: "国家点名“禁止出境展览”的顶级重器",
    ids: ["houmuwu-ding", "tao-ying-ding", "goujian-sword", "zenghouyi-bianzhong", "zhanguo-shuijingbei",
          "yucong-wang", "agate-shoushou-cup", "yaxing-boli-zhu", "wuxing-dongfang-jin", "huanghou-zhi-xi"]
  },
  {
    id: "bronze", name: "青铜天团", emoji: "🛡",
    desc: "商周青铜器的巅峰阵容，一位比一位能打",
    ids: ["houmuwu-ding", "siyang-fangzun", "lianhe-fanghu", "fuhao-xiaozun", "zenghouyi-bianzhong",
          "zongmu-mianju", "sanxingdui-shenshu", "daliren", "yachang-niuzun", "yunwen-tongjin"]
  },
  {
    id: "gold", name: "金灿灿特辑", emoji: "✨",
    desc: "黄金、鎏金、金线——一整个“贵气冲天”",
    ids: ["jin-shou", "taiyang-shenniao", "jinzhang", "jinou-yonggu-cup", "wuzetian-jinjian",
          "wenodixi-jinyin", "yuanyang-jinwan", "jinlv-yuyi"]
  },
  {
    id: "tang", name: "大唐风华", emoji: "🏮",
    desc: "盛唐的气象，都藏在这些宝贝里",
    ids: ["agate-shoushou-cup", "wuma-xianbei-yinhu", "putao-yinxiangnang", "yuanyang-jinwan",
          "zanhua-shinv-tu", "gaoyi-tu", "jingyun-zhong", "fuxi-nvwa-bohua"]
  },
  {
    id: "song", name: "大宋美学", emoji: "🖌",
    desc: "雪、鹤、江山——宋朝人的高级审美",
    ids: ["qingming-scroll", "qianli-jiangshan", "ruihe-tu", "xuejing-hanlin-tu"]
  },
  {
    id: "play", name: "古人有多会玩", emoji: "🎲",
    desc: "香囊、玩具车、会转的盘子……古人比你想象的会玩",
    ids: ["yueren-shouyou-che", "putao-yinxiangnang", "cuojin-boshanlu", "jingyun-zhong",
          "yaxing-boli-zhu", "jinou-yonggu-cup", "zizhongjiang-pan", "jigu-shuochang-yong"]
  }
];

/* ===== 朝代时间轴（按朝代字段自动归组） ===== */
window.ERAS = [
  { name: "新石器时代", period: "约1万年前—4000年前", dyn: ["新石器时代"] },
  { name: "商代", period: "约前1600—前1046年", dyn: ["商代", "商代晚期", "商周"] },
  { name: "西周", period: "前1046—前771年", dyn: ["西周"] },
  { name: "春秋战国", period: "前770—前221年", dyn: ["春秋", "战国"] },
  { name: "秦汉", period: "前221—公元220年", dyn: ["秦代", "西汉", "东汉", "汉代"] },
  { name: "魏晋南北朝", period: "220—589年", dyn: ["魏晋", "十六国", "东晋", "南朝"] },
  { name: "隋唐五代", period: "581—960年", dyn: ["隋代", "唐代", "五代"] },
  { name: "宋元", period: "960—1368年", dyn: ["北宋", "南宋", "宋代", "辽代", "金代", "西夏", "元代"] },
  { name: "明清", period: "1368—1912年", dyn: ["明代", "清代", "清乾隆"] }
];

/* ===== 每日一句（首页轮换，点击可换下一句） ===== */
window.JINJU = [
  "让文物活起来，让历史会说话",
  "博物馆是时间的客厅，有空去坐坐",
  "一器一世界，一馆一千年",
  "你看的是文物，文物看的是千年",
  "在博物馆里，时间以世纪为单位流动",
  "每一件文物，都是一封写给未来的信",
  "考古，是今人与古人的一次握手",
  "历史沉默不语，文物替它开口",
  "把脚步放慢，把目光放远",
  "逛馆的意义，是让遥远的历史有了温度",
  "器物的沉默，有时比文字更响",
  "一眼千年，说的就是博物馆"
];

/* ===== 每日背景图（画卷类最好看，每天换一张，若隐若现） ===== */
window.BG_ARTS = [
  "qianli-jiangshan", "qingming-scroll", "fuchun-shanjutu", "luoshenfutu",
  "ruihe-tu", "xuejing-hanlin-tu", "zanhua-shinv-tu", "zhulin-qixian-zhuanhua",
  "kunyu-wanguo-tu", "gaoyi-tu", "tixing-bohua", "linliang-kongque"
];

/* ===== 印章册：每个博物馆的印章短名（盖在章上） ===== */
window.STAMP_NAMES = {
  "gugong": "故宫", "guobo": "国博", "sanxingdui": "三星堆", "shaanxi-lishi": "陕历博",
  "hubei-bowuguan": "鄂博", "hunan-bowuyuan": "湘博", "henan-bowuyuan": "豫博", "qinling": "秦陵",
  "shanghai-bwg": "上博", "gansu-bwg": "甘博", "hebei-bowyuan": "冀博", "shanxi-bwy": "晋博",
  "nanjing-bwy": "南博", "suzhou-bwg": "苏博", "zhejiang-bwg": "浙博", "hangzhou-bwg": "杭博",
  "liangzhu": "良渚", "yinxu": "殷墟", "jinsha": "金沙", "shandong-bwg": "鲁博",
  "liaoning-bwg": "辽博", "anhui-bwy": "皖博", "jiangxi-bwg": "赣博", "yunnan-bwg": "滇博",
  "nanyuewang": "南越", "tianjin-bwg": "天博", "beilin": "碑林", "xinjiang-bwg": "新疆",
  "taibei-gugong": "台北",
  "neimenggu": "内蒙古", "jilin": "吉博", "heilongjiang": "龙博", "fujian": "闽博",
  "guangxi": "桂博", "hainan": "琼博", "sanxia": "三峡", "guizhou": "黔博",
  "xizang": "藏博", "qinghai": "青博", "ningxia": "宁博", "hongkong": "香港", "macau": "澳门"
};

/* ===== 国家一级博物馆（名单核自中国博物馆协会/国家文物局公开名录）
   注：殷墟博物馆为2024年新馆、台北故宫不参与大陆评级，暂未列入 ===== */
window.FIRST_LEVEL = [
  "gugong", "guobo", "sanxingdui", "shaanxi-lishi", "hubei-bowuguan", "hunan-bowuyuan",
  "henan-bowuyuan", "qinling", "shanghai-bwg", "gansu-bwg", "hebei-bowyuan", "shanxi-bwy",
  "nanjing-bwy", "suzhou-bwg", "zhejiang-bwg", "hangzhou-bwg", "liangzhu", "jinsha",
  "shandong-bwg", "liaoning-bwg", "anhui-bwy", "jiangxi-bwg", "yunnan-bwg", "nanyuewang",
  "tianjin-bwg", "beilin", "xinjiang-bwg",
  "neimenggu", "jilin", "heilongjiang", "fujian", "guangxi", "hainan", "sanxia",
  "guizhou", "xizang", "qinghai", "ningxia"
];

/* ===== 展讯（整理自公开报道，更新于2026-10-05；sort=展出截止日，常设用99999999）
   artId = 该展的代表展品（图片+点击跳转）；特展暂用该馆最相关/最热门文物代表 ===== */
window.EXHIBITIONS_UPDATED = "2026年10月5日";
window.EXHIBITIONS = [
  { museumId: "guobo", type: "特展", title: "李静训和她的时代", time: "至 2026.10.8", sort: 20261008, artId: "jiulong-fengguan",
    desc: "以隋代9岁女孩李静训的墓中文物为切口，馆藏240余件（套）勾勒隋代社会图景。", link: "https://www.chnmuseum.cn/zl/" },
  { museumId: "guobo", type: "特展", title: "叩问永恒——庞贝的探索与发掘", time: "至 2026.10.11", sort: 20261011, artId: "tao-ying-ding",
    desc: "意大利105件（套）文物，其中81件首次来华，还有3组沉浸式体验空间。", link: "https://www.chnmuseum.cn/zl/" },
  { museumId: "shanghai-bwg", type: "特展", title: "珠归海上：庄万里家族捐赠两塗轩书画展（第二期）", time: "至 2026.10.7", sort: 20261007, artId: "gaoyi-tu",
    desc: "两塗轩捐赠书画精品展，上博书画馆藏的重要来源。", link: "https://www.shanghaimuseum.net/" },
  { museumId: "guobo", type: "特展", title: "大河之东——运城与中华文明肇兴", time: "2026.9.29 起", sort: 20261231, artId: "siyang-fangzun",
    desc: "运城地区出土文物200余件（套），讲黄河东岸的文明故事。", link: "https://www.chnmuseum.cn/zl/" },
  { museumId: "guobo", type: "特展", title: "中国古代书画——宋元至明清书画中的诗意栖居", time: "2026.9.4 起", sort: 20261231, artId: "jigu-shuochang-yong",
    desc: "南12展厅，馆藏古代书画专题。", link: "https://www.chnmuseum.cn/zl/" },
  { museumId: "guobo", type: "特展", title: "长征路——纪念红军长征胜利90周年美术作品展", time: "至 2026.12", sort: 20261231, artId: "hongshan-yulong",
    desc: "沈尧伊长征主题美术作品展（南8、南9展厅）。", link: "https://www.chnmuseum.cn/zl/" },
  { museumId: "shanghai-bwg", type: "特展", title: "一瓷一色一世界——明清颜色釉瓷器特展", time: "至 2027.2.14", sort: 20270214, artId: "dake-ding",
    desc: "人民广场馆；上博藏明清颜色釉瓷器专题。", link: "https://www.shanghaimuseum.net/" },
  { museumId: "shanghai-bwg", type: "特展", title: "暂得之乐：暂得楼捐赠明清瓷器展", time: "至 2027.2.22", sort: 20270222, artId: "zizhongjiang-pan",
    desc: "暂得楼胡惠春旧藏明清官窑瓷器。", link: "https://www.shanghaimuseum.net/" },
  { museumId: "shanghai-bwg", type: "特展", title: "世界树之巅：美洲古代文明大展", time: "至 2027.11.14", sort: 20271114, artId: "jinhou-suzhong",
    desc: "人民广场馆；墨西哥、秘鲁等近3000件文物，跨越三千年美洲文明。", link: "https://www.shanghaimuseum.net/" },
  /* 常设大展（长期陈列） */
  { museumId: "gugong", type: "常设", title: "珍宝馆 · 钟表馆", time: "长期展出", sort: 99999999, artId: "jinou-yonggu-cup",
    desc: "故宫最受欢迎的两个专题馆，珍宝馆一线还有九龙壁。", link: "https://www.dpm.org.cn/" },
  { museumId: "guobo", type: "常设", title: "古代中国（基本陈列）", time: "长期展出", sort: 99999999, artId: "houmuwu-ding",
    desc: "国博的看家基本陈列，后母戊鼎、四羊方尊都在这里。", link: "https://www.chnmuseum.cn/zl/" },
  { museumId: "hunan-bowuyuan", type: "常设", title: "长沙马王堆汉墓陈列", time: "长期展出", sort: 99999999, artId: "susha-chanyi",
    desc: "辛追夫人的陪葬珍宝：素纱襌衣、T形帛画都在这个展里。", link: "https://www.hnmuseum.com/" },
  { museumId: "hubei-bowuguan", type: "常设", title: "曾侯乙墓陈列 + 编钟演奏", time: "长期展出", sort: 99999999, artId: "zenghouyi-bianzhong",
    desc: "编钟、尊盘等国宝的大本营，馆内有编钟演奏场次（以馆方公告为准）。", link: "https://www.hbww.org/" },
  { museumId: "sanxingdui", type: "常设", title: "古城古国古蜀文化陈列（新馆基本陈列）", time: "长期展出", sort: 99999999, artId: "zongmu-mianju",
    desc: "青铜神树、纵目面具、金杖……新馆把三星堆的家底全摆出来了。", link: "https://www.sxd.cn/" },
  { museumId: "shaanxi-lishi", type: "常设", title: "何家村大唐遗宝专题陈列", time: "长期展出", sort: 99999999, artId: "agate-shoushou-cup",
    desc: "镶金兽首玛瑙杯、鸳鸯莲瓣纹金碗都出自何家村窖藏，还有金简等常设专题。", link: "http://www.sxhm.com/" },
  { museumId: "qinling", type: "常设", title: "一、二、三号坑 + 铜车马博物馆", time: "长期展出", sort: 99999999, artId: "bingmayong",
    desc: "兵马俑军阵实景 + “青铜之冠”铜车马，一次看全。", link: "http://www.bmy.com.cn/" }
];
