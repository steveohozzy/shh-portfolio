"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowUpRight, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const allProjects = [
  {
    id: 1,
    title: "The Entertainer",
    subtitle: "SAP + All Front-end",
    description:
      "Lead front-end developer for Britain's bigest toy store. Overseeing design process and creating editable and dynamic components for the client.",
    tags: ["SAP", "HTML", "JS", "SASS", "Mulitiple Front-end"],
    image: "/TheEntertainer.png",
    link: "https://www.thetoyshop.com/",
    color: "from-[#0d5d9c]/40 to-[#407ec9]/40",
    accent: "#2ab2d1",
    categories: ["E-commerce", "SAP", "Web App"],
  },
  {
    id: 2,
    title: "Ann Summers",
    subtitle: "SFCC Implementation",
    description:
      "A fresh, engaging and clean site with great performance in a competitive market. Full redesign and UX updates to their SFCC site with intuitive, modern and responsive design.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript"],
    image: "/ann.png",
    link: "https://www.annsummers.com",
    color: "from-pink-500/30 to-rose-500/30",
    accent: "#ec4899",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 3,
    title: "Phase Eight",
    subtitle: "SFCC Implementation",
    description:
      "Frontend building and replatforming website onto SFCC. High-end fashion site with a clean design was to be applied.",
    tags: ["SFCC", "ISML", "SASS", "JavaScript", "Figma"],
    image: "/phase-eight.png",
    link: "https://www.phase-eight.com/",
    color: "from-blue-500/30 to-cyan-500/30",
    accent: "#3b82f6",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 4,
    title: "The Early Learning Centre",
    subtitle: "SAP + All Front-end",
    description:
      "Lead front-end developer for the ELC store. Overseeing design process and creating editable and dynamic components for the client.",
    tags: ["SAP", "HTML", "JS", "CSS"],
    image: "/elc.png",
    link: "https://www.elc.co.uk/",
    color: "from-[#0D943F]/40 to-[#407ec9]/40",
    accent: "#0D943F",
    categories: ["E-commerce", "SAP", "Web App"],
  },
  {
    id: 5,
    title: "CamelBak",
    subtitle: "SFCC Implementation",
    description:
      "Frontend building and replatforming website onto SFCC. New design applied with improved interactions and dynamic page designer components.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript"],
    image: "/camelbak.png",
    link: "https://www.camelbak.com",
    color: "from-green-500/30 to-emerald-500/30",
    accent: "#22c55e",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 6,
    title: "Knickerbox",
    subtitle: "SFCC Implementation",
    description:
      "A modern and clean SFCC site for a new to market company. Overseeing design process and creating editable and dynamic components for the client.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript"],
    image: "/knickerbox.png",
    link: "https://www.knickerbox.com",
    color: "from-purple-500/20 to-violet-500/20",
    accent: "#a22ad1",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 7,
    title: "The Commerce Team Global",
    subtitle: "Zesty CMS Design & Build",
    description:
      "Complete design and build responsibility. Tasked with a fresh new look and feel with performance being key. Built with Zesty CMS for maximum flexibility.",
    tags: ["Parsley", "HTML", "SASS", "JavaScript", "Figma"],
    image: "/tctg.webp",
    link: "https://thecommerceteam.com",
    color: "from-blue-500/20 to-cyan-500/20",
    accent: "#2a5fd1",
    categories: ["Web App", "CMS"],
  },
  {
    id: 8,
    title: "Bogner",
    subtitle: "SFCC Implementation",
    description:
      "I was responsible for all frontend related work on this project, creating many creative page designer components. Intuitive and easy to understand in the backend for the client, so a creative multiple layout website was availble to the customer.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript", "Figma"],
    image: "/bogner.png",
    link: "https://www.bogner.com/en-gb/",
    color: "from-black/50 to-white/70",
    accent: "#000000",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 9,
    title: "Hobbs",
    subtitle: "SFCC Implementation",
    description:
      "Frontend building and replatforming website onto SFCC. High end fashion site with a clean design was to be applied.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript", "Figma"],
    image: "/hobbs.png",
    link: "https://www.hobbs.com/",
    color: "from-emrald-500/20 to-blue-500/20",
    accent: "#004e8c",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 10,
    title: "Silentnight",
    subtitle: "React Storybook Implementation",
    description:
      "Frontend React storybook components creation and handover. Working with the in-house backend team I was responsible for creating all frontend components using storybook to be integrated into the React website.",
    tags: ["React", "HTML", "SASS", "JavaScript", "Storybook"],
    image: "/silentnight.png",
    link: "https://www.silentnight.co.uk/",
    color: "from-blue-500/20 to-cyan-800/20",
    accent: "#43505c",
    categories: ["E-commerce", "Web App"],
  },
  {
    id: 11,
    title: "Revelyst",
    subtitle: "SFCC Implementation",
    description:
      "Frontend building of Revelyst e-commerce site. Translating UI designs into a complete website and creating interactive page designer components.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript", "Figma"],
    image: "/revelyst.png",
    link: "https://www.revelyst.com/",
    color: "from-yellow-800/20 to-orange-500/50",
    accent: "#f9a825",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 12,
    title: "Green Pan",
    subtitle: "SFCC Implementation",
    description:
      "Frontend building and replatforming website onto SFCC. Large multinational site that needed to be creative and inspiring but very performant.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript", "Figma"],
    image: "/green-pan.png",
    link: "https://greenpan.co.uk/",
    color: "from-green-500/20 to-yellow-500/20",
    accent: "#007a3d",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 13,
    title: "Whistles",
    subtitle: "SFCC Implementation",
    description:
      "Frontend building and replatforming website onto SFCC. High-end fashion site with a clean design was to be applied.",
    tags: ["SFCC", "ISML", "SASS", "JavaScript", "Figma"],
    image: "/whistles.png",
    link: "https://www.whistles.com/",
    color: "from-yellow-500/20 to-gold-500/20",
    accent: "#f9a825",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 14,
    title: "Camp Chef",
    subtitle: "SFCC Implementation",
    description:
      "New SFCC implementation of the Camp Chef Site, creating reusuable components that were fully editable by the client. Free reign on redesign of site to make it more modern and useable.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript", "Figma"],
    image: "/campchef.png",
    link: "https://www.campchef.com/",
    color: "from-red-900/30 to-black/60",
    accent: "#e74c3c",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 15,
    title: "Bell Helmets",
    subtitle: "SFCC Implementation",
    description:
      "Frontend building of the Bell Helmets e-commerce site. Translating UI designs into a complete website and helping with UX and modernising the elements.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript", "Figma"],
    image: "/bell-helmets.png",
    link: "https://uk.bellhelmets.com/",
    color: "from-red-700/20 to-orange-900/20",
    accent: "#e60b04",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 16,
    title: "Kneipp",
    subtitle: "SFCC Implementation",
    description:
      "New SFCC implementation, creating reusuable components that were fully editable by the client. Free reign on redesign of site to make it more modern and useable.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript", "Figma"],
    image: "/kneipp.jpg",
    link: "https://www.kneipp.com/",
    color: "from-[#004542]/20 to-cyan-500/20",
    accent: "#004542",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 17,
    title: "Bushnell",
    subtitle: "SFCC Implementation",
    description:
      "Implementation of the Bushnell e-commerce website. Translating UI Design into a working multiple hubs website and adding interactivity.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript"],
    image: "/bushnell.png",
    link: "https://www.bushnell.com/",
    color: "from-[#e89438]/20 to-[#c76061]/20",
    accent: "#c76061",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 18,
    title: "GIRO",
    subtitle: "SFCC Implementation",
    description:
      "Implementation of the GIRO e-commerce website. Translating UI Design into a working ighly performant website and adding interactivity.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript", "Figma"],
    image: "/giro.png",
    link: "https://www.giro.com/",
    color: "from-red-500/20 to-orange-500/20",
    accent: "#e74c3c",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 19,
    title: "Remington",
    subtitle: "SFCC Implementation",
    description:
      "Implementation of the Remington Amuunition e-commerce website. Translating UI Design into a working website and adding interactivity.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript", "Figma"],
    image: "/remington.webp",
    link: "https://www.remington.com/",
    color: "from-green-500/20 to-emerald-500/20",
    accent: "#00a870",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 20,
    title: "Fahrrad.de",
    subtitle: "SFCC Implementation",
    description:
      "Implementation of the Fahrrad.de bycicle e-commerce website. Translating UI Design into a working website and adding interactivity.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript", "Figma"],
    image: "/fahrrad.png",
    link: "https://www.fahrrad.de/",
    color: "from-red-500/20 to-orange-500/20",
    accent: "#ec0909",
    categories: ["E-commerce", "SFCC"],
  },
  {
    id: 21,
    title: "Lechuza",
    subtitle: "SFCC Implementation",
    description:
      "Implementation of the Lechuza e-commerce website. Translating UI Design into a working website and adding interactivity.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript", "Figma"],
    image: "/lechuza.png",
    link: "https://thelechuza.co.uk/",
    color: "from-green-500/20 to-emerald-500/20",
    accent: "#00a870",
    categories: ["E-commerce", "SFCC"],
  },
]

