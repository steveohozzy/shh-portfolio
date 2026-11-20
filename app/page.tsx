import type { Metadata } from 'next'
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProjectsSection } from "@/components/projects-section"
import { SkillsSection } from "@/components/skills-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "SHH Design | Steven Hoskins – Senior Frontend Developer",
  description:
    "SHH Design is the portfolio of Steven Hoskins, a UK-based Senior Frontend Developer specialising in React, Next.js, TypeScript, accessible websites and high-performance e-commerce experiences.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "SHH Design | Steven Hoskins – Senior Frontend Developer",
    description:
      "Explore SHH Design, the portfolio of Steven Hoskins – Senior Frontend Developer specialising in React, Next.js, TypeScript and high-performance web experiences.",
    url: "/",
    siteName: "SHH Design",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "SHH Design - Steven Hoskins Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SHH Design | Steven Hoskins – Senior Frontend Developer",
    description:
      "SHH Design showcases the frontend development work and projects of Steven Hoskins, specialising in React, Next.js and modern web applications.",
    images: ["/og-image.jpeg"],
  },
}

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://www.shhdesign.co.uk/#person",
    "name": "Steven Hoskins",
    "jobTitle": "Senior Frontend Developer",
    "url": "https://www.shhdesign.co.uk/",
    "sameAs": [
      "https://uk.linkedin.com/in/steven-hoskins-8072709",
      "https://github.com/steveohozzy",
      "https://codepen.io/hoskinshozzy",
      "https://www.facebook.com/steveo.hozzy",
      "https://www.instagram.com/hoskinshozzy/",
      "https://x.com/shhdesign_"
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