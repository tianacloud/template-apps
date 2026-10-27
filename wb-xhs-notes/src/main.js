document.title="爆款笔记工坊";
const style=document.createElement("style");style.textContent="\n:root{\n  --bg:#F6F6F8;\n  --surface:#FFFFFF;\n  --surface-2:#FAFAFB;\n  --border:#E6E6EC;\n  --border-strong:#D6D6DE;\n  --text:#1A1A1E;\n  --muted:#6E6E7A;\n  --faint:#9A9AA6;\n  --accent:#FF2E4D;\n  --accent-2:#FF6B82;\n  --accent-soft:#FFF0F2;\n  --ok:#159A57;\n  --ok-soft:#E9F7EF;\n  --warn:#D98900;\n  --warn-soft:#FFF6E5;\n  --high:#E5484D;\n  --mid:#D98900;\n  --low:#5B6BD6;\n  --radius:14px;\n  --shadow:0 1px 2px rgba(20,20,30,.05),0 6px 20px rgba(20,20,30,.05);\n}\n*{box-sizing:border-box}\nhtml,body{margin:0;padding:0}\nbody{\n  background:var(--bg);\n  color:var(--text);\n  font-family:\"PingFang SC\",\"Microsoft YaHei\",\"Hiragino Sans GB\",\"Source Han Sans SC\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;\n  font-size:15px;\n  line-height:1.65;\n  -webkit-font-smoothing:antialiased;\n}\na{color:var(--accent);text-decoration:none}\nbutton{font-family:inherit}\n\n/* ---------- Header ---------- */\n.hero{\n  background:linear-gradient(135deg,#FFF 0%,#FFF5F6 60%,#FFECEF 100%);\n  border-bottom:1px solid var(--border);\n  padding:34px 24px 26px;\n}\n.hero-in{max-width:1180px;margin:0 auto;display:flex;align-items:flex-start;gap:18px;flex-wrap:wrap}\n.logo{\n  width:52px;height:52px;border-radius:15px;flex:0 0 52px;\n  background:linear-gradient(140deg,var(--accent) 0%,#FF7A4D 100%);\n  color:#fff;display:flex;align-items:center;justify-content:center;\n  font-size:24px;font-weight:800;letter-spacing:-1px;\n  box-shadow:0 6px 18px rgba(255,46,77,.28);\n}\n.hero h1{margin:0 0 6px;font-size:26px;font-weight:800;letter-spacing:-.4px}\n.hero p{margin:0;color:var(--muted);font-size:14px;max-width:640px}\n.hero-tags{margin-top:10px;display:flex;gap:7px;flex-wrap:wrap}\n.htag{\n  font-size:12px;padding:3px 10px;border-radius:20px;\n  background:var(--accent-soft);color:#C21F37;border:1px solid #FFD8DE;\n}\n\n/* ---------- Tabs ---------- */\n.tabwrap{background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:20}\n.tabs{max-width:1180px;margin:0 auto;display:flex;gap:2px;padding:0 24px;overflow-x:auto}\n.tab{\n  appearance:none;background:none;border:none;cursor:pointer;\n  padding:14px 16px 12px;font-size:14.5px;color:var(--muted);\n  border-bottom:2.5px solid transparent;white-space:nowrap;font-weight:500;\n}\n.tab:hover{color:var(--text)}\n.tab.on{color:var(--accent);border-bottom-color:var(--accent);font-weight:700}\n\n/* ---------- Layout ---------- */\n.wrap{max-width:1180px;margin:0 auto;padding:22px 24px 60px}\n.panel{display:none}\n.panel.on{display:block;animation:fade .22s ease}\n@keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}\n\n.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}\n@media(max-width:900px){.grid2{grid-template-columns:1fr}}\n\n.card{\n  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);\n  padding:16px 18px;box-shadow:var(--shadow);\n}\n.card-h{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;flex-wrap:wrap}\n.card-h h2{margin:0;font-size:15.5px;font-weight:700}\n.card-h .sub{font-size:12.5px;color:var(--faint);font-weight:400}\n\nlabel.fl{display:block;font-size:12.5px;color:var(--muted);margin-bottom:5px;font-weight:600}\ntextarea,input[type=text],select{\n  width:100%;border:1px solid var(--border-strong);border-radius:10px;\n  padding:10px 12px;font-size:14px;font-family:inherit;color:var(--text);\n  background:var(--surface);outline:none;transition:border-color .15s,box-shadow .15s;\n}\ntextarea:focus,input[type=text]:focus,select:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(255,46,77,.12)}\ntextarea{min-height:190px;resize:vertical;line-height:1.75}\ntextarea.sm{min-height:120px}\n\n.btn{\n  appearance:none;border:1px solid var(--border-strong);background:var(--surface);\n  color:var(--text);border-radius:9px;padding:8px 14px;font-size:13.5px;\n  cursor:pointer;font-weight:600;transition:.15s;\n}\n.btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}\n.btn:active{transform:scale(.98)}\n.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}\n.btn.primary:hover{background:#E8243F;border-color:#E8243F;color:#fff}\n.btn.ghost{background:transparent}\n.btnrow{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}\n\n/* ---------- 违禁词 ---------- */\n.stats{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}\n.stat{\n  flex:1;min-width:96px;background:var(--surface-2);border:1px solid var(--border);\n  border-radius:11px;padding:9px 12px;\n}\n.stat .n{font-size:21px;font-weight:800;line-height:1.2}\n.stat .l{font-size:11.5px;color:var(--muted);margin-top:1px}\n.stat.danger .n{color:var(--high)}\n.stat.warn .n{color:var(--warn)}\n.stat.info .n{color:var(--low)}\n.stat.safe .n{color:var(--ok)}\n\n.verdict{margin-top:12px;padding:11px 14px;border-radius:11px;font-size:13.5px;font-weight:600;display:flex;gap:9px;align-items:center}\n.verdict.good{background:var(--ok-soft);color:#0E6B3D;border:1px solid #C7EBD8}\n.verdict.bad{background:#FDECEC;color:#B3242A;border:1px solid #F8CFCF}\n.verdict.mid{background:var(--warn-soft);color:#96610A;border:1px solid #F5E0B8}\n\n.preview{\n  background:var(--surface-2);border:1px solid var(--border);border-radius:11px;\n  padding:13px 15px;font-size:14px;line-height:2;min-height:120px;\n  max-height:330px;overflow:auto;white-space:pre-wrap;word-break:break-word;\n}\n.preview.empty{color:var(--faint);line-height:1.7}\nmark{\n  border-radius:4px;padding:1px 3px;margin:0 1px;font-weight:600;\n  background:#FFE1E4;color:#B3242A;box-shadow:inset 0 -1px 0 #F3AEB4;\n}\nmark.l-mid{background:#FFF0D1;color:#8A5A05;box-shadow:inset 0 -1px 0 #EBD095}\nmark.l-low{background:#E6EBFC;color:#3B4AB8;box-shadow:inset 0 -1px 0 #B3BEEC}\n\n.hitlist{margin-top:12px;display:flex;flex-direction:column;gap:7px;max-height:290px;overflow:auto}\n.hit{\n  display:flex;gap:10px;align-items:flex-start;background:var(--surface-2);\n  border:1px solid var(--border);border-left:3px solid var(--high);\n  border-radius:9px;padding:8px 11px;font-size:13px;\n}\n.hit.l-mid{border-left-color:var(--mid)}\n.hit.l-low{border-left-color:var(--low)}\n.hit .w{font-weight:800;flex:0 0 auto;min-width:64px}\n.hit .r{flex:1;color:var(--muted);font-size:12.5px;line-height:1.5}\n.hit .cat{font-size:11px;padding:1px 7px;border-radius:20px;background:#eee;color:#666;flex:0 0 auto;height:19px;line-height:17px}\n.chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}\n.chip{\n  font-size:12px;padding:3px 10px;border-radius:20px;background:var(--surface-2);\n  border:1px solid var(--border);color:var(--muted);cursor:pointer;\n}\n.chip.on{background:var(--accent-soft);border-color:#FFD0D7;color:#C21F37;font-weight:700}\n.hint{font-size:12.5px;color:var(--faint);margin-top:9px;line-height:1.6}\n\n/* ---------- 通用列表 ---------- */\n.itemlist{display:flex;flex-direction:column;gap:9px;margin-top:12px}\n.item{\n  display:flex;gap:11px;align-items:flex-start;background:var(--surface-2);\n  border:1px solid var(--border);border-radius:10px;padding:10px 12px;\n}\n.item .idx{\n  flex:0 0 22px;height:22px;border-radius:7px;background:var(--accent-soft);\n  color:#C21F37;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;\n}\n.item .body{flex:1;min-width:0}\n.item .tt{font-size:14px;font-weight:600;word-break:break-word;line-height:1.55}\n.item .ds{font-size:12.5px;color:var(--muted);margin-top:3px;line-height:1.55}\n.item .act{display:flex;gap:6px;flex:0 0 auto}\n.iconbtn{\n  appearance:none;border:1px solid var(--border);background:var(--surface);\n  border-radius:7px;width:30px;height:30px;cursor:pointer;color:var(--muted);\n  font-size:13px;display:flex;align-items:center;justify-content:center;transition:.15s;\n}\n.iconbtn:hover{border-color:var(--accent);color:var(--accent)}\n.scroll{max-height:340px;overflow:auto;padding-right:4px}\n\n/* ---------- 控件 ---------- */\n.row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}\n.row>div{flex:1;min-width:130px}\n.switches{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px}\n.sw{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted);cursor:pointer;user-select:none}\n.sw input{accent-color:var(--accent);width:15px;height:15px;cursor:pointer}\n\nselect{padding:9px 10px;cursor:pointer;background:var(--surface)}\n\n/* ---------- 封面 ---------- */\n.coverbox{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start}\n.canvaswrap{\n  flex:0 0 auto;\n}\n#cv{\n  width:270px;height:360px;border-radius:12px;border:1px solid var(--border);\n  display:block;box-shadow:var(--shadow);\n}\n.coverctrl{flex:1;min-width:250px}\n.tpls{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}\n.tpl{\n  appearance:none;border:1px solid var(--border-strong);background:var(--surface);\n  border-radius:9px;padding:7px 11px;font-size:12.5px;cursor:pointer;color:var(--muted);font-weight:600;\n}\n.tpl.on{border-color:var(--accent);background:var(--accent-soft);color:#C21F37}\n.swatches{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}\n.sw2{\n  width:30px;height:30px;border-radius:8px;border:2px solid transparent;cursor:pointer;\n  box-shadow:inset 0 0 0 2px #fff;\n}\n.sw2.on{border-color:var(--text)}\n\n/* ---------- Footer ---------- */\n.foot{\n  max-width:1180px;margin:0 auto;padding:0 24px 50px;\n}\n.footcard{\n  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);\n  padding:18px 20px;box-shadow:var(--shadow);\n}\n.footcard h3{margin:0 0 10px;font-size:14.5px}\n.footcard ol{margin:0;padding-left:20px;font-size:13.5px;color:var(--muted);line-height:1.85}\n.footcard b{color:var(--text)}\n.footnote{margin-top:12px;font-size:12px;color:var(--faint);line-height:1.7}\n.toast{\n  position:fixed;left:50%;bottom:34px;transform:translateX(-50%) translateY(14px);\n  background:#1F1F26;color:#fff;padding:9px 18px;border-radius:22px;font-size:13.5px;\n  opacity:0;pointer-events:none;transition:.22s;z-index:99;font-weight:600;\n}\n.toast.on{opacity:1;transform:translateX(-50%) translateY(0)}\n.empty-tip{color:var(--faint);font-size:13px;text-align:center;padding:26px 10px}\n::-webkit-scrollbar{width:9px;height:9px}\n::-webkit-scrollbar-thumb{background:#D8D8E0;border-radius:9px;border:2px solid transparent;background-clip:padding-box}\n::-webkit-scrollbar-thumb:hover{background:#BFBFCB;background-clip:padding-box}\n";document.head.appendChild(style);
document.body.innerHTML="\n\n<header class=\"hero\">\n  <div class=\"hero-in\">\n    <div class=\"logo\">爆</div>\n    <div style=\"flex:1;min-width:260px\">\n      <h1>爆款笔记工坊</h1>\n      <p>专为小红书创作者与矩阵号运营者打造的一站式工具箱。从选题、标题、排版到违禁词自查，全流程提速，所有计算均在你的浏览器本地完成，文案不上传任何服务器。</p>\n      <div class=\"hero-tags\">\n        <span class=\"htag\">违禁词自查</span>\n        <span class=\"htag\">标题生成</span>\n        <span class=\"htag\">排版美化</span>\n        <span class=\"htag\">选题灵感</span>\n        <span class=\"htag\">封面排版</span>\n        <span class=\"htag\">纯本地运行</span>\n      </div>\n    </div>\n  </div>\n</header>\n\n<div class=\"tabwrap\">\n  <nav class=\"tabs\" id=\"tabs\">\n    <button class=\"tab on\" data-p=\"check\">🛡️ 违禁词自查</button>\n    <button class=\"tab\" data-p=\"title\">✍️ 爆款标题生成</button>\n    <button class=\"tab\" data-p=\"format\">🎀 排版美化</button>\n    <button class=\"tab\" data-p=\"idea\">💡 选题灵感</button>\n    <button class=\"tab\" data-p=\"cover\">🖼️ 封面排版</button>\n  </nav>\n</div>\n\n<div class=\"wrap\">\n\n  <!-- ============ 违禁词自查 ============ -->\n  <section class=\"panel on\" id=\"p-check\">\n    <div class=\"grid2\">\n      <div class=\"card\">\n        <div class=\"card-h\"><h2>笔记文案</h2><span class=\"sub\" id=\"ccount\">0 字</span></div>\n        <textarea id=\"ctext\" placeholder=\"把准备发布的笔记正文粘贴进来，系统会实时扫描其中的违禁词、极限词、导流词与风险表述…&#10;&#10;例如：&#10;这款面霜是我用过最好的，三天见效，美白祛斑效果真的绝了！&#10;想买的姐妹加我微信，给你发链接～\"></textarea>\n        <div class=\"btnrow\">\n          <button class=\"btn primary\" id=\"cscan\">立即检测</button>\n          <button class=\"btn\" id=\"cdemo\">载入示例</button>\n          <button class=\"btn\" id=\"cclear\">清空</button>\n        </div>\n        <div class=\"hint\">自定义补充词库（多个词用逗号分隔，会一并纳入检测）：</div>\n        <input type=\"text\" id=\"cextra\" placeholder=\"例：品牌名,竞品名,内部代号\">\n      </div>\n\n      <div class=\"card\">\n        <div class=\"card-h\"><h2>检测结果</h2><span class=\"sub\">词典共 <b id=\"lexn\">0</b> 条</span></div>\n        <div class=\"stats\">\n          <div class=\"stat danger\"><div class=\"n\" id=\"s-high\">0</div><div class=\"l\">高危风险</div></div>\n          <div class=\"stat warn\"><div class=\"n\" id=\"s-mid\">0</div><div class=\"l\">需留意</div></div>\n          <div class=\"stat info\"><div class=\"n\" id=\"s-low\">0</div><div class=\"l\">提示项</div></div>\n          <div class=\"stat safe\"><div class=\"n\" id=\"s-score\">100</div><div class=\"l\">安全评分</div></div>\n        </div>\n        <div class=\"verdict good\" id=\"cverdict\">✅ 暂无风险，可以放心发布</div>\n        <div class=\"hint\" style=\"margin-top:10px\">高亮预览（红色＝高危，橙＝留意，蓝＝提示）：</div>\n        <div class=\"preview empty\" id=\"cpreview\">等待输入文案…</div>\n      </div>\n    </div>\n\n    <div class=\"card\" style=\"margin-top:16px\">\n      <div class=\"card-h\">\n        <h2>命中明细与替换建议</h2>\n        <div class=\"btnrow\" style=\"margin:0\">\n          <button class=\"btn\" id=\"cfix\">一键生成净化版</button>\n        </div>\n      </div>\n      <div class=\"chips\" id=\"cfilters\"></div>\n      <div class=\"hitlist\" id=\"chits\"><div class=\"empty-tip\">暂无命中词条</div></div>\n    </div>\n\n    <div class=\"card\" style=\"margin-top:16px\">\n      <div class=\"card-h\"><h2>净化后文案</h2><span class=\"sub\">已按建议自动替换</span></div>\n      <textarea id=\"cclean\" class=\"sm\" readonly placeholder=\"点击上方「一键生成净化版」，这里会输出替换后的文案，可直接复制使用。\"></textarea>\n      <div class=\"btnrow\">\n        <button class=\"btn primary\" id=\"ccopy\">复制净化版</button>\n      </div>\n      <div class=\"hint\">说明：本工具依据《广告法》绝对化用语规定与主流社群平台社区规范整理词库，仅作自查参考。判定与平台实际审核结果可能存在差异，最终以平台审核为准。</div>\n    </div>\n  </section>\n\n  <!-- ============ 标题生成器 ============ -->\n  <section class=\"panel\" id=\"p-title\">\n    <div class=\"card\">\n      <div class=\"card-h\"><h2>设置</h2><span class=\"sub\">选定赛道与关键词，批量产出标题</span></div>\n      <div class=\"row\">\n        <div>\n          <label class=\"fl\">内容赛道</label>\n          <select id=\"ttrack\"></select>\n        </div>\n        <div>\n          <label class=\"fl\">核心关键词</label>\n          <input type=\"text\" id=\"tkey\" placeholder=\"例：油皮护肤\">\n        </div>\n        <div>\n          <label class=\"fl\">目标人群</label>\n          <select id=\"taud\"></select>\n        </div>\n      </div>\n      <div class=\"switches\">\n        <label class=\"sw\"><input type=\"checkbox\" id=\"temoji\" checked>加表情符号</label>\n        <label class=\"sw\"><input type=\"checkbox\" id=\"tnum\" checked>含数字</label>\n        <label class=\"sw\"><input type=\"checkbox\" id=\"tcliff\" checked>带悬念钩子</label>\n      </div>\n      <div class=\"btnrow\">\n        <button class=\"btn primary\" id=\"tgen\">生成 12 条标题</button>\n        <button class=\"btn\" id=\"tcopy\">复制全部</button>\n        <button class=\"btn ghost\" id=\"tclear\">清空</button>\n      </div>\n    </div>\n    <div class=\"card\" style=\"margin-top:16px\">\n      <div class=\"card-h\"><h2>标题候选</h2><span class=\"sub\">小红书标题建议 ≤ 20 字，超出会标红提醒</span></div>\n      <div class=\"itemlist scroll\" id=\"tlist\"><div class=\"empty-tip\">点击上方「生成 12 条标题」开始</div></div>\n    </div>\n  </section>\n\n  <!-- ============ 排版美化 ============ -->\n  <section class=\"panel\" id=\"p-format\">\n    <div class=\"grid2\">\n      <div class=\"card\">\n        <div class=\"card-h\"><h2>原始草稿</h2><span class=\"sub\" id=\"fcount\">0 字</span></div>\n        <textarea id=\"ftext\" placeholder=\"把写好的纯文本草稿粘进来，每段之间空一行。&#10;&#10;工具会自动为每段匹配 emoji、规范化空行，并生成合适的话题标签。\"></textarea>\n        <div class=\"row\" style=\"margin-top:10px\">\n          <div>\n            <label class=\"fl\">话题赛道</label>\n            <select id=\"ftrack\"></select>\n          </div>\n          <div>\n            <label class=\"fl\">每段前缀风格</label>\n            <select id=\"fstyle\">\n              <option value=\"emoji\">Emoji 小标题</option>\n              <option value=\"num\">序号段落</option>\n              <option value=\"plain\">纯净无符号</option>\n            </select>\n          </div>\n        </div>\n        <div class=\"switches\">\n          <label class=\"sw\"><input type=\"checkbox\" id=\"ftag\" checked>末尾追加话题标签</label>\n          <label class=\"sw\"><input type=\"checkbox\" id=\"fwrap\" checked>段落间保留空行</label>\n          <label class=\"sw\"><input type=\"checkbox\" id=\"fspace\" checked>中英文间加空格</label>\n        </div>\n        <div class=\"btnrow\">\n          <button class=\"btn primary\" id=\"fgo\">一键排版</button>\n          <button class=\"btn\" id=\"fdemo\">载入示例</button>\n          <button class=\"btn ghost\" id=\"fclear\">清空</button>\n        </div>\n      </div>\n      <div class=\"card\">\n        <div class=\"card-h\"><h2>排版结果</h2><span class=\"sub\" id=\"fout\">0 字</span></div>\n        <div class=\"preview empty\" id=\"fpreview\" style=\"min-height:300px;max-height:430px;line-height:1.9\">排版结果会显示在这里…</div>\n        <div class=\"btnrow\">\n          <button class=\"btn primary\" id=\"fcopy\">复制排版结果</button>\n          <button class=\"btn\" id=\"fcheck\">送去违禁词自查</button>\n        </div>\n        <div class=\"hint\">提示：小红书正文建议控制在 800—1000 字，段落控制在 3—5 行，阅读体验最佳。</div>\n      </div>\n    </div>\n  </section>\n\n  <!-- ============ 选题灵感 ============ -->\n  <section class=\"panel\" id=\"p-idea\">\n    <div class=\"card\">\n      <div class=\"card-h\"><h2>灵感罗盘</h2><span class=\"sub\">四维随机组合，一次性给出可执行的选题</span></div>\n      <div class=\"row\">\n        <div>\n          <label class=\"fl\">赛道</label>\n          <select id=\"itrack\"></select>\n        </div>\n        <div>\n          <label class=\"fl\">内容形态</label>\n          <select id=\"iform\">\n            <option value=\"\">全部形态</option>\n          </select>\n        </div>\n        <div>\n          <label class=\"fl\">增长目标</label>\n          <select id=\"igoal\">\n            <option value=\"\">不限</option>\n            <option value=\"涨粉\">涨粉破圈</option>\n            <option value=\"收藏\">冲收藏量</option>\n            <option value=\"互动\">拉互动评论</option>\n            <option value=\"转化\">引流变现</option>\n          </select>\n        </div>\n      </div>\n      <div class=\"btnrow\">\n        <button class=\"btn primary\" id=\"igen\">生成 6 个选题</button>\n        <button class=\"btn\" id=\"imore\">换一批</button>\n      </div>\n    </div>\n    <div class=\"card\" style=\"margin-top:16px\">\n      <div class=\"card-h\"><h2>选题清单</h2><span class=\"sub\">每条含标题方向 + 内容骨架</span></div>\n      <div class=\"itemlist scroll\" id=\"ilist\"><div class=\"empty-tip\">点击「生成 6 个选题」开始</div></div>\n      <div class=\"btnrow\">\n        <button class=\"btn\" id=\"icopy\">复制全部</button>\n        <button class=\"btn\" id=\"itoTitle\">把首选选题送去生成标题</button>\n      </div>\n    </div>\n  </section>\n\n  <!-- ============ 封面排版 ============ -->\n  <section class=\"panel\" id=\"p-cover\">\n    <div class=\"card\">\n      <div class=\"card-h\"><h2>封面制作</h2><span class=\"sub\">3:4 竖版，可直接保存为 1080×1440 PNG</span></div>\n      <div class=\"coverbox\">\n        <div class=\"canvaswrap\"><canvas id=\"cv\" width=\"1080\" height=\"1440\"></canvas></div>\n        <div class=\"coverctrl\">\n          <div class=\"row\">\n            <div>\n              <label class=\"fl\">主标题</label>\n              <input type=\"text\" id=\"kmain\" value=\"油皮护肤\" maxlength=\"14\">\n            </div>\n            <div>\n              <label class=\"fl\">副标题</label>\n              <input type=\"text\" id=\"ksub\" value=\"保姆级 5 步教程\" maxlength=\"20\">\n            </div>\n          </div>\n          <div style=\"margin-top:10px\">\n            <label class=\"fl\">版式模板</label>\n            <div class=\"tpls\" id=\"ktpls\"></div>\n          </div>\n          <div style=\"margin-top:10px\">\n            <label class=\"fl\">配色</label>\n            <div class=\"swatches\" id=\"kcolors\"></div>\n          </div>\n          <div class=\"btnrow\">\n            <button class=\"btn primary\" id=\"kdl\">下载封面 PNG</button>\n            <button class=\"btn\" id=\"krand\">随机换文案</button>\n          </div>\n          <div class=\"hint\">下载的 PNG 为 1080×1440，符合小红书竖版封面推荐尺寸。</div>\n        </div>\n      </div>\n    </div>\n  </section>\n</div>\n\n<div class=\"foot\">\n  <div class=\"footcard\">\n    <h3>使用说明</h3>\n    <ol>\n      <li><b>违禁词自查</b>：粘贴正文 → 自动高亮风险词 → 查看右侧替换建议 → 点「一键生成净化版」直接复制可用文案。</li>\n      <li><b>标题生成</b>：选赛道填入关键词 → 生成 12 条候选 → 单条点击复制，或一次性复制全部备用。</li>\n      <li><b>排版美化</b>：粘贴草稿 → 一键排版 → 可把结果直接送去违禁词自查，形成「写 → 排 → 检」闭环。</li>\n      <li><b>选题灵感</b>：四维随机组合产出选题 → 中意的可一键送入标题生成器继续加工。</li>\n      <li><b>封面排版</b>：输入主副标题 → 选版式配色 → 下载 1080×1440 PNG 直接使用。</li>\n    </ol>\n    <div class=\"footnote\">全部功能在浏览器本地完成，不上传、不存储任何文案内容，可离线使用（首次加载后）。词库依据《广告法》绝对化用语规定与主流社群平台社区规范整理，仅作自查提示，最终判定以平台审核为准。</div>\n  </div>\n</div>\n\n<div class=\"toast\" id=\"toast\"></div>\n\n";

