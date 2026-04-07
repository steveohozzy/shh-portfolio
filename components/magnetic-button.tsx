"use client"

import type React from "react"
import { useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  as?: "button" | "a"
  href?: string
  onClick?: () => void
  target?: string
  rel?: string
}

export function MagneticButton({
  children,
  className,
  as = "button",
  href,
  onClick,
  target,
  rel,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement & HTMLAnchorElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // Limit the magnetic pull
    const pullStrength = 0.2
    button.style.transform = `translate(${x * pullStrength}px, ${y * pullStrength}px)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const button = buttonRef.current
    if (!button) return
    button.style.transform = "translate(0, 0)"
  }, [])

  const Component = as

  return (
    <Component
      ref={buttonRef}
      href={href}
      onClick={onClick}
      target={target}
      rel={rel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "magnetic-btn relative inline-flex items-center justify-center overflow-hidden",
        "transition-all duration-300 ease-out",
        className
      )}
    >
      {children}
    </Component>
  )
}
