class SoundGeneratorClass {
  private audioContext: AudioContext | null = null;
  private fallbackSampleRate: number = 44100;

  private getContext(): AudioContext | null {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch (e) {
        console.warn('AudioContext not available, using fallback sample rate');
        return null;
      }
    }
    return this.audioContext;
  }

  generateSound(type: string): ArrayBuffer {
    const ctx = this.getContext();
    const sampleRate = ctx?.sampleRate || this.fallbackSampleRate;
    const duration = this.getDuration(type);
    const numSamples = Math.floor(sampleRate * duration);

    const buffer = ctx ? ctx.createBuffer(1, numSamples, sampleRate) : this.createFallbackBuffer(numSamples);
    const data = buffer.getChannelData(0);

    switch (type) {
      case 'click':
        this.generateClick(data, sampleRate);
        break;
      case 'success':
        this.generateSuccess(data, sampleRate);
        break;
      case 'failure':
        this.generateFailure(data, sampleRate);
        break;
      case 'snap':
        this.generateSnap(data, sampleRate);
        break;
      case 'pickup':
        this.generatePickup(data, sampleRate);
        break;
      case 'star':
        this.generateStar(data, sampleRate);
        break;
      case 'combo':
        this.generateCombo(data, sampleRate);
        break;
      case 'perfect':
        this.generatePerfect(data, sampleRate);
        break;
      case 'tick':
        this.generateTick(data, sampleRate);
        break;
      case 'whoosh':
        this.generateWhoosh(data, sampleRate);
        break;
      case 'drop':
        this.generateDrop(data, sampleRate);
        break;
      default:
        this.generateClick(data, sampleRate);
    }

    return this.bufferToArrayBuffer(buffer);
  }

  generateMusicLoop(type: 'home' | 'sort' | 'untangle' | 'pack'): ArrayBuffer {
    const ctx = this.getContext();
    const sampleRate = ctx?.sampleRate || this.fallbackSampleRate;
    const config = this.getMusicConfig(type);
    const numSamples = Math.floor(sampleRate * config.duration);

    const buffer = ctx ? ctx.createBuffer(1, numSamples, sampleRate) : this.createFallbackBuffer(numSamples);
    const data = buffer.getChannelData(0);

    this.synthesizeMusic(data, sampleRate, config);
    this.crossfadeLoop(data, sampleRate, 0.08);

    return this.bufferToArrayBuffer(buffer);
  }

  private getDuration(type: string): number {
    switch (type) {
      case 'click': return 0.1;
      case 'success': return 0.5;
      case 'failure': return 0.35;
      case 'snap': return 0.12;
      case 'pickup': return 0.08;
      case 'star': return 0.25;
      case 'combo': return 0.3;
      case 'perfect': return 0.7;
      case 'tick': return 0.06;
      case 'whoosh': return 0.18;
      case 'drop': return 0.15;
      default: return 0.1;
    }
  }

  private createFallbackBuffer(numSamples: number): AudioBuffer {
    const buffer = {
      length: numSamples,
      duration: numSamples / this.fallbackSampleRate,
      sampleRate: this.fallbackSampleRate,
      numberOfChannels: 1,
      getChannelData: () => new Float32Array(numSamples),
    } as unknown as AudioBuffer;
    return buffer;
  }

  private mixSamples(data: Float32Array, samples: Float32Array, gain: number): void {
    const len = Math.min(data.length, samples.length);
    for (let i = 0; i < len; i++) {
      data[i] += samples[i] * gain;
    }
  }

  private generateClick(data: Float32Array, sampleRate: number): void {
    const layer1 = new Float32Array(data.length);
    const layer2 = new Float32Array(data.length);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-t * 50) * Math.exp(-t * 50);
      layer1[i] = Math.sin(2 * Math.PI * 800 * t) * env;
      layer2[i] = Math.sin(2 * Math.PI * 1600 * t) * env * 0.15;
    }

    // Noise burst at attack (first 3ms)
    const noiseSamples = Math.floor(sampleRate * 0.003);
    for (let i = 0; i < noiseSamples && i < data.length; i++) {
      const t = i / sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 300) * 0.08;
    }

    this.mixSamples(data, layer1, 0.25);
    this.mixSamples(data, layer2, 0.25);
  }

  private generateSuccess(data: Float32Array, sampleRate: number): void {
    const freqs = [523.25, 659.25, 783.99];
    const noteDuration = data.length / sampleRate;
    const overlap = 0.3;

    for (let seg = 0; seg < freqs.length; seg++) {
      const freq = freqs[seg];
      const startTime = (seg * noteDuration / freqs.length) * (1 - overlap);
      const startSample = Math.floor(startTime * sampleRate);

      for (let i = 0; i < data.length - startSample; i++) {
        const idx = startSample + i;
        if (idx >= data.length) break;
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 6) * (1 - seg * 0.15);

        // Main tone + 5th harmonic shimmer
        const main = Math.sin(2 * Math.PI * freq * t);
        const harmonic = Math.sin(2 * Math.PI * freq * 5 * t) * 0.04;

        data[idx] += (main + harmonic) * envelope * 0.2;
      }
    }

    // Warm sweep underneath
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const sweepFreq = 200 + t * 600;
      const envelope = Math.exp(-t * 4) * 0.06;
      data[i] += Math.sin(2 * Math.PI * sweepFreq * t) * envelope;
    }
  }

  private generateFailure(data: Float32Array, sampleRate: number): void {
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const freq = 220 - t * 120;
      const envelope = Math.exp(-t * 6);
      // Detune for dissonant feel
      const main = Math.sin(2 * Math.PI * freq * t);
      const detune = Math.sin(2 * Math.PI * (freq * 1.02) * t) * 0.5;
      data[i] = (main + detune) * envelope * 0.2;
    }
  }

  private generateSnap(data: Float32Array, sampleRate: number): void {
    // Layer 1: Noise burst with bandpass feel (most satisfying part)
    const noiseDuration = Math.floor(sampleRate * 0.015);
    for (let i = 0; i < noiseDuration && i < data.length; i++) {
      const t = i / sampleRate;
      const noise = Math.random() * 2 - 1;
      const bandpass = Math.sin(2 * Math.PI * 2000 * t);
      const env = Math.exp(-t * 200);
      data[i] += noise * bandpass * env * 0.25;
    }

    // Layer 2: Sine pop at 800Hz
    const layer2 = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-t * 60);
      layer2[i] = Math.sin(2 * Math.PI * 800 * t) * env;
    }
    this.mixSamples(data, layer2, 0.3);

    // Layer 3: Rising harmonic 1200->2400Hz over 50ms
    const riseDuration = Math.floor(sampleRate * 0.05);
    for (let i = 0; i < riseDuration && i < data.length; i++) {
      const t = i / sampleRate;
      const freq = 1200 + (t / 0.05) * 1200;
      const env = Math.exp(-t * 40);
      data[i] += Math.sin(2 * Math.PI * freq * t) * env * 0.1;
    }
  }

  private generatePickup(data: Float32Array, sampleRate: number): void {
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Rising pitch for a "lift" feel
      const freq = 500 + t * 2000;
      const envelope = Math.exp(-t * 35);
      const main = Math.sin(2 * Math.PI * freq * t);
      const harmonic = Math.sin(2 * Math.PI * freq * 2 * t) * 0.15;
      data[i] = (main + harmonic) * envelope * 0.18;
    }
  }

  private generateStar(data: Float32Array, sampleRate: number): void {
    const freq = 1046.50;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.sin(t * Math.PI / 0.25) * Math.exp(-t * 4);
      const main = Math.sin(2 * Math.PI * freq * t);
      const octave = Math.sin(2 * Math.PI * freq * 2 * t) * 0.2;
      const shimmer = Math.sin(2 * Math.PI * freq * 3 * t) * 0.05 * Math.sin(t * 30);
      data[i] = (main + octave + shimmer) * envelope * 0.25;
    }
  }

  private generateCombo(data: Float32Array, sampleRate: number): void {
    const freqs = [880, 1108.73, 1318.51];
    const segmentLength = Math.floor(data.length / freqs.length);

    for (let seg = 0; seg < freqs.length; seg++) {
      const freq = freqs[seg];
      for (let i = 0; i < segmentLength; i++) {
        const idx = seg * segmentLength + i;
        if (idx >= data.length) break;
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 12);
        const main = Math.sin(2 * Math.PI * freq * t);
        const harmonic = Math.sin(2 * Math.PI * freq * 2 * t) * 0.1;
        data[idx] += (main + harmonic) * envelope * 0.2;
      }
    }

    // Bass undertone for punch
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      data[i] += Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 10) * 0.08;
    }
  }

  private generatePerfect(data: Float32Array, sampleRate: number): void {
    // C-major chord played simultaneously with vibrato
    const freqs = [523.25, 659.25, 783.99, 1046.50];

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.sin(Math.min(1, t * 20) * Math.PI / 2) * Math.exp(-t * 2.5);
      const vibrato = 1 + Math.sin(2 * Math.PI * 6 * t) * 0.003;

      let sample = 0;
      for (let f = 0; f < freqs.length; f++) {
        const gain = 1 - f * 0.15;
        sample += Math.sin(2 * Math.PI * freqs[f] * vibrato * t) * gain;
      }

      data[i] = (sample / freqs.length) * envelope * 0.3;
    }

    // Shimmer tail
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      data[i] += Math.sin(2 * Math.PI * 2093 * t) * Math.exp(-t * 5) * 0.02;
    }
  }

  private generateTick(data: Float32Array, sampleRate: number): void {
    const freq = 1500;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 100);
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.15;
    }
  }

  private generateWhoosh(data: Float32Array, sampleRate: number): void {
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const noise = Math.random() * 2 - 1;
      const envelope = Math.sin(t * Math.PI / 0.18);
      const sweep = Math.sin(2 * Math.PI * (300 + t * 800) * t);
      data[i] = noise * envelope * sweep * 0.08;
    }
  }

  private generateDrop(data: Float32Array, sampleRate: number): void {
    // Detuned sines with fast decay for a satisfying "settle" sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-t * 30);
      const f1 = Math.sin(2 * Math.PI * 440 * t);
      const f2 = Math.sin(2 * Math.PI * 445 * t);
      data[i] = (f1 + f2) * env * 0.15;
    }

    // Filtered noise layer
    const noiseSamples = Math.floor(sampleRate * 0.03);
    for (let i = 0; i < noiseSamples && i < data.length; i++) {
      const t = i / sampleRate;
      const noise = Math.random() * 2 - 1;
      data[i] += noise * Math.exp(-t * 100) * Math.sin(2 * Math.PI * 1000 * t) * 0.08;
    }
  }

  // --- Music generation ---

  private getMusicConfig(type: 'home' | 'sort' | 'untangle' | 'pack'): MusicConfig {
    const configs: Record<string, MusicConfig> = {
      home: {
        bpm: 90,
        duration: 8,
        scale: [0, 2, 4, 7, 9], // C pentatonic
        rootNote: 60, // Middle C
        melody: [0, 2, 4, 2, 0, 4, 7, 4, 2, 0, 7, 4, 2, 4, 0, -1],
        bassPattern: [0, -1, 7, -1, 0, -1, 4, -1],
        toneBlend: 0.7, // more sine = warmer
        volume: 0.12,
      },
      sort: {
        bpm: 110,
        duration: 8,
        scale: [0, 2, 4, 7, 9],
        rootNote: 62, // D
        melody: [4, 2, 0, 2, 4, 7, 4, 2, 0, 4, 7, 9, 7, 4, 2, 0],
        bassPattern: [0, 0, 4, -1, 7, 7, 4, -1],
        toneBlend: 0.5,
        volume: 0.10,
      },
      untangle: {
        bpm: 80,
        duration: 8,
        scale: [0, 2, 3, 7, 8], // Minor pentatonic-ish for ambient
        rootNote: 58, // Bb
        melody: [0, 2, 3, -1, 7, 3, 2, -1, 0, -1, 3, 7, 8, 7, 3, -1],
        bassPattern: [0, -1, -1, 7, -1, -1, 3, -1],
        toneBlend: 0.8, // very warm
        volume: 0.08,
      },
      pack: {
        bpm: 100,
        duration: 8,
        scale: [0, 2, 4, 5, 7],
        rootNote: 64, // E
        melody: [0, 2, 4, 5, 4, 2, 0, 5, 7, 5, 4, 2, 4, 5, 7, 4],
        bassPattern: [0, -1, 0, 5, -1, 7, 5, -1],
        toneBlend: 0.6,
        volume: 0.10,
      },
    };
    return configs[type];
  }

  private synthesizeMusic(data: Float32Array, sampleRate: number, config: MusicConfig): void {
    const { bpm, scale, rootNote, melody, bassPattern, toneBlend, volume } = config;
    const beatDuration = 60 / bpm;
    const halfBeat = beatDuration / 2;

    // Melody
    for (let i = 0; i < melody.length; i++) {
      const noteIndex = melody[i];
      if (noteIndex < 0) continue; // rest

      const semitone = noteIndex < scale.length ? scale[noteIndex] : scale[noteIndex % scale.length] + 12;
      const freq = this.midiToFreq(rootNote + semitone + 12); // one octave up
      const startSample = Math.floor(i * halfBeat * sampleRate);
      const noteSamples = Math.floor(halfBeat * sampleRate * 0.9);

      for (let j = 0; j < noteSamples; j++) {
        const idx = startSample + j;
        if (idx >= data.length) break;
        const t = j / sampleRate;
        const env = this.adsrEnvelope(t, 0.01, 0.05, 0.6, halfBeat * 0.9 - 0.1);
        const sine = Math.sin(2 * Math.PI * freq * t);
        const tri = this.triangle(freq, t);
        data[idx] += (sine * toneBlend + tri * (1 - toneBlend)) * env * volume;
      }
    }

    // Bass
    for (let i = 0; i < bassPattern.length; i++) {
      const noteIndex = bassPattern[i];
      if (noteIndex < 0) continue;

      const semitone = noteIndex < scale.length ? scale[noteIndex] : scale[noteIndex % scale.length] + 12;
      const freq = this.midiToFreq(rootNote + semitone - 12); // one octave down
      const startSample = Math.floor(i * beatDuration * sampleRate);
      const noteSamples = Math.floor(beatDuration * sampleRate * 0.8);

      for (let j = 0; j < noteSamples; j++) {
        const idx = startSample + j;
        if (idx >= data.length) break;
        const t = j / sampleRate;
        const env = this.adsrEnvelope(t, 0.005, 0.03, 0.5, beatDuration * 0.8 - 0.05);
        data[idx] += Math.sin(2 * Math.PI * freq * t) * env * volume * 0.6;
      }
    }
  }

  private crossfadeLoop(data: Float32Array, sampleRate: number, fadeDuration: number): void {
    const fadeSamples = Math.floor(sampleRate * fadeDuration);
    for (let i = 0; i < fadeSamples && i < data.length / 2; i++) {
      const ratio = i / fadeSamples;
      const endIdx = data.length - fadeSamples + i;
      if (endIdx >= 0 && endIdx < data.length) {
        data[i] = data[i] * ratio + data[endIdx] * (1 - ratio);
        data[endIdx] *= ratio;
      }
    }
  }

  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  private triangle(freq: number, t: number): number {
    const phase = (freq * t) % 1;
    return 2 * Math.abs(2 * phase - 1) - 1;
  }

  private adsrEnvelope(t: number, attack: number, decay: number, sustain: number, release: number): number {
    if (t < attack) return t / attack;
    if (t < attack + decay) return 1 - (1 - sustain) * ((t - attack) / decay);
    if (t < attack + decay + release) return sustain * (1 - (t - attack - decay) / release);
    return 0;
  }

  // --- WAV encoding ---

  private bufferToArrayBuffer(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(length * 2);
    const view = new DataView(arrayBuffer);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(i * 2, Math.floor(sample * 0x7FFF), true);
    }

    return arrayBuffer;
  }

  createWavBlob(type: string): Blob {
    const audioData = this.generateSound(type);
    return this.encodeWav(audioData);
  }

  createMusicWavBlob(type: 'home' | 'sort' | 'untangle' | 'pack'): Blob {
    const audioData = this.generateMusicLoop(type);
    return this.encodeWav(audioData);
  }

  private encodeWav(audioData: ArrayBuffer): Blob {
    const sampleRate = 44100;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = audioData.byteLength;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    const header = new ArrayBuffer(headerSize);
    const view = new DataView(header);

    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, totalSize - 8, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    const wavData = new Uint8Array(totalSize);
    wavData.set(new Uint8Array(header), 0);
    wavData.set(new Uint8Array(audioData), headerSize);

    return new Blob([wavData], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }
}

interface MusicConfig {
  bpm: number;
  duration: number;
  scale: number[];
  rootNote: number;
  melody: number[];
  bassPattern: number[];
  toneBlend: number;
  volume: number;
}

export const SoundGenerator = new SoundGeneratorClass();
