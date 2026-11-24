"use client";

import dynamic from "next/dynamic";

const TinyLoopsGame = dynamic(() => import("./TinyLoopsGame"), {
  ssr: false,
  loading: () => <div className="loop-rush-loading">Loading Loop Rush…</div>,
});

export default function TinyLoopsClient() {
  return <TinyLoopsGame />;
}
