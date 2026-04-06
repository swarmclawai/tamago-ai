import type { EvolutionStage } from "@/types";
import { EVOLUTION_STAGES, getStageConfig } from "@/data/evolution-stages";

export function checkEvolution(
  currentStage: EvolutionStage,
  ageTicks: number
): EvolutionStage | null {
  const nextConfig = getStageConfig(ageTicks);
  if (nextConfig.stage !== currentStage) {
    return nextConfig.stage;
  }
  return null;
}

export function getStageIndex(stage: EvolutionStage): number {
  return EVOLUTION_STAGES.findIndex((s) => s.stage === stage);
}

export function getAgeDisplay(ageTicks: number): string {
  const minutes = Math.floor((ageTicks * 30) / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}
