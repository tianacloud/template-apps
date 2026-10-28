/* ============================================================
 * 知食 NutriLens —— 单机营养记录与饮食建议
 * 纯前端：数据存本机 localStorage，照片存单独 key，零上传
 * ============================================================ */

/* ---------------- 工具 ---------------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const pad2 = n => String(n).padStart(2, '0');
const dstr = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const R = n => Math.round(n);
const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };

const K = {
  profile: 'zs_profile_v1',
  meals: 'zs_meals_v1',
  weights: 'zs_weights_v1',
  photo: id => 'zs_ph_' + id
};

const Store = {
  get(k, def) {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; }
    catch (e) { return def; }
  },
  set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { return false; }
  },
  rawSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
  rawGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

/* ---------------- 全局状态 ---------------- */
let profile = Store.get(K.profile, null);
let meals = Store.get(K.meals, []);
let weights = Store.get(K.weights, []);
let viewDate = dstr();

const MEAL_TYPES = [
  { id: 'breakfast', name: '早餐', ico: '🌅', bg: '#FFF4E4' },
  { id: 'lunch', name: '午餐', ico: '☀️', bg: '#EAF6EF' },
  { id: 'dinner', name: '晚餐', ico: '🌙', bg: '#EEF1FF' },
  { id: 'snack', name: '加餐', ico: '🍎', bg: '#FDECEF' }
];
const ACT_OPTS = [
  { v: 1.2, t: '几乎不运动', d: '办公室久坐，日常步数少' },
  { v: 1.375, t: '轻度活动', d: '每周 1–3 次散步或轻运动' },
  { v: 1.55, t: '中度活动', d: '每周 3–5 次运动，每次 30 分钟以上' },
  { v: 1.725, t: '高度活动', d: '体力工作，或几乎每天高强度训练' }
];

/* ---------------- 营养计算 ---------------- */
const Calc = {
  plan(p) {
    const s = p.sex === 'm' ? 5 : -161;
    const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + s;
    const tdee = bmr * p.act;
    let kcal;
    if (p.goal === 'lose') kcal = tdee * 0.82;
    else if (p.goal === 'gain') kcal = tdee * 1.12;
    else kcal = tdee;
    kcal = Math.max(kcal, bmr * 1.1, p.sex === 'm' ? 1500 : 1250);
    kcal = Math.round(kcal / 10) * 10;
    const pk = p.goal === 'lose' ? 1.8 : p.goal === 'gain' ? 1.7 : 1.3;
    const protein = Math.round(p.weight * pk);
    const fat = Math.round(kcal * 0.27 / 9);
    const carb = Math.max(60, Math.round((kcal - protein * 4 - fat * 9) / 4));
    return { bmr: R(bmr), tdee: R(tdee), kcal, protein, fat, carb };
  },
  bmi(p) {
    const h = p.height / 100;
    return h > 0 ? p.weight / (h * h) : 0;
  },
  bmiLabel(b) {
    if (b < 18.5) return { t: '偏瘦', c: '#4B9DFF' };
    if (b < 24) return { t: '正常', c: '#12A87A' };
    if (b < 28) return { t: '超重', c: '#FF8A3D' };
    return { t: '肥胖', c: '#F0564A' };
  }
};

/* ---------------- 食物与份量 ---------------- */
function portion(food, g) {
  const r = g / 100;
  return {
    n: food.n, g: R(g),
    k: food.k * r, p: food.p * r, f: food.f * r,
    cho: food.cho * r, fi: food.fi * r, na: food.na * r
  };
}
function zeroNut() { return { k: 0, p: 0, f: 0, cho: 0, fi: 0, na: 0 }; }
function sumItems(items) {
  return items.reduce((a, it) => {
    a.k += it.k; a.p += it.p; a.f += it.f;
    a.cho += it.cho; a.fi += it.fi; a.na += it.na;
    return a;
  }, zeroNut());
}
function mealNut(m) { return sumItems(m.foods || []); }
function dayMeals(d) { return meals.filter(m => m.date === d); }
function dayNut(d) {
  const list = dayMeals(d);
  const t = sumItems(list.flatMap(m => m.foods || []));
  t.count = list.length;
  return t;
}

/* 模糊搜索 */
function searchFood(q, cat) {
  const kw = (q || '').trim().toLowerCase();
  return FOOD_DB.filter(f => {
    if (cat && cat !== '全部' && f.cat !== cat) return false;
    if (!kw) return true;
    if (f.n.toLowerCase().includes(kw)) return true;
    return (f.a || []).some(a => a.toLowerCase().includes(kw));
  });
}

/* ---------------- Toast ---------------- */
let toastTimer = null;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), 2000);
}

/* ---------------- Sheet ---------------- */
const Sheet = {
  open(title, bodyHTML, footHTML) {
    $('#sheetTitle').textContent = title;
    $('#sheetBody').innerHTML = bodyHTML;
    $('#sheetFoot').innerHTML = footHTML || '';
    $('#sheetFoot').classList.toggle('hide', !footHTML);
    $('#mask').classList.add('on');
    $('#sheet').classList.add('on');
    document.body.style.overflow = 'hidden';
  },
  close() {
    $('#mask').classList.remove('on');
    $('#sheet').classList.remove('on');
    document.body.style.overflow = '';
    Add.reset();
  }
};

/* ============================================================
 * 建档向导
 * ============================================================ */
