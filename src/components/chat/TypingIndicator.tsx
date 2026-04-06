"use client";

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-lcd-mid text-lcd-bg px-2 py-1 text-[8px] flex items-center gap-0.5">
        <span
          className="inline-block w-1 h-1 bg-lcd-bg rounded-full"
          style={{ animation: "bounce-dots 1.4s infinite 0s" }}
        />
        <span
          className="inline-block w-1 h-1 bg-lcd-bg rounded-full"
          style={{ animation: "bounce-dots 1.4s infinite 0.2s" }}
        />
        <span
          className="inline-block w-1 h-1 bg-lcd-bg rounded-full"
          style={{ animation: "bounce-dots 1.4s infinite 0.4s" }}
        />
      </div>
    </div>
  );
}
