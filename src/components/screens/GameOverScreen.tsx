"use client";

import { getAgeDisplay } from "@/lib/evolution";

interface GameOverScreenProps {
  name: string;
  ageTicks: number;
  totalInteractions: number;
  bondLevel: number;
  onRestart: () => void;
}

export function GameOverScreen({
  name,
  ageTicks,
  totalInteractions,
  bondLevel,
  onRestart,
}: GameOverScreenProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-lcd-dark p-2">
      {/* Angel */}
      <div className="animate-angel-rise text-[20px] mb-2">
        👼
      </div>

      <div className="text-[9px] mb-2">{name} has passed on...</div>

      {/* Stats recap */}
      <div className="text-[6px] space-y-0.5 text-center text-lcd-dark/70 mb-3">
        <div>Lived: {getAgeDisplay(ageTicks)}</div>
        <div>Interactions: {totalInteractions}</div>
        <div>
          Bond: {bondLevel > 50 ? "Strong" : bondLevel > 0 ? "Growing" : "Distant"}
        </div>
      </div>

      <button
        onClick={onRestart}
        className="bg-lcd-dark text-lcd-bg px-3 py-1 text-[7px] cursor-pointer animate-pulse-glow"
      >
        New Egg
      </button>
    </div>
  );
}
