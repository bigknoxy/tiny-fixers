export enum PuzzleType {
  SORT = 'sort',
  UNTANGLE = 'untangle',
  PACK = 'pack',
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SortBin {
  id: string;
  color: number;
  position: Vector2;
  size: Vector2;
  acceptedTypes: string[];
}

export interface SortItem {
  id: string;
  type: string;
  color: number;
  position: Vector2;
  size: number;
}

export interface SortConfig {
  bins: SortBin[];
  items: SortItem[];
  timeLimit: number;
}

export interface UntangleObject {
  id: string;
  color: number;
  position: Vector2;
  size: number;
  shape: 'circle' | 'square' | 'star' | 'triangle';
}

export interface UntangleConfig {
  objects: UntangleObject[];
  timeLimit: number;
  separationThreshold: number;
}

export interface PackItem {
  id: string;
  color: number;
  position: Vector2;
  width: number;
  height: number;
  placed?: boolean;
  placedX?: number;
  placedY?: number;
}

export interface PackConfig {
  bounds: Rectangle;
  items: PackItem[];
  timeLimit: number;
}

export interface LevelData {
  id: string;
  name: string;
  description: string;
  type: PuzzleType;
  difficulty: number;
  config: SortConfig | UntangleConfig | PackConfig;
  rewards: RewardConfig;
  requiredStars?: number;
}

export interface RewardConfig {
  coins: number;
  materials?: MaterialReward[];
}

export interface MaterialReward {
  type: MaterialType;
  amount: number;
}

export enum MaterialType {
  WOOD = 'wood',
  BRICK = 'brick',
  PAINT = 'paint',
  GLASS = 'glass',
  METAL = 'metal',
}

export interface LevelProgress {
  stars: number;
  bestTime: number;
  completedAt: number | null;
}

export interface HubLocationState {
  id: string;
  currentStage: number;
  maxStage: number;
  unlocked: boolean;
}

export interface HubLocation {
  id: string;
  name: string;
  description: string;
  stages: HubStage[];
  requiredStars: number;
  rewards: HubReward[];
}

export interface HubStage {
  id: string;
  name: string;
  cost: number;
  materials: MaterialReward[];
  unlocks?: string[];
}

export interface HubReward {
  type: 'character' | 'decoration' | 'puzzle_set';
  id: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  color: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: number;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface DailyState {
  lastPlayDate: string | null;
  currentStreak: number;
  longestStreak: number;
  todayChallengeCompleted: boolean;
  weeklyRewardsClaimed: number[];
}

export interface PlayerState {
  id: string;
  createdAt: number;
  lastPlayedAt: number;
  totalPlayTime: number;
}

export interface ProgressState {
  completedLevels: Record<string, LevelProgress>;
  totalStars: number;
  currentLevel: number;
  hubProgress: Record<string, HubLocationState>;
  unlockedPuzzles: string[];
  unlockedCharacters: string[];
  unlockedDecorations: string[];
}

export interface EconomyState {
  coins: number;
  materials: Record<MaterialType, number>;
}

export interface SettingsState {
  musicVolume: number;
  sfxVolume: number;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface GameState {
  version: number;
  player: PlayerState;
  progress: ProgressState;
  economy: EconomyState;
  settings: SettingsState;
  daily: DailyState;
  achievements: Achievement[];
}

export interface ScoreResult {
  stars: number;
  time: number;
  accuracy: number;
  coins: number;
  materials: MaterialReward[];
}