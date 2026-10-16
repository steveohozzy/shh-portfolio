
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Droplets,
  Home,
  RotateCcw,
  Star,
} from "lucide-react";
import "./squishy-dumpling-adventure.css";

type Platform = {
  x: number;
  y: number;
  width: number;
  moving?: boolean;
  range?: number;
  speed?: number;
};

type Hazard = {
  x: number;
  y: number;
  width: number;
};

type GooDrop = {
  x: number;
  y: number;
};

type GameLevel = {
  name: string;
  subtitle: string;
  sky: string;
  horizon: string;
  platform: string;
  edge: string;
  width: number;
  platforms: Platform[];
  hazards: Hazard[];
  drops: GooDrop[];
  stars: GooDrop[];
};

type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  facing: number;
  squash: number;
};

const LEVELS: GameLevel[] = [
  {
    name: "Mochi Meadows",
    subtitle: "A little bounce goes a long way",
    sky: "#bde9f6",
    horizon: "#fff0dc",
    platform: "#b8e8bc",
    edge: "#71bd88",
    width: 2100,
    platforms: [
      { x: 0, y: 350, width: 300 },
      { x: 350, y: 305, width: 150 },
      { x: 545, y: 260, width: 145 },
      { x: 740, y: 310, width: 155 },
      { x: 950, y: 255, width: 145 },
      {
        x: 1150,
        y: 300,
        width: 155,
        moving: true,
        range: 45,
        speed: 0.0015,
      },
      { x: 1370, y: 245, width: 145 },
      { x: 1570, y: 295, width: 155 },
      { x: 1780, y: 340, width: 320 },
    ],
    hazards: [
      { x: 820, y: 285, width: 42 },
      { x: 1610, y: 270, width: 42 },
    ],
    drops: [
      { x: 405, y: 265 },
      { x: 600, y: 220 },
      { x: 1000, y: 215 },
      { x: 1205, y: 250 },
      { x: 1430, y: 205 },
      { x: 1830, y: 295 },
    ],
    stars: [
      { x: 475, y: 260 },
      { x: 875, y: 265 },
      { x: 1510, y: 200 },
      { x: 1900, y: 290 },
    ],
  },
  {
    name: "Bamboo Bounce",
    subtitle: "Watch your step around the sharp bits",
    sky: "#b6e9db",
    horizon: "#e7f7d7",
    platform: "#9dd8aa",
    edge: "#4ba67b",
    width: 2450,
    platforms: [
      { x: 0, y: 350, width: 240 },
      { x: 300, y: 305, width: 125 },
      { x: 480, y: 250, width: 120 },
      { x: 665, y: 300, width: 120 },
      { x: 850, y: 220, width: 120 },
      {
        x: 1035,
        y: 275,
        width: 125,
        moving: true,
        range: 55,
        speed: 0.0018,
      },
      { x: 1240, y: 210, width: 120 },
      { x: 1430, y: 275, width: 125 },
      {
        x: 1620,
        y: 205,
        width: 120,
        moving: true,
        range: 50,
        speed: 0.0015,
      },
      { x: 1815, y: 275, width: 125 },
      { x: 2010, y: 320, width: 120 },
      { x: 2210, y: 345, width: 240 },
    ],
    hazards: [
      { x: 540, y: 225, width: 38 },
      { x: 910, y: 195, width: 42 },
      { x: 1320, y: 230, width: 42 },
      { x: 1870, y: 250, width: 42 },
    ],
    drops: [
      { x: 340, y: 265 },
      { x: 520, y: 210 },
      { x: 700, y: 260 },
      { x: 895, y: 180 },
      { x: 1090, y: 230 },
      { x: 1280, y: 170 },
      { x: 1480, y: 230 },
      { x: 1670, y: 165 },
      { x: 1855, y: 230 },
      { x: 2260, y: 295 },
    ],
    stars: [
      { x: 590, y: 205 },
      { x: 960, y: 175 },
      { x: 1370, y: 165 },
      { x: 1730, y: 160 },
      { x: 2065, y: 275 },
    ],
  },
  {
    name: "The Goo Garden",
    subtitle: "One last squishy adventure!",
    sky: "#e4d5ff",
    horizon: "#fff0f5",
    platform: "#f7c8e2",
    edge: "#d88ebc",
    width: 2700,
    platforms: [
      { x: 0, y: 350, width: 220 },
      { x: 280, y: 300, width: 110 },
      { x: 450, y: 240, width: 105 },
      { x: 620, y: 290, width: 110 },
      {
        x: 795,
        y: 215,
        width: 105,
        moving: true,
        range: 40,
        speed: 0.002,
      },
      { x: 970, y: 270, width: 105 },
      { x: 1140, y: 200, width: 110 },
      {
        x: 1320,
        y: 255,
        width: 105,
        moving: true,
        range: 50,
        speed: 0.0018,
      },
      { x: 1500, y: 190, width: 105 },
      { x: 1670, y: 255, width: 105 },
      {
        x: 1840,
        y: 195,
        width: 105,
        moving: true,
        range: 45,
        speed: 0.0017,
      },
      { x: 2020, y: 260, width: 110 },
      { x: 2200, y: 305, width: 115 },
      { x: 2400, y: 345, width: 300 },
    ],
    hazards: [
      { x: 490, y: 215, width: 38 },
      { x: 845, y: 190, width: 42 },
      { x: 1190, y: 175, width: 42 },
      { x: 1550, y: 165, width: 42 },
      { x: 1900, y: 170, width: 42 },
      { x: 2240, y: 280, width: 42 },
    ],
    drops: [
      { x: 325, y: 260 },
      { x: 490, y: 200 },
      { x: 665, y: 250 },
      { x: 835, y: 175 },
      { x: 1010, y: 230 },
      { x: 1180, y: 160 },
      { x: 1360, y: 215 },
      { x: 1540, y: 150 },
      { x: 1710, y: 215 },
      { x: 1885, y: 155 },
      { x: 2060, y: 220 },
      { x: 2445, y: 295 },
    ],
    stars: [
      { x: 540, y: 190 },
      { x: 885, y: 160 },
      { x: 1230, y: 145 },
      { x: 1590, y: 135 },
      { x: 1930, y: 140 },
      { x: 2250, y: 260 },
    ],
  },
];


