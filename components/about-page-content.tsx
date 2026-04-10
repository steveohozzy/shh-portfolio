"use client"

import { Code2, Palette, Zap, Globe, Download, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

const skills = [
  {
    category: "Frontend",
    icon: Code2,
    items: ["React", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3"],
  },
  {
    category: "Styling",
    icon: Palette,
    items: ["SASS/SCSS", "Tailwind CSS", "CSS Modules", "Styled Components", "Animations"],
  },
  {
    category: "Platforms",
    icon: Globe,
    items: ["SFCC", "Shopify", "WordPress", "Zesty CMS", "Contentful"],
  },
  {
    category: "Tools",
    icon: Zap,
    items: ["Git", "Figma", "VS Code", "Docker", "Webpack", "Vite"],
  },
]

const experience = [
  {
    role: "Senior Frontend Developer",
    company: "The Commerce Team",
    period: "2020 - Present",
    description:
      "Leading frontend development for enterprise e-commerce clients, implementing SFCC solutions and modern web applications.",
  },
  {
    role: "Frontend Developer",
    company: "Digital Agency",
    period: "2017 - 2020",
    description: "Built responsive websites and web applications for various clients across different industries.",
  },
  {
    role: "Junior Developer",
    company: "Web Studio",
    period: "2015 - 2017",
    description: "Started career building WordPress sites and learning modern frontend technologies.",
  },
]

const stats = [
  { value: "18+", label: "Years Experience" },
  { value: "100%", label: "Code Quality" },
]

export function AboutPageContent() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: skillsRef, isVisible: skillsVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: experienceRef, isVisible: experienceVisible } = useScrollAnimation<HTMLDivElement>()

  return (
    <section className="pt-32 pb-24 lg:pb-32">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">
          <div ref={heroRef} className={cn("animate-on-scroll-left", heroVisible && "is-visible")}>
            <p className="text-primary font-mono text-sm tracking-wider uppercase mb-4">About Me</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Crafting Digital Experiences Since 2015
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              I'm Steven Howard Hoskins, a frontend developer based in the United Kingdom with over 7 years of
              experience building performant, accessible, and visually stunning web experiences.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              My journey began with a passion for both design and code. Today, I specialize in enterprise e-commerce
              solutions, particularly Salesforce Commerce Cloud (SFCC), while continuously expanding my expertise in
              modern frameworks like React and Next.js.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all duration-300"
              >
                <Download className="w-4 h-4" />
                Download CV
              </a>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-medium rounded-full hover:bg-secondary transition-all duration-300"
              >
                Get in Touch
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "p-6 bg-card border border-border rounded-2xl animate-on-scroll",
                  statsVisible && "is-visible",
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-12">Skills & Technologies</h2>
          <div ref={skillsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map((skill, index) => (
              <div
                key={skill.category}
                className={cn(
                  "group p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 animate-on-scroll",
                  skillsVisible && "is-visible",
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <skill.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-4">{skill.category}</h3>
                <ul className="space-y-2">
                  {skill.items.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Section */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-12">Experience</h2>
          <div ref={experienceRef} className="space-y-8">
            {experience.map((job, index) => (
              <div
                key={job.role}
                className={cn(
                  "relative pl-8 pb-8 border-l border-border last:pb-0 animate-on-scroll-left",
                  experienceVisible && "is-visible",
                )}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Timeline dot */}
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary" />

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <h3 className="text-xl font-semibold">{job.role}</h3>
                  <span className="text-sm text-muted-foreground">@ {job.company}</span>
                </div>
                <p className="text-sm text-primary font-mono mb-3">{job.period}</p>
                <p className="text-muted-foreground leading-relaxed">{job.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
