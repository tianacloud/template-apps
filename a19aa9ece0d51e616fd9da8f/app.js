import {readState, writeState} from './storage.js';
const style=document.createElement('style');style.textContent="\n:root{--pri:#1d4ed8;--pri2:#2563eb;--bg:#f2f4f8;--card:#fff;--txt:#111827;--sub:#4b5563;--line:#d1d5db;--ok:#047857;--bad:#dc2626;--warn:#b45309;}\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\nhtml{-webkit-text-size-adjust:100%}\nbody{margin:0;background:var(--bg);color:var(--txt);font:17px/1.6 -apple-system,\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;padding-bottom:calc(104px + env(safe-area-inset-bottom));}\nbutton{font-family:inherit;touch-action:manipulation}\nheader{position:sticky;top:0;z-index:20;background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;padding:12px 16px 10px;box-shadow:0 2px 8px rgba(30,58,138,.25)}\n.hrow{display:flex;align-items:center;justify-content:space-between;gap:10px}\nh1{font-size:19px;margin:0;font-weight:700;letter-spacing:.5px}\n.hdate{font-size:13px;opacity:.9}\n.htools{display:flex;align-items:center;gap:8px}\n.hbtn{background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:999px;font-size:13px;font-weight:700;padding:6px 12px;min-height:34px;line-height:1;white-space:nowrap}\n.hbtn:active{background:rgba(255,255,255,.3)}\n.hsub{font-size:13px;opacity:.85;margin-top:2px}\nmain{padding:12px 12px 0;max-width:640px;margin:0 auto}\n.card{background:var(--card);border-radius:14px;padding:14px;margin-bottom:14px;box-shadow:0 1px 3px rgba(15,23,42,.06)}\n.card h3{margin:0 0 10px;font-size:17px}\n.cardhead{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px 10px;margin-bottom:6px}\n.cardhead h3{margin:0}\n.btns{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}\n.btns .btn{flex:1;min-height:48px;font-size:16px;font-weight:600;justify-content:center;background:var(--pri);border-color:var(--pri);color:#fff}\n.btns .btn:active{background:#1e40af}\n.btn{border:1px solid var(--line);background:#fff;border-radius:10px;padding:9px 14px;font-size:15px;color:var(--txt);min-height:42px}\n.btn:active{background:#f1f5f9}\n.btn-pri{background:var(--pri);border-color:var(--pri);color:#fff;font-weight:600}\n.btn-pri:active{background:#1e40af}\n.btn.sm{padding:8px 13px;font-size:14px;min-height:38px}\n.btn-big{width:100%;padding:15px;font-size:18px;font-weight:700;border-radius:12px;border:1px solid var(--line);min-height:54px}\n.btn-danger{background:#fee2e2;border-color:#fecaca;color:var(--bad)}\n.btn-ok{background:#ecfdf5;border-color:#a7f3d0;color:#047857}\n.btn-ok:active{background:#d1fae5}\n.linkbtn{background:none;border:0;color:var(--pri);font-size:16px;padding:12px 4px;width:100%;text-align:center;min-height:44px}\n.crow{display:flex;align-items:center;gap:10px;margin-bottom:8px}\n.crow label{font-size:16px;color:var(--txt);width:56px;flex:none;font-weight:500}\ninput,select{font-size:16px;color:var(--txt)}\n.crow input[type=date],.crow input[type=text]{flex:1;border:1px solid var(--line);border-radius:10px;padding:11px 12px;background:#fafafa;min-width:0;font-size:17px}\ninput[type=number]{width:100%;border:1px solid var(--line);border-radius:10px;padding:10px 4px;text-align:center;background:#fafafa;font-size:17px}\ninput[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{display:none}\ninput:focus{outline:none;border-color:var(--pri2);background:#fff}\ntable{width:100%;border-collapse:collapse}\nth{font-size:14px;color:var(--sub);font-weight:600;padding:8px 2px;text-align:center;border-bottom:2px solid var(--line);white-space:nowrap}\ntd{padding:9px 2px;border-bottom:1px solid #eef0f3;text-align:center;vertical-align:middle;-webkit-text-size-adjust:100%}\ntr:last-child td{border-bottom:0}\ntd.mat{text-align:left;width:36%;max-width:130px}\n.mname{font-weight:600;font-size:16px;line-height:1.35}\n.msub{font-size:13px;color:var(--sub)}\n.msub b{color:var(--pri);font-weight:600}\ntr.over .in-q{border-color:var(--bad);background:#fef2f2}\ntr.over .row-amt{color:var(--bad)}\n.amt,.row-amt{font-weight:600;font-variant-numeric:tabular-nums}\n.sumbar{display:flex;align-items:center;justify-content:space-between}\n.sumbar .st{font-size:16px}\n.sumbar b{font-size:21px;color:var(--pri);font-variant-numeric:tabular-nums}\n.statrow{display:flex;gap:10px;margin-bottom:12px}\n.pill{flex:1;background:#fff;border-radius:14px;padding:10px 12px;box-shadow:0 1px 3px rgba(15,23,42,.06)}\n.pill span{display:block;font-size:12px;color:var(--sub)}\n.pill b{font-size:19px;font-variant-numeric:tabular-nums}\n.chips{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 10px}\n.chip{border:1px solid var(--line);background:#fff;border-radius:999px;padding:10px 18px;font-size:16px;color:var(--txt);min-height:44px}\n.chip.on{background:#1d4ed8;border-color:#1d4ed8;color:#fff;font-weight:700}\n.chip.add{color:var(--pri);border-style:dashed}\n.amtwrap{display:flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:10px;padding:11px 14px;background:#fafafa}\n.amtwrap span{font-size:20px;font-weight:700;color:var(--txt)}\n.amtwrap input{flex:1;border:0;background:none;font-size:26px;font-weight:700;padding:0}\n/* 【v1.18 修】允许换行 wrap。\n   原来只有 nowrap，用车支出那种「日期+车牌+类型+备注+金额+两个按钮」共7 个元素\n   挤在一行，实测备注容器被压成 0 宽，备注内容整个消失。\n   改成 wrap 之后，再由下面的 .rmain-note 让备注区独占一行完整显示。 */\n.rrow{display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid #eef0f3;font-size:16px;flex-wrap:wrap}\n/* 【v1.18 修】费用行（用车/人工/生活）比材料行多一个「车牌」徽标，\n   一行要塞 7 个元素 + 6 个间距，实测 335px > 容器 331px —— 正好超 4px，\n   结果最右侧的删除按钮被 flex 挤到第二行。\n   把间距收到 8px（275 + 5×8 = 315px）就能稳稳排在一行内，\n   备注则由 .rmain-note 换行到下一行完整显示。 */\n.rrow-exp{gap:8px}\n/* 备注区换行到下一行，独占整行完整显示（不再被 nowrap + 省略号截断）。\n   注意不加 order：带 order 的 flex 子项会被重排到order 更大的位置之后，\n   实测 order:9 会把备注顶到 ✕ 按钮后面，把 ✕ 挤到第二行。\n   靠 DOM 顺序 + flex:1 1 100% 就够：前面的元素先排满，备注自然换行。 */\n.rrow .rmain-note{flex:1 1 100%;min-width:0;margin-top:2px}\n.rrow:last-child{border-bottom:0}\n/* 两段式记录行：上行信息、下行操作，专治窄屏挤爆 */\n.rrow2{padding:11px 0;border-bottom:1px solid #eef0f3}\n.rrow2:last-child{border-bottom:0}\n.rtop{display:flex;align-items:center;gap:10px;font-size:16px;min-width:0}\n.rtop .rmain{min-width:0}\n.rfoot{display:flex;align-items:center;gap:8px;margin-top:8px;padding-left:2px;flex-wrap:wrap}\n.rfoot .x{width:46px;height:46px;font-size:19px;border-radius:11px}\n.rfoot:empty{display:none}\n.rrow2 .ramt{font-size:18px}\n.rdate{color:var(--sub);font-size:14px;width:48px;flex:none}\n.rmain{flex:1;min-width:0}\n/* 备注（.d2）默认不限行、完整换行显示。\n   【v1.18修】原来这里是 white-space:nowrap + text-overflow:ellipsis，\n   配上下面 .rrow{flex-wrap:wrap} 之后，车险/保养这类长备注能一直换行，\n   不会被省略号截掉、也不会把后面的备注按钮挤出屏幕。 */\n.rmain .d2{color:var(--sub);font-size:13px;overflow-wrap:break-word;word-break:break-word}\n/* 行内单价片段：过长时省略号收住，绝不把金额/按钮顶出屏幕 */\n.rmain .d2.il{display:inline-block;max-width:100%;vertical-align:bottom}\n.ramt{font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;font-size:17px}\n.ramt .wbig{display:block}\n.ramt .wraw{display:block;font-size:12px;font-weight:400;color:#6b7280;line-height:1.2}\n.x{border:0;background:#f3f4f6;color:#6b7280;width:36px;height:36px;border-radius:10px;font-size:15px;padding:0;flex:none}\n.x:active{background:#fee2e2;color:var(--bad)}\n/* ✎ 修改记录按钮 */\n.rrow .x[data-act=\"editMatRec\"]{background:#eff6ff;color:#1d4ed8}\n.rrow .x[data-act=\"editMatRec\"]:active{background:#dbeafe}\n.tag{font-size:12px;padding:3px 9px;border-radius:7px;flex:none;font-weight:700}\n.ti{background:#eef2ff;color:#4f46e5}\n.ts{background:#ecfdf5;color:#059669}\n.tagw{background:#fff7ed;color:#c2410c}\n.tp{background:#e0e7ff;color:#3730a3}\n/* 回款状态：字号加大、按钮加高，方便年纪大的用户点按 */\n.tag.paid{background:#dcfce7;color:#15803d;font-size:14px;padding:6px 12px}\n.tag.unpaid{background:#fee2e2;color:#b91c1c;font-size:14px;padding:6px 12px}\n.paybtn{border:2px solid var(--pri);background:#fff;border-radius:11px;padding:11px 18px;font-size:17px;font-weight:800;color:var(--pri);flex:none;min-height:50px;line-height:1.2}\n.paybtn:active{background:#eef2ff}\n.paybtn::before{content:'👆';margin-right:6px;font-size:16px}\n.cashbanner{background:linear-gradient(135deg,#b45309,#d97706);color:#fff;border-radius:14px;padding:12px 14px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between}\n.cashbanner .l{font-size:14px;color:#fef3c7}\n.cashbanner .v{font-size:27px;font-weight:700;font-variant-numeric:tabular-nums;margin-top:2px;color:#fff}\n.cashbanner .s{font-size:12px;color:#fef3c7;text-align:right;line-height:1.6}\n.refrow td{background:#f8fafc;color:#6b7280;font-size:13px;padding:6px 2px}\n.refrow .amt{font-weight:500}\n.nums{font-variant-numeric:tabular-nums;white-space:nowrap}\n.pct{font-size:14px;font-weight:700;white-space:nowrap}\n.pos{color:var(--ok)}\n.neg{color:var(--bad)}\n.hint{font-size:14px;color:var(--sub);margin:4px 0 10px;line-height:1.55}\n.more{font-size:13px;color:#6b7280;text-align:center;padding-top:8px}\n.stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}\n.stat{background:#fff;border-radius:14px;padding:10px 12px;box-shadow:0 1px 3px rgba(15,23,42,.06)}\n.stat .l{font-size:14px;color:var(--sub)}\n.stat .v{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums;margin-top:2px;word-break:break-all}\n.stat.net .v{font-size:26px;line-height:1.15}\n.stat .s{font-size:13px;color:var(--sub)}\n.net{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff}\n.net .l,.net .s{color:#dbeafe}\n.net .v{font-size:29px}\n.net .v,.net2 .v{color:#fff!important}\n.net2{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#065f46,#047857);color:#fff}\n.net2 .l,.net2 .s{color:#d1fae5}\n.net2 .v{font-size:27px}\n.blk{border-left:5px solid var(--pri)}\n/* 板块辨识色条 */\n.cardhead h3{display:flex;align-items:center;gap:8px;flex:1;min-width:0}\n.bmk{width:6px;height:20px;border-radius:3px;background:var(--pri);flex:none}\n.b-mat{background:#2563eb}\n.b-car{background:#ea580c}\n.b-lab{background:#7c3aed}\n.b-life{background:#059669}\n.b-inc{background:#0891b2}\n.b-ore{background:#db2777}\n.b-pnl{background:#1d4ed8}\n.card h3 .ico{font-size:19px;line-height:1}\n.secbar{display:flex;align-items:center;gap:8px;background:#eef2f7;border-radius:10px;padding:9px 12px;margin:10px 0 8px;font-size:16px;font-weight:700;color:#1f2937}\n.secbar .dot{width:10px;height:10px;border-radius:50%;flex:none}\n/* 车牌选择式录入 */\n.ptab{display:inline-block;padding:9px 18px;margin-right:8px;border-radius:10px 10px 0 0;background:#eef2f7;font-size:15px;font-weight:600;color:var(--sub)}\n.ptab.on{background:var(--pri);color:#fff}\n.plrow{display:flex;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid #eef0f3}\n.plrow.fixed{gap:10px}\n.plrow .plname{flex:1;font-size:16px;font-weight:600;color:var(--sub)}\n/* 车牌显示块（像真车牌，点一下弹键盘选字） */\n.plbox{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:4px;border:1px solid var(--line);border-radius:12px;padding:16px 12px;background:#fafafa}\n.plbox .pc{font-size:30px;font-weight:800;letter-spacing:1px;min-width:20px;text-align:center;border-radius:6px;padding:0 3px;line-height:1.2}\n.plbox .pd{width:13px;height:13px;border-radius:50%;background:#cbd5e1;flex:none;margin:0 5px}\n.plbox .ph{font-size:18px;color:#9ca3af;font-weight:500}\n.plbox.on{border-color:var(--pri);background:#eef2ff}\n.plbox.on .pd{background:var(--pri)}\n/* 当前光标所在位：加底色方块，一眼看出填到哪一位 */\n.plbox .pc.cur{background:var(--pri);color:#fff;box-shadow:0 0 0 3px #bfdbfe}\n.plbox .pd.cur{background:var(--pri);box-shadow:0 0 0 4px #bfdbfe;width:16px;height:16px;margin:0 6px}\n/* 车牌虚拟键盘 */\n.plkb{margin-top:8px;border:1px solid var(--line);border-radius:12px;padding:10px;background:#f8fafc}\n/* 键盘顶部：大号车牌实时预览（蓝底白字，像真车牌；光标位反白） */\n.plkb .kbdisp{display:flex;align-items:center;justify-content:center;gap:6px;background:var(--pri);border-radius:14px;padding:14px 10px;box-shadow:inset 0 0 0 3px rgba(255,255,255,.3),0 2px 8px rgba(29,78,216,.25)}\n.plkb .kbdisp .dc{min-width:34px;text-align:center;font-size:36px;font-weight:800;color:#fff;line-height:1.25;border-radius:7px;padding:0 3px}\n.plkb .kbdisp .dc.empty::before{content:'';display:inline-block;width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.38);vertical-align:middle}\n.plkb .kbdisp .dc.cur{background:#fff;color:var(--pri);box-shadow:0 0 0 3px rgba(255,255,255,.4)}\n.plkb .kbdisp .dc.cur.empty::before{background:rgba(29,78,216,.35)}\n.plkb .kbdisp .dsep{width:11px;height:11px;border-radius:50%;background:rgba(255,255,255,.9);flex:none;margin:0 5px}\n.plkb .kbsub{display:flex;align-items:center;justify-content:space-between;font-size:14px;font-weight:600;color:#6b7280;margin:9px 2px 0}\n.plkb .kbsub b{color:var(--pri);font-size:15px}\n.plkb .kblb{font-size:13px;font-weight:700;color:#6b7280;margin:8px 0 6px}\n.plkb .kbg{display:grid;gap:6px}\n.plkb .kbg.prov{grid-template-columns:repeat(7,1fr)}\n.plkb .kbg.ln{grid-template-columns:repeat(9,1fr)}\n.plkb button.k{min-height:52px;border:1px solid var(--line);border-radius:10px;background:#fff;font-size:22px;font-weight:700;color:var(--txt)}\n.plkb .kbg.ln button.k{min-height:48px}\n.plkb button.k:active{background:#e0e7ff}\n.plkb button.k.on{background:var(--pri);color:#fff;border-color:var(--pri)}\n/* 已完成的部分自动收起，把关键盘放大 */\n.plkb .fold{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px dashed var(--line);border-radius:10px;padding:10px 12px;background:#fff;margin:6px 0 2px;font-size:14px;font-weight:700;color:var(--sub)}\n.plkb .fold b{color:var(--pri);font-size:16px}\n.plkb .fold .re{font-size:13px;color:#2563eb;font-weight:600;border:1px solid #bfdbfe;background:#eff6ff;border-radius:8px;padding:6px 12px}\n.plkb .more{padding:10px 12px;border:1px dashed var(--line);border-radius:10px;background:#fff;font-size:14px;font-weight:700;color:#2563eb}\n.plkb .krow{display:flex;gap:6px;margin-top:8px}\n.plkb .krow .k{flex:1;font-size:14px;min-height:44px}\n.plkb .krow .k.ok{background:var(--pri);color:#fff;border-color:var(--pri);flex:1.3}\n.mbar{display:flex;align-items:center;gap:8px}\n.mbar input[type=month]{flex:1;border:1px solid var(--line);border-radius:10px;padding:11px 10px;background:#fafafa;text-align:center;font-size:17px}\n.mb{border:1px solid var(--line);background:#fff;border-radius:10px;width:46px;height:46px;font-size:22px;color:var(--pri);flex:none;font-weight:700}\n.wt{font-size:13px;color:#fff;background:var(--bad);border-radius:7px;padding:3px 8px;font-weight:700}\n.mrow{display:flex;gap:6px;align-items:center;margin-bottom:8px}\n.mrow input[type=text]{flex:1;border:1px solid var(--line);border-radius:10px;padding:11px 10px;background:#fafafa;min-width:0;font-size:17px}\n.mrow .f-unit{flex:none;width:58px}\n.mrow .f-min{flex:none;width:64px}\n.mrow.marked{opacity:.45}\n.mrow.marked input{text-decoration:line-through}\n.xbtn{border:0;background:#f3f4f6;color:#6b7280;width:40px;height:40px;border-radius:10px;flex:none;font-size:16px}\n.mrow.marked .xbtn{background:var(--bad);color:#fff}\nnav{position:fixed;bottom:0;left:0;right:0;display:flex;background:#fff;border-top:1px solid var(--line);padding-bottom:env(safe-area-inset-bottom);z-index:30;box-shadow:0 -2px 10px rgba(15,23,42,.05)}\nnav button{flex:1;background:none;border:0;padding:10px 0 8px;font-size:14px;font-weight:600;color:var(--sub);display:flex;flex-direction:column;align-items:center;gap:3px;min-height:64px}\nnav button.on{color:var(--pri);font-weight:700;background:#eef2ff}\nnav button.on svg{transform:scale(1.08)}\nnav svg{width:26px;height:26px}\n#modal{position:fixed;inset:0;background:rgba(15,23,42,.5);display:none;align-items:flex-end;z-index:50}\n#modal.show{display:flex}\n.sheet{background:#fff;border-radius:18px 18px 0 0;padding:18px 16px calc(16px + env(safe-area-inset-bottom));max-height:85vh;overflow:auto;width:100%}\n.shead{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}\n.shead h3{margin:0;font-size:18px}\n#toast{position:fixed;left:50%;bottom:calc(100px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(20px);background:rgba(15,23,42,.92);color:#fff;font-size:16px;padding:12px 22px;border-radius:999px;opacity:0;transition:.25s;z-index:60;pointer-events:none;max-width:86%;text-align:center}\n#toast.show{opacity:1;transform:translateX(-50%) translateY(0)}\ndetails.tips summary{font-size:16px;font-weight:600;cursor:pointer;list-style:none;padding:4px 0}\ndetails.tips summary::before{content:\"▸ \";color:var(--pri)}\ndetails.tips[open] summary::before{content:\"▾ \"}\ndetails.tips ul{margin:10px 0 0;padding-left:20px;font-size:15px;color:#374151;line-height:1.7}\ndetails.tips li{margin-bottom:6px}\n.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}\n.print-only{display:none}\n/* 打印预览弹层 */\n#pv{position:fixed;inset:0;background:#eef1f5;z-index:80;display:none;flex-direction:column}\n#pv.show{display:flex}\n#pvBar{background:#fff;border-bottom:1px solid var(--line);padding:10px 12px calc(10px + env(safe-area-inset-bottom));display:flex;gap:8px;align-items:center;flex-wrap:wrap;flex:none;padding-bottom:10px}\n#pvBar .t{font-size:14px;font-weight:600;flex:1}\n#pvBody{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:12px}\n#pvPaper{background:#fff;max-width:760px;margin:0 auto;padding:20px 16px;border-radius:8px;box-shadow:0 2px 12px rgba(15,23,42,.12);color:#111}\n#pvPaper h2{margin:0 0 4px;font-size:19px}\n#pvPaper .pd{font-size:12px;color:#6b7280;margin-bottom:14px;padding-bottom:10px;border-bottom:1px dashed #d1d5db}\n#pvPaper h3{font-size:15px;margin:16px 0 6px;color:#1d4ed8}\n#pvPaper table{width:100%;border-collapse:collapse;font-size:13px}\n#pvPaper th,#pvPaper td{border:1px solid #d1d5db;padding:6px 8px;text-align:left}\n#pvPaper th{background:#f3f4f6;font-weight:600;white-space:nowrap}\n#pvPaper td.n,#pvPaper th.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}\n#pvPaper .sum{margin-top:10px;font-size:14px;font-weight:700;text-align:right;color:#1d4ed8}\n#pvPaper .kv{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f0f1f4;font-size:14px}\n#pvPaper .kv b{font-variant-numeric:tabular-nums}\n#pvPaper .kv.big{border-top:2px solid #1d4ed8;border-bottom:0;margin-top:6px;padding-top:10px;font-size:16px;font-weight:700;color:#1d4ed8}\n@media print{\n #pv{position:static;display:block;background:#fff}\n #pvBar{display:none}\n #pvBody{padding:0;overflow:visible}\n #pvPaper{box-shadow:none;padding:0;max-width:100%;border-radius:0}\n}\n@media print{\n @page{margin:12mm}\n body{background:#fff;padding:0}\n header,nav,.no-print{display:none!important}\n main{max-width:100%;padding:0}\n .card,.stat,.pill{box-shadow:none;border:1px solid #d1d5db;page-break-inside:avoid;border-radius:6px}\n .print-only{display:block;margin-bottom:12px}\n .printhead h2{margin:0 0 4px;font-size:20px}\n .printhead .pd{font-size:12px;color:#4b5563}\n input,select{border:none!important;background:none!important;padding:0!important}\n .net{background:none;color:#111}\n .net .l,.net .s{color:#4b5563}\n}\n";document.head.appendChild(style);
document.body.innerHTML="\n<header>\n  <div class=\"hrow\"><h1>建材进销存助手</h1><div class=\"htools\"><span class=\"hdate\" id=\"hdate\"></span><button class=\"hbtn\" data-act=\"fontScale\" title=\"点我放大或缩小字号，方便查看\" type=\"button\">字 标准</button></div></div>\n  <div class=\"hsub\">支出 · 收入 · 利润 · 库存，一部手机管清账</div>\n</header>\n<main id=\"view\"></main>\n<nav id=\"nav\"></nav>\n<div id=\"modal\"></div>\n<div id=\"pv\"><div id=\"pvBar\"></div><div id=\"pvBody\"><div id=\"pvPaper\"></div></div></div>\n<div id=\"toast\"></div>\n<input accept=\".json,application/json\" hidden id=\"importFile\" type=\"file\">\n<datalist id=\"units\"><option>吨</option><option>方</option><option>块</option><option>包</option><option>桶</option><option>袋</option><option>根</option><option>张</option><option>件</option><option>车</option></datalist>\n";
'use strict';
/* ================= 工具 ================= */
const $=s=>document.querySelector(s);
const R2=n=>Math.round((+n||0)*100)/100;
const fmtN=n=>R2(n).toLocaleString('zh-CN',{maximumFractionDigits:2});
const fmtM=n=>'¥'+fmtN(n);
/* 单价专用：加权平均后常出现多位小数，这里固定保留 2 位，看起来是"实实在在的单价" */
const fmtP=n=>(+n||0).toFixed(2);
/* 大额压缩展示：≥1万用「万」，≥1亿用「亿」，保留最多2位小数；万以下走原千分位 */
const fmtW=n=>{
 const v=R2(n);
 const a=Math.abs(v);
 if(a<10000)return fmtN(v);
 if(a<1e8)return R2(v/10000).toLocaleString('zh-CN',{maximumFractionDigits:2})+'万';
 return R2(v/1e8).toLocaleString('zh-CN',{maximumFractionDigits:2})+'亿';
};
const fmtMW=n=>'¥'+fmtW(n);
/* 大额记录行的双行展示：上行 万/亿 简写，下行 完整千分位小字 */
const wSplit=n=>{
 const a=Math.abs(R2(n));
 if(a<10000)return null;
 return {big:fmtW(n),raw:fmtN(n)};
};
const amtHTML=n=>{const s=wSplit(n);return s?`<span class="wbig">${s.big}</span><span class="wraw">${s.raw}</span>`:fmtM(n);};
const amtW=n=>{const s=wSplit(n);return s?s.big:fmtM(n);};
/* 记录总价兜底：老数据迁移后可能缺 total 字段，用 单价×数量 兜底 */
const recTotal=r=>r.total!=null?r.total:(r.price||0)*(r.qty||0);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const todayStr=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const WEEK=['日','一','二','三','四','五','六'];
function stepMonth(m,d){const y=+m.slice(0,4),mo=+m.slice(5,7);const dt=new Date(y,mo-1+d,1);return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0');}
function toast(msg){const t=$('#toast');t.textContent=(document.getElementById('sync-status')?.textContent==='正在保存…' && /已保存|已删除|已清空|已还原|已导入/.test(msg))?'正在保存到云端…':msg;t.classList.add('show');clearTimeout(toast._tm);toast._tm=setTimeout(()=>t.classList.remove('show'),2200);}
function dlFile(name,content,mime){const b=new Blob([content],{type:mime});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);}
function csv(rows){return '\uFEFF'+rows.map(r=>r.map(c=>{c=(c??'')+'';return /[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c;}).join(',')).join('\r\n');}

/* ================= 数据 ================= */
const KEY='jiancai_jcxsc_v1';
const BK_KEY='jiancai_jcxsc_backups_v1';
const BK_MAX=20;
/* 支出分组：mat=材料支出(有明细表) car=用车 lab=人工 life=生活 */
const EXP_GROUPS=[
 {k:'car', n:'用车支出', types:['调车费','加油费','维修费','过路费','停车费','保险']},
 {k:'lab', n:'人工支出', types:['搬运费','装卸费','临时工','司机工资']},
 {k:'life',n:'生活支出', types:['购物','请客','餐费','水电费','其他']}
];
const GRP_NAME={car:'用车支出',lab:'人工支出',life:'生活支出'};
/* 内置材料固定 ID：保证每次打开都是同一个ID，草稿/记录不会错位 */
const BUILTIN_MATS=[['水泥','吨','m_cement'],['石子','方','m_stone'],['河沙','方','m_sand'],['毛石','方','m_rubble'],['红砖','块','m_brick'],['水泥砖','块','m_cbrick'],['轻质砖','块','m_lbrick']];
function defaultDB(){
 const expGroups={};EXP_GROUPS.forEach(g=>expGroups[g.k]=g.types.slice());
 return {materials:BUILTIN_MATS.map(a=>({id:a[2],name:a[0],unit:a[1],min:0,archived:false})),
  expGroups, expTypes:['搬运费','车费','油费'],
  /* plates 车牌号列表；plateTypes 车牌↔费用类型绑定；selPlate 当前选中车牌(非持久) */
  plates:['未指定车牌'], plateTypes:{'未指定车牌':EXP_GROUPS[0].types.slice()},
  purchases:[],sales:[],otherIncome:[],incomeTypes:['装卸费收入','送货费','退货退款','其他收入'],
  expenses:[],changes:[]};
}
/* 旧数据迁移：expTypes -> expGroups；记录补 grp 字段；内置材料ID归正 */
function migrate(d){
 // 老版本内置材料用的是随机ID，按名称换成固定ID（同步改记录里的引用）
 const fixMap={};
 (d.materials||[]).forEach(m=>{
  const b=BUILTIN_MATS.find(x=>x[0]===m.name);
  if(b&&m.id!==b[2]){
   const oldId=m.id;
   if((d.purchases||[]).some(r=>r.mid===b[2])||(d.sales||[]).some(r=>r.mid===b[2])){
    // 固定ID已被占用，保留原有随机ID不动
   }else{
    m.id=b[2];fixMap[oldId]=b[2];
   }
  }
 });
 const remap=arr=>(arr||[]).forEach(r=>{if(fixMap[r.mid])r.mid=fixMap[r.mid];});
 remap(d.purchases);remap(d.sales);remap(d.changes);
 if(!d.expGroups){
  d.expGroups={car:['调车费','加油费','维修费'],lab:['搬运费'],life:['购物','请客']};
  (d.expTypes||[]).forEach(t=>{
   if(/搬运|装卸|人工|工钱/.test(t)){ if(!d.expGroups.lab.includes(t))d.expGroups.lab.push(t); }
   else if(/车|油|调|维修|过路|停车/.test(t)){ if(!d.expGroups.car.includes(t))d.expGroups.car.push(t); }
   else { if(!d.expGroups.life.includes(t))d.expGroups.life.push(t); }
  });
 }
 EXP_GROUPS.forEach(g=>{if(!Array.isArray(d.expGroups[g.k]))d.expGroups[g.k]=g.types.slice();});
 (d.expenses||[]).forEach(r=>{
  if(r.grp)return;
  if(/搬运|装卸|人工|工钱|临时工|司机/.test(r.type))r.grp='lab';
  else if(/车|油|调|维修|过路|停车|保险/.test(r.type))r.grp='car';
  else r.grp='life';
 });
 if(!Array.isArray(d.incomeTypes))d.incomeTypes=['装卸费收入','送货费','退货退款','其他收入'];
 if(!Array.isArray(d.otherIncome))d.otherIncome=[];
 /* 车牌号：老数据无此字段 → 建默认车牌；已有记录补 plate；车牌↔类型绑定补齐 */
 if(!Array.isArray(d.plates)||!d.plates.length)d.plates=['未指定车牌'];
 if(!d.plateTypes||typeof d.plateTypes!=='object')d.plateTypes={};
 d.plates.forEach(p=>{if(!Array.isArray(d.plateTypes[p]))d.plateTypes[p]=EXP_GROUPS[0].types.slice();});
 (d.expenses||[]).forEach(r=>{if(r.grp==='car'&&!r.plate)r.plate='未指定车牌';});
 /* 历史记录里出现过的车牌若不在列表，自动补进去（不丢数据） */
 (d.expenses||[]).forEach(r=>{if(r.grp==='car'&&r.plate&&!d.plates.includes(r.plate)){d.plates.push(r.plate);d.plateTypes[r.plate]=EXP_GROUPS[0].types.slice();}});
 return d;
}
let db=defaultDB(), backups=[], settings={}, persistedDraft=null;
function getBackups(){return backups;}
function setBackups(a){backups=a.slice(-BK_MAX);}
function snapshot(label){const list=getBackups();list.push({id:uid(),ts:Date.now(),label:label||'',data:JSON.stringify(db)});setBackups(list);}
function persist(){writeState({db,backups,settings,draft:DRAFT});}
function save(opt){const o=opt||{};if(o.snap!==false)snapshot(o.label||'');persist();}

/* ================= 页面状态 ================= */
let tab='buy';
let pMonth=todayStr().slice(0,7), pAll=false;
let expSel=null;           // 当前选中的支出类型（兼容旧引用）
let selByGroup={};         // 各费用组当前选中的类型 {用车:'加油',人工:'搬运费',生活:'购物'}
let buySeg='all';          // 支出页分段：all | mat | car | lab | life
let incSeg='all';          // 收入页分段：all | mat | other
let buyEntryDate='';       // 材料支出「录入日期」：空=今天；切到非当天后清空/保存都不再跳回今天
const TABS=[{k:'buy',n:'支出'},{k:'sell',n:'收入'},{k:'profit',n:'利润'},{k:'stock',n:'库存'}];
const ICONS={
 buy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v10"/><path d="M8 9l4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
 sell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H4v8l10 10 8-8z"/><circle cx="8" cy="6" r="1.5"/></svg>',
 profit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M6 21V11"/><path d="M12 21V4"/><path d="M18 21v-8"/></svg>',
 stock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v9"/></svg>'
};

/* ================= 核算 ================= */
const matById=id=>db.materials.find(m=>m.id===id);
const matName=id=>{const m=matById(id);return m?m.name:'(已删除)';};
function lastPriceOf(list,mid){let best=null;for(const r of list){if(r.mid!==mid)continue;if(!best||r.date>best.date||(r.date===best.date&&r.ts>best.ts))best=r;}return best?best.price:null;}
function lastPriceOn(list,mid,date){let best=null;for(const r of list){if(r.mid!==mid||r.date!==date)continue;if(!best||r.ts>best.ts)best=r;}return best?best.price:null;}
/* 草稿记忆：单价/数量填入后保留，跨页面切换不丢；按天自动重置 *
 *
 * 【v1.19 修正】原来「草稿为空」＝「去数据库里翻历史价/当天累计数量」，
 * 于是 saveBuy() 保存后 delete 掉草稿，重绘时 draftQty() 又把
 * 「当天同材料数量求和」填回输入框 —— 用户以为没存，隔天又点一次保存，
 * 数量直接翻倍。这是本版要根治的核心问题。
 *
 * 新规则：**显式值优先（explicit wins）**
 *   - DRAFT.prices[mid] / DRAFT.qtys[mid] 只要键存在，就原样使用（含空串 ''）
 *   - 数量彻底取消任何兜底，只认「用户亲手输入且尚未提交」的值
 *   - 单价只在「键不存在」时才回落到历史价
 *   - cleared（布尔）：用户点过「清空」，所有没有显式值的材料一律不回填
 *     用布尔替代原来的 clearedMids 快照 —— 快照只覆盖点清空那一刻的材料，
 *     之后新增/取消归档的材料会漏网并被回填历史价，属于结构性缺陷。 */
const DRAFT_KEY='jiancai_jcxsc_draft';
let DRAFT={date:'',prices:{},qtys:{},note:'',cleared:false};
function draftLoad(){
 try{const d=persistedDraft||{};
  if(d&&d.date===todayStr())DRAFT=Object.assign({date:'',prices:{},qtys:{},note:'',cleared:false},d);
  else DRAFT={date:todayStr(),prices:{},qtys:{},note:'',cleared:false};
  delete DRAFT.clearedMids;   // 清理旧版字段（已被布尔 cleared 取代）
 }catch(e){DRAFT={date:todayStr(),prices:{},qtys:{},note:'',cleared:false};}
}
/* 跨午夜保护：App 挂后台过零点后，DRAFT.date 还停在昨天，
   会让草稿一直按昨天回落。renderBuy() 每次重绘前先滚到新的一天。 */
function draftRoll(){
 if(DRAFT.date!==todayStr()){
  DRAFT={date:todayStr(),prices:{},qtys:{},note:'',cleared:false};
  draftSave();
 }
}
function draftSave(){
 persist();
}
/* 单价取值优先级（v1.19 调整为「显式值优先」）：
     ① DRAFT.prices[mid] 键存在 → 原样返回（即使用户手工清成空串）
     ② cleared=true（用户点过「清空」）→ 返回空，绝不回填
     ③ 所选录入日期当天已录的进价
     ④ 最近一次进价

   回落基准用的是 buyEntryDate（用户手选的录入日期）而不是 DRAFT.date：
   DRAFT.date 只在启动时写一次，App 挂后台过零点后就过期了；
   buyEntryDate 为空时每次调用都取「此刻的今天」，不会把账记到昨天。 */
function draftHas(map,key){return Object.prototype.hasOwnProperty.call(map,key);}
function draftPrice(mid){
 if(draftHas(DRAFT.prices,mid)){
  const v=DRAFT.prices[mid];
  return v==null?'':v;
 }
 if(DRAFT.cleared)return '';
 const d=buyEntryDate||todayStr();
 const t=lastPriceOn(db.purchases,mid,d);
 if(t!=null)return t;
 return lastPriceOf(db.purchases,mid);
}
/* 按名称生成稳定ID：同名材料永远同一ID */
function stableId(name){return 'm_'+String(name).replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g,'');}
function draftSum(){
 let sum=0;
 db.materials.filter(m=>!m.archived).forEach(m=>{
  const p=+draftPrice(m.id)||0,q=+draftQty(m.id)||0;
  if(p>0&&q>0)sum+=p*q;
 });
 return sum;
}
function draftQty(mid){
 /* 【核心修复】彻底取消「当天同材料数量求和」的自动回填。
    那条兜底把已经保存的数量重新变成一个可提交的输入值 ——
    用户不修改直接再点保存，数量就翻倍，这正是重复记账的根源。
    现在数量只认「用户亲手输入且尚未提交」的草稿值，没有就一律为空。 */
 if(draftHas(DRAFT.qtys,mid)){
  const v=DRAFT.qtys[mid];
  return v==null?'':v;
 }
 return '';
}
/* 移动加权平均法：按日期顺序逐笔滚算库存成本 */
function ledgerStats(){
 const per={};db.materials.forEach(m=>per[m.id]={qty:0,avg:0,val:0});
 const agg={};
 const evs=[];
 db.purchases.forEach(r=>evs.push({k:0,date:r.date,ts:r.ts,r}));
 db.sales.forEach(r=>evs.push({k:1,date:r.date,ts:r.ts,r}));
 evs.sort((a,b)=>a.date===b.date?a.ts-b.ts:(a.date<b.date?-1:1));
 for(const e of evs){
  const st=per[e.r.mid];if(!st)continue;
  const mk=e.date.slice(0,7);
  if(e.k===0){const nq=st.qty+e.r.qty;if(nq>0)st.avg=((st.avg*st.qty)+(e.r.price*e.r.qty))/nq;st.qty=nq;}
  else{const cogs=st.avg*e.r.qty;st.qty=Math.max(0,st.qty-e.r.qty);const a=agg[mk]||(agg[mk]={rev:0,cogs:0});a.rev+=recTotal(e.r);a.cogs+=cogs;}
 }
 let totalVal=0;for(const k in per){per[k].val=per[k].avg*per[k].qty;totalVal+=per[k].val;}
 const exp={};
 db.expenses.forEach(r=>{const mk=r.date.slice(0,7);const o=exp[mk]||(exp[mk]={total:0,by:{}});o.total+=r.amount;o.by[r.type]=(o.by[r.type]||0)+r.amount;});
 return {per,agg,exp,totalVal};
}