"use strict";
/* ==========================================================
   爆款笔记工坊 · 小红书运营工具箱
   纯前端 / 无依赖 / 本地运行
   ========================================================== */

/* ---------------- 通用工具 ---------------- */
function $(id){return document.getElementById(id)}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function toast(msg){
  var t=$("toast"); t.textContent=msg; t.classList.add("on");
  clearTimeout(t._t); t._t=setTimeout(function(){t.classList.remove("on")},1800);
}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function rnd(n){return Math.floor(Math.random()*n)}
function copy(text){
  if(navigator.clipboard && window.isSecureContext){
    return navigator.clipboard.writeText(text);
  }
  return new Promise(function(res,rej){
    var ta=document.createElement("textarea");
    ta.value=text; ta.style.position="fixed"; ta.style.opacity="0";
    document.body.appendChild(ta); ta.select();
    try{document.execCommand("copy");res()}catch(e){rej(e)}
    document.body.removeChild(ta);
  });
}
function doCopy(text,okMsg){
  copy(text).then(function(){toast(okMsg||"已复制")}).catch(function(){toast("复制失败，请手动选择复制")});
}

/* ---------------- 违禁词库 ---------------- */
var CATS=[
  {k:"limit",n:"极限词",l:"high",sg:"《广告法》禁止的绝对化用语"},
  {k:"divert",n:"导流交易",l:"high",sg:"站外导流，易被限流或删除"},
  {k:"medical",n:"医疗功效",l:"high",sg:"涉嫌功效承诺，个人体验表述更安全"},
  {k:"promise",n:"夸大承诺",l:"high",sg:"确定性承诺，建议改为主观表述"},
  {k:"rumor",n:"封建迷信",l:"high",sg:"平台明确禁止的迷信内容"},
  {k:"illegal",n:"违规信息",l:"high",sg:"涉及违法违规业务"},
  {k:"vulgar",n:"低俗用语",l:"mid",sg:"不文明用语，影响账号权重"},
  {k:"brand",n:"假货侵权",l:"mid",sg:"涉嫌售假或侵权表述"},
  {k:"hype",n:"夸大营销",l:"low",sg:"营销色彩过重，可更具体"}
];
var CATMAP={};CATS.forEach(function(c){CATMAP[c.k]=c});

