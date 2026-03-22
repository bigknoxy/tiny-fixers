import Phaser from 'phaser';
import { COLORS, colorToHex } from '@/config/colors';
import { UI } from '@/config/game.config';
import { PuzzleType } from '@/config/types';
import { PUZZLE_TUTORIALS } from '@/data/puzzleTutorials';
import { AudioManager } from '@/systems/AudioManager';
import { Effects } from '@/systems/Effects';

export class TutorialModal {
  static show(
    scene: Phaser.Scene,
    puzzleType: PuzzleType,
    onComplete: () => void
  ): void {
    const { width, height } = scene.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    const tutorial = PUZZLE_TUTORIALS[puzzleType];

    const overlay = scene.add.rectangle(centerX, centerY, width, height, 0x000000, 0.5);
    overlay.setDepth(1000);

    const panel = scene.add.container(centerX, centerY);
    panel.setDepth(1001);

    const panelBg = scene.add.rectangle(0, 0, 300, 280, COLORS.WARM_WHITE);
    panelBg.setStrokeStyle(3, COLORS.CORAL, 1);

    const skipBtn = scene.add.container(130, -120);
    const skipBg = scene.add.circle(0, 0, 18, COLORS.SOFT_GRAY, 0.3);
    const skipIcon = scene.add.text(0, 0, '✕', {
      fontSize: '16px',
      color: colorToHex(COLORS.GRAPHITE),
    }).setOrigin(0.5);
    skipBtn.add([skipBg, skipIcon]);
    skipBtn.setInteractive(
      new Phaser.Geom.Circle(0, 0, 18),
      Phaser.Geom.Circle.Contains
    );

    skipBtn.on('pointerover', () => {
      skipBg.setFillStyle(COLORS.SOFT_GRAY, 0.5);
    });
    skipBtn.on('pointerout', () => {
      skipBg.setFillStyle(COLORS.SOFT_GRAY, 0.3);
    });
    skipBtn.on('pointerup', () => {
      AudioManager.playSound('click');
      destroy();
      onComplete();
    });

    const emoji = scene.add.text(0, -70, tutorial.emoji, {
      fontSize: '48px',
    }).setOrigin(0.5);

    const title = scene.add.text(0, -20, tutorial.title, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '28px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CORAL),
    }).setOrigin(0.5);

    const description = scene.add.text(0, 30, tutorial.description, {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '16px',
      color: colorToHex(COLORS.CHARCOAL),
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);

    const gotItBtn = scene.add.container(0, 100);
    const btnShadow = scene.add.rectangle(0, 3, 180, 48, 0x000000, 0.1);
    const btnBg = scene.add.rectangle(0, 0, 180, 48, COLORS.CORAL);
    btnBg.setStrokeStyle(2, 0xFFFFFF, 0.5);
    const btnLabel = scene.add.text(0, 0, 'Got it!', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    gotItBtn.add([btnShadow, btnBg, btnLabel]);
    gotItBtn.setSize(180, 48);
    gotItBtn.setInteractive({ useHandCursor: true });

    gotItBtn.on('pointerover', () => {
      scene.tweens.add({ targets: gotItBtn, scale: 1.03, duration: 100 });
    });
    gotItBtn.on('pointerout', () => {
      scene.tweens.add({ targets: gotItBtn, scale: 1, duration: 100 });
    });
    gotItBtn.on('pointerup', () => {
      AudioManager.playSound('click');
      destroy();
      onComplete();
    });

    panel.add([panelBg, skipBtn, emoji, title, description, gotItBtn]);

    Effects.popIn(panel);

    function destroy(): void {
      scene.tweens.add({
        targets: [overlay, panel],
        alpha: 0,
        scale: 0.8,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          overlay.destroy();
          panel.destroy();
        },
      });
    }
  }
}
