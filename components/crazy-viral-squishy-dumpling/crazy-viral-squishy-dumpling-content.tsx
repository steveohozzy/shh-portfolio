"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { mysteryDumplingsAuth, mysteryDumplingsDb } from "@/lib/firebase";
import "./crazy-viral-squishy-dumpling.css";

type Rarity = "Common" | "Uncommon" | "Rare" | "Ultra rare";
type Accent = "none" | "leaf" | "star" | "heart" | "sparkle";

type Dumpling = {
  id: string;
  name: string;
  flavour: string;
  rarity: Rarity;
  colour: string;
  outline: string;
  accent: Accent;
  weight: number;
};

type CollectedDumpling = {
  id: string;
  name: string;
  rarity: Rarity;
  count: number;
};

type Point = { x: number; y: number };

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

const DUMPLINGS: Dumpling[] = [
  { id: "cloud-cream", name: "Cloud Cream", flavour: "Vanilla cloud", rarity: "Common", colour: "#fff0d9", outline: "#dfbca0", accent: "none", weight: 30 },
  { id: "strawberry-milk", name: "Strawberry Milk", flavour: "Strawberry milkshake", rarity: "Common", colour: "#ffc9d8", outline: "#e995b0", accent: "heart", weight: 25 },
  { id: "matcha-mochi", name: "Matcha Mochi", flavour: "Sweet matcha", rarity: "Uncommon", colour: "#cce5ae", outline: "#96bd7c", accent: "leaf", weight: 18 },
  { id: "blueberry-blush", name: "Blueberry Blush", flavour: "Blueberry cream", rarity: "Uncommon", colour: "#d9d4ff", outline: "#a6a0df", accent: "sparkle", weight: 13 },
  { id: "honey-gold", name: "Honey Gold", flavour: "Golden honey", rarity: "Rare", colour: "#ffcf63", outline: "#d99b2b", accent: "star", weight: 9 },
  { id: "rainbow-pop", name: "Rainbow Pop", flavour: "Rainbow sherbet", rarity: "Ultra rare", colour: "rainbow", outline: "#d7a7e8", accent: "star", weight: 5 },

  { id: "original-glitter", name: "Original Glitter", flavour: "Strawberry sparkle", rarity: "Uncommon", colour: "#ffc0d9", outline: "#db83ad", accent: "sparkle", weight: 8 },
  { id: "super-mega-glitter", name: "Super Mega Glitter", flavour: "Mega berry sparkle", rarity: "Ultra rare", colour: "#ff9bcf", outline: "#cf579d", accent: "star", weight: 2 },
  { id: "galaxy", name: "Galaxy Bao", flavour: "Cosmic blueberry", rarity: "Rare", colour: "#9d91e8", outline: "#7163bb", accent: "sparkle", weight: 5 },
  { id: "golden-stuffed", name: "Golden Stuffed", flavour: "Golden caramel", rarity: "Ultra rare", colour: "#ffd16b", outline: "#b98522", accent: "star", weight: 2 },
  { id: "diamond-chase", name: "Diamond Chase", flavour: "Crystal sugar", rarity: "Ultra rare", colour: "#b9f3f1", outline: "#68bfc6", accent: "sparkle", weight: 1 },
  { id: "snowflake", name: "Snowflake", flavour: "Winter vanilla", rarity: "Rare", colour: "#d9f2ff", outline: "#91c7e6", accent: "sparkle", weight: 4 },
  { id: "pink-mystery-glitter", name: "Pink Mystery Glitter", flavour: "Pink sugar sparkle", rarity: "Rare", colour: "#ffb5df", outline: "#d975b4", accent: "heart", weight: 4 },
  { id: "colour-change", name: "Colour-Change Bao", flavour: "Magic berry", rarity: "Rare", colour: "#b5d8ff", outline: "#7b9ddd", accent: "sparkle", weight: 4 },
  { id: "rainbow-gold-chase", name: "Rainbow Gold Chase", flavour: "Golden rainbow", rarity: "Ultra rare", colour: "rainbow", outline: "#c99a42", accent: "star", weight: 1 },
  { id: "surfing-shark", name: "Surfing Shark", flavour: "Ocean blue raspberry", rarity: "Uncommon", colour: "#9bdfe9", outline: "#58aebc", accent: "star", weight: 7 },
  { id: "spooky", name: "Spooky Bao", flavour: "Midnight grape", rarity: "Rare", colour: "#bba3e8", outline: "#8970bd", accent: "star", weight: 4 },
  { id: "halloween", name: "Halloween Mystery", flavour: "Pumpkin candy", rarity: "Uncommon", colour: "#ffb56d", outline: "#d77c42", accent: "star", weight: 7 },
  { id: "pork-bun", name: "Pork Bun", flavour: "Savoury sesame", rarity: "Common", colour: "#f0d0b5", outline: "#c79a78", accent: "none", weight: 12 },
  { id: "maltose-pastel", name: "Maltose Pastel Bao", flavour: "Pastel honey", rarity: "Uncommon", colour: "#f3c8ec", outline: "#d39acb", accent: "heart", weight: 7 },
  { id: "kpop-christmas", name: "K-Pop Christmas", flavour: "Festive strawberry", rarity: "Rare", colour: "#f4b9d1", outline: "#d87d9f", accent: "star", weight: 4 },
  { id: "kpop-diva", name: "K-Pop Diva", flavour: "Pink pop candy", rarity: "Rare", colour: "#e7a7f4", outline: "#b66bd1", accent: "heart", weight: 4 },
  { id: "kpop-neon-glow", name: "K-Pop Neon Glow", flavour: "Neon melon", rarity: "Ultra rare", colour: "#b5f1b0", outline: "#6dbd7b", accent: "sparkle", weight: 2 },
  { id: "kawaii-pearl", name: "Kawaii Foodiez Pearl", flavour: "Pearl milk tea", rarity: "Uncommon", colour: "#f5e5ff", outline: "#c8a7dc", accent: "sparkle", weight: 7 },
  { id: "kawaii-ripple", name: "Kawaii Foodiez Ripple", flavour: "Blueberry ripple", rarity: "Rare", colour: "#c5d6ff", outline: "#8ba6e6", accent: "sparkle", weight: 4 },
  { id: "mini-four-colour", name: "Mini Four Colour", flavour: "Four-fruit sherbet", rarity: "Uncommon", colour: "rainbow", outline: "#d7a7e8", accent: "heart", weight: 7 },
  { id: "mini-metallic", name: "Mini Metallic Mystery", flavour: "Silver sugar", rarity: "Ultra rare", colour: "#d7dce8", outline: "#9ba5ba", accent: "sparkle", weight: 2 },

  { id: "americana", name: "Americana", flavour: "Berry celebration", rarity: "Uncommon", colour: "#b8d5ff", outline: "#799bd7", accent: "star", weight: 6 },
  { id: "angry-glitter", name: "Angry Glitter", flavour: "Fiery cherry", rarity: "Rare", colour: "#ff9c9c", outline: "#d85f69", accent: "star", weight: 3 },
  { id: "capybara", name: "Capybara Bao", flavour: "Caramel biscuit", rarity: "Uncommon", colour: "#d9b18c", outline: "#ad805d", accent: "heart", weight: 7 },
  { id: "charming", name: "Charming Bao", flavour: "Peach cream", rarity: "Uncommon", colour: "#ffd2c0", outline: "#e8a18d", accent: "heart", weight: 6 },
  { id: "cotton-candy", name: "Cotton Candy", flavour: "Pink and blue candy", rarity: "Rare", colour: "#f4b9f1", outline: "#c68bd5", accent: "sparkle", weight: 4 },
  { id: "flower-confetti", name: "Flower Confetti", flavour: "Spring blossom", rarity: "Uncommon", colour: "#f7d4e8", outline: "#dc9abd", accent: "heart", weight: 6 },
  { id: "galaxy-glitter-gel", name: "Galaxy Glitter Gel", flavour: "Cosmic grape gel", rarity: "Ultra rare", colour: "#aa9af5", outline: "#7865ce", accent: "sparkle", weight: 2 },
  { id: "gold-shimmering", name: "Gold Shimmering", flavour: "Golden sugar", rarity: "Rare", colour: "#ffda81", outline: "#d5a33e", accent: "star", weight: 4 },
  { id: "green-holographic", name: "Green Holographic", flavour: "Apple sparkle", rarity: "Rare", colour: "#a8edc0", outline: "#6db78a", accent: "sparkle", weight: 3 },
  { id: "gummi-bear", name: "Gummi Bear", flavour: "Gummy berry", rarity: "Uncommon", colour: "#ff9eaf", outline: "#d76e87", accent: "heart", weight: 6 },
  { id: "holographic-mystery", name: "Holographic Mystery", flavour: "Mystery shimmer", rarity: "Ultra rare", colour: "#d7c6ff", outline: "#a38ad9", accent: "sparkle", weight: 2 },
  { id: "party-confetti", name: "Party Confetti", flavour: "Birthday cake", rarity: "Uncommon", colour: "#ffd3a8", outline: "#dfa16c", accent: "star", weight: 6 },
  { id: "pink-holographic", name: "Pink Holographic", flavour: "Pink prism candy", rarity: "Rare", colour: "#ffc3ec", outline: "#d783bd", accent: "sparkle", weight: 3 },
  { id: "purple-holographic", name: "Purple Holographic", flavour: "Violet prism candy", rarity: "Rare", colour: "#c9b5ff", outline: "#9780db", accent: "sparkle", weight: 3 },
  { id: "rare-ruby", name: "Rare Ruby", flavour: "Ruby cherry", rarity: "Ultra rare", colour: "#ef718f", outline: "#ad3458", accent: "star", weight: 1 },
  { id: "rose-gold-mini", name: "Rose Gold Mini", flavour: "Rose caramel", rarity: "Rare", colour: "#eab5a9", outline: "#bc8175", accent: "star", weight: 3 },
  { id: "rose-gold-glitter", name: "Rose Gold Glitter", flavour: "Rose gold sparkle", rarity: "Ultra rare", colour: "#eeb6b9", outline: "#bd777f", accent: "sparkle", weight: 2 },
  { id: "seashell", name: "Seashell", flavour: "Sea salt vanilla", rarity: "Uncommon", colour: "#f7d6c9", outline: "#d8a79b", accent: "sparkle", weight: 6 },
  { id: "sherbert", name: "Sherbert", flavour: "Fizzy fruit sherbet", rarity: "Uncommon", colour: "rainbow", outline: "#d7a7e8", accent: "heart", weight: 6 },
  { id: "starlight", name: "Starlight", flavour: "Moonbeam vanilla", rarity: "Rare", colour: "#d5dfff", outline: "#9ba9dc", accent: "star", weight: 4 },
  { id: "sunset", name: "Sunset Bao", flavour: "Peach sunset", rarity: "Uncommon", colour: "#ffb8a5", outline: "#df887a", accent: "star", weight: 6 },
  { id: "treasure", name: "Treasure Bao", flavour: "Secret golden caramel", rarity: "Ultra rare", colour: "#ffcf63", outline: "#b98522", accent: "star", weight: 2 },
  { id: "uv", name: "UV Mystery", flavour: "Electric berry", rarity: "Ultra rare", colour: "#bda6ff", outline: "#8d70db", accent: "sparkle", weight: 2 },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "How often can you open your free mystery pack?",
    options: ["Once a day", "Every hour", "As many as you like"],
    answer: "Once a day",
  },
  {
    question: "How many points do you earn for finding a new dumpling?",
    options: ["5 points", "10 points", "25 points"],
    answer: "25 points",
  },
  {
    question: "How many points do you earn for a duplicate dumpling?",
    options: ["10 points", "25 points", "50 points"],
    answer: "10 points",
  },
  {
    question: "Which of these is one of your dumpling flavours?",
    options: ["Strawberry milkshake", "Cheese pizza", "Mint toothpaste"],
    answer: "Strawberry milkshake",
  },
  {
    question: "Which dumpling has a rainbow colour?",
    options: ["Cloud Cream", "Rainbow Pop", "Pork Bun"],
    answer: "Rainbow Pop",
  },
  {
    question: "Which rarity is the hardest to find?",
    options: ["Common", "Uncommon", "Ultra rare"],
    answer: "Ultra rare",
  },
  {
    question: "Which dumpling has a matcha flavour?",
    options: ["Matcha Mochi", "Honey Gold", "Blueberry Blush"],
    answer: "Matcha Mochi",
  },
  {
    question: "What happens when you find a duplicate?",
    options: ["You lose points", "You earn 10 points", "Your collection resets"],
    answer: "You earn 10 points",
  },
  {
    question: "Which dumpling has a golden honey flavour?",
    options: ["Honey Gold", "Snowflake", "Spooky Bao"],
    answer: "Honey Gold",
  },
  {
    question: "What do you use to open a mystery?",
    options: ["A bamboo steamer", "A treasure chest", "A magic wand"],
    answer: "A bamboo steamer",
  },
  {
    question: "Which dumpling has a blueberry cream flavour?",
    options: ["Blueberry Blush", "Strawberry Milk", "Golden Stuffed"],
    answer: "Blueberry Blush",
  },
  {
    question: "What do you earn for finding a new dumpling?",
    options: ["A bonus quiz automatically", "25 points", "No points"],
    answer: "25 points",
  },
];

