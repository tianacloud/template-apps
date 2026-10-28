/* 装机模拟器 · 数据层 v2.1
 *
 * price = 2026-10 市场行情价（人民币，零售端）
 * base  = 一年前常态价 / 官方指导价，仅用于计算「行情溢价」
 *
 * 2026-10 行情背景：AI 服务器挤占 DRAM 与 NAND 产能，消费级内存、固态、显卡全面涨价。
 *   内存：16G DDR5 单条从 200+ 涨到 1400+，32G 套条 3200~3400（低点至今 +400% 以上）
 *   显卡：RTX 50 系平均涨幅约 66%，RTX 5090 逾 130%；RX 9000 系约 46%；Arc 约 38%
 *   固态：NAND 合约价连续上调，1TB PCIe4.0 普遍 +50% 左右
 * 未写 base 的配件表示价格基本稳定（主板、机箱、散热、电源、大部分 CPU）。
 *
 * 字段说明
 *  cpu     socket / power(满载W) / score / mem(支持内存代数) / igpu / pcie
 *  board   socket / mem / form / m2 / dimm / maxMem / memMax / chipset / pcie / needBios
 *  gpu     vram / tdp / len(mm) / slots(占用槽位) / pcie / score
 *  ram     type / cap / sticks / freq
 *  ssd     pcie / cap
 *  cooler  type(air|aio) / height / rad / tdpLimit / sockets / noise(dB)
 *  chassis forms / maxGpu / maxCooler / rads / psu / slots
 *  psu     watts / form(ATX|SFX) / eff / modular
 */

