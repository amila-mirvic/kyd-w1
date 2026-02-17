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

const BTN_CORRECT = asset("/world1/task3/correct.png"); // YES
const BTN_MIDDLE = asset("/world1/task3/middle.png"); // NOT SURE
const BTN_WRONG = asset("/world1/task3/wrong.png"); // NO

const BADGE_BEGINNER = asset("/world1/task3/beginner.png");
const BADGE_ADVANCED = asset("/world1/task3/advanced.png");
const BADGE_EXPERT = asset("/world1/task3/expert.png");
const BADGE_CURIOSITY = asset("/world1/task3/curiosity.png");

// ✅ TASK 3 (prema dokumentu)
const CASES = [
  {
    id: 1,
    statement:
      'A journalist publishes an investigation about misuse of public money. The government labels it “harmful” and shuts the outlet down.',
    // PART 1: Is this democratic? -> (No)
    part1Correct: "wrong",
    part1WrongFeedback:
      "Shutting down independent media is a major rights and accountability problem. In democracy, criticism and investigation must be protected.",
    part1Hint:
      "Think: free press is a safeguard. When government shuts down media, who checks power?",
    // PART 2: Best response path
    options: [
      { key: "A", text: "Accept it — the government knows best." },
      {
        key: "B",
        text: "Support legal challenge + public pressure + solidarity with journalists",
      },
      { key: "C", text: "Ignore — it’s not my problem." },
      { key: "D", text: "Fight with threats and violence." },
    ],
    part2Correct: "B",
    part2Feedback: {
      B: "Democratic response uses institutions + rights protection.",
      D: "Violence undermines democracy.",
      A: "Silence/obedience enables abuse.",
      C: "Silence enables abuse.",
    },
  },
  {
    id: 2,
    statement:
      "During a crisis, all gatherings are banned indefinitely, even small peaceful ones, without clear criteria.",
    part1Correct: "wrong",
    part1WrongFeedback:
      "Broad bans without clear limits or oversight can be abusive. Restrictions must be lawful, necessary, proportionate, and reviewed.",
    part1Hint:
      "Think: restrictions can exist, but must be time-limited, clear, and supervised.",
    options: [
      { key: "A", text: "Okay, safety always comes first, no questions." },
      { key: "B", text: "Ask for clear rules, time limits, and oversight" },
      { key: "C", text: "Organize secretly, no matter what." },
      { key: "D", text: "Spread conspiracy theories." },
    ],
    part2Correct: "B",
    part2Feedback: {
      B: "Democracy can restrict rights temporarily, but must be proportionate and reviewed.",
      C: "Risky — can escalate conflict and harm legitimacy.",
      D: "Disinformation breaks trust.",
      A: "No oversight = power drift.",
    },
  },
  {
    id: 3,
    statement:
      'A city votes to ban a minority group from using a public space “because most people feel uncomfortable.”',
    part1Correct: "wrong",
    part1WrongFeedback:
      "Rights aren’t a popularity contest. Majority rule has limits when it harms equal rights.",
    part1Hint:
      "Think: democracy protects minorities too — equal access matters.",
    options: [
      { key: "A", text: "Majority decides, end of story." },
      { key: "B", text: "Protect equal rights; challenge discrimination" },
      { key: "C", text: "Let them use it only at certain times." },
      { key: "D", text: "Kick them out to avoid conflict." },
    ],
    part2Correct: "B",
    part2Feedback: {
      B: "Rights aren’t a popularity contest.",
      C: "Segregation is still discrimination.",
      A: "Not democratic.",
      D: "Not democratic.",
    },
  },
  {
    id: 4,
    statement:
      'Your friend works in the municipality and offers to “speed up” your paperwork if you give a small gift.',
    part1Correct: "wrong",
    part1WrongFeedback:
      "This breaks fairness and rule of law. Corruption (even ‘small’) undermines equal treatment.",
    part1Hint:
      "Think: if rules can be bypassed with gifts, who gets treated fairly?",
    options: [
      { key: "A", text: "It’s normal, everyone does it." },
      { key: "B", text: "Refuse, use official process, report if necessary" },
      { key: "C", text: "Accept but keep it secret." },
      { key: "D", text: "Post online accusing everyone without evidence." },
    ],
    part2Correct: "B",
    part2Feedback: {
      B: "Rule of law is daily behavior, not only politics.",
      D: "Accountability needs evidence, not chaos.",
      A: "Normalizing corruption makes institutions weaker.",
      C: "Secret deals undermine fairness.",
    },
  },
];

