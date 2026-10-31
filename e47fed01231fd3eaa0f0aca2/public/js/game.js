/* ============================================================
 * 《古墟寻踪》 Phaser 3 H5 解谜游戏
 * 青崖山先秦古陵调查 · 暗调国风
 * 依赖：Phaser 3.55.2（本地） / 20 张本地美术资产 / WebAudio 合成音效
 * 存档：应用数据库
 * ============================================================ */

// ---------- 全局常量 ----------
const FONT = '"Songti SC","STSong","SimSun","Noto Serif CJK SC","Noto Serif SC",serif';
const C = {
    gold: '#c4a066',      // 古铜黄（主色）
    goldNum: 0xc4a066,
    goldDim: '#a89268',   // 暗铜
    paper: '#e8e2d0',     // 纸白（正文）
    faint: '#8a7a58',     // 弱提示
    ok: '#9ab87a',        // 成功绿（低饱和）
    bad: '#b87a7a'        // 失败红（低饱和）
};

// ============================================================
// 一、存档数据模块
// ============================================================
const GameData = {
    currentSceneKey: 'entrance', // 当前场景标识
    inventory: [],               // 道具数组：{key, name, iconKey}
    noteList: [],                // 已收集笔记碎片 key（1~5）
    goodWeight: 0,               // 好结局分值
    badWeight: 0,                // 坏结局分值
    allNoteCollected: false,     // 是否集齐 5 份笔记（解锁隐藏密室）
    selectedItem: null,          // 当前选中背包道具
    gateOpen: false,             // 入口石门是否已解开
    doorOpen: false,             // 耳室铜锁石扉是否已开（通往火虫窟）
    smokeDone: false,            // 火虫窟艾草烟是否已点燃
    swarmSolved: false,          // 火虫节律谜题是否已解开
    lairBraziers: 0,             // 异兽虫渊已点亮的青铜灯数量（0~3）
    vaultOpen: false,            // 藏器库青铜宝匣是否已开启

    save() {
        return window.gameStorage.save(JSON.stringify(this));
    },
    load() {
        const s = window.gameStorage.current;
        if (s) { try { Object.assign(this, JSON.parse(s)); } catch (e) { /* 存档损坏则忽略 */ } }
    },
    reset() {
        this.currentSceneKey = 'entrance';
        this.inventory = [];
        this.noteList = [];
        this.goodWeight = 0;
        this.badWeight = 0;
        this.allNoteCollected = false;
        this.selectedItem = null;
        this.gateOpen = false;
        this.doorOpen = false;
        this.smokeDone = false;
        this.swarmSolved = false;
        this.lairBraziers = 0;
        this.vaultOpen = false;
        // 开局装备：随身手电
        this.addItem({ key: 'torch', name: '老式手电', iconKey: 'item_torch' });
        this.save();
    },
    addItem(item) {
        if (!this.inventory.find(i => i.key === item.key)) this.inventory.push(item);
    },
    hasItem(key) {
        return !!this.inventory.find(i => i.key === key);
    },
    addNote(k) {
        if (!this.noteList.includes(k)) {
            this.noteList.push(k);
            if (this.noteList.length >= 5) this.allNoteCollected = true;
        }
    }
};

// ============================================================
// 二、音效模块（WebAudio 实时合成，无需外部音频文件）
// ============================================================
const Sfx = {
    ctx: null, master: null, enabled: true,

    init() {
        if (this.ctx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try {
            this.ctx = new AC();
            this.master = this.ctx.createGain();
            this.master.gain.value = 0.8;
            this.master.connect(this.ctx.destination);
        } catch (e) { this.ctx = null; }
    },
    resume() {
        this.init();
        if (this.ctx && this.ctx.state !== 'running') {
            this.ctx.resume().catch(() => {});
        }
        // 音频就绪后补播环境音
        if (this.ctx && this.ctx.state === 'running' && Ambient.name && Ambient.nodes.length === 0) {
            const n = Ambient.name; Ambient.name = null; Ambient.play(n);
        }
    },
    toggle() {
        this.init();
        this.enabled = !this.enabled;
        if (this.master) this.master.gain.value = this.enabled ? 0.8 : 0;
        return this.enabled;
    },
    // 单音（可带滑音）
    tone(freq, dur, type, gain, when, slideTo) {
        this.init();
        if (!this.ctx || !this.enabled) return;
        const t = this.ctx.currentTime + (when || 0);
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(freq, t);
        if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain || 0.2, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(this.master);
        o.start(t); o.stop(t + dur + 0.05);
    },
    // 滤波噪声
    noise(dur, freq, gain, when) {
        this.init();
        if (!this.ctx || !this.enabled) return;
        const ctx = this.ctx, t = ctx.currentTime + (when || 0);
        const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource(); src.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(gain || 0.2, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(f); f.connect(g); g.connect(this.master);
        src.start(t);
    },
    // UI 点击：短促敲击
    click() { this.tone(680, 0.06, 'square', 0.10); this.tone(420, 0.08, 'square', 0.07, 0.035); },
    // 拾取：轻金属咔哒
    pick() { this.tone(1180, 0.05, 'square', 0.09); this.tone(880, 0.09, 'square', 0.07, 0.05); },
    // 解谜成功：低沉青铜鸣响
    success() {
        this.tone(196, 1.5, 'triangle', 0.12);
        this.tone(293, 1.1, 'triangle', 0.07, 0.05);
        this.tone(392, 1.1, 'triangle', 0.07, 0.10);
        this.tone(587, 1.0, 'triangle', 0.05, 0.15);
    },
    // 解谜错误：低沉嗡鸣 + 石块摩擦
    fail() {
        this.tone(96, 0.55, 'sawtooth', 0.13, 0, 68);
        this.tone(101, 0.55, 'sawtooth', 0.10, 0, 72);
        this.noise(0.28, 420, 0.10);
    }
};

// 环境音（循环）：entrance 山林风声 / tomb 古墓低沉回响与滴水
const Ambient = {
    name: null, nodes: [], timer: null,

    stop() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
        this.nodes.forEach(n => {
            try { if (n.stop) n.stop(); } catch (e) {}
            try { if (n.disconnect) n.disconnect(); } catch (e) {}
        });
        this.nodes = []; this.name = null;
    },
    play(name) {
        if (this.name === name) return;
        this.stop();
        this.name = name;
        Sfx.init();
        if (!Sfx.ctx) return;
        const ctx = Sfx.ctx;

        if (name === 'entrance') {
            // 风声：棕噪声 + 低通 + 双 LFO 缓慢起伏
            const len = ctx.sampleRate * 2;
            const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
            let last = 0;
            for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = w * 0.6 + last * 2.5; }
            const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
            const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.6;
            const g = ctx.createGain(); g.gain.value = 0.09;
            const lfo = ctx.createOscillator(); lfo.frequency.value = 0.11;
            const lfoG = ctx.createGain(); lfoG.gain.value = 240;
            lfo.connect(lfoG); lfoG.connect(lp.frequency);
            const lfo2 = ctx.createOscillator(); lfo2.frequency.value = 0.06;
            const lfo2G = ctx.createGain(); lfo2G.gain.value = 0.045;
            lfo2.connect(lfo2G); lfo2G.connect(g.gain);
            src.connect(lp); lp.connect(g); g.connect(Sfx.master);
            src.start(); lfo.start(); lfo2.start();
            this.nodes = [src, lp, g, lfo, lfoG, lfo2, lfo2G];

        } else if (name === 'tomb') {
            // 古墓：低频噪声底 + 51Hz 空荡嗡鸣 + 随机滴水
            const len = ctx.sampleRate * 2;
            const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
            let last = 0;
            for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = w * 0.5 + last * 3; }
            const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
            const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 150;
            const g = ctx.createGain(); g.gain.value = 0.11;
            src.connect(lp); lp.connect(g); g.connect(Sfx.master); src.start();
            const hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 51;
            const hg = ctx.createGain(); hg.gain.value = 0.045;
            hum.connect(hg); hg.connect(Sfx.master); hum.start();
            const drip = () => {
                const t = ctx.currentTime;
                const o = ctx.createOscillator(), og = ctx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(820, t);
                o.frequency.exponentialRampToValueAtTime(300, t + 0.12);
                og.gain.setValueAtTime(0.0001, t);
                og.gain.exponentialRampToValueAtTime(0.07, t + 0.015);
                og.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
                o.connect(og); og.connect(Sfx.master);
                o.start(t); o.stop(t + 0.6);
            };
            this.timer = setInterval(() => {
                if (this.name === 'tomb' && Math.random() < 0.55) drip();
            }, 3600);
            this.nodes = [src, lp, g, hum, hg];

        } else if (name === 'swarm') {
            // 火虫窟：洞窟低频底噪 + 偶发的高频虫鸣（短促连续三声）
            const len = ctx.sampleRate * 2;
            const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
            let last = 0;
            for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = w * 0.5 + last * 3; }
            const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
            const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 130;
            const g = ctx.createGain(); g.gain.value = 0.10;
            src.connect(lp); lp.connect(g); g.connect(Sfx.master); src.start();
            const chirp = () => {
                const base = 2100 + Math.random() * 900;
                for (let i = 0; i < 3; i++) {
                    Sfx.tone(base + Math.random() * 140, 0.05, 'sine', 0.016, i * 0.09);
                }
            };
            this.timer = setInterval(() => {
                if (this.name === 'swarm' && Math.random() < 0.72) chirp();
            }, 2800);
            this.nodes = [src, lp, g];
        } else if (name === 'lair') {
            // 异兽虫渊：低频隆隆 + 38Hz 空鸣 + 偶发高频窸窣
            const len = ctx.sampleRate * 2;
            const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
            let last = 0;
            for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = w * 0.5 + last * 3; }
            const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
            const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 120;
            const g = ctx.createGain(); g.gain.value = 0.12;
            src.connect(lp); lp.connect(g); g.connect(Sfx.master); src.start();
            const rum = ctx.createOscillator(); rum.type = 'sine'; rum.frequency.value = 38;
            const rg = ctx.createGain(); rg.gain.value = 0.05;
            rum.connect(rg); rg.connect(Sfx.master); rum.start();
            const skit = () => { Sfx.noise(0.18, 2600, 0.05); };
            this.timer = setInterval(() => {
                if (this.name === 'lair' && Math.random() < 0.5) skit();
            }, 2300);
            this.nodes = [src, lp, g, rum, rg];
        }
    }
};

