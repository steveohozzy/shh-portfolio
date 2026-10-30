export const state = { lives: 3, money: 0, bracelet: false, boots: false };

export function resetGame() {
  Object.assign(state, { lives: 3, money: 0, bracelet: false, boots: false });
}

export const PRICES = { bracelet: 100, life: 150, boots: 120 };
