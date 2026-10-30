"use client";

import { useEffect, useRef, useState } from "react";
import { vpad, type PadKey } from "./game/input";
import { sfx } from "./game/sfx";

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
  const knob = useRef<HTMLSpanElement>(null);
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = pad.current?.getBoundingClientRect();
    if (!rect) return;
    let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    let y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    const distance = Math.hypot(x, y);
    if (distance > 1) { x /= distance; y /= distance; }
    if (knob.current) knob.current.style.transform = `translate(${x * 27}px, ${y * 27}px)`;
    const dead = 0.24;
    vpad.left = x < -dead;
    vpad.right = x > dead;
    vpad.up = y < -dead;
    vpad.down = y > dead;
  };
  const release = () => {
    vpad.left = vpad.right = vpad.up = vpad.down = false;
    if (knob.current) knob.current.style.transform = "translate(0, 0)";
  };
  return (
    <div ref={pad} className="ak-joystick" role="group" aria-label="Movement joystick"
      onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); move(event); }}
      onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event); }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
      onContextMenu={(event) => event.preventDefault()}>
      <span ref={knob} className="ak-joystick-knob" />
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
  const gameRef = useRef<any>(null);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);

  const togglePause = () => {
    const game = gameRef.current;
    if (!game) return;
    const isPaused = game.scene.isPaused("Game");
    const isActive = game.scene.isActive("Game");
    if (!isPaused && !isActive) return;
    if (isPaused) game.scene.resume("Game");
    else game.scene.pause("Game");
    setPaused(!isPaused);
  };

  useEffect(() => {
    const savedMute = window.localStorage.getItem("alex-kidd-muted") === "true";
    setMuted(savedMute);
    sfx.setMuted(savedMute);

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.code === "Escape" || event.code === "KeyP") && !event.repeat) {
        event.preventDefault();
        togglePause();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paused]);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try { await document.fonts.load('8px "Press Start 2P"'); } catch {}
      const { createGame } = await import("./game/createGame");
      if (!cancelled && host.current) {
        const game = createGame(host.current);
        gameRef.current = game;
      }
    };

    void start();
    return () => {
      cancelled = true;
      Object.keys(vpad).forEach((key) => { vpad[key as PadKey] = false; });
      gameRef.current?.destroy(true);
      gameRef.current = null;
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
          <div className="ak-game-tools">
            <button
              type="button"
              className="ak-game-tool"
              aria-pressed={!muted}
              onClick={() => {
                const nextMuted = !muted;
                setMuted(nextMuted);
                sfx.setMuted(nextMuted);
                window.localStorage.setItem("alex-kidd-muted", String(nextMuted));
              }}
            >
              {muted ? "SOUND OFF" : "SOUND ON"}
            </button>
            <button type="button" className="ak-game-tool" onClick={togglePause}>
              {paused ? "RESUME" : "PAUSE"}
            </button>
          </div>
          <div ref={host} className="ak-game-screen" />
          {paused && (
            <div className="ak-pause-overlay">
              <span>PAUSED</span>
              <button type="button" className="ak-game-tool" onClick={togglePause}>RESUME GAME</button>
            </div>
          )}
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
        <p className="ak-instructions">KEYBOARD: ARROWS MOVE · Z JUMP · X PUNCH · ENTER START · P / ESC PAUSE</p>
      </div>
    </main>
  );
}
