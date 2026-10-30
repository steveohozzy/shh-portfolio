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
  put(g, 112, 8, "w");
  put(g, 118, 8, "w");
  put(g, 122, 5, "v");
  fill(g, 126, 128, 6, 6, "S");
  put(g, 130, 9, "w");
  fill(g, 134, 135, 9, 9, "R");
  put(g, 140, 4, "v");
  put(g, 146, 9, "F");
  return g;
}


function mountainDescent(): G {
  const g = grid(150);

  // One continuous mountain path: the ground steps down gradually,
  // then opens into the lagoon at the far end.
  const groundAt = (x: number) => {
    if (x < 14) return 6;
    if (x < 28) return 7;
    if (x < 42) return 8;
    if (x < 56) return 9;
    if (x < 70) return 10;
    if (x < 112) return 10;
    return 11;
  };

  for (let x = 0; x < 150; x++) {
    fill(g, x, x, groundAt(x), 11, "#");
  }

  put(g, 2, 4, "P");

  // Mountain collectibles and breakable blocks sit just above the route.
  fill(g, 9, 10, 4, 4, "S");
  put(g, 17, 5, "w");
  fill(g, 23, 25, 4, 4, "R");
  put(g, 30, 5, "$");
  put(g, 37, 4, "v");
  fill(g, 44, 46, 6, 6, "S");
  put(g, 45, 5, "Q");
  put(g, 52, 8, "w");
  fill(g, 59, 61, 7, 7, "R");
  put(g, 60, 5, "o");
  put(g, 67, 6, "v");
  fill(g, 74, 76, 7, 7, "S");
  put(g, 82, 9, "w");
  put(g, 88, 6, "g");
  fill(g, 94, 96, 7, 7, "R");
  put(g, 101, 6, "$");
  put(g, 108, 9, "w");

  // Visible shoreline and underwater route.
  fill(g, 112, 114, 9, 9, "R");
  put(g, 118, 8, "p");
  put(g, 124, 7, "g");
  put(g, 130, 8, "p");
  put(g, 138, 6, "o");
  put(g, 144, 8, "p");
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
  { name: "1  SUNNY HILLS", theme: "hills", water: false, sky: "#5c94fc", grid: level1() },
  { name: "2  MOUNTAIN DESCENT", theme: "hills", water: false, waterStartX: 112 * 16, sky: "#5c94fc", grid: mountainDescent() },
  { name: "3  BLUE LAGOON", theme: "lake", water: true, sky: "#1840b8", grid: blueLagoon() },
  { name: "4  CORAL CAVERNS", theme: "lake", water: true, sky: "#102b70", grid: coralCaverns() },
  { name: "5  GLOOM CASTLE", theme: "castle", water: false, sky: "#200820", grid: gloomCastle() },
];
