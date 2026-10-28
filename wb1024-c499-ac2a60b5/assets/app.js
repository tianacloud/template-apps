/* 装机模拟器 · 逻辑层 v2 */

const CATEGORY_ORDER = ['cpu', 'board', 'gpu', 'ram', 'ssd', 'cooler', 'chassis', 'psu'];
const TIER_COLOR = ['#f5d90a', '#f5d90a', '#67e8f9', '#a78bfa', '#facc15', '#cbd5e1', '#94a3b8'];
const POWER_PRICE = 0.62;   // 元/度
const GAME_HOURS = 3;       // 日均满载小时
const IDLE_WATTS = 90;      // 轻载功耗

const state = { ssdCount: 1 };
Object.assign(state, PRESETS[0].build);

const byId = (cat, id) => PARTS[cat].find((p) => p.id === id);
const money = (n) => '¥' + n.toLocaleString('zh-CN');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------------- 兼容性 & 性能模型 ---------------- */

function evaluate() {
  const p = {
    cpu: byId('cpu', state.cpu),
    board: byId('board', state.board),
    gpu: byId('gpu', state.gpu),
    ram: byId('ram', state.ram),
    ssd: byId('ssd', state.ssd),
    cooler: byId('cooler', state.cooler),
    chassis: byId('chassis', state.chassis),
    psu: byId('psu', state.psu)
  };

  const issues = [];
  const err = (cats, text) => issues.push({ level: 'err', cats, text });
  const warn = (cats, text) => issues.push({ level: 'warn', cats, text });
  const tip = (cats, text) => issues.push({ level: 'tip', cats, text });

  /* 1. 插槽 */
  if (p.cpu.socket !== p.board.socket) {
    err(['cpu', 'board'], `插槽不匹配：${p.cpu.name} 是 ${p.cpu.socket}，而 ${p.board.name} 是 ${p.board.socket}，物理上插不进去。`);
  }

  /* 2. 内存代数 */
  if (p.board.mem !== p.ram.type) {
    err(['board', 'ram'], `内存插不上：主板只支持 ${p.board.mem}，你选的是 ${p.ram.type}，DDR4 与 DDR5 的缺口位置不一样。`);
  } else if (!p.cpu.mem.includes(p.ram.type)) {
    err(['cpu', 'ram'], `${p.cpu.name} 的内存控制器不支持 ${p.ram.type}。`);
  } else {
    /* 3. 内存条数 / 容量 / 频率 */
    if (p.ram.sticks > p.board.dimm) {
      err(['board', 'ram'], `内存插槽不够：${p.board.name} 只有 ${p.board.dimm} 条 DIMM，你这套是 ${p.ram.sticks} 条。`);
    }
    if (p.ram.cap > p.board.maxMem) {
      err(['board', 'ram'], `容量超上限：${p.board.name} 最大支持 ${p.board.maxMem}GB，你装了 ${p.ram.cap}GB。`);
    }
    if (p.ram.freq > p.board.memMax) {
      warn(['board', 'ram'], `内存降频：这套 ${p.ram.freq}MHz 的条子，${p.board.name} 官方最高只支持 ${p.board.memMax}MHz，会按低频跑。`);
    }
  }

  /* 4. BIOS 支持 */
  if (p.board.needBios && p.board.needBios.includes(p.cpu.id)) {
    warn(['board', 'cpu'], `先刷 BIOS：${p.board.chipset} 主板出厂固件可能不认 ${p.cpu.name}，买之前确认商家已更新，或主板支持免 CPU 刷新。`);
  }

  /* 5. 板型 */
  if (!p.chassis.forms.includes(p.board.form)) {
    err(['board', 'chassis'], `板型装不下：${p.chassis.name} 支持 ${p.chassis.forms.join(' / ')}，而主板是 ${p.board.form}。`);
  }

  /* 6. 显卡长度 / 厚度 */
  if (p.gpu.len > 0 && p.gpu.len > p.chassis.maxGpu) {
    err(['gpu', 'chassis'], `显卡太长：${p.gpu.name} 长 ${p.gpu.len}mm，机箱限长 ${p.chassis.maxGpu}mm，差 ${p.gpu.len - p.chassis.maxGpu}mm。`);
  }
  if (p.gpu.slots > 0 && p.gpu.slots > p.chassis.slots) {
    err(['gpu', 'chassis'], `显卡太厚：${p.gpu.name} 要占 ${p.gpu.slots} 个槽位，${p.chassis.name} 只有 ${p.chassis.slots} 个。`);
  }

  /* 7. 显卡 PCIe 版本降速 */
  if (p.gpu.pcie === '5.0' && p.board.pcie !== '5.0') {
    warn(['gpu', 'board'], `显卡跑在 PCIe ${p.board.pcie} 上：${p.board.name} 的显卡槽不是 5.0，实测损失通常在 2%～5%，不用太慌。`);
  }

  /* 8. 散热器 */
  if (!p.cooler.sockets.includes(p.cpu.socket)) {
    err(['cooler', 'cpu'], `扣具不支持：${p.cooler.name} 没有 ${p.cpu.socket} 的扣具，装不上。`);
  }
  if (p.cooler.type === 'air') {
    if (p.cooler.height > p.chassis.maxCooler) {
      err(['cooler', 'chassis'], `风冷太高：散热 ${p.cooler.height}mm，机箱限高 ${p.chassis.maxCooler}mm，侧板盖不上。`);
    }
  } else if (!p.chassis.rads.includes(p.cooler.rad)) {
    err(['cooler', 'chassis'], `冷排装不下：${p.chassis.name} 不支持 ${p.cooler.rad} 排。`);
  }
  if (p.cpu.power > p.cooler.tdpLimit) {
    warn(['cooler', 'cpu'], `散热压不住：${p.cpu.name} 满载约 ${p.cpu.power}W，${p.cooler.name} 建议上限 ${p.cooler.tdpLimit}W，长时间会降频。`);
  }

  /* 9. 固态数量 / 速度 */
  if (state.ssdCount > p.board.m2) {
    err(['ssd', 'board'], `M.2 接口不够：${p.board.name} 只有 ${p.board.m2} 个 M.2，你插了 ${state.ssdCount} 条。`);
  }
  if (p.ssd.pcie === '5.0' && p.board.pcie !== '5.0') {
    tip(['ssd', 'board'], `固态跑不满：${p.ssd.name} 是 PCIe 5.0 盘，插在这块板上会降到 ${p.board.pcie} 速度，依然很快，只是没跑满。`);
  }

  /* 10. 核显点亮 */
  if (p.gpu.vram === 0 && !p.cpu.igpu) {
    err(['cpu', 'gpu'], `${p.cpu.name} 没有核显，不配独立显卡的话开机是黑屏的。`);
  }

  /* 11. 电源 */
  const power = Math.round(p.cpu.power + p.gpu.tdp + p.ram.cap * 0.4 + state.ssdCount * 8 + 50);
  const suggestPsu = Math.ceil((power * 1.25) / 50) * 50;
  if (p.psu.watts < power * 1.12) {
    err(['psu'], `电源带不动：估算满载 ${power}W，${p.psu.name}（${p.psu.watts}W）扛不住显卡的瞬时功耗尖峰，建议 ≥ ${suggestPsu}W。`);
  } else if (p.psu.watts < suggestPsu) {
    warn(['psu'], `电源偏紧：估算满载 ${power}W，建议上到 ${suggestPsu}W（留 25% 余量），高负载时更稳也更安静。`);
  } else if (p.psu.watts >= suggestPsu + 400) {
    tip(['psu'], `电源有点过剩（比推荐高 ${p.psu.watts - suggestPsu}W），不过留着以后升级显卡也不亏。`);
  }
  if (!p.chassis.psu.includes(p.psu.form)) {
    err(['psu', 'chassis'], `电源规格不符：${p.chassis.name} 只支持 ${p.chassis.psu.join(' / ')} 电源，你选的是 ${p.psu.form}。`);
  }
  if (!p.psu.modular && p.chassis.forms.length === 1) {
    warn(['psu', 'chassis'], `非模组电源在小机箱里是最难塞的东西，一坨多余的线要藏，建议换全模组。`);
  }

  /* 12. 风道 */
  if (power > 500 && p.chassis.rads.length === 0) {
    warn(['chassis'], `这套满载约 ${power}W，而 ${p.chassis.name} 不支持水冷排，务必把机箱风扇装满，否则热量全闷在箱子里。`);
  }

  /* 13. 瓶颈 */
  if (p.gpu.score - p.cpu.score >= 25) {
    warn(['cpu', 'gpu'], `CPU 拖后腿：${p.gpu.name} 的性能发挥不出来，同预算下更建议把 CPU 再升一档。`);
  } else if (p.cpu.score - p.gpu.score >= 30) {
    warn(['gpu', 'cpu'], `显卡偏弱：这颗 CPU 明显还有余力，预算允许的话显卡才是帧数的主要来源。`);
  }
  if (p.gpu.vram >= 16 && p.ram.cap < 32) {
    warn(['ram', 'gpu'], `显卡有 ${p.gpu.vram}GB 显存但内存只有 ${p.ram.cap}GB，建议升到 32GB 以上。`);
  }
  if (p.ram.cap >= 64 && p.cpu.score < 70) {
    warn(['ram', 'cpu'], `这么大的内存配这颗 U 有点浪费，除非你真的在跑本地大模型。`);
  }
  if (p.gpu.vram === 0) {
    tip(['gpu'], '纯核显配置：办公、写代码、轻度剪辑都够，3A 大作基本与你无关。');
  }

  /* ---------------- 价格 ---------------- */
  const items = [
    { label: SLOT_LABEL.cpu, name: p.cpu.name, price: p.cpu.price, base: p.cpu.base || p.cpu.price },
    { label: SLOT_LABEL.board, name: p.board.name, price: p.board.price, base: p.board.base || p.board.price },
    { label: SLOT_LABEL.gpu, name: p.gpu.name, price: p.gpu.price, base: p.gpu.base || p.gpu.price },
    { label: SLOT_LABEL.ram, name: p.ram.name, price: p.ram.price, base: p.ram.base || p.ram.price },
    { label: SLOT_LABEL.ssd, name: p.ssd.name + (state.ssdCount > 1 ? ` ×${state.ssdCount}` : ''), price: p.ssd.price * state.ssdCount, base: (p.ssd.base || p.ssd.price) * state.ssdCount },
    { label: SLOT_LABEL.cooler, name: p.cooler.name, price: p.cooler.price, base: p.cooler.base || p.cooler.price },
    { label: SLOT_LABEL.chassis, name: p.chassis.name, price: p.chassis.price, base: p.chassis.base || p.chassis.price },
    { label: SLOT_LABEL.psu, name: p.psu.name, price: p.psu.price, base: p.psu.base || p.psu.price }
  ];
  const total = items.reduce((s, i) => s + i.price, 0);
  const baseTotal = items.reduce((s, i) => s + i.base, 0);

  /* ---------------- 行情溢价 ---------------- */
  const premium = total - baseTotal;
  const premiumRate = baseTotal ? Math.round((premium / baseTotal) * 100) : 0;
  const hikes = items
    .map((i) => ({ label: i.label, name: i.name, diff: i.price - i.base, rate: i.base ? Math.round(((i.price - i.base) / i.base) * 100) : 0 }))
    .filter((h) => h.diff > 0)
    .sort((a, b) => b.diff - a.diff);
  const top = hikes[0];
  const market = {
    total, baseTotal, premium, premiumRate, hikes,
    level: premiumRate >= 60 ? '重度溢价' : premiumRate >= 35 ? '明显溢价' : premiumRate >= 15 ? '轻度溢价' : '价格正常',
    advice: !top
      ? '这套里没有处于涨价高位的配件，价格基本是常态价。'
      : premiumRate >= 60
        ? `整套比一年前要多花 ${money(premium)}，其中${top.label}一项就占了 ${money(top.diff)}。这个时间点装机确实吃亏，能等就等，不能等就先把预算压在${top.label === '内存' ? '16G 内存过渡' : '够用的档位'}上。`
        : premiumRate >= 35
          ? `现在买这套要比一年前多花 ${money(premium)}（+${premiumRate}%），${top.label}涨得最狠（+${top.rate}%）。不着急的话，${top.label === '内存' ? '内存可以先用 16G 顶着，等回落再补一条' : `${top.label}可以考虑降一档或看成色好的二手`}。`
          : premiumRate >= 15
            ? `有 ${hikes.length} 件配件比一年前贵了，合计多花 ${money(premium)}，属于可接受范围，该装就装。`
            : `这套的价格基本回到常态，只有${top.label}略高一点（+${top.rate}%）。`
  };
  /* 溢价不计入兼容性警告（避免和「装不起来」混在一起），单独在溢价模块展示 */

  /* ---------------- 帧数 / 电费 / 噪音 ---------------- */
  const cpuFactor = clamp(0.62 + p.cpu.score / 230, 0.62, 1);
  const fps = { fhd: 0, qhd: 0, uhd: 0 };
  if (p.gpu.score > 10) {
    const vramPenalty = (res) => {
      if (res === 'uhd') return p.gpu.vram >= 16 ? 1 : p.gpu.vram >= 12 ? 0.82 : 0.6;
      if (res === 'qhd') return p.gpu.vram >= 8 ? 1 : 0.8;
      return 1;
    };
    fps.fhd = Math.round(p.gpu.score * 3.4 * cpuFactor);
    fps.qhd = Math.round(p.gpu.score * 2.2 * cpuFactor * vramPenalty('qhd'));
    fps.uhd = Math.round(p.gpu.score * 1.2 * cpuFactor * vramPenalty('uhd'));
  }

  const kwh = Math.round(((power * GAME_HOURS + IDLE_WATTS * 6) * 365) / 1000);
  const yearlyCost = Math.round(kwh * POWER_PRICE);
  const loadRatio = (p.cpu.power + p.gpu.tdp) / Math.max(1, p.cooler.tdpLimit + p.gpu.tdp * 0.4);
  const noise = Math.round(p.cooler.noise + (loadRatio > 0.85 ? 7 : loadRatio > 0.7 ? 3 : 0) + (p.gpu.tdp > 320 ? 2 : 0));
  const cpuTemp = Math.round(clamp(42 + (p.cpu.power / p.cooler.tdpLimit) * 45 + (loadRatio - 1) * 10, 38, 102));

  let diff = 1;
  if (p.chassis.forms.length === 1) diff += 3;
  if (p.cooler.type === 'aio') diff += 2;
  if (p.gpu.slots >= 3) diff += 1;
  if (!p.psu.modular) diff += 1;
  if (p.chassis.forms.length === 1 && p.cooler.type === 'aio') diff += 1;
  const difficulty = diff <= 2
    ? { level: '新手友好', text: '照着说明书一步步来就行，一下午能搞定。' }
    : diff <= 4
      ? { level: '有点讲究', text: '需要规划走线和安装顺序，建议先看一遍装机视频。' }
      : diff <= 6
        ? { level: '老手专属', text: '空间紧张 + 水冷，装之前先把顺序想清楚。' }
        : { level: '地狱难度', text: 'ITX 塞水冷 + 非模组电源，装完你会想发朋友圈。' };

  /* ---------------- 评分 ---------------- */
  const ramScore = Math.min(100, 45 + p.ram.cap * 0.9 + (p.ram.type === 'DDR5' ? 8 : 0));
  const diskScore = Math.min(100, 55 + p.ssd.price / 12 + state.ssdCount * 6);
  const errCount = issues.filter((i) => i.level === 'err').length;
  const warnCount = issues.filter((i) => i.level === 'warn').length;
  let score = p.cpu.score * 0.35 + p.gpu.score * 0.45 + ramScore * 0.1 + diskScore * 0.1;
  score = score - errCount * 8 - warnCount * 2;
  score = clamp(Math.round(score), 0, 100);

  const idx = TITLES.findIndex((t) => score >= t.min);
  const t = TITLES[idx < 0 ? TITLES.length - 1 : idx];
  const tier = { name: t.name, quip: t.quip, tag: t.tag, color: TIER_COLOR[idx < 0 ? TIER_COLOR.length - 1 : idx] };
  const perThousand = +(score / (total / 1000)).toFixed(1);

  return {
    items, total, baseTotal, market, power, suggestPsu, issues, score, tier, perThousand, fps,
    kwh, yearlyCost, noise, cpuTemp, difficulty, cpuFactor,
    scenarios: scenariosOf(p.cpu, p.gpu, p.ram),
    parts: p
  };
}

