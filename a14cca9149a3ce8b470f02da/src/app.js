import { readScore, awardWin } from './score.js';
document.title = "算法 Disco";
document.head.insertAdjacentHTML("beforeend", "<style>\n  /* ========== 主题变量：深色舞台 + 霓虹青绿 ========== */\n  :root{\n    --bg:#0b0d12;\n    --panel:#12161f;\n    --panel2:#171d2a;\n    --line:#242c3d;\n    --neon:#2ee6a8;\n    --neeline:#1b6f56;\n    --text:#e9eef6;\n    --muted:#8b95a7;\n    --gold:#ffd166;\n  }\n  *{box-sizing:border-box;margin:0;padding:0}\n  html,body{height:100%}\n  body{\n    background:radial-gradient(1100px 520px at 50% -120px, #151d2c 0%, var(--bg) 58%) fixed, var(--bg);\n    color:var(--text);\n    font-family:\"PingFang SC\",\"Microsoft YaHei\",\"Segoe UI\",system-ui,-apple-system,sans-serif;\n    min-height:100vh;\n    padding:18px 16px 40px;\n  }\n  .wrap{max-width:1180px;margin:0 auto}\n\n  /* ========== 顶部标题区 ========== */\n  header{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:14px}\n  h1{\n    font-size:clamp(26px,4.5vw,42px);letter-spacing:2px;font-weight:800;\n    background:linear-gradient(92deg,#eafff6 0%,var(--neon) 60%,#57f5d0 100%);\n    -webkit-background-clip:text;background-clip:text;color:transparent;\n    text-shadow:0 0 34px rgba(46,230,168,.18);\n  }\n  .tagline{color:var(--muted);font-size:13px;margin-top:4px}\n  .wallet{\n    display:flex;gap:10px;align-items:center;background:var(--panel);border:1px solid var(--line);\n    border-radius:12px;padding:8px 14px;font-size:13px;\n  }\n  .wallet b{color:var(--neon);font-size:16px}\n  .wallet .title-badge{color:var(--gold)}\n\n  /* ========== 押注区 ========== */\n  .betbar{\n    background:var(--panel);border:1px solid var(--line);border-radius:14px;\n    padding:12px 14px;margin-bottom:12px;\n  }\n  .betbar .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n  .betbar .label{font-size:13px;color:var(--muted);margin-right:2px}\n  .chip{\n    border:1px solid var(--line);background:var(--panel2);color:var(--text);\n    border-radius:999px;padding:6px 12px;font-size:13px;cursor:pointer;\n    display:inline-flex;align-items:center;gap:7px;transition:all .15s;user-select:none;\n  }\n  .chip .dot{width:9px;height:9px;border-radius:50%;background:currentColor;flex:none}\n  .chip:hover{border-color:var(--neon)}\n  .chip.sel{border-color:var(--neon);box-shadow:0 0 0 1px var(--neon),0 0 14px rgba(46,230,168,.25);color:var(--neon)}\n  .chip.disabled{opacity:.45;pointer-events:none}\n\n  /* ========== 控制区 ========== */\n  .controls{\n    background:var(--panel);border:1px solid var(--line);border-radius:14px;\n    padding:10px 14px;margin-bottom:12px;display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;\n  }\n  .ctl-group{display:flex;flex-wrap:wrap;gap:6px;align-items:center}\n  .ctl-group .name{font-size:12px;color:var(--muted);margin-right:2px}\n  .seg{display:flex;background:var(--panel2);border:1px solid var(--line);border-radius:9px;overflow:hidden}\n  .seg button{\n    border:0;background:transparent;color:var(--muted);font-size:12px;padding:5px 10px;cursor:pointer;\n  }\n  .seg button.on{background:var(--neon);color:#05241b;font-weight:700}\n  .btn{\n    border:1px solid var(--line);background:var(--panel2);color:var(--text);\n    border-radius:9px;padding:6px 12px;font-size:13px;cursor:pointer;transition:all .15s;\n  }\n  .btn:hover{border-color:var(--neon);color:var(--neon)}\n  .btn.primary{background:var(--neon);border-color:var(--neon);color:#05241b;font-weight:700}\n  .btn.primary:hover{filter:brightness(1.1);color:#05241b}\n  .btn:disabled{opacity:.4;pointer-events:none}\n  .btn.big{padding:9px 22px;font-size:15px;border-radius:11px}\n\n  /* ========== 主舞台 ========== */\n  .stage-grid{display:grid;grid-template-columns:1fr 250px;gap:12px;margin-bottom:12px}\n  .stage-box{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden;position:relative}\n  canvas{display:block;width:100%;height:clamp(430px,72vh,760px)}\n  .stage-tip{\n    position:absolute;left:12px;top:10px;font-size:11px;color:var(--muted);\n    background:rgba(11,13,18,.6);padding:3px 8px;border-radius:6px;pointer-events:none;\n  }\n  .side{display:flex;flex-direction:column;gap:12px;min-width:0}\n  .rank-box,.result-box{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:12px}\n  .rank-box h3,.result-box h3{font-size:13px;color:var(--muted);font-weight:600;margin-bottom:8px;letter-spacing:1px}\n  .rank-row{display:flex;align-items:center;gap:8px;font-size:12.5px;padding:5px 6px;border-radius:8px}\n  .rank-row + .rank-row{margin-top:2px}\n  .rank-row.lead{background:rgba(46,230,168,.08)}\n  .rank-row .no{width:20px;text-align:center;color:var(--muted);font-weight:700;flex:none}\n  .rank-row.lead .no{color:var(--neon)}\n  .rank-row .nm{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n  .rank-row .st{color:var(--muted);font-variant-numeric:tabular-nums;flex:none}\n  .rank-row .st.done{color:var(--neon);font-weight:700}\n  .pbar{height:3px;border-radius:2px;background:var(--panel2);margin-top:4px;overflow:hidden}\n  .pbar i{display:block;height:100%;border-radius:2px}\n\n  /* ========== 结算面板 ========== */\n  .winner-banner{\n    background:linear-gradient(92deg,rgba(46,230,168,.14),rgba(46,230,168,.03));\n    border:1px solid var(--neeline);border-radius:12px;padding:10px 14px;margin-bottom:10px;\n    font-size:14px;line-height:1.6;\n  }\n  .winner-banner .big{font-size:17px;font-weight:800;color:var(--neon)}\n  .bet-settle{margin-top:6px;font-size:13px}\n  .bet-settle.win{color:var(--gold)}\n  .bet-settle.lose{color:var(--muted)}\n  table{width:100%;border-collapse:collapse;font-size:12.5px}\n  th,td{padding:6px 8px;text-align:right;border-bottom:1px solid var(--line);white-space:nowrap}\n  th:first-child,td:first-child{text-align:left}\n  th:nth-child(2),td:nth-child(2){text-align:left}\n  th{color:var(--muted);font-weight:600}\n  td .algo{display:inline-flex;align-items:center;gap:6px}\n  td .algo i{width:9px;height:9px;border-radius:50%;display:inline-block}\n  .table-scroll{overflow-x:auto}\n\n  /* ========== 人格卡 ========== */\n  .personas{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}\n  .pcard{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:11px 12px;position:relative;overflow:hidden}\n  .pcard::before{content:\"\";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--c,#888)}\n  .pcard h4{font-size:13.5px;margin-bottom:4px;color:var(--c,#fff)}\n  .pcard p{font-size:12px;color:var(--muted);line-height:1.55}\n  .pcard .status{margin-top:7px;font-size:11px;color:var(--muted)}\n  .pcard .status.champ{color:var(--gold);font-weight:700}\n  .pcard .status.done{color:var(--neon)}\n\n  footer{color:var(--muted);font-size:12px;text-align:center;line-height:1.8;margin-top:6px}\n  footer code{background:var(--panel2);padding:1px 6px;border-radius:5px;color:var(--neon)}\n\n  /* ========== 窄屏适配 ========== */\n  @media (max-width:920px){\n    .stage-grid{grid-template-columns:1fr}\n    .side{flex-direction:row;flex-wrap:wrap}\n    .rank-box,.result-box{flex:1;min-width:240px}\n    canvas{height:clamp(400px,58vh,560px)}\n    .personas{grid-template-columns:repeat(2,1fr)}\n  }\n  @media (max-width:520px){\n    body{padding:12px 10px 30px}\n    .personas{grid-template-columns:1fr}\n    canvas{height:62vh}\n  }\n</style>");
document.body.innerHTML = "\n<div class=\"wrap\">\n\n  <!-- ========== 标题 + 积分钱包 ========== -->\n  <header>\n    <div>\n      <h1>算法 DISCO</h1>\n      <div class=\"tagline\">让排序算法跳起舞 · 看比赛 🔊 下注 🎰 拿积分 🏆</div>\n    </div>\n    <div class=\"wallet\">\n      <span>积分 <b id=\"points\">0</b></span>\n      <span class=\"title-badge\" id=\"title-badge\">称号：围观群众</span>\n    </div>\n  </header>\n\n  <!-- ========== 押注区 ========== -->\n  <section class=\"betbar\">\n    <div class=\"row\" id=\"bet-row\">\n      <span class=\"label\">🎯 押注谁第一个排完：</span>\n      <!-- 押注芯片由 JS 生成 -->\n    </div>\n  </section>\n\n  <!-- ========== 控制区 ========== -->\n  <section class=\"controls\">\n    <div class=\"ctl-group\">\n      <span class=\"name\">数据规模</span>\n      <div class=\"seg\" id=\"seg-size\">\n        <button data-v=\"20\">20</button>\n        <button data-v=\"50\" class=\"on\">50</button>\n        <button data-v=\"100\">100</button>\n        <button data-v=\"200\">200</button>\n      </div>\n    </div>\n    <div class=\"ctl-group\">\n      <span class=\"name\">速度</span>\n      <div class=\"seg\" id=\"seg-speed\">\n        <button data-v=\"0.5\">0.5x</button>\n        <button data-v=\"1\" class=\"on\">1x</button>\n        <button data-v=\"2\">2x</button>\n        <button data-v=\"4\">4x</button>\n      </div>\n    </div>\n    <div class=\"ctl-group\">\n      <button class=\"btn\" id=\"btn-pause\" disabled>⏸ 暂停</button>\n      <button class=\"btn\" id=\"btn-step\" disabled>⏭ 单步</button>\n      <button class=\"btn\" id=\"btn-restart\">↻ 重开</button>\n      <button class=\"btn\" id=\"btn-newdata\">🎲 换一组数据</button>\n      <button class=\"btn\" id=\"btn-sound\">🔊 声音：开</button>\n      <button class=\"btn primary big\" id=\"btn-start\">🟢 开始比赛</button>\n    </div>\n  </section>\n\n  <!-- ========== 主舞台 + 实时排名 ========== -->\n  <div class=\"stage-grid\">\n    <div class=\"stage-box\">\n      <canvas id=\"stage\"></canvas>\n      <div class=\"stage-tip\">柱子越高 = 数值越大 · 音调越高 · 闪白 = 正在比较 · 滑动 = 正在交换</div>\n    </div>\n    <aside class=\"side\">\n      <div class=\"rank-box\">\n        <h3>📊 实时排名</h3>\n        <div id=\"ranking\"></div>\n      </div>\n      <div class=\"result-box\" id=\"result-box\" hidden>\n        <h3>🏁 结算面板</h3>\n        <div id=\"result\"></div>\n      </div>\n    </aside>\n  </div>\n\n  <!-- ========== 算法人格卡 ========== -->\n  <section class=\"personas\" id=\"personas\"></section>\n\n  <footer>\n    排序算法为真实实现、真实运行（动画按操作日志等比回放）· 耗时列是算法在你机器上的真实执行时间 ·\n    快捷键 <code>空格</code> 暂停/继续 · 积分保存在云端\n  </footer>\n</div>\n\n";

