import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./World1Task2Screen.module.css";

/* ----------- CARDS (Phase 1) ----------- */
const CARDS = [
  { id: 1, text: "FIXING STREETLIGHTS AND\nLOCAL ROADS", correct: "LOCAL" },
  { id: 2, text: "SCHOOL CURRICULUM RULES", correct: "MIXED" },
  { id: 3, text: "FUNDING A LOCAL YOUTH CENTER", correct: "LOCAL" },
  { id: 4, text: "MINIMUM WAGE LAW", correct: "NATIONAL" },
  { id: 5, text: "TRADE RULES BETWEEN COUNTRIES", correct: "EUROPEAN" },
  { id: 6, text: "MUNICIPAL PUBLIC TRANSPORT ROUTES", correct: "LOCAL" },
  { id: 7, text: "RULES FOR NATIONAL ELECTIONS", correct: "NATIONAL" },
  { id: 8, text: "ENVIRONMENTAL PRODUCT STANDARDS\nACROSS COUNTRIES", correct: "EUROPEAN" },
  { id: 9, text: "POLICE OPERATIONAL FUNDING\nIN A CITY", correct: "MIXED" },
  { id: 10, text: "TAX POLICY", correct: "NATIONAL" },
  { id: 11, text: "REGIONAL DEVELOPMENT FUNDS", correct: "EUROPEAN" },
  { id: 12, text: "LOCAL BUILDING PERMITS", correct: "LOCAL" },
];