/* ================= 导航 ================= */
function renderNav(){
 $('#nav').innerHTML=TABS.map(t=>`<button class="${tab===t.k?'on':''}" data-act="tab" data-v="${t.k}">${ICONS[t.k]}<span>${t.n}</span></button>`).join('');
}
function render(){
 renderNav();
 if(tab==='buy')renderBuy();
 else if(tab==='sell')renderSell();
 else if(tab==='stock')renderStock();
 else renderProfit();
 /* 保存后不再强制滚回顶部，保持当前位置 */
}

/* ================= 记录列表 ================= */
const CAP=100;
function recList(list,fmtFn){
 const arr=[...list].sort((a,b)=>b.date===a.date?b.ts-a.ts:(b.date<a.date?-1:1));
 const show=arr.slice(0,CAP);
 if(!show.length)return '<div class="hint" style="text-align:center;padding:8px 0">暂无记录</div>';
 let h=show.map(fmtFn).join('');
 if(arr.length>CAP)h+=`<div class="more">仅显示最近 ${CAP} 条，导出 CSV 可查看全部</div>`;
 return h;
}
function delBtn(arrName,id){return `<button class="x no-print" data-del="${arrName}" data-id="${esc(id)}">✕</button>`;}

/* ================= 记录编辑（点 ✎ 改单价/数量/金额/日期） ================= */
let editRec={arr:null,id:null};
function openEditRec(arrName,id){
 const r=(db[arrName]||[]).find(x=>x.id===id);
 if(!r){toast('记录不存在');return;}
 editRec={arr:arrName,id};
 const isMat=(arrName==='purchases');
 const title=isMat?'修改材料支出':(arrName==='expenses'?('修改'+(GRP_NAME[r.grp]||'支出')):'修改收入');
 const head=`<div class="shead"><h3>${title}</h3><button class="btn sm" data-act="closeModal">关闭</button></div>`;
 const dateRow=`<div class="crow"><label>日期</label><input type="date" id="edDate" value="${esc(r.date||todayStr())}"></div>`;
 const noteRow=`<div class="crow"><label>备注</label><input type="text" id="edNote" value="${esc(r.note||'')}" placeholder="选填"></div>`;
 let body='';
 if(isMat){
  body=`<div class="crow"><label>材料</label><input type="text" id="edMatName" value="${esc(matName(r.mid))}" style="flex:1;border:1px solid var(--line);border-radius:10px;padding:11px 10px;background:#fafafa;font-size:17px;font-weight:700"></div>
  <div class="crow"><label>单位</label><input type="text" id="edMatUnit" value="${esc(matById(r.mid)?.unit||'')}" placeholder="如 吨 / 方 / 包" style="flex:1;border:1px solid var(--line);border-radius:10px;padding:11px 10px;background:#fafafa;font-size:17px"></div>
  <div class="crow"><label>单价</label><div class="amtwrap" style="flex:1"><span>¥</span><input id="edPrice" type="number" step="any" inputmode="decimal" value="${r.price}"></div></div>
  <div class="crow"><label>数量</label><div class="amtwrap" style="flex:1"><input id="edQty" type="number" step="any" inputmode="decimal" value="${r.qty}"></div></div>
  <div class="crow"><label>金额</label><div style="flex:1;font-size:20px;font-weight:800;color:#1d4ed8" id="edSum">${fmtN(r.total)}</div></div>`;
 }else if(arrName==='expenses'){
  body=`<div class="crow"><label>类型</label><div style="flex:1;font-weight:700;font-size:17px">${esc(r.type)}${r.grp==='car'?'　'+esc(r.plate||'未指定车牌'):''}</div></div>
  <div class="crow"><label>金额</label><div class="amtwrap" style="flex:1"><span>¥</span><input id="edAmt" type="number" step="any" inputmode="decimal" value="${r.amount}"></div></div>`;
 }else{
  body=`<div class="crow"><label>类型</label><div style="flex:1;font-weight:700;font-size:17px">${esc(r.type||'材料销售')}</div></div>
  <div class="crow"><label>金额</label><div class="amtwrap" style="flex:1"><span>¥</span><input id="edAmt" type="number" step="any" inputmode="decimal" value="${r.total!=null?r.total:r.amount}"></div></div>`;
 }
 openModal(head+`<div class="hint">改完点下面保存；金额小计会自动重算，库存/利润同步更新。</div>`+dateRow+body+noteRow+
  `<button class="btn btn-pri btn-big" data-act="saveEditRec">保存修改</button>`);
 if(isMat){
  const up=()=>{const p=+$('#edPrice').value||0,q=+$('#edQty').value||0;const t=$('#edSum');if(t)t.textContent=fmtN(R2(p*q));};
  const a=$('#edPrice'),b=$('#edQty');
  if(a)a.oninput=up;if(b)b.oninput=up;
 }
}
function saveEditRec(){
 const {arr,id}=editRec;
 const list=db[arr]||[];const r=list.find(x=>x.id===id);
 if(!r){toast('记录不存在');closeModal();return;}
 const date=($('#edDate')&&$('#edDate').value)||r.date;
 const note=$('#edNote')?$('#edNote').value.trim():r.note;
 if(arr==='purchases'){
  const p=R2(+$('#edPrice').value||0),q=R2(+$('#edQty').value||0);
  if(!(p>0&&q>0)){toast('单价和数量都要大于 0');return;}
  /* 材料名/单位改了：同一材料的所有记录一起改（按 ID 认，不会串到别的材料） */
  if($('#edMatName')){
   const nm=$('#edMatName').value.trim();
   const un=$('#edMatUnit')?$('#edMatUnit').value.trim():'';
   const m=matById(r.mid);
   if(m){
    if(!nm){toast('材料名称不能为空');return;}
    const dup=db.materials.find(x=>x.id!==m.id&&x.name.replace(/\s/g,'')===nm.replace(/\s/g,''));
    if(dup){toast('已存在同名材料「'+nm+'」，请用那个名字');return;}
    m.name=nm;m.unit=un;
   }
  }
  r.price=p;r.qty=q;r.total=R2(p*q);r.date=date;r.note=note;r.ts=Date.now();
  save({label:'修改材料支出'});
 }else if(arr==='expenses'){
  const a=R2(+$('#edAmt').value||0);
  if(!(a>0)){toast('金额要大于 0');return;}
  r.amount=a;r.date=date;r.note=note;
  save({label:'修改支出'});
 }else if(arr==='sales'){
  const a=R2(+$('#edAmt').value||0);
  if(!(a>0)){toast('金额要大于 0');return;}
  r.total=a;r.price=r.qty>0?R2(a/r.qty):r.price;r.date=date;r.note=note;
  save({label:'修改销售'});
 }else{
  const a=R2(+$('#edAmt').value||0);
  if(!(a>0)){toast('金额要大于 0');return;}
  r.amount=a;r.date=date;r.note=note;
  save({label:'修改收入'});
 }
 closeModal();editRec={arr:null,id:null};render();toast('已保存修改');
}

