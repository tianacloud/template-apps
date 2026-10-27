/* Aurora 声光律动引擎 · 核心引擎
 * 零依赖：Web Audio 实时分析 + 规则引擎 + 灯效方案生成
 * 职责：音频特征提取 / 节拍与音高检测 / 灯效匹配 / 方案序列化
 */
const BANDS_PLACEHOLDER=0;


  /* ───────────────────────── 常量 ───────────────────────── */

  // 频段划分（Hz），用于三段能量提取
  const BANDS = [
    { key: 'bass', name: '低频', lo: 20, hi: 200, color: '#ff3d81' },
    { key: 'mid', name: '中频', lo: 200, hi: 2000, color: '#7c5cff' },
    { key: 'high', name: '高频', lo: 2000, hi: 16000, color: '#22d3ee' }
  ];

  // 灯效库：每种灯效是一组「参数随音频特征变化」的渲染配方
  const EFFECTS = [
    {
      id: 'breathe',
      name: '呼吸',
      tag: '氛围',
      desc: '整体明暗随低频缓慢起伏，像灯具在做深呼吸。',
      fit: { energy: [0, 0.6], tempo: [0, 0.5], valence: [0, 1] },
      params: { base: 0.18, swing: 0.34, hueShift: 8, spread: 1.0, decay: 0.90 }
    },
    {
      id: 'pulse',
      name: '心跳脉冲',
      tag: '节奏',
      desc: '每次鼓点强光闪烁，适合有明确 kick 的舞曲。',
      fit: { energy: [0.35, 1], tempo: [0.4, 1], valence: [0, 1] },
      params: { base: 0.12, swing: 0.9, hueShift: 0, spread: 0.85, decay: 0.72 }
    },
    {
      id: 'wave',
      name: '波浪流光',
      tag: '流动',
      desc: '灯具沿灯带依次点亮，形成横向流动的波浪。',
      fit: { energy: [0.2, 0.9], tempo: [0.3, 1], valence: [0, 1] },
      params: { base: 0.25, swing: 0.6, hueShift: 24, spread: 1.6, decay: 0.86 }
    },
    {
      id: 'strobe',
      name: '频闪切割',
      tag: '高能',
      desc: '高频段驱动的高速切色，视觉冲击最强，需谨慎使用。',
      fit: { energy: [0.55, 1], tempo: [0.55, 1], valence: [0, 1] },
      params: { base: 0.3, swing: 1.0, hueShift: 60, spread: 1.1, decay: 0.5 }
    },
    {
      id: 'aurora',
      name: '极光',
      tag: '氛围',
      desc: '多色渐变缓慢漂移，柔和且有层次，适合抒情段落。',
      fit: { energy: [0, 0.55], tempo: [0, 0.45], valence: [0.2, 1] },
      params: { base: 0.2, swing: 0.4, hueShift: 40, spread: 1.9, decay: 0.93 }
    },
    {
      id: 'ember',
      name: '炽焰',
      tag: '质感',
      desc: '暖色随机跳动，模拟火苗的不规则感。',
      fit: { energy: [0.25, 0.85], tempo: [0.2, 0.8], valence: [0, 1] },
      params: { base: 0.22, swing: 0.7, hueShift: 14, spread: 1.3, decay: 0.8 }
    },
    {
      id: 'chase',
      name: '跑马追逐',
      tag: '节奏',
      desc: '单点高速追灯，配合清晰节拍产生机械感。',
      fit: { energy: [0.4, 1], tempo: [0.5, 1], valence: [0, 1] },
      params: { base: 0.16, swing: 0.85, hueShift: 18, spread: 2.1, decay: 0.68 }
    },
    {
      id: 'starfield',
      name: '星尘闪烁',
      tag: '质感',
      desc: '高频细节驱动稀疏亮点，像星空一样零散闪烁。',
      fit: { energy: [0.15, 0.7], tempo: [0, 0.6], valence: [0, 1] },
      params: { base: 0.12, swing: 0.55, hueShift: 50, spread: 2.4, decay: 0.74 }
    }
  ];

  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  /* ───────────────────────── 特征提取 ───────────────────────── */

  /**
   * 从 AnalyserNode 读取一帧频谱，拆成三段能量 + 总能量 + 频谱质心。
   * 所有返回值归一化到 0..1。
   */
  function extractFrame(analyser, freqData) {
    const nyquist = analyser.context.sampleRate / 2;
    const binCount = freqData.length;
    const binHz = nyquist / binCount;

    const bands = {};
    for (const b of BANDS) {
      const lo = Math.max(0, Math.floor(b.lo / binHz));
      const hi = Math.min(binCount - 1, Math.ceil(b.hi / binHz));
      let sum = 0;
      for (let i = lo; i <= hi; i++) sum += freqData[i] * freqData[i];
      bands[b.key] = Math.sqrt(sum / Math.max(1, hi - lo + 1)) / 255;
    }

    // 频谱质心：亮暗感知
    let num = 0, den = 0;
    for (let i = 0; i < binCount; i++) {
      num += i * freqData[i];
      den += freqData[i];
    }
    const centroid = den > 0 ? (num / den) / binCount : 0;

    const total = (bands.bass * 0.55 + bands.mid * 0.3 + bands.high * 0.15);

    return {
      bands,
      total: Math.min(1, total),
      centroid: Math.min(1, centroid),
      peak: Math.max(bands.bass, bands.mid, bands.high)
    };
  }

  /**
   * 自相关估计 BPM。
   * 输入是一串 onset 能量时间线，采样率固定为 frameRate。
   */
  function estimateBpm(onsetHistory, frameRate) {
    if (onsetHistory.length < 64) return 0;
    const x = onsetHistory.slice();
    const n = x.length;

    // 去均值
    let mean = 0;
    for (const v of x) mean += v;
    mean /= n;
    for (let i = 0; i < n; i++) x[i] -= mean;

    // 对候选 BPM 逐个算周期性相关强度
    let best = 0, bestScore = -1;
    for (let bpm = 60; bpm <= 190; bpm++) {
      const lag = Math.round((60 / bpm) * frameRate);
      if (lag < 4 || lag * 2 > n) continue;
      let score = 0;
      for (let i = 0; i + lag < n; i++) score += x[i] * x[i + lag];
      score /= (n - lag);
      // 偏好 90-150 BPM 的常见范围（轻微加权）
      const prior = 1 - Math.abs(bpm - 118) / 260;
      score *= (0.7 + 0.3 * Math.max(0, prior));
      if (score > bestScore) { bestScore = score; best = bpm; }
    }
    return best;
  }

  /**
   * 自相关基频检测（简化版），返回 {hz, note, octave, cents}
   */
  function detectPitch(timeData, sampleRate) {
    const n = timeData.length;
    // 去直流
    let mean = 0;
    for (let i = 0; i < n; i++) mean += timeData[i];
    mean /= n;

    let rms = 0;
    for (let i = 0; i < n; i++) { const v = timeData[i] - mean; rms += v * v; }
    rms = Math.sqrt(rms / n);
    if (rms < 0.012) return null;

    // 找最低谷作为周期下界
    let maxLag = Math.floor(sampleRate / 60);   // 最低 60Hz
    const minLag = Math.floor(sampleRate / 1200); // 最高 1200Hz
    let bestLag = -1, bestCorr = 0;
    for (let lag = minLag; lag <= maxLag; lag++) {
      let corr = 0, energy = 0;
      for (let i = 0; i + lag < n; i++) {
        corr += (timeData[i] - mean) * (timeData[i + lag] - mean);
        energy += (timeData[i + lag] - mean) * (timeData[i + lag] - mean);
      }
      if (energy < 1e-6) continue;
      corr /= Math.sqrt(energy);
      if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
    }
    if (bestLag < 0 || bestCorr < 0.35) return null;

    const hz = sampleRate / bestLag;
    if (hz < 50 || hz > 1400) return null;

    // 换算到最近音名
    const midi = 69 + 12 * Math.log2(hz / 440);
    const rounded = Math.round(midi);
    const cents = Math.round((midi - rounded) * 100);
    const note = NOTE_NAMES[((rounded % 12) + 12) % 12];
    const octave = Math.floor(rounded / 12) - 1;
    return { hz: Math.round(hz * 10) / 10, note, octave, cents, confidence: Math.min(1, bestCorr) };
  }

  /* ───────────────────────── 灯效匹配 ───────────────────────── */

  /**
   * 规则匹配：给每个灯效算一个契合度分数，取最高分。
   * 分数 = 特征落在 fit 区间内的程度 + 少量偏置（同类均衡轮换由调用方处理）
   */
  function matchEffects(features, topN) {
    const { energy, tempo, brightness, dynamics } = features;
    const scored = EFFECTS.map(e => {
      const f = e.fit;
      const inRange = (v, r) => {
        if (v < r[0]) return Math.max(0, 1 - (r[0] - v) / 0.3);
        if (v > r[1]) return Math.max(0, 1 - (v - r[1]) / 0.3);
        return 1;
      };
      let s = 0;
      s += inRange(energy, f.energy) * 0.4;
      s += inRange(tempo, f.tempo) * 0.35;
      s += inRange(brightness, f.valence) * 0.25;
      s += dynamics * 0.0; // 动态分单独参与 tie-break
      return { effect: e, score: Math.max(0, s) };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topN || 3);
  }

  /**
   * 由特征推导一个具体灯效方案（可直接下发给灯具）
   */
  function buildPlan(effect, features) {
    const p = effect.params;
    const { energy, tempo, brightness, bpm, hue } = features;
    const speed = tempo > 0 ? Math.round(40 + tempo * 120) : 60; // 效果速度档
    return {
      effectId: effect.id,
      effectName: effect.name,
      tag: effect.tag,
      brightness: Math.round(Math.min(100, (p.base + energy * 0.55) * 100)),
      speed,
      hue: Math.round(hue),
      saturation: Math.round(Math.min(100, 45 + brightness * 55)),
      spread: Math.round(p.spread * 100) / 100,
      decay: Math.round(p.decay * 100) / 100,
      hueShift: p.hueShift,
      sync: {
        bpm: bpm || 0,
        mode: tempo > 0.55 ? 'beat' : 'energy',
        onBeatThreshold: 0.55,
        onBeatGain: Math.round(p.swing * 100)
      }
    };
  }

  /**
   * 序列化整个作品为可导出的灯效方案 JSON
   */
  function serializePlan(plans, features, meta) {
    return {
      format: 'aurora.lightplan/v1',
      generatedAt: new Date().toISOString(),
      source: meta || {},
      analysis: {
        bpm: features.bpm || 0,
        key: features.key || '',
        energy: Math.round(features.energy * 100) / 100,
        brightness: Math.round(features.brightness * 100) / 100,
        dynamics: Math.round(features.dynamics * 100) / 100,
        durationSec: features.durationSec || 0
      },
      timeline: plans.map(p => p.plan)
    };
  }

export const AuroraEngine = {
  BANDS,
  EFFECTS,
  extractFrame,
  estimateBpm,
  detectPitch,
  matchEffects,
  buildPlan,
  serializePlan,
  NOTE_NAMES
};
