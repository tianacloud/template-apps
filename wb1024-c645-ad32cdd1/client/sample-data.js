/* 示例数据：一键体验完整功能（可在「我的 → 清空全部记录」中清除） */
window.Sample = {
  /* 7 天饮食：offset 为距今天数，[食物名, 克数] */
  days: [
    { o: 6, m: [
      ['breakfast', [['豆浆', 300], ['油条', 55], ['鸡蛋', 50]], ''],
      ['lunch', [['米饭', 150], ['辣椒炒肉', 180], ['清炒时蔬', 200]], ''],
      ['dinner', [['米饭', 120], ['清蒸鱼', 150], ['蒜蓉西兰花', 200]], '']
    ] },
    { o: 5, m: [
      ['breakfast', [['全麦面包', 70], ['煎蛋', 55], ['牛奶', 250]], ''],
      ['lunch', [['兰州拉面', 500], ['卤牛肉', 50]], ''],
      ['dinner', [['米饭', 120], ['番茄炒蛋', 200], ['清炒时蔬', 200]], '']
    ] },
    { o: 4, m: [
      ['breakfast', [['小米粥', 300], ['小笼包', 120], ['鸡蛋', 50]], ''],
      ['lunch', [['黄焖鸡米饭', 450]], ''],
      ['dinner', [['米饭', 100], ['蒸排骨', 150], ['蒸豆角', 200]], '']
    ] },
    { o: 3, m: [
      ['breakfast', [['豆浆', 250], ['煎饼果子', 200]], ''],
      ['lunch', [['米饭', 150], ['小炒黄牛肉', 200], ['干锅花菜', 200]], ''],
      ['dinner', [['螺蛳粉', 500]], '']
    ] },
    { o: 2, m: [
      ['breakfast', [['无糖酸奶', 150], ['全麦面包', 70], ['香蕉', 120]], ''],
      ['lunch', [['糙米饭', 150], ['鸡胸肉', 140], ['西兰花', 200]], ''],
      ['dinner', [['米饭', 100], ['清蒸鱼', 150], ['手撕包菜', 200]], '']
    ] },
    { o: 1, m: [
      ['breakfast', [['豆浆', 300], ['包子', 100], ['鸡蛋', 50]], ''],
      ['lunch', [['米饭', 150], ['剁椒鱼头', 250], ['清炒时蔬', 200]], ''],
      ['dinner', [['米饭', 120], ['番茄炒蛋', 200], ['蒜蓉西兰花', 200]], '']
    ] },
    { o: 0, m: [
      ['breakfast', [['豆浆', 300], ['油条', 55], ['鸡蛋', 50]], 'breakfast'],
      ['lunch', [['米饭', 150], ['辣椒炒肉', 180], ['清炒时蔬', 200]], 'lunch'],
      ['dinner', [['米饭', 100], ['清蒸鱼', 150], ['蒜蓉西兰花', 220]], 'dinner']
    ] }
  ],

  weights: [76.5, 76.2, 76.3, 76.0, 75.8, 75.5, 75.2],

  load() {
    if (!window.FOOD_DB) { alert('数据加载中，请稍后重试'); return; }
    const pad = n => String(n).padStart(2, '0');
    const ds = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const hourMap = { breakfast: 7, lunch: 12, dinner: 18 };

    const newMeals = [];
    this.days.forEach(day => {
      const d = new Date();
      d.setDate(d.getDate() - day.o);
      d.setHours(0, 0, 0, 0);
      day.m.forEach(([type, items, photoKey], idx) => {
        const foods = [];
        items.forEach(([nm, g]) => {
          const f = FOOD_DB.find(x => x.n === nm);
          if (!f) return;
          const r = g / 100;
          foods.push({
            n: nm, g,
            k: +(f.k * r).toFixed(1), p: +(f.p * r).toFixed(1), f: +(f.f * r).toFixed(1),
            cho: +(f.cho * r).toFixed(1), fi: +(f.fi * r).toFixed(1), na: +(f.na * r).toFixed(1)
          });
        });
        const ts = new Date(d);
        ts.setHours(hourMap[type] || 12, idx === 0 ? 20 : 10, 0, 0);
        const id = 's' + day.o + '_' + type;
        newMeals.push({
          id, date: ds(d), type, ts: ts.getTime(), foods,
          photo: (photoKey && window.SAMPLE_PHOTOS && window.SAMPLE_PHOTOS[photoKey]) || null,
          sample: true
        });
      });
    });

    const p = {
      nickname: '老肖', sex: 'm', age: 36, height: 173,
      weight: 75.2, target: 71.1, startWeight: 76.5,
      goal: 'lose', act: 1.375, createdAt: Date.now()
    };

    const ws = this.weights.map((kg, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { date: ds(d), kg };
    });

    meals = newMeals;
    profile = p;
    weights = ws;
    Store.set(K.meals, meals);
    Store.set(K.profile, profile);
    Store.set(K.weights, weights);

    boot();
    toast('已载入 7 天示例记录，可随时在「我的」里清空');
  }
};
