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
      default:
        this.generateClick(data, sampleRate);
    }

    return this.bufferToArrayBuffer(buffer);
  }

  private getDuration(type: string): number {
    switch (type) {
      case 'click': return 0.08;
      case 'success': return 0.4;
      case 'failure': return 0.3;
      case 'snap': return 0.1;
      case 'pickup': return 0.06;
      case 'star': return 0.2;
      case 'combo': return 0.25;
      case 'perfect': return 0.6;
      case 'tick': return 0.05;
      case 'whoosh': return 0.15;
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

  private generateClick(data: Float32Array, sampleRate: number): void {
    const freq = 800;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 40);
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
    }
  }

  private generateSuccess(data: Float32Array, sampleRate: number): void {
    const freqs = [523.25, 659.25, 783.99];
    const segmentLength = Math.floor(data.length / 3);
    
    for (let seg = 0; seg < 3; seg++) {
      const freq = freqs[seg];
      for (let i = 0; i < segmentLength; i++) {
        const idx = seg * segmentLength + i;
        if (idx >= data.length) break;
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 8) * (1 - seg * 0.2);
        data[idx] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.25;
      }
    }
  }

  private generateFailure(data: Float32Array, sampleRate: number): void {
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const freq = 200 - t * 100;
      const envelope = Math.exp(-t * 6);
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
    }
  }

  private generateSnap(data: Float32Array, sampleRate: number): void {
    const freq = 1200;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 50);
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.35;
    }
  }

  private generatePickup(data: Float32Array, sampleRate: number): void {
    const freq = 600;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 30);
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2;
    }
  }

  private generateStar(data: Float32Array, sampleRate: number): void {
    const freq = 1046.50;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.sin(t * Math.PI / 0.2) * Math.exp(-t * 5);
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
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
        const envelope = Math.exp(-t * 15);
        data[idx] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.25;
      }
    }
  }

  private generatePerfect(data: Float32Array, sampleRate: number): void {
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    const segmentLength = Math.floor(data.length / freqs.length);
    
    for (let seg = 0; seg < freqs.length; seg++) {
      const freq = freqs[seg];
      for (let i = 0; i < segmentLength; i++) {
        const idx = seg * segmentLength + i;
        if (idx >= data.length) break;
        const t = i / sampleRate;
        const envelope = Math.sin(t * Math.PI / 0.15) * Math.exp(-t * 3);
        data[idx] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
      }
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
      const envelope = Math.sin(t * Math.PI / 0.15);
      const filter = Math.sin(2 * Math.PI * 400 * t);
      data[i] = noise * envelope * filter * 0.1;
    }
  }

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

export const SoundGenerator = new SoundGeneratorClass();
