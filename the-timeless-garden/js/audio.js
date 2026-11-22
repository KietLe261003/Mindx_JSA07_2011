// Bộ tổng hợp âm thanh Web Audio API (Piano nhẹ, chuông gió, lật trang)
class GardenAudioEngine {
  constructor() {
    this.ctx = null;
    this.isEnabled = false;
    this.ambientTimer = null;
    // Hợp âm trưởng ấm áp (Fmaj7 -> Cmaj7 -> Am7 -> G6)
    this.chords = [
      [174.61, 220.0, 261.63, 329.63],
      [261.63, 329.63, 392.0, 493.88],
      [220.0, 261.63, 329.63, 392.0],
      [196.0, 246.94, 293.66, 329.63]
    ];
    this.step = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    if (this.isEnabled) {
      this.init();
      this.startAmbientPiano();
    } else {
      this.stopAmbientPiano();
    }
    return this.isEnabled;
  }

  playSoftNote(freq, duration = 2.6, volume = 0.035) {
    if (!this.isEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  startAmbientPiano() {
    this.stopAmbientPiano();
    const playStep = () => {
      if (!this.isEnabled) return;
      const chord = this.chords[this.step % this.chords.length];
      chord.forEach((freq, idx) => {
        setTimeout(() => this.playSoftNote(freq, 3.2, 0.028), idx * 320);
      });
      this.step++;
    };
    playStep();
    this.ambientTimer = setInterval(playStep, 4600);
  }

  stopAmbientPiano() {
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
  }

  playChime() {
    if (!this.isEnabled) return;
    this.init();
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => this.playSoftNote(f, 1.8, 0.04), i * 110);
    });
  }

  playPageTurn() {
    if (!this.isEnabled) return;
    this.init();
    this.playSoftNote(392.0, 0.9, 0.03);
    setTimeout(() => this.playSoftNote(493.88, 1.1, 0.03), 120);
  }
}

window.gardenAudio = new GardenAudioEngine();
