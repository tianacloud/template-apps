document.head.insertAdjacentHTML("beforeend", "<style>\n*{box-sizing:border-box}\n[hidden]{display:none!important}\n:root{\n  --bg:#f5f6f8; --surface:#fff; --surface-2:#fafbfc;\n  --border:#e5e7eb; --border-strong:#d5dae1;\n  --text:#111418; --text-2:#4b5563; --muted:#8b939e;\n  --accent:#1f6feb; --accent-ink:#1550b8; --accent-soft:#eff5ff; --accent-line:#c7dbff;\n  --good:#0f7a58; --good-soft:#e6f6f0; --good-line:#b7e4d3;\n  --warn:#a8640a; --warn-soft:#fdf4e4; --warn-line:#f3dcab;\n  --bad:#bf3529; --bad-soft:#fdecea;\n  --r-lg:16px; --r-md:12px; --r-sm:9px;\n  --shadow-1:0 1px 2px rgba(16,24,40,.05);\n  --shadow-2:0 2px 4px rgba(16,24,40,.04), 0 14px 34px -18px rgba(16,24,40,.22);\n}\nhtml,body{margin:0;padding:0}\nbody{\n  background:var(--bg); color:var(--text);\n  font:15px/1.6 -apple-system,BlinkMacSystemFont,\"Segoe UI\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;\n  -webkit-font-smoothing:antialiased;\n}\nbutton{font:inherit;cursor:pointer;border:none;background:none;color:inherit}\ninput,select{font:inherit;color:inherit}\nh1,h2,h3,p{margin:0}\n.wrap{max-width:1120px;margin:0 auto;padding:0 24px}\n\n/* header */\n.top{background:rgba(255,255,255,.84);backdrop-filter:saturate(180%) blur(12px);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:30}\n.top-inner{display:flex;align-items:center;justify-content:space-between;gap:16px;height:64px}\n.brand{display:flex;align-items:center;gap:11px;min-width:0}\n.mark{width:34px;height:34px;border-radius:10px;background:linear-gradient(150deg,#2f7cf6,#1550b8);display:grid;place-items:center;flex:none;box-shadow:0 2px 6px rgba(31,111,235,.28)}\n.mark svg{width:18px;height:18px}\n.brand h1{font-size:16px;font-weight:600;letter-spacing:.3px;line-height:1.2}\n.brand .sub{font-size:12px;color:var(--muted);line-height:1.3;margin-top:1px}\n.privacy{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--good);background:var(--good-soft);border:1px solid var(--good-line);padding:6px 12px;border-radius:999px;white-space:nowrap}\n.privacy .live{width:6px;height:6px;border-radius:50%;background:var(--good);flex:none;box-shadow:0 0 0 3px rgba(15,122,88,.14)}\n@media(max-width:760px){ .privacy{display:none} .top-inner{height:58px} }\n\n/* hero */\n.hero{padding:30px 0 20px;text-align:center}\n.hero h2{font-size:27px;line-height:1.34;font-weight:600;letter-spacing:-.4px}\n.hero h2 em{font-style:normal;color:var(--accent)}\n.hero p{color:var(--text-2);font-size:14px;margin-top:9px}\n@media(max-width:640px){ .hero h2{font-size:21px} .hero{padding:22px 0 14px} }\n\n/* workspace */\n.workspace{display:grid;grid-template-columns:minmax(0,1fr) 312px;gap:18px;align-items:start}\n@media(max-width:880px){ .workspace{grid-template-columns:1fr} }\n\n.board-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:14px;box-shadow:var(--shadow-1)}\n.board-wrap{display:grid;place-items:center;min-height:180px;border-radius:var(--r-md);padding:8px}\n.board-wrap.transparent{background-image:conic-gradient(#eceef1 0 25%,#fff 0 50%,#eceef1 0 75%,#fff 0);background-size:18px 18px}\n#board{display:block;max-width:100%;max-height:64vh;width:auto;height:auto;border-radius:2px;touch-action:none;cursor:default}\n#board.draggable{cursor:grab}\n#board.dragging{cursor:grabbing}\n.board-bar{display:flex;align-items:center;gap:10px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);flex-wrap:wrap}\n.board-bar .info{font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums}\n.board-bar .info b{color:var(--text);font-weight:500}\n.board-bar .grow{flex:1}\n.board-bar .tip{font-size:12px;color:var(--muted)}\n@media(max-width:620px){ .board-bar .tip{display:none} .board-bar .info{flex:1} }\n\n/* buttons */\n.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 16px;border-radius:9px;font-size:13.5px;font-weight:500;border:1px solid transparent;transition:.15s;white-space:nowrap}\n.btn svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}\n.btn-primary{background:var(--accent);color:#fff;box-shadow:0 1px 2px rgba(31,111,235,.3)}\n.btn-primary:hover{background:var(--accent-ink)}\n.btn-ghost{background:var(--surface);color:var(--text-2);border-color:var(--border-strong)}\n.btn-ghost:hover{background:var(--surface-2);color:var(--text)}\n.btn:disabled{opacity:.45;cursor:not-allowed}\n\n/* side panel */\n.side{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px 16px 18px;box-shadow:var(--shadow-1)}\n.side h3{font-size:12px;font-weight:600;color:var(--text-2);letter-spacing:.4px;margin:0 0 9px}\n.grp{margin-bottom:16px}\n.grp:last-child{margin-bottom:0}\n.layouts{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}\n.layouts button{padding:8px 4px;border-radius:8px;border:1px solid var(--border);background:var(--surface-2);font-size:11.5px;color:var(--text-2);line-height:1.25;transition:.15s}\n.layouts button:hover{border-color:var(--accent-line);color:var(--accent-ink)}\n.layouts button[aria-pressed=true]{background:var(--accent-soft);border-color:var(--accent);color:var(--accent-ink);font-weight:500}\n.slider-row{display:flex;align-items:center;gap:10px}\ninput[type=range]{-webkit-appearance:none;appearance:none;flex:1;height:4px;border-radius:2px;background:var(--border);outline:none}\ninput[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:var(--accent);border:2.5px solid #fff;box-shadow:0 1px 3px rgba(16,24,40,.3);cursor:grab}\ninput[type=range]::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:var(--accent);border:2.5px solid #fff;box-shadow:0 1px 3px rgba(16,24,40,.3);cursor:grab}\n.val{font:500 12.5px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--text-2);min-width:38px;text-align:right}\n.seg{display:inline-flex;background:var(--surface-2);border:1px solid var(--border);border-radius:9px;padding:3px;gap:2px;width:100%}\n.seg button{flex:1;padding:6px 8px;border-radius:6px;font-size:12.5px;color:var(--text-2);transition:.15s;white-space:nowrap}\n.seg button[aria-pressed=true]{background:var(--surface);color:var(--accent-ink);box-shadow:var(--shadow-1);font-weight:500}\nselect{appearance:none;width:100%;background:var(--surface) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' fill='none' stroke='%238b939e' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\") no-repeat right 11px center;border:1px solid var(--border-strong);border-radius:9px;padding:7px 30px 7px 11px;font-size:13px}\nselect:focus-visible,input:focus-visible,button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n.swatches{display:flex;gap:7px;align-items:center}\n.sw{width:28px;height:28px;border-radius:8px;border:1px solid var(--border-strong);position:relative;transition:.15s}\n.sw:hover{transform:translateY(-1px)}\n.sw[aria-pressed=true]{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft)}\n.sw[data-bg=transparent]{background-image:conic-gradient(#d9dde3 0 25%,#fff 0 50%,#d9dde3 0 75%,#fff 0);background-size:10px 10px}\n.sw.custom{overflow:hidden;display:grid;place-items:center;background:var(--surface-2)}\n.sw.custom input{width:40px;height:40px;border:none;padding:0;background:none;cursor:pointer;opacity:0;position:absolute;inset:0}\n.sw.custom svg{width:13px;height:13px;stroke:var(--text-2);fill:none;stroke-width:2;pointer-events:none}\n.hintline{font-size:11.5px;color:var(--muted);line-height:1.5;margin-top:9px}\n.side-actions{display:flex;gap:8px;margin-top:4px}\n.side-actions .btn{flex:1}\n\n/* slots */\n.slots-card{margin-top:18px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:14px 16px;box-shadow:var(--shadow-1)}\n.slots-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:11px}\n.slots-head .t{font-size:12px;font-weight:600;color:var(--text-2);letter-spacing:.4px}\n.slots-head .sub{font-size:11.5px;color:var(--muted);font-weight:400;letter-spacing:0;margin-left:8px}\n.slots-head .link{font-size:12px;color:var(--accent);text-decoration:none}\n.slots-head .link:hover{text-decoration:underline}\n.slots{display:flex;flex-wrap:wrap;gap:9px}\n.slot{width:76px;position:relative;cursor:pointer}\n.slot .sq{width:76px;height:76px;border-radius:10px;border:1.5px dashed var(--border-strong);background:var(--surface-2);display:grid;place-items:center;overflow:hidden;position:relative;transition:.15s}\n.slot:hover .sq{border-color:var(--accent);background:var(--accent-soft)}\n.slot.filled .sq{border-style:solid;border-color:var(--border)}\n.slot.filled:hover .sq{border-color:var(--accent)}\n.slot.sel .sq{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}\n.slot .sq img{width:100%;height:100%;object-fit:cover;display:block}\n.slot .plus{width:16px;height:16px;stroke:var(--muted);stroke-width:2;fill:none;stroke-linecap:round}\n.slot .idx{position:absolute;left:4px;top:4px;font:500 9.5px/1 ui-monospace,monospace;background:rgba(10,12,16,.55);color:#fff;padding:2.5px 4.5px;border-radius:4px;pointer-events:none}\n.slot .rm{position:absolute;right:-6px;top:-6px;width:19px;height:19px;border-radius:50%;background:#fff;border:1px solid var(--border-strong);display:none;place-items:center;box-shadow:var(--shadow-1);z-index:2}\n.slot:hover .rm{display:grid}\n.slot .rm svg{width:9px;height:9px;stroke:var(--text-2);stroke-width:2.4;fill:none;stroke-linecap:round}\n.slot .nm{font-size:10.5px;color:var(--muted);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center}\n@media(max-width:520px){ .slot,.slot .sq{width:64px} .slot .sq{height:64px} }\n\n/* how */\n.how{margin:24px 0 0;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden}\n.how>summary{padding:14px 18px;font-size:13.5px;font-weight:500;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;color:var(--text-2)}\n.how>summary::-webkit-details-marker{display:none}\n.how>summary:hover{background:var(--surface-2)}\n.how>summary::after{content:\"展开\";font-size:12px;font-weight:400;color:var(--muted)}\n.how[open]>summary::after{content:\"收起\"}\n.how-body{padding:0 18px 20px;border-top:1px solid var(--border)}\n.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px}\n.step{background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-sm);padding:14px}\n.step .n{width:20px;height:20px;border-radius:6px;background:var(--accent-soft);color:var(--accent-ink);font:500 11px/20px -apple-system,sans-serif;text-align:center;margin-bottom:8px;border:1px solid var(--accent-line)}\n.step h4{font-size:13px;font-weight:500;margin:0 0 4px}\n.step p{font-size:12.5px;color:var(--text-2);line-height:1.55}\n.faq{margin-top:20px;border-top:1px solid var(--border);padding-top:16px}\n.faq dt{font-size:13px;font-weight:500;margin-top:12px}\n.faq dt:first-child{margin-top:0}\n.faq dd{margin:3px 0 0;font-size:12.5px;color:var(--text-2);line-height:1.6}\n@media(max-width:700px){ .steps{grid-template-columns:1fr} }\n\n/* footer + toast */\n.foot{padding:26px 0 44px;text-align:center;font-size:12px;color:var(--muted)}\n.foot .dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--good);margin-right:6px;vertical-align:middle}\n.toast{position:fixed;left:50%;bottom:34px;transform:translate(-50%,16px);background:#111418;color:#fff;font-size:13px;padding:10px 18px;border-radius:10px;box-shadow:0 10px 30px -10px rgba(0,0,0,.5);opacity:0;pointer-events:none;transition:.22s;z-index:200;max-width:80vw;text-align:center}\n.toast.show{opacity:1;transform:translate(-50%,0)}\n.dropcover{position:fixed;inset:0;z-index:150;background:rgba(31,111,235,.08);backdrop-filter:blur(2px);display:grid;place-items:center;pointer-events:none;opacity:0;transition:.15s}\n.dropcover.show{opacity:1}\n.dropcover .box{border:2px dashed var(--accent);border-radius:18px;background:rgba(255,255,255,.94);padding:26px 34px;font-size:15px;font-weight:500;color:var(--accent-ink);box-shadow:var(--shadow-2)}\n</style>");
document.body.innerHTML = "\n\n<header class=\"top\">\n  <div class=\"wrap top-inner\">\n    <div class=\"brand\">\n      <span class=\"mark\">\n        <svg viewBox=\"0 0 24 24\" fill=\"none\">\n          <rect x=\"4\" y=\"4\" width=\"7\" height=\"7\" rx=\"1.6\" fill=\"#fff\"/>\n          <rect x=\"13\" y=\"4\" width=\"7\" height=\"7\" rx=\"1.6\" fill=\"#fff\" opacity=\".55\"/>\n          <rect x=\"4\" y=\"13\" width=\"7\" height=\"7\" rx=\"1.6\" fill=\"#fff\" opacity=\".55\"/>\n          <rect x=\"13\" y=\"13\" width=\"7\" height=\"7\" rx=\"1.6\" fill=\"#fff\"/>\n        </svg>\n      </span>\n      <div>\n        <h1>九格</h1>\n        <div class=\"sub\">图片拼接 · 九宫格</div>\n      </div>\n    </div>\n    <div class=\"privacy\"><span class=\"live\"></span>全程在浏览器内合成，图片不会上传</div>\n  </div>\n</header>\n\n<main class=\"wrap\">\n  <section class=\"hero\">\n    <h2>多张图，<em>拼成一张</em></h2>\n    <p>九宫格、四宫格、长图拼接，拖进来就自动排好。</p>\n  </section>\n\n  <div class=\"workspace\">\n    <section class=\"board-card\">\n      <div class=\"board-wrap\" id=\"boardWrap\">\n        <canvas id=\"board\" aria-label=\"拼接预览画布\"></canvas>\n      </div>\n      <div class=\"board-bar\">\n        <span class=\"info\" id=\"info\">1440 × 1440</span>\n        <span class=\"grow\"></span>\n        <span class=\"tip\" id=\"tip\">空白格点一下就能选图</span>\n        <button class=\"btn btn-primary\" id=\"exportBtn\">\n          <svg viewBox=\"0 0 24 24\"><path d=\"M12 4v11\"/><path d=\"M7 11l5 5 5-5\"/><path d=\"M4 19h16\"/></svg>\n          导出图片\n        </button>\n      </div>\n    </section>\n\n    <aside class=\"side\">\n      <div class=\"grp\">\n        <h3>布局</h3>\n        <div class=\"layouts\" id=\"layouts\" role=\"group\" aria-label=\"拼接布局\"></div>\n      </div>\n\n      <div class=\"grp\">\n        <h3>间距 · <span class=\"val\" id=\"gapVal\" style=\"display:inline\">16</span> px</h3>\n        <div class=\"slider-row\">\n          <input type=\"range\" id=\"gap\" min=\"0\" max=\"60\" step=\"1\" value=\"16\" aria-label=\"格子间距\">\n        </div>\n      </div>\n\n      <div class=\"grp\">\n        <h3>圆角 · <span class=\"val\" id=\"radiusVal\" style=\"display:inline\">20</span> px</h3>\n        <div class=\"slider-row\">\n          <input type=\"range\" id=\"radius\" min=\"0\" max=\"72\" step=\"1\" value=\"20\" aria-label=\"圆角半径\">\n        </div>\n      </div>\n\n      <div class=\"grp\">\n        <h3>背景</h3>\n        <div class=\"swatches\" id=\"swatches\">\n          <button class=\"sw\" data-bg=\"#ffffff\" style=\"background:#ffffff\" aria-pressed=\"true\" aria-label=\"白色背景\"></button>\n          <button class=\"sw\" data-bg=\"#f2f3f5\" style=\"background:#f2f3f5\" aria-pressed=\"false\" aria-label=\"浅灰背景\"></button>\n          <button class=\"sw\" data-bg=\"#0f1115\" style=\"background:#0f1115\" aria-pressed=\"false\" aria-label=\"黑色背景\"></button>\n          <button class=\"sw\" data-bg=\"transparent\" aria-pressed=\"false\" aria-label=\"透明背景\"></button>\n          <span class=\"sw custom\" aria-label=\"自定义颜色\">\n            <svg viewBox=\"0 0 24 24\"><path d=\"M12 5v14M5 12h14\"/></svg>\n            <input type=\"color\" id=\"bgColor\" value=\"#ffd9e0\" aria-label=\"自定义背景色\">\n          </span>\n        </div>\n      </div>\n\n      <div class=\"grp\">\n        <h3>图片填充</h3>\n        <div class=\"seg\" id=\"fitSeg\" role=\"group\" aria-label=\"图片填充方式\">\n          <button data-fit=\"cover\" aria-pressed=\"true\">填满裁剪</button>\n          <button data-fit=\"contain\" aria-pressed=\"false\">完整留白</button>\n        </div>\n      </div>\n\n      <div class=\"grp\">\n        <h3>输出尺寸</h3>\n        <select id=\"size\">\n          <option value=\"1080\">1080 px（朋友圈够用）</option>\n          <option value=\"1440\" selected>1440 px（推荐）</option>\n          <option value=\"2048\">2048 px（高清）</option>\n        </select>\n      </div>\n\n      <div class=\"grp\">\n        <h3>导出格式</h3>\n        <div class=\"seg\" id=\"fmtSeg\" role=\"group\" aria-label=\"导出格式\">\n          <button data-fmt=\"png\" aria-pressed=\"true\">PNG</button>\n          <button data-fmt=\"jpg\" aria-pressed=\"false\">JPG</button>\n        </div>\n        <p class=\"hintline\">在预览上拖动可以调整单张图的位置，滚轮缩放，双击复位。</p>\n      </div>\n\n      <div class=\"side-actions\">\n        <button class=\"btn btn-ghost\" id=\"pickBtn\">选择图片</button>\n        <button class=\"btn btn-ghost\" id=\"clearBtn\">清空</button>\n      </div>\n    </aside>\n  </div>\n\n  <section class=\"slots-card\">\n    <div class=\"slots-head\">\n      <div>\n        <span class=\"t\">图片素材</span>\n        <span class=\"sub\" id=\"slotsSub\">已放入 0 / 9</span>\n      </div>\n      <a href=\"#\" class=\"link\" id=\"swapHint\">点击两张图可交换位置</a>\n    </div>\n    <div class=\"slots\" id=\"slots\"></div>\n  </section>\n\n  <details class=\"how\">\n    <summary>怎么用 · 三步搞定</summary>\n    <div class=\"how-body\">\n      <div class=\"steps\">\n        <div class=\"step\">\n          <div class=\"n\">1</div>\n          <h4>放入图片</h4>\n          <p>拖入、点「选择图片」，或直接把图片粘贴进来。多张图会按顺序自动填满格子。</p>\n        </div>\n        <div class=\"step\">\n          <div class=\"n\">2</div>\n          <h4>调排版</h4>\n          <p>换布局、拉间距和圆角、挑背景色。在画布上拖动能微调每张图的取景，滚轮缩放。</p>\n        </div>\n        <div class=\"step\">\n          <div class=\"n\">3</div>\n          <h4>导出</h4>\n          <p>选尺寸和格式，一键导出。需要透明底选 PNG，需要直接发聊天工具选 JPG。</p>\n        </div>\n      </div>\n      <dl class=\"faq\">\n        <dt>九宫格发到朋友圈会被裁切吗？</dt>\n        <dd>这张工具产出的是完整的一张图，不是九张分开的图。如果你的目标是一张方图，直接发即可；如果想要「九张分别发」的效果，那是另一个用法，本工具输出的是拼好的整图。</dd>\n        <dt>为什么有的格子边上有白边？</dt>\n        <dd>因为「图片填充」选的是「完整留白」，工具会保证原图不被裁切，长宽比不同时留出背景色。想要满格无白边，切到「填满裁剪」。</dd>\n        <dt>拖动调整位置是怎么生效的？</dt>\n        <dd>每张图的偏移和缩放是独立记录的，切换布局、调整间距都不会丢失。双击某一格可以把它复位。</dd>\n        <dt>导出的图有多大？</dt>\n        <dd>取决于输出尺寸和格式。1440 px 的九宫格 PNG 通常在一到三兆之间，JPG 会明显更小。导出完成会提示实际体积。</dd>\n      </dl>\n    </div>\n  </details>\n\n  <div class=\"foot\">\n    <span class=\"dot\"></span>零上传 · 零注册 · 关闭页面即清除，不留副本\n  </div>\n</main>\n\n<div class=\"toast\" id=\"toast\"></div>\n<div class=\"dropcover\" id=\"dropcover\"><div class=\"box\">松开，把图片放进格子</div></div>\n<input type=\"file\" id=\"file\" accept=\"image/*\" multiple hidden>\n\n";

