// @ts-nocheck
// Level layouts built on a 16px tile grid, 12 rows tall (Master System 256x192 screen).
// Legend: # ground  R rock  S star block  Q ? block  K skull block  $ money bag
//         w walker  v bird  p fish  F goal chest  P player start  B boss
export const H = 12;
export type Theme = "hills" | "lake" | "castle";
export interface LevelDef {
  name: string;
  theme: Theme;
  water: boolean;
  sky: string;
  grid: string[][];
}

type G = string[][];
const grid = (w: number): G => Array.from({ length: H }, () => Array<string>(w).fill("."));
const put = (g: G, x: number, y: number, c: string) => {
  if (y >= 0 && y < H && x >= 0 && x < g[0].length) g[y][x] = c;
};
const fill = (g: G, x0: number, x1: number, y0: number, y1: number, c: string) => {
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) put(g, x, y, c);
};

function level1(): G {
  const g = grid(150);
  fill(g, 0, 30, 10, 11, "#");
  fill(g, 33, 60, 10, 11, "#");
  fill(g, 64, 100, 10, 11, "#");
  fill(g, 103, 149, 10, 11, "#");
  put(g, 2, 9, "P");
  fill(g, 10, 11, 8, 9, "S");
  put(g, 14, 9, "w");
  fill(g, 16, 19, 6, 6, "S");
  put(g, 21, 6, "Q");
  fill(g, 26, 27, 9, 9, "R");
  put(g, 27, 8, "R");
  put(g, 31, 6, "$");
  put(g, 32, 6, "$");
  fill(g, 38, 40, 9, 9, "S");
  put(g, 39, 8, "K");
  put(g, 40, 8, "S");
  put(g, 44, 9, "w");
  put(g, 50, 5, "v");
  fill(g, 54, 57, 6, 6, "R");
  fill(g, 54, 57, 5, 5, "$");
  fill(g, 58, 59, 9, 9, "S");
  put(g, 62, 6, "$");
  fill(g, 66, 70, 7, 7, "R");
  fill(g, 66, 70, 6, 6, "$");
  put(g, 72, 9, "w");
  put(g, 76, 9, "w");
  put(g, 78, 4, "v");
  put(g, 82, 9, "R");
  fill(g, 83, 83, 8, 9, "R");
  fill(g, 84, 86, 7, 9, "R");
  put(g, 85, 6, "$");
  put(g, 90, 9, "w");
  fill(g, 93, 95, 6, 6, "S");
  put(g, 94, 6, "Q");
  put(g, 98, 4, "v");
  fill(g, 106, 108, 8, 9, "S");
  put(g, 107, 7, "K");
  put(g, 112, 9, "w");
  put(g, 118, 9, "w");
  put(g, 122, 5, "v");
  fill(g, 126, 128, 6, 6, "S");
  put(g, 130, 9, "w");
  fill(g, 134, 135, 9, 9, "R");
  put(g, 140, 4, "v");
  put(g, 146, 9, "F");
  return g;
}

function level2(): G {
  const g = grid(160);
  fill(g, 0, 159, 11, 11, "#");
  put(g, 2, 2, "P");
  const pillars = [[12, 3], [20, 5], [30, 2], [38, 6], [50, 4], [62, 3], [70, 5], [84, 4], [96, 6], [108, 3], [120, 5], [132, 4], [144, 3]];
  pillars.forEach(([x, h]) => fill(g, x, x + 1, 11 - h, 10, "R"));
  const hangs = [[24, 3], [44, 4], [58, 3], [78, 4], [90, 3], [114, 4], [138, 3]];
  hangs.forEach(([x, h]) => fill(g, x, x + 1, 0, h - 1, "R"));
  fill(g, 16, 17, 8, 9, "S");
  fill(g, 34, 35, 4, 4, "S");
  put(g, 46, 8, "Q");
  fill(g, 66, 67, 7, 8, "S");
  put(g, 88, 9, "K");
  fill(g, 100, 102, 5, 5, "S");
  fill(g, 126, 127, 8, 9, "S");
  [[8, 5], [26, 6], [41, 3], [55, 7], [74, 4], [93, 6], [111, 8], [124, 3], [141, 7], [150, 5]].forEach(([x, y]) => put(g, x, y, "$"));
  [[9, 7], [18, 3], [27, 8], [36, 8], [42, 6], [54, 4], [60, 8], [74, 6], [80, 7], [92, 4], [104, 8], [112, 5], [118, 3], [128, 6], [136, 8], [150, 3]].forEach(([x, y]) => put(g, x, y, "p"));
  put(g, 155, 10, "F");
  return g;
}

function level3(): G {
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
  { name: "1  SUNNY HILLS", theme: "hills", water: false, sky: "#5c94fc", grid: level1() },
  { name: "2  BLUE LAGOON", theme: "lake", water: true, sky: "#1840b8", grid: level2() },
  { name: "3  GLOOM CASTLE", theme: "castle", water: false, sky: "#200820", grid: level3() },
];
