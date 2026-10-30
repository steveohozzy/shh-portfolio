// @ts-nocheck
import * as Phaser from "phaser";
import { LEVELS, H, type LevelDef } from "../levels";
import { state } from "../state";
import { Controls, FONT } from "../controls";
import { sfx } from "../sfx";

type Spr = Phaser.Physics.Arcade.Sprite;
type Body = Phaser.Physics.Arcade.Body;
const T = 16;
const key = (x: number, y: number) => `${x},${y}`;

export class GameScene extends Phaser.Scene {
  constructor() { super("Game"); }
  levelIdx = 0;
  L!: LevelDef;
  ctl!: Controls;
  player!: Spr;
  solids!: Phaser.Physics.Arcade.StaticGroup;
  enemies!: Phaser.Physics.Arcade.Group;
  pickups!: Phaser.Physics.Arcade.Group;
  shots!: Phaser.Physics.Arcade.Group;
  hazards!: Phaser.Physics.Arcade.Group;
  ghosts!: Phaser.Physics.Arcade.Group;
  solidSet = new Set<string>();
  bg!: Phaser.GameObjects.TileSprite;
  waterSurface?: Phaser.GameObjects.TileSprite;
  hud!: Phaser.GameObjects.Text;
  facing = 1; punchT = 0; dead = false; cleared = false; frozenUntil = 0; bubbleT = 0; waterEntered = false; waterExitBlocked = false;
  boss?: Spr; bossHp = 6; bossFight = false; bossTimer = 1; bossMove = 0; bossInv = 0; arenaX = 0;
  jankenActive = false; jankenDone = false;
  jk = { sel: 0, you: 0, them: 0, phase: "choose" as "choose" | "reveal", ui: [] as Phaser.GameObjects.GameObject[], cursor: null as Phaser.GameObjects.Text | null, bossHand: null as Phaser.GameObjects.Image | null, info: null as Phaser.GameObjects.Text | null, score: null as Phaser.GameObjects.Text | null };

  init(d: { level: number }) {
    this.levelIdx = d.level ?? 0;
    this.solidSet = new Set();
    this.facing = 1; this.punchT = 0; this.dead = false; this.cleared = false; this.frozenUntil = 0; this.waterEntered = false; this.waterExitBlocked = false;
    this.boss = undefined; this.bossHp = 6; this.bossFight = false; this.bossTimer = 1; this.bossMove = 0; this.bossInv = 0;
    this.jankenActive = false; this.jankenDone = false;
  }

