import React, { useMemo, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./World1Task1Screen.module.css";

export default function World1Task1Screen() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ get player from router state OR localStorage fallback
  const player = useMemo(() => {
    const fromState = location.state && location.state.name ? location.state : null;
    if (fromState) return fromState;

    try {
      const raw = localStorage.getItem("yd_player");
      return raw ? JSON.parse(raw) : { name: "Player", character: "female" };
    } catch {
      return { name: "Player", character: "female" };
    }
  }, [location.state]);

  const nameUpper = (player.name || "PLAYER").toUpperCase();

  // ✅ background
  const bgUrl = `${process.env.PUBLIC_URL}/world1/task1bg.png`;
  const bgStyle = useMemo(() => ({ "--bg": `url(${bgUrl})` }), [bgUrl]);

  // ✅ UI icons (public/world1/task1/)
  const pointsIcon = `${process.env.PUBLIC_URL}/world1/task1/points.png`;
  const curiosityIcon = `${process.env.PUBLIC_URL}/world1/task1/curiositypoints.png`;
  const whyIcon = `${process.env.PUBLIC_URL}/world1/task1/why.png`;

  // ✅ answer buttons (public/world1/task1/)
  const correctBtn = `${process.env.PUBLIC_URL}/world1/task1/correct.png`;
  const middleBtn = `${process.env.PUBLIC_URL}/world1/task1/middle.png`;
  const wrongBtn = `${process.env.PUBLIC_URL}/world1/task1/wrong.png`;

  // ✅ end-screen badges (public/world1/task1/)
  const badgeBeginner = `${process.env.PUBLIC_URL}/world1/task1/beginner.png`;
  const badgeAdvanced = `${process.env.PUBLIC_URL}/world1/task1/advanced.png`;
  const badgeExpert = `${process.env.PUBLIC_URL}/world1/task1/expert.png`;
  const badgeCuriosity = `${process.env.PUBLIC_URL}/world1/task1/curiosity.png`;

  // ✅ routes (promijeni ako su ti drugačije)
  const MAIN_MENU_ROUTE = "/world-1";
  const TASK2_ROUTE = "/world-1/task-2"; // npr. "/world-1/task-2-intro"

  /* ------------------------------------ */
  /* GAME DATA (TASK 1: 10 statements) */
  const statements = useMemo(
    () => [
      {
        id: 1,
        text: "“People can choose leaders in free and fair elections.”",
        correct: "correct",
        why: "Elections matter — but democracy doesn’t end on election day.",
        wrongFeedback: "Elections matter — but democracy doesn’t end on election day.",
      },
      {
        id: 2,
        text: "“If the majority wants something, it should always happen.”",
        correct: "wrong",
        why: "Democracy is majority rule AND protection of rights. Otherwise minorities can be harmed.",
        wrongFeedback:
          "Democracy is majority rule AND protection of rights. Otherwise minorities can be harmed.",
      },
      {
        id: 3,
        text: "“Independent courts can limit government power.”",
        correct: "correct",
        why: "Rule of law protects democracy from becoming ‘whoever wins controls everything.’",
        wrongFeedback:
          "Rule of law protects democracy from becoming ‘whoever wins controls everything.’",
      },
      {
        id: 4,
        text: "“Opposition and criticism are allowed without punishment.”",
        correct: "correct",
        why: "Democracy needs disagreement — not fear.",
        wrongFeedback: "Democracy needs disagreement — not fear.",
      },
      {
        id: 5,
        text: "“Everyone must agree to keep society stable.”",
        correct: "wrong",
        why: "Forced agreement is not stability — it’s silence.",
        wrongFeedback: "Forced agreement is not stability — it’s silence.",
      },
      {
        id: 6,
        text: "“Media can investigate those in power.”",
        correct: "correct",
        why: "Accountability requires information that isn’t controlled by leaders.",
        wrongFeedback: "Accountability requires information that isn’t controlled by leaders.",
      },
      {
        id: 7,
        text: "“Democracy means the government gives you everything you want.”",
        correct: "wrong",
        why: "Democracy isn’t a wish machine. It’s a system for fair decision-making.",
        wrongFeedback: "Democracy isn’t a wish machine. It’s a system for fair decision-making.",
      },
      {
        id: 8,
        text: "“Citizens can organize, protest, petition, and join associations.”",
        correct: "correct",
        why: "Participation is not a bonus feature — it’s a democratic engine.",
        wrongFeedback: "Participation is not a bonus feature — it’s a democratic engine.",
      },
      {
        id: 9,
        text: "“Corruption exists in democracies too.”",
        correct: "middle",
        why: "Democracy reduces corruption risks when institutions work — but it can still happen.",
        wrongFeedback:
          "Democracy reduces corruption risks when institutions work — but it can still happen.",
      },
      {
        id: 10,
        text: "“Democracy is only about national politics.”",
        correct: "wrong",
        why: "Local democracy often shapes daily life more than national debates.",
        wrongFeedback: "Local democracy often shapes daily life more than national debates.",
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const current = statements[index];

  /* ------------------------------------ */
  /* SCORE STATE */
  const [points, setPoints] = useState(0);
  const [curiosityPoints, setCuriosityPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // ✅ WHY counter must NOT create side-effects inside setState (StrictMode double-call)
  const whyUsesRef = useRef(0); // 0..2
  const [whyUses, setWhyUses] = useState(0); // not shown, but useful

  /* ------------------------------------ */
  /* TOP MESSAGE ROTATION */
  const feedbackMessages = useMemo(
    () => [
      "{NAME} KEEP GOING",
      "{NAME} NICE CHOICE",
      "{NAME} STAY SHARP",
      "{NAME} TRUST YOUR INSTINCT",
      "{NAME} THINK IT THROUGH",
      "{NAME} YOU’VE GOT THIS",
      "{NAME} GOOD TRY",
      "{NAME} LET’S SEE…",
      "{NAME} SOLID MOVE",
    ],
    []
  );
  const [topMessage, setTopMessage] = useState(`${nameUpper} KEEP GOING`);

  useEffect(() => {
    setTopMessage(`${nameUpper} KEEP GOING`);
  }, [nameUpper]);

  const pickNewTopMessage = () => {
    const currentMsg = topMessage;
    let next = currentMsg;
    let guard = 0;
    while (next === currentMsg && guard < 10) {
      const raw = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
      next = raw.replace("{NAME}", nameUpper);
      guard += 1;
    }
    setTopMessage(next);
  };

  /* ------------------------------------ */
  /* QUESTION POPUP (wrong/why) */
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState(null); // "wrong" | "why"
  const [popupText, setPopupText] = useState("");

  const openPopup = (mode, text) => {
    setPopupMode(mode);
    setPopupText(text);
    setPopupOpen(true);
  };

  const closePopup = () => {
    const mode = popupMode;
    setPopupOpen(false);
    setPopupMode(null);
    setPopupText("");

    // ✅ wrong -> next question, why -> stay
    if (mode === "wrong") goNext();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && popupOpen) closePopup();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupOpen, popupMode]);

  /* ------------------------------------ */
  /* REWARD OVERLAY (CORRECT / BRAVO) */
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

  /* ------------------------------------ */
  /* FLY-TO-UI ANIMATION */
  const pointsTargetRef = useRef(null);
  const curiosityTargetRef = useRef(null);
  const statementCardRef = useRef(null);

  const [flyItems, setFlyItems] = useState([]); // {id,type,icon,delta,fromX,fromY,toX,toY}
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

    // start from middle-ish of statement card
    const fromX = fromRect.left + fromRect.width * 0.62;
    const fromY = fromRect.top + fromRect.height * 0.35;

    // end at center of target icon in UI
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

  /* ------------------------------------ */
  /* END POPUP (TASK DONE) */
  const [endOpen, setEndOpen] = useState(false);
  const endLockRef = useRef(false);

  const resolveSkillBadge = (correct) => {
    if (correct <= 4) return { id: "beginner", src: badgeBeginner };
    if (correct <= 8) return { id: "advanced", src: badgeAdvanced };
    return { id: "expert", src: badgeExpert };
  };

  const buildEarnedBadges = (correct, curiosity) => {
    const earned = [];
    const skill = resolveSkillBadge(correct);
    earned.push(skill);

    if (curiosity >= 5) {
      earned.push({ id: "curiosity", src: badgeCuriosity });
    }
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
    } catch {
      // ignore
    }
  };

  const saveResultsForAchievements = ({ taskPoints, taskCuriosity, badges }) => {
    // ✅ store per-task
    safeWrite("yd_world1_task1", {
      points: taskPoints,
      curiosityPoints: taskCuriosity,
      badges: badges.map((b) => ({ id: b.id, src: b.src })),
      correctCount,
      totalQuestions: statements.length,
      finishedAt: Date.now(),
    });

    // ✅ update aggregated yd_scores (so Achievements screen can read it easily)
    const prev = safeRead("yd_scores") || { totalPoints: 0, totalCuriosityPoints: 0, badges: [] };

    // NOTE: da ne duplira svaki put ako player refresh-a end screen:
    // držimo i marker da je već uračunato.
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

  /* ------------------------------------ */
  /* NAV BUTTONS (end popup) */
  const goMainMenu = () => navigate(MAIN_MENU_ROUTE, { state: player });
  const goTask2 = () => navigate(TASK2_ROUTE, { state: player });

  /* ------------------------------------ */
  /* SAFETY LOCKS */
  const whyLockRef = useRef(false);
  const answerLockRef = useRef(false);

  /* ------------------------------------ */
  /* FLOW: goNext -> if end, open end popup */
  const goNext = () => {
    setIndex((i) => {
      const next = i + 1;
      if (next >= statements.length) {
        // ✅ finished
        window.setTimeout(() => openEndPopup(), 80);
        return i;
      }
      return next;
    });
  };

  /* ------------------------------------ */
  /* HANDLERS */
  const handleAnswer = (choice) => {
    if (!current || answerLockRef.current || endOpen) return;
    answerLockRef.current = true;

    pickNewTopMessage();

    if (choice === current.correct) {
      showReward("CORRECT", 520);

      // ✅ count correct answers
      setCorrectCount((c) => c + 1);

      makeFly({ type: "points", icon: pointsIcon, delta: "+2" });
      window.setTimeout(() => setPoints((p) => p + 2), 520);

      window.setTimeout(() => {
        goNext();
        answerLockRef.current = false;
      }, 700);

      return;
    }

    openPopup("wrong", current.wrongFeedback || "Not quite. Think again.");
    window.setTimeout(() => {
      answerLockRef.current = false;
    }, 250);
  };

  const handleWhy = () => {
    if (!current || whyLockRef.current || endOpen) return;
    whyLockRef.current = true;

    // ✅ increment using REF (no StrictMode double side-effect)
    const next = whyUsesRef.current + 1;

    if (next >= 3) {
      // ✅ BONUS ONLY: BRAVO + +5 curiosity (ONCE), then reset
      whyUsesRef.current = 0;
      setWhyUses(0);

      showReward("BRAVO", 520);
      makeFly({ type: "curiosity", icon: curiosityIcon, delta: "+5" });
      window.setTimeout(() => setCuriosityPoints((cp) => cp + 5), 520);

      // popup AFTER bravo
      window.setTimeout(() => {
        openPopup("why", current.why || "Here’s why this matters.");
        whyLockRef.current = false;
      }, 560);

      return;
    }

    // normal why (no bravo, no points)
    whyUsesRef.current = next;
    setWhyUses(next);

    window.setTimeout(() => {
      openPopup("why", current.why || "Here’s why this matters.");
      whyLockRef.current = false;
    }, 120);
  };

  // close end popup on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && endOpen) goMainMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endOpen]);

  const earnedBadges = useMemo(() => buildEarnedBadges(correctCount, curiosityPoints), [
    correctCount,
    curiosityPoints,
  ]);

  return (
    <div className={styles.screen} style={bgStyle}>
      <div className={styles.overlay}>
        {/* TOP BAR */}
        <div className={styles.topBar}>
          <div className={styles.topLeft}>{topMessage}</div>

          <div className={styles.topRight}>
            <div className={[styles.stat, pulsePoints ? styles.statPulse : ""].join(" ")}>
              <img ref={pointsTargetRef} src={pointsIcon} alt="Points" className={styles.statIcon} />
              <span className={styles.statNum}>{points}</span>
            </div>

            <div className={[styles.stat, pulseCuriosity ? styles.statPulse : ""].join(" ")}>
              <img
                ref={curiosityTargetRef}
                src={curiosityIcon}
                alt="Curiosity points"
                className={styles.statIcon}
              />
              <span className={styles.statNum}>{curiosityPoints}</span>
            </div>
          </div>
        </div>

        {/* STATEMENT CARD */}
        <div ref={statementCardRef} className={styles.statementCard}>
          <button type="button" className={styles.whyBtn} onClick={handleWhy} aria-label="Why">
            <img src={whyIcon} alt="Why" />
          </button>

          <div className={styles.statementText}>{current?.text || "…"}</div>
        </div>

        {/* ANSWER BUTTONS */}
        <div className={styles.answerRow}>
          <button
            type="button"
            className={styles.answerBtn}
            onClick={() => handleAnswer("correct")}
            aria-label="Correct"
          >
            <img src={correctBtn} alt="Correct" />
          </button>

          <button
            type="button"
            className={styles.answerBtn}
            onClick={() => handleAnswer("middle")}
            aria-label="Warning"
          >
            <img src={middleBtn} alt="Warning" />
          </button>

          <button
            type="button"
            className={styles.answerBtn}
            onClick={() => handleAnswer("wrong")}
            aria-label="Wrong"
          >
            <img src={wrongBtn} alt="Wrong" />
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

        {/* POPUP (wrong/why) */}
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

        {/* END POPUP (task done) */}
        {endOpen && (
          <div className={styles.endBackdrop} role="presentation">
            <div className={styles.endCard} role="dialog" aria-modal="true">
              <button type="button" className={styles.endClose} onClick={goMainMenu} aria-label="Close">
                ×
              </button>

              <div className={styles.endTitle}>
                BRAVO {nameUpper} YOU NAILED IT!
              </div>

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
                <button type="button" className={styles.endActionBtn} onClick={goTask2}>
                  COLLECT BADGES AND GO TO TASK 2
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
