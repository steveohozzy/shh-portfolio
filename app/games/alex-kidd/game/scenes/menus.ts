// @ts-nocheck
import Phaser from "phaser";
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
    txt(this, 128, 40, "PUNCH KID", 16, "#f8d820");
    txt(this, 128, 62, "ISLAND OF WONDERS", 8, "#ffffff");
    const hero = this.add.image(128, 112, "hero_punch").setScale(2);
    this.tweens.add({ targets: hero, y: 106, duration: 500, yoyo: true, repeat: -1 });
    const start = txt(this, 128, 150, "PRESS START", 8);
    this.time.addEvent({ delay: 450, loop: true, callback: () => start.setVisible(!start.visible) });
    txt(this, 128, 176, "ARROWS MOVE  Z JUMP  X PUNCH", 8, "#f8f8a0");
    this.ctl = new Controls(this);
    this.input.once("pointerdown", () => this.go());
    sfx.music(null);
  }
  go() { sfx.unlock(); resetGame(); this.scene.start("Game", { level: 0 }); }
  update() { this.ctl.update(); if (this.ctl.anyConfirm()) this.go(); }
}

const ITEMS = [
  { id: "bracelet", name: "POWER BRACELET", desc: "SHOCKWAVE" },
  { id: "boots", name: "SPEED SHOES", desc: "RUN FASTER" },
  { id: "life", name: "EXTRA LIFE", desc: "1 MORE TRY" },
] as const;

export class ShopScene extends Phaser.Scene {
  ctl!: Controls; sel = 0; next = 1;
  rows: Phaser.GameObjects.Text[] = []; cursor!: Phaser.GameObjects.Text; msg!: Phaser.GameObjects.Text; money!: Phaser.GameObjects.Text;
  constructor() { super("Shop"); }
  init(d: { next: number }) { this.next = d.next; this.sel = 0; this.rows = []; }
  create() {
    this.cameras.main.setBackgroundColor("#301808");
    this.add.image(128, 96, "bg_castle").setAlpha(0.35);
    txt(this, 128, 18, "TRADING POST", 8, "#f8d820");
    this.money = txt(this, 128, 34, "", 8, "#ffffff");
    ITEMS.forEach((it, i) => {
      const y = 62 + i * 26;
      this.add.image(28, y, it.id === "boots" ? "hero_run1" : it.id).setScale(1);
      const price = PRICES[it.id];
      const t = this.add.text(44, y - 8, `${it.name}\n$${price}  ${it.desc}`, { fontFamily: FONT, fontSize: "8px", color: "#ffffff", lineSpacing: 4 });
      t.setFontSize(8).setInteractive().on("pointerdown", () => { this.sel = i; this.buy(); });
      this.rows.push(t);
    });
    const leave = this.add.text(44, 62 + 3 * 26 - 4, "LEAVE SHOP  >>", { fontFamily: FONT, fontSize: "8px", color: "#98f898" }).setInteractive();
    leave.on("pointerdown", () => { this.sel = 3; this.buy(); });
    this.rows.push(leave);
    this.cursor = this.add.text(8, 0, ">", { fontFamily: FONT, fontSize: "8px", color: "#f8d820" });
    this.msg = txt(this, 128, 176, "UP/DOWN CHOOSE  JUMP TO BUY", 8, "#f8f8a0");
    this.ctl = new Controls(this);
    sfx.music("shop");
  }
  buy() {
    if (this.sel === 3) { sfx.select(); this.scene.start("Game", { level: this.next }); return; }
    const it = ITEMS[this.sel];
    const price = PRICES[it.id];
    if ((it.id === "bracelet" && state.bracelet) || (it.id === "boots" && state.boots)) { this.msg.setText("YOU ALREADY HAVE IT!"); sfx.bad(); return; }
    if (state.money < price) { this.msg.setText("NOT ENOUGH MONEY!"); sfx.bad(); return; }
    state.money -= price;
    if (it.id === "bracelet") state.bracelet = true;
    if (it.id === "boots") state.boots = true;
    if (it.id === "life") state.lives++;
    this.msg.setText("THANK YOU!"); sfx.power();
  }
  update() {
    this.ctl.update();
    if (this.ctl.pressed("up") || this.ctl.pressed("left")) { this.sel = (this.sel + 3) % 4; sfx.select(); }
    if (this.ctl.pressed("down") || this.ctl.pressed("right")) { this.sel = (this.sel + 1) % 4; sfx.select(); }
    if (this.ctl.pressed("punch") || this.ctl.pressed("start") || (this.ctl.pressed("jump") && !this.ctl.held("up"))) this.buy();
    this.cursor.setY(this.rows[this.sel].y);
    this.money.setText(`MONEY $${state.money}   LIVES ${state.lives}`);
  }
}

export class EndScene extends Phaser.Scene {
  ctl!: Controls; ready = false;
  constructor() { super("End"); }
  create(d: { win: boolean }) {
    this.ready = false;
    if (d.win) {
      this.add.image(128, 96, "bg_hills");
      txt(this, 128, 50, "YOU SAVED THE ISLAND!", 8, "#f8d820");
      txt(this, 128, 70, `TREASURE $${state.money}`, 8);
      this.add.image(128, 112, "hero_jump").setScale(2);
      sfx.clear();
    } else {
      this.cameras.main.setBackgroundColor("#000000");
      txt(this, 128, 80, "GAME OVER", 16, "#d82800");
    }
    txt(this, 128, 160, "PRESS START", 8);
    sfx.music(null);
    this.ctl = new Controls(this);
    this.time.delayedCall(1200, () => { this.ready = true; this.input.once("pointerdown", () => this.scene.start("Title")); });
  }
  update() { this.ctl.update(); if (this.ready && this.ctl.anyConfirm()) this.scene.start("Title"); }
}
