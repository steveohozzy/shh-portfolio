// @ts-nocheck
import * as Phaser from "phaser";

// Master System–style limited palette
export const PAL: Record<string, string> = {
  k: "#000000", w: "#ffffff", s: "#f8b878", h: "#8c3c10", t: "#20a8c8", y: "#f8d820",
  b: "#a05010", r: "#d82800", o: "#f87800", g: "#40c040", G: "#207020", u: "#3858f8",
  U: "#1830a0", p: "#f878f8", e: "#909090", E: "#484848", n: "#c8c8c8", m: "#a000a0",
};

function pad(rows: string[], w: number, h: number) {
  const r = rows.map((x) => x.padEnd(w, ".").slice(0, w));
  while (r.length < h) r.unshift(".".repeat(w));
  return r.slice(0, h);
}
function gen(s: Phaser.Scene, key: string, rows: string[], px = 1, w = 16, h = 16) {
  s.textures.generate(key, { data: pad(rows, w, h), pixelWidth: px, palette: PAL as never });
}

const HEAD = [
  ".....hhhhh......",
  "....hhhhhhhh....",
  "...hhhhhhhhhh...",
  "...hhhsssssh....",
  "..shhssskssk....",
  "..sshsssssss....",
  "...ssssssrrs....",
  "....sssssss.....",
];
const BODY = {
  idle: ["....tttttt......", "...tttttttts....", "..sttttttttts...", "..s.ttyyyytt.s..", "....tttttttt....", "....ss....ss....", "...bbb....bbb...", "..bbbb....bbbb.."],
  run1: ["....tttttt......", "...ttttttttts...", "..sttttttttts...", "....ttyyyytt....", "....tttttttt....", "...ss......ss...", "..bbb......bbb..", ".bbb........bb.."],
  run2: ["....tttttt......", "...tttttttt.....", "...sttttttts....", "....ttyyyytt....", "....tttttttt....", ".....ss..ss.....", ".....bbbbbb.....", "....bbb..bbb...."],
  jump: ["..s.tttttt.s....", "..sttttttttts...", "....tttttttt....", "....ttyyyytt....", "....tttttttt....", "...ss....ss.....", "..bbb.....bbb...", "...........bb..."],
  punch: ["....tttttt......", "...ttttttttsss..", "...tttttttsssss.", "...ttyyyytt.sss.", "....tttttttt....", "....ss....ss....", "...bbb....bbb...", "..bbbb....bbbb.."],
  swim1: ["....tttttt......", "...ttttttttts...", "..sttttttttts...", "....ttyyyytt....", "...tttttttt......", "..ss........ss..", ".bbb........bbb.", "................"],
  swim2: ["....tttttt......", "...ttttttttts...", "..sttttttttts...", "....ttyyyytt....", "...tttttttt......", "....ss......ss..", "...bbbb....bbbb.", "................"],
};

const HANDS = {
  hand0: ["....kkkkkk......", "...kssksskk.....", "..kssksskssk....", "..kssksskssk....", "..kssssssssk....", "..kssssssssk....", "...kssssssk.....", "....kssssk......", "....kkkkkk......"],
  hand1: ["..k.k.k.k.......", ".kskskskskk.....", ".kskskskssk.....", ".kskskskssk..kk.", ".kssssssssk.ksk.", ".kssssssssskssk.", ".ksssssssssssk..", "..ksssssssssk...", "...kssssssk.....", "...kkkkkkkk....."],
  hand2: ["..kk...kk.......", ".ksk..ksk.......", ".ksk..ksk.......", "..ksk.ksk.......", "..kskksk........", "..kssssskk......", ".kssksksssk.....", ".kssksksssk.....", "..kssssssk......", "...kssssk.......", "...kkkkkk......."],
};

