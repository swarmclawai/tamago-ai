"use client";

import { ReactNode } from "react";

interface DeviceFrameProps {
  screen: ReactNode;
  buttons: ReactNode;
}

export function DeviceFrame({ screen, buttons }: DeviceFrameProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="relative">
        {/* Outer shell - egg shape */}
        <div
          className="relative w-[360px] h-[510px] bg-gradient-to-b from-shell-highlight via-shell-primary to-shell-dark rounded-[45%_45%_42%_42%] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-4px_8px_rgba(0,0,0,0.1)] flex flex-col items-center pt-6 pb-6"
        >
          {/* Brand text */}
          <div className="text-[8px] tracking-[0.3em] text-shell-dark/60 uppercase mt-6 mb-4">
            Tamago.ai
          </div>

          {/* Screen bezel */}
          <div className="relative w-[280px] h-[260px] bg-[#2a2a2a] rounded-lg p-2 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
            {/* LCD screen */}
            <div className="relative w-full h-full bg-lcd-bg rounded overflow-hidden">
              {/* Scanline overlay */}
              <div className="scanlines absolute inset-0 z-10" />
              {/* Screen content */}
              <div className="relative z-0 w-full h-full">
                {screen}
              </div>
            </div>
          </div>

          {/* Buttons area */}
          <div className="mt-auto mb-2">
            {buttons}
          </div>

          {/* Decorative screws */}
          <div className="absolute top-6 left-12 w-2 h-2 rounded-full bg-shell-dark/30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]" />
          <div className="absolute top-6 right-12 w-2 h-2 rounded-full bg-shell-dark/30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]" />
        </div>

        {/* Keychain hole */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-4 border-shell-dark/40" />
      </div>
    </div>
  );
}
