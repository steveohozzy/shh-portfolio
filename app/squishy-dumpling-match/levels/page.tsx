
import type { Metadata } from "next";
import SquishyDumplingLevels from "./SquishyDumplingLevels";

export const metadata: Metadata = {
  title: "Dumpling World – Free Online Matching Game",
  description:
    "Explore Dumpling World, match adorable squishy dumplings, complete fun levels and collect stars in this free online game.",
};

export default function DumplingWorldPage() {
  return <SquishyDumplingLevels />;
}
