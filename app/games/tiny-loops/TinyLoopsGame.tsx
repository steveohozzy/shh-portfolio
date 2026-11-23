"use client";

import { useEffect, useRef, useState } from "react";
import * as Phaser from "phaser";

type GameState = "ready" | "playing" | "crashed" | "won";
type TrackPoint = { x: number; y: number; airborne: boolean };
type Coin = { x: number; y: number; pointIndex: number; collected: boolean };
type Level = { name: string; pattern: string[]; minimumJumpSpeed: number; loopSpeed: number };
type GameEvent = { type: GameState; level: number; speed: number; coins: number; flips: number };

const LEVELS: Level[] = [
  { name: "First Run", pattern: ["hill", "jump"], minimumJumpSpeed: 250, loopSpeed: 180 },
  { name: "Loop the Loop", pattern: ["loop", "hill", "jump"], minimumJumpSpeed: 270, loopSpeed: 205 },
  { name: "Coin Chaser", pattern: ["jump", "hill", "loop"], minimumJumpSpeed: 285, loopSpeed: 210 },
  { name: "Double Trouble", pattern: ["loop", "jump", "loop"], minimumJumpSpeed: 300, loopSpeed: 225 },
  { name: "Big Air", pattern: ["hill", "jump", "jump"], minimumJumpSpeed: 315, loopSpeed: 225 },
  { name: "The Corkscrew", pattern: ["loop", "hill", "loop", "jump"], minimumJumpSpeed: 330, loopSpeed: 240 },
  { name: "High Voltage", pattern: ["jump", "loop", "jump", "hill"], minimumJumpSpeed: 345, loopSpeed: 250 },
  { name: "Double Drop", pattern: ["dip", "jump", "loop", "jump"], minimumJumpSpeed: 360, loopSpeed: 260 },
  { name: "Loop Fever", pattern: ["loop", "loop", "hill", "jump"], minimumJumpSpeed: 375, loopSpeed: 270 },
  { name: "Sky Spinner", pattern: ["jump", "loop", "jump", "loop", "jump"], minimumJumpSpeed: 390, loopSpeed: 280 },
  { name: "Full Throttle", pattern: ["dip", "loop", "jump", "loop", "jump"], minimumJumpSpeed: 405, loopSpeed: 290 },
  { name: "Tiny Loops", pattern: ["loop", "jump", "loop", "dip", "jump", "loop"], minimumJumpSpeed: 420, loopSpeed: 300 },
];

class LoopRushScene extends Phaser.Scene {
  private points: TrackPoint[] = [];
  private coins: Coin[] = [];
  private progress = 0;
  private speed = 0;
  private holding = false;
  private state: GameState = "ready";
  private level = 0;
  private cart!: Phaser.GameObjects.Container;
  private track!: Phaser.GameObjects.Graphics;
  private scenery!: Phaser.GameObjects.Graphics;
  private coinGraphics!: Phaser.GameObjects.Graphics;
  private progressGraphics!: Phaser.GameObjects.Graphics;
  private cameraX = 0;
  private airSpin = 0;
  private airSpinVelocity = 0;
  private flips = 0;
  private coinCount = 0;
  private lastEvent = 0;
  private lastAirborne = false;
  private onEvent: (event: GameEvent) => void;

  constructor(onEvent: (event: GameEvent) => void) {
    super("LoopRush");
    this.onEvent = onEvent;
  }