function scenariosOf(cpu, gpu, ram) {
  const list = [];
  let game, ai, work;
  if (gpu.score >= 88) game = '4K 高画质流畅，光追也开得动';
  else if (gpu.score >= 72) game = '2K 高画质无压力';
  else if (gpu.score >= 55) game = '1080P 高画质 / 2K 中画质';
  else if (gpu.score >= 40) game = '1080P 中低画质，网游流畅';
  else game = '仅限网游与老游戏，建议加张独显';
  list.push({ icon: '🎮', name: '3A 游戏', text: game });

  if (gpu.vram >= 24) ai = `可本地跑 70B 级量化模型（${gpu.vram}GB 显存）`;
  else if (gpu.vram >= 16) ai = '14B–32B 量化模型推理流畅';
  else if (gpu.vram >= 8) ai = '7B 量化模型可用，更大的要走内存';
  else ai = ram.cap >= 64 ? '显存太小，只能靠大内存跑 CPU 推理，速度偏慢' : '本地大模型基本不可用';
  list.push({ icon: '🤖', name: '本地 AI', text: ai });

  if (cpu.score >= 85) work = '8K 素材剪辑、大规模编译渲染都轻松';
  else if (cpu.score >= 65) work = '视频剪辑与代码编译流畅';
  else if (cpu.score >= 45) work = '日常办公、轻度剪辑够用';
  else work = '轻办公与文档处理';
  list.push({ icon: '🛠️', name: '生产力', text: work });

  return list;
}

