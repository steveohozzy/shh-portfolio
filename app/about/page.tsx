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
  title: "About Steven Hoskins | Senior Frontend Developer | SHH Design",
  description: `Learn more about Steven Hoskins – Senior Frontend Developer with ${experience} years of experience crafting performant, accessible, and high-impact web applications.`,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Steven Hoskins | Senior Frontend Developer",
    description: `Frontend Developer with ${experience} years of experience specializing in React, Next.js, and modern UI engineering.`,
    url: "/about",
    siteName: "SHH Design",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Steven Hoskins | Senior Frontend Developer",
    description: `Frontend Developer with ${experience} years of experience specializing in React, Next.js, and modern UI engineering.`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <AboutPageContent />
      <Footer />
    </main>
  )
}