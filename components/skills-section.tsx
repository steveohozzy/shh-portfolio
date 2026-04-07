"use client"

import React from "react"

import { Code2, Palette, Zap, Globe } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"
import { AnimatedCounter } from "@/components/animated-counter"
import { SplitText } from "@/components/text-reveal"
import { TiltCard } from "@/components/tilt-card"
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
    items: ["SFCC", "Shopify", "WordPress", "Zesty CMS", "Contentful"],
    color: "#22c55e",
  },
  {
    category: "Tools",
    icon: Zap,
    items: ["Git", "Figma", "VS Code", "Docker", "Webpack", "Vite"],
    color: "#f59e0b",
  },
]

const stats = [
  { value: 50, suffix: "+", label: "Projects Completed" },
  { value: 7, suffix: "+", label: "Years Experience" },
  { value: 30, suffix: "+", label: "Happy Clients" },
  { value: 100, suffix: "%", label: "Code Quality" },
]

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

export function SkillsSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation<HTMLDivElement>()

  return (
    <section id="skills" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-gradient opacity-30" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-gradient opacity-20" style={{ animationDelay: "-4s" }} />

      <div className="container mx-auto px-6 lg:px-12 relative">
        {/* Section Header */}
        <div ref={headerRef} className={cn("max-w-2xl mb-16 animate-on-scroll", headerVisible && "is-visible")}>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            <span className="text-primary font-mono text-xs tracking-wider uppercase">Expertise</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            {headerVisible && <SplitText>Technologies & Tools I Work With</SplitText>}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            I specialize in building modern, performant web applications using cutting-edge technologies and best
            practices.
          </p>
        </div>

        {/* Skills Grid */}
        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            <SkillCard key={skill.category} skill={skill} index={index} isVisible={gridVisible} />
          ))}
        </div>

        {/* Stats Bar with animated counters */}
        <div
          ref={statsRef}
          className={cn(
            "mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-card/50 backdrop-blur-sm border border-border rounded-2xl animate-on-scroll-scale relative overflow-hidden",
            statsVisible && "is-visible",
          )}
        >
          {/* Gradient decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className={cn(
                "text-center relative group",
                index !== 0 && "border-l border-border"
              )}
            >
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                {statsVisible && (
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2000 + index * 200} />
                )}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
