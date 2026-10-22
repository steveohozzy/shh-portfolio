
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";
import {
  squishyDumplingMatchAuth,
  squishyDumplingMatchDb,
} from "@/lib/firebase";
import DumplingTile, { type BaoType } from "../DumplingTile";
import "./squishy-dumpling-levels.css";

type Cell = BaoType | null;
type Board = Cell[][];
type SavedLevels = Record<string, number>;
type Screen = "world" | "zone" | "game";
type GameStatus = "playing" | "won" | "lost";
type SpecialAbility = "row" | "column" | "burst" | "cross" | "rainbow";
type Specials = Record<string, SpecialAbility>;

type ZoneConfig = {
  name: string;
  description: string;
  landmark: string;
  emoji: string;
  theme: string;
  types: BaoType[];
};

type LevelConfig = {
  name: string;
  goal: number;
  moves: number;
  types: BaoType[];
  ability: SpecialAbility;
};

const SIZE = 7;
const LEVEL_COUNT = 50;
const LEVELS_PER_ZONE = 10;
const MAX_CASCADES = 30;

const ZONES: ZoneConfig[] = [
  {
    name: "Cloud Garden",
    description: "Float through cotton-candy clouds, sky bridges and sleepy bao cottages.",
    landmark: "The Great Bao Picnic",
    emoji: "☁️",
    theme: "cloud",
    types: ["classic", "strawberry", "matcha", "blueberry", "lavender"],
  },
  {
    name: "Strawberry Valley",
    description: "Explore berry forests, pink rivers and the Strawberry Castle.",
    landmark: "Strawberry Castle",
    emoji: "🍓",
    theme: "berry",
    types: ["classic", "strawberry", "matcha", "blueberry", "lavender", "peach"],
  },
  {
    name: "Matcha Meadow",
    description: "Wind through bamboo groves, tea terraces and hidden temples.",
    landmark: "The Matcha Temple",
    emoji: "🍵",
    theme: "matcha",
    types: ["classic", "strawberry", "matcha", "blueberry", "lavender", "peach", "golden"],
  },
  {
    name: "Honey Kingdom",
    description: "Cross honey rivers, golden bridges and the sticky palace gardens.",
    landmark: "The Golden Bao Palace",
    emoji: "🍯",
    theme: "honey",
    types: ["classic", "strawberry", "matcha", "blueberry", "lavender", "peach", "golden", "rainbow"],
  },
  {
    name: "Rainbow Palace",
    description: "Master tricky matches beneath crystal waterfalls and rainbow towers.",
    landmark: "The Dumpling Crown",
    emoji: "🌈",
    theme: "rainbow",
    types: ["classic", "strawberry", "matcha", "blueberry", "lavender", "peach", "golden", "rainbow"],
  },
];

const LEVEL_NAMES = [
  "A Little Beginning",
  "Dumpling Dots",
  "Sweet Swaps",
  "Cloud Nine",
  "A Bao-tiful Day",
  "Little Match Magic",
  "Fluffy Friends",
  "Sweet Streak",
  "Starry Squish",
  "The Big Picnic",
];

const LEVELS: LevelConfig[] = ZONES.flatMap((zone, zoneIndex) =>
  Array.from({ length: LEVELS_PER_ZONE }, (_, index) => ({
    name: index === 9 ? zone.landmark : LEVEL_NAMES[index],
    goal:
      55 +
      zoneIndex * 12 +
      index * 5 +
      (index === 9 ? 15 : 0),
    moves: Math.max(
      10,
      15 - zoneIndex - Math.floor(index / 2),
    ),
    types: zone.types,
    ability: (
      ["row", "burst", "column", "cross", "rainbow"] as SpecialAbility[]
    )[zoneIndex],
  })),
);

const ABILITY_NAMES: Record<SpecialAbility, string> = {
  row: "Cloud Sweep",
  column: "Bamboo Beam",
  burst: "Berry Burst",
  cross: "Honey Cross",
  rainbow: "Rainbow Blast",
};

const ABILITY_EMOJIS: Record<SpecialAbility, string> = {
  row: "☁️",
  column: "🎋",
  burst: "💥",
  cross: "🍯",
  rainbow: "🌈",
};

function randomType(types: BaoType[]): BaoType {
  return types[Math.floor(Math.random() * types.length)];
}

function createBoard(types: BaoType[]): Board {
  for (let attempt = 0; attempt < 20; attempt++) {
    const board: Board = [];

    for (let row = 0; row < SIZE; row++) {
      const nextRow: Cell[] = [];

      for (let col = 0; col < SIZE; col++) {
        let type = randomType(types);
        let tries = 0;

        while (
          tries < 30 &&
          (
            (col >= 2 &&
              nextRow[col - 1] === type &&
              nextRow[col - 2] === type) ||
            (row >= 2 &&
              board[row - 1][col] === type &&
              board[row - 2][col] === type)
          )
        ) {
          type = randomType(types);
          tries++;
        }

        nextRow.push(type);
      }

      board.push(nextRow);
    }

    if (hasPossibleMove(board)) return board;
  }

  const fallback: Board = [];
  for (let row = 0; row < SIZE; row++) {
    fallback.push(
      Array.from({ length: SIZE }, (_, col) =>
        types[(row + col * 2) % types.length],
      ),
    );
  }

  return fallback;
}

