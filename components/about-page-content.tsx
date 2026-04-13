"use client"

import { Code2, Palette, Zap, Globe, ArrowRight, FileText } from "lucide-react"
import Link from "next/link"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"
import { TiltCard } from "./tilt-card"
import { MagneticButton } from "@/components/magnetic-button"
import { useRef, useCallback } from "react"

const skills = [
  {
    category: "Frontend",
    icon: Code2,
    items: ["React", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3"],
    color: "#3b82f6",
  },
  {
    category: "Styling",
    icon: Palette,
    items: ["SASS/SCSS", "Tailwind CSS", "CSS Modules", "Styled Components", "Animations"],
    color: "#ec4899",
  },
  {
    category: "Platforms",
    icon: Globe,
    items: ["SFCC", "Shopify", "SAP", "Zesty CMS", "Contentful"],
    color: "#22c55e",
  },
  {
    category: "Tools",
    icon: Zap,
    items: ["Git", "Figma", "Photoshop", "Webpack", "Webflow"],
    color: "#f59e0b",
  },
]

const experience = [
  {
    role: "Lead Web Developer",
    company: "The Entertainer",
    period: "Jun 2025 - Present",
    description:
      "In working for Britain’s largest toy store I lead and develop everything front-end. Complete site redesigns, content hubs, new features, competitions, games and more! Working with our back-end agency I create everything you see on The Entertainer website and am a leader in the decision making on approaches, testing, UI/UX, tooling etc. I work hand in hand with our testing lead to create meaningful multi-variant tests in Dynamic Yield to establish what our users really want and deliver on them and constantly look to improve all experiences for our users. I also lead they way in improving our performance, our platform and partners we use. I am also responsible for implementing any new tools or partners. Since joining the business it has been noted that I have vastly improved revenue with the new content the business can offer it customers and working with retailers LEGO to create exclusive content.",
  },
  {
    role: "Senior Front-End Developer",
    company: "The Commerce Team Global",
    period: "Oct 2022 - Dec 2024",
    description: `Responsible for Front-End implementations of stores mainly on the
Salesforce Commerce Cloud but also includes Shopify, BigCommerce, Zesty and
some React development. Leading the design reviews, coding practices,
decision making of tools to be used with applications and ensuring
performance and accessibility of applications is as high as possible. Also
responsible for designing products offered by the company such as go to
market sites and POC’s and some clients sites.Offer guidance from start to
finish of design process with client adding amendments, interaction design,
UX, latest design trends and performance and accessibility guidance.`,
  },
  {
    role: "Senior Developer",
    company: "DEPT",
    period: "Jul 2019 - Oct 2022",
    description: `After BE Excellent became part of DEPT I continued with my role as senior
front-end developer. Responsible for implementing designs and building
functionality using Salesforce Commerce Cloud, Shopify, Parsley/YAML, React
storybook andmany other platforms and languages. I also help guide on designs
and use my UX expertise with clients. Working on projects in many different
areas of business and with different teams within DEPT around the world. I
help lead the front-end, review code and offer guidance to more junior
members.`,
  },
  {
    role: "Senior Web Developer",
    company: "Be Excellent",
    period: "Sep 2016 - Jan 2019",
  },
  {
    role: "Senior Front-End Developer and Manager",
    company: "Figleaves",
    period: "Jan 2012 - Sep 2016",
  },
  {
    role: "Front-End Developer",
    company: "Impero",
    period: "Sep 2011 - Dec 2011",
  },
  {
    role: "Creative Web Designer and Developer",
    company: "Clock Ltd",
    period: "Jun 2006 - Sep 2011",
  },
]

type Stat = {
  value: string;
  label: string;
};

const getYearsExperience = (startYear: number, startMonth: number): string => {
  const now = new Date();
  let years = now.getFullYear() - startYear;

  if (now.getMonth() < startMonth) {
    years--;
  }

  return `${years}+`;
};

const stats: Stat[] = [
  { value: getYearsExperience(2006, 5), label: "Years Experience" },
  { value: "100%", label: "Passion" },
];

function SkillCard({ skill, index, isVisible }: { skill: typeof skills[0]; index: number; isVisible: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current
    if (!card) return
    
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    card.style.setProperty("--mouse-x", `${x}px`)
    card.style.setProperty("--mouse-y", `${y}px`)
  }, [])

  return (
    <TiltCard
      className={cn(
        "animate-on-scroll",
        isVisible && "is-visible",
      )}
      tiltAmount={8}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="group relative h-full p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all duration-500 overflow-hidden"
        style={{ 
          transitionDelay: `${index * 100}ms`,
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties}
      >
        {/* Spotlight effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), ${skill.color}15, transparent 60%)`
          }}
        />
        
        {/* Animated border glow */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${skill.color}20, transparent 50%, ${skill.color}10)`,
          }}
        />

        {/* Icon with animated background */}
        <div 
          className="relative w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110"
          style={{ backgroundColor: `${skill.color}15` }}
        >
          <skill.icon className="w-7 h-7 transition-colors duration-300" style={{ color: skill.color }} />
          <div 
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
            style={{ boxShadow: `0 0 20px ${skill.color}40` }}
          />
        </div>

        {/* Category */}
        <h3 className="relative text-lg font-semibold mb-4 group-hover:text-primary transition-colors duration-300">
          {skill.category}
        </h3>

        {/* Skills List with stagger */}
        <ul className="relative space-y-2.5">
          {skill.items.map((item, itemIndex) => (
            <li 
              key={item} 
              className="text-sm text-muted-foreground flex items-center gap-3 group-hover:text-foreground/80 transition-all duration-300"
              style={{ transitionDelay: `${itemIndex * 50}ms` }}
            >
              <span 
                className="w-1.5 h-1.5 rounded-full transition-all duration-300 group-hover:scale-150"
                style={{ backgroundColor: skill.color }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </TiltCard>
  )
}

export function AboutPageContent() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: skillsRef, isVisible: skillsVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: experienceRef, isVisible: experienceVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation<HTMLDivElement>()

  return (
    <section className="pt-32 pb-24 lg:pb-32">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">
          <div ref={heroRef} className={cn("animate-on-scroll-left", heroVisible && "is-visible")}>
            <p className="text-primary font-mono text-sm tracking-wider uppercase mb-4">About Me</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Crafting elegant digital experiences.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              I'm Steven Howard Hoskins, a frontend developer based in the United Kingdom with over 18 years of
              experience building performant, accessible, and visually stunning web experiences.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              My journey began with a passion for both design and code. Today, I specialize in enterprise e-commerce
              solutions, continuously expanding my expertise in
              modern frameworks like React and Next.js. My approach is always the same to be experimental and
              innovative whilst maintaining a high level of quality, permormance and accessibility.
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton
                as="a"
                href="/cv.pdf"
                className="group px-8 py-4 border-2 border-border bg-primary text-primary-foreground font-medium rounded-full hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Download CV
                </span>
              </MagneticButton>
              <MagneticButton
                as="a"
                href="/contact"
                className="group px-8 py-4 border-2 border-border text-foreground font-medium rounded-full hover:text-primary-foreground hover:border-primary/50 hover:bg-primary transition-all duration-300"
              >
                Get in Touch
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
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
        <div id="skills" className="pb-24 lg:pb-32 relative overflow-hidden">
          {/* Animated background gradients */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-gradient opacity-30" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-gradient opacity-20" style={{ animationDelay: "-4s" }} />
    
          <div className="container mx-auto relative">
            {/* Section Header */}
            <div ref={headerRef} className={cn("max-w-2xl mb-16 animate-on-scroll", headerVisible && "is-visible")}>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-12">Skills & Technologies</h2>
            </div>
    
            {/* Skills Grid */}
            <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {skills.map((skill, index) => (
                <SkillCard key={skill.category} skill={skill} index={index} isVisible={gridVisible} />
              ))}
            </div>
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
