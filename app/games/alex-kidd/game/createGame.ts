import * as Phaser from "phaser";
import { BootScene, TitleScene, ShopScene, EndScene } from "./scenes/menus";
import { GameScene } from "./scenes/GameScene";

export function createGame(parent: HTMLElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 256,
    height: 192,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: "#000000",
    physics: { default: "arcade", arcade: { gravity: { x: 0, y: 800 }, debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { activePointers: 3 },
    scene: [BootScene, TitleScene, GameScene, ShopScene, EndScene],
  });
}
