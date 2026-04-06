import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Tamago.ai — LLM-Powered Tamagotchi",
  description:
    "A virtual pet with real personality, powered by AI. Feed it, play with it, talk to it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pixelFont.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-slate-900 text-white font-pixel select-none">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
