import { DailyModifier, DailyModifierType, PuzzleType } from './types';

// ============================================
// MODIFIER DEFINITIONS
// ============================================

export const DAILY_MODIFIERS: Record<DailyModifierType, DailyModifier> = {
  [DailyModifierType.SPEED_ROUND]: {
    type: DailyModifierType.SPEED_ROUND,
    name: 'Speed Round',
    description: '60% of normal time',
    icon: '⚡',
    timeMultiplier: 0.6,
    coinMultiplier: 1.1,
  },
  [DailyModifierType.PRECISION_MODE]: {
    type: DailyModifierType.PRECISION_MODE,
    name: 'Precision Mode',
    description: 'No mistakes allowed!',
    icon: '🎯',
    allowedMistakes: 0,
    coinMultiplier: 1.25,
  },
  [DailyModifierType.BONUS_COINS]: {
    type: DailyModifierType.BONUS_COINS,
    name: 'Bonus Coins',
    description: '150% coin reward',
    icon: '💰',
    coinMultiplier: 1.5,
  },
};

// ============================================
// DIFFICULTY SCALING
// ============================================

/** Get difficulty based on day of week (1 = Monday, 0 = Sunday) */
export function getDifficultyForDay(dayOfWeek: number): number {
  // Difficulty scales with day: Mon=1, Tue=2, ... Sat=5, Sun=5
  if (dayOfWeek === 0) return 5; // Sunday - hardest
  if (dayOfWeek === 6) return 5; // Saturday - hardest
  return dayOfWeek;
}

/** Base rewards by difficulty */
export const DIFFICULTY_BASE_REWARDS: Record<number, number> = {
  1: 15,
  2: 20,
  3: 25,
  4: 35,
  5: 50,
};

// ============================================
// REWARD CALCULATIONS
// ============================================

/** Calculate streak bonus based on current streak */
export function calculateStreakBonus(streak: number): number {
  if (streak <= 0) return 0;
  if (streak <= 6) return streak * 5;
  if (streak <= 13) return 50 + (streak - 6) * 10;
  if (streak <= 29) return 120 + (streak - 13) * 15;
  return 370 + (streak - 29) * 20;
}

/** Calculate modifier bonus */
export function calculateModifierBonus(modifiers: DailyModifier[]): number {
  let multiplier = 1;
  for (const modifier of modifiers) {
    if (modifier.coinMultiplier) {
      multiplier *= modifier.coinMultiplier;
    }
  }
  return multiplier;
}

/** Get base coins for difficulty */
export function getBaseCoins(difficulty: number): number {
  return DIFFICULTY_BASE_REWARDS[difficulty] ?? DIFFICULTY_BASE_REWARDS[1];
}

// ============================================
// PUZZLE TYPE ROTATION
// ============================================

/** Generate a seed from a date for deterministic random values */
export function getDateSeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

/** Get puzzle type for a given date (handles Sunday randomness) */
export function getDailyPuzzleType(date: Date): PuzzleType {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) {
    const dateSeed = getDateSeed(date);
    return [PuzzleType.SORT, PuzzleType.UNTANGLE, PuzzleType.PACK][dateSeed % 3];
  }
  return getPuzzleTypeForDay(dayOfWeek);
}

/** Day of week to puzzle type mapping */
export function getPuzzleTypeForDay(dayOfWeek: number): PuzzleType {
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const types: PuzzleType[] = [
    PuzzleType.SORT,    // Sunday - random (handled separately)
    PuzzleType.SORT,    // Monday
    PuzzleType.UNTANGLE, // Tuesday
    PuzzleType.PACK,    // Wednesday
    PuzzleType.SORT,    // Thursday
    PuzzleType.UNTANGLE, // Friday
    PuzzleType.PACK,    // Saturday
  ];
  return types[dayOfWeek];
}

/** Get modifiers for a specific day */
export function getModifiersForDay(dayOfWeek: number, dateSeed: number): DailyModifier[] {
  const modifiers: DailyModifier[] = [];

  if (dayOfWeek === 0) {
    // Sunday - two random modifiers
    const modTypes = Object.values(DailyModifierType);
    const first = modTypes[dateSeed % modTypes.length];
    const second = modTypes[(dateSeed + 1) % modTypes.length];
    if (first !== second) {
      modifiers.push(DAILY_MODIFIERS[first]);
      modifiers.push(DAILY_MODIFIERS[second]);
    } else {
      modifiers.push(DAILY_MODIFIERS[first]);
      modifiers.push(DAILY_MODIFIERS[DailyModifierType.BONUS_COINS]);
    }
  } else if (dayOfWeek === 1) {
    // Monday - Speed Round
    modifiers.push(DAILY_MODIFIERS[DailyModifierType.SPEED_ROUND]);
  } else if (dayOfWeek === 2) {
    // Tuesday - Precision Mode
    modifiers.push(DAILY_MODIFIERS[DailyModifierType.PRECISION_MODE]);
  } else if (dayOfWeek === 3) {
    // Wednesday - Bonus Coins
    modifiers.push(DAILY_MODIFIERS[DailyModifierType.BONUS_COINS]);
  } else if (dayOfWeek === 4) {
    // Thursday - Speed + Bonus
    modifiers.push(DAILY_MODIFIERS[DailyModifierType.SPEED_ROUND]);
    modifiers.push(DAILY_MODIFIERS[DailyModifierType.BONUS_COINS]);
  } else if (dayOfWeek === 5) {
    // Friday - Precision + Bonus
    modifiers.push(DAILY_MODIFIERS[DailyModifierType.PRECISION_MODE]);
    modifiers.push(DAILY_MODIFIERS[DailyModifierType.BONUS_COINS]);
  } else {
    // Saturday - random from pool
    const pool = [
      DailyModifierType.SPEED_ROUND,
      DailyModifierType.PRECISION_MODE,
      DailyModifierType.BONUS_COINS,
    ];
    const selected = pool[dateSeed % pool.length];
    modifiers.push(DAILY_MODIFIERS[selected]);
  }

  return modifiers;
}

/** Get effective time limit with modifier applied */
export function getEffectiveTimeLimit(baseTime: number, modifiers: DailyModifier[]): number {
  let multiplier = 1;
  for (const modifier of modifiers) {
    if (modifier.timeMultiplier) {
      multiplier = Math.min(multiplier, modifier.timeMultiplier);
    }
  }
  return Math.floor(baseTime * multiplier);
}
