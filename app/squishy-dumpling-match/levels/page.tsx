
import type { Metadata } from "next";
import SquishyDumplingLevels from "./SquishyDumplingLevels";

export const metadata: Metadata = {
  title: "Dumpling World – Free Squishy Dumpling Match-3 Game",
  description:
    "Play Dumpling World, a free online squishy dumpling match-3 game! Match colourful bao characters, create special power-ups and conquer 50 challenging levels across five magical worlds.",
};

export default function DumplingWorldPage() {
  return <SquishyDumplingLevels />;
}
