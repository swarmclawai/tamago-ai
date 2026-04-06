"use client";

import type { ChatMessage } from "@/types";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in-up`}
    >
      <div
        className={`max-w-[80%] px-2 py-1 text-[7px] leading-relaxed break-words rounded-sm ${
          isUser
            ? "bg-lcd-dark text-lcd-bg"
            : "bg-lcd-dark/20 text-lcd-dark border border-lcd-dark/10"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
