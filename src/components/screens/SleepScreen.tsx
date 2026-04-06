"use client";

import { PetSprite } from "@/components/pet/PetSprite";
import type { EvolutionStage } from "@/types";

interface SleepScreenProps {
  stage: EvolutionStage;
  name: string;
  species: string;
}

export function SleepScreen({ stage, name, species }: SleepScreenProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-lcd-dark/20 relative">
      {/* Moon */}
      <div className="absolute top-3 right-4 w-4 h-4 rounded-full bg-lcd-light/60 shadow-[0_0_8px_rgba(139,172,15,0.4)]" />

      {/* Sleeping pet */}
      <div className="opacity-70">
        <PetSprite stage={stage} mood="sleepy" isSleeping={true} species={species} />
      </div>

      {/* ZZZ */}
      <div className="absolute top-1/4 right-1/4">
        <span
          className="absolute text-[10px] text-lcd-dark/50"
          style={{ animation: "zzz-float 2s ease-out infinite" }}
        >
          Z
        </span>
        <span
          className="absolute text-[8px] text-lcd-dark/40"
          style={{ animation: "zzz-float 2s ease-out 0.5s infinite" }}
        >
          z
        </span>
        <span
          className="absolute text-[12px] text-lcd-dark/60"
          style={{ animation: "zzz-float 2s ease-out 1s infinite" }}
        >
          Z
        </span>
      </div>

      {/* Status text */}
      <div className="mt-4 text-[7px] text-lcd-dark/40">
        {name} is sleeping...
      </div>
    </div>
  );
}