/* 每个配件的兼容状态 */
function catStatus(issues, cat) {
  let s = 'ok';
  issues.forEach((i) => {
    if (!i.cats.includes(cat)) return;
    if (i.level === 'err') s = 'err';
    else if (i.level === 'warn' && s !== 'err') s = 'warn';
  });
  return s;
}

/* ---------------- 渲染 ---------------- */

let lastResult = null;
let collapsed = {};

function renderCategories(r) {
  const wrap = document.getElementById('categories');
  wrap.innerHTML = CATEGORY_ORDER.map((cat) => {
    const status = catStatus(r.issues, cat);
    const badge = status === 'err' ? '<i class="badge err">✕ 装不上</i>'
      : status === 'warn' ? '<i class="badge warn">! 有隐患</i>'
        : '<i class="badge ok">✓ 没问题</i>';
    const cards = PARTS[cat].map((part) => {
      const price = cat === 'ssd' ? part.price * state.ssdCount : part.price;
      const base = part.base ? (cat === 'ssd' ? part.base * state.ssdCount : part.base) : 0;
      const hike = base ? Math.round(((price - base) / base) * 100) : 0;
      const on = state[cat] === part.id;
      return `<button class="card ${on ? 'active' : ''}" data-cat="${cat}" data-id="${part.id}">
        <span class="card-top">
          <span class="card-name">${part.name}</span>
          ${on ? '<span class="tick">✓</span>' : ''}
        </span>
        <span class="card-sub">${part.sub}</span>
        <span class="card-price">${price ? money(price) : '免费'}${hike >= 10 ? `<i class="hike">↑${hike}%</i>` : ''}</span>
        ${hike >= 10 ? `<span class="card-base">一年前 ${money(base)}</span>` : ''}
      </button>`;
    }).join('');
    const extra = cat === 'ssd' ? `
      <div class="count-row">
        <span>数量</span>
        <div class="stepper">
          <button data-step="-1">−</button>
          <b>${state.ssdCount}</b>
          <button data-step="1">+</button>
        </div>
        <span class="count-note">占用 M.2 接口 ${state.ssdCount} / ${r.parts.board.m2} 个</span>
      </div>` : '';
    return `<section class="cat ${collapsed[cat] ? 'folded' : ''}" data-cat="${cat}">
      <h2 data-toggle="${cat}">
        <span class="cat-icon">${SLOT_ICON[cat]}</span>
        <b>${SLOT_LABEL[cat]}</b>
        <em>${CATEGORY_HINT[cat]}</em>
        ${badge}
        <span class="fold">${collapsed[cat] ? '展开' : '收起'}</span>
      </h2>
      <div class="cat-body">
        <div class="cards">${cards}</div>
        ${extra}
      </div>
    </section>`;
  }).join('');

  wrap.querySelectorAll('.card').forEach((btn) => {
    btn.addEventListener('click', () => { state[btn.dataset.cat] = btn.dataset.id; render(); });
  });
  wrap.querySelectorAll('[data-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = state.ssdCount + Number(btn.dataset.step);
      if (next >= 1 && next <= 4) { state.ssdCount = next; render(); }
    });
  });
  wrap.querySelectorAll('[data-toggle]').forEach((h) => {
    h.addEventListener('click', () => {
      const cat = h.dataset.toggle;
      collapsed[cat] = !collapsed[cat];
      render();
    });
  });
}

