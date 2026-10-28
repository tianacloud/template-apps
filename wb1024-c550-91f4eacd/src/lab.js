/* ============================================================
   0. 公式引擎
   ============================================================ */
const math = window.math || window.Math;
const VARS = ['x','y','z'];

/* ============================================================
   0b. 公式 → LaTeX 渲染（给用户看的数学排版）
   ============================================================ */
const FN_LATEX = {
  sin:'\\sin', cos:'\\cos', tan:'\\tan', cot:'\\cot', sec:'\\sec', csc:'\\csc',
  asin:'\\arcsin', acos:'\\arccos', atan:'\\arctan', atan2:'\\operatorname{atan2}',
  sinh:'\\sinh', cosh:'\\cosh', tanh:'\\tanh', asinh:'\\operatorname{arsinh}',
  exp:'\\exp', log:'\\ln', ln:'\\ln', log10:'\\log_{10}', log2:'\\log_{2}',
  sqrt:'\\sqrt', abs:'\\left|', sign:'\\operatorname{sgn}',
  floor:'\\left\\lfloor', ceil:'\\left\\lceil', round:'\\operatorname{round}',
  max:'\\max', min:'\\min', mod:'\\bmod'
};
const GREEK = { pi:'\\pi', e:'e', phi:'\\varphi', alpha:'\\alpha', beta:'\\beta',
                gamma:'\\gamma', theta:'\\theta', lambda:'\\lambda', mu:'\\mu',
                sigma:'\\sigma', omega:'\\omega', tau:'\\tau' };

/** 把一段输入文本转成 LaTeX（不求值，纯语法转换） */
function toLatex(src){
  if (!src || !src.trim()) return '';
  let s = src.trim();

  // 数学函数名 → LaTeX（仅替换函数调用形式 name(）
  for (const [name, tex] of Object.entries(FN_LATEX)){
    s = s.replace(new RegExp('\\b' + name + '\\s*\\(', 'g'), tex + '(');
  }
  // 常量
  s = s.replace(/\bpi\b/g, '\\pi');

  // 隐式乘法 x^2/3 → \frac{x^2}{3}；sin(x)/x 这类也覆盖
  s = s.replace(/\(([^()]+)\)\s*\/\s*(\w+(?:\([^()]*\))?)/g, (m, num, den) => `\\frac{${num}}{${den}}`);
  s = s.replace(/(\d+)\s*\/\s*(\w+)/g, (m, num, den) => `\\frac{${num}}{${den}}`);
  s = s.replace(/\)\s*\/\s*(\d+)/g, (m, den) => `\\frac{1}{${den}}`);

  // 幂 → ^{}
  s = s.replace(/\^\s*\(?\s*(-?\d+|[a-z])\s*\)?/g, (m, e) => `^{${e}}`);

  // 显式乘法符号 → 隐式空格
  s = s.replace(/\*/g, ' \\cdot ');

  // 收紧空格
  s = s.replace(/\s+/g, ' ');
  return s.trim();
}

/** 在指定容器里渲染公式（KaTeX 优先，失败则退回纯文本） */
function renderLatex(boxId, latex, displayMode){
  const box = document.getElementById(boxId);
  if (!box) return;
  if (!latex){ box.innerHTML = '<span class="empty">（输入公式后此处显示数学排版）</span>'; return; }
  const k = window.katex;
  if (k && k.render){
    try{
      k.render(latex, box, { displayMode: !!displayMode, throwOnError:false,
                             strict:false, trust:false, output:'html' });
      return;
    }catch(e){ /* 落到下面的纯文本 */ }
  }
  box.textContent = latex;
}

/** 方程模式：把整条方程排版出来（等号两侧分别渲染） */
function renderEquationLatex(boxId, raw){
  const box = document.getElementById(boxId);
  if (!box) return;
  const s = (raw || '').trim();
  if (!s){ box.innerHTML = '<span class="empty">（输入公式后此处显示数学排版）</span>'; return; }
  const parts = s.split('=');
  if (parts.length === 2){
    renderLatex(boxId, toLatex(parts[0]) + ' = ' + toLatex(parts[1]), true);
  } else {
    renderLatex(boxId, toLatex(s), true);
  }
}

/** mathjs 的 ParenthesisNode.args 为空，真实内容在 .content —— 必须特判 */
const children = n =>
  (n.type === 'ParenthesisNode') ? (n.content ? [n.content] : []) : ((n.args && n.args.length) ? n.args : []);

/** 节点子树里是否出现变量 v */
function hasVar(node, v){
  let hit = false;
  const f = n2 => {
    if (n2.type === 'SymbolNode'){ if (n2.name === v) hit = true; return; }
    if (n2.type === 'ConstantNode') return;
    children(n2).forEach(f);
  };
  f(node); return hit;
}

/** 把用户输入统一成 "F(x,y,z) = 0" 的形式 */
function normalizeEq(raw){
  let s = (raw || '').trim().replace(/\s+/g, '');
  if (!s) throw new Error('请输入方程');
  if (s.includes('=')){
    const p = s.split('=');
    if (p.length > 2) throw new Error('方程里有多个等号，请只留一个');
    const L = p[0].trim(), R = p.slice(1).join('=').trim();
    if (!L) throw new Error('等号左边为空');
    if (R === '0') return L;                       // A-0 可省
    if (L === '0') return '(' + R + ')';           // 0-A
    return '(' + L + ')-(' + R + ')';
  }
  return s;
}

/**
 * 判定哪些变量只以「一次幂」出现 —— 这些是方程的因变量（可解出）。
 * 判据：出现次数>0，且从未出现在 ^ 的底、也从未作为函数参数。
 */
function linearVars(expr){
  const out = [];
  for (const v of VARS){
    let cnt = 0, ok = true;
    const rec = n => {
      if (n.type === 'SymbolNode'){ if (n.name === v) cnt++; return; }
      if (n.type === 'ConstantNode') return;
      if (n.type === 'FunctionNode'){ if (hasVar(n, v)) ok = false; return; }
      if (n.isOperatorNode && n.op === '^'){ if (hasVar(n.args[0], v)) ok = false; return; }
      children(n).forEach(rec);
    };
    rec(math.parse(expr));
    if (cnt > 0 && ok) out.push(v);
  }
  return out;
}

/**
 * 判断变量 v 是否以「平方」形式出现（作为 ^ 的底，指数为 2）。
 * 用于区分「抛物柱面 z = x²」（因变量不带平方）与「旋转面 x = x²+y²」（因变量带平方）。
 */
function hasSquareTerm(F, v){
  let found = false;
  const rec = n => {
    if (found) return;
    if (!n || n.type === 'ConstantNode') return;
    if (n.isOperatorNode && n.op === '^'){
      const b = n.args[0], e = n.args[1];
      if (b && b.type === 'SymbolNode' && b.name === v &&
          e && e.type === 'ConstantNode' && Math.abs(Number(e.value) - 2) < 1e-12) found = true;
    }
    children(n).forEach(rec);
  };
  try { rec(math.parse(F)); } catch(e){}
  return found;
}

/** 把表达式编译成求值函数 */
function compile(exprStr, keys){
  if (!exprStr || !String(exprStr).trim()) throw new Error('公式不能为空');
  let code;
  try{ code = math.parse(String(exprStr)).compile(); }
  catch(e){ throw new Error('公式语法有误：' + (e.message || e)); }
  const ks = Array.isArray(keys) ? keys : Object.keys(keys);
  return vals => {
    const s = {};
    ks.forEach((k,i)=> s[k] = vals[i]);
    let v;
    try{ v = code.evaluate(s); }catch(e){ return NaN; }
    if (v && typeof v !== 'number'){
      if (v.valueOf) v = v.valueOf();
      if (typeof v !== 'number' || !isFinite(v)) return NaN;
    }
    return v;
  };
}

/* ============================================================
   1. 方程分析（决定用哪种绘图法）
   ============================================================ */
