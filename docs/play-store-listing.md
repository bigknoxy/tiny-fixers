# Tiny Fixers - Play Store Listing

## App Details

| Field | Value |
|-------|-------|
| **Title** | Tiny Fixers - Puzzle Game |
| **Short Description** | Help quirky characters fix tiny problems! |
| **Package Name** | `com.tinyfixers.app` |
| **Category** | Puzzle |
| **Content Rating** | Everyone |

---

## Full Description

Tiny Fixers is a cozy mobile puzzle game where you help quirky characters solve bite-sized problems!

**Features:**
- 30 handcrafted puzzle levels across 3 unique puzzle types
- **Sort** - Drag items to their matching colored bins
- **Untangle** - Separate tangled objects until none overlap
- **Pack** - Fit all items inside the box

**Why you'll love Tiny Fixers:**
- Relaxing, satisfying gameplay
- Beautiful warm color palette
- Perfect for short breaks or longer sessions
- Progressive difficulty that's challenging but fair
- No ads, no in-app purchases - just pure puzzle fun

**Perfect for fans of:**
- Casual puzzle games
- Brain teasers
- Relaxing mobile games
- Sort, pack, and untangle puzzles

Download now and start fixing tiny problems!

---

## Keywords

puzzle game, casual game, sort puzzle, pack puzzle, untangle, brain teaser, relaxing game, mobile puzzle, family game

---

## Store Assets Checklist

| Asset | Size | Status |
|-------|------|--------|
| App icon | 512x512 | ✅ Generated |
| Feature graphic | 1024x500 | ⚠️ Needs creation |
| Phone screenshots | 1080x1920 (2-8) | ⚠️ Needs creation |
| Tablet screenshots | 1920x1200 (optional) | ⚠️ Needs creation |

---

## Screenshots to Capture

1. **Home Screen** - Game logo with "Play" button
2. **Sort Puzzle** - Gameplay showing items being sorted
3. **Untangle Puzzle** - Gameplay showing tangled objects
4. **Pack Puzzle** - Gameplay showing items in box
5. **Level Select** - Grid of available levels
6. **Results Screen** - Star rating celebration

---

## Feature Graphic Text

```
TINY FIXERS
A Cozy Puzzle Game

🔧 Sort • Untangle • Pack 🔧
```

---

## Content Rating Questionnaire

- Violence: None
- Sexual content: None
- Language: None
- Controlled substances: None
- Gambling: None
- User interaction: None
- Data collection: Minimal (local storage only)

**Result:** Everyone (all ages)

---

## Privacy Policy URL

```
https://bigknoxy.github.io/tiny-fixers/privacy.html
```

---

## App Links

| Platform | URL |
|----------|-----|
| Web App | https://bigknoxy.github.io/tiny-fixers/ |
| GitHub | https://github.com/bigknoxy/tiny-fixers |

---

## Release Notes Template

```
Version X.X.X

NEW:
- [New features]

FIXED:
- [Bug fixes]

IMPROVED:
- [Performance improvements]
```

---

## TWA/APK Generation

### Option 1: PWA Builder (Recommended)
1. Go to https://pwabuilder.com
2. Enter URL: `https://bigknoxy.github.io/tiny-fixers/`
3. Click "Generate APK"
4. Download signed APK
5. Upload to Play Console

### Option 2: Bubblewrap CLI
```bash
npm install -g @anthropic/bubblewrap
bubblewrap init --manifest https://bigknoxy.github.io/tiny-fixers/manifest.webmanifest
bubblewrap build
```

---

## Digital Asset Links

When you have your signing key SHA-256 fingerprint, create:

**File:** `public/.well-known/assetlinks.json`
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.tinyfixers.app",
      "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT_HERE"]
    }
  }
]
```

### Generate Signing Key
```bash
keytool -genkey -v -keystore tinyfixers.keystore -alias tinyfixers -keyalg RSA -keysize 2048 -validity 10000
```

### Get SHA-256 Fingerprint
```bash
keytool -list -v -keystore tinyfixers.keystore -alias tinyfixers
```

---

## Checklist Before Submitting

- [ ] Test PWA install on mobile device
- [ ] Generate feature graphic (1024x500)
- [ ] Capture 2-8 phone screenshots
- [ ] Create signing key and get SHA-256 fingerprint
- [ ] Add assetlinks.json to public/.well-known/
- [ ] Build and test APK via PWA Builder
- [ ] Complete Play Console questionnaire
- [ ] Set pricing (Free)
- [ ] Select distribution countries
- [ ] Submit for review