function renderSummary(r) {
  const el = document.getElementById('summaryBody');
  const groups = { err: [], warn: [], tip: [] };
  r.issues.forEach((i) => groups[i.level].push(i.text));

  const issueBlock = (title, list, cls) => list.length
    ? `<div class="issue ${cls}"><h4>${title}</h4>${list.map((t) => `<p>${t}</p>`).join('')}</div>`
    : '';

  const fpsBar = (label, val, max) => {
    const pct = clamp((val / max) * 100, 3, 100);
    const color = val >= 100 ? '#34d399' : val >= 60 ? '#22d3ee' : val >= 30 ? '#fbbf24' : '#f87171';
    return `<div class="fps-row">
      <span class="fps-label">${label}</span>
      <span class="fps-track"><i style="width:${pct}%;background:${color}"></i></span>
      <span class="fps-val" style="color:${color}">${val} fps</span>
    </div>`;
  };

  el.innerHTML = `
    <div class="total">
      <span>整机总价</span>
      <b>${money(r.total)}</b>
      <em>估算满载 ${r.power}W · 推荐电源 ${r.suggestPsu}W</em>
    </div>

    <div class="premium">
      <h4>📈 行情溢价<em>对比一年前常态价 · ${r.market.level}</em></h4>
      <div class="premium-top">
        <div><span>现在</span><b>${money(r.total)}</b></div>
        <div><span>一年前</span><b class="old">${money(r.baseTotal)}</b></div>
        <div><span>多花</span><b class="up">+${money(r.market.premium)}</b></div>
      </div>
      <div class="premium-bar"><i style="width:${clamp(r.market.premiumRate, 3, 100)}%"></i></div>
      ${r.market.hikes.length ? `<ul class="premium-list">
        ${r.market.hikes.slice(0, 3).map((h) => `<li><span>${h.label}</span><b>+${money(h.diff)}</b><em>+${h.rate}%</em></li>`).join('')}
      </ul>` : ''}
      <p class="premium-advice">${r.market.advice}</p>
      <p class="premium-note">${MARKET_NOTE}</p>
    </div>

    <div class="score-box" style="--tier:${r.tier.color}">
      <div class="ring" style="--pct:${r.score}">
        <svg viewBox="0 0 100 100">
          <circle class="ring-bg" cx="50" cy="50" r="42"></circle>
          <circle class="ring-fg" cx="50" cy="50" r="42"></circle>
        </svg>
        <div class="ring-num"><b>${r.score}</b><span>/100</span></div>
      </div>
      <div class="tier">
        <b>${r.tier.name}</b>
        <p>${r.tier.quip}</p>
        <span class="tag">${r.tier.tag}</span>
      </div>
      <div class="perk">性价比 ${r.perThousand}<span>分 / 千元</span></div>
    </div>

    <div class="panel-block">
      <h4>🎯 帧数预估<em>娱乐向估算 · 3A 高画质</em></h4>
      ${r.fps.fhd ? fpsBar('1080P', r.fps.fhd, 240) + fpsBar('2K', r.fps.qhd, 180) + fpsBar('4K', r.fps.uhd, 120)
        : '<p class="muted">核显配置，帧数就别为难它了。</p>'}
    </div>

    <div class="stat-grid">
      <div><span>年耗电</span><b>${r.kwh} 度</b><em>约 ${money(r.yearlyCost)}/年</em></div>
      <div><span>满载噪音</span><b>${r.noise} dB</b><em>CPU 约 ${r.cpuTemp}℃</em></div>
      <div><span>装机难度</span><b class="${r.difficulty.level.length > 4 ? 'hard' : ''}">${r.difficulty.level}</b><em>${r.difficulty.text}</em></div>
    </div>

    <ul class="scenarios">
      ${r.scenarios.map((s) => `<li><span>${s.icon}</span><div><b>${s.name}</b><p>${s.text}</p></div></li>`).join('')}
    </ul>

    ${issueBlock('❌ 装不起来（' + groups.err.length + '）', groups.err, 'err')}
    ${issueBlock('⚠️ 建议调整（' + groups.warn.length + '）', groups.warn, 'warn')}
    ${issueBlock('💡 小提示', groups.tip, 'tip')}
    ${!groups.err.length && !groups.warn.length ? '<div class="issue ok"><h4>✅ 一切正常</h4><p>这套配置没有兼容性问题，可以直接下单了。</p></div>' : ''}

    <div class="trivia"><span>💡</span><p id="triviaText">${TRIVIA[Math.floor(Math.random() * TRIVIA.length)]}</p></div>

    <div class="actions">
      <button id="btnCard" class="primary">生成配置单卡片</button>
      <button id="btnGuide" class="ghost">跟我一起装机 →</button>
      <button id="btnCopy">复制文字清单</button>
      <button id="btnShare">复制带配置的分享链接</button>
      <button id="btnRandom">手气不错 · 随机一台</button>
    </div>
  `;

  document.getElementById('btnCard').onclick = () => openCard(r);
  document.getElementById('btnGuide').onclick = () => openGuide(r);
  document.getElementById('btnCopy').onclick = () => copyList(r);
  document.getElementById('btnShare').onclick = shareLink;
  document.getElementById('btnRandom').onclick = randomBuild;
}