var LEXRAW={
limit:["最好","最佳","最优","最强","最便宜","最低价","最划算","最专业","最先进","最安全","最有效","最省钱","最高级","最优秀","最具","最顶级","全网最低","全网第一","全网独家","行业第一","排名第一","销量第一","口碑第一","销量冠军","世界级","国家级","国家级品质","顶级","顶尖","极致","首个","首选","独家","唯一","独一无二","史无前例","前所未有","史上最强","史上最低","百分百","百分之百","100%","零风险","无风险","包治百病","万能","永久","终身","永远","最新科学","最新技术","填补空白","领导品牌","行业领导者","无敌","绝无仅有","全线最低"],
divert:["加微信","加微","加v","加V","+v","+V","威信","薇信","微信号是","私信我","私聊我","私我","扫码","扫二维码","加我微信","加个微信","加微信好友","公众号","加qq","加QQ","+q","+Q","淘宝下单","淘宝链接","拼多多","京东链接","购买链接","点击链接","复制链接","站外下单","微店","闲鱼拍","有赞","代购","外链","我店铺","店铺链接","可以直接买"],
medical:["治疗","治愈","痊愈","根治","药效","疗效","消炎","杀菌","灭菌","抑菌","抗菌","抗癌","防癌","降压","降糖","降血脂","降血压","减肥","瘦身","燃脂","排毒","祛湿","美白","祛斑","淡斑","祛痘","战痘","抗衰老","抗氧化","去皱","丰胸","壮阳","生发","植发","包治","见效","立竿见影","三天见效","七天见效","一周见效","永不反弹","彻底根除","药监局","处方药","医生推荐","权威认证","有效率","缓解疼痛","根治不复发","变白","变瘦","瘦十斤","白到发光","逆龄","冻龄"],
promise:["保证","包过","包会","必过","包你","一定能","肯定能","稳赚","保本","包赚","翻倍","躺赚","被动收入","回报率","年化收益","投资回报","日入","月入过万","轻松赚钱","零成本赚钱","无偿赚钱","无效退款","终身免费","永久免费","稳赚不赔","百分百赚钱","稳过","包上岸","必上岸"],
rumor:["算命","占卜","算卦","塔罗","塔罗牌","八字","排盘","星盘","占星","开光","转运","招财进宝","招财猫","辟邪","风水","看面相","看手相","手相","改运","桃花运","本命年","黄历","择吉日","驱邪","旺夫","旺财","化煞"],
illegal:["代开发票","虚开发票","刷单","刷赞","刷量","刷单兼职","水军","控评","删帖","黑产","翻墙","梯子","vpn","VPN","代写论文","代考","枪手","办假证","高利贷","套现","信用卡套现","私服","外挂","赌博","博彩","六合彩","彩票预测","代孕","走私"],
vulgar:["傻逼","傻b","傻B","煞笔","脑残","智障","滚粗","贱人","贱货","婊子","骚货","狗东西","妈卖批","草泥马","尼玛","卧槽","他妈的","去死","死全家","滚蛋"],
brand:["专柜同款","外贸原单","原单","尾单","A货","高仿","1:1","复刻版","原厂尾货","工厂直销货源","同款原单","假一赔十"],
hype:["全网","所有人","任何人","每个人","全球首款","史上","必备","必买","必入","必看","人手一个","人手必备","不买后悔","一生必去","绝了","永远的神","yyds","天花板","顶级配置","国民级","爆款保证","必火","神器","逆天","无敌好用"]
};

