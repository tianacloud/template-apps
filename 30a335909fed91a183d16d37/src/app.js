const style=document.createElement("style"); style.textContent="\n  :root{\n    --sc-blue:#0473EA;\n    --sc-blue-dark:#0356b0;\n    --sc-teal:#00A9A5;\n    --ink:#0F2233;\n    --ink-soft:#2C4257;\n    --muted:#5E7590;\n    --line:#DCE6F2;\n    --line-soft:#EAF1F9;\n    --bg:#F4F8FC;\n    --card:#FFFFFF;\n    --ok:#0E8A4F;\n    --ok-bg:#E8F7EF;\n    --bad:#C42A42;\n    --bad-bg:#FDECEF;\n    --warn:#A9680A;\n    --warn-bg:#FFF6E6;\n    --radius:14px;\n    --shadow:0 1px 2px rgba(15,34,51,.05), 0 8px 24px rgba(15,34,51,.06);\n  }\n  *{box-sizing:border-box}\n  html,body{margin:0;padding:0}\n  body{\n    background:var(--bg);color:var(--ink);font-size:15px;line-height:1.6;\n    font-family:\"Segoe UI\",-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",Arial,\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n    -webkit-font-smoothing:antialiased;\n  }\n  .wrap{max-width:900px;margin:0 auto;padding:28px 20px 72px}\n  a{color:var(--sc-blue-dark)}\n\n  header.top{\n    background:linear-gradient(120deg,var(--sc-blue) 0%, #1E8FE0 45%, var(--sc-teal) 100%);\n    color:#fff;border-radius:18px;padding:26px 28px;\n    box-shadow:0 10px 30px rgba(4,115,234,.22);position:relative;overflow:hidden;\n  }\n  header.top::after{content:\"\";position:absolute;right:-60px;top:-70px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.10)}\n  header.top .kicker{font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;opacity:.88;margin:0 0 6px}\n  header.top h1{margin:0;font-size:24px;line-height:1.25;font-weight:700;letter-spacing:-.01em}\n  header.top p.sub{margin:8px 0 0;font-size:13.5px;opacity:.93;max-width:680px}\n  header.top .meta{margin-top:16px;display:flex;flex-wrap:wrap;gap:8px}\n  header.top .meta span{background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.24);padding:3px 10px;border-radius:99px;font-size:12px;font-weight:600}\n\n  .card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:22px 24px;margin-top:18px;box-shadow:var(--shadow)}\n  .card h2{margin:0 0 4px;font-size:17px;font-weight:700;letter-spacing:-.01em}\n  .card .hint{margin:0 0 16px;color:var(--muted);font-size:13px}\n\n  .field{margin-bottom:20px}\n  .field > label.flabel{display:block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--sc-blue-dark);margin-bottom:9px}\n  .chips{display:flex;flex-wrap:wrap;gap:9px}\n  .chip{\n    display:inline-flex;align-items:center;gap:8px;border:1.5px solid var(--line);background:#fff;\n    border-radius:10px;padding:9px 13px;font-size:13.5px;cursor:pointer;user-select:none;\n    transition:all .15s ease;font-weight:500;color:var(--ink-soft);\n  }\n  .chip:hover{border-color:#B9D3F2;background:#F7FBFF}\n  .chip input{display:none}\n  .chip .dot{width:15px;height:15px;border-radius:5px;border:1.5px solid #BDD0E4;display:inline-block;position:relative;flex:0 0 auto;background:#fff;transition:all .15s ease}\n  .chip.on{border-color:var(--sc-blue);background:#EFF7FF;color:var(--sc-blue-dark);font-weight:600}\n  .chip.on .dot{background:var(--sc-blue);border-color:var(--sc-blue)}\n  .chip.on .dot::after{content:\"\";position:absolute;left:4px;top:1px;width:4px;height:8px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(42deg)}\n  .chip .cnt{font-size:11.5px;color:var(--muted);font-weight:600}\n  .chip.on .cnt{color:var(--sc-blue)}\n\n  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;border-radius:11px;padding:12px 22px;font-size:14.5px;font-weight:700;cursor:pointer;transition:all .15s ease;font-family:inherit}\n  .btn-primary{background:var(--sc-blue);color:#fff;box-shadow:0 6px 16px rgba(4,115,234,.26)}\n  .btn-primary:hover{background:var(--sc-blue-dark);transform:translateY(-1px)}\n  .btn-primary:disabled{background:#C3D6E8;box-shadow:none;cursor:not-allowed;transform:none}\n  .btn-ghost{background:#fff;color:var(--sc-blue-dark);border:1.5px solid var(--line)}\n  .btn-ghost:hover{border-color:#B9D3F2;background:#F7FBFF}\n  .btn-teal{background:var(--sc-teal);color:#fff;box-shadow:0 6px 16px rgba(0,169,165,.24)}\n  .btn-teal:hover{background:#008B88;transform:translateY(-1px)}\n  .btn-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:4px}\n\n  table.cov{width:100%;border-collapse:collapse;font-size:13px}\n  table.cov th{\n    text-align:left;font-size:11px;letter-spacing:.07em;text-transform:uppercase;\n    color:var(--muted);font-weight:800;padding:0 10px 8px;border-bottom:1px solid var(--line);\n  }\n  table.cov td{padding:9px 10px;border-bottom:1px solid var(--line-soft);vertical-align:top}\n  table.cov tr.grp td{background:#F8FBFF;font-weight:800;font-size:12.5px;color:var(--sc-blue-dark);letter-spacing:.01em}\n  table.cov td.num{text-align:center;font-weight:700;white-space:nowrap;width:56px}\n  table.cov td.st{white-space:nowrap;width:96px}\n  .pill{display:inline-block;border-radius:99px;padding:2px 9px;font-size:11px;font-weight:800;letter-spacing:.02em}\n  .pill.ok{background:var(--ok-bg);color:var(--ok);border:1px solid #BEE8D2}\n  .pill.thin{background:var(--warn-bg);color:var(--warn);border:1px solid #F2DDAE}\n  .pill.none{background:var(--bad-bg);color:var(--bad);border:1px solid #F5C4CE}\n  .gaps{margin-top:18px;background:var(--warn-bg);border:1px solid #F2DDAE;border-radius:11px;padding:14px 16px}\n  .gaps h3{margin:0 0 6px;font-size:13.5px;font-weight:800;color:var(--warn)}\n  .gaps p{margin:0 0 8px;font-size:12.8px;color:#7A5310}\n  .gaps ul{margin:0;padding-left:18px;font-size:12.8px;color:#7A5310}\n  .gaps li{margin-bottom:4px}\n\n  .qbar{display:flex;align-items:center;gap:14px;margin-bottom:6px}\n  .qbar .track{flex:1;height:7px;background:var(--line-soft);border-radius:99px;overflow:hidden}\n  .qbar .fill{height:100%;background:linear-gradient(90deg,var(--sc-blue),var(--sc-teal));width:0;border-radius:99px;transition:width .3s ease}\n  .qbar .count{font-size:13px;font-weight:700;color:var(--muted);white-space:nowrap}\n  .scorepill{font-size:12.5px;font-weight:700;color:var(--sc-blue-dark);background:#EFF7FF;border:1px solid #CFE4FA;border-radius:99px;padding:3px 11px;white-space:nowrap}\n  .tags{display:flex;flex-wrap:wrap;gap:7px;margin:14px 0 10px}\n  .tag{border-radius:7px;padding:3px 9px;font-size:11.5px;font-weight:700;letter-spacing:.02em}\n  .tag-dom{background:#EAF4FF;color:var(--sc-blue-dark);border:1px solid #CFE4FA}\n  .tag-skill{background:#F6F1FF;color:#5A3BA8;border:1px solid #DED1FA}\n  .tag-multi{background:#E8F8F1;color:#0E7A55;border:1px solid #C6EBD9}\n  .tag-single{background:#F1F5F9;color:#526B84;border:1px solid #DFE7EF}\n\n  .qtext{font-size:17.5px;font-weight:600;line-height:1.5;margin:2px 0 6px;letter-spacing:-.005em}\n  .opts{list-style:none;margin:16px 0 0;padding:0;display:flex;flex-direction:column;gap:9px}\n  .opt{display:flex;gap:12px;align-items:flex-start;border:1.5px solid var(--line);border-radius:11px;padding:13px 15px;cursor:pointer;transition:all .14s ease;background:#fff}\n  .opt:hover{border-color:#B9D3F2;background:#FAFCFF}\n  .opt .mark{flex:0 0 auto;width:19px;height:19px;margin-top:1px;border:1.8px solid #BDD0E4;background:#fff;display:flex;align-items:center;justify-content:center;transition:all .14s ease}\n  .opt.single .mark{border-radius:50%}\n  .opt.multi .mark{border-radius:5px}\n  .opt .mark i{display:none;font-style:normal;font-weight:900;color:#fff;font-size:12px;line-height:1}\n  .opt .txt{font-size:14.5px;color:var(--ink-soft);line-height:1.5}\n  .opt.sel{border-color:var(--sc-blue);background:#F2F8FF}\n  .opt.sel .mark{background:var(--sc-blue);border-color:var(--sc-blue)}\n  .opt.sel .mark i{display:block}\n  .opt.locked{cursor:default}\n  .opt.locked:hover{border-color:var(--line);background:#fff}\n  .opt.correct{border-color:#79CEA6;background:var(--ok-bg)}\n  .opt.correct .mark{background:var(--ok);border-color:var(--ok)}\n  .opt.correct .mark i{display:block}\n  .opt.wrong{border-color:#F0AAB5;background:var(--bad-bg)}\n  .opt.wrong .mark{background:var(--bad);border-color:var(--bad)}\n  .opt.wrong .mark i{display:block}\n  .opt.neutral-locked{opacity:.72}\n\n  .feedback{margin-top:16px;border-radius:11px;padding:14px 16px;font-size:14px;border-left:4px solid var(--sc-blue);background:#F5FAFF}\n  .feedback.ok{border-left-color:var(--ok);background:var(--ok-bg)}\n  .feedback.bad{border-left-color:var(--bad);background:var(--bad-bg)}\n  .feedback .verdict{font-weight:800;font-size:14px;margin-bottom:5px}\n  .feedback.ok .verdict{color:var(--ok)}\n  .feedback.bad .verdict{color:var(--bad)}\n  .feedback .why{color:var(--ink-soft)}\n  .feedback .src{margin-top:10px;font-size:12.5px;color:var(--muted);display:flex;gap:6px;align-items:baseline;flex-wrap:wrap}\n  .feedback .src b{color:var(--sc-blue-dark);font-weight:700}\n  .feedback .src a{font-weight:700;text-decoration:none;border-bottom:1.5px solid #B9D3F2}\n  .feedback .src a:hover{border-bottom-color:var(--sc-blue)}\n  .nopartial{font-size:12px;color:var(--muted);margin-top:5px}\n\n  .hero-score{display:flex;flex-wrap:wrap;align-items:center;gap:22px}\n  .ring{--p:0;width:118px;height:118px;border-radius:50%;flex:0 0 auto;background:conic-gradient(var(--sc-blue) calc(var(--p)*1%), var(--line-soft) 0);display:flex;align-items:center;justify-content:center;position:relative}\n  .ring::before{content:\"\";position:absolute;inset:11px;background:#fff;border-radius:50%}\n  .ring .val{position:relative;font-size:27px;font-weight:800;color:var(--sc-blue-dark);letter-spacing:-.02em}\n  .scorecopy h2{margin:0 0 4px}\n  .scorecopy p{margin:0;color:var(--muted);font-size:13.5px}\n  .bars{margin-top:20px;display:flex;flex-direction:column;gap:11px}\n  .barrow{display:grid;grid-template-columns:1fr auto;gap:6px 12px;align-items:center}\n  .barrow .nm{font-size:13px;font-weight:600;color:var(--ink-soft)}\n  .barrow .numb{font-size:13px;font-weight:700;color:var(--muted)}\n  .barrow .track{grid-column:1 / -1;height:8px;background:var(--line-soft);border-radius:99px;overflow:hidden}\n  .barrow .fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--sc-blue),var(--sc-teal))}\n  .barrow .wt{font-size:11.5px;color:var(--muted);font-weight:600}\n\n  .revitem{border:1px solid var(--line);border-left:4px solid var(--ok);border-radius:10px;padding:13px 15px;margin-bottom:10px;background:#fff}\n  .revitem.miss{border-left-color:var(--bad);background:#FFFBFB}\n  .revitem .rq{font-size:14px;font-weight:600;margin:2px 0 8px;color:var(--ink)}\n  .revitem .line{font-size:13.5px;margin:3px 0;color:var(--ink-soft)}\n  .revitem .line b{color:var(--sc-blue-dark)}\n  .revitem .line.yours-bad b{color:var(--bad)}\n  .revitem .line.okay b{color:var(--ok)}\n  .revitem .rexp{font-size:12.8px;color:var(--muted);margin-top:7px;border-top:1px dashed var(--line);padding-top:7px}\n  .revitem .rsrc{margin-top:8px;font-size:12.5px}\n  .revitem .rsrc a{font-weight:700;text-decoration:none;border-bottom:1.5px solid #B9D3F2}\n  .revitem .rsrc a:hover{border-bottom-color:var(--sc-blue)}\n  .revitem .rtag{display:inline-block;background:#F6F1FF;color:#5A3BA8;border:1px solid #DED1FA;border-radius:6px;padding:1px 7px;font-size:11px;font-weight:700;margin-left:6px}\n\n  .sectiontitle{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--sc-blue-dark);margin:24px 0 10px;display:flex;align-items:center;gap:9px}\n  .sectiontitle::after{content:\"\";flex:1;height:1px;background:var(--line)}\n  footer.foot{margin-top:26px;text-align:center;font-size:12.5px;color:var(--muted)}\n  @media (max-width:640px){\n    .wrap{padding:18px 14px 60px}\n    header.top{padding:20px;border-radius:14px}\n    header.top h1{font-size:20px}\n    .card{padding:18px 16px}\n    .qtext{font-size:16px}\n    .ring{width:98px;height:98px}\n    table.cov{font-size:12px}\n  }\n"; document.head.appendChild(style);
document.getElementById("app").innerHTML="\n<div data-page-node-id=\"D10G2pqhLixRfgVglRJcrv\" class=\"wrap\">\n\n  <header data-page-node-id=\"m9IV5hIgyUyFlww79jsQCp\" class=\"top\">\n    <p data-page-node-id=\"x7NETwVnIm9FPp6LlOWYNT\" class=\"kicker\"><!--pnid:W3tUaMZebdNrVp0B2GITqs-->Microsoft Certified &middot; Exam AI-103</p>\n    <h1 data-page-node-id=\"a1OxvDoJ3B21jfjoHZJZQy\"><!--pnid:dhGXIXw4X4AEYwRaSh2xF4-->Develop AI Apps and Agents on Azure &mdash; Practice Quiz</h1>\n    <p data-page-node-id=\"CaUjtvkyVnMaIQL5jNJgsI\" class=\"sub\"><!--pnid:9z2Fp341OtYaiCmAAMmvpN-->Question bank organised by the five official exam domains and weighted to the published skill percentages. Every question is grounded in a module held in the knowledge base, and links straight back to it.</p>\n    <div data-page-node-id=\"cb577tU0kjmA861ywa14DV\" class=\"meta\">\n      <span data-page-node-id=\"A7zWbGKgVVinbnhMtfQksi\" id=\"bankSize\"><!--pnid:JuVHTyDzJTvQucvVHtoZji-->&mdash; questions in bank</span>\n      <span data-page-node-id=\"FT9hA6LLUrakxhFqfe7iCP\"><!--pnid:ppjZMFIOchM8zOpd3gyxQM-->5 exam domains</span>\n      <span data-page-node-id=\"aFAKWf7qUQsevhl7EnWaSC\"><!--pnid:NzPLYLwcaBL5KgaRXxqDF9-->Weighted sampling</span>\n      <span data-page-node-id=\"5PGTh9DQ1AezqsxIBcKXOR\"><!--pnid:VMabmtCqfQTqGS0c07DRe7-->Source links on every answer</span>\n    </div>\n  </header>\n\n  <!--pnid:oQN9XNqPFlgSXlSeov3nVq--><!-- ============ SETUP ============ -->\n  <section data-page-node-id=\"EUlxfGB3U9VayFMoGY3tDt\" class=\"card\" id=\"setup\">\n    <h2 data-page-node-id=\"fkIlZpfOED5DK3EJK1wco0\"><!--pnid:6YKg5sEy2vndqbUchuCpY0-->Build your test</h2>\n    <p data-page-node-id=\"rpL8V70VyOfG1VyMahDnsY\" class=\"hint\"><!--pnid:ub3CWxMEWM5IXCEF6pmglf-->Pick the exam domains to include, then choose how many questions. With weighted sampling on, the draw mirrors the real exam's skill distribution.</p>\n\n    <div data-page-node-id=\"zs45qOeB2SGFNqqj8xz1yn\" class=\"field\">\n      <label data-page-node-id=\"8OnZlm0VlwrTvt8Ls6w7Xy\" class=\"flabel\"><!--pnid:b4AUql1xC6hjQ17ZKtj14B-->Exam domains (with official weight)</label>\n      <div data-page-node-id=\"xWdltwowrkiziEmgOmpgAb\" class=\"chips\" id=\"domainChips\"></div>\n    </div>\n\n    <div data-page-node-id=\"TKAAuDYz4F1KcLhniRgACG\" class=\"field\">\n      <label data-page-node-id=\"hXgNls2UaClCC2AhwpcQkK\" class=\"flabel\"><!--pnid:DH4PNrWfxDWIFa7xf4RDUD-->Number of questions</label>\n      <div data-page-node-id=\"JeWi1GhYUhRpiWUN8Kcon8\" class=\"chips\" id=\"countChips\"></div>\n    </div>\n\n    <div data-page-node-id=\"7VQBymQCcoxE3PCUm17zrN\" class=\"field\" style=\"margin-bottom:6px\">\n      <label data-page-node-id=\"2AyPMBN1OB6vvB72T012kD\" class=\"flabel\"><!--pnid:NsBRtZbQkIlUosmKZigPqn-->Options</label>\n      <div data-page-node-id=\"FSzEdJ6UqkOFk9x02aqQcf\" class=\"chips\" id=\"modeChips\"></div>\n    </div>\n\n    <div data-page-node-id=\"W7ve3ftpUNcA7Wb48fYWXp\" class=\"btn-row\" style=\"margin-top:22px\">\n      <button data-page-node-id=\"ESe2DLZxUIX3nptcGb8xgn\" class=\"btn btn-primary\" id=\"startBtn\"><!--pnid:lK2nbh9xVeRfxZehaqboJJ-->Start test</button>\n      <span data-page-node-id=\"lGYCPRIItDoHe69TSPrc1g\" id=\"poolInfo\" style=\"font-size:13px; color:var(--muted)\"></span>\n    </div>\n\n    <div data-page-node-id=\"SMplSjaFAFdAm5kQL0Kmvr\" class=\"sectiontitle\"><!--pnid:XnYPphVXjoYzTPzgd5gpF8-->Coverage against the official study guide</div>\n    <table data-page-node-id=\"9POx16omGfKyLczVBFBaPP\" class=\"cov\" id=\"covTable\"></table>\n    <div data-page-node-id=\"uGHyoMDJ0GNLHRmbDrrzo7\" class=\"gaps\" id=\"gapsBox\"></div>\n  </section>\n\n  <!--pnid:KTtMzPNnBasxLe4s3CvoXf--><!-- ============ QUIZ ============ -->\n  <section data-page-node-id=\"U37uUa3nFCGRGJv8EBp5pV\" hidden id=\"quiz\">\n    <div data-page-node-id=\"XFWds4jIfiAfvFB4a8LZvg\" class=\"card\">\n      <div data-page-node-id=\"jBdnxbt3OCJ7Qb6Qhv7abO\" class=\"qbar\">\n        <span data-page-node-id=\"TN8ait3SxG4Zx8ofIFG9D5\" class=\"count\" id=\"qCount\"><!--pnid:b8qNcu7xbYpWKpMQustv0f-->1 / 25</span>\n        <div data-page-node-id=\"lUgE0DgTy5cmvI2Zo3hOAv\" class=\"track\"><div data-page-node-id=\"1EViXoiTzf1TlcyDid5k3X\" class=\"fill\" id=\"qFill\"></div></div>\n        <span data-page-node-id=\"FmgH83pNpVs0tovGXNorPx\" class=\"scorepill\" id=\"qScore\"><!--pnid:JUcUdclvv8FJnYUZdnjSdD-->Score 0</span>\n      </div>\n\n      <div data-page-node-id=\"2S1VnNXoTsMAhm6ICoamtd\" class=\"tags\" id=\"qTags\"></div>\n      <p data-page-node-id=\"41kJW6OR1j0rqz8OfXgdQS\" class=\"qtext\" id=\"qText\"></p>\n      <ul data-page-node-id=\"1XYt8FwhkiyOgTdXKmLiMO\" class=\"opts\" id=\"qOpts\"></ul>\n\n      <div data-page-node-id=\"dSkLUAh2mghK6zjujounJG\" id=\"qFeedback\"></div>\n\n      <div data-page-node-id=\"lm7MJBFCGUhLaeKsARLEhX\" class=\"btn-row\" style=\"margin-top:18px\">\n        <button data-page-node-id=\"7q6MHiFIi31Q9ui2Z8fJfQ\" class=\"btn btn-primary\" disabled id=\"actionBtn\"><!--pnid:YwkK5g7Hk8RWOSQ9fCblyG-->Check answer</button>\n        <button data-page-node-id=\"26xUjBlOycyeJ9qGesPedq\" class=\"btn btn-ghost\" id=\"quitBtn\"><!--pnid:QkrzNR9P6g35BF3xFWKG7c-->End test</button>\n      </div>\n    </div>\n  </section>\n\n  <!--pnid:SPowo5lYZ5wDzpCg6AC34b--><!-- ============ RESULT ============ -->\n  <section data-page-node-id=\"C91KUI5EZGAMmQgaFOhLc1\" hidden id=\"result\">\n    <div data-page-node-id=\"m7xzJ35czwfdIp6RNGZpkD\" class=\"card\">\n      <div data-page-node-id=\"L3rRxaZ5Eijwl7YHMoNJoO\" class=\"hero-score\">\n        <div data-page-node-id=\"snDxeIKy4AvEsUZXYVUoQx\" class=\"ring\" id=\"ring\"><span data-page-node-id=\"06vhE56V221mwiF9nShBi0\" class=\"val\" id=\"ringVal\"><!--pnid:OCGicttd3zUOqRZmInvJAY-->0%</span></div>\n        <div data-page-node-id=\"KaUqghCWuTzlXPqfUCX82Z\" class=\"scorecopy\">\n          <h2 data-page-node-id=\"blSwUOj1HyWheEGMqH4a5U\" id=\"resHead\"><!--pnid:XmQlPx5csMwh9Jcl0gTuji-->Result</h2>\n          <p data-page-node-id=\"5kQde5Kz2GOwIxgIzECXUE\" id=\"resSub\"></p>\n        </div>\n      </div>\n      <div data-page-node-id=\"03hUyVyD2exFKnIrXN9XW2\" class=\"bars\" id=\"resBars\"></div>\n      <div data-page-node-id=\"WMbw2ZmbtNAd1N4wLUgaZy\" class=\"btn-row\" style=\"margin-top:22px\">\n        <button data-page-node-id=\"TdgqkSEL4mic7hCcuHEC1i\" class=\"btn btn-primary\" id=\"againBtn\"><!--pnid:IagdMdZ9yKqUqtN32an80m-->New random test</button>\n        <button data-page-node-id=\"PmmZ8FMDtTcdOwqYpbySkI\" class=\"btn btn-teal\" id=\"missedBtn\"><!--pnid:bxhCUfVgXghWmK3rVonEKH-->Retry missed only</button>\n        <button data-page-node-id=\"PmjLIl7nvQe4cU1UeEd7oe\" class=\"btn btn-ghost\" id=\"backBtn\"><!--pnid:FcZJT1JR3Ikb2kTabs5bBn-->Change settings</button>\n      </div>\n    </div>\n    <div data-page-node-id=\"MZCobNaBJ128MSyYZKVZBE\" class=\"card\">\n      <div data-page-node-id=\"CQLZpPwjgrqqzpgE1rW6SJ\" class=\"sectiontitle\" style=\"margin-top:0\"><!--pnid:uOcPGgfPYd6RCIkdFmR0JF-->Answer review &amp; source links</div>\n      <div data-page-node-id=\"S32R26W8mdTo433K4HMPc1\" class=\"review\" id=\"resReview\"></div>\n    </div>\n  </section>\n\n  <footer data-page-node-id=\"58KXnrUeRDVZZC13xZskVJ\" class=\"foot\"><!--pnid:LyCKThljlKArlA53Y4sqYH-->\n    Bank grounded in the ima knowledge base &laquo;&#24494;&#36719;&#35748;&#35777;ai-103&raquo; &middot; Domains and weights from the official <a data-page-node-id=\"mUbSTek26JWxcLqqSjSRQN\" href=\"https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-103\" rel=\"noopener\" target=\"_blank\"><!--pnid:m203wpcLVIUaOQhGMTWiSg-->AI-103 study guide</a><!--pnid:ZPEMmEborE3cBDX3dUrCls--> (skills measured as of 16 April 2026).\n  </footer>\n</div>\n\n";

/* =========================================================
   1. OFFICIAL EXAM STRUCTURE
   Source: AI-103 study guide, "Skills measured as of April 16, 2026"
   ========================================================= */
const EXAMS = {
  E1:{n:"Plan and manage an Azure AI solution", w:"25\u201330%", mid:27.5},
  E2:{n:"Implement generative AI and agentic solutions", w:"30\u201335%", mid:32.5},
  E3:{n:"Implement computer vision solutions", w:"10\u201315%", mid:12.5},
  E4:{n:"Implement text analysis solutions", w:"10\u201315%", mid:12.5},
  E5:{n:"Implement information extraction solutions", w:"10\u201315%", mid:12.5}
};

const SKILLS = {
  E1a:{d:"E1",n:"Choose the appropriate Foundry services for generative AI and agents"},
  E1b:{d:"E1",n:"Set up AI solutions in Foundry"},
  E1c:{d:"E1",n:"Manage, monitor, and secure AI systems"},
  E1d:{d:"E1",n:"Implement responsible AI across generative AI and agentic systems"},
  E2a:{d:"E2",n:"Build generative applications by using Foundry"},
  E2b:{d:"E2",n:"Build agents by using Foundry"},
  E2c:{d:"E2",n:"Optimize and operationalize generative AI systems"},
  E3a:{d:"E3",n:"Design and implement image- and video-generation solutions"},
  E3b:{d:"E3",n:"Design and implement multimodal understanding workflows"},
  E3c:{d:"E3",n:"Implement responsible AI for multimodal content"},
  E4a:{d:"E4",n:"Apply language model text analysis"},
  E4b:{d:"E4",n:"Implement speech solutions"},
  E5a:{d:"E5",n:"Build retrieval and grounding pipelines"},
  E5b:{d:"E5",n:"Extract content from documents"}
};

/* Study-guide skill areas with little or no matching material in the knowledge base. */
const GAPS = [
  ["E1c","Quotas, scaling, rate limits and cost footprint; model drift and safety-event monitoring; data-ingestion quality, index health and relevance; managed identity, private networking, keyless credentials and role policies; CI/CD integration of Foundry projects."],
  ["E2c","Model reflection, chain-of-thought evaluation and self-critique loops; observability through tracing, token analytics, safety signals and latency breakdowns."],
  ["E3c","All of it \u2014 visual safety filters, indirect prompt injection via text embedded in images, watermarks, prohibited-symbol flagging and brand-usage rules."],
  ["E5a","Configuring semantic, hybrid and vector search; OCR-based RAG ingestion pipelines."],
  ["E3b","Captioning modes (concise vs detailed, single vs multiple images), alt-text and accessibility descriptions, video-segment analysis, single-task vs pro-mode Content Understanding pipelines, object/region identification."]
];

/* =========================================================
   2. SOURCE MODULES (title + canonical Microsoft Learn URL)
   ========================================================= */
const MOD = {
  prep:      ["Plan and Prepare to Develop AI Solutions on Azure","https://learn.microsoft.com/en-us/training/modules/prepare-azure-ai-development/"],
  chat:      ["Develop a generative AI chat app with Microsoft Foundry","https://learn.microsoft.com/en-us/training/modules/foundry-sdk/"],
  genaitools:["Develop generative AI apps that use tools","https://learn.microsoft.com/en-us/training/modules/use-generative-ai-tools/"],
  models:    ["Select, deploy, and evaluate Microsoft Foundry models","https://learn.microsoft.com/en-us/training/modules/model-catalog-evaluate/"],
  optim:     ["Optimize generative AI model performance with Microsoft Foundry","https://learn.microsoft.com/en-us/training/modules/optimize-generative-ai-model-performance/"],
  resp:      ["Implement a responsible generative AI solution in Microsoft Foundry","https://learn.microsoft.com/en-us/training/modules/responsible-ai-studio/"],
  iq:        ["Build knowledge-enhanced AI agents with Foundry IQ","https://learn.microsoft.com/en-us/training/modules/introduction-foundry-iq/"],
  agentvscode:["Develop AI agents with Microsoft Foundry and Visual Studio Code","https://learn.microsoft.com/en-us/training/modules/develop-ai-agents-azure-vs-code/"],
  af:        ["Develop an AI agent with Microsoft Agent Framework","https://learn.microsoft.com/en-us/training/modules/develop-ai-agent-with-semantic-kernel/"],
  wf:        ["Get started with building agent-driven workflows using Microsoft Foundry","https://learn.microsoft.com/en-us/training/modules/build-agent-workflows-microsoft-foundry/"],
  custom:    ["Integrate custom tools into your agent","https://learn.microsoft.com/en-us/training/modules/build-agent-with-custom-tools/"],
  mcptools:  ["Integrate MCP Tools with Azure AI Agents","https://learn.microsoft.com/en-us/training/modules/connect-agent-to-mcp-tools/"],
  a2a:       ["Discover Azure AI Agents with A2A","https://learn.microsoft.com/en-us/training/modules/discover-agents-with-a2a/"],
  orchest:   ["Orchestrate a multi-agent solution using the Microsoft Agent Framework","https://learn.microsoft.com/en-us/training/modules/orchestrate-semantic-kernel-multi-agent-solution/"],
  m365:      ["Integrate your agent with Microsoft 365","https://learn.microsoft.com/en-us/training/modules/integrate-foundry-agent-with-m365/"],
  text:      ["Analyze text with Azure Language in Foundry Tools","https://learn.microsoft.com/en-us/training/modules/analyze-text-ai-language/"],
  textmcp:   ["Develop a text analysis agent with the Azure Language MCP server","https://learn.microsoft.com/en-us/training/modules/develop-text-analysis-agent-language-mcp/"],
  speech:    ["Create speech-enabled apps with Azure Speech in Microsoft Foundry Tools","https://learn.microsoft.com/en-us/training/modules/create-speech-enabled-apps/"],
  speechmcp: ["Develop a Speech Agent with the Azure Speech MCP Server","https://learn.microsoft.com/en-us/training/modules/develop-speech-agent-speech-mcp/"],
  voicelive: ["Develop an Azure Speech Voice Live Agent in Microsoft Foundry","https://learn.microsoft.com/en-us/training/modules/develop-voice-live-agent/"],
  speechgen: ["Develop a speech-capable generative AI application","https://learn.microsoft.com/en-us/training/modules/develop-generative-ai-audio-apps/"],
  translate: ["Translate text and speech with Microsoft Foundry Tools","https://learn.microsoft.com/en-us/training/modules/translate-text-speech/"],
  cu:        ["Create a multimodal analysis solution with Azure Content Understanding","https://learn.microsoft.com/en-us/training/modules/analyze-content-ai/"],
  cuapi:     ["Create an Azure Content Understanding client application","https://learn.microsoft.com/en-us/training/modules/analyze-content-ai-api/"],
  cuimg:     ["Analyze images with Content Understanding","https://learn.microsoft.com/en-us/training/modules/analyze-images-with-content-understanding/"],
  vision:    ["Develop a vision-enabled generative AI application","https://learn.microsoft.com/en-us/training/modules/develop-generative-ai-vision-apps/"],
  img:       ["Generate images with AI","https://learn.microsoft.com/en-us/training/modules/generate-images-azure-openai/"],
  video:     ["Generate videos with Microsoft Foundry","https://learn.microsoft.com/en-us/training/modules/generate-video-with-foundry/"],
  docint:    ["Extract data with Azure Document Intelligence","https://learn.microsoft.com/en-us/training/modules/extract-data-with-document-intelligence/"],
  km:        ["Create a knowledge mining solution with Azure AI Search","https://learn.microsoft.com/en-us/training/modules/ai-knowldge-mining/"],
  course:    ["Course AI-103T00-A: Develop AI apps and agents on Azure","https://learn.microsoft.com/en-us/training/courses/ai-103t00"]
};

/* =========================================================
   3. QUESTION BANK
   d = exam domain | g = skill area | t = single|multi
   m = source module key | o = options | k = correct option indices
   ========================================================= */
const BANK = [
/* ---------- E1a ---------- */
{d:"E1",g:"E1a",t:"single",m:"prep",q:"Microsoft Foundry is best described as...",
 o:["a platform for building AI apps and agents, including a model catalogue and agent service","a relational database service","a CI/CD pipeline service","a virtual machine hosting service"],k:[0],
 e:"Foundry is the Azure platform for building AI applications and agents."},

{d:"E1",g:"E1a",t:"single",m:"agentvscode",q:"Which Microsoft Foundry capability provides a managed platform for building, testing, and deploying AI agents?",
 o:["Foundry Agent Service","Azure AI Search","Azure Document Intelligence","Azure Machine Learning"],k:[0],
 e:"Foundry Agent Service is the managed agent platform used throughout the agent modules."},

{d:"E1",g:"E1a",t:"single",m:"text",q:"Which Foundry Tool extracts semantic information such as entities and PII from text?",
 o:["Azure Language","Azure Speech","Azure Translator","Azure Document Intelligence"],k:[0],
 e:"Azure Language creates apps that extract semantic information from text."},

{d:"E1",g:"E1a",t:"single",m:"translate",q:"Which Foundry Tool is used to translate text between languages?",
 o:["Azure Translator","Azure Language","Azure Speech","Azure Content Understanding"],k:[0],
 e:"Objective: use Azure Translator in Foundry Tools to translate text."},

{d:"E1",g:"E1a",t:"single",m:"translate",q:"Which Foundry Tool is used to translate speech?",
 o:["Azure Speech","Azure Translator","Azure Language","Azure Document Intelligence"],k:[0],
 e:"Objective: use Azure Speech in Foundry Tools to translate speech."},

{d:"E1",g:"E1a",t:"single",m:"docint",q:"Which Foundry Tool uses OCR and deep learning models to extract text, key-value pairs, and tables from forms and documents?",
 o:["Azure Document Intelligence","Azure Content Understanding","Azure Language","Azure AI Search"],k:[0],
 e:"Azure Document Intelligence uses OCR and deep learning models for document extraction."},

{d:"E1",g:"E1a",t:"single",m:"video",q:"Which model does Microsoft Foundry use to generate videos from text prompts?",
 o:["Sora 2","DALL-E 3","GPT-4o","Whisper"],k:[0],
 e:"The module generates videos from text prompts with Sora 2 in Microsoft Foundry."},

{d:"E1",g:"E1a",t:"multi",m:"prep",q:"Which of the following are Foundry Tools referenced across the AI-103 learning paths? (Select all that apply)",
 o:["Azure Language","Azure Speech","Azure Document Intelligence","Azure Translator","Azure Kubernetes Service","Azure Logic Apps"],k:[0,1,2,3],
 e:"The Foundry Tools in these paths are Azure Language, Azure Speech, Azure Translator, and Azure Document Intelligence."},

{d:"E1",g:"E1a",t:"multi",m:"iq",q:"Foundry IQ knowledge bases can be configured with which data sources? (Select all that apply)",
 o:["Azure AI Search","Azure Blob Storage","SharePoint","Microsoft OneLake","Azure Cosmos DB"],k:[0,1,2,3],
 e:"Objective: configure data sources for knowledge bases including Azure AI Search, Blob Storage, SharePoint, and OneLake."},

{d:"E1",g:"E1a",t:"single",m:"optim",q:"A product catalogue that your app must answer questions about is updated every week. Which approach keeps the model's answers current?",
 o:["Retrieval Augmented Generation (RAG)","Fine-tuning the model every week","Few-shot prompting with fixed examples","Lowering the model temperature"],k:[0],
 e:"RAG supplies current content at run time, so updated data is reflected without retraining. Fine-tuning changes behaviour rather than knowledge freshness."},

{d:"E1",g:"E1a",t:"single",m:"vision",q:"Which model category would you choose for a single request that must read an invoice image and answer questions about it?",
 o:["A multimodal model","A small language model","A code model","An embedding model"],k:[0],
 e:"Multimodal generative AI models interpret images to respond to visual prompts."},

{d:"E1",g:"E1a",t:"multi",m:"prep",q:"Which are learning objectives of 'Plan and prepare to develop AI solutions on Azure'? (Select all that apply)",
 o:["Identify common AI capabilities you can implement in applications","Describe Microsoft Foundry and considerations for using it","Identify appropriate developer tools and SDKs for an AI project","Describe considerations for responsible AI","Train a custom foundation model from scratch"],k:[0,1,2,3],
 e:"The module covers AI capabilities, Foundry, Foundry Tools, developer tools and SDKs, and responsible AI."},

/* ---------- E1b ---------- */
{d:"E1",g:"E1b",t:"single",m:"models",q:"In Microsoft Foundry, where do you browse and filter available models before deploying one?",
 o:["The model catalogue","The Images playground","Document Intelligence Studio","Azure API Management"],k:[0],
 e:"Objective: explore and filter models in the model catalogue."},

{d:"E1",g:"E1b",t:"single",m:"models",q:"After selecting a model in the catalogue, what is the next step before testing it in the playground?",
 o:["Deploy the model to an endpoint","Fine-tune the model","Create a content filter","Register an application in Microsoft Entra ID"],k:[0],
 e:"Objective: deploy a model to an endpoint and test it in the playground."},

{d:"E1",g:"E1b",t:"single",m:"chat",q:"In Microsoft Foundry, what is used to organise the models, resources, and data for an AI solution?",
 o:["A Foundry project","A resource group tag","A Log Analytics workspace","An API Management instance"],k:[0],
 e:"Foundry projects organise the models, resources, and data used to develop an AI solution; the chat app module builds applications with projects and the Responses API."},

{d:"E1",g:"E1b",t:"single",m:"vision",q:"What must you do before building a vision-based chat app?",
 o:["Deploy a vision-enabled generative AI model","Create an Azure AI Search index","Train a custom Document Intelligence model","Provision a Speech resource"],k:[0],
 e:"Objective: deploy a vision-enabled generative AI model in Microsoft Foundry."},

{d:"E1",g:"E1b",t:"single",m:"speechgen",q:"What must you do first to build a speech-capable generative AI application?",
 o:["Deploy speech-capable generative AI models in Microsoft Foundry","Create a knowledge store","Provision an Azure SQL database","Write a Power Fx expression"],k:[0],
 e:"Objective: deploy speech-capable generative AI models in Microsoft Foundry."},

{d:"E1",g:"E1b",t:"single",m:"speech",q:"Which resource type does the Azure Speech module use in Foundry Tools?",
 o:["A Microsoft Foundry resource","An Azure Kubernetes cluster","An Azure SQL database","An Azure Logic App"],k:[0],
 e:"Objective: use a Microsoft Foundry resource for Azure Speech in Foundry Tools."},

{d:"E1",g:"E1b",t:"single",m:"speechmcp",q:"Which storage service must be set up for audio file input and output when an agent uses the Speech MCP server?",
 o:["Azure Blob Storage","Azure Files","Azure Queue Storage","Azure Table Storage"],k:[0],
 e:"Objective: set up Azure Blob Storage for audio file input and output."},

/* ---------- E1c ---------- */
{d:"E1",g:"E1c",t:"single",m:"iq",q:"Once an agent's knowledge retrieval is live, which activity does the Foundry IQ module require in order to maintain quality?",
 o:["Test and monitor agent retrieval","Disable logging to reduce cost","Retrain the embedding model weekly","Switch to a larger model monthly"],k:[0],
 e:"Objective: test and monitor agent retrieval to maintain quality in production."},

{d:"E1",g:"E1c",t:"single",m:"models",q:"Besides 'Develop generative AI apps in Azure', which second learning path does the model selection module belong to?",
 o:["Monitor AI workloads on Azure","Extract insights from visual data on Azure","Develop natural language solutions in Azure","Develop AI agents on Azure"],k:[0],
 e:"The module is listed under both 'Develop generative AI apps in Azure' and 'Monitor AI workloads on Azure'."},

{d:"E1",g:"E1c",t:"single",m:"models",q:"Monitoring a deployed model's grounding quality falls under which exam skill area?",
 o:["Manage, monitor, and secure AI systems","Design and implement image generation","Extract content from documents","Implement speech solutions"],k:[0],
 e:"The study guide places monitoring of model performance, drift, safety events, and grounding quality under 'Manage, monitor, and secure AI systems'."},

/* ---------- E1d ---------- */
{d:"E1",g:"E1d",t:"multi",m:"resp",q:"Which activities form part of the responsible generative AI process taught in the module? (Select all that apply)",
 o:["Identify and prioritise potential harms","Measure the presence of harms","Mitigate harms","Retrain the foundation model from scratch","Disable all content filters in production"],k:[0,1,2],
 e:"The process covers planning, identifying and prioritising harms, measuring harms, mitigating harms, and operating responsibly."},

{d:"E1",g:"E1d",t:"single",m:"resp",q:"What does the responsible AI module's hands-on exercise focus on?",
 o:["Applying guardrails to prevent the output of harmful content","Tuning the model's temperature","Indexing documents in Azure AI Search","Generating product images"],k:[0],
 e:"The exercise is titled 'Apply guardrails to prevent the output of harmful content'."},

{d:"E1",g:"E1d",t:"single",m:"resp",q:"According to the module, what must a responsible generative AI implementation minimise?",
 o:["The risk of harmful content generation","The number of deployed models","The size of the training corpus","The number of API calls"],k:[0],
 e:"Generative AI must be implemented responsibly to minimise the risk of harmful content generation."},

{d:"E1",g:"E1d",t:"multi",m:"resp",q:"Which are learning objectives of 'Implement a responsible generative AI solution in Microsoft Foundry'? (Select all that apply)",
 o:["Identify and prioritise potential harms","Measure the presence of harms","Mitigate harms","Prepare to deploy and operate a solution responsibly","Train a custom content classifier from scratch"],k:[0,1,2,3],
 e:"Objectives cover identifying and prioritising harms, measuring harms, mitigating harms, and preparing to deploy and operate responsibly."},

{d:"E1",g:"E1d",t:"single",m:"resp",q:"In the module's process, which stage follows measuring potential harms?",
 o:["Mitigate harms","Re-measure harms","Deploy to production","Collect new training data"],k:[0],
 e:"The unit order is: plan, map harms, measure harms, mitigate harms, operate responsibly."},

{d:"E1",g:"E1d",t:"single",m:"prep",q:"In the planning module, responsible AI is presented as...",
 o:["a consideration to build into the project from the start","an optional feature enabled after deployment","a billing setting","a networking configuration"],k:[0],
 e:"Objective: describe considerations for responsible AI as part of planning and preparing an AI solution."},

/* ---------- E2a ---------- */
{d:"E2",g:"E2a",t:"single",m:"chat",q:"Which API does the module cover, alongside the ChatCompletions API, for generating AI responses in a Microsoft Foundry chat app?",
 o:["Responses API","Embeddings API","Batch API","Translations API"],k:[0],
 e:"The module teaches generating responses with both the Responses API and the ChatCompletions API."},

{d:"E2",g:"E2a",t:"single",m:"chat",q:"Which surface in the Microsoft Foundry portal lets you explore a model and generate code samples before you write your app?",
 o:["Chat playground","Model catalogue","Content filters","Evaluations"],k:[0],
 e:"Objective: use the Chat playground to explore models and generate code samples."},

{d:"E2",g:"E2a",t:"single",m:"chat",q:"When starting a Foundry chat app, which three things must you choose for your app development?",
 o:["An endpoint, an authentication method, and a client SDK","A region, a quota, and a deployment name","A model family, a token limit, and a temperature","A subscription, a resource group, and a pricing tier"],k:[0],
 e:"Objective: choose an endpoint, authentication method, and client SDK for your app development."},

{d:"E2",g:"E2a",t:"multi",m:"genaitools",q:"Which built-in tools are covered in 'Develop generative AI apps that use tools'? (Select all that apply)",
 o:["code_interpreter","web_search","file_search","function","text_translator","image_captioner"],k:[0,1,2,3],
 e:"Exactly four tools are covered: code_interpreter, web_search, file_search, and the function tool."},

{d:"E2",g:"E2a",t:"single",m:"genaitools",q:"Which tool runs code and analyses data on behalf of the model?",
 o:["code_interpreter","web_search","file_search","function"],k:[0],
 e:"The code_interpreter tool lets the model run code and analyse data."},

{d:"E2",g:"E2a",t:"single",m:"genaitools",q:"Which tool retrieves real-time information from the internet?",
 o:["web_search","file_search","code_interpreter","function"],k:[0],
 e:"The web_search tool retrieves real-time information from the internet."},

{d:"E2",g:"E2a",t:"single",m:"genaitools",q:"Which tool gives the model access to, and analysis of, your files?",
 o:["file_search","web_search","code_interpreter","function"],k:[0],
 e:"The file_search tool lets the model access and analyse files."},

{d:"E2",g:"E2a",t:"single",m:"genaitools",q:"Which tool lets the model run your own custom code?",
 o:["function","code_interpreter","file_search","web_search"],k:[0],
 e:"The function tool runs custom code that you define."},

{d:"E2",g:"E2a",t:"single",m:"models",q:"Which two approaches does the module describe for evaluating model performance?",
 o:["Manual and automated","Static and dynamic","Offline and on-premises","Supervised and unsupervised"],k:[0],
 e:"Objective: evaluate model performance using manual and automated approaches."},

/* ---------- E2b ---------- */
{d:"E2",g:"E2b",t:"single",m:"agentvscode",q:"Which development surfaces are used to build and manage agents in this module?",
 o:["The Microsoft Foundry portal and the Foundry extension for Visual Studio Code","Azure Data Factory pipelines","Power BI workspaces","Azure DevOps only"],k:[0],
 e:"The module builds agents through both the Azure portal and the Visual Studio Code extension."},

{d:"E2",g:"E2b",t:"multi",m:"agentvscode",q:"Which capabilities can be added to an agent according to this module? (Select all that apply)",
 o:["Tools","Functions","Deployment and integration into applications","Automatic Azure subscription provisioning"],k:[0,1,2],
 e:"Objectives cover extending agent capabilities with tools and functions, then deploying and integrating agents into applications."},

{d:"E2",g:"E2b",t:"single",m:"agentvscode",q:"What is used to test an agent during development in Microsoft Foundry?",
 o:["Integrated playgrounds","A production endpoint only","Azure Load Testing","Azure Policy"],k:[0],
 e:"Objective: test agents using integrated playgrounds."},

{d:"E2",g:"E2b",t:"single",m:"iq",q:"How does Foundry IQ differ from a single agent's private index?",
 o:["It provides a shared knowledge platform that multiple agents can access","It supports only one agent per knowledge base","It stores data as unstructured blobs only","It replaces Azure AI Search entirely"],k:[0],
 e:"Foundry IQ is described as a shared knowledge platform that multiple agents can access."},

{d:"E2",g:"E2b",t:"single",m:"iq",q:"In Foundry IQ, agent instructions are configured to control what?",
 o:["Retrieval behaviour and to ensure consistent citations","The agent's deployment region","The model's token price","The storage account's redundancy tier"],k:[0],
 e:"Objective: configure agent instructions to control retrieval behaviour and ensure consistent citations."},

{d:"E2",g:"E2b",t:"multi",m:"wf",q:"Which elements control workflow execution? (Select all that apply)",
 o:["Nodes","Variables","Agent outputs","Resource groups"],k:[0,1,2],
 e:"Objective: explain how nodes, variables, and agent outputs control workflow execution."},

{d:"E2",g:"E2b",t:"single",m:"wf",q:"Which workflow node type loops over multiple inputs?",
 o:["For-Each node","Conditional node","Escalation node","Aggregate node"],k:[0],
 e:"Objective: loop over multiple inputs with For-Each nodes."},

{d:"E2",g:"E2b",t:"single",m:"wf",q:"Which expression language is used in Microsoft Foundry workflows to manipulate data and control flow?",
 o:["Power Fx","DAX","Kusto Query Language","PowerShell"],k:[0],
 e:"Objective: utilise Power Fx expressions to manipulate data and control flow."},

{d:"E2",g:"E2b",t:"single",m:"wf",q:"Which pattern does the workflow module recommend for low-confidence items?",
 o:["Human-in-the-loop and escalation","Silent auto-approval","Retry indefinitely","Discard the item"],k:[0],
 e:"Objective: use human-in-the-loop and escalation patterns for low-confidence items."},

{d:"E2",g:"E2b",t:"single",m:"wf",q:"Which technique is used to route requests based on structured outputs?",
 o:["Conditional logic","Variable scoping","Content filtering","Model fine-tuning"],k:[0],
 e:"Objective: route requests using structured outputs and conditional logic."},

{d:"E2",g:"E2b",t:"multi",m:"orchest",q:"Which orchestration patterns are covered by the Microsoft Agent Framework module? (Select all that apply)",
 o:["Concurrent orchestration","Sequential orchestration","Group chat orchestration","Handoff orchestration","Magentic orchestration","Map-reduce orchestration"],k:[0,1,2,3,4],
 e:"The module covers concurrent, sequential, group chat, handoff, and Magentic orchestration."},

{d:"E2",g:"E2b",t:"single",m:"orchest",q:"Which orchestration pattern runs several agents in parallel and then combines their results?",
 o:["Concurrent orchestration","Sequential orchestration","Handoff orchestration","Magentic orchestration"],k:[0],
 e:"Concurrent orchestration runs agents in parallel and aggregates their outputs."},

{d:"E2",g:"E2b",t:"single",m:"orchest",q:"Which orchestration pattern transfers control between agents dynamically as the task evolves?",
 o:["Handoff orchestration","Sequential orchestration","Concurrent orchestration","Group chat orchestration"],k:[0],
 e:"Handoff orchestration lets the active agent pass control to a more suitable agent."},

{d:"E2",g:"E2b",t:"single",m:"orchest",q:"Which orchestration pattern uses a manager or planner to coordinate the work of other agents?",
 o:["Magentic orchestration","Sequential orchestration","Handoff orchestration","Concurrent orchestration"],k:[0],
 e:"Magentic orchestration uses a planner/manager to direct the flow of work."},

{d:"E2",g:"E2b",t:"multi",m:"a2a",q:"The A2A protocol enables which capabilities? (Select all that apply)",
 o:["Agent discovery","Direct communication between agents","Coordinated task execution across remote agents","Automatic model fine-tuning","Cross-region data replication"],k:[0,1,2],
 e:"The module implements A2A to enable agent discovery, direct communication, and coordinated task execution across remote agents."},

{d:"E2",g:"E2b",t:"single",m:"mcptools",q:"In the Model Context Protocol (MCP), which two roles participate in tool discovery and invocation?",
 o:["MCP server and MCP client","Publisher and subscriber","Producer and consumer group","Controller and worker"],k:[0],
 e:"Objective: explain the roles of the MCP server and client in tool discovery and invocation."},

{d:"E2",g:"E2b",t:"single",m:"mcptools",q:"How are MCP tools registered for use with Azure AI agents in this module's approach?",
 o:["Wrap them as asynchronous functions and register them with the agent","Convert them to endpoints in Azure API Management","Compile them into a container image","Export them to a Power BI dataset"],k:[0],
 e:"Objective: wrap MCP tools as asynchronous functions and register them with Azure AI agents."},

{d:"E2",g:"E2b",t:"multi",m:"m365",q:"Which options exist for integrating a Foundry agent with Microsoft 365? (Select all that apply)",
 o:["Publish the agent to Microsoft Teams","Publish the agent to Microsoft 365 Copilot","Use Work IQ to access Microsoft 365 data","Publish the agent to Azure API Management"],k:[0,1,2],
 e:"The module publishes Foundry agents to Teams and Microsoft 365 Copilot, and uses Work IQ to access workplace data."},

{d:"E2",g:"E2b",t:"single",m:"m365",q:"Which toolkit is covered as the advanced option for publishing agents to Microsoft 365?",
 o:["Microsoft 365 Agents Toolkit","Windows App SDK","Microsoft Graph PowerShell SDK","Azure Developer CLI"],k:[0],
 e:"The advanced unit covers the Microsoft 365 Agents Toolkit."},

{d:"E2",g:"E2b",t:"single",m:"custom",q:"Why would you integrate custom tools into a Foundry agent?",
 o:["Built-in tools are useful but may not meet all of your needs","Custom tools remove the need for a model deployment","Custom tools are always faster than built-in tools","Custom tools eliminate the need for authentication"],k:[0],
 e:"The module's premise: built-in tools are useful, but they may not meet all your needs."},

{d:"E2",g:"E2b",t:"single",m:"af",q:"Which SDK is used in this module to create Foundry Agent Service agents?",
 o:["Microsoft Agent Framework SDK","Bot Framework SDK","Azure Communication Services SDK","Microsoft Graph SDK"],k:[0],
 e:"Objective: create Microsoft Foundry Agent Service agents using the Microsoft Agent Framework SDK."},

{d:"E2",g:"E2b",t:"multi",m:"af",q:"Which tasks does the Microsoft Agent Framework SDK let you perform here? (Select all that apply)",
 o:["Connect to a Microsoft Foundry project","Create Foundry Agent Service agents","Integrate plugin functions with your agent","Provision a new Azure subscription"],k:[0,1,2],
 e:"The objectives are connecting to a Foundry project, creating agents, and integrating plugin functions."},

/* ---------- E2c ---------- */
{d:"E2",g:"E2c",t:"multi",m:"optim",q:"Which prompt engineering techniques are listed for optimising model output? (Select all that apply)",
 o:["System messages","Few-shot learning","Model parameters","Reinforcement learning from human feedback","Quantisation-aware training"],k:[0,1,2],
 e:"The module names system messages, few-shot learning, and model parameters."},

{d:"E2",g:"E2c",t:"single",m:"optim",q:"Fine-tuning a model is recommended primarily when you need to...",
 o:["improve behavioural consistency","add real-time knowledge","reduce the model's parameter count","increase the context window"],k:[0],
 e:"Objective: identify when fine-tuning a model improves behavioural consistency."},

{d:"E2",g:"E2c",t:"multi",m:"optim",q:"Which optimisation strategies does the module compare and combine? (Select all that apply)",
 o:["Prompt engineering","Retrieval Augmented Generation","Fine-tuning","Model quantisation","Response caching"],k:[0,1,2],
 e:"The module compares prompt engineering, RAG, and fine-tuning, and explains when to combine them."},

{d:"E2",g:"E2c",t:"single",m:"optim",q:"RAG, prompt engineering, and fine-tuning are described in the module as...",
 o:["complementary strategies that can be combined","mutually exclusive alternatives","legacy techniques superseded by fine-tuning","features of Document Intelligence"],k:[0],
 e:"The module explores complementary strategies and when to combine them."},

{d:"E2",g:"E2c",t:"single",m:"optim",q:"Which module's objectives include comparing optimisation strategies and deciding when to combine them?",
 o:["Optimize generative AI model performance with Microsoft Foundry","Implement a responsible generative AI solution in Microsoft Foundry","Develop generative AI apps that use tools","Create a knowledge mining solution with Azure AI Search"],k:[0],
 e:"Comparing and combining optimisation strategies is an objective of the optimisation module."},

{d:"E2",g:"E2c",t:"multi",m:"optim",q:"Which are objectives of 'Optimize generative AI model performance with Microsoft Foundry'? (Select all that apply)",
 o:["Apply prompt engineering techniques including system messages, few-shot learning, and model parameters","Understand when and how to ground a model using RAG","Identify when fine-tuning improves behavioural consistency","Compare optimisation strategies and determine when to combine them","Configure private networking for model endpoints"],k:[0,1,2,3],
 e:"The objectives are prompt engineering, RAG grounding, fine-tuning for consistency, and comparing/combining strategies."},

{d:"E2",g:"E2c",t:"single",m:"wf",q:"Which Foundry capability lets you orchestrate AI agents and other components into a multistep flow?",
 o:["Workflows","Content filters","Knowledge stores","The model catalogue"],k:[0],
 e:"Workflows orchestrate AI agents and other components to create intelligent applications."},

/* ---------- E3a ---------- */
{d:"E3",g:"E3a",t:"single",m:"img",q:"In which Microsoft Foundry portal surface do you try out image generation from a natural language prompt?",
 o:["The Images playground","The Chat playground","Document Intelligence Studio","Speech Studio"],k:[0],
 e:"Objective: use the Images playground in the Microsoft Foundry portal."},

{d:"E3",g:"E3a",t:"multi",m:"img",q:"Which are learning objectives of 'Generate images with AI'? (Select all that apply)",
 o:["Describe the capabilities of image generation models","Use the Images playground in the Microsoft Foundry portal","Integrate image generation models into your apps","Train a diffusion model from scratch"],k:[0,1,2],
 e:"The objectives cover describing capabilities, using the Images playground, and integrating image generation into apps."},

{d:"E3",g:"E3a",t:"single",m:"img",q:"What do image generation models in Microsoft Foundry create images from?",
 o:["Natural language prompts","Structured SQL queries","Audio recordings","Power Fx expressions"],k:[0],
 e:"Image generation models create original images based on natural language prompts."},

{d:"E3",g:"E3a",t:"single",m:"video",q:"Which SDK does the video generation module use to generate and remix videos in Python?",
 o:["The Azure OpenAI SDK","The Microsoft Agent Framework SDK","The Speech SDK","The Azure AI Search SDK"],k:[0],
 e:"Objective: use the Azure OpenAI SDK to generate and remix videos in Python."},

{d:"E3",g:"E3a",t:"multi",m:"video",q:"Which are learning objectives of 'Generate videos with Microsoft Foundry'? (Select all that apply)",
 o:["Deploy a video-generating AI model in Microsoft Foundry","Test a video-based prompt in the chat playground","Use the Azure OpenAI SDK to generate and remix videos in Python","Train a custom video encoder"],k:[0,1,2],
 e:"The objectives cover deploying a video-generating model, testing a video prompt in the chat playground, and generating/remixing video in Python."},

{d:"E3",g:"E3a",t:"single",m:"video",q:"Where is a video-based prompt tested before writing Python code?",
 o:["In the chat playground","In Document Intelligence Studio","In Speech Studio","In Azure API Management"],k:[0],
 e:"Objective: test a video-based prompt in the chat playground."},

/* ---------- E3b ---------- */
{d:"E3",g:"E3b",t:"multi",m:"cu",q:"What is Azure Content Understanding used for in this module? (Select all that apply)",
 o:["Multimodal content analysis","Information extraction","Building a content analyser","Training foundation models from scratch"],k:[0,1,2],
 e:"Objectives: describe the capabilities, build a content analyser, and consume it through the API."},

{d:"E3",g:"E3b",t:"single",m:"cu",q:"After building a Content Understanding analyser, how do you use it from an application?",
 o:["By consuming the analyser through the API","By exporting it as a Docker image","By installing it as a browser extension","By mounting it as a network drive"],k:[0],
 e:"Objective: consume a Content Understanding analyser by using the API."},

{d:"E3",g:"E3b",t:"multi",m:"cuapi",q:"Which are learning objectives of 'Create an Azure Content Understanding client application'? (Select all that apply)",
 o:["Use the Azure Content Understanding API to build a content analyser","Use the Azure Content Understanding API to consume an analyser","Provision a GPU cluster","Configure a private endpoint"],k:[0,1],
 e:"The objectives are building an analyser and consuming an analyser through the API."},

{d:"E3",g:"E3b",t:"single",m:"vision",q:"Vision-enabled generative AI models are used to...",
 o:["interpret images in order to respond to visual prompts","transcribe audio into text","translate documents between languages","index content in Azure AI Search"],k:[0],
 e:"Multimodal models interpret images to respond to visual prompts."},

{d:"E3",g:"E3b",t:"multi",m:"vision",q:"Which are learning objectives of 'Develop a vision-enabled generative AI application'? (Select all that apply)",
 o:["Deploy a vision-enabled generative AI model in Microsoft Foundry","Test an image-based prompt in the chat playground","Create a chat app that submits image-based prompts","Configure optical character recognition skills"],k:[0,1,2],
 e:"The objectives cover deploying a vision-capable model, testing an image prompt in the playground, and building the chat app."},

{d:"E3",g:"E3b",t:"single",m:"vision",q:"Where would you first test an image-based prompt?",
 o:["The chat playground","The Images playground's style gallery","A production endpoint","Document Intelligence Studio"],k:[0],
 e:"Objective: test an image-based prompt in the chat playground."},

{d:"E3",g:"E3b",t:"multi",m:"cuimg",q:"Which are learning objectives of 'Analyze images with Content Understanding'? (Select all that apply)",
 o:["Deploy a content-understanding AI model in Microsoft Foundry","Test an image-based prompt in the chat playground","Use the Azure OpenAI SDK to analyze images in Python","Build a custom vision transformer"],k:[0,1,2],
 e:"The objectives cover deploying a content-understanding model, testing an image prompt, and analysing images in Python."},

{d:"E3",g:"E3b",t:"single",m:"cuimg",q:"Which learning path do the Content Understanding modules belong to?",
 o:["Extract insights from visual data on Azure","Develop natural language solutions in Azure","Develop AI agents on Azure","Plan and manage an Azure AI solution"],k:[0],
 e:"Both Content Understanding modules sit under 'Extract insights from visual data on Azure' and 'Develop computer vision solutions with Microsoft Foundry'."},

/* ---------- E4a ---------- */
{d:"E4",g:"E4a",t:"multi",m:"text",q:"Which text analysis capabilities does 'Analyze text with Azure Language in Foundry Tools' teach? (Select all that apply)",
 o:["Detect language from text","Recognise named entities in text","Extract personally identifiable information (PII)","Synthesise speech from text"],k:[0,1,2],
 e:"Objectives: detect language, recognise named entities, and extract PII."},

{d:"E4",g:"E4a",t:"single",m:"text",q:"Which Azure Language capability should you use to remove personal data such as names and addresses from text?",
 o:["Personally identifiable information (PII) extraction","Language detection","Speech synthesis","General named entity recognition"],k:[0],
 e:"Objective: extract personally identifiable information (PII) in text."},

{d:"E4",g:"E4a",t:"multi",m:"textmcp",q:"Which tasks does the Azure Language MCP server expose to an agent? (Select all that apply)",
 o:["Language detection","Entity recognition","Personal information redaction","Speech synthesis"],k:[0,1,2],
 e:"The Language MCP server performs language detection, entity recognition, and personal information redaction."},

{d:"E4",g:"E4a",t:"single",m:"textmcp",q:"What does MCP enable for AI agents?",
 o:["Dynamic tool discovery and selection","Automatic fine-tuning of models","Guaranteed deterministic outputs","Cross-region failover"],k:[0],
 e:"Objective: explain how MCP enables dynamic tool discovery and selection by AI agents."},

{d:"E4",g:"E4a",t:"multi",m:"textmcp",q:"Which are learning objectives of 'Develop a text analysis agent with the Azure Language MCP server'? (Select all that apply)",
 o:["Describe the Azure Language MCP server and the text analysis capabilities it exposes","Explain how MCP enables dynamic tool discovery and selection","Connect the Azure Language MCP server to an agent in Microsoft Foundry","Build a Python client application that invokes the agent","Create a custom language model"],k:[0,1,2,3],
 e:"The objectives cover describing the server, explaining MCP discovery, connecting it to an agent, and building a Python client."},

{d:"E4",g:"E4a",t:"single",m:"textmcp",q:"What must you build to invoke an agent that performs text analysis?",
 o:["A Python client application","A Power BI report","A Logic App workflow","A Synapse pipeline"],k:[0],
 e:"Objective: build a Python client application that invokes an agent to perform text analysis."},

/* ---------- E4b ---------- */
{d:"E4",g:"E4b",t:"single",m:"speech",q:"Which APIs does 'Create speech-enabled apps with Azure Speech' focus on?",
 o:["Speech to text and text to speech","Text analytics and translation","Image analysis and OCR","Language detection and entity extraction"],k:[0],
 e:"The module focuses on the speech-to-text and text-to-speech APIs for speech recognition and synthesis."},

{d:"E4",g:"E4b",t:"single",m:"speech",q:"What is SSML used for in Azure Speech?",
 o:["Customising synthesised speech output, such as voice and prosody","Encrypting audio streams","Detecting the spoken language","Batch-transcribing audio files"],k:[0],
 e:"Speech Synthesis Markup Language controls how synthesised speech sounds."},

{d:"E4",g:"E4b",t:"multi",m:"speech",q:"Which can you configure when implementing text to speech? (Select all that apply)",
 o:["Audio format","Voice","SSML markup","Model training data"],k:[0,1,2],
 e:"Objectives cover configuring audio format and voices, and using Speech Synthesis Markup Language."},

{d:"E4",g:"E4b",t:"single",m:"speechmcp",q:"What capabilities does the Azure Speech MCP server expose to an agent?",
 o:["Speech-to-text and text-to-speech","OCR and form recognition","Language detection and redaction","Image generation and editing"],k:[0],
 e:"The Speech MCP server exposes speech-to-text and text-to-speech tasks."},

{d:"E4",g:"E4b",t:"single",m:"voicelive",q:"Which platform does the Voice Live module build conversational voice agents with?",
 o:["The Voice Live API and SDK","Bot Framework Composer","Azure Communication Services","Microsoft Graph"],k:[0],
 e:"The module covers the Voice Live platform, including API integration and SDK usage."},

{d:"E4",g:"E4b",t:"single",m:"voicelive",q:"Which client library is explored in the Voice Live module?",
 o:["The AI Voice Live client library for Python","The Speech SDK for .NET only","The Azure OpenAI JavaScript SDK","The Microsoft Graph SDK for Java"],k:[0],
 e:"A unit is dedicated to the AI Voice Live client library for Python."},

{d:"E4",g:"E4b",t:"single",m:"voicelive",q:"Beyond using Voice Live directly, which integration does the module cover?",
 o:["Integrating Microsoft Foundry agents with the Voice Live API","Integrating with Azure API Management","Integrating with SAP","Integrating with Azure Kubernetes Service"],k:[0],
 e:"Objective: integrate Microsoft Foundry agents with the Voice Live API to create voice agents."},

{d:"E4",g:"E4b",t:"multi",m:"speechgen",q:"Which are learning objectives of 'Develop a speech-capable generative AI application'? (Select all that apply)",
 o:["Deploy speech-capable generative AI models in Microsoft Foundry","Use a generative AI model to transcribe speech","Use a generative AI model to synthesise speech","Train a custom acoustic model"],k:[0,1,2],
 e:"Deploy a speech-capable model, then transcribe and synthesise speech with it."},

{d:"E4",g:"E4b",t:"single",m:"speechgen",q:"Which kind of models does the speech-capable generative AI module use?",
 o:["Models that transcribe and synthesise speech","Models that only generate images","Models that only translate text","Models that only detect language"],k:[0],
 e:"The module uses generative AI models that transcribe and synthesise speech."},

/* ---------- E5a ---------- */
{d:"E5",g:"E5a",t:"multi",m:"km",q:"Which are learning objectives of 'Create a knowledge mining solution with Azure AI Search'? (Select all that apply)",
 o:["Implement indexing with Azure AI Search","Use AI skills to enrich data in an index","Search an index to find relevant information","Persist extracted information in a knowledge store","Generate synthesised speech"],k:[0,1,2,3],
 e:"Indexing, AI-skill enrichment, searching the index, and persisting to a knowledge store."},

{d:"E5",g:"E5a",t:"single",m:"km",q:"In a knowledge mining solution, what enriches extracted data inside the index?",
 o:["AI skills","Indexers alone","Scoring profiles","Synonym maps"],k:[0],
 e:"Objective: use AI skills to enrich data in an index."},

{d:"E5",g:"E5a",t:"single",m:"km",q:"Where is extracted information persisted for deeper downstream analysis?",
 o:["A knowledge store","A blob container named 'index'","An Azure SQL database is mandatory","A Power BI dataset"],k:[0],
 e:"Objective: persist extracted information in a knowledge store."},

{d:"E5",g:"E5a",t:"single",m:"km",q:"Which component extracts data from a source into the Azure AI Search index?",
 o:["An indexer","A skillset","A scoring profile","A synonym map"],k:[0],
 e:"Objective: extract data with an indexer."},

{d:"E5",g:"E5a",t:"single",m:"km",q:"Which search service does the knowledge mining module build on?",
 o:["Azure AI Search","Azure Cosmos DB","Azure Data Explorer","Azure SQL Database"],k:[0],
 e:"The module implements knowledge mining with Azure AI Search."},

{d:"E5",g:"E5a",t:"single",m:"iq",q:"Which Foundry capability provides a shared knowledge layer that connects agents to enterprise data for grounding?",
 o:["Foundry IQ","Azure Load Balancer","Azure Policy","A Log Analytics workspace"],k:[0],
 e:"Foundry IQ provides a shared knowledge platform that multiple agents can access."},

{d:"E5",g:"E5a",t:"multi",m:"iq",q:"Which are learning objectives of 'Build knowledge-enhanced AI agents with Foundry IQ'? (Select all that apply)",
 o:["Explain how RAG solves the knowledge problem by connecting agents to real-time information","Describe how Foundry IQ provides a shared knowledge platform","Configure data sources for knowledge bases","Configure agent instructions to control retrieval behaviour and citations","Train a custom embedding model"],k:[0,1,2,3],
 e:"The objectives cover RAG, the shared knowledge platform, data-source configuration, and retrieval configuration."},

{d:"E5",g:"E5a",t:"single",m:"iq",q:"In Foundry IQ, which unit covers the settings that govern how content is returned to the agent?",
 o:["Configure retrieval with Foundry IQ","Create an indexer","Train a custom model","Set up a private endpoint"],k:[0],
 e:"The module includes a unit titled 'Configure retrieval with Foundry IQ'."},

/* ---------- E5b ---------- */
{d:"E5",g:"E5b",t:"multi",m:"docint",q:"Which model options does Azure Document Intelligence provide? (Select all that apply)",
 o:["Prebuilt models for common document types","Custom models for industry-specific forms","Generative image models","Speech synthesis voices"],k:[0,1],
 e:"The module covers prebuilt models for common documents and custom models for specialised forms."},

{d:"E5",g:"E5b",t:"single",m:"docint",q:"Which tool would you use to explore and test Document Intelligence models before writing code?",
 o:["Document Intelligence Studio","The Chat playground","The Images playground","Azure Data Studio"],k:[0],
 e:"Objective: use the Document Intelligence Studio to explore and test models."},

{d:"E5",g:"E5b",t:"single",m:"docint",q:"For industry-specific forms that prebuilt models handle poorly, what should you do?",
 o:["Train and use a custom model","Use the prebuilt invoice model anyway","Use Azure Language entity recognition instead","Use an Azure AI Search indexer"],k:[0],
 e:"Objective: train and use custom models for industry-specific forms."},

{d:"E5",g:"E5b",t:"multi",m:"docint",q:"Which are learning objectives of 'Extract data with Azure Document Intelligence'? (Select all that apply)",
 o:["Describe the capabilities and components of Azure Document Intelligence","Use the Document Intelligence Studio to explore and test models","Use prebuilt models to extract data from common document types","Train and use custom models for industry-specific forms","Generate videos from text prompts"],k:[0,1,2,3],
 e:"The objectives cover capabilities and components, the Studio, prebuilt models, and custom models."},

{d:"E5",g:"E5b",t:"single",m:"docint",q:"What kinds of information does Azure Document Intelligence extract?",
 o:["Text, key-value pairs, tables, and structured data","Only plain text","Only handwriting","Only barcodes"],k:[0],
 e:"It extracts text, key-value pairs, tables, and structured data from forms and documents."},

{d:"E5",g:"E5b",t:"single",m:"docint",q:"Which technologies does Azure Document Intelligence combine to extract data from forms?",
 o:["OCR and deep learning models","Rule-based regular expressions only","Speech recognition and translation","Power Fx and Dataverse"],k:[0],
 e:"Azure Document Intelligence uses OCR and deep learning models."},

{d:"E5",g:"E5b",t:"single",m:"cu",q:"Which Azure service would you use to produce clean, grounded representations of documents for use with agents and RAG?",
 o:["Azure Content Understanding","Azure Translator","Azure Speech","Azure Monitor"],k:[0],
 e:"Content Understanding performs multimodal content analysis and information extraction for downstream use."}
];

/* =========================================================
   4. ENGINE
   ========================================================= */
const $ = (id) => document.getElementById(id);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

const state = {
  domains: Object.keys(EXAMS),
  count: 25,
  weighted: true,
  shuffleQuestions: true,
  shuffleOptions: true,
  questions: [],
  idx: 0,
  answered: [],
  selected: new Set(),
  locked: false
};

function renderCoverage() {
  const counts = {};
  Object.keys(SKILLS).forEach((k) => counts[k] = 0);
  BANK.forEach((q) => { counts[q.g] = (counts[q.g] || 0) + 1; });

  let html = "<tr><th>Exam domain / skill area</th><th style='text-align:center'>In bank</th><th>Coverage</th></tr>";
  Object.keys(EXAMS).forEach((d) => {
    const total = Object.keys(SKILLS).filter((k) => SKILLS[k].d === d).reduce((s, k) => s + counts[k], 0);
    html += "<tr class='grp'><td>" + esc(EXAMS[d].n) + " &middot; " + EXAMS[d].w + "</td>"
          + "<td class='num'>" + total + "</td><td class='st'></td></tr>";
    Object.keys(SKILLS).filter((k) => SKILLS[k].d === d).forEach((k) => {
      const c = counts[k];
      const pill = c >= 4 ? "<span class='pill ok'>Covered</span>"
                 : c > 0  ? "<span class='pill thin'>Thin</span>"
                          : "<span class='pill none'>Not in KB</span>";
      html += "<tr><td style='padding-left:22px'>" + esc(SKILLS[k].n) + "</td>"
            + "<td class='num'>" + c + "</td><td class='st'>" + pill + "</td></tr>";
    });
  });
  $("covTable").innerHTML = html;

  let g = "<h3>Knowledge-base gaps</h3><p>These official skill areas have little or no material in the knowledge base yet, so they contribute few or no questions. Add the matching modules to close the gap.</p><ul>";
  GAPS.forEach(([k, txt]) => { g += "<li><b>" + esc(SKILLS[k].n) + "</b> &mdash; " + esc(txt) + "</li>"; });
  g += "</ul>";
  $("gapsBox").innerHTML = g;
}

function buildChips() {
  const dc = $("domainChips");
  Object.keys(EXAMS).forEach((d) => {
    const n = BANK.filter((q) => q.d === d).length;
    const el = document.createElement("label");
    el.className = "chip on";
    el.innerHTML = '<span class="dot"></span><span>' + esc(EXAMS[d].n) + '</span>'
                 + '<span class="cnt">' + EXAMS[d].w + ' &middot; ' + n + 'q</span>';
    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = true; cb.value = d;
    cb.addEventListener("change", () => { el.classList.toggle("on", cb.checked); refreshDomains(); });
    el.appendChild(cb); dc.appendChild(el);
  });

  const cc = $("countChips");
  [[15,"Quick check"],[25,"Half exam"],[40,"Full exam"],[60,"Marathon"]].forEach((pair) => {
    const n = pair[0], label = pair[1];
    const el = document.createElement("label");
    el.className = "chip" + (n === 25 ? " on" : "");
    el.innerHTML = '<span class="dot"></span><span>' + n + ' questions</span><span class="cnt">' + label + '</span>';
    const cb = document.createElement("input");
    cb.type = "radio"; cb.name = "qcount"; cb.checked = n === 25;
    cb.addEventListener("change", () => {
      state.count = n;
      [...cc.children].forEach((c) => c.classList.toggle("on", c.querySelector("input").checked));
      updatePool();
    });
    el.appendChild(cb); cc.appendChild(el);
  });

  const mc = $("modeChips");
  [
    { key:"weighted", label:"Weight to official exam", on:true },
    { key:"shuffleQuestions", label:"Shuffle question order", on:true },
    { key:"shuffleOptions", label:"Shuffle answer options", on:true }
  ].forEach((m) => {
    const el = document.createElement("label");
    el.className = "chip on";
    el.innerHTML = '<span class="dot"></span><span>' + m.label + '</span>';
    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = m.on;
    cb.addEventListener("change", () => { state[m.key] = cb.checked; el.classList.toggle("on", cb.checked); updatePool(); });
    el.appendChild(cb); mc.appendChild(el);
  });

  refreshDomains();
}

function refreshDomains() {
  state.domains = [...$("domainChips").querySelectorAll("input:checked")].map((i) => i.value);
  updatePool();
}

function poolSize() { return BANK.filter((q) => state.domains.includes(q.d)).length; }

function updatePool() {
  const n = poolSize();
  $("poolInfo").textContent = "Pool: " + n + " questions \u00b7 you will get " + Math.min(state.count, n) + ".";
  $("startBtn").disabled = n === 0;
}

/* Allocate question counts across domains in proportion to official exam weight. */
function allocate(total, domainList) {
  const sum = domainList.reduce((s, d) => s + EXAMS[d].mid, 0);
  const rows = domainList.map((d) => {
    const exact = total * EXAMS[d].mid / sum;
    const base = Math.floor(exact);
    return { d: d, n: base, rem: exact - base };
  });
  let used = rows.reduce((s, r) => s + r.n, 0);
  const byRem = rows.slice().sort((a, b) => b.rem - a.rem);
  let i = 0;
  while (used < total && i < byRem.length) { byRem[i].n++; used++; i++; }

  const out = {};
  rows.forEach((r) => { out[r.d] = r.n; });

  const avail = {};
  domainList.forEach((d) => { avail[d] = BANK.filter((q) => q.d === d).length; });

  /* Move any surplus away from domains whose pool is too small. */
  for (let guard = 0; guard < 30; guard++) {
    let moved = false;
    domainList.forEach((d) => {
      if (out[d] > avail[d]) {
        let surplus = out[d] - avail[d];
        out[d] = avail[d];
        const receivers = domainList.filter((x) => out[x] < avail[x]);
        const rsum = receivers.reduce((s, x) => s + EXAMS[x].mid, 0) || 1;
        receivers.forEach((x) => {
          const want = Math.max(1, Math.round(surplus * EXAMS[x].mid / rsum));
          const take = Math.min(want, avail[x] - out[x], surplus);
          if (take > 0) { out[x] += take; surplus -= take; moved = true; }
        });
      }
    });
    if (!moved) break;
  }
  return out;
}

function prepare() {
  const byDomain = {};
  state.domains.forEach((d) => { byDomain[d] = shuffle(BANK.filter((q) => q.d === d).slice()); });

  const want = Math.min(state.count, poolSize());
  let picked = [];

  if (state.weighted) {
    const alloc = allocate(want, state.domains);
    state.domains.forEach((d) => {
      const take = Math.min(alloc[d] || 0, byDomain[d].length);
      picked = picked.concat(byDomain[d].splice(0, take));
    });
    if (picked.length < want) {
      const rest = [];
      state.domains.forEach((d) => { rest.push.apply(rest, byDomain[d]); });
      picked = picked.concat(shuffle(rest).slice(0, want - picked.length));
    }
  } else {
    picked = shuffle(BANK.filter((q) => state.domains.includes(q.d)).slice()).slice(0, want);
  }

  if (state.shuffleQuestions) shuffle(picked);

  state.questions = picked.map((q) => {
    const opts = q.o.map((text, i) => ({ text: text, correct: q.k.indexOf(i) >= 0 }));
    if (state.shuffleOptions) shuffle(opts);
    return Object.assign({}, q, { opts: opts, correctSet: opts.map((o) => o.correct) });
  });
  state.idx = 0; state.answered = []; state.selected = new Set(); state.locked = false;
}

function renderQuestion() {
  const q = state.questions[state.idx];
  const total = state.questions.length;
  state.selected = new Set(); state.locked = false;

  $("qCount").textContent = (state.idx + 1) + " / " + total;
  $("qFill").style.width = ((state.idx / total) * 100) + "%";
  const right = state.answered.filter((a) => a.correct).length;
  $("qScore").textContent = "Score " + right + " / " + state.answered.length;

  $("qTags").innerHTML =
    '<span class="tag tag-dom">' + esc(EXAMS[q.d].n) + '</span>' +
    '<span class="tag tag-skill">' + esc(SKILLS[q.g].n) + '</span>' +
    '<span class="tag ' + (q.t === "multi" ? "tag-multi" : "tag-single") + '">' +
      (q.t === "multi" ? "Multiple choice \u00b7 select all that apply" : "Single choice") + '</span>';

  $("qText").textContent = q.q;

  const ul = $("qOpts");
  ul.innerHTML = "";
  q.opts.forEach((o, i) => {
    const li = document.createElement("li");
    li.className = "opt " + (q.t === "multi" ? "multi" : "single");
    li.dataset.i = i;
    li.innerHTML = '<span class="mark"><i>\u2713</i></span><span class="txt"></span>';
    li.querySelector(".txt").textContent = o.text;
    li.addEventListener("click", () => toggleOption(i));
    ul.appendChild(li);
  });

  $("qFeedback").innerHTML = "";
  const btn = $("actionBtn");
  btn.textContent = "Check answer";
  btn.disabled = true;
  btn.onclick = checkAnswer;
}

function toggleOption(i) {
  if (state.locked) return;
  const q = state.questions[state.idx];
  if (q.t === "single") state.selected = new Set([i]);
  else if (state.selected.has(i)) state.selected.delete(i);
  else state.selected.add(i);
  [...$("qOpts").children].forEach((li) => li.classList.toggle("sel", state.selected.has(Number(li.dataset.i))));
  $("actionBtn").disabled = state.selected.size === 0;
}

function sourceLink(key) {
  const title = MOD[key][0], url = MOD[key][1];
  return '<a href="' + url + '" target="_blank" rel="noopener">' + esc(title) + '</a>';
}

function checkAnswer() {
  const q = state.questions[state.idx];
  const total = state.questions.length;
  const sel = [...state.selected].sort((a, b) => a - b);
  let ok = sel.length === q.correctSet.filter(Boolean).length;
  if (ok) { for (const i of sel) { if (!q.correctSet[i]) { ok = false; break; } } }

  state.locked = true;
  state.answered.push({ q: q, sel: sel, correct: ok });

  [...$("qOpts").children].forEach((li) => {
    const i = Number(li.dataset.i);
    li.classList.remove("sel"); li.classList.add("locked");
    if (q.correctSet[i]) li.classList.add("correct");
    else if (sel.indexOf(i) >= 0) li.classList.add("wrong");
    else li.classList.add("neutral-locked");
  });

  const right = state.answered.filter((a) => a.correct).length;
  $("qScore").textContent = "Score " + right + " / " + state.answered.length;

  const correctText = q.opts.filter((o) => o.correct).map((o) => o.text).join(" \u00b7 ");
  const fb = document.createElement("div");
  fb.className = "feedback " + (ok ? "ok" : "bad");
  fb.innerHTML =
    '<div class="verdict">' + (ok ? "\u2713 Correct" : "\u2717 Not quite") + '</div>' +
    (ok ? "" : '<div class="why"><b>Correct answer:</b> ' + esc(correctText) + '</div>') +
    '<div class="why" style="margin-top:6px">' + esc(q.e) + '</div>' +
    (q.t === "multi" ? '<div class="nopartial">Multiple-choice questions are scored all-or-nothing.</div>' : "") +
    '<div class="src"><b>Source:</b> ' + sourceLink(q.m) + '</div>';
  $("qFeedback").innerHTML = "";
  $("qFeedback").appendChild(fb);

  const btn = $("actionBtn");
  btn.textContent = (state.idx === total - 1) ? "See results" : "Next question";
  btn.disabled = false;
  btn.onclick = next;
  btn.focus();
}

function next() {
  if (state.idx >= state.questions.length - 1) { finish(); return; }
  state.idx++;
  renderQuestion();
}

function finish() {
  $("quiz").hidden = true;
  $("result").hidden = false;

  const total = state.answered.length;
  const right = state.answered.filter((a) => a.correct).length;
  const pct = total ? Math.round((right / total) * 100) : 0;

  $("ring").style.setProperty("--p", pct);
  $("ringVal").textContent = pct + "%";

  let head, sub;
  if (pct >= 90) { head = "Excellent \u2014 exam ready"; sub = "Strong coverage across the domains you selected."; }
  else if (pct >= 75) { head = "Solid pass range"; sub = "Review the misses below, then run a fresh set."; }
  else if (pct >= 60) { head = "Getting there"; sub = "Focus your revision on the weakest domain."; }
  else { head = "Needs another pass"; sub = "Work through the source modules, then retry."; }
  $("resHead").textContent = head;
  $("resSub").textContent = right + " of " + total + " correct. " + sub;

  const per = {};
  state.answered.forEach((a) => {
    const d = a.q.d;
    if (!per[d]) per[d] = { t: 0, c: 0 };
    per[d].t++;
    if (a.correct) per[d].c++;
  });
  const bars = $("resBars");
  bars.innerHTML = "";
  Object.keys(per).sort().forEach((d) => {
    const t = per[d].t, c = per[d].c;
    const p = Math.round((c / t) * 100);
    const row = document.createElement("div");
    row.className = "barrow";
    row.innerHTML =
      '<span class="nm">' + esc(EXAMS[d].n) + ' <span class="wt">(exam weight ' + EXAMS[d].w + ')</span></span>' +
      '<span class="numb">' + c + "/" + t + " \u00b7 " + p + '%</span>' +
      '<span class="track"><span class="fill" style="width:' + p + '%"></span></span>';
    bars.appendChild(row);
  });

  const rv = $("resReview");
  rv.innerHTML = "";
  state.answered.forEach((a, n) => {
    const q = a.q;
    const yours = a.sel.length ? a.sel.map((i) => q.opts[i].text).join(" \u00b7 ") : "(no answer)";
    const correct = q.opts.filter((o) => o.correct).map((o) => o.text).join(" \u00b7 ");
    const div = document.createElement("div");
    div.className = "revitem" + (a.correct ? "" : " miss");
    div.innerHTML =
      '<div class="rq">' + (n + 1) + '. ' + esc(q.q) + '<span class="rtag">' + esc(SKILLS[q.g].n) + '</span></div>' +
      '<div class="line yours-bad"><b>Your answer:</b> ' + esc(yours) + '</div>' +
      (a.correct ? "" : '<div class="line okay"><b>Correct answer:</b> ' + esc(correct) + '</div>') +
      '<div class="rexp">' + esc(q.e) + '</div>' +
      '<div class="rsrc"><b style="color:var(--sc-blue-dark)">Source module:</b> ' + sourceLink(q.m) + '</div>';
    rv.appendChild(div);
  });

  $("result").scrollIntoView({ behavior: "smooth", block: "start" });
}

function start(questions) {
  if (questions) {
    state.questions = questions;
    state.idx = 0; state.answered = []; state.selected = new Set(); state.locked = false;
  } else {
    prepare();
  }
  $("setup").hidden = true;
  $("result").hidden = true;
  $("quiz").hidden = false;
  renderQuestion();
  $("quiz").scrollIntoView({ behavior: "smooth", block: "start" });
}

$("startBtn").addEventListener("click", () => start(null));
$("againBtn").addEventListener("click", () => start(null));

$("missedBtn").addEventListener("click", () => {
  const missed = state.answered.filter((a) => !a.correct).map((a) => a.q);
  if (!missed.length) { alert("No missed questions \u2014 nice work."); return; }
  start(shuffle(missed.slice()));
});

$("backBtn").addEventListener("click", () => {
  $("result").hidden = true; $("quiz").hidden = true; $("setup").hidden = false;
  $("setup").scrollIntoView({ behavior: "smooth", block: "start" });
});

$("quitBtn").addEventListener("click", () => {
  if (!state.answered.length) { $("backBtn").click(); return; }
  finish();
});

document.addEventListener("keydown", (e) => {
  if ($("quiz").hidden) return;
  if (e.key === "Enter") {
    const btn = $("actionBtn");
    if (!btn.disabled) { e.preventDefault(); btn.click(); }
    return;
  }
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 6) {
    const li = $("qOpts").children[n - 1];
    if (li) { e.preventDefault(); toggleOption(n - 1); }
  }
});

buildChips();
renderCoverage();
$("bankSize").textContent = BANK.length + " questions in bank";
