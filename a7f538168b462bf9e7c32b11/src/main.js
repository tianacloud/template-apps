import {sql} from './db.js';
const style = document.createElement("style");
style.textContent = "\n  :root {\n    --primary: #2563eb;\n    --primary-hover: #1d4ed8;\n    --bg: #eef1f5;\n    --card: #ffffff;\n    --border: #dde3ea;\n    --text: #1f2937;\n    --text-2: #6b7280;\n    --danger: #dc2626;\n    --radius: 12px;\n  }\n  * { margin: 0; padding: 0; box-sizing: border-box; }\n  html { -webkit-text-size-adjust: 100%; }\n  body {\n    font-family: \"PingFang SC\", \"Microsoft YaHei\", \"Segoe UI\", sans-serif;\n    background: var(--bg);\n    color: var(--text);\n    font-size: 15px;\n    line-height: 1.6;\n  }\n\n  /* ===== 顶栏 ===== */\n  header {\n    background: var(--card);\n    border-bottom: 1px solid var(--border);\n    padding: 12px 20px;\n    display: flex;\n    flex-wrap: wrap;\n    align-items: center;\n    gap: 8px;\n    position: sticky;\n    top: 0;\n    z-index: 50;\n  }\n  .brand { display: flex; flex-direction: column; margin-right: auto; }\n  .brand h1 { font-size: 18px; font-weight: 700; letter-spacing: .5px; }\n  .brand span { font-size: 12px; color: var(--text-2); }\n  .btn {\n    border: 1px solid var(--border);\n    background: #fff;\n    color: var(--text);\n    border-radius: 8px;\n    padding: 7px 14px;\n    font-size: 13px;\n    cursor: pointer;\n    white-space: nowrap;\n    transition: all .15s;\n  }\n  .btn:hover { border-color: var(--primary); color: var(--primary); }\n  .btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; }\n  .btn.primary:hover { background: var(--primary-hover); }\n  .btn.small { padding: 4px 10px; font-size: 12px; }\n\n  /* ===== 主体两栏 ===== */\n  main {\n    display: grid;\n    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);\n    gap: 16px;\n    max-width: 1280px;\n    margin: 0 auto;\n    padding: 16px;\n    align-items: start;\n  }\n  .panel {\n    background: var(--card);\n    border: 1px solid var(--border);\n    border-radius: var(--radius);\n    padding: 18px;\n  }\n  .panel h2 {\n    font-size: 15px;\n    font-weight: 700;\n    margin-bottom: 14px;\n    padding-bottom: 10px;\n    border-bottom: 1px dashed var(--border);\n    display: flex;\n    align-items: center;\n    gap: 8px;\n  }\n  .panel h2 .tag {\n    font-size: 11px;\n    font-weight: 400;\n    color: var(--text-2);\n  }\n  .preview-panel { position: sticky; top: 76px; }\n\n  /* ===== 表单 ===== */\n  .field { margin-bottom: 14px; }\n  .field label {\n    display: block;\n    font-size: 13px;\n    font-weight: 600;\n    margin-bottom: 5px;\n    color: var(--text);\n  }\n  .inp {\n    width: 100%;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    padding: 8px 10px;\n    font-size: 14px;\n    font-family: inherit;\n    background: #fafbfc;\n    color: var(--text);\n    transition: border .15s;\n  }\n  .inp:focus { outline: none; border-color: var(--primary); background: #fff; }\n  textarea.inp { resize: vertical; min-height: 64px; }\n  .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }\n\n  /* 动态条目 */\n  .dyn-item {\n    position: relative;\n    border: 1px solid var(--border);\n    border-radius: 10px;\n    padding: 12px 34px 12px 12px;\n    margin-bottom: 10px;\n    background: #fafbfc;\n  }\n  .dyn-item .del {\n    position: absolute;\n    top: 6px;\n    right: 8px;\n    width: 22px;\n    height: 22px;\n    border: none;\n    background: transparent;\n    color: var(--text-2);\n    font-size: 16px;\n    cursor: pointer;\n    border-radius: 6px;\n    line-height: 1;\n  }\n  .dyn-item .del:hover { color: var(--danger); background: #fef2f2; }\n  .dyn-item .inp { margin-bottom: 8px; background: #fff; }\n  .dyn-item .inp:last-child { margin-bottom: 0; }\n  .add-btn {\n    width: 100%;\n    border: 1px dashed var(--border);\n    background: transparent;\n    color: var(--text-2);\n    border-radius: 8px;\n    padding: 8px;\n    font-size: 13px;\n    cursor: pointer;\n    margin-bottom: 16px;\n  }\n  .add-btn:hover { border-color: var(--primary); color: var(--primary); }\n\n  /* ===== 预览纸张 ===== */\n  .paper {\n    background: #fff;\n    border: 1px solid var(--border);\n    border-radius: 6px;\n    box-shadow: 0 2px 10px rgba(15, 23, 42, .06);\n    padding: 36px 40px;\n    min-height: 400px;\n  }\n  .paper h1 { font-size: 20px; text-align: center; margin-bottom: 18px; }\n  .paper h3 { font-size: 15px; margin: 16px 0 6px; }\n  .paper p { margin: 4px 0; font-size: 14px; }\n  .paper .meta { color: #374151; }\n  .paper .meta strong { color: #111827; }\n  .paper hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }\n  .paper ol, .paper ul { padding-left: 22px; font-size: 14px; }\n  .paper table {\n    width: 100%;\n    border-collapse: collapse;\n    font-size: 13px;\n    margin: 8px 0;\n  }\n  .paper th, .paper td {\n    border: 1px solid #d1d5db;\n    padding: 6px 8px;\n    text-align: left;\n  }\n  .paper th { background: #f3f4f6; }\n  .paper .empty-tip {\n    text-align: center;\n    color: #9ca3af;\n    font-size: 14px;\n    padding: 60px 0;\n  }\n  .paper .foot { margin-top: 20px; text-align: right; color: #9ca3af; font-size: 12px; }\n\n  /* ===== 历史抽屉 ===== */\n  .drawer-mask {\n    display: none;\n    position: fixed;\n    inset: 0;\n    background: rgba(15, 23, 42, .35);\n    z-index: 90;\n  }\n  .drawer-mask.open { display: block; }\n  .drawer {\n    position: fixed;\n    top: 0;\n    right: -340px;\n    width: 320px;\n    max-width: 88vw;\n    height: 100vh;\n    background: #fff;\n    z-index: 100;\n    transition: right .25s;\n    display: flex;\n    flex-direction: column;\n    box-shadow: -4px 0 20px rgba(15, 23, 42, .12);\n  }\n  .drawer.open { right: 0; }\n  .drawer-head {\n    padding: 14px 16px;\n    border-bottom: 1px solid var(--border);\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n  }\n  .drawer-head h3 { font-size: 15px; }\n  .drawer-body { flex: 1; overflow-y: auto; padding: 12px 16px; }\n  .history-item {\n    border: 1px solid var(--border);\n    border-radius: 10px;\n    padding: 10px 12px;\n    margin-bottom: 10px;\n  }\n  .history-item .t { font-size: 14px; font-weight: 600; margin-bottom: 2px; }\n  .history-item .d { font-size: 12px; color: var(--text-2); margin-bottom: 8px; }\n  .history-empty { text-align: center; color: var(--text-2); font-size: 13px; padding: 40px 0; }\n\n  /* ===== Toast ===== */\n  .toast {\n    position: fixed;\n    left: 50%;\n    bottom: 40px;\n    transform: translateX(-50%) translateY(20px);\n    background: #111827;\n    color: #fff;\n    font-size: 13px;\n    padding: 9px 18px;\n    border-radius: 999px;\n    opacity: 0;\n    pointer-events: none;\n    transition: all .25s;\n    z-index: 200;\n  }\n  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }\n\n  /* ===== 移动端 ===== */\n  .mobile-only { display: none; }\n  @media (max-width: 900px) {\n    main { grid-template-columns: 1fr; }\n    .preview-panel { position: static; }\n    .mobile-only { display: inline-block; }\n    .paper { padding: 24px 20px; }\n    .row2 { grid-template-columns: 1fr; }\n  }\n\n  /* ===== 打印 ===== */\n  @media print {\n    body { background: #fff; }\n    header, .form-panel, .drawer, .drawer-mask, .toast { display: none !important; }\n    main { display: block; padding: 0; }\n    .preview-panel { position: static; }\n    .panel { border: none; padding: 0; }\n    .paper { border: none; box-shadow: none; padding: 0; }\n  }\n";
document.head.appendChild(style);
document.getElementById("app").innerHTML = "\n\n<header>\n  <div class=\"brand\">\n    <h1>会议纪要速成器</h1>\n    <span>行政人的 30 秒纪要神器 · 填表即出稿</span>\n  </div>\n  <button class=\"btn\" id=\"btnDemo\">填入示例</button>\n  <button class=\"btn\" id=\"btnClear\">清空</button>\n  <button class=\"btn\" id=\"btnSave\">保存</button>\n    <button class=\"btn\" id=\"btnHistory\">历史记录</button>\n  <button class=\"btn\" id=\"btnPrint\">打印</button>\n  <button class=\"btn\" id=\"btnDownload\">下载 .md</button>\n  <button class=\"btn primary\" id=\"btnCopy\">复制全文</button>\n</header>\n\n<main>\n  <!-- 左：表单 -->\n  <section class=\"panel form-panel\">\n    <h2>会议信息 <span class=\"tag\">带 * 为必填</span></h2>\n\n    <div class=\"field\">\n      <label>会议主题 *</label>\n      <input class=\"inp\" id=\"fTitle\" placeholder=\"如：三季度行政工作总结会\">\n    </div>\n\n    <div class=\"row2\">\n      <div class=\"field\">\n        <label>开始时间</label>\n        <input class=\"inp\" id=\"fTime\" type=\"datetime-local\">\n      </div>\n      <div class=\"field\">\n        <label>地点 / 形式</label>\n        <input class=\"inp\" id=\"fPlace\" placeholder=\"如：三楼第一会议室 / 线上\">\n      </div>\n    </div>\n\n    <div class=\"row2\">\n      <div class=\"field\">\n        <label>主持人</label>\n        <input class=\"inp\" id=\"fHost\" placeholder=\"姓名\">\n      </div>\n      <div class=\"field\">\n        <label>记录人</label>\n        <input class=\"inp\" id=\"fRecorder\" placeholder=\"姓名\">\n      </div>\n    </div>\n\n    <div class=\"field\">\n      <label>参会人员</label>\n      <input class=\"inp\" id=\"fAttendees\" placeholder=\"多人用顿号或逗号分隔，如：张敏、刘洋、王强\">\n    </div>\n\n    <h2>议题讨论 <span class=\"tag\">每条议题可写多条要点</span></h2>\n    <div id=\"topicList\"></div>\n    <button class=\"add-btn\" id=\"addTopic\">＋ 添加议题</button>\n\n    <h2>会议决议</h2>\n    <div id=\"decisionList\"></div>\n    <button class=\"add-btn\" id=\"addDecision\">＋ 添加决议</button>\n\n    <h2>待办事项 <span class=\"tag\">事项 + 负责人 + 截止日期</span></h2>\n    <div id=\"todoList\"></div>\n    <button class=\"add-btn\" id=\"addTodo\">＋ 添加待办</button>\n\n    <h2>其他事项</h2>\n    <div class=\"field\">\n      <textarea class=\"inp\" id=\"fOther\" placeholder=\"补充说明、下次会议安排等，可留空\"></textarea>\n    </div>\n  </section>\n\n  <!-- 右：预览 -->\n  <section class=\"panel preview-panel\">\n    <h2>实时预览 <span class=\"tag\">右侧内容即为最终纪要</span></h2>\n    <div class=\"paper\" id=\"paper\"></div>\n    <div style=\"text-align:center; margin-top:10px;\">\n      <span style=\"font-size:12px; color:var(--text-2);\" id=\"statBar\">全文 0 字</span>\n      <button class=\"btn small mobile-only\" id=\"btnJumpForm\" style=\"margin-left:10px;\">返回填写</button>\n    </div>\n  </section>\n</main>\n\n<!-- 历史抽屉 -->\n<div class=\"drawer-mask\" id=\"drawerMask\"></div>\n<aside class=\"drawer\" id=\"drawer\">\n  <div class=\"drawer-head\">\n    <h3>历史纪要（云端保存）</h3>\n    <button class=\"btn small\" id=\"btnCloseDrawer\">关闭</button>\n  </div>\n  <div class=\"drawer-body\" id=\"historyBody\"></div>\n</aside>\n\n<div class=\"toast\" id=\"toast\"></div>\n\n";