function render() {
  const r = evaluate();
  lastResult = r;
  renderCategories(r);
  renderSummary(r);
}

/* ---------------- 预设 & 随机 ---------------- */

function applyPreset(id) {
  const p = PRESETS.find((x) => x.id === id);
  Object.assign(state, p.build);
  render();
  toast(`已切换到「${p.name}」`);
}

function randomBuild() {
  for (let attempt = 0; attempt < 600; attempt++) {
    const pick = (cat) => PARTS[cat][Math.floor(Math.random() * PARTS[cat].length)].id;
    Object.assign(state, {
      cpu: pick('cpu'), board: pick('board'), gpu: pick('gpu'), ram: pick('ram'),
      ssd: pick('ssd'), cooler: pick('cooler'), chassis: pick('chassis'), psu: pick('psu'),
      ssdCount: 1
    });
    const r = evaluate();
    if (!r.issues.some((i) => i.level === 'err')) { render(); toast('随机到一台能亮的机器'); return; }
  }
  render();
  toast('随机组合都没找到完美方案，已显示最后一次尝试');
}

/* ---------------- 配置分享链接 ---------------- */

function encodeBuild() {
  return CATEGORY_ORDER.map((cat) => PARTS[cat].findIndex((p) => p.id === state[cat]).toString(36)).join('') + state.ssdCount;
}

