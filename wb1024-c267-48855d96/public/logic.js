
/* ================= 狀態 ================= */
const LS_KEY = "luckyDraw_v1";
let S = {
  pool: [],         // 剩餘獎池
  winners: [],      // 已抽出 [{name}]
  cfg: { perDraw:3, total:12 }   // 每次抽幾人 / 總共抽幾位
};
function save(){ localStorage.setItem(LS_KEY, JSON.stringify(S)); }
function load(){
  try{
    const d = JSON.parse(localStorage.getItem(LS_KEY));
    if(!d || !Array.isArray(d.pool)) return;
    const cfg = d.cfg || {};
    // 兼容舊版備份（舊版有 ultPool / ultWinners）：只需要映射總人數，其餘舊欄位丟棄
    S = {
      pool: d.pool,
      winners: Array.isArray(d.winners) ? d.winners : [],
      cfg: { perDraw: cfg.perDraw || 3, total: cfg.total || cfg.ultPool || 12 }
    };
    if(S.winners.length > S.cfg.total) S.winners = S.winners.slice(0, S.cfg.total);
  }catch(e){}
}

/* ================= DOM ================= */
const $ = id => document.getElementById(id);
const pageDraw = $("pageDraw"), pageAdmin = $("pageAdmin"), btnMain = $("btnMain");
const ROLL_MS = 3000;                 // 一按抽獎，3 秒後自動開獎
let rolling = false, rollTimer = null, autoStopTimer = null;
let cdTimer = null, rollStartAt = 0;  // 按鈕倒數用
let showingAll = false;               // 抽完之後有冇叫出「全部中獎者」

/* 名單文字 → 去重去空行嘅陣列 */
const parseNames = t => [...new Set(t.split(/\r?\n/).map(s=>s.trim()).filter(Boolean))];
const esc = s => s.replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function pickN(arr,n){
  const a=[...arr], out=[];
  while(out.length<n && a.length) out.push(a.splice(Math.floor(Math.random()*a.length),1)[0]);
  return out;
}

/* ================= 頁面切換 ================= */
function showDraw(){
  pageAdmin.classList.add("hidden");
  pageDraw.classList.remove("hidden");
  $("modeTag").textContent = "🎉 抽獎模式";
  refreshDraw();
}
function showAdmin(){
  stopAll();
  pageDraw.classList.add("hidden");
  pageAdmin.classList.remove("hidden");
  $("modeTag").textContent = "⚙️ 管理模式";
  $("txtNames").value = S.pool.concat(S.winners.map(w=>w.name)).join("\n");
  $("setPerDraw").value = S.cfg.perDraw;
  $("setTotal").value = S.cfg.total;
  updateAdminStat(S.pool.length + S.winners.length);
}
$("btnAdmin").onclick = () => pageDraw.classList.contains("hidden") ? showDraw() : showAdmin();
$("btnFull").onclick = () => {
  if(!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};

/* ================= 投屏優化 =================
   1. 全螢幕時收起頂欄（鼠標移去頂部 12% 再出現）
   2. 鼠標閒置 3 秒自動隱藏
   3. Wake Lock 阻止休眠（非 HTTPS 時靜靜跳過） */
let wakeLock = null, idleTimer = null;
function askWakeLock(){
  if(!("wakeLock" in navigator) || wakeLock) return;
  navigator.wakeLock.request("screen").then(l => { wakeLock = l; }).catch(() => {});
}
function pokeCursor(){
  document.body.classList.remove("idle");
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => document.body.classList.add("idle"), 3000);
}
document.addEventListener("mousemove", e => {
  pokeCursor();
  const showBar = !document.fullscreenElement || e.clientY < window.innerHeight * 0.12;
  document.body.classList.toggle("awake", showBar);
});
document.addEventListener("fullscreenchange", () => {
  const on = !!document.fullscreenElement;
  document.body.classList.toggle("full", on);
  document.body.classList.toggle("awake", !on);
  if(on){ askWakeLock(); pokeCursor(); }
  else if(wakeLock){ wakeLock.release().catch(()=>{}); wakeLock = null; }
});
document.addEventListener("visibilitychange", () => {
  if(document.visibilityState === "visible" && document.fullscreenElement) askWakeLock();
});

