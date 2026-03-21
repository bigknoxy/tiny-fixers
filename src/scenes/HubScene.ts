import Phaser from 'phaser';
import { COLORS } from '@/config/colors';
import { UI } from '@/config/game.config';
import { MaterialType } from '@/config/types';
import { HUB_LOCATIONS } from '@/data/hub';
import { StateManager } from '@/core/StateManager';
import { AudioManager } from '@/systems/AudioManager';
import { Effects } from '@/systems/Effects';
import { InputManager } from '@/systems/InputManager';

export class HubScene extends Phaser.Scene {
  private infoPanel: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'HubScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const safeTop = UI.SAFE_AREA_TOP + 20;
    const safeBottom = height - UI.SAFE_AREA_BOTTOM;

    this.add.rectangle(centerX, height / 2, width, height, COLORS.PRIMARY_LIGHT);

    this.createHeader(centerX, safeTop);
    this.createHubView(centerX, safeTop + 100);
    this.createBottomBar(centerX, safeBottom - 60);

    this.updateStreakDisplay();
  }

  private createHeader(x: number, y: number): void {
    const container = this.add.container(x, y);

    const backButton = this.createBackButton(-150, 0);

    const title = this.add.text(0, 0, 'My Hub', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const coinsIcon = this.add.circle(100, 0, 12, COLORS.ACCENT);
    const coinsText = this.add.text(120, 0, `${StateManager.state.economy.coins}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
    }).setOrigin(0, 0.5);

    container.add([backButton, title, coinsIcon, coinsText]);
  }

  private createBackButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.circle(0, 0, 20, COLORS.WHITE, 0.2);
    const arrow = this.add.text(0, 0, '←', {
      fontSize: '24px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    container.add([bg, arrow]);
    
    container.setInteractive(
      new Phaser.Geom.Circle(0, 0, 20),
      Phaser.Geom.Circle.Contains
    );

    container.on('pointerover', () => {
      bg.setFillStyle(COLORS.WHITE, 0.35);
      this.tweens.add({ targets: container, scale: 1.1, duration: 100 });
    });

    container.on('pointerout', () => {
      bg.setFillStyle(COLORS.WHITE, 0.2);
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
    });

    container.on('pointerdown', () => {
      this.tweens.add({ targets: container, scale: 0.95, duration: 50 });
    });

    container.on('pointerup', () => {
      this.tweens.add({ 
        targets: container, 
        scale: 1, 
        duration: 100,
        ease: 'Back.out',
        onComplete: () => {
          AudioManager.playSound('click');
          this.scene.start('HomeScene');
        }
      });
    });

    return container;
  }

  private createHubView(x: number, y: number): void {
    const width = 350;
    const height = 400;

    const hubBg = this.add.rectangle(x, y + height / 2, width, height, COLORS.WHITE, 0.1);
    hubBg.setStrokeStyle(2, COLORS.WHITE, 0.3);

    HUB_LOCATIONS.forEach((location, index) => {
      const locX = x;
      const locY = y + 80 + index * 150;

      this.createLocationCard(locX, locY, location);
    });
  }

  private createLocationCard(
    x: number,
    y: number,
    location: typeof HUB_LOCATIONS[0]
  ): void {
    const container = this.add.container(x, y);

    const hubState = StateManager.state.progress.hubProgress[location.id];
    const isUnlocked = hubState?.unlocked || false;
    const hasEnoughStars = StateManager.state.progress.totalStars >= location.requiredStars;

    const cardWidth = 320;
    const cardHeight = 120;

    const bg = this.add.rectangle(0, 0, cardWidth, cardHeight, COLORS.WHITE, 0.9);
    bg.setStrokeStyle(
      3,
      isUnlocked ? COLORS.SUCCESS : hasEnoughStars ? COLORS.ACCENT : COLORS.GRAY,
      0.8
    );

    const name = this.add.text(-140, -40, location.name, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: isUnlocked ? '#4A90D9' : '#999999',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    const progress = this.add.text(-140, -10, `Stage ${hubState?.currentStage || 0}/${location.stages.length}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#666666',
    }).setOrigin(0, 0.5);

    const progressContainer = this.add.container(0, 20);
    const progressBg = this.add.rectangle(0, 0, cardWidth - 40, 12, COLORS.GRAY, 0.3);
    const progressFill = this.add.rectangle(
      -(cardWidth - 40) / 2 + ((cardWidth - 40) * (hubState?.currentStage || 0)) / location.stages.length / 2,
      0,
      ((cardWidth - 40) * (hubState?.currentStage || 0)) / location.stages.length,
      8,
      COLORS.SUCCESS
    );
    progressContainer.add([progressBg, progressFill]);

    container.add([bg, name, progress, progressContainer]);

    if (!isUnlocked && hasEnoughStars) {
      const unlockBtn = this.add.text(100, -40, 'Unlock', {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        backgroundColor: '#' + COLORS.SUCCESS.toString(16).padStart(6, '0'),
        padding: { x: 12, y: 6 },
      }).setOrigin(0.5);

      unlockBtn.setInteractive({ useHandCursor: true });
      unlockBtn.on('pointerup', () => {
        StateManager.unlockHubLocation(location.id);
        AudioManager.playSound('success');
        this.scene.restart();
      });

      container.add(unlockBtn);
    } else if (!isUnlocked) {
      const lockText = this.add.text(100, -40, `🔒 ${location.requiredStars} stars`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#999999',
      }).setOrigin(0.5);

      container.add(lockText);
    }

    container.setSize(cardWidth, cardHeight);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerup', () => {
      if (isUnlocked) {
        this.showLocationDetails(location);
      }
    });

    container.on('pointerover', () => {
      if (isUnlocked) {
        this.tweens.add({
          targets: container,
          scale: 1.02,
          duration: 100,
        });
      }
    });

    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 100,
      });
    });
  }

  private showLocationDetails(location: typeof HUB_LOCATIONS[0]): void {
    if (this.infoPanel) {
      this.infoPanel.destroy();
    }

    const { width, height } = this.scale;
    const centerX = width / 2;

    this.infoPanel = this.add.container(centerX, height / 2);

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.5);

    const panelBg = this.add.rectangle(0, 0, 340, 400, COLORS.WHITE);
    panelBg.setStrokeStyle(3, COLORS.PRIMARY, 1);

    const title = this.add.text(0, -170, location.name, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#4A90D9',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const closeBtn = this.add.text(140, -170, '✕', {
      fontSize: '24px',
      color: '#666666',
    }).setOrigin(0.5);

    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerup', () => {
      if (this.infoPanel) {
        this.infoPanel.destroy();
        this.infoPanel = null;
      }
    });

    this.infoPanel.add([overlay, panelBg, title, closeBtn]);

    const hubState = StateManager.state.progress.hubProgress[location.id];
    const currentStage = hubState?.currentStage || 0;

    location.stages.forEach((stage, index) => {
      const stageY = -100 + index * 80;
      const isComplete = index < currentStage;
      const isCurrent = index === currentStage;
      const canAfford = this.canAffordStage(stage);

      const stageBg = this.add.rectangle(0, stageY, 300, 60, isComplete ? COLORS.SUCCESS : isCurrent ? COLORS.ACCENT : COLORS.GRAY, 0.3);
      stageBg.setStrokeStyle(2, isComplete ? COLORS.SUCCESS : isCurrent ? COLORS.ACCENT : COLORS.GRAY, 0.5);

      const stageName = this.add.text(-130, stageY - 10, stage.name, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#333333',
        fontStyle: 'bold',
      }).setOrigin(0, 0.5);

      const stageCost = this.add.text(-130, stageY + 12, `${stage.cost} coins`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#666666',
      }).setOrigin(0, 0.5);

      const panel = this.infoPanel;
      if (!panel) return;
      
      panel.add([stageBg, stageName, stageCost]);

      if (isCurrent && canAfford) {
        const upgradeBtn = this.add.text(100, stageY, 'Upgrade', {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: '#FFFFFF',
          backgroundColor: '#' + COLORS.SUCCESS.toString(16).padStart(6, '0'),
          padding: { x: 10, y: 6 },
        }).setOrigin(0.5);

        upgradeBtn.setInteractive({ useHandCursor: true });
        upgradeBtn.on('pointerup', () => {
          this.upgradeLocation(location.id, stage);
        });

        panel.add(upgradeBtn);
      } else if (isComplete) {
        const checkmark = this.add.text(100, stageY, '✓', {
          fontSize: '24px',
          color: '#' + COLORS.SUCCESS.toString(16).padStart(6, '0'),
        }).setOrigin(0.5);

        panel.add(checkmark);
      }
    });

    Effects.popIn(this.infoPanel);
  }

  private canAffordStage(stage: { cost: number; materials: { type: MaterialType; amount: number }[] }): boolean {
    if (StateManager.state.economy.coins < stage.cost) return false;

    for (const mat of stage.materials) {
      const available = StateManager.state.economy.materials[mat.type] || 0;
      if (available < mat.amount) return false;
    }

    return true;
  }

  private upgradeLocation(locationId: string, stage: { cost: number; materials: { type: MaterialType; amount: number }[] }): void {
    if (!this.canAffordStage(stage)) return;

    StateManager.spendCoins(stage.cost);
    StateManager.spendMaterials(stage.materials);
    StateManager.upgradeHub(locationId);

    AudioManager.playSound('success');
    Effects.confetti(this.scale.width / 2, this.scale.height / 2, 20);
    InputManager.vibrate(40);

    this.scene.restart();
  }

  private createBottomBar(x: number, y: number): void {
    const container = this.add.container(x, y);

    const streak = StateManager.state.daily.currentStreak;
    const streakText = this.add.text(0, 0, `🔥 ${streak} Day Streak`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    container.add(streakText);
  }

  private updateStreakDisplay(): void {
    StateManager.updateDailyStreak();
  }
}