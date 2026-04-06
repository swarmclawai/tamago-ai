"use client";

interface ButtonRowProps {
  onA: () => void;
  onB: () => void;
  onC: () => void;
  labelA?: string;
  labelB?: string;
  labelC?: string;
}

export function ButtonRow({
  onA,
  onB,
  onC,
  labelA = "◀",
  labelB = "●",
  labelC = "▶",
}: ButtonRowProps) {
  const buttonBase =
    "w-12 h-12 rounded-full flex items-center justify-center text-[10px] font-bold shadow-[0_3px_0_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.2)] active:shadow-[0_1px_0_rgba(0,0,0,0.3)] active:translate-y-[2px] active:scale-95 transition-transform transition-all cursor-pointer select-none";

  return (
    <div className="flex items-center gap-6">
      <button
        onClick={onA}
        className={`${buttonBase} bg-btn-a text-white`}
        aria-label="Button A"
      >
        {labelA}
      </button>
      <button
        onClick={onB}
        className={`${buttonBase} bg-btn-b text-yellow-900`}
        aria-label="Button B - Select"
      >
        {labelB}
      </button>
      <button
        onClick={onC}
        className={`${buttonBase} bg-btn-c text-white`}
        aria-label="Button C"
      >
        {labelC}
      </button>
    </div>
  );
}