"use strict";
/* =====================================================================
 * 算法 Disco —— 让排序算法跳起舞
 * 单文件实现：8 种排序算法真实运行并记录操作日志，再按日志逐帧回放动画。
 * 这样既保证「真实算法、真实运行」，又可以用统一的速度控制观看。
 * ===================================================================== */

/* ---------- 工具 ---------- */
const $ = s => document.querySelector(s);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const easeInOut = p => p<0.5 ? 2*p*p : 1-Math.pow(-2*p+2,2)/2;

/* =====================================================================
 * 一、8 种排序算法（真实实现）
 * 每个算法签名：sort(arr, log) —— 原地排序，并把每一步操作写进 log：
 *   {t:'c', i, j}  比较 arr[i] 与 arr[j]（j 可省略，表示只看一个位置）
 *   {t:'s', i, j}  交换 arr[i] 与 arr[j]
 *   {t:'w', i, v}  把 v 写入位置 i（归并/计数/插入的移位都用它）
 * ===================================================================== */

// 1. 冒泡排序：相邻比较，大的往后冒
function bubbleSort(a, log){
  const n = a.length;
  for(let i=0;i<n-1;i++){
    let swapped = false;
    for(let j=0;j<n-1-i;j++){
      log.push({t:'c', i:j, j:j+1});
      if(a[j] > a[j+1]){
        const t=a[j]; a[j]=a[j+1]; a[j+1]=t;
        log.push({t:'s', i:j, j:j+1});
        swapped = true;
      }
    }
    if(!swapped) break; // 已经有序，提前收工
  }
}