const Onb = {
  draft: { sex: 'm', age: 35, height: 172, weight: 68.5, target: 63, goal: 'lose', act: 1.375 },
  targetTouched: false,

  init() {
    this.targetTouched = false;
    const g = $('#goalChips'), s = $('#sexChips');
    g.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      $$('#goalChips .chip').forEach(c => c.classList.remove('on'));
      b.classList.add('on');
      this.draft.goal = b.dataset.goal;
      this.syncTarget();
    });
    s.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      $$('#sexChips .chip').forEach(c => c.classList.remove('on'));
      b.classList.add('on');
      this.draft.sex = b.dataset.sex;
    });
    $('#actList').innerHTML = ACT_OPTS.map((o, i) => `
      <div class="card" data-act="${o.v}" style="margin-bottom:9px;display:flex;align-items:center;gap:11px;padding:14px 15px;border:1.5px solid ${i === 1 ? '#12A87A' : 'transparent'};${i === 1 ? 'background:#F3FBF8' : ''}">
        <div style="flex:1">
          <div style="font-weight:700;font-size:14.5px">${o.t}</div>
          <div class="tiny muted" style="margin-top:2px">${o.d}</div>
        </div>
        <div style="width:18px;height:18px;border-radius:50%;border:2px solid ${i === 1 ? '#12A87A' : '#DDE6E2'};background:${i === 1 ? '#12A87A' : 'transparent'};flex:0 0 auto"></div>
      </div>`).join('');
    $('#actList').addEventListener('click', e => {
      const c = e.target.closest('[data-act]'); if (!c) return;
      this.draft.act = parseFloat(c.dataset.act);
      $$('#actList [data-act]').forEach(x => {
        x.style.borderColor = 'transparent'; x.style.background = '#fff';
        const dot = x.lastElementChild;
        dot.style.borderColor = '#DDE6E2'; dot.style.background = 'transparent';
      });
      c.style.borderColor = '#12A87A'; c.style.background = '#F3FBF8';
      const dot = c.lastElementChild;
      dot.style.borderColor = '#12A87A'; dot.style.background = '#12A87A';
    });
    $('#fWeight').addEventListener('input', () => this.syncTarget());
    $('#fTarget').addEventListener('input', () => { this.targetTouched = true; });
  },

  autoTarget(w) {
    if (this.draft.goal === 'lose') return Math.round((w - Math.max(3, w * 0.07)) * 10) / 10;
    if (this.draft.goal === 'gain') return Math.round((w + 3) * 10) / 10;
    return Math.round(w * 10) / 10;
  },

  syncTarget() {
    if (this.targetTouched) return;
    const w = num($('#fWeight').value) || 68;
    $('#fTarget').value = this.autoTarget(w);
  },

  collect() {
    const d = this.draft;
    d.age = clamp(num($('#fAge').value) || 30, 12, 90);
    d.height = clamp(num($('#fHeight').value) || 170, 120, 220);
    d.weight = clamp(num($('#fWeight').value) || 65, 30, 200);
    const auto = this.autoTarget(d.weight);
    d.target = this.targetTouched ? clamp(num($('#fTarget').value) || auto, 30, 200) : auto;
    d.nickname = (($('#fNick') && $('#fNick').value) || '').trim().slice(0, 8);
    return { ...d };
  },

  next(step) {
    if (step === 2) {
      const d = this.collect();
      if (d.age < 12 || d.height < 120 || d.weight < 30) { toast('请填写有效的身体数据'); return; }
      this.draft = d;
    }
    if (step === 3) {
      const p = Calc.plan({ ...this.draft });
      const b = Calc.bmi(this.draft), bl = Calc.bmiLabel(b);
      $('#planPreview').innerHTML = `
        <div style="text-align:center;padding:8px 0 14px">
          <div class="tiny muted">每日建议摄入</div>
          <div style="font-size:38px;font-weight:850;letter-spacing:-1.5px;line-height:1.2;color:#0B7F5C">${p.kcal}</div>
          <div class="tiny muted">千卡 / 天</div>
        </div>
        <div class="bar" style="height:7px;margin-bottom:14px"><i style="width:100%;background:linear-gradient(90deg,#3ECFA0,#12A87A)"></i></div>
        <div class="kv" style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-top:1px solid #EBF0ED">
          <span class="muted">基础代谢</span><b>${p.bmr} kcal</b></div>
        <div class="kv" style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-top:1px solid #EBF0ED">
          <span class="muted">每日总消耗</span><b>${p.tdee} kcal</b></div>
        <div class="kv" style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-top:1px solid #EBF0ED">
          <span class="muted">蛋白质 / 脂肪 / 碳水</span><b>${p.protein} / ${p.fat} / ${p.carb} g</b></div>
        <div class="kv" style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-top:1px solid #EBF0ED">
          <span class="muted">BMI</span><b style="color:${bl.c}">${b.toFixed(1)} · ${bl.t}</b></div>`;
    }
    [1, 2, 3].forEach(i => $('#onbStep' + i).classList.toggle('hide', i !== step));
    window.scrollTo(0, 0);
  },

  finish() {
    const d = this.collect();
    profile = { ...d, startWeight: d.weight, createdAt: Date.now() };
    Store.set(K.profile, profile);
    if (!weights.some(w => w.date === dstr())) {
      weights.push({ date: dstr(), kg: d.weight });
      Store.set(K.weights, weights);
    }
    boot();
  }
};

/* ============================================================
 * 主应用渲染
 * ============================================================ */
