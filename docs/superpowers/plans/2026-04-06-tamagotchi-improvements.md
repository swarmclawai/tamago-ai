# Tamagotchi Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix broken LLM chat, add multiple pet species with unique pixel art, polish UI/UX (layout, animations, feedback), and package as an Electron desktop app.

**Architecture:** Layered approach — fix chat first (quick win), then add the species data system, refactor UI components for better layout and polish, and finally wrap everything in Electron. Species are data-driven (one file to add a new species). Electron loads Next.js standalone build locally.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, TypeScript 5, Ollama Cloud API (gemma3:4b), Electron + electron-builder

---

## File Map

**New files:**
- `src/data/species.ts` — species definitions (sprites, palettes, trait biases)
- `electron/main.ts` — Electron main process
- `electron/preload.ts` — Electron preload script
- `electron/tray.ts` — system tray icon and menu
- `electron-builder.config.js` — build/packaging config

**Modified files:**
- `src/app/api/chat/route.ts` — increase timeout
- `src/hooks/useGameState.tsx` — increase client-side timeout
- `src/types/index.ts` — add species to GameState
- `src/lib/game-engine.ts` — random species on HATCH
- `src/components/pet/PetSprite.tsx` — species-aware sprite lookup
- `src/lib/personality.ts` — species trait bias in deriveTraits
- `src/lib/prompts.ts` — include species in system prompt
- `src/components/hud/StatBars.tsx` — compact icon-based layout
- `src/components/pet/PetMood.tsx` — action particle support
- `src/components/actions/ActionFeedback.tsx` — stat change popups + particles
- `src/components/chat/ChatDrawer.tsx` — cleaner full-LCD layout
- `src/components/chat/ChatBubble.tsx` — better styling
- `src/components/chat/ChatInput.tsx` — more prominent input
- `src/components/device/Screen.tsx` — layout spacing
- `src/app/play/page.tsx` — pass species prop, layout restructure
- `src/app/globals.css` — new animations, refined scanlines, stat icons
- `src/components/hud/PetInfo.tsx` — show species name
- `package.json` — add electron deps and scripts
- `next.config.ts` — standalone output for Electron

---

## Task 1: Fix LLM Chat Timeout

**Files:**
- Modify: `src/app/api/chat/route.ts:33`
- Modify: `src/hooks/useGameState.tsx:61`

- [ ] **Step 1: Increase server-side timeout**

In `src/app/api/chat/route.ts`, change line 33:

```typescript
// Before:
const timeout = setTimeout(() => controller.abort(), 10_000);

// After:
const timeout = setTimeout(() => controller.abort(), 30_000);
```

- [ ] **Step 2: Increase client-side action reaction timeout**

In `src/hooks/useGameState.tsx`, change line 61:

```typescript
// Before:
signal: AbortSignal.timeout(10_000),

// After:
signal: AbortSignal.timeout(30_000),
```

- [ ] **Step 3: Verify chat works**

Run: `npm run dev`

Open browser, navigate to `/play`, hatch a pet, open Talk, send "Hello". Confirm the response is NOT `*tilts head*` or `*blinks*` — it should be a contextual LLM response from the pet's personality.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/chat/route.ts src/hooks/useGameState.tsx
git commit -m "fix: increase LLM timeout to 30s for Ollama Cloud"
```

---

## Task 2: Add Species Types and Data

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/data/species.ts`
- Modify: `src/data/evolution-stages.ts`

- [ ] **Step 1: Add species type and update GameState**

In `src/types/index.ts`, add the species type after the `PlayActivity` interface (after line 145):

```typescript
// --- Species ---
export interface SpeciesDefinition {
  id: string;
  name: string;
  description: string;
  traitBias: PersonalityTrait[];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  sprites: Record<EvolutionStage, SpritePixel[]>;
}

export type SpritePixel = [number, number, string]; // [x, y, color]
```

Add `species` to the `pet` object in `GameState` (after line 87, the `name` field):

```typescript
// Before:
pet: {
    name: string;
    stats: PetStats;

// After:
pet: {
    name: string;
    species: string;
    stats: PetStats;
```

- [ ] **Step 2: Create species data file with 3 species**

Create `src/data/species.ts`:

