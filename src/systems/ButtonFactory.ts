import Phaser from 'phaser';
import { COLORS } from '@/config/colors';
import { ANIMATIONS, UI } from '@/config/game.config';
import { AudioManager } from '@/systems/AudioManager';
import { InputManager } from '@/systems/InputManager';

export interface ButtonConfig {
  width?: number;
  height?: number;
  color?: number;
  fontSize?: string;
  isPrimary?: boolean;
  animateIn?: boolean;
  delay?: number;
}

export class ButtonFactory {
  static create(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    callback: () => void,
    config: ButtonConfig = {}
  ): Phaser.GameObjects.Container {
    const {
      width = 200,
      height = 56,
      color = COLORS.CORAL,
      fontSize = '20px',
      isPrimary = false,
      animateIn = false,
      delay = 0,
    } = config;

    const container = scene.add.container(x, y);
    
    const shadow = scene.add.rectangle(0, 4, width, height, 0x000000, 0.1);
    shadow.setStrokeStyle(0);
    
    const btn = scene.add.rectangle(0, 0, width, height, color, 1);
    btn.setStrokeStyle(3, 0xFFFFFF, 0.5);
    
    const label = scene.add.text(0, 0, text, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: isPrimary ? '24px' : fontSize,
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    
    container.add([shadow, btn, label]);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });
    
    container.on('pointerover', () => {
      scene.tweens.add({
        targets: container,
        scale: 1.03,
        duration: 150,
        ease: ANIMATIONS.SMOOTH_EASE,
      });
    });
    
    container.on('pointerout', () => {
      scene.tweens.add({
        targets: container,
        scale: 1,
        duration: 150,
        ease: ANIMATIONS.SMOOTH_EASE,
      });
    });
    
    container.on('pointerdown', () => {
      scene.tweens.add({
        targets: container,
        scale: 0.95,
        duration: 50,
      });
      container.y += 2;
    });
    
    container.on('pointerup', () => {
      scene.tweens.add({
        targets: container,
        scale: 1,
        duration: 100,
        ease: ANIMATIONS.BOUNCE_EASE,
        onComplete: () => {
          AudioManager.playSound('click');
          InputManager.vibrate(20);
          callback();
        },
      });
      container.y = y;
    });
    
    if (animateIn) {
      container.setAlpha(0);
      container.y += 30;
      scene.tweens.add({
        targets: container,
        alpha: 1,
        y: y,
        duration: 400,
        ease: ANIMATIONS.SMOOTH_EASE,
        delay: delay,
      });
    }
    
    return container;
  }

  static createBackButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);

    const bg = scene.add.circle(0, 0, 24, COLORS.WARM_WHITE, 0.9);
    bg.setStrokeStyle(2, 0xFFFFFF, 1);

    const icon = scene.add.text(0, 0, '←', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '24px',
      color: '#3D3D3D',
    }).setOrigin(0.5);

    container.add([bg, icon]);
    container.setSize(48, 48);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      scene.tweens.add({ targets: container, scale: 1.1, duration: 100 });
    });
    
    container.on('pointerout', () => {
      scene.tweens.add({ targets: container, scale: 1, duration: 100 });
    });

    container.on('pointerup', () => {
      AudioManager.playSound('click');
      InputManager.vibrate(15);
      callback();
    });

    return container;
  }

  static createIconButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    iconText: string,
    callback: () => void,
    config: { size?: number; bgColor?: number } = {}
  ): Phaser.GameObjects.Container {
    const { size = 24, bgColor = COLORS.WARM_WHITE } = config;
    
    const container = scene.add.container(x, y);

    const bg = scene.add.circle(0, 0, size, bgColor, 0.9);
    bg.setStrokeStyle(2, 0xFFFFFF, 1);

    const icon = scene.add.text(0, 0, iconText, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: `${size * 0.75}px`,
      color: '#3D3D3D',
    }).setOrigin(0.5);

    container.add([bg, icon]);
    container.setSize(size * 2, size * 2);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      scene.tweens.add({ targets: container, scale: 1.1, duration: 100 });
    });
    
    container.on('pointerout', () => {
      scene.tweens.add({ targets: container, scale: 1, duration: 100 });
    });

    container.on('pointerup', () => {
      AudioManager.playSound('click');
      InputManager.vibrate(15);
      callback();
    });

    return container;
  }
}