function decodeBuild(code) {
  if (!code || code.length !== CATEGORY_ORDER.length + 1) return false;
  const chars = code.split('');
  const next = {};
  for (let k = 0; k < CATEGORY_ORDER.length; k++) {
    const part = PARTS[CATEGORY_ORDER[k]][parseInt(chars[k], 36)];
    if (!part) return false;
    next[CATEGORY_ORDER[k]] = part.id;
  }
  const cnt = Number(chars[CATEGORY_ORDER.length]);
  if (!(cnt >= 1 && cnt <= 4)) return false;
  next.ssdCount = cnt;
  Object.assign(state, next);
  return true;
}

function shareLink() {
  const base = location.href.split('#')[0];
  const url = `${base}#b=${encodeBuild()}`;
  const done = () => toast('链接已复制，发给朋友就是同款配置');
  if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, () => toast(url));
  else toast(url);
}

/* ---------------- 装机引导 ---------------- */

let guideStep = 0;
function openGuide(r) {
  guideStep = 0;
  document.getElementById('guideModal').classList.add('show');
  drawGuide(r);
}

function drawGuide(r) {
  const box = document.getElementById('guideBody');
  const step = BUILD_STEPS[guideStep];
  const part = step.key === 'boot' ? null : r.parts[step.key];
  const isLast = guideStep === BUILD_STEPS.length - 1;
  const progress = ((guideStep + 1) / BUILD_STEPS.length) * 100;

  box.innerHTML = `
    <div class="guide-bar"><i style="width:${progress}%"></i></div>
    <div class="guide-head">
      <span class="guide-step">STEP ${guideStep + 1} / ${BUILD_STEPS.length}</span>
      <b>${step.title}</b>
    </div>
    <div class="guide-stage ${step.key}">
      <div class="guide-emoji">${SLOT_ICON[step.key] || '⚡'}</div>
      ${part ? `<p class="guide-part">${part.name}</p>` : '<p class="guide-part">接好显示器、键鼠、电源线</p>'}
    </div>
    <p class="guide-text">${step.text}</p>
    <p class="guide-tip"><span>TIPS</span>${step.tip}</p>
    ${isLast ? bootScreen(r) : ''}
    <div class="guide-actions">
      <button id="gPrev" ${guideStep === 0 ? 'disabled' : ''}>上一步</button>
      ${isLast ? '<button id="gBoot" class="primary">按下开机键</button>'
        : '<button id="gNext" class="primary">下一步 →</button>'}
    </div>
  `;

  const prev = document.getElementById('gPrev');
  const next = document.getElementById('gNext');
  if (prev) prev.onclick = () => { guideStep--; drawGuide(r); };
  if (next) next.onclick = () => { guideStep++; drawGuide(r); };
  const boot = document.getElementById('gBoot');
  if (boot) boot.onclick = () => runBoot(r);
}

function bootScreen(r) {
  return `<div class="boot" id="bootScreen">
    <div class="boot-lines" id="bootLines"></div>
    <div class="boot-light"><i></i><i></i><i></i><i></i></div>
  </div>`;
}

