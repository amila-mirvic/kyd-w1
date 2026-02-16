import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./World1Task3Screen.module.css";

/**
 * TASK 3:
 * - Phase A: YES / NOT SURE / NO (ikonice correct / not sure / wrong)
 * - Nakon tačnog odgovora: prikaži "CORRECT" overlay + animaciju poena (copy Task1 feel)
 * - "SHOW ME HOW TO ACT" popup samo ako je Phase A tačan
 * - Phase B: Choose the right path (A/B/C/D) -> opet correct overlay + points anim
 * - End popup identičan Task1 (sa task3 points + badges)
 */

export default function World1Task3Screen() {
  const location = useLocation();
  const navigate = useNavigate();

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

  const nameUpper = (player?.name || "PLAYER").toUpperCase();

  // ✅ assets (Task3)
  const bgA = `${process.env.PUBLIC_URL}/world1/task3/bg.png`;
  const bgB = `${process.env.PUBLIC_URL}/world1/task3/bg_2.png`;

  const iconPoints = `${process.env.PUBLIC_URL}/world1/task3/icon_points.png`;
  const iconCuriosity = `${process.env.PUBLIC_URL}/world1/task3/icon_curiosity_points.png`;

  const btnCorrect = `${process.env.PUBLIC_URL}/world1/task3/btn_correct.png`;
  const btnNotSure = `${process.env.PUBLIC_URL}/world1/task3/btn_maybe.png`;
  const btnWrong = `${process.env.PUBLIC_URL}/world1/task3/btn_wrong.png`;

  // ✅ scoring (local state, plus persist at the end)
  const [points, setPoints] = useState(0);
  const [curiosityPoints, setCuriosityPoints] = useState(0);
  const [badges, setBadges] = useState([]);

  // ✅ animations (copy Task1 feel)
  const [pointsFly, setPointsFly] = useState(null); // { id, value, x, y }
  const [correctFlash, setCorrectFlash] = useState(false);

  // ✅ flow
  const [caseIdx, setCaseIdx] = useState(0);
  const [phase, setPhase] = useState("A"); // A yes/no/maybe, then ACT popup, then B paths
  const [actOpen, setActOpen] = useState(false);

  const [endOpen, setEndOpen] = useState(false);

  // ✅ Task 3 content (edit text later if treba — ali struktura je gotova)
  const CASES = useMemo(
    () => [
      {
        id: "t3c1",
        a_text:
          "A journalist publishes an investigation about misuse of public money. The government labels it “harmful” and shuts the outlet down.",
        a_correct: "NO",
        act_title: "SHOW ME HOW TO ACT",
        act_body:
          "Support legal challenge + public pressure + solidarity with journalists. Restrictions must be lawful, necessary, and proportionate.",
        b_title: "CHOOSE THE RIGHT PATH",
        b_options: [
          { key: "A", label: "CAST LEGAL DOUBTS" },
          { key: "B", label: "POST ANGRY MEMES AND WAIT" },
          { key: "C", label: "SUPPORT LEGAL CHALLENGE + PUBLIC PRESSURE + SOLIDARITY WITH JOURNALISTS" },
          { key: "D", label: "POST ANGRY MEMES AND WAIT" },
        ],
        b_correct: "C",
      },
      {
        id: "t3c2",
        a_text:
          "The government passes a law allowing it to ban protests for “public order” without clear limits or oversight.",
        a_correct: "NO",
        act_title: "SHOW ME HOW TO ACT",
        act_body:
          "Demand clear limits, independent oversight, and proportionality. Challenge vague rules that can be abused.",
        b_title: "CHOOSE THE RIGHT PATH",
        b_options: [
          { key: "A", label: "ASK NICELY ON SOCIAL MEDIA" },
          { key: "B", label: "SUPPORT LEGAL CHALLENGE + MOBILIZE CIVIL SOCIETY" },
          { key: "C", label: "WAIT FOR THE NEXT ELECTION" },
          { key: "D", label: "DO NOTHING" },
        ],
        b_correct: "B",
      },
      {
        id: "t3c3",
        a_text:
          "A mayor bans a peaceful assembly because it criticizes the local government, even though organizers follow the rules.",
        a_correct: "NO",
        act_title: "SHOW ME HOW TO ACT",
        act_body:
          "Protect freedom of assembly. Challenge the ban via courts/ombudsman and document violations. Build public support.",
        b_title: "CHOOSE THE RIGHT PATH",
        b_options: [
          { key: "A", label: "CONTACT OMBUDSMAN + LEGAL AID + MEDIA" },
          { key: "B", label: "POST ANGRY MEMES AND WAIT" },
          { key: "C", label: "ASK THE MAYOR TO RECONSIDER (ONLY)" },
          { key: "D", label: "DO NOTHING" },
        ],
        b_correct: "A",
      },
      {
        id: "t3c4",
        a_text:
          "A new policy requires journalists to reveal sources to publish stories about public officials.",
        a_correct: "NO",
        act_title: "SHOW ME HOW TO ACT",
        act_body:
          "Source protection is essential. Support legal challenge and public pressure. Push for rights-respecting reforms.",
        b_title: "CHOOSE THE RIGHT PATH",
        b_options: [
          { key: "A", label: "SUPPORT LEGAL CHALLENGE + PRESS FREEDOM GROUPS" },
          { key: "B", label: "DO NOTHING" },
          { key: "C", label: "POST ANGRY MEMES AND WAIT" },
          { key: "D", label: "ASK JOURNALISTS TO COMPLY" },
        ],
        b_correct: "A",
      },
    ],
    []
  );

  const current = CASES[caseIdx];

  // ✅ award helpers
  const awardPoints = (value, origin = { x: 0, y: 0 }) => {
    setPoints((p) => p + value);

    const id = `${Date.now()}_${Math.random()}`;
    setPointsFly({ id, value, x: origin.x, y: origin.y });

    setTimeout(() => {
      setPointsFly((f) => (f?.id === id ? null : f));
    }, 900);
  };

  const awardCuriosity = (value) => {
    setCuriosityPoints((c) => c + value);
  };

  const flashCorrect = () => {
    setCorrectFlash(true);
    setTimeout(() => setCorrectFlash(false), 650);
  };

  // ✅ click handlers (Phase A)
  const onAnswerA = (choice, e) => {
    const isCorrect = choice === current.a_correct;

    if (isCorrect) {
      // award points like task1 feel
      const rect = e?.currentTarget?.getBoundingClientRect?.();
      awardPoints(2, rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: 0, y: 0 });
      flashCorrect();

      // open ACT popup (only on correct)
      setTimeout(() => setActOpen(true), 320);
    } else {
      // wrong -> show small shake (no bottom messages)
      // (optional) you can add a subtle vibration class here
    }
  };

  // ✅ ACT popup -> then go Phase B
  const closeActAndGoB = () => {
    // curiosity reward for "show me how to act"
    awardCuriosity(1);
    setActOpen(false);
    setPhase("B");
  };

  // ✅ Phase B (paths)
  const onPickPath = (key, e) => {
    const isCorrect = key === current.b_correct;

    if (isCorrect) {
      const rect = e?.currentTarget?.getBoundingClientRect?.();
      awardPoints(2, rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: 0, y: 0 });
      flashCorrect();

      setTimeout(() => {
        if (caseIdx < CASES.length - 1) {
          setCaseIdx((i) => i + 1);
          setPhase("A");
        } else {
          // end task
          finalizeTask();
        }
      }, 420);
    } else {
      // optional: small shake
    }
  };

  // ✅ end popup like Task1 (persist + aggregate)
  const safeParse = (key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const safeSet = (key, obj) => {
    try {
      localStorage.setItem(key, JSON.stringify(obj));
    } catch {}
  };

  const finalizeTask = () => {
    // badge example (adjust to your actual badge assets)
    const earnedBadges = [
      { id: "t3_advanced", src: "world1/task3/badge_advanced.png" }, // if exists
    ].filter(Boolean);

    setBadges(earnedBadges);

    const result = {
      points,
      curiosityPoints,
      badges: earnedBadges,
      completedAt: new Date().toISOString(),
    };

    safeSet("yd_world1_task3", result);

    // aggregate like Task1
    const scores = safeParse("yd_scores") || { totalPoints: 0, totalCuriosityPoints: 0, badges: [] };

    const alreadyCounted = localStorage.getItem("yd_world1_task3_counted") === "true";
    if (!alreadyCounted) {
      scores.totalPoints = (scores.totalPoints || 0) + points;
      scores.totalCuriosityPoints = (scores.totalCuriosityPoints || 0) + curiosityPoints;
      scores.badges = Array.isArray(scores.badges) ? [...scores.badges, ...earnedBadges] : [...earnedBadges];

      safeSet("yd_scores", scores);
      localStorage.setItem("yd_world1_task3_counted", "true");
    }

    setEndOpen(true);
  };

  const goMainMenu = () => navigate("/world-1", { state: player });
  const goTaskSelector = () => navigate("/world-1/tasks", { state: player });

  // ✅ UI
  return (
    <div className={styles.screen} style={{ backgroundImage: `url(${phase === "A" ? bgA : bgB})` }}>
      {/* TOP WHITE BAR (copy task1 style) */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>{nameUpper} KEEP GOING</div>

        <div className={styles.topRight}>
          <div className={styles.scoreItem}>
            <img src={iconPoints} alt="" className={styles.scoreIcon} />
            <span className={styles.scoreValue}>{points}</span>
          </div>

          <div className={styles.scoreItem}>
            <img src={iconCuriosity} alt="" className={styles.scoreIcon} />
            <span className={styles.scoreValue}>{curiosityPoints}</span>
          </div>
        </div>
      </div>

      {/* points fly +2 */}
      {pointsFly && (
        <div className={styles.pointsFly} key={pointsFly.id}>
          +{pointsFly.value}
        </div>
      )}

      {/* ✅ centered CORRECT overlay like task1 */}
      {correctFlash && (
        <div className={styles.correctOverlay}>
          <div className={styles.correctBox}>CORRECT</div>
        </div>
      )}

      {/* MAIN CARD */}
      <div className={styles.card}>
        <div className={styles.cardTop}>CASE {caseIdx + 1} OF {CASES.length}</div>
        <div className={styles.cardText}>{current.a_text}</div>

        {phase === "A" && (
          <div className={styles.choiceRow}>
            <button className={styles.choiceBtn} onClick={(e) => onAnswerA("YES", e)} aria-label="Yes">
              <img src={btnCorrect} alt="YES" />
            </button>

            <button className={styles.choiceBtn} onClick={(e) => onAnswerA("NOT_SURE", e)} aria-label="Not sure">
              <img src={btnNotSure} alt="NOT SURE" />
            </button>

            <button className={styles.choiceBtn} onClick={(e) => onAnswerA("NO", e)} aria-label="No">
              <img src={btnWrong} alt="NO" />
            </button>
          </div>
        )}

        {phase === "B" && (
          <div className={styles.pathsWrap}>
            <div className={styles.pathsTitle}>{current.b_title}</div>

            <div className={styles.pathsGrid}>
              {current.b_options.map((o) => (
                <button
                  key={o.key}
                  className={styles.pathBtn}
                  onClick={(e) => onPickPath(o.key, e)}
                >
                  <span className={styles.pathKey}>{o.key}</span>
                  <span className={styles.pathLabel}>{o.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ✅ ACT popup (only after correct in phase A) */}
      {actOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <button className={styles.modalClose} onClick={() => setActOpen(false)} aria-label="Close">
              ×
            </button>

            <div className={styles.modalTitle}>“NOT ALL DECISIONS LIVE IN ONE PLACE.”</div>
            <div className={styles.modalSub}>DEMOCRATIC SKILL = KNOWING:</div>
            <ul className={styles.modalList}>
              <li>WHO DECIDES</li>
              <li>WHO INFLUENCES</li>
              <li>WHERE PRESSURE WORKS BEST</li>
            </ul>

            <div className={styles.modalBody}>{current.act_body}</div>

            <button className={styles.modalCta} onClick={closeActAndGoB}>
              SHOW ME HOW TO ACT
            </button>
          </div>
        </div>
      )}

      {/* ✅ END POPUP like Task1 */}
      {endOpen && (
        <div className={styles.endBackdrop}>
          <div className={styles.endModal}>
            <button className={styles.endClose} onClick={() => setEndOpen(false)} aria-label="Close">
              ×
            </button>

            <div className={styles.endTitle}>BRAVO {nameUpper} YOU NAILED IT!</div>
            <div className={styles.endMeta}>POINTS: {points}</div>
            <div className={styles.endMeta}>CURIOSITY POINTS: {curiosityPoints}</div>

            {/* badge image (ako imaš) */}
            <div className={styles.endBadgeWrap}>
              {badges?.[0]?.src ? (
                <img
                  src={
                    badges[0].src.startsWith("/")
                      ? badges[0].src
                      : `${process.env.PUBLIC_URL}/${badges[0].src}`
                  }
                  alt=""
                  className={styles.endBadge}
                />
              ) : null}
            </div>

            <div className={styles.endBtns}>
              <button className={styles.endBtn} onClick={goMainMenu}>
                GO BACK TO MAIN MENU
              </button>
              <button className={styles.endBtn} onClick={goTaskSelector}>
                COLLECT BADGES AND GO TO TASKS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
