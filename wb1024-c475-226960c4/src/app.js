document.head.insertAdjacentHTML("beforeend", "<style>\n  :root{\n    --bg-0:#05060d;\n    --bg-1:#0a0e1f;\n    --bg-2:#0f1530;\n    --ink:#e8edff;\n    --ink-dim:#9aa6cf;\n    --ink-faint:#5f6b94;\n    --line:rgba(140,160,255,.14);\n    --glass:rgba(18,24,52,.55);\n    --accent:#22d3ee;\n    --accent-2:#a855f7;\n    --accent-3:#34d399;\n    --radius:18px;\n    --shadow:0 20px 60px rgba(0,0,0,.45);\n    --maxw:1180px;\n  }\n  *{box-sizing:border-box;margin:0;padding:0}\n  html{scroll-behavior:smooth}\n  body{\n    font-family:\"PingFang SC\",\"Microsoft YaHei\",\"Segoe UI\",system-ui,-apple-system,sans-serif;\n    background:\n      radial-gradient(1200px 700px at 80% -10%, rgba(168,85,247,.18), transparent 60%),\n      radial-gradient(900px 600px at 0% 10%, rgba(34,211,238,.14), transparent 55%),\n      linear-gradient(180deg,var(--bg-0),var(--bg-1) 40%,var(--bg-2));\n    color:var(--ink);\n    line-height:1.65;\n    overflow-x:hidden;\n    -webkit-font-smoothing:antialiased;\n  }\n  a{color:inherit;text-decoration:none}\n  img{max-width:100%;display:block}\n  .wrap{max-width:var(--maxw);margin:0 auto;padding:0 22px}\n  .mono{font-family:\"SFMono-Regular\",Consolas,\"Liberation Mono\",Menlo,monospace}\n\n  /* ===== NAV ===== */\n  nav{\n    position:sticky;top:0;z-index:50;\n    backdrop-filter:blur(14px);\n    background:rgba(7,10,22,.55);\n    border-bottom:1px solid var(--line);\n  }\n  .nav-inner{display:flex;align-items:center;justify-content:space-between;height:64px}\n  .brand{display:flex;align-items:center;gap:10px;font-weight:700;letter-spacing:.5px}\n  .brand .logo{\n    width:30px;height:30px;border-radius:9px;\n    background:conic-gradient(from 200deg,var(--accent),var(--accent-2),var(--accent-3),var(--accent));\n    box-shadow:0 0 18px rgba(34,211,238,.5);\n    display:grid;place-items:center;font-size:15px;color:#05060d;font-weight:800;\n  }\n  .brand small{color:var(--ink-faint);font-weight:500;font-size:12px}\n  .nav-links{display:flex;gap:26px;font-size:15px;color:var(--ink-dim)}\n  .nav-links a{transition:color .2s}\n  .nav-links a:hover{color:var(--ink)}\n  .nav-cta{\n    padding:9px 18px;border-radius:999px;font-size:14px;font-weight:600;\n    background:linear-gradient(90deg,var(--accent),var(--accent-2));\n    color:#05060d;box-shadow:0 8px 24px rgba(168,85,247,.35);\n  }\n  .burger{display:none;background:none;border:0;color:var(--ink);font-size:24px;cursor:pointer}\n\n  /* ===== HERO ===== */\n  .hero{position:relative;min-height:92vh;display:flex;align-items:center;overflow:hidden}\n  #stars{position:absolute;inset:0;width:100%;height:100%;z-index:0}\n  .hero .wrap{position:relative;z-index:2;padding-top:40px;padding-bottom:40px}\n  .pill{\n    display:inline-flex;align-items:center;gap:8px;\n    padding:6px 14px;border-radius:999px;font-size:13px;\n    border:1px solid var(--line);background:var(--glass);color:var(--ink-dim);\n    margin-bottom:22px;\n  }\n  .pill b{color:var(--accent)}\n  .hero h1{\n    font-size:clamp(38px,7vw,76px);line-height:1.05;font-weight:800;letter-spacing:-1px;\n    background:linear-gradient(120deg,#fff 10%,var(--accent) 45%,var(--accent-2) 80%);\n    -webkit-background-clip:text;background-clip:text;color:transparent;\n    text-shadow:0 0 40px rgba(34,211,238,.15);\n  }\n  .hero p.lead{margin-top:20px;max-width:620px;font-size:clamp(16px,2.2vw,20px);color:var(--ink-dim)}\n  .hero .btns{margin-top:34px;display:flex;gap:14px;flex-wrap:wrap}\n  .btn{\n    padding:13px 26px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;border:0;\n    transition:transform .15s ease, box-shadow .2s ease;\n  }\n  .btn-primary{background:linear-gradient(90deg,var(--accent),var(--accent-2));color:#05060d;box-shadow:0 10px 30px rgba(34,211,238,.3)}\n  .btn-ghost{background:var(--glass);color:var(--ink);border:1px solid var(--line)}\n  .btn:hover{transform:translateY(-2px)}\n  .btn:active{transform:translateY(0)}\n  .stats{margin-top:54px;display:flex;gap:34px;flex-wrap:wrap}\n  .stat .num{font-size:30px;font-weight:800;color:var(--ink)}\n  .stat .lbl{font-size:13px;color:var(--ink-faint)}\n\n  .scroll-hint{position:absolute;bottom:22px;left:50%;transform:translateX(-50%);z-index:2;color:var(--ink-faint);font-size:12px;animation:bob 2s infinite}\n  @keyframes bob{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,8px)}}\n\n  /* ===== SECTION ===== */\n  section{padding:90px 0;position:relative}\n  .sec-head{text-align:center;max-width:760px;margin:0 auto 50px}\n  .sec-head .tag{color:var(--accent);font-weight:700;letter-spacing:2px;font-size:13px;text-transform:uppercase}\n  .sec-head h2{font-size:clamp(26px,4vw,42px);font-weight:800;margin-top:10px;letter-spacing:-.5px}\n  .sec-head p{color:var(--ink-dim);margin-top:14px;font-size:16px}\n\n  /* ===== WORKSHOP ===== */\n  .lab{display:grid;grid-template-columns:340px 1fr;gap:26px;align-items:start}\n  .panel{\n    background:var(--glass);border:1px solid var(--line);border-radius:var(--radius);\n    padding:22px;box-shadow:var(--shadow);backdrop-filter:blur(10px);\n  }\n  .panel h3{font-size:17px;display:flex;align-items:center;gap:8px;margin-bottom:6px}\n  .panel .hint{color:var(--ink-faint);font-size:13px;margin-bottom:18px}\n  .tabs{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}\n  .tab{\n    flex:1;min-width:90px;text-align:center;padding:10px 8px;border-radius:11px;cursor:pointer;\n    border:1px solid var(--line);background:rgba(255,255,255,.02);color:var(--ink-dim);font-size:14px;font-weight:600;\n    transition:.2s;\n  }\n  .tab.active{background:linear-gradient(120deg,rgba(34,211,238,.22),rgba(168,85,247,.22));color:#fff;border-color:transparent;box-shadow:0 0 0 1px rgba(34,211,238,.4) inset}\n  .ctrl{margin-bottom:16px}\n  .ctrl label{display:flex;justify-content:space-between;font-size:13px;color:var(--ink-dim);margin-bottom:7px}\n  .ctrl label b{color:var(--accent);font-family:var(--mono)}\n  input[type=range]{\n    -webkit-appearance:none;width:100%;height:5px;border-radius:5px;\n    background:linear-gradient(90deg,var(--accent),var(--accent-2));outline:none;\n  }\n  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:17px;height:17px;border-radius:50%;background:#fff;box-shadow:0 0 10px rgba(34,211,238,.8);cursor:pointer}\n  input[type=range]::-moz-range-thumb{width:17px;height:17px;border:0;border-radius:50%;background:#fff;cursor:pointer}\n  .field{margin-bottom:16px}\n  .field label{display:block;font-size:13px;color:var(--ink-dim);margin-bottom:7px}\n  .field input[type=text],.field select{\n    width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--line);\n    background:rgba(5,8,20,.6);color:var(--ink);font-size:14px;\n  }\n  .field input::placeholder{color:var(--ink-faint)}\n  .row-btns{display:flex;gap:10px;margin-top:6px;flex-wrap:wrap}\n  .row-btns .btn{flex:1;padding:11px 10px;font-size:14px}\n  .stage-wrap{position:relative;border-radius:var(--radius);overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow);background:radial-gradient(120% 120% at 50% 0%,#0c1228,#05060d)}\n  #stage{display:block;width:100%;height:560px}\n  .stage-badge{position:absolute;top:14px;left:14px;font-size:12px;color:var(--ink-dim);background:rgba(5,8,20,.55);padding:6px 12px;border-radius:999px;border:1px solid var(--line);backdrop-filter:blur(6px)}\n  .seed-note{margin-top:14px;font-size:13px;color:var(--ink-faint);text-align:center}\n\n  /* ===== CONCEPT ===== */\n  .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}\n  .card{\n    background:var(--glass);border:1px solid var(--line);border-radius:var(--radius);padding:24px;\n    transition:.25s;position:relative;overflow:hidden;\n  }\n  .card:hover{transform:translateY(-6px);border-color:rgba(34,211,238,.4)}\n  .card .ico{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;font-size:22px;margin-bottom:16px;background:linear-gradient(135deg,rgba(34,211,238,.2),rgba(168,85,247,.2))}\n  .card h4{font-size:18px;margin-bottom:8px}\n  .card p{font-size:14px;color:var(--ink-dim)}\n  .egg{margin-top:34px;text-align:center;font-size:15px;color:var(--ink-dim)}\n  .egg b{color:var(--accent-3);font-family:var(--mono)}\n\n  /* ===== GALLERY ===== */\n  .gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px}\n  .g-item{background:var(--glass);border:1px solid var(--line);border-radius:14px;overflow:hidden;position:relative;transition:.2s}\n  .g-item:hover{transform:translateY(-4px);border-color:rgba(168,85,247,.4)}\n  .g-item img{width:100%;height:170px;object-fit:cover;background:#0b1020}\n  .g-meta{padding:12px 14px;display:flex;justify-content:space-between;align-items:center}\n  .g-meta .name{font-size:14px;font-weight:600}\n  .g-meta .tag{font-size:11px;color:var(--accent);border:1px solid var(--line);padding:2px 8px;border-radius:999px}\n  .g-del{position:absolute;top:8px;right:8px;width:30px;height:30px;border-radius:50%;border:0;background:rgba(5,8,20,.7);color:#ff8080;cursor:pointer;font-size:16px;display:none}\n  .g-item:hover .g-del{display:block}\n  .empty{text-align:center;color:var(--ink-faint);padding:50px 0;grid-column:1/-1;border:1px dashed var(--line);border-radius:14px}\n\n  /* ===== ABOUT ===== */\n  .about{display:grid;grid-template-columns:1.2fr 1fr;gap:26px}\n  .about .panel p{color:var(--ink-dim);font-size:15px;margin-bottom:12px}\n  .stack{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}\n  .stack span{font-size:13px;padding:7px 13px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.03);color:var(--ink-dim)}\n  .meta-list{list-style:none}\n  .meta-list li{padding:12px 0;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;font-size:14px}\n  .meta-list li span:first-child{color:var(--ink-faint)}\n  .meta-list li span:last-child{color:var(--ink);font-weight:600}\n\n  footer{padding:40px 0;border-top:1px solid var(--line);color:var(--ink-faint);font-size:13px;text-align:center}\n  footer b{color:var(--ink-dim)}\n\n  /* ===== RESPONSIVE ===== */\n  @media (max-width:980px){\n    .lab{grid-template-columns:1fr}\n    #stage{height:440px}\n    .cards{grid-template-columns:repeat(2,1fr)}\n    .about{grid-template-columns:1fr}\n  }\n  @media (max-width:680px){\n    .nav-links{\n      position:absolute;top:64px;left:0;right:0;flex-direction:column;gap:0;\n      background:rgba(7,10,22,.97);border-bottom:1px solid var(--line);padding:8px 22px 16px;\n      display:none;\n    }\n    .nav-links.open{display:flex}\n    .nav-links a{padding:12px 0;border-bottom:1px solid var(--line)}\n    .burger{display:block}\n    .nav-cta{display:none}\n    .cards{grid-template-columns:1fr}\n    .stats{gap:22px}\n    section{padding:64px 0}\n    .hero{min-height:auto;padding-top:30px}\n  }\n</style>");
document.body.insertAdjacentHTML("beforeend", "\n\n<!-- NAV -->\n<nav>\n  <div class=\"wrap nav-inner\">\n    <div class=\"brand\">\n      <span class=\"logo\">⌬</span>\n      <span>字节花园<br><small>ByteGarden · 1024</small></span>\n    </div>\n    <div class=\"nav-links\" id=\"navLinks\">\n      <a href=\"#lab\">造物工坊</a>\n      <a href=\"#concept\">作品理念</a>\n      <a href=\"#gallery\">星河画廊</a>\n      <a href=\"#about\">关于作品</a>\n      <a href=\"#lab\" class=\"nav-cta\">开始造物</a>\n    </div>\n    <button class=\"burger\" id=\"burger\" aria-label=\"菜单\">☰</button>\n  </div>\n</nav>\n\n<!-- HERO -->\n<header class=\"hero\">\n  <canvas id=\"stars\"></canvas>\n  <div class=\"wrap\">\n    <span class=\"pill\">🪐 1024 造物挑战 · 程序员节应用创作大赛 · <b>参赛作品</b></span>\n    <h1>用 0 与 1<br>种一片会生长的光</h1>\n    <p class=\"lead\">字节花园是一个生成式互动网页：每一次点击都是一次播种，每一段代码都生长为独一无二的数字生命。这是献给所有用逻辑创造世界的程序员的浪漫。</p>\n    <div class=\"btns\">\n      <button class=\"btn btn-primary\" onclick=\"document.getElementById('lab').scrollIntoView()\">⚡ 进入造物工坊</button>\n      <a class=\"btn btn-ghost\" href=\"#concept\">了解作品理念</a>\n    </div>\n    <div class=\"stats\">\n      <div class=\"stat\"><div class=\"num\">2<sup>10</sup></div><div class=\"lbl\">= 1024 个比特，一个程序员的节庆</div></div>\n      <div class=\"stat\"><div class=\"num\">3</div><div class=\"lbl\">种生成算法 · 无限可能</div></div>\n      <div class=\"stat\"><div class=\"num\">∞</div><div class=\"lbl\">由你的种子决定形态</div></div>\n    </div>\n  </div>\n  <div class=\"scroll-hint\">向下滚动 ↓</div>\n</header>\n\n<!-- WORKSHOP / CORE -->\n<section id=\"lab\">\n  <div class=\"wrap\">\n    <div class=\"sec-head\">\n      <div class=\"tag\">CORE MODULE</div>\n      <h2>造物工坊</h2>\n      <p>选择一种生成算法，调节参数，输入属于你的「种子」，然后点击播种——花园会为你实时生长。</p>\n    </div>\n\n    <div class=\"lab\">\n      <!-- 控制面板 -->\n      <div class=\"panel\">\n        <h3>🎛️ 控制台</h3>\n        <div class=\"hint\">拖动滑块即时预览，点击「播种」播放生长动画。</div>\n\n        <div class=\"tabs\" id=\"tabs\">\n          <div class=\"tab active\" data-mode=\"tree\">分形之树</div>\n          <div class=\"tab\" data-mode=\"flower\">黄金花绽</div>\n          <div class=\"tab\" data-mode=\"star\">星图谱系</div>\n        </div>\n\n        <!-- 分形之树 参数 -->\n        <div class=\"ctrl\" data-for=\"tree\">\n          <label>迭代层数 <b id=\"v-depth\">9</b></label>\n          <input type=\"range\" id=\"depth\" min=\"4\" max=\"10\" value=\"9\">\n        </div>\n        <div class=\"ctrl\" data-for=\"tree\">\n          <label>分支数 <b id=\"v-branches\">2</b></label>\n          <input type=\"range\" id=\"branches\" min=\"2\" max=\"4\" value=\"2\">\n        </div>\n        <div class=\"ctrl\" data-for=\"tree\">\n          <label>张开角度 <b id=\"v-angle\">26°</b></label>\n          <input type=\"range\" id=\"angle\" min=\"8\" max=\"50\" value=\"26\">\n        </div>\n        <div class=\"ctrl\" data-for=\"tree\">\n          <label>长度衰减 <b id=\"v-ratio\">0.75</b></label>\n          <input type=\"range\" id=\"ratio\" min=\"0.60\" max=\"0.82\" step=\"0.01\" value=\"0.75\">\n        </div>\n\n        <!-- 黄金花绽 参数 -->\n        <div class=\"ctrl\" data-for=\"flower\" style=\"display:none\">\n          <label>粒子数 <b id=\"v-count\">700</b></label>\n          <input type=\"range\" id=\"count\" min=\"80\" max=\"1200\" value=\"700\">\n        </div>\n        <div class=\"ctrl\" data-for=\"flower\" style=\"display:none\">\n          <label>绽放尺度 <b id=\"v-scale\">7.0</b></label>\n          <input type=\"range\" id=\"scale\" min=\"4\" max=\"12\" step=\"0.5\" value=\"7\">\n        </div>\n        <div class=\"ctrl\" data-for=\"flower\" style=\"display:none\">\n          <label>对称瓣数 <b id=\"v-petals\">1</b></label>\n          <input type=\"range\" id=\"petals\" min=\"1\" max=\"12\" value=\"1\">\n        </div>\n\n        <!-- 星图谱系 参数 -->\n        <div class=\"ctrl\" data-for=\"star\" style=\"display:none\">\n          <label>星点数量 <b id=\"v-stars\">28</b></label>\n          <input type=\"range\" id=\"starCount\" min=\"8\" max=\"60\" value=\"28\">\n        </div>\n\n        <div class=\"field\">\n          <label>🌱 种子（文字 / 任意输入）</label>\n          <input type=\"text\" id=\"seed\" placeholder=\"例如：hello-world / 1024 / 你的名字\" value=\"1024\">\n        </div>\n        <div class=\"field\">\n          <label>🎨 配色主题</label>\n          <select id=\"theme\">\n            <option value=\"neon\">霓虹青紫</option>\n            <option value=\"aurora\">极光翠绿</option>\n            <option value=\"sunset\">晚霞绯紫</option>\n            <option value=\"matrix\">终端绿</option>\n          </select>\n        </div>\n\n        <div class=\"row-btns\">\n          <button class=\"btn btn-primary\" id=\"sow\">🌱 播种</button>\n          <button class=\"btn btn-ghost\" id=\"rand\">🎲 随机</button>\n        </div>\n        <div class=\"row-btns\">\n          <button class=\"btn btn-ghost\" id=\"save\">💾 收藏到花园</button>\n          <button class=\"btn btn-ghost\" id=\"export\">⬇️ 导出 PNG</button>\n        </div>\n        <div class=\"seed-note\" id=\"seedNote\">当前种子哈希：—</div>\n      </div>\n\n      <!-- 画布舞台 -->\n      <div class=\"stage-wrap\">\n        <canvas id=\"stage\"></canvas>\n        <div class=\"stage-badge\" id=\"stageBadge\">分形之树 · 霓虹青紫</div>\n      </div>\n    </div>\n  </div>\n</section>\n\n<!-- CONCEPT -->\n<section id=\"concept\">\n  <div class=\"wrap\">\n    <div class=\"sec-head\">\n      <div class=\"tag\">ABOUT THE WORK</div>\n      <h2>作品理念</h2>\n      <p>「造物」是程序员最浪漫的本能。字节花园把这种本能具象成一片可以亲手培育的光之花园。</p>\n    </div>\n    <div class=\"cards\">\n      <div class=\"card\">\n        <div class=\"ico\">🌱</div>\n        <h4>创意原点</h4>\n        <p>代码不只是指令，它是种子。我们用最朴素的 0 与 1，让抽象的算法长出枝干、绽放花朵、连成星图——把「程序员的创造欲」变成看得见的生命。</p>\n      </div>\n      <div class=\"card\">\n        <div class=\"ico\">⚙️</div>\n        <h4>核心玩法</h4>\n        <p>三种生成算法自由切换：递归分形树、黄金角向日葵、哈希星图。同一颗种子永远长出同一种形态，换种子即换一个宇宙。</p>\n      </div>\n      <div class=\"card\">\n        <div class=\"ico\">💡</div>\n        <h4>技术实现</h4>\n        <p>纯前端单文件，Canvas 2D 绘制，配合 L-System 递归、Phyllotaxis 黄金角与确定性伪随机（Seeded RNG）。零依赖、可离线、秒开。</p>\n      </div>\n      <div class=\"card\">\n        <div class=\"ico\">🎁</div>\n        <h4>1024 彩蛋</h4>\n        <p>分形之树默认 10 层、2 分支，恰好结出 <b style=\"color:var(--accent-3)\">1024</b> 片叶子——以此致敬 2¹⁰，程序员自己的节日。</p>\n      </div>\n    </div>\n    <div class=\"egg\">💡 彩蛋：把种子设为 <b>1024</b> 并选择「分形之树 · 10 层」，你将收获一棵正好 1024 片叶子的比特之树。</div>\n  </div>\n</section>\n\n<!-- GALLERY -->\n<section id=\"gallery\">\n  <div class=\"wrap\">\n    <div class=\"sec-head\">\n      <div class=\"tag\">YOUR GARDEN</div>\n      <h2>星河画廊</h2>\n      <p>你收藏的每一株造物都保存在本地浏览器，组成只属于你的星河。点击图片右上角可删除。</p>\n    </div>\n    <div class=\"gallery\" id=\"galleryGrid\"></div>\n  </div>\n</section>\n\n<!-- ABOUT -->\n<section id=\"about\">\n  <div class=\"wrap\">\n    <div class=\"sec-head\">\n      <div class=\"tag\">CREDITS</div>\n      <h2>关于作品</h2>\n    </div>\n    <div class=\"about\">\n      <div class=\"panel\">\n        <h3>📜 作品自述</h3>\n        <p>字节花园 · ByteGarden 是面向「1024 造物挑战」程序员节应用创作大赛提交的一件生成式网页艺术作品。</p>\n        <p>它没有复杂的业务，只想回答一个问题：如果代码是一种生命力，它会长成什么样子？于是我们让递归长出枝干、让黄金角开出花朵、让哈希连成星河。</p>\n        <p>整件作品是一个单 HTML 文件，无任何外部依赖，桌面与移动端自适应。它既是玩具，也是一首写给程序员的短诗。</p>\n        <div class=\"stack\">\n          <span>HTML5</span><span>CSS3</span><span>Canvas 2D</span><span>原生 JavaScript</span>\n          <span>L-System</span><span>Phyllotaxis</span><span>Seeded RNG</span><span>响应式设计</span>\n        </div>\n      </div>\n      <div class=\"panel\">\n        <h3>🏷️ 参赛信息</h3>\n        <ul class=\"meta-list\">\n          <li><span>作品名称</span><span>字节花园 ByteGarden</span></li>\n          <li><span>参赛赛事</span><span>1024 造物挑战</span></li>\n          <li><span>作品类型</span><span>生成式互动网页</span></li>\n          <li><span>技术栈</span><span>纯前端 · 零依赖</span></li>\n          <li><span>核心交互</span><span>参数调节 / 实时生成</span></li>\n          <li><span>兼容设备</span><span>桌面端 + 移动端</span></li>\n        </ul>\n      </div>\n    </div>\n  </div>\n</section>\n\n<footer>\n  <div class=\"wrap\">\n    <p>🌿 <b>字节花园 ByteGarden</b> · 用 0 与 1 种一片会生长的光</p>\n    <p style=\"margin-top:6px\">参赛作品 · 1024 造物挑战 · 程序员节应用创作大赛 · © 2026</p>\n  </div>\n</footer>\n\n");

