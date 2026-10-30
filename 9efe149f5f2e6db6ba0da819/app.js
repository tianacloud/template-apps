const style=document.createElement("style");style.textContent="\n*{box-sizing:border-box;margin:0;padding:0}\n:root{\n  --bg:#070a10;--bg2:#0b1119;--panel:#0f1722;--panel2:#111c29;\n  --line:#1d2a3b;--line2:#26384e;\n  --txt:#e7eef8;--dim:#8a9bb3;--dim2:#64748b;\n  --acc:#38bdf8;--acc2:#818cf8;\n  --ok:#34d399;--warn:#fbbf24;--err:#f87171;--info:#60a5fa;\n  --mono:ui-monospace,SFMono-Regular,\"SF Mono\",Menlo,Consolas,\"Liberation Mono\",monospace;\n}\nhtml,body{background:var(--bg);color:var(--txt);}\nbody{\n  font-family:-apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;\n  font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased;\n  background-image:radial-gradient(900px 500px at 12% -10%,rgba(56,189,248,.10),transparent 60%),\n                   radial-gradient(800px 400px at 92% 0%,rgba(129,140,248,.09),transparent 62%),\n                   linear-gradient(180deg,#070a10 0%,#080c13 100%);\n  background-attachment:fixed;\n  min-height:100vh;\n}\n.app{max-width:1280px;margin:0 auto;padding:22px 20px 40px}\n\n/* ── top bar ── */\n.top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px}\n.brand{display:flex;gap:13px;align-items:center}\n.logo{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;\n  background:linear-gradient(145deg,rgba(56,189,248,.22),rgba(129,140,248,.18));\n  border:1px solid rgba(56,189,248,.35);box-shadow:0 0 24px rgba(56,189,248,.14)}\nh1{font-size:19px;letter-spacing:.4px;font-weight:650}\n.sub{font-size:12.5px;color:var(--dim);margin-top:2px;overflow-wrap:anywhere}\n.badges{display:flex;gap:8px;flex-wrap:wrap;align-items:center}\n.chip{font-size:11.5px;padding:4px 10px;border-radius:999px;border:1px solid var(--line2);color:var(--dim);white-space:nowrap}\n.chip-demo{color:#a5f3fc;border-color:rgba(56,189,248,.45);background:rgba(56,189,248,.10)}\n.chip-ver{color:#c7d2fe;border-color:rgba(129,140,248,.4);background:rgba(129,140,248,.10)}\n\n/* ── scenario bar ── */\n.scenariobar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px;\n  padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:rgba(15,23,34,.66)}\n.scenariobar .lbl{font-size:12px;color:var(--dim2);letter-spacing:.5px}\n.pills{display:flex;gap:8px;flex-wrap:wrap}\n.pill{cursor:pointer;font:inherit;font-size:12.5px;padding:6px 14px;border-radius:8px;\n  border:1px solid var(--line2);background:transparent;color:var(--dim);transition:.18s}\n.pill:hover{color:var(--txt);border-color:#33506e}\n.pill.on{color:#06121b;background:linear-gradient(135deg,#38bdf8,#7dd3fc);border-color:transparent;font-weight:600;\n  box-shadow:0 4px 16px rgba(56,189,248,.28)}\n\n/* ── layout ── */\n.grid{display:grid;grid-template-columns:386px minmax(0,1fr);gap:0 16px;align-items:start;\n  grid-template-areas:\"side main\" \"rules main\"}\n.grid > aside{grid-area:side}\n.grid > .ruleswrap{grid-area:rules}\n.grid > .maincol{grid-area:main;min-width:0}\n.panel{background:linear-gradient(180deg,rgba(17,28,41,.92),rgba(13,20,30,.92));\n  border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:14px;\n  box-shadow:0 10px 30px rgba(0,0,0,.30)}\n.panel-h{display:flex;align-items:center;justify-content:space-between;gap:10px;\n  font-size:12px;letter-spacing:1.2px;color:var(--dim);text-transform:uppercase;margin-bottom:12px}\n.panel-h .cnt{font-family:var(--mono);letter-spacing:0;color:var(--acc);font-size:11.5px}\n\n/* ── query ── */\n.qrow{display:flex;gap:8px}\n#q{flex:1;min-width:0;background:#080e16;border:1px solid var(--line2);border-radius:9px;\n  padding:10px 12px;color:var(--txt);font-family:var(--mono);font-size:13px;outline:none;transition:.18s}\n#q:focus{border-color:var(--acc);box-shadow:0 0 0 3px rgba(56,189,248,.12)}\n#run{cursor:pointer;font:inherit;font-size:13px;font-weight:600;padding:10px 16px;border-radius:9px;border:0;\n  color:#04121a;background:linear-gradient(135deg,#38bdf8,#a5f3fc);white-space:nowrap;\n  transition:.18s;box-shadow:0 6px 18px rgba(56,189,248,.22)}\n#run:hover{filter:brightness(1.07)}\n#run:disabled{opacity:.55;cursor:progress}\n.quick{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}\n.quick i{font-style:normal;font-size:11.5px;color:var(--dim2);padding:3px 8px;border-radius:6px;\n  border:1px dashed var(--line2);cursor:pointer;transition:.15s}\n.quick i:hover{color:var(--acc);border-color:rgba(56,189,248,.5);border-style:solid}\n.hint{font-size:11.5px;color:var(--dim2);margin-top:9px;line-height:1.55}\n\n/* ── timeline ── */\n.tlbar{height:3px;border-radius:3px;background:#101a26;overflow:hidden;margin-bottom:12px}\n.tlbar i{display:block;height:100%;width:0;border-radius:3px;\n  background:linear-gradient(90deg,#38bdf8,#818cf8);transition:width .35s ease}\n.timeline{position:relative;padding-left:4px}\n.node{position:relative;display:flex;gap:11px;padding-bottom:15px;opacity:.42;transition:opacity .3s}\n.node:last-child{padding-bottom:0}\n.node:not(:last-child):before{content:\"\";position:absolute;left:6px;top:16px;bottom:0;width:1px;background:var(--line2)}\n.node.done{opacity:1}\n.dot{width:13px;height:13px;border-radius:50%;flex:0 0 13px;margin-top:4px;position:relative;z-index:1;\n  background:#1a2738;border:2px solid #2b3f57;transition:.25s}\n.node.ok .dot{background:rgba(52,211,153,.22);border-color:var(--ok);box-shadow:0 0 10px rgba(52,211,153,.35)}\n.node.warn .dot{background:rgba(251,191,36,.22);border-color:var(--warn);box-shadow:0 0 10px rgba(251,191,36,.35)}\n.node.err .dot{background:rgba(248,113,113,.25);border-color:var(--err);box-shadow:0 0 12px rgba(248,113,113,.45);\n  animation:pulse 1.5s infinite}\n@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,.42)}55%{box-shadow:0 0 0 7px rgba(248,113,113,0)}}\n.nbody{min-width:0;flex:1}\n.nrow{display:flex;align-items:baseline;justify-content:space-between;gap:8px}\n.nrow b{font-size:13px;font-weight:600}\n.node.err .nrow b{color:#fecaca}\n.cost{font-family:var(--mono);font-size:11.5px;color:var(--dim2);white-space:nowrap}\n.node.err .cost{color:var(--err)}\n.ndetail{font-size:11.5px;color:var(--dim2);margin-top:2px;word-break:break-word;overflow-wrap:anywhere}\n\n/* ── metrics ── */\n.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}\n.m{background:linear-gradient(180deg,rgba(17,28,41,.92),rgba(12,19,28,.92));\n  border:1px solid var(--line);border-radius:12px;padding:11px 13px}\n.m .k{font-size:11px;color:var(--dim2);letter-spacing:.4px}\n.m .v{font-family:var(--mono);font-size:21px;font-weight:600;margin-top:2px;letter-spacing:-.4px}\n.m .v small{font-size:11.5px;font-weight:400;color:var(--dim2);margin-left:3px;letter-spacing:0}\n.m.hot .v{color:var(--err)}\n.m.warm .v{color:var(--warn)}\n.m.ok .v{color:var(--ok)}\n\n/* ── verdict ── */\n.verdict{display:flex;gap:12px;align-items:flex-start;padding:13px 15px;border-radius:12px;margin-bottom:14px;\n  border:1px solid rgba(248,113,113,.34);background:linear-gradient(90deg,rgba(248,113,113,.12),rgba(248,113,113,.02))}\n.verdict .vic{font-size:17px;line-height:1.2;margin-top:1px}\n.verdict .vt{font-size:11px;letter-spacing:1.2px;color:#fca5a5;text-transform:uppercase}\n.verdict .vb{font-size:13.5px;margin-top:3px;color:#f3f4f6}\n.verdict .vb code{font-family:var(--mono);font-size:12.5px;color:#fecaca;background:rgba(248,113,113,.12);\n  padding:1px 5px;border-radius:4px}\n\n/* ── cards ── */\n.cards{display:flex;flex-direction:column;gap:11px}\n.card{border:1px solid var(--line);border-radius:12px;padding:13px 15px;background:rgba(10,16,24,.75)}\n.card.lv-high{border-left:3px solid var(--err)}\n.card.lv-mid{border-left:3px solid var(--warn)}\n.card.lv-low{border-left:3px solid var(--info)}\n.ch{display:flex;align-items:center;gap:9px;flex-wrap:wrap}\n.lv{font-size:10.5px;font-weight:700;letter-spacing:.6px;padding:2px 7px;border-radius:5px}\n.lv-high .lv{color:#fecaca;background:rgba(248,113,113,.16)}\n.lv-mid .lv{color:#fde68a;background:rgba(251,191,36,.16)}\n.lv-low .lv{color:#bfdbfe;background:rgba(96,165,250,.16)}\n.ch h3{font-size:14px;font-weight:600;flex:1;min-width:180px}\n.conf{font-family:var(--mono);font-size:11px;color:var(--dim2)}\n.crow{display:flex;gap:9px;margin-top:9px;font-size:12.8px;line-height:1.65}\n.crow em{font-style:normal;flex:0 0 40px;color:var(--dim2);font-size:11.5px;padding-top:1px}\n.crow p{color:#cbd5e1;flex:1;min-width:0}\n.crow p b{color:#f1f5f9;font-weight:600}\n.locus{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}\n.locus code{font-family:var(--mono);font-size:11.5px;color:#a5f3fc;background:rgba(56,189,248,.09);\n  border:1px solid rgba(56,189,248,.22);padding:2px 7px;border-radius:5px;\n  overflow-wrap:anywhere;word-break:break-word;max-width:100%}\n\n/* ── sql ── */\n.sqlp .panel-h button{font:inherit;font-size:11.5px;cursor:pointer;color:var(--acc);background:rgba(56,189,248,.10);\n  border:1px solid rgba(56,189,248,.3);border-radius:6px;padding:3px 9px;transition:.15s}\n.sqlp .panel-h button:hover{background:rgba(56,189,248,.18)}\n.sqlblk{border:1px solid var(--line);border-radius:10px;overflow:hidden;margin-bottom:9px;background:#070c13}\n.sqlblk:last-child{margin-bottom:0}\n.sqh{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 11px;\n  background:rgba(19,31,45,.8);border-bottom:1px solid var(--line)}\n.sqh span{font-size:12px;color:#cbd5e1}\n.sqh .k{font-family:var(--mono);font-size:10.5px;color:var(--dim2);margin-left:7px}\n.sqh button{font:inherit;font-size:11px;cursor:pointer;color:var(--dim);background:transparent;\n  border:1px solid var(--line2);border-radius:5px;padding:2px 8px;transition:.15s}\n.sqh button:hover{color:var(--acc);border-color:rgba(56,189,248,.45)}\npre{font-family:var(--mono);font-size:12px;line-height:1.72;padding:11px 13px;overflow:auto;color:#b9cbe0;\n  white-space:pre;tab-size:2}\npre .kw{color:#c084fc}.pre-note{color:#fbbf24}\n\n/* ── rules ── */\n.rules{display:flex;flex-direction:column}\n.rule{display:flex;align-items:center;gap:9px;padding:6px 1px;border-bottom:1px dashed rgba(38,56,78,.55);\n  font-size:12px;color:#5d6e85;transition:.25s}\n.rule:last-child{border-bottom:0}\n.rule i{width:6px;height:6px;border-radius:50%;background:#22303f;flex:0 0 6px;transition:.25s}\n.rule.hit{color:#e6edf6}\n.rule.hit i{background:var(--err);box-shadow:0 0 9px rgba(248,113,113,.65)}\n.rule em{margin-left:auto;font-style:normal;font-size:10px;letter-spacing:.5px;color:#fca5a5;opacity:0;transition:.25s}\n.rule.hit em{opacity:1}\n\n/* ── footer ── */\nfooter{margin-top:18px;padding-top:14px;border-top:1px solid var(--line);\n  font-size:11.5px;color:var(--dim2);line-height:1.75}\nfooter b{color:var(--dim)}\n#toast{position:fixed;left:50%;bottom:30px;transform:translate(-50%,14px);opacity:0;pointer-events:none;\n  background:#0f2a3f;color:#a5f3fc;border:1px solid rgba(56,189,248,.45);border-radius:9px;\n  padding:8px 16px;font-size:12.5px;transition:.22s;z-index:99}\n#toast.on{opacity:1;transform:translate(-50%,0)}\n\n@media (max-width:960px){\n  .grid{grid-template-columns:minmax(0,1fr);gap:0;\n    grid-template-areas:\"side\" \"main\" \"rules\"}\n  .metrics{grid-template-columns:repeat(2,minmax(0,1fr))}\n  .app{padding:16px 13px 32px}\n  h1{font-size:17px}\n  .sub{font-size:12px;line-height:1.5}\n  .brand{min-width:0;align-items:flex-start}\n  .brand > div{min-width:0}\n  .top .badges{width:100%}\n  .qrow{flex-wrap:wrap}\n  #q{flex:1 1 190px}\n  #run{flex:0 0 auto}\n  .quick i{font-size:11px}\n}\n@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}\n";document.head.appendChild(style);document.getElementById("app").innerHTML="\n<div class=\"app\">\n\n  <header class=\"top\">\n    <div class=\"brand\">\n      <div class=\"logo\">\n        <svg fill=\"none\" height=\"23\" stroke=\"#7dd3fc\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\" viewBox=\"0 0 24 24\" width=\"23\">\n          <path d=\"M4 4h16v12H4z\" opacity=\".45\"/><path d=\"M7.5 8.5l2.5 2.5-2.5 2.5\"/><path d=\"M12.5 13.5h4\"/>\n        </svg>\n      </div>\n      <div>\n        <h1>研发排查工作台</h1>\n        <p class=\"sub\">输入单据号，自动还原全链路 · 定位根因与代码落点 · 生成只读排查 SQL</p>\n      </div>\n    </div>\n    <div class=\"badges\">\n      <span class=\"chip chip-demo\">演示数据 · 已脱敏</span>\n      <span class=\"chip chip-ver\">演练版 v0.9</span>\n    </div>\n  </header>\n\n  <div class=\"scenariobar\">\n    <span class=\"lbl\">演练场景</span>\n    <div class=\"pills\" id=\"pills\"></div>\n  </div>\n\n  <div class=\"grid\">\n    <aside>\n      <div class=\"panel\">\n        <div class=\"panel-h\">查询条件</div>\n        <div class=\"qrow\">\n          <input aria-label=\"单据号\" autocomplete=\"off\" id=\"q\" spellcheck=\"false\" type=\"text\">\n          <button id=\"run\" type=\"button\">开始排查</button>\n        </div>\n        <div class=\"quick\" id=\"quick\"></div>\n        <p class=\"hint\" id=\"hint\"></p>\n      </div>\n\n      <div class=\"panel\">\n        <div class=\"panel-h\">\n          <span>链路节点</span>\n          <span class=\"cnt\" id=\"nodeCnt\">0 / 0</span>\n        </div>\n        <div class=\"tlbar\"><i id=\"tlfill\"></i></div>\n        <div class=\"timeline\" id=\"timeline\"></div>\n      </div>\n    </aside>\n\n    <div class=\"ruleswrap\">\n      <div class=\"panel\">\n        <div class=\"panel-h\">\n          <span>规则库</span>\n          <span class=\"cnt\" id=\"ruleCnt\">12 条 · 待命中</span>\n        </div>\n        <div class=\"rules\" id=\"rules\"></div>\n      </div>\n    </div>\n\n    <section class=\"maincol\">\n      <div class=\"metrics\" id=\"metrics\"></div>\n      <div class=\"verdict\" id=\"verdict\" style=\"display:none\"></div>\n\n      <div class=\"panel\">\n        <div class=\"panel-h\">\n          <span>诊断结论</span>\n          <span class=\"cnt\" id=\"diagCnt\">待排查</span>\n        </div>\n        <div class=\"cards\" id=\"cards\"></div>\n      </div>\n\n      <div class=\"panel sqlp\">\n        <div class=\"panel-h\">\n          <span>排查 SQL · 只读</span>\n          <button id=\"copyAll\" type=\"button\">复制全部</button>\n        </div>\n        <div id=\"sqlbox\"></div>\n      </div>\n    </section>\n  </div>\n\n  <footer>\n    <b>关于本页数据</b>：全部单据号、状态、耗时、日志、表名与字段均为虚构示例，用于演示排查方法论；不含任何真实业务数据、密钥或内网地址。SQL 仅作只读排查参考，请勿直接在生产执行写操作。\n  </footer>\n</div>\n<div id=\"toast\"></div>\n\n";

