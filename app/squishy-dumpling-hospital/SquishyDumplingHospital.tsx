
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DumplingTile, { type BaoType } from "../squishy-dumpling-match/DumplingTile";
import "./squishy-dumpling-hospital.css";

type Injury = "leak" | "tear" | "crack";
type Treatment = "patch" | "plaster" | "repair";
type PatientStatus = "waiting" | "bed";

type Patient = {
  id: number;
  type: BaoType;
  injury: Injury;
  patience: number;
  status: PatientStatus;
  bed: number | null;
};

type Position = {
  x: number;
  y: number;
};

const BAO_TYPES: BaoType[] = [
  "classic",
  "strawberry",
  "matcha",
  "blueberry",
  "lavender",
  "peach",
  "golden",
  "rainbow",
];

const INJURIES: {
  id: Injury;
  name: string;
  description: string;
  treatment: Treatment;
  treatmentName: string;
  emoji: string;
  face: string;
}[] = [
  {
    id: "leak",
    name: "Leaky filling",
    description: "Their yummy filling is leaking!",
    treatment: "patch",
    treatmentName: "Filling patch",
    emoji: "💧",
    face: "🥺",
  },
  {
    id: "tear",
    name: "Torn ear",
    description: "One of their little ears needs fixing!",
    treatment: "plaster",
    treatmentName: "Cute plaster",
    emoji: "🩹",
    face: "😟",
  },
  {
    id: "crack",
    name: "Cracked wrapper",
    description: "Their wrapper needs repairing!",
    treatment: "repair",
    treatmentName: "Repair kit",
    emoji: "🧰",
    face: "😣",
  },
];

const TREATMENTS: {
  id: Treatment;
  name: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: "patch",
    name: "Filling patch",
    emoji: "💧",
    description: "Stop leaks",
  },
  {
    id: "plaster",
    name: "Cute plaster",
    emoji: "🩹",
    description: "Fix torn ears",
  },
  {
    id: "repair",
    name: "Repair kit",
    emoji: "🧰",
    description: "Fix cracks",
  },
];

const MAX_UPGRADE_LEVEL = 3;
const MAX_MISSED_PATIENTS = 3;

const BED_POSITIONS: Position[] = [
  { x: 29, y: 30 },
  { x: 50, y: 30 },
  { x: 71, y: 30 },
  { x: 29, y: 61 },
  { x: 50, y: 61 },
  { x: 71, y: 61 },
];

const DOOR_POSITION: Position = { x: 10, y: 67 };
const TROLLEY_POSITION: Position = { x: 88, y: 84 };

function getDoctorBedPosition(bedIndex: number): Position {
  const bed = BED_POSITIONS[bedIndex];
  const column = bedIndex % 3;

  return {
    x: column === 0 ? bed.x + 11 : bed.x - 11,
    y: bed.y + 7,
  };
}

function getStartingPatience(level: number, patienceUpgrade = 0) {
  return Math.max(55, 75 - (level - 1) * 2 + patienceUpgrade * 8);
}

function getArrivalDelay(level: number) {
  return Math.max(2800, 4500 - (level - 1) * 200);
}

function getBedCount(level: number) {
  if (level >= 5) return 6;
  if (level >= 3) return 5;
  return 4;
}

function getMaxWaiting(level: number) {
  return level >= 4 ? 5 : 4;
}

function createPatient(
  id: number,
  level: number,
  patienceUpgrade: number,
): Patient {
  return {
    id,
    type: BAO_TYPES[Math.floor(Math.random() * BAO_TYPES.length)],
    injury: INJURIES[Math.floor(Math.random() * INJURIES.length)].id,
    patience: getStartingPatience(level, patienceUpgrade),
    status: "waiting",
    bed: null,
  };
}

function getInjury(injury: Injury) {
  return INJURIES.find((item) => item.id === injury)!;
}