/* ---------------- 替换词表 ----------------
   值 = 建议直接替换进去的词；空串 = 建议整词删除            */
var REP={
  /* 极限词 */
  "最好":"很不错","最佳":"很合适","最优":"很不错","最强":"很强","最便宜":"价格友好","最低价":"价格友好",
  "最划算":"挺划算","最专业":"挺专业","最先进":"比较先进","最安全":"比较安全","最有效":"比较有效",
  "最省钱":"比较省钱","最高级":"档次不错","最优秀":"挺优秀","最具":"挺有","最顶级":"相当高级",
  "全网最低":"价格友好","全网第一":"很受欢迎","全网独家":"比较少见","行业第一":"表现突出","排名第一":"表现突出",
  "销量第一":"卖得不错","销量冠军":"卖得不错","口碑第一":"口碑很好","世界级":"水准不错","国家级":"规格较高",
  "顶级":"相当不错","顶尖":"相当不错","极致":"非常","首个":"较新的","首选":"优先考虑","独家":"比较少见",
  "唯一":"比较少见","独一无二":"比较少见","史无前例":"比较少见","前所未有":"比较少见","史上最强":"很强",
  "史上最低":"价格友好","百分百":"大概率","百分之百":"大概率","100%":"大概率","零风险":"风险较低",
  "无风险":"风险较低","包治百病":"改善明显","万能":"用途挺广","永久":"长期","终身":"长期","永远":"一直",
  "最新科学":"相关研究","最新技术":"相关技术","填补空白":"比较少见","领导品牌":"知名品牌",
  "行业领导者":"业内知名","无敌":"很强","绝无仅有":"比较少见","全线最低":"价格友好",
  /* 导流交易：无法就地改写得体，一律建议删除；仅保留可安全改写的人称指引 */
  "加微信":"","加微":"","加v":"","加V":"","+v":"","+V":"","威信":"","薇信":"","微信号是":"",
  "加qq":"","加QQ":"","加q":"","加Q":"","+q":"","+Q":"",
  "私信我":"评论区找我","私聊我":"评论区交流","私我":"评论区找我",
  "扫码":"","扫二维码":"","加我微信":"","加个微信":"","加微信好友":"","公众号":"",
  "淘宝下单":"","淘宝链接":"","拼多多":"","京东链接":"","购买链接":"","点击链接":"",
  "复制链接":"","站外下单":"","微店":"","闲鱼拍":"","有赞":"","代购":"","外链":"",
  "我店铺":"","店铺链接":"","可以直接买":"",
  /* 医疗功效 */
  "治疗":"改善","治愈":"改善","痊愈":"好转","根治":"改善","药效":"作用","疗效":"效果",
  "消炎":"舒缓","杀菌":"清洁","灭菌":"清洁","抑菌":"清洁","抗菌":"清洁","抗癌":"有助健康","防癌":"有助健康",
  "降压":"调节","降糖":"调节","降血脂":"调节","降血压":"调节","减肥":"管理体重","瘦身":"管理体重",
  "燃脂":"运动","排毒":"促进代谢","美白":"提亮","祛斑":"均匀肤色","淡斑":"均匀肤色",
  "祛痘":"改善痘肌","战痘":"改善痘肌","抗衰老":"呵护肌肤","抗氧化":"呵护肌肤","去皱":"紧致",
  "丰胸":"","壮阳":"","生发":"养护头发","植发":"","包治":"改善","见效":"有变化","立竿见影":"比较快",
  "三天见效":"坚持一段时间后","七天见效":"坚持一段时间后","一周见效":"坚持一段时间后",
  "永不反弹":"比较稳定","彻底根除":"改善明显","药监局":"相关机构","处方药":"药品",
  "医生推荐":"很多人推荐","权威认证":"通过相关检测","有效率":"反馈不错","缓解疼痛":"舒缓","根治不复发":"状态稳定",
  "变白":"提亮肤色","变瘦":"体态更好","瘦十斤":"体态有变化","白到发光":"气色不错","逆龄":"状态不错","冻龄":"状态不错",
  "祛湿":"身体轻松些",
  /* 夸大承诺 */
  "保证":"","包过":"","包会":"","必过":"","包你":"","一定能":"有机会","肯定能":"有机会",
  "稳赚":"","保本":"","包赚":"","翻倍":"","躺赚":"","被动收入":"额外收入","回报率":"收益情况",
  "年化收益":"收益情况","投资回报":"收益情况","日入":"收入","月入过万":"收入还不错","轻松赚钱":"增加收入",
  "零成本赚钱":"低成本起步","无偿赚钱":"","无效退款":"支持退换","终身免费":"长期免费","永久免费":"长期免费",
  "稳赚不赔":"","百分百赚钱":"","稳过":"大概率能过","包上岸":"有机会上岸","必上岸":"有机会上岸",
  /* 假货侵权 */
  "专柜同款":"专柜款","外贸原单":"","原单":"","尾单":"","A货":"","高仿":"","1:1":"","复刻版":"",
  "原厂尾货":"","工厂直销货源":"工厂货源","同款原单":"","假一赔十":"支持验货",
  /* 夸大营销 */
  "全网":"不少地方","所有人":"很多人","任何人":"很多人","每个人":"很多人","全球首款":"比较少见",
  "史上":"","必备":"值得试试","必买":"值得买","必入":"值得入","人手一个":"很多人都有",
  "人手必备":"很多人都在用","不买后悔":"值得考虑","一生必去":"值得去","绝了":"很不错","永远的神":"很不错",
  "yyds":"很不错","天花板":"水准很高","顶级配置":"配置不错","国民级":"很多人喜欢","爆款保证":"","必火":"",
  "必看":"值得一看","神器":"挺好用","逆天":"出乎意料","无敌好用":"挺好用"
};
/* 未显式定义的词，按类别给出兜底替换 */
function fallbackRep(cat,w){
  if(cat==="limit"){
    if(w.charAt(0)==="最")return "很"+w.slice(1);
    if(/第一$/.test(w))return "表现突出";
    return "很不错";
  }
  if(cat==="divert")return "";
  if(cat==="medical")return "用下来感觉不错";
  if(cat==="promise")return "通常";
  if(cat==="rumor"||cat==="illegal")return "";
  if(cat==="vulgar")return "不太合适";
  if(cat==="brand")return "正规渠道的";
  return "";
}

