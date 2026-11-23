"use client";

import { useEffect, useRef, useState } from "react";
import * as Phaser from "phaser";

type GameState = "ready" | "playing" | "crashed" | "won";
type TrackPoint = { x: number; y: number; airborne: boolean };
type Coin = { x: number; y: number; pointIndex: number; collected: boolean };
type Level = { name: string; pattern: string[]; minimumJumpSpeed: number; loopSpeed: number };
type GameEvent = { type: GameState; level: number; speed: number; coins: number; flips: number; score: number; carts: number; goldCarts: number; bonusCarts: number };

const LEVELS: Level[] = [
  { name: "First Run", pattern: ["hill", "bump", "dip", "jump", "hill", "loop", "jump"], minimumJumpSpeed: 220, loopSpeed: 160 },
  { name: "Loop the Loop", pattern: ["loop", "hill", "bump", "jump", "dip", "hill", "loop", "jump"], minimumJumpSpeed: 230, loopSpeed: 175 },
  { name: "Coin Chaser", pattern: ["jump", "hill", "loop", "bump", "dip", "jump", "hill", "loop"], minimumJumpSpeed: 240, loopSpeed: 185 },
  { name: "Double Trouble", pattern: ["loop", "jump", "loop", "hill", "bump", "dip", "jump", "loop"], minimumJumpSpeed: 250, loopSpeed: 195 },
  { name: "Big Air", pattern: ["hill", "jump", "jump", "bump", "dip", "loop", "hill", "jump", "loop"], minimumJumpSpeed: 260, loopSpeed: 200 },
  { name: "The Corkscrew", pattern: ["loop", "hill", "loop", "jump", "dip", "hill", "loop", "jump"], minimumJumpSpeed: 270, loopSpeed: 210 },
  { name: "High Voltage", pattern: ["jump", "loop", "jump", "hill", "dip", "loop", "hill", "jump"], minimumJumpSpeed: 280, loopSpeed: 220 },
  { name: "Double Drop", pattern: ["dip", "jump", "loop", "bump", "jump", "hill", "dip", "loop", "jump"], minimumJumpSpeed: 290, loopSpeed: 230 },
  { name: "Loop Fever", pattern: ["loop", "loop", "hill", "jump", "dip", "loop", "hill", "jump"], minimumJumpSpeed: 300, loopSpeed: 240 },
  { name: "Sky Spinner", pattern: ["jump", "loop", "jump", "loop", "jump", "hill", "dip", "loop"], minimumJumpSpeed: 310, loopSpeed: 250 },
  { name: "Full Throttle", pattern: ["dip", "loop", "jump", "loop", "jump", "hill", "dip", "loop", "jump"], minimumJumpSpeed: 320, loopSpeed: 260 },
  { name: "Tiny Loops", pattern: ["loop", "jump", "loop", "dip", "jump", "loop", "hill", "jump", "dip", "loop"], minimumJumpSpeed: 330, loopSpeed: 270 },
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
  private airBaseAngle = 0;
  private flips = 0;
  private coinCount = 0;
  private score = 0;
  private runCarts = 0;
  private goldCarts = 0;
  private bonusCarts = 0;
  private finishX = 0;
  private finishPointIndex = 0;
  private milestoneAwarded = false;
  private lastEvent = 0;
  private lastAirborne = false;
  private onEvent: (event: GameEvent) => void;

  constructor(onEvent: (event: GameEvent) => void, bonusCarts = 0) {
    super("LoopRush");
    this.onEvent = onEvent;
    this.bonusCarts = bonusCarts;
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
    this.onEvent({ type, level: this.level, speed: this.speed, coins: this.coinCount, flips: this.flips, score: this.score, carts: this.runCarts + this.bonusCarts, goldCarts: this.goldCarts, bonusCarts: this.bonusCarts });
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

  private addHill(x: number, baseY: number, width: number, height: number, flightLength = 420) {
    // Ride up the hill, launch from its crest, then travel through a proper
    // airborne arc before touching down on the following straight.
    const launchX = x + width / 2;
    const launchY = baseY - height;
    const climbSteps = Math.ceil((width / 2) / 5);
    for (let i = 1; i <= climbSteps; i++) {
      const t = i / climbSteps;
      this.addPoint(x + (width / 2) * t, baseY - Math.sin(t * Math.PI / 2) * height);
    }

    const landingX = launchX + flightLength;
    const flightWidth = landingX - launchX;
    const flightSteps = Math.ceil(flightWidth / 5);
    for (let i = 1; i <= flightSteps; i++) {
      const t = i / flightSteps;
      const smooth = t * t * (3 - 2 * t);
      const airtimeArc = Math.pow(Math.sin(Math.PI * t), 2) * height * 0.8;
      this.addPoint(launchX + flightWidth * t, launchY + height * smooth - airtimeArc, true);
    }
    return landingX;
  }

  private addDip(x: number, baseY: number, width: number, depth: number) {
    const steps = Math.ceil(width / 5);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      this.addPoint(x + width * t, baseY + Math.sin(t * Math.PI) * depth);
    }
    return x + width;
  }

  private addLoop(entryX: number, y: number, radius: number) {
    const centerX = entryX;
    const centerY = y - radius;
    const steps = Math.ceil((Math.PI * 2 * radius) / 5);
    for (let i = 1; i <= steps; i++) {
      const angle = Math.PI / 2 - (Math.PI * 2 * i) / steps;
      this.addPoint(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    }
    return entryX;
  }

  private addJump(x: number, y: number, width: number, height: number) {
    const rampLength = 105;
    const launchRise = 58;
    this.addLine(x, y, x + rampLength, y - launchRise);
    const launchX = x + rampLength;
    const landingX = x + width;
    const flightWidth = landingX - launchX;
    const steps = Math.ceil(flightWidth / 5);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const arc = 4 * t * (1 - t);
      this.addPoint(
        launchX + flightWidth * t,
        y - launchRise * (1 - t) - arc * height,
        true
      );
    }
    this.addLine(landingX, y, landingX + 145, y);
    return landingX + 145;
  }

  private addCoins(start: number, end: number, count: number, lift = 52) {
    for (let i = 0; i < count; i++) {
      const index = Math.round(Phaser.Math.Linear(start, end, (i + 1) / (count + 1)));
      const point = this.points[index];
      if (point) this.coins.push({ x: point.x, y: point.y - lift, pointIndex: index, collected: false });
    }
  }

  private buildLevel(index: number) {
    const base = LEVELS[index % LEVELS.length];
    const tier = Math.floor(index / LEVELS.length);
    const config: Level = {
      ...base,
      pattern: base.pattern.concat(Array.from({ length: Math.min(tier, 5) }, (_, i) => i % 2 === 0 ? "jump" : "loop")),
      minimumJumpSpeed: base.minimumJumpSpeed + tier * 20,
      loopSpeed: base.loopSpeed + tier * 14,
    };
    this.points = [{ x: 0, y: 365, airborne: false }];
    this.coins = [];
    this.coinCount = 0;
    this.flips = 0;
    this.score = 0;
    this.runCarts = 0;
    this.goldCarts = 0;
    this.milestoneAwarded = false;
    this.progress = 0;
    this.speed = 0;
    this.airSpin = 0;
    this.airBaseAngle = 0;
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
      } else if (feature === "bump") {
        x = this.addHill(x, y, 110, 48, 220);
        this.addLine(x, y, x + 75, y);
        x += 75;
      } else {
        x = this.addJump(x, y, 420 + (index % 3) * 35, 125 + (index % 4) * 15);
      }
      this.addCoins(start, this.points.length - 1, feature === "loop" ? 7 : 5, feature === "jump" ? 78 : 48);
    }
    this.addLine(x, y, x + 620, y);
    this.finishX = x + 470;
    this.finishPointIndex = this.points.length - 1;
    this.addCoins(this.points.length - 210, this.points.length - 8, 12, 50);
    this.cameraX = 0;
    this.drawScene();
  }

  private startRun() {
    this.progress = 0;
    this.speed = 260;
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

    // Four finish flags rise into view as the cart approaches the end of the course.
    if (this.cameraX > this.finishX - 720) {
      for (let i = 0; i < 4; i++) {
        const flagX = (this.finishX + i * 42 - this.cameraX) * scale + screenX;
        const flagY = screenY(365) - 68 * scale;
        if (flagX < -30 || flagX > width + 30) continue;
        this.track.lineStyle(4 * scale, 0x35445a, 1);
        this.track.lineBetween(flagX, flagY, flagX, flagY + 68 * scale);
        this.track.fillStyle(i % 2 === 0 ? 0xffc64d : 0xf05d45, 1);
        this.track.fillTriangle(flagX, flagY, flagX + 27 * scale, flagY + 9 * scale, flagX, flagY + 19 * scale);
      }
    }
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

      const wasAirborne = this.lastAirborne;
      // The original has a punchy hold-to-accelerate feel; releasing stops adding power,
      // but the cart keeps its momentum and naturally rolls down the track.
      this.speed += (this.holding ? 1050 : -82) * dt;
      if (!current.airborne) this.speed += (tangentY / tangentLength) * 330 * dt;
      this.speed = Phaser.Math.Clamp(this.speed, 0, 900);
      this.progress += (this.speed * dt) / 5;

      const position = this.sample(this.progress);
      const next = this.sample(Math.min(this.points.length - 2, this.progress + 1));
      const isAirborne = position.airborne;
      const previous = this.sample(Math.max(0, this.progress - 1));
      const trackAngle = Math.atan2(next.y - position.y, next.x - position.x);

      if (isAirborne && !wasAirborne) {
        const launchTangent = Math.atan2(position.y - previous.y, position.x - previous.x);
        this.airBaseAngle = launchTangent;
        this.airSpin = 0;
      }

      if (isAirborne) {
        // Tiny Loops uses one action in the air: keep holding to backflip.
        // Releasing freezes rotation immediately so the player can prepare to land.
        if (this.holding) this.airSpin -= Math.PI * 2 * 2.35 * dt;
      } else if (wasAirborne) {
        const completedFlips = Math.floor(Math.abs(this.airSpin) / (Math.PI * 2));
        const landingError = Math.atan2(
          Math.sin(this.airBaseAngle + this.airSpin - trackAngle),
          Math.cos(this.airBaseAngle + this.airSpin - trackAngle)
        );
        const tier = Math.floor(this.level / LEVELS.length);
        const levelConfig = LEVELS[this.level % LEVELS.length];
        const minimumLandingSpeed = (levelConfig.minimumJumpSpeed + tier * 20) * 0.48;
        if (this.speed < minimumLandingSpeed || Math.abs(landingError) > 0.9) {
          this.emit("crashed");
        } else {
          this.flips += completedFlips;
          if (completedFlips > 0) this.runCarts += completedFlips;
          if (completedFlips >= 2) this.goldCarts += 1;
          this.score += completedFlips * 150 + (completedFlips >= 2 ? 350 : 0);
          this.airSpin = 0;
        }
      }
      this.lastAirborne = isAirborne;

      const angle = isAirborne ? this.airBaseAngle + this.airSpin : trackAngle;
      const width = this.scale.width;
      const height = this.scale.height;
      const scale = Math.min(width / 960, height / 540, 1.25);
      this.cameraX = Math.max(0, position.x);
      this.cart.setPosition(width * 0.24, height * 0.56 + (position.y - 365) * scale);
      this.cart.setScale(scale);
      this.cart.setRotation(angle);

      this.coins.forEach((coin) => {
        if (!coin.collected && Math.abs(coin.pointIndex - this.progress) < 3) {
          coin.collected = true;
          this.coinCount += 1;
          this.score += 50;
        }
      });
      this.score += Math.max(0, this.speed * dt) * (1 + (this.runCarts + this.bonusCarts + this.goldCarts * 2) * 0.12);

      const tier = Math.floor(this.level / LEVELS.length);
      const levelConfig = LEVELS[this.level % LEVELS.length];
      if (this.state === "playing" && !isAirborne && this.progress > 30 && this.speed < 70) this.emit("crashed");
      if (this.state === "playing" && !isAirborne && this.speed < levelConfig.loopSpeed + tier * 14 && position.y < 270 && this.progress > 40) this.emit("crashed");
      if (this.state === "playing" && this.progress >= this.finishPointIndex - 3) {
        if ((this.level + 1) % 5 === 0 && !this.milestoneAwarded) {
          this.bonusCarts += 1;
          this.milestoneAwarded = true;
          try { window.localStorage.setItem("loop-rush-bonus-carts", String(this.bonusCarts)); } catch { /* storage may be unavailable */ }
        }
        this.emit("won");
      }

      if (this.state === "playing" && time - this.lastEvent > 100) {
        this.lastEvent = time;
        this.onEvent({ type: "playing", level: this.level, speed: this.speed, coins: this.coinCount, flips: this.flips, score: this.score, carts: this.runCarts + this.bonusCarts, goldCarts: this.goldCarts, bonusCarts: this.bonusCarts });
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
    this.level += 1;
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
  const [score, setScore] = useState(0);
  const [carts, setCarts] = useState(0);
  const [goldCarts, setGoldCarts] = useState(0);
  const [bonusCarts, setBonusCarts] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;
    let savedBonusCarts = 0;
    try { savedBonusCarts = Number(window.localStorage.getItem("loop-rush-bonus-carts") || 0); } catch { /* storage may be unavailable */ }
    const scene = new LoopRushScene((event) => {
      setGameState(event.type);
      setLevel(event.level);
      setSpeed(event.speed);
      setCoins(event.coins);
      setFlips(event.flips);
      setScore(Math.floor(event.score));
      setCarts(event.carts);
      setGoldCarts(event.goldCarts);
      setBonusCarts(event.bonusCarts);
    }, savedBonusCarts);
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
            <span>⭐ {score.toLocaleString()} PTS</span>
            <span>🛒 {carts} CARTS{goldCarts > 0 ? ` + ${goldCarts} GOLD` : ""}</span>
          </div>
          {gameState === "ready" && <div className="loop-rush-overlay"><span className="loop-rush-pill">READY?</span><h2>LET'S RIDE</h2><p>Press and hold to accelerate. Release to coast and control your flips.</p><button onClick={start}>START RIDE <span>→</span></button></div>}
          {gameState === "crashed" && <div className="loop-rush-overlay"><span className="loop-rush-pill">WIPEOUT</span><h2>TRY AGAIN</h2><p>Build enough speed and time your release to land safely. Your run carts are lost on a crash; permanent carts stay.</p><button onClick={start}>RETRY LEVEL <span>↻</span></button></div>}
          {gameState === "won" && <div className="loop-rush-overlay"><span className="loop-rush-pill">TRACK CLEARED</span><h2>NICE FLIGHT!</h2><p>{coins} coins · {flips} flips · {score.toLocaleString()} points</p>{(level + 1) % 5 === 0 && <p className="loop-rush-reward">PERMANENT CART UNLOCKED — your score boost is now {bonusCarts}!</p>}<button onClick={next}>NEXT LEVEL <span>→</span></button></div>}
        </div>
        <div className="loop-rush-controls"><span><i className="loop-rush-dot" /> PRESS & HOLD TO ACCELERATE / FLIP</span><span>RELEASE TO STOP FLIPPING</span><span>LAND UPRIGHT TO KEEP YOUR CARTS</span></div>
        <div className="loop-rush-progression">PERMANENT CART BOOSTS: <b>{bonusCarts}</b> <span>·</span> SCORE MULTIPLIER IMPROVES WITH EVERY CART</div>
      </section>
      <footer className="loop-rush-footer">A LITTLE ARCADE FUN BY <b>SHH DESIGN</b></footer>
    </main>
  );
}