function analyzeEquation(raw){
  const F = normalizeEq(raw);                 // 统一成 F=0
  let node;
  try{ node = math.parse(F); }
  catch(e){ throw new Error('公式语法有误：' + (e.message || e)); }

  const all = [];
  const rec = n => { if (n.type==='SymbolNode' && VARS.includes(n.name) && !all.includes(n.name)) all.push(n.name);
                     if (n.type==='ConstantNode') return; children(n).forEach(rec); };
  rec(node);
  if (!all.length) throw new Error('公式里没有出现 x / y / z 变量');

  const lin = linearVars(F);
  // 解析可解出的因变量候选（等号左边是单个变量，或整个 F 中唯一线性变量）
  let dep = null, reason = '';
  const m = String(raw).trim().replace(/\s+/g,'');
  if (m.includes('=')){
    const lhs = m.split('=')[0].trim();
    if (VARS.includes(lhs)){ dep = lhs; reason = 'lhs'; }
  }
  if (!dep && lin.length === 1){ dep = lin[0]; reason = 'linear'; }

  if (dep){
    const free = VARS.filter(v => v !== dep && all.includes(v));
    // 3 个变量都在 → 规则曲面
    if (free.length === 2 && all.length === 3)
      return { kind:'explicit', F, dep, free, all, reason };
    // 只有 2 个变量：
    //   · dep 在左侧且方程能解出 dep（如 z = x²、y² = 2x）→ 柱面，沿第三轴延展
    //   · dep 出现在平方项中（如 x = x²+y²）→ 旋转面，绕 dep 轴旋转
    if (free.length === 1 && all.length === 2){
      const axis = VARS.find(v => !all.includes(v));
      const dq = quadForm(F);
      const depSq = hasSquareTerm(F, dep) ||
                    (dq ? Math.abs(dq[dep + dep] || 0) > 1e-12 : false);
      if (!depSq){
        // 柱面：z = x²、z = sin(x)、y² = 2x → 母线沿第三轴平移
        return { kind:'cylinder', F, dep, free, all, reason, axis };
      }
      // 旋转面：x = x²+y²、x = x²−y²、x = 1/(x²+y²) → 母线绕 dep 轴旋转
      return { kind:'explicit', F, dep, free, all, reason, revolve:true, axis };
    }
  }

  // 隐式 + 只含 2 个变量（如 x²+y²=4、x²/4 - y²/9 = 1、x²/4 + y²/9 = 1）
  // 方程与第三个变量无关 → 严格说是「柱面」：曲线沿第三轴平移延伸。
  // 椭圆/双曲线作为母线绕轴旋转会得到圆柱，这正是旋转面画法的副作用。
  if (all.length === 2){
    const axis = VARS.find(v => !all.includes(v));
    return { kind:'cylinder', F, dep:null, free:all, all, lin, reason:'implicit2', axis };
  }

  return { kind:'implicit', F, lin, all };
}

/** 统计各变量的最高幂次（只看显式 ^ 幂，函数/分式不计入） */
function degreesOf(F){
  const deg = { x:0, y:0, z:0 };
  for (const v of VARS){
    const rec = n => {
      if (n.type === 'SymbolNode' || n.type === 'ConstantNode') return;
      if (n.isOperatorNode && n.op === '^'){
        const b = n.args[0], ex = n.args[1];
        if (hasVar(b, v) && ex && ex.type === 'ConstantNode'){
          const k = Number(ex.value);
          if (isFinite(k)) deg[v] = Math.max(deg[v], Math.abs(k));
        }
        return;
      }
      children(n).forEach(rec);
    };
    rec(math.parse(F));
  }
  return deg;
}

/**
 * 二次型精确解析：提取 x²,y²,z²,xy,xz,yz 及一次项、常数项系数。
 * 直接在 mathjs AST 上递归，不做字符串拆解，括号/符号/分母都能正确处理。
 * 返回 null 表示不是可识别的二次多项式（含函数项等）。
 */
