import { createTianaFetch } from '@tianacloud/serverless';
/* =========================================================================
 * 墨舟 · 自动发布文章
 * 纯前端单页应用 —— 无后端、无 API Key、无外部依赖
 *
 * 结构：
 *   1. 常量与素材库
 *   2. 生成引擎（本地模板组合）
 *   3. 存储层（SQLite）
 *   4. 视图渲染
 *   5. 编辑器 / 发布 / 定时队列
 *   6. 事件绑定与初始化
 * ========================================================================= */

'use strict';

/* ============================ 1. 常量与素材库 ============================ */


const PLATFORMS = [
  { id: 'wechat', name: '公众号', desc: '长文深度、结构清晰、有观点输出' },
  { id: 'zhihu',  name: '知乎',   desc: '论证严谨、举例对比、回答体' },
  { id: 'juejin', name: '掘金',   desc: '技术向、要点罗列、可复用方法' },
  { id: 'xhs',    name: '小红书', desc: '轻快语气、短段落、emoji 与要点' },
];

const TONES = [
  { id: 'professional', name: '专业严谨' },
  { id: 'casual',       name: '轻松口语' },
  { id: 'story',        name: '故事叙述' },
  { id: 'sharp',        name: '犀利观点' },
];

const STATUS_META = {
  draft:     { label: '草稿',   cls: 'badge-indigo' },
  pending:   { label: '待发布', cls: 'badge-amber' },
  published: { label: '已发布', cls: 'badge-green' },
  failed:    { label: '失败',   cls: 'badge-red' },
};

/* --- 素材库 --- */

const HOOKS = {
  professional: [
    '在过去一年里，{topic} 从「知道的人不多」变成了团队绕不开的议题。真正拉开差距的，往往不是工具本身，而是使用它的方式。',
    '先说结论：{topic} 的价值不在「更快」，而在「更稳」。它把原本依赖个人经验的环节，变成了可以复用的流程。',
    '关于 {topic}，市面上信息很多，但大多停留在概念层。这篇文章尝试把它拆到可执行的颗粒度。',
  ],
  casual: [
    '说真的，{topic} 这件事我一开始也不太当回事，直到它真真切切帮我省下了几个下午。',
    '最近老有人问我：{topic} 到底值不值得花时间？我的答案是——值得，但别按大多数教程那样做。',
    '如果你也在纠结 {topic}，先别急着买课。这篇文章把该踩的坑和不该踩的坑都写清楚了。',
  ],
  story: [
    '三个月前，我接手了一个几乎没有人愿意接的项目。也是从那时起，{topic} 成了我每天都要面对的东西。',
    '我记得很清楚，那天下午三点，屏幕上的方案第十一次被退回。后来我意识到，问题不在能力，而在 {topic} 这件事本身。',
    '最初我只是想把 {topic} 搞清楚。没想到这一路走下来，改变的是我做事的方式。',
  ],
  sharp: [
    '一句话：{topic} 被过度包装了。真正有用的部分可能只有两成，但这两成足够改变结果。',
    '如果你还在用「努力程度」解释 {topic} 的差距，那你大概率会一直停在原地。',
    '大多数关于 {topic} 的建议都是对的，但也是没用的——因为它们跳过了一个前提。',
  ],
};

const BODY_INTRO = {
  professional: '在展开之前，需要先对齐一个前提：{topic} 不是一个孤立的技巧，而是一套由「目标—路径—反馈」组成的系统。理解了这层结构，后面所有具体做法才有落脚点。',
  casual: '我们先把话说直白点：{topic} 这事儿，难的地方从来不是操作，而是判断什么时候该用它。下面是我摸索出来的一套顺序，你可以直接抄。',
  story: '那段时间我反复问自己一个问题：如果重来一次，我会从哪一步开始？现在回头看，答案很清楚——先停下来，把 {topic} 这件事的边界画清楚。',
  sharp: '要讨论 {topic}，得先把噪音剔掉。下面这三件事，是我认为真正决定结果的，其余大多是锦上添花。',
};

const SECTION_POOL = [
  {
    title: '为什么现在值得重视',
    lead: '任何方法都有适用窗口。{topic} 之所以在最近被频繁提起，是因为三个条件同时成立了：',
    bullets: [
      '成本门槛降下来了，试错的代价从「一个季度」缩短到「一个下午」',
      '输入和输出的链路被打通，{kw1} 不再停留在纸面上',
      '可复用的模板变多，个人经验第一次能被沉淀成团队资产',
    ],
    close: '换句话说，现在动手的性价比，比一年前高出一个量级。',
  },
  {
    title: '落地时的四个关键动作',
    lead: '把方法拆开看，真正有效的动作其实只有四个：',
    bullets: [
      '先定输出的形状：想清楚最终交付物长什么样，再倒推输入需要什么',
      '把判断标准写下来：{kw1} 好不好，不能凭感觉，要有可对照的尺子',
      '控制单次范围：一次只改一个变量，才能分清是哪个动作起了作用',
      '留下过程记录：{kw2} 的价值一半在结果，一半在过程可回溯',
    ],
    close: '这四步听起来朴素，但绝大多数失败案例，缺的都是其中某一步。',
  },
  {
    title: '常见的三个误区',
    lead: '在推进 {topic} 的过程中，最容易踩的坑有这些：',
    bullets: [
      '把工具当答案：换了工具，问题照旧，因为流程没变',
      '在低频环节过度优化：收益有限，维护成本却持续上升',
      '忽略人的接受度：再好的 {kw1} 方案，落地时也要考虑协作成本',
    ],
    close: '判断标准很简单：这个动作能不能被重复？不能重复的优化，本质是一次性消耗。',
  },
  {
    title: '一个可参考的执行节奏',
    lead: '如果你打算在自己的工作里试一次，可以按这个节奏走：',
    bullets: [
      '第一周：只做观察，记录现状耗时与卡点，不做任何改动',
      '第二周：挑一个最小环节替换方法，其他环节保持不变',
      '第三周：对比数据，确认收益来自哪个改动，再决定是否扩大',
      '第四周：把有效做法写成模板，让 {kw2} 变成默认路径',
    ],
    close: '节奏比强度重要。稳定的每周一小步，比一次性大改造更容易留下来。',
  },
  {
    title: '如何衡量是否真的有效',
    lead: '没有度量，就没有改进。关于 {kw1}，建议盯住这几个指标：',
    bullets: [
      '完成一件事的端到端时间，而不是某个单点环节的快慢',
      '返工比例：一次通过的比例越高，说明前置判断越准',
      '复用次数：同一套 {kw2} 方法被调用了几次，是最直接的资产指标',
    ],
    close: '指标不必多，三个足够。关键是每周固定看一次，而不是等出问题才翻。',
  },
  {
    title: '给不同阶段的人的建议',
    lead: '起点不同，优先级也不同：',
    bullets: [
      '刚接触：先用现成模板跑通一次完整流程，别急着自建体系',
      '有基础：开始记录自己的判断依据，把隐性经验显性化',
      '带团队：重点从「自己做得好」转向「让别人也做得对」',
    ],
    close: '每个阶段的瓶颈都不一样，用上一阶段的解法硬套，往往是最耗时的错。',
  },
];

