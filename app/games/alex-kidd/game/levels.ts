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
  waterEndY?: number;
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

const MT_ETERNAL_SCREENS = [
  "1300820b0c1700820b0c1b00820b0c070081201a0081030200055181530500815204510450815503000220020081540650815709008154055084030000520351815303008154045081030300835450550500815600",
  "0350811006000220030004508251530800821002045081570500815205510450815704008310005408508157040084100000540750865700525151530300815406508b550000545500000b0c0054045081550b0084545050570d00025081570c008403505057050082105203518653000350500305008910205450551000005000",
  "815002100a00861000565051530b008210560250045181530400810303008156055081550300815205518156035082031005008154045081560350851000000b0c030081540350865650505500100700815404508455100010080088545050570010030002100700855650570010030081100400880200005650570003030002038b52515153000056505700100300850300005455030082565000",
  "83570052035181530700830350570c00021082505707008152065182505704100400815404508756505703000010050081540350875650570100001006008a545050565057030000100300820b0c040081540250065181530600821056055081550700831000560450845500000a0400841000005604500400815203518453000056035081550500835450550300815600",
  "8350550a0c008256570e008256570e008556570000520351810805518453005657030081540750855500035657040081540550865500000356570e008556571010030b00825657030081100500815204518250570300811006008154035082565005518a5300000b0c000054505605508155080082545600",
  "045081550a0081560350855500000b0c06008510565003100500810a0400841000565002100c00845657515309000303835657550a008510000056570b008810001056570000520b51825057030081540b508157050081540a508251530600820354055086575500000b0c07008154025000",
  "8257030c00835450570600845251515304008256570e00875657005251515309008256570b0085030000565707008b0b0c00525300005657000a0c00845657000a0b0084035650530d008256570400835251530700855657000b0c0700865253000056570d0082525600",
  "81570e008256570e00925657005251530052515300525153005256570e0082565703008d100a005253000300100a005657030082100a0400871000100a00565703008d10005251530003001000005657030081100500981000100000565051530052515300525153005251515657550b0084545056570d00835456570e00815600",
  "845700000a0500820b0c040085565700000a0b0085565700000a0b0086565700000b0c0a008256570e008256570900820b0c03008256570e008256570e008256570b00850a000056570e00875657000b0c000a09008256500e00815400",
  "81500f3d81500a21813e042181500a21813f042181500451811804218216400421815005160421831a161803218250010221021606218116032186500321211a16042183171619032182501603218616213e2121110321023e88501618212116213f0621023f815002160221831121400321020384214040500f51105000",
  "103d812106510321821a1605210616042181160521811a04168119042181160721831a190305210216851821213e11042181110921813f0651042102168419212140065004218116023e02218151065004218116023f02210750042181160240022107500951105000",
  "0f3d83162117031681180821021682211603218111072103168221160321811107210211831621160321811107218511031621160321811106210211840316210103218111033e8d1716182121021621113e212111033f8d161111213e111621113f21211603408d161111213f111621164021211a0416860311214011161051105000"
];

function decodeLevelScreen(hex: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));
  const tiles: number[] = [];
  for (let i = 0; i < bytes.length;) {
    const count = bytes[i++];
    if (!count) break;
    if (count & 0x80) {
      const length = count & 0x7f;
      for (let j = 0; j < length; j++) tiles.push(bytes[i++]);
    } else {
      const value = bytes[i++];
      for (let j = 0; j < count; j++) tiles.push(value);
    }
  }
  return tiles;
}

