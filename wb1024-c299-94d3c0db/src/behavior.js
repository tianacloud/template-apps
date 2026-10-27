
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

  /* ---------- 勾选清单持久化 ---------- */
  var key = "kb-check-prep";
  var boxes = document.querySelectorAll("#ck input[type=checkbox]");
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch (e) {}
  boxes.forEach(function (b) {
    if (saved[b.dataset.k]) b.checked = true;
    b.addEventListener("change", function () {
      saved[b.dataset.k] = b.checked;
      try { localStorage.setItem(key, JSON.stringify(saved)); } catch (e) {}
    });
  });
})();
