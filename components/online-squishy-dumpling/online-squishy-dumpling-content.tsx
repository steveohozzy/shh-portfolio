"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./online-squishy-dumpling.css";

type DumplingType = {
  id: string;
  name: string;
  colour: string;
  light: string;
  dark: string;
  accent: string;
  cheek: string;
  sound: number;
  glitter?: string;
};

type PlayMode = "squish" | "throw";

type PointerTrack = {
  x: number;
  y: number;
  startX: number;
  startY: number;
  grabX: number;
  grabY: number;
  slot: 1 | 2;
};

type DumplingPhysics = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationVelocity: number;
  scaleX: number;
  scaleY: number;
  dragging: boolean;
  held: boolean;
  dragOffsetX: number;
  dragOffsetY: number;
  lastPointerX: number;
  lastPointerY: number;
  lastPointerTime: number;
  stretch: number;
  wobble: number;
  grabX: number;
  grabY: number;
  pullX: number;
  pullY: number;
  grabX2: number;
  grabY2: number;
  pullX2: number;
  pullY2: number;
  multiTouch: boolean;
  squeeze: number;
  squeezeX: number;
  squeezeY: number;
  pinchStartDistance: number;
  pinchActive: boolean;
  compression: number;
  pointerStartX: number;
  pointerStartY: number;
  releaseWobble: number;
  impactSquash: number;
};

const DUMPLINGS: DumplingType[] = [
  {
    id: "classic",
    name: "Classic Bao",
    colour: "#f7d9a9",
    light: "#fff2d8",
    dark: "#dba76c",
    accent: "#b9824c",
    cheek: "#ef9b98",
    sound: 280,
  },
  {
    id: "strawberry",
    name: "Strawberry",
    colour: "#f5a9bd",
    light: "#ffe0e9",
    dark: "#df7697",
    accent: "#bc5277",
    cheek: "#f17c9b",
    sound: 360,
  },
  {
    id: "matcha",
    name: "Matcha Mochi",
    colour: "#b5d5a0",
    light: "#e5f3d7",
    dark: "#83ae72",
    accent: "#658f57",
    cheek: "#ed9a9e",
    sound: 320,
  },
  {
    id: "blueberry",
    name: "Blueberry",
    colour: "#c5b7ed",
    light: "#eee6ff",
    dark: "#9986d0",
    accent: "#7865b4",
    cheek: "#eea0b9",
    sound: 420,
  },
  {
    id: "golden",
    name: "Golden Bao",
    colour: "#f4c75f",
    light: "#ffedaa",
    dark: "#dba23b",
    accent: "#b98024",
    cheek: "#ef938e",
    sound: 500,
  },
  {
    id: "glitter-strawberry",
    name: "Glitter Berry",
    colour: "#f6a9cf",
    light: "#ffe4f2",
    dark: "#d66da5",
    accent: "#a9477b",
    cheek: "#f17c9b",
    sound: 440,
    glitter: "rgba(255,255,255,0.95)",
  },
  {
    id: "glitter-lavender",
    name: "Glitter Dream",
    colour: "#c9b3f5",
    light: "#f1e8ff",
    dark: "#9474d2",
    accent: "#7151ad",
    cheek: "#eea0b9",
    sound: 520,
    glitter: "rgba(255,255,255,0.95)",
  },
  {
    id: "glitter-gold",
    name: "Golden Sparkle",
    colour: "#f4d477",
    light: "#fff6c9",
    dark: "#d7a63f",
    accent: "#a87922",
    cheek: "#ef938e",
    sound: 580,
    glitter: "rgba(255,255,235,0.98)",
  },
];

const BODY_WIDTH = 112;
const BODY_HEIGHT = 91;
const MAX_SPEED = 2400;
const THROW_BOOST = 1.5;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function deformPoint(
  game: DumplingPhysics,
  px: number,
  py: number,
) {
  const applyPull = (
    pointX: number,
    pointY: number,
    grabX: number,
    grabY: number,
    pullX: number,
    pullY: number,
  ) => {
    const distance = Math.hypot(pullX, pullY);

    if (distance < 0.5) {
      return { x: pointX, y: pointY };
    }

    const dirX = pullX / distance;
    const dirY = pullY / distance;
    const stretchAmount = Math.min(distance * 1.2, 265);

    const projection = pointX * dirX + pointY * dirY;
    const extent = Math.sqrt(
      BODY_WIDTH * BODY_WIDTH * dirX * dirX +
        BODY_HEIGHT * BODY_HEIGHT * dirY * dirY,
    );

    const sidePosition = clamp(
      0.5 + projection / (2 * extent),
      0,
      1,
    );

    const sideWeight =
      sidePosition * sidePosition * (3 - 2 * sidePosition);

    const dx = pointX - grabX;
    const dy = pointY - grabY;
    const distanceFromGrab = Math.hypot(dx, dy);

    const localInfluence = Math.exp(
      -(distanceFromGrab * distanceFromGrab) /
        (2 * 78 * 78),
    );

    const influence = Math.max(sideWeight, localInfluence);
    const displacement = stretchAmount * influence;

    return {
      x: pointX + dirX * displacement,
      y: pointY + dirY * displacement,
    };
  };

  // Reduce the individual finger pulls while pinching so they
  // cannot overpower the inward squeeze.
  const pullStrength = 1 - game.squeeze;

  let point = applyPull(
    px,
    py,
    game.grabX,
    game.grabY,
    game.pullX * pullStrength,
    game.pullY * pullStrength,
  );

  if (game.multiTouch) {
    point = applyPull(
      point.x,
      point.y,
      game.grabX2,
      game.grabY2,
      game.pullX2 * pullStrength,
      game.pullY2 * pullStrength,
    );
  }

  if (game.squeeze > 0) {
    const squeezeX = game.squeezeX;
    const squeezeY = game.squeezeY;

    // Axis running between the two fingers.
    const along = point.x * squeezeX + point.y * squeezeY;

    // Axis perpendicular to the two fingers.
    const across = -point.x * squeezeY + point.y * squeezeX;

    // Compress between the fingers and bulge outward in the
    // perpendicular direction, like squeezing a soft toy.
    const squeezeStrength = game.squeeze;
    const compressedAlong =
      along * (1 - squeezeStrength * 0.48);

    const expandedAcross =
      across * (1 + squeezeStrength * 0.28);

    point = {
      x:
        compressedAlong * squeezeX -
        expandedAcross * squeezeY,
      y:
        compressedAlong * squeezeY +
        expandedAcross * squeezeX,
    };
  }

  return point;
}

