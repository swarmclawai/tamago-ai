# Tamago.ai

An AI-powered virtual pet that lives on your desktop. Raise it, feed it, play with it, and chat with it. Each pet develops a unique personality based on how you care for it.

Inspired by the classic virtual pet toys of the 90s, rebuilt with modern AI. This was a fun weekend project exploring the intersection of LLM-powered characters and retro pixel art aesthetics.

<!-- Add your own gameplay screenshot here -->
<!-- ![Tamago.ai Gameplay](docs/screenshots/gameplay.png) -->

## Features

- **AI-Powered Personality** - Your pet responds to actions and chats using an LLM (Ollama Cloud). Its personality evolves based on how you interact with it
- **Multiple Species** - Each egg hatches into a random species (Blob, Cat, or Mech), each with unique pixel art sprites and personality tendencies
- **5 Evolution Stages** - Watch your pet grow from egg to baby to child to teen to adult, each with distinct sprites and communication styles
- **Real-time Stats** - Manage hunger, happiness, energy, and hygiene. Neglect your pet and it will notice
- **Retro LCD Aesthetic** - CSS box-shadow pixel art, scanline effects, and chiptune sounds in an egg-shaped device frame
- **Offline Persistence** - Your pet ages while you're away. Come back to catch-up decay and evolved creatures
- **Desktop App** - Runs as a standalone Electron app with system tray and native notifications when your pet needs attention

<!-- Add your own chat screenshot here -->
<!-- ![Chat with your pet](docs/screenshots/chat.png) -->

## Getting Started

### Prerequisites

- Node.js 18+
- An [Ollama Cloud](https://ollama.com) API key (or local Ollama instance)

### Setup

```bash
# Install dependencies
npm install

# Create .env.local with your Ollama config
cat > .env.local << 'EOF'
OLLAMA_API_URL=https://ollama.com/api
OLLAMA_API_KEY=your_api_key_here
OLLAMA_MODEL=gemma3:4b
EOF

# Run in browser
npm run dev

# Or run as desktop app
npm run electron:dev
```

### Building the Desktop App

```bash
npm run electron:build
```

This generates a `.dmg` (macOS) or `.exe` (Windows) in `dist-electron/`.

## Tech Stack

- **Frontend** - Next.js 16, React 19, Tailwind CSS v4
- **AI** - Ollama Cloud API (gemma3:4b or any compatible model)
- **Desktop** - Electron with system tray and native notifications
- **Pixel Art** - Pure CSS box-shadow rendering (no image assets)
- **Sound** - Web Audio API procedural synthesis
- **State** - React Context + useReducer with localStorage persistence

## How It Works

Your pet's personality is shaped by your interactions:

| Interaction Pattern | Resulting Traits |
|---|---|
| Lots of feeding | Foodie |
| Lots of playing | Playful |
| Frequent chatting | Philosophical |
| Consistent care | Loving, Cheerful |
| Neglect | Sassy, Anxious, Grumpy |

Each species also has inherent trait tendencies:
- **Blob** - Cheerful, Playful
- **Cat** - Independent, Sassy
- **Mech** - Philosophical, Independent

The LLM receives the pet's current stats, personality traits, bond level, and evolution stage as context, producing responses that match the pet's character.

## License

MIT
