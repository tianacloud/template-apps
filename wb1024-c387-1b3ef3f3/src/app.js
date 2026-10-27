document.body.innerHTML = "\n\n<header>\n  <div class=\"wrap head-row\">\n    <div>\n      <div class=\"brand\">\n        <div class=\"mark\" aria-hidden=\"true\">\n          <i class=\"on\"></i><i></i><i></i>\n          <i></i><i></i><i class=\"on\"></i>\n          <i></i><i></i><i></i>\n        </div>\n        <div>\n          <h1>GitDeNoise<span>提交降噪器</span></h1>\n          <p class=\"tagline\">被 <code style=\"font-family:var(--mono)\">build: 更新A环境</code> 淹没的 git log，还原成真实工作记录，并生成能直接用的工作总结。</p>\n        </div>\n      </div>\n    </div>\n    <div class=\"badge\">1024 · 造物挑战</div>\n  </div>\n</header>\n\n<main class=\"wrap\">\n\n  <!-- 输入 -->\n  <section class=\"panel\">\n    <div class=\"panel-head\">\n      <div class=\"panel-title\">输入 git log</div>\n      <div class=\"panel-note\">纯本地解析 · 数据不上传</div>\n    </div>\n    <label class=\"sr-only\" for=\"log-input\" style=\"position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)\">git log 内容</label>\n    <textarea id=\"log-input\" spellcheck=\"false\" placeholder=\"在此粘贴 git log 输出，例如：\n\ngit log --pretty=format:'%h|%ad|%an|%s' --date=short\n\na1b2c3d|2026-10-14|dev-a|build: web 更新正式环境\ne4f5a6b|2026-10-14|dev-a|feat: 活动页支持配置化选中态\"></textarea>\n    <div class=\"panel-foot\">\n      <button class=\"primary\" id=\"btn-run\">开始降噪</button>\n      <button class=\"ghost\" id=\"btn-sample\">载入示例</button>\n      <button class=\"ghost\" id=\"btn-file\">导入文件</button>\n      <input type=\"file\" id=\"file-input\" accept=\".txt,.log,.md,text/plain\" hidden />\n      <div class=\"spacer\"></div>\n      <span class=\"hint\" id=\"line-count\">0 行</span>\n      <button class=\"ghost\" id=\"btn-clear\">清空</button>\n    </div>\n  </section>\n\n  <div id=\"notice\"></div>\n\n  <!-- 结果 -->\n  <section id=\"results\" hidden>\n\n    <div class=\"kpis\">\n      <div class=\"kpi\">\n        <div class=\"kpi-label\">总提交</div>\n        <div class=\"kpi-value\" id=\"kpi-total\">0</div>\n        <div class=\"kpi-sub\" id=\"kpi-span\">—</div>\n      </div>\n      <div class=\"kpi\">\n        <div class=\"kpi-label\">真实提交</div>\n        <div class=\"kpi-value\" id=\"kpi-real\">0</div>\n        <div class=\"kpi-sub\" id=\"kpi-real-sub\">—</div>\n      </div>\n      <div class=\"kpi\">\n        <div class=\"kpi-label\">噪音占比</div>\n        <div class=\"kpi-value dim\" id=\"kpi-noise\">0%</div>\n        <div class=\"kpi-sub\" id=\"kpi-noise-sub\">—</div>\n      </div>\n      <div class=\"kpi\">\n        <div class=\"kpi-label\">信噪比</div>\n        <div class=\"kpi-value\" id=\"kpi-snr\">—</div>\n        <div class=\"kpi-sub\" id=\"kpi-snr-sub\">—</div>\n      </div>\n    </div>\n\n    <div class=\"ratio-bar\" aria-label=\"真实提交与噪音占比\">\n      <i id=\"bar-real\" style=\"background:#ffffff;width:0%\"></i>\n      <i id=\"bar-noise\" style=\"background:#3a3a3a;width:100%\"></i>\n    </div>\n\n    <section class=\"panel\">\n      <div class=\"panel-head\">\n        <div class=\"panel-title\">分类分布</div>\n        <div class=\"panel-note\" id=\"dist-note\">—</div>\n      </div>\n      <div class=\"dist\" id=\"dist\"></div>\n      <div class=\"levels\">\n        <span class=\"levels-label\">降噪强度</span>\n        <button data-level=\"soft\">温和</button>\n        <button data-level=\"standard\" class=\"on\">标准</button>\n        <button data-level=\"strict\">严格</button>\n        <div class=\"spacer\"></div>\n        <label class=\"toggle\" title=\"把作者名替换为 dev-01 这类代号，便于对外分享\">\n          <input type=\"checkbox\" id=\"toggle-desensitize\" checked />\n          <span class=\"switch\" aria-hidden=\"true\"></span>\n          <span>作者脱敏</span>\n        </label>\n      </div>\n      <div class=\"levels\" style=\"border-top:none;padding-top:0\">\n        <span class=\"hint\" id=\"level-hint\">过滤构建部署 / 合并 / 版本号 / 回滚</span>\n      </div>\n    </section>\n\n    <section class=\"panel\" style=\"margin-top:14px\">\n      <div class=\"tabs\" role=\"tablist\">\n        <button class=\"on\" data-tab=\"timeline\" role=\"tab\">真实时间线</button>\n        <button data-tab=\"rhythm\" role=\"tab\">工作节律</button>\n        <button data-tab=\"export\" role=\"tab\">导出总结</button>\n      </div>\n      <div class=\"tab-body\" id=\"tab-timeline\"></div>\n      <div class=\"tab-body\" id=\"tab-rhythm\" hidden></div>\n      <div class=\"tab-body\" id=\"tab-export\" hidden></div>\n    </section>\n\n  </section>\n\n  <!-- 空状态 -->\n  <div class=\"empty\" id=\"empty\">\n    <div class=\"empty-title\">等待输入</div>\n    <div class=\"empty-sub\">粘贴 git log，或点「载入示例」看效果</div>\n  </div>\n\n  <!-- 使用说明：主页常驻，不需要展开 -->\n  <section class=\"docs\" id=\"docs\">\n    <div class=\"docs-head\">\n      <h2 class=\"docs-title\">使用说明</h2>\n      <p class=\"docs-sub\">三步拿到一份能直接写进周报的工作记录</p>\n    </div>\n\n    <div class=\"steps\">\n      <div class=\"step\">\n        <div class=\"step-num\">01</div>\n        <div class=\"step-title\">复制命令</div>\n        <p class=\"step-desc\">在仓库根目录执行，把整段输出复制下来。三选一，按需要的精度挑。</p>\n        <div class=\"cmd\">\n          <code>git log --pretty=format:'%h|%ad|%an|%s' --date=short</code>\n          <button class=\"copy-mini\" data-copy=\"git log --pretty=format:'%h|%ad|%an|%s' --date=short\">复制</button>\n        </div>\n        <div class=\"cmd\">\n          <code>git log --pretty=format:'%h|%ad|%an|%s' --date=format:'%Y-%m-%d %H:%M'</code>\n          <button class=\"copy-mini\" data-copy=\"git log --pretty=format:'%h|%ad|%an|%s' --date=format:'%Y-%m-%d %H:%M'\">复制</button>\n        </div>\n        <div class=\"cmd\">\n          <code>git log --since=\"2026-10-01\" --pretty=format:'%h|%ad|%an|%s' --date=short</code>\n          <button class=\"copy-mini\" data-copy=\"git log --since=&quot;2026-10-01&quot; --pretty=format:'%h|%ad|%an|%s' --date=short\">复制</button>\n        </div>\n        <p class=\"step-note\">第二条带时间，能看小时级分布；第三条限定时间范围，适合按季度取数。</p>\n      </div>\n\n      <div class=\"step\">\n        <div class=\"step-num\">02</div>\n        <div class=\"step-title\">粘贴解析</div>\n        <p class=\"step-desc\">贴进上方输入框，点「开始降噪」，或按 <kbd>Ctrl</kbd>+<kbd>Enter</kbd>。也可以直接导入 .txt / .log 文件。</p>\n        <p class=\"step-desc\" style=\"margin-top:10px\">不挑格式，下面这些都能读：</p>\n        <ul class=\"fmt-list\">\n          <li><code>a1b2c3d|2026-10-14|dev-a|feat: xxx</code><span>管道</span></li>\n          <li><code>2026-10-14 dev-a feat: xxx</code><span>空格</span></li>\n          <li><code>a1b2c3d feat: xxx</code><span>oneline</span></li>\n          <li><code>commit / Author: / Date:</code><span>完整多行</span></li>\n        </ul>\n      </div>\n\n      <div class=\"step\">\n        <div class=\"step-num\">03</div>\n        <div class=\"step-title\">导出总结</div>\n        <p class=\"step-desc\">切到「导出总结」，拿到按日期分节的 Markdown。三种取用方式：</p>\n        <ul class=\"fmt-list\">\n          <li><code>复制 Markdown</code><span>贴周报</span></li>\n          <li><code>复制纯净列表</code><span>只留 commit</span></li>\n          <li><code>下载 .md</code><span>存归档</span></li>\n        </ul>\n        <p class=\"step-note\">导出只含真实提交，噪音不进结果；作者名默认已脱敏。</p>\n      </div>\n    </div>\n\n    <div class=\"docs-head\" style=\"margin-top:26px\">\n      <h2 class=\"docs-title\">降噪规则</h2>\n      <p class=\"docs-sub\">按提交信息文本判定，不需要读 diff</p>\n    </div>\n\n    <div class=\"rules-wrap\">\n      <table class=\"rules\">\n        <thead>\n          <tr>\n            <th style=\"width:20%\">类别</th>\n            <th style=\"width:44%\">命中特征</th>\n            <th style=\"width:18%\">温和</th>\n            <th style=\"width:18%\">标准 / 严格</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr><td>构建部署</td><td><code>build:</code> <code>ci:</code> 部署 / 上线 / 更正式 / 更新X环境</td><td class=\"on\">过滤</td><td class=\"on\">过滤</td></tr>\n          <tr><td>合并提交</td><td><code>Merge</code> / 合并</td><td class=\"off\">保留</td><td class=\"on\">过滤</td></tr>\n          <tr><td>版本号</td><td>纯版本号 / <code>bump</code> / <code>chore(release)</code></td><td class=\"off\">保留</td><td class=\"on\">过滤</td></tr>\n          <tr><td>回滚</td><td><code>Revert</code> / 回滚 / 撤销</td><td class=\"off\">保留</td><td class=\"on\">过滤</td></tr>\n          <tr><td>文档</td><td><code>docs:</code> / 文档 / readme</td><td class=\"off\">保留</td><td class=\"partial\">仅严格过滤</td></tr>\n          <tr><td>真实开发</td><td>其余全部（feat / fix / refactor / perf…）</td><td class=\"keep\">保留</td><td class=\"keep\">保留</td></tr>\n        </tbody>\n      </table>\n    </div>\n\n    <div class=\"notes\">\n      <div class=\"note\">\n        <div class=\"note-title\">按季度取数</div>\n        <p>填绩效或述职时，用 <code>--since</code> 把范围限定在本季度，噪音占比和真实提交数就是这一季的实际值。</p>\n      </div>\n      <div class=\"note\">\n        <div class=\"note-title\">作者脱敏</div>\n        <p>默认开启，作者名按出现顺序替换为 <code>dev-01</code>、<code>dev-02</code>。导出的记录常要贴进周报或对外文档，真实姓名不该跟着走。需要核对时再关掉。</p>\n      </div>\n      <div class=\"note\">\n        <div class=\"note-title\">数据不出本机</div>\n        <p>全部解析在浏览器内完成，零网络请求。这个页面可以直接断网使用，也能存到本地随时打开。</p>\n      </div>\n      <div class=\"note\">\n        <div class=\"note-title\">分类的边界</div>\n        <p>规则看的是提交信息，不解析 diff。团队若完全不写规范（全是\"修改\"\"提交\"），分类会失准——但这类提交本来也写不进周报。</p>\n      </div>\n    </div>\n  </section>\n\n</main>\n\n<footer>\n  <div class=\"wrap foot-row\">\n    <span>GitDeNoise · 1024 造物挑战参赛作品</span>\n    <span><span class=\"dot\">纯前端</span> &nbsp;·&nbsp; <span class=\"dot\">零依赖</span> &nbsp;·&nbsp; <span class=\"dot\">本地解析</span></span>\n  </div>\n</footer>\n\n";

