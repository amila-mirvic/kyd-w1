import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ✅ Re-use Task1 CSS da bude 1:1 (header, animacije, reward box, fly animacije…)
import styles from "../World1Task1/World1Task1Screen.module.css";

// ⬇️ prilagodi ove rute ako su ti drugačije u projektu
const MAIN_MENU_ROUTE = "/world1";
const TASK_SELECTOR_ROUTE = "/world1/tasks";
const TASK3_ROUTE = "/world1/task3";

const asset = (p) => `${process.env.PUBLIC_URL}${p}`;

// ✅ Task3 assets (public/world1/task3)
const BG = asset("/world1/task3/bg.png");
const ICON_POINTS = asset("/world1/task3/points.png");
const ICON_CURIOSITY_POINTS = asset("/world1/task3/curiositypoints.png");

const BTN_CORRECT = asset("/world1/task3/correct.png"); // YES
const BTN_MIDDLE = asset("/world1/task3/middle.png");   // NOT SURE
const BTN_WRONG = asset("/world1/task3/wrong.png");     // NO

const BADGE_BEGINNER = asset("/world1/task3/beginner.png");
const BADGE_ADVANCED = asset("/world1/task3/advanced.png");
const BADGE_EXPERT = asset("/world1/task3/expert.png");
const BADGE_CURIOSITY = asset("/world1/task3/curiosity.png");

// ✅ zamijeni tekstove/tačne odgovore po potrebi (ovo je primjer strukture)
const STATEMENTS = [
  {
    id: 1,
    text: "A journalist publishes an investigation about misuse of public money. The government labels it “harmful” and shuts the outlet down.",
    correct: "wrong", // ✅ (example) choose correct/middle/wrong
    wrongFeedback: "Not quite. Shutting down media is a serious rights issue.",
  },
  {
    id: 2,
    text: "The government passes a law allowing it to ban protests for “public order” without clear limits or oversight.",
    correct: "wrong",
    wrongFeedback: "Not quite. Broad bans without oversight can be abusive.",
  },
  {
    id: 3,
    text: "A new rule requires all NGOs receiving foreign donations to register and publish donors, with vague penalties.",
    correct: "middle",
    wrongFeedback: "Not quite. Transparency can be okay, but vague penalties are risky.",
  },
  {
    id: 4,
    text: "An election commission changes polling station locations with 24h notice, disproportionately affecting one region.",
    correct: "wrong",
    wrongFeedback: "Not quite. Late changes can undermine fair access.",
  },
];

