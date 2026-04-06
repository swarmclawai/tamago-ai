"use client";

import type { PetStats } from "@/types";

interface StatBarsProps {
  stats: PetStats;
}

const STAT_CONFIG = [
  { key: "hunger" as const, color: "bg-stat-hunger", textColor: "text-stat-hunger", label: "HNG" },
  { key: "happiness" as const, color: "bg-stat-happiness", textColor: "text-stat-happiness", label: "HAP" },
  { key: "energy" as const, color: "bg-stat-energy", textColor: "text-stat-energy", label: "NRG" },
  { key: "hygiene" as const, color: "bg-stat-hygiene", textColor: "text-stat-hygiene", label: "HYG" },
];

export function StatBars({ stats }: StatBarsProps) {
  return (
    <div className="flex gap-1.5 w-full justify-between px-1">
      {STAT_CONFIG.map(({ key, color, textColor, label }) => {
        const value = Math.round(stats[key]);
        const isLow = value < 20;
        return (
          <div key={key} className="flex flex-col items-center gap-0.5 flex-1">
            <span
              className={`text-[5px] font-bold tracking-wide ${isLow ? "animate-pulse text-stat-hunger" : textColor}`}
            >
              {label}
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
