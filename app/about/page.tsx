import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AboutPageContent } from "@/components/about-page-content"

export const metadata: Metadata = {
  title: "About | Steven Howard Hoskins",
  description:
    "Learn more about Steven Howard Hoskins - Frontend Developer with 7+ years of experience crafting digital experiences.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <AboutPageContent />
      <Footer />
    </main>
  )
}
