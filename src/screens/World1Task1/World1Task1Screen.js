import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./World1Task1Screen.module.css";

const asset = (p) => `${process.env.PUBLIC_URL}${p}`;

const BG = asset("/world1/task1bg.png");
const ICON_POINTS = asset("/world1/task1/points.png");
const ICON_CURIOSITY_POINTS = asset("/world1/task1/curiositypoints.png");
const BTN_YES = asset("/world1/task1/correct.png");
const BTN_NOT_SURE = asset("/world1/task1/middle.png");
const BTN_NO = asset("/world1/task1/wrong.png");
const ICON_WHY = asset("/world1/task1/why.png");

const BADGE_BEGINNER = asset("/world1/task1/beginner.png");
const BADGE_ADVANCED = asset("/world1/task1/advanced.png");
const BADGE_EXPERT = asset("/world1/task1/expert.png");
const BADGE_CURIOSITY = asset("/world1/task1/curiosity.png");

const MAIN_MENU_ROUTE = "/world1";
const TASK_SELECTOR_ROUTE = "/world1/tasks";

const QUESTIONS = [
  {
    id: 1,
    text: "A journalist publishes an investigation about misuse of public money. The government labels it “harmful” and shuts the outlet down.",
    correct: "no",
    whyText:
      "Shutting down independent media is a major rights and accountability problem. In a democracy, criticism and investigation must be protected.",
  },
  {
    id: 2,
    text: "The government passes a law allowing it to ban protests for “public order” without clear limits or oversight.",
    correct: "no",
    whyText:
      "Broad bans without limits or oversight can be abused. Restrictions must be specific, proportionate, and reviewable.",
  },
  {
    id: 3,
    text: "A new rule requires all NGOs receiving foreign donations to register and publish donors, with vague penalties.",
    correct: "notSure",
    whyText:
      "Transparency can be legitimate, but vague penalties and unclear definitions can be used to intimidate civil society.",
  },
  {
    id: 4,
    text: "An election commission changes polling station locations with 24h notice, disproportionately affecting one region.",
    correct: "no",
    whyText:
      "Late changes can undermine equal access to vote and can be used to suppress turnout. Fair elections require stability and transparency.",
  },
];