const BONUS_LEVEL_CONFIGS = [
  {
    name: "Strawberry Springs",
    subtitle: "Bounce through the strawberry fields",
    sky: "#ffdce8",
    horizon: "#fff0e7",
    platform: "#f5b8ca",
    edge: "#d982a2",
    width: 2050,
    steps: [
      [270, 305, 120],
      [440, 255, 115],
      [610, 290, 125],
      [790, 225, 115],
      [965, 275, 125],
      [1145, 215, 115],
      [1320, 270, 125],
      [1500, 220, 115],
      [1680, 290, 125],
    ],
    hazards: [2, 5, 8],
    moving: [4],
  },
  {
    name: "Cloud Nine",
    subtitle: "A fluffy adventure above the clouds",
    sky: "#cce6ff",
    horizon: "#f4f0ff",
    platform: "#d9d4ff",
    edge: "#a49be4",
    width: 2200,
    steps: [
      [260, 310, 125],
      [440, 260, 115],
      [610, 210, 115],
      [785, 265, 125],
      [965, 205, 115],
      [1140, 250, 120],
      [1320, 190, 115],
      [1500, 245, 125],
      [1685, 285, 120],
      [1850, 310, 120],
    ],
    hazards: [3, 6, 8],
    moving: [2, 6],
  },
  {
    name: "Honeycomb Hills",
    subtitle: "Mind the gaps and grab the goo",
    sky: "#ffe8ad",
    horizon: "#fff5d9",
    platform: "#f4ce72",
    edge: "#c79b3c",
    width: 2250,
    steps: [
      [270, 310, 125],
      [445, 270, 115],
      [620, 310, 120],
      [795, 245, 115],
      [970, 200, 115],
      [1145, 255, 125],
      [1330, 300, 120],
      [1510, 240, 115],
      [1690, 200, 120],
      [1870, 280, 120],
    ],
    hazards: [2, 5, 8],
    moving: [4, 7],
  },
  {
    name: "Minty Mountains",
    subtitle: "Keep bouncing towards the summit",
    sky: "#c8f3e4",
    horizon: "#f0ffed",
    platform: "#8ed9bd",
    edge: "#4ca98a",
    width: 2300,
    steps: [
      [265, 310, 120],
      [435, 270, 115],
      [605, 220, 115],
      [780, 265, 120],
      [955, 210, 115],
      [1130, 165, 115],
      [1305, 220, 120],
      [1480, 270, 115],
      [1655, 220, 120],
      [1835, 285, 120],
    ],
    hazards: [2, 5, 8],
    moving: [3, 6],
  },
  {
    name: "Peachy Paradise",
    subtitle: "A sweet little sunset journey",
    sky: "#ffcdbd",
    horizon: "#fff0df",
    platform: "#f6b69d",
    edge: "#d98970",
    width: 2250,
    steps: [
      [265, 305, 125],
      [445, 245, 115],
      [615, 285, 120],
      [790, 225, 115],
      [965, 275, 125],
      [1145, 215, 115],
      [1320, 260, 120],
      [1500, 205, 115],
      [1680, 255, 125],
      [1860, 305, 120],
    ],
    hazards: [2, 4, 7],
    moving: [5, 8],
  },
  {
    name: "Moon Mochi",
    subtitle: "A little moonlight, a lot of jumping",
    sky: "#222b58",
    horizon: "#65669c",
    platform: "#b9b7ed",
    edge: "#8584c8",
    width: 2350,
    steps: [
      [265, 310, 120],
      [435, 255, 115],
      [605, 200, 115],
      [780, 250, 120],
      [955, 190, 115],
      [1130, 235, 120],
      [1310, 175, 115],
      [1485, 230, 120],
      [1660, 185, 115],
      [1840, 270, 120],
      [2020, 305, 120],
    ],
    hazards: [3, 6, 9],
    moving: [2, 7],
  },
  {
    name: "The Great Dumpling Feast",
    subtitle: "Your final and squishiest challenge!",
    sky: "#f5d5ff",
    horizon: "#ffe4f1",
    platform: "#edb9e0",
    edge: "#c57db6",
    width: 2450,
    steps: [
      [260, 310, 120],
      [430, 255, 110],
      [595, 205, 110],
      [760, 260, 115],
      [930, 195, 110],
      [1100, 245, 115],
      [1270, 185, 110],
      [1440, 235, 115],
      [1610, 175, 110],
      [1780, 230, 115],
      [1950, 280, 120],
      [2120, 310, 120],
    ],
    hazards: [2, 5, 8, 10],
    moving: [3, 6, 9],
  },
] as const;


