"use client";

import { useState, useEffect } from "react";
import { PetSprite } from "@/components/pet/PetSprite";

interface HatchScreenProps {
  onHatch: (name: string) => void;
}

type HatchPhase = "wobbling" | "cracking" | "naming";

export function HatchScreen({ onHatch }: HatchScreenProps) {
  const [phase, setPhase] = useState<HatchPhase>("wobbling");
  const [name, setName] = useState("");
  const [wobbleIntensity, setWobbleIntensity] = useState(1);

  useEffect(() => {
    if (phase !== "wobbling") return;

    // Intensify wobble over time
    const intensityTimer = setInterval(() => {
      setWobbleIntensity((prev) => {
        if (prev >= 5) {
          setPhase("cracking");
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(intensityTimer);
  }, [phase]);

  useEffect(() => {
    if (phase === "cracking") {
      const timer = setTimeout(() => setPhase("naming"), 800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed) onHatch(trimmed);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-lcd-dark p-2">
      {phase === "wobbling" && (
        <>
          <div
            className="animate-egg-wobble"
            style={{
              animationDuration: `${0.6 - wobbleIntensity * 0.05}s`,
            }}
          >
            <PetSprite stage="egg" mood="neutral" isSleeping={false} species="blob" />
          </div>
          <div className="mt-4 text-[7px] text-lcd-dark/50 animate-pulse">
            Something is moving...
          </div>
        </>
      )}

      {phase === "cracking" && (
        <div className="animate-egg-crack">
          <PetSprite stage="egg" mood="neutral" isSleeping={false} species="blob" />
        </div>
      )}

      {phase === "naming" && (
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <div className="text-[8px] text-center">
            A new friend has arrived!
          </div>
          <PetSprite stage="baby" mood="happy" isSleeping={false} species="blob" />
          <div className="text-[7px] text-lcd-dark/70">Name your pet:</div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            maxLength={12}
            placeholder="..."
            autoFocus
            className="bg-transparent border-b-2 border-lcd-dark text-center text-[9px] text-lcd-dark outline-none w-32 pb-0.5 placeholder:text-lcd-dark/30"
          />
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="bg-lcd-dark text-lcd-bg px-3 py-1 text-[7px] disabled:opacity-30 cursor-pointer"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
