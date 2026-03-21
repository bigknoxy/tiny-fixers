import { LevelData, PuzzleType, MaterialType, SortConfig, UntangleConfig, PackConfig } from '@/config/types';
import { COLORS } from '@/config/colors';

function createSortLevel(
  id: string,
  name: string,
  description: string,
  difficulty: number,
  bins: { color: number; types: string[] }[],
  items: { type: string; color: number }[],
  timeLimit: number,
  coinReward: number
): LevelData {
  const gameWidth = 390;
  const gameHeight = 844;
  const binWidth = 80;
  const binHeight = 100;
  const binY = gameHeight - 200;
  const binSpacing = 20;
  const totalBinWidth = bins.length * binWidth + (bins.length - 1) * binSpacing;
  const startX = (gameWidth - totalBinWidth) / 2 + binWidth / 2;

  const sortBins = bins.map((bin, i) => ({
    id: `bin_${i}`,
    color: bin.color,
    position: { x: startX + i * (binWidth + binSpacing), y: binY },
    size: { x: binWidth, y: binHeight },
    acceptedTypes: bin.types,
  }));

  const itemSize = 30;
  const itemSpacing = 15;
  const itemsPerRow = 4;
  const itemStartY = 200;
  const itemStartX = (gameWidth - (itemsPerRow * (itemSize + itemSpacing))) / 2 + itemSize / 2;

  const sortItems = items.map((item, i) => ({
    id: `item_${i}`,
    type: item.type,
    color: item.color,
    position: {
      x: itemStartX + (i % itemsPerRow) * (itemSize + itemSpacing),
      y: itemStartY + Math.floor(i / itemsPerRow) * (itemSize + itemSpacing),
    },
    size: itemSize,
  }));

  const config: SortConfig = {
    bins: sortBins,
    items: sortItems,
    timeLimit,
  };

  return {
    id,
    name,
    description,
    type: PuzzleType.SORT,
    difficulty,
    config,
    rewards: {
      coins: coinReward,
      materials: difficulty > 3 ? [{ type: MaterialType.WOOD, amount: Math.floor(difficulty / 2) }] : undefined,
    },
  };
}

function createUntangleLevel(
  id: string,
  name: string,
  description: string,
  difficulty: number,
  objectCount: number,
  shapes: ('circle' | 'square' | 'star' | 'triangle')[],
  timeLimit: number,
  coinReward: number
): LevelData {
  const gameWidth = 390;
  const gameHeight = 844;
  const centerX = gameWidth / 2;
  const centerY = gameHeight / 2 - 50;

  const colors = [COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW, COLORS.PURPLE, COLORS.PINK, COLORS.ORANGE, COLORS.TEAL];
  const objects: UntangleConfig['objects'] = [];

  for (let i = 0; i < objectCount; i++) {
    const angle = (Math.PI * 2 * i) / objectCount;
    const radius = 40 + Math.random() * 30;
    const overlapOffset = difficulty > 2 ? (Math.random() - 0.5) * 40 : 0;

    objects.push({
      id: `obj_${i}`,
      color: colors[i % colors.length],
      position: {
        x: centerX + Math.cos(angle) * radius + overlapOffset,
        y: centerY + Math.sin(angle) * radius + overlapOffset,
      },
      size: 35 + Math.random() * 15,
      shape: shapes[i % shapes.length],
    });
  }

  const config: UntangleConfig = {
    objects,
    timeLimit,
    separationThreshold: 5,
  };

  return {
    id,
    name,
    description,
    type: PuzzleType.UNTANGLE,
    difficulty,
    config,
    rewards: {
      coins: coinReward,
      materials: difficulty > 4 ? [{ type: MaterialType.BRICK, amount: 1 }] : undefined,
    },
  };
}

function createPackLevel(
  id: string,
  name: string,
  description: string,
  difficulty: number,
  items: { width: number; height: number; color: number }[],
  timeLimit: number,
  coinReward: number
): LevelData {
  const gameWidth = 390;
  const gameHeight = 844;
  const boundsWidth = 200 + difficulty * 20;
  const boundsHeight = 180 + difficulty * 15;

  const config: PackConfig = {
    bounds: {
      x: (gameWidth - boundsWidth) / 2,
      y: gameHeight / 2 - boundsHeight / 2 - 50,
      width: boundsWidth,
      height: boundsHeight,
    },
    items: items.map((item, i) => ({
      id: `pack_${i}`,
      color: item.color,
      position: {
        x: 50 + (i % 5) * 60,
        y: gameHeight - 150 - Math.floor(i / 5) * 50,
      },
      width: item.width,
      height: item.height,
    })),
    timeLimit,
  };

  return {
    id,
    name,
    description,
    type: PuzzleType.PACK,
    difficulty,
    config,
    rewards: {
      coins: coinReward,
      materials: difficulty > 3 ? [{ type: MaterialType.PAINT, amount: 1 }] : undefined,
    },
  };
}

