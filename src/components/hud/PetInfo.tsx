"use client";

import type { EvolutionStage } from "@/types";
import { getAgeDisplay } from "@/lib/evolution";
import { getSpecies } from "@/data/species";

interface PetInfoProps {
  name: string;
  stage: EvolutionStage;
  ageTicks: number;
  species: string;
}

const STAGE_ICONS: Record<EvolutionStage, string> = {
  egg: "🥚",
  baby: "👶",
  child: "🧒",
  teen: "🧑",
  adult: "👑",
};

export function PetInfo({ name, stage, ageTicks, species }: PetInfoProps) {
  const speciesName = species ? getSpecies(species).name : "";
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-1">
        <span>{STAGE_ICONS[stage]}</span>
        <span className="truncate max-w-[80px]">{name}</span>
        {speciesName && (
          <span className="text-lcd-dark/40 text-[6px]">{speciesName}</span>
        )}
      </div>
      <span className="text-lcd-dark/60">{getAgeDisplay(ageTicks)}</span>
    </div>
  );
}