// ============================================================
// 二·补、视觉特效模块（程序化纹理 / 氛围粒子 / 光晕 / 涟漪 / 浮动提示）
// 说明：所有粒子纹理均由 Canvas 程序化生成，不依赖外部图片
// ============================================================
const FX = {
    // ---- 纹理生成（BootScene 启动时调用一次，全局复用）----
    buildTextures(scene) {
        const mk = (key, w, h, draw) => {
            if (scene.textures.exists(key)) return;
            const ct = scene.textures.createCanvas(key, w, h);
            if (!ct) return;
            draw(ct.canvas.getContext('2d'), w, h);
            ct.refresh();
        };
        // 浮尘：柔和暖色微粒
        mk('fx_dust', 16, 16, (c, w, h) => {
            const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
            g.addColorStop(0, 'rgba(216,196,154,0.9)');
            g.addColorStop(0.45, 'rgba(216,196,154,0.32)');
            g.addColorStop(1, 'rgba(216,196,154,0)');
            c.fillStyle = g; c.fillRect(0, 0, w, h);
        });
        // 火星 / 金屑：高亮小点
        mk('fx_spark', 12, 12, (c, w, h) => {
            const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
            g.addColorStop(0, 'rgba(255,242,205,1)');
            g.addColorStop(0.35, 'rgba(232,200,144,0.8)');
            g.addColorStop(1, 'rgba(232,200,144,0)');
            c.fillStyle = g; c.fillRect(0, 0, w, h);
        });
        // 雾团：大而淡的软斑
        mk('fx_smoke', 72, 72, (c, w, h) => {
            const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
            g.addColorStop(0, 'rgba(170,172,178,0.14)');
            g.addColorStop(0.6, 'rgba(152,154,160,0.07)');
            g.addColorStop(1, 'rgba(140,142,148,0)');
            c.fillStyle = g; c.fillRect(0, 0, w, h);
        });
        // 碎石：深灰颗粒
        mk('fx_stone', 14, 14, (c, w, h) => {
            const g = c.createRadialGradient(w / 2 - 1, h / 2 - 1, 1, w / 2, h / 2, w / 2);
            g.addColorStop(0, 'rgba(128,120,106,0.95)');
            g.addColorStop(0.75, 'rgba(76,72,64,0.85)');
            g.addColorStop(1, 'rgba(54,52,47,0.55)');
            c.fillStyle = g;
            c.beginPath(); c.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); c.fill();
        });
        // 暖色光晕（烛火 / 木盒微光）
        mk('fx_glow', 160, 160, (c, w, h) => {
            const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
            g.addColorStop(0, 'rgba(232,200,140,0.34)');
            g.addColorStop(0.4, 'rgba(216,186,128,0.14)');
            g.addColorStop(1, 'rgba(216,186,128,0)');
            c.fillStyle = g; c.fillRect(0, 0, w, h);
        });
        // 火虫光点：幽绿偏金的冷光小斑
        mk('fx_bug', 14, 14, (c, w, h) => {
            const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
            g.addColorStop(0, 'rgba(228,255,216,1)');
            g.addColorStop(0.4, 'rgba(168,224,168,0.55)');
            g.addColorStop(1, 'rgba(168,224,168,0)');
            c.fillStyle = g; c.fillRect(0, 0, w, h);
        });
        // 冷绿光晕（火虫窟主光）
        mk('fx_glow_green', 160, 160, (c, w, h) => {
            const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
            g.addColorStop(0, 'rgba(168,224,168,0.30)');
            g.addColorStop(0.4, 'rgba(148,204,148,0.12)');
            g.addColorStop(1, 'rgba(148,204,148,0)');
            c.fillStyle = g; c.fillRect(0, 0, w, h);
        });
        // 蝙蝠剪影（飞行装饰生物）
        mk('fx_bat', 48, 24, (c) => {
            c.fillStyle = 'rgba(64,60,54,0.96)';
            c.beginPath();
            c.moveTo(24, 10);
            c.quadraticCurveTo(30, 2, 46, 4);
            c.quadraticCurveTo(38, 9, 34, 13);
            c.quadraticCurveTo(30, 10, 27, 14);
            c.lineTo(21, 14);
            c.quadraticCurveTo(18, 10, 14, 13);
            c.quadraticCurveTo(10, 9, 2, 4);
            c.quadraticCurveTo(18, 2, 24, 10);
            c.closePath(); c.fill();
            c.beginPath(); c.ellipse(24, 12, 4, 7, 0, 0, Math.PI * 2); c.fill();
        });
        // 暗角：四角压暗，聚焦画面中心
        mk('fx_vignette', 1200, 720, (c, w, h) => {
            const g = c.createRadialGradient(600, 360, 220, 600, 360, 660);
            g.addColorStop(0, 'rgba(0,0,0,0)');
            g.addColorStop(0.6, 'rgba(0,0,0,0.16)');
            g.addColorStop(1, 'rgba(0,0,0,0.6)');
            c.fillStyle = g; c.fillRect(0, 0, w, h);
        });
    },

    // ---- 跨版本粒子工厂 ----
    // 3.55.x：add.particles(x,y,key,config) 返回 ParticleEmitterManager 且 config 被丢弃，需 createEmitter
    // 3.60+ ：add.particles(x,y,key,config) 直接返回 ParticleEmitter
    // 统一返回发射对象；旧 API 返回值带 __manager（销毁时需一并销毁）
    _newAPI: null,
    emit(scene, x, y, key, config, depth) {
        if (this._newAPI === null) {
            const probe = scene.add.particles(-300, -300, key);
            this._newAPI = (typeof probe.createEmitter !== 'function');
            probe.destroy();
        }
        if (this._newAPI) {
            const em = scene.add.particles(x, y, key, config);
            if (depth !== undefined && em.setDepth) em.setDepth(depth);
            em.killEmit = () => { if (em.stop) em.stop(); };
            return em;
        }
        // 3.55 旧路径：add.particles 工厂参数错位（x,y,key 被当成 texture,frame,config），
        // 直接构造 ParticleEmitterManager 并挂入显示/更新列表
        const PEM = Phaser.GameObjects.Particles.ParticleEmitterManager;
        const mgr = new PEM(scene, key);
        scene.sys.displayList.add(mgr);
        scene.sys.updateList.add(mgr);
        mgr.setPosition(x, y);
        if (depth !== undefined) mgr.setDepth(depth);
        const em = mgr.createEmitter(config);
        em.__manager = mgr;
        em.killEmit = function () {
            if (typeof this.stop === 'function') { this.stop(); } else { this.on = false; }
        };
        return em;
    },

    // ---- 氛围粒子（常驻，随场景切换销毁）----
    // 古墓浮尘：缓慢上浮的暖色微粒
    motes(scene, tint) {
        const cfg = {
            x: { min: 0, max: 1200 }, y: { min: 0, max: 720 },
            lifespan: { min: 5200, max: 9200 },
            speedX: { min: -8, max: 8 }, speedY: { min: 2, max: 12 },
            gravityY: -2.5,
            scale: { min: 0.2, max: 0.55 },
            alpha: { start: 0.4, end: 0 },
            frequency: 240, quantity: 1
        };
        if (tint) cfg.tint = tint;
        return this.emit(scene, 0, 0, 'fx_dust', cfg, -5);
    },
    // 山间雾气：贴地缓移的大团软斑
    fog(scene) {
        return this.emit(scene, 0, 0, 'fx_smoke', {
            x: { min: -160, max: 1360 }, y: { min: 470, max: 780 },
            lifespan: { min: 10000, max: 16000 },
            speedX: { min: 5, max: 16 }, speedY: { min: -3, max: 2 },
            scale: { min: 1.8, max: 3.4 },
            alpha: { start: 0.55, end: 0 },
            frequency: 1900, quantity: 1
        }, -6);
    },
    // 烛火火星：金色火星袅袅上升
    embers(scene, x, y, w) {
        const hw = (w || 180) / 2;
        return this.emit(scene, 0, 0, 'fx_spark', {
            x: { min: x - hw, max: x + hw }, y: { min: y - 40, max: y + 20 },
            lifespan: { min: 1500, max: 2900 },
            speedX: { min: -12, max: 12 }, speedY: { min: -40, max: -18 },
            gravityY: -8,
            scale: { min: 0.3, max: 0.75 },
            alpha: { start: 0.85, end: 0 },
            tint: [0xc4a066, 0xe8c890, 0x9a7a48, 0xfff0c8],
            frequency: 220, quantity: 1,
            blendMode: 'ADD'
        }, -5);
    },
    // 顶部落石：主墓室震动氛围
    debris(scene) {
        return this.emit(scene, 0, 0, 'fx_stone', {
            x: { min: 80, max: 1120 }, y: -12,
            lifespan: { min: 1300, max: 1900 },
            speedY: { min: 130, max: 230 },
            gravityY: 40,
            angle: { min: 0, max: 360 },
            scale: { min: 0.35, max: 1.0 },
            alpha: { start: 0.75, end: 0 },
            frequency: 2400, quantity: 1
        }, -3);
    },
    // 灰烬飘落：坏结局氛围
    ash(scene) {
        return this.emit(scene, 0, 0, 'fx_dust', {
            x: { min: 0, max: 1200 }, y: -10,
            lifespan: { min: 6000, max: 11000 },
            speedX: { min: -14, max: 14 }, speedY: { min: 22, max: 60 },
            gravityY: 6,
            scale: { min: 0.25, max: 0.6 },
            alpha: { start: 0.34, end: 0 },
            tint: [0x8a8578, 0x6e6a60, 0xa8a294],
            frequency: 420, quantity: 1
        }, -5);
    },

    // 火虫群：一片缓慢漂移、明灭闪烁的幽绿光点
    firebugs(scene, x, y, w, h) {
        return this.emit(scene, 0, 0, 'fx_bug', {
            x: { min: x - w / 2, max: x + w / 2 }, y: { min: y - h / 2, max: y + h / 2 },
            lifespan: { min: 3600, max: 7200 },
            speedX: { min: -12, max: 12 }, speedY: { min: -9, max: 9 },
            scale: { min: 0.28, max: 0.85 },
            alpha: { start: 0.95, end: 0.05 },
            tint: [0xa8e0a0, 0xd6ffc8, 0xc8e6a8, 0x8cc88c],
            frequency: 130, quantity: 1,
            blendMode: 'ADD'
        }, -4);
    },
    // 冷绿光晕（位置固定，带呼吸闪烁）
    glowGreen(scene, x, y, scale, alpha) {
        const a = alpha || 0.14;
        const g = scene.add.image(x, y, 'fx_glow_green').setDepth(-6).setScale(scale || 4).setAlpha(a);
        scene.tweens.add({
            targets: g, alpha: { from: a * 0.55, to: a },
            duration: 1600 + Math.random() * 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        return g;
    },
    // 艾草烟：从点燃处袅袅升起的烟柱
    smokePlume(scene, x, y) {
        return this.emit(scene, 0, 0, 'fx_smoke', {
            x: { min: x - 26, max: x + 26 }, y: y,
            lifespan: { min: 5200, max: 8600 },
            speedX: { min: -10, max: 10 }, speedY: { min: -34, max: -14 },
            scale: { min: 1.4, max: 2.8 },
            alpha: { start: 0.42, end: 0 },
            tint: [0x9aa08a, 0xa8ab98],
            frequency: 260, quantity: 1
        }, -3);
    },
    // 蝙蝠掠过：三五只剪影横穿画面，翼缘扑动
    batsFly(scene) {
        const n = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) {
            const fromLeft = Math.random() < 0.5;
            const b = scene.add.image(fromLeft ? -40 : 1240, 90 + Math.random() * 220, 'fx_bat')
                .setDepth(-2).setScale(0.55 + Math.random() * 0.5);
            if (!fromLeft) b.setFlipX(true);
            const dur = 2200 + Math.random() * 1600;
            scene.tweens.add({
                targets: b, x: fromLeft ? 1240 : -40, duration: dur, ease: 'Sine.easeInOut',
                onComplete: () => b.destroy()
            });
            scene.tweens.add({ targets: b, y: '-=46', duration: dur / 2, yoyo: true, ease: 'Sine.easeInOut' });
            scene.tweens.add({
                targets: b, scaleX: b.flipX ? -b.scaleX * 0.72 : b.scaleX * 0.72,
                duration: 110, yoyo: true, repeat: Math.floor(dur / 110), ease: 'Sine.easeInOut'
            });
        }
    },

    // ---- 一次性特效 ----
    // 金屑爆开（拾取道具 / 点亮符文）
    burst(scene, x, y, tint, count) {
        const p = this.emit(scene, x, y, 'fx_spark', {
            lifespan: { min: 420, max: 900 },
            speed: { min: 60, max: 200 },
            scale: { min: 0.35, max: 0.85 },
            alpha: { start: 0.95, end: 0 },
            gravityY: 120,
            frequency: -1,
            tint: tint ? [tint, 0xe8c890, 0xfff0c8] : [0xe8c890, 0xc4a066, 0xfff0c8],
            blendMode: 'ADD'
        }, 80);
        p.explode(count || 12);
        scene.time.delayedCall(1100, () => {
            try { (p.__manager || p).destroy(); } catch (e) {}
        });
    },
    // 点击涟漪
    ripple(scene, x, y, color, size) {
        const ring = scene.add.circle(x, y, 10, color, 0).setStrokeStyle(2, color, 0.9).setDepth(80);
        scene.tweens.add({
            targets: ring, scale: (size || 56) / 10, alpha: 0,
            duration: 520, ease: 'Cubic.easeOut',
            onComplete: () => ring.destroy()
        });
    },
    // 浮动提示条（获得道具 / 笔记）
    toast(scene, text, color) {
        const t = scene.add.text(600, 214, text, {
            fontFamily: FONT, fontSize: 24, color: color || C.gold,
            backgroundColor: 'rgba(8,8,8,0.78)', padding: { x: 20, y: 9 }
        }).setOrigin(0.5).setDepth(90).setAlpha(0);
        scene.tweens.add({
            targets: t, alpha: 1, y: 200, scale: { from: 0.82, to: 1 },
            duration: 280, ease: 'Back.easeOut'
        });
        scene.tweens.add({
            targets: t, alpha: 0, y: 168, delay: 950, duration: 650,
            ease: 'Cubic.easeIn', onComplete: () => t.destroy()
        });
    },
    // 暖光晕（位置固定，带呼吸闪烁）
    glow(scene, x, y, scale, alpha) {
        const a = alpha || 0.16;
        const g = scene.add.image(x, y, 'fx_glow').setDepth(-6).setScale(scale || 2.6).setAlpha(a);
        scene.tweens.add({
            targets: g, alpha: { from: a * 0.55, to: a },
            duration: 1100 + Math.random() * 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        return g;
    },
    // 画面暗角（常驻）
    vignette(scene) {
        return scene.add.image(600, 360, 'fx_vignette').setDepth(-4);
    }
};

// ============================================================
// 三、通用 UI：仿古文字按钮（ui_btn 底图 + 文字）
// ============================================================
function makeTextButton(scene, x, y, text, fontSize, cb) {
    const t = scene.add.text(x, y, text, {
        fontFamily: FONT, fontSize: fontSize, color: '#e8dcc0', align: 'center'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const w = Math.max(220, t.width + 64);
    const h = Math.max(60, fontSize + 36);
    const bg = scene.add.image(x, y, 'ui_btn').setDisplaySize(w, h).setDepth(t.depth - 1);
    t.on('pointerdown', () => { Sfx.click(); cb(); });
    t.on('pointerover', () => {
        t.setColor('#ffffff'); bg.setTint(0xe0cfa0);
        if (t._ht) t._ht.remove();
        t._ht = scene.tweens.add({ targets: [t, bg], scale: 1.06, duration: 150, ease: 'Cubic.easeOut' });
    });
    t.on('pointerout', () => {
        t.setColor('#e8dcc0'); bg.clearTint();
        if (t._ht) t._ht.remove();
        t._ht = scene.tweens.add({ targets: [t, bg], scale: 1, duration: 150, ease: 'Cubic.easeOut' });
    });
    return { bg: bg, t: t };
}

// ============================================================
// 四、资源预加载场景
// ============================================================
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() {
        this.add.text(600, 292, '古墟寻踪 · 载入中', { fontFamily: FONT, fontSize: 28, color: C.goldDim }).setOrigin(0.5);
        this.add.rectangle(600, 360, 360, 12, 0x2a2216, 1);
        const bar = this.add.rectangle(424, 360, 0, 12, C.goldNum, 1).setOrigin(0, 0.5);
        this.load.on('progress', p => { bar.width = 352 * p; });

        // ===== 场景背景图 =====
        ['bg_entrance', 'bg_corridor', 'bg_hall', 'bg_room', 'bg_swarm', 'bg_lair', 'bg_vault', 'bg_front', 'bg_main', 'bg_secret']
            .forEach(k => this.load.image(k, window.gameAssets[k + '.jpg']));
        // ===== 道具图标 =====
        ['item_map', 'item_torch', 'item_bamboo1', 'item_bamboo2', 'item_bronze', 'item_key', 'item_herb', 'item_charm']
            .forEach(k => this.load.image(k, window.gameAssets[k + '.png']));
        // ===== UI 素材 =====
        this.load.image('ui_btn', window.gameAssets['ui_btn.png']);
        this.load.image('ui_puzzle_bg', window.gameAssets['ui_puzzle_bg.png']);
    }
    create() {
        FX.buildTextures(this);
        GameData.load();
        this.scene.start('StartScene');
    }
}

// ============================================================
// 五、开篇启动首页
// ============================================================
class StartScene extends Phaser.Scene {
    constructor() { super('StartScene'); }
    create() {
        this.cameras.main.fadeIn(700, 0, 0, 0);

        // 背景缓慢推近（Ken Burns）+ 山雾 + 浮尘 + 暗角
        const bgImg = this.add.image(600, 360, 'bg_entrance').setDepth(-10);
        this.tweens.add({ targets: bgImg, scale: { from: 1, to: 1.08 }, duration: 18000, ease: 'Linear' });
        FX.vignette(this);
        FX.fog(this);
        FX.motes(this);

        this.add.rectangle(600, 360, 1200, 720, 0x030303, 0.62);

        // 标题：淡入 + 金色呼吸光晕
        const titleTxt = this.add.text(600, 148, '古墟寻踪', { fontFamily: FONT, fontSize: 80, color: C.gold }).setOrigin(0.5);
        titleTxt.setAlpha(0);
        this.tweens.add({ targets: titleTxt, alpha: 1, duration: 900, ease: 'Cubic.easeOut' });
        this.tweens.add({
            targets: titleTxt, alpha: { from: 0.78, to: 1 }, duration: 2300,
            delay: 950, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        this.add.text(600, 224, '—— 青崖山先秦古陵调查记录 ——', { fontFamily: FONT, fontSize: 24, color: C.goldDim }).setOrigin(0.5);
        // 装饰分隔线：金线 + 两端菱形
        this.add.rectangle(600, 262, 300, 1, C.goldNum, 0.4);
        this.add.rectangle(446, 262, 7, 7, C.goldNum, 0.85).setAngle(45);
        this.add.rectangle(754, 262, 7, 7, C.goldNum, 0.85).setAngle(45);

        const story =
            '耳机里传来陈队的声音：\n' +
            '“林砚，青崖山发现盗洞。一伙盗墓贼三天前进山，之后彻底失联。\n' +
            '古墓结构已经被人为破坏，随时有坍塌风险。你的任务：进入陵内，记录遗迹现状，\n' +
            '抢救残存文物，收集盗掘团伙的线索。记住——优先保护古迹，不要强行触碰未知机关。\n' +
            '支援队伍正在路上，你注意安全。”\n\n' +
            '山林雾气弥漫，崖壁上一个粗糙的盗洞赫然在目。\n' +
            '你握紧手电，望向漆黑的洞口……';
        this.add.text(600, 380, story, {
            fontFamily: FONT, fontSize: 19, color: C.paper, align: 'center', lineSpacing: 10
        }).setOrigin(0.5);

        makeTextButton(this, 600, 566, '【 开始调查 】', 30, () => {
            GameData.reset();
            this.cameras.main.fadeOut(420, 0, 0, 0);
            this.time.delayedCall(440, () => this.scene.start('GameScene'));
        });

        if (window.gameStorage.current) {
            makeTextButton(this, 600, 646, '【 继续上次调查 】', 22, () => {
                GameData.load();
                this.cameras.main.fadeOut(420, 0, 0, 0);
                this.time.delayedCall(440, () => this.scene.start('GameScene'));
            });
        } else {
            this.add.text(600, 646, '提示：点击画面中浮现高亮边框的区域即可进行调查', {
                fontFamily: FONT, fontSize: 16, color: C.faint
            }).setOrigin(0.5);
        }


    }
}

// ============================================================
// 六、谜题弹窗场景（石碑符文 / 甬道地砖 / 总机关口令，复用）
// ============================================================
class PuzzlePanelScene extends Phaser.Scene {
    constructor() { super('PuzzlePanelScene'); }
    init(data) {
        this.puzzleType = data.type;
        this.callback = data.callback;
        this.host = data.host || null;
    }
    create() {
        Sfx.resume();
        // 打开弹窗时屏蔽主场景输入，避免穿透点击
        if (this.host) this.host.input.enabled = false;
        // 关键修复：Phaser 不会自动调用名为 shutdown 的类方法，
        // 必须监听 shutdown 事件，确保面板关闭（任何路径）后主场景输入被还原。
        this.events.once('shutdown', () => { if (this.host) this.host.input.enabled = true; });

        // 压暗背景（淡入）
        this.dim = this.add.rectangle(600, 360, 1200, 720, 0x000000, 0);
        this.tweens.add({ targets: this.dim, alpha: 0.62, duration: 280 });

        // 面板容器：整体弹入动画（交互热区保持在根层，保证点击稳定）
        this.panel = this.add.container(0, 0).setDepth(1);
        this.panel.add(this.add.image(600, 360, 'ui_puzzle_bg'));

        const titles = { symbol: '石碑符文', order: '甬道地砖', password: '总机关口令', swarm: '火虫节律' };
        this.panel.add(this.add.text(600, 116, titles[this.puzzleType] || '谜题', {
            fontFamily: FONT, fontSize: 32, color: C.gold
        }).setOrigin(0.5));

        const close = this.add.text(1078, 96, '✕ 离开', {
            fontFamily: FONT, fontSize: 20, color: C.goldDim
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        close.on('pointerdown', () => { Sfx.click(); this.closePanel(false); });
        close.on('pointerover', () => close.setColor('#f0e2bd'));
        close.on('pointerout', () => close.setColor(C.goldDim));

        this.inputKeys = [];
        this.locked = false;
        this._closing = false;
        this.inputDisp = this.add.text(600, 200, '', { fontFamily: FONT, fontSize: 30, color: C.gold }).setOrigin(0.5);
        this.hint = this.add.text(600, 566, '', { fontFamily: FONT, fontSize: 18, color: C.faint }).setOrigin(0.5);
        this.panel.add(this.inputDisp);
        this.panel.add(this.hint);

        this.panel.setScale(0.86);
        this.panel.setAlpha(0);
        this.tweens.add({ targets: this.panel, scale: 1, alpha: 1, duration: 420, ease: 'Back.easeOut' });

        if (this.puzzleType === 'symbol') {
            this.buildPuzzle(['日', '月', '山', '水'], [1, 3, 2, 4], '按碑文记载的次序，依次点击四个符文');
        } else if (this.puzzleType === 'order') {
            this.buildPuzzle(['1', '2', '3', '4'], [2, 1, 4, 3], '按甬道壁画的时序，依次点击地砖');
        } else if (this.puzzleType === 'swarm') {
            this.buildSwarm();
        } else {
            this.buildPuzzle(['1', '2', '3', '4'], [2, 4, 1, 3], '竹简①② 的刻文拼成四位口令，依次点击');
        }
    }
    shutdown() {
        // 兜底：即便事件未触发，也确保主场景输入被还原（避免解谜后面板残留导致后续关卡点不动）
        if (this.host) this.host.input.enabled = true;
    }
    // 关闭面板：收缩淡出后回调
    closePanel(success) {
        if (this._closing) return;
        this._closing = true;
        this.tweens.add({ targets: this.panel, scale: 0.9, alpha: 0, duration: 190, ease: 'Cubic.easeIn' });
        this.tweens.add({ targets: this.dim, alpha: 0, duration: 190 });
        this.time.delayedCall(200, () => {
            if (success && this.callback) this.callback(true);
            if (this.host) this.host.input.enabled = true; // 兜底还原主场景输入
            this.scene.stop();
        });
    }
    buildPuzzle(glyphs, answer, hint) {
        this.glyphs = glyphs;
        this.answer = answer;
        this.hint.setText(hint);
        this.cells = [];
        for (let i = 0; i < 4; i++) {
            const bx = 330 + i * 180, by = 380, s = 128;
            const cell = this.add.rectangle(bx, by, s, s, 0x161208, 0.95).setStrokeStyle(2, 0x5a4a2c, 1);
            const glyph = this.add.text(bx, by, glyphs[i], { fontFamily: FONT, fontSize: 58, color: C.gold }).setOrigin(0.5);
            this.panel.add(cell);
            this.panel.add(glyph);
            const z = this.add.zone(bx, by, s, s).setInteractive({ useHandCursor: true });
            z.on('pointerover', () => cell.setStrokeStyle(2, C.goldNum, 1));
            z.on('pointerout', () => cell.setStrokeStyle(2, 0x5a4a2c, 1));
            z.on('pointerdown', () => this.press(i + 1));
            this.cells.push({ cell: cell, glyph: glyph, x: bx, y: by });
        }
    }
    press(v) {
        if (this.locked || this._closing) return;
        Sfx.click();
        // 按压反馈：涟漪 + 回弹
        const c = this.cells[v - 1];
        if (c) {
            FX.ripple(this, c.x, c.y, C.goldNum, 90);
            this.tweens.add({ targets: [c.cell, c.glyph], scale: { from: 0.9, to: 1 }, duration: 240, ease: 'Back.easeOut' });
        }
        this.inputKeys.push(v);
        this.inputDisp.setText(this.inputKeys.map(x => this.glyphs[x - 1]).join('   '));
        if (this.inputKeys.length < 4) return;
        this.locked = true;
        if (JSON.stringify(this.inputKeys) === JSON.stringify(this.answer)) {
            Sfx.success();
            this.hint.setText('……机关应声而开。').setColor(C.ok);
            // 四枚符文依次点亮，金光绽开
            this.cells.forEach((cc, i) => {
                this.time.delayedCall(140 + i * 130, () => {
                    cc.cell.setFillStyle(0x4a3a1c, 1);
                    cc.cell.setStrokeStyle(2, 0xe8c890, 1);
                    cc.glyph.setColor('#ffe9b8');
                    FX.burst(this, cc.x, cc.y, 0xe8c890, 10);
                });
            });
            this.time.delayedCall(1050, () => this.closePanel(true));
        } else {
            Sfx.fail();
            this.hint.setText('次序不对，再仔细看看线索。').setColor(C.bad);
            this.inputDisp.setColor(C.bad);
            this.tweens.add({
                targets: this.panel, x: { from: -9, to: 9 }, duration: 55,
                yoyo: true, repeat: 5, onComplete: () => { this.panel.x = 0; }
            });
            this.time.delayedCall(760, () => {
                this.inputKeys = [];
                this.inputDisp.setText('').setColor(C.gold);
                this.locked = false;
            });
        }
    }
    // ---- 火虫节律：记忆序列谜题（先演示，后复现）----
    buildSwarm() {
        this.glyphs = ['一', '二', '三', '四'];
        this.answer = [3, 1, 4, 2];
        this.hint.setY(505); // 避开面板底部的古纹边框
        this.hint.setText('先看虫群的节律演示，再按相同次序点亮四盏引虫灯');
        this.lamps = [];
        for (let i = 0; i < 4; i++) {
            const bx = 330 + i * 180, by = 380;
            const lamp = this.add.circle(bx, by, 54, 0x14201a).setStrokeStyle(2, 0x3a5a48, 1);
            this.panel.add(lamp);
            const z = this.add.zone(bx, by, 108, 108).setInteractive({ useHandCursor: true });
            z.on('pointerdown', () => this.pressSwarm(i + 1));
            this.lamps.push({ lamp: lamp, x: bx, y: by });
        }
        // 节律演示：锁定输入，逐盏亮起
        this.locked = true;
        for (let i = 0; i < this.answer.length; i++) {
            this.time.delayedCall(650 + i * 780, () => this.flashLamp(this.answer[i] - 1));
        }
        this.time.delayedCall(650 + this.answer.length * 780 + 200, () => {
            this.locked = false;
            this.hint.setText('照着方才的节律，依次点亮四盏引虫灯');
        });
    }
    // 引虫灯亮灭反馈（带一声虫鸣音高的音）
    flashLamp(idx) {
        const l = this.lamps[idx];
        if (!l) return;
        Sfx.tone(440 + idx * 140, 0.30, 'sine', 0.07);
        l.lamp.setFillStyle(0x9adf9a, 0.95);
        l.lamp.setStrokeStyle(2, 0xd6ffc8, 1);
        FX.burst(this, l.x, l.y, 0xa8e0a0, 8);
        this.time.delayedCall(340, () => {
            l.lamp.setFillStyle(0x14201a, 1);
            l.lamp.setStrokeStyle(2, 0x3a5a48, 1);
        });
    }
    pressSwarm(v) {
        if (this.locked || this._closing) return;
        Sfx.click();
        const l = this.lamps[v - 1];
        FX.ripple(this, l.x, l.y, 0xa8e0a0, 84);
        this.flashLamp(v - 1);
        this.inputKeys.push(v);
        this.inputDisp.setText(this.inputKeys.map(x => this.glyphs[x - 1]).join('   '));
        if (this.inputKeys.length < 4) return;
        this.locked = true;
        if (JSON.stringify(this.inputKeys) === JSON.stringify(this.answer)) {
            Sfx.success();
            this.hint.setText('节律吻合，虫群让开了一条道。').setColor(C.ok);
            this.lamps.forEach((ll, i) => {
                this.time.delayedCall(130 + i * 130, () => {
                    ll.lamp.setFillStyle(0x9adf9a, 0.95);
                    ll.lamp.setStrokeStyle(2, 0xd6ffc8, 1);
                    FX.burst(this, ll.x, ll.y, 0xa8e0a0, 10);
                });
            });
            this.time.delayedCall(1050, () => this.closePanel(true));
        } else {
            Sfx.fail();
            this.hint.setText('节律不对，火虫们重新演示了一遍……').setColor(C.bad);
            this.inputDisp.setColor(C.bad);
            this.tweens.add({
                targets: this.panel, x: { from: -9, to: 9 }, duration: 55,
                yoyo: true, repeat: 5, onComplete: () => { this.panel.x = 0; }
            });
            this.time.delayedCall(820, () => {
                this.inputKeys = [];
                this.inputDisp.setText('').setColor(C.gold);
                this.lamps.forEach(ll => { ll.lamp.setFillStyle(0x14201a, 1); ll.lamp.setStrokeStyle(2, 0x3a5a48, 1); });
                // 重播演示
                this.answer.forEach((v2, i2) => this.time.delayedCall(500 + i2 * 780, () => this.flashLamp(v2 - 1)));
                this.time.delayedCall(500 + this.answer.length * 780, () => { this.locked = false; });
            });
        }
    }
}

// ============================================================
// 七、核心游戏主场景（10 个场景 + 热点 + 道具 + 剧情分支）
// ============================================================
class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }
    create() {
        this.currentKey = GameData.currentSceneKey;
        this.hotspots = [];   // 场景热点（zone + 高亮框 + 提示标签）
        this.choiceBtns = []; // 剧情选择按钮
        this.bg = null;
        this.typing = false;
        this.dlgPages = [''];
        this.dlgPage = 0;
        this.typeEvent = null;
        this.fullText = '';
        this.fxList = [];     // 场景氛围粒子（切换时销毁）
        this.glowList = [];   // 固定光晕
        this.tremor = null;   // 主墓室震动定时器
        this.charIdx = 0;

        // ---------- 顶部操作栏 ----------
        const mkTop = (x, label, cb) => {
            const t = this.add.text(x, 44, label, {
                fontFamily: FONT, fontSize: 20, color: C.goldDim
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            t.on('pointerdown', () => { Sfx.click(); cb(); });
            t.on('pointerover', () => t.setColor('#f0e2bd'));
            t.on('pointerout', () => t.setColor(C.goldDim));
            return t;
        };
        mkTop(110, '📜 日志', () => this.openLog());
        mkTop(250, '💾 存档', () => { GameData.save().then(() => this.showDialog('进度已保存。')).catch(() => this.showDialog('保存结果未确认，请刷新后检查。')); });
        mkTop(390, '📂 读档', async () => {
            try { await window.gameStorage.refresh(); } catch { this.showDialog('读取失败，请检查网络后重试。'); return; }
            GameData.load();
            this.currentKey = GameData.currentSceneKey;
            this.refreshInventory();
            this.loadCurrentScene();
            this.showDialog('进度已读取。');
        });
        mkTop(530, '🔊 音效', () => {
            this.showDialog(Sfx.toggle() ? '音效已开启。' : '音效已关闭。');
        });
        this.noteText = this.add.text(1120, 44, '', {
            fontFamily: FONT, fontSize: 20, color: C.faint
        }).setOrigin(0.5);

        // ---------- 底部对话框 ----------
        this.add.zone(600, 622, 1080, 74).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.dlgNext());
        this.add.rectangle(600, 622, 1080, 74, 0x0b0b0c, 0.78).setStrokeStyle(1, 0x4a3a22, 0.9);
        this.add.rectangle(61, 622, 4, 58, C.goldNum, 0.8);
        this.add.text(80, 577, '调 查 记 录', { fontFamily: FONT, fontSize: 13, color: C.faint });
        this.dlgText = this.add.text(84, 587, '', {
            fontFamily: FONT, fontSize: 20, color: C.paper, wordWrap: { width: 1026 }, lineSpacing: 6
        });
        // 画面暗角（常驻，跨场景保留）
        FX.vignette(this);

        // ---------- 背包栏 ----------
        this.add.text(56, 690, '背包', { fontFamily: FONT, fontSize: 16, color: C.faint }).setOrigin(0, 0.5);
        this.invContainer = this.add.container(600, 690);
        this.selRing = this.add.graphics();
        this.refreshInventory();

        // ---------- 进入当前场景 ----------
        this.loadCurrentScene();


    }

    // ---------- 对话框：打字机 + 分页 ----------
    _type(text, instant) {
        if (this.typeEvent) { this.typeEvent.remove(); this.typeEvent = null; }
        this.fullText = text;
        if (instant || !text) {
            this.typing = false;
            this.dlgText.setText(text);
            return;
        }
        this.typing = true;
        this.charIdx = 0;
        this.dlgText.setText('');
        this.typeEvent = this.time.addEvent({
            delay: 26, repeat: text.length - 1,
            callback: () => {
                this.charIdx++;
                const done = this.charIdx >= this.fullText.length;
                this.dlgText.setText(this.fullText.substring(0, this.charIdx) + (done ? '' : '▍'));
                if (done) {
                    this.typing = false;
                    this.typeEvent.remove(); this.typeEvent = null;
                }
            }
        });
    }
    _finishType() {
        if (this.typeEvent) { this.typeEvent.remove(); this.typeEvent = null; }
        this.typing = false;
        this.dlgText.setText(this.fullText);
    }
    dlgNext() {
        if (this.typing) { this._finishType(); return; }
        if (this.dlgPage < this.dlgPages.length - 1) {
            this.dlgPage++;
            this._type(this.dlgPages[this.dlgPage], false);
        }
    }
    showDialog(text, instant) {
        this.dlgPages = [text];
        this.dlgPage = 0;
        this._type(text, !!instant);
    }
    showPages(pages) {
        this.dlgPages = pages;
        this.dlgPage = 0;
        this._type(pages[0], false);
    }

    // ---------- 背包 ----------
    refreshInventory() {
        this.invContainer.removeAll(true);
        const n = GameData.inventory.length;
        GameData.inventory.forEach((item, idx) => {
            const rx = (idx - (n - 1) / 2) * 64;
            const icon = this.add.image(rx, 0, item.iconKey).setScale(0.55);
            icon.setInteractive({ useHandCursor: true });
            icon.on('pointerdown', () => {
                if (this.scene.isActive('PuzzlePanelScene')) return;
                Sfx.click();
                GameData.selectedItem =
                    (GameData.selectedItem && GameData.selectedItem.key === item.key) ? null : item;
                this.refreshInventory();
                if (GameData.selectedItem) {
                    const n2 = GameData.inventory.length;
                    const i2 = GameData.inventory.findIndex(i => i.key === GameData.selectedItem.key);
                    FX.ripple(this, 600 + (i2 - (n2 - 1) / 2) * 64, 690, C.goldNum, 46);
                }
                this.showDialog(GameData.selectedItem ? '已选中【' + item.name + '】。' : '已取消选择。');
            });
            this.invContainer.add(icon);
        });
        this._drawSelRing(n);
        this._updateNoteUI();
    }
    _drawSelRing(n) {
        this.selRing.clear();
        if (!GameData.selectedItem) return;
        const idx = GameData.inventory.findIndex(i => i.key === GameData.selectedItem.key);
        if (idx < 0) return;
        const rx = (idx - (n - 1) / 2) * 64;
        this.selRing.lineStyle(2, C.goldNum, 0.95);
        this.selRing.strokeRoundedRect(600 + rx - 28, 690 - 28, 56, 56, 8);
    }
    _updateNoteUI() {
        this.noteText.setText('笔记 ' + GameData.noteList.length + '/5');
    }

    // ---------- 获得道具（弹入动画 + 金屑 + 浮动提示）----------
    gainItem(item) {
        const isNew = !GameData.hasItem(item.key);
        GameData.addItem(item);
        this.refreshInventory();
        if (isNew) {
            const n = GameData.inventory.length;
            const icon = this.invContainer.getAt(n - 1);
            if (icon) {
                icon.setScale(0);
                this.tweens.add({ targets: icon, scale: 0.55, duration: 520, delay: 80, ease: 'Back.easeOut' });
            }
            const wx = 600 + ((n - 1) - (n - 1) / 2) * 64;
            FX.burst(this, wx, 690, 0xc4a066, 14);
            FX.toast(this, '获得 ' + item.name);
            Sfx.pick();
        }
    }

    // ---------- 获得笔记碎片（金光 + 浮动提示）----------
    gainNote(k) {
        const isNew = !GameData.noteList.includes(k);
        GameData.addNote(k);
        this._updateNoteUI();
        if (isNew) {
            Sfx.pick();
            FX.toast(this, '获得 阿凯的笔记碎片 ' + '①②③④⑤'[k - 1]);
            FX.burst(this, 600, 330, 0xc4a066, 18);
        }
    }

    // ---------- 日志 ----------
    openLog() {
        const pages = ['【阿凯的笔记碎片 · 收集进度 ' + GameData.noteList.length + '/5】'];
        if (GameData.noteList.length === 0) {
            pages.push('还没有收集到任何碎片。留意解开谜题后出现的线索。');
        } else {
            GameData.noteList.slice().sort((a, b) => a - b)
                .forEach(k => pages.push('碎片' + k + '：' + this.getNoteText(k)));
        }
        this.showPages(pages);
    }
    getNoteText(key) {
        const map = {
            1: '老周不听劝，踩错地砖，石头砸下来，老张没跑出去。',
            2: '老周疯了，一定要进主棺。总机关一旦启动，整座山都会震动。',
            3: '我把机关线索藏在竹简与拓片里。',
            4: '壁画顺序就是陵墓修建的先后次序。',
            5: '销赃名单藏在夹层密室木盒内。'
        };
        return map[key] || '';
    }

    // ---------- 场景切换 ----------
    loadCurrentScene() {
        // 清理上一场景（防止背景叠加 / 热点残留 / 特效泄漏）
        this.hotspots.forEach(h => h.destroy());
        this.hotspots = [];
        this.choiceBtns.forEach(b => { b.bg.destroy(); b.t.destroy(); });
        this.choiceBtns = [];
        if (this.bg) { this.bg.destroy(); this.bg = null; }
        this.fxList.forEach(f => {
            if (!f) return;
            try { if (f.__manager) { f.__manager.destroy(); } else if (f.destroy) f.destroy(); } catch (e) {}
        });
        this.fxList = [];
        this.glowList.forEach(g => { if (g && g.destroy) g.destroy(); });
        this.glowList = [];
        if (this.tremor) { this.tremor.remove(); this.tremor = null; }
        if (this._batsTimer) { this._batsTimer.remove(); this._batsTimer = null; }
        if (this._lairTimer) { this._lairTimer.remove(); this._lairTimer = null; }
        Ambient.stop();
        this._updateNoteUI();
        this.cameras.main.fadeIn(360, 0, 0, 0);
        // 入场：轻微推镜，画面“落定”
        this.cameras.main.setZoom(1.03);
        this.tweens.add({ targets: this.cameras.main, zoom: 1, duration: 950, ease: 'Cubic.easeOut' });

        switch (this.currentKey) {
            case 'corridor': this.loadCorridorScene(); break;
            case 'hall': this.loadHallScene(); break;
            case 'room': this.loadRoomScene(); break;
            case 'swarm': this.loadSwarmScene(); break;
            case 'lair': this.loadLairScene(); break;
            case 'vault': this.loadVaultScene(); break;
            case 'front': this.loadFrontScene(); break;
            case 'main': this.loadMainScene(); break;
            case 'secret': this.loadSecretScene(); break;
            default: this.loadEntranceScene();
        }
    }
    gotoScene(key) {
        this.cameras.main.fadeOut(320, 0, 0, 0);
        this.tweens.add({ targets: this.cameras.main, zoom: 0.985, duration: 320, ease: 'Cubic.easeIn' });
        this.time.delayedCall(340, () => {
            GameData.currentSceneKey = key;
            GameData.save();
            this.currentKey = key;
            this.loadCurrentScene();
        });
    }

    // ---------- 热点工厂：悬停脉冲高亮 + 标签提示 + 点击涟漪 ----------
    addHotspot(x, y, w, h, label, onDown) {
        const g = this.add.graphics();
        const tip = this.add.text(x, y - h / 2 - 16, label, {
            fontFamily: FONT, fontSize: 16, color: '#d8c49a',
            backgroundColor: 'rgba(8,8,8,0.8)', padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setAlpha(0);
        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
        const draw = (a) => {
            g.clear(); g.setAlpha(a);
            g.lineStyle(2, C.goldNum, 1);
            g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
        };
        let pulse = null;
        zone.on('pointerover', () => {
            draw(0.5);
            if (pulse) pulse.remove();
            pulse = this.tweens.add({
                targets: g, alpha: { from: 0.5, to: 0.8 },
                duration: 760, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
            tip.setAlpha(1); tip.setScale(0.86);
            this.tweens.add({ targets: tip, scale: 1, duration: 220, ease: 'Back.easeOut' });
        });
        zone.on('pointerout', () => {
            if (pulse) { pulse.remove(); pulse = null; }
            g.clear(); g.setAlpha(0);
            this.tweens.add({ targets: tip, alpha: 0, duration: 160 });
        });
        zone.on('pointerdown', () => {
            Sfx.click();
            FX.ripple(this, x, y, C.goldNum, Math.max(w, h) * 0.9);
            draw(0.95);
            this.time.delayedCall(180, () => { if (!pulse) { g.clear(); g.setAlpha(0); } });
            onDown();
        });
        this.hotspots.push(zone, g, tip);
        return zone;
    }

    // ---------- 剧情选择按钮（一次性，选定即锁定） ----------
    addChoice(x, y, text, cb) {
        const b = makeTextButton(this, x, y, text, 20, () => {
            this.tweens.add({ targets: [b.t, b.bg], scale: 1.07, duration: 170, yoyo: true, ease: 'Cubic.easeOut' });
            this.choiceBtns.forEach(o => {
                o.t.disableInteractive();
                o.bg.setAlpha(0.45);
                o.t.setAlpha(0.6);
            });
            cb();
            GameData.save();
        });
        this.choiceBtns.push(b);
    }

    // ================================================================
    // 场景 0：墓外入口
    // ================================================================
    loadEntranceScene() {
        this.bg = this.add.image(600, 360, 'bg_entrance').setDepth(-10);
        this.fxList.push(FX.fog(this), FX.motes(this));
        Ambient.play('entrance');
        this.showDialog('林砚：青崖山盗洞现场。岩壁上有新鲜凿痕，雾气很重。');

        // 石碑：触发符文谜题，解开后开启石门
        this.addHotspot(450, 300, 170, 210, '先秦石碑', () => {
            if (GameData.gateOpen) { this.showDialog('石碑机关已解开，石门已开。'); return; }
            if (this.scene.isActive('PuzzlePanelScene')) return;
            this.scene.launch('PuzzlePanelScene', {
                type: 'symbol', host: this,
                callback: (success) => {
                    if (success) {
                        GameData.gateOpen = true;
                        GameData.save();
                        FX.burst(this, 450, 300, 0xd8c49a, 22);
                        this.cameras.main.flash(320, 26, 22, 14);
                        this.showDialog('石碑符文按序点亮，崖壁深处传来石门开启的闷响……');
                        this.time.delayedCall(1400, () => this.gotoScene('corridor'));
                    }
                }
            });
        });

        // 遗弃背包：拾取残破地图
        this.addHotspot(220, 450, 150, 130, '遗弃的背包', () => {
            if (!GameData.hasItem('map')) {
                this.gainItem({ key: 'map', name: '残破地图', iconKey: 'item_map' });
                this.showDialog('拾取【残破地图】。羊皮卷上印着 4 个先秦古符号，与石碑碑文一致。');
            } else {
                this.showDialog('背包已经搜查过了，没有别的线索。');
            }
        });

        // 盗洞：石门开启后可进入
        this.addHotspot(700, 320, 190, 230, '盗洞', () => {
            if (GameData.gateOpen) {
                this.gotoScene('corridor');
            } else {
                this.showDialog('洞口被坍塌的碎石堵住大半，墓门尚未开启，无法深入。');
            }
        });
    }

    // ================================================================
    // 场景 1：甬道（地砖时序谜题 + 分支选择 1）
    // ================================================================
    loadCorridorScene() {
        this.bg = this.add.image(600, 360, 'bg_corridor').setDepth(-10);
        this.fxList.push(FX.motes(this));
        Ambient.play('tomb');
        this.showDialog('林砚：狭长甬道，地面全是方格地砖，像某种机关。墙上有盗墓贼留下的刻字。');

        // 墙面刻字：阿凯留言
        this.addHotspot(200, 280, 130, 170, '墙面刻字', () => {
            this.showDialog('阿凯的刻字：“老周不听劝，踩错地砖，石头砸下来，老张没跑出去。按壁画顺序走，别回头。”');
        });

        // 地砖谜题
        this.addHotspot(600, 400, 360, 190, '地砖机关', () => {
            if (this.scene.isActive('PuzzlePanelScene')) return;
            this.scene.launch('PuzzlePanelScene', {
                type: 'order', host: this,
                callback: (success) => {
                    if (success) {
                        if (!GameData.hasItem('bamboo1')) {
                            this.gainItem({ key: 'bamboo1', name: '竹简残片①', iconKey: 'item_bamboo1' });
                        }
                        this.gainNote(1);
                        this.showDialog('地砖机关按壁画时序解开，暗簧声落定。石缝中卡着一截竹简，旁边还有阿凯的笔记碎片①。');
                        this.time.delayedCall(1400, () => this.gotoScene('hall'));
                    } else {
                        GameData.badWeight += 1;
                        GameData.save();
                        this.cameras.main.shake(220, 0.004);
                        this.showDialog('踩错了地砖！顶部落石砸下，你侧身躲开，肩旁被碎石划破。');
                    }
                }
            });
        });

        // 分支选择点 1
        this.addChoice(330, 545, 'A · 谨慎记录壁画，不触碰墙体', () => {
            GameData.goodWeight += 1;
            this.showDialog('你只做记录与拍照，没有触碰任何壁画。好结局分值 +1');
        });
        this.addChoice(870, 545, 'B · 掰下一块壁画碎片查看', () => {
            GameData.badWeight += 1;
            this.showDialog('壁画层被你掰落一块，颜料成片剥落。坏结局分值 +1');
        });
    }

    // ================================================================
    // 场景 2：配殿（烛台点火谜题 + 分支选择 2）
    // ================================================================
    loadHallScene() {
        this.bg = this.add.image(600, 360, 'bg_hall').setDepth(-10);
        this.fxList.push(FX.motes(this), FX.embers(this, 500, 320, 200));
        this.glowList.push(FX.glow(this, 500, 300, 3.6, 0.16));
        Ambient.play('tomb');
        this.showDialog('林砚：陪葬配殿。四尊陶俑、三座青铜烛台，器物被盗墓贼翻得七零八落。');

        // 烛台机关：持有竹简① 即可按序点亮
        this.addHotspot(500, 320, 320, 230, '青铜烛台', () => {
            if (GameData.hasItem('bamboo1')) {
                FX.burst(this, 500, 320, 0xe8c890, 20);
                if (!GameData.hasItem('bronze')) {
                    this.gainItem({ key: 'bronze', name: '青铜构件', iconKey: 'item_bronze' });
                }
                this.gainNote(2);
                this.showDialog('按竹简① 所记次序点亮烛台，陶俑缓缓归位，墙内暗格弹开——青铜构件与笔记碎片② 入手。');
                this.time.delayedCall(1400, () => this.gotoScene('room'));
            } else {
                this.showDialog('烛台旁刻着点火次序，但缺了参照古籍，无从推断。需要竹简类的线索。');
            }
        });

        // 分支选择点 2
        this.addChoice(330, 545, 'A · 只拍照记录，不挪动陶俑', () => {
            GameData.goodWeight += 1;
            this.showDialog('你没有挪动任何文物，只做了影像记录。好结局分值 +1');
        });
        this.addChoice(870, 545, 'B · 挪动陶俑寻找宝物', () => {
            GameData.badWeight += 1;
            this.showDialog('陶俑被挪动时磕掉一角。坏结局分值 +1');
        });
    }

    // ================================================================
    // 场景 3：耳室（拓片拼接：需选中青铜构件）
    // ================================================================
    loadRoomScene() {
        this.bg = this.add.image(600, 360, 'bg_room').setDepth(-10);
        this.fxList.push(FX.motes(this));
        Ambient.play('tomb');
        this.showDialog('林砚：储藏耳室。木架朽烂，墙上挂着一幅残缺的石刻拓片。');

        this.addHotspot(450, 300, 280, 250, '残缺拓片', () => {
            if (GameData.selectedItem && GameData.selectedItem.key === 'bronze') {
                FX.burst(this, 450, 300, 0xc4a066, 20);
                if (!GameData.hasItem('bamboo2')) {
                    this.gainItem({ key: 'bamboo2', name: '竹简残片②', iconKey: 'item_bamboo2' });
                }
                if (!GameData.hasItem('key')) {
                    this.gainItem({ key: 'key', name: '锈铜钥匙', iconKey: 'item_key' });
                }
                this.gainNote(3);
                this.showDialog('青铜构件严丝合缝嵌入拓片缺口，整面墙纹连通——暗格开启，获得竹简残片②、锈铜钥匙与笔记碎片③。拓片后的墙面上，还藏着一扇覆着铜锁的石扉。');
            } else if (GameData.hasItem('bronze')) {
                this.showDialog('拓片缺了一块。先在背包里选中【青铜构件】，再点击拓片。');
            } else {
                this.showDialog('拓片中央缺了一块，边缘断面像是某种青铜构件。');
            }
        });

        // 铜锁石扉：需锈铜钥匙，通往火虫窟
        this.addHotspot(920, 330, 170, 240, '铜锁石扉', () => {
            if (GameData.doorOpen) { this.showDialog('石扉已开，火虫窟就在门后。'); return; }
            if (GameData.hasItem('key')) {
                GameData.doorOpen = true;
                GameData.save();
                FX.burst(this, 920, 330, 0xd8c49a, 20);
                this.cameras.main.flash(320, 26, 22, 14);
                this.showDialog('锈铜钥匙探进锁孔，咔哒一声——铜锁石扉向内滑开，一股潮湿的风从门后涌出，隐约裹着点点幽绿的荧光。');
                this.time.delayedCall(1500, () => this.gotoScene('swarm'));
            } else {
                this.showDialog('石扉上一把黄铜古锁，锁孔样式古老。看这间耳室的阵仗，钥匙应该就藏在暗格里。');
            }
        });
    }

    // ================================================================
    // 场景 4：火虫窟（铜锁石扉之后 · 艾草驱虫 + 火虫节律谜题 + 分支选择 3）
    // ================================================================
    loadSwarmScene() {
        this.bg = this.add.image(600, 360, 'bg_swarm').setDepth(-10);
        this.fxList.push(FX.motes(this, 0xa8e0a0));
        this.glowList.push(FX.glowGreen(this, 600, 320, 5.2, 0.12));
        const bugEms = [
            FX.firebugs(this, 320, 280, 280, 230),
            FX.firebugs(this, 900, 250, 260, 190),
            FX.firebugs(this, 600, 430, 360, 170)
        ];
        bugEms.forEach(e => this.fxList.push(e));
        this._bugEms = bugEms;
        Ambient.play('swarm');

        // 入场：蝙蝠惊起掠过；此后每隔一段时间零星再掠
        FX.batsFly(this);
        this.time.delayedCall(650, () => FX.batsFly(this));
        this._batsTimer = this.time.addEvent({
            delay: 9500, loop: true,
            callback: () => { if (Math.random() < 0.6) FX.batsFly(this); }
        });

        // 装饰生物：石阶旁的蜈蚣、右壁的守宫
        this.spawnCentipede(150, 520);
        this.spawnGecko(1000, 225);

        if (!GameData.smokeDone) {
            this.showPages([
                '林砚：铜锁石扉之后，是被地下水蚀空的一条裂隙。岩壁上浮着成片的幽绿微光——火虫。',
                '林砚：虫腹的光连成一条星河。按阿凯的路数来：不惊扰，先记录。'
            ]);
        } else {
            this.showDialog('林砚：烟气还未散尽，虫群仍避在洞顶。');
        }

        // 岩壁虫群：生态观察与驱散线索
        this.addHotspot(330, 290, 260, 220, '岩壁虫群', () => {
            this.showDialog('燧虫——先秦人叫它“夜光”。它们靠腹端的冷光彼此传讯，受惊时会整片同时明灭；以墓中霉斑与蛾蠓为食，并不主动伤人。');
        });

        // 洞顶蝙蝠
        this.addHotspot(740, 105, 260, 120, '倒挂的蝙蝠', () => {
            this.showDialog('洞顶倒挂着一小群长翼蝠，昼伏夜出，靠回声辨路。放轻脚步，别惊起它们。');
        });

        // 墙角艾草：采集驱虫材料
        this.addHotspot(140, 430, 150, 130, '墙角艾草', () => {
            if (!GameData.hasItem('herb')) {
                this.gainItem({ key: 'herb', name: '艾草束', iconKey: 'item_herb' });
                this.showDialog('墙角一丛干枯的艾草——古人用它驱虫避秽。你采下一束。');
            } else {
                this.showDialog('艾草已采过一束，够用了。');
            }
        });

        // 壁龛长明灯：点燃艾草，驱散虫群
        this.addHotspot(950, 430, 150, 150, '壁龛长明灯', () => {
            if (GameData.smokeDone) { this.showDialog('艾草烟正缓缓漫开，虫群仍避在洞顶。'); return; }
            if (GameData.selectedItem && GameData.selectedItem.key === 'herb') {
                GameData.smokeDone = true;
                GameData.save();
                (this._bugEms || []).forEach(e => { try { if (e && e.killEmit) e.killEmit(); } catch (err) {} });
                this.cameras.main.flash(420, 40, 60, 40);
                this.fxList.push(FX.smokePlume(this, 950, 430));
                FX.burst(this, 950, 430, 0xa8e0a0, 16);
                this.showDialog('艾草束探进灯焰，青烟缓缓漫开。岩壁上的荧光一层层暗下去——虫群避开烟气，向洞顶退去了，去路让了出来。');
            } else {
                this.showDialog('灯芯上还剩一点火。想驱散虫群，得有能生烟的东西——艾草最合适。');
            }
        });

        // 虫群去路：火虫节律谜题
        this.addHotspot(600, 430, 300, 170, '虫群去路', () => {
            if (GameData.swarmSolved) { this.showDialog('虫群已退开，沿石阶下行即可。'); return; }
            if (!GameData.smokeDone) { this.showDialog('虫群在去路上空聚而不散，硬闯会被蜇。先想办法驱散它们。'); return; }
            if (this.scene.isActive('PuzzlePanelScene')) return;
            this.scene.launch('PuzzlePanelScene', {
                type: 'swarm', host: this,
                callback: (success) => {
                    if (success) {
                        GameData.swarmSolved = true;
                        GameData.save();
                        FX.burst(this, 600, 430, 0xa8e0a0, 22);
                        this.showDialog('四盏引虫灯次第亮起，虫群的荧光如潮水般向两侧分开——石阶让出一条道来。');
                        this.time.delayedCall(1500, () => this.gotoScene('lair'));
                    }
                }
            });
        });

        // 石缝蜈蚣
        this.addHotspot(150, 520, 140, 80, '石缝蜈蚣', () => {
            this.showDialog('一节一节爬过石缝的是少棘蜈蚣。绕开就好——不必伤害，它也是这墓室生态的一环。');
        });

        // 分支选择点 3
        this.addChoice(330, 545, 'A · 熄灯静立，等虫群自行回流', () => {
            GameData.goodWeight += 1;
            this.showDialog('你关掉手电，在黑暗里静立了片刻。荧光重新聚拢成河——你没有打扰它们。好结局分值 +1');
        });
        this.addChoice(870, 545, 'B · 挥开虫群硬闯过去', () => {
            GameData.badWeight += 1;
            this.cameras.main.shake(240, 0.004);
            this.showDialog('虫群受惊四散，几只燧虫的尾刺扫过手背，火辣辣地肿了起来。坏结局分值 +1');
        });
    }

    // ---------- 装饰生物 ----------
    // 守宫（壁虎）：沿石壁缓慢爬行
    spawnGecko(x, y) {
        const g = this.add.container(x, y).setDepth(-2);
        const body = this.add.graphics();
        body.fillStyle(0x4a4438, 1);
        body.fillEllipse(0, 0, 26, 9);
        body.fillCircle(14, -1, 5);
        body.lineStyle(3, 0x4a4438, 1);
        body.beginPath(); body.moveTo(-12, 1); body.lineTo(-30, 6); body.strokePath();
        g.add(body);
        this.tweens.add({ targets: g, x: x - 46, duration: 5200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: g, y: '-=5', duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.fxList.push(g);
    }
    // 蜈蚣：分节起伏爬行
    spawnCentipede(x, y) {
        const c = this.add.container(x, y).setDepth(-2);
        for (let i = 0; i < 8; i++) {
            const seg = this.add.circle(-i * 11, 0, Math.max(2.5, 6 - i * 0.45), 0x4a2f26);
            c.add(seg);
            this.tweens.add({
                targets: seg, y: { from: -2.5, to: 2.5 },
                duration: 260, delay: i * 55, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
        }
        this.tweens.add({ targets: c, x: x + 120, duration: 11000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.fxList.push(c);
    }

    // ================================================================
    // 场景 4.5：异兽虫渊（史前巨虫恐怖关 · 火虫窟之后）
    // ================================================================
    // ---- 巨虫装饰/突袭：Canvas 程序化剪影（不依赖外部贴图）----
    spawnGiantCentipede(x, y) {
        const c = this.add.container(x, y).setDepth(-1);
        const g = this.add.graphics();
        for (let i = 0; i < 20; i++) {
            g.fillStyle(0x223026, 1);
            g.fillCircle(-i * 12, Math.sin(i * 0.5) * 4, Math.max(3, 13 - i * 0.4));
            g.lineStyle(2, 0x2a3a2e, 1);
            g.beginPath(); g.moveTo(-i * 12, -10); g.lineTo(-i * 12 - 4, -16); g.strokePath();
        }
        g.fillStyle(0x223026, 1); g.fillCircle(20, 0, 15);
        g.fillStyle(0x8a2a22, 0.9); g.fillCircle(26, -4, 2.5); g.fillCircle(26, 4, 2.5);
        c.add(g);
        this.tweens.add({ targets: c, x: x + 160, duration: 16000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: c, y: '-=8', duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.fxList.push(c);
    }
    spawnCorpseSpider(x, y) {
        const c = this.add.container(x, y).setDepth(-1);
        const g = this.add.graphics();
        g.fillStyle(0x1c241e, 0.95); g.fillEllipse(0, 0, 90, 70);
        g.fillCircle(50, 0, 24);
        g.lineStyle(6, 0x1c241e, 1);
        for (let a = -1; a <= 1; a += 0.5) {
            g.beginPath(); g.moveTo(0, 0); g.lineTo(78, a * 52); g.strokePath();
            g.beginPath(); g.moveTo(0, 0); g.lineTo(-70, a * 52); g.strokePath();
        }
        g.fillStyle(0x8a2a22, 0.9); g.fillCircle(58, -6, 3); g.fillCircle(58, 6, 3);
        c.add(g);
        this.tweens.add({ targets: c, x: x - 120, duration: 14000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: c, scale: { from: 1, to: 1.04 }, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.fxList.push(c);
    }
    // 突脸惊吓：巨虫/尸蛛从画面一侧掠过 + 红屏闪光 + 震屏 + 刺耳音
    lairLunge(type) {
        if (this.currentKey !== 'lair') return;
        const fromLeft = Math.random() < 0.5;
        const y = 110 + Math.random() * 440;
        const g = this.add.graphics();
        g.fillStyle(0x0a0f0a, 0.96);
        if (type === 'centipede') {
            for (let i = 0; i < 16; i++) g.fillCircle(-i * 16, Math.sin(i * 0.6) * 6, Math.max(3, 14 - i * 0.6));
            g.fillCircle(20, 0, 16);
            g.fillStyle(0xc4302a, 0.9); g.fillCircle(26, -4, 3); g.fillCircle(26, 4, 3);
        } else {
            g.fillEllipse(0, 0, 70, 54); g.fillCircle(36, 0, 18);
            g.lineStyle(5, 0x0a0f0a, 1);
            for (let a = -1; a <= 1; a += 0.5) {
                g.beginPath(); g.moveTo(0, 0); g.lineTo(60, a * 40); g.strokePath();
                g.beginPath(); g.moveTo(0, 0); g.lineTo(-50, a * 40); g.strokePath();
            }
            g.fillStyle(0xc4302a, 0.9); g.fillCircle(42, -5, 3); g.fillCircle(42, 5, 3);
        }
        const cont = this.add.container(fromLeft ? -120 : 1320, y, [g]).setDepth(60);
        if (!fromLeft) cont.setScale(-1, 1);
        Sfx.noise(0.3, 3000, 0.08); Sfx.tone(150, 0.3, 'sawtooth', 0.06);
        this.cameras.main.flash(180, 60, 10, 10);
        this.cameras.main.shake(260, 0.006);
        this.tweens.add({
            targets: cont, x: fromLeft ? 1320 : -120, duration: 520, ease: 'Cubic.easeIn',
            onComplete: () => cont.destroy()
        });
    }
    loadLairScene() {
        this.bg = this.add.image(600, 360, 'bg_lair').setDepth(-10);
        this.fxList.push(FX.motes(this, 0x9fe0c8));
        this.glowList.push(FX.glowGreen(this, 600, 320, 5.6, 0.14));
        Ambient.play('lair');
        // 额外压暗，营造幽闭恐怖
        this.add.rectangle(600, 360, 1200, 720, 0x02100c, 0.30).setDepth(-3);

        // 巨虫装饰剪影（缓慢爬动，常驻氛围）
        this.spawnGiantCentipede(180, 560);
        this.spawnCorpseSpider(1010, 230);

        // 入场惊吓 + 后续零星突袭（已点亮三灯则不再触发）
        if (GameData.lairBraziers < 3) {
            this.time.delayedCall(1400, () => this.lairLunge('centipede'));
            this._lairTimer = this.time.addEvent({
                delay: 6000, loop: true,
                callback: () => {
                    if (this.currentKey === 'lair' && Math.random() < 0.55) {
                        this.lairLunge(Math.random() < 0.5 ? 'centipede' : 'spider');
                    }
                }
            });
        }

        if (GameData.lairBraziers >= 3) {
            this.showDialog('林砚：三盏青铜灯还亮着，异兽缩在黑暗深处不敢近前。下行的石阶就在前方。');
        } else {
            this.showPages([
                '林砚：石扉后的裂隙比火虫窟更深。先秦工匠把这一层封死，像是在“镇”着什么。',
                '林砚：手电光扫过岩壁——一节一节的影子在动。是巨蜈，还有比人还大的尸蛛。点亮青铜灯，光才能逼退它们。'
            ]);
        }

        // 三盏青铜灯（in-scene 谜题）：点亮即招来一次突袭，三盏齐亮异兽退去
        const bxs = [300, 600, 900];
        this._braziers = [];
        this._brazierZones = [];
        for (let i = 0; i < 3; i++) {
            const bx = bxs[i], by = 470;
            const lamp = this.add.circle(bx, by, 40, 0x10231c).setStrokeStyle(3, 0x3a5a48, 1).setDepth(-1);
            this._braziers.push(lamp);
            const lit = (GameData.lairBraziers > i);
            if (lit) { lamp.setFillStyle(0xe8a23a, 0.95); lamp.setStrokeStyle(3, 0xffd98a, 1); }
            const z = this.addHotspot(bx, by, 96, 110, '青铜灯·' + (i + 1), () => this.lightBrazier(i));
            this._brazierZones.push(z);
            if (lit) z.disableInteractive();
        }

        // 岩壁巨影观察
        this.addHotspot(220, 250, 200, 200, '岩壁巨影', () => {
            this.showDialog('岩壁上一层暗褐色的甲壳残蜕，足有两人高——某种远古巨虫曾在此蜕壳。它的先祖，比这座陵墓还要古老。');
        });

        // 出口：下行石阶（灯齐后开启）
        this._lairExit = this.addHotspot(600, 150, 220, 130, '下行石阶', () => {
            if (GameData.lairBraziers < 3) {
                this.showDialog('石阶被黑暗封着，巨虫的影子在阶口游移。先点亮三盏青铜灯。');
                return;
            }
            this.gotoScene('vault');
        });
        if (GameData.lairBraziers < 3) this._lairExit.disableInteractive();

        // 善恶分支
        this.addChoice(330, 545, 'A · 举灯稳步前进，不惊扰异兽', () => {
            GameData.goodWeight += 1;
            this.showDialog('你高举青铜灯，光晕把巨虫逼在暗处。你一步步走过，没有惊动它们。好结局分值 +1');
        });
        this.addChoice(870, 545, 'B · 用手电猛照虫影挑衅', () => {
            GameData.badWeight += 1;
            this.cameras.main.shake(240, 0.004);
            this.lairLunge('spider');
            this.showDialog('强光激怒了暗处的东西，一团黑影猛地扑来又缩回。你惊出一身冷汗。坏结局分值 +1');
        });
    }
    lightBrazier(i) {
        if (GameData.lairBraziers > i) { this.showDialog('这一盏已经亮着了。'); return; }
        const lamp = this._braziers[i];
        lamp.setFillStyle(0xe8a23a, 0.95); lamp.setStrokeStyle(3, 0xffd98a, 1);
        FX.burst(this, lamp.x, lamp.y, 0xffd98a, 14);
        FX.embers(this, lamp.x, lamp.y, 80);
        Sfx.success();
        GameData.lairBraziers++; GameData.save();
        const z = this._brazierZones[i]; if (z) z.disableInteractive();
        // 点亮即招来一次突袭
        this.lairLunge(i % 2 === 0 ? 'centipede' : 'spider');
        this.cameras.main.shake(220, 0.004);
        if (GameData.lairBraziers >= 3) {
            if (this._lairTimer) { this._lairTimer.remove(); this._lairTimer = null; }
            if (this._lairExit) this._lairExit.setInteractive({ useHandCursor: true });
            this.showDialog('三盏青铜灯齐亮，暖光铺开。巨虫与尸蛛的影子向最深的黑暗退去，阶口的阴影裂开——下行石阶露了出来。');
        } else {
            this.showDialog('一盏灯亮起，光晕推开黑暗。还有 ' + (3 - GameData.lairBraziers) + ' 盏。点灯时黑暗里的东西会扑过来，稳住。');
        }
    }

    // ================================================================
    // 场景 4.6：藏器库（完整小场景 · 异兽虫渊之后、前廊之前）
    // ================================================================
    loadVaultScene() {
        this.bg = this.add.image(600, 360, 'bg_vault').setDepth(-10);
        this.fxList.push(FX.motes(this));
        this.glowList.push(FX.glow(this, 600, 330, 3.0, 0.14));
        Ambient.play('tomb');

        if (GameData.vaultOpen) {
            this.showDialog('林砚：藏器库。青铜与玉石在尘光里静默千年，方才那阵骚动已被甩在身后。');
        } else {
            this.showPages([
                '林砚：穿过异兽虫渊，眼前豁然一室。是先秦人贮藏礼器的库室——盗墓贼竟没到过这里。',
                '林砚：列鼎、玉殓，还有中央那口青铜宝匣。沉住气，只记录，不贪取。'
            ]);
        }

        this.addHotspot(260, 330, 240, 300, '青铜列鼎', () => {
            this.showDialog('七件列鼎按礼制大小排列，是墓主身份的象征。鼎身饕餮纹在尘光里若隐若现——它们躲过了虫渊，也躲过了盗贼。');
        });
        this.addHotspot(330, 520, 200, 120, '玉殓葬', () => {
            this.showDialog('玉殓葬：逝者口含玉琀、身覆玉片。古人信玉能敛精气、护尸身不朽。千年过去，玉色温润如初。');
        });
        this.addHotspot(880, 300, 220, 260, '壁面壁画', () => {
            this.showDialog('壁画绘着祭祀场景：巫者持灯，异兽被锁入地底。原来这整座陵，就是为“镇”住虫渊里的东西而建。');
        });
        this.addHotspot(600, 360, 220, 200, '青铜宝匣', () => {
            if (GameData.vaultOpen && GameData.hasItem('charm')) { this.showDialog('宝匣已开，古玉护符已在背包中。'); return; }
            if (GameData.hasItem('charm')) { this.showDialog('古玉护符已在背包中。'); return; }
            GameData.vaultOpen = true; GameData.save();
            FX.burst(this, 600, 360, 0xa8d8b0, 18);
            this.gainItem({ key: 'charm', name: '古玉护符', iconKey: 'item_charm' });
            this.showDialog('宝匣机括轻响，盖自弹开——匣中一枚古玉护符，雕着镇兽的纹样。你将它收入背包。或许，它能压住虫渊里那股不安。');
        });

        // 善恶分支
        this.addChoice(330, 545, 'A · 只影像记录，原样封存', () => {
            GameData.goodWeight += 1;
            this.showDialog('你没有触碰任何器物，只做了三维扫描与记录。好结局分值 +1');
        });
        this.addChoice(870, 545, 'B · 取一件玉佩作“纪念”', () => {
            GameData.badWeight += 1;
            this.cameras.main.shake(200, 0.003);
            this.showDialog('你掰下一块玉佩，断面新茬刺眼。坏结局分值 +1');
        });

        // 通往前廊
        this.addHotspot(1080, 560, 200, 180, '前行·前廊', () => {
            this.gotoScene('front');
        });
    }

    // ================================================================
    // 场景 5：主墓室前廊（壁画排序）
    // ================================================================
    loadFrontScene() {
        this.bg = this.add.image(600, 360, 'bg_front').setDepth(-10);
        this.fxList.push(FX.motes(this));
        Ambient.play('tomb');
        this.showDialog('林砚：主墓室前廊。整面墙的叙事壁画，似乎藏着总机关的原理。尽头是一扇厚重的石门。');

        this.addHotspot(550, 320, 340, 270, '叙事壁画', () => {
            FX.burst(this, 550, 320, 0xc4a066, 16);
            this.gainNote(4);
            this.showDialog('壁画按营造次序排列：开工、凿石、铺砖、封顶。石门轰然中开，笔记碎片④ 就嵌在壁画夹层里。');
            this.time.delayedCall(1400, () => this.gotoScene('main'));
        });
    }

    // ================================================================
    // 场景 6：主墓室（最终口令谜题 + 结局抉择）
    // ================================================================
    loadMainScene() {
        this.bg = this.add.image(600, 360, 'bg_main').setDepth(-10);
        this.fxList.push(FX.motes(this), FX.debris(this));
        this.glowList.push(FX.glow(this, 600, 350, 2.2, 0.10));
        Ambient.play('tomb');
        this.showDialog('林砚：主墓室。巨型石棺旁立着高台机关控制台，地面在轻微震动。');

        // 环境震动：每隔数秒一次轻微镜头晃动，墓室始终不得安稳
        this.tremor = this.time.addEvent({
            delay: 2400, loop: true,
            callback: () => {
                if (Math.random() < 0.65) this.cameras.main.shake(200, 0.0018);
            }
        });

        // 机关控制台：最终四位口令
        this.addHotspot(600, 350, 380, 290, '机关控制台', () => {
            if (this.scene.isActive('PuzzlePanelScene')) return;
            if (GameData.hasItem('bamboo1') && GameData.hasItem('bamboo2')) {
                this.scene.launch('PuzzlePanelScene', {
                    type: 'password', host: this,
                    callback: (success) => {
                        if (success) {
                            FX.burst(this, 600, 350, 0xe8c890, 24);
                            this.gainNote(5);
                            this.showDialog('竹简① 与② 的刻文在控制台上拼出完整口令，总机关逆转——震动停止了。笔记碎片⑤ 入手。');
                            if (this.tremor) { this.tremor.remove(); this.tremor = null; }
                            if (GameData.allNoteCollected) {
                                this.showDialog('五份笔记齐了。棺底传来空响——这墓室里还有夹层！');
                                this.time.delayedCall(1900, () => this.gotoScene('secret'));
                            } else {
                                this.time.delayedCall(1500, () => this.judgeEnding());
                            }
                        } else {
                            GameData.badWeight += 2;
                            GameData.save();
                            this.cameras.main.shake(320, 0.006);
                            this.showDialog('口令错误！机关加速运转，碎石从头顶崩落——');
                            this.time.delayedCall(1400, () => this.judgeEnding());
                        }
                    }
                });
            } else {
                this.showDialog('控制台上是两段互补的刻文，缺了竹简残片无法破译。');
            }
        });

        // 结局关键抉择
        this.addChoice(330, 545, 'A · 优先关闭总机关，稳定墓室', () => {
            GameData.goodWeight += 3;
            this.showDialog('你没有触碰石棺，先保墓室结构。好结局分值 +3');
        });
        this.addChoice(870, 545, 'B · 先撬开石棺查看陪葬品', () => {
            GameData.badWeight += 3;
            this.cameras.main.shake(220, 0.004);
            this.showDialog('棺盖被撬开一道缝，承重结构发出不堪重负的闷响。坏结局分值 +3');
        });
    }

    // ================================================================
    // 场景 7：隐藏夹层密室（隐藏结局专属）
    // ================================================================
    loadSecretScene() {
        this.bg = this.add.image(600, 360, 'bg_secret').setDepth(-10);
        this.fxList.push(FX.motes(this, 0xc4a066));
        this.glowList.push(FX.glow(this, 550, 380, 3.2, 0.22));
        Ambient.play('tomb');
        this.showDialog('林砚：棺底夹层密室。墙角木盒上落满灰尘，一束微光正好落在盒盖上。');

        this.addHotspot(550, 380, 220, 180, '木盒', () => {
            FX.burst(this, 550, 380, 0xe8c890, 22);
            this.showDialog('木盒里是一整摞销赃单据与照片——盗掘、倒卖、出境的完整链条都在里面。');
            this.time.delayedCall(1700, () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.time.delayedCall(520, () => this.scene.start('EndScene', { type: 'secret' }));
            });
        });
    }

    // ---------- 结局判定 ----------
    judgeEnding() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(520, () => {
            this.scene.start('EndScene', {
                good: GameData.goodWeight,
                bad: GameData.badWeight,
                allNote: GameData.allNoteCollected
            });
        });
    }
}

// ============================================================
// 八、结局场景
// ============================================================
class EndScene extends Phaser.Scene {
    constructor() { super('EndScene'); }
    init(data) {
        this.endType = data.type || 'judge';
        this.good = data.good || 0;
        this.bad = data.bad || 0;
    }
    create() {
        // 已通关：清除本地存档，标题页不再显示“继续调查”
        window.gameStorage.clear().catch(() => {});

        this.cameras.main.fadeIn(700, 0, 0, 0);

        this.add.rectangle(600, 360, 1200, 720, 0x050505);
        if (this.endType === 'secret') {
            const bgS = this.add.image(600, 360, 'bg_secret').setDepth(-10).setAlpha(0.28);
            this.tweens.add({ targets: bgS, scale: { from: 1.02, to: 1.09 }, duration: 15000, ease: 'Linear' });
        } else {
            const bgM = this.add.image(600, 360, 'bg_main').setDepth(-10).setAlpha(0.20);
            this.tweens.add({ targets: bgM, scale: { from: 1.02, to: 1.09 }, duration: 15000, ease: 'Linear' });
        }
        FX.vignette(this);
        // 结局氛围粒子：隐藏结局金尘 / 坏结局灰烬 / 圆满结局暖浮尘
        if (this.endType === 'secret') {
            FX.motes(this, 0xc4a066);
        } else if (this.good <= this.bad) {
            FX.ash(this);
        } else {
            FX.motes(this);
        }

        let title, text;
        if (this.endType === 'secret') {
            title = '【隐藏案件结局】';
            text =
                '你集齐五份阿凯的笔记，找到棺底夹层，起出完整销赃名单。\n\n' +
                '文物部门联合公安顺藤摸瓜，整条文物倒卖产业链被连根拔起，盗墓团伙全员落网。\n' +
                '阿凯的笔记，最终成了指证他们的证据。';
        } else if (this.good > this.bad) {
            title = '【圆满结局】';
            text =
                '总机关被关闭，墓室结构稳定下来，你安全撤出。\n\n' +
                '后续考古队进场，古墓得到原址保护，洞窟里的燧虫群落与守宫、蝠群也被原样保留。\n' +
                '你的调查记录，成了这处先秦古陵的第一手档案。';
        } else {
            title = '【坍塌坏结局】';
            text =
                '多次误操作触发连锁机关，主墓室大面积坍塌。\n\n' +
                '大量先秦遗迹永久损毁，部分文物彻底灭失，本次调查任务失败。';
        }

        // 标题：上浮渐显
        const titleObj = this.add.text(600, 233, title, { fontFamily: FONT, fontSize: 38, color: C.gold }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: titleObj, alpha: 1, y: 205, duration: 850, delay: 250, ease: 'Cubic.easeOut' });
        // 分隔线随后淡入
        const divObj = this.add.rectangle(600, 240, 240, 1, C.goldNum, 0).setAlpha(0);
        this.tweens.add({ targets: divObj, alpha: 0.5, duration: 600, delay: 900 });

        const statObj = this.add.text(600, 254,
            '笔记 ' + GameData.noteList.length + '/5 · 守护 +' + this.good + ' · 破坏 +' + this.bad,
            { fontFamily: FONT, fontSize: 18, color: C.faint }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: statObj, alpha: 1, duration: 600, delay: 1050 });

        const bodyObj = this.add.text(600, 405, text, {
            fontFamily: FONT, fontSize: 21, color: C.paper,
            wordWrap: { width: 920 }, align: 'center', lineSpacing: 12
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: bodyObj, alpha: 1, duration: 700, delay: 1250 });

        makeTextButton(this, 600, 556, '【 重新调查 】', 28, () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.time.delayedCall(420, () => this.scene.start('StartScene'));
        });
        this.add.text(600, 650, '私自盗掘古墓葬属于刑事犯罪 · 地下文物归国家所有', {
            fontFamily: FONT, fontSize: 16, color: C.faint
        }).setOrigin(0.5);
    }
}

// ============================================================
// 九、启动
// ============================================================
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#080808',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, StartScene, GameScene, PuzzlePanelScene, EndScene]
};

// 浏览器要求首次用户手势后才能播放音频
window.addEventListener('pointerdown', () => Sfx.resume());

// 暴露游戏实例：供 QA 调试与自动化测试使用
window.GUXUN = new Phaser.Game(config);