/* ================= 管理邏輯 ================= */
function updateAdminStat(n){
  if(!n){ $("adminStat").textContent = "尚未載入名單"; return; }
  const perDraw = parseInt($("setPerDraw").value)||3;
  const total = parseInt($("setTotal").value)||12;
  const rounds = Math.ceil(total / perDraw);
  $("adminStat").innerHTML = `已載入 <b>${n}</b> 個名字 ｜ 每次抽 <b>${perDraw}</b> 人 ｜ 總共抽 <b>${total}</b> 位（約 <b>${rounds}</b> 輪）`
    + `<br><span style="color:#e8a87c">按「保存」會重置獎池同清空所有已抽記錄</span>`;
}
$("btnSave").onclick = () => {
  const names = parseNames($("txtNames").value);
  if(names.length === 0){ alert("請先輸入名單！"); return; }
  const perDraw = parseInt($("setPerDraw").value)||3;
  const total = parseInt($("setTotal").value)||12;
  if(perDraw < 1){ alert("每次抽獎人數至少 1 人！"); return; }
  if(total < 1){ alert("中獎人數至少 1 位！"); return; }
  if(perDraw > total){ alert(`每次抽 ${perDraw} 人多過總中獎人數 ${total} 位，請調整。`); return; }
  if(total > names.length){ alert(`名單只有 ${names.length} 人，唔夠抽出 ${total} 位。`); return; }
  const rounds = Math.ceil(total / perDraw);
  const msg = `名單 ${names.length} 人\n每次抽 ${perDraw} 人\n總共抽出 ${total} 位（約 ${rounds} 輪）\n\n（會重置獎池、清空之前所有抽獎記錄）\n確定開始？`;
  if(!confirm(msg)) return;
  S = { pool:[...names], winners:[], cfg:{perDraw,total} };
  save(); resetView(); showDraw();
};
$("btnResetAll").onclick = () => {
  if(!confirm("確定清空所有名單同中獎記錄？")){
    return;
  }
  S = { pool:[], winners:[], cfg:S.cfg };
  save(); $("txtNames").value=""; resetView(); updateAdminStat(0); refreshDraw();
};
$("btnClearWinners").onclick = () => {
  if(!S.winners.length){ alert("而家未有中獎記錄。"); return; }
  if(!confirm(`清空 ${S.winners.length} 位中獎記錄，並把佢哋放返獎池？（名單同設定不變）`)) return;
  const all = S.pool.concat(S.winners.map(w=>w.name));
  S = { pool:all, winners:[], cfg:S.cfg };
  save(); resetView(); updateAdminStat(all.length);
  alert("✅ 已清空，可以重新抽。");
};

/* ================= 匯出備份 / 匯入還原 ================= */
$("btnExport").onclick = () => {
  const typed = parseNames($("txtNames").value).length;
  const stored = S.pool.length + S.winners.length;
  if(typed && typed !== stored && !confirm(
    `⚠️ 輸入框有 ${typed} 個名，但已保存嘅係 ${stored} 個。\n\n` +
    `備份只會包含「已保存」嘅資料（連抽獎進度）。\n` +
    `想連輸入框一齊備份，請先按「保存」。\n\n仍然要匯出已保存嘅備份嗎？`)) return;
  const d = new Date(), p = n => String(n).padStart(2,"0");
  const stamp = `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
  const url = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], {type:"application/json"}));
  const a = document.createElement("a");
  a.href = url; a.download = `luckyDraw_備份_${stamp}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
};
$("btnImport").onclick = () => $("fileImport").click();
$("fileImport").onchange = async e => {
  const f = e.target.files[0];
  if(!f) return;
  try{
    const d = JSON.parse(await f.text());
    if(!d || !Array.isArray(d.pool) || !Array.isArray(d.winners)) throw new Error("shape");
    const cfg = d.cfg || {};
    const perDraw = cfg.perDraw || 3, total = cfg.total || cfg.ultPool || 12;
    if(!confirm(
      `讀到備份檔：\n名單共 ${d.pool.length + d.winners.length} 人 ｜ 已抽出 ${d.winners.length}/${total} 位\n\n` +
      `會覆蓋目前所有記錄，確定還原？`)) return;
    S = { pool:d.pool, winners:d.winners, cfg:{perDraw,total} };
    if(S.winners.length > total) S.winners = S.winners.slice(0,total);
    save(); resetView(); showAdmin();
    alert("✅ 還原完成");
  }catch(err){
    alert("❌ 檔案格式唔啱，請揀由本程式匯出嘅 .json 備份檔");
  }finally{
    e.target.value = "";   // 同一個檔揀第二次都要觸發
  }
};
["setPerDraw","setTotal"].forEach(id => $(id).addEventListener("input", () => {
  updateAdminStat(parseNames($("txtNames").value).length);
}));
$("txtNames").addEventListener("input", () => {
  updateAdminStat(parseNames($("txtNames").value).length);
});

