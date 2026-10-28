/* ============================================================================
 * 医械法规云 MedReg Hub — B2B 法规服务集市数据（window.MDR_MARKET）
 * ----------------------------------------------------------------------------
 * 定位：把「法规知识」变成可被供需双方对接的**服务商品**。
 *   供给侧 —— 检测机构、注册代理、临床评价、体系顾问、软件合规、海外代理、
 *             法规数据服务商、上市后警戒服务商；
 *   需求侧 —— 医疗器械注册人、生产企业、进口代理、投资与尽调机构。
 *
 * 重要声明（请勿删除）：
 *   1. 本卷中的发布方、服务包、评分、成交笔数与响应时长为**演示数据**，
 *      仅用于展示 B2B 法规服务集市的信息架构与交互；命名均为示意性主体，
 *      不代表任何真实机构及其资质、价格与履约记录。
 *   2. 接入真实供给侧，需以实际机构主体信息、资质证明与经审计的履约数据替换。
 *   3. 平台**不经手交易与支付**。集市提供的是需求发布、交付物比对、比价参考
 *      与成果件归档能力，签约与结算发生在供需双方之间。
 *   4. 服务包的 covers 字段为**法规 id 数组**，由 tools/validate.js 强制校验
 *      必须指向法规库中真实存在的条目——集市的专业性建立在法规库之上。
 * ==========================================================================*/
