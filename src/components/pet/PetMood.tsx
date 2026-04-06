"use client";

import type { PetMood as PetMoodType } from "@/types";
import { useEffect, useState } from "react";

interface PetMoodProps {
  mood: PetMoodType;
  isSleeping: boolean;
}

interface Particle {
  id: number;
  x: number;
  content: string;
  delay: number;
}

function getMoodParticles(mood: PetMoodType, isSleeping: boolean): string[] {
  if (isSleeping) return ["Z", "z", "Z"];
  switch (mood) {
    case "happy":
    case "excited":
      return ["♥", "♥", "♥"];
    case "sad":
      return ["💧"];
    case "hungry":
      return ["...", "..."];
    case "sick":
      return ["💧", "💧"];
    case "sleepy":
      return ["z", "Z"];
    default:
      return [];
  }
}

export function PetMoodIndicator({ mood, isSleeping }: PetMoodProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const contents = getMoodParticles(mood, isSleeping);

  useEffect(() => {
    if (contents.length === 0) {
      setParticles([]);
      return;
    }

    let counter = 0;
    const interval = setInterval(() => {
      const content = contents[counter % contents.length];
      setParticles((prev) => {
        const newParticles = [
          ...prev.filter(
            (p) => Date.now() - p.delay < 2000
          ),
          {
            id: Date.now(),
            x: 10 + Math.random() * 20,
            content,
            delay: Date.now(),
          },
        ];
        return newParticles.slice(-5);
      });
      counter++;
    }, 800);

    return () => clearInterval(interval);
  }, [mood, isSleeping]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute -top-2 -right-2 pointer-events-none">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute text-lcd-dark animate-float-up"
          style={{
            left: `${p.x}px`,
            fontSize: "10px",
          }}
        >
          {p.content}
        </span>
      ))}
    </div>
  );
}