  create() {
    this.L = LEVELS[this.levelIdx];
    const L = this.L;
    this.facing = L.startFacing || 1;
    const W = L.grid[0].length * T;
    const worldH = L.grid.length * T;
    this.physics.resume();
    this.cameras.main.setBackgroundColor(L.sky);
    this.bg = this.add.tileSprite(128, 96, 256, 192, `bg_${L.theme}`).setScrollFactor(0);
    if (L.waterStartY !== undefined) this.waterSurface = this.add.tileSprite((L.grid[0].length * T) / 2, L.waterStartY, L.grid[0].length * T, 8, "water_surface").setDepth(4);
    this.physics.world.setBounds(0, 0, W, worldH + 64);
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.solids = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.pickups = this.physics.add.group({ allowGravity: false });
    this.shots = this.physics.add.group({ allowGravity: false });
    this.hazards = this.physics.add.group();
    this.ghosts = this.physics.add.group({ allowGravity: false });

    let start = { x: 40, y: 140 };
    let goal: { x: number; y: number } | null = null;
    let bossAt: { x: number; y: number } | null = null;
    L.grid.forEach((row, ty) => row.forEach((c, tx) => {
      const x = tx * T + 8, y = ty * T + 8;
      if (c === "#") {
        const top = ty === 0 || L.grid[ty - 1][tx] !== "#";
        this.addSolid(tx, ty, `${L.theme}_${top || L.theme !== "hills" ? "top" : "fill"}`);
      } else if (c === "R") this.addSolid(tx, ty, "rock");
      else if (c === "S") this.addSolid(tx, ty, "blk_star", "star");
      else if (c === "Q") this.addSolid(tx, ty, "blk_q", "question");
      else if (c === "K") this.addSolid(tx, ty, "blk_skull", "skull");
      else if (c === "$") this.spawnPickup(x, y, "money", false);
      else if (c === "g") this.spawnPickup(x, y, "gem", false);
      else if (c === "o") this.spawnPickup(x, y, "treasure", false);
      else if (c === "w" || c === "v" || c === "p") this.spawnEnemy(c, x, y);
      else if (c === "F") goal = { x, y };
      else if (c === "P") start = { x, y };
      else if (c === "B") bossAt = { x, y };
    }));

    this.player = this.physics.add.sprite(start.x, start.y, "hero_idle");
    const pb = this.player.body as Body;
    pb.setSize(10, 14).setOffset(3, 2);
    this.player.setCollideWorldBounds(true).setDepth(10);
    pb.setDragX(L.water ? 220 : 650);
    if (L.water) pb.setAllowGravity(false);

    this.physics.add.collider(this.player, this.solids);
    this.physics.add.collider(this.enemies, this.solids, undefined, (e) => (e as Spr).getData("type") === "w", this);
    this.physics.add.overlap(this.player, this.enemies, () => this.die());
    this.physics.add.overlap(this.player, this.ghosts, () => this.die());
    this.physics.add.overlap(this.player, this.hazards, () => this.die());
    this.physics.add.overlap(this.player, this.pickups, (_p, it) => this.collect(it as Spr));
    this.physics.add.overlap(this.shots, this.enemies, (s, e) => { this.killEnemy(e as Spr); (s as Spr).destroy(); });
    this.physics.add.overlap(this.shots, this.solids, (s, o) => {
      const blk = o as Phaser.Physics.Arcade.Image;
      if (blk.getData("kind")) this.breakBlock(blk);
      (s as Spr).destroy();
    });
    this.physics.add.collider(this.hazards, this.solids, (h) => (h as Spr).destroy());

    if (goal) this.makeGoal((goal as { x: number }).x, (goal as { y: number }).y);
    if (bossAt) this.spawnBoss((bossAt as { x: number }).x, (bossAt as { y: number }).y);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, W, worldH);
    cam.startFollow(this.player, true, 0.2, 0.2);
    cam.setDeadzone(24, L.vertical ? 32 : 192);

