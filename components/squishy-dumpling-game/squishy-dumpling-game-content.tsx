
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  GAME_CONFIG,
  BAO_TYPES,
  type BaoType,
} from "@/lib/squishy-dumpling-game/game-config"
import {
  addDoc,
  collection as firestoreCollection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import "./squishy-dumpling-game.css";

type GamePhase = "ready" | "playing" | "finished"

type Bao = {
  id: number
  type: BaoType
  x: number
  y: number
  launchX: number
  launchY: number
  expiresAt: number
  status: "flying" | "caught"
  points: number
}

type ScorePopup = {
  id: number
  x: number
  y: number
  points: number
  createdAt: number
}

type LeaderboardEntry = {
  id: string
  playerName: string
  score: number
}

const BASKETS = [
  { id: 0, x: 18, label: "Left basket" },
  { id: 1, x: 50, label: "Middle basket" },
  { id: 2, x: 82, label: "Right basket" },
]

const ROUND_LENGTH = GAME_CONFIG.roundLength
const HIGH_SCORE_KEY = GAME_CONFIG.highScoreKey
const COLLECTION_KEY = GAME_CONFIG.collectionKey
const PLAYER_NAME_KEY = "bao-player-name"

function Dumpling({ type }: { type: BaoType }) {
  const gradientId = `bao-rainbow-${type}`

  const fills: Record<BaoType, string> = {
    classic: "#fff0d9",
    strawberry: "#ffc9d8",
    matcha: "#cce5ae",
    golden: "#ffcf63",
    rainbow: `url(#${gradientId})`,
  }

  const outlines: Record<BaoType, string> = {
    classic: "#dfbca0",
    strawberry: "#e995b0",
    matcha: "#96bd7c",
    golden: "#d99b2b",
    rainbow: "#d7a7e8",
  }

  return (
    <svg
      className={`bao-art bao-art--${type}`}
      viewBox="0 0 120 112"
      role="img"
      aria-label={GAME_CONFIG.characters[type].name}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffb8d2" />
          <stop offset="35%" stopColor="#ffe2a2" />
          <stop offset="65%" stopColor="#b8f3db" />
          <stop offset="100%" stopColor="#c9b8ff" />
        </linearGradient>
      </defs>

      <ellipse cx="60" cy="101" rx="35" ry="7" fill="#7d554b" opacity=".12" />

      <path
        d="M18 69 C12 54 25 39 36 31 C42 17 51 12 60 17 C69 12 78 17 84 31 C95 39 108 54 102 69 C97 91 80 99 60 99 C40 99 23 91 18 69Z"
        fill={fills[type]}
        stroke={outlines[type]}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      <path
        d="M34 38 C38 27 47 23 51 30 M60 25 C60 31 60 34 60 38 M69 30 C75 23 82 28 86 38"
        fill="none"
        stroke={outlines[type]}
        strokeWidth="3"
        strokeLinecap="round"
      />

      <ellipse cx="42" cy="58" rx="4" ry="5" fill="#543b39" />
      <ellipse cx="78" cy="58" rx="4" ry="5" fill="#543b39" />

      <path
        d="M52 69 Q60 77 68 69"
        fill="none"
        stroke="#543b39"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <ellipse cx="31" cy="68" rx="7" ry="4" fill="#f49c9e" opacity=".7" />
      <ellipse cx="89" cy="68" rx="7" ry="4" fill="#f49c9e" opacity=".7" />

      {type === "golden" && (
        <path
          d="M91 15 L94 23 L102 26 L94 29 L91 37 L88 29 L80 26 L88 23Z"
          fill="#f4b33c"
        />
      )}

      {type === "rainbow" && (
        <>
          <path
            d="M15 23 L18 30 L25 33 L18 36 L15 43 L12 36 L5 33 L12 30Z"
            fill="#d7a7ff"
          />
          <path
            d="M99 43 L101 48 L106 50 L101 52 L99 57 L97 52 L92 50 L97 48Z"
            fill="#ff9bc7"
          />
        </>
      )}

      {type === "strawberry" && (
        <path
          d="M89 30 Q96 19 103 27 Q97 28 95 35 Q92 30 89 30Z"
          fill="#7da66a"
        />
      )}

      {type === "matcha" && (
        <path
          d="M91 27 Q101 20 104 30 Q98 29 93 36Z"
          fill="#76a75d"
        />
      )}
    </svg>
  )
}

function pickBaoType(): BaoType {
  const roll = Math.random()
  let total = 0

  for (const type of BAO_TYPES) {
    total += GAME_CONFIG.characters[type].spawnChance

    if (roll < total) {
      return type
    }
  }

  return "classic"
}

export function SquishyDumplingGameContent() {
  const [phase, setPhase] = useState<GamePhase>("ready")
  const [baos, setBaos] = useState<Bao[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number>(GAME_CONFIG.roundLength)
  const [combo, setCombo] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [collection, setCollection] = useState<BaoType[]>([])
  const [frenzyActive, setFrenzyActive] = useState(false)
  const [frenzyTimeLeft, setFrenzyTimeLeft] = useState(0)
  const [newDiscovery, setNewDiscovery] = useState<BaoType | null>(null)
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([])
  const [launchEffect, setLaunchEffect] = useState<{
    basketId: number
    id: number
  } | null>(null)

  const [specialMessage, setSpecialMessage] = useState("")
  const [comboShieldActive, setComboShieldActive] = useState(false)
  const [matchaSlowActive, setMatchaSlowActive] = useState(false)
  const [goldenRushActive, setGoldenRushActive] = useState(false)

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [playerName, setPlayerName] = useState("")
  const [scoreSubmitted, setScoreSubmitted] = useState(false)
  const [scoreSubmitting, setScoreSubmitting] = useState(false)
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)
  const [leaderboardError, setLeaderboardError] = useState("")
  const [submitMessage, setSubmitMessage] = useState("")

  const playfieldRef = useRef<HTMLDivElement>(null)
  const baosRef = useRef<Bao[]>([])
  const nextId = useRef(0)
  const scoreRef = useRef(0)
  const comboRef = useRef(0)
  const lastCatchAt = useRef(0)
  const lastSpawnAt = useRef(0)
  const endAt = useRef(0)
  const frenzyUntil = useRef(0)
  const frenzyCount = useRef(0)
  const nextFrenzyCombo = useRef<number>(GAME_CONFIG.frenzyCombo)
  const collectionRef = useRef<BaoType[]>([])
  const popupId = useRef(0)
  const launchEffectId = useRef(0)
  const burstSpawnsRemaining = useRef(0)

  const classicStreak = useRef(0)
  const comboShield = useRef(false)
  const matchaSlowUntil = useRef(0)
  const goldenRushUntil = useRef(0)
  const specialMessageUntil = useRef(0)

  useEffect(() => {
    try {
      const savedScore = Number(
        window.localStorage.getItem(HIGH_SCORE_KEY) || 0,
      )

      setBestScore(savedScore)

      const savedCollection = window.localStorage.getItem(COLLECTION_KEY)

      if (savedCollection) {
        const parsed: unknown = JSON.parse(savedCollection)

        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (item): item is BaoType =>
              typeof item === "string" &&
              BAO_TYPES.includes(item as BaoType),
          )

          collectionRef.current = valid
          setCollection(valid)
        }
      }

      setPlayerName(
        window.localStorage.getItem(PLAYER_NAME_KEY) || "",
      )
    } catch {
      // Storage is optional; gameplay still works without it.
    }
  }, [])

  useEffect(() => {
    const scoresQuery = query(
      firestoreCollection(db, "bao-scores"),
      orderBy("score", "desc"),
      limit(10),
    )

    const unsubscribe = onSnapshot(
      scoresQuery,
      (snapshot) => {
        setLeaderboard(
          snapshot.docs.map((document) => {
            const data = document.data()

            return {
              id: document.id,
              playerName:
                typeof data.playerName === "string"
                  ? data.playerName
                  : "Bao Buddy",
              score:
                typeof data.score === "number"
                  ? data.score
                  : 0,
            }
          }),
        )

        setLeaderboardLoading(false)
        setLeaderboardError("")
      },
      () => {
        setLeaderboardLoading(false)
        setLeaderboardError(
          "The leaderboard is temporarily unavailable.",
        )
      },
    )

    return unsubscribe
  }, [])

  const startGame = useCallback(() => {
    const now = Date.now()

    scoreRef.current = 0
    comboRef.current = 0
    lastCatchAt.current = 0
    lastSpawnAt.current = now - 500
    endAt.current = now + ROUND_LENGTH * 1000
    frenzyUntil.current = 0
    frenzyCount.current = 0
    nextFrenzyCombo.current = GAME_CONFIG.frenzyCombo
    nextId.current = 0
    launchEffectId.current = 0
    burstSpawnsRemaining.current = 0

    classicStreak.current = 0
    comboShield.current = false
    matchaSlowUntil.current = 0
    goldenRushUntil.current = 0
    specialMessageUntil.current = 0

    setLaunchEffect(null)
    setSpecialMessage("")
    setComboShieldActive(false)
    setMatchaSlowActive(false)
    setGoldenRushActive(false)

    setScore(0)
    setCombo(0)
    setTimeLeft(ROUND_LENGTH)
    baosRef.current = []
    setBaos([])
    setScorePopups([])
    setFrenzyActive(false)
    setFrenzyTimeLeft(0)
    setNewDiscovery(null)
    setScoreSubmitted(false)
    setScoreSubmitting(false)
    setSubmitMessage("")
    setPhase("playing")
  }, [])

  useEffect(() => {
    if (phase !== "playing") return

    const tick = window.setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(
        0,
        Math.ceil((endAt.current - now) / 1000),
      )

      setTimeLeft(remaining)

      if (remaining <= 0) {
        baosRef.current = []
        setPhase("finished")
        setBaos([])
        setFrenzyActive(false)
        setFrenzyTimeLeft(0)
        setComboShieldActive(false)
        setMatchaSlowActive(false)
        setGoldenRushActive(false)
        return
      }

      const frenzyRemaining = Math.max(
        0,
        frenzyUntil.current - now,
      )

      setFrenzyTimeLeft(Math.ceil(frenzyRemaining / 1000))
      setFrenzyActive(frenzyRemaining > 0)

      const matchaSlowIsActive = matchaSlowUntil.current > now
      const goldenRushIsActive = goldenRushUntil.current > now

      setMatchaSlowActive(matchaSlowIsActive)
      setGoldenRushActive(goldenRushIsActive)

      if (specialMessageUntil.current <= now) {
        setSpecialMessage("")
      }

      setScorePopups((current) =>
        current.filter((popup) => now - popup.createdAt < 800),
      )

      const currentBaos = baosRef.current

      const escapedCount = currentBaos.filter(
        (bao) => bao.status === "flying" && bao.expiresAt <= now,
      ).length

      if (escapedCount > 0) {
        classicStreak.current = 0

        if (comboShield.current && escapedCount === 1) {
          comboShield.current = false
          setComboShieldActive(false)
          setSpecialMessage("🍓 Strawberry Shield saved your combo!")
          specialMessageUntil.current = now + 2200
        } else {
          comboShield.current = false
          setComboShieldActive(false)
          comboRef.current = 0
          setCombo(0)
        }
      }

      const visible = currentBaos.filter(
        (bao) => bao.expiresAt > now,
      )

      let nextBaos = visible

      const field = playfieldRef.current
      const fieldWidth = field?.clientWidth || 600
      const fieldHeight = field?.clientHeight || 440

      const maxVisibleBaos =
        fieldWidth < 500
          ? 5
          : GAME_CONFIG.maximumVisibleBaos

      const spawnInterval =
        (burstSpawnsRemaining.current > 0
          ? 300
          : Math.max(
              350,
              GAME_CONFIG.spawnInterval - scoreRef.current * 1.5,
            )) * (matchaSlowIsActive ? 1.8 : 1)

      if (
        now - lastSpawnAt.current >= spawnInterval &&
        visible.length < maxVisibleBaos
      ) {
        lastSpawnAt.current = now

        const basket =
          BASKETS[Math.floor(Math.random() * BASKETS.length)]

        const x = 8 + Math.random() * 84
        const y = 16 + Math.random() * 52

        const launchX = ((basket.x - x) / 100) * fieldWidth
        const launchY = ((82 - y) / 100) * fieldHeight
        const type = pickBaoType()

        const newBao: Bao = {
          id: nextId.current++,
          type,
          x,
          y,
          launchX,
          launchY,
          expiresAt:
            now +
            Math.max(1300, 2300 - scoreRef.current * 3) *
              (matchaSlowIsActive
                ? GAME_CONFIG.specialAbilities.specialBaoLifetimeMultiplier
                : 1),
          status: "flying",
          points: 0,
        }

        nextBaos = [...visible, newBao]

        setLaunchEffect({
          basketId: basket.id,
          id: ++launchEffectId.current,
        })

        if (burstSpawnsRemaining.current > 0) {
          burstSpawnsRemaining.current -= 1
        } else if (Math.random() < 0.22) {
          burstSpawnsRemaining.current = 2
        }
      }

      baosRef.current = nextBaos
      setBaos(nextBaos)
    }, 80)

    return () => window.clearInterval(tick)
  }, [phase])

  useEffect(() => {
    if (phase !== "finished") return

    if (score > bestScore) {
      setBestScore(score)

      try {
        window.localStorage.setItem(HIGH_SCORE_KEY, String(score))
      } catch {
        // The high score is an optional enhancement.
      }
    }
  }, [phase, score, bestScore])

  const catchBao = useCallback(
    (bao: Bao) => {
      if (phase !== "playing" || bao.status !== "flying") return

      const now = Date.now()

      if (now >= endAt.current || bao.expiresAt <= now) return

      const nextCombo =
        now - lastCatchAt.current <= GAME_CONFIG.comboWindow
          ? comboRef.current + 1
          : 1

      const multiplier = Math.min(
        GAME_CONFIG.maximumMultiplier,
        Math.floor((nextCombo - 1) / GAME_CONFIG.comboStep) + 1,
      )

      const frenzyIsActive = frenzyUntil.current > now
      const goldenRushIsActive = goldenRushUntil.current > now

      let points =
        GAME_CONFIG.characters[bao.type].points *
        multiplier *
        (frenzyIsActive ? GAME_CONFIG.frenzyMultiplier : 1) *
        (goldenRushIsActive
          ? GAME_CONFIG.specialAbilities.goldenRushMultiplier
          : 1)

      if (bao.type === "classic") {
        classicStreak.current += 1

        if (
          classicStreak.current >=
          GAME_CONFIG.specialAbilities.classicStreak
        ) {
          points += GAME_CONFIG.specialAbilities.classicBonus
          classicStreak.current = 0
          setSpecialMessage(
            `🥟 Classic combo! +${GAME_CONFIG.specialAbilities.classicBonus} bonus points!`,
          )
          specialMessageUntil.current = now + 2500
        }
      } else {
        classicStreak.current = 0
      }

      lastCatchAt.current = now
      comboRef.current = nextCombo
      scoreRef.current += points

      if (bao.type === "strawberry") {
        comboShield.current = true
        setComboShieldActive(true)
        setSpecialMessage("🍓 Strawberry Shield activated!")
        specialMessageUntil.current = now + 2500
      }

      if (bao.type === "matcha") {
        matchaSlowUntil.current =
          now + GAME_CONFIG.specialAbilities.matchaSlowDuration

        setMatchaSlowActive(true)
        setSpecialMessage("🍵 Matcha Time! Everything slows down!")
        specialMessageUntil.current = now + 2500
      }

      if (bao.type === "golden") {
        goldenRushUntil.current =
          now + GAME_CONFIG.specialAbilities.goldenRushDuration

        setGoldenRushActive(true)
        setSpecialMessage("✨ GOLDEN RUSH! 2× points for 5 seconds!")
        specialMessageUntil.current = now + 2500
      }

      if (bao.type === "rainbow") {
        endAt.current +=
          GAME_CONFIG.specialAbilities.rainbowTimeBonus * 1000

        setTimeLeft(
          Math.ceil((endAt.current - now) / 1000),
        )

        setSpecialMessage("🌈 RAINBOW MAGIC! +5 SECONDS!")
        specialMessageUntil.current = now + 3000
      }

      setCombo(nextCombo)
      setScore(scoreRef.current)

      setScorePopups((current) => [
        ...current,
        {
          id: popupId.current++,
          x: bao.x,
          y: bao.y,
          points,
          createdAt: now,
        },
      ])

      if (
        nextCombo >= nextFrenzyCombo.current &&
        frenzyUntil.current <= now
      ) {
        frenzyCount.current += 1

        nextFrenzyCombo.current =
          GAME_CONFIG.frenzyCombo + frenzyCount.current * 5

        frenzyUntil.current = now + GAME_CONFIG.frenzyDuration

        setFrenzyActive(true)
        setFrenzyTimeLeft(
          Math.ceil(GAME_CONFIG.frenzyDuration / 1000),
        )
}

      if (!collectionRef.current.includes(bao.type)) {
        const updatedCollection = [...collectionRef.current, bao.type]

        collectionRef.current = updatedCollection
        setCollection(updatedCollection)
        setNewDiscovery(bao.type)

        try {
          window.localStorage.setItem(
            COLLECTION_KEY,
            JSON.stringify(updatedCollection),
          )
        } catch {
          // The collection is saved when storage is available.
        }
      }

      const updatedBaos = baosRef.current.map((item) =>
        item.id === bao.id
          ? {
              ...item,
              status: "caught" as const,
              points,
              expiresAt: now + 380,
            }
          : item,
      )

      baosRef.current = updatedBaos
      setBaos(updatedBaos)
    },
    [phase],
  )

  const submitScore = useCallback(async () => {
    const name = playerName.trim().slice(0, 20)

    if (
      phase !== "finished" ||
      !name ||
      score <= 0 ||
      scoreSubmitted ||
      scoreSubmitting
    ) {
      return
    }

    setScoreSubmitting(true)
    setSubmitMessage("")
    setLeaderboardError("")

    try {
      await addDoc(firestoreCollection(db, "bao-scores"), {
        playerName: name,
        score,
        createdAt: serverTimestamp(),
        roundLength: ROUND_LENGTH,
      })

      try {
        window.localStorage.setItem(PLAYER_NAME_KEY, name)
      } catch {
        // Saving the name is optional.
      }

      setPlayerName(name)
      setScoreSubmitted(true)
      setSubmitMessage("Your score is on the leaderboard!")
    } catch (error) {
      console.error("Bao score submission failed:", error)
      setSubmitMessage("Couldn't submit your score. Please try again.")
    } finally {
      setScoreSubmitting(false)
    }
  }, [phase, playerName, score, scoreSubmitted, scoreSubmitting])

  const isNewBest =
    phase === "finished" && score > 0 && score >= bestScore

  return (
    <section className="bao-game-page">
      <div className="bao-game-shell">
        <header className="bao-game-heading">
          <span className="bao-eyebrow">A little squish of happiness</span>
          <h1>
            Bao <span>Bonanza</span>
          </h1>
          <p>
            Three baskets. Loads of Baos. How many can you catch before
            time runs out?
          </p>
        </header>

        <div className="bao-game-hud">
          <div className="bao-hud-card">
            <span className="bao-hud-label">Score</span>
            <strong>{score}</strong>
          </div>

          <div
            className={`bao-hud-card bao-timer ${
              timeLeft <= 10 && phase === "playing" ? "is-urgent" : ""
            }`}
          >
            <span className="bao-hud-label">Time left</span>
            <strong>
              {timeLeft}
              <small>s</small>
            </strong>
          </div>

          <div className="bao-hud-card">
            <span className="bao-hud-label">Personal best</span>
            <strong>{bestScore}</strong>
          </div>
        </div>

        <div className="bao-playfield-wrap">
          <div className="bao-playfield-top">
            <span className="bao-steamer-label">THE BAO GARDEN</span>
            <span className="bao-combo-label">
              {frenzyActive
                ? `🔥 BAO FRENZY · ${frenzyTimeLeft}s`
                : combo >= 2 && phase === "playing"
                  ? `✨ ${combo} CATCH COMBO`
                  : "🥟 READY, SET, SQUISH!"}
            </span>
          </div>

          <div
            ref={playfieldRef}
            className={`bao-playfield ${
              phase === "playing" ? "is-playing" : ""
            } ${frenzyActive ? "is-frenzy" : ""} ${
              matchaSlowActive ? "is-matcha-slow" : ""
            } ${goldenRushActive ? "is-golden-rush" : ""}`}
          >
            <div className="bao-cloud bao-cloud--one" />
            <div className="bao-cloud bao-cloud--two" />
            <div className="bao-hill bao-hill--back" />
            <div className="bao-hill bao-hill--front" />

            {baos.map((bao) => (
              <button
                key={bao.id}
                type="button"
                className={`bao-target bao-target--${bao.type} ${
                  bao.status === "caught" ? "is-caught" : "is-launching"
                }`}
                style={
                  {
                    left: `${bao.x}%`,
                    top: `${bao.y}%`,
                    "--launch-x": `${bao.launchX}px`,
                    "--launch-y": `${bao.launchY}px`,
                  } as React.CSSProperties
                }
                onClick={() => catchBao(bao)}
                disabled={bao.status === "caught"}
                aria-label={`Catch ${GAME_CONFIG.characters[bao.type].name}`}
              >
                <Dumpling type={bao.type} />

                {bao.type !== "classic" && (
                  <span className="bao-bonus-tag">
                    +{GAME_CONFIG.characters[bao.type].points}
                  </span>
                )}

                {bao.status === "caught" && (
                  <span className="bao-squish-stars" aria-hidden="true">
                    ✦ ✧ ✦
                  </span>
                )}
              </button>
            ))}

            {scorePopups.map((popup) => (
              <div
                key={popup.id}
                className="bao-score-pop"
                style={{
                  left: `${popup.x}%`,
                  top: `${popup.y}%`,
                }}
                aria-hidden="true"
              >
                +{popup.points}
              </div>
            ))}

            {frenzyActive && (
              <div className="bao-frenzy-banner">
                ✨ BAO FRENZY! 2× POINTS ✨
              </div>
            )}

            {(comboShieldActive || matchaSlowActive || goldenRushActive) &&
              phase === "playing" && (
                <div
                  className="bao-active-abilities"
                  aria-label="Active special abilities"
                >
                  {comboShieldActive && <span>🍓 Shield ready</span>}
                  {matchaSlowActive && <span>🍵 Slow time</span>}
                  {goldenRushActive && <span>✨ 2× points</span>}
                </div>
              )}

            <div className="bao-basket-row" aria-label="Bao launch baskets">
              {BASKETS.map((basket, index) => (
                <div
                  key={`${basket.id}-${launchEffect?.basketId === basket.id ? launchEffect.id : 0}`}
                  className={`bao-launch-basket bao-launch-basket--${index + 1} ${
                    launchEffect?.basketId === basket.id ? "is-firing" : ""
                  }`}
                  style={{ left: `${basket.x}%` }}
                  aria-label={basket.label}
                >
                  <div className="bao-basket-steam">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="bao-basket-burst" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="bao-basket-rim" />
                  <div className="bao-basket-body">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ))}
            </div>

            {phase !== "playing" && (
              <div className="bao-start-overlay">
                {phase === "ready" ? (
                  <div className="bao-start-card">
                    <div className="bao-start-mascot">
                      <Dumpling type="classic" />
                    </div>
                    <span className="bao-card-kicker">
                      WELCOME TO THE BAO GARDEN
                    </span>
                    <h2>Ready to get squishy?</h2>
                    <p>
                      Catch the Baos flying out of the baskets. Chain catches,
                      find rare characters and trigger Bao Frenzy!
                    </p>
                    <button className="bao-main-button" onClick={startGame}>
                      Let&apos;s play <span>→</span>
                    </button>
                    <span className="bao-how-to-play">
                      {ROUND_LENGTH} seconds · Tap or click · Catch them all!
                    </span>
                  </div>
                ) : (
                  <div className="bao-start-card bao-results-card">
                    <div className="bao-result-emoji">
                      {isNewBest ? "🏆" : "🥟"}
                    </div>
                    <span className="bao-card-kicker">
                      {isNewBest ? "NEW PERSONAL BEST!" : "ROUND COMPLETE"}
                    </span>
                    <h2>
                      {score >= 500
                        ? "Bao-tiful work!"
                        : score >= 200
                          ? "You squished it!"
                          : "One more round?"}
                    </h2>
                    <div className="bao-final-score">
                      {score}
                      <span> points</span>
                    </div>
                    <p>
                      You discovered {collection.length} of {BAO_TYPES.length}{" "}
                      Bao characters. Can you find them all?
                    </p>

                    {!scoreSubmitted && (
                      <form
                        className="bao-score-submit"
                        onSubmit={(event) => {
                          event.preventDefault()
                          void submitScore()
                        }}
                      >
                        <label htmlFor="bao-player-name">
                          Enter your leaderboard name
                        </label>

                        <input
                          id="bao-player-name"
                          type="text"
                          value={playerName}
                          onChange={(event) =>
                            setPlayerName(event.target.value.slice(0, 20))
                          }
                          placeholder="Your player name"
                          maxLength={20}
                          autoComplete="nickname"
                          required
                        />

                        <button
                          className="bao-main-button"
                          type="submit"
                          disabled={
                            scoreSubmitting ||
                            !playerName.trim() ||
                            score <= 0
                          }
                        >
                          {scoreSubmitting
                            ? "Submitting..."
                            : "Submit my score"}
                        </button>
                      </form>
                    )}

                    {submitMessage && (
                      <p className="bao-submit-message" role="status">
                        {submitMessage}
                      </p>
                    )}

                    <button className="bao-main-button" onClick={startGame}>
                      Play again <span>↻</span>
                    </button>
                    <span className="bao-how-to-play">
                      Personal best: {bestScore} points
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {newDiscovery && phase === "playing" && (
          <div className="bao-discovery" role="status">
            ✨ NEW DISCOVERY! You found{" "}
            {GAME_CONFIG.characters[newDiscovery].name}!
            <button
              type="button"
              onClick={() => setNewDiscovery(null)}
              aria-label="Dismiss discovery message"
            >
              ×
            </button>
          </div>
        )}

        <section
          className="bao-leaderboard"
          aria-labelledby="bao-leaderboard-title"
        >
          <div className="bao-leaderboard-heading">
            <div>
              <span className="bao-eyebrow">THE BAO CHAMPIONS</span>
              <h2 id="bao-leaderboard-title">Global leaderboard</h2>
            </div>
            <span className="bao-leaderboard-trophy" aria-hidden="true">
              🏆
            </span>
          </div>

          {leaderboardLoading ? (
            <p className="bao-leaderboard-message">
              Loading the top Baos...
            </p>
          ) : leaderboardError ? (
            <p className="bao-leaderboard-message" role="status">
              {leaderboardError}
            </p>
          ) : leaderboard.length === 0 ? (
            <p className="bao-leaderboard-message">
              No scores yet. Be the first Bao champion!
            </p>
          ) : (
            <ol className="bao-leaderboard-list">
              {leaderboard.map((entry, index) => (
                <li className="bao-leaderboard-row" key={entry.id}>
                  <span
                    className={`bao-leaderboard-rank ${
                      index < 3 ? "is-top-three" : ""
                    }`}
                  >
                    {index === 0
                      ? "🥇"
                      : index === 1
                        ? "🥈"
                        : index === 2
                          ? "🥉"
                          : index + 1}
                  </span>

                  <span className="bao-leaderboard-player">
                    {entry.playerName}
                  </span>

                  <strong className="bao-leaderboard-score">
                    {entry.score.toLocaleString()}
                  </strong>
                </li>
              ))}
            </ol>
          )}

          <p className="bao-leaderboard-footer">
            Catch, collect and climb the rankings!
          </p>
        </section>

        <div className="bao-game-tips">
          {BAO_TYPES.map((type) => (
            <div className="bao-tip" key={type}>
              <span className={`bao-tip-icon bao-tip-icon--${type}`}>
                <Dumpling type={type} />
              </span>
              <div>
                <strong>{GAME_CONFIG.characters[type].name}</strong>
                <span>
                  {type === "classic"
                    ? "10 points · 3 in a row = bonus"
                    : type === "strawberry"
                      ? "20 points · Protect your combo"
                      : type === "matcha"
                        ? "20 points · Slow time"
                        : type === "golden"
                          ? "100 points · 2× points rush"
                          : "250 points · +5 seconds"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <section
          className="bao-collection"
          aria-labelledby="bao-collection-title"
        >
          <div className="bao-collection-heading">
            <h2 id="bao-collection-title">Your Bao Collection</h2>
            <span className="bao-collection-count">
              {collection.length} / {BAO_TYPES.length} discovered
            </span>
          </div>

          <div className="bao-collection-grid">
            {BAO_TYPES.map((type) => {
              const discovered = collection.includes(type)

              return (
                <div
                  className={`bao-collection-item ${
                    discovered ? "" : "is-locked"
                  }`}
                  key={type}
                >
                  <div className="bao-collection-art">
                    {discovered ? (
                      <Dumpling type={type} />
                    ) : (
                      <span aria-hidden="true">?</span>
                    )}
                  </div>
                  <strong>
                    {discovered
                      ? GAME_CONFIG.characters[type].name
                      : "Mystery Bao"}
                  </strong>
                  <span className="bao-collection-rarity">
                    {discovered
                      ? GAME_CONFIG.characters[type].rarity
                      : "Not found yet"}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <p className="bao-game-footnote">
          Catch 3 Classics in a row for bonus points. Strawberry protects your
          combo, Matcha slows incoming Baos, Golden doubles your points for 5
          seconds, and Rainbow adds 5 precious seconds to your round. Catch 10
          in a row to trigger Bao Frenzy!
        </p>
      </div>
    </section>
  )
}