const CLOSERS = {
  professional: [
    '回到最初的问题：{topic} 到底改变了什么？我的答案是，它把不确定性变成了可管理的步骤。这比任何单点技巧都更有长期价值。',
    '以上是我在 {topic} 上的一些实践。方法会迭代，但「先定义问题，再选工具」的顺序不会变。',
  ],
  casual: [
    '说到底，{topic} 没那么玄。你只需要今天花二十分钟试一次，剩下的自然会在用的过程中长出来。',
    '别一次改太多，挑一个最小的点先跑起来。等你看到第一次省下来的时间，动力自己就来了。',
  ],
  story: [
    '后来那个项目上线了，不算完美，但每个环节都留了痕迹。我最大的收获不是做成了什么，而是终于知道 {topic} 该怎么开始。',
    '如果让我给三个月前的自己留一句话，大概是：别急着优化，先把问题写清楚。关于 {topic}，这句话依然成立。',
  ],
  sharp: [
    '所以别再问 {topic} 值不值得做了。该问的是：你打算用哪两成动作，换掉现在八成的时间浪费。',
    '结论放在这儿：{topic} 不是加分项，而是基础项。还想靠它「弯道超车」的，大概率会失望。',
  ],
};

const QUOTES = [
  '好的方法不是让人更忙，而是让人更早停下来判断。',
  '流程的价值在于：它让正确的事变得更容易发生。',
  '不要用战术上的勤奋，掩盖判断上的懒惰。',
  '能被复用的经验，才算真正属于你。',
  '先把问题定义清楚，解决方案会自己浮出来。',
];

const TITLE_TPL = [
  '从 0 到 1：我如何用{kw1}重构{topic}',
  '{topic} 的三个关键动作，第 2 个最容易被忽略',
  '别再走弯路了，{topic} 的正确打开方式',
  '{topic}：一份可以直接抄的落地清单',
  '做了半年{kw1}，我总结了{topic}的五个真相',
  '{topic}到底值不值得做？先看这四条判断',
  '关于{topic}，我想说三句实话',
  '{kw1}时代，{topic}该怎么做',
  '我用{kw1}解决了{topic}，过程比结果更值钱',
  '{topic}避坑指南：这 3 个误区要避开',
];

const XHS_TITLE_TPL = [
  '谁懂啊！{topic}这样做真的省事 😭',
  '{topic}保姆级教程｜新手也能一次上手✨',
  '后悔没早点知道的{topic}小技巧',
  '{kw1}亲测有效，{topic}终于不踩坑了',
  '{topic}｜我的 5 条私藏经验',
];

const TAG_POOL = ['效率提升', '方法论', '工作经验', '实操指南', '个人成长', '工具推荐', '流程优化', '复盘总结', '避坑', '深度长文', '入门必看', '干货分享'];

const SAMPLE_TOPICS = [
  { topic: '如何用 AI 提升内容创作效率', kw: '效率, 工作流, 提效' },
  { topic: '远程团队的协作方式该怎么改', kw: '远程办公, 协作, 沟通' },
  { topic: '普通人怎么建立自己的知识体系', kw: '知识管理, 笔记, 复盘' },
  { topic: '为什么你的项目总是延期', kw: '项目管理, 排期, 风险' },
  { topic: '前端性能优化的实战路径', kw: '前端, 性能, 优化' },
  { topic: '坚持写作一年后我的变化', kw: '写作, 坚持, 输出' },
];

/* ============================ 2. 生成引擎 ============================ */

/** 简单可复现的伪随机（让同一次生成内保持一致，同时保证每次点击结果不同） */
function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return function () {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length) % arr.length];
}

function pickN(arr, n, rng) {
  const copy = arr.slice();
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  }
  return out;
}

function cleanTopic(t) {
  return String(t || '').trim().replace(/[。！？!?.]+$/, '');
}

function fill(str, ctx) {
  // 模板中英文词与中文混排时，吞掉占位符两侧多余的空格
  return str
    .replace(/\s*\{(\w+)\}\s*/g, (_, k) => (ctx[k] != null ? String(ctx[k]).trim() : ''))
}

/** 生成 3 个标题候选 */
function genTitles(platform, ctx, rng) {
  const pool = platform === 'xhs' ? XHS_TITLE_TPL : TITLE_TPL;
  const picked = pickN(pool, 3, rng);
  return picked.map(tpl => fill(tpl, ctx));
}

/** 生成摘要 */
function genSummary(platform, tone, ctx, rng) {
  const base = {
    wechat: `本文从「${ctx.kw1}」的视角重新梳理${ctx.topic}：先拆清问题的边界，再给出可落地的动作清单，最后说明如何衡量效果。适合想系统性推进、而不只是收藏一堆技巧的读者。`,
    zhihu:  `围绕「${ctx.topic}」这个问题，本文给出的不是结论而是判断路径：为什么现在值得做、关键动作有哪几个、常见误区在哪，以及一套可验证的衡量方式。`,
    juejin: `一篇关于${ctx.topic}的实践总结：包含${ctx.kw1}的落地步骤、可控的执行节奏、以及可量化的验收指标，可直接对照改造现有流程。`,
    xhs:    `把${ctx.topic}讲人话版 ✨ 不吹概念，只讲怎么开始、先做哪一步、哪里最容易翻车。看完能立刻上手，新手友好～`,
  };
  let s = base[platform] || base.wechat;
  if (tone === 'casual') s = s.replace('本文', '这篇').replace('适合想系统性推进、而不只是收藏一堆技巧的读者。', '看完就能上手，不用再收藏一堆吃灰的教程。');
  return s;
}

/** 生成正文（Markdown 风格字符串） */
function genBody(platform, tone, ctx, targetWords, rng) {
  const blocks = [];

  // 开场
  blocks.push(fill(pick(HOOKS[tone] || HOOKS.professional, rng), ctx));

  // 引入段
  blocks.push(fill(BODY_INTRO[tone] || BODY_INTRO.professional, ctx));

  if (platform === 'xhs') {
    // 小红书风格：短段落 + emoji + 要点
    blocks.push('📌 **先说结论**');
    blocks.push(`- ${ctx.topic} 不用一步到位，先跑通最小闭环\n- 重点不是工具，是判断标准\n- 每周固定复盘一次，比每天瞎试有效`);

    blocks.push('## 我是怎么开始的');
    blocks.push(`第一步真的很难。我当时的做法是：把 ${ctx.kw1} 相关的事情全部列出来，然后只挑一件今天就能做完的。`);

    blocks.push('## 三个亲测有效的小技巧');
    blocks.push(`- 别追求完美模板，先写下来再改\n- 用 ${ctx.kw2} 记录过程，回看时会感谢自己\n- 遇到卡点先问「这一步能不能删掉」`);

    blocks.push('## 千万别踩的坑');
    blocks.push(`- 一上来就搭复杂体系，三天后放弃\n- 只看教程不动手，收藏夹吃灰\n- 追求工具全，忽略流程顺`);

    blocks.push('## 最后说一句');
    blocks.push(fill(pick(CLOSERS[tone] || CLOSERS.casual, rng), ctx));

    return blocks.join('\n\n');
  }

  // 其它平台：按目标字数挑选章节
  const sectionCount = targetWords > 1500 ? 5 : targetWords > 1000 ? 4 : 3;
  const sections = pickN(SECTION_POOL, sectionCount, rng);

  sections.forEach((sec, i) => {
    blocks.push(`## ${sec.title}`);
    blocks.push(fill(sec.lead, ctx));
    blocks.push(fill(sec.bullets.map(b => `- ${fill(b, ctx)}`).join('\n'), ctx));
    // 中途插入金句，增加人味
    if (i === 1 && rng() > 0.35) {
      blocks.push(`> ${pick(QUOTES, rng)}`);
    }
    if (sec.close) blocks.push(fill(sec.close, ctx));
  });

  // 结语
  const closerTitle = platform === 'juejin' ? '小结' : '写在最后';
  blocks.push(`## ${closerTitle}`);
  blocks.push(fill(pick(CLOSERS[tone] || CLOSERS.professional, rng), ctx));

  if (platform === 'zhihu' || platform === 'juejin') {
    blocks.push(`如果你也在做 ${ctx.topic}，欢迎在评论区说说你的做法——方法没有唯一解，但踩过的坑可以共享。`);
  }

  return blocks.join('\n\n');
}