const categories = ["All", "E-commerce", "SFCC", "SAP", "CMS", "Web App"]

function WorkProjectCard({
  project,
  index,
}: {
  project: {
  id: number
  title: string
  subtitle: string
  description: string
  tags: string[]
  image: string
  link: string
  color: string
  accent?: string
  categories: string[]
}
  index: number
}) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>()

  return (
    <article
      ref={ref}
      className={cn("group relative animate-on-scroll", isVisible && "is-visible")}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <a href={project.link} target="_blank" rel="noopener noreferrer" className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
          {/* Gradient Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10",
              project.color,
            )}
          />

          {/* Image */}
          <img
            src={project.image || "/placeholder.svg"}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Hover Icon - with magnetic effect */}
          <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 scale-75 group-hover:scale-100">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center border-2 backdrop-blur-sm transition-all duration-300"
              style={{ 
                backgroundColor: `${project.accent}20`,
                borderColor: project.accent
              }}
            >
              <ArrowUpRight className="w-5 h-5" style={{ color: project.accent }} />
            </div>
          </div>

          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-20">
            {project.categories.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1 text-xs font-medium bg-background/90 backdrop-blur-sm rounded-full mr-1"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{project.title}</h3>
          </div>

          <p className="text-sm text-muted-foreground">{project.subtitle}</p>

          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{project.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs font-mono text-primary/80 bg-primary/10 px-2.5 py-1 rounded-md">
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="text-xs font-mono text-muted-foreground px-2.5 py-1">+{project.tags.length - 3}</span>
            )}
          </div>
        </div>
      </a>
    </article>
  )
}

