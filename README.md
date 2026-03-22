# Tiny Fixers

🎮 **[Play Now!](https://bigknoxy.github.io/tiny-fixers/)**

A cozy mobile puzzle game where you help quirky characters solve bite-sized problems. Built with TypeScript, Phaser 3, and Vite.

## Game Overview

**Tiny Fixers** is a one-thumb portrait mobile game featuring:
- 3 puzzle types: Sort, Untangle, and Pack
- 30 handcrafted levels with star-based scoring
- Meta progression with hub restoration
- Daily challenges with streak rewards
- PWA support for offline play

## Quick Start

### Install Dependencies

```bash
bun install
```

### Development Server

```bash
bun run dev
```

The game will be available at `http://localhost:3456`

### Build for Production

```bash
bun run build
```

### Preview Production Build

```bash
bun run preview
```

### Type Check

```bash
bun run typecheck
```

## Project Structure

```
TinyFixers/
├── docs/                    # Documentation
│   ├── PRD.md              # Product requirements
│   └── ARCHITECTURE.md     # Technical architecture
├── public/                  # Static assets
│   └── assets/
│       ├── icons/          # PWA icons
│       ├── sprites/        # Game sprites
│       ├── audio/          # Sound effects
│       └── fonts/          # Custom fonts
├── src/
│   ├── main.ts             # Entry point
│   ├── config/
│   │   ├── game.config.ts  # Game constants
│   │   ├── colors.ts       # Color palette
│   │   ├── assets.ts       # Asset registry
│   │   └── types.ts        # TypeScript types
│   ├── core/
│   │   ├── EventBus.ts     # Event system
│   │   └── StateManager.ts # Game state
│   ├── systems/
│   │   ├── AudioManager.ts # Sound management
│   │   ├── InputManager.ts # Input handling
│   │   └── Effects.ts      # Visual effects
│   ├── scenes/
│   │   ├── BootScene.ts    # Asset loading
│   │   ├── HomeScene.ts    # Main menu
│   │   ├── LevelSelectScene.ts
│   │   ├── GameScene.ts    # Gameplay
│   │   ├── ResultsScene.ts
│   │   ├── HubScene.ts     # Meta progression
│   │   └── SettingsScene.ts
│   ├── puzzles/
│   │   ├── BasePuzzle.ts   # Base class
│   │   ├── SortPuzzle.ts   # Sort mechanics
│   │   ├── UntanglePuzzle.ts
│   │   └── PackPuzzle.ts
│   └── data/
│       ├── levels.ts       # 30 level definitions
│       └── hub.ts          # Hub locations
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Game Features

### Puzzle Types

1. **Sort Puzzle** - Drag items into matching colored bins
2. **Untangle Puzzle** - Separate overlapping shapes
3. **Pack Puzzle** - Fit items into constrained spaces

### Meta Progression

- Restore 2 locations: Flower Shop and Tool Shed
- Each location has 3 restoration stages
- Earn coins and materials from levels
- Unlock new characters and decorations

### Daily System

- Daily rotating challenge
- 7-day streak rewards
- Increasing coin bonuses

## PWA Features

- Installable on mobile home screen
- Offline gameplay support
- Background/foreground state handling
- Cached core assets

## Google Play Store Packaging

To package for Google Play:

1. **Using PWA Builder (Recommended)**
   ```bash
   # Build the production version
   bun run build
   
   # Upload to pwabuilder.com
   # Generate signed APK
   ```

2. **Using Bubblewrap CLI**
   ```bash
   npm install -g @anthropic/bubblewrap
   bubblewrap init --manifest https://your-domain.com/manifest.json
   bubblewrap build
   ```

3. **Requirements**
   - Domain with HTTPS
   - Digital Asset Links file at `/.well-known/assetlinks.json`
   - Signed release APK

## Technical Stack

- **Runtime**: Bun
- **Framework**: Phaser 3
- **Build**: Vite
- **Language**: TypeScript
- **PWA**: vite-plugin-pwa

## Performance Targets

- 60 FPS on mid-range Android
- First load under 3 seconds
- Bundle size under 2MB gzipped
- Memory footprint under 100MB

## Development Notes

### Adding New Levels

Edit `src/data/levels.ts`:
```typescript
createSortLevel(
  'sort_31',           // Unique ID
  'Level Name',        // Display name
  'Description',       // Level description
  3,                   // Difficulty (1-5)
  bins,                // Bin configuration
  items,               // Items to sort
  60,                  // Time limit (seconds)
  25                   // Coin reward
)
```

### Adding New Hub Locations

Edit `src/data/hub.ts`:
```typescript
{
  id: 'new_location',
  name: 'New Location',
  description: 'Description',
  requiredStars: 20,
  stages: [...],
  rewards: [...]
}
```

### Audio Hooks

The game is set up for audio with placeholder hooks. Add audio files to `public/assets/audio/` and they will be loaded automatically.

## V2 Roadmap

- [ ] Additional puzzle types
- [ ] Character animations
- [ ] More hub locations
- [ ] Seasonal events
- [ ] Rewarded ads integration
- [ ] Cosmetic IAPs
- [ ] Cloud save sync
- [ ] Localization
- [ ] Leaderboards

## License

MIT License - See LICENSE file for details

## Credits

Built with ❤️ using Phaser 3, TypeScript, and Vite.
