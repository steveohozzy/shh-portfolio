// @ts-nocheck
// Tiny chiptune sound engine (square/triangle/noise) using WebAudio. Browser-only; all access inside functions.
let ctx: AudioContext | null = null;
let muted = false;
let musicTimer: ReturnType<typeof setInterval> | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "square", vol = 0.07, slideTo?: number, delay = 0) {
  if (muted) return;
  const a = ac();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur: number, vol = 0.08) {
  if (muted) return;
  const a = ac();
  if (!a) return;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = a.createBufferSource();
  const g = a.createGain();
  g.gain.value = vol;
  s.buffer = buf;
  s.connect(g).connect(a.destination);
  s.start();
}

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

export const SONGS: Record<string, { lead: number[]; bass: number[]; step: number }> = {
  hills: {
    step: 140,
    lead: [72, 0, 76, 79, 0, 76, 74, 0, 77, 81, 0, 77, 76, 0, 72, 0, 74, 0, 77, 81, 0, 84, 83, 0, 79, 0, 76, 74, 72, 0, 0, 0],
    bass: [48, 0, 55, 0, 48, 0, 55, 0, 50, 0, 57, 0, 53, 0, 57, 0, 50, 0, 57, 0, 53, 0, 55, 0, 43, 0, 50, 0, 48, 0, 55, 0],
  },
  lake: {
    step: 190,
    lead: [69, 0, 72, 0, 76, 0, 74, 72, 71, 0, 72, 0, 74, 0, 0, 0, 67, 0, 71, 0, 74, 0, 72, 71, 69, 0, 0, 0, 72, 0, 69, 0],
    bass: [45, 0, 0, 0, 52, 0, 0, 0, 43, 0, 0, 0, 50, 0, 0, 0, 41, 0, 0, 0, 48, 0, 0, 0, 40, 0, 0, 0, 44, 0, 0, 0],
  },
  castle: {
    step: 130,
    lead: [69, 72, 0, 69, 75, 0, 74, 72, 69, 0, 67, 0, 68, 0, 69, 0, 69, 72, 0, 69, 76, 0, 75, 74, 72, 0, 71, 0, 69, 0, 0, 0],
    bass: [45, 0, 45, 0, 45, 0, 45, 0, 44, 0, 44, 0, 44, 0, 44, 0, 41, 0, 41, 0, 41, 0, 41, 0, 40, 0, 40, 0, 44, 0, 40, 0],
  },
  shop: {
    step: 170,
    lead: [76, 0, 79, 0, 84, 0, 79, 0, 81, 0, 77, 0, 79, 0, 0, 0],
    bass: [48, 0, 55, 0, 52, 0, 55, 0, 53, 0, 57, 0, 55, 0, 43, 0],
  },
};

export const sfx = {
  unlock: () => void ac(),
  isMuted: () => muted,
  setMuted: (m: boolean) => {
    muted = m;
  },
  jump: () => tone(280, 0.16, "square", 0.05, 760),
  swim: () => tone(500, 0.08, "triangle", 0.08, 260),
  punch: () => noise(0.06, 0.06),
  brk: () => {
    noise(0.18, 0.12);
    tone(120, 0.12, "square", 0.05, 60);
  },
  coin: () => {
    tone(988, 0.06, "square", 0.05);
    tone(1319, 0.14, "square", 0.05, undefined, 0.06);
  },
  power: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.1, "square", 0.05, undefined, i * 0.07)),
  kill: () => tone(600, 0.15, "square", 0.06, 120),
  bad: () => tone(200, 0.4, "sawtooth", 0.05, 70),
  die: () => [494, 466, 440, 415, 392, 330].forEach((f, i) => tone(f, 0.14, "square", 0.06, undefined, i * 0.13)),
  clear: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.16, "square", 0.06, undefined, i * 0.12)),
  hit: () => {
    noise(0.1, 0.1);
    tone(90, 0.15, "square", 0.07, 50);
  },
  select: () => tone(880, 0.05, "square", 0.04),
  music(name: keyof typeof SONGS | null) {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
    if (!name) return;
    const song = SONGS[name];
    let i = 0;
    musicTimer = setInterval(() => {
      const l = song.lead[i % song.lead.length];
      const b = song.bass[i % song.bass.length];
      if (l) tone(midi(l), (song.step / 1000) * 0.9, "square", 0.025);
      if (b) tone(midi(b), (song.step / 1000) * 1.6, "triangle", 0.06);
      i++;
    }, song.step);
  },
};
