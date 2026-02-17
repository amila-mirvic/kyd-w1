import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./World1Task1Screen.module.css";

const MAIN_MENU_ROUTE = "/world1";
const TASK_SELECTOR_ROUTE = "/world1/tasks";

const asset = (p) => `${process.env.PUBLIC_URL}${p}`;

// ✅ Assets
const BG = asset("/world1/task1/bg.png");

const ICON_POINTS = asset("/ui/points.png");
const ICON_CURIOSITY = asset("/ui/curiositypoints.png");

const BTN_CORRECT = asset("/world1/task1/correct.png"); // green
const BTN_MIDDLE = asset("/world1/task1/middle.png"); // yellow
const BTN_WRONG = asset("/world1/task1/wrong.png"); // red

const BADGE_BEGINNER = asset("/badges/beginner.png");
const BADGE_ADVANCED = asset("/badges/advanced.png");
const BADGE_EXPERT = asset("/badges/expert.png");
const BADGE_CURIOSITY = asset("/badges/curiosity.png");

const CASES = [
  {
    id: 1,
    statement:
      "A JOURNALIST PUBLISHES AN INVESTIGATION ABOUT MISUSE OF PUBLIC MONEY. THE GOVERNMENT LABELS IT “HARMFUL” AND SHUTS THE OUTLET DOWN.",
    correct: "wrong",
    whyCorrect:
      "SHUTTING DOWN INDEPENDENT MEDIA IS A MAJOR RIGHTS AND ACCOUNTABILITY PROBLEM. IN DEMOCRACY, CRITICISM AND INVESTIGATION MUST BE PROTECTED.",
  },
  {
    id: 2,
    statement:
      "THE GOVERNMENT PASSES A LAW ALLOWING IT TO BAN PROTESTS FOR “PUBLIC ORDER” WITHOUT CLEAR LIMITS OR OVERSIGHT.",
    correct: "wrong",
    whyCorrect:
      "BROAD POWERS WITHOUT CLEAR LIMITS CAN BE USED TO SILENCE DISSENT. PROTEST RIGHTS REQUIRE OVERSIGHT AND PROPORTIONATE RULES.",
  },
  {
    id: 3,
    statement:
      "A NEW RULE REQUIRES ALL NGOS RECEIVING FOREIGN DONATIONS TO REGISTER AND PUBLISH DONORS, WITH VAGUE PENALTIES.",
    correct: "middle",
    whyCorrect:
      "TRANSPARENCY CAN BE OKAY, BUT VAGUE PENALTIES CAN BE ABUSED. DEMOCRACY NEEDS CLEAR, FAIR RULES.",
  },
  {
    id: 4,
    statement:
      "AN ELECTION COMMISSION CHANGES POLLING STATION LOCATIONS WITH 24H NOTICE, DISPROPORTIONATELY AFFECTING ONE REGION.",
    correct: "wrong",
    whyCorrect:
      "LAST-MINUTE CHANGES CAN UNDERMINE FAIR ACCESS TO VOTING. ELECTIONS MUST BE PREDICTABLE AND EQUAL.",
  },
];

export default function World1Task1Screen() {
  const navigate = useNavigate();
  const location = useLocation();

  const player = location.state || {};
  const nameUpper = (player?.name || player?.playerName || "PLAYER").toString().toUpperCase();

  const bgStyle = useMemo(() => ({ backgroundImage: `url(${BG})` }), []);

  // Top message
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

  // Progress
  const [caseIndex, setCaseIndex] = useState(0);
  const current = CASES[caseIndex];

  const [points, setPoints] = useState(0);
  const [curiosityPoints, setCuriosityPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // overlays
  const [correctFlash, setCorrectFlash] = useState(false);
  const [fly, setFly] = useState(null); // { text, toX, toY }
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

  const showFly = (text, toX, toY) => {
    setFly({ text, toX, toY });
    if (flyTimer.current) window.clearTimeout(flyTimer.current);
    flyTimer.current = window.setTimeout(() => setFly(null), 900);
  };

  const openModal = (text) => {
    setModalText(text);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

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

  const resolveSkillBadge = (correct) => {
    if (correct <= 1) return { id: "beginner", src: BADGE_BEGINNER };
    if (correct <= 3) return { id: "advanced", src: BADGE_ADVANCED };
    return { id: "expert", src: BADGE_EXPERT };
  };

  const buildEarnedBadges = useCallback((correct, curiosity) => {
    const earned = [resolveSkillBadge(correct)];
    if (curiosity >= 5) earned.push({ id: "curiosity", src: BADGE_CURIOSITY });
    return earned;
  }, []);

  const saveResultsForAchievements = useCallback(
    ({ taskPoints, taskCuriosity, badges }) => {
      safeWrite("yd_world1_task1", {
        points: taskPoints,
        curiosityPoints: taskCuriosity,
        badges: badges.map((b) => ({ id: b.id, src: b.src })),
        correctCount,
        totalCases: CASES.length,
        finishedAt: Date.now(),
      });

      const prev = safeRead("yd_scores") || { totalPoints: 0, totalCuriosityPoints: 0, badges: [] };
      const markerKey = "yd_world1_task1_counted";
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
    },
    [correctCount]
  );

  const finishTask = useCallback(() => {
    const earned = buildEarnedBadges(correctCount, curiosityPoints);
    saveResultsForAchievements({
      taskPoints: points,
      taskCuriosity: curiosityPoints,
      badges: earned,
    });
    setEndOpen(true);
  }, [buildEarnedBadges, correctCount, curiosityPoints, points, saveResultsForAchievements]);

  const nextCase = () => {
    setCaseIndex((i) => {
      const next = i + 1;
      if (next >= CASES.length) {
        window.setTimeout(() => finishTask(), 60);
        return i;
      }
      return next;
    });
  };

  const handlePick = (pick) => {
    if (!current || modalOpen || endOpen) return;
    pickTopMessage();

    const isCorrect = pick === current.correct;
    if (isCorrect) {
      showCorrect();
      setCorrectCount((c) => c + 1);

      // points
      setPoints((p) => p + 2);
      showFly("+2", 0, -26);

      // curiosity for middle answer (optional logic)
      if (pick === "middle") setCuriosityPoints((c) => c + 1);

      window.setTimeout(() => nextCase(), 620);
    } else {
      openModal(current.whyCorrect || "NOT QUITE. THINK AGAIN.");
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

  const earnedBadges = useMemo(() => buildEarnedBadges(correctCount, curiosityPoints), [
    correctCount,
    curiosityPoints,
    buildEarnedBadges,
  ]);

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
            <img src={ICON_CURIOSITY} alt="Curiosity" className={styles.scoreIcon} />
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

      {/* points fly */}
      {fly && (
        <div
          className={styles.pointsFly}
          style={{
            "--toX": `${fly.toX}px`,
            "--toY": `${fly.toY}px`,
          }}
        >
          {fly.text}
        </div>
      )}

      {/* MAIN CARD */}
      <div className={styles.card}>
        <div className={styles.cardText}>{current?.statement || ""}</div>

        {/* choices */}
        <div className={styles.choiceRow}>
          <button type="button" className={styles.choiceBtn} onClick={() => handlePick("correct")}>
            <img src={BTN_CORRECT} alt="YES" />
          </button>

          <button type="button" className={styles.choiceBtn} onClick={() => handlePick("middle")}>
            <img src={BTN_MIDDLE} alt="NOT SURE" />
          </button>

          <button type="button" className={styles.choiceBtn} onClick={() => handlePick("wrong")}>
            <img src={BTN_WRONG} alt="NO" />
          </button>
        </div>
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