function quadForm(F){
  const hasFunc = /\b(sin|cos|tan|exp|log|ln|sqrt|abs|sinh|cosh|tanh|atan|asin|acos|sign|floor|ceil|round)\s*\(/.test(F);
  if (hasFunc) return null;

  const node = math.parse(F);
  const q = { xx:0, yy:0, zz:0, xy:0, xz:0, yz:0, x:0, y:0, z:0, c:0 };
  const K = { x:'x', y:'y', z:'z' };
  const CROSS = { xy:'xy', yx:'xy', xz:'xz', zx:'xz', yz:'yz', zy:'yz' };
  let ok = true;

  // 纯数字？
  const numOf = n => {
    if (!n) return null;
    if (n.type === 'ConstantNode') return Number(n.value);
    if (n.isOperatorNode && (n.op === '-' || n.op === '+-') && n.args.length === 1) return -numOf(n.args[0]);
    if (n.isOperatorNode && n.op === '+' && n.args.length === 2){
      const a = numOf(n.args[0]), b = numOf(n.args[1]);
      if (a !== null && b !== null) return a + b;
    }
    return null;
  };

  // 把「平方」节点统一认出来：base 必须是裸变量
  const asSquare = n => {
    if (n && n.isOperatorNode && n.op === '^'){
      const e = numOf(n.args[1]);
      const b = n.args[0];
      if (e === 2 && b && b.type === 'SymbolNode' && K[b.name]) return b.name;
    }
    return null;
  };

  /** 累加 n（带系数 k）到 q，识别不了就返回 false */
  const add = (n, k) => {
    if (!n) return false;

    // 负号
    if (n.isOperatorNode && n.op === '-' && n.args.length === 1) return add(n.args[0], -k);

    // 括号
    if (n.type === 'ParenthesisNode') return add(n.content, k);

    // 加减展开
    if (n.isOperatorNode && n.op === '+'){
      let r = true; n.args.forEach(a => { if (!add(a, k)) r = false; }); return r;
    }
    if (n.isOperatorNode && n.op === '-'){
      let r = true; n.args.forEach((a,i) => { if (!add(a, k * (i === 0 ? 1 : -1))) r = false; }); return r;
    }

    // 常数
    const nv = numOf(n);
    if (nv !== null){ q.c += k * nv; return true; }

    // 单变量
    if (n.type === 'SymbolNode' && K[n.name]){ q[K[n.name]] += k; return true; }

    // 平方 x^2
    const sq = asSquare(n);
    if (sq){ q[sq + sq] += k; return true; }

    // 除法：分母必须是纯数字
    if (n.isOperatorNode && n.op === '/'){
      const den = numOf(n.args[1]);
      if (den !== null && den !== 0) return add(n.args[0], k / den);
      return false;
    }

    // 乘法：拆成因子
    if (n.isOperatorNode && (n.op === '*' || n.op === '.*')){
      const facs = [];
      const flat = m => { if (m && m.isOperatorNode && m.op === '*') m.args.forEach(flat); else facs.push(m); };
      n.args.forEach(flat);

      let coef = k;
      const vars_ = [];
      for (const f of facs){
        const fv = numOf(f);
        if (fv !== null){ coef *= fv; continue; }
        if (f && f.type === 'ParenthesisNode'){
          // (x+y)*2 之类：直接展开系数
          const inner = numOf(f);
          if (inner !== null){ coef *= inner; continue; }
          return false;
        }
        vars_.push(f);
      }
      if (vars_.length === 1){
        const s = vars_[0];
        if (s.type === 'SymbolNode' && K[s.name]){ q[K[s.name]] += coef; return true; }
        const ss = asSquare(s);
        if (ss){ q[ss + ss] += coef; return true; }
        return false;
      }
      if (vars_.length === 2 && vars_.every(s => s && s.type === 'SymbolNode')){
        const cr = CROSS[vars_[0].name + vars_[1].name];
        if (cr){ q[cr] += coef; return true; }
      }
      return false;
    }

    return false;
  };

  if (!add(node, 1)) ok = false;
  return ok ? q : null;
}

const VARS_ = ['x','y','z'];

/** 形如分类（学习提示用） */
function classify(F){
  const q = quadForm(F);
  if (!q){
    const hasFunc = /\b(sin|cos|tan|exp|log|ln|sqrt|abs|sinh|cosh|tanh|atan|asin|acos|sign|floor|ceil|round)\s*\(/.test(F);
    return hasFunc ? '含函数项的一般曲面（函数图像型）' : '一般曲面（含混合项）';
  }

  const sq = [q.xx, q.yy, q.zz];
  const nz = sq.filter(v => Math.abs(v) > 1e-12);
  const lin = [q.x, q.y, q.z].filter(v => Math.abs(v) > 1e-12);
  const EPS = 1e-12;

  // 纯平面
  if (nz.length === 0 && lin.length > 0) return '平面（一次曲面）';

  // 无一次项 → 中心对称曲面
  if (lin.length === 0){
    if (nz.length === 1){
      const i = sq.findIndex(v => Math.abs(v) > EPS);
      return `柱面（垂直于 ${VARS_[i]} 轴，如 x^2+y^2=4 是圆柱面）`;
    }
    if (nz.length === 2){
      const idx = sq.map((v,i)=>Math.abs(v)>EPS?i:-1).filter(i=>i>=0);
      const free = VARS_.find((_,i)=>!idx.includes(i));
      return `椭圆柱面（沿 ${free} 轴无界）`;
    }
    // 三项齐全：判椭球 / 单叶 / 双叶
    // F 已标准化为「LHS - RHS = 0」，常数项 q.c = -RHS
    if (Math.abs(q.c) < EPS) return '椭圆锥面（如 x^2/3 + y^2/2 - z^2 = 0）';
    const sc = Math.sign(q.c);
    // F 已标准化为「LHS − RHS = 0」（如 x²+y²+z²−9），常数项符号与平方项相反
    // 统计与常数项「异号」的平方项：3→椭球，2→单叶，1→双叶
    const oppCnt = nz.filter(v => Math.sign(v) !== sc).length;
    if (oppCnt === 3) return '椭球面（如 x^2 + y^2 + z^2 = 9）';
    if (oppCnt === 2) return '单叶双曲面（如 x^2/4 + y^2/9 - z^2 = 1）';
    return '双叶双曲面（如 z^2/4 - x^2/9 - y^2/4 = 1）';
  }

  // 含一次项 + 平方项 → 抛物面类
  if (nz.length >= 1) return '抛物面类（旋转抛物面 / 椭圆抛物面）';
  return '平面（一次曲面）';
}

/**
 * 柱面专用分类：只根据「母线所在平面」的两个变量判断母线是圆/椭圆/双曲/抛物线。
 * 例：x^2+y^2=4 → 圆母线 → 圆柱面；x^2/4+y^2/9=1 → 椭圆母线 → 椭圆柱面；
 *     x^2/4-y^2/9=1 → 双曲母线 → 双曲柱面；z=x^2 → 抛物线母线 → 抛物柱面。
 */
function classifyCylinder(F, all, axis){
  const q = quadForm(F);
  const [u, v] = all;
  const key = { x:'xx', y:'yy', z:'zz' };
  const linKey = { x:'x', y:'y', z:'z' };
  if (!q) {
    const hasFunc = /\b(sin|cos|tan|exp|log|ln|sqrt|abs|sinh|cosh|tanh)\s*\(/.test(F);
    return hasFunc ? '函数母线柱面' : '柱面（母线为一般平面曲线）';
  }
  const a = q[key[u]], b = q[key[v]];
  const la = Math.abs(q[linKey[u]]), lb = Math.abs(q[linKey[v]]);
  const EPS = 1e-12;
  const sa = Math.abs(a) > EPS, sb = Math.abs(b) > EPS;
  if (sa && sb){
    if (Math.sign(a) !== Math.sign(b)) return '双曲柱面（母线为双曲线）';
    if (Math.abs(Math.abs(a) - Math.abs(b)) < 1e-9 * Math.max(1, Math.abs(a)))
      return '圆柱面（母线为圆）';
    return '椭圆柱面（母线为椭圆）';
  }
  if ((sa && lb) || (sb && la)) return '抛物柱面（母线为抛物线）';
  if (sa || sb) return '柱面（母线为平行直线）';
  return '柱面（母线为直线 → 平面）';
}

/* ============================================================
   2. 绘图构建
   ============================================================ */

/**
 * 通用：把 dep 作为高度、free[0]/free[1] 作为两个水平轴的曲面。
 * 若 dep 在 F 中非线性（如 x = x²+y²），用二分法在 [lo,hi] 逐点求根。
 */
/**
 * 显式曲面：把 dep 当作「因变量」，free[0]/free[1] 当作自变量。
 * dep 在 F 中非线性时（如 x = y²+z² 需要解二次）用二分法数值求根。
 * 注意：坐标轴范围按 x/y/z 三个真实轴分别计算（不能假设因变量一定是 z）。
 */
function buildExplicit(F, dep, free, R, N){
  const fn = compile(F, VARS);
  const A = free[0], B = free[1];
  const iA = VARS.indexOf(A), iB = VARS.indexOf(B), iD = VARS.indexOf(dep);
  const gv = i => -R + 2*R*i/N;

  const needSolve = !linearVars(F).includes(dep);

  /** 给定自由变量值，解出 dep（无根返回 NaN） */
  const solveDep = (a, b) => {
    if (!needSolve){
      // F 对 dep 是线性的：F = k·dep + g  →  dep = −g / k
      const p0 = [0,0,0]; p0[iA]=a; p0[iB]=b; p0[iD]=0;
      const p1 = [0,0,0]; p1[iA]=a; p1[iB]=b; p1[iD]=1;
      const f0 = fn(p0), f1 = fn(p1);
      if (!isFinite(f0) || !isFinite(f1)) return NaN;
      const k = f1 - f0;
      if (Math.abs(k) < 1e-12) return NaN;
      return -f0 / k;
    }
    const g = d => { const p=[0,0,0]; p[iA]=a; p[iB]=b; p[iD]=d; return fn(p); };
    // 扫描找符号变化区间，再二分
    const STEPS = 60, LO = -R, HI = R;
    let prevD = LO, prevV = g(LO);
    for (let i=1;i<=STEPS;i++){
      const d = LO + (HI-LO)*i/STEPS, v = g(d);
      if (isFinite(prevV) && isFinite(v)){
        if (prevV === 0) return prevD;
        if ((prevV < 0) !== (v < 0)){
          let l = prevD, r = d, fl = prevV;
          for (let k=0;k<50;k++){
            const m = (l+r)/2, fm = g(m);
            if (!isFinite(fm)) break;
            if ((fl < 0) !== (fm < 0)) { r = m; } else { l = m; fl = fm; }
          }
          return (l+r)/2;
        }
      }
      prevD = d; prevV = v;
    }
    return NaN;
  };

  const a = [], b = [];
  for (let i=0;i<=N;i++) a.push(gv(i));
  for (let j=0;j<=N;j++) b.push(gv(j));

  const z = [];
  const grid = { X:[], Y:[], Z:[] };
  const val = [];
  const mn = [Infinity,Infinity,Infinity], mx = [-Infinity,-Infinity,-Infinity];
  const track = p => { for (let k=0;k<3;k++){
    if (p[k] < mn[k]) mn[k] = p[k];
    if (p[k] > mx[k]) mx[k] = p[k]; } };

  for (let j=0;j<=N;j++){
    const row = [];
    const rx=[],ry=[],rz=[];
    for (let i=0;i<=N;i++){
      const d = solveDep(a[i], b[j]);
      row.push(d);
      if (isFinite(d)) val.push(d);
      const p=[0,0,0]; p[iA]=a[i]; p[iB]=b[j]; p[iD]=d;
      if (isFinite(d)) track(p);
      rx.push(p[0]); ry.push(p[1]); rz.push(p[2]);
    }
    z.push(row); grid.X.push(rx); grid.Y.push(ry); grid.Z.push(rz);
  }

  let vmin=Infinity, vmax=-Infinity;
  val.forEach(v=>{ if(v<vmin)vmin=v;if(v>vmax)vmax=v; });
  if(!isFinite(vmin)){ vmin=0; vmax=1; }

  const traces = [];
  if (VIEW === 'heat'){
    traces.push({ type:'heatmap', x:a, y:b, z, zmin:vmin, zmax:vmax, colorscale:'Viridis',
      colorbar:{title:{text:dep,side:'right'}},
      hovertemplate:`${A}=%{x}<br>${B}=%{y}<br>${dep}=%{z:.4f}<extra></extra>` });
  } else {
    const s = { type:'surface', x:grid.X, y:grid.Y, z:grid.Z,
      colorscale:'Viridis',
      opacity: VIEW==='wire' ? 0.30 : 1,
      lighting:{ ambient:0.62, diffuse:0.85, specular:0.25, roughness:0.9 },
      showscale:false,
      hovertemplate:`x=%{x:.3f}<br>y=%{y:.3f}<br>z=%{z:.3f}<extra></extra>` };
    if (VIEW !== 'wire') s.contours = { z:{ show:true, usecolormap:true, width:1.6 } };
    traces.push(s);
  }

  if (VIEW === 'contour'){
    traces.push({ type:'surface', x:a, y:b, z, showscale:false, opacity:0.14,
      colorscale:'Viridis', hoverinfo:'skip',
      contour:{ show:true, size:1.0, width:3, color:'#fff' } });
    traces.push({ type:'contour', x:a, y:b, z, autocontour:true, ncontours:12, colorscale:'Viridis',
      line:{width:1.5}, showscale:true, colorbar:{title:{text:dep,side:'right'}},
      hovertemplate:`${A}=%{x}<br>${B}=%{y}<br>${dep}=%{z:.3f}<extra></extra>` });
  }

  // 关键剖切线：过 free=0 的两个主截面
  if (document.getElementById('cb-slices').checked && VIEW !== 'heat'){
    const line = (fixedVar, otherVar) => {
      const cx=[],cy=[],cz=[];
      for (let i=0;i<=N;i++){
        const u = -R + 2*R*i/N;
        const p=[0,0,0]; p[VARS.indexOf(fixedVar)]=0; p[VARS.indexOf(otherVar)]=u;
        p[iD] = solveDep(VARS[iA]===fixedVar?0:u, VARS[iB]===fixedVar?0:u);
        cx.push(p[0]); cy.push(p[1]); cz.push(p[2]);
      }
      return { cx, cy, cz };
    };
    [line(A,B), line(B,A)].forEach((s,i)=>{
      traces.push({ type:'scatter3d', mode:'lines', x:s.cx, y:s.cy, z:s.cz,
        line:{ width:4, color: i===0 ? '#f778ba' : '#ffb454' },
        name: i===0 ? `截线 ${B}=0` : `截线 ${A}=0`, hoverinfo:'skip' });
    });
  }

  // 三个真实坐标轴的范围
  const ranges = [];
  for (let k=0;k<3;k++){
    let lo = mn[k], hi = mx[k];
    if (!isFinite(lo) || !isFinite(hi)){ lo = -R; hi = R; }
    const pad = Math.max((hi-lo)*0.08, 0.12);
    ranges.push([lo-pad, hi+pad]);
  }

  return { traces, ranges, kind:'surface',
    info:`显式曲面：${dep} = f(${A}, ${B})${needSolve?'（非线性，用二分法数值求根）':''}　|　因变量 <b>${dep}</b> 自动识别　|　绘图域 ±${R}` };
}


/**
 * 柱面：方程只含 2 个变量且「dep 只线性出现」→ 曲线沿 axis 方向无限延伸。
 * 例：z = x²（抛物柱面，沿 y 无界）、z = sin(x)、y² = 2x。
 * 做法：在 (free, dep) 平面解出母线，再沿 axis 拉伸成网格。
 */
/**
 * 柱面：方程只含 2 个变量（x²+y²=4、x²/4+y²/9=1、x²−y²=1、z=x²、y²=2x…）。
 * 几何本质：平面曲线 F(u,v)=0 沿第三个轴方向无界延伸 —— 这才是真正的「柱面」。
 * 做法：① 在 (u,v) 平面用 marching squares 提取等值线 F=0；
 *       ② 把轮廓顶点沿 axis 方向拉伸成管状面片（mesh3d，共享顶点 → 光滑着色）。
 */
function buildCylinder(F, all, axis, R, N){
  const fn = compile(F, VARS);
  const [u,v] = all;
  const iu = VARS.indexOf(u), iv = VARS.indexOf(v), ia = VARS.indexOf(axis);
  const M = Math.max(24, Math.min(N, 180));
  const gu = i => -R + 2*R*i/M, gv = j => -R + 2*R*j/M;

  // —— ① 在 (u,v) 平面采样 F ——
  const val = [];
  for (let j=0;j<=M;j++){
    const row = [];
    for (let i=0;i<=M;i++){
      const p=[0,0,0]; p[iu]=gu(i); p[iv]=gv(j);
      row.push(fn(p));
    }
    val.push(row);
  }

  // —— marching squares：提取等值线段（按网格边编号共享顶点）——
  const V2 = [];                       // 轮廓顶点的 (u,v)
  const vmap = new Map();
  const edgeVert = (key, pa, pb, va, vb) => {
    if (vmap.has(key)) return vmap.get(key);
    let t = 0.5;
    if (isFinite(va) && isFinite(vb) && Math.abs(vb-va) > 1e-14) t = va/(va-vb);
    if (!isFinite(t)) t = 0.5;
    t = Math.max(0, Math.min(1, t));
    const idx = V2.length;
    V2.push([pa[0]+(pb[0]-pa[0])*t, pa[1]+(pb[1]-pa[1])*t]);
    vmap.set(key, idx);
    return idx;
  };
  const NEG = v => isFinite(v) && v < 0;
  const segs = [];
  for (let j=0;j<M;j++) for (let i=0;i<M;i++){
    const p0=[gu(i),gv(j)],   p1=[gu(i+1),gv(j)],   p2=[gu(i+1),gv(j+1)], p3=[gu(i),gv(j+1)];
    const v0=val[j][i], v1=val[j][i+1], v2=val[j+1][i+1], v3=val[j+1][i];
    const cs = (NEG(v0)?1:0)|(NEG(v1)?2:0)|(NEG(v2)?4:0)|(NEG(v3)?8:0);
    if (cs===0 || cs===15) continue;
    const E = [
      () => edgeVert('h'+i+'_'+j,     p0,p1,v0,v1),   // e0 下边
      () => edgeVert('v'+(i+1)+'_'+j, p1,p2,v1,v2),   // e1 右边
      () => edgeVert('h'+i+'_'+(j+1), p3,p2,v3,v2),   // e2 上边
      () => edgeVert('v'+i+'_'+j,     p0,p3,v0,v3)    // e3 左边
    ];
    let pairs = null;
    switch(cs){
      case 1:  pairs=[[3,0]]; break;
      case 2:  pairs=[[0,1]]; break;
      case 3:  pairs=[[3,1]]; break;
      case 4:  pairs=[[1,2]]; break;
      case 6:  pairs=[[0,2]]; break;
      case 7:  pairs=[[3,2]]; break;
      case 8:  pairs=[[2,3]]; break;
      case 9:  pairs=[[0,2]]; break;
      case 11: pairs=[[1,2]]; break;
      case 12: pairs=[[3,1]]; break;
      case 13: pairs=[[0,1]]; break;
      case 14: pairs=[[3,0]]; break;
      case 5: case 10: {                    // 鞍形点：用中心值消歧
        const c = (v0+v1+v2+v3)/4;
        if (cs===5)  pairs = NEG(c) ? [[0,1],[2,3]] : [[0,3],[1,2]];
        else         pairs = NEG(c) ? [[0,3],[1,2]] : [[0,1],[2,3]];
        break; }
    }
    for (const pr of pairs) segs.push([E[pr[0]](), E[pr[1]]()]);
  }
  if (!segs.length) throw new Error('该定义域内没有找到零等值线，请调整绘图域或方程。');

  // —— ② 沿 axis 方向拉伸成管状面片 ——
  const vX=[],vY=[],vZ=[],vI=[],vJ=[],vK=[],vC=[];
  const ring = new Map();
  // 每个母线顶点预计算「沿母线的归一弧长参数 s ∈ [0,1]」用于着色
  const sOf = new Map();
  {
    // 按 segs 顺序累计母线弧长 → 归一化参数 s ∈ [0,1]，用作着色依据
    const lens = segs.map(sg => Math.hypot(V2[sg[0]][0]-V2[sg[1]][0], V2[sg[0]][1]-V2[sg[1]][1]));
    const total = lens.reduce((a,b)=>a+b, 0) || 1;
    let acc = 0;
    for (let i=0;i<segs.length;i++){
      const sg = segs[i];
      if (!sOf.has(sg[0])) sOf.set(sg[0], acc/total);
      acc += lens[i];
      if (!sOf.has(sg[1])) sOf.set(sg[1], acc/total);
    }
  }
  const ringPt = idx => {
    if (ring.has(idx)) return ring.get(idx);
    const cv = V2[idx];
    const s = sOf.get(idx) || 0;
    const mk = w => { const p=[0,0,0]; p[iu]=cv[0]; p[iv]=cv[1]; p[ia]=w;
      vX.push(p[0]); vY.push(p[1]); vZ.push(p[2]);
      vC.push(s); return vX.length-1; };
    const r = [mk(-R), mk(R)];
    ring.set(idx, r);
    return r;
  };
  for (const sg of segs){
    const ra = ringPt(sg[0]), rb = ringPt(sg[1]);
    vI.push(ra[0]); vJ.push(rb[0]); vK.push(rb[1]);
    vI.push(ra[0]); vJ.push(rb[1]); vK.push(ra[1]);
  }

  const isXY = (u==='x' && v==='y');
  const gxs = []; for (let i=0;i<=M;i++) gxs.push(gu(i));
  const gys = []; for (let j=0;j<=M;j++) gys.push(gv(j));

  const mesh = { type:'mesh3d', x:vX, y:vY, z:vZ, i:vI, j:vJ, k:vK,
    intensity:vC, colorscale:'Viridis', showscale:true, cmin:0, cmax:1,
    colorbar:{title:{text:'母线参数 s',side:'right'}}, name:'柱面 F = 0',
    opacity: VIEW==='wire' ? 0.22 : (VIEW==='mesh' ? 0.34 : 1),
    hovertemplate:'x=%{x:.3f}<br>y=%{y:.3f}<br>z=%{z:.3f}<extra></extra>' };

  const traces = [];
  if (VIEW==='heat' && isXY){
    traces.push({ type:'heatmap', x:gxs, y:gys, z:val, zsmooth:false, colorscale:'Viridis',
      colorbar:{title:{text:'F(x,y)',side:'right'}},
      hovertemplate:'x=%{x}<br>y=%{y}<br>F=%{z:.3f}<extra></extra>' });
  } else if (VIEW==='contour' && isXY){
    traces.push({ type:'contour', x:gxs, y:gys, z:val, autocontour:true, ncontours:12,
      colorscale:'Viridis', showscale:true, colorbar:{title:{text:'F=0',side:'right'}},
      line:{width:2}, hovertemplate:'x=%{x}<br>y=%{y}<br>F=%{z:.3f}<extra></extra>' });
  } else {
    traces.push(mesh);
  }

  // 母线：axis=0 平面上的截面轮廓
  const lx=[],ly=[],lz=[];
  for (const sg of segs){
    for (const idx of sg){
      const p=[0,0,0]; p[iu]=V2[idx][0]; p[iv]=V2[idx][1]; p[ia]=0;
      lx.push(p[0]); ly.push(p[1]); lz.push(p[2]);
    }
    lx.push(null); ly.push(null); lz.push(null);
  }
  traces.push({ type:'scatter3d', mode:'lines', x:lx, y:ly, z:lz,
    line:{width:4,color:'#ffb454'}, name:`母线（${axis}=0 截面）`, hoverinfo:'skip' });

  // 坐标范围
  const lo = [], hi = [];
  for (let k=0;k<3;k++){
    let mn=Infinity, mx=-Infinity;
    for (let n=0;n<vX.length;n++){ const val2=[vX[n],vY[n],vZ[n]][k];
      if (val2<mn) mn=val2; if (val2>mx) mx=val2; }
    if (!isFinite(mn)){ mn=-R; mx=R; }
    lo.push(mn); hi.push(mx);
  }
  const pad = 0.06;
  const rg = [0,1,2].map(k=>[lo[k]-Math.max((hi[k]-lo[k])*pad,1e-6),
                            hi[k]+Math.max((hi[k]-lo[k])*pad,1e-6)]);

  return { traces, ranges:rg, kind:'surface',
    info:`柱面：方程只含 <b>${all.join('、')}</b> → 平面曲线沿 <b>${axis} 轴</b>无界延伸　|　<b>${classifyCylinder(F, all, axis)}</b>　|　橙色为母线（${axis}=0 截面）` };
}


/**
 * 旋转曲面：方程只含 2 个变量时，几何是「该平面内的曲线」绕剩余坐标轴旋转。
 * 例：x²+y²=4 → 绕 z 轴的圆柱面；x = x²+y² → 绕 x 轴的抛物面。
 * 做法：在含轴变量的截面内先解出轮廓线 r = r(axis)，再绕轴旋转成网格。
 */
/**
 * 旋转曲面：方程只含 2 个变量时，几何是「母线」绕某个坐标轴旋转。
 * 例：x = x²+y² → 绕 x 轴旋转 → x = x² + y² + z²（球面）
 *     x = x²−y² → 绕 x 轴旋转 → 单叶双曲面
 * 做法：① 在 (axis, radial) 截面内解出母线 r = r(axis)（r ≥ 0）；
 *       ② 绕 axis 轴旋转成网格。
 * 注意：旋转轴是因变量（dep），径向变量是方程中的另一个变量，第三个变量作第二径向分量。
 */
/**
 * 旋转曲面：方程只含 2 个变量时，几何是「母线」绕某个坐标轴旋转。
 * 例：x = x²+y² → 绕 x 轴旋转 → x = x² + y² + z²（球面）
 *     x = x²−y² → 绕 x 轴旋转 → x = x² − y² − z²（单叶双曲面）
 * 做法：① 沿轴向 t 扫描，对每个 t 在 r ≥ 0 上求根 F(t, r) = 0（变号 + 二分）；
 *       ② 丢弃无解的 t，把剩余有效段切成若干「分支」；
 *       ③ 每个分支绕 dep 轴旋转成网格，轴向范围按实际顶点算，不再被绘图域撑开。
 */
function buildRevolve(F, dep, all, R, N){
  const fn = compile(F, VARS);
  const iA = VARS.indexOf(dep);                       // 旋转轴
  const radial = all.find(v => v !== dep);            // 径向变量
  const iR = VARS.indexOf(radial);
  const other  = VARS.find(v => v !== dep && v !== radial);
  const iO = VARS.indexOf(other);

  // 径向求根：返回 t 处所有非负根
  const solveR = (t, RS, NR) => {
    const g = r => { const q=[0,0,0]; q[iA]=t; q[iR]=r; q[iO]=0; return fn(q); };
    const roots = [];
    let pr = 0, pv = g(0);
    if (!isFinite(pv)) return roots;
    if (Math.abs(pv) < 1e-11) roots.push(0);
    for (let i=1;i<=NR;i++){
      const r = RS*i/NR, v = g(r);
      if (!isFinite(v)){ pr = r; pv = v; continue; }
      if (Math.abs(v) < 1e-11) roots.push(r);
      else if (isFinite(pv) && (pv < 0) !== (v < 0)){
        let lo = pr, hi = r, flo = pv;
        for (let k=0;k<52;k++){
          const m = (lo+hi)/2, fm = g(m);
          if (!isFinite(fm)) break;
          if ((flo < 0) !== (fm < 0)) hi = m; else { lo = m; flo = fm; }
        }
        roots.push((lo+hi)/2);
      }
      pr = r; pv = v;
    }
    roots.sort((a,b) => a-b);
    const uniq = [];
    for (const r of roots) if (!uniq.length || Math.abs(r - uniq[uniq.length-1]) > 1e-6) uniq.push(r);
    return uniq;
  };

  // 轴向扫描 + 连续性跟踪（选与上一个 r 最接近的根，避免跳分支）
  const scan = (RS, NT, NR) => {
    const rows = [];
    let prevR = null;
    for (let k=0;k<=NT;k++){
      const t = -R + 2*R*k/NT;
      const roots = solveR(t, RS, NR);
      if (!roots.length){ rows.push({t, r:NaN}); prevR = null; continue; }
      let r = roots[0];
      if (prevR !== null){
        let best = Infinity;
        for (const c of roots){ const d = Math.abs(c - prevR); if (d < best){ best = d; r = c; } }
      }
      rows.push({t, r});
      prevR = r;
    }
    return rows;
  };

  let RS = Math.max(R, 1), NT = 220, NR = 180;
  let rows = scan(RS, NT, NR);
  let valid = rows.filter(x => isFinite(x.r));
  if (valid.length < 2){                       // 绘图域太小 → 放宽径向搜索
    RS = R * 8; NT = 420; NR = 260;
    rows = scan(RS, NT, NR);
    valid = rows.filter(x => isFinite(x.r));
  }
  if (valid.length < 2) throw new Error('未能在该定义域内解出旋转轮廓，请调整绘图域。');

  // 切成连续分支
  const runs = [];
  let cur = null;
  for (const row of rows){
    if (isFinite(row.r)){ if (!cur){ cur = []; runs.push(cur); } cur.push(row); }
    else cur = null;
  }
  const branches = runs.filter(r => r.length >= 2);
  if (!branches.length) throw new Error('未能在该定义域内解出旋转轮廓，请调整绘图域。');

  const TH = 96;
  const traces = [];
  const mn=[Infinity,Infinity,Infinity], mx=[-Infinity,-Infinity,-Infinity];
  const track = c => { for (let t=0;t<3;t++){ if (c[t]<mn[t]) mn[t]=c[t]; if (c[t]>mx[t]) mx[t]=c[t]; } };

  branches.forEach((br, bi) => {
    const X=[],Y=[],Z=[];
    for (const row of br){
      const rx=[],ry=[],rz=[];
      for (let j=0;j<=TH;j++){
        const th = 2*Math.PI*j/TH;
        const q=[0,0,0];
        q[iA] = row.t;
        q[iR] = row.r*Math.cos(th);
        q[iO] = row.r*Math.sin(th);
        rx.push(q[0]); ry.push(q[1]); rz.push(q[2]);
        track(q);
      }
      X.push(rx); Y.push(ry); Z.push(rz);
    }
    traces.push({ type:'surface', x:X, y:Y, z:Z, colorscale:'Viridis',
      opacity: VIEW==='wire' ? 0.32 : 1, showscale:false,
      lighting:{ambient:0.62,diffuse:0.85,specular:0.25,roughness:0.9},
      hovertemplate:`x=%{x:.3f}<br>y=%{y:.3f}<br>z=%{z:.3f}<extra></extra>` });

    // 母线（θ=0 截面）
    const lx=[],ly=[],lz=[];
    for (const row of br){
      const q=[0,0,0]; q[iA]=row.t; q[iR]=row.r; q[iO]=0;
      lx.push(q[0]); ly.push(q[1]); lz.push(q[2]);
    }
    traces.push({ type:'scatter3d', mode:'lines+markers', x:lx, y:ly, z:lz,
      line:{width:4,color:'#ffb454'}, marker:{size:2,color:'#ffb454'},
      name:`母线（绕 ${dep} 轴）`,
      hovertemplate:'x=%{x:.3f}<br>y=%{y:.3f}<br>z=%{z:.3f}<extra></extra>' });
  });

  // 三个真实坐标轴的范围
  const ranges=[];
  for (let k=0;k<3;k++){
    let lo=mn[k], hi=mx[k];
    if (!isFinite(lo)||!isFinite(hi)){ lo=-R; hi=R; }
    const pad=Math.max((hi-lo)*0.08, 0.12);
    ranges.push([lo-pad,hi+pad]);
  }

  const extra = branches.length > 1 ? `（${branches.length} 个分支）` : '';
  return { traces, ranges, kind:'surface',
    info:`旋转曲面：方程只含 <b>${all.join('、')}</b>，母线绕 <b>${dep} 轴</b>旋转得到${extra}　|　橙色为母线` };
}



/** 等值面提取（marching tetrahedra，稳定无歧义） */
/**
 * 等值面提取（marching tetrahedra）
 * 立方体按 6 个四面体剖分 → 每个四面体按符号变化切出 1~2 个三角形。
 * 无二义性，边界处不会出现开口裂缝。
 */
function buildImplicit(F, R, N){
  const fn = compile(F, VARS);
  const g = i => -R + 2*R*i/N;
  const ax = []; for (let i=0;i<=N;i++) ax.push(g(i));

  const vX=[],vY=[],vZ=[],vI=[],vJ=[],vK=[],vC=[];
  const TET = [
    [0,1,3,7],[0,3,2,7],[0,2,6,7],[0,6,4,7],[0,4,5,7],[0,5,1,7],
    [1,2,3,5],[1,5,6,2],[2,6,3,7],[2,7,5,6],[3,6,2,7],[3,7,5,6]
  ];
  const C=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];

  // 四面体 4 个顶点的「边交点」：同一格内的重复边要复用同一顶点，避免裂缝
  const pushPoint=(a,b,pa,pb)=>{
    const d=b-a, t=Math.abs(d)<1e-12?0.5:a/(a-b);
    const x=pa[0]+(pb[0]-pa[0])*t, y=pa[1]+(pb[1]-pa[1])*t, z=pa[2]+(pb[2]-pa[2])*t;
    const i=vX.length;
    vX.push(x); vY.push(y); vZ.push(z);
    vC.push(Math.sqrt(x*x+y*y+z*z));
    return i;
  };
  const tri=(a,b,c)=>{ vI.push(a); vJ.push(b); vK.push(c); };

  for (let i=0;i<N;i++) for (let j=0;j<N;j++) for (let k=0;k<N;k++){
    const pv = C.map(c => [ax[i+c[0]], ax[j+c[1]], ax[k+c[2]]]);
    const fv = C.map(c => fn([ax[i+c[0]], ax[j+c[1]], ax[k+c[2]]]));
    let neg=0; fv.forEach(v=>{ if(v<0) neg++; });
    if (neg===0 || neg===8) continue;

    TET.forEach(tet=>{
      const f4 = tet.map(t=>fv[t]);
      let n2=0; f4.forEach(v=>{ if(v<0) n2++; });
      if (n2===0 || n2===4) return;
      // 四面体 6 条边：找出符号不同的边上的交点
      const pts = [];
      for (let a=0;a<4;a++){
        for (let b=a+1;b<4;b++){
          if ((f4[a]<0) !== (f4[b]<0)) pts.push(pushPoint(f4[a], f4[b], pv[tet[a]], pv[tet[b]]));
        }
      }
      if (pts.length===3) tri(pts[0],pts[1],pts[2]);
      else if (pts.length===4){
        // 4 点 → 剖成 2 个三角形（按到质心距离排序，避免自交）
        const cx=(pts[0]+pts[1]+pts[2]+pts[3])/4;
        const order = pts.map((p,idx)=>({p,idx,d:Math.abs(p-cx)})).sort((x,y)=>x.d-y.d);
        tri(order[0].p, order[1].p, order[2].p);
        tri(order[0].p, order[2].p, order[3].p);
      }
    });
  }
  if (!vI.length) throw new Error('该定义域内没有找到零等值面，请调整绘图域或方程。');

  const traces = [{
    type:'mesh3d', x:vX, y:vY, z:vZ, i:vI, j:vJ, k:vK,
    intensity:vC, colorscale:'Viridis', flatshading:false, showscale:true,
    colorbar:{title:{text:'|r|',side:'right'}}, name:'等值面 F = 0',
    opacity: VIEW==='wire' ? 0.22 : (VIEW==='mesh' ? 0.34 : 0.95),
    hovertemplate:'x=%{x:.3f}<br>y=%{y:.3f}<br>z=%{z:.3f}<extra></extra>'
  }];

  return { traces, ranges:[[-R,R],[-R,R],[-R,R]], kind:'implicit',
    info:`隐式等值面：F(x,y,z) = 0　|　${vI.length} 个三角面片（marching tetrahedra 提取）　|　在给定定义域内的零等值面` };
}


/** 曲面 z=f(x,y) */
function buildSurface(){
  const R = parseFloat(document.getElementById('sf-range').value);
  const N = parseInt(document.getElementById('sf-n').value);
  const fn = compile(document.getElementById('f-sf').value, ['x','y']);
  const ax=[]; for(let i=0;i<=N;i++) ax.push(-R + 2*R*i/N);
  const z=[]; for(let j=0;j<=N;j++){ const r=[]; for(let i=0;i<=N;i++) r.push(fn([ax[i],ax[j]])); z.push(r); }

  let vmin=Infinity,vmax=-Infinity; z.forEach(r=>r.forEach(v=>{if(v<vmin)vmin=v;if(v>vmax)vmax=v;}));
  if(!isFinite(vmin)){vmin=0;vmax=1;}

  const traces=[];
  if(VIEW==='heat'){
    traces.push({type:'heatmap',x:ax,y:ax,z,zmin:vmin,zmax:vmax,colorscale:'Viridis',
      colorbar:{title:{text:'z',side:'right'}},hovertemplate:'x=%{x}<br>y=%{y}<br>z=%{z:.3f}<extra></extra>'});
  }else{
    const s={type:'surface',x:ax,y:ax,z,colorscale:'Viridis',opacity:VIEW==='wire'?0.3:1,
      showscale:false, lighting:{ambient:0.62,diffuse:0.85,specular:0.25,roughness:0.9},
      hovertemplate:'x=%{x:.2f}<br>y=%{y:.2f}<br>z=%{z:.3f}<extra></extra>'};
    if(VIEW!=='wire') s.contours={z:{show:true,usecolormap:true,project:{z:true},width:1.6}};
    traces.push(s);
  }
  if(VIEW==='contour'){
    traces.push({type:'surface',x:ax,y:ax,z,showscale:false,opacity:0.14,colorscale:'Viridis',hoverinfo:'skip',
      contour:{show:true,project:{z:true},size:1,width:3,color:'#fff'}});
    traces.push({type:'contour',x:ax,y:ax,z,autocontour:true,ncontours:12,colorscale:'Viridis',
      line:{width:1.5},showscale:true,colorbar:{title:{text:'z',side:'right'}},
      hovertemplate:'x=%{x}<br>y=%{y}<br>z=%{z:.3f}<extra></extra>'});
  }
  return { traces, ranges:[[-R,R],[-R,R],[null,null]], kind:'surface',
    info:`曲面模式：z = f(x, y)　|　定义域 [-${R}, ${R}]²　|　切到「等高线投影」看水平截线形状` };
}

/** 参数曲线 */
function buildParam(){
  const tmax = parseFloat(document.getElementById('p-range').value);
  const N=900;
  const fx=compile(document.getElementById('f-px').value,['t']);
  const fy=compile(document.getElementById('f-py').value,['t']);
  const fz=compile(document.getElementById('f-pz').value,['t']);
  const x=[],y=[],z=[],tt=[];
  for(let i=0;i<=N;i++){
    const t = tmax*i/N;
    const a=fx([t]),b=fy([t]),c=fz([t]);
    if([a,b,c].every(v=>typeof v==='number'&&isFinite(v))){x.push(a);y.push(b);z.push(c);tt.push(t);}
  }
  if(x.length<2) throw new Error('该区间内没有有效点，试试把 t 的范围调大。');
  const all=[...x,...y,...z], lo=Math.min(...all), hi=Math.max(...all);
  const pad=Math.max((hi-lo)*0.08,0.5);
  const traces=[{type:'scatter3d',mode:'lines+markers',x,y,z,
    line:{width:6,color:'#4da3ff'},marker:{size:1.6,color:'#ffb454'},
    name:'参数曲线',text:tt,
    hovertemplate:'t=%{text:.3f}<br>x=%{x:.4f}<br>y=%{y:.4f}<br>z=%{z:.4f}<extra></extra>'}];
  traces.push({type:'scatter3d',mode:'markers+text',x:[x[0]],y:[y[0]],z:[z[0]],
    marker:{size:9,color:'#3fb950'},text:['起点 t=0'],textposition:'top center',
    textfont:{size:11,color:'#3fb950'},hoverinfo:'skip',showlegend:false});
  traces.push({type:'scatter3d',mode:'markers+text',x:[x[x.length-1]],y:[y[y.length-1]],z:[z[z.length-1]],
    marker:{size:9,color:'#f85149'},text:['终点'],textposition:'top center',
    textfont:{size:11,color:'#f85149'},hoverinfo:'skip',showlegend:false});
  if(VIEW!=='contour'){
    const proj=(a,b,col,name)=>({type:'scatter3d',mode:'lines',x:a,y:b,
      z:new Array(a.length).fill(lo-pad*1.5),line:{width:2,color:col,dash:'dot'},
      opacity:0.5,name,hoverinfo:'skip'});
    traces.push(proj(x,y,'#3fb950','xOy 投影'));
    traces.push(proj(x,z,'#ffb454','xOz 投影'));
    traces.push(proj(y,z,'#f778ba','yOz 投影'));
  }
  return { traces, ranges:[[lo-pad,hi+pad],[lo-pad,hi+pad],[lo-pad,hi+pad]], kind:'param',
    info:`参数曲线：t ∈ [0, ${tmax.toFixed(2)}]，${x.length} 个采样点　|　虚线为三个坐标面上的投影` };
}

/** 参数曲面 x=f(u,v) y=g(u,v) z=h(u,v) */
function buildParam2(){
  const R=parseFloat(document.getElementById('p2-range').value);
  const N=70;
  const fx=compile(document.getElementById('f-px2').value,['u','v']);
  const fy=compile(document.getElementById('f-py2').value,['u','v']);
  const fz=compile(document.getElementById('f-pz2').value,['u','v']);
  const ax=[]; for(let i=0;i<=N;i++) ax.push(-R + 2*R*i/N);
  const X=[],Y=[],Z=[];
  for(let i=0;i<=N;i++){
    const rx=[],ry=[],rz=[];
    for(let j=0;j<=N;j++){ rx.push(fx([ax[i],ax[j]])); ry.push(fy([ax[i],ax[j]])); rz.push(fz([ax[i],ax[j]])); }
    X.push(rx); Y.push(ry); Z.push(rz);
  }
  const all=[...X,...Y,...Z].filter(v=>isFinite(v));
  const lo=Math.min(...all), hi=Math.max(...all), pad=Math.max((hi-lo)*0.06,0.5);
  const traces=[{type:'surface',x:X,y:Y,z:Z,colorscale:'Viridis',opacity:VIEW==='wire'?0.3:1,
    lighting:{ambient:0.62,diffuse:0.85,specular:0.25,roughness:0.9},showscale:false,
    lighting2:null,
    hovertemplate:'x=%{x:.3f}<br>y=%{y:.3f}<br>z=%{z:.3f}<extra></extra>'}];
  return { traces, ranges:[[lo-pad,hi+pad],[lo-pad,hi+pad],[lo-pad,hi+pad]], kind:'surface',
    info:`参数曲面：r(u,v) = (f, g, h)，u,v ∈ [-${R}, ${R}]` };
}

/* ============================================================
   3. 渲染
   ============================================================ */
/** 统一渲染分析面板 */
function updateAnalyzeBox(ana){
  let tag;
  if (ana.kind === 'cylinder')
    tag = `<span class="tag t3">柱面</span>方程只含 <b>${ana.all.join('、')}</b> → 母线沿 <b>${ana.axis} 轴</b>无界平移延伸`;
  else if (ana.revolve)
    tag = `<span class="tag t3">旋转曲面</span>方程只含 <b>${ana.all.join('、')}</b> → 母线绕 <b>${ana.dep} 轴</b>旋转得到`;
  else if (ana.kind === 'explicit')
    tag = `<span class="tag t1">可解出因变量</span><b>${ana.dep}</b> 是因变量，自变量 <b>${ana.free.join(', ')}</b> → 精确曲面绘制`;
  else
    tag = `<span class="tag t2">无法解出因变量</span>各变量非线性耦合 → 采用<b>等值面提取</b>`;
  document.getElementById('analyze').innerHTML =
    `${tag}<br>标准化：<code>${ana.F}</code> = 0<br>形如：<b>${ana.kind==='cylinder' ? classifyCylinder(ana.F, ana.all, ana.axis) : classify(ana.F)}</b>`;
}

let MODE='eq', VIEW='surface';

const AXIS = { showgrid:true, gridcolor:'#2a3441', zerolinecolor:'#4a5766', zerolinewidth:2,
  showbackground:true, backgroundcolor:'#0b0f16', nticks:9,
  title:{font:{size:13,color:'#8b98a9'}}, tickfont:{size:10,color:'#6b7a8d'} };
const LAYOUT = {
  paper_bgcolor:'#0d1117', plot_bgcolor:'#0d1117',
  font:{family:'Microsoft YaHei, Segoe UI', color:'#e6edf3'},
  margin:{l:0,r:0,t:10,b:0},
  legend:{bgcolor:'rgba(22,27,34,.78)',bordercolor:'#2a3441',borderwidth:1,font:{size:11}},
  scene:{ xaxis:{...AXIS,title:{text:'x',font:{size:13,color:'#8b98a9'}}},
          yaxis:{...AXIS,title:{text:'y',font:{size:13,color:'#8b98a9'}}},
          zaxis:{...AXIS,title:{text:'z',font:{size:13,color:'#8b98a9'}}},
          aspectmode:'cube', camera:{eye:{x:1.65,y:1.5,z:1.0}} }
};

function render(){
  const btn=document.getElementById('render');
  btn.textContent='⏳ 计算中…';
  document.getElementById('msg').className='msg';
  setTimeout(()=>{
    try{
      let r, ana=null;
      if(MODE==='eq'){
        const raw=document.getElementById('f-eq').value;
        ana=analyzeEquation(raw);
        const R=parseFloat(document.getElementById('eq-range').value);
        let N=parseInt(document.getElementById('eq-res').value);
        if(ana.kind==='explicit' && !ana.revolve){ r=buildExplicit(ana.F, ana.dep, ana.free, R, Math.min(N,140)); }
        else if(ana.kind==='cylinder'){ r=buildCylinder(ana.F, ana.all, ana.axis, R, Math.min(N,140)); }
        else if(ana.revolve){ r=buildRevolve(ana.F, ana.dep, ana.all, R, Math.min(N,140)); }
        else { r=buildImplicit(ana.F, R, Math.min(N,50)); }
        // 分析面板
        updateAnalyzeBox(ana);
      }
      else if(MODE==='surface')     r=buildSurface();
      else if(MODE==='param')      r=buildParam();
      else                          r=buildParam2();

      const showAxis=document.getElementById('cb-axis').checked;
      const layout=JSON.parse(JSON.stringify(LAYOUT));
      ['xaxis','yaxis','zaxis'].forEach(k=>{
        layout.scene[k].showgrid=showAxis; layout.scene[k].showbackground=showAxis; layout.scene[k].zeroline=showAxis;
      });
      r.ranges.forEach((rg,i)=>{ if(rg && rg[0]!==null) layout.scene[['xaxis','yaxis','zaxis'][i]].range=rg; });

      Plotly.react('plot', r.traces, layout, {
        displaylogo:false, responsive:true,
        modeBarButtonsToRemove:['toImage'], toImageButtonOptions:{format:'png',scale:2}
      });
      document.getElementById('viewInfo').innerHTML = r.info;
      const m=document.getElementById('msg');
      m.className='msg ok'; m.textContent='✔ 渲染成功';
      // 移动端：单列布局下图形在控制栏下方，生成后自动滚到图形区
      if (window.matchMedia('(max-width:820px)').matches && !window.__noAutoScroll){
        const stage = document.querySelector('.panel.stage');
        if (stage) stage.scrollIntoView({behavior:'smooth', block:'start'});
      }
    }catch(err){
      console.error(err);
      const m=document.getElementById('msg');
      m.className='msg err'; m.textContent='✘ ' + (err && err.message ? err.message : err);
      document.getElementById('viewInfo').innerHTML='出错了，修正公式后重新生成。';
    }
    btn.textContent='▶ 生成图形';
  }, 30);
}

/* ============================================================
   4. 交互
   ============================================================ */
const MODE_VIEWS = { eq:['surface','wire','contour','heat','mesh'], surface:['surface','wire','contour','heat'],
                     param:['surface'], param2:['surface','wire'] };

/* ---------- 主页级 tab：实验室 / 说明 ---------- */
document.querySelectorAll('.maintab').forEach(t=>{
  t.onclick=()=>{
    document.querySelectorAll('.maintab').forEach(x=>x.classList.remove('on'));
    t.classList.add('on');
    const page = t.dataset.page;
    document.getElementById('page-lab').classList.toggle('on', page==='lab');
    document.getElementById('page-doc').classList.toggle('on', page==='doc');
    window.scrollTo({top:0, behavior:'smooth'});
    // 回到实验室时图表容器尺寸会变，需要重绘以适配新宽高
    if (page==='lab') setTimeout(()=>{ try{ Plotly.Plots.resize(document.getElementById('plot')); }catch(e){} }, 60);
  };
});

document.querySelectorAll('.tab').forEach(t=>{
  t.onclick=()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));
    t.classList.add('on');
    MODE=t.dataset.mode;
    ['eq','surface','param','param2'].forEach(m=>{
      document.getElementById('p-'+m).style.display = (m===MODE)?'block':'none';
    });
    // 视图过滤
    const allowed=MODE_VIEWS[MODE];
    document.querySelectorAll('.vtab').forEach(v=>{
      v.style.display = allowed.includes(v.dataset.view)?'':'none';
    });
    // 若当前视图不被支持，切回第一个
    if(!allowed.includes(VIEW)){
      VIEW=allowed[0];
      document.querySelectorAll('.vtab').forEach(v=>v.classList.toggle('on', v.dataset.view===VIEW));
    }
    render();
  };
});
document.querySelectorAll('.vtab').forEach(t=>{
  t.onclick=()=>{ document.querySelectorAll('.vtab').forEach(x=>x.classList.remove('on'));
    t.classList.add('on'); VIEW=t.dataset.view; render(); };
});
document.getElementById('render').onclick=render;
document.getElementById('cb-axis').onchange=render;
document.getElementById('cb-slices').onchange=render;