```typescript
import type { SpeciesDefinition } from "@/types";

export const SPECIES: SpeciesDefinition[] = [
  {
    id: "blob",
    name: "Blob",
    description: "A squishy, cheerful creature",
    traitBias: ["cheerful", "playful"],
    palette: { primary: "#4a9", secondary: "#5cb", accent: "#f9a" },
    sprites: {
      egg: [
        [3, 0, "#f5f5dc"], [4, 0, "#f5f5dc"], [5, 0, "#f5f5dc"],
        [2, 1, "#f5f5dc"], [3, 1, "#fffacd"], [4, 1, "#fffacd"], [5, 1, "#fffacd"], [6, 1, "#f5f5dc"],
        [1, 2, "#f5f5dc"], [2, 2, "#fffacd"], [3, 2, "#fffacd"], [4, 2, "#fff"], [5, 2, "#fffacd"], [6, 2, "#fffacd"], [7, 2, "#f5f5dc"],
        [1, 3, "#f5f5dc"], [2, 3, "#fffacd"], [3, 3, "#fffacd"], [4, 3, "#fffacd"], [5, 3, "#fffacd"], [6, 3, "#fffacd"], [7, 3, "#f5f5dc"],
        [1, 4, "#f5f5dc"], [2, 4, "#fffacd"], [3, 4, "#fffacd"], [4, 4, "#fffacd"], [5, 4, "#fffacd"], [6, 4, "#fffacd"], [7, 4, "#f5f5dc"],
        [2, 5, "#f5f5dc"], [3, 5, "#f5f5dc"], [4, 5, "#f5f5dc"], [5, 5, "#f5f5dc"], [6, 5, "#f5f5dc"],
        [3, 6, "#f5f5dc"], [4, 6, "#f5f5dc"], [5, 6, "#f5f5dc"],
      ],
      baby: [
        [3, 0, "#4a9"], [4, 0, "#4a9"], [5, 0, "#4a9"],
        [2, 1, "#4a9"], [3, 1, "#5cb"], [4, 1, "#5cb"], [5, 1, "#5cb"], [6, 1, "#4a9"],
        [1, 2, "#4a9"], [2, 2, "#5cb"], [3, 2, "#5cb"], [4, 2, "#5cb"], [5, 2, "#5cb"], [6, 2, "#5cb"], [7, 2, "#4a9"],
        [1, 3, "#4a9"], [2, 3, "#5cb"], [3, 3, "#222"], [4, 3, "#5cb"], [5, 3, "#222"], [6, 3, "#5cb"], [7, 3, "#4a9"],
        [1, 4, "#4a9"], [2, 4, "#f9a"], [3, 4, "#5cb"], [4, 4, "#5cb"], [5, 4, "#5cb"], [6, 4, "#f9a"], [7, 4, "#4a9"],
        [2, 5, "#4a9"], [3, 5, "#5cb"], [4, 5, "#4a9"], [5, 5, "#5cb"], [6, 5, "#4a9"],
        [2, 6, "#4a9"], [3, 6, "#4a9"], [5, 6, "#4a9"], [6, 6, "#4a9"],
      ],
      child: [
        [3, 0, "#4a9"], [5, 0, "#4a9"],
        [2, 1, "#4a9"], [3, 1, "#5cb"], [4, 1, "#5cb"], [5, 1, "#5cb"], [6, 1, "#4a9"],
        [1, 2, "#4a9"], [2, 2, "#5cb"], [3, 2, "#5cb"], [4, 2, "#5cb"], [5, 2, "#5cb"], [6, 2, "#5cb"], [7, 2, "#4a9"],
        [1, 3, "#4a9"], [2, 3, "#5cb"], [3, 3, "#222"], [4, 3, "#5cb"], [5, 3, "#222"], [6, 3, "#5cb"], [7, 3, "#4a9"],
        [1, 4, "#4a9"], [2, 4, "#5cb"], [3, 4, "#fff"], [4, 4, "#5cb"], [5, 4, "#fff"], [6, 4, "#5cb"], [7, 4, "#4a9"],
        [2, 5, "#4a9"], [3, 5, "#5cb"], [4, 5, "#3a8"], [5, 5, "#5cb"], [6, 5, "#4a9"],
        [2, 6, "#4a9"], [3, 6, "#5cb"], [4, 6, "#5cb"], [5, 6, "#5cb"], [6, 6, "#4a9"],
        [2, 7, "#4a9"], [3, 7, "#5cb"], [4, 7, "#5cb"], [5, 7, "#5cb"], [6, 7, "#4a9"],
        [2, 8, "#3a8"], [3, 8, "#3a8"], [5, 8, "#3a8"], [6, 8, "#3a8"],
      ],
      teen: [
        [3, 0, "#3a8"], [4, 0, "#3a8"], [5, 0, "#3a8"],
        [2, 0, "#3a8"], [6, 0, "#3a8"],
        [2, 1, "#4a9"], [3, 1, "#5cb"], [4, 1, "#5cb"], [5, 1, "#5cb"], [6, 1, "#4a9"],
        [1, 2, "#4a9"], [2, 2, "#5cb"], [3, 2, "#5cb"], [4, 2, "#5cb"], [5, 2, "#5cb"], [6, 2, "#5cb"], [7, 2, "#4a9"],
        [1, 3, "#4a9"], [2, 3, "#5cb"], [3, 3, "#111"], [4, 3, "#5cb"], [5, 3, "#111"], [6, 3, "#5cb"], [7, 3, "#4a9"],
        [2, 4, "#4a9"], [3, 4, "#5cb"], [4, 4, "#5cb"], [5, 4, "#3a8"], [6, 4, "#4a9"],
        [2, 5, "#3a8"], [3, 5, "#4a9"], [4, 5, "#4a9"], [5, 5, "#4a9"], [6, 5, "#3a8"],
        [2, 6, "#3a8"], [3, 6, "#4a9"], [4, 6, "#4a9"], [5, 6, "#4a9"], [6, 6, "#3a8"],
        [2, 7, "#3a8"], [3, 7, "#4a9"], [4, 7, "#4a9"], [5, 7, "#4a9"], [6, 7, "#3a8"],
        [2, 8, "#3a8"], [3, 8, "#3a8"], [5, 8, "#3a8"], [6, 8, "#3a8"],
        [2, 9, "#297"], [3, 9, "#297"], [5, 9, "#297"], [6, 9, "#297"],
      ],
      adult: [
        [4, 0, "#fd0"],
        [3, 0, "#fd0"], [5, 0, "#fd0"],
        [2, 1, "#fd0"], [3, 1, "#fd0"], [4, 1, "#fd0"], [5, 1, "#fd0"], [6, 1, "#fd0"],
        [2, 2, "#4a9"], [3, 2, "#5cb"], [4, 2, "#5cb"], [5, 2, "#5cb"], [6, 2, "#4a9"],
        [1, 3, "#4a9"], [2, 3, "#5cb"], [3, 3, "#5cb"], [4, 3, "#5cb"], [5, 3, "#5cb"], [6, 3, "#5cb"], [7, 3, "#4a9"],
        [1, 4, "#4a9"], [2, 4, "#5cb"], [3, 4, "#222"], [4, 4, "#5cb"], [5, 4, "#222"], [6, 4, "#5cb"], [7, 4, "#4a9"],
        [1, 5, "#4a9"], [2, 5, "#5cb"], [3, 5, "#fff"], [4, 5, "#5cb"], [5, 5, "#fff"], [6, 5, "#5cb"], [7, 5, "#4a9"],
        [2, 6, "#4a9"], [3, 6, "#5cb"], [4, 6, "#3a8"], [5, 6, "#5cb"], [6, 6, "#4a9"],
        [1, 7, "#3a8"], [2, 7, "#4a9"], [3, 7, "#5cb"], [4, 7, "#5cb"], [5, 7, "#5cb"], [6, 7, "#4a9"], [7, 7, "#3a8"],
        [1, 8, "#3a8"], [2, 8, "#4a9"], [3, 8, "#4a9"], [4, 8, "#5cb"], [5, 8, "#4a9"], [6, 8, "#4a9"], [7, 8, "#3a8"],
        [2, 9, "#297"], [3, 9, "#297"], [5, 9, "#297"], [6, 9, "#297"],
      ],
    },
  },
  {
    id: "cat",
    name: "Cat",
    description: "A sassy, independent feline",
    traitBias: ["independent", "sassy"],
    palette: { primary: "#e87", secondary: "#fa9", accent: "#c55" },
    sprites: {
      egg: [
        [3, 0, "#ffe4c4"], [4, 0, "#ffe4c4"], [5, 0, "#ffe4c4"],
        [2, 1, "#ffe4c4"], [3, 1, "#fff0db"], [4, 1, "#fff0db"], [5, 1, "#fff0db"], [6, 1, "#ffe4c4"],
        [1, 2, "#ffe4c4"], [2, 2, "#fff0db"], [3, 2, "#fff0db"], [4, 2, "#fff"], [5, 2, "#fff0db"], [6, 2, "#fff0db"], [7, 2, "#ffe4c4"],
        [1, 3, "#ffe4c4"], [2, 3, "#fff0db"], [3, 3, "#fff0db"], [4, 3, "#fff0db"], [5, 3, "#fff0db"], [6, 3, "#fff0db"], [7, 3, "#ffe4c4"],
        [1, 4, "#ffe4c4"], [2, 4, "#fff0db"], [3, 4, "#fff0db"], [4, 4, "#fff0db"], [5, 4, "#fff0db"], [6, 4, "#fff0db"], [7, 4, "#ffe4c4"],
        [2, 5, "#ffe4c4"], [3, 5, "#ffe4c4"], [4, 5, "#ffe4c4"], [5, 5, "#ffe4c4"], [6, 5, "#ffe4c4"],
        [3, 6, "#ffe4c4"], [4, 6, "#ffe4c4"], [5, 6, "#ffe4c4"],
      ],
      baby: [
        // Ears
        [2, 0, "#e87"], [6, 0, "#e87"],
        [2, 1, "#fa9"], [3, 1, "#fa9"], [4, 1, "#fa9"], [5, 1, "#fa9"], [6, 1, "#fa9"],
        [1, 2, "#e87"], [2, 2, "#fa9"], [3, 2, "#fa9"], [4, 2, "#fa9"], [5, 2, "#fa9"], [6, 2, "#fa9"], [7, 2, "#e87"],
        // Eyes
        [1, 3, "#e87"], [2, 3, "#fa9"], [3, 3, "#222"], [4, 3, "#fa9"], [5, 3, "#222"], [6, 3, "#fa9"], [7, 3, "#e87"],
        // Mouth + whisker dots
        [1, 4, "#e87"], [2, 4, "#fa9"], [3, 4, "#fa9"], [4, 4, "#c55"], [5, 4, "#fa9"], [6, 4, "#fa9"], [7, 4, "#e87"],
        // Body
        [2, 5, "#e87"], [3, 5, "#fa9"], [4, 5, "#fa9"], [5, 5, "#fa9"], [6, 5, "#e87"],
        // Paws + tail
        [2, 6, "#e87"], [3, 6, "#e87"], [5, 6, "#e87"], [6, 6, "#e87"], [7, 6, "#c55"],
      ],
      child: [
        // Pointy ears
        [2, 0, "#e87"], [3, 0, "#fa9"], [5, 0, "#fa9"], [6, 0, "#e87"],
        [2, 1, "#e87"], [3, 1, "#fa9"], [4, 1, "#fa9"], [5, 1, "#fa9"], [6, 1, "#e87"],
        [1, 2, "#e87"], [2, 2, "#fa9"], [3, 2, "#fa9"], [4, 2, "#fa9"], [5, 2, "#fa9"], [6, 2, "#fa9"], [7, 2, "#e87"],
        // Slit eyes
        [1, 3, "#e87"], [2, 3, "#fa9"], [3, 3, "#2a2"], [4, 3, "#fa9"], [5, 3, "#2a2"], [6, 3, "#fa9"], [7, 3, "#e87"],
        [1, 4, "#e87"], [2, 4, "#fa9"], [3, 4, "#fa9"], [4, 4, "#c55"], [5, 4, "#fa9"], [6, 4, "#fa9"], [7, 4, "#e87"],
        // Body
        [2, 5, "#e87"], [3, 5, "#fa9"], [4, 5, "#fa9"], [5, 5, "#fa9"], [6, 5, "#e87"],
        [2, 6, "#e87"], [3, 6, "#fa9"], [4, 6, "#fff"], [5, 6, "#fa9"], [6, 6, "#e87"],
        // Paws + curled tail
        [2, 7, "#c55"], [3, 7, "#c55"], [5, 7, "#c55"], [6, 7, "#c55"],
        [7, 5, "#c55"], [8, 4, "#c55"], [8, 5, "#c55"],
      ],
      teen: [
        // Tall ears
        [2, 0, "#d76"], [6, 0, "#d76"],
        [2, 1, "#e87"], [3, 1, "#fa9"], [5, 1, "#fa9"], [6, 1, "#e87"],
        [1, 2, "#e87"], [2, 2, "#fa9"], [3, 2, "#fa9"], [4, 2, "#fa9"], [5, 2, "#fa9"], [6, 2, "#fa9"], [7, 2, "#e87"],
        // Half-lidded cool eyes
        [1, 3, "#e87"], [2, 3, "#fa9"], [3, 3, "#2a2"], [4, 3, "#fa9"], [5, 3, "#2a2"], [6, 3, "#fa9"], [7, 3, "#e87"],
        // Smirk
        [2, 4, "#e87"], [3, 4, "#fa9"], [4, 4, "#fa9"], [5, 4, "#c55"], [6, 4, "#e87"],
        // Sleek body
        [2, 5, "#d76"], [3, 5, "#e87"], [4, 5, "#e87"], [5, 5, "#e87"], [6, 5, "#d76"],
        [2, 6, "#d76"], [3, 6, "#e87"], [4, 6, "#fff"], [5, 6, "#e87"], [6, 6, "#d76"],
        [2, 7, "#d76"], [3, 7, "#e87"], [4, 7, "#e87"], [5, 7, "#e87"], [6, 7, "#d76"],
        // Legs + long tail
        [2, 8, "#c55"], [3, 8, "#c55"], [5, 8, "#c55"], [6, 8, "#c55"],
        [7, 6, "#c55"], [8, 5, "#c55"], [8, 6, "#c55"], [9, 4, "#c55"],
      ],
      adult: [
        // Crown
        [4, 0, "#fd0"],
        [3, 0, "#fd0"], [5, 0, "#fd0"],
        [2, 1, "#fd0"], [3, 1, "#fd0"], [4, 1, "#fd0"], [5, 1, "#fd0"], [6, 1, "#fd0"],
        // Tall regal ears
        [1, 2, "#d76"], [2, 2, "#e87"], [3, 2, "#fa9"], [4, 2, "#fa9"], [5, 2, "#fa9"], [6, 2, "#e87"], [7, 2, "#d76"],
        // Wise eyes
        [1, 3, "#e87"], [2, 3, "#fa9"], [3, 3, "#fa9"], [4, 3, "#fa9"], [5, 3, "#fa9"], [6, 3, "#fa9"], [7, 3, "#e87"],
        [1, 4, "#e87"], [2, 4, "#fa9"], [3, 4, "#2a2"], [4, 4, "#fa9"], [5, 4, "#2a2"], [6, 4, "#fa9"], [7, 4, "#e87"],
        [1, 5, "#e87"], [2, 5, "#fa9"], [3, 5, "#fff"], [4, 5, "#fa9"], [5, 5, "#fff"], [6, 5, "#fa9"], [7, 5, "#e87"],
        // Gentle smile
        [2, 6, "#e87"], [3, 6, "#fa9"], [4, 6, "#c55"], [5, 6, "#fa9"], [6, 6, "#e87"],
        // Robed body
        [1, 7, "#c55"], [2, 7, "#d76"], [3, 7, "#e87"], [4, 7, "#fa9"], [5, 7, "#e87"], [6, 7, "#d76"], [7, 7, "#c55"],
        [1, 8, "#c55"], [2, 8, "#d76"], [3, 8, "#d76"], [4, 8, "#e87"], [5, 8, "#d76"], [6, 8, "#d76"], [7, 8, "#c55"],
        [2, 9, "#b44"], [3, 9, "#b44"], [5, 9, "#b44"], [6, 9, "#b44"],
      ],
    },
  },
  {
    id: "mech",
    name: "Mech",
    description: "A curious mechanical creature",
    traitBias: ["philosophical", "independent"],
    palette: { primary: "#889", secondary: "#aab", accent: "#4df" },
    sprites: {
      egg: [
        [3, 0, "#bbc"], [4, 0, "#bbc"], [5, 0, "#bbc"],
        [2, 1, "#bbc"], [3, 1, "#ccd"], [4, 1, "#ccd"], [5, 1, "#ccd"], [6, 1, "#bbc"],
        [1, 2, "#bbc"], [2, 2, "#ccd"], [3, 2, "#ccd"], [4, 2, "#ddf"], [5, 2, "#ccd"], [6, 2, "#ccd"], [7, 2, "#bbc"],
        [1, 3, "#bbc"], [2, 3, "#ccd"], [3, 3, "#ccd"], [4, 3, "#ccd"], [5, 3, "#ccd"], [6, 3, "#ccd"], [7, 3, "#bbc"],
        [1, 4, "#bbc"], [2, 4, "#ccd"], [3, 4, "#ccd"], [4, 4, "#ccd"], [5, 4, "#ccd"], [6, 4, "#ccd"], [7, 4, "#bbc"],
        [2, 5, "#bbc"], [3, 5, "#bbc"], [4, 5, "#bbc"], [5, 5, "#bbc"], [6, 5, "#bbc"],
        [3, 6, "#bbc"], [4, 6, "#bbc"], [5, 6, "#bbc"],
      ],
      baby: [
        // Antenna
        [4, 0, "#4df"],
        [3, 1, "#889"], [4, 1, "#aab"], [5, 1, "#889"],
        [2, 2, "#889"], [3, 2, "#aab"], [4, 2, "#aab"], [5, 2, "#aab"], [6, 2, "#889"],
        // LED eyes
        [2, 3, "#889"], [3, 3, "#4df"], [4, 3, "#aab"], [5, 3, "#4df"], [6, 3, "#889"],
        // Speaker mouth
        [2, 4, "#889"], [3, 4, "#667"], [4, 4, "#667"], [5, 4, "#667"], [6, 4, "#889"],
        // Body
        [3, 5, "#889"], [4, 5, "#aab"], [5, 5, "#889"],
        // Treads
        [2, 6, "#667"], [3, 6, "#667"], [5, 6, "#667"], [6, 6, "#667"],
      ],
      child: [
        // Antenna
        [4, 0, "#4df"], [5, 0, "#4df"],
        [3, 1, "#889"], [4, 1, "#aab"], [5, 1, "#aab"], [6, 1, "#889"],
        [2, 2, "#889"], [3, 2, "#aab"], [4, 2, "#aab"], [5, 2, "#aab"], [6, 2, "#aab"], [7, 2, "#889"],
        // Visor eyes
        [2, 3, "#889"], [3, 3, "#4df"], [4, 3, "#3cf"], [5, 3, "#3cf"], [6, 3, "#4df"], [7, 3, "#889"],
        // Face plate
        [2, 4, "#889"], [3, 4, "#aab"], [4, 4, "#667"], [5, 4, "#aab"], [6, 4, "#889"],
        // Chest panel
        [2, 5, "#778"], [3, 5, "#889"], [4, 5, "#4df"], [5, 5, "#889"], [6, 5, "#778"],
        [2, 6, "#778"], [3, 6, "#889"], [4, 6, "#aab"], [5, 6, "#889"], [6, 6, "#778"],
        // Legs
        [2, 7, "#667"], [3, 7, "#667"], [5, 7, "#667"], [6, 7, "#667"],
      ],
      teen: [
        // Antenna array
        [3, 0, "#4df"], [5, 0, "#4df"],
        [2, 1, "#778"], [3, 1, "#889"], [4, 1, "#aab"], [5, 1, "#889"], [6, 1, "#778"],
        [1, 2, "#778"], [2, 2, "#889"], [3, 2, "#aab"], [4, 2, "#aab"], [5, 2, "#aab"], [6, 2, "#889"], [7, 2, "#778"],
        // Visor
        [1, 3, "#778"], [2, 3, "#4df"], [3, 3, "#3cf"], [4, 3, "#3cf"], [5, 3, "#3cf"], [6, 3, "#4df"], [7, 3, "#778"],
        // Face
        [2, 4, "#889"], [3, 4, "#aab"], [4, 4, "#aab"], [5, 4, "#667"], [6, 4, "#889"],
        // Armored body
        [2, 5, "#667"], [3, 5, "#778"], [4, 5, "#889"], [5, 5, "#778"], [6, 5, "#667"],
        [1, 6, "#667"], [2, 6, "#778"], [3, 6, "#889"], [4, 6, "#4df"], [5, 6, "#889"], [6, 6, "#778"], [7, 6, "#667"],
        [2, 7, "#667"], [3, 7, "#778"], [4, 7, "#889"], [5, 7, "#778"], [6, 7, "#667"],
        // Legs
        [2, 8, "#556"], [3, 8, "#556"], [5, 8, "#556"], [6, 8, "#556"],
        [2, 9, "#556"], [3, 9, "#667"], [5, 9, "#667"], [6, 9, "#556"],
      ],
      adult: [
        // Crown / crest
        [4, 0, "#4df"],
        [3, 0, "#3cf"], [5, 0, "#3cf"],
        [2, 1, "#4df"], [3, 1, "#4df"], [4, 1, "#4df"], [5, 1, "#4df"], [6, 1, "#4df"],
        // Head
        [2, 2, "#889"], [3, 2, "#aab"], [4, 2, "#aab"], [5, 2, "#aab"], [6, 2, "#889"],
        [1, 3, "#889"], [2, 3, "#aab"], [3, 3, "#aab"], [4, 3, "#aab"], [5, 3, "#aab"], [6, 3, "#aab"], [7, 3, "#889"],
        // Wise visor
        [1, 4, "#889"], [2, 4, "#aab"], [3, 4, "#4df"], [4, 4, "#aab"], [5, 4, "#4df"], [6, 4, "#aab"], [7, 4, "#889"],
        [1, 5, "#889"], [2, 5, "#aab"], [3, 5, "#fff"], [4, 5, "#aab"], [5, 5, "#fff"], [6, 5, "#aab"], [7, 5, "#889"],
        // Smile circuit
        [2, 6, "#889"], [3, 6, "#aab"], [4, 6, "#4df"], [5, 6, "#aab"], [6, 6, "#889"],
        // Robed armor
        [1, 7, "#667"], [2, 7, "#778"], [3, 7, "#889"], [4, 7, "#aab"], [5, 7, "#889"], [6, 7, "#778"], [7, 7, "#667"],
        [1, 8, "#667"], [2, 8, "#778"], [3, 8, "#778"], [4, 8, "#889"], [5, 8, "#778"], [6, 8, "#778"], [7, 8, "#667"],
        // Feet
        [2, 9, "#556"], [3, 9, "#556"], [5, 9, "#556"], [6, 9, "#556"],
      ],
    },
  },
];

export function getSpecies(id: string): SpeciesDefinition {
  return SPECIES.find((s) => s.id === id) || SPECIES[0];
}

export function getRandomSpecies(): SpeciesDefinition {
  return SPECIES[Math.floor(Math.random() * SPECIES.length)];
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts src/data/species.ts
git commit -m "feat: add species type system with blob, cat, and mech species"
```

