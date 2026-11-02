import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SquishyLemmings from "./SquishyLemmings"
import "./squishy-dumpling-lemmings.css"

export const metadata: Metadata = {
  title: "Squishy Dumpling Lemmings | SHH Design",
  description: "Guide a parade of kawaii squishy dumplings safely home in this playful lemmings-inspired puzzle game.",
  alternates: { canonical: "/squishy-dumpling-lemmings" },
  openGraph: {
    title: "Squishy Dumpling Lemmings | SHH Design",
    description: "Give your tiny bao buddies skills, build bridges and guide the whole dumpling parade to the exit.",
    url: "/squishy-dumpling-lemmings",
    siteName: "SHH Design",
    type: "website",
  },
}

export default function SquishyDumplingLemmingsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <SquishyLemmings />
      <Footer />
    </main>
  )
}
