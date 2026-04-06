"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-lcd-dark/5 border-t-2 border-lcd-dark/15">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={disabled}
        placeholder="Type..."
        className="flex-1 bg-lcd-bg border border-lcd-dark/20 px-1.5 py-1 text-[8px] text-lcd-dark outline-none placeholder:text-lcd-dark/25 focus:border-lcd-dark/40"
        maxLength={200}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !text.trim()}
        className="bg-lcd-dark text-lcd-bg px-2 py-1 text-[7px] disabled:opacity-20 cursor-pointer hover:bg-lcd-mid transition-colors"
      >
        Send
      </button>
    </div>
  );
}
