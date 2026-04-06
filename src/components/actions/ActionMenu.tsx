"use client";

import { useState } from "react";
import { FOOD_ITEMS } from "@/data/food-items";
import { PLAY_ACTIVITIES } from "@/data/play-activities";
import { useGame } from "@/hooks/useGameState";

type MenuState = "main" | "feed" | "play";

interface ActionMenuProps {
  onNavigate: (direction: "left" | "right" | "select") => void;
}

const MAIN_ACTIONS = [
  { id: "feed", label: "Feed", icon: "🍎" },
  { id: "play", label: "Play", icon: "⚽" },
  { id: "clean", label: "Clean", icon: "🛁" },
  { id: "sleep", label: "Sleep", icon: "💤" },
  { id: "talk", label: "Talk", icon: "💬" },
];

export function ActionMenu() {
  const { feedPet, playWithPet, cleanPet, toggleSleep, state } = useGame();
  const [menuState, setMenuState] = useState<MenuState>("main");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);

  const currentItems =
    menuState === "feed"
      ? FOOD_ITEMS
      : menuState === "play"
        ? PLAY_ACTIVITIES
        : MAIN_ACTIONS;

  const handleLeft = () => {
    setSelectedIndex((i) => (i > 0 ? i - 1 : currentItems.length - 1));
  };

  const handleRight = () => {
    setSelectedIndex((i) => (i < currentItems.length - 1 ? i + 1 : 0));
  };

  const handleSelect = () => {
    if (menuState === "main") {
      const action = MAIN_ACTIONS[selectedIndex];
      switch (action.id) {
        case "feed":
          setMenuState("feed");
          setSelectedIndex(0);
          break;
        case "play":
          setMenuState("play");
          setSelectedIndex(0);
          break;
        case "clean":
          cleanPet();
          break;
        case "sleep":
          toggleSleep();
          break;
        case "talk":
          setShowChat(true);
          break;
      }
    } else if (menuState === "feed") {
      feedPet(FOOD_ITEMS[selectedIndex].id);
      setMenuState("main");
      setSelectedIndex(0);
    } else if (menuState === "play") {
      const activity = PLAY_ACTIVITIES[selectedIndex];
      if (state.pet.stats.energy >= activity.energyCost) {
        playWithPet(activity.id);
        setMenuState("main");
        setSelectedIndex(0);
      }
    }
  };

  const handleBack = () => {
    if (menuState !== "main") {
      setMenuState("main");
      setSelectedIndex(0);
    }
  };

  return {
    menuState,
    selectedIndex,
    currentItems,
    showChat,
    setShowChat,
    handleLeft,
    handleRight,
    handleSelect,
    handleBack,
  };
}

// Visual component for the action bar
export function ActionBar({
  items,
  selectedIndex,
  menuState,
}: {
  items: { id: string; name?: string; label?: string; emoji?: string; icon?: string }[];
  selectedIndex: number;
  menuState: string;
}) {
  return (
    <div className="w-full overflow-hidden">
      {menuState !== "main" && (
        <div className="text-center text-lcd-dark/40 mb-0.5 text-[6px]">
          {menuState === "feed" ? "Choose food:" : "Choose activity:"}
        </div>
      )}
      <div key={menuState} className="flex justify-center gap-1 flex-wrap animate-fade-in-up">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`px-1.5 py-0.5 text-center transition-all duration-150 ${
              i === selectedIndex
                ? "bg-lcd-dark text-lcd-bg scale-105"
                : "text-lcd-dark"
            }`}
          >
            <span>{item.emoji || item.icon}</span>
            <div className="text-[6px] leading-none mt-0.5">
              {item.name || item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
