"use client"

import Link from "next/link"
import { Home, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-30 animate-pulse" />

      {/* Grid background (same as hero) */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Radial mouse glow feel (static fallback) */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-xl px-6">
        
        {/* Label */}
        <p className="text-primary font-mono text-sm tracking-widest uppercase mb-4">
          Error
        </p>

        {/* Big number */}
        <div className="text-7xl sm:text-8xl font-bold text-primary mb-6 tracking-tight">
          {mounted ? "404" : "..."}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Lost in the grid
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
          The page you’re looking for doesn’t exist — or it’s been moved into the void.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <Home className="w-4 h-4" />
            Back Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-full font-medium hover:bg-secondary/40 transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
        </div>

        {/* subtle footer hint */}
        <p className="text-xs text-muted-foreground mt-10 font-mono">
          Try checking the URL or exploring the site
        </p>
      </div>
    </section>
  )
}