(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var history = [];
  var historyBusy = false;
  var currentMd = "";

  /* ---------- 工具 ---------- */
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function val(id) { return $(id).value.trim(); }
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function formatDT(v) {
    if (!v) return "";
    var d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日 " +
      pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  function formatDate(v) {
    if (!v) return "";
    var d = new Date(v + "T00:00:00");
    if (isNaN(d.getTime())) return v;
    return (d.getMonth() + 1) + "月" + d.getDate() + "日";
  }

  /* ---------- 动态条目 ---------- */
  function makeItem(containerId, html) {
    var box = document.createElement("div");
    box.className = "dyn-item";
    box.innerHTML = html;
    box.querySelector(".del").addEventListener("click", function () {
      box.remove();
      render();
    });
    box.querySelectorAll(".inp").forEach(function (el) {
      el.addEventListener("input", render);
    });
    $(containerId).appendChild(box);
    return box;
  }

  function addTopic(data) {
    var box = makeItem("topicList",
      '<button class="del" title="删除">×</button>' +
      '<input class="inp t-name" placeholder="议题名称，如：办公用品采购情况">' +
      '<textarea class="inp t-points" placeholder="讨论要点，每行一条"></textarea>');
    if (data) {
      box.querySelector(".t-name").value = data.name || "";
      box.querySelector(".t-points").value = data.points || "";
    }
    return box;
  }
  function addDecision(data) {
    var box = makeItem("decisionList",
      '<button class="del" title="删除">×</button>' +
      '<textarea class="inp d-text" placeholder="决议内容，一条一行"></textarea>');
    if (data) box.querySelector(".d-text").value = data || "";
    return box;
  }
  function addTodo(data) {
    var box = makeItem("todoList",
      '<button class="del" title="删除">×</button>' +
      '<input class="inp x-item" placeholder="待办事项">' +
      '<div class="row2" style="margin:0;">' +
      '<input class="inp x-owner" placeholder="负责人">' +
      '<input class="inp x-due" type="date">' +
      '</div>');
    if (data) {
      box.querySelector(".x-item").value = data.item || "";
      box.querySelector(".x-owner").value = data.owner || "";
      box.querySelector(".x-due").value = data.due || "";
    }
    return box;
  }

  /* ---------- 收集数据 ---------- */
  function collect() {
    var topics = [];
    document.querySelectorAll("#topicList .dyn-item").forEach(function (el) {
      var name = el.querySelector(".t-name").value.trim();
      var points = el.querySelector(".t-points").value.trim();
      if (name || points) topics.push({ name: name, points: points });
    });
    var decisions = [];
    document.querySelectorAll("#decisionList .dyn-item").forEach(function (el) {
      el.querySelector(".d-text").value.split("\n").forEach(function (line) {
        var s = line.trim();
        if (s) decisions.push(s);
      });
    });
    var todos = [];
    document.querySelectorAll("#todoList .dyn-item").forEach(function (el) {
      var item = el.querySelector(".x-item").value.trim();
      var owner = el.querySelector(".x-owner").value.trim();
      var due = el.querySelector(".x-due").value;
      if (item || owner || due) todos.push({ item: item, owner: owner, due: due });
    });
    return {
      title: val("fTitle"),
      time: val("fTime"),
      place: val("fPlace"),
      host: val("fHost"),
      recorder: val("fRecorder"),
      attendees: val("fAttendees"),
      topics: topics,
      decisions: decisions,
      todos: todos,
      other: val("fOther")
    };
  }

  /* ---------- 生成 Markdown ---------- */
  function buildMarkdown(d) {
    var L = [];
    L.push("# " + (d.title || "（未命名会议）") + " 会议纪要");
    L.push("");
    if (d.time) L.push("**会议时间**：" + formatDT(d.time));
    if (d.place) L.push("**会议地点/形式**：" + d.place);
    if (d.host || d.recorder) {
      L.push("**主持人**：" + (d.host || "—") + "　**记录人**：" + (d.recorder || "—"));
    }
    if (d.attendees) L.push("**参会人员**：" + d.attendees);
    L.push("");
    L.push("---");
    L.push("");

    L.push("## 一、议题讨论");
    L.push("");
    if (d.topics.length === 0) {
      L.push("（未填写议题）");
    } else {
      d.topics.forEach(function (t, i) {
        L.push("### " + (i + 1) + ". " + (t.name || "（未命名议题）"));
        L.push("");
        if (t.points) {
          t.points.split("\n").forEach(function (line) {
            var s = line.trim();
            if (s) L.push("- " + s);
          });
        } else {
          L.push("（无讨论要点）");
        }
        L.push("");
      });
    }

    L.push("## 二、会议决议");
    L.push("");
    if (d.decisions.length === 0) {
      L.push("（无决议事项）");
    } else {
      d.decisions.forEach(function (s, i) { L.push((i + 1) + ". " + s); });
    }
    L.push("");

    L.push("## 三、待办事项");
    L.push("");
    if (d.todos.length === 0) {
      L.push("（本次会议无待办事项）");
    } else {
      L.push("| 序号 | 待办事项 | 负责人 | 截止日期 |");
      L.push("| --- | --- | --- | --- |");
      d.todos.forEach(function (t, i) {
        L.push("| " + (i + 1) + " | " + (t.item || "—") + " | " + (t.owner || "—") +
          " | " + (t.due ? formatDate(t.due) : "—") + " |");
      });
    }
    L.push("");

    L.push("## 四、其他事项");
    L.push("");
    L.push(d.other || "（无）");
    L.push("");
    L.push("---");
    L.push("");
    L.push("*本纪要由「会议纪要速成器」生成*");
    return L.join("\n");
  }

  /* ---------- 极简 Markdown 渲染（预览用） ---------- */
  function mdToHtml(md) {
    var lines = md.split("\n");
    var html = "";
    var i = 0;
    function inline(s) {
      return escapeHtml(s)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>");
    }
    while (i < lines.length) {
      var line = lines[i];
      if (/^\|/.test(line)) {
        var rows = [];
        while (i < lines.length && /^\|/.test(lines[i])) {
          var cells = lines[i].split("|").map(function (c) { return c.trim(); });
          cells = cells.filter(function (_, idx) {
            return !(idx === 0 && cells[0] === "") && !(idx === cells.length - 1 && cells[cells.length - 1] === "");
          });
          if (!/^\|?\s*:?-{2,}/.test(lines[i].replace(/\|/g, "").replace(/\s/g, "")) || rows.length === 0) {
            rows.push(cells);
          }
          i++;
        }
        if (rows.length) {
          html += "<table><thead><tr>";
          rows[0].forEach(function (c) { html += "<th>" + inline(c) + "</th>"; });
          html += "</tr></thead><tbody>";
          for (var r = 1; r < rows.length; r++) {
            html += "<tr>";
            rows[r].forEach(function (c) { html += "<td>" + inline(c) + "</td>"; });
            html += "</tr>";
          }
          html += "</tbody></table>";
        }
        continue;
      }
      if (line === "---") { html += "<hr>"; i++; continue; }
      if (/^# /.test(line)) { html += "<h1>" + inline(line.slice(2)) + "</h1>"; i++; continue; }
      if (/^### /.test(line)) { html += "<h3>" + inline(line.slice(4)) + "</h3>"; i++; continue; }
      if (/^- /.test(line)) { html += "<ul><li>" + inline(line.slice(2)) + "</li></ul>"; i++; continue; }
      if (/^\d+\. /.test(line)) { html += "<ol><li>" + inline(line.replace(/^\d+\. /, "")) + "</li></ol>"; i++; continue; }
      if (line.trim() === "") { i++; continue; }
      html += "<p>" + inline(line) + "</p>";
      i++;
    }
    return html;
  }

  /* ---------- 渲染 ---------- */
  function render() {
    var d = collect();
    currentMd = buildMarkdown(d);
    var paper = $("paper");
    if (!d.title && !d.topics.length && !d.decisions.length && !d.todos.length) {
      paper.innerHTML = '<div class="empty-tip">在左侧填写内容<br>这里会实时生成规范会议纪要</div>';
    } else {
      paper.innerHTML = mdToHtml(currentMd) + '<div class="foot">本纪要由「会议纪要速成器」生成</div>';
    }
    $("statBar").textContent = "全文 " + currentMd.replace(/\s/g, "").length + " 字";
  }

  /* ---------- 顶栏动作 ---------- */
  function copyText(text, okMsg) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); toast(okMsg); }
      catch (e) { toast("复制失败，请手动选择文本复制"); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg); }, fallback);
    } else {
      fallback();
    }
  }

  $("btnCopy").addEventListener("click", function () {
    copyText(currentMd, "已复制，可直接粘贴到微信 / Word");
  });

  $("btnDownload").addEventListener("click", function () {
    var d = collect();
    var name = "会议纪要-" + (d.title || "未命名") + "-" + new Date().toISOString().slice(0, 10) + ".md";
    var blob = new Blob(["﻿" + currentMd], { type: "text/markdown;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
    toast("已下载 " + name);
  });

  $("btnPrint").addEventListener("click", function () { window.print(); });

  $("btnClear").addEventListener("click", function () {
    if (!confirm("确定清空当前所有内容？")) return;
    ["fTitle", "fTime", "fPlace", "fHost", "fRecorder", "fAttendees", "fOther"].forEach(function (id) { $(id).value = ""; });
    $("topicList").innerHTML = "";
    $("decisionList").innerHTML = "";
    $("todoList").innerHTML = "";
    addTopic(); addDecision(); addTodo();
    render();
    toast("已清空");
  });

  $("btnDemo").addEventListener("click", function () {
    $("fTitle").value = "三季度行政工作总结会";
    var now = new Date();
    $("fTime").value = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) + "T14:00";
    $("fPlace").value = "公司三楼第一会议室";
    $("fHost").value = "张敏";
    $("fRecorder").value = "刘洋";
    $("fAttendees").value = "张敏、刘洋、王强、李婷、赵磊";
    $("topicList").innerHTML = "";
    addTopic({ name: "三季度办公用品采购情况", points: "本季度共采购办公用品 47 批次，总金额 3.2 万元\n硒鼓、打印纸用量同比上升 12%，需关注耗材成本" });
    addTopic({ name: "新员工工位安排方案", points: "11 月预计入职 8 名新员工\n需整合三楼空闲工位，并增配 2 套办公桌椅" });
    $("decisionList").innerHTML = "";
    addDecision("四季度起办公用品改为月度集中采购，每月 5 日前完成需求汇总");
    addDecision("11 月 10 日前完成新员工工位布置与设备调试");
    $("todoList").innerHTML = "";
    var due1 = new Date(now.getTime() + 14 * 86400000);
    addTodo({ item: "统计四季度办公用品需求清单", owner: "李婷", due: due1.getFullYear() + "-" + pad(due1.getMonth() + 1) + "-" + pad(due1.getDate()) });
    addTodo({ item: "完成新员工工位安排与设备调试", owner: "王强", due: due1.getFullYear() + "-" + pad(due1.getMonth() + 1) + "-" + pad(due1.getDate()) });
    $("fOther").value = "下次例会定于 10 月底召开，请各部门提前准备季度汇报材料。";
    render();
    toast("已填入示例，可直接改成你的内容");
  });

  /* ---------- 历史记录 ---------- */
  function getHistory() { return history; }
  async function refreshHistory() {
    var rows = await sql('SELECT id, title, saved_at, data FROM meeting_history ORDER BY saved_at DESC LIMIT 20');
    history = rows.map(function (row) { return {id: row.id, title: row.title, time: row.saved_at, data: JSON.parse(row.data)}; });
  }
  async function saveHistory() {
    var d = collect();
    if (!d.title && !d.topics.length && !d.todos.length && !d.decisions.length) { toast('内容为空，无需保存'); return; }
    if (historyBusy) return;
    historyBusy = true;
    var id = crypto.randomUUID(), time = new Date().toISOString();
    try { await sql('INSERT INTO meeting_history (id, title, saved_at, data) VALUES (?, ?, ?, ?)', [id, d.title || '（未命名会议）', time, JSON.stringify(d)]); await refreshHistory(); renderHistory(); toast('已保存到历史记录'); }
    catch (e) { toast('保存结果未确认，请打开历史记录核对'); }
    finally { historyBusy = false; }
  }
  function loadHistory(item) {
    $("fTitle").value = item.data.title || "";
    $("fTime").value = item.data.time || "";
    $("fPlace").value = item.data.place || "";
    $("fHost").value = item.data.host || "";
    $("fRecorder").value = item.data.recorder || "";
    $("fAttendees").value = item.data.attendees || "";
    $("fOther").value = item.data.other || "";
    $("topicList").innerHTML = "";
    (item.data.topics || []).forEach(function (t) { addTopic(t); });
    $("decisionList").innerHTML = "";
    (item.data.decisions || []).forEach(function (s) { addDecision(s); });
    $("todoList").innerHTML = "";
    (item.data.todos || []).forEach(function (t) { addTodo(t); });
    render();
    closeDrawer();
    toast("已载入「" + item.title + "」");
  }
  function renderHistory() {
    var list = getHistory();
    var body = $("historyBody");
    if (!list.length) {
      body.innerHTML = '<div class="history-empty">暂无历史记录<br>填好纪要后点顶栏「保存」即可留存</div>';
      return;
    }
    body.innerHTML = "";
    list.forEach(function (item) {
      var div = document.createElement("div");
      div.className = "history-item";
      div.innerHTML =
        '<div class="t">' + escapeHtml(item.title) + "</div>" +
        '<div class="d">保存于 ' + escapeHtml(item.time) + "</div>" +
        '<button class="btn small act-load">载入</button> ' +
        '<button class="btn small act-del">删除</button>';
      div.querySelector(".act-load").addEventListener("click", function () { loadHistory(item); });
      div.querySelector(".act-del").addEventListener("click", async function () {
        if (!confirm("删除这条历史记录？") || historyBusy) return;
        historyBusy = true;
        try { await sql('DELETE FROM meeting_history WHERE id = ?', [item.id]); await refreshHistory(); renderHistory(); toast('已删除'); }
        catch (e) { toast('删除结果未确认，请重新打开历史记录核对'); }
        finally { historyBusy = false; }
      });
      body.appendChild(div);
    });
  }
  async function openDrawer() { $("drawer").classList.add("open"); $("drawerMask").classList.add("open"); $("historyBody").textContent = "正在读取历史记录…"; try { await refreshHistory(); renderHistory(); } catch (e) { $("historyBody").textContent = "读取失败，请确认登录和数据库连接后重试。"; } }
  function closeDrawer() { $("drawer").classList.remove("open"); $("drawerMask").classList.remove("open"); }
  $("btnSave").addEventListener("click", saveHistory);
  $("btnHistory").addEventListener("click", openDrawer);
  $("btnCloseDrawer").addEventListener("click", closeDrawer);
  $("drawerMask").addEventListener("click", closeDrawer);

  /* ---------- 输入监听 ---------- */
  ["fTitle", "fTime", "fPlace", "fHost", "fRecorder", "fAttendees", "fOther"].forEach(function (id) {
    $(id).addEventListener("input", render);
  });
  $("addTopic").addEventListener("click", function () { addTopic(); render(); });
  $("addDecision").addEventListener("click", function () { addDecision(); render(); });
  $("addTodo").addEventListener("click", function () { addTodo(); render(); });
  $("btnJumpForm").addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- 初始化 ---------- */
  var now0 = new Date();
  $("fTime").value = now0.getFullYear() + "-" + pad(now0.getMonth() + 1) + "-" + pad(now0.getDate()) + "T09:00";
  addTopic(); addDecision(); addTodo();
  render();
})();
