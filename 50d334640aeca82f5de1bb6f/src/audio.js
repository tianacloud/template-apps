export class AudioEngine {
  constructor() {
    this.enabled = false;
    this.ctx = null;
    this.tick = 0;
  }
  start() {
    if (!this.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      this.ctx = new C();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.18;
      this.master.connect(this.ctx.destination);
      this.engine = this.ctx.createOscillator();
      const real = new Float32Array(12),
        imag = new Float32Array(12);
      [
        0, 0.9, 0.4, 0.23, 0.35, 0.12, 0.09, 0.15, 0.05, 0.06, 0.04, 0.03,
      ].forEach((v, i) => (imag[i] = v));
      this.engine.setPeriodicWave(this.ctx.createPeriodicWave(real, imag));
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.value = 210;
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.12;
      this.engine
        .connect(this.filter)
        .connect(this.engineGain)
        .connect(this.master);
      this.engine.start();
      const buffer = this.ctx.createBuffer(
        1,
        this.ctx.sampleRate * 2,
        this.ctx.sampleRate,
      );
      const samples = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < samples.length; i++) {
        last = (last + Math.random() * 0.04 - 0.02) / 1.02;
        samples[i] = last * 8;
      }
      this.road = this.ctx.createBufferSource();
      this.road.buffer = buffer;
      this.road.loop = true;
      this.roadGain = this.ctx.createGain();
      this.roadGain.gain.value = 0;
      this.road.connect(this.roadGain).connect(this.master);
      this.road.start();
      this.skid = this.ctx.createOscillator();
      this.skid.type = "triangle";
      this.skid.frequency.value = 720;
      this.skidGain = this.ctx.createGain();
      this.skidGain.gain.value = 0;
      this.skid.connect(this.skidGain).connect(this.master);
      this.skid.start();
    }
    this.enabled = true;
    this.ctx.resume();
    this.master.gain.setTargetAtTime(0.18, this.ctx.currentTime, 0.12);
  }
  toggle() {
    if (!this.enabled) {
      this.start();
      return true;
    }
    this.enabled = false;
    if (this.ctx)
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    return false;
  }
  update(speed, driving, throttle = false, drifting = false) {
    if (!this.ctx) return;
    const velocity = Math.abs(speed),
      gear = Math.min(5, Math.floor(velocity / 10) + 1);
    const rpm =
      1000 + (velocity - (gear - 1) * 10) * 310 + (throttle ? 500 : 0);
    this.engine.frequency.setTargetAtTime(rpm / 30, this.ctx.currentTime, 0.09);
    this.filter.frequency.setTargetAtTime(
      180 + rpm * 0.06,
      this.ctx.currentTime,
      0.1,
    );
    this.engineGain.gain.setTargetAtTime(
      driving ? (throttle ? 0.18 : 0.09) : 0,
      this.ctx.currentTime,
      0.1,
    );
    this.roadGain.gain.setTargetAtTime(
      driving ? Math.min(0.32, velocity * 0.009) : 0,
      this.ctx.currentTime,
      0.3,
    );
    this.skidGain.gain.setTargetAtTime(
      driving && drifting && velocity > 9 ? 0.06 : 0,
      this.ctx.currentTime,
      0.12,
    );
    this.skid.frequency.setTargetAtTime(
      600 + velocity * 12,
      this.ctx.currentTime,
      0.15,
    );
  }
  tone(freq, duration = 0.12, gain = 0.16, type = "sine") {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime,
      o = this.ctx.createOscillator(),
      g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + duration);
  }
  success() {
    [523.25, 659.25, 783.99].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.4, 0.24), i * 100),
    );
  }
}