// 2. 选择排序：每轮选出最小值放到前面
function selectionSort(a, log){
  const n = a.length;
  for(let i=0;i<n-1;i++){
    let m = i;
    for(let j=i+1;j<n;j++){
      log.push({t:'c', i:m, j:j});
      if(a[j] < a[m]) m = j;
    }
    if(m !== i){
      const t=a[i]; a[i]=a[m]; a[m]=t;
      log.push({t:'s', i:m, j:i});
    }
  }
}

// 3. 插入排序：像整理扑克牌，逐个插入有序区
function insertionSort(a, log){
  const n = a.length;
  for(let i=1;i<n;i++){
    let j = i;
    while(j > 0){
      log.push({t:'c', i:j-1, j:j});
      if(a[j-1] > a[j]){
        const t=a[j-1]; a[j-1]=a[j]; a[j]=t;
        log.push({t:'s', i:j-1, j:j});
        j--;
      } else break;
    }
  }
}

// 4. 希尔排序：带 gap 的插入排序，先粗调再细调
function shellSort(a, log){
  const n = a.length;
  for(let gap = n>>1; gap > 0; gap = gap>>1){
    for(let i=gap;i<n;i++){
      let j = i;
      while(j >= gap){
        log.push({t:'c', i:j-gap, j:j});
        if(a[j-gap] > a[j]){
          const t=a[j-gap]; a[j-gap]=a[j]; a[j]=t;
          log.push({t:'s', i:j-gap, j:j});
          j -= gap;
        } else break;
      }
    }
  }
}

// 5. 归并排序：分治，合并两个有序段
function mergeSort(a, log){
  function ms(lo, hi){ // 排序 a[lo, hi)
    if(hi - lo < 2) return;
    const mid = (lo + hi) >> 1;
    ms(lo, mid); ms(mid, hi);
    const left = a.slice(lo, mid), right = a.slice(mid, hi);
    let i=0, j=0, k=lo;
    while(i<left.length && j<right.length){
      log.push({t:'c', i:lo+i, j:mid+j}); // 高亮两个有序段的“前锋”
      if(left[i] <= right[j]){ a[k]=left[i];  log.push({t:'w', i:k, v:left[i]});  i++; }
      else                    { a[k]=right[j]; log.push({t:'w', i:k, v:right[j]}); j++; }
      k++;
    }
    while(i<left.length){  a[k]=left[i];  log.push({t:'w', i:k, v:left[i++]}); k++; }
    while(j<right.length){ a[k]=right[j]; log.push({t:'w', i:k, v:right[j++]}); k++; }
  }
  ms(0, a.length);
}