/** 生成标签 */
function genTags(ctx, platform, rng) {
  const extra = platform === 'xhs' ? ['新手友好', '亲测推荐'] : ['实战', '深度'];
  const base = [ctx.kw1, ctx.kw2].filter(Boolean);
  const fromPool = pickN(TAG_POOL, 4, rng);
  return Array.from(new Set([...base, ...fromPool, ...pickN(extra, 1, rng)])).slice(0, 7);
}

/** 主生成入口 */
function generateArticle({ topic, keywords, platform, tone, words }) {
  const rng = makeRng(Date.now() % 100000 + Math.floor(Math.random() * 99999));
  const kws = keywords.map(k => k.trim()).filter(Boolean);
  const ctx = {
    topic: cleanTopic(topic) || '这件事',
    kw1: kws[0] || '效率',
    kw2: kws[1] || kws[0] || '方法',
    kw3: kws[2] || kws[1] || '流程',
  };

  const titles = genTitles(platform, ctx, rng);
  const summary = genSummary(platform, tone, ctx, rng);
  const body = genBody(platform, tone, ctx, words, rng);
  const tags = genTags(ctx, platform, rng);

  return { titles, summary, body, tags, ctx };
}

/* ============================ 3. 存储层 ============================ */

const Store = {
  data: null,

  defaults() {
    return {
      version: 1,
      articles: [],        // 所有文章（含草稿 / 待发布 / 已发布 / 失败）
      theme: 'light',
      config: { endpoint: '', model: '', key: '' },
      lastGenerate: null,
    };
  },

  async load() {
    if (!window.tiana?.auth?.getAccessToken || !window.tiana?.connection) throw new Error('账号认证尚未就绪');
    const conn = await window.tiana.connection();
    if (conn.sql_api !== 'hrana-v3') throw new Error('数据库协议暂不支持');
    const send = createTianaFetch({origin: conn.origin, auth: window.tiana.auth, requestBodyMode: 'buffered'});
    this.execute = async (sql, args = []) => {
      const response = await send(conn.origin + '/v3/pipeline', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
      if (!response.ok) throw new Error('数据库请求失败，写入结果可能未知');
      const body = await response.json(), statement = body.results?.[0];
      if (statement?.type !== 'ok' || statement.response?.type !== 'execute') throw new Error('数据库操作失败，写入结果可能未知');
      return statement.response.result;
    };
    const result = await this.execute('SELECT data, revision FROM mozhou_state WHERE id = 1');
    const raw = result.rows?.[0]?.[0]?.value;
    this.revision = Number(result.rows?.[0]?.[1]?.value || 0);
    this.data = raw ? Object.assign(this.defaults(), JSON.parse(raw)) : this.defaults();
    this.data.config = {...this.data.config, key: ''};
    if (!Array.isArray(this.data.articles)) this.data.articles = [];
    this.pending = Promise.resolve();
  },

  save() {
    // The optional API key is session-only and never enters the database or exports.
    const snapshot = JSON.stringify({...this.data, config: {...this.data.config, key: ''}});
    this.pending = this.pending.then(async () => {
      const result = await this.execute('INSERT INTO mozhou_state (id,data,revision) VALUES (1,?,1) ON CONFLICT(id) DO UPDATE SET data=excluded.data, revision=mozhou_state.revision+1 WHERE mozhou_state.revision=?', [{type:'text',value:snapshot}, {type:'integer',value:String(this.revision)}]);
      if (Number(result.affected_row_count) !== 1) throw new Error('数据已在其他会话更改，请刷新后核对');
      this.revision++;
    });
    this.pending.catch(e => {
      console.error('数据库写入失败', e);
      toast('保存失败或结果未知，请刷新核对后再操作', 'err');
      // Stop subsequent writes after an uncertain result until the page is reloaded.
      this.save = () => toast('保存已暂停，请刷新核对数据', 'err');
    });
  },

  /** 新增或更新文章 */
  upsert(article) {
    const idx = this.data.articles.findIndex(a => a.id === article.id);
    if (idx >= 0) this.data.articles[idx] = article;
    else this.data.articles.unshift(article);
    this.save();
  },

  remove(id) {
    this.data.articles = this.data.articles.filter(a => a.id !== id);
    this.save();
  },

  get(id) {
    return this.data.articles.find(a => a.id === id) || null;
  },

  clearAll() {
    this.data = this.defaults();
    this.save();
  },
};

function uid() {
  return 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function nowISO() { return new Date().toISOString(); }

/* ============================ 工具函数 ============================ */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function fmtTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fmtRelative(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const future = diff < 0;
  const m = Math.round(abs / 60000);
  let txt;
  if (m < 1) txt = '刚刚';
  else if (m < 60) txt = `${m} 分钟`;
  else if (m < 1440) txt = `${Math.round(m / 60)} 小时`;
  else txt = `${Math.round(m / 1440)} 天`;
  if (txt === '刚刚') return txt;
  return future ? `${txt}后` : `${txt}前`;
}

function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso), n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

function wordCount(text) {
  const t = String(text || '').replace(/[#>*\-\s]/g, '');
  return t.length;
}

function platformName(id) {
  const p = PLATFORMS.find(x => x.id === id);
  return p ? p.name : id;
}

function platformBadge(id) {
  return `<span class="pf pf-${esc(id)}">${esc(platformName(id))}</span>`;
}

function statusBadge(status) {
  const m = STATUS_META[status] || STATUS_META.draft;
  return `<span class="badge ${m.cls}">${m.label}</span>`;
}

/* --- Markdown 渲染（够用即可：## 标题 / - 列表 / > 引用 / **粗体**） --- */
function mdToHtml(md) {
  const lines = String(md || '').split('\n');
  let html = '';
  let inList = false;

  const inline = t => esc(t)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

  const closeList = () => { if (inList) { html += '</ul>'; inList = false; } };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) { closeList(); continue; }

    if (/^###\s+/.test(line)) {
      closeList();
      html += `<h3>${inline(line.replace(/^###\s+/, ''))}</h3>`;
    } else if (/^##\s+/.test(line)) {
      closeList();
      html += `<h3>${inline(line.replace(/^##\s+/, ''))}</h3>`;
    } else if (/^#\s+/.test(line)) {
      closeList();
      html += `<h3>${inline(line.replace(/^#\s+/, ''))}</h3>`;
    } else if (/^>\s?/.test(line)) {
      closeList();
      html += `<div class="quote">${inline(line.replace(/^>\s?/, ''))}</div>`;
    } else if (/^[-*+]\s+/.test(line)) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inline(line.replace(/^[-*+]\s+/, ''))}</li>`;
    } else if (/^\d+[.、]\s+/.test(line)) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inline(line.replace(/^\d+[.、]\s+/, ''))}</li>`;
    } else {
      closeList();
      html += `<p>${inline(line)}</p>`;
    }
  }
  closeList();
  return html;
}