function findMatches(board: Board): Set<string> {
  const matches = new Set<string>();

  for (let row = 0; row < SIZE; row++) {
    let start = 0;

    while (start < SIZE) {
      const type = board[row][start];

      if (!type) {
        start++;
        continue;
      }

      let end = start + 1;
      while (end < SIZE && board[row][end] === type) end++;

      if (end - start >= 3) {
        for (let col = start; col < end; col++) {
          matches.add(`${row},${col}`);
        }
      }

      start = end;
    }
  }

  for (let col = 0; col < SIZE; col++) {
    let start = 0;

    while (start < SIZE) {
      const type = board[start][col];

      if (!type) {
        start++;
        continue;
      }

      let end = start + 1;
      while (end < SIZE && board[end][col] === type) end++;

      if (end - start >= 3) {
        for (let row = start; row < end; row++) {
          matches.add(`${row},${col}`);
        }
      }

      start = end;
    }
  }

  return matches;
}

function hasPossibleMove(board: Board): boolean {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (col + 1 < SIZE) {
        const swapped = swapCells(
          board,
          `${row},${col}`,
          `${row},${col + 1}`,
        );

        if (findMatches(swapped).size > 0) return true;
      }

      if (row + 1 < SIZE) {
        const swapped = swapCells(
          board,
          `${row},${col}`,
          `${row + 1},${col}`,
        );

        if (findMatches(swapped).size > 0) return true;
      }
    }
  }

  return false;
}

function swapCells(board: Board, first: string, second: string): Board {
  const next = board.map((row) => [...row]);
  const [firstRow, firstCol] = first.split(",").map(Number);
  const [secondRow, secondCol] = second.split(",").map(Number);

  const value = next[firstRow][firstCol];
  next[firstRow][firstCol] = next[secondRow][secondCol];
  next[secondRow][secondCol] = value;

  return next;
}

function isAdjacent(first: string, second: string): boolean {
  const [firstRow, firstCol] = first.split(",").map(Number);
  const [secondRow, secondCol] = second.split(",").map(Number);

  return (
    Math.abs(firstRow - secondRow) +
      Math.abs(firstCol - secondCol) ===
    1
  );
}

function getRuns(board: Board) {
  const runs: {
    cells: string[];
    length: number;
    direction: "row" | "column";
  }[] = [];

  for (let row = 0; row < SIZE; row++) {
    let start = 0;

    while (start < SIZE) {
      const type = board[row][start];

      if (!type) {
        start++;
        continue;
      }

      let end = start + 1;
      while (end < SIZE && board[row][end] === type) end++;

      if (end - start >= 3) {
        runs.push({
          cells: Array.from(
            { length: end - start },
            (_, i) => `${row},${start + i}`,
          ),
          length: end - start,
          direction: "row",
        });
      }

      start = end;
    }
  }

  for (let col = 0; col < SIZE; col++) {
    let start = 0;

    while (start < SIZE) {
      const type = board[start][col];

      if (!type) {
        start++;
        continue;
      }

      let end = start + 1;
      while (end < SIZE && board[end][col] === type) end++;

      if (end - start >= 3) {
        runs.push({
          cells: Array.from(
            { length: end - start },
            (_, i) => `${start + i},${col}`,
          ),
          length: end - start,
          direction: "column",
        });
      }

      start = end;
    }
  }

  return runs;
}

function getSpecialCandidates(board: Board, matches: Set<string>) {
  const runs = getRuns(board).filter((run) =>
    run.cells.some((cell) => matches.has(cell)),
  );

  const rowCells = new Set(
    runs
      .filter((run) => run.direction === "row")
      .flatMap((run) => run.cells),
  );

  const columnCells = new Set(
    runs
      .filter((run) => run.direction === "column")
      .flatMap((run) => run.cells),
  );

  const intersections = [...rowCells].filter((cell) =>
    columnCells.has(cell),
  );

  if (intersections.length) {
    return {
      cell: intersections[0],
      ability: "burst" as SpecialAbility,
    };
  }

  const fiveRun = runs.find((run) => run.length >= 5);

  if (fiveRun) {
    return {
      cell: fiveRun.cells[Math.floor(fiveRun.cells.length / 2)],
      ability: "rainbow" as SpecialAbility,
    };
  }

  const fourRun = runs.find((run) => run.length === 4);

  if (fourRun) {
    return {
      cell: fourRun.cells[Math.floor(fourRun.cells.length / 2)],
      ability: fourRun.direction as SpecialAbility,
    };
  }

  return null;
}

function getAbilityCells(
  ability: SpecialAbility,
  row: number,
  col: number,
): string[] {
  const cells: string[] = [];
  const radius = 1;

  if (ability === "row" || ability === "cross") {
    for (let c = 0; c < SIZE; c++) cells.push(`${row},${c}`);
  }

  if (ability === "column" || ability === "cross") {
    for (let r = 0; r < SIZE; r++) cells.push(`${r},${col}`);
  }

  if (ability === "burst" || ability === "rainbow") {
    for (
      let r = Math.max(0, row - radius);
      r <= Math.min(SIZE - 1, row + radius);
      r++
    ) {
      for (
        let c = Math.max(0, col - radius);
        c <= Math.min(SIZE - 1, col + radius);
        c++
      ) {
        cells.push(`${r},${c}`);
      }
    }
  }

  return [...new Set(cells)];
}

