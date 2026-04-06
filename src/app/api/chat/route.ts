import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/prompts";
import type { GameState } from "@/types";

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "https://ollama.com/api";
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || "";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";

interface ChatRequest {
  messages: { role: string; content: string }[];
  systemPrompt?: string;
  gameState?: Partial<GameState>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    // Build system prompt from game state if provided, or use the provided one
    let systemPrompt = body.systemPrompt;
    if (!systemPrompt && body.gameState) {
      // The client sends { pet: {...}, personality: {...} }
      // buildSystemPrompt expects a GameState-shaped object
      const gs = body.gameState as GameState;
      if (gs.pet && gs.personality) {
        systemPrompt = buildSystemPrompt(gs);
      }
    }

    const messages = [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      ...body.messages,
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const response = await fetch(`${OLLAMA_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OLLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: {
          temperature: 0.8,
          num_predict: 150,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`Ollama API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { message: "*blinks*", error: "LLM unavailable" },
        { status: 200 } // Return 200 so the client still gets a response
      );
    }

    const data = await response.json();
    const message =
      data.message?.content || data.choices?.[0]?.message?.content || "*looks at you*";

    return NextResponse.json({ message: message.trim() });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { message: "*tilts head*", error: "Request failed" },
      { status: 200 }
    );
  }
}
