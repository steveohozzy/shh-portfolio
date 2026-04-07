"use client"

import React from "react"

import { cn } from "@/lib/utils"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface TextRevealProps {
  children: string
  className?: string
  as?: "h1" | "h2" | "h3" | "p" | "span"
  delay?: number
}

export function TextReveal({ children, className, as: Component = "span", delay = 0 }: TextRevealProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>()

  return (
    <Component
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={cn("text-reveal inline-block", isVisible && "is-visible", className)}
    >
      <span
        className="text-reveal-inner inline-block"
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </span>
    </Component>
  )
}

interface SplitTextProps {
  children: string
  className?: string
  as?: "h1" | "h2" | "h3" | "p" | "span"
  staggerDelay?: number
}

export function SplitText({ children, className, as: Component = "span", staggerDelay = 30 }: SplitTextProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>()
  const words = children.split(" ")

  return (
    <Component
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={className}
      aria-label={children}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block overflow-hidden mr-[0.25em]">
          <span
            className={cn(
              "inline-block transition-all duration-700",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            )}
            style={{
              transitionDelay: `${wordIndex * staggerDelay}ms`,
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </Component>
  )
}