/* 展开为标准词条结构 */
var LEX=[];
CATS.forEach(function(c){
  (LEXRAW[c.k]||[]).forEach(function(w){
    var rep=Object.prototype.hasOwnProperty.call(REP,w)?REP[w]:fallbackRep(c.k,w);
    LEX.push({w:w,cat:c.k,l:c.l,sg:c.sg,rep:rep});
  });
});
$("lexn").textContent=LEX.length;

/* ---------------- 违禁词检测 ---------------- */
function extraWords(){
  var v=($("cextra").value||"").trim();
  if(!v)return [];
  return v.split(/[,，、\s]+/).filter(function(x){return x.length>0}).map(function(w){
    return {w:w,cat:"hype",l:"low",sg:"自定义词，按实际情况处理",rep:""};
  });
}
function scan(text){
  var L=text.toLowerCase();
  var dict=LEX.concat(extraWords());
  var hits=[];
  dict.forEach(function(e){
    var lw=e.w.toLowerCase();
    if(!lw)return;
    var i=0,idx;
    while((idx=L.indexOf(lw,i))!==-1){
      hits.push({s:idx,e:idx+lw.length,w:e.w,cat:e.cat,l:e.l,sg:e.sg,rep:e.rep});
      i=idx+lw.length;
    }
  });
  hits.sort(function(a,b){return a.s-b.s||(b.e-b.s)-(a.e-a.s)});
  var merged=[];
  hits.forEach(function(h){
    var last=merged[merged.length-1];
    if(last && h.s<last.e){ if(h.e>last.e)last.e=h.e; }
    else merged.push({s:h.s,e:h.e,w:h.w,cat:h.cat,l:h.l,sg:h.sg,rep:h.rep});
  });
  return merged;
}

var CUR_HITS=[],CUR_FILTER="all";

function renderPreview(text,hits){
  var el=$("cpreview");
  if(!text.trim()){el.className="preview empty";el.textContent="等待输入文案…";return}
  el.className="preview";
  var out="",pos=0;
  hits.forEach(function(h){
    out+=esc(text.slice(pos,h.s));
    out+='<mark class="l-'+h.l+'">'+esc(text.slice(h.s,h.e))+'</mark>';
    pos=h.e;
  });
  out+=esc(text.slice(pos));
  el.innerHTML=out;
}
function renderHits(hits){
  var box=$("chits");
  var f=CUR_FILTER==="all"?hits:hits.filter(function(h){return h.cat===CUR_FILTER});
  if(!f.length){box.innerHTML='<div class="empty-tip">暂无命中词条</div>';return}
  var seen={},uniq=[];
  f.forEach(function(h){ if(!seen[h.w]){seen[h.w]=1;uniq.push(h)} });
  box.innerHTML=uniq.map(function(h){
    var c=CATMAP[h.cat]||CATS[CATS.length-1];
    var act=h.rep?'→ 改为「'+esc(h.rep)+'」':'→ 建议删除该表述';
    return '<div class="hit l-'+h.l+'">'
      +'<span class="cat">'+esc(c.n)+'</span>'
      +'<span class="w">'+esc(h.w)+'</span>'
      +'<span class="r"><b style="color:var(--text)">'+act+'</b><br>'+esc(h.sg)+'</span>'
      +'</div>';
  }).join("");
}
function renderFilters(hits){
  var used={};hits.forEach(function(h){used[h.cat]=1});
  var keys=Object.keys(used);
  var html='<div class="chip'+(CUR_FILTER==="all"?" on":"")+'" data-c="all">全部 '+hits.length+'</div>';
  html+=CATS.filter(function(c){return used[c.k]}).map(function(c){
    var n=hits.filter(function(h){return h.cat===c.k}).length;
    return '<div class="chip'+(CUR_FILTER===c.k?" on":"")+'" data-c="'+c.k+'">'+c.n+' '+n+'</div>';
  }).join("");
  $("cfilters").innerHTML=html;
  Array.prototype.forEach.call($("cfilters").querySelectorAll(".chip"),function(el){
    el.onclick=function(){
      CUR_FILTER=el.getAttribute("data-c");
      renderFilters(CUR_HITS);renderHits(CUR_HITS);
    };
  });
}
function renderStats(text,hits){
  var hi=0,mi=0,lo=0;
  hits.forEach(function(h){
    if(h.l==="high")hi++;else if(h.l==="mid")mi++;else lo++;
  });
  $("s-high").textContent=hi;$("s-mid").textContent=mi;$("s-low").textContent=lo;
  var penalty=hi*8+mi*3+lo*1;
  var score=Math.max(20,100-penalty);
  $("s-score").textContent=score;
  var v=$("cverdict");
  if(!text.trim()){v.className="verdict good";v.textContent="✅ 暂无风险，可以放心发布"}
  else if(hi>0){v.className="verdict bad";v.textContent="⛔ 存在 "+hi+" 处高危风险，建议修改后再发布"}
  else if(mi>0){v.className="verdict mid";v.textContent="⚠️ 有 "+mi+" 处需留意，建议顺手改掉"}
  else if(lo>0){v.className="verdict mid";v.textContent="⚠️ 有 "+lo+" 处提示项，不影响发布但可优化"}
  else{v.className="verdict good";v.textContent="✅ 未发现风险词，可以放心发布"}
}
function runScan(){
  var text=$("ctext").value||"";
  $("ccount").textContent=text.length+" 字";
  CUR_HITS=scan(text);
  renderPreview(text,CUR_HITS);
  renderStats(text,CUR_HITS);
  renderFilters(CUR_HITS);
  renderHits(CUR_HITS);
}
$("ctext").addEventListener("input",runScan);
$("cextra").addEventListener("input",runScan);
$("cscan").onclick=function(){runScan();toast("检测完成")};
$("cclear").onclick=function(){$("ctext").value="";$("cclean").value="";runScan()};
$("cdemo").onclick=function(){
  $("ctext").value="姐妹们！这款面霜真的是我用过最好的一款，美白祛斑效果绝了，三天见效不夸张😭\n\n我跟你们说，全网最低价就在我这儿，保证正品，用了包你变白，无效退款！\n\n想买的姐妹直接加我微信，我发你链接，手把手教你下单～\n\n#护肤 #变美";
  runScan();toast("已载入示例文案");
};
/* 替换／删除后产生的标点残留清理 */
function tidyText(s){
  return s
    .replace(/[ \t]+/g," ")
    .replace(/([，、；：])(?:\s*\1)+/g,"$1")
    .replace(/，\s*([。！？])/g,"$1")
    .replace(/([。！？])\s*([，、；])/g,"$1")
    .replace(/[，、；]\s*(?=\n|$)/g,"")
    .replace(/^\s*[，、；：。]+\s*/,"")
    .replace(/\n{3,}/g,"\n\n")
    .trim();
}
$("cfix").onclick=function(){
  var text=$("ctext").value||"";
  if(!text.trim()){toast("请先输入文案");return}
  var out="",pos=0;
  CUR_HITS.forEach(function(h){ out+=text.slice(pos,h.s)+h.rep; pos=h.e; });
  out+=text.slice(pos);
  out=tidyText(out);
  $("cclean").value=out;
  var left=scan(out).length;
  toast(left?("已生成净化版，仍剩 "+left+" 处待确认"):"已生成净化版，风险已清空");
};
$("ccopy").onclick=function(){
  var v=$("cclean").value;
  if(!v.trim()){toast("请先生成净化版");return}
  doCopy(v,"净化版已复制");
};

