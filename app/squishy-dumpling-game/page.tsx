import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SquishyDumplingGameContent } from "@/components/squishy-dumpling-game/squishy-dumpling-game-content"

export const metadata: Metadata = {
  title: "Squishy Dumpling Game - Play Free Online | Bao Bonanza",
  description:
    "Play the Squishy Dumpling Game (Bao Bonanza) online for free! Squish cute dumplings, catch rare golden & rainbow Baos, build combos, and chase high scores in your browser.",
  keywords: [
    "squishy dumpling game",
    "bao bonanza",
    "dumpling game",
    "free online browser game",
    "squishy game online",
    "bao game"
  ],
  alternates: {
    canonical: "https://www.shhdesign.co.uk/squishy-dumpling-game",
  },
  openGraph: {
    title: "Squishy Dumpling Game - Play Free Online | Bao Bonanza",
    description:
      "Play Bao Bonanza, a free browser squishy dumpling game! Catch golden and rainbow Baos, build massive combos, and set your high score.",
    url: "https://www.shhdesign.co.uk/squishy-dumpling-game",
    siteName: "SHH Design",
    type: "website",
    images: [
      {
        url: "https://www.shhdesign.co.uk/squishy-dumpling-game.jpeg", // Replace with your actual preview image path
        width: 1200,
        height: 630,
        alt: "Squishy Dumpling Game - Bao Bonanza",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Squishy Dumpling Game - Play Free Online",
    description: "Squish cute dumplings and chase high scores in Bao Bonanza!",
    images: ["https://www.shhdesign.co.uk/squishy-dumpling-game.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SquishyDumplingGamePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <SquishyDumplingGameContent />
      <Footer />
    </main>
  )
}