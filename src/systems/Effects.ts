import Phaser from 'phaser';
import { COLORS } from '@/config/colors';
import { ANIMATIONS } from '@/config/game.config';

class EffectsClass {
  private scene: Phaser.Scene | null = null;
  private activeParticles: Set<Phaser.GameObjects.Shape> = new Set();

  init(scene: Phaser.Scene): void {
    this.scene = scene;
    scene.events.once('shutdown', () => this.cleanup());
  }

  cleanup(): void {
    this.activeParticles.forEach(particle => {
      if (particle.active) {
        this.scene?.tweens.killTweensOf(particle);
        particle.destroy();
      }
    });
    this.activeParticles.clear();
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

    const obj = target as unknown as Phaser.GameObjects.Components.Transform;
    obj.setScale(0);
    
    this.scene.tweens.add({
      targets: target,
      scaleX: 1,
      scaleY: 1,
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
      fontFamily: 'Fredoka',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#F4A261',
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
      fontFamily: 'Fredoka',
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
}

export const Effects = new EffectsClass();
