import Phaser from 'phaser';
import { LevelData, ScoreResult, SortConfig, UntangleConfig, PackConfig, MaterialType } from '@/config/types';
import { COLORS } from '@/config/colors';
import { GAME } from '@/config/game.config';
import { AudioManager } from '@/systems/AudioManager';
import { InputManager } from '@/systems/InputManager';
import { Effects } from '@/systems/Effects';

export abstract class BasePuzzle {
  protected scene: Phaser.Scene;
  protected level: LevelData;
  protected container: Phaser.GameObjects.Container;
  protected startTime: number = 0;
  protected endTime: number = 0;
  protected isComplete: boolean = false;
  protected wrongMoves: number = 0;
  protected totalMoves: number = 0;
  protected comboCount: number = 0;
  protected lastComboTime: number = 0;
  protected readonly COMBO_TIMEOUT: number = 1500;

  constructor(scene: Phaser.Scene, level: LevelData) {
    this.scene = scene;
    this.level = level;
    this.container = scene.add.container(0, 0);
  }

  abstract init(): void;
  abstract update(delta: number): void;
  abstract checkWin(): boolean;
  abstract destroy(): void;
  abstract getProgress(): { placed: number; total: number };

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  getWrongMoves(): number {
    return this.wrongMoves;
  }

  getElapsedTime(): number {
    if (this.endTime > 0) {
      return this.endTime - this.startTime;
    }
    return Date.now() - this.startTime;
  }

  startTimer(): void {
    this.startTime = Date.now();
  }

  stopTimer(): void {
    this.endTime = Date.now();
  }

  calculateStars(): number {
    const config = this.level.config as SortConfig | UntangleConfig | PackConfig;
    const timeLimit = config.timeLimit;
    const elapsed = this.getElapsedTime() / 1000;
    const timeRatio = Math.max(0, 1 - elapsed / timeLimit);
    const accuracyRatio = this.totalMoves > 0 ? 1 - (this.wrongMoves / this.totalMoves) : 1;
    
    const score = (timeRatio * 0.6 + accuracyRatio * 0.4);

    if (score >= GAME.STAR_THRESHOLDS.three) return 3;
    if (score >= GAME.STAR_THRESHOLDS.two) return 2;
    if (score >= GAME.STAR_THRESHOLDS.one) return 1;
    return 0;
  }

  getScore(): ScoreResult {
    const stars = this.calculateStars();
    const baseCoins = this.level.rewards.coins;
    const starBonus = Math.max(0, (stars - 1) * 5);
    
    const materials = this.level.rewards.materials?.filter(m => m) || [];
    
    return {
      stars,
      time: this.getElapsedTime(),
      accuracy: this.totalMoves > 0 ? 1 - (this.wrongMoves / this.totalMoves) : 1,
      coins: baseCoins + starBonus,
      materials: materials as { type: MaterialType; amount: number }[],
    };
  }

  protected recordCombo(x: number, y: number): void {
    const now = Date.now();
    
    if (now - this.lastComboTime < this.COMBO_TIMEOUT) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    
    this.lastComboTime = now;
    
    if (this.comboCount >= 2) {
      Effects.combo(x, y, this.comboCount);
      AudioManager.playSound('combo');
      InputManager.vibrate(20 + this.comboCount * 5);
    }
  }

  protected resetCombo(): void {
    this.comboCount = 0;
    this.lastComboTime = 0;
  }

  protected createDraggableObject(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    id: string
  ): Phaser.GameObjects.Rectangle {
    const obj = this.scene.add.rectangle(x, y, width, height, color);
    obj.setStrokeStyle(2, COLORS.WHITE, 0.5);
    obj.setData('id', id);
    obj.setData('originalX', x);
    obj.setData('originalY', y);
    
    obj.setInteractive({ useHandCursor: true, draggable: true });
    
    this.scene.input.setDraggable(obj);
    
    obj.on('dragstart', () => {
      this.scene.children.bringToTop(obj);
      this.scene.tweens.add({
        targets: obj,
        scale: 1.1,
        duration: 100,
      });
      InputManager.vibrate(10);
      AudioManager.playSound('pickup');
      this.totalMoves++;
    });

    obj.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      obj.x = dragX;
      obj.y = dragY;
      Effects.trail(dragX, dragY, (obj as Phaser.GameObjects.Rectangle).fillColor);
    });

    obj.on('dragend', () => {
      this.scene.tweens.add({
        targets: obj,
        scale: 1,
        duration: 100,
      });
    });

    return obj;
  }

  protected createDraggableCircle(
    x: number,
    y: number,
    radius: number,
    color: number,
    id: string
  ): Phaser.GameObjects.Arc {
    const obj = this.scene.add.circle(x, y, radius, color);
    obj.setStrokeStyle(2, COLORS.WHITE, 0.5);
    obj.setData('id', id);
    obj.setData('originalX', x);
    obj.setData('originalY', y);
    
    obj.setInteractive({ useHandCursor: true, draggable: true });
    this.scene.input.setDraggable(obj);
    
    obj.on('dragstart', () => {
      this.scene.children.bringToTop(obj);
      this.scene.tweens.add({
        targets: obj,
        scale: 1.1,
        duration: 100,
      });
      InputManager.vibrate(10);
      AudioManager.playSound('pickup');
      this.totalMoves++;
    });

    obj.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      obj.x = dragX;
      obj.y = dragY;
      Effects.trail(dragX, dragY, (obj as Phaser.GameObjects.Arc).fillColor);
    });

    obj.on('dragend', () => {
      this.scene.tweens.add({
        targets: obj,
        scale: 1,
        duration: 100,
      });
    });

    return obj;
  }
}