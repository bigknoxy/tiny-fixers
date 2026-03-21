import { PuzzleType } from '@/config/types';
import { COLORS } from '@/config/colors';

export function getTypeColor(type: PuzzleType): number {
  switch (type) {
    case PuzzleType.SORT:
      return COLORS.SORT_PRIMARY;
    case PuzzleType.UNTANGLE:
      return COLORS.UNTANGLE_PRIMARY;
    case PuzzleType.PACK:
      return COLORS.PACK_PRIMARY;
    default:
      return COLORS.CORAL;
  }
}
