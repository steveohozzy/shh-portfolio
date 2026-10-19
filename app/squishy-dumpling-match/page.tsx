
import type { Metadata } from "next";
import SquishyDumplingMatch from "./SquishyDumplingMatch";

export const metadata: Metadata = {
  title: "Squishy Dumpling Match – Free Online Match 3 Game",
  description:
    "Play Squishy Dumpling Match, a free online match 3 puzzle game! Stack cute squishy dumplings, match three or more, trigger chain reactions and beat your high score.",
  alternates: {
    canonical: "https://www.shhdesign.co.uk/squishy-dumpling-match",
  },
  openGraph: {
    title: "Squishy Dumpling Match – Free Online Match 3 Game",
    description:
      "Stack adorable dumplings, make matches and trigger satisfying chain reactions in this free online puzzle game.",
    url: "https://www.shhdesign.co.uk/squishy-dumpling-match",
    type: "website",
  },
};

export default function SquishyDumplingMatchPage() {
  return <SquishyDumplingMatch />;
}
