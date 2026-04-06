import Phaser from 'phaser';
import { StateManager } from '@/core/StateManager';
import { AudioManager } from '@/systems/AudioManager';
import { InputManager } from '@/systems/InputManager';
import { Effects } from '@/systems/Effects';
import { SoundGenerator } from '@/systems/SoundGenerator';
import { Analytics } from '@/systems/Analytics';
import { COLORS } from '@/config/colors';

export class BootScene extends Phaser.Scene {
  private loadingBar: HTMLElement | null = null;
  private loadingText: HTMLElement | null = null;
  private blobUrls: string[] = [];
  private stateLoaded: boolean = false;

  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.loadingBar = document.getElementById('loading-progress');
    this.loadingText = document.getElementById('loading-text');

    this.load.on('progress', (value: number) => {
      if (this.loadingBar) {
        this.loadingBar.style.width = `${value * 100}%`;
      }
    });

    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      if (this.loadingText) {
        this.loadingText.textContent = `Loading: ${file.key}`;
      }
    });

    this.createPlaceholderAssets();
  }

  private createPlaceholderAssets(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Ball sprites with soft shadows
    const ballColors = [
      { key: 'ball_coral', color: COLORS.CORAL },
      { key: 'ball_sky', color: COLORS.SKY },
      { key: 'ball_sage', color: COLORS.SAGE },
      { key: 'ball_mustard', color: COLORS.MUSTARD },
      { key: 'ball_lavender', color: COLORS.LAVENDER },
      { key: 'ball_orange', color: 0xF4A261 },
      { key: 'ball_pink', color: 0xE8A0BF },
      { key: 'ball_teal', color: 0x4ECDC4 },
    ];
    
    ballColors.forEach(({ key, color }) => {
      graphics.clear();

      // Shadow
      graphics.fillStyle(0x000000, 0.1);
      graphics.fillCircle(18, 18, 14);

      // Outer ring (darker edge for depth)
      const r = (color >> 16) & 0xFF;
      const g = (color >> 8) & 0xFF;
      const b = color & 0xFF;
      const darkColor = ((Math.max(0, r - 40)) << 16) | ((Math.max(0, g - 40)) << 8) | Math.max(0, b - 40);
      graphics.fillStyle(darkColor, 0.5);
      graphics.fillCircle(16, 16, 14);

      // Main ball body
      graphics.fillStyle(color, 1);
      graphics.fillCircle(16, 16, 12);

      // Highlight
      graphics.fillStyle(0xFFFFFF, 0.4);
      graphics.fillCircle(12, 11, 5);

      graphics.generateTexture(key, 32, 32);
    });
    
    // Rounded button
    this.createRoundedButton('button_primary', 200, 56, COLORS.CORAL);
    this.createRoundedButton('button_secondary', 200, 56, COLORS.SKY);
    this.createRoundedButton('button_success', 200, 56, COLORS.SAGE);
    this.createRoundedButton('button_mustard', 200, 56, COLORS.MUSTARD);
    
    // Panel
    this.createRoundedPanel('panel', 320, 400, COLORS.WARM_WHITE);
    this.createRoundedPanel('panel_small', 280, 200, COLORS.WARM_WHITE);
    
    // Stars
    this.createStar('star_empty', COLORS.SOFT_GRAY);
    this.createStar('star_filled', COLORS.MUSTARD);
    
    // Coin
    this.createCoin('coin');
    
    // Icons
    this.createIcon('icon_settings', '⚙');
    this.createIcon('icon_back', '←');
    this.createIcon('icon_restart', '↻');
    this.createIcon('icon_home', '⌂');
    this.createIcon('icon_play', '▶');
    this.createIcon('icon_lock', '🔒');
    this.createIcon('icon_check', '✓');
    
    // Background pattern
    this.createBackgroundPattern('bg_pattern');
    
    graphics.destroy();
    
    // Generate audio sounds
    this.createSounds();
  }
  
  private createSounds(): void {
    const soundKeys = ['click', 'success', 'failure', 'snap', 'pickup', 'star', 'combo', 'perfect', 'tick', 'whoosh', 'drop'];

    soundKeys.forEach(key => {
      try {
        const blob = SoundGenerator.createWavBlob(key);
        const url = URL.createObjectURL(blob);
        this.blobUrls.push(url);
        this.load.audio(key, url);
      } catch (e) {
        console.warn(`Failed to create sound: ${key}`, e);
      }
    });

    // Generate procedural music loops
    const musicTypes: Array<'home' | 'sort' | 'untangle' | 'pack'> = ['home', 'sort', 'untangle', 'pack'];
    musicTypes.forEach(type => {
      try {
        const blob = SoundGenerator.createMusicWavBlob(type);
        const url = URL.createObjectURL(blob);
        this.blobUrls.push(url);
        this.load.audio(`music_${type}`, url);
      } catch (e) {
        console.warn(`Failed to create music: music_${type}`, e);
      }
    });

    const cleanup = () => {
      this.blobUrls.forEach(url => URL.revokeObjectURL(url));
      this.blobUrls = [];
    };

    this.load.once('complete', cleanup);
    this.load.once('loaderror', cleanup);
  }
  
  private createRoundedButton(key: string, width: number, height: number, color: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    const radius = 16;
    
    // Shadow
    graphics.fillStyle(0x000000, 0.1);
    graphics.fillRoundedRect(2, 4, width, height, radius);
    
    // Button body
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(0, 0, width, height, radius);
    
    // Highlight on top
    graphics.fillStyle(0xFFFFFF, 0.15);
    graphics.fillRoundedRect(0, 0, width, height / 2, { tl: radius, tr: radius, bl: 0, br: 0 });
    
    graphics.generateTexture(key, width + 4, height + 6);
    graphics.destroy();
  }
  
  private createRoundedPanel(key: string, width: number, height: number, color: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    const radius = 20;
    
    // Shadow
    graphics.fillStyle(0x000000, 0.08);
    graphics.fillRoundedRect(4, 6, width, height, radius);
    
    // Panel body
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(0, 0, width, height, radius);
    
    // Subtle border
    graphics.lineStyle(2, 0xFFFFFF, 0.8);
    graphics.strokeRoundedRect(0, 0, width, height, radius);
    
    graphics.generateTexture(key, width + 8, height + 8);
    graphics.destroy();
  }
  
  private createStar(key: string, color: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    graphics.fillStyle(color, 1);
    graphics.beginPath();
    
    const cx = 16, cy = 16, outerR = 14, innerR = 6, points = 5;
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      
      if (i === 0) graphics.moveTo(x, y);
      else graphics.lineTo(x, y);
    }
    
    graphics.closePath();
    graphics.fillPath();
    
    // Highlight
    graphics.fillStyle(0xFFFFFF, 0.3);
    graphics.fillCircle(12, 11, 3);
    
    graphics.generateTexture(key, 32, 32);
    graphics.destroy();
  }
  
  private createCoin(key: string): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Shadow
    graphics.fillStyle(0x000000, 0.15);
    graphics.fillCircle(14, 15, 12);
    
    // Coin body
    graphics.fillStyle(COLORS.MUSTARD, 1);
    graphics.fillCircle(12, 12, 12);
    
    // Inner circle
    graphics.lineStyle(2, COLORS.MUSTARD_DARK, 1);
    graphics.strokeCircle(12, 12, 8);
    
    // Highlight
    graphics.fillStyle(0xFFFFFF, 0.4);
    graphics.fillCircle(8, 8, 4);
    
    graphics.generateTexture(key, 28, 30);
    graphics.destroy();
  }
  
  private createIcon(key: string, _char: string): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Circle background
    graphics.fillStyle(0xFFFFFF, 0.2);
    graphics.fillCircle(20, 20, 20);
    
    graphics.generateTexture(key, 40, 40);
    graphics.destroy();
  }
  
  private createBackgroundPattern(key: string): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    const size = 64;
    
    // Subtle dot pattern
    graphics.fillStyle(0x000000, 0.03);
    for (let x = 0; x < size; x += 16) {
      for (let y = 0; y < size; y += 16) {
        graphics.fillCircle(x + 8, y + 8, 2);
      }
    }
    
    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  async create(): Promise<void> {
    if (this.loadingText) {
      this.loadingText.textContent = 'Initializing...';
    }

    await StateManager.load();
    this.stateLoaded = true;

    AudioManager.init(this);
    InputManager.init(this);
    Effects.init(this);
    Analytics.init();

    this.setupVisibilityHandler();

    if (this.loadingText) {
      this.loadingText.textContent = 'Ready!';
    }

    this.time.delayedCall(400, () => {
      const loadingScreen = document.getElementById('loading');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.4s ease-out';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 400);
      }

      if (!StateManager.isTutorialCompleted()) {
        this.scene.start('TutorialScene');
      } else {
        this.scene.start('HomeScene');
      }
    });
  }

  private setupVisibilityHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.stateLoaded) {
          StateManager.saveSync();
        }
        AudioManager.pauseMusic();
      } else {
        AudioManager.resumeMusic();
        StateManager.updateDailyStreak();
      }
    });

    window.addEventListener('beforeunload', () => {
      if (this.stateLoaded) {
        StateManager.saveSync();
      }
    });
  }
}