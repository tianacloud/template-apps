import { createTianaFetch } from "@tianacloud/serverless";

(function () {
  /* ---------- 章节跳转（键盘 ← →） ---------- */
  var secs = ["s-overview","s-prep","s-opening","s-m1","s-m2","s-m3"];
  var cur = 0;
  var pills = document.querySelectorAll(".pills a[href^='#s-']");

  function go(i) {
    if (i < 0 || i >= secs.length) return;
    cur = i;
    document.getElementById(secs[i]).scrollIntoView({ behavior: "smooth" });
    pills.forEach(function (p, j) { p.classList.toggle("on", j === i); });
  }

  document.addEventListener("keydown", function (e) {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === "ArrowRight") go(cur + 1);
    if (e.key === "ArrowLeft") go(cur - 1);
  });

  pills.forEach(function (p, j) {
    p.addEventListener("click", function () { cur = j; });
  });

  /* ---------- 点击目录后同步高亮 ---------- */
  document.querySelectorAll("a[href^='#s-']").forEach(function (a) {
    a.addEventListener("click", function () {
      var id = a.getAttribute("href").slice(1);
      var k = secs.indexOf(id);
      if (k >= 0) { cur = k; pills.forEach(function (p, j) { p.classList.toggle("on", j === k); }); }
    });
  });

  /* 清单保存到当前应用绑定的数据库。 */
  const boxes = Array.from(document.querySelectorAll("#ck input[type=checkbox]"));
  const notice = document.createElement("p");
  notice.setAttribute("role", "status");
  document.querySelector("#ck").before(notice);
  boxes.forEach(b => b.disabled = true);
  async function start() {
    const auth = window.tiana?.auth;
    if (typeof auth?.getAccessToken !== "function") throw new Error("账号连接未就绪");
    const conn = await window.tiana.connection();
    if (conn.sql_api !== "hrana-v3") throw new Error("当前数据库协议不受支持");
    const fetchSql = createTianaFetch({origin: conn.origin, auth, requestBodyMode: "buffered"});
    async function query(sql, args = []) {
      const response = await fetchSql(`${conn.origin}/v3/pipeline`, {method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({requests:[{type:"execute",stmt:{sql,args,want_rows:true}},{type:"close"}]})});
      if (!response.ok) throw new Error("数据库响应未确认");
      const result = (await response.json()).results?.[0];
      if (result?.type !== "ok" || result.response?.type !== "execute") throw new Error("数据库操作未确认");
      return result.response.result;
    }
    async function read() {
      const result = await query("SELECT item_key, checked FROM prep_checklist");
      const values = new Map(result.rows.map(row => [row[0].value, row[1].value === "1"]));
      boxes.forEach(b => b.checked = values.get(b.dataset.k) || false);
    }
    await read();
    notice.textContent = "清单已加载";
    boxes.forEach(b => { b.disabled = false; b.addEventListener("change", async () => {
      boxes.forEach(box => box.disabled = true);
      notice.textContent = "正在保存…";
      try {
        await query("INSERT INTO prep_checklist(item_key, checked) VALUES (?, ?) ON CONFLICT(item_key) DO UPDATE SET checked=excluded.checked", [{type:"text",value:b.dataset.k},{type:"integer",value:b.checked ? "1" : "0"}]);
        notice.textContent = "已保存";
      } catch (_) {
        try { await read(); notice.textContent = "保存结果已重新读取，请检查清单。"; }
        catch (_) { notice.textContent = "保存结果无法确认，请刷新后检查清单。"; return; }
      }
      boxes.forEach(box => box.disabled = false);
    }); });
  }
  start().catch(() => { notice.textContent = "无法加载清单，请检查登录或数据库连接后刷新。"; });
})();