const App = {
  tab(name) {
    $$('.page').forEach(p => p.classList.remove('on'));
    const pg = $('#pg-' + name);
    if (pg) pg.classList.add('on');
    $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === name));
    window.scrollTo(0, 0);
    if (name === 'today') this.renderToday();
    if (name === 'log') this.renderLog();
    if (name === 'week') this.renderWeek();
    if (name === 'me') this.renderMe();
  },

  /* -------- 今日 -------- */
  renderToday() {
    if (!profile) return;
    const plan = Calc.plan(profile);
    const t = dayNut(dstr());
    const hour = new Date().getHours();
    $('#greet').textContent = hour < 6 ? '夜深了' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';
    const dw = ['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()];
    $('#todayDate').textContent = `${new Date().getMonth() + 1} 月 ${new Date().getDate()} 日 · 星期${dw}`;
    const nm = (profile.nickname || '').trim();
    $('#avatarLetter').textContent = nm ? nm.slice(-1) : '我';

    /* 热量环 */
    const pct = plan.kcal > 0 ? t.k / plan.kcal : 0;
    const over = t.k > plan.kcal;
    const cir = 2 * Math.PI * 50;
    const dash = cir * clamp(pct, 0, 1);
    const left = plan.kcal - t.k;
    const ringColor = over ? '#FFD8C0' : 'rgba(255,255,255,.95)';
    const dinnerDone = dayMeals(dstr()).some(m => m.type === 'dinner' || m.type === 'snack');
    const noteHTML = this.heatNote(plan, t, over, left, dinnerDone);

    $('#ringCard').innerHTML = `
      <div class="ring-row">
        <div class="ring-wrap">
          <svg width="124" height="124" viewBox="0 0 124 124">
            <circle cx="62" cy="62" r="50" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="10"/>
            <circle cx="62" cy="62" r="50" fill="none" stroke="${ringColor}" stroke-width="10"
              stroke-linecap="round" stroke-dasharray="${dash} ${cir}" transform="rotate(-90 62 62)"
              style="transition:stroke-dasharray .6s ease"/>
          </svg>
          <div class="ring-center">
            <div class="ring-kcal">${R(t.k)}</div>
            <div class="ring-unit">已摄入 kcal</div>
          </div>
        </div>
        <div class="ring-side">
          <div class="kv"><span style="opacity:.85">每日预算</span><b>${plan.kcal}</b></div>
          <div class="kv"><span style="opacity:.85">${over ? '已超出' : '还可吃'}</span><b style="color:${over ? '#FFF0B8' : '#fff'}">${Math.abs(R(left))} kcal</b></div>
          <div class="kv"><span style="opacity:.85">蛋白质</span><b>${R(t.p)} / ${plan.protein} g</b></div>
        </div>
      </div>
      <div class="ring-note">${noteHTML}</div>`;

    /* 宏量 */
    const macros = [
      { n: '蛋白质', v: t.p, tar: plan.protein, u: 'g', c: '#4B9DFF' },
      { n: '脂肪', v: t.f, tar: plan.fat, u: 'g', c: '#FF8A3D' },
      { n: '碳水', v: t.cho, tar: plan.carb, u: 'g', c: '#8B7BF7' }
    ];
    $('#macroRow').innerHTML = macros.map(m => {
      const p2 = m.tar > 0 ? clamp(m.v / m.tar * 100, 0, 100) : 0;
      return `<div class="macro">
        <div class="macro-top"><span class="dot" style="background:${m.c}"></span>${m.n}</div>
        <div class="macro-val">${R(m.v)}<span style="font-size:11px;font-weight:600;color:#879590"> / ${m.tar}${m.u}</span></div>
        <div class="bar"><i style="width:${p2}%;background:${m.c}"></i></div>
      </div>`;
    }).join('');

    /* 餐次 */
    $('#todayTotal').textContent = t.count ? `共 ${t.count} 条记录` : '还没有记录';
    $('#mealList').innerHTML = MEAL_TYPES.map(mt => {
      const list = dayMeals(dstr()).filter(m => m.type === mt.id);
      const sub = sumItems(list.flatMap(m => m.foods || []));
      const raw = list.flatMap(m => m.foods || []);
      const items = [];
      raw.forEach(f => {
        const ex = items.find(x => x.n === f.n);
        if (ex) { ex.g += f.g; ex.k += f.k; ex.p += f.p; ex.f += f.f; ex.cho += f.cho; ex.fi += f.fi; ex.na += f.na; }
        else items.push({ n: f.n, g: f.g, k: f.k, p: f.p, f: f.f, cho: f.cho, fi: f.fi, na: f.na });
      });
      const photo = list.find(m => m.photo)?.photo;
      const names = items.map(i => i.n).join('、');
      const gr = items.length ? gradeMeal({ foods: items }, plan) : null;
      return `<div class="meal">
        <div class="meal-head" onclick="Add.open('${mt.id}')">
          <div class="meal-ico" style="background:${mt.bg}">${mt.ico}</div>
          <div class="meal-t">
            <h4>${mt.name}</h4>
            <p>${items.length ? names : '点这里添加'}</p>
          </div>
          ${gr ? `<div class="grade" style="background:${gr.color}18;color:${gr.color}">${gr.grade}</div>` : ''}
          <div class="meal-k">${items.length ? R(sub.k) + '<small>kcal</small>' : ''}</div>
          <div class="meal-add">+</div>
        </div>
        ${gr && gr.tags.length ? `<div class="grade-row">${gr.tags.map(tg => `<span>${tg}</span>`).join('')}</div>` : ''}
        ${items.length ? `<div class="meal-body">
          ${photo ? `<img class="meal-photo" src="${photo}" alt="这一餐">` : ''}
          ${items.map(i => `<div class="food-item">
            <div class="food-nm">${i.n}<span>${i.g}g</span></div>
            <div class="food-kc">${R(i.k)} kcal</div>
            <button class="food-del" onclick="event.stopPropagation();App.delDish('${mt.id}','${i.n.replace(/'/g, "")}')">×</button>
          </div>`).join('')}
        </div>` : ''}
      </div>`;
    }).join('');

    /* 营养师点评 */
    $('#coachBox').innerHTML = Coach.render(plan, t, dstr());

    /* 迷你柱状 */
    $('#miniBars').innerHTML = this.barsHTML(7, true);
  },

  heatNote(plan, t, over, left, dinnerDone) {
    if (!t.count) return '今天还没记录。拍下你吃的第一口，我帮你算清楚。';
    if (over) {
      const d = R(t.k - plan.kcal);
      if (d < 150) return `略微超出 ${d} kcal，问题不大，晚点散步 30 分钟就抵掉了。`;
      if (d < 400) return `今天超了 ${d} kcal，相当于 ${R(d / 55)} 公里慢跑。明天把主食减一点就能拉回来。`;
      return `今天超了 ${d} kcal。别自责，重要的是明天怎么调——先从减少一份主食开始。`;
    }
    if (dinnerDone) {
      if (left < 150) return '今天收工，基本吃满预算。睡前除了喝水就不要再加餐了。';
      return `今天收工，还剩 ${R(left)} kcal 的余量。明天照这个节奏走就行。`;
    }
    if (left > plan.kcal * 0.5) return `还剩 ${R(left)} kcal，别饿着，蛋白质和蔬菜还可以继续补。`;
    if (left < 150) return `基本吃满了，剩下 ${R(left)} kcal 留给一杯牛奶刚刚好。`;
    return `还剩 ${R(left)} kcal，一顿清淡的晚餐正好。`;
  },

  delDish(type, name) {
    const today = dstr();
    const keep = [];
    let hit = false;
    meals.forEach(m => {
      if (m.date === today && m.type === type) {
        const before = (m.foods || []).length;
        m.foods = (m.foods || []).filter(f => f.n !== name);
        if (m.foods.length !== before) hit = true;
        if (!m.foods.length) { Store.del(K.photo(m.id)); return; }
      }
      keep.push(m);
    });
    if (!hit) return;
    meals = keep;
    Store.set(K.meals, meals);
    this.renderToday();
    toast('已删除「' + name + '」');
  },

  /* -------- 柱状图 -------- */
  barsHTML(days, mini) {
    if (!profile) return '';
    const plan = Calc.plan(profile);
    const arr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = dstr(d);
      const n = dayNut(key);
      arr.push({ d, key, k: n.k, w: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()] });
    }
    const max = Math.max(plan.kcal * 1.25, ...arr.map(a => a.k), 1);
    const barH = mini ? 92 : 104;
    const lineBottom = 17 + (plan.kcal / max) * barH;
    const line = `<div style="position:absolute;left:0;right:0;bottom:${lineBottom}px;border-top:1px dashed #C6D5CF;pointer-events:none"></div>`;
    return line + arr.map(a => {
      const h = Math.max(3, a.k / max * barH);
      const over = a.k > plan.kcal;
      return `<div class="b" title="${a.key}">
        <i class="${over ? 'over' : ''}" style="height:${h}px${a.k ? '' : ';opacity:.22'}"></i>
        <em>${a.w}</em>
      </div>`;
    }).join('');
  },

  /* -------- 记录页 -------- */
  renderLog() {
    if (!profile) return;
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push({ key: dstr(d), d });
    }
    $('#calStrip').innerHTML = days.map(o => {
      const n = dayNut(o.key);
      const dot = n.count ? `<span style="display:inline-block;width:4px;height:4px;border-radius:50%;background:${o.key === viewDate ? '#fff' : '#12A87A'};margin-top:3px"></span>` : `<span style="display:inline-block;width:4px;height:4px;margin-top:3px"></span>`;
      return `<div class="cal-day ${o.key === viewDate ? 'on' : ''}" onclick="App.pickDate('${o.key}')">
        <div class="w">${['日', '一', '二', '三', '四', '五', '六'][o.d.getDay()]}</div>
        <div class="d">${o.d.getDate()}</div>${dot}
      </div>`;
    }).join('');

    const t = dayNut(viewDate);
    const plan = Calc.plan(profile);
    const list = dayMeals(viewDate);
    const dd = new Date(viewDate + 'T00:00:00');
    const head = `<div class="card" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:800;font-size:16px">${dd.getMonth() + 1} 月 ${dd.getDate()} 日</div>
          <div class="tiny muted" style="margin-top:2px">${list.length ? list.length + ' 条记录' : '没有记录'}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:20px;font-weight:850;letter-spacing:-.6px;color:${t.k > plan.kcal ? '#F0564A' : '#0B7F5C'}">${R(t.k)}</div>
          <div class="tiny muted">kcal / 预算 ${plan.kcal}</div>
        </div>
      </div>
      <div class="bar" style="height:6px;margin-top:12px"><i style="width:${clamp(t.k / plan.kcal * 100, 0, 100)}%;background:${t.k > plan.kcal ? '#FF8A3D' : '#12A87A'}"></i></div>
    </div>`;

    if (!list.length) {
      $('#logDetail').innerHTML = head + `<div class="empty"><div class="eico">🍽️</div><p>这天还没有记录</p>
        <button class="btn sm" style="width:auto;padding:0 22px;margin-top:14px" onclick="Add.open()">去记一餐</button></div>`;
      return;
    }

    $('#logDetail').innerHTML = head + MEAL_TYPES.map(mt => {
      const ms = list.filter(m => m.type === mt.id);
      if (!ms.length) return '';
      return ms.map(m => {
        const s = mealNut(m);
        const tm = new Date(m.ts);
        const gr = gradeMeal(m, plan);
        return `<div class="meal">
          <div class="meal-head">
            <div class="meal-ico" style="background:${mt.bg}">${mt.ico}</div>
            <div class="meal-t"><h4>${mt.name}<span class="tiny muted" style="font-weight:500;margin-left:6px">${pad2(tm.getHours())}:${pad2(tm.getMinutes())}</span></h4>
              <p>${(m.foods || []).map(f => f.n).join('、')}</p></div>
            ${gr ? `<div class="grade" style="background:${gr.color}18;color:${gr.color}">${gr.grade}</div>` : ''}
            <div class="meal-k">${R(s.k)}<small>kcal</small></div>
          </div>
          ${gr ? `<div class="grade-row">${gr.tags.map(tg => `<span>${tg}</span>`).join('')}</div>` : ''}
          ${m.photo ? `<div class="meal-photo-wrap"><img class="meal-photo" src="${m.photo}" alt="这餐"></div>` : ''}
          <div class="meal-body">
            ${(m.foods || []).map(f => `<div class="food-item">
              <div class="food-nm">${f.n}<span>${f.g}g</span></div>
              <div class="food-kc">${R(f.k)} kcal</div>
            </div>`).join('')}
            <div style="display:flex;gap:14px;padding-top:8px;border-top:1px dashed #EBF0ED;margin-top:6px">
              <span class="tiny muted">蛋白 ${R(s.p)}g</span>
              <span class="tiny muted">脂肪 ${R(s.f)}g</span>
              <span class="tiny muted">碳水 ${R(s.cho)}g</span>
              <span class="tiny muted">钠 ${R(s.na)}mg</span>
            </div>
          </div>
        </div>`;
      }).join('');
    }).join('');
  },

  pickDate(k) { viewDate = k; this.renderLog(); },

  /* -------- 周报 -------- */
  renderWeek() {
    if (!profile) return;
    const plan = Calc.plan(profile);
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = dstr(d);
      arr.push({ key, d, n: dayNut(key) });
    }
    const recorded = arr.filter(a => a.n.count > 0);
    const avgK = recorded.length ? recorded.reduce((s, a) => s + a.n.k, 0) / recorded.length : 0;
    const onTarget = recorded.filter(a => a.n.k <= plan.kcal * 1.05 && a.n.k >= plan.kcal * 0.75).length;
    const avgP = recorded.length ? recorded.reduce((s, a) => s + a.n.p, 0) / recorded.length : 0;
    const days = recorded.length;

    /* 供能比 */
    const tot = recorded.reduce((a, x) => ({
      p: a.p + x.n.p, f: a.f + x.n.f, c: a.c + x.n.cho
    }), { p: 0, f: 0, c: 0 });
    const eP = tot.p * 4, eF = tot.f * 9, eC = tot.c * 4;
    const eAll = eP + eF + eC || 1;
    const ratio = { p: R(eP / eAll * 100), f: R(eF / eAll * 100), c: R(eC / eAll * 100) };

    const wStart = weights.length ? weights[0].kg : profile.weight;
    const wNow = weights.length ? weights[weights.length - 1].kg : profile.weight;
    const dW = wNow - wStart;

    $('#weekBody').innerHTML = `
      <div class="stat-grid">
        <div class="stat"><div class="lb">平均每日摄入</div>
          <div class="vl">${R(avgK)}<small>kcal</small></div>
          <div class="tiny muted" style="margin-top:2px">预算 ${plan.kcal}</div></div>
        <div class="stat"><div class="lb">达标天数</div>
          <div class="vl">${onTarget}<small>/ ${days || 0} 天</small></div>
          <div class="tiny muted" style="margin-top:2px">记录 ${days} 天</div></div>
        <div class="stat"><div class="lb">平均蛋白质</div>
          <div class="vl">${R(avgP)}<small>g</small></div>
          <div class="tiny muted" style="margin-top:2px">目标 ${plan.protein} g</div></div>
        <div class="stat"><div class="lb">体重变化</div>
          <div class="vl" style="color:${dW > 0 ? '#F0564A' : dW < 0 ? '#12A87A' : '#16211D'}">${dW > 0 ? '+' : ''}${dW.toFixed(1)}<small>kg</small></div>
          <div class="tiny muted" style="margin-top:2px">当前 ${wNow.toFixed(1)} kg</div></div>
      </div>

      <div class="sec-title"><h3>每日热量</h3><span class="more">${arr[0].d.getMonth() + 1}/${arr[0].d.getDate()} – ${arr[6].d.getMonth() + 1}/${arr[6].d.getDate()}</span></div>
      <div class="card">
        <div class="bars" style="height:170px">${this.barsHTML(7, false)}</div>
        <div style="display:flex;gap:16px;margin-top:12px;padding-top:10px;border-top:1px solid #EBF0ED">
          <span class="tiny muted"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#12A87A;margin-right:4px"></span>预算内</span>
          <span class="tiny muted"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#FF8A3D;margin-right:4px"></span>超出预算</span>
        </div>
      </div>

      <div class="sec-title"><h3>三大营养素供能比</h3></div>
      <div class="card">
        ${[
          { n: '蛋白质', v: ratio.p, lo: 15, hi: 25, c: '#4B9DFF' },
          { n: '脂肪', v: ratio.f, lo: 20, hi: 30, c: '#FF8A3D' },
          { n: '碳水', v: ratio.c, lo: 45, hi: 60, c: '#8B7BF7' }
        ].map(r => {
          const good = r.v >= r.lo && r.v <= r.hi;
          const diff = good ? '' : r.v < r.lo ? '偏低' : '偏高';
          return `<div style="margin-bottom:15px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:13px;margin-bottom:7px">
            <span style="font-weight:650">${r.n}</span>
            <span class="tiny"><b style="color:${good ? '#12A87A' : '#E07020'};font-size:13px">${r.v}%</b>
              <span style="color:#A8B5B0;margin-left:5px">建议 ${r.lo}–${r.hi}%${diff ? ' · ' + diff : ''}</span></span>
          </div>
          <div style="position:relative;height:7px;border-radius:99px;background:#EFF4F1;overflow:hidden">
            <div style="position:absolute;top:0;bottom:0;left:${r.lo}%;width:${r.hi - r.lo}%;background:#DBF0E7"></div>
            <div style="position:relative;height:100%;width:${clamp(r.v, 0, 100)}%;background:${r.c};border-radius:99px;opacity:${good ? 1 : .62}"></div>
          </div>
        </div>`;
        }).join('')}
      </div>

      <div class="sec-title"><h3>体重变化</h3></div>
      <div class="card">${this.weightSpark()}</div>

      <div class="sec-title"><h3>这一周怎么看</h3></div>
      <div class="coach">${Coach.weekly(plan, { avgK, onTarget, days, avgP, ratio, dW })}</div>
      <div style="height:14px"></div>`;
  },

  weightSpark() {
    if (weights.length < 2) {
      return `<div class="empty" style="padding:22px"><p class="tiny">记录两次以上体重，就能看到趋势了</p>
        <button class="btn sm ghost" style="width:auto;padding:0 18px;margin-top:10px" onclick="App.tab('me')">去记录体重</button></div>`;
    }
    const ws = weights.slice(-14);
    const vals = ws.map(w => w.kg);
    const min = Math.min(...vals) - 0.5, max = Math.max(...vals) + 0.5;
    const W = 300, H = 84, padx = 6;
    const pts = ws.map((w, i) => {
      const x = padx + (W - padx * 2) * (i / Math.max(1, ws.length - 1));
      const y = H - 8 - (w.kg - min) / (max - min) * (H - 16);
      return [x, y];
    });
    const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const last = pts[pts.length - 1];
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:84px;overflow:visible">
      <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#12A87A" stop-opacity=".18"/><stop offset="100%" stop-color="#12A87A" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="${path} L ${last[0].toFixed(1)} ${H} L ${pts[0][0].toFixed(1)} ${H} Z" fill="url(#wg)"/>
      <path d="${path}" fill="none" stroke="#12A87A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="3.6" fill="#12A87A" stroke="#fff" stroke-width="2"/>
    </svg>
    <div style="display:flex;justify-content:space-between;margin-top:6px">
      <span class="tiny muted">${ws[0].kg.toFixed(1)} kg</span>
      <span class="tiny" style="font-weight:700;color:#0B7F5C">${ws[ws.length - 1].kg.toFixed(1)} kg</span>
    </div>`;
  },

  /* -------- 我的 -------- */
  renderMe() {
    if (!profile) return;
    const plan = Calc.plan(profile);
    const b = Calc.bmi(profile), bl = Calc.bmiLabel(b);
    const start = profile.startWeight || profile.weight;
    const target = profile.target;
    const now = weights.length ? weights[weights.length - 1].kg : start;
    const totalNeed = Math.abs(start - target) || 1;
    const done = clamp(Math.abs(start - now) / totalNeed * 100, 0, 100);
    const toGo = Math.abs(now - target);

    $('#meBody').innerHTML = `
      <div class="card profile-head">
        <div class="avatar">${(profile.nickname || '我').slice(-1)}</div>
        <div style="flex:1">
          <div style="font-weight:800;font-size:17px">${profile.nickname || '我的档案'}</div>
          <div class="tiny muted" style="margin-top:2px">${profile.sex === 'm' ? '男' : '女'} · ${profile.age} 岁 · ${profile.height} cm · ${profile.goal === 'lose' ? '减脂' : profile.goal === 'gain' ? '增肌' : '维持'}</div>
        </div>
        <button class="btn sm ghost" style="width:auto;padding:0 14px" onclick="Me.edit()">编辑</button>
      </div>

      <div class="sec-title"><h3>目标进度</h3><span class="more">目标 ${target} kg</span></div>
      <div class="card">
        <div style="display:flex;align-items:baseline;gap:7px;margin-bottom:10px">
          <span style="font-size:26px;font-weight:850;letter-spacing:-1px">${now.toFixed(1)}</span>
          <span class="tiny muted">kg ／ 还差 ${toGo.toFixed(1)} kg</span>
        </div>
        <div class="bar" style="height:8px"><i style="width:${done}%;background:linear-gradient(90deg,#3ECFA0,#12A87A)"></i></div>
        <div style="display:flex;justify-content:space-between;margin-top:6px">
          <span class="tiny muted">起点 ${start} kg</span><span class="tiny muted">完成 ${R(done)}%</span>
        </div>
        <button class="btn sm" style="margin-top:14px" onclick="Me.weigh()">今天体重打卡</button>
      </div>

      <div class="sec-title"><h3>身体指标</h3></div>
      <div class="card" style="padding:6px 16px">
        <div class="li"><div class="ic" style="background:#EAF3FF">📐</div><div class="nm">BMI</div><div class="vv" style="color:${bl.c};font-weight:700">${b.toFixed(1)} · ${bl.t}</div></div>
        <div class="li"><div class="ic" style="background:#E9F8F2">🔥</div><div class="nm">基础代谢</div><div class="vv">${plan.bmr} kcal</div></div>
        <div class="li"><div class="ic" style="background:#FFF2E8">⚡</div><div class="nm">每日总消耗</div><div class="vv">${plan.tdee} kcal</div></div>
        <div class="li"><div class="ic" style="background:#F0EDFF">🎯</div><div class="nm">每日预算</div><div class="vv" style="font-weight:700;color:#0B7F5C">${plan.kcal} kcal</div></div>
      </div>

      <div class="sec-title"><h3>每日目标</h3></div>
      <div class="card" style="padding:14px 16px">
        <div style="display:flex;gap:10px">
          ${[{ n: '蛋白质', v: plan.protein + 'g', c: '#4B9DFF' }, { n: '脂肪', v: plan.fat + 'g', c: '#FF8A3D' }, { n: '碳水', v: plan.carb + 'g', c: '#8B7BF7' }]
        .map(x => `<div style="flex:1;text-align:center;padding:10px 0;background:#FAFCFB;border-radius:12px">
            <div class="tiny muted">${x.n}</div>
            <div style="font-size:16px;font-weight:800;color:${x.c};margin-top:2px">${x.v}</div></div>`).join('')}
        </div>
      </div>

      <div class="sec-title"><h3>数据</h3></div>
      <div class="card" style="padding:6px 16px">
        <div class="li" onclick="Me.exportData()"><div class="ic" style="background:#E9F8F2">⬇️</div><div class="nm">导出我的数据</div><div class="vv">CSV</div></div>
        <div class="li" onclick="Me.clear()"><div class="ic" style="background:#FDECEA">🗑️</div><div class="nm" style="color:#F0564A">清空全部记录</div><div class="vv">›</div></div>
      </div>

      <p class="tiny muted" style="text-align:center;margin:22px 0 10px;line-height:1.7">
        知食 NutriLens · 数据保存在本机浏览器<br>
        照片与体重信息不上传任何服务器</p>
      <div style="height:10px"></div>`;
  }
};

/* ============================================================
 * 营养师点评引擎
 * ============================================================ */
const Coach = {
  render(plan, t, date) {
    if (!t.count) {
      return `<div class="coach-h"><span class="badge">今日</span><h3>等你开饭</h3></div>
        <p><em>①</em><span>先记下今天第一餐，我就能算出你离目标还差多少蛋白质和蔬菜。</span></p>
        <p><em>②</em><span>刚开始不用精确到克，选个大概份量就行，方向比精度更重要。</span></p>`;
    }
    const tips = [];
    const hour = new Date().getHours();
    const isToday = date === dstr();
    const kPct = t.k / plan.kcal;

    /* 蛋白质 */
    const pGap = plan.protein - t.p;
    if (pGap > plan.protein * 0.35) {
      const need = R(pGap);
      const sug = need > 45 ? '200g 鸡胸或 250g 虾' : need > 25 ? '3 个鸡蛋加一杯牛奶' : '一杯无糖酸奶';
      tips.push(`蛋白质还差 <b>${need}g</b>，晚餐补 ${sug} 就够。蛋白质吃够，减脂时才不掉肌肉。`);
    } else if (t.p >= plan.protein * 1.1) {
      tips.push(`蛋白质 <b>${R(t.p)}g</b> 超额完成，肌肉修复的原料很充足。`);
    }

    /* 热量 */
    if (kPct > 1.15) {
      tips.push(`今天热量已到预算的 <b>${R(kPct * 100)}%</b>。如果这餐是晚上吃的，明早称重会略高，那是水分不是脂肪，别慌。`);
    } else if (isToday && hour >= 15 && kPct < 0.55) {
      tips.push(`现在是下午 ${hour} 点，你只吃进了预算的 <b>${R(kPct * 100)}%</b>。长期吃太少会让代谢往下走，晚餐正常吃。`);
    }

    /* 脂肪 / 钠 */
    if (t.f > plan.fat * 1.25) {
      tips.push(`脂肪 <b>${R(t.f)}g</b> 偏高，多半来自煎炸和肥肉。明天试试把炒菜换成蒸菜，油能省一半。`);
    }
    if (t.na > 2200) {
      tips.push(`钠 <b>${R(t.na)}mg</b> 已经偏高，接近每日上限。今晚多喝水，明天少吃一口咸菜和腊味。`);
    }

    /* 纤维 / 蔬菜 */
    if (t.fi < 12) {
      tips.push(`膳食纤维只有 <b>${R(t.fi)}g</b>，蔬菜明显不够。加一份 200g 的清炒或白灼蔬菜，饱腹感立刻不一样。`);
    }

    /* 碳水 */
    if (t.cho > plan.carb * 1.3) {
      tips.push(`碳水 <b>${R(t.cho)}g</b> 超出不少，主食占了大部分。把白米饭换成一半糙米或杂粮，血糖会平稳很多。`);
    }

    /* 训练建议 */
    const train = this.training(plan, t);
    if (train) tips.push(train);

    const picked = tips.slice(0, 4);
    const icons = ['①', '②', '③', '④'];
    return `<div class="coach-h"><span class="badge">AI 营养师</span><h3>${this.title(plan, t)}</h3></div>` +
      picked.map((x, i) => `<p><em>${icons[i]}</em><span>${x}</span></p>`).join('');
  },

  title(plan, t) {
    const r = t.k / plan.kcal;
    const h = new Date().getHours();
    if (r > 1.15) return '今天有点放开';
    if (r > 0.9) return '今天打得很准';
    if (t.p >= plan.protein * 0.85) return '蛋白质吃得很稳';
    if (h >= 19 && r < 0.8) return '晚餐还有空间';
    if (h < 11 && r < 0.35) return '早餐要吃饱';
    if (r < 0.45) return '前半程节奏不错';
    return '再调整一下就好';
  },

  training(plan, t) {
    const g = profile.goal;
    if (g === 'lose') {
      if (t.p < plan.protein * 0.8) return '今天蛋白没吃够，先别急着加有氧。力量训练后的 2 小时是补蛋白的窗口，练完补一杯牛奶或一勺蛋白粉。';
      return '热量控制得不错，建议今晚做 30 分钟力量训练（深蹲、划船、俯卧撑各 3 组），比单纯跑步更能保住肌肉。';
    }
    if (g === 'gain') {
      return '增肌期热量要吃到，训练安排在饭后 1–2 小时。今天如果练了，睡前补一份酸奶或鸡蛋，恢复会更快。';
    }
    return '体重维持得好的关键在稳定。今天如果吃得偏少，明天不用刻意补；吃得偏多，第二天正常吃就好。';
  },

  weekly(plan, d) {
    if (!d.days) return `<p><em>·</em><span>这周还没有记录，先记三天，我就能看出你的饮食模式。</span></p>`;
    const out = [];
    if (d.avgK > plan.kcal * 1.1) out.push(`平均每天吃进 <b>${R(d.avgK)} kcal</b>，比预算高 ${R(d.avgK - plan.kcal)}。一周累积多出约 ${R((d.avgK - plan.kcal) * 7 / 7700 * 100) / 100} kg 的理论增重，先从减掉一份主食或一杯含糖饮料开始。`);
    else if (d.avgK < plan.kcal * 0.8) out.push(`平均每天只有 <b>${R(d.avgK)} kcal</b>，低于预算不少。吃太少同样不利于减脂，身体会降低消耗，建议回到预算附近。`);
    else out.push(`平均每天 <b>${R(d.avgK)} kcal</b>，和预算差 ${R(Math.abs(d.avgK - plan.kcal))} 以内，节奏很稳。`);
    if (d.days < 7) out.push(`这周记录了 <b>${d.days} 天</b>。记录本身就是最有效的干预——只看数字不改变什么，持续看才会改变。`);
    if (d.avgP < plan.protein * 0.8) out.push(`蛋白质平均 <b>${R(d.avgP)}g</b>，离目标 ${plan.protein}g 还差一截。把早餐的粥换成鸡蛋加牛奶，最容易补上。`);
    if (d.ratio.f > 32) out.push(`脂肪供能占到 <b>${d.ratio.f}%</b>，偏高。优先减少烹调油和腊味，而不是戒掉所有油脂。`);
    if (Math.abs(d.dW) >= 0.3) out.push(`体重变化 <b>${d.dW > 0 ? '+' : ''}${d.dW.toFixed(1)} kg</b>，${d.dW < 0 ? '方向对了，继续保持。' : '先看趋势，单周波动大多来自水分。'}`);
    return out.map(x => `<p><em>·</em><span>${x}</span></p>`).join('');
  }
};

/* 单餐评分：从蛋白质、油脂、盐、蔬菜、热量占比五个维度打分 */
function gradeMeal(m, plan) {
  const s = mealNut(m);
  if (!s.k) return null;
  let score = 100;
  const tags = [];
  const pNeed = plan.protein / 3;
  if (s.p < pNeed * 0.6) { score -= 13; tags.push('蛋白偏少'); }
  else if (s.p >= pNeed) { tags.push('蛋白够'); }

  const fatRatio = (s.f * 9) / (s.k || 1);
  if (fatRatio > 0.42) { score -= 15; tags.push('油脂偏多'); }
  else if (fatRatio > 0.34) { score -= 7; tags.push('油略多'); }

  if (s.na > 1200) { score -= 12; tags.push('偏咸'); }
  else if (s.na > 850) { score -= 6; tags.push('盐稍高'); }

  if (s.fi < 2.5) { score -= 10; tags.push('蔬菜少'); }
  else if (s.fi >= 5) { tags.push('蔬菜足'); }

  const kRatio = s.k / plan.kcal;
  if (kRatio > 0.55) { score -= 13; tags.push('占比偏高'); }
  else if (kRatio > 0.3 && kRatio <= 0.5) { tags.push('份量合适'); }

  score = clamp(score, 30, 100);
  let grade, color;
  if (score >= 88) { grade = 'A'; color = '#12A87A'; }
  else if (score >= 74) { grade = 'B'; color = '#4B9DFF'; }
  else if (score >= 60) { grade = 'C'; color = '#FF8A3D'; }
  else { grade = 'D'; color = '#F0564A'; }
  return { grade, color, score, tags: tags.slice(0, 3) };
}

/* ============================================================
 * 记录一餐
 * ============================================================ */
const Add = {
  state: { type: 'lunch', photo: null, items: [], q: '', cat: '全部' },

  reset() { this.state = { type: 'lunch', photo: null, items: [], q: '', cat: '全部' }; },

  open(type) {
    if (!profile) return;
    const hour = new Date().getHours();
    const auto = type || (hour < 10 ? 'breakfast' : hour < 15 ? 'lunch' : hour < 21 ? 'dinner' : 'snack');
    this.state = { type: auto, photo: null, items: [], q: '', cat: '全部' };

    const cats = ['全部', ...Array.from(new Set(FOOD_DB.map(f => f.cat)))];
    const body = `
      <div class="field" style="margin-bottom:12px">
        <div class="chips" id="typeChips">
          ${MEAL_TYPES.map(m => `<button class="chip ${m.id === auto ? 'on' : ''}" data-t="${m.id}">${m.ico} ${m.name}</button>`).join('')}
        </div>
      </div>

      <div class="photo-zone" id="photoZone" style="margin-bottom:14px">
        <input type="file" accept="image/*" capture="environment" id="photoInput">
        ${this.photoHTML()}
      </div>

      <div class="search-box">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>
        <input id="foodSearch" placeholder="搜菜名，如 辣椒炒肉、米饭" autocomplete="off">
      </div>
      <div class="cats" id="catRow">${cats.map(c => `<button class="cat ${c === '全部' ? 'on' : ''}" data-c="${c}">${c}</button>`).join('')}</div>
      <div class="food-list" id="foodList"></div>

      <div class="sec-title" style="margin:14px 0 4px"><h3 style="font-size:14px">已选</h3><span class="more tiny">点数字可直接改重量</span></div>
      <div class="basket" id="basket"></div>
    `;
    Sheet.open('记录一餐', body, `<button class="btn" id="saveMeal" onclick="Add.save()">保存这一餐</button>`);
    this.renderList();
    this.renderBasket();

    $('#typeChips').onclick = e => {
      const b = e.target.closest('.chip'); if (!b) return;
      $$('#typeChips .chip').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      this.state.type = b.dataset.t;
    };
    $('#photoInput').onchange = e => this.pickPhoto(e.target);
    $('#foodSearch').oninput = e => { this.state.q = e.target.value; this.renderList(); };
    $('#catRow').onclick = e => {
      const b = e.target.closest('.cat'); if (!b) return;
      $$('#catRow .cat').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      this.state.cat = b.dataset.c;
      this.renderList();
    };
  },

  photoHTML() {
    if (this.state.photo) {
      return `<img src="${this.state.photo}" alt="这餐">
        <p style="margin-top:8px">点图片可重拍</p>`;
    }
    return `<div class="pico"><svg viewBox="0 0 24 24" fill="none" stroke="#12A87A" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2.8 8.6A2.4 2.4 0 0 1 5.2 6.2h1.3l1-1.7h6.9l1 1.7h3.4a2.4 2.4 0 0 1 2.4 2.4v7.8a2.4 2.4 0 0 1-2.4 2.4H5.2a2.4 2.4 0 0 1-2.4-2.4z"/><circle cx="12" cy="12.6" r="3.2"/></svg></div><p>拍一张这一餐的照片<br><span style="opacity:.7">仅存本机，作为记录留存</span></p>`;
  },

  async pickPhoto(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) { toast('请选择图片'); return; }
    const url = await this.compress(file);
    if (url) {
      this.state.photo = url;
      $('#photoZone').innerHTML = `<input type="file" accept="image/*" capture="environment" id="photoInput">${this.photoHTML()}`;
      $('#photoInput').onchange = e => this.pickPhoto(e.target);
    } else {
      toast('图片读取失败，可跳过照片直接记录');
    }
  },

  compress(file, maxW = 280, q = 0.62) {
    return new Promise(res => {
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => {
          try {
            const sc = Math.min(1, maxW / img.width);
            const c = document.createElement('canvas');
            c.width = Math.round(img.width * sc);
            c.height = Math.round(img.height * sc);
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            res(c.toDataURL('image/jpeg', q));
          } catch (e) { res(null); }
        };
        img.onerror = () => res(null);
        img.src = fr.result;
      };
      fr.onerror = () => res(null);
      fr.readAsDataURL(file);
    });
  },

  renderList() {
    const list = searchFood(this.state.q, this.state.cat);
    const box = $('#foodList');
    if (!box) return;
    if (!list.length) {
      box.innerHTML = `<div class="empty" style="padding:26px 10px"><p class="tiny">没找到「${this.state.q}」<br>换个说法试试，比如「炒肉」「青菜」</p></div>`;
      return;
    }
    const shown = list.slice(0, 60);
    box.innerHTML = shown.map(f => {
      const idx = FOOD_DB.indexOf(f);
      return `<div class="food-pick" onclick="Add.add(${idx})">
        <div class="nm"><b>${f.n}</b><p>每100g ${f.k}kcal · 蛋白${f.p}g · ${f.cat}</p></div>
        <div class="kk">${R(f.k * f.s / 100)}<span class="tiny muted">/${f.s}g</span></div>
        <div class="pick-plus">+</div>
      </div>`;
    }).join('') + (list.length > 60 ? `<div class="tiny muted" style="text-align:center;padding:10px">还有 ${list.length - 60} 项，再输入关键词缩小范围</div>` : '');
  },

  add(idx) {
    const food = FOOD_DB[idx];
    if (!food) return;
    const exist = this.state.items.find(i => i.n === food.n);
    if (exist) {
      const g = Math.min(3000, exist.g + food.s);
      this.state.items = this.state.items.map(i => i.n === food.n ? portion(food, g) : i);
    } else {
      this.state.items.push(portion(food, food.s));
    }
    this.renderBasket();
    if ($('#foodSearch')) { /* 保持输入焦点 */ }
  },

  setG(name, g) {
    const food = FOOD_DB.find(f => f.n === name);
    if (!food) return;
    const v = clamp(num(g) || 0, 0, 3000);
    this.state.items = this.state.items.map(i => i.n === name ? portion(food, v) : i).filter(i => i.g > 0);
    this.renderBasket(name);
  },

  stepG(name, delta) {
    const it = this.state.items.find(i => i.n === name);
    if (!it) return;
    this.setG(name, it.g + delta);
  },

  remove(name) {
    this.state.items = this.state.items.filter(i => i.n !== name);
    this.renderBasket();
  },

  renderBasket(focusName) {
    const box = $('#basket');
    if (!box) return;
    const items = this.state.items;
    if (!items.length) {
      box.innerHTML = `<div class="tiny muted" style="padding:8px 0 4px">还没选食物，从上面挑几样</div>`;
      $('#saveMeal').disabled = true;
      $('#saveMeal').textContent = '保存这一餐';
      return;
    }
    const total = sumItems(items);
    box.innerHTML = items.map(i => `<div class="bk-item">
      <div class="bk-nm"><b>${i.n}</b><p>${R(i.k)} kcal · 蛋白 ${R(i.p)}g · 脂肪 ${R(i.f)}g</p></div>
      <div class="qty">
        <button onclick="Add.stepG('${i.n}',-25)">−</button>
        <input type="number" inputmode="numeric" value="${i.g}" onchange="Add.setG('${i.n}',this.value)" onfocus="this.select()">
        <button onclick="Add.stepG('${i.n}',25)">+</button>
      </div>
      <button class="food-del" onclick="Add.remove('${i.n}')">×</button>
    </div>`).join('') + `<div class="bk-total"><span>这一餐合计</span><b>${R(total.k)} kcal</b></div>`;
    const btn = $('#saveMeal');
    btn.disabled = false;
    btn.textContent = `保存这一餐 · ${R(total.k)} kcal`;
  },

  save() {
    if (!this.state.items.length) { toast('先选至少一样食物'); return; }
    const id = 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const meal = {
      id,
      date: dstr(),
      type: this.state.type,
      ts: Date.now(),
      foods: this.state.items.map(i => ({
        n: i.n, g: i.g, k: +i.k.toFixed(1), p: +i.p.toFixed(1),
        f: +i.f.toFixed(1), cho: +i.cho.toFixed(1), fi: +i.fi.toFixed(1), na: +i.na.toFixed(1)
      })),
      photo: null
    };
    if (this.state.photo) {
      if (Store.rawSet(K.photo(id), this.state.photo)) meal.photo = this.state.photo;
      else toast('照片未能保存，记录已保存');
    }
    meals.push(meal);
    this.prunePhotos();
    if (!Store.set(K.meals, meals)) { toast('本机存储空间不足，请先导出并清理旧记录'); }
    Sheet.close();
    App.tab('today');
    toast('已记录，今天还能吃 ' + Math.max(0, R(Calc.plan(profile).kcal - dayNut(dstr()).k)) + ' kcal');
  },

  /* 只保留最近 21 天的照片，控制本机占用 */
  prunePhotos() {
    const cut = Date.now() - 21 * 864e5;
    meals.forEach(m => {
      if (m.ts < cut && m.photo) { Store.del(K.photo(m.id)); m.photo = null; }
    });
  }
};