// 6. 快速排序：选基准分区，递归左右
function quickSort(a, log){
  function partition(lo, hi){ // Lomuto 分区，基准 = a[hi]
    const pivot = a[hi];
    let i = lo;
    for(let j=lo;j<hi;j++){
      log.push({t:'c', i:j, j:hi});
      if(a[j] < pivot){
        if(i !== j){
          const t=a[i]; a[i]=a[j]; a[j]=t;
          log.push({t:'s', i, j});
        }
        i++;
      }
    }
    if(i !== hi){
      const t=a[i]; a[i]=a[hi]; a[hi]=t;
      log.push({t:'s', i, j:hi});
    }
    return i;
  }
  function qs(lo, hi){
    if(lo >= hi) return;
    const p = partition(lo, hi);
    qs(lo, p-1); qs(p+1, hi);
  }
  qs(0, a.length-1);
}

// 7. 堆排序：先建大顶堆，再反复取堆顶
function heapSort(a, log){
  const n = a.length;
  function sift(root, end){ // 向下调整
    while(true){
      let big = root;
      const l = 2*root+1, r = l+1;
      if(l < end){ log.push({t:'c', i:big, j:l}); if(a[l] > a[big]) big = l; }
      if(r < end){ log.push({t:'c', i:big, j:r}); if(a[r] > a[big]) big = r; }
      if(big === root) break;
      const t=a[root]; a[root]=a[big]; a[big]=t;
      log.push({t:'s', i:root, j:big});
      root = big;
    }
  }
  for(let i=(n>>1)-1;i>=0;i--) sift(i, n);   // 建堆
  for(let end=n-1;end>0;end--){              // 依次取出最大值
    const t=a[0]; a[0]=a[end]; a[end]=t;
    log.push({t:'s', i:0, j:end});
    sift(0, end);
  }
}

// 8. 计数排序：不比较，直接查“户口”（值域 5~100，整数）
function countingSort(a, log){
  const src = a.slice();
  const min = Math.min(...src), max = Math.max(...src);
  const count = new Array(max - min + 1).fill(0);
  for(let i=0;i<src.length;i++){          // 第一遍：数个数
    log.push({t:'c', i});
    count[src[i]-min]++;
  }
  for(let i=1;i<count.length;i++) count[i] += count[i-1]; // 前缀和定位置
  for(let i=src.length-1;i>=0;i--){       // 倒序写回，保证稳定
    const v = src[i];
    count[v-min]--;
    a[count[v-min]] = v;
    log.push({t:'w', i:count[v-min], v});
  }
}

/* =====================================================================
 * 二、算法档案：专属色 + 拟人化点评
 * ===================================================================== */
const ALGOS = [
  {key:'bubble',    name:'冒泡排序', short:'冒泡', rgb:{r:255,g:93,b:143},  sort:bubbleSort,    persona:'稳如老狗，但你等得起吗'},
  {key:'selection', name:'选择排序', short:'选择', rgb:{r:255,g:209,b:102}, sort:selectionSort, persona:'性格耿直，只会换来换去，从不搬记忆'},
  {key:'insertion', name:'插入排序', short:'插入', rgb:{r:255,g:159,b:90},  sort:insertionSort, persona:'像整理扑克牌，慢条斯理但靠谱'},
  {key:'shell',     name:'希尔排序', short:'希尔', rgb:{r:199,g:125,b:255}, sort:shellSort,     persona:'gap 一走天下我有，粗调细调两手抓'},
  {key:'merge',     name:'归并排序', short:'归并', rgb:{r:76,g:201,b:240},  sort:mergeSort,     persona:'稳得一批，就是有点费内存'},
  {key:'quick',     name:'快速排序', short:'快排', rgb:{r:6,g:214,b:160},   sort:quickSort,     persona:'天赋型选手，偶尔心态崩（最坏情况）'},
  {key:'heap',      name:'堆排序',   short:'堆排', rgb:{r:247,g:37,b:133},  sort:heapSort,      persona:'结构控，凡事都要堆个优先级'},
  {key:'counting',  name:'计数排序', short:'计数', rgb:{r:144,g:241,b:239}, sort:countingSort,  persona:'不开区间比较，直接查户口'},
];

/* =====================================================================
 * 三、全局状态
 * ===================================================================== */
let save = { points:0, wins:0 };
let scoreReady = false;

const state = {
  size: 50,          // 数据规模
  speed: 1,          // 速度倍率
  data: [],          // 当前这组随机数据（所有算法共用）
  maxV: 100,
  traces: null,      // 每种算法的操作日志 + 真实耗时
  lanes: [],         // 8 条赛道的运行时状态
  running: false,
  paused: false,
  bet: null,         // 押注的算法 key
  soundOn: true,
  baseRate: 0,       // 1x 速度下每车道每秒操作数
  rate: 0,
  finishOrder: [],
};
let rafId = null, lastFrameT = 0, lastRankUpdate = 0;

/* =====================================================================
 * 四、Web Audio 合成音效（不用任何外部音频文件）
 * 柱子越高音调越高；比较 = 三角波短音；交换 = 方波短音；写入 = 正弦轻音
 * ===================================================================== */
