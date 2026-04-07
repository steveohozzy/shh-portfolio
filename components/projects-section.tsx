"use client"

import React from "react"

import { memo, useRef, useCallback } from "react"
import { ExternalLink, ArrowRight, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { MagneticButton } from "@/components/magnetic-button"
import { SplitText } from "@/components/text-reveal"

const projects = [
  {
    id: 1,
    title: "Ann Summers",
    subtitle: "SFCC Implementation",
    description:
      "A fresh, engaging and clean site with great performance in a competitive market. Full redesign and UX updates to their SFCC site with intuitive, modern and responsive design.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript"],
    image: "/modern-ecommerce-website-fashion-lingerie-pink-ele.jpg",
    link: "https://www.annsummers.com",
    color: "from-pink-500/30 to-rose-500/30",
    accent: "#ec4899",
  },
  {
    id: 2,
    title: "The Commerce Team Global",
    subtitle: "Zesty CMS Design & Build",
    description:
      "Complete design and build responsibility. Tasked with a fresh new look and feel with performance being key. Built with Zesty CMS for maximum flexibility.",
    tags: ["Parsley", "HTML", "SASS", "JavaScript", "Figma"],
    image: "/professional-corporate-website-blue-modern-busines.jpg",
    link: "https://thecommerceteam.com",
    color: "from-blue-500/30 to-cyan-500/30",
    accent: "#3b82f6",
  },
  {
    id: 3,
    title: "CamelBak",
    subtitle: "SFCC Implementation",
    description:
      "Frontend building and replatforming website onto SFCC. New design applied with improved interactions and dynamic page designer components.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript"],
    image: "/outdoor-sports-water-bottles-adventure-green-mount.jpg",
    link: "https://www.camelbak.com",
    color: "from-green-500/30 to-emerald-500/30",
    accent: "#22c55e",
  },
  {
    id: 4,
    title: "Knickerbox",
    subtitle: "SFCC Implementation",
    description:
      "A modern and clean SFCC site for a new to market company. Overseeing design process and creating editable and dynamic components for the client.",
    tags: ["SFCC", "HTML", "ISML", "SASS", "JavaScript"],
    image: "/fashion-underwear-lingerie-elegant-purple-modern-e.jpg",
    link: "https://www.knickerbox.com",
    color: "from-violet-500/30 to-purple-500/30",
    accent: "#8b5cf6",
  },
]

const ProjectCard = memo(function ProjectCard({
  project,
  index,
  isVisible,
}: {
  project: (typeof projects)[0]
  index: number
  isVisible: boolean
}) {
  const cardRef = useRef<HTMLElement>(null)
  
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
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative animate-on-scroll rounded-2xl overflow-hidden",
        isVisible && "is-visible"
      )}
      style={{ 
        transitionDelay: `${index * 150}ms`,
        "--mouse-x": "50%",
        "--mouse-y": "50%",
      } as React.CSSProperties}
    >
      <a href={project.link} target="_blank" rel="noopener noreferrer" className="block">
        {/* Spotlight effect on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
          style={{
            background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), ${project.accent}20, transparent 60%)`
          }}
        />
        
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Gradient Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-all duration-500 z-10",
              project.color,
            )}
          />
          
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-10" />

          {/* Image */}
          <img
            src={project.image || "/placeholder.svg"}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
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
          
          {/* Content overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {project.title}
              </h3>
              <span 
                className="text-xs font-medium border rounded-full px-3 py-1 backdrop-blur-sm transition-all duration-300"
                style={{ 
                  borderColor: `${project.accent}50`,
                  backgroundColor: `${project.accent}10`,
                  color: project.accent
                }}
              >
                {project.subtitle}
              </span>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
              {project.description}
            </p>

            {/* Tags with stagger animation */}
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, tagIndex) => (
                <span 
                  key={tag} 
                  className="text-xs font-mono bg-background/50 backdrop-blur-sm px-2.5 py-1 rounded-md border border-border/50 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/5"
                  style={{ transitionDelay: `${tagIndex * 50}ms` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </a>
    </article>
  )
})

export function ProjectsSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation<HTMLDivElement>()

  return (
    <section id="work" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background pointer-events-none" />
      
      <div className="container mx-auto px-6 lg:px-12 relative">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={cn(
            "flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 animate-on-scroll",
            headerVisible && "is-visible",
          )}
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-4">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span className="text-primary font-mono text-xs tracking-wider uppercase">Selected Work</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {headerVisible && <SplitText>Projects That Define My Craft</SplitText>}
            </h2>
          </div>
          <MagneticButton
            as="a"
            href="/work"
            className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-border rounded-full hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            View All Projects
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </MagneticButton>
        </div>

        {/* Projects Grid */}
        <div ref={gridRef} className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} isVisible={gridVisible} />
          ))}
        </div>
      </div>
    </section>
  )
}