/* ================= 第1页：支出（材料 / 用车 / 人工 / 生活） ================= */
/* 用车支出的费用类型跟随所选车牌（车牌↔类型绑定） */
function curPlate(){return selByGroup.__plate||'未指定车牌';}
function typesOf(grp){
 if(grp==='car'){
  const p=curPlate();
  const t=(db.plateTypes&&db.plateTypes[p])||[];
  return t.length?t:(db.expGroups.car||[]);
 }
 return db.expGroups[grp]||[];
}
function expTypeChips(grp){
 const types=typesOf(grp);
 const sel=selByGroup[grp];
 return types.map(t=>`<button class="chip ${sel===t?'on':''}" data-act="expSel" data-v="${esc(t)}" data-g="${grp}">${esc(t)}</button>`).join('');
}
/* 车牌选择行（仅用车支出） */
function plateRow(){
 const cur=curPlate();
 const list=db.plates||['未指定车牌'];
 return `<div class="hint">选择车牌（可增删，不同车牌可绑定各自费用类型）</div>
 <div class="chips" id="carPlates">
  ${list.map(p=>`<button class="chip ${cur===p?'on':''}" data-act="plateSel" data-v="${esc(p)}">${esc(p)}</button>`).join('')}
  <button class="chip add" data-act="openPlate">＋ 车牌</button>
 </div>`;
}
function expGroupBlock(grp,showInput){
 const g=EXP_GROUPS.find(x=>x.k===grp)||{n:GRP_NAME[grp]||grp};
 return `
 <div class="card ${grp==='mat'?'':'no-print'}" data-grp="${grp}">
  <div class="cardhead"><h3><i class="bmk ${grp==='car'?'b-car':grp==='lab'?'b-lab':'b-life'}"></i><span class="ico">${grp==='car'?'🚚':grp==='lab'?'👷':'🏠'}</span>${esc(g.n)}</h3>${grp==='car'?'<button class="btn sm" data-act="openPlate">管理车牌</button>':''}</div>
  <div class="crow"><label>日期</label><input type="date" id="${grp}Date" value="${todayStr()}"></div>
  ${grp==='car'?plateRow():''}
  <div class="hint">选择类型（可自定义增删）</div>
  <div class="chips" id="${grp}Chips">
   ${expTypeChips(grp)}
   <button class="chip add" data-act="openType" data-v="${grp}">＋ 类型</button>
  </div>
  <div class="crow"><label>金额</label><div class="amtwrap" style="flex:1"><span>¥</span><input id="${grp}Amt" type="number" step="any" inputmode="decimal" placeholder="0.00"></div></div>
  <div class="crow"><label>备注</label><input type="text" id="${grp}Note" placeholder="选填"></div>
  <button class="btn btn-pri btn-big" data-act="expGrpSave" data-v="${grp}" style="margin-top:4px">保存${esc(g.n)}</button>
 </div>`;
}
function renderBuy(){
 draftRoll();               /* 跨午夜：先把草稿滚到新一天，再渲染 */
 const stats=ledgerStats();
 const mk=todayStr().slice(0,7);
 const mRecs=db.purchases.filter(r=>r.date.slice(0,7)===mk);
 const eRecs=db.expenses.filter(r=>r.date.slice(0,7)===mk);
 const mTotal=mRecs.reduce((s,r)=>s+recTotal(r),0);
 const eTotal=eRecs.reduce((s,r)=>s+r.amount,0);
 const mats=db.materials.filter(m=>!m.archived);
 /* 各支出组小计 */
 const gSum={};EXP_GROUPS.forEach(g=>gSum[g.k]=0);
 eRecs.forEach(r=>{if(gSum[r.grp]!=null)gSum[r.grp]+=r.amount;});
 const rows=mats.map(m=>{
  const lp=draftPrice(m.id);
  const st=stats.per[m.id]||{qty:0};
  /* 只有真正填了草稿单价才标蓝。
     原来用 !=null，保存后单价被显式保留，蓝框会一直亮着，
     看起来像「这笔还没存」。 */
  const dp=DRAFT.prices[m.id];
  const isDraft=dp!=null&&dp!=='';
  return `<tr data-mid="${m.id}">
   <td class="mat"><div class="mname">${esc(m.name)}</div><div class="msub">${esc(m.unit)} · 库存 <b>${fmtN(st.qty)}</b></div></td>
   <td><input class="in-p" type="number" step="any" inputmode="decimal" placeholder="单价" value="${lp??''}"${isDraft?' style="border-color:#93c5fd;background:#eff6ff"':''}></td>
   <td><input class="in-q" type="number" step="any" inputmode="decimal" placeholder="0" value="${draftQty(m.id)}"></td>
   <td class="row-amt">${(()=>{const p=+draftPrice(m.id)||0,q=+draftQty(m.id)||0;return (p>0&&q>0)?fmtN(p*q):'—';})()}</td></tr>`;
 }).join('');
 const matBlock=`
 <div class="card no-print" data-grp="mat">
  <div class="cardhead"><h3><i class="bmk b-mat"></i><span class="ico">🧱</span>材料支出</h3><button class="btn sm" data-act="openMat">管理材料</button></div>
  <div class="crow"><label>日期</label><input type="date" id="buyDate" value="${buyEntryDate||todayStr()}"></div>
  <div class="crow"><label>备注</label><input type="text" id="buyNote" placeholder="选填，如：送某某工地" value="${esc(DRAFT.note||'')}"></div>
  <table><thead><tr><th style="text-align:left">材料名称</th><th>进货单价</th><th>数量</th><th>总价</th></tr></thead><tbody id="buyBody">${rows}</tbody></table>
  <div class="hint" style="margin-top:6px">保存后数量自动清零、单价保留；当天重复录入同种材料会先二次确认（蓝色框为今日草稿）</div>
  <button class="btn btn-pri btn-big" data-act="buySave" style="margin-top:6px">保存材料支出　合计 <span id="buyTotal">${fmtMW(draftSum())}</span></button>
  <button class="linkbtn" data-act="draftClear">清空今日填写内容</button>
 </div>`;
 const show=grp=>buySeg==='all'||buySeg===grp;
 let recHtml='';
 const secTitle=(t,col)=>`<div class="secbar"><i class="dot" style="background:${col||'#1d4ed8'}"></i>${t}</div>`;
 if(show('mat')){
  recHtml+=secTitle('🧱 材料支出','#2563eb')+`<div id="buyList">${recList(mRecs,r=>{
   const d2=(r.note?`<div class="d2">${esc(r.note)}</div>`:'');
   return `<div class="rrow"><span class="rdate">${r.date.slice(5)}</span><span class="tag ti">料</span><div class="rmain">${esc(matName(r.mid))} <span class="d2 il">${fmtP(r.price)}×${fmtN(r.qty)}${esc(matById(r.mid)?.unit||'')}</span>${d2}</div><span class="ramt">${amtHTML(recTotal(r))}</span><button class="x no-print" data-act="editMatRec" data-v="${esc(r.id)}" title="修改这条记录">✎</button>${delBtn('purchases',r.id)}</div>`;
  })}</div>`;
 }
 EXP_GROUPS.forEach(g=>{
  if(!show(g.k))return;
  const list=eRecs.filter(r=>r.grp===g.k);
  recHtml+=(recHtml?`<div style="height:12px"></div>`:'')+secTitle((g.k==='car'?'🚚 ':g.k==='lab'?'👷 ':'🏠 ')+g.n+`　小计 ${fmtMW(gSum[g.k])}`, g.k==='car'?'#ea580c':g.k==='lab'?'#7c3aed':'#059669')+
  `<div>${recList(list,r=>{
   /* 【v1.18 修】备注改用 .rmain-note（flex:1 1 100%），自己独占一行完整显示。
      原来塞在 .rmain 里，和车牌/类型/金额/两个按钮抢同一行的宽度 ——
      用车支出有 7 个元素，实测备注容器被压成 0 宽，内容整个看不见。 */
   const d2=(r.note?`<div class="d2">${esc(r.note)}</div>`:'');
   /* 用车支出显示车牌徽标（老记录无 plate 时归为未指定） */
   const pl=(g.k==='car')?`<span class="tag tp">${esc(r.plate||'未指定车牌')}</span>`:'';
   return `<div class="rrow rrow-exp"><span class="rdate">${r.date.slice(5)}</span>${pl}<span class="tag tagw">${esc(r.type)}</span><span class="ramt">${amtHTML(r.amount)}</span><button class="x no-print" data-act="editMatRec" data-v="${esc(r.id)}" data-arr="expenses" title="修改这条记录">✎</button>${delBtn('expenses',r.id)}${d2?`<div class="rmain-note">${d2}</div>`:'<div class="rmain-note"></div>'}</div>`;
  })}</div>`;
 });
 if(!recHtml)recHtml='<div class="hint" style="text-align:center;padding:8px 0">暂无记录</div>';
 view.innerHTML=`
 <div class="print-only printhead"><h2>支出记录表</h2><div class="pd">生成时间：${todayStr()} ｜ 单位：元 ｜ 建材进销存助手</div></div>
 <div class="stats no-print" style="grid-template-columns:1fr 1fr">
  <div class="stat"><div class="l">本月材料支出</div><div class="v">${fmtMW(mTotal)}</div></div>
  <div class="stat"><div class="l">本月其他支出</div><div class="v">${fmtMW(eTotal)}</div><div class="s">用车 ${fmtW(gSum.car)} · 人工 ${fmtW(gSum.lab)} · 生活 ${fmtW(gSum.life)}</div></div>
  <div class="stat net"><div><div class="l">本月支出合计</div><div class="v">${fmtMW(mTotal+eTotal)}</div></div><div style="font-size:12px;color:#bfdbfe;text-align:right">材料 + 用车<br>+ 人工 + 生活</div></div>
 </div>
 <div class="chips no-print" style="margin-bottom:12px">
  <button class="chip ${buySeg==='all'?'on':''}" data-act="buySeg" data-v="all">全部</button>
  <button class="chip ${buySeg==='mat'?'on':''}" data-act="buySeg" data-v="mat">🧱 材料支出</button>
  <button class="chip ${buySeg==='car'?'on':''}" data-act="buySeg" data-v="car">🚚 用车支出</button>
  <button class="chip ${buySeg==='lab'?'on':''}" data-act="buySeg" data-v="lab">👷 人工支出</button>
  <button class="chip ${buySeg==='life'?'on':''}" data-act="buySeg" data-v="life">🏠 生活支出</button>
 </div>
 ${show('mat')?matBlock:''}
 ${show('car')?expGroupBlock('car'):''}
 ${show('lab')?expGroupBlock('lab'):''}
 ${show('life')?expGroupBlock('life'):''}
 <div class="card">
  <div class="cardhead"><h3><i class="bmk b-pnl"></i><span class="ico">📋</span>本月支出记录</h3></div>
  <div class="btns no-print"><button class="btn" data-act="buyCSV">📄 导出表格</button><button class="btn" data-act="buyPrint">🖨 打印 / 导出PDF</button></div>
  ${recHtml}
 </div>`;
}
function saveBuy(){
 /* 用 buyEntryDate 而不是直接读 #buyDate 的 DOM 值：
    页面是渲染时生成的，App 挂后台过零点后 DOM 还停在昨天，
    那样会把今天的账记到昨天去。 */
 const date=buyEntryDate||todayStr();
 const note=($('#buyNote').value||'').trim();
 const items=[];
 document.querySelectorAll('#buyBody tr[data-mid]').forEach(tr=>{
  const p=+tr.querySelector('.in-p').value||0,q=+tr.querySelector('.in-q').value||0;
  const mid=tr.dataset.mid;
  if(p>0&&q>0&&mid)items.push({mid,price:R2(p),qty:R2(q)});
 });
 if(!items.length){toast('请先填写单价和数量');return;}

 /* 【v1.19 新增】所选日期已经记过同种材料 → 先弹确认再落库。
    目的就是防「隔天以为没存，又原样保存一遍」。
    必须放在任何 db 写入之前：用户点取消时，记录和草稿都不受影响，
    可以回去核对或改数字后再存。 */
 const dup=[];
 items.forEach(function(it){
  if(dup.some(function(x){return x.mid===it.mid;}))return;
  const rs=db.purchases.filter(function(r){
   return r.mid===it.mid&&r.date===date;
  });
  if(rs.length)dup.push({
   mid:it.mid,
   name:matName(it.mid),
   qty:rs.reduce(function(s,r){return s+r.qty;},0),
   unit:(matById(it.mid)&&matById(it.mid).unit)||''
  });
 });
 if(dup.length){
  const txt=dup.map(function(x){
   return x.name+'（已记 '+fmtN(x.qty)+x.unit+'）';
  }).join('、');
  const dTxt=(date===todayStr())?'今天':date;
  const go=confirm(dTxt+'已经记过：'+txt+'。\n\n确定还要再记一笔吗？'
   +'\n（如果单价跟上次一样，会自动合并到那条记录上）');
  if(!go){return;}
 }

 /* 关键：同一天 + 同材料 + 同一单价 → 数量累加，不新开一行
    单价不同则各记一行（避免加权平均后看不出真实成交价） */
 let added=0,merged=0;const chg=[];
 const lasts={};items.forEach(it=>{if(!(it.mid in lasts))lasts[it.mid]=lastPriceOf(db.purchases,it.mid);});
 items.forEach(it=>{
  const old=(db.purchases||[]).find(r=>r.mid===it.mid&&r.date===date&&R2(r.price)===R2(it.price));
  if(old){
   old.qty=R2(old.qty+it.qty);
   old.total=R2(old.price*old.qty);
   old.ts=Date.now();
   if(note){old.note=old.note?old.note+'；'+note:note;}
   merged++;
  }else{
   db.purchases.push({id:uid(),ts:Date.now(),date,mid:it.mid,price:it.price,qty:it.qty,total:R2(it.price*it.qty),note});
   added++;
  }
  if(lasts[it.mid]!=null&&R2(lasts[it.mid])!==R2(it.price)){db.changes.push({id:uid(),ts:Date.now(),date,kind:'进价',mid:it.mid,from:R2(lasts[it.mid]),to:R2(it.price)});chg.push(it.mid);}
  lasts[it.mid]=it.price;
 });
 save({label:'材料支出 +'+added+(merged?` 并入${merged}`:'')});

 /* 【v1.19 核心修复】保存后给每个已保存的材料写**显式值**：
      prices[mid] = 本次单价   → 保留，下次进货直接填数量就行
      qtys[mid]   = ''         → 数量清零
    为什么不能像以前那样 delete：
      delete 之后键不存在，重绘时 draftQty() 的兜底会把「当天累计数量」
      填回输入框，用户看到数字还在，隔天又点一次保存 → 数量翻倍。
      显式写 '' 是权威值，任何兜底都覆盖不了。 */
 items.forEach(it=>{
  DRAFT.prices[it.mid]=String(it.price);
  DRAFT.qtys[it.mid]='';
 });
 DRAFT.note='';              /* 备注也要清空，否则下次保存会带上旧备注 */
 DRAFT.cleared=false;        /* 已提交，解除「禁止回填」 */
 draftSave();

 const msg=[added?`新增 ${added} 条`:'',merged?`同名合并 ${merged} 条`:'',chg.length?`进价变动 ${chg.length} 条已记录`:''].filter(Boolean).join('，');
 toast('已保存材料支出'+(msg?`（${msg}）`:'')+'，数量已清零');
 render();
}
function saveExpGrp(grp){
 const chip=document.querySelector(`#${grp}Chips .chip.on`);
 if(!chip){toast('请先选择费用类型');return;}
 const amount=+$('#'+grp+'Amt').value||0;
 if(!(amount>0)){toast('请填写金额');return;}
 const date=$('#'+grp+'Date').value||todayStr();
 const note=($('#'+grp+'Note').value||'').trim();
 const rec={id:uid(),ts:Date.now(),date,grp,type:chip.dataset.v,amount:R2(amount),note};
 if(grp==='car')rec.plate=curPlate();
 db.expenses.push(rec);
 save({label:(GRP_NAME[grp]||grp)+' '+chip.dataset.v});
 selByGroup[grp]=null;toast(grp==='car'?`已保存用车支出（${rec.plate}）`:'已保存'+GRP_NAME[grp]);render();
}
function exportBuy(){
 const rows=[['日期','支出类别','项目','车牌号','单价','数量','单位','金额','备注']];
 let mt=0;const gs={};EXP_GROUPS.forEach(g=>gs[g.k]=0);
 [...db.purchases].sort((a,b)=>a.date===b.date?a.ts-b.ts:(a.date<b.date?-1:1)).forEach(r=>{
  mt+=recTotal(r);
  rows.push([r.date,'材料支出',matName(r.mid),'',r.price,r.qty,matById(r.mid)?.unit||'',R2(recTotal(r)),r.note||'']);
 });
 [...db.expenses].sort((a,b)=>a.date===b.date?a.ts-b.ts:(a.date<b.date?-1:1)).forEach(r=>{
  const gn=GRP_NAME[r.grp]||'生活支出';
  if(gs[r.grp]!=null)gs[r.grp]+=r.amount;
  rows.push([r.date,gn,r.type,(r.grp==='car')?(r.plate||'未指定车牌'):'','','','',R2(r.amount),r.note||'']);
 });
 let et=0;EXP_GROUPS.forEach(g=>et+=gs[g.k]);
 rows.push([]);
 rows.push(['材料支出合计','','','','','','',R2(mt),'']);
 EXP_GROUPS.forEach(g=>rows.push([g.n+'合计','','','','','','',R2(gs[g.k]),'']));
 rows.push(['支出总计','','','','','','',R2(mt+et),'']);
 /* 按车牌汇总（仅当存在多车牌时才追加，便于看每台车的花费） */
 const plates=db.plates||[];
 if(plates.length>1){
  rows.push([]);rows.push(['按车牌汇总']);
  plates.forEach(p=>{
   const s=(db.expenses||[]).filter(r=>r.grp==='car'&&(r.plate||'未指定车牌')===p).reduce((a,b)=>a+b.amount,0);
   rows.push([p,'','','','','','',R2(s),'']);
  });
 }
 dlFile(`支出记录_${todayStr()}.csv`,csv(rows),'text/csv');
 toast('已导出支出 CSV');
}


