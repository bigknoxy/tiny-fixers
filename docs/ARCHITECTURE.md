# Tiny Fixers - Technical Architecture

## Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Language | TypeScript | Type safety, IDE support, maintainability |
| Build Tool | Vite | Fast dev server, ESM-native, PWA plugin |
| Game Engine | Phaser 3 | Mature, mobile-optimized, 2D-focused |
| Package Manager | Bun | Fast installs, native TypeScript |
| PWA | vite-plugin-pwa | Integrated manifest + service worker |
| Storage | localStorage + IndexedDB | Offline persistence |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        PWA Shell                             │
│  (Service Worker, Manifest, Cache, Background Handler)      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Game Application                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Scene       │  │ State        │  │ Event Bus        │   │
│  │ Manager     │◄─┤ Manager      │◄─┤ (Pub/Sub)        │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│         │                 │                    │            │
│         ▼                 ▼                    ▼            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Scenes                            │   │
│  │  Boot │ Home │ LevelSelect │ Game │ Results │ Hub   │   │
│  └─────────────────────────────────────────────────────┘   │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Systems                            │   │
│  │ Audio │ Input │ Save │ Analytics │ Effects │ Time   │   │
│  └─────────────────────────────────────────────────────┘   │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Puzzles                            │   │
│  │  SortEngine │ UntangleEngine │ PackEngine            │   │
│  └─────────────────────────────────────────────────────┘   │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Data Layer                         │   │
│  │ Levels │ Progress │ Settings │ Economy │ Daily      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Modules

### 1. Scene Manager
**Purpose:** Control scene lifecycle and transitions

```typescript
interface SceneManager {
  currentScene: Scene | null;
  scenes: Map<string, Scene>;
  
  register(name: string, scene: Scene): void;
  switchTo(name: string, data?: object): void;
  pause(): void;
  resume(): void;
}
```

**Scenes:**
- `BootScene` - Asset loading, initialization
- `HomeScene` - Main menu
- `LevelSelectScene` - Level map
- `GameScene` - Puzzle gameplay
- `ResultsScene` - End-level summary
- `HubScene` - Restoration meta
- `SettingsScene` - Options

### 2. State Manager
**Purpose:** Centralized state with persistence

```typescript
interface GameState {
  player: PlayerState;
  progress: ProgressState;
  settings: SettingsState;
  economy: EconomyState;
  daily: DailyState;
}

interface StateManager {
  state: GameState;
  load(): Promise<void>;
  save(): Promise<void>;
  reset(): void;
  subscribe(key: string, callback: Function): void;
}
```

### 3. Input Manager
**Purpose:** Abstract touch/mouse input

```typescript
interface InputManager {
  enabled: boolean;
  
  onPointerDown: Signal;
  onPointerMove: Signal;
  onPointerUp: Signal;
  
  getPointerPosition(): Vector2;
  isPointerDown(): boolean;
  vibrate(duration: number): void;
}
```

### 4. Audio Manager
**Purpose:** Sound effects and music with muting

```typescript
interface AudioManager {
  muted: boolean;
  musicVolume: number;
  sfxVolume: number;
  
  playSound(key: string): void;
  playMusic(key: string): void;
  stopMusic(): void;
  setMuted(muted: boolean): void;
}
```

### 5. Save Manager
**Purpose:** Persistent storage abstraction

```typescript
interface SaveManager {
  save(key: string, data: any): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

### 6. Analytics Interface
**Purpose:** Event tracking abstraction

```typescript
interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
  timestamp: number;
}

interface Analytics {
  track(event: string, params?: object): void;
  setUserId(id: string): void;
  flush(): void;
}
```

### 7. Effects System
**Purpose:** Visual juice (particles, tweens, shake)

```typescript
interface Effects {
  particles(x: number, y: number, config: ParticleConfig): void;
  shake(intensity: number, duration: number): void;
  flash(target: GameObject, color: number): void;
  bounce(target: GameObject): void;
  popIn(target: GameObject): void;
}
```

---

## Puzzle Engine Architecture

### Base Puzzle Interface

```typescript
interface PuzzleEngine {
  type: PuzzleType;
  level: LevelData;
  container: Phaser.GameObjects.Container;
  
  init(level: LevelData): void;
  update(delta: number): void;
  checkWin(): boolean;
  getScore(): ScoreResult;
  destroy(): void;
}
```

### Puzzle Types

```typescript
enum PuzzleType {
  SORT = 'sort',
  UNTANGLE = 'untangle',
  PACK = 'pack'
}

