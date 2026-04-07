"use client"

import type React from "react"
import { useState } from "react"
import { Send, Mail, MapPin, ArrowUpRight, Github, Linkedin, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

const socialLinks = [
  { name: "CodePen", href: "https://codepen.io", icon: Code },
  { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { name: "GitHub", href: "https://github.com", icon: Github },
]

export function ContactPageContent() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: leftRef, isVisible: leftVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: rightRef, isVisible: rightVisible } = useScrollAnimation<HTMLDivElement>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <section className="pt-32 pb-24 lg:pb-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative">
        {/* Page Header */}
        <div ref={headerRef} className={cn("max-w-3xl mb-16 animate-on-scroll", headerVisible && "is-visible")}>
          <p className="text-primary font-mono text-sm tracking-wider uppercase mb-4">Contact</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
            Let's Build Something Amazing Together
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Have a project in mind? I'd love to hear about it. Whether it's a new website, a redesign, or a complex web
            application, I'm here to help bring your vision to life.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left Column - Info */}
          <div ref={leftRef} className={cn("space-y-8 animate-on-scroll-left", leftVisible && "is-visible")}>
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">Get in Touch</h2>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href="mailto:hello@shhdesign.co.uk" className="font-medium hover:text-primary transition-colors">
                    hello@shhdesign.co.uk
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">United Kingdom</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-6">Find me on social media</p>
              <div className="grid gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <link.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{link.name}</span>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="p-6 bg-card border border-border rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium">Available for Projects</span>
              </div>
              <p className="text-sm text-muted-foreground">
                I'm currently taking on new projects. Reach out and let's discuss how we can work together.
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div
            ref={rightRef}
            className={cn(
              "bg-card border border-border rounded-2xl p-8 lg:p-10 animate-on-scroll-right",
              rightVisible && "is-visible",
            )}
          >
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Send className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Message Sent!</h3>
                <p className="text-muted-foreground mb-6">
                  Thanks for reaching out. I'll get back to you as soon as possible.
                </p>
                <button onClick={() => setIsSubmitted(false)} className="text-primary hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">Send a Message</h2>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      className="bg-background border-border focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="bg-background border-border focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="Project inquiry"
                    className="bg-background border-border focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="budget" className="text-sm font-medium">
                    Budget Range (Optional)
                  </label>
                  <Input
                    id="budget"
                    placeholder="e.g., £5,000 - £10,000"
                    className="bg-background border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell me about your project..."
                    className="min-h-[150px] bg-background border-border focus:border-primary resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-12 text-base font-medium"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Message
                      <Send className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