/* ================= 第2页：收入（材料收入 / 其他收入） ================= */
let sellExtra=[];   // 兼容旧引用，保留
function incTypeChips(){
 const sel=selByGroup.__inc;
 return (db.incomeTypes||[]).map(t=>`<button class="chip ${sel===t?'on':''}" data-act="incSel" data-v="${esc(t)}">${esc(t)}</button>`).join('');
}
function renderSell(){
 const stats=ledgerStats();
 const qtyOf=id=>(stats.per[id]?stats.per[id].qty:0);
 const mk=todayStr().slice(0,7);
 const recs=db.sales.filter(r=>r.date.slice(0,7)===mk);
 const oRecs=db.otherIncome.filter(r=>r.date.slice(0,7)===mk);
 const total=recs.reduce((s,r)=>s+recTotal(r),0);
 const oTotal=oRecs.reduce((s,r)=>s+r.amount,0);
 const unpaid=unpaidOf('sales',mk)+unpaidOf('otherIncome',mk);
 const paidTotal=total+oTotal-unpaid;
 /* 材料收入：同步材料支出的全部材料（不再要求有库存） */
 const show=grp=>incSeg==='all'||incSeg===grp;
 const rows=db.materials.filter(m=>!m.archived).map(m=>{
  const lp=lastPriceOf(db.sales,m.id);
  const q=qtyOf(m.id);
  return `<tr data-mid="${m.id}">
   <td class="mat"><div class="mname">${esc(m.name)}</div><div class="msub">库存 <b style="${q<=1e-9?'color:#dc2626':''}">${fmtN(q)}</b> ${esc(m.unit)}</div></td>
   <td><input class="in-p" type="number" step="any" inputmode="decimal" placeholder="销售单价" value="${lp??''}"></td>
   <td><input class="in-q" type="number" step="any" inputmode="decimal" placeholder="0"></td>
   <td class="row-amt">—</td></tr>`;
 }).join('');
 const matBlock=`
 <div class="card no-print" data-grp="incmat">
  <div class="cardhead"><h3><i class="bmk b-inc"></i><span class="ico">🧱</span>材料收入</h3><button class="btn sm" data-act="tab" data-v="buy">去录入材料</button></div>
  <div class="hint">材料项目与第1页"材料支出"自动同步，无需手动添加</div>
  <div class="crow"><label>日期</label><input type="date" id="sellDate" value="${todayStr()}"></div>
  <div class="crow"><label>备注</label><input type="text" id="sellNote" placeholder="选填，如：客户名 / 工地"></div>
  <div class="crow"><label>回款</label>
   <div class="chips" id="sellPaid" style="margin:0">
    <button class="chip on" data-act="sellPaidSel" data-v="1">✅ 已回款（收到钱）</button>
    <button class="chip" data-act="sellPaidSel" data-v="0">⏳ 未回款（赊账）</button>
   </div>
  </div>
  <div class="hint" id="sellPaidHint" style="margin-top:2px">默认已回款；选「未回款」后，这笔钱会计入利润页的待回款</div>
  <table><thead><tr><th style="text-align:left">材料名称</th><th>销售单价</th><th>数量</th><th>总价</th></tr></thead><tbody id="sellBody">${rows}</tbody></table>
  <div class="hint" style="margin-top:6px">库存不足时数量框变红，无法保存超卖</div>
  <button class="btn btn-pri btn-big" data-act="sellSave" style="margin-top:6px">保存材料收入　合计 <span id="sellTotal">¥0</span></button>
 </div>`;
 const otherBlock=`
 <div class="card no-print" data-grp="incother">
  <div class="cardhead"><h3><i class="bmk b-ore"></i><span class="ico">💰</span>其他收入</h3></div>
  <div class="crow"><label>日期</label><input type="date" id="incDate" value="${todayStr()}"></div>
  <div class="hint">选择收入类型（可自定义增删）</div>
  <div class="chips" id="incChips">
   ${incTypeChips()}
   <button class="chip add" data-act="openIncType">＋ 类型</button>
  </div>
  <div class="crow"><label>金额</label><div class="amtwrap" style="flex:1"><span>¥</span><input id="incAmt" type="number" step="any" inputmode="decimal" placeholder="0.00"></div></div>
  <div class="crow"><label>回款</label>
   <div class="chips" id="incPaid" style="margin:0">
    <button class="chip on" data-act="incPaidSel" data-v="1">✅ 已回款</button>
    <button class="chip" data-act="incPaidSel" data-v="0">⏳ 未回款</button>
   </div>
  </div>
  <div class="crow"><label>备注</label><input type="text" id="incNote" placeholder="选填"></div>
  <button class="btn btn-pri btn-big" data-act="incSave" style="margin-top:4px">保存其他收入</button>
 </div>`;
 let recHtml='';
 const secTitle=(t,col)=>`<div class="secbar"><i class="dot" style="background:${col||'#0891b2'}"></i>${t}</div>`;
 if(show('mat')){
  recHtml+=secTitle('🧱 材料收入','#0891b2')+`<div id="sellList">${recList(recs,r=>{
   const d2=(r.note?`<div class="d2">${esc(r.note)}</div>`:'');
   return `<div class="rrow2"><div class="rtop"><span class="rdate">${r.date.slice(5)}</span><span class="tag ts">料</span><div class="rmain">${esc(matName(r.mid))} <span class="d2 il">${fmtP(r.price)}×${fmtN(r.qty)}${esc(matById(r.mid)?.unit||'')}</span>${d2}</div><span class="ramt">${amtHTML(recTotal(r))}</span></div>${rec2('sales',r.id,isPaid(r))}</div>`;
  })}</div>`;
 }
 if(show('other')){
  recHtml+=(recHtml?`<div style="height:12px"></div>`:'')+secTitle('💰 其他收入','#db2777')+`<div>${recList(oRecs,r=>{
   const d2=(r.note?`<div class="d2">${esc(r.note)}</div>`:'');
   return `<div class="rrow2"><div class="rtop"><span class="rdate">${r.date.slice(5)}</span><span class="tag ts">${esc(r.type)}</span><div class="rmain">${d2||'&nbsp;'}</div><span class="ramt">${amtHTML(r.amount)}</span></div>${rec2('otherIncome',r.id,isPaid(r))}</div>`;
  })}</div>`;
 }
 if(!recHtml)recHtml='<div class="hint" style="text-align:center;padding:8px 0">暂无记录</div>';
 view.innerHTML=`
 <div class="print-only printhead"><h2>收入记录表</h2><div class="pd">生成时间：${todayStr()} ｜ 单位：元 ｜ 建材进销存助手</div></div>
 <div class="stats no-print" style="grid-template-columns:1fr 1fr">
  <div class="stat"><div class="l">本月材料收入</div><div class="v">${fmtMW(total)}</div></div>
  <div class="stat"><div class="l">本月其他收入</div><div class="v">${fmtMW(oTotal)}</div></div>
  <div class="stat net"><div><div class="l">本月收入合计</div><div class="v">${fmtMW(total+oTotal)}</div></div><div style="font-size:12px;color:#bfdbfe;text-align:right">材料收入<br>+ 其他收入</div></div>
 </div>
 ${unpaid>0?`<div class="cashbanner no-print">
  <div><div class="l">⏳ 本月待回款（卖出但还没收到钱）</div><div class="v">${fmtMW(unpaid)}</div></div>
  <div class="s">已回款 ${fmtW(paidTotal)}<br>待回款 ${fmtW(unpaid)}<br>共 ${fmtW(total+oTotal)}</div>
 </div>`:''}
 <div class="chips no-print" style="margin-bottom:12px">
  <button class="chip ${incSeg==='all'?'on':''}" data-act="incSeg" data-v="all">全部</button>
  <button class="chip ${incSeg==='mat'?'on':''}" data-act="incSeg" data-v="mat">🧱 材料收入</button>
  <button class="chip ${incSeg==='other'?'on':''}" data-act="incSeg" data-v="other">💰 其他收入</button>
 </div>
 ${show('mat')?matBlock:''}
 ${show('other')?otherBlock:''}
 <div class="card">
  <div class="cardhead"><h3><i class="bmk b-pnl"></i><span class="ico">📋</span>本月收入记录</h3></div>
  <div class="btns no-print"><button class="btn" data-act="sellCSV">📄 导出表格</button><button class="btn" data-act="sellPrint">🖨 打印 / 导出PDF</button></div>
  ${recHtml}
 </div>`;
}
function openSellAdd(){ $('[data-act="tab"][data-v="buy"]').click(); toast('材料项目已同步，请到"支出"页添加材料'); }
function sellAddOk(){}
function saveSell(){
 const date=$('#sellDate').value||todayStr();
 const note=($('#sellNote').value||'').trim();
 const paid=paidOf('#sellPaid');
 const items=[];
 document.querySelectorAll('#sellBody tr[data-mid]').forEach(tr=>{
  const p=+tr.querySelector('.in-p').value||0,q=+tr.querySelector('.in-q').value||0;
  if(p>0&&q>0)items.push({mid:tr.dataset.mid,price:R2(p),qty:R2(q)});
 });
 if(!items.length){toast('请先填写销售单价和数量');return;}
 const stock={};for(const k in statsCache())stock[k]=statsCache()[k];
 const cur=ledgerStats().per;
 const errs=items.filter(it=>it.qty>((cur[it.mid]?cur[it.mid].qty:0)+1e-9)).map(it=>`${matName(it.mid)}：库存仅剩 ${fmtN(cur[it.mid]?cur[it.mid].qty:0)}`);
 if(errs.length){alert('库存不足，无法保存：\n'+errs.join('\n')+'\n\n请先到【支出】页补录材料。');return;}
 const lasts={};items.forEach(it=>{if(!(it.mid in lasts))lasts[it.mid]=lastPriceOf(db.sales,it.mid);});
 let chg=0,added=0,merged=0;
 items.forEach(it=>{
  /* 同一天 + 同材料 + 同一售价 → 数量累加，不新开一行；售价不同各记一行 */
  const old=(db.sales||[]).find(r=>r.mid===it.mid&&r.date===date&&R2(r.price)===R2(it.price));
  if(old){
   old.qty=R2(old.qty+it.qty);
   old.total=R2(old.price*old.qty);
   old.ts=Date.now();
   if(note){old.note=old.note?old.note+'；'+note:note;}
   if(old.paid===undefined)old.paid=paid;
   merged++;
  }else{
   db.sales.push({id:uid(),ts:Date.now(),date,mid:it.mid,price:it.price,qty:it.qty,total:R2(it.price*it.qty),note,paid});
   added++;
  }
  if(lasts[it.mid]!=null&&R2(lasts[it.mid])!==R2(it.price)){db.changes.push({id:uid(),ts:Date.now(),date,kind:'售价',mid:it.mid,from:R2(lasts[it.mid]),to:R2(it.price)});chg++;}
  lasts[it.mid]=it.price;
 });
 save({label:'材料收入 +'+added+(merged?` 并入${merged}`:'')});
 const msg=[added?`新增 ${added} 条`:'',merged?`同名合并 ${merged} 条`:'',chg?`售价变动 ${chg} 条已记录`:''].filter(Boolean).join('，');
 toast(`已保存材料收入（${msg}）${paid?'':'，已记入待回款'}`);render();
}
function statsCache(){const p=ledgerStats().per;const o={};for(const k in p)o[k]=p[k].qty;return o;}
/* ---------- 回款（应收）支持 ---------- */
/* 旧数据没有 paid 字段：一律视为"已回款"，保证历史账目口径不变 */
function isPaid(r){return r.paid===undefined?true:!!r.paid;}
/* 读取某个回款选择器当前值：1=已回款 0=未回款 */
function paidOf(sel){
 const b=document.querySelector(sel+' .chip.on');
 return b?(b.dataset.v==='1'):true;
}
function togglePaid(list,id){
 const arr=db[list]||[];
 const r=arr.find(x=>x.id===id);
 if(!r)return;
 r.paid=!isPaid(r);
 save({label:r.paid?'标记已回款':'标记未回款'});
 render();
 toast(r.paid?'已标记为「已回款」':'已标记为「未回款」，计入待回款');
}
/* 某批记录（sales / otherIncome）在某月份下的未回款金额 */
function unpaidOf(list,mk){
 return (db[list]||[]).reduce((s,r)=>{
  if(mk&&r.date.slice(0,7)!==mk)return s;
  const amt=list==='sales'?recTotal(r):(r.amount||0);
  return s+(isPaid(r)?0:amt);
 },0);
}
function paidTag(list,id,paid){
 const t=paid?'<span class="tag paid">已回款</span>':'<span class="tag unpaid">待回款</span>';
 return `${t}<button class="paybtn" data-act="togglePaid" data-list="${list}" data-id="${id}">${paid?'改未回款':'改已回款'}</button>`;
}
/* 记录行：第一行放主要信息（日期/标签/名称/金额），第二行放操作（回款 + 修改 + 删除）。
   这样手机上不会再被挤到屏幕外面。 */
