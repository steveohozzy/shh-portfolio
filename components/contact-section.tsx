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
  const [error, setError] = useState<string | null>(null)
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    // 🛡️ honeypot check
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
          data?.errors?.[0]?.message || "Something went wrong. Please try again."
        )
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-24 lg:py-32 relative overflow-hidden">

      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none animate-gradient opacity-40" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-gradient opacity-30" />

      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">

          {/* LEFT */}
          <div ref={leftRef} className={cn("space-y-8 animate-on-scroll-left", leftVisible && "is-visible")}>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-4">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-primary font-mono text-xs tracking-wider uppercase">Get in Touch</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-[1.2]">
                {leftVisible && <SplitText>Let's Build Something Amazing Together</SplitText>}
              </h2>

              <p className="text-muted-foreground text-lg leading-relaxed">
                Have a project in mind? I'd love to hear about it.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Mail, label: "Email", value: "hello@shhdesign.co.uk", href: "mailto:hello@shhdesign.co.uk" },
                { icon: MapPin, label: "Location", value: "United Kingdom", href: null },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-border hover:bg-card/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="font-medium hover:text-primary">
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-border flex flex-wrap gap-3">
              {[
                { href: "https://codepen.io/hoskinshozzy", name: "CodePen" },
                { href: "https://uk.linkedin.com/in/steven-hoskins-8072709", name: "LinkedIn" },
                { href: "https://github.com/steveohozzy", name: "GitHub" },
              ].map((link) => (
                <MagneticButton
                  key={link.name}
                  as="a"
                  href={link.href}
                  className="px-5 py-2 border rounded-full text-sm"
                >
                  {link.name}
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </MagneticButton>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div
            ref={rightRef}
            className={cn("animate-on-scroll-right", rightVisible && "is-visible")}
          >
            <div
              ref={formRef}
              onMouseMove={handleMouseMove}
              className="relative bg-card border border-border rounded-2xl p-8 lg:p-10 overflow-hidden"
            >

              {/* spotlight */}
              <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgb(var(--primary)) / 0.06, transparent 60%)`
                }}
              />

              {isSubmitted ? (
                <div className="text-center py-12 space-y-4">
                  <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
                  <h3 className="text-2xl font-bold">Thank You!</h3>
                  <p className="text-muted-foreground">
                    Your message has been sent.
                  </p>

                  <Button onClick={() => setIsSubmitted(false)} variant="outline">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* honeypot */}
                  <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

                  <div className="grid sm:grid-cols-2 gap-6">
                    <Input name="name" placeholder="Name" required />
                    <Input name="email" type="email" placeholder="Email" required />
                  </div>

                  <Input name="subject" placeholder="Subject" required />

                  <Textarea
                    name="message"
                    placeholder="Tell me about your project..."
                    required
                  />

                  {/* INLINE ERROR */}
                  {error && (
                    <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      {error}
                    </div>
                  )}

                  <MagneticButton
                    as="button"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white rounded-full h-12"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send Message
                        <Send className="w-4 h-4" />
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