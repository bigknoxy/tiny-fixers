import { LevelData, PuzzleType, SortConfig, UntangleConfig, PackConfig } from '@/config/types';
import { COLORS } from '@/config/colors';

const GAME_WIDTH = 390;
const GAME_HEIGHT = 844;

const COLORS_ARRAY = [
  COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW,
  COLORS.PURPLE, COLORS.PINK, COLORS.ORANGE, COLORS.TEAL
];

const TYPES = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'teal'];
const SHAPES: ('circle' | 'square' | 'star' | 'triangle')[] = ['circle', 'square', 'star', 'triangle'];

const SORT_NAMES = [
  'Color Rush', 'Quick Sort', 'Rainbow Bins', 'Sorting Spree', 'Color Cascade',
  'Bin Blitz', 'Spectrum Sort', 'Palette Panic', 'Hue Hustle', 'Chromatic Chaos',
  'Speed Sort', 'Tidy Up', 'Sort Storm', 'Color Quest', 'Bin Battle',
  'Flash Sort', 'Rapid Bins', 'Prism Rush', 'Sorting Frenzy', 'Vivid Dash',
  'Color Crunch', 'Sort Surge', 'Neon Bins', 'Bright Sort', 'Color Pop',
  'Bin Bounce', 'Sort Snap', 'Swift Bins', 'Color Drop', 'Turbo Sort',
];

const UNTANGLE_NAMES = [
  'Knot\'s Landing', 'Tangle Twist', 'Free the Shapes', 'Untangle Bliss', 'Shape Escape',
  'Messy Shapes', 'Pull Apart', 'Separation Station', 'Unwind', 'Spread Out',
  'Shape Shuffle', 'Clear the Cluster', 'Break Free', 'Scatter', 'Space Out',
  'Shape Drift', 'Float Away', 'Gentle Untangle', 'Easy Breeze', 'Open Space',
  'Shape Liberation', 'Tangle Tamer', 'Spread Wide', 'Breathe Easy', 'Loosen Up',
  'Shape Dance', 'Smooth Slide', 'Clear Path', 'Shape Freedom', 'Drift Apart',
];

const PACK_NAMES = [
  'Tight Fit', 'Box It Up', 'Snug Puzzle', 'Pack Perfect', 'Space Master',
  'Tetris Lite', 'Fill It In', 'Box Builder', 'Pack Attack', 'Container Puzzle',
  'Fit Together', 'Space Saver', 'Pack Precise', 'Smart Pack', 'Box Solver',
  'Compact', 'Squeeze In', 'Jigsaw Box', 'Perfect Pack', 'Space Logic',
  'Pack Pro', 'Box Brain', 'Fit Finder', 'Tight Pack', 'Smart Space',
  'Pack Wizard', 'Box Master', 'Spatial Sense', 'Puzzle Pack', 'Snug Fit',
];

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

interface GeneratedLevelParams {
  type: PuzzleType;
  difficulty: number;
  seed: number;
  timeLimit: number;
  id: string;
  name: string;
  coins: number;
}

function generateSortLevel(params: GeneratedLevelParams): LevelData {
  const random = seededRandom(params.seed);
  const { difficulty } = params;

  const binCount = Math.min(5, 2 + Math.floor(difficulty / 2));
  const itemCount = Math.min(16, 4 + difficulty * 2);

  const binWidth = 80;
  const binHeight = 100;
  const binY = GAME_HEIGHT - 200;
  const binSpacing = 16;
  const totalBinWidth = binCount * binWidth + (binCount - 1) * binSpacing;
  const startX = (GAME_WIDTH - totalBinWidth) / 2 + binWidth / 2;

  const bins: SortConfig['bins'] = [];
  for (let i = 0; i < binCount; i++) {
    bins.push({
      id: `bin_${i}`,
      color: COLORS_ARRAY[i],
      position: { x: startX + i * (binWidth + binSpacing), y: binY },
      size: { x: binWidth, y: binHeight },
      acceptedTypes: [TYPES[i]],
    });
  }

  const itemSize = 28 + Math.floor(random() * 8);
  const itemSpacing = 12;
  const itemsPerRow = 4;
  const itemStartY = 180;
  const itemStartX = (GAME_WIDTH - (itemsPerRow * (itemSize + itemSpacing))) / 2 + itemSize / 2;

  const items: SortConfig['items'] = [];
  // Ensure at least 1 item per bin
  for (let i = 0; i < binCount; i++) {
    items.push({
      id: `item_${i}`,
      type: TYPES[i],
      color: COLORS_ARRAY[i],
      position: {
        x: itemStartX + (i % itemsPerRow) * (itemSize + itemSpacing) + (random() - 0.5) * 8,
        y: itemStartY + Math.floor(i / itemsPerRow) * (itemSize + itemSpacing),
      },
      size: itemSize,
    });
  }
  // Fill remaining items randomly
  for (let i = binCount; i < itemCount; i++) {
    const typeIdx = Math.floor(random() * binCount);
    items.push({
      id: `item_${i}`,
      type: TYPES[typeIdx],
      color: COLORS_ARRAY[typeIdx],
      position: {
        x: itemStartX + (i % itemsPerRow) * (itemSize + itemSpacing) + (random() - 0.5) * 8,
        y: itemStartY + Math.floor(i / itemsPerRow) * (itemSize + itemSpacing),
      },
      size: itemSize,
    });
  }

  return {
    id: params.id,
    name: params.name,
    description: 'Sort items into the correct bins!',
    type: PuzzleType.SORT,
    difficulty: params.difficulty,
    config: { bins, items, timeLimit: params.timeLimit } as SortConfig,
    rewards: { coins: params.coins },
  };
}

