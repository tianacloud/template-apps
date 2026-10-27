/* Agent 编排沙盘 · 核心引擎
 * 零依赖：工作流图模型 + 本地模拟执行器 + 提示词版本管理
 */
export const NodeKind = {
  start: { label: '开始', color: '#34d399', icon: '▶' },
  agent: { label: 'Agent', color: '#7c5cff', icon: '◆' },
  tool: { label: '工具', color: '#22d3ee', icon: '⚙' },
  branch: { label: '条件', color: '#fbbf24', icon: '⑂' },
  merge: { label: '汇总', color: '#f472b6', icon: '⊕' },
  end: { label: '结束', color: '#94a3b8', icon: '■' }
};

export const ToolRegistry = {
  webSearch: { label: '联网搜索', args: ['query'] },
  httpGet: { label: 'HTTP 请求', args: ['url'] },
  codeExec: { label: '代码执行', args: ['lang', 'code'] },
  fileRead: { label: '读取文件', args: ['path'] },
  knowledge: { label: '知识库检索', args: ['query'] },
  notify: { label: '发送通知', args: ['channel', 'text'] }
};

export const AgentRoles = [
  { id: 'planner', label: '规划者', duty: '拆解任务、编排子步骤' },
  { id: 'researcher', label: '研究员', duty: '搜集信息、交叉验证' },
  { id: 'coder', label: '工程师', duty: '写代码、调试实现' },
  { id: 'critic', label: '审查者', duty: '挑错、找风险' },
  { id: 'writer', label: '写作者', duty: '组织语言、输出成品' }
];

/* ───────────── 提示词模板 ───────────── */
export const PromptTemplates = {
  planner: (input) =>
    `你是一名项目规划者。用户目标如下：\n\n${input}\n\n请把它拆成 3-6 个可独立执行的子任务，每个子任务说明：交付物、依赖、验收标准。`,
  researcher: (input) =>
    `你是一名研究员。基于以下信息找出关键事实、数据来源与不确定性：\n\n${input}\n\n输出：结论要点 / 证据 / 存疑点。`,
  coder: (input) =>
    `你是一名工程师。请根据以下需求给出实现方案与关键代码片段：\n\n${input}\n\n注意边界情况与错误处理。`,
  critic: (input) =>
    `你是一名严格的审查者。指出以下产出中的问题、风险与遗漏：\n\n${input}\n\n按「严重 / 一般 / 建议」分级。`,
  writer: (input) =>
    `你是一名写作者。把以下要点整理成一篇结构清晰、面向读者的成稿：\n\n${input}\n\n保持事实准确，不要编造数据。`
};

/* ───────────── 图模型 ───────────── */
export function createGraph() {
  return {
    nodes: [
      { id: 'n1', kind: 'start', x: 90, y: 220, title: '开始', role: 'planner', prompt: '', config: {} },
      { id: 'n2', kind: 'agent', x: 330, y: 220, title: '任务规划', role: 'planner', prompt: '', config: {} },
      { id: 'n3', kind: 'agent', x: 570, y: 130, title: '资料搜集', role: 'researcher', prompt: '', config: { tool: 'webSearch' } },
      { id: 'n4', kind: 'agent', x: 570, y: 310, title: '实现方案', role: 'coder', prompt: '', config: { tool: 'codeExec' } },
      { id: 'n5', kind: 'branch', x: 810, y: 220, title: '质量闸门', role: 'critic', prompt: '', config: { threshold: 0.7 } },
      { id: 'n6', kind: 'merge', x: 1050, y: 220, title: '汇总输出', role: 'writer', prompt: '', config: {} },
      { id: 'n7', kind: 'end', x: 1270, y: 220, title: '结束', role: 'writer', prompt: '', config: {} }
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2' },
      { id: 'e2', from: 'n2', to: 'n3' },
      { id: 'e3', from: 'n2', to: 'n4' },
      { id: 'e4', from: 'n3', to: 'n5' },
      { id: 'e5', from: 'n4', to: 'n5' },
      { id: 'e6', from: 'n5', to: 'n6', label: '通过' },
      { id: 'e7', from: 'n5', to: 'n4', label: '打回', back: true },
      { id: 'e8', from: 'n6', to: 'n7' }
    ]
  };
}

