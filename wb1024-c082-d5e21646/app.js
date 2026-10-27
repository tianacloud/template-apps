const style = document.createElement("style"); style.textContent = "\n  :root{\n    --bg:#0d1117;\n    --bg-deep:#0a0e14;\n    --panel:#111823;\n    --panel-2:#151d29;\n    --line:#232c3a;\n    --line-2:#2e3a4c;\n    --fg:#e6edf3;\n    --muted:#8b98a9;\n    --dim:#65717f;\n    --green:#3fb950;\n    --green-2:#2ea043;\n    --green-soft:rgba(63,185,80,.14);\n    --amber:#f0b429;\n    --amber-soft:rgba(240,180,41,.13);\n    --red:#f85149;\n    --red-soft:rgba(248,81,73,.13);\n    --mono: ui-monospace, SFMono-Regular, \"SF Mono\", Menlo, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\n    --sans: -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif;\n  }\n  *{ box-sizing:border-box; -webkit-tap-highlight-color:transparent; }\n  html,body{\n    margin:0; padding:0; width:100%; max-width:100%;\n    overflow-x:hidden;\n    background:var(--bg); color:var(--fg);\n    font-family:var(--sans);\n    -webkit-text-size-adjust:100%;\n    -webkit-font-smoothing:antialiased;\n  }\n  body{\n    min-height:100vh;\n    background:\n      radial-gradient(900px 520px at 50% -10%, rgba(63,185,80,.10), transparent 70%),\n      radial-gradient(700px 420px at 90% 108%, rgba(240,180,41,.07), transparent 72%),\n      var(--bg);\n    background-attachment:fixed;\n  }\n  .app{\n    width:100%; max-width:720px; margin:0 auto;\n    padding: calc(14px + env(safe-area-inset-top)) 16px calc(96px + env(safe-area-inset-bottom));\n    position:relative; z-index:1;\n    min-height:100vh;\n  }\n  .screen{ display:none; }\n  .screen.active{ display:block; animation:screenIn .26s ease both; }\n  @keyframes screenIn{ from{ opacity:0; transform:translateY(6px); } to{ opacity:1; transform:none; } }\n\n  /* ---------- buttons ---------- */\n  .btn{\n    display:inline-flex; align-items:center; justify-content:center; gap:8px;\n    width:100%; min-height:52px; padding:0 18px;\n    font:600 16px/1.2 var(--sans);\n    color:var(--fg); background:var(--panel);\n    border:1px solid var(--line-2); border-radius:13px;\n    cursor:pointer; touch-action:manipulation;\n    transition: transform .12s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease, opacity .18s ease;\n  }\n  .btn:active{ transform:scale(.985); }\n  .btn-primary{\n    color:#04210b;\n    background:linear-gradient(180deg,#45c25a,#2ea043);\n    border-color:#2ea043;\n    box-shadow:0 8px 24px rgba(46,160,67,.26), inset 0 1px 0 rgba(255,255,255,.22);\n  }\n  .btn-primary:active{ box-shadow:0 3px 12px rgba(46,160,67,.24), inset 0 1px 0 rgba(255,255,255,.18); }\n  .btn-primary:disabled{\n    color:#5c6b7c; background:#18202c; border-color:var(--line);\n    box-shadow:none; cursor:not-allowed;\n  }\n  .btn-ghost{ background:transparent; }\n  .btn-ghost:active{ background:var(--panel); }\n  .btn-quiet{\n    min-height:44px; background:transparent; border-color:transparent;\n    color:var(--dim); font-weight:500; font-size:14px;\n  }\n\n  /* ---------- HOME ---------- */\n  .eyebrow{\n    font:600 10.5px/1 var(--mono); letter-spacing:.22em; text-transform:uppercase;\n    color:var(--dim); margin:6px 0 18px;\n  }\n  .brand{ margin:0; font-size:clamp(36px,11.5vw,50px); line-height:1.06; letter-spacing:-.01em; font-weight:800; }\n  .brand .accent{ color:var(--green); }\n  .caret{\n    display:inline-block; width:.44em; height:.78em; margin-left:3px;\n    background:var(--green); vertical-align:-.04em;\n    animation:blink 1.1s steps(1,end) infinite;\n    box-shadow:0 0 18px rgba(63,185,80,.55);\n  }\n  @keyframes blink{ 0%,50%{opacity:1} 50.01%,100%{opacity:0} }\n  .tagline{\n    margin:12px 0 0; color:var(--muted); font-size:16px; line-height:1.6;\n  }\n  .tagline b{ color:var(--fg); font-weight:600; }\n\n  .mock{\n    margin:22px 0 20px; border:1px solid var(--line); border-radius:14px;\n    background:linear-gradient(180deg,#0e141d,#0a0e14);\n    overflow:hidden;\n    box-shadow:0 18px 40px -22px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.04);\n  }\n  .mock-bar{\n    display:flex; align-items:center; gap:8px; height:34px; padding:0 12px;\n    background:#0d131c; border-bottom:1px solid rgba(35,44,58,.9);\n  }\n  .dots{ display:flex; gap:5px; }\n  .dots i{ width:8px; height:8px; border-radius:50%; background:#2e3a4c; display:block; }\n  .dots i:nth-child(1){ background:#3a2b2b; }\n  .dots i:nth-child(2){ background:#3a3427; }\n  .dots i:nth-child(3){ background:#26382c; }\n  .mock-name{ font:500 10.5px/1 var(--mono); color:var(--dim); margin-left:4px; }\n  .mock-body{ padding:8px 0 10px; font:400 12.5px/22px var(--mono); }\n  .mline{ display:flex; min-height:26px; padding:0 12px 0 0; }\n  .mline .ln{ flex:0 0 auto; width:30px; text-align:right; padding-right:10px; color:#48546a; user-select:none; }\n  .mline .code{ white-space:pre; color:#c9d5e3; }\n  .mline.hot{ background:rgba(240,180,41,.10); box-shadow:inset 3px 0 0 var(--amber); }\n  .mline.hot .ln{ color:var(--amber); }\n  .mock-note{ color:var(--dim); }\n\n  .fact-row{ display:flex; gap:8px; margin:0 0 18px; flex-wrap:wrap; }\n  .fact{\n    flex:1 1 0; min-width:96px; padding:10px 12px; border-radius:11px;\n    background:rgba(21,29,41,.7); border:1px solid var(--line);\n  }\n  .fact .k{ display:block; font:500 10.5px/1.4 var(--mono); color:var(--dim); letter-spacing:.06em; }\n  .fact .v{ display:block; font:700 16px/1.5 var(--sans); color:var(--fg); font-variant-numeric:tabular-nums; }\n  .fact .v.best{ color:var(--amber); }\n\n  .rules{\n    margin:20px 0 22px; padding:16px 16px 14px; list-style:none;\n    border:1px solid var(--line); border-radius:14px; background:rgba(17,24,35,.72);\n  }\n  .rules li{\n    display:flex; gap:10px; align-items:flex-start;\n    font-size:13.5px; line-height:1.62; color:var(--muted);\n    padding:6px 0;\n  }\n  .rules li + li{ border-top:1px dashed rgba(46,58,76,.7); }\n  .rules .n{\n    flex:0 0 auto; width:19px; height:19px; margin-top:2px; border-radius:6px;\n    display:grid; place-items:center;\n    font:700 11px/1 var(--mono);\n    color:var(--green); background:var(--green-soft); border:1px solid rgba(63,185,80,.28);\n  }\n  .rules li b{ color:var(--fg); font-weight:600; }\n  .foot-note{\n    margin:14px 0 0; text-align:center; font:400 11px/1.7 var(--mono); color:#4d5866;\n  }\n\n  /* ---------- HUD ---------- */\n  .hud{\n    position:sticky; top:0; z-index:20;\n    margin:0 -16px; padding:calc(8px + env(safe-area-inset-top)) 16px 10px;\n    background:rgba(13,17,23,.9);\n    -webkit-backdrop-filter:blur(12px); backdrop-filter:blur(12px);\n    border-bottom:1px solid rgba(35,44,58,.85);\n  }\n  .hud-top{ display:flex; align-items:center; justify-content:space-between; gap:10px; }\n  .cell{ display:flex; flex-direction:column; gap:3px; min-width:0; }\n  .cell.mid{ align-items:center; }\n  .cell.right{ align-items:flex-end; }\n  .cell .k{ font:600 9.5px/1 var(--mono); letter-spacing:.16em; text-transform:uppercase; color:#5b6675; }\n  .cell .v{\n    font:700 17px/1.15 var(--sans); font-variant-numeric:tabular-nums;\n    color:var(--fg); transition:color .2s ease, transform .18s ease;\n  }\n  .cell .v i{ font-style:normal; font-size:11px; font-weight:500; color:var(--dim); margin-left:2px; }\n  .cell .v.bump{ animation:bump .34s ease; }\n  @keyframes bump{ 0%{transform:scale(1)} 40%{transform:scale(1.18); color:var(--green)} 100%{transform:scale(1)} }\n  .lives{ display:flex; align-items:center; gap:3px; }\n  .heart{\n    font-size:16px; line-height:1; color:var(--red);\n    text-shadow:0 0 10px rgba(248,81,73,.4);\n    transition:color .2s ease;\n  }\n  .heart.lost{ color:#39424f; text-shadow:none; }\n  .heart.breaking{ animation:breakHeart .5s ease; }\n  @keyframes breakHeart{ 0%{transform:scale(1.3)} 55%{transform:scale(.82)} 100%{transform:scale(1)} }\n  .lives-num{ font:600 11px/1 var(--mono); color:var(--dim); margin-left:4px; }\n\n  .timer{ margin-top:9px; }\n  .timer-track{ height:6px; border-radius:99px; background:#1a222e; overflow:hidden; }\n  .timer-fill{\n    height:100%; width:100%; border-radius:99px;\n    background:linear-gradient(90deg,#2ea043,#4fd166);\n    transition: background .25s ease;\n    transform-origin:left center;\n  }\n  .timer-fill.warn{ background:linear-gradient(90deg,#c98f18,#f0b429); }\n  .timer-fill.danger{ background:linear-gradient(90deg,#d5372f,#ff6459); }\n  .timer-meta{\n    display:flex; align-items:center; justify-content:space-between;\n    margin-top:6px; height:16px;\n  }\n  .timer-label{ font:500 10.5px/1 var(--mono); color:#5b6675; letter-spacing:.08em; }\n  .timer-num{\n    font:700 12.5px/1 var(--mono); color:var(--muted); font-variant-numeric:tabular-nums;\n  }\n  .timer-num.danger{ color:var(--red); }\n  .combo{\n    display:inline-flex; align-items:center; gap:4px;\n    margin-left:8px; padding:2px 7px; border-radius:6px;\n    font:700 10px/1.4 var(--mono); letter-spacing:.06em;\n    color:#04210b; background:var(--amber);\n    opacity:0; transform:translateY(3px) scale(.9);\n    transition:opacity .2s ease, transform .2s ease;\n  }\n  .combo.on{ opacity:1; transform:none; }\n\n  /* ---------- question meta ---------- */\n  .qhead{ display:flex; align-items:center; gap:6px; margin:12px 0 8px; flex-wrap:wrap; }\n  .badge{\n    display:inline-flex; align-items:center; height:22px; padding:0 8px;\n    border-radius:6px; border:1px solid var(--line-2);\n    font:600 10.5px/1 var(--mono); letter-spacing:.04em; color:var(--muted);\n    background:rgba(21,29,41,.7);\n  }\n  .badge.d-easy{ color:#7ee787; border-color:rgba(63,185,80,.34); background:var(--green-soft); }\n  .badge.d-medium{ color:#f2cc60; border-color:rgba(240,180,41,.32); background:var(--amber-soft); }\n  .badge.d-hard{ color:#ff8d85; border-color:rgba(248,81,73,.32); background:var(--red-soft); }\n  .badge.lang{ color:#9aa6b6; }\n\n  /* ---------- editor ---------- */\n  .editor{\n    border:1px solid var(--line); border-radius:13px; overflow:hidden;\n    background:var(--bg-deep);\n    box-shadow:0 16px 36px -26px #000, inset 0 1px 0 rgba(255,255,255,.035);\n  }\n  .editor-bar{\n    display:flex; align-items:center; gap:8px; height:36px; padding:0 11px;\n    background:#0d131c; border-bottom:1px solid rgba(35,44,58,.9);\n  }\n  .editor-name{ font:500 10.5px/1 var(--mono); color:var(--dim); }\n  .editor-status{\n    margin-left:auto; font:500 10px/1 var(--mono); color:#5b6675;\n    max-width:58%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;\n    transition:color .2s ease;\n  }\n  .editor-status.hot{ color:var(--amber); }\n  .editor-status.ok{ color:var(--green); }\n  .editor-status.bad{ color:var(--red); }\n  .code-scroll{\n    overflow:auto; max-height:clamp(238px, 46vh, 460px);\n    -webkit-overflow-scrolling:touch; overscroll-behavior:contain;\n    scrollbar-width:thin; scrollbar-color:#2b3644 transparent;\n  }\n  .code-scroll::-webkit-scrollbar{ width:7px; height:7px; }\n  .code-scroll::-webkit-scrollbar-track{ background:transparent; }\n  .code-scroll::-webkit-scrollbar-thumb{ background:#26303e; border-radius:99px; }\n  .code-scroll::-webkit-scrollbar-thumb:hover{ background:#36434f; }\n  .code-scroll::-webkit-scrollbar-corner{ background:transparent; }\n  .code-body{ display:inline-block; min-width:100%; padding:6px 0 8px; vertical-align:top; }\n  .line{\n    display:flex; align-items:flex-start; width:100%;\n    min-height:44px; padding:11px 14px 11px 0;\n    border-left:3px solid transparent;\n    background:transparent; border-top:0; border-right:0; border-bottom:0;\n    font-family:inherit; text-align:left;     color:inherit; cursor:pointer;\n    -webkit-user-select:none; user-select:none;\n    transition:background .16s ease, border-color .16s ease;\n  }\n  .line:active{ background:#151d29; }\n  .line .gut{\n    flex:0 0 auto; width:46px; display:flex; justify-content:flex-end; align-items:center; gap:4px;\n    padding-right:10px;\n  }\n  .line .ico{\n    width:11px; text-align:center;\n    font:700 11px/22px var(--mono); color:transparent;\n  }\n  .line .ln{\n    font:400 11.5px/22px var(--mono); color:#48546a;\n    min-width:18px; text-align:right; user-select:none;\n  }\n  .line .code{\n    font:400 13.5px/22px var(--mono); white-space:pre; color:#ccd8e6;\n    letter-spacing:.1px;\n  }\n  .line.selected{ background:rgba(240,180,41,.10); border-left-color:var(--amber); }\n  .line.selected .ln{ color:var(--amber); }\n  .line.selected .ico{ color:var(--amber); }\n  .line.correct{ background:rgba(63,185,80,.13); border-left-color:var(--green); }\n  .line.correct .ln{ color:var(--green); }\n  .line.correct .ico{ color:var(--green); }\n  .line.wrong{ background:rgba(248,81,73,.11); border-left-color:var(--red); }\n  .line.wrong .ln{ color:#ff8d85; }\n  .line.wrong .ico{ color:var(--red); }\n  .line.dim{ opacity:.6; }\n  .tk-k{ color:#ff7b72; }\n  .tk-s{ color:#a5d6a0; }\n  .tk-n{ color:#79c0ff; }\n  .tk-c{ color:#6d7a8c; font-style:italic; }\n\n  .hint{\n    margin:10px 2px 12px; font-size:12px; line-height:1.55; color:#6c7787;\n    display:flex; gap:6px; align-items:flex-start;\n  }\n  .hint .arrow{ color:var(--amber); }\n  .actions{ display:flex; flex-direction:column; gap:9px; }\n\n  /* ---------- SHEET ---------- */\n  .sheet{\n    position:fixed; inset:0; z-index:80;\n    display:flex; align-items:flex-end; justify-content:center;\n    padding-bottom: calc(100px + env(safe-area-inset-bottom));\n    background:rgba(4,7,11,.62);\n    opacity:0; pointer-events:none;\n    transition:opacity .2s ease;\n  }\n  .sheet.open{ opacity:1; pointer-events:auto; }\n  .sheet-panel{\n    width:100%; max-width:720px;\n    padding:18px 16px calc(16px + env(safe-area-inset-bottom));\n    background:linear-gradient(180deg,#141c27,#0f1620);\n    border-top:1px solid #2b3646; border-radius:20px;\n    transform:translateY(104%);\n    transition:transform .28s cubic-bezier(.22,.8,.28,1);\n    box-shadow:0 -22px 50px -20px rgba(0,0,0,.9);\n    max-height:calc(90vh - 100px); overflow-y:auto;\n  }\n  .sheet.open .sheet-panel{ transform:none; }\n  .fb-head{ display:flex; align-items:center; gap:12px; }\n  .fb-icon{\n    flex:0 0 auto; width:44px; height:44px; border-radius:12px;\n    display:grid; place-items:center;\n    font:700 20px/1 var(--sans);\n    border:1px solid transparent;\n  }\n  .fb-icon.ok{ color:#7ee787; background:var(--green-soft); border-color:rgba(63,185,80,.34); }\n  .fb-icon.bad{ color:#ff8d85; background:var(--red-soft); border-color:rgba(248,81,73,.34); }\n  .fb-icon.time{ color:#f2cc60; background:var(--amber-soft); border-color:rgba(240,180,41,.34); }\n  .fb-title{ margin:0; font-size:17px; font-weight:700; letter-spacing:.01em; }\n  .fb-sub{ margin:3px 0 0; font:500 12px/1.4 var(--mono); color:var(--muted); font-variant-numeric:tabular-nums; }\n  .fb-sub .plus{ color:var(--green); font-weight:700; font-size:14px; }\n  .fb-sub .minus{ color:var(--red); font-weight:700; }\n  .fb-break{\n    display:flex; flex-wrap:wrap; gap:6px; margin:14px 0 12px;\n  }\n  .fb-break span{\n    padding:4px 8px; border-radius:6px; background:rgba(255,255,255,.04);\n    border:1px solid var(--line); font:500 10.5px/1.4 var(--mono); color:var(--muted);\n  }\n  .fb-exp{\n    margin:0 0 12px; font-size:13.5px; line-height:1.72; color:#c2cedd;\n  }\n  .fb-exp code{\n    font:500 12.5px/1.4 var(--mono); color:var(--amber);\n    background:rgba(240,180,41,.10); padding:1px 5px; border-radius:4px;\n  }\n  .fb-line{\n    margin:0 0 16px; padding:10px 12px;\n    border-left:2px solid var(--green); background:rgba(63,185,80,.07);\n    border-radius:0 8px 8px 0;\n    font:400 11.5px/1.7 var(--mono); color:#a9b8c8;\n    overflow-x:auto; white-space:pre;\n  }\n  .fb-line b{ color:var(--green); font-weight:700; }\n\n  /* ---------- RESULT ---------- */\n  .res-top{ text-align:center; padding:8px 0 0; }\n  .rank-badge{\n    display:inline-flex; align-items:center; gap:7px;\n    padding:7px 15px; border-radius:99px;\n    border:1px solid rgba(240,180,41,.42); background:rgba(240,180,41,.10);\n    font:700 13px/1 var(--sans); color:#f5c953; letter-spacing:.03em;\n  }\n  .res-score{\n    margin:16px 0 2px; display:flex; align-items:baseline; justify-content:center; gap:6px;\n  }\n  .res-score .num{\n    font-size:clamp(56px,17vw,84px); font-weight:800; line-height:1; letter-spacing:-.03em;\n    color:var(--fg); font-variant-numeric:tabular-nums;\n    text-shadow:0 0 40px rgba(63,185,80,.28);\n    animation:scoreIn .5s cubic-bezier(.2,.9,.3,1) both;\n  }\n  @keyframes scoreIn{ from{opacity:0; transform:translateY(10px) scale(.94)} to{opacity:1; transform:none} }\n  .res-score .unit{ font:600 14px/1 var(--mono); color:var(--dim); }\n  .res-sub{ margin:6px 0 0; font-size:12.5px; color:var(--muted); }\n  .res-sub .new{ color:var(--amber); font-weight:700; }\n\n  .stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin:20px 0 12px; }\n  .stat{\n    padding:12px 8px; border-radius:12px; text-align:center;\n    background:rgba(21,29,41,.72); border:1px solid var(--line);\n  }\n  .stat .sv{ display:block; font:700 18px/1.3 var(--sans); font-variant-numeric:tabular-nums; }\n  .stat .sk{ display:block; font:500 10px/1.4 var(--mono); color:var(--dim); margin-top:3px; letter-spacing:.04em; }\n\n  .ladder{ display:flex; flex-wrap:wrap; justify-content:center; gap:5px; margin:0 0 20px; }\n  .ladder .rk{\n    padding:4px 7px; border-radius:6px; border:1px solid var(--line);\n    font:500 10px/1.4 var(--mono); color:#525d6c; background:rgba(255,255,255,.02);\n  }\n  .ladder .rk.on{ color:#f5c953; border-color:rgba(240,180,41,.4); background:rgba(240,180,41,.10); }\n\n  .card-wrap{ margin:0 0 16px; }\n  #cardImage{\n    display:block; width:100%; height:auto; border-radius:14px;\n    border:1px solid var(--line); background:#0b1017;\n    box-shadow:0 24px 56px -30px #000;\n    -webkit-touch-callout:default;\n  }\n  #cardCanvas{ display:none; }\n  .card-tip{\n    margin:8px 0 0; text-align:center; font:500 11px/1.5 var(--mono); color:#5b6675;\n  }\n\n  /* ---------- modal / toast ---------- */\n  .modal{\n    position:fixed; inset:0; z-index:90;\n    display:grid; place-items:center; padding:20px;\n    background:rgba(4,7,11,.72);\n    opacity:0; pointer-events:none; transition:opacity .2s ease;\n  }\n  .modal.open{ opacity:1; pointer-events:auto; }\n  .modal-panel{\n    width:100%; max-width:400px;\n    padding:20px 18px 16px; border-radius:16px;\n    background:linear-gradient(180deg,#161f2b,#101821);\n    border:1px solid var(--line-2);\n    transform:translateY(8px) scale(.98); transition:transform .22s ease;\n    box-shadow:0 30px 70px -24px #000;\n  }\n  .modal.open .modal-panel{ transform:none; }\n  .modal-panel h3{ margin:0 0 8px; font-size:16px; font-weight:700; }\n  .modal-panel p{ margin:0 0 12px; font-size:13px; line-height:1.68; color:var(--muted); }\n  .modal-label{ display:block; font:500 10px/1.6 var(--mono); color:var(--dim); margin-bottom:5px; letter-spacing:.08em; }\n  .modal-input{\n    width:100%; padding:10px 11px; border-radius:9px;\n    border:1px solid var(--line-2); background:#0b1119; color:#cbd7e5;\n    font:400 11.5px/1.6 var(--mono);\n    resize:none; word-break:break-all;\n  }\n  .modal-input:focus{ outline:none; border-color:var(--amber); box-shadow:0 0 0 3px rgba(240,180,41,.14); }\n  .modal-actions{ margin-top:14px; }\n\n  .toast{\n    position:fixed; left:50%; bottom:calc(100px + env(safe-area-inset-bottom));\n    transform:translate(-50%,14px); z-index:95;\n    max-width:min(320px,86vw); padding:10px 15px; border-radius:10px;\n    background:rgba(24,33,45,.97); border:1px solid var(--line-2);\n    color:var(--fg); font-size:12.5px; line-height:1.5; text-align:center;\n    opacity:0; pointer-events:none;\n    transition:opacity .2s ease, transform .24s cubic-bezier(.2,.9,.3,1);\n    box-shadow:0 16px 40px -18px #000;\n  }\n  .toast.show{ opacity:1; transform:translate(-50%,0); }\n\n  @media (min-width:560px){\n    .app{ padding-left:22px; padding-right:22px; }\n    .hud{ margin-left:-22px; margin-right:-22px; padding-left:22px; padding-right:22px; }\n    .line .code{ font-size:14px; }\n  }\n  @media (prefers-reduced-motion:reduce){\n    *{ animation-duration:.001ms !important; animation-iteration-count:1 !important; transition-duration:.001ms !important; }\n  }\n"; document.head.appendChild(style);
document.title = "Bug 猎人 · 20 秒找出代码里的那只虫";
document.getElementById("app").innerHTML = "\n<div data-page-node-id=\"zPMt8skVkf8uxU21SnvLee\" class=\"app\">\n\n  <!--pnid:C22aDdF9zTtWnXQ0yHaR0t--><!-- ================= HOME ================= -->\n  <section data-page-node-id=\"aUicw1po7kH7zGtt44app4\" class=\"screen active\" id=\"screen-home\">\n    <p data-page-node-id=\"Kbbry0AMi0W7SGo96W0xiC\" class=\"eyebrow\"><!--pnid:EcnmsJqHa6AP7P1P8IDheK-->Code Debugging Game</p>\n    <h1 data-page-node-id=\"X41GCFq1PUNekot08J72XY\" class=\"brand\"><!--pnid:9SrlI51aoCK2cS2uKU51H0-->Bug <span data-page-node-id=\"BMARAhpEXrM5YZxl2sab8V\" class=\"accent\"><!--pnid:gOsokf66Z4kRhyb25KANhy-->猎人</span><span data-page-node-id=\"KV9XlDVTdRbfZYO1e44Wok\" aria-hidden=\"true\" class=\"caret\"></span></h1>\n    <p data-page-node-id=\"Xye7EJVkh9uPcn6rydR6i1\" class=\"tagline\"><!--pnid:ZrZfK329dBE5ce1G9Qse89-->20 秒，找出代码里的那只虫。<br data-page-node-id=\"zXuNa8LV6ydnkTHMh4WujG\"><b data-page-node-id=\"1i6pT6CHFn3tpLPWTdm5IC\"><!--pnid:RN2sHlq49LrX6vQICGDydw-->15 个经典 Bug</b><!--pnid:MAhNnBh1Tn1QWDOK93TOEx-->，3 条命，撑到最后。</p>\n\n    <div data-page-node-id=\"NH5VwByNXf2oHawDjaExgP\" aria-hidden=\"true\" class=\"mock\">\n      <div data-page-node-id=\"OWl20EnpqHPc4x0nkCxciB\" class=\"mock-bar\">\n        <span data-page-node-id=\"QK5Xy3ehBmBYKD7Wn55P4w\" class=\"dots\"><i data-page-node-id=\"HwKIhrWOV5b3a7cDphJ0A7\"></i><i data-page-node-id=\"HHVq8GvAIeAzA2OME5cJqU\"></i><i data-page-node-id=\"OrN7GmbS9FeijADZu8GgRP\"></i></span>\n        <span data-page-node-id=\"s5Njs1SMzdF1voEi3jmrkf\" class=\"mock-name\"><!--pnid:imV3Kul01U3dyK3urCjici-->hunt.js</span>\n      </div>\n      <div data-page-node-id=\"OJ1NdWgTjWH01kdQbZ6eyr\" class=\"mock-body\">\n        <div data-page-node-id=\"FhDEV1Rnv71cdc6RiScS00\" class=\"mline\"><span data-page-node-id=\"7MSMSbNXitKynZyyfhO4rA\" class=\"ln\"><!--pnid:sCuyRhrhEUIXcQqHNdKQD7-->1</span><span data-page-node-id=\"be3jMmkdAsEwhv9E3oA0SO\" class=\"code\"><span data-page-node-id=\"xEkvJzFAKIHdD2EpY12r1b\" class=\"tk-k\"><!--pnid:uqjMEfeqNxaZ3Uxmcmnhag-->let</span><!--pnid:lFjmCu48znAByj2Jq9IcHf--> lives = <span data-page-node-id=\"TfdhhO0sFqpXFuznqsB6Sz\" class=\"tk-n\"><!--pnid:9aPr5urzdhbxqiarWbKlqA-->3</span><!--pnid:0iblZquBbsfRrHxLdyLZn2-->;</span></div>\n        <div data-page-node-id=\"zG7nknkJs2Xh0Mzg80Wkf8\" class=\"mline\"><span data-page-node-id=\"rT8hJNDYOdrqb8oFyp5I5i\" class=\"ln\"><!--pnid:a0PGq5baXOeDL4V52RAUyX-->2</span><span data-page-node-id=\"ZcHNJNPdKkekAoAhO9Wlq8\" class=\"code\"><span data-page-node-id=\"dd8haZj0mhvshYBws73cgb\" class=\"tk-k\"><!--pnid:8WxREELflhqNxU2L3uLdcY-->while</span><!--pnid:YgRg1fbdLaUU1oKMmx8m6B--> (lives &gt; <span data-page-node-id=\"IA8leDFG2ncziNQiSRXtE2\" class=\"tk-n\"><!--pnid:ZJdkA01FvH3KRq7uR8WLQQ-->0</span><!--pnid:TNM1lvKlMXTlaoLchblmcI-->) {</span></div>\n        <div data-page-node-id=\"aZsHZzyOcWGXG1uoDFHnB4\" class=\"mline hot\"><span data-page-node-id=\"xWwJBWAB0uzF3NXfOUimNF\" class=\"ln\"><!--pnid:FQwBjMhYFK3iCzstWuAssU-->3</span><span data-page-node-id=\"CehUIgLWNhA89Z2B1AalWB\" class=\"code\"><!--pnid:6eQmLBHuUYARPVRJYZJPKY-->  hunt(bug); <span data-page-node-id=\"rq8XyT6BEKM6skSQpm70mi\" class=\"mock-note\"><!--pnid:DMtpvPHixB5gRJ6MlDYpuG-->// ← 20 秒内点中这行</span></span></div>\n        <div data-page-node-id=\"Bgkwmb5bTseCUlUup0Xtfm\" class=\"mline\"><span data-page-node-id=\"4r1IsBwoVpyMIFKEjcR2lE\" class=\"ln\"><!--pnid:DxE5qsow3L4kfag0jqClXj-->4</span><span data-page-node-id=\"pTEn6qOhdr5qLQJ7Qd1pqN\" class=\"code\"><!--pnid:cMgl5ArPGU7ZGasYiNyLXh-->}</span></div>\n      </div>\n    </div>\n\n    <div data-page-node-id=\"VHAdIOEW5zYQAIsGIRj9Sm\" class=\"fact-row\">\n      <div data-page-node-id=\"6ZxAhDhGTayDSjObLpKThm\" class=\"fact\"><span data-page-node-id=\"SQed679YZZr8u0DDv8bxo0\" class=\"k\"><!--pnid:5S1ZBJjRFFU3vTGKOS8yvk-->最佳成绩</span><span data-page-node-id=\"RkN94if7NA2WVqBC3TM0Y2\" class=\"v best\" id=\"homeBest\"><!--pnid:ZpY9fhMjPccRwTVi94oamH-->—</span></div>\n      <div data-page-node-id=\"4BgoP18Qxj69rsCrggzH8V\" class=\"fact\"><span data-page-node-id=\"2GSUFZzoGI1NwzUhreVPd7\" class=\"k\"><!--pnid:RR43hVjSqCsI19XenUYcdi-->题目总数</span><span data-page-node-id=\"i01JULrH6l654HfxWzBsZv\" class=\"v\" id=\"homeTotal\"><!--pnid:6Yb9HWhr3ySxxvRFn2utRY-->15</span></div>\n      <div data-page-node-id=\"Dst4Rk4vMsRmhZieQWaeq4\" class=\"fact\"><span data-page-node-id=\"hERPUZDE24por1EAYbR6OY\" class=\"k\"><!--pnid:SR9Kzx4C3Bj9Ei5oLl2uMI-->每题限时</span><span data-page-node-id=\"25x7ZEFGE9f32PxvAVgmNQ\" class=\"v\"><!--pnid:6MFxLY5xI9ednAaJNSyVtj-->20s</span></div>\n    </div>\n\n    <ol data-page-node-id=\"XVPWmgeBE92FepmdBM8Aip\" class=\"rules\">\n      <li data-page-node-id=\"EX1lIEL5XpBSo0So6Mu5PP\"><span data-page-node-id=\"5fOLSnXuWscKW0MGi9EHqy\" class=\"n\"><!--pnid:MUx121pSctsQMMGfkLjK2m-->1</span><span data-page-node-id=\"XY1pAocxTUc5197i057ifT\"><!--pnid:4WXJbfjQIL16xrCiCTpts2-->每题给一段代码，<b data-page-node-id=\"zYZ9Mmh9NvmvIU0ogNmnTE\"><!--pnid:fKHDGCnkDggyIeYPhavqmm-->20 秒内点出有问题的那一行</b><!--pnid:TMO4Zd004DQ6TzF4n9yYyL-->，再点“提交答案”。</span></li>\n      <li data-page-node-id=\"J5UbW1bTKSzp5KcXX2lFke\"><span data-page-node-id=\"HjgQHwIVSWqU5NcozfhaDt\" class=\"n\"><!--pnid:ULkpixg46AIpQ1B7etvvVg-->2</span><span data-page-node-id=\"gEvfBjRxYQ14NDJo5iL9bX\"><!--pnid:1qEaGBnlMnJmBIndvRcfzD-->答对按<b data-page-node-id=\"49Bq2Bec9mmqUBQ59n1jTc\"><!--pnid:pOy3LZRW6ZX3TwKk4uOLeg-->剩余时间 + 连击</b><!--pnid:9QhCse47Bh18xrc1ABJ6Nf-->加分；答错或超时<b data-page-node-id=\"H25PYyLUiLeBICgeoPejGv\"><!--pnid:XK80vk9O4nJOEDHKHwBXR3-->扣 1 条命</b><!--pnid:GoB6z0OVy7EQFhbrrzVAXK-->，连击清零。</span></li>\n      <li data-page-node-id=\"XjvTg3DYH0IILtu84R2WC9\"><span data-page-node-id=\"8xGa7ljeARoBMr2Af4CaS7\" class=\"n\"><!--pnid:yS0JVYOpgSGO7fAD5XK4kJ-->3</span><span data-page-node-id=\"uBIxGYjx4GaZAlPiwdhdVM\"><!--pnid:P5yeXpFiO9wh1Fhd8wxOew-->3 条命耗尽或 15 题答完即结束，生成可分享的成绩卡。</span></li>\n    </ol>\n\n    <div data-page-node-id=\"r8GuILttQt6poKJUjUaRMk\" class=\"actions\">\n      <button data-page-node-id=\"nOfUzYMTGeQS9bNb5YHcZb\" class=\"btn btn-primary\" id=\"startBtn\" type=\"button\"><!--pnid:N5xXcEnzBULiod4p4YnKL4-->开始狩猎</button>\n    </div>\n    <p data-page-node-id=\"J9au5QKFsemHJa8DVw5Mf8\" class=\"foot-note\"><!--pnid:NvHdoKt4sMZ16uarISQEym-->纯前端单文件 · 无登录 · 无网络请求</p>\n  </section>\n\n  <!--pnid:OTHqrW4NnLhyIJdWgDqLyu--><!-- ================= GAME ================= -->\n  <section data-page-node-id=\"OvTuUqqp5bhz2yu3PhmggK\" class=\"screen\" id=\"screen-game\">\n    <div data-page-node-id=\"bLO9m8dh35TRcnQ3dL9BY9\" class=\"hud\">\n      <div data-page-node-id=\"MFp0QEbkKOy7GZ3dFGwSWy\" class=\"hud-top\">\n        <div data-page-node-id=\"5h6C3oD2GuSLQUQD7H61dv\" class=\"cell\">\n          <span data-page-node-id=\"axE4Ts8vveOoNoLnFN0uR7\" class=\"k\"><!--pnid:c57re1UEv318wanYRduvLc-->题目</span>\n          <span data-page-node-id=\"cTKDmsrTi6BMDRZJVRmFT0\" class=\"v\" id=\"qIndex\"><!--pnid:qC3Rd7mJC9KTyDoKZ3n8wm-->1<i data-page-node-id=\"47qlHc1T1zFNcRUuBb8bid\"><!--pnid:qRqSKE3MmkD54r7hVNo6Xd-->/15</i></span>\n        </div>\n        <div data-page-node-id=\"3mzsyCnlp330PdTBIl5VfK\" class=\"cell mid\">\n          <span data-page-node-id=\"UfXCKGHYX58JOYnzxdDkqb\" class=\"k\"><!--pnid:AAXTImUznzHAEx9EcKL7FJ-->生命</span>\n          <span data-page-node-id=\"zB6Wud55Nb8hZuYwiRJ8QB\" class=\"lives\">\n            <span data-page-node-id=\"zJKUECkRuqOSjtY9SlHvZy\" id=\"heartBox\"></span>\n            <span data-page-node-id=\"4rJW0GXO2MjyNlhkelGfLs\" class=\"lives-num\" id=\"livesNum\"><!--pnid:wrXRiUICiM3U2y7vPyfzp5-->3/3</span>\n          </span>\n        </div>\n        <div data-page-node-id=\"KKnszuKX2I4G2vY9srOs0V\" class=\"cell right\">\n          <span data-page-node-id=\"VaQGmPRsWGUgw3ddwbYSWu\" class=\"k\"><!--pnid:NTdrKoTsDWeanECzUjkWQi-->得分</span>\n          <span data-page-node-id=\"Sxye0qmBqDqXC54uOlsVV0\" class=\"v\" id=\"scoreVal\"><!--pnid:hkEyV7eW5TpyPQ0lKK0hkH-->0</span>\n        </div>\n      </div>\n      <div data-page-node-id=\"OaQVBS5T6985HsHOJRNET4\" class=\"timer\">\n        <div data-page-node-id=\"RwMaCBKID8DrTR5eMD5d3N\" class=\"timer-track\"><div data-page-node-id=\"BpnwF91YFZbzbaCS6kUtvb\" class=\"timer-fill\" id=\"timerFill\"></div></div>\n        <div data-page-node-id=\"q846ddYntZxbVou4Jd8yl4\" class=\"timer-meta\">\n          <span data-page-node-id=\"SXeoVJvsylMXapIakkR05w\" class=\"timer-label\"><!--pnid:HnhgUSdqxRO8o4DGuLkaM7-->剩余时间</span>\n          <span data-page-node-id=\"SHVKcumoLZeQ8NT2aEP4df\">\n            <span data-page-node-id=\"4FGUUyht1AjMYAruiscw3q\" class=\"timer-num\" id=\"timerNum\"><!--pnid:VcZNH7HkaZWgBMYF8hMn4t-->20.0s</span>\n            <span data-page-node-id=\"d4LG72WWFGXXYxKbjTbzJz\" class=\"combo\" id=\"comboBadge\"><!--pnid:BoBX1xCSM6oRqEeUVHh2Hu-->COMBO ×2</span>\n          </span>\n        </div>\n      </div>\n    </div>\n\n    <div data-page-node-id=\"Ei0hMX4AP61N8ERpi1jsv2\" class=\"qhead\">\n      <span data-page-node-id=\"dM4HJAe2V21D9qKW513SBL\" class=\"badge\" id=\"qDiff\"><!--pnid:oQvxYdsc19NKgXmJuEhlg5-->简单</span>\n      <span data-page-node-id=\"YIcNPULcSB74U6y2wzyltZ\" class=\"badge\" id=\"qCat\"><!--pnid:vyXIYjjjovhDT9AnMeWNai-->逻辑</span>\n      <span data-page-node-id=\"u4rov4op3qgznn991KIQMw\" class=\"badge lang\" id=\"qLang\"><!--pnid:bJ0jwvzzKPGfsNog1A8XvP-->JS</span>\n    </div>\n\n    <div data-page-node-id=\"rNn6tJxl2UyzyUoWUF7VvT\" class=\"editor\">\n      <div data-page-node-id=\"gsNAQ9NNQwpuSApGII6tRc\" class=\"editor-bar\">\n        <span data-page-node-id=\"a7nUdm9vomgYosvOo2CU2X\" class=\"dots\"><i data-page-node-id=\"Eqmy2bQnLY5yIKji4UDDX2\"></i><i data-page-node-id=\"QhRnQgm9XrjY2ncYskrpou\"></i><i data-page-node-id=\"IcWZLSTuHfVxh6gj9gFS57\"></i></span>\n        <span data-page-node-id=\"hsnNeZtJ9Xk9KAtJKvOgcR\" class=\"editor-name\" id=\"fileName\"><!--pnid:GL8DSERCmTNrpCtuUWynwY-->bug-01.js</span>\n        <span data-page-node-id=\"EBTuOA9xZABS6eMahzeSFr\" class=\"editor-status\" id=\"editorStatus\"><!--pnid:4GPnAu2Yw9RK5UAd4ff0eL-->点选可疑行</span>\n      </div>\n      <div data-page-node-id=\"0dCEaNdT6XAD1HH8YhINFF\" class=\"code-scroll\" id=\"codeScroll\">\n        <div data-page-node-id=\"C9MEednFmTWpULzbPUnlqr\" class=\"code-body\" id=\"codeBody\"></div>\n      </div>\n    </div>\n\n    <p data-page-node-id=\"dz9OFztzEmjRs26xQFbKhY\" class=\"hint\"><span data-page-node-id=\"kFmTDEPOJbDXahGU2mMeG4\" class=\"arrow\"><!--pnid:pUUmq4fHF8YjuSRcwO975p-->▸</span><span data-page-node-id=\"rzhhSvI10EpRsXASXPPqV6\" id=\"hintText\"><!--pnid:3BXvfaYhNz2Rbo2BNThOHb-->点一下你认为有 Bug 的那一行，然后点“提交答案”。</span></p>\n\n    <div data-page-node-id=\"jmTuXCo5kSRZthuFa2zKZZ\" class=\"actions\">\n      <button data-page-node-id=\"SpkrbHzsC6t8d2SYh8lPg1\" class=\"btn btn-primary\" disabled id=\"submitBtn\" type=\"button\"><!--pnid:uvUxEtvFjCvDcz8WvOwPKZ-->提交答案</button>\n    </div>\n  </section>\n\n  <!--pnid:xgZSWDsVMVwjE9R5Wz6DLw--><!-- ================= RESULT ================= -->\n  <section data-page-node-id=\"HGkbkM55yxPPEnWjtq5RsM\" class=\"screen\" id=\"screen-result\">\n    <div data-page-node-id=\"DvGUVtcNziJY9CWciENYI5\" class=\"res-top\">\n      <div data-page-node-id=\"nRjeDRm9YfRBLU5K6AoHn7\" class=\"rank-badge\" id=\"rankBadge\"><!--pnid:quFVCz0I14vsRE6rbiiYtj-->入门 · 见习猎人</div>\n      <div data-page-node-id=\"JkgpeBM8bScALOGcYf1QYx\" class=\"res-score\">\n        <span data-page-node-id=\"miPyMrhowxu5xQ9GRpfyc4\" class=\"num\" id=\"finalScore\"><!--pnid:vcH7VPqm4upp9BFjF9CDWP-->0</span>\n        <span data-page-node-id=\"EUXUCn4mkgCpSdkdTB3Dha\" class=\"unit\"><!--pnid:H1jcQx2eQG2pWz7ay2sf3K-->分</span>\n      </div>\n      <p data-page-node-id=\"u6Y58sNUZ7PcJZmeax0Rlo\" class=\"res-sub\" id=\"resultSub\"><!--pnid:0G7lNPW7iooFcYe93ennqC-->答对 0 题 · 作答 0 题</p>\n    </div>\n\n    <div data-page-node-id=\"9hYVvXRreiMyGGlPylrFsr\" class=\"stats\">\n      <div data-page-node-id=\"YkG8F1LM7sMCgd89HgaeA7\" class=\"stat\"><span data-page-node-id=\"O9LjSfbcN7RxfBwIz4pZkp\" class=\"sv\" id=\"stAcc\"><!--pnid:ZHkitUnGQxmP8zwwQxUfF1-->0%</span><span data-page-node-id=\"NVgh9AOYavyuHP71i8qf5q\" class=\"sk\"><!--pnid:CUG5dhjFO1QGEI3EYwyfhK-->正确率</span></div>\n      <div data-page-node-id=\"dVclMjyL1H6Uk1ArhojYWt\" class=\"stat\"><span data-page-node-id=\"y0jRUvMRQAb2FqBCPF8Qcp\" class=\"sv\" id=\"stTime\"><!--pnid:CXWQryFjmkccV2gL7GGutx-->00:00</span><span data-page-node-id=\"WkHSv89Ooqh1vJ42igmDVc\" class=\"sk\"><!--pnid:jK2EYit7xxQuZ4X0QcnYYF-->用时</span></div>\n      <div data-page-node-id=\"RmJSoVVF11XIrily5APpvA\" class=\"stat\"><span data-page-node-id=\"TIMsZEi062ZEra2gXUoTPT\" class=\"sv\" id=\"stCombo\"><!--pnid:5kBXhXwoF4U9VcMUQGV2iV-->×0</span><span data-page-node-id=\"xmrZUwcVWPSYtZ4BNnKOLJ\" class=\"sk\"><!--pnid:DECleXxRLeIp6NSTbc9Mpx-->最高连击</span></div>\n    </div>\n\n    <div data-page-node-id=\"j17LHhKPp8dhGtKatJ1xpu\" class=\"ladder\" id=\"rankLadder\"></div>\n\n    <div data-page-node-id=\"w9zJHsulX3xcpOUzdmg6yC\" class=\"card-wrap\">\n      <img data-page-node-id=\"VPwRbCyF0wvED47toHtsxP\" alt=\"Bug 猎人成绩卡\" id=\"cardImage\">\n      <canvas data-page-node-id=\"E6yUL9jo5Fm591xZipNNZF\" aria-hidden=\"true\" height=\"1440\" id=\"cardCanvas\" width=\"1080\"></canvas>\n      <p data-page-node-id=\"jR3OJvGhDp64ZmILyf5IH7\" class=\"card-tip\" id=\"cardTip\"><!--pnid:9kHZhvsUs0QFJPVhQmU2BN-->长按上方图片可保存成绩卡</p>\n    </div>\n\n    <div data-page-node-id=\"3ejXfjqRbZWcM4hGn3Wx8L\" class=\"actions\">\n      <button data-page-node-id=\"6agdpTr28fzpkaJK9f8Pru\" class=\"btn btn-primary\" id=\"copyBtn\" type=\"button\"><!--pnid:zjPMv2Eow6uE7BVSKTcKJk-->复制挑战文案</button>\n      <button data-page-node-id=\"GyLJ0mPW4lJdROyhEwR8sh\" class=\"btn btn-ghost\" id=\"saveBtn\" type=\"button\"><!--pnid:fFux4iLn6L2bxvnDxp3zMd-->下载成绩卡</button>\n      <button data-page-node-id=\"gzELGj8hnVGqCkviSsCtP2\" class=\"btn btn-ghost\" id=\"againBtn\" type=\"button\"><!--pnid:j0A7SSh7s5OWX4FOCr9rNg-->再玩一次</button>\n      <button data-page-node-id=\"M96weYp8tXUniy4Th9o0cs\" class=\"btn btn-quiet\" id=\"homeBtn\" type=\"button\"><!--pnid:lDUn9oyhEnfR0Nnm8KnCEI-->返回首页</button>\n    </div>\n  </section>\n</div>\n\n<!--pnid:lV2gz7xPF2mcu9skD6JOJw--><!-- feedback sheet -->\n<div data-page-node-id=\"NxLYjFkNobEquztB6SOYbj\" aria-hidden=\"true\" class=\"sheet\" id=\"sheet\">\n  <div data-page-node-id=\"Iz30R8CQd4YpEkTOPLyN2o\" aria-labelledby=\"fbTitle\" aria-modal=\"true\" class=\"sheet-panel\" role=\"dialog\">\n    <div data-page-node-id=\"wu7QQxHyYo73WNTBVZKN82\" class=\"fb-head\">\n      <span data-page-node-id=\"b1m3NNFeveRZK0XAhkgqFZ\" class=\"fb-icon ok\" id=\"fbIcon\"><!--pnid:XssLjFMMC7x50EMlojzvKv-->✓</span>\n      <div data-page-node-id=\"SUNnn8TiUqCL0COaDa9T2J\">\n        <h3 data-page-node-id=\"yhtlwbRnmlutk0XFbK8srE\" class=\"fb-title\" id=\"fbTitle\"><!--pnid:QY6lNuRDdiMXafSOdsALwS-->命中！</h3>\n        <p data-page-node-id=\"PEhsKDQaMnJtEmkZPAx3DF\" class=\"fb-sub\" id=\"fbSub\"></p>\n      </div>\n    </div>\n    <div data-page-node-id=\"sTdy36umnykhrdmDmJwTTf\" class=\"fb-break\" id=\"fbBreak\"></div>\n    <p data-page-node-id=\"S7UtoudqX7IdgW82CzRGVv\" class=\"fb-exp\" id=\"fbExp\"></p>\n    <div data-page-node-id=\"IGE1Rll40JqI0FCkp8qXKW\" class=\"fb-line\" id=\"fbLine\"></div>\n    <button data-page-node-id=\"3QZgZq5miwXrs7DrLTIkm3\" class=\"btn btn-primary\" id=\"nextBtn\" type=\"button\"><!--pnid:hrIA99eTJTwLqS9OrjPejL-->下一题</button>\n  </div>\n</div>\n\n<!--pnid:D72LIzTGIjS4UR0FKr4S7O--><!-- generic modal -->\n<div data-page-node-id=\"W1fEtcNlX91ZkZEc9h0wxw\" aria-hidden=\"true\" class=\"modal\" id=\"modal\">\n  <div data-page-node-id=\"dd8w7j0GahaNUeH0FDbYs0\" aria-labelledby=\"modalTitle\" aria-modal=\"true\" class=\"modal-panel\" role=\"dialog\">\n    <h3 data-page-node-id=\"xDBi0C3RUhxgHfz4YHvZMn\" id=\"modalTitle\"><!--pnid:IANuOXfzcMY72BpkbX06VO-->提示</h3>\n    <p data-page-node-id=\"Qb9UVGAgZ0ww3z0pHuzowr\" id=\"modalBody\"></p>\n    <label data-page-node-id=\"IxaWG2bUf0p9xqdvfn3PZi\" class=\"modal-label\" for=\"modalInput\" id=\"modalLabel\"><!--pnid:oOG8S6qU7NHIXJtygKXdOv-->链接</label>\n    <textarea data-page-node-id=\"2Hpgsr9WP0Javul7Zvvq1J\" class=\"modal-input\" id=\"modalInput\" readonly rows=\"3\"></textarea>\n    <div data-page-node-id=\"7cfCsPRvBcT7sQm7H3VFfm\" class=\"modal-actions\">\n      <button data-page-node-id=\"7M4P0Mejg4oFVvGYJrHLTZ\" class=\"btn btn-primary\" id=\"modalOk\" type=\"button\"><!--pnid:pB1kzpaEwv8kA7c8xspZEY-->知道了</button>\n    </div>\n  </div>\n</div>\n\n<div data-page-node-id=\"oOgOH4bhuCC4jbt5ddgL3M\" aria-live=\"polite\" class=\"toast\" id=\"toast\" role=\"status\"></div>\n\n";