---

## Task 3: Integrate Species into Game Engine

**Files:**
- Modify: `src/lib/game-engine.ts:9-47,63-80`
- Modify: `src/lib/personality.ts:8-69`
- Modify: `src/lib/prompts.ts:26-77`

- [ ] **Step 1: Update INITIAL_STATE and HATCH action**

In `src/lib/game-engine.ts`, add the import at the top (after line 6):

```typescript
import { getRandomSpecies } from "@/data/species";
```

Add `species: ""` to INITIAL_STATE's pet object (after `name: ""`):

```typescript
pet: {
    name: "",
    species: "",
    stats: { hunger: 80, happiness: 80, energy: 80, hygiene: 80 },
```

Update the HATCH case (lines 63-81) to assign a random species:

```typescript
case "HATCH": {
  const species = getRandomSpecies();
  return {
    ...INITIAL_STATE,
    phase: "alive",
    pet: {
      ...INITIAL_STATE.pet,
      name: action.name,
      species: species.id,
      stage: "baby",
      ageTicks: 10,
      bornAt: Date.now(),
      alive: true,
    },
    meta: {
      ...INITIAL_STATE.meta,
      lastTickAt: Date.now(),
      createdAt: Date.now(),
    },
  };
}
```

- [ ] **Step 2: Add species trait bias to deriveTraits**