const BOOT_LINES = [
  'AMI BIOS 2026 · 正在检测 CPU …',
  `CPU: ${'${cpu}'}`,
  'Memory Test : Passed',
  'Detecting IDE / NVMe Devices …',
  'PCIe Device : GPU Found',
  'RGB Controller : Online（灯，亮了）',
  'All tests passed. Booting system …',
  '滴 ——'
];

function runBoot(r) {
  const lines = document.getElementById('bootLines');
  const screen = document.getElementById('bootScreen');
  const btn = document.getElementById('gBoot');
  if (!lines) return;
  btn.disabled = true;
  lines.innerHTML = '';
  let i = 0;
  const timer = setInterval(() => {
    const raw = BOOT_LINES[i].replace('${cpu}', r.parts.cpu.name);
    const div = document.createElement('p');
    div.textContent = raw;
    div.className = 'boot-line';
    lines.appendChild(div);
    i++;
    if (i >= BOOT_LINES.length) {
      clearInterval(timer);
      screen.classList.add('on');
      const done = document.createElement('p');
      done.className = 'boot-done';
      done.textContent = `🎉 点亮成功 · ${r.tier.name} · 战斗力 ${r.score}/100`;
      lines.appendChild(done);
      btn.textContent = '再来一次';
      btn.disabled = false;
      btn.onclick = () => { lines.innerHTML = ''; screen.classList.remove('on'); runBoot(r); };
    }
  }, 420);
}

/* ---------------- 分享卡片 ---------------- */

const CARD_THEMES = [
  { id: 'cyber', name: '赛博青', main: '#22d3ee', bg1: '#0d1220', bg2: '#161d33' },
  { id: 'violet', name: '霓虹紫', main: '#a78bfa', bg1: '#150f26', bg2: '#241a3d' },
  { id: 'ember', name: '熔岩橙', main: '#fb923c', bg1: '#1a1008', bg2: '#2c1a10' }
];
let cardTheme = 0;

function drawCard(r, themeIdx) {
  const th = CARD_THEMES[themeIdx];
  const cv = document.getElementById('shareCanvas');
  const W = 900, H = 1470;
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const F = (w, s) => `${w} ${s}px "Microsoft YaHei","PingFang SC",sans-serif`;

  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, th.bg1); bg.addColorStop(1, th.bg2);
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.fillStyle = th.main + '1a';
  g.beginPath(); g.arc(830, 120, 230, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(60, 1340, 180, 0, Math.PI * 2); g.fill();

  // 标题
  g.fillStyle = '#e8eef8'; g.font = F('bold', 48);
  g.fillText('我的装机配置单', 60, 104);
  g.fillStyle = '#7c8aa3'; g.font = F('', 22);
  g.fillText('WorkBuddy 装机模拟器 · 1024 造物挑战参赛作品', 60, 142);

  // 评级条
  g.fillStyle = r.tier.color; g.fillRect(60, 176, 780, 150);
  g.fillStyle = '#0b0f1a';
  g.font = F('bold', 50); g.fillText(r.tier.name, 92, 240);
  g.font = F('', 23); g.fillText(r.tier.quip, 92, 288);
  g.textAlign = 'right';
  g.font = F('bold', 76); g.fillText(String(r.score), 812, 262);
  g.font = F('', 20); g.fillText('/100', 812, 292);
  g.textAlign = 'left';

  // 帧数条
  let y = 380;
  g.fillStyle = '#94a3b8'; g.font = F('', 21);
  g.fillText('帧数预估（3A 高画质）', 60, y);
  y += 26;
  if (r.fps.fhd) {
    [['1080P', r.fps.fhd, 240], ['2K', r.fps.qhd, 180], ['4K', r.fps.uhd, 120]].forEach(([label, val, max]) => {
      g.fillStyle = '#64748b'; g.font = F('', 20);
      g.fillText(label, 60, y + 26);
      g.fillStyle = 'rgba(255,255,255,0.07)';
      g.fillRect(160, y + 8, 520, 20);
      g.fillStyle = th.main;
      g.fillRect(160, y + 8, Math.max(4, (val / max) * 520), 20);
      g.fillStyle = '#e2e8f0'; g.font = F('bold', 21);
      g.fillText(`${val} fps`, 704, y + 27);
      y += 42;
    });
  } else {
    g.fillStyle = '#64748b'; g.font = F('', 20);
    g.fillText('核显配置 · 帧数就别为难它了', 60, y + 26);
    y += 42;
  }

  // 清单
  y += 26;
  r.items.forEach((it) => {
    g.fillStyle = 'rgba(255,255,255,0.04)';
    g.fillRect(60, y - 40, 780, 66);
    g.fillStyle = '#8895ab'; g.font = F('', 19);
    g.fillText(it.label, 84, y);
    g.fillStyle = '#e2e8f0'; g.font = F('bold', 25);
    let name = it.name;
    while (g.measureText(name).width > 430 && name.length > 4) name = name.slice(0, -2) + '…';
    g.fillText(name, 200, y);
    g.fillStyle = th.main; g.font = F('bold', 25);
    const pw = g.measureText(money(it.price)).width;
    g.fillText(money(it.price), 800 - pw, y);
    y += 78;
  });

  // 底部
  y += 16;
  g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(60, y, 780, 2);
  y += 58;
  g.font = F('', 22); g.fillStyle = '#8b97ad';
  g.fillText(`满载约 ${r.power}W · 年耗电 ${r.kwh} 度（约 ${money(r.yearlyCost)}） · 噪音约 ${r.noise}dB`, 60, y);
  y += 40;
  g.fillText(`性价比 ${r.perThousand} 分/千元 · 装机难度：${r.difficulty.level}`, 60, y);
  y += 42;
  g.font = F('bold', 22); g.fillStyle = '#fb923c';
  g.fillText(`行情溢价 +${money(r.market.premium)}（+${r.market.premiumRate}%）· 一年前这套约 ${money(r.baseTotal)}`, 60, y);
  y += 78;
  g.font = F('bold', 64); g.fillStyle = th.main;
  const totalW = g.measureText(money(r.total)).width;
  g.fillText(money(r.total), 60, y);
  g.font = F('', 22); g.fillStyle = '#5f6b80';
  g.fillText('← 一年前 ' + money(r.baseTotal), 80 + totalW, y);
  g.fillText('价格为 2026-10 行情价，实际以商店为准 · #WorkBuddy #1024程序员节', 60, y + 44);

  return cv;
}

