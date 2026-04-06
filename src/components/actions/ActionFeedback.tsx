"use client";

interface ActionFeedbackProps {
  message: string | null;
}

export function ActionFeedback({ message }: ActionFeedbackProps) {
  if (!message) return null;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 animate-feedback-pop">
      <div className="relative bg-lcd-dark text-lcd-bg px-2.5 py-1.5 text-[7px] max-w-[180px] text-center leading-tight rounded-sm">
        {message}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-lcd-dark" />
      </div>
    </div>
  );
}