/* ============ 工具 ============ */
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
const THEMES={
  neon:[[34,211,238],[99,102,241],[168,85,247]],
  aurora:[[16,185,129],[45,212,191],[132,204,22]],
  sunset:[[244,63,94],[249,115,22],[217,70,239]],
  matrix:[[22,163,74],[34,197,94],[125,211,252]]
};
function colorFor(theme,t){
  const pal=THEMES[theme]||THEMES.neon;const seg=pal.length-1;
  const f=clamp(t,0,1)*seg;const i=Math.floor(f);const fr=f-i;
  const a=pal[i],b=pal[Math.min(seg,i+1)];
  const r=Math.round(a[0]+(b[0]-a[0])*fr);
  const g=Math.round(a[1]+(b[1]-a[1])*fr);
  const bl=Math.round(a[2]+(b[2]-a[2])*fr);
  return 'rgb('+r+','+g+','+bl+')';
}

/* ============ 画布 ============ */
const stage=document.getElementById('stage');
const ctx=stage.getContext('2d');
let W=0,H=0,DPR=Math.min(window.devicePixelRatio||1,2);
function resizeStage(){
  W=stage.clientWidth;H=stage.clientHeight;
  stage.width=W*DPR;stage.height=H*DPR;
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
const MODE_NAMES={tree:'分形之树',flower:'黄金花绽',star:'星图谱系'};
let currentMode='tree';
let currentTheme='neon';
let currentSeedStr='1024';
let raf=null;

/* ============ 生成算法 ============ */
function buildOps(){
  const rng=mulberry32(hashStr(currentSeedStr||'1024'));
  if(currentMode==='tree') return buildTree(rng);
  if(currentMode==='flower') return buildFlower(rng);
  return buildStar(rng);
}
function buildTree(rng){
  const ops=[];const maxD=clamp(+depth.value,4,10);
  const branchCount=clamp(+branches.value,2,4);
  const spread=(+angle.value)*Math.PI/180;
  const ratioVal=+ratio.value;
  const len0=H*0.20;let guard=0;
  function rec(x,y,len,ang,d){
    if(d>maxD||len<1.5||guard>40000)return;
    const x2=x+Math.cos(ang)*len,y2=y+Math.sin(ang)*len;
    ops.push({type:'line',x1:x,y1:y,x2,y2,w:Math.max(0.6,(maxD-d)*0.7),c:colorFor(currentTheme,d/maxD)});
    guard++;
    for(let i=0;i<branchCount;i++){
      const off=(i-(branchCount-1)/2)*spread+(rng()-0.5)*0.12;
      rec(x2,y2,len*ratioVal,ang+off,d+1);
    }
  }
  rec(W/2,H-28,len0,-Math.PI/2,0);
  return ops;
}
function buildFlower(rng){
  const ops=[];const n=clamp(+count.value,80,1200);
  const scaleVal=+scale.value;const petalCount=clamp(+petals.value,1,12);
  for(let i=0;i<n;i++){
    const a=i*2.399963;const r=scaleVal*Math.sqrt(i);
    for(let p=0;p<petalCount;p++){
      const rot=p*2*Math.PI/petalCount;
      const x=W/2+r*Math.cos(a+rot),y=H/2+r*Math.sin(a+rot);
      ops.push({type:'dot',x,y,r:1.2+(1-i/n)*2.4,c:colorFor(currentTheme,i/n)});
    }
  }
  return ops;
}
function buildStar(rng){
  const ops=[];const k=clamp(+starCount.value,8,60);
  const pts=[];
  for(let i=0;i<k;i++)pts.push({x:40+rng()*(W-80),y:40+rng()*(H-80),s:1+rng()*2.6});
  pts.forEach((p,i)=>ops.push({type:'dot',x:p.x,y:p.y,r:p.s,c:colorFor(currentTheme,i/k)}));
  for(let i=0;i<pts.length;i++){
    const near=pts.map((q,j)=>({j,d:(q.x-pts[i].x)**2+(q.y-pts[i].y)**2})).filter(o=>o.j!==i).sort((a,b)=>a.d-b.d).slice(0,2);
    near.forEach(o=>ops.push({type:'line',x1:pts[i].x,y1:pts[i].y,x2:pts[o.j].x,y2:pts[o.j].y,w:0.6,c:colorFor(currentTheme,i/k)}));
  }
  return ops;
}
function drawOps(ops,e){
  ctx.clearRect(0,0,W,H);
  const reveal=Math.floor(e*ops.length);
  for(let i=0;i<reveal;i++){
    const o=ops[i];
    if(o.type==='line'){ctx.strokeStyle=o.c;ctx.lineWidth=o.w;ctx.beginPath();ctx.moveTo(o.x1,o.y1);ctx.lineTo(o.x2,o.y2);ctx.stroke();}
    else{ctx.fillStyle=o.c;ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,7);ctx.fill();}
  }
}
function generate(animate){
  resizeStage();
  cancelAnimationFrame(raf);
  const ops=buildOps();
  if(!animate){drawOps(ops,1);return;}
  let start=null;const dur=1500;
  function frame(ts){
    if(!start)start=ts;
    const p=Math.min(1,(ts-start)/dur);
    const e=1-Math.pow(1-p,3);
    drawOps(ops,e);
    if(p<1)raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
}

/* ============ 控件绑定 ============ */
const depth=document.getElementById('depth'),branches=document.getElementById('branches'),
      angle=document.getElementById('angle'),ratio=document.getElementById('ratio'),
      count=document.getElementById('count'),scale=document.getElementById('scale'),
      petals=document.getElementById('petals'),starCount=document.getElementById('starCount'),
      seed=document.getElementById('seed'),theme=document.getElementById('theme'),
      stageBadge=document.getElementById('stageBadge'),seedNote=document.getElementById('seedNote');

function bindVal(input,label,fmt){
  const el=document.getElementById(label);
  const upd=()=>{el.textContent=fmt?fmt(input.value):input.value;};
  input.addEventListener('input',()=>{upd();generate(false);});
  upd();
}
bindVal(depth,'v-depth');
bindVal(branches,'v-branches');
bindVal(angle,'v-angle',v=>v+'°');
bindVal(ratio,'v-ratio',v=>(+v).toFixed(2));
bindVal(count,'v-count');
bindVal(scale,'v-scale',v=>(+v).toFixed(1));
bindVal(petals,'v-petals');
bindVal(starCount,'v-stars');

seed.addEventListener('input',()=>{currentSeedStr=seed.value;updateSeedNote();generate(false);});
theme.addEventListener('change',()=>{currentTheme=theme.value;updateBadge();generate(false);});

function updateBadge(){stageBadge.textContent=MODE_NAMES[currentMode]+' · '+theme.options[theme.selectedIndex].text;}
function updateSeedNote(){seedNote.textContent='当前种子哈希：0x'+hashStr(currentSeedStr||'1024').toString(16).padStart(8,'0');}

document.getElementById('tabs').addEventListener('click',e=>{
  const t=e.target.closest('.tab');if(!t)return;
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  currentMode=t.dataset.mode;
  document.querySelectorAll('.ctrl').forEach(c=>c.style.display=(c.dataset.for===currentMode)?'block':'none');
  updateBadge();generate(true);
});

document.getElementById('sow').addEventListener('click',()=>generate(true));
const WORDS=['hello-world','quantum','nebula','0xDEADBEEF','git-commit','async-await','bit-shift','kernel','lambda','recursion','byte','octopus'];
document.getElementById('rand').addEventListener('click',()=>{
  const w=WORDS[Math.floor(Math.random()*WORDS.length)]+'-'+Math.floor(Math.random()*999);
  seed.value=w;currentSeedStr=w;updateSeedNote();generate(true);
});

/* ============ 画廊 / 收藏 / 导出 ============ */
const GKEY='bytegarden_gallery';
function loadGallery(){try{return JSON.parse(localStorage.getItem(GKEY))||[];}catch(e){return[];}}
function saveGallery(a){localStorage.setItem(GKEY,JSON.stringify(a));}
function saveThumb(){
  const t=document.createElement('canvas');t.width=stage.width;t.height=stage.height;
  const tc=t.getContext('2d');tc.fillStyle='#0b1020';tc.fillRect(0,0,t.width,t.height);tc.drawImage(stage,0,0);
  return t.toDataURL('image/png');
}
document.getElementById('save').addEventListener('click',()=>{
  const a=loadGallery();
  if(a.length>=24){alert('花园已满（最多 24 株），可先删除部分再收藏。');return;}
  const item={id:Date.now(),name:'造物 #'+(a.length+1),mode:currentMode,seed:currentSeedStr,theme:currentTheme,thumb:saveThumb()};
  a.unshift(item);saveGallery(a);renderGallery();
});
document.getElementById('export').addEventListener('click',()=>{
  const url=saveThumb();const link=document.createElement('a');
  link.href=url;link.download='bytegarden-'+currentMode+'-'+(currentSeedStr||'seed')+'.png';link.click();
});
function renderGallery(){
  const grid=document.getElementById('galleryGrid');const a=loadGallery();
  if(!a.length){grid.innerHTML='<div class="empty">🌌 花园还是空的。去造物工坊播种，然后点击「收藏到花园」吧。</div>';return;}
  grid.innerHTML=a.map(it=>`
    <div class="g-item">
      <button class="g-del" data-id="${it.id}" title="删除">✕</button>
      <img src="${it.thumb}" alt="${it.name}">
      <div class="g-meta"><span class="name">${it.name}</span><span class="tag">${MODE_NAMES[it.mode]}</span></div>
    </div>`).join('');
  grid.querySelectorAll('.g-del').forEach(b=>b.addEventListener('click',()=>{
    const na=loadGallery().filter(x=>x.id!=b.dataset.id);saveGallery(na);renderGallery();
  }));
}

/* ============ 移动端菜单 ============ */
document.getElementById('burger').addEventListener('click',()=>{
  document.getElementById('navLinks').classList.toggle('open');
});
document.querySelectorAll('#navLinks a').forEach(a=>a.addEventListener('click',()=>{
  document.getElementById('navLinks').classList.remove('open');
}));

/* ============ 背景星空 ============ */
const starsC=document.getElementById('stars');const sctx=starsC.getContext('2d');
let sp=[];
function initStars(){
  starsC.width=starsC.clientWidth;starsC.height=starsC.clientHeight;
  sp=[];
  const n=Math.min(140,Math.floor(starsC.width*starsC.height/9000));
  for(let i=0;i<n;i++)sp.push({x:Math.random()*starsC.width,y:Math.random()*starsC.height,z:Math.random()*0.8+0.2,r:Math.random()*1.6+0.3});
}
function animStars(){
  sctx.clearRect(0,0,starsC.width,starsC.height);
  for(const p of sp){
    p.y+=p.z*0.25;if(p.y>starsC.height){p.y=0;p.x=Math.random()*starsC.width;}
    sctx.globalAlpha=p.z;sctx.fillStyle='#bfe9ff';
    sctx.beginPath();sctx.arc(p.x,p.y,p.r,0,7);sctx.fill();
  }
  sctx.globalAlpha=1;requestAnimationFrame(animStars);
}

/* ============ 初始化 ============ */
window.addEventListener('resize',()=>{resizeStage();generate(false);initStars();});
currentSeedStr=seed.value;currentTheme=theme.value;
updateBadge();updateSeedNote();
resizeStage();generate(true);
initStars();animStars();
renderGallery();
