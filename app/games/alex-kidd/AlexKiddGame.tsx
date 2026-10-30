"use client";

import { useEffect, useRef } from "react";
import { vpad, type PadKey } from "./game/input";

const controls: { key: PadKey; label: string; className?: string }[] = [
  { key: "up", label: "▲", className: "up" },
  { key: "left", label: "◀", className: "left" },
  { key: "down", label: "▼", className: "down" },
  { key: "right", label: "▶", className: "right" },
  { key: "start", label: "START", className: "start" },
  { key: "punch", label: "PUNCH", className: "punch" },
  { key: "jump", label: "JUMP", className: "jump" },
];

function GameButton({ item }: { item: (typeof controls)[number] }) {
  const set = (value: boolean) => () => { vpad[item.key] = value; };
  return (
    <button
      type="button"
      className={`ak-control ak-control-${item.className ?? ""}`}
      onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); set(true)(); }}
      onPointerUp={set(false)}
      onPointerCancel={set(false)}
      onLostPointerCapture={set(false)}
      onContextMenu={(event) => event.preventDefault()}
      aria-label={item.label}
    >
      {item.label}
    </button>
  );
}

export default function AlexKiddGame() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: { destroy: (removeCanvas: boolean) => void } | undefined;
    let cancelled = false;

    const start = async () => {
      try { await document.fonts.load('8px "Press Start 2P"'); } catch {}
      const { createGame } = await import("./game/createGame");
      if (!cancelled && host.current) game = createGame(host.current);
    };

    void start();
    return () => {
      cancelled = true;
      Object.keys(vpad).forEach((key) => { vpad[key as PadKey] = false; });
      game?.destroy(true);
    };
  }, []);

  return (
    <main className="ak-page">
      <div className="ak-shell">
        <a className="ak-back" href="/">← SHH DESIGN</a>
        <header className="ak-heading">
          <p>8-BIT PLATFORM ADVENTURE</p>
          <h1>PUNCH KID</h1>
          <span>ISLAND OF WONDERS</span>
        </header>
        <div className="ak-screen-frame">
          <div ref={host} className="ak-game-screen" />
        </div>
        <section className="ak-controls" aria-label="Game controls">
          <div className="ak-dpad">
            {controls.slice(0, 4).map((item) => <GameButton key={item.key} item={item} />)}
          </div>
          <GameButton item={controls[4]} />
          <div className="ak-actions">
            <GameButton item={controls[5]} />
            <GameButton item={controls[6]} />
          </div>
        </section>
        <p className="ak-instructions">KEYBOARD: ARROWS MOVE · Z JUMP · X PUNCH · ENTER START</p>
      </div>
    </main>
  );
}
