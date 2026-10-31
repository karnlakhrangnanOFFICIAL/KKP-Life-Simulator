// Gentle synthesized Web Audio API feedback for game turns, events, and milestones

class SoundController {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playTick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.07);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.05, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.17);
    });
  }

  public playAlert() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.15);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  /**
   * Urgent dual-pulse harmonic warning cue reserved strictly for 'CRITICAL' event toasts
   */
  public playCriticalToastCue() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const pulses = [
      { start: 0, f1: 440, f2: 311.13 },
      { start: 0.18, f1: 415.3, f2: 293.66 },
    ];

    pulses.forEach(({ start, f1, f2 }) => {
      [f1, f2].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + start);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.92, now + start + 0.14);
        gain.gain.setValueAtTime(idx === 0 ? 0.065 : 0.03, now + start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + 0.16);
      });
    });
  }

  /**
   * Ceremonial Thai pentatonic golden chime reserved strictly for 'MILESTONE_THAI' event toasts
   */
  public playThaiMilestoneToastCue() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Ascending Thai pentatonic notes (C5 - D5 - E5 - G5 - C6)
    const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      const start = now + idx * 0.075;
      const duration = idx === notes.length - 1 ? 0.42 : 0.22;

      const oscMain = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const gain = ctx.createGain();

      oscMain.type = 'triangle';
      oscMain.frequency.setValueAtTime(freq, start);

      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(freq * 2, start);

      gain.gain.setValueAtTime(0.06, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      oscMain.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(ctx.destination);

      oscMain.start(start);
      oscHarmonic.start(start);
      oscMain.stop(start + duration + 0.02);
      oscHarmonic.stop(start + duration + 0.02);
    });
  }

  public playGameOver() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [392.0, 349.23, 329.63, 261.63].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);
      gain.gain.setValueAtTime(0.06, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.32);
    });
  }
}

export const soundFX = new SoundController();
