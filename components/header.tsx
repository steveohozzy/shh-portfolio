"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { MagneticButton } from "@/components/magnetic-button"

const navItems = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const pathname = usePathname()

  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 50
    setIsScrolled(scrolled)
    
    // Calculate scroll progress
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0
    setScrollProgress(progress)
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent",
      )}
    >
      {/* Scroll progress indicator */}
      <div 
        className="absolute bottom-0 left-0 h-px bg-primary transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
      
      <nav className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo with hover animation */}
          <Link
            href="/"
            className="group relative text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors duration-300"
          >
            <span className="relative z-10">
              SHH<span className="text-primary group-hover:text-foreground transition-colors duration-300">.</span>
            </span>
            <span className="absolute inset-0 -z-10 scale-0 group-hover:scale-100 transition-transform duration-300 bg-primary/10 rounded-lg" />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-1">
            {navItems.map((item, index) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full group",
                    pathname === item.href 
                      ? "text-foreground" 
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {/* Background highlight */}
                  <span 
                    className={cn(
                      "absolute inset-0 rounded-full transition-all duration-300",
                      pathname === item.href 
                        ? "bg-primary/10" 
                        : "bg-transparent group-hover:bg-secondary"
                    )}
                  />
                  <span className="relative z-10">{item.label}</span>
                  {/* Active indicator dot */}
                  {pathname === item.href && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <MagneticButton
              as="a"
              href="/contact"
              className="px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              <span className="relative z-10">Get in Touch</span>
            </MagneticButton>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative p-2 text-foreground rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              <span className={cn(
                "block w-5 h-0.5 bg-current transition-all duration-300",
                isMobileMenuOpen && "rotate-45 translate-y-1.5"
              )} />
              <span className={cn(
                "block w-5 h-0.5 bg-current my-1 transition-all duration-300",
                isMobileMenuOpen && "opacity-0"
              )} />
              <span className={cn(
                "block w-5 h-0.5 bg-current transition-all duration-300",
                isMobileMenuOpen && "-rotate-45 -translate-y-1.5"
              )} />
            </button>
          </div>
        </div>

        {/* Mobile Menu with slide animation */}
        <div
          className={cn(
            "md:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border transition-all duration-500 ease-out overflow-hidden",
            isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <ul className="px-6 py-6 space-y-2">
            {navItems.map((item, index) => (
              <li 
                key={item.label}
                className={cn(
                  "transition-all duration-300",
                  isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                )}
                style={{ transitionDelay: isMobileMenuOpen ? `${index * 75}ms` : "0ms" }}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block py-3 px-4 text-lg font-medium rounded-xl transition-all duration-300",
                    pathname === item.href 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li 
              className={cn(
                "pt-4 transition-all duration-300",
                isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              )}
              style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
            >
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-block w-full text-center px-5 py-3 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:shadow-lg hover:shadow-primary/25 transition-all"
              >
                Get in Touch
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
