import type { GameState, GameAction, PetStats } from "@/types";
import { clamp } from "./utils";
import { applyDecay, applySleepDecay } from "./stat-decay";
import { getStageConfig } from "@/data/evolution-stages";
import { FOOD_ITEMS } from "@/data/food-items";
import { PLAY_ACTIVITIES } from "@/data/play-activities";
import { getMoodFromStats } from "./personality";

export const INITIAL_STATE: GameState = {
  phase: "idle",
  pet: {
    name: "",
    species: "",
    stats: { hunger: 80, happiness: 80, energy: 80, hygiene: 80 },
    stage: "egg",
    ageTicks: 0,
    bornAt: 0,
    alive: true,
    mood: "neutral",
    isSleeping: false,
    starvationTicks: 0,
  },
  personality: {
    dominantTraits: ["cheerful"],
    bondLevel: 0,
    neglectStreak: 0,
    careStreak: 0,
    interactionCounts: {
      feed: 0,
      play: 0,
      clean: 0,
      sleep: 0,
      chat: 0,
      neglectTicks: 0,
    },
  },
  chat: {
    messages: [],
    isTyping: false,
  },
  actionFeedback: null,
  meta: {
    lastTickAt: Date.now(),
    totalInteractions: 0,
    createdAt: Date.now(),
    version: 1,
  },
};

const STARVATION_DEATH_TICKS = 20;
const MAX_CHAT_MESSAGES = 40;

