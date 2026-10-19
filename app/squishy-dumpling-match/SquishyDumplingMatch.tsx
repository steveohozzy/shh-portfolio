
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { squishyDumplingMatchDb } from "@/lib/firebase";
import "./squishy-dumpling-match.css";

type BaoType = "classic" | "strawberry" | "matcha" | "golden" | "rainbow";
type Cell = BaoType | null;
type Board = Cell[][];
type GameStatus = "ready" | "playing" | "paused" | "over";

type Piece = {
  col: number;
  row: number;
  types: BaoType[];
};

type LeaderboardEntry = {
  id: string;
  initials: string;
  score: number;
  level: number;
  cleared: number;
};

const COLS = 6;
const ROWS = 10;
const LEVEL_GOAL = 18;

const BAO_TYPES: BaoType[] = [
  "classic",
  "strawberry",
  "matcha",
  "golden",
  "rainbow",
];

const BAO_NAMES: Record<BaoType, string> = {
  classic: "Cloud Cream",
  strawberry: "Strawberry Milk",
  matcha: "Matcha Mochi",
  golden: "Honey Gold",
  rainbow: "Rainbow Pop",
};

const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
] as const;

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => null),
  );
}

function randomBao(): BaoType {
  return BAO_TYPES[Math.floor(Math.random() * BAO_TYPES.length)];
}

function randomPieceTypes(): BaoType[] {
  return [randomBao(), randomBao(), randomBao()];
}

function rotateTypes(types: BaoType[]): BaoType[] {
  return [types[2], types[0], types[1]];
}

function canPlace(
  piece: Piece,
  board: Board,
  col = piece.col,
  row = piece.row,
): boolean {
  if (col < 0 || col >= COLS) return false;

  for (let i = 0; i < piece.types.length; i++) {
    const y = row + i;

    if (y >= ROWS) return false;
    if (y >= 0 && board[y][col] !== null) return false;
  }

  return true;
}

function findMatches(board: Board): Set<string> {
  const matched = new Set<string>();
  const matchableTypes = BAO_TYPES.filter((type) => type !== "rainbow");

  for (const target of matchableTypes) {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const type = board[row][col];

        if (type !== target && type !== "rainbow") continue;

        for (const [dx, dy] of DIRECTIONS) {
          const previousCol = col - dx;
          const previousRow = row - dy;

          if (
            previousCol >= 0 &&
            previousCol < COLS &&
            previousRow >= 0 &&
            previousRow < ROWS &&
            (board[previousRow][previousCol] === target ||
              board[previousRow][previousCol] === "rainbow")
          ) {
            continue;
          }

          const run: string[] = [];
          let x = col;
          let y = row;

          while (
            x >= 0 &&
            x < COLS &&
            y >= 0 &&
            y < ROWS &&
            (board[y][x] === target || board[y][x] === "rainbow")
          ) {
            run.push(`${y},${x}`);
            x += dx;
            y += dy;
          }

          if (run.length >= 3) {
            run.forEach((key) => matched.add(key));

            const containsRainbow = run.some((key) => {
              const [matchRow, matchCol] = key.split(",").map(Number);
              return board[matchRow][matchCol] === "rainbow";
            });

            if (containsRainbow) {
              board.forEach((boardRow, boardRowIndex) => {
                boardRow.forEach((cell, boardColIndex) => {
                  if (cell === target) {
                    matched.add(`${boardRowIndex},${boardColIndex}`);
                  }
                });
              });
            }
          }
        }
      }
    }
  }

  return matched;
}

function applyGravity(board: Board): Board {
  const next = board.map((row) => [...row]);

  for (let col = 0; col < COLS; col++) {
    const remaining: BaoType[] = [];

    for (let row = ROWS - 1; row >= 0; row--) {
      const type = next[row][col];
      if (type) remaining.push(type);
    }

    for (let row = ROWS - 1; row >= 0; row--) {
      next[row][col] = remaining[ROWS - 1 - row] ?? null;
    }
  }

  return next;
}

