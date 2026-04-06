# Tamagotchi Improvements Design Spec

## Context

Tamago.ai is a working AI-powered tamagotchi web app with pixel art aesthetics, LLM-powered chat personality, and real-time stat management. The core game loop is solid but several areas need improvement:

- **Chat is broken**: LLM calls fail silently, returning only fallback responses (`*tilts head*`)
- **Single pet type**: No variety — every playthrough produces the same blob creature
- **UI feels cramped**: Stats, pet, and menu compete for limited LCD space; animations lack punch
- **Web-only**: No way to run it as a standalone desktop app

This spec covers four improvements delivered together: fix LLM chat, add a species system, polish UI/UX, and wrap in Electron.

---

## 1. Fix LLM Chat

### Problem

The API route (`src/app/api/chat/route.ts`) was configured with model `llama3.1` which doesn't exist on Ollama Cloud. We've already updated `.env.local` to use `gemma3:4b`. The remaining fix is the 10-second timeout — too short for cloud LLM inference.

### Changes

- **`src/app/api/chat/route.ts`**: Increase `AbortController` timeout from 10,000ms to 30,000ms
- **Verify** after dev server restart that chat returns real LLM responses, not fallbacks

### Files Modified

- `src/app/api/chat/route.ts` (timeout change)

---

## 2. Species System

### Architecture

Add a `species` field to `GameState` that determines which sprite set and personality bias the pet uses. Species is assigned randomly at hatch.

### Data Model

New file: `src/data/species.ts`

```typescript
interface Species {
  id: string;              // e.g. "blob", "cat", "mech"
  name: string;            // Display name: "Blob", "Cat", "Mech"
  description: string;     // Short flavor text
  traitBias: string[];     // 1-2 traits this species tends toward
  sprites: Record<EvolutionStageId, PixelSprite>; // Sprite per stage
  palette: {               // Species-specific color palette
    primary: string;
    secondary: string;
    accent: string;
  };
}
```

### Starting Species (3)

1. **Blob** (existing) — the current teal creature. Trait bias: `cheerful`, `playful`
2. **Cat** — feline pixel art across all 5 stages (egg, kitten, young cat, teen cat, regal cat). Trait bias: `independent`, `sassy`
3. **Mech** — robot/mechanical creature. Trait bias: `philosophical`, `independent`

### Integration Points

- **`src/types/index.ts`**: Add `species: string` to `GameState`
- **`src/lib/game-engine.ts`**: On `HATCH` action, randomly select species from available list
- **`src/components/pet/PetSprite.tsx`**: Look up sprite from species data instead of hardcoded arrays
- **`src/lib/personality.ts`**: Layer species trait bias into `deriveTraits()` scoring
- **`src/lib/prompts.ts`**: Include species name in system prompt for LLM flavor
- **`src/data/evolution-stages.ts`**: Fallback reactions can vary by species

### Extensibility

Adding a new species = adding one entry to the species array in `src/data/species.ts` with sprite definitions. No other files need changes.

### Files Modified

- `src/data/species.ts` (new)
- `src/types/index.ts`
- `src/lib/game-engine.ts`
- `src/components/pet/PetSprite.tsx`
- `src/lib/personality.ts`
- `src/lib/prompts.ts`
- `src/data/evolution-stages.ts`

---

## 3. UI/UX Polish

### Layout Improvements

**Pet display area**: Give the pet more vertical space. Currently stats and menu crowd the pet. Rework layout:

