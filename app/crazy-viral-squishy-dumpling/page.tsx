import type { Metadata } from "next";
import CrazyViralSquishyDumplingContent from "@/components/crazy-viral-squishy-dumpling/crazy-viral-squishy-dumpling-content";

export const metadata: Metadata = {
  title: "Crazy Viral Squishy Dumplings – Play & Collect",
  description:
    "Unbox a mystery dumpling, squish your new friend and collect rare, adorable bao! Play the free daily dumpling game, test your bao brain and discover them all.",
  alternates: {
    canonical: "/crazy-viral-squishy-dumpling",
  },
  openGraph: {
    title: "Crazy Viral Squishy Dumplings – Play & Collect",
    description:
      "Your next squishy friend is waiting! Open a daily mystery, collect cute dumplings, hunt for rare finds and squish your favourites.",
    url: "/crazy-viral-squishy-dumpling",
    siteName: "SHH Design",
    type: "website",
    images: [
      {
        url: "/crazy-viral-squishy-dumpling-og.jpeg",
        width: 1200,
        height: 630,
        alt: "Crazy Viral Squishy Dumplings – unbox, squish and collect adorable dumpling friends",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crazy Viral Squishy Dumplings – Play & Collect",
    description:
      "Unbox a mystery, squish your bao and hunt for rare dumpling friends. How many can you collect?",
    images: ["/crazy-viral-squishy-dumpling-og.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <CrazyViralSquishyDumplingContent />;
}