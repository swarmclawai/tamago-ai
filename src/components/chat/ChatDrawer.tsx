"use client";

import { useRef, useEffect } from "react";
import type { ChatMessage } from "@/types";
import { ChatBubble } from "./ChatBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";

interface ChatDrawerProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
}

export function ChatDrawer({
  messages,
  isTyping,
  onSend,
  onClose,
}: ChatDrawerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="absolute inset-0 z-30 bg-lcd-bg flex flex-col animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-lcd-dark text-lcd-bg border-b-2 border-lcd-mid">
        <span className="text-[8px] tracking-wider">Chat</span>
        <button
          onClick={onClose}
          className="text-lcd-bg/70 hover:text-lcd-bg text-[10px] cursor-pointer leading-none"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-lcd-dark/30 mt-8 text-[7px]">
            Say something to your pet...
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} disabled={isTyping} />
    </div>
  );
}