function createBonusLevel(
  config: (typeof BONUS_LEVEL_CONFIGS)[number],
  levelNumber: number,
): GameLevel {
  const steps: [number, number, number][] = config.steps.map(
    ([x, y, width]) => [x, y, width],
  );

  // Later levels get more platforms.
  const extraStepCount = levelNumber - 1;

  for (let i = 0; i < extraStepCount; i++) {
    const previous = steps[steps.length - 1];

    const heights = [255, 210, 270, 230, 190];

    steps.push([
      previous[0] + 165,
      heights[(i + levelNumber) % heights.length],
      Math.max(85, previous[2] - 5),
    ]);
  }

  const movingIndexes: number[] = [...config.moving];
  const hazardIndexes: number[] = [...config.hazards];

  // Add more moving platforms and hazards as levels progress.
  for (let i = 0; i < extraStepCount; i++) {
    const stepIndex = config.steps.length + i;
    const difficultyIndex = i + levelNumber;

    if (difficultyIndex % 3 === 0) {
      hazardIndexes.push(stepIndex);
    } else if (difficultyIndex % 2 === 0) {
      movingIndexes.push(stepIndex);
    }
  }

  // Extend the level to fit all the additional platforms.
  const lastStep = steps[steps.length - 1];

  const width = Math.max(
    config.width,
    lastStep[0] + lastStep[2] + 480,
  );

  const platforms: Platform[] = [
    { x: 0, y: 350, width: 220 },
    ...steps.map(([x, y, platformWidth], index) => ({
      x,
      y,
      width: platformWidth,
      ...(movingIndexes.includes(index)
        ? {
            moving: true,
            range:
              30 +
              ((index + levelNumber) % 3) * 10 +
              Math.max(0, levelNumber - 4) * 4,
            speed:
              0.0014 +
              (index % 3) * 0.0002 +
              Math.max(0, levelNumber - 4) * 0.00008,
          }
        : {}),
    })),
    { x: width - 300, y: 345, width: 300 },
  ];

  const hazards: Hazard[] = hazardIndexes.map(
    (platformIndex, index) => {
      const platform = platforms[platformIndex + 1];

      return {
        x: platform.x + platform.width * 0.45,
        y: platform.y - 25,
        width: 38 + (index % 2) * 4,
      };
    },
  );

  // Every extra platform also provides a goo drop.
  const drops: GooDrop[] = platforms.slice(1, -1).map((platform) => ({
    x: platform.x + platform.width / 2,
    y: platform.y - 38,
  }));

  // Stars appear on alternate platforms.
  const stars: GooDrop[] = platforms
    .slice(1, -1)
    .filter((platform, index) => index % 2 === 1)
    .map((platform) => ({
      x: platform.x + platform.width / 2,
      y: platform.y - 53,
    }));

  return {
    name: config.name,
    subtitle: config.subtitle,
    sky: config.sky,
    horizon: config.horizon,
    platform: config.platform,
    edge: config.edge,
    width,
    platforms,
    hazards,
    drops,
    stars,
  };
}