function generateUntangleLevel(params: GeneratedLevelParams): LevelData {
  const random = seededRandom(params.seed);
  const { difficulty } = params;

  const objectCount = Math.min(12, 3 + Math.floor(difficulty * 1.2));
  const centerX = GAME_WIDTH / 2;
  const centerY = GAME_HEIGHT / 2 - 50;

  const objects: UntangleConfig['objects'] = [];
  for (let i = 0; i < objectCount; i++) {
    const angle = (Math.PI * 2 * i) / objectCount;
    const baseRadius = objectCount <= 4 ? 25 : 40;
    const radius = baseRadius + random() * 30;
    // Tighter clusters at higher difficulty
    const overlapFactor = 50 + Math.max(0, 7 - difficulty) * 15;
    const overlapOffset = (random() - 0.5) * overlapFactor;

    objects.push({
      id: `obj_${i}`,
      color: COLORS_ARRAY[i % COLORS_ARRAY.length],
      position: {
        x: centerX + Math.cos(angle) * radius + overlapOffset,
        y: centerY + Math.sin(angle) * radius + overlapOffset,
      },
      size: 30 + random() * 20,
      shape: SHAPES[Math.floor(random() * SHAPES.length)],
    });
  }

  return {
    id: params.id,
    name: params.name,
    description: 'Separate all the overlapping objects!',
    type: PuzzleType.UNTANGLE,
    difficulty: params.difficulty,
    config: {
      objects,
      timeLimit: params.timeLimit,
      separationThreshold: 5,
    } as UntangleConfig,
    rewards: { coins: params.coins },
  };
}

function generatePackLevel(params: GeneratedLevelParams): LevelData {
  const random = seededRandom(params.seed);
  const { difficulty } = params;

  const boundsWidth = 170 + difficulty * 18;
  const boundsHeight = 150 + difficulty * 14;
  const itemCount = Math.min(10, 3 + Math.floor(difficulty * 0.8));

  const items: PackConfig['items'] = [];
  for (let i = 0; i < itemCount; i++) {
    const width = 30 + Math.floor(random() * (25 + difficulty * 3));
    const height = 30 + Math.floor(random() * (25 + difficulty * 3));

    items.push({
      id: `pack_${i}`,
      color: COLORS_ARRAY[i % COLORS_ARRAY.length],
      position: {
        x: 50 + (i % 5) * 65,
        y: GAME_HEIGHT - 140 - Math.floor(i / 5) * 55,
      },
      width: Math.min(width, boundsWidth - 10),
      height: Math.min(height, boundsHeight - 10),
    });
  }

  return {
    id: params.id,
    name: params.name,
    description: 'Fit all items inside the container!',
    type: PuzzleType.PACK,
    difficulty: params.difficulty,
    config: {
      bounds: {
        x: (GAME_WIDTH - boundsWidth) / 2,
        y: GAME_HEIGHT / 2 - boundsHeight / 2 - 50,
        width: boundsWidth,
        height: boundsHeight,
      },
      items,
      timeLimit: params.timeLimit,
    } as PackConfig,
    rewards: { coins: params.coins },
  };
}

/**
 * Generate 90 campaign levels (levels 31-120) with deterministic seeds.
 * Levels cycle through all 3 puzzle types and scale difficulty progressively.
 */
export function generateCampaignLevels(): LevelData[] {
  const levels: LevelData[] = [];
  const types = [PuzzleType.SORT, PuzzleType.UNTANGLE, PuzzleType.PACK];
  const nameArrays = [SORT_NAMES, UNTANGLE_NAMES, PACK_NAMES];
  const prefixes = ['gen_sort', 'gen_untangle', 'gen_pack'];

  for (let i = 0; i < 90; i++) {
    const globalIndex = i + 30; // levels 31-120 (0-indexed as 30-119)
    const typeIndex = i % 3;
    const type = types[typeIndex];
    const nameIndex = Math.floor(i / 3) % nameArrays[typeIndex].length;

    // Difficulty curve: 3-5 for first 20, 5-7 for next 30, 7-9 for next 20, 9-10 for last 20
    let difficulty: number;
    if (i < 20) {
      difficulty = 3 + Math.floor(i / 7);
    } else if (i < 50) {
      difficulty = 5 + Math.floor((i - 20) / 10);
    } else if (i < 70) {
      difficulty = 7 + Math.floor((i - 50) / 10);
    } else {
      difficulty = 9 + Math.floor((i - 70) / 20);
    }
    difficulty = Math.min(10, difficulty);

    // Time limit: generous for easy, tighter for hard
    const timeLimit = Math.max(30, 65 - difficulty * 3);

    // Coins scale with difficulty
    const coins = 15 + difficulty * 3;

    // Deterministic seed based on global index
    const seed = 42424242 + globalIndex * 7919;

    const id = `${prefixes[typeIndex]}_${globalIndex + 1}`;
    const name = nameArrays[typeIndex][nameIndex];

    const params: GeneratedLevelParams = {
      type, difficulty, seed, timeLimit, id, name, coins,
    };

    switch (type) {
      case PuzzleType.SORT:
        levels.push(generateSortLevel(params));
        break;
      case PuzzleType.UNTANGLE:
        levels.push(generateUntangleLevel(params));
        break;
      case PuzzleType.PACK:
        levels.push(generatePackLevel(params));
        break;
    }
  }

  return levels;
}