(function(){
  "use strict";

  /* ══════════ 数据：三个演练场景（全部虚构） ══════════ */
  var SCENARIOS = [
    {
      id: "stuck",
      label: "① 卡单不动",
      tag: "待确认",
      order: "RYTH20261022000417",
      hint: "订单停在「待确认」超 30 分钟，未下发仓库。排查方向：异步确认段耗时、分布式锁 TTL、明细扩展表落库。",
      total: "96.8s",
      slowest: "92.4s",
      bad: 2,
      hits: "3 / 12",
      hitRules: [0, 1, 2],
      verdict: "异步确认段耗时 92.4s 超过分布式锁 TTL 60s，锁提前释放后同单被第二次消费，拆单链路等待一个永远不会到来的回执。",
      nodes: [
        { name: "平台接单", t: "08:12:03.118", cost: "120ms", state: "ok", detail: "来源渠道 push · 报文校验通过" },
        { name: "预寻源建会话", t: "08:12:03.240", cost: "86ms", state: "ok", detail: "session = PS20261022000718" },
        { name: "库存占用", t: "08:12:03.402", cost: "1.2s", state: "ok", detail: "3 个仓命中，锁定 8 个明细行" },
        { name: "自动审核", t: "08:12:04.660", cost: "340ms", state: "ok", detail: "策略命中：常规直发" },
        { name: "拆单下发", t: "08:12:05.010", cost: "92.4s", state: "err", detail: "等待库存回执超时 · 锁已于 +60s 释放" },
        { name: "仓库回执", t: "—", cost: "未到达", state: "warn", detail: "下发报文未生成，仓库侧无记录" },
        { name: "出库回传", t: "—", cost: "未到达", state: "warn", detail: "上游未启动" },
        { name: "订单完成", t: "—", cost: "未到达", state: "warn", detail: "上游未启动" }
      ],
      cards: [
        {
          lv: "high", title: "分布式锁在业务未完成时到期，同单被二次消费",
          conf: "置信度 92%",
          symptom: "拆单节点耗时 <b>92.4s</b>，而锁 TTL 为 <b>60s</b>；锁释放后 1.3s，同单号第二条确认消息开始处理。",
          cause: "锁续期只挂在调度线程上；回调线程复用同一个 key 但没有续期，长尾请求必然越过 TTL。",
          fix: "锁 TTL 提到异步段 P99 × 1.5，并在回调入口强制续期；同单消息加幂等键拦截。",
          locus: ["PresourceLockService.java:88", "ConfirmCallbackConsumer.java:143"]
        },
        {
          lv: "mid", title: "明细扩展表一条没写，且没有任何报错",
          conf: "置信度 86%",
          symptom: "主表 <b>8</b> 行明细，扩展表 <b>0</b> 行；日志无异常，链路显示成功。",
          cause: "回调按 itemId 做 update，update 影响 0 行时直接 return，既不 upsert 也不抛错，形成静默缺口。",
          fix: "改为 upsert，或在影响行数为 0 时抛业务异常并告警，避免「链路正常但数据不全」。",
          locus: ["OrderItemExtService.java:99", "TobeConfirmCallBackService.java:220"]
        },
        {
          lv: "low", title: "同一条消息消费 3 次，第 3 次进死信",
          conf: "置信度 74%",
          symptom: "topic 消费 3 次（08:12:05 / 08:13:07 / 08:13:31），最后一次转入死信队列。",
          cause: "重试间隔 30s 小于业务超时 92s，两次重试都在等同一把已释放的锁，形成无效重试。",
          fix: "重试退避改为指数（≥ 业务超时），死信积压接入告警并在修复后按业务键重放。",
          locus: ["DeadLetterHandler.java:57"]
        }
      ],
      sql: [
        { k: "SQL", title: "核对扩展表是否落库", body:
"SELECT o.order_no,\n       COUNT(i.id) AS item_cnt,\n       COUNT(e.id) AS ext_cnt\nFROM   order_main o\nLEFT JOIN order_item     i ON i.order_id = o.id\nLEFT JOIN order_item_ext e ON e.item_id  = i.id\nWHERE  o.order_no = 'RYTH20261022000417'\nGROUP BY o.order_no;" },
        { k: "SQL", title: "该单 MQ 消费记录（含重试）", body:
"SELECT msg_id, topic, consume_status, retry_cnt,\n       created_at, finished_at,\n       TIMESTAMPDIFF(SECOND, created_at, finished_at) AS cost_sec\nFROM   mq_consume_log\nWHERE  biz_no = 'RYTH20261022000417'\nORDER BY created_at;" },
        { k: "SQL", title: "会话锁持有时间 vs TTL", body:
"SELECT session_no, lock_key, lock_ttl,\n       acquired_at, released_at,\n       TIMESTAMPDIFF(SECOND, acquired_at, released_at) AS hold_sec\nFROM   presource_session\nWHERE  order_no = 'RYTH20261022000417';" }
      ]
    },
    {
      id: "amount",
      label: "② 金额异常",
      tag: "金额为 0",
      order: "RYTH20261021000988",
      hint: "提货单金额 0.00，但订单实付 168.00。排查方向：金额取值字段、NULL 聚合、重复提货单。",
      total: "1.4s",
      slowest: "12ms",
      bad: 1,
      hits: "3 / 12",
      hitRules: [4, 5, 6],
      verdict: "金额汇总取的是挂牌价字段，促销单该字段为空，NULL 经聚合后被兜底成 0，最终把整单金额写成 0.00。",
      nodes: [
        { name: "周期购计划匹配", t: "10:02:11.006", cost: "210ms", state: "ok", detail: "命中 12 期计划 · 第 3 期" },
        { name: "生成提货单", t: "10:02:11.221", cost: "480ms", state: "ok", detail: "pickup_no = PK20261021000312" },
        { name: "金额计算", t: "10:02:11.705", cost: "12ms", state: "warn", detail: "取值字段 price_std 为 NULL，进入兜底分支" },
        { name: "明细汇总", t: "10:02:11.718", cost: "8ms", state: "err", detail: "SUM 结果 NULL → toZero() → 0.00" },
        { name: "财务推送", t: "10:02:11.727", cost: "640ms", state: "ok", detail: "推送成功（金额已错误）" },
        { name: "对账完成", t: "10:02:12.370", cost: "150ms", state: "ok", detail: "对账任务将在 T+1 发现差异" }
      ],
      cards: [
        {
          lv: "high", title: "金额取挂牌价而非成交价，促销单必为 0",
          conf: "置信度 95%",
          symptom: "提货单金额 <b>0.00</b>，明细 3 行合计 <b>0.00</b>，订单侧实付 <b>168.00</b>。",
          cause: "汇总逻辑固定取 <b>price_std</b>（挂牌价），促销/活动单该字段不落值；正确字段是 <b>price_actual</b>。",
          fix: "改取 price_actual，为空再回退 price_std，并在金额为 0 且数量 > 0 时阻断生成。",
          locus: ["CyclePickupAmountService.java:214"]
        },
        {
          lv: "mid", title: "一行明细数量为 NULL，SUM 被整行吞掉",
          conf: "置信度 81%",
          symptom: "3 行明细中 1 行 qty 为 NULL；SUM 结果直接变 NULL，再被兜底转成 0。",
          cause: "生成明细时未做非空校验，聚合阶段也没用 COALESCE，一个 NULL 污染整单。",
          fix: "聚合统一 COALESCE(qty,0) * COALESCE(price,0)，生成侧补非空拦截。",
          locus: ["AmountAggregator.java:76"]
        },
        {
          lv: "low", title: "同单存在 2 条有效提货单，需按业务时间取最新",
          conf: "置信度 68%",
          symptom: "2 条 pickup 记录均未作废，金额一真一假（0.00 / 168.00）。",
          cause: "重算任务生成新单时未把旧单置为失效，下游取到了错误的那条。",
          fix: "重算前先作废旧单，或下游按 created_at DESC 取最新一条。",
          locus: ["CyclePickupService.java:131"]
        }
      ],
      sql: [
        { k: "SQL", title: "订单成交价 vs 提货单金额", body:
"SELECT o.order_no, o.pay_amount,\n       p.pickup_no, p.amount, p.price_field, p.status, p.created_at\nFROM   order_main   o\nJOIN   cycle_pickup p ON p.order_no = o.order_no\nWHERE  o.order_no = 'RYTH20261021000988'\nORDER BY p.created_at DESC;" },
        { k: "SQL", title: "明细逐行核对（含 NULL 数量）", body:
"SELECT item_id, sku_code, qty, price_actual, price_std,\n       (COALESCE(qty,0) * COALESCE(price_actual,0)) AS row_amount\nFROM   cycle_pickup_item\nWHERE  pickup_no = 'PK20261021000312';" },
        { k: "SQL", title: "全量：金额为 0 但数量不为 0 的提货单", body:
"SELECT p.pickup_no, p.order_no, p.amount, SUM(COALESCE(i.qty,0)) AS total_qty\nFROM   cycle_pickup p\nJOIN   cycle_pickup_item i ON i.pickup_no = p.pickup_no\nWHERE  p.created_at >= '2026-10-01'\n  AND  p.amount = 0\nGROUP BY p.pickup_no, p.order_no, p.amount\nHAVING SUM(COALESCE(i.qty,0)) > 0;" }
      ]
    },
    {
      id: "missing",
      label: "③ 列表缺数",
      tag: "静默丢单",
      order: "LIST-2026-10-01 ~ 10-21",
      hint: "列表与导出少了一批老订单，接口不报错。排查方向：检索引擎分片、分页终止条件、排序唯一性。",
      total: "2.6s",
      slowest: "2.1s",
      bad: 2,
      hits: "3 / 12",
      hitRules: [7, 8, 9],
      verdict: "检索层没有校验分片失败，部分分片超时后仍返回成功；同时用「本页条数 < 每页条数」判断末页，两者叠加导致最老的一整段订单被静默丢弃。",
      nodes: [
        { name: "列表查询入口", t: "14:31:02.004", cost: "3ms", state: "ok", detail: "条件：店铺 1001 · 时间 10-01 ~ 10-21" },
        { name: "条件拼装", t: "14:31:02.007", cost: "1ms", state: "ok", detail: "命中 6 个过滤条件 · 排序 create_time desc" },
        { name: "检索引擎查询", t: "14:31:02.010", cost: "2.1s", state: "err", detail: "3 个分片 failed，接口仍返回 200" },
        { name: "分片聚合", t: "14:31:04.118", cost: "84ms", state: "warn", detail: "total = 8412（真值 10073）" },
        { name: "分页组装", t: "14:31:04.205", cost: "6ms", state: "warn", detail: "第 7 页 size 不足，判定为末页并终止" },
        { name: "前端渲染", t: "14:31:04.214", cost: "38ms", state: "ok", detail: "渲染正常，用户无感知" }
      ],
      cards: [
        {
          lv: "high", title: "检索层不校验分片失败，失败也返回成功",
          conf: "置信度 93%",
          symptom: "接口 200，命中 <b>8,412</b> 条，数据库真值 <b>10,073</b> 条；同期有 3 个分片 failed。",
          cause: "查询工具只判断请求是否成功，不看 <b>_shards.failed</b>，分片超时等于静默少数据。",
          fix: "failed > 0 直接抛异常并打点告警；对账任务按天比对 DB 与索引条数。",
          locus: ["EsQueryUtil.java:617"]
        },
        {
          lv: "mid", title: "用「本页条数不足」判断末页，提前终止翻页",
          conf: "置信度 88%",
          symptom: "翻到第 7 页时本页只有 12 条（页大小 50），被判为最后一页，后续 1,600 条不再返回。",
          cause: "分片缺失已经让结果集变短，再用 size 判末页，两个缺陷叠加放大。",
          fix: "改用 total 判断或 search_after 游标，不再用条数推断末页。",
          locus: ["OrderListService.java:375"]
        },
        {
          lv: "low", title: "排序字段不唯一，深分页会重复或错位",
          conf: "置信度 71%",
          symptom: "第 20 页之后出现重复行，同单号在不同页各出现一次。",
          cause: "只按 create_time 排序，同秒订单顺序不稳定，深分页时游标漂移。",
          fix: "排序追加主键作为 tiebreaker：create_time desc, id desc。",
          locus: ["SearchSortBuilder.java:300"]
        }
      ],
      sql: [
        { k: "SQL", title: "数据库真值（与索引条数比对）", body:
"SELECT COUNT(*) AS db_total\nFROM   order_main\nWHERE  shop_id = 1001\n  AND  create_time >= '2026-10-01 00:00:00'\n  AND  create_time <  '2026-10-22 00:00:00';" },
        { k: "SQL", title: "按天比对，定位从哪天开始丢", body:
"SELECT DATE(create_time) AS d, COUNT(*) AS db_cnt\nFROM   order_main\nWHERE  shop_id = 1001\n  AND  create_time >= '2026-10-01'\nGROUP BY DATE(create_time)\nORDER BY d;" },
        { k: "ES DSL", title: "查看分片健康与失败情况", body:
"GET _cat/shards/order_idx?v&h=index,shard,prirep,state,docs,store\n\nGET order_idx/_search\n{\n  \"size\": 0,\n  \"track_total_hits\": true,\n  \"query\": { \"term\": { \"shop_id\": 1001 } }\n}" }
      ]
    }
  ];

  /* ══════════ DOM ══════════ */
  var $ = function(id){ return document.getElementById(id); };
  var pillsEl = $("pills"), quickEl = $("quick"), hintEl = $("hint"),
      qEl = $("q"), runEl = $("run"), tlEl = $("timeline"),
      fillEl = $("tlfill"), nodeCntEl = $("nodeCnt"),
      metricsEl = $("metrics"), verdictEl = $("verdict"),
      cardsEl = $("cards"), diagCntEl = $("diagCnt"),
      sqlEl = $("sqlbox"), toastEl = $("toast"),
      rulesEl = $("rules"), ruleCntEl = $("ruleCnt");

  /* 规则库：排查时逐条比对，命中即高亮 */
  var RULES = [
    "分布式锁 TTL 小于业务耗时",
    "回调 update 影响 0 行未告警",
    "MQ 重试间隔小于业务超时",
    "主表与扩展表行数不一致",
    "金额取值字段为空",
    "NULL 参与聚合导致结果被吞",
    "同一业务键存在多条有效单据",
    "检索分片失败未校验",
    "分页按条目数判断末页",
    "排序字段不唯一",
    "状态机停留超阈值",
    "上游回执缺失"
  ];

  var cur = 0, token = 0, timer = null;

  function escapeHtml(s){
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  /* 防御性清洗：所有入 DOM 的 HTML 片段统一过一遍，去掉脚本标签与内联事件 */
  function sanitize(html){
    return String(html)
      .replace(/<\s*\/?\s*(script|iframe|object|embed|link|meta|style|form)\b[^>]*>/gi, "")
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/javascript:/gi, "");
  }
  /* 只高亮 SQL 关键字，正文已是纯文本 */
  function hl(txt){
    var kw = /\b(SELECT|FROM|WHERE|AND|OR|LEFT|RIGHT|JOIN|INNER|GROUP|ORDER|BY|HAVING|LIMIT|AS|COUNT|SUM|DATE|COALESCE|TIMESTAMPDIFF|ON|DESC|ASC|GET|POST)\b/g;
    var s = escapeHtml(txt);
    s = s.replace(kw, function(m){ return '<span class="kw">' + m + '</span>'; });
    return s;
  }
  function toast(msg){
    toastEl.textContent = msg;
    toastEl.className = "on";
    clearTimeout(toast._t);
    toast._t = setTimeout(function(){ toastEl.className = ""; }, 1600);
  }
  function copy(text){
    var done = function(){ toast("已复制到剪贴板"); };
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
    function fallback(){
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch(e){ toast("复制失败，请手动选择"); }
      document.body.removeChild(ta);
    }
  }

  /* ══════════ 渲染：场景 pill ══════════ */
  function renderPills(){
    var h = "";
    for (var i = 0; i < SCENARIOS.length; i++){
      h += '<button class="pill' + (i === cur ? " on" : "") + '" type="button" data-i="' + i + '">' + escapeHtml(SCENARIOS[i].label) + '</button>';
    }
    pillsEl.innerHTML = sanitize(h);
  }
  function renderQuick(){
    var s = SCENARIOS[cur], h = "";
    for (var i = 0; i < SCENARIOS.length; i++){
      if (i === cur) continue;
      h += '<i data-i="' + i + '">' + escapeHtml(SCENARIOS[i].order) + '</i>';
    }
    quickEl.innerHTML = sanitize(h);
    hintEl.textContent = s.hint;
  }

  /* ══════════ 渲染：时间轴骨架 ══════════ */
  function renderSkeleton(){
    var s = SCENARIOS[cur], h = "";
    for (var i = 0; i < s.nodes.length; i++){
      var n = s.nodes[i];
      h += '<div class="node" data-i="' + i + '">' +
             '<div class="dot"></div>' +
             '<div class="nbody">' +
               '<div class="nrow"><b>' + escapeHtml(n.name) + '</b><span class="cost">—</span></div>' +
               '<div class="ndetail">等待中</div>' +
             '</div>' +
           '</div>';
    }
    tlEl.innerHTML = sanitize(h);
    nodeCntEl.textContent = "0 / " + s.nodes.length;
    fillEl.style.width = "0%";
  }

  function renderRules(){
    var h = "";
    for (var i = 0; i < RULES.length; i++){
      h += '<div class="rule" data-r="' + i + '"><i></i><span>' + escapeHtml(RULES[i]) + '</span><em>命中</em></div>';
    }
    rulesEl.innerHTML = sanitize(h);
    ruleCntEl.textContent = RULES.length + " 条 · 待命中";
  }
  function markRules(){
    var hits = SCENARIOS[cur].hitRules;
    for (var i = 0; i < hits.length; i++){
      var el = rulesEl.querySelector('.rule[data-r="' + hits[i] + '"]');
      if (el) el.className = "rule hit";
    }
    ruleCntEl.textContent = RULES.length + " 条 · 命中 " + hits.length;
  }

  function setNode(i, n){
    var el = tlEl.querySelector('.node[data-i="' + i + '"]');
    if (!el) return;
    el.className = "node done " + n.state;
    el.querySelector(".cost").textContent = n.t === "—" ? n.cost : n.cost;
    el.querySelector(".ndetail").textContent = n.t === "—" ? n.detail : (n.t + " · " + n.detail);
  }

  /* ══════════ 渲染：指标 / 结论 / 卡片 / SQL ══════════ */
  function renderMetrics(){
    var s = SCENARIOS[cur];
    metricsEl.innerHTML = sanitize(
      '<div class="m"><div class="k">全链路总耗时</div><div class="v">' + escapeHtml(s.total) + '</div></div>' +
      '<div class="m warm"><div class="k">最慢节点</div><div class="v">' + escapeHtml(s.slowest) + '</div></div>' +
      '<div class="m hot"><div class="k">异常节点</div><div class="v">' + s.bad + '<small>个</small></div></div>' +
      '<div class="m ok"><div class="k">规则命中</div><div class="v">' + escapeHtml(s.hits) + '</div></div>');
  }
  function renderVerdict(){
    var s = SCENARIOS[cur];
    verdictEl.innerHTML = sanitize('<div class="vic">⚠️</div><div><div class="vt">一句话根因</div><div class="vb">' + s.verdict + '</div></div>');
    verdictEl.style.display = "flex";
  }
  function renderCards(){
    var s = SCENARIOS[cur], h = "";
    for (var i = 0; i < s.cards.length; i++){
      var c = s.cards[i];
      var locus = "";
      for (var j = 0; j < c.locus.length; j++) locus += '<code>' + escapeHtml(c.locus[j]) + '</code>';
      h += '<article class="card lv-' + c.lv + '">' +
             '<div class="ch">' +
               '<span class="lv">' + (c.lv === "high" ? "高危" : c.lv === "mid" ? "中危" : "提示") + '</span>' +
               '<h3>' + escapeHtml(c.title) + '</h3>' +
               '<span class="conf">' + escapeHtml(c.conf) + '</span>' +
             '</div>' +
             '<div class="crow"><em>现象</em><p>' + c.symptom + '</p></div>' +
             '<div class="crow"><em>根因</em><p>' + c.cause + '</p></div>' +
             '<div class="crow"><em>处置</em><p>' + c.fix + '</p></div>' +
             '<div class="locus">' + locus + '</div>' +
           '</article>';
    }
    cardsEl.innerHTML = sanitize(h);
  }
  function renderSql(){
    var s = SCENARIOS[cur], h = "";
    for (var i = 0; i < s.sql.length; i++){
      var b = s.sql[i];
      h += '<div class="sqlblk">' +
             '<div class="sqh"><span>' + (i + 1) + '. ' + escapeHtml(b.title) +
               '<span class="k">' + escapeHtml(b.k) + '</span></span>' +
               '<button type="button" data-copy="' + i + '">复制</button>' +
             '</div>' +
             '<pre>' + hl(b.body) + '</pre>' +
           '</div>';
    }
    sqlEl.innerHTML = sanitize(h);
  }
  function renderEmpty(){
    metricsEl.innerHTML = sanitize("");
    verdictEl.style.display = "none";
    cardsEl.innerHTML = sanitize('<div style="color:#64748b;font-size:12.5px;padding:6px 2px">点击「开始排查」，按链路顺序还原并输出诊断结论。</div>');
    diagCntEl.textContent = "待排查";
    sqlEl.innerHTML = sanitize('<div style="color:#64748b;font-size:12.5px;padding:6px 2px">排查完成后按命中的可疑点生成对应 SQL。</div>');
  }

  /* ══════════ 排查主流程 ══════════ */
  function run(){
    var s = SCENARIOS[cur];
    token++;
    var my = token;
    if (timer) { clearTimeout(timer); timer = null; }

    renderSkeleton();
    renderRules();
    renderEmpty();
    runEl.disabled = true;
    runEl.textContent = "排查中…";
    diagCntEl.textContent = "运行中";

    var i = 0;
    function step(){
      if (my !== token) return;
      if (i >= s.nodes.length){
        runEl.disabled = false;
        runEl.textContent = "开始排查";
        renderMetrics();
        setTimeout(function(){
          if (my !== token) return;
          renderVerdict();
          renderCards();
          renderSql();
          markRules();
          diagCntEl.textContent = s.cards.length + " 条 · " + s.bad + " 个异常节点";
        }, 180);
        return;
      }
      setNode(i, s.nodes[i]);
      i++;
      nodeCntEl.textContent = i + " / " + s.nodes.length;
      fillEl.style.width = Math.round(i / s.nodes.length * 100) + "%";
      timer = setTimeout(step, i === s.nodes.length ? 300 : 230);
    }
    timer = setTimeout(step, 140);
  }

  /* ══════════ 事件 ══════════ */
  pillsEl.addEventListener("click", function(e){
    var b = e.target.closest ? e.target.closest(".pill") : null;
    if (!b) return;
    cur = parseInt(b.getAttribute("data-i"), 10);
    qEl.value = SCENARIOS[cur].order;
    renderPills(); renderQuick();
    run();
  });
  quickEl.addEventListener("click", function(e){
    var b = e.target.closest ? e.target.closest("i") : null;
    if (!b) return;
    cur = parseInt(b.getAttribute("data-i"), 10);
    qEl.value = SCENARIOS[cur].order;
    renderPills(); renderQuick();
    run();
  });
  runEl.addEventListener("click", run);
  qEl.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.keyCode === 13) run(); });

  sqlEl.addEventListener("click", function(e){
    var b = e.target.closest ? e.target.closest("[data-copy]") : null;
    if (!b) return;
    var idx = parseInt(b.getAttribute("data-copy"), 10);
    copy(SCENARIOS[cur].sql[idx].body);
    b.textContent = "已复制";
    setTimeout(function(){ b.textContent = "复制"; }, 1400);
  });
  $("copyAll").addEventListener("click", function(){
    var s = SCENARIOS[cur], parts = [];
    for (var i = 0; i < s.sql.length; i++){
      parts.push("-- " + (i + 1) + ". " + s.sql[i].title + "\n" + s.sql[i].body);
    }
    copy(parts.join("\n\n"));
  });

  /* ══════════ 初始化 ══════════ */
  /* 支持 ?s=1 / ?s=2 / ?s=3 直达某个演练场景，方便分享与截图 */
  var qm = location.search.match(/[?&]s=(\d+)/);
  if (qm){
    var k = parseInt(qm[1], 10) - 1;
    if (SCENARIOS[k]) cur = k;
  }
  renderPills();
  renderQuick();
  renderSkeleton();
  renderRules();
  renderEmpty();
  qEl.value = SCENARIOS[cur].order;
  setTimeout(run, 260);
})();
