import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ✅ Task 3 has its own layout/CSS (Figma)
import styles from "./World1Task3Screen.module.css";

const MAIN_MENU_ROUTE = "/world1";
const TASK_SELECTOR_ROUTE = "/world1/tasks";

const asset = (p) => `${process.env.PUBLIC_URL}${p}`;

// ✅ Task3 assets (public/world1/task3)
const BG = asset("/world1/task3/bg.png");
const ICON_POINTS = asset("/world1/task3/points.png");
const ICON_CURIOSITY_POINTS = asset("/world1/task3/curiositypoints.png");

// Part 1 buttons (YES / NOT SURE / NO)
const BTN_YES = asset("/world1/task3/correct.png");
const BTN_NOT_SURE = asset("/world1/task3/middle.png");
const BTN_NO = asset("/world1/task3/wrong.png");

// Badges
const BADGE_BEGINNER = asset("/world1/task3/beginner.png");
const BADGE_ADVANCED = asset("/world1/task3/advanced.png");
const BADGE_EXPERT = asset("/world1/task3/expert.png");
const BADGE_CURIOSITY = asset("/world1/task3/curiosity.png");

/**
 * ✅ DATA
 * NOTE: If you already have your final text/logic in a doc, just replace these objects.
 * Structure is kept stable for gameplay.
 */
const CASES = [
  {
    id: 1,
    statement:
      'A JOURNALIST PUBLISHES AN INVESTIGATION ABOUT MISUSE OF PUBLIC MONEY. THE GOVERNMENT LABELS IT "HARMFUL" AND SHUTS THE OUTLET DOWN.',
    // Part 1: choose YES / NOT_SURE / NO (use your correct mapping)
    part1Correct: "NO",
    part1Why:
      "SHUTTING DOWN INDEPENDENT MEDIA IS A MAJOR RIGHTS AND ACCOUNTABILITY PROBLEM. IN DEMOCRACY, CRITICISM AND INVESTIGATION MUST BE PROTECTED.",
    // Part 2: choose the right path
    paths: [
      { key: "A", label: "ACCEPT IT — THE GOVERNMENT KNOWS BEST.", correct: false },
      {
        key: "B",
        label: "SUPPORT LEGAL CHALLENGE + PUBLIC PRESSURE + SOLIDARITY WITH JOURNALISTS",
        correct: true,
      },
      { key: "C", label: "IGNORE — IT'S NOT MY PROBLEM.", correct: false },
      { key: "D", label: "FIGHT WITH THREATS AND VIOLENCE.", correct: false },
    ],
    pathWhy:
      "THE BEST RESPONSE IS LEGAL CHALLENGE + PUBLIC PRESSURE AND SOLIDARITY. IT PROTECTS RIGHTS WITHOUT ESCALATING HARM.",
  },
  {
    id: 2,
    statement:
      'THE GOVERNMENT PASSES A LAW ALLOWING IT TO BAN PROTESTS FOR "PUBLIC ORDER" WITHOUT CLEAR LIMITS OR OVERSIGHT.',
    part1Correct: "NO",
    part1Why:
      "BROAD POWERS WITHOUT CLEAR LIMITS CAN BE USED TO SILENCE DISSENT. PROTEST RIGHTS REQUIRE OVERSIGHT AND PROPORTIONATE RULES.",
    paths: [
      { key: "A", label: "STAY QUIET — IT DOESN'T AFFECT ME.", correct: false },
      { key: "B", label: "SUPPORT LEGAL REVIEW + PUBLIC DEBATE + CLEAR SAFEGUARDS", correct: true },
      { key: "C", label: "SPREAD MISINFORMATION ONLINE.", correct: false },
      { key: "D", label: "THREATEN OFFICIALS.", correct: false },
    ],
    pathWhy:
      "LEGAL REVIEW + PUBLIC DEBATE + CLEAR SAFEGUARDS PROTECTS FREEDOMS WHILE KEEPING ORDER PROPORTIONATE.",
  },
  {
    id: 3,
    statement:
      "A NEW RULE REQUIRES ALL NGOS RECEIVING FOREIGN DONATIONS TO REGISTER AND PUBLISH DONORS, WITH VAGUE PENALTIES.",
    part1Correct: "NOT_SURE",
    part1Why:
      "TRANSPARENCY CAN BE OKAY, BUT VAGUE PENALTIES CAN BE ABUSED. DEMOCRACY NEEDS CLEAR, FAIR RULES.",
    paths: [
      { key: "A", label: "ACCEPT ANYTHING — IT'S FINE.", correct: false },
      { key: "B", label: "ASK FOR CLEAR LIMITS + INDEPENDENT OVERSIGHT", correct: true },
      { key: "C", label: "HARASS NGO STAFF.", correct: false },
      { key: "D", label: "DO NOTHING.", correct: false },
    ],
    pathWhy:
      "THE RIGHT PATH IS TO DEMAND CLEAR LIMITS AND OVERSIGHT — IT PRESERVES TRANSPARENCY WITHOUT ENABLING ABUSE.",
  },
  {
    id: 4,
    statement:
      "AN ELECTION COMMISSION CHANGES POLLING STATION LOCATIONS WITH 24H NOTICE, DISPROPORTIONATELY AFFECTING ONE REGION.",
    part1Correct: "NO",
    part1Why:
      "LAST-MINUTE CHANGES CAN UNDERMINE FAIR ACCESS TO VOTING. ELECTIONS MUST BE PREDICTABLE AND EQUAL.",
    paths: [
      { key: "A", label: "IGNORE IT.", correct: false },
      { key: "B", label: "DEMAND TRANSPARENCY + INDEPENDENT MONITORING + FAIR NOTICE", correct: true },
      { key: "C", label: "SPREAD HATE.", correct: false },
      { key: "D", label: "FIGHT AND ESCALATE.", correct: false },
    ],
    pathWhy:
      "TRANSPARENCY + MONITORING + FAIR NOTICE PROTECTS ELECTION INTEGRITY WITHOUT HARM.",
  },
];