export default function World1Task1Screen() {
  const navigate = useNavigate();
  const location = useLocation();

  const player = location.state || {};
  const nameUpper = (player?.name || player?.playerName || "PLAYER").toString().toUpperCase();

  const bgStyle = useMemo(() => ({ backgroundImage: `url(${BG})` }), []);

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

  const [points, setPoints] = useState(0);
  const [curiosityPoints, setCuriosityPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const pointsTargetRef = useRef(null);
  const curiosityTargetRef = useRef(null);
  const cardRef = useRef(null);

  const [flyItems, setFlyItems] = useState([]);
  const flyIdRef = useRef(1);

  const [pulsePoints, setPulsePoints] = useState(false);
  const [pulseCuriosity, setPulseCuriosity] = useState(false);

  const makeFly = ({ type, icon, delta }) => {
    const fromRect = cardRef.current?.getBoundingClientRect();
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

  const [whyOpen, setWhyOpen] = useState(false);
  const [whyText, setWhyText] = useState("");
  const whyUsesRef = useRef(0);

  const openWhy = (text) => {
    setWhyText(text || "");
    setWhyOpen(true);
  };
  const closeWhy = () => setWhyOpen(false);

  const [endOpen, setEndOpen] = useState(false);
  const endLockRef = useRef(false);

  const resolveSkillBadge = useCallback((correct) => {
    if (correct <= 1) return { id: "beginner", src: BADGE_BEGINNER };
    if (correct <= 3) return { id: "advanced", src: BADGE_ADVANCED };
    return { id: "expert", src: BADGE_EXPERT };
  }, []);

  // ✅ STABILNO (useCallback) -> nema useMemo dependency warning
  const buildEarnedBadges = useCallback(
    (correct, curiosity) => {
      const earned = [];
      earned.push(resolveSkillBadge(correct));
      if (curiosity >= 5) earned.push({ id: "curiosity", src: BADGE_CURIOSITY });
      return earned;
    },
    [resolveSkillBadge]
  );

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
      totalQuestions: QUESTIONS.length,
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

  const [index, setIndex] = useState(0);
  const current = QUESTIONS[index];
  const answerLockRef = useRef(false);

  const goNext = () => {
    setIndex((i) => {
      const next = i + 1;
      if (next >= QUESTIONS.length) {
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

    const isCorrect =
      (choice === "yes" && current.correct === "yes") ||
      (choice === "no" && current.correct === "no") ||
      (choice === "notSure" && current.correct === "notSure");

    if (isCorrect) {
      showReward("CORRECT", 520);
      setCorrectCount((c) => c + 1);

      makeFly({ type: "points", icon: ICON_POINTS, delta: "+2" });
      window.setTimeout(() => setPoints((p) => p + 2), 520);

      window.setTimeout(() => {
        goNext();
        answerLockRef.current = false;
      }, 700);

      return;
    }

    showReward("WRONG", 520);
    window.setTimeout(() => {
      answerLockRef.current = false;
    }, 520);
  };

  const handleWhy = () => {
    if (!current?.whyText || endOpen) return;

    const nextUses = whyUsesRef.current + 1;
    whyUsesRef.current = nextUses;

    if (nextUses <= 3) {
      makeFly({ type: "curiosity", icon: ICON_CURIOSITY_POINTS, delta: "+1" });
      window.setTimeout(() => setCuriosityPoints((c) => c + 1), 520);
    }

    openWhy(current.whyText);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && whyOpen) closeWhy();
      if (e.key === "Escape" && endOpen) goMainMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whyOpen, endOpen]);

  const earnedBadges = useMemo(
    () => buildEarnedBadges(correctCount, curiosityPoints),
    [buildEarnedBadges, correctCount, curiosityPoints]
  );

  return (
    <div className={styles.screen} style={bgStyle}>
      <div className={styles.overlay}>
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

        <div ref={cardRef} className={styles.statementCard}>
          <button type="button" className={styles.whyBtn} onClick={handleWhy} aria-label="Why">
            <img src={ICON_WHY} alt="" />
          </button>

          <div className={styles.statementText}>{current?.text || "…"}</div>
        </div>

        <div className={styles.answerRow}>
          <button type="button" className={styles.answerBtn} onClick={() => handleAnswer("yes")} aria-label="Yes">
            <img src={BTN_YES} alt="Yes" />
          </button>

          <button type="button" className={styles.answerBtn} onClick={() => handleAnswer("notSure")} aria-label="Not sure">
            <img src={BTN_NOT_SURE} alt="Not sure" />
          </button>

          <button type="button" className={styles.answerBtn} onClick={() => handleAnswer("no")} aria-label="No">
            <img src={BTN_NO} alt="No" />
          </button>
        </div>

        {rewardOpen && (
          <div className={styles.rewardOverlay} aria-hidden="true">
            <div className={styles.rewardCard}>
              <div className={styles.rewardText}>{rewardLabel}</div>
            </div>
          </div>
        )}

        {flyItems.map((it) => (
          <div
            key={it.id}
            className={styles.flyWrap}
            style={{
              left: it.fromX,
              top: it.fromY,
              "--toX": `${it.toX}px`,
              "--toY": `${it.toY}px`,
            }}
            aria-hidden="true"
          >
            <div className={styles.flyInner}>
              <img src={it.icon} alt="" className={styles.flyIcon} />
              <div className={styles.flyDelta}>{it.delta}</div>
            </div>
          </div>
        ))}

        {whyOpen && (
          <div className={styles.popupBackdrop} onMouseDown={closeWhy} role="presentation">
            <div
              className={styles.popupCard}
              onMouseDown={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <button type="button" className={styles.popupClose} onClick={closeWhy} aria-label="Close">
                ×
              </button>
              <div className={styles.popupText}>{whyText}</div>
            </div>
          </div>
        )}

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