function resolveBoard(board: Board) {
  let next = board.map((row) => [...row]);
  let cleared = 0;
  let points = 0;
  let chains = 0;

  while (true) {
    const matches = findMatches(next);
    if (matches.size === 0) break;

    chains++;
    cleared += matches.size;

    const goldenCount = Array.from(matches).filter((key) => {
      const [row, col] = key.split(",").map(Number);
      return next[row][col] === "golden";
    }).length;

    points += matches.size * 10 * chains;
    points += goldenCount * 50 * chains;

    for (const key of matches) {
      const [row, col] = key.split(",").map(Number);
      next[row][col] = null;
    }

    next = applyGravity(next);
  }

  return { board: next, cleared, points, chains };
}

function DumplingTile({
  type,
  small = false,
}: {
  type: BaoType;
  small?: boolean;
}) {
  const colours: Record<
    BaoType,
    { body: string; shade: string; detail: string }
  > = {
    classic: { body: "#fff0d8", shade: "#f3d4ac", detail: "#dba98a" },
    strawberry: { body: "#ffd8e5", shade: "#f4aac3", detail: "#e98cab" },
    matcha: { body: "#d7edb9", shade: "#a9ce85", detail: "#7ca95e" },
    golden: { body: "#ffe18a", shade: "#f3b83f", detail: "#c98c27" },
    rainbow: { body: "#e4d7ff", shade: "#c3a5f5", detail: "#9c78db" },
  };

  const colour = colours[type];
  const gradientId = `sdm-${type}-body`;

  return (
    <svg
      className={`sdm-dumpling${small ? " sdm-dumpling--small" : ""}`}
      viewBox="0 0 120 112"
      role="img"
      aria-label={BAO_NAMES[type]}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={colour.body} />
          <stop offset="100%" stopColor={colour.shade} />
        </linearGradient>
      </defs>

      {type === "rainbow" && (
        <>
          <path
            d="M24 49 Q18 22 43 19"
            fill="none"
            stroke="#ff9fb5"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M35 28 Q48 8 65 19"
            fill="none"
            stroke="#ffd66b"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M59 20 Q80 12 89 35"
            fill="none"
            stroke="#8ed8b0"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </>
      )}

      <path
        d="M15 70 Q9 53 25 39 Q35 30 45 26 Q52 18 60 25 Q68 18 75 27 Q90 30 99 43 Q112 57 105 75 Q98 95 60 98 Q22 97 15 70Z"
        fill={`url(#${gradientId})`}
        stroke={colour.detail}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      <path
        d="M29 43 Q39 32 47 32 M52 29 Q60 24 66 31 M74 32 Q84 34 91 45"
        fill="none"
        stroke="#fffaf0"
        strokeWidth="4"
        strokeLinecap="round"
        opacity=".9"
      />

      {type === "matcha" && (
        <path
          d="M76 35 Q83 17 98 25 Q95 39 76 35Z"
          fill="#7eae5c"
          stroke="#659449"
          strokeWidth="1.5"
        />
      )}

      {type === "golden" && (
        <path
          d="M60 15 L64 23 L73 24 L66 30 L68 39 L60 34 L52 39 L54 30 L47 24 L56 23Z"
          fill="#fff9d7"
          stroke="#e8b53b"
          strokeWidth="1.5"
        />
      )}

      {type === "strawberry" && (
        <path
          d="M77 35 Q87 22 95 33 Q93 44 77 35Z"
          fill="#f18eae"
          stroke="#db7595"
          strokeWidth="1.5"
        />
      )}

      <ellipse cx="44" cy="62" rx="3.7" ry="5" fill="#59464a" />
      <ellipse cx="76" cy="62" rx="3.7" ry="5" fill="#59464a" />
      <path
        d="M54 71 Q60 78 66 71"
        fill="none"
        stroke="#59464a"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <ellipse cx="34" cy="70" rx="7" ry="4" fill="#f49ca8" opacity=".75" />
      <ellipse cx="86" cy="70" rx="7" ry="4" fill="#f49ca8" opacity=".75" />

      <path
        d="M28 53 Q31 49 35 52 M83 52 Q88 49 91 53"
        fill="none"
        stroke="#fffaf0"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SquishyDumplingMatch() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [piece, setPiece] = useState<Piece | null>(null);
  const [nextTypes, setNextTypes] = useState<BaoType[]>([
    "classic",
    "strawberry",
    "matcha",
  ]);
  const [status, setStatus] = useState<GameStatus>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [clearedTotal, setClearedTotal] = useState(0);
  const [level, setLevel] = useState(1);
  const [lastCombo, setLastCombo] = useState(0);
  const [holding, setHolding] = useState(false);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [initials, setInitials] = useState("");
  const [qualifyingScore, setQualifyingScore] = useState<number | null>(null);
  const [checkingLeaderboard, setCheckingLeaderboard] = useState(false);
  const [savingLeaderboardScore, setSavingLeaderboardScore] = useState(false);
  const [leaderboardMessage, setLeaderboardMessage] = useState("");

  const gesture = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    moved: boolean;
  } | null>(null);

  const cellWidth = useRef(0);
  const gameSessionRef = useRef(0);
  const checkedSessionRef = useRef(-1);
  const savingScoreRef = useRef(false);

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem("sdm-best-score") || 0));
    } catch {
      setBest(0);
    }
  }, []);

  const refreshLeaderboard = useCallback(async () => {
    try {
      const scoresQuery = query(
        collection(squishyDumplingMatchDb, "sdm-scores"),
        orderBy("score", "desc"),
        limit(10),
      );

      const snapshot = await getDocs(scoresQuery);

      const entries = snapshot.docs.map((scoreDoc) => {
        const data = scoreDoc.data();

        return {
          id: scoreDoc.id,
          initials: data.initials as string,
          score: data.score as number,
          level: data.level as number,
          cleared: data.cleared as number,
        };
      });

      setLeaderboard(entries);
      return entries;
    } catch {
      setLeaderboardMessage("Couldn't load scores. Please try again.");
      return null;
    }
  }, []);

  useEffect(() => {
    void refreshLeaderboard();
  }, [refreshLeaderboard]);

  const submitLeaderboardScore = async () => {
    const cleanInitials = initials.trim().toUpperCase();

    if (
      qualifyingScore === null ||
      !/^[A-Z]{3}$/.test(cleanInitials) ||
      savingScoreRef.current
    ) {
      return;
    }

    savingScoreRef.current = true;
    setSavingLeaderboardScore(true);
    setLeaderboardMessage("");

    try {
      await addDoc(collection(squishyDumplingMatchDb, "sdm-scores"), {
        initials: cleanInitials,
        score: qualifyingScore,
        level,
        cleared: clearedTotal,
        createdAt: serverTimestamp(),
      });

      setQualifyingScore(null);
      setInitials("");
      setLeaderboardMessage("Score saved. Nice one!");

      await refreshLeaderboard();
    } catch {
      setLeaderboardMessage("Couldn't save your score. Please try again.");
    } finally {
      savingScoreRef.current = false;
      setSavingLeaderboardScore(false);
    }
  };

  const finishGame = useCallback(() => {
    setStatus("over");
    setPiece(null);
    setHolding(false);

    setScore((current) => {
      setBest((previousBest) => {
        const nextBest = Math.max(previousBest, current);

        try {
          localStorage.setItem("sdm-best-score", String(nextBest));
        } catch {
          // Best score saving is optional.
        }

        return nextBest;
      });

      return current;
    });
  }, []);

  const startGame = useCallback(() => {
    gameSessionRef.current += 1;
    setQualifyingScore(null);
    setInitials("");
    setLeaderboardMessage("");
    setCheckingLeaderboard(false);

    const freshBoard = emptyBoard();

    setBoard(freshBoard);
    setPiece({ col: 2, row: 0, types: randomPieceTypes() });
    setNextTypes(randomPieceTypes());
    setScore(0);
    setClearedTotal(0);
    setLevel(1);
    setLastCombo(0);
    setHolding(false);
    gesture.current = null;
    setStatus("playing");
  }, []);

  useEffect(() => {
    if (
      status !== "over" ||
      gameSessionRef.current === 0 ||
      checkedSessionRef.current === gameSessionRef.current
    ) {
      return;
    }

    checkedSessionRef.current = gameSessionRef.current;
    setCheckingLeaderboard(true);
    setQualifyingScore(null);
    setLeaderboardMessage("");

    let cancelled = false;

    async function checkScore() {
      const entries = await refreshLeaderboard();

      if (cancelled) return;

      setCheckingLeaderboard(false);

      if (!entries) return;

      const qualifies =
        score > 0 &&
        (entries.length < 10 ||
          score > entries[entries.length - 1].score);

      if (qualifies) {
        setQualifyingScore(score);
        setInitials("");
        setLeaderboardMessage(
          "You made the leaderboard! Add your initials.",
        );
      } else {
        setLeaderboardMessage("Keep playing to reach the top 10!");
      }
    }

    void checkScore();

    return () => {
      cancelled = true;
    };
  }, [status, score, refreshLeaderboard]);

  const movePiece = useCallback(
    (delta: number) => {
      setPiece((current) => {
        if (!current || status !== "playing") return current;

        const nextCol = current.col + delta;

        return canPlace(current, board, nextCol, current.row)
          ? { ...current, col: nextCol }
          : current;
      });
    },
    [board, status],
  );

  const rotatePiece = useCallback(() => {
    setPiece((current) => {
      if (!current || status !== "playing") return current;
      return { ...current, types: rotateTypes(current.types) };
    });
  }, [status]);

  const hardDrop = useCallback(() => {
    if (!piece || status !== "playing") return;

    let row = piece.row;

    while (canPlace(piece, board, piece.col, row + 1)) {
      row++;
    }

    setPiece({ ...piece, row });
  }, [board, piece, status]);

  const lockPiece = useCallback(
    (currentPiece: Piece, currentBoard: Board) => {
      const locked = currentBoard.map((row) => [...row]);

      currentPiece.types.forEach((type, index) => {
        const row = currentPiece.row + index;

        if (row >= 0 && row < ROWS) {
          locked[row][currentPiece.col] = type;
        }
      });

      const result = resolveBoard(locked);

      setBoard(result.board);
      setLastCombo(result.chains);

      setScore((current) => {
        const nextScore = current + result.points;

        setBest((previousBest) => {
          const nextBest = Math.max(previousBest, nextScore);

          try {
            localStorage.setItem("sdm-best-score", String(nextBest));
          } catch {
            // Best score saving is optional.
          }

          return nextBest;
        });

        return nextScore;
      });

      setClearedTotal((current) => {
        const total = current + result.cleared;
        setLevel(Math.floor(total / LEVEL_GOAL) + 1);
        return total;
      });

      const followingPiece: Piece = {
        col: 2,
        row: 0,
        types: nextTypes,
      };

      setNextTypes(randomPieceTypes());

      if (!canPlace(followingPiece, result.board)) {
        finishGame();
      } else {
        setPiece(followingPiece);
      }
    },
    [finishGame, nextTypes],
  );

  const tick = useCallback(() => {
    if (!piece || status !== "playing") return;

    if (canPlace(piece, board, piece.col, piece.row + 1)) {
      setPiece({ ...piece, row: piece.row + 1 });
    } else {
      lockPiece(piece, board);
    }
  }, [board, lockPiece, piece, status]);

  useEffect(() => {
    if (status !== "playing") return;

    const speed = holding
      ? 55
      : Math.max(95, 760 - (level - 1) * 55);

    const timer = window.setInterval(tick, speed);

    return () => window.clearInterval(timer);
  }, [holding, level, status, tick]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "p" || event.key === "Escape") {
        if (status === "playing") {
          setStatus("paused");
          setHolding(false);
        } else if (status === "paused") {
          setStatus("playing");
        }
        return;
      }

      if (status === "paused") {
        if (event.key === "Enter") {
          event.preventDefault();
          setStatus("playing");
        }
        return;
      }

      if (status !== "playing") {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          startGame();
        }
        return;
      }

      if (
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowDown",
          "ArrowUp",
          " ",
          "z",
          "Z",
        ].includes(event.key)
      ) {
        event.preventDefault();
      }

      if (event.key === "ArrowLeft") movePiece(-1);
      if (event.key === "ArrowRight") movePiece(1);
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "z") {
        rotatePiece();
      }
      if (event.key === "ArrowDown") setHolding(true);
      if (event.key === " ") hardDrop();
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.key === "ArrowDown") setHolding(false);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [hardDrop, movePiece, rotatePiece, startGame, status]);

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (status !== "playing") return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      moved: false,
    };
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const currentGesture = gesture.current;

    if (!currentGesture || currentGesture.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - currentGesture.lastX;
    const deltaY = event.clientY - currentGesture.startY;
    const threshold = Math.max(22, cellWidth.current * 0.42);

    if (
      Math.abs(deltaX) >= threshold &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.2
    ) {
      const steps = Math.min(3, Math.floor(Math.abs(deltaX) / threshold));
      const direction = deltaX > 0 ? 1 : -1;

      for (let i = 0; i < steps; i++) {
        movePiece(direction);
      }

      currentGesture.lastX += direction * threshold * steps;
      currentGesture.moved = true;
    }
  };

  const handlePointerUp = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const currentGesture = gesture.current;

    if (!currentGesture || currentGesture.pointerId !== event.pointerId) {
      return;
    }

    const deltaY = event.clientY - currentGesture.startY;
    const deltaX = event.clientX - currentGesture.startX;

    if (deltaY > 65 && deltaY > Math.abs(deltaX) * 1.2) {
      hardDrop();
    } else if (
      !currentGesture.moved &&
      Math.abs(deltaX) < 12 &&
      Math.abs(deltaY) < 12
    ) {
      rotatePiece();
    }

    gesture.current = null;
  };

  const handlePointerCancel = () => {
    gesture.current = null;
    setHolding(false);
  };

  const isArcade = status === "playing" || status === "paused";
  const levelProgress = clearedTotal % LEVEL_GOAL;
  const progressPercent = (levelProgress / LEVEL_GOAL) * 100;

  return (
    <main className={`sdm-page${isArcade ? " sdm-page--arcade" : ""}`}>
      <div className="sdm-shell">
        <header className="sdm-header">
          <div className="sdm-brand-mark" aria-hidden="true">
            ✦
          </div>
          <p className="sdm-eyebrow">A little game, a lot of squish</p>
          <h1>Squishy Dumpling Match</h1>
          <p className="sdm-intro">
            Stack your bao, match their cuteness and make the sweetest combos.
          </p>
        </header>

        <section
          className="sdm-game-card"
          aria-label="Squishy Dumpling Match game"
        >
          <div className="sdm-game-topbar">
            <div className="sdm-level-badge">
              <span>LEVEL</span>
              <strong>{level.toString().padStart(2, "0")}</strong>
            </div>

            <div className="sdm-game-title">
              <span className="sdm-game-title-mark" aria-hidden="true">
                ✦
              </span>
              <span>BAO MATCH</span>
            </div>

            {(status === "playing" || status === "paused") && (
              <button
                className="sdm-pause-button"
                onClick={() => {
                  if (status === "playing") {
                    setHolding(false);
                    setStatus("paused");
                  } else {
                    setStatus("playing");
                  }
                }}
                aria-label={status === "playing" ? "Pause game" : "Resume game"}
              >
                {status === "playing" ? "Ⅱ" : "▶"}
              </button>
            )}

            {status !== "playing" && status !== "paused" && (
              <div className="sdm-level-badge sdm-best-badge">
                <span>BEST</span>
                <strong>{best.toLocaleString()}</strong>
              </div>
            )}
          </div>

          <div className="sdm-score-panel">
            <div className="sdm-score-line">
              <div className="sdm-score-item">
                <span>SCORE</span>
                <strong>{score.toLocaleString()}</strong>
              </div>

              <div className="sdm-score-item sdm-score-item--goal">
                <span>LEVEL GOAL</span>
                <strong>{levelProgress} / {LEVEL_GOAL}</strong>
              </div>

              <div className="sdm-score-item sdm-score-item--best">
                <span>BEST</span>
                <strong>{best.toLocaleString()}</strong>
              </div>
            </div>

            <div
              className="sdm-progress-track"
              role="progressbar"
              aria-label="Level progress"
              aria-valuemin={0}
              aria-valuemax={LEVEL_GOAL}
              aria-valuenow={levelProgress}
            >
              <div
                className="sdm-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
              <span className="sdm-progress-sparkle" aria-hidden="true">
                ✦
              </span>
            </div>
          </div>

          <div className="sdm-play-layout">
            <div className="sdm-board-wrap">
              <div className="sdm-board-heading">
                <span>BAO BASKET</span>
                <span>{clearedTotal} matched</span>
              </div>

              <div
                className={`sdm-board${status === "over" ? " sdm-board--over" : ""}`}
                aria-label="Game board"
                ref={(element) => {
                  if (element) {
                    cellWidth.current = element.clientWidth / COLS;
                  }
                }}
              >
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      className="sdm-cell"
                      key={`${rowIndex}-${colIndex}`}
                    >
                      {cell && <DumplingTile type={cell} small />}
                    </div>
                  )),
                )}

                {piece && (status === "playing" || status === "paused") && (
                  <div
                    className="sdm-active-piece"
                    style={{
                      left: `${(piece.col / COLS) * 100}%`,
                      top: `${(piece.row / ROWS) * 100}%`,
                      width: `${100 / COLS}%`,
                      height: `${(3 / ROWS) * 100}%`,
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    aria-label="Falling dumplings. Drag sideways to move, tap to rotate, swipe down to drop."
                  >
                    {piece.types.map((type, index) => (
                      <div
                        className="sdm-active-cell"
                        key={`${type}-${index}`}
                      >
                        <DumplingTile type={type} small />
                      </div>
                    ))}
                  </div>
                )}

                {status !== "playing" && (
                  <div className="sdm-overlay">
                    <div className="sdm-overlay-dumplings" aria-hidden="true">
                      <DumplingTile type="strawberry" />
                      <DumplingTile type="classic" />
                      <DumplingTile type="matcha" />
                    </div>

                    <h2>
                      {status === "paused"
                        ? "Taking a little break?"
                        : status === "over"
                          ? "Oh, bao!"
                          : "Ready to squish?"}
                    </h2>

                    <p>
                      {status === "paused"
                        ? "Your dumplings are waiting right where you left them."
                        : status === "over"
                          ? `You scored ${score.toLocaleString()} points. Fancy another round?`
                          : "Match three or more matching dumplings across, down or diagonally."}
                    </p>

                    {(status === "ready" || status === "over") && (
                      <div className="sdm-leaderboard">
                        <div className="sdm-leaderboard-heading">
                          <span aria-hidden="true">🏆</span>
                          <div>
                            <h3>BAO CHAMPIONS</h3>
                            <p>Top 10 squish scores</p>
                          </div>
                        </div>

                        {checkingLeaderboard && (
                          <p className="sdm-leaderboard-message">
                            Checking your score…
                          </p>
                        )}

                        {qualifyingScore !== null && (
                          <form
                            className="sdm-initials-form"
                            onSubmit={(event) => {
                              event.preventDefault();
                              void submitLeaderboardScore();
                            }}
                          >
                            <label htmlFor="sdm-initials">
                              You scored {qualifyingScore.toLocaleString()}!
                            </label>

                            <div className="sdm-initials-row">
                              <input
                                id="sdm-initials"
                                type="text"
                                value={initials}
                                onChange={(event) =>
                                  setInitials(
                                    event.target.value
                                      .toUpperCase()
                                      .replace(/[^A-Z]/g, "")
                                      .slice(0, 3),
                                  )
                                }
                                placeholder="ABC"
                                maxLength={3}
                                minLength={3}
                                pattern="[A-Z]{3}"
                                autoComplete="off"
                                aria-label="Three-letter initials"
                                required
                              />

                              <button
                                type="submit"
                                disabled={
                                  savingLeaderboardScore ||
                                  initials.length !== 3
                                }
                              >
                                {savingLeaderboardScore
                                  ? "Saving…"
                                  : "Save score"}
                              </button>
                            </div>
                          </form>
                        )}

                        {leaderboardMessage && (
                          <p
                            className="sdm-leaderboard-message"
                            aria-live="polite"
                          >
                            {leaderboardMessage}
                          </p>
                        )}

                        <ol className="sdm-leaderboard-list">
                          {leaderboard.map((entry, index) => (
                            <li key={entry.id}>
                              <span className="sdm-leaderboard-rank">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <strong className="sdm-leaderboard-initials">
                                {entry.initials}
                              </strong>
                              <span className="sdm-leaderboard-level">
                                LV {entry.level}
                              </span>
                              <strong className="sdm-leaderboard-score">
                                {entry.score.toLocaleString()}
                              </strong>
                            </li>
                          ))}

                          {leaderboard.length === 0 &&
                            !checkingLeaderboard && (
                              <li className="sdm-leaderboard-empty">
                                No champions yet. Be the first!
                              </li>
                            )}
                        </ol>
                      </div>
                    )}

                    <button
                      className="sdm-primary-button"
                      onClick={
                        status === "paused"
                          ? () => setStatus("playing")
                          : startGame
                      }
                    >
                      {status === "paused"
                        ? "Back to the game"
                        : status === "over"
                          ? "Play again"
                          : "Let's play!"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sdm-game-bottom">
            <div className="sdm-next-card">
              <div className="sdm-next-label-wrap">
                <span className="sdm-mini-icon" aria-hidden="true">✦</span>
                <div>
                  <p className="sdm-panel-label">UP NEXT</p>
                  <span className="sdm-next-caption">Your next bao trio</span>
                </div>
              </div>

              <div className="sdm-next-stack">
                {nextTypes.map((type, index) => (
                  <div className="sdm-next-item" key={`${type}-${index}`}>
                    <DumplingTile type={type} small />
                  </div>
                ))}
              </div>
            </div>

            <div className="sdm-combo-card">
              <span className="sdm-combo-icon" aria-hidden="true">✧</span>
              <div>
                <p className="sdm-panel-label">SQUISH COMBO</p>
                <strong>
                  {lastCombo > 1 ? `${lastCombo}× chain!` : "Sweet matches"}
                </strong>
                <span>
                  {lastCombo > 1
                    ? "Bao-tiful reactions!"
                    : "Cascades earn extra points."}
                </span>
              </div>
            </div>
          </div>

          <div className="sdm-mobile-controls" aria-label="Touch controls">
            <button
              onClick={() => movePiece(-1)}
              disabled={status !== "playing"}
              aria-label="Move left"
            >
              <span aria-hidden="true">←</span>
              <small>LEFT</small>
            </button>

            <button
              onClick={rotatePiece}
              disabled={status !== "playing"}
              aria-label="Rotate dumplings"
            >
              <span aria-hidden="true">↻</span>
              <small>ROTATE</small>
            </button>

            <button
              onPointerDown={(event) => {
                event.preventDefault();
                if (status === "playing") setHolding(true);
              }}
              onPointerUp={() => setHolding(false)}
              onPointerLeave={() => setHolding(false)}
              onPointerCancel={() => setHolding(false)}
              disabled={status !== "playing"}
              aria-label="Soft drop"
            >
              <span aria-hidden="true">↓</span>
              <small>DROP</small>
            </button>

            <button
              onClick={hardDrop}
              disabled={status !== "playing"}
              aria-label="Hard drop"
              className="sdm-hard-drop"
            >
              <span aria-hidden="true">⇊</span>
              <small>SLAM!</small>
            </button>

            <button
              onClick={() => movePiece(1)}
              disabled={status !== "playing"}
              aria-label="Move right"
            >
              <span aria-hidden="true">→</span>
              <small>RIGHT</small>
            </button>
          </div>

          <div className="sdm-footer-note">
            <span>♡</span> Made for dumpling lovers <span>♡</span>
          </div>
        </section>

        <section className="sdm-how-section">
          <h2>How to play</h2>
          <div className="sdm-how-grid">
            <article>
              <span className="sdm-how-number">01</span>
              <h3>Stack your bao</h3>
              <p>Move each falling trio into the spot you want.</p>
            </article>

            <article>
              <span className="sdm-how-number">02</span>
              <h3>Match the cuties</h3>
              <p>
                Line up three or more matching dumplings across, down or
                diagonally.
              </p>
            </article>

            <article>
              <span className="sdm-how-number">03</span>
              <h3>Chain the squish</h3>
              <p>
                Cascades earn extra points. Golden Bao give bonus points, and
                Rainbow Bao can clear an entire colour when matched.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
