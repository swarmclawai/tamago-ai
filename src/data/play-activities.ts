import type { PlayActivity } from "@/types";

export const PLAY_ACTIVITIES: PlayActivity[] = [
  {
    id: "ball",
    name: "Ball",
    emoji: "⚽",
    happinessRestore: 20,
    energyCost: 15,
    hungerCost: 10,
  },
  {
    id: "dance",
    name: "Dance",
    emoji: "💃",
    happinessRestore: 25,
    energyCost: 20,
    hungerCost: 15,
  },
  {
    id: "puzzle",
    name: "Puzzle",
    emoji: "🧩",
    happinessRestore: 15,
    energyCost: 5,
    hungerCost: 5,
  },
  {
    id: "explore",
    name: "Explore",
    emoji: "🗺️",
    happinessRestore: 30,
    energyCost: 25,
    hungerCost: 20,
  },
];
