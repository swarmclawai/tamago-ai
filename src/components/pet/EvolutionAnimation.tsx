"use client";

import { useEffect, useState } from "react";
import type { EvolutionStage } from "@/types";
import { PetSprite } from "./PetSprite";

interface EvolutionAnimationProps {
  fromStage: EvolutionStage;
  toStage: EvolutionStage;
  species: string;
  onComplete: () => void;
}

export function EvolutionAnimation({
  fromStage,
  toStage,
  species,
  onComplete,
}: EvolutionAnimationProps) {
  const [phase, setPhase] = useState<"flash" | "reveal">("flash");

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase("reveal"), 900);
    const timer2 = setTimeout(onComplete, 2400);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {phase === "flash" ? (
        <div className="animate-evolution-flash">
          <PetSprite stage={fromStage} mood="excited" isSleeping={false} species={species} />
        </div>
      ) : (
        <div className="animate-fade-in-up">
          <PetSprite stage={toStage} mood="happy" isSleeping={false} species={species} />
          <div className="text-center text-[8px] text-lcd-dark mt-2">
            Evolved!
          </div>
        </div>
      )}
    </div>
  );
}
