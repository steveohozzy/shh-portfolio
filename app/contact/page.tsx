import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactPageContent } from "@/components/contact-page-content"

export const metadata: Metadata = {
  title: "Contact Steven Hoskins | Frontend Developer | SHH Design",
  description:
    "Get in touch with Steven Hoskins for senior frontend development opportunities, contract web projects, and technical collaborations.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Steven Hoskins | Senior Frontend Developer",
    description:
      "Get in touch for frontend development projects, web application builds, and technical collaborations.",
    url: "/contact",
    siteName: "SHH Design",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Steven Hoskins | Senior Frontend Developer",
    description:
      "Get in touch for frontend development projects, web application builds, and technical collaborations.",
  },
  robots: {
    index: true,
    follow: true,
  },
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