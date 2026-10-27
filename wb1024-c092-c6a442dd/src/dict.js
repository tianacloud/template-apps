/* ============================================================
 * NameSmith 命名工坊 - 词典与知识库
 * 纯前端本地运行，不上传任何数据
 * ============================================================ */
(function (global) {
  'use strict';

  /* ---------- 1. 动词：动作 ---------- */
  const VERBS = [
    { k: ['获取', '取得', '拉取', '取得', '读取'], w: 'get', alt: ['fetch', 'retrieve'], cn: '获取' },
    { k: ['异步获取', '远程拉取'], w: 'fetch', alt: ['get'], cn: '获取' },
    { k: ['列表', '查询列表', '列出'], w: 'list', alt: ['query'], cn: '列出', force: 'v' },
    { k: ['创建', '新增', '新建', '添加'], w: 'create', alt: ['add', 'insert'], cn: '创建' },
    { k: ['追加', '插入'], w: 'insert', alt: ['append', 'add'], cn: '插入' },
    { k: ['更新', '修改', '编辑'], w: 'update', alt: ['modify', 'patch'], cn: '更新' },
    { k: ['删除', '移除', '删掉'], w: 'delete', alt: ['remove', 'destroy'], cn: '删除' },
    { k: ['清空', '清除'], w: 'clear', alt: ['purge', 'reset'], cn: '清空' },
    { k: ['查询', '搜索', '查找', '检索'], w: 'query', alt: ['search', 'find'], cn: '查询' },
    { k: ['过滤', '筛选', '过滤'], w: 'filter', alt: ['screen'], cn: '筛选' },
    { k: ['保存', '存储', '持久化'], w: 'save', alt: ['store', 'persist'], cn: '保存' },
    { k: ['写入'], w: 'write', alt: ['put'], cn: '写入' },
    { k: ['校验', '验证', '检查', '判断'], w: 'validate', alt: ['verify', 'check'], cn: '校验' },
    { k: ['断言'], w: 'assert', alt: ['ensure'], cn: '断言' },
    { k: ['转换', '转成', '转为'], w: 'convert', alt: ['transform', 'to'], cn: '转换' },
    { k: ['解析'], w: 'parse', alt: ['resolve', 'decode'], cn: '解析' },
    { k: ['格式化', '美化'], w: 'format', alt: ['stringify', 'pretty'], cn: '格式化' },
    { k: ['发送', '推送', '提交'], w: 'send', alt: ['post', 'publish'], cn: '发送' },
    { k: ['订阅', '监听', '接收'], w: 'on', alt: ['listen', 'subscribe'], cn: '订阅' },
    { k: ['计算', '算'], w: 'calculate', alt: ['compute', 'calc'], cn: '计算' },
    { k: ['统计', '计数'], w: 'count', alt: ['tally'], cn: '统计' },
    { k: ['求和', '汇总'], w: 'sum', alt: ['aggregate'], cn: '汇总' },
    { k: ['渲染', '绘制', '展示'], w: 'render', alt: ['draw', 'paint'], cn: '渲染' },
    { k: ['比较', '对比', 'diff'], w: 'compare', alt: ['diff'], cn: '比较' },
    { k: ['初始化', '初始化'], w: 'init', alt: ['initialize', 'setup'], cn: '初始化' },
    { k: ['重置', '还原'], w: 'reset', alt: ['restore'], cn: '重置' },
    { k: ['构建', '生成', '构造'], w: 'build', alt: ['generate', 'compose'], cn: '构建' },
    { k: ['编译'], w: 'compile', alt: ['build'], cn: '编译' },
    { k: ['上传'], w: 'upload', alt: ['import'], cn: '上传' },
    { k: ['下载', '导出'], w: 'download', alt: ['export', 'dump'], cn: '下载' },
    { k: ['导入'], w: 'import', alt: ['ingest'], cn: '导入' },
    { k: ['合并', 'merge'], w: 'merge', alt: ['join', 'combine'], cn: '合并' },
    { k: ['拆分', 'split'], w: 'split', alt: ['divide'], cn: '拆分' },
    { k: ['复制', '克隆'], w: 'copy', alt: ['clone', 'duplicate'], cn: '复制' },
    { k: ['启动', '开启', '开始'], w: 'start', alt: ['launch', 'begin'], cn: '启动' },
    { k: ['停止', '暂停', '终止'], w: 'stop', alt: ['pause', 'cancel'], cn: '停止' },
    { k: ['显示', '打开', '展开'], w: 'show', alt: ['open', 'expand'], cn: '显示' },
    { k: ['隐藏', '关闭', '收起'], w: 'hide', alt: ['close', 'collapse'], cn: '隐藏' },
    { k: ['同步', 'sync'], w: 'sync', alt: ['synchronize'], cn: '同步' },
    { k: ['刷新'], w: 'refresh', alt: ['reload'], cn: '刷新' },
    { k: ['登录', '登陆'], w: 'login', alt: ['signIn', 'authenticate'], cn: '登录' },
    { k: ['登出', '退出登录'], w: 'logout', alt: ['signOut'], cn: '登出' },
    { k: ['注册'], w: 'register', alt: ['signUp'], cn: '注册' },
    { k: ['授权', '鉴权'], w: 'authorize', alt: ['grant'], cn: '授权' },
    { k: ['支付', '付款'], w: 'pay', alt: ['charge'], cn: '支付' },
    { k: ['退款'], w: 'refund', alt: ['revert'], cn: '退款' },
    { k: ['结算'], w: 'settle', alt: ['checkout'], cn: '结算' },
    { k: ['通知', '提醒'], w: 'notify', alt: ['remind', 'alert'], cn: '通知' },
    { k: ['重试', 'retry'], w: 'retry', alt: ['reattempt'], cn: '重试' },
    { k: ['排序', 'sort'], w: 'sort', alt: ['order'], cn: '排序' },
    { k: ['加载'], w: 'load', alt: ['fetch'], cn: '加载' },
    { k: ['预览'], w: 'preview', alt: ['peek'], cn: '预览' },
    { k: ['提交'], w: 'submit', alt: ['post'], cn: '提交' },
    { k: ['撤销', '回滚'], w: 'revert', alt: ['undo', 'rollback'], cn: '撤销' },
    { k: ['审批', '审核'], w: 'review', alt: ['approve', 'audit'], cn: '审批' },
    { k: ['处理'], w: 'resolve', alt: ['execute', 'run'], cn: '处理' },
    { k: ['忽略', '跳过'], w: 'ignore', alt: ['skip'], cn: '忽略' },
    { k: ['禁用'], w: 'disable', alt: ['deactivate'], cn: '禁用' },
    { k: ['启用'], w: 'enable', alt: ['activate'], cn: '启用' },
    { k: ['压缩', '打包'], w: 'compress', alt: ['zip', 'pack'], cn: '压缩' },
    { k: ['加密'], w: 'encrypt', alt: ['encode'], cn: '加密' },
    { k: ['解密'], w: 'decrypt', alt: ['decode'], cn: '解密' }
  ];

  /* ---------- 2. 名词：业务实体 ---------- */
  const NOUNS = [
    { k: ['用户', '会员', '账号'], w: 'user', p: 'users', alt: ['member', 'account'] },
    { k: ['客户', '顾客'], w: 'customer', p: 'customers', alt: ['client'] },
    { k: ['权限', '角色'], w: 'permission', p: 'permissions', alt: ['role', 'grant'] },
    { k: ['数据', '记录'], w: 'record', p: 'records', alt: ['entry', 'datum'] },
    { k: ['列表', '集合'], w: 'list', p: 'lists', alt: ['items', 'collection'] },
    { k: ['配置', '设置', '参数'], w: 'config', p: 'configs', alt: ['settings', 'options'] },
    { k: ['状态'], w: 'status', p: 'statuses', alt: ['state'] },
    { k: ['结果', '返回值'], w: 'result', p: 'results', alt: ['outcome'] },
    { k: ['消息', '通知内容'], w: 'message', p: 'messages', alt: ['notice'] },
    { k: ['订单'], w: 'order', p: 'orders', alt: ['trade'] },
    { k: ['商品', '产品'], w: 'product', p: 'products', alt: ['goods', 'item'] },
    { k: ['库存'], w: 'stock', p: 'stocks', alt: ['inventory'] },
    { k: ['购物车'], w: 'cart', p: 'carts', alt: ['basket'] },
    { k: ['文章', '帖子'], w: 'post', p: 'posts', alt: ['article'] },
    { k: ['评论', '回复'], w: 'comment', p: 'comments', alt: ['reply'] },
    { k: ['文件', '附件'], w: 'file', p: 'files', alt: ['attachment'] },
    { k: ['图片', '头像'], w: 'image', p: 'images', alt: ['photo', 'picture'] },
    { k: ['视频'], w: 'video', p: 'videos', alt: ['clip'] },
    { k: ['缓存'], w: 'cache', p: 'caches', alt: ['memo'] },
    { k: ['日志'], w: 'log', p: 'logs', alt: ['journal'] },
    { k: ['错误', '异常', '报错'], w: 'error', p: 'errors', alt: ['exception', 'fault'] },
    { k: ['任务', '作业'], w: 'task', p: 'tasks', alt: ['job'] },
    { k: ['待办'], w: 'todo', p: 'todos', alt: ['task'] },
    { k: ['标签'], w: 'tag', p: 'tags', alt: ['label'] },
    { k: ['分类', '类目'], w: 'category', p: 'categories', alt: ['class'] },
    { k: ['统计', '指标', '埋点'], w: 'metric', p: 'metrics', alt: ['stat'] },
    { k: ['报表', '报告'], w: 'report', p: 'reports', alt: ['summary'] },
    { k: ['模板'], w: 'template', p: 'templates', alt: ['preset'] },
    { k: ['部门', '团队', '组织'], w: 'team', p: 'teams', alt: ['department', 'org'] },
    { k: ['地址', '位置', '坐标'], w: 'address', p: 'addresses', alt: ['location'] },
    { k: ['金额', '余额', '价格'], w: 'amount', p: 'amounts', alt: ['price', 'balance'] },
    { k: ['钱包', '账户资金'], w: 'wallet', p: 'wallets', alt: ['account'] },
    { k: ['表单'], w: 'form', p: 'forms', alt: ['survey'] },
    { k: ['按钮'], w: 'button', p: 'buttons', alt: ['action'] },
    { k: ['弹窗', '对话框'], w: 'dialog', p: 'dialogs', alt: ['modal'] },
    { k: ['面板', '卡片'], w: 'panel', p: 'panels', alt: ['card'] },
    { k: ['菜单'], w: 'menu', p: 'menus', alt: ['nav'] },
    { k: ['图表'], w: 'chart', p: 'charts', alt: ['graph'] },
    { k: ['画布'], w: 'canvas', p: 'canvases', alt: ['stage'] },
    { k: ['组件'], w: 'component', p: 'components', alt: ['widget'] },
    { k: ['页面', '界面'], w: 'page', p: 'pages', alt: ['view'] },
    { k: ['路由', '网址', '链接'], w: 'route', p: 'routes', alt: ['link', 'url'] },
    { k: ['接口', 'api'], w: 'api', p: 'apis', alt: ['endpoint'] },
    { k: ['数据库表', 'table'], w: 'table', p: 'tables', alt: ['entity'] },
    { k: ['字段'], w: 'field', p: 'fields', alt: ['column'] },
    { k: ['请求'], w: 'request', p: 'requests', alt: ['req'] },
    { k: ['响应'], w: 'response', p: 'responses', alt: ['res'] },
    { k: ['令牌', '凭证', 'token'], w: 'token', p: 'tokens', alt: ['credential'] },
    { k: ['会话', 'session'], w: 'session', p: 'sessions', alt: ['conversation'] },
    { k: ['事件'], w: 'event', p: 'events', alt: ['occurrence'] },
    { k: ['回调', '钩子触发'], w: 'callback', p: 'callbacks', alt: ['handler'] },
    { k: ['工作流', '流程'], w: 'workflow', p: 'workflows', alt: ['flow', 'process'] },
    { k: ['素材', '资源'], w: 'asset', p: 'assets', alt: ['resource'] },
    { k: ['项目', '工程'], w: 'project', p: 'projects', alt: ['repo'] },
    { k: ['版本', '版本号'], w: 'version', p: 'versions', alt: ['revision'] },
    { k: ['进度'], w: 'progress', p: 'progresses', alt: ['percent'] },
    { k: ['明细', '详情'], w: 'detail', p: 'details', alt: ['item'] },
    { k: ['内容'], w: 'content', p: 'contents', alt: ['body'] },
    { k: ['标题'], w: 'title', p: 'titles', alt: ['heading'] },
    { k: ['描述', '详情说明'], w: 'description', p: 'descriptions', alt: ['desc'] },
    { k: ['头像图片'], w: 'avatar', p: 'avatars', alt: ['profileImage'] },
    { k: ['昵称'], w: 'nickname', p: 'nicknames', alt: ['displayName'] },
    { k: ['手机号'], w: 'phone', p: 'phones', alt: ['mobile'] },
    { k: ['邮箱', '邮件'], w: 'email', p: 'emails', alt: ['mail'] },
    { k: ['密码'], w: 'password', p: 'passwords', alt: ['pwd'] },
    { k: ['验证码'], w: 'code', p: 'codes', alt: ['captcha'] },
    { k: ['时间表', '日程'], w: 'schedule', p: 'schedules', alt: ['calendar'] },
    { k: ['通知'], w: 'notification', p: 'notifications', alt: ['notice'] },
    { k: ['积分'], w: 'point', p: 'points', alt: ['credit'] },
    { k: ['优惠券'], w: 'coupon', p: 'coupons', alt: ['voucher'] },
    { k: ['记录日志'], w: 'logEntry', p: 'logEntries', alt: ['log'] },
    { k: ['数量', '个数', '多少'], w: 'count', p: 'counts', alt: ['total', 'quantity'] },
    { k: ['折扣', '优惠券金额'], w: 'discount', p: 'discounts', alt: ['promotion'] },
    { k: ['评价', '评分', '星级'], w: 'rating', p: 'ratings', alt: ['score'] },
    { k: ['限制', '上限', '阈值'], w: 'limit', p: 'limits', alt: ['threshold'] },
    { k: ['日期'], w: 'date', p: 'dates', alt: ['day'] },
    { k: ['时间', '时间戳'], w: 'time', p: 'times', alt: ['timestamp', 'datetime'] },
    { k: ['字符串', '文本'], w: 'text', p: 'texts', alt: ['string'] },
    { k: ['时长', '耗时'], w: 'duration', p: 'durations', alt: ['elapsed'] },
    { k: ['原因', '理由'], w: 'reason', p: 'reasons', alt: ['cause'] },
    { k: ['渠道', '来源'], w: 'channel', p: 'channels', alt: ['source'] },
    { k: ['设备'], w: 'device', p: 'devices', alt: ['terminal'] },
    { k: ['主题', '皮肤'], w: 'theme', p: 'themes', alt: ['skin'] },
    { k: ['规则'], w: 'rule', p: 'rules', alt: ['policy'] },
    { k: ['快照'], w: 'snapshot', p: 'snapshots', alt: ['marker'] },
    /* ---- 开放词表补充：业务 / 医疗 / 供应链 / 运营 / 运维 ---- */
    { k: ['工单'], w: 'workOrder', p: 'workOrders', alt: ['ticket'] },
    { k: ['报销'], w: 'reimbursement', p: 'reimbursements', alt: ['expense'] },
    { k: ['发票'], w: 'invoice', p: 'invoices', alt: ['bill'] },
    { k: ['合同'], w: 'contract', p: 'contracts', alt: ['agreement'] },
    { k: ['物料'], w: 'material', p: 'materials', alt: ['supply'] },
    { k: ['运单'], w: 'waybill', p: 'waybills', alt: ['shipment'] },
    { k: ['仓库'], w: 'warehouse', p: 'warehouses', alt: ['depot'] },
    { k: ['门店'], w: 'store', p: 'stores', alt: ['shop', 'outlet'] },
    { k: ['课程'], w: 'course', p: 'courses', alt: ['lesson'] },
    { k: ['题库'], w: 'questionBank', p: 'questionBanks', alt: ['quizBank'] },
    { k: ['试卷', '考卷'], w: 'examPaper', p: 'examPapers', alt: ['paper'] },
    { k: ['排班', '值班'], w: 'roster', p: 'rosters', alt: ['shift'] },
    { k: ['考勤'], w: 'attendance', p: 'attendances', alt: ['checkin'] },
    { k: ['薪资', '工资'], w: 'salary', p: 'salaries', alt: ['payroll'] },
    { k: ['社保'], w: 'insurance', p: 'insurances', alt: ['socialSecurity'] },
    { k: ['公积金'], w: 'providentFund', p: 'providentFunds', alt: ['housingFund'] },
    { k: ['体检'], w: 'checkup', p: 'checkups', alt: ['physicalExam'] },
    { k: ['挂号'], w: 'registration', p: 'registrations', alt: ['appointment'] },
    { k: ['病历'], w: 'medicalRecord', p: 'medicalRecords', alt: ['chart'] },
    { k: ['处方'], w: 'prescription', p: 'prescriptions', alt: ['rx'] },
    { k: ['病房'], w: 'ward', p: 'wards', alt: ['room'] },
    { k: ['床位'], w: 'bed', p: 'beds', alt: ['slot'] },
    { k: ['患者', '病人'], w: 'patient', p: 'patients', alt: ['client'] },
    { k: ['医生', '医师'], w: 'doctor', p: 'doctors', alt: ['physician'] },
    { k: ['护士'], w: 'nurse', p: 'nurses', alt: [] },
    { k: ['药品'], w: 'medicine', p: 'medicines', alt: ['drug'] },
    { k: ['供应商'], w: 'supplier', p: 'suppliers', alt: ['vendor'] },
    { k: ['采购'], w: 'purchase', p: 'purchases', alt: ['procurement'] },
    { k: ['盘点'], w: 'stocktaking', p: 'stocktakings', alt: ['inventoryCheck'] },
    { k: ['调拨'], w: 'transfer', p: 'transfers', alt: ['allocation'] },
    { k: ['货架'], w: 'shelf', p: 'shelves', alt: ['rack'] },
    { k: ['物流'], w: 'logistics', p: 'logistics', alt: ['shipping'] },
    { k: ['快递'], w: 'express', p: 'expresses', alt: ['courier'] },
    { k: ['配送'], w: 'delivery', p: 'deliveries', alt: ['dispatch'] },
    { k: ['秒杀'], w: 'flashSale', p: 'flashSales', alt: ['seckill'] },
    { k: ['拼团'], w: 'groupBuy', p: 'groupBuys', alt: ['groupon'] },
    { k: ['直播'], w: 'liveStream', p: 'liveStreams', alt: ['live'] },
    { k: ['弹幕'], w: 'danmaku', p: 'danmakus', alt: ['barrage'] },
    { k: ['粉丝'], w: 'follower', p: 'followers', alt: ['fan'] },
    { k: ['收藏夹', '收藏'], w: 'favorite', p: 'favorites', alt: ['bookmark'] },
    { k: ['举报', '投诉'], w: 'complaint', p: 'complaints', alt: ['report'] },
    { k: ['字典'], w: 'dictionary', p: 'dictionaries', alt: ['dict'] },
    { k: ['网关'], w: 'gateway', p: 'gateways', alt: ['proxy'] },
    { k: ['限流'], w: 'rateLimit', p: 'rateLimits', alt: ['throttle'] },
    { k: ['熔断'], w: 'circuitBreaker', p: 'circuitBreakers', alt: ['breaker'] },
    { k: ['灰度'], w: 'grayRelease', p: 'grayReleases', alt: ['canary'] },
    { k: ['开关', '特性开关'], w: 'featureFlag', p: 'featureFlags', alt: ['toggle'] },
    { k: ['埋点'], w: 'trackPoint', p: 'trackPoints', alt: ['analytics'] },
    { k: ['漏斗'], w: 'funnel', p: 'funnels', alt: ['funnelChart'] },
    { k: ['留存'], w: 'retention', p: 'retentions', alt: ['retain'] },
    { k: ['看板', '仪表盘'], w: 'dashboard', p: 'dashboards', alt: ['board'] },
    { k: ['大屏'], w: 'screen', p: 'screens', alt: ['display'] },
    { k: ['告警', '报警'], w: 'alarm', p: 'alarms', alt: ['alert'] },
    { k: ['监控'], w: 'monitor', p: 'monitors', alt: ['watch'] },
    { k: ['调用链'], w: 'trace', p: 'traces', alt: ['tracing'] },
    { k: ['拓扑'], w: 'topology', p: 'topologies', alt: ['graph'] },
    { k: ['对账'], w: 'reconciliation', p: 'reconciliations', alt: ['settleCheck'] },
    { k: ['提现'], w: 'withdraw', p: 'withdrawals', alt: ['cashout'] },
    { k: ['充值'], w: 'recharge', p: 'recharges', alt: ['topup'] },
    { k: ['余额'], w: 'balance', p: 'balances', alt: ['remain'] },
    { k: ['流水', '账单'], w: 'transactionFlow', p: 'transactionFlows', alt: ['statement'] },
    { k: ['运费'], w: 'shippingFee', p: 'shippingFees', alt: ['freight'] },
    { k: ['税费'], w: 'tax', p: 'taxes', alt: ['duty'] },
    { k: ['会员卡'], w: 'memberCard', p: 'memberCards', alt: ['loyaltyCard'] },
    { k: ['兑换'], w: 'exchange', p: 'exchanges', alt: ['redeem'] },
    { k: ['预约'], w: 'appointment', p: 'appointments', alt: ['booking'] },
    { k: ['签到'], w: 'checkIn', p: 'checkIns', alt: ['signIn'] },
    { k: ['打卡'], w: 'clockIn', p: 'clockIns', alt: ['punch'] },
    { k: ['请假'], w: 'leaveRequest', p: 'leaveRequests', alt: ['leave'] },
    { k: ['加班'], w: 'overtime', p: 'overtimes', alt: ['extraShift'] },
    { k: ['培训'], w: 'training', p: 'trainings', alt: ['course'] },
    { k: ['考试'], w: 'exam', p: 'exams', alt: ['test'] },
    { k: ['成绩', '分数'], w: 'grade', p: 'grades', alt: ['score'] },
    { k: ['证书'], w: 'certificate', p: 'certificates', alt: ['cert'] },
    { k: ['认证'], w: 'certification', p: 'certifications', alt: ['verifyRecord'] },
    /* ---- 技术名词补充 ---- */
    { k: ['调度器'], w: 'scheduler', p: 'schedulers', alt: ['dispatcher'] },
    { k: ['队列'], w: 'queue', p: 'queues', alt: ['mq'] },
    { k: ['引擎'], w: 'engine', p: 'engines', alt: ['runtime'] },
    { k: ['中间件'], w: 'middleware', p: 'middlewares', alt: ['plugin'] },
    { k: ['容器'], w: 'container', p: 'containers', alt: ['holder'] },
    { k: ['集群'], w: 'cluster', p: 'clusters', alt: ['group'] },
    { k: ['节点'], w: 'node', p: 'nodes', alt: ['peer'] },
    { k: ['副本'], w: 'replica', p: 'replicas', alt: ['copy'] },
    { k: ['分片'], w: 'shard', p: 'shards', alt: ['partition'] },
    { k: ['事务'], w: 'transaction', p: 'transactions', alt: ['tx'] },
    { k: ['心跳'], w: 'heartbeat', p: 'heartbeats', alt: ['ping'] },
    { k: ['阈值'], w: 'threshold', p: 'thresholds', alt: ['bound'] },
    { k: ['配额'], w: 'quota', p: 'quotas', alt: ['allowance'] },
    { k: ['策略'], w: 'policy', p: 'policies', alt: ['strategy'] },
    { k: ['白名单'], w: 'whitelist', p: 'whitelists', alt: ['allowList'] },
    { k: ['黑名单'], w: 'blacklist', p: 'blacklists', alt: ['denyList'] },
    { k: ['解析器'], w: 'parser', p: 'parsers', alt: ['reader'] },
    { k: ['适配器'], w: 'adapter', p: 'adapters', alt: ['bridge'] },
    { k: ['拦截器'], w: 'interceptor', p: 'interceptors', alt: ['hook'] },
    { k: ['转换器'], w: 'converter', p: 'converters', alt: ['transformer'] },
    { k: ['生成器'], w: 'generator', p: 'generators', alt: ['builder'] }
  ];

  /* ---------- 3. 修饰词 ---------- */
  const MODS = [
    { k: ['最大', '最大值'], w: 'max', alt: ['maximum'] },
    { k: ['最小', '最小值'], w: 'min', alt: ['minimum'] },
    { k: ['平均'], w: 'avg', alt: ['average'] },
    { k: ['总', '合计', '总计'], w: 'total', alt: ['sum'] },
    { k: ['当前', '现在'], w: 'current', alt: ['now'] },
    { k: ['上一个', '前一个', '上一'], w: 'previous', alt: ['prev', 'last'] },
    { k: ['下一个', '下一'], w: 'next', alt: ['upcoming'] },
    { k: ['唯一', 'main'], w: 'primary', alt: ['unique'] },
    { k: ['默认'], w: 'default', alt: ['fallback'] },
    { k: ['最新'], w: 'latest', alt: ['recent'] },
    { k: ['历史'], w: 'history', alt: ['past', 'archive'] },
    { k: ['本地'], w: 'local', alt: ['offline'] },
    { k: ['远程', '远端'], w: 'remote', alt: ['server'] },
    { k: ['临时'], w: 'temporary', alt: ['transient'] },
    { k: ['全局'], w: 'global', alt: ['app'] },
    { k: ['私有'], w: 'private', alt: ['internal'] },
    { k: ['公共', '公开'], w: 'public', alt: ['shared'] },
    { k: ['已选中', '选中', '已选'], w: 'selected', alt: ['active'] },
    { k: ['推荐'], w: 'recommended', alt: ['suggested'] },
    { k: ['热门'], w: 'popular', alt: ['trending'] },
    { k: ['有效'], w: 'valid', alt: ['active'] },
    { k: ['过期', '失效'], w: 'expired', alt: ['stale'] }
  ];

  /* ---------- 4. 状态/形容词 ---------- */
  const STATES = [
    { k: ['成功', '成功'], w: 'success', adj: 'successful', truthy: true },
    { k: ['失败', '错误', '报错'], w: 'failed', adj: 'failed', truthy: false },
    { k: ['完成', '已完成'], w: 'completed', adj: 'done', truthy: true },
    { k: ['登录', '已登录'], w: 'loggedIn', adj: 'authenticated', truthy: true },
    { k: ['过期', '失效'], w: 'expired', adj: 'stale', truthy: false },
    { k: ['可用', '有效'], w: 'available', adj: 'valid', truthy: true },
    { k: ['禁用', '关闭'], w: 'disabled', adj: 'inactive', truthy: false },
    { k: ['可见', '显示'], w: 'visible', adj: 'shown', truthy: true },
    { k: ['空', '为空'], w: 'empty', adj: 'blank', truthy: true },
    { k: ['加载中', '请求中'], w: 'loading', adj: 'pending', truthy: true },
    { k: ['就绪', '准备好'], w: 'ready', adj: 'prepared', truthy: true },
    { k: ['支付'], w: 'paid', adj: 'settled', truthy: true },
    { k: ['删除'], w: 'deleted', adj: 'removed', truthy: true },
    { k: ['修改', '变更'], w: 'dirty', adj: 'modified', truthy: true },
    { k: ['只读'], w: 'readOnly', adj: 'readonly', truthy: true },
    { k: ['首屏', '首次'], w: 'first', adj: 'initial', truthy: true },
    { k: ['末次', '最后'], w: 'last', adj: 'final', truthy: true },
    { k: ['今日', '当天'], w: 'today', adj: 'daily', truthy: true },
    { k: ['星期'], w: 'weekly', adj: 'weekly', truthy: true },
    { k: ['月度', '每月'], w: 'monthly', adj: 'monthly', truthy: true }
  ];

  /* ---------- 5. 疑问/布尔信号 ---------- */
  const BOOL_HINTS = ['是否', '有没有', '能否', '能不能', '可否', '判断', '是否要', '需不需要', '要不要', '会不会', '是不是'];

  /* ---------- 6. 垃圾词黑名单（命名界的地沟油） ---------- */
  const SMELL = [
    { w: 'data', why: '「data」跟「东西」一样，等于没说', tip: '说明它是什么数据，例如 userList / orderSummary' },
    { w: 'info', why: '「info」是「我懒得想」的拉丁语写法', tip: '具体化：userProfile / shipmentDetail' },
    { w: 'item', why: '「item」万能又无用', tip: '换成业务实体：cartItem / menuEntry' },
    { w: 'list2', why: '数字后缀=命名已放弃治疗', tip: '第二个列表请说出它的不同之处：activeList / archivedList' },
    { w: 'temp', why: '「temp」往往活到项目下线', tip: '说明用途：pendingBuffer / previousSnapshot' },
    { w: 'tmp', why: '同上，只是更短更理直气壮', tip: '同上' },
    { w: 'obj', why: 'JavaScript 里万物皆 obj，谢谢', tip: '直接写它的语义：orderFilter' },
    { w: 'flag', why: '「flag」不如布尔语义前缀', tip: '用 is / has / should 开头' },
    { w: 'manager', why: '「Manager」是面向对象世界的垃圾桶', tip: '具体职责：OrderScheduler / PriceCalculator' },
    { w: 'helper', why: '「Helper」= 什么都往里塞', tip: '按职责命名：DateFormatter / UrlBuilder' },
    { w: 'util', why: '「utils.js」是项目的杂物抽屉', tip: '拆到具体模块：stringCase / dateMath' },
    { w: 'utils', why: '同上', tip: '同上' },
    { w: 'handle', why: 'handleData 什么都没说', tip: '动词要具体：submitOrder / validateCoupon' },
    { w: 'process', why: 'processData 是无效动词', tip: '改成 transformUserInput 之类的真动作' },
    { w: 'do', why: 'doSomething 是命名界的」呃那个啥」', tip: '写出具体动作' },
    { w: 'thing', why: 'thing', tip: '别写了，删掉重写' },
    { w: 'old', why: '版本管理靠 Git，不靠变量后缀', tip: '删除旧变量，让 Git 记住它' },
    { w: 'new', why: '同上', tip: '同上' },
    { w: 'xxx', why: '占位符忘了改？', tip: '换成实际语义' },
    { w: 'aaa', why: '我猜这是为了排序靠前', tip: '删掉' },
    { w: 'test', why: 'test1/test2 会在半年后复活成线上逻辑', tip: '如果是原型请明确：prototypeParser' },
    { w: 'final', why: 'final2 / finalFinal 的经典开头', tip: '版本号交给 Git' },
    { w: 'value', why: '「value」需要上下文才成立', tip: '写明值的含义：discountRate' },
    { w: 'result', why: '到处都是 result', tip: '写明是什么的结果：validationResult' },
    { w: 'content', why: '太空泛', tip: '写明内容类型：articleBody / modalContent' },
    { w: 'array', why: '类型不该出现在名字里，除非你在写 C', tip: '用复数：users' },
    { w: 'string', why: '同上', tip: '用语义：nickname' }
  ];

  /* ---------- 7. 常见缩写（体检时提示展开） ---------- */
  const ABBR = {
    pwd: 'password', cfg: 'config', tmp: 'temporary', msg: 'message', btn: 'button',
    img: 'image', doc: 'document', qty: 'quantity', amt: 'amount', desc: 'description',
    val: 'value', calc: 'calculate', db: 'database', env: 'environment', pkg: 'package',
    btn: 'button', txt: 'text', num: 'number', idx: 'index', cb: 'callback',
    usr: 'user', addr: 'address', param: 'parameter', prop: 'property', pos: 'position'
  };

  /* ---------- 8. 类后缀建议 ---------- */
  const CLASS_SUFFIX = [
    { s: 'Service', hint: '对外提供业务能力' },
    { s: 'Repository', hint: '数据访问封装' },
    { s: 'Store', hint: '状态容器' },
    { s: 'Controller', hint: '请求编排' },
    { s: 'Provider', hint: '资源/依赖提供' },
    { s: 'Parser', hint: '解析转换' },
    { s: 'Builder', hint: '构造复杂对象' },
    { s: 'Validator', hint: '校验规则' },
    { s: 'Resolver', hint: 'GraphQL / 依赖解析' },
    { s: 'Handler', hint: '事件处理' }
  ];

  /* ---------- 9. 彩蛋：抽象命名词库 ---------- */
  const FUN_ADJ = [
    'quantum', 'ephemeral', 'luminous', 'recursive', 'sentient', 'velvet', 'chaotic',
    'serendipitous', 'oblique', 'crystalline', 'wandering', 'invisible', 'phantom',
    'harmonious', 'stochastic', 'ethereal', 'graceful', 'voracious', 'melancholy',
    'hyperbolic', 'nomadic', 'incandescent', 'turbulent', 'sacred'
  ];
  const FUN_NOUN = [
    'pancake', 'widget', 'llama', 'beacon', 'origami', 'kettle', 'nebula', 'cactus',
    'monolith', 'susurrus', 'playground', 'chandelier', 'anomaly', 'platypus',
    'labyrinth', 'espresso', 'avalanche', 'hamster', 'tapestry', 'sandwich',
    'meridian', 'origami', 'carburetor', 'ukulele'
  ];
  const FUN_SUFFIX = ['Engine', 'Optimizer', 'Adapter', 'Pipeline', 'Oracle', 'Fabric', 'Kernel', 'Glyph', 'Matrix'];

  /* ---------- 10. Commit 词典 ---------- */
  const COMMIT_TYPES = [
    { t: 'feat', cn: '新功能', desc: '新增能力' },
    { t: 'fix', cn: '修 Bug', desc: '修复缺陷' },
    { t: 'refactor', cn: '重构', desc: '不动行为的内部结构优化' },
    { t: 'perf', cn: '性能', desc: '性能提升' },
    { t: 'style', cn: '样式', desc: '格式、样式调整' },
    { t: 'docs', cn: '文档', desc: '文档变更' },
    { t: 'test', cn: '测试', desc: '测试相关' },
    { t: 'chore', cn: '杂项', desc: '构建/依赖/工具' },
    { t: 'revert', cn: '回滚', desc: '撤销提交' }
  ];

  const COMMIT_JOKES = [
    '修复了一个在我机器上不存在的 bug',
    '把三年前的 TODO 注释原样保留并加了两个',
    '改动很小，但危险程度很高',
    '为了这一个空格我重启了十七次服务',
    '重构了昨天的重构',
    '删了一行代码，测试覆盖率下降了 2%',
    '这次真的最后一次改这里了',
    '把魔法数字换成了另一个魔法数字',
    '如果一个 bug 消失了但没人知道为什么，它就真的消失了吗',
    '注释写得很清楚，代码我不保证',
    '让它可以跑起来，原因待查',
    '把昨天那坨我自己都没看懂的东西换了一坨新的'
  ];

  /* ---------- 11. 一键示例 ---------- */
  const EXAMPLES = [
    '获取用户列表',
    '判断用户是否已登录',
    '根据订单号查询支付状态',
    '上传头像图片',
    '订单支付成功后的回调',
    '商品库存数量',
    '格式化日期时间',
    '当前选中的标签id',
    '批量删除过期日志',
    '是否允许修改个人信息'
  ];

  /* ---------- 12. 命名规范速查 ---------- */
  const GUIDE = [
    { scope: '普通变量 / 函数', style: 'camelCase', bad: 'User_List / userlist', good: 'userList' },
    { scope: '类 / 组件 / 类型', style: 'PascalCase', bad: 'userCard', good: 'UserCard' },
    { scope: '常量', style: 'SCREAMING_SNAKE_CASE', bad: 'maxRetry', good: 'MAX_RETRY_COUNT' },
    { scope: '文件名（资产 / 组件）', style: 'kebab-case', bad: 'UserProfile.vue', good: 'user-profile.vue' },
    { scope: '数据库表 / 字段', style: 'snake_case（表名复数）', bad: 'userOrderItems', good: 'order_items' },
    { scope: 'CSS class', style: 'kebab-case 或 BEM', bad: 'cardTitle', good: 'card__title' },
    { scope: '布尔值', style: 'is / has / can / should 前缀', bad: 'loginFlag', good: 'isLoggedIn' },
    { scope: '事件处理', style: 'handle + 名词 + 动作', bad: 'onclick', good: 'handleSubmitClick' },
    { scope: '布尔 prop 传递', style: 'on + 动作 / 回调', bad: 'clickCb', good: 'onClick' },
    { scope: 'React Hook', style: 'use + 名词', bad: 'getUsers', good: 'useUserList' },
    { scope: 'Git 分支', style: 'type/scope-描述', bad: 'dev2', good: 'feat/order-refund' },
    { scope: 'REST 路径', style: '全小写复数 + 中划线', bad: '/getUserInfo', good: '/users/{id}' }
  ];

  /* ---------- 13. 语言命名规范矩阵 ---------- */
  const LANG_MATRIX = [
    {
      id: 'ts', name: 'TypeScript / JavaScript', short: 'TS / JS',
      rows: [
        { el: '变量 / 属性', rule: 'camelCase', good: 'userProfile', bad: 'user_profile', note: '名词性；布尔值统一 is / has / can / should 前缀' },
        { el: '常量', rule: 'SCREAMING_SNAKE_CASE', good: 'MAX_RETRY_COUNT', bad: 'maxRetryCount', note: '模块级导出常量；函数内不可变值可用 camelCase' },
        { el: '函数 / 方法', rule: 'camelCase，动词开头', good: 'fetchUserList', bad: 'getUserListData', note: '不要用 get 假装万能，取数用 fetch / query / find' },
        { el: '类 / 组件', rule: 'PascalCase', good: 'UserCard', bad: 'userCard', note: '组件文件名常见 kebab-case 或与组件同名' },
        { el: '接口 / 类型', rule: 'PascalCase，不加 I 前缀', good: 'OrderPayload', bad: 'IOrder', note: '现代 TS 风格不再用 I 前缀；用 Props / Params / Result 后缀区分用途' },
        { el: '枚举 / 成员', rule: '枚举 PascalCase，成员 SCREAMING_SNAKE 或 PascalCase', good: 'OrderStatus.PAID', bad: 'order_status.paid', note: '成员用「值语义」而不是数字' },
        { el: '事件处理', rule: 'handle + 名词 + 动作；props 回调用 on + 动作', good: 'handleSubmitClick / onSubmit', bad: 'onClick2 / clickHandler', note: 'handle 是自己处理，on 是别人传进来的回调' },
        { el: '文件名', rule: 'kebab-case 或与默认导出同名', good: 'user-profile.tsx', bad: 'User_Profile.tsx', note: '同一仓库内只选一种，别中途换风格' },
        { el: '测试', rule: 'describe 名词 + it should 行为', good: 'should return empty when no order', bad: 'test1', note: '测试名是一句可执行的规格说明' },
        { el: '布尔变量', rule: 'is / has / can / should 前缀', good: 'isLoading', bad: 'loadingFlag', note: 'flag / status 是布尔命名的两大恶习' },
        { el: '异步函数', rule: '动词 + 名词，团队统一是否加 Async', good: 'fetchUserList', bad: 'getAsyncUser', note: '返回 Promise 不代表要把 Async 写进名字，选一种全组统一' },
        { el: '常量对象 / 配置', rule: 'SCREAMING_SNAKE_CASE', good: 'DEFAULT_PAGE_SIZE', bad: 'defaultPageSize', note: '导出给外部用的配置对象，语义同常量' }
      ]
    },
    {
      id: 'py', name: 'Python', short: 'Python',
      rows: [
        { el: '变量 / 函数', rule: 'snake_case（PEP 8）', good: 'fetch_user_list', bad: 'fetchUserList', note: 'PEP 8 是硬要求，不是建议' },
        { el: '常量', rule: 'SCREAMING_SNAKE_CASE', good: 'MAX_RETRY_COUNT', bad: 'maxRetryCount', note: '模块级常量' },
        { el: '类', rule: 'PascalCase', good: 'OrderRepository', bad: 'order_repository', note: '异常类用 Error 后缀' },
        { el: '私有成员', rule: '单下划线前缀', good: '_cache', bad: '__cache', note: '双下划线会触发 name mangling，慎用' },
        { el: '模块 / 文件', rule: 'snake_case', good: 'user_profile.py', bad: 'UserProfile.py', note: '包名同样全小写' },
        { el: '类型变量', rule: 'PascalCase 或 T / K / V', good: 'ItemType', bad: 'item_type', note: 'TypeVar 用简洁大写' },
        { el: '测试', rule: 'test_ 前缀 + 行为描述', good: 'test_fetch_user_returns_empty', bad: 'test1', note: 'pytest 靠前缀收集用例' },
        { el: '数据类 / TypedDict', rule: 'PascalCase', good: 'UserPayload', bad: 'user_payload', note: '类型层面用类命名法，与变量区分' },
        { el: '类型别名', rule: 'PascalCase', good: 'OrderId', bad: 'order_id_type', note: 'Alias 后缀很少需要，直接用语义名' },
        { el: '字典 key / JSON 字段', rule: 'snake_case（跟 API 保持一致）', good: 'created_at', bad: 'createdAt', note: '外部契约优先，别在入口处做风格转换' }
      ]
    },
    {
      id: 'java', name: 'Java', short: 'Java',
      rows: [
        { el: '变量 / 方法', rule: 'camelCase', good: 'fetchUserList', bad: 'fetch_user_list', note: '方法用动词开头，名词方法只用于获取属性' },
        { el: '常量', rule: 'SCREAMING_SNAKE_CASE', good: 'MAX_RETRY_COUNT', bad: 'maxRetryCount', note: 'static final' },
        { el: '类 / 接口', rule: 'PascalCase', good: 'OrderService', bad: 'orderService', note: '接口不加 I 前缀（与 C# 相反）' },
        { el: '包名', rule: '全小写点分，域名倒序', good: 'com.example.order', bad: 'com.Example.Order', note: '' },
        { el: '泛型参数', rule: '单个大写字母', good: 'T / K / V / E', bad: 'Type', note: '复杂场景可用 ResultT 但很少见' },
        { el: '布尔方法', rule: 'is / has / can 前缀', good: 'isPaid()', bad: 'getPaid()', note: '让调用处读起来像一句话' },
        { el: '测试方法', rule: 'should_ 前缀或 camelCase 行为描述', good: 'shouldThrowWhenEmpty', bad: 'test1', note: 'JUnit 5 支持 @DisplayName 中文描述' },
        { el: '枚举成员', rule: 'SCREAMING_SNAKE_CASE', good: 'OrderStatus.PAID', bad: 'OrderStatus.paid', note: '成员之间保持同一抽象层级' },
        { el: '测试类', rule: '被测类 + Test', good: 'OrderServiceTest', bad: 'TestOrder', note: '' },
        { el: 'DTO / VO', rule: 'PascalCase + 职责后缀', good: 'OrderCreateDTO', bad: 'OrderData', note: '后缀说明这一层要干什么，别只写 Data' },
        { el: '常量池 / 错误码', rule: 'SCREAMING_SNAKE 或 E + 数字', good: 'ERR_ORDER_NOT_FOUND', bad: 'error1', note: '错误码要和文案一一对应，别复用' }
      ]
    },
    {
      id: 'go', name: 'Go', short: 'Go',
      rows: [
        { el: '包名', rule: '全小写、单数、无下划线', good: 'orderrepo', bad: 'order_repo', note: '包名会被调用方当作前缀，别自我重复' },
        { el: '导出标识符', rule: 'PascalCase（首字母大写才能导出）', good: 'FetchUserList', bad: 'fetchUserList', note: 'Go 用首字母大小写表达可见性，这是语言级约定' },
        { el: '未导出标识符', rule: 'camelCase', good: 'fetchUserList', bad: 'FetchUserList', note: '' },
        { el: '接口', rule: '单方法接口用 -er 后缀', good: 'Reader / Stringer', bad: 'IReader', note: '接口越小越好用，一到两个方法最合适' },
        { el: '常量', rule: 'camelCase 或 PascalCase，不用下划线', good: 'maxRetryCount / MaxRetryCount', bad: 'MAX_RETRY_COUNT', note: 'Go 的常量不像 Java 那样大写' },
        { el: '错误变量', rule: 'Err 前缀', good: 'ErrNotFound', bad: 'NotFoundError', note: '' },
        { el: '测试文件', rule: '_test.go 后缀', good: 'user_test.go', bad: 'test_user.go', note: '测试函数 TestXxx' },
        { el: 'struct 字段', rule: 'PascalCase（导出）/ camelCase（私有）', good: 'OrderID', bad: 'order_id', note: '字段可见性同样靠首字母' },
        { el: '缩写统一大写', rule: 'ID / URL / HTTP 保持全大写', good: 'UserID / BaseURL', bad: 'UserId / BaseUrl', note: 'Go 社区共识，混写会被 lint 挑出来' },
        { el: '接收者名', rule: '类型首字母小写，1-2 字符', good: 'func (s *Service)', bad: 'func (this *Service)', note: '别用 this / self，Go 里不流行' }
      ]
    },
    {
      id: 'cs', name: 'C#', short: 'C#',
      rows: [
        { el: '公共成员', rule: 'PascalCase', good: 'FetchUserList', bad: 'fetchUserList', note: 'C# 的公共成员几乎全用 PascalCase' },
        { el: '私有字段', rule: '_camelCase', good: '_cache', bad: 'cache', note: '下划线前缀是 .NET 团队最常见约定' },
        { el: '接口', rule: 'I + PascalCase', good: 'IOrderService', bad: 'OrderServiceInterface', note: '与 Java 相反，C# 保留 I 前缀' },
        { el: '常量', rule: 'PascalCase', good: 'MaxRetryCount', bad: 'MAX_RETRY_COUNT', note: '' },
        { el: '异步方法', rule: 'Async 后缀', good: 'FetchUserListAsync', bad: 'FetchUserList', note: '返回 Task / ValueTask 时加' },
        { el: '局部变量', rule: 'camelCase', good: 'userList', bad: '_userList', note: '' }
      ]
    },
    {
      id: 'rust', name: 'Rust', short: 'Rust',
      rows: [
        { el: '变量 / 函数', rule: 'snake_case', good: 'fetch_user_list', bad: 'fetchUserList', note: '编译器会直接警告 non_snake_case' },
        { el: '类型 / trait / enum', rule: 'PascalCase', good: 'OrderRepository', bad: 'order_repository', note: '' },
        { el: '常量 / 静态', rule: 'SCREAMING_SNAKE_CASE', good: 'MAX_RETRY_COUNT', bad: 'maxRetryCount', note: '' },
        { el: '模块 / 文件', rule: 'snake_case', good: 'user_profile.rs', bad: 'UserProfile.rs', note: '' },
        { el: '生命周期', rule: '短小写', good: "'a / 'ctx", bad: "'LIFETIME", note: '' },
        { el: '测试', rule: '#[test] + snake_case 行为描述', good: 'fetch_user_returns_empty', bad: 'test1', note: '' }
      ]
    },
    {
      id: 'sql', name: 'SQL / 数据库', short: 'SQL',
      rows: [
        { el: '表名', rule: '小写、复数、snake_case', good: 'order_items', bad: 'OrderItems', note: '跨库时统一复数能少吵架' },
        { el: '字段', rule: 'snake_case', good: 'created_at', bad: 'createdAt', note: '' },
        { el: '主键', rule: 'id 或 表名单数_id', good: 'order_id', bad: 'orderId', note: '外键必须与引用表主键同名' },
        { el: '外键', rule: '引用表名单数_id', good: 'user_id', bad: 'uid', note: '' },
        { el: '索引', rule: 'idx_表_字段', good: 'idx_orders_user_id', bad: 'index1', note: '唯一索引用 uk_，普通索引用 idx_' },
        { el: '布尔字段', rule: 'is_ / has_ 前缀', good: 'is_paid', bad: 'paid_flag', note: '' },
        { el: '时间字段', rule: '_at 后缀', good: 'paid_at', bad: 'pay_time', note: '同一张表里 at / time 只选一种' },
        { el: '视图', rule: 'v_ 前缀或 _view 后缀', good: 'v_order_summary', bad: 'summary', note: '' },
        { el: '存储过程 / 函数', rule: 'sp_ / fn_ 前缀', good: 'sp_close_order', bad: 'proc1', note: '有争议但统一就赢' },
        { el: '临时表', rule: 'tmp_ 前缀 + 日期', good: 'tmp_order_20261022', bad: 'temp', note: '临时对象必须自带过期语义，方便清理' },
        { el: '分区表', rule: '主表名_p + 分区标识', good: 'orders_p202610', bad: 'orders_new', note: '' }
      ]
    },
    {
      id: 'css', name: 'CSS', short: 'CSS',
      rows: [
        { el: 'class', rule: 'kebab-case，推荐 BEM', good: 'card__title', bad: 'cardTitle', note: 'BEM：block__element--modifier' },
        { el: 'CSS 变量', rule: '--kebab-case', good: '--color-primary', bad: '--colorPrimary', note: '语义化命名，别用色值当名字' },
        { el: '状态类', rule: 'is- / has- 前缀', good: 'is-active', bad: 'active2', note: '状态类只加不改' },
        { el: '工具类', rule: 'u- 前缀', good: 'u-mt-8', bad: 'mt8', note: '便于和业务类区分' },
        { el: '动画', rule: '动作用动词，关键帧用名词', good: 'fade-in / slideUp', bad: 'anim1', note: '' }
      ]
    }
  ];

  /* ---------- 14. 命名模式库（后缀语义字典） ---------- */
  const PATTERNS = [
    { n: 'Service', cat: '分层', use: '承载业务用例，编排多个数据源', ex: 'OrderService', warn: '不直接写 SQL，不直接操作 DOM' },
    { n: 'Repository', cat: '分层', use: '封装数据访问，屏蔽存储细节', ex: 'OrderRepository', warn: '只做增删改查，别塞业务规则' },
    { n: 'Controller', cat: '分层', use: '接收请求、校验入参、返回响应', ex: 'OrderController', warn: '不做业务计算，薄一点更好' },
    { n: 'Store', cat: '状态', use: '前端状态容器', ex: 'useCartStore', warn: '别让它变成全局垃圾桶' },
    { n: 'Provider', cat: '依赖', use: '提供资源或依赖注入', ex: 'ConfigProvider', warn: '有生命周期，别写成静态方法集合' },
    { n: 'Factory', cat: '创建', use: '封装复杂对象的创建过程', ex: 'ClientFactory', warn: '只是 new 一下就别用 Factory' },
    { n: 'Builder', cat: '创建', use: '分步骤构造复杂对象', ex: 'QueryBuilder', warn: '参数少于 3 个没必要' },
    { n: 'Adapter', cat: '结构', use: '把不兼容的接口转成可用接口', ex: 'PayAdapter', warn: '不做业务增强，只做协议转换' },
    { n: 'Mapper', cat: '转换', use: '实体与 DTO 互转', ex: 'OrderMapper', warn: '别在 Mapper 里查数据库' },
    { n: 'Strategy', cat: '行为', use: '可替换的算法族', ex: 'PricingStrategy', warn: '只有一个实现就别抽象' },
    { n: 'Handler', cat: '事件', use: '处理单一事件或消息', ex: 'PaymentHandler', warn: '一个 Handler 只处理一件事' },
    { n: 'Listener', cat: '事件', use: '监听并响应事件', ex: 'OrderCreatedListener', warn: '别在监听器里做耗时同步操作' },
    { n: 'Middleware', cat: '请求链', use: '请求管道的横切逻辑', ex: 'AuthMiddleware', warn: '保持无副作用，注意执行顺序' },
    { n: 'Guard', cat: '请求链', use: '权限/条件守卫', ex: 'AdminGuard', warn: '只做判断，不做业务' },
    { n: 'Interceptor', cat: '请求链', use: '请求前后的统一处理', ex: 'LoggingInterceptor', warn: '别在里面改业务数据' },
    { n: 'Reducer', cat: '状态', use: '纯函数式的状态演进', ex: 'cartReducer', warn: '必须是纯函数，不能有副作用' },
    { n: 'Selector', cat: '状态', use: '从状态树派生计算值', ex: 'selectCartTotal', warn: '不要返回新对象引用导致重渲染' },
    { n: 'Validator', cat: '校验', use: '集中校验规则', ex: 'CouponValidator', warn: '只返回校验结果，别直接改数据' },
    { n: 'Policy', cat: '校验', use: '权限/业务策略判定', ex: 'RefundPolicy', warn: '命名要说清策略维度' },
    { n: 'Serializer', cat: '转换', use: '对象与传输格式互转', ex: 'OrderSerializer', warn: '与 Mapper 只选一个词，别混用' },
    { n: 'Scheduler', cat: '调度', use: '定时/延时任务编排', ex: 'ReportScheduler', warn: '注意幂等与失败重试' },
    { n: 'Client', cat: '通信', use: '对外部服务的调用封装', ex: 'PaymentClient', warn: '超时、重试、熔断要写在里面' },
    { n: 'Gateway', cat: '通信', use: '聚合多个下游的统一入口', ex: 'UserGateway', warn: '别把业务逻辑沉到这里' },
    { n: 'DTO', cat: '数据', use: '跨层传输的数据结构', ex: 'OrderDTO', warn: '不放业务方法' },
    { n: 'VO', cat: '数据', use: '面向展示的视图对象', ex: 'OrderVO', warn: '与 DTO 混用是团队混乱的开始' },
    { n: 'BO', cat: '数据', use: '聚合后的业务对象', ex: 'OrderBO', warn: '别直接暴露给外部接口' },
    { n: 'PO', cat: '数据', use: '与数据库表一一对应的持久化对象', ex: 'OrderPO', warn: '' },
    { n: 'DAO', cat: '数据', use: '数据访问对象（老派写法）', ex: 'OrderDAO', warn: '新项目用 Repository 替代' },
    { n: 'Hook', cat: '前端', use: '复用有状态逻辑', ex: 'useUserList', warn: '必须以 use 开头，否则规则检查失效' },
    { n: 'Context', cat: '前端', use: '跨层级共享数据', ex: 'ThemeContext', warn: '高频变化的数据别放 Context' }
  ];

  /* ---------- 15. 提交前自查清单 ---------- */
  const NAMING_CHECKLIST = [
    '念一遍：这个名字能在 code review 时被一眼读出来吗？念不顺的通常也有问题',
    '去掉上下文：在 obj.field 里只看 field，还能知道它是什么吗',
    '找数字：名字里有 2 吗？有的话说清它为什么必须是 2',
    '看布尔：是否以 is / has / can / should 开头，调用处能不能读成一句话',
    '看单复数：集合用复数，单个对象用单数，别用 list 硬凑',
    '搜万能词：有没有 data / info / item / manager / helper 这类说了等于没说的词',
    '数单词：超过 4 个单词，说明这函数干的事太多了，先拆逻辑再改名',
    '查同义词：get / fetch / query / find 是不是混着用？统一一个动词表',
    '查拼写：lenght / heigth / recieve / adress 是四大高发区',
    '时光机测试：半年后的新人，能不能只看名字猜出用途'
  ];

  /* ---------- 16. 拼音 / 首字母容错表 ---------- */
  const PINYIN = {
    yonghu: '用户', yh: '用户', dingdan: '订单', dd: '订单', shangpin: '商品', sp: '商品',
    huoqu: '获取', hq: '获取', chaxun: '查询', cx: '查询', shanchu: '删除', sc: '删除',
    gengxin: '更新', gx: '更新', chuangjian: '创建', cj: '创建', tianjia: '添加',
    liebiao: '列表', lb: '列表', shuliang: '数量', sl: '数量', zhuangtai: '状态', zt: '状态',
    xinxi: '信息', peizhi: '配置', pz: '配置', wenjian: '文件', wj: '文件',
    tupian: '图片', tp: '图片', sousuo: '搜索', ss: '搜索', baocun: '保存', bc: '保存',
    xiugai: '修改', xg: '修改', yanzheng: '校验', yz: '校验', zhifu: '支付', zf: '支付',
    tuikuan: '退款', kucun: '库存', kc: '库存', gouwuche: '购物车', gwc: '购物车',
    huodong: '活动', wenzhang: '文章', wz: '文章', pinglun: '评论', pl: '评论',
    biaoqian: '标签', bq: '标签', fenlei: '分类', fl: '分类', tongji: '统计', tj: '统计',
    baobiao: '报表', bb: '报表', muban: '模板', mb: '模板', bumen: '部门', bm: '部门',
    dizhi: '地址', dz: '地址', jine: '金额', je: '金额', qianbao: '钱包', qb: '钱包',
    biaodan: '表单', bd: '表单', anniu: '按钮', an: '按钮', tanchuang: '弹窗',
    caidan: '菜单', cd: '菜单', tubiao: '图表', tb: '图表', zujian: '组件', zj: '组件',
    yemian: '页面', ym: '页面', luyou: '路由', ly: '路由', jiekou: '接口', jk: '接口',
    shujuku: '数据库', ziduan: '字段', zd: '字段', qingqiu: '请求', qq: '请求',
    xiangying: '响应', xy: '响应', lingpai: '令牌', huihua: '会话', hh: '会话',
    shijian: '事件', sj: '事件', gongju: '工具', gj: '工具', wendang: '文档', wd: '文档',
    rizhi: '日志', rz: '日志', cuowu: '错误', cw: '错误', renwu: '任务', rw: '任务',
    daiban: '待办', db: '待办', mima: '密码', mm: '密码', youxiang: '邮箱',
    shoujihao: '手机号', touxiang: '头像', tx: '头像', nicheng: '昵称', jifen: '积分',
    youhuiquan: '优惠券', shijianchuo: '时间戳', riqi: '日期', rq: '日期',
    shichang: '时长', leixing: '类型', lx: '类型', mingcheng: '名称', mc: '名称',
    xiangqing: '详情', xq: '详情', huizong: '汇总', hz: '汇总', paixu: '排序',
    daochu: '导出', daoru: '导入', shangchuan: '上传', xiazai: '下载',
    zhuce: '注册', denglu: '登录', tuichu: '退出', shouquan: '授权',
    piliang: '批量', pl_: '批量', guolv: '过滤', shaixuan: '筛选',
    gongyingshang: '供应商', kehu: '客户', huiyuan: '会员', zhifubao: '支付'
  };

  /* ---------- 17. 近义动词的语义差异（不是换个词，是换个语义） ---------- */
  const VERB_HINTS = {
    get: '本地/内存里的同步取值，没有网络成本',
    fetch: '发起一次远程请求，通常是异步的，有网络开销',
    retrieve: '从存储中取回完整对象，语气正式，SDK 里常见',
    query: '按条件检索，天然适合数据库与搜索引擎',
    find: '查找并返回第一个匹配项，找不到就返回空',
    search: '全文/模糊搜索，暗示有匹配度和排序',
    load: '把数据装进内存、懒加载资源，强调"装载"这个动作',
    create: '创建新实体，强调从无到有',
    add: '往已有集合里追加，不强调实体本身',
    insert: '插入到指定位置或底层存储，偏数据库语境',
    update: '更新已有实体的字段',
    modify: '修改，泛指，语气比 update 弱',
    patch: '局部更新，只改动差异部分',
    delete: '真删除，数据不再存在',
    remove: '从集合中移出，未必销毁底层数据',
    destroy: '彻底销毁并释放资源',
    clear: '清空内容但保留容器本身',
    send: '发送消息/请求，关注传输动作',
    post: '提交到服务端，对应 HTTP POST',
    publish: '发布给订阅者，事件驱动语境',
    validate: '校验合法性，返回布尔或抛错',
    verify: '核实真实性，常带外部比对',
    check: '轻量检查，通常不阻塞流程',
    calculate: '计算，强调过程与算法',
    compute: '计算，偏底层与性能语境',
    format: '格式化为可读字符串',
    parse: '把字符串解析成结构化对象',
    render: '把数据渲染成界面',
    build: '构建出完整对象或产物',
    generate: '按规则生成新内容'
  };

  /* ---------- 18. 常见错别字纠错表（表驱动，宁可少纠也不能误伤生词） ---------- */
  const TYPO_FIX = {
    '用互': '用户', '用护': '用户', '护户': '用户', '获职': '获取', '获取': '获取',
    '列装': '列表', '列标': '列表', '定单': '订单', '订当': '订单', '帐号': '账号',
    '帐单': '账单', '密玛': '密码', '秘码': '密码', '支附': '支付', '支伏': '支付',
    '删出': '删除', '删徐': '删除', '添家': '添加', '修该': '修改', '休改': '修改',
    '更心': '更新', '够物车': '购物车', '购务车': '购物车', '库纯': '库存', '库寸': '库存',
    '状太': '状态', '壮态': '状态', '配志': '配置', '配直': '配置', '文见': '文件',
    '图骗': '图片', '上船': '上传', '下栽': '下载', '暴存': '保存', '保村': '保存',
    '查旬': '查询', '察询': '查询', '校检': '校验', '验正': '校验', '通只': '通知',
    '通之': '通知', '消系': '消息', '信心': '信息', '评轮': '评论', '标牵': '标签',
    '分内': '分类', '统记': '统计', '报标': '报表', '模版': '模板', '部们': '部门',
    '地只': '地址', '金俄': '金额', '表但': '表单', '按牛': '按钮', '弹闯': '弹窗',
    '菜但': '菜单', '图彪': '图表', '组见': '组件', '页免': '页面', '路又': '路由',
    '接扣': '接口', '数据裤': '数据库', '请球': '请求', '响因': '响应', '令排': '令牌',
    '事见': '事件', '文当': '文档', '日只': '日志', '错吴': '错误', '任物': '任务',
    '头相': '头像', '昵成': '昵称', '积份': '积分', '优惠卷': '优惠券', '祥情': '详情',
    '内同': '内容', '标提': '标题', '描术': '描述', '手机号玛': '手机号', '邮相': '邮箱',
    '验证玛': '验证码', '日成': '日程', '进渡': '进度', '明戏': '明细', '素才': '素材',
    '项木': '项目', '版木': '版本', '工单': '工单', '报消': '报销', '发飘': '发票',
    '合铜': '合同', '物聊': '物料', '运但': '运单', '仓裤': '仓库', '门电': '门店',
    '课成': '课程', '考题': '考题', '排般': '排班', '考琴': '考勤', '薪紫': '薪资'
  };

  global.DICT = {
    VERBS, NOUNS, MODS, STATES, BOOL_HINTS, SMELL, ABBR, CLASS_SUFFIX,
    FUN_ADJ, FUN_NOUN, FUN_SUFFIX, COMMIT_TYPES, COMMIT_JOKES, EXAMPLES, GUIDE,
    LANG_MATRIX, PATTERNS, NAMING_CHECKLIST, PINYIN, VERB_HINTS, TYPO_FIX
  };
})(window);
