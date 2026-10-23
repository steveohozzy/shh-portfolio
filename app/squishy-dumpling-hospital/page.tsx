
import type { Metadata } from "next";
import SquishyDumplingHospital from "./SquishyDumplingHospital";

export const metadata: Metadata = {
  title: "Squishy Dumpling Hospital – Free Online Game",
  description:
    "Play Squishy Dumpling Hospital! Treat adorable dumpling patients with patches, plasters and repair kits in this free kawaii hospital game.",
  alternates: {
    canonical: "/squishy-dumpling-hospital",
  },
};

export default function SquishyDumplingHospitalPage() {
  return <SquishyDumplingHospital />;
}