function rec2(list,id,paid,extra){
 return `<div class="rfoot">${paidTag(list,id,paid)}
  <button class="x no-print" data-act="editMatRec" data-v="${id}" data-arr="${list}" title="修改这条记录">✎</button>
  ${delBtn(list,id)}${extra||''}</div>`;
}
function saveInc(){
 const chip=document.querySelector('#incChips .chip.on');
 if(!chip){toast('请先选择收入类型');return;}
 const amount=+$('#incAmt').value||0;
 if(!(amount>0)){toast('请填写金额');return;}
 const date=$('#incDate').value||todayStr();
 const note=($('#incNote').value||'').trim();
 const paid=paidOf('#incPaid');
 db.otherIncome.push({id:uid(),ts:Date.now(),date,type:chip.dataset.v,amount:R2(amount),note,paid});
 save({label:'其他收入 '+chip.dataset.v});
 toast(`已保存其他收入 ${chip.dataset.v}${paid?'':'（已记入待回款）'}`);render();
 selByGroup.__inc=null;toast('已保存其他收入');render();
}
function exportSell(){
 const rows=[['日期','收入类别','项目','单价','数量','单位','金额','备注']];
 let mt=0,ot=0;
 [...db.sales].sort((a,b)=>a.date===b.date?a.ts-b.ts:(a.date<b.date?-1:1)).forEach(r=>{
  mt+=recTotal(r);
  rows.push([r.date,'材料收入',matName(r.mid),r.price,r.qty,matById(r.mid)?.unit||'',R2(recTotal(r)),r.note||'']);
 });
 [...db.otherIncome].sort((a,b)=>a.date===b.date?a.ts-b.ts:(a.date<b.date?-1:1)).forEach(r=>{
  ot+=r.amount;
  rows.push([r.date,'其他收入',r.type,'','','',R2(r.amount),r.note||'']);
 });
 rows.push([]);
 rows.push(['材料收入合计','','','','','',R2(mt),'']);
 rows.push(['其他收入合计','','','','','',R2(ot),'']);
 rows.push(['收入总计','','','','','',R2(mt+ot),'']);
 dlFile(`收入记录_${todayStr()}.csv`,csv(rows),'text/csv');
 toast('已导出收入 CSV');
}


/* ================= 利润页 ================= */
function chgRow(c){
 const pct=c.from?((c.to-c.from)/c.from*100):0;
 let cls='';
 if(c.kind==='进价')cls=pct>0.004?'neg':(pct<-0.004?'pos':'');
 else cls=pct>0.004?'pos':(pct<-0.004?'neg':'');
 return `<div class="rrow"><span class="rdate">${c.date.slice(5)}</span><span class="tag ${c.kind==='进价'?'ti':'ts'}">${c.kind}</span><div class="rmain">${esc(matName(c.mid))}</div><span class="nums">${fmtN(c.from)} → ${fmtN(c.to)}</span><span class="pct ${cls}">${pct>0?'+':''}${pct.toFixed(1)}%</span></div>`;
}
/* 统一核算：
   流水口径（老板账）：总收入 − 总支出（进货全款+用车+人工+生活）= cash
   经营口径（参考）：卖货收入 − 已售成本 = 毛利 gross */
