// @ts-nocheck
// 16px Master System-style stages. # ground, R rock, S star block, Q ? block,
// K skull block, $ money, g hidden gem, o large treasure, w walker, v bird,
// p fish, F exit chest, P player start, B boss.
export const H = 12;
export type Theme = "hills" | "lake" | "castle";
export interface LevelDef {
  name: string;
  theme: Theme;
  water: boolean;
  waterStartX?: number;
  waterStartY?: number;
  vertical?: boolean;
  sky: string;
  bossName?: string;
  grid: string[][];
}
type G = string[][];
const grid = (w: number, h = H): G => Array.from({ length: h }, () => Array<string>(w).fill("."));
const put = (g: G, x: number, y: number, c: string) => {
  if (y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = c;
};
const fill = (g: G, x0: number, x1: number, y0: number, y1: number, c: string) => {
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) put(g, x, y, c);
};

function level1(): G {
  const g = grid(150, 82);

  // Mt. Eternal: closely spaced ledges guide Alex down the mountain.
  fill(g, 0, 0, 0, 70, "R");
  fill(g, 15, 15, 0, 70, "R");
  put(g, 7, 2, "P");

  fill(g, 3, 10, 7, 8, "S");
  put(g, 12, 5, "v");
  put(g, 6, 5, "$");
  put(g, 8, 5, "$");

  fill(g, 8, 13, 12, 13, "R");
  put(g, 5, 10, "w");
  put(g, 10, 10, "Q");

  fill(g, 2, 7, 17, 18, "S");
  put(g, 11, 15, "v");
  put(g, 4, 15, "$");
  put(g, 6, 15, "$");

  fill(g, 8, 13, 22, 23, "R");
  put(g, 4, 20, "w");
  put(g, 10, 20, "K");

  fill(g, 2, 7, 27, 28, "S");
  put(g, 11, 25, "v");
  put(g, 4, 25, "$");
  put(g, 6, 25, "$");

  fill(g, 8, 13, 32, 33, "R");
  put(g, 4, 30, "w");
  put(g, 10, 30, "Q");

  fill(g, 2, 7, 37, 38, "S");
  put(g, 11, 35, "v");
  put(g, 4, 35, "$");
  put(g, 6, 35, "$");

  fill(g, 8, 13, 42, 43, "R");
  put(g, 4, 40, "w");
  put(g, 10, 40, "K");

  fill(g, 2, 7, 47, 48, "S");
  put(g, 11, 45, "v");
  put(g, 4, 45, "$");
  put(g, 6, 45, "$");

  fill(g, 8, 13, 52, 53, "R");
  put(g, 4, 50, "w");
  put(g, 10, 50, "Q");

  fill(g, 2, 7, 57, 58, "S");
  put(g, 11, 55, "v");
  put(g, 4, 55, "$");
  put(g, 6, 55, "$");

  fill(g, 8, 13, 62, 63, "R");
  put(g, 4, 60, "w");
  put(g, 10, 60, "K");

  fill(g, 2, 6, 67, 68, "S");
  fill(g, 9, 13, 67, 68, "R");
  put(g, 7, 65, "$");

  // The final opening drops Alex through the marked water surface.
  fill(g, 0, 149, 81, 81, "#");
  fill(g, 0, 0, 72, 80, "R");
  fill(g, 149, 149, 72, 80, "R");
  fill(g, 22, 24, 76, 76, "S");
  put(g, 28, 75, "p");
  put(g, 38, 77, "$");
  put(g, 47, 75, "p");
  fill(g, 55, 57, 77, 77, "S");
  put(g, 68, 75, "p");
  put(g, 78, 76, "g");
  put(g, 91, 75, "p");
  put(g, 104, 77, "$");
  put(g, 116, 75, "p");
  put(g, 128, 76, "o");
  put(g, 140, 75, "p");
  put(g, 145, 78, "F");
  return g;
}