/* ============================================================
 * 我的 - 编辑 / 打卡 / 导出
 * ============================================================ */
const Me = {
  edit() {
    const p = profile;
    const body = `
      <div class="field"><label>昵称</label>
        <input class="inp" id="eNick" value="${p.nickname || ''}" placeholder="怎么称呼你"></div>
      <div class="row2">
        <div class="field"><label>性别</label>
          <div class="chips" id="eSex">
            <button class="chip ${p.sex === 'm' ? 'on' : ''}" data-v="m" style="flex:1">男</button>
            <button class="chip ${p.sex === 'f' ? 'on' : ''}" data-v="f" style="flex:1">女</button>
          </div></div>
        <div class="field"><label>年龄</label><input class="inp" id="eAge" type="number" value="${p.age}"></div>
      </div>
      <div class="row2">
        <div class="field"><label>身高 <span class="hint">cm</span></label><input class="inp" id="eHeight" type="number" value="${p.height}"></div>
        <div class="field"><label>当前体重 <span class="hint">kg</span></label><input class="inp" id="eWeight" type="number" value="${p.weight}"></div>
      </div>
      <div class="field"><label>目标体重 <span class="hint">kg</span></label><input class="inp" id="eTarget" type="number" value="${p.target}"></div>
      <div class="field"><label>目标</label>
        <div class="chips" id="eGoal">
          <button class="chip ${p.goal === 'lose' ? 'on' : ''}" data-v="lose">减脂</button>
          <button class="chip ${p.goal === 'keep' ? 'on' : ''}" data-v="keep">维持</button>
          <button class="chip ${p.goal === 'gain' ? 'on' : ''}" data-v="gain">增肌</button>
        </div></div>
      <div class="field"><label>日常活动量</label>
        <div class="chips" id="eAct">
          ${ACT_OPTS.map(a => `<button class="chip ${p.act === a.v ? 'on' : ''}" data-v="${a.v}">${a.t}</button>`).join('')}
        </div></div>`;
    Sheet.open('编辑资料', body, `<button class="btn" onclick="Me.saveEdit()">保存</button>`);
  },

  saveEdit() {
    const get = (sel, dv) => { const el = $(sel); return el ? el.value : dv; };
    const on = (sel, attr) => { const el = $(sel + ' .chip.on'); return el ? el.getAttribute(attr) : null; };
    const p = {
      ...profile,
      nickname: (get('#eNick', '') || '').trim().slice(0, 8),
      sex: on('#eSex', 'data-v') || profile.sex,
      age: clamp(num(get('#eAge', profile.age)) || profile.age, 12, 90),
      height: clamp(num(get('#eHeight', profile.height)) || profile.height, 120, 220),
      weight: clamp(num(get('#eWeight', profile.weight)) || profile.weight, 30, 200),
      target: clamp(num(get('#eTarget', profile.target)) || profile.target, 30, 200),
      goal: on('#eGoal', 'data-v') || profile.goal,
      act: parseFloat(on('#eAct', 'data-v')) || profile.act
    };
    profile = p;
    Store.set(K.profile, p);
    const today = dstr();
    const w = weights.find(x => x.date === today);
    if (w) w.kg = p.weight; else weights.push({ date: today, kg: p.weight });
    Store.set(K.weights, weights);
    Sheet.close();
    App.tab('me');
    toast('已更新，预算重新算过了');
  },

  weigh() {
    const cur = weights.length ? weights[weights.length - 1].kg : profile.weight;
    const body = `<div class="field"><label>今天早上空腹的体重 <span class="hint">kg</span></label>
        <input class="inp" id="wKg" type="number" step="0.1" value="${cur}" style="font-size:22px;height:56px;font-weight:800;text-align:center">
        <p class="tiny muted" style="margin-top:8px">建议固定在同一时间、同样状态下称，趋势才有意义。</p></div>`;
    Sheet.open('体重打卡', body, `<button class="btn" onclick="Me.saveWeigh()">记录</button>`);
    setTimeout(() => { const el = $('#wKg'); if (el) { el.focus(); el.select(); } }, 260);
  },

  saveWeigh() {
    const kg = clamp(num($('#wKg').value) || profile.weight, 25, 250);
    const today = dstr();
    const w = weights.find(x => x.date === today);
    if (w) w.kg = kg; else weights.push({ date: today, kg });
    weights.sort((a, b) => a.date.localeCompare(b.date));
    Store.set(K.weights, weights);
    profile.weight = kg;
    Store.set(K.profile, profile);
    Sheet.close();
    App.tab('me');
    toast('已记录 ' + kg.toFixed(1) + ' kg');
  },

  exportData() {
    const rows = [['日期', '餐次', '食物', '重量(g)', '热量(kcal)', '蛋白(g)', '脂肪(g)', '碳水(g)', '钠(mg)']];
    meals.slice().sort((a, b) => a.ts - b.ts).forEach(m => {
      const tn = (MEAL_TYPES.find(x => x.id === m.type) || {}).name || m.type;
      (m.foods || []).forEach(f => {
        rows.push([m.date, tn, f.n, f.g, R(f.k), R(f.p), R(f.f), R(f.cho), R(f.na)]);
      });
    });
    const csv = '\ufeff' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `知食饮食记录_${dstr()}.csv`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1200);
    toast('已导出 CSV');
  },

  clear() {
    if (!confirm('将清空本机所有饮食记录、体重和照片，无法恢复。确定继续？')) return;
    meals.forEach(m => Store.del(K.photo(m.id)));
    meals = []; weights = [];
    Store.set(K.meals, []); Store.set(K.weights, []);
    App.tab('today');
    toast('已清空记录');
  }
};

/* ============================================================
 * 启动
 * ============================================================ */
function boot() {
  /* 体重按日去重，保留当天最后一次 */
  const wmap = {};
  weights.forEach(w => { if (w && w.date && isFinite(w.kg)) wmap[w.date] = w; });
  weights = Object.keys(wmap).sort().map(k => wmap[k]);
  Store.set(K.weights, weights);

  if (!profile) {
    $('#main').classList.add('hide');
    $('#onb').classList.remove('hide');
    Onb.init();
    Onb.next(1);
    setTimeout(() => Onb.syncTarget(), 10);
    return;
  }
  $('#onb').classList.add('hide');
  $('#main').classList.remove('hide');
  viewDate = dstr();
  App.tab('today');
}

/* 同步照片回填：老数据里 photo 只存了 key 的情况 */
(function hydratePhotos() {
  let changed = false;
  meals.forEach(m => {
    if (!m.photo) {
      const raw = Store.rawGet(K.photo(m.id));
      if (raw) { m.photo = raw; changed = true; }
    }
  });
  if (changed) Store.set(K.meals, meals);
})();

document.addEventListener('DOMContentLoaded', boot);
if (document.readyState !== 'loading') boot();