In `src/lib/personality.ts`, add import at the top (after line 1):

```typescript
import { getSpecies } from "@/data/species";
```

Update `deriveTraits` signature and add species bias scoring. Change the function signature (line 8) to accept an optional species parameter:

```typescript
export function deriveTraits(personality: PersonalityState, speciesId?: string): PersonalityTrait[] {
```

Add species bias scoring after the default-if-no-strong-signals block (after line 58, before the sort):

```typescript
  // Species trait bias
  if (speciesId) {
    const species = getSpecies(speciesId);
    for (const trait of species.traitBias) {
      const existing = scores.find((s) => s.trait === trait);
      if (existing) {
        existing.score += 15;
      } else {
        scores.push({ trait, score: 15 });
      }
    }
  }
```

- [ ] **Step 3: Include species in LLM system prompt**

In `src/lib/prompts.ts`, add import at the top (after line 2):

```typescript
import { getSpecies } from "@/data/species";
```

Update `buildSystemPrompt` (line 26) to accept species and include it in the prompt. Change the character intro line (line 57) from:

```typescript
  return `You are ${pet.name}, a virtual pet at the ${pet.stage} stage of life.
```

to:

```typescript
  const speciesName = pet.species ? getSpecies(pet.species).name : "creature";

  return `You are ${pet.name}, a ${speciesName} virtual pet at the ${pet.stage} stage of life.
```

