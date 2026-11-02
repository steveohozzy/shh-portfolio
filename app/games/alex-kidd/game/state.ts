export const state = {
  lives: 3,
  money: 0,
  bracelet: false,
  boots: false,
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
    sunStone: false,
    moonlightStone: false,
    hirottaStone: false,
    letterToNibana: false,
    goldCrown: false,
  });
}

export const PRICES = { bracelet: 100, life: 500, boots: 120 };