- **Top bar**: Pet name + stage icon + age (keep as-is, it's clean)
- **Pet area**: Expand to ~60% of screen height. Pet centered with mood particles
- **Stats**: Compact to a single row of 4 mini-bars (icon + thin bar, no numeric label unless hovered/selected). Place below pet area
- **Action menu**: Move to bottom of LCD. Keep the 5 actions but use a cleaner icon-focused layout with label only on the selected item

**Chat UI**: When chat drawer opens, it should feel like a full LCD takeover — not an overlay fighting the existing layout. Clean up bubble spacing, make input area more prominent.

### Animations & Feedback

- **Action particles**: When feeding, small food crumbs float up and fade. When cleaning, sparkle/bubble particles. When playing, star bursts. Reuse the existing `PetMood` particle system but with different shapes/colors per action
- **Stat change indicators**: When a stat changes, brief +/- number floats up from the stat bar (e.g. "+20" in green when fed)
- **Evolution**: Keep the flash animation but add a brief sprite morph/grow effect
- **Button press**: Scale bounce on press (0.95 -> 1.0) for more tactile feel
- **Menu transitions**: Slide transitions when opening submenus instead of instant swap

### Aesthetic Refinement

- **Stat bars**: Thinner, cleaner bars. Pulse more prominently when critical (<20). Consider replacing abbreviated labels (HNG, HAP) with small icons
- **Scanlines**: Make more subtle — currently slightly distracting
- **Chat bubbles**: Add slight rounded corners, better padding, distinguish pet/user more clearly
- **Typography**: Ensure consistent sizing — some elements feel crowded at the pixel font size

### Files Modified

- `src/components/hud/StatBars.tsx` (compact layout, stat change indicators)
- `src/components/pet/PetSprite.tsx` (species-aware, larger display)
- `src/components/pet/PetMood.tsx` (action particles reuse)
- `src/components/actions/ActionMenu.tsx` (cleaner layout)
- `src/components/actions/ActionFeedback.tsx` (particle effects, stat popups)
- `src/components/chat/ChatDrawer.tsx` (full-LCD takeover, better spacing)
- `src/components/chat/ChatBubble.tsx` (styling refinement)
- `src/components/device/Screen.tsx` (layout restructure)
- `src/app/globals.css` (animation keyframes, spacing, scanline tuning)

---

## 4. Electron Packaging

### Architecture

Next.js builds to standalone output. Electron loads the built app locally — no external server needed at runtime. The API route (LLM calls) runs within the Electron process's Node.js environment.

### Setup

- **`electron/main.ts`**: Electron main process — creates BrowserWindow, loads Next.js build, manages lifecycle
- **`electron/preload.ts`**: Preload script for secure IPC if needed
- **`electron/tray.ts`**: System tray icon with menu (Feed, Check Stats, Quit)
- **`package.json`**: Add electron, electron-builder dev deps; add `electron:dev` and `electron:build` scripts

### Window Configuration

- Fixed window size matching the tamagotchi device proportions (~420x700)
- Frameless window option with the egg-shaped shell as the chrome
- Always-on-top toggle (so pet sits on your desktop)
- Minimize to system tray instead of closing

### Desktop Notifications

- Push native OS notifications when stats are critical (hunger < 15, happiness < 15)
- Notification frequency capped (no spam — max once per 5 minutes per stat)
- Click notification to bring window to front

### Build & Distribution

- `electron-builder` for packaging
- macOS: `.dmg` with drag-to-Applications installer
- Windows: `.exe` installer (optional, if cross-platform desired)
- App icon: tamagotchi egg icon at required sizes (16, 32, 64, 128, 256, 512)

### Files Created

- `electron/main.ts` (new)
- `electron/preload.ts` (new)
- `electron/tray.ts` (new)
- `electron-builder.config.js` (new)
- `package.json` (modified — new deps and scripts)
- `next.config.ts` (modified — standalone output)

---

## Verification Plan

### Chat Fix

1. Restart dev server
2. Open chat, send a message
3. Confirm response is NOT `*tilts head*` or `*blinks*` — should be a contextual LLM response
4. Send multiple messages, confirm variety in responses

### Species System

1. Hatch a new pet — confirm species is randomly selected and displayed in pet info
2. Verify correct sprites render for each species at each evolution stage
3. Confirm personality traits reflect species bias after sufficient interactions
4. Hatch several pets to confirm randomization works

### UI/UX Polish

1. Visual check: pet has more breathing room on screen
2. Feed the pet — confirm food particle animation and stat change popup
3. Open chat — confirm full-LCD takeover with clean bubble layout
4. Let stats drop to critical — confirm pulsing/warning visuals
5. Trigger evolution — confirm smooth transition animation

### Electron App

1. Run `npm run electron:dev` — confirm app launches in a desktop window
2. Verify game plays identically to browser version
3. Check system tray icon appears with menu
4. Let stats go critical — confirm desktop notification fires
5. Run `npm run electron:build` — confirm `.dmg` (or `.exe`) is generated
6. Install from built package and verify it runs standalone
