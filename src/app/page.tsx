"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [hasGame, setHasGame] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("tamago-ai-save");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.phase !== "idle") {
          router.replace("/play");
          return;
        }
      } catch {
        // corrupted save, show landing
      }
    }
    setHasGame(false);
  }, [router]);

  if (hasGame === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[10px] text-white/30 font-pixel animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4 text-center">
      <div className="space-y-3">
        <h1 className="text-lg font-pixel text-white">Tamago.ai</h1>
        <p className="text-[8px] font-pixel text-white/50 max-w-xs leading-relaxed">
          A virtual pet with real personality, powered by AI.
          Feed it. Play with it. Talk to it.
        </p>
      </div>

      <div className="text-4xl animate-egg-wobble" style={{ animationDuration: "1.5s" }}>
        🥚
      </div>

      <button
        onClick={() => router.push("/play")}
        className="font-pixel text-[10px] bg-white text-slate-900 px-6 py-3 rounded-full hover:bg-white/90 transition-colors cursor-pointer animate-pulse-glow"
      >
        Hatch Your Pet
      </button>

      <div className="text-[6px] font-pixel text-white/20 max-w-xs">
        Your pet lives in your browser. It gets hungry when you&apos;re away.
        It remembers how you treat it.
      </div>
    </div>
  );
}
