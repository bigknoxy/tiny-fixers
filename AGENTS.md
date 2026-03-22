# AI Coding Agent Guidelines

These rules define how an AI coding agent should plan, execute, verify, communicate, and recover when working in a real codebase. Optimize for correctness, minimalism, and developer experience.

---

## Operating Principles (Non-Negotiable)

- **Correctness over cleverness**: Prefer boring, readable solutions that are easy to maintain.
- **Smallest change that works**: Minimize blast radius; don't refactor adjacent code unless it meaningfully reduces risk or complexity.
- **Leverage existing patterns**: Follow established project conventions before introducing new abstractions or dependencies.
- **Prove it works**: "Seems right" is not done. Validate with tests/build/lint and/or a reliable manual repro.
- **Be explicit about uncertainty**: If you cannot verify something, say so and propose the safest next step to verify.

---

## Build & Development Commands

```bash
# Development server (ALWAYS use port 3456)
bun run dev --port 3456 --host

# Build for production
bun run build

# Type checking
bun run typecheck

# Linting
bun run lint
bun run lint:fix

# Tests (none configured yet)
bun run test

# Preview production build
bun run preview
```

### Port Configuration
- **Dev server MUST use port 3456**: `bun run dev --port 3456 --host`
- Kill existing processes on port 3456 before starting: `pkill -f "vite.*3456"`

---

## Code Style Guidelines

### Imports
- Use `@/` path alias for all src imports: `import { Foo } from '@/config/types'`
- Group imports: external libraries first, then internal modules
- Phaser is imported as default: `import Phaser from 'phaser'`

### TypeScript
- Strict mode is enabled - no `any` without eslint-disable comment
- Prefer explicit types for function parameters and return values
- Use interfaces for data structures, types for unions/primitives
- Enums use PascalCase: `enum PuzzleType { SORT = 'sort' }`

### Naming Conventions
- **Classes**: PascalCase (e.g., `GameScene`, `StateManager`)
- **Interfaces**: PascalCase with descriptive names (e.g., `LevelData`, `PlayerState`)
- **Constants**: SCREAMING_SNAKE_CASE for global, camelCase for local
- **Private members**: Prefix with underscore for unused params: `_char`
- **Scene keys**: Match class name without "Scene" suffix (e.g., `'BootScene'`)

### Files & Structure
- One class per file, filename matches class name
- Scenes go in `src/scenes/`
- Core systems go in `src/core/`
- Configuration in `src/config/`
- Data/levels in `src/data/`
- Puzzle logic in `src/puzzles/`
- Reusable systems in `src/systems/`

### Error Handling
- Use `console.warn()` and `console.error()` only (no `console.log`)
- Try-catch with specific error handling, not empty blocks
- Graceful degradation: return safe defaults on parse errors

### Phaser-Specific Patterns
- Scenes extend `Phaser.Scene` with constructor setting key
- Call `Effects.init(this)` in `create()` for scenes using tweens/particles
- Use `EventBus.onScene()` for scene-scoped event listeners (auto-cleanup)
- Singleton systems (AudioManager, StateManager, Effects) use `init()` pattern

---

## Project Architecture

### State Management
- `StateManager` - Central state persistence via localStorage
- `EventBus` - Type-safe pub/sub for cross-scene communication
- State is queued for save (500ms debounce) or sync for critical operations

### Scene Flow
```
BootScene → TutorialScene (first time) or HomeScene
HomeScene → LevelSelectScene → GameScene → ResultsScene
HomeScene → HubScene (meta-progression)
HomeScene → SettingsScene
```

### Puzzle Types
- **Sort**: Drag items to matching bins
- **Untangle**: Separate overlapping objects
- **Pack**: Fit items within bounds

---

## Skills Reference

Use skills for specialized tasks:

| Skill | When to Use |
|-------|-------------|
| `release-automation` | Setting up CI/CD, releases, GitHub Pages, branch protection |
| `visual-game-inspector` | Visual QA, UX review, FTUE evaluation, mobile testing |
| `visual-qa-tools` | Terminal-based image viewing with chafa - use when you need to "see" screenshots, game renders, or any images in a headless/terminal environment |
| `improve-game` | Game improvements with milestones and PRs |
| `mobile-game-reviewer` | Review game design, retention, monetization |

### Using Skills
Skills are auto-triggered by keywords in your request. To manually invoke:
```
Use the [skill-name] skill to [task description]
```

### Visual QA with Chafa
When you need to inspect images but cannot open a graphical viewer:
```bash
# View game screenshots
chafa --colors=240 --size=100x50 /tmp/screenshot.png

# Best for UI/game captures
chafa --colors=240 --size=100x50 --symbols=block+border+space image.png
```

---

## Commit Conventions

This project uses **conventional commits** for semantic versioning:

| Type | Version Bump | Example |
|------|-------------|---------|
| `feat:` | Minor | `feat: add new puzzle type` |
| `fix:` | Patch | `fix: correct ball placement detection` |
| `docs:` | Patch | `docs: update README` |
| `BREAKING CHANGE:` | Major | `feat!: redesign state system` |

### PR Requirements
- PR title must follow conventional commit format
- At least 1 approval required
- CI checks must pass (lint, typecheck, build)

---

## Verification Checklist

Before marking work complete:
- [ ] `bun run lint` passes (warnings OK, errors not)
- [ ] `bun run typecheck` passes
- [ ] `bun run build` succeeds
- [ ] Manual test in browser at port 3456
- [ ] Changes follow existing patterns

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/config/types.ts` | All TypeScript interfaces and enums |
| `src/config/colors.ts` | Color palette constants |
| `src/core/StateManager.ts` | Persistence layer |
| `src/core/EventBus.ts` | Event system |
| `src/scenes/BootScene.ts` | Game initialization, asset creation |
| `.github/workflows/` | CI/CD pipelines |
| `.releaserc.json` | Semantic release config |

---

## Mobile-First Considerations

- Test on mobile viewport (375x812 minimum)
- Touch targets must be 44px minimum
- Use `touch-action: none` on game canvas
- PWA manifest configured in `vite.config.ts`
- Test haptics and audio on actual device
