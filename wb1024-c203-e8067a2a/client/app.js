
  (function () {
    'use strict';

    /* =========================================================
     * 一、气球数据（balloons 数组）
     * 每个对象字段固定为：
     *   id      编号（数字，唯一）
     *   name    名称（字符串）
     *   type    分类：普通 / 陶瓷 / 铅 / MOAB / BFB / ZOMG 等
     *   hp      血量（数字）
     *   speed   移速相对值（数字，红气球 = 1.0）
     *   round   首次出现回合（字符串，如 '第1回合'）
     *   traits  特性标签数组，如 ['基础', '爆炸免疫']
     *   resist  抗性列表（字符串数组）
     *   weak    弱点列表（字符串数组）
     *   desc    详细介绍 / 行为机制（字符串）
     * ========================================================= */
    const balloons = [
      {
        id: 1,
        name: '红气球',
        type: '普通',
        hp: 1,
        speed: 1.0,
        round: '第1回合',
        traits: ['基础'],
        resist: ['无'],
        weak: ['一切攻击手段'],
        desc: '最基础的气球，全游戏数量最多、血量最低。它是整条普通气球链条的终点，被击破后不会释放其他气球，任何能攻击空中目标的防御塔都能一击消灭。'
      },
      {
        id: 2,
        name: '蓝气球',
        type: '普通',
        hp: 1,
        speed: 1.4,
        round: '第2回合',
        traits: ['基础'],
        resist: ['无'],
        weak: ['一切攻击手段'],
        desc: '击破后释放 1 只红气球。速度比红气球快约 40%，是第 2 回合就登场的老朋友。'
      },
      {
        id: 3,
        name: '绿气球',
        type: '普通',
        hp: 1,
        speed: 1.8,
        round: '第3回合',
        traits: ['基础'],
        resist: ['无'],
        weak: ['一切攻击手段'],
        desc: '击破后释放 1 只蓝气球。速度进一步提升，前期成堆出现时要注意防御塔的穿透（Pierce）是否足够。'
      },
      {
        id: 4,
        name: '黄气球',
        type: '普通',
        hp: 1,
        speed: 3.2,
        round: '第4回合',
        traits: ['基础'],
        resist: ['无'],
        weak: ['一切攻击手段'],
        desc: '击破后释放 1 只绿气球。速度达到红气球的 3.2 倍，射速慢的防御塔很容易漏气。'
      },
      {
        id: 5,
        name: '粉气球',
        type: '普通',
        hp: 1,
        speed: 3.5,
        round: '第15回合',
        traits: ['基础'],
        resist: ['无'],
        weak: ['一切攻击手段'],
        desc: '击破后释放 1 只黄气球。基础五层气球中速度最快的一档（3.5 倍），通常需要减速类塔配合才能稳定拦截。'
      },
      {
        id: 6,
        name: '黑气球',
        type: '普通',
        hp: 1,
        speed: 1.8,
        round: '第20回合',
        traits: ['基础', '爆炸免疫'],
        resist: ['爆炸类伤害'],
        weak: ['锐器', '能量', '火焰'],
        desc: '铅灰色的气球，免疫一切爆炸类伤害（炸弹、迫击炮等完全无效），被击破后释放 2 只粉气球。是很多纯爆炸流派遇到的第一道坎。'
      },
      {
        id: 7,
        name: '白气球',
        type: '普通',
        hp: 1,
        speed: 2.0,
        round: '第22回合',
        traits: ['基础', '冰冻免疫'],
        resist: ['冰冻、冻结类伤害'],
        weak: ['一切攻击手段'],
        desc: '免疫冰冻类伤害（冰 Monkey 的冰锥等无法将其冻结），但可以被正常伤害击破，被击破后释放 2 只粉气球。'
      },
      {
        id: 8,
        name: '紫气球',
        type: '普通',
        hp: 1,
        speed: 3.0,
        round: '第25回合',
        traits: ['基础', '能量免疫'],
        resist: ['火焰', '能量', '等离子'],
        weak: ['锐器', '爆炸'],
        desc: '对火焰、能量与等离子类伤害免疫，需要用锐器或爆炸手段击破，被击破后释放 2 只粉气球。专治魔法 / 火焰流派。'
      },
      {
        id: 9,
        name: '铅气球',
        type: '铅',
        hp: 1,
        speed: 1.0,
        round: '第28回合',
        traits: ['铅层'],
        resist: ['锐器', '冰冻', '能量'],
        weak: ['爆炸', '火焰', '等离子'],
        desc: '铅制外壳免疫锐器、冰冻与能量伤害，只能靠爆炸、火焰、等离子类防御塔击破。移动速度与红气球相同，但被击破后会释放 2 只黑气球，是中期最经典的漏气球之一。'
      },
      {
        id: 10,
        name: '彩虹气球',
        type: '普通',
        hp: 1,
        speed: 2.2,
        round: '第35回合',
        traits: ['基础', '彩虹'],
        resist: ['无'],
        weak: ['一切攻击手段'],
        desc: '本身没有任何抗性，但“内涵”丰富：被击破后释放 2 只斑马气球，每只斑马又会释放黑、白气球各一只。考验的是群体的层级清理能力。'
      },
      {
        id: 11,
        name: '陶瓷气球',
        type: '陶瓷',
        hp: 10,
        speed: 2.5,
        round: '第38回合',
        traits: ['陶瓷'],
        resist: ['耐久外壳', '强化变体'],
        weak: ['高单体 DPS', '破甲类防御塔'],
        desc: '第一种拥有多段血量的气球：陶瓷外壳有 10 点耐久（强化陶瓷为 20 点），被完全击破后释放 2 个彩虹气球（81 回合及以后只释放 1 个）。是中期最常见的 DPS 检测器。'
      },
      {
        id: 12,
        name: '迷彩气球',
        type: '普通',
        hp: 1,
        speed: 1.4,
        round: '第24回合',
        traits: ['迷彩'],
        resist: ['无侦测能力的防御塔'],
        weak: ['具备迷彩侦测的防御塔'],
        desc: '迷彩属性示例（迷彩可附加于任意普通气球）。绝大多数防御塔无法侦测迷彩气球，会直接忽略它，只有具备迷彩侦测能力的塔（如忍者猴、狙击手猴的反迷彩升级）才能锁定。标准模式第 24 回合首次出现迷彩气球。'
      },
      {
        id: 13,
        name: '再生气球',
        type: '普通',
        hp: 1,
        speed: 3.2,
        round: '第17回合',
        traits: ['再生'],
        resist: ['被击破后再生'],
        weak: ['持续高输出', '去除再生类能力'],
        desc: '再生属性示例（心形标记，可附加于陶瓷及以下的普通气球）。被击破后不会消失，每 3 秒恢复一层；火力不足时会被反复恢复层数。标准模式第 17 回合首次出现再生气球。'
      },
      {
        id: 14,
        name: 'MOAB',
        type: 'MOAB',
        hp: 200,
        speed: 1.0,
        round: '第40回合',
        traits: ['MOAB级', '巨型'],
        resist: ['冰冻', '眩晕', '胶水', '击退'],
        weak: ['可攻击 MOAB 级敌人的防御塔'],
        desc: 'MOAB（Mother Of All Balloons）是第一种 MOAB 级飞艇，200 点基础血量，被击破后释放 4 个陶瓷气球。只有可攻击 MOAB 级敌人的防御塔能对其造成伤害，免疫冰冻、眩晕、胶水与绝大多数击退；拥有 4 个伤害阶段，81 回合后血量还会随回合成长。'
      },
      {
        id: 15,
        name: 'BFB',
        type: 'BFB',
        hp: 700,
        speed: 0.25,
        round: '第60回合',
        traits: ['MOAB级', '巨型'],
        resist: ['冰冻', '眩晕', '胶水', '击退'],
        weak: ['可攻击 MOAB 级敌人的防御塔'],
        desc: 'BFB（Brutal Floating Behemoth）是比 MOAB 更大的飞艇，700 点基础血量，被击破后释放 4 个 MOAB。速度只有红气球的 0.25 倍，但血量极高，一旦漏过基本意味着失败。'
      },
      {
        id: 16,
        name: 'ZOMG',
        type: 'ZOMG',
        hp: 4000,
        speed: 0.18,
        round: '第80回合',
        traits: ['MOAB级', '巨型'],
        resist: ['冰冻', '眩晕', '胶水', '击退'],
        weak: ['可攻击 MOAB 级敌人的防御塔'],
        desc: 'ZOMG（Zeppelin Of Monstrous Gargantuaness）拥有 4000 点基础血量，被击破后释放 4 个 BFB。速度极慢（0.18 倍）但血量恐怖，需要成建制的高级反甲火力才能击落。'
      },
      {
        id: 17,
        name: 'DDT',
        type: 'MOAB',
        hp: 400,
        speed: 2.64,
        round: '第90回合',
        traits: ['MOAB级', '巨型', '迷彩', '铅层', '爆炸免疫', '再生'],
        resist: ['锐器', '冰冻', '能量', '爆炸', '迷彩侦测'],
        weak: ['可攻击 MOAB 级敌人的反迷彩火力'],
        desc: 'DDT（Dark Dirigible Titan）是 MOAB 级的“缝合怪”：同时拥有黑气球的爆炸免疫、铅气球的锐器免疫、白气球的冰冻免疫，外加迷彩与再生属性，速度高达 2.64 倍。400 点血量，被击破后释放 4 个迷彩再生陶瓷，是后期最烦人的敌人之一。'
      }
      // ↑ 追加新气球时，在上方这个逗号后面继续添加对象即可
    ];

    /* =========================================================
     * 【如何批量追加更多气球数据】
     * 1. 复制下面任意一个对象，粘贴到 balloons 数组末尾（注意补逗号）；
     * 2. 九个字段必须保持齐全（id / name / type / hp / speed / round / traits / resist / weak / desc）；
     * 3. 批量导入也可以直接写：
     *      balloons.push(
     *        { id: 18, name: '斑马气球', type: '普通', hp: 1, speed: 1.8, round: '第26回合',
     *          traits: ['基础', '爆炸免疫', '冰冻免疫'], resist: ['爆炸', '冰冻'],
     *          weak: ['锐器', '能量', '火焰'],
     *          desc: '被击破后同时释放 1 只白气球和 1 只黑气球。' },
     *        { id: 19, name: 'BAD', type: 'ZOMG', ... }
     *      );
     * 4. 新增“特性标签”时，去下方 TRAIT_STYLE 里补一条配色即可
     *    （迷彩紫 / 铅灰 / 陶瓷棕 / MOAB红 / 再生绿，其余按需扩展）；
     * 5. 想按“类型”筛选出新分类时，把类型名加进 TYPE_ORDER 即可。
     * ========================================================= */

    /* =========================================================
     * 二、常量：配色表 / 筛选器配置 / 工具函数
     * ========================================================= */
    // 类型筛选按钮的展示顺序（数据里出现哪种类型就显示哪种）
    const TYPE_ORDER = ['普通', '陶瓷', '铅', 'MOAB', 'BFB', 'ZOMG'];
    // 基础五层气球名单（用于“按等级筛选”分组）
    const BASIC_NAMES = ['红气球', '蓝气球', '绿气球', '黄气球', '粉气球'];

    // 特性标签配色：迷彩紫 / 铅灰 / 陶瓷棕 / MOAB红 / 再生绿 …
    const TRAIT_STYLE = {
      '迷彩':     'bg-purple-100 text-purple-700 dark:bg-purple-400/20 dark:text-purple-300',
      '铅层':     'bg-gray-200 text-gray-700 dark:bg-gray-400/20 dark:text-gray-300',
      '陶瓷':     'bg-amber-100 text-amber-800 dark:bg-amber-400/20 dark:text-amber-300',
      'MOAB级':   'bg-red-100 text-red-700 dark:bg-red-400/20 dark:text-red-300',
      'MOAB':     'bg-red-100 text-red-700 dark:bg-red-400/20 dark:text-red-300',
      '再生':     'bg-green-100 text-green-700 dark:bg-green-400/20 dark:text-green-300',
      '冰冻免疫': 'bg-sky-100 text-sky-700 dark:bg-sky-400/20 dark:text-sky-300',
      '爆炸免疫': 'bg-slate-200 text-slate-700 dark:bg-slate-400/20 dark:text-slate-300',
      '能量免疫': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-400/20 dark:text-fuchsia-300',
      '基础':     'bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300',
      '彩虹':     'bg-gradient-to-r from-rose-100 via-amber-100 to-sky-100 text-slate-700 dark:from-rose-400/20 dark:via-amber-400/20 dark:to-sky-400/20 dark:text-slate-200',
      '巨型':     'bg-orange-100 text-orange-700 dark:bg-orange-400/20 dark:text-orange-300'
    };
    const TRAIT_FALLBACK = 'bg-slate-100 text-slate-600 dark:bg-slate-600/40 dark:text-slate-300';

    // 类型徽章配色
    const TYPE_STYLE = {
      '普通': 'bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300',
      '陶瓷': 'bg-amber-100 text-amber-800 dark:bg-amber-400/20 dark:text-amber-300',
      '铅':   'bg-gray-200 text-gray-700 dark:bg-gray-400/20 dark:text-gray-300',
      'MOAB': 'bg-red-100 text-red-700 dark:bg-red-400/20 dark:text-red-300',
      'BFB':  'bg-red-200 text-red-800 dark:bg-red-400/25 dark:text-red-300',
      'ZOMG': 'bg-rose-200 text-rose-900 dark:bg-rose-400/25 dark:text-rose-300'
    };
    const TYPE_FALLBACK = 'bg-slate-100 text-slate-600 dark:bg-slate-600/40 dark:text-slate-300';

    // 属性筛选器：key -> { label: 按钮文字, test: 匹配函数 }
    const PROP_FILTERS = {
      camo:    { label: '迷彩',     test: b => b.traits.includes('迷彩') },
      lead:    { label: '铅层',     test: b => b.type === '铅' || b.traits.includes('铅层') },
      ceramic: { label: '陶瓷',     test: b => b.type === '陶瓷' || b.traits.includes('陶瓷') },
      moab:    { label: 'MOAB级',   test: b => b.traits.includes('MOAB级') },
      regrow:  { label: '再生',     test: b => b.traits.includes('再生') },
      ice:     { label: '冰冻免疫', test: b => b.traits.includes('冰冻免疫') },
      boom:    { label: '爆炸免疫', test: b => b.traits.includes('爆炸免疫') },
      energy:  { label: '能量免疫', test: b => b.traits.includes('能量免疫') }
    };
    // 属性筛选按钮的“选中 / 未选中”配色
    const PROP_CHIP = {
      camo:    { on: 'border-purple-500 bg-purple-500 text-white',   off: 'border-slate-300 text-slate-500 hover:border-purple-400 hover:text-purple-500 dark:border-slate-600 dark:text-slate-400 dark:hover:text-purple-400' },
      lead:    { on: 'border-gray-500 bg-gray-500 text-white',       off: 'border-slate-300 text-slate-500 hover:border-gray-500 hover:text-gray-600 dark:border-slate-600 dark:text-slate-400 dark:hover:text-gray-300' },
      ceramic: { on: 'border-amber-700 bg-amber-700 text-white',     off: 'border-slate-300 text-slate-500 hover:border-amber-600 hover:text-amber-600 dark:border-slate-600 dark:text-slate-400 dark:hover:text-amber-400' },
      moab:    { on: 'border-red-500 bg-red-500 text-white',         off: 'border-slate-300 text-slate-500 hover:border-red-400 hover:text-red-500 dark:border-slate-600 dark:text-slate-400 dark:hover:text-red-400' },
      regrow:  { on: 'border-green-500 bg-green-500 text-white',     off: 'border-slate-300 text-slate-500 hover:border-green-500 hover:text-green-600 dark:border-slate-600 dark:text-slate-400 dark:hover:text-green-400' },
      ice:     { on: 'border-sky-500 bg-sky-500 text-white',         off: 'border-slate-300 text-slate-500 hover:border-sky-400 hover:text-sky-500 dark:border-slate-600 dark:text-slate-400 dark:hover:text-sky-400' },
      boom:    { on: 'border-slate-600 bg-slate-600 text-white',     off: 'border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-600 dark:border-slate-600 dark:text-slate-400 dark:hover:text-slate-300' },
      energy:  { on: 'border-fuchsia-500 bg-fuchsia-500 text-white', off: 'border-slate-300 text-slate-500 hover:border-fuchsia-400 hover:text-fuchsia-500 dark:border-slate-600 dark:text-slate-400 dark:hover:text-fuchsia-400' }
    };

    // HTML 转义（数据后续由用户维护，防注入更稳妥）
    const esc = s => String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    const traitClass = t => TRAIT_STYLE[t] || TRAIT_FALLBACK;
    const typeClass  = t => TYPE_STYLE[t] || TYPE_FALLBACK;

    // 根据 type / name 推导“等级分组”，供等级下拉筛选使用
    function levelGroup(b) {
      if (b.type === 'MOAB') return 'MOAB级';
      if (b.type === 'BFB' || b.type === 'ZOMG') return 'BFB级及以上';
      if (b.type === '陶瓷') return '陶瓷层';
      if (b.type === '铅') return '铅层';
      if (BASIC_NAMES.includes(b.name)) return '基础层';
      return '强化层';
    }

    /* =========================================================
     * 三、筛选状态与实时搜索
     * ========================================================= */
    const state = { q: '', level: 'all', types: new Set(), props: new Set() };

    function currentList() {
      const q = state.q.trim().toLowerCase();
      return balloons.filter(b => {
        // 1) 搜索：匹配名称 / 类型 / 特性标签
        if (q) {
          const hay = (b.name + ' ' + b.type + ' ' + b.traits.join(' ')).toLowerCase();
          if (!hay.includes(q)) return false;
        }
        // 2) 等级（单选）
        if (state.level !== 'all' && levelGroup(b) !== state.level) return false;
        // 3) 类型（多选，任选其一命中即可）
        if (state.types.size > 0 && !state.types.has(b.type)) return false;
        // 4) 属性（多选，任选其一命中即可）
        if (state.props.size > 0) {
          const hit = [...state.props].some(k => PROP_FILTERS[k].test(b));
          if (!hit) return false;
        }
        return true;
      });
    }

    /* =========================================================
     * 四、渲染：卡片 / 筛选标签 / 结果数量
     * ========================================================= */
    const grid       = document.getElementById('cardGrid');
    const emptyState = document.getElementById('emptyState');
    const resultCnt  = document.getElementById('resultCount');
    const typeChips  = document.getElementById('typeChips');
    const propChips  = document.getElementById('propChips');

    // 单张气球卡片
    function cardHTML(b) {
      const traits = b.traits.map(t =>
        `<span class="rounded-full px-2 py-0.5 text-[11px] font-medium ${traitClass(t)}">${esc(t)}</span>`).join('');
      return `
      <article class="balloon-card group flex cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500/60"
               data-id="${b.id}" tabindex="0" role="button" aria-label="查看 ${esc(b.name)} 的详细资料">


        <div class="relative mb-3 flex h-28 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-sky-100 via-indigo-100 to-purple-100 dark:from-slate-700 dark:via-slate-700 dark:to-slate-600">
          <span class="text-4xl opacity-70">🎈</span>
          <span class="absolute right-2 top-2 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-900/70 dark:text-slate-300">#${String(b.id).padStart(2, '0')}</span>
        </div>

        <!-- 名称 + 类型徽章 -->
        <div class="flex items-start justify-between gap-2">
          <h3 class="text-base font-bold leading-snug">${esc(b.name)}</h3>
          <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${typeClass(b.type)}">${esc(b.type)}</span>
        </div>

        <!-- 特性标签 -->
        <div class="mt-2 flex flex-wrap gap-1">${traits}</div>

        <!-- 核心数值：血量 / 移速 / 出场回合 -->
        <div class="mt-3 grid grid-cols-3 gap-2">
          <div class="rounded-lg bg-slate-50 px-2 py-1.5 text-center dark:bg-slate-700/50">
            <div class="text-[10px] text-slate-400">血量</div>
            <div class="text-sm font-bold text-rose-500 dark:text-rose-400">${esc(b.hp)}</div>
          </div>
          <div class="rounded-lg bg-slate-50 px-2 py-1.5 text-center dark:bg-slate-700/50">
            <div class="text-[10px] text-slate-400">移速</div>
            <div class="text-sm font-bold text-amber-500 dark:text-amber-400">${esc(b.speed)}x</div>
          </div>
          <div class="rounded-lg bg-slate-50 px-2 py-1.5 text-center dark:bg-slate-700/50">
            <div class="text-[10px] text-slate-400">出场回合</div>
            <div class="text-sm font-bold text-indigo-500 dark:text-indigo-400">${esc(b.round)}</div>
          </div>
        </div>

        <!-- 抗性 / 弱点 -->
        <div class="mt-3 space-y-1 text-[13px] leading-relaxed">
          <p class="flex gap-1.5"><span class="shrink-0">🛡</span><span><span class="text-slate-400">抗性：</span>${esc(b.resist.join('、')) || '无'}</span></p>
          <p class="flex gap-1.5"><span class="shrink-0">⚔️</span><span><span class="text-slate-400">弱点：</span>${esc(b.weak.join('、')) || '无'}</span></p>
        </div>

        <!-- 简介（最多两行，超出省略） -->
        <p class="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">${esc(b.desc)}</p>

        <div class="mt-3 text-center text-[11px] font-medium text-indigo-500 opacity-0 transition group-hover:opacity-100 dark:text-indigo-400">点击查看完整详情 →</div>
      </article>`;
    }

    // 筛选按钮（类型 / 属性共用）
    function chipHTML(group, key, label) {
      const active = group === 'type' ? state.types.has(key) : state.props.has(key);
      const cls = group === 'type'
        ? (active
            ? 'border-indigo-500 bg-indigo-500 text-white'
            : 'border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-500 dark:border-slate-600 dark:text-slate-400 dark:hover:text-indigo-400')
        : (active ? PROP_CHIP[key].on : PROP_CHIP[key].off);
      return `<button type="button" data-group="${group}" data-key="${key}" title="筛选：${esc(label)}"
                class="rounded-full border px-2.5 py-1 text-xs font-medium transition ${cls}">${esc(label)}</button>`;
    }

    function renderChips() {
      // 类型按钮：从数据动态收集，按 TYPE_ORDER 排序
      const types = TYPE_ORDER.filter(t => balloons.some(b => b.type === t));
      typeChips.innerHTML = types.map(t => chipHTML('type', t, t)).join('');
      // 属性按钮：按 PROP_FILTERS 配置生成
      propChips.innerHTML = Object.entries(PROP_FILTERS)
        .map(([k, f]) => chipHTML('prop', k, f.label)).join('');
    }

    function render() {
      const list = currentList();
      resultCnt.textContent = `共 ${list.length} / ${balloons.length} 只`;
      if (list.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
      }
      emptyState.classList.add('hidden');
      grid.innerHTML = list.map(cardHTML).join('');
    }

    /* =========================================================
     * 五、详情弹窗（原生 JS）
     * ========================================================= */
    const modal      = document.getElementById('modal');
    const modalMask  = document.getElementById('modalMask');
    const modalPanel = document.getElementById('modalPanel');

    // 根据类型 + 特性推导“破甲机制与特殊行为”
    function mechanicsOf(b) {
      const out = [];
      switch (b.type) {
        case 'MOAB':
          out.push('MOAB 级护甲：普通防御塔无法对其造成伤害，只有可攻击「MOAB 级」敌人的防御塔才有效；免疫冰冻、眩晕、胶水与绝大多数击退。');
          out.push('被完全击破后释放 4 个陶瓷气球；MOAB 级气球共有 4 个伤害阶段，81 回合之后血量还会随回合数继续成长。');
          break;
        case 'BFB':
          out.push('BFB 级护甲：与 MOAB 同级，需要可攻击 MOAB 级敌人的高伤防御塔才能有效输出。');
          out.push('被完全击破后释放 4 个 MOAB，是后期最典型的“一漏就完”的敌人。');
          break;
        case 'ZOMG':
          out.push('ZOMG 级护甲：MOAB 级中最重的非 BOSS 存在之一，4000 点基础血量，普通火力几乎无法在有限时间内击破。');
          out.push('被完全击破后释放 4 个 BFB，需要成建制的高级反甲阵容。');
          break;
        case '陶瓷':
          out.push('陶瓷外壳：10 点固定耐久（强化陶瓷为 20 点），可承受多次打击，是第一种多段血气球球。');
          out.push('被完全击破后释放 2 个彩虹气球（81 回合及以后只释放 1 个），考验层级清理能力。');
          break;
        case '铅':
          out.push('铅层护甲：免疫锐器（飞镖、尖刺、刀片）、冰冻与能量类伤害，只有爆炸、火焰、等离子类伤害有效。');
          out.push('被击破后释放 2 个黑气球，而黑气球又各自带有爆炸免疫，需要提前准备好非爆炸手段。');
          break;
        default:
          out.push('普通气球链条：被击破后释放下一级气球（红→蓝→绿→黄→粉→黑/白/紫→铅→彩虹→陶瓷），直到红气球被消灭。');
          if (b.name === '红气球') out.push('红气球是链条终点，被击破后不会释放其他气球。');
      }
      if (b.traits.includes('迷彩'))     out.push('迷彩属性：不具备迷彩侦测能力的防御塔会直接忽略它，需要忍者猴、狙击手猴（反迷彩升级）等才能锁定。');
      if (b.traits.includes('再生'))     out.push('再生属性：被击破后每 3 秒恢复一层；火力不足时会被反复恢复层数，需要足够的穿透与射速，或使用「去除再生」类能力。');
      if (b.traits.includes('爆炸免疫')) out.push('爆炸免疫：炸弹、迫击炮等爆炸类伤害完全无效，必须更换伤害类型。');
      if (b.traits.includes('冰冻免疫')) out.push('冰冻免疫：冰系攻击无法将其冻结或造成冰冻伤害。');
      if (b.traits.includes('能量免疫')) out.push('能量免疫：对火焰、能量与等离子类伤害免疫，请使用锐器或爆炸手段。');
      return out;
    }

    function statBox(label, value, color) {
      return `<div class="rounded-xl bg-slate-50 px-3 py-2 text-center dark:bg-slate-700/50">
                <div class="text-[10px] text-slate-400">${esc(label)}</div>
                <div class="text-base font-bold ${color}">${esc(value)}</div>
              </div>`;
    }

    function modalHTML(b) {
      const mech  = mechanicsOf(b);
      const chips = b.traits.map(t =>
        `<span class="rounded-full px-2 py-0.5 text-[11px] font-medium ${traitClass(t)}">${esc(t)}</span>`).join('');
      const resist = b.resist.map(r =>
        `<li class="flex gap-2"><span class="text-sky-500">🛡</span><span>${esc(r)}</span></li>`).join('');
      const weak = b.weak.map(w =>
        `<li class="flex gap-2"><span class="text-rose-500">⚔️</span><span>${esc(w)}</span></li>`).join('');

      return `
      <div class="relative">
        <button id="modalClose" type="button" aria-label="关闭详情"
                class="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">✕</button>

        <!-- 弹窗头部：缩略图 + 名称 + 类型 + 特性 -->
        <div class="flex items-center gap-4 rounded-t-2xl bg-gradient-to-r from-indigo-50 to-sky-50 p-5 dark:from-slate-700/60 dark:to-slate-700/30">
          <div class="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/70 shadow-inner dark:bg-slate-800/70">
            <span class="text-4xl">🎈</span>
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-xl font-extrabold">${esc(b.name)}</h2>
              <span class="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-900/60 dark:text-slate-300">#${String(b.id).padStart(2, '0')}</span>
              <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold ${typeClass(b.type)}">${esc(b.type)}</span>
            </div>
            <div class="mt-2 flex flex-wrap gap-1">${chips}</div>
          </div>
        </div>

        <div class="space-y-5 p-5">
          <!-- 完整数值 -->
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            ${statBox('血量', b.hp, 'text-rose-500 dark:text-rose-400')}
            ${statBox('移速', b.speed + 'x', 'text-amber-500 dark:text-amber-400')}
            ${statBox('首次出现', b.round, 'text-indigo-500 dark:text-indigo-400')}
            ${statBox('等级分组', levelGroup(b), 'text-teal-600 dark:text-teal-400')}
          </div>

          <!-- 破甲机制与特殊行为 -->
          <section>
            <h3 class="mb-2 text-sm font-bold">🛠 破甲机制与特殊行为</h3>
            <ul class="space-y-1.5 rounded-xl bg-slate-50 p-3 text-[13px] leading-relaxed dark:bg-slate-700/40">
              ${mech.map(m => `<li class="flex gap-2"><span class="text-indigo-400">•</span><span>${esc(m)}</span></li>`).join('')}
            </ul>
          </section>

          <!-- 抗性 / 弱点 -->
          <div class="grid gap-3 sm:grid-cols-2">
            <section>
              <h3 class="mb-2 text-sm font-bold">🛡 特殊抗性</h3>
              <ul class="space-y-1.5 rounded-xl bg-slate-50 p-3 text-[13px] leading-relaxed dark:bg-slate-700/40">${resist || '<li class="text-slate-400">无</li>'}</ul>
            </section>
            <section>
              <h3 class="mb-2 text-sm font-bold">⚔️ 弱点</h3>
              <ul class="space-y-1.5 rounded-xl bg-slate-50 p-3 text-[13px] leading-relaxed dark:bg-slate-700/40">${weak || '<li class="text-slate-400">无</li>'}</ul>
            </section>
          </div>

          <!-- 详细介绍 -->
          <section>
            <h3 class="mb-2 text-sm font-bold">📖 详细介绍</h3>
            <p class="rounded-xl bg-slate-50 p-3 text-[13px] leading-relaxed dark:bg-slate-700/40">${esc(b.desc)}</p>
          </section>
        </div>
      </div>`;
    }

    function openModal(id) {
      const b = balloons.find(x => x.id === id);
      if (!b) return;
      modalPanel.innerHTML = modalHTML(b);
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden'; // 锁定背景滚动
      modalPanel.querySelector('#modalClose').addEventListener('click', closeModal);
    }

    function closeModal() {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      modalPanel.innerHTML = '';
      document.body.style.overflow = '';
    }

    /* =========================================================
     * 六、深色 / 浅色模式切换（记忆用户选择）
     * ========================================================= */
    const themeToggle = document.getElementById('themeToggle');

    function applyTheme(t) {
      document.documentElement.classList.toggle('dark', t === 'dark');
      themeToggle.textContent = t === 'dark' ? '☀️' : '🌙';
      themeToggle.title = t === 'dark' ? '切换为浅色模式' : '切换为深色模式';
      try { localStorage.setItem('btd-codex-theme', t); } catch (e) { /* 本地文件模式下忽略 */ }
    }

    themeToggle.addEventListener('click', () => {
      applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
    });

    let savedTheme = null;
    try { savedTheme = localStorage.getItem('btd-codex-theme'); } catch (e) { /* 忽略 */ }
    applyTheme(savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

    /* =========================================================
     * 七、事件绑定与初始化
     * ========================================================= */
    const searchInput = document.getElementById('searchInput');
    const levelSelect = document.getElementById('levelSelect');
    const resetBtn    = document.getElementById('resetBtn');

    // 实时搜索：输入即过滤
    searchInput.addEventListener('input', () => {
      state.q = searchInput.value;
      render();
    });

    // 等级筛选
    levelSelect.addEventListener('change', () => {
      state.level = levelSelect.value;
      render();
    });

    // 多选标签：类型 + 属性（事件委托）
    function onChipClick(e) {
      const btn = e.target.closest('button[data-group]');
      if (!btn) return;
      const { group, key } = btn.dataset;
      const set = group === 'type' ? state.types : state.props;
      if (set.has(key)) set.delete(key); else set.add(key);
      renderChips(); // 刷新按钮高亮状态
      render();
    }
    typeChips.addEventListener('click', onChipClick);
    propChips.addEventListener('click', onChipClick);

    // 重置全部筛选条件
    function resetAll() {
      state.q = '';
      state.level = 'all';
      state.types.clear();
      state.props.clear();
      searchInput.value = '';
      levelSelect.value = 'all';
      renderChips();
      render();
    }
    resetBtn.addEventListener('click', resetAll);
    document.getElementById('emptyReset').addEventListener('click', resetAll);

    // 点击卡片 -> 打开详情弹窗（事件委托）
    grid.addEventListener('click', e => {
      const card = e.target.closest('.balloon-card');
      if (card) openModal(Number(card.dataset.id));
    });
    // 键盘可达性：聚焦卡片后按 Enter / 空格也能打开
    grid.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.balloon-card');
      if (card) { e.preventDefault(); openModal(Number(card.dataset.id)); }
    });

    // 点遮罩关闭弹窗
    modalMask.addEventListener('click', closeModal);
    // 按 Esc 关闭弹窗
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });

    // 初始化：渲染筛选标签 + 全部卡片
    renderChips();
    render();

  })();
  