export default function World1Task3Screen() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ player name comes from setup screen state (fallback)
  const player = location.state || {};
  const nameUpper = (player?.name || player?.playerName || "PLAYER").toString().toUpperCase();

  const bgStyle = useMemo(() => ({ backgroundImage: `url(${BG})` }), []);

  // ✅ Top message (same idea as other tasks)
  const TOP_MESSAGES = useMemo(
    () => [`${nameUpper} KEEP GOING`, `${nameUpper} STAY SHARP`, `${nameUpper} THINK CRITICALLY`],
    [nameUpper]
  );
  const [topMessage, setTopMessage] = useState(TOP_MESSAGES[0]);
  const pickTopMessage = () => {
    setTopMessage((prev) => {
      const pool = TOP_MESSAGES.filter((m) => m !== prev);
      return pool[Math.floor(Math.random() * pool.length)] || prev;
    });
  };

  // ✅ gameplay state
  const [caseIndex, setCaseIndex] = useState(0);
  const current = CASES[caseIndex];
  const [phase, setPhase] = useState("A"); // A = YES/NOT SURE/NO, B = choose path

  const [points, setPoints] = useState(0);
  const [curiosityPoints, setCuriosityPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // ✅ overlays
  const [correctFlash, setCorrectFlash] = useState(false);
  const [flyText, setFlyText] = useState(null);
  const flyTimer = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");

  const [endOpen, setEndOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (flyTimer.current) window.clearTimeout(flyTimer.current);
    };
  }, []);

  const showCorrect = () => {
    setCorrectFlash(true);
    window.setTimeout(() => setCorrectFlash(false), 520);
  };

  const showFly = (txt) => {
    setFlyText(txt);
    if (flyTimer.current) window.clearTimeout(flyTimer.current);
    flyTimer.current = window.setTimeout(() => setFlyText(null), 900);
  };

  const openModal = (text) => {
    setModalText(text);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const resolveSkillBadge = (correct) => {
    if (correct <= 1) return { id: "beginner", src: BADGE_BEGINNER };
    if (correct <= 3) return { id: "advanced", src: BADGE_ADVANCED };
    return { id: "expert", src: BADGE_EXPERT };
  };
  const buildEarnedBadges = (correct, curiosity) => {
    const earned = [resolveSkillBadge(correct)];
    if (curiosity >= 5) earned.push({ id: "curiosity", src: BADGE_CURIOSITY });
    return earned;
  };

  const safeRead = (key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  const safeWrite = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };

  const saveResultsForAchievements = ({ taskPoints, taskCuriosity, badges }) => {
    safeWrite("yd_world1_task3", {
      points: taskPoints,
      curiosityPoints: taskCuriosity,
      badges: badges.map((b) => ({ id: b.id, src: b.src })),
      correctCount,
      totalCases: CASES.length,
      finishedAt: Date.now(),
    });

    const prev = safeRead("yd_scores") || { totalPoints: 0, totalCuriosityPoints: 0, badges: [] };
    const markerKey = "yd_world1_task3_counted";
    const alreadyCounted = safeRead(markerKey);

    if (!alreadyCounted) {
      const mergedBadges = [
        ...(Array.isArray(prev.badges) ? prev.badges : []),
        ...badges.map((b) => ({ id: b.id, src: b.src })),
      ];

      safeWrite("yd_scores", {
        totalPoints: (prev.totalPoints || 0) + taskPoints,
        totalCuriosityPoints: (prev.totalCuriosityPoints || 0) + taskCuriosity,
        badges: mergedBadges,
      });

      safeWrite(markerKey, true);
    }
  };

  const finishTask = () => {
    const earned = buildEarnedBadges(correctCount, curiosityPoints);
    saveResultsForAchievements({ taskPoints: points, taskCuriosity: curiosityPoints, badges: earned });
    setEndOpen(true);
  };

  const nextCase = () => {
    setCaseIndex((i) => {
      const next = i + 1;
      if (next >= CASES.length) {
        window.setTimeout(() => finishTask(), 80);
        return i;
      }
      return next;
    });
    setPhase("A");
  };

  // ✅ PART 1 handler
  const handleChoice = (choice) => {
    if (!current || modalOpen || endOpen) return;
    pickTopMessage();

    // ✅ Curiosity: choosing "NOT SURE" gives +1 curiosity point (and fixes unused setter lint)
    if (choice === "NOT_SURE") {
      setCuriosityPoints((c) => c + 1);
    }

    const isCorrect = choice === current.part1Correct;
    if (isCorrect) {
      showCorrect();
      showFly("+2");
      setCorrectCount((c) => c + 1);
      window.setTimeout(() => setPoints((p) => p + 2), 520);
      window.setTimeout(() => setPhase("B"), 560);
    } else {
      openModal(current.part1Why || "NOT QUITE. THINK AGAIN.");
    }
  };

  // ✅ PART 2 handler
  const handlePath = (key) => {
    if (!current || modalOpen || endOpen) return;
    pickTopMessage();

    const picked = current.paths?.find((p) => p.key === key);
    if (!picked) return;

    if (picked.correct) {
      showCorrect();
      showFly("+2");
      setCorrectCount((c) => c + 1);
      window.setTimeout(() => setPoints((p) => p + 2), 520);
      window.setTimeout(() => nextCase(), 620);
    } else {
      openModal(current.pathWhy || "NOT QUITE. TRY A DIFFERENT PATH.");
    }
  };

  // close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && modalOpen) closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  // ✅ No useMemo -> no CI ESLint warning about buildEarnedBadges changing deps
  const earnedBadges = buildEarnedBadges(correctCount, curiosityPoints);

  const goMainMenu = () => navigate(MAIN_MENU_ROUTE, { state: player });
  const goTaskSelector = () => navigate(TASK_SELECTOR_ROUTE, { state: player });

  return (
    <div className={styles.screen} style={bgStyle}>
      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>{topMessage}</div>

        <div className={styles.topRight}>
          <div className={styles.scoreItem}>
            <img src={ICON_POINTS} alt="Points" className={styles.scoreIcon} />
            <span className={styles.scoreValue}>{points}</span>
          </div>
          <div className={styles.scoreItem}>
            <img src={ICON_CURIOSITY_POINTS} alt="Curiosity" className={styles.scoreIcon} />
            <span className={styles.scoreValue}>{curiosityPoints}</span>
          </div>
        </div>
      </div>

      {/* CORRECT FLASH */}
      {correctFlash && (
        <div className={styles.correctOverlay} aria-hidden="true">
          <div className={styles.correctBox}>CORRECT</div>
        </div>
      )}

      {/* SIMPLE +2 FLY */}
      {flyText && <div className={styles.pointsFly}>{flyText}</div>}

      {/* CENTERED CONTENT */}
      <div className={styles.centerWrap}>
        <div className={styles.card}>
          {phase === "A" && <div className={styles.cardText}>{current?.statement || ""}</div>}

          {phase === "B" && (
            <div className={styles.part2Layout}>
              <div className={styles.part2TextCol}>
                <div className={styles.part2Statement}>{current?.statement || ""}</div>
              </div>

              <div className={styles.pathsGrid}>
                {current?.paths?.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    className={styles.pathBtn}
                    onClick={() => handlePath(p.key)}
                  >
                    <div className={styles.pathKey}>{p.key}</div>
                    <div className={styles.pathLabel}>{p.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PART 1 BUTTONS BELOW THE BOX */}
        {phase === "A" && (
          <div className={styles.choiceRow}>
            <button type="button" className={styles.choiceBtn} onClick={() => handleChoice("YES")}>
              <img src={BTN_YES} alt="YES" />
            </button>
            <button
              type="button"
              className={styles.choiceBtn}
              onClick={() => handleChoice("NOT_SURE")}
            >
              <img src={BTN_NOT_SURE} alt="NOT SURE" />
            </button>
            <button type="button" className={styles.choiceBtn} onClick={() => handleChoice("NO")}>
              <img src={BTN_NO} alt="NO" />
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className={styles.modalBackdrop} onMouseDown={closeModal} role="presentation">
          <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal>
            <button type="button" className={styles.modalClose} onClick={closeModal} aria-label="Close">
              ×
            </button>
            <div className={styles.modalBody}>{modalText}</div>
            <button type="button" className={styles.modalCta} onClick={closeModal}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* END */}
      {endOpen && (
        <div className={styles.endBackdrop} role="presentation">
          <div className={styles.endModal} role="dialog" aria-modal>
            <button type="button" className={styles.endClose} onClick={goMainMenu} aria-label="Close">
              ×
            </button>

            <div className={styles.endTitle}>BRAVO {nameUpper} YOU NAILED IT!</div>
            <div className={styles.endMeta}>POINTS: {points}</div>
            <div className={styles.endMeta}>CURIOSITY POINTS: {curiosityPoints}</div>

            <div className={styles.endBadgeWrap}>
              {earnedBadges.map((b) => (
                <img key={b.id} src={b.src} alt={b.id} className={styles.endBadge} />
              ))}
            </div>

            <div className={styles.endBtns}>
              <button type="button" className={styles.endBtn} onClick={goMainMenu}>
                GO BACK TO MAIN MENU
              </button>
              <button type="button" className={styles.endBtn} onClick={goTaskSelector}>
                COLLECT BADGES AND GO TO TASKS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
