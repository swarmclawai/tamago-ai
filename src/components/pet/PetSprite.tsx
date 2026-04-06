"use client";

import type { EvolutionStage, PetMood, SpritePixel } from "@/types";
import { getSpecies } from "@/data/species";

interface PetSpriteProps {
  stage: EvolutionStage;
  mood: PetMood;
  isSleeping: boolean;
  species: string;
}

const PIXEL = 4;

function spriteToCss(pixels: SpritePixel[]): string {
  return pixels
    .map(([x, y, color]) => `${x * PIXEL}px ${y * PIXEL}px 0 0 ${color}`)
    .join(", ");
}

function getAnimationClass(mood: PetMood, isSleeping: boolean): string {
  if (isSleeping) return "animate-pet-sleeping";
  switch (mood) {
    case "happy":
    case "excited":
      return "animate-pet-happy";
    case "sad":
      return "animate-pet-sad";
    case "hungry":
      return "animate-pet-sick";
    case "sleepy":
      return "animate-pet-sleeping";
    case "sick":
      return "animate-pet-sick";
    case "dead":
      return "";
    default:
      return "animate-pet-idle";
  }
}

export function PetSprite({ stage, mood, isSleeping, species }: PetSpriteProps) {
  const speciesData = getSpecies(species);
  const pixels = speciesData.sprites[stage];
  const boxShadow = spriteToCss(pixels);
  const animClass = getAnimationClass(mood, isSleeping);

  const maxX = Math.max(...pixels.map(([x]) => x)) + 1;
  const maxY = Math.max(...pixels.map(([, y]) => y)) + 1;
  const width = maxX * PIXEL;
  const height = maxY * PIXEL;

  return (
    <div className="flex items-center justify-center flex-1">
      <div className={animClass}>
        <div
          className="relative"
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: `${PIXEL}px`,
              height: `${PIXEL}px`,
              boxShadow,
            }}
          />
        </div>
      </div>
    </div>
  );
}
