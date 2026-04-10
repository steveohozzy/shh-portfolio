"use client"

import type React from "react"
import { useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

type BaseProps = {
  children: React.ReactNode
  className?: string
  as?: "button" | "a"
}

type ButtonProps = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: "button"
  }

type AnchorProps = BaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: "a"
  }

type MagneticButtonProps = ButtonProps | AnchorProps

export function MagneticButton(props: MagneticButtonProps) {
  const {
    children,
    className,
    as = "button",
    ...rest
  } = props as any

  const buttonRef = useRef<HTMLElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

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
      ref={buttonRef as any}
      {...rest}
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