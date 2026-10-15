import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SquishyDumplingGameContent } from "@/components/squishy-dumpling-game/squishy-dumpling-game-content"

export const metadata: Metadata = {
  title: "Squishy Dumpling Game – Play Bao Bonanza | SHH Design",
  description:
    "Play Bao Bonanza, a free squishy dumpling game! Squish cute dumplings, catch rare golden and rainbow Baos, build combos and beat your high score.",
  alternates: {
    canonical: "https://www.shhdesign.co.uk/squishy-dumpling-game",
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