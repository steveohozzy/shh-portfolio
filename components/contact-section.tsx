"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Send, Mail, MapPin, ArrowUpRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"
import { SplitText } from "@/components/text-reveal"
import { MagneticButton } from "@/components/magnetic-button"

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const { ref: leftRef, isVisible: leftVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: rightRef, isVisible: rightVisible } = useScrollAnimation<HTMLDivElement>()
  const formRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const form = formRef.current
    if (!form) return
    
    const rect = form.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    form.style.setProperty("--mouse-x", `${x}px`)
    form.style.setProperty("--mouse-y", `${y}px`)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <section id="contact" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none animate-gradient opacity-40" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-gradient opacity-30" style={{ animationDelay: "-4s" }} />

      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left Column - Info */}
          <div ref={leftRef} className={cn("space-y-8 animate-on-scroll-left", leftVisible && "is-visible")}>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-4">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-primary font-mono text-xs tracking-wider uppercase">Get in Touch</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                {leftVisible && <SplitText>Let's Build Something Amazing Together</SplitText>}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Have a project in mind? I'd love to hear about it. Whether it's a new website, a redesign, or a complex
                web application, I'm here to help bring your vision to life.
              </p>
            </div>

            {/* Contact Info with hover effects */}
            <div className="space-y-4">
              {[
                { icon: Mail, label: "Email", value: "hello@shhdesign.co.uk", href: "mailto:hello@shhdesign.co.uk" },
                { icon: MapPin, label: "Location", value: "United Kingdom", href: null },
              ].map((item, index) => (
                <div 
                  key={item.label}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-border hover:bg-card/50 transition-all duration-300 cursor-default"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="font-medium hover:text-primary transition-colors animated-underline">
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links with magnetic effect */}
            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Or find me on</p>
              <div className="flex flex-wrap gap-3">
                {[
                   { href: "https://codepen.io/hoskinshozzy", name: "CodePen" },
                    {href: "https://uk.linkedin.com/in/steven-hoskins-8072709", name: "LinkedIn" },
                    { href: "https://github.com/steveohozzy", name: "GitHub" },
                ].map((link, index) => (
                  <MagneticButton
                    key={link.name}
                    as="a"
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 px-5 py-2.5 border border-border rounded-full text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </MagneticButton>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Form with spotlight effect */}
          <div
            ref={rightRef}
            className={cn(
              "animate-on-scroll-right",
              rightVisible && "is-visible",
            )}
          >
            <div
              ref={formRef}
              onMouseMove={handleMouseMove}
              className="relative bg-card border border-border rounded-2xl p-8 lg:p-10 overflow-hidden"
              style={{
                "--mouse-x": "50%",
                "--mouse-y": "50%",
              } as React.CSSProperties}
            >
              {/* Spotlight effect */}
              <div 
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), var(--primary) / 0.06, transparent 60%)`
                }}
              />
              
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Thank You!</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Your message has been sent successfully. I'll get back to you as soon as possible.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="mt-4 rounded-full"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="relative space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label 
                        htmlFor="name" 
                        className={cn(
                          "text-sm font-medium transition-colors duration-300",
                          focusedInput === "name" && "text-primary"
                        )}
                      >
                        Name
                      </label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        className="bg-background border-border focus:border-primary transition-all duration-300 focus:shadow-lg focus:shadow-primary/10"
                        required
                        onFocus={() => setFocusedInput("name")}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label 
                        htmlFor="email" 
                        className={cn(
                          "text-sm font-medium transition-colors duration-300",
                          focusedInput === "email" && "text-primary"
                        )}
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="bg-background border-border focus:border-primary transition-all duration-300 focus:shadow-lg focus:shadow-primary/10"
                        required
                        onFocus={() => setFocusedInput("email")}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label 
                      htmlFor="subject" 
                      className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        focusedInput === "subject" && "text-primary"
                      )}
                    >
                      Subject
                    </label>
                    <Input
                      id="subject"
                      placeholder="Project inquiry"
                      className="bg-background border-border focus:border-primary transition-all duration-300 focus:shadow-lg focus:shadow-primary/10"
                      required
                      onFocus={() => setFocusedInput("subject")}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label 
                      htmlFor="message" 
                      className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        focusedInput === "message" && "text-primary"
                      )}
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell me about your project..."
                      className="min-h-[150px] bg-background border-border focus:border-primary resize-none transition-all duration-300 focus:shadow-lg focus:shadow-primary/10"
                      required
                      onFocus={() => setFocusedInput("message")}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </div>

                  <MagneticButton
                    as="button"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-12 text-base font-medium hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Send Message
                          <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                  </MagneticButton>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
