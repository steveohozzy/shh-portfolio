import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WorkPageContent } from "@/components/work-page-content"

export const metadata: Metadata = {
  title: "Work | Steven Howard Hoskins",
  description:
    "Explore my portfolio of frontend development projects including e-commerce, CMS implementations, and web applications.",
}

export default function WorkPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <WorkPageContent />
      <Footer />
    </main>
  )
}
