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

  // Mt. Eternal: descend through a narrow vertical mountain shaft.
  fill(g, 0, 0, 0, 70, "R");
  fill(g, 15, 15, 0, 70, "R");
  put(g, 7, 2, "P");

  fill(g, 4, 8, 10, 10, "S");
  put(g, 11, 13, "v");
  fill(g, 9, 13, 17, 17, "R");
  put(g, 5, 20, "$");
  put(g, 6, 20, "$");
  fill(g, 2, 6, 25, 25, "S");
  put(g, 10, 28, "v");
  put(g, 4, 30, "Q");

  fill(g, 8, 13, 34, 34, "S");
  put(g, 3, 38, "v");
  fill(g, 3, 7, 42, 42, "R");
  fill(g, 10, 13, 49, 49, "S");
  put(g, 11, 48, "K");
  put(g, 5, 53, "$");
  put(g, 6, 53, "$");

  fill(g, 2, 6, 57, 57, "S");
  put(g, 10, 61, "v");
  fill(g, 8, 13, 65, 65, "R");
  put(g, 4, 68, "Q");
  fill(g, 3, 12, 71, 71, "R");

  // The mountain opens into the underwater section at the bottom.
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
  put(g, 146, 9, "F");
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
  fill(g, 0, 5, 0, 10, "R");
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
  { name: "2  MOUNTAIN TRAIL", theme: "hills", water: false, sky: "#5c94fc", grid: mountainDescent() },
  { name: "3  BLUE LAGOON", theme: "lake", water: true, sky: "#1840b8", grid: blueLagoon() },
  { name: "4  CORAL CAVERNS", theme: "lake", water: true, sky: "#102b70", grid: coralCaverns() },
  { name: "5  GLOOM CASTLE", theme: "castle", water: false, sky: "#200820", grid: gloomCastle() },
];