function updateStats(stats: PetStats, changes: Partial<PetStats>): PetStats {
  return {
    hunger: clamp(stats.hunger + (changes.hunger ?? 0), 0, 100),
    happiness: clamp(stats.happiness + (changes.happiness ?? 0), 0, 100),
    energy: clamp(stats.energy + (changes.energy ?? 0), 0, 100),
    hygiene: clamp(stats.hygiene + (changes.hygiene ?? 0), 0, 100),
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "HATCH": {
      return {
        ...INITIAL_STATE,
        phase: "alive",
        pet: {
          ...INITIAL_STATE.pet,
          name: action.name,
          stage: "baby",
          ageTicks: 10,
          bornAt: Date.now(),
          alive: true,
        },
        meta: {
          ...INITIAL_STATE.meta,
          lastTickAt: Date.now(),
          createdAt: Date.now(),
        },
      };
    }

    case "TICK": {
      if (state.phase !== "alive" && state.phase !== "sleeping") return state;
      if (!state.pet.alive) return state;

      const stageConfig = getStageConfig(state.pet.ageTicks);
      const isSleeping = state.pet.isSleeping;

      const newStats = isSleeping
        ? applySleepDecay(state.pet.stats, stageConfig.decayMultiplier)
        : applyDecay(
            state.pet.stats,
            stageConfig.decayMultiplier,
            state.personality.neglectStreak
          );

      // Auto-wake if energy is full
      const shouldWake = isSleeping && newStats.energy >= 100;

      // Starvation tracking
      const starvationTicks =
        newStats.hunger <= 0 ? state.pet.starvationTicks + 1 : 0;

      // Death check
      if (starvationTicks >= STARVATION_DEATH_TICKS) {
        return {
          ...state,
          phase: "dead",
          pet: { ...state.pet, alive: false, mood: "dead", starvationTicks },
        };
      }

      const newMood = getMoodFromStats(newStats, isSleeping && !shouldWake);

      return {
        ...state,
        phase: shouldWake ? "alive" : state.phase,
        pet: {
          ...state.pet,
          stats: newStats,
          ageTicks: state.pet.ageTicks + 1,
          mood: newMood,
          isSleeping: shouldWake ? false : isSleeping,
          starvationTicks,
        },
        personality: {
          ...state.personality,
          neglectStreak: isSleeping
            ? state.personality.neglectStreak
            : state.personality.neglectStreak + 1,
          interactionCounts: {
            ...state.personality.interactionCounts,
            neglectTicks: isSleeping
              ? state.personality.interactionCounts.neglectTicks
              : state.personality.interactionCounts.neglectTicks + 1,
          },
        },
        meta: {
          ...state.meta,
          lastTickAt: Date.now(),
        },
      };
    }

    case "FEED": {
      if (state.phase !== "alive" || !state.pet.alive) return state;
      const food = FOOD_ITEMS.find((f) => f.id === action.foodId);
      if (!food) return state;

      const newStats = updateStats(state.pet.stats, {
        hunger: food.hungerRestore,
        happiness: food.happinessEffect,
        hygiene: food.hygieneEffect,
      });

      return {
        ...state,
        pet: {
          ...state.pet,
          stats: newStats,
          mood: getMoodFromStats(newStats, false),
        },
        personality: {
          ...state.personality,
          neglectStreak: 0,
          careStreak: state.personality.careStreak + 1,
          bondLevel: clamp(state.personality.bondLevel + 1, -100, 100),
          interactionCounts: {
            ...state.personality.interactionCounts,
            feed: state.personality.interactionCounts.feed + 1,
          },
        },
        meta: {
          ...state.meta,
          totalInteractions: state.meta.totalInteractions + 1,
        },
      };
    }

    case "PLAY": {
      if (state.phase !== "alive" || !state.pet.alive) return state;
      const activity = PLAY_ACTIVITIES.find((a) => a.id === action.activityId);
      if (!activity) return state;

      // Can't play if too tired
      if (state.pet.stats.energy < activity.energyCost) return state;

      const newStats = updateStats(state.pet.stats, {
        happiness: activity.happinessRestore,
        energy: -activity.energyCost,
        hunger: -activity.hungerCost,
      });

      return {
        ...state,
        pet: {
          ...state.pet,
          stats: newStats,
          mood: getMoodFromStats(newStats, false),
        },
        personality: {
          ...state.personality,
          neglectStreak: 0,
          careStreak: state.personality.careStreak + 1,
          bondLevel: clamp(state.personality.bondLevel + 2, -100, 100),
          interactionCounts: {
            ...state.personality.interactionCounts,
            play: state.personality.interactionCounts.play + 1,
          },
        },
        meta: {
          ...state.meta,
          totalInteractions: state.meta.totalInteractions + 1,
        },
      };
    }

    case "CLEAN": {
      if (state.phase !== "alive" || !state.pet.alive) return state;

      const newStats = updateStats(state.pet.stats, {
        hygiene: 40,
        happiness: 5,
      });

      return {
        ...state,
        pet: {
          ...state.pet,
          stats: newStats,
          mood: getMoodFromStats(newStats, false),
        },
        personality: {
          ...state.personality,
          neglectStreak: 0,
          careStreak: state.personality.careStreak + 1,
          bondLevel: clamp(state.personality.bondLevel + 1, -100, 100),
          interactionCounts: {
            ...state.personality.interactionCounts,
            clean: state.personality.interactionCounts.clean + 1,
          },
        },
        meta: {
          ...state.meta,
          totalInteractions: state.meta.totalInteractions + 1,
        },
      };
    }

    case "SLEEP_TOGGLE": {
      if (!state.pet.alive) return state;
      const goingToSleep = !state.pet.isSleeping;

      return {
        ...state,
        phase: goingToSleep ? "sleeping" : "alive",
        pet: {
          ...state.pet,
          isSleeping: goingToSleep,
          mood: goingToSleep ? "sleepy" : getMoodFromStats(state.pet.stats, false),
        },
        personality: {
          ...state.personality,
          interactionCounts: {
            ...state.personality.interactionCounts,
            sleep: state.personality.interactionCounts.sleep + 1,
          },
        },
        meta: {
          ...state.meta,
          totalInteractions: state.meta.totalInteractions + 1,
        },
      };
    }

    case "CHAT_SEND": {
      const messages = [
        ...state.chat.messages,
        {
          id: crypto.randomUUID(),
          role: "user" as const,
          content: action.message,
          timestamp: Date.now(),
        },
      ].slice(-MAX_CHAT_MESSAGES);

      return {
        ...state,
        chat: { ...state.chat, messages, isTyping: true },
        personality: {
          ...state.personality,
          neglectStreak: 0,
          careStreak: state.personality.careStreak + 1,
          bondLevel: clamp(state.personality.bondLevel + 1, -100, 100),
          interactionCounts: {
            ...state.personality.interactionCounts,
            chat: state.personality.interactionCounts.chat + 1,
          },
        },
        meta: {
          ...state.meta,
          totalInteractions: state.meta.totalInteractions + 1,
        },
      };
    }

    case "CHAT_RECEIVE": {
      const messages = [
        ...state.chat.messages,
        {
          id: crypto.randomUUID(),
          role: "pet" as const,
          content: action.message,
          timestamp: Date.now(),
        },
      ].slice(-MAX_CHAT_MESSAGES);

      return {
        ...state,
        chat: { messages, isTyping: false },
      };
    }

    case "CHAT_TYPING": {
      return {
        ...state,
        chat: { ...state.chat, isTyping: action.isTyping },
      };
    }

    case "EVOLVE": {
      return {
        ...state,
        pet: { ...state.pet, stage: action.stage },
      };
    }

    case "ACTION_FEEDBACK": {
      return { ...state, actionFeedback: action.message };
    }

    case "CLEAR_FEEDBACK": {
      return { ...state, actionFeedback: null };
    }

    case "DEATH": {
      return {
        ...state,
        phase: "dead",
        pet: { ...state.pet, alive: false, mood: "dead" },
      };
    }

    case "RESET": {
      return INITIAL_STATE;
    }

    case "HYDRATE": {
      return action.state;
    }

    default:
      return state;
  }
}