export function graphStats(g) {
  const byKind = {};
  for (const n of g.nodes) byKind[n.kind] = (byKind[n.kind] || 0) + 1;
  // 拓扑排序检测环（back 边是刻意设计的回路，不算环）
  const fwd = g.edges.filter(e => !e.back);
  const indeg = {};
  g.nodes.forEach(n => (indeg[n.id] = 0));
  fwd.forEach(e => { if (indeg[e.to] !== undefined) indeg[e.to]++; });
  const q = g.nodes.filter(n => indeg[n.id] === 0).map(n => n.id);
  let visited = 0;
  while (q.length) {
    const id = q.shift(); visited++;
    fwd.filter(e => e.from === id).forEach(e => {
      indeg[e.to]--;
      if (indeg[e.to] === 0) q.push(e.to);
    });
  }
  const hasCycle = visited !== g.nodes.length;
  const connected = new Set();
  g.edges.forEach(e => { connected.add(e.from); connected.add(e.to); });
  const orphans = g.nodes.filter(n => !connected.has(n.id)).map(n => n.id);
  const backs = g.edges.filter(e => e.back).length;
  return { total: g.nodes.length, edges: g.edges.length, byKind, hasCycle, orphans, backs };
}

/* ───────────── 模拟执行器 ───────────── */
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}