  create() {
    this.cameras.main.setBackgroundColor("#9edcf3");
    this.scenery = this.add.graphics();
    this.track = this.add.graphics();
    this.coinGraphics = this.add.graphics();
    this.progressGraphics = this.add.graphics();
    this.cart = this.add.container(0, 0);

    const wheels = this.add.graphics();
    wheels.fillStyle(0x25364a, 1);
    wheels.fillCircle(-17, 10, 8);
    wheels.fillCircle(17, 10, 8);
    wheels.lineStyle(2, 0xffffff, 0.9);
    wheels.strokeCircle(-17, 10, 5);
    wheels.strokeCircle(17, 10, 5);
    const chassis = this.add.graphics();
    chassis.fillStyle(0xf05d45, 1);
    chassis.fillRoundedRect(-27, -7, 54, 19, 6);
    chassis.lineStyle(3, 0x8f342d, 1);
    chassis.strokeRoundedRect(-27, -7, 54, 19, 6);
    chassis.fillStyle(0x263b54, 1);
    chassis.fillRoundedRect(-11, -19, 22, 14, 4);
    const rider = this.add.graphics();
    rider.fillStyle(0xffd0a0, 1);
    rider.fillCircle(7, -29, 10);
    rider.lineStyle(2, 0x9c684b, 1);
    rider.strokeCircle(7, -29, 10);
    rider.fillStyle(0x4d54c7, 1);
    rider.fillRoundedRect(-3, -41, 21, 9, 5);
    rider.fillStyle(0x25364a, 1);
    rider.fillRect(5, -16, 5, 13);
    this.cart.add([wheels, chassis, rider]);

    this.buildLevel(0);
    this.input.on("pointerdown", () => {
      if (this.state === "ready" || this.state === "playing") {
        this.holding = true;
        if (this.state === "ready") this.startRun();
      }
    });
    this.input.on("pointerup", () => { this.holding = false; });
    this.input.on("pointerupoutside", () => { this.holding = false; });
    this.input.on("gameout", () => { this.holding = false; });
    this.scale.on("resize", () => this.drawScene());
    this.game.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    this.drawScene();
    this.emit("ready");
  }

  private emit(type: GameState) {
    this.state = type;
    this.onEvent({ type, level: this.level, speed: this.speed, coins: this.coinCount, flips: this.flips });
  }

  private addPoint(x: number, y: number, airborne = false) {
    this.points.push({ x, y, airborne });
  }