function chooseQuizQuestions(): QuizQuestion[] {
  const shuffled = [...QUIZ_QUESTIONS];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 3).map((question) => ({
    ...question,
    options: [...question.options].sort(() => Math.random() - 0.5),
  }));
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function chooseDumpling(): Dumpling {
  const total = DUMPLINGS.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;

  for (const item of DUMPLINGS) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }

  return DUMPLINGS[0];
}

function DumplingArt({
  dumpling,
  className = "",
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: {
  dumpling: Dumpling;
  className?: string;
  style?: React.CSSProperties;
  onPointerDown?: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerMove?: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUp?: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerCancel?: (event: React.PointerEvent<SVGSVGElement>) => void;
}) {
  const fillId = `md-fill-${dumpling.id}`;

  return (
    <svg
      className={`md-dumpling-art ${className}`}
      viewBox="0 0 120 112"
      role="img"
      aria-label={dumpling.name}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <defs>
        {dumpling.colour === "rainbow" ? (
          <linearGradient id={fillId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffc9d8" />
            <stop offset="35%" stopColor="#ffe4a1" />
            <stop offset="68%" stopColor="#cce5ae" />
            <stop offset="100%" stopColor="#d9d4ff" />
          </linearGradient>
        ) : (
          <radialGradient id={fillId} cx="30%" cy="20%" r="85%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".72" />
            <stop offset="42%" stopColor={dumpling.colour} />
            <stop offset="100%" stopColor={dumpling.colour} />
          </radialGradient>
        )}
      </defs>

      <ellipse cx="60" cy="99" rx="34" ry="5" fill="#b98976" opacity=".13" />

      <path
        d="M18 69 C12 54 25 39 36 31 C42 17 51 12 60 17 C69 12 78 17 84 31 C95 39 108 54 102 69 C97 91 80 99 60 99 C40 99 23 91 18 69Z"
        fill={`url(#${fillId})`}
        stroke={dumpling.outline}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      <path
        d="M35 33 Q46 41 60 35 Q74 41 85 33 M42 26 Q49 34 60 30 Q71 34 78 26"
        fill="none"
        stroke={dumpling.outline}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity=".82"
      />

      {dumpling.accent === "leaf" && (
        <g fill="#78a866" stroke="#638d54" strokeWidth="1">
          <path d="M60 20 Q48 8 46 19 Q53 27 60 20Z" />
          <path d="M60 20 Q71 7 75 17 Q69 27 60 20Z" />
        </g>
      )}

      {dumpling.accent === "star" && (
        <path
          d="M60 8 L63 14 L70 15 L65 20 L66 27 L60 23 L54 27 L55 20 L50 15 L57 14Z"
          fill="#fff4a8"
          stroke={dumpling.outline}
          strokeWidth="1.2"
        />
      )}

      {dumpling.accent === "heart" && (
        <path
          d="M60 25 C53 19 47 25 52 30 L60 36 L68 30 C73 25 67 19 60 25Z"
          fill="#f18ba5"
          stroke="#df7c98"
          strokeWidth="1"
        />
      )}

      {dumpling.accent === "sparkle" && (
        <g fill="#fff" opacity=".95">
          <path d="M60 12 L62 18 L68 20 L62 22 L60 28 L58 22 L52 20 L58 18Z" />
          <circle cx="82" cy="38" r="2" />
          <circle cx="36" cy="42" r="1.7" />
        </g>
      )}

      <ellipse cx="30" cy="68" rx="7" ry="4.2" fill="#f39bad" opacity=".72" />
      <ellipse cx="90" cy="68" rx="7" ry="4.2" fill="#f39bad" opacity=".72" />
      <ellipse cx="42" cy="58" rx="3.5" ry="4.5" fill="#49352f" />
      <ellipse cx="78" cy="58" rx="3.5" ry="4.5" fill="#49352f" />
      <path d="M52 69 Q60 77 68 69" fill="none" stroke="#49352f" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="40.8" cy="56.4" rx="1.1" ry="1.4" fill="#fff" />
      <ellipse cx="76.8" cy="56.4" rx="1.1" ry="1.4" fill="#fff" />
    </svg>
  );
}

function BambooSteamer({
  open,
  onOpen,
}: {
  open: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      className={`md-steamer ${open ? "is-open" : ""}`}
      type="button"
      onClick={onOpen}
      aria-label="Open the mystery bamboo steamer"
      disabled={open}
    >
      <span className="md-steamer-glow" />
      <span className="md-steamer-bowl">
        <span className="md-bowl-rim" />
        <span className="md-bowl-weave" />
        <span className="md-bowl-band">MYSTERY BAO</span>
        <span className="md-bowl-foot" />
      </span>
      <span className="md-steamer-lid">
        <span className="md-lid-knob" />
        <span className="md-lid-rim" />
        <span className="md-lid-weave md-lid-weave-one" />
        <span className="md-lid-weave md-lid-weave-two" />
      </span>
      <span className="md-steamer-hint">
        {open ? "A SURPRISE!" : "TAP TO OPEN"}
      </span>
    </button>
  );
}

export default function CrazyViralSquishyDumplingContent() {
  const [uid, setUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [stage, setStage] = useState<"ready" | "opening" | "revealed">("ready");
  const [pendingDumpling, setPendingDumpling] = useState<Dumpling | null>(null);
  const [revealed, setRevealed] = useState<Dumpling | null>(null);
  const [isCollectionPreview, setIsCollectionPreview] = useState(false);

  const [collected, setCollected] = useState<CollectedDumpling[]>([]);
  const [lastPackDate, setLastPackDate] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [totalOpened, setTotalOpened] = useState(0);
  const [bonusPacks, setBonusPacks] = useState(0);
  const [lastQuizDate, setLastQuizDate] = useState<string | null>(null);

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [notice, setNotice] = useState("");

  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizNotice, setQuizNotice] = useState("");
  const [quizBusy, setQuizBusy] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    () => chooseQuizQuestions()
  );

  const [isSquishing, setIsSquishing] = useState(false);
  const [squish, setSquish] = useState({ x: 1, y: 1 });

  const pointerMap = useRef(new Map<number, Point>());
  const pinchStart = useRef<{
    distance: number;
    axis: "x" | "y";
    scaleX: number;
    scaleY: number;
  } | null>(null);
  const dragStart = useRef<{
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
  } | null>(null);

  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const springTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(mysteryDumplingsAuth, async (user) => {
      if (user) {
        setUid(user.uid);
        setAuthReady(true);
        return;
      }

      try {
        await signInAnonymously(mysteryDumplingsAuth);
      } catch {
        setNotice("We couldn't connect to your collection just yet. Please refresh and try again.");
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!uid) return;

    const playerRef = doc(mysteryDumplingsDb, "players", uid);
    const collectionRef = collection(
      mysteryDumplingsDb,
      "players",
      uid,
      "collection"
    );

    const stopPlayer = onSnapshot(
      playerRef,
      (snapshot) => {
        const data = snapshot.data();

        setLastPackDate(
          typeof data?.lastPackDate === "string" ? data.lastPackDate : null
        );
        setPoints(Number(data?.points || 0));
        setTotalOpened(Number(data?.totalOpened || 0));
        setBonusPacks(Math.max(0, Number(data?.bonusPacks || 0)));
        setLastQuizDate(
          typeof data?.lastQuizDate === "string" ? data.lastQuizDate : null
        );
      },
      () => {
        setNotice("Your collection couldn't load. Please check the Mystery Dumplings Firebase rules.");
      }
    );

    const stopCollection = onSnapshot(
      collectionRef,
      (snapshot) => {
        setCollected(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...(item.data() as Omit<CollectedDumpling, "id">),
          }))
        );
      },
      () => {
        setNotice("Your collection couldn't load. Please check the Mystery Dumplings Firebase rules.");
      }
    );

    return () => {
      stopPlayer();
      stopCollection();
    };
  }, [uid]);

  useEffect(
    () => () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
      if (springTimer.current) clearTimeout(springTimer.current);
    },
    []
  );

  const today = todayKey();
  const packUsed = lastPackDate === today;
  const quizUsed = lastQuizDate === today;
  const canOpenPack = !packUsed || bonusPacks > 0;
  const collectionCount = collected.length;
  const foundCurrent = revealed
    ? collected.find((item) => item.id === revealed.id)
    : undefined;

  const openMystery = useCallback(async () => {
    if (!uid || stage !== "ready" || (!canOpenPack && packUsed)) return;

    const picked = chooseDumpling();

    setPendingDumpling(picked);
    setRevealed(null);
    setIsCollectionPreview(false);
    setStage("opening");
    setSaveState("saving");
    setNotice("Listen for the little pop…");

    const playerRef = doc(mysteryDumplingsDb, "players", uid);
    const itemRef = doc(
      mysteryDumplingsDb,
      "players",
      uid,
      "collection",
      picked.id
    );

    try {
      const result = await runTransaction(
        mysteryDumplingsDb,
        async (transaction) => {
          const playerSnapshot = await transaction.get(playerRef);
          const player = playerSnapshot.data();

          const alreadyOpenedToday = player?.lastPackDate === today;
          const currentBonusPacks = Math.max(
            0,
            Number(player?.bonusPacks || 0)
          );

          let isBonus = false;
          let nextBonusPacks = currentBonusPacks;

          if (alreadyOpenedToday) {
            if (currentBonusPacks < 1) {
              throw new Error("DAILY_PACK_ALREADY_OPENED");
            }

            isBonus = true;
            nextBonusPacks = currentBonusPacks - 1;
          }

          const itemSnapshot = await transaction.get(itemRef);
          const item = itemSnapshot.data();
          const isDuplicate = itemSnapshot.exists();

          transaction.set(
            playerRef,
            {
              lastPackDate: today,
              bonusPacks: nextBonusPacks,
              points:
                Number(player?.points || 0) + (isDuplicate ? 10 : 25),
              totalOpened: Number(player?.totalOpened || 0) + 1,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );

          transaction.set(
            itemRef,
            {
              name: picked.name,
              rarity: picked.rarity,
              count: Number(item?.count || 0) + 1,
              firstFoundAt: item?.firstFoundAt || serverTimestamp(),
              lastFoundAt: serverTimestamp(),
            },
            { merge: true }
          );

          return { isDuplicate, isBonus };
        }
      );

      setSaveState("saved");

      if (revealTimer.current) clearTimeout(revealTimer.current);

      revealTimer.current = setTimeout(() => {
        setRevealed(picked);
        setPendingDumpling(null);
        setStage("revealed");

        const packMessage = result.isBonus
          ? " Your bonus pack has been used!"
          : "";

        setNotice(
          result.isDuplicate
            ? `A familiar friend! Your duplicate earned 10 points.${packMessage}`
            : `A new friend for your collection! You earned 25 points.${packMessage}`
        );
      }, 1450);
    } catch (error) {
      setStage("ready");
      setPendingDumpling(null);
      setSaveState("error");

      if (
        error instanceof Error &&
        error.message === "DAILY_PACK_ALREADY_OPENED"
      ) {
        setNotice(
          "You've used today's pack. Take the quiz to earn a bonus pack, or come back tomorrow."
        );
      } else {
        setNotice(
          "We couldn't save this reveal. Please check your Firebase setup and try again."
        );
      }
    }
  }, [uid, stage, canOpenPack, packUsed, today]);

  const resetQuizForTesting = async () => {
  if (!uid || process.env.NODE_ENV === "production") return;

  try {
    await setDoc(
      doc(mysteryDumplingsDb, "players", uid),
      {
        lastQuizDate: null,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setLastQuizDate(null);
    setQuizAnswers({});
    setQuizQuestions(chooseQuizQuestions());
    setQuizOpen(true);
    setQuizNotice("Quiz reset for testing. Your collection and points are unchanged.");
  } catch {
    setQuizNotice("Couldn't reset the quiz. Please check your connection.");
  }
};

  const submitQuiz = useCallback(async () => {
    if (!uid || quizBusy || quizUsed) return;

    const allAnswered = quizQuestions.every(
      (_, index) => Boolean(quizAnswers[index])
    );

    if (!allAnswered) {
      setQuizNotice("Answer all three questions to unlock your bonus pack.");
      return;
    }

    const allCorrect = quizQuestions.every(
      (question, index) => quizAnswers[index] === question.answer
    );

    if (!allCorrect) {
      setQuizNotice("Not quite! Have another go and see if you can get all three right.");
      return;
    }

    setQuizBusy(true);
    setQuizNotice("");

    const playerRef = doc(mysteryDumplingsDb, "players", uid);

    try {
      const result = await runTransaction(
        mysteryDumplingsDb,
        async (transaction) => {
          const playerSnapshot = await transaction.get(playerRef);
          const player = playerSnapshot.data();

          if (player?.lastQuizDate === today) {
            throw new Error("QUIZ_ALREADY_COMPLETED");
          }

          const nextBonusPacks =
            Math.max(0, Number(player?.bonusPacks || 0)) + 1;

          transaction.set(
            playerRef,
            {
              bonusPacks: nextBonusPacks,
              lastQuizDate: today,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );

          return nextBonusPacks;
        }
      );

      setBonusPacks(result);
      setLastQuizDate(today);
      setQuizNotice("You got them all right! One bonus mystery pack is yours. ♡");
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "QUIZ_ALREADY_COMPLETED"
      ) {
        setLastQuizDate(today);
        setQuizNotice("You've already claimed today's quiz reward. Come back tomorrow!");
      } else {
        setQuizNotice(
          "We couldn't save your reward. Please check your connection and try again."
        );
      }
    } finally {
      setQuizBusy(false);
    }
  }, [uid, quizBusy, quizUsed, quizAnswers, quizQuestions, today]);

  const startSquish = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!revealed) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerMap.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    setIsSquishing(true);

    if (pointerMap.current.size >= 2) {
      const points = Array.from(pointerMap.current.values()).slice(-2);
      const dx = Math.abs(points[1].x - points[0].x);
      const dy = Math.abs(points[1].y - points[0].y);

      pinchStart.current = {
        distance: Math.max(1, Math.sqrt(dx * dx + dy * dy)),
        axis: dx >= dy ? "x" : "y",
        scaleX: squish.x,
        scaleY: squish.y,
      };

      dragStart.current = null;
    } else {
      dragStart.current = {
        x: event.clientX,
        y: event.clientY,
        scaleX: squish.x,
        scaleY: squish.y,
      };

      pinchStart.current = null;
    }
  };

  const moveSquish = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!pointerMap.current.has(event.pointerId)) return;

    pointerMap.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointerMap.current.size >= 2 && pinchStart.current) {
      const points = Array.from(pointerMap.current.values()).slice(-2);
      const dx = Math.abs(points[1].x - points[0].x);
      const dy = Math.abs(points[1].y - points[0].y);
      const distance = Math.sqrt(dx * dx + dy * dy);
      const change =
        (distance - pinchStart.current.distance) /
        Math.max(90, pinchStart.current.distance);

      if (pinchStart.current.axis === "x") {
        const x = Math.max(
          0.62,
          Math.min(1.32, pinchStart.current.scaleX + change * 1.15)
        );
        const y = Math.max(
          0.78,
          Math.min(1.52, pinchStart.current.scaleY + (1 - x) * 1.05)
        );

        setSquish({ x, y });
      } else {
        const y = Math.max(
          0.62,
          Math.min(1.32, pinchStart.current.scaleY + change * 1.15)
        );
        const x = Math.max(
          0.78,
          Math.min(1.52, pinchStart.current.scaleX + (1 - y) * 1.05)
        );

        setSquish({ x, y });
      }

      return;
    }

    if (dragStart.current) {
      const dx = event.clientX - dragStart.current.x;
      const dy = event.clientY - dragStart.current.y;

      if (Math.abs(dx) >= Math.abs(dy)) {
        const x = Math.max(
          0.72,
          Math.min(1.34, dragStart.current.scaleX + dx * 0.003)
        );

        setSquish({
          x,
          y: Math.max(
            0.78,
            Math.min(1.42, dragStart.current.scaleY + (1 - x) * 0.85)
          ),
        });
      } else {
        const y = Math.max(
          0.72,
          Math.min(1.34, dragStart.current.scaleY + dy * 0.003)
        );

        setSquish({
          x: Math.max(
            0.78,
            Math.min(1.42, dragStart.current.scaleX + (1 - y) * 0.85)
          ),
          y,
        });
      }
    }
  };

  const endSquish = (event: React.PointerEvent<SVGSVGElement>) => {
    pointerMap.current.delete(event.pointerId);

    if (pointerMap.current.size === 0) {
      pinchStart.current = null;
      dragStart.current = null;
      setIsSquishing(false);

      if (springTimer.current) clearTimeout(springTimer.current);

      springTimer.current = setTimeout(() => {
        setSquish({ x: 1, y: 1 });
      }, 35);
    } else if (pointerMap.current.size === 1) {
      const remaining = Array.from(pointerMap.current.values())[0];

      dragStart.current = {
        x: remaining.x,
        y: remaining.y,
        scaleX: squish.x,
        scaleY: squish.y,
      };

      pinchStart.current = null;
    }
  };

  const resetForNext = () => {
    setRevealed(null);
    setPendingDumpling(null);
    setIsCollectionPreview(false);
    setStage("ready");
    setSquish({ x: 1, y: 1 });
    setSaveState("idle");
    setNotice(
      packUsed && bonusPacks < 1
        ? "Your steamer is empty for today. Take the quiz for a bonus pack, or come back tomorrow!"
        : "Your next mystery is waiting."
    );
  };

  const milestones = [
    { count: 1, label: "First friend" },
    { count: 5, label: "Little collector" },
    { count: 10, label: "Bao bestie" },
    { count: 20, label: "Squishy superstar" },
    { count: 35, label: "Bao champion" },
    { count: DUMPLINGS.length, label: "Ultimate collector" },
  ];

  const nextMilestone = milestones.find(
    (item) => collectionCount < item.count
  );

  const displayDumpling = revealed || pendingDumpling;

  return (
    <main className="md-game-page">
      <div className="md-page-glow md-page-glow-one" />
      <div className="md-page-glow md-page-glow-two" />

      <div className="md-game-shell">
        <header className="md-header">
          <div className="md-brand-mark" aria-hidden="true">
            ♡
          </div>

          <p className="md-eyebrow">A tiny surprise, just for you</p>

          <h1>
            Mystery <span>Dumplings</span>
          </h1>

          <p className="md-intro">
            Lift the lid, meet your mystery bao, then give your new squishy
            friend a squeeze.
          </p>

          <div className="md-stats">
            <div className="md-stat">
              <span className="md-stat-icon">♡</span>
              <strong>
                {collectionCount}
                <small> / {DUMPLINGS.length}</small>
              </strong>
              <span>Collected</span>
            </div>

            <div className="md-stat">
              <span className="md-stat-icon">✦</span>
              <strong>{points}</strong>
              <span>Squish points</span>
            </div>

            <div className="md-stat">
              <span className="md-stat-icon">☼</span>
              <strong>{totalOpened}</strong>
              <span>Mysteries opened</span>
            </div>
          </div>
        </header>

        <section
          className={`md-unbox-card ${stage === "opening" ? "is-opening" : ""} ${stage === "revealed" ? "has-reveal" : ""}`}
        >
          <div className="md-card-sparkle md-card-sparkle-a">✦</div>
          <div className="md-card-sparkle md-card-sparkle-b">✧</div>

          <div className="md-section-heading">
            <span className="md-step-pill">
              {isCollectionPreview
                ? "FROM YOUR COLLECTION"
                : stage === "revealed"
                  ? "YOUR NEW FRIEND"
                  : "TODAY'S MYSTERY"}
            </span>

            <h2>
              {isCollectionPreview
                ? "Play with your dumpling!"
                : stage === "revealed"
                  ? "Meet your dumpling!"
                  : stage === "opening"
                    ? "Here it comes…"
                    : "What's under the lid?"}
            </h2>

            <p>
              {isCollectionPreview
                ? "Choose another friend from your collection whenever you like."
                : stage === "revealed"
                  ? "Go on, give your new friend a squish."
                  : "A tiny, soft surprise is waiting in the steamer."}
            </p>
          </div>

          {stage !== "revealed" ? (
            <div
              className={`md-steamer-stage ${stage === "opening" ? "is-revealing" : ""}`}
            >
              {stage === "opening" && (
                <div className="md-reveal-rays" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              )}

              {stage === "opening" && displayDumpling && (
                <div className="md-peek-wrap">
                  <DumplingArt
                    dumpling={displayDumpling}
                    className="md-peek-dumpling"
                  />
                </div>
              )}

              <BambooSteamer
                open={stage === "opening"}
                onOpen={openMystery}
              />

              <p className="md-stage-caption">
                {stage === "opening"
                  ? "Pop! Your little friend is coming out…"
                  : "Tap the steamer to reveal your mystery bao."}
              </p>
            </div>
          ) : revealed ? (
            <div className="md-revealed-stage">
              <div
                className={`md-reveal-halo rarity-${revealed.rarity.toLowerCase().replace(" ", "-")}`}
              />

              <div className="md-revealed-art-wrap">
                <DumplingArt
                  dumpling={revealed}
                  className={`md-play-dumpling ${isSquishing ? "is-squishing" : ""}`}
                  onPointerDown={startSquish}
                  onPointerMove={moveSquish}
                  onPointerUp={endSquish}
                  onPointerCancel={endSquish}
                  style={{
                    transform: `scale(${squish.x}, ${squish.y})`,
                    transformOrigin: "50% 50%",
                    touchAction: "none",
                  }}
                />

                <span className="md-squish-spark md-squish-spark-left">
                  ✦
                </span>
                <span className="md-squish-spark md-squish-spark-right">
                  ♡
                </span>
              </div>

              <span
                className={`md-rarity-badge rarity-${revealed.rarity.toLowerCase().replace(" ", "-")}`}
              >
                {revealed.rarity}
              </span>

              <h3>{revealed.name}!</h3>
              <p className="md-flavour">{revealed.flavour}</p>

              <p className="md-play-tip">
                Use two fingers to pinch the sides or top and bottom. Watch it
                squish, stretch, and bounce back.
              </p>

              <div className="md-reveal-actions">
                <button
                  className="md-button md-button-primary"
                  type="button"
                  onClick={resetForNext}
                  disabled={!isCollectionPreview && !canOpenPack}
                >
                  {isCollectionPreview
                    ? "Back to mystery"
                    : canOpenPack
                      ? "Open another mystery"
                      : "No packs left today"}
                </button>

                <button
                  className="md-button md-button-soft"
                  type="button"
                  onClick={() => {
                    setSquish({ x: 1.22, y: 0.82 });

                    if (springTimer.current) {
                      clearTimeout(springTimer.current);
                    }

                    springTimer.current = setTimeout(() => {
                      setSquish({ x: 1, y: 1 });
                    }, 420);
                  }}
                >
                  Give it a squish!
                </button>
              </div>

              <a
                className="md-button md-button-soft md-full-game-link"
                href="https://www.shhdesign.co.uk/online-squishy-dumpling"
              >
                Play the full squishy game
                <span aria-hidden="true">↗</span>
              </a>

              {foundCurrent && (
                <p className="md-duplicate-note">
                  You've found this friend {foundCurrent.count} time
                  {foundCurrent.count === 1 ? "" : "s"}.
                </p>
              )}
            </div>
          ) : null}

          {stage === "ready" && (
            <div className="md-open-area">
              <button
                className="md-button md-button-primary md-open-button"
                type="button"
                onClick={openMystery}
                disabled={!authReady || !uid || !canOpenPack}
              >
                {!authReady
                  ? "Getting your basket ready…"
                  : !uid
                    ? "Connecting to your collection…"
                    : packUsed && bonusPacks > 0
                      ? `Open bonus mystery (${bonusPacks} left)`
                      : packUsed
                        ? "Today's mystery opened"
                        : "Open my mystery dumpling"}
              </button>

              <p className="md-daily-note">
                {packUsed && bonusPacks < 1
                  ? "Your free pack has been opened. Take the quiz below to earn a bonus pack!"
                  : bonusPacks > 0
                    ? `You have ${bonusPacks} bonus pack${bonusPacks === 1 ? "" : "s"} waiting. ♡`
                    : "One free mystery each day · Every friend is yours to keep ♡"}
              </p>
            </div>
          )}

          {stage === "opening" && (
            <div className="md-opening-status">
              <span className="md-button-spinner" />
              {saveState === "saving"
                ? "Opening your mystery…"
                : "Your bao is popping out…"}
            </div>
          )}

          {notice && (
            <p
              className={`md-notice ${saveState === "error" ? "is-error" : ""}`}
              role="status"
            >
              {notice}
            </p>
          )}
        </section>

        {/* Daily quiz: uses the challenge and quiz classes defined in the CSS. */}
        <section className="md-challenge">
          <div className="md-challenge-heading">
            <p className="md-eyebrow">A LITTLE DAILY CHALLENGE</p>
            <h2>
              Bao brain teaser <span>✦</span>
            </h2>
            <p>
              Get all three questions right to earn an extra mystery pack.
            </p>
          </div>

          <div className="md-bonus-count">
            <span className="md-quiz-reward-icon" aria-hidden="true">
              🎁
            </span>
            <div>
              <strong>
                {quizUsed
                  ? "Today's reward claimed!"
                  : "Win a bonus mystery pack"}
              </strong>
              <p>
                {quizUsed
                  ? "Come back tomorrow for another daily quiz."
                  : `${bonusPacks} bonus pack${bonusPacks === 1 ? "" : "s"} available`}
              </p>
            </div>
          </div>

          {!quizOpen ? (
            <button
              className="md-button md-button-primary md-quiz-start"
              type="button"
              onClick={() => {
                setQuizOpen(true);
                setQuizNotice("");
              }}
              disabled={!authReady || !uid || quizUsed}
            >
              {quizUsed
                ? "Come back tomorrow"
                : "Take the quiz for a bonus pack"}
            </button>
          ) : (
            <div className="md-quiz">
              {quizQuestions.map((question, index) => (
                <fieldset className="md-quiz-question" key={question.question}>
                  <legend>
                    <span className="md-quiz-number">{index + 1}</span>
                    {question.question}
                  </legend>

                  <div className="md-quiz-options">
                    {question.options.map((option) => (
                      <label
                        className={`md-quiz-option ${quizAnswers[index] === option ? "is-selected" : ""}`}
                        key={option}
                      >
                        <input
                          type="radio"
                          name={`md-quiz-${index}`}
                          value={option}
                          checked={quizAnswers[index] === option}
                          disabled={quizUsed || quizBusy}
                          onChange={() => {
                            setQuizAnswers((current) => ({
                              ...current,
                              [index]: option,
                            }));
                            setQuizNotice("");
                          }}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}

              <div className="md-quiz-actions">
                <button
                  className="md-button md-button-primary"
                  type="button"
                  onClick={submitQuiz}
                  disabled={quizBusy || quizUsed || !uid}
                >
                  {quizBusy
                    ? "Checking your answers…"
                    : quizUsed
                      ? "Reward already claimed"
                      : "Check my answers"}
                </button>

                <button
                  className="md-button md-quiz-cancel"
                  type="button"
                  onClick={() => {
                    setQuizOpen(false);
                    setQuizNotice("");
                  }}
                >
                  Close quiz
                </button>
              </div>

              {quizNotice && (
                <p
                  className={`md-quiz-notice ${quizUsed ? "is-success" : ""}`}
                  role="status"
                >
                  {quizNotice}
                </p>
              )}
            </div>
          )}
        </section>

        {process.env.NODE_ENV !== "production" && (
          <button
            className="md-button md-quiz-cancel"
            type="button"
            onClick={resetQuizForTesting}
            disabled={!uid || quizBusy}
          >
            Reset quiz for testing
          </button>
        )}

        <section className="md-collection-section">
          <div className="md-collection-heading">
            <div>
              <p className="md-eyebrow">YOUR LITTLE SQUISH FAMILY</p>
              <h2>
                My collection <span>♡</span>
              </h2>
            </div>

            <div className="md-collection-count">
              {collectionCount} of {DUMPLINGS.length}
            </div>
          </div>

          <div className="md-collection-progress">
            <span
              style={{
                width: `${Math.min(100, (collectionCount / DUMPLINGS.length) * 100)}%`,
              }}
            />
          </div>

          <div className="md-collection-grid">
            {DUMPLINGS.map((dumpling) => {
              const item = collected.find(
                (entry) => entry.id === dumpling.id
              );

              return (
                 <button
                    className={`md-collection-item ${item ? "is-found" : "is-unknown"} ${
                      revealed?.id === dumpling.id && isCollectionPreview
                        ? "is-active"
                        : ""
                    }`}
                    key={dumpling.id}
                    type="button"
                    disabled={!item}
                    onClick={() => {
                      if (!item) return;

                      setRevealed(dumpling);
                      setPendingDumpling(null);
                      setIsCollectionPreview(true);
                      setStage("revealed");
                      setSquish({ x: 1, y: 1 });
                      setSaveState("idle");
                      setNotice(`${dumpling.name} is ready for a squish! No pack used.`);
                    }}
                    aria-label={
                      item
                        ? `Play with ${dumpling.name}, found ${item.count} times`
                        : "Mystery dumpling not found yet"
                    }
                  >
                  <div className="md-collection-art">
                    {item ? (
                      <DumplingArt dumpling={dumpling} />
                    ) : (
                      <span className="md-question-mark">?</span>
                    )}

                    {item && item.count > 1 && (
                      <span className="md-duplicate-count">
                        ×{item.count}
                      </span>
                    )}
                  </div>

                  <strong>
                    {item ? dumpling.name : "Mystery friend"}
                  </strong>

                  <span
                    className={`md-mini-rarity rarity-${dumpling.rarity.toLowerCase().replace(" ", "-")}`}
                  >
                    {item ? dumpling.rarity : "Not found yet"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="md-milestone">
            <span className="md-milestone-icon">✿</span>

            <div>
              <strong>
                {nextMilestone
                  ? `${nextMilestone.count - collectionCount} more to reach ${nextMilestone.label}!`
                  : "You're a dumpling superstar!"}
              </strong>

              <p>
                {nextMilestone
                  ? `You've discovered ${collectionCount} of ${DUMPLINGS.length} dumplings so far. Keep opening mysteries to meet every little friend.`
                  : `You've discovered all ${DUMPLINGS.length} dumplings. What a collection!`}
              </p>
            </div>
          </div>
        </section>

        <footer className="md-footer">
          <span>Your discoveries are saved to your collection</span>
          <span>♡</span>
        </footer>
      </div>
    </main>
  );
}