function calcAll(mk){
 const stats=ledgerStats();
 let mRev=0,cogs=0;
 for(const k in stats.agg){if(!mk||k===mk){mRev+=stats.agg[k].rev;cogs+=stats.agg[k].cogs;}}
 let oRev=0;
 db.otherIncome.forEach(r=>{if(!mk||r.date.slice(0,7)===mk)oRev+=r.amount;});
 let buyT=0;
 db.purchases.forEach(r=>{if(!mk||r.date.slice(0,7)===mk)buyT+=recTotal(r);});
 const g={};EXP_GROUPS.forEach(x=>g[x.k]=0);
 const gb={};EXP_GROUPS.forEach(x=>gb[x.k]={});
 db.expenses.forEach(r=>{
  if(mk&&r.date.slice(0,7)!==mk)return;
  const k=g[r.grp]!=null?r.grp:'life';
  g[k]+=r.amount; gb[k][r.type]=(gb[k][r.type]||0)+r.amount;
 });
 let oExp=0;EXP_GROUPS.forEach(x=>oExp+=g[x.k]);
 const rev=mRev+oRev, expT=oExp, gross=rev-cogs, net=gross-expT;
 const totalOut=buyT+expT, cash=rev-totalOut;
 /* 待回款：卖出但还没收到的钱（材料收入 + 其他收入里的未回款部分） */
 const unpaid=unpaidOf('sales',mk)+unpaidOf('otherIncome',mk);
 const cashIn=rev-unpaid;             /* 实际到手（已回款）的收入 */
 const cashReal=cash-unpaid;          /* 口袋账扣掉待回款后的实际现金 */
 return {stats,mRev,oRev,rev,cogs,buyT,g,gb,oExp,expT,gross,net,rate:rev>0?gross/rev*100:0,totalOut,cash,unpaid,cashIn,cashReal};
}
function renderProfit(){
 const stats=ledgerStats();
 const mk=pAll?null:pMonth;
 const C=calcAll(mk);
 const rev=C.rev,cogs=C.cogs,gross=C.gross,net=C.net,rate=C.rate,expT=C.expT;
 const cls=n=>n>0.004?'pos':(n<-0.004?'neg':'');
 const expTxt=EXP_GROUPS.map(x=>`${x.n} ${fmtM(C.g[x.k])}`).join(' · ');
 const chgs=db.changes.filter(c=>!mk||c.date.slice(0,7)===mk).sort((a,b)=>b.ts-a.ts);
 const range=pAll?'全部月份':pMonth.replace('-','年')+'月';
 view.innerHTML=`
 <div class="print-only printhead"><h2>经营利润报表（${range}）</h2><div class="pd">生成时间：${todayStr()} ｜ 单位：元 ｜ 建材进销存助手</div></div>
 <div class="card mbar no-print">
  <button class="mb" data-act="pPrev">‹</button>
  <input type="month" id="pMonth" value="${pMonth}" ${pAll?'disabled':''}>
  <button class="mb" data-act="pNext">›</button>
  <button class="chip ${pAll?'on':''}" data-act="pAll">全部</button>
 </div>
 <div class="stats">
  <div class="stat"><div class="l">材料收入</div><div class="v">${fmtMW(C.mRev)}</div></div>
  <div class="stat"><div class="l">其他收入</div><div class="v">${fmtMW(C.oRev)}</div></div>
  <div class="stat" style="grid-column:1/-1"><div class="l">总收入（材料销售 + 其他收入）</div><div class="v">${fmtMW(rev)}</div></div>
  <div class="stat"><div class="l">材料进货支出</div><div class="v">${fmtMW(C.buyT)}</div><div class="s">全部进货款（含未卖掉的）</div></div>
  <div class="stat"><div class="l">用车+人工+生活</div><div class="v">${fmtMW(expT)}</div><div class="s">${expTxt}</div></div>
  <div class="stat" style="grid-column:1/-1"><div class="l">总支出（材料进货 + 用车 + 人工 + 生活）</div><div class="v">${fmtMW(C.totalOut)}</div><div class="s">材料进货 ${fmtW(C.buyT)} · ${expTxt}</div></div>
  <div class="stat net"><div><div class="l">① 利润（总收入 − 总支出）</div><div class="v ${cls(C.cash)}">${fmtMW(C.cash)}</div></div><div style="font-size:12px;color:#bfdbfe;text-align:right">总收入 ${fmtW(rev)}<br>− 总支出 ${fmtW(C.totalOut)}<br>库存压货 ${fmtW(stats.totalVal)}</div></div>
  <div class="stat net2" style="grid-column:1/-1"><div><div class="l">② 净利润（只算已卖掉的材料）</div><div class="v ${cls(net)}">${fmtMW(net)}</div></div><div style="font-size:12px;color:#d1fae5;text-align:right">总收入 ${fmtW(rev)}<br>− 已售成本 ${fmtW(cogs)}<br>− 其他支出 ${fmtW(expT)}</div></div>
  ${C.unpaid>0?`<div class="cashbanner" style="grid-column:1/-1">
   <div><div class="l">⏳ 待回款（已卖出，钱还没收到）</div><div class="v">${fmtMW(C.unpaid)}</div></div>
   <div class="s">应收总额 ${fmtW(rev)}<br>已到手 ${fmtW(C.cashIn)}<br>待回款 ${fmtW(C.unpaid)}</div>
  </div>`:''}
 </div>
 <div class="card">
  <div class="cardhead"><h3><i class="bmk b-pnl"></i><span class="ico">📊</span>收支明细（${range}）</h3></div>
  <div class="btns no-print"><button class="btn" data-act="profitCSV">📄 导出报表</button><button class="btn" data-act="profitPrint">🖨 打印 / 导出PDF</button></div>
  <table><thead><tr><th style="text-align:left">项目</th><th>金额</th><th>说明</th></tr></thead><tbody>
   <tr><td class="mat">材料销售收入</td><td class="amt">${fmtW(C.mRev)}</td><td class="msub" style="font-size:11px;color:#6b7280">卖货收的钱</td></tr>
   <tr><td class="mat">其他收入</td><td class="amt">${fmtW(C.oRev)}</td><td class="msub" style="font-size:11px;color:#6b7280">装卸费、送货费等</td></tr>
   <tr><td class="mat" style="font-weight:600">总收入</td><td class="amt" style="font-weight:700">${fmtW(rev)}</td><td class="msub" style="font-size:11px;color:#6b7280">其中已回款 ${fmtW(C.cashIn)}</td></tr>
   ${C.unpaid>0?`<tr><td class="mat" style="color:#b45309;font-weight:700">⏳ 待回款（卖出未收款）</td><td class="amt" style="color:#b45309;font-weight:700">${fmtW(C.unpaid)}</td><td class="msub" style="font-size:11px;color:#b45309">已卖但钱还没到账</td></tr>`:''}
   <tr><td class="mat">材料进货支出</td><td class="amt">-${fmtW(C.buyT)}</td><td class="msub" style="font-size:11px;color:#6b7280">买材料花的全部钱（含没卖掉的）</td></tr>
   <tr><td class="mat">用车支出</td><td class="amt">-${fmtW(C.g.car)}</td><td class="msub" style="font-size:11px;color:#6b7280">${Object.keys(C.gb.car).length?esc(Object.keys(C.gb.car).join('、')):'—'}</td></tr>
   <tr><td class="mat">人工支出</td><td class="amt">-${fmtW(C.g.lab)}</td><td class="msub" style="font-size:11px;color:#6b7280">${Object.keys(C.gb.lab).length?esc(Object.keys(C.gb.lab).join('、')):'—'}</td></tr>
   <tr><td class="mat">生活支出</td><td class="amt">-${fmtW(C.g.life)}</td><td class="msub" style="font-size:11px;color:#6b7280">${Object.keys(C.gb.life).length?esc(Object.keys(C.gb.life).join('、')):'—'}</td></tr>
   <tr><td class="mat" style="font-weight:600">总支出</td><td class="amt" style="font-weight:700">-${fmtW(C.totalOut)}</td><td class="msub" style="font-size:11px;color:#6b7280">材料进货 + 三项费用</td></tr>
   <tr><td class="mat" style="font-weight:700;color:#1d4ed8">① 利润（总收入−总支出）</td><td class="amt ${cls(C.cash)}" style="font-weight:700;font-size:17px">${fmtW(C.cash)}</td><td class="msub">口袋账：进货全算支出</td></tr>
   <tr class="refrow"><td class="mat" style="font-weight:700">② 净利润（只算已卖掉的材料）</td><td class="amt ${cls(net)}" style="font-weight:700;font-size:16px">${fmtW(net)}</td><td class="msub">总收入 − 已售成本 ${fmtW(cogs)} − 其他支出 ${fmtW(expT)}</td></tr>
   <tr class="refrow"><td class="mat">参考 · 经营毛利</td><td class="amt">${fmtW(gross)}</td><td class="msub">卖货收入−已售成本（毛利率 ${rate.toFixed(1)}%）</td></tr>
   <tr class="refrow"><td class="mat">参考 · 库存压货</td><td class="amt">${fmtW(stats.totalVal)}</td><td class="msub">还没卖掉的货值这些钱</td></tr>
  </tbody></table>
 </div>
 <div class="card">
  <div class="cardhead"><h3><i class="bmk b-mat"></i><span class="ico">📦</span>当前库存与资金占用</h3><button class="btn sm" data-act="tab" data-v="stock">去库存页看明细 →</button></div>
  <div class="stats" style="grid-template-columns:1fr 1fr;gap:10px">
   <div class="stat" style="box-shadow:none;background:#f8fafc"><div class="l">库存总金额</div><div class="v" style="font-size:19px">${fmtMW(stats.totalVal)}</div></div>
   <div class="stat" style="box-shadow:none;background:#f8fafc"><div class="l">在库材料</div><div class="v" style="font-size:19px">${db.materials.filter(m=>!m.archived).length} 种</div></div>
  </div>
  <div class="hint">每种材料还剩多少、均价多少、哪些该补货，都在<b>底部第 4 个「库存」页</b>里，点上面的按钮就能过去看。</div>
 </div>
 <div class="card">
  <div class="cardhead"><h3><i class="bmk b-car"></i><span class="ico">🔔</span>价格变动记录（${range}）</h3></div>
  <div class="btns no-print"><button class="btn" data-act="profitCSV">📄 导出报表</button><button class="btn" data-act="profitPrint">🖨 打印 / 导出PDF</button></div>
  ${chgs.length?recList(chgs,chgRow):'<div class="hint" style="text-align:center;padding:8px 0">暂无价格变动（进价/售价与上次不同时自动记录）</div>'}
 </div>
 <div class="card no-print">
  <h3>数据备份与恢复</h3>
  <button class="btn btn-big btn-ok" data-act="backup">⬇ 一键备份（存到手机）</button>
  <div style="height:10px"></div>
  <button class="btn btn-big btn-ok" data-act="importBtn">⬆ 一键导入（从备份恢复）</button>
  <div style="height:10px"></div>
  <button class="btn btn-big" data-act="restoreBK">🕘 历史快照还原</button>
  <div style="height:10px"></div>
  <button class="btn btn-big btn-danger" data-act="wipe">🗑 清空全部数据</button>
  <div class="hint" style="margin-top:10px">
   <b>一键备份：</b>把全部数据存成一个文件下载到手机，建议每月做一次，存到微信收藏或网盘更保险。<br>
   <b>一键导入：</b>换手机或数据丢失时，选之前备份的文件即可全部恢复。<br>
   <b>历史快照：</b>每次保存数据时，系统在后台静默留 1 份快照（保留最近 ${BK_MAX} 份），可在上面"历史快照还原"里回退；<b>不会自动下载文件打扰你填写</b>。<br>
   数据保存在应用数据库中；建议定期使用一键备份。
  </div>
 </div>
 <details class="card tips no-print"><summary>使用与经营小贴士</summary>
  <ul>
   <li>成本按<b>移动加权平均法</b>自动核算：库存剩余的钱显示在"资金占用"里。</li>
   <li><b>利润 = 总收入 − 总支出</b>；总支出按口袋账算：<b>进货花的钱全额算支出</b>（没卖掉的货压在库存里，价值见"库存与资金占用"）。</li>
   <li>"参考"行里的<b>经营毛利</b> = 卖货收入 − 已卖掉部分的进货成本，供和传统算法对账用。</li>
   <li>第2页"材料收入"自动同步第1页"材料支出"的材料，不用重复添加；类型可在各区块点"＋ 类型"自定义。</li>
   <li>进价 / 售价与上次不同时，自动写入<b>价格变动记录</b>，方便对账和追溯。</li>
   <li>在"管理材料"里给重要材料设置<b>预警线</b>（如水泥 ≥ 2 吨），库存不足自动提示补货。</li>
   <li>水泥有保质期（约 3 个月），进货注意<b>先进先出</b>，先卖早期进的货。</li>
   <li>销售备注可填客户/工地名，方便月底对赊账。</li>
  </ul>
 </details>`;
}
/* ================= 库存页（独立页签） ================= */
function renderStock(){
 const stats=ledgerStats();
 const mats=db.materials.filter(m=>!m.archived||(stats.per[m.id]&&stats.per[m.id].qty>1e-9));
 /* 需要补货的：设了预警线且库存已降到线下 */
 const warns=mats.filter(m=>m.min>0&&((stats.per[m.id]||{qty:0}).qty<=m.min));
 const warnSum=stats.totalVal;
 const rows=mats.map(m=>{
  const st=stats.per[m.id]||{qty:0,avg:0,val:0};
  const warn=m.min>0&&st.qty<=m.min;
  const gap=warn?(m.min-st.qty):0;
  return `<tr><td class="mat"><div class="mname" style="font-size:14px">${esc(m.name)}</div><div class="msub">${esc(m.unit)}${m.archived?' · 已停用':''}</div></td><td>${fmtN(st.qty)}</td><td>${st.qty>0?fmtN(st.avg):'—'}</td><td class="amt">${st.qty>0?fmtN(st.val):'—'}</td><td>${warn?`<span class="wt">补货</span><div class="msub" style="font-size:11px;color:#dc2626">差 ${fmtN(gap)}</div>`:'—'}</td></tr>`;
 }).join('');
 view.innerHTML=`
 <div class="print-only printhead"><h2>库存与资金占用</h2><div class="pd">生成时间：${todayStr()} ｜ 单位：元 ｜ 建材进销存助手</div></div>
 <div class="stats no-print" style="grid-template-columns:1fr 1fr">
  <div class="stat"><div class="l">材料种类</div><div class="v">${mats.length}</div><div class="s">在库 + 已停用</div></div>
  <div class="stat"><div class="l">库存总金额</div><div class="v">${fmtMW(warnSum)}</div><div class="s">压在货上的钱</div></div>
  ${warns.length?`<div class="stat net" style="grid-column:1/-1"><div><div class="l">⚠ 有 ${warns.length} 种材料该补货了</div><div class="v" style="font-size:19px">${warns.map(m=>esc(m.name)).join('、')}</div></div><div style="font-size:12px;color:#bfdbfe;text-align:right">库存已降到<br>预警线以下</div></div>`
   :`<div class="stat net2" style="grid-column:1/-1"><div><div class="l">✓ 库存充足</div><div class="v" style="font-size:19px">暂无需要补货的材料</div></div></div>`}
 </div>
 <div class="card">
  <div class="cardhead"><h3><i class="bmk b-mat"></i><span class="ico">📦</span>库存明细</h3><button class="btn sm" data-act="openMat">管理材料</button></div>
  <div class="btns no-print"><button class="btn" data-act="stockCSV">📄 导出库存表</button></div>
  <table><thead><tr><th style="text-align:left">材料</th><th>库存</th><th>均价</th><th>金额</th><th>预警</th></tr></thead><tbody>${rows}</tbody>
  <tfoot><tr><td class="mat" style="text-align:left;font-weight:600">合计</td><td colspan="2"></td><td class="amt">${fmtW(stats.totalVal)}</td><td></td></tr></tfoot></table>
  <div class="hint">金额 = 库存数量 × 加权平均进价，即压在货上的钱；设了预警线的材料，库存不足会标"补货"并算出还差多少。</div>
 </div>
 <div class="card">
  <div class="cardhead"><h3><i class="bmk b-pnl"></i><span class="ico">📊</span>库存与利润的关系</h3></div>
  <div class="hint" style="line-height:1.8">
   库存里的货<b>还没卖出去</b>，所以不算收入，但进货花的钱<b>已经算进支出了</b>。<br>
   所以「利润页」里的①利润是口袋账（进货全额算支出）；<br>
   库存总金额就是这段时间<b>压在货上、还没回来的钱</b>，看这个数就知道手头紧不紧。
  </div>
  <div class="btns no-print" style="margin-top:8px"><button class="btn" data-act="tab" data-v="profit">去利润页看账</button></div>
 </div>
 <details class="card tips no-print"><summary>库存相关小贴士</summary>
  <ul>
   <li>在<b>支出 → 材料支出 → 管理材料</b>里给重要材料设置<b>预警线</b>，库存不足软件会主动提醒补货。</li>
   <li>均价按<b>移动加权平均法</b>自动算：每次进货后重新摊平，不必手工算。</li>
   <li>水泥有保质期（约 3 个月），进货注意<b>先进先出</b>，先卖早期进的货。</li>
   <li>库存金额会同时算进「利润页」的<b>库存压货</b>参考行，两边数字是对得上的。</li>
  </ul>
 </details>`;
}
function exportProfit(){
 const stats=ledgerStats();
 const mk=pAll?null:pMonth;
 const range=pAll?'全部月份':pMonth;
 const C=calcAll(mk);
 const rows=[['经营利润报表（'+range+'）'],['生成时间',todayStr()],[],['项目','金额（元）'],
  ['材料销售收入',R2(C.mRev)],['其他收入',R2(C.oRev)],['总收入',R2(C.rev)],
  ['其中：已回款',R2(C.cashIn)],
  ['待回款（卖出未收款）',R2(C.unpaid)],[],
  ['材料进货支出（全部进货款）',R2(C.buyT)],
  ['用车支出',R2(C.g.car)],['人工支出',R2(C.g.lab)],['生活支出',R2(C.g.life)],
  ['总支出（进货+费用）',R2(C.totalOut)],
  ['① 利润（总收入-总支出）',R2(C.cash)],[],
  ['净利润（只算已卖掉的材料）'],['总收入',R2(C.rev)],['已售材料成本',R2(C.cogs)],
  ['用车+人工+生活',R2(C.expT)],['② 净利润',R2(C.net)],[],
  ['参考：经营毛利',R2(C.gross)],['参考：库存压货',R2(stats.totalVal)],[]];
 rows.push([]);
 EXP_GROUPS.forEach(g=>{
  const ks=Object.keys(C.gb[g.k]);
  if(!ks.length)return;
  rows.push([g.n+'明细'],['类型','金额（元）']);
  ks.forEach(t=>rows.push([t,R2(C.gb[g.k][t])]));
  rows.push([]);
 });
 rows.push(['库存明细'],['材料','库存数量','库存均价','库存金额','预警']);
 db.materials.forEach(m=>{const st=stats.per[m.id]||{qty:0,avg:0,val:0};if(m.archived&&st.qty<=1e-9)return;
  rows.push([m.name,R2(st.qty),st.qty>0?R2(st.avg):'',st.qty>0?R2(st.val):'',(m.min>0&&st.qty<=m.min)?'需补货':'']);});
 rows.push(['库存合计','','',R2(stats.totalVal),''],[]);
 rows.push(['价格变动记录'],['日期','类型','材料','原价','新价','涨跌幅']);
 db.changes.filter(c=>!mk||c.date.slice(0,7)===mk).sort((a,b)=>a.ts-b.ts).forEach(c=>{
  rows.push([c.date,c.kind,matName(c.mid),c.from,c.to,c.from?(((c.to-c.from)/c.from*100).toFixed(1)+'%'):'']);});
 dlFile(`经营报表_${pAll?'全部':pMonth}.csv`,csv(rows),'text/csv');
 toast('已导出经营报表 CSV');
}
/* ================= 打印预览与导出 PDF ================= */
function pvTable(head,rows,sumText){
 const th=head.map((h,i)=>`<th class="${i>0?'n':''}">${esc(h)}</th>`).join('');
 const tr=rows.length?rows.map(r=>`<tr>${r.map((c,i)=>`<td class="${i>0?'n':''}">${esc(c)}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${head.length}" style="text-align:center;color:#9ca3af">暂无记录</td></tr>`;
 const sf=sumText?`<div class="sum">${esc(sumText)}</div>`:'';
 return `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>${sf}`;
}
function pvKV(list){
 return list.map(x=>x.big?`<div class="kv big"><span>${esc(x.k)}</span><b>${esc(x.v)}</b></div>`:`<div class="kv"><span>${esc(x.k)}</span><b>${esc(x.v)}</b></div>`).join('');
}
/* 【v1.19】库存页的纸张内容：打印预览与「一键长截图」共用。
   口径与库存页完全一致（都用 ledgerStats()），不另起一套算法。 */
function buildStockPrint(){
 const stats=ledgerStats();
 const mats=db.materials.filter(m=>!m.archived||((stats.per[m.id]||{qty:0}).qty>1e-9));
 const warns=mats.filter(m=>m.min>0&&((stats.per[m.id]||{qty:0}).qty<=m.min));
 const rows=mats.map(m=>{
  const st=stats.per[m.id]||{qty:0,avg:0,val:0};
  const warn=(m.min>0&&st.qty<=m.min)?'需补货':'—';
  return [
   m.name,
   fmtN(st.qty)+(m.unit||''),
   st.qty>0?fmtN(st.avg):'—',
   st.qty>0?fmtW(st.val):'—',
   warn
  ];
 });
 const head=`<h2>库存与资金占用</h2>`
  +`<div class="pd">生成时间：${todayStr()} ｜ 单位：元 ｜ 建材进销存助手</div>`;
 let body=pvKV([
  {k:'材料种类（在库 + 已停用）',v:String(mats.length)},
  {k:'库存总金额（压在货上的钱）',v:fmtMW(stats.totalVal),big:true},
  {k:'需要补货',v:warns.length?warns.map(m=>m.name).join('、'):'无'}
 ]);
 body+=`<h3>库存明细</h3>`
  +pvTable(['材料','库存','均价','金额','预警'],rows,
           `库存资金占用合计：${fmtMW(stats.totalVal)}`);
 body+=`<h3>说明</h3>`+pvKV([
  {k:'金额算法',v:'库存数量 × 加权平均进价'},
  {k:'库存与利润',v:'库存货值不算收入；进货已全额算支出'}
 ]);
 return head+body;
}
const PV_TITLE={buy:'支出记录表',sell:'收入记录表',profit:'经营利润报表',stock:'库存与资金占用'};
function buildPrint(kind){
 if(kind==='stock')return buildStockPrint();   /* 库存页走独立纸张 */

 const mk=(kind==='profit')?(pAll?null:pMonth):todayStr().slice(0,7);
 const range=(kind==='profit')?(pAll?'全部月份':pMonth.replace('-','年')+'月'):(todayStr().slice(0,4)+'年'+todayStr().slice(5,7)+'月');
 let head=`<h2>${PV_TITLE[kind]||'报表'}</h2><div class="pd">统计期间：${range} ｜ 生成时间：${todayStr()} ｜ 单位：元 ｜ 建材进销存助手</div>`;
 let body='';
 if(kind==='buy'){
  const mRecs=db.purchases.filter(r=>r.date.slice(0,7)===mk);
  const eRecs=db.expenses.filter(r=>r.date.slice(0,7)===mk);
  const mT=mRecs.reduce((a,b)=>a+recTotal(b),0);
  if(mRecs.length){
   body+=`<h3>材料支出</h3>`+pvTable(['日期','材料名称','单价','数量','总价'],
    [...mRecs].sort((a,b)=>a.date<b.date?-1:1).map(r=>[r.date,matName(r.mid),fmtN(r.price),fmtN(r.qty)+(matById(r.mid)?.unit||''),fmtW(recTotal(r))]),
    `材料支出合计：${fmtMW(mT)}`);
  }
  const gs={};EXP_GROUPS.forEach(g=>gs[g.k]=0);
  eRecs.forEach(r=>{if(gs[r.grp]!=null)gs[r.grp]+=r.amount;});
  EXP_GROUPS.forEach(g=>{
   const list=eRecs.filter(r=>r.grp===g.k);
   if(!list.length)return;
   if(g.k==='car'){
    /* 用车支出：带车牌列，并按车牌分块汇总 */
    body+=`<h3>${g.n}</h3>`+pvTable(['日期','车牌号','费用类型','备注','金额'],
     [...list].sort((a,b)=>a.date<b.date?-1:1).map(r=>[r.date,r.plate||'未指定车牌',r.type,r.note||'—',fmtW(r.amount)]),
     `${g.n}合计：${fmtMW(gs[g.k])}`);
    const sum={};
    list.forEach(r=>{const p=r.plate||'未指定车牌';sum[p]=(sum[p]||0)+r.amount;});
    const pk=Object.keys(sum);
    if(pk.length>1)body+=pvTable(['车牌号','用车支出小计'],pk.map(p=>[p,fmtW(sum[p])]));
   }else{
    body+=`<h3>${g.n}</h3>`+pvTable(['日期','费用类型','备注','金额'],
     [...list].sort((a,b)=>a.date<b.date?-1:1).map(r=>[r.date,r.type,r.note||'—',fmtW(r.amount)]),
     `${g.n}合计：${fmtMW(gs[g.k])}`);
   }
  });
  const eT=EXP_GROUPS.reduce((a,g)=>a+gs[g.k],0);
  body+=`<div class="kv big"><span>本月支出总计</span><b>${fmtMW(mT+eT)}</b></div>`;
 }else if(kind==='sell'){
  const recs=db.sales.filter(r=>r.date.slice(0,7)===mk);
  const oRecs=db.otherIncome.filter(r=>r.date.slice(0,7)===mk);
  const t=recs.reduce((a,b)=>a+recTotal(b),0), ot=oRecs.reduce((a,b)=>a+b.amount,0);
  const unp=unpaidOf('sales',mk)+unpaidOf('otherIncome',mk);
  if(recs.length)body+=`<h3>材料收入</h3>`+pvTable(['日期','材料名称','销售单价','数量','总价','回款'],
   [...recs].sort((a,b)=>a.date<b.date?-1:1).map(r=>[r.date,matName(r.mid),fmtN(r.price),fmtN(r.qty)+(matById(r.mid)?.unit||''),fmtW(recTotal(r)),isPaid(r)?'已回款':'待回款']),
   `材料收入合计：${fmtMW(t)}`);
  if(oRecs.length)body+=`<h3>其他收入</h3>`+pvTable(['日期','收入类型','备注','金额','回款'],
   [...oRecs].sort((a,b)=>a.date<b.date?-1:1).map(r=>[r.date,r.type,r.note||'—',fmtW(r.amount),isPaid(r)?'已回款':'待回款']),
   `其他收入合计：${fmtMW(ot)}`);
  body+=`<div class="kv big"><span>本月收入总计</span><b>${fmtMW(t+ot)}</b></div>`;
  body+=pvKV([{k:'其中：已回款',v:fmtMW(t+ot-unp)},{k:'⏳ 待回款（卖出未收款）',v:fmtMW(unp)}]);
 }else{
  const C=calcAll(mk);
  body+=`<h3>收支汇总（口袋账：收进 − 花出）</h3>`+pvKV([
   {k:'材料销售收入',v:fmtMW(C.mRev)},{k:'其他收入',v:fmtMW(C.oRev)},{k:'总收入',v:fmtMW(C.rev)},
   {k:'其中：已回款（钱已到手）',v:fmtMW(C.cashIn)},
   {k:'待回款（卖出未收款）',v:fmtMW(C.unpaid)},
   {k:'材料进货支出（全部进货款）',v:'-'+fmtMW(C.buyT)},
   {k:'用车支出',v:'-'+fmtMW(C.g.car)},{k:'人工支出',v:'-'+fmtMW(C.g.lab)},{k:'生活支出',v:'-'+fmtMW(C.g.life)},
   {k:'总支出（进货+费用）',v:'-'+fmtMW(C.totalOut)},
   {k:'① 利润（总收入−总支出）',v:fmtMW(C.cash),big:true}
  ]);
  body+=`<h3>净利润（只算已卖掉的材料）</h3>`+pvKV([
   {k:'总收入',v:fmtMW(C.rev)},
   {k:'已售材料成本',v:'-'+fmtMW(C.cogs)},
   {k:'用车+人工+生活',v:'-'+fmtMW(C.expT)},
   {k:'② 净利润',v:fmtMW(C.net),big:true},
   {k:'参考 · 经营毛利',v:fmtMW(C.gross)},
   {k:'参考 · 库存压货（未卖掉的货）',v:fmtMW(C.stats.totalVal)}
  ]);
  const stats=C.stats;
  const rows=db.materials.filter(m=>!m.archived||(stats.per[m.id]&&stats.per[m.id].qty>1e-9)).map(m=>{
   const st=stats.per[m.id]||{qty:0,avg:0,val:0};
   return [m.name,fmtN(st.qty)+(m.unit||''),st.qty>0?fmtN(st.avg):'—',st.qty>0?fmtW(st.val):'—',(m.min>0&&st.qty<=m.min)?'需补货':'—'];
  });
  if(rows.length)body+=`<h3>库存与资金占用</h3>`+pvTable(['材料','库存','均价','金额','预警'],rows,`库存资金占用合计：${fmtMW(stats.totalVal)}`);
  const chgs=db.changes.filter(c=>!mk||c.date.slice(0,7)===mk).sort((a,b)=>a.ts-b.ts);
  if(chgs.length)body+=`<h3>价格变动记录</h3>`+pvTable(['日期','类型','材料','原价','新价','涨跌幅'],
   chgs.map(c=>{const p=c.from?((c.to-c.from)/c.from*100):0;return [c.date,c.kind,matName(c.mid),fmtN(c.from),fmtN(c.to),(p>0?'+':'')+p.toFixed(1)+'%'];}));
 }
 return head+body;
}
let pvKind='buy';
function openPrint(kind){
 pvKind=kind||'buy';
 $('#pvPaper').innerHTML=buildPrint(pvKind);
 $('#pvBar').innerHTML=`
  <span class="t">打印预览</span>
  <button class="btn sm" data-act="pvClose">关闭</button>
  <button class="btn sm" data-act="pvPdf">导出PDF</button>
  <button class="btn sm btn-pri" data-act="pvDo">打印</button>`;
 $('#pv').classList.add('show');
 $('#pvBody').scrollTop=0;
}
function closePrint(){ $('#pv').classList.remove('show'); }
function doPrint(){
 const w=window.open('','_blank');
 const css=document.querySelector('style').textContent;
 const html=`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${PV_TITLE[pvKind]||'报表'}</title><style>${css}
 body{background:#fff;margin:0;padding:14px}#pvPaper{box-shadow:none;padding:0;max-width:100%}
 @media print{@page{margin:12mm}}</style></head><body><div id="pvPaper">${buildPrint(pvKind)}</div>
 <script>window.onload=function(){setTimeout(function(){window.print();},350);};<\/script></body></html>`;
 if(w&&w.document){
  w.document.open();w.document.write(html);w.document.close();
  toast('已打开打印窗口，请选择"打印"或"另存为PDF"');
 }else{
  /* 弹窗被拦截：退回当前页面直接打印 */
  const old=$('#pvPaper').innerHTML;
  $('#pvPaper').innerHTML=buildPrint(pvKind);
  document.body.classList.add('printing');
  setTimeout(()=>{try{window.print();}catch(e){alert('当前浏览器不支持直接打印，请点"导出PDF"');}},120);
  setTimeout(()=>document.body.classList.remove('printing'),800);
  toast('未打开新窗口，已尝试直接打印');
 }
}
function exportPDF(){
 /* 用浏览器打印对话框的"另存为PDF"，兼容性最好 */
 const old=document.title;
 document.title=`${PV_TITLE[pvKind]||'报表'}_${todayStr()}`;
 toast('在弹出的窗口选"另存为 PDF"即可保存');
 setTimeout(()=>{
  try{window.print();}catch(e){alert('当前浏览器不支持，请用截图或《导出》按钮导出CSV');}
  setTimeout(()=>{document.title=old;},1500);
 },150);
}
function exportStock(){
 const stats=ledgerStats();
 const rows=[['材料','库存数量','库存均价','库存金额']];
 db.materials.forEach(m=>{const st=stats.per[m.id]||{qty:0,avg:0,val:0};if(m.archived&&st.qty<=1e-9)return;
  rows.push([m.name,R2(st.qty),st.qty>0?R2(st.avg):'',st.qty>0?R2(st.val):'']);});
 rows.push(['合计','',R2(stats.totalVal)]);
 dlFile(`库存明细_${todayStr()}.csv`,csv(rows),'text/csv');
 toast('已导出库存 CSV');
}

/* ================= 弹窗：材料 / 类型 ================= */
function openModal(html){$('#modal').innerHTML=`<div class="sheet">${html}</div>`;$('#modal').classList.add('show');}
function closeModal(){$('#modal').classList.remove('show');$('#modal').innerHTML='';}
function matRowHTML(m){
 return `<div class="mrow ${m.archived?'arch':''}" data-mid="${m.id||''}">
  <input class="f-name" type="text" value="${esc(m.name)}" placeholder="材料名">
  <input class="f-unit" type="text" value="${esc(m.unit)}" list="units" placeholder="单位">
  <input class="f-min" type="number" step="any" inputmode="decimal" value="${m.min||''}" placeholder="预警线">
  <button class="xbtn" data-act="markRow">✕</button></div>`;
}
function openMat(){
 openModal(`<div class="shead"><h3>材料管理</h3><button class="btn sm btn-pri" data-act="saveMats">保存</button></div>
 <div class="hint">可改名称 / 单位 / 预警线；点 ✕ 删除（有进出记录的会改为停用，再点保存可恢复启用）</div>
 <div id="matRows">${db.materials.map(matRowHTML).join('')}</div>
 <button class="linkbtn" data-act="addMatRow">＋ 新增材料</button>`);
}
function openType(grp){
 const g=EXP_GROUPS.find(x=>x.k===grp)||{k:grp,n:GRP_NAME[grp]||'支出'};
 const list=db.expGroups[g.k]||[];
 openModal(`<div class="shead"><h3>${esc(g.n)} · 类型管理</h3><button class="btn sm btn-pri" data-act="saveTypes" data-v="${g.k}">保存</button></div>
 <div class="hint">点 ✕ 移除类型（已有记录仍会保留显示）</div>
 <div id="typeRows" data-g="${g.k}">${list.map(t=>`<div class="mrow" data-tname="${esc(t)}"><input class="f-name" type="text" value="${esc(t)}"><button class="xbtn" data-act="markRow">✕</button></div>`).join('')}</div>
 <button class="linkbtn" data-act="addTypeRow">＋ 新增类型</button>`);
}
function openIncType(){
 openModal(`<div class="shead"><h3>其他收入 · 类型管理</h3><button class="btn sm btn-pri" data-act="saveIncTypes">保存</button></div>
 <div class="hint">点 ✕ 移除类型（已有记录仍会保留显示）</div>
 <div id="incTypeRows">${(db.incomeTypes||[]).map(t=>`<div class="mrow" data-tname="${esc(t)}"><input class="f-name" type="text" value="${esc(t)}"><button class="xbtn" data-act="markRow">✕</button></div>`).join('')}</div>
 <button class="linkbtn" data-act="addIncTypeRow">＋ 新增类型</button>`);
}
/* ---------- 车牌号管理 ---------- */
/* ---------- 车牌号管理（选择式录入：省份 + 字母 + 数字） ---------- */
const PROVINCES=['京','津','冀','晋','蒙','辽','吉','黑','沪','苏','浙','皖','闽','赣','鲁','豫','鄂','湘','粤','桂','琼','渝','川','贵','云','藏','陕','甘','青','宁','新'];
const LETTERS='ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');   /* 车牌不含 I、O */
/* 把车牌拆成 {prov,letter,num}；如 "湘A12345" */
function parsePlate(p){
 const s=String(p||'').replace(/\s/g,'');
 /* 第 1 位省份，第 2 位起字母/数字不限（如 湘A12345、湘AA1234、粤B2D888） */
 const m=s.match(/^([\u4e00-\u9fa5])([A-Z0-9]{1,7})$/);
 if(m)return {prov:m[1],letter:m[2].slice(0,1),num:m[2].slice(1)};
 return null;   /* 非标准格式（含"未指定车牌"） */
}
let kb={uid:null,pos:0,p:'',d:['','','','','','',''],isNew:false,provOpen:false};
const PROVS=PROVINCES;                    /* 省份简称：键盘第一部分 */
const LETNUM=LETTERS.concat(['0','1','2','3','4','5','6','7','8','9']);   /* 键盘第二部分：字母+数字 */
/* 后面的 7 位：d[0]=第2位，d[1]=第3位 …… 去掉空位拼成字符串 */
function dStr(){return kb.d.join('');}
/* 车牌全串：省份 + 后面各位 */
function kbFull(){return kb.p+dStr();}
/* 已填写的有效长度（用于计算还能填几位） */
function dLen(){
 let n=0;for(let i=0;i<kb.d.length;i++){if(kb.d[i])n=i+1;}
 return n;
}
/* 标准车牌列表 */
function stdPlates(){return (db.plates||[]).filter(p=>p!=='未指定车牌'&&parsePlate(p));}
/* 一行的车牌显示块：逐个字符显示，当前光标位高亮 */
function plateBoxHTML(p){
 const q=parsePlate(p)||{prov:'',letter:'',num:''};
 const editing=(kb.uid===p||(kb.isNew&&p===''));
 const tail=(q.letter||'')+(q.num||'');
 let cells='';
 /* 省份位 */
 const on0=editing&&kb.pos===0?' cur':'';
 cells+=q.prov?`<span class="pc${on0}">${esc(q.prov)}</span>`:`<span class="pd${on0}"></span>`;
 /* 后面的位：只要不在编辑整块，就固定画 7 位，给人"一共 7 位"的量感，位置也不会跳 */
 const need=editing?Math.max(tail.length,kb.pos,1):7;
 for(let i=0;i<need;i++){
  const ch=tail[i]||'';
  const on=editing&&kb.pos===i+1?' cur':'';
  cells+=ch?`<span class="pc${on}">${esc(ch)}</span>`:`<span class="pd${on}"></span>`;
 }
 const ph=(q.prov||tail)?'':'<span class="ph">点这里选车牌</span>';
 const cls=editing?' on':'';
 return `<div class="plbox${cls}" data-act="kbOpen" data-pname="${esc(p)}">${cells}${ph}</div>`;
}
/* 虚拟键盘（仿12123）：第一部分=省份简称；第二部分=字母数字混排 */
function plateKBHTML(){
 if(kb.uid==null && !kb.isNew)return '<div class="hint" style="text-align:center;padding:12px 0">点上面任意一行车牌，弹出键盘选择</div>';
 const posName=kb.pos===0?'① 省份':('第 '+(kb.pos+1)+' 位');
 const rest=7-dLen();
 const curCh=kb.pos===0?kb.p:kb.d[kb.pos-1];
 /* 顶部大号实时预览：蓝底白字像真车牌，光标位反白 */
 let disp='<span class="dc'+(kb.pos===0?' cur':'')+'">'+esc(kb.p||'')+'</span><span class="dsep"></span>';
 for(let i=0;i<kb.d.length;i++){
  const ch=kb.d[i]||'';
  disp+='<span class="dc'+(ch?'':' empty')+(kb.pos===i+1?' cur':'')+'">'+esc(ch)+'</span>';
 }
 /* 省份选好后就自动切到「字母/数字」，省份区收起成一行，点「重选」可再展开 */
 const provDone=!!kb.p&&kb.pos>0&&!kb.provOpen;
 const provBlock=provDone
  ?`<div class="fold"><span>一、省份：<b>${esc(kb.p)}</b> ✓</span><button class="re" data-act="kbProvOpen">重选</button></div>`
  :`<div class="kblb">一、省份简称</div>
  <div class="kbg prov">${PROVS.map(x=>`<button class="k${kb.p===x&&kb.pos===0?' on':''}" data-act="kbProv" data-v="${x}">${x}</button>`).join('')}</div>`;
 /* 省份区展开时字母区收起，防止误点覆盖第 2 位；选好省份自动出现 */
 const lnBlock=kb.provOpen
  ?`<div class="more" style="pointer-events:none">二、字母 / 数字（选好省份后自动出现）</div>`
  :`<div class="kblb">二、字母 / 数字</div>
  <div class="kbg ln">${LETNUM.map(x=>`<button class="k${x===curCh&&kb.pos>0?' on':''}" data-act="kbLet" data-v="${x}">${x}</button>`).join('')}</div>`;
 return `<div class="plkb">
  <div class="kbdisp">${disp}</div>
  <div class="kbsub"><span>在填 <b>${posName}</b></span><span>还可填 ${Math.max(rest,0)} 位</span></div>
  ${provBlock}
  ${lnBlock}
  <div class="krow">
   <button class="k ret" data-act="kbPosPrev">← 上一位</button>
   <button class="k ret" data-act="kbPosNext">下一位 →</button>
   <button class="k ret" data-act="kbBack">⌫ 删除</button>
   <button class="k ok" data-act="kbDone">${kb.isNew?'✓ 确认新增':'✓ 完成'}</button>
  </div>
 </div>`;
}
function paintKB(){
 const b=document.getElementById('plateKBBody');if(b)b.innerHTML=plateKBHTML();
 /* 重绘标准车牌行：让光标高亮跟着光标走 */
 const box=document.getElementById('plateStd');
 if(!box)return;
 [...box.querySelectorAll('.plrow')].forEach(row=>{
  const nm=row.dataset.pname;
  if(!nm||nm==='未指定车牌')return;
  const blk=row.querySelector('.plbox');
  if(!blk)return;
  const tmp=document.createElement('div');
  tmp.innerHTML=plateBoxHTML(nm);
  row.replaceChild(tmp.firstChild,blk);
 });
}
/* 解析车牌成 键盘状态；不合法则当作空牌。光标默认落在"第一个空位"，方便接着往后填 */
function kbFromPlate(p){
 const q=parsePlate(p);
 const tail=q?((q.letter||'')+(q.num||'')).split(''):[];
 const d=['','','','','','',''];
 tail.slice(0,7).forEach((c,i)=>d[i]=c);
 /* 光标 = 第一个空位（全填满则停在最后一位）。pos 与光标格对应：pos-1 = 尾部下标 */
 let pos=0;
 if(q&&q.prov){
  pos=d.findIndex(x=>!x)+1;
  if(pos<=0)pos=7;
 }
 return {uid:p,pos:pos,p:q?q.prov:'',d:d,isNew:false,provOpen:false};
}
function kbOpen(name){
 save({label:'编辑车牌前'});
 kb=kbFromPlate(name);
 kbWrite();
 paintKB();
}
/* 写回 db：省份 + 至少 1 位才落库（点选即生效） */
function kbWrite(){
 if(kb.isNew)return;
 if(kb.uid==null)return;
 if(!kb.p||!dStr())return;
 const nn=kbFull();
 if(nn===kb.uid)return;
 const arr=db.plates||[];
 const idx=arr.indexOf(kb.uid);
 if(idx<0){kb.uid=nn;return;}
 if(arr.includes(nn)){toast('这个车牌已经存在了');return;}
 const old=kb.uid;
 arr[idx]=nn;
 db.plateTypes=db.plateTypes||{};
 if(db.plateTypes[old]&&!db.plateTypes[nn])db.plateTypes[nn]=db.plateTypes[old];
 delete db.plateTypes[old];
 (db.expenses||[]).forEach(r=>{if(r.grp==='car'&&r.plate===old)r.plate=nn;});
 if(selByGroup.__plate===old)selByGroup.__plate=nn;
 kb.uid=nn;
 save({label:'修改车牌',snap:false});
}
/* 第一部分：选省份简称 → 光标自动到第 2 位，键盘自动切到字母/数字 */
function kbProv(v){
 if(kb.uid==null&&!kb.isNew)return;
 kb.p=v;kb.pos=1;kb.provOpen=false;
 kbWrite();paintKB();
}
/* 展开/收起省份区：光标同步回省份位，方便直接重选 */
function kbProvOpen(){kb.provOpen=true;kb.pos=0;paintKB();}
function kbMore(){kb.provOpen=true;kb.pos=0;paintKB();}
/* 第二部分：字母数字 → 填到当前光标位，光标自动后移一位 */
function kbLet(v){
 if(kb.uid==null&&!kb.isNew)return;
 if(kb.pos===0)kb.pos=1;
 if(!kb.p){toast('请先选省份简称（第一部分）');return;}   /* 没省份的车牌不合法，先选省 */
 const i=kb.pos-1;
 if(i<0||i>6)return;
 kb.d[i]=v;
 if(kb.pos<7)kb.pos++;
 kbWrite();paintKB();
}
function kbBack(){
 if(kb.pos>0&&kb.d[kb.pos-1]){kb.d[kb.pos-1]='';kbWrite();paintKB();return;}
 if(kb.pos>0){kb.pos--;paintKB();return;}
 if(kb.pos===0&&kb.p){kb.p='';kbWrite();paintKB();return;}
}
function kbPosPrev(){if(kb.pos>0){kb.pos--;paintKB();}}
function kbPosNext(){if(kb.pos<7){kb.pos++;if(kb.pos>0)kb.provOpen=false;paintKB();}}
/* 「＋ 添加车牌」：新建模式，用键盘选省份+后面的位，选好点"确认新增" */
function addPlateSlot(){
 kb={uid:null,pos:0,p:'',d:['','','','','','',''],isNew:true,provOpen:true};
 openPlate();
 toast('先在「一、省份简称」选省份，再到「二、字母/数字」填后面的号（第 2 位起字母数字都行）');
}
function kbDone(){
 if(kb.isNew){
  if(!kb.p||!dStr()){toast('请先选好省份，并在第 2 位起填上字母/数字（如 湘A12345）');return;}
  const n=kbFull();
  db.plates=db.plates||['未指定车牌'];
  if(db.plates.includes(n)){toast('这个车牌已经加过了');}
  else{
   db.plates.push(n);
   db.plateTypes=db.plateTypes||{};
   db.plateTypes[n]=EXP_GROUPS[0].types.slice();
   if(selByGroup.__plate==='未指定车牌')selByGroup.__plate=n;
   save({label:'新增车牌'});
  }
  kb=kbFromPlate(n);
  openPlate();render();
  toast('已添加车牌 '+n);
  return;
 }
 const full=(kb.p&&dStr())?kbFull():'';
 kb={uid:null,pos:0,p:'',d:['','','','','','',''],isNew:false};
 openPlate();render();
 toast(full?'车牌已更新':'已退出编辑');
}
function addOtherName(){   /* 新增"其他/无名车"名称 */
 db.plates=db.plates||['未指定车牌'];
 let i=(db.plates||[]).filter(p=>p!=='未指定车牌').length+1;
 let n='其他车辆'+i;
 while(db.plates.includes(n)){i++;n='其他车辆'+i;}
 db.plates.push(n);
 db.plateTypes=db.plateTypes||{};
 db.plateTypes[n]=EXP_GROUPS[0].types.slice();
 save({label:'添加车辆'});
 kb={uid:null,pos:0,prov:'',letter:'',num:'',isNew:false};
 openPlate();render();
 toast('已添加「'+n+'」，可到「其他/无名车」页签选用');
}
function delPlateSlot(name){   /* 点选即删：该车牌的历史记录归回「未指定车牌」 */
 db.plates=(db.plates||[]).filter(p=>p!==name);
 if(db.plateTypes)delete db.plateTypes[name];
 (db.expenses||[]).forEach(r=>{if(r.grp==='car'&&r.plate===name)r.plate='未指定车牌';});
 if(selByGroup.__plate===name)selByGroup.__plate='未指定车牌';
 if(kb.uid===name)kb={uid:null,pos:0,prov:'',letter:'',num:'',isNew:false};
 save({label:'删除车牌'});
 openPlate();
 render();
 toast('已删除该车牌，历史记录归到「未指定车牌」');
}
function openPlate(){
 /* 保留当前键盘编辑状态：只有第一次打开（从未点过任何车牌）才清空 */
 const list=(db.plates||['未指定车牌']);
 const cnt=p=>(db.expenses||[]).filter(r=>r.grp==='car'&&(r.plate||'未指定车牌')===p).length;
 const std=list.filter(p=>p!=='未指定车牌'&&parsePlate(p));
 const other=list.filter(p=>p!=='未指定车牌'&&!parsePlate(p));
 openModal(`<div class="shead"><h3>车牌号管理</h3><button class="btn sm" data-act="closeModal">关闭</button></div>
 <div class="hint">用车牌时：点一行车牌 → 像12123那样用键盘选<b>省份 → 字母 → 号码</b>，选好即生效，<b>不用再按保存</b>。</div>
 <div id="plateRows">
  <div class="ptab on" data-act="plateTab" data-v="std">标准车牌</div>
  <div class="ptab" data-act="plateTab" data-v="other">其他 / 无名车</div>
  <div id="plateStd">
   <div class="plrow fixed" data-pname="未指定车牌">
     <span class="plname">未指定车牌</span>
     <button class="chip ${curPlate()==='未指定车牌'?'on':''}" data-act="platePickInModal" data-v="未指定车牌" style="flex:0 0 auto">${curPlate()==='未指定车牌'?'✓ 当前':'选用'}</button>
     <span class="d2" style="flex:0 0 auto;font-size:12px">${cnt('未指定车牌')} 条</span>
   </div>
   ${std.length?std.map(p=>`<div class="plrow" data-pname="${esc(p)}">
     ${plateBoxHTML(p)}
     <button class="chip ${curPlate()===p?'on':''}" data-act="platePickInModal" data-v="${esc(p)}" style="flex:0 0 auto">${curPlate()===p?'✓ 当前':'选用'}</button>
     <span class="d2" style="flex:0 0 auto;font-size:12px">${cnt(p)} 条</span>
     <button class="xbtn" data-act="delPlate" data-v="${esc(p)}">✕</button>
   </div>`).join(''):'<div class="hint" style="text-align:center;padding:6px 0">还没有车牌，点下面「＋ 添加车牌」</div>'}
   <div style="margin-top:8px"><button class="linkbtn" data-act="addPlateSlot">＋ 添加车牌</button></div>
   <div id="plateKBBody">${plateKBHTML()}</div>  </div>
  <div id="plateOther" style="display:none">
   ${other.length?other.map(p=>`<div class="plrow" data-pname="${esc(p)}">
     <span class="plname">${esc(p)}</span>
     <button class="chip ${curPlate()===p?'on':''}" data-act="platePickInModal" data-v="${esc(p)}" style="flex:0 0 auto">${curPlate()===p?'✓ 当前':'选用'}</button>
     <span class="d2" style="flex:0 0 auto;font-size:12px">${cnt(p)} 条</span>
     <button class="xbtn" data-act="delPlate" data-v="${esc(p)}">✕</button>
   </div>`).join(''):'<div class="hint" style="text-align:center;padding:6px 0">无（用于记录没有正式车牌的车辆）</div>'}
   <div style="margin-top:8px"><button class="linkbtn" data-act="addOtherName">＋ 添加其他名称</button></div>
  </div>
 </div>`);
}
function saveMats(){
 const used=new Set([...db.purchases,...db.sales].map(r=>r.mid));
 let archived=0;
 document.querySelectorAll('#matRows .mrow').forEach(row=>{
  const name=row.querySelector('.f-name').value.trim();
  const unit=row.querySelector('.f-unit').value.trim();
  const min=+row.querySelector('.f-min').value||0;
  const marked=row.classList.contains('marked');
  const id=row.dataset.mid;
  if(id){
   const m=matById(id);if(!m)return;
   if(marked){if(used.has(id)){if(!m.archived){m.archived=true;archived++;}}else db.materials=db.materials.filter(x=>x.id!==id);}
   else if(name){m.name=name;m.unit=unit;m.min=min;m.archived=false;}
  }else if(name){db.materials.push({id:stableId(name),name,unit,min:min||0,archived:false});}
 });
 save({label:'材料管理'});closeModal();render();toast(archived?`已保存（${archived} 项已停用）`:'已保存');
}
function saveTypes(grp){
 const box=document.getElementById('typeRows');
 const g=grp||(box&&box.dataset.g)||'life';
 const out=[];let removed=0;
 document.querySelectorAll('#typeRows .mrow').forEach(row=>{
  const marked=row.classList.contains('marked');
  const name=row.querySelector('.f-name').value.trim();
  if(marked){removed++;return;}
  if(name&&!out.includes(name))out.push(name);
 });
 db.expGroups[g]=out;
 save({label:'修改'+(GRP_NAME[g]||'支出')+'类型'});closeModal();render();toast(removed?`已保存（移除 ${removed} 项）`:'已保存');
}
function saveIncTypes(){
 const out=[];let removed=0;
 document.querySelectorAll('#incTypeRows .mrow').forEach(row=>{
  const marked=row.classList.contains('marked');
  const name=row.querySelector('.f-name').value.trim();
  if(marked){removed++;return;}
  if(name&&!out.includes(name))out.push(name);
 });
 db.incomeTypes=out;
 save({label:'修改收入类型'});closeModal();render();toast(removed?`已保存（移除 ${removed} 项）`:'已保存');
}