window.MDR_MARKET = {
  version: "1.0.0",
  updatedAt: "2026-09-17",
  demo: true,

  notice: "本集市中的发布方、服务包、评分与成交数据均为演示数据，用于展示 B2B 法规服务集市的信息架构；接入真实供给侧需对接实际机构主体与资质证明。平台不经手交易与支付，提供需求发布、交付物比对、比价参考与成果件归档能力。",

  /* ------------------------------------------------------------------
   * 发布方类型（铺位业态）
   * ----------------------------------------------------------------*/
  vendorTypes: [
    { id: "test", name: "检测检验机构", icon: "🔬", desc: "具备 CNAS / CMA 资质的器械检测与试验服务" },
    { id: "agent", name: "注册申报代理", icon: "📑", desc: "注册、备案、变更与延续申报的全程代办与辅导" },
    { id: "clin", name: "临床评价与试验", icon: "🧪", desc: "同品种比对、临床试验、统计分析与真实世界研究" },
    { id: "qms", name: "质量体系与生产合规", icon: "🏭", desc: "GMP 体系搭建、核查模拟、委托生产与认证咨询" },
    { id: "sw", name: "软件与数字医疗合规", icon: "💻", desc: "软件生存周期、AI 算法、网络安全与人因设计" },
    { id: "global", name: "海外注册与市场准入", icon: "🌍", desc: "CE / FDA / MDSAP 等海外准入代理与本地代表" },
    { id: "data", name: "法规数据与工具", icon: "📊", desc: "法规变更监测、清单台账、差距分析与数字化工具" },
    { id: "post", name: "上市后与警戒服务", icon: "🛡️", desc: "不良事件监测、定期风险评价、召回演练与报告代理" }
  ],

  /* ------------------------------------------------------------------
   * 服务类目（集市一级类目）
   * ----------------------------------------------------------------*/
  offerCats: [
    { id: "reg-test", name: "检测检验", icon: "🔬", desc: "EMC / 安规 / 生物学 / 性能 / 环境试验", type: "test" },
    { id: "reg-agent", name: "注册申报代理", icon: "📑", desc: "二三类注册、创新审查、立卷预演与补正应对", type: "agent" },
    { id: "clin-eval", name: "临床评价与试验", icon: "🧪", desc: "同品种比对、临床试验、真实世界数据", type: "clin" },
    { id: "qms-gmp", name: "体系与生产合规", icon: "🏭", desc: "GMP 换版、核查模拟、委托生产、体系认证", type: "qms" },
    { id: "sw-ai", name: "软件 / AI / 网络安全", icon: "💻", desc: "软件生存周期、AI 算法、网络安全、人因设计", type: "sw" },
    { id: "global-ma", name: "海外市场准入", icon: "🌍", desc: "欧盟 CE、美国 FDA、MDSAP 与多国打包", type: "global" },
    { id: "data-tool", name: "法规数据与工具", icon: "📊", desc: "变更监测、清单台账、差距分析与订阅服务", type: "data" },
    { id: "post-market", name: "上市后与警戒", icon: "🛡️", desc: "不良事件、定期风险评价、召回与报告代理", type: "post" }
  ],

  /* ------------------------------------------------------------------
   * 发布方（机构铺位）
   *   tier：gold 金牌 / silver 银牌 / bronze 铜牌（平台分级，演示）
   *   rating：综合评分（5 分制）；respMins：平均首次响应分钟数
   *   fulfill：按期履约率（%）
   * ----------------------------------------------------------------*/
  vendors: [
    {
      id: "v-hx", name: "华械检测 · 华东联合实验室", short: "华械检测",
      type: "test", region: "CN", city: "上海", since: "2014",
      verified: true, tier: "gold", rating: 4.8, reviews: 168, deals: 462,
      respMins: 35, fulfill: 98, staff: 180,
      certs: ["CNAS", "CMA"],
      sectors: ["有源医疗器械", "无源医疗器械", "体外诊断试剂"],
      intro: "面向医疗器械注册检验的综合检测机构，覆盖电气安全、电磁兼容、生物学评价、性能与可靠性试验。出具报告可直接用于国内注册申报，同时提供整改建议与技术沟通支持。",
      badges: ["平台认证", "10 年以上"]
    },
    {
      id: "v-kr", name: "康睿医疗器械注册咨询", short: "康睿注册",
      type: "agent", region: "CN", city: "北京", since: "2016",
      verified: true, tier: "gold", rating: 4.9, reviews: 214, deals: 538,
      respMins: 22, fulfill: 99, staff: 95,
      certs: ["ISO 9001", "企业合规经营备案"],
      sectors: ["有源器械", "植入介入", "口腔与齿科", "创新器械"],
      intro: "专注国内二类、三类医疗器械注册申报与创新通道辅导，团队含前审评沟通经验人员。以立卷审查要求前置核对为特色，降低发补轮次。",
      badges: ["平台认证", "口碑领先"]
    },
    {
      id: "v-mz", name: "明泽临床评价与统计服务", short: "明泽临床",
      type: "clin", region: "CN", city: "南京", since: "2017",
      verified: true, tier: "gold", rating: 4.7, reviews: 132, deals: 286,
      respMins: 48, fulfill: 97, staff: 76,
      certs: ["临床试验机构合作备案", "统计师执业资质"],
      sectors: ["心血管", "骨科", "影像设备", "体外诊断"],
      intro: "提供同品种临床评价资料撰写、临床试验全流程管理、生物统计分析与真实世界数据研究。熟悉临床评价技术指导原则与临床试验项目检查要点。",
      badges: ["平台认证"]
    },
    {
      id: "v-jw", name: "精卫软件合规技术", short: "精卫软件",
      type: "sw", region: "CN", city: "杭州", since: "2019",
      verified: true, tier: "silver", rating: 4.8, reviews: 96, deals: 208,
      respMins: 30, fulfill: 96, staff: 58,
      certs: ["CMMI 3", "ISO 27001"],
      sectors: ["医疗 AI", "独立软件", "软件组件", "远程医疗"],
      intro: "聚焦医疗器械软件、人工智能与网络安全合规，提供软件生存周期文档体系、算法研究资料、网络安全漏洞管理与可用性工程验证服务。",
      badges: ["平台认证", "新锐"]
    },
    {
      id: "v-hx2", name: "恒信质量管理顾问", short: "恒信质管",
      type: "qms", region: "CN", city: "苏州", since: "2013",
      verified: true, tier: "gold", rating: 4.7, reviews: 176, deals: 412,
      respMins: 40, fulfill: 98, staff: 110,
      certs: ["ISO 13485 咨询资质", "GB/T 42061 内审员培训资质"],
      sectors: ["无菌器械", "植入器械", "体外诊断", "医用材料"],
      intro: "提供生产质量管理规范体系搭建与换版、注册质量管理体系核查模拟检查、委托生产质量协议与受托方审核、ISO 13485 认证咨询。",
      badges: ["平台认证", "10 年以上"]
    },
    {
      id: "v-hy", name: "环宇海外注册代理", short: "环宇海外",
      type: "global", region: "CN", city: "深圳", since: "2015",
      verified: true, tier: "gold", rating: 4.6, reviews: 148, deals: 324,
      respMins: 55, fulfill: 95, staff: 140,
      certs: ["欧盟授权代表资质", "美国代理人资质"],
      sectors: ["影像与监护", "手术器械", "体外诊断", "家用医疗"],
      intro: "覆盖欧盟 MDR / IVDR、美国 FDA、MDSAP、加拿大、澳大利亚、巴西、日本等主要市场的注册代理与合规服务，提供欧代与美代角色支持。",
      badges: ["平台认证", "多国覆盖"]
    },
    {
      id: "v-zx", name: "智械法规数据科技", short: "智械数据",
      type: "data", region: "CN", city: "上海", since: "2021",
      verified: true, tier: "silver", rating: 4.5, reviews: 64, deals: 158,
      respMins: 18, fulfill: 99, staff: 42,
      certs: ["软件企业认定"],
      sectors: ["法规数据服务", "合规数字化", "企业法规台账"],
      intro: "提供法规变更监测与影响分析、企业法规清单与差距分析台账搭建、合规数字化工具定制，支持按产品线与目标市场做条目级订阅。",
      badges: ["新锐", "响应最快"]
    },
    {
      id: "v-jc", name: "警戒通医疗器械警戒服务", short: "警戒通",
      type: "post", region: "CN", city: "成都", since: "2018",
      verified: true, tier: "silver", rating: 4.6, reviews: 88, deals: 196,
      respMins: 28, fulfill: 97, staff: 54,
      certs: ["质量管理体系认证"],
      sectors: ["上市后监测", "召回管理", "定期风险评价"],
      intro: "专注上市后环节：不良事件监测体系搭建与报告代理、定期风险评价报告撰写、召回演练与召回报告代理，支持国内外双轨报告要求。",
      badges: ["平台认证", "响应快"]
    }
  ],

  /* ------------------------------------------------------------------
   * 上架服务包（集市商品）
   *   cat：服务类目 id；price.mode：free 免费 / quote 按项目报价 /
   *        from 起价 / package 套餐价
   *   covers：覆盖的法规 id（必须存在于法规库）
   * ----------------------------------------------------------------*/
  offers: [
    /* ---------- 华械检测 ---------- */
    {
      id: "of-hx-01", vendorId: "v-hx", cat: "reg-test",
      title: "有源医疗器械 EMC 与电气安全全项检测",
      price: { mode: "quote", label: "按项目报价" }, days: "15–25 个工作日",
      deliverables: ["CNAS 检测报告", "原始数据记录", "不符合项整改建议书"],
      covers: ["cn-gb9706-1", "cn-yy9706-102", "cn-nmpa-2023-14", "intl-iec60601"],
      tags: ["EMC", "电气安全", "并列标准"], rating: 4.9, reviews: 52, deals: 186,
      badges: ["热销", "官方认可"],
      summary: "按 GB 9706.1-2020 及配套并列标准执行电磁兼容与电气安全全项检测，出具可用于注册申报的检测报告。",
      detail: "覆盖 1-2 并列标准（电磁兼容）、发射与抗扰度全项、患者漏电流与电介质强度等。检测前提供预测试与整改建议，可显著缩短正式检验周期。报告格式符合注册申报资料要求。"
    },
    {
      id: "of-hx-02", vendorId: "v-hx", cat: "reg-test",
      title: "无源器械生物学评价与化学表征",
      price: { mode: "quote", label: "按项目报价" }, days: "20–40 个工作日",
      deliverables: ["生物学评价报告", "化学表征与可沥滤物数据", "ISO 10993 评价路线表"],
      covers: ["intl-iso10993", "cn-33", "cn-gcp"],
      tags: ["生物学评价", "ISO 10993", "化学表征"], rating: 4.7, reviews: 38, deals: 124,
      badges: [],
      summary: "按 ISO 10993 系列设计生物学评价方案，完成化学表征、可沥滤物研究与生物学试验。",
      detail: "先做材料表征与已有数据评审，能豁免的试验不做——避免过度试验。对植入与接触类器械提供降解产物与可沥滤物风险评估。评价报告可直接进入注册资料。"
    },
    {
      id: "of-hx-03", vendorId: "v-hx", cat: "reg-test",
      title: "有源器械环境试验与可靠性验证",
      price: { mode: "quote", label: "按项目报价" }, days: "10–20 个工作日",
      deliverables: ["环境试验报告", "可靠性验证方案与结论", "包装运输试验报告"],
      covers: ["cn-gb9706-1", "cn-33"],
      tags: ["环境试验", "可靠性", "包装运输"], rating: 4.6, reviews: 26, deals: 92,
      badges: [],
      summary: "覆盖气候、机械、运输与包装试验，验证器械在预期使用与运输条件下的性能保持能力。",
      detail: "含高低温、湿热、振动、冲击、跌落与包装完整性试验。方案按产品预期运输与贮存条件定制，避免照搬通用条件导致结论不适用。"
    },
    {
      id: "of-hx-04", vendorId: "v-hx", cat: "reg-test",
      title: "体外诊断试剂分析性能与稳定性研究",
      price: { mode: "quote", label: "按项目报价" }, days: "25–45 个工作日",
      deliverables: ["分析性能评估报告", "稳定性研究报告", "参考区间研究资料"],
      covers: ["cn-48", "cn-nmpa-122", "cn-gmp-ivd"],
      tags: ["IVD", "分析性能", "稳定性"], rating: 4.7, reviews: 31, deals: 108,
      badges: [],
      summary: "按 IVD 注册申报要求完成精密度、准确度、线性、检出限、参考区间与稳定性研究。",
      detail: "方案对齐体外诊断试剂注册申报资料要求，数据格式与统计方法按审评惯例组织，减少发补。含实时稳定性与加速稳定性两条路线。"
    },

    /* ---------- 康睿注册 ---------- */
    {
      id: "of-kr-01", vendorId: "v-kr", cat: "reg-agent",
      title: "二类 / 三类医疗器械注册申报全流程代办",
      price: { mode: "quote", label: "按项目报价" }, days: "按注册时序推进",
      deliverables: ["全套申报资料", "立卷自查表", "审评沟通记录与补正答复"],
      covers: ["cn-47", "cn-nmpa-121", "cn-dossier-2022"],
      tags: ["注册申报", "三类优先", "全流程"], rating: 4.9, reviews: 96, deals: 246,
      badges: ["热销", "口碑领先"],
      summary: "从注册策略制定到取得注册证的全流程代办，含资料撰写、立卷自查、审评沟通与补正答复。",
      detail: "先做注册策略与路径判断（是否需临床评价、是否可走创新通道、是否需体系核查），再按 121 号公告六大资料模块逐项落实。以立卷审查要求前置核对，降低发补轮次。"
    },
    {
      id: "of-kr-02", vendorId: "v-kr", cat: "reg-agent",
      title: "产品技术要求编写与符合性预评价",
      price: { mode: "from", amount: 8800, label: "¥8,800 起" }, days: "7–15 个工作日",
      deliverables: ["产品技术要求文本", "检验项目与方法确定依据", "安全性能基本原则符合性清单"],
      covers: ["cn-tech-require", "cn-essp", "cn-essp-tech", "cn-33"],
      tags: ["技术要求", "基本原则", "标准引用"], rating: 4.8, reviews: 62, deals: 178,
      badges: ["热销"],
      summary: "按编写指导原则起草产品技术要求，逐项落实安全和性能基本原则，标准引用全部带上版本年号。",
      detail: "常见退回原因就在这里：标准未标年号、检验方法不可操作、指标与临床需求脱节、缺强制性标准符合性声明。本服务按指导原则逐条核对并给出依据。"
    },
    {
      id: "of-kr-03", vendorId: "v-kr", cat: "reg-agent",
      title: "创新医疗器械特别审查申报辅导",
      price: { mode: "quote", label: "按项目报价" }, days: "15–30 个工作日",
      deliverables: ["创新性论证材料", "专利与核心技术证明材料包", "申报沟通与答辩支持"],
      covers: ["cn-innovation", "cn-47", "cn-nmpa-121"],
      tags: ["创新审查", "绿色通道", "答辩支持"], rating: 4.8, reviews: 44, deals: 86,
      badges: ["稀缺服务"],
      summary: "针对创新医疗器械特别审查通道，辅导创新性论证与技术材料准备，含申报答辩支持。",
      detail: "核心是通过「技术上属于国内首创、国际领先且具有显著临床应用价值」的论证关。需要把专利、文献检索、同类产品对比与临床价值串成一条证据链，而非堆砌材料。"
    },
    {
      id: "of-kr-04", vendorId: "v-kr", cat: "reg-agent",
      title: "注册立卷审查预演与补正答复",
      price: { mode: "from", amount: 12800, label: "¥12,800 起" }, days: "10–20 个工作日",
      deliverables: ["立卷模拟审查意见表", "补正资料撰写与答复", "沟通交流材料准备"],
      covers: ["cn-dossier-2022", "cn-comm", "cn-nmpa-121", "cn-nmpa-2021-76"],
      tags: ["立卷审查", "补正答复", "沟通交流"], rating: 4.9, reviews: 58, deals: 142,
      badges: ["口碑领先"],
      summary: "以审评视角对申报资料做一次立卷审查预演，提前发现形式与实质缺陷，并辅导补正答复。",
      detail: "立卷审查关注资料完整性与形式合规，是注册受理的第一道闸。预演会模拟审查要点逐项过筛，输出问题清单与修改优先级，避免因形式缺陷浪费一个受理周期。"
    },

    /* ---------- 明泽临床 ---------- */
    {
      id: "of-mz-01", vendorId: "v-mz", cat: "clin-eval",
      title: "同品种临床评价资料撰写与文献系统评价",
      price: { mode: "quote", label: "按项目报价" }, days: "20–35 个工作日",
      deliverables: ["临床评价报告", "文献检索与筛选记录", "同品种比对表与差异分析"],
      covers: ["cn-ce-guideline", "cn-47", "cn-rwd", "cn-essp"],
      tags: ["同品种比对", "文献评价", "临床评价"], rating: 4.8, reviews: 54, deals: 138,
      badges: ["热销"],
      summary: "按临床评价技术指导原则完成同品种比对、文献系统评价与临床评价报告撰写。",
      detail: "关键在于同品种选择的充分性与差异分析的说服力。检索策略、筛选流程与数据提取都要可复现，评价结论需明确是否可豁免临床试验。"
    },
    {
      id: "of-mz-02", vendorId: "v-mz", cat: "clin-eval",
      title: "临床试验方案设计、统计分析与 GCP 合规",
      price: { mode: "quote", label: "按项目报价" }, days: "按试验周期",
      deliverables: ["临床试验方案与CRF", "统计分析计划与报告", "GCP 合规文件包"],
      covers: ["cn-gcp", "cn-37", "cn-ct-inspect", "intl-iso14155"],
      tags: ["临床试验", "GCP", "统计分析"], rating: 4.7, reviews: 42, deals: 96,
      badges: [],
      summary: "从方案设计、机构备案到数据统计与临床试验项目检查应对的全链条支持。",
      detail: "方案设计先定终点指标与样本量，再倒推随访设计。对齐临床试验项目检查要点与判定原则，把可能被判定为真实性问题的风险点前置排除。"
    },
    {
      id: "of-mz-03", vendorId: "v-mz", cat: "clin-eval",
      title: "真实世界数据研究设计与统计支持",
      price: { mode: "quote", label: "按项目报价" }, days: "25–45 个工作日",
      deliverables: ["真实世界研究方案", "数据处理与分析报告", "数据质量评价记录"],
      covers: ["cn-rwd", "cn-ce-guideline"],
      tags: ["真实世界数据", "RWD", "数据治理"], rating: 4.6, reviews: 22, deals: 48,
      badges: [],
      summary: "面向真实世界数据用于临床评价的场景，完成研究设计、数据治理与分析。",
      detail: "真实世界路径的门槛在数据适用性论证——数据来源、完整性、变量定义与偏倚控制都要经得起审查。报告需明确结论的适用边界。"
    },

    /* ---------- 精卫软件 ---------- */
    {
      id: "of-jw-01", vendorId: "v-jw", cat: "sw-ai",
      title: "医疗器械软件生存周期文档体系搭建",
      price: { mode: "from", amount: 16800, label: "¥16,800 起" }, days: "15–30 个工作日",
      deliverables: ["软件研究资料", "软件生存周期过程文件", "软件版本与发布记录规范"],
      covers: ["cn-software", "cn-yyt0664", "cn-sw-appendix"],
      tags: ["软件生存周期", "独立软件", "文档体系"], rating: 4.8, reviews: 46, deals: 132,
      badges: ["热销"],
      summary: "按软件注册审查指导原则搭建软件研究资料与生存周期过程文档，含现成模板与评审。",
      detail: "软件文档最容易出问题的是「文档齐全但追溯断裂」——需求、设计、测试、缺陷、版本之间没有双向可追溯。本服务以可追溯矩阵为核心组织文档。"
    },
    {
      id: "of-jw-02", vendorId: "v-jw", cat: "sw-ai",
      title: "人工智能医疗器械算法研究与审评沟通",
      price: { mode: "quote", label: "按项目报价" }, days: "20–40 个工作日",
      deliverables: ["算法研究资料", "数据集描述与质控记录", "算法性能评价报告"],
      covers: ["cn-ai", "cn-software"],
      tags: ["人工智能", "算法评价", "数据集"], rating: 4.8, reviews: 34, deals: 76,
      badges: ["稀缺服务"],
      summary: "面向 AI 医疗器械，完成算法研究资料、训练与测试数据集描述、算法性能与泛化能力评价。",
      detail: "审评关注数据来源合规性、训练/调优/测试集划分、性能指标选择与临床场景一致性。黑箱模型的决策可解释性论证是常被追问的点。"
    },
    {
      id: "of-jw-03", vendorId: "v-jw", cat: "sw-ai",
      title: "医疗器械网络安全与漏洞管理",
      price: { mode: "from", amount: 14800, label: "¥14,800 起" }, days: "15–25 个工作日",
      deliverables: ["网络安全研究资料", "威胁建模与风险分析表", "漏洞扫描与整改记录"],
      covers: ["cn-cyber", "cn-software"],
      tags: ["网络安全", "威胁建模", "漏洞管理"], rating: 4.7, reviews: 28, deals: 84,
      badges: [],
      summary: "按网络安全注册审查指导原则完成威胁建模、安全能力评价与上市后漏洞管理机制。",
      detail: "除注册评审要求外，还需建立上市后漏洞响应流程——这也是体系核查会看的点。含网络连接、数据接口、远程升级等场景的风险分析。"
    },
    {
      id: "of-jw-04", vendorId: "v-jw", cat: "sw-ai",
      title: "可用性工程（人因设计）验证与评价",
      price: { mode: "from", amount: 19800, label: "¥19,800 起" }, days: "20–35 个工作日",
      deliverables: ["可用性工程文档", "形成性评价记录", "总结性评价报告"],
      covers: ["cn-hf", "cn-yyt1474"],
      tags: ["人因设计", "可用性", "使用错误"], rating: 4.7, reviews: 24, deals: 62,
      badges: [],
      summary: "按人因设计指导原则完成使用相关风险分析、形成性评价与总结性评价。",
      detail: "先识别关键任务与使用错误，再用模拟使用场景做形成性与总结性评价。评价结论要能对应到设计更改或风险控制措施，而非单纯做一轮测试。"
    },

    /* ---------- 恒信质管 ---------- */
    {
      id: "of-hx2-01", vendorId: "v-hx2", cat: "qms-gmp",
      title: "生产质量管理规范（2025 版）体系搭建与换版",
      price: { mode: "quote", label: "按项目报价" }, days: "30–60 个工作日",
      deliverables: ["质量手册与程序文件", "换版差异对照表", "内审与管理评审记录"],
      covers: ["cn-gmp-2025", "cn-gmp", "cn-53"],
      tags: ["GMP 换版", "体系文件", "差异对照"], rating: 4.8, reviews: 68, deals: 186,
      badges: ["热销", "时效服务"],
      summary: "针对 2025 年修订版生产质量管理规范，完成体系文件换版、差异对照与人员培训。",
      detail: "换版不是改文件名，而是把新增要求落到实际流程与记录上。本服务先做条款级差异对照，再逐条确定落地动作与验证方式，避免体系文件与实际运行两张皮。"
    },
    {
      id: "of-hx2-02", vendorId: "v-hx2", cat: "qms-gmp",
      title: "无菌 / 植入器械 GMP 附录专项辅导",
      price: { mode: "quote", label: "按项目报价" }, days: "20–45 个工作日",
      deliverables: ["附录符合性检查表", "洁净区与工艺验证方案", "灭菌确认资料评审意见"],
      covers: ["cn-gmp-aseptic", "cn-gmp-implant", "cn-gmp-2025"],
      tags: ["无菌", "植入", "附录专项"], rating: 4.7, reviews: 46, deals: 118,
      badges: [],
      summary: "针对无菌与植入性医疗器械专项附录，辅导洁净控制、灭菌确认与植入物追溯。",
      detail: "无菌与植入类产品在体系核查中问题最集中：洁净区监测数据不全、灭菌确认与实际工艺不符、追溯链断裂。按附录条款逐项建立证据。"
    },
    {
      id: "of-hx2-03", vendorId: "v-hx2", cat: "qms-gmp",
      title: "注册质量管理体系核查模拟检查",
      price: { mode: "from", amount: 19800, label: "¥19,800 起" }, days: "5–10 个工作日",
      deliverables: ["模拟检查报告", "缺陷项分级清单", "整改方案与验证建议"],
      covers: ["cn-rsl", "cn-53", "cn-gmp-2025"],
      tags: ["体系核查", "模拟检查", "整改"], rating: 4.9, reviews: 72, deals: 156,
      badges: ["口碑领先"],
      summary: "按体系核查指南做一次现场模拟检查，输出缺陷清单与整改优先级，降低正式核查风险。",
      detail: "模拟检查覆盖机构人员、厂房设施、设备、设计开发、采购、生产、质量控制、销售与售后全链条，重点看记录的真实性与一致性。"
    },
    {
      id: "of-hx2-04", vendorId: "v-hx2", cat: "qms-gmp",
      title: "委托生产质量协议与受托方审核",
      price: { mode: "from", amount: 9800, label: "¥9,800 起" }, days: "10–20 个工作日",
      deliverables: ["委托生产质量协议", "受托方现场审核报告", "职责边界与接口清单"],
      covers: ["cn-entrust-agreement", "cn-53", "cn-import-domestic"],
      tags: ["委托生产", "质量协议", "供应商审核"], rating: 4.6, reviews: 36, deals: 104,
      badges: [],
      summary: "起草委托生产质量协议并审核受托方能力，明确双方职责边界与质量接口。",
      detail: "委托生产的风险集中在职责空白区——设计变更、不合格品处置、上市后信息传递往往没人认领。协议要把接口逐条写清，并把受托方纳入合格供应商管理。"
    },
    {
      id: "of-hx2-05", vendorId: "v-hx2", cat: "qms-gmp",
      title: "ISO 13485 / GB/T 42061 体系认证咨询",
      price: { mode: "quote", label: "按项目报价" }, days: "40–90 个工作日",
      deliverables: ["体系文件全套", "内审员培训与考核", "认证审核全程陪同"],
      covers: ["cn-gbt42061", "intl-iso13485", "cn-mgr-rep", "cn-gmp"],
      tags: ["ISO 13485", "GB/T 42061", "认证"], rating: 4.7, reviews: 58, deals: 168,
      badges: [],
      summary: "搭建符合 ISO 13485:2016 / GB/T 42061-2022 的质量管理体系并支持认证审核。",
      detail: "含差距分析、文件体系、内审与管理评审、认证机构审核陪同。体系按实际业务流程搭建，不做文档堆砌，便于后续通过注册体系核查。"
    },

    /* ---------- 环宇海外 ---------- */
    {
      id: "of-hy-01", vendorId: "v-hy", cat: "global-ma",
      title: "欧盟 MDR CE 认证全流程代理",
      price: { mode: "quote", label: "按项目报价" }, days: "8–18 个月",
      deliverables: ["技术文档（TD）", "临床评价报告（CER）", "公告机构沟通与不符合项答复"],
      covers: ["eu-mdr", "eu-607", "eu-mdcg", "intl-iso13485"],
      tags: ["CE 认证", "MDR", "公告机构"], rating: 4.6, reviews: 62, deals: 142,
      badges: ["热销", "多国覆盖"],
      summary: "按 MDR (EU) 2017/745 组织技术文档与临床评价，对接公告机构直至取得 CE 证书。",
      detail: "MDR 下临床评价要求显著提高，等同性论证门槛变严。本服务含分类判定、符合性路径选择、公告机构匹配与不符合项答复支持。过渡期条款适用性需按产品分类单独判断。"
    },
    {
      id: "of-hy-02", vendorId: "v-hy", cat: "global-ma",
      title: "美国 FDA 510(k) / De Novo 申报代理",
      price: { mode: "quote", label: "按项目报价" }, days: "6–12 个月",
      deliverables: ["510(k) 提交包（eSTAR 格式）", "实质等同性对比表", "FDA 问询答复（AI 函）"],
      covers: ["us-807", "us-estar", "us-qmsr", "us-fdc"],
      tags: ["510(k)", "eSTAR", "实质等同"], rating: 4.7, reviews: 54, deals: 128,
      badges: ["多国覆盖"],
      summary: "按 eSTAR 电子提交模板组织 510(k) 资料，做实质等同性论证与 FDA 问询答复。",
      detail: "eSTAR 强制化后，资料完整性在受理阶段就被严格校验，缺失即触发拒收（RTA）。本服务含产品编码与比对器械选择、测试项目规划、QMSR 体系衔接。"
    },
    {
      id: "of-hy-03", vendorId: "v-hy", cat: "global-ma",
      title: "MDSAP 单一审核与多国准入打包",
      price: { mode: "quote", label: "按项目报价" }, days: "6–14 个月",
      deliverables: ["MDSAP 审核文件包", "多国注册申请材料", "审核不符合项整改计划"],
      covers: ["intl-mdsap", "ca-mdr", "au-tga", "br-rdc751", "jp-qms"],
      tags: ["MDSAP", "多国打包", "单一审核"], rating: 4.6, reviews: 40, deals: 96,
      badges: ["多国覆盖"],
      summary: "以 MDSAP 单一审核结果覆盖多国质量体系要求，并打包完成各国注册申请。",
      detail: "MDSAP 一次审核可支撑美国、加拿大、澳大利亚、巴西、日本的质量体系合规，显著降低重复审核成本。关键是审核范围与国家注册产品线的一致性规划。"
    },
    {
      id: "of-hy-04", vendorId: "v-hy", cat: "global-ma",
      title: "欧盟 IVDR 体外诊断器械合规与性能评价",
      price: { mode: "quote", label: "按项目报价" }, days: "10–24 个月",
      deliverables: ["性能评价报告（PER）", "科学有效性报告", "IVDR 技术文档"],
      covers: ["eu-ivdr", "eu-mdr", "cn-48"],
      tags: ["IVDR", "性能评价", "分类判定"], rating: 4.5, reviews: 28, deals: 64,
      badges: [],
      summary: "按 IVDR (EU) 2017/746 完成分类判定、性能评价与公告机构对接。",
      detail: "IVDR 下多数 IVD 产品分类由 IVDD 的清单制改为风险分级（A–D 类），大量产品需首次走公告机构。性能评价与科学有效性论证是核心难点。"
    },

    /* ---------- 智械数据 ---------- */
    {
      id: "of-zx-01", vendorId: "v-zx", cat: "data-tool",
      title: "法规变更监测与影响分析订阅",
      price: { mode: "package", amount: 36000, label: "¥36,000 / 年" }, days: "按周推送",
      deliverables: ["法规变更周报", "影响条款清单与差异对照", "受影响产品线提示"],
      covers: ["cn-739", "cn-47", "cn-gmp-2025", "cn-udi", "eu-mdr"],
      tags: ["变更监测", "订阅制", "影响分析"], rating: 4.5, reviews: 32, deals: 78,
      badges: ["订阅服务"],
      summary: "按企业产品线与目标市场订阅法规变更，输出影响条款清单与差异对照，而非泛泛的法规速递。",
      detail: "价值在于「这条变更跟我有没有关系」。订阅时先建立企业产品线与适用法规映射，之后的每次变更都做条目级影响判定，避免信息噪声。可导出为内部合规台账。"
    },
    {
      id: "of-zx-02", vendorId: "v-zx", cat: "data-tool",
      title: "企业法规清单与差距分析台账搭建",
      price: { mode: "from", amount: 16800, label: "¥16,800 起" }, days: "15–30 个工作日",
      deliverables: ["企业适用法规清单", "差距分析表", "台账维护规范与模板"],
      covers: ["cn-739", "cn-47", "cn-53", "intl-iso13485", "us-qmsr"],
      tags: ["法规清单", "差距分析", "台账"], rating: 4.6, reviews: 26, deals: 84,
      badges: [],
      summary: "围绕企业实际产品线与目标市场，建立适用法规清单、差距分析表与可持续维护的台账。",
      detail: "交付的不只是清单，还有维护机制：谁负责、多久复核一次、变更如何回填。清单按产品线 × 市场两个维度组织，可直接作为内审与体系核查的证据。"
    },

    /* ---------- 警戒通 ---------- */
    {
      id: "of-jc-01", vendorId: "v-jc", cat: "post-market",
      title: "不良事件监测体系搭建与报告代理",
      price: { mode: "from", amount: 12800, label: "¥12,800 起" }, days: "20–40 个工作日",
      deliverables: ["不良事件监测程序文件", "报告流程与时限对照表", "报告代理与随访记录"],
      covers: ["cn-adr", "cn-prr", "us-mdr", "cn-739"],
      tags: ["不良事件", "报告时限", "警戒体系"], rating: 4.6, reviews: 34, deals: 96,
      badges: [],
      summary: "搭建不良事件监测与再评价程序，明确境内外报告时限口径，并提供报告代理服务。",
      detail: "报告时限是高风险点：国内死亡 7 日、严重伤害 20 日、其他 30 日，境外发生的事件另有口径。程序文件会把触发条件、判定路径与时限逐条写清并配套记录表单。"
    },
    {
      id: "of-jc-02", vendorId: "v-jc", cat: "post-market",
      title: "召回演练与召回报告代理",
      price: { mode: "from", amount: 9800, label: "¥9,800 起" }, days: "10–25 个工作日",
      deliverables: ["召回程序与分级判定表", "召回演练方案与记录", "召回报告与总结评估"],
      covers: ["cn-recall", "us-recall", "cn-prr", "cn-53"],
      tags: ["召回", "分级时限", "演练"], rating: 4.7, reviews: 30, deals: 72,
      badges: [],
      summary: "建立召回程序与分级判定机制，开展召回演练，并提供召回报告撰写与提交代理。",
      detail: "召回分级直接决定时限：一级 1 日、二级 3 日、三级 7 日内作出决定并报告。演练能把「真出事时找不到人、定不了级」的风险提前暴露出来。"
    }
  ],

  /* ------------------------------------------------------------------
   * 榜单口径（前端据此排序与展示）
   * ----------------------------------------------------------------*/
  boards: [
    { id: "hot", name: "热销榜", icon: "🔥", metric: "deals", desc: "累计成交笔数（演示数据）" },
    { id: "good", name: "口碑榜", icon: "⭐", metric: "rating", desc: "综合评分，仅统计评价数 ≥ 20 的服务包" },
    { id: "fast", name: "响应榜", icon: "⚡", metric: "respMins", asc: true, desc: "发布方平均首次响应时长" },
    { id: "new", name: "新晋铺位", icon: "🆕", metric: "since", desc: "近年入驻的发布方" }
  ],

  /* ------------------------------------------------------------------
   * 集市服务流程（明确平台边界：不经手交易）
   * ----------------------------------------------------------------*/
  steps: [
    { no: "01", name: "提出需求 · 加入采购清单", desc: "按法规条目、业务场景或文档审查问题筛选服务包，加入本机采购清单，形成询价单。" },
    { no: "02", name: "比对交付物 · 比价参考", desc: "同一需求下的多个服务包并排比对交付物、周期、价格模式与法规覆盖范围。" },
    { no: "03", name: "线下签约 · 平台不经手交易", desc: "供需双方自行签约与结算。平台不参与资金流转，不承担交易担保责任。" },
    { no: "04", name: "交付 · 成果件回传归档", desc: "服务成果（报告、资料、卡片）可回传至本平台的文档审查工作台复检，形成闭环。" },
    { no: "05", name: "评价 · 沉淀口碑", desc: "评价与履约记录沉淀为可复用的服务口碑，供后续需求方参考。" }
  ],

  /* 询价单导出时的字段说明 */
  cartFields: [
    { key: "offer", name: "服务包", note: "含发布方与类目" },
    { key: "covers", name: "法规覆盖", note: "该服务包对应的法规条目" },
    { key: "deliverables", name: "交付物", note: "签约前应逐项确认" },
    { key: "price", name: "价格口径", note: "免费 / 起价 / 按项目报价 / 套餐价" },
    { key: "days", name: "周期", note: "承诺周期" },
    { key: "vendor", name: "发布方", note: "联系方式需线下确认" },
    { key: "remark", name: "备注", note: "留空供填写特殊要求" }
  ]
};
