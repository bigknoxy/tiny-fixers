import { HubLocation, Character, MaterialType } from '@/config/types';
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
  {
    id: 'bakery',
    name: 'Bakery',
    description: 'A cozy bakery with delicious treats waiting to be made!',
    requiredStars: 50,
    stages: [
      {
        id: 'bakery_1',
        name: 'Fix the Oven',
        cost: 150,
        materials: [{ type: MaterialType.METAL, amount: 3 }, { type: MaterialType.BRICK, amount: 2 }],
        unlocks: ['character_baker'],
      },
      {
        id: 'bakery_2',
        name: 'Paint the Walls',
        cost: 200,
        materials: [{ type: MaterialType.PAINT, amount: 4 }, { type: MaterialType.WOOD, amount: 2 }],
        unlocks: ['decoration_cake_display'],
      },
      {
        id: 'bakery_3',
        name: 'Grand Opening',
        cost: 300,
        materials: [{ type: MaterialType.GLASS, amount: 3 }, { type: MaterialType.PAINT, amount: 2 }],
        unlocks: ['puzzle_set_bakery'],
      },
    ],
    rewards: [
      { type: 'character', id: 'baker' },
      { type: 'decoration', id: 'cake_display' },
      { type: 'puzzle_set', id: 'bakery' },
    ],
  },
  {
    id: 'library',
    name: 'Library',
    description: 'A dusty old library full of stories waiting to be told!',
    requiredStars: 100,
    stages: [
      {
        id: 'library_1',
        name: 'Sort the Books',
        cost: 200,
        materials: [{ type: MaterialType.WOOD, amount: 4 }, { type: MaterialType.PAINT, amount: 2 }],
        unlocks: ['character_librarian'],
      },
      {
        id: 'library_2',
        name: 'Replace the Shelves',
        cost: 300,
        materials: [{ type: MaterialType.WOOD, amount: 5 }, { type: MaterialType.METAL, amount: 3 }],
        unlocks: ['decoration_reading_nook'],
      },
      {
        id: 'library_3',
        name: 'Reading Room',
        cost: 400,
        materials: [{ type: MaterialType.GLASS, amount: 4 }, { type: MaterialType.BRICK, amount: 3 }],
        unlocks: ['puzzle_set_library'],
      },
    ],
    rewards: [
      { type: 'character', id: 'librarian' },
      { type: 'decoration', id: 'reading_nook' },
      { type: 'puzzle_set', id: 'library' },
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

