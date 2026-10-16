import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WorkPageContent } from "@/components/work-page-content"

export const metadata: Metadata = {
  title: "Work & Portfolio | Steven Hoskins | Senior Frontend Developer",
  description:
    "Explore the web development portfolio of Steven Hoskins featuring e-commerce builds, headless CMS implementations, React/Next.js web apps, and interactive components.",
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
    title: "Work & Portfolio | Steven Hoskins | Senior Frontend Developer",
    description:
      "Explore high-performance web applications, e-commerce features, and custom CMS implementations built by Steven Hoskins.",
    url: "/work",
    siteName: "SHH Design",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Work & Portfolio | Steven Hoskins | Senior Frontend Developer",
    description:
      "Explore high-performance web applications, e-commerce features, and custom CMS implementations built by Steven Hoskins.",
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