function mtEternal(): G {
  const g = grid(48, 120);
  const screens = MT_ETERNAL_SCREENS.map(decodeLevelScreen);
  const token = (id: number) => {
    if (id === 0 || id === 0x0a || id === 0x0b || id === 0x0c || id === 0x20 || id === 0x21) return ".";
    if (id >= 0x50 && id <= 0x57) return "#";
    if (id === 0x01) return "K";
    if (id === 0x02) return "Q";
    if (id === 0x03) return "S";
    return "R";
  };

  // Original ROM layout: ten vertically stacked screens, then two screens
  // extending the final underwater screen to the right.
  for (let screenY = 0; screenY < 10; screenY++) {
    const data = screens[screenY];
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 16; x++) put(g, x, screenY * 12 + y, token(data[y * 16 + x] || 0));
    }
  }
  for (let screenX = 1; screenX < 3; screenX++) {
    const data = screens[9 + screenX];
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 16; x++) put(g, screenX * 16 + x, 108 + y, token(data[y * 16 + x] || 0));
    }
  }

  put(g, 5, 3, "P");
  put(g, 20, 113, "p");
  put(g, 29, 111, "p");
  put(g, 37, 115, "p");
  put(g, 45, 116, "F");
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
    s.platforms.forEach(([x, y, len]) => {
      fill(g, x, Math.min(s.width - 2, x + len - 1), y, y, "R");
      if (len > 3) put(g, Math.min(s.width - 2, x + Math.floor(len / 2)), Math.max(1, y - 2), "$");
    });
    (s.blocks || []).forEach(([x, y]) => put(g, x, y, "R"));
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
  { name: "11  RADAXIAN CASTLE", width: 80, height: 48, theme: "castle", seed: 10, vertical: true, sky: "#200820", boss: true, bossName: "Gooseka the Slippery",
    platforms: [[8,39,8],[22,34,7],[38,29,8],[54,24,7],[10,19,8],[27,14,8],[45,9,8],[61,5,7]], blocks: [[12,38,2],[26,33,1],[42,28,2],[58,23,1],[14,18,0],[31,13,2],[49,8,1]] },
  { name: "12  RADAXIAN CITY", width: 48, height: 12, theme: "castle", seed: 11, sky: "#301838",
    platforms: [[7,7,5],[19,5,5],[32,7,6]], pits: [[14,17],[27,30]], blocks: [[9,6,1],[22,4,0],[35,6,2]] },
  { name: "13  SWAMP", width: 128, height: 12, theme: "lake", water: true, seed: 12, startY: 5, sky: "#285838", boss: true, bossName: "Chokkinna the Sly",
    platforms: [[12,7,5],[32,4,5],[53,8,5],[75,5,6],[98,7,5]], blocks: [[18,6,0],[61,7,0],[105,6,0]] },
  { name: "14  KINGDOM OF NIBANA", width: 32, height: 12, theme: "hills", seed: 13, sky: "#5c94fc",
    platforms: [[8,7,5],[20,5,5]], pits: [[15,18]], blocks: [[10,6,1],[22,4,0]] },
  { name: "15  NIBANA LOWLANDS", width: 176, height: 12, theme: "hills", seed: 14, sky: "#788848", boss: true, bossName: "Parplin the Pursuer",
    platforms: [[10,7,6],[31,4,5],[53,6,6],[76,3,5],[99,7,6],[122,4,5],[145,6,6]], pits: [[22,26],[44,48],[67,71],[90,94],[113,117],[136,140],[159,163]], blocks: [[14,6,1],[57,5,0],[103,6,2],[149,5,1]] },
  { name: "16  JANKEN'S CASTLE", width: 112, height: 72, theme: "castle", seed: 15, vertical: true, sky: "#200820", boss: true, bossName: "Janken the Great",
    platforms: [[8,63,8],[24,57,7],[42,51,8],[61,45,7],[80,39,8],[96,33,7],[12,27,8],[31,21,7],[50,15,8],[70,9,7],[91,4,8]], blocks: [[12,62,2],[28,56,1],[46,50,2],[65,44,1],[84,38,2],[100,32,1],[16,26,2],[35,20,1],[54,14,2],[74,8,1]] },
  { name: "17  CRAGG LAKE", width: 32, height: 36, theme: "lake", water: true, vertical: true, seed: 16, startY: 5, sky: "#102b70",
    platforms: [[8,8,5],[20,16,5],[9,25,5]], blocks: [[10,7,0],[22,15,0]] }
];

export const LEVELS: LevelDef[] = [
  { name: "1  MT. ETERNAL", theme: "hills", water: false, vertical: true, waterStartY: 108 * 16, sky: "#5c94fc", grid: mtEternal() },
  ...STAGES.map((s) => ({ name: s.name, theme: s.theme, water: !!s.water, vertical: !!s.vertical, sky: s.sky, bossName: s.bossName, grid: makeStage(s) }))
];
