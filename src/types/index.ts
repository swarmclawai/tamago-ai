// --- Core Stats ---
export interface PetStats {
  hunger: number;
  happiness: number;
  energy: number;
  hygiene: number;
}

// --- Evolution ---
export type EvolutionStage = "egg" | "baby" | "child" | "teen" | "adult";

export type ChatComplexity = "babble" | "simple" | "normal" | "articulate";

export interface EvolutionConfig {
  stage: EvolutionStage;
  minAgeTicks: number;
  decayMultiplier: number;
  chatComplexity: ChatComplexity;
}

// --- Personality ---
export type PersonalityTrait =
  | "loving"
  | "sassy"
  | "anxious"
  | "cheerful"
  | "grumpy"
  | "philosophical"
  | "needy"
  | "independent"
  | "foodie"
  | "playful"
  | "lazy"
  | "dramatic";

export interface PersonalityState {
  dominantTraits: PersonalityTrait[];
  bondLevel: number;
  neglectStreak: number;
  careStreak: number;
  interactionCounts: {
    feed: number;
    play: number;
    clean: number;
    sleep: number;
    chat: number;
    neglectTicks: number;
  };
}

// --- Interaction History ---
export type ActionType = "feed" | "play" | "clean" | "sleep" | "talk";

export interface InteractionRecord {
  action: ActionType;
  timestamp: number;
  petResponse?: string;
}

// --- Chat ---
export interface ChatMessage {
  id: string;
  role: "user" | "pet";
  content: string;
  timestamp: number;
}

export type PetMood =
  | "happy"
  | "sad"
  | "hungry"
  | "sleepy"
  | "sick"
  | "angry"
  | "excited"
  | "neutral"
  | "dead";

// --- Game Phase ---
export type GamePhase = "idle" | "hatching" | "alive" | "sleeping" | "dead";

// --- Full Game State ---
export interface GameState {
  phase: GamePhase;
  pet: {
    name: string;
    species: string;
    stats: PetStats;
    stage: EvolutionStage;
    ageTicks: number;
    bornAt: number;
    alive: boolean;
    mood: PetMood;
    isSleeping: boolean;
    starvationTicks: number;
  };
  personality: PersonalityState;
  chat: {
    messages: ChatMessage[];
    isTyping: boolean;
  };
  actionFeedback: string | null;
  meta: {
    lastTickAt: number;
    totalInteractions: number;
    createdAt: number;
    version: number;
  };
}

// --- Game Actions (for reducer) ---
export type GameAction =
  | { type: "HATCH"; name: string }
  | { type: "TICK" }
  | { type: "FEED"; foodId: string }
  | { type: "PLAY"; activityId: string }
  | { type: "CLEAN" }
  | { type: "SLEEP_TOGGLE" }
  | { type: "CHAT_SEND"; message: string }
  | { type: "CHAT_RECEIVE"; message: string }
  | { type: "CHAT_TYPING"; isTyping: boolean }
  | { type: "EVOLVE"; stage: EvolutionStage }
  | { type: "ACTION_FEEDBACK"; message: string }
  | { type: "CLEAR_FEEDBACK" }
  | { type: "DEATH" }
  | { type: "RESET" }
  | { type: "HYDRATE"; state: GameState };

// --- Food & Activities ---
export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  hungerRestore: number;
  happinessEffect: number;
  hygieneEffect: number;
}

export interface PlayActivity {
  id: string;
  name: string;
  emoji: string;
  happinessRestore: number;
  energyCost: number;
  hungerCost: number;
}

// --- Species ---
export interface SpeciesDefinition {
  id: string;
  name: string;
  description: string;
  traitBias: PersonalityTrait[];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  sprites: Record<EvolutionStage, SpritePixel[]>;
}

export type SpritePixel = [number, number, string]; // [x, y, color]
