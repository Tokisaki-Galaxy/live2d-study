// Sound effects utility using Web Audio API
// This generates simple procedural sound effects without needing audio files

export type SoundEffect = 'timer-start' | 'timer-end' | 'timer-warning';

class SoundManager {
  private audioContext: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Play a cheerful "start" sound - ascending notes
   */
  private playTimerStart() {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;

    // Three ascending notes
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const startTime = now + index * 0.15;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  }

  /**
   * Play a satisfying "complete" sound - chord progression
   */
  private playTimerEnd() {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;

    // Play a nice chord (C major -> D major)
    const chord1 = [523.25, 659.25, 783.99]; // C5, E5, G5
    const chord2 = [587.33, 739.99, 880.00]; // D5, F#5, A5

    // First chord
    chord1.forEach(freq => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      oscillator.start(now);
      oscillator.stop(now + 0.5);
    });

    // Second chord
    chord2.forEach(freq => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const startTime = now + 0.3;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.7);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.7);
    });
  }

  /**
   * Play a gentle warning sound - three soft beeps
   */
  private playTimerWarning() {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;

    // Three gentle beeps
    for (let i = 0; i < 3; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = 880; // A5 - gentle tone

      const startTime = now + i * 0.4;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.25);
    }
  }

  /**
   * Play a sound effect
   */
  play(effect: SoundEffect) {
    try {
      switch (effect) {
        case 'timer-start':
          this.playTimerStart();
          break;
        case 'timer-end':
          this.playTimerEnd();
          break;
        case 'timer-warning':
          this.playTimerWarning();
          break;
      }
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
