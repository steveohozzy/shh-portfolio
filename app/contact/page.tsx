import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactPageContent } from "@/components/contact-page-content"

export const metadata: Metadata = {
  title: "Contact | Steven Howard Hoskins",
  description: "Get in touch with Steven Howard Hoskins for frontend development projects and collaborations.",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ContactPageContent />
      <Footer />
    </main>
  )
}