LEVELS.push(
  ...BONUS_LEVEL_CONFIGS.map((config, index) =>
    createBonusLevel(config, index + 4),
  ),
);


const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 58;
const START_GOO = 100;

function makePlayer(): Player {
  return {
    x: 55,
    y: 260,
    vx: 0,
    vy: 0,
    grounded: false,
    facing: 1,
    squash: 1,
  };
}

function platformX(platform: Platform, time: number) {
  if (!platform.moving) return platform.x;

  return (
    platform.x +
    Math.sin(time * (platform.speed || 0.0015)) *
      (platform.range || 40)
  );
}

function Dumpling({
  className = "",
  leaking = false,
}: {
  className?: string;
  leaking?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 112"
      className={className}
      role="img"
      aria-label="Cute squishy dumpling"
    >
      <defs>
        <linearGradient id="sda-dumpling-body" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#fff9e9" />
          <stop offset="65%" stopColor="#fff0d8" />
          <stop offset="100%" stopColor="#f2d6b9" />
        </linearGradient>
        <linearGradient id="sda-dumpling-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eac39c" />
          <stop offset="100%" stopColor="#c58e69" />
        </linearGradient>
      </defs>

      <ellipse
        cx="60"
        cy="103"
        rx="35"
        ry="5"
        fill="#4b8d7c"
        opacity=".13"
      />

      <path
        d="M17 67 C11 54 20 42 32 33 C35 20 45 13 54 19 C61 11 72 15 79 24 C92 28 103 43 101 56 C108 72 93 91 77 96 C61 103 41 98 29 89 C21 83 17 76 17 67Z"
        fill="url(#sda-dumpling-base)"
        stroke="#bd8d6b"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      <path
        d="M18 65 C13 53 23 40 34 32 C38 20 47 15 55 21 C63 13 72 18 79 26 C92 30 101 43 99 56 C104 69 92 85 77 90 C62 97 43 93 31 84 C23 78 19 72 18 65Z"
        fill="url(#sda-dumpling-body)"
        stroke="#f3dfc6"
        strokeWidth="1.5"
      />

      <path
        d="M30 39 C34 32 39 27 45 27"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        opacity=".9"
      />

      <path
        d="M39 30 C43 23 49 22 54 27"
        fill="none"
        stroke="#f3d8b9"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M57 25 C62 20 68 23 71 29"
        fill="none"
        stroke="#f3d8b9"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M76 31 C82 29 87 35 88 41"
        fill="none"
        stroke="#f3d8b9"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M25 54 C23 63 27 71 34 76"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity=".7"
      />

      <ellipse cx="43" cy="54" rx="4" ry="5.5" fill="#49352f" />
      <ellipse cx="75" cy="54" rx="4" ry="5.5" fill="#49352f" />
      <circle cx="44.5" cy="52" r="1.5" fill="#ffffff" />
      <circle cx="76.5" cy="52" r="1.5" fill="#ffffff" />

      <ellipse
        cx="31"
        cy="64"
        rx="7.5"
        ry="4.5"
        fill="#f4a4ad"
        opacity=".72"
      />
      <ellipse
        cx="87"
        cy="64"
        rx="7.5"
        ry="4.5"
        fill="#f4a4ad"
        opacity=".72"
      />

      <path
        d="M53 64 Q59 71 65 64"
        fill="none"
        stroke="#9b625c"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      <path
        d="M29 80 Q60 97 89 79"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".55"
      />

      {leaking && (
        <>
          <path
            d="M83 74 Q93 78 86 87 Q81 92 85 99"
            fill="none"
            stroke="#55cdb0"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="87" cy="94" r="4" fill="#55cdb0" />
        </>
      )}
    </svg>
  );
}

