"use client";

import { useState, useCallback } from "react";
import { GameProvider, useGame } from "@/hooks/useGameState";
import { DeviceFrame } from "@/components/device/DeviceFrame";
import { Screen } from "@/components/device/Screen";
import { ButtonRow } from "@/components/device/ButtonRow";
import { PetSprite } from "@/components/pet/PetSprite";
import { PetMoodIndicator } from "@/components/pet/PetMood";
import { StatBars } from "@/components/hud/StatBars";
import { PetInfo } from "@/components/hud/PetInfo";
import { ActionBar } from "@/components/actions/ActionMenu";
import { ActionFeedback } from "@/components/actions/ActionFeedback";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { HatchScreen } from "@/components/screens/HatchScreen";
import { SleepScreen } from "@/components/screens/SleepScreen";
import { GameOverScreen } from "@/components/screens/GameOverScreen";
import { FOOD_ITEMS } from "@/data/food-items";
import { PLAY_ACTIVITIES } from "@/data/play-activities";

const MAIN_ACTIONS = [
  { id: "feed", label: "Feed", icon: "🍎" },
  { id: "play", label: "Play", icon: "⚽" },
  { id: "clean", label: "Clean", icon: "🛁" },
  { id: "sleep", label: "Sleep", icon: "💤" },
  { id: "talk", label: "Talk", icon: "💬" },
];

type MenuState = "main" | "feed" | "play";

function GameScreen() {
  const {
    state,
    feedPet,
    playWithPet,
    cleanPet,
    toggleSleep,
    sendChat,
    hatchPet,
    resetGame,
  } = useGame();

  const [menuState, setMenuState] = useState<MenuState>("main");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);

  const currentItems =
    menuState === "feed"
      ? FOOD_ITEMS.map((f) => ({ id: f.id, label: f.name, icon: f.emoji }))
      : menuState === "play"
        ? PLAY_ACTIVITIES.map((a) => ({
            id: a.id,
            label: a.name,
            icon: a.emoji,
          }))
        : MAIN_ACTIONS;

  const handleLeft = useCallback(() => {
    setSelectedIndex((i) => (i > 0 ? i - 1 : currentItems.length - 1));
  }, [currentItems.length]);

  const handleRight = useCallback(() => {
    setSelectedIndex((i) => (i < currentItems.length - 1 ? i + 1 : 0));
  }, [currentItems.length]);

  const handleSelect = useCallback(() => {
    if (state.phase === "sleeping") {
      toggleSleep();
      return;
    }

    if (showChat) return;

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
      }
      setMenuState("main");
      setSelectedIndex(0);
    }
  }, [
    state.phase,
    menuState,
    selectedIndex,
    showChat,
    feedPet,
    playWithPet,
    cleanPet,
    toggleSleep,
  ]);

  const handleBack = useCallback(() => {
    if (showChat) {
      setShowChat(false);
      return;
    }
    if (menuState !== "main") {
      setMenuState("main");
      setSelectedIndex(0);
    }
  }, [menuState, showChat]);

  // Determine screen content
  const renderScreenContent = () => {
    // Idle / Hatch
    if (state.phase === "idle") {
      return <HatchScreen onHatch={hatchPet} />;
    }

    // Dead
    if (state.phase === "dead") {
      return (
        <GameOverScreen
          name={state.pet.name}
          ageTicks={state.pet.ageTicks}
          totalInteractions={state.meta.totalInteractions}
          bondLevel={state.personality.bondLevel}
          onRestart={resetGame}
        />
      );
    }

    // Sleeping
    if (state.phase === "sleeping") {
      return <SleepScreen stage={state.pet.stage} name={state.pet.name} species={state.pet.species} />;
    }

    // Alive - main game
    return (
      <div className="relative w-full h-full flex flex-col">
        {/* Top info */}
        <PetInfo
          name={state.pet.name}
          stage={state.pet.stage}
          ageTicks={state.pet.ageTicks}
          species={state.pet.species}
        />

        {/* Pet area */}
        <div className="relative flex-1 flex items-center justify-center">
          <ActionFeedback message={state.actionFeedback} />
          <div className="relative">
            <PetSprite
              stage={state.pet.stage}
              mood={state.pet.mood}
              isSleeping={false}
              species={state.pet.species}
            />
            <PetMoodIndicator
              mood={state.pet.mood}
              isSleeping={false}
            />
          </div>
        </div>

        {/* Stats */}
        <StatBars stats={state.pet.stats} />

        {/* Action bar */}
        <div className="mt-1">
          <ActionBar
            items={currentItems}
            selectedIndex={selectedIndex}
            menuState={menuState}
          />
        </div>

        {/* Chat overlay */}
        {showChat && (
          <ChatDrawer
            messages={state.chat.messages}
            isTyping={state.chat.isTyping}
            onSend={sendChat}
            onClose={() => setShowChat(false)}
          />
        )}
      </div>
    );
  };

  return (
    <DeviceFrame
      screen={<Screen>{renderScreenContent()}</Screen>}
      buttons={
        <ButtonRow
          onA={showChat ? () => setShowChat(false) : handleLeft}
          onB={handleSelect}
          onC={showChat ? () => {} : menuState !== "main" ? handleBack : handleRight}
          labelA={showChat ? "✕" : "◀"}
          labelB={state.phase === "sleeping" ? "☀" : "●"}
          labelC={showChat ? "" : menuState !== "main" ? "✕" : "▶"}
        />
      }
    />
  );
}

export default function PlayPage() {
  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  );
}
