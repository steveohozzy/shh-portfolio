
import type { Metadata } from "next";
import SquishyDumplingMatch from "../SquishyDumplingMatch";
import "../squishy-dumpling-match.css";

export const metadata: Metadata = {
  title: "Endless Squish – Squishy Dumpling Match",
  description:
    "Play Endless Squish, match cute dumplings, build combos and beat your highest score.",
};

export default function EndlessPage() {
  return <SquishyDumplingMatch />;
}
