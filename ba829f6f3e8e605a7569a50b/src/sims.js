/* 模拟器大厅 · 站点清单
 *
 * 这是「大厅」与「构建脚本」共用的唯一真源：
 *   - 浏览器端（index.html）读取 window.SIM_LIST 渲染卡片
 *   - 构建端（tools/sync.js）读取 path / source / entry，把源目录搬到 portal 下
 *
 * 新增一个模拟器只改这里 + 跑一次 sync：
 *   {
 *     id:    'xxx',                  // 唯一标识（也用作子目录名）
 *     name:  'XX模拟器',
 *     seal:  '某',                    // 印章上的一个字
 *     line:  '一句话钩子',            // 卡片主句
 *     desc:  '两三句具体介绍',         // 卡片说明
 *     path:  'xxx/',                 // 发布后的访问路径（相对大厅）
 *     entry: 'index.html',           // 源目录里的入口文件名
 *     source: '../xxx-site',         // 构建源目录（相对 portal/）
 *     accent:'#a8442a',              // 卡片主色
 *     tag:   '人生',                  // 左上角小标签
 *     meta:  ['7 个阶段', '万种结局'], // 底部胶囊信息
 *     store: 'xxx_archive_v1',       // 可选：window.parent.hallStore 键，用于显示已存局数
 *     status:'ready'                 // ready | soon（soon 显示为「筹备中」不可点）
 *   }
 */
window.SIM_LIST = [
  {
    id: 'life',
    name: '人生模拟器',
    seal: '生',
    line: '从一声啼哭，到一把灰',
    desc: '投胎、上学、择业、成家、老去。七个人生阶段，几百个岔路口，每一次点击都算数。',
    path: 'life/',
    entry: 'index.html',
    source: '../life-sim-site',
    accent: '#a8442a',
    tag: '人生',
    meta: ['7 个阶段', '万种结局'],
    store: 'life_sim_archive_v1',
    status: 'ready',
  },
  {
    id: 'dynasty',
    name: '王朝模拟器',
    seal: '帝',
    line: '你坐在这把椅子上，江山在你的诏书里',
    desc: '登基那年起，每一道旨意都在改国运。国库、民心、边患、党争，龙椅只有一把。',
    path: 'dynasty/',
    entry: 'index.html',
    source: '../dynasty-sim-web',
    accent: '#9a7838',
    tag: '王朝',
    meta: ['御笔亲批', '江山兴衰'],
    store: 'dyn_reign_archive_v1',
    status: 'ready',
  },
  {
    id: 'office',
    name: '办公室模拟器',
    seal: '职',
    line: '二十四岁入职，五十四岁退休',
    desc: '格子间里的三十年。汇报、站队、跳槽、被裁，工资条上的数字一格一格往上爬。',
    path: 'office/',
    entry: 'preview.html',
    source: '../office-sim-miniprogram',
    accent: '#3f5a6e',
    tag: '职场',
    meta: ['30 年工龄', '7 个阶段'],
    store: 'office_sim_archive_v1',
    status: 'ready',
  },
  {
    id: 'gongdou',
    name: '宫斗模拟器',
    seal: '宫',
    line: '你刚入宫，得活着走出去',
    desc: '一道朱墙，几百个心眼。恩宠、位份、子嗣、毒酒，活到最后的人才能说话。',
    path: 'gongdou/',
    entry: 'index.html',
    source: '../gongdou-site',
    accent: '#7d4a63',
    tag: '宫斗',
    meta: ['位份晋升', '宫墙之内'],
    store: 'palace_sim_archive_v1',
    status: 'ready',
  },
  {
    id: 'groupchat',
    name: '群聊模拟器',
    seal: '群',
    line: '八十个陌生人，一个永远不会停的群',
    desc: '被拉进一个莫名其妙的群。消息一条接一条，有人吵架、有人发癫、有人只发一个句号。',
    path: 'groupchat/',
    entry: 'preview.html',
    source: '../groupchat-sim',
    accent: '#5a6b58',
    tag: '群聊',
    meta: ['永不停歇', '一次一局'],
    store: 'gc_runs',
    status: 'ready',
  },
  {
    id: 'doom',
    name: '末日生存模拟器',
    seal: '末',
    line: '病毒爆发之后的一千五百天',
    desc: '生化病毒「灰热症」失控，封城失败，世界在几个月里垮掉。体力、心气、存货、据点，四本账每一天都在收。你要想办法还在。',
    path: 'doom/',
    entry: 'index.html',
    source: '../doom-sim-site',
    accent: '#8c4a2f',
    tag: '末日',
    meta: ['1500 天', '36 种结局'],
    store: 'doom_sim_archive_v1',
    status: 'ready',
  },
];
