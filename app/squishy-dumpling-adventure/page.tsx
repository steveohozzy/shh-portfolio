import type { Metadata } from "next";
import SquishyDumplingAdventure from "./SquishyDumplingAdventure";

export const metadata: Metadata = {
  title: "Squishy Dumpling Adventure – Free Online Game",
  description:
    "Play Squishy Dumpling Adventure, a cute free online platform game. Jump across colourful levels, collect goo and stars, dodge spikes and guide your squishy dumpling home.",
  keywords: [
    "squishy dumpling adventure",
    "dumpling game",
    "free online platform game",
    "browser game",
    "squishy game online",
    "cute platformer"
  ],
  alternates: {
    canonical: "/squishy-dumpling-adventure",
  },
  openGraph: {
    title: "Squishy Dumpling Adventure – Free Online Game",
    description:
      "Jump, bounce and collect goo in this cute free online platform game. Can you guide your dumpling through every level?",
    url: "/squishy-dumpling-adventure",
    siteName: "SHH Design",
    type: "website",
    images: [
      {
        url: "/squishy-dumpling-adventure.jpeg",
        width: 1200,
        height: 630,
        alt: "Squishy Dumpling Adventure online game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Squishy Dumpling Adventure – Free Online Game",
    description:
      "Jump, collect goo and dodge spikes in this cute online platform game.",
    images: ["/squishy-dumpling-adventure.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <SquishyDumplingAdventure />;
}