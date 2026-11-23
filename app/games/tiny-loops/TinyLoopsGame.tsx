"use client";

import { useEffect, useRef, useState } from "react";
import * as Phaser from "phaser";

type GameState = "ready" | "playing" | "crashed" | "won";
type GameEvent = { type: GameState; level: number; speed: number };

const LEVELS = [
  { name: "First Flight", loops: 1, hills: 2, target: 0.31 },
  { name: "Double Trouble", loops: 2, hills: 2, target: 0.34 },
  { name: "Sky High", loops: 2, hills: 3, target: 0.37 },
  { name: "The Big Drop", loops: 3, hills: 2, target: 0.4 },
  { name: "Loop Legend", loops: 3, hills: 3, target: 0.43 },
];

class LoopRushScene extends Phaser.Scene {
  private points: Phaser.Math.Vector2[] = [];
  private progress = 0;
  private speed = 0;
  private holding = false;
  private state: GameState = "ready";
  private level = 0;
  private cart!: Phaser.GameObjects.Container;
  private track!: Phaser.GameObjects.Graphics;
  private scenery!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Graphics;
  private onEvent: (event: GameEvent) => void;
  private lastEvent = 0;
  private cameraX = 0;
  private crashY = 0;

  constructor(onEvent: (event: GameEvent) => void) {
    super("LoopRush");
    this.onEvent = onEvent;
  }

  create() {
    this.cameras.main.setBackgroundColor("#bdeaff");
    this.track = this.add.graphics();
    this.scenery = this.add.graphics();
    this.hud = this.add.graphics();
    this.cart = this.add.container(0, 0);
    const shadow = this.add.ellipse(0, 15, 56, 13, 0x365b70, 0.2);
    const body = this.add.rectangle(0, 0, 48, 23, 0xff704d, 1).setStrokeStyle(3, 0x8f342d);
    body.setOrigin(0.5);
    const seat = this.add.rectangle(-3, -12, 19, 9, 0x263b54);
    const head = this.add.circle(7, -24, 10, 0xffd2a3).setStrokeStyle(2, 0x9c684b);
    const helmet = this.add.arc(7, -27, 11, 190, 350, false, 0x4d54c7).setStrokeStyle(5, 0x30378f);
    const wheel1 = this.add.circle(-15, 13, 7, 0x253348).setStrokeStyle(2, 0xffffff);
    const wheel2 = this.add.circle(15, 13, 7, 0x253348).setStrokeStyle(2, 0xffffff);
    this.cart.add([shadow, body, seat, head, helmet, wheel1, wheel2]);
    this.buildLevel(0);
    this.input.on("pointerdown", () => { if (this.state === "ready" || this.state === "playing") { this.holding = true; if (this.state === "ready") this.startRun(); } });
    this.input.on("pointerup", () => { this.holding = false; });
    this.input.on("pointerupoutside", () => { this.holding = false; });
    this.scale.on("resize", () => this.drawScene());
    this.drawScene();
    this.emit("ready");
  }

  private emit(type: GameState) {
    this.state = type;
    this.onEvent({ type, level: this.level, speed: this.speed });
  }

  private addLine(x1: number, y1: number, x2: number, y2: number, count = 35) {
    for (let i = 1; i <= count; i++) {
      const t = i / count;
      this.points.push(new Phaser.Math.Vector2(Phaser.Math.Linear(x1, x2, t), Phaser.Math.Linear(y1, y2, t)));
    }
  }

  private addLoop(cx: number, cy: number, radius: number) {
    for (let i = 1; i <= 110; i++) {
      const a = Math.PI + (Math.PI * 2 * i) / 110;
      this.points.push(new Phaser.Math.Vector2(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius));
    }
  }

  private addHill(x: number, width: number, height: number, baseY: number) {
    for (let i = 1; i <= 45; i++) {
      const t = i / 45;
      this.points.push(new Phaser.Math.Vector2(x + width * t, baseY - Math.sin(t * Math.PI) * height));
    }
  }

