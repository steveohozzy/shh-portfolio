// @ts-nocheck
import * as Phaser from "phaser";
import { vpad } from "./input";

type Name = "left" | "right" | "up" | "down" | "jump" | "punch" | "start";
const blank = (): Record<Name, boolean> => ({ left: false, right: false, up: false, down: false, jump: false, punch: false, start: false });

export class Controls {
  private k: Record<string, Phaser.Input.Keyboard.Key>;
  cur = blank();
  prev = blank();
  private first = true;
  constructor(scene: Phaser.Scene) {
    this.k = scene.input.keyboard!.addKeys("LEFT,RIGHT,UP,DOWN,A,D,W,S,Z,X,J,K,SPACE,ENTER", true) as Record<string, Phaser.Input.Keyboard.Key>;
  }
  update() {
    const d = (n: string) => this.k[n].isDown;
    this.prev = { ...this.cur };
    this.cur = {
      left: d("LEFT") || d("A") || vpad.left,
      right: d("RIGHT") || d("D") || vpad.right,
      up: d("UP") || d("W") || vpad.up,
      down: d("DOWN") || d("S") || vpad.down,
      jump: d("Z") || d("K") || d("SPACE") || d("UP") || d("W") || vpad.jump,
      punch: d("X") || d("J") || vpad.punch,
      start: d("ENTER") || vpad.start,
    };
    if (this.first) {
      this.prev = { ...this.cur };
      this.first = false;
    }
  }
  held(n: Name) {
    return this.cur[n];
  }
  pressed(n: Name) {
    return this.cur[n] && !this.prev[n];
  }
  anyConfirm() {
    return this.pressed("jump") || this.pressed("punch") || this.pressed("start");
  }
}

export const FONT = '"Press Start 2P", monospace';