function collapseBoard(
  board: Board,
  specials: Specials,
  types: BaoType[],
) {
  const nextBoard: Board = Array.from(
    { length: SIZE },
    () => Array<Cell>(SIZE).fill(null),
  );
  const nextSpecials: Specials = {};

  for (let col = 0; col < SIZE; col++) {
    const remaining: {
      type: BaoType;
      ability?: SpecialAbility;
    }[] = [];

    for (let row = SIZE - 1; row >= 0; row--) {
      const type = board[row][col];

      if (type) {
        remaining.push({
          type,
          ability: specials[`${row},${col}`],
        });
      }
    }

    while (remaining.length < SIZE) {
      remaining.push({ type: randomType(types) });
    }

    for (let row = SIZE - 1; row >= 0; row--) {
      const tile = remaining[SIZE - 1 - row];
      nextBoard[row][col] = tile.type;

      if (tile.ability) {
        nextSpecials[`${row},${col}`] = tile.ability;
      }
    }
  }

  return { board: nextBoard, specials: nextSpecials };
}

function resolveBoard(
  initialBoard: Board,
  initialSpecials: Specials,
  types: BaoType[],
  initialClear: string[] = [],
) {
  let board = initialBoard.map((row) => [...row]);
  let specials = { ...initialSpecials };
  let cleared = 0;
  let cascadeCount = 0;
  let bonusPoints = 0;
  let pendingClear = new Set(initialClear);

  for (let round = 0; round < MAX_CASCADES; round++) {
    const matches = findMatches(board);

    if (matches.size === 0 && pendingClear.size === 0) break;

    const candidate = matches.size
      ? getSpecialCandidates(board, matches)
      : null;

    const clearSet = new Set<string>([
      ...matches,
      ...pendingClear,
    ]);

    pendingClear = new Set<string>();

    if (candidate && matches.has(candidate.cell)) {
      clearSet.delete(candidate.cell);
      specials[candidate.cell] = candidate.ability;
    }

    const activated = new Set<string>();
    const queue = [...clearSet];

    while (queue.length) {
      const key = queue.pop()!;
      const ability = specials[key];

      if (!ability || activated.has(key)) continue;

      activated.add(key);
      const [row, col] = key.split(",").map(Number);

      getAbilityCells(ability, row, col).forEach((cell) => {
        if (!clearSet.has(cell)) {
          clearSet.add(cell);
          queue.push(cell);
        }
      });

      bonusPoints += ability === "rainbow" ? 6 : 3;
    }

    clearSet.forEach((key) => {
      const [row, col] = key.split(",").map(Number);

      if (board[row]?.[col]) {
        board[row][col] = null;
        cleared++;
      }

      delete specials[key];
    });

    cascadeCount++;

    const collapsed = collapseBoard(board, specials, types);
    board = collapsed.board;
    specials = collapsed.specials;
  }

  return {
    board,
    specials,
    cleared,
    cascadeCount,
    points: cleared + bonusPoints,
  };
}

function getStars(movesLeft: number, totalMoves: number): number {
  const remaining = movesLeft / totalMoves;

  if (remaining >= 0.5) return 3;
  if (remaining >= 0.25) return 2;

  return 1;
}

function getZoneIndex(levelNumber: number): number {
  return Math.min(
    ZONES.length - 1,
    Math.floor((levelNumber - 1) / LEVELS_PER_ZONE),
  );
}

