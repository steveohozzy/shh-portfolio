import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AboutPageContent } from "@/components/about-page-content"

const getYearsExperience = (startYear: number, startMonth: number): string => {
  const now = new Date();
  let years = now.getFullYear() - startYear;

  if (now.getMonth() < startMonth) {
    years--;
  }

  return `${years}+`;
};

const experience = getYearsExperience(2006, 5);

export const metadata: Metadata = {
  title: "About Steven Hoskins | SHH Design – Senior Frontend Developer",
  description: `Meet Steven Hoskins, the developer behind SHH Design. Discover his 20+ years of frontend development experience across React, Next.js, e-commerce, accessibility and performance.`,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Steven Hoskins | SHH Design – Senior Frontend Developer",
    description: `Learn about Steven Hoskins, a Senior Frontend Developer with ${experience} years of experience specialising in React, Next.js, and modern UI engineering.`,
    url: "/about",
    siteName: "SHH Design",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Steven Hoskins | SHH Design – Senior Frontend Developer",
    description: `Learn about Steven Hoskins, a Senior Frontend Developer with ${experience} years of experience specialising in React, Next.js, and modern UI engineering.`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://www.shhdesign.co.uk/#person",
    "name": "Steven Hoskins",
    "url": "https://www.shhdesign.co.uk/about",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://www.shhdesign.co.uk/about",
    },
    "jobTitle": "Senior Frontend Developer",
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
      "Frontend Development",
      "UI/UX Design",
      "Web Performance",
      "Accessibility"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-background">
        <Header />
        <AboutPageContent />
        <Footer />
      </main>
    </>
  )
}