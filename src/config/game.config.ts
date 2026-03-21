import Phaser from 'phaser';

export const GAME_CONFIG = {
  width: 390,
  height: 844,
  minWidth: 320,
  maxWidth: 480,
  backgroundColor: '#FDF8F3',
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
  },
  input: {
    activePointers: 3,
    touch: {
      capture: true,
    },
  },
};

export const STORAGE_KEY = 'tiny_fixers_save';

export const UI = {
  SAFE_AREA_TOP: 44,
  SAFE_AREA_BOTTOM: 34,
  BUTTON_MIN_HEIGHT: 56,
  BUTTON_MIN_WIDTH: 56,
  FONT_SIZE_SMALL: 14,
  FONT_SIZE_NORMAL: 16,
  FONT_SIZE_LARGE: 24,
  FONT_SIZE_TITLE: 32,
  FONT_FAMILY_DISPLAY: 'Fredoka',
  FONT_FAMILY_BODY: 'Nunito',
};

export const GAME = {
  LEVEL_TIME_LIMIT: 60,
  STAR_THRESHOLDS: {
    one: 0.3,
    two: 0.6,
    three: 0.9,
  },
  BASE_COIN_REWARD: 10,
  STAR_BONUS: 5,
};

export const HAPTIC_DURATION = {
  LIGHT: 10,
  MEDIUM: 20,
  HEAVY: 40,
};

export const ANIMATIONS = {
  BOUNCE_EASE: 'Back.out',
  SMOOTH_EASE: 'Cubic.out',
  SPRING_EASE: 'Elastic.out',
  DEFAULT_DURATION: 300,
  FAST_DURATION: 150,
  SLOW_DURATION: 500,
};