/* ---------------- 赛道数据 ---------------- */
var TRACKS=[
  {k:"beauty",n:"美妆个护",keys:["油皮护肤","底妆","口红色号","防晒","香水","发型打理","换季护肤"],tags:["#护肤","#美妆","#变美日记","#油皮护肤"]},
  {k:"home",n:"家居好物",keys:["小户型收纳","厨房神器","租房改造","卧室布置","卫生间收纳","阳台改造"],tags:["#家居好物","#收纳","#租房改造","#家的样子"]},
  {k:"food",n:"美食",keys:["快手菜","减脂餐","烘焙","一人食","早餐","空气炸锅","咖啡"],tags:["#美食","#快手菜","#减脂餐","#一人食"]},
  {k:"mom",n:"母婴亲子",keys:["辅食","早教","绘本","睡眠训练","幼儿园准备","宝宝穿搭"],tags:["#母婴","#育儿","#辅食","#亲子"]},
  {k:"career",n:"职场成长",keys:["简历优化","面试技巧","副业","汇报PPT","时间管理","转行"],tags:["#职场","#副业","#自我提升","#打工人"]},
  {k:"study",n:"学习考证",keys:["考研","英语","教资","刷题方法","自习效率","笔记法"],tags:["#学习","#考研","#自律","#学习方法"]},
  {k:"travel",n:"旅行出行",keys:["周末游","citywalk","穷游","亲子游","酒店","高铁出行"],tags:["#旅行","#周边游","#citywalk","#旅行攻略"]},
  {k:"digital",n:"数码科技",keys:["手机摄影","AI工具","笔记本选购","平板生产力","智能家居","效率软件"],tags:["#数码","#科技","#AI工具","#效率神器"]},
  {k:"fit",n:"运动健身",keys:["居家健身","瑜伽","跑步","体态矫正","普拉提","拉伸"],tags:["#健身","#运动","#体态","#自律"]},
  {k:"cloth",n:"穿搭时尚",keys:["小个子穿搭","通勤穿搭","秋冬叠穿","梨形身材","配饰","基础款"],tags:["#穿搭","#每日穿搭","#小个子穿搭","#通勤穿搭"]}
];
function fillSelect(el,list,withAll){
  var html=withAll?'<option value="">全部赛道</option>':"";
  html+=list.map(function(t){return '<option value="'+t.k+'">'+t.n+'</option>'}).join("");
  el.innerHTML=html;
}
fillSelect($("ttrack"),TRACKS,false);
fillSelect($("ftrack"),TRACKS,false);
fillSelect($("itrack"),TRACKS,true);

var AUDS=["学生党","打工人","新手小白","宝妈","职场女性","大学生","租房党","敏感肌人群","小个子女生","预算有限的人","想转行的人","备考人"];
$("taud").innerHTML=AUDS.map(function(a){return '<option value="'+a+'">'+a+'</option>'}).join("");

/* ---------------- 标题生成器 ---------------- */
var EMOJIS=["🔥","✨","💡","📌","🌟","😭","🙌","💥","🎯","⚡","🥹","🫶","📝","✅","💬","👀"];
var TITLE_TPL=[
  function(c){return c.num+"个"+c.key+"技巧，第"+c.n2+"个我愿称之为神"},
  function(c){return "千万别这样"+c.key+"！我踩过的 "+c.num+" 个坑都在这"},
  function(c){return "保姆级"+c.key+"教程｜新手也能一次学会"},
  function(c){return c.aud+"必看｜"+c.key+"这样做才不踩坑"},
  function(c){return "Before / After｜"+c.key+"前后的差距也太大了"},
  function(c){return c.key+"总翻车？"+c.num+" 步搞定，看完就会"},
  function(c){return "关于"+c.key+"，有件事我一直没敢说…"},
  function(c){return "真的会谢！这个"+c.key+"方法我怎么没早点知道"},
  function(c){return "吐血整理｜"+c.key+"全攻略，建议先收藏"},
  function(c){return c.key+"别乱买，这 "+c.num+" 个平价款才是真的香"},
  function(c){return "被问爆的"+c.key+"问题，今天一次讲清楚"},
  function(c){return "坚持"+c.key+"的第 "+c.num+" 天，变化肉眼可见"},
  function(c){return c.aud+"的"+c.key+"清单，照着抄就行"},
  function(c){return "我把"+c.key+"踩的坑都试了一遍，结论是…"},
  function(c){return "不花冤枉钱｜"+c.num+" 个"+c.key+"好物真实测评"},
  function(c){return c.key+"从入门到放弃？这份清单能救你"},
  function(c){return "后悔没早点知道｜"+c.num+" 个"+c.key+"冷知识"},
  function(c){return c.key+"避坑指南｜这 "+c.num+" 件事真的别做"},
  function(c){return "普通人的"+c.key+"实录，比教程实在多了"},
  function(c){return c.key+"｜一个月后我回来交作业了"}
];
var TITLE_HOOK=["（附清单）","｜亲测有效","｜建议收藏","（内附教程）","｜真实体验"];
function genTitles(){
  var tk=TRACKS.filter(function(t){return t.k===$("ttrack").value})[0]||TRACKS[0];
  var key=($("tkey").value||"").trim()||pick(tk.keys);
  var aud=$("taud").value||pick(AUDS);
  var useE=$("temoji").checked,useN=$("tnum").checked,useC=$("tcliff").checked;
  var pool=TITLE_TPL.slice();
  var out=[];
  for(var i=0;i<12;i++){
    if(!pool.length)pool=TITLE_TPL.slice();
    var idx=rnd(pool.length);
    var tpl=pool.splice(idx,1)[0];
    var n=useN?(3+rnd(8)):5;
    var c={key:key,aud:aud,num:n,n2:Math.min(n,1+rnd(n))};
    var s=tpl(c);
    if(!useN)s=s.replace(/\d+ ?个/g,"几个").replace(/第\d+ ?天/g,"一段时间后").replace(/\d+ ?步/g,"几步");
    if(useE)s=pick(EMOJIS)+s;
    if(useC&&s.length<16)s+=pick(TITLE_HOOK);
    out.push(s);
  }
  var box=$("tlist");
  box.innerHTML=out.map(function(s,i){
    var long=s.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,"").length>20;
    return '<div class="item">'
      +'<div class="idx">'+(i+1)+'</div>'
      +'<div class="body"><div class="tt">'+esc(s)+(long?' <span style="color:#E5484D;font-size:11.5px">超20字</span>':'')+'</div></div>'
      +'<div class="act"><button class="iconbtn" data-t="'+esc(s)+'" title="复制">📋</button></div>'
      +'</div>';
  }).join("");
  Array.prototype.forEach.call(box.querySelectorAll(".iconbtn"),function(b){
    b.onclick=function(){doCopy(b.getAttribute("data-t"),"标题已复制")};
  });
}
$("tgen").onclick=function(){genTitles();toast("已生成 12 条标题")};
$("tcopy").onclick=function(){
  var items=$("tlist").querySelectorAll(".tt");
  if(!items.length){toast("请先生成标题");return}
  var arr=[];Array.prototype.forEach.call(items,function(e){arr.push(e.textContent.replace(/ ?超20字$/,""))});
  doCopy(arr.join("\n"),"已复制全部标题");
};
$("tclear").onclick=function(){$("tlist").innerHTML='<div class="empty-tip">点击上方「生成 12 条标题」开始</div>'};