export const LEVELS: LevelData[] = [
  // SORT LEVELS (1-10)
  createSortLevel(
    'sort_01',
    'Red & Blue',
    'Sort the colored balls into matching bins',
    1,
    [
      { color: COLORS.RED, types: ['red'] },
      { color: COLORS.BLUE, types: ['blue'] },
    ],
    [
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
    ],
    45,
    10
  ),
  createSortLevel(
    'sort_02',
    'Three Colors',
    'Sort red, blue, and yellow items',
    1,
    [
      { color: COLORS.RED, types: ['red'] },
      { color: COLORS.BLUE, types: ['blue'] },
      { color: COLORS.YELLOW, types: ['yellow'] },
    ],
    [
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'yellow', color: COLORS.YELLOW },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'yellow', color: COLORS.YELLOW },
    ],
    50,
    12
  ),
  createSortLevel(
    'sort_03',
    'Mixed Bags',
    'Sort a variety of items',
    2,
    [
      { color: COLORS.RED, types: ['red'] },
      { color: COLORS.BLUE, types: ['blue'] },
      { color: COLORS.GREEN, types: ['green'] },
    ],
    [
      { type: 'red', color: COLORS.RED },
      { type: 'green', color: COLORS.GREEN },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'red', color: COLORS.RED },
      { type: 'green', color: COLORS.GREEN },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
    ],
    50,
    15
  ),
  createSortLevel(
    'sort_04',
    'Four Way',
    'Sort four different colors',
    2,
    [
      { color: COLORS.RED, types: ['red'] },
      { color: COLORS.BLUE, types: ['blue'] },
      { color: COLORS.GREEN, types: ['green'] },
      { color: COLORS.YELLOW, types: ['yellow'] },
    ],
    [
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'green', color: COLORS.GREEN },
      { type: 'yellow', color: COLORS.YELLOW },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
    ],
    55,
    15
  ),
  createSortLevel(
    'sort_05',
    'Rainbow Mix',
    'All the colors of the rainbow',
    3,
    [
      { color: COLORS.RED, types: ['red'] },
      { color: COLORS.BLUE, types: ['blue'] },
      { color: COLORS.GREEN, types: ['green'] },
      { color: COLORS.YELLOW, types: ['yellow'] },
    ],
    [
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'green', color: COLORS.GREEN },
      { type: 'yellow', color: COLORS.YELLOW },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'green', color: COLORS.GREEN },
      { type: 'yellow', color: COLORS.YELLOW },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
    ],
    55,
    20
  ),
  createSortLevel(
    'sort_06',
    'Quick Hands',
    'Sort fast for bonus points!',
    3,
    [
      { color: COLORS.RED, types: ['red'] },
      { color: COLORS.BLUE, types: ['blue'] },
    ],
    [
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
    ],
    40,
    25
  ),
  createSortLevel(
    'sort_07',
    'Color Explosion',
    'Many colors, many items!',
    4,
    [
      { color: COLORS.RED, types: ['red'] },
      { color: COLORS.BLUE, types: ['blue'] },
      { color: COLORS.GREEN, types: ['green'] },
      { color: COLORS.YELLOW, types: ['yellow'] },
    ],
    [
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'green', color: COLORS.GREEN },
      { type: 'yellow', color: COLORS.YELLOW },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'green', color: COLORS.GREEN },
      { type: 'yellow', color: COLORS.YELLOW },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'green', color: COLORS.GREEN },
      { type: 'yellow', color: COLORS.YELLOW },
    ],
    60,
    25
  ),
  createSortLevel(
    'sort_08',
    'Purple Haze',
    'Purple joins the party',
    4,
    [
      { color: COLORS.RED, types: ['red'] },
      { color: COLORS.BLUE, types: ['blue'] },
      { color: COLORS.PURPLE, types: ['purple'] },
    ],
    [
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'purple', color: COLORS.PURPLE },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'purple', color: COLORS.PURPLE },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'purple', color: COLORS.PURPLE },
    ],
    55,
    22
  ),
  createSortLevel(
    'sort_09',
    'Speed Demon',
    'Maximum speed sorting!',
    5,
    [
      { color: COLORS.RED, types: ['red'] },
      { color: COLORS.BLUE, types: ['blue'] },
      { color: COLORS.GREEN, types: ['green'] },
    ],
    [
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'green', color: COLORS.GREEN },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'green', color: COLORS.GREEN },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'green', color: COLORS.GREEN },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'green', color: COLORS.GREEN },
    ],
    45,
    30
  ),
  createSortLevel(
    'sort_10',
    'Grand Sort',
    'The ultimate sorting challenge!',
    5,
    [
      { color: COLORS.RED, types: ['red'] },
      { color: COLORS.BLUE, types: ['blue'] },
      { color: COLORS.GREEN, types: ['green'] },
      { color: COLORS.YELLOW, types: ['yellow'] },
      { color: COLORS.PURPLE, types: ['purple'] },
    ],
    [
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'green', color: COLORS.GREEN },
      { type: 'yellow', color: COLORS.YELLOW },
      { type: 'purple', color: COLORS.PURPLE },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
      { type: 'green', color: COLORS.GREEN },
      { type: 'yellow', color: COLORS.YELLOW },
      { type: 'purple', color: COLORS.PURPLE },
      { type: 'red', color: COLORS.RED },
      { type: 'blue', color: COLORS.BLUE },
    ],
    70,
    35
  ),

  // UNTANGLE LEVELS (11-20)
  createUntangleLevel(
    'untangle_01',
    'Tangled Start',
    'Pull apart the messy pile',
    1,
    3,
    ['circle', 'circle', 'circle'],
    45,
    10
  ),
  createUntangleLevel(
    'untangle_02',
    'Four Corners',
    'Separate the shapes',
    1,
    4,
    ['circle', 'square', 'circle', 'square'],
    50,
    12
  ),
  createUntangleLevel(
    'untangle_03',
    'Mixed Shapes',
    'Different shapes, same goal',
    2,
    5,
    ['circle', 'square', 'triangle', 'circle', 'square'],
    50,
    15
  ),
  createUntangleLevel(
    'untangle_04',
    'Star Cluster',
    'Untangle the stars',
    2,
    5,
    ['star', 'star', 'circle', 'star', 'circle'],
    55,
    15
  ),
  createUntangleLevel(
    'untangle_05',
    'Pile Up',
    'A bigger mess to clean',
    3,
    6,
    ['circle', 'square', 'triangle', 'star', 'circle', 'square'],
    55,
    20
  ),
  createUntangleLevel(
    'untangle_06',
    'Crowded Room',
    'Many items, little space',
    3,
    7,
    ['circle', 'circle', 'square', 'square', 'triangle', 'star', 'circle'],
    60,
    22
  ),
  createUntangleLevel(
    'untangle_07',
    'Shape Storm',
    'All shapes tangled together',
    4,
    8,
    ['circle', 'square', 'triangle', 'star', 'circle', 'square', 'triangle', 'star'],
    65,
    25
  ),
  createUntangleLevel(
    'untangle_08',
    'Tight Squeeze',
    'Close quarters untangling',
    4,
    8,
    ['circle', 'circle', 'circle', 'circle', 'square', 'square', 'square', 'square'],
    60,
    25
  ),
  createUntangleLevel(
    'untangle_09',
    'Chaos Theory',
    'Maximum entanglement',
    5,
    10,
    ['circle', 'square', 'triangle', 'star', 'circle', 'square', 'triangle', 'star', 'circle', 'square'],
    70,
    30
  ),
  createUntangleLevel(
    'untangle_10',
    'Ultimate Tangle',
    'The biggest mess yet!',
    5,
    12,
    ['circle', 'square', 'triangle', 'star', 'circle', 'square', 'triangle', 'star', 'circle', 'square', 'triangle', 'star'],
    80,
    35
  ),

  // PACK LEVELS (21-30)
  createPackLevel(
    'pack_21',
    'First Box',
    'Fit items in the container',
    1,
    [
      { width: 40, height: 40, color: COLORS.RED },
      { width: 40, height: 40, color: COLORS.BLUE },
      { width: 40, height: 40, color: COLORS.GREEN },
    ],
    45,
    10
  ),
  createPackLevel(
    'pack_22',
    'Two Sizes',
    'Mix of large and small',
    1,
    [
      { width: 50, height: 50, color: COLORS.RED },
      { width: 30, height: 30, color: COLORS.BLUE },
      { width: 30, height: 30, color: COLORS.GREEN },
      { width: 50, height: 50, color: COLORS.YELLOW },
    ],
    50,
    12
  ),
  createPackLevel(
    'pack_23',
    'Rectangles',
    'Different shaped boxes',
    2,
    [
      { width: 60, height: 30, color: COLORS.RED },
      { width: 30, height: 60, color: COLORS.BLUE },
      { width: 40, height: 40, color: COLORS.GREEN },
      { width: 60, height: 30, color: COLORS.YELLOW },
    ],
    50,
    15
  ),
  createPackLevel(
    'pack_24',
    'Packing Pro',
    'More items to fit',
    2,
    [
      { width: 40, height: 40, color: COLORS.RED },
      { width: 40, height: 40, color: COLORS.BLUE },
      { width: 40, height: 40, color: COLORS.GREEN },
      { width: 40, height: 40, color: COLORS.YELLOW },
      { width: 30, height: 30, color: COLORS.PURPLE },
    ],
    55,
    18
  ),
  createPackLevel(
    'pack_25',
    'Tight Fit',
    'Squeeze everything in',
    3,
    [
      { width: 50, height: 50, color: COLORS.RED },
      { width: 50, height: 50, color: COLORS.BLUE },
      { width: 30, height: 60, color: COLORS.GREEN },
      { width: 60, height: 30, color: COLORS.YELLOW },
      { width: 30, height: 30, color: COLORS.PURPLE },
      { width: 30, height: 30, color: COLORS.ORANGE },
    ],
    60,
    22
  ),
  createPackLevel(
    'pack_26',
    'Color Blocks',
    'Match the color pattern',
    3,
    [
      { width: 35, height: 35, color: COLORS.RED },
      { width: 35, height: 35, color: COLORS.BLUE },
      { width: 35, height: 35, color: COLORS.GREEN },
      { width: 35, height: 35, color: COLORS.YELLOW },
      { width: 35, height: 35, color: COLORS.PURPLE },
      { width: 35, height: 35, color: COLORS.ORANGE },
      { width: 35, height: 35, color: COLORS.PINK },
    ],
    60,
    25
  ),
  createPackLevel(
    'pack_27',
    'Odd Shapes',
    'Irregular sizes to pack',
    4,
    [
      { width: 70, height: 25, color: COLORS.RED },
      { width: 25, height: 70, color: COLORS.BLUE },
      { width: 45, height: 45, color: COLORS.GREEN },
      { width: 55, height: 35, color: COLORS.YELLOW },
      { width: 35, height: 55, color: COLORS.PURPLE },
    ],
    65,
    25
  ),
  createPackLevel(
    'pack_28',
    'Box Overflow',
    'So many boxes!',
    4,
    [
      { width: 40, height: 40, color: COLORS.RED },
      { width: 40, height: 40, color: COLORS.BLUE },
      { width: 40, height: 40, color: COLORS.GREEN },
      { width: 40, height: 40, color: COLORS.YELLOW },
      { width: 40, height: 40, color: COLORS.PURPLE },
      { width: 40, height: 40, color: COLORS.ORANGE },
      { width: 40, height: 40, color: COLORS.PINK },
      { width: 40, height: 40, color: COLORS.TEAL },
    ],
    70,
    28
  ),
  createPackLevel(
    'pack_29',
    'Master Packer',
    'Expert level packing',
    5,
    [
      { width: 50, height: 50, color: COLORS.RED },
      { width: 50, height: 50, color: COLORS.BLUE },
      { width: 30, height: 60, color: COLORS.GREEN },
      { width: 60, height: 30, color: COLORS.YELLOW },
      { width: 40, height: 40, color: COLORS.PURPLE },
      { width: 35, height: 45, color: COLORS.ORANGE },
      { width: 45, height: 35, color: COLORS.PINK },
      { width: 25, height: 55, color: COLORS.TEAL },
    ],
    75,
    32
  ),
  createPackLevel(
    'pack_30',
    'Ultimate Box',
    'The ultimate packing challenge!',
    5,
    [
      { width: 45, height: 45, color: COLORS.RED },
      { width: 45, height: 45, color: COLORS.BLUE },
      { width: 45, height: 45, color: COLORS.GREEN },
      { width: 35, height: 55, color: COLORS.YELLOW },
      { width: 55, height: 35, color: COLORS.PURPLE },
      { width: 40, height: 40, color: COLORS.ORANGE },
      { width: 40, height: 40, color: COLORS.PINK },
      { width: 30, height: 50, color: COLORS.TEAL },
      { width: 50, height: 30, color: COLORS.RED },
      { width: 35, height: 35, color: COLORS.BLUE },
    ],
    80,
    40
  ),
];

export function getLevelById(id: string): LevelData | undefined {
  return LEVELS.find(level => level.id === id);
}

export function getNextLevel(currentId: string): LevelData | undefined {
  const index = LEVELS.findIndex(level => level.id === currentId);
  if (index >= 0 && index < LEVELS.length - 1) {
    return LEVELS[index + 1];
  }
  return undefined;
}