/* ================= 历史备份还原 ================= */
function openBackups(){
 const list=getBackups().slice().reverse();
 const cnt=o=>{let n=0;try{const d=JSON.parse(o.data);n=(d.purchases||[]).length+(d.sales||[]).length+(d.expenses||[]).length;}catch(e){}return n;};
 const html=list.length?list.map(b=>{
  const d=new Date(b.ts);
  const ts=`${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  return `<div class="rrow"><span class="rdate" style="width:76px">${ts}</span><div class="rmain">${esc(b.label||'自动备份')}<div class="d2">共 ${cnt(b)} 条记录</div></div>
  <button class="btn sm" data-act="restoreOk" data-v="${esc(b.id)}">还原</button></div>`;
 }).join(''):'<div class="hint" style="text-align:center;padding:10px 0">暂无历史快照</div>';
 openModal(`<div class="shead"><h3>历史快照（最近 ${BK_MAX} 份）</h3><button class="btn sm" data-act="closeModal">关闭</button></div>
 <div class="hint">每次保存数据都会自动留档。选一份还原，会<b>覆盖</b>当前数据（还原前会先备份当前状态）。</div>${html}`);
}
function restoreBackup(id){
 const b=getBackups().find(x=>x.id===id);
 if(!b){toast('该快照已不存在');return;}
 if(!confirm('还原这份快照？当前数据将被覆盖（覆盖前会自动留档）。'))return;
 let d;try{d=JSON.parse(b.data);}catch(e){toast('快照已损坏');return;}
 snapshot('还原前');
 db=Object.assign(defaultDB(),d);
 save({label:'还原快照',file:false});
 closeModal();render();toast('已还原');
}

/* ================= 全局事件 ================= */
document.addEventListener('click',e=>{
 const del=e.target.closest('[data-del]');
 if(del){
  const name=del.dataset.del,id=del.dataset.id;
  const rec=(db[name]||[]).find(r=>r.id===id);
  if(rec&&confirm('删除这条记录？')){db[name]=db[name].filter(r=>r.id!==id);save({label:'删除记录'});render();toast('已删除');}
  return;
 }
 const el=e.target.closest('[data-act]');
 if(!el)return;
 const act=el.dataset.act,v=el.dataset.v;
  switch(act){
  case 'tab':tab=v;render();window.scrollTo(0,0);break;
  case 'fontScale':cycleFontScale();break;
  case 'buySeg':buySeg=v;render();break;
  case 'incSeg':incSeg=v;render();break;
  case 'buySave':saveBuy();break;
  case 'draftClear':
   if(confirm('清空当前填写的单价/数量？（已保存的记录不受影响）')){
    /* 用布尔标记替代原来的 clearedMids 快照：
       快照只含「点清空那一刻」的材料，之后再新增或取消归档的
       材料不在列表里，照样会被回填历史价。布尔值覆盖全部。 */
    DRAFT={date:todayStr(),prices:{},qtys:{},note:'',cleared:true};
    draftSave();render();toast('已清空填写内容');
   }
   break;
  case 'sellSave':saveSell();break;
  case 'incSave':saveInc();break;
  case 'expGrpSave':saveExpGrp(v);break;
  case 'expSel':{
   const g=el.dataset.g||'life';
   selByGroup[g]=(selByGroup[g]===v)?null:v;
   const box=document.getElementById(g+'Chips');
   if(box)box.querySelectorAll('.chip').forEach(c=>{if(c.dataset.act==='expSel')c.classList.toggle('on',c.dataset.v===selByGroup[g]);});
   break;
  }
  case 'incSel':{
   selByGroup.__inc=(selByGroup.__inc===v)?null:v;
   const box=document.getElementById('incChips');
   if(box)box.querySelectorAll('.chip').forEach(c=>{if(c.dataset.act==='incSel')c.classList.toggle('on',c.dataset.v===selByGroup.__inc);});
   break;
  }
  case 'openMat':openMat();break;
  case 'openType':openType(v);break;
  case 'openIncType':openIncType();break;
  /* ---------- 车牌 ---------- */
  case 'openPlate':openPlate();break;
  case 'sellPaidSel':case 'incPaidSel':{
   const box=el.closest('.chips');
   if(box)box.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===el));
   if(v==='0'&&el.dataset.v==='0')toast('未回款：这笔钱会在利润页计入「待回款」');
   break;
  }
  case 'togglePaid':togglePaid(el.dataset.list,el.dataset.id);break;
  case 'kbOpen':kbOpen(el.dataset.pname);break;
  case 'kbProv':kbProv(v);break;
  case 'kbLet':kbLet(v);break;
  case 'kbBack':kbBack();break;
  case 'kbPosPrev':kbPosPrev();break;
  case 'kbPosNext':kbPosNext();break;
  case 'kbDone':kbDone();break;
  case 'kbProvOpen':kbProvOpen();break;
  case 'kbMore':kbMore();break;
  case 'addPlateSlot':addPlateSlot();break;
  case 'addOtherName':addOtherName();break;
  case 'delPlate':delPlateSlot(v);break;
  case 'plateTab':{
   const std=v==='std';
   const a=$('#plateStd'),b=$('#plateOther');
   if(a)a.style.display=std?'':'none';
   if(b)b.style.display=std?'none':'';
   document.querySelectorAll('.ptab').forEach(t=>t.classList.toggle('on',t.dataset.v===v));
   break;
  }
  case 'plateSel':{
   selByGroup.__plate=(selByGroup.__plate===v)?'未指定车牌':v;
   selByGroup.car=null;   /* 换车牌后清空已选类型，避免张冠李戴 */
   render();
   break;
  }
  case 'platePickInModal':{
   const row=el.closest('.mrow');
   if(row&&v)row.dataset.pname=v;
   /* 用按钮值切换当前车牌 */
   selByGroup.__plate=v||'未指定车牌';
   selByGroup.car=null;
   openPlate();
   break;
  }
  case 'addMatRow':$('#matRows').insertAdjacentHTML('afterbegin',matRowHTML({id:'',name:'',unit:'',min:'',archived:false}));break;
  case 'addTypeRow':$('#typeRows').insertAdjacentHTML('afterbegin','<div class="mrow"><input class="f-name" type="text" placeholder="如：装卸费"><button class="xbtn" data-act="markRow">✕</button></div>');break;
  case 'addIncTypeRow':$('#incTypeRows').insertAdjacentHTML('afterbegin','<div class="mrow"><input class="f-name" type="text" placeholder="如：送货费"><button class="xbtn" data-act="markRow">✕</button></div>');break;
  case 'markRow':{const row=el.closest('.mrow');if(row&&row.dataset.tname)row.classList.toggle('marked');else if(row)row.remove();break;}
  case 'saveMats':saveMats();break;
  case 'saveTypes':saveTypes(v);break;
  case 'saveIncTypes':saveIncTypes();break;
  case 'closeModal':closeModal();break;
  case 'editMatRec':openEditRec(el.dataset.arr||'purchases',v);break;
  case 'saveEditRec':saveEditRec();break;
  case 'buyCSV':exportBuy();break;
  case 'sellCSV':exportSell();break;
  case 'stockCSV':exportStock();break;
  case 'profitCSV':exportProfit();break;
  case 'buyPrint':openPrint('buy');break;
  case 'sellPrint':openPrint('sell');break;
  case 'profitPrint':openPrint('profit');break;
  case 'pvClose':closePrint();break;
  case 'pvDo':doPrint();break;
  case 'pvPdf':exportPDF();break;
  case 'pPrev':pAll=false;pMonth=stepMonth(pMonth,-1);render();break;
  case 'pNext':pAll=false;pMonth=stepMonth(pMonth,1);render();break;
  case 'pAll':pAll=!pAll;render();break;
  case 'backup':dlFile(`进销存备份_${todayStr()}.json`,JSON.stringify(db,null,2),'application/json');toast('备份已导出');break;
  case 'restoreBK':openBackups();break;
  case 'restoreOk':restoreBackup(v);break;
  case 'importBtn':$('#importFile').click();break;
  case 'wipe':
   if(confirm('确定清空所有数据？此操作不可恢复！\n（建议先点"导出备份"）')){
    if(confirm('再次确认：真的要清空全部记录吗？')){snapshot('清空前');db=defaultDB();save({label:'已清空',file:false});render();toast('已清空（清空前已自动留档）');}
   }
   break;
 }
});
document.addEventListener('input',e=>{
 const t=e.target;
 if(t.classList&&((t.classList.contains('in-p'))||t.classList.contains('in-q'))){
  const tr=t.closest('tr');if(!tr)return;
  const p=+tr.querySelector('.in-p').value||0,q=+tr.querySelector('.in-q').value||0;
  tr.querySelector('.row-amt').textContent=(p>0&&q>0)?fmtN(p*q):'—';
  /* 支出页：把单价/数量记入今日草稿，切换页面后仍在 */
  if(tab==='buy'&&tr.dataset.mid){
   const mid=tr.dataset.mid;
   /* 用户输入即显式值，天然覆盖 cleared 的「禁止回填」 */
   DRAFT.prices[mid]=tr.querySelector('.in-p').value;
   DRAFT.qtys[mid]=tr.querySelector('.in-q').value;
   draftSave();
  }
  if(tab==='sell'){
   const mid=tr.dataset.mid,s=(window._stock||{})[mid]??0;
   tr.classList.toggle('over',q>s+1e-9);
  }
  let sum=0;
  document.querySelectorAll(`${tab==='buy'?'#buyBody':'#sellBody'} tr[data-mid]`).forEach(r=>{
   const pp=+r.querySelector('.in-p').value||0,qq=+r.querySelector('.in-q').value||0;
   if(pp>0&&qq>0)sum+=pp*qq;
  });
  const tot=document.getElementById(tab==='buy'?'buyTotal':'sellTotal');
  if(tot)tot.textContent='¥'+fmtN(sum);
 }
});
/* 备注也记住 */
document.addEventListener('input',e=>{
 if(e.target.id==='buyNote'){DRAFT.note=e.target.value;draftSave();}
});
document.addEventListener('change',e=>{
 if(e.target.id==='buyDate'){buyEntryDate=e.target.value||'';return;}  // 记住所选录入日期（含非当天），不清空也不重渲染
 if(e.target.id==='pMonth'){pMonth=e.target.value||pMonth;render();}
 if(e.target.id==='importFile'){
  const f=e.target.files[0];e.target.value='';
  if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>{
   try{
    const d=JSON.parse(rd.result);
    if(!d||!Array.isArray(d.materials)||!Array.isArray(d.purchases))throw new Error('格式不对');
    if(confirm('导入备份将覆盖当前全部数据，确定继续？')){db=Object.assign(defaultDB(),d);save();render();toast('备份已导入');}
   }catch(err){alert('备份文件无效：'+err.message);}
  };
  rd.readAsText(f);
 }
});
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});

/* ================= 字号缩放（解决大字体手机按钮被挤掉 / 年纪大的人看不清） ================= */
const FS_KEY='jiancai_fontscale_v1';
const FS_LEVELS=[1,1.15,1.3,1.5];   // 标准 / 大 / 特大 / 最大
let fsIdx=0;
function applyFontScale(){
 try{const f=+(settings.fontScale||'1');const i=FS_LEVELS.indexOf(f);fsIdx=i<0?0:i;}catch(e){fsIdx=0;}
 document.body.style.zoom=FS_LEVELS[fsIdx];
 const b=$('#fontBtn');if(b)b.textContent='字 '+(FS_LEVELS[fsIdx]===1?'标准':Math.round(FS_LEVELS[fsIdx]*100)+'%');
}
function cycleFontScale(){
 fsIdx=(fsIdx+1)%FS_LEVELS.length;
 settings.fontScale=FS_LEVELS[fsIdx];persist();
 applyFontScale();
 toast('字号：'+(FS_LEVELS[fsIdx]===1?'标准':Math.round(FS_LEVELS[fsIdx]*100)+'%')+'（已记住）');
}

/* ================= 启动 ================= */
(async function init(){
 const status=document.createElement('div');status.id='sync-status';status.style.cssText='position:fixed;z-index:99;right:8px;top:4px;background:white;color:#333;padding:4px;font-size:12px';status.textContent='正在读取云端数据…';document.body.appendChild(status);
 const blocker=document.createElement('div');blocker.style.cssText='position:fixed;inset:0;z-index:98;background:#fff';document.body.appendChild(blocker);
 try{const state=await readState();if(!state)throw Error('数据库未初始化');if(state.db)db=migrate(Object.assign(defaultDB(),state.db));backups=state.backups||[];settings=state.settings||{};persistedDraft=state.draft||null;status.textContent='已连接云端';blocker.remove();}catch(e){status.textContent='无法读取云端数据，请重新打开应用：'+e.message;return;}

 const d=new Date();
 $('#hdate').textContent=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} 周${WEEK[d.getDay()]}`;
 const h=location.hash.slice(1);
 if(['buy','sell','profit'].includes(h))tab=h;
 draftLoad();
 applyFontScale();
 render();
})();