export default function World1Task3Screen() {
  const navigate = useNavigate();
  const location = useLocation();

  const player = location.state || {};
  const nameUpper = (player?.name || player?.playerName || "PLAYER")
    .toString()
    .toUpperCase();

  const bgStyle = useMemo(
    () => ({
      backgroundImage: `url(${BG})`,
    }),
    []
  );

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

  const [index, setIndex] = useState(0);
  const current = CASES[index];

  // ✅ phase: "part1" -> "part2"
  const [phase, setPhase] = useState("part1");

  const [points, setPoints] = useState(0);
  const [curiosityPoints, setCuriosityPoints] = useState(0);
  const [correctCountPart1, setCorrectCountPart1] = useState(0);
  const [correctCountPart2, setCorrectCountPart2] = useState(0);

  // ✅ reward overlay
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

  // ✅ fly-to-ui
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

  // popup
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupText, setPopupText] = useState("");

  const openPopup = (text) => {
    setPopupText(text);
    setPopupOpen(true);
  };
  const closePopup = () => setPopupOpen(false);

  const answerLockRef = useRef(false);

  // Not sure once per case
  const notSureUsedRef = useRef({});
  const markNotSureUsed = (caseId) => {
    notSureUsedRef.current = { ...notSureUsedRef.current, [caseId]: true };
  };
  const isNotSureUsed = (caseId) => !!notSureUsedRef.current?.[caseId];

  // end popup
  const [endOpen, setEndOpen] = useState(false);
  const endLockRef = useRef(false);

  const resolveSkillBadge = (correctTotal) => {
    if (correctTotal <= 3) return { id: "beginner", src: BADGE_BEGINNER };
    if (correctTotal <= 6) return { id: "advanced", src: BADGE_ADVANCED };
    return { id: "expert", src: BADGE_EXPERT };
  };

  const buildEarnedBadges = (correctTotal, curiosity) => {
    const earned = [];
    earned.push(resolveSkillBadge(correctTotal));
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
      correctPart1: correctCountPart1,
      correctPart2: correctCountPart2,
      totalCases: CASES.length,
      finishedAt: Date.now(),
    });

    const prev =
      safeRead("yd_scores") || { totalPoints: 0, totalCuriosityPoints: 0, badges: [] };

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

    const correctTotal = correctCountPart1 + correctCountPart2;
    const earned = buildEarnedBadges(correctTotal, curiosityPoints);

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
    setPhase("part1");
  };

  // PART 1 (YES/NO/MAYBE)
  const handlePart1 = (choice) => {
    if (!current || answerLockRef.current || endOpen) return;
    if (phase !== "part1") return;

    answerLockRef.current = true;
    pickNewTopMessage();

    // NOT SURE -> +3 curiosity, show hint
    if (choice === "middle") {
      if (isNotSureUsed(current.id)) {
        openPopup("You already used NOT SURE. Make a choice now 🙂");
        window.setTimeout(() => {
          answerLockRef.current = false;
        }, 250);
        return;
      }

      markNotSureUsed(current.id);

      makeFly({ type: "curiosity", icon: ICON_CURIOSITY_POINTS, delta: "+3" });
      window.setTimeout(() => setCuriosityPoints((c) => c + 3), 520);

      openPopup(current.part1Hint || "Hint: think about rights + limits on power.");
      window.setTimeout(() => {
        answerLockRef.current = false;
      }, 250);
      return;
    }

    if (choice === current.part1Correct) {
      showReward("CORRECT", 520);
      setCorrectCountPart1((c) => c + 1);

      makeFly({ type: "points", icon: ICON_POINTS, delta: "+2" });
      window.setTimeout(() => setPoints((p) => p + 2), 520);

      window.setTimeout(() => {
        setPhase("part2");
        answerLockRef.current = false;
      }, 650);

      return;
    }

    openPopup(current.part1WrongFeedback || "Not quite. Think again.");
    window.setTimeout(() => {
      answerLockRef.current = false;
    }, 250);
  };

  // PART 2 (A/B/C/D)
  const handlePart2 = (key) => {
    if (!current || answerLockRef.current || endOpen) return;
    if (phase !== "part2") return;

    answerLockRef.current = true;
    pickNewTopMessage();

    if (key === current.part2Correct) {
      showReward("CORRECT", 520);
      setCorrectCountPart2((c) => c + 1);

      makeFly({ type: "points", icon: ICON_POINTS, delta: "+5" });
      window.setTimeout(() => setPoints((p) => p + 5), 520);

      window.setTimeout(() => {
        goNextCase();
        answerLockRef.current = false;
      }, 720);

      return;
    }

    openPopup(
      current.part2Feedback?.[key] ||
        "Not quite. Choose the path that protects rights and institutions."
    );

    window.setTimeout(() => {
      answerLockRef.current = false;
    }, 250);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && popupOpen) closePopup();
      if (e.key === "Escape" && endOpen) goMainMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupOpen, endOpen]);

  const earnedBadges = useMemo(() => {
    const correctTotal = correctCountPart1 + correctCountPart2;
    return buildEarnedBadges(correctTotal, curiosityPoints);
  }, [correctCountPart1, correctCountPart2, curiosityPoints]);

  return (
    <div className={styles.screen} style={bgStyle}>
      {/* ✅ Local CSS (bez inline objekata) */}
      <style>{`
        .t3-part2Wrap{
          margin-top: 18px;
          width: min(840px, 100%);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          justify-content: center;
        }
        .t3-optionBtn{
          width: 100%;
          display: grid;
          grid-template-columns: 56px 1fr;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          background: rgba(255,255,255,0.92);
          box-shadow: 0 10px 26px rgba(0,0,0,0.18);
        }
        .t3-optionLetter{
          width: 46px;
          height: 46px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          font-weight: 900;
          background: rgba(255,255,255,0.85);
          border: 2px solid rgba(0,0,0,0.08);
          color: #C85A2A;
        }
        .t3-optionText{
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 12.5px;
          line-height: 1.25;
          color: #C85A2A;
          text-align: left;
        }
        @media (max-width: 760px){
          .t3-part2Wrap{
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className={styles.overlay}>
        {/* TOP BAR */}
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
          {/* ✅ NEMA “CASE 1 OF 4” / “CHOOSE THE RIGHT PATH” crnog teksta */}

          {/* statement */}
          <div className={styles.statementText} style={{ marginTop: 4, textAlign: "center" }}>
            {current?.statement || "…"}
          </div>

          {/* PART 1 */}
          {phase === "part1" && (
            <div style={{ marginTop: 14 }}>
              <div className={styles.answerRow} style={{ marginTop: 0 }}>
                <button
                  type="button"
                  className={styles.answerBtn}
                  onClick={() => handlePart1("correct")}
                  aria-label="Yes"
                >
                  <img src={BTN_CORRECT} alt="Yes" />
                </button>

                <button
                  type="button"
                  className={styles.answerBtn}
                  onClick={() => handlePart1("middle")}
                  aria-label="Not sure"
                >
                  <img src={BTN_MIDDLE} alt="Not sure" />
                </button>

                <button
                  type="button"
                  className={styles.answerBtn}
                  onClick={() => handlePart1("wrong")}
                  aria-label="No"
                >
                  <img src={BTN_WRONG} alt="No" />
                </button>
              </div>
            </div>
          )}

          {/* PART 2 (✅ ispod teksta) */}
          {phase === "part2" && (
            <div className="t3-part2Wrap" aria-label="Choose the right path">
              {current?.options?.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className="t3-optionBtn"
                  onClick={() => handlePart2(opt.key)}
                  aria-label={`Option ${opt.key}`}
                >
                  <div className="t3-optionLetter">{opt.key}</div>
                  <div className="t3-optionText">{opt.text}</div>
                </button>
              ))}
            </div>
          )}
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

        {/* POPUP */}
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

        {/* END POPUP */}
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