Note: `buildSystemPrompt` receives the full `GameState` which now includes `pet.species`, so no signature change needed — just access `pet.species` within the function.

- [ ] **Step 4: Update useGameState to pass species to deriveTraits**

In `src/hooks/useGameState.tsx`, update the `deriveTraits` call (line 177) to pass species:

```typescript
// Before:
const newTraits = deriveTraits(state.personality);

// After:
const newTraits = deriveTraits(state.personality, state.pet.species);
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/game-engine.ts src/lib/personality.ts src/lib/prompts.ts src/hooks/useGameState.tsx
git commit -m "feat: integrate species into game engine, personality, and prompts"
```

---

## Task 4: Update PetSprite for Species

**Files:**
- Modify: `src/components/pet/PetSprite.tsx`
- Modify: `src/app/play/page.tsx:168-170`
- Modify: `src/components/hud/PetInfo.tsx`

- [ ] **Step 1: Refactor PetSprite to use species data**

Replace the entire `src/components/pet/PetSprite.tsx` with:

```typescript
"use client";

import type { EvolutionStage, PetMood, SpritePixel } from "@/types";
import { getSpecies } from "@/data/species";

interface PetSpriteProps {
  stage: EvolutionStage;
  mood: PetMood;
  isSleeping: boolean;
  species: string;
}

const PIXEL = 4;

function spriteToCss(pixels: SpritePixel[]): string {
  return pixels
    .map(([x, y, color]) => `${x * PIXEL}px ${y * PIXEL}px 0 0 ${color}`)
    .join(", ");
}

function getAnimationClass(mood: PetMood, isSleeping: boolean): string {
  if (isSleeping) return "animate-pet-sleeping";
  switch (mood) {
    case "happy":
    case "excited":
      return "animate-pet-happy";
    case "sad":
      return "animate-pet-sad";
    case "hungry":
      return "animate-pet-sick";
    case "sleepy":
      return "animate-pet-sleeping";
    case "sick":
      return "animate-pet-sick";
    case "dead":
      return "";
    default:
      return "animate-pet-idle";
  }
}

export function PetSprite({ stage, mood, isSleeping, species }: PetSpriteProps) {
  const speciesData = getSpecies(species);
  const pixels = speciesData.sprites[stage];
  const boxShadow = spriteToCss(pixels);
  const animClass = getAnimationClass(mood, isSleeping);

  const maxX = Math.max(...pixels.map(([x]) => x)) + 1;
  const maxY = Math.max(...pixels.map(([, y]) => y)) + 1;
  const width = maxX * PIXEL;
  const height = maxY * PIXEL;

  return (
    <div className="flex items-center justify-center flex-1">
      <div className={animClass}>
        <div
          className="relative"
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: `${PIXEL}px`,
              height: `${PIXEL}px`,
              boxShadow,
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Pass species prop in play page**

In `src/app/play/page.tsx`, update the PetSprite usage (around line 168-170):

```typescript
// Before:
<PetSprite
  stage={state.pet.stage}
  mood={state.pet.mood}
  isSleeping={false}
