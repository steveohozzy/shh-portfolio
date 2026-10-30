// @ts-nocheck
// 16px Master System-style stages. # ground, R rock, S star block, Q ? block,
// K skull block, $ money, g hidden gem, o large treasure, w walker, v bird,
// p fish, F exit sandwich, P player start, B boss.
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

function mtEternal(): G {
  const g = grid(48, 120);
  fill(g, 0, 0, 0, 88, "R");
  fill(g, 47, 47, 0, 88, "R");
  put(g, 7, 2, "P");

  // A descending zig-zag of broad ledges: every drop has another reachable shelf.
  const ledges = [
    [3, 16, 7], [25, 44, 13], [4, 23, 19], [25, 44, 25],
    [3, 20, 31], [23, 44, 37], [4, 23, 43], [25, 44, 49],
    [3, 21, 55], [24, 44, 61], [4, 23, 67], [25, 44, 73],
    [3, 20, 79], [22, 44, 85]
  ];
  ledges.forEach(([x0, x1, y], i) => {
    fill(g, x0, x1, y, y + 1, i % 2 ? "R" : "S");
    if (i % 2 === 0) put(g, Math.min(x1 - 2, x0 + 7), y - 1, "Q");
    else put(g, Math.max(x0 + 2, x1 - 7), y - 1, "S");
    put(g, i % 2 ? x0 + 3 : x1 - 3, y - 2, "$");
    if (i % 3 === 1) put(g, i % 2 ? x0 + 8 : x1 - 8, y - 3, "v");
    if (i % 3 === 2) put(g, i % 2 ? x0 + 5 : x1 - 5, y - 1, "w");
  });
  [[18,12],[28,30],[16,42],[31,54],[17,66],[30,78]].forEach(([x,y]) => put(g,x,y,"$"));
  put(g, 13, 34, "g");
  put(g, 34, 58, "o");

  // The mountain opens into the horizontal underwater route.
  fill(g, 1, 46, 91, 119, ".");
  fill(g, 1, 46, 119, 119, "R");
  fill(g, 0, 0, 89, 119, "R");
  fill(g, 47, 47, 89, 119, "R");
  [[5,98],[13,105],[21,96],[29,108],[37,99],[43,111]].forEach(([x,y]) => put(g,x,y,"p"));
  [[9,112],[18,101],[27,114],[35,104]].forEach(([x,y]) => put(g,x,y,"$"));
  put(g, 24, 102, "o");
  put(g, 43, 108, "F");
  return g;
}

type StageSpec = {
  width: number; height: number; theme: Theme; water?: boolean; boss?: boolean;
  startY?: number; seed: number; name: string; sky: string; bossName?: string;
  platforms: number[][];
  pits?: number[][];
  blocks?: number[][];
};

function makeStage(s: StageSpec): G {
  const g = grid(s.width, s.height);
  const floor = s.height - 2;
  const startY = s.startY ?? (s.water ? Math.max(3, Math.floor(s.height / 2)) : floor - 1);
  put(g, 2, startY, "P");

  if (s.water) {
    // Open swimming routes with staggered rock shelves and clear channels.
    fill(g, 0, s.width - 1, s.height - 1, s.height - 1, "R");
    for (let x = 0; x < s.width; x += 16) {
      const y = 2 + ((x * 3 + s.seed * 5) % Math.max(5, s.height - 6));
      fill(g, x + 5, Math.min(s.width - 2, x + 8), y, y, "R");
      if (x % 32 === 0) put(g, Math.min(s.width - 2, x + 11), Math.min(s.height - 3, y + 3), "S");
      put(g, Math.min(s.width - 2, x + 13), Math.max(1, y - 1), "p");
      if (x % 3 === 0) put(g, Math.min(s.width - 2, x + 2), Math.max(1, y - 3), "$");
    }
    for (let x = 14; x < s.width - 8; x += 29) put(g, x, 2 + ((x + s.seed) % Math.max(5, s.height - 5)), "p");
  } else {
    fill(g, 0, s.width - 1, floor, s.height - 1, "#");
    (s.pits || []).forEach(([x0, x1]) => fill(g, x0, x1, floor, s.height - 1, "."));
    // Short, climbable ledges are deliberately varied by stage.
    s.platforms.forEach(([x, y, len, type = 0]) => {
      fill(g, x, Math.min(s.width - 2, x + len - 1), y, y, type === 1 ? "R" : "S");
      if (len > 3 && type !== 2) put(g, Math.min(s.width - 2, x + Math.floor(len / 2)), y - 1, type === 1 ? "Q" : "$");
    });
    for (let x = 15; x < s.width - 10; x += 23) {
      const y = floor - 1 - ((Math.floor(x / 23) + s.seed) % 3);
      put(g, x, y, (Math.floor(x / 23) + s.seed) % 4 === 0 ? "v" : "w");
      if (x % 2) put(g, x + 4, y - 2, "$");
    }
    (s.blocks || []).forEach(([x, y, type]) => put(g, x, y, type === 1 ? "Q" : type === 2 ? "K" : "S"));
  }

  // Every stage has its own endpoint and boss arena marker.
  const endX = s.width - 5;
  if (s.boss) put(g, endX - 5, floor - 1, "B");
  else put(g, endX, s.water ? Math.max(2, startY) : floor - 1, "F");
  return g;
}

