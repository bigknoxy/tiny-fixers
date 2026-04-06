import Phaser from 'phaser';
import { COLORS, colorToHex } from '@/config/colors';
import { UI } from '@/config/game.config';
import { StateManager } from '@/core/StateManager';
import { AudioManager } from '@/systems/AudioManager';
import { Effects } from '@/systems/Effects';
import { InputManager } from '@/systems/InputManager';

interface TutorialStep {
  text: string;
  highlight?: { x: number; y: number; width: number; height: number };
}

const TUTORIAL_STEPS: TutorialStep[] = [
  { text: 'Welcome! Drag the RED ball to the RED bin!', highlight: { x: 100, y: 220, width: 60, height: 60 } },
  { text: 'Now drag the BLUE ball to the BLUE bin!', highlight: { x: 290, y: 220, width: 60, height: 60 } },
  { text: 'You\'re a natural! Let\'s go!' },
];

export class TutorialScene extends Phaser.Scene {
  private currentStep: number = 0;
  private stepText!: Phaser.GameObjects.Text;
  private handPointer!: Phaser.GameObjects.Text;
  private highlight?: Phaser.GameObjects.Rectangle;
  private tutorialBins: Phaser.GameObjects.Rectangle[] = [];
  private itemPlaced: number = 0;
  private handTween?: Phaser.Tweens.Tween;
  private binPositions: { red: { x: number; y: number }; blue: { x: number; y: number } } = { red: { x: 0, y: 0 }, blue: { x: 0, y: 0 } };

  constructor() {
    super({ key: 'TutorialScene' });
  }

  create(): void {
    Effects.init(this);
    
    const { width, height } = this.scale;
    const centerX = width / 2;
    const safeTop = UI.SAFE_AREA_TOP + 20;

    this.createBackground(width, height);
    this.createTutorialArea(width, height);
    this.createUI(centerX, safeTop);
    this.showStep(0);
  }