function openCard(r) {
  cardTheme = 0;
  document.getElementById('cardModal').classList.add('show');
  refreshCard(r);
}

function refreshCard(r) {
  const cv = drawCard(r, cardTheme);
  const url = cv.toDataURL('image/png');
  document.getElementById('cardImg').src = url;
  document.getElementById('themeSwitch').innerHTML = CARD_THEMES
    .map((t, i) => `<button class="theme-btn ${i === cardTheme ? 'on' : ''}" data-i="${i}" style="--c:${t.main}">${t.name}</button>`)
    .join('');
  document.getElementById('themeSwitch').querySelectorAll('.theme-btn').forEach((b) => {
    b.onclick = () => { cardTheme = Number(b.dataset.i); refreshCard(r); };
  });
  document.getElementById('btnDownload').onclick = () => {
    const a = document.createElement('a');
    a.download = `装机配置单-${r.score}分-${CARD_THEMES[cardTheme].id}.png`;
    a.href = url; a.click();
  };
}

function copyList(r) {
  const lines = [
    '【装机配置单 · WorkBuddy 装机模拟器】',
    ...r.items.map((i) => `${i.label}：${i.name}  ${money(i.price)}`),
    `总价：${money(r.total)}（一年前约 ${money(r.baseTotal)}，行情溢价 +${money(r.market.premium)} / +${r.market.premiumRate}%）`,
    `溢价构成：${r.market.hikes.length ? r.market.hikes.map((h) => `${h.label} +${money(h.diff)}`).join('，') : '无'}`,
    `战斗力：${r.score}/100（${r.tier.name}） — ${r.tier.quip}`,
    r.fps.fhd ? `帧数预估：1080P ${r.fps.fhd} / 2K ${r.fps.qhd} / 4K ${r.fps.uhd} fps` : '帧数预估：核显配置',
    `满载功耗：${r.power}W · 年耗电约 ${r.kwh} 度（${money(r.yearlyCost)}）`,
    `装机难度：${r.difficulty.level}`,
    ...r.scenarios.map((s) => `${s.name}：${s.text}`)
  ].join('\n');
  const btn = document.getElementById('btnCopy');
  const done = () => { btn.textContent = '已复制 ✓'; setTimeout(() => (btn.textContent = '复制文字清单'), 1600); };
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = lines; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove(); done();
  };
  if (navigator.clipboard) navigator.clipboard.writeText(lines).then(done, fallback);
  else fallback();
}

/* ---------------- 小工具 ---------------- */

let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------------- 启动 ---------------- */

if (typeof document !== 'undefined') {
  const m = location.hash.match(/b=([0-9a-z]+)/i);
  if (m && decodeBuild(m[1])) toast('已载入分享链接里的配置');
  document.getElementById('presets').innerHTML = PRESETS.map(
    (p) => `<button class="preset" data-id="${p.id}"><b>${p.name}</b><span>${p.desc}</span></button>`
  ).join('');
  document.getElementById('presets').querySelectorAll('.preset').forEach((b) =>
    b.addEventListener('click', () => applyPreset(b.dataset.id))
  );
  document.getElementById('closeModal').addEventListener('click', () =>
    document.getElementById('cardModal').classList.remove('show')
  );
  document.getElementById('cardModal').addEventListener('click', (e) => {
    if (e.target.id === 'cardModal') e.currentTarget.classList.remove('show');
  });
  document.getElementById('closeGuide').addEventListener('click', () =>
    document.getElementById('guideModal').classList.remove('show')
  );
  document.getElementById('guideModal').addEventListener('click', (e) => {
    if (e.target.id === 'guideModal') e.currentTarget.classList.remove('show');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.getElementById('cardModal').classList.remove('show');
      document.getElementById('guideModal').classList.remove('show');
    }
  });
  render();
  /* #card=1 打开页面时直接弹出配置单卡片，方便分享时一步到位 */
  if (/card=1/.test(location.hash)) {
    const btn = document.getElementById('btnCard');
    if (btn) btn.click();
  }
}

if (typeof module !== 'undefined') {
  module.exports = { evaluate, state, catStatus, encodeBuild, decodeBuild };
}