const STAGES: StageSpec[] = [
  { name: "2  MARBLE PLAINS", width: 288, height: 12, theme: "hills", seed: 1, sky: "#5c94fc", boss: true, bossName: "Gooseka the Slippery",
    platforms: [[12,7,5],[32,5,4],[55,8,6],[79,6,5],[104,4,5],[131,7,6],[158,5,4],[184,8,6],[211,6,5],[239,4,6],[263,7,5]],
    pits: [[43,47],[91,96],[145,151],[202,208],[250,255]], blocks: [[18,6,1],[61,7,2],[112,3,1],[169,4,2],[224,5,1]] },
  { name: "3  LAKE FATHOM", width: 96, height: 24, theme: "lake", water: true, seed: 2, startY: 9, sky: "#1840b8",
    platforms: [[12,6,4],[30,13,5],[51,5,5],[72,15,4]], blocks: [[20,4,0],[60,12,0]] },
  { name: "4  ISLAND OF ST. NURARI", width: 80, height: 12, theme: "hills", seed: 3, sky: "#5c94fc",
    platforms: [[9,7,5],[20,5,4],[34,8,6],[49,4,5],[64,7,6]], pits: [[15,18],[29,32],[44,47],[59,62]], blocks: [[11,6,1],[37,7,0],[53,3,1]] },
  { name: "5  NAMUI LAKE", width: 192, height: 24, theme: "lake", water: true, seed: 4, startY: 10, sky: "#1840b8",
    platforms: [[15,7,5],[43,15,5],[74,5,6],[105,16,5],[139,8,6],[168,13,5]], blocks: [[32,6,0],[91,12,0],[153,7,0]] },
  { name: "6  VILLAGE OF NAMUI", width: 144, height: 12, theme: "hills", seed: 5, sky: "#5c94fc", boss: true, bossName: "Ox",
    platforms: [[8,7,5],[23,5,6],[42,8,4],[60,6,6],[80,4,5],[99,7,6],[120,5,5]], pits: [[16,19],[35,38],[54,57],[73,76],[92,95],[112,115]], blocks: [[25,4,1],[63,5,0],[103,6,2]] },
  { name: "7  MT. KAVE", width: 144, height: 12, theme: "hills", seed: 6, sky: "#7888d8", boss: true, bossName: "Chokkinna the Sly",
    platforms: [[10,4,5],[27,7,4],[43,3,6],[62,6,5],[81,4,5],[99,7,5],[119,3,6]], pits: [[19,22],[36,39],[55,58],[74,77],[92,95],[111,114]], blocks: [[13,3,1],[46,2,0],[84,3,2],[123,2,1]] },
  { name: "8  THE BLAKWOODS", width: 192, height: 12, theme: "hills", seed: 7, sky: "#284878", boss: true, bossName: "Grizzly Bear",
    platforms: [[11,7,6],[32,4,5],[54,6,5],[77,3,6],[101,7,5],[124,4,6],[148,6,5],[170,3,6]], pits: [[22,26],[45,49],[68,72],[92,96],[115,119],[139,143],[162,166]], blocks: [[14,6,1],[57,5,0],[104,6,2],[151,5,1]] },
  { name: "9  RIVER", width: 256, height: 24, theme: "lake", water: true, seed: 8, startY: 10, sky: "#1840b8",
    platforms: [[18,7,5],[49,14,6],[83,5,5],[117,16,6],[151,7,5],[185,14,6],[220,6,5]], blocks: [[36,6,0],[101,12,0],[168,6,0],[234,12,0]] },
  { name: "10  BINGOO LOWLAND", width: 240, height: 12, theme: "hills", seed: 9, sky: "#e8b850", boss: true, bossName: "Parplin the Pursuer",
    platforms: [[12,7,5],[34,5,5],[58,8,6],[83,4,5],[108,7,6],[133,5,5],[158,8,6],[184,4,5],[209,7,6]], pits: [[23,27],[47,51],[73,77],[98,102],[123,127],[148,152],[174,178],[199,203],[224,228]], blocks: [[15,6,1],[62,7,0],[111,6,2],[161,7,1],[212,6,0]] },
  { name: "11  RADAXIAN CASTLE", width: 80, height: 48, theme: "castle", seed: 10, sky: "#200820", boss: true, bossName: "Gooseka the Slippery",
    platforms: [[8,39,8],[22,34,7],[38,29,8],[54,24,7],[10,19,8],[27,14,8],[45,9,8],[61,5,7]], blocks: [[12,38,2],[26,33,1],[42,28,2],[58,23,1],[14,18,0],[31,13,2],[49,8,1]] },
  { name: "12  RADAXIAN CITY", width: 48, height: 12, theme: "castle", seed: 11, sky: "#301838", boss: true, bossName: "Chokkinna the Sly",
    platforms: [[7,7,5],[19,5,5],[32,7,6]], pits: [[14,17],[27,30]], blocks: [[9,6,1],[22,4,0],[35,6,2]] },
  { name: "13  SWAMP", width: 128, height: 12, theme: "lake", water: true, seed: 12, startY: 5, sky: "#285838", boss: true, bossName: "Chokkinna the Sly",
    platforms: [[12,7,5],[32,4,5],[53,8,5],[75,5,6],[98,7,5]], blocks: [[18,6,0],[61,7,0],[105,6,0]] },
  { name: "14  KINGDOM OF NIBANA", width: 32, height: 12, theme: "hills", seed: 13, sky: "#5c94fc",
    platforms: [[8,7,5],[20,5,5]], pits: [[15,18]], blocks: [[10,6,1],[22,4,0]] },
  { name: "15  NIBANA LOWLANDS", width: 176, height: 12, theme: "hills", seed: 14, sky: "#788848", boss: true, bossName: "Parplin the Pursuer",
    platforms: [[10,7,6],[31,4,5],[53,6,6],[76,3,5],[99,7,6],[122,4,5],[145,6,6]], pits: [[22,26],[44,48],[67,71],[90,94],[113,117],[136,140],[159,163]], blocks: [[14,6,1],[57,5,0],[103,6,2],[149,5,1]] },
  { name: "16  JANKEN'S CASTLE", width: 112, height: 72, theme: "castle", seed: 15, sky: "#200820", boss: true, bossName: "Janken the Great",
    platforms: [[8,63,8],[24,57,7],[42,51,8],[61,45,7],[80,39,8],[96,33,7],[12,27,8],[31,21,7],[50,15,8],[70,9,7],[91,4,8]], blocks: [[12,62,2],[28,56,1],[46,50,2],[65,44,1],[84,38,2],[100,32,1],[16,26,2],[35,20,1],[54,14,2],[74,8,1]] },
  { name: "17  CRAGG LAKE", width: 32, height: 36, theme: "lake", water: true, seed: 16, startY: 5, sky: "#102b70",
    platforms: [[8,8,5],[20,16,5],[9,25,5]], blocks: [[10,7,0],[22,15,0]] }
];

export const LEVELS: LevelDef[] = [
  { name: "1  MT. ETERNAL", theme: "hills", water: false, vertical: true, waterStartY: 91 * 16, sky: "#5c94fc", grid: mtEternal() },
  ...STAGES.map((s) => ({ name: s.name, theme: s.theme, water: !!s.water, sky: s.sky, bossName: s.bossName, grid: makeStage(s) }))
];