function rng(seed) {
  let s = seed || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const SAMPLE_POOL = {
  planner: [
    '1. 明确目标与边界：确认输入形式、输出形态、验收口径\n2. 拆分主流程：识别必须步骤与可选增强\n3. 定义数据契约：输入字段、输出字段、错误语义\n4. 排定交付节奏：按可验证的最小单元切分',
    '拆解为四个阶段：澄清 → 原型 → 实现 → 验证。每阶段给出可独立验收的产出物，避免并行返工。'
  ],
  researcher: [
    '事实要点：主流实现集中在三条技术路线，成本与交付周期差异显著。\n证据：官方文档版本号与发布日期可追溯。\n存疑点：社区方案多为个人实践，缺少规模验证。',
    '检索到 7 条相关资料，其中 3 条来自一手来源。数据口径不一致，跨源对比时需注意时间窗口与样本量。'
  ],
  coder: [
    '方案：先跑通最小闭环（输入→解析→输出），再补异常分支。\n关键点：解析层做 schema 校验并返回结构化错误；边界：超长输入需分片。\n```js\nfunction parse(input){ if(!input) return {ok:false,err:"empty"}; return {ok:true,data:input}; }\n```',
    '实现要点：状态机管理阶段流转，每阶段独立可重入；对外部依赖全部走统一适配层，便于替换。'
  ],
  critic: [
    '严重：缺少异常路径说明，失败时行为未定义。\n一般：术语不统一，验收口径存在歧义。\n建议：补充一个反例样本用于回归。',
    '主要风险在边界条件与数据规模。性能目标缺少可测指标。建议先定基线再谈优化。'
  ],
  writer: [
    '已整理为三段式成稿：问题背景 → 方案对比 → 落地建议。每条结论都标注了来源，可直接对外分享。',
    '成稿完成，共 3 个小节、约 600 字，保留全部关键数字与限定条件，未做超出原始信息的推断。'
  ]
};

/**
 * 模拟执行整个图，产出带时间轴的运行记录。
 * 不调用任何外部服务，纯本地模拟，用于演示编排逻辑与回放。
 */
export function simulate(graph, input) {
  const t0 = performance.now();
  const events = [];
  const results = {};
  let clock = 0;
  const rand = rng(hashSeed(input + graph.nodes.length));

  const order = topoOrder(graph);
  const incoming = {};
  graph.nodes.forEach(n => (incoming[n.id] = []));
  graph.edges.forEach(e => incoming[e.to].push(e));

  let guard = 0;
  for (const id of order) {
    if (guard++ > 200) break;
    const node = graph.nodes.find(n => n.id === id);
    if (!node) continue;
    if (node.kind === 'start') {
      results[id] = input;
      events.push({ t: clock, nodeId: id, phase: 'done', text: '接收输入 ' + String(input).slice(0, 40) });
      continue;
    }
    if (node.kind === 'end') {
      events.push({ t: clock, nodeId: id, phase: 'done', text: '流程结束' });
      continue;
    }
    // 汇总输入
    const upstream = incoming[id].map(e => results[e.from]).filter(Boolean);
    const ctx = upstream.length ? upstream.join('\n---\n') : input;

    const dur = 320 + Math.floor(rand() * 520);
    events.push({ t: clock, nodeId: id, phase: 'run', text: `${NodeKind[node.kind].label}「${node.title}」执行中` });

    // 分支判定
    if (node.kind === 'branch') {
      const score = 0.55 + rand() * 0.42;
      const th = node.config.threshold ?? 0.7;
      const pass = score >= th;
      events.push({
        t: clock + dur, nodeId: id, phase: pass ? 'done' : 'reject',
        text: `质量分 ${score.toFixed(2)} ${pass ? '≥' : '<'} 阈值 ${th} → ${pass ? '通过' : '打回重做'}`
      });
      results[id] = { score, pass };
      clock += dur;
      if (!pass) {
        // 走 label 匹配的边
        const back = graph.edges.find(e => e.from === id && e.label === '打回');
        if (back) events.push({ t: clock, nodeId: back.to, phase: 'retry', text: '被打回，重新执行' });
      }
      continue;
    }

    const pool = SAMPLE_POOL[node.role] || SAMPLE_POOL.planner;
    const text = pool[Math.floor(rand() * pool.length)];
    const hasTool = node.config && node.config.tool;
    if (hasTool) {
      const tool = ToolRegistry[node.config.tool];
      events.push({ t: clock + dur * 0.35, nodeId: id, phase: 'tool', text: `调用工具：${tool ? tool.label : node.config.tool}` });
    }
    results[id] = text;
    events.push({ t: clock + dur, nodeId: id, phase: 'done', text: `「${node.title}」完成，产出 ${text.length} 字` });
    clock += dur;
  }

  return { events, results, durationMs: Math.round(performance.now() - t0), simulatedClock: clock };
}

function topoOrder(graph) {
  const indeg = {};
  graph.nodes.forEach(n => (indeg[n.id] = 0));
  graph.edges.forEach(e => { if (indeg[e.to] !== undefined) indeg[e.to]++; });
  const q = graph.nodes.filter(n => indeg[n.id] === 0).map(n => n.id);
  const out = [];
  while (q.length) {
    const id = q.shift(); out.push(id);
    graph.edges.filter(e => e.from === id).forEach(e => {
      indeg[e.to]--;
      if (indeg[e.to] === 0) q.push(e.to);
    });
  }
  // 有环时把剩余节点追加在末尾
  graph.nodes.forEach(n => { if (!out.includes(n.id)) out.push(n.id); });
  return out;
}

/* ───────────── 提示词版本管理 ───────────── */
export function buildPrompt(node, input) {
  const tpl = PromptTemplates[node.role] || PromptTemplates.planner;
  let p = tpl(input);
  if (node.prompt && node.prompt.trim()) {
    p += '\n\n【附加要求】\n' + node.prompt.trim();
  }
  if (node.config && node.config.tool) {
    const tool = ToolRegistry[node.config.tool];
    p += `\n\n【可用工具】${tool ? tool.label : node.config.tool}`;
  }
  return p;
}

export function promptVersion(node) {
  // 用内容哈希做版本号，改一次提示词就升一版
  const h = hashSeed((node.prompt || '') + '|' + node.role);
  return 'v' + ((h % 90) + 10) + '.' + (h % 10);
}