(function(){
  "use strict";

  var MAX_EDGE = 4096;

  var LAYOUTS = [
    { id: "3x3", label: "九宫格", cols: 3, rows: 3 },
    { id: "2x2", label: "四宫格", cols: 2, rows: 2 },
    { id: "2x3", label: "六宫格竖", cols: 2, rows: 3 },
    { id: "3x2", label: "六宫格横", cols: 3, rows: 2 },
    { id: "2x1", label: "左右拼接", cols: 2, rows: 1 },
    { id: "1x2", label: "上下拼接", cols: 1, rows: 2 }
  ];

  var state = {
    layoutId: "3x3",
    size: 1440,
    gap: 16,
    radius: 20,
    bg: "#ffffff",
    fit: "cover",
    fmt: "png"
  };

  var slots = [];
  var parked = [];
  var geom = [];
  var selected = -1;
  var pendingTarget = null;

  var canvas = document.getElementById("board");
  var ctx = canvas.getContext("2d");
  var boardWrap = document.getElementById("boardWrap");
  var infoEl = document.getElementById("info");
  var tipEl = document.getElementById("tip");
  var toastEl = document.getElementById("toast");
  var slotsEl = document.getElementById("slots");
  var slotsSub = document.getElementById("slotsSub");
  var fileInput = document.getElementById("file");

  function layout(){
    for (var i = 0; i < LAYOUTS.length; i++) if (LAYOUTS[i].id === state.layoutId) return LAYOUTS[i];
    return LAYOUTS[0];
  }
  function slotCount(){ var L = layout(); return L.cols * L.rows; }

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove("show"); }, 2200);
  }

  var TIP_DEFAULT = "空白格点一下就能选图";
  var tipTimer = null;
  function setTip(msg){
    tipEl.textContent = msg;
    clearTimeout(tipTimer);
    tipTimer = setTimeout(function(){ tipEl.textContent = TIP_DEFAULT; }, 3000);
  }

  /* ---------- decode ---------- */
  function decodeViaImg(file){
    return new Promise(function(resolve, reject){
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function(){
        URL.revokeObjectURL(url);
        var c = document.createElement("canvas");
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext("2d").drawImage(img, 0, 0);
        resolve(c);
      };
      img.onerror = function(){
        URL.revokeObjectURL(url);
        reject(new Error("这张图片无法解码，可能是 HEIC 等浏览器不支持的格式"));
      };
      img.src = url;
    });
  }
  function decode(file){
    if (window.createImageBitmap) {
      return createImageBitmap(file, { imageOrientation: "from-image" })
        .catch(function(){ return createImageBitmap(file); })
        .catch(function(){ return decodeViaImg(file); });
    }
    return decodeViaImg(file);
  }

  /* ---------- canvas geometry ---------- */
  function canvasSize(){
    var L = layout();
    var W = state.size;
    var H = Math.round(state.size * L.rows / L.cols);
    var mx = Math.max(W, H);
    if (mx > MAX_EDGE) {
      var k = MAX_EDGE / mx;
      W = Math.round(W * k);
      H = Math.round(H * k);
    }
    return { W: W, H: H };
  }

  function roundedPath(c, x, y, w, h, r){
    r = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y); c.arcTo(x + w, y, x + w, y + r, r);
    c.lineTo(x + w, y + h - r); c.arcTo(x + w, y + h, x + w - r, y + h, r);
    c.lineTo(x + r, y + h); c.arcTo(x, y + h, x, y + h - r, r);
    c.lineTo(x, y + r); c.arcTo(x, y, x + r, y, r);
    c.closePath();
  }

  var rafPending = false;
  function scheduleDraw(){
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function(){
      rafPending = false;
      draw();
    });
  }

  function draw(forceWhiteBg, exporting){
    var L = layout();
    var sz = canvasSize();
    var W = sz.W, H = sz.H;
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;

    ctx.clearRect(0, 0, W, H);

    var bg = forceWhiteBg ? "#ffffff" : state.bg;
    if (bg !== "transparent") {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
    }

    var gap = state.gap;
    var pad = gap;
    var cw = (W - pad * 2 - gap * (L.cols - 1)) / L.cols;
    var ch = (H - pad * 2 - gap * (L.rows - 1)) / L.rows;
    var r = Math.min(state.radius, Math.min(cw, ch) / 2);

    geom = [];
    for (var i = 0; i < L.cols * L.rows; i++) {
      var row = Math.floor(i / L.cols);
      var col = i % L.cols;
      var x = pad + col * (cw + gap);
      var y = pad + row * (ch + gap);
      geom.push({ x: x, y: y, w: cw, h: ch });
      drawCell(slots[i], x, y, cw, ch, r, exporting);
    }
  }

  function drawCell(slot, x, y, w, h, r, exporting){
    if (!slot || !slot.img) {
      if (exporting) return;
      ctx.save();
      roundedPath(ctx, x, y, w, h, r);
      ctx.fillStyle = "rgba(128,138,150,.10)";
      ctx.fill();
      ctx.setLineDash([Math.max(4, w * 0.035), Math.max(4, w * 0.035)]);
      ctx.lineWidth = Math.max(1, w * 0.008);
      ctx.strokeStyle = "rgba(120,132,146,.42)";
      ctx.stroke();
      ctx.setLineDash([]);
      var s = Math.min(w, h) * 0.09;
      var cx = x + w / 2, cy = y + h / 2;
      ctx.beginPath();
      ctx.moveTo(cx - s, cy); ctx.lineTo(cx + s, cy);
      ctx.moveTo(cx, cy - s); ctx.lineTo(cx, cy + s);
      ctx.strokeStyle = "rgba(120,132,146,.5)";
      ctx.lineWidth = Math.max(1.2, w * 0.011);
      ctx.stroke();
      ctx.restore();
      return;
    }

    var img = slot.img;
    var iw = img.width, ih = img.height;
    var base = (state.fit === "contain")
      ? Math.min(w / iw, h / ih)
      : Math.max(w / iw, h / ih);
    var sc = base * (slot.zoom || 1);
    var dw = iw * sc, dh = ih * sc;
    var dx = x + (w - dw) / 2 + (slot.ox || 0);
    var dy = y + (h - dh) / 2 + (slot.oy || 0);

    ctx.save();
    roundedPath(ctx, x, y, w, h, r);
    ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  /* ---------- slots ---------- */
  function buildLayoutButtons(){
    var host = document.getElementById("layouts");
    host.innerHTML = "";
    LAYOUTS.forEach(function(L){
      var b = document.createElement("button");
      b.type = "button";
      b.dataset.layout = L.id;
      b.textContent = L.label;
      b.setAttribute("aria-pressed", String(L.id === state.layoutId));
      host.appendChild(b);
    });
  }

  function updateSlotsSub(){
    var filled = slots.filter(Boolean).length;
    slotsSub.textContent = "已放入 " + filled + " / " + slots.length +
      (parked.length ? " · 备用 " + parked.length + " 张" : "");
    updateInfo();
  }

  function buildSlots(){
    slotsEl.innerHTML = "";
    for (var i = 0; i < slots.length; i++) {
      slotsEl.appendChild(makeSlotEl(i));
    }
    updateSlotsSub();
  }

  function makeSlotEl(i){
    var s = slots[i];
    var el = document.createElement("div");
    el.className = "slot" + (s ? " filled" : "") + (i === selected ? " sel" : "");
    el.dataset.i = String(i);

    var sq = document.createElement("div");
    sq.className = "sq";
    if (s) {
      var img = document.createElement("img");
      img.src = s.url;
      img.alt = "";
      sq.appendChild(img);
      var idx = document.createElement("span");
      idx.className = "idx";
      idx.textContent = String(i + 1);
      sq.appendChild(idx);
    } else {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("class", "plus");
      var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", "M12 5v14M5 12h14");
      svg.appendChild(p);
      sq.appendChild(svg);
    }
    el.appendChild(sq);

    if (s) {
      var rm = document.createElement("button");
      rm.className = "rm";
      rm.setAttribute("aria-label", "移除第 " + (i + 1) + " 张");
      rm.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      rm.addEventListener("click", function(e){
        e.stopPropagation();
        clearSlot(i);
      });
      el.appendChild(rm);
    }

    var nm = document.createElement("div");
    nm.className = "nm";
    nm.textContent = s ? (s.name || "图片") : "空位 " + (i + 1);
    el.appendChild(nm);

    el.addEventListener("click", function(){ onSlotClick(i); });
    return el;
  }

  function refreshSlotEl(i){
    var old = slotsEl.querySelector('.slot[data-i="' + i + '"]');
    if (!old) return;
    var next = makeSlotEl(i);
    slotsEl.replaceChild(next, old);
  }

  function onSlotClick(i){
    if (!slots[i]) {
      if (selected !== -1 && slots[selected]) {
        swapSlots(selected, i);
        selected = -1;
        return;
      }
      pendingTarget = i;
      fileInput.click();
      return;
    }
    if (selected === -1) {
      selected = i;
      refreshSlotEl(i);
      setTip("已选中第 " + (i + 1) + " 格，再点另一张可交换");
      return;
    }
    if (selected === i) {
      selected = -1;
      refreshSlotEl(i);
      tipEl.textContent = TIP_DEFAULT;
      return;
    }
    swapSlots(selected, i);
    selected = -1;
  }

  function swapSlots(a, b){
    var t = slots[a];
    slots[a] = slots[b];
    slots[b] = t;
    refreshSlotEl(a);
    refreshSlotEl(b);
    draw();
    setTip("已交换第 " + (a + 1) + " 格与第 " + (b + 1) + " 格");
  }

  function clearSlot(i){
    dispose(slots[i]);
    slots[i] = null;
    if (selected === i) selected = -1;
    refreshSlotEl(i);
    draw();
    updateSlotsSub();
  }

  function setLayout(id){
    if (id === state.layoutId) return;
    state.layoutId = id;
    var n = slotCount();

    // 收起来的图片不删除，放进备用队列，切回大布局时按顺序取回
    if (slots.length > n) {
      for (var j = n; j < slots.length; j++) {
        if (slots[j]) parked.push(slots[j]);
      }
    }

    var next = new Array(n);
    for (var i = 0; i < n; i++) next[i] = slots[i] || null;
    for (var k = 0; k < n; k++) {
      if (!next[k] && parked.length) next[k] = parked.shift();
    }

    slots = next;
    selected = -1;
    Array.prototype.forEach.call(document.querySelectorAll("#layouts button"), function(b){
      b.setAttribute("aria-pressed", String(b.dataset.layout === id));
    });
    buildSlots();
    draw();
    updateInfo();
  }

  /* ---------- image loading ---------- */
  function makeSlot(file){
    return decode(file).then(function(img){
      return {
        img: img,
        url: URL.createObjectURL(file),
        name: file.name || "粘贴图片",
        zoom: 1,
        ox: 0,
        oy: 0
      };
    });
  }

  function addFiles(fileList){
    var arr = Array.prototype.slice.call(fileList).filter(function(f){
      if (!f) return false;
      if (/^image\//.test(f.type || "")) return true;
      return /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(f.name || "");
    });
    if (!arr.length) return;

    var maxTotal = 9;
    var current = slots.filter(Boolean).length + parked.length;
    var capacity = maxTotal - current;
    if (capacity <= 0) {
      toast("最多放 9 张，先移除几张再添加");
      return;
    }
    if (arr.length > capacity) {
      toast("最多放 9 张，多出的 " + (arr.length - capacity) + " 张没有放入");
      arr = arr.slice(0, capacity);
    }

    var empties = [];
    for (var i = 0; i < slots.length; i++) if (!slots[i]) empties.push(i);

    arr.forEach(function(file, k){
      var idx = k < empties.length ? empties[k] : -1;
      makeSlot(file).then(function(slot){
        if (idx >= 0 && !slots[idx]) {
          slots[idx] = slot;
          refreshSlotEl(idx);
          draw();
          updateSlotsSub();
        } else {
          parked.push(slot);
          updateSlotsSub();
          toast("格子放不下了，这张先存放在备用区，切换到更大的布局会自动用上");
        }
      }).catch(function(err){
        toast(err.message || "有一张图片读取失败");
      });
    });
  }

  function fillTarget(index, file){
    makeSlot(file).then(function(slot){
      dispose(slots[index]);
      slots[index] = slot;
      refreshSlotEl(index);
      draw();
      updateSlotsSub();
    }).catch(function(err){
      toast(err.message || "图片读取失败");
    });
  }

  /* ---------- pointer: pan & zoom ---------- */
  var drag = null;

  function toCanvas(e){
    var r = canvas.getBoundingClientRect();
    var kx = canvas.width / r.width;
    var ky = canvas.height / r.height;
    return { x: (e.clientX - r.left) * kx, y: (e.clientY - r.top) * ky, kx: kx, ky: ky };
  }
  function hitTest(x, y){
    for (var i = 0; i < geom.length; i++) {
      var g = geom[i];
      if (x >= g.x && x <= g.x + g.w && y >= g.y && y <= g.y + g.h) return i;
    }
    return -1;
  }

  canvas.addEventListener("pointerdown", function(e){
    var p = toCanvas(e);
    var i = hitTest(p.x, p.y);
    if (i < 0 || !slots[i]) return;
    drag = { i: i, sx: p.x, sy: p.y, ox: slots[i].ox || 0, oy: slots[i].oy || 0, kx: p.kx, ky: p.ky, baseW: canvas.width };
    canvas.classList.add("dragging");
    if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (err) {} }
    e.preventDefault();
  });

  canvas.addEventListener("pointermove", function(e){
    if (!drag) return;
    var p = toCanvas(e);
    var s = slots[drag.i];
    if (!s) { drag = null; return; }
    s.ox = drag.ox + (p.x - drag.sx);
    s.oy = drag.oy + (p.y - drag.sy);
    scheduleDraw();
  });

  function endDrag(){
    if (!drag) return;
    drag = null;
    canvas.classList.remove("dragging");
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("pointerleave", endDrag);

  canvas.addEventListener("wheel", function(e){
    var p = toCanvas(e);
    var i = hitTest(p.x, p.y);
    if (i < 0 || !slots[i]) return;
    e.preventDefault();
    var s = slots[i];
    var f = e.deltaY < 0 ? 1.08 : 1 / 1.08;
    s.zoom = Math.max(0.5, Math.min(3, (s.zoom || 1) * f));
    scheduleDraw();
  }, { passive: false });

  canvas.addEventListener("dblclick", function(e){
    var p = toCanvas(e);
    var i = hitTest(p.x, p.y);
    if (i < 0 || !slots[i]) return;
    slots[i].zoom = 1;
    slots[i].ox = 0;
    slots[i].oy = 0;
    scheduleDraw();
    toast("第 " + (i + 1) + " 格已复位");
  });

  canvas.addEventListener("pointermove", function(e){
    if (drag) return;
    var p = toCanvas(e);
    var i = hitTest(p.x, p.y);
    canvas.classList.toggle("draggable", i >= 0 && !!slots[i]);
  });

  /* ---------- export ---------- */
  function updateInfo(){
    var sz = canvasSize();
    var filled = slots.filter(Boolean).length;
    infoEl.innerHTML = "<b>" + sz.W + " × " + sz.H + "</b> · " + state.fmt.toUpperCase() +
      " · 已放入 " + filled + "/" + slots.length;
  }

  function exportImage(){
    var filled = slots.filter(Boolean).length;
    if (!filled) { toast("还没有放入图片"); return; }
    var sz = canvasSize();
    var mime = state.fmt === "jpg" ? "image/jpeg" : "image/png";
    draw(state.fmt === "jpg" && state.bg === "transparent", true);
    canvas.toBlob(function(blob){
      draw();
      if (!blob) { toast("导出失败，请换一种格式再试"); return; }
      var name = "九格-" + sz.W + "x" + sz.H + "." + (state.fmt === "jpg" ? "jpg" : "png");
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 6000);
      toast("已导出 " + name + " · " + fmtBytes(blob.size));
    }, mime, 0.95);
  }

  function fmtBytes(n){
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(0) + " KB";
    return (n / 1024 / 1024).toFixed(1) + " MB";
  }

  /* ---------- events ---------- */
  document.getElementById("swapHint").addEventListener("click", function(e){
    e.preventDefault();
  });

  document.getElementById("layouts").addEventListener("click", function(e){
    var b = e.target.closest("button[data-layout]");
    if (b) setLayout(b.dataset.layout);
  });

  document.getElementById("gap").addEventListener("input", function(){
    state.gap = Number(this.value);
    document.getElementById("gapVal").textContent = String(state.gap);
    scheduleDraw();
  });
  document.getElementById("radius").addEventListener("input", function(){
    state.radius = Number(this.value);
    document.getElementById("radiusVal").textContent = String(state.radius);
    scheduleDraw();
  });

  document.getElementById("swatches").addEventListener("click", function(e){
    var b = e.target.closest(".sw[data-bg]");
    if (!b) return;
    state.bg = b.dataset.bg;
    markSwatch(b.dataset.bg);
    scheduleDraw();
    boardWrap.classList.toggle("transparent", state.bg === "transparent");
  });
  function markSwatch(bg){
    Array.prototype.forEach.call(document.querySelectorAll(".sw[data-bg]"), function(x){
      x.setAttribute("aria-pressed", String(x.dataset.bg === bg));
    });
  }
  document.getElementById("bgColor").addEventListener("input", function(){
    state.bg = this.value;
    markSwatch("");
    scheduleDraw();
    boardWrap.classList.remove("transparent");
  });

  document.getElementById("fitSeg").addEventListener("click", function(e){
    var b = e.target.closest("button[data-fit]");
    if (!b) return;
    state.fit = b.dataset.fit;
    Array.prototype.forEach.call(this.querySelectorAll("button"), function(x){
      x.setAttribute("aria-pressed", String(x.dataset.fit === state.fit));
    });
    scheduleDraw();
  });

  document.getElementById("fmtSeg").addEventListener("click", function(e){
    var b = e.target.closest("button[data-fmt]");
    if (!b) return;
    state.fmt = b.dataset.fmt;
    Array.prototype.forEach.call(this.querySelectorAll("button"), function(x){
      x.setAttribute("aria-pressed", String(x.dataset.fmt === state.fmt));
    });
    updateInfo();
  });

  document.getElementById("size").addEventListener("change", function(){
    state.size = Number(this.value);
    draw();
    updateInfo();
  });

  document.getElementById("pickBtn").addEventListener("click", function(){
    pendingTarget = null;
    fileInput.click();
  });
  document.getElementById("exportBtn").addEventListener("click", exportImage);
  document.getElementById("clearBtn").addEventListener("click", function(){
    for (var i = 0; i < slots.length; i++) {
      if (slots[i]) dispose(slots[i]);
      slots[i] = null;
    }
    while (parked.length) dispose(parked.pop());
    selected = -1;
    buildSlots();
    draw();
    toast("已清空");
  });

  function dispose(slot){
    if (!slot) return;
    if (slot.url) URL.revokeObjectURL(slot.url);
    if (slot.img && slot.img.close) { try { slot.img.close(); } catch (e) {} }
  }

  fileInput.addEventListener("change", function(){
    var files = fileInput.files;
    if (files && files.length) {
      if (pendingTarget !== null && files.length === 1) fillTarget(pendingTarget, files[0]);
      else addFiles(files);
    }
    pendingTarget = null;
    fileInput.value = "";
  });

  /* drag & drop anywhere */
  var cover = document.getElementById("dropcover");
  var dragDepth = 0;
  window.addEventListener("dragenter", function(e){
    if (!e.dataTransfer || Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") < 0) return;
    dragDepth++;
    cover.classList.add("show");
  });
  window.addEventListener("dragover", function(e){ e.preventDefault(); });
  window.addEventListener("dragleave", function(e){
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) cover.classList.remove("show");
  });
  window.addEventListener("drop", function(e){
    e.preventDefault();
    dragDepth = 0;
    cover.classList.remove("show");
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files);
    }
  });

  window.addEventListener("paste", function(e){
    if (!e.clipboardData) return;
    var files = [];
    Array.prototype.forEach.call(e.clipboardData.items || [], function(it){
      if (it.kind === "file") {
        var f = it.getAsFile();
        if (f) files.push(f);
      }
    });
    if (files.length) { e.preventDefault(); addFiles(files); }
  });

  /* ---------- init ---------- */
  buildLayoutButtons();
  slots = new Array(slotCount()).fill(null);
  buildSlots();
  draw();
  updateInfo();
})();