/* ----------- SCENARIOS (Phase 3) ----------- */
const SCENARIOS = [
  {
    id: 1,
    title: "SCENARIO 1: YOUTH CENTER\nBUDGET CUT - CHOOSE THE\nMOST EFFECTIVE FIRST ACTION",
    options: [
      { key: "A", label: "EMAIL MEMBERS OF EUROPEAN PARLIAMENT", points: 0, isBest: false },
      { key: "B", label: "ATTEND CITY COUNCIL MEETING, START\nPETITION, CONTACT LOCAL MEDIA", points: 2, isBest: true },
      { key: "C", label: "POST ANGRY MEMES AND WAIT", points: 0, isBest: false },
    ],
  },
  {
    id: 2,
    title: "SCENARIO 2: NATIONAL EDUCATION\nREFORM - WHAT FIRST?",
    options: [
      { key: "A", label: "ORGANIZE NATIONAL CAMPAIGN, CONTACT\nMPS, JOIN PUBLIC CONSULTATIONS", points: 2, isBest: true },
      { key: "B", label: "COMPLAIN TO THE MAYOR", points: 0, isBest: false },
      { key: "C", label: "ASK THE EU TO CANCEL IT", points: 0, isBest: false },
    ],
  },
];

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function World1Task2Screen() {
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

  const nameUpper = (player?.name || "PLAYER").toString().toUpperCase();

  // ✅ backgrounds (public/world1/task2/)
  const bgIntro = `${process.env.PUBLIC_URL}/world1/task2/bg.png`;
  const bgMatch = `${process.env.PUBLIC_URL}/world1/task2/bg_1.png`;
  const bgRoutes = `${process.env.PUBLIC_URL}/world1/task2/bg_3.png`;

  // ✅ UI icons (public/world1/task2/)
  const pointsIcon = `${process.env.PUBLIC_URL}/world1/task2/points.png`;
  const curiosityIcon = `${process.env.PUBLIC_URL}/world1/task2/curiositypoints.png`;
  const whyIcon = `${process.env.PUBLIC_URL}/world1/task2/why.png`;

  // ✅ phase: intro -> match -> routes
  const [phase, setPhase] = useState("intro");

  // ✅ TOP MESSAGE (same style as Task1)
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

  // ✅ SCORE
  const [points, setPoints] = useState(0);
  const [curiosityPoints, setCuriosityPoints] = useState(0);

  // ✅ Fly-to-UI animation (COPIED pattern from Task1)
  const pointsTargetRef = useRef(null);
  const curiosityTargetRef = useRef(null);
  const cardRef = useRef(null);

  const [flyItems, setFlyItems] = useState([]); // {id,type,icon,delta,fromX,fromY,toX,toY}
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

    const fromX = fromRect.left + fromRect.width * 0.7;
    const fromY = fromRect.top + fromRect.height * 0.25;

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

  // ✅ CORRECT flash (center, like Task1)
  const [correctFlash, setCorrectFlash] = useState(false);
  const flashTimerRef = useRef(null);

  const showCorrectFlash = () => {
    setCorrectFlash(true);
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => setCorrectFlash(false), 520);
  };

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    };
  }, []);

  // ✅ HELP popup (same as Task1 popup style)
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupText, setPopupText] = useState("");

  const openHelp = () => {
    setPopupText(
      "MATCH EACH DECISION CARD TO THE LEVEL WHERE IT IS MAINLY DECIDED.\n\nSOME DECISIONS ARE SHARED — THOSE HAVE A SPECIAL OPTION.\n\nDEMOCRATIC SKILL = KNOWING:\n• WHO DECIDES\n• WHO INFLUENCES\n• WHERE PRESSURE WORKS BEST"
    );
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
    setPopupText("");
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && popupOpen) closePopup();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupOpen]);

  // ✅ background css var
  const bgStyle = useMemo(() => {
    const src = phase === "intro" ? bgIntro : phase === "match" ? bgMatch : bgRoutes;
    return { "--bg": `url(${src})` };
  }, [phase, bgIntro, bgMatch, bgRoutes]);

  /* ------------------ Match state ------------------ */
  const [cardIndexState, setCardIndexState] = useState(0);
  const currentCard = CARDS[cardIndexState];

  const handlePickLevel = (level) => {
    if (!currentCard) return;

    pickNewTopMessage();

    const isCorrect = level === currentCard.correct;

    if (isCorrect) {
      const deltaNum = currentCard.correct === "MIXED" ? 3 : 2;

      showCorrectFlash(); // ✅ only on correct

      makeFly({ type: "points", icon: pointsIcon, delta: `+${deltaNum}` });
      window.setTimeout(() => setPoints((p) => p + deltaNum), 520);
    }

    window.setTimeout(() => {
      setCardIndexState((i) => {
        const next = i + 1;
        if (next >= CARDS.length) {
          setPhase("routes");
          return i;
        }
        return next;
      });
    }, 520);
  };

  /* ------------------ Scenario state ------------------ */
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const scenario = SCENARIOS[scenarioIndex];
  const [scenarioLocked, setScenarioLocked] = useState(false);

  const finalizeTask = () => {
    const capped = clamp(points, 0, 30);

    try {
      localStorage.setItem(
        "yd_world1_task2",
        JSON.stringify({ points: capped, curiosityPoints, finishedAt: Date.now() })
      );
      localStorage.setItem("yd_world1_task2_done", JSON.stringify(true));
    } catch {
      // ignore
    }

    window.setTimeout(() => navigate("/world-1", { state: player }), 350);
  };

  const handlePickScenario = (opt) => {
    if (!scenario || scenarioLocked) return;
    setScenarioLocked(true);

    pickNewTopMessage();

    if (opt.points > 0) {
      showCorrectFlash(); // ✅ only on correct/best
      makeFly({ type: "points", icon: pointsIcon, delta: `+${opt.points}` });
      window.setTimeout(() => setPoints((p) => p + opt.points), 520);
    }

    window.setTimeout(() => {
      setScenarioIndex((s) => {
        const next = s + 1;
        if (next >= SCENARIOS.length) {
          finalizeTask();
          return s;
        }
        return next;
      });
      setScenarioLocked(false);
    }, 900);
  };

  return (
    <div className={styles.screen} style={bgStyle}>
      <div className={styles.overlay}>
        {/* ✅ TOP BAR */}
        {phase !== "intro" && (
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
        )}

        {/* ✅ FLY ITEMS */}
        {flyItems.map((it) => (
          <div
            key={it.id}
            className={styles.flyWrap}
            style={{
              left: `${it.fromX}px`,
              top: `${it.fromY}px`,
              "--toX": `${it.toX}px`,
              "--toY": `${it.toY}px`,
            }}
          >
            <div className={styles.flyInner}>
              <img src={it.icon} alt="" className={styles.flyIcon} />
              <div className={styles.flyDelta}>{it.delta}</div>
            </div>
          </div>
        ))}

        {/* ✅ CORRECT FLASH (center) */}
        {correctFlash && (
          <div className={styles.correctFlashWrap} aria-hidden="true">
            <div className={styles.correctFlashCard}>CORRECT</div>
          </div>
        )}

        {/* INTRO */}
        {phase === "intro" && (
          <div className={styles.introCard}>
            <div className={styles.introText}>
              MATCH EACH DECISION CARD TO THE LEVEL WHERE IT IS MAINLY DECIDED.
              <br />
              SOME DECISIONS ARE SHARED — THOSE HAVE A SPECIAL OPTION.
              <br />
              <br />
              LOCAL
              <br />
              NATIONAL
              <br />
              EUROPEAN
              <br />
              SHARED/MIXED
            </div>

            <button type="button" className={styles.introStartBtn} onClick={() => setPhase("match")}>
              START
            </button>
          </div>
        )}

        {/* MATCH */}
        {phase === "match" && currentCard && (
          <>
            <div ref={cardRef} className={styles.decisionCard}>
              <button type="button" className={styles.whyBtn} onClick={openHelp} aria-label="Help">
                <img src={whyIcon} alt="Help" />
              </button>

              <div className={styles.cardText}>{currentCard.text}</div>
            </div>

            <div className={styles.bottomBtns}>
              <button className={styles.levelBtn} type="button" onClick={() => handlePickLevel("LOCAL")}>
                LOCAL
              </button>
              <button className={styles.levelBtn} type="button" onClick={() => handlePickLevel("NATIONAL")}>
                NATIONAL
              </button>
              <button className={styles.levelBtn} type="button" onClick={() => handlePickLevel("EUROPEAN")}>
                EUROPEAN
              </button>
              <button className={styles.levelBtn} type="button" onClick={() => handlePickLevel("MIXED")}>
                MIXED
              </button>
            </div>
          </>
        )}

        {/* ROUTES */}
        {phase === "routes" && scenario && (
          <div ref={cardRef} className={styles.routesCard}>
            <button type="button" className={styles.whyBtn} onClick={openHelp} aria-label="Help">
              <img src={whyIcon} alt="Help" />
            </button>

            <div className={styles.routesTitle}>{scenario.title}</div>

            <div className={styles.routesBtns}>
              {scenario.options.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={styles.routeBtn}
                  onClick={() => handlePickScenario(opt)}
                  disabled={scenarioLocked}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ✅ HELP POPUP */}
        {popupOpen && (
          <div className={styles.popupBackdrop} role="dialog" aria-modal="true">
            <div className={styles.popupCard}>
              <button type="button" className={styles.popupClose} onClick={closePopup} aria-label="Close">
                X
              </button>
              <div className={styles.popupText}>{popupText}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
