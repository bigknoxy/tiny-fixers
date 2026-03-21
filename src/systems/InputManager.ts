import Phaser from 'phaser';

class InputManagerClass {
  private scene: Phaser.Scene | null = null;
  private _enabled: boolean = true;
  private hapticsEnabled: boolean = true;

  get enabled(): boolean {
    return this._enabled;
  }

  init(scene: Phaser.Scene): void {
    this.scene = scene;
    
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tiny_fixers_haptics');
      if (saved) {
        try {
          this.hapticsEnabled = JSON.parse(saved).enabled ?? true;
        } catch {
          this.hapticsEnabled = true;
        }
      }
    }
  }

  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
  }

  setHapticsEnabled(enabled: boolean): void {
    this.hapticsEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tiny_fixers_haptics', JSON.stringify({ enabled }));
    }
  }

  getPointerPosition(): Phaser.Math.Vector2 {
    if (!this.scene) {
      return new Phaser.Math.Vector2(0, 0);
    }
    const pointer = this.scene.input.activePointer;
    return new Phaser.Math.Vector2(pointer.x, pointer.y);
  }

  isPointerDown(): boolean {
    if (!this.scene) return false;
    return this.scene.input.activePointer.isDown;
  }

  vibrate(duration: number = 20): void {
    if (!this.hapticsEnabled || typeof navigator === 'undefined') return;
    
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }

  vibratePattern(pattern: number[]): void {
    if (!this.hapticsEnabled || typeof navigator === 'undefined') return;
    
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  onPointerDown(callback: (pointer: Phaser.Input.Pointer) => void): void {
    if (this.scene) {
      this.scene.input.on('pointerdown', callback);
    }
  }

  onPointerMove(callback: (pointer: Phaser.Input.Pointer) => void): void {
    if (this.scene) {
      this.scene.input.on('pointermove', callback);
    }
  }

  onPointerUp(callback: (pointer: Phaser.Input.Pointer) => void): void {
    if (this.scene) {
      this.scene.input.on('pointerup', callback);
    }
  }

  addDraggable(
    gameObject: Phaser.GameObjects.GameObject,
    onDragStart?: () => void,
    onDrag?: (x: number, y: number) => void,
    onDragEnd?: () => void
  ): void {
    if (!this.scene) return;
    
    this.scene.input.setDraggable(gameObject as Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform);
    
    if (onDragStart) {
      gameObject.on('dragstart', onDragStart);
    }
    if (onDrag) {
      gameObject.on('drag', (_pointer: Phaser.Input.Pointer, x: number, y: number) => onDrag(x, y));
    }
    if (onDragEnd) {
      gameObject.on('dragend', onDragEnd);
    }
  }
}

export const InputManager = new InputManagerClass();