import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./World1Task1Screen.module.css";

const MAIN_MENU_ROUTE = "/world1";
const TASK_SELECTOR_ROUTE = "/world1/tasks";

const asset = (p) => `${process.env.PUBLIC_URL}${p}`;

/* Background (public/world1/task1/) */
const BG = asset("/world1/task1/bg.png");

/* Top right icons (public/world1/task1/) */
const ICON_POINTS = asset("/world1/task1/points.png");
const ICON_CURIOSITY_POINTS = asset("/world1/task1/curiositypoints.png");

/* Answer buttons (public/world1/task1/) */
const BTN_YES = asset("/world1/task1/correct.png");
const BTN_NOT_SURE = asset("/world1/task1/middle.png");
const BTN_NO = asset("/world1/task1/wrong.png");

/* Badges (public/badges/) */
const BADGE_BEGINNER = asset("/badges/beginner.png");
const BADGE_ADVANCED = asset("/badges/advanced.png");
const BADGE_EXPERT = asset("/badges/expert.png");
const BADGE_CURIOSITY = asset("/badges/curiosity.png");

/* ✅ pure helper (outside component) so hooks don't complain about changing dependencies */
const resolveSkillBadge = (correct) => {
  if (correct <= 1) return { id: "beginner", src: BADGE_BEGINNER };
  if (correct <= 3) return { id: "advanced", src: BADGE_ADVANCED };
  return { id: "expert", src: BADGE_EXPERT };
};

const CASES = [
  {
    id: 1,
    statement:
      "A POLITICIAN SAYS THAT ONLY CERTAIN PEOPLE DESERVE TO VOTE BECAUSE OTHERS ARE “NOT EDUCATED ENOUGH.”",
    correct: "NO",
    why:
      "IN DEMOCRACY, EVERY ADULT CITIZEN SHOULD HAVE THE RIGHT TO VOTE. LIMITING VOTING BASED ON EDUCATION IS UNFAIR AND UNDEMOCRATIC.",
  },
  {
    id: 2,
    statement:
      "A GOVERNMENT REPORT REVEALS CORRUPTION, BUT THE AUTHORITIES REFUSE TO INVESTIGATE AND HIDE THE DOCUMENT.",
    correct: "NO",
    why:
      "DEMOCRACY REQUIRES TRANSPARENCY AND ACCOUNTABILITY. HIDING CORRUPTION UNDERMINES TRUST AND RULE OF LAW.",
  },
  {
    id: 3,
    statement:
      "AN OPPOSITION PARTY IS NOT ALLOWED TO CAMPAIGN IN PUBLIC SPACES, WHILE THE RULING PARTY CAN.",
    correct: "NO",
    why:
      "FAIR ELECTIONS REQUIRE EQUAL OPPORTUNITY FOR ALL PARTIES. BANNING ONLY THE OPPOSITION IS NOT DEMOCRATIC.",
  },
  {
    id: 4,
    statement:
      "A MAYOR INVITES CITIZENS TO PARTICIPATE IN A PUBLIC MEETING TO DISCUSS THE CITY BUDGET.",
    correct: "YES",
    why:
      "PARTICIPATION IS A KEY PART OF DEMOCRACY. INVITING CITIZENS TO DISCUSS THE BUDGET SUPPORTS TRANSPARENCY AND ENGAGEMENT.",
  },
];

export default function World1Task1Screen() {
  const navigate = useNavigate();
  const location = useLocation();

  const player = location.state || {};
  const nameUpper = (player?.name || player?.playerName || "PLAYER").toString().toUpperCase();

  const bgStyle = useMemo(() => ({ backgroundImage: `url(${BG})` }), []);

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

  const [caseIndex, setCaseIndex] = useState(0);
  const current = CASES[caseIndex];

  const [points, setPoints] = useState(0);
  const [curiosityPoints, setCuriosityPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

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

  const buildEarnedBadges = useCallback((correct, curiosity) => {
    const earned = [resolveSkillBadge(correct)];
    if (curiosity >= 5) earned.push({ id: "curiosity", src: BADGE_CURIOSITY });
    return earned;
  }, []);

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
  };

  const handleChoice = (choice) => {
    if (!current || modalOpen || endOpen) return;
    pickTopMessage();

    if (choice === "NOT_SURE") setCuriosityPoints((c) => c + 1);

    const isCorrect = choice === current.correct;
    if (isCorrect) {
      showCorrect();
      showFly("+2");
      setCorrectCount((c) => c + 1);
      window.setTimeout(() => setPoints((p) => p + 2), 520);
      window.setTimeout(() => nextCase(), 620);
    } else {
      openModal(current.why || "NOT QUITE. THINK AGAIN.");
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && modalOpen) closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  // ✅ no useMemo -> no CI deps warnings
  const earnedBadges = buildEarnedBadges(correctCount, curiosityPoints);

  const goMainMenu = () => navigate(MAIN_MENU_ROUTE, { state: player });
  const goTaskSelector = () => navigate(TASK_SELECTOR_ROUTE, { state: player });

  return (
    <div className={styles.screen} style={bgStyle}>
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

      {correctFlash && (
        <div className={styles.correctOverlay} aria-hidden="true">
          <div className={styles.correctBox}>CORRECT</div>
        </div>
      )}

      {flyText && <div className={styles.pointsFly}>{flyText}</div>}

      <div className={styles.card}>
        <div className={styles.cardText}>{current?.statement || ""}</div>

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
      </div>

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