  private addLine(x1: number, y1: number, x2: number, y2: number, airborne = false) {
    const length = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(2, Math.ceil(length / 5));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      this.addPoint(Phaser.Math.Linear(x1, x2, t), Phaser.Math.Linear(y1, y2, t), airborne);
    }
  }

  private addHill(x: number, baseY: number, width: number, height: number) {
    const steps = Math.ceil(width / 5);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      this.addPoint(x + width * t, baseY - Math.sin(t * Math.PI) * height);
    }
    return x + width;
  }

  private addDip(x: number, baseY: number, width: number, depth: number) {
    const steps = Math.ceil(width / 5);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      this.addPoint(x + width * t, baseY + Math.sin(t * Math.PI) * depth);
    }
    return x + width;
  }

  private addLoop(startX: number, y: number, radius: number) {
    const centerX = startX + radius;
    const centerY = y - radius;
    const steps = 180;
    for (let i = 1; i <= steps; i++) {
      const angle = Math.PI / 2 - (Math.PI * 2 * i) / steps;
      this.addPoint(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    }
    return startX + radius * 2;
  }

  private addJump(x: number, y: number, width: number, height: number) {
    const rampLength = 75;
    this.addLine(x, y, x + rampLength, y - 28);
    const launchX = x + rampLength;
    const landingX = x + width;
    const flightWidth = landingX - launchX;
    const steps = Math.ceil(flightWidth / 5);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const arc = Math.sin(t * Math.PI);
      this.addPoint(launchX + flightWidth * t, y - 28 - arc * height, true);
    }
    this.addLine(landingX, y, landingX + 110, y);
    return landingX + 110;
  }

  private addCoins(start: number, end: number, count: number, lift = 52) {
    for (let i = 0; i < count; i++) {
      const index = Math.round(Phaser.Math.Linear(start, end, (i + 1) / (count + 1)));
      const point = this.points[index];
      if (point) this.coins.push({ x: point.x, y: point.y - lift, pointIndex: index, collected: false });
    }
  }

  private buildLevel(index: number) {
    const config = LEVELS[index % LEVELS.length];
    this.points = [{ x: 0, y: 365, airborne: false }];
    this.coins = [];
    this.coinCount = 0;
    this.flips = 0;
    this.progress = 0;
    this.speed = 0;
    this.airSpin = 0;
    this.airSpinVelocity = 0;
    this.lastAirborne = false;

    let x = 0;
    let y = 365;
    this.addLine(x, y, x + 250, y);
    x += 250;
    for (let i = 0; i < config.pattern.length; i++) {
      const feature = config.pattern[i];
      const start = this.points.length;
      if (feature === "loop") {
        this.addLine(x, y, x + 100, y);
        x += 100;
        x = this.addLoop(x, y, 100);
        this.addLine(x, y, x + 130, y);
        x += 130;
      } else if (feature === "hill") {
        x = this.addHill(x, y, 280, 105 + (index % 3) * 12);
        this.addLine(x, y, x + 100, y);
        x += 100;
      } else if (feature === "dip") {
        x = this.addDip(x, y, 270, 105 + (index % 3) * 12);
        this.addLine(x, y, x + 100, y);
        x += 100;
      } else {
        x = this.addJump(x, y, 420 + (index % 3) * 35, 125 + (index % 4) * 15);
      }
      this.addCoins(start, this.points.length - 1, feature === "loop" ? 7 : 5, feature === "jump" ? 78 : 48);
    }
    this.addLine(x, y, x + 520, y);
    this.addCoins(this.points.length - 170, this.points.length - 5, 9, 50);
    this.cameraX = 0;
    this.drawScene();
  }

  private startRun() {
    this.progress = 0;
    this.speed = 190;
    this.emit("playing");
  }

  private sample(position: number): TrackPoint {
    const i = Phaser.Math.Clamp(Math.floor(position), 0, this.points.length - 2);
    const t = Phaser.Math.Clamp(position - i, 0, 1);
    const a = this.points[i];
    const b = this.points[i + 1];
    return {
      x: Phaser.Math.Linear(a.x, b.x, t),
      y: Phaser.Math.Linear(a.y, b.y, t),
      airborne: t < 0.5 ? a.airborne : b.airborne,
    };
  }

  private drawBackground(width: number, height: number) {
    this.scenery.clear();
    this.scenery.fillGradientStyle(0x8ed5f0, 0x8ed5f0, 0xd6f4ff, 0xd6f4ff, 1);
    this.scenery.fillRect(0, 0, width, height);
    const scale = Math.min(width / 960, height / 540, 1.25);
    const groundY = height * 0.78;
    this.scenery.fillStyle(0xffffff, 0.55);
    for (let i = 0; i < 7; i++) {
      const cloudX = ((i * 203 + 80 - this.cameraX * 0.16) % (width + 220) + width + 220) % (width + 220) - 110;
      const cloudY = 55 + (i % 3) * 45;
      this.scenery.fillCircle(cloudX, cloudY, 23 * scale);
      this.scenery.fillCircle(cloudX + 24 * scale, cloudY - 8 * scale, 29 * scale);
      this.scenery.fillCircle(cloudX + 53 * scale, cloudY + 2 * scale, 21 * scale);
    }
    this.scenery.fillStyle(0x82d69a, 1);
    this.scenery.fillRect(0, groundY, width, height - groundY);
    this.scenery.fillStyle(0x5cbd7a, 1);
    this.scenery.fillRect(0, groundY, width, 8 * scale);
    for (let i = 0; i < 12; i++) {
      const treeX = ((i * 137 + 20 - this.cameraX * 0.35) % (width + 160) + width + 160) % (width + 160) - 80;
      const treeY = groundY - (i % 3) * 13 * scale;
      this.scenery.fillStyle(0x4b9d70, 1);
      this.scenery.fillTriangle(treeX, treeY - 70 * scale, treeX - 28 * scale, treeY, treeX + 28 * scale, treeY);
    }
  }

  private drawScene() {
    const width = this.scale.width;
    const height = this.scale.height;
    const scale = Math.min(width / 960, height / 540, 1.25);
    const baseY = height * 0.56;
    const screenX = width * 0.24;
    const screenY = (worldY: number) => baseY + (worldY - 365) * scale;
    this.drawBackground(width, height);

    this.track.clear();
    const start = Math.max(0, Math.floor(this.progress - 180));
    const end = Math.min(this.points.length - 1, start + Math.ceil(width / (5 * scale)) + 240);
    let drawing = false;
    this.track.lineStyle(16 * scale, 0x29435d, 1);
    this.track.beginPath();
    for (let i = start; i <= end; i++) {
      const point = this.points[i];
      if (point.airborne) {
        drawing = false;
        continue;
      }
      const px = (point.x - this.cameraX) * scale + screenX;
      const py = screenY(point.y);
      if (!drawing) { this.track.moveTo(px, py); drawing = true; }
      else this.track.lineTo(px, py);
    }
    this.track.strokePath();

    drawing = false;
    this.track.lineStyle(8 * scale, 0xffc64d, 1);
    this.track.beginPath();
    for (let i = start; i <= end; i++) {
      const point = this.points[i];
      if (point.airborne) { drawing = false; continue; }
      const px = (point.x - this.cameraX) * scale + screenX;
      const py = screenY(point.y);
      if (!drawing) { this.track.moveTo(px, py); drawing = true; }
      else this.track.lineTo(px, py);
    }
    this.track.strokePath();

    drawing = false;
    this.track.lineStyle(2 * scale, 0xffffff, 0.8);
    this.track.beginPath();
    for (let i = start; i <= end; i += 2) {
      const point = this.points[i];
      if (point.airborne) { drawing = false; continue; }
      const px = (point.x - this.cameraX) * scale + screenX;
      const py = screenY(point.y) - 5 * scale;
      if (!drawing) { this.track.moveTo(px, py); drawing = true; }
      else this.track.lineTo(px, py);
    }
    this.track.strokePath();

    this.coinGraphics.clear();
    this.coins.forEach((coin) => {
      if (coin.collected || coin.x < this.cameraX - 40 || coin.x > this.cameraX + width / scale + 80) return;
      const cx = (coin.x - this.cameraX) * scale + screenX;
      const cy = screenY(coin.y);
      this.coinGraphics.fillStyle(0xb87819, 1);
      this.coinGraphics.fillCircle(cx, cy, 10 * scale);
      this.coinGraphics.fillStyle(0xffd84e, 1);
      this.coinGraphics.fillCircle(cx, cy, 7 * scale);
      this.coinGraphics.fillStyle(0xfff3a4, 1);
      this.coinGraphics.fillCircle(cx - 2 * scale, cy - 3 * scale, 2 * scale);
    });

    this.progressGraphics.clear();
    this.progressGraphics.fillStyle(0x20364c, 0.25);
    this.progressGraphics.fillRoundedRect(width * 0.34, 18, width * 0.32, 7, 4);
    this.progressGraphics.fillStyle(0xffc64d, 1);
    const ratio = this.progress / Math.max(1, this.points.length - 1);
    this.progressGraphics.fillRoundedRect(width * 0.34, 18, width * 0.32 * ratio, 7, 4);
  }

  update(time: number, delta: number) {
    const dt = Math.min(delta / 1000, 0.035);
    if (this.state === "playing") {
      const current = this.sample(this.progress);
      const ahead = this.sample(Math.min(this.points.length - 2, this.progress + 1));
      const tangentX = ahead.x - current.x;
      const tangentY = ahead.y - current.y;
      const tangentLength = Math.max(0.001, Math.hypot(tangentX, tangentY));
      const tangentAngle = Math.atan2(tangentY, tangentX);
      const previousSpeed = this.speed;

      this.speed += (this.holding ? 300 : -82) * dt;
      this.speed += (tangentY / tangentLength) * 390 * dt;
      this.speed = Phaser.Math.Clamp(this.speed, 0, 790);
      this.progress += (this.speed * dt) / 5;

      const position = this.sample(this.progress);
      const next = this.sample(Math.min(this.points.length - 2, this.progress + 1));
      const isAirborne = position.airborne;
      if (isAirborne) {
        this.airSpinVelocity += (this.holding ? 8.2 : -5.5) * dt;
        this.airSpinVelocity = Phaser.Math.Clamp(this.airSpinVelocity, -7, 9);
        this.airSpin += this.airSpinVelocity * dt;
      } else if (this.lastAirborne) {
        const completedFlips = Math.floor(Math.abs(this.airSpin) / (Math.PI * 2));
        const remainder = Math.atan2(Math.sin(this.airSpin), Math.cos(this.airSpin));
        const levelConfig = LEVELS[this.level % LEVELS.length];
        if (this.speed < levelConfig.minimumJumpSpeed * 0.62 || Math.abs(remainder) > 1.12) {
          this.emit("crashed");
        } else {
          this.flips += completedFlips;
          this.airSpin = 0;
          this.airSpinVelocity = 0;
        }
      }
      this.lastAirborne = isAirborne;

      const angle = Math.atan2(next.y - position.y, next.x - position.x);
      const width = this.scale.width;
      const height = this.scale.height;
      const scale = Math.min(width / 960, height / 540, 1.25);
      this.cameraX = Math.max(0, position.x - 300);
      this.cart.setPosition(width * 0.24, height * 0.56 + (position.y - 365) * scale);
      this.cart.setScale(scale);
      this.cart.setRotation(isAirborne ? angle + this.airSpin : angle);

      this.coins.forEach((coin) => {
        if (!coin.collected && Math.abs(coin.pointIndex - this.progress) < 3) {
          coin.collected = true;
          this.coinCount += 1;
        }
      });

      const levelConfig = LEVELS[this.level % LEVELS.length];
      if (!isAirborne && this.progress > 30 && this.speed < 70) this.emit("crashed");
      if (!isAirborne && this.speed < levelConfig.loopSpeed && position.y < 270 && this.progress > 40) this.emit("crashed");
      if (this.progress >= this.points.length - 3) this.emit("won");

      if (this.state === "playing" && time - this.lastEvent > 100) {
        this.lastEvent = time;
        this.onEvent({ type: "playing", level: this.level, speed: this.speed, coins: this.coinCount, flips: this.flips });
      }
      if (this.state === "playing" && previousSpeed > 0) this.drawScene();
    } else if (this.state === "ready") {
      const point = this.sample(0);
      const scale = Math.min(this.scale.width / 960, this.scale.height / 540, 1.25);
      this.cart.setPosition(this.scale.width * 0.24, this.scale.height * 0.56 + (point.y - 365) * scale);
      this.cart.setScale(scale);
      this.cart.setRotation(0);
    } else if (this.state === "crashed") {
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
  const [coins, setCoins] = useState(0);
  const [flips, setFlips] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new LoopRushScene((event) => {
      setGameState(event.type);
      setLevel(event.level);
      setSpeed(event.speed);
      setCoins(event.coins);
      setFlips(event.flips);
    });
    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: mountRef.current,
      backgroundColor: "#9edcf3",
      scale: { mode: Phaser.Scale.RESIZE, width: 960, height: 540, autoCenter: Phaser.Scale.CENTER_BOTH },
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
        <a href="/" className="loop-rush-back">← SHH Design</a>
        <span className="loop-rush-brand">SHH <b>ARCADE</b></span>
      </header>
      <section className="loop-rush-shell">
        <div className="loop-rush-heading">
          <div><span className="loop-rush-kicker">ONE TOUCH. BIG AIR.</span><h1>TINY LOOPS</h1><p>Hold to build speed. Release to control your flips and landings.</p></div>
          <div className="loop-rush-level"><span>LEVEL {String(level + 1).padStart(2, "0")}</span><b>{levelName}</b></div>
        </div>
        <div className="loop-rush-game-frame">
          <div ref={mountRef} className="loop-rush-canvas" />
          <div className="loop-rush-hud">
            <span>⚡ {Math.round(speed)} SPEED</span>
            <span>🟡 {coins} COINS</span>
            <span>↻ {flips} FLIPS</span>
          </div>
          {gameState === "ready" && <div className="loop-rush-overlay"><span className="loop-rush-pill">READY?</span><h2>LET'S RIDE</h2><p>Press and hold to accelerate. Release to coast and control your flips.</p><button onClick={start}>START RIDE <span>→</span></button></div>}
          {gameState === "crashed" && <div className="loop-rush-overlay"><span className="loop-rush-pill">WIPEOUT</span><h2>TRY AGAIN</h2><p>Build enough speed and time your release to land safely.</p><button onClick={start}>RETRY LEVEL <span>↻</span></button></div>}
          {gameState === "won" && <div className="loop-rush-overlay"><span className="loop-rush-pill">TRACK CLEARED</span><h2>NICE FLIGHT!</h2><p>You collected {coins} coins and landed {flips} flips.</p><button onClick={next}>NEXT LEVEL <span>→</span></button></div>}
        </div>
        <div className="loop-rush-controls"><span><i className="loop-rush-dot" /> PRESS & HOLD TO ACCELERATE</span><span>RELEASE TO BRAKE THE SPIN</span><span>LAND UPRIGHT TO SURVIVE</span></div>
      </section>
      <footer className="loop-rush-footer">A LITTLE ARCADE FUN BY <b>SHH DESIGN</b></footer>
    </main>
  );
}
