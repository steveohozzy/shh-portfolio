"use client"

import { useState } from "react"
import { Send, Mail, MapPin, ArrowUpRight, Github, Linkedin, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

const socialLinks = [
  { name: "CodePen", href: "https://codepen.io/hoskinshozzy", icon: Code },
  { name: "LinkedIn", href: "https://linkedin.com/in/steven-hoskins-8072709", icon: Linkedin },
  { name: "GitHub", href: "https://github.com/steveohozzy", icon: Github },
]

export function ContactPageContent() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: leftRef, isVisible: leftVisible } = useScrollAnimation<HTMLDivElement>()
  const { ref: rightRef, isVisible: rightVisible } = useScrollAnimation<HTMLDivElement>()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    // 🛡️ Honeypot check (spam protection)
    if (formData.get("_gotcha")) {
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch("https://formspree.io/f/maqlgaoy", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      })

      const data = await res.json().catch(() => null)

      if (res.ok) {
        setIsSubmitted(true)
        form.reset()
      } else {
        setError(
          data?.errors?.[0]?.message ||
          "Something went wrong. Please try again."
        )
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="pt-32 pb-24 lg:pb-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative">

        {/* HEADER */}
        <div ref={headerRef} className={cn("max-w-3xl mb-16 animate-on-scroll", headerVisible && "is-visible")}>
          <p className="text-primary font-mono text-sm tracking-wider uppercase mb-4">Contact</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
            Let's Build Something Amazing Together
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">

          {/* LEFT */}
          <div ref={leftRef} className={cn("space-y-8 animate-on-scroll-left", leftVisible && "is-visible")}>
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

          {/* RIGHT */}
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

                {/* 🛡️ Honeypot (hidden spam trap) */}
                <input
                  type="text"
                  name="_gotcha"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input name="name" id="name" placeholder="Your name" required />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input name="email" id="email" type="email" placeholder="you@example.com" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input name="subject" id="subject" placeholder="Project inquiry" required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    name="message"
                    id="message"
                    placeholder="Tell me about your project..."
                    className="min-h-[150px] bg-background border-border focus:border-primary resize-none"
                    required
                  />
                </div>

                {/* INLINE ERROR (no alerts anymore) */}
                {error && (
                  <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                    {error}
                  </div>
                )}

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