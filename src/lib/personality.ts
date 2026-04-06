import type { PersonalityState, PersonalityTrait, PetStats } from "@/types";
import { getSpecies } from "@/data/species";

interface TraitScore {
  trait: PersonalityTrait;
  score: number;
}

export function deriveTraits(personality: PersonalityState, speciesId?: string): PersonalityTrait[] {
  const { interactionCounts, bondLevel, neglectStreak, careStreak } =
    personality;
  const total =
    interactionCounts.feed +
    interactionCounts.play +
    interactionCounts.clean +
    interactionCounts.chat;

  const scores: TraitScore[] = [];

  // Care-based traits
  if (careStreak > 10) scores.push({ trait: "loving", score: careStreak * 2 });
  if (careStreak > 5)
    scores.push({ trait: "cheerful", score: careStreak * 1.5 });

  // Neglect-based traits
  if (neglectStreak > 10)
    scores.push({ trait: "sassy", score: neglectStreak * 2 });
  if (neglectStreak > 5)
    scores.push({ trait: "anxious", score: neglectStreak * 1.5 });
  if (neglectStreak > 15)
    scores.push({ trait: "grumpy", score: neglectStreak * 1.8 });

  // Activity-based traits
  if (total > 0) {
    const feedRatio = interactionCounts.feed / total;
    const playRatio = interactionCounts.play / total;
    const chatRatio = interactionCounts.chat / total;

    if (feedRatio > 0.35) scores.push({ trait: "foodie", score: feedRatio * 50 });
    if (playRatio > 0.35)
      scores.push({ trait: "playful", score: playRatio * 50 });
    if (chatRatio > 0.3)
      scores.push({ trait: "philosophical", score: chatRatio * 40 });
  }

  // Bond-based traits
  if (bondLevel < -30) scores.push({ trait: "independent", score: 30 });
  if (bondLevel > 30 && bondLevel < 60)
    scores.push({ trait: "needy", score: 25 });
  if (bondLevel > 60) scores.push({ trait: "loving", score: 40 });

  // Energy-based
  if (interactionCounts.sleep > interactionCounts.play)
    scores.push({ trait: "lazy", score: 20 });

  // Default if no strong signals
  if (scores.length === 0) {
    scores.push({ trait: "cheerful", score: 10 });
  }

  // Species trait bias
  if (speciesId) {
    const species = getSpecies(speciesId);
    for (const trait of species.traitBias) {
      const existing = scores.find((s) => s.trait === trait);
      if (existing) {
        existing.score += 15;
      } else {
        scores.push({ trait, score: 15 });
      }
    }
  }

  // Sort by score, take top 3, deduplicate
  scores.sort((a, b) => b.score - a.score);
  const uniqueTraits: PersonalityTrait[] = [];
  for (const s of scores) {
    if (!uniqueTraits.includes(s.trait) && uniqueTraits.length < 3) {
      uniqueTraits.push(s.trait);
    }
  }

  return uniqueTraits;
}

export function getBondDescription(bondLevel: number): string {
  if (bondLevel >= 80) return "deeply devoted to you";
  if (bondLevel >= 50) return "very attached to you";
  if (bondLevel >= 20) return "fond of you";
  if (bondLevel >= 0) return "warming up to you";
  if (bondLevel >= -30) return "a bit distant";
  if (bondLevel >= -60) return "resentful and cold";
  return "deeply distrustful of you";
}

export function getMoodFromStats(
  stats: PetStats,
  isSleeping: boolean
): "happy" | "sad" | "hungry" | "sleepy" | "sick" | "neutral" | "excited" {
  if (isSleeping) return "sleepy";
  if (stats.hunger < 15) return "hungry";
  if (stats.hygiene < 15) return "sick";
  if (stats.energy < 15) return "sleepy";
  if (stats.happiness < 15) return "sad";
  if (stats.happiness > 80 && stats.hunger > 60) return "excited";
  if (stats.happiness > 50) return "happy";
  return "neutral";
}
