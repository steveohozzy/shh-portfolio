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
              <a
                href="/cv.pdf"
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
