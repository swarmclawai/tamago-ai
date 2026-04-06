import type { PetStats } from "@/types";
import { clamp } from "./utils";

const BASE_DECAY: PetStats = {
  hunger: 2,
  happiness: 1.5,
  energy: 1,
  hygiene: 0.8,
};

const MAX_CATCHUP_TICKS = 480; // 4 hours worth

export function applyDecay(
  stats: PetStats,
  stageMultiplier: number,
  neglectStreak: number
): PetStats {
  const neglectBonus = Math.min(neglectStreak * 0.1, 1.0);
  const multiplier = stageMultiplier * (1 + neglectBonus);

  return {
    hunger: clamp(stats.hunger - BASE_DECAY.hunger * multiplier, 0, 100),
    happiness: clamp(
      stats.happiness - BASE_DECAY.happiness * multiplier,
      0,
      100
    ),
    energy: clamp(stats.energy - BASE_DECAY.energy * multiplier, 0, 100),
    hygiene: clamp(stats.hygiene - BASE_DECAY.hygiene * multiplier, 0, 100),
  };
}

export function applySleepDecay(
  stats: PetStats,
  stageMultiplier: number
): PetStats {
  // During sleep: energy recovers, hunger decays slower, happiness stays, hygiene stays
  return {
    hunger: clamp(
      stats.hunger - BASE_DECAY.hunger * stageMultiplier * 0.3,
      0,
      100
    ),
    happiness: stats.happiness,
    energy: clamp(stats.energy + 3, 0, 100),
    hygiene: stats.hygiene,
  };
}

export function calculateCatchupTicks(lastTickAt: number): number {
  const elapsed = Date.now() - lastTickAt;
  const tickInterval = 30_000; // 30 seconds
  const ticks = Math.floor(elapsed / tickInterval);
  return Math.min(ticks, MAX_CATCHUP_TICKS);
}
