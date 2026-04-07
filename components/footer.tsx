"use client"

import { Github, Linkedin, Mail, ArrowUp, Code } from "lucide-react"
import Link from "next/link"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"
import { MagneticButton } from "@/components/magnetic-button"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Code, href: "#", label: "CodePen" },
  { icon: Mail, href: "mailto:hello@shhdesign.co.uk", label: "Email" },
]

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { ref, isVisible } = useScrollAnimation<HTMLElement>()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer ref={ref} className={cn("relative overflow-hidden animate-on-scroll", isVisible && "is-visible")}>
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <span className="text-2xl font-bold tracking-tight">
                SHH<span className="text-primary group-hover:text-foreground transition-colors">.</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Crafting elegant digital experiences with a focus on performance, accessibility, and delightful interactions.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-2 pt-4">
              {socialLinks.map((social) => (
                <MagneticButton
                  key={social.label}
                  as="a"
                  href={social.href}
                  className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                  <span className="sr-only">{social.label}</span>
                </MagneticButton>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors animated-underline inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:hello@shhdesign.co.uk"
                  className="text-muted-foreground hover:text-foreground transition-colors animated-underline inline-block"
                >
                  hello@shhdesign.co.uk
                </a>
              </li>
              <li className="text-muted-foreground">
                United Kingdom
              </li>
            </ul>
            
            <div className="mt-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-muted-foreground">Available for work</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © {currentYear} SHH Design. All rights reserved.
          </p>
          
          {/* Back to top button */}
          <MagneticButton
            as="button"
            onClick={scrollToTop}
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to top
            <span className="p-1.5 rounded-full border border-border group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </MagneticButton>
        </div>
      </div>
    </footer>
  )
}
