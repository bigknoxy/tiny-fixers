import { PuzzleType, LevelData, SortConfig, UntangleConfig, PackConfig, SortBin, SortItem, UntangleObject, PackItem, Rectangle } from '@/config/types';
import { getDifficultyForDay, getDailyPuzzleType, getModifiersForDay, getEffectiveTimeLimit } from '@/config/daily';

/** Seeded random number generator for deterministic results */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /** Generate next random number between 0 and 1 */
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  /** Generate random integer between min and max (inclusive) */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Pick random element from array */
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  /** Shuffle array in place */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

/** Generate level data for daily challenge */
export function generateDailyLevel(date?: Date): LevelData {
  const today = date ?? new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const dayOfWeek = today.getDay();
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];

  const puzzleType = getDailyPuzzleType(today);

  const modifiers = getModifiersForDay(dayOfWeek, dateSeed);
  const difficulty = getDifficultyForDay(dayOfWeek);

  const baseTimeLimit = 60 + (difficulty - 1) * 15;
  const timeLimit = getEffectiveTimeLimit(baseTimeLimit, modifiers);

  const id = `daily_${today.toISOString().split('T')[0]}`;

  let config: SortConfig | UntangleConfig | PackConfig;

  switch (puzzleType) {
    case PuzzleType.SORT:
      config = generateSortConfig(dateSeed, difficulty);
      break;
    case PuzzleType.UNTANGLE:
      config = generateUntangleConfig(dateSeed, difficulty);
      break;
    case PuzzleType.PACK:
      config = generatePackConfig(dateSeed, difficulty);
      break;
    default:
      config = generateSortConfig(dateSeed, difficulty);
  }

  // Override time limit with daily-adjusted limit
  (config as SortConfig | UntangleConfig | PackConfig).timeLimit = timeLimit;

  return {
    id,
    name: `Daily: ${dayName}`,
    description: `Today's ${puzzleType} challenge`,
    type: puzzleType,
    difficulty,
    config,
    rewards: {
      coins: 15 + difficulty * 10,
    },
  };
}

/** Generate sort puzzle config */
function generateSortConfig(seed: number, difficulty: number): SortConfig {
  const rng = new SeededRandom(seed);

  const itemTypes = ['red', 'blue', 'green', 'yellow'];
  const numTypes = Math.min(2 + Math.floor(difficulty / 2), 4);
  const numItems = 4 + difficulty * 2;

  const types = rng.shuffle([...itemTypes]).slice(0, numTypes);
  const colors: Record<string, number> = {
    red: 0xE74C3C,
    blue: 0x3498DB,
    green: 0x2ECC71,
    yellow: 0xF1C40F,
    purple: 0x9B59B6,
    orange: 0xE67E22,
  };

  const bins: SortBin[] = types.map((type, i) => ({
    id: `bin_${i}`,
    color: colors[type],
    position: { x: 100 + i * 70, y: 150 },
    size: { x: 60, y: 60 },
    acceptedTypes: [type],
  }));

  const items: SortItem[] = [];
  for (let i = 0; i < numItems; i++) {
    const type = types[i % types.length];
    items.push({
      id: `item_${i}`,
      type,
      color: colors[type],
      position: {
        x: 50 + (i % 5) * 65,
        y: 350 + Math.floor(i / 5) * 65,
      },
      size: 24,
    });
  }

  return {
    bins,
    items,
    timeLimit: 60,
  };
}

/** Generate untangle puzzle config */
function generateUntangleConfig(seed: number, difficulty: number): UntangleConfig {
  const rng = new SeededRandom(seed);

  const numObjects = 4 + difficulty;
  const shapes: ('circle' | 'square' | 'star' | 'triangle')[] = ['circle', 'square', 'star', 'triangle'];
  const colors = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF1C40F, 0x9B59B6, 0xE67E22];

  const objects: UntangleObject[] = [];
  for (let i = 0; i < numObjects; i++) {
    objects.push({
      id: `obj_${i}`,
      color: colors[i % colors.length],
      position: {
        x: 80 + (i % 3) * 100,
        y: 200 + Math.floor(i / 3) * 100,
      },
      size: 20 + rng.nextInt(0, 10),
      shape: shapes[i % shapes.length],
    });
  }

  return {
    objects,
    timeLimit: 60,
    separationThreshold: 80,
  };
}

/** Generate pack puzzle config */
function generatePackConfig(seed: number, difficulty: number): PackConfig {
  const rng = new SeededRandom(seed);

  const numItems = 3 + difficulty;
  const colors = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF1C40F, 0x9B59B6, 0xE67E22];

  const bounds: Rectangle = {
    x: 100,
    y: 250,
    width: 200,
    height: 200,
  };

  const items: PackItem[] = [];
  for (let i = 0; i < numItems; i++) {
    const width = 30 + rng.nextInt(0, 30);
    const height = 30 + rng.nextInt(0, 30);
    items.push({
      id: `pack_${i}`,
      color: colors[i % colors.length],
      position: {
        x: 50 + (i % 4) * 80,
        y: 380 + Math.floor(i / 4) * 50,
      },
      width,
      height,
    });
  }

  return {
    bounds,
    items,
    timeLimit: 60,
  };
}