/** 生成标准 Markdown 文件内容 */
function toMarkdown(article) {
  const lines = [];
  lines.push(`# ${article.title}`);
  lines.push('');
  lines.push(`> 平台：${platformName(article.platform)}　|　创建：${fmtTime(article.createdAt)}`);
  if (article.tags && article.tags.length) lines.push(`> 标签：${article.tags.join(' / ')}`);
  lines.push('');
  if (article.summary) {
    lines.push(`**摘要**：${article.summary}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');
  lines.push(article.body);
  lines.push('');
  return lines.join('\n');
}

function download(filename, content, type = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function safeFilename(title) {
  return String(title || '未命名文章').replace(/[\\/:*?"<>|]/g, '_').slice(0, 60);
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    console.warn(e);
    return false;
  }
}

/* --- Toast --- */
function toast(msg, type = '') {
  const wrap = $('#toastWrap');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `<span class="t-dot"></span><span>${esc(msg)}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 240);
  }, 2400);
}

/* ============================ 4. 视图渲染 ============================ */

const UI = {
  view: 'dashboard',
  // 创作态
  gen: {
    platform: 'wechat',
    tone: 'professional',
    words: 1100,
    result: null,
    selectedTitle: 0,
  },
  editingId: null,     // 编辑器当前文章 id
  schedulingId: null,  // 定时中的文章 id
  viewId: null,        // 详情弹窗中的文章 id
  queueFilter: 'all',
  recordFilter: 'all',
  draftQuery: '',
};

function switchView(name) {
  UI.view = name;
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
  $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  closeNav();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderView(name);
}

function renderView(name) {
  switch (name) {
    case 'dashboard': renderDashboard(); break;
    case 'drafts':    renderDrafts(); break;
    case 'queue':     renderQueue(); break;
    case 'records':   renderRecords(); break;
    case 'settings':  renderSettings(); break;
    case 'create':    renderComposeState(); break;
  }
  renderBadges();
}

function renderAll() {
  renderBadges();
  renderView(UI.view);
}

function renderBadges() {
  const arts = Store.data.articles;
  const drafts = arts.filter(a => a.status === 'draft').length;
  const pending = arts.filter(a => a.status === 'pending').length;
  $('#badgeDrafts').textContent = drafts;
  $('#badgeQueue').textContent = pending;
  $('#badgeDrafts').style.display = drafts ? '' : 'none';
  $('#badgeQueue').style.display = pending ? '' : 'none';
}

/* ---------- 概览 ---------- */
function renderDashboard() {
  const arts = Store.data.articles;
  const todayPublished = arts.filter(a => a.status === 'published' && isToday(a.publishedAt)).length;
  const pending = arts.filter(a => a.status === 'pending').length;
  const drafts = arts.filter(a => a.status === 'draft').length;
  const totalPublished = arts.filter(a => a.status === 'published').length;

  animateNum($('#statPublished'), todayPublished);
  animateNum($('#statPending'), pending);
  animateNum($('#statDrafts'), drafts);
  animateNum($('#statTotal'), totalPublished);

  const hour = new Date().getHours();
  const greet = hour < 6 ? '深夜了，注意休息。' : hour < 11 ? '早上好，今天写点什么？' : hour < 14 ? '中午好，来点灵感。' : hour < 19 ? '下午好，适合动笔。' : '晚上好，安静的时候最适合写。';
  const pendingHint = pending ? `另有 ${pending} 篇在队列中等待发布。` : '队列空闲，随时可以安排发布。';
  $('#todayLine').textContent = greet + ' ' + pendingHint;

  // 最近动态
  const recent = arts.slice().sort((a, b) => {
    const ta = new Date(a.publishedAt || a.scheduledAt || a.updatedAt || a.createdAt).getTime();
    const tb = new Date(b.publishedAt || b.scheduledAt || b.updatedAt || b.createdAt).getTime();
    return tb - ta;
  }).slice(0, 6);

  const box = $('#recentList');
  if (!recent.length) {
    box.innerHTML = `
      <div class="empty">
        <div class="empty-ic"><svg viewBox="0 0 24 24"><path d="M5 5h9l5 5v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M14 5v5h5"/></svg></div>
        <h3>还没有任何内容</h3>
        <p>从「创作文章」开始，生成第一篇文章试试看。</p>
        <button class="btn btn-primary" data-goto="create">开始创作</button>
      </div>`;
    return;
  }

  box.innerHTML = recent.map(a => {
    const time = a.status === 'pending' ? `计划 ${fmtTime(a.scheduledAt)}` :
                 a.status === 'published' ? fmtTime(a.publishedAt) :
                 `更新 ${fmtRelative(a.updatedAt || a.createdAt)}`;
    return `
      <div class="list-item" data-open="${a.id}">
        <div class="list-item-main">
          <div class="list-item-title">${esc(a.title || '未命名文章')}</div>
          <div class="list-item-sub">
            ${platformBadge(a.platform)}
            ${statusBadge(a.status)}
            <span>${esc(time)}</span>
          </div>
        </div>
        <div class="list-item-actions">
          <button class="mini-btn" data-open="${a.id}">查看</button>
        </div>
      </div>`;
  }).join('');
}