const bind=(id,out,fmt,cb)=>{ const e=document.getElementById(id);
  e.oninput=()=>{ document.getElementById(out).textContent=fmt(e.value); };
  e.onchange=cb||render; };
bind('eq-range','eqr',v=>v); bind('eq-range','eqr2',v=>v);
bind('eq-res','eq-n',v=>v);
bind('sf-range','sx1v',v=>'-'+v); bind('sf-range','sx2v',v=>v);
bind('sf-n','n-val',v=>v);
bind('p-range','t1v',v=>'0'); bind('p-range','t2v',v=>(+v).toFixed(2));
bind('p2-range','u1v',v=>'-'+v); bind('p2-range','u2v',v=>v);

document.querySelectorAll('input[type=text]').forEach(i=>{
  i.addEventListener('keydown',e=>{ if(e.key==='Enter') render(); });
});

/* ---------- LaTeX 实时渲染 ---------- */
function refreshAllLatex(){
  renderEquationLatex('latex-eq', document.getElementById('f-eq').value);
  const z = toLatex(document.getElementById('f-sf').value);
  renderLatex('latex-sf', z ? 'z = ' + z : '', true);
  const px = document.getElementById('f-px').value, py = document.getElementById('f-py').value,
        pz = document.getElementById('f-pz').value;
  const txt = [[px,'x'],[py,'y'],[pz,'z']].filter(p=>p[0] && p[0].trim())
                 .map(p=> p[1] + '=' + toLatex(p[0])).join(',\\quad ');
  renderLatex('latex-p', txt, true);
  const qx = document.getElementById('f-px2').value, qy = document.getElementById('f-py2').value,
        qz = document.getElementById('f-pz2').value;
  const txt2 = [[qx,'x'],[qy,'y'],[qz,'z']].filter(p=>p[0] && p[0].trim())
                 .map(p=> p[1] + '=' + toLatex(p[0])).join(',\\quad ');
  renderLatex('latex-p2', txt2, true);
}