export function WorkPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const activeCategory = searchParams.get("category") || "All"
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation<HTMLDivElement>()

  const filteredProjects =
  activeCategory === "All"
    ? allProjects
    : allProjects.filter((p) =>
        p.categories.includes(activeCategory)
      )

  return (
    <section className="pt-32 pb-24 lg:pb-32">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Page Header */}
        <div ref={headerRef} className={cn("max-w-3xl mb-16 animate-on-scroll", headerVisible && "is-visible")}>
          <p className="text-primary font-mono text-sm tracking-wider uppercase mb-4">Portfolio</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
            Selected Work & Projects
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            A collection of projects I've worked on, ranging from enterprise e-commerce platforms to custom web
            applications. Each project represents a unique challenge and solution.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())

                if (category === "All") {
                  params.delete("category")
                } else {
                  params.set("category", category)
                }

                router.replace(`?${params.toString()}`, {
                  scroll: false,
                })
              }}
              className={cn(
                "px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 cursor-pointer",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <WorkProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {/* CTA */}
        <div ref={ctaRef} className={cn("mt-20 text-center animate-on-scroll", ctaVisible && "is-visible")}>
          <p className="text-muted-foreground mb-6">Interested in working together? Let's discuss your project.</p>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
          >
            Start a Conversation
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
