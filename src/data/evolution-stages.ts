import type { EvolutionConfig } from "@/types";

export const EVOLUTION_STAGES: EvolutionConfig[] = [
  {
    stage: "egg",
    minAgeTicks: 0,
    decayMultiplier: 0,
    chatComplexity: "babble",
  },
  {
    stage: "baby",
    minAgeTicks: 10, // ~5 minutes
    decayMultiplier: 0.5,
    chatComplexity: "babble",
  },
  {
    stage: "child",
    minAgeTicks: 60, // ~30 minutes
    decayMultiplier: 0.75,
    chatComplexity: "simple",
  },
  {
    stage: "teen",
    minAgeTicks: 140, // ~70 minutes
    decayMultiplier: 1.0,
    chatComplexity: "normal",
  },
  {
    stage: "adult",
    minAgeTicks: 240, // ~2 hours
    decayMultiplier: 1.2,
    chatComplexity: "articulate",
  },
];

export function getStageConfig(ageTicks: number): EvolutionConfig {
  let config = EVOLUTION_STAGES[0];
  for (const stage of EVOLUTION_STAGES) {
    if (ageTicks >= stage.minAgeTicks) {
      config = stage;
    }
  }
  return config;
}

export const FALLBACK_REACTIONS = {
  feed: [
    "Yum!",
    "*munch munch*",
    "Tasty!",
    "More please!",
    "*happy chomps*",
    "Delicious!",
  ],
  play: [
    "Wheee!",
    "*bounces around*",
    "So fun!",
    "Again! Again!",
    "*giggles*",
    "Yay!",
  ],
  clean: [
    "Sparkle!",
    "*shakes off water*",
    "So fresh!",
    "Squeaky clean!",
    "*happy splash*",
  ],
  sleep: [
    "Zzz...",
    "*yawns*",
    "Sleepy time...",
    "Night night...",
    "*curls up*",
  ],
  wake: [
    "*stretches*",
    "Good morning!",
    "*yawns* Hi!",
    "I'm up!",
    "*blinks sleepily*",
  ],
};
