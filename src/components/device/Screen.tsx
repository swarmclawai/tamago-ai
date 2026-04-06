"use client";

import { ReactNode } from "react";

interface ScreenProps {
  children: ReactNode;
}

export function Screen({ children }: ScreenProps) {
  return (
    <div className="w-full h-full flex flex-col text-lcd-dark text-[8px] leading-tight p-2 overflow-hidden">
      {children}
    </div>
  );
}
