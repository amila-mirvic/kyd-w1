import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ✅ Re-use Task1 CSS da bude 1:1 (header, animacije, reward box, fly animacije…)
import styles from "../World1Task1/World1Task1Screen.module.css";

// ⬇️ prilagodi ove rute ako su ti drugačije u projektu
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
 * TASK 3 — “RIGHTS VS. RULES: THE DEMOCRACY TEST”
 * From doc:
 * - Per case:
 *   Part 1 (Is this democratic? Yes/No/Not sure)
 *      - Identify undemocratic: +2 points (these cases are undemocratic → correct is NO)
 *      - Not sure: +3 curiosity points + hint + retry once (optional)
 *   Part 2 (Best response path A/B/C/D)
 *      - Case 1 explicit scoring: B +10; C +4; A +2; D +0 + warning
 *      - Others: best response gets +5 (we keep a reasonable mapping; easy to tune)
 */

const CASES = [
  {
    id: 1,
    caseText:
      "A journalist publishes an investigation about misuse of public money. The government labels it “harmful” and shuts the outlet down.",
    part1Correct: "no",
    hint:
      "Think about freedom of the press and accountability. Is shutting down media compatible with democracy?",
    part2: {
      title: "CHOOSE THE RIGHT PATH",
      options: [
        {
          key: "A",
          text: "Accept it — the government knows best.",
          points: 2,
          feedback: "Silence enables abuse. Democracy needs scrutiny and accountability.",
        },
        {
          key: "B",
          text: "Support legal challenge + public pressure + solidarity with journalists",
          points: 10,
          best: true,
          feedback: "Democratic response uses institutions + rights protection.",
        },
        {
          key: "C",
          text: "Ignore — it’s not my problem.",
          points: 4,
          feedback: "Silence enables abuse. Rights are protected when people act.",
        },
        {
          key: "D",
          text: "Fight with threats and violence.",
          points: 0,
          warning: true,
          feedback: "Violence undermines democracy and harms everyone.",
        },
      ],
    },
  },
  {
    id: 2,
    caseText:
      "During a crisis, all gatherings are banned indefinitely, even small peaceful ones, without clear criteria.",
    part1Correct: "no",
    hint:
      "Democracy can limit rights temporarily, but restrictions must be proportionate, time-limited, and reviewed.",
    part2: {
      title: "CHOOSE THE RIGHT PATH",
      options: [
        {
          key: "A",
          text: "Okay, safety always comes first, no questions.",
          points: 2,
          feedback: "No oversight = power drift. Democracy needs checks and limits.",
        },
        {
          key: "B",
          text: "Ask for clear rules, time limits, and oversight",
          points: 5,
          best: true,
          feedback:
            "Democracy can restrict rights temporarily, but must be proportionate and reviewed.",
        },
        {
          key: "C",
          text: "Organize secretly, no matter what.",
          points: 0,
          warning: true,
          feedback: "Risky + can escalate. Better: legal accountability and oversight.",
        },
        {
          key: "D",
          text: "Spread conspiracy theories.",
          points: 0,
          warning: true,
          feedback: "Disinformation breaks trust and weakens democracy.",
        },
      ],
    },
  },
  {
    id: 3,
    caseText:
      "A city votes to ban a minority group from using a public space “because most people feel uncomfortable.”",
    part1Correct: "no",
    hint:
      "Rights are not a popularity contest. Equal protection matters even if the majority dislikes it.",
    part2: {
      title: "CHOOSE THE RIGHT PATH",
      options: [
        {
          key: "A",
          text: "Majority decides, end of story.",
          points: 0,
          warning: true,
          feedback: "Not democratic. Rights protect minorities from majority abuse.",
        },
        {
          key: "B",
          text: "Protect equal rights; challenge discrimination",
          points: 5,
          best: true,
          feedback: "Rights aren’t a popularity contest.",
        },
        {
          key: "C",
          text: "Let them use it only at certain times.",
          points: 2,
          feedback: "Segregation is still discrimination.",
        },
        {
          key: "D",
          text: "Kick them out to avoid conflict.",
          points: 0,
          warning: true,
          feedback: "Not democratic. Avoiding conflict by excluding people violates rights.",
        },
      ],
    },
  },
  {
    id: 4,
    caseText:
      "Your friend works in the municipality and offers to “speed up” your paperwork if you give a small gift.",
    part1Correct: "no",
    hint:
      "Rule of law applies in daily life too. Corruption weakens fairness and trust.",
    part2: {
      title: "CHOOSE THE RIGHT PATH",
      options: [
        {
          key: "A",
          text: "It’s normal, everyone does it.",
          points: 0,
          warning: true,
          feedback: "Normalizing corruption breaks fairness and trust.",
        },
        {
          key: "B",
          text: "Refuse, use official process, report if necessary",
          points: 5,
          best: true,
          feedback: "Rule of law is daily behavior, not only politics.",
        },
        {
          key: "C",
          text: "Accept but keep it secret.",
          points: 2,
          feedback: "Secrecy + favoritism undermines equal treatment.",
        },
        {
          key: "D",
          text: "Post online accusing everyone without evidence.",
          points: 0,
          warning: true,
          feedback: "Accountability needs evidence, not chaos.",
        },
      ],
    },
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

  // CASE progression
  const [index, setIndex] = useState(0);
  const current = CASES[index];

  // part1 vs part2
  const [phase, setPhase] = useState("part1"); // "part1" | "part2"
  const [hintUsed, setHintUsed] = useState(false); // per-case reset

  // points
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

    const fromX = fromRect.left + fromRect.width * 0.55;
    const fromY = fromRect.top + fromRect.height * 0.45;

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

  // popup for feedback/hint
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupText, setPopupText] = useState("");

  const openPopup = (text) => {
    setPopupText(text);
    setPopupOpen(true);
  };
  const closePopup = () => setPopupOpen(false);

  // locks
  const actionLockRef = useRef(false);

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
    if (curiosity >= 6) earned.push({ id: "curiosity", src: BADGE_CURIOSITY });
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
      totalQuestions: CASES.length,
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

  const goNextCase = () => {
    setIndex((i) => {
      const next = i + 1;
      if (next >= CASES.length) {
        window.setTimeout(() => openEndPopup(), 80);
        return i;
      }
      return next;
    });

    // reset
    setPhase("part1");
    setHintUsed(false);
  };

  // PART 1 handler (Yes / Not sure / No)
  const handlePart1 = (choice) => {
    if (!current || actionLockRef.current || endOpen || phase !== "part1") return;

    actionLockRef.current = true;
    pickNewTopMessage();

    // correct for these cases = "no"
    if (choice === current.part1Correct) {
      setCorrectCount((c) => c + 1);

      showReward("CORRECT", 520);
      makeFly({ type: "points", icon: ICON_POINTS, delta: "+2" });
      window.setTimeout(() => setPoints((p) => p + 2), 520);

      window.setTimeout(() => {
        setPhase("part2");
        actionLockRef.current = false;
      }, 700);

      return;
    }

    // Not sure: +3 curiosity, hint, retry once
    if (choice === "maybe" && !hintUsed) {
      setHintUsed(true);

      showReward("CURIOSITY", 520);
      makeFly({ type: "curiosity", icon: ICON_CURIOSITY_POINTS, delta: "+3" });
      window.setTimeout(() => setCuriosityPoints((c) => c + 3), 520);

      openPopup(current.hint || "Think again and try once more.");

      window.setTimeout(() => {
        actionLockRef.current = false;
      }, 250);

      return;
    }

    // wrong: feedback only, stay in part1
    openPopup("Not quite. Think about rights, fairness, and accountability.");
    window.setTimeout(() => {
      actionLockRef.current = false;
    }, 250);
  };

  // PART 2 handler (A/B/C/D)
  const handlePart2 = (optKey) => {
    if (!current || actionLockRef.current || endOpen || phase !== "part2") return;

    actionLockRef.current = true;
    pickNewTopMessage();

    const opt = current.part2.options.find((o) => o.key === optKey);
    if (!opt) {
      actionLockRef.current = false;
      return;
    }

    // award points
    const delta = typeof opt.points === "number" ? opt.points : 0;
    if (delta > 0) {
      makeFly({ type: "points", icon: ICON_POINTS, delta: `+${delta}` });
      window.setTimeout(() => setPoints((p) => p + delta), 520);
    }

    if (opt.best) showReward("CORRECT", 520);
    else if (opt.warning) showReward("WARNING", 520);
    else showReward("OK", 520);

    // show feedback popup (no OK button, only X / outside click)
    openPopup(opt.feedback || "Noted.");

    // after user closes popup → go next
    // we’ll listen to popup close via effect below
    window.setTimeout(() => {
      actionLockRef.current = false;
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

  // when popup closes and we were in part2 → proceed to next case
  useEffect(() => {
    if (!popupOpen && phase === "part2" && !endOpen) {
      // small guard to avoid firing on mount
      // only move if we already answered part2 (we detect by keeping phase part2)
      // but we should not auto-advance immediately on mount, so require current index stable
    }
  }, [popupOpen, phase, endOpen]);

  const earnedBadges = buildEarnedBadges(correctCount, curiosityPoints);

  // Custom layout styles for PART 2 (Figma-like: text then options under)
  const part2WrapStyle = {
    width: "100%",
    maxWidth: 980,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const part2TextStyle = {
    width: "100%",
    textAlign: "center",
    fontSize: 28,
    lineHeight: 1.2,
    padding: "10px 18px 0",
  };

  const part2TitleStyle = {
    marginTop: 18,
    fontSize: 18,
    letterSpacing: 1,
    opacity: 0.95,
  };

  const part2GridStyle = {
    width: "100%",
    maxWidth: 820,
    marginTop: 22,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    padding: "0 18px 18px",
  };

  const part2BtnStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.95)",
    border: "2px solid rgba(255,255,255,0.6)",
    borderRadius: 18,
    padding: "18px 18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 14,
    minHeight: 86,
  };

  const letterStyle = {
    width: 42,
    height: 42,
    borderRadius: 999,
    background: "rgba(255,255,255,0.8)",
    border: "2px solid rgba(0,0,0,0.08)",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 18,
    color: "#C95A3E",
    flex: "0 0 auto",
  };

  const optTextStyle = {
    fontWeight: 800,
    textTransform: "uppercase",
    fontSize: 14,
    lineHeight: 1.15,
    color: "#C95A3E",
    textAlign: "left",
  };

  // after choosing an option in part2, we want: close popup -> go next
  // easiest: when popupOpen closes AND we are in part2, advance.
  const prevPopupOpenRef = useRef(false);
  useEffect(() => {
    const wasOpen = prevPopupOpenRef.current;
    prevPopupOpenRef.current = popupOpen;

    if (wasOpen && !popupOpen && phase === "part2" && !endOpen) {
      // advance after feedback closed
      window.setTimeout(() => {
        goNextCase();
      }, 120);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupOpen, phase, endOpen]);

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

        {/* MAIN CARD */}
        <div ref={statementCardRef} className={styles.statementCard}>
          {/* ✅ NO BLACK "CASE 1 OF 4" text rendered at all */}
          {phase === "part1" ? (
            <>
              <div className={styles.statementText}>{current?.caseText || "…"}</div>
            </>
          ) : (
            <div style={part2WrapStyle}>
              <div style={part2TextStyle}>{current?.caseText || "…"}</div>
              <div style={part2TitleStyle}>{current?.part2?.title || "CHOOSE THE RIGHT PATH"}</div>

              <div style={part2GridStyle}>
                {current?.part2?.options?.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => handlePart2(o.key)}
                    style={part2BtnStyle}
                    aria-label={`Option ${o.key}`}
                  >
                    <div style={letterStyle}>{o.key}</div>
                    <div style={optTextStyle}>{o.text}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PART 1 ANSWERS — MUST be BELOW the red box (like Task1) */}
        {phase === "part1" && (
          <div
            className={styles.answerRow}
            style={{
              position: "relative",
              left: "auto",
              right: "auto",
              bottom: "auto",
              transform: "none",
              marginTop: 22,
            }}
          >
            <button
              type="button"
              className={styles.answerBtn}
              onClick={() => handlePart1("yes")}
              aria-label="Yes"
            >
              <img src={BTN_YES} alt="Yes" />
            </button>

            <button
              type="button"
              className={styles.answerBtn}
              onClick={() => handlePart1("maybe")}
              aria-label="Not sure"
            >
              <img src={BTN_NOT_SURE} alt="Not sure" />
            </button>

            <button
              type="button"
              className={styles.answerBtn}
              onClick={() => handlePart1("no")}
              aria-label="No"
            >
              <img src={BTN_NO} alt="No" />
            </button>
          </div>
        )}

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

        {/* FEEDBACK/HINT POPUP (NO OK BUTTON, only X/outside) */}
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