/* ---------------- 排版美化 ---------------- */
var STYLE_EMOJI=["✨","📌","💡","🔥","🌟","🙌","💬","📝","✅","⚠️","🎯","🧩","🪄","📦","🛒","💰","🧠","❤️","👇","🏠"];
function fmt(){
  var raw=$("ftext").value||"";
  $("fcount").textContent=raw.length+" 字";
  var tk=TRACKS.filter(function(t){return t.k===$("ftrack").value})[0]||TRACKS[0];
  var style=$("fstyle").value;
  var paras=raw.split(/\n+/).map(function(x){return x.trim()}).filter(function(x){return x.length});
  var out=paras.map(function(p,i){
    var prefix="";
    if(style==="emoji")prefix=STYLE_EMOJI[i%STYLE_EMOJI.length]+" ";
    else if(style==="num")prefix=(i+1)+". ";
    return prefix+p;
  });
  var sep=$("fwrap").checked?"\n\n":"\n";
  var text=out.join(sep);
  if($("fspace").checked){
    text=text.replace(/([\u4e00-\u9fa5])([A-Za-z0-9])/g,"$1 $2").replace(/([A-Za-z0-9])([\u4e00-\u9fa5])/g,"$1 $2");
  }
  if($("ftag").checked){
    text+="\n\n"+tk.tags.join(" ");
  }
  $("fpreview").classList.remove("empty");
  $("fpreview").textContent=text||"";
  $("fout").textContent=text.length+" 字";
  return text;
}
$("ftext").addEventListener("input",function(){
  $("fcount").textContent=($("ftext").value||"").length+" 字";
});
$("fgo").onclick=function(){fmt();toast("排版完成")};
$("fdemo").onclick=function(){
  $("ftext").value="换季之后我的皮肤状态一直不稳定，试了不少方法才慢慢稳下来。\n今天把这几个月踩过的坑和真正有用的步骤整理出来。\n第一步是清洁，很多人这一步就做错了，过度清洁反而会破坏屏障。\n第二步是保湿，选成分简单的产品比堆功效更重要。\n第三步是防晒，这一步最容易被忽略，但其实是关键。\n最后想说的是，护肤不是越多越好，精简反而更有效。";
  fmt();toast("已载入示例草稿");
};
$("fclear").onclick=function(){
  $("ftext").value="";$("fpreview").textContent="排版结果会显示在这里…";
  $("fpreview").classList.add("empty");
  $("fcount").textContent="0 字";$("fout").textContent="0 字";
};
$("fcopy").onclick=function(){
  var t=$("fpreview").textContent||"";
  if($("fpreview").classList.contains("empty")||!t.trim()){toast("请先排版");return}
  doCopy(t,"排版结果已复制");
};
$("fcheck").onclick=function(){
  var t=$("fpreview").textContent||"";
  if($("fpreview").classList.contains("empty")||!t.trim()){toast("请先排版");return}
  $("ctext").value=t;
  switchTo("check");
  runScan();
  toast("已送去违禁词自查");
};

/* ---------------- 选题灵感 ---------------- */
var FORMS=[
  {k:"list",n:"清单合集",sk:"整理 N 个具体条目，信息密度高"},
  {k:"tut",n:"保姆级教程",sk:"分步骤拆解，每步配图说明"},
  {k:"pit",n:"避坑复盘",sk:"讲自己踩过的坑，给出替代方案"},
  {k:"contrast",n:"前后对比",sk:"Before/After 图 + 变化原因分析"},
  {k:"story",n:"真实经历",sk:"以第一人称讲完整过程，重情绪共鸣"},
  {k:"review",n:"横向测评",sk:"多款同类产品同维度打分对比"},
  {k:"qa",n:"问答科普",sk:"收集高频提问，逐条解答"},
  {k:"daily",n:"日常记录",sk:"连续记录 N 天，展现真实变化"}
];
$("iform").innerHTML='<option value="">全部形态</option>'+FORMS.map(function(f){return '<option value="'+f.k+'">'+f.n+'</option>'}).join("");

var PAINS=["预算有限但又想要效果","试过很多方法都没用","信息太杂不知道信谁","新手完全没头绪","花了很多冤枉钱","时间太少没法坚持","害怕踩坑不敢下手","买回来发现根本用不上"];
var ANGLES=["用最少钱办最多事","三分钟就能上手","我踩过的坑你别踩","一次性讲透原理","把流程拆到不能再拆","用数据说话","从失败讲到成功","给出可直接抄的作业"];
var GOALTAIL={
  "涨粉":["",["结尾抛互动问题，引导评论区留言","做成系列的第一期，留钩子","强调「关注我看后续」"]],
  "收藏":["",["信息密度拉满，做成可保存的清单","提供可下载的模板或表格","标题直接写「建议收藏」"]],
  "互动":["",["抛出开放性问题","设置争议点引发讨论","邀请大家晒出自己的做法"]],
  "转化":["",["在价值给足后自然引出下一步","提供具体可执行的路径","用真实案例替代硬推销"]]
};
function genIdeas(){
  var tsel=$("itrack").value;
  var fsel=$("iform").value;
  var goal=$("igoal").value;
  var pool=tsel?TRACKS.filter(function(t){return t.k===tsel}):TRACKS;
  var forms=fsel?FORMS.filter(function(f){return f.k===fsel}):FORMS;
  var out=[];
  for(var i=0;i<6;i++){
    var tk=pick(pool),fm=pick(forms);
    var key=pick(tk.keys),pain=pick(PAINS),ang=pick(ANGLES),aud=pick(AUDS);
    var title=key+"｜"+ang+"的"+fm.n;
    var tail=goal&&GOALTAIL[goal]?pick(GOALTAIL[goal][1]):pick(["开篇直接给结论，不铺垫","正文分 3—5 点，每点配一张图","结尾给出下一步行动建议"]);
    var first=goal&&GOALTAIL[goal]?pick(["开头 2 行抓住痛点","用一句反常识结论开场","直接给出结果，再讲过程"]):pick(["开头 2 行抓住痛点","用一句反常识结论开场","直接给出结果，再讲过程"]);
    out.push({
      t:title,
      d:"赛道 "+tk.n+" ｜ 面向"+aud+" ｜ 痛点："+pain+"\n形态 "+fm.n+"："+fm.sk+"\n开头："+first+"\n结尾："+tail+"\n标签："+tk.tags.join(" ")
    });
  }
  var box=$("ilist");
  box.innerHTML=out.map(function(o,i){
    return '<div class="item">'
      +'<div class="idx">'+(i+1)+'</div>'
      +'<div class="body"><div class="tt">'+esc(o.t)+'</div><div class="ds" style="white-space:pre-wrap">'+esc(o.d)+'</div></div>'
      +'<div class="act"><button class="iconbtn" data-t="'+esc(o.t+"\n"+o.d)+'" title="复制">📋</button></div>'
      +'</div>';
  }).join("");
  Array.prototype.forEach.call(box.querySelectorAll(".iconbtn"),function(b){
    b.onclick=function(){doCopy(b.getAttribute("data-t"),"选题已复制")};
  });
}
$("igen").onclick=function(){genIdeas();toast("已生成 6 个选题")};
$("imore").onclick=function(){genIdeas()};
$("icopy").onclick=function(){
  var items=$("ilist").querySelectorAll(".item");
  if(!items.length){toast("请先生成选题");return}
  var arr=[];Array.prototype.forEach.call(items,function(e){
    arr.push(e.querySelector(".tt").textContent+"\n"+e.querySelector(".ds").textContent);
  });
  doCopy(arr.join("\n\n"),"已复制全部选题");
};
$("itoTitle").onclick=function(){
  var first=$("ilist").querySelector(".tt");
  if(!first){toast("请先生成选题");return}
  var kw=first.textContent.split("｜")[0];
  $("tkey").value=kw;
  switchTo("title");
  genTitles();
  toast("已带入关键词并生成标题");
};

