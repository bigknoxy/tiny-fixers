import Phaser from 'phaser';
import { EventBus } from '@/core/EventBus';

class AudioManagerClass {
  private scene: Phaser.Scene | null = null;
  private _muted: boolean = false;
  private _musicVolume: number = 0.7;
  private _sfxVolume: number = 1.0;
  private currentMusic: Phaser.Sound.BaseSound | null = null;

  get muted(): boolean {
    return this._muted;
  }

  get musicVolume(): number {
    return this._musicVolume;
  }

  get sfxVolume(): number {
    return this._sfxVolume;
  }

  init(scene: Phaser.Scene): void {
    this.scene = scene;
  
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tiny_fixers_audio');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          this._muted = settings.muted ?? false;
          this._musicVolume = settings.musicVolume ?? 0.7;
          this._sfxVolume = settings.sfxVolume ?? 1.0;
        } catch {
          // Invalid JSON, use defaults
        }
      }
    }
  }

  playSound(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    if (!this.scene || this._muted) return;
    
    const volume = (config?.volume ?? 1) * this._sfxVolume;
    
    if (this.scene.cache.audio.exists(key)) {
      this.scene.sound.play(key, { ...config, volume });
    }
  }

  playMusic(key: string): void {
    if (!this.scene) return;
    
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
    }
    
    if (this._muted || this._musicVolume === 0) return;
    
    if (this.scene.cache.audio.exists(key)) {
      this.currentMusic = this.scene.sound.add(key, {
        loop: true,
        volume: this._musicVolume,
      });
      this.currentMusic.play();
    }
  }

  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  pauseMusic(): void {
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.currentMusic.pause();
    }
  }

  resumeMusic(): void {
    if (this.currentMusic && this.currentMusic.isPaused) {
      this.currentMusic.resume();
    }
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
    this.saveSettings();
    
    if (muted) {
      this.stopMusic();
    }
    
    EventBus.emit('audio:muted', { muted });
  }

  setMusicVolume(volume: number): void {
    this._musicVolume = Math.max(0, Math.min(1, volume));
    
    if (this.currentMusic) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(this._musicVolume);
    }
    
    this.saveSettings();
  }

  setSfxVolume(volume: number): void {
    this._sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  private saveSettings(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tiny_fixers_audio', JSON.stringify({
        muted: this._muted,
        musicVolume: this._musicVolume,
        sfxVolume: this._sfxVolume,
      }));
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this._muted);
    return this._muted;
  }
}

export const AudioManager = new AudioManagerClass();