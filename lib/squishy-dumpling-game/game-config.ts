export const GAME_CONFIG = {
  roundLength: 60,
  spawnInterval: 1050,
  minimumSpawnInterval: 350,
  maximumVisibleBaos: 7,

  comboWindow: 1500,
  comboStep: 3,
  maximumMultiplier: 5,

  frenzyCombo: 10,
  frenzyDuration: 6000,
  frenzyMultiplier: 2,

  highScoreKey: "bao-bonanza-high-score",
  collectionKey: "bao-bonanza-collection",

  characters: {
    classic: {
      name: "Classic Bao",
      points: 10,
      rarity: "Common",
      spawnChance: 0.58,
    },
    strawberry: {
      name: "Strawberry Bao",
      points: 20,
      rarity: "Uncommon",
      spawnChance: 0.17,
    },
    matcha: {
      name: "Matcha Bao",
      points: 20,
      rarity: "Uncommon",
      spawnChance: 0.14,
    },
    golden: {
      name: "Golden Bao",
      points: 100,
      rarity: "Rare",
      spawnChance: 0.085,
    },
    rainbow: {
      name: "Rainbow Bao",
      points: 250,
      rarity: "Legendary",
      spawnChance: 0.025,
    },
  },

  specialAbilities: {
    classicStreak: 3,
    classicBonus: 30,
    matchaSlowDuration: 5000,
    goldenRushDuration: 5000,
    goldenRushMultiplier: 2,
    rainbowTimeBonus: 5,
    specialBaoLifetimeMultiplier: 1.6,
  },
} as const

export type BaoType = keyof typeof GAME_CONFIG.characters

export const BAO_TYPES = Object.keys(
  GAME_CONFIG.characters,
) as BaoType[]