let audioCtx = null;
let globalLastSound = 0;
function ensureAudio(){
  if(!audioCtx){
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return false;
    audioCtx = new AC();
  }
  if(audioCtx.state === 'suspended') audioCtx.resume();
  return true;
}
function beep(freq, dur, type, gain){
  if(!state.soundOn || !ensureAudio()) return;
  const nowMs = performance.now();
  if(nowMs - globalLastSound < 22) return;      // 全局限流：最多约 45 声/秒
  globalLastSound = nowMs;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(audioCtx.destination);
  osc.start(t); osc.stop(t + dur + 0.03);
}
// 数值 → 音高（越高越尖）
const valToFreq = (v, maxV) => 200 + (v / maxV) * 720;
function playCompare(v, maxV, lane){
  if(!state.soundOn) return;
  if(performance.now() - (lane.lastSound||0) < 55) return; // 每车道限流
  lane.lastSound = performance.now();
  beep(valToFreq(v, maxV), 0.05, 'triangle', 0.045);
}
function playSwap(v, maxV, lane){
  if(!state.soundOn) return;
  if(performance.now() - (lane.lastSound||0) < 55) return;
  lane.lastSound = performance.now();
  beep(150 + (v/maxV)*340, 0.07, 'square', 0.035);
}
function playWrite(v, maxV, lane){
  if(!state.soundOn) return;
  if(performance.now() - (lane.lastSound||0) < 55) return;
  lane.lastSound = performance.now();
  beep(300 + (v/maxV)*520, 0.04, 'sine', 0.03);
}

/* =====================================================================
 * 五、数据与操作日志
 * ===================================================================== */
function genData(n){
  const a = [];
  for(let i=0;i<n;i++) a.push(5 + Math.floor(Math.random()*96)); // 5 ~ 100
  return a;
}
// 真实运行每个算法一次：记录日志 + 测量真实耗时
function buildTraces(){
  state.traces = ALGOS.map(algo => {
    const arr = state.data.slice();     // 同一份初始数据的副本，保证公平
    const log = [];
    const t0 = performance.now();
    algo.sort(arr, log);
    const t1 = performance.now();
    return { ops: log, timeMs: t1 - t0 };
  });
}

/* =====================================================================
 * 六、比赛引擎
 * ===================================================================== */
function startRace(){
  if(!state.traces) buildTraces();
  state.lanes = ALGOS.map((algo, idx) => ({
    algo,
    ops: state.traces[idx].ops,
    i: 0, acc: 0, done: false, finishRank: null,
    comparisons: 0, swaps: 0, timeMs: state.traces[idx].timeMs,
    arr: state.data.slice(),           // 每条赛道一份独立副本
    maxV: state.maxV,
    flashes: [], swapAnims: [], lastSound: 0,
  }));
  state.finishOrder = [];
  // 速度策略：让最慢的赛道在 1x 下大约跑 55 秒，其余按操作数自然分出快慢
  const slowest = Math.max(...state.lanes.map(l => l.ops.length));
  state.baseRate = clamp(slowest / 55, 60, 2600);
  state.rate = state.baseRate * state.speed;
  state.running = true;
  state.paused = false;
  lastFrameT = performance.now();
  if(rafId == null) rafId = requestAnimationFrame(frame);
  updateControls();
  hideResult();
}

// 应用一条操作到赛道状态（并触发音效/闪光/滑动动画）
function applyOp(lane){
  const op = lane.ops[lane.i++];
  const now = performance.now();
  if(op.t === 'c'){
    lane.comparisons++;
    lane.flashes.push({i:op.i, j:op.j, t:now, dur:150});
    playCompare(lane.arr[op.i], lane.maxV, lane);
  }else if(op.t === 's'){
    const t = lane.arr[op.i]; lane.arr[op.i] = lane.arr[op.j]; lane.arr[op.j] = t;
    lane.swaps++;
    lane.swapAnims.push({i:op.i, j:op.j, t:now, dur:170});
    playSwap(lane.arr[op.i], lane.maxV, lane);
  }else if(op.t === 'w'){
    lane.arr[op.i] = op.v;
    lane.swaps++; // 写入计入“交换/写入”列
    lane.flashes.push({i:op.i, j:null, t:now, dur:150});
    playWrite(lane.arr[op.i], lane.maxV, lane);
  }
}

function frame(t){
  const dt = Math.min(0.1, (t - lastFrameT) / 1000);
  lastFrameT = t;
  if(state.running && !state.paused){
    for(const lane of state.lanes){
      if(lane.done) continue;
      lane.acc += dt * state.rate;
      let steps = Math.floor(lane.acc);
      lane.acc -= steps;
      steps = Math.min(steps, 120); // 单帧上限，防止卡顿
      for(let s=0; s<steps && lane.i < lane.ops.length; s++) applyOp(lane);
      if(lane.i >= lane.ops.length && !lane.done){
        lane.done = true;
        lane.finishRank = state.finishOrder.length + 1;
        state.finishOrder.push(lane);
      }
    }
    if(state.finishOrder.length === state.lanes.length){
      state.running = false;
      endRace();
    }
  }
  render(t);
  if(t - lastRankUpdate > 110){ updateRanking(); lastRankUpdate = t; }
  if(state.running){ rafId = requestAnimationFrame(frame); }
  else { rafId = null; render(t); }
}

function stepOnce(){
  // 单步：每条未完成赛道前进 1 个操作
  for(const lane of state.lanes){
    if(lane.done || lane.i >= lane.ops.length) continue;
    applyOp(lane);
    if(lane.i >= lane.ops.length){
      lane.done = true;
      lane.finishRank = state.finishOrder.length + 1;
      state.finishOrder.push(lane);
    }
  }
  if(state.finishOrder.length === state.lanes.length && state.running){
    state.running = false;
    endRace();
  }
  render(performance.now());
  updateRanking();
  updateControls();
}

function endRace(){
  const winner = state.finishOrder[0];
  showResult(winner);
  settleBet(winner);
  updateControls();
  updateRanking();
}

/* =====================================================================
 * 七、Canvas 渲染
 * ===================================================================== */
