import Phaser from 'phaser';
import { COLORS } from '@/config/colors';
import { UI } from '@/config/game.config';
import { StateManager } from '@/core/StateManager';
import { AudioManager } from '@/systems/AudioManager';
import { InputManager } from '@/systems/InputManager';
import { APP_VERSION } from '@/main';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const safeTop = UI.SAFE_AREA_TOP + 20;

    this.add.rectangle(centerX, height / 2, width, height, COLORS.PRIMARY);

    this.createHeader(centerX, safeTop);
    this.createSettingsOptions(centerX, safeTop + 100);
    this.createResetButton(centerX, height - 180);
    this.createVersionDisplay(centerX, height - 50);
  }

  private createHeader(x: number, y: number): void {
    const container = this.add.container(x, y);

    const backButton = this.createBackButton(-150, 0);

    const title = this.add.text(0, 0, 'Settings', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    container.add([backButton, title]);
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

  private createSettingsOptions(x: number, y: number): void {
    const spacing = 80;

    this.createToggleOption(x, y, 'Music', !AudioManager.muted, (enabled) => {
      AudioManager.setMuted(!enabled);
    });

    this.createToggleOption(x, y + spacing, 'Sound Effects', AudioManager.sfxVolume > 0, (enabled) => {
      AudioManager.setSfxVolume(enabled ? 1 : 0);
    });

    this.createToggleOption(x, y + spacing * 2, 'Haptics', StateManager.state.settings.hapticsEnabled, (enabled) => {
      InputManager.setHapticsEnabled(enabled);
      StateManager.updateSettings({ hapticsEnabled: enabled });
    });

    this.createSliderOption(x, y + spacing * 3, 'Music Volume', AudioManager.musicVolume, (value) => {
      AudioManager.setMusicVolume(value);
    });

    this.createSliderOption(x, y + spacing * 4, 'SFX Volume', AudioManager.sfxVolume, (value) => {
      AudioManager.setSfxVolume(value);
    });
  }

  private createToggleOption(
    x: number,
    y: number,
    label: string,
    isOn: boolean,
    onChange: (enabled: boolean) => void
  ): void {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 320, 60, COLORS.WHITE, 0.1);
    bg.setStrokeStyle(1, COLORS.WHITE, 0.2);

    const labelText = this.add.text(-130, 0, label, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
    }).setOrigin(0, 0.5);

    const toggle = this.createToggle(100, 0, isOn, onChange);

    container.add([bg, labelText, toggle]);
  }

  private createToggle(
    x: number,
    y: number,
    isOn: boolean,
    onChange: (enabled: boolean) => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    let currentState = isOn;

    const track = this.add.rectangle(0, 0, 50, 26, currentState ? COLORS.SUCCESS : COLORS.GRAY, 0.8);
    track.setStrokeStyle(2, COLORS.WHITE, 0.3);

    const knob = this.add.circle(currentState ? 12 : -12, 0, 10, COLORS.WHITE);

    container.add([track, knob]);
    container.setSize(50, 26);
    container.setInteractive({ useHandCursor: true });

    const updateToggle = (state: boolean) => {
      currentState = state;
      track.setFillStyle(state ? COLORS.SUCCESS : COLORS.GRAY, 0.8);
      this.tweens.add({
        targets: knob,
        x: state ? 12 : -12,
        duration: 150,
        ease: 'Back.out',
      });
    };

    container.on('pointerup', () => {
      AudioManager.playSound('click');
      InputManager.vibrate(15);
      updateToggle(!currentState);
      onChange(currentState);
    });

    return container;
  }

  private createSliderOption(
    x: number,
    y: number,
    label: string,
    value: number,
    onChange: (value: number) => void
  ): void {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 320, 70, COLORS.WHITE, 0.1);
    bg.setStrokeStyle(1, COLORS.WHITE, 0.2);

    const labelText = this.add.text(-130, -15, label, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
    }).setOrigin(0, 0.5);

    const slider = this.createSlider(0, 15, value, onChange);

    container.add([bg, labelText, slider]);
  }

  private createSlider(
    x: number,
    y: number,
    value: number,
    onChange: (value: number) => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const sliderWidth = 200;

    const track = this.add.rectangle(0, 0, sliderWidth, 8, COLORS.GRAY, 0.5);

    const fill = this.add.rectangle(-sliderWidth / 2, 0, sliderWidth * value, 8, COLORS.SUCCESS);
    fill.setOrigin(0, 0.5);

    const knob = this.add.circle(-sliderWidth / 2 + sliderWidth * value, 0, 14, COLORS.WHITE);
    knob.setStrokeStyle(2, COLORS.SUCCESS, 1);

    container.add([track, fill, knob]);
    container.setSize(sliderWidth, 30);
    container.setInteractive({ useHandCursor: true, draggable: true });

    this.input.setDraggable(container);

    container.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number) => {
      const clampedX = Phaser.Math.Clamp(dragX, -sliderWidth / 2, sliderWidth / 2);
      const newValue = (clampedX + sliderWidth / 2) / sliderWidth;

      knob.x = clampedX;
      fill.width = sliderWidth * newValue;

      onChange(newValue);
    });

    return container;
  }

  private createResetButton(x: number, y: number): void {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 200, 50, COLORS.ERROR, 0.8);
    bg.setStrokeStyle(2, COLORS.WHITE, 0.5);

    const label = this.add.text(0, 0, 'Reset Game', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(200, 50);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerup', () => {
      this.showResetConfirmation();
    });
  }

  private showResetConfirmation(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    const overlay = this.add.rectangle(centerX, height / 2, width, height, 0x000000, 0.7);

    const panel = this.add.container(centerX, height / 2);

    const bg = this.add.rectangle(0, 0, 280, 180, COLORS.WHITE);
    bg.setStrokeStyle(3, COLORS.ERROR, 1);

    const title = this.add.text(0, -60, 'Reset Game?', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#333333',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const message = this.add.text(0, -20, 'This will delete all progress.', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#666666',
    }).setOrigin(0.5);

    const confirmBtn = this.add.text(-60, 40, 'Reset', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#' + COLORS.ERROR.toString(16).padStart(6, '0'),
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5);

    const cancelBtn = this.add.text(60, 40, 'Cancel', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#' + COLORS.GRAY.toString(16).padStart(6, '0'),
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5);

    panel.add([bg, title, message, confirmBtn, cancelBtn]);

    confirmBtn.setInteractive({ useHandCursor: true });
    confirmBtn.on('pointerup', () => {
      StateManager.reset();
      AudioManager.playSound('click');
      this.scene.start('HomeScene');
    });

    cancelBtn.setInteractive({ useHandCursor: true });
    cancelBtn.on('pointerup', () => {
      overlay.destroy();
      panel.destroy();
    });
  }

  private createVersionDisplay(x: number, y: number): void {
    this.add.text(x, y, `v${APP_VERSION}`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#999999',
    }).setOrigin(0.5);
  }
}