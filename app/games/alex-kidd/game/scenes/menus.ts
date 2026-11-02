// @ts-nocheck
import * as Phaser from "phaser";
import { Controls, FONT } from "../controls";
import { makeTextures } from "../textures";
import { state, resetGame, PRICES } from "../state";
import { sfx } from "../sfx";

const txt = (s: Phaser.Scene, x: number, y: number, t: string, size = 8, color = "#ffffff") =>
  s.add.text(x, y, t, { fontFamily: FONT, fontSize: `${size}px`, color, stroke: "#000000", strokeThickness: size >= 16 ? 4 : 2, align: "center" }).setOrigin(0.5);

export class BootScene extends Phaser.Scene {
  constructor() { super("Boot"); }
  create() { makeTextures(this); this.scene.start("Title"); }
}

export class TitleScene extends Phaser.Scene {
  ctl!: Controls;
  constructor() { super("Title"); }
  create() {
    this.add.image(128, 96, "bg_hills");
    txt(this, 128, 40, "ALEX KIDD", 16, "#f8d820");
    txt(this, 128, 62, "IN MIRACLE WORLD", 8, "#ffffff");
    const hero = this.add.image(128, 112, "hero_punch").setScale(2);
    this.tweens.add({ targets: hero, y: 106, duration: 500, yoyo: true, repeat: -1 });
    const start = txt(this, 128, 150, "PRESS START", 8);
    this.time.addEvent({ delay: 450, loop: true, callback: () => start.setVisible(!start.visible) });
    txt(this, 128, 164, "ARROWS MOVE  Z JUMP  X PUNCH", 5, "#f8f8a0");
    txt(this, 128, 178, "P PAUSE  M SOUND", 5, "#f8f8a0");
    this.ctl = new Controls(this);
    this.input.once("pointerdown", () => this.go());
    sfx.music(null);
  }
  go() { sfx.unlock(); resetGame(); this.scene.start("Game", { level: 0 }); }
  update() { this.ctl.update(); if (this.ctl.anyConfirm()) this.go(); }
}

const ITEMS = [
  { id: "teleportPowder", name: "TELEPORT POWDER", desc: "100U" },
  { id: "bracelet", name: "POWER BRACELET", desc: "100U" },
  { id: "life", name: "EXTRA LIFE", desc: "500U" },
  { id: "cane", name: "CANE OF FLIGHT", desc: "120U" },
  { id: "capsuleA", name: "CAPSULE A", desc: "100U" },
  { id: "capsuleB", name: "CAPSULE B", desc: "120U" },
  { id: "motorcycle", name: "SUKOPAKO MOTORCYCLE", desc: "200U" },
  { id: "peticopter", name: "PETICOPTER", desc: "200U" },
] as const;

