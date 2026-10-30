import type { Metadata } from "next";
import AlexKiddGame from "./AlexKiddGame";
import "./alex-kidd.css";

export const metadata: Metadata = {
  title: "Punch Kid — Island of Wonders | SHH Design",
  description: "A retro 8-bit platform adventure. Punch blocks, swim lagoons and take on the castle boss.",
};

export default function AlexKiddPage() {
  return <AlexKiddGame />;
}