// 每个公式输入框实时更新排版
document.getElementById('f-eq').addEventListener('input',()=>{
  renderEquationLatex('latex-eq', document.getElementById('f-eq').value);
  try{ updateAnalyzeBox(analyzeEquation(document.getElementById('f-eq').value)); }catch(e){}
});
document.getElementById('f-sf').addEventListener('input',refreshAllLatex);
['f-px','f-py','f-pz','f-px2','f-py2','f-pz2'].forEach(id=>
  document.getElementById(id).addEventListener('input',refreshAllLatex));

// KaTeX 是 defer 加载，等它就绪后再首次渲染
function whenKatexReady(fn){
  if (window.katex && window.katex.render) return fn();
  let tries = 0;
  const t = setInterval(()=>{
    if (window.katex && window.katex.render){ clearInterval(t); fn(); }
    else if (++tries > 100){ clearInterval(t); fn(); }   // 2.5s 兜底
  }, 25);
}
whenKatexReady(refreshAllLatex);

/* ---------- 预设 ---------- */
const EQ_PRESETS = [
  { group:'柱面（母线沿第三轴平移延伸）', items:[
    ['抛物柱面 · z 向','z = x^2'],
    ['抛物柱面 · y 向','y = x^2'],
    ['抛物柱面 · 开口向下','z = -x^2/2'],
    ['抛物柱面 · 侧向开口','y^2 = 2*x'],
    ['正弦柱面','z = sin(x)'],
    ['双曲柱面 · 标准','x^2 - y^2 = 1'],
    ['双曲柱面 · 缩放','x^2/4 - y^2/9 = 1'],
    ['椭圆柱面','x^2/4 + y^2/9 = 1'],
    ['圆柱面','x^2 + y^2 = 4'],
  ]},
  { group:'旋转曲面（母线绕因变量轴旋转）', items:[
    ['椭圆抛物面','y = x^2 + z^2'],
    ['椭圆锥 · 非齐次','x^2/3 + y^2/2 - z^2 = 0'],
    ['旋转抛物面','x = x^2 + y^2'],
    ['旋转双曲面 · 凸','x = x^2 - y^2'],
    ['旋转曲面 · 倒数型','x = 1/(x^2 + y^2 + 0.5)'],
    ['圆锥','x^2 + y^2 - 4*z^2 = 0'],
    ['球','x^2 + y^2 + z^2 = 9'],
  ]},
  { group:'二次曲面（隐式等值面）', items:[
    ['椭圆锥 · 齐次','x^2/4 + y^2/9 - z^2 = 0'],
    ['椭球','x^2/4 + y^2/9 + z^2/4 = 1'],
    ['单叶双曲面','x^2/4 + y^2/9 - z^2/4 = 1'],
    ['双叶双曲面','z^2/4 - x^2/9 - y^2/4 = 1'],
    ['马鞍面','z = x^2 - y^2'],
    ['平面','x + y + z = 0'],
  ]},
  { group:'特殊曲面（等值面提取）', items:[
    ['环面','(sqrt(x^2+y^2) - 2)^2 + z^2 = 1'],
    ['心形面','(x^2 + 9/4*y^2 + z^2 - 1)^3 - x^2*z^3 - 9/80*y^2*z^3 = 0'],
    ['螺旋面','y = atan2(z, x)'],
    ['正弦波面','z = sin(x)*cos(y)'],
    ['涟漪面','z = sin(sqrt(x^2+y^2))/(sqrt(x^2+y^2)+0.4)'],
  ]},
];
const SF_PRESETS = [
  { group:'常见曲面', items:[
    ['抛物面','x^2 + y^2'],['马鞍面','x^2 - y^2'],['球','sqrt(9 - x^2 - y^2)'],
    ['锥面','sqrt(x^2+y^2)'],['高斯包','exp(-(x^2+y^2)/4)'],
  ]},
  { group:'函数型曲面', items:[
    ['正弦波','sin(x)*cos(y)'],['螺旋面','atan2(y, x)'],['正弦柱面','sin(x)'],
    ['双曲面','x^2 - y^2'],['涟漪面','sin(sqrt(x^2+y^2))/sqrt(x^2+y^2+0.1)'],
  ]},
];
const PP = [
  { group:'经典空间曲线', items:[
    ['螺旋线','cos(t)','sin(t)','t'],['圆环','(2+cos(t))*cos(t)','(2+cos(t))*sin(t)','sin(t)'],
    ['双纽线','sin(t)*cos(t)','sin(t)*sin(t)','cos(2*t)'],['利萨如','cos(t)','sin(t)','sin(3*t)/3'],
    ['三维8字','sin(t)','sin(t)*cos(t)','sin(2*t)/2'],['摆线','t-sin(t)','1-cos(t)','t/4'],
    ['三维螺旋','cos(t)','sin(t)','t/2'],
  ]},
];
const P2P = [
  { group:'参数曲面', items:[
    ['螺旋面','u*cos(v)','u*sin(v)','v'],
    ['旋转抛物面','u','u^2+v^2','v'],
    ['旋转双曲面','u','u^2-v^2','v'],
    ['球面','u*cos(v)','u*sin(v)','sqrt(9-u^2)'],
    ['环面','(2+cos(v))*cos(u)','(2+cos(v))*sin(u)','sin(v)'],
    ['平面网格','u','v','0'],
    ['莫比乌斯带','cos(u/2)*cos(v)+cos(u)*sin(v)*sin(u/2)','sin(u/2)*cos(v)+sin(u)*sin(v)*sin(u/2)','sin(v)'],
    ['高斯曲率面','u*cos(v)','u*sin(v)','u*sin(2*v)'],
  ]},
];