  private buildLevel(index: number) {
    const config = LEVELS[index % LEVELS.length];
    this.points = [new Phaser.Math.Vector2(0, 430)];
    let x = 0;
    const y = 430;
    this.addLine(x, y, 380, y); x = 380;
    for (let i = 0; i < config.loops; i++) {
      this.addLoop(x + 150, y, 150);
      x += 300;
      this.addLine(x, y, x + 100, y + 35); x += 100;
      this.addLine(x, y + 35, x + 180, y + 35); x += 180;
      if (i < config.hills) { this.addHill(x, 260, 95 + i * 12, y + 35); x += 260; }
      this.addLine(x, y + 35, x + 180, y); x += 180;
    }
    this.addLine(x, y, x + 700, y);
    this.progress = 0;
    this.speed = 0;
    this.cameraX = 0;
    this.drawScene();
  }

  private startRun() {
    this.progress = 0;
    this.speed = 180;
    this.emit("playing");
  }

  private sample(position: number) {
    const i = Phaser.Math.Clamp(Math.floor(position), 0, this.points.length - 2);
    const t = Phaser.Math.Clamp(position - i, 0, 1);
    return Phaser.Math.Vector2.Lerp(this.points[i], this.points[i + 1], t);
  }

  private drawScene() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.scenery.clear();
    this.scenery.fillStyle(0xffffff, 0.34);
    for (let i = 0; i < 9; i++) {
      const x = ((i * 177 + 50 - this.cameraX * 0.22) % (width + 160) + width + 160) % (width + 160) - 80;
      this.scenery.fillCircle(x, 90 + (i % 3) * 48, 25 + (i % 3) * 7);
      this.scenery.fillCircle(x + 25, 92 + (i % 3) * 48, 32 + (i % 3) * 5);
    }
    this.scenery.fillStyle(0x83d8a0);
    this.scenery.fillRect(0, height - 55, width, 55);
    this.track.clear();
    const scale = Math.min(width / 820, height / 560, 1.15);
    const offsetY = height * 0.56 - 430 * scale;
    const start = Math.max(0, Math.floor(this.progress - 100));
    const end = Math.min(this.points.length - 1, start + Math.ceil(width / scale) + 180);
    this.track.lineStyle(17 * scale, 0x314d68, 1);
    this.track.beginPath();
    for (let i = start; i <= end; i++) {
      const p = this.points[i];
      const px = (p.x - this.cameraX) * scale + width * 0.24;
      const py = p.y * scale + offsetY;
      if (i === start) this.track.moveTo(px, py); else this.track.lineTo(px, py);
    }
    this.track.strokePath();
    this.track.lineStyle(9 * scale, 0xffc64d, 1);
    this.track.beginPath();
    for (let i = start; i <= end; i++) {
      const p = this.points[i];
      const px = (p.x - this.cameraX) * scale + width * 0.24;
      const py = p.y * scale + offsetY;
      if (i === start) this.track.moveTo(px, py); else this.track.lineTo(px, py);
    }
    this.track.strokePath();
    this.track.lineStyle(3 * scale, 0xffffff, 0.75);
    this.track.beginPath();
    for (let i = start; i <= end; i += 3) {
      const p = this.points[i];
      const px = (p.x - this.cameraX) * scale + width * 0.24;
      const py = p.y * scale + offsetY - 5 * scale;
      if (i === start) this.track.moveTo(px, py); else this.track.lineTo(px, py);
    }
    this.track.strokePath();
  }

  update(_time: number, delta: number) {
    const dt = Math.min(delta / 1000, 0.035);
    if (this.state === "playing") {
      const current = this.sample(this.progress);
      const next = this.sample(this.progress + 1);
      const tangent = next.clone().subtract(current).normalize();
      const gravity = -440 * tangent.y;
      this.speed += (this.holding ? 520 : -70) * dt;
      this.speed += gravity * dt;
      this.speed = Phaser.Math.Clamp(this.speed, 0, 760);
      this.progress += this.speed * dt / 12;
      const p = this.sample(this.progress);
      const angle = Math.atan2(next.y - current.y, next.x - current.x);
      this.cameraX = Math.max(0, p.x - 300);
      const width = this.scale.width;
      const height = this.scale.height;
      const scale = Math.min(width / 820, height / 560, 1.15);
      const offsetY = height * 0.56 - 430 * scale;
      this.cart.setPosition(width * 0.24, p.y * scale + offsetY - 12 * scale);
      this.cart.setScale(scale);
      this.cart.setRotation(angle);
      if (this.progress >= this.points.length - 3) {
        this.emit("won");
      } else if (this.speed < 65 && this.progress > 20) {
        this.crashY = p.y;
        this.emit("crashed");
      } else {
        const loopZone = this.points[Math.floor(this.progress)];
        if (loopZone && p.y < 300 && this.speed < 185) {
          this.emit("crashed");
        }
      }
      if (_time - this.lastEvent > 120) {
        this.lastEvent = _time;
        this.onEvent({ type: "playing", level: this.level, speed: this.speed });
      }
      this.drawScene();
    }
    if (this.state === "ready") {
      const p = this.sample(0);
      const scale = Math.min(this.scale.width / 820, this.scale.height / 560, 1.15);
      this.cart.setPosition(this.scale.width * 0.24, p.y * scale + this.scale.height * 0.56 - 430 * scale - 12);
      this.cart.setScale(scale);
    }
    if (this.state === "crashed") {
      this.cart.y += 260 * dt;
      this.cart.rotation += 2.8 * dt;
    }
  }

  restart() {
    this.holding = false;
    this.buildLevel(this.level);
    this.emit("ready");
    this.startRun();
  }

  nextLevel() {
    this.level = (this.level + 1) % LEVELS.length;
    this.holding = false;
    this.buildLevel(this.level);
    this.emit("ready");
  }
}

