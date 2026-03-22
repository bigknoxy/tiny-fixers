import { PuzzleType } from '@/config/types';

export interface TutorialContent {
  title: string;
  emoji: string;
  description: string;
}

export const PUZZLE_TUTORIALS: Record<PuzzleType, TutorialContent> = {
  [PuzzleType.SORT]: {
    title: 'Sort It Out!',
    emoji: '🎯',
    description: 'Drag items to matching colored bins.\nMatch the color of each item to its bin!',
  },
  [PuzzleType.UNTANGLE]: {
    title: 'Untangle the Mess!',
    emoji: '🔄',
    description: 'Drag objects apart until none overlap.\nKeep moving them until all are separated!',
  },
  [PuzzleType.PACK]: {
    title: 'Pack It In!',
    emoji: '📦',
    description: 'Fit all items inside the box.\nDrag and arrange items to fit them all!',
  },
};

export const PUZZLE_TYPE_FIRST_LEVELS: Record<PuzzleType, string> = {
  [PuzzleType.SORT]: 'sort_01',
  [PuzzleType.UNTANGLE]: 'untangle_01',
  [PuzzleType.PACK]: 'pack_21',
};

export function isFirstLevelOfPuzzleType(levelId: string): boolean {
  return Object.values(PUZZLE_TYPE_FIRST_LEVELS).includes(levelId);
}

export function getPuzzleTypeByFirstLevel(levelId: string): PuzzleType | null {
  for (const [type, id] of Object.entries(PUZZLE_TYPE_FIRST_LEVELS)) {
    if (id === levelId) {
      return type as PuzzleType;
    }
  }
  return null;
}
