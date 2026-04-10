"use client"

import type React from "react"
import { useEffect, useRef, useCallback, memo, useState } from "react"
import { Github, Linkedin, ArrowRight, FileText, Code } from "lucide-react"
import Link from "next/link"
import { MagneticButton } from "@/components/magnetic-button"
import { SplitText } from "@/components/text-reveal"
import { AnimatedCounter } from "@/components/animated-counter"

const socialLinks = [
  { icon: Code, href: "https://codepen.io", label: "CodePen" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
]

const techStack = ["React", "TypeScript", "Next.js", "SASS", "Node.js", "Figma"]

const FloatingBadge = memo(function FloatingBadge({
  label,
  className,
  delay,
  index,
}: {
  label: string
  className: string
  delay: number
  index: number
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`absolute px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-full text-xs font-mono text-primary animate-float cursor-default transition-all duration-300 ${className} ${isHovered ? 'scale-110 border-primary shadow-lg shadow-primary/20' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="relative z-10">{label}</span>
      {isHovered && (
        <span className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
      )}
    </div>
  )
})

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const container = containerRef.current
    if (!container) return

    requestAnimationFrame(() => {
      const { left, top, width, height } = container.getBoundingClientRect()
      const x = (e.clientX - left) / width
      const y = (e.clientY - top) / height
      container.style.setProperty("--mouse-x", `${x}`)
      container.style.setProperty("--mouse-y", `${y}`)
    })
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => container.removeEventListener("mousemove", handleMouseMove)
  }, [handleMouseMove])

  return (
    <section
      ref={containerRef}
      id="about"
      className="relative min-h-screen flex items-center overflow-hidden noise-bg"
      style={
        {
          "--mouse-x": "0.5",
          "--mouse-y": "0.5",
        } as React.CSSProperties
      }
    >
      {/* Animated background gradient - GPU accelerated */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: `radial-gradient(800px circle at calc(var(--mouse-x) * 100%) calc(var(--mouse-y) * 100%), var(--primary) / 0.2, transparent 40%)`,
        }}
      />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-gradient opacity-50" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-gradient opacity-30" style={{ animationDelay: "-4s" }} />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-20 dark:opacity-40 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              
              {/* Main heading with text reveal */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
                  {mounted && <SplitText className="block">Hello, I'm</SplitText>}
                </h1>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
                  {mounted && (
                    <SplitText className="text-primary block" staggerDelay={40}>
                      Steven Howard Hoskins
                    </SplitText>
                  )}
                </h1>
              </div>
              
              {/* Animated subtitle line */}
              <div className={`flex items-center gap-4 transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-primary to-transparent" />
                <span className="text-muted-foreground font-mono text-sm">Frontend Developer</span>
              </div>
            </div>

            <p
              className={`text-lg text-muted-foreground leading-relaxed max-w-lg transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              I craft elegant digital experiences with a focus on{" "}
              <span className="text-foreground font-medium">performance</span>,{" "}
              <span className="text-foreground font-medium">accessibility</span>, and{" "}
              <span className="text-foreground font-medium">delightful interactions</span>.
            </p>

            {/* CTA Buttons with magnetic effect */}
            <div className={`flex flex-wrap gap-4 pt-4 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <MagneticButton
                as="a"
                href="/work"
                className="group px-8 py-4 bg-primary text-primary-foreground font-medium rounded-full hover:shadow-xl hover:shadow-primary/30 transition-shadow duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  View My Work
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </MagneticButton>
              
              <MagneticButton
                as="a"
                href="#"
                className="group px-8 py-4 border-2 border-border text-foreground font-medium rounded-full hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Download CV
                </span>
              </MagneticButton>
            </div>

            {/* Social Links with hover animation */}
            <div
              className={`flex items-center gap-6 pt-8 transition-all duration-700 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Connect</span>
              <div className="h-px w-12 bg-border" />
              <div className="flex items-center gap-2">
                {socialLinks.map((social, index) => (
                  <MagneticButton
                    key={social.label}
                    as="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300"
                  >
                    <social.icon className="w-5 h-5" />
                    <span className="sr-only">{social.label}</span>
                  </MagneticButton>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Visual Element */}
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="relative w-80 h-80 xl:w-[420px] xl:h-[420px]">
              {/* Outer glowing ring */}
              <div className="absolute inset-0 rounded-full border border-primary/20 animate-spin-slow" />
              <div className="absolute inset-2 rounded-full border border-dashed border-primary/10 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "30s" }} />
              
              {/* Glowing gradient rings */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary/30 via-transparent to-primary/10 animate-spin-slow opacity-60" />
              <div
                className="absolute inset-8 rounded-full bg-gradient-to-bl from-primary/20 via-transparent to-primary/20 animate-spin-slow"
                style={{ animationDirection: "reverse", animationDuration: "25s" }}
              />

              {/* Center content with glow */}
              <div className="absolute inset-12 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center overflow-hidden shadow-2xl">
                <div className="text-center space-y-2">
                  <div className="text-6xl xl:text-7xl font-bold text-primary">
                    <AnimatedCounter end={18} suffix="+" duration={2000} />
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Years Experience</div>
                </div>
              </div>

              {/* Floating tech badges */}
              {techStack.map((tech, index) => {
                const positions = [
                  "-top-2 left-1/2 -translate-x-1/2",
                  "top-1/4 -right-6",
                  "bottom-1/4 -right-2",
                  "-bottom-2 left-1/2 -translate-x-1/2",
                  "bottom-1/4 -left-2",
                  "top-1/4 -left-6"
                ]
                return (
                  <FloatingBadge
                    key={tech}
                    label={tech}
                    className={positions[index]}
                    delay={index * 0.3}
                    index={index}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator with animation */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground transition-all duration-1000 delay-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <span className="text-xs uppercase tracking-wider font-mono">Scroll to explore</span>
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
