import Phaser from 'phaser';
import { COLORS, colorToHex } from '@/config/colors';
import { UI } from '@/config/game.config';
import { StateManager } from '@/core/StateManager';
import { AudioManager } from '@/systems/AudioManager';
import { Effects } from '@/systems/Effects';
import { generateEndlessLevel } from '@/data/endlessGenerator';
import { LevelData, PuzzleType } from '@/config/types';
import { TutorialModal } from '@/systems/TutorialModal';
import { getPuzzleTypeByFirstLevel } from '@/data/puzzleTutorials';

export class EndlessScene extends Phaser.Scene {
  private currentLevel: LevelData | null = null;
  private score: number = 0;
  private levelSeed: number = 0;
  private scoreLabel!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'EndlessScene' });
  }

  init(): void {
    this.score = 0;
    this.levelSeed = Date.now();
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    this.add.rectangle(centerX, height / 2, width, height, COLORS.CREAM);

    Effects.init(this);

    this.createHeader(centerX, UI.SAFE_AREA_TOP + 30);
    this.generateNextLevel();

    this.scale.on('resize', this.handleResize, this);
  }

  private handleResize(): void {
    this.scene.restart();
  }

  private createHeader(x: number, y: number): void {
    const container = this.add.container(x, y);

    const backButton = this.createBackButton(-150, 0);

    this.scoreLabel = this.add.text(0, 0, 'Score: 0', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '28px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CORAL),
    }).setOrigin(0.5);

    container.add([backButton, this.scoreLabel]);
  }

  private createBackButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.circle(0, 0, 20, COLORS.WARM_WHITE, 0.8);
    bg.setStrokeStyle(2, 0xFFFFFF, 1);

    const arrow = this.add.text(0, 0, '←', {
      fontSize: '24px',
      color: colorToHex(COLORS.CHARCOAL),
    }).setOrigin(0.5);

    container.add([bg, arrow]);

    container.setInteractive(
      new Phaser.Geom.Circle(0, 0, 20),
      Phaser.Geom.Circle.Contains
    );

    container.on('pointerover', () => {
      bg.setFillStyle(COLORS.WARM_WHITE, 1);
      this.tweens.add({ targets: container, scale: 1.1, duration: 100 });
    });

    container.on('pointerout', () => {
      bg.setFillStyle(COLORS.WARM_WHITE, 0.8);
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
    });

    container.on('pointerup', () => {
      AudioManager.playSound('click');
      this.showExitConfirmation();
    });

    return container;
  }

  private generateNextLevel(): void {
    this.levelSeed = Date.now() + this.score;
    
    try {
      this.currentLevel = generateEndlessLevel(this.score, this.levelSeed);
      
      if (this.currentLevel) {
        this.checkAndShowPuzzleTutorial(this.currentLevel.type);
      } else {
        console.error('Failed to generate endless level');
        this.scene.start('HomeScene');
      }
    } catch (error) {
      console.error('Error generating endless level:', error);
      this.scene.start('HomeScene');
    }
  }

  private checkAndShowPuzzleTutorial(puzzleType: PuzzleType): void {
    if (StateManager.isPuzzleTypeTutorialSeen(puzzleType)) {
      this.startLevel();
      return;
    }

    const tutorialLevelId = puzzleType === PuzzleType.SORT ? 'sort_01'
      : puzzleType === PuzzleType.UNTANGLE ? 'untangle_01'
      : 'pack_21';
    const firstLevelType = getPuzzleTypeByFirstLevel(tutorialLevelId);
    
    if (firstLevelType !== puzzleType) {
      this.startLevel();
      return;
    }

    try {
      TutorialModal.show(this, puzzleType, () => {
        StateManager.markPuzzleTypeTutorialSeen(puzzleType);
        this.startLevel();
      });
    } catch (error) {
      console.error('Failed to show puzzle tutorial:', error);
      this.startLevel();
    }
  }

  private startLevel(): void {
    if (!this.currentLevel) return;

    this.scene.launch('GameScene', {
      levelData: this.currentLevel,
      isEndless: true,
      endlessScore: this.score,
    });

    this.scene.sleep();
  }

  handleLevelComplete(_stars: number, _time: number): void {
    this.score++;
    this.scoreLabel.setText(`Score: ${this.score}`);

    const isNewHighScore = StateManager.updateEndlessHighScore(this.score);

    if (isNewHighScore && this.score > 1) {
      this.showHighScorePopup();
    } else {
      this.generateNextLevel();
    }
  }

  handleLevelFail(): void {
    StateManager.recordEndlessGamePlayed(this.score);
    this.showGameOver();
  }

  private showHighScorePopup(): void {
    const { width, height } = this.scale;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.4);

    const panel = this.add.container(width / 2, height / 2);

    const bg = this.add.rectangle(0, 0, 280, 180, COLORS.WARM_WHITE);
    bg.setStrokeStyle(3, COLORS.MUSTARD, 1);

    const title = this.add.text(0, -50, 'New High Score!', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '24px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CORAL),
    }).setOrigin(0.5);

    const scoreText = this.add.text(0, 0, `${this.score}`, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '48px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.MUSTARD),
    }).setOrigin(0.5);

    const continueBtn = this.add.text(0, 55, 'Continue', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.SKY),
    }).setOrigin(0.5);

    panel.add([bg, title, scoreText, continueBtn]);

    Effects.popIn(panel);

    continueBtn.setInteractive({ useHandCursor: true });
    continueBtn.on('pointerup', () => {
      overlay.destroy();
      panel.destroy();
      this.generateNextLevel();
    });
  }

  private showGameOver(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    const overlay = this.add.rectangle(centerX, height / 2, width, height, 0x000000, 0.5);

    const panel = this.add.container(centerX, height / 2);

    const bg = this.add.rectangle(0, 0, 300, 280, COLORS.WARM_WHITE);
    bg.setStrokeStyle(3, COLORS.CORAL, 1);

    const title = this.add.text(0, -100, 'Game Over', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '32px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CORAL),
    }).setOrigin(0.5);

    const scoreLabel = this.add.text(0, -40, `Score: ${this.score}`, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '28px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CHARCOAL),
    }).setOrigin(0.5);

    const highScore = StateManager.getEndlessHighScore();
    const highScoreLabel = this.add.text(0, 0, `Best: ${highScore}`, {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '20px',
      color: colorToHex(COLORS.GRAPHITE),
    }).setOrigin(0.5);

    const coinReward = Math.min(100, this.score * 5);
    StateManager.addCoins(coinReward);

    const rewardText = this.add.text(0, 40, `+${coinReward} coins`, {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.MUSTARD),
    }).setOrigin(0.5);

    const retryBtn = this.add.container(-70, 90);
    const retryBg = this.add.rectangle(0, 0, 100, 44, COLORS.SKY);
    retryBg.setStrokeStyle(2, 0xFFFFFF, 0.5);
    const retryLabel = this.add.text(0, 0, 'Retry', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    retryBtn.add([retryBg, retryLabel]);
    retryBtn.setSize(100, 44);
    retryBtn.setInteractive({ useHandCursor: true });

    const homeBtn = this.add.container(70, 90);
    const homeBg = this.add.rectangle(0, 0, 100, 44, COLORS.GRAY);
    homeBg.setStrokeStyle(2, 0xFFFFFF, 0.5);
    const homeLabel = this.add.text(0, 0, 'Home', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    homeBtn.add([homeBg, homeLabel]);
    homeBtn.setSize(100, 44);
    homeBtn.setInteractive({ useHandCursor: true });

    panel.add([bg, title, scoreLabel, highScoreLabel, rewardText, retryBtn, homeBtn]);

    Effects.popIn(panel);

    retryBtn.on('pointerup', () => {
      AudioManager.playSound('click');
      overlay.destroy();
      panel.destroy();
      this.scene.restart();
    });

    homeBtn.on('pointerup', () => {
      AudioManager.playSound('click');
      overlay.destroy();
      panel.destroy();
      this.scene.start('HomeScene');
    });
  }

  private showExitConfirmation(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    const overlay = this.add.rectangle(centerX, height / 2, width, height, 0x000000, 0.5);

    const panel = this.add.container(centerX, height / 2);

    const bg = this.add.rectangle(0, 0, 280, 160, COLORS.WARM_WHITE);
    bg.setStrokeStyle(2, COLORS.GRAPHITE, 0.5);

    const title = this.add.text(0, -50, 'Exit Endless Mode?', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CHARCOAL),
    }).setOrigin(0.5);

    const message = this.add.text(0, -15, 'Your progress will be lost.', {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '16px',
      color: colorToHex(COLORS.GRAPHITE),
    }).setOrigin(0.5);

    const confirmBtn = this.add.text(-60, 35, 'Exit', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      backgroundColor: colorToHex(COLORS.ERROR),
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5);

    const cancelBtn = this.add.text(60, 35, 'Cancel', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      backgroundColor: colorToHex(COLORS.SAGE),
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5);

    panel.add([bg, title, message, confirmBtn, cancelBtn]);

    confirmBtn.setInteractive({ useHandCursor: true });
    confirmBtn.on('pointerup', () => {
      AudioManager.playSound('click');
      this.scene.start('HomeScene');
    });

    cancelBtn.setInteractive({ useHandCursor: true });
    cancelBtn.on('pointerup', () => {
      overlay.destroy();
      panel.destroy();
    });
  }

  shutdown(): void {
    this.scale.off('resize', this.handleResize, this);
  }
}
