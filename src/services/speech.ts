/**
 * Web Speech Synthesis and Recognition service for SAATHI.
 * Specially tuned with calm pitch and rate for elderly dementia patients.
 */

class SpeechService {
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  public soundEnabled = true;

  constructor() {
    // Enable sound by default
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saathi_sound_enabled');
      if (saved !== null) {
        this.soundEnabled = saved === 'true';
      }
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('saathi_sound_enabled', String(enabled));
      if (!enabled) {
        this.stop();
      }
    }
  }

  public speak(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      lang?: string;
      onEnd?: () => void;
      priority?: boolean;
    } = {}
  ): void {
    if (!this.soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (options.onEnd) options.onEnd();
      return;
    }

    try {
      if (options.priority || this.isSpeaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      // Elderly-friendly speech: slightly slower (0.85 rate), soothing normal pitch
      utterance.rate = options.rate ?? 0.88;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.lang = options.lang ?? 'en-IN'; // Indian English or regional fallback

      // Try selecting an Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      const inVoice = voices.find(
        (v) =>
          v.lang === 'en-IN' ||
          v.lang === 'hi-IN' ||
          v.name.includes('India') ||
          v.name.includes('Natural')
      );
      if (inVoice) {
        utterance.voice = inVoice;
      }

      this.isSpeaking = true;
      this.currentUtterance = utterance;

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (options.onEnd) options.onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      if (options.onEnd) options.onEnd();
    }
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public playGentleChime(type: 'success' | 'tap' | 'alert' = 'tap') {
    if (!this.soundEnabled || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (type === 'success') {
        // Warm two-tone gentle chime (C5 -> G5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain1.gain.setValueAtTime(0.15, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.6);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.15); // G5
        gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.9);
      } else if (type === 'alert') {
        // Gentle soft warning chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } else {
        // Soft wooden bubble click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch {
      // AudioContext unavailable or blocked by browser gesture
    }
  }
}

export const speechService = new SpeechService();