/>

// After:
<PetSprite
  stage={state.pet.stage}
  mood={state.pet.mood}
  isSleeping={false}
  species={state.pet.species}
/>
```

Also update SleepScreen usage if it renders PetSprite — read `src/components/screens/SleepScreen.tsx` and add species prop there too. The SleepScreen component will need the `species` prop passed through from play page.

In the sleeping render section (around line 151):

```typescript
// Before:
return <SleepScreen stage={state.pet.stage} name={state.pet.name} />;

// After:
return <SleepScreen stage={state.pet.stage} name={state.pet.name} species={state.pet.species} />;
```

- [ ] **Step 3: Update PetInfo to show species**

Read `src/components/hud/PetInfo.tsx` and add species display. Add `species` to the props and show it as a subtitle or next to the stage icon.

In `src/components/hud/PetInfo.tsx`, add a `species` prop and display the species name:

```typescript
import { getSpecies } from "@/data/species";

interface PetInfoProps {
  name: string;
  stage: EvolutionStage;
  ageTicks: number;
  species: string;
}

// In the render, include species name near the stage display
```

Update the play page's PetInfo call to include species:

```typescript
<PetInfo
  name={state.pet.name}
  stage={state.pet.stage}
  ageTicks={state.pet.ageTicks}
  species={state.pet.species}
/>
```

- [ ] **Step 4: Verify species renders correctly**

Run: `npm run dev`

Clear localStorage, navigate to `/play`, hatch a pet. Confirm:
- A random species is shown (blob, cat, or mech)
- Species name appears in pet info
- Sprite matches the species
- Chat mentions the species type

- [ ] **Step 5: Commit**

```bash
git add src/components/pet/PetSprite.tsx src/app/play/page.tsx src/components/hud/PetInfo.tsx src/components/screens/SleepScreen.tsx
git commit -m "feat: render species-specific sprites and show species in UI"
```

---

## Task 5: Compact Stats Layout

**Files:**
- Modify: `src/components/hud/StatBars.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Redesign StatBars to compact icon-based layout**

Replace `src/components/hud/StatBars.tsx` with:

