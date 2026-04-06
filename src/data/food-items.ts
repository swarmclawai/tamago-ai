import type { FoodItem } from "@/types";

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: "apple",
    name: "Apple",
    emoji: "🍎",
    hungerRestore: 20,
    happinessEffect: 5,
    hygieneEffect: 0,
  },
  {
    id: "cookie",
    name: "Cookie",
    emoji: "🍪",
    hungerRestore: 10,
    happinessEffect: 15,
    hygieneEffect: -5,
  },
  {
    id: "rice",
    name: "Rice Bowl",
    emoji: "🍚",
    hungerRestore: 35,
    happinessEffect: 5,
    hygieneEffect: -3,
  },
  {
    id: "cake",
    name: "Cake",
    emoji: "🎂",
    hungerRestore: 15,
    happinessEffect: 25,
    hygieneEffect: -10,
  },
  {
    id: "salad",
    name: "Salad",
    emoji: "🥗",
    hungerRestore: 25,
    happinessEffect: -5,
    hygieneEffect: 5,
  },
  {
    id: "pizza",
    name: "Pizza",
    emoji: "🍕",
    hungerRestore: 30,
    happinessEffect: 20,
    hygieneEffect: -15,
  },
];