const PARTS = {
  cpu: [
    { id: 'r5-5600',    name: 'AMD Ryzen 5 5600',        sub: '6核12线程 · Zen3',       socket: 'AM4',     power: 88,  score: 45, price: 499,  igpu: false, mem: ['DDR4'], pcie: '4.0' },
    { id: 'r5-5700x3d', name: 'AMD Ryzen 5 5700X3D',     sub: '8核16线程 · 96MB 3D缓存', socket: 'AM4',    power: 105, score: 58, price: 1099, base: 899, igpu: false, mem: ['DDR4'], pcie: '4.0' },
    { id: 'i5-14600kf', name: 'Intel Core i5-14600KF',   sub: '14核20线程 · 24MB',      socket: 'LGA1700', power: 181, score: 68, price: 1299, igpu: false, mem: ['DDR4', 'DDR5'], pcie: '5.0' },
    { id: 'i7-14700k',  name: 'Intel Core i7-14700K',    sub: '20核28线程 · 33MB',      socket: 'LGA1700', power: 253, score: 80, price: 2299, igpu: true,  mem: ['DDR4', 'DDR5'], pcie: '5.0' },
    { id: 'i9-14900k',  name: 'Intel Core i9-14900K',    sub: '24核32线程 · 36MB',      socket: 'LGA1700', power: 253, score: 90, price: 3499, igpu: true,  mem: ['DDR4', 'DDR5'], pcie: '5.0' },
    { id: 'r5-7500f',   name: 'AMD Ryzen 5 7500F',       sub: '6核12线程 · Zen4',       socket: 'AM5',     power: 88,  score: 60, price: 899,  igpu: false, mem: ['DDR5'], pcie: '5.0' },
    { id: 'r5-9600x',   name: 'AMD Ryzen 5 9600X',       sub: '6核12线程 · Zen5',       socket: 'AM5',     power: 88,  score: 72, price: 1449, igpu: true,  mem: ['DDR5'], pcie: '5.0' },
    { id: 'r7-7800x3d', name: 'AMD Ryzen 7 7800X3D',     sub: '8核16线程 · 96MB 3D缓存', socket: 'AM5',    power: 120, score: 88, price: 2699, base: 2399, igpu: true, mem: ['DDR5'], pcie: '5.0' },
    { id: 'r7-9700x',   name: 'AMD Ryzen 7 9700X',       sub: '8核16线程 · Zen5',       socket: 'AM5',     power: 88,  score: 76, price: 2099, igpu: true,  mem: ['DDR5'], pcie: '5.0' },
    { id: 'u5-245k',    name: 'Intel Core Ultra 5 245K', sub: '14核14线程 · Arrow Lake', socket: 'LGA1851', power: 159, score: 74, price: 1699, igpu: true,  mem: ['DDR5'], pcie: '5.0' },
    { id: 'r9-9900x',   name: 'AMD Ryzen 9 9900X',       sub: '12核24线程 · Zen5',      socket: 'AM5',     power: 160, score: 86, price: 2899, igpu: true,  mem: ['DDR5'], pcie: '5.0' },
    { id: 'r7-9800x3d', name: 'AMD Ryzen 7 9800X3D',     sub: '8核16线程 · 游戏之王',    socket: 'AM5',    power: 142, score: 92, price: 3899, base: 3199, igpu: true, mem: ['DDR5'], pcie: '5.0' },
    { id: 'r9-9950x',   name: 'AMD Ryzen 9 9950X',       sub: '16核32线程 · Zen5 旗舰',  socket: 'AM5',    power: 200, score: 95, price: 3899, igpu: true,  mem: ['DDR5'], pcie: '5.0' },
    { id: 'u9-285k',    name: 'Intel Core Ultra 9 285K', sub: '24核24线程 · 箭湖旗舰',   socket: 'LGA1851', power: 250, score: 93, price: 4199, igpu: true,  mem: ['DDR5'], pcie: '5.0' }
  ],

  board: [
    { id: 'b450m',    name: '微星 B450M-A PRO MAX',        sub: 'M-ATX · DDR4 · M.2×1', socket: 'AM4',     mem: 'DDR4', form: 'M-ATX', m2: 1, dimm: 2, maxMem: 64,  memMax: 3600, chipset: 'B450',  pcie: '3.0', price: 399,  needBios: [] },
    { id: 'b550m',    name: '微星 MAG B550M MORTAR WIFI',  sub: 'M-ATX · DDR4 · 堆料神板', socket: 'AM4',  mem: 'DDR4', form: 'M-ATX', m2: 2, dimm: 4, maxMem: 128, memMax: 4400, chipset: 'B550',  pcie: '4.0', price: 549,  needBios: [] },
    { id: 'h610m',    name: '华硕 PRIME H610M-A D4',       sub: 'M-ATX · DDR4 · 入门',   socket: 'LGA1700', mem: 'DDR4', form: 'M-ATX', m2: 1, dimm: 2, maxMem: 64,  memMax: 3200, chipset: 'H610',  pcie: '4.0', price: 499,  needBios: [] },
    { id: 'b760m-d4', name: '华硕 TUF B760M-PLUS D4',      sub: 'M-ATX · DDR4 · 主流',   socket: 'LGA1700', mem: 'DDR4', form: 'M-ATX', m2: 2, dimm: 4, maxMem: 128, memMax: 5333, chipset: 'B760',  pcie: '4.0', price: 799,  needBios: [] },
    { id: 'z790-ae',  name: '技嘉 Z790 AORUS ELITE AX',    sub: 'ATX · DDR5 · M.2×4',   socket: 'LGA1700', mem: 'DDR5', form: 'ATX',   m2: 4, dimm: 4, maxMem: 192, memMax: 8000, chipset: 'Z790',  pcie: '5.0', price: 1899, needBios: [] },
    { id: 'b760i',    name: '华硕 ROG STRIX B760-I',       sub: 'ITX · DDR5 · 小钢炮搭档', socket: 'LGA1700', mem: 'DDR5', form: 'ITX', m2: 2, dimm: 2, maxMem: 96,  memMax: 7600, chipset: 'B760',  pcie: '5.0', price: 1799, needBios: [] },
    { id: 'b860m',    name: '微星 PRO B860M-A DDR5',       sub: 'M-ATX · DDR5 · 新平台', socket: 'LGA1851', mem: 'DDR5', form: 'M-ATX', m2: 2, dimm: 4, maxMem: 128, memMax: 6800, chipset: 'B860',  pcie: '5.0', price: 1099, needBios: [] },
    { id: 'z890-p',   name: '微星 PRO Z890-P DDR5',        sub: 'ATX · DDR5 · M.2×4',   socket: 'LGA1851', mem: 'DDR5', form: 'ATX',   m2: 4, dimm: 4, maxMem: 192, memMax: 8800, chipset: 'Z890',  pcie: '5.0', price: 1699, needBios: [] },
    { id: 'z890-a',   name: '华硕 ROG STRIX Z890-A',       sub: 'ATX · DDR5 · M.2×5',   socket: 'LGA1851', mem: 'DDR5', form: 'ATX',   m2: 5, dimm: 4, maxMem: 256, memMax: 9200, chipset: 'Z890',  pcie: '5.0', price: 2799, needBios: [] },
    { id: 'a620i',    name: '华擎 A620I Lightning WIFI',   sub: 'ITX · DDR5 · 低价上车', socket: 'AM5',     mem: 'DDR5', form: 'ITX',   m2: 1, dimm: 2, maxMem: 64,  memMax: 6000, chipset: 'A620',  pcie: '4.0', price: 1099, needBios: ['r5-9600x', 'r7-9700x', 'r9-9900x', 'r9-9950x'] },
    { id: 'b650m',    name: '微星 MAG B650M MORTAR WIFI',  sub: 'M-ATX · DDR5 · 甜点首选', socket: 'AM5',   mem: 'DDR5', form: 'M-ATX', m2: 2, dimm: 4, maxMem: 128, memMax: 6400, chipset: 'B650',  pcie: '4.0', price: 999,  needBios: ['r5-9600x', 'r7-9700x', 'r9-9900x', 'r9-9950x'] },
    { id: 'b850m',    name: '华硕 TUF GAMING B850M-PLUS',  sub: 'M-ATX · DDR5 · M.2×3', socket: 'AM5',     mem: 'DDR5', form: 'M-ATX', m2: 3, dimm: 4, maxMem: 192, memMax: 7200, chipset: 'B850',  pcie: '5.0', price: 1299, needBios: [] },
    { id: 'b850i',    name: '微星 MPG B850I EDGE TI',      sub: 'ITX · DDR5 · 高端小板', socket: 'AM5',     mem: 'DDR5', form: 'ITX',   m2: 2, dimm: 2, maxMem: 96,  memMax: 8000, chipset: 'B850',  pcie: '5.0', price: 1899, needBios: [] },
    { id: 'x870e-e',  name: '华硕 ROG STRIX X870E-E',      sub: 'ATX · DDR5 · 堆料到顶', socket: 'AM5',     mem: 'DDR5', form: 'ATX',   m2: 4, dimm: 4, maxMem: 256, memMax: 8400, chipset: 'X870E', pcie: '5.0', price: 3499, needBios: [] }
  ],

  gpu: [
    { id: 'igpu',       name: '先用核显（不装独显）',   sub: '省钱第一步，点亮即胜利', vram: 0,  tdp: 0,   len: 0,   slots: 0,   pcie: '-',   price: 0,    score: 5 },
    { id: 'rtx5060',    name: 'NVIDIA RTX 5060 8G',     sub: '8GB · 1080P 入门新卡',  vram: 8,  tdp: 145, len: 245, slots: 2,   pcie: '5.0', price: 2899, base: 1999, score: 45 },
    { id: 'b580',       name: 'Intel Arc B580 12G',     sub: '12GB GDDR6 · 入门甜点', vram: 12, tdp: 190, len: 272, slots: 2,   pcie: '4.0', price: 2199, base: 1799, score: 50 },
    { id: 'rtx4060',    name: 'NVIDIA RTX 4060 8G',     sub: '8GB · 1080P 省电首选',  vram: 8,  tdp: 115, len: 242, slots: 2,   pcie: '4.0', price: 2699, base: 2199, score: 52 },
    { id: 'rx6750xt',   name: '蓝宝石 RX 6750 XT 12G',  sub: '12GB · 2K 实用主义',    vram: 12, tdp: 230, len: 267, slots: 2.5, pcie: '4.0', price: 2599, base: 1899, score: 55 },
    { id: 'rtx5060ti',  name: 'NVIDIA RTX 5060 Ti 16G', sub: '16GB · PCIe5.0×8',      vram: 16, tdp: 180, len: 250, slots: 2,   pcie: '5.0', price: 4299, base: 2999, score: 62 },
    { id: 'rtx5070',    name: 'NVIDIA RTX 5070 12G',    sub: '12GB GDDR7 · DLSS4',    vram: 12, tdp: 250, len: 276, slots: 2,   pcie: '5.0', price: 6499, base: 4499, score: 78 },
    { id: 'rx9070',     name: 'AMD RX 9070 16G',        sub: '16GB · RDNA4 甜点',     vram: 16, tdp: 220, len: 300, slots: 2.5, pcie: '5.0', price: 6299, base: 4499, score: 80 },
    { id: 'rx9070xt',   name: 'AMD RX 9070 XT 16G',     sub: '16GB · RDNA4 次旗舰',   vram: 16, tdp: 304, len: 325, slots: 3,   pcie: '5.0', price: 6999, base: 4999, score: 88 },
    { id: 'rtx5070ti',  name: 'NVIDIA RTX 5070 Ti 16G', sub: '16GB · 2K 拉满',        vram: 16, tdp: 300, len: 330, slots: 3,   pcie: '5.0', price: 8999, base: 6299, score: 88 },
    { id: 'rtx5080',    name: 'NVIDIA RTX 5080 16G',    sub: '16GB · 4K 可玩',        vram: 16, tdp: 360, len: 336, slots: 3,   pcie: '5.0', price: 12999, base: 8999, score: 95 },
    { id: 'rtx4090',    name: 'NVIDIA RTX 4090 24G',    sub: '24GB · 上一代卡皇',     vram: 24, tdp: 450, len: 357, slots: 3.5, pcie: '4.0', price: 19999, base: 15999, score: 97 },
    { id: 'rtx5090',    name: 'NVIDIA RTX 5090 32G',    sub: '32GB · 当代卡皇',       vram: 32, tdp: 575, len: 358, slots: 3.5, pcie: '5.0', price: 26999, base: 16999, score: 100 }
  ],

  ram: [
    { id: 'd4-16',  name: '16GB DDR4 3200（8G×2）',  sub: '够用党 · 双通道',     type: 'DDR4', cap: 16, sticks: 2, freq: 3200, price: 699,  base: 199 },
    { id: 'd4-32',  name: '32GB DDR4 3600（16G×2）', sub: '老平台升级首选',      type: 'DDR4', cap: 32, sticks: 2, freq: 3600, price: 1299, base: 369 },
    { id: 'd5-16',  name: '16GB DDR5 6000（8G×2）',  sub: '入门 DDR5 · 双通道',  type: 'DDR5', cap: 16, sticks: 2, freq: 6000, price: 1499, base: 329 },
    { id: 'd5-32',  name: '32GB DDR5 6000（16G×2）', sub: '主流游戏标配',        type: 'DDR5', cap: 32, sticks: 2, freq: 6000, price: 3299, base: 599 },
    { id: 'd5-48',  name: '48GB DDR5 6400（24G×2）', sub: '非对称容量 · 甜点',   type: 'DDR5', cap: 48, sticks: 2, freq: 6400, price: 3799, base: 899 },
    { id: 'd5-32h', name: '32GB DDR5 8000（16G×2）', sub: '高频条 · 需板 U 都顶', type: 'DDR5', cap: 32, sticks: 2, freq: 8000, price: 3699, base: 1099 },
    { id: 'd5-64',  name: '64GB DDR5 6000（32G×2）', sub: '生产力 / 本地大模型',  type: 'DDR5', cap: 64, sticks: 2, freq: 6000, price: 6399, base: 1199 },
    { id: 'd5-96',  name: '96GB DDR5 6400（48G×2）', sub: 'AI 工作站级内存',      type: 'DDR5', cap: 96, sticks: 2, freq: 6400, price: 9499, base: 1899 }
  ],

  ssd: [
    { id: 'p310-1t',   name: '致态 TiPlus 5000 1TB',   sub: 'PCIe4.0 · 入门够用',   pcie: '4.0', cap: 1, price: 459,  base: 299 },
    { id: 'tiplus-1t', name: '致态 TiPlus7100 1TB',    sub: 'PCIe4.0 · 读7000MB/s', pcie: '4.0', cap: 1, price: 599,  base: 399 },
    { id: 'kioxia-1t', name: '铠侠 EXCERIA PRO 1TB',   sub: 'PCIe4.0 · 原厂颗粒',   pcie: '4.0', cap: 1, price: 699,  base: 469 },
    { id: 'sn850x-2t', name: '西数 SN850X 2TB',        sub: 'PCIe4.0 · 游戏加载快', pcie: '4.0', cap: 2, price: 1699, base: 1099 },
    { id: '990pro-2t', name: '三星 990 PRO 2TB',       sub: 'PCIe4.0 · 旗舰级',     pcie: '4.0', cap: 2, price: 1899, base: 1199 },
    { id: 't700-2t',   name: '英睿达 T700 2TB',        sub: 'PCIe5.0 · 读12400MB/s', pcie: '5.0', cap: 2, price: 2199, base: 1499 },
    { id: 'sn850x-4t', name: '西数 SN850X 4TB',        sub: 'PCIe4.0 · 仓库盘',     pcie: '4.0', cap: 4, price: 3199, base: 1999 }
  ],

  cooler: [
    { id: 'stock',   name: '原装散热器 / 入门下压', sub: '高度 70mm · 压得住不？', type: 'air', height: 70,  rad: null, tdpLimit: 65,  sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1851'], noise: 38, price: 0 },
    { id: 'ax120',   name: '利民 AX120 R SE',       sub: '单塔风冷 · 高度 154mm',  type: 'air', height: 154, rad: null, tdpLimit: 180, sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1851'], noise: 32, price: 99 },
    { id: 'ak620',   name: '利民 AK620 双塔',       sub: '双塔风冷 · 高度 162mm',  type: 'air', height: 162, rad: null, tdpLimit: 260, sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1851'], noise: 30, price: 259 },
    { id: 'l9x65',   name: '猫头鹰 NH-L9x65',       sub: 'ITX 下压 · 高度 65mm',   type: 'air', height: 65,  rad: null, tdpLimit: 95,  sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1851'], noise: 34, price: 399 },
    { id: 'fs140',   name: '利民 FS140 旗舰双塔',   sub: '双塔风冷 · 高度 158mm',  type: 'air', height: 158, rad: null, tdpLimit: 280, sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1851'], noise: 31, price: 299 },
    { id: 'aio240',  name: '九州风神 水元素 240',   sub: '240 一体式水冷',         type: 'aio', height: 0,   rad: 240,  tdpLimit: 250, sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1851'], noise: 28, price: 399 },
    { id: 'aio280',  name: '追风者 GLACIER ONE 280', sub: '280 一体式水冷',        type: 'aio', height: 0,   rad: 280,  tdpLimit: 300, sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1851'], noise: 27, price: 599 },
    { id: 'aio360',  name: '恩杰 Kraken Elite 360', sub: '360 一体式水冷 · 带屏',  type: 'aio', height: 0,   rad: 360,  tdpLimit: 350, sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1851'], noise: 26, price: 899 }
  ],

  chassis: [
    { id: 'laevatain', name: '微星 MAG LAEVATAIN 雷万汀', sub: '套装神箱 · 前置 ARGB 灯条', forms: ['ATX', 'M-ATX', 'ITX'], maxGpu: 360, maxCooler: 160, rads: [240, 280, 360], psu: ['ATX', 'SFX'], slots: 7, price: 259 },
    { id: 'p400a',     name: '追风者 P400A 数码版',       sub: 'ATX 中塔 · 散热通透',      forms: ['ATX', 'M-ATX', 'ITX'], maxGpu: 380, maxCooler: 160, rads: [240, 280, 360], psu: ['ATX', 'SFX'], slots: 7, price: 399 },
    { id: 'd31',       name: '乔思伯 D31 MESH',           sub: '紧凑 M-ATX · 桌面友好',    forms: ['M-ATX', 'ITX'],        maxGpu: 320, maxCooler: 165, rads: [240],         psu: ['ATX', 'SFX'], slots: 4, price: 499 },
    { id: 'm1',        name: '先马 平头哥 M1',            sub: 'ITX 小钢炮 · 极致体积',    forms: ['ITX'],                maxGpu: 320, maxCooler: 130, rads: [240],         psu: ['SFX', 'ATX'], slots: 3, price: 299 },
    { id: 'q58',       name: '乔思伯 Q58',                sub: 'ITX 手提箱 · 玻璃双侧透',  forms: ['ITX'],                maxGpu: 330, maxCooler: 130, rads: [240],         psu: ['SFX'],        slots: 3, price: 499 },
    { id: 'a4',        name: 'FormD T1 同款 A4 结构',     sub: 'ITX 极限 · 只能下压散热',  forms: ['ITX'],                maxGpu: 335, maxCooler: 70,  rads: [],            psu: ['SFX'],        slots: 3, price: 899 },
    { id: 'o11',       name: '联力 包豪斯 O11 Dynamic',   sub: '海景房 · 双面玻璃',        forms: ['ATX', 'M-ATX', 'ITX'], maxGpu: 420, maxCooler: 155, rads: [240, 280, 360], psu: ['ATX', 'SFX'], slots: 8, price: 899 },
    { id: 'meshify2',  name: '分形工艺 Meshify 2',        sub: 'ATX 全塔 · 风道教科书',    forms: ['ATX', 'M-ATX', 'ITX'], maxGpu: 460, maxCooler: 185, rads: [240, 280, 360, 420], psu: ['ATX'], slots: 9, price: 1099 }
  ],

  psu: [
    { id: 'psu550',  name: '550W 铜牌电源',       sub: '入门够用 · 直出线',   watts: 550,  form: 'ATX', eff: '铜牌', modular: false, price: 299 },
    { id: 'psu650',  name: '650W 金牌全模组',     sub: '甜点功率 · ATX3.0',   watts: 650,  form: 'ATX', eff: '金牌', modular: true,  price: 399 },
    { id: 'psu750',  name: '750W 金牌全模组',     sub: '主流显卡安心保有量',  watts: 750,  form: 'ATX', eff: '金牌', modular: true,  price: 549 },
    { id: 'psu850',  name: '850W 金牌全模组',     sub: '高功耗显卡标配',      watts: 850,  form: 'ATX', eff: '金牌', modular: true,  price: 699 },
    { id: 'psu1000', name: '1000W 白金 ATX3.1',   sub: '旗舰卡的安全线',      watts: 1000, form: 'ATX', eff: '白金', modular: true,  price: 899 },
    { id: 'psu1200', name: '1200W 钛金 ATX3.1',   sub: '双卡时代遗物（？）',  watts: 1200, form: 'ATX', eff: '钛金', modular: true,  price: 1299 },
    { id: 'sfx650',  name: '650W SFX 金牌全模',   sub: 'ITX 专用 · 小身材',   watts: 650,  form: 'SFX', eff: '金牌', modular: true,  price: 599 },
    { id: 'sfx850',  name: '850W SFX-L 白金',     sub: '小钢炮也能上旗舰卡',  watts: 850,  form: 'SFX', eff: '白金', modular: true,  price: 899 }
  ]
};

const SLOT_LABEL = {
  cpu: '处理器', board: '主板', gpu: '显卡', ram: '内存',
  ssd: '固态硬盘', cooler: '散热器', chassis: '机箱', psu: '电源'
};

const SLOT_ICON = {
  cpu: '🧠', board: '🔲', gpu: '🎮', ram: '📊',
  ssd: '💾', cooler: '❄️', chassis: '📦', psu: '🔌'
};

const CATEGORY_HINT = {
  cpu: '选错了没关系，兼容性我会替你兜底',
  board: '插槽和内存代数必须和 CPU 对上',
  gpu: '长度和厚度超过机箱限制会装不进去 · 现在整体在高位',
  ram: 'DDR4 / DDR5 与频率上限由主板决定 · 本轮涨价最狠',
  ssd: '数量不能超过主板的 M.2 接口数 · NAND 也在涨',
  cooler: '塔风看高度，水冷看排数，还要看扣具',
  chassis: '决定能塞多大的板、卡和电源',
  psu: '整机功耗建议留 25% 以上余量'
};

const PRESETS = [
  {
    id: 'student',
    name: '学生党性价比',
    desc: '入门 2K · 内存先上 16G',
    build: { cpu: 'r5-7500f', board: 'b650m', gpu: 'rx6750xt', ram: 'd5-16', ssd: 'tiplus-1t', ssdCount: 1, cooler: 'ax120', chassis: 'laevatain', psu: 'psu650' }
  },
  {
    id: 'game',
    name: '主流 2K 游戏机',
    desc: '2K 拉满 · 钱包会疼',
    build: { cpu: 'r7-9800x3d', board: 'b850m', gpu: 'rtx5070ti', ram: 'd5-32', ssd: 'sn850x-2t', ssdCount: 1, cooler: 'aio360', chassis: 'o11', psu: 'psu850' }
  },
  {
    id: 'ai',
    name: '本地 AI 工作站',
    desc: '大显存 · 大模型推理',
    build: { cpu: 'u9-285k', board: 'z890-a', gpu: 'rtx5090', ram: 'd5-96', ssd: '990pro-2t', ssdCount: 2, cooler: 'aio360', chassis: 'o11', psu: 'psu1200' }
  },
  {
    id: 'itx',
    name: '桌面 ITX 小钢炮',
    desc: '小体积 · 只占半张 A4',
    build: { cpu: 'r5-9600x', board: 'b850i', gpu: 'rtx5070', ram: 'd5-32', ssd: '990pro-2t', ssdCount: 1, cooler: 'aio240', chassis: 'q58', psu: 'sfx650' }
  },
  {
    id: 'cheap',
    name: '千元捡垃圾',
    desc: '老平台 · 现在也不便宜了',
    build: { cpu: 'r5-5600', board: 'b450m', gpu: 'b580', ram: 'd4-32', ssd: 'kioxia-1t', ssdCount: 1, cooler: 'ax120', chassis: 'p400a', psu: 'psu550' }
  },
  {
    id: 'realrig',
    name: '真机复刻',
    desc: 'B550M + RX 6750 XT · 雷万汀',
    build: { cpu: 'r5-5600', board: 'b550m', gpu: 'rx6750xt', ram: 'd4-32', ssd: 'sn850x-2t', ssdCount: 1, cooler: 'fs140', chassis: 'laevatain', psu: 'psu750' }
  }
];

/* 冷知识 / 避坑提示，随机展示 */
const TRIVIA = [
  '硅脂不是涂越多越好，黄豆大小一颗压平就够，涂太厚反而成保温层。',
  '内存插 2、4 槽（A2/B2）才是官方推荐位，插 1、3 槽信号反射更严重。',
  '电源 12VHPWR 接口要插到底听到「咔」一声，虚接是烧接口的第一原因。',
  'ITX 装机顺序永远是：先接主板所有线，再装显卡，最后塞电源。',
  '机箱风扇遵循「前进后出、下进上出」，正压（进风>出风）能减少积灰。',
  'PCIe 5.0 的固态装在 PCIe 4.0 插槽上能正常用，只是跑不满标称速度。',
  '风冷散热器的塔身方向要朝机箱后方排风，装反了等于把热风吹向显卡。',
  '新主板第一次点亮慢是正常的，DDR5 内存训练可能要等 30～60 秒。',
  '显卡支柱（显卡支架）不是智商税，3 槽以上的重卡长期悬空会弯 PCB。',
  '清灰用冷风档吹，吸尘器刷头可能在风扇上产生静电击穿元件。',
  '装完机点不亮，八成是内存没插到底，其次是忘了接 CPU 8pin 供电。',
  'AMD AM5 平台的 EXPO 和 Intel 的 XMP 都需要手动开启，不然内存默认跑 4800。',
  '这轮涨价的根子不在矿潮而在 AI：AI 服务器吃掉约七成先进存储产能，HBM 抢走了晶圆。',
  '内存高位时最划算的操作不是硬等，而是先买一条 16G 顶着，后面补一条同型号照样双通道。'
];

/* 战斗力称号池（按分数区间取，梗味文案） */
const TITLES = [
  { min: 92, name: '泰坦 · 机房之主', quip: '这机器跑分的时候，你家电表倒转', tag: '预算是什么？' },
  { min: 84, name: '王者 · 帧数暴君', quip: '4K 全高还能开录屏，显卡在替你打工', tag: '显卡比 CPU 贵三倍' },
  { min: 74, name: '钻石 · 高帧信徒', quip: '2K 拉满，队友问你是不是开了挂', tag: '显示器该换了' },
  { min: 64, name: '铂金 · 甜点大师', quip: '钱花在刀刃上，帧数花在刀刃上', tag: '性价比本人' },
  { min: 52, name: '黄金 · 务实派',   quip: '该有的都有，不该有的也别想', tag: '够用主义' },
  { min: 40, name: '白银 · 亮机战士', quip: '开机就是胜利，剩下的靠脑补', tag: '战未来' },
  { min: 0,  name: '青铜 · 电子垃圾', quip: '建议先把奶茶预算省下来再战一轮', tag: '捡垃圾快乐' }
];

/* 装机引导步骤 */
const BUILD_STEPS = [
  { key: 'board', title: '把主板请出静电袋', text: '放在主板纸盒上操作，别在塑料袋或地毯上——静电是看不见的杀手。', tip: '先装 CPU、内存、M.2，再把主板进机箱，这是最省事的顺序。' },
  { key: 'cpu',   title: '安装处理器', text: 'CPU 左下角有个小三角，对齐主板插槽上的三角，放下去就行，别按、别撬。', tip: '手指只捏 CPU 边缘，别摸触点。' },
  { key: 'cooler', title: '抹硅脂 / 上散热', text: '黄豆大小一颗硅脂，散热器对角逐步拧紧，别一次旋死。', tip: '别忘了把散热风扇接到 CPU_FAN，否则开机 BIOS 会报风扇错误。' },
  { key: 'ram',   title: '插内存', text: '优先插 A2 / B2（第 2、4 槽），两端卡扣会「咔」一声自动扣上。', tip: '这年头内存比金子贵，插之前先洗手，拿稳别摔。' },
  { key: 'ssd',   title: '装固态与接线', text: 'M.2 斜插到底再压平，用螺丝固定，别忘了撕掉散热马甲的贴膜。', tip: '主板自带的 M.2 散热片记得装上。' },
  { key: 'chassis', title: '主板进机箱', text: '先装好 I/O 挡板，对准铜柱放平，9 颗螺丝对角锁。', tip: '螺丝别拧太紧，主板有点余量更不容易弯。' },
  { key: 'psu',   title: '装电源、走线', text: '风扇朝下（机箱底部有防尘网）或朝上视风道而定，先接 24pin 与 CPU 8pin。', tip: '模组线先接主板一端，理线真的会让人上瘾。' },
  { key: 'gpu',   title: '插显卡', text: '拆掉对应挡板，PCIe 槽卡扣要听到咔哒，尾部的螺丝必须锁。', tip: '供电线不要转接，8pin 就是 8pin。' },
  { key: 'boot',  title: '通电 · 自检', text: '接好显示器（一定插显卡接口，不是主板接口），开机等它自己训练内存。', tip: '第一次点亮慢是正常的，DDR5 可能要等一分钟。' }
];

/* 行情说明，展示在溢价模块底部 */
const MARKET_NOTE = '2026-10 行情：AI 服务器挤占 DRAM / NAND 产能，内存、固态、显卡同步涨价，短期看不到回落信号。';

if (typeof module !== 'undefined') {
  module.exports = { PARTS, SLOT_LABEL, SLOT_ICON, CATEGORY_HINT, PRESETS, TRIVIA, TITLES, BUILD_STEPS, MARKET_NOTE };
}
