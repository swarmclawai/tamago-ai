type SoundId =
  | "button"
  | "feed"
  | "play"
  | "clean"
  | "sleep"
  | "chat"
  | "evolve"
  | "hatch"
  | "death";

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "square",
  volume: number = 0.1
) {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not supported
  }
}

function playSequence(
  notes: [number, number][],
  type: OscillatorType = "square"
) {
  let delay = 0;
  for (const [freq, dur] of notes) {
    setTimeout(() => playTone(freq, dur, type), delay * 1000);
    delay += dur * 0.7;
  }
}

const SOUNDS: Record<SoundId, () => void> = {
  button: () => playTone(800, 0.05, "square", 0.05),
  feed: () =>
    playSequence([
      [523, 0.1],
      [659, 0.1],
      [784, 0.15],
    ]),
  play: () =>
    playSequence([
      [392, 0.08],
      [523, 0.08],
      [659, 0.08],
      [784, 0.12],
    ]),
  clean: () =>
    playSequence(
      [
        [1047, 0.05],
        [1319, 0.05],
        [1568, 0.08],
      ],
      "sine"
    ),
  sleep: () =>
    playSequence(
      [
        [392, 0.3],
        [330, 0.3],
        [262, 0.5],
      ],
      "sine"
    ),
  chat: () => playTone(660, 0.08, "square", 0.04),
  evolve: () =>
    playSequence([
      [262, 0.1],
      [330, 0.1],
      [392, 0.1],
      [523, 0.1],
      [659, 0.1],
      [784, 0.2],
      [1047, 0.3],
    ]),
  hatch: () =>
    playSequence([
      [200, 0.1],
      [250, 0.1],
      [200, 0.1],
      [300, 0.1],
      [400, 0.15],
      [523, 0.2],
      [659, 0.3],
    ]),
  death: () =>
    playSequence(
      [
        [392, 0.3],
        [370, 0.3],
        [349, 0.3],
        [330, 0.5],
        [262, 0.8],
      ],
      "triangle"
    ),
};

export function playSound(id: SoundId) {
  SOUNDS[id]?.();
}

export function initAudio() {
  // Call on first user interaction to unlock AudioContext
  if (audioCtx?.state === "suspended") {
    audioCtx.resume();
  }
}
