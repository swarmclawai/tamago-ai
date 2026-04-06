import type { GameState, ChatComplexity } from "@/types";
import { getStageConfig } from "@/data/evolution-stages";
import { getBondDescription } from "./personality";
import { getSpecies } from "@/data/species";

function statDescription(value: number): string {
  if (value >= 80) return "great";
  if (value >= 60) return "okay";
  if (value >= 40) return "meh";
  if (value >= 20) return "low";
  return "critical";
}

function complexityInstructions(complexity: ChatComplexity): string {
  switch (complexity) {
    case "babble":
      return "You are a baby. Use single words, emotive sounds, and babbling. Examples: 'Hungwy!' 'Yay!' '*sniff*' 'Mama?' 'Ooh!' Keep responses to 1-5 words.";
    case "simple":
      return "You are a child. Use short, enthusiastic sentences. Sometimes misspell big words. Be curious and easily excited. Keep responses under 80 characters.";
    case "normal":
      return "You are a teenager. Be moody sometimes, use casual language, occasionally philosophical. If bond is low, you might give short dismissive answers. Keep responses under 120 characters.";
    case "articulate":
      return "You are an adult. Show emotional depth, wit, and personality. Remember your history with your owner. You can be warm, sarcastic, thoughtful, or playful depending on your traits. Keep responses under 150 characters.";
  }
}

export function buildSystemPrompt(state: GameState): string {
  const { pet, personality } = state;
  const stageConfig = getStageConfig(pet.ageTicks);
  const bondDesc = getBondDescription(personality.bondLevel);
  const traits = personality.dominantTraits.join(", ");

  const neglectContext =
    personality.neglectStreak > 10
      ? `You've been neglected for a while and you're not happy about it.`
      : personality.neglectStreak > 5
        ? `Your owner has been away for a bit. You noticed.`
        : "";

  const statWarnings: string[] = [];
  if (pet.stats.hunger < 20)
    statWarnings.push(
      "You are VERY hungry. Constantly mention food, get distracted mid-sentence thinking about eating."
    );
  if (pet.stats.energy < 20)
    statWarnings.push(
      "You are exhausted. Yawn mid-sentence, trail off, ask to sleep."
    );
  if (pet.stats.happiness < 20)
    statWarnings.push(
      "You are very unhappy. Give short responses, sigh, make existential comments."
    );
  if (pet.stats.hygiene < 20)
    statWarnings.push(
      "You feel gross and dirty. Complain about it, sneeze occasionally."
    );

  const speciesName = pet.species ? getSpecies(pet.species).name : "creature";

  return `You are ${pet.name}, a ${speciesName} virtual pet at the ${pet.stage} stage of life.

PERSONALITY: You are ${traits}. Your bond with your owner is ${bondDesc}. ${neglectContext}

CURRENT STATE:
- Hunger: ${Math.round(pet.stats.hunger)}/100 (${statDescription(pet.stats.hunger)})
- Happiness: ${Math.round(pet.stats.happiness)}/100 (${statDescription(pet.stats.happiness)})
- Energy: ${Math.round(pet.stats.energy)}/100 (${statDescription(pet.stats.energy)})
- Hygiene: ${Math.round(pet.stats.hygiene)}/100 (${statDescription(pet.stats.hygiene)})

${complexityInstructions(stageConfig.chatComplexity)}

${statWarnings.length > 0 ? "URGENT BEHAVIORAL OVERRIDES:\n" + statWarnings.join("\n") : ""}

RULES:
- Use *asterisks* for actions and emotes
- Never break character or acknowledge being an AI
- Never use emojis — only text and *actions*
- Be expressive within your character constraints
- Respond naturally to what your owner says or does`;
}

export function buildActionPrompt(
  state: GameState,
  action: string,
  detail?: string
): string {
  const system = buildSystemPrompt(state);
  const actionDesc =
    action === "feed"
      ? `Your owner just fed you ${detail || "food"}`
      : action === "play"
        ? `Your owner just played ${detail || "a game"} with you`
        : action === "clean"
          ? `Your owner just gave you a bath`
          : action === "sleep"
            ? `Your owner is putting you to bed`
            : `Your owner did something`;

  return `${system}

${actionDesc}. React in 1-2 very short sentences. Be in character.`;
}