export default function SquishyDumplingLevels() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [savedLevels, setSavedLevels] = useState<SavedLevels>({});
  const [screen, setScreen] = useState<Screen>("world");
  const [selectedZone, setSelectedZone] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [board, setBoard] = useState<Board>([]);
  const [specials, setSpecials] = useState<Specials>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(0);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [busy, setBusy] = useState(false);
  const [animatedCells, setAnimatedCells] = useState<string[]>([]);
  const [animationType, setAnimationType] = useState<
    "swap" | "invalid" | "pop" | ""
  >("");
  const [specialCharges, setSpecialCharges] = useState(0);
  const [lastCascade, setLastCascade] = useState(0);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(
      squishyDumplingMatchAuth,
      async (currentUser) => {
        if (!active) return;

        if (currentUser) {
          setUser(currentUser);
          setAuthReady(true);
          return;
        }

        try {
          await signInAnonymously(squishyDumplingMatchAuth);
        } catch {
          if (active) {
            setSaveMessage(
              "Couldn't start your guest profile. Please refresh and try again.",
            );
            setAuthReady(true);
          }
        }
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadProgress() {
      try {
        const progressRef = doc(
          squishyDumplingMatchDb,
          "sdm-level-progress",
          user!.uid,
        );
        const snapshot = await getDoc(progressRef);

        if (!active || !snapshot.exists()) return;

        const data = snapshot.data();
        const rawUnlocked = Number(data.unlockedLevel) || 1;
        const rawLevels =
          data.levels && typeof data.levels === "object"
            ? (data.levels as Record<string, unknown>)
            : {};
        const safeLevels: SavedLevels = {};

        Object.entries(rawLevels).forEach(([key, value]) => {
          const levelNumber = Number(key);
          const stars = Number(value);

          if (
            Number.isInteger(levelNumber) &&
            levelNumber >= 1 &&
            levelNumber <= LEVEL_COUNT &&
            Number.isInteger(stars) &&
            stars >= 1 &&
            stars <= 3
          ) {
            safeLevels[key] = stars;
          }
        });

        setUnlockedLevel(Math.max(1, Math.min(LEVEL_COUNT, rawUnlocked)));
        setSavedLevels(safeLevels);
      } catch {
        if (active) {
          setSaveMessage(
            "Your progress couldn't be loaded. You can still try the levels.",
          );
        }
      }
    }

    void loadProgress();

    return () => {
      active = false;
    };
  }, [user]);

  const saveProgress = useCallback(
    async (nextUnlocked: number, nextLevels: SavedLevels) => {
      if (!user) {
        setSaveMessage("Your guest profile isn't ready yet.");
        return;
      }

      setSaving(true);
      setSaveMessage("");

      try {
        await setDoc(
          doc(squishyDumplingMatchDb, "sdm-level-progress", user.uid),
          {
            unlockedLevel: nextUnlocked,
            levels: nextLevels,
            updatedAt: serverTimestamp(),
          },
        );

        setSaveMessage("Progress saved!");
      } catch {
        setSaveMessage(
          "Couldn't save progress. Check your connection and try again.",
        );
      } finally {
        setSaving(false);
      }
    },
    [user],
  );

  const startLevel = useCallback(
    (levelNumber: number) => {
      if (
        levelNumber > unlockedLevel ||
        levelNumber < 1 ||
        levelNumber > LEVEL_COUNT
      ) {
        return;
      }

      const config = LEVELS[levelNumber - 1];

      setSelectedLevel(levelNumber);
      setSelectedZone(getZoneIndex(levelNumber));
      setBoard(createBoard(config.types));
      setSpecials({});
      setSelectedCell(null);
      setScore(0);
      setMovesLeft(config.moves);
      setStatus("playing");
      setBusy(false);
      setAnimatedCells([]);
      setAnimationType("");
      setSaveMessage("");
      setSpecialCharges(0);
      setLastCascade(0);
      setScreen("game");
    },
    [unlockedLevel],
  );

  const returnToZone = useCallback(() => {
    setScreen("zone");
    setSelectedLevel(null);
    setSelectedCell(null);
    setBusy(false);
    setAnimatedCells([]);
    setAnimationType("");
  }, []);

  const finishLevel = useCallback(
    async (won: boolean, levelNumber: number, finalMoves: number) => {
      setStatus(won ? "won" : "lost");

      if (!won) return;

      const stars = getStars(finalMoves, LEVELS[levelNumber - 1].moves);
      const key = String(levelNumber);
      const nextLevels = {
        ...savedLevels,
        [key]: Math.max(savedLevels[key] || 0, stars),
      };
      const nextUnlocked = Math.min(
        LEVEL_COUNT,
        Math.max(unlockedLevel, levelNumber + 1),
      );

      setSavedLevels(nextLevels);
      setUnlockedLevel(nextUnlocked);
      await saveProgress(nextUnlocked, nextLevels);
    },
    [savedLevels, unlockedLevel, saveProgress],
  );

  const completeMove = useCallback(
    async (
      result: ReturnType<typeof resolveBoard>,
      nextMoves: number,
      levelNumber: number,
      config: LevelConfig,
    ) => {
      const nextScore = score + result.points;
      const earnedCharges = Math.floor(result.cleared / 12);
      const nextCharges = Math.min(3, specialCharges + earnedCharges);

      setBoard(result.board);
      setSpecials(result.specials);
      setScore(nextScore);
      setMovesLeft(nextMoves);
      setSpecialCharges(nextCharges);
      setLastCascade(result.cascadeCount);
      setAnimatedCells([]);
      setAnimationType("");

      if (nextScore >= config.goal) {
        await finishLevel(true, levelNumber, nextMoves);
      } else if (nextMoves <= 0) {
        await finishLevel(false, levelNumber, nextMoves);
      } else if (!hasPossibleMove(result.board)) {
        const refreshed = createBoard(config.types);
        setBoard(refreshed);
        setSpecials({});
      }

      setBusy(false);
    },
    [score, specialCharges, finishLevel],
  );

  const handleCellClick = async (row: number, col: number) => {
    if (
      selectedLevel === null ||
      status !== "playing" ||
      busy ||
      !board.length
    ) {
      return;
    }

    const key = `${row},${col}`;

    if (!selectedCell) {
      setSelectedCell(key);
      return;
    }

    if (selectedCell === key) {
      setSelectedCell(null);
      return;
    }

    if (!isAdjacent(selectedCell, key)) {
      setSelectedCell(key);
      return;
    }

    const config = LEVELS[selectedLevel - 1];
    const originalBoard = board.map((line) => [...line]);
    const swapped = swapCells(originalBoard, selectedCell, key);
    const nextSpecials = { ...specials };

    const firstAbility = nextSpecials[selectedCell];
    const secondAbility = nextSpecials[key];
    const activatedAbility = firstAbility || secondAbility;

    setSelectedCell(null);
    setBusy(true);
    setAnimationType("swap");
    setAnimatedCells([selectedCell, key]);
    setBoard(swapped);

    if (activatedAbility) {
      const specialKey = firstAbility ? selectedCell : key;
      const [specialRow, specialCol] = specialKey.split(",").map(Number);
      const otherKey = specialKey === selectedCell ? key : selectedCell;
      const [otherRow, otherCol] = otherKey.split(",").map(Number);
      const otherType = swapped[otherRow][otherCol];
      let cells = getAbilityCells(
        activatedAbility,
        specialRow,
        specialCol,
      );

      if (activatedAbility === "rainbow" && otherType) {
        cells = swapped.flatMap((line, r) =>
          line.flatMap((type, c) =>
            type === otherType ? [`${r},${c}`] : [],
          ),
        );
      }

      delete nextSpecials[selectedCell];
      delete nextSpecials[key];

      const result = resolveBoard(
        swapped,
        nextSpecials,
        config.types,
        cells,
      );
      const nextMoves = movesLeft - 1;

      setAnimationType("pop");
      setAnimatedCells(cells);

      window.setTimeout(() => {
        void completeMove(result, nextMoves, selectedLevel, config);
      }, 300);

      return;
    }

    const matches = findMatches(swapped);

    if (matches.size === 0) {
      window.setTimeout(() => setAnimationType("invalid"), 120);

      window.setTimeout(() => {
        setBoard(originalBoard);
        setAnimatedCells([]);
        setAnimationType("");
        setBusy(false);
      }, 420);

      return;
    }

    const result = resolveBoard(swapped, nextSpecials, config.types);
    const nextMoves = movesLeft - 1;

    setAnimationType("pop");
    setAnimatedCells(Array.from(matches));

    window.setTimeout(() => {
      void completeMove(result, nextMoves, selectedLevel, config);
    }, 300);
  };

  const usePower = useCallback(() => {
    if (
      selectedLevel === null ||
      !selectedCell ||
      specialCharges < 1 ||
      busy ||
      status !== "playing"
    ) {
      return;
    }

    const config = LEVELS[selectedLevel - 1];
    const [row, col] = selectedCell.split(",").map(Number);
    const cells = getAbilityCells(config.ability, row, col);
    const result = resolveBoard(board, specials, config.types, cells);
    const nextMoves = movesLeft - 1;

    setBusy(true);
    setSelectedCell(null);
    setSpecialCharges((current) => Math.max(0, current - 1));
    setAnimationType("pop");
    setAnimatedCells(cells);

    window.setTimeout(() => {
      void completeMove(result, nextMoves, selectedLevel, config);
    }, 300);
  }, [
    selectedLevel,
    selectedCell,
    specialCharges,
    busy,
    status,
    board,
    specials,
    movesLeft,
    completeMove,
  ]);

  const openZone = (zoneIndex: number) => {
    const firstLevel = zoneIndex * LEVELS_PER_ZONE + 1;

    if (firstLevel > unlockedLevel) return;

    setSelectedZone(zoneIndex);
    setScreen("zone");
  };

  const activeConfig =
    selectedLevel !== null ? LEVELS[selectedLevel - 1] : null;
  const activeZone =
    selectedLevel !== null
      ? ZONES[getZoneIndex(selectedLevel)]
      : ZONES[selectedZone];

  const totalStars = Object.values(savedLevels).reduce(
    (total, stars) => total + stars,
    0,
  );
  const completedCount = Object.keys(savedLevels).length;

  return (
    <main className={`sdml-page sdml-world--${activeZone.theme}`}>
      <div className="sdml-shell">
        <header className="sdml-header">
          <Link className="sdml-back-link" href="/squishy-dumpling-match">
            <span aria-hidden="true">←</span> Squishy Dumpling Club
          </Link>

          <p className="sdml-eyebrow">YOUR LITTLE ADVENTURE</p>
          <h1>Dumpling <span>World</span></h1>
          <p className="sdml-intro">
            Explore five magical lands, master tricky matches and collect
            stars on your way to the Dumpling Crown.
          </p>

          <div className="sdml-world-stats">
            <div>
              <span>LEVELS</span>
              <strong>{completedCount} / {LEVEL_COUNT}</strong>
            </div>
            <div>
              <span>STARS</span>
              <strong>{totalStars} ✦</strong>
            </div>
            <div>
              <span>WORLD</span>
              <strong>{getZoneIndex(unlockedLevel) + 1} / {ZONES.length}</strong>
            </div>
          </div>
        </header>

        {!authReady && (
          <div className="sdml-notice" role="status">
            Getting your little guest profile ready…
          </div>
        )}

        {saveMessage && (
          <p className="sdml-save-message" role="status">
            {saving ? "Saving your progress…" : saveMessage}
          </p>
        )}

        {screen === "world" && (
          <section className="sdml-map sdml-world-overview">
            <div className="sdml-map-heading">
              <div>
                <span className="sdml-section-kicker">THE WORLD MAP</span>
                <h2>Choose your next adventure</h2>
              </div>
              <span className="sdml-map-decoration" aria-hidden="true">✦</span>
            </div>

            <div className="sdml-zone-list">
              {ZONES.map((zone, index) => {
                const firstLevel = index * LEVELS_PER_ZONE + 1;
                const lastLevel = firstLevel + LEVELS_PER_ZONE - 1;
                const isUnlocked = firstLevel <= unlockedLevel;
                const isComplete = lastLevel < unlockedLevel;
                const zoneStars = Array.from(
                  { length: LEVELS_PER_ZONE },
                  (_, i) => savedLevels[String(firstLevel + i)] || 0,
                ).reduce((total, stars) => total + stars, 0);

                return (
                  <button
                    type="button"
                    key={zone.name}
                    className={`sdml-zone-card sdml-zone-card--${zone.theme} ${isUnlocked ? "sdml-zone-card--unlocked" : ""} ${isComplete ? "sdml-zone-card--complete" : ""}`}
                    disabled={!isUnlocked}
                    onClick={() => openZone(index)}
                  >
                    <span className="sdml-zone-illustration" aria-hidden="true">
                      <span className="sdml-zone-sun">{zone.emoji}</span>
                      <span className="sdml-zone-cloud sdml-zone-cloud--one">☁</span>
                      <span className="sdml-zone-cloud sdml-zone-cloud--two">☁</span>
                      <span className="sdml-zone-hill sdml-zone-hill--one" />
                      <span className="sdml-zone-hill sdml-zone-hill--two" />
                      <span className="sdml-zone-landmark">
                        {isUnlocked ? "✦" : "🔒"}
                      </span>
                    </span>

                    <span className="sdml-zone-copy">
                      <span className="sdml-zone-range">
                        ZONE {index + 1} · LEVELS {firstLevel}–{lastLevel}
                      </span>
                      <strong>{zone.name}</strong>
                      <span>{zone.description}</span>
                      <span className="sdml-zone-progress">
                        {isComplete
                          ? "Zone complete!"
                          : isUnlocked
                            ? `Next up: Level ${Math.max(firstLevel, unlockedLevel)}`
                            : "Complete the previous zone to unlock"}
                      </span>
                      <span className="sdml-level-stars" aria-label={`${zoneStars} stars earned`}>
                        {"★".repeat(Math.min(30, zoneStars))}
                        <span>{"☆".repeat(Math.max(0, 30 - zoneStars))}</span>
                      </span>
                    </span>

                    <span className="sdml-zone-arrow" aria-hidden="true">
                      {isUnlocked ? "↗" : "🔒"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="sdml-map-footer">
              <span aria-hidden="true">♡</span>
              <p>Five magical lands. Fifty increasingly tricky adventures.</p>
              <span aria-hidden="true">♡</span>
            </div>
          </section>
        )}

        {screen === "zone" && (
          <section className={`sdml-map sdml-zone-map sdml-zone-map--${ZONES[selectedZone].theme}`}>
            <div className="sdml-zone-map-hero">
              <button
                type="button"
                className="sdml-text-button"
                onClick={() => setScreen("world")}
              >
                ← World map
              </button>
              <span className="sdml-zone-hero-emoji" aria-hidden="true">
                {ZONES[selectedZone].emoji}
              </span>
              <p className="sdml-section-kicker">
                ZONE {selectedZone + 1} OF 5
              </p>
              <h2>{ZONES[selectedZone].name}</h2>
              <p>{ZONES[selectedZone].description}</p>
              <div className="sdml-zone-map-progress">
                <span>
                  {Array.from({ length: LEVELS_PER_ZONE }, (_, i) => {
                    const level = selectedZone * LEVELS_PER_ZONE + i + 1;
                    return savedLevels[String(level)] ? "★" : "☆";
                  }).join(" ")}
                </span>
                <span>
                  {Math.min(
                    LEVELS_PER_ZONE,
                    Math.max(
                      0,
                      unlockedLevel - selectedZone * LEVELS_PER_ZONE - 1,
                    ),
                  )} / 10 complete
                </span>
              </div>
            </div>

            <div className="sdml-zone-landscape">
              
<div className={`sdml-map-sky sdml-map-sky--${ZONES[selectedZone].theme}`} aria-hidden="true">
  {selectedZone === 0 && (
    <>
      <span className="sdml-landmark sdml-landmark--cloud-cottage">🏡<small>Cloud Cottage</small></span>
      <span className="sdml-landmark sdml-landmark--windmill">🌬️<small>Windmill Hill</small></span>
      <span className="sdml-landmark sdml-landmark--cloud-castle">🏰<small>Cloud Castle</small></span>
      <span className="sdml-landmark sdml-landmark--sky-garden">🌷<small>Sky Garden</small></span>
      <span className="sdml-landmark sdml-landmark--floating-island">☁️</span>
      <span className="sdml-landmark sdml-landmark--floating-island-two">☁️</span>
    </>
  )}

  {selectedZone === 1 && (
    <>
      <span className="sdml-landmark sdml-landmark--berry-cottage">🏠<small>Berry Cottage</small></span>
      <span className="sdml-landmark sdml-landmark--giant-berry">🍓<small>Berry Fields</small></span>
      <span className="sdml-landmark sdml-landmark--jam-factory">🏭<small>Jam Factory</small></span>
      <span className="sdml-landmark sdml-landmark--strawberry-castle">🏰<small>Strawberry Castle</small></span>
      <span className="sdml-landmark sdml-landmark--berry-bush">🫐</span>
      <span className="sdml-landmark sdml-landmark--berry-bush-two">🍄</span>
    </>
  )}

  {selectedZone === 2 && (
    <>
      <span className="sdml-landmark sdml-landmark--tea-house">🏯<small>Tea House</small></span>
      <span className="sdml-landmark sdml-landmark--bamboo">🎋<small>Bamboo Grove</small></span>
      <span className="sdml-landmark sdml-landmark--matcha-temple">⛩️<small>Matcha Temple</small></span>
      <span className="sdml-landmark sdml-landmark--tea-garden">🍵<small>Tea Garden</small></span>
      <span className="sdml-landmark sdml-landmark--bamboo-two">🎋</span>
      <span className="sdml-landmark sdml-landmark--stone-lantern">🏮</span>
    </>
  )}

  {selectedZone === 3 && (
    <>
      <span className="sdml-landmark sdml-landmark--hive">🐝<small>Honey Hive</small></span>
      <span className="sdml-landmark sdml-landmark--honey-pot">🍯<small>Honey Falls</small></span>
      <span className="sdml-landmark sdml-landmark--golden-bridge">🌉<small>Golden Bridge</small></span>
      <span className="sdml-landmark sdml-landmark--honey-palace">🏰<small>Golden Bao Palace</small></span>
      <span className="sdml-landmark sdml-landmark--sunflower">🌻</span>
      <span className="sdml-landmark sdml-landmark--sunflower-two">🌼</span>
    </>
  )}

  {selectedZone === 4 && (
    <>
      <span className="sdml-landmark sdml-landmark--crystal">💎<small>Crystal Cave</small></span>
      <span className="sdml-landmark sdml-landmark--rainbow-bridge">🌈<small>Rainbow Bridge</small></span>
      <span className="sdml-landmark sdml-landmark--waterfall">💦<small>Crystal Falls</small></span>
      <span className="sdml-landmark sdml-landmark--rainbow-palace">🏰<small>Rainbow Palace</small></span>
      <span className="sdml-landmark sdml-landmark--crystal-two">🔮</span>
      <span className="sdml-landmark sdml-landmark--rainbow-flower">🌺</span>
    </>
  )}
</div>

              <svg
                className="sdml-winding-path"
                viewBox="0 0 340 940"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M170 45 C290 75 290 125 170 150 S45 220 170 255 S295 325 170 360 S45 430 170 465 S295 535 170 570 S45 640 170 675 S295 745 170 780 S90 845 170 900"
                  fill="none"
                  stroke="rgba(255,255,255,.92)"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                <path
                  d="M170 45 C290 75 290 125 170 150 S45 220 170 255 S295 325 170 360 S45 430 170 465 S295 535 170 570 S45 640 170 675 S295 745 170 780 S90 845 170 900"
                  fill="none"
                  stroke="rgba(134,111,127,.4)"
                  strokeWidth="3"
                  strokeDasharray="5 10"
                  strokeLinecap="round"
                />
              </svg>

              <div className="sdml-map-levels">
                {LEVELS.slice(
                  selectedZone * LEVELS_PER_ZONE,
                  selectedZone * LEVELS_PER_ZONE + LEVELS_PER_ZONE,
                ).map((level, index) => {
                  const levelNumber = selectedZone * LEVELS_PER_ZONE + index + 1;
                  const isUnlocked = levelNumber <= unlockedLevel;
                  const stars = savedLevels[String(levelNumber)] || 0;
                  const side = index % 2 === 0 ? "left" : "right";

                  return (
                    <button
                      type="button"
                      key={levelNumber}
                      className={`sdml-map-node sdml-map-node--${side} ${isUnlocked ? "sdml-map-node--unlocked" : ""} ${stars ? "sdml-map-node--complete" : ""} ${levelNumber === unlockedLevel ? "sdml-map-node--current" : ""}`}
                      style={{ top: `${index * 9.85 + 1}%` }}
                      disabled={!isUnlocked}
                      onClick={() => startLevel(levelNumber)}
                      aria-label={
                        isUnlocked
                          ? `Play level ${levelNumber}: ${level.name}`
                          : `Level ${levelNumber} locked`
                      }
                    >
                      <span className="sdml-map-node-number">
                        {isUnlocked ? levelNumber : "🔒"}
                      </span>
                      <span className="sdml-map-node-stars">
                        {"★".repeat(stars)}
                        <span>{"☆".repeat(3 - stars)}</span>
                      </span>
                      <span className="sdml-map-node-label">
                        {levelNumber % 10 === 0
                          ? ZONES[selectedZone].landmark
                          : level.name}
                      </span>
                    </button>
                  );
                })}

                <div className="sdml-map-finish">
                  <span aria-hidden="true">{ZONES[selectedZone].emoji}</span>
                  <strong>{ZONES[selectedZone].landmark}</strong>
                  <span>ZONE LANDMARK</span>
                </div>
              </div>
            </div>

            <div className="sdml-zone-map-footer">
              {selectedZone > 0 && (
                <button
                  type="button"
                  className="sdml-secondary-button"
                  onClick={() => setSelectedZone(selectedZone - 1)}
                >
                  ← Previous zone
                </button>
              )}
              {selectedZone < ZONES.length - 1 && (
                <button
                  type="button"
                  className="sdml-primary-button"
                  disabled={
                    unlockedLevel <
                    (selectedZone + 1) * LEVELS_PER_ZONE + 1
                  }
                  onClick={() => openZone(selectedZone + 1)}
                >
                  Next zone →
                </button>
              )}
            </div>
          </section>
        )}

        {screen === "game" && activeConfig && selectedLevel !== null && (
          <section className="sdml-game" aria-label={`Level ${selectedLevel}`}>
            <div className="sdml-game-heading">
              <button
                type="button"
                className="sdml-text-button"
                onClick={returnToZone}
              >
                ← Zone map
              </button>
              <span className="sdml-level-pill">
                LEVEL {String(selectedLevel).padStart(2, "0")} / 50
              </span>
              <button
                type="button"
                className="sdml-text-button"
                onClick={() => startLevel(selectedLevel)}
              >
                ↻ Restart
              </button>
            </div>

            <div className="sdml-level-title">
              <p>{activeZone.emoji} {activeZone.name}</p>
              <h2>{activeConfig.name}</h2>
            </div>

            <div className="sdml-game-stats">
              <div>
                <span>YOUR SCORE</span>
                <strong>{score}</strong>
              </div>
              <div className="sdml-goal-stat">
                <span>BAO GOAL</span>
                <strong>{score} / {activeConfig.goal}</strong>
              </div>
              <div>
                <span>MOVES LEFT</span>
                <strong>{movesLeft}</strong>
              </div>
            </div>

            <div
              className="sdml-goal-track"
              role="progressbar"
              aria-label="Level goal"
              aria-valuemin={0}
              aria-valuemax={activeConfig.goal}
              aria-valuenow={Math.min(score, activeConfig.goal)}
            >
              <span
                style={{
                  width: `${Math.min(100, (score / activeConfig.goal) * 100)}%`,
                }}
              />
            </div>

            <p className="sdml-game-hint">
              Match 3 to clear. Match 4 to create a line power-up, match 5
              for a rainbow, or make an L/T shape for a blast. Swap a
              power-up to activate it. Invalid swaps cost no moves.
            </p>

            <div className="sdml-ability-panel">
              <div className="sdml-ability-copy">
                <span className="sdml-section-kicker">WORLD POWER</span>
                <strong>
                  {ABILITY_EMOJIS[activeConfig.ability]}{" "}
                  {ABILITY_NAMES[activeConfig.ability]}
                </strong>
                <span>
                  {specialCharges > 0
                    ? selectedCell
                      ? "Target selected. Use your power!"
                      : "Select a tile to choose where to unleash it."
                    : "Clear 8 or more dumplings in a turn to earn a charge."}
                </span>
              </div>

              <button
                type="button"
                className="sdml-ability-button"
                disabled={
                  status !== "playing" ||
                  busy ||
                  specialCharges < 1 ||
                  !selectedCell
                }
                onClick={usePower}
              >
                <span aria-hidden="true">✦</span>
                USE POWER
                <span className="sdml-ability-count">{specialCharges}/3</span>
              </button>
            </div>

            <div className="sdml-special-legend" aria-label="Power-up guide">
              <span>↔ 4 in a row: line</span>
              <span>✦ 5 in a row: rainbow</span>
              <span>✹ L/T match: blast</span>
            </div>

            {lastCascade > 1 && (
              <p className="sdml-cascade-message" role="status">
                ✨ {lastCascade} cascades! Keep it going!
              </p>
            )}

            <div className="sdml-board" aria-label="Dumpling matching board">
              {board.map((row, rowIndex) =>
                row.map((type, colIndex) => {
                  const key = `${rowIndex},${colIndex}`;
                  const ability = specials[key];
                  const isAnimated = animatedCells.includes(key);

                  return (
                    <button
                      type="button"
                      key={key}
                      className={[
                        "sdml-cell",
                        selectedCell === key ? "sdml-cell--selected" : "",
                        isAnimated && animationType === "swap"
                          ? "sdml-cell--swapping"
                          : "",
                        isAnimated && animationType === "invalid"
                          ? "sdml-cell--invalid"
                          : "",
                        isAnimated && animationType === "pop"
                          ? "sdml-cell--popping"
                          : "",
                        ability ? `sdml-cell--special sdml-cell--special-${ability}` : "",
                      ].filter(Boolean).join(" ")}
                      onClick={() => void handleCellClick(rowIndex, colIndex)}
                      disabled={status !== "playing" || busy || !type}
                      aria-label={
                        type
                          ? `${type} dumpling${ability ? `, ${ABILITY_NAMES[ability]} power-up` : ""}, row ${rowIndex + 1}, column ${colIndex + 1}`
                          : "Empty cell"
                      }
                    >
                      {type && <DumplingTile type={type} small />}
                      {ability && (
                        <span className="sdml-special-badge" aria-hidden="true">
                          {ability === "row"
                            ? "↔"
                            : ability === "column"
                              ? "↕"
                              : ability === "burst"
                                ? "✹"
                                : ability === "cross"
                                  ? "✚"
                                  : "🌈"}
                        </span>
                      )}
                    </button>
                  );
                }),
              )}

              {status !== "playing" && (
                <div className="sdml-result-overlay">
                  <div className="sdml-result-card">
                    <div className="sdml-result-art" aria-hidden="true">
                      <DumplingTile
                        type={status === "won" ? "golden" : "strawberry"}
                      />
                    </div>

                    <p className="sdml-section-kicker">
                      {status === "won" ? "BAO-TIFUL WORK!" : "ONE MORE TRY"}
                    </p>
                    <h3>
                      {status === "won" ? "Level complete!" : "So close!"}
                    </h3>
                    <p>
                      {status === "won"
                        ? "You reached your goal and earned your stars."
                        : "You ran out of moves. Try a different strategy!"}
                    </p>

                    {status === "won" && (
                      <div
                        className="sdml-result-stars"
                        aria-label={`${getStars(movesLeft, activeConfig.moves)} stars earned`}
                      >
                        {"★".repeat(getStars(movesLeft, activeConfig.moves))}
                        <span>
                          {"☆".repeat(3 - getStars(movesLeft, activeConfig.moves))}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      className="sdml-primary-button"
                      onClick={() => {
                        if (status === "lost") {
                          startLevel(selectedLevel);
                        } else if (selectedLevel < LEVEL_COUNT) {
                          startLevel(selectedLevel + 1);
                        } else {
                          setScreen("world");
                          setSelectedLevel(null);
                        }
                      }}
                    >
                      {status === "lost"
                        ? "Try again"
                        : selectedLevel < LEVEL_COUNT
                          ? "Next level"
                          : "World complete!"}
                    </button>

                    <button
                      type="button"
                      className="sdml-secondary-button"
                      onClick={returnToZone}
                    >
                      Zone map
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="sdml-game-footer">
              <span>✦</span>
              <p>Little matches. Big dumpling energy.</p>
              <span>✦</span>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