/* ================= 畫面更新 ================= */
/* 中間細標籤：有文字先顯示，冇就收埋（唔佔高度） */
function setLabel(t){
  const el = $("roundLabel");
  el.textContent = t;
  el.classList.toggle("hidden", !t);
}

/* renderRound：本輪抽中（金框 + 中獎效果），停留喺畫面直到下次攪珠 */
function renderRound(names){
  $("roundCards").innerHTML = names.map((n,i)=>
    `<div class="r-card" style="animation-delay:${(i*0.22).toFixed(2)}s">${esc(n)}</div>`
  ).join("");
  setLabel("");
  fitRound(names.length);
}

/* renderList：下方中獎名單（號碼 + 名字），newNames 會閃金 */
function renderList(newNames){
  $("winList").innerHTML = S.winners.map((w,i)=>{
    const k = newNames ? newNames.indexOf(w.name) : -1;
    const cls = k >= 0 ? " new" : "";
    const delay = k >= 0 ? ` style="animation-delay:${(k*0.18).toFixed(2)}s"` : "";
    return `<span class="chip${cls}"${delay}><b>${i+1}</b>${esc(w.name)}</span>`;
  }).join("");
  $("listLabel").classList.toggle("hidden", !S.winners.length);
  $("winList").classList.toggle("hidden", !S.winners.length);
}

/* renderGrid：全部中獎者格（抽完先顯示） */
function renderGrid(){
  $("winGrid").innerHTML = S.winners.map(w=>`<div class="cell">${esc(w.name)}</div>`).join("");
  fitGrid();
}

/* resetView：換名單／清空／還原之後，中間同下方名單一齊重設 */
function resetView(){
  showingAll = false;
  $("roundCards").innerHTML = "";
  setLabel("");
  $("roundBox").classList.remove("rolling");
  $("rollName").textContent = "";
  renderList();
  renderGrid();
}

/* 舞台置中：中間嘅「攪珠大字／中獎卡／全部中獎者」要對準畫面正中。
   但舞台本身唔係正中（上面有標題位、下面有進度同名單），所以要計一個向下位移。
   --fitH = 以畫面正中為中心、上下都放得落嘅最大高度；
   fitRound / fitRollName 用佢限制字級，字放到最大都唔會壓住下面嘅名單。 */
function measureStage(){
  const st = $("stage"), vh = window.innerHeight;
  const top = st.getBoundingClientRect().top;
  const bottomTop = document.querySelector("#pageDraw .bottom").getBoundingClientRect().top;
  const target = vh / 2, gap = vh * 0.015;
  const up = Math.max(90, target - top);
  const down = Math.max(90, bottomTop - gap - target);
  const half = Math.min(up, down);
  st.style.setProperty("--shiftY", Math.round(target - (top + st.clientHeight / 2)) + "px");
  st.style.setProperty("--fitH", Math.round(half * 2) + "px");
}
function fitH(){
  const v = parseFloat(getComputedStyle($("stage")).getPropertyValue("--fitH"));
  return v > 0 ? v : $("stage").clientHeight;
}

/* 中獎格字級：按「最長嘅名」同實際格寬計，保證一行放得落、唔會爆格 */
function fitGrid(){
  const cells = [...$("winGrid").children];
  if(!cells.length) return;
  const len = Math.max(3, ...cells.map(c => [...c.textContent].length));
  const cw = cells[0].clientWidth - 10;
  const fs = Math.max(13, Math.min(window.innerHeight * 0.052, 56, cw * 0.94 / len));
  $("winGrid").style.setProperty("--gfs", Math.round(fs) + "px");
}

/* 本輪中獎卡：每欄食滿（1fr），字級同時受「闊度」同「高度」限制，
   所以名字會放大到同邊框一樣大，又唔會爆出畫面。
   人數決定欄數：1~3 人一欄（直落）、4~6 人兩欄、7~9 人三欄、10 人以上四欄。 */
