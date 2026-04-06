import Phaser from 'phaser';
import { COLORS, colorToHex } from '@/config/colors';
import { UI, ANIMATIONS } from '@/config/game.config';

class EffectsClass {
  private scene: Phaser.Scene | null = null;
  private activeParticles: Set<Phaser.GameObjects.Shape> = new Set();
  private activeTweens: Set<Phaser.Tweens.Tween> = new Set();
  private ambientTimer: Phaser.Time.TimerEvent | null = null;

  init(scene: Phaser.Scene): void {
    this.scene = scene;
    scene.events.once('shutdown', () => this.cleanup());
  }

  cleanup(): void {
    this.activeTweens.forEach(tween => {
      tween.stop();
    });
    this.activeTweens.clear();

    this.activeParticles.forEach(particle => {
      if (particle.active) {
        this.scene?.tweens.killTweensOf(particle);
        particle.destroy();
      }
    });
    this.activeParticles.clear();

    this.scene = null;
  }

  particles(
    x: number,
    y: number,
    config: {
      color?: number;
      count?: number;
      speed?: number;
      scale?: number;
      lifespan?: number;
    } = {}
  ): void {
    if (!this.scene) return;

    const {
      color = COLORS.CORAL,
      count = 12,
      speed = 180,
      scale = 0.15,
      lifespan = 600,
    } = config;

    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.circle(x, y, 10, color, 1);
      particle.setScale(scale);
      this.activeParticles.add(particle);
      
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const velocity = speed * (0.6 + Math.random() * 0.4);
      
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * velocity,
        y: y + Math.sin(angle) * velocity,
        alpha: 0,
        scale: 0,
        duration: lifespan,
        ease: 'Quad.out',
        onComplete: () => {
          this.activeParticles.delete(particle);
          particle.destroy();
        },
      });
    }
  }

  confetti(x: number, y: number, count: number = 25): void {
    if (!this.scene) return;

    const colors = [
      COLORS.CORAL,
      COLORS.MUSTARD,
      COLORS.SAGE,
      COLORS.SKY,
      COLORS.LAVENDER,
      0xE8A0BF,
      0xF4A261,
      0x4ECDC4,
    ];

    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const isCircle = Math.random() > 0.5;
      
      let particle: Phaser.GameObjects.Shape;
      
      if (isCircle) {
        particle = this.scene.add.circle(
          x + (Math.random() - 0.5) * 80,
          y,
          6 + Math.random() * 4,
          color
        );
      } else {
        particle = this.scene.add.rectangle(
          x + (Math.random() - 0.5) * 80,
          y,
          8 + Math.random() * 6,
          8 + Math.random() * 6,
          color
        );
      }
      
      this.activeParticles.add(particle);

      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.7;
      const speed = 250 + Math.random() * 200;
      const rotation = Math.random() * Math.PI * 4;

      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Math.cos(angle) * speed,
        y: particle.y + Math.sin(angle) * speed + 300,
        rotation: rotation,
        alpha: 0,
        duration: 1200 + Math.random() * 600,
        ease: 'Quad.out',
        onComplete: () => {
          this.activeParticles.delete(particle);
          particle.destroy();
        },
      });
    }
  }

  shake(intensity: number = 6, duration: number = 80): void {
    if (!this.scene) return;

    const camera = this.scene.cameras.main;
    const originalX = camera.scrollX;
    const originalY = camera.scrollY;

    this.scene.tweens.add({
      targets: camera,
      scrollX: originalX + intensity,
      scrollY: originalY + intensity,
      duration: duration / 4,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        camera.scrollX = originalX;
        camera.scrollY = originalY;
      },
    });
  }

  popIn(target: Phaser.GameObjects.GameObject, callback?: () => void): void {
    if (!this.scene) return;

    const obj = target as unknown as Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.Alpha;
    
    const targetScale = Math.max(obj.scaleX, 0.01);
    obj.setScale(0.01);
    obj.setAlpha(0);
    
    this.scene.tweens.add({
      targets: target,
      scaleX: targetScale,
      scaleY: targetScale,
      alpha: 1,
      duration: 400,
      ease: ANIMATIONS.SPRING_EASE,
      onComplete: callback,
    });
  }

  starBurst(x: number, y: number): void {
    if (!this.scene) return;

    const colors = [COLORS.MUSTARD, COLORS.CORAL, COLORS.SAGE];
    
    for (let i = 0; i < 6; i++) {
      const star = this.scene.add.star(x, y, 5, 5, 10, colors[i % colors.length]);
      this.activeParticles.add(star);
      const angle = (Math.PI * 2 * i) / 6;
      const distance = 40 + Math.random() * 25;

      this.scene.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0,
        rotation: Math.PI * 0.5,
        duration: 500,
        ease: 'Quad.out',
        onComplete: () => {
          this.activeParticles.delete(star);
          star.destroy();
        },
      });
    }
  }

  coinPopup(x: number, y: number, amount: number): void {
    if (!this.scene) return;

    const text = this.scene.add.text(x, y, `+${amount}`, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '28px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.MUSTARD),
    }).setOrigin(0.5);
    
    text.setStroke('#FFFFFF', 3);
    text.setShadow(0, 2, '#000000', 0, true, false);

    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      scale: 1.2,
      duration: 800,
      ease: 'Back.out',
      onComplete: () => text.destroy(),
    });
  }

  scorePopup(x: number, y: number, text: string, color: number = COLORS.SAGE): void {
    if (!this.scene) return;

    const label = this.scene.add.text(x, y, text, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '24px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    label.setTint(color);
    label.setStroke('#FFFFFF', 2);

    this.scene.tweens.add({
      targets: label,
      y: y - 40,
      alpha: 0,
      duration: 600,
      ease: 'Quad.out',
      onComplete: () => label.destroy(),
    });
  }

  pulse(target: Phaser.GameObjects.GameObject, scale: number = 1.05, duration: number = 200): void {
    if (!this.scene) return;

    this.scene.tweens.add({
      targets: target,
      scaleX: scale,
      scaleY: scale,
      duration: duration / 2,
      yoyo: true,
      ease: 'Sine.out',
    });
  }

  ripple(x: number, y: number, color: number = COLORS.CORAL): void {
    if (!this.scene) return;

    const circle = this.scene.add.circle(x, y, 10, color, 0.3);
    this.activeParticles.add(circle);

    this.scene.tweens.add({
      targets: circle,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 400,
      ease: 'Quad.out',
      onComplete: () => {
        this.activeParticles.delete(circle);
        circle.destroy();
      },
    });
  }

  sparkle(x: number, y: number, count: number = 3): void {
    if (!this.scene) return;

    for (let i = 0; i < count; i++) {
      const star = this.scene.add.star(
        x + (Math.random() - 0.5) * 30,
        y + (Math.random() - 0.5) * 30,
        4,
        2,
        5,
        COLORS.MUSTARD,
        0.8
      );
      this.activeParticles.add(star);

      this.scene.tweens.add({
        targets: star,
        alpha: 0,
        scale: 0,
        rotation: Math.PI,
        duration: 400,
        delay: i * 50,
        ease: 'Quad.out',
        onComplete: () => {
          this.activeParticles.delete(star);
          star.destroy();
        },
      });
    }
  }

  bounce(target: Phaser.GameObjects.GameObject, height: number = 10): void {
    if (!this.scene) return;

    const obj = target as unknown as Phaser.GameObjects.Components.Transform;
    const originalY = obj.y;

    this.scene.tweens.add({
      targets: target,
      y: originalY - height,
      duration: 150,
      ease: 'Quad.out',
      yoyo: true,
      onComplete: () => {
        obj.y = originalY;
      },
    });
  }

  combo(x: number, y: number, count: number): void {
    if (!this.scene) return;
    
    const comboColors = [COLORS.SAGE, COLORS.SKY, COLORS.MUSTARD, COLORS.CORAL, COLORS.LAVENDER];
    const color = comboColors[Math.min(count - 1, comboColors.length - 1)];
    const scale = Math.min(1 + count * 0.15, 2);
    
    const text = this.scene.add.text(x, y, `${count}x COMBO!`, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: `${Math.round(28 * scale)}px`,
      fontStyle: 'bold',
      color: colorToHex(color),
    }).setOrigin(0.5);
    
    text.setStroke('#FFFFFF', 4);
    text.setShadow(0, 4, colorToHex(color), 0, true, false);
    text.setScale(0);
    
    this.scene.tweens.add({
      targets: text,
      scale: scale,
      duration: 300,
      ease: 'Back.out',
      onComplete: () => {
        this.scene?.tweens.add({
          targets: text,
          y: y - 80,
          alpha: 0,
          scale: scale * 1.3,
          duration: 600,
          delay: 200,
          ease: 'Quad.out',
          onComplete: () => text.destroy(),
        });
      },
    });
    
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 50, () => {
        this.particles(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 30, {
          color,
          count: 3,
          speed: 100 + count * 20,
        });
      });
    }
  }

  glow(target: Phaser.GameObjects.Shape, color: number = COLORS.MUSTARD, intensity: number = 1): Phaser.GameObjects.Shape | null {
    if (!this.scene) return null;
    
    const glow = this.scene.add.circle(
      target.x,
      target.y,
      (target.width / 2) * 1.5,
      color,
      0.3 * intensity
    );
    
    this.activeParticles.add(glow);
    
    const tween = this.scene.tweens.add({
      targets: glow,
      alpha: { from: 0.4 * intensity, to: 0.1 },
      scale: { from: 1, to: 1.3 },
      duration: 400,
      yoyo: true,
      repeat: -1,
    });
    
    this.activeTweens.add(tween);
    
    // Return object with cleanup method
    const glowObj = glow;
    const cleanup = () => {
      this.activeTweens.delete(tween);
      this.activeParticles.delete(glowObj);
      this.scene?.tweens.killTweensOf(glowObj);
      glowObj.destroy();
    };
    
    // Attach cleanup method to glow object
    (glowObj as unknown as { cleanup: () => void }).cleanup = cleanup;
    
    return glowObj;
  }

  stopGlow(glow: Phaser.GameObjects.Shape | null): void {
    if (!glow) return;
    const cleanupFn = (glow as unknown as { cleanup?: () => void }).cleanup;
    if (cleanupFn) {
      cleanupFn();
    }
  }

  trail(x: number, y: number, color: number): void {
    if (!this.scene) return;
    
    const trail = this.scene.add.circle(x, y, 8, color, 0.6);
    this.activeParticles.add(trail);
    
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 0.3,
      duration: 200,
      ease: 'Quad.out',
      onComplete: () => {
        this.activeParticles.delete(trail);
        trail.destroy();
      },
    });
  }

  perfect(x: number, y: number): void {
    if (!this.scene) return;
    
    const text = this.scene.add.text(x, y, 'PERFECT!', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '48px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.MUSTARD),
    }).setOrigin(0.5);
    
    text.setStroke('#FFFFFF', 6);
    text.setShadow(0, 6, colorToHex(COLORS.MUSTARD_DARK), 0, true, false);
    text.setScale(0);
    
    this.scene.tweens.add({
      targets: text,
      scale: 1,
      duration: 500,
      ease: 'Back.out',
      onComplete: () => {
        this.scene?.tweens.add({
          targets: text,
          y: y - 50,
          alpha: 0,
          duration: 800,
          ease: 'Quad.out',
          onComplete: () => text.destroy(),
        });
      },
    });
    
    this.confetti(x, y, 40);
    this.shake(10, 150);
  }

  timeWarning(scene: Phaser.Scene, x: number, y: number): void {
    const flash = scene.add.rectangle(x, y, scene.scale.width, scene.scale.height, COLORS.CORAL, 0.1);
    
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });
  }

  celebrate(x: number, y: number, intensity: number = 1): void {
    if (!this.scene) return;
    
    const count = Math.round(20 * intensity);
    this.confetti(x, y, count);
    this.shake(8 * intensity, 100);
    
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 150, () => {
        this.particles(x + (Math.random() - 0.5) * 100, y + (Math.random() - 0.5) * 50, {
          count: 10,
          speed: 150 + intensity * 50,
        });
      });
    }
  }

  snapFeedback(x: number, y: number, color: number, success: boolean = true): void {
    if (!this.scene) return;
    
    if (success) {
      this.ripple(x, y, color);
      this.sparkle(x, y, 2);
    } else {
      this.shake(4, 80);
    }
  }

  startAmbient(scene: Phaser.Scene): void {
    this.ambientTimer = scene.time.addEvent({
      delay: 2000,
      callback: () => {
        if (Math.random() > 0.7) {
          const x = Math.random() * scene.scale.width;
          const y = Math.random() * scene.scale.height;
          this.sparkle(x, y, 1);
        }
      },
      loop: true,
    });
  }

  stopAmbient(): void {
    if (this.ambientTimer) {
      this.ambientTimer.destroy();
      this.ambientTimer = null;
    }
  }
}

export const Effects = new EffectsClass();