export default function World1Task3Screen() {
  const navigate = useNavigate();
  const location = useLocation();

  // player name comes from state (setup screen) – fallback
  const player = location.state || {};
  const nameUpper = (player?.name || player?.playerName || "PLAYER").toString().toUpperCase();

  // background
  const bgStyle = useMemo(
    () => ({
      backgroundImage: `url(${BG})`,
    }),
    []
  );

  // top message same style as Task1
  const TOP_MESSAGES = useMemo(
    () => [
      `${nameUpper} KEEP GOING`,
      `${nameUpper} YOU’VE GOT THIS`,
      `${nameUpper} STAY SHARP`,
      `${nameUpper} THINK CRITICALLY`,
    ],
    [nameUpper]
  );
  const [topMessage, setTopMessage] = useState(TOP_MESSAGES[0]);
  const pickNewTopMessage = () => {
    setTopMessage((prev) => {
      const pool = TOP_MESSAGES.filter((m) => m !== prev);
      return pool[Math.floor(Math.random() * pool.length)] || prev;
    });
  };

  // game state
  const [index, setIndex] = useState(0);
  const current = STATEMENTS[index];

  const [points, setPoints] = useState(0);
  const [curiosityPoints, setCuriosityPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // ✅ reward overlay like Task1
  const [rewardOpen, setRewardOpen] = useState(false);
  const [rewardLabel, setRewardLabel] = useState("CORRECT");
  const rewardTimerRef = useRef(null);

  const showReward = (label, ms = 520) => {
    setRewardLabel(label);
    setRewardOpen(true);
    if (rewardTimerRef.current) clearTimeout(rewardTimerRef.current);
    rewardTimerRef.current = setTimeout(() => setRewardOpen(false), ms);
  };

  useEffect(() => {
    return () => {
      if (rewardTimerRef.current) clearTimeout(rewardTimerRef.current);
    };
  }, []);

  // ✅ fly-to-ui animation like Task1
  const pointsTargetRef = useRef(null);
  const curiosityTargetRef = useRef(null);
  const statementCardRef = useRef(null);

  const [flyItems, setFlyItems] = useState([]);
  const flyIdRef = useRef(1);

  const [pulsePoints, setPulsePoints] = useState(false);
  const [pulseCuriosity, setPulseCuriosity] = useState(false);

  const makeFly = ({ type, icon, delta }) => {
    const fromRect = statementCardRef.current?.getBoundingClientRect();
    const toRect =
      type === "points"
        ? pointsTargetRef.current?.getBoundingClientRect()
        : curiosityTargetRef.current?.getBoundingClientRect();

    if (!fromRect || !toRect) return;

    const fromX = fromRect.left + fromRect.width * 0.62;
    const fromY = fromRect.top + fromRect.height * 0.35;

    const toX = toRect.left + toRect.width * 0.45;
    const toY = toRect.top + toRect.height * 0.5;

    const id = flyIdRef.current++;
    setFlyItems((arr) => [...arr, { id, type, icon, delta, fromX, fromY, toX, toY }]);

    window.setTimeout(() => {
      setFlyItems((arr) => arr.filter((x) => x.id !== id));

      if (type === "points") {
        setPulsePoints(true);
        window.setTimeout(() => setPulsePoints(false), 420);
      } else {
        setPulseCuriosity(true);
        window.setTimeout(() => setPulseCuriosity(false), 420);
      }
    }, 820);
  };

  // popup for wrong feedback (Task1 style)
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupText, setPopupText] = useState("");

  const openPopup = (text) => {
    setPopupText(text);
    setPopupOpen(true);
  };
  const closePopup = () => setPopupOpen(false);

  // locks
  const answerLockRef = useRef(false);

  // end popup like Task1
  const [endOpen, setEndOpen] = useState(false);
  const endLockRef = useRef(false);

  const resolveSkillBadge = (correct) => {
    if (correct <= 1) return { id: "beginner", src: BADGE_BEGINNER };
    if (correct <= 3) return { id: "advanced", src: BADGE_ADVANCED };
    return { id: "expert", src: BADGE_EXPERT };
  };

  const buildEarnedBadges = (correct, curiosity) => {
    const earned = [];
    earned.push(resolveSkillBadge(correct));
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
      totalQuestions: STATEMENTS.length,
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

  const openEndPopup = () => {
    if (endLockRef.current) return;
    endLockRef.current = true;

    const earned = buildEarnedBadges(correctCount, curiosityPoints);
    saveResultsForAchievements({
      taskPoints: points,
      taskCuriosity: curiosityPoints,
      badges: earned,
    });

    setEndOpen(true);
  };

  const goMainMenu = () => navigate(MAIN_MENU_ROUTE, { state: player });
  const goTaskSelector = () => navigate(TASK_SELECTOR_ROUTE, { state: player });

  const goNext = () => {
    setIndex((i) => {
      const next = i + 1;
      if (next >= STATEMENTS.length) {
        window.setTimeout(() => openEndPopup(), 80);
        return i;
      }
      return next;
    });
  };

  const handleAnswer = (choice) => {
    if (!current || answerLockRef.current || endOpen) return;
    answerLockRef.current = true;

    pickNewTopMessage();

    if (choice === current.correct) {
      showReward("CORRECT", 520);

      setCorrectCount((c) => c + 1);

      // +2 points (Task1 behavior)
      makeFly({ type: "points", icon: ICON_POINTS, delta: "+2" });
      window.setTimeout(() => setPoints((p) => p + 2), 520);

      window.setTimeout(() => {
        goNext();
        answerLockRef.current = false;
      }, 700);

      return;
    }

    openPopup(current.wrongFeedback || "Not quite. Think again.");
    window.setTimeout(() => {
      answerLockRef.current = false;
    }, 250);
  };

  // close popups on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && popupOpen) closePopup();
      if (e.key === "Escape" && endOpen) goMainMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupOpen, endOpen]);

  const earnedBadges = useMemo(() => buildEarnedBadges(correctCount, curiosityPoints), [
    correctCount,
    curiosityPoints,
  ]);

  return (
    <div className={styles.screen} style={bgStyle}>
      <div className={styles.overlay}>
        {/* TOP BAR (identical styling via Task1 CSS) */}
        <div className={styles.topBar}>
          <div className={styles.topLeft}>{topMessage}</div>

          <div className={styles.topRight}>
            <div className={[styles.stat, pulsePoints ? styles.statPulse : ""].join(" ")}>
              <img ref={pointsTargetRef} src={ICON_POINTS} alt="Points" className={styles.statIcon} />
              <span className={styles.statNum}>{points}</span>
            </div>

            <div className={[styles.stat, pulseCuriosity ? styles.statPulse : ""].join(" ")}>
              <img
                ref={curiosityTargetRef}
                src={ICON_CURIOSITY_POINTS}
                alt="Curiosity points"
                className={styles.statIcon}
              />
              <span className={styles.statNum}>{curiosityPoints}</span>
            </div>
          </div>
        </div>

        {/* STATEMENT CARD */}
        <div ref={statementCardRef} className={styles.statementCard}>
          {/* ✅ no WHY button in Task3 */}
          <div className={styles.statementText}>{current?.text || "…"}</div>
        </div>

        {/* ANSWER BUTTONS (correct / not sure / wrong) */}
        <div className={styles.answerRow}>
          <button
            type="button"
            className={styles.answerBtn}
            onClick={() => handleAnswer("correct")}
            aria-label="Yes"
          >
            <img src={BTN_CORRECT} alt="Yes" />
          </button>

          <button
            type="button"
            className={styles.answerBtn}
            onClick={() => handleAnswer("middle")}
            aria-label="Not sure"
          >
            <img src={BTN_MIDDLE} alt="Not sure" />
          </button>

          <button
            type="button"
            className={styles.answerBtn}
            onClick={() => handleAnswer("wrong")}
            aria-label="No"
          >
            <img src={BTN_WRONG} alt="No" />
          </button>
        </div>

        {/* REWARD OVERLAY */}
        {rewardOpen && (
          <div className={styles.rewardOverlay} aria-hidden="true">
            <div className={styles.rewardCard}>
              <div className={styles.rewardText}>{rewardLabel}</div>
            </div>
          </div>
        )}

        {/* FLY ITEMS */}
        {flyItems.map((it) => (
          <div
            key={it.id}
            className={styles.flyWrap}
            style={{
              left: it.fromX,
              top: it.fromY,
              ["--toX"]: `${it.toX}px`,
              ["--toY"]: `${it.toY}px`,
            }}
            aria-hidden="true"
          >
            <div className={styles.flyInner}>
              <img src={it.icon} alt="" className={styles.flyIcon} />
              <div className={styles.flyDelta}>{it.delta}</div>
            </div>
          </div>
        ))}

        {/* WRONG POPUP */}
        {popupOpen && (
          <div className={styles.popupBackdrop} onMouseDown={closePopup} role="presentation">
            <div
              className={styles.popupCard}
              onMouseDown={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <button type="button" className={styles.popupClose} onClick={closePopup} aria-label="Close">
                ×
              </button>

              <div className={styles.popupText}>{popupText}</div>
            </div>
          </div>
        )}

        {/* END POPUP (Task1 style, updated for Task3) */}
        {endOpen && (
          <div className={styles.endBackdrop} role="presentation">
            <div className={styles.endCard} role="dialog" aria-modal="true">
              <button type="button" className={styles.endClose} onClick={goMainMenu} aria-label="Close">
                ×
              </button>

              <div className={styles.endTitle}>BRAVO {nameUpper} YOU NAILED IT!</div>

              <div className={styles.endStats}>
                <div className={styles.endStatLine}>POINTS: {points}</div>
                <div className={styles.endStatLine}>CURIOSITY POINTS: {curiosityPoints}</div>
              </div>

              <div className={styles.endBadges}>
                {earnedBadges.map((b) => (
                  <img key={b.id} src={b.src} alt={b.id} className={styles.endBadgeImg} />
                ))}
              </div>

              <div className={styles.endActions}>
                <button type="button" className={styles.endActionBtn} onClick={goMainMenu}>
                  GO BACK TO MAIN MENU
                </button>
                <button type="button" className={styles.endActionBtn} onClick={goTaskSelector}>
                  COLLECT BADGES AND GO TO TASKS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
