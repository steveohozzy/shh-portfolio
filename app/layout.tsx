import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "SHH Design | Steven Hoskins | Frontend Developer",
  description: `SHH Design is the portfolio site of Steven Hoskins an experienced Frontend Developer with over ${new Date().getFullYear() - 2006 - (new Date().getMonth() < 5 ? 1 : 0)} years of experience building performant, accessible, and visually stunning web experiences.`,
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1d23" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="shh-theme">
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
