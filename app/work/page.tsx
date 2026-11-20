import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WorkPageContent } from "@/components/work-page-content"

export const metadata: Metadata = {
  title: "Portfolio & Projects | SHH Design by Steven Hoskins",
  description:
    "Explore SHH Design projects by Steven Hoskins, including e-commerce development, Salesforce Commerce Cloud, SAP, React, Next.js and custom web applications.",
  keywords: [
    "frontend developer portfolio",
    "steven hoskins work",
    "react developer portfolio",
    "next.js portfolio",
    "headless cms projects",
    "e-commerce web development"
  ],
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Portfolio & Projects | SHH Design by Steven Hoskins",
    description:
      "Discover frontend development projects by Steven Hoskins, from enterprise e-commerce experiences to React applications and custom CMS builds.",
    url: "/work",
    siteName: "SHH Design",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio & Projects | SHH Design by Steven Hoskins",
    description:
      "Explore SHH Design work by Steven Hoskins, including high-performance websites, e-commerce experiences and modern web applications.",
  },
  robots: {
    index: true,
    follow: true,
  },
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