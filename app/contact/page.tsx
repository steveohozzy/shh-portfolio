import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactPageContent } from "@/components/contact-page-content"

export const metadata: Metadata = {
  title: "Contact | SHH Design | Steven Hoskins | Frontend Developer",
  description: "Get in touch with Steven Hoskins for frontend development projects and collaborations.",
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
