declare const __APP_VERSION__: string;

import Phaser from 'phaser';
import { GAME_CONFIG } from '@/config/game.config';
import { BootScene } from '@/scenes/BootScene';
import { HomeScene } from '@/scenes/HomeScene';
import { LevelSelectScene } from '@/scenes/LevelSelectScene';
import { GameScene } from '@/scenes/GameScene';
import { ResultsScene } from '@/scenes/ResultsScene';
import { HubScene } from '@/scenes/HubScene';
import { SettingsScene } from '@/scenes/SettingsScene';
import { TutorialScene } from '@/scenes/TutorialScene';
import { EndlessScene } from '@/scenes/EndlessScene';
import { AchievementsScene } from '@/scenes/AchievementsScene';

export const APP_VERSION = __APP_VERSION__;

class TinyFixersGame {
  private game: Phaser.Game;

  constructor() {
    const config: Phaser.Types.Core.GameConfig = {
      ...GAME_CONFIG,
      scene: [
        BootScene,
        HomeScene,
        LevelSelectScene,
        GameScene,
        ResultsScene,
        HubScene,
        SettingsScene,
        TutorialScene,
        EndlessScene,
        AchievementsScene,
      ],
    };

    this.game = new Phaser.Game(config);

    this.setupVisibilityHandler();
  }

  private setupVisibilityHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.game.loop.sleep();
      } else {
        this.game.loop.wake();
      }
    });
  }
}

window.addEventListener('load', () => {
  new TinyFixersGame();
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/tiny-fixers/sw.js').catch((error) => {
      console.warn('Service Worker registration failed:', error);
    });
  }
});