const canvas = $('#stage');
const ctx = canvas.getContext('2d');
let CW = 0, CH = 0;
function resizeCanvas(){
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width  = Math.max(300, Math.round(rect.width  * dpr));
  canvas.height = Math.max(300, Math.round(rect.height * dpr));
  CW = canvas.width / dpr; CH = canvas.height / dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  render(performance.now());
}
window.addEventListener('resize', resizeCanvas);

function roundRectPath(c, x, y, w, h, r){
  r = Math.min(r, w/2, h/2);
  c.beginPath();
  c.moveTo(x+r, y);
  c.arcTo(x+w, y, x+w, y+h, r);
  c.arcTo(x+w, y+h, x, y+h, r);
  c.arcTo(x, y+h, x, y, r);
  c.arcTo(x, y, x+w, y, r);
  c.closePath();
}

function render(now){
  if(!CW) return;
  ctx.clearRect(0, 0, CW, CH);
  const N = state.lanes.length || ALGOS.length;
  const gap = 8, pad = 6;
  const laneH = (CH - gap*(N-1) - pad*2) / N;
  const labelW = CW < 560 ? 52 : 78;
  const barsX = labelW + 10, barsW = CW - barsX - 12;

  for(let k=0;k<N;k++){
    const lane = state.lanes[k];
    const y = pad + k * (laneH + gap);
    // 赛道背景
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    roundRectPath(ctx, barsX-7, y-2, barsW+14, laneH+4, 8); ctx.fill();
    if(!lane){
      // 尚未开始：用暗色柱子预览这组数据，8 条赛道完全相同
      const a = ALGOS[k];
      ctx.fillStyle = `rgba(${a.rgb.r},${a.rgb.g},${a.rgb.b},0.85)`;
      ctx.font = '600 12px "PingFang SC","Microsoft YaHei",sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(a.short, 6, y + laneH/2);
      const n = state.data.length;
      if(n > 0){
        const slot = barsW / n;
        const bw = Math.max(1, slot - Math.min(1.2, slot*0.18));
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        for(let i=0;i<n;i++){
          const bh = Math.max(2, (state.data[i] / state.maxV) * (laneH - 10));
          ctx.fillRect(barsX + i*slot + (slot-bw)/2, y + laneH - bh, bw, bh);
        }
      }
      continue;
    }
    drawLane(lane, y, laneH, barsX, barsW, labelW, now);
  }
}

function drawLane(lane, y, h, x, w, labelW, now){
  const c = lane.algo.rgb;
  const accent = (alpha) => `rgba(${c.r},${c.g},${c.b},${alpha})`;

  // ---- 左侧标签 + 状态 ----
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = '600 12px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillStyle = accent(0.95);
  ctx.fillText(lane.algo.short, 6, y + h/2);
  if(lane.done){
    ctx.fillStyle = lane.finishRank === 1 ? '#ffd166' : accent(0.9);
    ctx.font = '700 11px sans-serif';
    ctx.fillText(lane.finishRank === 1 ? '👑' : '#'+lane.finishRank, 4, y + h - 12);
  }

  // ---- 计算闪光与交换动画 ----
  const flash = new Map();
  for(const f of lane.flashes){
    const p = (now - f.t) / f.dur;
    if(p < 1){
      const a = 1 - p;
      flash.set(f.i, Math.max(flash.get(f.i) || 0, a));
      if(f.j != null) flash.set(f.j, Math.max(flash.get(f.j) || 0, a));
    }
  }
  const off = new Map();
  for(const s of lane.swapAnims){
    const p = Math.min(1, (now - s.t) / s.dur);
    const e = easeInOut(p);
    off.set(s.i, (off.get(s.i) || 0) + e * (w / lane.arr.length));
    off.set(s.j, (off.get(s.j) || 0) - e * (w / lane.arr.length));
    if(p >= 1) s.dead = true;
  }
  lane.swapAnims = lane.swapAnims.filter(s => !s.dead);
  lane.flashes = lane.flashes.filter(f => (now - f.t) < f.dur);

  // ---- 画柱子（高度 = 数值）----
  const n = lane.arr.length;
  const slot = w / n;
  const bw = Math.max(1, slot - Math.min(1.2, slot*0.18));
  const baseH = h - 10;
  for(let i=0;i<n;i++){
    const v = lane.arr[i];
    const bh = Math.max(2, (v / lane.maxV) * baseH);
    const bx = x + i*slot + (slot - bw)/2 + (off.get(i) || 0);
    const by = y + h - bh;
    const fa = flash.get(i) || 0;
    const moving = off.has(i);
    let fill;
    if(lane.done){
      fill = accent(0.92);
    }else if(fa > 0){
      // 比较中：向白色混合，亮度随闪光衰减
      const k = 0.25 + 0.6*fa;
      fill = `rgb(${Math.round(c.r+(255-c.r)*k)},${Math.round(c.g+(255-c.g)*k)},${Math.round(c.b+(255-c.b)*k)})`;
    }else if(moving){
      fill = `rgb(${Math.round(c.r+(255-c.r)*0.3)},${Math.round(c.g+(255-c.g)*0.3)},${Math.round(c.b+(255-c.b)*0.3)})`;
    }else{
      fill = accent(0.42);
    }
    ctx.fillStyle = fill;
    roundRectPath(ctx, bx, by, bw, bh, Math.min(2, bw/2));
    ctx.fill();
  }

  // ---- 进度条 ----
  const prog = lane.ops.length ? lane.i / lane.ops.length : 0;
  ctx.fillStyle = accent(0.85);
  ctx.fillRect(x, y + h + 1.5, w * prog, 2);
}

