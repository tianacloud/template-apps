export async function mount(root, context) {
root.innerHTML = "\n    <div class=\"container\">\n        <!-- 开始界面 -->\n        <div id=\"startPanel\">\n            <div class=\"cover-wrap\">\n                <img src=\"\" alt=\"MBTI封面\">\n                <div class=\"cover-mask\">\n                    <div class=\"cover-title\">MBTI 人格深度测试</div>\n                    <div class=\"cover-sub\">16 型人格 × 自信/波动亚型 · 基于荣格心理学</div>\n                </div>\n            </div>\n            <p class=\"subtitle\">五维测评体系：精力来源 · 认知方式 · 决策方式 · 生活方式 · 情绪基调</p>\n            <div class=\"mode-select\">\n                <label class=\"mode-item\">\n                    <input type=\"radio\" name=\"mode\" value=\"short\" checked>\n                    <span>简版测试（50题，约8分钟）</span>\n                </label>\n                <label class=\"mode-item\">\n                    <input type=\"radio\" name=\"mode\" value=\"full\">\n                    <span>完整版测试（100题，约16分钟）</span>\n                </label>\n            </div>\n            <button class=\"start-btn\" id=\"startBtn\">开始测试</button>\n        </div>\n\n        <!-- 题目界面 -->\n        <div class=\"question-box\" id=\"questionPanel\">\n            <div class=\"q-top\">\n                <div class=\"q-main\">\n                    <div class=\"progress-bar\"><div class=\"progress-fill\" id=\"progressFill\"></div></div>\n                    <div class=\"question-num\">\n                        <span id=\"questionNum\">第 1 题 / 共 50 题</span>\n                        <span id=\"dimTag\"></span>\n                    </div>\n                    <div class=\"question-text\" id=\"questionText\"></div>\n                    <div class=\"options\" id=\"optionsBox\"></div>\n                    <div class=\"q-nav\">\n                        <button class=\"back-btn\" id=\"backBtn\">← 上一题</button>\n                        <span class=\"q-hint\">凭第一直觉作答即可</span>\n                    </div>\n                </div>\n                <div class=\"mini-radar-wrap\">\n                    <canvas id=\"miniRadar\" width=\"336\" height=\"336\"></canvas>\n                    <div class=\"mini-radar-label\">实时性格倾向</div>\n                </div>\n            </div>\n        </div>\n\n        <!-- 结果界面 -->\n        <div class=\"result-box\" id=\"resultPanel\">\n            <h2 style=\"font-size:22px;color:#0d3b7a;\">你的人格类型是</h2>\n            <div class=\"result-type\" id=\"resultType\"></div>\n            <div class=\"result-subtype\" id=\"resultSubtype\"></div>\n            <div class=\"result-name\" id=\"resultName\"></div>\n            <div class=\"result-tagline\" id=\"resultTagline\"></div>\n            <div class=\"result-rate\" id=\"resultRate\"></div>\n            <div class=\"radar-wrap\">\n                <canvas id=\"radarChart\" width=\"960\" height=\"760\"></canvas>\n                <div class=\"radar-caption\">五维雷达图：外向 E / 直觉 N / 思考 T / 判断 J / 自信 A（分数越高越倾向该端）</div>\n            </div>\n            <div class=\"dimensions\" id=\"dimensionsBox\"></div>\n            <div class=\"detail-card\" id=\"detailCard\"></div>\n            <div class=\"btn-row\">\n                <button class=\"save-btn\" id=\"saveBtn\">📷 保存结果图片</button>\n                <button class=\"restart-btn\" id=\"restartBtn\">重新测试</button>\n            </div>\n        </div>\n\n        <div class=\"footer\">\n            制作人：弥生结弦 | 仅供学习与自我探索参考\n            <div class=\"disclaimer\">本测试基于 16Personalities 五维理论（含 A/T 亚型），结果仅供自我探索参考，不构成专业心理评估</div>\n        </div>\n    </div>\n\n    ";

    // ==================== 题库定义 ====================
    // 维度：EI外向/内向、SN实感/直觉、TF思考/情感、JP判断/感知、AT自信/波动
    // direction=1：同意偏向首字母(E/S/T/J/A)，不同意偏向次字母(I/N/F/P/Tu)
    // direction=-1：反之
    const fullQuestions = [

        // ---------- E/I 维度 22题 ----------
        {text:"参加聚会时，你会主动凑过去和一群陌生人聊成一片吗？", dimension:"EI", direction:1},
        {text:"一个人待着的时候，你反而觉得最放松、最有精力？", dimension:"EI", direction:-1},
        {text:"和一大群人待一整天，你不但不累，反而越玩越来劲？", dimension:"EI", direction:1},
        {text:"刚参加完一场热闹的聚会，你是不是特别想一个人安静地缓一缓？", dimension:"EI", direction:-1},
        {text:"你说话常常是想到哪儿说到哪儿，边想边说？", dimension:"EI", direction:1},
        {text:"开口之前，你习惯先在脑子里把话想明白再讲？", dimension:"EI", direction:-1},
        {text:"你特别享受那种一屋子人热热闹闹、七嘴八舌的场合？", dimension:"EI", direction:1},
        {text:"比起一大群人，你更喜欢和一两个知心朋友安安静静地待着？", dimension:"EI", direction:-1},
        {text:"刚认识你的人，多半会觉得你是个开朗健谈的人？", dimension:"EI", direction:1},
        {text:"刚认识你的人，多半会觉得你话不多、有点内敛？", dimension:"EI", direction:-1},
        {text:"认识新朋友时，你会主动开口介绍自己、找话题？", dimension:"EI", direction:1},
        {text:"和不熟的人待在一起，你一般会等对方先开口？", dimension:"EI", direction:-1},
        {text:"日程排得满满当当、每天都有安排，你觉得这才叫充实？", dimension:"EI", direction:1},
        {text:"要是每周都有好几个饭局聚会，你会觉得又累又烦？", dimension:"EI", direction:-1},
        {text:"碰上难题，你的第一反应是拉个人一起商量商量？", dimension:"EI", direction:1},
        {text:"碰上难题，你习惯先自己闷头想明白，再决定要不要找人聊？", dimension:"EI", direction:-1},
        {text:"在人群里成为焦点，你不觉得尴尬，反而还挺享受？", dimension:"EI", direction:1},
        {text:"你总是尽量避开那种被所有人盯着看的场合？", dimension:"EI", direction:-1},
        {text:"你说话语速偏快，基本有什么说什么？", dimension:"EI", direction:1},
        {text:"你说话比较谨慎，常常话到嘴边还要再掂量一下？", dimension:"EI", direction:-1},
        {text:"周末没事的时候，你更愿意出门凑热闹、到处走走？", dimension:"EI", direction:1},
        {text:"周末没事的时候，你更愿意窝在家里，谁也别来打扰？", dimension:"EI", direction:-1},

        // ---------- S/N 维度 22题 ----------
        {text:"看一件事时，你更在意具体的细节和眼前的事实？", dimension:"SN", direction:1},
        {text:"看一件事时，你更在意它背后的规律和将来的可能？", dimension:"SN", direction:-1},
        {text:"处理事情时，你更信赖自己这些年攒下来的经验？", dimension:"SN", direction:1},
        {text:"处理事情时，你更喜欢试试从没试过的新办法、新点子？", dimension:"SN", direction:-1},
        {text:"给你一个任务，你更擅长把它一步一步落到实处？", dimension:"SN", direction:1},
        {text:"给你一个任务，你更擅长想出一堆概念和方案来？", dimension:"SN", direction:-1},
        {text:"你更喜欢按着清晰的步骤把事情做完，这样心里踏实？", dimension:"SN", direction:1},
        {text:"你更喜欢东看看西想想，在各种可能性之间来回蹦跶？", dimension:"SN", direction:-1},
        {text:"别人说得天花乱坠你也不全信，你只信自己亲眼看到的？", dimension:"SN", direction:1},
        {text:"你挺相信自己的直觉，有些事说不清道理但就是有感觉？", dimension:"SN", direction:-1},
        {text:"做选择时，你更看重实不实用、划不划算？", dimension:"SN", direction:1},
        {text:"做选择时，你更看重有没有新意、够不够特别？", dimension:"SN", direction:-1},
        {text:"朋友常夸你心细，很多小细节都逃不过你的眼睛？", dimension:"SN", direction:1},
        {text:"你常常能看出两件不相干的事之间藏着什么联系？", dimension:"SN", direction:-1},
        {text:"拿到新东西，你习惯先看说明书、照着步骤来？", dimension:"SN", direction:1},
        {text:"拿到新东西，你习惯先自己瞎鼓捣，慢慢摸索出用法？", dimension:"SN", direction:-1},
        {text:"你更关心眼下正在发生的、实实在在的事？", dimension:"SN", direction:1},
        {text:"你更关心以后会变成什么样、会有什么趋势？", dimension:"SN", direction:-1},
        {text:"你习惯用现实的眼光看问题，先想\"这事靠不靠谱\"？", dimension:"SN", direction:1},
        {text:"你习惯用想象的眼光看问题，先想\"这事能变成什么样\"？", dimension:"SN", direction:-1},
        {text:"一成不变的日子让你觉得安稳踏实？", dimension:"SN", direction:1},
        {text:"常有变化的日子让你觉得带劲、有趣？", dimension:"SN", direction:-1},

        // ---------- T/F 维度 22题 ----------
        {text:"做决定时，你更看重逻辑对不对、公不公平？", dimension:"TF", direction:1},
        {text:"做决定时，你更在意人情味和别人的感受？", dimension:"TF", direction:-1},
        {text:"只要道理是对的，哪怕会得罪人，你也会坚持己见？", dimension:"TF", direction:1},
        {text:"你宁可绕个弯子，也不愿意看到别人难堪？", dimension:"TF", direction:-1},
        {text:"你最擅长的是把一件事的利弊得失掰开揉碎地分析清楚？", dimension:"TF", direction:1},
        {text:"你最擅长的是察觉别人情绪上的细微变化？", dimension:"TF", direction:-1},
        {text:"你觉得当面指出别人的问题，是再正常不过的事？", dimension:"TF", direction:1},
        {text:"你几乎不批评人，就怕话说重了伤到对方？", dimension:"TF", direction:-1},
        {text:"你心里的那杆秤，是客观的标准和事实？", dimension:"TF", direction:1},
        {text:"你心里的那杆秤，是人和人之间的和气？", dimension:"TF", direction:-1},
        {text:"熟悉你的人大多觉得你理性、冷静、就事论事？", dimension:"TF", direction:1},
        {text:"熟悉你的人大多觉得你温柔、贴心、善解人意？", dimension:"TF", direction:-1},
        {text:"比起感人的故事，严密的逻辑更能说服你？", dimension:"TF", direction:1},
        {text:"比起冷冰冰的逻辑，真挚的情感更能打动你？", dimension:"TF", direction:-1},
        {text:"在你心里，把事情做成往往比处好关系更重要？", dimension:"TF", direction:1},
        {text:"在你心里，和身边的人处得舒服比什么都重要？", dimension:"TF", direction:-1},
        {text:"和人闹矛盾时，你习惯先把道理讲清楚再说别的？", dimension:"TF", direction:1},
        {text:"和人闹矛盾时，你习惯先照顾对方的情绪、再慢慢谈？", dimension:"TF", direction:-1},
        {text:"你不太会把情绪写在脸上，别人很难看出你高兴还是生气？", dimension:"TF", direction:1},
        {text:"你的喜怒哀乐，身边人一眼就能看出来？", dimension:"TF", direction:-1},
        {text:"你觉得讲道理往往比讲情面更有用？", dimension:"TF", direction:1},
        {text:"你觉得讲情面往往比讲道理更管用？", dimension:"TF", direction:-1},

        // ---------- J/P 维度 22题 ----------
        {text:"你习惯把计划定得明明白白，然后照着计划走？", dimension:"JP", direction:1},
        {text:"你习惯走一步看一步，随机应变？", dimension:"JP", direction:-1},
        {text:"你的作息像钟表一样规律，几点睡几点起基本固定？", dimension:"JP", direction:1},
        {text:"你的作息比较随性，几点睡几点起全看心情？", dimension:"JP", direction:-1},
        {text:"你习惯提前把事情做完，讨厌被截止日期追着跑？", dimension:"JP", direction:1},
        {text:"你经常是最后关头一咬牙，一口气把事干完？", dimension:"JP", direction:-1},
        {text:"你的桌面和房间总是整整齐齐，东西各就各位？", dimension:"JP", direction:1},
        {text:"你觉得桌面乱一点没啥，东西找得到就行？", dimension:"JP", direction:-1},
        {text:"做事时，你喜欢有明确的规则和流程可以遵循？", dimension:"JP", direction:1},
        {text:"做事时，你喜欢见招拆招，怎么顺手怎么来？", dimension:"JP", direction:-1},
        {text:"出去旅行，你会提前把行程排得满满当当？", dimension:"JP", direction:1},
        {text:"出去旅行，你喜欢不做攻略，走到哪玩到哪？", dimension:"JP", direction:-1},
        {text:"事情没做完，你会一直惦记着，心里放不下？", dimension:"JP", direction:1},
        {text:"你觉得很多事顺其自然就好，不必强求？", dimension:"JP", direction:-1},
        {text:"你喜欢把东西分类放好，用的时候一下子就能找到？", dimension:"JP", direction:1},
        {text:"你习惯随手一放，要用的时候再翻找？", dimension:"JP", direction:-1},
        {text:"你特别讨厌计划外的事情突然冒出来？", dimension:"JP", direction:1},
        {text:"突然冒出点意外状况，你反而觉得挺刺激？", dimension:"JP", direction:-1},
        {text:"你拿主意很快，不爱在选项之间反复纠结？", dimension:"JP", direction:1},
        {text:"你拿主意喜欢多看看、多想想，不急着定？", dimension:"JP", direction:-1},
        {text:"把一个目标做完、画上句号，你才觉得有成就感？", dimension:"JP", direction:1},
        {text:"你更享受做事过程中的乐趣，结果倒还在其次？", dimension:"JP", direction:-1},

        // ---------- A/T 维度 12题（自信型/波动型） ----------
        {text:"你经常为还没发生的事感到焦虑或紧张？", dimension:"AT", direction:-1},
        {text:"刚经历一次失败，你通常能很快振作起来？", dimension:"AT", direction:1},
        {text:"你会不自觉地拿自己和别人作比较？", dimension:"AT", direction:-1},
        {text:"你对自己的决定通常很有信心，不太会反悔？", dimension:"AT", direction:1},
        {text:"晚上躺下后，你会反复回想白天说过的每句话、做过的每件事？", dimension:"AT", direction:-1},
        {text:"面对陌生的挑战，你更多是期待而不是担忧？", dimension:"AT", direction:1},
        {text:"别人的一句批评，能让你难受好几天？", dimension:"AT", direction:-1},
        {text:"你觉得现在的自己已经够好了，不用总是逼自己？", dimension:"AT", direction:1},
        {text:"你总觉得还不够，必须不断做出成绩来证明自己的价值？", dimension:"AT", direction:-1},
        {text:"突发状况来了，你能稳住心态，相信自己能处理好？", dimension:"AT", direction:1},
        {text:"你时常对自己的表现不满意，觉得自己本可以做得更好？", dimension:"AT", direction:-1},
        {text:"你很少因为别人的看法而动摇对自己的评价？", dimension:"AT", direction:1}
    ];

    // ==================== 反向题配对与顺序打乱 ====================
    // 说明：每道正向题都配了一道方向相反的反向题（心理学上的标准做法），
    // 作用是防止"全部勾同意"的作答偏差，并可用成对答案校验作答一致性。
    // 但原题库把配对题排在相邻位置，答题者一眼看出重复、体验差。
    // 因此这里自动给成对反向题打上 pairId，并在每次开始时彻底打乱顺序，
    // 保证同一对反向题在答题过程中彼此隔开（间距 >= 10 题），
    // 既保留反向题的测量价值，又不会让人感觉"上下两题是同一题"。
    (function assignPairs() {
        const byDim = {};
        fullQuestions.forEach((q, i) => { (byDim[q.dimension] = byDim[q.dimension] || []).push(i); });
        let pid = 1;
        Object.keys(byDim).forEach(dim => {
            const idxs = byDim[dim];
            for (let k = 0; k + 1 < idxs.length; k += 2) {
                const a = fullQuestions[idxs[k]], b = fullQuestions[idxs[k + 1]];
                if (a.direction !== b.direction) { a.pairId = pid; b.pairId = pid; pid++; }
            }
        });
    })();

    function shuffleArray(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // 计算同一对反向题的最小间隔题数
    function minPairGap(arr) {
        const last = {};
        let minGap = Infinity;
        arr.forEach((q, i) => {
            if (q.pairId != null) {
                if (last[q.pairId] !== undefined) minGap = Math.min(minGap, i - last[q.pairId]);
                last[q.pairId] = i;
            }
        });
        return minGap === Infinity ? arr.length : minGap;
    }

    // 洗牌并保证配对题不相邻：确定性构造——每对反向题分放前后两个半区，
    // 两题间隔恒等于半区长度（100题版=50题间隔，50题版=25题间隔），
    // 从根源上保证"镜像题"绝不挨在一起，且每次顺序随机。
    function shuffleWithSpacing(arr, minGap) {
        minGap = minGap || 8;
        const pairs = [];
        const used = {};
        arr.forEach(q => {
            if (q.pairId != null && !used[q.pairId]) {
                used[q.pairId] = true;
                const mate = arr.find(x => x.pairId === q.pairId && x !== q);
                if (mate) pairs.push([q, mate]);
            }
        });
        const singles = arr.filter(q => q.pairId == null);
        const sp = shuffleArray(pairs);
        const n = arr.length;
        const halfN = Math.floor(n / 2);
        const result = new Array(n);
        sp.forEach((pair, i) => {
            const [a, b] = Math.random() < 0.5 ? [pair[0], pair[1]] : [pair[1], pair[0]];
            const pos1 = i % halfN;
            const pos2 = halfN + pos1;
            result[pos1] = a;
            result[pos2] = b;
        });
        let s = 0;
        for (let i = 0; i < n && s < singles.length; i++) {
            if (result[i] === undefined) result[i] = singles[s++];
        }
        return result;
    }


    // ==================== 16型人格详细数据 ====================
    // 名人归类为网络公认主流观点，仅供趣味参考；"最搭人格"基于认知功能互补理论
    const typeData = {
        'INTJ': {
            name: '建筑师',
            tagline: '富有想象力的战略家，一切皆在计划之中',
            desc: 'INTJ 是典型的"谋略家"：他们习惯从全局俯瞰问题，用系统思维拆解复杂局面，对知识和能力有近乎苛刻的自我要求。他们独立自信、目标感极强，讨厌闲聊和低效，愿意为长期目标付出巨大努力。',
            traits: ['战略思维强，擅长长期规划', '独立自主，享受独处思考', '高标准严要求，追求精进', '表面冷静，内心极有主见'],
            celes: [
                ['埃隆·马斯克', '从特斯拉到 SpaceX，他敢于押注别人认为不可能的长期目标，用系统性工程思维推进跨领域创新，是典型 INTJ 式"用理性改变世界"。'],
                ['艾萨克·牛顿', '用《自然哲学的数学原理》把物理世界纳入一套严密体系，孤僻、专注、追求绝对精确，正是 INTJ 的缩影。'],
                ['弗拉基米尔·普京', '（网络常见归类，有争议）冷静、战略布局长线、极少情绪外露，符合 INTJ 的典型画像。']
            ],
            match: [
                ['ENFP', 'ENFP 的热情与天马行空，能打开 INTJ 封闭的内心世界；INTJ 的稳重则为 ENFP 提供方向与落地的力量。'],
                ['ENTP', '两个 NT 在一起火花四溅，ENTP 负责抛出疯狂点子，INTJ 负责把它变成可行的计划。']
            ]
        },
        'INTP': {
            name: '逻辑学家',
            tagline: '富有创造力的发明家，对知识有着止不住的渴望',
            desc: 'INTP 是"理论的永动机"：他们享受纯粹的逻辑游戏，热衷于探究事物背后的原理和规律，常常沉浸在抽象思考中忘了时间。他们理性、好奇、宽容，但在人情世故上容易显得迟钝，对规则和权威天然保持怀疑。',
            traits: ['分析能力强，热爱探索原理', '思维开放，兼容并包', '讨厌重复与僵化', '不擅社交客套，但妙语连珠'],
            celes: [
                ['阿尔伯特·爱因斯坦', '用思想实验推翻牛顿的绝对时空观，孤身挑战整个物理学界，正是 INTP"只服从逻辑不服从权威"的写照。'],
                ['查尔斯·达尔文', '花二十余年观察、收集、推演，最终用进化论重新定义生物学，堪称 INTP 式"慢工出细活"的理论大师。'],
                ['比尔·盖茨', '（网络常见归类）痴迷技术原理、读书成瘾、常年钻研系统思考，是典型的理性求知型 INTP。']
            ],
            match: [
                ['ENTJ', 'ENTJ 的执行力能把 INTP 的奇思妙想推向现实；INTP 的深度思考也补足了 ENTJ 的战略盲区。'],
                ['ENFJ', 'ENFJ 的温暖与社交能力帮 INTP 融入世界，INTP 的智慧则让 ENFJ 深深欣赏。']
            ]
        },
        'ENTJ': {
            name: '指挥官',
            tagline: '大胆、富有想象力且意志强大的领导者',
            desc: 'ENTJ 是天生的"掌舵人"：他们目标明确、决策果断，擅长把混乱的局面整顿成高效的体系，享受挑战和竞争。他们直率坦诚，对无能和不作为零容忍，说话办事雷厉风行，是天生的组织者和推动者。',
            traits: ['目标导向，执行力极强', '天生领袖气质，善于调度资源', '直率果决，讨厌拖泥带水', '抗压能力强，愈挫愈勇'],
            celes: [
                ['史蒂夫·乔布斯', '（网络常见归类，有争议）极致的产品追求、说一不二的决策风格、把苹果塑造成改变世界的机器，是 ENTJ 气场的经典演绎。'],
                ['玛格丽特·撒切尔', '"铁娘子"以强硬果断著称，敢于推行争议巨大的改革，是政治领域 ENTJ 的代表。'],
                ['戈登·拉姆齐', '厨房里的绝对权威，高标准、零容忍、雷厉风行，把混乱的餐厅整顿成星级团队，教科书级 ENTJ。']
            ],
            match: [
                ['INFP', 'INFP 的温柔与理想主义能软化 ENTJ 的锋芒，帮他们看见逻辑之外的人心；ENTJ 的坚定也给 INFP 安全感。'],
                ['ENTP', '同样好斗好辩，两个人在头脑风暴中互相成就，ENTP 的新点子总能点燃 ENTJ 的斗志。']
            ]
        },
        'ENTP': {
            name: '辩论家',
            tagline: '聪明好奇的思想者，不会放弃任何智力上的挑战',
            desc: 'ENTP 是"点子机器"：他们反应极快、脑洞极大，享受思想的交锋，越是被反驳越兴奋。他们讨厌一成不变，总是在尝试新鲜事物，喜欢从反方角度把问题翻个底朝天。缺点是容易三分钟热度，计划常常输给好奇心。',
            traits: ['头脑灵活，点子层出不穷', '热爱辩论，享受思想碰撞', '适应力强，拥抱变化', '三分钟热度，需要人兜底'],
            celes: [
                ['理查德·费曼', '物理学家中的"顽童"，把艰深的物理学讲得妙趣横生，爱玩爱闹爱抬杠，是 ENTP 智慧与好奇心的化身。'],
                ['马克·吐温', '以犀利讽刺见长的作家，永远在质疑常识、挑战权威，用机智的文字跟整个世界辩论。'],
                ['亚历山大·汉密尔顿', '美国开国元勋中最善辩的一位，笔耕不辍、舌战群儒，靠一张嘴和一支笔推动宪法的诞生。']
            ],
            match: [
                ['INFJ', 'INFJ 是少数能真正"接住" ENTP 的人：一个负责天马行空，一个负责把理想落地，堪称黄金搭档。'],
                ['INTJ', '两个聪明人的较量，ENTP 提供灵感，INTJ 负责把关，互相补足、互相欣赏。']
            ]
        },
        'INFJ': {
            name: '提倡者',
            tagline: '安静而神秘，同时鼓舞人心且不知疲倦的理想主义者',
            desc: 'INFJ 是"温柔的执念者"：他们外表安静温和，内心却燃烧着改变世界的理想。他们洞察力极强，能一眼看穿别人的情绪和动机，真诚地希望帮助他人成长。他们追求意义感，对肤浅和虚伪极其敏感，是 16 型中最稀少（约1.5%）的人格之一。',
            traits: ['洞察人心，共情力极强', '坚守价值观，理想主义', '独立而有原则，内心强大', '渴望深度连接，厌恶浮于表面'],
            celes: [
                ['马丁·路德·金', '以非暴力抗争推动种族平等，用"我有一个梦想"唤起千万人的良知，是 INFJ 理想主义的最高体现。'],
                ['卡尔·荣格', '提出集体无意识与原型理论的心理学家，一生向内探索人类心灵的深层结构，正是 INFJ 的祖师爷。'],
                ['特蕾莎修女', '（网络常见归类）不张扬、不索取，用一生的默默奉献践行信仰，诠释了 INFJ"安静而伟大"的力量。']
            ],
            match: [
                ['ENTP', 'ENTP 的理性与幽默能把 INFJ 从过度理想化中拉回地面，INFJ 的深度又让 ENTP 第一次认真起来。'],
                ['ENFP', '同属理想主义家族，两个人都相信世界可以更好，一个负责点燃，一个负责照亮。']
            ]
        },
        'INFP': {
            name: '调停者',
            tagline: '诗意、善良的利他主义者，总是热情地为正当理由提供帮助',
            desc: 'INFP 是"内心戏最丰富"的人：他们温和善良、想象力丰沛，内心住着一个完整的精神世界。他们极度重视真诚和价值观，对强权与虚伪有本能的抵触。他们不是不会坚强，而是选择用柔软的方式守护自己在乎的一切。',
            traits: ['想象力丰富，内心世界多彩', '真诚善良，理想主义', '重视个人价值观', '表面随和，内心执着'],
            celes: [
                ['J.K.罗琳', '从失业单亲妈妈到写出《哈利·波特》的魔法世界，她把对公平与爱的信念写进文字，是 INFP 的传奇。'],
                ['约翰·列侬', '用音乐呼唤爱与和平，高唱"想象一个没有杀戮的世界"，是 INFP 理想主义的化身。'],
                ['威廉·莎士比亚', '（网络常见归类）对人性的悲悯与洞察、对善恶的复杂呈现，透着 INFP 式的细腻与深情。']
            ],
            match: [
                ['ENTJ', '看似水火不容，实则天作之合：ENTJ 帮 INFP 把梦想变成现实，INFP 让 ENTJ 学会倾听内心。'],
                ['ENFJ', '同样是理想主义者，ENFJ 的热情能温暖 INFP，INFP 的深度也让 ENFJ 找到灵魂共鸣。']
            ]
        },
        'ENFJ': {
            name: '主人公',
            tagline: '富有魅力且鼓舞人心的领导者，有使听众着迷的能力',
            desc: 'ENFJ 是"人群中的太阳"：他们天生擅长理解和激励他人，能敏锐捕捉每个人的潜力并帮助其绽放。他们热情、负责、有号召力，是天生的教育家、组织者和"人生导师"。他们乐于付出，但也容易因为过度操心别人而忽略自己。',
            traits: ['魅力四射，感染力强', '善于发现并成就他人', '责任感强，乐于奉献', '善于协调，凝聚团队'],
            celes: [
                ['巴拉克·奥巴马', '（网络常见归类，有争议）以出色的演讲天赋和亲和力凝聚人心，擅长用愿景打动大众，是 ENFJ 式领袖。'],
                ['奥普拉·温弗瑞', '从贫民窟女孩到全球最具影响力的主持人，她用共情与表达改变了千万人的生活，是 ENFJ 的典范。'],
                ['纳尔逊·曼德拉', '用宽恕而非仇恨化解种族对立，把整个国家团结在一起，展现了 ENFJ 最伟大的一面。']
            ],
            match: [
                ['INTP', 'INTP 的冷静理性为 ENFJ 的激情提供坐标，ENFJ 的温暖也把 INTP 从理论世界拉回人间烟火。'],
                ['INFP', '两个理想主义者互相取暖，ENFJ 愿意当 INFP 最坚定的支持者，INFP 则回馈以全然的信任。']
            ]
        },
        'ENFP': {
            name: '竞选者',
            tagline: '热情、有创造力、社交自由的人，总能找到微笑的理由',
            desc: 'ENFP 是"快乐的永动机"：他们热情洋溢、脑洞大开，对世界充满好奇，走到哪里都能点亮气氛。他们善于发现别人身上的闪光点，是真诚的鼓励者。他们极度需要自由，讨厌被框架束缚，灵感来了挡都挡不住。',
            traits: ['热情开朗，感染力十足', '创意丰富，点子多', '共情力强，真诚待人', '热爱自由，讨厌束缚'],
            celes: [
                ['罗宾·威廉姆斯', '这位喜剧天才用夸张的表演带给无数人欢乐，私下却细腻敏感，正是 ENFP"把快乐给别人"的写照。'],
                ['昆汀·塔伦蒂诺', '（网络常见归类）脑洞大开的导演，从不循规蹈矩，作品充满游戏感和奇思妙想。'],
                ['艾伦·德杰尼勒斯', '以温暖幽默的脱口秀陪伴观众二十年，乐观、真诚、敢于做自己，是 ENFP 精神的代表。']
            ],
            match: [
                ['INTJ', '经典互补：INTJ 是 ENFP 的"定海神针"，帮他们把漫天灵感收敛成可行计划；ENFP 则让 INTJ 的世界有了色彩。'],
                ['INFJ', '两个理想主义者相遇，ENFP 负责把 INFJ 拉出来晒太阳，INFJ 负责帮 ENFP 找到坚持的意义。']
            ]
        },
        'ISTJ': {
            name: '物流师',
            tagline: '实际且注重事实的个人，可靠性不容怀疑',
            desc: 'ISTJ 是"社会的压舱石"：他们严谨务实、说到做到，信奉规则和秩序，是团队里最让人放心的那一环。他们不擅长花言巧语，但会用行动兑现每一个承诺。在他们看来，把事情做对、做扎实，就是最好的表达。',
            traits: ['严谨负责，说到做到', '重视规则与秩序', '务实高效，执行力强', '低调可靠，不喜张扬'],
            celes: [
                ['安格拉·默克尔', '（网络常见归类）德国前总理以务实、稳健、不煽情著称，危机时刻镇定自若，是 ISTJ 式掌舵人。'],
                ['乔治·华盛顿', '开国总统以"立宪重于称帝"的克制与责任感载入史册，正是 ISTJ 信奉秩序与责任的写照。'],
                ['沃伦·巴菲特', '（网络常见归类）几十年如一日的价值投资、克制而规律的作息，把"纪律"二字贯彻到极致。']
            ],
            match: [
                ['ESFP', 'ISTJ 的稳重恰好接住 ESFP 的随性，ESFP 的快乐也让 ISTJ 学会放松，是经典的"互补婚姻"组合。'],
                ['ESTP', 'ESTP 的行动力与冒险精神给 ISTJ 的生活带来新鲜感，ISTJ 则为 ESTP 的冲动踩刹车。']
            ]
        },
        'ISFJ': {
            name: '守卫者',
            tagline: '非常专注而温暖的守护者，时刻准备着保护所爱之人',
            desc: 'ISFJ 是"温柔的守护神"：他们细心体贴、任劳任怨，记得住身边每个人的喜好和难处，默默把事情安排得妥妥当当。他们低调不争，把付出当作习惯，是家人朋友最坚实的情感后盾。',
            traits: ['细心体贴，默默付出', '责任感强，信守承诺', '重视传统与安全感', '低调谦和，不争不抢'],
            celes: [
                ['凯特·米德尔顿', '（网络常见归类）英国王妃以低调、得体、尽职尽责的形象赢得民众好感，是 ISFJ 式贤内助的写照。'],
                ['罗莎·帕克斯', '一位平凡女裁缝拒绝让座，成为民权运动的标志性人物——ISFJ 的勇气不在嗓门，而在坚守。'],
                ['吉米·卡特', '卸任总统后数十年投身公益建房，用默默的行动而非头衔定义自己，是 ISFJ 式奉献。']
            ],
            match: [
                ['ESFP', 'ESFP 的活力照亮 ISFJ 的日常，ISFJ 的体贴则给 ESFP 一个永远可以回的家。'],
                ['ESTP', 'ESTP 带 ISFJ 见识更大的世界，ISFJ 的温柔让 ESTP 愿意安定下来。']
            ]
        },
        'ESTJ': {
            name: '总经理',
            tagline: '出色的管理者，在管理事情或人方面无与伦比',
            desc: 'ESTJ 是"天生的管家"：他们务实、果断、条理分明，信奉"没有规矩不成方圆"。他们擅长把复杂的事情拆解成可执行的流程，推动团队高效运转。他们说话直、不拐弯，但出发点永远是"把事情办好"。',
            traits: ['组织能力强，擅长管理', '务实果断，讲究效率', '重视规则与传统', '责任心强，敢作敢当'],
            celes: [
                ['亨利·福特', '用流水线彻底改变工业制造，把"效率"刻进现代生产方式的基因，是 ESTJ 管理哲学的化身。'],
                ['杰夫·贝佐斯', '（网络常见归类）以严苛的执行文化和数据驱动的管理风格缔造亚马逊帝国，是 ESTJ 式商业强人。'],
                ['科林·鲍威尔', '四星上将出身，以纪律、执行力和清晰的指挥风格闻名，是 ESTJ 军人管理者的代表。']
            ],
            match: [
                ['ISFP', 'ISFP 的随和与艺术气息中和 ESTJ 的严肃，ESTJ 的可靠也让 ISFP 感到安心，性格互补。'],
                ['ISTP', 'ISTP 的冷静务实与 ESTJ 一拍即合，一个负责统筹，一个负责攻坚，配合默契。']
            ]
        },
        'ESFJ': {
            name: '执政官',
            tagline: '极有同情心、爱社交的人，总是热心帮助每一个人',
            desc: 'ESFJ 是"大家庭的粘合剂"：他们热情周到、乐于助人，记得住每个人的生日和喜好，是天生的社交枢纽。他们重视和谐与归属感，喜欢被需要的感觉，往往把朋友的事当成自己的事来办。',
            traits: ['热情友善，乐于助人', '重视和谐与归属感', '组织能力出色', '忠诚可靠，重情重义'],
            celes: [
                ['泰勒·斯威夫特', '（网络常见归类）以细腻的共情和强大的粉丝联结力著称，把身边人照顾得妥妥帖帖，是 ESFJ 式巨星。'],
                ['休·杰克曼', '好莱坞公认的"好人"，敬业、温暖、乐于提携后辈，是 ESFJ 式的阳光与可靠。'],
                ['詹妮弗·加纳', '（网络常见归类）以贤妻良母形象和低调慈善著称，把照顾家人朋友视为天职。']
            ],
            match: [
                ['ISTP', 'ISTP 的冷静独立给 ESFJ 带来新鲜视角，ESFJ 的温柔也让 ISTP 找到归属，是经典的互补组合。'],
                ['ISFP', '同为 F 型人，情感同频、互相体贴，ESFJ 的周到正好照顾到 ISFP 的敏感。']
            ]
        },
        'ISTP': {
            name: '鉴赏家',
            tagline: '大胆而实际的实验家，擅长使用各种工具',
            desc: 'ISTP 是"安静的动手派"：他们冷静、务实、动手能力极强，遇事不慌，喜欢拆解和组装一切东西——从机器到问题。他们话不多，但一开口往往直击要害。他们需要独立空间，讨厌被管束，信奉"用结果说话"。',
            traits: ['动手能力强，技术流', '冷静理性，临危不乱', '独立自由，不受拘束', '务实直接，不喜空谈'],
            celes: [
                ['克林特·伊斯特伍德', '从硬汉演员到冷峻导演，沉默寡言却行动力惊人，是 ISTP"少说话多做事"的典范。'],
                ['迈克尔·乔丹', '（网络常见归类）球场上的"冷血杀手"，专注、冷静、用技术和求胜欲说话，是 ISTP 式竞技天才。'],
                ['哈里森·福特', '（网络常见归类）以实干著称的演员，木匠出身、拒绝浮夸，是典型的 ISTP 式低调硬汉。']
            ],
            match: [
                ['ENFJ', 'ENFJ 的热情与洞察能走进 ISTP 封闭的内心，ISTP 的沉稳也让 ENFJ 找到可以依靠的肩膀。'],
                ['ESFJ', 'ESFJ 的体贴照顾让 ISTP 感到温暖，ISTP 的可靠则给 ESFJ 踏实的回馈。']
            ]
        },
        'ISFP': {
            name: '探险家',
            tagline: '灵活有魅力的艺术家，时刻准备着探索和体验新鲜事物',
            desc: 'ISFP 是"行走的美学"：他们温柔敏感、审美出众，对色彩、声音、氛围有着天然的直觉。他们活在当下，享受每一次真实的体验，讨厌被规则绑架。他们不争不抢，但内心有自己的坚持，用作品和行动说话。',
            traits: ['审美出众，感受力强', '温柔随和，不喜冲突', '活在当下，享受生活', '内心有坚持，外柔内刚'],
            celes: [
                ['奥黛丽·赫本', '（网络常见归类）优雅、善良、低调，晚年投身慈善，是 ISFP"温柔且有力量"的化身。'],
                ['迈克尔·杰克逊', '用音乐和舞蹈表达内心世界的天才艺术家，敏感细腻，是 ISFP 艺术灵魂的极致。'],
                ['迈克尔·菲尔普斯', '（网络常见归类）泳池里的天才，专注自己的赛道、不喜喧哗，用成绩说话。']
            ],
            match: [
                ['ESTJ', 'ESTJ 的务实帮 ISFP 把才华变现，ISFP 的温柔则软化 ESTJ 的强硬，互相成就。'],
                ['ENFJ', 'ENFJ 看见并珍视 ISFP 的才华，愿意为他们搭建舞台，是 ISFP 最好的伯乐与伴侣。']
            ]
        },
        'ESTP': {
            name: '企业家',
            tagline: '聪明、精力充沛且善于感知的人，真正享受生活在边缘',
            desc: 'ESTP 是"行动派中的战斗机"：他们精力充沛、反应敏捷，喜欢在真实世界中冒险和博弈，越有挑战越兴奋。他们务实、果断、不恋战，擅长抓住眼前的机会。他们受不了纸上谈兵，信奉"先干了再说"。',
            traits: ['行动力爆棚，敢闯敢试', '临场应变能力强', '务实直接，目标明确', '精力充沛，热爱冒险'],
            celes: [
                ['欧内斯特·海明威', '（网络常见归类）战地记者、斗牛爱好者、硬汉文学代表，一生都在追逐刺激与冒险，是 ESTP 的写照。'],
                ['麦当娜', '不断突破边界、制造话题的流行女王，嗅觉敏锐、行动果决，是 ESTP 式的商业与艺术双料天才。'],
                ['理查德·布兰森', '维珍创始人，从唱片到航空一路冒险跨界，把"活着就要折腾"践行到底，教科书级 ESTP。']
            ],
            match: [
                ['ISFJ', 'ISFJ 的体贴与稳定是 ESTP 的避风港，ESTP 的活力则让 ISFJ 的生活不再单调。'],
                ['ISTJ', 'ISTJ 的规划为 ESTP 的冲动兜底，ESTP 的灵活也为 ISTJ 打开新世界的大门。']
            ]
        },
        'ESFP': {
            name: '表演者',
            tagline: '自发的、精力充沛的艺人，生活在他们身边永不无聊',
            desc: 'ESFP 是"气氛担当"：他们热情开朗、多才多艺，走到哪儿都是欢乐的中心。他们活在当下，享受美食、音乐、聚会和一切美好的体验，擅长把平凡的日子过得热气腾腾。他们真诚大方，不吝啬赞美，是朋友眼中的开心果。',
            traits: ['热情开朗，多才多艺', '活在当下，享受生活', '真诚大方，乐于分享', '感染力强，气氛担当'],
            celes: [
                ['玛丽莲·梦露', '（网络常见归类）银幕上的性感女神，光芒四射、热爱舞台，是 ESFP 魅力的经典代表。'],
                ['埃尔维斯·普雷斯利', '猫王以极具感染力的舞台表演征服世界，把"秀"做到极致，是 ESFP 表演基因的天花板。'],
                ['杰米·福克斯', '能演能唱能主持的全能艺人，现场魅力十足，是 ESFP 多面手的现代代表。']
            ],
            match: [
                ['ISTJ', 'ISTJ 的可靠让 ESFP 可以放心去浪，ESFP 的快乐也让 ISTJ 的人生多了色彩，经典互补。'],
                ['ISFJ', 'ISFJ 默默把 ESFP 照顾得妥妥帖帖，ESFP 则用热情回馈这份温柔，是温馨的组合。']
            ]
        }
    };

    // ==================== 人群占比（16Personalities 公开统计） ====================
    const TYPE_RATES = {
        'INTJ': 2.1, 'INTP': 3.3, 'ENTJ': 1.8, 'ENTP': 3.2,
        'INFJ': 1.5, 'INFP': 4.4, 'ENFJ': 2.5, 'ENFP': 8.1,
        'ISTJ': 11.6, 'ISFJ': 13.8, 'ESTJ': 8.7, 'ESFJ': 12.3,
        'ISTP': 5.4, 'ISFP': 8.8, 'ESTP': 4.3, 'ESFP': 8.5
    };
    const AT_RATE = { 'A': 44, 'T': 56 };  // 16Personalities 全局 Identity 维度：自信 A 44% / 波动 T 56%


    // ==================== 全局状态 ====================
    let currentQuestions = [];
    let currentIndex = 0;
    let scores = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0, A:0, Tu:0 };
    let history = [];   // 已答记录，用于回退 [{dim, val, optValue}]
    let answering = false;   // 选中后的短暂锁定期（0.5秒标蓝反馈）
    let lastResult = null;   // 最近一次测试结果的结构化数据，供保存图片使用

    const DIM_LABELS = {
        EI: '精力来源', SN: '认知方式', TF: '决策方式', JP: '生活方式', AT: '情绪基调'
    };

    // ==================== DOM ====================
    const startPanel = document.getElementById('startPanel');
    const questionPanel = document.getElementById('questionPanel');
    const resultPanel = document.getElementById('resultPanel');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const backBtn = document.getElementById('backBtn');
    const saveBtn = document.getElementById('saveBtn');
    const questionNum = document.getElementById('questionNum');
    const questionText = document.getElementById('questionText');
    const optionsBox = document.getElementById('optionsBox');
    const progressFill = document.getElementById('progressFill');
    const dimTag = document.getElementById('dimTag');
    const resultType = document.getElementById('resultType');
    const resultSubtype = document.getElementById('resultSubtype');
    const resultName = document.getElementById('resultName');
    const resultTagline = document.getElementById('resultTagline');
    const dimensionsBox = document.getElementById('dimensionsBox');
    const detailCard = document.getElementById('detailCard');
    const miniRadar = document.getElementById('miniRadar');
    const radarChart = document.getElementById('radarChart');

    // ==================== 雷达图绘制（5维：E外向/N直觉/T思考/J判断/A自信） ====================
    function drawRadar(canvas, values, { fill='rgba(26,91,200,0.25)', stroke='#1a5bc8', labelColor='#0d3b7a', showValues=true } = {}) {
        // values: [E%, N%, T%, J%, A%] 0-100
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        const cx = w/2, cy = h/2 + 6, r = Math.min(w,h)/2 - 34;
        const labels = ['外向 E', '直觉 N', '思考 T', '判断 J', '自信 A'];
        const angles = [0,1,2,3,4].map(i => -Math.PI/2 + i * 2*Math.PI/5);
        ctx.clearRect(0,0,w,h);

        // 网格（5层）
        for (let lv=1; lv<=5; lv++) {
            const rr = r * lv/5;
            ctx.beginPath();
            for (let i=0;i<5;i++) {
                const x = cx + rr*Math.cos(angles[i]);
                const y = cy + rr*Math.sin(angles[i]);
                i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
            }
            ctx.closePath();
            ctx.strokeStyle = lv===5 ? '#a9c4ea' : '#d8e5f7';
            ctx.lineWidth = lv===5 ? 1.5 : 1;
            ctx.stroke();
        }
        // 轴线
        for (let i=0;i<5;i++) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + r*Math.cos(angles[i]), cy + r*Math.sin(angles[i]));
            ctx.strokeStyle = '#d8e5f7';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        // 数据多边形
        const pts = [];
        for (let i=0;i<5;i++) {
            const v = Math.max(4, Math.min(100, values[i]));
            const rr = r * v/100;
            pts.push({x: cx + rr*Math.cos(angles[i]), y: cy + rr*Math.sin(angles[i])});
        }
        ctx.beginPath();
        pts.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        // 顶点
        ctx.fillStyle = stroke;
        pts.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4.5, 0, 2*Math.PI);
            ctx.fill();
        });
        // 标签与数值
        ctx.font = 'bold 15px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i=0;i<5;i++) {
            const lx = cx + (r+26)*Math.cos(angles[i]);
            const ly = cy + (r+26)*Math.sin(angles[i]);
            ctx.fillStyle = labelColor;
            ctx.fillText(labels[i], lx, ly);
            if (showValues) {
                ctx.font = 'bold 13px "Microsoft YaHei", sans-serif';
                ctx.fillStyle = '#1a5bc8';
                const vx = cx + (r*0.72)*Math.cos(angles[i]);
                const vy = cy + (r*0.72)*Math.sin(angles[i]);
                ctx.fillText(Math.round(values[i]) + '%', vx, vy);
                ctx.font = 'bold 15px "Microsoft YaHei", sans-serif';
            }
        }
    }

    // 计算五维百分比（供雷达图与结果页使用）
    function calcFivePcts() {
        const p = (a,b) => { const t=a+b; return t>0 ? a/t*100 : 50; };
        return [ p(scores.E,scores.I), p(scores.S,scores.N), p(scores.T,scores.F), p(scores.J,scores.P), p(scores.A,scores.Tu) ];
    }

    // ==================== 计分 ====================
    function addScore(dim, val) {
        // val 为 finalScore（已乘 direction），正数偏首字母，负数偏次字母
        switch(dim) {
            case 'EI': val >= 0 ? scores.E += val : scores.I += Math.abs(val); break;
            case 'SN': val >= 0 ? scores.S += val : scores.N += Math.abs(val); break;
            case 'TF': val >= 0 ? scores.T += val : scores.F += Math.abs(val); break;
            case 'JP': val >= 0 ? scores.J += val : scores.P += Math.abs(val); break;
            case 'AT': val >= 0 ? scores.A += val : scores.Tu += Math.abs(val); break;
        }
    }
    function subScore(dim, val) {
        switch(dim) {
            case 'EI': val >= 0 ? scores.E -= val : scores.I -= Math.abs(val); break;
            case 'SN': val >= 0 ? scores.S -= val : scores.N -= Math.abs(val); break;
            case 'TF': val >= 0 ? scores.T -= val : scores.F -= Math.abs(val); break;
            case 'JP': val >= 0 ? scores.J -= val : scores.P -= Math.abs(val); break;
            case 'AT': val >= 0 ? scores.A -= val : scores.Tu -= Math.abs(val); break;
        }
    }

    // ==================== 测试流程 ====================
    function startTest() {
        const mode = document.querySelector('input[name="mode"]:checked').value;
        // 简版：每维度取5正5负共10题 + A/T取前10题
        if (mode === 'short') {
            const picked = [];
            ['EI','SN','TF','JP'].forEach(d => {
                const pos = fullQuestions.filter(q => q.dimension === d && q.direction === 1).slice(0,5);
                const neg = fullQuestions.filter(q => q.dimension === d && q.direction === -1).slice(0,5);
                picked.push(...pos, ...neg);
            });
            picked.push(...fullQuestions.filter(q => q.dimension === 'AT').slice(0,10));
            currentQuestions = shuffleWithSpacing(picked, 5);
        } else {
            currentQuestions = shuffleWithSpacing(fullQuestions, 8);
        }
        currentIndex = 0;
        answering = false;
        scores = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0, A:0, Tu:0 };
        history = [];
        startPanel.style.display = 'none';
        resultPanel.style.display = 'none';
        questionPanel.style.display = 'block';
        renderQuestion();
    }

    function renderQuestion() {
        const q = currentQuestions[currentIndex];
        questionNum.textContent = `第 ${currentIndex+1} 题 / 共 ${currentQuestions.length} 题`;
        dimTag.textContent = `维度：${DIM_LABELS[q.dimension]}`;
        progressFill.style.width = `${(currentIndex / currentQuestions.length) * 100}%`;
        questionText.textContent = q.text;
        backBtn.disabled = currentIndex === 0;

        optionsBox.innerHTML = '';
        const options = [
            { label: '非常同意', value: 1 },
            { label: '比较同意', value: 0.5 },
            { label: '中立 / 不确定', value: 0 },
            { label: '比较不同意', value: -0.5 },
            { label: '非常不同意', value: -1 }
        ];
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt.label;
            btn.dataset.value = opt.value;
            btn.addEventListener('click', () => handleSelect(opt.value, btn));
            optionsBox.appendChild(btn);
        });
        // 回退到已答题时，恢复之前的选中高亮
        const prev = history[currentIndex];
        if (prev) {
            optionsBox.querySelectorAll('.option-btn').forEach(b => {
                if (Number(b.dataset.value) === prev.optValue) b.classList.add('selected');
            });
        }
        updateMiniRadar();
    }

    function handleSelect(value, btn) {
        if (answering) return;   // 锁定期间防重复点击
        answering = true;
        const q = currentQuestions[currentIndex];
        const finalScore = value * q.direction;
        // 若该题已答过（回退后改答），先撤销旧分再记新分
        const prev = history[currentIndex];
        if (prev) subScore(prev.dim, prev.val);
        addScore(q.dimension, finalScore);
        history[currentIndex] = { dim: q.dimension, val: finalScore, optValue: value };

        // 选中的选项标蓝高亮，禁用其他按钮，0.5秒后自动进入下一题
        optionsBox.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
        btn.classList.add('selected');
        backBtn.disabled = true;
        setTimeout(() => {
            answering = false;
            currentIndex++;
            if (currentIndex < currentQuestions.length) {
                renderQuestion();
            } else {
                showResult();
            }
        }, 500);
    }

    // 回退一题（保留该题答案记录，供回退后恢复选中高亮）
    function goBack() {
        if (currentIndex === 0 || answering) return;
        currentIndex--;
        const last = history[currentIndex];
        // 保留已答分数，由重新选择时撤销旧答案。
        renderQuestion();
    }

    // 实时更新迷你雷达图
    function updateMiniRadar() {
        drawRadar(miniRadar, calcFivePcts(), { fill:'rgba(26,91,200,0.18)', stroke:'#1a5bc8', showValues:false });
    }

    // ==================== 结果展示 ====================
    function showResult() {
        questionPanel.style.display = 'none';
        resultPanel.style.display = 'block';
        progressFill.style.width = '100%';

        // 四维 + A/T 亚型
        const ei = scores.E >= scores.I ? 'E' : 'I';
        const sn = scores.S >= scores.N ? 'S' : 'N';
        const tf = scores.T >= scores.F ? 'T' : 'F';
        const jp = scores.J >= scores.P ? 'J' : 'P';
        const at = scores.A >= scores.Tu ? 'A' : 'T';
        const type = ei + sn + tf + jp;
        const fullType = type + '-' + at;
        resultType.textContent = fullType;

        const subtypeName = at === 'A' ? '自信型（Assertive）' : '波动型（Turbulent）';
        resultSubtype.textContent = subtypeName;
        resultSubtype.className = 'result-subtype ' + (at === 'A' ? 'subtype-a' : 'subtype-t');

        const info = typeData[type];
        resultName.textContent = (info ? info.name : '复合型') + '人格';
        resultTagline.textContent = info ? info.tagline : '独特的复合型人格，兼具多种特质的魅力。';

        // 人群占比（16Personalities 统计：16型占比 + A/T 亚型占比）
        const rate = TYPE_RATES[type];
        const atRate = AT_RATE[at];
        resultRate.innerHTML = rate
            ? `👥 人群中占比约 <b>${rate}%</b>（每 100 人约 ${Math.round(rate)} 人）`
              + `<span class="rate-sub">你的亚型 ${subtypeName} 在 16Personalities 样本中约占 ${atRate}%（全局 A 44% / T 56%）· 数据来源：16Personalities</span>`
            : '';

        // 反向题一致性检测：同一对反向题若回答方向自相矛盾则提示
        // （这正是设置反向题的意义之一：校验作答一致性）
        let conflictPairs = 0;
        const pairChecked = {};
        for (let i = 0; i < history.length; i++) {
            const q = currentQuestions[i];
            if (q.pairId == null || pairChecked[q.pairId]) continue;
            pairChecked[q.pairId] = true;
            for (let j = i + 1; j < history.length; j++) {
                const q2 = currentQuestions[j];
                if (q2.pairId === q.pairId) {
                    if (Math.abs(history[i].optValue - history[j].optValue) <= 0.5) conflictPairs++;
                    break;
                }
            }
        }
        const conflictHtml = conflictPairs > 0
            ? `<div class="conflict-note">⚠️ 你的回答中有 <b>${conflictPairs}</b> 对题目自相矛盾：对同一维度既偏向一端又偏向另一端。测试里有意成对安排了反向题来校验作答一致性，建议点"重新测试"回看这两组题再答一次，结果会更准确。</div>`
            : '';

        // 雷达图
        const pcts = calcFivePcts();
        drawRadar(radarChart, pcts);

        // A/T 亚型说明
        const atDesc = at === 'A'
            ? '你的情绪基调偏「自信型」：心态稳定、抗压能力强，不容易被外界评价左右，面对失败能较快恢复。注意：适度自信，别忽略可以改进的空间。'
            : '你的情绪基调偏「波动型」：追求完美、自我驱动，对细节和他人的评价比较敏感，正是这种"不满足"让你不断进步。注意：别让焦虑透支自己，学会接纳不完美的当下。';

        // 维度进度条
        const calcPercent = (a,b) => { const t=a+b; return t>0 ? Math.round(a/t*100) : 50; };
        const eiPct = calcPercent(scores.E,scores.I), snPct = calcPercent(scores.S,scores.N);
        const tfPct = calcPercent(scores.T,scores.F), jpPct = calcPercent(scores.J,scores.P);
        const atPct = calcPercent(scores.A,scores.Tu);
        dimensionsBox.innerHTML = `${conflictHtml}
            <div class="dim-item">
                <div class="dim-name">精力来源：外向 E ↔ 内向 I</div>
                <div class="dim-bar"><div class="dim-fill" style="width:${eiPct}%"></div></div>
                <div class="dim-value"><span>E ${eiPct}%</span><span>I ${100-eiPct}%</span></div>
            </div>
            <div class="dim-item">
                <div class="dim-name">认知方式：实感 S ↔ 直觉 N</div>
                <div class="dim-bar"><div class="dim-fill" style="width:${snPct}%"></div></div>
                <div class="dim-value"><span>S ${snPct}%</span><span>N ${100-snPct}%</span></div>
            </div>
            <div class="dim-item">
                <div class="dim-name">决策方式：思考 T ↔ 情感 F</div>
                <div class="dim-bar"><div class="dim-fill" style="width:${tfPct}%"></div></div>
                <div class="dim-value"><span>T ${tfPct}%</span><span>F ${100-tfPct}%</span></div>
            </div>
            <div class="dim-item">
                <div class="dim-name">生活方式：判断 J ↔ 感知 P</div>
                <div class="dim-bar"><div class="dim-fill" style="width:${jpPct}%"></div></div>
                <div class="dim-value"><span>J ${jpPct}%</span><span>P ${100-jpPct}%</span></div>
            </div>
            <div class="dim-item">
                <div class="dim-name">情绪基调：自信 A ↔ 波动 T</div>
                <div class="dim-bar"><div class="dim-fill" style="width:${atPct}%"></div></div>
                <div class="dim-value"><span>A ${atPct}%</span><span>T ${100-atPct}%</span></div>
            </div>
            <div class="dim-item" style="background:#fff8f0;border:1px solid #f0dcc0;">
                <div class="dim-name" style="color:#b06a1e;">亚型解读</div>
                <div style="font-size:13px;line-height:1.7;color:#6b4a22;">${atDesc}</div>
            </div>
        `;

        // 人格详情
        if (info) {
            const celebHtml = info.celes.map(c =>
                `<div class="celeb-item"><span class="celeb-name">🌟 ${c[0]}</span> —— ${c[1]}</div>`
            ).join('');
            const matchHtml = info.match.map(m =>
                `<span class="match-chip">${m[0]}</span> <span style="font-size:13px;color:#37474f;">${m[1]}</span>`
            ).join('<br><br>');
            detailCard.innerHTML = `
                <div class="detail-block">
                    <h4>🧭 性格概述</h4>
                    <p>${info.desc}</p>
                </div>
                <div class="detail-block">
                    <h4>✨ 核心特质</h4>
                    <ul>${info.traits.map(t => `<li>${t}</li>`).join('')}</ul>
                </div>
                <div class="detail-block">
                    <h4>🌍 代表人物与事例</h4>
                    ${celebHtml}
                    <p style="font-size:12px;color:#8aa3c8;margin-top:8px;">※ 名人归类为网络社区主流观点，仅作趣味参考，并非本人官方认定。</p>
                </div>
                <div class="detail-block">
                    <h4>💞 与你最搭的人格</h4>
                    ${matchHtml}
                </div>
            `;
        }

        // 保存结构化结果，供"保存结果图片"使用（与页面展示完全一致，一张图不丢信息）
        lastResult = {
            type: type, at: at, subtypeName: subtypeName,
            name: (info ? info.name : '复合型') + '人格',
            tagline: info ? info.tagline : '独特的复合型人格，兼具多种特质的魅力。',
            rate: rate, atRate: atRate,
            atDesc: atDesc, conflictPairs: conflictPairs,
            desc: info ? info.desc : '',
            traits: info ? info.traits : [],
            celes: info ? info.celes : [],
            match: info ? info.match : [],
            pcts: pcts,
            dims: [
                { name: '精力来源：外向 E ↔ 内向 I', pct: eiPct },
                { name: '认知方式：实感 S ↔ 直觉 N', pct: snPct },
                { name: '决策方式：思考 T ↔ 情感 F', pct: tfPct },
                { name: '生活方式：判断 J ↔ 感知 P', pct: jpPct },
                { name: '情绪基调：自信 A ↔ 波动 T', pct: atPct }
            ],
            date: new Date().toLocaleString('zh-CN')
        };
    }

    // ==================== 保存结果图片 ====================
    // 文本换行：按给定字号与最大宽度把长文本拆成多行
    function wrapLines(ctx, text, maxWidth) {
        const lines = [];
        let line = '';
        for (const ch of String(text)) {
            const test = line + ch;
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = ch;
            } else {
                line = test;
            }
        }
        if (line) lines.push(line);
        return lines;
    }

    function saveResultImage() {
        if (!lastResult) { alert('请先完成测试，再保存结果图片。'); return; }
        const r = lastResult;
        const W = 1240, X = 140, MW = 960;
        const F = (size, bold) => `${bold ? 'bold ' : ''}${size}px "Microsoft YaHei", sans-serif`;

        // ---- 测量：预排版，算出每个区块的行数与高度 ----
        const mctx = document.createElement('canvas').getContext('2d');
        const wl = (text, size) => { mctx.font = F(size, false); return wrapLines(mctx, text, MW); };

        const nameLine = r.name + ' · ' + r.tagline;
        mctx.font = F(32, true);
        const nameSize = mctx.measureText(nameLine).width > MW ? 26 : 32;

        const atDescLines = wl(r.atDesc, 20);
        const descLines   = r.desc  ? wl(r.desc, 20) : [];
        const celebLines  = r.celes.map(c => ({ name: '🌟 ' + c[0], body: wl(c[1], 18) }));
        const matchLines  = r.match.map(m => wl(m[0] + '  ' + m[1], 20));
        const conflictLines = r.conflictPairs > 0
            ? wl('⚠️ 你的回答中有 ' + r.conflictPairs + ' 对题目自相矛盾（对同一维度既偏向一端又偏向另一端），建议重新作答以获得更准确的结果。', 18)
            : [];

        const GAP = 24;
        const blocks = [];
        const add = (h, draw) => blocks.push({ h, draw });

        // 1. 头部
        add(110, (ctx, y) => {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#0d3b7a';
            ctx.font = F(40, true);
            ctx.fillText('MBTI 人格深度测试 · 结果报告', 620, y + 42);
            ctx.fillStyle = '#8aa3c8';
            ctx.font = F(18, false);
            ctx.fillText('16 型人格 × 自信/波动亚型 五维测评 · 反向题一致性校验版', 620, y + 78);
        });
        // 2. 类型大字
        add(225, (ctx, y) => {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#0d3b7a';
            ctx.font = F(110, true);
            ctx.fillText(r.type, 620, y + 120);
            ctx.fillStyle = r.at === 'A' ? '#1d7a4f' : '#c05a1c';
            ctx.font = F(26, true);
            ctx.fillText(r.subtypeName, 620, y + 162);
            ctx.fillStyle = '#1a5bc8';
            ctx.font = F(nameSize, true);
            ctx.fillText(nameLine, 620, y + 208);
        });
        // 3. 人群占比
        if (r.rate) {
            add(100, (ctx, y) => {
                ctx.textAlign = 'center';
                ctx.fillStyle = '#1a5bc8';
                ctx.font = F(24, true);
                ctx.fillText(`👥 人群中占比约 ${r.rate}%（每 100 人约 ${Math.round(r.rate)} 人）`, 620, y + 30);
                ctx.fillStyle = '#5b7bb4';
                ctx.font = F(16, false);
                ctx.fillText(`其中 ${r.subtypeName} 亚型约占 16Personalities 样本的 ${r.atRate}%（全局 A 44% / T 56%）· 数据来源：16Personalities`, 620, y + 62);
            });
        }
        // 4. 雷达图
        add(520, (ctx, y) => {
            const rcanvas = document.createElement('canvas');
            rcanvas.width = 560 * 2; rcanvas.height = 480 * 2;
            drawRadar(rcanvas, r.pcts, { showValues: true });
            ctx.drawImage(rcanvas, 620 - 280, y, 560, 480);
        });
        // 5. 五维得分条
        add(500, (ctx, y) => {
            ctx.textAlign = 'left';
            ctx.fillStyle = '#0d3b7a';
            ctx.font = F(22, true);
            ctx.fillText('五维得分', X, y + 24);
            let dy = y + 46;
            r.dims.forEach(d => {
                const letters = d.name.match(/[A-Z]/g) || ['?', '?'];
                ctx.fillStyle = '#37474f';
                ctx.font = F(20, false);
                ctx.fillText(d.name, X, dy);
                ctx.fillStyle = '#e4edfa';
                roundRect(ctx, X, dy + 12, MW, 20, 10);
                ctx.fill();
                ctx.fillStyle = '#1a5bc8';
                roundRect(ctx, X, dy + 12, MW * d.pct / 100, 20, 10);
                ctx.fill();
                ctx.fillStyle = '#5b7bb4';
                ctx.font = F(16, false);
                ctx.fillText(`${letters[0]} ${d.pct}%   ${letters[1]} ${100 - d.pct}%`, X, dy + 52);
                dy += 92;
            });
        });
        // 6. 亚型解读
        add(46 + atDescLines.length * 34, (ctx, y) => {
            ctx.textAlign = 'left';
            ctx.fillStyle = '#b06a1e';
            ctx.font = F(24, true);
            ctx.fillText('亚型解读', X, y + 26);
            ctx.fillStyle = '#6b4a22';
            ctx.font = F(20, false);
            atDescLines.forEach((ln, i) => ctx.fillText(ln, X, y + 60 + i * 34));
        });
        // 7. 性格概述
        if (descLines.length) {
            add(46 + descLines.length * 34, (ctx, y) => {
                ctx.fillStyle = '#0d3b7a';
                ctx.font = F(24, true);
                ctx.fillText('🧭 性格概述', X, y + 26);
                ctx.fillStyle = '#37474f';
                ctx.font = F(20, false);
                descLines.forEach((ln, i) => ctx.fillText(ln, X, y + 60 + i * 34));
            });
        }
        // 8. 核心特质
        if (r.traits.length) {
            add(46 + r.traits.length * 34, (ctx, y) => {
                ctx.fillStyle = '#0d3b7a';
                ctx.font = F(24, true);
                ctx.fillText('✨ 核心特质', X, y + 26);
                ctx.fillStyle = '#37474f';
                ctx.font = F(20, false);
                r.traits.forEach((t, i) => ctx.fillText('• ' + t, X, y + 60 + i * 34));
            });
        }
        // 9. 代表人物与事例
        if (celebLines.length) {
            const celebH = 46 + celebLines.reduce((s, c) => s + 30 + c.body.length * 28, 0) + 40;
            add(celebH, (ctx, y) => {
                ctx.fillStyle = '#0d3b7a';
                ctx.font = F(24, true);
                ctx.fillText('🌍 代表人物与事例', X, y + 26);
                let dy = y + 60;
                celebLines.forEach(c => {
                    ctx.fillStyle = '#1a5bc8';
                    ctx.font = F(20, true);
                    ctx.fillText(c.name, X, dy);
                    dy += 28;
                    ctx.fillStyle = '#455a64';
                    ctx.font = F(18, false);
                    c.body.forEach(ln => { ctx.fillText(ln, X, dy); dy += 28; });
                    dy += 6;
                });
                ctx.fillStyle = '#8aa3c8';
                ctx.font = F(15, false);
                ctx.fillText('※ 名人归类为网络社区主流观点，仅作趣味参考，并非本人官方认定。', X, dy + 14);
            });
        }
        // 10. 最搭人格
        if (matchLines.length) {
            const matchH = 46 + matchLines.reduce((s, m) => s + m.length * 32, 0) + 12;
            add(matchH, (ctx, y) => {
                ctx.fillStyle = '#0d3b7a';
                ctx.font = F(24, true);
                ctx.fillText('💞 与你最搭的人格', X, y + 26);
                let dy = y + 62;
                matchLines.forEach(m => {
                    m.forEach((ln, i) => {
                        if (i === 0) {
                            const idx = ln.indexOf('  ');
                            const chip = idx > 0 ? ln.slice(0, idx) : '';
                            ctx.font = F(17, true);
                            const chipW = ctx.measureText(chip).width;
                            ctx.fillStyle = '#1a5bc8';
                            roundRect(ctx, X, dy - 18, chipW + 20, 26, 13);
                            ctx.fill();
                            ctx.fillStyle = '#fff';
                            ctx.fillText(chip, X + 10, dy);
                            if (idx > 0) {
                                ctx.fillStyle = '#455a64';
                                ctx.font = F(19, false);
                                ctx.fillText(ln.slice(idx + 2), X + chipW + 30, dy);
                            }
                        } else {
                            ctx.fillStyle = '#455a64';
                            ctx.font = F(19, false);
                            ctx.fillText(ln, X, dy);
                        }
                        dy += 32;
                    });
                    dy += 6;
                });
            });
        }
        // 11. 一致性提示
        if (conflictLines.length) {
            add(conflictLines.length * 30 + 20, (ctx, y) => {
                ctx.fillStyle = '#fff7e8';
                roundRect(ctx, X - 10, y, MW + 20, conflictLines.length * 30 + 8, 10);
                ctx.fill();
                ctx.strokeStyle = '#f0d9b0';
                ctx.lineWidth = 1;
                roundRect(ctx, X - 10, y, MW + 20, conflictLines.length * 30 + 8, 10);
                ctx.stroke();
                ctx.fillStyle = '#8a5a12';
                ctx.font = F(18, false);
                conflictLines.forEach((ln, i) => ctx.fillText(ln, X, y + 24 + i * 30));
            });
        }
        // 12. 页脚
        add(110, (ctx, y) => {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#8aa3c8';
            ctx.font = F(18, false);
            ctx.fillText('制作人：弥生结弦 · 仅供学习与自我探索参考', 620, y + 28);
            ctx.fillText('生成时间：' + r.date, 620, y + 58);
            ctx.font = F(14, false);
            ctx.fillText('本测试基于 16Personalities 五维理论（含 A/T 亚型），结果仅供自我探索参考，不构成专业心理评估', 620, y + 88);
        });

        // ---- 计算总高度并绘制 ----
        const contentH = blocks.reduce((s, b) => s + b.h, 0) + GAP * (blocks.length - 1);
        const H = 60 * 2 + contentH + 10;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        // 背景
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#eaf1fc');
        grad.addColorStop(1, '#d3e3f8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // 白色卡片
        roundRect(ctx, 60, 60, 1120, H - 120, 28);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#c9dcf7';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 依次绘制各区块
        let y = 90;
        blocks.forEach(b => {
            b.draw(ctx, y);
            y += b.h + GAP;
        });

        // 下载
        try {
            const dataUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = '我的MBTI人格类型_' + r.type + '-' + r.at + '_' + new Date().toISOString().slice(0, 10) + '.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (e) {
            alert('保存失败：' + e.message + '。可尝试右键雷达图区域另存图片。');
        }
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.arcTo(x+w, y, x+w, y+h, r);
        ctx.arcTo(x+w, y+h, x, y+h, r);
        ctx.arcTo(x, y+h, x, y, r);
        ctx.arcTo(x, y, x+w, y, r);
        ctx.closePath();
    }

    // ==================== 重新开始 ====================
    function restartTest() {
        resultPanel.style.display = 'none';
        questionPanel.style.display = 'none';
        startPanel.style.display = 'block';
    }

    // ==================== 事件绑定 ====================
    startBtn.addEventListener('click', startTest);
    restartBtn.addEventListener('click', restartTest);
    backBtn.addEventListener('click', goBack);
    saveBtn.addEventListener('click', saveResultImage);

    document.querySelectorAll('input[name="mode"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (questionPanel.style.display === 'block' || resultPanel.style.display === 'block') {
                restartTest();
            }
        });
    });

    
  try { await context.files.bindImage(root.querySelector(".cover-wrap img"), "template-assets/images/cover.jpg"); } catch (error) { root.querySelector(".cover-wrap img").alt = "封面加载失败"; console.error("封面加载失败", error); }
}
