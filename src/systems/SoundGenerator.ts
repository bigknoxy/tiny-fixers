class SoundGeneratorClass {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.audioContext;
  }

  generateSound(type: string): ArrayBuffer {
    const ctx = this.getContext();
    const sampleRate = ctx.sampleRate;
    const duration = this.getDuration(type);
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, numSamples, sampleRate);
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
      default: return 0.1;
    }
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
