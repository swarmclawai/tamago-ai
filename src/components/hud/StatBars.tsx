"use client";

import type { PetStats } from "@/types";

interface StatBarsProps {
  stats: PetStats;
}

const STAT_CONFIG = [
  { key: "hunger" as const, color: "bg-stat-hunger", label: "HNG" },
  { key: "happiness" as const, color: "bg-stat-happiness", label: "HAP" },
  { key: "energy" as const, color: "bg-stat-energy", label: "NRG" },
  { key: "hygiene" as const, color: "bg-stat-hygiene", label: "HYG" },
];

export function StatBars({ stats }: StatBarsProps) {
  return (
    <div className="flex flex-col gap-0.5 w-full">
      {STAT_CONFIG.map(({ key, color, label }) => {
        const value = Math.round(stats[key]);
        const isLow = value < 20;
        return (
          <div key={key} className="flex items-center gap-1">
            <span
              className={`w-7 text-[7px] text-right ${isLow ? "animate-pulse" : ""}`}
            >
              {label}
            </span>
            <div className="flex-1 h-2.5 bg-lcd-dark/20 border border-lcd-dark/15">
              <div
                className={`h-full ${color} transition-all duration-500 ${isLow ? "animate-stat-critical" : ""}`}
                style={{ width: `${value}%` }}
              />
            </div>
            <span className={`w-6 text-right text-[7px] tabular-nums ${isLow ? "animate-pulse" : ""}`}>
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