interface SortConfig {
  bins: BinData[];
  items: ItemData[];
  timeLimit: number;
}

interface UntangleConfig {
  objects: UntangleObject[];
  timeLimit: number;
}

interface PackConfig {
  bounds: Rectangle;
  items: PackItem[];
  timeLimit: number;
}
```

---

## Data Structures

### Level Data

```typescript
interface LevelData {
  id: string;
  name: string;
  type: PuzzleType;
  difficulty: number;
  config: SortConfig | UntangleConfig | PackConfig;
  rewards: RewardConfig;
  requiredStars?: number;
}
```

### Player State

```typescript
interface PlayerState {
  id: string;
  createdAt: number;
  lastPlayedAt: number;
}

interface ProgressState {
  completedLevels: Map<string, LevelProgress>;
  totalStars: number;
  hubProgress: Map<string, HubLocationState>;
  unlockedPuzzles: string[];
}

interface LevelProgress {
  stars: number;
  bestTime: number;
  completedAt: number;
}

interface EconomyState {
  coins: number;
  materials: Map<MaterialType, number>;
}
```

---

## File Structure

```
TinyFixers/
├── public/
│   ├── assets/
│   │   ├── sprites/       # Game sprites
│   │   ├── audio/         # Sound effects
│   │   ├── fonts/         # Custom fonts
│   │   └── icons/         # PWA icons
│   ├── manifest.json      # PWA manifest
│   └── favicon.ico
├── src/
│   ├── main.ts            # Entry point
│   ├── config/
│   │   ├── game.config.ts # Game constants
│   │   ├── colors.ts      # Color palette
│   │   └── assets.ts      # Asset registry
│   ├── core/
│   │   ├── Game.ts        # Main game class
│   │   ├── SceneManager.ts
│   │   ├── StateManager.ts
│   │   └── EventBus.ts
│   ├── systems/
│   │   ├── AudioManager.ts
│   │   ├── InputManager.ts
│   │   ├── SaveManager.ts
│   │   ├── Analytics.ts
│   │   └── Effects.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── HomeScene.ts
│   │   ├── LevelSelectScene.ts
│   │   ├── GameScene.ts
│   │   ├── ResultsScene.ts
│   │   ├── HubScene.ts
│   │   └── SettingsScene.ts
│   ├── puzzles/
│   │   ├── PuzzleEngine.ts
│   │   ├── SortPuzzle.ts
│   │   ├── UntanglePuzzle.ts
│   │   └── PackPuzzle.ts
│   ├── ui/
│   │   ├── components/    # Reusable UI components
│   │   └── layouts/       # Screen layouts
│   ├── data/
│   │   ├── levels.ts      # Level definitions
│   │   ├── hub.ts         # Hub location data
│   │   ├── characters.ts  # Character data
│   │   └── achievements.ts
│   └── utils/
│       ├── math.ts
│       ├── random.ts
│       └── format.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## PWA Configuration

### Manifest

```json
{
  "name": "Tiny Fixers",
  "short_name": "TinyFixers",
  "description": "Help quirky characters solve bite-sized puzzles",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#4A90D9",
  "theme_color": "#4A90D9",
  "icons": [...]
}
```

### Service Worker
- Cache-first for static assets
- Network-first for dynamic content (future)
- Offline gameplay enabled
- Background sync placeholder

---

## Performance Optimizations

1. **Asset Loading**
   - Progressive loading in BootScene
   - Texture atlases for sprites
   - Audio sprites for sound effects

2. **Rendering**
   - Object pooling for particles
   - Culling off-screen objects
   - Limit draw calls

3. **Memory**
   - Dispose unused textures
   - Clear scene data on transition
   - Limit particle count

4. **Bundle Size**
   - Tree shaking
   - Code splitting by scene
   - Minification

---

## Future Wrapping (Google Play)

### Approach
1. **TWA (Trusted Web Activity)**
   - Use Bubblewrap or PWA Builder
   - Play Store distribution
   - No code changes required

2. **Considerations**
   - Splash screen branding
   - Navigation handling
   - Update mechanism

### Files to Prepare
- `assetlinks.json` for TWA verification
- Signed APK generation config
- Play Store assets (icons, screenshots)

---

## Testing Strategy

1. **Unit Tests** (Bun test)
   - State management
   - Puzzle logic
   - Score calculation

2. **Integration Tests**
   - Scene transitions
   - Save/load flow
   - Level completion

3. **Manual Testing Checklist**
   - Touch responsiveness
   - Offline functionality
   - PWA installation
   - Background/resume
   - Various screen sizes
