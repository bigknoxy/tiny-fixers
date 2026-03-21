import { HubLocation, Character, Achievement, MaterialType } from '@/config/types';
import { COLORS } from '@/config/colors';

export const HUB_LOCATIONS: HubLocation[] = [
  {
    id: 'flower_shop',
    name: 'Flower Shop',
    description: 'A charming little flower shop that needs your help!',
    requiredStars: 0,
    stages: [
      {
        id: 'flower_shop_1',
        name: 'Clean the Windows',
        cost: 50,
        materials: [{ type: MaterialType.WOOD, amount: 2 }],
        unlocks: ['character_florist'],
      },
      {
        id: 'flower_shop_2',
        name: 'Fix the Sign',
        cost: 100,
        materials: [{ type: MaterialType.WOOD, amount: 3 }, { type: MaterialType.PAINT, amount: 1 }],
        unlocks: ['decoration_flower_pot'],
      },
      {
        id: 'flower_shop_3',
        name: 'Open for Business',
        cost: 150,
        materials: [{ type: MaterialType.BRICK, amount: 2 }, { type: MaterialType.GLASS, amount: 1 }],
        unlocks: ['puzzle_set_flowers'],
      },
    ],
    rewards: [
      { type: 'character', id: 'florist' },
      { type: 'decoration', id: 'flower_pot' },
      { type: 'puzzle_set', id: 'flowers' },
    ],
  },
  {
    id: 'tool_shed',
    name: 'Tool Shed',
    description: 'A handy tool shed for fixing all sorts of things!',
    requiredStars: 10,
    stages: [
      {
        id: 'tool_shed_1',
        name: 'Clear the Clutter',
        cost: 75,
        materials: [{ type: MaterialType.WOOD, amount: 3 }],
        unlocks: ['character_handyperson'],
      },
      {
        id: 'tool_shed_2',
        name: 'Organize Tools',
        cost: 125,
        materials: [{ type: MaterialType.METAL, amount: 2 }, { type: MaterialType.WOOD, amount: 2 }],
        unlocks: ['decoration_tool_rack'],
      },
      {
        id: 'tool_shed_3',
        name: 'Ready for Repairs',
        cost: 200,
        materials: [{ type: MaterialType.BRICK, amount: 3 }, { type: MaterialType.GLASS, amount: 2 }],
        unlocks: ['puzzle_set_tools'],
      },
    ],
    rewards: [
      { type: 'character', id: 'handyperson' },
      { type: 'decoration', id: 'tool_rack' },
      { type: 'puzzle_set', id: 'tools' },
    ],
  },
];

export const CHARACTERS: Character[] = [
  {
    id: 'helper_01',
    name: 'Pip',
    description: 'A cheerful little helper who loves to organize things!',
    personality: 'Optimistic and always ready to help.',
    color: COLORS.YELLOW,
  },
  {
    id: 'florist',
    name: 'Rose',
    description: 'The friendly neighborhood florist with green thumbs.',
    personality: 'Calm, nurturing, and loves all things that grow.',
    color: COLORS.GREEN,
  },
  {
    id: 'handyperson',
    name: 'Fix',
    description: 'A skilled handy-person who can fix almost anything!',
    personality: 'Practical, resourceful, and always has the right tool.',
    color: COLORS.ORANGE,
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_level',
    name: 'First Steps',
    description: 'Complete your first level',
    condition: 'complete_level_1',
    reward: 50,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ten_levels',
    name: 'Getting Started',
    description: 'Complete 10 levels',
    condition: 'complete_10_levels',
    reward: 100,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'thirty_levels',
    name: 'Puzzle Master',
    description: 'Complete all 30 levels',
    condition: 'complete_30_levels',
    reward: 300,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'all_stars',
    name: 'Star Collector',
    description: 'Get 3 stars on 10 levels',
    condition: 'get_30_stars',
    reward: 200,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'seven_day_streak',
    name: 'Dedicated Helper',
    description: 'Play for 7 days in a row',
    condition: '7_day_streak',
    reward: 150,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'hub_complete',
    name: 'Neighborhood Hero',
    description: 'Fully restore a location',
    condition: 'complete_hub_location',
    reward: 200,
    unlocked: false,
    unlockedAt: null,
  },
];