function fitRound(n){
  const cards = [...$("roundCards").children];
  if(!cards.length) return;
  const len = Math.max(2, ...cards.map(c => [...c.textContent].length));
  const cols = Math.min(4, Math.max(1, Math.ceil(cards.length / 3)));
  const rows = Math.ceil(cards.length / cols);
  const box = $("roundCards");

  const cs = getComputedStyle(cards[0]);
  const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
             + parseFloat(cs.borderLeftWidth) * 2;
  const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
             + parseFloat(cs.borderTopWidth) * 2;
  const g = getComputedStyle(box);
  const gapC = parseFloat(g.columnGap) || 0, gapR = parseFloat(g.rowGap) || 0;
  const boxW = box.clientWidth || window.innerWidth * 0.6;
  box.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  // 扣走 label 高度同 round-box 嘅 gap，先唔會頂出海報頂部
  const labelH = $("roundLabel").offsetHeight || 0;
  const gapBox = parseFloat(getComputedStyle($("roundBox")).rowGap) || 0;
  const boxH = Math.max(160, fitH() - labelH - gapBox - 16);

  const availW = (boxW - gapC * (cols - 1)) / cols - padX - 4;
  const availH = boxH / rows - gapR - padY - 4;
  const fs = Math.max(12, Math.min(availW / len, availH / 1.15));
  box.style.setProperty("--rfs", Math.round(fs) + "px");
}

/* 攪珠名字：框填滿整欄，字級按「名單最長嘅名」定，令字同框一樣闊 */
function fitRollName(){
  const all = S.pool.concat(S.winners.map(w => w.name));
  if(!all.length) return;
  const len = Math.max(2, ...all.map(n => [...n].length));
  const el = $("rollName"), cs = getComputedStyle(el);
  const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
             + parseFloat(cs.borderLeftWidth) * 2;
  const col = $("stage").clientWidth || window.innerWidth * 0.5;
  const labelH = $("roundLabel").offsetHeight || 0;
  const gapBox = parseFloat(getComputedStyle($("roundBox")).rowGap) || 0;
  const boxH = Math.max(120, fitH() - labelH - gapBox - 16);
  const fs = Math.min((col - padX - 6) / len, boxH / 1.2);
  document.documentElement.style.setProperty("--namefs", Math.round(fs) + "px");
}
function refit(){ measureStage(); fitRollName(); fitRound($("roundCards").children.length); fitGrid(); }
window.addEventListener("resize", refit);

/* refreshDraw：更新數字、按鈕、名單；唔重畫本輪卡（避免動畫重播） */
function refreshDraw(){
  const total = S.cfg.total, done = S.winners.length;
  const finished = done >= total;
  const empty = !S.pool.length && !done;
  if(showingAll && !finished) showingAll = false;
  const allOn = finished && showingAll;

  pageDraw.classList.toggle("is-empty", empty);
  pageDraw.classList.remove("rolling");
  $("roundBox").classList.remove("rolling");
  $("roundBox").classList.toggle("hidden", allOn);
  $("allBox").classList.toggle("hidden", !allOn);
  $("poolInfo").classList.toggle("hidden", empty);
  $("kbdHint").classList.toggle("hidden", !!done);   // 抽過一次就唔使再教

  if($("winList").children.length !== done) renderList();
  if($("winGrid").children.length !== done) renderGrid();
  // 顯示全部中獎者時，下方名單收埋（中間已經一次過顯示，唔使重複）
  $("listLabel").classList.toggle("hidden", !done || allOn);
  $("winList").classList.toggle("hidden", !done || allOn);
  $("allTitle").textContent = `🎉 全部中獎者（${done} 位）`;

  if(!$("roundCards").children.length){
    setLabel(empty ? ""
      : finished ? "按下方按鈕顯示全部中獎者" : "按「抽 獎」開始");
  }
  $("poolCount").textContent = S.pool.length;
  $("winCount").textContent = done;
  $("winTarget").textContent = total;

  btnMain.classList.remove("done");
  btnMain.textContent = empty ? "請先輸入名單"
                      : allOn ? "收 起 名 單"
                      : finished ? "顯示全部中獎者"
                      : S.pool.length ? "抽 獎" : "獎池已空";
  // 抽完之後按鈕仍然要按得（睇全部中獎者），所以只有真正做唔到嘢先停用
  btnMain.disabled = empty || rolling || (!finished && !S.pool.length);
  refit();
}