function chips(boxId, groups, setter, withRange){
  const box = document.getElementById(boxId);
  box.innerHTML = '';
  const total = groups.reduce((a,g)=>a+g.items.length, 0);

  const fold = document.createElement('details');
  fold.className = 'preset-fold';
  const sum = document.createElement('summary');
  sum.className = 'preset-sum';
  sum.innerHTML = `案例公式 <span class="preset-count">${total}</span> 个`;
  fold.appendChild(sum);

  const body = document.createElement('div');
  body.className = 'preset-body';

  groups.forEach(g=>{
    const grp = document.createElement('div');
    grp.className = 'preset-group';
    const gt = document.createElement('div');
    gt.className = 'preset-group-title';
    gt.textContent = g.group;
    grp.appendChild(gt);

    const row = document.createElement('div');
    row.className = 'preset-items';
    g.items.forEach(item=>{
      const [name, ...vals] = item;
      const c = document.createElement('button');
      c.type = 'button';
      c.className = 'chip';
      c.textContent = name;                 // 只显示名字
      c.title = vals.join('  ,  ');          // 公式放在悬浮提示里
      c.onclick = ()=>{
        setter(vals);
        if (withRange) withRange();
        refreshAllLatex();
        render();
      };
      row.appendChild(c);
    });
    grp.appendChild(row);
    body.appendChild(grp);
  });

  fold.appendChild(body);
  box.appendChild(fold);
}
chips('presets-eq', EQ_PRESETS, v=>document.getElementById('f-eq').value=v[0]);
chips('presets-sf', SF_PRESETS, v=>document.getElementById('f-sf').value=v[0]);
chips('presets-p', PP, v=>{
  document.getElementById('f-px').value=v[0];
  document.getElementById('f-py').value=v[1];
  document.getElementById('f-pz').value=v[2];
});
chips('presets-p2', P2P, v=>{
  document.getElementById('f-px2').value=v[0];
  document.getElementById('f-py2').value=v[1];
  document.getElementById('f-pz2').value=v[2];
});

render();