/* =====================================================================
 * 八、UI：押注芯片 / 排名 / 结算 / 人格卡
 * ===================================================================== */
function renderBetChips(){
  const row = $('#bet-row');
  row.querySelectorAll('.chip').forEach(chip => chip.remove());
  ALGOS.forEach(a => {
    const chip = document.createElement('button');
    chip.className = 'chip' + (state.bet === a.key ? ' sel' : '');
    chip.dataset.key = a.key;
    chip.innerHTML = `<span class="dot" style="color:rgb(${a.rgb.r},${a.rgb.g},${a.rgb.b})"></span>${a.name}`;
    chip.onclick = () => {
      if(state.running) return;
      state.bet = (state.bet === a.key) ? null : a.key;
      renderBetChips();
    };
    row.appendChild(chip);
  });
}

function renderPersonas(){
  const box = $('#personas');
  box.innerHTML = '';
  ALGOS.forEach(a => {
    const card = document.createElement('div');
    card.className = 'pcard';
    card.style.setProperty('--c', `rgb(${a.rgb.r},${a.rgb.g},${a.rgb.b})`);
    card.dataset.key = a.key;
    card.innerHTML = `<h4>${a.name}</h4><p>${a.persona}</p><div class="status">待出发</div>`;
    box.appendChild(card);
  });
}

function updateRanking(){
  // 排序：已完成的按名次，未完成的按进度
  const list = state.lanes.map(l => ({
    lane: l,
    prog: l.ops.length ? l.i / l.ops.length : 0,
  })).sort((a,b) => {
    if(a.lane.done && b.lane.done) return a.lane.finishRank - b.lane.finishRank;
    if(a.lane.done) return -1;
    if(b.lane.done) return 1;
    return b.prog - a.prog;
  });
  const box = $('#ranking');
  if(!state.lanes.length){
    box.innerHTML = '<div style="font-size:12px;color:var(--muted);padding:8px 4px">等待开始……押注一位选手，然后点「开始比赛」。</div>';
    document.querySelectorAll('.pcard .status').forEach(st => { st.textContent = '待出发'; st.className = 'status'; });
    return;
  }
  box.innerHTML = list.map(({lane, prog}) => {
    const c = lane.algo.rgb;
    const done = lane.done;
    const st = done ? `✓ ${(lane.timeMs).toFixed(3)}ms` : `${Math.round(prog*100)}%`;
    return `<div class="rank-row ${done && lane.finishRank===1 ? 'lead':''}">
      <span class="no">${done ? (lane.finishRank===1?'👑':'#'+lane.finishRank) : '·'}</span>
      <span class="nm"><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:rgb(${c.r},${c.g},${c.b});margin-right:6px"></i>${lane.algo.name}</span>
      <span class="st ${done?'done':''}">${st}</span>
      <div class="pbar" style="width:56px;flex:none"><i style="width:${Math.round(prog*100)}%;background:rgb(${c.r},${c.g},${c.b})"></i></div>
    </div>`;
  }).join('');
  // 人格卡状态
  document.querySelectorAll('.pcard').forEach(card => {
    const lane = state.lanes.find(l => l.algo.key === card.dataset.key);
    const st = card.querySelector('.status');
    if(!lane){ st.textContent = '待出发'; st.className = 'status'; return; }
    if(lane.done){
      st.textContent = lane.finishRank === 1 ? `🏆 冠军 · ${lane.timeMs.toFixed(3)}ms` : `第 ${lane.finishRank} 名 · ${lane.timeMs.toFixed(3)}ms`;
      st.className = 'status ' + (lane.finishRank === 1 ? 'champ' : 'done');
    }else if(state.running){
      const p = Math.round((lane.i / lane.ops.length) * 100);
      st.textContent = state.paused ? `比赛中（已暂停 ${p}%）` : `比赛中 ${p}%`;
      st.className = 'status';
    }else{
      st.textContent = '待出发'; st.className = 'status';
    }
  });
}