function mountainDescent(): G {
  const g = grid(150);
  fill(g, 0, 149, 10, 11, "#");
  put(g, 2, 9, "P");

  const onGround = (x: number, c = "w") => put(g, x, 9, c);
  fill(g, 9, 11, 7, 7, "S");
  onGround(17);
  fill(g, 23, 25, 9, 9, "R");
  put(g, 30, 6, "$");
  put(g, 37, 5, "v");
  fill(g, 44, 46, 7, 7, "S");
  put(g, 45, 6, "Q");
  onGround(52);
  fill(g, 59, 61, 9, 9, "R");
  put(g, 60, 6, "o");
  put(g, 67, 4, "v");
  fill(g, 74, 76, 7, 7, "S");
  onGround(82);
  put(g, 88, 6, "g");
  fill(g, 94, 96, 9, 9, "R");
  put(g, 101, 6, "$");
  onGround(108);
  fill(g, 116, 118, 7, 7, "S");
  put(g, 122, 5, "v");
  onGround(130);
  fill(g, 134, 135, 9, 9, "R");
  put(g, 138, 9, "B");
  return g;
}
function blueLagoon(): G {
  const g = grid(160);
  fill(g, 0, 159, 11, 11, "#");
  fill(g, 0, 0, 6, 10, "R");
  put(g, 2, 5, "P");
  fill(g, 18, 21, 8, 8, "R");
  fill(g, 30, 33, 3, 3, "R");
  fill(g, 42, 44, 7, 7, "S");
  fill(g, 55, 57, 2, 2, "R");
  fill(g, 67, 70, 8, 8, "R");
  fill(g, 82, 85, 4, 4, "R");
  fill(g, 98, 101, 8, 8, "R");
  fill(g, 112, 115, 2, 2, "R");
  fill(g, 128, 131, 7, 7, "R");
  fill(g, 143, 146, 3, 3, "R");
  [[10,4],[25,6],[37,3],[50,5],[62,8],[76,4],[91,6],[107,5],[121,3],[137,6],[151,5]].forEach(([x,y]) => put(g,x,y,"$"));
  [[16,5],[35,6],[58,5],[73,3],[88,7],[105,4],[123,5],[140,8]].forEach(([x,y]) => put(g,x,y,"p"));
  put(g, 27, 2, "g");
  put(g, 64, 1, "o");
  put(g, 118, 1, "g");
  put(g, 155, 9, "F");
  return g;
}

function coralCaverns(): G {
  const g = grid(150);
  fill(g, 0, 149, 11, 11, "#");
  fill(g, 12, 15, 2, 2, "R");
  fill(g, 24, 28, 8, 8, "R");
  fill(g, 38, 42, 1, 1, "R");
  fill(g, 52, 56, 7, 7, "R");
  fill(g, 67, 71, 3, 3, "R");
  fill(g, 82, 86, 8, 8, "R");
  fill(g, 98, 102, 2, 2, "R");
  fill(g, 114, 118, 7, 7, "R");
  fill(g, 130, 134, 3, 3, "R");
  put(g, 2, 5, "P");
  [[8,7],[19,4],[34,5],[47,3],[61,5],[76,6],[92,4],[108,5],[124,6],[140,5]].forEach(([x,y]) => put(g,x,y,"p"));
  [[18,2],[45,9],[74,1],[105,9],[137,1]].forEach(([x,y]) => put(g,x,y,"g"));
  [[30,5],[58,2],[89,6],[120,2]].forEach(([x,y]) => put(g,x,y,"o"));
  put(g, 145, 9, "F");
  return g;
}

function adventureStage(seed: number, water = false, boss = false): G {
  const g = grid(150);
  fill(g, 0, 149, 11, 11, "#");
  put(g, 2, water ? 5 : 9, "P");

  const patterns = [
    [[12, 8, 3], [28, 5, 4], [46, 8, 3], [65, 4, 5], [84, 7, 4], [104, 3, 4], [124, 7, 4]],
    [[10, 6, 4], [27, 3, 5], [45, 7, 3], [64, 5, 4], [82, 2, 5], [101, 7, 3], [122, 4, 5]],
    [[14, 4, 5], [32, 8, 3], [51, 5, 4], [70, 2, 5], [89, 7, 3], [109, 4, 5], [129, 8, 3]],
    [[11, 7, 3], [30, 4, 5], [49, 8, 3], [68, 3, 5], [87, 6, 4], [107, 2, 5], [127, 7, 3]]
  ];
  const layout = patterns[seed % patterns.length];
  layout.forEach(([x, y, width], i) => {
    fill(g, x, x + width - 1, y, y, water ? "R" : (i % 2 ? "S" : "R"));
    if (i % 2 === seed % 2) put(g, x + 1, y - 1, i % 3 === 0 ? "Q" : "$");
  });

  for (let i = 0; i < 10; i++) {
    const x = 16 + i * 13;
    const y = water ? 2 + ((i * 3 + seed) % 7) : 8;
    put(g, x, y, water ? "p" : (i % 3 === 0 ? "v" : "w"));
    if (i % 2 === 0) put(g, x + 4, Math.max(1, y - 2), "$");
  }
  put(g, 36, 2, "g");
  put(g, 78, 1, "o");
  put(g, 116, 2, "g");
  if (boss) put(g, 138, 9, "B");
  else put(g, 145, 9, "F");
  return g;
}

