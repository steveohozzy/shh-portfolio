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
  title: "About | SHH Design | Steven Howard Hoskins | Frontend Developer",
  description: `Learn more about Steven Howard Hoskins - Frontend Developer with ${experience} years of experience crafting digital experiences.`,
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
