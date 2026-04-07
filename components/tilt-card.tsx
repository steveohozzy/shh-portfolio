"use client"

import type React from "react"
import { useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  tiltAmount?: number
  glareEnabled?: boolean
}

export function TiltCard({ children, className, tiltAmount = 10, glareEnabled = true }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current
    const glare = glareRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -tiltAmount
    const rotateY = ((x - centerX) / centerX) * tiltAmount

    card.style.setProperty("--rotate-x", `${rotateX}deg`)
    card.style.setProperty("--rotate-y", `${rotateY}deg`)

    if (glare && glareEnabled) {
      glare.style.opacity = "1"
      glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, transparent 60%)`
    }
  }, [tiltAmount, glareEnabled])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    const glare = glareRef.current
    if (!card) return

    card.style.setProperty("--rotate-x", "0deg")
    card.style.setProperty("--rotate-y", "0deg")

    if (glare) {
      glare.style.opacity = "0"
    }
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("card-3d relative", className)}
      style={{
        "--rotate-x": "0deg",
        "--rotate-y": "0deg",
      } as React.CSSProperties}
    >
      {children}
      {glareEnabled && (
        <div
          ref={glareRef}
          className="absolute inset-0 rounded-inherit pointer-events-none opacity-0 transition-opacity duration-300"
          style={{ borderRadius: "inherit" }}
        />
      )}
    </div>
  )
}
