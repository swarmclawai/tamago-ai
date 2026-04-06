"use client";

import {
  useReducer,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { GameState, GameAction, EvolutionStage } from "@/types";
import { gameReducer, INITIAL_STATE } from "@/lib/game-engine";
import { calculateCatchupTicks, applyDecay, applySleepDecay } from "@/lib/stat-decay";
import { checkEvolution } from "@/lib/evolution";
import { playSound, initAudio } from "@/lib/sounds";
import { deriveTraits } from "@/lib/personality";
import { getStageConfig } from "@/data/evolution-stages";
import { FALLBACK_REACTIONS } from "@/data/evolution-stages";
import { randomFrom } from "@/lib/utils";
import { buildActionPrompt } from "@/lib/prompts";

const STORAGE_KEY = "tamago-ai-save";
const TICK_INTERVAL = 30_000; // 30 seconds

interface GameContextValue {
  state: GameState;
  dispatch: (action: GameAction) => void;
  feedPet: (foodId: string) => void;
  playWithPet: (activityId: string) => void;
  cleanPet: () => void;
  toggleSleep: () => void;
  sendChat: (message: string) => void;
  hatchPet: (name: string) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

async function fetchLLMReaction(
  state: GameState,
  action: string,
  detail?: string
): Promise<string | null> {
  try {
    const prompt = buildActionPrompt(state, action, detail);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: `[${action}]` }],
        systemPrompt: prompt,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.message || null;
  } catch {
    return null;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const isHydrated = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: GameState = JSON.parse(saved);
        if (parsed.meta?.version === undefined) parsed.meta.version = 1;

        // Apply catch-up decay
        const catchupTicks = calculateCatchupTicks(parsed.meta.lastTickAt);
        if (catchupTicks > 0 && parsed.pet.alive) {
          let stats = parsed.pet.stats;
          const stageConfig = getStageConfig(parsed.pet.ageTicks);
          for (let i = 0; i < catchupTicks; i++) {
            stats = parsed.pet.isSleeping
              ? applySleepDecay(stats, stageConfig.decayMultiplier)
              : applyDecay(stats, stageConfig.decayMultiplier, parsed.personality.neglectStreak);
          }
          parsed.pet.stats = stats;
          parsed.pet.ageTicks += catchupTicks;
          parsed.meta.lastTickAt = Date.now();

          // Check starvation during catchup
          if (stats.hunger <= 0) {
            const starveTicks = Math.min(catchupTicks, 20);
            parsed.pet.starvationTicks += starveTicks;
            if (parsed.pet.starvationTicks >= 20) {
              parsed.phase = "dead";
              parsed.pet.alive = false;
              parsed.pet.mood = "dead";
            }
          }

          // Check evolution during catchup
          const newStage = checkEvolution(parsed.pet.stage, parsed.pet.ageTicks);
          if (newStage) parsed.pet.stage = newStage;
        }

        dispatch({ type: "HYDRATE", state: parsed });
      }
    } catch {
      // Start fresh if localStorage is corrupted
    }
    isHydrated.current = true;
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage full
    }
  }, [state]);

  // Tick timer
  useEffect(() => {
    if (state.phase !== "alive" && state.phase !== "sleeping") return;

    tickRef.current = setInterval(() => {
      dispatch({ type: "TICK" });
    }, TICK_INTERVAL);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.phase]);

  // Pause on hidden tab
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (tickRef.current) clearInterval(tickRef.current);
      } else {
        // Apply catch-up when returning
        const catchupTicks = calculateCatchupTicks(state.meta.lastTickAt);
        if (catchupTicks > 0) {
          for (let i = 0; i < Math.min(catchupTicks, 20); i++) {
            dispatch({ type: "TICK" });
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [state.meta.lastTickAt]);

  // Evolution check on ageTicks change
  useEffect(() => {
    if (!state.pet.alive) return;
    const newStage = checkEvolution(state.pet.stage, state.pet.ageTicks);
    if (newStage) {
      dispatch({ type: "EVOLVE", stage: newStage });
    }
  }, [state.pet.ageTicks, state.pet.stage, state.pet.alive]);

  // Derive personality traits periodically
  useEffect(() => {
    if (!state.pet.alive) return;
    const newTraits = deriveTraits(state.personality, state.pet.species);
    if (
      JSON.stringify(newTraits) !==
      JSON.stringify(state.personality.dominantTraits)
    ) {
      dispatch({
        type: "HYDRATE",
        state: {
          ...state,
          personality: { ...state.personality, dominantTraits: newTraits },
        },
      });
    }
  }, [state.meta.totalInteractions]);

  // Action helpers with LLM reactions
  const showFeedback = useCallback(
    (message: string) => {
      dispatch({ type: "ACTION_FEEDBACK", message });
      setTimeout(() => dispatch({ type: "CLEAR_FEEDBACK" }), 3000);
    },
    []
  );

  const feedPet = useCallback(
    (foodId: string) => {
      initAudio();
      playSound("feed");
      dispatch({ type: "FEED", foodId });
      fetchLLMReaction(state, "feed", foodId).then((msg) => {
        showFeedback(msg || randomFrom(FALLBACK_REACTIONS.feed));
      });
    },
    [state, showFeedback]
  );

  const playWithPet = useCallback(
    (activityId: string) => {
      initAudio();
      playSound("play");
      dispatch({ type: "PLAY", activityId });
      fetchLLMReaction(state, "play", activityId).then((msg) => {
        showFeedback(msg || randomFrom(FALLBACK_REACTIONS.play));
      });
    },
    [state, showFeedback]
  );

  const cleanPet = useCallback(() => {
    initAudio();
    playSound("clean");
    dispatch({ type: "CLEAN" });
    fetchLLMReaction(state, "clean").then((msg) => {
      showFeedback(msg || randomFrom(FALLBACK_REACTIONS.clean));
    });
  }, [state, showFeedback]);

  const toggleSleep = useCallback(() => {
    initAudio();
    playSound("sleep");
    const goingToSleep = !state.pet.isSleeping;
    dispatch({ type: "SLEEP_TOGGLE" });
    const reactions = goingToSleep
      ? FALLBACK_REACTIONS.sleep
      : FALLBACK_REACTIONS.wake;
    fetchLLMReaction(state, "sleep").then((msg) => {
      showFeedback(msg || randomFrom(reactions));
    });
  }, [state, showFeedback]);

  const sendChat = useCallback(
    async (message: string) => {
      initAudio();
      playSound("chat");
      dispatch({ type: "CHAT_SEND", message });
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...state.chat.messages.slice(-18).map((m) => ({
                role: m.role === "pet" ? "assistant" : "user",
                content: m.content,
              })),
              { role: "user", content: message },
            ],
            gameState: {
              name: state.pet.name,
              stage: state.pet.stage,
              stats: state.pet.stats,
              mood: state.pet.mood,
              personality: state.personality,
            },
          }),
          signal: AbortSignal.timeout(15_000),
        });

        if (res.ok) {
          const data = await res.json();
          dispatch({ type: "CHAT_RECEIVE", message: data.message });
        } else {
          dispatch({
            type: "CHAT_RECEIVE",
            message: "*looks confused*",
          });
        }
      } catch {
        dispatch({
          type: "CHAT_RECEIVE",
          message: "*blinks* ...huh?",
        });
      }
    },
    [state]
  );

  const hatchPet = useCallback((name: string) => {
    initAudio();
    playSound("hatch");
    dispatch({ type: "HATCH", name });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET" });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        feedPet,
        playWithPet,
        cleanPet,
        toggleSleep,
        sendChat,
        hatchPet,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