export default function TinyLoopsGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<LoopRushScene | null>(null);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [level, setLevel] = useState(0);
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new LoopRushScene((event) => {
      setGameState(event.type);
      setLevel(event.level);
      setSpeed(event.speed);
    });
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: mountRef.current,
      backgroundColor: "#bdeaff",
      scale: { mode: Phaser.Scale.RESIZE, width: "100%", height: "100%" },
      render: { antialias: true, pixelArt: false },
      scene: [scene],
    });
    sceneRef.current = scene;
    return () => { sceneRef.current = null; game.destroy(true); };
  }, []);

  const start = () => sceneRef.current?.restart();
  const next = () => sceneRef.current?.nextLevel();
  const levelName = LEVELS[level % LEVELS.length].name;

  return (
    <main className="loop-rush-page">
      <header className="loop-rush-header">
        <a href="/games" className="loop-rush-back">← All games</a>
        <span className="loop-rush-brand">SHH <b>ARCADE</b></span>
      </header>
      <section className="loop-rush-shell">
        <div className="loop-rush-heading">
          <div><span className="loop-rush-kicker">ONE TOUCH. BIG AIR.</span><h1>LOOP RUSH</h1><p>Hold to power up. Release to coast. Make every loop.</p></div>
          <div className="loop-rush-level"><span>LEVEL {String(level + 1).padStart(2, "0")}</span><b>{levelName}</b></div>
        </div>
        <div className="loop-rush-game-frame">
          <div ref={mountRef} className="loop-rush-canvas" />
          <div className="loop-rush-hud"><span>⚡ {Math.round(speed)} km/h</span><span>HOLD TO ACCELERATE</span></div>
          {gameState === "ready" && <div className="loop-rush-overlay"><span className="loop-rush-pill">READY?</span><h2>LET'S RIDE</h2><p>Touch and hold anywhere to get moving.</p><button onClick={start}>START RIDE <span>→</span></button></div>}
          {gameState === "crashed" && <div className="loop-rush-overlay"><span className="loop-rush-pill">OOPS!</span><h2>WIPEOUT</h2><p>You need a little more speed to clear that stunt.</p><button onClick={start}>TRY AGAIN <span>↻</span></button></div>}
          {gameState === "won" && <div className="loop-rush-overlay"><span className="loop-rush-pill">NICE ONE!</span><h2>TRACK CLEARED</h2><p>You made it to the finish. Ready for the next track?</p><button onClick={next}>NEXT LEVEL <span>→</span></button></div>}
        </div>
        <div className="loop-rush-controls"><span><i className="loop-rush-dot" /> PRESS & HOLD TO ACCELERATE</span><span>RELEASE TO COAST</span><span>DON'T LOSE YOUR MOMENTUM</span></div>
      </section>
      <footer className="loop-rush-footer">A LITTLE ARCADE FUN BY <b>SHH DESIGN</b></footer>
    </main>
  );
}