function canvas(s: Phaser.Scene, key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const t = s.textures.createCanvas(key, w, h)!;
  draw(t.getContext());
  t.refresh();
}
function icon(c: CanvasRenderingContext2D, rows: string[], ox: number, oy: number) {
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== ".") { c.fillStyle = PAL[ch]; c.fillRect(ox + x, oy + y, 1, 1); }
  }));
}
function block(s: Phaser.Scene, key: string, base: string, light: string, dark: string, ic?: string[]) {
  canvas(s, key, 16, 16, (c) => {
    c.fillStyle = base; c.fillRect(0, 0, 16, 16);
    c.fillStyle = light; c.fillRect(0, 0, 16, 2); c.fillRect(0, 0, 2, 16);
    c.fillStyle = dark; c.fillRect(0, 14, 16, 2); c.fillRect(14, 0, 2, 16);
    if (ic) icon(c, ic, 4, 4);
  });
}

export function makeTextures(s: Phaser.Scene) {
  (Object.keys(BODY) as (keyof typeof BODY)[]).forEach((k) => gen(s, `hero_${k}`, [...HEAD, ...BODY[k]]));
  (Object.keys(HANDS) as (keyof typeof HANDS)[]).forEach((k) => gen(s, k, HANDS[k]));

  gen(s, "scorp", ["..........rr....", "...........rr...", "..........rrr...", ".........rrr....", "....rrrrrrr.....", "..rrrrrrrrrr....", ".rrwkrrrrrrrr...", ".rrrrrrrrrrrr...", "rr.rrrrrrrrr.rr.", "r..r.r..r.r...r."]);
  gen(s, "bird", ["....kk..........", "...kyyk.....yyy.", "..kyyyyk..yyyyy.", ".oyyywkyyyyyyy..", "ooyyyyyyyyyyy...", ".kyyyyyyyyyk....", "..kyyyyyyyk.....", "....kkkkk.......", "................"]);
  gen(s, "fish", [".....oooo.......", "...oooooooo..o..", "..owkooooooooo..", ".ooooooooooooo..", "..oooooooooo.oo.", "...ooooooo......", "................", "................"]);
  gen(s, "ghost", ["....wwwwww......", "..wwwwwwwwww....", ".wwkkwwwkkwww...", ".wwkkwwwkkwww...", ".wwwwwwwwwwww...", ".wwwwrrrwwwww...", ".wwwwwwwwwwww...", ".wwwwwwwwwwww...", ".ww.www.www.w...", ".w...w...w......", "................"]);
  gen(s, "money", ["......kk........", ".....kyyk.......", "......kk........", "....kyyyyk......", "...kyyyyyyk.....", "..kyyykkyyyk....", "..kyykyyyyyk....", "..kyyykkyyyk....", "..kyyyyykyyk....", "..kyyykkyyyk....", "...kyyyyyyk.....", "....kkkkkk......"]);
  gen(s, "moneybig", ["......kk........", ".....kwwk.......", "......kk........", "...kkwwwwkk.....", "..kwwwwwwwwk....", ".kwwwkkkwwwwk...", ".kwwkwwwwwwwk...", ".kwwwkkkwwwwk...", ".kwwwwwwkwwwk...", ".kwwkkkkwwwwk...", "..kwwwwwwwwk....", "...kkkkkkkk....."]);
  gen(s, "bracelet", ["....kkkkkk......", "...kyyyyyyk.....", "..kyykkkkyyk....", "..kyk....kyk....", "..kyk....kyk....", "..kyykkkkyyk....", "...kyyyyyyk.....", "....kkkkkk......", "................", "................"]);
  gen(s, "life", ["..kk...kk.......", ".krrk.krrk......", "krwrrkrrrrk.....", "krrrrrrrrrk.....", ".krrrrrrrk......", "..krrrrrk.......", "...krrrk........", "....krk.........", ".....k..........", "................", "................"]);
  gen(s, "chest", ["..kkkkkkkkkkkk..", ".kbbbbbbbbbbbbk.", ".kbyybbbbbbyybk.", ".kbbbbbbbbbbbbk.", ".kkkkkkyykkkkkk.", ".kbbbbbykybbbbk.", ".kbbbbbyyybbbbk.", ".kbyybbbbbbyybk.", ".kbbbbbbbbbbbbk.", ".kkkkkkkkkkkkkk."]);
  gen(s, "boss", [".k............k.", ".wk..........kw.", "..wkkkkkkkkkkw..", "...kbbbbbbbbk...", "..kbbwkbbwkbbk..", "..kbbbbbbbbbbk..", "..kbbppppppbbk..", "...kbpkppkpbk...", "....kbbbbbbk....", "..kkrrrrrrrrkk..", ".kbbrryyyyrrbbk.", ".kbbrrrrrrrrbbk.", "..kkrrrrrrrrkk..", "....kbbk.kbbk...", "...kbbbk.kbbbk..", "...kkkk...kkkk.."], 2);
  gen(s, "shot", ["..yyyy..", ".yy..yy.", "yy....yy", "y......y", "y......y", "yy....yy", ".yy..yy.", "..yyyy.."], 1, 8, 8);
  gen(s, "bossrock", ["..EEEE..", ".EeeeeE.", "EeennenE", "EeeeeeeE", "EeeeeeeE", "EeeeeneE", ".EeeeeE.", "..EEEE.."], 1, 8, 8);
  gen(s, "debris", ["bbbb", "boob", "bobb", "bbbb"], 1, 4, 4);
  gen(s, "bubble", [".nn.", "n..n", "n..n", ".nn."], 1, 4, 4);
  gen(s, "gem", [".......k........", "......kpk.......", ".....kpypk......", "....kpypypk.....", "....kpypypk.....", ".....kpypk......", "......kkk.......", ".......k........"]);
  gen(s, "treasure", ["....kkkkkkkk....", "...kbbbbbbbbk...", "...kbyyyyyybk...", "...kbbbbbbbbk...", "...kkkkkyykkkk...", "...kbbbbbbbbk...", "...kbbbbbbbbk...", "....kkkkkkkk...."]);

  const star = ["...y....", "...y....", "yyyyyyy.", ".yyyyy..", "..yyy...", ".yy.yy..", "y.....y."];
  const q = ["..www...", ".w...w..", ".....w..", "....w...", "...w....", "...w....", "........", "...w...."];
  const skull = ["..www...", ".wwwww..", ".wkwkw..", ".wwwww..", "..www...", "..w.w..."];
  block(s, "blk_star", "#c86818", "#f8a040", "#783000", star);
  block(s, "blk_q", "#2858d8", "#78a8f8", "#102878", q);
  block(s, "blk_skull", "#686868", "#a8a8a8", "#303030", skull);
  block(s, "rock", "#887868", "#b8a898", "#483828");

  // themed ground
  canvas(s, "hills_top", 16, 16, (c) => {
    c.fillStyle = "#c87830"; c.fillRect(0, 0, 16, 16);
    c.fillStyle = "#984810"; [[3, 9], [10, 12], [6, 14], [13, 7]].forEach(([x, y]) => c.fillRect(x, y, 2, 2));
    c.fillStyle = "#40c040"; c.fillRect(0, 0, 16, 5);
    c.fillStyle = "#207020"; c.fillRect(0, 5, 16, 1); c.fillRect(2, 5, 2, 2); c.fillRect(9, 5, 3, 2);
    c.fillStyle = "#98f898"; c.fillRect(0, 0, 16, 1);
  });
  canvas(s, "hills_fill", 16, 16, (c) => {
    c.fillStyle = "#c87830"; c.fillRect(0, 0, 16, 16);
    c.fillStyle = "#984810"; [[2, 3], [10, 6], [5, 11], [13, 13]].forEach(([x, y]) => c.fillRect(x, y, 2, 2));
  });
  canvas(s, "lake_top", 16, 16, (c) => {
    c.fillStyle = "#d8b060"; c.fillRect(0, 0, 16, 16);
    c.fillStyle = "#f8e0a0"; c.fillRect(0, 0, 16, 2);
    c.fillStyle = "#a88030"; [[3, 6], [11, 9], [7, 13]].forEach(([x, y]) => c.fillRect(x, y, 2, 1));
  });
  canvas(s, "castle_top", 16, 16, (c) => {
    c.fillStyle = "#583868"; c.fillRect(0, 0, 16, 16);
    c.fillStyle = "#301838"; c.fillRect(0, 7, 16, 1); c.fillRect(0, 15, 16, 1); c.fillRect(7, 0, 1, 7); c.fillRect(3, 8, 1, 7); c.fillRect(12, 8, 1, 7);
    c.fillStyle = "#8868a0"; c.fillRect(0, 0, 7, 1); c.fillRect(8, 0, 8, 1); c.fillRect(0, 8, 3, 1); c.fillRect(4, 8, 8, 1);
  });

  // backgrounds (256x192, tiled horizontally for parallax)
  canvas(s, "bg_hills", 256, 192, (c) => {
    c.fillStyle = "#5c94fc"; c.fillRect(0, 0, 256, 192);
    c.fillStyle = "#ffffff";
    [[30, 30], [140, 50], [210, 22]].forEach(([x, y]) => { c.fillRect(x, y, 32, 8); c.fillRect(x + 6, y - 6, 18, 6); c.fillRect(x - 4, y + 3, 40, 5); });
    c.fillStyle = "#88d870";
    for (let x = 0; x < 256; x++) { const hgt = 40 + Math.sin(x / 22) * 14 + Math.sin(x / 9) * 4; c.fillRect(x, 192 - hgt - 24, 1, hgt + 24); }
    c.fillStyle = "#48a848";
    for (let x = 0; x < 256; x++) { const hgt = 22 + Math.sin(x / 14 + 2) * 8; c.fillRect(x, 192 - hgt - 20, 1, hgt + 20); }
  });
  canvas(s, "bg_lake", 256, 192, (c) => {
    for (let y = 0; y < 192; y++) { const v = y / 192; c.fillStyle = `rgb(${24 - v * 16},${88 - v * 60},${216 - v * 90})`; c.fillRect(0, y, 256, 1); }
    c.fillStyle = "rgba(160,220,255,0.18)";
    [[20, 50], [90, 40], [170, 60], [230, 30]].forEach(([x, w]) => { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + w, 0); c.lineTo(x + w - 30, 192); c.lineTo(x - 30, 192); c.fill(); });
    c.fillStyle = "#3c8828";
    [[16, 6], [70, 9], [130, 5], [200, 8]].forEach(([x, n]) => { for (let i = 0; i < n; i++) c.fillRect(x + (i % 2) * 2, 192 - 16 - i * 6, 3, 6); });
    c.fillStyle = "#a8e0ff"; c.fillRect(0, 0, 256, 2);
  });
  canvas(s, "bg_castle", 256, 192, (c) => {
    c.fillStyle = "#200820"; c.fillRect(0, 0, 256, 192);
    c.fillStyle = "#381838";
    for (let y = 0; y < 192; y += 8) for (let x = (y / 8) % 2 ? 0 : 8; x < 256; x += 16) c.fillRect(x, y, 15, 7);
    c.fillStyle = "#100010";
    [[40, 50], [140, 50], [210, 70]].forEach(([x, y]) => { c.fillRect(x, y, 16, 26); c.fillRect(x + 3, y - 4, 10, 4); });
    c.fillStyle = "#f87800";
    [[24, 90], [120, 90], [190, 110]].forEach(([x, y]) => { c.fillRect(x, y, 4, 6); c.fillStyle = "#f8d820"; c.fillRect(x + 1, y - 3, 2, 3); c.fillStyle = "#f87800"; });
  });

  const a = s.anims;
  if (!a.exists("run")) a.create({ key: "run", frames: [{ key: "hero_run1" }, { key: "hero_run2" }], frameRate: 10, repeat: -1 });
  if (!a.exists("swim")) a.create({ key: "swim", frames: [{ key: "hero_swim1" }, { key: "hero_swim2" }], frameRate: 5, repeat: -1 });
}
