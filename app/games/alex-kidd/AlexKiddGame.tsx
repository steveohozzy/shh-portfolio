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

function Joystick() {
  const pad = useRef<HTMLDivElement>(null);
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = pad.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (event.clientX - rect.left) / rect.width * 2 - 1;
    const y = (event.clientY - rect.top) / rect.height * 2 - 1;
    const dead = 0.24;
    vpad.left = x < -dead;
    vpad.right = x > dead;
    vpad.up = y < -dead;
    vpad.down = y > dead;
  };
  const release = () => { vpad.left = vpad.right = vpad.up = vpad.down = false; };
  return (
    <div ref={pad} className="ak-joystick" role="group" aria-label="Movement joystick"
      onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); move(event); }}
      onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event); }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
      onContextMenu={(event) => event.preventDefault()}>
      <span className="ak-joystick-knob" />
    </div>
  );
}

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
          <section className="ak-controls" aria-label="Game controls">
            <div className="ak-dpad">
              {controls.slice(0, 4).map((item) => <GameButton key={item.key} item={item} />)}
            </div>
            <Joystick />
            <GameButton item={controls[4]} />
            <div className="ak-actions">
              <GameButton item={controls[5]} />
              <GameButton item={controls[6]} />
            </div>
          </section>
        </div>
        <p className="ak-instructions">KEYBOARD: ARROWS MOVE · Z JUMP · X PUNCH · ENTER START</p>
      </div>
    </main>
  );
}