```typescript
"use client";

import type { PetStats } from "@/types";

interface StatBarsProps {
  stats: PetStats;
}

const STAT_CONFIG = [
  { key: "hunger" as const, icon: "♥", color: "bg-stat-hunger", label: "HNG" },
  { key: "happiness" as const, icon: "★", color: "bg-stat-happiness", label: "HAP" },
  { key: "energy" as const, icon: "⚡", color: "bg-stat-energy", label: "NRG" },
  { key: "hygiene" as const, icon: "✦", color: "bg-stat-hygiene", label: "HYG" },
];

export function StatBars({ stats }: StatBarsProps) {
  return (
    <div className="flex gap-2 w-full justify-between px-1">
      {STAT_CONFIG.map(({ key, icon, color, label }) => {
        const value = Math.round(stats[key]);
        const isLow = value < 20;
        return (
          <div key={key} className="flex flex-col items-center gap-0.5 flex-1">
            <span
              className={`text-[7px] ${isLow ? "animate-pulse text-stat-hunger" : "text-lcd-dark/60"}`}
              title={`${label}: ${value}`}
            >
              {icon}
            </span>
            <div className="w-full h-1.5 bg-lcd-dark/15 relative">
              <div
                className={`h-full ${color} transition-all duration-500 ${isLow ? "animate-stat-critical" : ""}`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Add stat-critical animation to globals.css**

In `src/app/globals.css`, add after the existing `@keyframes pulse-glow` block:

```css
@keyframes stat-critical {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.animate-stat-critical {
  animation: stat-critical 0.8s ease-in-out infinite;
}
```

- [ ] **Step 3: Verify compact stats**

Run dev server, check that stats appear as a compact row of 4 mini-bars with icons instead of labels.

- [ ] **Step 4: Commit**

```bash
git add src/components/hud/StatBars.tsx src/app/globals.css
git commit -m "feat: compact icon-based stat bars for more pet display space"
```

---

## Task 6: Improve Screen Layout and Action Feedback

**Files:**
- Modify: `src/app/play/page.tsx`
- Modify: `src/components/actions/ActionFeedback.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Restructure main game layout for more pet space**

In `src/app/play/page.tsx`, update the "Alive - main game" render section (lines 155-201). Replace the return block inside `// Alive - main game`:

```typescript
return (
  <div className="relative w-full h-full flex flex-col">
    {/* Top info */}
    <PetInfo
      name={state.pet.name}
      stage={state.pet.stage}
      ageTicks={state.pet.ageTicks}
      species={state.pet.species}
    />

    {/* Pet area - expanded */}
    <div className="relative flex-1 flex items-center justify-center min-h-0">
      <ActionFeedback message={state.actionFeedback} />
      <div className="relative">
        <PetSprite
          stage={state.pet.stage}
          mood={state.pet.mood}
          isSleeping={false}
          species={state.pet.species}
        />
        <PetMoodIndicator
          mood={state.pet.mood}
          isSleeping={false}
        />
      </div>
    </div>

    {/* Stats - compact row */}
    <div className="py-1">
      <StatBars stats={state.pet.stats} />
    </div>

    {/* Action bar - bottom */}
    <ActionBar
      items={currentItems}
      selectedIndex={selectedIndex}
      menuState={menuState}
    />

    {/* Chat overlay */}
    {showChat && (
      <ChatDrawer
        messages={state.chat.messages}
        isTyping={state.chat.isTyping}
        onSend={sendChat}
        onClose={() => setShowChat(false)}
      />
    )}
  </div>
);
```

- [ ] **Step 2: Enhance ActionFeedback with better animation**

Replace `src/components/actions/ActionFeedback.tsx`:

```typescript
"use client";

interface ActionFeedbackProps {
  message: string | null;
}

export function ActionFeedback({ message }: ActionFeedbackProps) {
  if (!message) return null;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 animate-feedback-pop">
      <div className="relative bg-lcd-dark text-lcd-bg px-2.5 py-1.5 text-[7px] max-w-[180px] text-center leading-tight rounded-sm">
        {message}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-lcd-dark" />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add feedback pop animation**

In `src/app/globals.css`, add:

```css
@keyframes feedback-pop {
  0% { transform: translateX(-50%) translateY(4px) scale(0.9); opacity: 0; }
  20% { transform: translateX(-50%) translateY(0) scale(1.05); opacity: 1; }
  30% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
  90% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
  100% { transform: translateX(-50%) translateY(-4px) scale(0.95); opacity: 0; }
}

.animate-feedback-pop {
  animation: feedback-pop 3s ease-out forwards;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/play/page.tsx src/components/actions/ActionFeedback.tsx src/app/globals.css
git commit -m "feat: improved screen layout with more pet space and better action feedback"
```

---

## Task 7: Polish Chat UI

**Files:**
- Modify: `src/components/chat/ChatDrawer.tsx`
- Modify: `src/components/chat/ChatBubble.tsx`
- Modify: `src/components/chat/ChatInput.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Redesign ChatDrawer for full-LCD takeover**

Replace `src/components/chat/ChatDrawer.tsx`:

```typescript
"use client";

import { useRef, useEffect } from "react";
import type { ChatMessage } from "@/types";
import { ChatBubble } from "./ChatBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";

interface ChatDrawerProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
}

export function ChatDrawer({
  messages,
  isTyping,
  onSend,
  onClose,
}: ChatDrawerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="absolute inset-0 z-30 bg-lcd-bg flex flex-col animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-lcd-dark text-lcd-bg border-b-2 border-lcd-mid">
        <span className="text-[8px] tracking-wider">Chat</span>
        <button
          onClick={onClose}
          className="text-lcd-bg/70 hover:text-lcd-bg text-[10px] cursor-pointer leading-none"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-lcd-dark/30 mt-8 text-[7px]">
            Say something to your pet...
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} disabled={isTyping} />
    </div>
  );
}
```

- [ ] **Step 2: Redesign ChatBubble with better styling**

Replace `src/components/chat/ChatBubble.tsx`:

```typescript
"use client";

import type { ChatMessage } from "@/types";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in-up`}
    >
      <div
        className={`max-w-[80%] px-2 py-1 text-[7px] leading-relaxed break-words rounded-sm ${
          isUser
            ? "bg-lcd-dark text-lcd-bg"
            : "bg-lcd-dark/20 text-lcd-dark border border-lcd-dark/10"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Improve ChatInput**

Replace `src/components/chat/ChatInput.tsx`:

```typescript
"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-lcd-dark/5 border-t-2 border-lcd-dark/15">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={disabled}
        placeholder="Type..."
        className="flex-1 bg-lcd-bg border border-lcd-dark/20 px-1.5 py-1 text-[8px] text-lcd-dark outline-none placeholder:text-lcd-dark/25 focus:border-lcd-dark/40"
        maxLength={200}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !text.trim()}
        className="bg-lcd-dark text-lcd-bg px-2 py-1 text-[7px] disabled:opacity-20 cursor-pointer hover:bg-lcd-mid transition-colors"
      >
        Send
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Refine scanlines to be more subtle**

In `src/app/globals.css`, update the `.scanlines` block:

```css
/* Before: */
.scanlines {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.08) 2px,
    rgba(0, 0, 0, 0.08) 4px
  );
  pointer-events: none;
}

/* After: */
.scanlines {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0, 0, 0, 0.03) 3px,
    rgba(0, 0, 0, 0.03) 4px
  );
  pointer-events: none;
}
```

- [ ] **Step 5: Verify chat polish**

Run dev server, open chat, send several messages. Confirm:
- Chat takes over the full LCD cleanly
- User bubbles are right-aligned, dark background
- Pet bubbles are left-aligned, lighter background with border
- Input field is more prominent
- Scanlines are subtle, not distracting

- [ ] **Step 6: Commit**

```bash
git add src/components/chat/ChatDrawer.tsx src/components/chat/ChatBubble.tsx src/components/chat/ChatInput.tsx src/app/globals.css
git commit -m "feat: polished chat UI with cleaner layout and subtler scanlines"
```

---

## Task 8: Button Press Feedback and Menu Transitions

**Files:**
- Modify: `src/components/device/ButtonRow.tsx`
- Modify: `src/components/actions/ActionMenu.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Read current ButtonRow**

Read `src/components/device/ButtonRow.tsx` to see the current implementation.

- [ ] **Step 2: Add scale bounce on button press**

In the ButtonRow component, add an `active:scale-95` or similar Tailwind class to each button's click handler. The exact change depends on the current implementation, but add:

```css
/* In globals.css */
@keyframes btn-bounce {
  0% { transform: scale(1); }
  40% { transform: scale(0.92); }
  70% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.animate-btn-bounce {
  animation: btn-bounce 0.2s ease-out;
}
```

Apply `active:scale-95 transition-transform` to each button in `ButtonRow.tsx`.

- [ ] **Step 3: Add slide transition to ActionBar submenu**

In `src/components/actions/ActionMenu.tsx`, wrap the items container with a transition class. Update the `ActionBar` render to add a key-based transition:

```typescript
export function ActionBar({
  items,
  selectedIndex,
  menuState,
}: {
  items: { id: string; name?: string; label?: string; emoji?: string; icon?: string }[];
  selectedIndex: number;
  menuState: string;
}) {
  return (
    <div className="w-full overflow-hidden">
      {menuState !== "main" && (
        <div className="text-center text-lcd-dark/40 mb-0.5 text-[6px]">
          {menuState === "feed" ? "Choose food:" : "Choose activity:"}
        </div>
      )}
      <div key={menuState} className="flex justify-center gap-1 flex-wrap animate-fade-in-up">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`px-1.5 py-0.5 text-center transition-all duration-150 ${
              i === selectedIndex
                ? "bg-lcd-dark text-lcd-bg scale-105"
                : "text-lcd-dark"
            }`}
          >
            <span>{item.emoji || item.icon}</span>
            <div className="text-[6px] leading-none mt-0.5">
              {item.name || item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/device/ButtonRow.tsx src/components/actions/ActionMenu.tsx src/app/globals.css
git commit -m "feat: button press feedback and menu transition animations"
```

---

## Task 9: Set Up Electron Main Process

**Files:**
- Create: `electron/main.ts`
- Create: `electron/preload.ts`
- Modify: `package.json`
- Modify: `next.config.ts`
- Modify: `tsconfig.json` (if needed for electron dir)

- [ ] **Step 1: Install Electron dependencies**

```bash
npm install --save-dev electron electron-builder concurrently wait-on
```

- [ ] **Step 2: Configure Next.js for standalone output**

In `next.config.ts`, add standalone output:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
```

- [ ] **Step 3: Create Electron main process**

Create `electron/main.ts`:

```typescript
import { app, BrowserWindow, Tray, Menu, nativeImage, Notification } from "electron";
import path from "path";
import { spawn, type ChildProcess } from "child_process";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let serverProcess: ChildProcess | null = null;
const PORT = 3456;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 720,
    resizable: false,
    frame: true,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(`http://localhost:${PORT}/play`);

  mainWindow.on("close", (e) => {
    if (tray) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTray() {
  // Use a simple 16x16 icon — replace with actual icon asset later
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip("Tamago.ai");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Pet",
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        tray?.destroy();
        tray = null;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

function startServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const serverPath = path.join(app.getAppPath(), ".next", "standalone", "server.js");
    serverProcess = spawn("node", [serverPath], {
      env: {
        ...process.env,
        PORT: String(PORT),
        HOSTNAME: "localhost",
      },
      cwd: app.getAppPath(),
    });

    serverProcess.stdout?.on("data", (data: Buffer) => {
      const output = data.toString();
      if (output.includes("Ready") || output.includes("started")) {
        resolve();
      }
    });

    serverProcess.stderr?.on("data", (data: Buffer) => {
      console.error("Server error:", data.toString());
    });

    // Fallback resolve after 5 seconds
    setTimeout(resolve, 5000);
  });
}

app.whenReady().then(async () => {
  if (app.isPackaged) {
    await startServer();
  }

  createWindow();
  createTray();

  app.on("activate", () => {
    if (mainWindow === null) createWindow();
    else mainWindow.show();
  });
});

app.on("window-all-closed", () => {
  // Don't quit on macOS when all windows closed (tray keeps running)
  if (process.platform !== "darwin" && !tray) {
    app.quit();
  }
});

app.on("before-quit", () => {
  tray?.destroy();
  tray = null;
  serverProcess?.kill();
});
```

- [ ] **Step 4: Create preload script**

Create `electron/preload.ts`:

```typescript
import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  platform: process.platform,
});
```

- [ ] **Step 5: Add Electron scripts to package.json**

In `package.json`, add to `"scripts"`:

```json
"electron:dev": "concurrently \"next dev --port 3456\" \"wait-on http://localhost:3456 && electron electron/main.ts\"",
"electron:build": "next build && electron-builder"
```

Add `"main": "electron/main.ts"` to the top-level of package.json.

- [ ] **Step 6: Create electron-builder config**

Create `electron-builder.config.js`:

```javascript
/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: "ai.tamago.app",
  productName: "Tamago.ai",
  directories: {
    output: "dist-electron",
  },
  files: [
    ".next/standalone/**/*",
    ".next/static/**/*",
    "public/**/*",
    "electron/**/*",
  ],
  mac: {
    target: "dmg",
    category: "public.app-category.entertainment",
  },
  win: {
    target: "nsis",
  },
  extraMetadata: {
    main: "electron/main.js",
  },
};
```

- [ ] **Step 7: Verify Electron dev mode launches**

```bash
npm run electron:dev
```

Confirm: Electron window opens showing the tamagotchi game at 420x720. Game plays identically to browser version. Tray icon appears.

- [ ] **Step 8: Commit**

```bash
git add electron/ electron-builder.config.js next.config.ts package.json package-lock.json
git commit -m "feat: Electron desktop app with tray icon and standalone server"
```

---

## Task 10: Desktop Notifications

**Files:**
- Modify: `electron/main.ts`

- [ ] **Step 1: Add periodic stat checking and notifications**

In `electron/main.ts`, add a notification system after the `createWindow` function. Add before `app.whenReady()`:

```typescript
let lastNotificationTime: Record<string, number> = {};
const NOTIFICATION_COOLDOWN = 5 * 60 * 1000; // 5 minutes

function checkPetStats() {
  if (!mainWindow) return;

  mainWindow.webContents.executeJavaScript(`
    (() => {
      try {
        const saved = localStorage.getItem("tamago-ai-save");
        if (!saved) return null;
        const state = JSON.parse(saved);
        return state.pet?.stats || null;
      } catch { return null; }
    })()
  `).then((stats: { hunger: number; happiness: number; energy: number; hygiene: number } | null) => {
    if (!stats) return;

    const now = Date.now();
    const alerts: { stat: string; value: number; message: string }[] = [];

    if (stats.hunger < 15) alerts.push({ stat: "hunger", value: stats.hunger, message: "Your pet is starving!" });
    if (stats.happiness < 15) alerts.push({ stat: "happiness", value: stats.happiness, message: "Your pet is very unhappy..." });
    if (stats.energy < 10) alerts.push({ stat: "energy", value: stats.energy, message: "Your pet is exhausted!" });
    if (stats.hygiene < 10) alerts.push({ stat: "hygiene", value: stats.hygiene, message: "Your pet needs a bath!" });

    for (const alert of alerts) {
      const lastTime = lastNotificationTime[alert.stat] || 0;
      if (now - lastTime > NOTIFICATION_COOLDOWN) {
        new Notification({
          title: "Tamago.ai",
          body: alert.message,
        }).show();
        lastNotificationTime[alert.stat] = now;
      }
    }
  }).catch(() => {});
}
```

Add the interval timer inside `app.whenReady()`, after `createTray()`:

```typescript
// Check pet stats every 60 seconds for notifications
setInterval(checkPetStats, 60_000);
```

- [ ] **Step 2: Verify notifications**

Run `npm run electron:dev`, let pet stats drop to critical, confirm a native notification appears. Confirm it doesn't spam (5-minute cooldown per stat).

- [ ] **Step 3: Commit**

```bash
git add electron/main.ts
git commit -m "feat: desktop notifications when pet stats are critical"
```

---

## Task 11: Final Verification

- [ ] **Step 1: Full browser test**

Run `npm run dev` and test:
1. Hatch a pet — random species assigned
2. Chat works with real LLM responses (not fallbacks)
3. Stats are compact icon bars
4. Actions show animated feedback popup
5. Chat UI is clean full-LCD takeover
6. Pet sprite matches species
7. Species name shown in pet info
8. Clear localStorage, hatch 3+ times to see species variety

- [ ] **Step 2: Full Electron test**

Run `npm run electron:dev` and test:
1. Window opens at correct size
2. Game plays identically
3. Tray icon works
4. Minimize to tray on close
5. Notifications fire when stats critical

- [ ] **Step 3: Build check**

```bash
npm run build
```

Confirm Next.js builds successfully with no TypeScript errors.

- [ ] **Step 4: Final commit**

If any loose ends, commit them:

```bash
git add -A
git commit -m "chore: final cleanup and verification"
```