export default function SquishyDumplingAdventurePage() {
  const [mode, setMode] = useState<
    "intro" | "playing" | "levelComplete" | "gameOver" | "complete"
  >("intro");
  const [levelIndex, setLevelIndex] = useState(0);
  const [player, setPlayer] = useState<Player>(makePlayer);
  const [goo, setGoo] = useState(START_GOO);
  const [collectedDrops, setCollectedDrops] = useState<number[]>([]);
  const [collectedStars, setCollectedStars] = useState<number[]>([]);
  const [totalStars, setTotalStars] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(900);
  const [leaking, setLeaking] = useState(false);
  const [starFlash, setStarFlash] = useState(false);

  const keys = useRef<Record<string, boolean>>({});
  const playerRef = useRef<Player>(makePlayer());
  const gooRef = useRef(START_GOO);
  const dropsRef = useRef<number[]>([]);
  const starsRef = useRef<number[]>([]);
  const touchRef = useRef({ left: false, right: false });
  const jumpRef = useRef(false);
  const hazardCooldown = useRef(0);
  const lastTime = useRef(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  const level = LEVELS[levelIndex];

  const resetPlayer = useCallback(() => {
    playerRef.current = makePlayer();
    setPlayer({ ...playerRef.current });
    touchRef.current = { left: false, right: false };
    jumpRef.current = false;
    keys.current = {};
  }, []);

  const startLevel = useCallback((index: number) => {
    setLevelIndex(index);
    playerRef.current = makePlayer();
    setPlayer({ ...playerRef.current });
    gooRef.current = START_GOO;
    setGoo(START_GOO);
    dropsRef.current = [];
    starsRef.current = [];
    setCollectedDrops([]);
    setCollectedStars([]);
    setAttempt(1);
    hazardCooldown.current = 0;
    lastTime.current = 0;
    touchRef.current = { left: false, right: false };
    jumpRef.current = false;
    keys.current = {};
    setLeaking(false);
    setStarFlash(false);
    setMode("playing");
  }, []);

  const restartLevel = useCallback(() => {
    resetPlayer();
    gooRef.current = START_GOO;
    setGoo(START_GOO);
    dropsRef.current = [];
    starsRef.current = [];
    setCollectedDrops([]);
    setCollectedStars([]);
    setAttempt((value) => value + 1);
    hazardCooldown.current = 0;
    lastTime.current = 0;
    setLeaking(false);
    setStarFlash(false);
    setMode("playing");
  }, [resetPlayer]);

  useEffect(() => {
    function keyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();

      if (
        ["arrowleft", "arrowright", "arrowup", " ", "a", "d", "w"].includes(
          key,
        )
      ) {
        event.preventDefault();
      }

      keys.current[key] = true;

      if ([" ", "arrowup", "w"].includes(key)) {
        jumpRef.current = true;
      }
    }

    function keyUp(event: KeyboardEvent) {
      keys.current[event.key.toLowerCase()] = false;
    }

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const resize = () => setViewportWidth(viewport.clientWidth || 900);
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, [mode]);

  useEffect(() => {
    if (mode !== "playing") return;

    let frame = 0;

    function tick(time: number) {
      const p = playerRef.current;
      const delta = lastTime.current
        ? Math.min(time - lastTime.current, 32)
        : 16;
      lastTime.current = time;

      const step = delta / 16.67;
      const currentLevel = LEVELS[levelIndex];

      const left =
        keys.current.arrowleft ||
        keys.current.a ||
        touchRef.current.left;
      const right =
        keys.current.arrowright ||
        keys.current.d ||
        touchRef.current.right;

      const targetVx = left === right ? 0 : left ? -4.1 : 4.1;

      // Gentle acceleration keeps movement from feeling slippery.
      p.vx +=
        (targetVx - p.vx) * (left === right ? 0.24 : 0.2) * step;

      if (Math.abs(p.vx) < 0.08) p.vx = 0;

      if (left && !right) p.facing = -1;
      if (right && !left) p.facing = 1;

      const wasGrounded = p.grounded;

      if (jumpRef.current && p.grounded) {
        p.vy = -12.5;
        p.grounded = false;
        p.squash = 1.16;
      }

      jumpRef.current = false;

      const previousX = p.x;
      const previousY = p.y;
      const previousVy = p.vy;

      p.x = Math.max(
        0,
        Math.min(
          currentLevel.width - PLAYER_WIDTH,
          p.x + p.vx * step,
        ),
      );

      p.vy = Math.min(11, p.vy + 0.43 * step);
      p.y += p.vy * step;
      p.grounded = false;

      currentLevel.platforms.forEach((platform) => {
        const x = platformX(platform, time);
        const previousBottom = previousY + PLAYER_HEIGHT;
        const currentBottom = p.y + PLAYER_HEIGHT;

        if (
          p.vy >= 0 &&
          p.x + PLAYER_WIDTH - 8 > x &&
          p.x + 8 < x + platform.width &&
          previousBottom <= platform.y + 4 &&
          currentBottom >= platform.y
        ) {
          p.y = platform.y - PLAYER_HEIGHT;
          p.vy = 0;
          p.grounded = true;

          if (!wasGrounded && previousVy > 2) {
            p.squash = Math.max(0.68, 0.88 - previousVy * 0.012);
          }
        }
      });

      if (!p.grounded) {
        const targetSquash = p.vy < -2 ? 1.12 : p.vy > 3 ? 0.94 : 1;
        p.squash += (targetSquash - p.squash) * 0.12 * step;
      } else if (Math.abs(p.vx) > 0.3) {
        // Repeatedly squish the dumpling while it waddles along.
        p.squash += (1.025 - p.squash) * 0.18 * step;
      } else {
        p.squash += (1 - p.squash) * 0.18 * step;
      }

      const hitHazard = currentLevel.hazards.some(
        (hazard) =>
          p.x + PLAYER_WIDTH - 8 > hazard.x &&
          p.x + 8 < hazard.x + hazard.width &&
          p.y + PLAYER_HEIGHT - 10 > hazard.y &&
          p.y + 10 < hazard.y + 30,
      );

      if ((hitHazard || p.y > 470) && time > hazardCooldown.current) {
        hazardCooldown.current = time + 900;
        gooRef.current = Math.max(
          0,
          gooRef.current - (hitHazard ? 25 : 20),
        );
        setGoo(gooRef.current);
        setLeaking(true);
        window.setTimeout(() => setLeaking(false), 550);

        p.x = 55;
        p.y = currentLevel.platforms[0].y - PLAYER_HEIGHT;
        p.vx = 0;
        p.vy = 0;
        p.grounded = true;
        p.facing = 1;
        p.squash = 1;

        touchRef.current = { left: false, right: false };
        jumpRef.current = false;
        keys.current = {};

        setAttempt((value) => value + 1);

        if (gooRef.current <= 0) {
          setPlayer({ ...p });
          setMode("gameOver");
          return;
        }
      }

      const newDrops: number[] = [];

      currentLevel.drops.forEach((drop, index) => {
        if (
          !dropsRef.current.includes(index) &&
          Math.abs(p.x + PLAYER_WIDTH / 2 - drop.x) < 32 &&
          Math.abs(p.y + PLAYER_HEIGHT / 2 - drop.y) < 35
        ) {
          newDrops.push(index);
        }
      });

      if (newDrops.length) {
        dropsRef.current = dropsRef.current.concat(newDrops);
        setCollectedDrops(dropsRef.current.slice());
        gooRef.current = Math.min(
          START_GOO,
          gooRef.current + newDrops.length * 18,
        );
        setGoo(gooRef.current);
      }

      const newStars: number[] = [];

      currentLevel.stars.forEach((star, index) => {
        if (
          !starsRef.current.includes(index) &&
          Math.abs(p.x + PLAYER_WIDTH / 2 - star.x) < 38 &&
          Math.abs(p.y + PLAYER_HEIGHT / 2 - star.y) < 40
        ) {
          newStars.push(index);
        }
      });

      if (newStars.length) {
        starsRef.current = starsRef.current.concat(newStars);
        setCollectedStars(starsRef.current.slice());
        setTotalStars((value) => value + newStars.length);
        setStarFlash(true);
        window.setTimeout(() => setStarFlash(false), 350);
      }

      const finishPlatform =
        currentLevel.platforms[currentLevel.platforms.length - 1];

      if (
        p.x + PLAYER_WIDTH > currentLevel.width - 135 &&
        p.grounded &&
        p.y + PLAYER_HEIGHT >= finishPlatform.y - 4
      ) {
        setPlayer({ ...p });
        setMode(
          levelIndex === LEVELS.length - 1 ? "complete" : "levelComplete",
        );
        return;
      }

      setPlayer({ ...p });
      frame = window.requestAnimationFrame(tick);
    }

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [mode, levelIndex]);

  const camera = Math.max(
    0,
    Math.min(
      level.width - viewportWidth,
      player.x - viewportWidth * 0.25,
    ),
  );

  const bindDirection = (
    direction: "left" | "right",
    pressed: boolean,
  ) => {
    touchRef.current[direction] = pressed;
  };

  return (
    <main className="sda-page">
      <div className="sda-shell">
        <header className="sda-header">
          <div className="sda-eyebrow">
            ✦ A squishy little platform adventure ✦
          </div>
          <h1>Squishy Dumpling Adventure</h1>
          <p>Keep your goo, dodge the spikes and bounce your way home.</p>
        </header>

        {mode === "intro" && (
          <section className="sda-intro">
            <div className="sda-intro-art">
              <div className="sda-art-cloud sda-art-cloud-one" />
              <div className="sda-art-cloud sda-art-cloud-two" />
              <Dumpling className="sda-intro-dumpling" />
              <span className="sda-art-drop sda-drop-one">●</span>
              <span className="sda-art-drop sda-drop-two">●</span>
              <span className="sda-art-star">✦</span>
            </div>

            <div className="sda-intro-copy">
              <span className="sda-pill">READY, STEADY, SQUISH!</span>
              <h2>
                Small dumpling.
                <br />
                Big bouncy adventure.
              </h2>
              <p>
                Hop across soft platforms, collect goo drops and keep your
                squishy self away from the sharp stuff.
              </p>
              <div className="sda-how-to">
                <span>← → Move</span>
                <span>Space Jump</span>
                <span>💧 Goo refills</span>
              </div>
              <button
                className="sda-primary-button"
                onClick={() => {
                  setTotalStars(0);
                  startLevel(0);
                }}
              >
                Let&apos;s bounce! <span>→</span>
              </button>
            </div>
          </section>
        )}

        {(mode === "playing" ||
          mode === "levelComplete" ||
          mode === "gameOver" ||
          mode === "complete") && (
          <section className="sda-game-card">
            <div className="sda-toolbar">
              <div className="sda-level-title">
                <div className="sda-mini-dumpling">
                  <Dumpling />
                </div>
                <div>
                  <span>
                    LEVEL {levelIndex + 1} OF {LEVELS.length}
                  </span>
                  <h2>{level.name}</h2>
                </div>
              </div>

              <div className="sda-status">
                <div className="sda-goo-status">
                  <Droplets size={17} />
                  <div className="sda-goo-track">
                    <div
                      className={`sda-goo-fill ${goo <= 30 ? "is-low" : ""}`}
                      style={{ width: `${goo}%` }}
                    />
                  </div>
                  <strong>{goo}%</strong>
                </div>

                <div
                  className={`sda-star-count ${starFlash ? "is-picking-up" : ""}`}
                  aria-live="polite"
                >
                  <Star size={16} fill="currentColor" />
                  {collectedStars.length}/{level.stars.length}
                </div>

                <button
                  className="sda-icon-button"
                  onClick={() => setMode("intro")}
                  aria-label="Home"
                >
                  <Home size={18} />
                </button>

                <button
                  className="sda-icon-button"
                  onClick={restartLevel}
                  aria-label="Restart level"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            <div
              ref={viewportRef}
              className={`sda-playfield ${leaking ? "is-leaking" : ""}`}
              style={{
                background: `linear-gradient(180deg, ${level.sky}, ${level.horizon})`,
              }}
            >
              <div className="sda-sky-decor" />

              <div
                className="sda-world"
                style={{
                  width: level.width,
                  transform: `translateX(-${camera}px)`,
                }}
              >
                {Array.from({ length: 16 }, (_, index) => (
                  <div
                    key={index}
                    className="sda-cloud"
                    style={{
                      left: index * 175 + 30,
                      top: 35 + (index * 37) % 120,
                    }}
                  />
                ))}

                {level.platforms.map((platform, index) => (
                  <div
                    key={index}
                    className={`sda-platform ${platform.moving ? "is-moving" : ""}`}
                    style={{
                      left: platformX(platform, lastTime.current || 0),
                      top: platform.y,
                      width: platform.width,
                      background: level.platform,
                      borderColor: level.edge,
                    }}
                  >
                    <span />
                  </div>
                ))}

                {level.hazards.map((hazard, index) => (
                  <div
                    key={index}
                    className="sda-spikes"
                    style={{
                      left: hazard.x,
                      top: hazard.y,
                      width: hazard.width,
                    }}
                    aria-label="Spikes"
                  >
                    {Array.from(
                      {
                        length: Math.max(
                          2,
                          Math.floor(hazard.width / 14),
                        ),
                      },
                      (_, spikeIndex) => (
                        <span key={spikeIndex} />
                      ),
                    )}
                  </div>
                ))}

                {level.drops.map((drop, index) => (
                  <div
                    key={index}
                    className={`sda-goo-drop ${collectedDrops.includes(index) ? "is-collected" : ""}`}
                    style={{ left: drop.x, top: drop.y }}
                  >
                    ●
                  </div>
                ))}

                {level.stars.map((star, index) => (
                  <div
                    key={index}
                    className={`sda-star ${collectedStars.includes(index) ? "is-collected" : ""}`}
                    style={{ left: star.x, top: star.y }}
                  >
                    ★
                  </div>
                ))}

                <div
                  className="sda-exit"
                  style={{ left: level.width - 125, top: 265 }}
                  aria-label="Finish level: bamboo steamer basket"
                >
                  <div className="sda-steamer-lid">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="sda-steamer-basket">
                    <div className="sda-steamer-dumpling">●</div>
                    <div className="sda-steamer-dumpling">●</div>
                    <div className="sda-steamer-dumpling">●</div>
                    <div className="sda-steamer-weave" />
                  </div>
                  <div className="sda-steamer-rim" />
                  <span className="sda-steamer-sparkle">✦</span>
                </div>

                <div
                  className={`sda-player ${
                    player.grounded ? "is-grounded" : "is-airborne"
                  } ${
                    player.grounded && Math.abs(player.vx) > 0.3
                      ? "is-walking"
                      : ""
                  } ${leaking ? "is-leaking" : ""}`}
                  style={{
                    left: player.x,
                    top: player.y,
                    transform: `scaleX(${player.facing * (2 - player.squash)}) scaleY(${player.squash})`,
                  }}
                >
                  <Dumpling className="sda-character-svg" leaking={leaking} />
                  {leaking && <span className="sda-leak-drop">●</span>}
                </div>
              </div>

              <div className="sda-level-subtitle">{level.subtitle}</div>
              <div className="sda-attempt">Attempt {attempt}</div>

              {(mode === "levelComplete" ||
                mode === "gameOver" ||
                mode === "complete") && (
                <div className="sda-overlay">
                  <div className="sda-result">
                    <div className="sda-result-icon">
                      {mode === "gameOver"
                        ? "💧"
                        : mode === "complete"
                          ? "🏆"
                          : "✨"}
                    </div>

                    <h2>
                      {mode === "gameOver"
                        ? "Oh no, all out of goo!"
                        : mode === "complete"
                          ? "You absolute squish-star!"
                          : "Level complete!"}
                    </h2>

                    <p>
                      {mode === "gameOver"
                        ? "Your dumpling sprang a few too many leaks. Refill and try again!"
                        : mode === "complete"
                          ? `You finished all three levels and collected ${totalStars} stars. What a bouncy legend!`
                          : `Lovely bouncing! You collected ${collectedStars.length} of ${level.stars.length} stars.`}
                    </p>

                    {mode === "levelComplete" ? (
                      <button
                        className="sda-primary-button"
                        onClick={() => startLevel(levelIndex + 1)}
                      >
                        Next level <span>→</span>
                      </button>
                    ) : (
                      <button
                        className="sda-primary-button"
                        onClick={() => {
                          if (mode === "complete") {
                            setTotalStars(0);
                            startLevel(0);
                          } else {
                            restartLevel();
                          }
                        }}
                      >
                        {mode === "complete" ? "Play again" : "Try again"}{" "}
                        <span>↻</span>
                      </button>
                    )}

                    <button
                      className="sda-secondary-button"
                      onClick={() => setMode("intro")}
                    >
                      Back to start
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="sda-controls-row">
              <p>
                Avoid the pink spikes. Goo drops restore <strong>18%</strong>{" "}
                goo. Collect stars on the way to the steamer basket!
              </p>

              <div className="sda-touch-controls">
                <div className="sda-movement-controls">
                  <button
                    type="button"
                    aria-label="Move left"
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.currentTarget.setPointerCapture(event.pointerId);
                      bindDirection("left", true);
                    }}
                    onPointerUp={() => bindDirection("left", false)}
                    onPointerCancel={() => bindDirection("left", false)}
                    onLostPointerCapture={() => bindDirection("left", false)}
                  >
                    <ArrowLeft size={30} strokeWidth={2.5} />
                  </button>

                  <button
                    type="button"
                    aria-label="Move right"
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.currentTarget.setPointerCapture(event.pointerId);
                      bindDirection("right", true);
                    }}
                    onPointerUp={() => bindDirection("right", false)}
                    onPointerCancel={() => bindDirection("right", false)}
                    onLostPointerCapture={() => bindDirection("right", false)}
                  >
                    <ArrowRight size={30} strokeWidth={2.5} />
                  </button>
                </div>

                <button
                  type="button"
                  className="sda-jump-button"
                  aria-label="Jump"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    jumpRef.current = true;
                  }}
                >
                  <span>JUMP</span>
                  <span className="sda-jump-arrow">↑</span>
                </button>
              </div>
            </div>
          </section>
        )}

        <footer className="sda-footer">
          Made for maximum squish and minimum leaks <span>♥</span>
        </footer>
      </div>
    </main>
  );
}