/* ---------------- 封面排版 ---------------- */
var TPLS=[
  {k:"center",n:"居中大字"},
  {k:"left",n:"左对齐杂志"},
  {k:"split",n:"上下分层"},
  {k:"block",n:"色块标题"}
];
var COLORS=[
  {n:"番茄红",bg:"#FF2E4D",fg:"#FFFFFF",sub:"#FFE3E7"},
  {n:"暮山紫",bg:"#6C5CE7",fg:"#FFFFFF",sub:"#E2DEFA"},
  {n:"墨绿",bg:"#0F5C4A",fg:"#FFFFFF",sub:"#CFE9DF"},
  {n:"暖杏",bg:"#F6C86A",fg:"#3A2A08",sub:"#6B4E10"},
  {n:"雾霾蓝",bg:"#2D5B7A",fg:"#FFFFFF",sub:"#CFE0EC"},
  {n:"纯白极简",bg:"#FFFFFF",fg:"#1A1A1E",sub:"#6E6E7A",line:"#E6E6EC"}
];
var CUR_TPL="center",CUR_COLOR=0;
$("ktpls").innerHTML=TPLS.map(function(t,i){
  return '<button class="tpl'+(i===0?" on":"")+'" data-t="'+t.k+'">'+t.n+'</button>';
}).join("");
$("kcolors").innerHTML=COLORS.map(function(c,i){
  return '<div class="sw2'+(i===0?" on":"")+'" data-i="'+i+'" style="background:'+c.bg+'" title="'+c.n+'"></div>';
}).join("");
Array.prototype.forEach.call($("ktpls").querySelectorAll(".tpl"),function(b){
  b.onclick=function(){
    CUR_TPL=b.getAttribute("data-t");
    Array.prototype.forEach.call($("ktpls").querySelectorAll(".tpl"),function(x){x.classList.remove("on")});
    b.classList.add("on");drawCover();
  };
});
Array.prototype.forEach.call($("kcolors").querySelectorAll(".sw2"),function(b){
  b.onclick=function(){
    CUR_COLOR=parseInt(b.getAttribute("data-i"),10);
    Array.prototype.forEach.call($("kcolors").querySelectorAll(".sw2"),function(x){x.classList.remove("on")});
    b.classList.add("on");drawCover();
  };
});
function wrapText(ctx,text,maxW){
  var lines=[],cur="";
  for(var i=0;i<text.length;i++){
    var test=cur+text[i];
    if(ctx.measureText(test).width>maxW&&cur.length){lines.push(cur);cur=text[i]}
    else cur=test;
  }
  if(cur)lines.push(cur);
  return lines;
}
function drawCover(){
  var cv=$("cv"),ctx=cv.getContext("2d");
  var W=1080,H=1440;
  var c=COLORS[CUR_COLOR];
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=c.bg;ctx.fillRect(0,0,W,H);
  if(c.line){ctx.strokeStyle=c.line;ctx.lineWidth=3;
    ctx.strokeRect(70,70,W-140,H-140);}

  var main=($("kmain").value||"主标题").trim();
  var sub=($("ksub").value||"").trim();
  var font='"PingFang SC","Microsoft YaHei","Source Han Sans SC","Noto Sans CJK SC",sans-serif';

  if(CUR_TPL==="center"){
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillStyle=c.fg;
    var size=main.length<=5?150:main.length<=7?118:92;
    ctx.font="800 "+size+"px "+font;
    var lines=wrapText(ctx,main,W-180);
    var lh=size*1.22,total=lines.length*lh;
    var y=H/2-total/2+lh/2;
    lines.forEach(function(l){ctx.fillText(l,W/2,y);y+=lh});
    if(sub){
      ctx.globalAlpha=.45;ctx.fillStyle=c.sub;
      ctx.fillRect(W/2-60,H/2+total/2+46,120,4);ctx.globalAlpha=1;
      ctx.fillStyle=c.sub;ctx.font="500 52px "+font;
      var sl=wrapText(ctx,sub,W-240);
      var sy=H/2+total/2+142;
      sl.forEach(function(l){ctx.fillText(l,W/2,sy);sy+=66});
    }
  }else if(CUR_TPL==="left"){
    ctx.textAlign="left";ctx.textBaseline="top";
    ctx.fillStyle=c.fg;
    var s2=main.length<=5?130:main.length<=7?104:82;
    ctx.font="800 "+s2+"px "+font;
    var l2=wrapText(ctx,main,W-200),y2=380;
    l2.forEach(function(t){ctx.fillText(t,100,y2);y2+=s2*1.2});
    if(sub){ctx.fillStyle=c.sub;ctx.font="500 40px "+font;
      var s2l=wrapText(ctx,sub,W-200),sy2=y2+50;
      s2l.forEach(function(t){ctx.fillText(t,100,sy2);sy2+=54})}
    ctx.fillStyle=c.sub;ctx.fillRect(100,300,120,8);
  }else if(CUR_TPL==="split"){
    ctx.textAlign="left";ctx.textBaseline="alphabetic";
    ctx.fillStyle=c.sub;ctx.fillRect(0,H*0.62,W,6);
    ctx.fillStyle=c.fg;
    var s3=main.length<=6?124:main.length<=9?96:76;
    ctx.font="800 "+s3+"px "+font;
    var l3=wrapText(ctx,main,W-200),y3=340;
    l3.forEach(function(t){ctx.fillText(t,100,y3);y3+=s3*1.2});
    if(sub){ctx.fillStyle=c.sub;ctx.font="500 42px "+font;
      var s3l=wrapText(ctx,sub,W-200),sy3=H*0.62+110;
      s3l.forEach(function(t){ctx.fillText(t,100,sy3);sy3+=56})}
  }else{
    ctx.textAlign="left";ctx.textBaseline="top";
    var bh=210;
    ctx.fillStyle=c.fg;ctx.globalAlpha=.14;ctx.fillRect(0,430,W,bh+300);ctx.globalAlpha=1;
    ctx.fillStyle=c.fg;
    var s4=main.length<=5?126:main.length<=8?100:80;
    ctx.font="800 "+s4+"px "+font;
    var l4=wrapText(ctx,main,W-200),y4=480;
    l4.forEach(function(t){ctx.fillText(t,100,y4);y4+=s4*1.2});
    if(sub){ctx.fillStyle=c.sub;ctx.font="500 40px "+font;
      var s4l=wrapText(ctx,sub,W-200),sy4=y4+30;
      s4l.forEach(function(t){ctx.fillText(t,100,sy4);sy4+=54})}
  }
  // 底部标识
  ctx.textAlign="center";ctx.textBaseline="alphabetic";
  ctx.fillStyle=c.sub;ctx.globalAlpha=.75;
  ctx.font="600 32px "+font;
  ctx.fillText("爆款笔记工坊",W/2,H-110);
  ctx.globalAlpha=1;
}
$("kmain").addEventListener("input",drawCover);
$("ksub").addEventListener("input",drawCover);
$("krand").onclick=function(){
  var tk=pick(TRACKS);
  $("kmain").value=pick(tk.keys);
  $("kmain").value=$("kmain").value.slice(0,10);
  $("ksub").value=pick(["保姆级教程","避坑指南","新手必看","亲测有效","一次性讲透","真实测评","建议收藏","3 分钟上手"]);
  drawCover();toast("已随机换文案");
};
$("kdl").onclick=function(){
  drawCover();
  var url=$("cv").toDataURL("image/png");
  var a=document.createElement("a");
  a.href=url;a.download="封面_"+(($("kmain").value||"未命名")).replace(/[\\\/:*?"<>|]/g,"")+".png";
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  toast("封面已下载");
};

/* ---------------- Tab 切换 ---------------- */
function switchTo(p){
  Array.prototype.forEach.call($("tabs").querySelectorAll(".tab"),function(b){
    b.classList.toggle("on",b.getAttribute("data-p")===p);
  });
  Array.prototype.forEach.call(document.querySelectorAll(".panel"),function(s){
    s.classList.toggle("on",s.id==="p-"+p);
  });
  if(p==="cover")drawCover();
  if(history&&history.replaceState){try{history.replaceState(null,"","#"+p)}catch(e){}}
}
Array.prototype.forEach.call($("tabs").querySelectorAll(".tab"),function(b){
  b.onclick=function(){switchTo(b.getAttribute("data-p"))};
});

/* ---------------- 初始化 ---------------- */
var INITP=("check title format idea cover".split(" ")).indexOf((location.hash||"").replace(/^#/,""))>-1
  ? (location.hash||"").replace(/^#/,"") : "check";
if(INITP!=="check")switchTo(INITP);
runScan();
genTitles();
genIdeas();
drawCover();
