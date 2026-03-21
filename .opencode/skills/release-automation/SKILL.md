---
name: release-automation
description: Set up automated CI/CD with semantic versioning, GitHub releases, and GitHub Pages deployment for TinyFixers. Use when the user wants to set up releases, CI/CD, versioning, deployment, or automate their release pipeline. Also use when they mention "protected branches", "semantic release", "GitHub Pages", "auto versioning", or "release workflow".
---

# Release Automation for TinyFixers

This skill sets up a complete CI/CD pipeline with semantic versioning and automated deployments for Phaser/Vite/Bun projects.

## What this skill does

1. **Branch Protection** - Protects `main` with required PRs and CI checks
2. **CI Workflow** - Lint, typecheck, build on every PR/push
3. **PR Validation** - Enforces conventional commit format for PR titles
4. **Release Workflow** - Semantic versioning with auto GitHub releases
5. **GitHub Pages** - Auto-deploy on successful releases

## Prerequisites

- GitHub repository (remote origin configured)
- `gh` CLI authenticated with appropriate permissions
- Bun + Vite + TypeScript project
- Existing `package.json` with build/lint/typecheck scripts

## Workflow

### Step 1: Install dependencies

Add semantic-release and related packages:

```bash
bun add -D semantic-release @semantic-release/changelog @semantic-release/git conventional-changelog-conventionalcommits
bun add -D @commitlint/cli @commitlint/config-conventional husky
bun add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint
bun add -D typedoc
```

### Step 2: Update package.json

Ensure package.json has:
- `version: "0.0.0-development"` (semantic-release manages versions)
- Scripts: `lint`, `typecheck`, `build`, `docs`
- Repository, author, license, homepage fields
- `bun run lint` should use eslint with TypeScript config

### Step 3: Create configuration files

**`.eslintrc.json`** - TypeScript ESLint config
**`.releaserc.json`** - Semantic release config (simplified for protected branches)
**`commitlint.config.json`** - Conventional commits enforcement
**`typedoc.json`** - API documentation config

### Step 4: Create GitHub workflows

Create `.github/workflows/` directory with:

**`ci.yml`** - Runs on push to main and PRs
- lint job
- typecheck job
- build job (depends on lint + typecheck)

**`pr.yml`** - Runs on PR events
- validate-pr-title job (semantic PR titles)
- lint, typecheck, build jobs

**`release.yml`** - Runs on push to main
- lint, typecheck, build jobs
- release job (semantic-release)
- deploy job (GitHub Pages)

### Step 5: Set up branch protection

Use `gh api` to configure:
- Required status checks: lint, typecheck, build
- Required PR reviews (1 approval)
- Dismiss stale reviews
- `enforce_admins: false` (allows admin to bypass)

### Step 6: Enable GitHub Pages

Use `gh api` to create Pages site with `build_type: workflow`.

### Step 7: Create initial PR

1. Create feature branch
2. Commit with conventional commit message
3. Push and create PR
4. Verify CI passes
5. Merge PR
6. Watch release workflow create v1.0.0

## Key configuration patterns

### Semantic Release Config (Protected Branches)

When using protected branches, semantic-release cannot push back to main. Use a simplified config:

```json
{
  "branches": ["main"],
  "plugins": [
    ["@semantic-release/commit-analyzer", { "preset": "conventionalcommits" }],
    ["@semantic-release/release-notes-generator", { "preset": "conventionalcommits" }],
    ["@semantic-release/npm", { "npmPublish": false }],
    ["@semantic-release/github", { "assets": [{ "path": "dist/**", "label": "Build" }] }]
  ]
}
```

For full changelog updates in-repo, create a PAT with repo permissions and add as `GH_TOKEN` secret, then include:
```json
["@semantic-release/changelog", { "changelogFile": "CHANGELOG.md" }],
["@semantic-release/git", { "assets": ["package.json", "CHANGELOG.md"] }]
```

### Commit Message Format

- `feat:` → minor version bump
- `fix:` → patch version bump
- `BREAKING CHANGE:` or `feat!:` → major version bump

### PR Title Format

PR titles must follow conventional commits:
- `feat: add feature`
- `fix: resolve bug`
- `docs: update readme`

## Verification

After setup, verify:
1. PR checks appear and pass
2. Merge triggers release workflow
3. GitHub Release is created with notes
4. GitHub Pages deploys successfully
5. App is accessible at `https://<user>.github.io/<repo>/`

## Troubleshooting

**Release fails with "protected branch" error:**
- Ensure `enforce_admins: false` in branch protection
- Or remove `@semantic-release/git` plugin from releaserc

**CI checks not appearing:**
- Workflow files must be on main branch first
- Check workflow syntax with `gh workflow view`

**Pages not deploying:**
- Ensure Pages is enabled with `build_type: workflow`
- Check deploy job permissions in release.yml

## Files to create

Use the templates in `scripts/` directory:

| Template | Output Path |
|----------|-------------|
| `scripts/ci.yml.template` | `.github/workflows/ci.yml` |
| `scripts/pr.yml.template` | `.github/workflows/pr.yml` |
| `scripts/release.yml.template` | `.github/workflows/release.yml` |
| `scripts/eslintrc.json.template` | `.eslintrc.json` |
| `scripts/releaserc.json.template` | `.releaserc.json` |
| `scripts/commitlint.config.json.template` | `commitlint.config.json` |
| `scripts/typedoc.json.template` | `typedoc.json` |

## References

- `references/github-api.md` - GitHub API commands for branch protection and Pages setup