export class ShopScene extends Phaser.Scene {
  ctl!: Controls; sel = 0; next = 1;
  rows: Phaser.GameObjects.Text[] = []; cursor!: Phaser.GameObjects.Text; msg!: Phaser.GameObjects.Text; money!: Phaser.GameObjects.Text;
  constructor() { super("Shop"); }
  init(d: { next: number }) { this.next = d.next; this.sel = 0; this.rows = []; }
  create() {
    this.cameras.main.setBackgroundColor("#301808");
    this.add.image(128, 96, "bg_castle").setAlpha(0.35);
    txt(this, 128, 14, "SHOP", 8, "#f8d820");
    this.money = txt(this, 128, 28, "", 7, "#ffffff");
    ITEMS.forEach((it, i) => {
      const y = 45 + i * 14;
      const row = this.add.text(18, y, it.name + "  " + it.desc, { fontFamily: FONT, fontSize: "6px", color: "#ffffff" });
      row.setInteractive().on("pointerdown", () => { this.sel = i; this.buy(); });
      this.rows.push(row);
    });
    const leave = this.add.text(18, 160, "LEAVE SHOP  >>", { fontFamily: FONT, fontSize: "6px", color: "#98f898" }).setInteractive();
    leave.on("pointerdown", () => { this.sel = ITEMS.length; this.buy(); });
    this.rows.push(leave);
    this.cursor = this.add.text(7, 0, ">", { fontFamily: FONT, fontSize: "6px", color: "#f8d820" });
    this.msg = txt(this, 128, 181, "UP/DOWN CHOOSE  X BUY", 6, "#f8f8a0");
    this.ctl = new Controls(this);
    sfx.music("shop");
  }
  buy() {
    if (this.sel === ITEMS.length) { sfx.select(); this.scene.start("Game", { level: this.next }); return; }
    const it = ITEMS[this.sel];
    const price = PRICES[it.id];
    if (it.id !== "life" && state[it.id]) { this.msg.setText("YOU ALREADY HAVE IT!"); sfx.bad(); return; }
    if (state.money < price) { this.msg.setText("NOT ENOUGH MONEY!"); sfx.bad(); return; }
    state.money -= price;
    if (it.id === "life") state.lives++;
    else state[it.id] = true;
    this.msg.setText("THANK YOU!");
    this.money.setText("MONEY " + state.money + "U   LIVES " + state.lives);
    sfx.power();
  }
  update() {
    this.ctl.update();
    const count = ITEMS.length + 1;
    if (this.ctl.pressed("up") || this.ctl.pressed("left")) { this.sel = (this.sel + count - 1) % count; sfx.select(); }
    if (this.ctl.pressed("down") || this.ctl.pressed("right")) { this.sel = (this.sel + 1) % count; sfx.select(); }
    if (this.ctl.pressed("punch") || this.ctl.pressed("start") || (this.ctl.pressed("jump") && !this.ctl.held("up"))) this.buy();
    this.cursor.setY(this.rows[this.sel].y);
    this.money.setText("MONEY " + state.money + "U   LIVES " + state.lives);
  }
}

export class EndScene extends Phaser.Scene {
  ctl!: Controls;
  ready = false;
  page = 0;
  storyText?: Phaser.GameObjects.Text;
  prompt?: Phaser.GameObjects.Text;
  pages = [
    "THE GOLD CROWN HAS\nBEEN RETURNED TO RADAXIAN!",
    "JANKEN'S TYRANNY IS OVER.\nTHE KINGDOM IS FREE!",
    "ALEX IS REUNITED WITH HIS\nFAMILY. THE PEOPLE CELEBRATE!"
  ];
  constructor() { super("End"); }
  create(d: { win: boolean }) {
    this.ready = false;
    this.page = 0;
    if (d.win) {
      this.add.image(128, 96, "bg_hills");
      txt(this, 128, 24, "ALEX KIDD", 10, "#f8d820");
      this.add.image(94, 103, "hero_jump").setScale(2);
      this.add.image(160, 103, "story_npc").setTint(0xf8a8c8).setScale(1.2);
      this.storyText = txt(this, 128, 145, this.pages[0], 6, "#ffffff");
      sfx.clear();
    } else {
      this.cameras.main.setBackgroundColor("#000000");
      txt(this, 128, 80, "GAME OVER", 16, "#d82800");
    }
    this.prompt = txt(this, 128, 178, "PRESS START", 6);
    sfx.music(null);
    this.ctl = new Controls(this);
    this.input.on("pointerdown", () => {
      if (!this.ready) return;
      if (d.win && this.page < this.pages.length - 1) this.nextPage();
      else this.scene.start("Title");
    });
    this.time.delayedCall(1000, () => { this.ready = true; });
  }
  nextPage() {
    this.page++;
    this.storyText?.setText(this.pages[this.page]);
    if (this.page === this.pages.length - 1) this.prompt?.setText("PRESS START TO REPLAY");
    sfx.select();
  }
  update() {
    this.ctl.update();
    if (!this.ready || !this.ctl.anyConfirm()) return;
    if (state.goldCrown && this.page < this.pages.length - 1) this.nextPage();
    else this.scene.start("Title");
  }
}
