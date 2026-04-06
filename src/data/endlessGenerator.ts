import { LevelData, PuzzleType, SortConfig, UntangleConfig, PackConfig } from '@/config/types';
import { COLORS } from '@/config/colors';

const GAME_WIDTH = 390;
const GAME_HEIGHT = 844;

const COLORS_ARRAY = [
  COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW,
  COLORS.PURPLE, COLORS.PINK, COLORS.ORANGE, COLORS.TEAL
];

const SHAPES: ('circle' | 'square' | 'star' | 'triangle')[] = ['circle', 'square', 'star', 'triangle'];

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

export function generateEndlessLevel(
  score: number,
  seed?: number
): LevelData {
  const actualSeed = seed ?? Date.now();
  const random = seededRandom(actualSeed);
  
  const puzzleTypes = [PuzzleType.SORT, PuzzleType.UNTANGLE, PuzzleType.PACK];
  const typeIndex = Math.floor(random() * puzzleTypes.length);
  const puzzleType = puzzleTypes[typeIndex];
  
  const baseDifficulty = Math.min(10, 1 + Math.floor(score / 3));
  const difficulty = baseDifficulty + Math.floor(random() * 2);
  
  const timeLimit = Math.max(20, 60 - score * 2);
  const id = `endless_${score}_${actualSeed}`;
  
  switch (puzzleType) {
    case PuzzleType.SORT:
      return generateSortLevel(id, difficulty, timeLimit, random);
    case PuzzleType.UNTANGLE:
      return generateUntangleLevel(id, difficulty, timeLimit, random);
    case PuzzleType.PACK:
      return generatePackLevel(id, difficulty, timeLimit, random);
  }
}

function generateSortLevel(
  id: string,
  difficulty: number,
  timeLimit: number,
  random: () => number
): LevelData {
  const binCount = Math.min(4, 2 + Math.floor(difficulty / 3));
  const itemCount = 4 + difficulty * 2;
  
  const binWidth = 80;
  const binHeight = 100;
  const binY = GAME_HEIGHT - 200;
  const binSpacing = 20;
  const totalBinWidth = binCount * binWidth + (binCount - 1) * binSpacing;
  const startX = (GAME_WIDTH - totalBinWidth) / 2 + binWidth / 2;
  
  const types = ['red', 'blue', 'green', 'yellow'];
  const bins: SortConfig['bins'] = [];
  
  for (let i = 0; i < binCount; i++) {
    bins.push({
      id: `bin_${i}`,
      color: COLORS_ARRAY[i],
      position: { x: startX + i * (binWidth + binSpacing), y: binY },
      size: { x: binWidth, y: binHeight },
      acceptedTypes: [types[i]],
    });
  }
  
  const itemSize = 30;
  const itemSpacing = 15;
  const itemsPerRow = 4;
  const itemStartY = 200;
  const itemStartX = (GAME_WIDTH - (itemsPerRow * (itemSize + itemSpacing))) / 2 + itemSize / 2;
  
  const items: SortConfig['items'] = [];
  for (let i = 0; i < itemCount; i++) {
    const typeIndex = Math.floor(random() * binCount);
    items.push({
      id: `item_${i}`,
      type: types[typeIndex],
      color: COLORS_ARRAY[typeIndex],
      position: {
        x: itemStartX + (i % itemsPerRow) * (itemSize + itemSpacing),
        y: itemStartY + Math.floor(i / itemsPerRow) * (itemSize + itemSpacing),
      },
      size: itemSize,
    });
  }
  
  const config: SortConfig = { bins, items, timeLimit };
  
  return {
    id,
    name: `Endless Sort ${difficulty}`,
    description: 'Sort the items quickly!',
    type: PuzzleType.SORT,
    difficulty,
    config,
    rewards: { coins: 10 + difficulty * 2 },
  };
}

function generateUntangleLevel(
  id: string,
  difficulty: number,
  timeLimit: number,
  random: () => number
): LevelData {
  const objectCount = Math.min(12, 3 + Math.floor(difficulty / 2));
  const centerX = GAME_WIDTH / 2;
  const centerY = GAME_HEIGHT / 2 - 50;
  const baseSize = 35;
  const separationThreshold = 5;

  const minOverlapDistance = baseSize * 2 - separationThreshold;
  const angleSpread = (Math.PI * 2) / Math.max(objectCount, 3);
  const maxRadius = minOverlapDistance / (2 * Math.sin(angleSpread / 2));
  const clusterRadius = maxRadius * 0.6;

  const objects: UntangleConfig['objects'] = [];

  for (let i = 0; i < objectCount; i++) {
    const angle = (Math.PI * 2 * i) / objectCount + (random() - 0.5) * 0.3;
    const radius = clusterRadius + (random() - 0.5) * 5;

    objects.push({
      id: `obj_${i}`,
      color: COLORS_ARRAY[i % COLORS_ARRAY.length],
      position: {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      },
      size: baseSize + random() * 15,
      shape: SHAPES[i % SHAPES.length],
    });
  }

  const config: UntangleConfig = {
    objects,
    timeLimit,
    separationThreshold,
  };

  return {
    id,
    name: `Endless Untangle ${difficulty}`,
    description: 'Separate all objects!',
    type: PuzzleType.UNTANGLE,
    difficulty,
    config,
    rewards: { coins: 10 + difficulty * 2 },
  };
}

function generatePackLevel(
  id: string,
  difficulty: number,
  timeLimit: number,
  random: () => number
): LevelData {
  const boundsWidth = 180 + difficulty * 15;
  const boundsHeight = 160 + difficulty * 12;
  const itemCount = 3 + Math.floor(difficulty / 2);
  
  const items: PackConfig['items'] = [];
  
  for (let i = 0; i < itemCount; i++) {
    const width = 30 + Math.floor(random() * 40);
    const height = 30 + Math.floor(random() * 40);
    
    items.push({
      id: `pack_${i}`,
      color: COLORS_ARRAY[i % COLORS_ARRAY.length],
      position: {
        x: 50 + (i % 5) * 60,
        y: GAME_HEIGHT - 150 - Math.floor(i / 5) * 50,
      },
      width,
      height,
    });
  }
  
  const config: PackConfig = {
    bounds: {
      x: (GAME_WIDTH - boundsWidth) / 2,
      y: GAME_HEIGHT / 2 - boundsHeight / 2 - 50,
      width: boundsWidth,
      height: boundsHeight,
    },
    items,
    timeLimit,
  };
  
  return {
    id,
    name: `Endless Pack ${difficulty}`,
    description: 'Pack all items in the box!',
    type: PuzzleType.PACK,
    difficulty,
    config,
    rewards: { coins: 10 + difficulty * 2 },
  };
}