function gloomCastle(): G {
  const g = grid(136);
  fill(g, 0, 135, 0, 0, "R");
  fill(g, 0, 24, 10, 11, "#");
  fill(g, 27, 50, 10, 11, "#");
  fill(g, 54, 80, 10, 11, "#");
  fill(g, 83, 135, 10, 11, "#");
  fill(g, 135, 135, 1, 9, "R");
  put(g, 2, 9, "P");
  put(g, 8, 9, "K");
  put(g, 9, 9, "S");
  put(g, 9, 8, "S");
  put(g, 14, 9, "w");
  fill(g, 18, 21, 6, 6, "S");
  put(g, 19, 5, "$");
  put(g, 22, 4, "v");
  put(g, 25, 6, "$");
  fill(g, 30, 32, 9, 9, "S");
  put(g, 31, 8, "K");
  put(g, 36, 9, "w");
  put(g, 40, 9, "w");
  fill(g, 44, 46, 6, 6, "R");
  fill(g, 44, 46, 5, 5, "$");
  put(g, 48, 4, "v");
  put(g, 57, 9, "R");
  fill(g, 58, 58, 8, 9, "R");
  put(g, 62, 9, "w");
  put(g, 66, 3, "v");
  fill(g, 70, 72, 9, 9, "K");
  put(g, 76, 9, "w");
  fill(g, 86, 88, 6, 6, "S");
  put(g, 87, 6, "Q");
  put(g, 92, 9, "w");
  put(g, 96, 4, "v");
  put(g, 100, 9, "w");
  fill(g, 104, 105, 9, 9, "R");
  put(g, 126, 9, "B");
  return g;
}

export const LEVELS: LevelDef[] = [
  { name: "1  MT. ETERNAL", theme: "hills", water: false, vertical: true, waterStartY: 72 * 16, sky: "#5c94fc", grid: level1() },
  { name: "2  MARBLE PLAINS", theme: "hills", water: false, sky: "#5c94fc", bossName: "Gooseka the Slippery", grid: mountainDescent() },
  { name: "3  LAKE FATHOM", theme: "lake", water: true, sky: "#1840b8", grid: blueLagoon() },
  { name: "4  ISLAND OF ST. NURARI", theme: "hills", water: false, sky: "#5c94fc", grid: coralCaverns() },
  { name: "5  NAMUI LAKE", theme: "lake", water: true, sky: "#1840b8", grid: adventureStage(0, true) },
  { name: "6  VILLAGE OF NAMUI", theme: "hills", water: false, sky: "#5c94fc", bossName: "Ox", grid: adventureStage(1, false, true) },
  { name: "7  MT. KAVE", theme: "hills", water: false, sky: "#5c94fc", bossName: "Chokkinna the Sly", grid: adventureStage(2, false, true) },
  { name: "8  THE BLAKWOODS", theme: "hills", water: false, sky: "#284878", bossName: "Grizzly Bear", grid: adventureStage(3, false, true) },
  { name: "9  RIVER", theme: "lake", water: true, sky: "#1840b8", grid: adventureStage(1, true) },
  { name: "10  BINGOO LOWLAND", theme: "hills", water: false, sky: "#5c94fc", bossName: "Parplin the Pursuer", grid: adventureStage(2, false, true) },
  { name: "11  RADAXIAN CASTLE", theme: "castle", water: false, sky: "#200820", bossName: "Gooseka the Slippery", grid: adventureStage(3, false, true) },
  { name: "12  RADAXIAN CITY", theme: "castle", water: false, sky: "#301838", grid: adventureStage(0) },
  { name: "13  SWAMP", theme: "lake", water: true, sky: "#285838", bossName: "Chokkinna the Sly", grid: adventureStage(2, true, true) },
  { name: "14  KINGDOM OF NIBANA", theme: "hills", water: false, sky: "#5c94fc", grid: adventureStage(1) },
  { name: "15  NIBANA LOWLANDS", theme: "hills", water: false, sky: "#788848", bossName: "Parplin the Pursuer", grid: adventureStage(3, false, true) },
  { name: "16  JANKEN'S CASTLE", theme: "castle", water: false, sky: "#200820", bossName: "Janken the Great", grid: gloomCastle() },
  { name: "17  CRAGG LAKE", theme: "lake", water: true, sky: "#102b70", grid: adventureStage(0, true) },
];