(function () {
  'use strict';

  /* =========================================================
     题库：code(...) 逐行拼接，bugLine 从 1 开始
     ========================================================= */
  var code = function () {
    return Array.prototype.slice.call(arguments).join('\n');
  };

  var QUESTIONS = [
    {
      id: 1, category: '逻辑', difficulty: 'easy', lang: 'js', points: 100,
      code: code(
        'function checkScore(score) {',
        '  if (score = 100) {',
        '    return "满分";',
        '  }',
        '  return "继续加油";',
        '}'
      ),
      bugLine: 2,
      explanation: '单个等号是赋值而不是比较：这里会把 score 改成 100，条件永远成立，任何分数都返回“满分”。应该写成 score === 100。'
    },
    {
      id: 2, category: '边界', difficulty: 'easy', lang: 'js', points: 100,
      code: code(
        'const nums = [3, 8, 1, 5];',
        'let total = 0;',
        'for (let i = 0; i <= nums.length; i++) {',
        '  total += nums[i];',
        '}',
        'console.log(total);'
      ),
      bugLine: 3,
      explanation: '循环条件用了 <=，最后一次 i 等于数组长度，nums[4] 是 undefined，total 会变成 NaN。正确写法是 i < nums.length。'
    },
    {
      id: 3, category: '逻辑', difficulty: 'easy', lang: 'js', points: 100,
      code: code(
        'const input = "12";',
        'const next = input + 1;',
        'console.log(next); // 期望 13'
      ),
      bugLine: 2,
      explanation: '字符串和数字用 + 会触发拼接，结果是“121”而不是 13。要先用 Number(input) 转成数字再相加。'
    },
    {
      id: 4, category: '边界', difficulty: 'easy', lang: 'js', points: 100,
      code: code(
        'const users = [{ id: 1, name: "Ann" }];',
        'const target = users.find(u => u.id === 2);',
        'console.log(target.name);'
      ),
      bugLine: 3,
      explanation: 'find 找不到时返回 undefined，直接读 .name 会抛出 TypeError。取值前要先判断 target 是否存在。'
    },
    {
      id: 5, category: '语法', difficulty: 'easy', lang: 'js', points: 100,
      code: code(
        'const config = { debug: true };',
        'config = { debug: false };',
        'console.log(config.debug);'
      ),
      bugLine: 2,
      explanation: 'const 声明的变量不能被重新赋值，执行到这一行会抛 TypeError。要改内容就改属性（config.debug = false），要换对象就用 let。'
    },
    {
      id: 6, category: '逻辑', difficulty: 'medium', lang: 'js', points: 100,
      code: code(
        'function getLimit(config) {',
        '  return config.limit || 10;',
        '}',
        'console.log(getLimit({ limit: 0 })); // 期望 0'
      ),
      bugLine: 2,
      explanation: '0 是 falsy，|| 会把它替换成 10，用户明确设置的 0 被吞掉。要保留 0 应该用 ??，只在 null / undefined 时兜底。'
    },
    {
      id: 7, category: '异步', difficulty: 'medium', lang: 'js', points: 100,
      code: code(
        'async function loadAll(ids) {',
        '  const results = [];',
        '  ids.forEach(async (id) => {',
        '    results.push(await fetchItem(id));',
        '  });',
        '  return results;',
        '}',
        '',
        '// 假设 fetchItem 已实现'
      ),
      bugLine: 3,
      explanation: 'forEach 不会等待 async 回调，函数返回时 results 还是空数组。改用 for...of 逐个 await，或者 Promise.all(ids.map(...))。'
    },
    {
      id: 8, category: '边界', difficulty: 'medium', lang: 'js', points: 100,
      code: code(
        'const PAGE_SIZE = 10;',
        'function getPage(items, page) {',
        '  const start = page * PAGE_SIZE;',
        '  return items.slice(start, start + PAGE_SIZE);',
        '}',
        'const list = Array.from({ length: 25 }, (_, i) => i + 1);',
        'getPage(list, 1); // 期望第 1 条到第 10 条'
      ),
      bugLine: 3,
      explanation: '页码从 1 开始，偏移量必须先减 1，否则第 1 页会跳过前 10 条。应写成 (page - 1) * PAGE_SIZE。'
    },
    {
      id: 9, category: '逻辑', difficulty: 'medium', lang: 'js', points: 100,
      code: code(
        'const scores = [100, 9, 25, 3];',
        'scores.sort();',
        'console.log(scores); // 期望 [3, 9, 25, 100]'
      ),
      bugLine: 2,
      explanation: 'sort 默认把元素转成字符串按字典序比较，“100”会排在“9”前面。数字排序必须传比较函数 (a, b) => a - b。'
    },
    {
      id: 10, category: '边界', difficulty: 'medium', lang: 'js', points: 100,
      code: code(
        'function formatAge(user) {',
        '  if (!user.age) {',
        '    return "年龄未知";',
        '  }',
        '  return user.age + " 岁";',
        '}',
        'formatAge({ age: 0 }); // 期望 "0 岁"'
      ),
      bugLine: 2,
      explanation: '0 也是 falsy，会被当成“没填年龄”。判断缺失应该用 user.age == null，或者 "age" in user。'
    },
    {
      id: 11, category: '异步', difficulty: 'medium', lang: 'js', points: 100,
      code: code(
        'async function loadNames(ids) {',
        '  return Promise.all(ids.map(async (id) => {',
        '    fetchUser(id).then(u => u.name);',
        '  }));',
        '}',
        '',
        '// 假设 fetchUser 已实现'
      ),
      bugLine: 3,
      explanation: 'map 的回调没有 return，Promise.all 最后拿到的是一组 undefined。写成 return fetchUser(id).then(...) 才能把 Promise 交回去。'
    },
    {
      id: 12, category: '异步', difficulty: 'medium', lang: 'js', points: 100,
      code: code(
        'for (var i = 0; i < 3; i++) {',
        '  setTimeout(() => console.log(i), 100);',
        '}',
        '// 期望 0 1 2，实际 3 3 3'
      ),
      bugLine: 1,
      explanation: 'var 没有块级作用域，三个回调共享同一个 i，等它们执行时循环早已结束，全都输出 3。换成 let，每次循环都会创建一个独立变量。'
    },
    {
      id: 13, category: '逻辑', difficulty: 'hard', lang: 'py', points: 100,
      code: code(
        'def add_item(item, basket=[]):',
        '    basket.append(item)',
        '    return basket',
        '',
        'print(add_item("苹果"))',
        'print(add_item("香蕉"))'
      ),
      bugLine: 1,
      explanation: '默认参数 [] 只在函数定义时创建一次，之后所有调用共用同一个列表，第二次会打印 [“苹果”, “香蕉”]。默认值应写 None，在函数内部再新建列表。'
    },
    {
      id: 14, category: '边界', difficulty: 'hard', lang: 'js', points: 100,
      code: code(
        'const cache = new Map();',
        '',
        'function multiply(a, b) {',
        '  const key = `${a}${b}`;',
        '  if (!cache.has(key)) {',
        '    cache.set(key, a * b);',
        '  }',
        '  return cache.get(key);',
        '}',
        'multiply(1, 23);  // 23',
        'multiply(12, 3);  // 期望 36'
      ),
      bugLine: 4,
      explanation: '用字符串拼接当缓存 key，1 和 23、12 和 3 都会拼成“123”，第二次直接命中错误缓存。加上分隔符，比如 `${a}:${b}`。'
    },
    {
      id: 15, category: '异步', difficulty: 'hard', lang: 'js', points: 100,
      code: code(
        'function doWork() {',
        '  return Promise.reject(new Error("boom"));',
        '}',
        '',
        'async function main() {',
        '  try {',
        '    doWork();',
        '  } catch (err) {',
        '    console.error("失败", err);',
        '  }',
        '}'
      ),
      bugLine: 7,
      explanation: '这里少了 await：doWork 返回的 Promise 被拒绝时，try / catch 已经执行完了，异常变成未处理的 rejection。要写 await doWork()。'
    }
  ];

  /* =========================================================
     常量 / 状态
     ========================================================= */
  var PER_Q_MS = 20000;
  var LIFE_MAX = 3;
  var DIFF_LABEL = { easy: '简单', medium: '中等', hard: '困难' };
  var DIFF_CLASS = { easy: 'd-easy', medium: 'd-medium', hard: 'd-hard' };
  var RANKS = [
    { min: 0,    short: '虫子学徒', full: '新手 · 虫子学徒' },
    { min: 800,  short: '见习猎人', full: '入门 · 见习猎人' },
    { min: 1600, short: '捉虫好手', full: '熟练 · 捉虫好手' },
    { min: 2400, short: '猎虫专家', full: '资深 · 猎虫专家' },
    { min: 3200, short: '虫王克星', full: '传说 · 虫王克星' }
  ];

  var state = {
    idx: 0,
    lives: LIFE_MAX,
    score: 0,
    combo: 0,
    maxCombo: 0,
    correct: 0,
    answered: 0,
    selected: 0,
    locked: true,
    playMs: 0,
    running: false
  };

  var lastResult = null;
  var rafId = 0;
  var timerEnd = 0;
  var toastTimer = 0;
  var sheetArmed = false;

  /* =========================================================
     本地存储（带内存兜底）
     ========================================================= */
  var Store = (function () {
    var KEY = 'bughunter.best.v1';
    var mem = 0;
    var broken = false;

    function get() {
      if (broken) return mem;
      try {
        var raw = window.localStorage.getItem(KEY);
        if (raw === null || raw === undefined || raw === '') return mem;
        var n = parseInt(raw, 10);
        return isFinite(n) && n > 0 ? n : 0;
      } catch (e) {
        broken = true;
        return mem;
      }
    }

    function set(v) {
      mem = v;
      if (broken) return;
      try {
        window.localStorage.setItem(KEY, String(v));
      } catch (e) {
        broken = true;
      }
    }

    return { get: get, set: set };
  })();

  var best = Store.get();

  /* =========================================================
     工具
     ========================================================= */
  function $(id) { return document.getElementById(id); }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  var HL_RE = /(\/\/[^\n]*|#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|async|await|new|try|catch|finally|throw|class|extends|of|in|typeof|instanceof|this|null|undefined|true|false|import|from|export|def|None|print|lambda|pass)\b)/g;

  function highlight(src) {
    if (!src) return '&nbsp;';
    var out = '';
    var last = 0;
    var m;
    HL_RE.lastIndex = 0;
    while ((m = HL_RE.exec(src)) !== null) {
      out += escHtml(src.slice(last, m.index));
      var cls = m[1] ? 'tk-c' : (m[2] ? 'tk-s' : (m[3] ? 'tk-n' : 'tk-k'));
      out += '<span class="' + cls + '">' + escHtml(m[0]) + '</span>';
      last = m.index + m[0].length;
    }
    out += escHtml(src.slice(last));
    return out || '&nbsp;';
  }

  function rankOf(score) {
    var r = RANKS[0];
    for (var i = 0; i < RANKS.length; i++) {
      if (score >= RANKS[i].min) r = RANKS[i];
    }
    return r;
  }

  function fmtClock(ms) {
    var total = Math.round(ms / 1000);
    var m = Math.floor(total / 60);
    var s = total % 60;
    return (m < 10 ? '0' + m : '' + m) + ':' + (s < 10 ? '0' + s : '' + s);
  }

  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      el.classList.remove('show');
    }, 2000);
  }

  /* =========================================================
     分享链接
     ========================================================= */
  function getShareUrl() { return window.location.href.split("#")[0]; }

  /* =========================================================
     复制
     ========================================================= */
  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      ta.style.left = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return !!ok;
    } catch (e) {
      return false;
    }
  }

  function copyText(text) {
    return new Promise(function (resolve) {
      var settled = false;
      function done(v) { if (!settled) { settled = true; resolve(v); } }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            done(true);
          })['catch'](function () {
            done(legacyCopy(text));
          });
          window.setTimeout(function () { done(legacyCopy(text)); }, 1200);
          return;
        }
      } catch (e) {}
      done(legacyCopy(text));
    });
  }

  function openModal(title, body, label, value) {
    $('modalTitle').textContent = title;
    $('modalBody').textContent = body;
    var input = $('modalInput');
    if (label && value) {
      $('modalLabel').style.display = 'block';
      $('modalLabel').textContent = label;
      input.style.display = 'block';
      input.value = value;
      input.rows = value.length > 120 ? 5 : 3;
    } else {
      $('modalLabel').style.display = 'none';
      input.style.display = 'none';
      input.value = '';
    }
    $('modal').classList.add('open');
    $('modal').setAttribute('aria-hidden', 'false');
    window.setTimeout(function () {
      try {
        if (input.style.display !== 'none') { input.focus(); input.select(); }
        else { $('modalOk').focus(); }
      } catch (e) {}
    }, 120);
  }

  function closeModal() {
    $('modal').classList.remove('open');
    $('modal').setAttribute('aria-hidden', 'true');
  }

  /* =========================================================
     屏幕切换
     ========================================================= */
  function showScreen(name) {
    var ids = ['screen-home', 'screen-game', 'screen-result'];
    for (var i = 0; i < ids.length; i++) {
      var el = $(ids[i]);
      if (el) el.classList.toggle('active', ids[i] === 'screen-' + name);
    }
    try { window.scrollTo(0, 0); } catch (e) {}
  }

  function renderBest() {
    $('homeBest').textContent = best > 0 ? String(best) : '—';
    $('homeTotal').textContent = String(QUESTIONS.length);
  }

  /* =========================================================
     开局
     ========================================================= */
  function startGame() {
    state.idx = 0;
    state.lives = LIFE_MAX;
    state.score = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.correct = 0;
    state.answered = 0;
    state.selected = 0;
    state.locked = false;
    state.playMs = 0;
    state.running = true;
    lastResult = null;

    closeSheet();
    closeModal();
    $('scoreVal').textContent = '0';
    $('comboBadge').classList.remove('on');
    renderLives();
    showScreen('game');
    renderQuestion();
  }

  function renderLives() {
    var box = $('heartBox');
    box.innerHTML = '';
    for (var i = 0; i < LIFE_MAX; i++) {
      var s = document.createElement('span');
      s.className = 'heart' + (i < state.lives ? '' : ' lost');
      s.textContent = i < state.lives ? '♥' : '♡';
      box.appendChild(s);
    }
    $('livesNum').textContent = state.lives + '/' + LIFE_MAX;
    box.parentNode.setAttribute('aria-label', '剩余生命 ' + state.lives + ' / ' + LIFE_MAX);
  }

  function renderQuestion() {
    var q = QUESTIONS[state.idx];
    state.selected = 0;
    state.locked = false;

    $('qIndex').innerHTML = (state.idx + 1) + '<i>/' + QUESTIONS.length + '</i>';

    var diff = $('qDiff');
    diff.textContent = DIFF_LABEL[q.difficulty] || q.difficulty;
    diff.className = 'badge ' + (DIFF_CLASS[q.difficulty] || '');
    $('qCat').textContent = q.category;
    $('qLang').textContent = q.lang === 'py' ? 'PYTHON' : 'JAVASCRIPT';
    $('fileName').textContent = 'bug-' + (q.id < 10 ? '0' + q.id : q.id) + (q.lang === 'py' ? '.py' : '.js');

    var body = $('codeBody');
    body.innerHTML = '';
    var lines = q.code.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var n = i + 1;
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'line';
      row.setAttribute('data-line', String(n));
      row.setAttribute('aria-label', '第 ' + n + ' 行：' + lines[i].replace(/^\s+/, ''));
      row.innerHTML = '<span class="gut"><span class="ico"></span><span class="ln">' + n + '</span></span>' +
                      '<span class="code">' + highlight(lines[i]) + '</span>';
      row.addEventListener('click', onLineClick);
      body.appendChild(row);
    }

    var sc = $('codeScroll');
    sc.scrollTop = 0;
    sc.scrollLeft = 0;

    $('submitBtn').disabled = true;
    $('submitBtn').textContent = '提交答案';
    $('hintText').textContent = '点一下你认为有 Bug 的那一行，然后点“提交答案”。';
    setEditorStatus('点选可疑行', '');

    startTimer();
  }

  function setEditorStatus(text, cls) {
    var el = $('editorStatus');
    el.textContent = text;
    el.className = 'editor-status' + (cls ? ' ' + cls : '');
  }

  function onLineClick(e) {
    if (state.locked || !state.running) return;
    var row = e.currentTarget;
    var n = parseInt(row.getAttribute('data-line'), 10);
    if (!n) return;
    var all = $('codeBody').querySelectorAll('.line');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('selected');
    row.classList.add('selected');
    state.selected = n;
    $('submitBtn').disabled = false;
    $('hintText').textContent = '已选第 ' + n + ' 行 — 确认是这里就提交。';
    setEditorStatus('已选第 ' + n + ' 行', '');
  }

  /* =========================================================
     计时
     ========================================================= */
  function startTimer() {
    timerEnd = now() + PER_Q_MS;
    updateTimer(PER_Q_MS);
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  }

  function now() {
    if (window.performance && typeof window.performance.now === 'function') return window.performance.now();
    return Date.now();
  }

  function tick() {
    if (!state.running) return;
    var left = Math.max(0, timerEnd - now());
    updateTimer(left);
    if (left <= 0) {
      if (!state.locked) submit(true);
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function updateTimer(left) {
    var pct = Math.max(0, Math.min(100, (left / PER_Q_MS) * 100));
    var fill = $('timerFill');
    fill.style.width = pct + '%';
    fill.className = 'timer-fill' + (left <= 5000 ? ' danger' : (left <= 10000 ? ' warn' : ''));
    var num = $('timerNum');
    num.textContent = (left / 1000).toFixed(1) + 's';
    num.className = 'timer-num' + (left <= 5000 ? ' danger' : '');
  }

  function stopTimer() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  /* =========================================================
     提交
     ========================================================= */
  function submit(isTimeout) {
    if (state.locked || !state.running) return;
    var q = QUESTIONS[state.idx];
    var left = Math.max(0, timerEnd - now());
    var leftSec = left / 1000;

    state.locked = true;
    stopTimer();
    state.playMs += Math.min(PER_Q_MS, PER_Q_MS - left);
    state.answered += 1;

    $('submitBtn').disabled = true;
    $('submitBtn').textContent = '已提交';

    var correct = !isTimeout && state.selected === q.bugLine;
    var gained = 0;
    var base = 0;
    var timeBonus = 0;
    var comboBonus = 0;

    if (correct) {
      base = q.points;
      timeBonus = Math.round(leftSec * 4);
      comboBonus = Math.min(state.combo, 4) * 25;
      gained = base + timeBonus + comboBonus;
      state.score += gained;
      state.correct += 1;
      state.combo += 1;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;
    } else {
      state.lives -= 1;
      state.combo = 0;
    }

    // 分数与生命
    var scoreEl = $('scoreVal');
    scoreEl.textContent = String(state.score);
    if (correct) {
      scoreEl.classList.remove('bump');
      void scoreEl.offsetWidth;
      scoreEl.classList.add('bump');
    }
    renderLives();
    if (!correct) {
      var hearts = $('heartBox').querySelectorAll('.heart');
      var lost = hearts[state.lives];
      if (lost) {
        lost.classList.add('breaking');
        window.setTimeout(function () { lost.classList.remove('breaking'); }, 520);
      }
    }

    var badge = $('comboBadge');
    if (state.combo >= 2) {
      badge.textContent = 'COMBO ×' + state.combo;
      badge.classList.add('on');
    } else {
      badge.classList.remove('on');
    }

    // 标记代码行
    var rows = $('codeBody').querySelectorAll('.line');
    for (var i = 0; i < rows.length; i++) {
      var n = parseInt(rows[i].getAttribute('data-line'), 10);
      var ico = rows[i].querySelector('.ico');
      rows[i].classList.remove('selected');
      if (n === q.bugLine) {
        rows[i].classList.add('correct');
        ico.textContent = '✓';
      } else if (!correct && n === state.selected) {
        rows[i].classList.add('wrong');
        ico.textContent = '✗';
      } else {
        rows[i].classList.add('dim');
      }
    }

    if (correct) {
      setEditorStatus('✓ 第 ' + q.bugLine + ' 行就是 Bug', 'ok');
    } else {
      setEditorStatus('✓ Bug 在第 ' + q.bugLine + ' 行', 'bad');
    }
    $('hintText').textContent = correct
      ? '答对了，看下解释准备下一题。'
      : (isTimeout ? '时间到，正确答案已标出。' : '答错了，正确答案已标出。');

    // 把正确行滚到可视区
    scrollLineIntoView(q.bugLine);

    showFeedback(q, correct, isTimeout, gained, base, timeBonus, comboBonus, leftSec);
  }

  function scrollLineIntoView(n) {
    try {
      var sc = $('codeScroll');
      var row = $('codeBody').querySelector('.line[data-line="' + n + '"]');
      if (!row) return;
      sc.scrollLeft = 0;
      var top = row.offsetTop - sc.clientHeight / 2 + row.offsetHeight / 2;
      sc.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    } catch (e) {}
  }

  /* =========================================================
     反馈面板
     ========================================================= */
  function showFeedback(q, correct, isTimeout, gained, base, timeBonus, comboBonus, leftSec) {
    var icon = $('fbIcon');
    var sub = $('fbSub');
    var brk = $('fbBreak');

    if (correct) {
      icon.className = 'fb-icon ok';
      icon.textContent = '✓';
      $('fbTitle').textContent = '命中！';
      sub.innerHTML = '<span class="plus">+' + gained + '</span> 分';
      brk.innerHTML =
        '<span>基础 ' + base + '</span>' +
        '<span>时间 +' + timeBonus + '（剩 ' + leftSec.toFixed(1) + 's）</span>' +
        (comboBonus > 0 ? '<span>连击 +' + comboBonus + '</span>' : '');
    } else if (isTimeout) {
      icon.className = 'fb-icon time';
      icon.textContent = '⌛';
      $('fbTitle').textContent = '时间到';
      sub.innerHTML = '<span class="minus">-1</span> 生命 · 连击清零';
      brk.innerHTML = '<span>20 秒内没有提交答案</span>';
    } else {
      icon.className = 'fb-icon bad';
      icon.textContent = '✗';
      $('fbTitle').textContent = '这只不是虫';
      sub.innerHTML = '<span class="minus">-1</span> 生命 · 连击清零';
      brk.innerHTML = '<span>你选的是第 ' + state.selected + ' 行</span>';
    }

    $('fbExp').textContent = q.explanation;

    var bugText = q.code.split('\n')[q.bugLine - 1] || '';
    $('fbLine').innerHTML = '<b>第 ' + q.bugLine + ' 行</b>\n' + escHtml(bugText.replace(/^\s+/, ''));

    var isLast = (state.idx + 1 >= QUESTIONS.length) || state.lives <= 0;
    $('nextBtn').textContent = isLast ? '查看战绩' : '下一题';

    var sheet = $('sheet');
    sheet.classList.add('open');
    sheet.setAttribute('aria-hidden', 'false');
    sheetArmed = true;
    state.locked = true;

    window.setTimeout(function () {
      try { $('nextBtn').focus({ preventScroll: true }); } catch (e) {}
    }, 260);
  }

  function closeSheet() {
    sheetArmed = false;
    var sheet = $('sheet');
    sheet.classList.remove('open');
    sheet.setAttribute('aria-hidden', 'true');
  }

  function nextQuestion() {
    if (!sheetArmed) return;
    sheetArmed = false;
    closeSheet();
    if (state.lives <= 0) { endGame('dead'); return; }
    if (state.idx + 1 >= QUESTIONS.length) { endGame('done'); return; }
    state.idx += 1;
    renderQuestion();
  }

  /* =========================================================
     结算
     ========================================================= */
  function endGame(reason) {
    state.running = false;
    stopTimer();

    var acc = state.answered > 0 ? Math.round((state.correct / state.answered) * 100) : 0;
    var rank = rankOf(state.score);
    var prevBest = best;
    var isRecord = state.score > prevBest;

    if (isRecord) {
      best = state.score;
      Store.set(best);
    }

    lastResult = {
      score: state.score,
      correct: state.correct,
      answered: state.answered,
      total: QUESTIONS.length,
      acc: acc,
      ms: state.playMs,
      clock: fmtClock(state.playMs),
      maxCombo: state.maxCombo,
      rank: rank,
      reason: reason,
      isRecord: isRecord
    };

    $('rankBadge').textContent = rank.full;
    $('finalScore').textContent = String(state.score);
    $('resultSub').innerHTML = '答对 ' + state.correct + ' 题 · 作答 ' + state.answered + ' 题' +
      (isRecord && state.score > 0 ? ' · <span class="new">新纪录</span>' : '');
    $('stAcc').textContent = acc + '%';
    $('stTime').textContent = lastResult.clock;
    $('stCombo').textContent = '×' + state.maxCombo;

    var ladder = $('rankLadder');
    ladder.innerHTML = '';
    for (var i = 0; i < RANKS.length; i++) {
      var chip = document.createElement('span');
      chip.className = 'rk' + (RANKS[i].min === rank.min ? ' on' : '');
      chip.textContent = (RANKS[i].min === 0 ? '0' : '≥' + RANKS[i].min) + ' ' + RANKS[i].short;
      ladder.appendChild(chip);
    }

    var coarse = false;
    try { coarse = window.matchMedia('(pointer: coarse)').matches; } catch (e) {}
    $('cardTip').style.display = coarse ? 'block' : 'none';
    $('saveBtn').style.display = coarse ? 'none' : 'flex';

    showScreen('result');
    renderBest();
    drawCard(lastResult);

    // 轻微延迟再滚到顶部，确保动画干净
    window.setTimeout(function () {
      try { window.scrollTo(0, 0); } catch (e) {}
    }, 40);
  }

  /* =========================================================
     成绩卡（Canvas 1080 × 1440）
     ========================================================= */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function font(size, weight, mono) {
    return (weight || 400) + ' ' + size + 'px ' +
      (mono ? '"SF Mono", Menlo, Consolas, "Courier New", monospace'
            : '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", sans-serif');
  }

  function wrapLines(ctx, text, maxWidth) {
    var lines = [];
    var cur = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch === '\n') { lines.push(cur); cur = ''; continue; }
      var test = cur + ch;
      if (ctx.measureText(test).width > maxWidth && cur) {
        lines.push(cur);
        cur = ch;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function drawCard(res) {
    var cv = $('cardCanvas');
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    var W = 1080, H = 1440;

    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // 背景
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#0a0f16');
    g.addColorStop(0.5, '#0d1117');
    g.addColorStop(1, '#0e1714');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // 顶部绿光
    var rg = ctx.createRadialGradient(W / 2, 120, 30, W / 2, 240, 760);
    rg.addColorStop(0, 'rgba(63,185,80,0.22)');
    rg.addColorStop(1, 'rgba(63,185,80,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, 820);

    // 底部琥珀光
    var ra = ctx.createRadialGradient(W - 120, H - 60, 20, W - 120, H - 60, 620);
    ra.addColorStop(0, 'rgba(240,180,41,0.12)');
    ra.addColorStop(1, 'rgba(240,180,41,0)');
    ctx.fillStyle = ra;
    ctx.fillRect(0, H - 700, W, 700);

    // 网格点
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    for (var x = 64; x < W - 40; x += 46) {
      for (var y = 60; y < H - 40; y += 46) {
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // 外框
    ctx.strokeStyle = 'rgba(255,255,255,0.075)';
    ctx.lineWidth = 2;
    roundRect(ctx, 40, 40, W - 80, H - 80, 34);
    ctx.stroke();

    // 角标
    ctx.strokeStyle = 'rgba(63,185,80,0.55)';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(40, 150); ctx.lineTo(40, 74); ctx.lineTo(116, 74); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - 40, H - 150); ctx.lineTo(W - 40, H - 74); ctx.lineTo(W - 116, H - 74); ctx.stroke();

    // 顶部小字
    ctx.textAlign = 'center';
    ctx.fillStyle = '#5b6675';
    ctx.font = font(22, 600, true);
    ctx.fillText('BUG HUNTER  ·  CODE DEBUGGING GAME', W / 2, 122);

    // 标题
    ctx.fillStyle = '#f2f7fb';
    ctx.font = font(88, 800, false);
    ctx.fillText('《Bug 猎人》', W / 2, 232);

    // 副标题
    ctx.fillStyle = '#8b98a9';
    ctx.font = font(30, 400, false);
    ctx.fillText('20 秒，找出代码里的那只虫', W / 2, 288);

    // 称号胶囊
    var rankText = res.rank.full;
    ctx.font = font(38, 700, false);
    var rw = ctx.measureText(rankText).width + 76;
    var rx = W / 2 - rw / 2;
    ctx.fillStyle = 'rgba(240,180,41,0.10)';
    ctx.strokeStyle = 'rgba(240,180,41,0.48)';
    ctx.lineWidth = 2;
    roundRect(ctx, rx, 342, rw, 74, 37);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f5c953';
    ctx.textAlign = 'center';
    ctx.fillText(rankText, W / 2, 392);

    // 得分
    ctx.font = font(26, 600, true);
    ctx.fillStyle = '#5b6675';
    ctx.fillText('本 局 得 分', W / 2, 508);

    var scoreText = String(res.score);
    ctx.font = font(196, 800, false);
    ctx.fillStyle = '#3fb950';
    ctx.shadowColor = 'rgba(63,185,80,0.45)';
    ctx.shadowBlur = 46;
    ctx.textAlign = 'center';
    ctx.fillText(scoreText, W / 2, 700);
    ctx.shadowBlur = 0;

    // 分隔线
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(120, 790); ctx.lineTo(W - 120, 790); ctx.stroke();

    // 三项数据
    var cells = [
      { v: res.acc + '%', k: '正确率' },
      { v: res.clock, k: '用时' },
      { v: '×' + res.maxCombo, k: '最高连击' }
    ];
    for (var i = 0; i < cells.length; i++) {
      var cx = 200 + i * 340;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e6edf3';
      ctx.font = font(64, 700, false);
      ctx.fillText(cells[i].v, cx, 890);
      ctx.fillStyle = '#66727f';
      ctx.font = font(24, 500, true);
      ctx.fillText(cells[i].k, cx, 934);
    }

    // 挑战文案
    var lines = [
      '我在《Bug 猎人》里拿了 ' + res.score + ' 分，',
      '称号是「' + res.rank.full + '」，',
      '你能找出几个 Bug？'
    ];
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    roundRect(ctx, 88, 1006, W - 176, 224, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(63,185,80,0.28)';
    ctx.lineWidth = 2;
    roundRect(ctx, 88, 1006, W - 176, 224, 24);
    ctx.stroke();

    ctx.fillStyle = '#c7d3e0';
    ctx.font = font(34, 500, false);
    for (var j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j], 128, 1070 + j * 56);
    }

    // 底部信息
    var url = getShareUrl();
    ctx.fillStyle = '#4f5a68';
    ctx.font = font(24, 500, true);
    ctx.textAlign = 'center';
    ctx.fillText('15 个经典 Bug · 3 条命 · 每题 20 秒', W / 2, 1300);
    if (url) {
      ctx.fillStyle = '#6f7c8b';
      ctx.font = font(26, 500, true);
      ctx.fillText(url.replace('https://', ''), W / 2, 1346);
    } else {
      ctx.fillStyle = '#6f7c8b';
      ctx.font = font(26, 500, true);
      ctx.fillText('BUG HUNTER', W / 2, 1346);
    }
    ctx.textAlign = 'left';

    // 画完同步到 <img>，移动端可直接长按保存
    try {
      var img = $('cardImage');
      if (img) img.src = cv.toDataURL('image/png');
    } catch (e) {}
  }

  function downloadCard() {
    try {
      var cv = $('cardCanvas');
      if (cv.toBlob) {
        cv.toBlob(function (blob) {
          if (!blob) { toast('生成图片失败，可长按成绩卡保存'); return; }
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'bug-hunter-' + (lastResult ? lastResult.score : 0) + '.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
          toast('成绩卡已开始下载');
        }, 'image/png');
      } else {
        var url2 = cv.toDataURL('image/png');
        var a2 = document.createElement('a');
        a2.href = url2;
        a2.download = 'bug-hunter-' + (lastResult ? lastResult.score : 0) + '.png';
        document.body.appendChild(a2);
        a2.click();
        document.body.removeChild(a2);
        toast('成绩卡已开始下载');
      }
    } catch (e) {
      toast('导出失败，可长按成绩卡保存');
    }
  }

  /* =========================================================
     复制挑战文案
     ========================================================= */
  function buildChallenge(url) {
    if (!lastResult) return '';
    var text = '我在《Bug 猎人》里拿了 ' + lastResult.score + ' 分，称号是「' +
      lastResult.rank.full + '」，你能找出几个 Bug？';
    if (url) text += '\n' + url;
    return text;
  }

  function onCopyChallenge() {
    var url = getShareUrl();

    if (!url) {
      copyText(buildChallenge('')).then(function (ok) {
        openModal(
          '没识别到分享链接',
          (ok ? '挑战文案已复制。' : '挑战文案需要手动复制。') +
          '请回到分享页，从浏览器地址栏复制链接一起发送。'
        );
      });
      return;
    }

    copyText(buildChallenge(url)).then(function (ok) {
      if (ok) {
        toast('挑战文案已复制，去炫耀吧');
      } else {
        openModal('自动复制失败', '浏览器拦截了剪贴板。下面这段文字已经全选，直接复制即可。', '挑战文案', buildChallenge(url));
        try {
          var input = $('modalInput');
          input.focus();
          input.select();
        } catch (e) {}
      }
    });
  }

  /* =========================================================
     事件绑定
     ========================================================= */
  $('startBtn').addEventListener('click', startGame);
  $('submitBtn').addEventListener('click', function () { submit(false); });
  $('nextBtn').addEventListener('click', nextQuestion);
  $('againBtn').addEventListener('click', startGame);
  $('homeBtn').addEventListener('click', function () {
    showScreen('home');
    renderBest();
  });
  $('copyBtn').addEventListener('click', onCopyChallenge);
  $('saveBtn').addEventListener('click', downloadCard);
  $('modalOk').addEventListener('click', closeModal);
  $('modal').addEventListener('click', function (e) {
    if (e.target === $('modal')) closeModal();
  });
  $('modalInput').addEventListener('focus', function () {
    try { this.select(); } catch (e) {}
  });

  document.addEventListener('keydown', function (e) {
    if ($('modal').classList.contains('open')) {
      if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); closeModal(); }
      return;
    }
    if ($('sheet').classList.contains('open')) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextQuestion(); }
      return;
    }
    if ($('screen-home').classList.contains('active')) {
      if (e.key === 'Enter') { e.preventDefault(); startGame(); }
      return;
    }
    if ($('screen-game').classList.contains('active')) {
      if ((e.key === 'Enter' || e.key === ' ') && !state.locked && state.selected) {
        e.preventDefault();
        submit(false);
      }
    }
  });

  // 初始化
  renderBest();
  renderLives();
})();