/* ================= 抽獎 ================= */
/* 倒數：按鈕顯示「停 止 · 3」逐秒遞減，令 3 秒自動開獎睇得見 */
function startCd(){
  rollStartAt = Date.now();
  clearInterval(cdTimer);
  const paint = () => {
    const left = Math.max(0, Math.ceil((rollStartAt + ROLL_MS - Date.now()) / 1000));
    btnMain.textContent = "停 止 · " + left;
  };
  paint();
  cdTimer = setInterval(paint, 120);
}
function stopCd(){ clearInterval(cdTimer); cdTimer = null; }

function startRoll(){
  if(rolling || btnMain.disabled) return;
  if(!S.pool.length) return;
  rolling = true;
  showingAll = false;
  pageDraw.classList.add("rolling");
  $("roundBox").classList.remove("hidden");
  $("allBox").classList.add("hidden");
  $("roundBox").classList.add("rolling");
  $("roundCards").innerHTML = "";        // 上一輪收去下方名單，呢一格用嚟攪珠
  setLabel("攪珠中…");
  $("rollName").textContent = "";
  btnMain.textContent = "停 止 · 3";
  startCd();
  rollTimer = setInterval(() => {
    $("rollName").textContent = S.pool[Math.floor(Math.random()*S.pool.length)];
  }, 60);
  clearTimeout(autoStopTimer);
  autoStopTimer = setTimeout(stopRoll, ROLL_MS);   // 3 秒自動開獎
}

function stopRoll(){
  if(!rolling) return;
  rolling = false;
  stopCd();
  clearInterval(rollTimer); rollTimer = null;
  clearTimeout(autoStopTimer); autoStopTimer = null;

  // 最後一輪可能唔夠數：抽到設定人數就停
  const n = Math.min(S.cfg.perDraw, S.cfg.total - S.winners.length, S.pool.length);
  if(n <= 0){ refreshDraw(); return; }
  const picked = pickN(S.pool, n);
  S.pool = S.pool.filter(x => !picked.includes(x));
  picked.forEach(w => S.winners.push({ name:w }));
  save();

  pageDraw.classList.remove("rolling");
  $("roundBox").classList.remove("rolling");
  $("rollName").textContent = "";
  renderList(picked);           // 先記入下方名單（會影響舞台高度）
  measureStage();               // 名單多咗、下面變高 → 重新算置中同可用高度
  renderRound(picked);          // 金框 + 中獎效果，停留喺畫面
  fitGrid();

  const finished = S.winners.length >= S.cfg.total;
  $("poolCount").textContent = S.pool.length;
  $("winCount").textContent = S.winners.length;
  btnMain.disabled = true;      // 等動畫完先恢復
  btnMain.textContent = finished ? "顯示全部中獎者" : "抽 獎";
  confetti(finished ? 90 : 16);

  setTimeout(refreshDraw, (picked.length-1)*220 + 800);
}

/* 切去管理頁時煞停一切 */
function stopAll(){
  if(rolling){ rolling = false; clearInterval(rollTimer); rollTimer = null; }
  stopCd();
  clearTimeout(autoStopTimer); autoStopTimer = null;
}

/* 主按鈕 */
btnMain.onclick = () => {
  // 連點保護：開始後 250ms 內再點唔當「提早停」，避免手震一按即開獎
  if(rolling && Date.now() - rollStartAt < 250) return;
  if(rolling) return stopRoll();
  // 抽完之後：同一個按鈕切換「全部中獎者」顯示
  if(S.winners.length >= S.cfg.total){
    showingAll = !showingAll;
    refreshDraw();
    if(showingAll) confetti(60);
    return;
  }
  startRoll();
};
document.addEventListener("keydown", e => {
  if(e.code === "Space" && !pageDraw.classList.contains("hidden")){
    e.preventDefault();
    if(!btnMain.disabled) btnMain.click();
  }
});

/* 彩帶 */
function confetti(n){
  const emo = ["🎉","🎊","✨","🌟","💛","🧡"];
  for(let i=0;i<n;i++){
    const c = document.createElement("div");
    c.className = "confetti";
    c.textContent = emo[Math.floor(Math.random()*emo.length)];
    c.style.left = Math.random()*100+"vw";
    c.style.animationDuration = (2+Math.random()*2.5)+"s";
    c.style.animationDelay = Math.random()*0.8+"s";
    document.body.appendChild(c);
    setTimeout(()=>c.remove(), 5500);
  }
}

/* ================= 啟動 ================= */
load();
resetView();
showDraw();
