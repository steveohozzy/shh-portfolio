import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.shhdesign.co.uk"

  return [
    { url: baseUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/work`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.6 },

    // Interactive projects and games built for the SHH Design portfolio.
    { url: `${baseUrl}/games/alex-kidd`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/online-squishy-dumpling`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/squishy-dumpling-game`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/squishy-dumpling-adventure`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/crazy-viral-squishy-dumpling`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/squishy-dumpling-match`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/squishy-dumpling-match/endless`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/squishy-dumpling-match/levels`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/squishy-dumpling-hospital`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/squishy-dumpling-lemmings`, changeFrequency: "monthly", priority: 0.7 },

    // Standalone HTML game demos in /public.
    { url: `${baseUrl}/squishy-dumpling-board-game/index.html`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/squishy-dumpling-board-game-monetize/index.html`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/squishy-dumpling-poki-submission/index.html`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/snake-game/index.html`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/rock-paper-scissors/index.html`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/bloodborne/index.html`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/responsive-presentation/index.html`, changeFrequency: "monthly", priority: 0.5 },
  ]
}