function showResult(winner){
  const box = $('#result-box');
  const html = $('#result');
  box.hidden = false;
  const rows = state.finishOrder.map(lane => {
    const c = lane.algo.rgb;
    return `<tr>
      <td>${lane.finishRank===1?'👑':lane.finishRank}</td>
      <td><span class="algo"><i style="background:rgb(${c.r},${c.g},${c.b})"></i>${lane.algo.name}</span></td>
      <td>${lane.timeMs.toFixed(3)}ms</td>
      <td>${lane.comparisons.toLocaleString()}</td>
      <td>${lane.swaps.toLocaleString()}</td>
      <td>${(lane.comparisons+lane.swaps).toLocaleString()}</td>
    </tr>`;
  }).join('');
  const cw = winner.algo.rgb;
  html.innerHTML = `
    <div class="winner-banner">
      <div class="big">🏆 冠军：<span style="color:rgb(${cw.r},${cw.g},${cw.b})">${winner.algo.name}</span></div>
      <div>真实耗时 <b>${winner.timeMs.toFixed(3)}ms</b> · 比较 ${winner.comparisons.toLocaleString()} 次 · 交换/写入 ${winner.swaps.toLocaleString()} 次</div>
      <div class="bet-settle" id="bet-settle"></div>
    </div>
    <div class="table-scroll"><table>
      <thead><tr><th>排名</th><th>算法</th><th>真实耗时</th><th>比较次数</th><th>交换/写入</th><th>操作总数</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
}
function hideResult(){ $('#result-box').hidden = true; }

function settleBet(winner){
  const el = $('#bet-settle');
  if(!state.bet){
    el.className = 'bet-settle lose';
    el.textContent = '本局没有押注，下次可以提前选一位选手。';
    return;
  }
  if(state.bet === winner.algo.key){
    persistSave();
    el.className = 'bet-settle win';
    el.innerHTML = `🎉 押中了！<b>${winner.algo.name}</b> 第一个排完，+100 积分！正在保存…`;
  }else{
    const betAlgo = ALGOS.find(a => a.key === state.bet);
    el.className = 'bet-settle lose';
    el.innerHTML = `😅 你押了 <b>${betAlgo.name}</b>，但冠军是 <b>${winner.algo.name}</b>。下次眼睛放亮点！`;
  }
  updateWallet();
}
function titleOf(wins){
  if(wins >= 10) return '排序之神';
  if(wins >= 5)  return 'Disco 之王';
  if(wins >= 3)  return '赛道预言家';
  if(wins >= 1)  return '算法伯乐';
  return '围观群众';
}
function updateWallet(){
  $('#points').textContent = save.points;
  $('#title-badge').textContent = '称号：' + titleOf(save.wins);
}
async function persistSave(){
  scoreReady = false; updateControls();
  try { save = await awardWin(); updateWallet(); $('#score-status').textContent = '积分已保存'; $('#bet-settle').textContent = $('#bet-settle').textContent.replace('正在保存…', '积分已保存'); }
  catch(e) { $('#score-status').textContent = '积分保存结果未知，请刷新后核对'; $('#bet-settle').textContent = $('#bet-settle').textContent.replace('正在保存…', '保存结果未知，请刷新后核对'); updateControls(); return; }
  scoreReady = true; updateControls();
}

/* =====================================================================
 * 九、控制逻辑
 * ===================================================================== */
function updateControls(){
  const running = state.running;
  $('#btn-start').disabled = !scoreReady;
  $('#btn-restart').disabled = !scoreReady;
  $('#btn-start').textContent = state.traces && !running && state.finishOrder.length ? '🔁 重新开始' : '🟢 开始比赛';
  $('#btn-pause').disabled = !running;
  $('#btn-step').disabled = !running;
  $('#btn-pause').textContent = state.paused ? '▶ 继续' : '⏸ 暂停';
  document.querySelectorAll('#seg-size button').forEach(b => b.classList.toggle('on', +b.dataset.v === state.size));
  document.querySelectorAll('#seg-speed button').forEach(b => b.classList.toggle('on', +b.dataset.v === state.speed));
  document.querySelectorAll('#bet-row .chip').forEach(c => {
    c.classList.toggle('disabled', running);
    c.classList.toggle('sel', c.dataset.key === state.bet);
  });
  $('#btn-sound').textContent = state.soundOn ? '🔊 声音：开' : '🔇 声音：关';
}

function resetRace(){
  state.running = false;
  state.paused = false;
  state.lanes = [];
  state.finishOrder = [];
  state.traces = null;
  hideResult();
  updateControls();
  updateRanking();
  render(performance.now());
}

$('#seg-size').addEventListener('click', e => {
  const btn = e.target.closest('button'); if(!btn) return;
  state.size = +btn.dataset.v;
  state.data = genData(state.size);
  resetRace();
});
$('#seg-speed').addEventListener('click', e => {
  const btn = e.target.closest('button'); if(!btn) return;
  state.speed = +btn.dataset.v;
  state.rate = state.baseRate * state.speed;
  updateControls();
});
$('#btn-start').addEventListener('click', () => {
  ensureAudio(); // 用户手势内激活音频上下文
  startRace();
});
$('#btn-pause').addEventListener('click', () => {
  if(!state.running) return;
  state.paused = !state.paused;
  if(!state.paused) lastFrameT = performance.now();
  updateControls();
});
$('#btn-step').addEventListener('click', () => {
  if(!state.running) return;
  if(!state.paused){ state.paused = true; updateControls(); }
  stepOnce();
});
$('#btn-restart').addEventListener('click', () => {
  resetRace();
  ensureAudio();
  startRace(); // 同一组数据立刻重跑
});
$('#btn-newdata').addEventListener('click', () => {
  state.data = genData(state.size);
  resetRace();
});
$('#btn-sound').addEventListener('click', () => {
  state.soundOn = !state.soundOn;
  updateControls();
});
// 空格键：暂停 / 继续
window.addEventListener('keydown', e => {
  if(e.code === 'Space' && state.running && e.target === document.body){
    e.preventDefault();
    $('#btn-pause').click();
  }
});

/* =====================================================================
 * 十、初始化
 * ===================================================================== */
function init(){
  state.data = genData(state.size);
  state.maxV = Math.max(...state.data);
  renderBetChips();
  renderPersonas();
  updateWallet();
  updateControls();
  updateRanking();
  resizeCanvas();
}
init();
const scoreStatus = document.createElement('div');
scoreStatus.id = 'score-status'; scoreStatus.setAttribute('role', 'status'); scoreStatus.textContent = '正在读取积分…';
document.querySelector('.wallet').append(scoreStatus);
readScore().then(value => { save = value; scoreReady = true; updateWallet(); updateControls(); scoreStatus.textContent = '积分已同步'; }).catch(() => { scoreStatus.textContent = '积分读取失败，请刷新重试'; });