function animateNum(el, target) {
  const from = parseInt(el.textContent, 10) || 0;
  if (from === target) { el.textContent = target; return; }
  const start = performance.now();
  const dur = 380;
  const step = t => {
    const p = Math.min(1, (t - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (target - from) * eased);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- 草稿箱 ---------- */
function renderDrafts() {
  const q = UI.draftQuery.trim().toLowerCase();
  let list = Store.data.articles.filter(a => a.status === 'draft');
  if (q) {
    list = list.filter(a =>
      (a.title || '').toLowerCase().includes(q) ||
      platformName(a.platform).toLowerCase().includes(q) ||
      (a.tags || []).join(',').toLowerCase().includes(q)
    );
  }
  $('#draftCount').textContent = list.length;
  const box = $('#draftList');

  if (!list.length) {
    box.innerHTML = `
      <div class="empty">
        <div class="empty-ic"><svg viewBox="0 0 24 24"><path d="M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M14 4v5h5"/></svg></div>
        <h3>${q ? '没有匹配的草稿' : '草稿箱是空的'}</h3>
        <p>${q ? '换个关键词试试，或清空搜索框。' : '生成文章后点击「存为草稿」，就会出现在这里。'}</p>
        ${q ? '<button class="btn btn-ghost" id="btnClearSearch">清空搜索</button>' : '<button class="btn btn-primary" data-goto="create">去创作</button>'}
      </div>`;
    return;
  }

  box.innerHTML = list.map(a => `
    <div class="list-item">
      <div class="list-item-main">
        <div class="list-item-title">${esc(a.title || '未命名文章')}</div>
        <div class="list-item-sub">
          ${platformBadge(a.platform)}
          <span>${wordCount(a.body)} 字</span>
          <span class="sep"></span>
          <span>更新 ${fmtRelative(a.updatedAt || a.createdAt)}</span>
        </div>
      </div>
      <div class="list-item-actions">
        <button class="mini-btn" data-edit="${a.id}">编辑</button>
        <button class="mini-btn" data-publish="${a.id}">发布</button>
        <button class="mini-btn danger" data-del="${a.id}">删除</button>
      </div>
    </div>`).join('');
}

/* ---------- 队列 ---------- */
function renderQueue() {
  const f = UI.queueFilter;
  let list = Store.data.articles.filter(a => a.status !== 'draft');
  if (f !== 'all') list = list.filter(a => a.status === f);

  // 待发布按时间升序，其它按时间降序
  list.sort((a, b) => {
    const ta = new Date(a.scheduledAt || a.publishedAt || a.updatedAt || a.createdAt).getTime();
    const tb = new Date(b.scheduledAt || b.publishedAt || b.updatedAt || b.createdAt).getTime();
    return a.status === 'pending' && b.status === 'pending' ? ta - tb : tb - ta;
  });

  $$('#queueFilter .chip').forEach(c => c.classList.toggle('active', c.dataset.status === f));
  const box = $('#queueList');

  if (!list.length) {
    box.innerHTML = `
      <div class="empty">
        <div class="empty-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg></div>
        <h3>${f === 'all' ? '队列里还没有任务' : '该状态下暂无任务'}</h3>
        <p>${f === 'all' ? '去编辑器点「定时发布」，任务会排队在这里，到点自动发布。' : '切换筛选条件看看其它状态。'}</p>
        ${f === 'all' ? '<button class="btn btn-primary" data-goto="create">去创作</button>' : ''}
      </div>`;
    return;
  }

  box.innerHTML = list.map(a => {
    const isPending = a.status === 'pending';
    const timeLine = isPending
      ? `计划发布 ${fmtTime(a.scheduledAt)} · ${fmtRelative(a.scheduledAt)}`
      : a.status === 'published'
        ? `已发布 ${fmtTime(a.publishedAt)}`
        : `失败于 ${fmtTime(a.failedAt || a.updatedAt)}`;
    return `
      <div class="list-item">
        <div class="list-item-main">
          <div class="list-item-title">${esc(a.title || '未命名文章')}</div>
          <div class="list-item-sub">
            ${platformBadge(a.platform)}
            ${statusBadge(a.status)}
            <span>${esc(timeLine)}</span>
            ${isPending ? `<span class="sep"></span><span>倒计时 ${countdown(a.scheduledAt)}</span>` : ''}
          </div>
        </div>
        <div class="list-item-actions">
          ${isPending ? `<button class="mini-btn" data-cancel="${a.id}">取消定时</button>` : ''}
          <button class="mini-btn" data-open="${a.id}">详情</button>
          ${isPending ? `<button class="mini-btn" data-now="${a.id}">立即发布</button>` : ''}
          ${a.status === 'failed' ? `<button class="mini-btn" data-retry="${a.id}">重试</button>` : ''}
        </div>
      </div>`;
  }).join('');
}

function countdown(iso) {
  if (!iso) return '—';
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return '已到期';
  const s = Math.floor(diff / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h >= 24) return `${Math.floor(h / 24)} 天 ${h % 24} 小时`;
  if (h > 0) return `${h} 小时 ${m} 分`;
  return `${m} 分 ${s % 60} 秒`;
}

/* ---------- 记录 ---------- */
function renderRecords() {
  const f = UI.recordFilter;
  let list = Store.data.articles.filter(a => a.status !== 'draft');
  if (f !== 'all') list = list.filter(a => a.status === f);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  $$('#recordFilter .chip').forEach(c => c.classList.toggle('active', c.dataset.status === f));

  const tbody = $('#recTbody');
  const empty = $('#recEmpty');
  const table = $('#recTable');

  if (!list.length) {
    tbody.innerHTML = '';
    table.classList.add('hidden');
    empty.classList.remove('hidden');
    empty.innerHTML = `
      <div class="empty-ic"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg></div>
      <h3>${f === 'all' ? '暂无发布记录' : '该状态下暂无记录'}</h3>
      <p>在编辑器里点击「立即发布」或「定时发布」，记录会出现在这里。</p>`;
    return;
  }
  table.classList.remove('hidden');
  empty.classList.add('hidden');

  tbody.innerHTML = list.map(a => {
    const t = a.status === 'pending' ? a.scheduledAt : a.status === 'published' ? a.publishedAt : (a.failedAt || a.updatedAt);
    return `
      <tr>
        <td><div class="rec-title" title="${esc(a.title)}">${esc(a.title || '未命名文章')}</div></td>
        <td>${platformBadge(a.platform)}</td>
        <td>${statusBadge(a.status)}</td>
        <td class="rec-time">${esc(fmtTime(t))}</td>
        <td>
          <div class="rec-ops">
            <button class="mini-btn" data-open="${a.id}">详情</button>
            <button class="mini-btn" data-copy="${a.id}">复制</button>
            <button class="mini-btn" data-md="${a.id}">导出</button>
            ${a.status === 'pending' ? `<button class="mini-btn danger" data-cancel="${a.id}">取消</button>` : ''}
          </div>
        </td>
      </tr>`;
  }).join('');
}

/* ---------- 设置 ---------- */
function renderSettings() {
  const c = Store.data.config || {};
  $('#cfgEndpoint').value = c.endpoint || '';
  $('#cfgModel').value = c.model || '';
  $('#cfgKey').value = c.key || '';
}

/* ============================ 5. 创作表单 ============================ */

function buildComposeControls() {
  // 平台
  const pfSeg = $('#platformSeg');
  pfSeg.dataset.count = PLATFORMS.length;
  pfSeg.style.gridTemplateColumns = 'repeat(2, 1fr)';
  pfSeg.innerHTML = PLATFORMS.map(p => `
    <button class="seg-opt ${p.id === UI.gen.platform ? 'on' : ''}" data-platform="${p.id}" title="${esc(p.desc)}">
      <span class="pf-dot"></span>${esc(p.name)}
    </button>`).join('');

  // 语气
  const tSeg = $('#toneSeg');
  tSeg.innerHTML = TONES.map(t => `
    <button class="seg-opt ${t.id === UI.gen.tone ? 'on' : ''}" data-tone="${t.id}">${esc(t.name)}</button>`).join('');

  updatePlatformHint();
}

function updatePlatformHint() {
  const p = PLATFORMS.find(x => x.id === UI.gen.platform);
  $('#platformHint').textContent = p ? p.desc : '';
}

function renderComposeState() {
  $$('#platformSeg .seg-opt').forEach(b => b.classList.toggle('on', b.dataset.platform === UI.gen.platform));
  $$('#toneSeg .seg-opt').forEach(b => b.classList.toggle('on', b.dataset.tone === UI.gen.tone));
  $('#inpWords').value = UI.gen.words;
  $('#wordsOut').textContent = `约 ${UI.gen.words} 字`;
  updatePlatformHint();
  renderKeywordChips();
}

function renderKeywordChips() {
  const kws = $('#inpKeywords').value.split(/[,，、;；\s]+/).map(s => s.trim()).filter(Boolean);
  $('#kwChips').innerHTML = kws.map(k => `<span class="kw-chip">${esc(k)}</span>`).join('');
}

function doGenerate() {
  const topic = $('#inpTopic').value.trim();
  if (!topic) {
    toast('请先填写文章主题', 'err');
    $('#inpTopic').focus();
    return;
  }
  const keywords = $('#inpKeywords').value.split(/[,，、;；\s]+/).map(s => s.trim()).filter(Boolean);

  const btn = $('#btnGenerate');
  const old = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="t-dot" style="width:8px;height:8px;border-radius:50%;background:#fff;display:inline-block"></span> 正在组合素材…';

  // 本地生成，加一点延迟让交互可感知
  setTimeout(() => {
    const res = generateArticle({
      topic,
      keywords,
      platform: UI.gen.platform,
      tone: UI.gen.tone,
      words: UI.gen.words,
    });
    UI.gen.result = res;
    UI.gen.selectedTitle = 0;
    UI.gen.result.meta = { topic, keywords, platform: UI.gen.platform, tone: UI.gen.tone, words: UI.gen.words };
    renderResult();
    btn.disabled = false;
    btn.innerHTML = old;
    toast('已生成 3 个标题候选与正文', 'ok');
    $('#resultCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 420);
}

function renderResult() {
  const res = UI.gen.result;
  if (!res) {
    $('#resultEmpty').classList.remove('hidden');
    $('#resultBody').classList.add('hidden');
    $('#genMeta').textContent = '未生成';
    return;
  }
  $('#resultEmpty').classList.add('hidden');
  $('#resultBody').classList.remove('hidden');
  $('#genMeta').textContent = `本地生成 · ${platformName(UI.gen.platform)}`;

  $('#titleList').innerHTML = res.titles.map((t, i) => `
    <button class="title-opt ${i === UI.gen.selectedTitle ? 'on' : ''}" data-title-idx="${i}">
      <span class="idx">${i + 1}</span>
      <span class="txt">${esc(t)}</span>
    </button>`).join('');

  $('#summaryText').textContent = res.summary;
  $('#tagRow').innerHTML = res.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('');
  $('#previewBody').innerHTML = mdToHtml(res.body);
  $('#bodyStat').textContent = `${wordCount(res.body)} 字`;
}

function saveDraftFromResult() {
  const res = UI.gen.result;
  if (!res) { toast('请先生成文章', 'err'); return null; }
  const title = res.titles[UI.gen.selectedTitle] || res.titles[0];
  const existing = UI.gen.draftId ? Store.get(UI.gen.draftId) : null;

  const article = existing ? { ...existing } : {
    id: uid(),
    createdAt: nowISO(),
    status: 'draft',
  };
  article.title = title;
  article.platform = UI.gen.platform;
  article.tone = UI.gen.tone;
  article.summary = res.summary;
  article.body = res.body;
  article.tags = res.tags.slice();
  article.updatedAt = nowISO();

  Store.upsert(article);
  UI.gen.draftId = article.id;
  renderBadges();
  return article;
}

/* ============================ 6. 编辑器 ============================ */

function openEditor(id) {
  let a = Store.get(id);
  if (!a) {
    if (!UI.gen.result) { toast('文章不存在', 'err'); return; }
    a = saveDraftFromResult();
    if (!a) return;
  }
  UI.editingId = a.id;

  $('#edEyebrow').textContent = a.status === 'draft' ? '草稿 · 编辑' : `${STATUS_META[a.status].label} · 编辑`;
  $('#edTitleText').textContent = a.title || '未命名文章';
  $('#edTitle').value = a.title || '';
  $('#edPlatform').innerHTML = PLATFORMS.map(p => `<option value="${p.id}" ${p.id === a.platform ? 'selected' : ''}>${p.name}</option>`).join('');
  $('#edStatus').value = a.status;
  $('#edSummary').value = a.summary || '';
  $('#edTags').value = (a.tags || []).join(', ');
  $('#edBody').value = a.body || '';
  $('#edBodyStat').textContent = `${wordCount(a.body)} 字`;

  openDrawer();
}

function collectEditor() {
  return {
    title: $('#edTitle').value.trim(),
    platform: $('#edPlatform').value,
    status: $('#edStatus').value,
    summary: $('#edSummary').value.trim(),
    tags: $('#edTags').value.split(/[,，、;；]+/).map(s => s.trim()).filter(Boolean),
    body: $('#edBody').value,
  };
}

function saveEditor(silent) {
  const a = Store.get(UI.editingId);
  if (!a) { toast('文章已不存在', 'err'); return null; }
  const v = collectEditor();
  if (!v.title) {
    toast('标题不能为空', 'err');
    $('#edTitle').focus();
    return null;
  }
  a.title = v.title;
  a.platform = v.platform;
  a.status = v.status;
  a.summary = v.summary;
  a.tags = v.tags;
  a.body = v.body;
  a.updatedAt = nowISO();
  Store.upsert(a);
  $('#edTitleText').textContent = a.title;
  $('#edBodyStat').textContent = `${wordCount(a.body)} 字`;
  renderAll();
  if (!silent) toast('正在保存');
  return a;
}

/* ============================ 7. 发布 / 排程 ============================ */

function publishNow(id, fromEditor) {
  let a;
  if (fromEditor) {
    a = saveEditor(true);
    if (!a) return;
  } else {
    a = Store.get(id);
    if (!a) { toast('文章不存在', 'err'); return; }
  }
  // 演示：模拟一次发布流程，小概率失败以展示失败态
  const willFail = Math.random() < 0.12;
  a.status = willFail ? 'failed' : 'published';
  a.publishedAt = willFail ? null : nowISO();
  a.failedAt = willFail ? nowISO() : null;
  a.failReason = willFail ? '模拟接口超时：平台返回 503（演示用，可在编辑器中重试）' : null;
  a.scheduledAt = null;
  a.updatedAt = nowISO();
  Store.upsert(a);

  if (willFail) {
    toast('发布失败：模拟平台超时，可在队列中重试', 'err');
  } else {
    toast(`已发布到${platformName(a.platform)}`, 'ok');
  }
  if (fromEditor) { closeDrawer(); }
  renderAll();
}

function openSchedule(id) {
  UI.schedulingId = id;
  buildQuickTimes();
  // 默认值：1 小时后
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  $('#schedInput').value = toLocalInput(d);
  openModal($('#schedModal'), $('#schedScrim'));
}

function toLocalInput(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function buildQuickTimes() {
  const now = new Date();
  const presets = [
    { label: '1 小时后', desc: '', fn: () => new Date(Date.now() + 3600e3) },
    { label: '今晚 20:00', desc: '通勤后流量高峰', fn: () => { const d = new Date(); d.setHours(20, 0, 0, 0); if (d <= now) d.setDate(d.getDate() + 1); return d; } },
    { label: '明天 09:00', desc: '早高峰', fn: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d; } },
    { label: '明天 18:30', desc: '下班时段', fn: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(18, 30, 0, 0); return d; } },
  ];
  $('#quickTimes').innerHTML = presets.map((p, i) => {
    const d = p.fn();
    return `<button class="qt" data-qt="${i}" data-value="${toLocalInput(d)}">
      <b>${p.label}</b><small>${fmtTime(d.toISOString())}${p.desc ? ' · ' + p.desc : ''}</small>
    </button>`;
  }).join('');
}

function confirmSchedule() {
  const id = UI.schedulingId;
  const val = $('#schedInput').value;
  if (!val) { toast('请选择发布时间', 'err'); return; }
  const when = new Date(val);
  if (isNaN(when)) { toast('时间格式不正确', 'err'); return; }
  if (when.getTime() <= Date.now() + 30e3) { toast('请选择至少 1 分钟之后的未来时间', 'err'); return; }

  let a = Store.get(id);
  if (!a) { toast('文章不存在', 'err'); return; }

  // 若来自编辑器且内容有改动，先落盘
  if (UI.editingId === id && $('#editorDrawer').classList.contains('on')) {
    const saved = saveEditor(true);
    if (!saved) return;
    a = saved;
  }

  a.status = 'pending';
  a.scheduledAt = when.toISOString();
  a.publishedAt = null;
  a.failedAt = null;
  a.failReason = null;
  a.updatedAt = nowISO();
  Store.upsert(a);

  closeModal($('#schedModal'), $('#schedScrim'));
  if ($('#editorDrawer').classList.contains('on')) closeDrawer();
  toast(`已加入队列，将于 ${fmtTime(a.scheduledAt)} 发布`, 'ok');
  renderAll();
}

function cancelSchedule(id) {
  const a = Store.get(id);
  if (!a) return;
  a.status = 'draft';
  a.scheduledAt = null;
  a.updatedAt = nowISO();
  Store.upsert(a);
  toast('已取消定时，文章回到草稿箱');
  renderAll();
}

/** 检查并处理到期任务 */
function runDueTasks(silent) {
  const due = Store.data.articles.filter(a =>
    a.status === 'pending' && a.scheduledAt && new Date(a.scheduledAt).getTime() <= Date.now()
  );
  due.forEach(a => {
    const willFail = Math.random() < 0.1;
    a.status = willFail ? 'failed' : 'published';
    a.publishedAt = willFail ? null : nowISO();
    a.failedAt = willFail ? nowISO() : null;
    a.failReason = willFail ? '模拟接口超时：平台返回 503（演示用）' : null;
    a.scheduledAt = null;
    a.updatedAt = nowISO();
    Store.upsert(a);
  });
  if (due.length) {
    toast(`${due.length} 篇定时文章已到点处理`, 'ok');
    renderAll();
  } else if (!silent) {
    toast('暂无到期任务');
  }
  return due.length;
}

/* ============================ 8. 详情弹窗 ============================ */

function openDetail(id) {
  const a = Store.get(id);
  if (!a) return;
  UI.viewId = a.id;

  $('#mdPlatform').textContent = platformName(a.platform) + ' · ' + (a.tone ? (TONES.find(t => t.id === a.tone) || {}).name || '' : '');
  $('#mdTitle').textContent = a.title || '未命名文章';
  $('#mdMeta').innerHTML = `
    ${statusBadge(a.status)}
    ${a.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}
    <span class="sep"></span>
    <span>${wordCount(a.body)} 字</span>
    <span class="sep"></span>
    <span>${a.status === 'pending'
        ? '计划 ' + fmtTime(a.scheduledAt)
        : a.status === 'published'
          ? '发布于 ' + fmtTime(a.publishedAt)
          : '更新于 ' + fmtTime(a.updatedAt)}</span>
    ${a.failReason ? `<span class="sep"></span><span style="color:var(--red)">${esc(a.failReason)}</span>` : ''}
  `;
  $('#mdBody').innerHTML = `
    ${a.summary ? `<div class="detail-summary">${esc(a.summary)}</div>` : ''}
    <div class="detail-body">${mdToHtml(a.body)}</div>`;

  openModal($('#detailModal'), $('#modalScrim'));
}

/* ============================ 9. 弹窗/抽屉控制 ============================ */

function openModal(modal, scrim) {
  modal.classList.add('on');
  scrim.classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeModal(modal, scrim) {
  modal.classList.remove('on');
  scrim.classList.remove('on');
  if (!$('#editorDrawer').classList.contains('on')) document.body.style.overflow = '';
}
function openDrawer() {
  $('#editorDrawer').classList.add('on');
  $('#editorDrawer').setAttribute('aria-hidden', 'false');
  $('#drawerScrim').classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  $('#editorDrawer').classList.remove('on');
  $('#editorDrawer').setAttribute('aria-hidden', 'true');
  $('#drawerScrim').classList.remove('on');
  document.body.style.overflow = '';
  UI.editingId = null;
  renderAll();
}
function openNav() {
  $('#sidebar').classList.add('on');
  $('#navScrim').classList.add('on');
}
function closeNav() {
  $('#sidebar').classList.remove('on');
  $('#navScrim').classList.remove('on');
}

/* ============================ 10. 主题 ============================ */

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  Store.data.theme = theme;
  const label = theme === 'dark' ? '深色模式' : '浅色模式';
  const el = $('#themeLabel');
  if (el) el.textContent = label;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0c0e14' : '#4f46e5');
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
  Store.save();
}

/* ============================ 11. 初始化与事件 ============================ */

async function init() {
  try { await Store.load(); } catch (error) { console.error(error); document.body.innerHTML = '<main style="padding:2rem">无法读取云端数据，请检查登录及数据库连接后刷新重试。</main>'; return; }
  applyTheme(Store.data.theme || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  buildComposeControls();
  renderResult();
  renderAll();
  switchView('dashboard');

  // 示例主题提示
  $('#inpTopic').placeholder = '例如：' + SAMPLE_TOPICS[0].topic;

  /* ---- 导航 ---- */
  $('#mainNav').addEventListener('click', e => {
    const btn = e.target.closest('.nav-item');
    if (btn) switchView(btn.dataset.view);
  });
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-goto]');
    if (g) switchView(g.dataset.goto);
  });

  $('#navToggle').addEventListener('click', openNav);
  $('#navScrim').addEventListener('click', closeNav);

  /* ---- 主题 ---- */
  $('#themeToggle').addEventListener('click', toggleTheme);
  $('#themeToggleMobile').addEventListener('click', toggleTheme);

  /* ---- 创作表单 ---- */
  $('#platformSeg').addEventListener('click', e => {
    const b = e.target.closest('[data-platform]');
    if (!b) return;
    UI.gen.platform = b.dataset.platform;
    renderComposeState();
  });
  $('#toneSeg').addEventListener('click', e => {
    const b = e.target.closest('[data-tone]');
    if (!b) return;
    UI.gen.tone = b.dataset.tone;
    renderComposeState();
  });
  $('#inpWords').addEventListener('input', e => {
    UI.gen.words = parseInt(e.target.value, 10);
    $('#wordsOut').textContent = `约 ${UI.gen.words} 字`;
  });
  $('#inpKeywords').addEventListener('input', renderKeywordChips);
  $('#btnGenerate').addEventListener('click', doGenerate);
  $('#btnRegenerate').addEventListener('click', doGenerate);

  $('#btnRandomTopic').addEventListener('click', () => {
    const t = SAMPLE_TOPICS[Math.floor(Math.random() * SAMPLE_TOPICS.length)];
    $('#inpTopic').value = t.topic;
    $('#inpKeywords').value = t.kw;
    renderKeywordChips();
    toast('已填入示例主题');
  });

  $('#titleList').addEventListener('click', e => {
    const b = e.target.closest('[data-title-idx]');
    if (!b || !UI.gen.result) return;
    UI.gen.selectedTitle = parseInt(b.dataset.titleIdx, 10);
    UI.gen.draftId = null; // 换标题视为新内容
    renderResult();
  });

  $('#btnToEditor').addEventListener('click', () => {
    const a = saveDraftFromResult();
    if (a) openEditor(a.id);
  });
  $('#btnSaveDraftQuick').addEventListener('click', () => {
    const a = saveDraftFromResult();
    if (a) {
      toast('草稿保存中');
      renderAll();
    }
  });

  /* ---- 列表委托（草稿 / 队列 / 记录 / 最近动态） ---- */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-edit],[data-publish],[data-del],[data-open],[data-copy],[data-md],[data-cancel],[data-now],[data-retry]');
    if (!t) return;

    if (t.dataset.edit)   return openEditor(t.dataset.edit);
    if (t.dataset.publish) {
      // 草稿箱「发布」→ 打开编辑器让用户确认
      return openEditor(t.dataset.publish);
    }
    if (t.dataset.open)   return openDetail(t.dataset.open);
    if (t.dataset.copy) {
      const a = Store.get(t.dataset.copy);
      if (!a) return;
      copyText(`${a.title}\n\n${a.body}`).then(ok => toast(ok ? '全文已复制到剪贴板' : '复制失败，请手动选择', ok ? 'ok' : 'err'));
      return;
    }
    if (t.dataset.md) {
      const a = Store.get(t.dataset.md);
      if (!a) return;
      download(safeFilename(a.title) + '.md', toMarkdown(a));
      toast('已导出 Markdown', 'ok');
      return;
    }
    if (t.dataset.cancel) return cancelSchedule(t.dataset.cancel);
    if (t.dataset.now)    return publishNow(t.dataset.now);
    if (t.dataset.retry)  return publishNow(t.dataset.retry);
    if (t.dataset.del) {
      const a = Store.get(t.dataset.del);
      if (!a) return;
      if (confirm(`确定删除《${a.title || '未命名文章'}》？此操作不可撤销。`)) {
        Store.remove(a.id);
        toast('正在删除');
        renderAll();
      }
      return;
    }
  });

  /* ---- 筛选 ---- */
  $('#queueFilter').addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    UI.queueFilter = c.dataset.status;
    renderQueue();
  });
  $('#recordFilter').addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    UI.recordFilter = c.dataset.status;
    renderRecords();
  });
  $('#btnRunDue').addEventListener('click', () => runDueTasks(false));

  /* ---- 草稿搜索 ---- */
  $('#draftSearch').addEventListener('input', e => {
    UI.draftQuery = e.target.value;
    renderDrafts();
  });
  document.addEventListener('click', e => {
    if (e.target.id === 'btnClearSearch') {
      $('#draftSearch').value = '';
      UI.draftQuery = '';
      renderDrafts();
    }
  });

  /* ---- 导出全部 ---- */
  $('#btnExportAll').addEventListener('click', () => {
    const list = Store.data.articles.filter(a => a.status !== 'draft');
    if (!list.length) { toast('没有可导出的记录', 'err'); return; }
    const md = list.map(a => toMarkdown(a)).join('\n\n<!-- ==== 分隔 ==== -->\n\n');
    download(`墨舟发布记录-${new Date().toISOString().slice(0, 10)}.md`, `# 发布记录导出\n\n共 ${list.length} 篇\n\n${md}`);
    toast(`已导出 ${list.length} 篇`, 'ok');
  });

  /* ---- 编辑器 ---- */
  $('#btnCloseDrawer').addEventListener('click', closeDrawer);
  $('#drawerScrim').addEventListener('click', closeDrawer);
  $('#btnSaveDraft').addEventListener('click', () => saveEditor(false));
  $('#btnPublishNow').addEventListener('click', () => publishNow(UI.editingId, true));
  $('#btnSchedule').addEventListener('click', () => {
    const a = saveEditor(true);
    if (a) openSchedule(a.id);
  });
  $('#edBody').addEventListener('input', e => {
    $('#edBodyStat').textContent = `${wordCount(e.target.value)} 字`;
  });
  $('#edTitle').addEventListener('input', e => {
    $('#edTitleText').textContent = e.target.value || '未命名文章';
  });

  /* ---- 定时弹窗 ---- */
  $('#btnCloseSched').addEventListener('click', () => closeModal($('#schedModal'), $('#schedScrim')));
  $('#schedScrim').addEventListener('click', () => closeModal($('#schedModal'), $('#schedScrim')));
  $('#btnCancelSched').addEventListener('click', () => closeModal($('#schedModal'), $('#schedScrim')));
  $('#btnConfirmSched').addEventListener('click', confirmSchedule);
  $('#quickTimes').addEventListener('click', e => {
    const b = e.target.closest('[data-qt]');
    if (!b) return;
    $$('#quickTimes .qt').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    $('#schedInput').value = b.dataset.value;
  });

  /* ---- 详情弹窗 ---- */
  $('#btnCloseModal').addEventListener('click', () => closeModal($('#detailModal'), $('#modalScrim')));
  $('#modalScrim').addEventListener('click', () => closeModal($('#detailModal'), $('#modalScrim')));
  $('#mdCopy').addEventListener('click', () => {
    const a = Store.get(UI.viewId);
    if (!a) return;
    copyText(`${a.title}\n\n${a.body}`).then(ok => toast(ok ? '全文已复制' : '复制失败', ok ? 'ok' : 'err'));
  });
  $('#mdExport').addEventListener('click', () => {
    const a = Store.get(UI.viewId);
    if (!a) return;
    download(safeFilename(a.title) + '.md', toMarkdown(a));
    toast('已导出 Markdown', 'ok');
  });
  $('#mdEdit').addEventListener('click', () => {
    const a = Store.get(UI.viewId);
    if (!a) return;
    closeModal($('#detailModal'), $('#modalScrim'));
    openEditor(a.id);
  });

  /* ---- 设置 ---- */
  $('#btnSaveCfg').addEventListener('click', () => {
    Store.data.config = {
      endpoint: $('#cfgEndpoint').value.trim(),
      model: $('#cfgModel').value.trim(),
      key: $('#cfgKey').value.trim(),
    };
    Store.save();
    toast('配置保存中（Key 仅保留在当前页面，本版本使用本地模板引擎）', 'ok');
  });
  $('#btnClearCfg').addEventListener('click', () => {
    Store.data.config = { endpoint: '', model: '', key: '' };
    Store.save();
    renderSettings();
    toast('正在清空配置');
  });
  $('#btnExportData').addEventListener('click', () => {
    download(`mozhou-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({...Store.data, config: {...Store.data.config, key: ''}}, null, 2), 'application/json');
    toast('已导出 JSON 备份', 'ok');
  });
  $('#btnClearData').addEventListener('click', () => {
    if (!confirm('确定清空全部云端数据？包括草稿、队列与发布记录。')) return;
    Store.clearAll();
    UI.gen.result = null; UI.gen.draftId = null;
    renderResult();
    applyTheme(Store.data.theme || 'light');
    renderAll();
    toast('正在清空全部数据');
  });

  /* ---- 键盘 ---- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if ($('#editorDrawer').classList.contains('on')) closeDrawer();
      if ($('#detailModal').classList.contains('on')) closeModal($('#detailModal'), $('#modalScrim'));
      if ($('#schedModal').classList.contains('on')) closeModal($('#schedModal'), $('#schedScrim'));
      closeNav();
    }
    // Ctrl / Cmd + Enter 生成
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      if (UI.view === 'create') doGenerate();
      else if ($('#editorDrawer').classList.contains('on')) saveEditor(false);
    }
  });

  /* ---- 定时任务轮询 ---- */
  setInterval(() => {
    runDueTasks(true);
    // 刷新队列中的倒计时
    if (UI.view === 'queue' && Store.data.articles.some(a => a.status === 'pending')) renderQueue();
  }, 15000);
  runDueTasks(true);

  // 首次访问提示
  if (!Store.data.articles.length && !sessionStorage.getItem('mz_welcomed')) {
    sessionStorage.setItem('mz_welcomed', '1');
    setTimeout(() => toast('欢迎使用墨舟 · 先试试「一键生成文章」'), 700);
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
