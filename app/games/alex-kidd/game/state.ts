export const state = {
  lives: 3,
  money: 0,
  bracelet: false,
  boots: false,
  teleportPowder: false,
  cane: false,
  capsuleA: false,
  capsuleB: false,
  motorcycle: false,
  peticopter: false,
  sunStone: false,
  moonlightStone: false,
  hirottaStone: false,
  letterToNibana: false,
  goldCrown: false,
};

export function resetGame() {
  Object.assign(state, {
    lives: 3,
    money: 0,
    bracelet: false,
    boots: false,
    teleportPowder: false,
    cane: false,
    capsuleA: false,
    capsuleB: false,
    motorcycle: false,
    peticopter: false,
    sunStone: false,
    moonlightStone: false,
    hirottaStone: false,
    letterToNibana: false,
    goldCrown: false,
  });
}

export const PRICES = { teleportPowder: 100, bracelet: 100, life: 500, cane: 120, capsuleA: 100, capsuleB: 120, motorcycle: 200, peticopter: 200 };
