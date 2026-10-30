// Shared virtual gamepad state written by on-screen touch buttons, read by the game.
// No Phaser import here so React UI can use it safely during SSR.
export const vpad = {
  left: false,
  right: false,
  up: false,
  down: false,
  jump: false,
  punch: false,
  start: false,
};
export type PadKey = keyof typeof vpad;
