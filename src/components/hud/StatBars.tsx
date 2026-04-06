"use client";

import type { PetStats } from "@/types";

interface StatBarsProps {
  stats: PetStats;
}

const STAT_CONFIG = [
  { key: "hunger" as const, icon: "\u2665", color: "bg-stat-hunger", label: "HNG" },
  { key: "happiness" as const, icon: "\u2605", color: "bg-stat-happiness", label: "HAP" },
  { key: "energy" as const, icon: "\u26A1", color: "bg-stat-energy", label: "NRG" },
  { key: "hygiene" as const, icon: "\u2726", color: "bg-stat-hygiene", label: "HYG" },
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
