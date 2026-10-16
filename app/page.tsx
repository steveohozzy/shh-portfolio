import type { Metadata } from 'next'
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProjectsSection } from "@/components/projects-section"
import { SkillsSection } from "@/components/skills-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "SHH Design | Steven Hoskins | Senior Frontend Developer",
    description:
      "Portfolio of Steven Hoskins – Senior Frontend Developer specializing in React, Next.js, TypeScript, and modern web application development.",
    url: "/",
    siteName: "SHH Design",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHH Design | Steven Hoskins | Senior Frontend Developer",
    description:
      "Portfolio of Steven Hoskins – Senior Frontend Developer specializing in React, Next.js, TypeScript, and modern web application development.",
  },
}

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Steven Hoskins",
    "jobTitle": "Senior Frontend Developer",
    "url": "https://www.shhdesign.co.uk",
    "sameAs": [
      "https://uk.linkedin.com/in/steven-hoskins-8072709",
      "https://github.com/steveohozzy",
      "https://codepen.io/hoskinshozzy"
    ],
    "knowsAbout": [
      "React",
      "TypeScript",
      "Next.js",
      "SASS",
      "Node.js",
      "Figma",
      "Frontend Development",
      "UI/UX Design",
      "Web Performance",
      "Accessibility"
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "SHH Design"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-background">
        <Header />
        <HeroSection />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  )
}