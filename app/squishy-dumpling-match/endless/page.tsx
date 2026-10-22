
import type { Metadata } from "next";
import SquishyDumplingMatch from "../SquishyDumplingMatch";
import "../squishy-dumpling-match.css";

export const metadata: Metadata = {
  title: "Endless Squish – Free Online Squishy Dumpling Game",
  description:
    "Play Endless Squish, a free online squishy dumpling puzzle game! Stack cute bao characters, match three or more across, down or diagonally, trigger chain reactions and beat your high score.",
};

export default function EndlessPage() {
  return <SquishyDumplingMatch />;
}