(function () {
  'use strict';

  /* ============================================================
   * 1. 分类规则
   * 基于真实仓库的提交样本归纳（含中文提交习惯）
   * ========================================================== */

  // 每类：key / 名称 / 判定函数 / 属于噪音 / 各强度下是否过滤
  var CATEGORIES = [
    {
      key: 'build', name: '构建部署', noise: true,
      level: ['soft', 'standard', 'strict'],
      test: function (s) {
        return /^(build|ci|deploy|release|publish)[:：（(]/i.test(s)
          || /部署|上线|更正式|更新[A-Za-z0-9]*环境|发布到|打包/.test(s);
      }
    },
    {
      key: 'merge', name: '合并提交', noise: true,
      level: ['standard', 'strict'],
      test: function (s) {
        return /^(merge|merging)\b/i.test(s) || /^合并/.test(s) || /remote-tracking branch/.test(s);
      }
    },
    {
      key: 'version', name: '版本号', noise: true,
      level: ['standard', 'strict'],
      test: function (s) {
        var t = s.trim();
        return /^v?\d+\.\d+(\.\d+)?([-+.\w]*)?$/.test(t)
          || /^bump\b/i.test(t)
          || /^版本/.test(t)
          || /^chore\(release\)/i.test(t);
      }
    },
    {
      key: 'revert', name: '回滚', noise: true,
      level: ['standard', 'strict'],
      test: function (s) {
        return /^revert\b/i.test(s) || /^回滚/.test(s) || /^撤销/.test(s);
      }
    },
    {
      key: 'docs', name: '文档', noise: false,
      level: ['strict'],
      test: function (s) {
        return /^docs[:：（(]/i.test(s) || /^文档/.test(s) || /^readme/i.test(s);
      }
    }
  ];

  var REAL = { key: 'real', name: '真实开发', noise: false, level: [] };

  var LEVEL_TEXT = {
    soft: '仅过滤构建部署',
    standard: '过滤构建部署 / 合并 / 版本号 / 回滚',
    strict: '上述全部，另加文档提交'
  };

  /**
   * 判断一条提交的类型与"当前强度下是否算噪音"
   */
  function classify(subject, level) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      var c = CATEGORIES[i];
      if (c.test(subject)) {
        return { cat: c, hidden: c.level.indexOf(level) !== -1 };
      }
    }
    return { cat: REAL, hidden: false };
  }

  /* ============================================================
   * 2. 解析器
   * 支持：管道分隔 / 空格分隔 / oneline / git log 完整多行
   * ========================================================== */

  var HASH_RE = /^[0-9a-z]{7,40}$/i;
  var DATE_RE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/;

  /** 形如 "build:" / "feat(" / "部署" / "合并" 的 token，说明这是正文开头而非作者名 */
  var SUBJECT_START_RE = /^(build|ci|deploy|release|publish|feat|fix|docs|refactor|perf|test|style|chore|revert|merge|wip|init)[:：（(]/i
    || /^(部署|合并|回滚|撤销|版本|文档|更新|上线|发布|修复|新增|优化|支持|调整)/;

  /** 从一段文本里抽出作者名（日期之后、正文之前那个 token） */
  function extractAuthor(rest) {
    if (!rest) return '';
    var m = rest.match(/^(\S+)\s+(.*)$/);
    if (!m) return '';
    var token = m[1];
    var tail = m[2];
    // 若这个 token 长得像正文开头，则它不是作者
    if (SUBJECT_START_RE.test(token) || token.indexOf(':') !== -1 || token.indexOf('：') !== -1) {
      return '';
    }
    return token;
  }

  /**
   * 解析单行，返回 {hash, date, time, author, subject} 或 null
   */
  function parseLine(raw) {
    var line = raw.replace(/\s+$/, '');
    if (!line.trim()) return null;

    // —— 管道 / 制表符分隔 ——
    if (line.indexOf('|') !== -1 || line.indexOf('\t') !== -1) {
      var sep = line.indexOf('|') !== -1 ? '|' : '\t';
      var parts = line.split(sep);
      if (parts.length >= 2) {
        var p0 = parts[0].trim();
        var p1 = parts[1].trim();
        var rec = { hash: '', date: '', time: '', author: '', subject: '' };

        if (HASH_RE.test(p0)) { rec.hash = p0; parts.shift(); }
        if (parts.length && DATE_RE.test(parts[0].trim())) {
          var dm = parts[0].trim().match(DATE_RE);
          rec.date = dm[1] + '-' + dm[2] + '-' + dm[3];
          if (dm[4]) rec.time = dm[4] + ':' + (dm[5] || '00');
          parts.shift();
        }
        // 剩余第一段若是作者（非 hash 非日期非正文开头）
        if (parts.length && !HASH_RE.test(parts[0].trim()) && !DATE_RE.test(parts[0].trim())) {
          var tok = parts[0].trim();
          if (tok && !SUBJECT_START_RE.test(tok) && tok.indexOf(':') === -1 && tok.indexOf('：') === -1) {
            rec.author = tok;
            parts.shift();
          }
        }
        rec.subject = parts.join(sep).trim();
        return rec.subject ? rec : null;
      }
    }

    // —— 以日期开头：date [time] [author] subject ——
    var dm2 = line.match(DATE_RE);
    if (dm2) {
      var rec2 = {
        hash: '',
        date: dm2[1] + '-' + dm2[2] + '-' + dm2[3],
        time: dm2[4] ? dm2[4] + ':' + (dm2[5] || '00') : '',
        author: '',
        subject: ''
      };
      var rest = line.slice(dm2[0].length).trim();
      var auth = extractAuthor(rest);
      if (auth) {
        rec2.author = auth;
        rest = rest.slice(auth.length).trim();
      }
      rec2.subject = rest;
      return rec2.subject ? rec2 : null;
    }

    // —— 以 hash 开头：hash subject ——
    var hm = line.match(/^([0-9a-f]{7,40})\s+(.*)$/i);
    if (hm) {
      return { hash: hm[1], date: '', time: '', author: '', subject: hm[2].trim() };
    }

    // —— 兜底：整行当正文 ——
    return { hash: '', date: '', time: '', author: '', subject: line.trim() };
  }

  /** 解析 git log 完整多行格式 */
  function parseVerbose(text) {
    var commits = [];
    var blocks = text.split(/^commit\s/m);
    for (var i = 1; i < blocks.length; i++) {
      var b = blocks[i];
      var hash = (b.match(/^([0-9a-f]{7,40})/) || [])[1] || '';
      var author = (b.match(/^Author:\s*(.+?)\s*$/m) || [])[1] || '';
      var dateRaw = (b.match(/^Date:\s*(.+?)\s*$/m) || [])[1] || '';
      var date = '', time = '';
      var d = dateRaw.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (d) {
        date = d[1] + '-' + d[2] + '-' + d[3];
        var t = dateRaw.match(/(\d{2}):(\d{2})(?::(\d{2}))?/);
        if (t) time = t[1] + ':' + t[2];
      }
      // 正文：Date 行之后、缩进的内容
      var bodyMatch = b.match(/^Date:[^\n]*\n+\s{4}([\s\S]*)$/m);
      var subject = bodyMatch ? bodyMatch[1].split('\n')[0].trim() : '';
      if (subject) commits.push({ hash: hash, date: date, time: time, author: author, subject: subject });
    }
    return commits;
  }

  function parseInput(text) {
    if (!text || !text.trim()) return [];
    if (/^commit\s+[0-9a-f]{7,40}/m.test(text)) return parseVerbose(text);
    var out = [];
    var lines = text.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var r = parseLine(lines[i]);
      if (r && r.subject) out.push(r);
    }
    return out;
  }

  /* ============================================================
   * 3. 状态与渲染
   * ========================================================== */

  var state = { commits: [], level: 'standard', desensitize: true, authorMap: {}, showNoise: false };

  var $ = function (id) { return document.getElementById(id); };
  var input = $('log-input');

  /**
   * 建立作者名 → 代号 的映射，按出现顺序编号。
   * 用于「脱敏」：导出的工作记录常要贴进周报或对外文档，真实姓名不该跟着走。
   */
  function buildAuthorMap(commits) {
    var map = {};
    var n = 0;
    commits.forEach(function (c) {
      if (c.author && !map[c.author]) {
        n++;
        map[c.author] = 'dev-' + (n < 10 ? '0' + n : n);
      }
    });
    return map;
  }

  /** 取用于展示的作者名（脱敏开启时返回代号） */
  function authorLabel(author) {
    if (!author) return '';
    if (!state.desensitize) return author;
    return state.authorMap[author] || 'dev-??';
  }

  function fmtInt(n) { return n.toLocaleString('zh-CN'); }

  /** 计算"跨度"描述 */
  function spanText(dates) {
    var ds = dates.filter(Boolean).sort();
    if (!ds.length) return '—';
    if (ds.length === 1) return ds[0];
    return ds[0] + ' → ' + ds[ds.length - 1];
  }

  function render() {
    var commits = state.commits;
    var level = state.level;

    var total = commits.length;
    var real = 0, noise = 0;
    var catCount = {};
    var byDate = {};
    var byHour = new Array(24).fill(0);
    var dates = [];

    // 分类统计
    var classified = commits.map(function (c) {
      var r = classify(c.subject, level);
      var key = r.cat.key;
      catCount[key] = (catCount[key] || 0) + 1;
      if (r.hidden) noise++; else real++;
      if (c.date) { dates.push(c.date); byDate[c.date] = (byDate[c.date] || 0) + (r.hidden ? 0 : 1); }
      if (c.time && !r.hidden) {
        var h = parseInt(c.time.split(':')[0], 10);
        if (!isNaN(h)) byHour[h]++;
      }
      return { c: c, cat: r.cat, hidden: r.hidden };
    });

    // —— KPI ——
    $('kpi-total').textContent = fmtInt(total);
    $('kpi-span').textContent = spanText(dates);
    $('kpi-real').textContent = fmtInt(real);
    var days = Object.keys(byDate).length;
    $('kpi-real-sub').textContent = days ? '覆盖 ' + days + ' 天' : '无日期信息';
    var noisePct = total ? Math.round(noise / total * 100) : 0;
    $('kpi-noise').textContent = noisePct + '%';
    $('kpi-noise-sub').textContent = fmtInt(noise) + ' 条被过滤';
    $('kpi-snr').textContent = noise === 0 ? '∞' : (real / noise).toFixed(1);
    $('kpi-snr-sub').textContent = noise === 0 ? '零噪音' : (noise > real ? '噪音多于真实' : '真实多于噪音');

    // —— 信噪比条 ——
    var realPct = total ? Math.round(real / total * 100) : 0;
    $('bar-real').style.width = realPct + '%';
    $('bar-noise').style.width = (100 - realPct) + '%';

    // —— 分类分布 ——
    var distEl = $('dist');
    distEl.innerHTML = '';
    $('dist-note').textContent = LEVEL_TEXT[level];
    var order = CATEGORIES.map(function (c) { return c.key; }).concat(['real']);
    var maxCount = 1;
    order.forEach(function (k) { if ((catCount[k] || 0) > maxCount) maxCount = catCount[k]; });

    order.forEach(function (key) {
      var n = catCount[key] || 0;
      var cat = null;
      for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].key === key) cat = CATEGORIES[i];
      if (!cat) cat = REAL;
      var isNoise = cat.noise && cat.level.indexOf(level) !== -1;
      var row = document.createElement('div');
      row.className = 'dist-row';

      var name = document.createElement('div');
      name.className = 'dist-name' + (isNoise ? ' filtered' : '');
      name.textContent = cat.name;
      row.appendChild(name);

      var track = document.createElement('div');
      track.className = 'dist-track';
      var fill = document.createElement('i');
      fill.style.width = (n / maxCount * 100) + '%';
      fill.style.background = isNoise ? '#3a3a3a' : (key === 'real' ? '#ffffff' : '#7a7a7a');
      track.appendChild(fill);
      row.appendChild(track);

      var num = document.createElement('div');
      num.className = 'dist-num';
      num.textContent = fmtInt(n);
      row.appendChild(num);

      distEl.appendChild(row);
    });

    // —— 时间线 ——
    // 默认把噪音折叠掉：产品叫「降噪」，列表默认就该是干净的。
    var tl = $('tab-timeline');
    tl.innerHTML = '';
    if (!total) {
      tl.innerHTML = '<div class="empty"><div class="empty-title">没有解析到提交</div><div class="empty-sub">检查输入格式</div></div>';
    } else {
      var groups = {};
      classified.forEach(function (item) {
        var k = item.c.date || '（无日期）';
        (groups[k] = groups[k] || []).push(item);
      });
      var keys = Object.keys(groups).sort().reverse();
      // 被折叠的噪音总数 = 全部被判定为噪音的条目数（与日期分组无关）
      var foldedCount = classified.filter(function (i) { return i.hidden; }).length;

      keys.forEach(function (k) {
        var dayItems = groups[k];
        var visible = dayItems.filter(function (i) { return !i.hidden || state.showNoise; });
        var realInDay = dayItems.filter(function (i) { return !i.hidden; }).length;
        var hiddenInDay = dayItems.length - realInDay;
        if (!visible.length) return;

        var head = document.createElement('div');
        head.className = 'day-group';
        var right = realInDay + ' 条真实';
        if (hiddenInDay) right += ' · ' + hiddenInDay + ' 条噪音';
        head.innerHTML = '<span>' + k + '</span><span>' + right + '</span>';
        tl.appendChild(head);

        var sorted = visible.slice().sort(function (a, b) {
          if (a.hidden !== b.hidden) return a.hidden ? 1 : -1;
          return (b.c.time || '').localeCompare(a.c.time || '');
        });
        sorted.forEach(function (item) {
          tl.appendChild(commitRow(item));
        });
      });

      // 折叠提示条
      if (foldedCount > 0 || state.showNoise) {
        var bar = document.createElement('div');
        bar.className = 'fold-bar';
        var txt = document.createElement('span');
        txt.textContent = state.showNoise
          ? '已显示全部 ' + total + ' 条（含噪音）'
          : '已折叠 ' + foldedCount + ' 条噪音';
        bar.appendChild(txt);

        var b = document.createElement('button');
        b.className = 'ghost';
        b.style.padding = '4px 10px';
        b.style.fontSize = '12px';
        b.textContent = state.showNoise ? '只看真实提交' : '展开噪音';
        b.onclick = function () {
          state.showNoise = !state.showNoise;
          render();
        };
        bar.appendChild(b);
        tl.appendChild(bar);
      }
    }

    // —— 工作节律 ——
    // 按星期分布只依赖日期，始终可用；小时热力图需要日志带时间，没有就降级。
    var rh = $('tab-rhythm');
    rh.innerHTML = '';
    var hasTime = byHour.some(function (v) { return v > 0; });

    var weekNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    var byWeek = [0, 0, 0, 0, 0, 0, 0];
    Object.keys(byDate).forEach(function (d) {
      var dt = new Date(d + 'T00:00:00');
      if (isNaN(dt.getTime())) return;
      var idx = (dt.getDay() + 6) % 7; // 周一=0 … 周日=6
      byWeek[idx] += byDate[d];
    });
    var weekTotal = byWeek.reduce(function (a, b) { return a + b; }, 0);

    if (weekTotal > 0) {
      var wHead = document.createElement('div');
      wHead.className = 'rhythm-legend';
      wHead.style.marginTop = '4px';
      wHead.style.marginBottom = '10px';
      wHead.textContent = '按星期 · 真实提交分布';
      rh.appendChild(wHead);

      var maxW = Math.max.apply(null, byWeek.concat([1]));
      weekNames.forEach(function (nm, i) {
        var v = byWeek[i];
        var row = document.createElement('div');
        row.className = 'dist-row';

        var nameEl = document.createElement('div');
        nameEl.className = 'dist-name';
        nameEl.textContent = nm;
        nameEl.style.color = i >= 5 ? 'var(--text-3)' : 'var(--text-2)';
        row.appendChild(nameEl);

        var tr = document.createElement('div');
        tr.className = 'dist-track';
        var f = document.createElement('i');
        f.style.width = (v / maxW * 100) + '%';
        f.style.background = i >= 5 ? '#4a4a4a' : '#ffffff';
        tr.appendChild(f);
        row.appendChild(tr);

        var num = document.createElement('div');
        num.className = 'dist-num';
        num.textContent = v + ' 条';
        row.appendChild(num);
        rh.appendChild(row);
      });

      var weekend = byWeek[5] + byWeek[6];
      var wPct = Math.round(weekend / weekTotal * 100);
      var tip = document.createElement('div');
      tip.className = 'rhythm-legend';
      tip.style.marginTop = '12px';
      tip.textContent = '周末提交占 ' + wPct + '%' + (wPct >= 30 ? '，加班痕迹明显' : '');
      rh.appendChild(tip);
    }

    if (hasTime) {
      var hHead = document.createElement('div');
      hHead.className = 'rhythm-legend';
      hHead.style.marginTop = '22px';
      hHead.style.marginBottom = '8px';
      hHead.textContent = '按小时 · 真实提交分布';
      rh.appendChild(hHead);

      var maxH = Math.max.apply(null, byHour.concat([1]));
      var grid = document.createElement('div');
      grid.className = 'rhythm';
      var row = document.createElement('div');
      row.className = 'rhythm-row';
      var lab = document.createElement('div');
      lab.className = 'rhythm-label';
      lab.textContent = '00-23';
      row.appendChild(lab);
      var cells = document.createElement('div');
      cells.className = 'rhythm-cells';
      for (var h = 0; h < 24; h++) {
        var cell = document.createElement('div');
        var v = byHour[h];
        var ratio = v / maxH;
        var lv = v === 0 ? 0 : ratio > 0.8 ? 5 : ratio > 0.6 ? 4 : ratio > 0.4 ? 3 : ratio > 0.2 ? 2 : 1;
        cell.className = 'rhythm-cell' + (lv ? ' l' + lv : '');
        cell.title = (h < 10 ? '0' + h : h) + ':00 · ' + v + ' 条真实提交';
        cells.appendChild(cell);
      }
      row.appendChild(cells);
      grid.appendChild(row);
      rh.appendChild(grid);

      var legend = document.createElement('div');
      legend.className = 'rhythm-legend';
      legend.innerHTML = '<span>少</span>';
      for (var l = 1; l <= 5; l++) {
        var s = document.createElement('span');
        s.className = 'rhythm-cell l' + l;
        s.style.width = '12px'; s.style.height = '12px'; s.style.display = 'inline-block';
        legend.appendChild(s);
      }
      legend.appendChild(document.createTextNode('多'));
      var peak = byHour.indexOf(maxH);
      var note = document.createElement('span');
      note.style.marginLeft = 'auto';
      note.textContent = '高峰 ' + (peak < 10 ? '0' + peak : peak) + ':00';
      legend.appendChild(note);
      rh.appendChild(legend);

      // 时段归纳
      var buckets = [
        { name: '凌晨 00-06', from: 0, to: 6 },
        { name: '上午 06-12', from: 6, to: 12 },
        { name: '下午 12-18', from: 12, to: 18 },
        { name: '晚间 18-24', from: 18, to: 24 }
      ];
      var sum = document.createElement('div');
      sum.style.marginTop = '18px';
      buckets.forEach(function (b) {
        var v2 = 0;
        for (var x = b.from; x < b.to; x++) v2 += byHour[x];
        var pct = real ? Math.round(v2 / real * 100) : 0;
        var r = document.createElement('div');
        r.className = 'dist-row';
        r.innerHTML = '<div class="dist-name">' + b.name + '</div>';
        var tr = document.createElement('div');
        tr.className = 'dist-track';
        var f = document.createElement('i');
        f.style.width = pct + '%';
        f.style.background = '#7a7a7a';
        tr.appendChild(f);
        r.appendChild(tr);
        var n2 = document.createElement('div');
        n2.className = 'dist-num';
        n2.textContent = pct + '%';
        r.appendChild(n2);
        sum.appendChild(r);
      });
      rh.appendChild(sum);
    } else if (weekTotal > 0) {
      var hint = document.createElement('div');
      hint.className = 'rhythm-legend';
      hint.style.marginTop = '18px';
      hint.textContent = '要看小时级分布？用 --date=format:"%ad %H:%M" 带上时间再解析';
      rh.appendChild(hint);
    } else {
      rh.innerHTML = '<div class="empty"><div class="empty-title">没有日期数据</div>'
        + '<div class="empty-sub">日志需包含 YYYY-MM-DD 形式的日期</div></div>';
    }

    // —— 导出 ——
    renderExport(classified, { total: total, real: real, noise: noise, noisePct: noisePct, span: spanText(dates), level: level });
  }

  function commitRow(item) {
    var el = document.createElement('div');
    el.className = 'commit' + (item.hidden ? ' noise' : '');
    var d = document.createElement('div');
    d.className = 'commit-date';
    d.textContent = item.c.date || '—';
    el.appendChild(d);

    var s = document.createElement('div');
    s.className = 'commit-subject';
    s.textContent = item.c.subject;
    if (item.c.author) {
      var a = document.createElement('span');
      a.className = 'tag author';
      a.textContent = authorLabel(item.c.author);
      a.title = state.desensitize ? '作者已脱敏' : item.c.author;
      s.appendChild(a);
    }
    if (item.cat !== REAL) {
      var t = document.createElement('span');
      t.className = 'tag';
      t.textContent = item.cat.name;
      s.appendChild(t);
    }
    el.appendChild(s);

    var h = document.createElement('div');
    h.className = 'commit-hash';
    h.textContent = item.c.hash || '';
    el.appendChild(h);
    return el;
  }

  /** 生成可直接粘贴的 Markdown 工作总结 */
  function renderExport(classified, st) {
    var box = $('tab-export');
    box.innerHTML = '';

    var realList = classified.filter(function (i) { return !i.hidden; })
      .map(function (i) { return i.c; });

    var lines = [];
    lines.push('## 开发工作记录（' + st.span + '）');
    lines.push('');
    lines.push('- 提交总数：' + st.total + '，其中真实开发提交 ' + st.real + ' 条，构建部署等噪音 ' + st.noise + ' 条（' + st.noisePct + '%）');
    lines.push('- 降噪强度：' + LEVEL_TEXT[st.level]);
    lines.push('');

    if (realList.length) {
      // 按日期归纳
      var byD = {};
      realList.forEach(function (c) {
        var k = c.date || '未标注日期';
        (byD[k] = byD[k] || []).push(c.subject);
      });
      Object.keys(byD).sort().reverse().forEach(function (k) {
        lines.push('### ' + k);
        byD[k].forEach(function (s) { lines.push('- ' + s); });
        lines.push('');
      });
    } else {
      lines.push('_未解析到真实开发提交_');
      lines.push('');
    }

    lines.push('---');
    lines.push('由 GitDeNoise 生成 · 数据本地解析');

    var pre = document.createElement('pre');
    pre.className = 'out';
    pre.textContent = lines.join('\n');
    box.appendChild(pre);

    var bar = document.createElement('div');
    bar.style.marginTop = '12px';
    bar.style.display = 'flex';
    bar.style.gap = '10px';
    bar.style.flexWrap = 'wrap';

    var b1 = document.createElement('button');
    b1.className = 'primary';
    b1.textContent = '复制 Markdown';
    b1.onclick = function () { copy(pre.textContent, b1); };
    bar.appendChild(b1);

    var b2 = document.createElement('button');
    b2.textContent = '复制纯净 commit 列表';
    b2.onclick = function () {
      copy(realList.map(function (c) { return (c.hash ? c.hash + ' ' : '') + c.subject; }).join('\n'), b2);
    };
    bar.appendChild(b2);

    var b3 = document.createElement('button');
    b3.textContent = '下载 .md';
    b3.onclick = function () { download(lines.join('\n'), 'git-denoise-report.md'); };
    bar.appendChild(b3);

    box.appendChild(bar);
  }

  function copy(text, btn) {
    var done = function () {
      var old = btn.textContent;
      btn.textContent = '已复制';
      setTimeout(function () { btn.textContent = old; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text); done();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function download(text, name) {
    var blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* ============================================================
   * 4. 交互绑定
   * ========================================================== */

  function showNotice(msg, isErr) {
    var n = $('notice');
    n.textContent = msg || '';
    n.className = isErr ? 'err' : '';
  }

  function run() {
    var text = input.value;
    var commits = parseInput(text);
    if (!commits.length) {
      showNotice('没有解析到任何提交，请检查输入格式（可点「载入示例」对照）', true);
      $('results').hidden = true;
      $('empty').hidden = false;
      return;
    }
    state.commits = commits;
    state.authorMap = buildAuthorMap(commits);
    showNotice('解析到 ' + commits.length + ' 条提交');
    $('empty').hidden = true;
    $('results').hidden = false;
    render();
  }

  $('btn-run').onclick = run;

  $('btn-clear').onclick = function () {
    input.value = '';
    updateCount();
    $('results').hidden = true;
    $('empty').hidden = false;
    showNotice('');
    input.focus();
  };

  function updateCount() {
    var n = input.value ? input.value.split(/\r?\n/).filter(function (l) { return l.trim(); }).length : 0;
    $('line-count').textContent = n + ' 行';
  }
  input.addEventListener('input', updateCount);

  // Ctrl/Cmd + Enter 直接运行
  input.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
  });

  // 降噪强度
  Array.prototype.forEach.call(document.querySelectorAll('.levels button'), function (btn) {
    btn.onclick = function () {
      Array.prototype.forEach.call(document.querySelectorAll('.levels button'), function (b) { b.classList.remove('on'); });
      btn.classList.add('on');
      state.level = btn.dataset.level;
      $('level-hint').textContent = LEVEL_TEXT[state.level];
      if (state.commits.length) render();
    };
  });

  // Tabs
  Array.prototype.forEach.call(document.querySelectorAll('.tabs button'), function (btn) {
    btn.onclick = function () {
      Array.prototype.forEach.call(document.querySelectorAll('.tabs button'), function (b) { b.classList.remove('on'); });
      btn.classList.add('on');
      ['timeline', 'rhythm', 'export'].forEach(function (t) {
        $('tab-' + t).hidden = (t !== btn.dataset.tab);
      });
    };
  });

  // 脱敏开关
  $('toggle-desensitize').onchange = function (e) {
    state.desensitize = e.target.checked;
    if (state.commits.length) render();
  };

  // 示例数据：结构取自真实仓库形态，但作者名、项目名、分支名均已脱敏替换，
  // 不含任何真实内部信息，可安全用于演示与对外分享。
  var SAMPLE = [
    "a1b2c3d|2026-10-14|dev-a|build: web 更新正式环境-2026-10-14 16:50:59",
    "e4f5a6b|2026-10-14|dev-b|build: webapp 更新A环境-2026-10-14 14:03:51",
    "c7d8e9f|2026-10-14|dev-a|build: 活动模块 更新C环境-2026-10-14 09:31:32",
    "b2c3d4e|2026-10-13|dev-a|feat: 活动页倒计时支持服务端下发",
    "f5a6b7c|2026-10-13|dev-b|build: webapp 更新C环境-2026-10-13 14:22:24",
    "d8e9f0a|2026-10-13|dev-a|fix: 修复首充页选中态在低版本 WebView 下失效",
    "a9b0c1d|2026-10-12|dev-a|refactor: 抽取通用游戏卡片组件",
    "e2f3a4b|2026-10-12|dev-b|Merge branch 'release/2.4' into 'master'",
    "c5d6e7f|2026-10-11|dev-a|perf: 游戏列表图片改为懒加载，首屏体积降 38%",
    "b8c9d0e|2026-10-11|dev-a|docs: 补充活动系统接入说明",
    "f1a2b3c|2026-10-10|dev-a|build: 活动模块 更新A环境-2026-10-10 14:56:49",
    "d4e5f6a|2026-10-10|dev-a|feat: 登录弹窗接入统一 campaign init 接口",
    "a7b8c9d|2026-10-09|dev-a|v1.4.0",
    "e0f1a2b|2026-10-09|dev-a|build: webapp 更新A环境-2026-10-09 11:37:48",
    "c3d4e5f|2026-10-09|dev-a|fix: 修复 iOS 下 100vh 导致底部按钮被遮挡",
    "b6c7d8e|2026-10-08|dev-a|feat: 资格校验链路接入 eligibility check",
    "f9a0b1c|2026-10-08|dev-a|Revert \"feat: 试验性接入新版支付 SDK\"",
    "d2e3f4a|2026-10-08|dev-a|style: 统一活动页间距与字号 token",
    "a5b6c7d|2026-10-07|dev-a|chore: 剔除旧版详情页残留入口代码",
    "e8f9a0b|2026-10-07|dev-a|优化 PC 端部分页面布局，修复 1280 宽度下的错位",
    "c1d2e3f|2026-10-06|dev-a|build: 活动模块 更新C环境-2026-10-06 18:12:03",
    "b4c5d6e|2026-10-06|dev-a|test: 补充活动资格校验单元测试"
  ].join('\n');

  $('btn-sample').onclick = function () {
    input.value = SAMPLE;
    updateCount();
    run();
  };

  // 文件导入
  $('btn-file').onclick = function () { $('file-input').click(); };
  $('file-input').onchange = function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      input.value = String(reader.result || '');
      updateCount();
      run();
    };
    reader.readAsText(f);
    e.target.value = '';
  };

  // 使用说明区：命令一键复制
  Array.prototype.forEach.call(document.querySelectorAll('.copy-mini'), function (btn) {
    btn.onclick = function () { copy(btn.dataset.copy, btn); };
  });

  updateCount();
})();