  private createBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.CREAM);
    
    const pattern = this.add.tileSprite(width / 2, height / 2, width, height, 'bg_pattern');
    pattern.setAlpha(0.3);
    
    const topDeco = this.add.graphics();
    topDeco.fillStyle(COLORS.SOFT_PEACH, 0.6);
    topDeco.beginPath();
    topDeco.moveTo(0, 0);
    topDeco.lineTo(width, 0);
    topDeco.lineTo(width, 120);
    topDeco.lineTo(width / 2, 160);
    topDeco.lineTo(0, 120);
    topDeco.closePath();
    topDeco.fillPath();
  }

  private createTutorialArea(width: number, height: number): void {
    const binY = height - 250;
    const binWidth = 100;
    const binHeight = 120;
    const startX = (width - 2 * binWidth - 40) / 2;

    const redBin = this.add.rectangle(startX + binWidth / 2, binY, binWidth, binHeight, COLORS.CORAL, 0.3);
    redBin.setStrokeStyle(4, COLORS.CORAL, 1);
    this.add.text(startX + binWidth / 2, binY + binHeight / 2 + 20, 'RED', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    
    const blueBin = this.add.rectangle(startX + binWidth + 40 + binWidth / 2, binY, binWidth, binHeight, COLORS.SKY, 0.3);
    blueBin.setStrokeStyle(4, COLORS.SKY, 1);
    this.add.text(startX + binWidth + 40 + binWidth / 2, binY + binHeight / 2 + 20, 'BLUE', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    this.tutorialBins = [redBin, blueBin];
    this.binPositions = {
      red: { x: redBin.x, y: redBin.y },
      blue: { x: blueBin.x, y: blueBin.y },
    };

    const itemY = 220;
    const redBall = this.add.circle(100, itemY, 25, COLORS.CORAL);
    redBall.setStrokeStyle(3, 0xFFFFFF, 0.5);
    redBall.setData('type', 'red');
    redBall.setData('binIndex', 0);
    redBall.setData('originalX', 100);
    redBall.setData('originalY', itemY);
    
    const blueBall = this.add.circle(290, itemY, 25, COLORS.SKY);
    blueBall.setStrokeStyle(3, 0xFFFFFF, 0.5);
    blueBall.setData('type', 'blue');
    blueBall.setData('binIndex', 1);
    blueBall.setData('originalX', 290);
    blueBall.setData('originalY', itemY);

    this.setupDraggable(redBall, 0);
    this.setupDraggable(blueBall, 1);
  }

  private setupDraggable(ball: Phaser.GameObjects.Arc, ballIndex: number): void {
    ball.setInteractive({ useHandCursor: true, draggable: true });
    this.input.setDraggable(ball);

    ball.on('dragstart', () => {
      this.children.bringToTop(ball);
      this.tweens.add({
        targets: ball,
        scale: 1.15,
        duration: 100,
      });
      InputManager.vibrate(10);
      AudioManager.playSound('pickup');
    });

    ball.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      ball.x = dragX;
      ball.y = dragY;
    });

    ball.on('dragend', () => {
      this.tweens.add({
        targets: ball,
        scale: 1,
        duration: 100,
      });
      this.checkBallPlacement(ball, ballIndex);
    });
  }

  private checkBallPlacement(ball: Phaser.GameObjects.Arc, ballIndex: number): void {
    const ballBounds = ball.getBounds();
    const bin = this.tutorialBins[ball.getData('binIndex') as number];
    const binBounds = bin.getBounds();

    if (Phaser.Geom.Rectangle.Overlaps(ballBounds, binBounds)) {
      this.placeBall(ball, bin);
      this.itemPlaced++;
      
      if (ballIndex === 0 && this.itemPlaced === 1) {
        this.completeStepAndAdvance();
      } else if (ballIndex === 1 && this.itemPlaced === 2) {
        this.completeStepAndAdvance();
      }
    } else {
      this.returnBall(ball);
    }
  }

  private placeBall(ball: Phaser.GameObjects.Arc, bin: Phaser.GameObjects.Rectangle): void {
    this.tweens.add({
      targets: ball,
      x: bin.x,
      y: bin.y - 30,
      scale: 0.8,
      duration: 150,
      ease: 'Back.out',
    });
    ball.disableInteractive();
    Effects.particles(ball.x, ball.y, { color: ball.fillColor, count: 10 });
    AudioManager.playSound('snap');
    InputManager.vibrate(25);
  }

  private returnBall(ball: Phaser.GameObjects.Arc): void {
    this.tweens.add({
      targets: ball,
      x: ball.getData('originalX'),
      y: ball.getData('originalY'),
      duration: 200,
      ease: 'Back.out',
    });
  }

  private createUI(x: number, y: number): void {
    const title = this.add.text(x, y + 20, 'Tutorial', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '36px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CORAL),
    }).setOrigin(0.5);
    title.setShadow(0, 3, colorToHex(COLORS.CORAL_DARK), 0, true, false);

    this.stepText = this.add.text(x, y + 80, '', {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '20px',
      color: colorToHex(COLORS.CHARCOAL),
      align: 'center',
      wordWrap: { width: 340 },
    }).setOrigin(0.5);

    this.handPointer = this.add.text(0, 0, '👆', {
      fontSize: '32px',
    }).setOrigin(0.5);
    this.handPointer.setVisible(false);
  }

  private showStep(stepIndex: number): void {
    this.currentStep = stepIndex;
    const step = TUTORIAL_STEPS[stepIndex];

    this.tweens.add({
      targets: this.stepText,
      alpha: 0,
      y: this.stepText.y - 10,
      duration: 150,
      onComplete: () => {
        this.stepText.setText(step.text);
        this.stepText.y = UI.SAFE_AREA_TOP + 100;
        this.tweens.add({
          targets: this.stepText,
          alpha: 1,
          y: UI.SAFE_AREA_TOP + 80,
          duration: 200,
        });
      },
    });

    if (this.highlight) {
      this.highlight.destroy();
      this.highlight = undefined;
    }

    if (step.highlight) {
      this.showHighlight(step.highlight!);
    }

    this.handPointer.setVisible(false);

    // Steps 0 and 1 wait for user drag. Step 2 shows completion.
    if (stepIndex === 2) {
      this.time.delayedCall(500, () => {
        this.showCompleteButton();
      });
    }
  }

  private showHighlight(area: { x: number; y: number; width: number; height: number }): void {
    this.highlight = this.add.rectangle(area.x, area.y, area.width + 10, area.height + 10, 0x000000, 0);
    this.highlight.setStrokeStyle(4, COLORS.MUSTARD, 1);
    
    this.tweens.add({
      targets: this.highlight,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    if (this.currentStep === 0) {
      this.handPointer.setPosition(area.x, area.y);
      this.handPointer.setVisible(true);
      this.animateHandToBin(area.x, area.y, this.binPositions.red.x, this.binPositions.red.y);
    } else if (this.currentStep === 1) {
      this.handPointer.setPosition(area.x, area.y);
      this.handPointer.setVisible(true);
      this.animateHandToBin(area.x, area.y, this.binPositions.blue.x, this.binPositions.blue.y);
    }
  }

  private animateHandToBin(startX: number, startY: number, binX: number, binY: number): void {
    if (this.handTween) {
      this.handTween.stop();
    }
    this.handTween = this.tweens.add({
      targets: this.handPointer,
      x: { from: startX, to: binX },
      y: { from: startY, to: binY },
      duration: 1800,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private completeStepAndAdvance(): void {
    if (this.highlight) {
      this.highlight.destroy();
      this.highlight = undefined;
    }
    this.handPointer.setVisible(false);
    
    const nextStep = this.currentStep + 1;
    if (nextStep < TUTORIAL_STEPS.length) {
      this.time.delayedCall(300, () => {
        this.showStep(nextStep);
      });
    }
  }

  private showCompleteButton(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    Effects.confetti(centerX, height / 2, 40);
    AudioManager.playSound('success');

    StateManager.completeTutorial();

    const container = this.add.container(centerX, height - 140);

    const shadow = this.add.rectangle(0, 4, 260, 60, 0x000000, 0.1);
    const bg = this.add.rectangle(0, 0, 260, 60, COLORS.SAGE);
    bg.setStrokeStyle(3, 0xFFFFFF, 0.5);
    
    const label = this.add.text(0, 0, 'Start Playing!', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    container.add([shadow, bg, label]);
    container.setSize(260, 60);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
    });
    
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
    });

    container.on('pointerup', () => {
      AudioManager.playSound('click');
      InputManager.vibrate(20);
      this.time.delayedCall(100, () => {
        // Route directly to first level for immediate engagement
        this.scene.start('GameScene', { levelId: 'sort_01' });
      });
    });

    Effects.popIn(container);
  }
}