function getBaoName(type: BaoType) {
  const names: Record<BaoType, string> = {
    classic: "Cloud Cream",
    strawberry: "Strawberry Milk",
    matcha: "Matcha Mochi",
    blueberry: "Blueberry Swirl",
    lavender: "Lavender Dream",
    peach: "Peach Fizz",
    golden: "Honey Gold",
    rainbow: "Rainbow Pop",
  };

  return names[type];
}

function InjuryEffect({ injury }: { injury: Injury }) {
  return (
    <span
      className={`sdh-injury-effect sdh-injury-effect--${injury}`}
      aria-label={getInjury(injury).name}
    >
      <i />
      <i />
      <i />
    </span>
  );
}

export default function SquishyDumplingHospital() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedTreatment, setSelectedTreatment] =
    useState<Treatment | null>(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [treated, setTreated] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [coins, setCoins] = useState(0);
  const [patienceUpgrade, setPatienceUpgrade] = useState(0);
  const [speedUpgrade, setSpeedUpgrade] = useState(0);
  const [missedPatients, setMissedPatients] = useState(0);
  const [gameState, setGameState] = useState<"intro" | "playing" | "over">(
    "intro",
  );
  const [message, setMessage] = useState(
    "Welcome to the hospital! Your little patients need you.",
  );
  const [doctorPosition, setDoctorPosition] =
    useState<Position>(DOOR_POSITION);
  const [doctorMoving, setDoctorMoving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [discharged, setDischarged] = useState<number[]>([]);
  const [examinedIds, setExaminedIds] = useState<number[]>([]);
  const [arrivingId, setArrivingId] = useState<number | null>(null);

  const nextId = useRef(1);
  const comboRef = useRef(0);
  const bestScoreRef = useRef(0);
  const gameStateRef = useRef<"intro" | "playing" | "over">("intro");
  const actionRef = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(callback, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  }, []);

  const moveDoctor = useCallback(
    (position: Position, callback?: () => void) => {
      setDoctorPosition(position);
      setDoctorMoving(true);

      schedule(() => {
        setDoctorMoving(false);
        callback?.();
      }, Math.max(300, 520 - speedUpgrade * 70));
    },
    [schedule, speedUpgrade],
  );

  useEffect(() => {
    try {
      const saved = Number(
        window.localStorage.getItem("sdh-hospital-best-score") || 0,
      );

      if (Number.isFinite(saved)) {
        setBestScore(saved);
        bestScoreRef.current = saved;
      }
    } catch {
      // Best-score saving is optional.
    }

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const finishGame = useCallback(() => {
    if (gameStateRef.current !== "playing") return;

    gameStateRef.current = "over";
    actionRef.current += 1;

    setGameState("over");
    setSelectedId(null);
    setSelectedTreatment(null);
    setBusy(false);
    setDoctorMoving(false);
    setMessage("The hospital is closed for now. Great work, doctor!");

    setScore((currentScore) => {
      const nextBest = Math.max(currentScore, bestScoreRef.current);
      bestScoreRef.current = nextBest;
      setBestScore(nextBest);

      try {
        window.localStorage.setItem(
          "sdh-hospital-best-score",
          String(nextBest),
        );
      } catch {
        // Saving a high score is optional.
      }

      return currentScore;
    });
  }, []);

  const startGame = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    actionRef.current += 1;
    nextId.current = 1;
    comboRef.current = 0;
    gameStateRef.current = "playing";

    setPatients([]);
    setSelectedId(null);
    setSelectedTreatment(null);
    setScore(0);
    setSeconds(0);
    setTreated(0);
    setCombo(0);
    setLevel(1);
    setCoins(0);
    setPatienceUpgrade(0);
    setSpeedUpgrade(0);
    setMissedPatients(0);
    setDischarged([]);
    setExaminedIds([]);
    setArrivingId(null);
    setDoctorPosition(DOOR_POSITION);
    setDoctorMoving(false);
    setBusy(false);
    setMessage("Your first patient is on the way!");
    setGameState("playing");
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1);

      setPatients((current) => {
        const expired = current.filter((patient) => patient.patience <= 1);

        if (expired.length > 0) {
          schedule(() => {
            setMissedPatients((count) => {
              const nextCount = count + expired.length;

              if (nextCount >= MAX_MISSED_PATIENTS) {
                schedule(finishGame, 0);
                setMessage(
                  "Too many little patients have gone untreated! Time to regroup, doctor.",
                );
              } else {
                setMessage(
                  `${expired.length === 1 ? "A patient has" : `${expired.length} patients have`} left untreated. You can miss ${MAX_MISSED_PATIENTS - nextCount} more before your shift ends!`,
                );
              }

              return nextCount;
            });
          }, 0);
        }

        return current
          .filter((patient) => patient.patience > 1)
          .map((patient) => ({
            ...patient,
            patience: patient.patience - 1,
          }));
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [gameState, finishGame, schedule]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const arrival = window.setInterval(() => {
      setPatients((current) => {
        if (gameStateRef.current !== "playing") return current;

        const waiting = current.filter(
          (patient) => patient.status === "waiting",
        );

        if (waiting.length >= getMaxWaiting(level)) {
          setMessage(
            "The waiting room is full! Admit or treat a patient to make space.",
          );
          return current;
        }

        const patient = createPatient(
          nextId.current++,
          level,
          patienceUpgrade,
        );

        setArrivingId(patient.id);
        setMessage(
          `${getBaoName(patient.type)} has arrived! ${getInjury(patient.injury).description}`,
        );

        schedule(() => {
          setArrivingId((currentId) =>
            currentId === patient.id ? null : currentId,
          );
        }, 450);

        return [...current, patient];
      });
    }, getArrivalDelay(level));

    return () => window.clearInterval(arrival);
  }, [gameState, level, patienceUpgrade, finishGame, schedule]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const newLevel = Math.floor(treated / 5) + 1;

    if (newLevel !== level) {
      setLevel(newLevel);

      if (newLevel === 3) {
        setMessage(
          "LEVEL 3! A fifth bed is now open. Keep those dumplings moving!",
        );
      } else if (newLevel === 5) {
        setMessage(
          "LEVEL 5! Your sixth bed is unlocked. It's getting busy!",
        );
      } else {
        setMessage(
          `Level ${newLevel}! The hospital is getting busier. Keep treating those little dumplings!`,
        );
      }
    }
  }, [treated, level, gameState]);

  const selectedPatient = patients.find(
    (patient) => patient.id === selectedId,
  );

  const waitingPatients = patients.filter(
    (patient) => patient.status === "waiting",
  );

  const bedPatients = patients.filter(
    (patient) => patient.status === "bed",
  );

  const activeBedCount = getBedCount(level);

  const buyUpgrade = (upgrade: "patience" | "speed") => {
    if (gameState !== "playing" || busy) return;

    const currentLevel =
      upgrade === "patience" ? patienceUpgrade : speedUpgrade;

    if (currentLevel >= MAX_UPGRADE_LEVEL) {
      setMessage("That upgrade is already fully powered up!");
      return;
    }

    const cost = (currentLevel + 1) * 25;

    if (coins < cost) {
      setMessage(
        `You need ${cost} coins for this upgrade. Treat more patients!`,
      );
      return;
    }

    setCoins((current) => current - cost);

    if (upgrade === "patience") {
      setPatienceUpgrade((current) => current + 1);
      setPatients((current) =>
        current.map((patient) => ({
          ...patient,
          patience: Math.min(
            getStartingPatience(level, patienceUpgrade + 1),
            patient.patience + 5,
          ),
        })),
      );
      setMessage(
        "Patience boost purchased! All patients get a little more time.",
      );
    } else {
      setSpeedUpgrade((current) => current + 1);
      setMessage("Speed boost purchased! Your nurse can move faster.");
    }
  };

  const admitPatient = (bedIndex: number) => {
    if (gameState !== "playing") return;

    if (bedIndex >= activeBedCount) {
      setMessage(
        `Bed ${bedIndex + 1} unlocks at level ${bedIndex === 4 ? 3 : 5}. Keep treating patients!`,
      );
      return;
    }

    const bedPatient = patients.find(
      (patient) => patient.status === "bed" && patient.bed === bedIndex,
    );

    if (bedPatient) {
      if (busy) return;

      setSelectedId(bedPatient.id);
      setSelectedTreatment(null);

      if (examinedIds.includes(bedPatient.id)) {
        const injury = getInjury(bedPatient.injury);
        setMessage(
          `Diagnosis: ${injury.name}. ${injury.description} Choose the ${injury.treatmentName}.`,
        );
        return;
      }

      const actionId = ++actionRef.current;

      setBusy(true);
      setMessage(`The nurse is examining ${getBaoName(bedPatient.type)}...`);

      moveDoctor(getDoctorBedPosition(bedIndex), () => {
        if (
          gameStateRef.current !== "playing" ||
          actionRef.current !== actionId
        ) {
          return;
        }

        schedule(() => {
          if (
            gameStateRef.current !== "playing" ||
            actionRef.current !== actionId
          ) {
            return;
          }

          const injury = getInjury(bedPatient.injury);

          setExaminedIds((current) =>
            current.includes(bedPatient.id)
              ? current
              : [...current, bedPatient.id],
          );

          setBusy(false);
          setMessage(
            `🩺 Diagnosis: ${injury.name}! ${injury.description} Choose the ${injury.treatmentName}.`,
          );
        }, 900);
      });

      return;
    }

    const waitingPatient = patients.find(
      (patient) => patient.id === selectedId && patient.status === "waiting",
    );

    if (!waitingPatient) {
      if (!busy) {
        setMessage("Choose a waiting patient, then click an empty bed.");
      }
      return;
    }

    // Admit the patient without interrupting the nurse's current task.
    setPatients((current) =>
      current.map((patient) =>
        patient.id === waitingPatient.id
          ? { ...patient, status: "bed", bed: bedIndex }
          : patient,
      ),
    );

    setArrivingId(waitingPatient.id);
    setSelectedId(waitingPatient.id);

    if (!busy) {
      setSelectedTreatment(null);
      setMessage(
        `Patient admitted! Click ${getBaoName(waitingPatient.type)} in their bed to examine them.`,
      );
    }

    schedule(() => {
      setArrivingId((currentId) =>
        currentId === waitingPatient.id ? null : currentId,
      );
    }, 450);
  };

  const treatPatient = (treatment: Treatment) => {
    if (gameState !== "playing" || busy) return;

    if (!selectedPatient || selectedPatient.status !== "bed") {
      setMessage("Select a patient in a bed before choosing a treatment.");
      return;
    }

    if (!examinedIds.includes(selectedPatient.id)) {
      setMessage("The nurse needs to examine this patient first!");
      return;
    }

    const patient = selectedPatient;
    const injury = getInjury(patient.injury);
    const actionId = ++actionRef.current;

    setBusy(true);
    setSelectedTreatment(treatment);
    setMessage(`Rushing to the trolley for the ${treatment}...`);

    moveDoctor(TROLLEY_POSITION, () => {
      if (
        gameStateRef.current !== "playing" ||
        actionRef.current !== actionId
      ) {
        return;
      }

      setMessage(
        "Supplies collected! The nurse is rushing back to the patient...",
      );

      moveDoctor(getDoctorBedPosition(patient.bed!), () => {
        if (
          gameStateRef.current !== "playing" ||
          actionRef.current !== actionId
        ) {
          return;
        }

        if (injury.treatment !== treatment) {
          setPatients((current) =>
            current.map((item) =>
              item.id === patient.id
                ? { ...item, patience: Math.max(1, item.patience - 5) }
                : item,
            ),
          );

          comboRef.current = 0;
          setCombo(0);
          setBusy(false);
          setSelectedTreatment(null);
          setMessage(
            `Not quite! ${injury.name} needs a ${injury.treatmentName}. The patient has lost patience!`,
          );
          return;
        }

        setMessage("Applying treatment...");

        schedule(() => {
          if (
            gameStateRef.current !== "playing" ||
            actionRef.current !== actionId
          ) {
            return;
          }

          const points = 10 + Math.min(comboRef.current, 10) * 2;

          comboRef.current += 1;
          setCombo(comboRef.current);
          setScore((current) => current + points);
          setCoins((current) => current + 10);
          setTreated((current) => current + 1);

          setPatients((current) =>
            current.filter((item) => item.id !== patient.id),
          );

          setExaminedIds((current) =>
            current.filter((id) => id !== patient.id),
          );

          setSelectedId((current) =>
            current === patient.id ? null : current,
          );
          setSelectedTreatment(null);
          setDischarged((current) => [...current, patient.id]);
          setMessage(
            `All fixed! +${points} points and 10 coins. The nurse is heading back to the entrance!`,
          );

          schedule(() => {
            setDischarged((current) =>
              current.filter((id) => id !== patient.id),
            );
          }, 1000);

          moveDoctor(DOOR_POSITION, () => {
            if (
              gameStateRef.current !== "playing" ||
              actionRef.current !== actionId
            ) {
              return;
            }

            setBusy(false);
          });
        }, Math.max(220, 350 - speedUpgrade * 50));
      });
    });
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  return (
    <main className="sdh-game">
      <header className="sdh-header">
        <div className="sdh-brand">
          <span className="sdh-brand-icon" aria-hidden="true">🏥</span>
          <div>
            <p className="sdh-eyebrow">SQUISHY WORLD</p>
            <h1>Squishy Dumpling Hospital</h1>
            <p className="sdh-subtitle">
              Rush around, rescue your patients and keep them smiling!
            </p>
          </div>
        </div>

        <div className="sdh-stats">
          <div className="sdh-stat"><span>⭐ Score</span><strong>{score}</strong></div>
          <div className="sdh-stat"><span>💖 Treated</span><strong>{treated}</strong></div>
          <div className="sdh-stat"><span>🪙 Coins</span><strong>{coins}</strong></div>
          <div className="sdh-stat"><span>🏆 Best</span><strong>{bestScore}</strong></div>
          <div className="sdh-stat"><span>⏱ Time</span><strong>{formatTime(seconds)}</strong></div>
        </div>
      </header>

      <div className="sdh-gamebar">
        <div className="sdh-level">
          <span className="sdh-level-heart">💗</span>
          <span>LEVEL <strong>{level}</strong></span>
        </div>
        <p className="sdh-message" role="status" aria-live="polite">{message}</p>
        {combo > 1 && gameState === "playing" && (
          <span className="sdh-combo">🔥 {combo} combo!</span>
        )}
      </div>

      <section className="sdh-hospital">
        <div className="sdh-hospital-top">
          <div className="sdh-hospital-sign">
            <span aria-hidden="true">✚</span>
            DUMPLING CARE CENTRE
          </div>
          <div className="sdh-hospital-lights" aria-hidden="true">
            <span /><span /><span />
          </div>
        </div>

        <div className="sdh-hospital-interior">
          <aside className="sdh-waiting-area">
            <div className="sdh-section-heading">
              <div><span className="sdh-section-emoji">🚪</span><h2>Waiting room</h2></div>
              <span className="sdh-counter">{waitingPatients.length}/{getMaxWaiting(level)}</span>
            </div>
            <p className="sdh-help">Click a patient, then click an empty bed.</p>

            <div className="sdh-waiting-patients">
              {waitingPatients.map((patient) => {
                const isSelected = selectedId === patient.id;
                const patiencePercent =
                  (patient.patience / getStartingPatience(level, patienceUpgrade)) * 100;

                return (
                  <button
                    className={`sdh-patient ${isSelected ? "is-selected" : ""} ${arrivingId === patient.id ? "is-arriving" : ""} ${patient.patience <= 10 ? "is-panicking" : ""}`}
                    key={patient.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(patient.id);

                      if (!busy) {
                        setSelectedTreatment(null);
                        setMessage(
                          `${getBaoName(patient.type)} needs a check-up. Choose an empty bed to admit them!`,
                        );
                      }
                    }}
                    aria-pressed={isSelected}
                    disabled={gameState !== "playing"}
                  >
                    <span className="sdh-patient-art">
                      <DumplingTile type={patient.type} small />
                      <InjuryEffect injury={patient.injury} />
                      <span className="sdh-injury-bubble">{getInjury(patient.injury).emoji}</span>
                    </span>
                    <span className="sdh-patient-name">{getBaoName(patient.type)}</span>
                    <span className="sdh-patient-face">
                      {patient.patience <= 10 ? "😵 Hurry, please!" : getInjury(patient.injury).face}
                      {" "}{getInjury(patient.injury).name}
                    </span>
                    <span className="sdh-patience">
                      <span
                        className={patient.patience <= 10 ? "is-urgent" : ""}
                        style={{ width: `${patiencePercent}%` }}
                      />
                    </span>
                    <span className="sdh-patience-label">{patient.patience}s left</span>
                  </button>
                );
              })}

              {waitingPatients.length === 0 && (
                <div className="sdh-empty-waiting"><span>🪑</span><p>Waiting for our next little patient...</p></div>
              )}
            </div>
            <div className="sdh-arrival-note"><span>✨</span> New patients bounce in automatically!</div>
          </aside>

          <section className="sdh-scene-wrap">
            <div className="sdh-scene-heading">
              <span>🩺 Treatment ward</span>
              <span>{bedPatients.length}/{activeBedCount} beds occupied</span>
            </div>

            <div className="sdh-scene">
              <div className="sdh-back-wall">
                <div className="sdh-window"><span /><span /><span /><span /></div>
                <div className="sdh-wall-clock">🕒</div>
                <div className="sdh-wall-poster">BE KIND<br /><span>♡</span><br />HEAL WELL</div>
                <div className="sdh-wall-shelf"><span>🪴</span><span>🧴</span><span>🧸</span></div>
              </div>

              <div className="sdh-floor">
                <div className="sdh-floor-grid" />

                <div className="sdh-door">
                  <span className="sdh-door-sign">ENTRANCE</span>
                  <span className="sdh-door-panel"><i /></span>
                  <span className="sdh-door-mat">WELCOME!</span>
                </div>

                {BED_POSITIONS.map((position, index) => {
                  const unlocked = index < activeBedCount;
                  const patient = bedPatients.find((item) => item.bed === index);
                  const injury = patient ? getInjury(patient.injury) : null;
                  const isSelected = patient?.id === selectedId;
                  const hasDiagnosis =
                    patient !== undefined && examinedIds.includes(patient.id);

                  return (
                    <button
                      key={index}
                      type="button"
                      className={`sdh-room-bed sdh-room-bed-${index + 1} ${patient ? "has-patient" : ""} ${isSelected ? "is-selected" : ""} ${!unlocked ? "is-locked" : ""}`}
                      style={{ left: `${position.x}%`, top: `${position.y}%` }}
                      onClick={() => admitPatient(index)}
                      aria-label={
                        !unlocked
                          ? `Bed ${index + 1}, locked`
                          : patient
                            ? `Bed ${index + 1}: ${hasDiagnosis ? injury?.name : "Needs examination"}`
                            : `Admit patient to bed ${index + 1}`
                      }
                      disabled={gameState !== "playing"}
                    >
                      <span className="sdh-bed-frame" />
                      <span className="sdh-room-pillow" />
                      <span className="sdh-room-blanket" />
                      <span className="sdh-room-bed-label">BED {index + 1}</span>

                      {!unlocked ? (
                        <span className="sdh-locked-bed">🔒<small>LEVEL {index === 4 ? 3 : 5}</small></span>
                      ) : patient ? (
                        <>
                          <span
                            className={`sdh-room-patient ${arrivingId === patient.id ? "is-arriving" : ""} ${patient.patience <= 10 ? "is-panicking" : ""}`}
                            style={{
                              left: "50%",
                              top: "45%",
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            <DumplingTile type={patient.type} small />
                            <InjuryEffect injury={patient.injury} />
                          </span>
                          <span className={`sdh-health-bubble ${patient.patience <= 10 ? "is-urgent" : ""}`}>
                            <strong>{hasDiagnosis ? injury?.emoji : "❔"}</strong>
                            <span>{hasDiagnosis ? injury?.face : "🥺"}</span>
                            <i>{patient.patience}s</i>
                          </span>
                          <span className="sdh-room-injury">
                            {hasDiagnosis ? injury?.name : "Needs examination"}
                          </span>
                          {isSelected && <span className="sdh-selected-tag">YOUR PATIENT ♥</span>}
                        </>
                      ) : (
                        <span className="sdh-room-empty">＋<small>Empty bed</small></span>
                      )}
                    </button>
                  );
                })}

                <div className="sdh-monitor">
                  <span className="sdh-monitor-screen">♡<i>⌁⌁</i></span>
                  <span className="sdh-monitor-stand" />
                </div>

                <div className="sdh-plant">🪴</div>

                <div className="sdh-trolley" aria-label="Treatment trolley">
                  <div className="sdh-trolley-sign">MEDICAL SUPPLIES</div>
                  <div className="sdh-trolley-top">
                    {TREATMENTS.map((treatment) => (
                      <button
                        key={treatment.id}
                        type="button"
                        className={`sdh-trolley-tool ${selectedTreatment === treatment.id ? "is-selected" : ""}`}
                        onClick={() => treatPatient(treatment.id)}
                        disabled={gameState !== "playing" || busy}
                        title={`${treatment.name}: ${treatment.description}`}
                        aria-label={treatment.name}
                      >
                        <span>{treatment.emoji}</span>
                        <small>{treatment.name}</small>
                      </button>
                    ))}
                  </div>
                  <div className="sdh-trolley-drawer"><span>✚</span><span>✚</span></div>
                  <div className="sdh-trolley-wheels"><i /><i /></div>
                </div>

                <div
                  className={`sdh-doctor ${doctorMoving ? "is-moving" : ""}`}
                  style={{
                    left: `${doctorPosition.x}%`,
                    top: `${doctorPosition.y}%`,
                    transform: `translate(-50%, -78%) scale(${0.78 + doctorPosition.y / 300})`,
                  }}
                  aria-label="Doctor dumpling"
                >
                  <span className="sdh-doctor-shadow" />
                  <span className="sdh-doctor-hat">🩺</span>
                  <DumplingTile type="classic" small />
                  <span className="sdh-doctor-feet"><i /><i /></span>
                  {doctorMoving && <span className="sdh-running-dust">✦</span>}
                </div>

                {discharged.length > 0 && (
                  <div className="sdh-discharge-pop">💖 All better!</div>
                )}
              </div>
            </div>

            <div className="sdh-scene-help">
              <span>👆</span>
              {busy
                ? "The nurse is on the move! Hang tight..."
                : selectedPatient?.status === "bed" && !examinedIds.includes(selectedPatient.id)
                  ? `Click ${getBaoName(selectedPatient.type)} in their bed to examine them.`
                  : selectedPatient?.status === "bed"
                    ? `Diagnosis complete! Choose the correct supply for ${getBaoName(selectedPatient.type)}.`
                    : "Select a waiting patient, then click a bed to admit them."}
            </div>
          </section>
        </div>

        <section className="sdh-tools-area">
          <div className="sdh-section-heading">
            <div><span className="sdh-section-emoji">🧰</span><h2>Treatment guide</h2></div>
            {selectedPatient?.status === "bed" && examinedIds.includes(selectedPatient.id) && (
              <span className="sdh-treatment-hint">
                Patient needs: {getInjury(selectedPatient.injury).treatmentName}
              </span>
            )}
          </div>

          <div className="sdh-tools">
            {TREATMENTS.map((treatment) => (
              <div className="sdh-tool" key={treatment.id}>
                <span className="sdh-tool-emoji">{treatment.emoji}</span>
                <span className="sdh-tool-name">{treatment.name}</span>
                <span className="sdh-tool-description">{treatment.description}</span>
              </div>
            ))}
          </div>

          <div className="sdh-upgrades">
            <div className="sdh-upgrades-heading">
              <div>
                <span className="sdh-section-emoji">⬆️</span>
                <h2>Hospital upgrades</h2>
              </div>
              <span className="sdh-upgrade-wallet">🪙 {coins} coins</span>
            </div>

            <div className="sdh-upgrade-list">
              <div className="sdh-upgrade-card">
                <span className="sdh-upgrade-icon">💖</span>
                <div className="sdh-upgrade-copy">
                  <strong>Extra patience</strong>
                  <span>Give patients 8 extra seconds and restore a little patience to current patients.</span>
                  <small>Upgrade {patienceUpgrade}/{MAX_UPGRADE_LEVEL}</small>
                </div>
                <button
                  type="button"
                  onClick={() => buyUpgrade("patience")}
                  disabled={gameState !== "playing" || busy || patienceUpgrade >= MAX_UPGRADE_LEVEL}
                >
                  {patienceUpgrade >= MAX_UPGRADE_LEVEL
                    ? "MAX LEVEL"
                    : `🪙 ${(patienceUpgrade + 1) * 25}`}
                </button>
              </div>

              <div className="sdh-upgrade-card">
                <span className="sdh-upgrade-icon">⚡</span>
                <div className="sdh-upgrade-copy">
                  <strong>Super speedy nurse</strong>
                  <span>Move between beds and the trolley faster.</span>
                  <small>Upgrade {speedUpgrade}/{MAX_UPGRADE_LEVEL}</small>
                </div>
                <button
                  type="button"
                  onClick={() => buyUpgrade("speed")}
                  disabled={gameState !== "playing" || busy || speedUpgrade >= MAX_UPGRADE_LEVEL}
                >
                  {speedUpgrade >= MAX_UPGRADE_LEVEL
                    ? "MAX LEVEL"
                    : `🪙 ${(speedUpgrade + 1) * 25}`}
                </button>
              </div>
            </div>

            <p className="sdh-upgrade-note">
              Earn 10 coins for every successfully treated patient. New beds unlock at levels 3 and 5.
            </p>
          </div>
        </section>
      </section>

      <footer className="sdh-footer">
        <span>💗 Be gentle, little doctor!</span>
        <span>Examine each patient, collect the right supply and bring it back to their bed.</span>
      </footer>

      {gameState !== "playing" && (
        <div className="sdh-overlay">
          <div className="sdh-modal">
            <div className="sdh-modal-icon" aria-hidden="true">{gameState === "intro" ? "🏥" : "💗"}</div>
            <p className="sdh-eyebrow">{gameState === "intro" ? "WELCOME, LITTLE DOCTOR" : "SHIFT COMPLETE"}</p>
            <h2>{gameState === "intro" ? "The dumpling hospital needs you!" : "What a caring doctor!"}</h2>
            <p className="sdh-modal-description">
              {gameState === "intro"
                ? "Admit your dumpling patients, examine them to discover their injuries, then fetch the right supplies and rush back to treat them. Earn coins for upgrades and unlock more beds as you level up."
                : `You treated ${treated} dumpling${treated === 1 ? "" : "s"} and earned ${score} points. Ready for another shift?`}
            </p>

            {gameState === "over" && (
              <div className="sdh-results">
                <div><span>⭐ Final score</span><strong>{score}</strong></div>
                <div><span>💖 Patients helped</span><strong>{treated}</strong></div>
                <div><span>🪙 Coins earned</span><strong>{coins}</strong></div>
                <div><span>🏆 Best score</span><strong>{bestScore}</strong></div>
              </div>
            )}

            <button type="button" className="sdh-start-button" onClick={startGame}>
              {gameState === "intro" ? "Open the hospital!" : "Start a new shift"} <span>→</span>
            </button>
            <p className="sdh-modal-footnote">
              {gameState === "intro" ? "Patches, plasters and lots of love included." : "Your best score is saved on this device."}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
