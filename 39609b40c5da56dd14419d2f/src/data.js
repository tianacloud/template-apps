/* ============================================================
   凌晨三点 · Oncall 指挥台  —  关卡数据
   每个动作都是真实 oncall 会遇到的选择，部分动作是陷阱。
   lv: good 根治 / temp 临时止血 / bad 错误决策 / info 只观察
   bestPath: 最优决策路径（用于结算时计算"满分基准"，不写死数字）
   ============================================================ */
window.SCENARIOS = [

/* ============================ 01 ============================ */
{
  id:'pool', no:'01', name:'连接池见底', sub:'数据库连接被吃光的那一夜',
  diff:'入门', system:'order-api', qps:3800, startErr:6, growth:0.42, maxSec:720,
  brief:{
    when:'凌晨 02:47',
    intro:'你刚合上电脑，手机开始震。值班群里连发三条 @你的消息：下单接口 5xx 在涨。你打开电脑，看到的是一个正在缓慢变红的看板。',
    task:'把错误率压回 1% 以下。记住：你花掉的每一秒，都在变成失败的下单请求。'
  },
  svc:[
    {n:'gateway', r:'API 网关'},
    {n:'order-api', r:'订单服务 · 3 实例'},
    {n:'mysql', r:'主库 · 连接池 100'},
    {n:'pay-callback', r:'支付回调'}
  ],
  alerts:[
    {t:0,  lv:'P2', svc:'gateway',   msg:'下单接口 5xx 比例 6.2%，呈上升趋势'},
    {t:0,  lv:'info', svc:'deploy',  msg:'order-api v2.7.1 已于 3 小时前全量发布，无异常上报'},
    {t:28, lv:'P1', svc:'order-api', msg:'HikariPool-1 - Connection is not available, request timed out after 30000ms'},
    {t:62, lv:'P1', svc:'mysql',     msg:'活跃连接 100/100 已达上限，等待队列 214'},
    {t:98, lv:'P2', svc:'gateway',   msg:'下单接口 P99 延迟 8.4s（基线 210ms）'},
    {t:145,lv:'P1', svc:'order-api', msg:'错误率 24%，实例健康检查 1/3 通过'},
    {t:205,lv:'P1', svc:'pay-callback', msg:'支付回调待处理积压 1.2 万笔'}
  ],
  acts:[
    /* ---- 诊断 ---- */
    {id:'d_metric', g:'diag', t:'看服务大盘', d:'黄金指标：错误率、延迟、饱和度', dur:12,
     flag:'metric', lv:'info',
     log:'错误率曲线近似线性上升；数据库活跃连接数已经贴顶。这是典型的"资源耗尽"，不是代码 bug。'},
    {id:'d_conn', g:'diag', t:'看连接池分布', d:'哪些连接被谁占着', dur:20,
     flag:'conn', lv:'info',
     log:'87% 的连接卡在同一条 SQL 上，每条平均持有 28 秒。有人在拖住连接不放。'},
    {id:'d_slow', g:'diag', t:'查慢查询日志', d:'数据库侧最慢的几条语句', dur:35,
     flag:'slow', lv:'info',
     log:'SELECT * FROM t_order WHERE user_phone = ? 全表扫描 240 万行，user_phone 字段没有索引。'},
    {id:'d_deploy', g:'diag', t:'查最近变更', d:'发布、配置、扩缩容记录', dur:15,
     flag:'deploy', lv:'info',
     log:'v2.7.1 在 3 小时前发布，早于故障起点 2.5 小时 —— 大概率不是发布引起的。'},
    {id:'d_trace', g:'diag', t:'追一条慢请求', d:'端到端链路耗时拆解', dur:25,
     flag:'slow', lv:'info',
     log:'链路里 96% 的时间停在 MySQL 查询上，卡点确认是 t_order 的全表扫描。'},

    /* ---- 止血 ---- */
    {id:'s_kill', g:'stop', t:'终止慢 SQL', d:'kill 掉拖住连接的查询', dur:45, req:'slow', win:true,
     err:{set:4}, growth:{set:-0.9}, lv:'good',
     log:'慢查询被终止，连接在 6 秒内归还，错误率 21% → 4% → 0.8%。你花了 45 秒，但找对了位置。',
     blind:{err:{mul:0.84}, lv:'bad',
       log:'你还没定位就随手 kill 了一条查询，错误率短暂下降又弹回去 —— 被杀的是一条无关的报表 SQL。'}},
    {id:'s_restart', g:'stop', t:'滚动重启实例', d:'让连接全部释放，重新开始', dur:70,
     err:{set:3}, growth:{set:0.22}, lv:'temp',
     log:'重启确实释放了所有连接，错误率骤降到 3%。但根因还在，连接池会在几分钟内再次见底。'},
    {id:'s_limit', g:'stop', t:'对下单接口限流', d:'先保住数据库，拒绝一部分流量', dur:30,
     err:{mul:0.38}, growth:{set:0.06}, lv:'temp',
     log:'限流挡住了 60% 的请求，错误率回落到 9%。用户开始收到"活动太火爆"，但数据库暂时喘上气了。'},
    {id:'s_index', g:'stop', t:'紧急加索引', d:'在线 DDL，治本但耗时', dur:180, req:'slow', win:true,
     err:{set:3}, growth:{set:-0.9}, lv:'good',
     log:'在线 DDL 完成，全表扫描消失，连接数回落到 12。你选了根治方案，代价是整整 3 分钟。'},
    {id:'s_pool', g:'stop', t:'调大连接池上限', d:'100 → 200', dur:60,
     err:{mul:1.12}, growth:{add:0.18}, lv:'bad',
     log:'连接池上限调到 200，于是 200 个连接同时压向数据库，DB 更慢了。你把问题推给了下游。'},
    {id:'s_scale', g:'stop', t:'紧急扩容 2 个实例', d:'更多机器分担流量', dur:90,
     err:{mul:1.26}, growth:{add:0.1}, lv:'bad',
     log:'新实例启动后又各自占满 100 个连接，数据库连接数直接超限。扩容放大了故障。'},
    {id:'s_rollback', g:'stop', t:'回滚上一版本', d:'回到 v2.7.0', dur:110,
     err:{mul:1.0}, lv:'bad',
     log:'回滚花了 110 秒，错误率一条直线没动 —— 这次故障和发布无关，你赌错了方向。'},

    /* ---- 沟通 ---- */
    {id:'c_group', g:'comm', t:'拉起应急群 @所有人', d:'让相关方都在同一个频道里', dur:0,
     flag:'comm1', lv:'info', log:'应急群已建立，DBA 已进群待命。后面需要他配合时不用再等。'},
    {id:'c_status', g:'comm', t:'更新对外状态页', d:'让用户知道你在处理', dur:0,
     flag:'comm2', lv:'info', log:'状态页已更新："下单功能部分不可用，正在修复"。客服的重复问询立刻少了一半。'},
    {id:'c_biz', g:'comm', t:'通知业务方与客服', d:'同步影响范围与预期恢复时间', dur:0,
     flag:'comm3', lv:'info', log:'业务方已同步：预计 5 分钟内恢复，影响范围为下单链路。'}
  ],
  bestPath:['c_group','d_metric','d_slow','c_status','s_kill'],
  lesson:{
    title:'连接池耗尽：先看谁在占着连接，再决定动谁',
    points:[
      '连接池打满时，<b>扩容应用实例是最常见的错误</b> —— 每个新实例都会新建一池连接，把压力直接推给数据库。',
      '不要先调大 <b>maxPoolSize</b>。上限只是把排队的位置变多，慢查询还在，数据库只会更慢。',
      '<b>重启能立刻见效，但它只是把定时炸弹重新上弦。</b>如果重启后 5 分钟内没有做根因处理，故障一定复发。',
      '正确的顺序：定位慢 SQL → 终止或加索引 → 观察连接数回落。DBA 进群越早，这一步越快。'
    ]
  }
},

/* ============================ 02 ============================ */
{
  id:'avalanche', no:'02', name:'缓存雪崩', sub:'一个分片挂掉，全站开始裸奔',
  diff:'进阶', system:'item-api', qps:7600, startErr:3, growth:1.05, maxSec:600,
  brief:{
    when:'凌晨 03:12',
    intro:'商品详情页开始大面积超时。你还没打开看板，监控电话已经打进来了。这一次错误率涨得比上次快得多 —— 每过 10 秒，就多一成请求失败。',
    task:'错误率正在以每秒 1% 的速度上涨。你需要比它更快。'
  },
  svc:[
    {n:'gateway', r:'API 网关'},
    {n:'item-api', r:'商品服务 · 6 实例'},
    {n:'redis', r:'缓存集群 · 3 分片'},
    {n:'mysql', r:'主库 · 已被打穿'}
  ],
  alerts:[
    {t:0,  lv:'P2', svc:'item-api', msg:'商品详情页平均 RT 从 48ms 上升到 610ms'},
    {t:18, lv:'P1', svc:'redis',    msg:'分片 redis-2 连接失败，节点不可达'},
    {t:45, lv:'P1', svc:'mysql',    msg:'CPU 使用率 100%，慢查询数每分钟 340 条'},
    {t:72, lv:'P1', svc:'item-api', msg:'错误率 21%，且以每秒约 1% 的速度继续上升'},
    {t:115,lv:'P2', svc:'gateway',  msg:'首页推荐接口大面积超时，已影响非商品链路'},
    {t:160,lv:'P1', svc:'mysql',    msg:'Too many connections —— 主库开始拒绝新连接'}
  ],
  acts:[
    {id:'d_metric', g:'diag', t:'看黄金指标', d:'错误率 / 延迟 / 饱和度', dur:12,
     flag:'metric', lv:'info',
     log:'错误率和数据库 QPS 同步陡增，延迟主要堆在存储层。这是"流量打穿了缓存"的形状。'},
    {id:'d_redis', g:'diag', t:'查缓存命中率', d:'命中率与分片健康状态', dur:25,
     flag:'redis', lv:'info',
     log:'命中率 97% → 61%，redis-2 分片连接超时。原本由它承担的读请求全部回源到 MySQL。'},
    {id:'d_db', g:'diag', t:'看数据库负载', d:'QPS、连接数、慢查询', dur:20,
     flag:'db', lv:'info',
     log:'MySQL QPS 从 1.2 万涨到 7.6 万 —— 涨了 6 倍，全部来自缓存击穿的读请求。'},
    {id:'d_deps', g:'diag', t:'看依赖拓扑', d:'上下游谁在影响谁', dur:15,
     flag:'deps', lv:'info',
     log:'依赖链清晰：redis-2 → item-api → mysql。故障源在最左侧，压力全传导到了最右侧。'},

    {id:'s_failover', g:'stop', t:'切换 Redis 分片到备节点', d:'让 redis-2 的读请求恢复', dur:40, req:'redis', win:true,
     err:{mul:0.2}, growth:{set:-0.6}, lv:'good',
     log:'分片切到备节点，命中率 61% → 92%，MySQL QPS 回落到 1.4 万，错误率 34% → 1.1%。',
     blind:{err:{mul:1.05}, lv:'bad',
       log:'你没确认是哪个分片挂了就执行切换，结果切错了节点，40 秒过去，故障一点没变。'}},
    {id:'s_ratelimit', g:'stop', t:'入口限流到 30%', d:'先保住数据库不被彻底打死', dur:30,
     err:{mul:0.32}, growth:{set:0.02}, lv:'good',
     log:'限流立刻把打向 MySQL 的流量砍掉七成，数据库 CPU 从 100% 降到 62%。错误率还在 12%，但不再上升了。'},
    {id:'s_degrade', g:'stop', t:'商品详情降级为静态兜底', d:'返回缓存快照，不再查库', dur:25,
     err:{mul:0.38}, growth:{set:0.08}, lv:'temp',
     log:'降级生效，错误率降到 13%。但用户看到的是 10 分钟前的价格和库存。'},
    {id:'s_warm', g:'stop', t:'预热核心商品缓存', d:'把热点数据重新灌回内存', dur:50,
     err:{mul:0.55}, growth:{set:-0.15}, lv:'temp',
     log:'热点商品重新进了缓存，错误率降到 19%。但 redis-2 还是不可用，长尾商品仍在打库。'},
    {id:'s_scale', g:'stop', t:'扩容 API 实例到 12 个', d:'横向加机器', dur:80,
     err:{mul:1.22}, lv:'bad',
     log:'多了 6 个实例，就多了 6 倍的请求压向已经过载的 MySQL。错误率反而更高了。'},
    {id:'s_dbrestart', g:'stop', t:'重启 MySQL 主库', d:'让数据库"缓一缓"', dur:90,
     err:{mul:1.35}, lv:'bad',
     log:'主库重启的 90 秒里所有写入失败，恢复后连接瞬间被打满。这是最不该做的选择。'},
    {id:'s_clearcache', g:'stop', t:'清空缓存重建', d:'彻底重建一遍缓存', dur:60,
     err:{mul:1.55}, lv:'bad',
     log:'"重建缓存"把仅剩的 61% 命中率也清空了 —— 全部请求同时回源，MySQL 彻底被打穿。'},

    {id:'c_group', g:'comm', t:'拉起应急群 @所有人', d:'运维、DBA、缓存负责人', dur:0,
     flag:'comm1', lv:'info', log:'缓存负责人已进群，确认 redis-2 是宿主机故障，备节点可用。'},
    {id:'c_status', g:'comm', t:'更新对外状态页', d:'说明影响范围', dur:0,
     flag:'comm2', lv:'info', log:'状态页已更新。客服不再重复问"为什么商品页打不开"。'},
    {id:'c_biz', g:'comm', t:'通知业务方', d:'大促流量正在进来', dur:0,
     flag:'comm3', lv:'info', log:'大促团队已收到通知，正在暂停投放，减少新增流量。'}
  ],
  bestPath:['c_group','d_redis','s_ratelimit','c_status','s_failover'],
  lesson:{
    title:'缓存雪崩：先限流保护数据库，再修缓存',
    points:[
      '雪崩的伤害不在缓存，<b>在于所有读请求瞬间回源到数据库</b>。所以第一步永远是给数据库减负，而不是修缓存。',
      '<b>限流的优先级高于修复。</b>修缓存要 40 秒，这 40 秒里数据库可能已经被打死，修好了也救不回来。',
      '清空缓存重建是最危险的操作 —— 它会把幸存的命中率也一起清零，制造第二次雪崩。',
      '扩容应用、重启主库，在这个场景里都会<b>放大</b>故障。所有动作判断标准只有一个：会不会增加数据库的压力。'
    ]
  }
},

/* ============================ 03 ============================ */
{
  id:'oom', no:'03', name:'发布即事故', sub:'上线 40 分钟后，内存开始爬坡',
  diff:'进阶', system:'user-service', qps:5200, startErr:8, growth:0.62, maxSec:700,
  brief:{
    when:'凌晨 03:38',
    intro:'登录接口开始报错。你翻了下发布记录，40 分钟前刚上线 v3.2.0。这次错误率涨得不快，但很稳 —— 像有什么东西在持续消耗，一涨就不回头。',
    task:'判断这是不是发布引起的。如果是，越早回滚代价越小。'
  },
  svc:[
    {n:'gateway', r:'API 网关'},
    {n:'user-service', r:'用户服务 · 4 副本'},
    {n:'k8s', r:'容器编排'},
    {n:'redis', r:'会话存储 · 正常'}
  ],
  alerts:[
    {t:0,  lv:'P2', svc:'user-service', msg:'实例 user-service-7d9f 重启 1 次'},
    {t:32, lv:'P1', svc:'k8s',          msg:'Container OOMKilled (exit code 137)'},
    {t:58, lv:'P1', svc:'k8s',          msg:'Pod 重启次数 3，接近 CrashLoopBackOff 阈值'},
    {t:88, lv:'P1', svc:'gateway',      msg:'登录接口错误率 22%'},
    {t:132,lv:'P2', svc:'user-service', msg:'内存使用率 98%，锯齿状爬升未回落'},
    {t:182,lv:'P1', svc:'k8s',          msg:'可用副本 1/4，服务接近不可用'}
  ],
  acts:[
    {id:'d_metric', g:'diag', t:'看实例健康', d:'副本数、重启次数、错误率', dur:12,
     flag:'metric', lv:'info',
     log:'错误率和 Pod 重启次数高度相关 —— 每次重启后错误率掉一次，然后重新爬升。'},
    {id:'d_mem', g:'diag', t:'看内存曲线', d:'各 Pod 的内存使用趋势', dur:20,
     flag:'mem', lv:'info',
     log:'内存呈锯齿状爬升：涨到 2Gi 就被 OOMKilled，然后重启、再涨。这是持续增长，不是突刺。'},
    {id:'d_deploy', g:'diag', t:'查发布记录', d:'最近版本与灰度范围', dur:15,
     flag:'deploy', lv:'info',
     log:'v3.2.0 在 40 分钟前完成全量发布，时间点和第一次重启完全吻合。高度可疑。'},
    {id:'d_gc', g:'diag', t:'看 GC 日志', d:'老年代回收后内存是否回落', dur:25,
     flag:'gc', lv:'info',
     log:'Full GC 之后内存不下降 —— 对象被引用着无法回收，是典型的内存泄漏，不是配置不够。'},
    {id:'d_diff', g:'diag', t:'对比版本差异', d:'v3.1.9 → v3.2.0 改了什么', dur:30,
     flag:'diff', lv:'info',
     log:'新增的本地缓存用了没有上限的 Map，且没有过期淘汰策略。泄漏点找到了。'},

    {id:'s_rollback', g:'stop', t:'回滚到 v3.1.9', d:'把已知安全的版本放回去', dur:45, win:true,
     err:{set:2}, growth:{set:-0.8}, lv:'good',
     log:'回滚完成，内存曲线回落到 600MB 并保持平稳，错误率 28% → 1.8% → 0.6%。45 秒，这是发布类故障最快的解法。'},
    {id:'s_hotfix', g:'stop', t:'热修复泄漏点', d:'给本地缓存加上限和淘汰', dur:210, req:'diff', win:true,
     err:{set:2}, growth:{set:-0.8}, lv:'good',
     log:'补丁上线，泄漏点修复。方案是对的，但你用了 3.5 分钟 —— 这种时候回滚只要 45 秒。',
     blind:{err:{mul:1.0}, lv:'bad',
       log:'没定位到泄漏点就改代码，改完发现没修对，3.5 分钟白花了。'}},
    {id:'s_restart', g:'stop', t:'全部副本重启', d:'清空内存重新开始', dur:60,
     err:{set:4}, growth:{set:0.5}, lv:'temp',
     log:'重启后内存清零，错误率降到 4%。但泄漏的代码还在跑，它会在 6 分钟后再次爬满。'},
    {id:'s_scale', g:'stop', t:'扩容到 8 个副本', d:'分摊压力', dur:80,
     err:{mul:1.12}, growth:{add:0.16}, lv:'bad',
     log:'8 个副本都在以同样的速度泄漏。6 分钟后它们会同时 OOM —— 你把一次小故障放大成了全站不可用。'},
    {id:'s_mem', g:'stop', t:'提高内存上限到 4Gi', d:'给 Pod 更多内存', dur:70,
     err:{mul:0.82}, growth:{add:-0.14}, lv:'temp',
     log:'内存上限提到 4Gi，OOM 时间从 6 分钟推迟到 12 分钟。你买到了时间，但没解决问题。'},
    {id:'s_off', g:'stop', t:'摘除异常实例', d:'把有问题的 Pod 从负载均衡摘掉', dur:35,
     err:{mul:0.55}, lv:'temp',
     log:'摘掉一个实例，错误率降到 15%。但剩下 3 个也在泄漏，只是还没到点。'},

    {id:'c_group', g:'comm', t:'拉起应急群', d:'拉上发布负责人', dur:0,
     flag:'comm1', lv:'info', log:'发布负责人进群，确认改动涉及本地缓存模块。'},
    {id:'c_status', g:'comm', t:'更新对外状态页', d:'登录异常公告', dur:0,
     flag:'comm2', lv:'info', log:'状态页已更新。这个操作几乎零成本，对客诉量的影响却最直接。'},
    {id:'c_biz', g:'comm', t:'通知业务方', d:'说明是否需要暂停投放', dur:0,
     flag:'comm3', lv:'info', log:'业务方已同步，暂停了登录引导类活动。'}
  ],
  bestPath:['c_group','d_deploy','c_status','s_rollback'],
  lesson:{
    title:'发布引起的故障，回滚永远快于修复',
    points:[
      '先回答一个问题：<b>故障时间点是否和某次变更吻合？</b>吻合就先回滚，不要边修边查。',
      '<b>回滚是 45 秒，热修复是 3.5 分钟。</b>线上每分钟都在损失用户，修复应该放到故障结束之后。',
      '内存锯齿状爬升 + Full GC 后不回落 = 内存泄漏。看到这个形状，先怀疑最近上线的新代码。',
      '"扩容"和"加内存"在这个场景里是纯粹的拖延 —— 泄漏是按实例复制的，机器越多，同时爆炸的越多。'
    ]
  }
},

/* ============================ 04 ============================ */
{
  id:'payblackhole', no:'04', name:'支付黑洞', sub:'用户付了钱，订单说没付',
  diff:'挑战', system:'pay-callback', qps:2400, startErr:2, growth:0.88, maxSec:780,
  brief:{
    when:'凌晨 03:55',
    intro:'客服群里已经有 40 多条消息了：用户付了钱，订单还是"待支付"。你查了一圈，发现自己这边的服务都在正常运行 —— 问题出在别人的系统里，但挨骂的是你。',
    task:'在你无法控制第三方的情况下，把这件事控制住。'
  },
  svc:[
    {n:'pay-callback', r:'回调服务 · 你的'},
    {n:'channel-A', r:'第三方支付渠道'},
    {n:'mq', r:'重试队列 · 积压中'},
    {n:'order-api', r:'订单服务'}
  ],
  alerts:[
    {t:0,  lv:'P2', svc:'pay-callback', msg:'回调处理平均耗时 4.8s（基线 180ms）'},
    {t:22, lv:'P1', svc:'pay-callback', msg:'第三方渠道回调成功率 41%，超时集中出现'},
    {t:52, lv:'P1', svc:'biz',          msg:'待支付订单积压 3.4 万笔，客服群开始追问'},
    {t:84, lv:'P1', svc:'mq',           msg:'重试队列积压 12 万条，重试间隔 2s'},
    {t:126,lv:'P2', svc:'finance',      msg:'对账文件与本地订单状态开始出现差异'},
    {t:178,lv:'P1', svc:'biz',          msg:'客诉工单 240 单/小时，且仍在增长'}
  ],
  acts:[
    {id:'d_metric', g:'diag', t:'看回调指标', d:'成功率、耗时、积压量', dur:12,
     flag:'metric', lv:'info',
     log:'成功率从 99.8% 掉到 41%，耗时从 180ms 涨到 4.8s。我们自己的服务是健康的，问题在上游。'},
    {id:'d_channel', g:'diag', t:'查第三方渠道状态', d:'渠道侧的网关与公告', dur:25,
     flag:'channel', lv:'info',
     log:'渠道 A 回调网关 P99 12s，超过我们 5s 的超时阈值。渠道状态页挂着一条"部分回调延迟"的公告。'},
    {id:'d_queue', g:'diag', t:'看重试队列', d:'积压量、重试策略', dur:20,
     flag:'queue', lv:'info',
     log:'12 万条积压，每条每 2 秒重试一次 —— 我们每秒钟都在向已经变慢的网关发起 6 万次重试。这是重试风暴。'},
    {id:'d_order', g:'diag', t:'抽样查订单状态', d:'渠道侧与本地是否一致', dur:15,
     flag:'order', lv:'info',
     log:'抽样 50 笔：渠道侧全部支付成功，本地全部显示待支付。钱已经到了，只是我们不知道。'},
    {id:'d_log', g:'diag', t:'查回调日志', d:'为什么没处理成功', dur:20,
     flag:'log', lv:'info',
     log:'大量 read timeout。回调本身是成功的，我们在等待响应时超时了，然后进入重试。'},

    {id:'s_stopretry', g:'stop', t:'暂停重试任务', d:'先掐掉风暴', dur:25, req:'queue',
     err:{mul:0.55}, growth:{set:-0.2}, lv:'good',
     log:'重试任务暂停，网关压力骤降，回调成功率 41% → 68%。积压还在，但不再自我放大了。',
     blind:{err:{mul:1.1}, lv:'bad',
       log:'没确认积压情况就停了重试任务，结果正常回调的补偿也一起停了，积压更快了。'}},
    {id:'s_switch', g:'stop', t:'切换备用支付通道', d:'把回调切到渠道 B', dur:40, req:'channel', win:true,
     err:{mul:0.15}, growth:{set:-0.7}, lv:'good',
     log:'回调切到渠道 B，成功率回到 96%。新订单不再进黑洞，积压开始被消化。',
     blind:{err:{mul:1.0}, lv:'bad',
       log:'没确认渠道状态就切换，结果渠道 B 没有开通这个支付方式，40 秒白等。'}},
    {id:'s_reconcile', g:'stop', t:'启动对账补偿任务', d:'逐笔核对并修正历史订单', dur:90, req:'order',
     err:{mul:0.35}, growth:{set:-0.4}, lv:'good',
     log:'补偿任务开始逐笔核对，已修正 2.1 万笔历史订单状态。这批用户不会再打客服电话了。'},
    {id:'s_scale', g:'stop', t:'扩容回调消费者', d:'加机器处理积压', dur:70,
     err:{mul:1.3}, lv:'bad',
     log:'消费者从 8 个加到 20 个，重试密度翻了 2.5 倍，第三方网关直接对我们限流了。'},
    {id:'s_resend', g:'stop', t:'全量重发回调', d:'把积压的请求再发一遍', dur:50,
     err:{mul:1.45}, lv:'bad',
     log:'12 万条重试一次性重发，网关返回 429。你制造了第二次风暴。'},
    {id:'s_mark', g:'stop', t:'手工把订单改为已支付', d:'先让用户看到结果', dur:60,
     err:{mul:0.9}, lv:'bad',
     log:'订单状态被手工改了，但和资金流水对不上。明天对账会多出 3 万笔差异，这比故障本身更难收场。'},
    {id:'s_timeout', g:'stop', t:'调大回调超时到 30s', d:'给渠道更多时间', dur:50,
     err:{mul:0.72}, growth:{add:0.12}, lv:'bad',
     log:'超时调大后，每个请求占用线程更久，连接池迅速见底，堆积的问题变成了可用性的问题。'},

    {id:'c_group', g:'comm', t:'拉起应急群', d:'财务、客服、渠道对接人', dur:0,
     flag:'comm1', lv:'info', log:'三方进群：财务确认资金已到账，客服拿到统一话术，渠道方确认在扩容。'},
    {id:'c_status', g:'comm', t:'更新对外状态页', d:'明确告知"钱不会丢"', dur:0,
     flag:'comm2', lv:'info', log:'公告写明"已支付订单将在 30 分钟内自动同步，无需重复支付"。重复支付的客诉立刻下降。'},
    {id:'c_biz', g:'comm', t:'通知业务方', d:'暂停支付引导推荐', dur:0,
     flag:'comm3', lv:'info', log:'业务方暂停了支付引导弹窗，减少了新增待支付订单。'}
  ],
  bestPath:['c_group','d_queue','s_stopretry','d_channel','c_status','s_switch'],
  lesson:{
    title:'依赖方故障：你能控制的只有自己这边',
    points:[
      '第三方变慢时，<b>你的重试机制会变成放大器</b>。12 万条积压每 2 秒重试一次，等于每秒向对方发 6 万次请求。',
      '第一步不是切换，是<b>先掐掉重试风暴</b>。否则你切到哪个渠道，都会把风暴一起带过去。',
      '数据一致性优先于"看起来正常"。手工改单状态是最贵的错误 —— 故障一小时，对账一个月。',
      '这类故障的沟通分特别重要：用户最怕的不是"付了没到账"，是"不知道会不会丢"。说清楚，客诉会掉一半。'
    ]
  }
}
];