function deformFacePoint(
  game: DumplingPhysics,
  px: number,
  py: number,
) {
  return deformPoint(game, px, py);
}

function drawDumpling(
  ctx: CanvasRenderingContext2D,
  game: DumplingPhysics,
  dumpling: DumplingType,
  time: number,
) {
  const {
    x,
    y,
    rotation,
    scaleX,
    scaleY,
    stretch,
    wobble,
    compression,
    impactSquash,
  } = game;

  const speed = Math.min(
    Math.hypot(game.vx, game.vy) / 900,
    1,
  );

  const idleWobble =
    Math.sin(time * 0.006 + wobble) * 0.012 * (1 - speed);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scaleX + idleWobble, scaleY - idleWobble);

  ctx.save();
  ctx.translate(0, BODY_HEIGHT * 0.86);
  ctx.scale(1 + speed * 0.12, 0.2);

  const shadow = ctx.createRadialGradient(
    0,
    0,
    8,
    0,
    0,
    BODY_WIDTH * 1.12,
  );

  shadow.addColorStop(0, "rgba(64, 39, 46, 0.20)");
  shadow.addColorStop(1, "rgba(64, 39, 46, 0)");

  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(
    0,
    0,
    BODY_WIDTH * 1.12,
    BODY_HEIGHT * 0.5,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();

  const bodyGradient = ctx.createLinearGradient(
    -BODY_WIDTH * 0.8,
    -BODY_HEIGHT,
    BODY_WIDTH * 0.65,
    BODY_HEIGHT,
  );

  bodyGradient.addColorStop(0, dumpling.light);
  bodyGradient.addColorStop(0.46, dumpling.colour);
  bodyGradient.addColorStop(1, dumpling.dark);

  ctx.fillStyle = bodyGradient;
  ctx.strokeStyle = dumpling.dark;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";

  ctx.beginPath();

  const pleats = 13;
  const steps = 144;

  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const upper = Math.max(0, -Math.sin(angle));
    const pleat = Math.cos(angle * pleats) * upper * 5.2;

    const radiusX = BODY_WIDTH * (1 + pleat / BODY_WIDTH);
    const radiusY = BODY_HEIGHT * (1 + pleat / BODY_HEIGHT);

    let px = Math.cos(angle) * radiusX;
    let py = Math.sin(angle) * radiusY;

    if (py > BODY_HEIGHT * 0.62) {
      py =
        BODY_HEIGHT * 0.62 +
        (py - BODY_HEIGHT * 0.62) * 0.62;
    }

    const point = deformPoint(game, px, py);

    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.clip();

  if (dumpling.glitter) {
    ctx.save();
    ctx.fillStyle = dumpling.glitter;

    for (let i = 0; i < 42; i++) {
      const angle = i * 2.39996;
      const radius = 15 + ((i * 37) % 76);
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius * 0.68;

      if (
        Math.abs(px) < BODY_WIDTH * 0.77 &&
        Math.abs(py) < BODY_HEIGHT * 0.66
      ) {
        const point = deformPoint(game, px, py);

        ctx.globalAlpha = 0.4 + (i % 4) * 0.15;
        ctx.beginPath();
        ctx.arc(
          point.x,
          point.y,
          i % 3 === 0 ? 2.1 : 1.2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    ctx.restore();
  }

  if (game.held || compression > 0.02 || stretch > 0.05) {
    const pressure = ctx.createRadialGradient(
      game.grabX,
      game.grabY,
      2,
      game.grabX,
      game.grabY,
      78,
    );

    pressure.addColorStop(
      0,
      `rgba(112, 70, 75, ${Math.min(
        0.12 + compression * 0.09 + impactSquash * 0.08,
        0.24,
      )})`,
    );
    pressure.addColorStop(1, "rgba(112, 70, 75, 0)");

    ctx.fillStyle = pressure;
    ctx.beginPath();
    ctx.ellipse(0, 0, BODY_WIDTH, BODY_HEIGHT, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const highlight = deformPoint(game, -38, -44);

  ctx.save();
  ctx.globalAlpha = 0.52;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(
    highlight.x,
    highlight.y,
    34,
    15,
    -0.48,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let i = -3; i <= 3; i++) {
    const startX = i * 17;
    const startY =
      -BODY_HEIGHT * 0.76 + Math.abs(i) * 2.2;
    const endX = i * 12;
    const endY = -BODY_HEIGHT * 0.17;

    const start = deformPoint(game, startX, startY);
    const control = deformPoint(
      game,
      startX + (endX - startX) * 0.45 + stretch * i * 0.3,
      -BODY_HEIGHT * 0.42,
    );
    const end = deformPoint(game, endX, endY);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.quadraticCurveTo(
      control.x,
      control.y,
      end.x,
      end.y,
    );

    ctx.strokeStyle =
      i % 2 === 0 ? dumpling.dark : dumpling.light;
    ctx.globalAlpha = i % 2 === 0 ? 0.62 : 0.85;
    ctx.lineWidth = i === 0 ? 3.5 : 2.6;
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.save();

  const faceY = 13;
  const leftEye = deformFacePoint(game, -27, faceY);
  const rightEye = deformFacePoint(game, 27, faceY);

  ctx.fillStyle = "#49343b";
  ctx.beginPath();
  ctx.ellipse(
    leftEye.x,
    leftEye.y,
    5.2,
    7.1,
    -0.12,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    rightEye.x,
    rightEye.y,
    5.2,
    7.1,
    0.12,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const leftEyeHighlight = deformFacePoint(
    game,
    -28.5,
    faceY - 2.1,
  );
  const rightEyeHighlight = deformFacePoint(
    game,
    25.5,
    faceY - 2.1,
  );

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(
    leftEyeHighlight.x,
    leftEyeHighlight.y,
    1.7,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    rightEyeHighlight.x,
    rightEyeHighlight.y,
    1.7,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const leftCheek = deformFacePoint(game, -45, faceY + 15);
  const rightCheek = deformFacePoint(game, 45, faceY + 15);

  ctx.globalAlpha = 0.72;
  ctx.fillStyle = dumpling.cheek;
  ctx.beginPath();
  ctx.ellipse(
    leftCheek.x,
    leftCheek.y,
    10,
    5.5,
    -0.15,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    rightCheek.x,
    rightCheek.y,
    10,
    5.5,
    0.15,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.globalAlpha = 1;

  const smileStart = deformFacePoint(game, -8, faceY + 13);
  const smileControl = deformFacePoint(game, 0, faceY + 22);
  const smileEnd = deformFacePoint(game, 8, faceY + 13);

  ctx.strokeStyle = "#49343b";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(smileStart.x, smileStart.y);
  ctx.quadraticCurveTo(
    smileControl.x,
    smileControl.y,
    smileEnd.x,
    smileEnd.y,
  );
  ctx.stroke();

  ctx.restore();

  if (dumpling.id === "strawberry") {
    ctx.fillStyle = "#fff8ee";

    const seeds: [number, number][] = [
      [-54, -19],
      [-36, -47],
      [48, -31],
      [55, 0],
      [-58, 16],
      [31, -57],
    ];

    seeds.forEach(([sx, sy]) => {
      const point = deformPoint(game, sx, sy);

      ctx.beginPath();
      ctx.ellipse(
        point.x,
        point.y,
        2.2,
        3.5,
        0.3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    });
  }

  if (dumpling.id === "matcha") {
    ctx.strokeStyle = "#6d9b5b";
    ctx.lineWidth = 2;

    const leaf1Start = deformPoint(game, -54, -25);
    const leaf1Control = deformPoint(game, -43, -39);
    const leaf1End = deformPoint(game, -34, -25);

    const leaf2Start = deformPoint(game, 42, -44);
    const leaf2Control = deformPoint(game, 53, -56);
    const leaf2End = deformPoint(game, 59, -42);

    ctx.beginPath();
    ctx.moveTo(leaf1Start.x, leaf1Start.y);
    ctx.quadraticCurveTo(
      leaf1Control.x,
      leaf1Control.y,
      leaf1End.x,
      leaf1End.y,
    );
    ctx.moveTo(leaf2Start.x, leaf2Start.y);
    ctx.quadraticCurveTo(
      leaf2Control.x,
      leaf2Control.y,
      leaf2End.x,
      leaf2End.y,
    );
    ctx.stroke();
  }

  if (dumpling.id === "blueberry") {
    ctx.fillStyle = "#8d78c3";

    [
      [-53, -4, 3],
      [54, -35, 3],
      [52, 34, 2.5],
    ].forEach(([sx, sy, radius]) => {
      const point = deformPoint(game, sx, sy);

      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  if (dumpling.id === "golden") {
    ctx.fillStyle = "#fff2ba";

    [
      [-49, -38, 4],
      [52, -12, 3],
      [39, -53, 2.5],
    ].forEach(([sx, sy, radius]) => {
      const point = deformPoint(game, sx, sy);

      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.restore();

  if (game.held) {
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-83, -68);
    ctx.lineTo(-83, -80);
    ctx.moveTo(-89, -74);
    ctx.lineTo(-77, -74);
    ctx.moveTo(80, -53);
    ctx.lineTo(80, -64);
    ctx.moveTo(74, -58.5);
    ctx.lineTo(86, -58.5);
    ctx.stroke();
  }

  ctx.restore();
}

function createInitialPhysics(
  width: number,
  height: number,
): DumplingPhysics {
  return {
    x: width / 2,
    y: height / 2,
    vx: 0,
    vy: 0,
    rotation: 0,
    rotationVelocity: 0,
    scaleX: 1,
    scaleY: 1,
    dragging: false,
    held: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    lastPointerTime: 0,
    stretch: 0,
    wobble: Math.random() * Math.PI * 2,
    grabX: 0,
    grabY: 0,
    pullX: 0,
    pullY: 0,
    grabX2: 0,
    grabY2: 0,
    pullX2: 0,
    pullY2: 0,
    multiTouch: false,
    squeeze: 0,
    squeezeX: 0,
    squeezeY: 0,
    pinchStartDistance: 0,
    pinchActive: false,
    compression: 0,
    pointerStartX: 0,
    pointerStartY: 0,
    releaseWobble: 0,
    impactSquash: 0,
  };
}

export default function OnlineSquishyDumpling() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const gameRef = useRef<DumplingPhysics | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const audioRef = useRef<AudioContext | null>(null);
  const lastSoundRef = useRef(0);
  const dumplingRef = useRef(DUMPLINGS[0]);
  const pointersRef = useRef<Map<number, PointerTrack>>(new Map());

  const [selectedId, setSelectedId] = useState("classic");
  const [soundOn, setSoundOn] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>("squish");
  const [resetKey, setResetKey] = useState(0);

  const selectedDumpling =
    DUMPLINGS.find((dumpling) => dumpling.id === selectedId) ??
    DUMPLINGS[0];

  useEffect(() => {
    dumplingRef.current = selectedDumpling;
  }, [selectedDumpling]);

  const playSound = useCallback(
    (frequency?: number) => {
      if (!soundOn) return;

      const now = Date.now();

      if (now - lastSoundRef.current < 90) return;
      lastSoundRef.current = now;

      try {
        const AudioContextClass = window.AudioContext;
        if (!AudioContextClass) return;

        if (!audioRef.current) {
          audioRef.current = new AudioContextClass();
        }

        const audio = audioRef.current;

        if (audio.state === "suspended") {
          void audio.resume();
        }

        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        const startTime = audio.currentTime;
        const pitch = frequency ?? dumplingRef.current.sound;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(pitch, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          Math.max(90, pitch * 0.65),
          startTime + 0.12,
        );

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(
          0.045,
          startTime + 0.015,
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          startTime + 0.16,
        );

        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.17);
      } catch {
        // Sound is optional.
      }
    },
    [soundOn],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { width, height };

      if (!gameRef.current) {
        gameRef.current = createInitialPhysics(width, height);
      } else {
        const game = gameRef.current;

        if (playMode === "squish" && !game.dragging) {
          game.x = width / 2;
          game.y = height / 2;
        } else {
          const horizontalLimit = Math.min(
            BODY_WIDTH * Math.max(game.scaleX, 1),
            width / 2,
          );

          game.x = clamp(
            game.x,
            horizontalLimit,
            Math.max(horizontalLimit, width - horizontalLimit),
          );

          if (playMode === "throw") {
            const topLimit = Math.min(BODY_HEIGHT, height / 2);
            const bottomLimit = Math.max(
              topLimit,
              height - BODY_HEIGHT * Math.max(0.82, game.scaleY) - 38,
            );

            game.y = clamp(game.y, topLimit, bottomLimit);
          }
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);

    let lastTime = performance.now();

    const animate = (time: number) => {
      const game = gameRef.current;

      if (!game) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      const { width, height } = sizeRef.current;
      const dt = Math.min((time - lastTime) / 1000, 0.032);
      lastTime = time;

      if (!game.dragging) {
        if (playMode === "squish") {
          game.x += (width / 2 - game.x) * Math.min(1, dt * 5);
          game.y += (height / 2 - game.y) * Math.min(1, dt * 5);
          game.vx = 0;
          game.vy = 0;
        } else {
          game.vy += 920 * dt;
          game.y += game.vy * dt;
          game.x += game.vx * dt;
        }

        game.rotation += game.rotationVelocity * dt;

        game.vx *= Math.pow(
          playMode === "throw" ? 0.997 : 0.985,
          dt * 60,
        );
        game.rotationVelocity *= Math.pow(
          playMode === "throw" ? 0.99 : 0.975,
          dt * 60,
        );

        if (playMode === "throw") {
          const horizontalLimit = Math.min(
            BODY_WIDTH * Math.max(game.scaleX, 1),
            width / 2,
          );

          if (game.x < horizontalLimit) {
            game.x = horizontalLimit;

            if (game.vx < 0) {
              game.vx = Math.abs(game.vx) * 0.82;
              game.rotationVelocity += game.vy * 0.00012;
            }
          } else if (game.x > width - horizontalLimit) {
            game.x = width - horizontalLimit;

            if (game.vx > 0) {
              game.vx = -Math.abs(game.vx) * 0.82;
              game.rotationVelocity += game.vy * 0.00012;
            }
          }

          const topLimit = Math.min(
            BODY_HEIGHT * Math.max(game.scaleY, 1),
            height / 2,
          );

          const bottomLimit = Math.max(
            topLimit,
            height - BODY_HEIGHT * Math.max(0.82, game.scaleY) - 38,
          );

          if (game.y < topLimit) {
            game.y = topLimit;

            if (game.vy < 0) {
              game.vy = Math.abs(game.vy) * 0.62;
            }
          } else if (game.y >= bottomLimit) {
            game.y = bottomLimit;

            if (game.vy > 100) {
              const impact = Math.min(game.vy / 1000, 1);

              game.impactSquash = Math.max(
                game.impactSquash,
                0.45 + impact * 0.4,
              );

              game.vy = -Math.abs(game.vy) * 0.68;
              game.vx *= 0.94;
              game.rotationVelocity += game.vx * 0.00035;
              playSound(dumplingRef.current.sound + 100);
            } else if (game.vy > 0) {
              game.vy = 0;
              game.vx *= Math.pow(0.99, dt * 60);
            }
          }
        }

        game.vx = clamp(game.vx, -MAX_SPEED, MAX_SPEED);
        game.vy = clamp(game.vy, -MAX_SPEED, MAX_SPEED);
      }

      const targetCompression = game.held
        ? playMode === "squish"
          ? 0.78
          : 0.24
        : 0;

      game.compression +=
        (targetCompression - game.compression) *
        Math.min(1, dt * (game.held ? 12 : 3.8));

      game.impactSquash +=
        (0 - game.impactSquash) * Math.min(1, dt * 5.5);

      const movementSpeed = Math.min(
        Math.hypot(game.vx, game.vy) / 3200,
        0.14,
      );

      const impact = game.impactSquash;

      const targetScaleX = game.held
        ? 1 + game.compression * 0.58
        : 1 + movementSpeed + impact * 0.7;

      const targetScaleY = game.held
        ? 1 - game.compression * 0.55
        : 1 -
          Math.min(Math.abs(game.vx) / 4500, 0.1) -
          impact * 0.55;

      game.scaleX +=
        (targetScaleX - game.scaleX) *
        Math.min(1, dt * (game.held ? 12 : 9));

      game.scaleY +=
        (targetScaleY - game.scaleY) *
        Math.min(1, dt * (game.held ? 12 : 9));

      if (!game.dragging) {
        game.pullX += (0 - game.pullX) * Math.min(1, dt * 3.1);
        game.pullY += (0 - game.pullY) * Math.min(1, dt * 3.1);
        game.pullX2 += (0 - game.pullX2) * Math.min(1, dt * 3.1);
        game.pullY2 += (0 - game.pullY2) * Math.min(1, dt * 3.1);
        game.stretch += (0 - game.stretch) * Math.min(1, dt * 3.2);
        game.wobble += dt * (4 + Math.abs(game.vx) * 0.008);
        game.releaseWobble *= Math.pow(0.94, dt * 60);
        game.rotationVelocity += -game.rotation * dt * 1.8;
        game.rotation *= Math.pow(0.985, dt * 60);
      }

      if (playMode === "throw") {
        const safeBottom = Math.max(
          Math.min(BODY_HEIGHT, height / 2),
          height - BODY_HEIGHT * Math.max(0.82, game.scaleY) - 38,
        );

        game.y = Math.min(game.y, safeBottom);
      }

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(179, 137, 153, 0.14)";

      for (let px = 22; px < width; px += 34) {
        for (let py = 22; py < height; py += 34) {
          ctx.beginPath();
          ctx.arc(px, py, 1.15, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      drawDumpling(ctx, game, dumplingRef.current, time);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [playSound, playMode, resetKey]);

  const getPointerPosition = (
    event: React.PointerEvent<HTMLCanvasElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLCanvasElement>,
  ) => {
    const game = gameRef.current;

    if (!game) return;

    if (
      pointersRef.current.size >= 1 &&
      (playMode !== "squish" || pointersRef.current.size >= 2)
    ) {
      return;
    }

    const pointer = getPointerPosition(event);
    const dx =
      (pointer.x - game.x) /
      (BODY_WIDTH * Math.max(game.scaleX, 0.5));
    const dy =
      (pointer.y - game.y) /
      (BODY_HEIGHT * Math.max(game.scaleY, 0.5));

    const isSecondPointer = pointersRef.current.size === 1;
    const hitLimit = isSecondPointer ? 3.8 : 1.6;

    if (dx * dx + dy * dy > hitLimit) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const slot: 1 | 2 = isSecondPointer ? 2 : 1;

    const track: PointerTrack = {
      x: pointer.x,
      y: pointer.y,
      startX: pointer.x,
      startY: pointer.y,
      grabX: clamp(dx * BODY_WIDTH, -BODY_WIDTH, BODY_WIDTH),
      grabY: clamp(dy * BODY_HEIGHT, -BODY_HEIGHT, BODY_HEIGHT),
      slot,
    };

    pointersRef.current.set(event.pointerId, track);

    if (slot === 1) {
      game.grabX = track.grabX;
      game.grabY = track.grabY;
      game.pointerStartX = pointer.x;
      game.pointerStartY = pointer.y;
      game.pullX = 0;
      game.pullY = 0;
      game.lastPointerX = pointer.x;
      game.lastPointerY = pointer.y;
      game.lastPointerTime = performance.now();
    } else {
      game.grabX2 = track.grabX;
      game.grabY2 = track.grabY;
      game.pullX2 = 0;
      game.pullY2 = 0;

      // Start a fresh pinch using the actual distance between fingers.
      const firstPointer = Array.from(
        pointersRef.current.values(),
      ).find((item) => item.slot === 1);

      if (firstPointer) {
        game.pinchStartDistance = Math.hypot(
          track.x - firstPointer.x,
          track.y - firstPointer.y,
        );
      }

      game.squeeze = 0;
      game.squeezeX = 0;
      game.squeezeY = 0;
      game.multiTouch = true;
    }

    game.dragging = true;
    game.held = true;
    game.compression = 0;
    game.stretch = 0;
    game.impactSquash = 0;

    if (playMode === "throw") {
      game.dragOffsetX = game.x - pointer.x;
      game.dragOffsetY = game.y - pointer.y;
      game.vx = 0;
      game.vy = 0;
    } else {
      game.vx = 0;
      game.vy = 0;
    }

    setIsDragging(true);
    playSound(selectedDumpling.sound);
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLCanvasElement>,
  ) => {
    const game = gameRef.current;
    const track = pointersRef.current.get(event.pointerId);

    if (!game || !track || !game.dragging) return;

    event.preventDefault();

    const pointer = getPointerPosition(event);
    const now = performance.now();
    const elapsed = Math.max(
      (now - game.lastPointerTime) / 1000,
      0.008,
    );

    const dx = pointer.x - track.x;
    const dy = pointer.y - track.y;

    track.x = pointer.x;
    track.y = pointer.y;

    if (playMode === "throw") {
      const { width, height } = sizeRef.current;

      const horizontalLimit = Math.min(
        BODY_WIDTH * Math.max(game.scaleX, 1),
        width / 2,
      );

      const topLimit = Math.min(
        BODY_HEIGHT * Math.max(game.scaleY, 1),
        height / 2,
      );

      const bottomLimit = Math.max(
        topLimit,
        height - BODY_HEIGHT * Math.max(0.82, game.scaleY) - 38,
      );

      game.x = clamp(
        pointer.x + game.dragOffsetX,
        horizontalLimit,
        Math.max(horizontalLimit, width - horizontalLimit),
      );

      game.y = clamp(
        pointer.y + game.dragOffsetY,
        topLimit,
        bottomLimit,
      );

      game.vx = clamp(
        (dx / elapsed) * THROW_BOOST,
        -MAX_SPEED,
        MAX_SPEED,
      );
      game.vy = clamp(
        (dy / elapsed) * THROW_BOOST,
        -MAX_SPEED,
        MAX_SPEED,
      );
      game.rotationVelocity = clamp(
        (dx / elapsed) / 1000,
        -2.4,
        2.4,
      );

      game.lastPointerTime = now;
      game.lastPointerX = pointer.x;
      game.lastPointerY = pointer.y;
    } else {
      const pullX = clamp(
        (pointer.x - track.startX) / Math.max(game.scaleX, 0.5),
        -420,
        420,
      );

      const pullY = clamp(
        (pointer.y - track.startY) / Math.max(game.scaleY, 0.5),
        -420,
        420,
      );

      if (track.slot === 1) {
        game.pullX = pullX;
        game.pullY = pullY;
        game.lastPointerX = pointer.x;
        game.lastPointerY = pointer.y;
        game.lastPointerTime = now;
      } else {
        game.pullX2 = pullX;
        game.pullY2 = pullY;
      }

      const firstPointer = Array.from(
        pointersRef.current.values(),
      ).find((item) => item.slot === 1);

      const secondPointer = Array.from(
        pointersRef.current.values(),
      ).find((item) => item.slot === 2);

      if (game.multiTouch && firstPointer && secondPointer) {
        const pinchDX = secondPointer.x - firstPointer.x;
        const pinchDY = secondPointer.y - firstPointer.y;
        const distance = Math.hypot(pinchDX, pinchDY);

        // Compare with the separation when the second finger touched down.
        const initialDistance = game.pinchStartDistance;

        game.squeeze = clamp(
          (initialDistance - distance) / 42,
          0,
          1,
        );

        game.squeezeX = pinchDX / Math.max(distance, 1);
        game.squeezeY = pinchDY / Math.max(distance, 1);

        game.pinchActive = game.squeeze > 0;
      } else {
        game.squeeze = 0;
        game.pinchActive = false;
      }

      const firstPull = Math.hypot(game.pullX, game.pullY);
      const secondPull = game.multiTouch
        ? Math.hypot(game.pullX2, game.pullY2)
        : 0;

      game.stretch = game.squeeze > 0
        ? 0
        : Math.min((firstPull + secondPull) / 85, 3.5);

      game.rotation = clamp(
        (game.pullX + game.pullX2) / 1200,
        -0.22,
        0.22,
      );

      game.vx = 0;
      game.vy = 0;
    }

    if (Math.hypot(dx, dy) > 12) {
      playSound(selectedDumpling.sound);
    }
  };

  const handlePointerUp = (
    event: React.PointerEvent<HTMLCanvasElement>,
  ) => {
    const track = pointersRef.current.get(event.pointerId);
    const game = gameRef.current;

    if (!track || !game) return;

    if (playMode === "throw") {
      const pointer = getPointerPosition(event);
      const now = performance.now();
      const elapsed = Math.max(
        (now - game.lastPointerTime) / 1000,
        0.008,
      );
      const dx = pointer.x - track.x;
      const dy = pointer.y - track.y;

      if (Math.hypot(dx, dy) > 1.5) {
        game.vx = clamp(
          (dx / elapsed) * THROW_BOOST,
          -MAX_SPEED,
          MAX_SPEED,
        );
        game.vy = clamp(
          (dy / elapsed) * THROW_BOOST,
          -MAX_SPEED,
          MAX_SPEED,
        );
        game.rotationVelocity = clamp(
          (dx / elapsed) / 1000,
          -2.4,
          2.4,
        );
      }
    }

    if (!pointersRef.current.delete(event.pointerId)) return;

    // If one finger is still down, turn it back into the primary
    // pointer and stop the old pinch instead of leaving stale state.
    if (pointersRef.current.size > 0) {
      const remainingPointer = Array.from(
        pointersRef.current.values(),
      )[0];

      remainingPointer.slot = 1;
      remainingPointer.startX = remainingPointer.x;
      remainingPointer.startY = remainingPointer.y;
      remainingPointer.grabX = game.grabX;
      remainingPointer.grabY = game.grabY;

      game.grabX = remainingPointer.grabX;
      game.grabY = remainingPointer.grabY;
      game.pullX = 0;
      game.pullY = 0;
      game.pullX2 = 0;
      game.pullY2 = 0;
      game.squeeze = 0;
      game.squeezeX = 0;
      game.squeezeY = 0;
      game.pinchActive = false;
      game.multiTouch = false;
      game.pinchStartDistance = 0;

      return;
    }

    game.dragging = false;
    game.squeeze = 0;
    game.squeezeX = 0;
    game.squeezeY = 0;
    game.pinchActive = false;
    game.pinchStartDistance = 0;
    game.held = false;
    game.multiTouch = false;
    game.pullX2 = 0;
    game.pullY2 = 0;

    if (playMode === "squish") {
      game.releaseWobble = Math.min(
        Math.hypot(game.pullX, game.pullY) / 35 +
          game.compression,
        2.5,
      );

      game.vx = 0;
      game.vy = 0;
      game.rotationVelocity = -game.rotation * 2.5;
    } else {
      game.vx = clamp(game.vx * 1.25, -MAX_SPEED, MAX_SPEED);
      game.vy = clamp(game.vy * 1.25, -MAX_SPEED, MAX_SPEED);

      game.rotationVelocity = clamp(
        game.rotationVelocity,
        -2.4,
        2.4,
      );
    }

    setIsDragging(false);
    playSound(selectedDumpling.sound + 80);
  };

  const chooseMode = (mode: PlayMode) => {
    pointersRef.current.clear();
    setPlayMode(mode);

    const game = gameRef.current;
    const { width, height } = sizeRef.current;

    if (game) {
      game.dragging = false;
      game.held = false;
      game.pullX = 0;
      game.pullY = 0;
      game.pullX2 = 0;
      game.pullY2 = 0;
      game.multiTouch = false;
      game.squeeze = 0;
      game.squeezeX = 0;
      game.squeezeY = 0;
      game.pinchActive = false;
      game.pinchStartDistance = 0;
      game.stretch = 0;
      game.compression = 0;
      game.vx = 0;
      game.vy = 0;
      game.rotation = 0;
      game.rotationVelocity = 0;
      game.scaleX = 1;
      game.scaleY = 1;

      if (mode === "squish") {
        game.x = width / 2;
        game.y = height / 2;
      } else {
        game.x = width / 2;
        game.y = Math.max(BODY_HEIGHT + 20, height * 0.35);
      }
    }

    setIsDragging(false);
  };

  const chooseDumpling = (id: string) => {
    pointersRef.current.clear();
    setSelectedId(id);

    const game = gameRef.current;
    const { width, height } = sizeRef.current;

    if (game) {
      game.vx = 0;
      game.vy = playMode === "throw" ? -170 : 0;
      game.rotation = 0;
      game.rotationVelocity = 0;
      game.scaleX = 0.85;
      game.scaleY = 1.12;
      game.pullX = 0;
      game.pullY = 0;
      game.pullX2 = 0;
      game.pullY2 = 0;
      game.multiTouch = false;
      game.squeeze = 0;
      game.squeezeX = 0;
      game.squeezeY = 0;
      game.pinchActive = false;
      game.pinchStartDistance = 0;
      game.compression = 0;
      game.stretch = 0;
      game.impactSquash = 0;
      game.held = false;
      game.dragging = false;

      if (playMode === "squish") {
        game.x = width / 2;
        game.y = height / 2;
      }
    }

    setIsDragging(false);

    playSound(
      DUMPLINGS.find((dumpling) => dumpling.id === id)?.sound,
    );
  };

  const resetDumpling = () => {
    pointersRef.current.clear();

    const { width, height } = sizeRef.current;
    gameRef.current = createInitialPhysics(width, height);

    if (playMode === "throw") {
      gameRef.current.y = Math.max(BODY_HEIGHT + 30, height * 0.43);
      gameRef.current.scaleX = 0.85;
      gameRef.current.scaleY = 1.12;
    }

    setIsDragging(false);
    setResetKey((value) => value + 1);
    playSound(selectedDumpling.sound);
  };

  const hintText = isDragging
    ? playMode === "squish"
      ? pointersRef.current.size > 1
        ? "Pinch inward to squeeze the dough!"
        : "Pull it further… stretch that dough!"
      : "Ready… let go to throw!"
    : playMode === "squish"
      ? "Press and pull the dough, then let go"
      : "Pick it up, flick it, and watch it splat!";

  return (
    <main className="squishy-game">
      <section className="squishy-game__intro">
        <span className="squishy-game__eyebrow">
          YOUR LITTLE MOMENT OF CALM
        </span>

        <h1>Squishy Dumplings</h1>

        <p>
          Pick a little dumpling, give it a squeeze, and let all
          your worries bounce away.
        </p>
      </section>

      <section
        className="squishy-game__toy"
        aria-label="Interactive squishy dumpling toy"
      >
        <div className="squishy-game__topbar">
          <span className="squishy-game__status">
            <span
              className={`squishy-game__status-dot${
                isDragging ? " is-active" : ""
              }`}
            />
            {isDragging
              ? playMode === "squish"
                ? "SQUISHING!"
                : "PICKED UP!"
              : "READY TO PLAY"}
          </span>

          <div className="squishy-game__actions">
            <button
              type="button"
              className="squishy-game__icon-button"
              onClick={() => setSoundOn((value) => !value)}
              aria-pressed={soundOn}
              aria-label={
                soundOn ? "Turn sounds off" : "Turn sounds on"
              }
              title={
                soundOn ? "Turn sounds off" : "Turn sounds on"
              }
            >
              {soundOn ? "♫" : "♪̸"}
              <span>{soundOn ? "Sound on" : "Sound off"}</span>
            </button>

            <button
              type="button"
              className="squishy-game__icon-button"
              onClick={resetDumpling}
              aria-label="Reset dumpling position"
              title="Put dumpling back"
            >
              ↻ <span>Reset</span>
            </button>
          </div>
        </div>

        <div
          className="squishy-game__mode-picker"
          role="group"
          aria-label="Choose how to play"
        >
          <button
            type="button"
            className={`squishy-game__mode-button${
              playMode === "squish" ? " is-selected" : ""
            }`}
            onClick={() => chooseMode("squish")}
            aria-pressed={playMode === "squish"}
          >
            <span
              className="squishy-game__mode-icon"
              aria-hidden="true"
            >
              ♡
            </span>
            <span className="squishy-game__mode-copy">
              <strong>Squish &amp; Stretch</strong>
              <small>Pull the dough</small>
            </span>
          </button>

          <button
            type="button"
            className={`squishy-game__mode-button${
              playMode === "throw" ? " is-selected" : ""
            }`}
            onClick={() => chooseMode("throw")}
            aria-pressed={playMode === "throw"}
          >
            <span
              className="squishy-game__mode-icon"
              aria-hidden="true"
            >
              ↗
            </span>
            <span className="squishy-game__mode-copy">
              <strong>Pick Up &amp; Throw</strong>
              <small>Flick it to make it bounce</small>
            </span>
          </button>
        </div>

        <div className="squishy-game__playfield">
          <canvas
            ref={canvasRef}
            className={`squishy-game__canvas${
              isDragging ? " is-grabbing" : ""
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onLostPointerCapture={handlePointerUp}
            aria-label={
              playMode === "squish"
                ? `Interactive ${selectedDumpling.name}. Press and pull the dough to stretch it, then release.`
                : `Interactive ${selectedDumpling.name}. Pick it up, flick it, and release to throw it.`
            }
            role="img"
          />

          <div className="squishy-game__hint" aria-live="polite">
            <span className="squishy-game__hint-icon">
              {isDragging ? "♡" : "✦"}
            </span>
            {hintText}
          </div>
        </div>

        <div className="squishy-game__picker">
          <div className="squishy-game__picker-heading">
            <span>MEET YOUR DUMPLINGS</span>
            <span className="squishy-game__picker-subtitle">
              Pick your squishy pal
            </span>
          </div>

          <div className="squishy-game__choices">
            {DUMPLINGS.map((dumpling) => (
              <button
                key={dumpling.id}
                type="button"
                className={`squishy-game__choice${
                  selectedId === dumpling.id ? " is-selected" : ""
                }`}
                onClick={() => chooseDumpling(dumpling.id)}
                aria-pressed={selectedId === dumpling.id}
              >
                <span
                  className="squishy-game__swatch"
                  style={
                    {
                      "--swatch": dumpling.colour,
                      "--swatch-light": dumpling.light,
                      "--swatch-dark": dumpling.dark,
                    } as React.CSSProperties
                  }
                >
                  <span className="squishy-game__swatch-face">
                    <span />
                    <span />
                    <i />
                  </span>
                </span>

                <span className="squishy-game__choice-name">
                  {dumpling.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <p className="squishy-game__footer-note">
        A tiny squish break, whenever you need one <span>♡</span>
      </p>
    </main>
  );
}