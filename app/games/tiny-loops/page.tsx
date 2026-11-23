import type { Metadata } from "next";
import TinyLoopsGame from "./TinyLoopsGame";
import "./tiny-loops.css";

export const metadata: Metadata = {
  title: "Loop Rush — Rollercoaster Challenge | SHH Design",
  description: "A fast, one-touch rollercoaster stunt game. Build speed, nail the loops and make it to the finish.",
};

export default function TinyLoopsPage() {
  return <TinyLoopsGame />;
}