    this.add.rectangle(128, 6, 256, 12, 0x000000, 0.55).setScrollFactor(0).setDepth(50);
    this.hud = this.add.text(4, 2, "", { fontFamily: FONT, fontSize: "8px", color: "#ffffff" }).setScrollFactor(0).setDepth(51);
    const banner = this.add.text(128, 80, `STAGE ${L.name}`, { fontFamily: FONT, fontSize: "8px", color: "#f8d820", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(60);
    this.tweens.add({ targets: banner, alpha: 0, delay: 1600, duration: 500, onComplete: () => banner.destroy() });

    this.ctl = new Controls(this);
    sfx.music(L.theme);
    this.events.once("shutdown", () => sfx.music(null));
  }

  addSolid(tx: number, ty: number, tex: string, kind?: string) {
    const o = this.solids.create(tx * T + 8, ty * T + 8, tex) as Phaser.Physics.Arcade.Image;
    o.setData("tx", tx).setData("ty", ty);
    if (kind) o.setData("kind", kind);
    this.solidSet.add(key(tx, ty));
  }

  spawnPickup(x: number, y: number, type: string, pop = true) {
    const it = this.pickups.create(x, y, type) as Spr;
    it.setData("type", type);
    (it.body as Body).setSize(12, 12);
    if (pop) this.tweens.add({ targets: it, y: y - 4, duration: 150, yoyo: true });
  }

  spawnEnemy(type: string, x: number, y: number) {
    const tex = type === "w" ? "scorp" : type === "v" ? "bird" : "fish";
    const e = this.enemies.create(x, y, tex) as Spr;
    e.setData("type", type).setData("baseX", x).setData("baseY", y).setData("t", Math.random() * 6).setData("dir", -1).setData("woke", false);
    const b = e.body as Body;
    if (type === "w") { b.setSize(14, 10).setOffset(1, 6); }
    else { b.setAllowGravity(false); b.setSize(13, 8).setOffset(1, type === "v" ? 7 : 9); }
    if (type === "v" && this.L.theme === "castle") e.setTint(0xc070ff);
  }

  spawnGhost(x: number, y: number) {
    const g = this.ghosts.create(x, y, "ghost") as Spr;
    g.setData("born", this.time.now).setAlpha(0.85).setDepth(20);
    (g.body as Body).setSize(10, 10);
  }

  makeGoal(x: number, y: number) {
    const g = this.physics.add.staticImage(x, y, "chest");
    this.physics.add.overlap(this.player, g, () => this.clearLevel());
  }

  spawnBoss(x: number, y: number) {
    const b = this.physics.add.sprite(x, y - 8, "boss");
    (b.body as Body).setSize(24, 28).setOffset(4, 4);
    b.setCollideWorldBounds(true).setDragX(160);
    this.boss = b;
    this.arenaX = x - 5 * T;
    const name = this.add.text(x, y - 30, this.L.bossName || "BOSS", {
      fontFamily: FONT, fontSize: "8px", color: "#f878f8", stroke: "#000", strokeThickness: 3
    }).setOrigin(0.5).setDepth(11);
    this.tweens.add({ targets: name, y: y - 34, duration: 550, yoyo: true, repeat: -1 });
    this.physics.add.collider(b, this.solids);
    this.physics.add.overlap(this.player, b, () => this.die());
    this.physics.add.overlap(this.shots, b, (_b, s) => { (s as Spr).destroy(); if (this.bossFight) this.hitBoss(); });
  }

  collect(it: Spr) {
    const t = it.getData("type");
    if (t === "money") { state.money += 10; sfx.coin(); }
    else if (t === "moneybig") { state.money += 20; sfx.coin(); }
    else if (t === "gem") { state.money += 50; sfx.power(); }
    else if (t === "treasure") { state.money += 100; sfx.power(); }
    else if (t === "bracelet") { state.bracelet = true; sfx.power(); }
    else if (t === "life") { state.lives++; sfx.power(); }
    it.destroy();
  }

  breakBlock(o: Phaser.Physics.Arcade.Image) {
    const kind = o.getData("kind");
    const { x, y } = o;
    this.solidSet.delete(key(o.getData("tx"), o.getData("ty")));
    o.destroy();
    sfx.brk();
    for (let i = 0; i < 4; i++) {
      const d = this.physics.add.image(x + (i % 2 ? 4 : -4), y + (i < 2 ? -4 : 4), "debris");
      d.setVelocity((i % 2 ? 1 : -1) * (40 + Math.random() * 40), -120 - Math.random() * 80);
      this.time.delayedCall(800, () => d.destroy());
    }
    if (kind === "star") this.spawnPickup(x, y, Math.random() < 0.3 ? "moneybig" : "money");
    else if (kind === "question") {
      const r = Math.random();
      if (r < 0.45) this.spawnPickup(x, y, "bracelet");
      else if (r < 0.65) this.spawnPickup(x, y, "life");
      else { this.spawnGhost(x, y); sfx.bad(); }
    } else if (kind === "skull") {
      this.frozenUntil = this.time.now + 1200;
      this.spawnGhost(x, y);
      sfx.bad();
    }
  }

  killEnemy(e: Spr) {
    if (!e.active) return;
    sfx.kill();
    const puff = this.add.image(e.x, e.y, "shot").setScale(1.5);
    this.tweens.add({ targets: puff, scale: 3, alpha: 0, duration: 250, onComplete: () => puff.destroy() });
    e.destroy();
  }

  doPunch() {
    this.punchT = 0.2;
    sfx.punch();
    const p = this.player;
    const r = new Phaser.Geom.Rectangle(this.facing > 0 ? p.x + 3 : p.x - 15, p.y - 5, 12, 9);
    for (const o of [...this.solids.getChildren()] as Phaser.Physics.Arcade.Image[]) {
      if (o.getData("kind") && Phaser.Geom.Rectangle.Overlaps(r, o.getBounds())) { this.breakBlock(o); break; }
    }
    for (const e of [...this.enemies.getChildren()] as Spr[]) {
      if (Phaser.Geom.Rectangle.Overlaps(r, e.getBounds())) this.killEnemy(e);
    }
    if (this.boss && this.bossFight && Phaser.Geom.Rectangle.Overlaps(r, this.boss.getBounds())) this.hitBoss();
    if (state.bracelet) {
      const s = this.shots.create(p.x + this.facing * 12, p.y - 1, "shot") as Spr;
      s.setVelocityX(this.facing * 220).setData("born", this.time.now);
    }
  }

  hitBoss() {
    const b = this.boss;
    if (!b || this.bossInv > 0) return;
    this.bossHp--;
    this.bossInv = 0.6;
    sfx.hit();
    b.setVelocity(this.facing * 120, -140);
    if (this.bossHp <= 0) {
      this.bossFight = false;
      sfx.clear();
      this.cameras.main.shake(400, 0.01);
      for (let i = 0; i < 6; i++) {
        const f = this.add.image(b.x + Phaser.Math.Between(-14, 14), b.y + Phaser.Math.Between(-14, 14), "shot");
        this.tweens.add({ targets: f, scale: 4, alpha: 0, delay: i * 80, duration: 400, onComplete: () => f.destroy() });
      }
      const bx = b.x;
      b.destroy();
      this.boss = undefined;
      this.time.delayedCall(700, () => this.makeGoal(bx, 9 * T + 8));
    }
  }

  die() {
    if (this.dead || this.cleared) return;
    this.dead = true;
    sfx.music(null);
    sfx.die();
    const p = this.player;
    p.anims.stop();
    p.setTexture("hero_jump").setTint(0xffffff);
    (p.body as Body).enable = false;
    this.tweens.add({ targets: p, y: p.y - 30, angle: 180, duration: 400, ease: "Quad.out", onComplete: () => this.tweens.add({ targets: p, y: p.y + 240, duration: 900, ease: "Quad.in" }) });
    this.time.delayedCall(2000, () => {
      state.lives--;
      state.bracelet = false;
      if (state.lives < 0) this.scene.start("End", { win: false });
      else this.scene.restart({ level: this.levelIdx });
    });
  }

  clearLevel() {
    if (this.cleared || this.dead) return;
    this.cleared = true;
    sfx.music(null);
    sfx.clear();
    this.physics.pause();
    this.player.anims.stop();
    this.player.setTexture("hero_jump");
    state.money += 50;
    this.add.text(128, 80, "STAGE CLEAR!\n\nBONUS $50", { fontFamily: FONT, fontSize: "8px", color: "#f8d820", stroke: "#000", strokeThickness: 3, align: "center" }).setOrigin(0.5).setScrollFactor(0).setDepth(60);
    this.time.delayedCall(2600, () => {
      if (this.levelIdx >= LEVELS.length - 1) {
        this.scene.start("End", { win: true });
        return;
      }
      const shopAfter = [0, 3, 8, 13];
      if (shopAfter.indexOf(this.levelIdx) !== -1) this.scene.start("Shop", { next: this.levelIdx + 1 });
      else this.scene.start("Game", { level: this.levelIdx + 1 });
    });
  }

  // ---------- Rock-paper-scissors duel ----------
  startJanken() {
    this.jankenActive = true;
    this.physics.pause();
    this.player.anims.stop();
    this.player.setTexture("hero_idle");
    const W = this.L.grid[0].length * T;
    const worldH = this.L.grid.length * T;
    this.physics.world.setBounds(this.arenaX - 8, 0, W - this.arenaX + 8, worldH + 64);
    this.cameras.main.setBounds(this.arenaX - 8, 0, W - this.arenaX + 8, worldH);
    const ui: Phaser.GameObjects.GameObject[] = [];
    const fix = <O extends Phaser.GameObjects.GameObject & { setScrollFactor: (n: number) => O; setDepth: (n: number) => O }>(o: O) => { o.setScrollFactor(0).setDepth(80); ui.push(o); return o; };
    const t = (x: number, y: number, s: string, c = "#ffffff") => fix(this.add.text(x, y, s, { fontFamily: FONT, fontSize: "8px", color: c, stroke: "#000", strokeThickness: 2, align: "center" }).setOrigin(0.5));
    fix(this.add.rectangle(128, 96, 256, 192, 0x000000, 0.7));
    t(128, 20, "JAN-KEN DUEL!", "#f8d820");
    t(128, 34, "FIRST TO 2 WINS");
    this.jk.score = t(128, 150, "");
    this.jk.info = t(128, 166, "CHOOSE YOUR HAND", "#98f898");
    t(128, 52, this.L.bossName || "BOSS", "#f878f8");
    this.jk.bossHand = fix(this.add.image(128, 76, "hand0").setScale(2).setVisible(false));
    [0, 1, 2].forEach((i) => {
      const img = fix(this.add.image(64 + i * 64, 116, `hand${i}`).setScale(2).setInteractive());
      img.on("pointerdown", () => { if (this.jk.phase === "choose") { this.jk.sel = i; this.jankenChoose(); } });
    });
    this.jk.cursor = t(64, 136, "^", "#f8d820");
    Object.assign(this.jk, { sel: 0, you: 0, them: 0, phase: "choose", ui });
    sfx.music(null);
  }

  updateJanken() {
    const jk = this.jk;
    jk.score?.setText(`YOU ${jk.you}  -  ${jk.them} BOSS`);
    if (jk.phase !== "choose") return;
    if (this.ctl.pressed("left")) { jk.sel = (jk.sel + 2) % 3; sfx.select(); }
    if (this.ctl.pressed("right")) { jk.sel = (jk.sel + 1) % 3; sfx.select(); }
    jk.cursor?.setX(64 + jk.sel * 64);
    if (this.ctl.pressed("punch") || this.ctl.pressed("start") || (this.ctl.pressed("jump") && !this.ctl.held("up"))) this.jankenChoose();
  }

  jankenChoose() {
    const jk = this.jk;
    jk.phase = "reveal";
    jk.cursor?.setX(64 + jk.sel * 64);
    const them = Phaser.Math.Between(0, 2);
    jk.info?.setText("JAN... KEN... PON!");
    this.time.delayedCall(700, () => {
      jk.bossHand?.setTexture(`hand${them}`).setVisible(true);
      const r = (jk.sel - them + 3) % 3;
      if (r === 1) { jk.you++; jk.info?.setText("YOU WIN THE ROUND!"); sfx.coin(); }
      else if (r === 2) { jk.them++; jk.info?.setText("BOSS WINS THE ROUND"); sfx.bad(); }
      else { jk.info?.setText("DRAW! AGAIN!"); sfx.select(); }
      this.time.delayedCall(1300, () => {
        if (jk.you >= 2) this.endJanken(true);
        else if (jk.them >= 2) this.endJanken(false);
        else { jk.phase = "choose"; jk.bossHand?.setVisible(false); jk.info?.setText("CHOOSE YOUR HAND"); }
      });
    });
  }

  endJanken(win: boolean) {
    this.jk.ui.forEach((o) => o.destroy());
    this.jk.ui = [];
    this.jankenActive = false;
    this.jankenDone = true;
    this.physics.resume();
    if (win) {
      this.bossFight = true;
      sfx.music("castle");
      const f = this.add.text(128, 80, "NOW FIGHT!", { fontFamily: FONT, fontSize: "8px", color: "#d82800", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(60);
      this.tweens.add({ targets: f, alpha: 0, delay: 1000, duration: 400, onComplete: () => f.destroy() });
    } else this.die();
  }

  // ---------- Main loop ----------
  update(time: number, delta: number) {
    const dt = Math.min(delta, 50) / 1000;
    this.ctl.update();
    this.bg.tilePositionX = this.cameras.main.scrollX * 0.35;
    this.bg.tilePositionY = this.L.vertical ? 0 : this.cameras.main.scrollY * 0.25;
    if (this.jankenActive) { this.updateJanken(); return; }
    if (this.dead || this.cleared) return;
    this.updatePlayer(time, dt);
    this.updateEnemies(dt);
    this.updateMisc(time, dt);
    if (this.boss && !this.jankenDone && this.player.x > this.arenaX && (!this.L.vertical || Math.abs(this.player.y - this.boss.y) < 6 * T)) this.startJanken();
    this.hud.setText(`LIFE ${Math.max(0, state.lives)}  $${state.money}${state.bracelet ? "  PWR" : ""}`);
  }

  updatePlayer(time: number, dt: number) {
    const p = this.player, b = p.body as Body, c = this.ctl;
    const frozen = time < this.frozenUntil;
    let dir = 0;
    if (!frozen) { if (c.held("left")) dir -= 1; if (c.held("right")) dir += 1; }
    if (dir) this.facing = dir;
    p.setFlipX(this.facing < 0);

    const reachedWater = this.L.waterStartY !== undefined &&
      p.y >= this.L.waterStartY &&
      (this.L.waterEndY === undefined || p.y < this.L.waterEndY) &&
      (this.L.waterStartX === undefined || p.x >= this.L.waterStartX);
    if (reachedWater && !this.waterEntered) {
      this.waterEntered = true;
      if (this.L.vertical && !this.waterExitBlocked) {
        this.waterExitBlocked = true;
        const ceiling = this.solids.create(
          (this.L.grid[0].length * T) / 2,
          this.L.waterStartY! - 12,
          "rock"
        ) as Phaser.Physics.Arcade.Image;
        ceiling.setDisplaySize(this.L.grid[0].length * T, 8).refreshBody().setVisible(false);
      }
      if (this.L.vertical) this.time.delayedCall(650, () => this.cameras.main.setDeadzone(48, 24));
    }

    let inWater = this.L.water || this.waterEntered;
    if (inWater && this.L.waterEndY !== undefined && p.y >= this.L.waterEndY) {
      this.waterEntered = false;
      inWater = false;
      b.setAllowGravity(true);
      b.setDragX(650);
      b.setAccelerationX(0);
      b.setVelocityY(0);
      this.bg.setTexture("bg_hills").setAlpha(0);
      this.cameras.main.setBackgroundColor("#5c94fc");
      this.tweens.add({ targets: this.bg, alpha: 1, duration: 650, ease: "Sine.easeInOut" });
    }
    if (inWater && b.allowGravity) {
      b.setAllowGravity(false);
      b.setSize(10, 14).setOffset(3, 2);
      b.setVelocityY(0);
      b.setDragX(220);
      this.bg.setTexture("bg_lake").setAlpha(0);
      this.cameras.main.setBackgroundColor("#1840b8");
      this.tweens.add({ targets: this.bg, alpha: 1, duration: 650, ease: "Sine.easeInOut" });
    }
    if (inWater) {
      b.setMaxVelocity(state.boots ? 90 : 75, 130);
      b.setAccelerationX(dir * 280);
      let vy = b.velocity.y;
      if (!frozen) {
        if (c.pressed("jump") && !c.held("up")) { vy = -110; sfx.swim(); }
        if (c.held("up")) vy -= 190 * dt;
        if (c.held("down")) vy += 190 * dt;
      }
      vy += 70 * dt;
      b.setVelocityY(Phaser.Math.Clamp(vy, -110, 90));
      this.bubbleT -= dt;
      if (this.bubbleT <= 0) {
        this.bubbleT = 0.8 + Math.random();
        const bub = this.add.image(p.x + this.facing * 5, p.y - 6, "bubble");
        this.tweens.add({ targets: bub, y: bub.y - 50, alpha: 0, duration: 1400, onComplete: () => bub.destroy() });
      }
    } else {
      const speed = state.boots ? 118 : 92;
      b.setMaxVelocity(speed, 420);
      let acc = dir * 520;
      if (dir && Math.sign(b.velocity.x) === -dir) acc *= 1.8;
      b.setAccelerationX(acc);
      if (!frozen && c.pressed("jump") && b.blocked.down) { b.setVelocityY(-280); sfx.jump(); }
      if (!c.held("jump") && b.velocity.y < -110) b.setVelocityY(-110);
    }
    if (!frozen && c.pressed("punch") && this.punchT <= 0) this.doPunch();
    if (this.punchT > 0) this.punchT -= dt;

    if (this.punchT > 0) { p.anims.stop(); p.setTexture("hero_punch"); }
    else if (inWater) p.anims.play("run", true);
    else if (!b.blocked.down) { p.anims.stop(); p.setTexture("hero_jump"); }
    else if (Math.abs(b.velocity.x) > 8) p.anims.play("run", true);
    else { p.anims.stop(); p.setTexture("hero_idle"); }
    if (frozen) p.setTint(0x8888ff); else p.clearTint();
    p.setAngle(0);
    p.setFlipX(this.facing < 0);
    if (inWater) p.setDepth(10);
    if (p.y > this.L.grid.length * T + 20) this.die();
  }

  updateEnemies(dt: number) {
    const cam = this.cameras.main;
    for (const e of [...this.enemies.getChildren()] as Spr[]) {
      if (!e.active) continue;
      const b = e.body as Body;
      const near = this.L.vertical
        ? e.y > cam.scrollY - 24 && e.y < cam.scrollY + 192 + 24
        : e.x > cam.scrollX - 24 && e.x < cam.scrollX + 256 + 24;
      if (near) e.setData("woke", true);
      if (!e.getData("woke")) { b.setVelocity(0, b.velocity.y); continue; }
      const type = e.getData("type");
      let dir = e.getData("dir") as number;
      const t = (e.getData("t") as number) + dt;
      e.setData("t", t);
      if (type === "w") {
        if (b.blocked.left) dir = 1;
        if (b.blocked.right) dir = -1;
        if (b.blocked.down) {
          const tx = Math.floor((e.x + dir * 9) / T), ty = Math.floor((e.y + 10) / T);
          if (!this.solidSet.has(key(tx, ty))) dir = -dir;
        }
        b.setVelocityX(dir * 30);
        e.setFlipX(dir > 0);
        if (e.y > this.L.grid.length * T + 32) e.destroy();
      } else if (type === "v") {
        b.setVelocity(-42, Math.cos(t * 3) * 40);
        e.setFlipX(false);
        if (e.x < cam.scrollX - 40) e.destroy();
      } else {
        const bx = e.getData("baseX") as number;
        if (e.x < bx - 40) dir = 1;
        if (e.x > bx + 40) dir = -1;
        b.setVelocity(dir * 32, Math.sin(t * 2) * 18);
        e.setFlipX(dir > 0);
      }
      if (e.active) e.setData("dir", dir);
    }
  }

  updateMisc(time: number, dt: number) {
    const p = this.player;
    for (const g of [...this.ghosts.getChildren()] as Spr[]) {
      const age = time - (g.getData("born") as number);
      const a = Phaser.Math.Angle.Between(g.x, g.y, p.x, p.y);
      g.setVelocity(Math.cos(a) * 38, Math.sin(a) * 38).setFlipX(p.x > g.x);
      g.setAlpha(0.55 + Math.sin(time / 90) * 0.3);
      if (age > 9000) g.destroy();
    }
    for (const s of [...this.shots.getChildren()] as Spr[]) if (time - (s.getData("born") as number) > 650) s.destroy();
    for (const h of [...this.hazards.getChildren()] as Spr[]) if (h.y > this.L.grid.length * T + 32) h.destroy();

    const b = this.boss;
    if (b && this.bossFight) {
      const bb = b.body as Body;
      this.bossTimer -= dt;
      if (this.bossTimer <= 0) {
        this.bossTimer = 1.1 + Math.random() * 0.6;
        this.bossMove = (this.bossMove + 1) % 3;
        if (this.bossMove === 2) {
          const r = this.hazards.create(b.x, b.y - 12, "bossrock") as Spr;
          r.setVelocity(Phaser.Math.Clamp((p.x - b.x) * 1.1, -170, 170), -230);
        } else if (bb.blocked.down) {
          const d = Math.sign(p.x - b.x) || -1;
          b.setVelocity(d * 80, -270);
        }
      }
      if (this.bossInv > 0) { this.bossInv -= dt; b.setAlpha(Math.floor(this.bossInv * 20) % 2 ? 0.3 : 1); }
      else b.setAlpha(1);
    }
  }
}
