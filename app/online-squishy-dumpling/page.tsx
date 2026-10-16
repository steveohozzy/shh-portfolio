
import type { Metadata } from "next";
import OnlineSquishyDumpling from "@/components/online-squishy-dumpling/online-squishy-dumpling-content";

export const metadata: Metadata = {
  title: "Online Squishy Dumpling – Free Interactive Toy",
  description:
    "Play with a cute online squishy dumpling! Choose different dumplings, squeeze, stretch, pull and bounce your squishy toy in this free interactive experience.",
  alternates: {
    canonical: "/online-squishy-dumpling",
  },
  openGraph: {
    title: "Online Squishy Dumpling – Free Interactive Toy",
    description:
      "Pick your favourite dumpling, squish it, stretch it and watch it bounce in this cute free online fidget toy.",
    url: "/online-squishy-dumpling",
    type: "website",
    images: [
      {
        url: "/online-squishy-dumpling.jpeg",
        width: 1200,
        height: 630,
        alt: "Online Squishy Dumpling interactive game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Squishy Dumpling – Free Interactive Toy",
    description:
      "Choose a dumpling, squeeze it, stretch it and bounce it around in this cute online squishy toy.",
    images: ["/online-squishy-dumpling.jpeg"],
  },
};

export default function Page() {
  return <OnlineSquishyDumpling />;
}
