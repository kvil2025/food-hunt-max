// Procedural Web Audio Synthesizer for FOOD HUNT MAX
// 100% self-contained, no external audio assets needed!

class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public isMusicOn: boolean = true;
  private musicInterval: any = null;
  private musicStep: number = 0;
  private isInitialized: boolean = false;

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.isInitialized = true;
      if (this.isMusicOn) {
        this.startMusic();
      }
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  // Cute bubble pop when picking up a food cube (pitch increases with stack height!)
  public playPop(stackCount: number = 0) {
    if (this.isMuted || !this.ctx) return;
    this.resumeContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Base pitch around 380Hz, ascending with stack (musical pentatonic scale feel)
    const baseFreq = 420;
    const semitones = Math.min(stackCount, 16) * 1.5;
    const freq = baseFreq * Math.pow(2, semitones / 12);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.7, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.6, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Rewarding coin/chime sound when dropping a cube into the nest hole
  public playDeposit(index: number = 0) {
    if (this.isMuted || !this.ctx) return;
    this.resumeContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const pitches = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C, E, G, C, E, G
    const freq = pitches[index % pitches.length];

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.22);
    osc2.stop(now + 0.22);
  }

  // Trumpet fanfare on Level Up or Upgrade
  public playUpgrade() {
    if (this.isMuted || !this.ctx) return;
    this.resumeContext();

    const notes = [440, 554.37, 659.25, 880]; // A, C#, E, A
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + i * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i === 3 ? 0.35 : 0.14));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (i === 3 ? 0.35 : 0.14));
    });
  }

  // Soft footstep click
  public playFootstep() {
    if (this.isMuted || !this.ctx) return;
    if (Math.random() > 0.4) return; // Only play sometimes for organic rhythm
    this.resumeContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140 + Math.random() * 40, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.04);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Bouncy upbeat background melody
  public startMusic() {
    if (!this.ctx || this.musicInterval) return;
    this.isMusicOn = true;

    // Upbeat hypercasual chord progression & melody: C - G - Am - F
    const melody = [
      523.25, 0, 659.25, 783.99,  // C5, -, E5, G5
      587.33, 0, 783.99, 880.00,  // D5, -, G5, A5
      440.00, 523.25, 659.25, 0,  // A4, C5, E5, -
      698.46, 659.25, 587.33, 523.25 // F5, E5, D5, C5
    ];
    const bass = [
      130.81, 130.81, 196.00, 196.00, // C3, C3, G3, G3
      220.00, 220.00, 174.61, 174.61  // A3, A3, F3, F3
    ];

    const tempoMs = 170; // Bouncy 140 BPM vibe
    this.musicInterval = setInterval(() => {
      if (this.isMuted || !this.isMusicOn || !this.ctx) return;
      this.resumeContext();

      const note = melody[this.musicStep % melody.length];
      const bassNote = bass[Math.floor((this.musicStep / 2) % bass.length)];
      const now = this.ctx.currentTime;

      // Play melody note
      if (note > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      }

      // Play bass note every 2 steps
      if (this.musicStep % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassNote, now);

        bassGain.gain.setValueAtTime(0.12, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.28);
      }

      this.musicStep++;
    }, tempoMs);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicOn = false;
  }

  public toggleMusic(): boolean {
    if (this.isMusicOn) {
      this.stopMusic();
    } else {
      this.isMusicOn = true;
      this.startMusic();
    }
    return this.isMusicOn;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  private resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
}

export const soundManager = new SoundManager();
